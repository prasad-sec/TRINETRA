# Software Requirements Specification (SRS)
## Executive Summary

**Project:** TRINETRA
**Author:** Prasad Prashant Dabhekar

### 1. Purpose
The TRINETRA platform serves as an AI-powered digital artifact forensics tool designed for security analysts. Its primary purpose is to automate the extraction, parsing, and initial threat analysis of suspicious digital payloads (URLs, Emails, PDFs, Images). By performing local deterministic parsing prior to AI analysis, the system accelerates incident response times while mitigating payload exposure.

### 2. System Architecture
TRINETRA follows a modern, decoupled client-server architecture:
- **Presentation Layer (Client):** A React-based web application utilizing Tailwind CSS. It features a state-machine UI for file staging, status handling, and interactive report visualization.
- **Application Layer (Server):** A FastAPI Python backend responsible for API routing, file validation, and coordinating the extraction engines.
- **Extraction Layer (Local Core):** Dedicated Python engines utilizing `PyMuPDF`, `pytesseract`, `zxing-cpp`, `OpenCV`, and native `email` libraries to strip binary data and extract raw indicators of compromise (IoCs).
- **Intelligence Layer (External API):** The Groq API routes structured text to Llama-3.3-70b-versatile and image streams to Llama-3.2-11b-vision-preview and Qwen 3.6 27B for fallback decoding, heuristic reasoning, and end-user accessible threat scoring.

### 3. Functional Requirements
The system must support the following core forensic workspaces:
1. **URL Analysis:** Accept and evaluate URLs for domain reputation, redirects, and parameter anomalies.
2. **Email Forensics:** Parse `.eml` and raw email text to analyze routing headers, sender authentication (SPF/DKIM/DMARC), and body content.
3. **PDF Scanning:** Extract text and embedded URIs from PDF documents without executing active content.
4. **QR Code (Quishing) Analysis:** Employ a multi-stage decoding architecture combining local OpenCV/ZXing-CPP matrix reading with Groq Vision AI fallback to reliably decode complex, branded, or inverted QR images. Translate technical findings into concise, non-technical guidance tailored for non-expert users while recognizing benign payment workflows (e.g., standard UPI links).
5. **Screenshot Vision OCR:** Perform local OCR on image artifacts to extract embedded text for subsequent LLM evaluation.

### 4. Non-Functional Requirements
- **Performance:** Local parsing operations (OCR, PDF extraction) must execute efficiently to minimize latency before the AI inference stage.
- **Security:** The system must not execute any uploaded payloads. All parsing must be performed safely on binary streams in memory. The system must limit the data sent to external APIs by prioritizing local extraction, preventing the leakage of full malicious binaries.
- **Reliability:** The UI must employ a strict state machine to prevent duplicate submissions, surface upload progress, and handle backend timeouts gracefully.

### 5. Future Enhancements
- Integration of a persistent data store (e.g., PostgreSQL) for case management and historical threat tracking.
- Implementation of a localized, air-gapped LLM deployment for environments with strict data sovereignty requirements.
- Expansion of the extraction engines to support dynamic analysis of executable files (e.g., PE, ELF) and deeper archive parsing.
