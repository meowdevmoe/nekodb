import { LiveImage } from './LiveImage';
import { DEMO_ID, INVITE } from './site';

/** Theme-following live image, like the snippets the builder hands out. */
function Live({ path, alt }: { path: string; alt: string }) {
  const sep = path.includes('?') ? '&' : '?';
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={`${path}${sep}theme=dark`} />
      <img src={`${path}${sep}theme=light`} alt={alt} loading="lazy" />
    </picture>
  );
}

export const FAQ = [
  { q: 'Is NekoDB free?', a: 'Yes. There is no sign-up, no limit on widgets and no paid plan. The API is open and needs no key.' },
  { q: 'Why join the Discord server?', a: 'Discord only shares presence (status, games, Spotify) with bots that are in a server with you. The NekoDB bot watches members of its own server and nothing else.' },
  { q: 'Where is my Discord user ID?', a: 'In Discord open Settings, Advanced and turn on Developer Mode. Then right-click your name anywhere and choose Copy User ID.' },
  { q: 'Can it replace Lanyard?', a: 'Yes. /api/v1/users/:id returns Lanyard’s field names, so most Lanyard clients only need a different base URL.' },
  { q: 'How fresh is the data?', a: 'Discord and Spotify cards are drawn from your live presence on every request. Language totals refresh every six hours.' },
  { q: 'Does it work on GitHub?', a: 'Yes. Every picture inside the SVG is embedded, so it passes GitHub’s image proxy, and the Auto theme follows the reader’s light or dark mode.' },
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
      featureList: ['Discord status card', 'Spotify now playing card', 'GitHub top languages', 'Anime view counters'],
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
      <section className="show" aria-labelledby="show-discord">
        <p className="eyebrow">Discord</p>
        <h2 id="show-discord">Your status, right in your README.</h2>
        <p className="lede">Avatar, online status, custom status, the game or app you have open and the song on Spotify. <a href={INVITE} target="_blank" rel="noreferrer">Join the NekoDB server</a> once and the card follows you in real time.</p>
        <div className="show-media"><LiveImage id={DEMO_ID} src={`/card/${DEMO_ID}.svg`} alt="A live NekoDB Discord card" /></div>
      </section>
      <section className="show" aria-labelledby="show-spotify">
        <p className="eyebrow">Spotify</p>
        <h2 id="show-spotify">Now playing, no Spotify login.</h2>
        <p className="lede">Cover, track, artist and how far into the song you are, read from your Discord presence. Nothing to connect, no token to paste.</p>
        <div className="show-media"><LiveImage id={DEMO_ID} src={`/spotify/${DEMO_ID}.svg`} alt="A live NekoDB Spotify card" /></div>
      </section>
      <section className="show" aria-labelledby="show-languages">
        <p className="eyebrow">Languages</p>
        <h2 id="show-languages">What you write, in GitHub’s colours.</h2>
        <p className="lede">Every public repository you own, forks left out, summed by language. Hide the ones you would rather not show.</p>
        <div className="show-media"><Live path="/github/meowdevmoe/languages.svg" alt="A NekoDB languages card" /></div>
      </section>
      <section className="show" aria-labelledby="show-counters">
        <p className="eyebrow">View counters</p>
        <h2 id="show-counters">A counter with some character.</h2>
        <p className="lede">Forty-two anime and pixel-art themes from Moe-Counter. Pick a name, paste the image, and every visit adds one.</p>
        <div className="show-media counters">
          <img src="/counter-preview?theme=rule34&value=0004096" alt="rule34 counter theme" loading="lazy" />
          <img src="/counter-preview?theme=gelbooru&value=0001337&scale=0.7" alt="gelbooru counter theme" loading="lazy" />
          <img src="/counter-preview?theme=capoo-2&value=0000815&scale=0.6" alt="capoo counter theme" loading="lazy" />
        </div>
      </section>
      <section className="qa" aria-labelledby="faq">
        <h2 id="faq">Questions</h2>
        <dl>
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
