import 'server-only'

import {
  LOCAL_PLACE_SUGGESTIONS,
  countryCodeFromName,
  dedupePlaceSuggestions,
  lookupLocalPlaceByCity,
  searchPlaceSuggestions,
  type PlaceSuggestion,
} from './place-search'
import { getSql } from './db'

const AIRLINE_DATABASE_HOST = process.env.RAPIDAPI_AIRLINE_DB_HOST ?? 'airline-database.p.rapidapi.com'
let schemaReady: Promise<void> | null = null

function normalizeQuery(query: string) {
  return query.trim().toLowerCase()
}

function cleanString(value: unknown) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed === '\\N' ? '' : trimmed
}

function computeRank(item: {
  name: string
  city: string
  source: string
  timezone: string
}) {
  const name = item.name.toLowerCase()
  let rank = 70

  if (name.includes('all airports')) rank += 55
  if (name.includes('international')) rank += 35
  if (name.includes('heliport')) rank -= 320
  if (name.includes('raf') || name.includes('air base') || name.includes('airfield')) rank -= 220
  if (name.includes('municipal')) rank -= 70
  if (name.includes('police plaza') || name.includes('wall st') || name.includes('west 30th') || name.includes('east 34th')) rank -= 260
  if (item.source.toLowerCase() === 'user') rank -= 25
  if (!item.timezone) rank -= 20
  if (item.city.toLowerCase() === 'new york' && name.includes('all airports')) rank += 80

  return rank
}

function toPlaceSuggestion(row: Record<string, unknown>): PlaceSuggestion {
  return {
    city: String(row.city ?? ''),
    country: String(row.country ?? ''),
    countryCode: row.country_code ? String(row.country_code) : undefined,
    iata: row.iata ? String(row.iata) : undefined,
    airportName: row.airport_name ? String(row.airport_name) : undefined,
    lat: typeof row.lat === 'number' ? row.lat : row.lat != null ? Number(row.lat) : undefined,
    lon: typeof row.lon === 'number' ? row.lon : row.lon != null ? Number(row.lon) : undefined,
    timezone: row.timezone ? String(row.timezone) : undefined,
    kind: String(row.kind ?? 'city') as PlaceSuggestion['kind'],
    rank: typeof row.rank === 'number' ? row.rank : row.rank != null ? Number(row.rank) : undefined,
    source: row.source ? String(row.source) as PlaceSuggestion['source'] : 'cache',
  }
}

async function ensurePlacesSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS place_queries (
          query TEXT PRIMARY KEY,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
      await sql`
        CREATE TABLE IF NOT EXISTS place_results (
          id BIGSERIAL PRIMARY KEY,
          query TEXT NOT NULL REFERENCES place_queries(query) ON DELETE CASCADE,
          city TEXT NOT NULL,
          country TEXT NOT NULL,
          country_code TEXT,
          iata TEXT,
          airport_name TEXT,
          lat DOUBLE PRECISION,
          lon DOUBLE PRECISION,
          timezone TEXT,
          kind TEXT NOT NULL,
          rank INTEGER NOT NULL DEFAULT 0,
          source TEXT NOT NULL DEFAULT 'cache'
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS place_results_query_idx ON place_results(query);`
      await sql`CREATE INDEX IF NOT EXISTS place_results_city_idx ON place_results(LOWER(city));`
      await sql`CREATE INDEX IF NOT EXISTS place_results_country_idx ON place_results(LOWER(country));`
      await sql`CREATE INDEX IF NOT EXISTS place_results_iata_idx ON place_results(iata);`
    })()
  }
  return schemaReady
}

function normalizeRapidApiResults(payload: unknown): PlaceSuggestion[] {
  const groups = Array.isArray((payload as { data?: unknown })?.data)
    ? ((payload as { data: unknown[] }).data as unknown[])
    : []

  const rows = groups.flatMap((entry) => Array.isArray(entry) ? entry : [])

  const normalized = rows
    .map((row): PlaceSuggestion | null => {
      const record = row as Record<string, unknown>
      const city = cleanString(record.city)
      const country = cleanString(record.country)
      const iata = cleanString(record.iata).toUpperCase()
      const airportName = cleanString(record.name)
      const timezone = cleanString(record.tz_timezone)
      const latitude = Number(record.latitude)
      const longitude = Number(record.longitude)
      const type = cleanString(record.type).toLowerCase()
      const source = cleanString(record.source)

      if (!city || !country || !iata || type !== 'airport') return null

      const countryCode = countryCodeFromName(country) ?? undefined
      const rank = computeRank({ name: airportName, city, source, timezone })
      if (rank <= 0) return null

      return {
        city,
        country,
        countryCode,
        iata,
        airportName,
        lat: Number.isFinite(latitude) ? latitude : undefined,
        lon: Number.isFinite(longitude) ? longitude : undefined,
        timezone: timezone || undefined,
        kind: airportName.toLowerCase().includes('all airports') ? 'metro' : 'airport',
        rank,
        source: 'rapidapi' as const,
      } satisfies PlaceSuggestion
    })
    .filter((item): item is PlaceSuggestion => item !== null)

  return dedupePlaceSuggestions(normalized)
}

