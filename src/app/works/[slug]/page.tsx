import { notFound } from 'next/navigation';
import { getWork, getAllSlugs, getWorkSummaries, toClientWorks } from '@/lib/works';
import { markdownToHtml } from '@/lib/markdown';
import { ReadingCluster } from '@/components/ReadingCluster';
import { ChapterList } from '@/components/ChapterList';
import { ReadingHUD } from '@/components/ReadingHUD';
import { ReadingActions } from '@/components/ReadingActions';
import { FocusEffect } from '@/components/FocusEffect';
import { ReadingProvider } from '@/context/ReadingContext';
import { WorkSummary } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Eased HUD scrim. A plain 2-stop `bg → transparent` gradient has a visible
 * slope discontinuity at its end stop (Mach banding) — on iOS Safari the fixed
 * band shows a hard line with text scrolling under it. Smoothstep alpha stops
 * ease the falloff to imperceptible, and a short solid hold at the edge keeps
 * content from bleeding through right under the HUD buttons. color-mix keeps
 * every stop on the theme's live --bg.
 */
function scrimGradient(dir: 'bottom' | 'top'): string {
  // smoothstep(1→0) sampled every 12.5% across the eased zone
  const stops = [95.6, 84.4, 68.4, 50, 31.6, 15.6, 4.4]
    .map((pct, i) => `color-mix(in srgb, var(--bg) ${pct}%, transparent) ${12 + (i + 1) * 11}%`)
    .join(', ');
  return `linear-gradient(to ${dir}, var(--bg) 0%, var(--bg) 12%, ${stops}, transparent 100%)`;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return { title: 'Not Found' };
  const description = work.meta.summary
    ? work.meta.summary.slice(0, 160)
    : `A ${work.meta.rating} fanfic by ${work.meta.author} · ${work.meta.words.toLocaleString()} words`;
  return {
    title: `${work.meta.title} by ${work.meta.author}`,
    description,
    openGraph: {
      title: `${work.meta.title} by ${work.meta.author}`,
      description,
      siteName: 'c.ai Fanfic',
    },
  };
}

// @TODO-DEV — getRecommendations() is a local fallback: same fandom, different slug.
//             Replace with: GET /works/:slug/recommendations once the API is available.
//             Fails silently (returns []) — EndOfStory handles empty gracefully.
//             See: .claude/docs/wiring-guide.md#5-recommendations
function getRecommendations(slug: string, fandom: string[]): WorkSummary[] {
  try {
    const allWorks = getWorkSummaries();
    // Same fandom, different slug
    const sameFandom = allWorks.filter(
      (w) =>
        w.slug !== slug &&
        w.meta.fandom.some((f) => fandom.includes(f))
    );
    if (sameFandom.length >= 2) return sameFandom.slice(0, 3);
    // Fall back to any works
    return allWorks.filter((w) => w.slug !== slug).slice(0, 2);
  } catch {
    return [];
  }
}

export default async function ReaderPage({ params }: PageProps) {
  const { slug } = await params;

  const work = getWork(slug);
  if (!work) notFound();

  const { meta, chapters } = work;

  // Render all chapters to HTML in parallel
  const chapterHtmls = await Promise.all(
    chapters.map((c) => markdownToHtml(c.content))
  );

  const chapterTitles = chapters.map((c) => c.title);
  const lockedChapters = chapters.filter((c) => c.locked).map((c) => c.index);
  const recommendations = getRecommendations(slug, meta.fandom);

  return (
    <div className="min-h-screen">
      <FocusEffect />

      <ReadingProvider
        workMeta={meta}
        chapterTitles={chapterTitles}
        totalChapters={chapters.length}
        lockedChapters={lockedChapters}
        slug={slug}
      >
        {/* Fixed HUD, split in two layers: gradient scrim below, buttons above. */}
        <div
          className="pointer-events-none fixed inset-x-0 top-0 h-[72px] z-[var(--z-reading-bar)]"
          style={{ background: scrimGradient('bottom') }}
          aria-hidden="true"
        />
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-reading-cluster)] flex items-start justify-between p-4">
          <ReadingHUD />
          <ReadingActions />
        </div>
        {/* Mirror scrim under the bottom pill cluster */}
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 h-[72px] z-[var(--z-reading-bar)]"
          style={{ background: scrimGradient('top') }}
          aria-hidden="true"
        />

        {/* Main reading content — no opacity animation here: it would create a
            stacking context and trap the sticky cluster's z-index below the bar. */}
        {/* Mobile bottom padding clears the bottom pill cluster (44px pills on mobile) */}
        <main className="p-0 max-md:pb-[calc(44px+20px+var(--safe-bottom)+24px)]">
          {/* Work-level page heading — chapter titles are h2s (ChapterContent /
              LockedChapterCard), so the outline is work → chapters. */}
          <h1 className="visually-hidden">{meta.title}</h1>

          {/* Reading cluster — fixed bottom-center pills: title + chapter + "Your place" */}
          <ReadingCluster />

          {/* All chapters in one continuous scroll */}
          <ChapterList
            chapters={chapters}
            chapterHtmls={chapterHtmls}
            recommendations={toClientWorks(recommendations)}
            workMeta={meta}
          />
        </main>
      </ReadingProvider>
    </div>
  );
}
