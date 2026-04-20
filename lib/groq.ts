import Groq from 'groq-sdk'
import type { ChatMessage, TripParams } from './types'

export function buildSystemPrompt(params: TripParams, nights: number): string {
  return `You are a knowledgeable travel concierge. The user is planning a trip from ${params.origin} to ${params.destination} for ${nights} nights with ${params.adults + params.children} travelers and a budget of $${params.budget} per person. Their interests: ${params.interests.join(', ')}. Give specific, actionable recommendations for restaurants, activities, neighborhoods, day trips, and local tips. Be conversational and enthusiastic but concise. Never use bullet point walls — write in short flowing sentences.`
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
    max_tokens: 1024,
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
