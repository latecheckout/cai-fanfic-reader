import { Creator } from '@/lib/shelves';
import { CreatorCard } from './CreatorCard';
import { RailViewport } from './RailViewport';

interface Props {
  creators: Creator[];
}

/**
 * Trending creators (server component): a horizontal rail of CreatorCards (per
 * Devon, design review June 2026 — "make the humans shine").
 */
export function CreatorRail({ creators }: Props) {
  if (creators.length === 0) return null;

  return (
    <section className="mb-10 md:mb-12" aria-label="Trending creators">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="m-0 font-serif text-[21px] md:text-[24px] font-medium tracking-[-0.01em] text-text">Trending creators ✍️</h2>
          <p className="mt-[2px] font-sans text-[15px] text-secondary">The humans behind the stories</p>
        </div>
      </div>

      {/* cai-rail frames the scroller and carries the directional edge fades;
          RailViewport adds prev/next scroll arrows (in addition to swipe). */}
      <RailViewport railClassName="cai-rail" rowClassName="cai-rail-row">
        {creators.map((c, i) => <CreatorCard key={c.name} creator={c} index={i} />)}
      </RailViewport>
    </section>
  );
}
