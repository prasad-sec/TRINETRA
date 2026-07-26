# Software Requirements Specification (SRS) - TRINETRA

## 1. Introduction
### 1.1 Purpose
This document specifies the software requirements for TRINETRA, an Enterprise Digital Threat Investigation Platform. It is intended for developers, project managers, and stakeholders to understand the scope and capabilities of the platform.

### 1.2 Scope (V1.0 Focus)
TRINETRA is designed to assist security analysts in investigating digital threats using explainable AI. The platform provides a unified interface to ingest, correlate, and analyze threat data. V1.0 focuses strictly on a frictionless, single-user core investigation experience without enterprise overhead.

## 2. Overall Description
### 2.1 User Roles
- **V1.0 Analyst**: Single frictionless user. No authentication or RBAC is required in V1.0 to allow immediate product testing.
- *(Enterprise Edition will introduce Admin, Analyst, and Viewer roles)*

### 2.2 Functional Requirements (V1.0)
- **Frictionless Entry**: Direct access to the dashboard from a cinematic splash screen.
- **Investigation Workspace**: A central hub supporting multiple threat vectors (URL, Email, PDF, QR, Image).
- **Realistic Pipeline Flow**: Visual representation of the investigation process (Receiving, Parsing, AI Reasoning, etc.).
- **Enterprise Digital Investigation Report**: Detailed investigation summaries including Threat Score, AI Confidence, and detailed reasoning (not just binary safe/malicious). AI Confidence is bounded by strict mathematical rules (e.g., verified brands score 97-99) to ensure realistic certainty measurement.
- **Dynamic Extraction of IoCs and Evidence**: The backend AI intelligently and dynamically extracts specific factual metadata and Indicators of Compromise (IoCs) straight from the artifact, rendering them conditionally if threats are found.
- **Dynamic Threat Categorization**: AI dynamically categorizes threats based on the specifics of the analyzed artifact.
- **Context-Aware Recommendations**: The AI engine provides customized, artifact-specific mitigation strategies rather than generic advice.
- **Dynamic UI Feedback**: The interface provides immediate visual triage through severity-based conditional styling (Critical: Neon Red, Warning: Neon Orange, Safe: Neon Green).

### 2.3 Non-Functional Requirements
- **Performance**: The API should respond swiftly for standard queries.
- **Scalability**: The backend (FastAPI) should be capable of horizontal scaling.
- **Security**: Focus on application integrity. (Auth and RBAC deferred to Enterprise).
- **Reliability**: High uptime target for the core investigation API.

## 3. System Architecture
TRINETRA employs a modern, decoupled architecture:
- **Frontend**: React (Vite) with Framer Motion and Tailwind CSS
- **Backend API**: FastAPI (Python)
- **State**: Stateless Design (V1.0 uses no database placeholders, preparing for PostgreSQL in V2.0)

*(This document will be iteratively updated as the project evolves.)*
