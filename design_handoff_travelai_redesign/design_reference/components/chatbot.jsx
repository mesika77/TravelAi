const Chatbot = ({ open, onClose, onOpen }) => {
  const [msgs, setMsgs] = React.useState([
    { from: "ai", text: "Hello — I've loaded your Lisbon trip. Ask me anything about flights, neighborhoods, reservations, or timing." },
    { from: "user", text: "What's the best neighborhood for a first trip?" },
    { from: "ai", text: "For a first visit I'd suggest Chiado or Baixa — central, walkable, and close to most of what you've saved. Alfama is the most atmospheric (fado bars, tiled lanes) but the hills are steep. If you want nightlife after dinner, base yourself in Bairro Alto." },
  ]);
  const [input, setInput] = React.useState("");

  if (!open) {
    return (
      <button className="chat-fab" onClick={onOpen} aria-label="Open concierge">
        <ISparkle size={20}/>
      </button>
    );
  }

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => setMsgs(m => [...m, { from: "ai", text: "Let me check that against your itinerary…" }]), 400);
  };

  return (
    <div className="chat-panel open">
      <div className="chat-header">
        <div className="chat-header-mark"><ISparkle size={14}/></div>
        <div>
          <div className="serif" style={{fontSize: 18}}>Concierge</div>
          <div className="mono mute" style={{fontSize: 10}}>Llama 3.3 · trip context loaded</div>
        </div>
        <button className="icon-btn" onClick={onClose} style={{marginLeft:"auto"}}><IClose size={14}/></button>
      </div>
      <div className="chat-body">
        {msgs.map((m,i) => (
          <div key={i} className={"chat-msg chat-" + m.from}>
            {m.from === "ai" && <div className="chat-avatar mono">AI</div>}
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Ask about Lisbon…"
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === "Enter" && send()}/>
        <button className="chat-send" onClick={send}><ISend size={14}/></button>
      </div>
    </div>
  );
};

window.Chatbot = Chatbot;
