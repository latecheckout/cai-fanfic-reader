import { HUD_BUBBLE } from './readingChrome';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

/**
 * Prev/next arrow for horizontal rails and the hero carousel. Reuses HUD_BUBBLE
 * (the reading-page back-arrow chrome) so every carousel/rail arrow matches the
 * back arrow exactly. The positioning + visibility live on the wrapper so the
 * bubble's own active:scale press animation isn't clobbered by the centering
 * transform.
 */
export function CarouselArrow({
  direction,
  onClick,
  disabled = false,
  label,
  /** Positioning (and any reveal classes) on the wrapper; parent must be relative. */
  positionClassName = '',
  size = 20,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
  label: string;
  positionClassName?: string;
  size?: number;
}) {
  const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <div
      className={`pointer-events-none absolute top-1/2 z-[3] -translate-y-1/2 transition-opacity duration-150 ${
        disabled ? 'pointer-events-none opacity-0' : ''
      } ${positionClassName}`}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`${HUD_BUBBLE} pointer-events-auto`}
      >
        <Icon width={size} height={size} />
      </button>
    </div>
  );
}
