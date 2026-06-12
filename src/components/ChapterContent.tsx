import Link from 'next/link';
import { Chapter } from '@/types';
import { Avatar } from './WorkCardCover';
import styles from '@/styles/components/ChapterContent.module.css';

interface Props {
  chapter: Chapter;
  chapterHtml: string;
  totalChapters: number;
  /** Work author — shown as a byline under each chapter title. */
  author?: string;
}

export function ChapterContent({ chapter, chapterHtml, totalChapters, author }: Props) {
  return (
    <div className={styles.container}>
      {/* Chapter title + author byline */}
      {totalChapters > 1 && (
        <header className={styles.chapterHeader}>
          <p className={styles.chapterNumber}>Chapter {chapter.index + 1}</p>
          <h2 className={styles.chapterTitle}>{chapter.title}</h2>
          {author && (
            <p className={styles.chapterByline}>
              <span className={styles.bylineBy}>by</span>
              <Avatar />
              <Link href={`/?q=${encodeURIComponent(author)}`} className={styles.bylineAuthor}>
                {author}
              </Link>
            </p>
          )}
        </header>
      )}

      {/* Author's beginning notes */}
      {chapter.notesBegin && (
        <aside className={styles.authorNote}>
          <p className={styles.noteLabel}>Author&rsquo;s note</p>
          <p className={styles.noteText}>{chapter.notesBegin}</p>
        </aside>
      )}

      {/* Chapter summary */}
      {chapter.summary && (
        <aside className={styles.chapterSummary}>
          <p className={styles.noteLabel}>Summary</p>
          <p className={styles.noteText}>{chapter.summary}</p>
        </aside>
      )}

      {/* Story text */}
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: chapterHtml }}
      />

      {/* Author's ending notes */}
      {chapter.notesEnd && (
        <aside className={`${styles.authorNote} ${styles.authorNoteEnd}`}>
          <p className={styles.noteLabel}>Author&rsquo;s note</p>
          <p className={styles.noteText}>{chapter.notesEnd}</p>
        </aside>
      )}
    </div>
  );
}
