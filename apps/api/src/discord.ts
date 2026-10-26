// Watches the NekoDB guild: every member's presence (status, activities, Spotify) is kept in
// discord.js caches, so profile requests never call Discord. Presences need the privileged
// Presence and Server Members intents; until they are enabled in the developer portal the
// gateway refuses to connect (close code 4014) and we retry every two minutes.
import { Client, GatewayIntentBits, Partials, type Guild, type GuildMember, type User } from 'discord.js';
import { EventEmitter } from 'node:events';
import { config } from './config.js';

export type GatewayState = 'connecting' | 'ready' | 'intents_missing' | 'error';

const RETRY_MS = 120_000;
const PROFILE_TTL_MS = 10 * 60_000;

class DiscordWatcher extends EventEmitter {
  state: GatewayState = 'connecting';
  lastError: string | null = null;
  private client: Client | null = null;
  private profiles = new Map<string, { user: User; at: number }>();

  start() {
    void this.connect();
  }

  private async connect() {
    this.state = 'connecting';
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
      partials: [Partials.GuildMember, Partials.User],
    });
    client.once('clientReady', async () => {
      this.state = 'ready';
      this.lastError = null;
      try {
        await this.guild()?.members.fetch({ withPresences: true });
      } catch (error) {
        console.error('member fetch failed', error);
      }
      console.log(`gateway ready: ${this.guild()?.memberCount ?? 0} members in ${config.guildId}`);
    });
    client.on('presenceUpdate', (_old, presence) => {
      if (presence.guild?.id === config.guildId && presence.userId) this.emit('presence', presence.userId);
    });
    client.on('guildMemberUpdate', (_old, member) => this.emit('presence', member.id));
    client.on('userUpdate', (_old, user) => {
      this.profiles.delete(user.id);
      this.emit('presence', user.id);
    });
    client.on('error', (error) => console.error('gateway error', error));
    try {
      await client.login(config.token);
      this.client = client;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.lastError = message;
      this.state = /disallowed intents/i.test(message) ? 'intents_missing' : 'error';
      console.error(`gateway login failed (${this.state}): ${message}; retrying in ${RETRY_MS / 1000}s`);
      await client.destroy().catch(() => undefined);
      setTimeout(() => void this.connect(), RETRY_MS);
    }
  }

  guild(): Guild | undefined {
    return this.client?.guilds.cache.get(config.guildId);
  }

  member(id: string): GuildMember | undefined {
    return this.guild()?.members.cache.get(id);
  }

  memberCount(): number {
    return this.guild()?.members.cache.size ?? 0;
  }

  /** The full user (banner and accent colour need a REST fetch), cached for ten minutes. */
  async profile(id: string): Promise<User | undefined> {
    const cached = this.profiles.get(id);
    if (cached && Date.now() - cached.at < PROFILE_TTL_MS) return cached.user;
    const member = this.member(id);
    if (!member || !this.client) return undefined;
    try {
      const user = await this.client.users.fetch(id, { force: true });
      this.profiles.set(id, { user, at: Date.now() });
      return user;
    } catch {
      return member.user;
    }
  }
}

export const discord = new DiscordWatcher();
