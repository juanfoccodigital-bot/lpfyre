"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  duration = 2000,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Extract numeric part and prefix/suffix
  const match = value.match(/^([^\d]*)([\d.]+)([^\d]*)$/);
  const prefix = match?.[1] || "";
  const numericStr = match?.[2] || "0";
  const suffix = match?.[3] || "";
  const target = parseFloat(numericStr);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            if (target % 1 !== 0) {
              setDisplay(current.toFixed(1));
            } else {
              setDisplay(Math.floor(current).toString());
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplay(numericStr);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, target, numericStr, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
