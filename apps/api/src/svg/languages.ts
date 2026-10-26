// Top languages in the style of the profile's "Languages" card: 840px wide, a title with a
// muted note, one rounded stacked bar and a legend of coloured dots, names and percentages.
import type { LanguageStats } from '../github.js';
import { esc, fit, FONT, palette, textWidth } from './util.js';

export interface LanguagesOptions { theme?: string; bg?: string; count: number; exclude: Set<string>; title: boolean }

const W = 840;
const PAD = 24;
const COLS = 4;

export function renderLanguages(stats: LanguageStats, opts: LanguagesOptions): string {
  const p = palette(opts.theme, opts.bg);
  const langs = stats.languages.filter((l) => !opts.exclude.has(l.name.toLowerCase()));
  const total = langs.reduce((s, l) => s + l.bytes, 0) || 1;
  let shown = langs.slice(0, opts.count);
  const rest = langs.slice(opts.count).reduce((s, l) => s + l.bytes, 0);
  if (rest > 0) shown = [...shown, { name: 'Other', bytes: rest, color: '#8b949e' }];

  const top = opts.title ? 58 : PAD;
  const barW = W - PAD * 2;
  const parts: string[] = [`<clipPath id="bar"><rect x="${PAD}" y="${top}" width="${barW}" height="10" rx="5"/></clipPath><g clip-path="url(#bar)">`];
  let x = PAD;
  for (const l of shown) {
    const w = (l.bytes / total) * barW;
    parts.push(`<rect x="${x.toFixed(1)}" y="${top}" width="${Math.max(w, 2).toFixed(1)}" height="10" fill="${l.color}"/>`);
    x += w;
  }
  parts.push('</g>');
  const colW = barW / COLS;
  shown.forEach((l, i) => {
    const lx = PAD + (i % COLS) * colW;
    const ly = top + 40 + Math.floor(i / COLS) * 26;
    const pct = (l.bytes / total) * 100;
    const pctText = pct < 0.1 ? '<0.1' : pct.toFixed(1);
    parts.push(`<circle cx="${lx + 5}" cy="${ly - 4}" r="5" fill="${l.color}"/><text x="${lx + 16}" y="${ly}" font-size="13"><tspan fill="${p.fg}" font-weight="600">${esc(fit(l.name, 13, colW - 70))}</tspan><tspan dx="6" fill="${p.muted}">${pctText}%</tspan></text>`);
  });
  const H = top + 40 + Math.ceil(shown.length / COLS) * 26 + 6;
  const repos = `${stats.repos} public ${stats.repos === 1 ? 'repository' : 'repositories'} of ${stats.login}`;
  const header = opts.title
    ? `<text x="${PAD}" y="34" fill="${p.fg}" font-size="16" font-weight="600">Languages</text><text x="${PAD + textWidth('Languages', 16) + 12}" y="34" fill="${p.muted}" font-size="13">${esc(`across ${repos}`)}</text>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}"><title>${esc(`Languages of ${stats.login}`)}</title>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="6" fill="${p.canvas}" stroke="${p.border}"/>
${header}${parts.join('')}</svg>`;
}

export function renderLanguagesError(message: string, theme?: string): string {
  const p = palette(theme, undefined);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="96" viewBox="0 0 ${W} 96" font-family="${FONT}"><title>NekoDB languages</title>
<rect x=".5" y=".5" width="${W - 1}" height="95" rx="6" fill="${p.canvas}" stroke="${p.border}"/>
<text x="${PAD}" y="34" fill="${p.fg}" font-size="16" font-weight="600">Languages</text><text x="${PAD}" y="66" fill="${p.muted}" font-size="13">${esc(message)}</text></svg>`;
}
