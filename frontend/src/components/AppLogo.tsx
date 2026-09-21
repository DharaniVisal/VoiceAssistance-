import React from 'react';

interface AppLogoProps {
  variant?: 'icon' | 'full' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  onClick,
}) => {
  // Dimensions based on size
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 46,
    hero: 64,
  };

  const currentSize = iconSizes[size] || 38;

  const IconSVG = (
    <svg
      width={currentSize}
      height={currentSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      aria-label="TransitVoice Secure System Emblem"
    >
      <defs>
        {/* Shield background gradient */}
        <linearGradient id="tv-shield-bg" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#141f36" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#080e1a" />
        </linearGradient>

        {/* Shield border cyber stroke */}
        <linearGradient id="tv-shield-stroke" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#5d8ef1" />
          <stop offset="85%" stopColor="#aec6ff" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        {/* Voice & Route accent gradient */}
        <linearGradient id="tv-accent-cyan" x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#5d8ef1" />
        </linearGradient>

        {/* Route glowing trail */}
        <linearGradient id="tv-route-trail" x1="14" y1="40" x2="34" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#aec6ff" />
        </linearGradient>

        {/* Subtle drop shadow filter */}
        <filter id="tv-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#38bdf8" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 1. CYBERSECURITY SHIELD CONTOUR */}
      <path
        d="M24 3.5 L39.5 8.2 C40.4 8.5 41 9.4 41 10.4 C41 23.8 34.2 36.6 24.6 44.2 C24.2 44.5 23.8 44.5 23.4 44.2 C13.8 36.6 7 23.8 7 10.4 C7 9.4 7.6 8.5 8.5 8.2 L24 3.5 Z"
        fill="url(#tv-shield-bg)"
        stroke="url(#tv-shield-stroke)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Inner subtle security facet border */}
      <path
        d="M24 6.5 L37 10.5 C37 22 31.5 33.5 24 39.8 C16.5 33.5 11 22 11 10.5 L24 6.5 Z"
        stroke="#2d3f63"
        strokeWidth="1"
        strokeOpacity="0.6"
        fill="none"
      />

      {/* 2. TRANSPORT HIGHWAY / TRANSIT CORRIDOR */}
      {/* Dynamic route curving from bottom left up through the shield */}
      <path
        d="M15 37 C18 31 22 28 24 24"
        stroke="url(#tv-route-trail)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 0"
      />
      <path
        d="M24 24 C26 20 29 17 33 13"
        stroke="url(#tv-accent-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 2"
      />

      {/* 3. VOICE MICROPHONE & ACOUSTIC RESONANCE (Centerpiece) */}
      {/* Microphone Capsule Head */}
      <rect
        x="20.5"
        y="12"
        width="7"
        height="12"
        rx="3.5"
        fill="#0b1321"
        stroke="url(#tv-accent-cyan)"
        strokeWidth="1.75"
      />

      {/* Acoustic Grille Slits */}
      <line x1="22.5" y1="15" x2="25.5" y2="15" stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" />
      <line x1="22.5" y1="18" x2="25.5" y2="18" stroke="#67e8f9" strokeWidth="1" strokeLinecap="round" />

      {/* Microphone Cradle / U-Band */}
      <path
        d="M17.5 19 C17.5 23 20 26 24 26 C28 26 30.5 23 30.5 19"
        stroke="#aec6ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mic Stem */}
      <line x1="24" y1="26" x2="24" y2="29" stroke="#aec6ff" strokeWidth="1.5" strokeLinecap="round" />
      {/* Base Pedestal / GPS Waypoint Base */}
      <line x1="21" y1="29" x2="27" y2="29" stroke="#aec6ff" strokeWidth="1.5" strokeLinecap="round" />

      {/* 4. SOUND WAVE ARCS (Acoustic intelligence) */}
      {/* Left sound wave */}
      <path
        d="M15 14 C13.5 16.5 13.5 20.5 15 23"
        stroke="#38bdf8"
        strokeWidth="1.25"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {/* Right sound wave */}
      <path
        d="M33 14 C34.5 16.5 34.5 20.5 33 23"
        stroke="#38bdf8"
        strokeWidth="1.25"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* 5. LOCATION PIN / DESTINATION APEX */}
      {/* Modern GPS destination marker at route terminus */}
      <g filter="url(#tv-glow)">
        <circle cx="33" cy="13" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
        <circle cx="33" cy="13" r="1.2" fill="#00275e" />
      </g>

      {/* Start Waypoint (Green Node) */}
      <circle cx="15" cy="37" r="2.2" fill="#10b981" stroke="#0b1321" strokeWidth="0.75" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center justify-center cursor-pointer group ${className}`}
        onClick={onClick}
        title="TransitVoice: Secure Offline Transport Assistance"
      >
        {IconSVG}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 cursor-pointer group ${className}`}
        onClick={onClick}
      >
        {IconSVG}
        <div className="flex flex-col">
          <span className="font-headline-md font-bold text-[#aec6ff] text-[16px] tracking-tight leading-none group-hover:text-white transition-colors">
            TransitVoice
          </span>
          <span className="text-[9px] font-semibold text-[#8d909e] uppercase tracking-wider mt-0.5">
            Offline Transit
          </span>
        </div>
      </div>
    );
  }

  // Full Variant
  return (
    <div
      className={`inline-flex items-center gap-3 cursor-pointer group select-none ${className}`}
      onClick={onClick}
    >
      <div className="relative p-1 rounded-xl bg-[#141c2a] border border-[#aec6ff]/25 group-hover:border-[#38bdf8] transition-colors shadow-md shadow-black/40">
        {IconSVG}
      </div>
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-headline-md font-bold text-[19px] text-[#aec6ff] tracking-tight leading-none group-hover:text-white transition-colors">
            TransitVoice
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
            SECURE
          </span>
        </div>
        <p className="text-[10px] font-semibold text-[#c3c6d4] tracking-wide mt-1 uppercase opacity-85 leading-tight">
          Offline Transport Assistance
        </p>
      </div>
    </div>
  );
};
