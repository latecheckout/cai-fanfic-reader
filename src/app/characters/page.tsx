import { getWorkSummaries } from '@/lib/works';
import { BrowseHeader } from '@/components/BrowseHeader';
import { CharactersList } from '@/components/CharactersList';
import styles from '../fandoms/fandoms.module.css';

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
      <main id="main-content" className={styles.main}>
        <div className={styles.titleRow}>
          <h1 className={styles.heading}>Characters</h1>
          <span className={styles.count}>{sorted.length} characters</span>
        </div>
        <CharactersList grouped={grouped} />
      </main>
    </div>
  );
}
