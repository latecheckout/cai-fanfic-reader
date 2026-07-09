'use client';

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { CarouselArrow } from './CarouselArrow';

interface Props {
  /** The rail frame class (position:relative + edge fades) from the caller's module. */
  railClassName: string;
  /** The horizontal scroller class from the caller's module. */
  rowClassName: string;
  /** Server-rendered cards, passed straight through. */
  children: ReactNode;
}

/**
 * Wraps a horizontal card rail with prev/next scroll arrows (in addition to
 * swipe). Arrows reveal on hover (pointer devices only) and disable at the
 * ends. The caller's own `.rail`/`.row` classes are applied so the existing
 * edge-fade + scroll-snap CSS is preserved; this only adds the buttons + ref.
 */
export function RailViewport({ railClassName, rowClassName, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className={railClassName}>
      <CarouselArrow
        direction="left"
        onClick={() => scroll(-1)}
        disabled={atStart}
        label="Scroll left"
        positionClassName="left-2"
      />

      <div ref={ref} className={rowClassName}>
        {children}
      </div>

      <CarouselArrow
        direction="right"
        onClick={() => scroll(1)}
        disabled={atEnd}
        label="Scroll right"
        positionClassName="right-2"
      />
    </div>
  );
}
