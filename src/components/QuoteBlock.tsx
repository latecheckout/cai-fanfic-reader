'use client';

import { highlightQuoteInChapter } from '@/lib/quoteHighlight';

/**
 * Highlighted-passage block — full-width sans excerpt over a soft amber wash.
 * Clicking scrolls to the passage in the chapter and flashes it. Shared by the
 * CharacterChat and Imagine modals.
 */
export function QuoteBlock({ quote, chapterIndex }: { quote: string; chapterIndex: number }) {
  return (
    <button
      type="button"
      onClick={() => highlightQuoteInChapter(quote, chapterIndex)}
      aria-label="Show this passage in the chapter"
      className="w-full cursor-pointer rounded-2xl px-4 py-3 text-left transition-[filter] hover:brightness-[0.98]"
      // Inline: complex arbitrary bg-[] classes are silently dropped (see memory).
      style={{ background: 'color-mix(in srgb, var(--toasty-amber) 8%, transparent)' }}
    >
      <p className="line-clamp-4 font-sans text-[14px] leading-[1.55] text-text">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="mt-1.5 font-mono text-[11px] tracking-[0.02em] text-secondary">
        ch. {chapterIndex + 1}
      </p>
    </button>
  );
}
