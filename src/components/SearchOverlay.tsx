'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOptions } from '@/lib/filters';
import styles from '@/styles/components/SearchOverlay.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  options: SearchOptions;
  filterMode?: 'include' | 'exclude';
}

export function SearchOverlay({ isOpen, onClose, options, filterMode = 'include' }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  // Focus input on open, reset query
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const filteredTags = q
    ? options.tags.filter((t) => t.name.toLowerCase().includes(q))
    : options.tags;
  const filteredFandoms = q
    ? options.fandoms.filter((f) => f.name.toLowerCase().includes(q))
    : options.fandoms;

  const applyTag = (tag: string) => {
    onClose();
    const key = filterMode === 'exclude' ? 'ex_tag' : 'tag';
    router.push(`/?${key}=${encodeURIComponent(tag)}`);
  };

  const applyFandom = (fandom: string) => {
    onClose();
    const key = filterMode === 'exclude' ? 'ex_fandom' : 'fandom';
    router.push(`/?${key}=${encodeURIComponent(fandom)}`);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal aria-label="Search">
      {/* Blurred backdrop — click to close */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div className={styles.panel}>
        {/* Input row */}
        <div className={styles.inputRow}>
          {/* Magnifying glass icon */}
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="a story about…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search stories"
          />
          <button className={styles.escBtn} onClick={onClose} aria-label="Close search">
            esc
          </button>
        </div>

        {/* 2-column browser */}
        <div className={styles.columns}>
          {/* Left: tags / tropes */}
          <div className={styles.col}>
            <div className={styles.colLabel}>Browse by feeling</div>
            <ul className={styles.itemList}>
              {filteredTags.slice(0, 10).map((t) => (
                <li key={t.name} className={styles.itemRow}>
                  <button className={styles.item} onClick={() => applyTag(t.name)}>
                    <span className={styles.itemName}>{t.name}</span>
                    <span className={styles.itemCount}>{t.count}</span>
                  </button>
                </li>
              ))}
              {filteredTags.length === 0 && (
                <li className={styles.noResults}>No matches</li>
              )}
            </ul>
          </div>

          {/* Column divider */}
          <div className={styles.colDivider} aria-hidden="true" />

          {/* Right: fandoms */}
          <div className={styles.col}>
            <div className={styles.colLabel}>Fandoms</div>
            <ul className={styles.itemList}>
              {filteredFandoms.slice(0, 10).map((f) => (
                <li key={f.name} className={styles.itemRow}>
                  <button className={`${styles.item} ${styles.itemFandom}`} onClick={() => applyFandom(f.name)}>
                    <span className={styles.itemName}>{f.name}</span>
                    <span className={styles.itemCount}>{f.count}</span>
                  </button>
                </li>
              ))}
              {filteredFandoms.length === 0 && (
                <li className={styles.noResults}>No matches</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
