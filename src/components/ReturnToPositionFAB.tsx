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
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={handleClick}
          aria-label="Return to your last reading position"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
          // Rendered inside the bottom cluster, to the right of the chapter
          // pill — same BUBBLE_PILL chrome/size as its siblings.
          className={`${BUBBLE_PILL} gap-2 px-4 font-sans text-[13px]`}
        >
          <ArrowDownIcon width={15} height={15} />
          <span>Your place</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
