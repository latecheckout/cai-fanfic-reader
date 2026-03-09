'use client';

import { useState, useEffect } from 'react';
import { WorkSummary } from '@/types';
import { WorkCard } from './WorkCard';
import styles from '@/styles/components/EndOfStory.module.css';

interface Props {
  slug: string;
  recommendations: WorkSummary[];
}

const SEED_KUDOS = 47;

export function EndOfStory({ slug, recommendations }: Props) {
  const storageKey = `fanfic-kudos-${slug}`;
  const [given, setGiven] = useState(false);
  const [count, setCount] = useState(SEED_KUDOS);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === 'true') {
        setGiven(true);
        setCount(SEED_KUDOS + 1);
      }
    } catch {
      // Fail silently
    }
  }, [storageKey]);

  function handleKudos() {
    if (given) return;
    setGiven(true);
    setCount((c) => c + 1);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 400);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // Fail silently
    }
  }

  return (
    <div className={styles.root}>
      {/* Kudos */}
      <div className={styles.kudosSection}>
        <button
          className={`${styles.kudosBtn} ${given ? styles.kudosGiven : ''} ${animate ? styles.kudosAnimate : ''}`}
          onClick={handleKudos}
          disabled={given}
          aria-label={given ? 'Kudos given' : 'Give kudos'}
        >
          <svg
            className={styles.heart}
            viewBox="0 0 24 24"
            fill={given ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className={styles.kudosCount}>{count}</span>
        </button>
        {given && (
          <p className={styles.kudosThanks}>Thank you for reading ♥</p>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className={styles.recommendations}>
          {recommendations.map((work) => (
            <WorkCard key={work.slug} work={work} />
          ))}
        </div>
      )}

      {/* Bottom padding */}
      <div className={styles.bottomPad} />
    </div>
  );
}
