'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReading } from '@/context/ReadingContext';
import { TagChip } from './TagChip';
import { SignalStrip, Avatar } from './WorkCardCover';
import { formatWords, formatCount, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import styles from '@/styles/components/MetadataOverlay.module.css';

interface Props {
  onClose: () => void;
}

export const MetadataOverlay = React.forwardRef<HTMLDivElement, Props>(
  function MetadataOverlay({ onClose }, ref) {
    const { workMeta, totalChapters } = useReading();

    const rClass = ratingClass(workMeta.rating);
    const catLabel = categoryLabel(workMeta.category);
    const isWip = isWipStatus(workMeta.status);
    const seriesStr = workMeta.series
      ? `Part ${workMeta.series.position} of ${workMeta.series.name}`
      : null;

    // Same stats line as the work header (status lives in the badge strip now).
    const statsLine = [
      formatWords(workMeta.words),
      readingTime(workMeta.words),
      totalChapters > 1 ? formatChapters(workMeta.chaptersPosted, workMeta.chapters) : null,
      seriesStr,
      workMeta.language !== 'English' ? workMeta.language : null,
      workMeta.kudos > 0 ? `♥ ${formatCount(workMeta.kudos)}` : null,
      workMeta.bookmarks > 0 ? `⚑ ${formatCount(workMeta.bookmarks)}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    return (
      <div
        ref={ref}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Work details"
      >
        <div className={styles.panelContent}>
          {/* Header band — consistent with other panels */}
          <div className={styles.header}>
            <span className={styles.headerLabel}>Story info</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Scrollable body — same hierarchy as the work header, in modal form:
              thumbnail → badges → title → author (avatar) → stats → summary → tags */}
          <div className={styles.body}>
            {workMeta.cover && (
              <div className={styles.cover}>
                <Image src={workMeta.cover} alt="" fill sizes="120px" className={styles.coverImg} />
              </div>
            )}

            {/* Zone 1: Identity */}
            <div className={styles.zone1}>
              <div className={styles.badgeRow}>
                <SignalStrip
                  rating={workMeta.rating}
                  rClass={rClass}
                  catLabel={catLabel}
                  category={workMeta.category}
                  isWip={isWip}
                />
              </div>
              <h2 className={styles.title}>{workMeta.title}</h2>
              <p className={styles.byline}>
                <span className={styles.bylineBy}>by</span>
                <Avatar />
                <Link href={`/?q=${encodeURIComponent(workMeta.author)}`} className={styles.bylineAuthor}>
                  {workMeta.author}
                </Link>
              </p>
              <p className={styles.stats}>{statsLine}</p>
            </div>

            {/* Zone 2: Summary — sits right under identity, above the tag taxonomy */}
            {workMeta.summary && (
              <div className={styles.zone3}>
                <p className={styles.summaryText}>{workMeta.summary}</p>
              </div>
            )}

            {/* Zone 3: Signals */}
            <div className={styles.zone2}>
              {workMeta.warnings.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Warnings</span>
                  <div className={styles.tagGroup}>
                    {workMeta.warnings.map((w) => (
                      <TagChip key={w} tag={w} category="warning" clickable href={`/?warning=${encodeURIComponent(w)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.fandom.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Fandom</span>
                  <div className={styles.tagGroup}>
                    {workMeta.fandom.map((f) => (
                      <TagChip key={f} tag={f} category="fandom" clickable href={`/?fandom=${encodeURIComponent(f)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.relationships.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Ships</span>
                  <div className={styles.tagGroup}>
                    {workMeta.relationships.map((r) => (
                      <TagChip key={r} tag={r} category="relationship" clickable href={`/?relationship=${encodeURIComponent(r)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.characters.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Characters</span>
                  <div className={styles.tagGroup}>
                    {workMeta.characters.map((c) => (
                      <TagChip key={c} tag={c} category="character" clickable href={`/?character=${encodeURIComponent(c)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.tags.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel}>Tags</span>
                  <div className={styles.tagGroup}>
                    {workMeta.tags.map((t) => (
                      <TagChip key={t} tag={t} category="additional" clickable href={`/?tag=${encodeURIComponent(t)}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MetadataOverlay.displayName = 'MetadataOverlay';
