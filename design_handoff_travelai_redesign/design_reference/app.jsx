const { useState, useEffect } = React;

function App() {
  const [tweaks, setTweaks] = useState(() => ({
    ...window.TRAVELAI_TWEAKS,
    ...(JSON.parse(localStorage.getItem("travelai-tweaks") || "{}"))
  }));
  const [theme, setTheme] = useState(() => localStorage.getItem("travelai-theme") || "light");
  const [view, setView] = useState(() => localStorage.getItem("travelai-view") || tweaks.view || "landing");
  const [chatOpen, setChatOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("travelai-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("travelai-view", view);
  }, [view]);

  useEffect(() => {
    // Apply tweaks
    const root = document.documentElement;
    root.style.setProperty("--accent", window.ACCENTS[tweaks.accent] || window.ACCENTS.sunset);
    root.style.setProperty("--density",
      tweaks.density === "compact" ? "0.82" :
      tweaks.density === "airy" ? "1.15" : "1");
    root.style.setProperty("--r",
      tweaks.radius === "sharp" ? "3px" :
      tweaks.radius === "soft" ? "22px" : "14px");
    root.style.setProperty("--r-lg",
      tweaks.radius === "sharp" ? "4px" :
      tweaks.radius === "soft" ? "28px" : "20px");
    root.style.setProperty("--r-sm",
      tweaks.radius === "sharp" ? "2px" :
      tweaks.radius === "soft" ? "12px" : "8px");

    localStorage.setItem("travelai-tweaks", JSON.stringify(tweaks));
    try {
      window.parent.postMessage({type: "__edit_mode_set_keys", edits: tweaks}, "*");
    } catch(e) {}

    if (tweaks.view && tweaks.view !== view) setView(tweaks.view);
  }, [tweaks]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    try { window.parent.postMessage({type: "__edit_mode_available"}, "*"); } catch(e) {}
    return () => window.removeEventListener("message", handler);
  }, []);

  const onPlan = () => setView("results");

  return (
    <>
      <Nav view={view} setView={setView} theme={theme} setTheme={setTheme}
           openTweaks={() => setTweaksOpen(o => !o)} />
      {view === "landing" ? (
        <Landing onPlan={onPlan} tweaks={tweaks} />
      ) : (
        <Results />
      )}
      <Chatbot open={chatOpen}
               onOpen={() => setChatOpen(true)}
               onClose={() => setChatOpen(false)} />
      <Tweaks open={tweaksOpen} onClose={() => setTweaksOpen(false)}
              tweaks={tweaks} setTweaks={setTweaks} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
