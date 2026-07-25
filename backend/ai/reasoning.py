import os
import json
import groq
from groq import AsyncGroq

class AIEngine:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"
        
    async def analyze_artifact(self, artifact_type: str, extracted_data: dict) -> dict:
        system_prompt = (
            "You are a Principal Python AI Security Engineer and Senior Security Analyst. "
            f"Your task is to analyze the provided {artifact_type} extracted data and identify security threats. "
            "You MUST return ONLY a raw JSON object matching the following schema:\n"
            "{\n"
            '  "threat_score": int (0-100),\n'
            '  "severity": str ("SAFE", "WARNING", "CRITICAL"),\n'
            '  "threat_category": str (A short 2-3 word classification, e.g., "Phishing Campaign", "Safe Domain", "Malware Delivery"),\n'
            '  "ai_confidence": int (0-100),\n'
            '  "ai_reasoning": str (The detailed explanation),\n'
            '  "iocs": dict (e.g., {"domains": [], "ips": [], "emails": []}),\n'
            '  "recommended_actions": list[str] (A list of 2-3 actionable steps based specifically on the artifact analyzed)\n'
            "}"
        )
        
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": json.dumps(extracted_data),
                    }
                ],
                model=self.model,
                response_format={"type": "json_object"}
            )
            
            response_content = chat_completion.choices[0].message.content
            return json.loads(response_content)
            
        except (json.JSONDecodeError, groq.APIError) as e:
            return {
                "threat_score": 0,
                "severity": "SAFE",
                "threat_category": "Error",
                "ai_confidence": 0,
                "ai_reasoning": f"Analysis failed due to error: {str(e)}",
                "iocs": {},
                "recommended_actions": ["Retry the analysis"]
            }
        except Exception as e:
             return {
                "threat_score": 0,
                "severity": "SAFE",
                "threat_category": "Error",
                "ai_confidence": 0,
                "ai_reasoning": f"An unexpected error occurred: {str(e)}",
                "iocs": {},
                "recommended_actions": ["Check system logs"]
            }
