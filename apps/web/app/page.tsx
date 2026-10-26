import { Builder } from '@/components/Builder';
import { Footer, Header, INVITE } from '@/components/site';

export default function Home() {
  return (
    <>
      <Header />
      <main className="container">
        <section className="hero">
          <h1>Live widgets for your GitHub README</h1>
          <p>Your Discord status, the track you have on in Spotify, your top languages and a view counter, as plain images. Free, no sign-up: pick a widget, copy the code into your README.</p>
          <div className="actions">
            <a className="btn btn-primary" href={INVITE} target="_blank" rel="noreferrer">Join the Discord</a>
            <a className="btn" href="/docs/">API reference</a>
          </div>
        </section>
        <Builder />
      </main>
      <Footer />
    </>
  );
}
