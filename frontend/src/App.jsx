import React, { useState } from 'react';
import NetworkNodes from './components/NetworkNodes';
import CinematicSplash from './components/CinematicSplash';
import LivingDashboard from './components/LivingDashboard';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-theme-bg overflow-x-hidden">
      {/* Background canvas layer always present */}
      <NetworkNodes />

      {/* Main Orchestration */}
      {/* 1. Dashboard mounted underneath */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={(isTransitioning || !showSplash) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="w-full min-h-screen relative z-10"
        style={{ willChange: "transform, opacity" }}
      >
        <LivingDashboard isDashboardActive={isTransitioning || !showSplash} />
      </motion.div>

      {/* 2. Splash mounted on top */}
      <AnimatePresence>
        {showSplash && (
          <CinematicSplash 
            key="splash" 
            onTransitionStart={() => setIsTransitioning(true)}
            onComplete={() => setShowSplash(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
