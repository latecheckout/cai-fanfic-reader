'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReading } from '@/context/ReadingContext';
import { isBookmarked, toggleBookmark } from '@/lib/library';
import { HUD_BUBBLE } from './readingChrome';
import { FilterIcon, BookmarkIcon, BookmarkCheckIcon, UserProfileIcon } from './icons';
import { Tooltip } from './Tooltip';
import { Popover } from './Popover';
import { PrefsPanel } from './PrefsPanel';
import { AccountMenu } from './AccountMenu';

/**
 * Cross-fades between two icons whenever `swapKey` changes — outgoing blurs and
 * shrinks out, incoming blurs and scales in (spring, duration 0.3, bounce 0).
 */
export function CrossfadeSwap({ swapKey, children }: { swapKey: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={swapKey}
        initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        className="relative inline-flex items-center justify-center"
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

export function ReadingActions() {
  const { slug } = useReading();
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setInList(isBookmarked(slug));
  }, [slug]);

  function toggleReadingList() {
    setInList(toggleBookmark(slug));
  }

  return (
    <div className="pointer-events-auto flex flex-row items-center gap-2">
      {/* Prefs/filter button — anchored popover (shared Popover lens) */}
      <Popover
        align="right"
        ariaLabel="Reading preferences"
        contentClassName="w-[284px] p-4"
        renderTrigger={({ open, toggle }) => (
          <Tooltip label="Reading preferences" align="center" disabled={open}>
            <button
              onClick={toggle}
              aria-label="Reading preferences"
              aria-expanded={open}
              className={`${HUD_BUBBLE} ${open ? 'shadow-bubble-hover [&_svg]:opacity-100' : ''}`}
            >
              <FilterIcon width={18} height={18} />
            </button>
          </Tooltip>
        )}
      >
        <PrefsPanel />
      </Popover>

      {/* Reading-list button — crossfade between bookmark and bookmark-added */}
      <Tooltip label={inList ? 'In reading list' : 'Add to reading list'} align="right">
        <button
          onClick={toggleReadingList}
          aria-label={inList ? 'In reading list' : 'Add to reading list'}
          aria-pressed={inList}
          className={HUD_BUBBLE}
        >
          <CrossfadeSwap swapKey={inList ? 'yes' : 'no'}>
            {inList ? <BookmarkCheckIcon width={20} height={20} /> : <BookmarkIcon width={20} height={20} />}
          </CrossfadeSwap>
        </button>
      </Tooltip>

      {/* Account menu — shared body (AccountMenu), HUD-bubble trigger */}
      <AccountMenu
        renderTrigger={({ open, toggle }) => (
          <Tooltip label="Account" align="right" disabled={open}>
            <button
              onClick={toggle}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={open}
              className={`${HUD_BUBBLE} ${open ? 'shadow-bubble-hover [&_svg]:opacity-100' : ''}`}
            >
              <UserProfileIcon width={20} height={20} />
            </button>
          </Tooltip>
        )}
      />
    </div>
  );
}
