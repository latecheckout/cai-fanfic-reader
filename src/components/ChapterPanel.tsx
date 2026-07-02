'use client';

import React from 'react';
import { useReading } from '@/context/ReadingContext';
import styles from '@/styles/components/ChapterDrawer.module.css';

interface Props {
  chapters: string[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onClose: () => void;
}

export const ChapterPanel = React.forwardRef<HTMLDivElement, Props>(
  function ChapterPanel({ chapters, activeIndex, onSelect, onClose }, ref) {
    const { lastReadChapterIndex } = useReading();
    return (
      <div
        ref={ref}
        id="chapter-panel"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chapter-panel-title"
      >
        <div className={styles.panelContent}>
          {/* Header band — consistent with other panels */}
          <div className={styles.header}>
            <h2 id="chapter-panel-title" className={styles.headerLabel}>Chapters</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* A table of contents is navigation, not form selection — a labeled
             list of buttons (aria-current for the active chapter), NOT a listbox
             of options. The ordinal is decorative (aria-hidden) so a screen
             reader reads the clean title, e.g. "Chapter 1: Arrival". */}
          <ul className={styles.list} role="list">
            {chapters.map((title, i) => (
              <li key={i}>
                <button
                  aria-current={i === activeIndex ? 'true' : undefined}
                  className={`${styles.chapterRow} ${i === activeIndex ? styles.active : ''}`}
                  onClick={() => onSelect(i)}
                >
                  <span className={styles.chapterNum} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.chapterTitle}>
                    {title || `Chapter ${i + 1}`}
                  </span>
                  {lastReadChapterIndex !== null && i === lastReadChapterIndex && (
                    <>
                      <span className={styles.lastReadDot} aria-hidden="true" title="You left off here">·</span>
                      <span className="visually-hidden"> — last read</span>
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

ChapterPanel.displayName = 'ChapterPanel';
