import { NextRequest, NextResponse } from 'next/server'
import { fetchWeather, findCityCoords } from '@/lib/weather'

export async function GET(req: NextRequest) {
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
