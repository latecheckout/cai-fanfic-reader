import Link from 'next/link';
import { Shelf, FandomTile } from '@/lib/shelves';
import { HeroCarousel } from './HeroCarousel';
import { ContinueReadingSection } from './ContinueReadingSection';
import { ShelfRail } from './ShelfRail';
import { FandomRail } from './FandomRail';
import styles from '@/styles/components/BrowseHome.module.css';

interface Props {
  totalCount: number;
  shelves: Shelf[];
  fandoms: FandomTile[];
  /** slug to cover path map for the continue-reading rail. */
  covers: Record<string, string | undefined>;
}

/**
 * Browse-first layer zero. Rendered on / when no filter params are active.
 * Search lives in the nav (BrowseHeader's search slot); everything here is
 * browse content. Layer one (the full search and filter surface in
 * BrowseShell) is one action away: any tile, shelf title, or cover pushes
 * a filter URL.
 */
export function BrowseHome({ totalCount, shelves, fandoms, covers }: Props) {
  return (
    <>
      <HeroCarousel />

      <ContinueReadingSection covers={covers} />

      <FandomRail tiles={fandoms} />

      {shelves.map((shelf, i) => (
        <ShelfRail key={shelf.key} shelf={shelf} priority={i === 0} />
      ))}

      <footer className={styles.footer}>
        <Link href="/?sort=updated" className={styles.footerLink}>
          Browse the full archive: {totalCount} works
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 1.5 7 5 3 8.5" />
          </svg>
        </Link>
      </footer>
    </>
  );
}
