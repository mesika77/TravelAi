import type { WeatherResult } from './types'
import citiesData from '@/public/data/cities.json'
import { lookupStoredPlaceByCity } from './places'

export async function findCityCoords(cityName: string): Promise<{ lat: number; lon: number } | null> {
  const stored = await lookupStoredPlaceByCity(cityName)
  if (stored?.lat != null && stored?.lon != null) {
    return { lat: stored.lat, lon: stored.lon }
  }

  const normalized = cityName.toLowerCase().trim()
  const match = citiesData.find((c) => c.name.toLowerCase() === normalized)
  return match ? { lat: match.lat, lon: match.lon } : null
}

function shiftYearBack(date: string, years = 1): string {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().split('T')[0]
}

export async function fetchWeather(lat: number, lon: number, startDate: string, endDate: string): Promise<WeatherResult> {
  // Use historical archive for the same period last year — forecasts only go ~16 days out
  const histStart = shiftYearBack(startDate)
  const histEnd = shiftYearBack(endDate)

  const url = new URL('https://archive-api.open-meteo.com/v1/archive')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('start_date', histStart)
  url.searchParams.set('end_date', histEnd)
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)

  const data = await res.json()
  const daily = data.daily as {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
  }

  const forecast = daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    precipProbability: daily.precipitation_sum[i] ?? 0,
  }))

  const avgHigh = Math.round(forecast.reduce((s, d) => s + d.tempMax, 0) / forecast.length)
  const avgLow = Math.round(forecast.reduce((s, d) => s + d.tempMin, 0) / forecast.length)
  // precipProbability repurposed as mm/day; avgRain = % of rainy days (>1mm)
  const rainyDays = forecast.filter((d) => d.precipProbability > 1).length
  const avgRain = Math.round((rainyDays / forecast.length) * 100)

  return { forecast, avgHigh, avgLow, avgRain }
}
