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
- **Resolution:** Implemented local Optical Character Recognition (OCR) using `pytesseract`. By extracting text locally, the backend filters out image noise and only sends the raw, extracted text to the LLM (Llama-3.3-70b-versatile). This architectural pivot significantly reduced payload sizes and optimized LLM context windows.

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
- **End-User Focused Threat Reasoning:** Engineered domain-aware prompt directives for `Llama-3.3-70b-versatile` to speak directly to everyday users in accessible language. Standardized recognition of benign UPI payment links (`upi://pay`) and typical tracking parameters to eliminate false alarm fatigue during everyday transactions.
- **Bulletproof Data Mapping & Schema Consistency:** Standardized dictionary mapping in the backend to guarantee fallbacks for critical UI reporting keys (`executive_summary`, `ai_reasoning`, and nested `evidence_collected`).