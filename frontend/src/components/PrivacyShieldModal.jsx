import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Phone, ShieldAlert, ShieldCheck, Lock, FileCheck, ChevronLeft } from 'lucide-react';

const maskingEngines = [
  {
    icon: CreditCard,
    label: 'PAYMENT CARDS',
    description: 'Automatically blocks real payment cards while safely ignoring invoice numbers and tracking codes.',
    badge: 'Luhn Math Check',
    border: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-400/50',
    hoverShadow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.2)]',
    bg: 'bg-rose-950/20',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    titleColor: 'text-rose-400',
    pill: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
  {
    icon: Phone,
    label: 'PHONE & CONTACTS',
    description: 'Hides private mobile numbers, but keeps malicious website links and IP addresses visible for investigation.',
    badge: 'Boundary Guard',
    border: 'border-cyan-500/30',
    hoverBorder: 'hover:border-cyan-400/50',
    hoverShadow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]',
    bg: 'bg-cyan-950/20',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    titleColor: 'text-cyan-400',
    pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  },
  {
    icon: ShieldAlert,
    label: 'GOVERNMENT IDENTIFIERS',
    description: 'Detects and scrambles official identification numbers so your identity is never exposed.',
    badge: 'Zero Leakage',
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

const specs = [
  { icon: Lock, label: 'INTERCEPTOR MODE', value: 'Deterministic Zero-Trust', color: 'rose' },
  { icon: ShieldCheck, label: 'EXECUTION SCOPE', value: 'Local Pre-Inference Memory', color: 'cyan' },
  { icon: FileCheck, label: 'IOC PRESERVATION', value: 'Strict Host / IP Preserved', color: 'amber' },
];

export default function PrivacyShieldModal() {
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
        aria-label="Privacy Shield"
      >
        <span className="text-slate-500 group-hover:text-cyan-500/70 transition-colors text-[7px] sm:text-[8px] md:text-[10px] leading-none">Privacy</span>
        <div className="flex items-center gap-1 md:gap-1.5 leading-none mt-0.5 md:mt-0">
          <span className="text-slate-300 group-hover:text-cyan-400 transition-colors text-[8px] sm:text-[9px] md:text-xs">Shield</span>
          <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-cyan-400 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        </div>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="privacy-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden transform-gpu will-change-[opacity]"
            >
              <motion.div
                key="privacy-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl my-auto bg-[#0a0f18]/95 backdrop-blur-md md:backdrop-blur-2xl border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_0_50px_rgba(6,182,212,0.15)] rounded-xl overflow-hidden flex flex-col transform-gpu will-change-transform will-change-[opacity]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                <PrivacyView onBack={() => setIsOpen(false)} />
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
export const PrivacyView = ({ onBack }) => {
  return (
    <div className="w-full flex-1 flex flex-col overflow-y-auto">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.18em] text-cyan-400 uppercase">
            TRINETRA PRIVACY SHIELD ARCHITECTURE&nbsp;
            <span className="text-zinc-500">v1.0</span>
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
        {/* Shield Objective */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-500/70 uppercase mb-1.5">
            + SHIELD OBJECTIVE
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Before anything reaches the AI, TRINETRA scrambles sensitive details like your phone numbers, bank cards, and national IDs directly in your browser. Your identity stays completely private.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-zinc-800/70" />

        {/* Active Masking Engines */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase mb-2.5">
            + ACTIVE MASKING ENGINES
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
            {maskingEngines.map((engine, idx) => {
              const Icon = engine.icon;
              return (
                <motion.div
                  key={engine.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.03 + idx * 0.05 }}
                  className={`flex flex-col gap-2 p-3.5 sm:p-4 rounded-xl border ${engine.border} ${engine.bg} ${engine.hoverBorder} ${engine.hoverShadow} bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-md transition-all duration-300 hover:scale-[1.01] group`}
                >
                  <div className={`w-7 h-7 rounded-lg ${engine.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${engine.iconColor}`} />
                  </div>
                  <div>
                    <p className={`font-mono text-[11px] font-semibold tracking-wider ${engine.titleColor} mb-1`}>
                      {engine.label}
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {engine.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-zinc-800/50 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded border font-mono text-[9px] tracking-widest uppercase ${engine.pill}`}>
                      {engine.badge}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SPECS FOOTER ── */}
      <div className="mt-auto border-t border-zinc-800/80 bg-zinc-950/60 px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap gap-y-2 gap-x-4 sm:gap-x-6 items-center">
        {specs.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${
                  s.color === 'rose' ? 'bg-rose-400' : s.color === 'amber' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 ${
                  s.color === 'rose' ? 'bg-rose-400' : s.color === 'amber' ? 'bg-amber-400' : 'bg-cyan-400'
                }`} />
              </span>
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-600 shrink-0" />
              <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-zinc-600 uppercase">
                {s.label}:
              </span>
              <span className={`font-mono text-[8px] sm:text-[9px] tracking-wider ${
                s.color === 'rose' ? 'text-rose-400/90' : s.color === 'amber' ? 'text-amber-400/90' : 'text-cyan-400/90'
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
