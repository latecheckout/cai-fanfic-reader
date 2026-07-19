/**
 * Shared hero slide chrome (image + scrim + kicker/headline/CTA) as Tailwind
 * class strings. Lives in a plain module (no 'use client') so both the client
 * HeroCarousel and the server CreatorCTABanner can import it — one source of
 * truth now that the CSS Module is gone.
 *
 * `slide` establishes a `group/slide` so the bg (scale) and cta (fill) react to
 * hovering the slide; the carousel section owns `group/hero` for the arrows.
 */
export const heroSlide = {
  slide:
    'group/slide relative grow-0 shrink-0 basis-full snap-center aspect-[15/4] max-sm:aspect-[3/2] ' +
    'overflow-hidden text-inherit no-underline bg-border ' +
    "after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-banner after:border after:border-image-outline after:content-['']",
  bg: 'object-cover transition-transform duration-[600ms] ease-out-expo group-hover/slide:scale-[1.02]',
  scrim:
    'absolute inset-0 bg-[linear-gradient(100deg,rgba(15,12,10,0.82)_0%,rgba(15,12,10,0.55)_38%,rgba(15,12,10,0.12)_62%,rgba(15,12,10,0)_80%)]',
  overlay:
    'absolute inset-0 z-[2] flex items-center justify-center gap-[clamp(20px,3.5%,52px)] px-[clamp(20px,5%,64px)]',
  coverWrap:
    'relative shrink-0 aspect-[2/3] w-[clamp(104px,15%,188px)] max-sm:w-[108px] rotate-[-7deg] overflow-hidden rounded-[5px] shadow-[0_12px_32px_rgba(0,0,0,0.5)]',
  cover: 'object-cover',
  content: 'flex min-w-0 flex-col gap-3',
  kicker: 'font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-[#f3d9a4]',
  // Authored \n breaks (whitespace-pre-line) are composed for the wide
  // banner; on narrow screens natural wrapping + the forced break collide
  // into ragged lines — so below md the break is ignored (whitespace-normal)
  // and text-wrap:balance evens out whatever wraps remain.
  headline:
    "font-serif text-[clamp(20px,3.2vw,38px)] font-normal leading-[1.14] tracking-[-0.01em] text-[#fbf2dc] [text-shadow:0_2px_16px_rgba(0,0,0,0.4)] max-w-[30ch] whitespace-pre-line max-md:whitespace-normal [text-wrap:balance]",
  // Same shape as the header's "Write on c.ai" CTA (NavPillLink `big filled`:
  // h-10 px-4 pill + --cta-stroke ring). It's a span (the whole slide is the
  // anchor), so hover rides the slide group instead of the element's own
  // :hover. No shadow-bubble (its baked-in 1px ring doubles the --cta-stroke
  // border). Fill is a param:
  // - 'glass' (hero carousel) — low-opacity white over the slide's scrim,
  //   stepping up on hover. Scrim is constant-dark, so it reads in every theme.
  // - 'solid' (creator banner) — --cta-fill deepening to pinned-purple.
  cta: (fill: 'solid' | 'glass' = 'solid') =>
    'mt-1 inline-flex h-10 items-center whitespace-nowrap rounded-full border border-cta-stroke px-4 font-sans text-[13px] leading-none text-white ' +
    'transition-[background-color] duration-150 ease-out ' +
    (fill === 'glass'
      ? 'bg-pure-white/15 group-hover/slide:bg-pure-white/25'
      : 'bg-cta-fill group-hover/slide:bg-pinned-purple'),
};
