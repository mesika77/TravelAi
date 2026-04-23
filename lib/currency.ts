import type { CurrencyResult } from './types'
import citiesData from '@/public/data/cities.json'
import { lookupStoredPlaceByCity } from './places'

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', KRW: '₩',
  INR: '₹', THB: '฿', VND: '₫', BRL: 'R$', MXN: '$', AUD: 'A$',
  CAD: 'C$', CHF: 'Fr', SEK: 'kr', NOK: 'kr', DKK: 'kr', HKD: 'HK$',
  SGD: 'S$', NZD: 'NZ$', ZAR: 'R', AED: 'د.إ', SAR: '﷼', QAR: '﷼',
  TRY: '₺', PLN: 'zł', CZK: 'Kč', HUF: 'Ft', RON: 'lei', ILS: '₪',
  MYR: 'RM', IDR: 'Rp', PHP: '₱', TWD: 'NT$', PKR: '₨', EGP: '£',
  MAD: 'MAD', DZD: 'DA', TND: 'DT', KES: 'Ksh', NGN: '₦', GHS: 'GH₵',
}

export async function findCurrencyCode(cityName: string): Promise<string> {
  const stored = await lookupStoredPlaceByCity(cityName)
  if (stored?.countryCode) {
    const countryMatch = citiesData.find((c) => c.countryCode.toLowerCase() === stored.countryCode?.toLowerCase())
    if (countryMatch?.currencyCode) return countryMatch.currencyCode
  }

  const normalized = cityName.toLowerCase().trim()
  const match = citiesData.find((c) => c.name.toLowerCase() === normalized)
  return match?.currencyCode ?? 'USD'
}

export async function fetchCurrency(targetCurrency: string, budget: number): Promise<CurrencyResult> {
  if (targetCurrency === 'USD') {
    return { rate: 1, targetCurrency: 'USD', targetSymbol: '$', budgetInLocal: budget }
  }

  const key = process.env.EXCHANGE_RATE_API_KEY
  if (!key) throw new Error('EXCHANGE_RATE_API_KEY_MISSING')

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${key}/pair/USD/${targetCurrency}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error(`ExchangeRate API error: ${res.status}`)

  const data = await res.json()
  if (data.result !== 'success') throw new Error('ExchangeRate API failed')

  const rate = data.conversion_rate as number
  return {
    rate,
    targetCurrency,
    targetSymbol: CURRENCY_SYMBOLS[targetCurrency] ?? targetCurrency,
    budgetInLocal: Math.round(budget * rate),
  }
}
