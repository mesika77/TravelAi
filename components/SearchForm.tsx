'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Minus, Plus, LocateFixed, Compass } from 'lucide-react'
import { encodeDiscoverId, encodeTripId } from '@/lib/encode'
import type { DiscoverDateMode, DiscoverParams, TripParams } from '@/lib/types'
import CityAutocomplete from './CityAutocomplete'
import PassportAutocomplete, { type PassportOption } from './PassportAutocomplete'
import citiesData from '@/public/data/cities.json'
import airportsData from '@/public/data/airports.json'

type SearchMode = 'trip' | 'discover'

interface SearchDraft {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  flexibleMonths: number[]
  tripLengthNights: number
  adults: number
  children: number
  budget: number
  passport: string
  interests: string[]
  regionQuery: string
  beachPriority: boolean
}

const airportCities = new Set(
  (airportsData as { city: string }[]).map((a) => a.city.toLowerCase())
)

const citiesWithAirports = (citiesData as { name: string; lat: number; lon: number }[]).filter(
  (c) => airportCities.has(c.name.toLowerCase())
)

function getUpcomingMonths() {
  const base = new Date()
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() + index, 1)
    return {
      value: date.getMonth() + 1,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
    }
  })
}

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

const COUNTRIES: PassportOption[] = [
  { code: 'US', name: 'United States', aliases: ['American', 'USA', 'US'] },
  { code: 'GB', name: 'United Kingdom', aliases: ['British', 'UK', 'Great Britain'] },
  { code: 'CA', name: 'Canada', aliases: ['Canadian'] },
  { code: 'AU', name: 'Australia', aliases: ['Australian'] },
  { code: 'DE', name: 'Germany', aliases: ['German'] },
  { code: 'FR', name: 'France', aliases: ['French'] },
  { code: 'IT', name: 'Italy', aliases: ['Italian'] },
  { code: 'ES', name: 'Spain', aliases: ['Spanish'] },
  { code: 'NL', name: 'Netherlands', aliases: ['Dutch'] },
  { code: 'JP', name: 'Japan', aliases: ['Japanese'] },
  { code: 'KR', name: 'South Korea', aliases: ['Korean', 'South Korean'] },
  { code: 'CN', name: 'China', aliases: ['Chinese'] },
  { code: 'IN', name: 'India', aliases: ['Indian'] },
  { code: 'BR', name: 'Brazil', aliases: ['Brazilian'] },
  { code: 'MX', name: 'Mexico', aliases: ['Mexican'] },
  { code: 'ZA', name: 'South Africa', aliases: ['South African'] },
  { code: 'IL', name: 'Israel', aliases: ['Israeli'] },
  { code: 'SG', name: 'Singapore', aliases: ['Singaporean'] },
  { code: 'NZ', name: 'New Zealand', aliases: ['New Zealander', 'Kiwi'] },
  { code: 'SE', name: 'Sweden', aliases: ['Swedish', 'Swede'] },
  { code: 'NO', name: 'Norway', aliases: ['Norwegian'] },
  { code: 'CH', name: 'Switzerland', aliases: ['Swiss'] },
  { code: 'AT', name: 'Austria', aliases: ['Austrian'] },
  { code: 'BE', name: 'Belgium', aliases: ['Belgian'] },
  { code: 'PL', name: 'Poland', aliases: ['Polish'] },
  { code: 'PT', name: 'Portugal', aliases: ['Portuguese'] },
  { code: 'GR', name: 'Greece', aliases: ['Greek'] },
  { code: 'TR', name: 'Turkey', aliases: ['Turkish'] },
  { code: 'AE', name: 'United Arab Emirates', aliases: ['UAE', 'Emirati'] },
  { code: 'TH', name: 'Thailand', aliases: ['Thai'] },
]

const UPCOMING_MONTHS = getUpcomingMonths()

