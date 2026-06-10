'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/components/Ao4TurboFab.module.css';

export type SiteMode = 'visual' | 'text';

export const SITE_MODE_KEY = 'cai_site_mode';
export const SITE_MODE_EVENT = 'cai-mode-change';

export function readSiteMode(): SiteMode {
  if (typeof window === 'undefined') return 'visual';
  return localStorage.getItem(SITE_MODE_KEY) === 'text' ? 'text' : 'visual';
}

/**
 * AO4 turbo: the global mode switch as a floating action button (per
 * Devon, design review June 2026). The visual homepage is the default;
 * hitting the button drops the whole site into the deliberately minimal
 * text mode, a wink at AO3. Same plushy accent-pill styling as the old
 * view-toggle fill. Sets html[data-mode], persists to localStorage, and
 * broadcasts so mounted surfaces flip live.
 */
export function Ao4TurboFab() {
  const [mode, setMode] = useState<SiteMode>('visual');

  useEffect(() => {
    setMode(readSiteMode());
  }, []);

  const toggle = () => {
    const next: SiteMode = mode === 'text' ? 'visual' : 'text';
    setMode(next);
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem(SITE_MODE_KEY, next);
    // The results layer derives card density from the same switch.
    localStorage.setItem('cai_view_pref', next === 'text' ? 'list' : 'grid');
    window.dispatchEvent(new CustomEvent(SITE_MODE_EVENT, { detail: { mode: next } }));
  };

  return (
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
  );
}
