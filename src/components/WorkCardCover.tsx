'use client';

import { useState, Fragment } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WorkSummary, LayoutView } from '@/types';
import { formatWords, formatCount, formatChapters, ratingClass, categoryLabel } from '@/lib/utils';
import styles from '@/styles/components/WorkCardCover.module.css';

interface Props {
  work: WorkSummary;
  /** Current layout — 'list' = detailed text card, 'grid' = cover-led card. */
  view: LayoutView;
  /** Eager-load the image — pass true for the first few above-the-fold cards. */
  priority?: boolean;
}

// Tag caps: list shows the full set, grid stays minimal.
const MAX_TAGS_LIST = 12;
const MAX_TAGS_GRID = 2;

const COVER_SIZES: Record<LayoutView, string> = {
  list: '(max-width: 768px) 100px, 96px',
  grid: '(max-width: 460px) 100vw, (max-width: 768px) 50vw, 33vw',
};

const RATING_LETTER: Record<string, string> = {
  G: 'G', T: 'T', M: 'M', E: 'E', 'Not Rated': 'NR', NR: 'NR',
};

const RATING_TOOLTIPS: Record<string, { title: string; desc: string }> = {
  'General Audiences':     { title: 'General Audiences',     desc: 'Suitable for all ages' },
  'Teen And Up Audiences': { title: 'Teen And Up Audiences', desc: 'Mild themes or language' },
  'Mature':                { title: 'Mature',                desc: 'Adult themes, violence, or strong language' },
  'Explicit':              { title: 'Explicit',              desc: 'Contains explicit sexual content' },
  'Not Rated':             { title: 'Not Rated',             desc: 'Rating not provided by the author' },
};

const CATEGORY_TOOLTIPS: Record<string, { title: string; desc: string }> = {
  'M/M':   { title: 'Male / Male',     desc: 'A relationship between two male characters' },
  'F/F':   { title: 'Female / Female', desc: 'A relationship between two female characters' },
  'F/M':   { title: 'Female / Male',   desc: 'A relationship between a female and male character' },
  'M/F':   { title: 'Male / Female',   desc: 'A relationship between a male and female character' },
  'Gen':   { title: 'General',         desc: 'No romantic or sexual relationships' },
  'Multi': { title: 'Multiple',        desc: 'Multiple pairings or relationship types' },
  'Other': { title: 'Other',           desc: 'An unconventional or unspecified relationship type' },
};

const isWipStatus = (status: string) => {
  const s = status.toLowerCase();
  return s.includes('progress') || s === 'wip' || s === 'in-progress';
};

const CheckGlyph = () => (
  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="1.5 4.5 3.5 6.5 7.5 2.5" />
  </svg>
);

/** Views/reads eye icon. */
function EyeIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className={styles.statIcon}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

function Views({ hits }: { hits: number }) {
  return (
    <span className={styles.statViews}>
      <EyeIcon />
      {formatCount(hits)}
    </span>
  );
}

/** Dot-separated stats line (supports JSX items like the views icon). */
function StatsLine({ items, className }: { items: ReactNode[]; className: string }) {
  return (
    <div className={className}>
      {items.map((node, i) => (
        <Fragment key={i}>
          {i > 0 && ' · '}
          {node}
        </Fragment>
      ))}
    </div>
  );
}

/** List signal row — rating · category · status, with single-line tooltips. */
function SignalStrip({
  rating, rClass, catLabel, category, isWip,
}: {
  rating: string;
  rClass: string;
  catLabel: string;
  category: string[];
  isWip: boolean;
}) {
  return (
    <div className={styles.strip}>
      <span
        className={`${styles.ratingLetter} ${styles[rClass as keyof typeof styles]}`}
        data-tooltip={RATING_TOOLTIPS[rating]?.title ?? rating}
      >
        {RATING_LETTER[rating] ?? rating.charAt(0)}
      </span>
      {catLabel && (
        <div className={styles.catLabel} data-tooltip={CATEGORY_TOOLTIPS[category[0]]?.title ?? catLabel}>
          {catLabel}
        </div>
      )}
      <div
        className={`${styles.statusPill} ${isWip ? styles.statusWip : styles.statusDone}`}
        data-tooltip={isWip ? 'Work in Progress' : 'Complete'}
      >
        {isWip ? 'WIP' : <CheckGlyph />}
      </div>
    </div>
  );
}

