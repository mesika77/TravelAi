import { NextRequest, NextResponse } from 'next/server'
import { fetchFlights } from '@/lib/serpapi'
import { rateLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 60, 60 * 60 * 1000)
  if (limited) return limited

  const { searchParams } = req.nextUrl
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')
  const departureDate = searchParams.get('departureDate')
  const returnDate = searchParams.get('returnDate')
  const oneWay = searchParams.get('oneWay') === 'true'

  if (!origin || !destination || !departureDate) {
    return NextResponse.json({ error: 'Missing required params: origin, destination, departureDate' }, { status: 400 })
  }

  try {
    const flights = await fetchFlights(origin, destination, departureDate, returnDate ?? '', oneWay)
    return NextResponse.json({ flights })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'SERPAPI_KEY_MISSING') {
      return NextResponse.json({ error: 'SERPAPI_KEY not configured', key: 'SERPAPI_KEY' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to fetch flights. Please try again.' }, { status: 500 })
  }
}
