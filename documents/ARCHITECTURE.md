# TRINETRA Platform Architecture & Technical Deep-Dive

**Project:** TRINETRA — Digital Forensics & Threat Detection Architecture  
**Author:** Prasad Prashant Dabhekar  

---

## 1. Executive Summary

TRINETRA is engineered as an **AI Digital Forensics Operating System**—a unified, high-performance command platform designed to empower security analysts and incident responders with advanced, deterministic threat triage. Unlike traditional monolithic scanners that transmit unprocessed payload files across internet networks to remote APIs, TRINETRA enforces a strict, decoupled edge-to-intelligence pipeline. 

By running automated, localized parsing and binary stream disinfection across five heterogeneous threat vectors—URLs, Emails, PDFs, QR Codes (Quishing), and Vision Screenshots—the operating system extracts pure, high-signal Indicators of Compromise (IoCs) and syntactic threat features directly in memory. These refined artifacts are subsequently streamed into ultra-low-latency large language model (LLM) inference clusters to perform contextual threat correlation, linguistic social-engineering discovery, and automated forensic reasoning. The resulting output bridges the gap between deep structural cryptanalysis and intuitive, actionable cybersecurity intelligence.

---

## 2. Frontend Architecture (The Tactical Interface)

The presentation layer of TRINETRA rejects generic, commercial web design conventions in favor of a specialized **Analyst Console** design philosophy. Engineered for zero-friction operation in high-stress SOC (Security Operations Center) environments, the frontend balances aesthetic superiority with absolute structural clarity.

### 2.1 Core Technologies & Visual Framework
- **React 18 & State Machine UI:** Built on a strict asynchronous UI state machine (`idle`, `staging`, `investigating`, `reasoning`, `completed`, `error`). This ensures deterministic transitions during file drop events, stream execution, and diagnostic visualization, eliminating race conditions or inconsistent UI states during concurrent investigation flows.
- **Tailwind CSS (Analyst Console Design System):** Employs an **absolute dark mode** (`bg-zinc-950`), sharp geometric layouts, and **tactical glassmorphism** (`bg-zinc-950/75` with `backdrop-blur-2xl` and sub-pixel compound edge lighting). High-contrast **strict monospace typography** (utilizing tracking-wide letterforms for telemetry logs, hashes, and network headers) prevents misidentification of homoglyphs and malicious URLs.
- **Framer Motion & Animation Kinetics:** Hardware-accelerated animations are integrated not as aesthetic embellishment, but as cognitive state feedback. Key kinetic installations include:
  - **The Cybernetic Third Eye HUD:** A custom-engineered scalable vector graphics (SVG) assembly featuring counter-rotating concentric astrolabe rings and an animated Mecha-Iris aperture that scales open during initial diagnostic synchronization.
  - **Interactive Technical Documentation Hub:** Within the system dossier (`SYSTEM.ABOUT`), an unmounting bento grid transitions seamlessly into an expanding dark-glass inspection drawer via layout-id morphing and `AnimatePresence` state retention.
  - **Visual Telemetry:** Pulsing neon status radar emitters (`animate-ping`) and staggered kinetic entrances provide immediate visual affirmation of engine execution states.

---

## 3. Backend Pipeline (Data Ingestion & Parsing)

The application layer is powered by a **FastAPI** service engineered for non-blocking asynchronous request handling and entirely memory-mapped stream processing. To neutralize execution risks from malicious binaries (e.g., weaponized PDFs or exploit payloads), uploaded streams are digested via distinct, highly specialized Python parsing engines prior to LLM submission.

```
[ Ingested Binary Stream ] ────> [ Local Memory Validation ] ────> [ Deterministic Feature Extraction ] ────> [ Pure JSON IoC Payload ]
```

### 3.1 Vector-Specific Parsing Engines
1. **URL Intelligence (`/api/investigate/url`):**
   - **Engine:** Custom Python `URLEngine` utilizing `tldextract`, `validators`, and native `ipaddress` heuristics.
   - **Feature Extraction:** Deconstructs complete Uniform Resource Identifiers to evaluate top-level domain (TLD) risk scores, domain creation age heuristics, IP-literal routing, suspicious parameter permutations, open-redirect chains, and Levenshtein distance typosquatting against high-value financial brand indexes.
2. **Email Forensics (`/api/investigate/email`):**
   - **Engine:** Native Python `email` (RFC 2822) and MIME structure traversal parsers paired with attachment extraction pipelines.
   - **Feature Extraction:** Dissect routing header chains to verify authentication alignment (SPF, DKIM, DMARC), extract IP relay paths, and detect Return-Path vs. From header spoofing. Simultaneously decodes MIME multipart bodies to scan for linguistic urgency markers, embedded tracking URLs, and concealed quishing payloads in image attachments.
3. **PDF Document Inspector (`/api/investigate/pdf`):**
   - **Engine:** `PyMuPDF` (`fitz`) stream extractor paired with local pattern-matching regex engines.
   - **Feature Extraction:** Reads PDF binary structures directly in RAM without launching external reader execution wrappers or executing embedded JavaScript engines. Extracts embedded annotations, universal resource identifiers (URIs), hidden Javascript/OpenAction triggers, and linguistic invoice fraud text patterns (capped at optimal context thresholds).
