import Fastify, { type FastifyReply } from 'fastify';
import { config } from './config.js';
import { COUNTER_NAME, current, view } from './counters.js';
import { discord } from './discord.js';
import { toProfile } from './presence.js';
import { renderCard, renderNotMonitored, renderSpotify, renderUnavailable, type CardOptions } from './svg/card.js';
import { GITHUB_LOGIN, languageStats } from './github.js';
import { renderLanguages, renderLanguagesError } from './svg/languages.js';
import { DEFAULT_THEME, hasTheme, loadThemes, renderCounter, themeInfo, type CounterOptions } from './svg/counter.js';

const SNOWFLAKE = /^\d{17,20}$/;
const HIDE_KEYS = new Set(['status', 'activity', 'spotify', 'decoration']);

type Query = Record<string, string | undefined>;

function num(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) && value !== undefined && value !== '' ? Math.min(max, Math.max(min, n)) : fallback;
}

function flag(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return !['0', 'false', 'no', 'off'].includes(value.toLowerCase());
}

function svg(reply: FastifyReply, body: string, status = 200) {
  return reply
    .code(status)
    .header('Content-Type', 'image/svg+xml; charset=utf-8')
    .header('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate')
    .send(body);
}

function cardOptions(q: Query): CardOptions {
  const hide = new Set((q.hide ?? '').split(',').map((s) => s.trim()).filter((s) => HIDE_KEYS.has(s)));
  return { theme: q.theme, bg: q.bg, radius: num(q.radius, 6, 0, 12), hide };
}

function counterOptions(q: Query): CounterOptions {
  const theme = q.theme && hasTheme(q.theme) ? q.theme : DEFAULT_THEME;
  return {
    theme,
    length: num(q.length ?? q.padding, 7, 1, 16),
    scale: num(q.scale, 1, 0.2, 3),
    pixelated: flag(q.pixelated, true),
    gap: num(q.gap ?? q.offset, 0, -20, 40),
  };
}

const stripExt = (s: string) => s.replace(/\.(svg|json)$/i, '');

