# Developer Logs

**Project:** TRINETRA
**Author:** Prasad Prashant Dabhekar

## [Phase 1] Initial Architecture Setup
**Objective:** Establish a decoupled, high-performance client-server foundation.
**Actions:**
- Initialized the backend using FastAPI to support asynchronous request handling and fast endpoint routing.
- Initialized the frontend using React and configured Tailwind CSS for utility-first styling.
- Defined the core API contract and CORS middleware to allow communication between the local dev server and the FastAPI server.

## [Phase 2] PDF & Email Engine Implementation
**Objective:** Implement safe, local parsing of potentially malicious binary streams.
**Actions:**
- **Email:** Integrated native Python `email` and `email.policy` modules to parse `.eml` structures safely. Implemented extraction logic for routing headers, SPF/DKIM evaluation strings, and MIME multipart iteration.
- **PDF:** Integrated `PyMuPDF` (`fitz`) to read PDF streams directly from `UploadFile` byte structures. 
- **Resolution:** Resolved FastAPI `UploadFile` byte stream handling by ensuring streams are read into memory correctly without writing temporary files to disk, mitigating local execution risks from malicious payloads.

## [Phase 3] Quishing (QR) Detection Integration
**Objective:** Enable the detection of embedded QR codes used in phishing attacks (Quishing).
**Actions:**
- Integrated `pyzbar` for deterministic QR payload extraction from image attachments and embedded PDF images.
- **Challenges:** Encountered OS-level dependency issues with the Zbar library during cross-platform testing.
- **Resolution:** Implemented robust dependency handling and documented the requirement for OS-level Zbar libraries across different deployment environments. Added a `try/except` block to gracefully handle decoding failures and missing libraries without crashing the main extraction loop.

## [Phase 4] The "Image-Spam" Optimization
**Objective:** Handle large volumes of embedded images without exhausting AI Engine context windows or hitting rate limits.
**Actions:**
- **Problem:** Forwarding every extracted image to the Groq Vision API (Qwen 3.6 27B) for analysis resulted in high latency and rapid API rate limiting.
- **Resolution:** Implemented local Optical Character Recognition (OCR) using `pytesseract`. By extracting text locally, the backend filters out image noise and only sends the raw, extracted text to the LLM (Llama-3.1-70b-versatile). This architectural pivot significantly reduced payload sizes and optimized LLM context windows.

## [Phase 5] UI/UX Standardization
**Objective:** Create a uniform, frictionless user experience for digital artifact submission.
**Actions:**
- Implemented an asynchronous state-machine UI across all workspace components (URL, Email, PDF, QR, Screenshot).
- Standardized drag-and-drop zones using React refs and event listeners.
- Integrated Lucide Icons to provide consistent visual feedback for upload states (idle, uploading, parsing, error, success).
- **Result:** A cohesive interface that prevents race conditions during file uploads and gracefully handles API state transitions.

## [Phase 6] Multi-Stage QR (Quishing) Pipeline & End-User AI Tuning
**Objective:** Resolve QR decoding failures caused by stylized payment logos (e.g., GPay/UPI overlays) and produce empathetic, non-technical threat evaluations.
**Actions:**
- **Hybrid Extraction Architecture:** Upgraded from legacy Zbar bindings to a multi-stage decoding pipeline in `investigate_qr_endpoint`. Stage 1 leverages `OpenCV` and `zxing-cpp` for local determinism (with standard and dark-mode matrix inversion). Stage 2 introduces an intelligent fallback via Groq Vision AI (`llama-3.2-11b-vision-preview`) when artistic elements or logos obscure the barcode matrix.
- **End-User Focused Threat Reasoning:** Engineered domain-aware prompt directives for `Llama-3.1-70b-versatile` to speak directly to everyday users in accessible language. Standardized recognition of benign UPI payment links (`upi://pay`) and typical tracking parameters to eliminate false alarm fatigue during everyday transactions.
- **Bulletproof Data Mapping & Schema Consistency:** Standardized dictionary mapping in the backend to guarantee fallbacks for critical UI reporting keys (`executive_summary`, `ai_reasoning`, and nested `evidence_collected`).

