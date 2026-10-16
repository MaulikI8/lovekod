import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';

export default function TiharLights() {
  const { lightsEnabled, celebrateLights } = useStore();
  const [activeDiyaId, setActiveDiyaId] = useState(null);

  // Pre-computed bulb definitions for top jhalar strings
  const string1Bulbs = useMemo(() => {
    const colors = ['#FFD54F', '#FF9800', '#FF5722', '#E53935', '#81C784', '#FFF9C4', '#FFA726'];
    const count = 24;
    return Array.from({ length: count }, (_, i) => {
      const pct = (i / (count - 1)) * 100;
      // Catenary sag curve math: sag peaks at 50%
      const sag = Math.sin((pct / 100) * Math.PI) * 26 + 6;
      return {
        id: `s1-${i}`,
        left: `${pct.toFixed(2)}%`,
        top: `${sag.toFixed(1)}px`,
        color: colors[i % colors.length],
        pattern: i % 3 === 0 ? 'steady' : i % 3 === 1 ? 'chase' : 'alt',
        delay: `${(i * 0.12).toFixed(2)}s`,
      };
    });
  }, []);

  const string2Bulbs = useMemo(() => {
    const colors = ['#FFA000', '#FF3D00', '#FFCA28', '#4CAF50', '#FF7043', '#FFF8E1'];
    const count = 18;
    return Array.from({ length: count }, (_, i) => {
      const pct = (i / (count - 1)) * 100;
      // Second string offset wave
      const sag = Math.sin(((pct + 15) / 100) * Math.PI) * 22 + 18;
      return {
        id: `s2-${i}`,
        left: `${pct.toFixed(2)}%`,
        top: `${sag.toFixed(1)}px`,
        color: colors[i % colors.length],
        pattern: i % 2 === 0 ? 'chase' : 'steady',
        delay: `${(0.4 + (count - i) * 0.15).toFixed(2)}s`,
      };
    });
  }, []);

  if (!lightsEnabled) return null;

  return (
    <div
      className={`tihar-lights-layer ${celebrateLights ? 'celebrate-pulse' : ''}`}
      aria-hidden="true"
    >
      {/* ── Top Ambient Warm Ceiling Glow ── */}
      <div className="tihar-ambient-glow" />

      {/* ── Jhalar Wire SVGs ── */}
      <svg
        className="jhalar-wires"
        viewBox="0 0 1000 60"
        preserveAspectRatio="none"
      >
        {/* String 1 wire */}
        <path
          d="M0 6 Q 250 48, 500 48 T 1000 6"
          stroke="rgba(80, 50, 40, 0.6)"
          strokeWidth="1.2"
          fill="none"
        />
        {/* String 2 wire */}
        <path
          d="M0 16 Q 250 56, 500 36 T 1000 16"
          stroke="rgba(60, 40, 30, 0.45)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* ── Hanging Bulbs (String 1) ── */}
      <div className="jhalar-string string-1">
        {string1Bulbs.map(b => (
          <div
            key={b.id}
            className={`bulb bulb-${b.pattern}`}
            style={{
              left: b.left,
              top: b.top,
              '--bulb-color': b.color,
              animationDelay: b.delay,
            }}
          >
            <div className="bulb-socket" />
            <div className="bulb-glass" />
            <div className="bulb-glow" />
          </div>
        ))}
      </div>

      {/* ── Hanging Bulbs (String 2 - Hidden on small mobile) ── */}
      <div className="jhalar-string string-2">
        {string2Bulbs.map(b => (
          <div
            key={b.id}
            className={`bulb bulb-${b.pattern}`}
            style={{
              left: b.left,
              top: b.top,
              '--bulb-color': b.color,
              animationDelay: b.delay,
            }}
          >
            <div className="bulb-socket" />
            <div className="bulb-glass" />
            <div className="bulb-glow" />
          </div>
        ))}
      </div>

      {/* ── Bottom Ambient Diya Strip (Fixed at viewport bottom edge) ── */}
      <div className="tihar-bottom-diyas">
        {[
          { id: 'd-1', label: 'Kathmandu' },
          { id: 'd-2', label: 'Patan' },
          { id: 'd-3', label: 'Bhaktapur' },
          { id: 'd-4', label: 'Pokhara' },
          { id: 'd-5', label: 'Dharan' },
        ].map((d, idx) => (
          <div
            key={d.id}
            className={`interactive-diya-wrap ${activeDiyaId === d.id ? 'active-flame' : ''}`}
            onClick={() => setActiveDiyaId(activeDiyaId === d.id ? null : d.id)}
            onMouseEnter={() => setActiveDiyaId(d.id)}
            onMouseLeave={() => setActiveDiyaId(null)}
            title={`Diya lit for ${d.label}`}
          >
            {/* Soft pool of light */}
            <div className="diya-light-pool" />
            {/* Inline Diya SVG */}
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
              {/* Inner core */}
              <path
                d="M18 6C17.4 7.5 16 9 16 11.2C16 12.3 16.9 13.2 18 13.2C19.1 13.2 20 12.3 20 11.2C20 9 18.6 7.5 18 6Z"
                fill="#FFF4D0"
              />
              {/* Clay Bowl */}
              <path
                d="M4 14C4 19 8.5 23 18 23C27.5 23 32 19 32 14C32 13.2 31.2 12.5 30.5 12.5H5.5C4.8 12.5 4 13.2 4 14Z"
                fill="url(#bottomDiyaClay)"
              />
              {/* Golden rim highlight */}
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
    </div>
  );
}
