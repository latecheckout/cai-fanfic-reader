'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type Align = 'center' | 'left' | 'right';

// Pill anchoring so edge buttons don't push the label off-screen.
const PILL_ALIGN: Record<Align, string> = {
  center: 'left-1/2 -translate-x-1/2',
  left: 'left-0',
  right: 'right-0',
};

// Arrow nub stays centered on the 40px trigger regardless of pill alignment.
const ARROW_ALIGN: Record<Align, string> = {
  center: 'left-1/2 ml-[-4px]',
  left: 'left-5 ml-[-4px]',
  right: 'right-5 mr-[-4px]',
};

// Hover dwell (ms) before the tooltip appears; hide is instant.
const SHOW_DELAY = 600;

/**
 * Hover/focus tooltip — dark pill + rotated-square arrow nub. Two behaviors:
 * (1) it only appears after a hover delay, and (2) when a menu is open it does
 * NOT persist — pass `disabled` (e.g. the popover's open state) to suppress +
 * hide it. Clicking the trigger also dismisses it.
 */
export function Tooltip({
  label,
  align = 'center',
  disabled = false,
  children,
}: {
  label: string;
  align?: Align;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  };
  const show = () => {
    if (disabled) return;
    clear();
    timer.current = setTimeout(() => setOpen(true), SHOW_DELAY);
  };
  const hide = () => {
    clear();
    setOpen(false);
  };

  // When the menu opens (disabled flips true), drop the tooltip immediately.
  useEffect(() => {
    if (disabled) hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  useEffect(() => () => clear(), []);

  return (
    <span
      className="pointer-events-auto relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseDown={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {children}
      <AnimatePresence>
        {open && !disabled && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -2 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`pointer-events-none absolute top-full z-[var(--z-tooltip)] mt-2.5 ${PILL_ALIGN[align]}`}
          >
            {/* Pill */}
            <span className="block whitespace-nowrap rounded-md bg-text px-3 py-1.5 text-xs text-bg shadow-bubble">
              {label}
            </span>
            {/* Arrow nub — painted over the pill's top edge so the seam is hidden */}
            <span
              aria-hidden="true"
              className={`absolute -top-1 h-2 w-2 rotate-45 rounded-[1px] bg-text ${ARROW_ALIGN[align]}`}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
