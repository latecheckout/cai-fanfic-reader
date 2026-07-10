/**
 * SkeletonCard — loading placeholder shaped like a work list card, shown by
 * WorkGrid while filters settle. The shimmer bar is a base→highlight→base
 * gradient wider than the bar; sweeping its background-position slides a light
 * band across (caiSkeletonShimmer).
 */
const CARD =
  'relative flex min-h-[300px] flex-col gap-[10px] p-3 rounded-card ' +
  'bg-[color-mix(in_srgb,var(--card-bg),#fff_35%)] opacity-0 ' +
  'animate-[fadeIn_200ms_var(--ease-out-expo)_forwards]';
const LINE =
  'rounded-[3px] bg-border-strong ' +
  'bg-[linear-gradient(90deg,var(--border-strong)_0%,color-mix(in_srgb,var(--border-strong),#fff_60%)_50%,var(--border-strong)_100%)] ' +
  'bg-[length:200%_100%] bg-no-repeat animate-[caiSkeletonShimmer_1.3s_linear_infinite]';

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
