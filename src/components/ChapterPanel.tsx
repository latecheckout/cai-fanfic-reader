'use client';

import { useReading } from '@/context/ReadingContext';
import { stripChapterPrefix } from '@/lib/utils';

interface Props {
  chapters: string[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function ChapterPanel({ chapters, activeIndex, onSelect }: Props) {
  const { lastReadChapterIndex } = useReading();
  return (
    <ul
      role="listbox"
      aria-label="Chapters"
      className="flex flex-1 list-none flex-col gap-1 overflow-y-auto p-2 [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[3px]"
    >
      {chapters.map((title, i) => {
        const active = i === activeIndex;
        const raw = title || `Chapter ${i + 1}`;
        // The leading "01" already conveys the number — drop a "Chapter N:" prefix.
        const label = stripChapterPrefix(raw);
        return (
          <li key={i} role="option" aria-selected={active}>
            <button
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-overlay-soft ${active ? 'bg-overlay-medium' : ''}`}
              onClick={() => onSelect(i)}
            >
              {/* Mirror the main pill: mono number · divider line · sans title */}
              <span className={`min-w-[16px] shrink-0 font-mono text-[12px] tabular-nums ${active ? 'text-text' : 'text-secondary'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="h-3.5 w-px shrink-0 bg-border-strong" aria-hidden="true" />
              <span className={`min-w-0 flex-1 truncate font-sans text-[13px] ${active ? 'font-medium text-text' : 'text-secondary'}`}>
                {label}
              </span>
              {lastReadChapterIndex !== null && i === lastReadChapterIndex && (
                <span
                  className="ml-auto shrink-0 font-mono text-[14px] leading-none text-secondary/50"
                  aria-label="Last read"
                  title="You left off here"
                >
                  ·
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
