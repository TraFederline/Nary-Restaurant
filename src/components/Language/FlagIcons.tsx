import React from 'react';

interface FlagProps {
  className?: string;
  size?: number;
}

/**
 * Cambodia Flag SVG Icon (Blue - Red with Angkor Wat - Blue)
 */
export const CambodiaFlagIcon: React.FC<FlagProps> = ({ className = 'w-5 h-3.5', size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 480"
      className={`inline-block shrink-0 rounded-xs shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: (size * 3) / 4 } : undefined}
      aria-label="Cambodia Flag"
    >
      {/* Top blue stripe */}
      <rect width="640" height="120" fill="#032ea6" />
      {/* Middle red stripe */}
      <rect y="120" width="640" height="240" fill="#e00025" />
      {/* Bottom blue stripe */}
      <rect y="360" width="640" height="120" fill="#032ea6" />
      
      {/* Angkor Wat Silhouette in crisp white */}
      <g fill="#ffffff" transform="translate(195, 140) scale(0.39)">
        {/* Base foundation */}
        <rect x="20" y="440" width="600" height="40" rx="4" />
        <rect x="50" y="400" width="540" height="40" rx="2" />
        <rect x="80" y="350" width="480" height="50" />
        <rect x="110" y="290" width="420" height="60" />
        
        {/* Central Lotus Tower */}
        <polygon points="320,30 290,130 350,130" />
        <rect x="290" y="130" width="60" height="60" />
        <polygon points="280,190 320,150 360,190" />
        <rect x="270" y="190" width="100" height="100" />
        <polygon points="320,10 305,40 335,40" />

        {/* Left Towers */}
        <polygon points="210,120 185,210 235,210" />
        <rect x="185" y="210" width="50" height="80" />
        <polygon points="120,200 100,280 140,280" />
        <rect x="100" y="280" width="40" height="70" />

        {/* Right Towers */}
        <polygon points="430,120 405,210 455,210" />
        <rect x="405" y="210" width="50" height="80" />
        <polygon points="520,200 500,280 540,280" />
        <rect x="500" y="280" width="40" height="70" />

        {/* Portals / details */}
        <rect x="305" y="240" width="30" height="50" fill="#e00025" rx="3" />
        <rect x="200" y="250" width="20" height="40" fill="#e00025" rx="2" />
        <rect x="420" y="250" width="20" height="40" fill="#e00025" rx="2" />
      </g>
    </svg>
  );
};

/**
 * English / United Kingdom Flag SVG Icon (Union Jack)
 */
export const EnglishFlagIcon: React.FC<FlagProps> = ({ className = 'w-5 h-3.5', size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      className={`inline-block shrink-0 rounded-xs shadow-xs overflow-hidden ${className}`}
      style={size ? { width: size, height: size / 2 } : undefined}
      aria-label="English / UK Flag"
    >
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#s)">
        {/* Blue field */}
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        {/* White saltire */}
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        {/* Red saltire */}
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
        {/* White cross */}
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        {/* Red cross */}
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
};
