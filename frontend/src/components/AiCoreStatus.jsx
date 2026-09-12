import React, { useState, useEffect } from 'react';

export default function AiCoreStatus() {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div 
      className="flex flex-col items-center md:items-end gap-1 select-none"
      title={isOnline ? "AI CORE: ONLINE" : "AI CORE: OFFLINE"}
      aria-label={isOnline ? "AI CORE: ONLINE" : "AI CORE: OFFLINE"}
    >
      <span className="text-slate-500">AI Core</span>
      <div className="flex items-center gap-1.5">
        <span className="text-slate-300">
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
        <div 
          className={`w-1.5 h-1.5 rounded-full ${
            isOnline 
              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse' 
              : 'bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.6)]'
          }`} 
        />
      </div>
    </div>
  );
}
