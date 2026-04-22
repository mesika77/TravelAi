'use client'

import { useState, useEffect } from 'react'
import { Shield, ExternalLink, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { VisaResult, VisaType } from '@/lib/types'

const VISA_DOT: Record<VisaType, string> = {
  visa_free:       'var(--go)',
  free_movement:   'var(--go)',
  e_visa:          'oklch(62% 0.18 230)',
  visa_on_arrival: 'var(--caution)',
  visa_required:   'var(--stop)',
  unknown:         'var(--ink-4)',
}

const VISA_LABEL: Record<VisaType, string> = {
  visa_free:       'Visa free',
  free_movement:   'Free movement',
  e_visa:          'eVisa required',
  visa_on_arrival: 'Visa on arrival',
  visa_required:   'Visa required',
  unknown:         'Check requirements',
}

const FLAG: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪', FR: '🇫🇷',
  IT: '🇮🇹', ES: '🇪🇸', NL: '🇳🇱', JP: '🇯🇵', IL: '🇮🇱', SG: '🇸🇬',
  BR: '🇧🇷', MX: '🇲🇽', KR: '🇰🇷', IN: '🇮🇳', ZA: '🇿🇦', NZ: '🇳🇿',
  SE: '🇸🇪', NO: '🇳🇴', CH: '🇨🇭', AT: '🇦🇹', BE: '🇧🇪', PL: '🇵🇱',
  PT: '🇵🇹', GR: '🇬🇷', TR: '🇹🇷', AE: '🇦🇪', TH: '🇹🇭', CN: '🇨🇳',
}

const COUNTRY_NAME: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia',
  DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', NL: 'Netherlands',
  JP: 'Japan', IL: 'Israel', SG: 'Singapore', BR: 'Brazil', MX: 'Mexico',
  KR: 'South Korea', IN: 'India', ZA: 'South Africa', NZ: 'New Zealand',
  SE: 'Sweden', NO: 'Norway', CH: 'Switzerland', AT: 'Austria', BE: 'Belgium',
  PL: 'Poland', PT: 'Portugal', GR: 'Greece', TR: 'Turkey', AE: 'UAE',
  TH: 'Thailand', CN: 'China',
}

function visaDescription(visa: VisaResult, passportFlag: string) {
  if (visa.type === 'free_movement') {
    return `${passportFlag} citizens can travel freely to this destination.`
  }
  if (visa.type === 'visa_free') {
    return visa.maxStay
      ? `${passportFlag} passport holders enter visa-free for up to ${visa.maxStay}.`
      : `${passportFlag} passport holders can enter visa-free.`
  }
  if (visa.type === 'e_visa') {
    return visa.maxStay
      ? `${passportFlag} passport holders need an eVisa. Approved stays are listed up to ${visa.maxStay}.`
      : `${passportFlag} passport holders need an eVisa before arrival.`
  }
  if (visa.type === 'visa_on_arrival') {
    return visa.maxStay
      ? `${passportFlag} passport holders can get a visa on arrival for up to ${visa.maxStay}.`
      : `${passportFlag} passport holders can get a visa on arrival.`
  }
  if (visa.type === 'visa_required') {
    return `${passportFlag} passport holders need a visa before travel.`
  }
  return `${passportFlag} passport holders should verify the latest entry rules before booking.`
}

export default function VisaBadge() {
  const { params } = useTripContext()
  const [visa, setVisa] = useState<VisaResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/visa?passport=${params.passport}&destination=${encodeURIComponent(params.destination)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to check visa')
      setVisa(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    void (async () => {
      await load()
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const passportFlag = FLAG[params.passport] ?? '🌐'
  const passportName = COUNTRY_NAME[params.passport] ?? params.passport

  return (
    <section className="sec-sm">
      <div className="sec-sm-head">
        <div className="kicker">Visa</div>
        <Shield size={14} style={{ color: 'var(--ink-4)' }} />
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
          <div className="shimmer" style={{ height: 32, borderRadius: 999 }} />
          <div className="shimmer" style={{ height: 16, width: '70%', borderRadius: 4 }} />
        </div>
      )}

      {error && !loading && (
        <div style={{ marginTop: 10 }}>
          <p className="mute" style={{ fontSize: 13 }}>{error}</p>
          <button onClick={load} className="btn-link" style={{ marginTop: 10 }}>
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {visa && !loading && (
        <div className="visa-body" style={{ marginTop: 10 }}>
          <div className="visa-badge">
            <div className="visa-dot" style={{ background: VISA_DOT[visa.type] }} />
            <span className="mono">{VISA_LABEL[visa.type]}</span>
          </div>

          <div className="serif" style={{ fontSize: 20, marginTop: 14, lineHeight: 1.3 }}>
            {visaDescription(visa, passportFlag)}
          </div>

          <div className="hr" />

          <div className="visa-meta">
            <div>
              <div className="mono mute">Passport</div>
              <div style={{ marginTop: 4 }}>{passportFlag} {passportName}</div>
            </div>
            <div>
              <div className="mono mute">Destination</div>
              <div style={{ marginTop: 4 }}>{params.destination}</div>
            </div>
          </div>

          {visa.sourceUrl && (
            <a
              href={visa.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-link"
              style={{ marginTop: 14, display: 'inline-flex' }}
            >
              Embassy source <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}
    </section>
  )
}
