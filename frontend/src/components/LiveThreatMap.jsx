import React from 'react';
import { motion } from 'framer-motion';

const LiveThreatMap = () => {
  // Simplified coordinates representing regions (x, y percentages)
  const regions = [
    { id: 'us', x: 25, y: 35, name: 'USA', active: true, color: '#FF0055' },
    { id: 'br', x: 32, y: 65, name: 'Brazil', active: false, color: '#0066FF' },
    { id: 'uk', x: 48, y: 30, name: 'UK', active: false, color: '#0066FF' },
    { id: 'ru', x: 65, y: 25, name: 'Russia', active: true, color: '#FFB800' },
    { id: 'in', x: 70, y: 45, name: 'India', active: true, color: '#FF0055' },
    { id: 'cn', x: 75, y: 40, name: 'China', active: false, color: '#0066FF' },
    { id: 'au', x: 82, y: 70, name: 'Australia', active: false, color: '#0066FF' },
    { id: 'za', x: 55, y: 75, name: 'South Africa', active: false, color: '#0066FF' },
  ];

  return (
    <div className="relative w-full h-full bg-[#030712] rounded-lg overflow-hidden border border-white/[0.05]">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="font-sans font-semibold text-xs text-slate-300 tracking-widest uppercase">Live Threat Map</h3>
        <p className="font-mono text-[10px] text-slate-500 mt-1">GLOBAL SENSOR NETWORK ACTIVE</p>
      </div>

      {/* Abstract dotted background pattern simulating a map grid */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #00F0FF 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }}
      />

      {/* Connection Arcs (Simulated attacks) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <motion.path
          d="M 25% 35% Q 45% 20% 70% 45%" // US to India
          fill="none"
          stroke="#FF0055"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M 65% 25% Q 40% 10% 25% 35%" // Russia to US
          fill="none"
          stroke="#FFB800"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Regional Nodes */}
      {regions.map((region) => (
        <div 
          key={region.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${region.x}%`, top: `${region.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            {region.active && (
              <motion.div
                className="absolute w-8 h-8 rounded-full border border-current opacity-50"
                style={{ color: region.color }}
                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <div 
              className="w-2 h-2 rounded-full z-10 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: region.color, color: region.color }}
            />
          </div>
          <span className="mt-1 font-mono text-[9px] font-bold text-slate-400 tracking-wider">
            {region.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LiveThreatMap;
