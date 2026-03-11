import styles from '@/styles/components/ChapterBreak.module.css';

interface Props {
  chapterNumber: number;
}

export function ChapterBreak({ chapterNumber }: Props) {
  return (
    <div className={styles.break} aria-hidden="true" />
  );
}
