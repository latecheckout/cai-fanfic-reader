'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { EASE_OUT_EXPO } from '@/lib/motion';

/*
 * Tab row + tab pill — surface-local text tabs (site nav, Library tabs).
 * The row owns a single 1px indicator bar that overlays the wrapper's
 * dividing line (`-bottom-px` over a border-b) and slides between tabs.
 *
 * ⚠️ Do not move the indicator back to a per-tab `layoutId` element.
 * A shared-layout animation measures the element's DOCUMENT position; these
 * tabs are route-driven, so switching navigates AND resets page scroll —
 * Motion then diffed the pre-nav position (page scrolled) against the
 * post-nav position (scroll = 0) and animated that vertical scroll delta:
 * the indicator visibly flew up from down the viewport into place.
 * Instead the row springs x/width to the active tab's measured box WITHIN
 * the row (offsetLeft/offsetWidth) — its own reference frame, so page
 * scroll can never enter the math.
 */

const INDICATOR_TRANSITION = { duration: 0.3, ease: EASE_OUT_EXPO };

// Last measured indicator box per row (keyed by ariaLabel). The site header
// is rendered per-page, so a route change REMOUNTS TabRow — this carries the
// outgoing tab's position across the remount so the indicator still slides
// (horizontally only; values are row-local so scroll can't leak in). Module
// state resets on a full page load, where snapping is correct.
const lastBox = new Map<string, { x: number; w: number }>();

export function TabRow({
  activeKey,
  ariaLabel,
  className = '',
  children,
}: {
  /** Changes when the active tab (or its label width) changes — triggers a re-measure. */
  activeKey: string;
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  const navRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  // Springs are for user-driven changes only: snap on the first placement
  // (initial paint / arriving from a page with no active tab).
  const hadActive = useRef(false);
  const x = useMotionValue(0);
  const w = useMotionValue(0);

  // Position the indicator on the active tab's measured box. useLayoutEffect
  // so a change lands before paint.
  useLayoutEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) {
      hadActive.current = false;
      lastBox.delete(ariaLabel);
      w.set(0);
      return;
    }
    const nx = active.offsetLeft;
    const nw = active.offsetWidth;
    // Fresh mount with a carried-over box (route change remounted the row):
    // seed the motion values from it so the slide continues from the old tab.
    if (!hadActive.current) {
      const prev = lastBox.get(ariaLabel);
      if (prev) {
        x.set(prev.x);
        w.set(prev.w);
      }
      hadActive.current = !!prev;
    }
    lastBox.set(ariaLabel, { x: nx, w: nw });
    if (reduce || !hadActive.current) {
      hadActive.current = true;
      x.set(nx);
      w.set(nw);
      return;
    }
    const cx = animate(x, nx, INDICATOR_TRANSITION);
    const cw = animate(w, nw, INDICATOR_TRANSITION);
    return () => {
      cx.stop();
      cw.stop();
    };
  }, [activeKey, reduce, ariaLabel, x, w]);

  // Re-measure on resize (tab widths shift across breakpoints) — snap.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => {
      const active = nav.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) return;
      x.set(active.offsetLeft);
      w.set(active.offsetWidth);
      lastBox.set(ariaLabel, { x: active.offsetLeft, w: active.offsetWidth });
    });
    ro.observe(nav);
    return () => ro.disconnect();
  }, [ariaLabel, x, w]);

  return (
    <nav ref={navRef} aria-label={ariaLabel} className={`relative ${className}`}>
      {children}
      <motion.span
        aria-hidden="true"
        style={{ x, width: w }}
        className="pointer-events-none absolute -bottom-px left-0 h-px bg-text"
      />
    </nav>
  );
}

/**
 * Tab pill — text-only label; marks itself `data-active` so the parent
 * TabRow can measure it. The tab stretches to the row height set by its
 * siblings (e.g. the search input), keeping the indicator on the line.
 */
export function TabPill({
  href,
  label,
  active = false,
  className = '',
  onClick,
}: {
  href: string;
  label: string;
  active?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-active={active || undefined}
      aria-current={active ? 'page' : undefined}
      className={`relative inline-flex items-center whitespace-nowrap font-mono text-[12px] no-underline transition-colors duration-150 ease-out ${
        active ? 'text-text' : 'text-secondary hover:text-text'
      } ${className}`}
    >
      {label}
    </Link>
  );
}
