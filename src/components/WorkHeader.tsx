'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WorkMeta } from '@/types';
import { formatWords, formatCount, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import { TagChip } from './TagChip';
import { SignalStrip, Avatar } from './WorkCardCover';
import styles from '@/styles/components/WorkHeader.module.css';

interface Props {
  meta: WorkMeta;
  slug: string;
  totalChapters: number;
}

export function WorkHeader({ meta, slug: _slug, totalChapters }: Props) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const chaptersStr = formatChapters(meta.chaptersPosted, meta.chapters);
  const seriesStr = meta.series
    ? `Part ${meta.series.position} of ${meta.series.name}`
    : null;

  const isWip = isWipStatus(meta.status);
  const rClass = ratingClass(meta.rating);
  const catLabel = categoryLabel(meta.category);

  const statsLine = [
    formatWords(meta.words),
    readingTime(meta.words),
    totalChapters > 1 ? chaptersStr : null,
    seriesStr,
    meta.language !== 'English' ? meta.language : null,
    meta.kudos > 0 ? `\u2665 ${formatCount(meta.kudos)}` : null,
    meta.bookmarks > 0 ? `\u2691 ${formatCount(meta.bookmarks)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // Description: show first 4 sentences, expandable via "see more"
  const sentences = meta.summary.match(/[^.!?]+[.!?]+/g) ?? (meta.summary ? [meta.summary] : []);
  const summaryHasMore = sentences.length > 4;
  const shownSummary =
    summaryHasMore && !summaryExpanded ? sentences.slice(0, 4).join('').trim() : meta.summary;

  return (
    <header className={styles.header} aria-label="Work information">
      {/* Top block — identity-first, mirroring the list card hierarchy:
          thumbnail → badges → title → author (with avatar) → summary → stats */}
      <div className={styles.headerRow}>
        {meta.cover && (
          <div className={styles.cover}>
            <Image src={meta.cover} alt="" fill sizes="180px" className={styles.coverImg} />
          </div>
        )}
        <div className={styles.headerMain}>
          {/* Badges above the h1 — same strip as the home/list cards */}
          <div className={styles.badgeRow}>
            <SignalStrip
              rating={meta.rating}
              rClass={rClass}
              catLabel={catLabel}
              category={meta.category}
              isWip={isWip}
            />
          </div>
          <h1 className={styles.title}>{meta.title}</h1>
          <p className={styles.byline}>
            <span className={styles.bylineBy}>by</span>
            <Avatar />
            <Link href={`/?q=${encodeURIComponent(meta.author)}`} className={styles.authorLink}>
              {meta.author}
            </Link>
          </p>
          {meta.summary && (
            <p className={styles.summaryText}>
              {shownSummary}
              {summaryHasMore && (
                <button
                  type="button"
                  className={styles.seeMore}
                  onClick={() => setSummaryExpanded((v) => !v)}
                >
                  {summaryExpanded ? 'see less' : '… see more'}
                </button>
              )}
            </p>
          )}
          <p className={styles.stats}>{statsLine}</p>
        </div>
      </div>

      {/* Signals — full width below the cover + content */}
      <div className={styles.zone2}>
        {meta.warnings.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Warnings</span>
            <div className={styles.tagGroup}>
              {meta.warnings.map((w) => (
                <TagChip key={w} tag={w} category="warning" clickable href={`/?warning=${encodeURIComponent(w)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.fandom.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Fandom</span>
            <div className={styles.tagGroup}>
              {meta.fandom.map((f) => (
                <TagChip key={f} tag={f} category="fandom" clickable href={`/?fandom=${encodeURIComponent(f)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.relationships.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Ships</span>
            <div className={styles.tagGroup}>
              {meta.relationships.map((r) => (
                <TagChip key={r} tag={r} category="relationship" clickable href={`/?relationship=${encodeURIComponent(r)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.characters.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Characters</span>
            <div className={styles.tagGroup}>
              {meta.characters.map((c) => (
                <TagChip key={c} tag={c} category="character" clickable href={`/?character=${encodeURIComponent(c)}`} />
              ))}
            </div>
          </div>
        )}
        {meta.tags.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Tags</span>
            <div className={styles.tagGroup}>
              {meta.tags.map((t) => (
                <TagChip key={t} tag={t} category="additional" clickable href={`/?tag=${encodeURIComponent(t)}`} />
              ))}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
