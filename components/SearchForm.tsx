'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Minus, Plus, LocateFixed } from 'lucide-react'
import { encodeTripId } from '@/lib/encode'
import type { TripParams } from '@/lib/types'
import CityAutocomplete from './CityAutocomplete'
import citiesData from '@/public/data/cities.json'
import airportsData from '@/public/data/airports.json'

const airportCities = new Set(
  (airportsData as { city: string }[]).map((a) => a.city.toLowerCase())
)

const citiesWithAirports = (citiesData as { name: string; lat: number; lon: number }[]).filter(
  (c) => airportCities.has(c.name.toLowerCase())
)

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestAirportCity(lat: number, lon: number): string {
  let best = citiesWithAirports[0]
  let bestDist = Infinity
  for (const c of citiesWithAirports) {
    const d = haversineKm(lat, lon, c.lat, c.lon)
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best.name
}

const INTERESTS = [
  { id: 'food', label: 'Food' },
  { id: 'culture', label: 'Culture' },
  { id: 'nature', label: 'Nature' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'history', label: 'History' },
  { id: 'beaches', label: 'Beaches' },
]

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IL', name: 'Israel' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'TR', name: 'Turkey' },
  { code: 'AE', name: 'UAE' },
  { code: 'TH', name: 'Thailand' },
]

