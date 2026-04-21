const Nav = ({ view, setView, theme, setTheme, openTweaks }) => {
  return (
    <header className="nav">
      <div className="nav-brand" onClick={() => setView("landing")} style={{cursor:"pointer"}}>
        <div className="nav-brand-mark">T</div>
        <span>Travel<em style={{fontStyle:"italic", color:"var(--accent)"}}>AI</em></span>
      </div>
      <nav className="nav-right">
        <a className="nav-link" onClick={() => setView("landing")}>Plan</a>
        <a className="nav-link" onClick={() => setView("results")}>Results</a>
        <a className="nav-link" href="#">Guides</a>
        <button className="icon-btn" onClick={openTweaks} aria-label="Tweaks">
          <ISliders size={15} />
        </button>
        <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          {theme === "dark" ? <ISun size={15}/> : <IMoon size={15}/>}
        </button>
      </nav>
    </header>
  );
};

window.Nav = Nav;
