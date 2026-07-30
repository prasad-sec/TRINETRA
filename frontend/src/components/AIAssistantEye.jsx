import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssistantEye = ({ state = 'idle', progress = 0, className = '' }) => {
  // state can be: 'idle', 'investigating', 'thinking', 'critical', 'safe'
  
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

  const colors = getColors();
  const isBusy = state === 'investigating' || state === 'thinking';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
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
        transition={{ duration: isBusy ? 3 : 20, repeat: Infinity, ease: "linear" }}
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
            animate={{ 
              opacity: [0.3, 1, 0.3], 
              filter: [
                "drop-shadow(0 0 5px rgba(34,211,238,0.4))", 
                "drop-shadow(0 0 15px rgba(34,211,238,1))", 
                "drop-shadow(0 0 5px rgba(34,211,238,0.4))"
              ] 
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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
        
        {/* Iris */}
        <motion.circle
          cx="50"
          cy="50"
          r={isBusy ? 20 : 15}
          fill="none"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeDasharray={isBusy ? "2 2" : "none"}
          animate={{
            scale: state === 'critical' ? 1.2 : 1,
            opacity: state === 'idle' ? [0.6, 1, 0.6] : 1,
            rotate: isBusy ? -360 : 0
          }}
          transition={{
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.3 },
            rotate: { duration: 4, repeat: Infinity, ease: "linear" }
          }}
          style={{ filter: `drop-shadow(0 0 10px ${colors.glow})`, transformOrigin: '50px 50px' }}
        />

        {/* Pupil */}
        <motion.circle
          cx="50"
          cy="50"
          r={isBusy ? 4 : 6}
          fill={colors.primary}
          animate={{
            scale: state === 'critical' ? 0.8 : 1,
            x: state === 'thinking' ? [-5, 5, -5] : 0
          }}
          transition={{
            x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
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
