'use client'

import { useState, useEffect } from 'react'
import { Cloud, RefreshCw } from 'lucide-react'
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTripContext } from './TripContextProvider'
import type { WeatherResult } from '@/lib/types'

function monthRange(dateStr: string) {
  const d = new Date(dateStr)
  const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  const label = d.toLocaleDateString('en-US', { month: 'long' })
  return { start, end, label }
}

function WeatherTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey?: string; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const high = payload.find((item) => item.dataKey === 'tempMax')?.value
  const low = payload.find((item) => item.dataKey === 'tempMin')?.value
  const rain = payload.find((item) => item.dataKey === 'precipProbability')?.value

  return (
    <div className="weather-tooltip">
      <div className="mono weather-tooltip-day">{label}</div>
      <div className="weather-tooltip-row">
        <span>High</span>
        <strong>{high}°C</strong>
      </div>
      <div className="weather-tooltip-row">
        <span>Low</span>
        <strong>{low}°C</strong>
      </div>
      <div className="weather-tooltip-row">
        <span>Rain chance</span>
        <strong>{rain}%</strong>
      </div>
    </div>
  )
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

  useEffect(() => {
    void (async () => {
      await load()
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const forecast = weather?.forecast ?? []
  const step = Math.max(1, Math.floor(forecast.length / 7))
  const chartDays = forecast.filter((_, i) => i % step === 0).slice(0, 7)
  const chartData = chartDays.map((day) => ({
    ...day,
    label: new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
    rainBand: day.precipProbability,
  }))

  const rainyDays = forecast.filter((d) => d.precipProbability > 1).length
  const rainyPct = forecast.length ? Math.round((rainyDays / forecast.length) * 100) : 0
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
          <div className="weather-summary">
            <div className="weather-main-stat">
              <div className="serif tabular weather-main-value">
                {weather.avgHigh}°
                <span className="weather-main-sub">/{weather.avgLow}°</span>
              </div>
              <div className="mono mute">Avg high/low · °C</div>
            </div>
            <div className="weather-rain-stat">
              <div className="serif tabular weather-rain-value">{rainyPct}%</div>
              <div className="mono mute">Rainy days</div>
            </div>
          </div>

          <div className="weather-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weatherTempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--ink-4)', fontSize: 10, fontFamily: 'var(--f-mono)' }}
                />
                <YAxis hide domain={['dataMin - 3', 'dataMax + 3']} />
                <Tooltip
                  cursor={{ stroke: 'var(--line)', strokeDasharray: '4 4' }}
                  content={<WeatherTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="tempMin"
                  stroke="transparent"
                  fill="url(#weatherTempFill)"
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tempMax"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--paper)', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--paper)', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="tempMin"
                  stroke="color-mix(in oklch, var(--accent) 42%, var(--paper))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: 'var(--paper)', stroke: 'var(--accent)', strokeWidth: 1.5 }}
                  activeDot={{ r: 4, fill: 'var(--paper)', stroke: 'var(--accent)', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="precipProbability"
                  yAxisId={1}
                  hide
                  stroke="var(--ink-3)"
                />
                <YAxis yAxisId={1} hide domain={[0, 100]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="weather-footnote mono mute">
            Historical · same period, prior year · Open-Meteo
          </div>
        </>
      )}
    </section>
  )
}
