// Mock data for the results page — NYC → Lisbon trip
const MOCK_TRIP = {
  origin: "New York",
  destination: "Lisbon",
  originCode: "JFK",
  destCode: "LIS",
  departureDate: "2026-05-12",
  returnDate: "2026-05-19",
  oneWay: false,
  adults: 2,
  children: 0,
  budget: 2400,
  passport: "US",
  interests: ["food", "culture", "beaches"],
  nights: 7,
};

const MOCK_FLIGHTS = [
  { airline: "TAP Air Portugal", code: "TP204", stops: "Nonstop", dur: "7h 15m", dep: "21:50", arr: "09:05+1", price: 642, co2: 580, from: "JFK", to: "LIS" },
  { airline: "Delta", code: "DL134", stops: "1 stop · LHR", dur: "11h 40m", dep: "18:30", arr: "10:10+1", price: 698, co2: 720, from: "JFK", to: "LIS" },
  { airline: "United", code: "UA936", stops: "1 stop · FRA", dur: "12h 25m", dep: "20:15", arr: "12:40+1", price: 714, co2: 760, from: "EWR", to: "LIS" },
];

const MOCK_HOTELS = [
  { name: "Memmo Alfama", stars: 4, low: 210, high: 280, neighborhood: "Alfama" },
  { name: "Valverde Hotel", stars: 5, low: 340, high: 440, neighborhood: "Avenida" },
  { name: "The Lumiares", stars: 4, low: 260, high: 320, neighborhood: "Bairro Alto" },
];

const MOCK_ACTIVITIES = {
  food: [
    { name: "Time Out Market", type: "Food hall", rating: 4.6, reviews: "42k" },
    { name: "Cervejaria Ramiro", type: "Seafood", rating: 4.7, reviews: "18k" },
    { name: "Pastéis de Belém", type: "Bakery · 1837", rating: 4.5, reviews: "68k" },
    { name: "Taberna da Rua das Flores", type: "Portuguese", rating: 4.6, reviews: "3.2k" },
    { name: "Cantinho do Avillez", type: "Chef's table", rating: 4.5, reviews: "4.1k" },
  ],
  culture: [
    { name: "Jerónimos Monastery", type: "UNESCO site", rating: 4.7, reviews: "91k" },
    { name: "MAAT", type: "Contemporary art", rating: 4.3, reviews: "12k" },
    { name: "Fado in Chiado", type: "Live performance", rating: 4.5, reviews: "2.8k" },
    { name: "Gulbenkian Museum", type: "Art collection", rating: 4.7, reviews: "14k" },
  ],
  beaches: [
    { name: "Praia do Guincho", type: "Windswept coast · 40 min", rating: 4.6, reviews: "9.1k" },
    { name: "Cascais Bay", type: "Family beach · 35 min", rating: 4.5, reviews: "22k" },
    { name: "Costa da Caparica", type: "Long strand · 25 min", rating: 4.4, reviews: "11k" },
  ],
};

const MOCK_WEATHER = [
  { d: "Mon", h: 22, l: 14, rain: 10 }, { d: "Tue", h: 23, l: 15, rain: 0 },
  { d: "Wed", h: 21, l: 14, rain: 40 }, { d: "Thu", h: 20, l: 13, rain: 60 },
  { d: "Fri", h: 22, l: 14, rain: 20 }, { d: "Sat", h: 24, l: 16, rain: 0 },
  { d: "Sun", h: 25, l: 17, rain: 0 },
];

