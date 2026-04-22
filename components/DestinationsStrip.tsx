'use client'

import { useState, useEffect } from 'react'
import DestinationPhoto from './DestinationPhoto'

interface Destination {
  city: string
  country: string
  temp: string
  desc: string
  photoQuery: string // specific query for a better-matched photo
}

const NORTH_SPRING: Destination[] = [
  { city: 'Kyoto', country: 'Japan', temp: '18°', desc: 'Cherry blossoms in full bloom', photoQuery: 'Kyoto Japan cherry blossom temple' },
  { city: 'Lisbon', country: 'Portugal', temp: '21°', desc: 'Warm sun before summer crowds', photoQuery: 'Lisbon Portugal Alfama tram rooftops' },
  { city: 'Amsterdam', country: 'Netherlands', temp: '14°', desc: 'Tulip season peaks in April', photoQuery: 'Amsterdam Netherlands tulips canals' },
  { city: 'Athens', country: 'Greece', temp: '20°', desc: 'Ancient sites, mild weather', photoQuery: 'Athens Greece Acropolis Parthenon' },
  { city: 'Barcelona', country: 'Spain', temp: '20°', desc: 'Pre-summer, still affordable', photoQuery: 'Barcelona Spain Sagrada Familia architecture' },
  { city: 'Marrakech', country: 'Morocco', temp: '25°', desc: 'Before the summer heat', photoQuery: 'Marrakech Morocco medina souk market' },
  { city: 'Reykjavik', country: 'Iceland', temp: '8°', desc: 'Midnight sun season begins', photoQuery: 'Reykjavik Iceland northern lights mountains' },
  { city: 'Istanbul', country: 'Turkey', temp: '17°', desc: 'Shoulder season, great value', photoQuery: 'Istanbul Turkey Blue Mosque Bosphorus' },
]

const NORTH_SUMMER: Destination[] = [
  { city: 'Santorini', country: 'Greece', temp: '27°', desc: 'Peak Aegean summer', photoQuery: 'Santorini Greece white buildings blue dome' },
  { city: 'Dubrovnik', country: 'Croatia', temp: '28°', desc: 'Adriatic coast at its best', photoQuery: 'Dubrovnik Croatia old town walls sea' },
  { city: 'Reykjavik', country: 'Iceland', temp: '13°', desc: '24-hour daylight', photoQuery: 'Iceland midnight sun landscape fjord' },
  { city: 'Amalfi', country: 'Italy', temp: '28°', desc: 'Clifftop villages, azure sea', photoQuery: 'Amalfi Coast Italy cliffs sea villages' },
  { city: 'Copenhagen', country: 'Denmark', temp: '20°', desc: 'Scandinavian summer bliss', photoQuery: 'Copenhagen Denmark Nyhavn colorful harbor' },
  { city: 'Lisbon', country: 'Portugal', temp: '27°', desc: 'Rooftop bars and beaches', photoQuery: 'Lisbon Portugal rooftop sunset cityscape' },
  { city: 'Tokyo', country: 'Japan', temp: '30°', desc: 'Festivals and summer energy', photoQuery: 'Tokyo Japan Shibuya crossing neon lights' },
  { city: 'Montreal', country: 'Canada', temp: '25°', desc: 'Jazz fest and outdoor terraces', photoQuery: 'Montreal Canada skyline old port summer' },
]

const NORTH_AUTUMN: Destination[] = [
  { city: 'New York', country: 'United States', temp: '16°', desc: 'Fall foliage and fashion week', photoQuery: 'New York City Central Park fall autumn leaves' },
  { city: 'Tokyo', country: 'Japan', temp: '19°', desc: 'Autumn leaves, cooler temps', photoQuery: 'Tokyo Japan autumn maple leaves temple' },
  { city: 'Prague', country: 'Czech Republic', temp: '13°', desc: 'Golden hour in the Old Town', photoQuery: 'Prague Czech Republic old town square autumn' },
  { city: 'Florence', country: 'Italy', temp: '18°', desc: 'Harvest season, fewer tourists', photoQuery: 'Florence Italy Tuscany vineyard autumn' },
  { city: 'Istanbul', country: 'Turkey', temp: '18°', desc: 'Perfect sightseeing weather', photoQuery: 'Istanbul Turkey Grand Bazaar Bosphorus autumn' },
  { city: 'Lisbon', country: 'Portugal', temp: '21°', desc: 'Warm autumn, empty beaches', photoQuery: 'Lisbon Portugal beach sunset autumn' },
  { city: 'Kyoto', country: 'Japan', temp: '17°', desc: 'Maples turn crimson in November', photoQuery: 'Kyoto Japan red maple autumn leaves garden' },
  { city: 'Budapest', country: 'Hungary', temp: '14°', desc: 'Thermal baths and ruin bars', photoQuery: 'Budapest Hungary Parliament Danube river' },
]

