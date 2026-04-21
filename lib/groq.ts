import Groq from 'groq-sdk'
import type { ChatMessage, TripParams } from './types'

export function buildSystemPrompt(params: TripParams, nights: number): string {
  const tripDesc = params.oneWay
    ? `a one-way trip from ${params.origin} to ${params.destination}`
    : `a trip from ${params.origin} to ${params.destination} for ${nights} nights`
  const budgetLine = params.oneWay ? '' : ` with a budget of $${params.budget} per person`
  return `You are a concise travel concierge. The user is planning ${tripDesc} with ${params.adults + params.children} traveler(s)${budgetLine}. Their interests: ${params.interests.join(', ')}.

Rules:
- Keep every reply under 4 sentences or 3 short bullet points — no exceptions.
- Be direct. Lead with the answer, skip preamble.
- No filler phrases ("Great question!", "Of course!", "Certainly!").
- If asked for a list, give max 3 items with one-line descriptions.
- Never repeat information the user just told you.`
}

export async function streamChat(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY_MISSING')

  const groq = new Groq({ apiKey: key })

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    max_tokens: 300,
  })

  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })
}
