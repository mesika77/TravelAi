'use client'

import { useState, useEffect } from 'react'
import { Plane, Leaf, ExternalLink, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { FlightOffer } from '@/lib/types'

function SkeletonRow() {
  return (
    <div className="flight-row" style={{ opacity: 0.5 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="shimmer" style={{ height: 20, borderRadius: 4 }} />
      ))}
    </div>
  )
}

function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function FlightCard() {
  const { params } = useTripContext()
  const [flights, setFlights] = useState<FlightOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingKey, setMissingKey] = useState(false)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(
        `/api/flights?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&departureDate=${params.departureDate}&returnDate=${params.returnDate}&oneWay=${params.oneWay ?? false}`
      )
      const data = await res.json()
      if (!res.ok) { if (data.key) setMissingKey(true); throw new Error(data.error ?? 'Failed') }
      setFlights(data.flights)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load flights') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const dep = new Date(params.departureDate)
  const ret = params.oneWay ? null : new Date(params.returnDate)
  const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <section className="sec">
      <div className="section-head">
        <div>
          <div className="kicker">01 · {params.oneWay ? 'One Way' : 'Outbound'}</div>
          <h2 className="section-title serif">Flights</h2>
        </div>
        <div className="mono mute">{loading ? 'Loading…' : error ? '' : `${flights.length} results · sorted by price`}</div>
      </div>

      {/* Route summary */}
      <div className="flight-route">
        <div className="route-point">
          <div className="serif tabular" style={{ fontSize: 28 }}>{params.origin.slice(0, 3).toUpperCase()}</div>
          <div className="mono mute">{params.origin}</div>
        </div>
        <div className="route-line">
          <div className="route-dash" />
          <Plane size={15} style={{ color: 'var(--accent)' }} />
          <div className="route-dash" />
        </div>
        <div className="route-point">
          <div className="serif tabular" style={{ fontSize: 28 }}>{params.destination.slice(0, 3).toUpperCase()}</div>
          <div className="mono mute">{params.destination}</div>
        </div>
        <div className="route-dates">
          <div className="mono mute">Out</div>
          <div className="serif tabular">{fmtDate(dep)}</div>
        </div>
        {ret && (
          <div className="route-dates">
            <div className="mono mute">Back</div>
            <div className="serif tabular">{fmtDate(ret)}</div>
          </div>
        )}
      </div>

      <p className="mono mute" style={{ margin: '10px 0 18px', fontSize: 11, lineHeight: 1.6 }}>
        Flight prices are estimates from hourly checks and may change before booking. Always confirm the final fare with the airline or booking site.
      </p>

      {/* States */}
      {loading && (
        <div className="flight-list">
          <SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      )}

      {error && !loading && (
        <div className="sec-sm" style={{ textAlign: 'center', padding: '32px 22px' }}>
          {missingKey ? (
            <>
              <p style={{ fontWeight: 500 }}>SerpAPI key not configured</p>
              <p className="mono mute" style={{ marginTop: 8 }}>Add SERPAPI_KEY to .env.local</p>
            </>
          ) : (
            <>
              <p className="mute" style={{ fontSize: 14 }}>{error}</p>
              <button onClick={load} className="btn-link" style={{ marginTop: 12 }}>
                <RefreshCw size={12} /> Retry
              </button>
            </>
          )}
        </div>
      )}

      {!loading && !error && flights.length === 0 && (
        <div className="sec-sm" style={{ textAlign: 'center', padding: '40px 22px' }}>
          <p className="mute">No flights found for this route.</p>
          <p className="mono mute" style={{ marginTop: 6 }}>Try adjusting dates or cities.</p>
        </div>
      )}

      {!loading && flights.length > 0 && (
        <div className="flight-list">
          {flights.map((f, i) => {
            const dep = f.legs[0]?.departureTime?.slice(11, 16) ?? '--'
            const arr = f.legs[f.legs.length - 1]?.arrivalTime?.slice(11, 16) ?? '--'
            const stopLabel = f.stops === 0 ? 'Nonstop' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`
            const bookUrl = f.bookingToken
              ? `https://www.google.com/travel/flights?tfs=${f.bookingToken}`
              : 'https://www.google.com/travel/flights'

            return (
              <div key={f.id} className={'flight-row' + (i === 0 ? ' flight-row-best' : '')}>
                {i === 0 && <div className="best-ribbon">Best value</div>}

                <div className="flight-airline">
                  <div className="airline-mark">{f.airline.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{f.airline}</div>
                    <div className="mono mute">{f.legs[0]?.flightNumber ?? ''}</div>
                  </div>
                </div>

                <div className="flight-times">
                  <div className="serif tabular" style={{ fontSize: 20 }}>{dep}</div>
                  <div className="mono mute">{params.origin.slice(0, 3).toUpperCase()}</div>
                </div>

                <div className="flight-dur">
                  <div className="mono mute" style={{ fontSize: 10 }}>{formatDuration(f.totalDuration)}</div>
                  <div className="dur-line" />
                  <div className="mono mute" style={{ fontSize: 10 }}>{stopLabel}</div>
                </div>

                <div className="flight-times">
                  <div className="serif tabular" style={{ fontSize: 20 }}>{arr}</div>
                  <div className="mono mute">{params.destination.slice(0, 3).toUpperCase()}</div>
                </div>

                {f.carbonEmissions ? (
                  <div className="flight-co2">
                    <Leaf size={12} />
                    <span className="mono tabular">{Math.round(f.carbonEmissions / 1000)}kg</span>
                  </div>
                ) : <div />}

                <div className="flight-price">
                  <div className="serif tabular" style={{ fontSize: 24 }}>${f.price.toLocaleString()}</div>
                  <a href={bookUrl} target="_blank" rel="noopener noreferrer" className="btn-link">
                    Book <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