## [Phase 7] Tactical OS Interface Overhaul, Pipeline Orchestrator & QR Error Handling Protocol
**Objective:** Execute a comprehensive visual and architectural upgrade to establish a Digital Forensics OS aesthetic, implement real-time pipeline telemetry orchestration, and harden backend exception handling against unreadable artifact payloads.
**Actions:**
- **UI/UX Overhaul (Tactical Glassmorphism):** Purged generic web design trends in favor of an immersive AI-Powered Digital Forensics Platform interface. Engineered a high-impact 'Tactical System Dossier' About modal with compound ambient glassmorphism (`bg-zinc-950/75` with backdrop-blur-2xl), interactive spotlight card hover glows in a 5-vector Bento grid, and an expandable 'Interactive Technical Documentation Hub' deep-dive drawer powered by Framer Motion.
- **Cybernetic Third Eye Splash Intro & Telemetry HUD:** Replaced the legacy breathing triangle with a custom SVG Mecha-Iris aperture and rotating concentric HUD rings synchronized to a snappier 3-second system diagnostic reveal sequence. Refactored investigation navigation tabs for a compact, sharp cybersecurity footprint.
- **7-Stage Investigation Pipeline Orchestrator:** Designed and integrated a real-time visual pipeline progression orchestrator across all analytical workspaces (*Artifact Received → Normalizing Data → Extracting Indicators → Threat Intelligence Correlation → Behavior Analysis → AI Reasoning → Report Generated*). Engineered minimum duration sync logic to ensure smooth transitions and cognitive analyst verification before dashboard rendering.
- **QR Module Bug Fix & Error Handling (Early Return Protocol):** Resolved a frontend UI freeze and backend HTTP 400 exception when analyzing non-QR images. Implemented the Early Return Protocol in `investigate_qr_endpoint` to catch decode failures and return a standardized JSON payload (`verdict: "SAFE"`, `threat_score: 0`) explaining that no valid QR matrix was detected, guaranteeing zero UI lockups or thread hangs.
- **Documentation Suite & Deep-Dive Architecture Alignment:** Updated core platform documentation (`README.md`, `srs.md`, and `devlogs.md`) under primary developer Prasad Prashant Dabhekar, integrating explicit cross-references to [ARCHITECTURE.md](./ARCHITECTURE.md) for exhaustive technical specifications, high-level system architecture, data flow diagrams, and security models.
- **Performance & Hardware Benchmark Note:** Local parser testing, deterministic extraction loops, and in-memory validation successfully handled and verified on local workstation hardware configuration (**AMD Ryzen 7 7445HS / NVIDIA RTX 3050 6GB / 16GB RAM**) before routing structured IOC payloads to Groq LPUs.

## [Phase 8] Cryptographic Metadata & Synthetic Image Forensics Optimization
**Objective:** Harden the platform against AI-generated deepfakes and manipulated synthetic media while upgrading the core reasoning engine.
**Actions:**
- **Cryptographic Provenance:** Integrated `c2pa-python` to extract cryptographic Content Credentials (C2PA manifests) from image payloads to deterministically flag AI generation.
- **Error Level Analysis (ELA):** Implemented ELA computation using `Pillow` to detect synthetic composite blending, image splicing, and post-processing manipulation.
- **EXIF Extraction & Filtering:** Extracted and filtered EXIF camera metadata to provide origin context without blowing out LLM context windows.
- **4-Step Forensic Audit Integration:** Upgraded the Vision AI threat prompts in `/api/investigate/image` with a mandatory 4-Step Forensic Audit (Corner Watermark Scan, Geometric Audit, Deception Audit, Hybrid Asset Rule) to mandate strict structural anomaly reporting.
- **Engine Upgrade:** Migrated the primary threat reasoning engine from Llama 3.1 to `Llama-3.3-70b-versatile` across the backend endpoints to leverage improved instruction following and complex heuristic evaluation. 

