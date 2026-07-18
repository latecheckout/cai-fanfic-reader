'use client';

import { useEffect, useState } from 'react';
import { HeartIcon } from './icons';
import { KUDOS_KEY } from '@/lib/constants';

interface Props {
  slug: string;
  totalKudos: number;
}

export function KudosSection({ slug, totalKudos }: Props) {
  // Start false so SSR and the first client render match; read the persisted
  // state after mount to avoid a hydration mismatch (this component is SSR-ed).
  const [given, setGiven] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [displayCount, setDisplayCount] = useState(totalKudos);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KUDOS_KEY) || '[]');
      if (Array.isArray(saved) && saved.includes(slug)) setGiven(true);
    } catch {}
  }, [slug]);

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
      const saved = JSON.parse(localStorage.getItem(KUDOS_KEY) || '[]');
      if (Array.isArray(saved) && !saved.includes(slug)) {
        localStorage.setItem(KUDOS_KEY, JSON.stringify([...saved, slug]));
      }
    } catch {}
    setTimeout(() => setAnimating(false), 620);
  }

  return (
    <div className="flex flex-col items-center pt-20 px-6 pb-[100px] gap-5">
      <p className="font-mono text-[10px] tracking-[0.12em] text-secondary opacity-40 m-0">— end of work —</p>
      <button
        className={[
          'relative overflow-visible font-sans text-sm font-medium tracking-[0.02em] py-[14px] px-10 rounded-full border-[1.5px] border-text bg-transparent text-text cursor-pointer min-w-[200px] flex items-center justify-center transition-colors duration-200 hover:not-disabled:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]',
          given ? 'bg-text text-bg cursor-default' : '',
          animating ? 'kudos-pop' : '',
        ].filter(Boolean).join(' ')}
        onClick={handleKudos}
        disabled={given}
        aria-label={given ? 'Kudos given' : 'Leave kudos for this work'}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="kudos-heart absolute top-1/2 left-1/2 text-text opacity-0 pointer-events-none -translate-x-1/2 -translate-y-1/2 select-none leading-none" aria-hidden="true">
            <HeartIcon width={10} height={10} />
          </span>
        ))}
        <span className="relative z-[1] pointer-events-none inline-flex items-center gap-1.5">
          <HeartIcon width={13} height={13} />
          {given ? 'Kudos left' : 'Leave Kudos'}
        </span>
      </button>
      <p
        aria-live="polite"
        className={[
          'font-mono text-[11px] tracking-[0.08em] text-secondary m-0 transition-opacity duration-200',
          animating ? 'kudos-count-pop' : '',
        ].filter(Boolean).join(' ')}
      >
        {displayCount.toLocaleString()} kudos
      </p>
    </div>
  );
}
