import Link from 'next/link';
import { Chapter } from '@/types';
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

export function ChapterContent({ chapter, chapterHtml, totalChapters, author, workTitle }: Props) {
  return (
    <div className="max-w-[var(--reader-max-width)]">
      {/* Chapter title + author byline */}
      {totalChapters > 1 && (
        <header className="mb-16 text-center">
          {workTitle && (
            <h2 className="text-balance font-serif text-[22px] font-medium leading-[1.2] tracking-[-0.01em] text-text">
              {workTitle}
            </h2>
          )}
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
