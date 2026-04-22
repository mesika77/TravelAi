import type { VisaResult, VisaType } from './types'
import { readFileSync } from 'fs'
import path from 'path'
import Papa from 'papaparse'
import citiesData from '@/public/data/cities.json'

const PASSPORT_NAMES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
  DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  JP: 'Japan', KR: 'South Korea', CN: 'China', IN: 'India', BR: 'Brazil',
  MX: 'Mexico', ZA: 'South Africa', IL: 'Israel', SG: 'Singapore',
  NZ: 'New Zealand', SE: 'Sweden', NO: 'Norway', CH: 'Switzerland',
  AT: 'Austria', BE: 'Belgium', PL: 'Poland', PT: 'Portugal', GR: 'Greece',
  TR: 'Turkey', RU: 'Russia', AE: 'United Arab Emirates',
}

type CityEntry = { name: string; country: string; countryCode: string }

const COUNTRY_ALIASES: Record<string, string> = {
  UAE: 'United Arab Emirates',
  'U.A.E.': 'United Arab Emirates',
  UK: 'United Kingdom',
  USA: 'United States',
}

const COUNTRY_CODE_TO_NAME = Object.fromEntries(
  Object.entries(PASSPORT_NAMES).map(([code, name]) => [code.toUpperCase(), name])
)

function cityLookup(city: string): CityEntry | undefined {
  return (citiesData as CityEntry[]).find(
    (c) => c.name.toLowerCase() === city.toLowerCase()
  )
}

function mapVisaType(raw: string): VisaType {
  const v = raw.toLowerCase()
  if (v.includes('not required') || v.includes('visa free') || v === '0') return 'visa_free'
  if (v.includes('e-visa') || v.includes('evisa') || v === 'e_visa') return 'e_visa'
  if (v.includes('on arrival')) return 'visa_on_arrival'
  if (v.includes('freedom')) return 'free_movement'
  if (v.includes('required')) return 'visa_required'
  const n = parseInt(v)
  if (!isNaN(n) && n > 0) return 'visa_free'
  return 'visa_required'
}

function normalizeCountryName(value: string): string {
  const trimmed = value.trim()
  const upper = trimmed.toUpperCase()
  return COUNTRY_ALIASES[trimmed] ?? COUNTRY_ALIASES[upper] ?? COUNTRY_CODE_TO_NAME[upper] ?? trimmed
}

function csvFallback(passportName: string, destinationName: string): VisaResult {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'data', 'passport-index.csv')
    const content = readFileSync(csvPath, 'utf-8')
    const { data } = Papa.parse<{ Passport: string; Destination: string; Value: string }>(content, {
      header: true,
      skipEmptyLines: true,
    })
    const normalizedPassport = normalizeCountryName(passportName).toUpperCase()
    const normalizedDestination = normalizeCountryName(destinationName).toUpperCase()
    const row = data.find(
      (r) =>
        normalizeCountryName(r.Passport ?? '').toUpperCase() === normalizedPassport &&
        normalizeCountryName(r.Destination ?? '').toUpperCase() === normalizedDestination
    )
    if (row) {
      return {
        type: mapVisaType(row.Value ?? ''),
        passportCountry: normalizeCountryName(passportName),
        destinationCountry: normalizeCountryName(destinationName),
      }
    }
  } catch {
    // fallback failed silently
  }
  return {
    type: 'unknown',
    passportCountry: normalizeCountryName(passportName),
    destinationCountry: normalizeCountryName(destinationName),
  }
}

export function checkVisaOffline(passport: string, destinationCountry: string): VisaResult {
  const passportCode = passport.toUpperCase()
  const passportName = PASSPORT_NAMES[passportCode] ?? passport
  return csvFallback(passportName, normalizeCountryName(destinationCountry))
}

export async function checkVisa(passport: string, destination: string): Promise<VisaResult> {
  const passportCode = passport.toUpperCase()
  const passportName = PASSPORT_NAMES[passportCode] ?? passport
  const city = cityLookup(destination)
  const destinationCode = city?.countryCode ?? destination.toUpperCase()
  const destinationName = city?.country ?? destination

  // Citizen travelling to their own country — never needs a visa
  if (passportCode === destinationCode) {
    return { type: 'free_movement', passportCountry: passportName, destinationCountry: destinationName }
  }

  const key = process.env.VISA_API_KEY

  if (key) {
    try {
      const res = await fetch('https://visa-requirement.p.rapidapi.com/v2/visa/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': 'visa-requirement.p.rapidapi.com',
        },
        body: JSON.stringify({ passport: passportCode, destination: destinationCode }),
        next: { revalidate: 86400 },
      })
      if (res.ok) {
        const json = await res.json()
        const rule = json?.data?.visa_rules?.primary_rule
        const dest = json?.data?.destination
        return {
          type: mapVisaType(String(rule?.name ?? rule?.color ?? '')),
          maxStay: rule?.duration,
          sourceUrl: dest?.embassy_url,
          passportCountry: passportName,
          destinationCountry: destinationName,
        }
      }
    } catch {
      // fall through to CSV
    }
  }

  return csvFallback(passportName, destinationName)
}
