import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  gender?: string | null;
}

// 5 Curated theme color palettes for illustrated avatars
const AVATAR_PALETTES = [
  { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', svgFill: '#6366F1', hair: '#312E81' },
  { bg: 'bg-violet-100 text-violet-700 border-violet-200', svgFill: '#8B5CF6', hair: '#4C1D95' },
  { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', svgFill: '#10B981', hair: '#064E3B' },
  { bg: 'bg-amber-100 text-amber-700 border-amber-200', svgFill: '#F59E0B', hair: '#78350F' },
  { bg: 'bg-rose-100 text-rose-700 border-rose-200', svgFill: '#F43F5E', hair: '#881337' },
];

function getPaletteIndex(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_PALETTES.length;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'HomeMate User',
  size = 'md',
  className = '',
  gender,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-3xl',
  }[size];

  const palette = AVATAR_PALETTES[getPaletteIndex(name)];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'HM';

  const fullImageUrl = src
    ? src.startsWith('http')
      ? src
      : `${src.startsWith('/') ? src : `/${src}`}`
    : null;

  if (fullImageUrl && !imageError) {
    return (
      <div className={`relative inline-block shrink-0 rounded-full overflow-hidden border border-slate-200 shadow-xs ${sizeClasses} ${className}`}>
        <img
          src={fullImageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Beautiful SVG Illustrated Avatar Fallback
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full border shadow-xs select-none font-semibold ${palette.bg} ${sizeClasses} ${className}`}
      title={name}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-0.5 rounded-full"
      >
        <circle cx="50" cy="50" r="50" fill="currentColor" fillOpacity="0.15" />
        {/* Head */}
        <circle cx="50" cy="40" r="22" fill="#FDE68A" />
        {/* Body / Shoulders */}
        <path
          d="M15 92C15 72.1178 30.6701 56 50 56C69.3299 56 85 72.1178 85 92V100H15V92Z"
          fill={palette.svgFill}
        />
        {/* Hair style based on gender / palette */}
        {gender === 'Female' || palette.svgFill === '#F43F5E' || palette.svgFill === '#8B5CF6' ? (
          <path
            d="M28 38C28 25.8497 37.8497 16 50 16C62.1503 16 72 25.8497 72 38C72 41 71.5 46 70 48C67 36 59 28 50 28C41 28 33 36 30 48C28.5 46 28 41 28 38Z"
            fill={palette.hair}
          />
        ) : (
          <path
            d="M32 30C32 21 39 18 50 18C61 18 68 21 68 30C68 33 65 31 60 29C54 27 46 27 40 29C35 31 32 33 32 30Z"
            fill={palette.hair}
          />
        )}
        {/* Eyes */}
        <circle cx="43" cy="40" r="2.5" fill="#1E293B" />
        <circle cx="57" cy="40" r="2.5" fill="#1E293B" />
        {/* Smile */}
        <path
          d="M44 48C44 48 47 51 50 51C53 51 56 48 56 48"
          stroke="#1E293B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {/* Initials Overlay badge if size is xl or larger */}
      {(size === 'xl' || size === '2xl') && (
        <span className="absolute bottom-0 right-0 px-1.5 py-0.5 text-xs bg-slate-900 text-white rounded-md shadow-xs">
          {initials}
        </span>
      )}
    </div>
  );
};
