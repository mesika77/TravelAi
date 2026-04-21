const Landing = ({ onPlan, tweaks }) => {
  return (
    <div className="landing">
      {/* HERO */}
      <section className={"hero hero-" + tweaks.hero}>
        <div className="wrap hero-inner">
          <div className="hero-left">
            <div className="eyebrow" style={{color:"var(--ink-3)"}}>№ 026 · Spring edition · 2026</div>
            <h1 className="hero-title">
              A trip,<br/>
              <em className="hero-em">carefully</em> planned<br/>
              in sixty seconds.
            </h1>
            <p className="hero-sub">
              Real-time flights, visa checks, hotels, weather, things to do, and an
              AI concierge who's read every guidebook — composed into a single
              shareable page.
            </p>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <div className="mono mute">Powered by</div>
                <div className="serif" style={{fontSize: 20}}>Llama 3.3</div>
              </div>
              <div className="hero-meta-item">
                <div className="mono mute">Live data</div>
                <div className="serif" style={{fontSize: 20}}>7 services</div>
              </div>
              <div className="hero-meta-item">
                <div className="mono mute">Plans built</div>
                <div className="serif tabular" style={{fontSize: 20}}>184,302</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="photo hero-photo" data-label="Destination photography"></div>
            <div className="hero-stamp">
              <div className="mono" style={{fontSize: 9, letterSpacing: ".2em"}}>Boarding · 2026</div>
              <div className="serif" style={{fontSize: 28, fontStyle:"italic"}}>Lisbon</div>
              <div className="mono mute" style={{fontSize: 10}}>38.72°N / 9.13°W</div>
            </div>
          </div>
        </div>

        <div className="hero-marquee mono">
          Flights · Visa · Hotels · Weather · Activities · Currency · Concierge ·&nbsp;
          Flights · Visa · Hotels · Weather · Activities · Currency · Concierge
        </div>
      </section>

      {/* SEARCH */}
      <section className="wrap search-section">
        <div className="search-section-head">
          <div>
            <div className="eyebrow">Begin here</div>
            <h2 className="serif" style={{fontSize: 44, marginTop: 8}}>
              Three questions. One perfect itinerary.
            </h2>
          </div>
          <div className="mono mute" style={{maxWidth: 260}}>
            Your answers encode to a single shareable link — no account, no database.
          </div>
        </div>
        <SearchForm onSubmit={onPlan} />
      </section>

      {/* WHAT YOU GET */}
      <section className="wrap what-section">
        <div className="what-head">
          <div className="eyebrow">What arrives</div>
          <h2 className="serif" style={{fontSize: 36, marginTop: 6, maxWidth: 560}}>
            Seven services, composed on one page.
          </h2>
        </div>
        <div className="what-grid">
          {[
            { n: "01", t: "Flights", d: "Real-time Google Flights via SerpAPI. Top three by price, carbon, and time.", icon: <IPlane/> },
            { n: "02", t: "Visa", d: "Travel Buddy AI. Same-country shortcut. Offline CSV fallback.", icon: <IShield/> },
            { n: "03", t: "Hotels", d: "Xotelo listings with nightly rates for your exact dates.", icon: <IHotel/> },
            { n: "04", t: "Weather", d: "Historical archive — the same week, last year. No forecast surprises.", icon: <ICloud/> },
            { n: "05", t: "Activities", d: "Google Maps places scored against your declared interests.", icon: <ICompass/> },
            { n: "06", t: "Currency", d: "Live rates. Your budget, in their pocket.", icon: <ICoin/> },
            { n: "07", t: "Concierge", d: "Llama 3.3 with full trip context loaded. Streams in milliseconds.", icon: <ISparkle/> },
          ].map(f => (
            <div className="what-cell" key={f.n}>
              <div className="what-num mono">{f.n}</div>
              <div className="what-icon">{f.icon}</div>
              <div className="what-title serif">{f.t}</div>
              <div className="what-desc mute">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS STRIP */}
      <section className="dest-strip">
        <div className="wrap">
          <div className="dest-head">
            <div className="eyebrow">In season</div>
            <div className="mono mute">May · 2026</div>
          </div>
          <div className="dest-grid">
            {[
              ["Lisbon","Portugal","21°","from $642"],
              ["Kyoto","Japan","19°","from $1,120"],
              ["Marrakech","Morocco","27°","from $780"],
              ["Reykjavík","Iceland","11°","from $520"],
            ].map(d => (
              <a key={d[0]} className="dest-card">
                <div className="photo dest-photo" data-label="Destination"></div>
                <div className="dest-meta">
                  <div className="serif" style={{fontSize: 22}}>{d[0]}</div>
                  <div className="mono mute" style={{fontSize: 11}}>{d[1]} · {d[2]} avg</div>
                  <div className="serif" style={{fontSize: 14, color:"var(--accent)", marginTop: 10}}>{d[3]} →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap foot-inner">
          <div>
            <div className="serif" style={{fontSize: 28, marginBottom: 14}}>
              Travel<em style={{color:"var(--accent)"}}>AI</em>
            </div>
            <div className="mute" style={{maxWidth: 320, fontSize: 13}}>
              An experiment in composing seven travel APIs into a single considered surface.
              Open source.
            </div>
          </div>
          <div className="foot-cols">
            <div>
              <div className="mono mute" style={{marginBottom: 10}}>Product</div>
              <a>Plan a trip</a><a>Example itinerary</a><a>Concierge</a>
            </div>
            <div>
              <div className="mono mute" style={{marginBottom: 10}}>Built with</div>
              <a>Next.js 16</a><a>Tailwind v4</a><a>Groq · Llama 3.3</a>
            </div>
            <div>
              <div className="mono mute" style={{marginBottom: 10}}>Source</div>
              <a>GitHub</a><a>Design spec</a><a>Changelog</a>
            </div>
          </div>
        </div>
        <div className="wrap foot-bottom mono mute">
          © 2026 TravelAI · Crafted in transit · v2.4.1
        </div>
      </footer>
    </div>
  );
};

window.Landing = Landing;
