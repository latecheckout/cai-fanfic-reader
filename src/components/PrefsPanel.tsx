'use client';

import React, { useEffect, useState } from 'react';
import styles from '@/styles/components/ReadingPrefsPanel.module.css';

interface Props {
  onClose: () => void;
}

type Theme = 'light' | 'paper' | 'dark';
type LineWidth = 'narrow' | 'default' | 'wide';

const LINE_WIDTH_VALUES: Record<LineWidth, string> = {
  narrow: 'var(--line-width-narrow)',
  default: 'var(--line-width-default)',
  wide: 'var(--line-width-wide)',
};

const THEME_SWATCHES: { value: Theme; color: string; label: string }[] = [
  { value: 'light', color: '#F7F4EF', label: 'Light' },
  { value: 'paper', color: '#EDE8DE', label: 'Warm' },
  { value: 'dark',  color: '#141210', label: 'Dark' },
];

export const PrefsPanel = React.forwardRef<HTMLDivElement, Props>(
  function PrefsPanel({ onClose }, ref) {
    const [fontSize, setFontSize] = useState(19);
    const [lineWidth, setLineWidth] = useState<LineWidth>('default');
    const [theme, setTheme] = useState<Theme>('light');

    // Load saved prefs from localStorage
    useEffect(() => {
      try {
        const savedFont = localStorage.getItem('fanfic-font-size');
        if (savedFont) setFontSize(Number(savedFont));
        const savedWidth = localStorage.getItem('fanfic-line-width') as LineWidth | null;
        if (savedWidth) setLineWidth(savedWidth);
        const savedTheme = localStorage.getItem('fanfic-theme') as Theme | null;
        if (savedTheme) setTheme(savedTheme);
      } catch {
        // Fail silently
      }
    }, []);

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

    function applyTheme(t: Theme) {
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('fanfic-theme', t); } catch { /**/ }
    }

    return (
      <div
        ref={ref}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Reading preferences"
      >
        <div className={styles.panelContent}>
          {/* Header */}
          <div className={styles.header}>
            <span className={styles.heading}>Reading preferences</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className={styles.sections}>
            {/* Font size */}
            <div className={styles.section}>
              <label className={styles.sectionLabel} htmlFor="prefs-font-size">
                Text size
              </label>
              <div className={styles.rangeRow}>
                <span className={styles.rangeSmall}>A</span>
                <input
                  id="prefs-font-size"
                  type="range"
                  min={16}
                  max={24}
                  step={1}
                  value={fontSize}
                  onChange={(e) => applyFontSize(Number(e.target.value))}
                  className={styles.range}
                />
                <span className={styles.rangeLarge}>A</span>
              </div>
              <p className={styles.sectionValue}>{fontSize}px</p>
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
                  >
                    {w === 'narrow' ? 'Narrow' : w === 'default' ? 'Default' : 'Wide'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme — circular swatches */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Theme</span>
              <div className={styles.swatches}>
                {THEME_SWATCHES.map(({ value, color, label }) => (
                  <button
                    key={value}
                    className={`${styles.swatch} ${theme === value ? styles.swatchActive : ''}`}
                    style={{ background: color }}
                    onClick={() => applyTheme(value)}
                    aria-label={label}
                    title={label}
                  />
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
