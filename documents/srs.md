# Software Requirements Specification (SRS)
## Executive Summary

**Project:** TRINETRA
**Author:** Prasad Prashant Dabhekar

### 1. Purpose
The TRINETRA platform serves as an AI-powered digital artifact forensics operating system designed for security analysts and incident responders. Its primary purpose is to automate the extraction, parsing, and initial threat analysis of suspicious digital payloads (URLs, Emails, PDFs, QR Codes, and Images). By performing localized deterministic parsing in RAM prior to AI analysis, the system accelerates incident response times while mitigating payload exposure and zero-day execution risks.

> **Technical Deep-Dive Reference:** For comprehensive architecture breakdowns, data flow pipelines, investigation lifecycles, and security models, refer directly to [ARCHITECTURE.md](./ARCHITECTURE.md).

### 2. System Architecture
TRINETRA follows a modern, decoupled edge-to-intelligence architecture:
- **Presentation Layer (Tactical Client):** A React 18 web application utilizing Tailwind CSS and Framer Motion. It features an asynchronous state-machine UI, an interactive Cybernetic Third Eye HUD, a 7-stage investigation progression orchestrator, and interactive report visualization.
- **Application Layer (Memory-Mapped Server):** A FastAPI Python backend responsible for non-blocking API routing, in-memory binary validation, and coordinating specialized extraction engines without writing potentially malicious files to disk.
- **Extraction Layer (Local Core):** Dedicated Python engines utilizing `PyMuPDF` (`fitz`), `pytesseract`, `zxing-cpp`, `OpenCV`, native `email` libraries, and brand typosquatting heuristics to strip binary noise and extract pure Indicators of Compromise (IoCs).
- **Intelligence Layer (Groq LPU™ API):** Ultra-low-latency inference routing structured text and JSON IOCs to Llama-3.3-70b-versatile, and image/QR streams to Llama-3.2-11b-vision-preview and Qwen 3.6 27B for contextual threat reasoning and standardized verdict generation.

### 3. Functional Requirements

#### 3.1 System Modules (Core Forensic Workspaces)
The system must support the following core forensic workspaces and analytical modules:
1. **URL Intelligence:** Evaluate complete Uniform Resource Identifiers for TLD risk scores, domain creation heuristics, open redirects, parameter anomalies, and brand typosquatting against financial indexes.
2. **Email Forensics:** Parse `.eml` and raw email structures in memory to analyze routing headers, sender authentication (SPF/DKIM/DMARC alignment), urgency-based social engineering, embedded tracking URLs, and attachment payloads.
3. **PDF Document Inspector:** Extract text, annotations, and embedded URIs from PDF document streams without launching active execution wrappers or scripts.
4. **QR Code (Quishing) Decoder:** Employ a hybrid decoding architecture combining Stage-1 local OpenCV/ZXing-CPP matrix reading (with bitwise-NOT dark-mode inversion) and Stage-2 Groq Vision AI fallback to decode stylized or logo-overlaid matrices (e.g., GPay/UPI overlays). Provide empathetic, non-technical threat evaluations while recognizing benign payment links (`upi://pay`).
5. **Vision & Image Engine:** Perform local OCR via `pytesseract` to extract embedded textual indicators and leverage vision LLMs to detect AI-generated synthetic media, deepfake markers, and deceptive interface screenshots.
6. **Interactive Technical Documentation Hub:** Integrate an expandable inspection drawer within the tactical dossier (SYSTEM.ABOUT) allowing analysts to inspect the technical stack, threat metrics evaluated, and AI prompt strategies for each forensic vector.

#### 3.2 UI/UX Requirements & Investigation Lifecycle
- **Cybernetic Third Eye Splash Intro:** Present an immersive, custom SVG Mecha-Iris aperture emblem upon launch, synchronized to a rapid 3-second system diagnostic reveal sequence with rotating concentric astrolabe rings.
- **Tactical Digital Forensics OS Interface:** Implement an absolute dark mode (`bg-zinc-950`), compound ambient glassmorphism (`bg-zinc-950/75` with `backdrop-blur-2xl`), and sharp monospace typography for telemetry and IOC logs.
- **7-Stage Pipeline Progression Orchestrator:** The UI must provide transparent, staged feedback during investigations (*Artifact Received → Normalizing Data → Extracting Indicators → Threat Intelligence Correlation → Behavior Analysis → AI Reasoning → Investigation Report Generated*) with timed backend synchronization.

#### 3.3 Error Handling & Security Model
- **Early Return Protocol for Null Matrices:** Proactively intercept decoding exceptions when unreadable or non-QR images are submitted. Return a structurally schema-compliant JSON response (`verdict: "SAFE"`, `threat_score: 0`, null matrix notice) to prevent server HTTP exceptions and UI loading lockups.
- **In-Memory Stream Disinfection (Zero Disk Execution):** Ensure all byte stream handling occurs entirely in RAM without writing temporary payload files to disk or triggering embedded scripts.
- **Strict JSON Contract Enforcement:** All AI engine outputs must adhere strictly to a deterministic schema (`verdict`, `threat_score`, `confidence`, `executive_summary`, `ai_reasoning`, `evidence_collected`) to guarantee frontend state machine stability.

### 4. Non-Functional Requirements
- **Performance:** Local deterministic parsing operations (OCR, PDF stream reading, matrix inversion) must execute efficiently on local hardware before reaching the Groq LPU™ infrastructure to minimize API payload size and network latency.
- **Security & Data Minimization:** The platform must prevent the leakage of sensitive user documents by stripping non-actionable binary streams locally and transmitting only purified textual and structural IoCs to LLM clusters.
- **Reliability:** The UI state machine (`idle`, `staging`, `investigating`, `reasoning`, `completed`, `error`) must guarantee graceful recovery and reset loading state triggers regardless of network interruptions or malformed payloads.

### 5. Future Enhancements
- Integration of a persistent data store (e.g., PostgreSQL) for case management and historical threat tracking.
- Implementation of a localized, air-gapped LLM deployment for environments with strict data sovereignty requirements.
- Expansion of the extraction engines to support dynamic analysis of executable files (e.g., PE, ELF) and deeper archive parsing.
