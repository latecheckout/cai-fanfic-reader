import Link from 'next/link';
import Image from 'next/image';
import hero from '@/styles/components/HeroCarousel.module.css';
import styles from '@/styles/components/CreatorCTABanner.module.css';

/**
 * Painted-door promo banner shown amid the shelves: invites readers to apply
 * for the creator beta so we start gathering leads. This is the hero banner's
 * slide, verbatim (same image + scrim + kicker/headline/CTA treatment) — just a
 * single static slide, no carousel. Full width like the hero.
 * Static server component — no client JS.
 *
 * @TODO-DEV — point `href` at the real creator-beta application form.
 */
export function CreatorCTABanner() {
  return (
    <section className={styles.banner} aria-labelledby="creator-cta-title">
      <Link href="/creators/apply" className={hero.slide} aria-label="Apply for the c.ai creator beta">
        <Image
          src="/hero/banner-quill.png"
          alt=""
          fill
          sizes="(max-width: 980px) 100vw, 1280px"
          loading="eager"
          className={hero.bg}
        />
        <span className={hero.scrim} aria-hidden="true" />
        <span className={hero.overlay}>
          <span className={`${hero.content} ${hero.contentCentered}`}>
            <span className={hero.kicker}>Creator beta</span>
            <span id="creator-cta-title" className={hero.headline}>
              Want to write for c.ai?
            </span>
            <span className={hero.cta}>Apply now</span>
          </span>
        </span>
      </Link>
    </section>
  );
}
