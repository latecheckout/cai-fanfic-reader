import Link from 'next/link';
import Image from 'next/image';
import { heroSlide } from './heroChrome';

/**
 * Painted-door promo banner shown amid the shelves: invites readers to apply
 * for the creator beta so we start gathering leads. This is the hero banner's
 * slide, verbatim (same image + scrim + kicker/headline/CTA treatment via the
 * shared `heroSlide` chrome) — just a single static slide, no carousel. The
 * wrapper constrains it and clips the rounded corners.
 *
 * @TODO-DEV — point `href` at the real creator-beta application form.
 */
export function CreatorCTABanner() {
  return (
    <section className="mb-12 flex overflow-hidden rounded-banner" aria-labelledby="creator-cta-title">
      <Link href="/creators/apply" className={heroSlide.slide} aria-label="Apply for the c.ai creator beta">
        <Image
          src="/hero/banner-quill.png"
          alt=""
          fill
          sizes="(max-width: 980px) 100vw, 1280px"
          loading="eager"
          className={heroSlide.bg}
        />
        <span className={heroSlide.scrim} aria-hidden="true" />
        <span className={heroSlide.overlay}>
          <span className={`${heroSlide.content} items-center text-center`}>
            <span className={heroSlide.kicker}>Creator beta</span>
            <span id="creator-cta-title" className={heroSlide.headline}>
              Want to write for c.ai?
            </span>
            <span className={heroSlide.cta('glass')}>Apply now</span>
          </span>
        </span>
      </Link>
    </section>
  );
}
