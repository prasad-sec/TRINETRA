import React, { useState } from 'react';
import { X, Link, Mail, FileText, QrCode, Image as ImageIcon, Cpu, Zap, Eye, ChevronLeft, Layers, ShieldAlert, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Deep-dive content for each vector ──────────────────────────────────────────
const VECTOR_DEEP_DIVE = {
  'URL Intelligence': {
    stack: ['Python URLEngine (custom parser)', 'tldextract · validators · ipaddress stdlib', 'Groq → Llama-3.3-70B-Versatile'],
    metrics: [
      'Domain age & reputation via WHOIS heuristics',
      'TLD risk scoring (e.g., .xyz, .tk, .top flagged)',
      'IP-literal host detection & private range checks',
      'Redirect-chain & open-redirect parameter patterns',
      'Typosquatting similarity against top-500 brand list',
      'Suspicious query-string key/value fingerprints',
    ],
    promptStrategy: 'Groq receives a structured IOC dictionary extracted by URLEngine and reasons over domain, path, parameters, and entropy signals to produce a verdict with plain-language justification.',
  },
  'Email Forensics': {
    stack: ['Python email stdlib (RFC 2822 / MIME)', 'PyMuPDF · pytesseract · zxing-cpp (attachment parsing)', 'Groq → Llama-3.3-70B-Versatile'],
    metrics: [
      'SPF / DKIM / DMARC header authentication status',
      'From-domain vs. Return-Path mismatch detection',
      'False-urgency linguistic cues in body text',
      'Embedded URL extraction & domain cross-reference',
      'PDF attachment text & link scanning',
      'Image OCR + QR code payload discovery (quishing)',
      'Indian bank infrastructure exception handling',
    ],
    promptStrategy: 'A structured JSON payload (headers, body, URLs, attachment extracts) is passed to Groq, which applies social-engineering and authentication analysis rules to produce a comprehensive phishing verdict.',
  },
  'PDF Document Inspector': {
    stack: ['PyMuPDF (fitz) for stream extraction', 'zxing-cpp for embedded QR decoding', 'Groq → Llama-3.3-70B-Versatile'],
    metrics: [
      'Embedded hyperlink extraction across all pages',
      'Suspicious URI scheme detection (e.g., javascript:, data:)',
      'Hidden QR code payloads inside embedded images',
      'Linguistic social-engineering in extracted text',
      'Generic greeting & fake invoice pattern matching',
      'Mismatch between claimed sender branding and embedded URLs',
    ],
    promptStrategy: 'Extracted PDF text (capped at 4 000 chars) and deduplicated URLs are sent to Groq, which cross-references linguistic manipulation markers with embedded link reputation to classify document intent.',
  },
  'QR Code Decoder': {
    stack: ['OpenCV + zxing-cpp (Stage 1 local decode)', 'Bitwise-NOT matrix inversion for dark-mode QRs', 'Groq Vision → Llama-3.2-11B (fallback) · Groq → Llama-3.3-70B (threat analysis)'],
    metrics: [
      'VPA (Virtual Payment Address) payload syntax validation',
      'UPI parameter anomaly checks (pa, pn, am fields)',
      'Redirect loops and URL shortener patterns in payload',
      'Embedded phishing URL patterns post-decode',
      'Dark-mode / inverted matrix decoding resilience',
      'Vision AI fallback for logo-overlaid or stylised QRs',
    ],
    promptStrategy: 'The raw decoded payload string is passed to Groq with consumer-friendly rules: standard UPI links are presumed safe unless payload syntax, domain, or redirect patterns indicate malicious intent.',
  },
  'Vision & Image Engine': {
    stack: ['OpenCV + pytesseract (local OCR)', 'zxing-cpp for in-image QR decoding', 'Groq Vision → Llama-3.2-11B (visual context) · Groq → Llama-3.3-70B (threat reasoning)'],
    metrics: [
      'AI-generation artifact detection (texture, geometry, lighting)',
      'Screenshot context classification (invoice, conversation, payment UI)',
      'OCR text extraction & URL discovery inside images',
      'QR payload extraction from embedded barcodes',
      'Deepfake & synthetic identity document detection',
      'Deceptive use of AI art vs. harmless creative content',
    ],
    promptStrategy: 'A two-stage Groq pipeline runs: Stage 1 (Vision LLM) describes visual context and AI-generation signals; Stage 2 (text LLM) fuses OCR, QR payloads, and visual context to produce a calibrated threat verdict.',
  },
};

const VECTORS = [
  {
    icon: Link,
    label: 'URL Intelligence',
    description: 'Deep-domain analysis, SSL verification, typosquatting & reputation scoring.',
    color: 'cyan',
  },
  {
    icon: Mail,
    label: 'Email Forensics',
    description: 'Headers parsing, SPF/DKIM verification, urgency cues & hidden payload extraction.',
    color: 'sky',
  },
  {
    icon: FileText,
    label: 'PDF Document Inspector',
    description: 'Structure inspection, embedded link scanning & linguistic social-engineering detection.',
    color: 'violet',
  },
  {
    icon: QrCode,
    label: 'QR Code Decoder',
    description: 'Matrix decoding, target URL unmasking & malicious UPI redirect checks.',
    color: 'emerald',
  },
  {
    icon: ImageIcon,
    label: 'Vision & Image Engine',
    description: 'Groq Vision OCR, AI-generated synthetic media detection & screenshot context analysis.',
    color: 'amber',
  },
];

const COLOR_MAP = {
  cyan:    { border: 'border-cyan-500/25',    icon: 'text-cyan-400',    bg: 'bg-cyan-500/15',    hover: 'hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:-translate-y-1',    activeBorder: 'border-cyan-500/60',    activeShadow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]'    },
  sky:     { border: 'border-sky-500/25',     icon: 'text-sky-400',     bg: 'bg-sky-500/15',     hover: 'hover:border-sky-500/60 hover:shadow-[0_0_25px_rgba(14,165,233,0.25)] hover:-translate-y-1',     activeBorder: 'border-sky-500/60',     activeShadow: 'shadow-[0_0_25px_rgba(14,165,233,0.3)]'     },
  violet:  { border: 'border-violet-500/25',  icon: 'text-violet-400',  bg: 'bg-violet-500/15',  hover: 'hover:border-violet-500/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] hover:-translate-y-1',  activeBorder: 'border-violet-500/60',  activeShadow: 'shadow-[0_0_25px_rgba(139,92,246,0.3)]'  },
  emerald: { border: 'border-emerald-500/25', icon: 'text-emerald-400', bg: 'bg-emerald-500/15', hover: 'hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:-translate-y-1', activeBorder: 'border-emerald-500/60', activeShadow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]' },
  amber:   { border: 'border-amber-500/25',   icon: 'text-amber-400',   bg: 'bg-amber-500/15',   hover: 'hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:-translate-y-1',   activeBorder: 'border-amber-500/60',   activeShadow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]'   },
};

const SPECS = [
  { icon: Cpu,  label: 'PRIMARY MODEL',      value: 'Llama-3.3-70B-Versatile'   },
  { icon: Eye,  label: 'VISION ENGINE',      value: 'Llama-3.2-11B-Vision'      },
  { icon: Zap,  label: 'INFERENCE PROVIDER', value: 'Groq LPU™ (Low Latency)'  },
];

// ── Deep-dive drawer rendered inside the body area ──────────────────────────────
const DeepDiveDrawer = ({ vector, onBack }) => {
  const c = COLOR_MAP[vector.color];
  const Icon = vector.icon;
  const dive = VECTOR_DEEP_DIVE[vector.label];

  const sections = [
    {
      sectionIcon: Layers,
      heading: 'TECHNICAL STACK',
      items: dive.stack,
      bullet: '▸',
      itemClass: 'text-zinc-300',
    },
    {
      sectionIcon: ShieldAlert,
      heading: 'THREAT METRICS EVALUATED',
      items: dive.metrics,
      bullet: '·',
      itemClass: 'text-zinc-400',
    },
    {
      sectionIcon: BrainCircuit,
      heading: 'AI PROMPT STRATEGY',
      items: [dive.promptStrategy],
      bullet: '',
      itemClass: 'text-zinc-300 italic',
    },
  ];

  return (
    <motion.div
      key="deep-dive"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-5"
    >
      {/* Back button + vector identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-700/60 hover:border-zinc-500/60 hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-200 font-mono text-[10px] tracking-widest transition-all group`}
        >
          <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-150" />
          BACK TO OVERVIEW
        </button>
        <div className="h-px flex-1 bg-zinc-800/70" />
        <div className={`flex items-center gap-1.5 ${c.icon}`}>
          <Icon className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px] font-semibold tracking-[0.18em] uppercase">{vector.label}</span>
        </div>
      </div>

      {/* Dark glass drawer panel */}
      <div className={`rounded-xl border ${c.activeBorder} ${c.activeShadow} bg-zinc-950/80 backdrop-blur-2xl border-white/10 overflow-hidden`}>
        {/* Accent top line matching vector colour */}
        <div className={`h-px w-full bg-gradient-to-r from-transparent ${c.icon.replace('text-', 'via-')} to-transparent opacity-60`} />

        <div className="p-5 flex flex-col gap-5">
          {sections.map((sec, si) => {
            const SIcon = sec.sectionIcon;
            return (
              <motion.div
                key={sec.heading}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: si * 0.07 }}
              >
                {/* Section heading */}
                <div className="flex items-center gap-2 mb-2">
                  <SIcon className={`w-3.5 h-3.5 ${c.icon} shrink-0`} />
                  <p className={`font-mono text-[10px] tracking-[0.18em] ${c.icon} uppercase font-semibold`}>
                    {sec.heading}
                  </p>
                </div>
                {/* Items */}
                <ul className="flex flex-col gap-1 pl-1">
                  {sec.items.map((item, ii) => (
                    <li key={ii} className={`flex items-start gap-2 text-[11px] leading-relaxed ${sec.itemClass}`}>
                      {sec.bullet && (
                        <span className={`mt-px shrink-0 ${c.icon} opacity-60`}>{sec.bullet}</span>
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {si < sections.length - 1 && (
                  <div className="h-px bg-zinc-800/60 mt-4" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────────
const AboutHologram = ({ onClose }) => {
  const [selectedVector, setSelectedVector] = useState(null);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="about-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden"
      >
        {/* Modal Panel */}
        <motion.div
          key="about-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl my-auto bg-zinc-950/75 backdrop-blur-2xl border border-zinc-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_0_50px_rgba(6,182,212,0.15)] rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Cyber sheen sweep on mount */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.1 }}
            className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent skew-x-12"
          />

          {/* ── HEADER ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
              <span className="font-mono text-xs font-semibold tracking-[0.18em] text-cyan-400 uppercase">
                TRINETRA FORENSIC ARCHITECTURE&nbsp;
                <span className="text-zinc-500">v1.0</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-700/60 hover:border-red-500/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 font-mono text-[10px] tracking-widest transition-all group"
            >
              <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-200" />
              ESC
            </button>
          </div>

          {/* ── BODY ── */}
          <div className="px-6 py-5 flex flex-col gap-6">

            {/* Core Mission — always visible */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-500/70 uppercase mb-2">
                ◈ CORE OBJECTIVE
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Trinetra is an AI-powered digital forensics and threat detection platform. It
                cross-examines incoming digital artifacts—URLs, Emails, PDFs, QR Codes, and
                Screenshots—to uncover hidden phishing vectors, deceptive media, and structural
                malicious intent in real-time.
              </p>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-zinc-800/70" />

            {/* ── ANALYSIS VECTORS section (grid OR deep-dive) ── */}
            <div>
              {/* Section label — adapts to state */}
              <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase mb-3">
                {selectedVector ? `◈ VECTOR DEEP-DIVE` : '◈ ANALYSIS VECTORS'}
              </p>

              <AnimatePresence mode="wait">
                {selectedVector ? (
                  /* ── DEEP-DIVE DRAWER ── */
                  <DeepDiveDrawer
                    key="drawer"
                    vector={selectedVector}
                    onBack={() => setSelectedVector(null)}
                  />
                ) : (
                  /* ── BENTO GRID ── */
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    {VECTORS.map((v, idx) => {
                      const Icon = v.icon;
                      const c = COLOR_MAP[v.color];
                      return (
                        <motion.div
                          key={v.label}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.32, delay: 0.04 + idx * 0.08 }}
                          onClick={() => setSelectedVector(v)}
                          className={`flex flex-col gap-2.5 p-4 rounded-xl border ${c.border} ${c.hover} bg-gradient-to-b from-white/[0.07] to-transparent backdrop-blur-md transition-all duration-300 cursor-pointer group`}
                        >
                          <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${c.icon}`} />
                          </div>
                          <div>
                            <p className={`font-mono text-[11px] font-semibold tracking-wider ${c.icon} mb-1`}>
                              {v.label.toUpperCase()}
                            </p>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              {v.description}
                            </p>
                          </div>
                          {/* Tap hint */}
                          <p className={`font-mono text-[9px] tracking-widest ${c.icon} opacity-0 group-hover:opacity-60 transition-opacity duration-200 uppercase mt-auto`}>
                            Tap to expand →
                          </p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── AI ENGINE SPECS FOOTER ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.65 }}
            className="mt-auto border-t border-zinc-800/80 bg-zinc-950/60 px-6 py-3 flex flex-wrap gap-y-2 gap-x-6 items-center"
          >
            {SPECS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2">
                  {/* Pulsing live indicator */}
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-50" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                  </span>
                  <Icon className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span className="font-mono text-[9px] tracking-widest text-zinc-600 uppercase">
                    {s.label}:
                  </span>
                  <span className="font-mono text-[9px] tracking-wider text-cyan-400/80">
                    {s.value}
                  </span>
                </div>
              );
            })}
          </motion.div>

          {/* Bottom accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutHologram;

