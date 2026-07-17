'use client';

import { HUD_BUBBLE } from './readingChrome';
import { ChevronLeftIcon } from './icons';
import { Tooltip } from './Tooltip';

export function ReadingHUD() {
  return (
    <div className="pointer-events-auto flex items-start gap-2">
      <Tooltip label="Back to works" align="left">
        <a
          href="/"
          aria-label="Back to works"
          className={`${HUD_BUBBLE} no-underline`}
        >
          <ChevronLeftIcon width={20} height={20} />
        </a>
      </Tooltip>
    </div>
  );
}
