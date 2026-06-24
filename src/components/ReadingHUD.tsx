'use client';

import { HUD_BUBBLE } from './readingChrome';
import { ChevronLeftIcon } from './icons';
import { Tooltip } from './Tooltip';

export function ReadingHUD() {
  return (
    <Tooltip label="Back to works" align="left">
      <a
        href="/"
        aria-label="Back to works"
        className={`${HUD_BUBBLE} pointer-events-auto no-underline`}
      >
        <ChevronLeftIcon width={20} height={20} />
      </a>
    </Tooltip>
  );
}
