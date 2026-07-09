import Link from 'next/link';
import Image from 'next/image';
import { WorkSummary } from '@/types';
import { ratingClass, categoryLabel, isWipStatus } from '@/lib/utils';
import { SignalStrip, Views, Kudos, Avatar } from './WorkCardCover';
import { TagChip } from './TagChip';

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
    <article className="group relative aspect-[2/3] rounded-card p-3 hover:z-[5]">
      {/* Clipping (rounded corners + hover zoom) lives on this inner wrapper so
          the card itself can stay overflow-visible — otherwise it clips the
          badge tooltips. The hairline ring is an ::after inside the same clip so
          the ring and the image edge round identically. */}
      <div className="absolute inset-0 z-0 rounded-card bg-[#1a1614] [clip-path:inset(0_round_14px)] after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-card after:border after:border-white/20 after:content-['']">
        {meta.cover && (
          <Image
            src={meta.cover}
            alt={meta.title}
            fill
            sizes={COVER_SIZES}
            priority={priority}
            className="absolute inset-0 object-cover transition-transform duration-[320ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
          />
        )}
        {/* Bottom-weighted scrim for legibility over the photo. */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_top,rgba(0,0,0,1)_0%,rgba(0,0,0,0.92)_28%,rgba(0,0,0,0.62)_52%,rgba(0,0,0,0)_78%)]"
          aria-hidden="true"
        />
      </div>

      {/* Whole-card link sits above the scrim; the metadata cluster is
          pointer-events:none so clicks pass through, except the tag links. */}
      <Link href={`/works/${slug}`} className="absolute inset-0 z-[2]" aria-label={meta.title} />

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[3] flex flex-col gap-[10px]">
        <SignalStrip
          rating={meta.rating}
          rClass={rClass}
          catLabel={catLabel}
          category={meta.category}
          isWip={isWip}
          onImage
        />

        <span className="line-clamp-2 font-serif text-[16px] font-medium leading-[1.3] text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[3px]">
          {meta.title}
        </span>

        {meta.author && (
          <span className="inline-flex items-center font-sans text-[14px] text-white/[0.82]">
            <span className="mr-[5px]">by</span>
            <Avatar />
            <Link
              href={`/?q=${encodeURIComponent(meta.author)}`}
              className="pointer-events-auto text-inherit no-underline hover:text-white hover:underline hover:underline-offset-2"
            >
              {meta.author}
            </Link>
          </span>
        )}

        {tags.length > 0 && (
          <div className="pointer-events-auto flex flex-wrap gap-[6px]">
            {tags.map((t) => (
              <TagChip
                key={t}
                tag={t}
                category="additional"
                clickable
                href={`/?tag=${encodeURIComponent(t)}`}
                onImage
              />
            ))}
          </div>
        )}

        {(meta.hits > 0 || meta.kudos > 0) && (
          <div className="font-mono text-[13px] text-white/[0.82]">
            {meta.hits > 0 && <Views hits={meta.hits} />}
            {meta.hits > 0 && meta.kudos > 0 && ' · '}
            {meta.kudos > 0 && <Kudos count={meta.kudos} />}
          </div>
        )}
      </div>
    </article>
  );
}
