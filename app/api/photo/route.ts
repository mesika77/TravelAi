import { NextRequest, NextResponse } from 'next/server'

// In-memory cache: city+query → photo URL (survives across requests in the same process)
const cache = new Map<string, string>()

async function fetchPexels(query: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`
  const res = await fetch(url, {
    headers: { Authorization: key },
    next: { revalidate: 86400 }, // cache 24h at edge
  })
  if (!res.ok) return null

  const data = await res.json()
  const photos: { src: { large: string } }[] = data.photos ?? []
  if (!photos.length) return null

  // Pick a stable index based on the query so the same city always gets the same photo
  const idx = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % photos.length
  return photos[idx].src.large
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city') ?? ''
  const extra = req.nextUrl.searchParams.get('query') ?? 'travel'
  const query = `${city} ${extra}`
  const cacheKey = query.toLowerCase()

  if (cache.has(cacheKey)) {
    return NextResponse.json({ url: cache.get(cacheKey) })
  }

  const pexelsUrl = await fetchPexels(query)

  if (pexelsUrl) {
    cache.set(cacheKey, pexelsUrl)
    return NextResponse.json({ url: pexelsUrl })
  }

  // Fallback: loremflickr — free, no key, destination-specific via Flickr public photos
  const fallback = `https://loremflickr.com/800/600/${encodeURIComponent(city)},travel/all`
  cache.set(cacheKey, fallback)
  return NextResponse.json({ url: fallback, fallback: true })
}
