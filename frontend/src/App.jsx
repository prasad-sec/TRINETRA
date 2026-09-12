import React, { useState } from 'react';
import NetworkNodes from './components/NetworkNodes';
import CinematicSplash from './components/CinematicSplash';
import LivingDashboard from './components/LivingDashboard';
import AboutHologram from './components/AboutHologram';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isSplashPlaying, setIsSplashPlaying] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleTransitionStart = () => {
    setIsTransitioning(true);
    setIsSplashPlaying(false);
  };

  const handleSplashComplete = () => {
    setIsSplashPlaying(false);
    setShowSplash(false);
  };

  // Delay heavy rendering/mounting of LivingDashboard until splash finishes or transitions out
  const shouldRenderDashboard = isTransitioning || !showSplash;

  return (
    <div className="relative w-full min-h-screen bg-theme-bg overflow-x-hidden flex">
      {/* Background canvas layer: paused while splash screen is active playing */}
      <NetworkNodes isPaused={isSplashPlaying} />

      {/* Main Orchestration */}
      {/* 1. Dashboard: Rendering delayed until splash finishes or transitions out to prevent simultaneous render thrashing */}
      <AnimatePresence>
        {shouldRenderDashboard && (
          <motion.div
            key="living-dashboard-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="w-full min-h-screen relative z-10"
            style={{ willChange: "transform, opacity" }}
          >
            <LivingDashboard 
              isDashboardActive={true} 
              onOpenAbout={() => setIsAboutOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Splash mounted on top */}
      <AnimatePresence>
        {showSplash && (
          <CinematicSplash 
            key="splash" 
            onTransitionStart={handleTransitionStart}
            onComplete={handleSplashComplete} 
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
