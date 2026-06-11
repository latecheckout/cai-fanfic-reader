'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WorkSummary } from '@/types';
import { SignalStrip } from './WorkCardCover';
import { formatCount, formatWords, formatChapters, ratingClass, categoryLabel } from '@/lib/utils';
import styles from '@/styles/components/ShelfRail.module.css';

interface Props {
  work: WorkSummary;
}

const isWipStatus = (status: string) => {
  const s = status.toLowerCase();
  return s.includes('progress') || s === 'wip' || s === 'in-progress';
};

/** @DUMMY — shared placeholder until real author photos exist. */
const CREATOR_PLACEHOLDER = '/creators/placeholder.png';

const COLLAPSED_TAGS = 6;

/**
 * AO3-style blurb shown in place of the cover when the site is in text
 * (AO4) mode. Hierarchy mirrors the list card: signal strip, title +
 * author (with a circular avatar — circles mean humans), summary,
 * warnings + tags with a pill expander, stats, then the bottom discovery
 * group (fandom, ships, characters). The card is a fixed 2:3 box; when
 * the tags are expanded it scrolls as one piece (scrollbar hidden), so
 * expanding never resizes the card or the rail. Collapsed cards are not
 * scroll containers, so they cannot trap rail or page scroll gestures.
 */
export function ShelfTextCard({ work }: Props) {
  const { meta, slug } = work;
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const wip = isWipStatus(meta.status);
  const catLabel = categoryLabel(meta.category);
  const warnings = meta.warnings.filter((w) => w !== 'No Archive Warnings Apply');
  const visibleTags = tagsExpanded ? meta.tags : meta.tags.slice(0, COLLAPSED_TAGS);
  const hiddenCount = meta.tags.length - COLLAPSED_TAGS;

  /* Each stat is one atomic segment so the line can only wrap between
     whole stats, never between a glyph and its count. Zero counts hide. */
  const stats = [
    formatWords(meta.words),
    formatChapters(meta.chaptersPosted, meta.chapters),
    (meta.updated || meta.published) && `updated ${meta.updated || meta.published}`,
    meta.kudos > 0 && `♥ ${formatCount(meta.kudos)}`,
    meta.bookmarks > 0 && `⚑ ${formatCount(meta.bookmarks)}`,
    meta.hits > 0 && `${formatCount(meta.hits)} hits`,
  ].filter((s): s is string => Boolean(s));

  return (
    <div className={`${styles.textCard} ${tagsExpanded ? styles.textCardOpen : ''}`}>
      <SignalStrip
        rating={meta.rating}
        rClass={ratingClass(meta.rating)}
        catLabel={catLabel}
        category={meta.category}
        isWip={wip}
      />

      <Link href={`/works/${slug}`} className={styles.tcTitle}>{meta.title}</Link>
      {meta.author && (
        <span className={styles.tcByline}>
          <span className={styles.tcBy}>by</span>
          <span className={styles.tcAvatar} aria-hidden="true">
            <Image src={CREATOR_PLACEHOLDER} alt="" fill sizes="20px" className={styles.tcAvatarImg} />
          </span>
          <Link href={`/?q=${encodeURIComponent(meta.author)}`} className={styles.tcAuthor}>
            {meta.author}
          </Link>
        </span>
      )}

      {meta.summary && <span className={styles.tcSummary}>{meta.summary}</span>}

      {(warnings.length > 0 || meta.tags.length > 0) && (
        <span className={styles.tcTags}>
          {warnings.map((w) => (
            <Link key={`warn-${w}`} href={`/?warning=${encodeURIComponent(w)}`} className={styles.tcWarn}>
              {w}
            </Link>
          ))}
          {visibleTags.map((t) => (
            <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className={styles.tcTag}>
              {t}
            </Link>
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              className={styles.tcTagsMore}
              onClick={() => setTagsExpanded((v) => !v)}
            >
              {tagsExpanded ? 'show less' : `+${hiddenCount}`}
            </button>
          )}
        </span>
      )}

      <span className={styles.tcStats}>
        {stats.map((s, si) => (
          <span key={s} className={styles.tcStatItem}>
            {s}
            {si < stats.length - 1 && ' · '}
          </span>
        ))}
      </span>

      <span className={styles.tcBottom}>
        {meta.fandom.length > 0 && (
          <span className={styles.tcFandom}>
            {meta.fandom.map((f, fi) => (
              <span key={f}>
                {fi > 0 && ', '}
                <Link href={`/?fandom=${encodeURIComponent(f)}`} className={styles.tcFandomLink}>
                  {f}
                </Link>
              </span>
            ))}
          </span>
        )}

        {meta.relationships.length > 0 && (
          <span className={styles.tcShips}>
            {meta.relationships.slice(0, 2).map((r, ri) => (
              <span key={r}>
                {ri > 0 && <span className={styles.tcShipSep}> / </span>}
                <Link href={`/?relationship=${encodeURIComponent(r)}`} className={styles.tcShipLink}>
                  {r}
                </Link>
              </span>
            ))}
          </span>
        )}

        {meta.characters.length > 0 && (
          <span className={styles.tcCharacters}>
            {meta.characters.slice(0, 4).map((c, ci) => (
              <span key={`char-${ci}`}>
                {ci > 0 && ', '}
                <Link href={`/?character=${encodeURIComponent(c)}`} className={styles.tcCharLink}>
                  {c}
                </Link>
              </span>
            ))}
          </span>
        )}
      </span>
    </div>
  );
}
