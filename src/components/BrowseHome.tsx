import { Shelf, Creator } from '@/lib/shelves';
import { HeroCarousel } from './HeroCarousel';
import { ContinueReadingSection } from './ContinueReadingSection';
import { ShelfRail } from './ShelfRail';
import { CreatorRail } from './CreatorRail';
import { CreatorCTABanner } from './CreatorCTABanner';

interface Props {
  shelves: Shelf[];
  creators: Creator[];
  /** slug to cover path map for the continue-reading rail. */
  covers: Record<string, string | undefined>;
}

/**
 * Editorial zone of the Discover page, rendered above the Stories-for-you
 * grid when no filter params are active. Sequence per Devon: banner,
 * continue reading, Trending, Featured, creators. The grid below (with
 * search and filters in its toolbar) is the load-bearing surface; these
 * shelves are the editorial layer over it.
 */
export function BrowseHome({ shelves, creators, covers }: Props) {
  const trending = shelves.find((s) => s.key === 'trending');
  const featured = shelves.find((s) => s.key === 'featured');

  return (
    <>
      <HeroCarousel />

      <ContinueReadingSection covers={covers} />

      {trending && <ShelfRail shelf={trending} priority />}

      {featured && <ShelfRail shelf={featured} />}

      <CreatorCTABanner />

      <CreatorRail creators={creators} />
    </>
  );
}
