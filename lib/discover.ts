import citiesData from '@/public/data/cities.json'
import airportsData from '@/public/data/airports.json'
import dailyCostsData from '@/public/data/daily-costs.json'
import type { CityData, DailyCosts, DiscoverParams, DiscoverRecommendation, DiscoverResults, VisaType } from './types'
import { fetchWeather } from './weather'
import { checkVisaOffline } from './visa'
import { fetchFlights } from './serpapi'

type DestinationProfile = {
  region: string
  tags: string[]
  idealMonths: number[]
  beach?: boolean
  costTier: 1 | 2 | 3 | 4
}

const airportCities = new Set(
  (airportsData as { city: string }[]).map((airport) => airport.city.toLowerCase())
)

const cityIndex = new Map(
  (citiesData as CityData[]).map((city) => [city.name.toLowerCase(), city] as const)
)

const dailyCostIndex = new Map(
  Object.entries(dailyCostsData as Record<string, DailyCosts>).map(([city, costs]) => [city.toLowerCase(), costs] as const)
)

const PROFILES: Record<string, DestinationProfile> = {
  lisbon: { region: 'Europe', tags: ['food', 'culture', 'history', 'nightlife'], idealMonths: [4, 5, 6, 9, 10], costTier: 2 },
  porto: { region: 'Europe', tags: ['food', 'culture', 'history'], idealMonths: [4, 5, 6, 9, 10], costTier: 2 },
  barcelona: { region: 'Europe', tags: ['beaches', 'food', 'culture', 'nightlife', 'shopping'], idealMonths: [5, 6, 7, 8, 9], beach: true, costTier: 3 },
  valencia: { region: 'Europe', tags: ['beaches', 'food', 'culture'], idealMonths: [5, 6, 7, 8, 9, 10], beach: true, costTier: 2 },
  madrid: { region: 'Europe', tags: ['food', 'culture', 'history', 'nightlife', 'shopping'], idealMonths: [4, 5, 6, 9, 10], costTier: 3 },
  athens: { region: 'Europe', tags: ['beaches', 'history', 'culture', 'food'], idealMonths: [4, 5, 6, 9, 10], beach: true, costTier: 2 },
  santorini: { region: 'Europe', tags: ['beaches', 'food', 'nature'], idealMonths: [5, 6, 7, 8, 9], beach: true, costTier: 4 },
  mykonos: { region: 'Europe', tags: ['beaches', 'nightlife'], idealMonths: [5, 6, 7, 8, 9], beach: true, costTier: 4 },
  dubrovnik: { region: 'Europe', tags: ['beaches', 'history', 'culture'], idealMonths: [5, 6, 7, 8, 9], beach: true, costTier: 3 },
  split: { region: 'Europe', tags: ['beaches', 'food', 'history', 'nightlife'], idealMonths: [5, 6, 7, 8, 9], beach: true, costTier: 3 },
  rome: { region: 'Europe', tags: ['food', 'culture', 'history', 'shopping'], idealMonths: [4, 5, 6, 9, 10], costTier: 3 },
  venice: { region: 'Europe', tags: ['culture', 'history', 'food'], idealMonths: [4, 5, 6, 9, 10], costTier: 4 },
  amsterdam: { region: 'Europe', tags: ['culture', 'nightlife', 'shopping', 'history'], idealMonths: [4, 5, 6, 7, 8, 9], costTier: 4 },
  copenhagen: { region: 'Europe', tags: ['food', 'culture', 'shopping'], idealMonths: [5, 6, 7, 8, 9], costTier: 4 },
  vienna: { region: 'Europe', tags: ['culture', 'history', 'food'], idealMonths: [4, 5, 6, 9, 10], costTier: 3 },
  prague: { region: 'Europe', tags: ['history', 'culture', 'nightlife'], idealMonths: [4, 5, 6, 9, 10], costTier: 2 },
  budapest: { region: 'Europe', tags: ['history', 'nightlife', 'culture'], idealMonths: [4, 5, 6, 9, 10], costTier: 2 },
  istanbul: { region: 'Middle East', tags: ['food', 'history', 'shopping', 'culture'], idealMonths: [4, 5, 6, 9, 10], costTier: 2 },
  dubai: { region: 'Middle East', tags: ['beaches', 'shopping', 'nightlife', 'food'], idealMonths: [1, 2, 3, 4, 11, 12], beach: true, costTier: 4 },
  tel_aviv: { region: 'Middle East', tags: ['beaches', 'food', 'nightlife'], idealMonths: [4, 5, 6, 9, 10], beach: true, costTier: 3 },
  marrakech: { region: 'Africa', tags: ['food', 'shopping', 'culture', 'history'], idealMonths: [2, 3, 4, 5, 10, 11], costTier: 2 },
  cape_town: { region: 'Africa', tags: ['beaches', 'nature', 'food', 'adventure'], idealMonths: [1, 2, 3, 11, 12], beach: true, costTier: 3 },
  mauritius: { region: 'Africa', tags: ['beaches', 'nature', 'adventure'], idealMonths: [4, 5, 6, 9, 10, 11], beach: true, costTier: 4 },
  bangkok: { region: 'Asia', tags: ['food', 'nightlife', 'shopping', 'culture'], idealMonths: [1, 2, 11, 12], costTier: 2 },
  singapore: { region: 'Asia', tags: ['food', 'shopping', 'culture', 'family'], idealMonths: [2, 3, 6, 7], costTier: 4 },
  tokyo: { region: 'Asia', tags: ['food', 'shopping', 'culture', 'history'], idealMonths: [3, 4, 5, 10, 11], costTier: 4 },
  osaka: { region: 'Asia', tags: ['food', 'shopping', 'nightlife', 'culture'], idealMonths: [3, 4, 5, 10, 11], costTier: 3 },
  kyoto: { region: 'Asia', tags: ['culture', 'history', 'food', 'nature'], idealMonths: [3, 4, 5, 10, 11], costTier: 3 },
  seoul: { region: 'Asia', tags: ['food', 'shopping', 'nightlife', 'culture'], idealMonths: [4, 5, 6, 9, 10], costTier: 3 },
  cancun: { region: 'North America', tags: ['beaches', 'nightlife', 'adventure'], idealMonths: [1, 2, 3, 4, 11, 12], beach: true, costTier: 3 },
  'playa del carmen': { region: 'North America', tags: ['beaches', 'food', 'adventure'], idealMonths: [1, 2, 3, 4, 11, 12], beach: true, costTier: 3 },
  mexico_city: { region: 'North America', tags: ['food', 'history', 'culture', 'shopping'], idealMonths: [2, 3, 4, 10, 11], costTier: 2 },
  san_jose: { region: 'North America', tags: ['nature', 'adventure', 'beaches'], idealMonths: [1, 2, 3, 4, 12], beach: true, costTier: 3 },
  cartagena: { region: 'South America', tags: ['beaches', 'history', 'food', 'nightlife'], idealMonths: [1, 2, 3, 12], beach: true, costTier: 2 },
  rio_de_janeiro: { region: 'South America', tags: ['beaches', 'nightlife', 'food', 'adventure'], idealMonths: [1, 2, 3, 4, 11, 12], beach: true, costTier: 3 },
  bogota: { region: 'South America', tags: ['food', 'culture', 'nightlife'], idealMonths: [1, 2, 3, 7, 8, 12], costTier: 2 },
  reykjavik: { region: 'Europe', tags: ['nature', 'adventure'], idealMonths: [6, 7, 8, 9], costTier: 4 },
  sydney: { region: 'Oceania', tags: ['beaches', 'food', 'nature', 'nightlife'], idealMonths: [1, 2, 3, 11, 12], beach: true, costTier: 4 },
  auckland: { region: 'Oceania', tags: ['nature', 'food', 'adventure'], idealMonths: [1, 2, 3, 11, 12], costTier: 4 },
}