const NORTH_WINTER: Destination[] = [
  { city: 'Bangkok', country: 'Thailand', temp: '31°', desc: 'Dry season, clear skies', photoQuery: 'Bangkok Thailand temple golden pagoda' },
  { city: 'Dubai', country: 'UAE', temp: '24°', desc: 'Best weather of the year', photoQuery: 'Dubai UAE Burj Khalifa skyline modern' },
  { city: 'Singapore', country: 'Singapore', temp: '29°', desc: 'Festivals and street food', photoQuery: 'Singapore Marina Bay Sands gardens city' },
  { city: 'Marrakech', country: 'Morocco', temp: '17°', desc: 'Cool and crowd-free', photoQuery: 'Marrakech Morocco palace garden fountain' },
  { city: 'Tenerife', country: 'Spain', temp: '22°', desc: 'Europe\'s winter sun island', photoQuery: 'Tenerife Canary Islands volcano beach' },
  { city: 'Bali', country: 'Indonesia', temp: '30°', desc: 'Dry season in the highlands', photoQuery: 'Bali Indonesia rice terrace temple jungle' },
  { city: 'Maldives', country: 'Maldives', temp: '29°', desc: 'Peak diving season', photoQuery: 'Maldives overwater bungalow turquoise lagoon' },
  { city: 'Cartagena', country: 'Colombia', temp: '30°', desc: 'Caribbean heat and culture', photoQuery: 'Cartagena Colombia colorful colonial buildings' },
]

const SOUTH_SUMMER: Destination[] = [
  { city: 'Buenos Aires', country: 'Argentina', temp: '28°', desc: 'Long evenings and street tango', photoQuery: 'Buenos Aires Argentina tango colorful La Boca' },
  { city: 'Cape Town', country: 'South Africa', temp: '26°', desc: 'Beach season at its peak', photoQuery: 'Cape Town South Africa Table Mountain beach' },
  { city: 'Sydney', country: 'Australia', temp: '26°', desc: 'Iconic harbour in summer', photoQuery: 'Sydney Australia Opera House harbour beach' },
  { city: 'Auckland', country: 'New Zealand', temp: '22°', desc: 'Sailing and coastal hikes', photoQuery: 'Auckland New Zealand skyline harbour boats' },
  { city: 'Rio de Janeiro', country: 'Brazil', temp: '30°', desc: 'Carnival energy year-round', photoQuery: 'Rio de Janeiro Brazil Christ Redeemer beach' },
  { city: 'Santiago', country: 'Chile', temp: '24°', desc: 'Andes backdrop, great wine', photoQuery: 'Santiago Chile Andes mountains cityscape' },
  { city: 'Melbourne', country: 'Australia', temp: '23°', desc: 'Laneways and open-air festivals', photoQuery: 'Melbourne Australia laneway street art coffee' },
  { city: 'Montevideo', country: 'Uruguay', temp: '25°', desc: 'Relaxed coast, world-class beef', photoQuery: 'Montevideo Uruguay rambla waterfront old city' },
]

function getSeason(lat: number, month: number): Destination[] {
  const isNorth = lat >= 0
  if (isNorth) {
    if (month >= 2 && month <= 4) return NORTH_SPRING
    if (month >= 5 && month <= 7) return NORTH_SUMMER
    if (month >= 8 && month <= 10) return NORTH_AUTUMN
    return NORTH_WINTER
  } else {
    if (month >= 2 && month <= 4) return SOUTH_SUMMER  // their autumn — warm
    if (month >= 5 && month <= 7) return NORTH_WINTER  // their winter — show warm destinations
    if (month >= 8 && month <= 10) return NORTH_SUMMER // their spring
    return SOUTH_SUMMER                                 // their summer
  }
}

function pickFour(pool: Destination[]): Destination[] {
  const day = Math.floor(Date.now() / 86_400_000)
  return [...pool]
    .sort((a, b) => ((a.city.charCodeAt(0) * 31 + day) % pool.length) - ((b.city.charCodeAt(0) * 31 + day) % pool.length))
    .slice(0, 4)
}

const MONTH_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function DestinationsStrip() {
  const month = new Date().getMonth()
  // Show northern spring immediately — updates to correct hemisphere once geolocation resolves
  const [destinations, setDestinations] = useState<Destination[]>(() => pickFour(getSeason(45, month)))
  const [monthLabel] = useState(MONTH_LABELS[month])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pool = getSeason(pos.coords.latitude, month)
        setDestinations(pickFour(pool))
      },
      () => {}, // keep default on deny
      { timeout: 5000, maximumAge: 300_000 }
    )
  }, [month])

  const handleClick = (city: string) => {
    // Dispatch a live event so SearchForm (already mounted) hears it immediately
    window.dispatchEvent(new CustomEvent('travelai:prefill', { detail: { destination: city } }))
    document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })
  }

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
              style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%' }}
            >
              <DestinationPhoto
                city={d.city}
                query={d.photoQuery}
                className="dest-photo"
                style={{ aspectRatio: '3/4', borderRadius: 'var(--r)', width: '100%' }}
              />
              <div className="dest-meta">
                <div className="serif" style={{ fontSize: 22 }}>{d.city}</div>
                <div className="mono mute" style={{ fontSize: 11 }}>{d.country} · {d.temp} avg</div>
                <div className="mute" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{d.desc}</div>
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
