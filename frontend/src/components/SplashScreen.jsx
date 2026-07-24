import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#0B0F19] flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20 opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Eye Logo */}
        <motion.div
          className="relative w-32 h-32 mb-8 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Eyelid Path */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <motion.path
              d="M 10 50 Q 50 10 90 50 Q 50 90 10 50 Z"
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Inner Iris */}
            <motion.circle
              cx="50"
              cy="50"
              r="15"
              fill="url(#iris-gradient)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5, type: "spring", stiffness: 200 }}
            />
            {/* Iris Pulse Effect */}
            <motion.circle
              cx="50"
              cy="50"
              r="15"
              fill="none"
              stroke="url(#iris-gradient)"
              strokeWidth="2"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            />
            <defs>
              <linearGradient id="iris-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Text Content */}
        <motion.h1 
          className="text-4xl md:text-5xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 uppercase mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Trinetra
        </motion.h1>

        <motion.p
          className="text-slate-400 text-sm md:text-base tracking-widest uppercase font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          AI-Powered Digital Threat Investigation Platform
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-16 w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
