import { PILL_SHAPE } from './GhostButton';
import { UnlockIcon } from './icons';

// @DUMMY unlock pricing — flat demo price with a strike-through discount.
// @WIRE — becomes the entitlements/pricing API (per-chapter price + user
//         balance), and the CTA becomes the purchase call.
const UNLOCK_PRICE = { original: 20, discounted: 10 };

interface Props {
  /** 1-based chapter number, for the eyebrow. */
  chapterNumber: number;
  title: string;
  summary?: string;
}

/**
 * Paywalled-chapter card — rendered by ChapterList in place of the chapter's
 * content. Centered editorial column inside a hairline card.
 */
export function LockedChapterCard({ chapterNumber, title, summary }: Props) {
  return (
    // Pure card — fills its container; spacing/column come from the caller
    // (ChapterList matches the recommendation grid's rhythm below it).
    <div className="flex flex-col items-center rounded-card border border-border px-10 py-9 text-center max-md:px-6 max-md:py-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
          Chapter {chapterNumber} · Locked
        </p>
        <h2 className="mt-5 text-balance font-serif text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-text">
          {title}
        </h2>
        {summary && (
          <p className="mt-5 max-w-[52ch] text-balance font-sans text-[15px] leading-[1.65] text-secondary">
            {summary}
          </p>
        )}
        <p className="mt-6 font-sans text-[15px] text-text">
          Unlock for <s className="text-secondary">{UNLOCK_PRICE.original}</s>{' '}
          <strong className="font-semibold">{UNLOCK_PRICE.discounted}</strong> charms
        </p>
        <button
          type="button"
          className={`${PILL_SHAPE} mt-7 flex cursor-pointer items-center gap-2 border-border-strong bg-transparent px-6 py-2.5 font-medium text-text transition-colors duration-150 hover:border-border-active`}
        >
          <UnlockIcon width={16} height={16} className="shrink-0" />
          Unlock chapter
        </button>
    </div>
  );
}
