import styles from '@/styles/components/ChapterBreak.module.css';

interface Props {
  chapterNumber: number;
}

export function ChapterBreak({ chapterNumber }: Props) {
  return (
    <div className={styles.break} aria-hidden="true">
      <hr className={styles.rule} />
      <p className={styles.chapterEndLabel}>End of Chapter {chapterNumber}</p>
    </div>
  );
}
