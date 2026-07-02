'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useReading } from '@/context/ReadingContext';
import { ratingClass } from '@/lib/utils';
import { MetadataOverlay } from './MetadataOverlay';
import { ChapterPanel } from './ChapterPanel';
import { PrefsPanel } from './PrefsPanel';
import styles from '@/styles/components/ReadingCluster.module.css';

type PanelName = 'metadata' | 'chapter' | 'prefs';

// ── Target rect calculator — called at open-time, never cached ──────────────
function getTargetRect(
  name: PanelName,
  pillRect: DOMRect,
  context: { chapterCount: number }
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (name === 'metadata') {
    const w = Math.min(540, vw - 48);
    const h = Math.min(600, vh - 80);
    const top  = Math.round((vh - h) / 2);
    const left = Math.round((vw - w) / 2);
    return { left, top, width: w, height: h };
  }

  if (name === 'chapter') {
    // Initial estimate: 48px header + 46px per row (allows for title wrapping) + 16px list padding
    const contentH = 48 + context.chapterCount * 46 + 16;
    const h = Math.min(contentH, vh * 0.7);
    const w = Math.max(280, pillRect.width + 40);
    const midX = pillRect.left + pillRect.width / 2;
    const left = Math.max(12, Math.min(midX - w / 2, vw - w - 12));
    return { left, top: pillRect.bottom + 8, width: w, height: h };
  }

  // prefs — 260×420, hugs content (header 48 + font section 86 + gap 20 + 3 existing sections 266)
  const w = 260;
  const h = 420;
  const midX = pillRect.left + pillRect.width / 2;
  const left = Math.max(12, Math.min(midX - w / 2, vw - w - 12));
  return { left, top: pillRect.bottom + 10, width: w, height: h };
}

// ────────────────────────────────────────────────────────────────────────────

