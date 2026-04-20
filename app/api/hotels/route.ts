import { NextRequest, NextResponse } from 'next/server'
import { fetchHotels } from '@/lib/xotelo'

export async function GET(req: NextRequest) {
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
