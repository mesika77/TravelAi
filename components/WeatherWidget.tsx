'use client'

import { useState, useEffect } from 'react'
import { Cloud, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { WeatherResult } from '@/lib/types'

function monthRange(dateStr: string) {
  const d = new Date(dateStr)
  const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  const label = d.toLocaleDateString('en-US', { month: 'long' })
  return { start, end, label }
}

export default function WeatherWidget() {
  const { params } = useTripContext()
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const month = params.oneWay ? monthRange(params.departureDate) : null

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const start = month ? month.start : params.departureDate
      const end = month ? month.end : params.returnDate
      const res = await fetch(`/api/weather?city=${encodeURIComponent(params.destination)}&startDate=${start}&endDate=${end}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setWeather(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const forecast = weather?.forecast ?? []
  const step = Math.max(1, Math.floor(forecast.length / 7))
  const chartDays = forecast.filter((_, i) => i % step === 0).slice(0, 7)

  const rainyDays = forecast.filter((d) => d.precipProbability > 1).length
  const rainyPct = forecast.length ? Math.round((rainyDays / forecast.length) * 100) : 0

  const maxTemp = 35
  const title = month ? `${month.label} Weather` : 'Weather Forecast'

  return (
    <section className="sec-sm">
      <div className="sec-sm-head">
        <div className="kicker">{title}</div>
        <Cloud size={14} style={{ color: 'var(--ink-4)' }} />
      </div>

      {loading && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="shimmer" style={{ height: 44, width: '55%', borderRadius: 4 }} />
          <div className="shimmer" style={{ height: 100, borderRadius: 4, marginTop: 8 }} />
        </div>
      )}

      {error && !loading && (
        <div style={{ marginTop: 10 }}>
          <p className="mute" style={{ fontSize: 13 }}>{error}</p>
          <button onClick={load} className="btn-link" style={{ marginTop: 10 }}>
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {weather && !loading && (
        <>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', marginTop: 10 }}>
            <div>
              <div className="serif tabular" style={{ fontSize: 40, lineHeight: 1 }}>
                {weather.avgHigh}°
                <span style={{ fontSize: 20, color: 'var(--ink-3)' }}>/{weather.avgLow}°</span>
              </div>
              <div className="mono mute">Avg high/low · °C</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div className="serif tabular" style={{ fontSize: 26 }}>{rainyPct}%</div>
              <div className="mono mute">Rainy days</div>
            </div>
          </div>

          <div className="weather-chart">
            {chartDays.map((w, i) => {
              const highPct = Math.min(100, (w.tempMax / maxTemp) * 100)
              const lowPct = Math.min(100, (w.tempMin / maxTemp) * 100)
              const label = new Date(w.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
              return (
                <div key={i} className="wx-col">
                  <div className="wx-bar-wrap">
                    <div className="wx-bar-high" style={{ height: `${highPct}%` }} />
                    <div className="wx-bar-low" style={{ height: `${lowPct}%` }} />
                    {w.precipProbability > 30 && <div className="wx-rain" title={`${Math.round(w.precipProbability)}% rain`} />}
                  </div>
                  <div className="mono mute" style={{ fontSize: 10, marginTop: 6 }}>{label}</div>
                </div>
              )
            })}
          </div>

          <div className="mono mute" style={{ fontSize: 10, fontStyle: 'italic' }}>
            Historical · same period, prior year · Open-Meteo
          </div>
        </>
      )}
    </section>
  )
}
