'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, type PanInfo } from 'motion/react';
import styles from '@/styles/components/Ao4TurboToggle.module.css';

export type SiteMode = 'visual' | 'text';
export const SITE_MODE_KEY = 'cai_site_mode';
export const SITE_MODE_EVENT = 'cai-mode-change';

const TRAVEL = 48; // px the thumb slides between off (left) and on (right)
const SNAP = { type: 'spring' as const, duration: 0.42, bounce: 0.3 };

const BoltIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7.8 1 3 8h3.4l-1 5L11 6H7.4l.4-5Z" />
  </svg>
);

/**
 * AO4 turbo toggle — the global mode switch. ON = text mode. Drag the "AO4
 * turbo" thumb left/right, or tap it, to flip. Same side-effects as the old
 * FAB (data-mode + localStorage + cai-mode-change event). The mode-switch
 * effect lives on the skeletons (their bars burst into particles). The thumb
 * carries the ActionButton plush/oklch styling.
 */
export function Ao4TurboToggle() {
  const [on, setOn] = useState(false); // on === text mode
  const dragged = useRef(false);
  const x = useMotionValue(0);

  useEffect(() => {
    const initial = localStorage.getItem(SITE_MODE_KEY) === 'text';
    setOn(initial);
    x.set(initial ? TRAVEL : 0);
  }, [x]);

  const applyMode = (next: boolean) => {
    const mode: SiteMode = next ? 'text' : 'visual';
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem(SITE_MODE_KEY, mode);
    // The results layer derives card density from the same switch.
    localStorage.setItem('cai_view_pref', next ? 'list' : 'grid');
    window.dispatchEvent(new CustomEvent(SITE_MODE_EVENT, { detail: { mode } }));
  };

  // Snap to a position; flip mode + fire side-effects only when it actually changes.
  const commit = (next: boolean) => {
    animate(x, next ? TRAVEL : 0, SNAP);
    if (next === on) return;
    setOn(next);
    applyMode(next);
  };

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <>
      <span className={styles.aura} aria-hidden="true" />

      <div className={styles.root}>
        <div className={styles.track}>
          {/* On/off marks in the negative space (off = ring on the left, on = bar
              on the right); the thumb covers the active side. */}
          <span className={`${styles.sym} ${styles.symLeft}`} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" />
            </svg>
          </span>
          <span className={`${styles.sym} ${styles.symRight}`} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="7" y1="2.5" x2="7" y2="9.5" />
            </svg>
          </span>

          <motion.button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="AO4 turbo"
            title={on ? 'AO4 turbo on — text mode' : 'AO4 turbo off — covers'}
            drag="x"
            dragConstraints={{ left: 0, right: TRAVEL }}
            dragElastic={0.04}
            dragMomentum={false}
            style={{ x }}
            onMouseMove={handleMove}
            onDragStart={() => { dragged.current = false; }}
            onDrag={(_, info: PanInfo) => { if (Math.abs(info.offset.x) > 4) dragged.current = true; }}
            onDragEnd={() => { commit(x.get() > TRAVEL / 2); }}
            onClick={() => {
              if (dragged.current) { dragged.current = false; return; } // ignore the click that trails a drag
              commit(!on);
            }}
            className={`${styles.thumb} ${on ? '' : styles.off}`}
          >
            <span className={styles.glow} aria-hidden="true" />
            <span className={styles.plush} aria-hidden="true" />
            <span className={styles.icon}><BoltIcon /></span>
            <span className={styles.label}>AO4 turbo</span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
