import { useState, useMemo } from "react";
import { useStore } from "../context/StoreContext";

/**
 * TiharLights
 * Fixed corner arcs on both top-left and top-right of the viewport.
 * Uses festive catenary corner swoops and animated glowing fairy bulbs.
 */
export default function TiharLights() {
  const { lightsEnabled, celebrateLights } = useStore();

  // Left Corner Arc Bulbs (hanging from top-left outwards and downwards in an arc)
  const leftArcBulbs = useMemo(() => {
    const colors = ["#FFD54F", "#FF9800", "#FF5722", "#E53935", "#81C784", "#FFA726", "#FFCA28"];
    const count = 10;
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      // Quarter-oval / arc trajectory from (0, 48) to (180, 0)
      const x = Math.round(t * 180);
      const y = Math.round(Math.pow(1 - t, 1.8) * 52 + Math.sin(t * Math.PI) * 12);
      return {
        id: `arc-l-${i}`,
        left: `${x}px`,
        top: `${y}px`,
        color: colors[i % colors.length],
        pattern: i % 3 === 0 ? "steady" : i % 3 === 1 ? "chase" : "alt",
        delay: `${(i * 0.14).toFixed(2)}s`,
      };
    });
  }, []);

  // Right Corner Arc Bulbs (hanging from top-right outwards and downwards in an arc)
  const rightArcBulbs = useMemo(() => {
    const colors = ["#FFA726", "#81C784", "#E53935", "#FF5722", "#FF9800", "#FFD54F", "#FFCA28"];
    const count = 10;
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      // Quarter-oval / arc trajectory from (0, 0) to (180, 48) measured from right
      const x = Math.round((1 - t) * 180);
      const y = Math.round(Math.pow(1 - t, 1.8) * 52 + Math.sin((1 - t) * Math.PI) * 12);
      return {
        id: `arc-r-${i}`,
        right: `${x}px`,
        top: `${y}px`,
        color: colors[i % colors.length],
        pattern: i % 3 === 0 ? "alt" : i % 3 === 1 ? "steady" : "chase",
        delay: `${(i * 0.14 + 0.1).toFixed(2)}s`,
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
        <svg className="corner-arc-wire" viewBox="0 0 200 80" fill="none">
          {/* Main drape curve */}
          <path
            d="M 0 54 Q 70 54, 185 0"
            stroke="rgba(90, 60, 45, 0.75)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Secondary subtle wire */}
          <path
            d="M 0 42 Q 60 40, 160 0"
            stroke="rgba(232, 119, 23, 0.35)"
            strokeWidth="1"
          />
        </svg>

        {leftArcBulbs.map((b) => (
          <div
            key={b.id}
            className={`bulb bulb-${b.pattern}`}
            style={{
              left: b.left,
              top: b.top,
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

      {/* ── Right Top Corner Arc ── */}
      <div className="corner-arc-wrap corner-right">
        <svg className="corner-arc-wire" viewBox="0 0 200 80" fill="none">
          {/* Main drape curve mirroring to top right */}
          <path
            d="M 15 0 Q 130 54, 200 54"
            stroke="rgba(90, 60, 45, 0.75)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Secondary subtle wire */}
          <path
            d="M 40 0 Q 140 40, 200 42"
            stroke="rgba(232, 119, 23, 0.35)"
            strokeWidth="1"
          />
        </svg>

        {rightArcBulbs.map((b) => (
          <div
            key={b.id}
            className={`bulb bulb-${b.pattern}`}
            style={{
              right: b.right,
              top: b.top,
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
