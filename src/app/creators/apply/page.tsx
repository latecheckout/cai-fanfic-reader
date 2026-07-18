import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { NavPillLink } from '@/components/NavPillLink';
import { CreditIcon, EyesOnStoryIcon, SupportIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Write on c.ai',
  description:
    'Early applications are open for the first group of (c.ai) reads writers. A paid program with a built-in audience. Any genre, no finished manuscript needed.',
  openGraph: {
    title: 'Write for (c.ai) reads',
    description:
      'Write the stories people stay up late reading. Early applications for the (c.ai) reads writers program are open now.',
  },
};

const APPLY_URL = 'https://forms.gle/foRWcEutqFndrFWV6';

const BENEFITS = [
  {
    title: 'Get read',
    body: "Your stories go in front of (c.ai)'s existing audience from day one. No starting a following from zero.",
    Icon: EyesOnStoryIcon,
  },
  {
    title: 'Get credit',
    body: 'Author names sit front and centre on (c.ai) reads. Every story carries your byline.',
    Icon: CreditIcon,
  },
  {
    title: 'Get supported',
    body: 'A paid program with the opportunity to work directly with the (c.ai) reads team.',
    Icon: SupportIcon,
  },
];

// Shared image treatment: full width, card radius, theme-aware hairline outline.
const SECTION_IMAGE_CLS =
  'mt-30 w-full rounded-card outline outline-1 -outline-offset-1 outline-black/10 theme-dark:outline-white/10';

const H2_CLS =
  'm-0 font-serif text-[26px] font-medium tracking-[-0.01em] text-text [text-wrap:balance] max-md:text-[22px]';
const PROSE_CLS =
  'mt-4 flex max-w-[62ch] flex-col gap-4 font-sans text-[16px] leading-relaxed text-secondary [text-wrap:pretty]';

function ApplyButton() {
  return (
    <NavPillLink href={APPLY_URL} label="Write on (c.ai)" big filled className="shrink-0" />
  );
}

export default function WritersPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 pt-14 pb-24 max-md:px-4 max-md:pt-8">
        {/* ── Hero ── */}
        <h1 className="m-0 font-serif text-[38px] font-medium leading-[1.15] tracking-[-0.015em] text-text [text-wrap:balance] max-md:text-[30px]">
          Write the stories people stay up late reading.
        </h1>
        <div className="mt-5 flex max-w-[62ch] flex-col gap-4 font-sans text-[17px] leading-relaxed text-secondary [text-wrap:pretty]">
          <p className="m-0">
            (c.ai) reads is our new home for serialized fiction. Enemies to lovers, chosen ones,
            found families, and second chances. We&rsquo;re opening early applications for the
            first group of writers to build it with us.
          </p>
        </div>
        <div className="mt-7 flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-3">
          <ApplyButton />
          <p className="m-0 font-sans text-[14px] text-secondary">
            Takes about five minutes. You don&rsquo;t need a finished manuscript.
          </p>
        </div>

        {/* ── Why write ── */}
        <Image
          src="/writers-why-write.png"
          alt="Illustration of a writer at a desk surrounded by colorful stacks of books"
          width={420}
          height={280}
          className={SECTION_IMAGE_CLS}
          sizes="(max-width: 768px) 100vw, 720px"
          priority
        />
        <section className="mt-8">
          <h2 className={H2_CLS}>Why write for (c.ai) reads?</h2>
          {/* ul (not dl): dt/dd can't nest inside the icon-row wrapper divs. */}
          <ul className="m-0 mt-6 flex list-none flex-col gap-6 p-0">
            {BENEFITS.map(({ title, body, Icon }) => (
              <li key={title} className="flex max-w-[62ch] gap-4">
                {/* Icon bubble, same treatment as EmptyStateCard's. */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-overlay-medium text-text"
                  aria-hidden="true"
                >
                  <Icon width={22} height={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 font-sans text-[17px] font-medium text-text">{title}</h3>
                  <p className="m-0 mt-1 font-sans text-[16px] leading-relaxed text-secondary [text-wrap:pretty]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The (co)created mark ── */}
        <Image
          src="/writers-cocreated.png"
          alt="Illustration of two people reading a book together under a large tree"
          width={420}
          height={280}
          className={SECTION_IMAGE_CLS}
          sizes="(max-width: 768px) 100vw, 720px"
        />
        <section className="mt-8">
          <h2 className={H2_CLS}>The (co)created mark</h2>
          <div className={PROSE_CLS}>
            <p className="m-0">
              Every story on (c.ai) reads is made by a human author, using (c.ai)&rsquo;s tools as
              part of the process. That&rsquo;s what the (co)created with (c.ai) mark means: you
              shape the idea, make the creative calls, and decide when it&rsquo;s ready to share.
              Our bespoke creator writing tools help creators make more ambitious work, faster.
              But your pen name always comes first.
            </p>
          </div>
        </section>

        {/* ── What we're looking for ── */}
        <Image
          src="/writers-looking-for.png"
          alt="Illustration of a writer seated cross-legged, writing in a notebook against a backdrop of flowers"
          width={420}
          height={280}
          className={SECTION_IMAGE_CLS}
          sizes="(max-width: 768px) 100vw, 720px"
        />
        <section className="mt-8">
          <h2 className={H2_CLS}>What we&rsquo;re looking for</h2>
          <div className={PROSE_CLS}>
            <p className="m-0">If you&rsquo;ve ever written fanfic at 2am, you&rsquo;re our people.</p>
            <p className="m-0">
              Writers who love serialized fiction and know what makes readers hit &ldquo;next
              chapter.&rdquo; Any genre is fair game, any platform counts as experience, and a
              notes app full of WIPs counts too. You don&rsquo;t need to be an AI expert or have a
              finished manuscript. You need to love telling stories.
            </p>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="mt-30 rounded-card border border-dashed border-border-strong px-8 py-10 text-center max-md:px-5">
          <h2 className={`${H2_CLS} text-center`}>We&rsquo;re taking early applications now.</h2>
          <p className="mx-auto mt-3 mb-0 max-w-[52ch] font-sans text-[16px] leading-relaxed text-secondary [text-wrap:pretty]">
            Tell us who you are and what you write. It takes less than five minutes. The creator
            beta is small to start, so we&rsquo;ll reach out as spots open, and your application
            stays in the pool as the program grows.
          </p>
          <div className="mt-6 flex justify-center">
            <ApplyButton />
          </div>
        </section>
      </main>
    </div>
  );
}
