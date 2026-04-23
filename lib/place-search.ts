import citiesData from '@/public/data/cities.json'
import airportsData from '@/public/data/airports.json'

export type PlaceKind = 'city' | 'airport' | 'metro'

export interface PlaceSuggestion {
  city: string
  country: string
  countryCode?: string
  iata?: string
  airportName?: string
  kind: PlaceKind
  lat?: number
  lon?: number
  timezone?: string
  rank?: number
  source?: 'local' | 'cache' | 'rapidapi'
}

const countryNameByCode = new Map<string, string>()
const countryCodeByName = new Map<string, string>()

for (const city of citiesData as { country: string; countryCode: string }[]) {
  const code = city.countryCode.toUpperCase()
  const name = city.country
  countryNameByCode.set(code, name)
  if (!countryCodeByName.has(name.toLowerCase())) {
    countryCodeByName.set(name.toLowerCase(), code)
  }
}

const localCitySuggestions = new Map<string, PlaceSuggestion>()
for (const city of citiesData as { name: string; country: string; countryCode: string; lat: number; lon: number }[]) {
  const key = `${city.name.toLowerCase()}-${city.countryCode.toLowerCase()}`
  localCitySuggestions.set(key, {
    city: city.name,
    country: city.country,
    countryCode: city.countryCode,
    lat: city.lat,
    lon: city.lon,
    kind: 'city',
    rank: 70,
    source: 'local',
  })
}

const localAirportSuggestions = (airportsData as { city: string; country: string; iata: string; name: string }[]).map((airport) => {
  const countryCode = airport.country.toUpperCase()
  const country = countryNameByCode.get(countryCode) ?? airport.country
  return {
    city: airport.city,
    country,
    countryCode,
    iata: airport.iata,
    airportName: airport.name,
    kind: 'airport' as const,
    rank: airport.name.toLowerCase().includes('international') ? 92 : 84,
    source: 'local' as const,
  }
})

export const LOCAL_PLACE_SUGGESTIONS: PlaceSuggestion[] = [...localCitySuggestions.values(), ...localAirportSuggestions]

function normalizeText(value: string | undefined) {
  return (value ?? '').trim().toLowerCase()
}

function scoreSuggestion(item: PlaceSuggestion, query: string) {
  const q = normalizeText(query)
  if (!q) return Number.NEGATIVE_INFINITY

  const city = normalizeText(item.city)
  const country = normalizeText(item.country)
  const iata = normalizeText(item.iata)
  const airportName = normalizeText(item.airportName)
  const kindBoost = item.kind === 'metro' ? 120 : item.kind === 'airport' ? 50 : 30

  let score = item.rank ?? 0
  let matched = false

  if (city === q) { score += 500; matched = true }
  else if (city.startsWith(q)) { score += 260; matched = true }
  else if (city.includes(q)) { score += 150; matched = true }

  if (country === q) { score += 230; matched = true }
  else if (country.startsWith(q)) { score += 140; matched = true }
  else if (country.includes(q)) { score += 90; matched = true }

  if (iata) {
    if (iata === q) { score += 420; matched = true }
    else if (iata.startsWith(q)) { score += 210; matched = true }
  }

  if (airportName) {
    if (airportName === q) { score += 230; matched = true }
    else if (airportName.startsWith(q)) { score += 130; matched = true }
    else if (airportName.includes(q)) { score += 80; matched = true }
  }

  if (!matched) return Number.NEGATIVE_INFINITY

  score += kindBoost

  if (airportName.includes('heliport')) score -= 400
  if (airportName.includes('raf') || airportName.includes('air base') || airportName.includes('airfield')) score -= 260
  if (airportName.includes('municipal')) score -= 100

  return score
}

function suggestionKey(item: PlaceSuggestion) {
  const countryKey = (item.countryCode ?? item.country).toLowerCase()
  if (item.iata) {
    return ['airport', countryKey, item.iata.toLowerCase()].join('::')
  }
  return ['city', item.city.toLowerCase(), countryKey].join('::')
}

export function dedupePlaceSuggestions(items: PlaceSuggestion[]) {
  const seen = new Map<string, PlaceSuggestion>()
  for (const item of items) {
    const key = suggestionKey(item)
    const current = seen.get(key)
    const currentRank = current?.rank ?? 0
    const itemRank = item.rank ?? 0
    const currentNameLength = current?.airportName?.length ?? 0
    const itemNameLength = item.airportName?.length ?? 0

    if (!current || itemRank > currentRank || (itemRank === currentRank && itemNameLength > currentNameLength)) {
      seen.set(key, item)
    }
  }
  return [...seen.values()]
}

export function searchPlaceSuggestions(items: PlaceSuggestion[], query: string, limit = 8) {
  const q = normalizeText(query)
  if (!q) return []

  const ranked = dedupePlaceSuggestions(
    items
      .map((item) => ({ item, score: scoreSuggestion(item, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return a.item.city.localeCompare(b.item.city)
      })
      .map(({ item }) => item)
  )

  const airportOrMetroByCity = new Set(
    ranked
      .filter((item) => item.kind !== 'city')
      .map((item) => `${item.city.toLowerCase()}::${(item.countryCode ?? item.country).toLowerCase()}`)
  )

  return ranked
    .filter((item) => {
      if (item.kind !== 'city') return true
      const cityKey = `${item.city.toLowerCase()}::${(item.countryCode ?? item.country).toLowerCase()}`
      return !airportOrMetroByCity.has(cityKey)
    })
    .slice(0, limit)
}

export function lookupLocalPlaceByCity(cityName: string) {
  const normalized = normalizeText(cityName)
  return searchPlaceSuggestions(LOCAL_PLACE_SUGGESTIONS, normalized, 20).find(
    (item) => normalizeText(item.city) === normalized
  ) ?? null
}

export function countryCodeFromName(countryName: string) {
  return countryCodeByName.get(countryName.toLowerCase()) ?? null
}
