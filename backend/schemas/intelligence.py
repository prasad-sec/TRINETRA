from typing import Optional
from pydantic import BaseModel

class VTDomainReport(BaseModel):
    malicious_votes: int
    suspicious_votes: int
    harmless_votes: int
    creation_date: Optional[int] = None
    registrar: Optional[str] = None

class AbuseIPDBReport(BaseModel):
    abuse_confidence_score: int
    total_reports: int
    country_code: Optional[str] = None
    isp: Optional[str] = None

class ThreatIntelSummary(BaseModel):
    vt_data: Optional[VTDomainReport] = None
    abuse_data: Optional[AbuseIPDBReport] = None
