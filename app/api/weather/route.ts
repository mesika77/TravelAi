import { NextRequest, NextResponse } from 'next/server'
import { fetchWeather, findCityCoords } from '@/lib/weather'
import { rateLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 30, 60 * 60 * 1000)
  if (limited) return limited

  const { searchParams } = req.nextUrl
  const city = searchParams.get('city')

  if (!city) {
    return NextResponse.json({ error: 'Missing required param: city' }, { status: 400 })
  }

  try {
    const coords = findCityCoords(city)
    if (!coords) {
      return NextResponse.json({ error: `City not found: ${city}` }, { status: 404 })
    }
    const result = await fetchWeather(coords.lat, coords.lon)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather data.' }, { status: 500 })
  }
}
