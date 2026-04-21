'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plane, Clock, Leaf, ExternalLink, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { FlightOffer } from '@/lib/types'

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card flex flex-col gap-3">
          <div className="shimmer h-5 w-1/3 rounded" />
          <div className="shimmer h-4 w-2/3 rounded" />
          <div className="shimmer h-4 w-1/2 rounded" />
        </div>
      ))}
    </div>
  )
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

export default function FlightCard() {
  const { params } = useTripContext()
  const [flights, setFlights] = useState<FlightOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingKey, setMissingKey] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/flights?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&departureDate=${params.departureDate}&returnDate=${params.returnDate}&oneWay=${params.oneWay ?? false}`
      )
      const data = await res.json()
      if (!res.ok) {
        if (data.key) setMissingKey(true)
        throw new Error(data.error ?? 'Failed to load flights')
      }
      setFlights(data.flights)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load flights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
        ✈️ Flights {params.oneWay && <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>· One Way</span>}
      </h2>
      {loading && <Skeleton />}
      {error && !loading && (
        <div className="card flex flex-col gap-3">
          {missingKey ? (
            <>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>SerpApi key not configured</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Add <code className="px-1 rounded text-xs" style={{ background: 'var(--surface-2)' }}>SERPAPI_KEY</code> to your{' '}
                <code>.env.local</code> file. Get a key at{' '}
                <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="underline">serpapi.com</a>.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
              <button onClick={load} className="btn-secondary flex items-center gap-2 w-fit">
                <RefreshCw size={14} /> Retry
              </button>
            </>
          )}
        </div>
      )}
      {!loading && !error && flights.length === 0 && (
        <div className="card text-center py-8">
          <p style={{ color: 'var(--text-muted)' }}>No flights found for this route.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your dates or cities.</p>
        </div>
      )}
      {!loading && flights.length > 0 && (
        <div className="flex flex-col gap-3">
          {flights.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
              className="card cursor-default"
              style={{ transition: 'box-shadow 0.2s' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Plane size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                    <span className="font-semibold" style={{ color: 'var(--text)' }}>{f.airline}</span>
                    {f.stops === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>
                        Nonstop
                      </span>
                    )}
                    {f.stops > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        {f.stops} stop{f.stops > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Clock size={13} strokeWidth={1.5} />
                      {formatDuration(f.totalDuration)}
                    </span>
                    {f.legs[0] && (
                      <span>
                        {f.legs[0].departureTime?.slice(11, 16) || '--'} → {f.legs[f.legs.length - 1]?.arrivalTime?.slice(11, 16) || '--'}
                      </span>
                    )}
                    {f.carbonEmissions && (
                      <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
                        <Leaf size={13} strokeWidth={1.5} />
                        {Math.round(f.carbonEmissions / 1000)}kg CO₂
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    ${f.price.toLocaleString()}
                  </span>
                  {f.bookingToken ? (
                    <a
                      href={`https://www.google.com/travel/flights?tfs=${f.bookingToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
                    >
                      Book <ExternalLink size={13} strokeWidth={1.5} />
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/travel/flights`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
                    >
                      Search <ExternalLink size={13} strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
