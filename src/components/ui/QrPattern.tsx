import React, { useMemo } from 'react';

interface QrPatternProps {
  seed: string;
  size?: number;
  className?: string;
  /** Modules per side (21 = QR version 1). */
  modules?: number;
}

/** Tiny deterministic PRNG so the decorative code is stable between renders. */
const hashSeed = (seed: string) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/**
 * Decorative QR-style matrix (NOT a scannable code — always render beside a
 * visible label). Finder patterns are drawn so it reads as a pass at a glance.
 */
export const QrPattern: React.FC<QrPatternProps> = ({
  seed,
  size = 120,
  className = '',
  modules = 21,
}) => {
  const cells = useMemo(() => {
    const random = (() => {
      let state = hashSeed(seed) || 1;
      return () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return ((state >>> 0) % 1000) / 1000;
      };
    })();

    const inFinder = (x: number, y: number) => {
      const zones = [
        [0, 0],
        [modules - 7, 0],
        [0, modules - 7],
      ];
      return zones.some(([zx, zy]) => x >= zx - 1 && x <= zx + 7 && y >= zy - 1 && y <= zy + 7);
    };

    const list: { x: number; y: number }[] = [];
    for (let y = 0; y < modules; y += 1) {
      for (let x = 0; x < modules; x += 1) {
        if (inFinder(x, y)) continue;
        if (random() > 0.52) list.push({ x, y });
      }
    }
    return list;
  }, [seed, modules]);

  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1.6} fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.8} fill="currentColor" />
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${modules} ${modules}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Decorative sample pass pattern"
      shapeRendering="crispEdges"
    >
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={0.86} height={0.86} rx={0.18} fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(modules - 7, 0)}
      {finder(0, modules - 7)}
    </svg>
  );
};
