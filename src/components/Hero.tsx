"use client";

import { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Mouse parallax on orb
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      orbRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Floating particles with neon colors
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
      color: string;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < count; i++) {
        const isGreen = Math.random() > 0.3;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 1.8 + 0.3,
          opacity: Math.random() * 0.15 + 0.03,
          color: isGreen ? "0, 255, 43" : "207, 255, 0",
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
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 43, ${0.04 * (1 - dist / 130)})`;
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,43,0.03)_0%,transparent_60%)]" />

      {/* Floating orbs */}
      <div ref={orbRef} className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px] bg-[#00FF2B] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.02] blur-[80px] bg-[#CFFF00] animate-[float_10s_ease-in-out_infinite_2s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 text-center pt-28 sm:pt-24">
        {/* Badge de credibilidade */}
        <div
          className={`transition-all duration-1000 delay-100 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.3em] uppercase text-[#00FF2B]/60 mb-6 border border-[#00FF2B]/15 px-4 py-1.5 rounded-full bg-[#00FF2B]/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF2B] animate-pulse" />
            +500 processos automatizados
          </span>
        </div>

        {/* Title */}
        <h1
          className={`transition-all duration-1000 delay-300 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-instrument)] tracking-tight leading-[1.1] text-white">
            Pare de <span className="italic">operar.</span>
          </span>
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-instrument)] tracking-tight leading-[1.1] text-gradient-fyre mt-1 pb-1">
            Comece a <span className="italic">dominar.</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 text-sm sm:text-base font-light text-white/45 max-w-xl mx-auto leading-relaxed tracking-wide transition-all duration-1000 delay-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Construímos sistemas de automação e IA que vendem, atendem e escalam
          por você. Enquanto você dorme, seu negócio continua fechando.
        </p>

        {/* CTA */}
        <div
          className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-900 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <a href="#contato" className="cta-button group">
            QUERO ESCALAR MEU NEGÓCIO
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
          <a href="#resultados" className="cta-button-outline group">
            VER RESULTADOS REAIS
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

        {/* Mini stats */}
        <div
          className={`mt-14 flex items-center justify-center gap-8 sm:gap-12 transition-all duration-1000 delay-[1100ms] ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {[
            { value: "320+", label: "Projetos" },
            { value: "8+", label: "Anos" },
            { value: "R$10M+", label: "Gerenciados" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg sm:text-xl font-black text-white">{stat.value}</div>
              <div className="text-[9px] font-medium tracking-[0.2em] uppercase text-white/20">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="hidden sm:block absolute top-24 left-8 w-12 h-12 border-l border-t border-[#00FF2B]/10" />
      <div className="hidden sm:block absolute top-24 right-8 w-12 h-12 border-r border-t border-[#00FF2B]/10" />
      <div className="hidden sm:block absolute bottom-16 left-8 w-12 h-12 border-l border-b border-[#00FF2B]/10" />
      <div className="hidden sm:block absolute bottom-16 right-8 w-12 h-12 border-r border-b border-[#00FF2B]/10" />
    </section>
  );
}
