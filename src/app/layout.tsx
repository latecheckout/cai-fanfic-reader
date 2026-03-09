import type { Metadata } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'Archive of Our Stories',
  description: 'A fanfic reading experience',
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
