'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, RefreshCw, AlertTriangle } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { HotelsResult, FlightOffer } from '@/lib/types'
import dailyCostsData from '@/public/data/daily-costs.json'

function Skeleton() {
  return (
    <div className="card flex flex-col gap-3">
      <div className="shimmer h-5 w-1/2 rounded" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="shimmer h-4 w-1/3 rounded" />
          <div className="shimmer h-4 w-1/4 rounded" />
        </div>
      ))}
      <div className="shimmer h-8 w-full rounded" />
    </div>
  )
}

const dailyCosts = dailyCostsData as Record<string, { food: number; transport: number; activities: number; total: number }>

export default function TripCostSummary() {
  const { params, nights } = useTripContext()
  const [flightPrice, setFlightPrice] = useState<number | null>(null)
  const [avgNightly, setAvgNightly] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
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
    } catch {
      setError('Failed to load cost estimate.')
    } finally {
      setLoading(false)
    }
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

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
        💰 Cost Estimate
      </h2>
      {loading && <Skeleton />}
      {error && !loading && (
        <div className="card flex flex-col gap-3">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button onClick={load} className="btn-secondary flex items-center gap-2 w-fit">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--text)' }}>
              {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}{!params.oneWay && ` · ${nights} night${nights > 1 ? 's' : ''}`}
            </span>
          </div>

          {params.oneWay ? (
            <>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>✈️ One-way flight</span>
                  <span style={{ color: 'var(--text)' }}>
                    {flightTotal !== null ? `$${flightTotal.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </div>
              <div
                className="flex justify-between font-bold text-base mt-1 pt-3"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <span>Flight Total</span>
                <span style={{ color: 'var(--accent)' }}>
                  {flightTotal !== null ? `$${flightTotal.toLocaleString()}` : 'N/A'}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Return date unknown — only flight cost shown.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>✈️ Flights</span>
                  <span style={{ color: 'var(--text)' }}>
                    {flightTotal !== null ? `$${flightTotal.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>🏨 Hotels ({nights} nights)</span>
                  <span style={{ color: 'var(--text)' }}>
                    {hotelTotal !== null ? `$${hotelTotal.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>🍽 Food (~${daily.food}/day)</span>
                  <span style={{ color: 'var(--text)' }}>${(daily.food * nights * totalTravelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>🚌 Transport (~${daily.transport}/day)</span>
                  <span style={{ color: 'var(--text)' }}>${(daily.transport * nights * totalTravelers).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>🎭 Activities (~${daily.activities}/day)</span>
                  <span style={{ color: 'var(--text)' }}>${(daily.activities * nights * totalTravelers).toLocaleString()}</span>
                </div>
              </div>
              <div
                className="flex justify-between font-bold text-base mt-1 pt-3"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <span>Estimated Total</span>
                <span style={{ color: 'var(--accent)' }}>${grandTotal.toLocaleString()}</span>
              </div>
              {isOverBudget && (
                <div
                  className="flex items-start gap-2 rounded-xl p-3 text-xs"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#b45309' }}
                >
                  <AlertTriangle size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                  <span>
                    This trip is <strong>{overBudgetPct}% over your ${params.budget.toLocaleString()} budget</strong> per person. Consider fewer nights, cheaper hotels, or a different destination.
                  </span>
                </div>
              )}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Budget per person: ${params.budget.toLocaleString()} · Estimate for planning purposes only.
              </p>
            </>
          )}
        </motion.div>
      )}
    </section>
  )
}
