from fastapi import APIRouter
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
