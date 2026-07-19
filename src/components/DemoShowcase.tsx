'use client';

import { AccountMenuBody, SignInMenuBody } from './AccountMenu';
import { EmptyState, EmptyStateCard } from './EmptyState';
import { TAB_EMPTY } from './LibraryShell';
import { SkeletonCard } from './SkeletonCard';
import { ContinueCardSkeleton } from './ContinueCard';
import { SectionHeader } from './RailSection';
import { POPOVER_PANEL } from './popoverChrome';
import { MagnifierIcon } from './icons';

/**
 * /demo — internal showcase of states you can't reach by casually browsing:
 * the signed-in account menu (sign out lives here; there is no separate
 * sign-in UI yet — the session is @DUMMY mocked), the empty-state cards that
 * fill sections with no content, and the loading skeletons that only flash
 * briefly. Each block renders the REAL component, not a copy, so this page
 * stays true as they evolve.
 */
/** One-sentence "where does this show up" caption under a demo block. */
function WhereNote({ children }: { children: React.ReactNode }) {
  return <p className="m-0 font-sans text-[13px] italic text-secondary">{children}</p>;
}

export function DemoShowcase() {
  return (
    <div className="mx-auto flex max-w-[880px] flex-col gap-14 px-6 py-12">
      <header>
        <h1 className="m-0 font-serif text-[28px] font-medium tracking-[-0.01em] text-text">
          Component demo
        </h1>
        <p className="mt-2 font-sans text-[15px] text-secondary">
          Hidden states, rendered statically: account menu, empty-state cards, loading skeletons.
        </p>
      </header>

      {/* ── Account (signed in) ─────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Account menu"
          subtitle="Both session states of the header account dropdown. The session is mocked (@DUMMY) — the sign-in CTA is the @WIRE auth entry point."
        />
        <div className="flex flex-wrap items-start gap-10">
          <div className="flex flex-col items-start gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-secondary">
              Signed out
            </span>
            <div className={`${POPOVER_PANEL} w-64 p-2`}>
              <SignInMenuBody />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-secondary">
              Signed in
            </span>
            <div className={`${POPOVER_PANEL} w-56 p-2`}>
              <AccountMenuBody onClose={() => {}} />
            </div>
          </div>
        </div>
        <WhereNote>
          Shows up under the avatar bubble at the far right of the site header on every page, and
          in the reading page&rsquo;s top HUD.
        </WhereNote>
      </section>

      {/* ── Empty states ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Empty-state cards"
          subtitle="The dashed placeholder cards that fill a section when it has no content — library tabs + browse no-results."
        />
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {(Object.keys(TAB_EMPTY) as (keyof typeof TAB_EMPTY)[]).map((tab) => (
            <EmptyStateCard key={tab} {...TAB_EMPTY[tab]} ctaHref="/browse" />
          ))}
          <EmptyStateCard
            icon={<MagnifierIcon width={18} height={18} />}
            title="No works match."
            body="Try removing a filter or loosening your search. The whole archive is one click away."
            ctaLabel="Clear all filters"
            ctaHref="/browse"
          />
        </div>
        <WhereNote>
          The first three fill an empty Library tab (Continuing / Bookmarked / Completed); the
          fourth fills the Browse results grid when active filters match nothing.
        </WhereNote>
        <div className="rounded-card border border-border">
          {/* Lightweight variant — shown in a library tab that HAS content but
              whose search/filter matched nothing (LibraryShell), vs the dashed
              cards above which mean the surface itself is empty. */}
          <EmptyState title="No matches.">
            Used when a library tab has content but your search matched none of it.
          </EmptyState>
        </div>
        <WhereNote>
          Shows up inside a Library tab&rsquo;s results area when the tab has works but your scoped
          search matches none of them.
        </WhereNote>
      </section>

      {/* ── Loading skeletons ───────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Loading skeletons"
          subtitle="Normally flash for a beat while filters settle or reading state hydrates."
        />
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
        <WhereNote>
          Shows up in the Browse and Library results grids for a beat whenever the active filters
          change.
        </WhereNote>
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }, (_, i) => (
            <ContinueCardSkeleton key={i} />
          ))}
        </div>
        <WhereNote>
          Shows up in the home page&rsquo;s &ldquo;Continue reading&rdquo; rail while your local
          reading state hydrates.
        </WhereNote>
      </section>
    </div>
  );
}
