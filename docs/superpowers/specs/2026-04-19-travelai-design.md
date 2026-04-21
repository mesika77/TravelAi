# TravelAI — Design Spec
**Date:** 2026-04-19  
**Last updated:** 2026-04-21  
**Status:** Live

---

## Overview

TravelAI is a full-stack travel planning web app built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and Framer Motion. It takes a user's trip parameters (origin, destination, dates, trip type, travelers, budget, passport country, interests) and returns real-time flights, visa status, hotels, weather, activities, currency conversion, and an AI chat concierge — all on a single animated results page.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS v4 + CSS variables for theming
- **Animation:** Framer Motion
- **Package manager:** npm
- **Fonts:** Playfair Display (headings), DM Sans (body) via `next/font/google`
- **Icons:** lucide-react (size 18, strokeWidth 1.5)
- **Charts:** recharts (AreaChart for weather)
- **CSV parsing:** papaparse
- **Dark mode:** class-based (`dark` on `<html>`, toggled via localStorage)

---

## Architecture

### URL Scheme
All trip params are serialized to JSON and encoded as a base64url string used as the trip `[id]`. Result pages are fully shareable/bookmarkable with no database.

### Page Structure
```
/                   Landing page — hero + 3-step search form
/trip/[id]          Results page — decodes params, renders all sections
```

### Data Fetching Strategy
- `/trip/[id]/page.tsx` is a **Server Component** that decodes the ID and passes params to `TripContextProvider`
- `TripContextProvider` is `"use client"` — sets `TripContext` and renders the results shell
- Seven **independent client components** each manage their own `fetch → skeleton → result/error` lifecycle, firing in parallel on mount
- No server-side data fetching on the results page — instant shell render, sections fill as APIs respond

### Project Structure
```
app/
  layout.tsx                    Nav (white text over hero, normal text when scrolled), fonts, dark mode
  page.tsx                      Landing page
  globals.css                   CSS variables, light + dark
  trip/[id]/
    page.tsx                    Server component, decodes params, one-way aware nights calculation
  api/
    flights/route.ts            60 req/hour rate limit, accepts oneWay param
    visa/route.ts               Delegates to lib/visa.ts
    hotels/route.ts             60 req/hour rate limit
    weather/route.ts            30 req/hour rate limit
    activities/route.ts         30 req/hour rate limit
    currency/route.ts
    chat/route.ts
components/
  SearchForm.tsx                One-way/round-trip toggle, passport defaults to US
  FlightCard.tsx                Shows "· One Way" label when applicable
  VisaBadge.tsx
  HotelCard.tsx
  TripCostSummary.tsx           One-way shows flight only; round-trip shows full breakdown
  WeatherWidget.tsx             One-way shows monthly weather; round-trip shows trip dates
  ActivityCard.tsx              Per-category with 3-item preview + "Show all N" expand
  CurrencyWidget.tsx
  ChatBot.tsx
  TripContextProvider.tsx
  CityAutocomplete.tsx          Filters to cities with airports only
lib/
  serpapi.ts                    Google Flights + one-way support (type param)
  visa.ts                       RapidAPI POST, same-country shortcut, CSV fallback
  xotelo.ts                     Hotel listings + rates
  weather.ts                    Open-Meteo archive API (historical, no key)
  foursquare.ts                 SerpAPI Google Maps (single call, keyword categorisation)
  ratelimit.ts                  In-memory rate limiter
  encode.ts                     Base64url encode/decode
  types.ts                      Shared interfaces incl. TripParams.oneWay
public/data/
  airports.json                 ~300 airports: city, country, iata, name
  cities.json                   ~500 cities: name, country, countryCode, lat, lon, currency, currencyCode
  passport-index.csv            Visa requirements fallback dataset
  daily-costs.json              Daily costs for 100 destinations (USD)
```

---

## Features

### 1. Search Form

Three-step animated wizard (x-slide `AnimatePresence` transitions):

**Step 1 — Where & when**
- Origin + Destination city (autocomplete, filtered to cities with airports)
- Departure date
- Return date (hidden when one-way selected)
- **Round Trip / One Way toggle** (pill toggle top-right of the step)

**Step 2 — Who's traveling**
- Adults (min 1) + Children
- Budget per person in USD — **hidden for one-way trips** (irrelevant since only flight cost is estimated)

**Step 3 — Preferences**
- Passport country dropdown — defaults to United States (state initialised to `'US'`)
- Travel interests multi-select: Food, Culture, Nature, Nightlife, Adventure, Shopping, History, Beaches (min 1 required)

On submit: encodes all params (including `oneWay: boolean`) → navigates to `/trip/[id]`.

### 2. Flights — SerpAPI Google Flights

- Resolves city names → IATA codes via `airports.json`
- **Round trip:** `type=1`, includes `return_date`
- **One way:** `type=2`, omits `return_date`
- Parses `best_flights` + `other_flights`, sorts by price, shows top 3
- Card: airline, nonstop/stops badge, duration, departure→arrival times, carbon emissions, price, Book button (Google Flights deep-link)
- Header shows "· One Way" label for one-way trips
- Rate limit: 60 req/hour per IP

### 3. Visa Check — Travel Buddy AI (RapidAPI)

