# Development Logs (DevLogs) - TRINETRA

This document serves as a continuous record of technical decisions, architecture updates, and development progress for the TRINETRA platform.

## [Phase 1] - Initial Backend Foundation
**Author:** Prasad Prashant Dabhekar (Admin)

### Progress:
- **Repository Initialization**: Organized the mono-repo structure separating `frontend` and `backend`.
- **Backend Foundation**:
  - Implemented the FastAPI core application.
  - Established a strict domain-driven structure (`auth/`, `models/`, `database/`).
  - Configured SQLAlchemy with SQLite for the initial development phase.
  - Implemented the `User` model with `username`, `email`, `hashed_password`, and `role`.
  - Added JWT-based authentication using `python-jose` and `passlib[bcrypt]`.
  - Created an automatic startup event to provision an initial `admin` account if none exists.
- **Documentation**: Formatted enterprise README and established the `documents` structure.

### Technical Decisions & Notes:
- **Architecture**: Chosen FastAPI for its async capabilities, performance, and automatic OpenAPI documentation.
- **Auth Strategy**: Stateless JWT is used to easily scale the backend horizontally in the future without session stores.

## [Phase 2] - V1.0 Product Direction Shift & Frontend Refactor
**Author:** AI Development Assistant

### Progress:
- **Authentication Removal**: Stripped the React frontend of all JWT and login requirements to ensure a frictionless V1.0 testing experience.
- **Dashboard Simplification**: Removed mock enterprise data (history, organizations, threat maps) to focus purely on the active investigation.
- **Investigation Workspace**: Transitioned terminology from "Scanner" to "Investigation Workspace". Built a multi-vector tab system (URL, Email, PDF, QR, Image) with a realistic processing pipeline.
- **Explainable AI Integration**: Created a dedicated `AIInvestigationResult` component that provides a clean summary (Threat Score + AI Confidence) before allowing the user to drill down into a comprehensive, terminal-style AI reasoning report.
- **Layout Fixes**: Adjusted the main layout wrapper to correctly utilize `flex-1 overflow-y-auto` for smooth vertical scrolling across the workspace.

### Technical Decisions & Notes:
- **V1.0 Focus**: We made a deliberate philosophical shift to emphasize the "AI Investigator" feel. Enterprise features like RBAC and History databases are deferred to the Enterprise Edition so that V1.0 can showcase a highly polished core investigation flow.

## [Phase 3] - Live API Integration & Bug Fixes
**Author:** AI Development Assistant

### Progress:
- **Live API Integration**: Replaced the frontend simulated processing loop with a live `fetch` to `POST /api/v1/investigate/url`.
- **UI Validations**: Added URL/IP validation logic with clean inline error handling on the Investigation Workspace.
- **Dynamic AI Reporting**: Re-architected `AIInvestigationResult` to ingest live server responses (threat_score, severity, AI reasoning, IOCs) and implemented a toggleable "Close Report" (✕) capability to return to the executive summary view.
- **Backend Fixes**: Solved the `GROQ_API_KEY` environment variable crash by installing `python-dotenv` and executing the FastAPI server with `uvicorn main:app --reload --env-file .env`.

### Technical Decisions & Notes:
- **Environment Management**: Utilizing `--env-file` with Uvicorn standardizes local development secrets without changing application code.

## [Phase 4] - Production Readiness & Stateless V1.0
**Author:** AI Development Assistant

### Progress:
- **Architecture Simplification**: Transitioned V1.0 strictly to a stateless AI analysis engine. Deleted all database placeholders (`database/`, `auth/`, `models/`) to eliminate dead code and prepare a pristine foundation for PostgreSQL in V2.0.
- **AI Improvements**: Instructed the Groq-powered AI engine to generate specific threat categories and context-aware recommended mitigation strategies based on artifact data, replacing generic placeholder responses.
- **Frontend Polish**: Implemented dynamic severity-based UI styling (Neon Red/Orange/Green) for immediate visual triage. Removed obsolete dashboard and UI components.
- **Repository Cleanup**: Established a comprehensive root `.gitignore`, wiped all generated files, and validated imports to ensure a professional, GitHub-ready mono-repo structure.

### Technical Decisions & Notes:
- **Stateless V1.0**: By intentionally deleting database placeholders, we reduce technical debt, prevent confusion for open-source contributors, and guarantee that the V1.0 release correctly mirrors its intended scope: a lightweight, robust, and frictionless AI investigation engine.

## [Phase 5] - Enterprise Digital Investigation Report & Dynamic Extraction
**Author:** AI Development Assistant

