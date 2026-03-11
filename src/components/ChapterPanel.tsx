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
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Chapter navigation"
      >
        <div className={styles.panelContent}>
          {/* Header band — consistent with other panels */}
          <div className={styles.header}>
            <span className={styles.headerLabel}>Chapters</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <ul className={styles.list} role="listbox" aria-label="Chapters">
            {chapters.map((title, i) => (
              <li key={i} role="option" aria-selected={i === activeIndex}>
                <button
                  className={`${styles.chapterRow} ${i === activeIndex ? styles.active : ''}`}
                  onClick={() => onSelect(i)}
                >
                  <span className={styles.chapterNum}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.chapterTitle}>
                    {title || `Chapter ${i + 1}`}
                  </span>
                  {lastReadChapterIndex !== null && i === lastReadChapterIndex && (
                    <span className={styles.lastReadDot} aria-label="Last read" title="You left off here">·</span>
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
