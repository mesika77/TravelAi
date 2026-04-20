import type { TripParams } from './types'

export function encodeTripId(params: TripParams): string {
  const json = JSON.stringify(params)
  return Buffer.from(json).toString('base64url')
}

export function decodeTripId(id: string): TripParams | null {
  try {
    const json = Buffer.from(id, 'base64url').toString('utf-8')
    return JSON.parse(json) as TripParams
  } catch {
    return null
  }
}
