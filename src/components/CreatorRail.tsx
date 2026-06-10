import Link from 'next/link';
import Image from 'next/image';
import { Creator } from '@/lib/shelves';
import { formatCount } from '@/lib/utils';
import styles from '@/styles/components/CreatorRail.module.css';

interface Props {
  creators: Creator[];
}

/**
 * @DUMMY — all creators share one generated placeholder portrait until real
 * profile photos exist. In production the whole card is the creator's face.
 */
const CREATOR_PLACEHOLDER = '/creators/placeholder.png';

/**
 * Trending creators: cards of humans (per Devon, design review June 2026 --
 * "make the humans shine"). Same 2:3 thumbnail footprint as the story
 * shelves; each card links to a search for the author.
 */
export function CreatorRail({ creators }: Props) {
  if (creators.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Trending creators">
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>Trending creators</h2>
          <p className={styles.subtitle}>The humans behind the stories</p>
        </div>
      </div>

      <div className={styles.row}>
        {creators.map((c) => (
          <Link key={c.name} href={c.href} className={styles.card} title={c.name}>
            <span className={styles.coverWrap}>
              <Image
                src={CREATOR_PLACEHOLDER}
                alt=""
                fill
                sizes="(max-width: 768px) 124px, 150px"
                className={styles.coverImg}
              />
            </span>
            <span className={styles.name}>{c.name}</span>
            <span className={styles.meta}>
              {c.workCount} {c.workCount === 1 ? 'work' : 'works'} · ♥ {formatCount(c.kudos)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
