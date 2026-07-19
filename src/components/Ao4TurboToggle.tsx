'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, type PanInfo } from 'motion/react';
import { useGlimm } from 'glimm/next';
import { SITE_MODE_KEY, SITE_MODE_EVENT } from '@/lib/constants';
import { LightningIcon } from './icons';
import { Tooltip } from './Tooltip';

type SiteMode = 'visual' | 'text';

const TRAVEL = 48; // px the thumb slides between off (left) and on (right)
const SNAP = { type: 'spring' as const, duration: 0.42, bounce: 0.3 };

// Full-width fade-to-bg bar across the bottom of the site — solid page colour at
// the very bottom, easing up to transparent (multi-stop so there's no banding).
// Inline style, NOT a Tailwind arbitrary `bg-[…]` — the nested color-mix stops
// are too complex for Tailwind to emit and the class gets silently dropped
// (same failure as the thumb's GLOW_IMAGE below).
const AURA_IMAGE =
  'linear-gradient(to top, var(--bg) 0%, var(--bg) 7%, ' +
  'color-mix(in srgb, var(--bg), transparent 14%) 20%, ' +
  'color-mix(in srgb, var(--bg), transparent 30%) 34%, ' +
  'color-mix(in srgb, var(--bg), transparent 48%) 48%, ' +
  'color-mix(in srgb, var(--bg), transparent 66%) 62%, ' +
  'color-mix(in srgb, var(--bg), transparent 82%) 78%, ' +
  'color-mix(in srgb, var(--bg), transparent 93%) 90%, transparent 100%)';

// Mouse-tracked dual-radial oklch glow (the ActionButton signature). Set as an
// inline background-image, NOT a Tailwind arbitrary `bg-[…]` — the value is too
// complex (nested color-mix/calc + two gradients) for Tailwind to emit, which
// silently dropped the class and left the hover glow invisible.
const GLOW_IMAGE =
  'radial-gradient(120px circle at var(--mx) var(--my), color-mix(in oklch, var(--ab-hot-pink) 85%, transparent), transparent 60%), ' +
  'radial-gradient(200px circle at calc(100% - var(--mx)) calc(100% - var(--my)), color-mix(in oklch, var(--ab-alt-violet) 85%, transparent), transparent 65%)';

const BoltIcon = () => <LightningIcon width={14} height={14} />;

// Plush inner drop-shadow + glass stroke shared by the thumb and the collapsed
// mobile FAB; dark mode dials the white insets back.
const PLUSH_INSET =
  'shadow-[inset_0_-2.5px_5px_0_rgba(255,255,255,0.44),inset_0_2.5px_5px_0_rgba(255,255,255,0.44)] theme-dark:shadow-[inset_0_-2.5px_5px_0_rgba(255,255,255,0.24),inset_0_2.5px_5px_0_rgba(255,255,255,0.24)] [outline:1.25px_solid_rgba(255,255,255,0.22)] [outline-offset:-1.25px]';

// One-line mode blurbs for the tooltips (single line always — keep them short).
const VISUAL_LABEL = 'Visual mode: cover-art cards';
const TEXT_LABEL = 'AO4 mode: dense text lists';

/**
 * AO4 turbo toggle — the global mode switch. ON = text mode. Drag the "AO4
 * turbo" thumb left/right, or tap it, to flip. Same side-effects as the old
 * FAB (data-mode + localStorage + cai-mode-change event). During the switch
 * the cards flash shimmering skeletons. The thumb carries the ActionButton
 * plush/oklch styling.
 */
