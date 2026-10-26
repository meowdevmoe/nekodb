import Link from 'next/link';

export const INVITE = 'https://discord.gg/NSEuXgsRbv';
export const SITE = 'https://nekodb.space';
export const DEMO_ID = '1162826529768755283';

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
        <nav className="nav">
          <Link href="/#discord">Discord</Link>
          <Link href="/#spotify">Spotify</Link>
          <Link href="/#languages">Languages</Link>
          <Link href="/#counter">Counters</Link>
          <Link href="/docs/">API</Link>
        </nav>
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
        <img src="/counter/nekodb-site.svg?scale=0.35" alt="Views of this page" height="35" />
        <Link href="/docs/">API</Link>
        <a href={INVITE} target="_blank" rel="noreferrer">Discord</a>
        <span className="spacer" />
        <span>Counter art from <a href="https://github.com/journey-ad/Moe-Counter" target="_blank" rel="noreferrer">Moe-Counter</a> (MIT). Not affiliated with Discord or Spotify.</span>
      </div>
    </footer>
  );
}
