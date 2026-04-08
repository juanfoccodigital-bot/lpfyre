"use client";

import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.15 + 0.03,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(drawParticles);
    };

    resize();
    initParticles();
    drawParticles();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Background grid */}
      <div className="grid-bg" />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)]" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[100px] bg-white animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.015] blur-[80px] bg-white animate-[float_10s_ease-in-out_infinite_2s]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 text-center pt-20 sm:pt-0">
        {/* Title */}
        <h1
          className={`transition-all duration-1000 delay-300 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-instrument)] tracking-tight leading-[1.1] text-white">
            Seu negócio no <span className="italic">automático</span>
          </span>
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-instrument)] tracking-tight leading-[1.1] text-gradient mt-1 pb-1">
            com <span className="italic">inteligência</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 text-sm sm:text-base font-light text-white/40 max-w-xl mx-auto leading-relaxed tracking-wide transition-all duration-1000 delay-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Sistemas de automação e inteligência artificial sob medida.
          Construímos a tecnologia que faz seu negócio vender,
          atender e escalar sozinho.
        </p>

        {/* CTA */}
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-900 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <a href="#contato" className="cta-button group">
            QUERO UM DIAGNÓSTICO
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#sistema" className="cta-button-outline group">
            CONHEÇA NOSSAS SOLUÇÕES
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-y-1"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-white/20">
          Scroll
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      {/* Corner decorations - hidden on mobile */}
      <div className="hidden sm:block absolute top-24 left-8 w-12 h-12 border-l border-t border-white/[0.06]" />
      <div className="hidden sm:block absolute top-24 right-8 w-12 h-12 border-r border-t border-white/[0.06]" />
      <div className="hidden sm:block absolute bottom-16 left-8 w-12 h-12 border-l border-b border-white/[0.06]" />
      <div className="hidden sm:block absolute bottom-16 right-8 w-12 h-12 border-r border-b border-white/[0.06]" />
    </section>
  );
}
