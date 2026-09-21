import React from 'react';

interface CyberMicIconProps {
  size?: number;
  className?: string;
  isListening?: boolean;
  accentColor?: string;
}

/**
 * Premium Modern Voice-Assistant Microphone Icon
 * Combines sleek studio mic capsule, cybersecurity node facets, and acoustic wave arcs.
 */
export const CyberMicIcon: React.FC<CyberMicIconProps> = ({
  size = 28,
  className = '',
  isListening = false,
  accentColor = '#38bdf8',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mic-capsule-grad" x1="16" y1="4" x2="16" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isListening ? '#67e8f9' : '#dbe2f7'} />
          <stop offset="100%" stopColor={isListening ? '#38bdf8' : '#aec6ff'} />
        </linearGradient>

        <linearGradient id="mic-glow-grad" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#5d8ef1" />
        </linearGradient>
      </defs>

      {/* Acoustic Resonance Waves (Outer Cyber AI waves) */}
      <path
        d="M8.5 10 C7 12 7 15 8.5 17"
        stroke={isListening ? accentColor : '#5d8ef1'}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={isListening ? '0.95' : '0.4'}
        className={isListening ? 'animate-pulse' : ''}
      />
      <path
        d="M23.5 10 C25 12 25 15 23.5 17"
        stroke={isListening ? accentColor : '#5d8ef1'}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={isListening ? '0.95' : '0.4'}
        className={isListening ? 'animate-pulse' : ''}
      />

      {/* Far outer wave arcs when listening */}
      {isListening && (
        <>
          <path
            d="M6 8 C4 11 4 16 6 19"
            stroke="#67e8f9"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M26 8 C28 11 28 16 26 19"
            stroke="#67e8f9"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </>
      )}

      {/* Main Microphone Capsule Head */}
      <rect
        x="12"
        y="4"
        width="8"
        height="13"
        rx="4"
        fill={isListening ? '#00275e' : '#141c2a'}
        stroke="url(#mic-capsule-grad)"
        strokeWidth="1.75"
      />

      {/* Internal Acoustic Diaphragm Grille Lines */}
      <line
        x1="14"
        y1="8"
        x2="18"
        y2="8"
        stroke={isListening ? '#67e8f9' : '#aec6ff'}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={isListening ? '1' : '0.75'}
      />
      <line
        x1="14"
        y1="11"
        x2="18"
        y2="11"
        stroke={isListening ? '#67e8f9' : '#aec6ff'}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={isListening ? '1' : '0.75'}
      />
      <line
        x1="15"
        y1="14"
        x2="17"
        y2="14"
        stroke={isListening ? '#67e8f9' : '#aec6ff'}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={isListening ? '1' : '0.75'}
      />

      {/* Cradle / U-Band Support */}
      <path
        d="M10.5 13 C10.5 17 13 19.5 16 19.5 C19 19.5 21.5 17 21.5 13"
        stroke={isListening ? '#67e8f9' : '#aec6ff'}
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />

      {/* Stem */}
      <line
        x1="16"
        y1="19.5"
        x2="16"
        y2="24"
        stroke={isListening ? '#67e8f9' : '#aec6ff'}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Cyber Security Node Base Pedestal */}
      <line
        x1="12"
        y1="24"
        x2="20"
        y2="24"
        stroke={isListening ? '#67e8f9' : '#aec6ff'}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Cyber Data Pins on Base */}
      <circle cx="12" cy="24" r="1.25" fill={isListening ? '#38bdf8' : '#5d8ef1'} />
      <circle cx="20" cy="24" r="1.25" fill={isListening ? '#38bdf8' : '#5d8ef1'} />

      {/* Center status micro-node */}
      <circle
        cx="16"
        cy="27"
        r={isListening ? '1.5' : '1'}
        fill={isListening ? '#10b981' : '#38bdf8'}
        className={isListening ? 'animate-ping' : ''}
      />
    </svg>
  );
};

interface CyberMicButtonProps {
  isListening: boolean;
  onClick: () => void;
  size?: 'md' | 'lg' | 'hero';
  title?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Interactive Voice Assistant Microphone Action Button
 * Features smooth, soft pulse/ripple concentric effects, cyber borders,
 * accessible touch targets, and responsive sizing without loud gaming neon.
 */
export const CyberMicButton: React.FC<CyberMicButtonProps> = ({
  isListening,
  onClick,
  size = 'hero',
  title = 'Toggle Voice Assistant',
  disabled = false,
  className = '',
}) => {
  // Dimensions and icon scaling
  const config = {
    md: {
      container: 'w-16 h-16 min-w-[48px] min-h-[48px]',
      iconSize: 26,
    },
    lg: {
      container: 'w-20 h-20 min-w-[56px] min-h-[56px]',
      iconSize: 32,
    },
    hero: {
      container: 'w-24 h-24 sm:w-28 sm:h-28 min-w-[64px] min-h-[64px]',
      iconSize: 40,
    },
  };

  const currentConfig = config[size] || config.hero;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* 1. SOFT PULSE/RIPPLE EFFECTS (Active during LISTENING state) */}
      {isListening && (
        <>
          {/* Outer Ripple Wave 1 */}
          <div
            className="absolute inset-0 rounded-full border-2 border-[#38bdf8]/60 mic-ripple-ring-1 pointer-events-none"
            aria-hidden="true"
          />
          {/* Outer Ripple Wave 2 (delayed phase) */}
          <div
            className="absolute inset-0 rounded-full border-2 border-[#5d8ef1]/50 mic-ripple-ring-2 pointer-events-none"
            aria-hidden="true"
          />
          {/* Ambient Inner Glow Aura */}
          <div
            className="absolute inset-[-6px] rounded-full bg-[#38bdf8]/15 blur-sm pointer-events-none"
            aria-hidden="true"
          />
        </>
      )}

      {/* 2. MAIN MICROPHONE ACTION BUTTON */}
      <button
        id="cyber-voice-mic-btn"
        onClick={onClick}
        disabled={disabled}
        aria-label={isListening ? 'Stop listening to voice command' : 'Start listening to voice command'}
        aria-pressed={isListening}
        title={title}
        className={`relative ${currentConfig.container} rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-[#38bdf8]/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10 ${
          isListening
            ? 'bg-gradient-to-b from-[#14233c] to-[#0c182b] border-2 border-[#38bdf8] mic-aura-active shadow-[0_0_24px_rgba(56,189,248,0.4)]'
            : 'bg-gradient-to-b from-[#1a2538] to-[#121a29] border border-[#38bdf8]/35 hover:border-[#38bdf8] hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]'
        }`}
      >
        {/* Subtle cybersecurity geometric shield ring */}
        <div
          className={`absolute inset-1.5 rounded-full border transition-colors pointer-events-none ${
            isListening ? 'border-[#38bdf8]/40' : 'border-[#2d3a52]'
          }`}
        />

        {/* Vector Microphone Icon */}
        <CyberMicIcon
          size={currentConfig.iconSize}
          isListening={isListening}
          accentColor={isListening ? '#38bdf8' : '#aec6ff'}
        />

        {/* Compact status pill below icon for hero variant */}
        {size === 'hero' && (
          <span
            className={`text-[10px] font-mono font-bold tracking-wider mt-1 uppercase transition-colors ${
              isListening ? 'text-[#38bdf8]' : 'text-[#8d909e]'
            }`}
          >
            {isListening ? 'LIVE' : 'MIC'}
          </span>
        )}
      </button>
    </div>
  );
};
