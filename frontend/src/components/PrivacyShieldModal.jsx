import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrivacyShieldModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center md:items-end gap-1 hover:text-cyan-400 transition-colors group cursor-pointer"
      >
        <span className="text-slate-500 group-hover:text-cyan-500/70 transition-colors">Privacy</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">Shield</span>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        </div>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950/40 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] rounded-2xl p-6 max-w-sm w-full relative text-left"
              >
                <h3 className="text-base font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  🛡️ Privacy Shield Active
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  TRINETRA automatically detects and scrambles sensitive personal information (like phone numbers, credit cards, and government IDs) locally in your browser and backend before any data is sent to the AI. This keeps your data 100% private and secure during investigations.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 py-2.5 rounded-xl font-medium text-xs transition-all mt-5 cursor-pointer tracking-wider"
                >
                  GOT IT
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
