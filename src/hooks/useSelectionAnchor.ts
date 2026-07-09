'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface SelectionAnchor {
  /** Viewport Y where the toolbar attaches (above or below the selection). */
  top: number;
  /** Viewport X of the selection's horizontal center (unclamped). */
  left: number;
  /** True when the toolbar renders below the selection (flipped off the top bar). */
  below: boolean;
}

// Selection sitting nearer the top than this flips the toolbar below it.
const TOP_BAR_CLEARANCE = 80;
// Gap between the selection rect and the toolbar.
const SELECTION_GAP = 10;

/**
 * Tracks the current text selection inside `containerSelector` and exposes it
 * as an anchor point (or null). Clears on collapse, scroll, Escape, or a
 * mousedown outside `ignoreRef`. Positioning/clamping is left to the consumer.
 */
export function useSelectionAnchor(
  containerSelector: string,
  ignoreRef?: RefObject<HTMLElement | null>,
) {
  const [anchor, setAnchor] = useState<SelectionAnchor | null>(null);
  const clear = useCallback(() => setAnchor(null), []);

  useEffect(() => {
    function capture() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const el = node.nodeType === 1 ? (node as HTMLElement) : node.parentElement;
      if (!el || !el.closest(containerSelector)) return; // only inside the container
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const below = rect.top < TOP_BAR_CLEARANCE;
      setAnchor({
        top: below ? rect.bottom + SELECTION_GAP : rect.top - SELECTION_GAP,
        left: rect.left + rect.width / 2,
        below,
      });
    }

    // Defer a tick so the browser finalizes the selection before we measure it.
    function onMouseUp() {
      setTimeout(capture, 0);
    }
    function onMouseDown(e: MouseEvent) {
      if (ignoreRef?.current?.contains(e.target as Node)) return; // keep open
      clear();
    }
    function onScroll() {
      clear();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') clear();
    }
    function onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) clear();
    }

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKey);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [containerSelector, ignoreRef, clear]);

  return { anchor, clear };
}
