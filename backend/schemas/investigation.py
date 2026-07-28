from pydantic import BaseModel, Field
from typing import List, Dict, Any

class InvestigationResult(BaseModel):
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
