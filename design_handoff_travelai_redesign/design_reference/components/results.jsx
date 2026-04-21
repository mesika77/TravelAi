const Results = () => {
  return (
    <div className="results">
      {/* Trip bar */}
      <div className="trip-bar">
        <div className="wrap trip-bar-inner">
          <div className="trip-route">
            <span className="mono mute">From</span>
            <span className="serif" style={{fontSize: 20}}>New York</span>
            <IArrowRight size={14} style={{color:"var(--accent)"}}/>
            <span className="serif" style={{fontSize: 20}}>Lisbon</span>
          </div>
          <div className="trip-meta mono mute">
            <span>May 12 – May 19, 2026</span>
            <span>·</span>
            <span>2 travelers</span>
            <span>·</span>
            <span>7 nights</span>
          </div>
          <a className="btn-link mono"><IArrowLeft size={12}/> New search</a>
        </div>
      </div>

      {/* Trip header */}
      <div className="wrap trip-header">
        <div className="trip-header-left">
          <div className="eyebrow">Your itinerary · LIS—26—052</div>
          <h1 className="trip-title serif">
            Seven nights in <em>Lisbon</em>.
          </h1>
          <p className="trip-desc mute">
            A spring plan composed from live flights, hotel rates, historical weather,
            and places matched to food, culture, and beaches. Edit anything — changes
            reflow instantly.
          </p>
          <div className="trip-chips">
            {["Food","Culture","Beaches"].map(c => (
              <span key={c} className="trip-chip mono">{c}</span>
            ))}
          </div>
        </div>
        <div className="trip-header-right">
          <div className="photo trip-hero" data-label="Lisbon · rooftops at golden hour"></div>
        </div>
      </div>

      {/* Grid */}
      <div className="wrap trip-grid">
        <div className="trip-main">
          <FlightsSection />
          <HotelsSection />
          <ActivitiesSection />
        </div>
        <aside className="trip-side">
          <VisaSection />
          <CostSection />
          <WeatherSection />
          <CurrencySection />
        </aside>
      </div>
    </div>
  );
};

window.Results = Results;
