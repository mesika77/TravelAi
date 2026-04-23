import type { FlightOffer } from './types'
import airportsData from '@/public/data/airports.json'
import { lookupStoredPlaceByCity } from './places'

const CITY_IATA_OVERRIDES: Record<string, string> = {
  nicosia: 'LCA',
}

export function findIataCode(cityName: string): string | null {
  const normalized = cityName.toLowerCase().trim()
  const override = CITY_IATA_OVERRIDES[normalized]
  if (override) return override

  const match = airportsData.find(
    (a) =>
      a.city.toLowerCase() === normalized ||
      a.name.toLowerCase().includes(normalized)
  )
  return match?.iata ?? null
}

export async function resolveIataCode(cityName: string): Promise<string | null> {
  const stored = await lookupStoredPlaceByCity(cityName)
  if (stored?.iata) return stored.iata
  return findIataCode(cityName)
}

function parseFlights(arr: unknown[], offset = 0): FlightOffer[] {
  if (!Array.isArray(arr)) return []
  return arr
    .slice(0, 10)
    .map((f: unknown, i: number) => {
      const flight = f as Record<string, unknown>
      const firstLeg = (flight.flights as unknown[])?.[0] as Record<string, unknown> | undefined
      return {
        id: `flight-${offset + i}`,
        price: Number(flight.price ?? 0),
        currency: 'USD',
        totalDuration: Number(flight.total_duration ?? 0),
        stops: ((flight.flights as unknown[])?.length ?? 1) - 1,
        legs: ((flight.flights as unknown[]) ?? []).map((leg: unknown) => {
          const l = leg as Record<string, unknown>
          const dep = l.departure_airport as Record<string, unknown> | undefined
          const arr2 = l.arrival_airport as Record<string, unknown> | undefined
          return {
            airline: String(l.airline ?? ''),
            flightNumber: String(l.flight_number ?? ''),
            departureAirport: String(dep?.id ?? ''),
            arrivalAirport: String(arr2?.id ?? ''),
            departureTime: String(dep?.time ?? ''),
            arrivalTime: String(arr2?.time ?? ''),
            duration: Number(l.duration ?? 0),
          }
        }),
        carbonEmissions: (flight.carbon_emissions as Record<string, number> | undefined)?.this_flight,
        bookingToken: String(flight.booking_token ?? ''),
        airline: String(firstLeg?.airline ?? 'Unknown'),
      }
    })
    .filter((f) => f.price > 0)
}

export async function fetchFlights(
  origin: string,
  destination: string,
  outboundDate: string,
  returnDate: string,
  oneWay = false
): Promise<FlightOffer[]> {
  const key = process.env.SERPAPI_KEY
  if (!key) throw new Error('SERPAPI_KEY_MISSING')

  const originIata = await resolveIataCode(origin) ?? origin.toUpperCase().slice(0, 3)
  const destIata = await resolveIataCode(destination) ?? destination.toUpperCase().slice(0, 3)

  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('engine', 'google_flights')
  url.searchParams.set('departure_id', originIata)
  url.searchParams.set('arrival_id', destIata)
  url.searchParams.set('outbound_date', outboundDate)
  url.searchParams.set('type', oneWay ? '2' : '1')
  if (!oneWay && returnDate) url.searchParams.set('return_date', returnDate)
  url.searchParams.set('currency', 'USD')
  url.searchParams.set('hl', 'en')
  url.searchParams.set('api_key', key)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`SerpApi error: ${res.status}`)

  const data = await res.json()
  const best = parseFlights((data.best_flights ?? []) as unknown[])
  const other = parseFlights((data.other_flights ?? []) as unknown[], best.length)
  const all = [...best, ...other].sort((a, b) => a.price - b.price)
  return all.slice(0, 3)
}