export default function SearchForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [oneWay, setOneWay] = useState(false)
  const [detectedCity, setDetectedCity] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const [form, setForm] = useState<Partial<TripParams>>({
    adults: 2,
    children: 0,
    budget: 2000,
    passport: 'US',
    interests: [],
  })

  useEffect(() => {
    // Listen for destination pre-fill events dispatched by destination cards
    const handler = (e: Event) => {
      const city = (e as CustomEvent<{ destination: string }>).detail.destination
      if (city) {
        set('destination', city)
        // Also fill origin from geolocation if not already detected
        if (!detectedCity && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const nearest = nearestAirportCity(pos.coords.latitude, pos.coords.longitude)
              setDetectedCity(nearest)
              setForm((f) => f.origin ? f : { ...f, origin: nearest })
            },
            () => {},
            { timeout: 6000, maximumAge: 300_000 }
          )
        }
      }
    }
    window.addEventListener('travelai:prefill', handler)
    return () => window.removeEventListener('travelai:prefill', handler)
  }, [detectedCity]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = nearestAirportCity(pos.coords.latitude, pos.coords.longitude)
        setDetectedCity(city)
        setForm((f) => f.origin ? f : { ...f, origin: city })
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 6000, maximumAge: 300_000 }
    )
  }, [])

  const set = (key: keyof TripParams, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }))

  const toggleInterest = (id: string) => {
    const current = form.interests ?? []
    set('interests', current.includes(id) ? current.filter((i) => i !== id) : [...current, id])
  }

  const handleSubmit = () => {
    const params: TripParams = {
      origin: form.origin ?? '',
      destination: form.destination ?? '',
      departureDate: form.departureDate ?? '',
      returnDate: oneWay ? (form.departureDate ?? '') : (form.returnDate ?? ''),
      oneWay,
      adults: form.adults ?? 2,
      children: form.children ?? 0,
      budget: form.budget ?? 2000,
      passport: form.passport ?? 'US',
      interests: form.interests ?? [],
    }
    const id = encodeTripId(params)
    router.push(`/trip/${id}`)
  }

  const canNext0 = form.origin && form.destination && form.departureDate && (oneWay || form.returnDate)
  const canNext1 = (form.adults ?? 0) > 0 && (oneWay || (form.budget ?? 0) > 0)
  const canSubmit = canNext1 && form.passport && (form.interests?.length ?? 0) > 0

  return (
    <div className="searchform">
      {/* Progress indicator */}
      <div className="sf-head">
        <div className="sf-dots">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="sf-dot"
              style={{
                width: i === step ? 44 : 8,
                background: i <= step ? 'var(--ink)' : 'var(--line)',
                opacity: i < step ? 0.4 : 1,
              }}
            />
          ))}
        </div>
        <div className="sf-step-label mono">Step {step + 1} / 3</div>
      </div>

      {/* Step 0: Where & when */}
      {step === 0 && (
        <div className="sf-step fade-up">
          <div className="sf-row-toggle">
            <div>
              <div className="eyebrow">01 — Itinerary</div>
              <h2 className="serif" style={{ fontSize: 38, marginTop: 6 }}>Where &amp; when.</h2>
            </div>
            <div className="pill-toggle">
              <button
                type="button"
                className={!oneWay ? 'active' : ''}
                onClick={() => setOneWay(false)}
              >
                Round trip
              </button>
              <button
                type="button"
                className={oneWay ? 'active' : ''}
                onClick={() => setOneWay(true)}
              >
                One way
              </button>
            </div>
          </div>

          <div className="sf-grid-2">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="field-label">From</div>
                {locating && (
                  <span className="mono mute" style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <LocateFixed size={10} style={{ animation: 'spin 1s linear infinite' }} /> Detecting…
                  </span>
                )}
                {detectedCity && form.origin === detectedCity && !locating && (
                  <span className="mono" style={{ fontSize: 9, color: 'var(--go)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <LocateFixed size={10} /> Detected
                  </span>
                )}
              </div>
              <CityAutocomplete
                placeholder="New York"
                value={form.origin ?? ''}
                onChange={(val) => set('origin', val)}
              />
            </div>
            <CityAutocomplete
              label="To"
              placeholder="Lisbon"
              value={form.destination ?? ''}
              onChange={(val) => set('destination', val)}
            />
          </div>

          <div className={oneWay ? 'sf-grid-1' : 'sf-grid-2'}>
            <div className="field">
              <div className="field-label">Departure</div>
              <input
                className="input"
                type="date"
                value={form.departureDate ?? ''}
                onChange={(e) => set('departureDate', e.target.value)}
              />
            </div>
            {!oneWay && (
              <div className="field">
                <div className="field-label">Return</div>
                <input
                  className="input"
                  type="date"
                  value={form.returnDate ?? ''}
                  onChange={(e) => set('returnDate', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="sf-footer">
            <span className="mono mute">Press next or ↵</span>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canNext0}
              onClick={() => setStep(1)}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Who's coming */}
      {step === 1 && (
        <div className="sf-step fade-up">
          <div>
            <div className="eyebrow">02 — Party</div>
            <h2 className="serif" style={{ fontSize: 38, marginTop: 6 }}>Who&apos;s coming along?</h2>
          </div>

          <div className="sf-grid-2">
            <div className="field">
              <div className="field-label">Adults</div>
              <div className="stepper">
                <button type="button" onClick={() => set('adults', Math.max(1, (form.adults ?? 1) - 1))}>
                  <Minus size={14} />
                </button>
                <span className="tabular">{form.adults ?? 1}</span>
                <button type="button" onClick={() => set('adults', (form.adults ?? 1) + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="field">
              <div className="field-label">Children</div>
              <div className="stepper">
                <button type="button" onClick={() => set('children', Math.max(0, (form.children ?? 0) - 1))}>
                  <Minus size={14} />
                </button>
                <span className="tabular">{form.children ?? 0}</span>
                <button type="button" onClick={() => set('children', (form.children ?? 0) + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {!oneWay && (
            <div className="field">
              <div className="field-label">Budget per person · USD</div>
              <input
                className="input tabular"
                type="number"
                value={form.budget ?? 2000}
                onChange={(e) => set('budget', +e.target.value)}
              />
              <div className="mono mute" style={{ marginTop: 4 }}>Includes flight, stay, and daily spend</div>
            </div>
          )}

          <div className="sf-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canNext1}
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <div className="sf-step fade-up">
          <div>
            <div className="eyebrow">03 — Preferences</div>
            <h2 className="serif" style={{ fontSize: 38, marginTop: 6 }}>Tell us what you love.</h2>
          </div>

          <div className="field">
            <div className="field-label">Passport</div>
            <select
              className="select"
              value={form.passport ?? 'US'}
              onChange={(e) => set('passport', e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 12 }}>Interests · pick at least one</div>
            <div className="chipwrap">
              {INTERESTS.map((interest) => {
                const on = form.interests?.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    type="button"
                    className={'chip' + (on ? ' on' : '')}
                    onClick={() => toggleInterest(interest.id)}
                  >
                    {on && <span className="chip-dot" />}
                    {interest.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="sf-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Plan my trip <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
