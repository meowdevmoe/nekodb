import type { Metadata, Viewport } from 'next';
import './globals.css';

const DESCRIPTION = 'Live widgets for your GitHub profile README: your Discord status and activity, what you are playing on Spotify, your top languages and anime-style view counters. Free, no sign-up, open API.';

export const metadata: Metadata = {
  metadataBase: new URL('https://nekodb.space'),
  title: { default: 'NekoDB: live Discord, Spotify and stats widgets for your GitHub README', template: '%s · NekoDB' },
  description: DESCRIPTION,
  applicationName: 'NekoDB',
  keywords: ['GitHub README widgets', 'Discord status README', 'Discord presence API', 'Lanyard alternative', 'Spotify now playing README', 'GitHub top languages card', 'profile view counter', 'Moe Counter', 'GitHub profile README', 'README stats'],
  category: 'technology',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: '/apple-touch-icon.png' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'NekoDB',
    title: 'NekoDB: live widgets for your GitHub README',
    description: 'Discord status, Spotify, top languages and view counters as images for your profile README. Free, no sign-up.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'NekoDB widgets: a live Discord card, a languages card and an anime view counter' }],
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: 'NekoDB: live widgets for your GitHub README', description: 'Discord status, Spotify, top languages and view counters. Free, no sign-up.', images: ['/og.png'] },
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
