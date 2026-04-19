# TravelAI — Design Spec
**Date:** 2026-04-19  
**Status:** Approved

---

## Overview

TravelAI is a full-stack travel planning web app built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Framer Motion. It takes a user's trip parameters (origin, destination, dates, travelers, budget, passport country, interests) and returns real-time flights, visa status, hotels, weather, activities, currency conversion, and an AI chat concierge — all on a single animated results page.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS + CSS variables for theming
- **Animation:** Framer Motion
- **Package manager:** npm
- **Fonts:** Playfair Display (headings), DM Sans (body) via `next/font/google`
- **Icons:** lucide-react (size 18, strokeWidth 1.5)
- **Charts:** recharts (AreaChart for weather)
- **CSV parsing:** papaparse
- **Dark mode:** next-themes (`dark` class on `<html>`)

---

## Architecture

### URL Scheme
Search params (origin, destination, dates, travelers, budget, passport, interests) are serialized to JSON and encoded as a base64url string, used as the trip `[id]`. This makes result pages fully shareable/bookmarkable with no database required.

### Page Structure
```
/                   Landing page — hero + 3-step search form
/trip/[id]          Results page — decodes params, renders all sections
```

### Data Fetching Strategy — Hybrid (Option C)
- `/trip/[id]/page.tsx` is a **Server Component** that decodes the ID and passes params as props to `TripContextProvider`
- `TripContextProvider` is a `"use client"` component that sets `TripContext` and renders the full results shell (sticky top bar, two-column layout grid)
- Seven **independent client components** each manage their own `fetch → skeleton → result/error` lifecycle, firing their respective API routes on mount in parallel
- No server-side data fetching on the results page — instant shell render, sections fill in as APIs respond
- ChatBot reads trip params from `TripContext`

### Project Structure
```
app/
  layout.tsx                    fonts, ThemeProvider, nav
  page.tsx                      landing page
  globals.css                   CSS variables, light + dark
  trip/[id]/
    page.tsx                    server component, decodes params, renders TripContextProvider
  api/
    flights/route.ts
    visa/route.ts
    hotels/route.ts
    weather/route.ts
    activities/route.ts
    currency/route.ts
    chat/route.ts
components/
  SearchForm.tsx
  FlightCard.tsx
  VisaBadge.tsx
  HotelCard.tsx
  TripCostSummary.tsx
  WeatherWidget.tsx
  ActivityCard.tsx
  ChatBot.tsx
  AnimatedLayout.tsx
  TripContextProvider.tsx       "use client" — provides TripContext to results page subtree
lib/
  serpapi.ts
  visa.ts
  xotelo.ts
  weather.ts
  foursquare.ts
  currency.ts
  groq.ts
public/data/
  airports.json                 300 airports: city, country, iata, name
  cities.json                   500 cities: name, country, countryCode, lat, lon, currency, currencyCode
  passport-index.csv            tidy passport index (fallback for visa API)
  daily-costs.json              100 destinations: food, transport, activities, total per day
.env.local                      user-filled (gitignored)
.env.example                    committed to git
```

---

## Features

### 1. Search Form (Homepage)
Three-step animated wizard with progress dots indicator:
- **Step 1:** Origin city + Destination city + Departure date + Return date
- **Step 2:** Travelers (adults/children) + Budget per person (USD)
- **Step 3:** Passport country + Travel interests (multi-select: food, culture, nature, nightlife, adventure, shopping, history, beaches)

On submit: encodes params as base64url → navigates to `/trip/[id]`.

Animation: `AnimatePresence` with x-slide transitions (exit left, enter right per step).

### 2. Flights — SerpApi Google Flights
- Resolves city names → IATA codes from `airports.json`
- Calls `GET https://serpapi.com/search?engine=google_flights&...`
- Parses `best_flights` and `other_flights` arrays
- Shows top 3 cheapest as `FlightCard` components
- Card fields: airline, duration, stops, price, departure/arrival times, carbon emissions (if available)
- "Book" button: Google Flights deep-link via `booking_token`

### 3. Visa Check — Travel Buddy API
- Calls `GET https://api.travel-buddy.ai/v2/visa/check?passport={ISO2}&destination={ISO2}`
- Result displayed as colored `VisaBadge`:
  - Visa Free → green
  - eVisa → blue
  - Visa Required → orange
  - Visa on Arrival → yellow
  - Free Movement → teal
- Shows max stay duration + official source link if returned
- **Fallback:** parses `passport-index.csv` with papaparse if API fails

### 4. Hotels / Cost Estimate — Xotelo
- List: `GET https://data.xotelo.com/api/list?location={city}&limit=5`
- Rates: `GET https://data.xotelo.com/api/rates?hotel_key={key}&chk_in={date}&chk_out={date}`
- Shows 3 `HotelCard` components: name, rating, price range
- `TripCostSummary`: cheapest flight + (avg nightly rate × nights) + (daily costs × nights × travelers) from `daily-costs.json`

### 5. Weather — Open-Meteo (no API key)
- Resolves city → lat/lon from `cities.json`
- `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean&forecast_days=7&timezone=auto`
- Renders 7-day recharts AreaChart
- Summary: avg high/low + rain chance

### 6. Activities — Foursquare Places API
- `GET https://api.foursquare.com/v3/places/search?ll={lat},{lon}&categories={ids}&limit=9&radius=10000`
- Header: `Authorization: Bearer {FOURSQUARE_API_KEY}`
- Interest → category ID map:
  - food→13000, culture→10000, nature→16000, nightlife→10032
  - adventure→16000, shopping→17000, history→16020, beaches→16019
