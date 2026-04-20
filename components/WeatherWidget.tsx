'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Thermometer, Droplets, RefreshCw } from 'lucide-react'
import { useTripContext } from './TripContextProvider'
import type { WeatherResult } from '@/lib/types'

function Skeleton() {
  return (
    <div className="card flex flex-col gap-3">
      <div className="shimmer h-5 w-1/3 rounded" />
      <div className="shimmer h-32 w-full rounded" />
      <div className="flex gap-3">
        <div className="shimmer h-4 w-1/4 rounded" />
        <div className="shimmer h-4 w-1/4 rounded" />
      </div>
    </div>
  )
}

export default function WeatherWidget() {
  const { params } = useTripContext()
  const [weather, setWeather] = useState<WeatherResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(params.destination)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load weather')
      setWeather(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = weather?.forecast.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    high: d.tempMax,
    low: d.tempMin,
    rain: d.precipProbability,
  }))

  return (
    <section>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
        🌤 Weather Forecast
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
      {weather && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col gap-4"
        >
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Thermometer size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              Avg {weather.avgLow}°C – {weather.avgHigh}°C
            </span>
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Droplets size={15} strokeWidth={1.5} style={{ color: 'var(--info)' }} />
              {weather.avgRain}% rain
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e94560" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: 'var(--text)',
                }}
                formatter={(value, name) => [
                  name === 'rain' ? `${value}%` : `${value}°C`,
                  name === 'high' ? 'High' : name === 'low' ? 'Low' : 'Rain',
                ] as [string, string]}
              />
              <Area type="monotone" dataKey="high" stroke="#e94560" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="low" stroke="#3b82f6" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </section>
  )
}
