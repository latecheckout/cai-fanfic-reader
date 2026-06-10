import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import particleStyles from '@/styles/components/SkeletonCard.module.css';

/**
 * SkeletonCard — shared loading placeholder that matches WorkCardCover dimensions
 * (a 2:3 cover thumbnail + stacked text lines).
 *
 * Accepts the parent component's CSS module styles so each callsite keeps its
 * own scoped animation definitions without needing a shared CSS file.
 * Required keys: skeletonCard, skeletonStrip, skeletonContent, skeletonLine
 * Optional key:  skeletonChip (browse variant only)
 *
 * Spacing between lines is handled by `.skeletonContent` (flex column + gap),
 * so individual lines never need (and must not use) their own margins.
 *
 * The cover strip carries a dust-particle layer that fires on every mount,
 * so remounts (the AO4 turbo mode switch, filter changes) get a moment.
 * Skeletons only ever render client-side after interaction, so per-mount
 * randomness is safe (never server-rendered).
 */
export type SkeletonCardStyles = Record<string, string>;

interface Props {
  index: number;
  styles: SkeletonCardStyles;
  /** 'browse' (default) shows a chip row; 'library' omits it */
  variant?: 'browse' | 'library';
}

const PARTICLE_COUNT = 12;

interface ParticleSpec {
  x: string;
  y: string;
  s: string;
  dx: string;
  dur: string;
  delay: string;
}

function makeParticles(): ParticleSpec[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: `${(Math.random() * 92 + 4).toFixed(1)}%`,
    y: `${(Math.random() * 70).toFixed(1)}%`,
    s: `${(Math.random() * 2.5 + 1.5).toFixed(1)}px`,
    dx: `${(Math.random() * 28 - 14).toFixed(1)}px`,
    dur: `${(Math.random() * 700 + 700).toFixed(0)}ms`,
    delay: `${(Math.random() * 350).toFixed(0)}ms`,
  }));
}

export function SkeletonCard({ index, styles, variant = 'browse' }: Props) {
  // Fresh burst per mount; stable across re-renders of the same skeleton.
  const particles = useMemo(makeParticles, []);

  return (
    <div className={styles.skeletonCard} style={{ animationDelay: `${index * 40}ms` }}>
      <div className={styles.skeletonStrip} style={{ position: 'relative' }}>
        <span className={particleStyles.particles} aria-hidden="true">
          {particles.map((p, i) => (
            <span
              key={i}
              className={particleStyles.particle}
              style={{
                '--x': p.x,
                '--y': p.y,
                '--s': p.s,
                '--dx': p.dx,
                '--dur': p.dur,
                '--delay': p.delay,
              } as CSSProperties}
            />
          ))}
        </span>
      </div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} style={{ width: '40%', height: '10px' }} />
        <div className={styles.skeletonLine} style={{ width: '82%', height: '16px' }} />
        <div className={styles.skeletonLine} style={{ width: '28%', height: '11px' }} />
        <div className={styles.skeletonLine} style={{ width: '70%', height: '12px' }} />
        {variant === 'browse' && styles.skeletonChip && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
            <div className={styles.skeletonChip} />
            <div className={styles.skeletonChip} style={{ width: '64px' }} />
            <div className={styles.skeletonChip} style={{ width: '80px' }} />
          </div>
        )}
      </div>
    </div>
  );
}
