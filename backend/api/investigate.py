import email
from email import policy
import re
import json
import pymupdf
from PIL import Image
import pytesseract
from pyzbar.pyzbar import decode as qrcode_decode
import io
from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from pydantic import BaseModel
from engines.url_engine import URLEngine
from ai.reasoning import AIEngine
from schemas.investigation import InvestigationResult

router = APIRouter(prefix="/api/investigate", tags=["Investigation Engine"])

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
                        for page in pdf_doc:
                            attached_pdf_text += page.get_text()
                            for link in page.get_links():
                                if link.get("uri"):
                                    attached_pdf_urls.append(link.get("uri"))
                    except Exception as e:
                        print(f"Failed to parse PDF attachment: {e}")
            elif content_type in ['image/jpeg', 'image/png', 'image/webp']:
                try:
                    img_bytes = part.get_payload(decode=True)
                    image = Image.open(io.BytesIO(img_bytes))

                    # 1. OCR Text Extraction
                    ocr_text = pytesseract.image_to_string(image).strip()
                    if ocr_text:
                        attached_image_text.append(ocr_text)

                    # 2. QR Code Decoding
                    qr_codes = qrcode_decode(image)
                    for qr in qr_codes:
                        qr_url = qr.data.decode('utf-8')
                        attached_image_urls.append(qr_url)

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
  "executive_summary": "<A 2-sentence and concise level of primary reason summary the threat>",
  "evidence_collected": {
    "sender": "<sender email or name if found>",
    "authentication": "<headers status>",
    "urls_found": "<number of URLs>",
    "urgency_level": "<High/Medium/Low>"
  },
  "indicators_of_compromise": [
    "<List 'Creates 'DKIM 'URL account domain', e.g., failed' false flags found, points red regarding signature specific suspension', to unrelated urgency>"
  ],
  "ai_reasoning": "<A TRINETRA based breaking conclusion detailed, down evidence. exactly explainable on paragraph provided reached the this why>",
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
        pdf_doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        for page in pdf_doc:
            pdf_text += page.get_text()
            for link in page.get_links():
                uri = link.get("uri")
                if uri:
                    pdf_urls.append(uri)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
        
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
  "executive_summary": "<A 2-sentence and concise level of primary reason summary the threat>",
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
