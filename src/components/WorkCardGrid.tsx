import Link from 'next/link';
import Image from 'next/image';
import { WorkSummary } from '@/types';
import { formatCount, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import { SignalStrip, Views, Avatar, Stat } from './WorkCardCover';
import styles from '@/styles/components/WorkCardGrid.module.css';

interface Props {
  work: WorkSummary;
  /** Eager-load the cover — pass true for the first above-the-fold cards. */
  priority?: boolean;
}

/** Cover sizes for the 4-up desktop grid (3-up tablet, 2-up phone). */
const COVER_SIZES = '(max-width: 460px) 50vw, (max-width: 768px) 33vw, 25vw';

const MAX_TAGS = 3;

/**
 * Grid card — the cover fills the whole card as a background, with all
 * metadata overlaid in the bottom-left over a scrim. Stateless: tags are
 * capped (no expander), so there's no client state here. Typography and
 * spacing mirror the list card; only the colours go light for the overlay.
 */
export function WorkCardGrid({ work, priority = false }: Props) {
  const { meta, slug } = work;
  const isWip = isWipStatus(meta.status);
  const catLabel = categoryLabel(meta.category);
  const rClass = ratingClass(meta.rating);
  const tags = meta.tags.slice(0, MAX_TAGS);

  return (
    <article className={styles.card}>
      {/* Clipping (rounded corners + hover zoom) lives on this inner wrapper so
          the card itself can stay overflow-visible — otherwise it clips the
          badge tooltips. */}
      <div className={styles.media}>
        {meta.cover && (
          <Image
            src={meta.cover}
            alt=""
            fill
            sizes={COVER_SIZES}
            priority={priority}
            className={styles.image}
          />
        )}
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      {/* Whole-card link sits above the scrim; the metadata cluster is
          pointer-events:none so clicks pass through, except the tag links.
          The link is named by aria-label, so the visible title is aria-hidden
          to avoid announcing the work twice (and the cover alt is empty). */}
      <Link href={`/works/${slug}`} className={styles.cardLink} aria-label={meta.title} />

      <div className={styles.content}>
        <SignalStrip
          rating={meta.rating}
          rClass={rClass}
          catLabel={catLabel}
          category={meta.category}
          isWip={isWip}
          onImage
        />

        <span className={styles.title} aria-hidden="true">{meta.title}</span>

        {meta.author && (
          <span className={styles.byline}>
            <span className={styles.by} aria-hidden="true">by</span>
            <Avatar />
            <Link href={`/?q=${encodeURIComponent(meta.author)}`} className={styles.authorLink}>
              <span className="visually-hidden">Author: </span>{meta.author}
            </Link>
          </span>
        )}

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((t) => (
              <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className={styles.tag}>
                <span className="visually-hidden">Tag: </span>{t}
              </Link>
            ))}
          </div>
        )}

        {(meta.hits > 0 || meta.kudos > 0) && (
          <div className={styles.metrics}>
            {meta.hits > 0 && <Views hits={meta.hits} />}
            {meta.hits > 0 && meta.kudos > 0 && ' · '}
            {meta.kudos > 0 && <Stat glyph="♥" label="kudos" value={formatCount(meta.kudos)} />}
          </div>
        )}
      </div>
    </article>
  );
}
