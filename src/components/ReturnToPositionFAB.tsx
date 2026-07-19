'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useReading } from '@/context/ReadingContext';
import { readBookmark } from '@/lib/bookmarks';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { BUBBLE_PILL, BUBBLE_PILL_DARK } from './readingChrome';
import { ArrowDownIcon } from './icons';

const THRESHOLD = 150; // px above the target before FAB appears
// Hide only once scrolled this far back past the show boundary — without the
// dead zone, tiny scroll oscillation at the boundary rapid-toggles the pill.
const HYSTERESIS = 60;

/**
 * "Your place" — returns to the furthest-read position. First pill in the
 * bottom dock (ReadingCluster).
 *
 * Show/hide animates the WIDTH of an always-mounted wrapper (plus fade), not
 * mount/unmount. Siblings are pushed by real layout every frame, so they can
 * never overlap the pill and there is nothing to choreograph — no
 * AnimatePresence, no popLayout, no sibling `layout` gliding. (Every
 * shared-layout variant of this — pill lifted out of flow while siblings
 * glide through its spot — read as jitter/overlap. Don't reintroduce one.)
 * The collapsed wrapper also cancels the row's 8px gap via marginRight so
 * nothing jumps at the endpoints. Hidden = inert (pointer-events, aria,
 * tabIndex).
 */
export function ReturnToPositionFAB({
  tone = 'dark',
}: {
  /** Pill surface: 'dark' = filled CTA espresso (stands out), 'default' = bubble. */
  tone?: 'dark' | 'default';
}) {
  const { slug } = useReading();
  const [visible, setVisible] = useState(false);
  const targetYRef = useRef<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const entry = readBookmark(slug);
    if (!entry?.furthestScrollPercent || entry.furthestScrollPercent < 0.02) return;

    function onScroll() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetYRef.current = entry!.furthestScrollPercent! * maxScroll;
      const boundary = targetYRef.current - THRESHOLD;
      setVisible((prev) =>
        prev ? window.scrollY < boundary + HYSTERESIS : window.scrollY < boundary
      );
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  function handleClick() {
    if (targetYRef.current !== null) {
      window.scrollTo({ top: targetYRef.current, behavior: 'smooth' });
    }
  }

  return (
    // Width-collapsing wrapper. `flex` + `shrink-0` on the button keeps the
    // pill at its natural width while the wrapper clips it (overflow-hidden),
    // so it's revealed/concealed rather than squished. marginRight -8 cancels
    // the row's gap-2 while collapsed.
    <motion.div
      className="flex overflow-hidden"
      initial={false}
      animate={
        visible
          ? { width: 'auto', opacity: 1, marginRight: 0 }
          : { width: 0, opacity: 0, marginRight: -8 }
      }
      transition={
        reduce
          ? { width: { duration: 0 }, marginRight: { duration: 0 }, opacity: { duration: 0.2, ease: 'easeOut' } }
          : { duration: visible ? 0.25 : 0.2, ease: EASE_OUT_EXPO }
      }
      aria-hidden={!visible}
    >
      <button
        onClick={handleClick}
        aria-label="Return to your last reading position"
        tabIndex={visible ? undefined : -1}
        // Collapses to a circular arrow bubble on mobile (CSS-only), matching
        // the other HUD bubbles' footprint.
        className={`${tone === 'dark' ? BUBBLE_PILL_DARK : BUBBLE_PILL} ${
          visible ? 'pointer-events-auto' : 'pointer-events-none'
        } gap-2 px-4 font-sans text-[13px] max-md:w-11 max-md:justify-center max-md:px-0`}
      >
        <ArrowDownIcon
          width={15}
          height={15}
          className={`shrink-0 ${tone === 'dark' ? 'text-white/70' : 'text-secondary'}`}
        />
        <span className="max-md:hidden">Your place</span>
      </button>
    </motion.div>
  );
}
