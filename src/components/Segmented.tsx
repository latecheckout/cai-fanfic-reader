'use client';

import { motion } from 'motion/react';

interface Option {
  value: string;
  /** Visible content (label, icon, or stacked node). Inherits the active/idle text color. */
  content: React.ReactNode;
  /** Accessible label for the radio. */
  label: string;
}

/**
 * Segmented control with a motion `layoutId` indicator that slides between
 * options on selection. `initial={false}` means it does NOT animate on mount —
 * combined with the parent reading state being seeded from localStorage on the
 * first render (no post-mount value change), there is zero movement on open.
 * Each instance needs a unique `id` (its layoutId scope).
 */
export function Segmented({
  id,
  value,
  onChange,
  options,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="relative flex rounded-xl bg-[color-mix(in_srgb,var(--text)_6%,transparent)] p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            onClick={() => onChange(opt.value)}
            className="relative z-10 flex aspect-square flex-1 cursor-pointer items-center justify-center rounded-lg px-2 py-2"
          >
            {active && (
              <motion.span
                aria-hidden="true"
                layoutId={`segmented-${id}`}
                initial={false}
                transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
                className="absolute inset-0 rounded-lg bg-text"
              />
            )}
            <span className={`relative z-10 inline-flex items-center justify-center ${active ? 'text-bg' : 'text-secondary'}`}>
              {opt.content}
            </span>
          </button>
        );
      })}
    </div>
  );
}
