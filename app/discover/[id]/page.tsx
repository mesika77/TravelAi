import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CloudSun, MapPinned, ShieldCheck, Wallet } from 'lucide-react'
import DestinationPhoto from '@/components/DestinationPhoto'
import { decodeDiscoverId, encodeTripId } from '@/lib/encode'
import { recommendDestinations } from '@/lib/discover'
import type { TripParams, VisaType } from '@/lib/types'

function visaLabel(type: VisaType) {
  if (type === 'free_movement') return 'Free movement'
  if (type === 'visa_free') return 'Visa free'
  if (type === 'e_visa') return 'E-visa'
  if (type === 'visa_on_arrival') return 'Visa on arrival'
  if (type === 'visa_required') return 'Visa required'
  return 'Check entry rules'
}

function visaTone(type: VisaType) {
  if (type === 'free_movement' || type === 'visa_free') return 'var(--go)'
  if (type === 'e_visa' || type === 'visa_on_arrival') return 'var(--accent)'
  if (type === 'unknown') return 'var(--ink-4)'
  return 'var(--stop)'
}

export default async function DiscoverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const search = decodeDiscoverId(id)
  if (!search) notFound()

  let recommendations
  let window
  try {
    const result = await recommendDestinations(search)
    recommendations = result.recommendations
    window = result.window
  } catch {
    notFound()
  }

  return (
    <>
      <div className="trip-bar">
        <div className="wrap trip-bar-inner">
          <div className="trip-route">
            <span className="mono mute" style={{ fontSize: 10 }}>From</span>
            <span className="serif" style={{ fontSize: 18 }}>{search.origin}</span>
            <span style={{ color: 'var(--accent)', fontSize: 14 }}>→</span>
            <span className="serif" style={{ fontSize: 18 }}>Anywhere that fits</span>
          </div>
          <div className="trip-meta mono mute">
            <span>{window.summary}</span>
            <span>·</span>
            <span>{search.adults + search.children} traveler{search.adults + search.children > 1 ? 's' : ''}</span>
            <span>·</span>
            <span>${search.budget.toLocaleString()} pp</span>
          </div>
          <Link href="/" className="btn-link mono" style={{ fontSize: 10 }}>
            <ArrowLeft size={11} /> New search
          </Link>
        </div>
      </div>

      <div className="wrap discover-header">
        <div>
          <div className="eyebrow">Discovery search</div>
          <h1 className="discover-title serif">
            Where you could go from <em>{search.origin}</em>.
          </h1>
          <p className="discover-desc mute">
            Ranked against your timing, interests, budget, entry friction, and expected weather for that season.
          </p>
          <div className="trip-chips">
            {search.interests.map((interest) => (
              <span key={interest} className="trip-chip">{interest}</span>
            ))}
            {search.regionQuery && <span className="trip-chip">{search.regionQuery}</span>}
            {search.beachPriority && <span className="trip-chip">Dry beach weather</span>}
          </div>
        </div>
      </div>

      <div className="discover-grid wrap">
        {recommendations.map((recommendation, index) => {
          const tripParams: TripParams = {
            origin: search.origin,
            destination: recommendation.city,
            departureDate: recommendation.departureDate,
            returnDate: recommendation.returnDate,
            oneWay: false,
            adults: search.adults,
            children: search.children,
            budget: search.budget,
            passport: search.passport,
            interests: search.interests,
          }

          return (
            <article key={recommendation.city} className="discover-card">
              <div className="discover-card-media">
                <DestinationPhoto
                  city={recommendation.city}
                  query={`${recommendation.city} ${recommendation.country} travel`}
                  className="discover-photo"
                />
                <div className="discover-rank mono">#{String(index + 1).padStart(2, '0')}</div>
                <div className="discover-score">
                  <div className="mono mute">Match</div>
                  <div className="serif">{recommendation.matchScore}<span className="mono">/100</span></div>
                </div>
              </div>

              <div className="discover-card-body">
                <div className="discover-card-head">
                  <div>
                    <div className="eyebrow">{recommendation.region}</div>
                    <h2 className="serif" style={{ fontSize: 36, marginTop: 6 }}>
                      {recommendation.city}, <em>{recommendation.country}</em>
                    </h2>
                  </div>
                  <div className="mono mute">
                    {recommendation.flightHours}h flight · {recommendation.distanceKm.toLocaleString()} km
                  </div>
                </div>

                <div className="discover-metrics">
                  <div className="discover-metric">
                    <CloudSun size={16} />
                    <div>
                      <div className="mono mute">Weather</div>
                      <strong>{recommendation.avgHigh}° / {recommendation.avgLow}°</strong>
                      <span>{recommendation.avgRain}% rainy days</span>
                    </div>
                  </div>
                  <div className="discover-metric">
                    <Wallet size={16} />
                    <div>
                      <div className="mono mute">Est. budget</div>
                      <strong>${recommendation.estimatedTotalPerPerson.toLocaleString()}</strong>
                      <span>${recommendation.estimatedFlight.toLocaleString()} flight estimate</span>
                    </div>
                  </div>
                  <div className="discover-metric">
                    <ShieldCheck size={16} />
                    <div>
                      <div className="mono mute">Entry</div>
                      <strong style={{ color: visaTone(recommendation.visaType) }}>{visaLabel(recommendation.visaType)}</strong>
                      <span>Based on your passport</span>
                    </div>
                  </div>
                  <div className="discover-metric">
                    <MapPinned size={16} />
                    <div>
                      <div className="mono mute">Best for</div>
                      <strong>{recommendation.tags.slice(0, 2).join(' · ')}</strong>
                      <span>{window.summary}</span>
                    </div>
                  </div>
                </div>

                <div className="discover-reasons">
                  {recommendation.reasons.map((reason) => (
                    <div key={reason} className="discover-reason">{reason}</div>
                  ))}
                </div>

                <div className="discover-actions">
                  <Link href={`/trip/${encodeTripId(tripParams)}`} className="btn btn-primary">
                    Build full trip <ArrowRight size={16} />
                  </Link>
                  <div className="mono mute">
                    Sample dates · {new Date(recommendation.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' '}–{' '}
                    {new Date(recommendation.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
