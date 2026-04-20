import { NextRequest, NextResponse } from 'next/server'
import { streamChat, buildSystemPrompt } from '@/lib/groq'
import type { ChatMessage, TripParams } from '@/lib/types'
import { rateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 20, 60 * 60 * 1000)
  if (limited) return limited

  try {
    const body = await req.json()
    const { messages, tripParams, nights } = body as {
      messages: ChatMessage[]
      tripParams: TripParams
      nights: number
    }

    if (!messages || !tripParams) {
      return NextResponse.json({ error: 'Missing messages or tripParams' }, { status: 400 })
    }

    const systemPrompt = buildSystemPrompt(tripParams, nights ?? 7)
    const stream = await streamChat(messages, systemPrompt)

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'GROQ_API_KEY_MISSING') {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured', key: 'GROQ_API_KEY' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Chat unavailable. Please try again.' }, { status: 500 })
  }
}
