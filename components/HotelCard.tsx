'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { HotelsResult } from '@/lib/types'
import DestinationPhoto from './DestinationPhoto'

function SkeletonCard() {
  return (
    <div className="hotel-card">
      <div className="hotel-photo shimmer" />
      <div className="hotel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="shimmer" style={{ height: 12, width: '60%', borderRadius: 4 }} />
        <div className="shimmer" style={{ height: 18, width: '80%', borderRadius: 4 }} />
        <div className="shimmer" style={{ height: 12, width: '40%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

export default function HotelCard() {
  const { params, nights } = useTripContext()
  const [result, setResult] = useState<HotelsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(
        `/api/hotels?city=${encodeURIComponent(params.destination)}&checkIn=${params.departureDate}&checkOut=${params.returnDate}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load hotels')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load hotels') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const nightLabel = nights > 0 ? `${nights} nights` : 'Stay'
  const travelersLabel = `${params.adults + params.children} traveler${params.adults + params.children > 1 ? 's' : ''}`

  return (
    <section className="sec">
      <div className="section-head">
        <div>
          <div className="kicker">02 · Where to stay</div>
          <h2 className="section-title serif">Hotels</h2>
        </div>
        <div className="mono mute">{nightLabel} · {travelersLabel}</div>
      </div>

      {loading && (
        <div className="hotel-grid">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {error && !loading && (
        <div className="sec-sm" style={{ textAlign: 'center', padding: '32px 22px' }}>
          <p className="mute" style={{ fontSize: 14 }}>{error}</p>
          <button onClick={load} className="btn-link" style={{ marginTop: 12 }}>
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {result && !loading && (
        <>
          {result.isEstimate && (
            <p className="mono mute" style={{ marginBottom: 16, fontSize: 11 }}>
              Prices estimated from same season — exact rates unavailable this far in advance.
            </p>
          )}
          {result.hotels.length === 0 ? (
            <div className="sec-sm" style={{ textAlign: 'center', padding: '40px 22px' }}>
              <p className="mute">No hotel data for this destination.</p>
            </div>
          ) : (
            <div className="hotel-grid">
              {result.hotels.map((hotel) => {
                const stars = Math.round(hotel.rating ?? 0)
                return (
                  <div key={hotel.key} className="hotel-card">
                    <DestinationPhoto
                      city={params.destination}
                      query={`hotel ${hotel.name}`}
                      className="hotel-photo"
                      style={{ aspectRatio: '4/3', borderRadius: 0 }}
                    />
                    <div className="hotel-body">
                      <div className="mono mute">{params.destination}</div>
                      <div className="serif" style={{ fontSize: 20, marginTop: 4 }}>{hotel.name}</div>
                      {stars > 0 && (
                        <div className="stars">
                          {'★'.repeat(stars)}
                          <span style={{ opacity: 0.25 }}>{'★'.repeat(Math.max(0, 5 - stars))}</span>
                        </div>
                      )}
                      <div className="hr" />
                      <div className="hotel-price">
                        <div>
                          <div className="mono mute">Per night</div>
                          {hotel.minRate ? (
                            <div className="serif tabular" style={{ fontSize: 20 }}>
                              ${hotel.minRate}{hotel.maxRate ? `–$${hotel.maxRate}` : ''}
                            </div>
                          ) : (
                            <div className="mono mute">Price unavailable</div>
                          )}
                        </div>
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(hotel.name + ' ' + params.destination)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link"
                        >
                          View <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}
