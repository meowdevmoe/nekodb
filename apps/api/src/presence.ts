// Turns discord.js member/presence objects into the public JSON shape. It follows Lanyard's
// field names so existing Lanyard clients can switch base URLs and keep working.
import { ActivityType, type Activity, type GuildMember, type User } from 'discord.js';

// Activities without a large image fall back to the application's own icon (public RPC info).
const appIcons = new Map<string, { url: string | null; at: number }>();
export async function appIconUrl(appId: string | null): Promise<string | null> {
  if (!appId) return null;
  const hit = appIcons.get(appId);
  if (hit && Date.now() - hit.at < 24 * 3600_000) return hit.url;
  let url: string | null = null;
  try {
    const res = await fetch(`https://discord.com/api/v10/applications/${appId}/rpc`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const app = (await res.json()) as { icon?: string | null };
      if (app.icon) url = `https://cdn.discordapp.com/app-icons/${appId}/${app.icon}.png?size=128`;
    }
  } catch {
    url = null;
  }
  appIcons.set(appId, { url, at: Date.now() });
  return url;
}

export interface NekoActivity {
  id: string;
  type: number;
  name: string;
  details: string | null;
  state: string | null;
  application_id: string | null;
  created_at: number;
  timestamps: { start?: number; end?: number } | null;
  assets: {
    large_image: string | null;
    large_text: string | null;
    small_image: string | null;
    small_text: string | null;
    large_image_url: string | null;
    small_image_url: string | null;
  } | null;
  emoji: { name: string | null; id: string | null; animated: boolean; url: string | null } | null;
  sync_id: string | null;
}

export interface NekoSpotify {
  track_id: string | null;
  song: string;
  artist: string;
  album: string | null;
  album_art_url: string | null;
  timestamps: { start?: number; end?: number } | null;
}

export interface NekoProfile {
  discord_user: {
    id: string;
    username: string;
    global_name: string | null;
    display_name: string;
    avatar: string | null;
    avatar_url: string;
    avatar_decoration_url: string | null;
    banner_url: string | null;
    accent_color: number | null;
    public_flags: number;
    bot: boolean;
  };
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_web: boolean;
  listening_to_spotify: boolean;
  spotify: NekoSpotify | null;
  activities: NekoActivity[];
}

function emojiUrl(emoji: Activity['emoji']): string | null {
  if (!emoji?.id) return null;
  return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=64`;
}

function activity(a: Activity): NekoActivity {
  const start = a.timestamps?.start?.getTime();
  const end = a.timestamps?.end?.getTime();
  return {
    id: a.type === ActivityType.Custom ? 'custom' : `${a.applicationId ?? a.name}:${a.type}`,
    type: a.type,
    name: a.name,
    details: a.details ?? null,
    state: a.state ?? null,
    application_id: a.applicationId ?? null,
    created_at: a.createdTimestamp,
    timestamps: start || end ? { ...(start ? { start } : {}), ...(end ? { end } : {}) } : null,
    assets: a.assets
      ? {
          large_image: a.assets.largeImage ?? null,
          large_text: a.assets.largeText ?? null,
          small_image: a.assets.smallImage ?? null,
          small_text: a.assets.smallText ?? null,
          large_image_url: a.assets.largeImageURL({ size: 256 }) ?? null,
          small_image_url: a.assets.smallImageURL({ size: 128 }) ?? null,
        }
      : null,
    emoji: a.emoji ? { name: a.emoji.name ?? null, id: a.emoji.id ?? null, animated: Boolean(a.emoji.animated), url: emojiUrl(a.emoji) } : null,
    sync_id: a.syncId ?? null,
  };
}

function spotify(activities: readonly Activity[]): NekoSpotify | null {
  const a = activities.find((x) => x.type === ActivityType.Listening && x.name === 'Spotify');
  if (!a) return null;
  const image = a.assets?.largeImage;
  const start = a.timestamps?.start?.getTime();
  const end = a.timestamps?.end?.getTime();
  return {
    track_id: a.syncId ?? null,
    song: a.details ?? '',
    artist: (a.state ?? '').replaceAll(';', ','),
    album: a.assets?.largeText ?? null,
    album_art_url: image?.startsWith('spotify:') ? `https://i.scdn.co/image/${image.slice(8)}` : null,
    timestamps: start || end ? { ...(start ? { start } : {}), ...(end ? { end } : {}) } : null,
  };
}

export function avatarUrl(user: User, size = 256): string {
  return user.avatar
    ? user.displayAvatarURL({ size, extension: 'png', forceStatic: true })
    : `https://cdn.discordapp.com/embed/avatars/${Number((BigInt(user.id) >> 22n) % 6n)}.png`;
}

export function toProfile(member: GuildMember, full: User | undefined): NekoProfile {
  const user = full ?? member.user;
  const presence = member.presence;
  const list = presence?.activities ?? [];
  const status = (presence?.status ?? 'offline') as NekoProfile['discord_status'];
  const decoration = user.avatarDecorationData?.asset
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatarDecorationData.asset}.png?size=160&passthrough=false`
    : null;
  const spot = spotify(list);
  return {
    discord_user: {
      id: user.id,
      username: user.username,
      global_name: user.globalName ?? null,
      display_name: member.displayName,
      avatar: user.avatar,
      avatar_url: avatarUrl(user),
      avatar_decoration_url: decoration,
      banner_url: user.banner ? user.bannerURL({ size: 600, extension: 'png', forceStatic: true }) ?? null : null,
      accent_color: user.accentColor ?? null,
      public_flags: user.flags?.bitfield ?? 0,
      bot: user.bot,
    },
    discord_status: status === ('invisible' as string) ? 'offline' : status,
    active_on_discord_desktop: Boolean(presence?.clientStatus?.desktop),
    active_on_discord_mobile: Boolean(presence?.clientStatus?.mobile),
    active_on_discord_web: Boolean(presence?.clientStatus?.web),
    listening_to_spotify: spot !== null,
    spotify: spot,
    activities: list.map(activity),
  };
}
