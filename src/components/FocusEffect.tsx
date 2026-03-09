'use client';

import { useEffect } from 'react';

const INACTIVITY_MS = 4000;

/**
 * FocusEffect — adds `focus-active` class to <html> after 4s of inactivity.
 * Any interaction removes it instantly.
 * CSS in globals.css handles the peripheral dim via .prose-outer pseudo-elements.
 */
export function FocusEffect() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function activate() {
      document.documentElement.classList.add('focus-active');
    }

    function reset() {
      document.documentElement.classList.remove('focus-active');
      if (timer) clearTimeout(timer);
      timer = setTimeout(activate, INACTIVITY_MS);
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

    // Start timer on mount
    timer = setTimeout(activate, INACTIVITY_MS);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, reset));
      if (timer) clearTimeout(timer);
      document.documentElement.classList.remove('focus-active');
    };
  }, []);

  return null;
}
