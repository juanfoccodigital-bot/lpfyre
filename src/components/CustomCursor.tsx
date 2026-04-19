"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const innerPos = useRef({ x: 0, y: 0 });
  const outerPos = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Only on desktop
    if (typeof window === "undefined" || window.innerWidth < 1024) return;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onMouseDown = () => setClicking(true);
    const onMouseUp = () => setClicking(false);

    const onMouseEnter = () => setVisible(true);
    const onMouseLeave = () => setVisible(false);

    // Detect hovering over interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("a, button, input, textarea, select, [role='button'], .cta-button, .cta-button-outline, .chat-option");
      setHovering(!!isInteractive);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseover", onMouseOver);

    // Animation loop
    const animate = () => {
      // Inner dot — fast follow (0.25 easing)
      innerPos.current.x += (mouse.current.x - innerPos.current.x) * 0.25;
      innerPos.current.y += (mouse.current.y - innerPos.current.y) * 0.25;

      // Outer ring — slower follow (0.12 easing)
      outerPos.current.x += (mouse.current.x - outerPos.current.x) * 0.12;
      outerPos.current.y += (mouse.current.y - outerPos.current.y) * 0.12;

      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${innerPos.current.x - 4}px, ${innerPos.current.y - 4}px)`;
      }
      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${outerPos.current.x - 20}px, ${outerPos.current.y - 20}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  // Don't render on mobile/tablet
  if (typeof window !== "undefined" && window.innerWidth < 1024) return null;

  return (
    <>
      {/* Inner dot */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none hidden lg:block"
        style={{
          width: clicking ? "6px" : "8px",
          height: clicking ? "6px" : "8px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          opacity: visible ? 1 : 0,
          transition: "width 0.2s, height 0.2s, opacity 0.3s",
          mixBlendMode: "difference",
        }}
      />
      {/* Outer ring */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none hidden lg:block"
        style={{
          width: hovering ? "56px" : "40px",
          height: hovering ? "56px" : "40px",
          borderRadius: "50%",
          border: `2px solid ${hovering ? "#CFFF00" : "#00FF2B"}`,
          opacity: visible ? (hovering ? 0.9 : 0.6) : 0,
          transition: "width 0.3s, height 0.3s, opacity 0.3s, border-color 0.3s",
          boxShadow: hovering
            ? "0 0 20px rgba(207, 255, 0, 0.3), 0 0 40px rgba(0, 255, 43, 0.1)"
            : "0 0 10px rgba(0, 255, 43, 0.15)",
        }}
      />
    </>
  );
}
