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

export async function fetchActivities(
  lat: number,
  lon: number,
  interests: string[]
): Promise<Activity[]> {
  const key = process.env.SERPAPI_KEY
  if (!key) throw new Error('SERPAPI_KEY_MISSING')

  const queries = interests
    .map((i) => INTEREST_QUERIES[i])
    .filter(Boolean)

  if (queries.length === 0) return []

  const query = queries.join(', ')

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

  return results.slice(0, 9).map((place, i) => {
    const placeInterest =
      interests.find((interest) => {
        const q = INTEREST_QUERIES[interest] ?? ''
        const type = String(place.type ?? '').toLowerCase()
        return q.split(' ').some((word) => type.includes(word))
      }) ?? interests[0]

    return {
      id: String(place.place_id ?? place.data_id ?? i),
      name: String(place.title ?? ''),
      category: String(place.type ?? 'Place'),
      address: String(place.address ?? ''),
      distance: undefined,
      rating: place.rating ? Number(place.rating) : undefined,
      interest: placeInterest,
    }
  })
}
