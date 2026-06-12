import Link from 'next/link';
import Image from 'next/image';
import { Creator } from '@/lib/shelves';
import { formatCount } from '@/lib/utils';
import styles from '@/styles/components/CreatorCard.module.css';

/** @DUMMY — placeholder until real author photos exist. */
const CREATOR_PLACEHOLDER = '/creators/placeholder.png';

interface Props {
  creator: Creator;
}

/**
 * Trending-creator card — a centred vertical stack: circular profile photo
 * (with a low-opacity ring), name, then social metrics. Reusable: drop it
 * anywhere and feed it a single Creator; callers map over their own list.
 */
export function CreatorCard({ creator }: Props) {
  return (
    <Link href={creator.href} className={styles.card} title={creator.name}>
      <span className={styles.avatar} aria-hidden="true">
        <Image src={CREATOR_PLACEHOLDER} alt="" fill sizes="96px" className={styles.avatarImg} />
        <span className={styles.avatarRing} />
      </span>
      <span className={styles.name}>{creator.name}</span>
      {creator.bio && <span className={styles.bio}>{creator.bio}</span>}
      <span className={styles.meta}>
        {creator.workCount} {creator.workCount === 1 ? 'work' : 'works'} · ♥ {formatCount(creator.kudos)}
      </span>
    </Link>
  );
}
