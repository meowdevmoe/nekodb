// GitHub's own font stack and Primer colours, so cards sit naturally in a README.
export const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'`;
export const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** SVG text cannot be measured server-side; this estimates a run's width in px for truncation. */
export function textWidth(text: string, size: number): number {
  let w = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (code > 0x2e80) w += 1;
    else if ('iljtf.,:;|!\'"'.includes(ch)) w += 0.3;
    else if ('mwMW@'.includes(ch)) w += 0.85;
    else if (ch >= 'A' && ch <= 'Z') w += 0.66;
    else if (ch === ' ') w += 0.28;
    else w += 0.55;
  }
  return w * size;
}

export function fit(text: string, size: number, max: number): string {
  if (textWidth(text, size) <= max) return text;
  let out = '';
  for (const ch of text) {
    if (textWidth(out + ch + '…', size) > max) break;
    out += ch;
  }
  return out.trimEnd() + '…';
}

export function duration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

export function elapsed(ms: number): string {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'started just now';
  if (m < 60) return `for ${m} min`;
  const h = Math.floor(m / 60);
  return `for ${h} h ${m % 60} min`;
}

export interface Palette {
  canvas: string;
  subtle: string;
  border: string;
  fg: string;
  muted: string;
  track: string;
  success: string;
  attention: string;
  danger: string;
  neutral: string;
}

const DARK: Palette = {
  canvas: '#0d1117', subtle: '#151b23', border: '#3d444d', fg: '#f0f6fc', muted: '#9198a1', track: '#2a313c',
  success: '#3fb950', attention: '#d29922', danger: '#f85149', neutral: '#9198a1',
};
const LIGHT: Palette = {
  canvas: '#ffffff', subtle: '#f6f8fa', border: '#d1d9e0', fg: '#1f2328', muted: '#59636e', track: '#e6eaef',
  success: '#1a7f37', attention: '#9a6700', danger: '#d1242f', neutral: '#59636e',
};

export function palette(theme: string | undefined, bg: string | undefined): Palette {
  const base = { ...(theme === 'light' ? LIGHT : DARK) };
  if (bg && /^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(bg)) base.canvas = `#${bg}`;
  return base;
}

export function statusLook(status: string, p: Palette): { label: string; color: string } {
  switch (status) {
    case 'online': return { label: 'Online', color: p.success };
    case 'idle': return { label: 'Idle', color: p.attention };
    case 'dnd': return { label: 'Do not disturb', color: p.danger };
    default: return { label: 'Offline', color: p.neutral };
  }
}
