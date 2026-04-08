"use client";

import { useEffect, useRef, ReactNode } from "react";

interface MouseParallaxProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export default function MouseParallax({
  children,
  strength = 20,
  className = "",
}: MouseParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const moveX = ((e.clientX - centerX) / rect.width) * strength;
      const moveY = ((e.clientY - centerY) / rect.height) * strength;

      const layers = el.querySelectorAll<HTMLElement>("[data-parallax]");
      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.parallax || "1");
        layer.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
