'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useMotionTemplate, useReducedMotion } from 'motion/react';

const THUMB = 16; // size-4
const SNAP = { type: 'spring' as const, duration: 0.4, bounce: 0.2 };

/**
 * Stepped slider on Motion's `pan` gesture. A single 0–1 `progress` motion
 * value drives BOTH the thumb and the fill via `useMotionTemplate` (percentage
 * calc, no pixel measurement) — so they share one source and never diverge, on
 * open or mid-drag. `progress` is seeded to the correct ratio on the first
 * render, so there's no entrance movement. React state is only the discrete
 * output (onChange). Pan's threshold makes a tap an `onTap` jump, not a drag.
 */
export function SizeSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel = 'Slider',
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  ariaLabel?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const reduce = useReducedMotion();

  const ratioOf = useCallback((v: number) => (max === min ? 0 : (v - min) / (max - min)), [min, max]);
  const progress = useMotionValue(ratioOf(value)); // 0..1 — the single visual source
  const didInit = useRef(false);

  // Position via % so no clientWidth is needed to render (works on open + scale).
  const thumbLeft = useMotionTemplate`calc(${progress} * (100% - ${THUMB}px))`;
  const fillWidth = useMotionTemplate`calc(${THUMB / 2}px + ${progress} * (100% - ${THUMB}px))`;

  const steps = (max - min) / step;

  // Spring `progress` to the value on external changes only — never on mount or during a drag.
  useEffect(() => {
    if (!didInit.current) { didInit.current = true; return; }
    if (dragging) return;
    const controls = animate(progress, ratioOf(value), reduce ? { duration: 0 } : SNAP);
    return () => controls.stop();
  }, [value, dragging, ratioOf, reduce, progress]);

  // clientX → values (uses layout width, only ever called during interaction).
  const ratioAt = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return ratioOf(value);
    const usable = rect.width - THUMB;
    const raw = clientX - rect.left - THUMB / 2;
    return usable <= 0 ? 0 : Math.max(0, Math.min(1, raw / usable));
  }, [ratioOf, value]);

  const valueAt = useCallback((clientX: number) => min + Math.round(ratioAt(clientX) * steps) * step, [ratioAt, min, step, steps]);

  const scrub = useCallback(
    (clientX: number) => {
      progress.set(ratioAt(clientX)); // 1:1 visual follow
      const v = valueAt(clientX);
      if (v !== value) onChange(v);
    },
    [ratioAt, valueAt, value, onChange, progress]
  );

  return (
    <motion.div
      ref={trackRef}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={ariaLabel}
      tabIndex={0}
      onPanStart={(_, info) => { setDragging(true); scrub(info.point.x); }}
      onPan={(_, info) => scrub(info.point.x)}
      onPanEnd={() => setDragging(false)}
      onTap={(_, info) => { const v = valueAt(info.point.x); if (v !== value) onChange(v); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(min, value - step)); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + step)); }
      }}
      className="relative h-5 flex-1 cursor-pointer touch-none select-none outline-none"
    >
      {/* Track + fill (both width and thumb derive from `progress`) */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-border-strong">
        {/* Fill: like light mode, it's the darker element vs the grabber — so in
            dark it's a muted tone (secondary), not the same light as the grabber. */}
        <motion.div className="absolute inset-y-0 left-0 bg-text theme-dark:bg-secondary" style={{ width: fillWidth }} />
      </div>
      {/* Thumb — light knob in both themes (never black in dark); no grow on press. */}
      <motion.div
        aria-hidden
        style={{ left: thumbLeft }}
        className="pointer-events-none absolute top-[2px] size-4 rounded-full bg-bg shadow-[0_0_0_1px_var(--border-strong),0_1px_3px_rgba(0,0,0,0.25)] theme-dark:bg-text"
      />
    </motion.div>
  );
}
