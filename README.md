# TRINETRA

**Author**: Prasad Prashant Dabhekar (B.E. Information Technology)

## Project Overview
TRINETRA is an AI-powered digital artifact forensics platform designed to aid security analysts in inspecting and dissecting suspicious digital payloads. The system focuses on localized extraction and parsing of artifacts to minimize data exposure and API payload sizes before transmitting structured indicators to large language models for threat reasoning. 

> **Technical Deep-Dive & Architecture:** For comprehensive technical specifications, detailed diagrams covering high-level system architecture, data flow, AI pipelines, investigation lifecycle, and the security model, please consult [ARCHITECTURE.md](documents/ARCHITECTURE.md).

## Core Architecture
The platform utilizes a decoupled client-server architecture:
- **Frontend Client (Tactical Analyst Workbench)**: Built with React, Tailwind CSS, and Framer Motion. It implements an asynchronous state-machine UI featuring compound ambient glassmorphism, an interactive Cybernetic Third Eye HUD, a Holographic Dossier Reveal, and a 7-stage investigation progression orchestrator for robust file staging, upload handling, and threat report rendering.
- **Backend Service (Memory-Mapped Ingestion)**: Built on FastAPI. The backend orchestrates deterministic data extraction using vector-specific Python forensic libraries before querying the AI engine. Local parsing ensures that large binary streams and non-actionable data are stripped out in memory prior to LLM inference, preventing execution risks.
- **AI Engine (Groq LPU™ Inference)**: Utilizes the Groq Tensor Streaming Processor API for sub-second reasoning. Text and JSON IOC dictionaries are analyzed by Llama-3.3-70b-versatile, while vision tasks, synthetic media analysis, and QR logo fallback decoding are processed by Llama-3.2-11b-vision-preview and Qwen 3.6 27B.

## System Architecture
```mermaid
graph TD
    %% Frontend Layer
    A[Trinetra Tactical UI <br/> React / Framer Motion / Glassmorphism] -->|Artifact Upload Stream| B(FastAPI Memory Ingestion)
    
    %% Processing Layer (Edge Deterministic Parsing)
    B --> C{Vector Parsing Engines}
    C -->|URL| D[URLEngine & Brand Typosquatting]
    C -->|Email| E[RFC 2822 / MIME & SPF/DKIM]
    C -->|PDF| F[PyMuPDF Stream & Link Extractor]
    C -->|QR Code| G[ZXing-CPP / OpenCV Matrix Decoder]
    C -->|Images| H[Local Pytesseract OCR Engine]
    
    %% AI Intelligence Layer
    D & E & F & G --> I[Groq LPU™ Cluster]
    H --> I
    I -->|Llama-3.3-70B-Versatile| J[Threat Correlation & IOC Synthesis]
    I -->|Llama-3.2-11B-Vision / Qwen 27B| J
    
    %% Output Layer
    J -->|Strict JSON Contract| K[Verdict, Threat Score & Actionable Intel]
    K -->|Render Tactical Dashboard| A
    
    classDef frontend fill:#0f172a,stroke:#06b6d4,stroke-width:2px,color:#fff
    classDef backend fill:#18181b,stroke:#a1a1aa,stroke-width:1px,color:#fff
    classDef ai fill:#000000,stroke:#f43f5e,stroke-width:2px,color:#fff
    class A,K frontend
    class B,C,D,E,F,G,H backend
    class I,J ai
```
When digital artifact payloads are uploaded via the React frontend, the FastAPI server immediately directs them to specialized Python engines that perform localized deterministic parsing and preprocessing in memory. Once the raw noise and execution hazards are stripped away, cleanly structured indicators and text streams are securely routed into Groq's Llama-3 inference models to evaluate threat metrics and return a standardized JSON verdict.

