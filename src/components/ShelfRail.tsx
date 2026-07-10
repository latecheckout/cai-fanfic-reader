import { Shelf } from '@/lib/shelves';
import { WorkCardGrid } from './WorkCardGrid';
import { WorkCardCover } from './WorkCardCover';
import { RailSection } from './RailSection';

/* Visual mode: a hair under a browse grid card so a 5th card peeks; text mode
   matches a browse 2-up list card. Mobile narrows both. Widths preserved exactly
   from the old module. */
const CARD =
  'flex-shrink-0 flex flex-col w-[70vw] max-w-[300px] ' +
  'md:w-[280px] md:max-w-none ' +
  "[html[data-mode=text]_&]:w-[76vw] [html[data-mode=text]_&]:max-w-[440px] " +
  "md:[html[data-mode=text]_&]:w-[580px] md:[html[data-mode=text]_&]:max-w-none " +
  'animate-[caiRevealUp_500ms_var(--ease-out-expo)_both]';

interface Props {
  shelf: Shelf;
  /** Eager-load covers for the first shelf above the fold. */
  priority?: boolean;
}

/**
 * Horizontal shelf rail (server component). The exact browse cards are reused
 * verbatim: visual mode renders WorkCardGrid, text mode the WorkCardCover list
 * card; the global data-mode toggle picks the slot via CSS. Fully server-
 * rendered — the mode-switch transition is handled globally by the colour sweep.
 *
 * Edge fades are directional via a CSS scroll-driven animation (see .rail).
 */
export function ShelfRail({ shelf, priority = false }: Props) {
  return (
    <RailSection title={shelf.title} subtitle={shelf.subtitle} href={shelf.href}>
      {shelf.works.map((work, i) => (
          <div key={work.slug} className={CARD} style={{ animationDelay: `${(i + 1) * 25}ms` }}>
            {/* Visual: the exact browse grid card (2:3 image, browse width) */}
            <div className="[html[data-mode=text]_&]:hidden">
              <WorkCardGrid work={work} priority={priority && i < 4} />
            </div>
            {/* Text: the exact browse list card (browse 2-up width) */}
            <div className="hidden [html[data-mode=text]_&]:flex [html[data-mode=text]_&]:flex-1 [html[data-mode=text]_&]:min-h-0 [&>*]:flex-1 [&>*]:min-w-0">
              <WorkCardCover work={work} />
            </div>
          </div>
        ))}
    </RailSection>
  );
}
