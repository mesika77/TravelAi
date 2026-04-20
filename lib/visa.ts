import type { VisaResult, VisaType } from './types'
import { readFileSync } from 'fs'
import path from 'path'
import Papa from 'papaparse'

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
  const key = process.env.VISA_API_KEY

  if (key) {
    try {
      const res = await fetch(
        `https://api.travel-buddy.ai/v2/visa/check?passport=${passport}&destination=${destination}`,
        { headers: { Authorization: `Bearer ${key}` }, next: { revalidate: 86400 } }
      )
      if (res.ok) {
        const data = await res.json()
        return {
          type: mapVisaType(String(data.visa_type ?? data.type ?? '')),
          maxStay: data.max_stay ?? data.duration,
          sourceUrl: data.source_url ?? data.link,
          passportCountry: passport,
          destinationCountry: destination,
        }
      }
    } catch {
      // fall through to CSV
    }
  }

  return csvFallback(passport, destination)
}
