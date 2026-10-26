import Link from 'next/link';
import { HeaderNav } from './HeaderNav';

// Self-hosters set these at build time (NEXT_PUBLIC_*); the defaults are nekodb.space's own.
export const INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE ?? 'https://discord.gg/TjGfUHPeWW';
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nekodb.space';
export const DEMO_ID = process.env.NEXT_PUBLIC_DEMO_DISCORD_ID ?? '1162826529768755283';

/** The NekoDB mark: a cat head drawn on the 16px Octicons grid. */
/** The NekoDB mark (variant D): a database cylinder with cat ears, on the 16px Octicons grid. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3.05 5.6 3.75 1.25l2.9 3.05M12.95 5.6l-.7-4.35-2.9 3.05" strokeLinejoin="round" strokeLinecap="round" />
      <ellipse cx="8" cy="6.3" rx="5.25" ry="2" />
      <path d="M2.75 6.3v6.15c0 1.1 2.35 2 5.25 2s5.25-.9 5.25-2V6.3M2.75 9.4c0 1.1 2.35 2 5.25 2s5.25-.9 5.25-2" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="brand"><Logo /> nekodb</Link>
        <HeaderNav />
        <span className="spacer" />
        <a className="btn btn-primary" href={INVITE} target="_blank" rel="noreferrer">Join the Discord</a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand"><Logo /> nekodb</Link>
            <p>Live widgets for GitHub profile READMEs. Free, no sign-up, open API.</p>
            <img src="/counter/nekodb-site.svg?scale=0.45" alt="Views of this site" height="45" />
          </div>
          <div className="footer-col">
            <h4>Widgets</h4>
            <a href="/#discord">Discord card</a>
            <a href="/#spotify">Spotify card</a>
            <a href="/#languages">Languages</a>
            <a href="/#counter">View counters</a>
          </div>
          <div className="footer-col">
            <h4>Developers</h4>
            <a href="/docs/">API reference</a>
            <a href="/api/v1/status">Service status</a>
            <a href="/api/v1/themes">Counter themes</a>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <a href={INVITE} target="_blank" rel="noreferrer">Discord server</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 NekoDB</span>
          <span>Counter art from <a href="https://github.com/journey-ad/Moe-Counter" target="_blank" rel="noreferrer">Moe-Counter</a> (MIT). Not affiliated with Discord, Spotify or GitHub.</span>
        </div>
      </div>
    </footer>
  );
}
