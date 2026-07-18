import { getWorkSummaries } from '@/lib/works';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata = {
  title: 'Fandoms — Archive of Our Stories',
};

export default function FandomsPage() {
  const works = getWorkSummaries();

  // Build fandom → count map
  const fandomMap = new Map<string, number>();
  works.forEach((work) => {
    work.meta.fandom.forEach((f) => {
      fandomMap.set(f, (fandomMap.get(f) ?? 0) + 1);
    });
  });

  // Sort alphabetically
  const fandoms = Array.from(fandomMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-[var(--browse-max-width)] px-6 pt-8 pb-12">
        <div className="mb-8 flex items-baseline gap-4">
          <h1 className="font-sans text-2xl font-medium tracking-[-0.015em] text-text">Fandoms</h1>
          <span className="font-mono text-xs text-secondary">{fandoms.length} fandoms</span>
        </div>

        {fandoms.length === 0 ? (
          <p className="font-sans text-sm text-secondary">No fandoms found.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {fandoms.map(([fandom, count]) => (
              <li key={fandom} className="border-b border-border last:border-b-0">
                <a
                  href={`/browse?fandom=${encodeURIComponent(fandom)}`}
                  className="flex items-baseline justify-between gap-6 py-4 text-inherit no-underline transition-opacity duration-[var(--transition-micro)] hover:opacity-65"
                >
                  <span className="font-sans text-lg font-normal text-text">{fandom}</span>
                  <span className="shrink-0 font-mono text-[11px] text-secondary">
                    {count} {count === 1 ? 'work' : 'works'}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