## [Phase 9] Tactical Dossier Reveal & Vision AI Refinements
**Objective:** Enhance the user interface with staggered kinetic animations for the investigation report and refine the Vision AI reasoning pipeline.
**Actions:**
- **Holographic Dossier Reveal:** Implemented a custom CSS keyframe animation (`dossierReveal`) with 3D transform delays (`perspective`, `rotateX`) across the report dossier entries, creating a staggered, holographic cascading entrance for the threat intelligence dashboard.
- **Vision AI Pipeline Refinement:** Updated the prompt and reasoning pipeline for image investigation to improve threat classification and reporting accuracy.

## [Phase 10] Rate Limiting & Security Hardening
**Objective:** Protect the backend API and AI inference quotas from volumetric attacks and Out-Of-Memory (OOM) faults.
**Actions:**
- **Rate Limiting:** Implemented SlowAPI limits (`6/minute` per IP address) across all five investigation endpoints to prevent rapid-fire DoS vectors against the cloud AI pipeline.
- **Payload Restrictions:** Engineered a Starlette HTTP middleware layer to preemptively validate `content-length` and enforce a strict 10MB upload limit before mapping payload streams to volatile memory.
- **CORS Hardening:** Hardened the API CORS configuration in `main.py` to accept only authorized methods (`GET`, `POST`, `OPTIONS`).

## [Phase 11] Deployment-Safe Recursive Bridge & Keyless OSINT
**Objective:** Harden the platform for public cloud deployment by preventing memory crashes and bypassing paid API rate limits.
**Actions:**
- **Recursive Artifact Extraction Bridge:** Upgraded the PDF and Email parsers to act as orchestrators. They now recursively extract embedded images, downsample them to 800x800 pixels to prevent server Out-Of-Memory (OOM) faults on low-RAM cloud instances, and route them through internal FFT/ELA sensors.
- **Keyless OSINT Integration:** Replaced the phone-verified SerpApi with duckduckgo-search, injecting live, rate-limit-free web context into the Groq Vision LLM prompt.
- **Environment-Aware Security:** Upgraded the SlowAPI rate limiter to read the .env ENVIRONMENT variable, allowing unrestricted local testing while enforcing strict 6-request/minute limits in production.

## [Phase 12] Multilingual Support & Report Localization
**Objective:** Allow analysts to generate threat reports in their preferred language to support global security teams.
**Actions:**
- **Frontend Localization State:** Introduced a `reportLanguage` state in the `LivingDashboard` and propagated it down to all workspace components (Email, PDF, QR, Image, URL).
- **Backend Translation Routing:** Added `target_language` parsing to the FastAPI endpoints, appending this directive to the AI reasoning prompts.
- **Schema-Safe Translation:** Instructed the Groq LPU models to localize the `executive_summary` and `ai_reasoning` narrative while maintaining strict JSON keys and keeping technical indicators (IoCs) intact.

## [Phase 13] UI Styling Sweep & Translation Simplification
**Objective:** Perfect the tactical aesthetic across all components and streamline localization.
**Actions:**
- **Standardized Tactical Cards:** Swept all workspace and report panels to enforce a unified glassmorphism aesthetic (`bg-zinc-950/70`, `backdrop-blur-md`, `border-cyan-500/20` with bright hover transitions) and soft `rounded-xl` corners.
- **Unified Headings & Grid Symmetry:** Standardized all sub-headings to `text-cyan-400 font-mono tracking-wider` and ensured responsive `grid-cols` layout proportions in the report dashboard.
- **Tactical Loading State:** Upgraded the loading screens with an immersive, pulsing cyan radar animation ("AI Core Processing Vector...").
- **Localization Lean-Down:** Removed the custom frontend translation library (`react-i18next`) to minimize bundle size. The UI now relies on standard English text and browser-level translation, while the backend API strictly manages dynamic translation of the AI forensic reports via the `target_language` parameter.
## [Phase 14] Email Multi-Image Extraction Bug Fix
**Objective:** Ensure the email parsing engine correctly handles multipart containers and extracts all images for Vision AI processing.
**Actions:**
- **Parser Optimization:** Fixed an extraction bug in /api/investigate/email where the msg.walk() loop was failing to explicitly skip multipart container wrappers, preventing multiple inline and attached images from being correctly decoded and appended.
- **Vision Integration:** Verified that the updated parser now passes the complete array of extracted images simultaneously into the Llama 3.2 Vision payload for unified threat analysis.
- **Frontend Alignment:** Ensured the AIInvestigationResult.jsx dynamic grid properly maps over the extracted images array, correctly rendering all malicious or embedded visual artifacts in the report UI.

