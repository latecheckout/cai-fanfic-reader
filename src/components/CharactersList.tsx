'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePendingParams } from '@/hooks/usePendingParams';
import { ScopedSearchInput } from './ScopedSearchInput';
import { SortDropdown, type SortOption } from './SortDropdown';

interface CharacterGroup {
  letter: string;
  items: { name: string; count: number }[];
}

interface Props {
  grouped: CharacterGroup[];
}

// Letter-range jumps — the control filters the A–Z list down to a range so a
// user hunting a specific name lands near it fast. 'all' = the whole list.
const CHARACTER_RANGES: (SortOption & { from?: string; to?: string })[] = [
  { value: 'all', label: 'All A–Z' },
  { value: 'a-e', label: 'A to E', from: 'A', to: 'E' },
  { value: 'f-j', label: 'F to J', from: 'F', to: 'J' },
  { value: 'k-o', label: 'K to O', from: 'K', to: 'O' },
  { value: 'p-t', label: 'P to T', from: 'P', to: 'T' },
  { value: 'u-z', label: 'U to Z', from: 'U', to: 'Z' },
];

/** One letter section: gutter label + its rows. Strokes run BETWEEN sections
    (border-t on all but the first) plus a closing rule on the last. */
function LetterGroup({ letter, items }: CharacterGroup) {
  return (
    // Mobile: letter label stacks on top of its rows instead of a side gutter.
    <div className="flex gap-6 py-5 border-t border-border first:border-t-0 first:pt-0 last:border-b max-md:flex-col max-md:gap-2">
      <div className="w-6 shrink-0 pt-[3px] font-mono text-[13px] font-semibold tracking-[0.06em] text-secondary opacity-50 max-md:w-auto max-md:pt-0">
        {letter}
      </div>
      <ul className="m-0 min-w-0 flex-1 list-none p-0">
        {items.map(({ name, count }) => (
          <CharacterRow key={name} name={name} count={count} />
        ))}
      </ul>
    </div>
  );
}

/** One character row — name + work count, popover-row hover. */
function CharacterRow({ name, count }: { name: string; count: number }) {
  return (
    <li className="block">
      <Link
        href={`/browse?character=${encodeURIComponent(name)}&from=characters`}
        // Same hover treatment as the popover menu rows (MENU_ROW): soft bg
        // fill on a rounded row. Negative mx keeps the text on the column
        // grid while the fill bleeds past it.
        className="-mx-2.5 flex items-baseline justify-between gap-6 rounded-xl px-2.5 py-2 text-inherit no-underline transition-colors hover:bg-overlay-soft"
      >
        <span className="min-w-0 font-sans text-[17px] font-normal text-text">{name}</span>
        <span className="shrink-0 font-mono text-[13px] text-secondary">
          {count} {count === 1 ? 'work' : 'works'}
        </span>
      </Link>
    </li>
  );
}

export function CharactersList({ grouped }: Props) {
  // Query + range are URL-driven (shared toolbar components) — shareable and
  // back-button safe; the filtering itself stays client-side.
  const searchParams = useSearchParams();
  const { readParams, pushParams } = usePendingParams('/characters');
  const query = searchParams.get('q') ?? '';
  const rangeValue = searchParams.get('range') ?? 'all';
  const range = CHARACTER_RANGES.find((r) => r.value === rangeValue) ?? CHARACTER_RANGES[0];

  const q = query.trim().toLowerCase();

  // Letter-range filter first (group letters are already uppercase; non-A–Z
  // groups like '#' only show under 'all'), then the text query within it.
  const inRange = range.from
    ? grouped.filter((g) => g.letter >= range.from! && g.letter <= range.to!)
    : grouped;
  const filtered = q
    ? inRange
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => item.name.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length > 0)
    : inRange;

  const totalVisible = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      {/* ── Toolbar: shared scoped search (live) + sort ── */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex min-w-0 flex-1 items-center">
            <ScopedSearchInput basePath="/characters" placeholder="Search characters…" live />
          </div>
          {q && (
            <span className="shrink-0 font-mono text-[13px] text-secondary max-md:hidden">
              {totalVisible} {totalVisible === 1 ? 'character' : 'characters'}
            </span>
          )}
        </div>
        <SortDropdown
          options={CHARACTER_RANGES}
          currentValue={range.value}
          onChange={(v) => {
            const params = readParams();
            if (v === 'all') params.delete('range');
            else params.set('range', v);
            pushParams(params);
          }}
        />
      </div>

      {/* ── List ── */}
      {totalVisible === 0 ? (
        <p className="py-8 font-sans text-base text-secondary">
          {q ? <>No characters match &ldquo;{query}&rdquo;.</> : <>No characters in {range.label}.</>}
        </p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((group) => (
            <LetterGroup key={group.letter} letter={group.letter} items={group.items} />
          ))}
        </div>
      )}
    </>
  );
}
