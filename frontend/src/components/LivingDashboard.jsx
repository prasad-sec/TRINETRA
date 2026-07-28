import React, { useState, useEffect } from 'react';
import InvestigationWorkspace from './InvestigationWorkspace';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
const LivingDashboard = ({ isDashboardActive = true, onOpenAbout }) => {
  const [aiState, setAiState] = useState('idle'); // idle, thinking, alert

  const handleWorkspaceStateChange = (state) => {
    if (state === 'investigating') setAiState('thinking');
    else if (state === 'complete') setAiState('alert');
    else setAiState('idle');
  };

  const getInvestigationStatus = () => {
    if (aiState === 'thinking') return 'INVESTIGATING';
    if (aiState === 'alert') return 'ANALYSIS COMPLETE';
    return 'READY';
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent w-full relative text-slate-100 font-sans pointer-events-auto">
      
      {/* Background Layer: Laboratory Feel */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.03),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      {/* Top Enterprise Command Bridge Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={isDashboardActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="py-3 border-b border-theme-border flex flex-col md:flex-row items-center justify-center md:justify-between px-4 md:px-8 bg-theme-surface/50 backdrop-blur-md shrink-0 z-10 relative gap-2 md:gap-0"
      >
        {/* Left Side: Brand */}
        <div className="flex items-center gap-2 text-center md:text-left">
          <Eye className="w-6 h-6 text-cyan-500 mr-2" />
          <h1 className="font-sans text-xl md:text-2xl tracking-[0.3em] font-bold text-slate-100 uppercase">
            Trinetra
          </h1>
        </div>

        {/* Right Side: Status Indicators */}
        <div className="flex items-center gap-4 md:gap-8 font-mono text-[9px] md:text-xs uppercase tracking-widest text-slate-400">
          <button 
            onClick={onOpenAbout}
            className="flex flex-col items-center md:items-end gap-1 hover:text-cyan-400 transition-colors group cursor-pointer"
          >
            <span className="text-slate-500 group-hover:text-cyan-500/70 transition-colors">System</span>
            <span className="text-slate-300 group-hover:text-cyan-400 transition-colors">About</span>
          </button>
          <div className="h-6 w-px bg-theme-border"></div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-slate-500">Reasoning</span>
            <span className="text-slate-300">Groq</span>
          </div>
          <div className="h-6 w-px bg-theme-border"></div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-slate-500">AI Core</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">ONLINE</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
          </div>
          <div className="h-6 w-px bg-theme-border"></div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-slate-500">Status</span>
            <span className={aiState === 'thinking' ? 'text-cyan-400' : aiState === 'alert' ? 'text-amber-400' : 'text-slate-300'}>
              {getInvestigationStatus()}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Investigation Area (70% Visual Attention) */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={isDashboardActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="flex-1 overflow-x-hidden w-full flex flex-col items-center relative z-10 p-2 md:p-8"
      >
        <div className="w-full max-w-6xl flex flex-col relative my-auto">
          
          {/* Tactical Frame */}
          <div className="absolute inset-0 pointer-events-none z-10 hidden sm:block">
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[1.5px] border-l-[1.5px] border-cyan-500/20 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[1.5px] border-r-[1.5px] border-cyan-500/20 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[1.5px] border-l-[1.5px] border-cyan-500/20 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[1.5px] border-r-[1.5px] border-cyan-500/20 rounded-br-2xl"></div>
          </div>

          <div className="flex-1 bg-theme-surface/50 backdrop-blur-md border border-theme-border rounded-lg sm:rounded-2xl flex flex-col relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <InvestigationWorkspace onStateChange={handleWorkspaceStateChange} isDashboardActive={isDashboardActive} />
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default LivingDashboard;
