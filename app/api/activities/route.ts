import { NextRequest, NextResponse } from 'next/server'
import { fetchActivities } from '@/lib/foursquare'
import { findCityCoords } from '@/lib/weather'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city = searchParams.get('city')
  const interests = searchParams.get('interests')

  if (!city || !interests) {
    return NextResponse.json({ error: 'Missing required params: city, interests' }, { status: 400 })
  }

  try {
    const coords = findCityCoords(city)
    if (!coords) {
      return NextResponse.json({ error: `City not found: ${city}` }, { status: 404 })
    }
    const interestList = interests.split(',').map((i) => i.trim()).filter(Boolean)
    const activities = await fetchActivities(coords.lat, coords.lon, interestList)
    return NextResponse.json({ activities })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'FOURSQUARE_API_KEY_MISSING') {
      return NextResponse.json({ error: 'FOURSQUARE_API_KEY not configured', key: 'FOURSQUARE_API_KEY' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to fetch activities.' }, { status: 500 })
  }
}
