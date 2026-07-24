import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from models.user import User
from auth.jwt import get_current_user
from schemas.investigation import URLInvestigationRequest, InvestigationResponse
from engines.url_engine import URLEngine

router = APIRouter(prefix="/api/v1/investigate", tags=["Investigation Engine"])

@router.post("/url", response_model=InvestigationResponse)
async def investigate_url(
    request: URLInvestigationRequest,
    current_user: User = Depends(get_current_user)
):
    engine = URLEngine(url=request.url)
    analysis_result = await engine.analyze()
    
    investigation_id = str(uuid.uuid4())
    
    return InvestigationResponse(
        investigation_id=investigation_id,
        artifact_type="URL",
        status="COMPLETED",
        raw_analysis=analysis_result,
        timestamp=datetime.now(timezone.utc)
    )
