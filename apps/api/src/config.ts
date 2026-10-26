import { fileURLToPath } from 'node:url';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3741),
  host: process.env.HOST ?? '0.0.0.0',
  token: required('DISCORD_TOKEN'),
  guildId: required('DISCORD_GUILD_ID'),
  inviteUrl: process.env.DISCORD_INVITE ?? '',
  dbPath: process.env.DB_PATH ?? '/data/nekodb.sqlite',
  themesDir: process.env.THEMES_DIR ?? fileURLToPath(new URL('../assets/themes', import.meta.url)),
  publicUrl: process.env.PUBLIC_URL ?? 'https://nekodb.space',
};
