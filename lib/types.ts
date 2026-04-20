export interface TripParams {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  adults: number
  children: number
  budget: number
  passport: string
  interests: string[]
}

export interface FlightLeg {
  airline: string
  flightNumber?: string
  departureAirport: string
  arrivalAirport: string
  departureTime: string
  arrivalTime: string
  duration: number // minutes
}

export interface FlightOffer {
  id: string
  price: number
  currency: string
  totalDuration: number
  stops: number
  legs: FlightLeg[]
  carbonEmissions?: number
  bookingToken?: string
  airline: string
}

export interface Hotel {
  key: string
  name: string
  rating?: number
  minRate?: number
  maxRate?: number
  currency?: string
}

export interface HotelsResult {
  hotels: Hotel[]
  avgNightly: number
}

export type VisaType = 'visa_free' | 'e_visa' | 'visa_required' | 'visa_on_arrival' | 'free_movement' | 'unknown'

export interface VisaResult {
  type: VisaType
  maxStay?: string
  sourceUrl?: string
  passportCountry: string
  destinationCountry: string
}

export interface DayForecast {
  date: string
  tempMax: number
  tempMin: number
  precipProbability: number
}

export interface WeatherResult {
  forecast: DayForecast[]
  avgHigh: number
  avgLow: number
  avgRain: number
}

export interface Activity {
  id: string
  name: string
  category: string
  address: string
  distance?: number
  rating?: number
  interest: string
}

export interface CurrencyResult {
  rate: number
  targetCurrency: string
  targetSymbol: string
  budgetInLocal: number
}

export interface CityData {
  name: string
  country: string
  countryCode: string
  lat: number
  lon: number
  currency: string
  currencyCode: string
}

export interface AirportData {
  city: string
  country: string
  iata: string
  name: string
}

export interface DailyCosts {
  food: number
  transport: number
  activities: number
  total: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
