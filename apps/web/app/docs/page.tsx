import type { Metadata } from 'next';
import { Footer, Header, INVITE } from '@/components/site';

export const metadata: Metadata = {
  title: 'API reference',
  description: 'NekoDB API: Discord presence JSON (Lanyard-compatible), SVG Discord and Spotify cards, GitHub top languages and view counters. No key needed.',
  alternates: { canonical: '/docs/' },
  openGraph: { url: '/docs/', title: 'NekoDB API reference', images: [{ url: '/og.png', width: 1200, height: 630 }] },
};

const USER_JSON = `{
  "success": true,
  "data": {
    "discord_user": {
      "id": "1162826529768755283",
      "username": "meow.devv",
      "global_name": "秒码农",
      "display_name": "MeowDev",
      "avatar_url": "https://cdn.discordapp.com/avatars/…png?size=256",
      "avatar_decoration_url": null,
      "banner_url": "https://cdn.discordapp.com/banners/…png?size=600",
      "public_flags": 64
    },
    "discord_status": "online",
    "active_on_discord_desktop": true,
    "active_on_discord_mobile": false,
    "active_on_discord_web": false,
    "listening_to_spotify": true,
    "spotify": {
      "track_id": "6kVQzgU4lJUMaXmxEHe5pk",
      "song": "…",
      "artist": "…",
      "album": "…",
      "album_art_url": "https://i.scdn.co/image/…",
      "timestamps": { "start": 1793000000000, "end": 1793000196000 }
    },
    "activities": [ … ]
  }
}`;

function Endpoint({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <>
      <h3><span className="method">GET</span><code>{path}</code></h3>
      {children}
    </>
  );
}

export default function Docs() {
  return (
    <>
      <Header />
      <main className="container docs">
        <section className="hero">
          <h1>API reference</h1>
          <p>Everything is a plain GET on https://nekodb.space with no key. Images are SVG and never cached, so they are fresh on every view; JSON allows any origin.</p>
        </section>

        <h2>Discord</h2>
        <p>The NekoDB bot watches members of the <a href={INVITE} target="_blank" rel="noreferrer">NekoDB Discord server</a>. Join it once and your presence is available below. The JSON follows Lanyard&apos;s field names, so Lanyard clients work with a different base URL.</p>
        <Endpoint path="/api/v1/users/:id">
          <p>Live presence: status per device, activities with image URLs, Spotify. <code>404 user_not_monitored</code> if the account is not on the server.</p>
          <pre><code>{USER_JSON}</code></pre>
        </Endpoint>
        <Endpoint path="/card/:id.svg">
          <p>Discord card: avatar, status, custom status, game or app, Spotify track.</p>
        </Endpoint>
        <Endpoint path="/spotify/:id.svg">
          <p>Spotify card: cover, track, artist, album and progress, or a quiet card when nothing plays.</p>
        </Endpoint>
        <table>
          <thead><tr><th>Parameter</th><th>Values</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td><code>theme</code></td><td><code>dark</code>, <code>light</code></td><td><code>dark</code></td></tr>
            <tr><td><code>hide</code></td><td>comma list of <code>status</code>, <code>activity</code>, <code>spotify</code>, <code>decoration</code> (card only)</td><td>none</td></tr>
            <tr><td><code>bg</code></td><td>hex colour without <code>#</code></td><td>GitHub canvas</td></tr>
          </tbody>
        </table>

        <h2>GitHub languages</h2>
        <Endpoint path="/github/:login/languages.svg">
          <p>Bytes of code per language summed over the user&apos;s public repositories, forks left out. Refreshed every six hours. <code>languages.json</code> returns the numbers.</p>
        </Endpoint>
        <table>
          <thead><tr><th>Parameter</th><th>Values</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td><code>theme</code></td><td><code>dark</code>, <code>light</code></td><td><code>dark</code></td></tr>
            <tr><td><code>count</code></td><td>1 to 16; the rest becomes Other</td><td><code>8</code></td></tr>
            <tr><td><code>exclude</code></td><td>comma list of language names</td><td>none</td></tr>
            <tr><td><code>title</code></td><td><code>0</code> hides the title</td><td><code>1</code></td></tr>
          </tbody>
        </table>

        <h2>View counters</h2>
        <Endpoint path="/counter/:name.svg">
          <p>Adds one view and draws the total. Names are 1 to 64 of <code>A–Z a–z 0–9 . _ @ : -</code>. Repeat views from one address within five seconds count once. Moe-Counter links work too: <code>/@name?theme=…&amp;padding=…</code>.</p>
        </Endpoint>
        <Endpoint path="/counter/:name.json">
          <p>The current value, without counting a view.</p>
        </Endpoint>
        <table>
          <thead><tr><th>Parameter</th><th>Values</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td><code>theme</code></td><td>any name from <code>/api/v1/themes</code></td><td><code>rule34</code></td></tr>
            <tr><td><code>length</code></td><td>minimum digits, 1 to 16</td><td><code>7</code></td></tr>
            <tr><td><code>scale</code></td><td>0.2 to 3</td><td><code>1</code></td></tr>
            <tr><td><code>pixelated</code></td><td><code>0</code> smooths the digits</td><td><code>1</code></td></tr>
            <tr><td><code>inc</code></td><td><code>0</code> shows the value without counting</td><td>counts</td></tr>
          </tbody>
        </table>
        <Endpoint path="/api/v1/themes">
          <p>Theme names and digit sizes.</p>
        </Endpoint>
        <Endpoint path="/api/v1/status">
          <p>Whether the Discord gateway is connected and how many accounts are watched.</p>
        </Endpoint>
      </main>
      <Footer />
    </>
  );
}
