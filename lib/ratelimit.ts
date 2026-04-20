import { NextRequest, NextResponse } from 'next/server'

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function rateLimit(req: NextRequest, limit: number, windowMs: number): NextResponse | null {
  const ip = getIp(req)
  const key = `${req.nextUrl.pathname}:${ip}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  entry.count++
  return null
}
