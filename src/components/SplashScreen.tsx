"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface TargetPos {
  top: number;
  left: number;
  height: number;
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "move" | "fade">("enter");
  const [target, setTarget] = useState<TargetPos | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const measureTarget = useCallback(() => {
    const el = document.getElementById("navbar-logo");
    if (el) {
      const rect = el.getBoundingClientRect();
      setTarget({ top: rect.top, left: rect.left, height: rect.height });
    }
  }, []);

  // Grid canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 40);
    const rows = Math.floor(canvas.height / 40);
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * 40;
          const y = j * 40;
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const wave = Math.sin(dist * 0.008 - frame * 0.02) * 0.5 + 0.5;
          const alpha = wave * 0.12;

          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
          ctx.fill();
        }
      }

      const scanY = (frame * 1.5) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 1);
      gradient.addColorStop(0, "rgba(255, 69, 0, 0)");
      gradient.addColorStop(0.5, "rgba(255, 69, 0, 0.08)");
      gradient.addColorStop(1, "rgba(255, 69, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 30, canvas.width, 60);

      frame++;
    };

    const interval = setInterval(draw, 1000 / 30);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    measureTarget();
    window.addEventListener("resize", measureTarget);

    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => {
      measureTarget();
      setPhase("move");
    }, 2600);
    const t3 = setTimeout(() => setPhase("fade"), 4200);
    const t4 = setTimeout(() => onFinish(), 5200);

    return () => {
      window.removeEventListener("resize", measureTarget);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish, measureTarget]);

  const isMovedOrFade = phase === "move" || phase === "fade";
  const t = target ?? { top: 24, left: 20, height: 32 };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      style={{
        transitionProperty: "opacity",
        transitionDuration: "1000ms",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: phase === "fade" ? 0 : 1,
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      {/* Grid canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          transitionProperty: "opacity",
          transitionDuration: "1200ms",
          opacity: isMovedOrFade ? 0 : 0.6,
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fyre/[0.06] blur-[120px]"
        style={{
          transitionProperty: "opacity, transform",
          transitionDuration: "1800ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: phase === "hold" ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${phase === "hold" ? 1 : 0.5})`,
        }}
      />

      {/* Corner brackets */}
      {["top-6 left-6", "top-6 right-6 rotate-90", "bottom-6 right-6 rotate-180", "bottom-6 left-6 -rotate-90"].map(
        (pos, i) => (
          <div
            key={i}
            className={`absolute ${pos}`}
            style={{
              transitionProperty: "opacity",
              transitionDuration: "800ms",
              transitionDelay: `${200 + i * 100}ms`,
              opacity: phase === "hold" ? 1 : 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 8V2h6" stroke="rgba(255,69,0,0.2)" strokeWidth="0.5" />
            </svg>
          </div>
        )
      )}

      {/* Logo */}
      <img
        src="/images/logo-fyre.png"
        alt="FYRE"
        className="fixed z-10 w-auto"
        style={{
          transitionProperty: "top, left, height, opacity, transform",
          transitionTimingFunction: isMovedOrFade
            ? "cubic-bezier(0.22, 1, 0.36, 1)"
            : "cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDuration: isMovedOrFade ? "1600ms" : "1200ms",
          ...(phase === "enter"
            ? {
                top: "50%",
                left: "50%",
                height: "56px",
                opacity: 0,
                transform: "translate(-50%, -50%) scale(0.7)",
              }
            : phase === "hold"
            ? {
                top: "50%",
                left: "50%",
                height: "56px",
                opacity: 1,
                transform: "translate(-50%, -50%) scale(1)",
              }
            : {
                top: `${t.top}px`,
                left: `${t.left}px`,
                height: `${t.height}px`,
                opacity: phase === "move" ? 1 : 0,
                transform: "translate(0, 0) scale(1)",
              }),
        }}
      />

      {/* Floating data fragments */}
      {phase === "hold" && (
        <>
          <span
            className="absolute font-mono text-[8px] text-fyre/10"
            style={{ top: "20%", left: "15%", animation: "fadeIn 2s ease-out" }}
          >
            {"<agent.init />"}
          </span>
          <span
            className="absolute font-mono text-[8px] text-fyre/10"
            style={{ top: "70%", right: "12%", animation: "fadeIn 2s ease-out 0.3s both" }}
          >
            {"sys.crm.connect()"}
          </span>
          <span
            className="absolute font-mono text-[8px] text-fyre/10"
            style={{ top: "30%", right: "20%", animation: "fadeIn 2s ease-out 0.6s both" }}
          >
            {"ai.model.load()"}
          </span>
          <span
            className="absolute font-mono text-[8px] text-fyre/10"
            style={{ top: "75%", left: "18%", animation: "fadeIn 2s ease-out 0.9s both" }}
          >
            {"pipeline.ready"}
          </span>
          <span
            className="absolute font-mono text-[8px] text-fyre/10"
            style={{ top: "45%", left: "8%", animation: "fadeIn 2s ease-out 1.2s both" }}
          >
            {"fyre.hub.sync()"}
          </span>
          <span
            className="absolute font-mono text-[8px] text-fyre/10"
            style={{ top: "55%", right: "8%", animation: "fadeIn 2s ease-out 0.5s both" }}
          >
            {"auth.verify()"}
          </span>
        </>
      )}
    </div>
  );
}
