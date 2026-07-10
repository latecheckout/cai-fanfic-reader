'use client';

import { useEffect, useState } from 'react';
import type { LayoutView } from '@/types';
import { SITE_MODE_KEY, SITE_MODE_EVENT } from '@/lib/constants';

interface Options {
  /** First-paint view before the persisted site mode is read on mount. */
  initial?: LayoutView;
}

/**
 * Layout view driven by the global site mode (the nav toggle): text mode →
 * 'list', visual mode → 'grid'. Reads the persisted mode on mount and listens
 * for the cross-component mode-change event (Ao4TurboToggle). View switches
 * snap — WorkGrid keys its layout animation to the work list, so no
 * switching/skeleton state is needed here.
 */
export function useViewMode({ initial = 'grid' }: Options = {}) {
  const [view, setView] = useState<LayoutView>(initial);

  // Read the persisted global mode after mount (avoids an SSR/hydration mismatch).
  useEffect(() => {
    setView(localStorage.getItem(SITE_MODE_KEY) === 'text' ? 'list' : 'grid');
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { mode } = (e as CustomEvent).detail;
      setView(mode === 'text' ? 'list' : 'grid');
    };
    window.addEventListener(SITE_MODE_EVENT, handler);
    return () => window.removeEventListener(SITE_MODE_EVENT, handler);
  }, []);

  return { view };
}
