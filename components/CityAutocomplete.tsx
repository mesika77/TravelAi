'use client'

import { useState, useRef, useEffect } from 'react'
import citiesData from '@/public/data/cities.json'
import airportsData from '@/public/data/airports.json'

interface Suggestion {
  city: string
  country: string
  countryCode?: string
  iata?: string
  airportName?: string
  kind: 'city' | 'airport'
  searchTerms: string[]
}

const countryNameByCode = new Map<string, string>()
for (const city of citiesData as { country: string; countryCode: string }[]) {
  countryNameByCode.set(city.countryCode.toUpperCase(), city.country)
}

const citySuggestions = new Map<string, Suggestion>()
for (const city of citiesData as { name: string; country: string; countryCode: string }[]) {
  citySuggestions.set(`${city.name.toLowerCase()}-${city.countryCode.toLowerCase()}`, {
    city: city.name,
    country: city.country,
    countryCode: city.countryCode,
    kind: 'city',
    searchTerms: [city.name, city.country, city.countryCode].map((value) => value.toLowerCase()),
  })
}

const airportSuggestions: Suggestion[] = (airportsData as { city: string; country: string; iata: string; name: string }[])
  .map((airport) => {
    const country = countryNameByCode.get(airport.country.toUpperCase()) ?? airport.country
    const searchTerms = [airport.city, country, airport.iata, airport.name]
      .filter(Boolean)
      .map((value) => value.toLowerCase())

    return {
      city: airport.city,
      country,
      countryCode: airport.country,
      iata: airport.iata,
      airportName: airport.name,
      kind: 'airport' as const,
      searchTerms,
    }
  })

const ALL: Suggestion[] = [...citySuggestions.values(), ...airportSuggestions]

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
    ? ALL.filter((s) => s.searchTerms.some((term) => term.includes(query.toLowerCase())))
      .sort((a, b) => {
        const q = query.toLowerCase()
        const aStarts = a.searchTerms.some((term) => term.startsWith(q))
        const bStarts = b.searchTerms.some((term) => term.startsWith(q))
        if (aStarts !== bStarts) return aStarts ? -1 : 1
        if (a.kind !== b.kind) return a.kind === 'city' ? -1 : 1
        return a.city.localeCompare(b.city)
      })
      .slice(0, 8)
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
