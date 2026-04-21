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

const INTEREST_KEYWORDS: Record<string, string[]> = {
  food: ['restaurant', 'cafe', 'food', 'dining', 'eat', 'bistro', 'bakery', 'sushi', 'pizza', 'bar and grill'],
  culture: ['museum', 'gallery', 'art', 'theater', 'theatre', 'cultural', 'exhibition'],
  nature: ['park', 'garden', 'nature', 'forest', 'reserve', 'wildlife', 'botanical'],
  nightlife: ['bar', 'club', 'nightclub', 'lounge', 'pub', 'nightlife', 'cocktail', 'disco'],
  adventure: ['adventure', 'sport', 'diving', 'hiking', 'climbing', 'kayak', 'zip'],
  shopping: ['mall', 'market', 'shop', 'store', 'shopping', 'boutique', 'bazaar'],
  history: ['historical', 'history', 'temple', 'monument', 'ruins', 'heritage', 'palace', 'castle', 'shrine'],
  beaches: ['beach', 'coast', 'shore', 'bay', 'island', 'sea'],
}

function matchInterest(place: Record<string, unknown>, interests: string[]): string {
  const text = `${place.title ?? ''} ${place.type ?? ''} ${place.category ?? ''}`.toLowerCase()
  for (const interest of interests) {
    const keywords = INTEREST_KEYWORDS[interest] ?? []
    if (keywords.some((kw) => text.includes(kw))) return interest
  }
  return interests[0]
}

export async function fetchActivities(
  lat: number,
  lon: number,
  interests: string[]
): Promise<Activity[]> {
  const key = process.env.SERPAPI_KEY
  if (!key) throw new Error('SERPAPI_KEY_MISSING')

  const query = interests.map((i) => INTEREST_QUERIES[i]).filter(Boolean).join(', ')
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

  return results.slice(0, 20).map((place, i) => ({
    id: String(place.place_id ?? place.data_id ?? i),
    name: String(place.title ?? ''),
    category: String(place.type ?? 'Place'),
    address: String(place.address ?? ''),
    distance: undefined,
    rating: place.rating ? Number(place.rating) : undefined,
    interest: matchInterest(place, interests),
  }))
}
