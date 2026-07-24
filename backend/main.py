from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.core import Base, engine, SessionLocal
from models.user import User
from auth import login
from auth.jwt import get_password_hash
from api import investigate

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Check if admin user exists, if not create one
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            new_admin = User(
                username="admin",
                email="admin@trinetra.local",
                full_name="Prasad Prashant Dabhekar",
                hashed_password=get_password_hash("SecurePassword123!"),
                role="admin",
                is_active=True
            )
            db.add(new_admin)
            db.commit()
    finally:
        db.close()
        
    yield

app = FastAPI(
    title="TRINETRA API",
    description="Enterprise Digital Threat Investigation Platform",
    lifespan=lifespan
)

# Configure CORS for localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router
app.include_router(login.router)

# Include Investigation Router
app.include_router(investigate.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to TRINETRA API"}
