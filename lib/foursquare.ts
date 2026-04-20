import type { Activity } from './types'

const INTEREST_CATEGORIES: Record<string, number> = {
  food: 13000,
  culture: 10000,
  nature: 16000,
  nightlife: 10032,
  adventure: 16000,
  shopping: 17000,
  history: 16020,
  beaches: 16019,
}

export async function fetchActivities(
  lat: number,
  lon: number,
  interests: string[]
): Promise<Activity[]> {
  const key = process.env.FOURSQUARE_API_KEY
  if (!key) throw new Error('FOURSQUARE_API_KEY_MISSING')

  const categoryIds = [
    ...new Set(interests.map((i) => INTEREST_CATEGORIES[i]).filter(Boolean)),
  ]
  if (categoryIds.length === 0) return []

  const url = new URL('https://api.foursquare.com/v3/places/search')
  url.searchParams.set('ll', `${lat},${lon}`)
  url.searchParams.set('categories', categoryIds.join(','))
  url.searchParams.set('limit', '9')
  url.searchParams.set('radius', '10000')

  const res = await fetch(url.toString(), {
    headers: { Authorization: key },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Foursquare error: ${res.status}`)

  const data = await res.json()
  const results = (data.results ?? []) as Record<string, unknown>[]

  return results.map((place) => {
    const categories = (place.categories as { name: string }[]) ?? []
    const location = place.location as Record<string, unknown> | undefined
    const geocodes = place.geocodes as Record<string, { lat: number; lng: number }> | undefined

    const placeInterest =
      interests.find((interest) => {
        const catId = INTEREST_CATEGORIES[interest]
        return (place.categories as { id: number }[])?.some((c) => Math.floor(c.id / 1000) * 1000 === catId)
      }) ?? interests[0] ?? 'culture'

    return {
      id: String(place.fsq_id ?? Math.random()),
      name: String(place.name ?? ''),
      category: categories[0]?.name ?? 'Place',
      address: [
        location?.address,
        location?.locality,
      ].filter(Boolean).join(', '),
      distance: place.distance as number | undefined,
      rating: undefined,
      interest: placeInterest,
    }
  })
}
