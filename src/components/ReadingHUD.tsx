'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useReadingUI } from '@/context/ReadingContext';
import { HUD_BUBBLE } from './readingChrome';
import { ChevronLeftIcon, SidebarIcon } from './icons';
import { Tooltip } from './Tooltip';

// Tuck-in offsets: slide the cluster from its HUD position (16px page inset)
// to land inside the hub card's top-left. Equal x/y keep the landed cluster at
// the same 16px inset from the card's left and top edges (panel is inset 12px,
// buttons rest at 16px: 16 + 12 = 12 + 16). Ported from PlaySurfaceChrome.
const TUCK = { x: 12, y: 12 };
const TUCK_SPRING = { type: 'spring', duration: 0.5, bounce: 0.18 } as const;

export function ReadingHUD() {
  const { hubOpen, setHubOpen } = useReadingUI();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="pointer-events-auto flex items-start gap-2"
      animate={hubOpen ? TUCK : { x: 0, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : TUCK_SPRING}
    >
      <Tooltip label="Back to works" align="left">
        <a
          href="/"
          aria-label="Back to works"
          // Crimson "you're about to leave" hover: crimson icon, low-opacity
          // crimson fill (mixed into the opaque bubble so the button doesn't
          // go transparent over cover art), and the bubble shadow's own 1px
          // ring swapped to crimson via the var (one stroke, not two).
          className={`${HUD_BUBBLE} no-underline hover:bg-[color-mix(in_srgb,var(--cached-crimson)_10%,var(--bubble-bg))] hover:text-cached-crimson hover:[--bubble-shadow-hover:var(--bubble-shadow-crimson)]`}
        >
          <ChevronLeftIcon width={20} height={20} />
        </a>
      </Tooltip>
      <Tooltip label={hubOpen ? 'Hide story info' : 'Story & characters'} align="left">
        <button
          type="button"
          aria-label="Toggle fandom hub"
          aria-pressed={hubOpen}
          onClick={() => setHubOpen(!hubOpen)}
          className={HUD_BUBBLE}
        >
          <SidebarIcon width={20} height={20} />
        </button>
      </Tooltip>
    </motion.div>
  );
}
