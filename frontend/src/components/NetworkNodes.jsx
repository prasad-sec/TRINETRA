import React, { useEffect, useRef } from 'react';

const NetworkNodes = ({ isPaused = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let isMobile = window.innerWidth < 768;
    let particleCount = isMobile ? 16 : 35;
    let connectionDistance = isMobile ? 75 : 115;
    const targetFps = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFps;
    let lastDrawTime = 0;
    let currentWidth = window.innerWidth;
    let currentHeight = window.innerHeight;

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

      isMobile = currentWidth < 768;
      particleCount = isMobile ? 16 : 35;
      connectionDistance = isMobile ? 75 : 115;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * currentWidth,
          y: Math.random() * currentHeight,
          vx: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
          vy: (Math.random() - 0.5) * (isMobile ? 0.35 : 0.5),
          radius: Math.random() * 1.5 + 0.6,
        });
      }
    };

    const draw = (currentTime) => {
      if (isPaused || document.hidden) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      const elapsed = currentTime - lastDrawTime;
      if (elapsed < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = currentTime - (elapsed % frameInterval);

      ctx.clearRect(0, 0, currentWidth, currentHeight);

      // 1. Update & draw particles (ultra-fast dual-circle alpha, zero expensive canvas shadowBlur)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x < 0 || p.x > currentWidth) p.vx *= -1;
        if (p.y < 0 || p.y > currentHeight) p.vy *= -1;

        // Outer glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
        ctx.fill();
      }

      // 2. Draw connections
      const pLen = particles.length;
      for (let i = 0; i < pLen; i++) {
        for (let j = i + 1; j < pLen; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          const connDistSq = connectionDistance * connectionDistance;

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

    const handleVisibilityChange = () => {
      if (!document.hidden && !isPaused) {
        lastDrawTime = performance.now();
      }
    };

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resizeCanvas();
    lastDrawTime = performance.now();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(animationFrameId);
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
