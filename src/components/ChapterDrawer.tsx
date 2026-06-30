'use client';

import { useEffect, useRef, useState } from 'react';
import { useReading } from '@/context/ReadingContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from '@/styles/components/ChapterDrawer.module.css';

interface Props {
  onClose: () => void;
  onSelect: (i: number) => void;
}

export function ChapterDrawer({ onClose, onSelect }: Props) {
  const { chapterTitles, totalChapters, activeChapterIndex } = useReading();
  const [visible, setVisible] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 220);
  }

  // a11y: focus-in, Tab-trap, Escape, and focus-return to the trigger
  useFocusTrap(drawerRef, visible, handleClose);

  // Touch drag-to-dismiss
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 60) handleClose();
    touchStartY.current = null;
  }

  return (
    <div
      className={`${styles.wrapper} ${visible ? styles.wrapperVisible : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Chapter navigation"
    >
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`${styles.drawer} ${visible ? styles.drawerVisible : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className={styles.handle} aria-hidden="true" />

        {/* Chapter list */}
        <ul className={styles.list} role="listbox" aria-label="Chapters">
          {Array.from({ length: totalChapters }, (_, i) => (
            <li key={i} role="presentation">
              <button
                role="option"
                aria-selected={i === activeChapterIndex}
                className={`${styles.chapterRow} ${i === activeChapterIndex ? styles.active : ''}`}
                onClick={() => onSelect(i)}
              >
                <span className={styles.chapterNum}>{i + 1}</span>
                <span className={styles.chapterTitle}>
                  {chapterTitles[i] || `Chapter ${i + 1}`}
                </span>
                {i === activeChapterIndex && (
                  <span className={styles.currentMark} aria-hidden="true">●</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
