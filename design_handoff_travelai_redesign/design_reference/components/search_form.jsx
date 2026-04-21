const INTERESTS = [
  { id: "food", label: "Food" },
  { id: "culture", label: "Culture" },
  { id: "nature", label: "Nature" },
  { id: "nightlife", label: "Nightlife" },
  { id: "adventure", label: "Adventure" },
  { id: "shopping", label: "Shopping" },
  { id: "history", label: "History" },
  { id: "beaches", label: "Beaches" },
];

const COUNTRIES = [
  ["US","United States"],["GB","United Kingdom"],["CA","Canada"],["AU","Australia"],
  ["DE","Germany"],["FR","France"],["IT","Italy"],["ES","Spain"],["NL","Netherlands"],
  ["JP","Japan"],["IL","Israel"],["SG","Singapore"],["BR","Brazil"],["MX","Mexico"],
];

const SearchForm = ({ onSubmit }) => {
  const [step, setStep] = React.useState(0);
  const [oneWay, setOneWay] = React.useState(false);
  const [form, setForm] = React.useState({
    origin: "New York",
    destination: "Lisbon",
    departureDate: "2026-05-12",
    returnDate: "2026-05-19",
    adults: 2,
    children: 0,
    budget: 2400,
    passport: "US",
    interests: ["food","culture","beaches"],
  });
  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  const toggleInt = (id) => set("interests",
    form.interests.includes(id) ? form.interests.filter(i => i !== id) : [...form.interests, id]);

  const canNext0 = form.origin && form.destination && form.departureDate && (oneWay || form.returnDate);
  const canNext1 = form.adults > 0 && (oneWay || form.budget > 0);
  const canSubmit = canNext1 && form.passport && form.interests.length > 0;

  return (
    <div className="searchform">
      <div className="sf-head">
        <div className="sf-dots">
          {[0,1,2].map(i => (
            <div key={i} className="sf-dot" style={{
              width: i === step ? 44 : 8,
              background: i <= step ? "var(--ink)" : "var(--line)",
              opacity: i < step ? .4 : 1
            }} />
          ))}
        </div>
        <div className="sf-step-label mono">Step {step+1} / 3</div>
      </div>

      {step === 0 && (
        <div className="sf-step fade-up">
          <div className="sf-row-toggle">
            <div>
              <div className="eyebrow">01 — Itinerary</div>
              <h2 style={{fontSize: 38, marginTop: 6}}>Where & when.</h2>
            </div>
            <div className="pill-toggle">
              <button className={!oneWay ? "active" : ""} onClick={() => setOneWay(false)}>Round trip</button>
              <button className={oneWay ? "active" : ""} onClick={() => setOneWay(true)}>One way</button>
            </div>
          </div>

          <div className="sf-grid-2">
            <div className="field">
              <div className="field-label">From</div>
              <input className="input" value={form.origin} placeholder="Origin city"
                     onChange={e => set("origin", e.target.value)} />
            </div>
            <div className="field">
              <div className="field-label">To</div>
              <input className="input" value={form.destination} placeholder="Destination city"
                     onChange={e => set("destination", e.target.value)} />
            </div>
          </div>

          <div className={oneWay ? "sf-grid-1" : "sf-grid-2"}>
            <div className="field">
              <div className="field-label">Departure</div>
              <input className="input" type="date" value={form.departureDate}
                     onChange={e => set("departureDate", e.target.value)} />
            </div>
            {!oneWay && (
              <div className="field">
                <div className="field-label">Return</div>
                <input className="input" type="date" value={form.returnDate}
                       onChange={e => set("returnDate", e.target.value)} />
              </div>
            )}
          </div>

          <div className="sf-footer">
            <span className="mono mute">Press next or ↵</span>
            <button className="btn btn-primary" disabled={!canNext0} onClick={() => setStep(1)}>
              Continue <IArrowRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="sf-step fade-up">
          <div>
            <div className="eyebrow">02 — Party</div>
            <h2 style={{fontSize: 38, marginTop: 6}}>Who's coming along?</h2>
          </div>

          <div className="sf-grid-2">
            <div className="field">
              <div className="field-label">Adults</div>
              <div className="stepper">
                <button onClick={() => set("adults", Math.max(1, form.adults - 1))}><IMinus size={14}/></button>
                <span className="tabular">{form.adults}</span>
                <button onClick={() => set("adults", form.adults + 1)}><IPlus size={14}/></button>
              </div>
            </div>
            <div className="field">
              <div className="field-label">Children</div>
              <div className="stepper">
                <button onClick={() => set("children", Math.max(0, form.children - 1))}><IMinus size={14}/></button>
                <span className="tabular">{form.children}</span>
                <button onClick={() => set("children", form.children + 1)}><IPlus size={14}/></button>
              </div>
            </div>
          </div>

          {!oneWay && (
            <div className="field">
              <div className="field-label">Budget per person · USD</div>
              <input className="input tabular" type="number" value={form.budget}
                     onChange={e => set("budget", +e.target.value)} />
              <div className="mono mute" style={{marginTop: 4}}>Includes flight, stay, and daily spend</div>
            </div>
          )}

          <div className="sf-footer">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>
              <IArrowLeft size={16}/> Back
            </button>
            <button className="btn btn-primary" disabled={!canNext1} onClick={() => setStep(2)}>
              Continue <IArrowRight size={16}/>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="sf-step fade-up">
          <div>
            <div className="eyebrow">03 — Preferences</div>
            <h2 style={{fontSize: 38, marginTop: 6}}>Tell us what you love.</h2>
          </div>

          <div className="field">
            <div className="field-label">Passport</div>
            <select className="select" value={form.passport} onChange={e => set("passport", e.target.value)}>
              {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </div>

          <div>
            <div className="field-label" style={{marginBottom: 12}}>Interests · pick at least one</div>
            <div className="chipwrap">
              {INTERESTS.map(i => {
                const on = form.interests.includes(i.id);
                return (
                  <button key={i.id} className={"chip" + (on ? " on" : "")} onClick={() => toggleInt(i.id)}>
                    {on && <span className="chip-dot" style={{background: "var(--paper)"}}/>}
                    {i.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sf-footer">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              <IArrowLeft size={16}/> Back
            </button>
            <button className="btn btn-primary" disabled={!canSubmit} onClick={() => onSubmit({...form, oneWay})}>
              Plan my trip <IArrowRight size={16}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

window.SearchForm = SearchForm;
window.INTERESTS = INTERESTS;
