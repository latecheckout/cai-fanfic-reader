'use client';

import { useState, useEffect, useRef } from 'react';
import { useReading } from '@/context/ReadingContext';
import { PrefsPanel } from './PrefsPanel';
import styles from '@/styles/components/MobileReadingBar.module.css';

export function MobileReadingBar() {
  const { activeChapterIndex, totalChapters, chapterTitles, scrollToChapter, prefsToggleFnRef } = useReading();
  const [chapterSheetOpen, setChapterSheetOpen] = useState(false);
  const [prefsSheetOpen, setPrefsSheetOpen] = useState(false);
  const prefsPanelRef = useRef<HTMLDivElement>(null);

  // Wire prefsToggleFnRef so external triggers work
  useEffect(() => {
    prefsToggleFnRef.current = () => setPrefsSheetOpen((v) => !v);
    return () => { prefsToggleFnRef.current = null; };
  }, [prefsToggleFnRef]);

  // Close sheets on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (prefsSheetOpen) { setPrefsSheetOpen(false); return; }
        if (chapterSheetOpen) { setChapterSheetOpen(false); return; }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [chapterSheetOpen, prefsSheetOpen]);

  const chapterLabel = chapterTitles[activeChapterIndex]
    ? `Ch. ${activeChapterIndex + 1} / ${totalChapters} — ${chapterTitles[activeChapterIndex]}`
    : `Ch. ${activeChapterIndex + 1} / ${totalChapters}`;

  const truncated = chapterLabel.length > 38 ? chapterLabel.slice(0, 38) + '…' : chapterLabel;

  return (
    <>
      {/* Chapter list sheet */}
      {chapterSheetOpen && (
        <div className={styles.sheetOverlay} onClick={() => setChapterSheetOpen(false)}>
          <div className={styles.chapterSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} aria-hidden="true" />
            <div className={styles.sheetHeader}>
              <span className={styles.sheetTitle}>Chapters</span>
              <button className={styles.sheetClose} onClick={() => setChapterSheetOpen(false)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className={styles.chapterList}>
              {chapterTitles.map((title, i) => (
                <button
                  key={i}
                  className={`${styles.chapterItem} ${i === activeChapterIndex ? styles.chapterItemActive : ''}`}
                  onClick={() => {
                    scrollToChapter(i);
                    setChapterSheetOpen(false);
                  }}
                >
                  <span className={styles.chapterNum}>Ch. {i + 1}</span>
                  {title && <span className={styles.chapterTitle}>{title}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Prefs sheet */}
      {prefsSheetOpen && (
        <div className={styles.sheetOverlay} onClick={() => setPrefsSheetOpen(false)}>
          <div className={styles.prefsSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} aria-hidden="true" />
            <PrefsPanel ref={prefsPanelRef} onClose={() => setPrefsSheetOpen(false)} inSheet />
          </div>
        </div>
      )}

      {/* Fixed bottom bar */}
      <div className={styles.bar}>
        {/* Back button */}
        <a href="/" className={styles.backBtn} aria-label="Back to works">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M6.5 1.5L1.5 7L6.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        {/* Chapter zone */}
        <button
          className={styles.chapterBtn}
          onClick={() => setChapterSheetOpen((v) => !v)}
          aria-label="Chapter navigation"
        >
          {totalChapters > 1 && (
            <span className={styles.chapterLabel}>{truncated}</span>
          )}
          {totalChapters === 1 && (
            <span className={styles.chapterLabel}>Reading</span>
          )}
        </button>

        {/* Prefs button */}
        <button
          className={styles.prefsBtn}
          onClick={() => setPrefsSheetOpen((v) => !v)}
          aria-label="Reading preferences"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 4h2.5M6.5 4H15M1 8h6.5M10.5 8H15M1 12h2.5M6.5 12H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="4.5" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="9" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="4.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
    </>
  );
}
