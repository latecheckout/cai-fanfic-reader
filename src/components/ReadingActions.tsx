'use client';

import { useEffect, useState, useRef } from 'react';
import { useReading } from '@/context/ReadingContext';
import { BookmarkIcon } from './BookmarkIcon';
import styles from '@/styles/components/ReadingActions.module.css';

const SAVED_KEY = 'fanfic-saved-works';

export function ReadingActions() {
  const { slug, externalPrefsRef, prefsToggleFnRef } = useReading();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [announce, setAnnounce] = useState('');
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load bookmark state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const saved: string[] = raw ? JSON.parse(raw) : [];
      setIsBookmarked(saved.includes(slug));
    } catch {
      // fail silently
    }
  }, [slug]);

  function handleBookmark() {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const saved: string[] = raw ? JSON.parse(raw) : [];
      let updated: string[];
      if (saved.includes(slug)) {
        updated = saved.filter((s) => s !== slug);
        setIsBookmarked(false);
        setAnnounce('Bookmark removed');
        // No animation on remove
      } else {
        updated = [...saved, slug];
        setIsBookmarked(true);
        setAnnounce('Bookmarked');
        // Trigger pop + sparkle animation
        if (animTimerRef.current) clearTimeout(animTimerRef.current);
        setIsAnimating(true);
        animTimerRef.current = setTimeout(() => setIsAnimating(false), 420);
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch {
      // fail silently
    }
  }

  return (
    <div className={styles.actions}>
      {/* Prefs button — morphs prefs panel from this button's position */}
      <button
        ref={externalPrefsRef}
        className={styles.prefsBubble}
        onClick={() => prefsToggleFnRef.current?.()}
        aria-label="Reading preferences"
        aria-haspopup="dialog"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <line x1="2" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="5" cy="4" r="1.5" fill="currentColor" />
          <line x1="2" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="9" cy="8" r="1.5" fill="currentColor" />
          <line x1="2" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {/* Bookmark button — with pop + sparkle animation */}
      <button
        className={`${styles.bookmarkBubble} ${isAnimating ? styles.pop : ''}`}
        onClick={handleBookmark}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this work'}
        aria-pressed={isBookmarked}
      >
        {/* Sparkle particles — animate outward on bookmark add */}
        <span className={styles.spark} aria-hidden="true" />
        <span className={styles.spark} aria-hidden="true" />
        <span className={styles.spark} aria-hidden="true" />
        <span className={styles.spark} aria-hidden="true" />
        {/* Bookmark ribbon icon — filled when saved, outline when not */}
        <BookmarkIcon
          filled={isBookmarked}
          className={isBookmarked ? styles.filled : styles.outline}
        />
      </button>
      {/* a11y (4.1.3): announce bookmark changes to screen readers */}
      <span className="visually-hidden" role="status" aria-live="polite">{announce}</span>
    </div>
  );
}
