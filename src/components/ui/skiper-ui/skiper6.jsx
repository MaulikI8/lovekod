"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Skiper6 - Interactive cursor magnetic / spotlight hover effect component
 * Perfect for luxury product teasers, atelier cards, and festive highlights.
 */
export function Skiper6HoverCard({
  children,
  className = "",
  glowColor = "rgba(197, 160, 89, 0.15)", // LoveKod antique gold subtle glow
  badge = null,
  ...props
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-[2px] border border-[var(--line)] bg-[var(--surface)] transition-all duration-300 hover:border-[var(--gold)]",
        className
      )}
      {...props}
    >
      {/* Spotlight Hover Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 70%)`,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>

      {badge && (
        <span className="absolute top-3 right-3 z-20 text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-[var(--night)] text-[var(--gold)] font-mono border border-[var(--gold)]/30">
          {badge}
        </span>
      )}
    </div>
  );
}

export default Skiper6HoverCard;
