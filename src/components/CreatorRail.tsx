import Link from 'next/link';
import { Creator } from '@/lib/shelves';
import { formatCount } from '@/lib/utils';
import styles from '@/styles/components/CreatorRail.module.css';

interface Props {
  creators: Creator[];
}

/** Two-letter initials for the avatar circle. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Trending creators: cards of humans (per Devon, design review June 2026 --
 * "make the humans shine"). Each card links to a search for the author.
 * Avatars are initials placeholders until real profiles exist.
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
            <span className={styles.avatar} aria-hidden="true">{initials(c.name)}</span>
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
