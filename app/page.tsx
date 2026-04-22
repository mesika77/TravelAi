import SearchForm from '@/components/SearchForm'
import DestinationsStrip from '@/components/DestinationsStrip'
import DestinationPhoto from '@/components/DestinationPhoto'
import {
  Plane, Shield, Building2, Cloud, Compass, Coins, Sparkles,
} from 'lucide-react'

const WHAT_ITEMS = [
  { n: '01', t: 'Flights', d: 'Real-time Google Flights via SerpAPI. Top three by price, carbon, and time.', Icon: Plane },
  { n: '02', t: 'Visa', d: 'Travel Buddy AI. Same-country shortcut. Offline CSV fallback.', Icon: Shield },
  { n: '03', t: 'Hotels', d: 'Xotelo listings with nightly rates for your exact dates.', Icon: Building2 },
  { n: '04', t: 'Weather', d: 'Historical archive — the same week, last year. No forecast surprises.', Icon: Cloud },
  { n: '05', t: 'Activities', d: 'Google Maps places scored against your declared interests.', Icon: Compass },
  { n: '06', t: 'Currency', d: 'Live rates. Your budget, in their pocket.', Icon: Coins },
  { n: '07', t: 'Concierge', d: 'Llama 3.3 with full trip context loaded. Streams in milliseconds.', Icon: Sparkles },
]

export default function HomePage() {
  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero hero-gradient">
        <div className="wrap hero-inner">
          <div className="hero-left">
            <div className="eyebrow" style={{ color: 'var(--ink-3)' }}>
              № 026 · Spring edition · 2026
            </div>
            <h1 className="hero-title">
              A trip,<br />
              <em className="hero-em">carefully</em> planned<br />
              in sixty seconds.
            </h1>
            <p className="hero-sub">
              Real-time flights, visa checks, hotels, weather, things to do, and an
              AI concierge who&apos;s read every guidebook — composed into a single
              shareable page.
            </p>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <div className="mono mute">Powered by</div>
                <div className="serif" style={{ fontSize: 20 }}>Llama 3.3</div>
              </div>
              <div className="hero-meta-item">
                <div className="mono mute">Live data</div>
                <div className="serif" style={{ fontSize: 20 }}>7 services</div>
              </div>
              <div className="hero-meta-item">
                <div className="mono mute">Plans built</div>
                <div className="serif tabular" style={{ fontSize: 20 }}>184,302</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <DestinationPhoto
              city="Lisbon"
              query="rooftops golden hour travel"
              className="hero-photo"
              style={{ borderRadius: 'var(--r-lg)' }}
            />
            <div className="hero-stamp">
              <div className="mono" style={{ fontSize: 9, letterSpacing: '.2em' }}>Boarding · 2026</div>
              <div className="serif" style={{ fontSize: 28, fontStyle: 'italic' }}>Lisbon</div>
              <div className="mono mute" style={{ fontSize: 10 }}>38.72°N / 9.13°W</div>
            </div>
          </div>
        </div>

        <div className="hero-marquee mono">
          Flights · Visa · Hotels · Weather · Activities · Currency · Concierge ·&nbsp;
          Flights · Visa · Hotels · Weather · Activities · Currency · Concierge
        </div>
      </section>

      {/* SEARCH */}
      <section className="wrap search-section" id="search-section">
        <div className="search-section-head">
          <div>
            <div className="eyebrow">Begin here</div>
            <h2 className="serif" style={{ fontSize: 44, marginTop: 8 }}>
              Three questions. One perfect itinerary.
            </h2>
          </div>
          <div className="mono mute" style={{ maxWidth: 260 }}>
            Your answers encode to a single shareable link — no account, no database.
          </div>
        </div>
        <SearchForm />
      </section>

      {/* WHAT YOU GET */}
      <section className="wrap what-section">
        <div className="what-head">
          <div className="eyebrow">What arrives</div>
          <h2 className="serif" style={{ fontSize: 36, marginTop: 6, maxWidth: 560 }}>
            Seven services, composed on one page.
          </h2>
        </div>
        <div className="what-grid">
          {WHAT_ITEMS.map(({ n, t, d, Icon }) => (
            <div className="what-cell" key={n}>
              <div className="what-num mono">{n}</div>
              <div className="what-icon"><Icon size={20} strokeWidth={1.5} /></div>
              <div className="what-title serif">{t}</div>
              <div className="what-desc mute">{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS STRIP — dynamic per location + season */}
      <DestinationsStrip />

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap foot-inner">
          <div>
            <div className="serif" style={{ fontSize: 28, marginBottom: 14 }}>
              Travel<em style={{ color: 'var(--accent)' }}>AI</em>
            </div>
            <div className="mute" style={{ maxWidth: 320, fontSize: 13 }}>
              An experiment in composing seven travel APIs into a single considered surface.
              Open source.
            </div>
          </div>
          <div className="foot-cols">
            <div>
              <div className="mono mute" style={{ marginBottom: 10 }}>Product</div>
              <a href="/">Plan a trip</a>
              <a href="#search-section">Search</a>
              <a href="#concierge">Concierge</a>
            </div>
            <div>
              <div className="mono mute" style={{ marginBottom: 10 }}>Built with</div>
              <a>Next.js 16</a>
              <a>Tailwind v4</a>
              <a>Groq · Llama 3.3</a>
            </div>
            <div>
              <div className="mono mute" style={{ marginBottom: 10 }}>Source</div>
              <a href="https://github.com/maormesika/TravelAi" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
        <div className="wrap foot-bottom mono mute">
          © 2026 TravelAI · Crafted in transit · v2.5.0
        </div>
      </footer>
    </div>
  )
}
