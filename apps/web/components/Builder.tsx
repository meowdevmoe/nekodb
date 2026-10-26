'use client';

import { AlertIcon, CodeIcon, EyeIcon, InfoIcon, PersonIcon, PlayIcon } from '@primer/octicons-react';
import { useEffect, useMemo, useState } from 'react';
import { DEMO_ID, INVITE, SITE } from './site';
import { LiveImage, useLivePresence } from './LiveImage';
import { Snippet } from './Snippet';

type Tab = 'discord' | 'spotify' | 'languages' | 'counter';
type Scheme = 'auto' | 'dark' | 'light';

const SNOWFLAKE = /^\d{17,20}$/;
const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const COUNTER = /^[A-Za-z0-9._@:-]{1,64}$/;

function useDebounced<T>(value: T, ms = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
  return q ? `${path}?${q}` : path;
}

/** Markdown + HTML for an image; "auto" switches with GitHub's colour mode through <picture>. */
function code(path: (scheme: 'dark' | 'light' | undefined) => string, alt: string, scheme: Scheme) {
  if (scheme === 'auto') {
    const picture = `<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="${SITE}${path('dark')}">\n  <img src="${SITE}${path('light')}" alt="${alt}">\n</picture>`;
    return { markdown: picture, html: picture };
  }
  const url = `${SITE}${path(scheme)}`;
  return { markdown: `![${alt}](${url})`, html: `<img src="${url}" alt="${alt}">` };
}

function Preview({ path, scheme, alt }: { path: (s: 'dark' | 'light') => string; scheme: Scheme; alt: string }) {
  if (scheme === 'auto') {
    return (
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={path('dark')} />
        <img src={path('light')} alt={alt} />
      </picture>
    );
  }
  return <img src={path(scheme)} alt={alt} />;
}

function SchemeField({ value, onChange }: { value: Scheme; onChange: (s: Scheme) => void }) {
  return (
    <div className="field">
      <span className="label">Theme</span>
      <div className="segmented" role="group" aria-label="Theme">
        {(['auto', 'dark', 'light'] as const).map((s) => (
          <button key={s} type="button" aria-pressed={value === s} onClick={() => onChange(s)}>{s[0]!.toUpperCase() + s.slice(1)}</button>
        ))}
      </div>
      <div className="hint">Auto follows the reader&apos;s GitHub theme.</div>
    </div>
  );
}

function Panel({ title, note, preview, snippet }: { title: string; note: string; preview: React.ReactNode; snippet: React.ReactNode }) {
  return (
    <div className="box">
      <div className="box-header">{title} <span className="muted">{note}</span></div>
      <div className="preview">{preview}</div>
      {snippet}
    </div>
  );
}

/** Tells whether the bot can see this Discord account, live from the presence stream. */
function DiscordState({ id }: { id: string }) {
  const { data } = useLivePresence(SNOWFLAKE.test(id) ? id : null);
  if (!data) return null;
  if (data.success) return <div className="flash"><InfoIcon size={16} /><div>Live: NekoDB sees this account ({data.data?.discord_status ?? 'offline'}). The preview redraws the moment your status or track changes.</div></div>;
  if (data.error?.code === 'user_not_monitored') return <div className="flash"><AlertIcon size={16} /><div>This account is not on the NekoDB Discord server yet. <a href={INVITE} target="_blank" rel="noreferrer">Join the server</a> and the card goes live within seconds.</div></div>;
  return <div className="flash"><AlertIcon size={16} /><div>The NekoDB bot is reconnecting to Discord. Cards come back on their own.</div></div>;
}

