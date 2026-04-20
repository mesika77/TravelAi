'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, DollarSign } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { CurrencyResult } from '@/lib/types'

function Skeleton() {
  return (
    <div className="card flex flex-col gap-3">
      <div className="shimmer h-5 w-1/2 rounded" />
      <div className="shimmer h-10 w-2/3 rounded" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => <div key={i} className="shimmer h-8 rounded" />)}
      </div>
    </div>
  )
}

const QUICK_AMOUNTS = [50, 100, 200, 500]

export default function CurrencyWidget() {
  const { params } = useTripContext()
  const [result, setResult] = useState<CurrencyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingKey, setMissingKey] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    setMissingKey(false)
    try {
      const res = await fetch(
        `/api/currency?city=${encodeURIComponent(params.destination)}&budget=${params.budget}`
      )
      const data = await res.json()
      if (!res.ok) {
        if (data.key) setMissingKey(true)
        throw new Error(data.error ?? 'Failed to load currency')
      }
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load currency')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
        💱 Currency
      </h2>
      {loading && <Skeleton />}
      {error && !loading && (
        <div className="card flex flex-col gap-3">
          {missingKey ? (
            <>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>ExchangeRate API key not configured</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Add <code className="px-1 rounded text-xs" style={{ background: 'var(--surface-2)' }}>EXCHANGE_RATE_API_KEY</code> to{' '}
                <code>.env.local</code>. Get a free key at{' '}
                <a href="https://exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="underline">
                  exchangerate-api.com
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
      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col gap-4"
        >
          <div className="flex items-center gap-2">
            <DollarSign size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--text)' }}>
              1 USD = {result.rate.toFixed(2)} {result.targetCurrency}
            </span>
          </div>

          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Your budget per person</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
              {result.targetSymbol}{result.budgetInLocal.toLocaleString()}
              <span className="text-base font-normal ml-2" style={{ color: 'var(--text-muted)' }}>
                {result.targetCurrency}
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Quick reference</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <div
                  key={amount}
                  className="flex justify-between items-center p-2 rounded-lg text-sm"
                  style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>${amount}</span>
                  <span className="font-medium">
                    {result.targetSymbol}{Math.round(amount * result.rate).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}
