'use client';

import type { ReactElement, ReactNode } from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

type Align = 'center' | 'left' | 'right';

const ALIGN: Record<Align, 'center' | 'start' | 'end'> = {
  center: 'center',
  left: 'start',
  right: 'end',
};

// Hover dwell (ms) before the tooltip appears; hide is instant.
const SHOW_DELAY = 600;

/**
 * App-wide tooltip provider (mounted once in the root layout). One shared
 * provider gives Base UI's delay *grouping*: after the first tooltip's dwell,
 * sweeping across adjacent triggers opens their tooltips instantly.
 */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delay={SHOW_DELAY} closeDelay={0}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

/**
 * Hover/focus tooltip on Base UI (ported from character-brain's restyled
 * tooltip): dark mono pill + rotated-square arrow, opens below the trigger.
 * Single line ALWAYS (whitespace-nowrap) — no wrapped/double-line tooltips.
 * Pass `disabled` (e.g. a popover's open state) to suppress it.
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
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Root disabled={disabled}>
        <TooltipPrimitive.Trigger render={children as ReactElement<Record<string, unknown>>} />
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            side="bottom"
            align={ALIGN[align]}
            sideOffset={8}
            className="isolate z-[var(--z-tooltip)]"
          >
            <TooltipPrimitive.Popup className="origin-[var(--transform-origin)] whitespace-nowrap rounded-md bg-text px-3 py-1.5 font-mono text-xs tracking-[-0.02em] text-bg shadow-bubble transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
              {label}
              <TooltipPrimitive.Arrow className="size-2 rotate-45 rounded-[1px] bg-text data-[side=bottom]:-top-1 data-[side=top]:-bottom-1" />
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
