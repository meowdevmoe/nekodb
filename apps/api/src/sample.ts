// Renders sample cards from fixed data (no gateway) to check the design: tsx src/sample.ts <outdir>
import fs from 'node:fs';
import { renderCard, renderSpotify } from './svg/card.js';
import type { NekoProfile } from './presence.js';

const out = process.argv[2] ?? '.';
const now = Date.now();
const profile: NekoProfile = {
  discord_user: {
    id: '1162826529768755283', username: 'meow.devv', global_name: '秒码农', display_name: 'MeowDev',
    avatar: '92fd7f89f04144144959bda401820e23',
    avatar_url: 'https://cdn.discordapp.com/avatars/1162826529768755283/92fd7f89f04144144959bda401820e23.png?size=256',
    avatar_decoration_url: null, banner_url: null, accent_color: null, public_flags: 64, bot: false,
  },
  discord_status: 'dnd', active_on_discord_desktop: true, active_on_discord_mobile: false, active_on_discord_web: false,
  listening_to_spotify: true,
  spotify: {
    track_id: '6kVQzgU4lJUMaXmxEHe5pk', song: 'i like wasting my time with you', artist: 'sample artist', album: 'sample album',
    album_art_url: 'https://i.scdn.co/image/ab67616d00001e02c85f39d596ed79290fefcdb8',
    timestamps: { start: now - 83_000, end: now - 83_000 + 196_000 },
  },
  activities: [
    { id: 'custom', type: 4, name: 'Custom Status', details: null, state: 'building nekodb.space', application_id: null, created_at: now,
      timestamps: null, assets: null, emoji: { name: '🐾', id: null, animated: false, url: null }, sync_id: null },
    { id: 'vsc:0', type: 0, name: 'Visual Studio Code', details: 'Editing card.ts', state: 'Workspace: nekodb', application_id: '383226320970055681',
      created_at: now, timestamps: { start: now - 47 * 60_000 },
      assets: { large_image: null, large_text: null, small_image: null, small_text: null,
        large_image_url: null, small_image_url: null },
      emoji: null, sync_id: null },
  ],
};
for (const theme of ['dark', 'light']) {
  fs.writeFileSync(`${out}/card-${theme}.svg`, await renderCard(profile, { theme, radius: 6, hide: new Set() }));
  fs.writeFileSync(`${out}/spotify-${theme}.svg`, await renderSpotify(profile, { theme, radius: 6, hide: new Set() }));
}
fs.writeFileSync(`${out}/spotify-idle.svg`, await renderSpotify({ ...profile, spotify: null, listening_to_spotify: false }, { theme: 'dark', radius: 6, hide: new Set() }));
console.log('ok');
