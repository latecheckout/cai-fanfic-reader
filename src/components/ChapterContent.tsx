import { Chapter } from '@/types';
import styles from '@/styles/components/ChapterContent.module.css';

interface Props {
  chapter: Chapter;
  chapterHtml: string;
  totalChapters: number;
}

export function ChapterContent({ chapter, chapterHtml, totalChapters }: Props) {
  return (
    <div className={styles.container}>
      {/* Chapter title */}
      {totalChapters > 1 && (
        <header className={styles.chapterHeader}>
          <p className={styles.chapterNumber}>Chapter {chapter.index + 1}</p>
          <h2 className={styles.chapterTitle}>{chapter.title}</h2>
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
