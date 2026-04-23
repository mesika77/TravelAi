import { NextRequest, NextResponse } from 'next/server'
import { searchPlaces } from '@/lib/places'
import { rateLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 120, 60 * 60 * 1000)
  if (limited) return limited

  const { searchParams } = req.nextUrl
  const query = searchParams.get('q') ?? ''
  const limit = Number(searchParams.get('limit') ?? '8')

  if (!query.trim()) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const suggestions = await searchPlaces(query, Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 12) : 8)
    return NextResponse.json(
      { suggestions },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=600' } }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to search places.' }, { status: 500 })
  }
}
