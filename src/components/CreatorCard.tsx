import Link from 'next/link';
import Image from 'next/image';
import { Creator } from '@/lib/shelves';
import { Kudos } from './WorkCardCover';

/** @DUMMY — placeholder until real author photos exist. */
const CREATOR_PLACEHOLDER = '/creators/placeholder.png';

interface Props {
  creator: Creator;
  /** Position in the rail — drives the entrance stagger. */
  index?: number;
}

/**
 * Trending-creator card — a centred vertical stack: circular profile photo
 * (with a low-opacity ring), name, then social metrics. Reusable: drop it
 * anywhere and feed it a single Creator; callers map over their own list.
 */
export function CreatorCard({ creator, index = 0 }: Props) {
  return (
    <Link
      href={creator.href}
      title={creator.name}
      className="group flex-shrink-0 w-[168px] md:w-[200px] aspect-[2/3] flex flex-col items-center justify-center text-center p-4 md:p-5 border border-card-border rounded-card bg-card no-underline text-inherit transition-colors duration-150 ease-in-out hover:border-border-strong animate-[caiRevealUp_650ms_var(--ease-out-expo)_both]"
      style={{ animationDelay: `${(index + 1) * 30}ms` }}
    >
      <span className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-border" aria-hidden="true">
        <Image src={CREATOR_PLACEHOLDER} alt="" fill sizes="96px" className="object-cover" />
        <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_var(--image-outline)] pointer-events-none" />
      </span>
      <span className="mt-3 max-w-full font-serif text-[16px] font-medium leading-[1.3] text-text line-clamp-2 group-hover:underline group-hover:underline-offset-2">{creator.name}</span>
      {creator.bio && <span className="mt-2 mb-[2px] max-w-full font-serif text-[13px] leading-[1.5] text-secondary line-clamp-2">{creator.bio}</span>}
      <span className="mt-1 font-mono text-[12px] tabular-nums text-secondary">
        {creator.workCount} {creator.workCount === 1 ? 'work' : 'works'} · <Kudos count={creator.kudos} />
      </span>
    </Link>
  );
}
