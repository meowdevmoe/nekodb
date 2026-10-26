// Renders nekodb.space/og.png from live widgets: the owner's Discord card (with the track that
// is playing right now), the languages card and the site's real view count. Run by
// nekodb-og.timer every five minutes; the PNG is swapped in atomically.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

const API = process.env.NEKODB_API ?? 'http://127.0.0.1:3741';
const OWNER = process.env.OG_DISCORD_ID ?? '1162826529768755283';
const GITHUB = process.env.OG_GITHUB ?? 'meowdevmoe';
const OUT = process.env.OG_OUT ?? '/home/meowdev/web/nekodb.space/public_html/og.png';
const WORK = process.env.OG_WORK ?? '/srv/nekodb/og-cache';
const HERE = path.dirname(new URL(import.meta.url).pathname);

async function fetchTo(url, file, check) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const body = await res.text();
    if (res.ok && check(body)) {
      fs.writeFileSync(path.join(WORK, file), body);
      return true;
    }
  } catch {}
  return fs.existsSync(path.join(WORK, file)); // keep the last good copy
}

const views = await fetch(`${API}/counter/nekodb-site.json`).then((r) => r.json()).then((j) => j.data.value).catch(() => 0);
const ok = [
  await fetchTo(`${API}/card/${OWNER}.svg?theme=dark`, 'card.svg', (b) => b.includes('live status of')),
  await fetchTo(`${API}/github/${GITHUB}/languages.svg?theme=dark`, 'langs.svg', (b) => b.includes('repositor')),
  await fetchTo(`${API}/counter-preview?theme=rule34&value=${String(Math.max(views, 1)).padStart(7, '0')}`, 'counter.svg', (b) => b.includes('<image')),
];
if (ok.includes(false)) throw new Error(`missing widget: ${ok}`);
fs.copyFileSync(path.join(HERE, 'og.html'), path.join(WORK, 'og.html'));

const types = { '.html': 'text/html', '.svg': 'image/svg+xml' };
const server = http.createServer((q, r) => {
  const f = path.join(WORK, path.basename(decodeURIComponent(q.url.split('?')[0])));
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = await puppeteer.launch({ executablePath: process.env.CHROMIUM ?? '/snap/bin/chromium', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${port}/og.html`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot({ type: 'png' });
  const png = await sharp(shot).resize(1200, 630, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toBuffer();
  const tmp = `${OUT}.tmp`;
  fs.writeFileSync(tmp, png);
  fs.renameSync(tmp, OUT);
  console.log(`og.png ${png.length} bytes, views ${views}`);
} finally {
  await browser.close();
  server.close();
}
