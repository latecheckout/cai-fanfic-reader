'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { WorkSummary, LayoutView } from '@/types';
import { WorkCardGrid } from './WorkCardGrid';
import { WorkCardCover } from './WorkCardCover';
import { SkeletonCard } from './SkeletonCard';
import { PILL_EXIT } from '@/lib/motion';

// Layout modes (driven by the view toggle). Image cards: 4→3→2→1. Text/list
// cards: single column, two on wide desktops so they fill the extra width.
const GRID_CLS =
  'grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[768px]:grid-cols-2 max-[460px]:grid-cols-1';
const LIST_CLS = 'grid grid-cols-1 gap-4 min-[1100px]:grid-cols-2';

interface Props {
  works: WorkSummary[];
  view: LayoutView;
  /** Flash skeletons (filter changes). View switches snap. */
  isFiltering?: boolean;
  skeletonCount?: number;
  /** Eager-load covers for the first N grid cards (above the fold). */
  priorityCount?: number;
  /** Rendered when `works` is empty (and not filtering). */
  empty?: ReactNode;
  containerClassName?: string;
  /** Extra classes on each card wrapper (e.g. an entrance stagger). */
  cardClassName?: string;
  /** Per-card overlay, absolutely positioned in the wrapper (e.g. the
      library's remove-bookmark button). */
  renderOverlay?: (work: WorkSummary) => ReactNode;
}

/**
 * The shared results grid: view-driven container, skeleton flash while
 * filtering, and motion `layout` wrappers so remaining cards slide into place
 * when one is removed (AnimatePresence exit = the filter-pill scale/fade).
 * `layoutDependency` keys the FLIP measurements to the work list, so view
 * switches (AO4 toggle) snap instead of morphing.
 */
export function WorkGrid({
  works,
  view,
  isFiltering = false,
  skeletonCount = 6,
  priorityCount = 0,
  empty,
  containerClassName = '',
  cardClassName = '',
  renderOverlay,
}: Props) {
  const reduce = useReducedMotion();
  const layoutKey = works.map((w) => w.slug).join('|');
  return (
    <div className={`${!isFiltering && view === 'grid' ? GRID_CLS : LIST_CLS} ${containerClassName}`}>
      {isFiltering ? (
        Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={i} index={i} />
        ))
      ) : works.length === 0 ? (
        // Span all grid columns so the empty state centers on the page
        // instead of sitting in the first cell.
        <div className="col-[1/-1]">{empty}</div>
      ) : (
        <AnimatePresence initial={false}>
          {works.map((work, i) => (
            <motion.div
              key={work.slug}
              layout={!reduce}
              layoutDependency={layoutKey}
              exit={reduce ? { opacity: 0 } : PILL_EXIT}
              // flex + flex-1 so the card fills the wrapper's height and rows
              // stay equal-height, as when cards were direct grid children.
              className="relative flex [&>*]:min-w-0 [&>*]:flex-1"
            >
              {/* cardClassName (CSS entrance animations) lives on an inner div:
                  a filled CSS animation on the motion node would override the
                  exit's inline opacity and the card would never fade out. */}
              <div className={`flex [&>*]:min-w-0 [&>*]:flex-1 ${cardClassName}`}>
                {view === 'grid' ? (
                  <WorkCardGrid work={work} priority={i < priorityCount} />
                ) : (
                  <WorkCardCover work={work} />
                )}
              </div>
              {renderOverlay?.(work)}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
