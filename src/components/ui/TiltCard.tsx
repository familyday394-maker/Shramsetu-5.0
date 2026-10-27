import React, { useCallback, useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
}

/**
 * Very light 3D tilt that follows the pointer. Transforms are written straight
 * to the node (no React re-renders) and skipped entirely for touch input or
 * when the visitor prefers reduced motion.
 */
export const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', max = 6 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);

  const reduceMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || event.pointerType === 'touch' || reduceMotion()) return;

      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        node.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(
          px * max
        ).toFixed(2)}deg) translateZ(0)`;
      });
    },
    [max]
  );

  const handleLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    node.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)';
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};
