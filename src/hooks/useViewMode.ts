'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutView } from '@/types';
import { SITE_MODE_KEY, VIEW_PREF_KEY, SITE_MODE_EVENT } from '@/lib/constants';

interface Options {
  /** First-paint view before the persisted site mode is read on mount. */
  initial?: LayoutView;
  /** How long the "switching" skeleton flag stays true after a view change (ms). */
  switchMs?: number;
}

/**
 * Layout view driven by the global site mode (the nav toggle). Reads the
 * persisted mode on mount, listens for the cross-component mode-change event,
 * persists the view preference, and exposes a brief `viewSwitching` flag so
 * callers can flash a skeleton during the swap.
 *
 * Replaces the copy-pasted logic in BrowseShell/LibraryShell — and fixes their
 * listener effect that had no dependency array and re-subscribed on every
 * render. `changeView` is stable (reads the current view via a ref), so the
 * listener subscribes exactly once.
 */
export function useViewMode({ initial = 'grid', switchMs = 500 }: Options = {}) {
  const [view, setView] = useState<LayoutView>(initial);
  const [viewSwitching, setViewSwitching] = useState(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read the persisted global mode after mount (avoids an SSR/hydration mismatch).
  useEffect(() => {
    setView(localStorage.getItem(SITE_MODE_KEY) === 'text' ? 'list' : 'grid');
  }, []);

  const changeView = useCallback(
    (v: LayoutView, skipSkeleton = false) => {
      if (v === viewRef.current) return;
      setView(v);
      try {
        localStorage.setItem(VIEW_PREF_KEY, v);
      } catch {
        // ignore
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      if (skipSkeleton) {
        // A glimm sweep covers the swap on mode toggles — skip the skeleton flash.
        setViewSwitching(false);
        return;
      }
      setViewSwitching(true);
      timerRef.current = setTimeout(() => setViewSwitching(false), switchMs);
    },
    [switchMs]
  );

  // Cross-component mode toggle (Ao4TurboToggle dispatches SITE_MODE_EVENT).
  useEffect(() => {
    const handler = (e: Event) => {
      const { mode, sweep } = (e as CustomEvent).detail;
      changeView(mode === 'text' ? 'list' : 'grid', sweep);
    };
    window.addEventListener(SITE_MODE_EVENT, handler);
    return () => window.removeEventListener(SITE_MODE_EVENT, handler);
  }, [changeView]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { view, viewSwitching, changeView };
}
