import React from 'react';
import { Reveal } from './Reveal';

interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Editorial page header for interior routes: cream paper, blueprint grid,
 * brass hairline and a generous serif title.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <header
      className={`relative overflow-hidden rounded-[1.75rem] border border-sand-200 bg-gradient-to-b from-white via-sand-50 to-sand-100/70 px-6 py-10 sm:px-10 sm:py-14 mb-8 sm:mb-12 noise ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full glow-brass blur-2xl opacity-60"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full glow-emerald blur-2xl opacity-40"
        aria-hidden="true"
      />

      <div className="relative">
        <Reveal direction="up">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-forest-200 bg-white text-forest-700 shadow-soft">
                {icon}
              </span>
            )}
            {eyebrow && <span className="eyebrow text-forest-700">{eyebrow}</span>}
          </div>
        </Reveal>

        <Reveal delay={90}>
          <h1 className="mt-4 max-w-3xl text-[2rem] leading-[1.08] sm:text-[2.75rem] sm:leading-[1.05] text-ink-900">
            {title}
          </h1>
        </Reveal>

        {description && (
          <Reveal delay={160}>
            <p className="mt-4 max-w-2xl text-sm sm:text-[0.9375rem] leading-relaxed text-ink-500">
              {description}
            </p>
          </Reveal>
        )}

        {children && (
          <Reveal delay={230}>
            <div className="mt-7">{children}</div>
          </Reveal>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brass-300/70 to-transparent" />
    </header>
  );
};
