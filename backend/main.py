from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import investigate

app = FastAPI(title="TRINETRA API", version="1.0")

app.include_router(investigate.router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/status")
async def health_check():
    return {"system": "Active", "ai_core": "Cloud API Connected"}
