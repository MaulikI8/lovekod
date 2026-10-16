import { useState, useEffect, useMemo } from "react";
import { useStore } from "../context/StoreContext";

/**
 * TiharLights
 * Festive lighting:
 * 1. Corner arc draped fairy lights on top-left AND top-right (explicit coordinates).
 * 2. Bottom ambient diya strip fixed along the bottom edge with warm flickering flames.
 */
export default function TiharLights() {
  const { lightsEnabled, celebrateLights } = useStore();
  const [activeDiyaId, setActiveDiyaId] = useState(null);

  const bulbColors = ["#FFD54F", "#FF9800", "#FF5722", "#E53935", "#81C784", "#FFA726", "#FFCA28"];
  const count = 9;

  // Arc bulbs path: sweeps from the corner edge downward and inward
  const bulbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const offset = Math.round(t * 180);
      const sag = Math.round(Math.pow(1 - t, 2) * 50 + 6);
      return {
        id: i,
        offset,
        sag,
        color: bulbColors[i % bulbColors.length],
        pattern: i % 3 === 0 ? "steady" : i % 3 === 1 ? "chase" : "alt",
        delay: `${(i * 0.12).toFixed(2)}s`,
      };
    });
  }, []);

  if (!lightsEnabled) return null;

  return (
    <>
      {/* ── Top Corner Fairy Lights Layer ── */}
      <div
        className={`tihar-corner-lights-layer ${celebrateLights ? "celebrate-pulse" : ""}`}
        aria-hidden="true"
      >
        {/* Top-Left Corner Arc */}
        <div className="corner-arc-wrap corner-left">
          <svg className="corner-arc-wire" viewBox="0 0 200 70" fill="none">
            <path
              d="M 0 54 Q 75 52, 180 6"
              stroke="rgba(90, 60, 45, 0.75)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <path
              d="M 0 42 Q 65 38, 155 4"
              stroke="rgba(232, 119, 23, 0.35)"
              strokeWidth="1"
            />
          </svg>
          {bulbs.map((b) => (
            <div
              key={`left-${b.id}`}
              className={`bulb bulb-${b.pattern}`}
              style={{
                left: `${b.offset}px`,
                top: `${b.sag}px`,
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

        {/* Top-Right Corner Arc (Explicit right-anchored coordinates) */}
        <div className="corner-arc-wrap corner-right">
          <svg className="corner-arc-wire" viewBox="0 0 200 70" fill="none">
            <path
              d="M 20 6 Q 125 52, 200 54"
              stroke="rgba(90, 60, 45, 0.75)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <path
              d="M 45 4 Q 135 38, 200 42"
              stroke="rgba(232, 119, 23, 0.35)"
              strokeWidth="1"
            />
          </svg>
          {bulbs.map((b) => (
            <div
              key={`right-${b.id}`}
              className={`bulb bulb-${b.pattern}`}
              style={{
                right: `${b.offset}px`,
                top: `${b.sag}px`,
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

      {/* ── Bottom Ambient Diya Strip (Fixed at viewport bottom edge) ── */}
      <div className="tihar-bottom-diyas" aria-hidden="true">
        {[
          { id: "d-1", label: "Kathmandu" },
          { id: "d-2", label: "Patan" },
          { id: "d-3", label: "Bhaktapur" },
          { id: "d-4", label: "Pokhara" },
          { id: "d-5", label: "Dharan" },
        ].map((d, idx) => (
          <div
            key={d.id}
            className={`interactive-diya-wrap ${activeDiyaId === d.id ? "active-flame" : ""}`}
            onClick={() => setActiveDiyaId(activeDiyaId === d.id ? null : d.id)}
            onMouseEnter={() => setActiveDiyaId(d.id)}
            onMouseLeave={() => setActiveDiyaId(null)}
            title={`Diya lit for ${d.label}`}
          >
            <div className="diya-light-pool" />
            <svg
              className="diya-svg"
              viewBox="0 0 36 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Flame */}
              <path
                className="diya-flame-path"
                d="M18 1C16.8 5 14 8 14 11C14 13.2 15.8 15 18 15C20.2 15 22 13.2 22 11C22 8 19.2 5 18 1Z"
                fill="url(#bottomDiyaFlame)"
                style={{ animationDelay: `${idx * 0.23}s` }}
              />
              <path
                d="M18 6C17.4 7.5 16 9 16 11.2C16 12.3 16.9 13.2 18 13.2C19.1 13.2 20 12.3 20 11.2C20 9 18.6 7.5 18 6Z"
                fill="#FFF4D0"
              />
              {/* Clay Bowl */}
              <path
                d="M4 14C4 19 8.5 23 18 23C27.5 23 32 19 32 14C32 13.2 31.2 12.5 30.5 12.5H5.5C4.8 12.5 4 13.2 4 14Z"
                fill="url(#bottomDiyaClay)"
              />
              <path
                d="M5 13.5 Q 18 16, 31 13.5"
                stroke="#C65A20"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="bottomDiyaFlame" x1="18" y1="1" x2="18" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFE066" />
                  <stop offset="0.5" stopColor="#FF9800" />
                  <stop offset="1" stopColor="#E65100" />
                </linearGradient>
                <linearGradient id="bottomDiyaClay" x1="18" y1="12" x2="18" y2="23" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9C3A16" />
                  <stop offset="0.6" stopColor="#6E220C" />
                  <stop offset="1" stopColor="#431306" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ))}
      </div>
    </>
  );
}
