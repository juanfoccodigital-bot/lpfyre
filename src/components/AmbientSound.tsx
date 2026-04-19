"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function AmbientSound() {
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startAudio = useCallback(() => {
    if (audioRef.current) return;

    const audio = new Audio("/audio/ambient.mp3");
    audio.loop = true;
    audio.volume = 0.15;
    audioRef.current = audio;

    audio.play().then(() => {
      setPlaying(true);
      setStarted(true);
    }).catch(() => {
      // Browser blocked autoplay, will retry on next interaction
    });
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      startAudio();
      return;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }, [playing, startAudio]);

  // Auto-start on first user interaction
  useEffect(() => {
    if (started) return;

    const handler = () => {
      startAudio();
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
    };

    window.addEventListener("click", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true });

    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [started, startAudio]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-md flex items-center justify-center text-white/30 hover:text-[#00FF2B]/60 hover:border-[#00FF2B]/20 transition-all duration-300 group"
      aria-label={playing ? "Mutar som" : "Ativar som"}
      title={playing ? "Som ativo" : "Som mutado"}
    >
      {playing ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="group-hover:drop-shadow-[0_0_4px_rgba(0,255,43,0.4)]">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}

      {playing && (
        <span className="absolute inset-0 rounded-full border border-[#00FF2B]/15 animate-ping opacity-30" />
      )}
    </button>
  );
}