const PROFILE_CITY_LOOKUP: Record<string, string> = {
  tel_aviv: 'Tel Aviv',
  marrakech: 'Marrakech',
  cancun: 'Cancún',
  mexico_city: 'Mexico City',
  san_jose: 'San José',
  rio_de_janeiro: 'Rio de Janeiro',
  bogota: 'Bogotá',
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function monthName(month: number) {
  return new Date(Date.UTC(2026, month - 1, 1)).toLocaleDateString('en-US', { month: 'long' })
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

function cityFromKey(key: string) {
  return PROFILE_CITY_LOOKUP[key] ?? key.split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')
}

function getCity(name: string) {
  return cityIndex.get(name.toLowerCase())
}

function haversineKm(a: CityData, b: CityData) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const q =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q))
}

type ResolvedWindow = {
  departureDate: string
  returnDate: string
  nights: number
  month: number
  summary: string
}

const REGION_ALIASES: Record<string, string[]> = {
  'far east': ['asia'],
  'middle east': ['middle east'],
  mediterranean: ['europe', 'middle east', 'africa'],
  caribbean: ['north america'],
  southeast: ['asia'],
  'south east asia': ['asia'],
  'south-east asia': ['asia'],
  east: ['asia'],
}

const STOP_WORDS = new Set(['beach', 'beaches', 'dry', 'weather', 'in', 'the', 'a', 'an', 'for', 'with', 'near'])
const DIRECTION_WORDS = new Set(['north', 'south', 'east', 'west', 'central'])

