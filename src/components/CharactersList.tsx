'use client';

import { useState } from 'react';
import Link from 'next/link';

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
      <div className="mb-8 flex items-center gap-4">
        <div className="relative max-w-[360px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
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
            className="h-9 w-full rounded-full border border-border-chip bg-transparent pl-[34px] pr-9 font-sans text-[15px] text-text outline-none transition-colors duration-150 placeholder:text-secondary placeholder:opacity-60 focus:border-text"
            placeholder="Search characters…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search characters"
          />
          {query && (
            <button
              className="absolute right-[10px] top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center p-0 text-base leading-none text-secondary transition-colors duration-[120ms] hover:text-text"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {q && (
          <span className="shrink-0 font-mono text-[13px] text-secondary">
            {totalVisible} {totalVisible === 1 ? 'character' : 'characters'}
          </span>
        )}
      </div>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <p className="py-8 font-sans text-base text-secondary">No characters match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((group) => (
            <div
              key={group.letter}
              className="flex gap-6 border-t border-border py-5 last:border-b"
            >
              <div className="w-6 shrink-0 pt-[3px] font-mono text-[13px] font-semibold tracking-[0.06em] text-secondary opacity-50">
                {group.letter}
              </div>
              <ul className="m-0 min-w-0 flex-1 list-none p-0">
                {group.items.map(({ name, count }) => (
                  <li key={name} className="block">
                    <Link
                      href={`/?character=${encodeURIComponent(name)}&from=characters`}
                      className="flex items-baseline justify-between gap-6 py-2 text-inherit no-underline transition-opacity duration-[var(--transition-micro)] hover:opacity-65"
                    >
                      <span className="min-w-0 font-sans text-[17px] font-normal text-text">{name}</span>
                      <span className="shrink-0 font-mono text-[13px] text-secondary">
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
