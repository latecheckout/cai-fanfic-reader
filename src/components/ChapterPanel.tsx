'use client';

import { useReading } from '@/context/ReadingContext';
import { stripChapterPrefix } from '@/lib/utils';
import { MENU_ROW, MENU_ROW_ACTIVE } from './popoverChrome';
import { LockIcon } from './icons';
import { Tooltip } from './Tooltip';

// Fades the locked row's title out under the lock icon. Inline style, not a
// Tailwind arbitrary class — complex arbitrary gradients get silently dropped.
const LOCKED_TITLE_MASK = 'linear-gradient(to right, black 55%, transparent 92%)';

interface Props {
  chapters: string[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function ChapterPanel({ chapters, activeIndex, onSelect }: Props) {
  const { lastReadChapterIndex, lockedChapters } = useReading();
  return (
    <ul
      role="listbox"
      aria-label="Chapters"
      className="flex flex-1 list-none flex-col gap-1 overflow-y-auto p-2 [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[3px]"
    >
      {chapters.map((title, i) => {
        const active = i === activeIndex;
        const locked = lockedChapters.includes(i);
        const raw = title || `Chapter ${i + 1}`;
        // The leading number already conveys the index — drop a "Chapter N:" prefix.
        const label = stripChapterPrefix(raw);
        // Zero-pad to two digits so every row's number column is the same width
        // (01, 02, … 10, 11) — keeps the divider line vertically aligned.
        const num = String(i + 1).padStart(2, '0');
        return (
          <li key={i} role="option" aria-selected={active}>
            <button
              className={`${MENU_ROW} ${active ? MENU_ROW_ACTIVE : ''}`}
              onClick={() => onSelect(i)}
            >
              {/* Mirror the main pill: mono number · divider line · sans title */}
              <span className={`shrink-0 font-mono text-[12px] tabular-nums ${active ? 'text-text' : 'text-secondary'}`}>
                {num}
              </span>
              <span className="h-3.5 w-px shrink-0 bg-border-strong" aria-hidden="true" />
              <span
                className={`min-w-0 flex-1 truncate font-sans text-[13px] ${
                  locked ? 'text-secondary' : active ? 'font-medium text-text' : 'text-secondary'
                }`}
                style={locked ? { maskImage: LOCKED_TITLE_MASK, WebkitMaskImage: LOCKED_TITLE_MASK } : undefined}
              >
                {label}
              </span>
              {locked && (
                <Tooltip label="Locked chapter" align="right">
                  <span className="ml-auto flex shrink-0 items-center text-secondary" aria-label="Locked">
                    <LockIcon width={14} height={14} />
                  </span>
                </Tooltip>
              )}
              {!locked && lastReadChapterIndex !== null && i === lastReadChapterIndex && (
                <Tooltip label="You left off here" align="right">
                  <span
                    className="ml-auto shrink-0 font-mono text-[14px] leading-none text-secondary/50"
                    aria-label="Last read"
                  >
                    ·
                  </span>
                </Tooltip>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
