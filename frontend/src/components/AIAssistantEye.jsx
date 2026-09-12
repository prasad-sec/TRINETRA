import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix 3: iris radius stays fixed at IDLE_R; we animate scale instead so
// Framer Motion can tween it. Spring stiffness:120 / damping:18 ≈ 450ms
// ease-out settle, zero overshoot.
const IRIS_IDLE_R  = 15;
const IRIS_BUSY_R  = 20;
const IRIS_SCALE_BUSY = IRIS_BUSY_R / IRIS_IDLE_R; // 1.333…

const AIAssistantEye = ({ state = 'idle', progress = 0, className = '' }) => {
  // state: 'idle' | 'investigating' | 'thinking' | 'critical' | 'suspicious' | 'safe'

  const getColors = () => {
    switch (state) {
      case 'critical':
        return { primary: '#FF0055', glow: 'rgba(255, 0, 85, 0.5)', ring: 'rgba(255, 0, 85, 0.2)' };
      case 'suspicious':
        return { primary: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)', ring: 'rgba(245, 158, 11, 0.2)' };
      case 'safe':
        return { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.5)', ring: 'rgba(16, 185, 129, 0.2)' };
      case 'investigating':
      case 'thinking':
        return { primary: '#00F0FF', glow: 'rgba(0, 240, 255, 0.5)', ring: 'rgba(0, 240, 255, 0.2)' };
      case 'idle':
      default:
        return { primary: '#0066FF', glow: 'rgba(0, 102, 255, 0.3)', ring: 'rgba(0, 102, 255, 0.1)' };
    }
  };

  const colors     = getColors();
  const isBusy     = state === 'investigating' || state === 'thinking';
  // Fix 5: when beam is active ('thinking'), suppress pupil drift so we don't
  // have 4 simultaneous animations competing on a tiny icon.
  const isThinking = state === 'thinking';

  return (
    <div className={`relative flex items-center justify-center ${className} ${isBusy ? 'drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]' : ''}`}>
      
      {/* Fix 2: Split scan-line — left and right segments with a gap
           spanning the eye's bounding box (≈38%–62% of the container).
           The gap means the line never visually bisects the pupil.        */}
      <AnimatePresence>
        {isBusy && (
          <>
            <motion.div
              key="scan-left"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: [-60, 60, -60], opacity: [0.45, 0.9, 0.45] }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 h-[2px] bg-cyan-300 shadow-[0_0_10px_#22d3ee] z-20 pointer-events-none"
              style={{ top: '50%', right: '62%' }}
            />
            <motion.div
              key="scan-right"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: [-60, 60, -60], opacity: [0.45, 0.9, 0.45] }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute right-0 h-[2px] bg-cyan-300 shadow-[0_0_10px_#22d3ee] z-20 pointer-events-none"
              style={{ top: '50%', left: '62%' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Background Pulse (Idle) */}
      {state === 'idle' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: colors.glow }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Outer Rings (Rotating during active states) */}
      <motion.svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full drop-shadow-md"
        animate={{ rotate: isBusy ? 360 : 0 }}
        transition={{ duration: isBusy ? 10 : 0, repeat: isBusy ? Infinity : 0, ease: "linear" }}
        style={{ color: colors.ring }}
      >
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        {isBusy && (
          <motion.polygon 
            points="50,2 91.57,74 8.43,74" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            strokeDasharray="2 2" 
            className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            animate={{ 
              opacity: [0.35, 1, 0.35],
              scale: [0.99, 1.01, 0.99]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: '50px 50px' }}
          />
        )}
      </motion.svg>

      {/* The Eye SVG */}
      <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] overflow-visible relative z-10">
        
        {/* Subtle Cyan Beam during reasoning */}
        {state === 'thinking' && (
          <motion.path
            d="M 50 50 L 20 120 L 80 120 Z"
            fill="url(#beam-grad)"
            opacity="0.3"
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: '50px 50px' }}
          />
        )}
        <defs>
          <linearGradient id="beam-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Eyelid */}
        <motion.path
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          initial={false}
          animate={{ 
            d: isBusy ? "M 10 50 Q 30 30 90 50 Q 70 70 10 50" : "M 10 50 Q 50 20 90 50 Q 50 80 10 50" 
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
        />
        
        {/* Fix 3: Iris — radius change now driven by Framer Motion scale
             instead of a bare r-prop swap React cannot tween.
             Spring stiffness:120, damping:18 → ~450ms ease-out, no overshoot. */}
        <motion.circle
          cx="50"
          cy="50"
          r={IRIS_IDLE_R}
          fill="none"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeDasharray={isBusy ? '2 2' : 'none'}
          animate={{
            scale:   isBusy ? IRIS_SCALE_BUSY : (state === 'critical' ? 1.2 : 1),
            opacity: state === 'idle' ? [0.6, 1, 0.6] : 1,
            rotate:  isBusy ? -360 : 0,
          }}
          transition={{
            scale:   { type: 'spring', stiffness: 120, damping: 18 },
            opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            rotate:  { duration: 4, repeat: Infinity, ease: 'linear' },
          }}
          style={{
            filter: `drop-shadow(0 0 10px ${colors.glow})`,
            transformOrigin: '50px 50px',
          }}
        />

        {/* Fix 5: Pupil — when 'thinking' the beam is the dominant motion;
             suppress x-drift entirely and soften scale to [1,1.05,1] so only
             2 animations run (iris rotate + beam sweep) instead of 4.          */}
        <motion.circle
          cx="50"
          cy="50"
          r={isBusy ? 4 : 6}
          fill={colors.primary}
          animate={{
            scale:   isBusy
                       ? (isThinking ? [1, 1.05, 1] : [1, 1.2, 1])
                       : (state === 'critical' ? 0.8 : 1),
            opacity: isBusy ? [0.8, 1, 0.8] : 1,
            x:       0,   // drift disabled; beam sweep is the motion signal
          }}
          transition={{
            scale:   {
              duration: isThinking ? 2.0 : 1,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ filter: `drop-shadow(0 0 15px ${colors.glow})` }}
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
              style={{ color: colors.primary }}
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
