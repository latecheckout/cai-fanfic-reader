'use client';

import { LayoutGroup, motion } from 'motion/react';
import { LayoutView } from '@/types';
import styles from '@/styles/components/ViewToggle.module.css';

interface Props {
  view: LayoutView;
  onViewChange: (v: LayoutView) => void;
}

const OPTIONS: { value: LayoutView; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'list',
    label: 'List',
    desc: 'AO3 mode: for the tag purists',
    icon: (
      <svg width="15" height="14" viewBox="0 0 15 14" fill="none" stroke="currentColor"
        strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M2 3.5h11M2 7h11M2 10.5h7" />
      </svg>
    ),
  },
  {
    value: 'grid',
    label: 'Grid',
    desc: 'Judge a book by its cover',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="0" y="0" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="8" y="0" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="0" y="8" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
    ),
  },
];

/** Segmented Text/Image toggle in the results toolbar. Mirrors the sort pill's
 *  sizing; the active segment is a shared-layout (motion layoutId) accent pill
 *  that springs between options. */
export function ViewToggle({ view, onViewChange }: Props) {
  return (
    <LayoutGroup id="view-toggle">
      <div className={styles.toggle} role="radiogroup" aria-label="Layout">
        {OPTIONS.map((opt) => {
          const active = view === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${opt.label} view`}
              data-tooltip={opt.desc}
              className={`${styles.seg} ${active ? styles.segActive : ''}`}
              onClick={() => { if (!active) onViewChange(opt.value); }}
            >
              {active && (
                <motion.span
                  layoutId="view-toggle-active"
                  className={styles.fill}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className={styles.segIcon}>{opt.icon}</span>
              <span className={styles.segLabel}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
