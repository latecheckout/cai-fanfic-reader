'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, type PanInfo } from 'motion/react';
import { useGlimm } from 'glimm/next';
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
 * FAB (data-mode + localStorage + cai-mode-change event). During the switch
 * the cards flash shimmering skeletons. The thumb carries the ActionButton
 * plush/oklch styling.
 */
export function Ao4TurboToggle() {
  const [on, setOn] = useState(false); // on === text mode
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const { sweep } = useGlimm();

  useEffect(() => {
    const initial = localStorage.getItem(SITE_MODE_KEY) === 'text';
    setOn(initial);
    x.set(initial ? TRAVEL : 0);
  }, [x]);

  // iOS Safari anchors `position: fixed; bottom` to the *layout* viewport, which
  // grows/shrinks as the bottom browser toolbar collapses — so a bottom-pinned
  // element drifts and tucks behind the chrome. Track the VisualViewport and
  // publish the toolbar's height as --vv-bottom-inset so the toggle stays a
  // fixed gap above the *visible* bottom on every scroll/toolbar transition.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty('--vv-bottom-inset', `${inset}px`);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      root.style.removeProperty('--vv-bottom-inset');
    };
  }, []);

  const applyMode = (next: boolean) => {
    const mode: SiteMode = next ? 'text' : 'visual';
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem(SITE_MODE_KEY, mode);
    // The results layer derives card density from the same switch.
    localStorage.setItem('cai_view_pref', next ? 'list' : 'grid');
    // `sweep: true` signals consumers that a glimm band is covering this swap,
    // so they skip their skeleton flash — the colour sweep is the transition.
    window.dispatchEvent(new CustomEvent(SITE_MODE_EVENT, { detail: { mode, sweep: true } }));
  };

  // Snap to a position; flip mode + fire side-effects only when it actually changes.
  const commit = (next: boolean) => {
    animate(x, next ? TRAVEL : 0, SNAP);
    if (next === on) return;
    setOn(next);
    // Play the glimm sweep; the mode swaps at the band's midpoint so the new
    // layout is revealed as the band passes (replaces the old skeleton flash).
    // Palette + dimming inherited from GlimmProvider defaults (see layout).
    sweep(() => applyMode(next));
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
