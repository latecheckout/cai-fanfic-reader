'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useReading, useReadingUI } from '@/context/ReadingContext';
import { ProgressiveBlur } from './ProgressiveBlur';
import { WorkMetaBlock } from './WorkMetaBlock';
import { TagRow } from './TagChip';
import { Tooltip } from './Tooltip';
import { ChatBubbleIcon } from './icons';
import { isTypingTarget } from '@/lib/utils';

/**
 * The fandom hub — a left "second screen" panel over the reading page
 * (ported from character-manga's play-details sidebar). No scrim: the story
 * stays lit and scrollable beside it. Slide is a plain CSS transform so the
 * panel stays mounted and the HUD cluster can tuck into its corner mid-flight.
 *
 * The whole card body — banner included — scrolls as one; only the tucked-in
 * HUD buttons (rendered by ReadingHUD, fixed) stay pinned in the corner.
 * Character roster + tabs are parked for now: plain tag rows like the old
 * metadata overlay, Characters included.
 */
export function FandomHub() {
  const { workMeta, totalChapters } = useReading();
  const { hubOpen, setHubOpen, chatOpen, setChatOpen } = useReadingUI();

  // Escape closes the hub (stop it bubbling into other Escape handlers).
  useEffect(() => {
    if (!hubOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isTypingTarget(e)) {
        e.stopPropagation();
        setHubOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hubOpen, setHubOpen]);

  return (
    <aside
      role="dialog"
      aria-modal={false}
      aria-label={workMeta.title}
      data-state={hubOpen ? 'open' : 'closed'}
      className="fixed bottom-3 left-3 top-3 z-[var(--z-hub)] w-[min(420px,90vw)] max-md:hidden"
      style={{
        transform: hubOpen ? 'translateX(0)' : 'translateX(calc(-100% - 12px))',
        transition: `transform ${hubOpen ? 460 : 360}ms var(--ease-sidebar)`,
        willChange: 'transform',
        pointerEvents: hubOpen ? undefined : 'none',
      }}
    >
      {/* Card chrome — home-card recipe with a Safari fallback. Chrome rounds
          via clip-path (seamless AA, like WorkCardGrid); Safari ignores
          clip-path rounding on elements with backdrop-filter descendants (the
          blur band), so overflow-hidden + rounded does the clipping there.
          Hairline = ::after border-image-outline ring; no solid border.
          @TODO — Safari still renders this card wrong even with the fallback
          (parked 2026-07-14 to keep moving; Chrome is the reference). */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-bubble text-text shadow-float [clip-path:inset(0_round_32px)] after:pointer-events-none after:absolute after:inset-0 after:z-20 after:rounded-[32px] after:border after:border-image-outline after:content-['']">
        {/* Character chat trigger — glass button pinned to the hub's top-right
            (the only way in besides "Chat about this"). Sits above the blur
            band so its stroke stays crisp (see blur-band layering memory). */}
        <Tooltip label="Chat with a character" align="right">
          <button
            type="button"
            aria-label="Open character chat"
            aria-pressed={chatOpen}
            onClick={() => setChatOpen(!chatOpen)}
            className="absolute right-4 top-4 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.16)] text-pure-white backdrop-blur-md transition-[background-color,transform] duration-150 hover:bg-[rgba(255,255,255,0.28)] active:scale-[0.96]"
          >
            <ChatBubbleIcon width={19} height={19} />
          </button>
        </Tooltip>
        {/* One scroller for everything — the banner scrolls away with the
            content; only the fixed HUD cluster stays pinned in the corner. */}
        <div className="relative flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Cover banner — the tucked-in HUD bubbles float over its top-left. */}
          {workMeta.cover && (
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={workMeta.cover}
                alt=""
                fill
                sizes="420px"
                className="object-cover"
              />
              {/* No image-outline ring here: anything under the blur band gets
                  smeared into a dark halo along the card's radius, and the card's
                  own ring + the frost/fade already define every exposed edge. */}
              {/* Progressive blur band (manga port) — frosts the banner's top so
                  the tucked-in back + hub buttons stay legible over art. */}
              <div className="absolute inset-x-0 top-0 z-10 h-20">
                <ProgressiveBlur direction="down" tone="dark" />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, transparent 35%, var(--bubble-bg) 96%)' }}
              />
            </div>
          )}

          <div className={`px-6 pb-6 ${workMeta.cover ? '-mt-8' : 'pt-14'}`}>
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
        </div>
      </div>
    </aside>
  );
}
