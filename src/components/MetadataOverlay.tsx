'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReading } from '@/context/ReadingContext';
import { TagChip } from './TagChip';
import { SignalStrip, Avatar, Stat } from './WorkCardCover';
import { formatWords, formatCount, formatChapters, readingTime, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import styles from '@/styles/components/MetadataOverlay.module.css';

interface Props {
  onClose: () => void;
}

export const MetadataOverlay = React.forwardRef<HTMLDivElement, Props>(
  function MetadataOverlay({ onClose }, ref) {
    const { workMeta, totalChapters } = useReading();
    const [summaryExpanded, setSummaryExpanded] = useState(false);

    // Description "see more" — first 4 sentences, expandable (same as the header).
    const sentences = workMeta.summary.match(/[^.!?]+[.!?]+/g) ?? (workMeta.summary ? [workMeta.summary] : []);
    const summaryHasMore = sentences.length > 4;
    const shownSummary =
      summaryHasMore && !summaryExpanded ? sentences.slice(0, 4).join('').trim() : workMeta.summary;

    const rClass = ratingClass(workMeta.rating);
    const catLabel = categoryLabel(workMeta.category);
    const isWip = isWipStatus(workMeta.status);
    const seriesStr = workMeta.series
      ? `Part ${workMeta.series.position} of ${workMeta.series.name}`
      : null;

    // Same stats line as the work header (status lives in the badge strip now).
    // Glyph stats use <Stat> so screen readers hear "kudos 1,200", not "heart".
    const statNodes: React.ReactNode[] = [
      formatWords(workMeta.words),
      readingTime(workMeta.words),
      totalChapters > 1 ? formatChapters(workMeta.chaptersPosted, workMeta.chapters) : null,
      seriesStr,
      workMeta.language !== 'English' ? workMeta.language : null,
      workMeta.kudos > 0 ? <Stat key="kudos" glyph="♥" label="kudos" value={formatCount(workMeta.kudos)} /> : null,
      workMeta.bookmarks > 0 ? <Stat key="bookmarks" glyph="⚑" label="bookmarks" value={formatCount(workMeta.bookmarks)} /> : null,
    ].filter(Boolean);

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
              {/* Description with see-more, then social metrics under it — same as header */}
              {workMeta.summary && (
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
              <p className={styles.stats}>
                {statNodes.map((node, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ' · '}
                    {node}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Signals */}
            <div className={styles.zone2}>
              {workMeta.warnings.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel} id="mo-warnings" aria-hidden="true">Warnings</span>
                  <div className={styles.tagGroup} role="group" aria-labelledby="mo-warnings">
                    {workMeta.warnings.map((w) => (
                      <TagChip key={w} tag={w} category="warning" clickable href={`/?warning=${encodeURIComponent(w)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.fandom.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel} id="mo-fandom" aria-hidden="true">Fandom</span>
                  <div className={styles.tagGroup} role="group" aria-labelledby="mo-fandom">
                    {workMeta.fandom.map((f) => (
                      <TagChip key={f} tag={f} category="fandom" clickable href={`/?fandom=${encodeURIComponent(f)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.relationships.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel} id="mo-ships" aria-hidden="true">Ships</span>
                  <div className={styles.tagGroup} role="group" aria-labelledby="mo-ships">
                    {workMeta.relationships.map((r) => (
                      <TagChip key={r} tag={r} category="relationship" clickable href={`/?relationship=${encodeURIComponent(r)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.characters.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel} id="mo-characters" aria-hidden="true">Characters</span>
                  <div className={styles.tagGroup} role="group" aria-labelledby="mo-characters">
                    {workMeta.characters.map((c) => (
                      <TagChip key={c} tag={c} category="character" clickable href={`/?character=${encodeURIComponent(c)}`} />
                    ))}
                  </div>
                </div>
              )}
              {workMeta.tags.length > 0 && (
                <div className={styles.tagRow}>
                  <span className={styles.tagLabel} id="mo-tags" aria-hidden="true">Tags</span>
                  <div className={styles.tagGroup} role="group" aria-labelledby="mo-tags">
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
