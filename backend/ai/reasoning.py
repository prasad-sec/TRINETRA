import os
import json
import groq
from groq import AsyncGroq

from pydantic import BaseModel
from typing import List, Dict, Any

class InvestigationReport(BaseModel):
    threat_verdict: str
    threat_score: int
    ai_confidence: int
    confidence_explanation: str
    executive_summary: str
    key_findings: List[str]
    evidence_collected: Dict[str, Any]
    indicators_of_compromise: Dict[str, List[str]]
    ai_analyst_reasoning: str
    recommended_actions: List[str]
    investigation_conclusion: str

class AIEngine:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"
        
    async def analyze_artifact(self, artifact_type: str, extracted_data: dict) -> dict:
        system_prompt = (
            "You are an Expert Cyber Threat Intelligence Analyst. Your job is to forensically analyze URLs and identify phishing, typosquatting, and malicious intent. "
            f"Your task is to analyze the provided {artifact_type} extracted data and identify security threats. "
            "STRICT RULES:\n"
            "1. DOMAIN STRUCTURE AWARENESS & CRITICAL TLD RULE: Understand official Country Code Top-Level Domains (ccTLDs) like `.co.in`, `.com.au`, `.gov.in`, `.ac.in`. Recognized public suffixes like `.co.in`, `.com.au`, `.gov.in`, `.org.uk`, and standard prefixes like `www` are NOT subdomains. For example, `https://www.sbi.co.in/` has ZERO excessive subdomains and is the official portal of State Bank of India. You MUST give official root domains a Threat Score of 0, 95%+ Confidence, and a SAFE verdict.\n"
            "2. MANDATORY KEY FINDINGS ARRAY: You MUST return a JSON object containing a `key_findings` array with at least 3 concise technical observations (e.g., 'Valid SSL Certificate', 'Official TLD Structure', 'No Keyword Hijacking'). NEVER return an empty array for `key_findings`.\n"
            "3. GLOBAL BRAND AWARENESS (CRITICAL): Actively check for typosquatting against both global and regional brands, including major Indian financial institutions, cooperative banks, and government portals. Do NOT hallucinate nonsensical acronyms like 'SARS' or 'SWATT'.\n"
            "4. DYNAMIC CONFIDENCE RULE: You MUST NOT default to 96 for ai_confidence. If the domain is an official, verified brand (e.g., sbi.co.in), confidence MUST be between 97 and 99. If it is an obvious typosquat (e.g., insstagram), confidence MUST be between 90 and 95. If the URL is ambiguous, confidence MUST be between 75 and 85. Provide a 1-sentence confidence_explanation justifying this exact percentage.\n"
            "5. EVIDENCE COLLECTED: You must extract factual metadata from the provided URL to populate evidence_collected. Include keys like 'Protocol' (HTTP/HTTPS), 'Root_Domain', 'TLD_Extension', and 'Subdomain_Count'. Do not leave this empty.\n"
            "6. INDICATORS OF COMPROMISE (IoCs): If the threat is SUSPICIOUS or CRITICAL, populate the indicators_of_compromise dictionary. Group them by type. Example: {'Suspicious_Domains': ['fake-bank.com'], 'Targeted_Brands': ['State Bank of India'], 'Malicious_Keywords': ['login', 'verify']}. If SAFE, return an empty dictionary {}.\n"
            "7. UNIQUE ROLES & PROFESSIONAL TONE: You are a Threat Intelligence Engine. Ensure each field in your JSON response contains UNIQUE information:\n"
            "   - `executive_summary`: A concise 1-2 sentence executive summary of the investigation.\n"
            "   - `key_findings`: List 3 distinct TECHNICAL findings. ONLY list specific technical indicators.\n"
            "   - `ai_analyst_reasoning`: Explain the threat context or legitimacy in 2 sentences in a highly professional, definitive forensic tone.\n"
            "   - `investigation_conclusion`: Provide the final investigative conclusion.\n"
            "CRITICAL SCORING RUBRIC:\n"
            "- You are a strict cybersecurity engine. Your numerical `threat_score` MUST mathematically align with your text analysis.\n"
            "- If your reasoning identifies 'typosquatting', 'phishing', or 'malicious intent', the `threat_score` MUST be between 85-100 and the `threat_verdict` MUST be 'CRITICAL'.\n"
            "- If you identify suspicious keywords but no direct malice, the score MUST be 50-84 and verdict 'SUSPICIOUS'.\n"
            "- ONLY output 'SAFE' (0-49) if the domain is verified and clean. NEVER output a low score if your reasoning states the site is dangerous.\n"
            "You MUST output your response in valid JSON matching this exact schema: { 'threat_verdict': 'string', 'threat_score': 0, 'ai_confidence': 95, 'confidence_explanation': 'string', 'executive_summary': 'string', 'key_findings': ['finding 1'], 'evidence_collected': {'key': 'value'}, 'indicators_of_compromise': {'type': ['ioc1']}, 'ai_analyst_reasoning': 'string', 'recommended_actions': ['action 1'], 'investigation_conclusion': 'string' }."
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
            # Validate output via Pydantic
            parsed_data = json.loads(response_content)
            validated_report = InvestigationReport(**parsed_data)
            return validated_report.dict()
            
        except (json.JSONDecodeError, groq.APIError, Exception) as e:
            fallback = InvestigationReport(
                threat_verdict="SAFE",
                threat_score=0,
                ai_confidence=99,
                confidence_explanation="Fallback triggered due to analysis error.",
                executive_summary="Analysis failed. Defaulting to safe fallback.",
                key_findings=["Analysis could not be completed."],
                evidence_collected={},
                indicators_of_compromise={},
                ai_analyst_reasoning=f"Analysis failed or validation error occurred: {str(e)}",
                recommended_actions=["Check system logs or retry"],
                investigation_conclusion="Investigation could not be completed."
            )
            return fallback.dict()
