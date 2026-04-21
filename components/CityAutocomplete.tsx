'use client'

import { useState, useRef, useEffect } from 'react'
import citiesData from '@/public/data/cities.json'
import airportsData from '@/public/data/airports.json'

interface Suggestion {
  city: string
  country: string
  iata?: string
}

const iataMap = new Map<string, string>()
for (const a of airportsData as { city: string; iata: string }[]) {
  iataMap.set(a.city.toLowerCase(), a.iata)
}

const ALL: Suggestion[] = (citiesData as { name: string; country: string }[]).map((c) => ({
  city: c.name,
  country: c.country,
  iata: iataMap.get(c.name.toLowerCase()),
}))

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
  const ref = useRef<HTMLDivElement>(null)

  const filtered = query.length >= 1
    ? ALL.filter((s) => {
        const q = query.toLowerCase()
        return s.city.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
      }).slice(0, 8)
    : []

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (s: Suggestion) => {
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
    <div ref={ref} className="relative">
      {label && (
        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); setActiveIndex(-1) }}
        onFocus={() => { if (query.length >= 1) setOpen(true) }}
        onKeyDown={handleKeyDown}
        style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
        className="rounded-xl border p-3 w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {filtered.map((s, i) => (
            <button
              key={`${s.city}-${i}`}
              type="button"
              onMouseDown={() => select(s)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-100"
              style={{ background: i === activeIndex ? 'var(--surface-2)' : 'transparent', color: 'var(--text)' }}
            >
              <span className="font-medium text-sm">{s.city}</span>
              <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {s.country}
                {s.iata && (
                  <span
                    className="font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--surface-2)', color: 'var(--accent)', fontSize: '0.65rem' }}
                  >
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