export default function SearchForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [searchMode, setSearchMode] = useState<SearchMode>('trip')
  const [dateMode, setDateMode] = useState<DiscoverDateMode>('exact')
  const [oneWay, setOneWay] = useState(false)
  const [detectedCity, setDetectedCity] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)
  const [form, setForm] = useState<SearchDraft>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    flexibleMonths: [UPCOMING_MONTHS[0]?.value ?? new Date().getMonth() + 1],
    tripLengthNights: 7,
    adults: 2,
    children: 0,
    budget: 2000,
    passport: 'US',
    interests: [],
    regionQuery: '',
    beachPriority: false,
  })

  const setField = <K extends keyof SearchDraft>(key: K, val: SearchDraft[K]) =>
    setForm((current) => ({ ...current, [key]: val }))

  useEffect(() => {
    const handler = (e: Event) => {
      const city = (e as CustomEvent<{ destination: string }>).detail.destination
      if (city) {
        setSearchMode('trip')
        setField('destination', city)
        if (!detectedCity && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const nearest = nearestAirportCity(pos.coords.latitude, pos.coords.longitude)
              setDetectedCity(nearest)
              setForm((current) => ({ ...current, origin: nearest }))
            },
            () => {},
            { timeout: 6000, maximumAge: 300_000 }
          )
        }
      }
    }
    window.addEventListener('travelai:prefill', handler)
    return () => window.removeEventListener('travelai:prefill', handler)
  }, [detectedCity])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = nearestAirportCity(pos.coords.latitude, pos.coords.longitude)
        setDetectedCity(city)
        setForm((current) => ({ ...current, origin: current.origin || city }))
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 10000, maximumAge: 300_000, enableHighAccuracy: false }
    )
  }, [])

  const toggleInterest = (id: string) => {
    const current = form.interests
    setField('interests', current.includes(id) ? current.filter((i) => i !== id) : [...current, id])
  }

  const toggleFlexibleMonth = (month: number) => {
    const current = form.flexibleMonths
    const next = current.includes(month)
      ? current.filter((value) => value !== month)
      : [...current, month]
    setField('flexibleMonths', next)
  }

  const handleSubmit = () => {
    if (searchMode === 'trip') {
      const params: TripParams = {
        origin: form.origin,
        destination: form.destination,
        departureDate: form.departureDate,
        returnDate: oneWay ? form.departureDate : form.returnDate,
        oneWay,
        adults: form.adults,
        children: form.children,
        budget: form.budget,
        passport: form.passport,
        interests: form.interests,
      }
      router.push(`/trip/${encodeTripId(params)}`)
      return
    }

    const params: DiscoverParams = {
      searchMode: 'discover',
      origin: form.origin,
      departureDate: dateMode === 'exact' ? form.departureDate : undefined,
      returnDate: dateMode === 'exact' ? form.returnDate : undefined,
      flexibleMonths: dateMode === 'flexible' ? form.flexibleMonths : undefined,
      tripLengthNights: dateMode === 'flexible'
        ? Math.max(1, form.tripLengthNights)
        : Math.max(1, Math.round((new Date(form.returnDate).getTime() - new Date(form.departureDate).getTime()) / 86400000)),
      adults: form.adults,
      children: form.children,
      budget: form.budget,
      passport: form.passport,
      interests: form.interests,
      regionQuery: form.regionQuery || undefined,
      beachPriority: form.beachPriority,
    }
    router.push(`/discover/${encodeDiscoverId(params)}`)
  }

  const canNextTrip = form.origin && form.destination && form.departureDate && (oneWay || form.returnDate)
  const canNextDiscover = form.origin && (
    dateMode === 'exact'
      ? Boolean(form.departureDate && form.returnDate)
      : Boolean(form.flexibleMonths.length > 0 && form.tripLengthNights > 0)
  )
  const canNext0 = searchMode === 'trip' ? canNextTrip : canNextDiscover
  const canNext1 = form.adults > 0 && (searchMode === 'discover' || oneWay || form.budget > 0)
  const canSubmit = canNext1 && Boolean(form.passport) && form.interests.length > 0

  return (
    <div className="searchform planner-surface">
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

      {step === 0 && (
        <div className="sf-step fade-up">
          <div className="sf-row-toggle">
            <div>
              <div className="eyebrow">01 — Itinerary</div>
              <h2 className="serif" style={{ fontSize: 38, marginTop: 6 }}>
                {searchMode === 'trip' ? 'Where & when.' : 'Start from home, not from a pin.'}
              </h2>
            </div>
            <div className="pill-toggle">
              <button
                type="button"
                className={searchMode === 'trip' ? 'active' : ''}
                onClick={() => setSearchMode('trip')}
              >
                Pick a city
              </button>
              <button
                type="button"
                className={searchMode === 'discover' ? 'active' : ''}
                onClick={() => {
                  setSearchMode('discover')
                  setOneWay(false)
                }}
              >
                I don&apos;t know where to fly
              </button>
            </div>
          </div>

          <div className="sf-helper">
            <div className="sf-helper-icon">
              <Compass size={16} strokeWidth={1.8} />
            </div>
            <div>
              {searchMode === 'trip'
                ? 'Plan around a destination you already have in mind.'
                : 'We’ll suggest destinations that fit your timing, budget, interests, weather, and how realistic the flight is from your departure city.'}
            </div>
          </div>

          {searchMode === 'trip' && (
            <div className="pill-toggle" style={{ alignSelf: 'flex-start' }}>
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
          )}

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
                value={form.origin}
                onChange={(val) => setField('origin', val)}
              />
            </div>

            {searchMode === 'trip' ? (
              <CityAutocomplete
                label="To"
                placeholder="Lisbon"
                value={form.destination}
                onChange={(val) => setField('destination', val)}
              />
            ) : (
              <div className="field">
                <div className="field-label">Country or region</div>
                <input
                  className="input"
                  value={form.regionQuery}
                  placeholder="Europe, Japan, beach in Mexico…"
                  onChange={(e) => setField('regionQuery', e.target.value)}
                />
                <div className="mono mute">Optional. Leave blank to search broadly.</div>
              </div>
            )}
          </div>

          {searchMode === 'discover' && (
            <div className="pill-toggle" style={{ alignSelf: 'flex-start' }}>
              <button
                type="button"
                className={dateMode === 'exact' ? 'active' : ''}
                onClick={() => setDateMode('exact')}
              >
                Exact dates
              </button>
              <button
                type="button"
                className={dateMode === 'flexible' ? 'active' : ''}
                onClick={() => setDateMode('flexible')}
              >
                Flexible month
              </button>
            </div>
          )}

          {searchMode === 'trip' || dateMode === 'exact' ? (
            <div className={oneWay ? 'sf-grid-1' : 'sf-grid-2'}>
              <div className="field">
                <div className="field-label">Departure</div>
                <input
                  className="input"
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => {
                    const dep = e.target.value
                    setField('departureDate', dep)
                    if (dep && (!form.returnDate || form.returnDate < dep)) {
                      setField('returnDate', dep)
                    }
                  }}
                />
              </div>
              {!oneWay && (
                <div className="field">
                  <div className="field-label">{searchMode === 'trip' ? 'Return' : 'Back by'}</div>
                  <input
                    className="input"
                    type="date"
                    min={form.departureDate}
                    value={form.returnDate}
                    onChange={(e) => setField('returnDate', e.target.value)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="sf-grid-2">
              <div className="field">
                <div className="field-label">Months</div>
                <div className="chipwrap">
                  {UPCOMING_MONTHS.map((month) => {
                    const on = form.flexibleMonths.includes(month.value)
                    return (
                      <button
                        key={`${month.label}-${month.value}`}
                        type="button"
                        className={'chip' + (on ? ' on' : '')}
                        onClick={() => toggleFlexibleMonth(month.value)}
                      >
                        {month.label}
                      </button>
                    )
                  })}
                </div>
                <div className="mono mute">Pick one or more upcoming months.</div>
              </div>
              <div className="field">
                <div className="field-label">Trip length</div>
                <input
                  className="input tabular"
                  type="number"
                  min={1}
                  value={form.tripLengthNights}
                  onChange={(e) => setField('tripLengthNights', Number(e.target.value))}
                  placeholder="7"
                />
                <div className="mono mute">Enter however many nights you want.</div>
              </div>
            </div>
          )}

          <div className="sf-footer">
            <span className="mono mute">
              {searchMode === 'trip' ? 'We’ll build a full trip page.' : 'We’ll rank destinations and explain the fit.'}
            </span>
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

      {step === 1 && (
        <div className="sf-step fade-up">
          <div>
            <div className="eyebrow">02 — Party</div>
            <h2 className="serif" style={{ fontSize: 38, marginTop: 6 }}>
              {searchMode === 'trip' ? 'Who&apos;s coming along?' : 'Who are we optimizing for?'}
            </h2>
          </div>

          <div className="sf-grid-2">
            <div className="field">
              <div className="field-label">Adults</div>
              <div className="stepper">
                <button type="button" onClick={() => setField('adults', Math.max(1, form.adults - 1))}>
                  <Minus size={14} />
                </button>
                <span className="tabular">{form.adults}</span>
                <button type="button" onClick={() => setField('adults', form.adults + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="field">
              <div className="field-label">Children</div>
              <div className="stepper">
                <button type="button" onClick={() => setField('children', Math.max(0, form.children - 1))}>
                  <Minus size={14} />
                </button>
                <span className="tabular">{form.children}</span>
                <button type="button" onClick={() => setField('children', form.children + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {(searchMode === 'discover' || !oneWay) && (
            <div className="field">
              <div className="field-label">Budget per person · USD</div>
              <input
                className="input tabular"
                type="number"
                value={form.budget}
                onChange={(e) => setField('budget', Number(e.target.value))}
              />
              <div className="mono mute" style={{ marginTop: 4 }}>
                {searchMode === 'discover' ? 'Used to filter flight + stay realism.' : 'Includes flight, stay, and daily spend.'}
              </div>
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

      {step === 2 && (
        <div className="sf-step fade-up">
          <div>
            <div className="eyebrow">03 — Preferences</div>
            <h2 className="serif" style={{ fontSize: 38, marginTop: 6 }}>
              {searchMode === 'trip' ? 'Tell us what you love.' : 'Describe the trip you want to find.'}
            </h2>
          </div>

          <div className="sf-grid-2">
            <div className="field">
              <PassportAutocomplete
                label="Passport"
                value={form.passport}
                onChange={(val) => setField('passport', val)}
                options={COUNTRIES}
                placeholder="American, British, Israeli..."
              />
            </div>

            {searchMode === 'discover' && (
              <button
                type="button"
                className={'chip' + (form.beachPriority ? ' on' : '')}
                style={{ alignSelf: 'end', justifyContent: 'center', minHeight: 56 }}
                onClick={() => setField('beachPriority', !form.beachPriority)}
              >
                {form.beachPriority ? 'Dry beach weather only' : 'Beach weather matters'}
              </button>
            )}
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 12 }}>Interests · pick at least one</div>
            <div className="chipwrap">
              {INTERESTS.map((interest) => {
                const on = form.interests.includes(interest.id)
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
              {searchMode === 'trip' ? 'Plan my trip' : 'Show matching destinations'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
