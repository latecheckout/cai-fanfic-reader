import { getWorkSummaries } from '@/lib/works';
import { buildSearchOptions } from '@/lib/filters';
import { BrowseHeader } from '@/components/BrowseHeader';
import styles from './fandoms.module.css';

export const metadata = {
  title: 'Fandoms — Archive of Our Stories',
};

export default function FandomsPage() {
  const works = getWorkSummaries();
  const searchOptions = buildSearchOptions(works);

  // Build fandom → count map
  const fandomMap = new Map<string, number>();
  works.forEach((work) => {
    work.meta.fandom.forEach((f) => {
      fandomMap.set(f, (fandomMap.get(f) ?? 0) + 1);
    });
  });

  // Sort alphabetically
  const fandoms = Array.from(fandomMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div>
      <BrowseHeader />
      <main className={styles.main}>
        <div className={styles.titleRow}>
          <h2 className={styles.heading}>Fandoms</h2>
          <span className={styles.count}>{fandoms.length} fandoms</span>
        </div>

        {fandoms.length === 0 ? (
          <p className={styles.empty}>No fandoms found.</p>
        ) : (
          <ul className={styles.list}>
            {fandoms.map(([fandom, count]) => (
              <li key={fandom} className={styles.item}>
                <a
                  href={`/?fandom=${encodeURIComponent(fandom)}`}
                  className={styles.fandomLink}
                >
                  <span className={styles.fandomName}>{fandom}</span>
                  <span className={styles.fandomCount}>
                    {count} {count === 1 ? 'work' : 'works'}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
