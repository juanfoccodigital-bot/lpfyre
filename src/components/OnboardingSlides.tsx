"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────── */

export interface OnboardingSlide {
  id: string;
  label?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  body?: React.ReactNode;
  isCover?: boolean;
}

/* ────────────────────────────────────────────────────────
   SPINNING LOGO
   ──────────────────────────────────────────────────────── */

function SpinningLogo({ size = "w-24 h-24", imgSize = "w-6" }: { size?: string; imgSize?: string }) {
  const spinText = "FYRE AUTOMAÇÃO & I.A • FYRE AUTOMAÇÃO & I.A • ";
  return (
    <div className={`relative ${size}`}>
      <svg className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100">
        <defs>
          <path id="cpOnb" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-white/30" style={{ fontSize: "7.5px", letterSpacing: "3px", fontFamily: "var(--font-montserrat)", fontWeight: 600, textTransform: "uppercase" }}>
          <textPath href="#cpOnb">{spinText}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <img src="/images/logo-fyre-circle.png" alt="FYRE" className={`${imgSize} h-auto`} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   PROGRESS BAR
   ──────────────────────────────────────────────────────── */

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i === current ? "w-6 bg-white/60" : i < current ? "w-2 bg-white/20" : "w-2 bg-white/8"
          }`}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────── */

interface Props {
  slides: OnboardingSlide[];
  coverTitle: React.ReactNode;
  coverSubtitle: string;
}

export default function OnboardingSlides({ slides, coverTitle, coverSubtitle }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef(0);

  const totalSlides = slides.length;

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (isAnimating || index < 0 || index >= totalSlides || index === current) return;
      setDirection(dir || (index > current ? "next" : "prev"));
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setTimeout(() => setIsAnimating(false), 50);
      }, 200);
    },
    [current, isAnimating, totalSlides]
  );

  const next = useCallback(() => goTo(current + 1, "next"), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, "prev"), [current, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  };

  const slide = slides[current];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 bg-black text-white overflow-hidden select-none"
    >
      {/* BG */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.015] blur-[120px] bg-white animate-[float_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.01] blur-[80px] bg-white animate-[float_8s_ease-in-out_infinite_3s]" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-10 py-5">
        <img src="/images/logo-fyre.png" alt="FYRE" className="h-4 sm:h-5 w-auto opacity-40" />
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-white/20">
            {String(current + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </span>
          <ProgressBar current={current} total={totalSlides} />
        </div>
      </div>

      {/* Slide content */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
          isAnimating
            ? direction === "next" ? "opacity-0 translate-x-8" : "opacity-0 -translate-x-8"
            : "opacity-100 translate-x-0"
        }`}
      >
        {slide.isCover ? (
          <div className="text-center px-6 max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <SpinningLogo size="w-28 h-28 sm:w-36 sm:h-36" imgSize="w-7 sm:w-9" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-instrument)] tracking-tight leading-tight text-white mb-4">
              {coverTitle}
            </h1>
            <p className="text-sm sm:text-base font-light text-white/30 max-w-lg mx-auto mt-4 leading-relaxed">
              {coverSubtitle}
            </p>
            <div className="mt-10 flex items-center justify-center gap-2 text-white/20">
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase">Deslize ou use as setas</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="animate-[float_2s_ease-in-out_infinite]">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto px-5 sm:px-10 pt-16 pb-24 max-h-screen overflow-y-auto scrollbar-hide">
            {slide.label && (
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/25 mb-4 block">
                {slide.label}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-[family-name:var(--font-instrument)] tracking-tight text-white mb-2 leading-tight">
              {slide.title}
            </h2>
            {slide.subtitle && <p className="text-sm sm:text-base font-light text-white/30 mb-8">{slide.subtitle}</p>}
            {!slide.subtitle && <div className="mb-8" />}
            {slide.body}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-10 py-5">
        <button
          onClick={prev}
          disabled={current === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 ${
            current === 0 ? "opacity-0 pointer-events-none" : "text-white/40 border border-white/10 hover:text-white hover:border-white/30 hover:bg-white/5"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <button
          onClick={next}
          disabled={current === totalSlides - 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 group ${
            current === totalSlides - 1 ? "opacity-0 pointer-events-none" : "bg-white text-black hover:bg-white/90"
          }`}
        >
          <span className="hidden sm:inline">Próximo</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-1">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === current ? "w-2 h-2 bg-white/60" : "w-1.5 h-1.5 bg-white/15 hover:bg-white/30"}`} />
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
