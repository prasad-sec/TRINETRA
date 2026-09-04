# Security & Disclosure Policy

## Core Philosophy
TRINETRA is designed to minimize exposure to untrusted artifacts by performing parsing and extraction before AI reasoning and avoiding intentional execution of uploaded payloads.

## Threat Model
TRINETRA assumes that any uploaded file or provided URL may be actively hostile. To mitigate risks:
- **No Execution**: Artifacts (such as PDFs, EMLs, or Images) are never "opened" in their native applications. They are parsed deterministically in memory using localized vector engines.
- **JavaScript Isolation**: PDF analysis relies strictly on structure extraction (e.g., PyMuPDF) bypassing embedded JavaScript execution entirely.
- **Resource Exhaustion Mitigation**: Strict size limitations (10MB max payload) and SlowAPI rate limiting (6 requests per minute) are enforced at the ASGI middleware level to defend against denial-of-service vectors.

## Data Handling
- **Memory-Mapped Ingestion**: File streams are held in temporary memory buffers for analysis, ensuring artifacts are not permanently written to disk unless explicitly required for a deterministic parser.
- **Data Minimization**: The platform aggressively strips non-actionable byte-streams before forwarding contextual JSON summaries to Large Language Models. This significantly shrinks the attack surface during LLM inference.
- **No Telemetry**: No payload content or AI reasoning logs are transmitted to central third-party telemetry servers beyond the requested inference endpoints (e.g., Groq LPU).

## Prompt-Injection Considerations
As TRINETRA routes parsed strings (e.g., text from a PDF, or an email body) into Large Language Models for threat reasoning, there is a recognized risk of adversarial prompt injection (where malicious text attempts to override system prompts).
- **Defense in Depth**: System prompts are isolated from user-supplied artifact data within rigid JSON boundaries.
- **Deterministic Precedence**: TRINETRA relies heavily on deterministic signals (e.g., failed SPF/DKIM, matched typosquatting heuristics, C2PA manifest anomalies). The AI is utilized for *correlation and synthesis*, not sole truth-generation.

## Responsible Disclosure
We take security vulnerabilities very seriously. If you believe you have discovered a vulnerability within the TRINETRA architecture, please follow these guidelines:
1. Do not publicly disclose the issue until it has been reviewed and addressed.
2. Reach out to the maintainer(s) via the repository's primary contact method or open a private security advisory on GitHub.
3. Provide a clear description of the vulnerability, steps to reproduce, and any potential impact on the system.
