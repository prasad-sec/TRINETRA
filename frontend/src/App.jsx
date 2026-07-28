import React, { useState } from 'react';
import NetworkNodes from './components/NetworkNodes';
import CinematicSplash from './components/CinematicSplash';
import LivingDashboard from './components/LivingDashboard';
import AboutHologram from './components/AboutHologram';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-theme-bg overflow-x-hidden flex">
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
        <LivingDashboard 
          isDashboardActive={isTransitioning || !showSplash} 
          onOpenAbout={() => setIsAboutOpen(true)}
        />
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

      {/* 3. Hologram Modal mounted on top of everything */}
      <AnimatePresence>
        {isAboutOpen && (
          <AboutHologram onClose={() => setIsAboutOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
