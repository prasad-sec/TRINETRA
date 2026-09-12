import React, { useState } from 'react';
import InvestigationWorkspace from './InvestigationWorkspace';
import { PrivacyView } from './PrivacyShieldModal';
import AiCoreStatus from './AiCoreStatus';
import { ReasoningView } from './ReasoningGroqModal';
import { AboutView } from './AboutHologram';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';

const LivingDashboard = ({ isDashboardActive = true, _onOpenAbout }) => {
  const [_aiState, setAiState] = useState('idle'); // idle, thinking, alert
  const [reportLanguage] = useState('English');
  const [currentMainView, setCurrentMainView] = useState('workspace'); // 'workspace' | 'about' | 'reasoning' | 'privacy'

  const handleWorkspaceStateChange = (state) => {
    if (state === 'investigating') setAiState('thinking');
    else if (state === 'complete') setAiState('alert');
    else setAiState('idle');
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
        className="py-1.5 md:py-3 border-b border-theme-border flex flex-row items-center justify-between px-2.5 sm:px-4 md:px-8 bg-theme-surface/50 backdrop-blur-md shrink-0 z-10 relative gap-1 md:gap-0"
      >
        {/* Left Side: Brand */}
        <button 
          onClick={() => setCurrentMainView('workspace')}
          className="flex items-center gap-1.5 md:gap-2 text-left cursor-pointer group shrink-0 focus:outline-none"
          title="Return to Workspace"
        >
          <Eye className="w-4 h-4 md:w-6 md:h-6 text-cyan-500 group-hover:text-cyan-400 transition-colors shrink-0" />
          <h1 className="font-sans text-xs sm:text-sm md:text-2xl tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] font-bold text-slate-100 uppercase group-hover:text-white transition-colors">
            Trinetra
          </h1>
        </button>

        {/* Right Side: Status Indicators & Views */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 font-mono text-[8px] sm:text-[9px] md:text-xs uppercase tracking-wider md:tracking-widest text-slate-400 shrink-0">
          <button 
            onClick={() => setCurrentMainView(currentMainView === 'about' ? 'workspace' : 'about')}
            className={`flex flex-col items-center md:items-end gap-0 md:gap-1 transition-colors group cursor-pointer leading-none ${
              currentMainView === 'about' ? 'text-cyan-400' : 'hover:text-cyan-400 text-slate-400'
            }`}
            title="System About"
          >
            <span className={`text-[7px] sm:text-[8px] md:text-[10px] transition-colors leading-none ${
              currentMainView === 'about' ? 'text-cyan-500' : 'text-slate-500 group-hover:text-cyan-500/70'
            }`}>System</span>
            <span className={`text-[8px] sm:text-[9px] md:text-xs transition-colors leading-none mt-0.5 md:mt-0 ${
              currentMainView === 'about' ? 'text-cyan-400 font-bold' : 'text-slate-300 group-hover:text-cyan-400'
            }`}>About</span>
          </button>
          
          <div className="h-3.5 md:h-6 w-px bg-theme-border shrink-0"></div>
          
          <button 
            onClick={() => setCurrentMainView(currentMainView === 'reasoning' ? 'workspace' : 'reasoning')}
            className={`flex flex-col items-center md:items-end gap-0 md:gap-1 transition-colors group cursor-pointer leading-none ${
              currentMainView === 'reasoning' ? 'text-cyan-400' : 'hover:text-cyan-400 text-slate-400'
            }`}
            title="View Groq AI Reasoning Engine Specs"
          >
            <span className={`text-[7px] sm:text-[8px] md:text-[10px] transition-colors leading-none ${
              currentMainView === 'reasoning' ? 'text-cyan-500' : 'text-slate-500 group-hover:text-cyan-500/70'
            }`}>Reasoning</span>
            <span className={`text-[8px] sm:text-[9px] md:text-xs transition-colors leading-none mt-0.5 md:mt-0 ${
              currentMainView === 'reasoning' ? 'text-cyan-400 font-bold' : 'text-slate-300 group-hover:text-cyan-400'
            }`}>Groq</span>
          </button>

          <div className="h-3.5 md:h-6 w-px bg-theme-border shrink-0"></div>
          
          <AiCoreStatus />
          
          <div className="h-3.5 md:h-6 w-px bg-theme-border shrink-0"></div>
          
          <button 
            onClick={() => setCurrentMainView(currentMainView === 'privacy' ? 'workspace' : 'privacy')}
            className={`flex flex-col items-center md:items-end gap-0 md:gap-1 transition-colors group cursor-pointer leading-none ${
              currentMainView === 'privacy' ? 'text-cyan-400' : 'hover:text-cyan-400 text-slate-400'
            }`}
            title="Privacy Shield Specs"
          >
            <span className={`text-[7px] sm:text-[8px] md:text-[10px] transition-colors leading-none ${
              currentMainView === 'privacy' ? 'text-cyan-500' : 'text-slate-500 group-hover:text-cyan-500/70'
            }`}>Privacy</span>
            <div className="flex items-center gap-1 md:gap-1.5 leading-none mt-0.5 md:mt-0">
              <span className={`text-[8px] sm:text-[9px] md:text-xs transition-colors ${
                currentMainView === 'privacy' ? 'text-cyan-400 font-bold' : 'text-slate-300 group-hover:text-cyan-400'
              }`}>Shield</span>
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-cyan-400 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
            </div>
          </button>
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

          <div className="flex-1 bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 shadow-xl shadow-cyan-950/30 rounded-xl flex flex-col relative overflow-hidden min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentMainView} 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-full flex-1 flex flex-col fade-in-quick"
              >
                {currentMainView === 'about' ? (
                  <AboutView onBack={() => setCurrentMainView('workspace')} />
                ) : currentMainView === 'reasoning' ? (
                  <ReasoningView onBack={() => setCurrentMainView('workspace')} />
                ) : currentMainView === 'privacy' ? (
                  <PrivacyView onBack={() => setCurrentMainView('workspace')} />
                ) : (
                  <InvestigationWorkspace 
                    onStateChange={handleWorkspaceStateChange} 
                    isDashboardActive={isDashboardActive} 
                    reportLanguage={reportLanguage} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default LivingDashboard;
