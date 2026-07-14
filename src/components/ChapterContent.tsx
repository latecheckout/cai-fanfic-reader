import Link from 'next/link';
import { Chapter } from '@/types';
import { stripChapterPrefix } from '@/lib/utils';
import { Avatar } from './WorkCardCover';
import { ChapterCallout } from './ChapterCallout';
import { AuthorNote } from './AuthorNote';

interface Props {
  chapter: Chapter;
  chapterHtml: string;
  totalChapters: number;
  /** Work author — shown as a byline under each chapter title. */
  author?: string;
  /** Work title — shown (truncated) before the author in the byline. */
  workTitle?: string;
}

/** 1-based chapter number → roman numeral (I, II, … XLII). */
function toRoman(n: number): string {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [value, glyph] of table) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}

export function ChapterContent({ chapter, chapterHtml, totalChapters, author, workTitle }: Props) {
  return (
    <div className="max-w-[var(--reader-max-width)]">
      {/* Chapter opener — eyebrow work title, "01 | chapter name" heading, byline */}
      {totalChapters > 1 && (
        <header className="mb-16 pt-20 text-center">
          {workTitle && (
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-secondary">
              {workTitle}
            </p>
          )}
          <h1 className="mt-4 text-balance font-serif text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-text">
            <span className="mr-4 opacity-50">{toRoman(chapter.index + 1)}</span>
            {stripChapterPrefix(chapter.title)}
          </h1>
          {author && (
            <p className="mt-3 flex flex-nowrap items-center justify-center font-serif text-[14px] text-secondary opacity-[0.65]">
              <span className="mr-1.5 shrink-0">by</span>
              <Avatar />
              <Link
                href={`/?q=${encodeURIComponent(author)}`}
                className="shrink-0 text-inherit hover:text-text hover:underline hover:underline-offset-2"
              >
                {author}
              </Link>
            </p>
          )}
        </header>
      )}

      {/* Author's beginning notes — message bubble from the author */}
      {chapter.notesBegin && (
        <AuthorNote author={author} className="mb-8">
          {chapter.notesBegin}
        </AuthorNote>
      )}

      {/* Chapter summary — flat callout */}
      {chapter.summary && (
        <ChapterCallout label="Summary" className="mb-8">
          {chapter.summary}
        </ChapterCallout>
      )}

      {/* Story text — data-chapter-prose scopes the selection toolbar to story text */}
      <article data-chapter-prose className="prose" dangerouslySetInnerHTML={{ __html: chapterHtml }} />

      {/* Author's ending notes — message bubble from the author */}
      {chapter.notesEnd && (
        <AuthorNote author={author} className="mt-8">
          {chapter.notesEnd}
        </AuthorNote>
      )}
    </div>
  );
}
