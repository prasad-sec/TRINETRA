import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutHologram = ({ onClose }) => {
  const [text, setText] = useState('');
  
  const fullText = "TRINETRA is a Next-Gen AI Threat Intelligence Engine.\n\nIt provides complete digital forensics across 5 vectors:\n\n• URL: Detects malicious links and fake brand websites.\n• EMAIL: Scans inboxes for targeted phishing attempts.\n• PDF: Inspects documents for hidden malware or links.\n• QR CODE: Reveals and analyzes hidden web destinations.\n• SCREENSHOT: Uses AI vision to spot fake login pages.";

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typingInterval);
    }, 30);
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden"
    >
      <div className="flex flex-col w-full max-w-3xl min-h-[60vh] md:h-[60vh] my-auto mx-4 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* The AI Terminal (Full Width) */}
        <div className="w-full h-full flex flex-col justify-between p-6 md:p-10 bg-transparent z-20 relative backdrop-blur-sm">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/10 via-cyan-500/50 to-cyan-500/10" />
          
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-6 relative z-10">
            <span className="text-cyan-400 font-mono text-sm md:text-base tracking-widest font-semibold flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse`} />
              SYSTEM.ABOUT
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 min-h-[200px]">
            <p className="font-mono text-cyan-100/80 text-sm md:text-base leading-[1.8] whitespace-pre-wrap">
              {text}
              <span className="inline-block w-2.5 h-4 md:h-5 bg-cyan-400 ml-1 animate-pulse" />
            </p>
          </div>

          <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-slate-800/50 relative z-10">
            <button 
              onClick={onClose}
              className="w-full md:w-auto px-6 py-3 border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-sm tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 group"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              CLOSE TERMINAL
            </button>
            <span className="text-xs font-mono text-slate-500 tracking-widest">
              [ V1.0 ]
            </span>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
};

export default AboutHologram;
