'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, RefreshCw, Building2 } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { HotelsResult } from '@/lib/types'

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card flex flex-col gap-3">
          <div className="shimmer h-5 w-1/2 rounded" />
          <div className="shimmer h-4 w-1/3 rounded" />
          <div className="shimmer h-4 w-1/4 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function HotelCard() {
  const { params } = useTripContext()
  const [result, setResult] = useState<HotelsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/hotels?city=${encodeURIComponent(params.destination)}&checkIn=${params.departureDate}&checkOut=${params.returnDate}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load hotels')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load hotels')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
        🏨 Hotels
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
      {result && !loading && (
        <div className="flex flex-col gap-3">
          {result.hotels.length === 0 && (
            <div className="card text-center py-6">
              <Building2 size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>No hotel data available for this destination.</p>
            </div>
          )}
          {result.hotels.map((hotel, i) => (
            <motion.div
              key={hotel.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{hotel.name}</p>
                  {hotel.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={13} strokeWidth={1.5} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{hotel.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {hotel.minRate ? (
                  <div className="text-right">
                    <span className="font-bold text-lg" style={{ color: 'var(--text)' }}>${hotel.minRate}</span>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/night</p>
                    {hotel.maxRate && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>${hotel.maxRate} total</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Price unavailable</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
