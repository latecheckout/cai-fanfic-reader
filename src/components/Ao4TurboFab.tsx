'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from '@/styles/components/Ao4TurboFab.module.css';

export type SiteMode = 'visual' | 'text';

export const SITE_MODE_KEY = 'cai_site_mode';
export const SITE_MODE_EVENT = 'cai-mode-change';

export function readSiteMode(): SiteMode {
  if (typeof window === 'undefined') return 'visual';
  return localStorage.getItem(SITE_MODE_KEY) === 'text' ? 'text' : 'visual';
}

const BURST_COUNT = 90;
const BURST_MS = 900;

interface Mote {
  x: string;
  y: string;
  s: string;
  dx: string;
  dur: string;
  delay: string;
}

function makeBurst(): Mote[] {
  return Array.from({ length: BURST_COUNT }, () => ({
    x: `${(Math.random() * 100).toFixed(1)}%`,
    y: `${(Math.random() * 100).toFixed(1)}%`,
    s: `${(Math.random() * 3.5 + 2).toFixed(1)}px`,
    dx: `${(Math.random() * 48 - 24).toFixed(1)}px`,
    dur: `${(Math.random() * 350 + 480).toFixed(0)}ms`,
    delay: `${(Math.random() * 180).toFixed(0)}ms`,
  }));
}

/**
 * AO4 turbo: the global mode switch as a floating action button (per
 * Devon, design review June 2026). The visual homepage is the default;
 * hitting the button drops the whole site into the deliberately minimal
 * text mode, a wink at AO3. Each press fires a viewport-wide dust burst
 * while the surfaces remount underneath, so the switch has a moment even
 * where no skeleton renders (the home rails flip via pure CSS).
 */
export function Ao4TurboFab() {
  const [mode, setMode] = useState<SiteMode>('visual');
  const [burst, setBurst] = useState<Mote[] | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMode(readSiteMode());
    return () => { if (burstTimer.current) clearTimeout(burstTimer.current); };
  }, []);

  const toggle = () => {
    const next: SiteMode = mode === 'text' ? 'visual' : 'text';
    setMode(next);
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem(SITE_MODE_KEY, next);
    // The results layer derives card density from the same switch.
    localStorage.setItem('cai_view_pref', next === 'text' ? 'list' : 'grid');
    window.dispatchEvent(new CustomEvent(SITE_MODE_EVENT, { detail: { mode: next } }));

    // One-shot dust wash over the viewport while everything remounts.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBurst(makeBurst());
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBurst(null), BURST_MS);
    }
  };

  return (
    <>
      {burst && (
        <span className={styles.dustOverlay} aria-hidden="true">
          {burst.map((m, i) => (
            <span
              key={i}
              className={styles.dustMote}
              style={{
                '--x': m.x,
                '--y': m.y,
                '--s': m.s,
                '--dx': m.dx,
                '--dur': m.dur,
                '--delay': m.delay,
              } as CSSProperties}
            />
          ))}
        </span>
      )}

      <button
        type="button"
        className={`${styles.fab} ${mode === 'text' ? styles.on : ''}`}
        onClick={toggle}
        aria-pressed={mode === 'text'}
        title={mode === 'text' ? 'Back to the covers' : 'AO3 mode: for the tag purists'}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor"
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7.8 1 3 8h3.4l-1 5L11 6H7.4l.4-5Z" />
        </svg>
        AO4 turbo
      </button>
    </>
  );
}
