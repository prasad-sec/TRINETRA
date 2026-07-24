import React, { useState, useEffect } from 'react';
import { Activity, TerminalSquare } from 'lucide-react';
import InvestigationWorkspace from './InvestigationWorkspace';
import AIAssistantEye from './AIAssistantEye';
import LiveClock from './LiveClock';
import { motion, AnimatePresence } from 'framer-motion';

const LivingDashboard = () => {
  const [aiState, setAiState] = useState('idle'); // idle, thinking, alert
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowGreeting(true), 1000);
  }, []);

  const handleWorkspaceStateChange = (state) => {
    if (state === 'investigating') setAiState('thinking');
    else if (state === 'complete') setAiState('alert');
    else setAiState('idle');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070A] w-full relative text-slate-100 font-sans pointer-events-auto">
      
      {/* Left Sidebar (Minimal & Focused) */}
      <aside className="h-full w-20 md:w-64 bg-[#030712]/90 border-r border-white/[0.05] backdrop-blur-xl flex flex-col items-center md:items-stretch py-6 shrink-0 z-20">
        <div className="mb-10 px-0 md:px-6 flex items-center justify-center md:justify-start">
          <h2 className="hidden md:block font-sans text-lg tracking-[0.3em] font-bold text-slate-200 uppercase">
            Trinetra
          </h2>
          <div className="md:hidden w-8 h-8 bg-white/[0.05] rounded flex items-center justify-center">
            <span className="font-bold text-sm">T</span>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2 w-full px-2 md:px-4">
          <button className="flex items-center gap-3 px-3 md:px-4 py-3 bg-white/[0.05] rounded-lg text-slate-100 font-sans text-xs tracking-widest uppercase transition-colors">
            <Activity className="w-5 h-5 shrink-0" />
            <span className="hidden md:block">Workspace</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-full flex flex-col relative z-10">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/[0.05] flex items-center justify-between px-8 bg-[#030712]/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4 text-slate-400 max-w-md w-full">
            {/* Minimalist Top Bar */}
          </div>
          <div className="flex items-center gap-6">
            <LiveClock />
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-full px-4 py-1.5">
              <div className={`w-2 h-2 rounded-full ${aiState === 'idle' ? 'bg-[#0066FF] animate-pulse' : aiState === 'thinking' ? 'bg-[#00F0FF]' : 'bg-[#FF0055]'}`}></div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-slate-400">AI Core {aiState === 'idle' ? 'Standby' : 'Active'}</span>
            </div>
            <AIAssistantEye state={aiState} className="w-10 h-10" />
          </div>
        </header>

        {/* Dashboard Content Inner Wrapper */}
        <div className="flex-1 p-8 pb-24 flex flex-col gap-8 scrollbar-hide">
          
          <div className="min-h-[80px]">
            <AnimatePresence>
              {showGreeting && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-1"
                >
                  <h1 className="font-sans text-2xl font-semibold tracking-wide text-slate-200">
                    Good Evening, Operator.
                  </h1>
                  <p className="font-mono text-xs text-slate-500">
                    AI Core Online. Investigation Engine Ready.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* System Core Status - Real Data Mock */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0">
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 flex flex-col justify-between hover:border-white/[0.1] transition-colors">
              <h3 className="font-sans text-xs font-semibold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <TerminalSquare className="w-4 h-4" /> System Core
              </h3>
              <div className="flex flex-col gap-2 mt-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Neural Engine</span>
                  <span className="text-[#00F0FF]">ACTIVE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Global Sensors</span>
                  <span className="text-emerald-400">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status</span>
                  <span className="text-slate-300">NOMINAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Investigation Workspace */}
          <div className="flex-1 flex flex-col min-h-[500px]">
             <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden flex flex-col relative">
                <InvestigationWorkspace onStateChange={handleWorkspaceStateChange} />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LivingDashboard;
