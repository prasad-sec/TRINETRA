import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Shield, Link, Mail, FileText, QrCode, Image as ImageIcon } from 'lucide-react';
import AIInvestigationResult from './AIInvestigationResult';
import AIAssistantEye from './AIAssistantEye';
import EmailWorkspace from './EmailWorkspace';
import PdfWorkspace from './PdfWorkspace';
import QrWorkspace from './QrWorkspace';
import ImageWorkspace from './ImageWorkspace';

// Fix 4: Sub-status messages shown under the active step label during long waits.
// Index maps to STAGES index (0-6); steps not listed get the default ticker.
const STAGE_SUB_STATUSES = {
  3: ['Cross-referencing IOC feeds…', 'Querying threat databases…', 'Geo-locating suspicious assets…'],
  4: ['Profiling behavioral fingerprints…', 'Mapping sandbox signals…', 'Scoring anomaly patterns…'],
  5: ['Correlating evidence…', 'Building verdict chain…', 'Synthesising AI report…', 'Estimating confidence…'],
};
const DEFAULT_SUB_STATUSES = ['Processing…', 'Extracting signals…', 'Parsing artifact…'];

// Animated ellipsis — 3 dots fade in sequentially
const AnimatedEllipsis = () => (
  <span className="inline-flex gap-[2px] ml-1">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="text-amber-400 font-bold"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
      >.</motion.span>
    ))}
  </span>
);

const STAGES = [
  "Artifact Received",
  "Normalizing Data",
  "Extracting Indicators",
  "Threat Intelligence Correlation",
  "Behavior Analysis",
  "AI Reasoning",
  "Investigation Report Generated"
];