- Cards grouped by interest: name, category, address, distance, rating
- "View on Maps" → Google Maps search URL

### 7. Currency — ExchangeRate API
- `GET https://v6.exchangerate-api.com/v6/{key}/pair/USD/{targetCurrency}`
- Detects destination currency from `cities.json` (currencyCode field)
- Shows budget in local currency
- Quick reference table: $50 / $100 / $200 / $500

### 8. AI Chatbot — Groq
- Model: `llama-3.3-70b-versatile`
- Floating button bottom-right → slide-up panel (400px tall)
- System prompt injected server-side with full trip context
- Groq streaming API → `ReadableStream` response to client
- Full conversation history in React state
- 3-dot animated typing indicator while streaming

---

## API Routes

All routes:
- Validate required params → `400 { error }` if missing
- `try/catch` all external calls → `500 { error }` on failure (never expose raw errors)
- `/api/weather` and `/api/currency`: `Cache-Control: s-maxage=300`

| Route | Method | External API |
|---|---|---|
| `/api/flights` | GET | SerpApi Google Flights |
| `/api/visa` | GET | Travel Buddy |
| `/api/hotels` | GET | Xotelo |
| `/api/weather` | GET | Open-Meteo |
| `/api/activities` | GET | Foursquare |
| `/api/currency` | GET | ExchangeRate |
| `/api/chat` | POST | Groq (streaming) |

---

## Design System

### CSS Variables
**Light mode:**
```css
--primary: #1a1a2e
--accent: #e94560
--accent-2: #f5a623
--surface: #ffffff
--surface-2: #f8f7f4
--text: #1a1a2e
--text-muted: #6b7280
--border: #e5e2da
--success: #22c55e
--warning: #f59e0b
--info: #3b82f6
```

**Dark mode (`.dark`):**
```css
--primary: #f8f7f4
--surface: #0f0f1a
--surface-2: #1a1a2e
--text: #f8f7f4
--text-muted: #9ca3af
--border: #2a2a3e
```

### Component Tokens
- **Cards:** `rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6`
- **Primary CTA:** `rounded-full bg-[var(--accent)] text-white px-8 py-3 hover:brightness-110`
- **Secondary button:** `rounded-lg border bg-transparent hover:bg-[var(--surface-2)]`
- **Inputs:** `rounded-xl border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] p-3`
- **All interactive elements:** `transition-all duration-200`

### Framer Motion Animations
- **Page sections:** stagger fade-up (`y: 24→0`, `opacity: 0→1`, 0.08s delay increments per section)
- **Cards:** `whileHover` scale 1.02 + shadow lift, spring stiffness 300
- **Search form steps:** `AnimatePresence` x-slide (exit left, enter right)
- **Chat panel:** `AnimatePresence` y-slide from bottom, spring damping 25
- **Visa badge:** scale 0→1 spring on mount
- **Skeletons:** CSS shimmer via `background-position` animation

---

## Homepage Layout
1. **Nav:** logo left, dark mode toggle right, fixed, transparent → `backdrop-blur` on scroll
2. **Hero:** full viewport height, deep navy CSS animated gradient mesh, Playfair Display h1 "Plan your perfect trip.", DM Sans subtitle, SVG plane drawing itself via `stroke-dashoffset` animation
3. **Search card:** centered, `max-w-2xl`, white card floating over hero bottom, 3-step wizard
4. **Feature strip:** 4 icons — Visa Check, Live Flights, AI Concierge, Cost Estimate
5. **Footer:** minimal, GitHub link

## Results Page Layout
- **Sticky top bar:** origin → destination, dates, travelers count, "New Search" link
- **Desktop:** 60/40 two-column grid
  - Left (60%): Flights, Hotels, Activities
  - Right (40%): Visa badge, Cost summary, Weather, Currency
- **Mobile:** single column stack
- **Floating chat button:** fixed bottom-right, opens slide-up panel
- **Chat panel:** trip summary at top, messages, input at bottom

---

## Static Data Files

| File | Contents |
|---|---|
| `airports.json` | 300 airports: `{ city, country, iata, name }` |
| `cities.json` | 500 cities: `{ name, country, countryCode, lat, lon, currency, currencyCode }` |
| `passport-index.csv` | Passport index tidy CSV (visa requirements by passport+destination) |
| `daily-costs.json` | 100 destinations: `{ food, transport, activities, total }` per day in USD |

---

## Error States
- **API failure:** friendly card, human-readable message, retry button
- **Missing API key:** setup card showing exact env var name + where to obtain it
- **No results:** SVG empty state + suggestion text
- **Loading:** shimmer skeletons matching real content shape
- **Offline:** top toast notification

---

## Environment Variables

```
GROQ_API_KEY=
VISA_API_KEY=
SERPAPI_KEY=
FOURSQUARE_API_KEY=
EXCHANGE_RATE_API_KEY=
```

---

## Build Order
1. `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` (with Next.js 15)
2. Install dependencies
3. `globals.css` — CSS variables, light + dark
4. Generate all 4 static data files in `/public/data/`
5. `layout.tsx` — fonts, ThemeProvider, nav
6. `page.tsx` + `SearchForm.tsx` — homepage
7. All 7 API routes
8. `/trip/[id]/page.tsx` + TripContext + all result components
9. `ChatBot.tsx` — depends on TripContext
10. Commit + push to `main`