function DiscordBuilder({ kind }: { kind: 'card' | 'spotify' }) {
  const [id, setId] = useState(DEMO_ID);
  const [scheme, setScheme] = useState<Scheme>('auto');
  const [hide, setHide] = useState<Set<string>>(new Set());
  const did = useDebounced(id.trim());
  const valid = SNOWFLAKE.test(did);
  const hideParam = kind === 'card' && hide.size ? [...hide].join(',') : undefined;
  const path = (s: 'dark' | 'light' | undefined) => withQuery(`/${kind}/${valid ? did : DEMO_ID}.svg`, { theme: s, hide: hideParam });
  const alt = kind === 'card' ? 'Discord status' : 'Spotify';
  const toggle = (key: string) => setHide((h) => {
    const n = new Set(h);
    if (n.has(key)) n.delete(key);
    else n.add(key);
    return n;
  });
  return (
    <div className="builder">
      <div className="form">
        <div className="field">
          <label htmlFor={`${kind}-id`}>Discord user ID</label>
          <input id={`${kind}-id`} className="input mono" value={id} onChange={(e) => setId(e.target.value)} inputMode="numeric" spellCheck={false} />
          <div className="hint">{id && !SNOWFLAKE.test(id.trim()) ? 'A user ID is 17 to 20 digits.' : 'Discord: Settings, Advanced, Developer Mode on, then right-click your name and Copy User ID.'}</div>
        </div>
        <SchemeField value={scheme} onChange={setScheme} />
        {kind === 'card' && (
          <div className="field">
            <span className="label">Hide</span>
            {[['status', 'Status'], ['activity', 'Game or app'], ['spotify', 'Spotify'], ['decoration', 'Avatar decoration']].map(([k, label]) => (
              <label key={k} className="check"><input type="checkbox" checked={hide.has(k!)} onChange={() => toggle(k!)} /> {label}</label>
            ))}
          </div>
        )}
        <DiscordState id={did} />
      </div>
      <Panel
        title={kind === 'card' ? 'Discord card' : 'Spotify card'}
        note={kind === 'card' ? 'status, game and track' : 'what you are listening to'}
        preview={<LiveImage id={valid ? did : DEMO_ID} src={path(undefined)} scheme={scheme} alt={alt} />}
        snippet={<Snippet {...code(path, alt, scheme)} />}
      />
    </div>
  );
}

function LanguagesBuilder() {
  const [login, setLogin] = useState('meowdevmoe');
  const [scheme, setScheme] = useState<Scheme>('auto');
  const [count, setCount] = useState(8);
  const [exclude, setExclude] = useState('');
  const dl = useDebounced(login.trim());
  const dx = useDebounced(exclude.replace(/\s*,\s*/g, ',').trim());
  const valid = LOGIN.test(dl);
  const path = (s: 'dark' | 'light' | undefined) => withQuery(`/github/${valid ? dl : 'meowdevmoe'}/languages.svg`, { theme: s, count: count === 8 ? undefined : count, exclude: dx || undefined });
  return (
    <div className="builder">
      <div className="form">
        <div className="field">
          <label htmlFor="gh-login">GitHub username</label>
          <input id="gh-login" className="input mono" value={login} onChange={(e) => setLogin(e.target.value)} spellCheck={false} />
          <div className="hint">{login && !LOGIN.test(login.trim()) ? 'Not a valid GitHub username.' : 'Counts code in your public repositories, forks left out.'}</div>
        </div>
        <SchemeField value={scheme} onChange={setScheme} />
        <div className="field">
          <label htmlFor="gh-count">Languages shown</label>
          <select id="gh-count" className="select" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[4, 6, 8, 10, 12, 16].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="gh-exclude">Leave out</label>
          <input id="gh-exclude" className="input" placeholder="HTML, CSS" value={exclude} onChange={(e) => setExclude(e.target.value)} />
          <div className="hint">Comma-separated language names.</div>
        </div>
      </div>
      <Panel title="Languages" note="share of your code" preview={<Preview path={(s) => path(s)} scheme={scheme} alt="Top languages" />} snippet={<Snippet {...code(path, 'Top languages', scheme)} />} />
    </div>
  );
}

