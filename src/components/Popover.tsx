'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { POPOVER_ENTER, POPOVER_VISIBLE, POPOVER_EXIT, POPOVER_TRANSITION } from '@/lib/motion';
import { POPOVER_PANEL } from './popoverChrome';

type Align = 'left' | 'center' | 'right';

// Where the content anchors relative to the trigger, and the scale origin.
const POS: Record<Align, string> = {
  left: 'left-0',
  center: 'left-1/2',
  right: 'right-0',
};
const ORIGIN: Record<Align, string> = {
  left: 'top left',
  center: 'top',
  right: 'top right',
};

interface TriggerArgs {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

/**
 * Anchored popover (the "filter menu" lens): the trigger stays visible, the
 * content springs open below it (no morph, no backdrop), and it closes on
 * click-outside or Escape. Centering for `align="center"` is baked into the
 * motion x so it never fights motion's scale/y transform.
 *
 * Open state is uncontrolled by default; pass `open` (+ `onOpenChange`) when a
 * parent needs to own it (e.g. FilterPanel's Escape priority via useDrawer).
 */
export function Popover({
  align = 'right',
  ariaLabel,
  contentClassName = '',
  open: openProp,
  onOpenChange,
  renderTrigger,
  children,
}: {
  align?: Align;
  ariaLabel: string;
  contentClassName?: string;
  /** Controlled open state — omit to let Popover manage it internally. */
  open?: boolean;
  /** Reports every open/close intent (toggle, click-outside, Escape). */
  onOpenChange?: (open: boolean) => void;
  renderTrigger: (args: TriggerArgs) => ReactNode;
  children: ReactNode | ((args: { close: () => void }) => ReactNode);
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const close = () => setOpen(false);
  const toggle = () => setOpen(!open);

  // Click-outside + Escape close (only while open).
  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    window.addEventListener(
      'mousedown',
      (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
      },
      { signal: ctrl.signal }
    );
    window.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
      },
      { signal: ctrl.signal }
    );
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const centerX = align === 'center' ? { x: '-50%' } : {};

  return (
    <div ref={wrapRef} className="relative inline-flex">
      {renderTrigger({ open, toggle, close })}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={ariaLabel}
            initial={reduce ? false : { ...POPOVER_ENTER, ...centerX }}
            animate={{ ...POPOVER_VISIBLE, ...centerX }}
            exit={{ ...POPOVER_EXIT, ...centerX }}
            transition={POPOVER_TRANSITION}
            style={{ transformOrigin: ORIGIN[align] }}
            className={`absolute top-full z-[var(--z-popover)] mt-2 ${POPOVER_PANEL} ${POS[align]} ${contentClassName}`}
          >
            {typeof children === 'function' ? children({ close }) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
