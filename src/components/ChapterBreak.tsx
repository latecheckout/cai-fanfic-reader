import styles from '@/styles/components/ChapterBreak.module.css';

export function ChapterBreak() {
  return (
    <div className={styles.break} aria-hidden="true">
      <hr className={styles.rule} />
    </div>
  );
}
