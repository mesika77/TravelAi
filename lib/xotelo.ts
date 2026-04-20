import type { Hotel, HotelsResult } from './types'

export async function fetchHotels(
  city: string,
  checkIn: string,
  checkOut: string
): Promise<HotelsResult> {
  const listUrl = `https://data.xotelo.com/api/list?location=${encodeURIComponent(city)}&limit=5`
  const listRes = await fetch(listUrl, { next: { revalidate: 3600 } })
  if (!listRes.ok) throw new Error(`Xotelo list error: ${listRes.status}`)

  const listData = await listRes.json()
  const hotelList = (listData.result ?? []) as Record<string, unknown>[]
  if (hotelList.length === 0) return { hotels: [], avgNightly: 0 }

  const hotels: Hotel[] = []
  const rates: number[] = []

  for (const h of hotelList.slice(0, 5)) {
    const key = String(h.key ?? '')
    if (!key) continue

    let minRate: number | undefined
    let maxRate: number | undefined

    try {
      const rateUrl = `https://data.xotelo.com/api/rates?hotel_key=${key}&chk_in=${checkIn}&chk_out=${checkOut}`
      const rateRes = await fetch(rateUrl, { next: { revalidate: 3600 } })
      if (rateRes.ok) {
        const rateData = await rateRes.json()
        const rateList = (rateData.result?.rates ?? []) as Record<string, number>[]
        const prices = rateList.map((r) => r.rate).filter(Boolean)
        if (prices.length) {
          minRate = Math.min(...prices)
          maxRate = Math.max(...prices)
          rates.push(minRate)
        }
      }
    } catch {
      // rate fetch failed, include hotel without rate
    }

    hotels.push({
      key,
      name: String(h.name ?? 'Hotel'),
      rating: h.rating ? Number(h.rating) : undefined,
      minRate,
      maxRate,
      currency: 'USD',
    })
  }

  const avgNightly = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0

  return { hotels: hotels.slice(0, 3), avgNightly }
}
