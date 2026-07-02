'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/components/PrefsPanel.module.css';

interface Props {
  onClose: () => void;
  /** When true, overrides the morph-animation defaults for use inside a bottom sheet */
  inSheet?: boolean;
}

type FontFamily = 'serif' | 'sans' | 'dyslexic';
type Theme = 'default' | 'light' | 'paper' | 'dark';
type LineWidth = 'narrow' | 'default' | 'wide';

const LINE_WIDTH_VALUES: Record<LineWidth, string> = {
  narrow: 'var(--line-width-narrow)',
  default: 'var(--line-width-default)',
  wide: 'var(--line-width-wide)',
};

const FONT_OPTIONS: { value: FontFamily; label: string; fontFamily: string }[] = [
  { value: 'serif',    label: 'Serif',    fontFamily: '"Lora", Georgia, serif' },
  { value: 'sans',     label: 'Sans',     fontFamily: '"Character Sans", system-ui, sans-serif' },
  { value: 'dyslexic', label: 'Dyslexic', fontFamily: '"OpenDyslexic", cursive' },
];

const THEME_SWATCHES: { value: Theme; color: string | null; label: string }[] = [
  { value: 'default', color: null,      label: 'System' },
  { value: 'light',   color: '#FFFFFF',  label: 'Light'  },
  { value: 'paper',   color: '#EDE8DE',  label: 'Paper'  },
  { value: 'dark',    color: '#141210',  label: 'Dark'   },
];

// Column-width indicator icons for the line width control
const WIDTH_ICONS: Record<LineWidth, React.ReactNode> = {
  narrow: (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <line x1="2" y1="2"   x2="11" y2="2"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="5.5" x2="9"  y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="9"   x2="11" y2="9"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  default: (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <line x1="2" y1="2"   x2="15" y2="2"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="5.5" x2="13" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="9"   x2="15" y2="9"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  wide: (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
      <line x1="2" y1="2"   x2="18" y2="2"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="5.5" x2="16" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="9"   x2="18" y2="9"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export const PrefsPanel = React.forwardRef<HTMLDivElement, Props>(
  function PrefsPanel({ onClose, inSheet }, ref) {
    const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
    const [fontSize, setFontSize] = useState(19);
    const [lineWidth, setLineWidth] = useState<LineWidth>('default');
    const [theme, setTheme] = useState<Theme>(() => {
      try { return (localStorage.getItem('fanfic-reader-theme') as Theme) || 'default'; }
      catch { return 'default'; }
    });
    const [isDragging, setIsDragging] = useState(false);

    // Load saved prefs from localStorage
    useEffect(() => {
      try {
        const savedSize = localStorage.getItem('fanfic-font-size');
        if (savedSize) setFontSize(Number(savedSize));
        const savedWidth = localStorage.getItem('fanfic-line-width') as LineWidth | null;
        if (savedWidth) setLineWidth(savedWidth);
        const savedFamily = localStorage.getItem('fanfic-font') as FontFamily | null;
        if (savedFamily) setFontFamily(savedFamily);
      } catch {
        // Fail silently
      }
    }, []);

    function setBackdropAdjusting(active: boolean) {
      const el = document.querySelector('[data-panel-backdrop]');
      if (active) {
        el?.setAttribute('data-adjusting', 'true');
      } else {
        el?.removeAttribute('data-adjusting');
      }
    }

    function handleAdjustStart() {
      setIsDragging(true);
      setBackdropAdjusting(true);
    }

    function handleAdjustEnd() {
      setIsDragging(false);
      setBackdropAdjusting(false);
    }

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

    // Apply theme visually only (no save) — used for hover preview
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

    // Thumb ratio 0–1 for tooltip CSS positioning
    const thumbRatio = (fontSize - 16) / 8;

    return (
      <div
        ref={ref}
        className={`${styles.panel} ${inSheet ? styles.panelInSheet : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Reading preferences"
      >
        <div className={styles.panelContent}>
          {/* Header — no dividing line */}
          <div className={styles.header}>
            <span className={styles.heading}>Reading preferences</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div
            className={styles.sections}
            onPointerDown={handleAdjustStart}
            onPointerUp={handleAdjustEnd}
          >
            {/* Font family */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Font</span>
              <div className={styles.fontPicker}>
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    className={`${styles.fontBlock} ${fontFamily === f.value ? styles.fontBlockActive : ''}`}
                    onClick={() => applyFontFamily(f.value)}
                    aria-pressed={fontFamily === f.value}
                  >
                    <span
                      className={styles.fontPreview}
                      style={{ fontFamily: f.fontFamily }}
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                    <span className={styles.fontLabel}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="prefs-font-size">
                Text size
              </label>
              <div className={styles.rangeRow}>
                <span className={styles.rangeSmall}>A</span>
                <div className={styles.rangeTrack}>
                  {/* Floating value tooltip — visible while dragging */}
                  <div
                    className={`${styles.thumbTooltip} ${isDragging ? styles.thumbTooltipVisible : ''}`}
                    style={{ '--thumb-ratio': thumbRatio } as React.CSSProperties}
                    aria-hidden="true"
                  >
                    {fontSize}
                  </div>
                  <input
                    id="prefs-font-size"
                    type="range"
                    min={16}
                    max={24}
                    step={1}
                    value={fontSize}
                    aria-valuetext={`${fontSize}px`}
                    onChange={(e) => applyFontSize(Number(e.target.value))}
                    className={styles.range}
                  />
                </div>
                <span className={styles.rangeLarge}>A</span>
              </div>
            </div>

            {/* Line width */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Line width</span>
              <div className={styles.segmented}>
                {(['narrow', 'default', 'wide'] as LineWidth[]).map((w) => (
                  <button
                    key={w}
                    className={`${styles.segBtn} ${lineWidth === w ? styles.segActive : ''}`}
                    onClick={() => applyLineWidth(w)}
                    aria-pressed={lineWidth === w}
                  >
                    {WIDTH_ICONS[w]}
                    <span className={styles.segLabel}>
                      {w === 'narrow' ? 'Narrow' : w === 'default' ? 'Default' : 'Wide'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Theme</span>
              <div className={styles.swatches}>
                {THEME_SWATCHES.map((s) => (
                  <div key={s.value} className={styles.swatchItem}>
                    <button
                      className={`${styles.swatch} ${theme === s.value ? styles.swatchActive : ''} ${s.value === 'default' ? styles.swatchDefault : ''}`}
                      style={s.color === null
                        ? { background: 'conic-gradient(from -90deg, #F0EFED 50%, #1A1814 50%)' }
                        : { background: s.color }
                      }
                      onClick={() => applyTheme(s.value)}
                      onMouseEnter={() => applyThemeVisual(s.value)}
                      onMouseLeave={() => applyThemeVisual(theme)}
                      aria-label={s.label}
                      aria-pressed={theme === s.value}
                    />
                    <span className={`${styles.swatchLabel} ${theme === s.value ? styles.swatchLabelActive : ''}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrefsPanel.displayName = 'PrefsPanel';
