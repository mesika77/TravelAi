import type { DiscoverParams, TripParams } from './types'

export function encodeTripId(params: TripParams): string {
  const json = JSON.stringify(params)
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeTripId(id: string): TripParams | null {
  try {
    const base64 = id.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json) as TripParams
  } catch {
    return null
  }
}

export function encodeDiscoverId(params: DiscoverParams): string {
  const json = JSON.stringify(params)
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeDiscoverId(id: string): DiscoverParams | null {
  try {
    const base64 = id.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json) as DiscoverParams
  } catch {
    return null
  }
}
