'use client'

import { useState, useEffect } from 'react'

interface Props {
  city: string
  className?: string
  style?: React.CSSProperties
  query?: string
}

const resolved = new Map<string, string>()

export default function DestinationPhoto({ city, className = '', style, query = 'travel landscape' }: Props) {
  const cacheKey = `${city}::${query}`
  const [url, setUrl] = useState<string | null>(resolved.get(cacheKey) ?? null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (resolved.has(cacheKey)) {
      setUrl(resolved.get(cacheKey)!)
      return
    }
    setUrl(null)
    setFailed(false)
    fetch(`/api/photo?city=${encodeURIComponent(city)}&query=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.url) {
          resolved.set(cacheKey, d.url)
          setUrl(d.url)
        } else {
          setFailed(true)
        }
      })
      .catch(() => setFailed(true))
  }, [cacheKey, city, query])

  const sharedStyle: React.CSSProperties = {
    width: '100%',
    display: 'block',
    ...style,
  }

  if (failed) {
    return <div className={`photo ${className}`} data-label={city} style={sharedStyle} />
  }

  if (!url) {
    return (
      <div
        className={`shimmer ${className}`}
        style={{ borderRadius: 'var(--r-sm)', ...sharedStyle }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={city}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ objectFit: 'cover', ...sharedStyle }}
    />
  )
}
