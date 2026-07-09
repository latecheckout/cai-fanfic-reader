import { getWorkSummaries } from '@/lib/works';
import { BrowseHeader } from '@/components/BrowseHeader';
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
      <BrowseHeader />
      <main className="mx-auto max-w-[var(--browse-max-width)] px-6 pt-8 pb-12">
        <div className="mb-8 flex items-baseline gap-4">
          <h2 className="font-sans text-2xl font-medium tracking-[-0.015em] text-text">Characters</h2>
          <span className="font-mono text-xs text-secondary">{sorted.length} characters</span>
        </div>
        <CharactersList grouped={grouped} />
      </main>
    </div>
  );
}
