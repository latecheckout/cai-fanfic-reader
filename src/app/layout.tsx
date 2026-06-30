import type { Metadata } from 'next';
import './globals.css';
import { accentChain } from 'glimm';
import { GlimmProvider } from 'glimm/next';
import { ThemeScript } from '@/components/ThemeScript';
import { DevAnnotation } from '@/components/DevAnnotation';

// Sweep palette — warm→cool iridescent ribbon, blended in OKLCH:
//   toasty amber → hot pink → alt violet → lowkey lavender.
// Vivid hues on purpose: the band is additive *light*, so muted/earthy hexes
// would read flat grey. We keep it vivid in hue and dim the intensity via the
// provider's brightness/peakAlpha instead. Amber anchors it to the warm paper
// bg + the toggle's espresso; magenta→violet echoes the toggle's glow.
// Plain serializable Palette — crosses the server→client boundary fine.
const SWEEP_PALETTE = accentChain(['#f28500', '#ff4dc9', '#ae00d9', '#df91f2']);

export const metadata: Metadata = {
  title: 'c.ai Fanfic',
  description: 'AI-generated fanfic stories from your favorite characters. Browse by character, pairing, rating, and tag.',
  openGraph: {
    title: 'c.ai Fanfic',
    description: 'AI-generated fanfic stories from your favorite characters. Browse by character, pairing, rating, and tag.',
    siteName: 'c.ai Fanfic',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" data-font="serif" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ThemeScript />
      </head>
      <body>
        {/* brightness/peakAlpha dim the vivid ribbon to a subtle wash on the
            paper bg. Provider defaults the AO4 toggle's sweep inherits.
            No <InterceptLinks /> — the sweep fires only on the toggle, not nav. */}
        <a href="#main-content" className="skip-link">Skip to content</a>
        <GlimmProvider palette={SWEEP_PALETTE} brightness={0.84} peakAlpha={0.8}>
          {children}
          {/* Dev-only UI annotation overlay; stripped from production builds. */}
          {process.env.NODE_ENV !== 'production' && <DevAnnotation />}
        </GlimmProvider>
      </body>
    </html>
  );
}
