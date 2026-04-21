const ACCENTS = {
  sunset:  "oklch(62% 0.18 38)",
  rose:    "oklch(62% 0.18 15)",
  forest:  "oklch(52% 0.12 155)",
  cobalt:  "oklch(52% 0.18 255)",
  ochre:   "oklch(70% 0.14 80)",
};

const Tweaks = ({ open, onClose, tweaks, setTweaks }) => {
  const update = (k, v) => setTweaks(t => ({...t, [k]: v}));
  return (
    <div className={"tweaks-panel" + (open ? " open" : "")}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12}}>
        <div className="serif" style={{fontSize: 20}}>Tweaks</div>
        <button className="icon-btn" onClick={onClose} style={{width: 28, height: 28}}><IClose size={12}/></button>
      </div>

      <div className="tweaks-row">
        <label>Accent</label>
        <div className="tweaks-swatches">
          {Object.keys(ACCENTS).map(k => (
            <button key={k} className={"tweaks-swatch" + (tweaks.accent === k ? " on" : "")}
                    style={{background: ACCENTS[k]}}
                    onClick={() => update("accent", k)}/>
          ))}
        </div>
      </div>

      <div className="tweaks-row">
        <label>Density</label>
        <div className="tweaks-mini">
          {["airy","comfortable","compact"].map(d => (
            <button key={d} className={tweaks.density === d ? "on" : ""}
                    onClick={() => update("density", d)}>{d}</button>
          ))}
        </div>
      </div>

      <div className="tweaks-row">
        <label>Radius</label>
        <div className="tweaks-mini">
          {["sharp","rounded","soft"].map(r => (
            <button key={r} className={tweaks.radius === r ? "on" : ""}
                    onClick={() => update("radius", r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="tweaks-row">
        <label>Hero</label>
        <div className="tweaks-mini">
          {["gradient","photo","grid"].map(r => (
            <button key={r} className={tweaks.hero === r ? "on" : ""}
                    onClick={() => update("hero", r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="tweaks-row">
        <label>View</label>
        <div className="tweaks-mini">
          {["landing","results"].map(r => (
            <button key={r} className={tweaks.view === r ? "on" : ""}
                    onClick={() => update("view", r)}>{r}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Tweaks = Tweaks;
window.ACCENTS = ACCENTS;
