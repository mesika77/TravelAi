import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tripParams = decodeTripId(id)

  if (!tripParams) notFound()

  const departure = new Date(tripParams.departureDate)
  const returnDate = new Date(tripParams.returnDate)
  const nights = tripParams.oneWay ? 0 : Math.max(1, Math.round((returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24)))

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const totalTravelers = tripParams.adults + tripParams.children

  return (
    <TripContextProvider params={tripParams} nights={nights}>
      {/* Sticky top bar */}
      <div
        className="sticky top-16 z-40 border-b backdrop-blur-md"
        style={{ background: 'var(--surface)/90', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold truncate" style={{ color: 'var(--text)' }}>
              {tripParams.origin}
              <span style={{ color: 'var(--accent)' }}> → </span>
              {tripParams.destination}
            </span>
            <span className="hidden sm:block text-sm" style={{ color: 'var(--text-muted)' }}>
              {formatDate(departure)}{!tripParams.oneWay && ` – ${formatDate(returnDate)}`} · {tripParams.oneWay ? 'One Way · ' : ''}{totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm flex-shrink-0 transition-all duration-200 hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            New Search
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column — 60% */}
          <div className="lg:col-span-3 flex flex-col gap-10">
            <FlightCard />
            <HotelCard />
            <ActivityCard />
          </div>

          {/* Right column — 40% */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <VisaBadge />
            <TripCostSummary />
            <WeatherWidget />
            <CurrencyWidget />
          </div>
        </div>
      </div>

      {/* Floating chat */}
      <ChatBot />
    </TripContextProvider>
  )
}
