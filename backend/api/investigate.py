import logging
logger = logging.getLogger(__name__)

import email
from email import policy
import re
import json
import base64
import os
import pymupdf
import fitz  # PyMuPDF
import cv2
import numpy as np
import zxingcpp
import pytesseract
import io
import tempfile
import c2pa
from PIL import Image, ExifTags, ImageChops
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.concurrency import run_in_threadpool
from groq import Groq
from pydantic import BaseModel
from engines.url_engine import URLEngine
from ai.reasoning import AIEngine
from schemas.investigation import InvestigationResult

def extract_qr_from_image_bytes(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return []
        results = zxingcpp.read_barcodes(img)
        if not results:
            gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            results = zxingcpp.read_barcodes(gray_img)
        return [res.text for res in results if res.text] if results else []
    except Exception:
        return []

def extract_exif_data(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img.getexif()
        if not exif_data:
            return {}
        
        exif_dict = {}
        for tag_id, value in exif_data.items():
            tag = str(ExifTags.TAGS.get(tag_id, tag_id))
            
            # Filter EXIF to prevent context bloat
            if tag in ["MakerNote", "UserComment", "ICCProfile"]:
                continue
                
            if isinstance(value, bytes):
                try:
                    # Decode strictly, discard if it fails or contains many non-printables
                    value = value.decode('utf-8')
                    if sum(1 for c in value if ord(c) < 32 and c not in '\n\r\t') > len(value) * 0.1:
                        continue
                except Exception:
                    continue
            else:
                value = str(value)
                # Heuristic to filter out large binary/hex strings
                if len(value) > 200 and not any(c.isspace() for c in value[:50]):
                    continue
                    
            exif_dict[tag] = value
        return exif_dict
    except Exception as e:
        logger.error(f"EXIF extraction failed: {e}")
        return {}

def extract_c2pa_data(image_bytes, suffix=".jpg"):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(image_bytes)
            tmp_file_path = tmp_file.name
            
        try:
            reader = c2pa.Reader.from_file(tmp_file_path)
            c2pa_json_str = reader.json()
            if isinstance(c2pa_json_str, str):
                c2pa_data = json.loads(c2pa_json_str)
            else:
                c2pa_data = c2pa_json_str
                
            # Filter C2PA to prevent context bloat
            filtered_c2pa = {}
            if c2pa_data and "active_manifest" in c2pa_data:
                manifest_id = c2pa_data["active_manifest"]
                manifests = c2pa_data.get("manifests", {})
                active_manifest = manifests.get(manifest_id, {})
                assertions = active_manifest.get("assertions", [])
                filtered_c2pa["active_assertions"] = assertions
                return filtered_c2pa
                
            return c2pa_data
        finally:
            os.remove(tmp_file_path)
            
    except Exception as e:
        logger.error(f"C2PA extraction failed: {e}")
        return None

def generate_ela_score(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tmp_buffer = io.BytesIO()
        img.save(tmp_buffer, format="JPEG", quality=90)
        tmp_buffer.seek(0)
        compressed_img = Image.open(tmp_buffer)
        
        diff = ImageChops.difference(img, compressed_img)
        diff_np = np.array(diff)
        ela_score = float(np.mean(diff_np))
        return ela_score
    except Exception as e:
        logger.error(f"ELA extraction failed: {e}")
        return 0.0

router = APIRouter()
investigate_router = router

url_engine = URLEngine()
ai_engine = AIEngine()

class URLRequest(BaseModel):
    url: str

@router.post("/url", response_model=InvestigationResult)
async def investigate_url(request: URLRequest):
    # Step 1: Extract IOCs deterministically
    iocs = url_engine.extract_iocs(request.url)
    
    # Step 2: Pass IOC dictionary to AIEngine
    ai_result = await ai_engine.analyze_artifact(
        artifact_type="URL",
        extracted_data=iocs
    )
    
    # Step 3: Return the combined InvestigationResult
    return InvestigationResult(**ai_result)

@router.post("/email")
async def analyze_email(
    type: str = Form(...), 
    file: UploadFile = File(None), 
    content: str = Form(None)
):
    headers_available = False
    metadata = {}
    body = ""
    attached_pdf_text = ""
    attached_pdf_urls = []
    attached_image_text = []
    attached_image_urls = []
    
    if type == 'upload':
        if not file:
            raise HTTPException(status_code=400, detail="File is required when type is 'upload'")
            
        file_bytes = await file.read()
        msg = email.message_from_bytes(file_bytes, policy=policy.default)
        
        metadata["subject"] = msg.get("Subject")
        metadata["from"] = msg.get("From")
        metadata["to"] = msg.get("To")
        metadata["date"] = msg.get("Date")
        metadata["return_path"] = msg.get("Return-Path")
        metadata["auth_results"] = msg.get("Authentication-Results")
        metadata["received_spf"] = msg.get("Received-SPF")
        headers_available = True
        
        plain_text = ""
        html_text = ""
        for part in msg.walk():
            content_type = part.get_content_type()
            if content_type == 'text/plain':
                payload = part.get_content()
                if payload:
                    plain_text += str(payload) + "\n"
            elif content_type == 'text/html':
                payload = part.get_content()
                if payload:
                    html_text += str(payload) + "\n"
            elif content_type == 'application/pdf':
                pdf_bytes = part.get_payload(decode=True)
                if pdf_bytes:
                    try:
                        pdf_doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
                        for page_index in range(len(pdf_doc)):
                            page = pdf_doc[page_index]
                            attached_pdf_text += page.get_text()
                            for link in page.get_links():
                                if link.get("uri"):
                                    attached_pdf_urls.append(link.get("uri"))
                                    
                            image_list = page.get_images(full=True)
                            for img in image_list:
                                xref = img[0]
                                base_image = pdf_doc.extract_image(xref)
                                image_bytes = base_image["image"]
                                qr_payloads = extract_qr_from_image_bytes(image_bytes)
                                if qr_payloads:
                                    attached_pdf_text += f"\n[HIDDEN QR CODE DETECTED IN PDF]: {' '.join(qr_payloads)}"
                    except Exception as e:
                        print(f"Failed to parse PDF attachment: {e}")
            elif part.get_content_maintype() == 'image':
                try:
                    img_bytes = part.get_payload(decode=True)
                    
                    # 1. New QR Payload Extraction for Quishing (appending to body)
                    qr_payloads = extract_qr_from_image_bytes(img_bytes)
                    if qr_payloads:
                        qr_alert = f"\n[HIDDEN QR CODE DETECTED IN EMAIL ATTACHMENT]: {' '.join(qr_payloads)}"
                        plain_text += qr_alert
                        html_text += qr_alert

                    # 2. Original OCR & Image URL processing
                    nparr = np.frombuffer(img_bytes, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if img is not None:
                        ocr_text = pytesseract.image_to_string(img).strip()
                        if ocr_text:
                            attached_image_text.append(ocr_text)

                        detector = cv2.QRCodeDetector()
                        data, bbox, straight_qrcode = detector.detectAndDecode(img)
                        if data:
                            attached_image_urls.append(data)

                except Exception as e:
                    print(f"Error processing image attachment: {e}")
                
        body = plain_text if plain_text else html_text
                    
    elif type == 'text':
        if not content:
            raise HTTPException(status_code=400, detail="Content is required when type is 'text'")
            
        body = content
        headers_available = False
        metadata = {}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid type specified.")

    extracted_urls = list(set(re.findall(r'(https?://[^\s>"\']+)', body)))
    
    # TODO: Pass extracted_urls to the URL Brain for individual threat scoring

    payload_dict = {
        "headers_available": headers_available,
        "metadata": metadata,
        "email_body": body,
        "email_urls": extracted_urls,
        "has_pdf_attachment": bool(attached_pdf_text),
        "attached_pdf_text": attached_pdf_text[:2000],
        "attached_pdf_urls": attached_pdf_urls,
        "has_image_attachment": bool(attached_image_text or attached_image_urls),
        "attached_image_text": "\n".join(attached_image_text)[:2000],
        "attached_image_urls": attached_image_urls
    }

    EMAIL_SYSTEM_PROMPT = """
You are TRINETRA, an advanced, highly analytical AI Threat Intelligence Engine.
Your objective is to analyze email data and determine if it is a phishing attempt, scam, or safe communication.

You will receive a JSON payload containing:
1. `headers_available`: Boolean indicating if technical headers are present.
2. `metadata`: Header data (if available).
3. `email_body`: The raw text of the email.
4. `email_urls`: A list of URLs found in the email.
5. `has_pdf_attachment`: Boolean indicating if a PDF attachment was found.
6. `attached_pdf_text`: Extracted text from attached PDF (truncated to 2000 chars).
7. `attached_pdf_urls`: A list of URLs found embedded in the attached PDF.
8. `has_image_attachment`: Boolean indicating if an image attachment was found.
9. `attached_image_text`: Extracted text from image (truncated to 2000 chars).
10. `attached_image_urls`: A list of URLs found in QR codes in the image.

INVESTIGATION RULES:
- If `headers_available` is true, analyze SPF/DKIM/DMARC results and check for domain spoofing.
- If `headers_available` is false (user pasted text), DO NOT mention the lack of headers as a failure. Instead, heavily weight your analysis on LINGUISTIC BEHAVIOR (social engineering, false urgency, authority impersonation, financial manipulation) and the validity of the `email_urls`.
- Cross-reference the email body with `attached_image_text` (looking for extortion, fake warnings, or invoice scams inside pictures) and `attached_image_urls` (looking for phishing URLs decoded from QR codes).
- The AI must flag the entire artifact as MALICIOUS if the email text appears benign but the attached PDF contains phishing links, false urgency, or fake invoice details.
- If malicious intent is found in the images, the entire artifact must be flagged as MALICIOUS.
- Any mismatch between the claimed sender (e.g., a bank name in the text) and the extracted URLs strongly indicates a MALICIOUS threat.

GEOGRAPHIC & DOMAIN CONTEXT RULES:
Maintain maximum strictness for all global security standards (including generic passwords and DKIM/SPF/DMARC failures) with ONE specific regional exception:

Indian Banking Infrastructure Exception:
It is a standard regional practice for Indian financial institutions (e.g., Saraswat Bank, SBI, HDFC, ICICI, or domains ending in `.in` / `.co.in`) to send encrypted PDF statements and include the password format (e.g., Customer ID, Name + DOB) in the email body. 
- IF the sender is a verified Indian bank (SPF/DMARC pass) AND the email contains e-statement password instructions, DO NOT flag it as suspicious. 
- IF the email claims to be from an international bank (e.g., Chase, Barclays) or an unknown global domain and uses this generic password tactic, FLAG IT IMMEDIATELY as a high-risk security violation.
- For verified Indian domains, if DKIM fails but SPF and DMARC pass, treat the email as legitimate, as local transit routes frequently break DKIM signatures.

You MUST respond with ONLY a valid JSON object. No markdown formatting, no conversational text.

EXPECTED JSON SCHEMA:
{
  "verdict": "SAFE" | "SUSPICIOUS" | "MALICIOUS",
  "threat_score": <int between 0-100, where 100 is critical danger>,
  "confidence": <int between 0-100>,
  "executive_summary": "<A concise 2-sentence executive summary explaining the primary threat or safe status>",
  "evidence_collected": {
    "sender": "<sender email or name if found>",
    "authentication": "<headers status>",
    "urls_found": "<number of URLs>",
    "urgency_level": "<High/Medium/Low>"
  },
  "indicators_of_compromise": [
    "<List specific red flags found, e.g., 'DKIM signature failed', 'URL points to suspicious external domain', 'Creates false sense of urgency regarding account suspension'>"
  ],
  "ai_reasoning": "<A detailed, explainable paragraph breaking down the evidence and explaining exactly why TRINETRA reached this conclusion based on the provided data>",
  "recommended_actions": [
    "<Specific recommendation 1>",
    "<Specific recommendation 2>"
  ]
}
"""

    try:
        chat_completion = await ai_engine.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": EMAIL_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": json.dumps(payload_dict),
                }
            ],
            model=ai_engine.model,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        ai_response_text = chat_completion.choices[0].message.content
        ai_response = json.loads(ai_response_text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "status": "success",
        "investigation_type": "email",
        "headers_available": headers_available,
        "metadata": {
            "subject": metadata.get("subject"),
            "from": metadata.get("from"),
            "auth_results": metadata.get("auth_results"),
            "return_path": metadata.get("return_path")
        },
        "extracted_urls": extracted_urls,
        "body_snippet": body[:500] + "..." if len(body) > 500 else body,
        "ai_analysis": ai_response
    }

@router.post("/pdf")
async def investigate_pdf(file: UploadFile = File(...)):
    if not (file.filename.endswith('.pdf') or file.content_type == 'application/pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be a PDF.")
        
    file_bytes = await file.read()
    pdf_text = ""
    pdf_urls = []
    
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF file format: {str(e)}")

    extracted_text = ""
    for page in doc:
        extracted_text += page.get_text()
        for link in page.get_links():
            uri = link.get("uri")
            if uri:
                pdf_urls.append(uri)

    # Safely extract embedded images & QR codes
    for page_index in range(len(doc)):
        page = doc[page_index]
        for img in page.get_images(full=True):
            try:
                base_image = doc.extract_image(img[0])
                image_bytes = base_image["image"]
                qr_payloads = extract_qr_from_image_bytes(image_bytes)
                if qr_payloads:
                    extracted_text += f"\n[HIDDEN QR CODE payload]: {' '.join(qr_payloads)}"
            except Exception:
                continue

    pdf_text = extracted_text
        
    payload_dict = {
        "pdf_text": pdf_text[:4000],
        "pdf_urls": list(set(pdf_urls))
    }
    
    PDF_SYSTEM_PROMPT = """
You are TRINETRA, an advanced AI Threat Intelligence Engine.
Your objective is to analyze extracted PDF text and URLs to determine if the document is malicious, a scam, or safe.

You will receive a JSON payload containing:
1. `pdf_text`: Extracted raw text from the PDF.
2. `pdf_urls`: A list of URLs found embedded in the PDF.

INVESTIGATION RULES:
- Heavily weight your analysis on LINGUISTIC BEHAVIOR (social engineering, false urgency, fake invoices, generic greetings).
- Check if the URLs lead to credential harvesting sites, suspicious domains, or URL shorteners.
- Mismatch between claimed sender in the text and the domains in the URLs indicates a MALICIOUS threat.

GEOGRAPHIC & DOMAIN CONTEXT RULES:
- IF the text contains e-statement password instructions typical of Indian financial institutions, DO NOT flag it as suspicious purely based on this generic password tactic.
- IF it claims to be from an international bank and uses this tactic, FLAG IT as high-risk.

You MUST respond with ONLY a valid JSON object matching this schema:
{
  "verdict": "SAFE" | "SUSPICIOUS" | "MALICIOUS",
  "threat_score": <int between 0-100, where 100 is critical danger>,
  "confidence": <int between 0-100>,
  "executive_summary": "<A concise 2-sentence executive summary explaining the primary threat or safe status>",
  "evidence_collected": {
    "urls_found": "<number of URLs>",
    "urgency_level": "<High/Medium/Low>"
  },
  "indicators_of_compromise": [
    "<List of specific red flags>"
  ],
  "ai_reasoning": "<Detailed explanation>",
  "recommended_actions": [
    "<Specific recommendation>"
  ]
}
"""

    try:
        chat_completion = await ai_engine.client.chat.completions.create(
            messages=[
                {"role": "system", "content": PDF_SYSTEM_PROMPT},
                {"role": "user", "content": json.dumps(payload_dict)}
            ],
            model=ai_engine.model,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        ai_response_text = chat_completion.choices[0].message.content
        ai_response = json.loads(ai_response_text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return {
        "status": "success",
        "investigation_type": "pdf",
        "extracted_urls": payload_dict["pdf_urls"],
        "body_snippet": pdf_text[:500] + "..." if len(pdf_text) > 500 else pdf_text,
        "ai_analysis": ai_response
    }

@router.post("/qr")
async def investigate_qr_endpoint(file: UploadFile = File(...)):
    # 1. Reset the file buffer and read bytes
    await file.seek(0)
    contents = await file.read()
    extracted_payload = None

    # ==========================================
    # STAGE 1: LOCAL DECODING (ZXING-CPP)
    # ==========================================
    try:
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is not None:
            results = zxingcpp.read_barcodes(img)
            if results:
                extracted_payload = results[0].text
            else:
                results_inv = zxingcpp.read_barcodes(cv2.bitwise_not(img))
                if results_inv:
                    extracted_payload = results_inv[0].text
    except Exception as e:
        print(f"Local CV parsing failed: {e}")

    # ==========================================
    # STAGE 2: GROQ VISION AI FALLBACK
    # ==========================================
    if not extracted_payload:
        try:
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            b64_img = base64.b64encode(contents).decode('utf-8')
            vision_res = client.chat.completions.create(
                model="qwen/qwen3.6-27b",
                messages=[
                    {"role": "user", "content": [
                        {"type": "text", "text": "Extract the raw payload, URL, or payment string (e.g. upi://) from this QR code. Return ONLY the raw string. If unreadable, return FAILED."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
                    ]}
                ],
                temperature=0.1
            )
            vision_text = vision_res.choices[0].message.content.strip()
            if "FAILED" not in vision_text.upper():
                extracted_payload = vision_text
        except Exception as e:
            print(f"Groq Vision failed: {e}")

    # ==========================================
    # STAGE 3: THREAT ANALYSIS
    # ==========================================
    if not extracted_payload:
        return {
            "status": "success",
            "investigation_type": "qr",
            "ai_analysis": {
                "verdict": "SAFE",
                "threat_score": 0,
                "confidence": 100,
                "executive_summary": "No valid QR code was detected in the uploaded image.",
                "ai_reasoning": "No valid QR code was detected in the uploaded image.",
                "indicators_of_compromise": [],
                "recommended_actions": [],
                "evidence_collected": {
                    "Extracted_Payload": "None detected"
                }
            }
        }

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = f"""
        You are an AI cybersecurity assistant for TRINETRA.
        Analyze this extracted QR code payload: {extracted_payload}

        CRITICAL RULES:
        1. Speak to the end-user in simple, everyday language. Avoid complex technical jargon (like 'pa parameters' or 'tracking identifiers') unless it is an actual, confirmed threat.
        2. If this is a standard UPI payment link (e.g., upi://pay...), recognize that it is completely normal. Standard tracking parameters in UPI/GPay links are harmless and expected.
        3. Your reasoning and recommendations MUST match the verdict! If the verdict is SAFE, reassure the user it looks like a normal payment QR code. Do NOT tell them to cancel the transaction if it is safe.
        4. If it is safe, your recommended action should simply be: "Verify the recipient's name on your UPI app before entering your PIN."

        Respond ONLY with a valid JSON object matching this exact schema:
        {{
          "verdict": "SAFE" | "SUSPICIOUS" | "MALICIOUS",
          "threat_score": 0,
          "confidence": 99,
          "executive_summary": "A 2-sentence simple summary",
          "ai_reasoning": "A simple, non-technical explanation of why it is safe or dangerous",
          "indicators_of_compromise": [],
          "recommended_actions": ["Simple step 1", "Simple step 2"]
        }}
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-oss-20b",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        # Parse the raw AI response
        ai_parsed_data = json.loads(chat_completion.choices[0].message.content)
        
        # ==========================================
        # BULLETPROOF DATA MAPPING
        # ==========================================
        executive_summary = ai_parsed_data.get("executive_summary", ai_parsed_data.get("summary", "Analysis completed successfully."))
        ai_reasoning = ai_parsed_data.get("ai_reasoning", ai_parsed_data.get("reasoning", "No detailed reasoning provided."))
        
        evidence_dict = {
            "Extracted_Payload": extracted_payload
        }
        
        return {
            "status": "success",
            "investigation_type": "qr",
            "ai_analysis": {
                "verdict": ai_parsed_data.get("verdict", "UNKNOWN"),
                "threat_score": ai_parsed_data.get("threat_score", 0),
                "confidence": ai_parsed_data.get("confidence", 95),
                "executive_summary": executive_summary,
                "ai_reasoning": ai_reasoning,
                "indicators_of_compromise": ai_parsed_data.get("indicators_of_compromise", []),
                "recommended_actions": ai_parsed_data.get("recommended_actions", []),
                "evidence_collected": evidence_dict
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threat Engine Error: {str(e)}")

@router.post("/image")
async def investigate_image_endpoint(file: UploadFile = File(...)):
    await file.seek(0)
    contents = await file.read()
    
    # 0. Pre-LLM Forensic Extraction Layer
    exif_data = await run_in_threadpool(extract_exif_data, contents)
    c2pa_data = await run_in_threadpool(extract_c2pa_data, contents)
    ela_score = await run_in_threadpool(generate_ela_score, contents)
    
    # 1. OCR & QR extraction (ZXing check & Tesseract OCR)
    ocr_text = ""
    qr_payloads = []
    extracted_payload = None
    try:
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            ocr_text = pytesseract.image_to_string(img).strip()
            qr_payloads = extract_qr_from_image_bytes(contents)
            if qr_payloads:
                extracted_payload = ", ".join(qr_payloads)
            else:
                # Fallback to dark-mode/inverted matrix evaluation via ZXing
                results_inv = zxingcpp.read_barcodes(cv2.bitwise_not(img))
                if results_inv:
                    extracted_payload = ", ".join([res.text for res in results_inv if res.text])
                    if extracted_payload:
                        qr_payloads = [extracted_payload]
    except Exception as e:
        print(f"Image CV parsing failed: {e}")

    # 2. Two-Stage AI Vision & Threat Analysis via Groq
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # Payload Optimization (PIL Image Pre-processing)
        optimized_bytes = contents
        try:
            needs_optimization = False
            if len(contents) > 2 * 1024 * 1024:
                needs_optimization = True
            else:
                with Image.open(io.BytesIO(contents)) as pil_img:
                    w, h = pil_img.size
                    if max(w, h) > 1536:
                        needs_optimization = True

            if needs_optimization:
                with Image.open(io.BytesIO(contents)) as pil_img:
                    if pil_img.mode in ("RGBA", "P"):
                        pil_img = pil_img.convert("RGB")
                    
                    w, h = pil_img.size
                    if max(w, h) > 1536:
                        ratio = 1536.0 / max(w, h)
                        new_w = int(w * ratio)
                        new_h = int(h * ratio)
                        pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    
                    img_buffer = io.BytesIO()
                    pil_img.save(img_buffer, format='JPEG', quality=85)
                    optimized_bytes = img_buffer.getvalue()
                    logger.info(f"Image optimized. Original size: {len(contents)} bytes. New size: {len(optimized_bytes)} bytes.")
        except Exception as opt_err:
            logger.error(f"Payload optimization failed: {opt_err}", exc_info=True)
            # Proceed with original contents if optimization fails
            pass

        b64_img = base64.b64encode(optimized_bytes).decode('utf-8')
        
        # STAGE 1: Vision AI (Elite Visual Intelligence Analyst)
        vision_prompt = (
            "You are an elite visual intelligence analyst for TRINETRA.\n"
            "Analyze this uploaded image and inspect it for four specific things:\n\n"
            "VISIBLE QR / BARCODES: Does this image contain a QR code or barcode?\n\n"
            "AI-GENERATION SIGNS: Does this image show signs of AI generation or synthetic manipulation (e.g., unnatural textures, warped background details, synthetic lighting, AI-rendered text artifacts, ultra-smooth skin, or unrealistic geometry)?\n\n"
            "VISUAL CONTEXT: Is it a screenshot of a conversation, an invoice/receipt, a social media post, a payment gateway, or general artwork?\n\n"
            "STRICT ENTITY & ASSET RECOGNITION:\n"
            "You are encouraged to identify specific entities (e.g., characters like Pikachu or Charizard, specific brand logos, or specific UI elements) to demonstrate deep visual comprehension.\n"
            "Zero-Guessing Threshold: You must only name a specific entity if you have 100% visual confirmation based on clear, unobstructed features.\n"
            "If an entity is partially obscured, blended, or ambiguous (e.g., a cluster of background characters), DO NOT guess its name. Instead, describe its visual attributes (e.g., \"a red bird-like character\" rather than guessing \"Ho-Oh\").\n"
            "Focus your entity recognition on elements that help determine the media's origin (e.g., identifying official game assets vs. AI-hallucinated variations).\n\n"
            f"FORENSIC METADATA: EXIF={exif_data}, C2PA={c2pa_data}, ELA_Score={ela_score}\n"
            "You are provided with hidden cryptographic C2PA metadata, EXIF camera data, and an Error Level Analysis (ELA) score. If C2PA data indicates AI generation, or if the ELA score indicates high splicing, you MUST classify the media_origin as AI-GENERATED, even if the image visually appears to be a clean human-made poster or UI graphic.\n\n"
            "Return a clear structural summary of your findings."
        )
        
        extracted_context = "Visual context could not be determined."
        try:
            vision_res = client.chat.completions.create(
                model="qwen/qwen3.6-27b",
                messages=[
                    {"role": "user", "content": [
                        {"type": "text", "text": vision_prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
                    ]}
                ],
                temperature=0.1
            )
            extracted_context = vision_res.choices[0].message.content.strip()
        except Exception as vision_err:
            logger.error(f"Vision API Critical Failure: {vision_err}", exc_info=True)
            raise HTTPException(status_code=502, detail=f"Vision AI Extraction Error: {str(vision_err)}")
            
        if ocr_text:
            extracted_context += f"\n\n[LOCAL OCR TEXT EXTRACTED]: {ocr_text}"

        # STAGE 2: Cybersecurity Threat Analyst Reasoning
        threat_prompt = f"""
You are TRINETRA, an elite digital forensics engine specializing in synthetic media analysis.
Evaluate the provided evidence from an uploaded image artifact:

DETECTED QR PAYLOAD: {extracted_payload or "None detected"}
VISUAL CONTEXT & ANALYSIS: {extracted_context}
FORENSIC METADATA: EXIF={exif_data}, C2PA={c2pa_data}, ELA_Score={ela_score}

Execute this MANDATORY 3-STEP FORENSIC AUDIT on every image:

STEP 1: CORNER WATERMARK SCAN
- Inspect the four corners (especially bottom-right and bottom-left).
- If any generative AI badge, sparkle icon (e.g., 4-point star), or synthetic watermark is present -> Immediately classify media_origin as "AI-GENERATED" with synthetic_probability 95-100.

STEP 2: STRUCTURAL & GEOMETRIC AUDIT
- Check symmetry and geometry: Are circular frames warped or broken? Are paired features (horns, ears, armor pauldrons) missing or mismatched?
- Check object junctions: Do props (e.g., spatulas, weapons, food) melt directly into the character or armor with impossible physics?
- Check crowd boundaries: In multi-character art, do limbs, tails, or hair fuse into neighboring bodies without clean occlusion lines?
- If any of these diffusion errors are present -> Classify media_origin as "AI-GENERATED" (synthetic_probability 80-95), even if the image contains clean text, watermarks, or sharp outlines.

STEP 3: DECEPTION & PAYLOAD AUDIT
- Check for phishing links, QR payloads, urgent coercion, or financial fraud.
- If safe/benign (e.g., fan art, gamer avatar, wallpaper) -> verdict: "SAFE", threat_score: 0-15.
- If malicious/deceptive -> verdict: "SUSPICIOUS" or "MALICIOUS".

OUTPUT REQUIREMENTS:
- You must strictly output the JSON schema.
- Explicitly cite the specific structural or corner anomalies in "synthetic_indicators" and "ai_reasoning".

Respond ONLY with a valid JSON object matching this exact schema:
{{
  "verdict": "SAFE" | "SUSPICIOUS" | "MALICIOUS",
  "threat_score": 0,
  "confidence": 95,
  "media_origin": "ORIGINAL" | "AI-GENERATED" | "UNCERTAIN",
  "synthetic_probability": 0,
  "executive_summary": "A 2-sentence summary detailing what the image is and its safety status.",
  "ai_reasoning": "Simple explanation. If AI-generated, state clearly whether it is harmless AI art or deceptive synthetic media.",
  "indicators_of_compromise": ["Notable indicator 1", "Notable indicator 2"],
  "synthetic_indicators": ["Notable structural or corner anomaly 1"],
  "recommended_actions": ["Simple action step 1", "Simple action step 2"]
}}
"""

        chat_completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": threat_prompt}],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        ai_parsed_data = json.loads(chat_completion.choices[0].message.content)

        return {
            "status": "success",
            "investigation_type": "image",
            "extracted_text": ocr_text,
            "qr_payloads": qr_payloads,
            "ai_analysis": {
                "verdict": ai_parsed_data.get("verdict", "UNKNOWN"),
                "threat_score": ai_parsed_data.get("threat_score", 0),
                "confidence": ai_parsed_data.get("confidence", 95),
                "media_origin": ai_parsed_data.get("media_origin", "UNCERTAIN"),
                "synthetic_probability": ai_parsed_data.get("synthetic_probability", 0),
                "executive_summary": ai_parsed_data.get("executive_summary", "Image analysis completed."),
                "ai_reasoning": ai_parsed_data.get("ai_reasoning", "No detailed reasoning provided."),
                "indicators_of_compromise": ai_parsed_data.get("indicators_of_compromise", []),
                "synthetic_indicators": ai_parsed_data.get("synthetic_indicators", []),
                "recommended_actions": ai_parsed_data.get("recommended_actions", []),
                "evidence_collected": {
                    "OCR_Text_Found": bool(ocr_text),
                    "QR_Codes_Found": len(qr_payloads),
                    "Extracted_Payload": extracted_payload or "None detected",
                    "Image_Size_KB": round(len(contents) / 1024, 1)
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image Threat Engine Error: {str(e)}")