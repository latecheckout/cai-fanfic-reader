'use client';

import { useEffect, useState, useRef } from 'react';
import { useReading } from '@/context/ReadingContext';
import styles from '@/styles/components/ReturnToPositionFAB.module.css';

interface BookmarkEntry {
  furthestScrollPercent?: number;
  [key: string]: unknown;
}

const THRESHOLD = 150; // px above the target before FAB appears

export function ReturnToPositionFAB() {
  const { slug } = useReading();
  const [visible, setVisible] = useState(false);
  const targetYRef = useRef<number | null>(null);

  useEffect(() => {
    // Read the furthest scroll position for this work
    try {
      const raw = localStorage.getItem('fanfic-bookmarks');
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
        // Recompute on each scroll in case layout has shifted
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetYRef.current = entry.furthestScrollPercent! * maxScroll;
        const shouldShow = window.scrollY < targetYRef.current - THRESHOLD;
        setVisible(shouldShow);
      }

      // Initial check
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

  if (!visible) return null;

  return (
    <button
      className={styles.fab}
      onClick={handleClick}
      aria-label="Return to your last reading position"
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5.5 1.5v8M2 6l3.5 3.5L9 6" />
      </svg>
      <span>Your place</span>
    </button>
  );
}
