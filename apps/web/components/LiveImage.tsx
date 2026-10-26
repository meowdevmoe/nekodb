'use client';

import { useEffect, useState } from 'react';

const SNOWFLAKE = /^\d{17,20}$/;

type Presence = { success: boolean; data?: { discord_status?: string }; error?: { code: string } };
type Listener = (p: Presence, changed: boolean) => void;

// One EventSource per account, shared by every card and note on the page.
const streams = new Map<string, { es: EventSource; listeners: Set<Listener>; last: Presence | null; count: number }>();

function subscribe(id: string, fn: Listener): () => void {
  let s = streams.get(id);
  if (!s) {
    const es = new EventSource(`/api/v1/stream/${id}`);
    const entry = { es, listeners: new Set<Listener>(), last: null as Presence | null, count: 0 };
    es.addEventListener('presence', (e) => {
      entry.last = JSON.parse((e as MessageEvent).data);
      entry.count += 1;
      // the opening snapshot matches what the images already show
      for (const l of entry.listeners) l(entry.last!, entry.count > 1);
    });
    streams.set(id, entry);
    s = entry;
  }
  s.listeners.add(fn);
  if (s.last) fn(s.last, false);
  return () => {
    const cur = streams.get(id);
    if (!cur) return;
    cur.listeners.delete(fn);
    if (cur.listeners.size === 0) {
      cur.es.close();
      streams.delete(id);
    }
  };
}

/** Live presence for an account: the latest JSON and a number that grows on every change,
 *  used to re-draw cards the moment the track or status changes. */
export function useLivePresence(id: string | null) {
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<Presence | null>(null);
  useEffect(() => {
    if (!id || !SNOWFLAKE.test(id)) return;
    return subscribe(id, (p, changed) => {
      setData(p);
      if (changed) setVersion((v) => v + 1);
    });
  }, [id]);
  return { version, data };
}

/** A card image that follows the reader's colour scheme and re-draws on every presence change.
 *  `src` is the image URL without a theme; the theme is added here. */
export function LiveImage({ id, src, alt, scheme = 'auto' }: { id: string; src: string; alt: string; scheme?: 'auto' | 'dark' | 'light' }) {
  const { version } = useLivePresence(id);
  const url = (theme: 'dark' | 'light') => {
    const sep = src.includes('?') ? '&' : '?';
    return `${src}${sep}theme=${theme}${version ? `&v=${version}` : ''}`;
  };
  if (scheme !== 'auto') return <img src={url(scheme)} alt={alt} />;
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={url('dark')} />
      <img src={url('light')} alt={alt} />
    </picture>
  );
}
