import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IRIS_IDLE_R = 15;
const IRIS_BUSY_R = 20;
const IRIS_SCALE_BUSY = IRIS_BUSY_R / IRIS_IDLE_R; // 1.333…

const AIAssistantEye = ({ state = 'idle', progress = 0, className = '' }) => {
  // state: 'idle' | 'investigating' | 'thinking' | 'critical' | 'suspicious' | 'safe'

  const getStateConfig = () => {
    switch (state) {
      case 'critical':
        return {
          primary: '#FF0055',
          glowClass: 'drop-shadow-[0_0_12px_rgba(255,0,85,0.45)]',
          ring: 'rgba(255, 0, 85, 0.25)'
        };
      case 'suspicious':
        return {
          primary: '#F59E0B',
          glowClass: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]',
          ring: 'rgba(245, 158, 11, 0.25)'
        };
      case 'safe':
        return {
          primary: '#10B981',
          glowClass: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]',
          ring: 'rgba(16, 185, 129, 0.25)'
        };
      case 'investigating':
      case 'thinking':
        return {
          primary: '#00F0FF',
          glowClass: 'drop-shadow-[0_0_12px_rgba(0,240,255,0.5)]',
          ring: 'rgba(0, 240, 255, 0.25)'
        };
      case 'idle':
      default:
        return {
          primary: '#0066FF',
          glowClass: 'drop-shadow-[0_0_8px_rgba(0,102,255,0.3)]',
          ring: 'rgba(0, 102, 255, 0.15)'
        };
    }
  };

  const config = getStateConfig();
  const isBusy = state === 'investigating' || state === 'thinking';
  const isThinking = state === 'thinking';

  return (
    <div className={`relative flex items-center justify-center ${className} ${config.glowClass}`}>
      
      {/* Split scan-line: Single motion container driving both segments */}
      <AnimatePresence>
        {isBusy && (
          <motion.div
            key="scan-line-group"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: [-50, 50, -50], opacity: [0.4, 0.85, 0.4] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-x-0 h-[2px] z-20 pointer-events-none flex justify-between"
            style={{ top: '50%' }}
          >
            <div className="w-[38%] h-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
            <div className="w-[38%] h-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Pulse (Idle) - Single smooth hardware-accelerated scale and opacity */}
      {state === 'idle' && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ backgroundColor: config.primary }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.22, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Outer Rings - Single smooth rotation, static polygon inside to eliminate redundant animation loop */}
      <motion.svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full drop-shadow-sm pointer-events-none"
        animate={{ rotate: isBusy ? 360 : 0 }}
        transition={{ duration: isBusy ? 10 : 0, repeat: isBusy ? Infinity : 0, ease: 'linear' }}
        style={{ color: config.ring }}
      >
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        {isBusy && (
          <polygon 
            points="50,2 91.57,74 8.43,74" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="2 2" 
            className="opacity-75"
          />
        )}
      </motion.svg>

      {/* The Eye SVG */}
      <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] overflow-visible relative z-10">
        
        {/* Reasoning Beam */}
        {state === 'thinking' && (
          <motion.path
            d="M 50 50 L 20 120 L 80 120 Z"
            fill="url(#beam-grad)"
            opacity="0.3"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '50px 50px' }}
          />
        )}
        <defs>
          <linearGradient id="beam-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={config.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Eyelid - Morphing path with zero inline drop-shadow filter strings */}
        <motion.path
          fill="none"
          stroke={config.primary}
          strokeWidth="2"
          initial={false}
          animate={{ 
            d: isBusy ? "M 10 50 Q 30 30 90 50 Q 70 70 10 50" : "M 10 50 Q 50 20 90 50 Q 50 80 10 50" 
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        
        {/* Iris - Hardware-accelerated scale tweening and rotation, zero inline filters */}
        <motion.circle
          cx="50"
          cy="50"
          r={IRIS_IDLE_R}
          fill="none"
          stroke={config.primary}
          strokeWidth="1.5"
          strokeDasharray={isBusy ? '2 2' : 'none'}
          animate={{
            scale: isBusy ? IRIS_SCALE_BUSY : (state === 'critical' ? 1.2 : 1),
            rotate: isBusy ? -360 : 0,
          }}
          transition={{
            scale: { type: 'spring', stiffness: 120, damping: 18 },
            rotate: { duration: 5, repeat: isBusy ? Infinity : 0, ease: 'linear' },
          }}
          style={{
            transformOrigin: '50px 50px',
          }}
        />

        {/* Pupil - Single hardware-accelerated scale transform, zero inline filters */}
        <motion.circle
          cx="50"
          cy="50"
          r={isBusy ? 4 : 6}
          fill={config.primary}
          animate={{
            scale: isBusy
              ? (isThinking ? [1, 1.06, 1] : [1, 1.2, 1])
              : (state === 'critical' ? 0.8 : 1),
          }}
          transition={{
            scale: {
              duration: isThinking ? 2.0 : 1.2,
              repeat: isBusy ? Infinity : 0,
              ease: 'easeInOut',
            },
          }}
        />
      </svg>
      
      {/* Progress Text overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none mt-40">
        <AnimatePresence>
          {isBusy && progress > 0 && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-xl font-bold drop-shadow-[0_0_10px_#00F0FF]"
              style={{ color: config.primary }}
            >
              {progress}%
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIAssistantEye;
