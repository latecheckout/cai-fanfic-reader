'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useReading } from '@/context/ReadingContext';
import { BOOKMARKS_KEY } from '@/lib/constants';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { BUBBLE_PILL } from './readingChrome';
import { ArrowDownIcon } from './icons';

interface BookmarkEntry {
  furthestScrollPercent?: number;
  [key: string]: unknown;
}

const THRESHOLD = 150; // px above the target before FAB appears

export function ReturnToPositionFAB() {
  const { slug } = useReading();
  const [visible, setVisible] = useState(false);
  const targetYRef = useRef<number | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      if (!raw) return;
      const bookmarks: Record<string, BookmarkEntry> = JSON.parse(raw);
      const entry = bookmarks[slug];
      if (!entry?.furthestScrollPercent || entry.furthestScrollPercent < 0.02) return;

      const compute = () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return entry.furthestScrollPercent! * maxScroll;
      };
      targetYRef.current = compute();

      function onScroll() {
        if (targetYRef.current === null) return;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetYRef.current = entry.furthestScrollPercent! * maxScroll;
        setVisible(window.scrollY < targetYRef.current - THRESHOLD);
      }

      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    } catch {
      // fail silently
    }
  }, [slug]);

  function handleClick() {
    if (targetYRef.current !== null) {
      window.scrollTo({ top: targetYRef.current, behavior: 'smooth' });
    }
  }

  return (
    // popLayout: the exiting pill is lifted out of the row so its siblings'
    // `layout` animation can glide them over instead of snapping.
    <AnimatePresence mode="popLayout" initial={false}>
      {visible && (
        <motion.button
          layout="position"
          onClick={handleClick}
          aria-label="Return to your last reading position"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, x: -8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          // Exit softer than enter — fade with a slight shrink, no slide.
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
          // Rendered inside the bottom cluster, to the right of the chapter
          // pill — same BUBBLE_PILL chrome/size as its siblings. Collapses to
          // a circular arrow bubble on mobile (CSS-only, matches the info pill).
          className={`${BUBBLE_PILL} gap-2 px-4 font-sans text-[13px] max-md:w-11 max-md:shrink-0 max-md:justify-center max-md:px-0`}
        >
          <ArrowDownIcon width={15} height={15} className="shrink-0 text-secondary" />
          <span className="max-md:hidden">Your place</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
