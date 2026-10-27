import React, { useEffect, useRef } from 'react';

type RevealDirection = 'up' | 'left' | 'right' | 'scale';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Stagger delay in milliseconds. */
  delay?: number;
  direction?: RevealDirection;
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'header' | 'footer';
}

/**
 * Scroll-linked reveal.
 *
 * Uses a single IntersectionObserver per element and CSS transitions, so it
 * stays cheap even with dozens of cards on a page. Motion is disabled by the
 * `prefers-reduced-motion` rule in index.css.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.15,
  as: Tag = 'div',
  style,
  ...rest
}) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref as never}
      data-reveal={direction === 'up' ? '' : direction}
      className={className}
      style={{ '--reveal-delay': `${delay}ms`, ...style } as React.CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
};