async function main() {
  await loadThemes(config.themesDir);
  discord.start();

  const app = Fastify({ trustProxy: true, logger: { level: 'warn' } });
  app.addHook('onSend', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('X-Content-Type-Options', 'nosniff');
  });

  app.get('/health', async () => ({ ok: true }));

  app.get('/api/v1/status', async () => ({
    success: true,
    data: { gateway: discord.state, monitored_users: discord.memberCount(), invite: config.inviteUrl || null },
  }));

  app.get('/api/v1/themes', async () => ({ success: true, data: { default: DEFAULT_THEME, themes: themeInfo() } }));

  app.get<{ Params: { id: string } }>('/api/v1/users/:id', async (req, reply) => {
    const id = stripExt(req.params.id);
    if (!SNOWFLAKE.test(id)) return reply.code(400).send({ success: false, error: { code: 'invalid_id', message: 'Not a Discord user ID' } });
    if (discord.state !== 'ready') {
      return reply.code(503).send({ success: false, error: { code: 'gateway_unavailable', message: `Discord gateway is ${discord.state}` } });
    }
    const member = discord.member(id);
    if (!member) {
      return reply.code(404).send({
        success: false,
        error: { code: 'user_not_monitored', message: 'This user is not in the NekoDB Discord server', invite: config.inviteUrl || null },
      });
    }
    return { success: true, data: toProfile(member, await discord.profile(id)) };
  });

  app.get<{ Params: { id: string }; Querystring: Query }>('/card/:id', async (req, reply) => {
    const id = stripExt(req.params.id);
    // GitHub's camo drops non-2xx images, so the explanation cards are sent as 200.
    if (discord.state !== 'ready') return svg(reply, renderUnavailable(req.query.theme));
    const member = SNOWFLAKE.test(id) ? discord.member(id) : undefined;
    if (!member) return svg(reply, renderNotMonitored(id, config.inviteUrl, req.query.theme));
    return svg(reply, await renderCard(toProfile(member, await discord.profile(id)), cardOptions(req.query)));
  });

  app.get<{ Params: { id: string }; Querystring: Query }>('/spotify/:id', async (req, reply) => {
    const id = stripExt(req.params.id);
    // GitHub's camo drops non-2xx images, so the explanation cards are sent as 200.
    if (discord.state !== 'ready') return svg(reply, renderUnavailable(req.query.theme));
    const member = SNOWFLAKE.test(id) ? discord.member(id) : undefined;
    if (!member) return svg(reply, renderNotMonitored(id, config.inviteUrl, req.query.theme));
    return svg(reply, await renderSpotify(toProfile(member, await discord.profile(id)), cardOptions(req.query)));
  });

  // Preview of a theme for the site's picker: shows 0123456789 and counts nothing.
  app.get<{ Querystring: Query }>('/counter-preview', async (req, reply) => {
    const digits = /^\d{1,10}$/.test(req.query.value ?? '') ? req.query.value! : '0123456789';
    return svg(reply, renderCounter(digits, { ...counterOptions(req.query), length: digits.length }));
  });

  const counter = async (name: string, q: Query, ip: string, reply: FastifyReply) => {
    if (!COUNTER_NAME.test(name)) return reply.code(400).send({ success: false, error: { code: 'invalid_name', message: 'Use 1–64 of A–Z a–z 0–9 . _ @ : -' } });
    const value = q.inc === '0' ? current(name) : view(name, ip);
    return svg(reply, renderCounter(value, counterOptions(q)));
  };

  app.get<{ Params: { name: string }; Querystring: Query }>('/counter/:name', async (req, reply) => {
    const raw = req.params.name;
    if (raw.endsWith('.json')) {
      const name = stripExt(raw);
      if (!COUNTER_NAME.test(name)) return reply.code(400).send({ success: false, error: { code: 'invalid_name' } });
      return { success: true, data: { name, value: current(name) } };
    }
    return counter(stripExt(raw), req.query, req.ip, reply);
  });

  // Moe-Counter compatible path: /@name?theme=…&padding=…
  app.get<{ Params: { name: string }; Querystring: Query }>('/@:name', async (req, reply) =>
    counter(stripExt(req.params.name), req.query, req.ip, reply),
  );


  // GitHub top languages for any user: /github/:login/languages.svg (?theme, count, exclude, title)
  app.get<{ Params: { login: string; kind: string }; Querystring: Query }>('/github/:login/:kind', async (req, reply) => {
    const login = req.params.login;
    const kind = req.params.kind;
    const q = req.query;
    const asJson = kind === 'languages.json';
    if (!['languages', 'languages.svg', 'languages.json'].includes(kind)) return reply.code(404).send({ success: false, error: { code: 'not_found' } });
    if (!GITHUB_LOGIN.test(login)) return asJson ? reply.code(400).send({ success: false, error: { code: 'invalid_login' } }) : svg(reply, renderLanguagesError('Not a GitHub username', q.theme));
    let stats;
    try {
      stats = await languageStats(login);
    } catch {
      return asJson ? reply.code(503).send({ success: false, error: { code: 'github_unavailable' } }) : svg(reply, renderLanguagesError('GitHub is not answering right now, try again later', q.theme));
    }
    if (!stats) return asJson ? reply.code(404).send({ success: false, error: { code: 'user_not_found' } }) : svg(reply, renderLanguagesError(`GitHub user ${login} not found`, q.theme));
    if (asJson) return { success: true, data: stats };
    const exclude = new Set((q.exclude ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));
    return svg(reply, renderLanguages(stats, { theme: q.theme, bg: q.bg, count: num(q.count, 8, 1, 16), exclude, title: flag(q.title, true) }));
  });

  await app.listen({ port: config.port, host: config.host });
  console.log(`nekodb api on ${config.host}:${config.port}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
