import fs from 'fs/promises'
import path from 'path'
import { neon } from '@neondatabase/serverless'

const root = process.cwd()
const apiKey = process.env.RAPIDAPI_KEY
const databaseUrl = process.env.DATABASE_URL
const host = process.env.RAPIDAPI_AIRLINE_DB_HOST ?? 'airline-database.p.rapidapi.com'
const priorityPath = path.join(root, 'data', 'places-priority-queries.json')
const DEFAULT_LIMIT = Number(process.env.PLACES_REFRESH_LIMIT ?? 20)

if (!apiKey) {
  console.error('RAPIDAPI_KEY is required to refresh places.')
  process.exit(1)
}

if (!databaseUrl) {
  console.error('DATABASE_URL is required to refresh places.')
  process.exit(1)
}

const sql = neon(databaseUrl)
const priorities = JSON.parse(await fs.readFile(priorityPath, 'utf8'))
const cliArgs = process.argv.slice(2)
const limitArg = cliArgs.find((arg) => arg.startsWith('--limit='))
const requestedLimit = limitArg ? Number(limitArg.split('=')[1]) : DEFAULT_LIMIT
const explicitQueries = cliArgs.filter((arg) => !arg.startsWith('--limit='))
const queries = (explicitQueries.length > 0 ? explicitQueries : priorities).slice(
  0,
  Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : DEFAULT_LIMIT
)

function normalize(value) {
  return String(value ?? '').trim()
}

function countryCodeFromName(country, cities) {
  const match = cities.find((item) => item.country.toLowerCase() === country.toLowerCase())
  return match?.countryCode
}

function computeRank(name, source, timezone, city) {
  const lower = name.toLowerCase()
  let rank = 70
  if (lower.includes('all airports')) rank += 55
  if (lower.includes('international')) rank += 35
  if (lower.includes('heliport')) rank -= 320
  if (lower.includes('raf') || lower.includes('air base') || lower.includes('airfield')) rank -= 220
  if (lower.includes('municipal')) rank -= 70
  if (source.toLowerCase() === 'user') rank -= 25
  if (!timezone) rank -= 20
  if (city.toLowerCase() === 'new york' && lower.includes('all airports')) rank += 80
  return rank
}

const cities = JSON.parse(await fs.readFile(path.join(root, 'public', 'data', 'cities.json'), 'utf8'))

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

console.log(`Refreshing ${queries.length} place queries...`)

for (const query of queries.map(normalize).filter(Boolean)) {
  const response = await fetch(`https://${host}/api/advance-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': host,
      'x-rapidapi-key': apiKey,
    },
    body: new URLSearchParams({ q: query }).toString(),
  })

  if (!response.ok) {
    console.error(`Failed to refresh "${query}": ${response.status}`)
    continue
  }

  const payload = await response.json()
  const rows = Array.isArray(payload?.data) ? payload.data.flatMap((entry) => Array.isArray(entry) ? entry : []) : []
  const results = rows
    .map((row) => {
      const city = normalize(row.city)
      const country = normalize(row.country)
      const iata = normalize(row.iata).toUpperCase()
      const airportName = normalize(row.name)
      const timezone = normalize(row.tz_timezone)
      const latitude = Number(row.latitude)
      const longitude = Number(row.longitude)
      const type = normalize(row.type).toLowerCase()
      const source = normalize(row.source)

      if (!city || !country || !iata || iata === '\\N' || type !== 'airport') return null

      const rank = computeRank(airportName, source, timezone, city)
      if (rank <= 0) return null

      return {
        city,
        country,
        countryCode: countryCodeFromName(country, cities),
        iata,
        airportName,
        lat: Number.isFinite(latitude) ? latitude : undefined,
        lon: Number.isFinite(longitude) ? longitude : undefined,
        timezone: timezone || undefined,
        kind: airportName.toLowerCase().includes('all airports') ? 'metro' : 'airport',
        rank,
        source: 'rapidapi',
      }
    })
    .filter(Boolean)

  const normalizedQuery = query.toLowerCase()
  await sql`INSERT INTO place_queries (query, updated_at) VALUES (${normalizedQuery}, NOW()) ON CONFLICT (query) DO UPDATE SET updated_at = EXCLUDED.updated_at`
  await sql`DELETE FROM place_results WHERE query = ${normalizedQuery}`

  for (const result of results) {
    await sql`
      INSERT INTO place_results (
        query, city, country, country_code, iata, airport_name, lat, lon, timezone, kind, rank, source
      ) VALUES (
        ${normalizedQuery},
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
        ${result.source ?? 'rapidapi'}
      )
    `
  }

  console.log(`${query}: ${results.length} saved`)
}
