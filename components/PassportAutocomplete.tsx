'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface PassportOption {
  code: string
  name: string
  aliases?: string[]
}

interface Props {
  value: string
  onChange: (val: string) => void
  options: PassportOption[]
  placeholder?: string
  label?: string
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export default function PassportAutocomplete({
  value,
  onChange,
  options,
  placeholder,
  label,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState(() => options.find((option) => option.code === value)?.name ?? '')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const indexedOptions = useMemo(
    () => options.map((option) => ({
      ...option,
      searchTerms: [option.name, option.code, ...(option.aliases ?? [])].map(normalize),
    })),
    [options]
  )

  const filtered = query.length >= 1
    ? indexedOptions.filter((option) => option.searchTerms.some((term) => term.includes(normalize(query)))).slice(0, 8)
    : []

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (option: PassportOption) => {
    setQuery(option.name)
    onChange(option.code)
    setOpen(false)
    setActiveIndex(-1)
  }

  const syncFromText = (text: string) => {
    const exact = indexedOptions.find((option) => option.searchTerms.includes(normalize(text)))
    onChange(exact?.code ?? '')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      select(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="field" style={{ position: 'relative' }}>
      {label && <div className="field-label">{label}</div>}
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        className="input"
        onChange={(e) => {
          const next = e.target.value
          setQuery(next)
          syncFromText(next)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => {
          if (query.length >= 1) setOpen(true)
        }}
        onBlur={() => {
          syncFromText(query)
        }}
        onKeyDown={handleKeyDown}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r)',
            marginTop: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,.1)',
            overflow: 'hidden',
          }}
        >
          {filtered.map((option, i) => (
            <button
              key={option.code}
              type="button"
              onMouseDown={() => select(option)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                textAlign: 'left',
                background: i === activeIndex ? 'var(--paper-2)' : 'transparent',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{option.name}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--ink-4)',
                  fontSize: 11,
                  fontFamily: 'var(--f-mono)',
                }}
              >
                {option.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
