'use client';

import { useEffect, useState } from 'react';
import { useReading } from '@/context/ReadingContext';
import styles from '@/styles/components/ReadingActions.module.css';

const SAVED_KEY = 'fanfic-saved-works';

export function ReadingActions() {
  const { slug } = useReading();
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      } else {
        updated = [...saved, slug];
        setIsBookmarked(true);
      }
      localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    } catch {
      // fail silently
    }
  }

  return (
    <button
      className={styles.bookmarkBubble}
      onClick={handleBookmark}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this work'}
      aria-pressed={isBookmarked}
    >
      {/* Bookmark ribbon icon — filled when saved, outline when not */}
      <svg
        width="13"
        height="16"
        viewBox="0 0 13 16"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={isBookmarked ? styles.filled : styles.outline}
      >
        <path d="M1.5 2.5C1.5 1.948 1.948 1.5 2.5 1.5h8c.552 0 1 .448 1 1v11.5l-4.5-3-4.5 3V2.5z" />
      </svg>
    </button>
  );
}