function resolveUpcomingMonthYear(month: number) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const year = month < currentMonth ? now.getFullYear() + 1 : now.getFullYear()
  return { year, month }
}

function buildFlexibleWindow(month: number, nights: number): ResolvedWindow {
  const { year } = resolveUpcomingMonthYear(month)
  const daysInMonth = new Date(year, month, 0).getDate()
  const lastSafeStart = Math.max(2, daysInMonth - nights - 1)
  const startDay = Math.min(10, lastSafeStart)
  const departure = new Date(Date.UTC(year, month - 1, startDay, 12))
  const returning = new Date(departure)
  returning.setUTCDate(returning.getUTCDate() + nights)
  return {
    departureDate: toDateString(departure),
    returnDate: toDateString(returning),
    nights,
    month,
    summary: `${monthName(month)} · ${nights} nights`,
  }
}

function resolveWindow(params: DiscoverParams): ResolvedWindow {
  if (params.departureDate && params.returnDate) {
    return {
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      nights: Math.max(1, Math.round((new Date(params.returnDate).getTime() - new Date(params.departureDate).getTime()) / 86400000)),
      month: new Date(params.departureDate).getMonth() + 1,
      summary: `${new Date(params.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${new Date(params.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    }
  }

  const nights = Math.max(2, params.tripLengthNights)
  const month = params.flexibleMonths?.[0] ?? new Date().getMonth() + 1
  return buildFlexibleWindow(month, nights)
}

function seasonScore(idealMonths: number[], month: number) {
  if (idealMonths.includes(month)) return 1
  const distance = Math.min(...idealMonths.map((candidate) => Math.min(Math.abs(candidate - month), 12 - Math.abs(candidate - month))))
  return clamp(1 - distance * 0.22, 0.2, 1)
}

function distanceScore(distanceKm: number, nights: number) {
  const idealMax = nights <= 4 ? 2600 : nights <= 7 ? 5200 : nights <= 10 ? 8500 : 13000
  if (distanceKm <= idealMax) return 1
  return clamp(1 - (distanceKm - idealMax) / idealMax, 0.15, 1)
}

function estimatedFlightCost(distanceKm: number, costTier: number, travelers: number) {
  const base = 90 + distanceKm * 0.075
  const tierMultiplier = 1 + (costTier - 2) * 0.08
  return Math.round((base * tierMultiplier * travelers) / travelers)
}

function estimatedTripCostPerPerson(city: string, nights: number, flightCost: number, costTier: number) {
  const dailyCost = dailyCostIndex.get(city.toLowerCase())?.total ?? [70, 110, 170, 250][costTier - 1]
  const stayAndSpend = dailyCost * nights * 1.45
  return Math.round(flightCost + stayAndSpend)
}

function budgetScore(totalPerPerson: number, budget: number) {
  if (!budget) return 0.75
  if (totalPerPerson <= budget) return 1
  return clamp(1 - (totalPerPerson - budget) / budget, 0.1, 1)
}

function visaScore(visaType: VisaType) {
  if (visaType === 'free_movement' || visaType === 'visa_free') return 1
  if (visaType === 'e_visa') return 0.88
  if (visaType === 'visa_on_arrival') return 0.82
  if (visaType === 'unknown') return 0.58
  return 0.3
}

function weatherScore(params: DiscoverParams, avgHigh: number, avgRain: number, profile: DestinationProfile) {
  const wantsBeach = params.beachPriority || params.interests.includes('beaches')
  if (wantsBeach || profile.beach) {
    const warmth = clamp((avgHigh - 20) / 10, 0, 1)
    const dryness = clamp(1 - avgRain / 70, 0, 1)
    return clamp(warmth * 0.65 + dryness * 0.35, 0.05, 1)
  }

  const comfort = avgHigh < 8 ? 0.2 : avgHigh > 32 ? 0.45 : 1 - Math.abs(avgHigh - 23) / 18
  const rain = clamp(1 - avgRain / 85, 0.15, 1)
  return clamp(comfort * 0.6 + rain * 0.4, 0.1, 1)
}

function interestScore(interests: string[], tags: string[]) {
  if (interests.length === 0) return 0.72
  const matches = interests.filter((interest) => tags.includes(interest)).length
  if (matches === 0) return 0.2
  return clamp(matches / interests.length + (tags.includes('family') && interests.length > 1 ? 0.05 : 0), 0.2, 1)
}

function buildRegionTerms(query?: string) {
  if (!query) return []
  const normalized = query.toLowerCase().trim()
  const expanded = new Set<string>([normalized])
  const cleanedTokens = normalized
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token))

  for (const [phrase, aliases] of Object.entries(REGION_ALIASES)) {
    if (normalized.includes(phrase)) {
      aliases.forEach((alias) => expanded.add(alias))
    }
  }

  const isMultiWord = cleanedTokens.length > 1
  cleanedTokens.forEach((token) => {
    if (isMultiWord && DIRECTION_WORDS.has(token)) return
    expanded.add(token)
  })

  return [...expanded]
}

function regionMatches(profile: DestinationProfile, city: CityData, query?: string) {
  if (!query) return true
  const terms = buildRegionTerms(query)

  const haystacks = [
    profile.region.toLowerCase(),
    city.country.toLowerCase(),
    city.name.toLowerCase(),
    profile.tags.join(' ').toLowerCase(),
  ]

  return terms.some((term) => haystacks.some((haystack) => haystack.includes(term)))
}

function buildReasons(input: {
  city: string
  profile: DestinationProfile
  distanceKm: number
  totalPerPerson: number
  budget: number
  avgHigh: number
  avgRain: number
  visaType: VisaType
  requestedInterests: string[]
  month: number
}) {
  const reasons: string[] = []
  const matched = input.requestedInterests.filter((interest) => input.profile.tags.includes(interest))
  if (matched.length > 0) {
    reasons.push(`Strong fit for ${matched.slice(0, 2).join(' and ')}`)
  }
  if (input.profile.idealMonths.includes(input.month)) {
    reasons.push(`Especially good in ${monthName(input.month)}`)
  }
  if ((input.profile.beach || input.requestedInterests.includes('beaches')) && input.avgHigh >= 23 && input.avgRain <= 35) {
    reasons.push(`Warm enough for beach time with relatively low rain`)
  } else if (input.avgRain <= 30) {
    reasons.push(`Usually drier than average for this time of year`)
  }
  if (input.distanceKm <= 3500) {
    reasons.push(`A relatively easy flight from ${input.city}`)
  }
  if (input.totalPerPerson <= input.budget) {
    reasons.push(`Estimated to stay within your per-person budget`)
  }
  if (input.visaType === 'visa_free' || input.visaType === 'free_movement') {
    reasons.push(`No major visa friction for this passport`)
  } else if (input.visaType === 'e_visa' || input.visaType === 'visa_on_arrival') {
    reasons.push(`Entry should be manageable without a full consulate process`)
  }
  return reasons.slice(0, 4)
}

async function buildRouteAdvisory(originCity: string, destinationCity: string, departureDate: string, returnDate: string) {
  try {
    const flights = await fetchFlights(originCity, destinationCity, departureDate, returnDate, false)
    if (flights.length === 0) {
      return {
        routeMode: 'nearby_hub' as const,
        routeNote: `No bookable route was found from ${originCity}. You may need to land in another city first and continue from there.`,
      }
    }

    const direct = flights.find((flight) => flight.stops === 0)
    if (direct) {
      return {
        routeMode: 'direct' as const,
        routeNote: `Direct flights appear to be available from ${originCity}.`,
      }
    }

    const minStops = Math.min(...flights.map((flight) => flight.stops))
    return {
      routeMode: 'connecting' as const,
      routeNote: `No direct flight from ${originCity}. Expect at least ${minStops} stop${minStops > 1 ? 's' : ''} on the way to ${destinationCity}.`,
    }
  } catch {
    return {
      routeMode: 'unknown' as const,
      routeNote: `We couldn't verify live flight access for this route right now.`,
    }
  }
}

