'use client';

import styles from '@/styles/components/ReadingHUD.module.css';

export function ReadingHUD() {
  return (
    <a href="/" className={styles.backBubble} aria-label="Back to works">
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 2L4 7L9 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
