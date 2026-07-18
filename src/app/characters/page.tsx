import { Suspense } from 'react';
import { getWorkSummaries } from '@/lib/works';
import { SiteHeader } from '@/components/SiteHeader';
import { SectionHeader } from '@/components/RailSection';
import { CharactersList } from '@/components/CharactersList';

export const metadata = {
  title: 'Characters — c.ai Fanfic',
};

export default function CharactersPage() {
  const works = getWorkSummaries();

  // Build character → count map
  const characterMap = new Map<string, number>();
  works.forEach((work) => {
    work.meta.characters.forEach((c) => {
      characterMap.set(c, (characterMap.get(c) ?? 0) + 1);
    });
  });

  // Sort alphabetically
  const sorted = Array.from(characterMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  // Group by first letter
  const grouped: { letter: string; items: { name: string; count: number }[] }[] = [];
  sorted.forEach(([name, count]) => {
    const letter = name[0]?.toUpperCase() ?? '#';
    const last = grouped[grouped.length - 1];
    if (last && last.letter === letter) {
      last.items.push({ name, count });
    } else {
      grouped.push({ letter, items: [{ name, count }] });
    }
  });

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-[var(--browse-max-width)] px-6 pt-8 pb-12 max-md:px-4 max-md:pt-5">
        <h1 className="visually-hidden">Characters</h1>
        <div className="mb-8">
          <SectionHeader title="Characters" subtitle="Everyone the stories are about" />
        </div>
        {/* CharactersList reads useSearchParams (q/sort) — the boundary keeps
            the page statically renderable. */}
        <Suspense>
          <CharactersList grouped={grouped} />
        </Suspense>
      </main>
    </div>
  );
}
