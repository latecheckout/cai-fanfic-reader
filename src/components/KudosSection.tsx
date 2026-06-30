'use client';

import { useState } from 'react';
import styles from '@/styles/components/KudosSection.module.css';

interface Props {
  slug: string;
  totalKudos: number;
}

export function KudosSection({ slug, totalKudos }: Props) {
  const [given, setGiven] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fanfic-kudos') || '[]');
      return Array.isArray(saved) && saved.includes(slug);
    } catch {
      return false;
    }
  });
  const [animating, setAnimating] = useState(false);
  const [displayCount, setDisplayCount] = useState(totalKudos);

  // @WIRE  — Add to handleKudos(): POST /works/:slug/kudos after optimistic update.
  //          On error: roll back setGiven(false) + setDisplayCount(c => c - 1).
  //          localStorage write can remain as client-side cache.
  // @AUTH  — Requires authentication. Show login nudge if no session (before optimistic update).
  //          See: .claude/docs/wiring-guide.md#4-kudos
  function handleKudos() {
    if (given) return;
    setGiven(true);
    setAnimating(true);
    setDisplayCount((c) => c + 1);
    try {
      const saved = JSON.parse(localStorage.getItem('fanfic-kudos') || '[]');
      if (Array.isArray(saved) && !saved.includes(slug)) {
        localStorage.setItem('fanfic-kudos', JSON.stringify([...saved, slug]));
      }
    } catch {}
    setTimeout(() => setAnimating(false), 620);
  }

  return (
    <div className={styles.zone}>
      <p className={styles.endMark}>— end of work —</p>
      <button
        className={[
          styles.button,
          given ? styles.given : '',
          animating ? styles.pop : '',
        ].filter(Boolean).join(' ')}
        onClick={handleKudos}
        disabled={given}
        aria-label={given ? 'Kudos given' : 'Leave kudos for this work'}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={styles.heart} aria-hidden="true">♥</span>
        ))}
        <span className={styles.label}>
          {given ? '♥ Kudos left' : '♥ Leave Kudos'}
        </span>
      </button>
      <p className={[styles.count, animating ? styles.countPop : ''].filter(Boolean).join(' ')}>
        {displayCount.toLocaleString()} kudos
      </p>
      {/* a11y (4.1.3): announce the action to screen readers */}
      <span className="visually-hidden" role="status" aria-live="polite">
        {given ? 'Kudos left for this work' : ''}
      </span>
    </div>
  );
}
