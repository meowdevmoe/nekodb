import { CodeIcon, EyeIcon, PersonIcon, PlayIcon } from '@primer/octicons-react';
import { INVITE } from './site';

const FEATURES = [
  { icon: <PersonIcon size={20} />, title: 'Discord status card', text: 'Shows your avatar, online status, custom status, the game or app you have open and the Spotify track playing, straight from Discord. Join the NekoDB server once and the card follows you in real time.' },
  { icon: <PlayIcon size={20} />, title: 'Spotify now playing', text: 'Cover art, track, artist and a progress bar for whatever you are listening to, read from your Discord presence. No Spotify login or token needed.' },
  { icon: <CodeIcon size={20} />, title: 'Top languages', text: 'The share of each language across your public GitHub repositories, with GitHub’s own language colours. Forks are left out and you can hide languages you do not want shown.' },
  { icon: <EyeIcon size={20} />, title: 'View counters', text: '42 anime and pixel-art counter themes from Moe-Counter. Pick a name, paste the image, and every visit to your profile adds one.' },
];

export const FAQ = [
  { q: 'Is NekoDB free?', a: 'Yes. There is no sign-up, no limit on widgets and no paid plan. The API is open and needs no key.' },
  { q: 'Why do I have to join the Discord server?', a: 'Discord only shares presence (status, games, Spotify) with bots that are in a server with you. The NekoDB bot watches members of its server and nothing else.' },
  { q: 'How do I find my Discord user ID?', a: 'In Discord open Settings, Advanced and turn on Developer Mode. Then right-click your name anywhere and choose Copy User ID.' },
  { q: 'Can I use it instead of Lanyard?', a: 'Yes. /api/v1/users/:id returns the same field names as Lanyard, so most Lanyard clients only need a different base URL.' },
  { q: 'How fresh is the data?', a: 'Discord and Spotify cards are drawn on every request from the live presence. Language totals are refreshed every six hours. Images are sent with no-cache headers so GitHub fetches them again on each view.' },
  { q: 'Does the image work on GitHub?', a: 'Yes. Every picture inside the SVG is embedded, so it renders through GitHub’s image proxy. The Auto theme uses a <picture> tag to follow the reader’s light or dark mode.' },
];

export function About() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'NekoDB',
      url: 'https://nekodb.space/',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      description: 'Live widgets for GitHub profile READMEs: Discord status, Spotify now playing, top languages and view counters.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: FEATURES.map((f) => f.title),
      image: 'https://nekodb.space/og.png',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return (
    <>
      <section className="about" aria-labelledby="features">
        <h2 id="features">What you can add to your README</h2>
        <div className="features">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="about" aria-labelledby="how">
        <h2 id="how">How it works</h2>
        <ol className="steps">
          <li><b>Join the <a href={INVITE} target="_blank" rel="noreferrer">NekoDB Discord server</a></b><span>Only needed for the Discord and Spotify cards. Counters and languages work without it.</span></li>
          <li><b>Pick a widget above</b><span>Enter your Discord ID, GitHub username or a counter name and choose a theme.</span></li>
          <li><b>Copy the code into your README</b><span>Markdown or HTML. The image stays live: no rebuilds, no GitHub Actions.</span></li>
        </ol>
      </section>
      <section className="about" aria-labelledby="faq">
        <h2 id="faq">Questions</h2>
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
