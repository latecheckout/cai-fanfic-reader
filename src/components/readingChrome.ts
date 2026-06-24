// Shared bubble chrome: surface + shadow + hover-lift + press-scale. One base so
// the circular HUD buttons (HUD_BUBBLE) and the cluster pills (BUBBLE_PILL) can't
// drift apart. (Originally adapted from an IconButton, themed with our tokens.)
const BUBBLE_BASE =
  'shrink-0 bg-bubble text-text shadow-bubble transition-[box-shadow,transform] ' +
  'duration-150 ease-out hover:shadow-bubble-hover active:scale-[0.96]';

// 40px circular control with a muted icon that lifts to full contrast on hover.
// Used by the back arrow, the prefs button, and the reading-list button.
export const HUD_BUBBLE =
  `flex h-10 w-10 items-center justify-center rounded-full ${BUBBLE_BASE} ` +
  '[&_svg]:opacity-55 [&_svg]:transition-opacity hover:[&_svg]:opacity-100';

// 40px pill variant (auto width) for the cluster's title + chapter pills.
export const BUBBLE_PILL = `flex h-10 cursor-pointer items-center rounded-full ${BUBBLE_BASE}`;
