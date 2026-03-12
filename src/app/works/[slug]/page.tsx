import { notFound } from 'next/navigation';
import { getWork, getAllSlugs, getWorkSummaries } from '@/lib/works';
import { markdownToHtml } from '@/lib/markdown';
import { WorkHeader } from '@/components/WorkHeader';
import { ReadingCluster } from '@/components/ReadingCluster';
import { ChapterList } from '@/components/ChapterList';
import { ReadingHUD } from '@/components/ReadingHUD';
import { ReadingActions } from '@/components/ReadingActions';
import { ReturnToPositionFAB } from '@/components/ReturnToPositionFAB';
import { FocusEffect } from '@/components/FocusEffect';
import { MobileReadingBar } from '@/components/MobileReadingBar';
import { ReadingProvider } from '@/context/ReadingContext';
import { WorkSummary } from '@/types';
import styles from './reader.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
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
  const recommendations = getRecommendations(slug, meta.fandom);

  return (
    <div className={styles.page}>
      <FocusEffect />

      <ReadingProvider
        workMeta={meta}
        chapterTitles={chapterTitles}
        totalChapters={chapters.length}
        slug={slug}
      >
        {/* Always-visible floating HUD — left: back, right: bookmark */}
        <ReadingHUD />
        <ReadingActions />
        <ReturnToPositionFAB />
        <MobileReadingBar />

        {/* Main reading content */}
        <main className={styles.main}>
          {/* Work header — three-zone scroll animation */}
          <WorkHeader
            meta={meta}
            slug={slug}
            totalChapters={chapters.length}
          />

          {/* Sticky reading cluster — in-flow below header, sticks on scroll */}
          <ReadingCluster />

          {/* All chapters in one continuous scroll */}
          <ChapterList
            chapters={chapters}
            chapterHtmls={chapterHtmls}
            recommendations={recommendations}
            workMeta={meta}
          />
        </main>
      </ReadingProvider>
    </div>
  );
}
