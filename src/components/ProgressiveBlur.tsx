// Server component — pure CSS, no client APIs. Layered backdrop blur that
// fades from a soft surface tint into the content below. Ported from
// character-manga's ProgressiveBlur (the play-panel banner band).
//
// Masks are single inline gradients (WebkitMaskImage + maskImage), verbatim
// from the manga source — do NOT rewrite onto Tailwind's mask-* utilities:
// those compose four directional gradients via mask-composite, which Safari
// mis-renders on backdrop-filter layers (the band bleeds into a white fog).

type Direction = 'down' | 'up';

type ProgressiveBlurProps = {
  /** "down" = solid at top, transparent at bottom (top band).
   *  "up"   = solid at bottom, transparent at top (footer). */
  direction: Direction;
  /** Tint of the fading layer: the surface token, or a dark scrim over art. */
  tone?: 'surface' | 'dark';
};

export function ProgressiveBlur({ direction, tone = 'surface' }: ProgressiveBlurProps) {
  const to = direction === 'down' ? 'bottom' : 'top';
  const mask = (solidEnd: number, fadeEnd: number) =>
    `linear-gradient(to ${to}, black 0%, black ${solidEnd}%, transparent ${fadeEnd}%)`;
  const smoothMask = `linear-gradient(to ${to}, black, transparent)`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ WebkitMaskImage: mask(75, 100), maskImage: mask(75, 100) }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[6px]"
        style={{ WebkitMaskImage: mask(45, 75), maskImage: mask(45, 75) }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[12px]"
        style={{ WebkitMaskImage: mask(15, 45), maskImage: mask(15, 45) }}
      />
      <div
        className={`absolute inset-0 ${tone === 'dark' ? 'bg-[rgba(0,0,0,0.45)]' : 'bg-bubble'}`}
        style={{ WebkitMaskImage: smoothMask, maskImage: smoothMask }}
      />
    </div>
  );
}