- **Same-country shortcut:** if passport ISO code === destination country ISO code → returns `free_movement` immediately (e.g. US passport → New York)
- Otherwise: `POST https://visa-requirement.p.rapidapi.com/v2/visa/check` with `{ passport: "IL", destination: "TH" }` (ISO Alpha-2 codes)
- Parses `data.visa_rules.primary_rule`: name → visa type, duration → max stay, `data.destination.embassy_url` → source link
- Fallback: parses `passport-index.csv` with papaparse using country names
- Display: colored pill badge (green=free, blue=eVisa, yellow=on arrival, orange=required, teal=free movement)

### 4. Hotels — Xotelo

- List: `GET https://data.xotelo.com/api/list?location={city}&limit=5`
- Rates: `GET https://data.xotelo.com/api/rates?hotel_key={key}&chk_in={date}&chk_out={date}` — parallel calls per hotel, falls back to estimate for far-future dates
- Shows 3 cards: name, star rating, price range per night
- Rate limit: 60 req/hour per IP

### 5. Weather — Open-Meteo (no API key required)

Uses the **historical archive API** (same period one year ago) since forecast only goes ~16 days:

- **Round trip:** fetches exact trip date range (shifted 1 year back)
- **One way:** fetches the full departure month (1st → last day, 1 year back). Title changes to e.g. "May Weather"

Renders recharts AreaChart: high (solid red), low (dashed blue). Summary: avg high/low °C + % rainy days.

### 6. Activities — SerpAPI Google Maps

- Single API call with all selected interests joined: `"restaurants, beaches, bars and nightlife"`
- Fetches up to 20 results from `google_maps` engine
- Each result assigned to an interest via keyword matching on `title + type + category` fields
- Unmatched results fall back to first selected interest
- Displayed grouped by interest, each category collapsed to 3 items
- "Show all N" button next to category heading to expand; "Show less" to collapse
- Note: "Results may skew toward popular categories"
- "View on Maps" → Google Maps search URL

### 7. Currency — ExchangeRate API

- `GET https://v6.exchangerate-api.com/v6/{key}/pair/USD/{targetCurrency}`
- Detects destination currency from `cities.json`
- Shows budget in local currency + quick reference table ($50 / $100 / $200 / $500)
- Cached 5 minutes

### 8. Cost Estimate

**Round trip:**
- Cheapest flight × travelers
- Avg nightly hotel rate × nights × travelers
- Daily costs (food + transport + activities) × nights × travelers from `daily-costs.json`
- Grand total

**One way:**
- One-way flight × travelers only
- Note: "Return date unknown — only flight cost shown."
- No hotel API call made

### 9. AI Concierge — Groq

- Model: `llama-3.3-70b-versatile`
- Floating button bottom-right → slide-up panel
- Full trip context injected in system prompt (origin, destination, dates, travelers, budget, interests)
- Groq streaming → `ReadableStream` to client
- Full conversation history in React state
- Animated typing indicator while streaming

---

## One-Way vs Round-Trip Behaviour

| Feature | Round Trip | One Way |
|---|---|---|
| Return date field | Shown | Hidden |
| Budget field | Shown | Hidden |
| Flights API | `type=1` + return_date | `type=2`, no return_date |
| Weather | Exact trip date range | Full departure month |
| Weather title | "Weather Forecast" | "May Weather" (month name) |
| Cost estimate | Flights + hotels + daily | Flight only |
| Hotel API call in cost | Yes | Skipped |
| Top bar | Departure – Return dates | Departure date + "One Way" |

---

## API Routes

All routes: validate required params (400), catch external errors (500), apply in-memory rate limit.

| Route | Method | External Service | Rate Limit |
|---|---|---|---|
| `/api/flights` | GET | SerpAPI Google Flights | 60/hour |
| `/api/visa` | GET | Travel Buddy AI (RapidAPI) | 30/hour |
| `/api/hotels` | GET | Xotelo | 60/hour |
| `/api/weather` | GET | Open-Meteo archive | 30/hour |
| `/api/activities` | GET | SerpAPI Google Maps | 30/hour |
| `/api/currency` | GET | ExchangeRate API | 30/hour |
| `/api/chat` | POST | Groq (streaming) | 30/hour |

---

## Design System

### CSS Variables
**Light mode:**
```css
--accent: #e94560
--surface: #ffffff
--surface-2: #f8f7f4
--text: #1a1a2e
--text-muted: #6b7280
--border: #e5e2da
--success: #22c55e
--info: #3b82f6
```

**Dark mode (`.dark`):**
```css
--surface: #0f0f1a
--surface-2: #1a1a2e
--text: #f8f7f4
--text-muted: #9ca3af
--border: #2a2a3e
```

### Nav Contrast
- When not scrolled (over dark hero): TravelAI text is **white**, backdrop transparent
- When scrolled: text uses `var(--text)`, backdrop blurs

### Cards
`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6`

### Animations
- Section cards: stagger fade-up (y: 24→0, opacity 0→1, 0.06–0.08s delay per item)
- Cards: `whileHover` scale 1.02 + shadow lift
- Search form steps: x-slide with `AnimatePresence`
- Visa badge: scale 0→1 spring on mount
- Skeletons: CSS shimmer via background-position animation

---

## Environment Variables

```env
SERPAPI_KEY=            # SerpAPI — flights + activities
VISA_API_KEY=           # RapidAPI key (Travel Buddy AI subscription)
GROQ_API_KEY=           # Groq — AI concierge
EXCHANGE_RATE_API_KEY=  # ExchangeRate API — currency
```

Note: Weather (Open-Meteo) and Hotels (Xotelo) require no API key.
