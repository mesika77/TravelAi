'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DestinationPhoto from './DestinationPhoto'

interface Destination {
  city: string
  country: string
  temp: string
  desc: string
}

// Curated seasonal destinations per hemisphere + month bucket
const NORTH_SPRING: Destination[] = [
  { city: 'Kyoto', country: 'Japan', temp: '18°', desc: 'Cherry blossoms in full bloom' },
  { city: 'Lisbon', country: 'Portugal', temp: '21°', desc: 'Warm sun before summer crowds' },
  { city: 'Amsterdam', country: 'Netherlands', temp: '14°', desc: 'Tulip season peaks in April' },
  { city: 'Athens', country: 'Greece', temp: '20°', desc: 'Ancient sites, mild weather' },
  { city: 'Barcelona', country: 'Spain', temp: '20°', desc: 'Pre-summer, still affordable' },
  { city: 'Marrakech', country: 'Morocco', temp: '25°', desc: 'Before the summer heat' },
  { city: 'Reykjavik', country: 'Iceland', temp: '8°', desc: 'Midnight sun season begins' },
  { city: 'Istanbul', country: 'Turkey', temp: '17°', desc: 'Shoulder season, great value' },
]

const NORTH_SUMMER: Destination[] = [
  { city: 'Santorini', country: 'Greece', temp: '27°', desc: 'Peak Aegean summer' },
  { city: 'Dubrovnik', country: 'Croatia', temp: '28°', desc: 'Adriatic coast at its best' },
  { city: 'Reykjavik', country: 'Iceland', temp: '13°', desc: '24-hour daylight' },
  { city: 'Amalfi', country: 'Italy', temp: '28°', desc: 'Clifftop villages, azure sea' },
  { city: 'Copenhagen', country: 'Denmark', temp: '20°', desc: 'Scandinavian summer bliss' },
  { city: 'Lisbon', country: 'Portugal', temp: '27°', desc: 'Rooftop bars and beaches' },
  { city: 'Tokyo', country: 'Japan', temp: '30°', desc: 'Festivals and summer energy' },
  { city: 'Montreal', country: 'Canada', temp: '25°', desc: 'Jazz fest and outdoor terraces' },
]

const NORTH_AUTUMN: Destination[] = [
  { city: 'New York', country: 'United States', temp: '16°', desc: 'Fall foliage and fashion week' },
  { city: 'Tokyo', country: 'Japan', temp: '19°', desc: 'Autumn leaves, cooler temps' },
  { city: 'Prague', country: 'Czech Republic', temp: '13°', desc: 'Golden hour in the Old Town' },
  { city: 'Tuscany', country: 'Italy', temp: '18°', desc: 'Harvest season, fewer tourists' },
  { city: 'Istanbul', country: 'Turkey', temp: '18°', desc: 'Perfect sightseeing weather' },
  { city: 'Lisbon', country: 'Portugal', temp: '21°', desc: 'Warm autumn, empty beaches' },
  { city: 'Kyoto', country: 'Japan', temp: '17°', desc: 'Maples turn crimson in November' },
  { city: 'Budapest', country: 'Hungary', temp: '14°', desc: 'Thermal baths and ruin bars' },
]

const NORTH_WINTER: Destination[] = [
  { city: 'Bangkok', country: 'Thailand', temp: '31°', desc: 'Dry season, clear skies' },
  { city: 'Dubai', country: 'UAE', temp: '24°', desc: 'Best weather of the year' },
  { city: 'Singapore', country: 'Singapore', temp: '29°', desc: 'Festivals and street food' },
  { city: 'Marrakech', country: 'Morocco', temp: '17°', desc: 'Cool and crowd-free' },
  { city: 'Tenerife', country: 'Spain', temp: '22°', desc: 'Europe\'s winter sun island' },
  { city: 'Bali', country: 'Indonesia', temp: '30°', desc: 'Dry season in the highlands' },
  { city: 'Maldives', country: 'Maldives', temp: '29°', desc: 'Peak diving season' },
  { city: 'Cartagena', country: 'Colombia', temp: '30°', desc: 'Caribbean heat and culture' },
]