export function ReadingCluster() {
  const {
    workMeta, chapterTitles, totalChapters, activeChapterIndex, scrollToChapter,
    externalPrefsRef, prefsToggleFnRef,
  } = useReading();
  const [scrollPct, setScrollPct] = useState(0);
  const [activePanel, setActivePanel] = useState<PanelName | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ref tracks the active panel synchronously (avoids stale-closure issues)
  const activePanelRef = useRef<PanelName | null>(null);

  // Pill refs
  const titlePillRef   = useRef<HTMLButtonElement>(null);
  const chapterPillRef = useRef<HTMLButtonElement>(null);
  const prefsPillRef   = useRef<HTMLButtonElement>(null);

  // Panel refs — forwarded to morph panel components
  const metaPanelRef    = useRef<HTMLDivElement>(null);
  const chapterPanelRef = useRef<HTMLDivElement>(null);
  const prefsPanelRef   = useRef<HTMLDivElement>(null);

  // a11y: the panels are always mounted (portaled) for the morph animation, so
  // while closed they'd otherwise leave their controls in the tab order + the
  // accessibility tree (phantom chapter/prefs/metadata controls on the page).
  // Mark every panel `inert` except the open one. The open panel's inert clears
  // here on the activePanel change — before openPanel's timed focus-move runs.
  useEffect(() => {
    if (metaPanelRef.current)    metaPanelRef.current.inert    = activePanel !== 'metadata';
    if (chapterPanelRef.current) chapterPanelRef.current.inert = activePanel !== 'chapter';
    if (prefsPanelRef.current)   prefsPanelRef.current.inert   = activePanel !== 'prefs';
  }, [activePanel, isMounted]);

  // Backdrop ref
  const backdropRef = useRef<HTMLDivElement>(null);

  // Cluster outer ref — for measuring natural top position
  const clusterRef = useRef<HTMLDivElement>(null);
  const naturalTopRef = useRef<number | null>(null);

  const rClass = ratingClass(workMeta.rating);

  // ── Mark client mount (prevents SSR hydration mismatch for portal) ──────────
  useEffect(() => { setIsMounted(true); }, []);

  // ── Measure natural top after mount ────────────────────────────────────────

  useEffect(() => {
    if (clusterRef.current) {
      naturalTopRef.current = clusterRef.current.getBoundingClientRect().top + window.scrollY;
    }
  }, []);

  // ── Sticky detection ───────────────────────────────────────────────────────

  useEffect(() => {
    function onStickyCheck() {
      if (naturalTopRef.current === null) return;
      // 24px accounts for the padding-top before the bubbles
      setIsSticky(window.scrollY >= naturalTopRef.current - 24);
    }
    window.addEventListener('scroll', onStickyCheck, { passive: true });
    return () => window.removeEventListener('scroll', onStickyCheck);
  }, []);

  // ── Register prefs toggle fn so ReadingActions can trigger it ─────────────

  useEffect(() => {
    prefsToggleFnRef.current = () => togglePanel('prefs');
    return () => { prefsToggleFnRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getPillEl(name: PanelName): HTMLButtonElement | null {
    if (name === 'metadata') return titlePillRef.current;
    if (name === 'chapter')  return chapterPillRef.current;
    // Prefer external button (ReadingActions) as the morph origin/destination for prefs
    return externalPrefsRef.current ?? prefsPillRef.current;
  }

  function getPanelEl(name: PanelName): HTMLDivElement | null {
    if (name === 'metadata') return metaPanelRef.current;
    if (name === 'chapter')  return chapterPanelRef.current;
    return prefsPanelRef.current;
  }

  // ── openPanel — 8-step morph sequence ─────────────────────────────────────

  function openPanel(name: PanelName) {
    const pillEl  = getPillEl(name);
    const panelEl = getPanelEl(name);
    if (!pillEl || !panelEl) return;

    // 1. Read pill bounding rect BEFORE any DOM changes
    const pillRect = pillEl.getBoundingClientRect();

    // Update tracked state
    activePanelRef.current = name;
    setActivePanel(name);

    // 2. Disable transition — panel snaps from resting position to pill instantly
    panelEl.style.transition = 'none';

    // 3. Snap panel to pill position (pill shape, same position, opacity 1)
    panelEl.style.top          = `${pillRect.top}px`;
    panelEl.style.left         = `${pillRect.left}px`;
    panelEl.style.width        = `${pillRect.width}px`;
    panelEl.style.height       = `${pillRect.height}px`;
    panelEl.style.borderRadius = '999px';
    panelEl.style.opacity      = '1';
    panelEl.setAttribute('data-state', 'open');
    panelEl.removeAttribute('data-content');

    // 4. Fade pill out (CSS reads data-expanding → opacity 0, scale 0.92)
    pillEl.setAttribute('data-expanding', 'true');

    // 5. Force reflow — commits snapped position as the animation start frame
    void panelEl.offsetHeight;

    // 6. Apply spring transition + target rect → morph begins
    const target = getTargetRect(name, pillRect, { chapterCount: totalChapters });
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip morph — snap to target, fade in only
      panelEl.style.transition   = 'none';
      panelEl.style.top          = `${target.top}px`;
      panelEl.style.left         = `${target.left}px`;
      panelEl.style.width        = `${target.width}px`;
      panelEl.style.height       = `${target.height}px`;
      panelEl.style.borderRadius = '18px';
      void panelEl.offsetHeight;
      panelEl.style.transition   = 'opacity 80ms ease';
    } else {
      panelEl.style.transition = [
        'top 320ms var(--spring)',
        'left 320ms var(--spring)',
        'width 320ms var(--spring)',
        'height 320ms var(--spring)',
        'border-radius 320ms var(--spring)',
      ].join(', ');
      panelEl.style.top          = `${target.top}px`;
      panelEl.style.left         = `${target.left}px`;
      panelEl.style.width        = `${target.width}px`;
      panelEl.style.height       = `${target.height}px`;
      panelEl.style.borderRadius = '18px';
    }

    // 7. Reveal content after morph is well underway
    setTimeout(() => {
      panelEl.setAttribute('data-content', 'visible');
      // a11y: move keyboard focus into the opened panel
      if (activePanelRef.current === name) {
        const f = panelEl.querySelector<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
        );
        f?.focus();
      }
    }, prefersReducedMotion ? 80 : 200);

    // For chapter panel: snap height to actual content after morph (handles title wrapping)
    if (name === 'chapter' && !prefersReducedMotion) {
      setTimeout(() => {
        if (activePanelRef.current !== name) return;
        const headerEl = panelEl.firstElementChild?.firstElementChild as HTMLElement | null;
        const listEl   = panelEl.firstElementChild?.children[1] as HTMLElement | null;
        if (!headerEl || !listEl) return;
        const borderH = panelEl.offsetHeight - panelEl.clientHeight;
        const neededH = headerEl.offsetHeight + listEl.scrollHeight + borderH;
        const maxH    = Math.floor(window.innerHeight * 0.7);
        const finalH  = Math.min(neededH, maxH);
        panelEl.style.transition = 'height 100ms ease';
        panelEl.style.height     = `${finalH}px`;
      }, 340); // after 320ms spring morph
    }

    // 8. Show backdrop + dim reading content
    backdropRef.current?.setAttribute('data-visible', 'true');
    document.body.classList.add('panel-open');
  }

  // ── closeAll — 5-step collapse sequence ───────────────────────────────────

  function closeAll() {
    const name = activePanelRef.current;
    if (!name) return;

    // Clear state immediately so togglePanel can queue a new open after 60ms
    activePanelRef.current = null;
    setActivePanel(null);

    const pillEl  = getPillEl(name);
    const panelEl = getPanelEl(name);
    if (!pillEl || !panelEl) return;

    // a11y: return keyboard focus to the trigger when the panel closes
    pillEl.focus?.();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Remove content attribute → content fades out immediately (CSS transition)
    panelEl.removeAttribute('data-content');

    if (prefersReducedMotion) {
      panelEl.style.transition = 'opacity 80ms ease';
      panelEl.style.opacity    = '0';
      pillEl.removeAttribute('data-expanding');
      setTimeout(() => {
        panelEl.removeAttribute('data-state');
        panelEl.style.top          = '-9999px';
        panelEl.style.left         = '-9999px';
        panelEl.style.width        = '0';
        panelEl.style.height       = '0';
        panelEl.style.transition   = '';
        panelEl.style.opacity      = '';
        panelEl.style.borderRadius = '';
        backdropRef.current?.removeAttribute('data-visible');
        document.body.classList.remove('panel-open');
      }, 100);
      return;
    }

    // 2. Set collapse transition
    panelEl.style.transition = [
      'top 240ms var(--collapse)',
      'left 240ms var(--collapse)',
      'width 240ms var(--collapse)',
      'height 240ms var(--collapse)',
      'border-radius 240ms var(--collapse)',
      'opacity 160ms ease 80ms',
    ].join(', ');

    // 3. Animate panel back to pill position
    const pillRect = pillEl.getBoundingClientRect();
    panelEl.style.top          = `${pillRect.top}px`;
    panelEl.style.left         = `${pillRect.left}px`;
    panelEl.style.width        = `${pillRect.width}px`;
    panelEl.style.height       = `${pillRect.height}px`;
    panelEl.style.borderRadius = '999px';
    panelEl.style.opacity      = '0';

    // 4. Pill re-emerges at 120ms (fluid overlap with collapse)
    setTimeout(() => {
      pillEl.removeAttribute('data-expanding');
    }, 120);

    // 5. Full cleanup after collapse animation (300ms)
    setTimeout(() => {
      panelEl.removeAttribute('data-state');
      panelEl.style.top          = '-9999px';
      panelEl.style.left         = '-9999px';
      panelEl.style.width        = '0';
      panelEl.style.height       = '0';
      panelEl.style.transition   = '';
      panelEl.style.opacity      = '';
      panelEl.style.borderRadius = '';
      backdropRef.current?.removeAttribute('data-visible');
      document.body.classList.remove('panel-open');
    }, 300);
  }

  // ── togglePanel — open / switch / close ───────────────────────────────────

  function togglePanel(name: PanelName) {
    const current = activePanelRef.current;
    if (current === name) {
      // Same panel → close
      closeAll();
    } else if (current !== null) {
      // Different panel open → close then open new (60ms overlap creates fluid feel)
      closeAll();
      setTimeout(() => openPanel(name), 60);
    } else {
      // No panel open → open
      openPanel(name);
    }
  }

  // ── Track scroll for progress bar ─────────────────────────────────────────

  useEffect(() => {
    function onScroll() {
      const { scrollY, innerHeight } = window;
      const { scrollHeight } = document.documentElement;
      const pct =
        scrollHeight - innerHeight > 0
          ? (scrollY / (scrollHeight - innerHeight)) * 100
          : 0;
      setScrollPct(Math.min(100, Math.max(0, pct)));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Keyboard: Escape closes, arrows navigate chapters ─────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // a11y: trap Tab within an open panel (focus cannot leave the dialog)
      if (e.key === 'Tab' && activePanelRef.current) {
        const panelEl = getPanelEl(activePanelRef.current);
        if (panelEl) {
          const f = Array.from(
            panelEl.querySelectorAll<HTMLElement>(
              'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null);
          if (f.length) {
            const first = f[0];
            const last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
        return;
      }
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        scrollToChapter(activeChapterIndex - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'k') {
        e.preventDefault();
        scrollToChapter(activeChapterIndex + 1);
      } else if (e.key === 'Escape') {
        closeAll(); // reads from ref — safe in stale closure
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeChapterIndex, scrollToChapter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resize: snap open panel to new target without animation ───────────────

  useEffect(() => {
    function handleResize() {
      const name = activePanelRef.current;
      if (!name) return;
      const pillEl  = getPillEl(name);
      const panelEl = getPanelEl(name);
      if (!pillEl || !panelEl) return;

      const pillRect = pillEl.getBoundingClientRect();
      const target   = getTargetRect(name, pillRect, { chapterCount: totalChapters });

      // Snap immediately — no animation on resize
      panelEl.style.transition   = 'none';
      panelEl.style.top          = `${target.top}px`;
      panelEl.style.left         = `${target.left}px`;
      panelEl.style.width        = `${target.width}px`;
      panelEl.style.height       = `${target.height}px`;
      void panelEl.offsetHeight;
      panelEl.style.transition   = '';
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chapterTitle = chapterTitles[activeChapterIndex] ?? '';

  return (
    <>
      {/* Sticky cluster wrapper — sticks to top when scrolled past */}
      <div ref={clusterRef} className={styles.clusterOuter}>
        <div className={styles.cluster}>
          {/* Title bubble → metadata panel — hidden until sticky */}
          <button
            ref={titlePillRef}
            className={`${styles.bubble} ${styles.titleBubble} ${!isSticky ? styles.titleHidden : ''}`}
            onClick={() => togglePanel('metadata')}
            aria-label="View work details"
            aria-haspopup="dialog"
          >
            <span className={styles.titleText}>{workMeta.title}</span>
          </button>

          {/* Chapter bubble → chapter panel */}
          {totalChapters > 1 && (
            <button
              ref={chapterPillRef}
              className={`${styles.bubble} ${styles.chapterBubble}`}
              onClick={() => togglePanel('chapter')}
              data-active={activePanel === 'chapter' ? 'true' : undefined}
              aria-label="Chapter navigation"
              aria-haspopup="dialog"
            >
              <span className={styles.chapterNum}>{activeChapterIndex + 1}</span>
              <span className={styles.chapterDivider} aria-hidden="true" />
              <span className={styles.chapterName}>{chapterTitle}</span>
              <svg
                className={styles.chevron}
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 4L5 7L8 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Embedded progress bar */}
              <span
                className={`${styles.progressBar} ${
                  styles[`progress_${rClass}` as keyof typeof styles]
                }`}
                style={{ width: `${scrollPct}%` }}
                aria-hidden="true"
              />
            </button>
          )}

          {/* Prefs bubble — hidden, morph still uses prefsPillRef as fallback */}
          <button
            ref={prefsPillRef}
            className={`${styles.bubble} ${styles.prefsBubble} ${styles.prefsBubbleHidden}`}
            onClick={() => togglePanel('prefs')}
            data-active={activePanel === 'prefs' ? 'true' : undefined}
            aria-label="Reading preferences"
            aria-hidden="true"
            tabIndex={-1}
          >
            <svg
              className={styles.sliderIcon}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <line x1="2" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="5" cy="4" r="1.5" fill="currentColor" />
              <line x1="2" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="9" cy="8" r="1.5" fill="currentColor" />
              <line x1="2" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {isMounted && createPortal(
        <>
          <div ref={backdropRef} data-panel-backdrop className={styles.backdrop} onClick={closeAll} />
          <MetadataOverlay ref={metaPanelRef} onClose={closeAll} />
          <ChapterPanel
            ref={chapterPanelRef}
            chapters={chapterTitles}
            activeIndex={activeChapterIndex}
            onSelect={(i) => { scrollToChapter(i); closeAll(); }}
            onClose={closeAll}
          />
          <PrefsPanel ref={prefsPanelRef} onClose={closeAll} />
        </>,
        document.body
      )}
    </>
  );
}
