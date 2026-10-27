import React from 'react';

/**
 * Quiet, branded placeholder shown while a lazily-loaded workspace chunk is
 * fetched. Deliberately minimal so route switches never flash a spinner wall.
 */
export const RouteFallback: React.FC<{ label?: string }> = ({ label = 'Loading your workspace' }) => (
  <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 py-16 text-center">
    <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-inset ring-sand-200">
      <span className="absolute inset-0 animate-pulse rounded-2xl bg-forest-100/60" />
      <svg viewBox="0 0 40 40" className="relative h-6 w-6 text-forest-700" fill="none" aria-hidden="true">
        <path
          d="M7.5 26.5c0-7.7 5.6-13.2 12.5-13.2s12.5 5.5 12.5 13.2"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M5.5 26.5h29" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">{label}</p>
    <div className="h-1 w-32 overflow-hidden rounded-full bg-sand-200">
      <div className="h-full w-1/2 animate-marquee rounded-full bg-forest-600/70" />
    </div>
  </div>
);
