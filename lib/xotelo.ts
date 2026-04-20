import type { Hotel, HotelsResult } from './types'

export async function fetchHotels(
  city: string,
  checkIn: string,
  checkOut: string
): Promise<HotelsResult> {
  const key = process.env.SERPAPI_KEY
  if (!key) throw new Error('SERPAPI_KEY_MISSING')

  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('engine', 'google_hotels')
  url.searchParams.set('q', `hotels in ${city}`)
  url.searchParams.set('check_in_date', checkIn)
  url.searchParams.set('check_out_date', checkOut)
  url.searchParams.set('currency', 'USD')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('api_key', key)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`SerpApi hotels error: ${res.status}`)

  const data = await res.json()
  const properties = (data.properties ?? []) as Record<string, unknown>[]

  const hotels: Hotel[] = properties.slice(0, 5).map((h, i) => {
    const rate = h.rate_per_night as Record<string, unknown> | undefined
    const total = h.total_rate as Record<string, unknown> | undefined
    const minRate = rate?.extracted_lowest as number | undefined
    const maxRate = total?.extracted_lowest as number | undefined
    return {
      key: String(h.property_token ?? h.name ?? `hotel-${i}`),
      name: String(h.name ?? 'Hotel'),
      rating: h.overall_rating ? Number(h.overall_rating) : undefined,
      minRate,
      maxRate,
      currency: 'USD',
    }
  })

  const rates = hotels.map((h) => h.minRate).filter((r): r is number => r !== undefined)
  const avgNightly = rates.length > 0
    ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
    : 0

  return { hotels: hotels.slice(0, 3), avgNightly }
}
