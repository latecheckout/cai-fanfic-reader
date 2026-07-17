'use client';

import Image from 'next/image';
import { useReading } from '@/context/ReadingContext';
import { WorkMetaBlock } from './WorkMetaBlock';
import { TagRow } from './TagChip';
import { Tooltip } from './Tooltip';
import { FlagIcon } from './icons';
import { ICON_BUTTON_FILLED } from './popoverChrome';

/**
 * Story-overview popover body — opens from the title pill in the bottom
 * reading cluster. Identity block + the classic dashed-divider tag list,
 * both shared components.
 */
export function StoryOverview() {
  const { workMeta, totalChapters } = useReading();

  return (
    <div className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-5 pt-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Report — pinned to the card corner at equal top/right insets (20px,
          matching the body's pt-5). Scrolls with the header, like the heading.
          @WIRE — becomes POST /works/:slug/report once the API exists. */}
      <div className="absolute right-5 top-5">
        <Tooltip label="Report this story">
          <button type="button" aria-label="Report this story" className={ICON_BUTTON_FILLED}>
            <FlagIcon width={16} height={16} />
          </button>
        </Tooltip>
      </div>
      <div className="mb-4 flex min-h-8 items-center">
        <span className="font-serif text-[16px] font-medium text-text">Story info</span>
      </div>
      {workMeta.cover && (
        <div className="relative mb-4 aspect-[2/3] w-[104px] overflow-hidden rounded-[10px] bg-border">
          <Image src={workMeta.cover} alt="" fill sizes="104px" className="rounded-[10px] object-cover" />
          <span
            className="pointer-events-none absolute inset-0 rounded-[10px] shadow-[inset_0_0_0_1px_var(--image-outline)]"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Identity — shared block (badges, title, byline, summary, stats). */}
      <WorkMetaBlock meta={workMeta} totalChapters={totalChapters} />

      {/* Signals — the classic dashed-divider tag list. */}
      <div className="mt-4 flex flex-col gap-2 border-t border-dashed border-border pt-4">
        <TagRow label="Warnings" items={workMeta.warnings} category="warning" param="warning" />
        <TagRow label="Fandom" items={workMeta.fandom} category="fandom" param="fandom" />
        <TagRow label="Ships" items={workMeta.relationships} category="relationship" param="relationship" />
        <TagRow label="Characters" items={workMeta.characters} category="character" param="character" />
        <TagRow label="Tags" items={workMeta.tags} category="additional" param="tag" />
      </div>
    </div>
  );
}
