// SVGs shown through GitHub's camo (an <img>) cannot load external images, so every picture
// is fetched here, shrunk and inlined as a data URI. Results are cached for half an hour.
import sharp from 'sharp';

const TTL_MS = 30 * 60_000;
const MAX_ENTRIES = 600;
const cache = new Map<string, { uri: string | null; at: number }>();

export async function inlineImage(url: string | null | undefined, size: number): Promise<string | null> {
  if (!url) return null;
  const key = `${size}:${url}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.uri;
  let uri: string | null = null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), headers: { 'User-Agent': 'NekoDB (+https://nekodb.space)' } });
    if (res.ok) {
      const input = Buffer.from(await res.arrayBuffer());
      const webp = await sharp(input, { animated: false }).resize(size, size, { fit: 'cover' }).webp({ quality: 86, alphaQuality: 90 }).toBuffer();
      uri = `data:image/webp;base64,${webp.toString('base64')}`;
    }
  } catch {
    uri = null;
  }
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
  cache.set(key, { uri, at: Date.now() });
  return uri;
}
