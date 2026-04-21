'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, ExternalLink, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { Activity } from '@/lib/types'

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card flex flex-col gap-2">
          <div className="shimmer h-5 w-2/3 rounded" />
          <div className="shimmer h-4 w-1/2 rounded" />
          <div className="shimmer h-4 w-3/4 rounded" />
        </div>
      ))}
    </div>
  )
}

const PREVIEW_COUNT = 3

export default function ActivityCard() {
  const { params } = useTripContext()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingKey, setMissingKey] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    setMissingKey(false)
    try {
      const res = await fetch(
        `/api/activities?city=${encodeURIComponent(params.destination)}&interests=${params.interests.join(',')}`
      )
      const data = await res.json()
      if (!res.ok) {
        if (data.key) setMissingKey(true)
        throw new Error(data.error ?? 'Failed to load activities')
      }
      setActivities(data.activities)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.interest]) acc[a.interest] = []
    acc[a.interest].push(a)
    return acc
  }, {})

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
        🗺 Activities
      </h2>
      {loading && <Skeleton />}
      {error && !loading && (
        <div className="card flex flex-col gap-3">
          {missingKey ? (
            <>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>Foursquare key not configured</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Add <code className="px-1 rounded text-xs" style={{ background: 'var(--surface-2)' }}>FOURSQUARE_API_KEY</code> to{' '}
                <code>.env.local</code>. Get a key at{' '}
                <a href="https://foursquare.com/developers" target="_blank" rel="noopener noreferrer" className="underline">
                  foursquare.com/developers
                </a>.
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
      {!loading && !error && activities.length === 0 && (
        <div className="card text-center py-6">
          <p style={{ color: 'var(--text-muted)' }}>No activities found.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try selecting different interests.</p>
        </div>
      )}
      {!loading && Object.entries(grouped).map(([interest, items]) => {
        const isExpanded = expanded[interest]
        const visible = isExpanded ? items : items.slice(0, PREVIEW_COUNT)
        const hasMore = items.length > PREVIEW_COUNT
        return (
          <div key={interest} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold capitalize" style={{ color: 'var(--text-muted)' }}>
                {interest}
              </h3>
              {hasMore && (
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [interest]: !prev[interest] }))}
                  className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--accent)' }}
                >
                  {isExpanded ? 'Show less' : `Show all ${items.length}`}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {visible.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                  className="card flex flex-col gap-2"
                >
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{a.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.category}</p>
                  {a.address && (
                    <div className="flex items-start gap-1">
                      <MapPin size={12} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.address}</p>
                    </div>
                  )}
                  {a.distance && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {a.distance < 1000 ? `${a.distance}m away` : `${(a.distance / 1000).toFixed(1)}km away`}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(a.name + ' ' + params.destination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs mt-auto"
                    style={{ color: 'var(--info)' }}
                  >
                    View on Maps <ExternalLink size={11} strokeWidth={1.5} />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
