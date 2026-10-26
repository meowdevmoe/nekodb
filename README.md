<p align="center">
  <a href="https://nekodb.space"><img src="https://nekodb.space/og.png" alt="NekoDB: live widgets for your GitHub README" width="720"></a>
</p>

# NekoDB

Live widgets for GitHub profile READMEs: your **Discord status**, the track playing on **Spotify**, your **top languages** and anime-style **view counters**, served as plain SVG images. Free, no sign-up, open API.

[Builder](https://nekodb.space) | [API reference](https://nekodb.space/docs/) | [Discord server](https://discord.gg/TjGfUHPeWW)

## What it looks like

These images are live, straight from nekodb.space:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://nekodb.space/card/1162826529768755283.svg?theme=dark">
  <img src="https://nekodb.space/card/1162826529768755283.svg?theme=light" alt="Discord card">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://nekodb.space/github/meowdevmoe/languages.svg?theme=dark">
  <img src="https://nekodb.space/github/meowdevmoe/languages.svg?theme=light" alt="Top languages">
</picture>

<p align="center"><img src="https://nekodb.space/counter/github-nekodb.svg" alt="Views of this repository"></p>

## Use it

1. **Discord and Spotify cards:** join the [NekoDB Discord server](https://discord.gg/TjGfUHPeWW) (Discord only shares presence with bots that share a server with you), then copy your user ID.
2. Open the [builder](https://nekodb.space), pick a widget and a theme.
3. Paste the code into your README:

```md
![Discord](https://nekodb.space/card/YOUR_DISCORD_ID.svg?theme=dark)
![Spotify](https://nekodb.space/spotify/YOUR_DISCORD_ID.svg?theme=dark)
![Languages](https://nekodb.space/github/YOUR_GITHUB_LOGIN/languages.svg?theme=dark)
![Views](https://nekodb.space/counter/YOUR_COUNTER_NAME.svg?theme=rule34)
```

Every picture inside the SVG is embedded, so it renders through GitHub's image proxy, and the images are sent with `no-cache` so they refresh on every view. The builder's **Auto** theme wraps both variants in a `<picture>` tag that follows the reader's light or dark mode.

## API

All endpoints are plain `GET` requests with no key. Full reference: [nekodb.space/docs](https://nekodb.space/docs/).

| Endpoint | Returns |
| --- | --- |
| `/api/v1/users/:id` | Live Discord presence as JSON, with Lanyard's field names |
| `/card/:id.svg` | Discord card: avatar, status, custom status, game or app, Spotify track |
| `/spotify/:id.svg` | Spotify card: cover, track, artist, progress |
| `/github/:login/languages.svg` | Share of each language across public, non-fork repositories (`.json` for numbers) |
| `/counter/:name.svg` | View counter, one view per visit (`.json` reads without counting) |
| `/@:name` | The same counter on Moe-Counter compatible URLs |
| `/api/v1/themes` | Counter themes and digit sizes |

## How it works

- `apps/api`: Node 24 and TypeScript on Fastify. A discord.js gateway client keeps every server member's presence in memory, so card requests never wait on Discord. Cards are SVG strings with images inlined as WebP data URIs (sharp). Counters live in SQLite (better-sqlite3).
- `apps/web`: the builder and docs, Next.js 16 as a static export with GitHub's Primer colours and Octicons.
- `tools/og`: renders `og.png` from the live widgets with headless Chromium, on a timer.

## Run your own

You need Docker, Node 24 for the site, and a Discord application with a bot.

1. In the [Discord developer portal](https://discord.com/developers/applications) create a bot, turn on the **Presence** and **Server Members** privileged intents and invite it to your server.
2. Copy `.env.example` to `deploy/.env` and fill it in. A GitHub token with no scopes is optional; it raises the languages widget's GitHub rate limit from 60 to 5000 requests an hour.
3. Start the API: `docker compose -f deploy/docker-compose.yml up -d --build` (it listens on `127.0.0.1:3741`).
4. Build the site with your own values and serve `apps/web/out`:
   ```sh
   npm ci
   NEXT_PUBLIC_SITE_URL=https://your-domain.example \
   NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/your-invite \
   NEXT_PUBLIC_DEMO_DISCORD_ID=your-discord-id \
   npm run build -w @nekodb/web
   ```
5. Route the API paths to the container; `deploy/nginx.conf` is a starting point.

## Develop

```sh
npm ci
DISCORD_TOKEN=… DISCORD_GUILD_ID=… DB_PATH=./dev.sqlite npm run dev -w @nekodb/api   # API on :3741
npm run dev -w @nekodb/web                                                           # site on :4310, proxies the API
DISCORD_TOKEN=x DISCORD_GUILD_ID=x npx tsx apps/api/src/sample.ts ./out              # render sample cards offline
```

## Credits

- Counter digits from [Moe-Counter](https://github.com/journey-ad/Moe-Counter) by journey-ad (MIT); themes with adult content are left out.
- Language colours from [GitHub Linguist](https://github.com/github-linguist/linguist) (MIT).
- The presence JSON follows [Lanyard](https://github.com/Phineas/lanyard)'s field names so its clients work here too.

NekoDB is not affiliated with Discord, Spotify or GitHub.

## License

[MIT](LICENSE)
