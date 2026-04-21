import { NextRequest, NextResponse } from 'next/server'
import { fetchHotels } from '@/lib/xotelo'
import { rateLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 60, 60 * 60 * 1000)
  if (limited) return limited

  const { searchParams } = req.nextUrl
  const city = searchParams.get('city')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')

  if (!city || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'Missing required params: city, checkIn, checkOut' }, { status: 400 })
  }

  try {
    const result = await fetchHotels(city, checkIn, checkOut)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch hotels. Please try again.' }, { status: 500 })
  }
}
