'use client';

import { useEffect, useState } from 'react';
import { LayoutView } from '@/types';
import { ViewToggle } from './ViewToggle';

export type SiteMode = 'visual' | 'text';

export const SITE_MODE_KEY = 'cai_site_mode';
export const SITE_MODE_EVENT = 'cai-mode-change';

export function readSiteMode(): SiteMode {
  if (typeof window === 'undefined') return 'visual';
  return localStorage.getItem(SITE_MODE_KEY) === 'text' ? 'text' : 'visual';
}

/**
 * Global presentation switch in the nav: visual (covers, shelves, grid) vs
 * text (AO3-style metadata cards, list results). Reuses the ViewToggle
 * segmented control, the single toggle for the whole site. Sets
 * html[data-mode] so server-rendered card variants flip via CSS, persists
 * to localStorage, and broadcasts for the results layer.
 */
export function SiteModeToggle() {
  const [mode, setMode] = useState<SiteMode>('visual');

  useEffect(() => {
    setMode(readSiteMode());
  }, []);

  const apply = (view: LayoutView) => {
    const next: SiteMode = view === 'list' ? 'text' : 'visual';
    if (next === mode) return;
    setMode(next);
    document.documentElement.setAttribute('data-mode', next);
    localStorage.setItem(SITE_MODE_KEY, next);
    // The results layer derives card density from the same switch.
    localStorage.setItem('cai_view_pref', next === 'text' ? 'list' : 'grid');
    window.dispatchEvent(new CustomEvent(SITE_MODE_EVENT, { detail: { mode: next } }));
  };

  return <ViewToggle view={mode === 'text' ? 'list' : 'grid'} onViewChange={apply} />;
}