function CounterBuilder() {
  const [name, setName] = useState('my-profile');
  const [theme, setTheme] = useState('rule34');
  const [themes, setThemes] = useState<string[]>([]);
  const [length, setLength] = useState(7);
  const [scale, setScale] = useState(1);
  const [pixelated, setPixelated] = useState(true);
  useEffect(() => {
    fetch('/api/v1/themes').then((r) => r.json()).then((j) => setThemes(j.data.themes.map((t: { name: string }) => t.name))).catch(() => setThemes([]));
  }, []);
  const dn = useDebounced(name.trim());
  const valid = COUNTER.test(dn);
  const params = { theme: theme === 'rule34' ? undefined : theme, length: length === 7 ? undefined : length, scale: scale === 1 ? undefined : scale, pixelated: pixelated ? undefined : 0 };
  const path = () => withQuery(`/counter/${valid ? dn : 'my-profile'}.svg`, params);
  const preview = withQuery(`/counter/${valid ? dn : 'my-profile'}.svg`, { ...params, inc: 0 });
  const snippet = useMemo(() => code(() => path(), 'Profile views', 'dark'), [dn, theme, length, scale, pixelated]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="builder">
      <div className="form">
        <div className="field">
          <label htmlFor="c-name">Counter name</label>
          <input id="c-name" className="input mono" value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} />
          <div className="hint">{name && !COUNTER.test(name.trim()) ? 'Use letters, digits and . _ @ : - (up to 64).' : 'Pick something unique, like your GitHub username. Each view adds one.'}</div>
        </div>
        <div className="field">
          <label htmlFor="c-length">Digits</label>
          <select id="c-length" className="select" value={length} onChange={(e) => setLength(Number(e.target.value))}>
            {[4, 5, 6, 7, 8, 9, 10, 12].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="c-scale">Size</label>
          <select id="c-scale" className="select" value={scale} onChange={(e) => setScale(Number(e.target.value))}>
            {[0.5, 0.75, 1, 1.5, 2].map((n) => <option key={n} value={n}>{n * 100}%</option>)}
          </select>
        </div>
        <label className="check"><input type="checkbox" checked={pixelated} onChange={(e) => setPixelated(e.target.checked)} /> Crisp pixels</label>
      </div>
      <div className="form">
        <Panel title="Counter" note={`theme ${theme}`} preview={<img src={preview} alt="Profile views" />} snippet={<Snippet {...snippet} />} />
        <div className="box">
          <div className="box-header">Themes <span className="muted">{themes.length || ''}</span></div>
          <div className="box-body">
            <div className="themes">
              {themes.map((t) => (
                <button key={t} type="button" className="theme" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                  <img src={`/counter-preview?theme=${t}&value=1234`} alt="" loading="lazy" />
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'discord', label: 'Discord', icon: <PersonIcon size={16} /> },
  { id: 'spotify', label: 'Spotify', icon: <PlayIcon size={16} /> },
  { id: 'languages', label: 'Languages', icon: <CodeIcon size={16} /> },
  { id: 'counter', label: 'View counter', icon: <EyeIcon size={16} /> },
];

export function Builder() {
  const [tab, setTab] = useState<Tab>('discord');
  useEffect(() => {
    const fromHash = (scroll: boolean) => {
      const h = window.location.hash.slice(1) as Tab;
      if (!TABS.some((t) => t.id === h)) return;
      setTab(h);
      if (scroll) document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    fromHash(false);
    const onHash = () => fromHash(true);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const pick = (t: Tab) => {
    setTab(t);
    history.replaceState(null, '', `#${t}`);
    // keep the header's highlight in step without scrolling the page
    window.dispatchEvent(new Event('hashchange-silent'));
  };
  return (
    <section id="builder">
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" className="tab" aria-selected={tab === t.id} onClick={() => pick(t.id)}>{t.icon}{t.label}</button>
        ))}
      </div>
      {tab === 'discord' && <DiscordBuilder kind="card" />}
      {tab === 'spotify' && <DiscordBuilder kind="spotify" />}
      {tab === 'languages' && <LanguagesBuilder />}
      {tab === 'counter' && <CounterBuilder />}
    </section>
  );
}
