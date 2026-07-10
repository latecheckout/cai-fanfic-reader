'use client';

import type { ComponentPropsWithRef } from 'react';

// Shared pill shape + metrics — the single source of truth for every
// pill-shaped control: GhostButton ("Clear all" / "Save preset"), the filter
// drawer's chips (dPillClass in FilterPanel), and the toolbar's active-filter
// pills. The always-on border keeps borderless and bordered variants the
// exact same rendered height (35px at 14px text); every consumer must supply
// exactly ONE border-color utility (never two — emission order would decide).
// PILL_SHAPE omits vertical padding for containers whose inner segments pad.
export const PILL_SHAPE =
  'rounded-full border font-sans text-[14px] leading-[1.5] whitespace-nowrap';
export const PILL_METRICS = `${PILL_SHAPE} py-1.5`;

// Quiet rounded-pill text button — the filter drawer's "Clear all" treatment:
// secondary text, soft pill bg on hover, no underline. Border color is set by
// the `bordered` prop, NOT the base: two same-property utilities on one
// element resolve by stylesheet emission order (not className order), so the
// base must never carry a border color a call site would need to override.
export const GHOST_BUTTON =
  `${PILL_METRICS} cursor-pointer bg-transparent px-3 text-secondary transition-colors duration-150 hover:text-text`;

export function GhostButton({
  className = '',
  bordered = false,
  ...props
}: ComponentPropsWithRef<'button'> & { bordered?: boolean }) {
  return (
    <button
      className={`${GHOST_BUTTON} ${
        bordered
          ? 'border-border-strong hover:border-border-active'
          : 'border-transparent hover:bg-overlay-soft'
      } ${className}`}
      {...props}
    />
  );
}
