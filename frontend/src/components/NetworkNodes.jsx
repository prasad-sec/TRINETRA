import React, { useEffect, useRef } from 'react';

const NetworkNodes = ({ isPaused = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId = null;
    let isRunning = false;
    let particles = [];
    let lastDrawTime = 0;
    let currentWidth = window.innerWidth;
    let currentHeight = window.innerHeight;

    const initParticles = (count, isMobile) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * currentWidth,
          y: Math.random() * currentHeight,
          vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
          vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
          radius: Math.random() * 1.5 + 0.6,
        });
      }
    };

    const resizeCanvas = () => {
      // Cap DPR to 2 to avoid memory and calculation explosion on 3x mobile screens
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      currentWidth = window.innerWidth;
      currentHeight = window.innerHeight;

      canvas.width = Math.floor(currentWidth * dpr);
      canvas.height = Math.floor(currentHeight * dpr);
      canvas.style.width = `${currentWidth}px`;
      canvas.style.height = `${currentHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = currentWidth <= 768;
      const targetParticleCount = isMobile ? 16 : 40;
      initParticles(targetParticleCount, isMobile);
    };

    const draw = (currentTime) => {
      // Pause canvas animation loop entirely if isPaused or document is hidden
      if (isPaused || document.hidden) {
        isRunning = false;
        return;
      }

      // Dynamically check screen width in render loop
      const isMobile = window.innerWidth <= 768;
      const targetFps = isMobile ? 30 : 60;
      const frameInterval = 1000 / targetFps;
      const connectionDistance = isMobile ? 75 : 120;
      const targetParticleCount = isMobile ? 16 : 40;

      // Adjust particle count dynamically
      if (particles.length !== targetParticleCount) {
        if (particles.length > targetParticleCount) {
          particles = particles.slice(0, targetParticleCount);
        } else {
          while (particles.length < targetParticleCount) {
            particles.push({
              x: Math.random() * currentWidth,
              y: Math.random() * currentHeight,
              vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
              vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
              radius: Math.random() * 1.5 + 0.6,
            });
          }
        }
      }

      // Throttle target FPS (30 FPS on mobile <= 768px, 60 FPS on desktop)
      const elapsed = currentTime - lastDrawTime;
      if (elapsed < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = currentTime - (elapsed % frameInterval);

      ctx.clearRect(0, 0, currentWidth, currentHeight);

      // 1. Update & draw particles (dual-circle method: solid inner core + larger low-opacity outer halo, no shadowBlur)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas boundaries
        if (p.x < 0 || p.x > currentWidth) p.vx *= -1;
        if (p.y < 0 || p.y > currentHeight) p.vy *= -1;

        // Outer glow halo (larger, low-opacity)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.fill();

        // Solid inner core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
        ctx.fill();
      }

      // 2. Draw connections
      const pLen = particles.length;
      const connDistSq = connectionDistance * connectionDistance;
      for (let i = 0; i < pLen; i++) {
        for (let j = i + 1; j < pLen; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connDistSq) {
            const distance = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.14 * (1 - distance / connectionDistance)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const startAnimation = () => {
      if (isRunning || isPaused || document.hidden) return;
      isRunning = true;
      lastDrawTime = performance.now();
      animationFrameId = requestAnimationFrame(draw);
    };

    const stopAnimation = () => {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || isPaused) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resizeCanvas();

    if (!isPaused && !document.hidden) {
      startAnimation();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(resizeTimeout);
      stopAnimation();
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default NetworkNodes;