const SOUTH_SPRING: Destination[] = [
  { city: 'Buenos Aires', country: 'Argentina', temp: '22°', desc: 'Jacaranda season blooms' },
  { city: 'Cape Town', country: 'South Africa', temp: '23°', desc: 'Spring flowers carpet the Cape' },
  { city: 'Sydney', country: 'Australia', temp: '20°', desc: 'Perfect harbour weather' },
  { city: 'Santiago', country: 'Chile', temp: '18°', desc: 'Wine country in bloom' },
  { city: 'Auckland', country: 'New Zealand', temp: '17°', desc: 'Hiking season begins' },
  { city: 'Melbourne', country: 'Australia', temp: '19°', desc: 'Coffee culture and gardens' },
  { city: 'Mendoza', country: 'Argentina', temp: '20°', desc: 'Harvest just finished, quiet' },
  { city: 'Montevideo', country: 'Uruguay', temp: '19°', desc: 'Relaxed coast, great beef' },
]

function getSeason(lat: number, month: number): Destination[] {
  const isNorth = lat >= 0
  // month is 0-indexed
  if (isNorth) {
    if (month >= 2 && month <= 4) return NORTH_SPRING
    if (month >= 5 && month <= 7) return NORTH_SUMMER
    if (month >= 8 && month <= 10) return NORTH_AUTUMN
    return NORTH_WINTER
  } else {
    // Southern hemisphere — opposite
    if (month >= 2 && month <= 4) return SOUTH_SPRING    // their autumn → show spring-like picks
    if (month >= 5 && month <= 7) return NORTH_WINTER    // their winter → warm destinations
    if (month >= 8 && month <= 10) return NORTH_SUMMER   // their spring → warm picks
    return SOUTH_SPRING                                   // their summer
  }
}

const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function DestinationsStrip() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [monthLabel, setMonthLabel] = useState('')

  useEffect(() => {
    const month = new Date().getMonth()
    setMonthLabel(MONTH_LABELS[month])

    const applyLat = (lat: number) => {
      const pool = getSeason(lat, month)
      // shuffle deterministically by day-of-year so it changes daily but stays stable per session
      const day = Math.floor(Date.now() / 86_400_000)
      const shuffled = [...pool].sort((a, b) => {
        const ha = ((a.city.charCodeAt(0) * 31 + day) % pool.length)
        const hb = ((b.city.charCodeAt(0) * 31 + day) % pool.length)
        return ha - hb
      })
      setDestinations(shuffled.slice(0, 4))
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => applyLat(pos.coords.latitude),
        () => applyLat(45), // fallback: northern hemisphere
        { timeout: 5000, maximumAge: 300_000 }
      )
    } else {
      applyLat(45)
    }
  }, [])

  const handleClick = (city: string) => {
    sessionStorage.setItem('prefill_destination', city)
    const el = document.getElementById('search-section')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  if (destinations.length === 0) return null

  return (
    <section className="dest-strip">
      <div className="wrap">
        <div className="dest-head">
          <div className="eyebrow">In season</div>
          <div className="mono mute">{monthLabel} · {new Date().getFullYear()}</div>
        </div>
        <div className="dest-grid">
          {destinations.map((d) => (
            <button
              key={d.city}
              className="dest-card"
              onClick={() => handleClick(d.city)}
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
            >
              <DestinationPhoto city={d.city} className="dest-photo" />
              <div className="dest-meta">
                <div className="serif" style={{ fontSize: 22 }}>{d.city}</div>
                <div className="mono mute" style={{ fontSize: 11 }}>{d.country} · {d.temp} avg</div>
                <div className="mute" style={{ fontSize: 12, marginTop: 6 }}>{d.desc}</div>
                <div className="serif" style={{ fontSize: 14, color: 'var(--accent)', marginTop: 10 }}>
                  Search flights →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
