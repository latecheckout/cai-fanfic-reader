'use client';

import type { ReactNode } from 'react';
import { SkeletonCard } from './SkeletonCard';
import { useModeSwitch } from '@/lib/useModeSwitch';

interface Props {
  /** How many skeletons to show during the flash (match the item count). */
  count: number;
  /** Rail's per-card wrapper class (gives the skeleton its width/footprint). */
  cardClassName: string;
  variant?: 'browse' | 'library';
  /** 'auto' derives grid/list from the live mode; or pin a fixed layout. */
  layout?: 'grid' | 'list' | 'auto';
  /** The real, server-rendered cards. Shown when not switching. */
  children: ReactNode;
}

/**
 * Thin client boundary that flashes skeletons during a mode toggle, then shows
 * its `children`. The children (the actual cards) are rendered by the server
 * parent and passed through, so the rails stay server components and only this
 * wrapper + the skeletons ship as client JS.
 */
export function ModeSwitchFlash({ count, cardClassName, variant = 'browse', layout = 'auto', children }: Props) {
  const { switching, mode } = useModeSwitch();
  if (!switching) return <>{children}</>;

  const resolved = layout === 'auto' ? (mode === 'text' ? 'list' : 'grid') : layout;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cardClassName}>
          <SkeletonCard index={i} layout={resolved} variant={variant} />
        </div>
      ))}
    </>
  );
}