// ========= FLIGHTS SECTION =========
const FlightsSection = () => (
  <section className="sec">
    <div className="section-head">
      <div>
        <div className="kicker">01 · Outbound</div>
        <h2 className="section-title serif">Flights</h2>
      </div>
      <div className="mono mute">3 of 47 results · sorted by price</div>
    </div>

    <div className="flight-route">
      <div className="route-point">
        <div className="serif tabular" style={{fontSize: 32}}>JFK</div>
        <div className="mono mute">New York</div>
      </div>
      <div className="route-line">
        <div className="route-dash"></div>
        <IPlane size={16} style={{color:"var(--accent)"}}/>
        <div className="route-dash"></div>
      </div>
      <div className="route-point">
        <div className="serif tabular" style={{fontSize: 32}}>LIS</div>
        <div className="mono mute">Lisbon</div>
      </div>
      <div className="route-dates">
        <div className="mono mute">Out</div>
        <div className="serif tabular">May 12</div>
      </div>
      <div className="route-dates">
        <div className="mono mute">Back</div>
        <div className="serif tabular">May 19</div>
      </div>
    </div>

    <div className="flight-list">
      {MOCK_FLIGHTS.map((f, i) => (
        <div key={i} className={"flight-row" + (i === 0 ? " flight-row-best" : "")}>
          <div className="flight-airline">
            <div className="airline-mark serif">{f.airline.slice(0,2)}</div>
            <div>
              <div style={{fontSize: 14, fontWeight: 500}}>{f.airline}</div>
              <div className="mono mute">{f.code}</div>
            </div>
          </div>
          <div className="flight-times">
            <div className="serif tabular" style={{fontSize: 22}}>{f.dep}</div>
            <div className="mono mute">{f.from}</div>
          </div>
          <div className="flight-dur">
            <div className="mono mute" style={{fontSize: 10}}>{f.dur}</div>
            <div className="dur-line"></div>
            <div className="mono mute" style={{fontSize: 10}}>{f.stops}</div>
          </div>
          <div className="flight-times">
            <div className="serif tabular" style={{fontSize: 22}}>{f.arr}</div>
            <div className="mono mute">{f.to}</div>
          </div>
          <div className="flight-co2" title="CO₂ per passenger">
            <ILeaf size={13}/>
            <span className="mono tabular">{f.co2}kg</span>
          </div>
          <div className="flight-price">
            <div className="serif tabular" style={{fontSize: 26}}>${f.price}</div>
            <button className="btn-link mono">Book <IExternal size={11}/></button>
          </div>
          {i === 0 && <div className="best-ribbon mono">Best value</div>}
        </div>
      ))}
    </div>
  </section>
);

