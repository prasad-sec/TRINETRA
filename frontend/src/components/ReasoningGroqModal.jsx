import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, ShieldCheck, Lock, Layers, ChevronLeft } from 'lucide-react';

const engineSpecs = [
  {
    icon: Cpu,
    label: 'INSTANT ANALYSIS',
    description: 'Processes heavy files, PDFs, and images in milliseconds so you never have to wait.',
    badge: 'Groq LPU™ Hardware',
    border: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400/50',
    hoverShadow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]',
    bg: 'bg-emerald-950/20',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-400',
    pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  {
    icon: Zap,
    label: 'SCAM DETECTION',
    description: 'Reads between the lines to detect subtle urgency tactics, fake branding, and hidden traps.',
    badge: 'Llama 3.3 (70B)',
    border: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-400/50',
    hoverShadow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]',
    bg: 'bg-purple-950/20',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    titleColor: 'text-purple-400',
    pill: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  {
    icon: Activity,
    label: 'ZERO DATA SAVED',
    description: 'Your uploaded files exist only for a split second in temporary memory and are never saved or used for AI training.',
    badge: 'Zero Data Retention',
    border: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-400/50',
    hoverShadow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]',
    bg: 'bg-amber-950/20',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-400',
    pill: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
];

const footerSpecs = [
  { icon: Layers, label: 'INFERENCE PROVIDER', value: 'Groq LPU™ Cluster', color: 'emerald' },
  { icon: ShieldCheck, label: 'DATA POLICY', value: 'Zero Data Retention (ZDR)', color: 'purple' },
  { icon: Lock, label: 'ENCRYPTION', value: 'TLS 1.3 In-Transit', color: 'amber' },
];

export default function ReasoningGroqModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center md:items-end gap-0 md:gap-1 hover:text-cyan-400 transition-colors group cursor-pointer leading-none"
        title="View Groq AI Reasoning Engine Specs"
        aria-label="REASONING: GROQ"
      >
        <span className="text-slate-500 group-hover:text-cyan-500/70 transition-colors text-[7px] sm:text-[8px] md:text-[10px] leading-none">Reasoning</span>
        <span className="text-slate-300 group-hover:text-cyan-400 transition-colors text-[8px] sm:text-[9px] md:text-xs leading-none mt-0.5 md:mt-0">Groq</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="groq-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden transform-gpu will-change-[opacity]"
            >
              <motion.div
                key="groq-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl my-auto bg-[#0a0f18]/95 backdrop-blur-md md:backdrop-blur-2xl border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_0_50px_rgba(6,182,212,0.15)] rounded-xl overflow-hidden flex flex-col transform-gpu will-change-transform will-change-[opacity]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                <ReasoningView onBack={() => setIsOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// ── Exported View for main dashboard rendering ──────────────────────────────
export const ReasoningView = ({ onBack }) => {
  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.18em] text-cyan-400 uppercase">
            TRINETRA AI REASONING ARCHITECTURE&nbsp;
            <span className="text-zinc-500">GROQ LPU™</span>
          </span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-700/60 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-zinc-400 hover:text-cyan-300 font-mono text-[10px] tracking-wider transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>BACK TO WORKSPACE</span>
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-6">
        {/* Engine Objective */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-500/70 uppercase mb-1.5">
            + ENGINE ARCHITECTURE
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Powered by Groq's ultra-fast AI engine to uncover hidden phishing vectors and brand impersonations in real time—without storing a single byte of your data.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/70" />

        {/* Engine Specifications */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase mb-2.5">
            + ENGINE SPECIFICATIONS
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            {engineSpecs.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.03 + idx * 0.05 }}
                  className={`flex flex-col gap-2 p-3.5 sm:p-4 rounded-xl border ${spec.border} ${spec.bg} ${spec.hoverBorder} ${spec.hoverShadow} bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-md transition-all duration-300 hover:scale-[1.01] group`}
                >
                  <div className={`w-7 h-7 rounded-lg ${spec.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${spec.iconColor}`} />
                  </div>
                  <div>
                    <p className={`font-mono text-[11px] font-semibold tracking-wider ${spec.titleColor} mb-1`}>
                      {spec.label}
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {spec.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-zinc-800/50 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded border font-mono text-[9px] tracking-widest uppercase ${spec.pill}`}>
                      {spec.badge}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/70" />

        {/* Data Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-500/70 uppercase mb-1.5">
            + DATA PRIVACY
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Zero Data Retention (ZDR) Active — prompts, forensic payloads, and extracted telemetry are evaluated strictly in ephemeral volatile memory and are never logged, stored, cached, or used for model training.
          </p>
        </motion.div>
      </div>

      {/* ── SPECS FOOTER ── */}
      <div className="mt-auto border-t border-zinc-800/80 bg-zinc-950/60 px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap gap-y-2 gap-x-4 sm:gap-x-6 items-center">
        {footerSpecs.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${
                  s.color === 'emerald' ? 'bg-emerald-400' : s.color === 'purple' ? 'bg-purple-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 ${
                  s.color === 'emerald' ? 'bg-emerald-400' : s.color === 'purple' ? 'bg-purple-400' : 'bg-amber-400'
                }`} />
              </span>
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-600 shrink-0" />
              <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-zinc-600 uppercase">
                {s.label}:
              </span>
              <span className={`font-mono text-[8px] sm:text-[9px] tracking-wider ${
                s.color === 'emerald' ? 'text-emerald-400/90' : s.color === 'purple' ? 'text-purple-400/90' : 'text-amber-400/90'
              }`}>
                {s.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
