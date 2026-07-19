import { SiteHeader } from '@/components/SiteHeader';
import { DemoShowcase } from '@/components/DemoShowcase';

export const metadata = {
  title: 'Component demo · (c.ai) reads',
  robots: { index: false },
};

/** Internal showcase — not linked from navigation. See DemoShowcase. */
export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <DemoShowcase />
      </main>
    </>
  );
}
