'use client';

import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/#discord', id: 'discord', label: 'Discord' },
  { href: '/#spotify', id: 'spotify', label: 'Spotify' },
  { href: '/#languages', id: 'languages', label: 'Languages' },
  { href: '/#counter', id: 'counter', label: 'Counters' },
  { href: '/docs/', id: 'docs', label: 'API' },
];

/** Plain links (not next/link) so a click on the home page fires hashchange and the builder
 *  switches tabs; the current tab or page is highlighted. */
export function HeaderNav() {
  const [current, setCurrent] = useState('');
  useEffect(() => {
    const update = () => setCurrent(location.pathname.startsWith('/docs') ? 'docs' : location.hash.slice(1) || 'discord');
    update();
    window.addEventListener('hashchange', update);
    window.addEventListener('hashchange-silent', update);
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('hashchange-silent', update);
    };
  }, []);
  return (
    <nav className="nav">
      {LINKS.map((l) => (
        <a key={l.id} href={l.href} aria-current={current === l.id ? 'page' : undefined}>{l.label}</a>
      ))}
    </nav>
  );
}
