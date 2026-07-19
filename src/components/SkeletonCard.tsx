/**
 * SkeletonCard — loading placeholder shaped like a work list card, shown by
 * WorkGrid while filters settle. Flat token-backed bars with a gentle opacity
 * pulse (same treatment as ContinueCardSkeleton); everything re-resolves live
 * on theme change. Card bg mirrors the real card (WorkCardCover): white-mixed
 * in light themes, plain bg-card in dark.
 */
const CARD =
  'relative flex min-h-[300px] flex-col gap-[10px] p-3 rounded-card border border-card-border ' +
  'bg-[color-mix(in_srgb,var(--card-bg),#fff_35%)] theme-dark:bg-card opacity-0 ' +
  'animate-[fadeIn_200ms_var(--ease-out-expo)_forwards]';
const LINE = 'rounded-[3px] bg-border-strong animate-[caiSkeletonPulse_1.4s_ease-in-out_infinite]';

export function SkeletonCard({ index }: { index: number }) {
  return (
    <div className={CARD} style={{ animationDelay: `${index * 40}ms` }}>
      <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
        {/* badges */}
        <div className={LINE} style={{ width: '40%', height: '10px' }} />
        {/* title */}
        <div className={LINE} style={{ width: '82%', height: '16px' }} />
        {/* byline */}
        <div className={LINE} style={{ width: '28%', height: '11px' }} />
        {/* summary */}
        <div className={LINE} style={{ width: '92%', height: '12px' }} />
        {/* stats / metrics */}
        <div className={LINE} style={{ width: '46%', height: '12px' }} />
      </div>
    </div>
  );
}
