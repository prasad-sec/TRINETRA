import React from 'react';
import { motion } from 'framer-motion';

const AIAssistantEye = ({ state = 'idle', className = '' }) => {
  // state can be: 'idle', 'thinking', 'alert'
  
  const getColors = () => {
    switch (state) {
      case 'alert':
        return { primary: '#FF0055', glow: 'rgba(255, 0, 85, 0.5)' };
      case 'thinking':
        return { primary: '#00F0FF', glow: 'rgba(0, 240, 255, 0.5)' };
      case 'idle':
      default:
        return { primary: '#0066FF', glow: 'rgba(0, 102, 255, 0.3)' };
    }
  };

  const colors = getColors();

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Rotating Ring (Only when thinking) */}
      <motion.div
        className="absolute inset-0 rounded-full border border-dashed opacity-50"
        style={{ borderColor: colors.primary }}
        animate={{ rotate: state === 'thinking' ? 360 : 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* The Eye */}
      <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] overflow-visible">
        {/* Eyelid */}
        <motion.path
          fill="none"
          stroke={colors.primary}
          strokeWidth="3"
          d="M 10 50 Q 50 10 90 50 Q 50 90 10 50"
          animate={{ 
            d: state === 'alert' ? "M 10 50 Q 50 20 90 50 Q 50 80 10 50" : "M 10 50 Q 50 10 90 50 Q 50 90 10 50" 
          }}
          transition={{ duration: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
        />
        
        {/* Iris */}
        <motion.circle
          cx="50"
          cy="50"
          r="15"
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          animate={{
            scale: state === 'alert' ? 1.2 : 1,
            opacity: state === 'idle' ? [0.6, 1, 0.6] : 1
          }}
          transition={{
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.3 }
          }}
          style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}
        />

        {/* Pupil */}
        <motion.circle
          cx="50"
          cy="50"
          r="6"
          fill={colors.primary}
          animate={{
            scale: state === 'alert' ? 0.8 : 1,
          }}
          style={{ filter: `drop-shadow(0 0 5px ${colors.glow})` }}
        />
      </svg>
    </div>
  );
};

export default AIAssistantEye;
