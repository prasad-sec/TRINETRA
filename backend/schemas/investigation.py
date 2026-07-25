from pydantic import BaseModel, Field
from typing import List, Dict

class InvestigationResult(BaseModel):
    threat_score: int = Field(..., ge=0, le=100, description="Threat score between 0 and 100")
    severity: str = Field(..., description="Severity level: SAFE, WARNING, CRITICAL")
    threat_category: str = Field(..., description="A short 2-3 word classification, e.g., 'Phishing Campaign'")
    ai_confidence: int = Field(..., ge=0, le=100, description="AI confidence score between 0 and 100")
    ai_reasoning: str = Field(..., description="Detailed explanation of the findings")
    iocs: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Indicators of Compromise, e.g., {'domains': [], 'ips': [], 'emails': []}"
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="A list of 2-3 actionable steps to mitigate the threat"
    )
