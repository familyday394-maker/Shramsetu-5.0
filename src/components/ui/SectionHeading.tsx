import React from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  className = '',
}) => {
  const isCenter = align === 'center';
  return (
    <div
      className={`${isCenter ? 'text-center mx-auto' : 'text-left'} max-w-2xl ${className}`}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={`eyebrow ${isCenter ? 'eyebrow-center' : ''} ${
              tone === 'dark' ? 'text-brass-300' : 'text-forest-700'
            }`}
          >
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={80}>
        <h2
          className={`mt-3 text-[1.75rem] leading-[1.15] sm:text-4xl sm:leading-[1.12] ${
            tone === 'dark' ? 'text-white' : 'text-ink-900'
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={140}>
          <p
            className={`mt-4 text-sm sm:text-[0.9375rem] leading-relaxed ${
              tone === 'dark' ? 'text-sand-200/80' : 'text-ink-500'
            }`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
};
