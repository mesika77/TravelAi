# TravelAI — AI Travel Planner

Plan your perfect trip in seconds. TravelAI combines real-time flights, visa checks, hotels, weather, activities, currency conversion, and an AI travel concierge into a single animated results page.

Live: [travelai.up.railway.app](https://travelai.up.railway.app)

---

## Features

### Search
Three-step animated wizard:
1. **Where & when** — origin city, destination city, departure date, return date. Toggle between **Round Trip** and **One Way** (return date hidden for one-way).
2. **Who's traveling** — adults, children, budget per person (budget hidden for one-way since only flight cost is relevant).
3. **Preferences** — passport country (defaults to United States) + travel interests (Food, Culture, Nature, Nightlife, Adventure, Shopping, History, Beaches).

On submit, all params are encoded as a base64url string and used as the trip URL — fully shareable with no database.

### Flights
- Real-time results via **SerpAPI Google Flights**
- Resolves city names → IATA codes from a local airports dataset
- Round-trip and one-way support (`type=1` / `type=2`)
- Shows top 3 cheapest options: airline, stops, duration, price, times, carbon emissions
- "Book" button deep-links to Google Flights

### Visa Requirements
- Calls **Travel Buddy AI** via RapidAPI (`POST visa-requirement.p.rapidapi.com/v2/visa/check`)
- Uses ISO Alpha-2 country codes for both passport and destination
- Instantly returns "Free Movement" if passport country equals destination country (e.g. US passport → New York)
- Falls back to a local `passport-index.csv` dataset if API is unavailable
- Displays: Visa Free, eVisa, Visa on Arrival, Visa Required, Free Movement

### Hotels
- Fetches hotel listings and nightly rates from **Xotelo**
- Shows name, star rating, and price range per night
- Not shown in the cost estimate for one-way trips (return date unknown)

### Activities
- Single **SerpAPI Google Maps** search with all selected interest categories combined
- Up to 20 results categorised by keyword matching on place type/name
- Displayed per category, collapsed to 3 items — "Show all N" button to expand
- Note shown: results may skew toward popular categories
- Links each place to Google Maps

### Weather
- **Round trip:** historical weather for the exact trip dates (same period last year via Open-Meteo archive API — free, no key needed)
- **One way:** full-month weather for the departure month (e.g. picking May 15 → shows all of May)
- Interactive temperature chart (recharts AreaChart), avg high/low, % rainy days

### Cost Estimate
- **Round trip:** cheapest flight + hotel avg nightly rate × nights + daily costs (food, transport, activities) × nights × travelers
- **One way:** one-way flight total only, with a note that return is unknown
- Daily cost data sourced from a local `daily-costs.json` (100 destinations)

### Currency
- Live exchange rate via **ExchangeRate API**
- Detects destination currency from local city data
- Shows budget in local currency + quick reference table ($50 / $100 / $200 / $500)

### AI Concierge
- Floating chat button bottom-right → slide-up panel
- Powered by **Groq** (`llama-3.3-70b-versatile`) with full trip context injected via system prompt
- Streaming responses, full conversation history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4 + CSS variables |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Playfair Display + DM Sans (Google Fonts) |
| AI | Groq SDK |

---

## Setup

### 1. Clone & install
```bash
git clone https://github.com/mesika77/TravelAi.git
cd TravelAi
npm install
```

### 2. Environment variables
Create `.env.local` in the project root:

```env
# Required for flights, activities
SERPAPI_KEY=your_serpapi_key

# Required for visa checks (RapidAPI key subscribed to Travel Buddy AI)
VISA_API_KEY=your_rapidapi_key

# Required for AI concierge
GROQ_API_KEY=your_groq_key

# Required for currency conversion
EXCHANGE_RATE_API_KEY=your_exchangerate_key
```

Where to get keys:
- **SerpAPI** — [serpapi.com](https://serpapi.com) (flights + activities)
- **Visa API** — [rapidapi.com/TravelBuddyAI/api/visa-requirement](https://rapidapi.com/TravelBuddyAI/api/visa-requirement)
- **Groq** — [console.groq.com](https://console.groq.com)
- **ExchangeRate** — [exchangerate-api.com](https://www.exchangerate-api.com)

### 3. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  layout.tsx                  Nav, fonts, dark mode toggle
  page.tsx                    Landing page (hero + search form)
  globals.css                 CSS variables, light + dark theme
  trip/[id]/page.tsx          Results page (decodes params, renders sections)
  api/
    flights/route.ts          SerpAPI Google Flights
    visa/route.ts             Travel Buddy AI (RapidAPI)
    hotels/route.ts           Xotelo
    weather/route.ts          Open-Meteo archive
    activities/route.ts       SerpAPI Google Maps
    currency/route.ts         ExchangeRate API
    chat/route.ts             Groq streaming

components/
  SearchForm.tsx              3-step wizard with one-way toggle
  FlightCard.tsx              Flight results
  VisaBadge.tsx               Visa status display
  HotelCard.tsx               Hotel listings
  TripCostSummary.tsx         Cost breakdown (one-way aware)
  WeatherWidget.tsx           Temperature chart (monthly for one-way)
  ActivityCard.tsx            Per-category activities with expand
  CurrencyWidget.tsx          Exchange rate + budget conversion
  ChatBot.tsx                 Floating AI concierge panel
  TripContextProvider.tsx     Shares trip params across all components
  CityAutocomplete.tsx        City search with airport filtering

lib/
  serpapi.ts                  Google Flights fetch + IATA lookup
  visa.ts                     Visa check with same-country detection + CSV fallback
  xotelo.ts                   Hotel fetch
  weather.ts                  Open-Meteo archive fetch
  foursquare.ts               Google Maps activities fetch (via SerpAPI)
  currency.ts                 ExchangeRate fetch
  encode.ts                   Base64url encode/decode for trip params
  ratelimit.ts                In-memory rate limiter (60 req/hour per IP)
  types.ts                    Shared TypeScript interfaces

public/data/
  airports.json               ~300 airports (city, country, IATA, name)
  cities.json                 ~500 cities (name, country, countryCode, lat, lon, currency)
  passport-index.csv          Visa requirements by passport + destination (fallback)
  daily-costs.json            Daily costs for 100 destinations (food, transport, activities)
```

---

## API Routes

All routes validate required params (400 on missing), catch external errors (500 on failure), and apply a 60 req/hour in-memory rate limit per IP.

| Route | External Service | Notes |
|---|---|---|
| `GET /api/flights` | SerpAPI Google Flights | Supports `oneWay=true` |
| `GET /api/visa` | Travel Buddy AI (RapidAPI) | Falls back to local CSV |
| `GET /api/hotels` | Xotelo | Skipped for one-way in cost summary |
| `GET /api/weather` | Open-Meteo archive | No API key needed |
| `GET /api/activities` | SerpAPI Google Maps | Single call, keyword categorisation |
| `GET /api/currency` | ExchangeRate API | Cached 5 minutes |
| `POST /api/chat` | Groq | Streaming, trip context in system prompt |

---

## One-Way vs Round-Trip

| Feature | Round Trip | One Way |
|---|---|---|
| Return date | Required | Hidden |
| Budget field | Shown | Hidden |
| Flights | Round-trip results | One-way results |
| Weather | Exact trip dates | Full departure month |
| Cost estimate | Flights + hotels + daily costs | Flight only |
| Hotels | Shown | Shown |
| Visa | Shown | Shown |
| Activities | Shown | Shown |
| Currency | Shown | Shown |
