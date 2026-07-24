import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIInvestigationResult from './AIInvestigationResult';

const InvestigationWorkspace = ({ onStateChange }) => {
  const [activeTab, setActiveTab] = useState('URL');
  const [investigationState, setInvestigationState] = useState('idle'); // idle, investigating, complete
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState('');

  const tabs = [
    { id: 'URL', label: '🌐 URL', placeholder: 'Enter suspicious URL or IP...' },
    { id: 'EMAIL', label: '📧 EMAIL' },
    { id: 'PDF', label: '📄 PDF' },
    { id: 'QR', label: '📷 QR CODE' },
    { id: 'IMAGE', label: '🖼️ IMAGE' },
  ];

  const logs = [
    "Receiving Artifact...",
    "Parsing Data...",
    "Extracting Indicators...",
    "Threat Intelligence Lookup...",
    "AI Reasoning...",
    "Generating Report...",
    "Investigation Complete"
  ];

  useEffect(() => {
    if (onStateChange) onStateChange(investigationState);

    if (investigationState === 'investigating') {
      let p = 0;
      let logIdx = 0;
      setLogText(logs[0]);

      const interval = setInterval(() => {
        p += 2;
        setProgress(p);
        
        const nextLogIdx = Math.floor((p / 100) * logs.length);
        if (nextLogIdx > logIdx && nextLogIdx < logs.length) {
          logIdx = nextLogIdx;
          setLogText(logs[logIdx]);
        }

        if (p >= 100) {
          clearInterval(interval);
          setLogText(logs[logs.length - 1]);
          setTimeout(() => {
            setInvestigationState('complete');
          }, 500);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [investigationState, onStateChange]);

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (investigationState === 'idle') setInvestigationState('investigating');
  };

  const handleStartInvestigation = () => {
    if (investigationState === 'idle') setInvestigationState('investigating');
  };

  const isInvestigating = investigationState === 'investigating';
  const isComplete = investigationState === 'complete';

  if (isComplete) {
    return <AIInvestigationResult onReset={() => setInvestigationState('idle')} activeTab={activeTab} />;
  }

  return (
    <div className={`flex-1 flex flex-col items-center justify-start relative p-8 transition-colors duration-500 ${isInvestigating ? 'shadow-[inset_0_0_100px_rgba(0,240,255,0.1)]' : ''}`}>
      
      {/* Tab Navigation */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-12 bg-[#0B0F19]/80 border border-slate-800 rounded-lg p-1 backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={isInvestigating}
            className={`flex-1 py-2 px-4 text-xs font-mono tracking-widest uppercase transition-all rounded ${
              activeTab === tab.id
                ? 'border-b-2 border-cyan-400 text-cyan-300 bg-cyan-400/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Background intensity during investigation */}
      {isInvestigating && (
        <motion.div 
          className="absolute inset-0 bg-[#00F0FF]/5 pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* The Eye Core */}
      <div 
        className="relative flex items-center justify-center w-64 h-64 mb-12 z-10 cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={activeTab !== 'URL' ? handleStartInvestigation : undefined}
      >
        {/* Layer 1: Outer Rings */}
        <motion.svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full text-cyan-500/30 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
          animate={{ rotate: isInvestigating ? 360 : -360 }}
          transition={{ duration: isInvestigating ? 2 : 20, repeat: Infinity, ease: "linear" }}
        >
          <polygon points="50,10 90,85 10,85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" />
        </motion.svg>

        {/* Layer 2: Inner Eye */}
        <motion.svg 
          viewBox="0 0 100 100" 
          className="absolute w-28 h-28 drop-shadow-[0_0_20px_rgba(0,240,255,0.9)]"
        >
          <motion.path
            fill="none"
            stroke="#00F0FF"
            strokeWidth="2"
            initial={{ d: "M 10 50 L 50 50 L 90 50" }} 
            animate={{ d: isInvestigating ? "M 10 50 L 30 30 L 70 30 L 90 50 L 70 70 L 30 70 Z" : "M 10 50 L 50 50 L 90 50" }}
            transition={{ duration: 0.6, ease: "backOut" }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="12"
            fill="none"
            stroke="#00F0FF"
            strokeWidth="2"
            strokeDasharray="4 2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isInvestigating ? 1 : 0, opacity: isInvestigating ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="4"
            fill="#FFFFFF"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isInvestigating ? 1 : 0, opacity: isInvestigating ? 1 : 0 }}
          />
        </motion.svg>
        
        {/* Progress Text overlay */}
        <div className="absolute z-20 flex flex-col items-center pointer-events-none mt-40">
          {isInvestigating && (
            <span className="font-mono text-xl font-bold text-cyan-300 drop-shadow-[0_0_10px_#00F0FF]">{progress}%</span>
          )}
        </div>
      </div>

      {/* Input / Info Area */}
      <div className="w-full max-w-lg min-h-[100px] flex flex-col items-center z-10">
        <AnimatePresence mode="wait">
          
          {investigationState === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center w-full"
            >
              {activeTab === 'URL' ? (
                <div className="flex flex-col items-center w-full gap-4">
                   <input 
                      type="text" 
                      placeholder={tabs.find(t => t.id === 'URL').placeholder}
                      className="w-full bg-[#05070A] border border-slate-700 rounded-lg py-3 px-4 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleStartInvestigation(); }}
                   />
                   <button onClick={handleStartInvestigation} className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 font-mono text-xs uppercase tracking-widest hover:bg-cyan-500/20 rounded transition-colors">
                     Begin Investigation
                   </button>
                </div>
              ) : (
                <>
                  <h3 className="font-sans text-sm font-semibold tracking-widest text-slate-300 uppercase mb-2">Investigation Workspace</h3>
                  <p className="font-mono text-xs text-slate-500">Drag & drop artifacts for deep neural analysis.</p>
                </>
              )}
            </motion.div>
          )}

          {isInvestigating && (
            <motion.div 
              key="investigating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="font-mono text-xs text-cyan-300 tracking-wider bg-cyan-400/5 border border-cyan-400/30 p-4 rounded flex items-center justify-between shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <span className="font-bold">{logText}</span>
                <span className="animate-pulse font-bold text-lg">|</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvestigationWorkspace;
