import type { VisaResult, VisaType } from './types'
import { readFileSync } from 'fs'
import path from 'path'
import Papa from 'papaparse'

const PASSPORT_CODES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
  DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  JP: 'Japan', KR: 'South Korea', CN: 'China', IN: 'India', BR: 'Brazil',
  MX: 'Mexico', ZA: 'South Africa', IL: 'Israel', SG: 'Singapore',
  NZ: 'New Zealand', SE: 'Sweden', NO: 'Norway', CH: 'Switzerland',
  AT: 'Austria', BE: 'Belgium', PL: 'Poland', PT: 'Portugal', GR: 'Greece',
  TR: 'Turkey', RU: 'Russia', AE: 'United Arab Emirates',
}

const CITY_TO_COUNTRY: Record<string, string> = {
  Bangkok: 'Thailand', Tokyo: 'Japan', Paris: 'France', London: 'United Kingdom',
  'New York': 'United States', Rome: 'Italy', Barcelona: 'Spain', Berlin: 'Germany',
  Amsterdam: 'Netherlands', Dubai: 'United Arab Emirates', Singapore: 'Singapore',
  Sydney: 'Australia', Toronto: 'Canada', Madrid: 'Spain', Lisbon: 'Portugal',
  Athens: 'Greece', Istanbul: 'Turkey', Bali: 'Indonesia', 'Ho Chi Minh City': 'Vietnam',
  Hanoi: 'Vietnam', Seoul: 'South Korea', Osaka: 'Japan', Kyoto: 'Japan',
  Mumbai: 'India', Delhi: 'India', 'Cape Town': 'South Africa', Cairo: 'Egypt',
  Marrakech: 'Morocco', Nairobi: 'Kenya', 'Buenos Aires': 'Argentina',
  'Rio de Janeiro': 'Brazil', 'Mexico City': 'Mexico', Cancun: 'Mexico',
  Phuket: 'Thailand', 'Chiang Mai': 'Thailand', Kuala Lumpur: 'Malaysia',
  Jakarta: 'Indonesia', Manila: 'Philippines', Taipei: 'Taiwan',
  'Hong Kong': 'Hong Kong', Macau: 'Macau', Vienna: 'Austria', Prague: 'Czech Republic',
  Budapest: 'Hungary', Warsaw: 'Poland', Stockholm: 'Sweden', Oslo: 'Norway',
  Copenhagen: 'Denmark', Helsinki: 'Finland', Zurich: 'Switzerland', Brussels: 'Belgium',
}

function normalizePassport(code: string): string {
  return PASSPORT_CODES[code.toUpperCase()] ?? code
}

function normalizeDestination(city: string): string {
  return CITY_TO_COUNTRY[city] ?? city
}

function mapVisaType(raw: string): VisaType {
  const v = raw.toLowerCase()
  if (v === 'visa free' || v === '0' || v.includes('visa free')) return 'visa_free'
  if (v === 'e-visa' || v === 'evisa' || v.includes('e-visa')) return 'e_visa'
  if (v === 'visa on arrival' || v.includes('on arrival')) return 'visa_on_arrival'
  if (v === 'freedom of movement' || v.includes('freedom')) return 'free_movement'
  if (v === 'visa required' || v === '-1' || v.includes('required')) return 'visa_required'
  const n = parseInt(v)
  if (!isNaN(n) && n > 0) return 'visa_free'
  return 'visa_required'
}

function csvFallback(passport: string, destination: string): VisaResult {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'passport-index.csv')
    const content = readFileSync(csvPath, 'utf-8')
    const { data } = Papa.parse<{ Passport: string; Destination: string; Value: string }>(content, {
      header: true,
      skipEmptyLines: true,
    })
    const row = data.find(
      (r) =>
        r.Passport?.toUpperCase() === passport.toUpperCase() &&
        r.Destination?.toUpperCase() === destination.toUpperCase()
    )
    if (row) {
      return {
        type: mapVisaType(row.Value ?? ''),
        passportCountry: passport,
        destinationCountry: destination,
      }
    }
  } catch {
    // fallback failed silently
  }
  return { type: 'unknown', passportCountry: passport, destinationCountry: destination }
}

export async function checkVisa(passport: string, destination: string): Promise<VisaResult> {
  const passportCountry = normalizePassport(passport)
  const destinationCountry = normalizeDestination(destination)
  const key = process.env.VISA_API_KEY

  if (key) {
    try {
      const res = await fetch(
        `https://api.travel-buddy.ai/v2/visa/check?passport=${encodeURIComponent(passportCountry)}&destination=${encodeURIComponent(destinationCountry)}`,
        { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 86400 } }
      )
      if (res.ok) {
        const data = await res.json()
        return {
          type: mapVisaType(String(data.visa_type ?? data.type ?? '')),
          maxStay: data.max_stay ?? data.duration,
          sourceUrl: data.source_url ?? data.link,
          passportCountry,
          destinationCountry,
        }
      }
    } catch {
      // fall through to CSV
    }
  }

  return csvFallback(passportCountry, destinationCountry)
}