## [Phase 15] Command Bridge Modernization, Dynamic Telemetry & Triad Terminal Modals
**Objective:** Elevate the command bridge navbar from static text to a live telemetry interface, and unify all navigation modal overlays into an architecturally consistent, multi-colored tactical terminal system.
**Actions:**
- **Dynamic AI Core Telemetry (`AiCoreStatus.jsx`):** Replaced the hardcoded online text with an active React state component tracking `navigator.onLine` via window event listeners. Dynamically renders `AI CORE: ONLINE` (emerald-400 with a pulsing shadow glow `shadow-[0_0_10px_rgba(52,211,153,0.6)]`) or `AI CORE: OFFLINE` (rose-500 with a rose shadow glow `shadow-[0_0_10px_rgba(225,29,72,0.6)]`) while retaining strict uppercase monospace tracking.
- **Interactive Reasoning Groq Engine Modal (`ReasoningGroqModal.jsx`):** Transformed the static `Reasoning Groq` header item into an interactive trigger button matching `System About` and `Privacy Shield`. Displays hardware specifications, LPU architecture details, active model parameters (Llama-3.3-70B-Versatile), sub-second latency metrics, and Zero Data Retention (ZDR) policy.
- **Structural Synchronization with About Hologram:** Refactored both `PrivacyShieldModal` and `ReasoningGroqModal` to adopt the wide `max-w-4xl` skeleton, high-opacity backdrop (`bg-black/90 backdrop-blur-md`), dark glass panel (`bg-[#0a0f18]/95`, `border-cyan-500/30`, subtle inner glow), top cyan gradient accent, cyber sheen mount sweep, and a top-right `[ESC]` close button with red hover styling paired with global keyboard `Escape` event listeners.
- **Semantic Accent Color Palette (Breaking Monochrome Cyan):** Overhauled terminal sub-cards to feature distinct cybernetic colors:
  - *Reasoning Groq*: Emerald Green for Processor Architecture (Groq LPU), Purple/Violet for Active Reasoning Model (Llama-3.3-70B), and Amber/Gold for Inference Latency (Sub-second).
  - *Privacy Shield*: Rose/Crimson for Payment Cards (Luhn Validation), Sky/Cyan for Phone & Contact Numbers (E.164 Regex), and Amber/Yellow for Government Identifiers (Aadhaar / SSN).
  - *Glassmorphism Depth*: Added `bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-md`, colored pill badges, and kinetic `hover:scale-[1.01]` transitions.
- **Command Bridge Alignment (`LivingDashboard.jsx`):** Integrated `<AiCoreStatus />` and `<ReasoningGroqModal />` into the central command bridge header with vertical rule separators, completing the triad of forensic inspection overlays.

## [Phase 16] Cloud Deployment Hardening & Enterprise Documentation Synchronization
**Objective:** Resolve all cloud deployment bottlenecks, centralize API routing, harden CORS policies, and synchronize enterprise documentation across the repository.
**Actions:**
- **Dynamic API Resolver (`frontend/src/config/api.js`):** Centralized base URL resolution via `import.meta.env.VITE_API_URL` with automatic local fallback (`http://localhost:8000`). Refactored all 5 workspace components (`InvestigationWorkspace.jsx`, `EmailWorkspace.jsx`, `PdfWorkspace.jsx`, `QrWorkspace.jsx`, `ImageWorkspace.jsx`) to eliminate hardcoded localhost endpoints.
- **Enterprise CORS Hardening (`backend/main.py`):** Expanded CORS middleware to dynamically ingest `ALLOWED_ORIGINS` from environment variables, while adding native regex matching (`https://.*\.vercel\.app`) for zero-config support of Vercel production and preview deployment domains.
- **Environment Configuration Templates:** Created `.env.example` templates in both `backend/` and `frontend/` documenting all required and optional runtime flags (`GROQ_API_KEY`, `ENVIRONMENT`, `ALLOWED_ORIGINS`, `PORT`, `VITE_API_URL`).
- **SPA Edge Routing Rewrite (`frontend/vercel.json`):** Configured standard client-side routing rewrites for edge hosting on Vercel, Netlify, and Cloudflare Pages.
- **Automated Verification:** Verified that backend Pytest passes with 100% success (4 tests in 2.49s) and Vite production bundle compiles cleanly with 0 errors in 1.19s. Synchronized `README.md`, `ARCHITECTURE.md`, `SRS.md`, `SECURITY.md`, and `API_DOCS.md`.

