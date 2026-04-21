'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { HotelsResult, FlightOffer } from '@/lib/types'
import dailyCostsData from '@/public/data/daily-costs.json'

const dailyCosts = dailyCostsData as Record<string, { food: number; transport: number; activities: number; total: number }>

export default function TripCostSummary() {
  const { params, nights } = useTripContext()
  const [flightPrice, setFlightPrice] = useState<number | null>(null)
  const [avgNightly, setAvgNightly] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const fetches: Promise<Response>[] = [
        fetch(`/api/flights?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&departureDate=${params.departureDate}&returnDate=${params.returnDate}&oneWay=${params.oneWay ?? false}`),
      ]
      if (!params.oneWay) {
        fetches.push(fetch(`/api/hotels?city=${encodeURIComponent(params.destination)}&checkIn=${params.departureDate}&checkOut=${params.returnDate}`))
      }

      const [flightRes, hotelRes] = await Promise.allSettled(fetches)

      if (flightRes.status === 'fulfilled' && flightRes.value.ok) {
        const fd = await flightRes.value.json()
        const cheapest = (fd.flights as FlightOffer[])?.sort((a, b) => a.price - b.price)[0]
        if (cheapest) setFlightPrice(cheapest.price)
      }
      if (hotelRes && hotelRes.status === 'fulfilled' && hotelRes.value.ok) {
        const hd = await hotelRes.value.json() as HotelsResult
        if (hd.avgNightly) setAvgNightly(hd.avgNightly)
      }
    } catch { setError('Failed to load cost estimate.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const destKey = Object.keys(dailyCosts).find(
    (k) => k.toLowerCase() === params.destination.toLowerCase()
  ) ?? 'Paris'
  const daily = dailyCosts[destKey] ?? { food: 40, transport: 15, activities: 20, total: 75 }

  const totalTravelers = params.adults + params.children
  const hotelTotal = avgNightly !== null ? avgNightly * nights * totalTravelers : null
  const dailyTotal = daily.total * nights * totalTravelers
  const flightTotal = flightPrice !== null ? flightPrice * totalTravelers : null
  const grandTotal = (flightTotal ?? 0) + (hotelTotal ?? 0) + dailyTotal

  const totalBudget = params.budget * totalTravelers
  const overBudgetPct = totalBudget > 0 ? Math.round(((grandTotal - totalBudget) / totalBudget) * 100) : 0
  const isOverBudget = !params.oneWay && overBudgetPct > 20

  if (loading) {
    return (
      <section className="sec-sm">
        <div className="sec-sm-head">
          <div className="kicker">Estimate</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div className="shimmer" style={{ height: 56, width: '60%', borderRadius: 4 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="shimmer" style={{ height: 14, width: '45%', borderRadius: 4 }} />
              <div className="shimmer" style={{ height: 14, width: '25%', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="sec-sm">
        <div className="sec-sm-head"><div className="kicker">Estimate</div></div>
        <p className="mute" style={{ fontSize: 13, marginTop: 10 }}>{error}</p>
        <button onClick={load} className="btn-link" style={{ marginTop: 10 }}>
          <RefreshCw size={11} /> Retry
        </button>
      </section>
    )
  }

  if (params.oneWay) {
    return (
      <section className="sec-sm">
        <div className="sec-sm-head">
          <div className="kicker">Estimate</div>
        </div>
        <div className="serif tabular" style={{ fontSize: 44, lineHeight: 1, marginTop: 14 }}>
          {flightTotal !== null ? `$${flightTotal.toLocaleString()}` : '—'}
        </div>
        <div className="mono mute" style={{ marginTop: 6 }}>One-way flight · {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}</div>
        <div className="hr" />
        <div className="cost-row">
          <div>
            <div style={{ fontSize: 14 }}>Flights</div>
            <div className="mono mute">${flightPrice ?? '—'} × {totalTravelers}</div>
          </div>
          <div className="serif tabular" style={{ fontSize: 18 }}>
            {flightTotal !== null ? `$${flightTotal.toLocaleString()}` : '—'}
          </div>
        </div>
        <p className="mono mute" style={{ marginTop: 10, fontStyle: 'italic' }}>Return date unknown — only flight shown.</p>
      </section>
    )
  }

  return (
    <section className="sec-sm card-ink">
      <div className="sec-sm-head">
        <div className="kicker" style={{ color: 'color-mix(in oklch, var(--paper) 55%, transparent)' }}>Estimate</div>
      </div>
      <div className="serif tabular" style={{ fontSize: 52, lineHeight: 1, marginTop: 16 }}>
        ${grandTotal.toLocaleString()}
      </div>
      <div className="mono" style={{ color: 'color-mix(in oklch, var(--paper) 60%, transparent)', marginTop: 6 }}>
        Total · {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''} · {nights} nights
      </div>

      <div className="hr hr-ink" style={{ marginTop: 22 }} />

      {[
        ['Flights', flightTotal !== null ? `$${flightPrice} × ${totalTravelers}` : '—', flightTotal],
        ['Hotels', avgNightly !== null ? `$${avgNightly} × ${nights} × ${totalTravelers}` : '—', hotelTotal],
        ['Daily · food, transit, play', `$${daily.total} × ${nights} × ${totalTravelers}`, dailyTotal],
      ].map(([label, sub, val]) => (
        <div key={String(label)} className="cost-row">
          <div>
            <div style={{ fontSize: 14 }}>{label}</div>
            <div className="mono" style={{ color: 'color-mix(in oklch, var(--paper) 50%, transparent)', fontSize: 11 }}>{sub}</div>
          </div>
          <div className="serif tabular" style={{ fontSize: 18 }}>
            {val !== null ? `$${Number(val).toLocaleString()}` : '—'}
          </div>
        </div>
      ))}

      {isOverBudget && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 14,
          padding: '10px 12px', borderRadius: 'var(--r-sm)',
          background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
        }}>
          <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12, lineHeight: 1.5 }}>
            {overBudgetPct}% over your ${params.budget.toLocaleString()} budget per person. Consider fewer nights or cheaper hotels.
          </span>
        </div>
      )}
    </section>
  )
}
