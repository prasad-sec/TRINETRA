import json
import re
from typing import Dict, Any
import extract_msg

def parse_msg_file(file_path):
    msg = extract_msg.openMsg(file_path)
    
    extracted_data = {
        "sender": msg.sender,
        "date": msg.date,
        "subject": msg.subject,
        "body": msg.body,
        "attachments": [att.longFilename for att in msg.attachments if att.longFilename]
    }
    
    msg.close()
    return extracted_data

def parse_llm_json(raw_text: str, fallback_schema: Dict[str, Any]) -> Dict[str, Any]:
    if not raw_text or not raw_text.strip():
        print("[Trinetra] LLM returned empty string.")
        return fallback_schema
    
    cleaned = raw_text.strip()
    
    # Strip markdown code blocks if present
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\n?```$", "", cleaned)
        cleaned = cleaned.strip()

    # Direct JSON parse attempt
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Regex fallback to extract outermost JSON object
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # If all parsing fails, return the endpoint-specific fallback
    print(f"[Trinetra] JSON Parsing Failed. Raw output: {raw_text[:200]}...")
    return fallback_schema
