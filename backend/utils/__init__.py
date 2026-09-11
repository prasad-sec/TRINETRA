from .privacy_filter import mask_pii_for_forensics
import json
import re
from typing import Dict, Any

def parse_llm_json(raw_text: str, fallback_schema: Dict[str, Any]) -> Dict[str, Any]:
    if not raw_text or not raw_text.strip():
        print("[Trinetra] LLM returned empty string.")
        return fallback_schema
    
    cleaned = raw_text.strip()
    
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\n?```$", "", cleaned)
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    print(f"[Trinetra] JSON Parsing Failed. Raw output: {raw_text[:200]}...")
    return fallback_schema
