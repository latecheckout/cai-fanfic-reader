import type { Metadata } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/ThemeScript';
import { DevAnnotation } from '@/components/DevAnnotation';

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
        {children}
        {/* Dev-only UI annotation overlay; stripped from production builds. */}
        {process.env.NODE_ENV !== 'production' && <DevAnnotation />}
      </body>
    </html>
  );
}
