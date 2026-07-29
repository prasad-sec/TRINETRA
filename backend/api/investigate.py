import email
from email import policy
import re
import json
from fastapi import APIRouter, Form, File, UploadFile, HTTPException
from pydantic import BaseModel
from engines.url_engine import URLEngine
from ai.reasoning import AIEngine
from schemas.investigation import InvestigationResult

router = APIRouter(prefix="/api/v1/investigate", tags=["Investigation Engine"])

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
        "body": body,
        "extracted_urls": extracted_urls
    }

    EMAIL_SYSTEM_PROMPT = """
You are TRINETRA, an advanced, highly analytical AI Threat Intelligence Engine.
Your objective is to analyze email data and determine if it is a phishing attempt, scam, or safe communication.

You will receive a JSON payload containing:
1. `headers_available`: Boolean indicating if technical headers are present.
2. `metadata`: Header data (if available).
3. `body`: The raw text of the email.
4. `extracted_urls`: A list of URLs found in the email.

INVESTIGATION RULES:
- If `headers_available` is true, analyze SPF/DKIM/DMARC results and check for domain spoofing.
- If `headers_available` is false (user pasted text), DO NOT mention the lack of headers as a failure. Instead, heavily weight your analysis on LINGUISTIC BEHAVIOR (social engineering, false urgency, authority impersonation, financial manipulation) and the validity of the `extracted_urls`.
- Any mismatch between the claimed sender (e.g., a bank name in the text) and the extracted URLs strongly indicates a MALICIOUS threat.

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
