// Discord and Spotify cards in the style of the profile's "StrinovaHub activity" card:
// 840px wide, a 16px title with a muted note beside it, a visual on the left and large
// values with small labels on the right. Primer colours, GitHub's font stack.
import { inlineImage } from '../images.js';
import { appIconUrl, type NekoActivity, type NekoProfile } from '../presence.js';
import { elapsed, duration, esc, fit, FONT, palette, statusLook, textWidth, type Palette } from './util.js';

const W = 840;
const PAD = 24;
const SPOTIFY_GREEN = '#1db954';

export interface CardOptions {
  theme?: string;
  bg?: string;
  radius: number;
  hide: Set<string>;
}

let clipSeq = 0;
function image(uri: string | null, x: number, y: number, size: number, r: number, p: Palette): string {
  const id = `n${++clipSeq}`;
  if (!uri) return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" fill="${p.subtle}"/>`;
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}"/></clipPath><image href="${uri}" x="${x}" y="${y}" width="${size}" height="${size}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/>`;
}

function frame(h: number, p: Palette, radius: number, title: string, heading: string, note: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" font-family="${FONT}"><title>${esc(title)}</title>
<rect x=".5" y=".5" width="${W - 1}" height="${h - 1}" rx="${radius}" fill="${p.canvas}" stroke="${p.border}"/>
<text x="${PAD}" y="34" fill="${p.fg}" font-size="16" font-weight="600">${esc(heading)}</text>
<text x="${PAD + textWidth(heading, 16) + 12}" y="34" fill="${p.muted}" font-size="13">${esc(fit(note, 13, W - PAD * 2 - textWidth(heading, 16) - 12))}</text>`;
}

/** A large value with a small label under it, like the numbers on the activity card. */
function fact(x: number, y: number, w: number, value: string, label: string, p: Palette, color?: string, size = 18): string {
  return `<text x="${x}" y="${y}" fill="${color ?? p.fg}" font-size="${size}" font-weight="600">${esc(fit(value, size, w))}</text><text x="${x}" y="${y + 20}" fill="${p.muted}" font-size="13">${esc(fit(label, 13, w))}</text>`;
}

function bar(x: number, y: number, w: number, start: number, end: number, p: Palette): string {
  const total = Math.max(1, end - start);
  const done = Math.min(total, Math.max(0, Date.now() - start));
  return `<rect x="${x}" y="${y}" width="${w}" height="8" rx="4" fill="${p.subtle}"/><rect x="${x}" y="${y}" width="${Math.max(8, (done / total) * w)}" height="8" rx="4" fill="${SPOTIFY_GREEN}"/>
<text x="${x}" y="${y + 24}" fill="${p.muted}" font-size="11">${duration(done)}</text><text x="${x + w}" y="${y + 24}" fill="${p.muted}" font-size="11" text-anchor="end">${duration(total)}</text>`;
}

const VERBS: Record<number, string> = { 0: 'playing', 1: 'streaming', 2: 'listening to', 3: 'watching', 5: 'competing in' };

function mainActivity(profile: NekoProfile): NekoActivity | undefined {
  return profile.activities.find((a) => a.type !== 4 && !(a.type === 2 && a.name === 'Spotify'));
}

function device(profile: NekoProfile): string {
  const on = [profile.active_on_discord_desktop && 'desktop', profile.active_on_discord_mobile && 'mobile', profile.active_on_discord_web && 'web'].filter(Boolean);
  return on.length ? `on ${on.join(' and ')}` : 'not connected';
}

