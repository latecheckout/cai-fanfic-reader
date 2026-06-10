import { WorkSummary } from '@/types';
import { WorkCardCover } from './WorkCardCover';
import styles from '@/styles/components/EndOfStory.module.css';

interface Props {
  slug: string;
  recommendations: WorkSummary[];
}

export function EndOfStory({ recommendations }: Props) {
  return (
    <div className={styles.root}>
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className={styles.recommendations}>
          {recommendations.map((work) => (
            <WorkCardCover key={work.slug} work={work} view="list" />
          ))}
        </div>
      )}

      {/* Bottom padding */}
      <div className={styles.bottomPad} />
    </div>
  );
}
