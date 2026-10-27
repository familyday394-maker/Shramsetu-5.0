import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
  className?: string;
}

const sizes: Record<NonNullable<BrandMarkProps['size']>, string> = {
  sm: 'h-8 w-8 rounded-[0.6rem]',
  md: 'h-10 w-10 rounded-[0.85rem]',
  lg: 'h-14 w-14 rounded-[1.1rem]',
};

/**
 * Shram Setu mark: a suspension bridge (setu) in brass over deep forest.
 * Small enough to work as a favicon, distinctive at 40px.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', className = '' }) => {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950 text-brass-300 shadow-[0_10px_24px_-14px_rgba(10,34,25,0.9)] ring-1 ring-inset ring-white/10 ${sizes[size]} ${className}`}
      aria-hidden="true"
    >
      {/* soft top-left sheen */}
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.22),transparent_55%)]" />
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="relative h-[72%] w-[72%]"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M7.5 26.5c0-7.7 5.6-13.2 12.5-13.2s12.5 5.5 12.5 13.2"
          stroke="currentColor"
          strokeWidth="2.1"
          opacity="0.95"
        />
        <path
          d="M11.5 26.5v-3.3M20 26.5v-7.3M28.5 26.5v-3.3"
          stroke="currentColor"
          strokeWidth="1.3"
          opacity="0.75"
        />
        <path
          d="M5.5 26.5h29"
          stroke="#fdfbf6"
          strokeWidth="2.4"
          opacity="0.95"
        />
        <path
          d="M8.5 26.5v4.6M31.5 26.5v4.6"
          stroke="#fdfbf6"
          strokeWidth="2.4"
          opacity="0.7"
        />
      </svg>
    </span>
  );
};
