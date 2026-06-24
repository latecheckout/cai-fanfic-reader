import Link from 'next/link';
import { Chapter } from '@/types';
import { Avatar } from './WorkCardCover';

interface Props {
  chapter: Chapter;
  chapterHtml: string;
  totalChapters: number;
  /** Work author — shown as a byline under each chapter title. */
  author?: string;
  /** Work title — shown (truncated) before the author in the byline. */
  workTitle?: string;
}

const NOTE_LABEL = 'mb-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-secondary';
const NOTE_TEXT = 'font-sans text-[13px] leading-[1.6] text-secondary';
const AUTHOR_NOTE = 'border-l-2 border-border-strong px-5 py-4';

export function ChapterContent({ chapter, chapterHtml, totalChapters, author, workTitle }: Props) {
  return (
    <div className="max-w-[var(--reader-max-width)]">
      {/* Chapter title + author byline */}
      {totalChapters > 1 && (
        <header className="mb-16 text-center">
          <p className="mb-2 text-center font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-secondary">
            Chapter {chapter.index + 1}
          </p>
          <h2 className="text-center font-sans text-[22px] font-medium leading-[1.2] tracking-[-0.01em] text-text">
            {chapter.title}
          </h2>
          {author && (
            <p className="mt-3 flex flex-nowrap items-center justify-center font-serif text-[14px] text-secondary opacity-[0.65] max-md:flex-col max-md:gap-1">
              {workTitle && (
                <>
                  <span className="min-w-0 max-w-[24ch] overflow-hidden text-ellipsis whitespace-nowrap font-medium text-text max-md:max-w-full">
                    {workTitle}
                  </span>
                  <span className="mx-2 shrink-0 text-secondary opacity-[0.45] max-md:hidden" aria-hidden="true">|</span>
                </>
              )}
              <span className="inline-flex shrink-0 items-center">
                <span className="mr-1.5 shrink-0">by</span>
                <Avatar />
                <Link
                  href={`/?q=${encodeURIComponent(author)}`}
                  className="shrink-0 text-inherit hover:text-text hover:underline hover:underline-offset-2"
                >
                  {author}
                </Link>
              </span>
            </p>
          )}
        </header>
      )}

      {/* Author's beginning notes */}
      {chapter.notesBegin && (
        <aside className={`${AUTHOR_NOTE} mb-8`}>
          <p className={NOTE_LABEL}>Author&rsquo;s note</p>
          <p className={NOTE_TEXT}>{chapter.notesBegin}</p>
        </aside>
      )}

      {/* Chapter summary */}
      {chapter.summary && (
        <aside className="mb-8 rounded-[3px] border border-border-chip bg-transparent px-5 py-4">
          <p className={NOTE_LABEL}>Summary</p>
          <p className={NOTE_TEXT}>{chapter.summary}</p>
        </aside>
      )}

      {/* Story text — data-chapter-prose scopes the selection toolbar to story text */}
      <article data-chapter-prose className="prose" dangerouslySetInnerHTML={{ __html: chapterHtml }} />

      {/* Author's ending notes */}
      {chapter.notesEnd && (
        <aside className={`${AUTHOR_NOTE} mt-8`}>
          <p className={NOTE_LABEL}>Author&rsquo;s note</p>
          <p className={NOTE_TEXT}>{chapter.notesEnd}</p>
        </aside>
      )}
    </div>
  );
}
