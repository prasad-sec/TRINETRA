import React from 'react';

export default function DynamicEye({ status = 'idle', className = 'w-32 h-32' }) {
  // 1. Configuration object mapping status to specific tailwind colors and animations
  const config = {
    idle: {
      color: 'text-cyan-900 border-cyan-900/30',
      animation: 'animate-pulse duration-3000'
    },
    ready: {
      color: 'text-cyan-500 border-cyan-500/50',
      animation: 'drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]'
    },
    investigating: {
      color: 'text-cyan-400 border-cyan-400/80',
      animation: 'drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]'
    },
    safe: {
      color: 'text-emerald-500 border-emerald-500/50',
      animation: 'drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]'
    },
    suspicious: {
      color: 'text-amber-500 border-amber-500/50',
      animation: 'drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]'
    },
    malicious: {
      color: 'text-rose-500 border-rose-500/50',
      animation: 'drop-shadow-[0_0_25px_rgba(225,29,72,0.7)] animate-pulse'
    }
  };

  const current = config[status] || config.idle;
  const isInvestigating = status === 'investigating';

  return (
    <div className={`relative flex items-center justify-center transition-all duration-700 ease-in-out ${current.animation} ${className}`}>
      {/* Wrapper applies outer glow based on mapped status via current.animation */}
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full transition-all duration-700 ease-in-out ${current.color}`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1: Outer Tech Ring */}
        {/* Thin dashed circle that slowly rotates clockwise */}
        <circle 
          cx="50" cy="50" r="45" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeDasharray="4 4" 
          className="origin-center animate-[spin_10s_linear_infinite] transition-all duration-700 ease-in-out opacity-80"
        />
        
        {/* Layer 2: Inner Tech Ring */}
        {/* Solid, thin circle that rotates counter-clockwise */}
        <circle 
          cx="50" cy="50" r="40" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          className="origin-center animate-[spin_15s_linear_infinite_reverse] transition-all duration-700 ease-in-out opacity-60"
        />

        {/* Layer 3: The Eye Shape */}
        {/* Classic eye/almond shape */}
        <path 
          d="M10 50 Q 50 15 90 50 Q 50 85 10 50 Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="transition-all duration-700 ease-in-out"
          fill="currentColor"
          fillOpacity="0.05"
        />

        {/* Layer 4: The Iris/Pupil */}
        <g className={`origin-center transition-all duration-700 ease-in-out ${isInvestigating ? 'animate-[spin_2s_linear_infinite]' : ''}`}>
          
          {/* Inner Dashed Ring to simulate multi-part iris or scanning lens when investigating */}
          {isInvestigating ? (
            <>
              <circle 
                cx="50" cy="50" r="15" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                className="transition-all duration-700 ease-in-out"
              />
              <circle 
                cx="50" cy="50" r="18" 
                stroke="currentColor" 
                strokeWidth="0.5" 
                strokeDasharray="2 6"
                className="transition-all duration-700 ease-in-out opacity-70"
              />
            </>
          ) : (
            <circle 
              cx="50" cy="50" r="14" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="transition-all duration-700 ease-in-out"
            />
          )}

          {/* Central Pupil */}
          <circle 
            cx="50" cy="50" r="5" 
            fill="currentColor" 
            className="transition-all duration-700 ease-in-out"
          />
        </g>
      </svg>
    </div>
  );
}
