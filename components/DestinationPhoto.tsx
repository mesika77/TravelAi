'use client'

import { useState, useEffect } from 'react'

interface Props {
  city: string
  className?: string
  style?: React.CSSProperties
  query?: string
}

// Session-level cache so each city only hits /api/photo once per page load
const resolved = new Map<string, string>()

export default function DestinationPhoto({ city, className = '', style, query = 'travel' }: Props) {
  const cacheKey = `${city}::${query}`
  const [url, setUrl] = useState<string | null>(resolved.get(cacheKey) ?? null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (resolved.has(cacheKey)) return
    fetch(`/api/photo?city=${encodeURIComponent(city)}&query=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.url) {
          resolved.set(cacheKey, d.url)
          setUrl(d.url)
        }
      })
      .catch(() => setFailed(true))
  }, [cacheKey, city, query])

  if (failed || (!url && typeof window !== 'undefined')) {
    return <div className={`photo ${className}`} data-label={city} style={style} />
  }

  if (!url) {
    // Show shimmer while loading
    return <div className={`shimmer ${className}`} style={{ borderRadius: 'var(--r-sm)', ...style }} />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={city}
      className={className}
      loading="lazy"
      onError={() => { setFailed(true) }}
      style={{
        objectFit: 'cover',
        width: '100%',
        display: 'block',
        ...style,
      }}
    />
  )
}
