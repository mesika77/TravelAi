'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { ChatMessage } from '@/lib/types'

function TypingIndicator() {
  return (
    <div className="flex gap-1 px-4 py-3 rounded-2xl w-fit" style={{ background: 'var(--surface-2)' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--text-muted)' }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

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

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Chat error')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        assistantText += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
          return updated
        })
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Something went wrong'
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, I ran into an error: ${errMsg}` }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: 'var(--accent)', color: 'white' }}
        aria-label="Open travel concierge chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} strokeWidth={2} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              height: '400px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)', fontFamily: 'var(--font-playfair)' }}>
                AI Travel Concierge
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {params.origin} → {params.destination} · {nights} nights
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-2xl mb-2">✈️</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Ask me anything about your trip!
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Best restaurants, things to do, neighborhoods, tips...
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                      color: m.role === 'user' ? 'white' : 'var(--text)',
                      borderBottomRightRadius: m.role === 'user' ? '4px' : undefined,
                      borderBottomLeftRadius: m.role === 'assistant' ? '4px' : undefined,
                    }}
                  >
                    {m.content || (streaming && i === messages.length - 1 ? '...' : '')}
                  </div>
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.content === '' && <TypingIndicator />}
              {streaming && messages.length === 0 && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about restaurants, tips..."
                  disabled={streaming}
                  className="flex-1 text-sm rounded-xl px-3 py-2 transition-all duration-200 focus:outline-none"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || streaming}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  <Send size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