export async function renderCard(profile: NekoProfile, opts: CardOptions): Promise<string> {
  const p = palette(opts.theme, opts.bg);
  const user = profile.discord_user;
  const custom = profile.activities.find((a) => a.type === 4);
  const activity = opts.hide.has('activity') ? undefined : mainActivity(profile);
  const spotify = opts.hide.has('spotify') ? null : profile.spotify;
  const [avatar, decoration, emoji, actIcon] = await Promise.all([
    inlineImage(user.avatar_url, 192),
    opts.hide.has('decoration') ? null : inlineImage(user.avatar_decoration_url, 224),
    inlineImage(custom?.emoji?.url, 40),
    activity ? appIconUrl(activity.application_id).then((f) => inlineImage(activity.assets?.large_image_url ?? f, 64)) : null,
  ]);
  const st = statusLook(profile.discord_status, p);
  const H = 221;
  const parts: string[] = [];

  // left: avatar with status, display name, login, custom status
  const AV = 96;
  const ay = 62;
  parts.push(image(avatar, PAD, ay, AV, AV / 2, p));
  if (decoration) parts.push(`<image href="${decoration}" x="${PAD - AV * 0.1}" y="${ay - AV * 0.1}" width="${AV * 1.2}" height="${AV * 1.2}"/>`);
  if (!opts.hide.has('status')) parts.push(`<circle cx="${PAD + AV - 12}" cy="${ay + AV - 12}" r="13" fill="${p.canvas}"/><circle cx="${PAD + AV - 12}" cy="${ay + AV - 12}" r="9" fill="${st.color}"/>`);
  const tx = PAD + AV + 20;
  const leftW = 260;
  parts.push(`<text x="${tx}" y="${ay + 30}" fill="${p.fg}" font-size="24" font-weight="600">${esc(fit(user.display_name, 24, leftW))}</text>`);
  parts.push(`<text x="${tx}" y="${ay + 52}" fill="${p.muted}" font-size="13">${esc(fit(user.username, 13, leftW))}</text>`);
  if (custom?.state || custom?.emoji) {
    let ex = tx;
    if (emoji) { parts.push(`<image href="${emoji}" x="${ex}" y="${ay + 68}" width="16" height="16"/>`); ex += 22; }
    else if (custom.emoji?.name) { parts.push(`<text x="${ex}" y="${ay + 81}" font-size="14">${esc(custom.emoji.name)}</text>`); ex += 22; }
    if (custom.state) parts.push(`<text x="${ex}" y="${ay + 81}" fill="${p.fg}" font-size="13">${esc(fit(custom.state, 13, leftW - (ex - tx)))}</text>`);
  }

  // right: status (narrow) and activity (wide) on top, the Spotify track under them
  const RX = 420;
  const statusW = 150;
  const actX = opts.hide.has('status') ? RX : RX + statusW + 20;
  const actW = W - PAD - actX;
  if (!opts.hide.has('status')) parts.push(fact(RX, 84, statusW, st.label, device(profile), p, st.color));
  if (activity) {
    const since = activity.timestamps?.start ? elapsed(Date.now() - activity.timestamps.start) : '';
    const label = [VERBS[activity.type] ?? 'playing', since].filter(Boolean).join(' ');
    if (actIcon) {
      parts.push(image(actIcon, actX, 66, 22, 5, p));
      parts.push(fact(actX + 30, 84, actW - 30, activity.name, label, p));
    } else parts.push(fact(actX, 84, actW, activity.name, label, p));
  } else parts.push(fact(actX, 84, actW, 'Nothing', 'no game or app running', p, p.muted));
  const colW = (W - PAD - RX - 24) / 2;
  if (spotify) {
    parts.push(fact(RX, 148, colW * 2 + 24, spotify.song, `${spotify.artist} on Spotify`, p));
    if (spotify.timestamps?.start && spotify.timestamps.end) parts.push(bar(RX, 182, colW * 2 + 24, spotify.timestamps.start, spotify.timestamps.end, p));
  } else parts.push(fact(RX, 148, colW * 2 + 24, 'Not listening', 'nothing playing on Spotify', p, p.muted));

  return `${frame(H, p, opts.radius, `${user.display_name} on Discord`, 'Discord', `live status of ${user.username}`)}${parts.join('\n')}</svg>`;
}

export async function renderSpotify(profile: NekoProfile, opts: CardOptions): Promise<string> {
  const p = palette(opts.theme, opts.bg);
  const s = profile.spotify;
  const name = profile.discord_user.username;
  if (!s) {
    return `${frame(110, p, opts.radius, 'Not listening to Spotify', 'Spotify', `what ${name} is playing`)}
${fact(PAD, 76, W - PAD * 2, 'Not listening', 'nothing playing on Spotify right now', p, p.muted)}</svg>`;
  }
  const album = await inlineImage(s.album_art_url, 256);
  const H = 221;
  const AL = 135;
  const ax = PAD + AL + 24;
  const aw = W - ax - PAD;
  const parts = [
    image(album, PAD, 62, AL, 6, p),
    `<text x="${ax}" y="${92}" fill="${p.fg}" font-size="24" font-weight="600">${esc(fit(s.song, 24, aw))}</text>`,
    `<text x="${ax}" y="${116}" fill="${p.muted}" font-size="13">${esc(fit(s.album ? `${s.artist}, ${s.album}` : s.artist, 13, aw))}</text>`,
  ];
  if (s.timestamps?.start && s.timestamps.end) parts.push(bar(ax, 164, aw, s.timestamps.start, s.timestamps.end, p));
  return `${frame(H, p, opts.radius, `${s.song} by ${s.artist}`, 'Spotify', `what ${name} is playing now`)}${parts.join('\n')}</svg>`;
}

function notice(p: Palette, heading: string, note: string, value: string, label: string): string {
  return `${frame(110, p, 6, heading, heading, note)}
${fact(PAD, 76, W - PAD * 2, value, label, p, p.muted, 18)}</svg>`;
}

export function renderNotMonitored(id: string, invite: string, theme?: string): string {
  return notice(palette(theme, undefined), 'Discord', `account ${id}`, 'Not on NekoDB yet', invite ? `join ${invite.replace(/^https?:\/\//, '')} to show a live card` : 'join the NekoDB Discord server to show a live card');
}

export function renderUnavailable(theme?: string): string {
  return notice(palette(theme, undefined), 'Discord', 'live status', 'Reconnecting to Discord', 'the card will come back on its own');
}
