'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/components/HeroCarousel.module.css';

const AUTOPLAY_MS = 6000;

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

/**
 * Hero carousel. Exactly one keyboard tab stop: only the CURRENT slide is
 * reachable (the others are `inert`), and Left/Right arrow keys move between
 * slides, shifting focus to the new slide. The prev/next arrows and dots are
 * always-visible controls kept OUT of the tab order (tabindex -1) — mouse users
 * click them, keyboard users use the slide's arrow keys.
 *
 * Autoplay: advances every 6s but PAUSES on hover and on keyboard focus, and
 * never starts under prefers-reduced-motion. Per product decision there is no
 * explicit play/pause button, so WCAG 2.2.2 (Pause/Stop/Hide) is met only via
 * hover/focus-pause + reduced-motion — a DOCUMENTED accepted exception, not a
 * clean pass. (Reinstating a pause control would fully satisfy 2.2.2.)
 */
export function HeroCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const focusPending = useRef(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionOK, setMotionOK] = useState(false);
  const count = SLIDES.length;

  const scrollToPos = (i: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    vp.scrollTo({ left: i * vp.clientWidth, behavior: 'smooth' });
  };

  // Wrap around; when `focusSlide` is set (keyboard nav) move focus to the new
  // slide after it commits (see the effect below — the slide is `inert` until
  // then, so focusing earlier would be a no-op).
  const goTo = (i: number, focusSlide = false) => {
    const next = (i + count) % count;
    scrollToPos(next);
    if (focusSlide) focusPending.current = true;
    setIndex(next);
  };

  useEffect(() => {
    if (focusPending.current) {
      focusPending.current = false;
      slideRefs.current[index]?.focus();
    }
  }, [index]);

  // Reduced-motion preference (react to runtime changes).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const set = () => setMotionOK(!mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  // Auto-advance. Pauses on hover / keyboard focus (so the focused slide never
  // goes `inert` underneath the user), and never runs under reduced motion.
  useEffect(() => {
    if (paused || !motionOK) return;
    const id = setInterval(() => {
      const vp = viewportRef.current;
      if (!vp) return;
      const cur = Math.round(vp.scrollLeft / vp.clientWidth);
      const next = (cur + 1) % count;
      scrollToPos(next);
      setIndex(next);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, motionOK, count]);

  const onScroll = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    setIndex(Math.round(vp.scrollLeft / vp.clientWidth));
  };

  const onSlideKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1, true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1, true);
    }
  };

  return (
    <section
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.viewport} ref={viewportRef} id="hero-carousel-slides" onScroll={onScroll}>
        {SLIDES.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className={styles.slide}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            // Accessible name carries the slide's position, e.g. "…, slide 1 of 3".
            aria-label={`${s.headline}, slide ${i + 1} of ${count}`}
            // Only the current slide is interactive / in the tab + AT tree.
            inert={i !== index || undefined}
            onKeyDown={onSlideKeyDown}
          >
            <Image
              src={s.image}
              alt=""
              fill
              sizes="(max-width: 980px) 100vw, 940px"
              {...(i === 0 ? { priority: true } : { loading: 'eager' as const })}
              className={styles.bg}
            />
            <span className={styles.scrim} aria-hidden="true" />
            <span className={styles.overlay}>
              {s.cover && (
                <span className={styles.coverWrap} aria-hidden="true">
                  <Image src={s.cover} alt="" fill sizes="120px" priority={i === 0} className={styles.cover} />
                </span>
              )}
              <span className={`${styles.content} ${s.cover ? '' : styles.contentCentered}`}>
                <span className={styles.kicker}>{s.kicker}</span>
                <span className={styles.headline}>{s.headline}</span>
                <span className={styles.cta}>{s.cta}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Always-visible controls, kept out of the tab order (one tab stop for the
          whole carousel). Labeled so they still work via the screen-reader cursor;
          keyboard users navigate with the slide's arrow keys. */}
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => goTo(index - 1)}
        tabIndex={-1}
        aria-label="Previous slide"
        aria-controls="hero-carousel-slides"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => goTo(index + 1)}
        tabIndex={-1}
        aria-label="Next slide"
        aria-controls="hero-carousel-slides"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.dots}>
        {SLIDES.map((s, i) => (
          <button
            key={s.href}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            tabIndex={-1}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  );
}
