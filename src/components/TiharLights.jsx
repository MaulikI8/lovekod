import { useState, useEffect, useMemo } from "react";
import { useStore } from "../context/StoreContext";

/**
 * TiharLights
 * Perfectly symmetric festive light arcs on both top-left and top-right corners.
 * Uses exact mirrored coordinates and standard orientation so both sides match flawlessly.
 */
export default function TiharLights() {
  const { lightsEnabled, celebrateLights } = useStore();

  const bulbColors = ["#FFD54F", "#FF9800", "#FF5722", "#E53935", "#81C784", "#FFA726", "#FFCA28"];
  const count = 9;

  // Arc path math: starting at corner edge (x=0, y=56) sweeping upward to top header (x=170, y=4)
  const bulbPoints = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const x = Math.round(t * 170);
      // Smooth catenary curve
      const y = Math.round(Math.pow(1 - t, 2) * 52 + 4);
      return {
        id: i,
        x,
        y,
        color: bulbColors[i % bulbColors.length],
        pattern: i % 3 === 0 ? "steady" : i % 3 === 1 ? "chase" : "alt",
        delay: `${(i * 0.12).toFixed(2)}s`,
      };
    });
  }, []);

  if (!lightsEnabled) return null;

  return (
    <div
      className={`tihar-corner-lights-layer ${celebrateLights ? "celebrate-pulse" : ""}`}
      aria-hidden="true"
    >
      {/* ── Left Top Corner Arc ── */}
      <div className="corner-arc-wrap corner-left">
        <svg className="corner-arc-wire" viewBox="0 0 190 70" fill="none">
          <path
            d="M 0 56 Q 70 56, 170 4"
            stroke="rgba(90, 60, 45, 0.7)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M 0 44 Q 60 42, 150 2"
            stroke="rgba(232, 119, 23, 0.3)"
            strokeWidth="1"
          />
        </svg>

        {bulbPoints.map((b) => (
          <div
            key={`left-${b.id}`}
            className={`bulb bulb-${b.pattern}`}
            style={{
              left: `${b.x}px`,
              top: `${b.y}px`,
              "--bulb-color": b.color,
              animationDelay: b.delay,
            }}
          >
            <div className="bulb-socket" />
            <div className="bulb-glass" />
            <div className="bulb-glow" />
          </div>
        ))}
      </div>

      {/* ── Right Top Corner Arc (Identical symmetric mirror using scaleX(-1)) ── */}
      <div className="corner-arc-wrap corner-right mirrored-arc">
        <svg className="corner-arc-wire" viewBox="0 0 190 70" fill="none">
          <path
            d="M 0 56 Q 70 56, 170 4"
            stroke="rgba(90, 60, 45, 0.7)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <path
            d="M 0 44 Q 60 42, 150 2"
            stroke="rgba(232, 119, 23, 0.3)"
            strokeWidth="1"
          />
        </svg>

        {bulbPoints.map((b) => (
          <div
            key={`right-${b.id}`}
            className={`bulb bulb-${b.pattern}`}
            style={{
              left: `${b.x}px`,
              top: `${b.y}px`,
              "--bulb-color": b.color,
              animationDelay: b.delay,
            }}
          >
            <div className="bulb-socket" />
            <div className="bulb-glass" />
            <div className="bulb-glow" />
          </div>
        ))}
      </div>
    </div>
  );
}
