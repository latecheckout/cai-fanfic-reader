'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/components/CharactersList.module.css';

interface CharacterGroup {
  letter: string;
  items: { name: string; count: number }[];
}

interface Props {
  grouped: CharacterGroup[];
}

export function CharactersList({ grouped }: Props) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  // Filter groups by query — keep groups that have at least one matching character
  const filtered = q
    ? grouped
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => item.name.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length > 0)
    : grouped;

  const totalVisible = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      {/* Search input */}
      <div className={styles.searchRow}>
        <div className={styles.inputWrap}>
          <svg
            className={styles.searchIcon}
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>
          <input
            type="text"
            className={styles.input}
            placeholder="Search characters…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search characters"
          />
          {query && (
            <button
              className={styles.clearBtn}
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {q && (
          <span className={styles.resultCount}>
            {totalVisible} {totalVisible === 1 ? 'character' : 'characters'}
          </span>
        )}
      </div>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <p className={styles.empty}>No characters match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className={styles.groups}>
          {filtered.map((group) => (
            <div key={group.letter} className={styles.group}>
              <div className={styles.groupLetter}>{group.letter}</div>
              <ul className={styles.list}>
                {group.items.map(({ name, count }) => (
                  <li key={name} className={styles.item}>
                    <Link
                      href={`/?character=${encodeURIComponent(name)}&from=characters`}
                      className={styles.charLink}
                    >
                      <span className={styles.charName}>{name}</span>
                      <span className={styles.charCount}>
                        {count} {count === 1 ? 'work' : 'works'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
