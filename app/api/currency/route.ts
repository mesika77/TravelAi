import { NextRequest, NextResponse } from 'next/server'
import { fetchCurrency, findCurrencyCode } from '@/lib/currency'
import { rateLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 30, 60 * 60 * 1000)
  if (limited) return limited

  const { searchParams } = req.nextUrl
  const city = searchParams.get('city')
  const budgetParam = searchParams.get('budget')

  if (!city || !budgetParam) {
    return NextResponse.json({ error: 'Missing required params: city, budget' }, { status: 400 })
  }

  const budget = parseFloat(budgetParam)
  if (isNaN(budget)) {
    return NextResponse.json({ error: 'budget must be a number' }, { status: 400 })
  }

  try {
    const currencyCode = findCurrencyCode(city)
    const result = await fetchCurrency(currencyCode, budget)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'EXCHANGE_RATE_API_KEY_MISSING') {
      return NextResponse.json({ error: 'EXCHANGE_RATE_API_KEY not configured', key: 'EXCHANGE_RATE_API_KEY' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Failed to fetch currency data.' }, { status: 500 })
  }
}
