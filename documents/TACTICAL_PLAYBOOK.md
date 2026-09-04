# Tactical Playbook (SOC Analyst Runbook)

This runbook provides step-by-step procedures for security operations center (SOC) analysts operating the TRINETRA platform. It dictates the standardized workflows for collecting, parsing, and making decisions based on TRINETRA's AI-assisted forensics.

---

## 1. Suspicious QR Code (Quishing)
**Scenario**: User reports an unknown QR code found on a physical flyer, a parking meter, or an unexpected digital document.

1. **Artifact Collection**: Take a clear, high-resolution photograph or screenshot of the QR code.
2. **TRINETRA Ingestion**: Upload the image to the TRINETRA Tactical UI using the QR Code analysis module.
3. **Deterministic Parsing**: TRINETRA decodes the matrix using local OpenCV/zxing-cpp to extract the raw destination URI.
4. **AI Correlation**: TRINETRA evaluates the decoded URI for masking techniques, typosquatting, and redirects, while Vision AI checks for overlaid branding anomalies.
5. **Analyst Decision**: Review the threat score and routing chain. If malicious, block the resulting URL at the web gateway.

---

## 2. Suspicious Email
**Scenario**: An employee forwards a highly urgent email requesting immediate payment or credentials.

1. **Artifact Collection**: Export the raw email as an `.eml` file to preserve routing headers.
2. **TRINETRA Ingestion**: Upload the `.eml` file to the Email Forensics module.
3. **Deterministic Parsing**: The backend evaluates SPF/DKIM/DMARC alignments and extracts embedded objects.
4. **AI Correlation**: The AI evaluates social engineering markers (linguistic urgency, authority bias) and correlates them against the technical header anomalies.
5. **Analyst Decision**: If spoofing or phishing is confirmed, initiate an organization-wide purge of the email and block the sender domain.

---

## 3. Suspicious PDF
**Scenario**: An unexpected invoice or legal document arrives with instructions to "click to view secure document."

1. **Artifact Collection**: Securely download the PDF (do not open it in a standard reader).
2. **TRINETRA Ingestion**: Upload the PDF to the Document Inspection module.
3. **Deterministic Parsing**: TRINETRA's PyMuPDF engine extracts the underlying text layers, hidden annotations, and embedded URIs without executing PDF JavaScript.
4. **AI Correlation**: The LLM evaluates the extracted text context against the destination of the embedded links to identify credential harvesting lures.
5. **Analyst Decision**: Extract the malicious indicators (IPs, domains) provided in the TRINETRA verdict and update endpoint detection rules.

---

## 4. Fraudulent Screenshot / Synthetic Media
**Scenario**: A screenshot of a supposed bank transfer or a controversial statement is submitted as evidence.

1. **Artifact Collection**: Save the image file exactly as received.
2. **TRINETRA Ingestion**: Upload to the Screenshot & Vision module.
3. **Deterministic Parsing**: TRINETRA extracts EXIF data, checks for C2PA cryptographic manifests, runs Error Level Analysis (ELA), and uses OCR to pull text.
4. **AI Correlation**: Vision models identify synthetic artifacts, while text models cross-reference the OCR data against live OSINT queries.
5. **Analyst Decision**: Use the AI-generated confidence score regarding media manipulation to either validate the evidence or discard it as a deepfake/forgery.

---

## 5. Suspicious URL
**Scenario**: A URL is found in chat logs or SMS indicating a potential credential harvesting site.

1. **Artifact Collection**: Copy the raw URL safely without navigating to it.
2. **TRINETRA Ingestion**: Input the URL into the URL Intelligence module.
3. **Deterministic Parsing**: The engine measures Levenshtein distance against known brand indexes (typosquatting) and checks domain age/TLD risk.
4. **AI Correlation**: The LLM synthesizes the risk metrics into a cohesive narrative regarding the domain's intent.
5. **Analyst Decision**: If flagged as typosquatting or high-risk, sinkhole the domain internally and alert affected users.
