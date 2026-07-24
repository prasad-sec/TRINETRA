import React, { useState } from 'react';
import NetworkNodes from './components/NetworkNodes';
import CinematicSplash from './components/CinematicSplash';
import LivingDashboard from './components/LivingDashboard';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="relative w-full h-screen bg-[#030712] overflow-hidden">
      {/* Background canvas layer always present */}
      <NetworkNodes />

      {/* Main Orchestration */}
      {showSplash ? (
        <CinematicSplash onComplete={() => setShowSplash(false)} />
      ) : (
        <LivingDashboard />
      )}
    </div>
  );
}

export default App;