## [Phase 17] Image Investigation Pipeline Optimization & UI Hallucination Defense
**Objective:** Eliminate server timeouts on constrained free-tier architecture (0.1 vCPU) from heavy OCR/OSINT operations and eliminate detection blindspots where AI-generated UI screenshots bypass mathematical forensic sensors.
**Actions:**
- **Asynchronous LLM Inference Migration:** Replaced the two synchronous Groq completions in `/api/investigate/image` with the unified asynchronous `ai_engine.client.chat.completions.create(...)` instance and eliminated redundant local Groq client instantiations.
- **Threaded Tesseract OCR (`run_in_threadpool`):** Offloaded synchronous CPU-bound `pytesseract.image_to_string` execution to dedicated worker threads via Starlette `run_in_threadpool`, preventing event-loop starvation and unblocking concurrent request handling during heavy matrix parsing.
- **Keyless OSINT Query Truncation & Resilient 5s Timeout:** Truncated dense extracted OCR text down to the first 15 words (`" ".join(ocr_text.split()[:15])`) before web querying, and wrapped DuckDuckGo lookups in a strict 5-second asynchronous timeout (`asyncio.wait_for(...)`) with `DDGS(timeout=5)`. Gracefully returns `"OSINT Timeout Exceeded"` on hangs, leaving the server responsive.
- **Step 2 Forensic Audit Enhancement (UI & Monospace Typography):** Expanded Step 2 (Structural & Geometric Audit) in the `threat_prompt` with heuristics targeting AI software screenshots: garbled words, nonsensical UI tabs (e.g., "PUTE", "Cookqérues"), melting/overlapping panels, non-hexadecimal characters in hash IDs, and distorted port numbers/routes. Mandates immediate `"AI-GENERATED"` classification regardless of flat FFT/ELA scores.
- **Verification:** Verified backend compilation (`py_compile`) and test suite integrity across endpoints.

## [Phase 18] Event-Loop Concurrency Optimization & Vision API Compatibility
**Objective:** Resolve event-loop blocking from mathematical signal processing and external HTTP requests, and prevent 400 Bad Request errors caused by routing base64 images to text-only LLMs.
**Actions:**
- **Threaded FFT Execution (`run_in_threadpool`):** Wrapped `compute_fft_anomaly(file_bytes)` in Starlette's `run_in_threadpool` (`fft_result = await run_in_threadpool(compute_fft_anomaly, file_bytes)`), offloading NumPy 2D FFT matrix transformations from the main thread.
- **Threaded IP Geolocation Lookups (`run_in_threadpool`):** Offloaded synchronous `requests.get` calls inside `analyze_email`'s Received header parsing loop (`geo_location = await run_in_threadpool(get_ip_geolocation, ip)`), ensuring third-party IP geolocation API network latency never halts the asyncio event loop.
- **Vision Model API Alignment (`llama-3.2-11b-vision-preview`):** Updated base64 multimodal image ingestion in both `/api/investigate/qr` (Stage 2 Groq Vision fallback) and `/api/investigate/image` (Stage 1 Vision AI) from text-only `qwen/qwen3.8-27b` to `llama-3.2-11b-vision-preview`. Preserved Qwen 3.8 27B for downstream text-only threat analysis and JSON reporting.
- **Verification:** Successfully compiled `backend/api/investigate.py` with zero syntax errors.




