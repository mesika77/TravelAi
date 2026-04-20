import type { WeatherResult } from './types'
import citiesData from '@/public/data/cities.json'

export function findCityCoords(cityName: string): { lat: number; lon: number } | null {
  const normalized = cityName.toLowerCase().trim()
  const match = citiesData.find((c) => c.name.toLowerCase() === normalized)
  return match ? { lat: match.lat, lon: match.lon } : null
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_mean')
  url.searchParams.set('forecast_days', '7')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)

  const data = await res.json()
  const daily = data.daily as {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_mean: number[]
  }

  const forecast = daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    precipProbability: daily.precipitation_probability_mean[i],
  }))

  const avgHigh = Math.round(forecast.reduce((s, d) => s + d.tempMax, 0) / forecast.length)
  const avgLow = Math.round(forecast.reduce((s, d) => s + d.tempMin, 0) / forecast.length)
  const avgRain = Math.round(forecast.reduce((s, d) => s + d.precipProbability, 0) / forecast.length)

  return { forecast, avgHigh, avgLow, avgRain }
}
