# TRINETRA API Documentation (Developer Reference)

Welcome to the TRINETRA API developer reference. This document provides the necessary information to interact with the backend forensics engine programmatically.

## General Information

- **Base API URL**: `/api/investigate` (Usually hosted on `http://127.0.0.1:8000` or your cloud domain).
- **Payload Limit**: A strict `10MB` limit is enforced on all artifacts to prevent memory exhaustion.
- **Rate Limiting**: To prevent DDoS and ensure API stability, a SlowAPI rate limit of **6 requests per minute** per IP is enforced in production.
- **Headers**: Most endpoints that require file uploads must use `multipart/form-data`. Others may accept JSON `application/json`.

---

## 1. URL Analysis (`/url`)

Evaluates URLs for typosquatting, redirect chains, and malicious behavior.

- **Endpoint**: `/api/investigate/url`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Schema
```json
{
  "url": "http://example-suspicious-domain.com"
}
```

### Response Schema
```json
{
  "status": "success",
  "url": "http://example-suspicious-domain.com",
  "threat_score": 85,
  "verdict": "MALICIOUS",
  "indicators": ["typosquatting detected", "redirect chain masked"],
  "ai_reasoning": "The URL exhibits characteristics of a phishing attempt targeting a major brand..."
}
```

### Example `curl`
```bash
curl -X POST "http://127.0.0.1:8000/api/investigate/url" \
     -H "Content-Type: application/json" \
     -d '{"url": "http://suspicious.com"}'
```

---

## 2. Email Forensics (`/email`)

Parses `.eml` files to extract routing headers, perform non-blocking threaded IP geolocation resolution across Received hops (`run_in_threadpool`), verify SPF/DKIM/DMARC alignment, inspect embedded images, and evaluate linguistic manipulation.

- **Endpoint**: `/api/investigate/email`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Accepted Artifacts**: `.eml` files

### Example `curl`
```bash
curl -X POST "http://127.0.0.1:8000/api/investigate/email" \
     -H "accept: application/json" \
     -F "file=@/path/to/suspicious.eml;type=message/rfc822"
```

---

## 3. PDF Stream Inspection (`/pdf`)

Analyzes PDF structures directly in memory to extract embedded hyperlinks and text without executing JavaScript.

- **Endpoint**: `/api/investigate/pdf`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Accepted Artifacts**: `.pdf` files

### Example `curl`
```bash
curl -X POST "http://127.0.0.1:8000/api/investigate/pdf" \
     -H "accept: application/json" \
     -F "file=@/path/to/invoice.pdf;type=application/pdf"
```

---

## 4. QR Code (Quishing) Analysis (`/qr`)

Decodes and evaluates QR matrices (including stylized or logo-overlaid variants) using localized OpenCV processing with Stage-2 Vision AI fallback (`llama-3.2-11b-vision-preview`) for base64 image decoding and `qwen/qwen3.8-27b` for threat classification.

- **Endpoint**: `/api/investigate/qr`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Accepted Artifacts**: `.png`, `.jpg`, `.jpeg`

### Example `curl`
```bash
curl -X POST "http://127.0.0.1:8000/api/investigate/qr" \
     -H "accept: application/json" \
     -F "file=@/path/to/qrcode.png;type=image/png"
```

---

## 5. Screenshot / Image Vision OCR (`/image`)

Evaluates visual streams using cryptographic C2PA manifests, EXIF metadata, Error Level Analysis (ELA), threaded 2D Fast Fourier Transform (FFT) spectrum analysis (`run_in_threadpool`), threaded Tesseract OCR, and resilient keyless DuckDuckGo OSINT (with 15-word query truncation and a strict 5s timeout). Employs multimodal `llama-3.2-11b-vision-preview` for Stage 1 base64 visual analysis and `qwen/qwen3.8-27b` for Stage 2 threat reasoning.

- **Endpoint**: `/api/investigate/image`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Accepted Artifacts**: `.png`, `.jpg`, `.jpeg` (Max 10MB)
- **Form Parameters**:
  - `file`: Image binary (`UploadFile`, required)
  - `target_language`: Preferred language for executive summary and AI reasoning (string, optional, default: `"English"`)

### Response Schema
```json
{
  "status": "success",
  "investigation_type": "image",
  "extracted_text": "Extracted text content from OCR...",
  "qr_payloads": ["https://example.com/payload"],
  "ai_analysis": {
    "verdict": "SAFE | SUSPICIOUS | MALICIOUS",
    "threat_score": 0,
    "confidence": 95,
    "media_origin": "ORIGINAL | AI-GENERATED | UNCERTAIN",
    "synthetic_probability": 0,
    "executive_summary": "Summary detailing image context and safety status.",
    "ai_reasoning": "Forensic breakdown citing mathematical sensors or UI anomalies.",
    "indicators_of_compromise": ["Suspicious indicator 1"],
    "synthetic_indicators": ["Structural or UI typography anomaly 1"],
    "recommended_actions": ["Actionable guidance 1", "Actionable guidance 2"],
    "evidence_collected": {
      "OCR_Text_Found": true,
      "QR_Codes_Found": 0,
      "Extracted_Payload": "None detected",
      "Image_Size_KB": 128.4
    }
  }
}
```

### Example `curl`
```bash
curl -X POST "http://127.0.0.1:8000/api/investigate/image" \
     -H "accept: application/json" \
     -F "file=@/path/to/screenshot.jpg;type=image/jpeg" \
     -F "target_language=English"
```
