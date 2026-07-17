import { redirect } from 'next/navigation';
import { getWorkSummaries } from '@/lib/works';
import { buildShelves, buildCreators } from '@/lib/shelves';
import { SiteHeader } from '@/components/SiteHeader';
import { BrowseHome } from '@/components/BrowseHome';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Back-compat: the catalog used to live at /. Any filter/search/sort param
  // means the visitor wants the results surface, which is now /browse — send
  // the whole query string along so old bookmarks and links keep working.
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) qs.append(key, v);
  }
  if ([...qs.keys()].length > 0) {
    redirect(`/browse?${qs.toString()}`);
  }

  const allWorks = getWorkSummaries();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="relative mx-auto max-w-[var(--browse-max-width)] px-6 pt-8 pb-[calc(128px+var(--safe-bottom))] max-md:px-4 max-md:pt-5">
        <h1 className="visually-hidden">c.ai Fanfic — Home</h1>

        {/* Editorial zone. The full filterable catalog lives at /browse; the
            global mode toggle restyles every card via html[data-mode]. */}
        <BrowseHome
          shelves={buildShelves(allWorks)}
          creators={buildCreators(allWorks)}
          covers={Object.fromEntries(allWorks.map((w) => [w.slug, w.meta.cover]))}
        />
      </main>
    </div>
  );
}
