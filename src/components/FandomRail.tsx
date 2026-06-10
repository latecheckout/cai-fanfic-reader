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
          <Link key={tile.name} href={tile.href} className={styles.card} title={tile.name}>
            {/* Visual variant: full-bleed fandom art */}
            <span className={styles.coverWrap}>
              {tile.image && (
                <Image src={tile.image} alt="" fill sizes="(max-width: 768px) 124px, 150px" className={styles.coverImg} />
              )}
            </span>
            <span className={styles.label}>{tile.label}</span>
            <span className={styles.count}>
              {tile.count} {tile.count === 1 ? 'work' : 'works'}
            </span>

            {/* Text variant: metadata tile in the same footprint */}
            <span className={styles.textCard}>
              <span className={styles.tcKicker}>Fandom</span>
              <span className={styles.tcLabel}>{tile.label}</span>
              <span className={styles.tcName}>{tile.name}</span>
              <span className={styles.tcCount}>
                {tile.count} {tile.count === 1 ? 'work' : 'works'}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