async function fetchRapidApiPlaces(query: string) {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) return []

  const response = await fetch(`https://${AIRLINE_DATABASE_HOST}/api/advance-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': AIRLINE_DATABASE_HOST,
      'x-rapidapi-key': apiKey,
    },
    body: new URLSearchParams({ q: query }).toString(),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`RapidAPI places lookup failed: ${response.status}`)
  }

  const payload = await response.json()
  return normalizeRapidApiResults(payload)
}

async function getStoredQueryResults(query: string) {
  await ensurePlacesSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT city, country, country_code, iata, airport_name, lat, lon, timezone, kind, rank, source
    FROM place_results
    WHERE query = ${normalizeQuery(query)}
    ORDER BY rank DESC, city ASC
  `
  return rows.map((row) => toPlaceSuggestion(row as Record<string, unknown>))
}

async function searchStoredPlaces(query: string, limit = 50) {
  await ensurePlacesSchema()
  const sql = getSql()
  const normalized = normalizeQuery(query)
  const like = `%${normalized}%`
  const iataLike = `${normalized.toUpperCase()}%`
  const rows = await sql`
    SELECT city, country, country_code, iata, airport_name, lat, lon, timezone, kind, rank, source
    FROM place_results
    WHERE
      LOWER(city) LIKE ${like}
      OR LOWER(country) LIKE ${like}
      OR LOWER(COALESCE(airport_name, '')) LIKE ${like}
      OR UPPER(COALESCE(iata, '')) LIKE ${iataLike}
    ORDER BY rank DESC, city ASC
    LIMIT ${limit}
  `
  return rows.map((row) => toPlaceSuggestion(row as Record<string, unknown>))
}

export async function lookupStoredPlaceByCity(cityName: string) {
  const normalized = normalizeQuery(cityName)
  try {
    await ensurePlacesSchema()
    const sql = getSql()
    const rows = await sql`
      SELECT city, country, country_code, iata, airport_name, lat, lon, timezone, kind, rank, source
      FROM place_results
      WHERE LOWER(city) = ${normalized}
      ORDER BY rank DESC, city ASC
      LIMIT 1
    `
    const cachedMatch = rows[0] ? toPlaceSuggestion(rows[0] as Record<string, unknown>) : null
    return cachedMatch ?? lookupLocalPlaceByCity(cityName)
  } catch {
    return lookupLocalPlaceByCity(cityName)
  }
}

export async function savePlacesForQuery(query: string, results: PlaceSuggestion[]) {
  const normalized = normalizeQuery(query)
  if (!normalized) return results

  const deduped = dedupePlaceSuggestions(results)
  await ensurePlacesSchema()
  const sql = getSql()
  await sql`
    INSERT INTO place_queries (query, updated_at)
    VALUES (${normalized}, NOW())
    ON CONFLICT (query) DO UPDATE SET updated_at = EXCLUDED.updated_at
  `
  await sql`DELETE FROM place_results WHERE query = ${normalized}`

  for (const result of deduped) {
    await sql`
      INSERT INTO place_results (
        query, city, country, country_code, iata, airport_name, lat, lon, timezone, kind, rank, source
      ) VALUES (
        ${normalized},
        ${result.city},
        ${result.country},
        ${result.countryCode ?? null},
        ${result.iata ?? null},
        ${result.airportName ?? null},
        ${result.lat ?? null},
        ${result.lon ?? null},
        ${result.timezone ?? null},
        ${result.kind},
        ${result.rank ?? 0},
        ${result.source ?? 'cache'}
      )
    `
  }
  return deduped
}

export async function getStoredPlacesStore() {
  await ensurePlacesSchema()
  const sql = getSql()
  const queryRows = await sql`SELECT query, updated_at FROM place_queries ORDER BY updated_at DESC`
  const queries: Record<string, { updatedAt: string; results: PlaceSuggestion[] }> = {}

  for (const row of queryRows as Record<string, unknown>[]) {
    const query = String(row.query ?? '')
    queries[query] = {
      updatedAt: new Date(String(row.updated_at)).toISOString(),
      results: await getStoredQueryResults(query),
    }
  }

  return {
    version: 1 as const,
    updatedAt: (queryRows[0] as Record<string, unknown> | undefined)?.updated_at
      ? new Date(String((queryRows[0] as Record<string, unknown>).updated_at)).toISOString()
      : new Date(0).toISOString(),
    queries,
  }
}

export async function searchPlaces(query: string, limit = 8) {
  const normalized = normalizeQuery(query)
  if (!normalized) return []

  let cachedResults: PlaceSuggestion[] = []
  let exactQueryCached = false
  try {
    cachedResults = await searchStoredPlaces(query)
    exactQueryCached = (await getStoredQueryResults(query)).length > 0
  } catch {
    cachedResults = []
  }

  const localResults = searchPlaceSuggestions(
    dedupePlaceSuggestions([...cachedResults, ...LOCAL_PLACE_SUGGESTIONS]),
    query,
    limit
  )

  if (exactQueryCached || localResults.length >= Math.min(limit, 5) || normalized.length < 3) {
    return localResults
  }

  try {
    const remoteResults = await fetchRapidApiPlaces(query)
    await savePlacesForQuery(query, remoteResults)
    return searchPlaceSuggestions(
      dedupePlaceSuggestions([...cachedResults, ...remoteResults, ...LOCAL_PLACE_SUGGESTIONS]),
      query,
      limit
    )
  } catch {
    return localResults
  }
}

export async function refreshPlacesQueries(queries: string[]) {
  const refreshed: Record<string, number> = {}
  for (const query of queries.map((value) => value.trim()).filter(Boolean)) {
    const results = await fetchRapidApiPlaces(query)
    await savePlacesForQuery(query, results)
    refreshed[query] = results.length
  }
  return refreshed
}