### Progress:
- **Frontend Structural Overhaul**: Refactored `AIInvestigationResult.jsx` into a highly polished, 11-section enterprise digital investigation report mimicking professional cybersecurity layouts with distinct focus on safe factual boundaries (never hallucinating missing metrics or fallback recommendations).
- **Backend Pydantic Upgrades**: Expanded `InvestigationReport` in `investigation.py` and `reasoning.py` to strongly type `evidence_collected`, `indicators_of_compromise`, `confidence_explanation`, and `investigation_conclusion`.
- **Intelligent Prompt Engineering**: Updated the system prompt to explicitly break the AI out of a stuck 96% confidence score pattern using mathematically bounded percentage rules.
- **Dynamic Extractions**: Enforced strict rules for the LLM to actively extract Evidence (Protocol, TLD) and correctly map clustered Indicators of Compromise directly out of analyzed URLs and payloads.

### Technical Decisions & Notes:
- **Data Integrity**: Both backend schema output mapping and frontend UI conditional rendering ensure zero placeholders exist; if a URL returns no explicit IoCs, the report dynamically handles it rather than generating mock components.

## [Phase 6] - UX Polish & UI Flow Perfection
**Author:** AI Development Assistant

### Progress:
- **EmailWorkspace Loading Sequence**: Refactored the `EmailWorkspace` component to handle its own explicit loading states, completely eliminating flashes of dummy data. Correctly sequenced state unmounting (`setReportData(null)` before loading triggers) to ensure clean transitions.
- **Frictionless Tab Transitions**: Integrated Framer Motion and Tailwind CSS `animate-in fade-in` animation properties seamlessly into the URL, Email, and Drop workspace wrapper containers.
- **Parent Tab Remounting Strategy**: Leveraged React's `key` prop dynamically bound to the `activeTab` state to force unmount/remount cycles during tab navigation, ensuring the fade-in animations trigger predictably and consistently across all workspace switches.

### Technical Decisions & Notes:
- **Deterministic UI Flow**: By clearing old dummy report data prior to initiating the "Investigating" UI state, we guarantee that async racing conditions won't accidentally flash a "Safe" verdict while awaiting the new server response.

## [Phase 7] - Advanced UI State Management & Timing Locks
**Author:** AI Development Assistant

### Progress:
- **PdfWorkspace UX Upgrade**: Replaced the automatic file upload mechanism in `PdfWorkspace.jsx` with a robust two-step staging process. Users now select a file, review the staged artifact (with dynamic file size formatting in KB/MB), and explicitly trigger the "Begin Investigation" action.
- **Master Timing Lock**: Discovered and resolved an edge case where near-instant in-memory API responses (e.g., PDF extraction) bypassed the frontend's visual storytelling. Implemented a centralized `handleAnalysisComplete` timing lock in the parent `InvestigationWorkspace.jsx`. This lock intercepts all API responses and enforces a strict minimum 4000ms display time for the global scanning animation, ensuring users experience the complete threat intelligence correlation sequence regardless of backend response speed.
- **Global Animation Synchronization**: Propagated the `setEyeStatus` and `setIsInvestigating` state-lifting props explicitly into the PDF and Email workspaces to ensure that the centralized Holographic Eye triggers synchronously with localized workspace events.

### Technical Decisions & Notes:
- **Storytelling over Raw Speed**: In a cybersecurity investigation platform, the *perception* of deep analysis is crucial for user trust. By enforcing a minimum animation time, we prevent the UI from flashing disruptively and maintain the immersive "investigation" experience, even when the backend executes tasks sub-second.

## [Phase 8] - Investigation State Machine & Animation Orchestrator
**Author:** AI Development Assistant

### Progress:
- **Unified State Machine**: Replaced loosely coupled boolean loading flags across the frontend with a strict state machine (`idle`, `investigating`, `reasoning`, `completed`, `error`) within `InvestigationWorkspace.jsx`.
- **Pipeline Progression Controller**: Implemented a `useEffect`-driven orchestrator that automatically progresses the visual investigation pipeline across 6 distinct correlation stages, ensuring it pauses at "AI Reasoning" if the backend is still processing.
- **Minimum Visible Duration Lock**: Refined the backend synchronization logic to enforce a minimum visible duration of 1200ms for the investigation animations, independently of the FastAPI response speed.
- **Dynamic AI Eye Synchronization**: Updated `AIAssistantEye.jsx` to respond natively to the state machine (including a new `suspicious` amber state and distinct `thinking`/`reasoning` animations).
- **Graceful Transitions**: Utilized Framer Motion's `AnimatePresence (mode="wait")` to completely eliminate UI flicker, remount flashes, and layout shifts when transitioning from the active investigation pipeline to the final rendered report.
- **Email & PDF Workspace Polish**: Refactored both workspaces to act as pure staging views. They now remain visibly locked in their "Investigating..." states without improperly resetting themselves mid-transition.

### Technical Decisions & Notes:
- **Cinematic Experience**: By decoupling the visual storytelling pipeline from the literal API resolution (while still ensuring it never completes *before* the API does), we guarantee the user experiences a believable, immersive AI digital forensics workflow without artificially slowing down the backend execution.