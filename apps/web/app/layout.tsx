import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nekodb.space'),
  title: { default: 'NekoDB — live widgets for your GitHub README', template: '%s · NekoDB' },
  description: 'Your Discord status, what you are playing on Spotify, your top languages and a view counter, as images for a GitHub profile README. Free, no sign-up.',
  icons: { icon: '/favicon.svg' },
  openGraph: { title: 'NekoDB', description: 'Live widgets for your GitHub README: Discord, Spotify, languages and view counters.', url: 'https://nekodb.space', siteName: 'NekoDB', type: 'website' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fa' },
    { media: '(prefers-color-scheme: dark)', color: '#010409' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