// ========= HOTELS =========
const HotelsSection = () => (
  <section className="sec">
    <div className="section-head">
      <div>
        <div className="kicker">02 · Where to stay</div>
        <h2 className="section-title serif">Hotels</h2>
      </div>
      <div className="mono mute">7 nights · 2 travelers</div>
    </div>

    <div className="hotel-grid">
      {MOCK_HOTELS.map((h,i) => (
        <div key={i} className="hotel-card">
          <div className="photo hotel-photo" data-label="Hotel photo"></div>
          <div className="hotel-body">
            <div className="mono mute">{h.neighborhood}</div>
            <div className="serif" style={{fontSize: 22, marginTop: 4}}>{h.name}</div>
            <div className="stars">
              {"★".repeat(h.stars)}<span style={{opacity:.25}}>{"★".repeat(5-h.stars)}</span>
            </div>
            <div className="hr"></div>
            <div className="hotel-price">
              <div>
                <div className="mono mute">Per night</div>
                <div className="serif tabular" style={{fontSize: 22}}>${h.low}–${h.high}</div>
              </div>
              <button className="btn-link mono">View <IExternal size={11}/></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ========= ACTIVITIES =========
const ActivitiesSection = () => {
  const [expanded, setExpanded] = React.useState({});
  const labels = { food: "Food", culture: "Culture", beaches: "Beaches" };
  return (
    <section className="sec">
      <div className="section-head">
        <div>
          <div className="kicker">03 · Things to do</div>
          <h2 className="section-title serif">Activities</h2>
        </div>
        <div className="mono mute">Matched to your interests · via Google Maps</div>
      </div>

      {Object.keys(MOCK_ACTIVITIES).map(cat => {
        const items = MOCK_ACTIVITIES[cat];
        const isOpen = expanded[cat];
        const shown = isOpen ? items : items.slice(0, 3);
        return (
          <div key={cat} className="act-cat">
            <div className="act-cat-head">
              <h3 className="serif" style={{fontSize: 22}}>{labels[cat]}</h3>
              {items.length > 3 && (
                <button className="btn-link mono" onClick={() => setExpanded(e => ({...e, [cat]: !isOpen}))}>
                  {isOpen ? "Show less" : `Show all ${items.length}`}
                </button>
              )}
            </div>
            <div className="act-list">
              {shown.map((a,i) => (
                <div key={i} className="act-item">
                  <div className="act-index mono">{String(i+1).padStart(2,"0")}</div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 15, fontWeight: 500}}>{a.name}</div>
                    <div className="mono mute">{a.type}</div>
                  </div>
                  <div className="act-rating">
                    <span className="serif tabular" style={{fontSize: 18}}>{a.rating}</span>
                    <span className="mono mute">{a.reviews}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className="mono mute" style={{fontStyle:"italic", marginTop: 12}}>
        Note: results may skew toward popular categories.
      </div>
    </section>
  );
};

// ========= VISA =========
const VisaSection = () => (
  <section className="sec-sm">
    <div className="sec-sm-head">
      <div className="kicker">Visa</div>
      <IShield size={14} style={{color:"var(--ink-4)"}}/>
    </div>
    <div className="visa-body">
      <div className="visa-badge">
        <div className="visa-dot" style={{background:"var(--go)"}}></div>
        <span className="mono">Visa free</span>
      </div>
      <div className="serif" style={{fontSize: 22, marginTop: 12, lineHeight: 1.3}}>
        US passport holders enter Portugal visa-free for up to <span className="tabular">90 days</span>.
      </div>
      <div className="hr"></div>
      <div className="visa-meta">
        <div><div className="mono mute">Passport</div><div>🇺🇸 United States</div></div>
        <div><div className="mono mute">Destination</div><div>🇵🇹 Portugal</div></div>
      </div>
      <a className="btn-link mono" style={{marginTop: 12}}>Embassy source <IExternal size={11}/></a>
    </div>
  </section>
);

// ========= COST =========
const CostSection = () => {
  const flights = 1284; const hotels = 1890; const daily = 1260;
  const total = flights + hotels + daily;
  return (
    <section className="sec-sm card-ink">
      <div className="sec-sm-head">
        <div className="kicker" style={{color:"color-mix(in oklch, var(--paper) 55%, transparent)"}}>Estimate</div>
        <IWallet size={14} style={{color:"color-mix(in oklch, var(--paper) 55%, transparent)"}}/>
      </div>
      <div className="serif tabular" style={{fontSize: 56, lineHeight: 1, marginTop: 16}}>
        ${total.toLocaleString()}
      </div>
      <div className="mono" style={{color:"color-mix(in oklch, var(--paper) 60%, transparent)", marginTop: 6}}>
        Total · 2 travelers · 7 nights
      </div>
      <div className="hr hr-ink" style={{marginTop: 22}}></div>
      {[
        ["Flights", "$642 × 2", flights],
        ["Hotels", "$270 × 7 × 2", hotels],
        ["Daily · food, transit, play", "$90 × 7 × 2", daily],
      ].map(r => (
        <div key={r[0]} className="cost-row">
          <div>
            <div style={{fontSize: 14}}>{r[0]}</div>
            <div className="mono" style={{color:"color-mix(in oklch, var(--paper) 50%, transparent)"}}>{r[1]}</div>
          </div>
          <div className="serif tabular" style={{fontSize: 20}}>${r[2].toLocaleString()}</div>
        </div>
      ))}
    </section>
  );
};

// ========= WEATHER =========
const WeatherSection = () => {
  const max = 30;
  return (
    <section className="sec-sm">
      <div className="sec-sm-head">
        <div className="kicker">Weather</div>
        <ICloud size={14} style={{color:"var(--ink-4)"}}/>
      </div>
      <div style={{display:"flex", gap: 18, alignItems:"baseline", marginTop: 10}}>
        <div>
          <div className="serif tabular" style={{fontSize: 44, lineHeight:1}}>22°<span style={{fontSize: 22, color:"var(--ink-3)"}}>/14°</span></div>
          <div className="mono mute">Avg high/low · °C</div>
        </div>
        <div style={{marginLeft:"auto", textAlign:"right"}}>
          <div className="serif tabular" style={{fontSize: 28}}>18%</div>
          <div className="mono mute">Rainy days</div>
        </div>
      </div>
      <div className="weather-chart">
        {MOCK_WEATHER.map((w,i) => (
          <div key={i} className="wx-col">
            <div className="wx-bar-wrap">
              <div className="wx-bar-high" style={{height: `${(w.h/max)*100}%`}}></div>
              <div className="wx-bar-low" style={{height: `${(w.l/max)*100}%`}}></div>
              {w.rain > 30 && <div className="wx-rain" title={`${w.rain}% rain`}></div>}
            </div>
            <div className="mono mute" style={{fontSize: 10, marginTop: 6}}>{w.d}</div>
          </div>
        ))}
      </div>
      <div className="mono mute" style={{fontSize: 10, fontStyle:"italic"}}>
        Historical · same week, 2025 · Open-Meteo
      </div>
    </section>
  );
};

// ========= CURRENCY =========
const CurrencySection = () => (
  <section className="sec-sm">
    <div className="sec-sm-head">
      <div className="kicker">Currency</div>
      <ICoin size={14} style={{color:"var(--ink-4)"}}/>
    </div>
    <div className="curr-main">
      <div>
        <div className="mono mute">1 USD</div>
        <div className="serif tabular" style={{fontSize: 36}}>€0.92</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div className="mono mute">Your budget</div>
        <div className="serif tabular" style={{fontSize: 24}}>€2,208</div>
      </div>
    </div>
    <div className="hr"></div>
    <div className="curr-ref">
      {[[50,46],[100,92],[200,184],[500,460]].map(([u,e]) => (
        <div key={u} className="curr-ref-row">
          <span className="mono tabular">${u}</span>
          <span className="serif tabular">€{e}</span>
        </div>
      ))}
    </div>
  </section>
);

Object.assign(window, {
  MOCK_TRIP, FlightsSection, HotelsSection, ActivitiesSection,
  VisaSection, CostSection, WeatherSection, CurrencySection
});
