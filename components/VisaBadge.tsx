'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ExternalLink, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { VisaResult, VisaType } from '@/lib/types'

const VISA_CONFIG: Record<VisaType, { label: string; color: string; bg: string }> = {
  visa_free:      { label: 'Visa Free',        color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  e_visa:         { label: 'eVisa',             color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  visa_on_arrival:{ label: 'Visa on Arrival',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  visa_required:  { label: 'Visa Required',     color: '#f59e0b', bg: 'rgba(249,115,22,0.1)' },
  free_movement:  { label: 'Free Movement',     color: '#14b8a6', bg: 'rgba(20,184,166,0.1)' },
  unknown:        { label: 'Unknown',           color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
}

function Skeleton() {
  return (
    <div className="card flex flex-col gap-3">
      <div className="shimmer h-5 w-1/2 rounded" />
      <div className="shimmer h-10 w-full rounded-full" />
      <div className="shimmer h-4 w-2/3 rounded" />
    </div>
  )
}

export default function VisaBadge() {
  const { params } = useTripContext()
  const [visa, setVisa] = useState<VisaResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/visa?passport=${params.passport}&destination=${encodeURIComponent(params.destination)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to check visa')
      setVisa(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check visa')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cfg = visa ? VISA_CONFIG[visa.type] : null

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
        🛂 Visa Requirements
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
      {visa && !loading && cfg && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Shield size={16} strokeWidth={1.5} />
            <span>{params.passport} passport → {params.destination}</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center justify-center gap-3 py-3 px-6 rounded-full font-bold text-lg"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </motion.div>
          {visa.maxStay && (
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Max stay: <strong style={{ color: 'var(--text)' }}>{visa.maxStay}</strong>
            </p>
          )}
          {visa.sourceUrl && (
            <a
              href={visa.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm justify-center"
              style={{ color: 'var(--info)' }}
            >
              Official source <ExternalLink size={13} strokeWidth={1.5} />
            </a>
          )}
        </motion.div>
      )}
    </section>
  )
}
