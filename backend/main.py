from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from api.investigate import investigate_router, limiter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup for lifespan events
    yield
    # Cleanup for lifespan events
    pass

app = FastAPI(title="TRINETRA API", version="1.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    # Enforce a 10MB limit (10 * 1024 * 1024 bytes)
    max_size = 10 * 1024 * 1024
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > max_size:
        raise HTTPException(
            status_code=413, 
            detail="Payload too large. Maximum supported file size is 10MB."
        )
    return await call_next(request)

app.include_router(investigate_router, prefix="/api/investigate", tags=["investigate"])

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Can be restricted to your Vercel frontend URL once deployed
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/status")
async def health_check():
    return {"system": "Active", "ai_core": "Cloud API Connected"}

for route in app.routes:
    print(f"Registered Route: {route.path} [{getattr(route, 'methods', '')}]")
