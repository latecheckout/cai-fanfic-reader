import { WorkSummary } from '@/types';
import { WorkCardCover } from './WorkCardCover';
import { WorkCardGrid } from './WorkCardGrid';
import styles from '@/styles/components/EndOfStory.module.css';

interface Props {
  slug: string;
  recommendations: WorkSummary[];
}

export function EndOfStory({ recommendations }: Props) {
  return (
    <div className={styles.root}>
      {/* Recommendations — respect the site-wide mode (html[data-mode]): visual
          shows the image grid card, text shows the list card. Both are rendered
          and CSS picks one, so this stays a server component. */}
      {recommendations.length > 0 && (
        <div className={styles.recommendations}>
          {recommendations.map((work) => (
            <div key={work.slug} className={styles.recItem}>
              <div className={styles.slot}>
                <WorkCardGrid work={work} />
              </div>
              <div className={styles.slotText}>
                <WorkCardCover work={work} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom padding */}
      <div className={styles.bottomPad} />
    </div>
  );
}
