'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LOCAL_PLACE_SUGGESTIONS,
  dedupePlaceSuggestions,
  searchPlaceSuggestions,
  type PlaceSuggestion,
} from '@/lib/place-search'

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  label?: string
}

export default function CityAutocomplete({ value, onChange, placeholder, label }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [remoteSuggestions, setRemoteSuggestions] = useState<PlaceSuggestion[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () => query.length >= 1
      ? searchPlaceSuggestions(
          dedupePlaceSuggestions([...remoteSuggestions, ...LOCAL_PLACE_SUGGESTIONS]),
          query,
          8
        )
      : [],
    [query, remoteSuggestions]
  )

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (query.trim().length < 2) {
      setRemoteSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query)}&limit=8`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const json = await res.json() as { suggestions?: PlaceSuggestion[] }
        setRemoteSuggestions(json.suggestions ?? [])
      } catch {
        if (!controller.signal.aborted) setRemoteSuggestions([])
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (s: PlaceSuggestion) => {
    setQuery(s.city)
    onChange(s.city)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); select(filtered[activeIndex]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} className="field" style={{ position: 'relative' }}>
      {label && <div className="field-label">{label}</div>}
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); setActiveIndex(-1) }}
        onFocus={() => { if (query.length >= 1) setOpen(true) }}
        onKeyDown={handleKeyDown}
        className="input"
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--paper)', border: '1px solid var(--line)',
            borderRadius: 'var(--r)', marginTop: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,.1)', overflow: 'hidden',
          }}
        >
          {filtered.map((s, i) => (
            <button
              key={`${s.city}-${i}`}
              type="button"
              onMouseDown={() => select(s)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '10px 16px',
                textAlign: 'left', background: i === activeIndex ? 'var(--paper-2)' : 'transparent',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{s.city}</span>
                {s.airportName && (
                  <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>
                    {s.airportName}
                  </span>
                )}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-4)', fontSize: 11 }}>
                {s.country}
                {s.iata && (
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 4,
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                  }}>
                    {s.iata}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
