export function DiyaIcon({ className = '', size = 20, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Flame */}
      <path
        d="M12 2C11 5 9 7.5 9 10C9 11.6569 10.3431 13 12 13C13.6569 13 15 11.6569 15 10C15 7.5 13 5 12 2Z"
        fill={active ? 'url(#diyaFlameActive)' : 'url(#diyaFlame)'}
      />
      {/* Flame Inner Core */}
      <path
        d="M12 6C11.5 7.5 10.5 8.8 10.5 10.2C10.5 11.0284 11.1716 11.7 12 11.7C12.8284 11.7 13.5 11.0284 13.5 10.2C13.5 8.8 12.5 7.5 12 6Z"
        fill="#FFF4D0"
      />
      {/* Clay Diya Bowl */}
      <path
        d="M3 14C3 18.4183 7.02944 22 12 22C16.9706 22 21 18.4183 21 14C21 13.4477 20.5523 13 20 13H4C3.44772 13 3 13.4477 3 14Z"
        fill="url(#diyaClay)"
      />
      {/* Rim line */}
      <path
        d="M3.5 13.5C6 15 18 15 20.5 13.5"
        stroke="#9B3818"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="diyaFlame" x1="12" y1="2" x2="12" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE066" />
          <stop offset="0.6" stopColor="#FF9800" />
          <stop offset="1" stopColor="#E65100" />
        </linearGradient>
        <linearGradient id="diyaFlameActive" x1="12" y1="2" x2="12" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9E6" />
          <stop offset="0.4" stopColor="#FFD54F" />
          <stop offset="0.8" stopColor="#FF6F00" />
          <stop offset="1" stopColor="#D50000" />
        </linearGradient>
        <linearGradient id="diyaClay" x1="12" y1="13" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B34720" />
          <stop offset="0.7" stopColor="#7E2811" />
          <stop offset="1" stopColor="#4A1406" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MarigoldIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" fill="#C44D00" />
      <circle cx="12" cy="12" r="2" fill="#E65100" />
      {/* Petals */}
      <circle cx="12" cy="6" r="2.8" fill="#FFA726" />
      <circle cx="12" cy="18" r="2.8" fill="#FFA726" />
      <circle cx="6" cy="12" r="2.8" fill="#FFA726" />
      <circle cx="18" cy="12" r="2.8" fill="#FFA726" />
      <circle cx="7.8" cy="7.8" r="2.5" fill="#FB8C00" />
      <circle cx="16.2" cy="7.8" r="2.5" fill="#FB8C00" />
      <circle cx="7.8" cy="16.2" r="2.5" fill="#FB8C00" />
      <circle cx="16.2" cy="16.2" r="2.5" fill="#FB8C00" />
      {/* Outer petal tips */}
      <circle cx="12" cy="4" r="1.5" fill="#FFD54F" />
      <circle cx="12" cy="20" r="1.5" fill="#FFD54F" />
      <circle cx="4" cy="12" r="1.5" fill="#FFD54F" />
      <circle cx="20" cy="12" r="1.5" fill="#FFD54F" />
    </svg>
  );
}

export function ShoppingBagIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function CloseIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function MenuIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export function TruckIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.24-4.2A1 1 0 0 0 17.76 8H14v10h1" />
      <circle cx="17" cy="18.5" r="2.5" />
      <circle cx="7" cy="18.5" r="2.5" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function SparklesIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 10.5a7 7 0 0 0 5.5 5.5l1.5-1.5a1 1 0 0 1 1-.25 6 6 0 0 0 2 .5 1 1 0 0 1 1 1V18a1 1 0 0 1-1 1A13 13 0 0 1 5 6a1 1 0 0 1 1-1h2.25a1 1 0 0 1 1 1 6 6 0 0 0 .5 2 1 1 0 0 1-.25 1L8 10.5Z" />
    </svg>
  );
}

export function MapPinIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function PhoneIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function MailIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function LightbulbIcon({ size = 20, active = false, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? '#FFB300' : 'none'} stroke={active ? '#FFA000' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function CheckIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AlertTriangleIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function StarIcon({ size = 14, filled = true, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#FFB300' : 'none'} stroke="#FFB300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* Festival symbols */
export function KukurTiharIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .107.94 1.159 1.14 1.5 1 .398-.163 1.5-1.5 2-2" />
      <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.107.94-1.159 1.14-1.5 1-.398-.163-1.5-1.5-2-2" />
      <path d="M7 14c0 3.5 2.239 6 5 6s5-2.5 5-6" />
      <circle cx="12" cy="11" r="1.5" fill="#C44D00" />
      <path d="M8 17c1.5 1.5 6.5 1.5 8 0" stroke="#FF9800" strokeWidth="2" />
    </svg>
  );
}

export function GaiTiharIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 3c2 2 2 5 2 7" />
      <path d="M18 3c-2 2-2 5-2 7" />
      <ellipse cx="12" cy="14" rx="7" ry="6" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <path d="M10 17c1 .5 3 .5 4 0" />
    </svg>
  );
}

export function LaxmiPujaIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3c-1.5 3-4 5-4 8 0 2.2 1.8 4 4 4s4-1.8 4-4c0-3-2.5-5-4-8z" fill="rgba(255,183,3,0.3)" />
      <path d="M5 16c2 1 4 2 7 2s5-1 7-2" />
      <path d="M8 20c1.5.8 2.5 1 4 1s2.5-.2 4-1" />
      <circle cx="12" cy="9" r="1" fill="#FFD54F" />
    </svg>
  );
}

export function MhaPujaIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="#FF9800" />
      <line x1="12" y1="3" x2="12" y2="7" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="3" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="21" y2="12" />
    </svg>
  );
}

export function BhaiTikaIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* 7 color saptrangi tilak vertical dots */}
      <circle cx="12" cy="4" r="1.5" fill="#E53935" />
      <circle cx="12" cy="7" r="1.5" fill="#FB8C00" />
      <circle cx="12" cy="10" r="1.5" fill="#FDD835" />
      <circle cx="12" cy="13" r="1.5" fill="#43A047" />
      <circle cx="12" cy="16" r="1.5" fill="#1E88E5" />
      <circle cx="12" cy="19" r="1.5" fill="#5E35B1" />
      <circle cx="12" cy="22" r="1.5" fill="#8E24AA" />
      {/* Makhamali petal borders */}
      <path d="M8 8c1-1 3-1 4 0" stroke="#E53935" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 8c1-1 3-1 4 0" stroke="#E53935" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 15c1 1 3 1 4 0" stroke="#FFB300" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 15c1 1 3 1 4 0" stroke="#FFB300" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
