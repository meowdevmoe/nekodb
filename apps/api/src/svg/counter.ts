// View counters drawn from Moe-Counter's digit images (MIT). Digits are embedded as data URIs
// so the SVG renders through GitHub's camo; animated GIFs keep animating inside it.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

interface Digit { uri: string; width: number; height: number }
export interface Theme { name: string; digits: Digit[]; height: number }

const themes = new Map<string, Theme>();
export const DEFAULT_THEME = 'rule34';

export async function loadThemes(dir: string): Promise<void> {
  for (const name of fs.readdirSync(dir).sort()) {
    const files = fs.readdirSync(path.join(dir, name));
    const digits: Digit[] = [];
    for (let d = 0; d < 10; d++) {
      const file = files.find((f) => f.startsWith(`${d}.`));
      if (!file) throw new Error(`theme ${name} has no digit ${d}`);
      const buf = fs.readFileSync(path.join(dir, name, file));
      const meta = await sharp(buf, { animated: false }).metadata();
      const mime = file.endsWith('.gif') ? 'image/gif' : 'image/png';
      digits.push({ uri: `data:${mime};base64,${buf.toString('base64')}`, width: meta.width ?? 45, height: meta.pageHeight ?? meta.height ?? 100 });
    }
    themes.set(name, { name, digits, height: Math.max(...digits.map((x) => x.height)) });
  }
}

export function themeNames(): string[] {
  return [...themes.keys()];
}

export function themeInfo() {
  return [...themes.values()].map((t) => ({ name: t.name, height: t.height, widths: t.digits.map((d) => d.width) }));
}

export function hasTheme(name: string): boolean {
  return themes.has(name);
}

export interface CounterOptions { theme: string; length: number; scale: number; pixelated: boolean; gap: number }

export function renderCounter(value: number | string, opts: CounterOptions): string {
  const theme = themes.get(opts.theme) ?? themes.get(DEFAULT_THEME)!;
  const text = String(value).padStart(opts.length, '0');
  let x = 0;
  const parts: string[] = [];
  for (const ch of text) {
    const digit = theme.digits[Number(ch)]!;
    const w = digit.width * opts.scale;
    const h = digit.height * opts.scale;
    parts.push(`<image x="${x}" y="${theme.height * opts.scale - h}" width="${w}" height="${h}" href="${digit.uri}"/>`);
    x += w + opts.gap;
  }
  const width = Math.max(1, x - opts.gap);
  const height = theme.height * opts.scale;
  const style = opts.pixelated ? ' style="image-rendering: pixelated"' : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"${style}><title>${typeof value === 'number' ? `${value} views` : 'NekoDB counter'}</title>${parts.join('')}</svg>`;
}
