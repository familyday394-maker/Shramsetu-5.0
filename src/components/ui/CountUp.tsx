import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Use the Indian digit grouping (defaults to true). */
  indianFormat?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const format = (value: number, decimals: number, indianFormat: boolean) => {
  const fixed = Number.isInteger(value) && decimals === 0 ? value : Number(value.toFixed(decimals));
  if (!indianFormat) {
    return fixed.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return fixed.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/** Counts up from zero the first time the element scrolls into view. */
export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  indianFormat = true,
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const animate = () => {
      const start = performance.now();
      const from = 0;
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutExpo — fast start, gentle landing
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setDisplay(from + (value - from) * eased);
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            animate();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(display, decimals, indianFormat)}
      {suffix}
    </span>
  );
};