## Key Features
- **URL Intelligence & Typosquatting Detection**: Extracts domains, TLD risk scores, redirect chains, and performs Levenshtein distance typosquatting checks against high-value brand indexes.
- **Email Forensics & Social Engineering Evaluation**: Parses `.eml` and Microsoft Outlook `.msg` files to extract routing headers, verify SPF/DKIM/DMARC alignment, inspect all embedded and attached images (passing them simultaneously to Vision AI), and identify urgency-based linguistic manipulation.
- **Automated PII Masking (Data Privacy)**: A zero-trust local privacy interceptor that is permanently enforced by default. It proactively redacts sensitive Personally Identifiable Information (PII) such as Credit Card numbers (validated via the Luhn algorithm), Aadhaar numbers, and international mobile numbers from unstructured text (emails, OCR) locally before any data leaves the backend for AI inference, while strictly preserving crucial Indicators of Compromise (IOCs) like URLs, IPs, and email addresses.
- **PDF Stream Inspection & Link Unmasking**: Analyzes PDF structures directly in memory using PyMuPDF (`fitz`) to extract embedded hyperlinks, annotations, and invoice text while bypassing malicious JavaScript execution layers.
- **QR Code (Quishing) Analysis with Multi-Stage Pipeline**: Utilizes local OpenCV and `zxing-cpp` (with dark-mode bitwise-NOT matrix inversion), backed by a Groq Vision AI fallback (`Llama-3.2-11b-vision-preview`) for heavily stylized or logo-overlaid payment matrices (e.g., UPI/GPay codes). AI threat reasoning translates findings into accessible, non-technical guidance while recognizing benign transaction flows.
- **Screenshot Vision OCR & Synthetic Media Engine**: Extracts text locally via `pytesseract`, performs live keyless OSINT queries via DuckDuckGo, and evaluates visual streams using cryptographic C2PA manifests, EXIF metadata, Error Level Analysis (ELA) scores, and 2D Fast Fourier Transform (FFT) spectrum analysis to detect AI-generated synthetic artifacts and deepfake markers prior to LLM threat synthesis.
- **Multilingual Threat Reporting**: Generates diagnostic reports, threat correlations, and executive summaries in multiple target languages via dynamic backend LLM prompt instruction, while maintaining a lean, high-performance English UI that seamlessly supports browser-level translation.
- **Interactive Technical Documentation Hub**: Integrated within the system dossier (`SYSTEM.ABOUT`), featuring an interactive Bento grid where vectors expand into dark glass inspection drawers detailing technical stacks, threat metrics, and prompt strategies.
- **Defensive Error Handling (Early Return Protocol)**: Features proactive edge exception trapping that catches malformed or non-QR images and synthesizes safe schema-compliant fallback responses, eliminating UI hangs and HTTP server exceptions.
- **API Security & Rate Limiting**: Implements SlowAPI rate limiting (6 requests/minute) and strict payload size restrictions (10MB limit) via custom FastAPI middleware to prevent DDoS vectors and ensure stable cloud AI inference.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Uvicorn
- **Extraction Libraries**: `PyMuPDF` (fitz), `zxing-cpp`, `OpenCV` (cv2), `pytesseract`, `c2pa-python`, `Pillow`, `duckduckgo-search`, `extract-msg`, native Python `email` module
- **AI Integration**: Groq API (Llama-3.3-70b-versatile, Llama-3.2-11b-vision-preview, Qwen 3.6 27B)

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Tesseract OCR engine installed at the OS level
- Groq API Key

## Installation & Run Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # or
   .\venv\Scripts\activate   # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Ensure the system-level dependency for Tesseract OCR is installed prior to this step.)*
4. Configure environment variables by creating a `.env` file:
   ```
   GROQ_API_KEY=your_api_key_here
   ENVIRONMENT=development  # Set to 'production' to enable IP rate limiting
   ```
5. Run the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload --env-file .env
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

TRINETRA is containerized and optimized for edge deployment, separating the tactical React frontend from the heavy FastAPI execution layer.

### Frontend Deployment (Vercel)
The presentation layer is built with Vite and React, making it ideal for Vercel's edge network.
1. Push your frontend code to a GitHub repository.
2. Import the repository into a new Vercel project.
3. Vercel will automatically detect the Vite framework and apply the correct build command (`npm run build`) and output directory (`dist`).
4. Ensure you set your production backend API URL in the Vercel environment variables (e.g., `VITE_API_URL=https://your-railway-backend-url.com`).

### Backend Deployment (Railway / Render via Docker)
The application layer is fully containerized to ensure cross-environment determinism and execution safety.
1. Connect your backend GitHub repository to a new Railway or Render project.
2. The cloud platform will automatically detect the `Dockerfile`, install the OS-level dependencies (like Tesseract OCR and libgl1), and boot the Uvicorn worker cluster.
3. Add the following environment variables in your cloud dashboard:
   - `GROQ_API_KEY`: Your Groq LPU™ API key.
   - `ENVIRONMENT`: Set to `production` to activate SlowAPI rate-limiting.

## Attribution

TRINETRA is an original cybersecurity project developed by **Prasad Prashant Dabhekar**.

This project is released under the MIT License. You are free to use, modify,
and distribute the software in accordance with the license terms.

If you use substantial portions of the TRINETRA source code or build a
derivative project based on TRINETRA, please provide clear attribution to
the original project and author:

> TRINETRA — developed by Prasad Prashant Dabhekar

Please retain the original copyright and license notices when redistributing
substantial portions of the source code.

**GitHub Repository**: [https://github.com/prasad-sec/TRINETRA](https://github.com/prasad-sec/TRINETRA)
