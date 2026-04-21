'use client'

import { useState, useEffect } from 'react'
import { Coins, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { CurrencyResult } from '@/lib/types'

const QUICK_AMOUNTS = [50, 100, 200, 500]

export default function CurrencyWidget() {
  const { params } = useTripContext()
  const [result, setResult] = useState<CurrencyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingKey, setMissingKey] = useState(false)

  const load = async () => {
    setLoading(true); setError(null); setMissingKey(false)
    try {
      const res = await fetch(`/api/currency?city=${encodeURIComponent(params.destination)}&budget=${params.budget}`)
      const data = await res.json()
      if (!res.ok) { if (data.key) setMissingKey(true); throw new Error(data.error ?? 'Failed') }
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="sec-sm">
      <div className="sec-sm-head">
        <div className="kicker">Currency</div>
        <Coins size={14} style={{ color: 'var(--ink-4)' }} />
      </div>

      {loading && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="shimmer" style={{ height: 36, width: '55%', borderRadius: 4 }} />
          <div className="shimmer" style={{ height: 14, width: '40%', borderRadius: 4 }} />
          <div className="hr" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[0, 1, 2, 3].map((i) => <div key={i} className="shimmer" style={{ height: 28, borderRadius: 4 }} />)}
          </div>
        </div>
      )}

      {error && !loading && (
        <div style={{ marginTop: 10 }}>
          {missingKey ? (
            <>
              <p style={{ fontWeight: 500, fontSize: 14 }}>ExchangeRate API key missing</p>
              <p className="mono mute" style={{ marginTop: 6 }}>Add EXCHANGE_RATE_API_KEY to .env.local</p>
            </>
          ) : (
            <>
              <p className="mute" style={{ fontSize: 13 }}>{error}</p>
              <button onClick={load} className="btn-link" style={{ marginTop: 10 }}>
                <RefreshCw size={11} /> Retry
              </button>
            </>
          )}
        </div>
      )}

      {result && !loading && (
        <>
          <div className="curr-main">
            <div>
              <div className="mono mute">1 USD</div>
              <div className="serif tabular" style={{ fontSize: 34 }}>
                {result.targetSymbol}{result.rate.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="mono mute">Your budget</div>
              <div className="serif tabular" style={{ fontSize: 22 }}>
                {result.targetSymbol}{result.budgetInLocal.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="hr" />

          <div className="curr-ref">
            {QUICK_AMOUNTS.map((amount) => (
              <div key={amount} className="curr-ref-row">
                <span className="mono tabular">${amount}</span>
                <span className="serif tabular">
                  {result.targetSymbol}{Math.round(amount * result.rate).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
