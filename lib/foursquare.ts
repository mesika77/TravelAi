import type { Activity } from './types'

const INTEREST_QUERIES: Record<string, string> = {
  food: 'restaurants',
  culture: 'museums and cultural sites',
  nature: 'nature parks',
  nightlife: 'bars and nightlife',
  adventure: 'adventure activities',
  shopping: 'shopping malls',
  history: 'historical sites',
  beaches: 'beaches',
}

const RESULTS_PER_INTEREST = 6

async function fetchForInterest(
  lat: number,
  lon: number,
  interest: string,
  key: string
): Promise<Activity[]> {
  const query = INTEREST_QUERIES[interest]
  if (!query) return []

  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('engine', 'google_maps')
  url.searchParams.set('q', query)
  url.searchParams.set('ll', `@${lat},${lon},14z`)
  url.searchParams.set('type', 'search')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('api_key', key)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`SerpApi maps error: ${res.status}`)

  const data = await res.json()
  const results = (data.local_results ?? []) as Record<string, unknown>[]

  return results.slice(0, RESULTS_PER_INTEREST).map((place, i) => ({
    id: `${interest}-${String(place.place_id ?? place.data_id ?? i)}`,
    name: String(place.title ?? ''),
    category: String(place.type ?? query),
    address: String(place.address ?? ''),
    distance: undefined,
    rating: place.rating ? Number(place.rating) : undefined,
    interest,
  }))
}

export async function fetchActivities(
  lat: number,
  lon: number,
  interests: string[]
): Promise<Activity[]> {
  const key = process.env.SERPAPI_KEY
  if (!key) throw new Error('SERPAPI_KEY_MISSING')

  const results = await Promise.all(
    interests.map((interest) => fetchForInterest(lat, lon, interest, key))
  )

  return results.flat()
}