const InvestigationWorkspace = ({ onStateChange, isDashboardActive = true, reportLanguage = 'English' }) => {
  const [activeTab, setActiveTab] = useState('URL');
  // State machine: idle, investigating, reasoning, completed, error
  const [investigationState, setInvestigationState] = useState('idle'); 
  const [activeStage, setActiveStage] = useState(0);
  const [investigationStartTime, setInvestigationStartTime] = useState(null);
  const [backendCompleted, setBackendCompleted] = useState(false);
  
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [apiResult, setApiResult] = useState(null);

  // Fix 4: Track sub-status index per stage for the cycling ticker
  const [subStatusIdx, setSubStatusIdx] = useState(0);
  const subStatusTimerRef = useRef(null);

  const tabs = [
    { id: 'URL', label: 'URL', icon: Link, placeholder: 'Enter suspicious URL or IP...' },
    { id: 'EMAIL', label: 'EMAIL', icon: Mail },
    { id: 'PDF', label: 'PDF', icon: FileText },
    { id: 'QR', label: 'QR CODE', icon: QrCode },
    { id: 'IMAGES', label: 'IMAGES', icon: ImageIcon },
  ];

  useEffect(() => {
    if (onStateChange) onStateChange(investigationState);
  }, [investigationState, onStateChange]);

  // Fix 4: Cycle sub-status text whenever the active stage changes
  useEffect(() => {
    setSubStatusIdx(0);
    if (subStatusTimerRef.current) clearInterval(subStatusTimerRef.current);
    if (investigationState === 'investigating' || investigationState === 'reasoning') {
      const messages = STAGE_SUB_STATUSES[activeStage] || DEFAULT_SUB_STATUSES;
      subStatusTimerRef.current = setInterval(() => {
        setSubStatusIdx(prev => (prev + 1) % messages.length);
      }, 1800);
    }
    return () => { if (subStatusTimerRef.current) clearInterval(subStatusTimerRef.current); };
  }, [activeStage, investigationState]);

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
    if (activeTab === 'URL') {
      const trimmedUrl = inputUrl?.trim() || '';
      if (!trimmedUrl || (!trimmedUrl.includes('.') && !trimmedUrl.includes(':'))) {
        setErrorMsg('Please enter a valid URL or IP address');
        return;
      }
      setErrorMsg('');
    }

    if (investigationState === 'idle' || investigationState === 'error') {
      initInvestigation();

      try {
        const bodyPayload = activeTab === 'URL' 
          ? JSON.stringify({ url: inputUrl, target_language: reportLanguage }) 
          : JSON.stringify({ url: 'dropped_artifact', target_language: reportLanguage });
        
        const res = await fetch('http://localhost:8000/api/investigate/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyPayload
        });
        
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        handleAnalysisComplete(data);
      } catch {
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
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
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-start relative p-4 md:p-8 transition-colors w-full overflow-hidden"
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
          <div className="w-full max-w-3xl flex items-center justify-start md:justify-between mb-6 md:mb-8 border-b border-zinc-800 z-10 overflow-x-auto scrollbar-hide snap-x gap-1.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setErrorMsg(''); }}
                  disabled={isBusy}
                  className={`flex-1 min-w-[90px] md:min-w-0 py-2 px-3 flex items-center justify-center gap-1.5 text-[11px] font-mono font-semibold tracking-wider uppercase transition-all relative shrink-0 snap-center rounded-none ${
                    isActive ? 'text-cyan-400 bg-zinc-950/60 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/40 hover:backdrop-blur-xl'
                  } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="inline-block">{tab.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
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
                      <h2 className="font-mono text-xl md:text-2xl font-semibold text-zinc-100 mb-2 tracking-tight">Investigation Workspace</h2>
                      <p className="font-mono text-xs md:text-sm text-zinc-400">Submit a suspicious digital artifact to begin an investigation.</p>
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
                              className="w-full bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-none py-4 md:py-5 pl-12 md:pl-14 pr-4 text-zinc-100 font-mono text-sm md:text-base focus:outline-none focus:border-cyan-500/30 focus:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(6,182,212,0.2)] transition-all placeholder:text-zinc-600"
                              onKeyDown={(e) => { if (e.key === 'Enter') handleStartInvestigation(); }}
                            />
                          </div>
                          {errorMsg && (
                            <div className="text-red-400 text-xs mt-1 text-center md:text-left font-mono">
                              {errorMsg}
                            </div>
                          )}
                          <button 
                            onClick={handleStartInvestigation} 
                            className="w-full py-4 md:py-5 bg-zinc-950/60 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-cyan-400 font-mono font-bold text-xs md:text-sm uppercase tracking-[0.3em] hover:border-cyan-500/30 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(6,182,212,0.2)] rounded-none transition-all"
                          >
                            BEGIN INVESTIGATION
                          </button>
                        </div>
                      ) : activeTab === 'EMAIL' ? (
                        <EmailWorkspace 
                          targetLanguage={reportLanguage}
                          setReportData={handleAnalysisComplete}
                          setIsInvestigating={(status) => {
                            if (status) initInvestigation();
                            else if (investigationState !== 'completed') setInvestigationState('error');
                          }}
                        />
                      ) : activeTab === 'PDF' ? (
                        <PdfWorkspace 
                          targetLanguage={reportLanguage}
                          onAnalysisComplete={handleAnalysisComplete}
                          setIsInvestigating={(status) => {
                            if (status) initInvestigation();
                          }}
                          setInvestigationState={setInvestigationState}
                        />
                      ) : activeTab === 'QR' ? (
                        <QrWorkspace 
                          targetLanguage={reportLanguage}
                          onResult={handleAnalysisComplete}
                          setIsInvestigating={(status) => {
                            if (status) initInvestigation();
                          }}
                        />
                      ) : activeTab === 'IMAGES' ? (
                        <ImageWorkspace 
                          targetLanguage={reportLanguage}
                          onResult={handleAnalysisComplete}
                          setIsInvestigating={(status) => {
                            if (status) initInvestigation();
                            else if (investigationState !== 'completed') setInvestigationState('error');
                          }}
                          setInvestigationState={setInvestigationState}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-zinc-950/70 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/40 transition-colors rounded-xl shadow-xl shadow-cyan-950/30 w-full animate-[fadeIn_0.5s_ease-in-out] opacity-100 duration-500">
                           <Shield className="w-10 h-10 md:w-12 md:h-12 text-zinc-600 mb-4" />
                           <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">Drop Artifact Here</h3>
                           <p className="font-mono text-[10px] md:text-xs text-zinc-500 text-center">Supported formats: Email, PDF, QR Code, Images.</p>
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
                    <div className="mb-6 md:mb-8 flex flex-col items-center md:items-start">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">
                        {investigationState === 'reasoning' ? 'AI Core Processing Vector...' : 'AI Core Processing Vector...'}
                      </h3>
                      <p className="font-mono text-[10px] md:text-xs text-zinc-500">
                        {investigationState === 'reasoning' ? 'Correlating evidence and establishing verdict...' : 'Analyzing artifact signatures and behavior...'}
                      </p>
                    </div>

                    <div className="flex flex-col justify-center gap-3 w-full max-w-[250px] md:max-w-none items-start">
                      {STAGES.map((stage, idx) => {
                        const isActive    = idx === activeStage;
                        const isCompleted = idx < activeStage;
                        const messages    = STAGE_SUB_STATUSES[idx] || DEFAULT_SUB_STATUSES;
                        const subText     = messages[subStatusIdx % messages.length];

                        return (
                          <div key={stage} className="flex items-center gap-3 md:gap-4">
                            <div className="flex flex-col items-center w-4">
                              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-300 ${
                                isCompleted ? 'bg-cyan-500 shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 
                                isActive ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse' : 
                                'bg-zinc-800'
                              }`} />
                              {idx !== STAGES.length - 1 && (
                                <div className={`w-px h-5 md:h-6 ${isCompleted ? 'bg-cyan-500/50' : 'bg-zinc-800'}`} />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`font-mono text-[9px] md:text-xs uppercase tracking-wider transition-colors duration-300 ${
                                isCompleted ? 'text-cyan-500' : 
                                isActive ? 'text-amber-400' : 
                                'text-slate-600'
                              }`}>
                                {stage}{isActive && <AnimatedEllipsis />}
                              </span>
                              {/* Fix 4: Cycling sub-status line under the active step */}
                              {isActive && (
                                <AnimatePresence mode="wait">
                                  <motion.span
                                    key={subStatusIdx}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className="font-mono text-[8px] md:text-[10px] text-zinc-500 mt-0.5 italic"
                                  >
                                    {subText}
                                  </motion.span>
                                </AnimatePresence>
                              )}
                            </div>
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