async function buildRecommendations(params: DiscoverParams, ignoreRegion = false): Promise<{
  recommendations: DiscoverRecommendation[]
  window: ResolvedWindow
}> {
  const origin = getCity(params.origin)
  if (!origin) {
    throw new Error(`Unknown origin city: ${params.origin}`)
  }

  const window = resolveWindow(params)
  const candidateWindows = params.departureDate && params.returnDate
    ? [window]
    : (params.flexibleMonths?.length ? params.flexibleMonths : [window.month]).map((month) =>
        buildFlexibleWindow(month, Math.max(2, params.tripLengthNights))
      )
  const travelers = Math.max(1, params.adults + params.children)

  const prelim = Object.entries(PROFILES)
    .map(([key, profile]) => {
      const cityName = cityFromKey(key)
      const city = getCity(cityName)
      if (!city || !airportCities.has(city.name.toLowerCase()) || city.name === origin.name) return null
      if (!ignoreRegion && !regionMatches(profile, city, params.regionQuery)) return null
      const distanceKm = haversineKm(origin, city)
      const flightCost = estimatedFlightCost(distanceKm, profile.costTier, travelers)
      const totalPerPerson = estimatedTripCostPerPerson(city.name, window.nights, flightCost, profile.costTier)
      const visa = checkVisaOffline(params.passport, city.country)
      const preliminaryScore =
        interestScore(params.interests, profile.tags) * 0.36 +
        seasonScore(profile.idealMonths, window.month) * 0.24 +
        distanceScore(distanceKm, window.nights) * 0.16 +
        budgetScore(totalPerPerson, params.budget) * 0.12 +
        visaScore(visa.type) * 0.12

      return {
        city,
        profile,
        distanceKm,
        flightCost,
        totalPerPerson,
        visaType: visa.type,
        preliminaryScore,
      }
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .sort((a, b) => b.preliminaryScore - a.preliminaryScore)
    .slice(0, 12)

  const recommendations = await Promise.all(
    prelim.map(async (candidate) => {
      const scoredWindows = await Promise.allSettled(candidateWindows.map(async (candidateWindow) => {
        const weather = await fetchWeather(
          candidate.city.lat,
          candidate.city.lon,
          candidateWindow.departureDate,
          candidateWindow.returnDate
        )
        const wxScore = weatherScore(params, weather.avgHigh, weather.avgRain, candidate.profile)
        const totalScore =
          interestScore(params.interests, candidate.profile.tags) * 0.28 +
          seasonScore(candidate.profile.idealMonths, candidateWindow.month) * 0.18 +
          wxScore * 0.22 +
          distanceScore(candidate.distanceKm, candidateWindow.nights) * 0.12 +
          budgetScore(candidate.totalPerPerson, params.budget) * 0.1 +
          visaScore(candidate.visaType) * 0.1

        return { candidateWindow, weather, totalScore }
      }))

      const successfulWindows = scoredWindows
        .filter((result): result is PromiseFulfilledResult<{ candidateWindow: ResolvedWindow; weather: Awaited<ReturnType<typeof fetchWeather>>; totalScore: number }> => result.status === 'fulfilled')
        .map((result) => result.value)

      if (successfulWindows.length === 0) {
        return null
      }

      const bestWindow = successfulWindows.sort((a, b) => b.totalScore - a.totalScore)[0]

      return {
        city: candidate.city.name,
        country: candidate.city.country,
        countryCode: candidate.city.countryCode,
        region: candidate.profile.region,
        matchScore: Math.round(bestWindow.totalScore * 100),
        distanceKm: Math.round(candidate.distanceKm),
        flightHours: Math.max(2, Math.round(candidate.distanceKm / 760)),
        avgHigh: bestWindow.weather.avgHigh,
        avgLow: bestWindow.weather.avgLow,
        avgRain: bestWindow.weather.avgRain,
        estimatedFlight: candidate.flightCost,
        estimatedTotalPerPerson: candidate.totalPerPerson,
        visaType: candidate.visaType,
        routeMode: 'unknown' as DiscoverRecommendation['routeMode'],
        routeNote: 'Checking flight access for this route.',
        tags: candidate.profile.tags.slice(0, 4),
        reasons: buildReasons({
          city: origin.name,
          profile: candidate.profile,
          distanceKm: candidate.distanceKm,
          totalPerPerson: candidate.totalPerPerson,
          budget: params.budget,
          avgHigh: bestWindow.weather.avgHigh,
          avgRain: bestWindow.weather.avgRain,
          visaType: candidate.visaType,
          requestedInterests: params.interests,
          month: bestWindow.candidateWindow.month,
        }),
        departureDate: bestWindow.candidateWindow.departureDate,
        returnDate: bestWindow.candidateWindow.returnDate,
      } satisfies DiscoverRecommendation
    })
  )

  const topRecommendations = recommendations
    .filter((recommendation): recommendation is NonNullable<typeof recommendation> => recommendation !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8)

  const withRouteInfo = await Promise.all(
    topRecommendations.map(async (recommendation) => ({
      ...recommendation,
      ...(await buildRouteAdvisory(
        params.origin,
        recommendation.city,
        recommendation.departureDate,
        recommendation.returnDate
      )),
    }))
  )

  return {
    recommendations: withRouteInfo,
    window,
  }
}

export async function recommendDestinations(params: DiscoverParams): Promise<DiscoverResults> {
  const primary = await buildRecommendations(params, false)
  if (primary.recommendations.length > 0 || !params.regionQuery) {
    return primary
  }

  const fallback = await buildRecommendations(params, true)
  return {
    ...fallback,
    usedRegionFallback: true,
  }
}
