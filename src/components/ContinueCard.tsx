import Link from 'next/link';
import Image from 'next/image';
import { GENERIC_COVER } from '@/lib/covers';

/* Shared bits reused across the visual, text, and skeleton presentations. */
const HEAD = 'absolute top-3 left-3 right-3 flex flex-col gap-[2px]';
const TITLE = 'font-serif text-[14px] font-medium leading-[1.25] line-clamp-2';
const META = 'font-mono text-[12px]';
const TRACK = 'absolute bottom-0 left-0 right-0 h-1';
const FILL = 'block h-full rounded-[0_2px_2px_0]';

export interface ContinueItem {
  slug: string;
  title: string;
  chapterIndex: number;
  totalChapters: number;
  scrollPercent: number;
}

interface Props {
  item: ContinueItem;
  /** Cover path (bookmarks from localStorage lack meta.cover). */
  cover?: string;
}

/**
 * Continue-reading card — mode-aware like the work cards. Visual mode is a
 * cover thumbnail with the title overlaid and a progress bar; text/AO4 mode is
 * a compact bordered text card (title + chapter + progress). CSS picks the
 * presentation by the global html[data-mode], so it follows the site toggle.
 */
export function ContinueCard({ item, cover }: Props) {
  const pct = Math.min(item.scrollPercent * 100, 100);
  const pctLabel = `${pct.toFixed(1)}%`;

  return (
    <Link
      href={`/works/${item.slug}`}
      className="group flex-shrink-0 block w-[150px] no-underline text-inherit"
      title={`${item.title} · Ch. ${item.chapterIndex + 1} of ${item.totalChapters}`}
      aria-label={`Continue reading ${item.title}, chapter ${item.chapterIndex + 1} of ${item.totalChapters}`}
    >
      {/* Visual: cover + title/chapter at the top + progress at the bottom */}
      <span className="block transition-transform duration-150 ease-in-out group-hover:-translate-y-[2px] [html[data-mode=text]_&]:hidden">
        <span className="relative block aspect-[2/3] rounded-card [clip-path:inset(0_round_14px)] bg-border after:content-[''] after:absolute after:inset-0 after:border after:border-white/20 after:rounded-card after:pointer-events-none">
          <Image src={cover ?? GENERIC_COVER} alt="" fill sizes="150px" className="object-cover" />
          <span className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.55)_30%,rgba(0,0,0,0.12)_52%,transparent_64%)]" aria-hidden="true" />
          <span className={HEAD}>
            <span className={`${TITLE} text-white`}>{item.title}</span>
            <span className={`${META} text-white/80`}>Ch {item.chapterIndex + 1} of {item.totalChapters}</span>
          </span>
          <span className={`${TRACK} bg-black/45`}>
            <span className={`${FILL} bg-rating-t`} style={{ width: pctLabel }} />
          </span>
        </span>
      </span>

      {/* Text: same 2:3 box, solid fill — same top header + bottom progress */}
      <span className="hidden [html[data-mode=text]_&]:block [html[data-mode=text]_&]:relative [html[data-mode=text]_&]:aspect-[2/3] [html[data-mode=text]_&]:rounded-card [html[data-mode=text]_&]:[clip-path:inset(0_round_14px)] [html[data-mode=text]_&]:bg-card after:content-[''] after:absolute after:inset-0 after:border after:border-card-border after:rounded-card after:pointer-events-none after:transition-colors after:duration-150 group-hover:after:border-border-strong">
        <span className={HEAD}>
          <span className={`${TITLE} text-text`}>{item.title}</span>
          <span className={`${META} text-secondary`}>Ch {item.chapterIndex + 1} of {item.totalChapters}</span>
        </span>
        <span className={`${TRACK} bg-border`}>
          <span className={`${FILL} bg-rating-t`} style={{ width: pctLabel }} />
        </span>
      </span>
    </Link>
  );
}

/** Loading placeholder — the 2:3 card with the same UI elements as placeholders:
 *  title + chapter at the top, progress bar at the bottom. */
export function ContinueCardSkeleton() {
  const skelLine = 'rounded-[4px] bg-border-strong animate-[caiSkeletonPulse_1.4s_ease-in-out_infinite]';
  return (
    <div className="flex-shrink-0 block w-[150px]" aria-hidden="true">
      <span className="relative block aspect-[2/3] rounded-card border border-card-border bg-card overflow-hidden">
        <span className={HEAD}>
          <span className={`${skelLine} w-[80%] h-[13px]`} />
          <span className={`${skelLine} w-[45%] h-[11px]`} />
        </span>
        <span className={`${TRACK} bg-border`}>
          <span className={`${FILL} bg-border-strong animate-[caiSkeletonPulse_1.4s_ease-in-out_infinite]`} style={{ width: '40%' }} />
        </span>
      </span>
    </div>
  );
}
