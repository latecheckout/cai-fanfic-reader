import type { Metadata } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'c.ai Fanfic',
  description: 'AI-generated fanfic stories from your favorite characters. Browse by fandom, pairing, rating, and tag.',
  openGraph: {
    title: 'c.ai Fanfic',
    description: 'AI-generated fanfic stories from your favorite characters. Browse by fandom, pairing, rating, and tag.',
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
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