export function WorkCardCover({ work, view, priority = false }: Props) {
  const { meta, slug } = work;
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const isWip = isWipStatus(meta.status);
  const catLabel = categoryLabel(meta.category);
  const rClass = ratingClass(meta.rating);

  const handleFindSimilar = () => {
    const topTags = meta.tags.slice(0, 3).join(', ');
    document.dispatchEvent(new CustomEvent('fill-search', { detail: { value: topTags } }));
  };

  // ── grid: cover-led visual card. cover → strip → title → author → tags → reads·kudos ──
  if (view === 'grid') {
    const visibleTags = tagsExpanded ? meta.tags : meta.tags.slice(0, MAX_TAGS_GRID);
    const hiddenCount = meta.tags.length - MAX_TAGS_GRID;
    const metricNodes: ReactNode[] = [
      meta.hits > 0 ? <Views key="views" hits={meta.hits} /> : null,
      meta.kudos > 0 ? `♥ ${formatCount(meta.kudos)}` : null,
    ].filter(Boolean);

    return (
      <article className={`${styles.card} ${styles.grid}`}>
        <Link href={`/works/${slug}`} className={styles.coverLink} title={meta.title}>
          <div className={styles.coverWrap}>
            {meta.cover && (
              <Image
                src={meta.cover}
                alt={meta.title}
                fill
                sizes={COVER_SIZES.grid}
                priority={priority}
                className={styles.coverImg}
              />
            )}
          </div>
        </Link>

        <div className={styles.gridBody}>
          {/* Badges broken out above the title — rating + status only (no category) */}
          <SignalStrip rating={meta.rating} rClass={rClass} catLabel="" category={meta.category} isWip={isWip} />
          <div className={styles.gridTitleRow}>
            <Link href={`/works/${slug}`} className={styles.gridTitleLink}>
              <span className={styles.gridTitle}>{meta.title}</span>
            </Link>
            {meta.author && <span className={styles.author}>by {meta.author}</span>}
            {meta.tags.length > 0 && (
              <button
                type="button"
                className={styles.findSimilarBtn}
                onClick={handleFindSimilar}
                aria-label="Find similar works"
                title="Find similar works"
              >
                ≈ similar
              </button>
            )}
          </div>
          {meta.tags.length > 0 && (
            <div className={styles.tags}>
              {visibleTags.map((t) => (
                <a key={t} href={`/?tag=${encodeURIComponent(t)}`} className={styles.tagChip}>{t}</a>
              ))}
              {hiddenCount > 0 && (
                <button type="button" className={styles.tagsMore} onClick={() => setTagsExpanded(!tagsExpanded)}>
                  {tagsExpanded ? 'show less' : `+${hiddenCount}`}
                </button>
              )}
            </div>
          )}
          {metricNodes.length > 0 && <StatsLine items={metricNodes} className={styles.metrics} />}
        </div>
      </article>
    );
  }

  // ── list: detailed card. small cover + strip → title → author → summary → tags → fandom → ships → characters → stats ──
  const statNodes: ReactNode[] = [
    formatWords(meta.words),
    formatChapters(meta.chaptersPosted, meta.chapters),
    meta.updated || meta.published ? `updated ${meta.updated || meta.published}` : null,
    meta.kudos > 0 ? `♥ ${formatCount(meta.kudos)}` : null,
    meta.bookmarks > 0 ? `⚑ ${formatCount(meta.bookmarks)}` : null,
    meta.hits > 0 ? <Views key="views" hits={meta.hits} /> : null,
  ].filter(Boolean);
  const visibleTags = tagsExpanded ? meta.tags : meta.tags.slice(0, MAX_TAGS_LIST);
  const hiddenTagCount = meta.tags.length - MAX_TAGS_LIST;
  const warnings = meta.warnings.filter((w) => w !== 'No Archive Warnings Apply');

  return (
    <article className={`${styles.card} ${styles.list}`}>
      <div className={styles.coverWrap}>
        {meta.cover && (
          <Image src={meta.cover} alt="" fill sizes={COVER_SIZES.list} priority={priority} className={styles.coverImg} />
        )}
      </div>

      {/* Content — identity-first: strip → title → author → summary → tags → fandom → ships → characters → stats */}
      <div className={styles.content}>
        <SignalStrip rating={meta.rating} rClass={rClass} catLabel={catLabel} category={meta.category} isWip={isWip} />

        <div className={styles.titleRow}>
          <h3 className={styles.titleWrap}>
            <Link href={`/works/${slug}`} className={styles.titleLink}>
              <span className={styles.title}>{meta.title}</span>
            </Link>
          </h3>
          {meta.author && <span className={styles.author}>by {meta.author}</span>}
          {meta.tags.length > 0 && (
            <button
              type="button"
              className={styles.findSimilarBtn}
              onClick={handleFindSimilar}
              aria-label="Find similar works"
              title="Find similar works"
            >
              ≈ similar
            </button>
          )}
        </div>

        {meta.summary && <p className={styles.summary}>{meta.summary}</p>}

        {(warnings.length > 0 || meta.tags.length > 0) && (
          <div className={`${styles.tags} ${styles.interactive}`}>
            {warnings.map((w) => (
              <Link key={`warn-${w}`} href={`/?warning=${encodeURIComponent(w)}`} className={styles.warnChip}>{w}</Link>
            ))}
            {visibleTags.map((t) => (
              <Link key={`tag-${t}`} href={`/?tag=${encodeURIComponent(t)}`} className={styles.tagChip}>{t}</Link>
            ))}
            {hiddenTagCount > 0 && (
              <button type="button" className={styles.tagsMore} onClick={() => setTagsExpanded(!tagsExpanded)}>
                {tagsExpanded ? 'show less' : `+${hiddenTagCount}`}
              </button>
            )}
          </div>
        )}

        {/* Social metrics — under the tags, closing the top section */}
        <StatsLine items={statNodes} className={styles.statsBottom} />

        {/* Bottom section — fandom / ships / characters, visually separated */}
        {(meta.fandom.length > 0 || meta.relationships.length > 0 || meta.characters.length > 0) && (
          <div className={styles.discovery}>
            {meta.fandom.length > 0 && (
              <div className={`${styles.fandom} ${styles.interactive}`}>
                {meta.fandom.map((f, i) => (
                  <span key={f}>
                    {i > 0 && ', '}
                    <Link href={`/?fandom=${encodeURIComponent(f)}`} className={styles.fandomLink}>{f}</Link>
                  </span>
                ))}
              </div>
            )}

            {meta.relationships.length > 0 && (
              <div className={`${styles.ships} ${styles.interactive}`}>
                {meta.relationships.map((r, i) => (
                  <span key={r}>
                    {i > 0 && <span className={styles.shipSeparator}> / </span>}
                    <Link href={`/?relationship=${encodeURIComponent(r)}`} className={styles.shipLink}>{r}</Link>
                  </span>
                ))}
              </div>
            )}

            {meta.characters.length > 0 && (
              <div className={`${styles.characters} ${styles.interactive}`}>
                {meta.characters.map((c, i) => (
                  <span key={`char-${i}`}>
                    {i > 0 && <span className={styles.charSeparator}>, </span>}
                    <Link href={`/?character=${encodeURIComponent(c)}`} className={styles.charLink}>{c}</Link>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
