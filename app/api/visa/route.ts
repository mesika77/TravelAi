import { NextRequest, NextResponse } from 'next/server'
import { checkVisa } from '@/lib/visa'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const passport = searchParams.get('passport')
  const destination = searchParams.get('destination')

  if (!passport || !destination) {
    return NextResponse.json({ error: 'Missing required params: passport, destination' }, { status: 400 })
  }

  try {
    const result = await checkVisa(passport, destination)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to check visa requirements.' }, { status: 500 })
  }
}
