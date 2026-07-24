from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from schemas.intelligence import ThreatIntelSummary

class URLInvestigationRequest(BaseModel):
    url: str

class IOCData(BaseModel):
    domain: str
    ip: Optional[str] = None
    scheme: str
    port: Optional[int] = None
    domain_age_days: Optional[int] = None
    is_ip_address: bool
    reputation_status: str
    intel: Optional[ThreatIntelSummary] = None

class InvestigationResponse(BaseModel):
    investigation_id: str
    artifact_type: str
    status: str
    raw_analysis: IOCData
    timestamp: datetime
