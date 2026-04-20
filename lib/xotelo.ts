import type { Hotel, HotelsResult } from './types'

// Google Hotels only has rates ~12 months out. For far-future dates, query
// a 4-night sample window using the same month/day in the nearest available year.
function nearestBookableDates(checkIn: string, checkOut: string): { checkIn: string; checkOut: string; isEstimate: boolean } {
  const inDate = new Date(checkIn)
  const outDate = new Date(checkOut)
  const nights = Math.round((outDate.getTime() - inDate.getTime()) / 86400000)
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() + 11)

  if (inDate <= cutoff) return { checkIn, checkOut, isEstimate: false }

  // Shift to same month/day, nearest upcoming year
  const shifted = new Date(inDate)
  while (shifted > cutoff) shifted.setFullYear(shifted.getFullYear() - 1)
  shifted.setFullYear(shifted.getFullYear() + 1)
  // Use a 4-night sample window to get representative nightly rates
  const sampleNights = Math.min(nights, 4)
  const shiftedOut = new Date(shifted)
  shiftedOut.setDate(shiftedOut.getDate() + sampleNights)

  return {
    checkIn: shifted.toISOString().split('T')[0],
    checkOut: shiftedOut.toISOString().split('T')[0],
    isEstimate: true,
  }
}

export async function fetchHotels(
  city: string,
  checkIn: string,
  checkOut: string
): Promise<HotelsResult & { isEstimate?: boolean }> {
  const key = process.env.SERPAPI_KEY
  if (!key) throw new Error('SERPAPI_KEY_MISSING')

  const { checkIn: queryIn, checkOut: queryOut, isEstimate } = nearestBookableDates(checkIn, checkOut)

  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('engine', 'google_hotels')
  url.searchParams.set('q', `hotels in ${city}`)
  url.searchParams.set('check_in_date', queryIn)
  url.searchParams.set('check_out_date', queryOut)
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

  return { hotels: hotels.slice(0, 3), avgNightly, isEstimate }
}
