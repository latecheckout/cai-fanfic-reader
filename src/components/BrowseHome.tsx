import { Shelf, FandomTile, Creator } from '@/lib/shelves';
import { HeroCarousel } from './HeroCarousel';
import { ContinueReadingSection } from './ContinueReadingSection';
import { ShelfRail } from './ShelfRail';
import { CreatorRail } from './CreatorRail';
import { FandomRail } from './FandomRail';

interface Props {
  shelves: Shelf[];
  creators: Creator[];
  fandoms: FandomTile[];
  /** slug to cover path map for the continue-reading rail. */
  covers: Record<string, string | undefined>;
}

/**
 * Browse-first layer zero. Rendered on / when no filter params are active.
 * Search lives in the nav (BrowseHeader's search slot); everything here is
 * browse content. Shelf order per Devon: Trending, Trending creators,
 * Featured, then the fandom rail.
 */
export function BrowseHome({ shelves, creators, fandoms, covers }: Props) {
  const trending = shelves.find((s) => s.key === 'trending');
  const featured = shelves.find((s) => s.key === 'featured');

  return (
    <>
      <HeroCarousel />

      <ContinueReadingSection covers={covers} />

      {trending && <ShelfRail shelf={trending} priority />}

      <CreatorRail creators={creators} />

      {featured && <ShelfRail shelf={featured} />}

      <FandomRail tiles={fandoms} />
    </>
  );
}
