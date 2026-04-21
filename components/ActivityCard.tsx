'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { Activity } from '@/lib/types'

const PREVIEW_COUNT = 3

function SkeletonItem() {
  return (
    <div className="act-item" style={{ opacity: 0.5 }}>
      <div className="act-index shimmer" style={{ width: 28, height: 14, borderRadius: 4 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="shimmer" style={{ height: 14, width: '60%', borderRadius: 4 }} />
        <div className="shimmer" style={{ height: 10, width: '40%', borderRadius: 4 }} />
      </div>
    </div>
  )
}

export default function ActivityCard() {
  const { params } = useTripContext()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingKey, setMissingKey] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const load = async () => {
    setLoading(true); setError(null); setMissingKey(false)
    try {
      const res = await fetch(
        `/api/activities?city=${encodeURIComponent(params.destination)}&interests=${params.interests.join(',')}`
      )
      const data = await res.json()
      if (!res.ok) { if (data.key) setMissingKey(true); throw new Error(data.error ?? 'Failed') }
      setActivities(data.activities)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load activities') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.interest]) acc[a.interest] = []
    acc[a.interest].push(a)
    return acc
  }, {})

  return (
    <section className="sec">
      <div className="section-head">
        <div>
          <div className="kicker">03 · Things to do</div>
          <h2 className="section-title serif">Activities</h2>
        </div>
        <div className="mono mute">Matched to your interests</div>
      </div>

      {loading && (
        <div>
          {[0, 1, 2].map((cat) => (
            <div key={cat} className="act-cat">
              <div className="act-cat-head">
                <div className="shimmer" style={{ height: 18, width: 100, borderRadius: 4 }} />
              </div>
              <div className="act-list">
                <SkeletonItem /><SkeletonItem /><SkeletonItem />
              </div>
            </div>
          ))}
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

      {!loading && !error && activities.length === 0 && (
        <div className="sec-sm" style={{ textAlign: 'center', padding: '40px 22px' }}>
          <p className="mute">No activities found.</p>
          <p className="mono mute" style={{ marginTop: 6 }}>Try selecting different interests.</p>
        </div>
      )}

      {!loading && !error && Object.entries(grouped).map(([interest, items]) => {
        const isOpen = expanded[interest]
        const shown = isOpen ? items : items.slice(0, PREVIEW_COUNT)
        const hasMore = items.length > PREVIEW_COUNT
        const label = interest.charAt(0).toUpperCase() + interest.slice(1)

        return (
          <div key={interest} className="act-cat">
            <div className="act-cat-head">
              <h3 className="serif" style={{ fontSize: 22 }}>{label}</h3>
              {hasMore && (
                <button
                  className="btn-link"
                  onClick={() => setExpanded((e) => ({ ...e, [interest]: !e[interest] }))}
                >
                  {isOpen ? 'Show less' : `Show all ${items.length}`}
                </button>
              )}
            </div>
            <div className="act-list">
              {shown.map((a, i) => (
                <div key={a.id} className="act-item">
                  <div className="act-index mono">{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{a.name}</div>
                    <div className="mono mute">{a.category}</div>
                  </div>
                  <div className="act-rating">
                    {a.rating && (
                      <span className="serif tabular" style={{ fontSize: 17 }}>{a.rating}</span>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(a.name + ' ' + params.destination)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                      style={{ fontSize: 9 }}
                    >
                      Maps <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {!loading && activities.length > 0 && (
        <p className="mono mute" style={{ fontStyle: 'italic', marginTop: 12, fontSize: 11 }}>
          Results may skew toward popular categories.
        </p>
      )}
    </section>
  )
}
