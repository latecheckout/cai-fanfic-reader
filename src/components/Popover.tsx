'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_SPRING_OUT } from '@/lib/motion';

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
 */
export function Popover({
  align = 'right',
  ariaLabel,
  contentClassName = '',
  renderTrigger,
  children,
}: {
  align?: Align;
  ariaLabel: string;
  contentClassName?: string;
  renderTrigger: (args: TriggerArgs) => ReactNode;
  children: ReactNode | ((args: { close: () => void }) => ReactNode);
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

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
            initial={{ opacity: 0, scale: 0.94, y: -6, ...centerX }}
            animate={{ opacity: 1, scale: 1, y: 0, ...centerX }}
            exit={{ opacity: 0, scale: 0.98, y: -4, ...centerX, transition: { duration: 0.16, ease: 'easeIn' } }}
            transition={{ duration: 0.26, ease: EASE_SPRING_OUT }}
            style={{ transformOrigin: ORIGIN[align] }}
            className={`absolute top-full z-[var(--z-popover)] mt-2 rounded-[24px] border border-bubble-ring bg-bubble text-text shadow-float ${POS[align]} ${contentClassName}`}
          >
            {typeof children === 'function' ? children({ close }) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
