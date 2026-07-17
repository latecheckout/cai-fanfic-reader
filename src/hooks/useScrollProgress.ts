'use client';

import { useState, useEffect } from 'react';

/** Page scroll position as 0–100, clamped. Drives the chapter-pill progress bar. */
export function useScrollProgress(): number {
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const { scrollY, innerHeight } = window;
      const { scrollHeight } = document.documentElement;
      const pct = scrollHeight - innerHeight > 0 ? (scrollY / (scrollHeight - innerHeight)) * 100 : 0;
      setScrollPct(Math.min(100, Math.max(0, pct)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollPct;
}
