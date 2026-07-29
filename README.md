# TRINETRA 👁️ 
> AI-Powered Digital Threat Investigation Platform

## Overview
TRINETRA is an AI-powered digital threat investigation platform designed to assist security analysts in rapidly dissecting suspicious digital artifacts. Rather than acting as a simple scanner or generic dashboard, TRINETRA provides a focused, intelligent Investigation Workspace that analyzes multiple threat vectors and delivers explainable AI reasoning. The system dynamically extracts actionable Indicators of Compromise (IoCs) and forensic Evidence directly from analyzed payloads, rendering them in an enterprise-grade digital investigation report.

## Architecture
The platform is built using a modern, domain-driven microservices-ready architecture:
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion (Frictionless, immersive UI with seamless CSS-driven tab navigation and animations)
- **Backend**: FastAPI (High-performance asynchronous Python framework)
- **State**: Stateless V1.0 (No database placeholders; PostgreSQL planned for V2.0)

## Directory Structure
```
Trinetra/
├── backend/            # FastAPI backend services
│   ├── ai/             # Groq-powered AI reasoning engine
│   ├── api/            # API routing and endpoints
│   ├── engines/        # Deterministic extraction and analysis engines
│   ├── schemas/        # Pydantic data validation schemas
│   └── main.py         # Application entry point
├── frontend/           # React frontend application
│   ├── src/            # Source code for UI
│   └── public/         # Static assets
├── documents/          # Project documentation
│   ├── srs.md          # Software Requirements Specification
│   └── devlogs.md      # Development logs and technical decisions
└── README.md           # This file
```

## Getting Started

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `pip install fastapi uvicorn sqlalchemy passlib[bcrypt] python-jose python-multipart pydantic-settings python-dotenv`
3. Run the development server: `python -m uvicorn main:app --reload --env-file .env`
   - The API will be available at `http://localhost:8000`
   - Swagger documentation is automatically generated at `http://localhost:8000/docs`

### Frontend Setup (V1.0 Frictionless Entry)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
   - The application will be available at `http://localhost:5173`
   - **Note**: Version 1.0 removes all authentication barriers to allow immediate, frictionless testing of the core Investigation Workspace.

## Documentation
For detailed system requirements and the V1.0 scope, refer to the [SRS Document](documents/srs.md). 
For ongoing development updates and technical decisions, check the [Development Logs](documents/devlogs.md).
