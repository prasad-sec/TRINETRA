import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const CinematicSplash = ({ onComplete }) => {
  const containerControls = useAnimation();
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    "AI Core Initializing...",
    "Loading Threat Intelligence...",
    "Checking IOC Database...",
    "Synchronizing Models...",
    "Behavior Engine Online...",
    "LLM Connected...",
    "System Ready."
  ];

  useEffect(() => {
    // Forcing to true for now so you can see the changes.
    // Normally this would be:
    // const hasLaunched = localStorage.getItem('trinetra_launched');
    setIsFirstLaunch(true);
  }, []);

  useEffect(() => {
    const duration = isFirstLaunch ? 6000 : 1000;
    
    // Log sequence for first launch
    if (isFirstLaunch) {
      const logInterval = setInterval(() => {
        setLogIndex(prev => {
          if (prev < logs.length - 1) return prev + 1;
          clearInterval(logInterval);
          return prev;
        });
      }, 400); // 7 logs * 400ms = 2.8s
      
      setTimeout(() => clearInterval(logInterval), 3000);
    }

    // End sequence
    const endTimeout = setTimeout(() => {
      containerControls.start({ opacity: 0, transition: { duration: 0.5 } }).then(() => {
        onComplete();
      });
    }, duration - 500);

    return () => clearTimeout(endTimeout);
  }, [containerControls, onComplete, isFirstLaunch]);

  if (!isFirstLaunch) {
    // Quick 1-second launch
    return (
      <motion.div
        className="fixed inset-0 z-50 bg-[#030712] flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={containerControls}
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

  // Full 6-second cinematic launch
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#030712] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={containerControls}
    >
      {/* Intense Radial Lighting Background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-[#030712] to-[#030712]"></div>
      </div>

      <div className="relative flex flex-col items-center w-full max-w-2xl px-6 z-10">
        
        {/* The "TRINETRA" Sacred Geometry Core */}
        <div className="relative flex items-center justify-center w-64 h-64 mb-12">
          {/* LAYER 1: Outer Illuminati Triangle (Slow Reverse Spin) */}
          <motion.svg 
            viewBox="0 0 100 100" 
            className="absolute inset-0 w-full h-full text-cyan-500/30 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <polygon points="50,10 90,85 10,85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" />
          </motion.svg>

          {/* LAYER 2: Inner Astrolabe Rings (Fast Spin) */}
          <motion.div 
            className="absolute w-40 h-40 rounded-full border border-cyan-400/40 border-t-cyan-300"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute w-32 h-32 rounded-full border border-purple-500/40 border-b-purple-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* LAYER 3: The Mecha/Anime Eye Core */}
          <motion.svg 
            viewBox="0 0 100 100" 
            className="absolute w-28 h-28 drop-shadow-[0_0_20px_rgba(0,240,255,0.9)]"
          >
            {/* Sharp, angular eyelid (Anime/Mecha style) */}
            <motion.path
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              initial={{ d: "M 10 50 L 50 50 L 90 50" }} 
              animate={{ d: "M 10 50 L 30 30 L 70 30 L 90 50 L 70 70 L 30 70 Z" }}
              transition={{ duration: 0.6, ease: "backOut", delay: 1 }}
            />
            
            {/* Inner Iris (Only visible when open) */}
            <motion.circle
              cx="50"
              cy="50"
              r="12"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              strokeDasharray="4 2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            />
            
            {/* Glowing Pupil */}
            <motion.circle
              cx="50"
              cy="50"
              r="4"
              fill="#FFFFFF"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.5 }}
            />
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
            transition={{ delay: 3.5, duration: 1.2, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl font-sans font-black tracking-[0.5em] text-slate-100 uppercase drop-shadow-[0_0_25px_rgba(0,240,255,0.8)] ml-[0.5em]">
              TRINETRA
            </h1>
          </motion.div>

          <motion.h2
            className="text-xs text-[#00F0FF]/80 tracking-[0.4em] font-sans font-semibold uppercase mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.2, duration: 0.8 }}
          >
            Seeing Beyond Deception
          </motion.h2>
        </div>
      </div>
    </motion.div>
  );
};

export default CinematicSplash;
