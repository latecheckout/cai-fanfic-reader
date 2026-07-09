'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  /** Desktop vs mobile — drives the body push-panel class (desktop only). */
  isMobile: boolean;
  /**
   * When true, Escape is being handled by another surface (the sort dropdown)
   * and must NOT also close the drawer. Preserves the original single-handler
   * priority where an open sort dropdown consumes Escape before the drawer.
   */
  escapeBlocked?: boolean;
}

/**
 * Filter-drawer open/close concern, pulled out of FilterPanel.
 *
 * Owns: open state, the `body.filter-open` push-panel toggle (desktop only),
 * the global `F` shortcut (toggle) + `Escape` (close), and the mobile-only
 * click-outside. The document listeners subscribe exactly ONCE — their handler
 * reads fresh state through a ref (`advanced-use-latest`), matching the
 * ref-stable-listener pattern in useViewMode, instead of re-subscribing every
 * render like the old effect (which listed `[drawerOpen, sortOpen, closeDrawer]`).
 */
export function useDrawer({ isMobile, escapeBlocked = false }: Options) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  // Push panel — shift body right so content slides left when drawer opens.
  useEffect(() => {
    if (open && !isMobile) {
      document.body.classList.add('filter-open');
    } else {
      document.body.classList.remove('filter-open');
    }
    return () => document.body.classList.remove('filter-open');
  }, [open, isMobile]);

  // use-latest ref so the keydown listener never re-subscribes.
  const latest = useRef({ open, escapeBlocked });
  latest.current = { open, escapeBlocked };

  // F toggles the drawer; Escape closes it (unless the sort dropdown claims it).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (latest.current.escapeBlocked) return;
        if (latest.current.open) setOpen(false);
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput =
        tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;
      if (isInput) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setOpen((d) => !d);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Click-away — mobile only (desktop uses the push panel, no click-away).
  useEffect(() => {
    if (!open) return;
    const isDesktop = window.matchMedia('(min-width: 1080px)').matches;
    if (isDesktop) return;
    const handler = (e: MouseEvent) => {
      const drawer = drawerRef.current;
      if (drawer && !drawer.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  return { open, setOpen, toggle, close, drawerRef };
}