export function Ao4TurboToggle() {
  const [on, setOn] = useState(false); // on === text mode
  // False until the persisted mode has been read. While false, the thumb's
  // position/fill come from the CSS pre-hydration gate below (html[data-mode]
  // is set pre-paint by ThemeScript) — the ONLY thing that can be right during
  // the server-rendered paint of a full page load, which happens seconds
  // before any client hook runs.
  const [hydrated, setHydrated] = useState(false);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const { sweep } = useGlimm();

  // Read the persisted mode BEFORE the hydrated frame paints — useLayoutEffect
  // (not useEffect, same pattern as useViewMode) so remounts (e.g. navigating
  // back from the reading page in text mode) don't flash the thumb in its
  // default visual position for a frame. Still post-render → no hydration
  // mismatch.
  useLayoutEffect(() => {
    const initial = localStorage.getItem(SITE_MODE_KEY) === 'text';
    setOn(initial);
    x.set(initial ? TRAVEL : 0);
    // Same commit as the x.set: the CSS gate class is removed while the motion
    // value takes over, both landing before the next paint (motion writes on
    // rAF, which runs pre-paint) — no double-offset or gap frame.
    setHydrated(true);
  }, [x]);

  const applyMode = (next: boolean) => {
    const mode: SiteMode = next ? 'text' : 'visual';
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem(SITE_MODE_KEY, mode);
    // The results layer derives card density from the same switch.
    localStorage.setItem('cai_view_pref', next ? 'list' : 'grid');
    // `sweep: true` signals consumers that a glimm band is covering this swap,
    // so they skip their skeleton flash — the colour sweep is the transition.
    window.dispatchEvent(new CustomEvent(SITE_MODE_EVENT, { detail: { mode, sweep: true } }));
  };

  // Snap to a position; flip mode + fire side-effects only when it actually changes.
  const commit = (next: boolean) => {
    animate(x, next ? TRAVEL : 0, SNAP);
    if (next === on) return;
    setOn(next);
    // Play the glimm sweep; the mode swaps at the band's midpoint so the new
    // layout is revealed as the band passes (replaces the old skeleton flash).
    // Palette + dimming inherited from GlimmProvider defaults (see layout).
    sweep(() => applyMode(next));
  };

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <>
      {/* Full-width fade band pinned to the very bottom (sits just under the toggle). */}
      <span
        className="ao4-aura fixed bottom-0 left-0 right-0 z-[calc(var(--z-sticky)_-_1)] h-[170px] max-md:h-[140px] pointer-events-none"
        style={{ backgroundImage: AURA_IMAGE }}
        aria-hidden="true"
      />

      <div className="ao4-fab fixed right-7 bottom-[calc(24px+var(--safe-bottom))] z-[var(--z-sticky)] max-md:right-4 max-md:bottom-[calc(18px+var(--safe-bottom))]">
        {/* On mobile the thumb is icon-only (no "AO4 Mode" text), so the track
            shrinks to match: 3px pad ×2 + 48px thumb + 48px travel = 102px. */}
        <div className="relative h-[50px] w-[194px] max-md:h-[54px] max-md:w-[102px] rounded-full p-[3px] touch-none bg-bg [background-image:linear-gradient(color-mix(in_srgb,var(--text)_8%,transparent),color-mix(in_srgb,var(--text)_8%,transparent))] backdrop-blur-[12px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
          {/* On/off marks in the negative space (off = ring on the left, on = bar
              on the right); the thumb covers the active side. Each mark is a real
              button (full-height ≥40px hit area) that jumps straight to its mode,
              with a tooltip naming what the mode does — only the exposed side is
              interactive, the thumb sits on top of the other. */}
          <Tooltip label={VISUAL_LABEL} disabled={!on}>
            {/* NO explicit ids on any Tooltip trigger: overriding Base UI's own
                trigger id silently breaks EVERY tooltip in the provider group
                (bisected 2026-07-18; the useId hydration mismatch these ids
                once worked around no longer reproduces). */}
            <button
              type="button"
              tabIndex={-1}
              aria-label="Switch to visual mode"
              onClick={() => commit(false)}
              className="absolute left-0 top-0 flex h-full w-[52px] max-md:w-[51px] items-center justify-center rounded-full border-none bg-transparent p-0 text-secondary cursor-pointer"
            >
              <svg className="opacity-50" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4.5" />
              </svg>
            </button>
          </Tooltip>
          <Tooltip label={TEXT_LABEL} disabled={on}>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Switch to AO4 text mode"
              onClick={() => commit(true)}
              className="absolute right-0 top-0 flex h-full w-[52px] max-md:w-[51px] items-center justify-center rounded-full border-none bg-transparent p-0 text-secondary cursor-pointer"
            >
              <svg className="opacity-50" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="7" y1="2.5" x2="7" y2="9.5" />
              </svg>
            </button>
          </Tooltip>

          <Tooltip label={on ? TEXT_LABEL : VISUAL_LABEL}>
          <motion.button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="AO4 Mode"
            drag="x"
            dragConstraints={{ left: 0, right: TRAVEL }}
            dragElastic={0.04}
            dragMomentum={false}
            style={{ x }}
            onMouseMove={handleMove}
            onDragStart={() => { dragged.current = false; }}
            onDrag={(_, info: PanInfo) => { if (Math.abs(info.offset.x) > 4) dragged.current = true; }}
            onDragEnd={() => { commit(x.get() > TRAVEL / 2); }}
            onClick={() => {
              if (dragged.current) { dragged.current = false; return; } // ignore the click that trails a drag
              commit(!on);
            }}
            className={
              'group/thumb absolute left-[3px] top-[3px] flex h-11 w-[140px] max-md:h-12 max-md:w-12 items-center justify-center gap-2 overflow-hidden rounded-full border-none p-0 ' +
              'font-sans text-sm max-md:text-[15px] font-semibold tracking-[0.01em] whitespace-nowrap text-white cursor-grab will-change-transform active:cursor-grabbing ' +
              'shadow-[0_2px_5px_-1px_rgba(0,0,0,0.26),0_9px_20px_-9px_rgba(0,0,0,0.38)] ' +
              '[--ab-magenta:#652E1F] [--ab-hot-pink:#AE00D9] [--ab-alt-violet:#6B2E63] [--mx:50%] [--my:50%] ' +
              // Dark theme: --secondary is too light for the white label
              // (3.4:1) — fixed darker gray keeps it ≥5:1 in every theme.
              (on ? 'bg-[var(--ab-magenta)]' : 'bg-secondary theme-dark:bg-[#6B675F]') +
              // Pre-hydration gate: until the persisted mode is read, CSS keyed
              // on html[data-mode] (set pre-paint by ThemeScript) positions +
              // colors the thumb so the SSR paint of a text-mode visitor is
              // already correct. translate-x uses the `translate` property, so
              // it composes with (not fights) motion's transform while x is 0.
              // Higher selector specificity beats the base bg-* utility.
              (hydrated
                ? ''
                : ' [html[data-mode=text]_&]:translate-x-12 [html[data-mode=text]_&]:bg-[var(--ab-magenta)]')
            }
          >
            {/* Mouse-tracked dual-radial oklch glow (fades in on hover). */}
            <span
              className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 transition-opacity duration-300 ease-out group-hover/thumb:opacity-100"
              style={{ backgroundImage: GLOW_IMAGE }}
              aria-hidden="true"
            />
            <span className={'absolute inset-0 rounded-[inherit] pointer-events-none ' + PLUSH_INSET} aria-hidden="true" />
            <span className="relative z-[1] flex"><BoltIcon /></span>
            <span className="relative z-[1] max-md:hidden">AO4 Mode</span>
          </motion.button>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
