import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { FaqAccordion } from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'About',
  description:
    "(c.ai) reads is Character.ai's home for serialized fiction: human-authored original stories, cocreated with (c.ai), published chapter by chapter.",
  openGraph: {
    title: 'About (c.ai) reads',
    description:
      'Human-authored serialized fiction, cocreated with (c.ai). The first chapters of every story are free to read.',
  },
};

// One source of truth for the FAQs: rendered by the accordion AND serialized
// into the FAQPage JSON-LD below, so the two can never drift.
const FAQS = [
  {
    question: 'What kind of stories are on (c.ai) reads?',
    answerText:
      "Serialized fiction across every genre: romance, fantasy, sci-fi, thriller, and everything readers ask for next. New chapters drop regularly, so there's always something mid-story to catch up on.",
  },
  {
    question: 'How are these stories made?',
    answerText:
      "Every story on (c.ai) reads has a human author. They shape the idea, make the creative choices, and decide when it's ready to share. Authors use (c.ai)'s tools throughout the process to draft, iterate, and build more ambitious work, faster.",
  },
  {
    question: 'What does (co)created mean?',
    answerText:
      "It's our credit mark. When you see (co)created with (c.ai) on a work, you know a human created it with (c.ai) as part of the process, and their name always comes first on the byline.",
  },
  {
    question: 'Is (c.ai) reads free?',
    answerText:
      'The first chapters of every story are free to read. After that, chapters are unlocked with charms at a per-chapter price. In the future, authors will be able to choose which of their stories and chapters are free and which are paid.',
  },
  {
    question: 'Can I chat with the Characters from these stories?',
    answerText:
      "We're building integration between (c.ai) reads and the main Character.ai platform, so the Characters you meet in a story won't have to stay on the page. This feature will be for age-verified users over 18 only.",
  },
  {
    question: 'Can I write for (c.ai) reads?',
    answerText:
      "That's the plan. We're taking expressions of interest now. It takes about five minutes, and you don't need a finished manuscript.",
  },
];

// FAQPage structured data: makes the questions eligible for rich results and
// answer-engine citation. Static content, serialized from the FAQS constant.
const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ question, answerText }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answerText },
  })),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <main className="mx-auto max-w-[720px] px-6 pt-14 pb-24 max-md:px-4 max-md:pt-8">
        {/* ── Hero ── */}
        <h1 className="m-0 font-serif text-[38px] font-medium leading-[1.15] tracking-[-0.015em] text-text [text-wrap:balance] max-md:text-[30px]">
          A new home for serialized fiction.
        </h1>
        <div className="mt-5 flex max-w-[62ch] flex-col gap-4 font-sans text-[17px] leading-relaxed text-secondary [text-wrap:pretty]">
          <p className="m-0">
            (c.ai) reads is Character.ai&rsquo;s home for serialized fiction: original stories,
            published chapter by chapter, made to be read anywhere.
          </p>
          <p className="m-0">
            Enemies to lovers, chosen ones, found families, second chances: the stories readers
            fall for. The first chapters of every story are free to read, and you can unlock more
            as you go.
          </p>
        </div>

        {/* Editorial still: writing on (c.ai) at a desk. Subtle outline keeps
            the image edge defined on the paper bg (theme-aware). */}
        <Image
          src="/about-creativity.png"
          alt="A tablet on a desk showing a story being written alongside its cover art, next to a coffee cup and notebook"
          width={1320}
          height={755}
          className="mt-30 w-full rounded-card outline outline-1 -outline-offset-1 outline-black/10 theme-dark:outline-white/10"
          priority
        />

        {/* ── Human creativity ── */}
        <section className="mt-30">
          <h2 className="m-0 font-serif text-[26px] font-medium tracking-[-0.01em] text-text [text-wrap:balance] max-md:text-[22px]">
            We believe in human creativity.
          </h2>
          <div className="mt-4 flex max-w-[62ch] flex-col gap-4 font-sans text-[16px] leading-relaxed text-secondary [text-wrap:pretty]">
            <p className="m-0">
              Great stories come from human imagination, taste, and direction. AI supports the
              creative process, but it does not replace the creative point of view.
            </p>
            <p className="m-0">
              Millions of people already create in partnership with AI on (c.ai) every day. Every
              chat is a story shaped by the person who starts it, and every Character is a small
              act of authorship. That&rsquo;s been true since day one.
            </p>
            <p className="m-0">
              (c.ai) reads comes from the same idea. Some works come from our in-house studio, and
              some are made by creators in our community who have been invited into our paid
              writers program. All of it is human-created, with (c.ai)&rsquo;s tools helping people
              make more ambitious creative work, faster.
            </p>
          </div>
        </section>

        {/* ── The (co)created mark ── */}
        <section className="mt-30">
          <h2 className="m-0 font-serif text-[26px] font-medium tracking-[-0.01em] text-text [text-wrap:balance] max-md:text-[22px]">
            The (co)created mark
          </h2>
          <div className="mt-4 flex max-w-[62ch] flex-col gap-4 font-sans text-[16px] leading-relaxed text-secondary [text-wrap:pretty]">
            <p className="m-0">
              When you see the (co)created with (c.ai) mark on a work, you know a human created it
              with (c.ai) as part of the process. We think you should always know how the stories
              you read were made, so we say it upfront.
            </p>
            <p className="m-0">
              Human creators always lead the work: shaping the idea, making the creative choices,
              and deciding when it&rsquo;s ready to share. And the author&rsquo;s name always comes
              first.
            </p>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="mt-30">
          <h2 className="m-0 mb-6 font-serif text-[26px] font-medium tracking-[-0.01em] text-text max-md:text-[22px]">
            Frequently asked questions
          </h2>
          <FaqAccordion
            items={FAQS.map(({ question, answerText }) => ({
              question,
              answer:
                question === 'Can I write for (c.ai) reads?' ? (
                  <>
                    That&rsquo;s the plan. We&rsquo;re taking{' '}
                    <Link href="/creators/apply">expressions of interest</Link> now. It takes about
                    five minutes, and you don&rsquo;t need a finished manuscript.
                  </>
                ) : (
                  answerText
                ),
            }))}
          />
        </section>
      </main>
    </div>
  );
}
