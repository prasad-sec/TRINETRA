import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Shield, Link, Mail, FileText, QrCode, Monitor } from 'lucide-react';
import AIInvestigationResult from './AIInvestigationResult';
import AIAssistantEye from './AIAssistantEye';
import EmailWorkspace from './EmailWorkspace';
import PdfWorkspace from './PdfWorkspace';

const STAGES = [
  "Artifact Received",
  "Normalizing Data",
  "Extracting Indicators",
  "Threat Intelligence Correlation",
  "Behavior Analysis",
  "AI Reasoning",
  "Investigation Report Generated"
];

const InvestigationWorkspace = ({ onStateChange, isDashboardActive = true }) => {
  const [activeTab, setActiveTab] = useState('URL');
  // State machine: idle, investigating, reasoning, completed, error
  const [investigationState, setInvestigationState] = useState('idle'); 
  const [activeStage, setActiveStage] = useState(0);
  const [investigationStartTime, setInvestigationStartTime] = useState(null);
  const [backendCompleted, setBackendCompleted] = useState(false);
  
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [apiResult, setApiResult] = useState(null);

  const tabs = [
    { id: 'URL', label: 'URL', icon: Link, placeholder: 'Enter suspicious URL or IP...' },
    { id: 'EMAIL', label: 'EMAIL', icon: Mail },
    { id: 'PDF', label: 'PDF', icon: FileText },
    { id: 'QR', label: 'QR CODE', icon: QrCode },
    { id: 'SCREENSHOT', label: 'SCREENSHOT', icon: Monitor },
  ];

  useEffect(() => {
    if (onStateChange) onStateChange(investigationState);
  }, [investigationState, onStateChange]);

  // Pipeline Progression Orchestrator
  useEffect(() => {
    let interval;
    if (investigationState === 'investigating' || investigationState === 'reasoning') {
      interval = setInterval(() => {
        setActiveStage(prev => {
          if (prev < 5) return prev + 1; // 5 is AI Reasoning
          return prev; // Pause at 5 if we haven't resolved yet
        });
      }, 200); // Progress every 200ms naturally
    }
    return () => clearInterval(interval);
  }, [investigationState]);

  // Sync state to 'reasoning' when stage hits 5
  useEffect(() => {
    if (activeStage === 5 && investigationState === 'investigating') {
      setInvestigationState('reasoning');
    }
  }, [activeStage, investigationState]);

  // Minimum Investigation Duration & Backend Sync
  useEffect(() => {
    if (backendCompleted && apiResult) {
      const timeElapsed = Date.now() - investigationStartTime;
      const timeRemaining = Math.max(0, 1200 - timeElapsed);

      const finalize = () => {
        setActiveStage(STAGES.length - 1); // 6: Report Generated
        
        // Pause briefly on the final stage so the user reads it before transitioning
        setTimeout(() => {
          setInvestigationState('completed');
          setBackendCompleted(false);
        }, 400); 
      };

      if (timeRemaining > 0) {
        const timer = setTimeout(finalize, timeRemaining);
        return () => clearTimeout(timer);
      } else {
        finalize();
      }
    }
  }, [backendCompleted, apiResult, investigationStartTime]);

  const handleAnalysisComplete = (data) => {
    setApiResult(data);
    setBackendCompleted(true);
  };

  const initInvestigation = () => {
    setInvestigationState('investigating');
    setActiveStage(0);
    setInvestigationStartTime(Date.now());
    setBackendCompleted(false);
    setApiResult(null);
    setErrorMsg('');
  };

  const handleStartInvestigation = async () => {
    let currentInputUrl = inputUrl;
    if (activeTab === 'URL') {
      const trimmedUrl = inputUrl?.trim() || '';
      if (!trimmedUrl || (!trimmedUrl.includes('.') && !trimmedUrl.includes(':'))) {
        setErrorMsg('Please enter a valid URL or IP address');
        return;
      }
      currentInputUrl = trimmedUrl;
      setErrorMsg('');
    }

    if (investigationState === 'idle' || investigationState === 'error') {
      initInvestigation();

      try {
        const payload = activeTab === 'URL' ? { url: currentInputUrl } : { url: 'dropped_artifact' };
        
        const res = await fetch('http://localhost:8000/api/investigate/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        handleAnalysisComplete(data);
      } catch (_err) {
        setInvestigationState('error');
        setErrorMsg('Connection Error: Unable to reach FastAPI backend.');
      }
    }
  };

  const isBusy = investigationState === 'investigating' || investigationState === 'reasoning';

  // Determine Eye State
  let currentEyeState = 'idle';
  if (investigationState === 'investigating') currentEyeState = 'investigating';
  else if (investigationState === 'reasoning') currentEyeState = 'thinking';
  else if (investigationState === 'completed') {
     const verdict = apiResult?.ai_analysis?.verdict?.toLowerCase();
     if (verdict === 'safe') currentEyeState = 'safe';
     else if (verdict === 'suspicious') currentEyeState = 'suspicious';
     else if (verdict === 'malicious') currentEyeState = 'critical';
     else currentEyeState = 'safe';
  } else if (investigationState === 'error') {
     currentEyeState = 'critical';
  }

  return (
    <AnimatePresence mode="wait">
      {investigationState === 'completed' ? (
        <motion.div 
          key="report"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full flex-1 flex flex-col"
        >
          <AIInvestigationResult 
            onReset={() => {
              setInvestigationState('idle');
              setInputUrl('');
              setApiResult(null);
              setBackendCompleted(false);
              setActiveStage(0);
            }} 
            activeTab={activeTab} 
            apiResult={apiResult}
            artifactName={inputUrl}
          />
        </motion.div>
      ) : (
        <motion.div 
          key="workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col items-center justify-start relative p-4 md:p-8 transition-colors duration-500 w-full overflow-hidden"
        >
          
          {/* Background intensity during investigation */}
          {isBusy && (
            <motion.div 
              className="absolute inset-0 bg-cyan-500/5 pointer-events-none z-0"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Tab Navigation - Scrollable on mobile */}
          <div className="w-full max-w-3xl flex items-center justify-start md:justify-between mb-12 md:mb-20 border-b border-theme-border z-10 overflow-x-auto scrollbar-hide snap-x gap-2 md:gap-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setErrorMsg(''); }}
                  disabled={isBusy}
                  className={`flex-1 min-w-[100px] md:min-w-0 py-4 px-2 md:px-0 flex items-center justify-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase transition-all relative shrink-0 snap-center ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="inline-block">{tab.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main container vertically aligned */}
          <div className="flex-1 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 z-10">
            
            {/* The Eye Core - Visual Anchor with shrink-0 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isDashboardActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="w-64 h-64 md:w-80 md:h-80 shrink-0 flex items-center justify-center relative"
            >
              <motion.div 
                className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,240,255,0.12),transparent_60%)] -z-10 rounded-full pointer-events-none"
                animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              {isDashboardActive && (
                <AIAssistantEye state={currentEyeState} className="w-full h-full" />
              )}
            </motion.div>

            {/* Workspace Action Area */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={isDashboardActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex-1 flex flex-col justify-center w-full max-w-full md:max-w-lg items-center text-center md:items-start md:text-left"
            >
              <AnimatePresence mode="wait">
                
                {(investigationState === 'idle' || investigationState === 'error') && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col justify-center w-full items-center text-center md:items-start md:text-left"
                  >
                    <div className="mb-6 md:mb-8 w-full">
                      <h2 className="font-sans text-xl md:text-2xl font-semibold text-slate-100 mb-2">Investigation Workspace</h2>
                      <p className="font-sans text-xs md:text-sm text-slate-400">Submit a suspicious digital artifact to begin an investigation.</p>
                    </div>

                    <div key={activeTab} className="w-full animate-[fadeIn_0.5s_ease-in-out] opacity-100 transition-opacity duration-700 ease-in-out">
                      {activeTab === 'URL' ? (
                        <div className="flex flex-col gap-4 relative w-full group animate-[fadeIn_0.5s_ease-in-out] opacity-100 transition-opacity duration-700 ease-in-out">
                          <div className="relative flex items-center w-full">
                            <div className="absolute left-4 text-cyan-500">
                              <Crosshair className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <input 
                              type="text" 
                              value={inputUrl}
                              onChange={(e) => {
                                setInputUrl(e.target.value);
                                setErrorMsg('');
                              }}
                              placeholder={tabs.find(t => t.id === 'URL').placeholder}
                              className="w-full bg-theme-surface-2 border border-theme-border rounded-none py-4 md:py-5 pl-12 md:pl-14 pr-4 text-slate-100 font-mono text-sm md:text-base focus:outline-none focus:border-cyan-500/80 focus:bg-theme-surface focus:shadow-[inset_0_0_20px_rgba(0,240,255,0.05)] transition-all placeholder:text-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                              onKeyDown={(e) => { if (e.key === 'Enter') handleStartInvestigation(); }}
                            />
                          </div>
                          {errorMsg && (
                            <div className="text-red-400 text-xs mt-1 text-center md:text-left">
                              {errorMsg}
                            </div>
                          )}
                          <button 
                            onClick={handleStartInvestigation} 
                            className="w-full py-4 md:py-5 bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs md:text-sm uppercase tracking-[0.3em] hover:bg-cyan-500/20 hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)] rounded-none transition-all"
                          >
                            BEGIN INVESTIGATION
                          </button>
                        </div>
                      ) : activeTab === 'EMAIL' ? (
                        <EmailWorkspace 
                          setReportData={handleAnalysisComplete}
                          setEyeStatus={() => {}}
                          setIsInvestigating={(status) => {
                            if (status) initInvestigation();
                            else if (investigationState !== 'completed') setInvestigationState('error');
                          }}
                        />
                      ) : activeTab === 'PDF' ? (
                        <PdfWorkspace 
                          onAnalysisComplete={handleAnalysisComplete}
                          setEyeStatus={() => {}}
                          setIsInvestigating={(status) => {
                            if (status) initInvestigation();
                            else if (investigationState !== 'completed') setInvestigationState('error');
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 md:p-12 border border-dashed border-theme-border rounded-xl bg-theme-surface/30 w-full animate-[fadeIn_0.5s_ease-in-out] opacity-100 transition-opacity duration-700 ease-in-out">
                           <Shield className="w-10 h-10 md:w-12 md:h-12 text-slate-600 mb-4" />
                           <h3 className="font-sans text-xs md:text-sm font-semibold tracking-widest text-slate-300 uppercase mb-2">Drop Artifact Here</h3>
                           <p className="font-mono text-[10px] md:text-xs text-slate-500 text-center">Supported formats: Email, PDF, QR Code, Screenshot.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {isBusy && (
                  <motion.div 
                    key="investigating"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full flex flex-col justify-center text-center md:text-left items-center md:items-start"
                  >
                    <div className="mb-4 md:mb-6">
                      <h3 className="font-sans text-xs md:text-sm font-semibold tracking-widest text-cyan-400 uppercase mb-1">
                        {investigationState === 'reasoning' ? 'AI Reasoning Active' : 'Investigation Active'}
                      </h3>
                      <p className="font-mono text-[10px] md:text-xs text-slate-500">
                        {investigationState === 'reasoning' ? 'Correlating evidence and establishing verdict...' : 'Analyzing artifact signatures and behavior...'}
                      </p>
                    </div>

                    <div className="flex flex-col justify-center gap-3 w-full max-w-[250px] md:max-w-none items-start">
                      {STAGES.map((stage, idx) => {
                        const isActive = idx === activeStage;
                        const isCompleted = idx < activeStage;

                        return (
                          <div key={stage} className="flex items-center gap-3 md:gap-4">
                            <div className="flex flex-col items-center w-4">
                              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                                isCompleted ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 
                                isActive ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse' : 
                                'bg-theme-surface-2'
                              }`} />
                              {idx !== STAGES.length - 1 && (
                                <div className={`w-px h-5 md:h-6 ${isCompleted ? 'bg-cyan-500/50' : 'bg-theme-surface-2'}`} />
                              )}
                            </div>
                            <span className={`font-mono text-[9px] md:text-xs uppercase tracking-wider transition-colors duration-300 ${
                              isCompleted ? 'text-cyan-500' : 
                              isActive ? 'text-amber-400' : 
                              'text-slate-600'
                            }`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvestigationWorkspace;
