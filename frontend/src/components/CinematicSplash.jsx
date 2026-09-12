import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const CinematicSplash = ({ onComplete, onTransitionStart }) => {
  const containerControls = useAnimation();
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [logIndex, setLogIndex] = useState(0);
  const [skipped, setSkipped] = useState(false);

  const logs = [
    "AI Core Initializing...",
    "Loading Threat Intelligence...",
    "Checking IOC Database...",
    "Synchronizing Models...",
    "Behavior Engine Online...",
    "LLM Connected...",
    "System Ready."
  ];

  const handleSkip = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (skipped) return;
    setSkipped(true);
    if (onTransitionStart) onTransitionStart();
    containerControls.start({
      opacity: 0,
      scale: 1.05,
      transition: { duration: 0.35, ease: "easeOut" }
    }).then(() => {
      onComplete();
    });
  };

  useEffect(() => {
    setIsFirstLaunch(true);
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const duration = isFirstLaunch ? (isMobile ? 3800 : 5000) : 1000;
    
    // Log sequence for first launch
    let logInterval;
    if (isFirstLaunch) {
      logInterval = setInterval(() => {
        setLogIndex(prev => {
          if (prev < logs.length - 1) return prev + 1;
          clearInterval(logInterval);
          return prev;
        });
      }, isMobile ? 300 : 400);
    }

    // End sequence: purely GPU-composited transform and opacity (no filter: brightness)
    const endTimeout = setTimeout(() => {
      if (skipped) return;
      if (onTransitionStart) onTransitionStart();
      
      containerControls.start({
        scale: [1, 1.15, 6],
        opacity: [1, 0.9, 0],
        transition: { duration: 0.65, times: [0, 0.3, 1], ease: "easeInOut" }
      }).then(() => {
        onComplete();
      });
    }, duration - 650);

    return () => {
      if (logInterval) clearInterval(logInterval);
      clearTimeout(endTimeout);
    };
  }, [containerControls, onComplete, isFirstLaunch, logs.length, onTransitionStart, skipped]);

  if (!isFirstLaunch) {
    // Quick 1-second launch
    return (
      <motion.div
        onClick={handleSkip}
        className="fixed inset-0 z-50 bg-theme-bg flex items-center justify-center pointer-events-auto cursor-pointer"
        initial={{ opacity: 1 }}
        animate={containerControls}
        exit={{ opacity: 0 }}
      >
        <motion.h1
          className="text-3xl font-sans font-bold tracking-[0.5em] text-slate-100 uppercase"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Trinetra
        </motion.h1>
      </motion.div>
    );
  }

  // Full cinematic launch with tap-anywhere-to-skip
  return (
    <motion.div
      onClick={handleSkip}
      className="fixed inset-0 z-50 bg-theme-bg flex flex-col items-center justify-center overflow-hidden pointer-events-auto cursor-pointer select-none transform-gpu"
      initial={{ opacity: 1, scale: 1 }}
      animate={containerControls}
      exit={{ opacity: 0 }}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Subtle "Tap to Skip" button visible immediately for mobile users */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip(e);
        }}
        className="absolute top-6 right-6 z-50 pointer-events-auto px-3 py-1.5 rounded-full border border-cyan-500/30 bg-zinc-950/85 hover:bg-cyan-500/10 hover:border-cyan-500/60 text-cyan-400 font-mono text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer"
        aria-label="Skip splash screen"
      >
        <span>Tap to Skip</span>
        <span className="text-cyan-500/70 font-bold">››</span>
      </button>

      {/* Intense Radial Lighting Background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-theme-bg to-theme-bg"></div>
      </div>

      <div className="relative flex flex-col items-center w-full max-w-2xl px-6 z-10 pointer-events-none">
        
        {/* ── CYBERNETIC THIRD EYE HUD ── */}
        <div className="relative flex items-center justify-center w-64 h-64 mb-12">

          {/* LAYER 0: faint radial ambient behind everything */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* LAYER 1: Outer HUD triangle with corner crosshairs — slow counter-clockwise rotation */}
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full transform-gpu will-change-transform will-change-[opacity]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, rotate: -360 }}
            transition={{
              opacity: { duration: 0.8, delay: 0.2 },
              scale: { duration: 0.8, delay: 0.2 },
              rotate: { duration: 28, repeat: Infinity, ease: 'linear', delay: 0 }
            }}
          >
            {/* Main triangle */}
            <polygon
              points="100,14 187,155 13,155"
              fill="none"
              stroke="rgba(6,182,212,0.35)"
              strokeWidth="0.8"
              strokeDasharray="4 3"
            />
            {/* Corner crosshair — top */}
            <line x1="100" y1="4" x2="100" y2="24" stroke="rgba(6,182,212,0.55)" strokeWidth="0.8" />
            <line x1="90" y1="14" x2="110" y2="14" stroke="rgba(6,182,212,0.55)" strokeWidth="0.8" />
            {/* Corner crosshair — bottom-right */}
            <line x1="187" y1="145" x2="187" y2="165" stroke="rgba(6,182,212,0.55)" strokeWidth="0.8" />
            <line x1="177" y1="155" x2="197" y2="155" stroke="rgba(6,182,212,0.55)" strokeWidth="0.8" />
            {/* Corner crosshair — bottom-left */}
            <line x1="13" y1="145" x2="13" y2="165" stroke="rgba(6,182,212,0.55)" strokeWidth="0.8" />
            <line x1="3" y1="155" x2="23" y2="155" stroke="rgba(6,182,212,0.55)" strokeWidth="0.8" />
            {/* Circumscribed faint circle */}
            <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" />
          </motion.svg>

          {/* LAYER 2: Outer HUD ring — clockwise */}
          <motion.div
            className="absolute w-44 h-44 rounded-full transform-gpu will-change-transform will-change-[opacity]"
            style={{
              border: '0.8px solid rgba(6,182,212,0.30)',
              borderTopColor: 'rgba(6,182,212,0.80)',
              boxShadow: '0 0 8px rgba(6,182,212,0.15)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.6, delay: 0.5 },
              rotate: { duration: 8, repeat: Infinity, ease: 'linear' }
            }}
          />

          {/* Tick marks on outer ring */}
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute w-44 h-44 pointer-events-none transform-gpu will-change-transform will-change-[opacity]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45, rotate: 360 }}
            transition={{
              opacity: { duration: 0.6, delay: 0.5 },
              rotate: { duration: 8, repeat: Infinity, ease: 'linear' }
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * 2 * Math.PI;
              const r = 90, inner = i % 6 === 0 ? 80 : 85;
              return (
                <line
                  key={i}
                  x1={100 + r * Math.cos(angle)}
                  y1={100 + r * Math.sin(angle)}
                  x2={100 + inner * Math.cos(angle)}
                  y2={100 + inner * Math.sin(angle)}
                  stroke="rgba(6,182,212,0.9)"
                  strokeWidth={i % 6 === 0 ? '1.5' : '0.7'}
                />
              );
            })}
          </motion.svg>

          {/* LAYER 3: Inner HUD ring — counter-clockwise */}
          <motion.div
            className="absolute w-32 h-32 rounded-full transform-gpu will-change-transform will-change-[opacity]"
            style={{
              border: '0.6px solid rgba(139,92,246,0.30)',
              borderBottomColor: 'rgba(139,92,246,0.75)',
              boxShadow: '0 0 6px rgba(139,92,246,0.10)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: -360 }}
            transition={{
              opacity: { duration: 0.6, delay: 0.7 },
              rotate: { duration: 5, repeat: Infinity, ease: 'linear' }
            }}
          />

          {/* LAYER 4: Central Mecha Iris Eye */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute w-24 h-24 transform-gpu will-change-transform will-change-[opacity] drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.9, ease: 'backOut' }}
          >
            {/* Eyelid aperture: opens from flat line to a sharp hexagonal eye */}
            <motion.path
              fill="rgba(0,0,0,0.6)"
              stroke="#00F0FF"
              strokeWidth="1.5"
              strokeLinejoin="round"
              initial={{ d: 'M 12 50 L 50 50 L 88 50 L 50 50 Z' }}
              animate={{ d: 'M 12 50 L 28 32 L 50 26 L 72 32 L 88 50 L 72 68 L 50 74 L 28 68 Z' }}
              transition={{ duration: 0.7, delay: 1.0, ease: 'backOut' }}
            />

            {/* Iris ring — segmented dashes */}
            <motion.circle
              cx="50" cy="50" r="14"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="1.5"
              strokeDasharray="5 2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: [0, 360]
              }}
              transition={{
                opacity: { duration: 0.4, delay: 1.5 },
                scale: { duration: 0.4, delay: 1.5 },
                rotate: { duration: 12, repeat: Infinity, ease: 'linear', delay: 1.5 }
              }}
              style={{ transformOrigin: '50px 50px' }}
            />

            {/* Pupil core — neon cyan pulse with CSS drop-shadow & GPU scale/opacity */}
            <motion.circle
              cx="50" cy="50" r="5"
              fill="#00F0FF"
              className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0.7, 1],
                scale: [0, 1.2, 1, 1.1],
              }}
              transition={{
                opacity: { duration: 1.2, delay: 1.7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' },
                scale: { duration: 1.2, delay: 1.7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
              }}
            />

            {/* 4 angular tick marks at iris compass points */}
            {[0, 90, 180, 270].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <motion.line
                  key={i}
                  x1={50 + 18 * Math.cos(rad)}
                  y1={50 + 18 * Math.sin(rad)}
                  x2={50 + 24 * Math.cos(rad)}
                  y2={50 + 24 * Math.sin(rad)}
                  stroke="#00F0FF"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ duration: 0.3, delay: 1.6 + i * 0.05 }}
                />
              );
            })}
          </motion.svg>
        </div>

        {/* System Logs */}
        <div className="h-24 w-full flex flex-col items-center justify-start text-center z-40 mb-2">
          <motion.div 
            className="font-mono text-[11px] text-[#00F0FF] tracking-[0.2em] uppercase font-bold px-4 py-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {logs[logIndex]}
            <span className="animate-pulse ml-2 text-white">_</span>
          </motion.div>
        </div>

        {/* Severe Typography */}
        <div className="flex flex-col items-center text-center z-40 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl font-sans font-black tracking-[0.5em] text-slate-100 uppercase drop-shadow-[0_0_25px_rgba(0,240,255,0.8)] ml-[0.5em]">
              TRINETRA
            </h1>
          </motion.div>

          <motion.h2
            className="text-xs text-[#00F0FF]/80 tracking-[0.4em] font-sans font-semibold uppercase mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 0.8 }}
          >
            Seeing Beyond Deception
          </motion.h2>
        </div>
      </div>

      {/* Subtle "Tap anywhere to skip" indicator */}
      <div className="absolute bottom-6 z-40 pointer-events-none text-center">
        <span className="font-mono text-[9px] md:text-[10px] tracking-[0.25em] text-slate-500/80 uppercase">
          Tap anywhere to skip
        </span>
      </div>
    </motion.div>
  );
};

export default CinematicSplash;
