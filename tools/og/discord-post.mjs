// Posts the #start-here guide (Components V2) with the current live og.png.
import fs from 'node:fs';
const T = process.env.DISCORD_TOKEN;
const setup = JSON.parse(fs.readFileSync(new URL('./discord-setup.json', import.meta.url)));
const components = [{
  type: 17, accent_color: 0x3fb950, components: [
    { type: 12, items: [{ media: { url: 'attachment://nekodb.png' }, description: 'NekoDB widgets in a GitHub README' }] },
    { type: 10, content: '# NekoDB\nLive widgets for your GitHub README: your Discord status, the track playing on Spotify, your top languages and anime view counters. Free, no sign-up.' },
    { type: 14, divider: true, spacing: 1 },
    { type: 10, content: '## Get your Discord card\n**1.** Stay in this server. The bot can only see the status of people who are here.\n**2.** Copy your user ID: Settings, Advanced, turn on Developer Mode, then right-click your name and pick **Copy User ID**.\n**3.** Open **nekodb.space**, paste the ID, choose a theme and copy the code into your README.' },
    { type: 14, divider: true, spacing: 1 },
    { type: 10, content: '## What else is there\n- **Spotify card**: cover, track and progress of what you are listening to\n- **Languages**: share of each language across your public GitHub repositories\n- **View counters**: 42 anime and pixel-art themes, one view per visit\n-# Counters and languages work without joining. The JSON API uses Lanyard field names.' },
    { type: 1, components: [
      { type: 2, style: 5, label: 'Open the builder', url: 'https://nekodb.space/#discord' },
      { type: 2, style: 5, label: 'API reference', url: 'https://nekodb.space/docs/' },
      { type: 2, style: 5, label: 'View counters', url: 'https://nekodb.space/#counter' },
    ] },
  ],
}];
const form = new FormData();
form.append('payload_json', JSON.stringify({ flags: 1 << 15, components, attachments: [{ id: 0, filename: 'nekodb.png' }] }));
form.append('files[0]', new Blob([fs.readFileSync(new URL('./og-live.png', import.meta.url))], { type: 'image/png' }), 'nekodb.png');
const r = await fetch(`https://discord.com/api/v10/channels/${setup.channel}/messages`, { method: 'POST', headers: { Authorization: `Bot ${T}` }, body: form });
const j = await r.json();
console.log(r.status, j.id ?? JSON.stringify(j).slice(0, 300));
if (j.id) fs.writeFileSync(new URL('./discord-setup.json', import.meta.url), JSON.stringify({ ...setup, message: j.id }));
