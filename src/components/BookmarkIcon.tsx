interface BookmarkIconProps {
  /** Solid ribbon when saved; outline when not. */
  filled: boolean;
  /** Optional class for per-context styling (e.g. opacity/hover on the reader). */
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Shared bookmark ribbon icon — the single source of truth for the bookmark
 * glyph. Outline by default, solid when `filled`. Used by the reading-page
 * bookmark toggle and the library remove-bookmark button so they always match.
 */
export function BookmarkIcon({ filled, className, width = 13, height = 16 }: BookmarkIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 13 16"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 1.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5V14l-4.5-3-4.5 3V1.5z" />
    </svg>
  );
}