4. **QR Code Quishing Decoder (`/api/investigate/qr`):**
   - **Engine:** Multi-stage computer vision pipeline leveraging `OpenCV` (`cv2`) and high-performance C++ bindings via `zxing-cpp`.
   - **Feature Extraction:** Stage 1 applies local image resizing, thresholding, and **bitwise-NOT matrix inversion** to reliably recover dark-mode or low-contrast barcodes. Extracts Virtual Payment Address (VPA) syntax, UPI payment parameter anomalies (`pa`, `pn`, `am`), embedded redirect shorteners, and obfuscated phishing URIs. Stage 2 triggers an intelligent vision fallback for artistic or logo-overlaid payment matrices.
5. **Vision & Synthetic Image Engine (`/api/investigate/image`):**
   - **Engine:** Local Optical Character Recognition (OCR) via `pytesseract` paired with visual context formatting.
   - **Feature Extraction:** Pre-processes image streams locally to extract dense textual indicators (e.g., within screenshot conversations or fraudulent transaction proofs). Filters raw image noise locally before routing visual context and extracted text to vision models for synthetic generative artifact analysis and threat classification.

---

## 4. AI Threat Engine (Inference Layer)

The intelligence layer decouples complex syntactic feature data from computational evaluation by routing pre-processed JSON structures directly into high-speed inference engines hosted on the **Groq Tensor Streaming Processor (LPU™)** infrastructure. This guarantees sub-second reasoning even when executing deep contextual heuristics across dense threat payloads.

### 4.1 Model Roles & Specialization
- **Primary Reasoning Model (`Llama-3.3-70B-Versatile`):** Assigned to text, network telemetry, header evaluation, and structural code analysis. It correlates extracted IoCs against deceptive framing mechanics and financial fraud archetypes, synthesizing multi-vector evidence into an objective threat score (0–100) and an executive summary formatted in clear, professional terminology.
- **Vision & Synthetic Media Engine (`Llama-3.2-11B-Vision-Preview` & `Qwen-3.6-27B`):** Activated for direct RGB tensor evaluation during image investigations and Stage-2 QR visual fallback decodes. Analyzes lighting geometry, font kerning inconsistencies, interface forgery markers, and adversarial QR logo manipulations that elude standard algorithmic barcode readers.

### 4.2 Deterministic Output Enforcement via Strict JSON Schemas
To eliminate hallucinations and ensure programmatic stability within the React UI state machine, all AI Engine invocations are governed by strict schema instruction injection and structural response enforcement. Every inference response must conform identically to the platform contract:
```json
{
  "verdict": "SAFE | SUSPICIOUS | MALICIOUS",
  "threat_score": 0,
  "confidence": 100,
  "executive_summary": "High-level summary of analysis results.",
  "ai_reasoning": "Detailed technical explanation of evaluated threat indicators.",
  "evidence_collected": {
    "indicators": ["Key threat indicator 1", "Key threat indicator 2"]
  }
}
```

---

## 5. Error Handling & Edge Cases

An operational forensic console must remain resilient against corrupted payloads, malformed data streams, and adversarial input fuzzing. TRINETRA addresses this through a defensive **Early Return Protocol** integrated across all API route endpoints and UI event listeners.

### 5.1 The Early Return Protocol for Irrelevant & Unreadable Payloads
In legacy security scanning applications, submitting an unsupported or unintelligible artifact (such as uploading a blank image or a photograph without a valid QR barcode to the QR analyzer) regularly results in backend unhandled exceptions (HTTP 400/500 errors), hanging API threads, or infinite loading loops in the user client. 

TRINETRA supersedes this via proactive edge logic:
1. **Graceful Matrix Catch (`investigate_qr_endpoint`):** When the OpenCV/ZXing-CPP engine and Vision AI fallback are unable to locate a valid QR matrix within an ingested image, the backend intercepts the decoding exception rather than returning an HTTP error code.
2. **Deterministic Safe Fallback:** The backend synthesizes a completely valid, structurally schema-compliant JSON response payload:
   ```json
   {
     "verdict": "SAFE",
     "threat_score": 0,
     "confidence": 100,
     "executive_summary": "No valid QR code was detected in the uploaded image.",
     "ai_reasoning": "The image stream was analyzed via standard optical matrix decoding and visual fallback pipelines. No machine-readable barcode or malicious quishing vector is present.",
     "evidence_collected": {
       "status": "Null QR Matrix",
       "indicators": ["No QR matrix located in payload"]
     }
   }
   ```
3. **Frontend UI Recovery Guarantee:** On the presentation layer (`QrWorkspace.jsx` and related inspection consoles), execution blocks (`try / catch / finally`) ensure that loading state triggers (`isLoading`, `setIsInvestigating`) are systematically reset to `false` regardless of network transmission interruptions or anomalies. This guarantees that the analyst interface never hangs, allowing immediate submission of subsequent artifacts without requiring manual application reloads.

---

## 6. Local Hardware & Validation Benchmarks

To verify efficiency, local deterministic parsing engines and memory-mapped validation loops have been benchmarked and verified on standard workstation hardware configurations (**AMD Ryzen 7 7445HS / NVIDIA RTX 3050 6GB / 16GB RAM**). By executing computationally expensive tasks (such as PDF OCR extraction and matrix inversion) on local CPU/GPU threads before reaching the Groq LPU™ infrastructure, TRINETRA maintains minimal bandwidth footprint and optimizes AI model context window efficiency across demanding threat hunting workflows.
