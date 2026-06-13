'use client';

import { useState, Fragment } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WorkSummary } from '@/types';
import { formatWords, formatCount, formatChapters, ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import styles from '@/styles/components/WorkCardCover.module.css';

interface Props {
  work: WorkSummary;
}

// List shows up to 8 tags then an expander.
const MAX_TAGS_LIST = 8;

/** @DUMMY — placeholder until real author photos exist. */
const CREATOR_PLACEHOLDER = '/creators/placeholder.png';

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

const STATUS_TOOLTIPS = {
  wip:  { title: 'Work in Progress', desc: 'The author is still adding chapters' },
  done: { title: 'Complete',         desc: 'All chapters have been published' },
};


/** Two-tier badge tooltip — bold title over a lighter description.
 *  Shared by all three SignalStrip badges so the styling is identical. */
function BadgeTooltip({ title, desc }: { title: string; desc: string }) {
  return (
    <span className={styles.tooltip}>
      <span className={styles.tooltipTitle}>{title}</span>
      <span className={styles.tooltipDesc}>{desc}</span>
    </span>
  );
}

const CheckGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 9 9" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="1.5 4.5 3.5 6.5 7.5 2.5" />
  </svg>
);

/** In-progress counterpart to the check: a half-filled circle (partial = WIP). */
const ProgressGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5 1.2 A3.8 3.8 0 0 1 5 8.8 Z" fill="currentColor" />
  </svg>
);

/** Views/reads eye icon. */
function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className={styles.statIcon}>
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function Views({ hits }: { hits: number }) {
  return (
    <span className={styles.statViews}>
      <EyeIcon />
      {formatCount(hits)}
    </span>
  );
}

/** Circular author avatar with a faint white ring.
 *  Shared by the list and grid bylines so the photo treatment is identical. */
export function Avatar() {
  return (
    <span className={styles.avatar} aria-hidden="true">
      <Image src={CREATOR_PLACEHOLDER} alt="" fill sizes="20px" className={styles.avatarImg} />
      <span className={styles.avatarRing} />
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

/** Signal row — rating · category · status, with single-line tooltips.
 *  Exported so the AO4 text cards reuse the exact same badge components. */
export function SignalStrip({
  rating, rClass, catLabel, category, isWip, onImage = false,
}: {
  rating: string;
  rClass: string;
  catLabel: string;
  category: string[];
  isWip: boolean;
  /** Lighten the dashed status pill so it reads over a dark image overlay. */
  onImage?: boolean;
}) {
  return (
    <div className={`${styles.strip} ${onImage ? styles.stripOnImage : ''}`}>
      <span className={`${styles.ratingLetter} ${styles[rClass as keyof typeof styles]}`}>
        {RATING_LETTER[rating] ?? rating.charAt(0)}
        <BadgeTooltip
          title={RATING_TOOLTIPS[rating]?.title ?? rating}
          desc={RATING_TOOLTIPS[rating]?.desc ?? ''}
        />
      </span>
      {catLabel && (
        <div className={styles.catLabel}>
          {catLabel}
          <BadgeTooltip
            title={CATEGORY_TOOLTIPS[category[0]]?.title ?? catLabel}
            desc={CATEGORY_TOOLTIPS[category[0]]?.desc ?? ''}
          />
        </div>
      )}
      <div
        className={`${styles.statusPill} ${isWip ? styles.statusWip : styles.statusDone} ${onImage ? styles.statusPillOnImage : ''}`}
      >
        {isWip ? <ProgressGlyph /> : <CheckGlyph />}
        <BadgeTooltip {...(isWip ? STATUS_TOOLTIPS.wip : STATUS_TOOLTIPS.done)} />
      </div>
    </div>
  );
}

export function WorkCardCover({ work }: Props) {
  const { meta, slug } = work;
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const isWip = isWipStatus(meta.status);
  const catLabel = categoryLabel(meta.category);
  const rClass = ratingClass(meta.rating);

  // ── Detailed list card: strip → title → author → summary → tags → fandom → ships → characters → stats ──
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
      {/* List view is imageless: all metadata, no cover bias. */}

      {/* Content — identity-first: strip → title → author → summary → tags → fandom → ships → characters → stats */}
      <div className={styles.content}>
        <SignalStrip rating={meta.rating} rClass={rClass} catLabel={catLabel} category={meta.category} isWip={isWip} />

        <div className={styles.titleRow}>
          <h3 className={styles.titleWrap}>
            <Link href={`/works/${slug}`} className={styles.titleLink}>
              <span className={styles.title}>{meta.title}</span>
            </Link>
          </h3>
          {meta.author && (
            <span className={`${styles.author} ${styles.bylineAvatar}`}>
              <span className={styles.bylineBy}>by</span>
              <Avatar />
              <Link href={`/?q=${encodeURIComponent(meta.author)}`} className={styles.authorLink}>
                {meta.author}
              </Link>
            </span>
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
