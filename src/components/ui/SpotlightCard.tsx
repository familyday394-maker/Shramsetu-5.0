import React, { useCallback, useRef } from 'react';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card with a soft brass spotlight that follows the pointer.
 * Falls back gracefully on touch devices (the glow simply never moves).
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  ...rest
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || event.pointerType === 'touch') return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    node.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={`spotlight ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
