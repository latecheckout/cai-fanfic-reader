import Link from 'next/link';
import Image from 'next/image';
import { FandomTile } from '@/lib/shelves';
import styles from '@/styles/components/FandomRail.module.css';

interface Props {
  tiles: FandomTile[];
}

/**
 * Fandom tile row: the IP layer of the browse-first home (Spotify treats
 * genre this way; here the genre is the fandom). Each tile is a stack of
 * that fandom's top covers and routes to the plain ?fandom= filter URL.
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
          <Link
            key={tile.name}
            href={tile.href}
            className={styles.tile}
            title={tile.name}
          >
            <span className={styles.stack}>
              {tile.covers.map((cover, i) => (
                <span
                  key={`${tile.name}-${i}`}
                  className={styles.stackCover}
                  style={{ left: `${i * 34}px`, zIndex: tile.covers.length - i }}
                >
                  {cover && (
                    <Image src={cover} alt="" fill sizes="58px" className={styles.stackImg} />
                  )}
                </span>
              ))}
            </span>
            <span className={styles.label}>{tile.label}</span>
            <span className={styles.count}>
              {tile.count} {tile.count === 1 ? 'work' : 'works'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
