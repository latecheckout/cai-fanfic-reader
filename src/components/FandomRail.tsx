import Link from 'next/link';
import Image from 'next/image';
import { FandomTile } from '@/lib/shelves';
import styles from '@/styles/components/FandomRail.module.css';

interface Props {
  tiles: FandomTile[];
}

/**
 * Fandom rail: the IP layer of the browse-first home (Spotify treats genre
 * this way; here the genre is the fandom). Each card is a full-bleed fandom
 * mood image, same shape as the shelf cards, routing to ?fandom=.
 */
export function FandomRail({ tiles }: Props) {
  if (tiles.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Browse by fandom">
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          {/* The title itself routes to the full fandom index. */}
          <h2 className={styles.title}>
            <Link href="/fandoms" className={styles.titleLink}>Browse by fandom</Link>
          </h2>
          <p className={styles.subtitle}>Start from a universe you already love</p>
        </div>
      </div>

      <div className={styles.row}>
        {tiles.map((tile) => (
          <article key={tile.name} className={styles.card}>
            {/* Visual variant: full-bleed fandom art, one tag pill underneath */}
            <div className={styles.visual}>
              <Link href={tile.href} className={styles.coverLink} title={tile.name}>
                <span className={styles.coverWrap}>
                  {tile.image && (
                    <Image src={tile.image} alt={tile.label} fill sizes="(max-width: 768px) 124px, 150px" className={styles.coverImg} />
                  )}
                </span>
              </Link>
              {tile.topTags.length > 0 && (
                <Link
                  href={`/?tag=${encodeURIComponent(tile.topTags[0])}`}
                  className={styles.tagPill}
                >
                  {tile.topTags[0]}
                </Link>
              )}
            </div>

            {/* Text variant: label plus the fandom's top tag pill */}
            <div className={styles.textCard}>
              <span className={styles.tcKicker}>Fandom</span>
              <Link href={tile.href} className={styles.tcLabel}>{tile.label}</Link>

              {tile.topTags.length > 0 && (
                <span className={styles.tcTags}>
                  <Link
                    href={`/?tag=${encodeURIComponent(tile.topTags[0])}`}
                    className={styles.tcTag}
                  >
                    {tile.topTags[0]}
                  </Link>
                </span>
              )}

              <Link href={tile.href} className={styles.tcCount}>
                {tile.count} {tile.count === 1 ? 'work' : 'works'}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
