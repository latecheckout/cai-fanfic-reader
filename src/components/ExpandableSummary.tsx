'use client';

import { useState } from 'react';
import { truncateSummary } from '@/lib/utils';

/**
 * Italic summary paragraph that shows the first ~4 sentences with an inline
 * "see more"/"see less" toggle. Rendered via WorkMetaBlock (FandomHub).
 * Renders nothing for an empty summary.
 */
export function ExpandableSummary({ summary }: { summary: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!summary) return null;
  const { text, hasMore } = truncateSummary(summary, 4);
  return (
    <p className="mt-4 font-serif text-[15px] italic leading-[1.65] text-secondary">
      {expanded ? summary : text}
      {hasMore && (
        <button
          type="button"
          className="ml-1.5 whitespace-nowrap font-sans text-[12px] not-italic text-text underline underline-offset-2 hover:opacity-70"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'see less' : '… see more'}
        </button>
      )}
    </p>
  );
}
