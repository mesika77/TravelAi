'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { ChatMessage } from '@/lib/types'

export default function ChatBot() {
  const { params, nights } = useTripContext()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const sendMessage = async () => {
    if (!input.trim() || streaming) return
    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    const allMessages = [...messages, userMsg]
    let assistantText = ''

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, tripParams: params, nights }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? 'Chat error') }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry — ${msg}` }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open concierge"
      >
        {open ? <X size={20} strokeWidth={2} /> : <Sparkles size={20} strokeWidth={1.5} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-mark">
              <Sparkles size={14} strokeWidth={1.5} />
            </div>
            <div>
              <div className="serif" style={{ fontSize: 16 }}>Concierge</div>
              <div className="mono mute" style={{ marginTop: 2 }}>
                {params.origin} → {params.destination}
                {nights > 0 ? ` · ${nights} nights` : ' · One way'}
              </div>
            </div>
          </div>

          <div className="chat-body">
            {messages.length === 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8, marginTop: 40 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center' }}>
                  <Sparkles size={18} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Ask me anything</p>
                <p className="mute" style={{ fontSize: 12, maxWidth: 220 }}>
                  Best restaurants, neighborhoods, tips, hidden gems…
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={'chat-msg' + (m.role === 'user' ? ' chat-user' : '')}>
                {m.role === 'assistant' && (
                  <div className="chat-avatar">
                    <Sparkles size={10} strokeWidth={1.5} />
                  </div>
                )}
                <div className="chat-bubble">
                  {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
                </div>
              </div>
            ))}

            {streaming && messages[messages.length - 1]?.content === '' && (
              <div className="chat-msg">
                <div className="chat-avatar"><Sparkles size={10} strokeWidth={1.5} /></div>
                <div className="chat-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map((j) => (
                    <span
                      key={j}
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--ink-4)',
                        display: 'inline-block',
                        animation: `bounce 0.9s ease ${j * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about restaurants, tips…"
              disabled={streaming}
            />
            <button
              className="chat-send"
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              style={{ opacity: !input.trim() || streaming ? 0.3 : 1 }}
            >
              <Send size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  )
}
