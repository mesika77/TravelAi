import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { decodeTripId } from '@/lib/encode'
import { TripContextProvider } from '@/components/TripContextProvider'
import FlightCard from '@/components/FlightCard'
import HotelCard from '@/components/HotelCard'
import ActivityCard from '@/components/ActivityCard'
import VisaBadge from '@/components/VisaBadge'
import TripCostSummary from '@/components/TripCostSummary'
import WeatherWidget from '@/components/WeatherWidget'
import CurrencyWidget from '@/components/CurrencyWidget'
import ChatBot from '@/components/ChatBot'
import DestinationPhoto from '@/components/DestinationPhoto'

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tripParams = decodeTripId(id)
  if (!tripParams) notFound()

  const departure = new Date(tripParams.departureDate)
  const returnDate = new Date(tripParams.returnDate)
  const nights = tripParams.oneWay
    ? 0
    : Math.max(1, Math.round((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)))

  const fmtBar = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const totalTravelers = tripParams.adults + tripParams.children
  const dest = tripParams.destination
  const interests = tripParams.interests.map((i) => i.charAt(0).toUpperCase() + i.slice(1))

  return (
    <TripContextProvider params={tripParams} nights={nights}>
      {/* Trip bar */}
      <div className="trip-bar">
        <div className="wrap trip-bar-inner">
          <div className="trip-route">
            <span className="mono mute" style={{ fontSize: 10 }}>From</span>
            <span className="serif" style={{ fontSize: 18 }}>{tripParams.origin}</span>
            <span style={{ color: 'var(--accent)', fontSize: 14 }}>→</span>
            <span className="serif" style={{ fontSize: 18 }}>{dest}</span>
          </div>
          <div className="trip-meta mono mute">
            <span>{fmtBar(departure)}</span>
            {!tripParams.oneWay && <><span>–</span><span>{fmtBar(returnDate)}</span></>}
            <span>·</span>
            <span>{totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}</span>
            {!tripParams.oneWay && <><span>·</span><span>{nights} nights</span></>}
            {tripParams.oneWay && <><span>·</span><span>One Way</span></>}
          </div>
          <Link href="/" className="btn-link mono" style={{ fontSize: 10 }}>
            <ArrowLeft size={11} /> New search
          </Link>
        </div>
      </div>

      {/* Trip header */}
      <div className="wrap trip-header">
        <div className="trip-header-left">
          <div className="eyebrow">Your itinerary · {dest.slice(0, 3).toUpperCase()}—26</div>
          <h1 className="trip-title serif">
            {tripParams.oneWay ? 'One way to' : `${nights === 1 ? 'One night' : `${nights} nights`} in`}{' '}
            <em>{dest}</em>.
          </h1>
          <p className="trip-desc mute">
            A plan composed from live flights, hotel rates, historical weather, and places matched to your interests.
          </p>
          {interests.length > 0 && (
            <div className="trip-chips">
              {interests.map((c) => (
                <span key={c} className="trip-chip">{c}</span>
              ))}
            </div>
          )}
        </div>
        <div className="trip-header-right">
          <DestinationPhoto
            city={dest}
            query={`${dest} landmark travel`}
            className="trip-hero"
            style={{ borderRadius: 'var(--r-lg)' }}
          />
        </div>
      </div>

      {/* Trip grid */}
      <div className="trip-grid">
        <div className="trip-main">
          <FlightCard />
          <HotelCard />
          <ActivityCard />
        </div>
        <aside className="trip-side">
          <VisaBadge />
          <TripCostSummary />
          <WeatherWidget />
          <CurrencyWidget />
        </aside>
      </div>

      <ChatBot />
    </TripContextProvider>
  )
}
