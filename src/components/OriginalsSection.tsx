import Link from 'next/link';
import Image from 'next/image';
import { WorkSummary } from '@/types';
import { Logo } from './Logo';
import styles from '@/styles/components/OriginalsSection.module.css';

interface Props {
  works: WorkSummary[];
}

export function OriginalsSection({ works }: Props) {
  if (works.length === 0) return null;

  return (
    <section className={styles.section} aria-label="c.ai Originals">
      <div className={styles.header}>
        <h2 className={styles.title}>c.ai Originals ✨</h2>
        <p className={styles.subtitle}>Dreamed up here</p>
      </div>

      <div className={styles.row}>
        {works.map((work) => (
          <article key={work.slug} className={styles.card}>
            <Link
              href={`/works/${work.slug}`}
              className={styles.coverLink}
              title={work.meta.title}
            >
              <div className={styles.coverWrap}>
                {work.meta.cover && (
                  <Image
                    src={work.meta.cover}
                    alt={work.meta.title}
                    fill
                    sizes="220px"
                    className={styles.coverImg}
                  />
                )}
                <span className={styles.badge} aria-hidden="true">
                  <Logo className={styles.badgeLogo} />
                </span>
              </div>
            </Link>
            {work.meta.tags.length > 0 && (
              <div className={styles.tags}>
                {work.meta.tags.slice(0, 2).map((t) => (
                  <a key={t} href={`/?tag=${encodeURIComponent(t)}`} className={styles.tagChip}>
                    {t}
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
