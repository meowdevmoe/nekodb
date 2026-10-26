// Language totals for a GitHub user: bytes per language summed over their public, non-fork
// repositories (what GitHub shows per repo, added up). One GraphQL call with a token; without
// one, the REST fallback costs a request per repo, so results are cached for six hours.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const COLORS: Record<string, string> = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../assets/linguist-colors.json', import.meta.url)), 'utf8'));
const TTL_MS = 6 * 3600_000;
const TOKEN = process.env.GITHUB_TOKEN ?? '';
export const GITHUB_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

export interface LanguageStats {
  login: string;
  repos: number;
  total: number;
  languages: { name: string; bytes: number; color: string }[];
}

const cache = new Map<string, { at: number; data: LanguageStats | null }>();
const headers = () => ({
  'User-Agent': 'NekoDB (+https://nekodb.space)',
  Accept: 'application/vnd.github+json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
});

async function viaGraphql(login: string): Promise<LanguageStats | null> {
  const query = `query($login:String!){ user(login:$login){ login repositories(first:100, ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC){ totalCount nodes{ languages(first:20){ edges{ size node{ name color } } } } } } }`;
  const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { ...headers(), 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables: { login } }), signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`github graphql ${res.status}`);
  const json = (await res.json()) as { data?: { user: null | { login: string; repositories: { totalCount: number; nodes: { languages: { edges: { size: number; node: { name: string; color: string | null } }[] } }[] } } } };
  const user = json.data?.user;
  if (!user) return null;
  const sums = new Map<string, number>();
  for (const repo of user.repositories.nodes) for (const e of repo.languages.edges) sums.set(e.node.name, (sums.get(e.node.name) ?? 0) + e.size);
  return build(user.login, user.repositories.totalCount, sums);
}

async function viaRest(login: string): Promise<LanguageStats | null> {
  const res = await fetch(`https://api.github.com/users/${login}/repos?per_page=100&type=owner&sort=pushed`, { headers: headers(), signal: AbortSignal.timeout(8000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`github rest ${res.status}`);
  const repos = ((await res.json()) as { fork: boolean; languages_url: string; owner: { login: string } }[]).filter((r) => !r.fork);
  const sums = new Map<string, number>();
  for (const repo of repos.slice(0, 40)) {
    const r = await fetch(repo.languages_url, { headers: headers(), signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`github languages ${r.status}`);
    for (const [name, bytes] of Object.entries((await r.json()) as Record<string, number>)) sums.set(name, (sums.get(name) ?? 0) + bytes);
  }
  return build(repos[0]?.owner.login ?? login, repos.length, sums);
}

function build(login: string, repos: number, sums: Map<string, number>): LanguageStats {
  const languages = [...sums.entries()].map(([name, bytes]) => ({ name, bytes, color: COLORS[name] ?? '#8b949e' })).sort((a, b) => b.bytes - a.bytes);
  return { login, repos, total: languages.reduce((s, l) => s + l.bytes, 0), languages };
}

export async function languageStats(login: string): Promise<LanguageStats | null> {
  const key = login.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  try {
    const data = TOKEN ? await viaGraphql(login) : await viaRest(login);
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch (error) {
    if (hit) return hit.data; // GitHub is down or rate-limited: serve the last known numbers
    throw error;
  }
}
