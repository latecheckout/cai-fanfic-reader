'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { heroSlide } from './heroChrome';

const AUTOPLAY_MS = 6000;

const ARROW =
  'absolute top-1/2 z-[3] flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/55 bg-transparent text-white opacity-0 ' +
  'transition-[opacity,background-color,border-color] duration-150 ease-in-out group-hover/hero:opacity-100 hover:border-white hover:bg-white/[0.14] max-sm:hidden';

interface Slide {
  image: string;
  /** Optional tilted cover thumbnail (story spotlights). */
  cover?: string;
  kicker: string;
  headline: string;
  cta: string;
  href: string;
}

// 1) story spotlight → reading page · 2) trope → search filtered · 3) Originals spotlight
const SLIDES: Slide[] = [
  {
    image: '/hero/banner-1.png',
    cover: '/covers/cover-11.png',
    kicker: 'Featured',
    headline: 'Eight years of hating him.\nOne shared room.',
    cta: 'Read now',
    href: '/works/sample-story-2',
  },
  {
    image: '/hero/banner-2.png',
    kicker: 'Trope of the week',
    headline: 'Enemies to lovers, done right.',
    cta: 'Explore the tag',
    href: '/?tag=Enemies%20to%20Lovers',
  },
  {
    image: '/hero/banner-3.png',
    cover: '/covers/cover-01.png',
    kicker: 'c.ai Originals',
    headline: "Some fires you don't survive.\nSome you become.",
    cta: 'Read now',
    href: '/works/work-01',
  },
];

export function HeroCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const realCount = SLIDES.length;

  const scrollToPos = (pos: number, smooth = true) => {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.scrollTo({ left: pos * vp.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  };

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(realCount - 1, i));
    scrollToPos(clamped);
    setIndex(clamped);
  };

  // Forward one slide; at the last, glide FORWARD into a clone of the first, then
  // jump back to the real first slide so it loops without rewinding the list.
  const advance = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    const cur = Math.round(vp.scrollLeft / vp.clientWidth);
    if (cur < realCount - 1) {
      scrollToPos(cur + 1, true);
      setIndex(cur + 1);
      return;
    }

    // Glide into the clone, then — once the scroll has fully SETTLED (scrollend,
    // not a guessed timer) — jump back to slide 0. Snap is disabled for the jump
    // so `scroll-snap-type: mandatory` doesn't re-animate it (the visible glitch).
    scrollToPos(realCount, true);
    setIndex(0);

    let done = false;
    let fallback: ReturnType<typeof setTimeout>;
    const settle = () => {
      if (done) return;
      done = true;
      vp.removeEventListener('scrollend', settle);
      clearTimeout(fallback);
      vp.style.scrollSnapType = 'none';
      vp.scrollLeft = 0;
      requestAnimationFrame(() => { vp.style.scrollSnapType = ''; });
    };
    vp.addEventListener('scrollend', settle);
    fallback = setTimeout(settle, 900); // safety net if scrollend never fires
  };

  // Back one slide; from the first, wrap to the last.
  const retreat = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    const cur = Math.round(vp.scrollLeft / vp.clientWidth) % realCount;
    if (cur <= 0) {
      scrollToPos(realCount - 1, false);
      setIndex(realCount - 1);
    } else {
      scrollToPos(cur - 1, true);
      setIndex(cur - 1);
    }
  };

  const onScroll = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    setIndex(Math.round(vp.scrollLeft / vp.clientWidth) % realCount);
  };

  // Auto-advance on a seamless loop (pause while hovered).
  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="group/hero relative mb-8"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex overflow-x-auto snap-x snap-mandatory rounded-card [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
        ref={viewportRef}
        onScroll={onScroll}
      >
        {[...SLIDES, SLIDES[0]].map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className={heroSlide.slide}
            aria-label={s.headline}
            aria-hidden={i >= realCount || undefined}
            tabIndex={i >= realCount ? -1 : undefined}
          >
            <Image
              src={s.image}
              alt=""
              fill
              sizes="(max-width: 980px) 100vw, 940px"
              /* Only the first banner is the LCP image → priority. The others
                 load eagerly (decoded before they animate in) but without a
                 competing preload, so LCP isn't penalised. */
              {...(i === 0 ? { priority: true } : { loading: 'eager' as const })}
              className={heroSlide.bg}
            />
            <span className={heroSlide.scrim} aria-hidden="true" />
            <span className={heroSlide.overlay}>
              {s.cover && (
                <span className={heroSlide.coverWrap} aria-hidden="true">
                  <Image src={s.cover} alt="" fill sizes="120px" priority={i === 0} className={heroSlide.cover} />
                </span>
              )}
              <span className={`${heroSlide.content} ${s.cover ? 'items-start text-left' : 'items-center text-center'}`}>
                <span className={heroSlide.kicker}>{s.kicker}</span>
                <span className={heroSlide.headline}>{s.headline}</span>
                <span className={heroSlide.cta}>{s.cta}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      <button type="button" className={`${ARROW} left-[14px]`} onClick={retreat} aria-label="Previous">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" className={`${ARROW} right-[14px]`} onClick={advance} aria-label="Next">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute bottom-[14px] left-1/2 z-[3] flex -translate-x-1/2 gap-[7px]">
        {SLIDES.map((s, i) => (
          <button
            key={s.href}
            type="button"
            className={`h-[7px] cursor-pointer rounded-full border-none p-0 transition-[background-color,width] duration-150 ease-in-out ${
              i === index ? 'w-5 bg-white' : 'w-[7px] bg-white/45'
            }`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </section>
  );
}
