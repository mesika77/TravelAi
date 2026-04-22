'use client'

import { useState } from 'react'

interface Props {
  city: string
  className?: string
  style?: React.CSSProperties
  aspect?: string   // e.g. "3/4" "4/3" "1/1"
  query?: string    // extra search terms appended to city
}

// Stable per-city seed so the same city always gets the same Unsplash photo in a session
const cache = new Map<string, string>()

function unsplashUrl(city: string, query: string, w: number, h: number) {
  const q = encodeURIComponent(`${city} ${query}`)
  return `https://source.unsplash.com/featured/${w}x${h}/?${q}`
}

export default function DestinationPhoto({ city, className = '', style, aspect, query = 'travel city' }: Props) {
  const cacheKey = `${city}::${query}`
  const [src] = useState(() => {
    if (cache.has(cacheKey)) return cache.get(cacheKey)!
    const url = unsplashUrl(city, query, 800, 600)
    cache.set(cacheKey, url)
    return url
  })
  const [failed, setFailed] = useState(false)

  if (failed) {
    // Fall back to the CSS placeholder
    return <div className={`photo ${className}`} data-label={city} style={style} />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={city}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{
        objectFit: 'cover',
        width: '100%',
        aspectRatio: aspect,
        borderRadius: 'inherit',
        display: 'block',
        ...style,
      }}
    />
  )
}
