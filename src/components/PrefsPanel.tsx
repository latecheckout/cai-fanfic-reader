'use client';

import React, { useEffect, useState } from 'react';
import { Segmented } from './Segmented';
import { SizeSlider } from './SizeSlider';

// The popover (desktop) and bottom sheet (mobile) own their own close affordances
// (click-outside / Escape / overlay tap), so this panel is just the controls.

type FontFamily = 'serif' | 'sans' | 'dyslexic';
type Theme = 'default' | 'light' | 'paper' | 'dark';
type LineWidth = 'narrow' | 'default' | 'wide';

const LINE_WIDTH_VALUES: Record<LineWidth, string> = {
  narrow: 'var(--line-width-narrow)',
  default: 'var(--line-width-default)',
  wide: 'var(--line-width-wide)',
};

const FONT_OPTIONS: { value: FontFamily; label: string; fontFamily: string }[] = [
  { value: 'serif', label: 'Serif', fontFamily: '"Lora", Georgia, serif' },
  { value: 'sans', label: 'Sans', fontFamily: '"Character Sans", system-ui, sans-serif' },
  { value: 'dyslexic', label: 'Dyslexic', fontFamily: '"OpenDyslexic", cursive' },
];

const THEME_SWATCHES: { value: Theme; color: string | null; label: string }[] = [
  { value: 'default', color: null, label: 'System' },
  { value: 'light', color: '#FFFFFF', label: 'Light' },
  { value: 'paper', color: '#EDE8DE', label: 'Paper' },
  { value: 'dark', color: '#141210', label: 'Dark' },
];

const WIDTH_ICONS: Record<LineWidth, React.ReactNode> = {
  narrow: (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <line x1="2" y1="2" x2="11" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  default: (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <line x1="2" y1="2" x2="15" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="5.5" x2="13" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  wide: (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <line x1="2" y1="2" x2="18" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="5.5" x2="16" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="9" x2="18" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

// Popover chrome uses only Character Mono (labels/values) + Lora (heading).
const SECTION_LABEL = 'font-mono text-[11px] uppercase tracking-[0.1em] text-secondary';

export function PrefsPanel() {
  // Seed every control from localStorage on the FIRST render (lazy init) — not
  // a post-mount effect — so the segmented indicator and slider thumb are at
  // their saved positions immediately. No value change after mount = no slide.
  // (Safe: this panel only renders client-side, gated behind the open popover.)
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    try { return (localStorage.getItem('fanfic-font') as FontFamily) || 'serif'; }
    catch { return 'serif'; }
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    try { const s = localStorage.getItem('fanfic-font-size'); return s ? Number(s) : 19; }
    catch { return 19; }
  });
  const [lineWidth, setLineWidth] = useState<LineWidth>(() => {
    try { return (localStorage.getItem('fanfic-line-width') as LineWidth) || 'default'; }
    catch { return 'default'; }
  });
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem('fanfic-reader-theme') as Theme) || 'default'; }
    catch { return 'default'; }
  });
  // Track the OS scheme so the "System" swatch shows the bg it actually resolves to.
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    try { return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false; }
    catch { return false; }
  });
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  function applyFontFamily(f: FontFamily) {
    setFontFamily(f);
    document.documentElement.setAttribute('data-font', f);
    try { localStorage.setItem('fanfic-font', f); } catch { /**/ }
  }

  function applyFontSize(size: number) {
    setFontSize(size);
    document.documentElement.style.setProperty('--font-size-body', `${size}px`);
    try { localStorage.setItem('fanfic-font-size', String(size)); } catch { /**/ }
  }

  function applyLineWidth(w: LineWidth) {
    setLineWidth(w);
    document.documentElement.style.setProperty('--reader-line-width', LINE_WIDTH_VALUES[w]);
    try { localStorage.setItem('fanfic-line-width', w); } catch { /**/ }
  }

  function applyThemeVisual(t: Theme) {
    if (t === 'default') {
      const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
  }

  function applyTheme(t: Theme) {
    setTheme(t);
    applyThemeVisual(t);
    if (t === 'default') {
      try { localStorage.removeItem('fanfic-reader-theme'); } catch {}
    } else {
      try { localStorage.setItem('fanfic-reader-theme', t); } catch {}
    }
  }

  return (
    <>
      {/* Header — Lora heading */}
      <div className="flex shrink-0 items-center px-1 pb-4">
        <span className="font-serif text-[16px] font-medium text-text">Reading preferences</span>
      </div>

      <div className="flex flex-col gap-5">
        {/* Font family */}
        <div className="flex flex-col gap-2.5">
          <span className={SECTION_LABEL}>Font</span>
          <Segmented
            id="font"
            ariaLabel="Font family"
            value={fontFamily}
            onChange={(v) => applyFontFamily(v as FontFamily)}
            options={FONT_OPTIONS.map((f) => ({
              value: f.value,
              label: f.label,
              content: (
                <span className="flex flex-col items-center gap-1">
                  <span className="text-[22px] leading-none" style={{ fontFamily: f.fontFamily }}>Aa</span>
                  <span className="font-mono text-[11px] tracking-[0.04em]">{f.label}</span>
                </span>
              ),
            }))}
          />
        </div>

        {/* Text size */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className={SECTION_LABEL}>Text size</span>
            <span className="font-mono text-[12px] tabular-nums text-secondary">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 font-serif text-[14px] text-secondary/60">A</span>
            <SizeSlider value={fontSize} min={16} max={24} step={1} onChange={applyFontSize} ariaLabel="Text size" />
            <span className="shrink-0 font-serif text-[22px] text-secondary/60">A</span>
          </div>
        </div>

        {/* Line width */}
        <div className="flex flex-col gap-2.5">
          <span className={SECTION_LABEL}>Line width</span>
          <Segmented
            id="line-width"
            ariaLabel="Line width"
            value={lineWidth}
            onChange={(v) => applyLineWidth(v as LineWidth)}
            options={(['narrow', 'default', 'wide'] as LineWidth[]).map((w) => ({
              value: w,
              label: w === 'narrow' ? 'Narrow' : w === 'default' ? 'Default' : 'Wide',
              content: (
                <span className="flex flex-col items-center gap-1.5">
                  {WIDTH_ICONS[w]}
                  <span className="font-mono text-[11px] tracking-[0.02em]">
                    {w === 'narrow' ? 'Narrow' : w === 'default' ? 'Default' : 'Wide'}
                  </span>
                </span>
              ),
            }))}
          />
        </div>

        {/* Theme — each option in its own card */}
        <div className="flex flex-col gap-2.5">
          <span className={SECTION_LABEL}>Theme</span>
          <div className="grid grid-cols-4 gap-1">
            {THEME_SWATCHES.map((s) => {
              const active = theme === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => applyTheme(s.value)}
                  onMouseEnter={() => applyThemeVisual(s.value)}
                  onMouseLeave={() => applyThemeVisual(theme)}
                  aria-label={s.label}
                  aria-pressed={active}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl p-2 transition-colors ${active ? 'bg-[color-mix(in_srgb,var(--text)_12%,transparent)]' : 'bg-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)]'}`}
                >
                  <span
                    className="h-7 w-7 rounded-full border-[1.5px] border-border-chip"
                    style={s.color === null
                      ? { background: systemDark ? '#141210' : '#FFFFFF' }
                      : { background: s.color }
                    }
                    aria-hidden="true"
                  />
                  <span className={`font-mono text-[10px] tracking-[0.04em] ${active ? 'text-text' : 'text-secondary/60'}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
