import { Creator } from '@/lib/shelves';
import { CreatorCard } from './CreatorCard';
import { RailSection } from './RailSection';

interface Props {
  creators: Creator[];
}

/**
 * Trending creators (server component): a horizontal rail of CreatorCards (per
 * Devon, design review June 2026 — "make the humans shine").
 */
export function CreatorRail({ creators }: Props) {
  if (creators.length === 0) return null;

  return (
    <RailSection title="Trending creators ✍️" subtitle="The humans behind the stories">
      {creators.map((c, i) => <CreatorCard key={c.name} creator={c} index={i} />)}
    </RailSection>
  );
}
