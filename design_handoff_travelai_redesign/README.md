# Handoff: TravelAI Redesign

## Overview

A full visual redesign of **TravelAI** — the AI-powered travel planner that composes flights, visa checks, hotels, weather, activities, currency, and an AI concierge onto a single animated results page. The redesign replaces the existing coral/navy/Playfair aesthetic with an **editorial travel-magazine direction**: warm paper palette, Fraunces serif display, tight grid, sunset accent, generous whitespace.

Two primary surfaces are redesigned:
1. **Landing page** (`app/page.tsx`) — hero + 3-step search wizard + "what arrives" grid + in-season destinations + footer
2. **Trip results page** (`app/trip/[id]/page.tsx`) — sticky trip bar, trip header, main column (flights, hotels, activities), side column (visa, cost, weather, currency), floating concierge

Plus the **Chatbot** panel and a new **Tweaks** panel (can be omitted in production — it was for this design exploration).

---

## About the Design Files

The files in `design_reference/` are **design references created in HTML + inline React (Babel)**. They are prototypes that show the intended look, hierarchy, and behavior — **not production code to copy directly**.

The task is to **recreate these designs in the TravelAI Next.js codebase** using its established stack:

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + CSS variables
- Framer Motion (animation)
- Recharts (weather chart)
- lucide-react (icons)
- `next/font/google` (fonts)
- Existing server/client component split on `/trip/[id]`
- Existing API routes remain unchanged

Lift the exact tokens (colors, typography, spacing, radii), the component structure, the layout grids, and the copy — but implement them idiomatically as TSX components with Tailwind classes and CSS variables in `app/globals.css`.

---

## Fidelity

**High-fidelity (hifi).** All colors, typography, spacing, and interactions are final. The developer should recreate the UI pixel-perfectly. Destination imagery uses labeled striped placeholders — these should be replaced with real photography (Unsplash by destination name is fine; see Assets).

---

## Design Tokens

Replace the current contents of `app/globals.css` with this token set. Everything else in the app already references these vars.

### Colors — Light mode (`:root`)

```css
--ink:          #1a1814;   /* primary text, primary button */
--ink-2:        #2e2a24;   /* button hover */
--ink-3:        #5a544a;   /* secondary text */
--ink-4:        #8b8478;   /* tertiary text, meta */

--paper:        #faf7f1;   /* page background */
--paper-2:      #f3efe6;   /* subtle section background */
--paper-3:      #eae4d6;   /* photo placeholder bg, marks */

--line:         #d9d2bf;   /* strong borders */
--line-soft:    #e8e2d1;   /* card borders, dividers */

--accent:       oklch(62% 0.18 38);   /* sunset orange — primary accent */
--accent-2:     oklch(55% 0.20 28);
--accent-soft:  oklch(92% 0.04 45);

--go:           oklch(58% 0.12 150); /* visa-free green */
--caution:      oklch(72% 0.14 85);  /* visa-on-arrival */
--stop:         oklch(58% 0.18 25);  /* visa-required */
```

### Colors — Dark mode (`[data-theme="dark"]` on `<html>`)

```css
--ink:          #f2ede2;
--ink-2:        #d8d1c2;
--ink-3:        #9d9685;
--ink-4:        #6b6556;
--paper:        #17150f;
--paper-2:      #1f1c14;
--paper-3:      #2a2619;
--line:         #342f22;
--line-soft:    #2a2619;
--accent-soft:  oklch(32% 0.08 45 / 0.35);
```

> The current app uses class-based dark mode (`dark` class on `<html>`). Either switch to `data-theme="dark"` attribute, or alias the new tokens inside the existing `.dark { ... }` block.

### Typography

```
Display  — "Fraunces" (Google Fonts)     — weights 300, 400, 500, 600; supports italic
Body     — "Inter" (Google Fonts)        — weights 400, 500, 600
Mono     — "JetBrains Mono" (Google)     — weights 400, 500
```

Replace `Playfair_Display` + `DM_Sans` in `app/layout.tsx` with `Fraunces` + `Inter` + `JetBrains_Mono` via `next/font/google`.

**Base type rules:**
- Body default: Inter 15px / 1.5 / letter-spacing -0.005em
- All `h1–h4` and `.serif`: Fraunces 400, letter-spacing -0.022em, line-height 1.05
- `.mono`: JetBrains Mono, 0.76em of parent, `text-transform: uppercase`, letter-spacing 0
- Italic `<em>` inside serif headings uses the accent color at certain places (hero title, trip title) — see copy below.

**Display scale:**
- Hero title: `clamp(54px, 7vw, 96px)`
- Trip title: `clamp(56px, 6vw, 86px)`
- Section title (Flights/Hotels/Activities): 42px serif
- Card titles (hotel name, activity name): 22px serif
- Numeric displays (flight price, cost total): tabular-nums

### Spacing & Radius

```
--r:      14px    /* default buttons, chips, cards */
--r-lg:   20px    /* large cards, searchform, hero photo */
--r-sm:   8px     /* photo placeholders, small marks */
```

Standard section padding: 60–100px vertical, 40px horizontal (24px on mobile).
Grid max-width: 1280px (`.wrap`) or 1120px (`.wrap-narrow`).

### Shadows

- Searchform: `0 30px 80px -30px rgba(0,0,0,.12)`
- Chatbot panel: `0 30px 60px rgba(0,0,0,.2)`
- Chat FAB / tweaks panel: `0 12–20px 30–60px rgba(0,0,0,.12–.18)`
- Hero stamp: `0 10px 30px rgba(0,0,0,.06)`

### Iconography

Use `lucide-react` at `size={14–18}`, `strokeWidth={1.5}`. The design prototype re-draws them inline in `design_reference/components/icons.jsx` — in the real app, import from `lucide-react` directly:
`Plane, Shield, Building2 (Hotel), Cloud, Compass, CircleDollarSign (Coin), Sparkles, MessageSquare, ArrowRight, ArrowLeft, Moon, Sun, Plus, Minus, Check, ExternalLink, Leaf, SlidersHorizontal, Users, Wallet, Globe, X, Send`.

---

## Screens / Views

### 1. Landing Page (`app/page.tsx`)

**Purpose:** Entry point. User lands, reads the pitch, and completes the 3-step trip wizard.

**Layout (top to bottom):**
1. **Nav** (sticky, 68px) — full-width, blurred paper background, brand left, nav links + tweaks/theme icons right.
2. **Hero section** (`.hero.hero-gradient`, padding 60/40) — two-column grid `1.3fr 1fr`, gap 60px, min-height 560px:
   - **Left:** eyebrow (`№ 026 · Spring edition · 2026`), huge serif title `A trip, carefully planned in sixty seconds.` (italic "carefully" in accent), 480px sub-description, three-column meta row (Powered by: Llama 3.3 / Live data: 7 services / Plans built: 184,302).
   - **Right:** destination photo placeholder 4/5 aspect ratio, with a rotated (-3deg) passport-stamp card absolutely positioned at bottom-left overflowing the photo: `Boarding · 2026` / `Lisbon` (italic serif 28) / `38.72°N / 9.13°W`.
3. **Marquee row** — `Flights · Visa · Hotels · Weather · Activities · Currency · Concierge` in uppercase mono, animates `translateX(0 → -50%)` over 40s linear infinite.
4. **Search section** (100px top, 80px bottom) — header `Three questions. One perfect itinerary.` (44px serif) + the `SearchForm` card (see component spec below).
5. **"What arrives" grid** — `border-top: 1px solid --line-soft`, 4-column grid with 1px borders between cells. Each cell padding 32×28, min-height 220, icon (accent color), 24px serif title, 13px muted description. Items numbered 01–07 (eyebrow mono top-left).
6. **In-season destinations strip** — `--paper-2` background, 4-col grid of destination cards (3/4 photo + city / country / temp / "from $642 →" in accent). Cards lift on hover (translateY -4px).
7. **Footer** — `1.5fr 2fr` grid: brand column left, 3 link columns right (Product / Built with / Source). Bottom mono row with © and version.

**Copy to use:**
- Hero title line 1: `A trip,`
- Hero title line 2: `<em>carefully</em> planned` (em = italic accent-colored)
- Hero title line 3: `in sixty seconds.`
- Hero sub: `Real-time flights, visa checks, hotels, weather, things to do, and an AI concierge who's read every guidebook — composed into a single shareable page.`
- What arrives items (01–07 + title + desc): see `design_reference/components/landing.jsx` for the exact seven entries.

### 2. SearchForm (`components/SearchForm.tsx` — replaces existing)

**Purpose:** 3-step wizard that encodes params and navigates to `/trip/[id]`. Same state shape as existing (`origin, destination, departureDate, returnDate, oneWay, adults, children, budget, passport, interests`).

**Container:** `.searchform` — paper background, 1px `--line` border, `--r-lg` radius, padding 36×40, big drop shadow (see Shadows).

**Header (shared across steps):**
- Left: horizontal dot progression (`h-6px`, filled dot = 44×6, future dot = 8×6), background = `--ink` when filled or current, `--line` when future; completed dots use `opacity: 0.4`.
- Right: `Step N / 3` in mono.

**Step 1 — "Where & when"**
- Row 1: eyebrow `01 — Itinerary` + h2 `Where & when.` (38px serif) on the left; `Round trip` / `One way` pill-toggle on the right. Pill toggle: white container, 1px line border, active pill = `--ink` background, white text.
- Row 2: two-column `From` / `To` underlined inputs. Input style: no top/left/right border, 1px `--line` bottom border, 24px Fraunces, placeholder italic in `--ink-4`. On focus: bottom border becomes `--ink`.
- Row 3: `Departure` (and `Return` unless one-way) — same underlined `input[type=date]` style.
- Footer: `Press next or ↵` in mono on left, primary button `Continue →` on right. Disabled until required fields filled.

**Step 2 — "Who's coming along?"**
- Eyebrow `02 — Party`, h2 `Who's coming along?`.
- Two stepper rows (Adults / Children): 20px gap, minus/plus 32px round-bordered buttons flanking a 28px Fraunces tabular number, with a `--line` bottom border.
- Budget row (hidden when `oneWay`): label `Budget per person · USD`, underlined number input, small mono hint `Includes flight, stay, and daily spend`.
- Footer: ghost `← Back` + primary `Continue →`.

**Step 3 — "Tell us what you love."**
- Passport `<select>` styled like an underlined input (chevron SVG data-URI on the right).
- Interests: 8 pill chips (Food / Culture / Nature / Nightlife / Adventure / Shopping / History / Beaches). Chip: 10×16 padding, 1px `--line`, 999 radius, 13px. Hover: border `--ink-3`. Selected: `--ink` background, `--paper` text, optional 5×5 paper-colored dot left of label.
- Footer: ghost `← Back` + primary `Plan my trip →`. Disabled until ≥1 interest selected.

**Animation:** each step's root div gets `animation: fadeUp .55s ease both` (opacity 0→1, translateY 14→0). Keep existing Framer Motion AnimatePresence slide-x transitions if you prefer — either works.

### 3. Trip Results (`app/trip/[id]/page.tsx`)

**Purpose:** Full trip details. Sticky trip bar, big title, then main + sidebar grid.

**Layout:**
1. **Trip bar** (sticky, top: 68px, 54px tall, blurred paper background, bottom border):
   - Left group: `From` mono label + `New York` (20px serif) + accent arrow + `Lisbon` (20px serif).
   - Middle mono: `May 12 – May 19, 2026 · 2 travelers · 7 nights`.
   - Right: `← NEW SEARCH` as `btn-link` (mono, border-bottom-1, uppercase 11px).
2. **Trip header** (60/50 padding) — `1.4fr 1fr` grid, gap 60px:
   - Left: eyebrow `Your itinerary · LIS—26—052`, huge serif trip title `Seven nights in <em>Lisbon</em>.` (italic accent). 460px max-width description. 3 chips row (`Food / Culture / Beaches`) in bordered mono pills.
   - Right: square photo placeholder labeled `Lisbon · rooftops at golden hour`, `--r-lg` radius.
3. **Grid** (`1.6fr 1fr`, gap 40, padding 20/40/100):
   - **Main column (`.trip-main`, gap 70):** FlightsSection → HotelsSection → ActivitiesSection.
   - **Side column (`.trip-side`, gap 24, sticky top: 140):** VisaSection → CostSection (ink card) → WeatherSection → CurrencySection.
4. **Floating Chatbot FAB** (fixed bottom-right, 56×56 ink circle with Sparkles icon).

**Section anatomy (`section-head`):** large sections share a header: eyebrow-style `kicker` (mono 11px `01 · Outbound`), h2 title 42px serif, right-aligned muted mono meta (`3 of 47 results · sorted by price`). Bottom 1px `--line-soft` border.

#### 3a. FlightsSection

- **Route summary card:** paper-2 bg, 1px line-soft border, padding 22/26. Grid: `auto 1fr auto auto auto` — `JFK` (32px serif tabular) + muted city / animated dashed line with plane icon in accent / `LIS` / `Out / May 12` / `Back / May 19`.
- **Flight rows:** 6-column grid `1.3fr .8fr 1fr .8fr .7fr .9fr`, gap 18, padding 20/22, 1px line-soft border, `--r` radius. Hover: border `--ink-4`, bg `--paper-2`.
- Columns: airline block (36×36 ink-on-paper mark with initials in italic serif + airline name + mono flight code) / departure time (22 serif tabular) + airport mono / duration indicator (mono duration top + 1px horizontal rule with dots at both ends + mono stops) / arrival time / CO₂ (leaf icon + `580kg` mono) / price (26 serif) + mono `BOOK ↗` btn-link.
- Cheapest row gets `.flight-row-best` — `--ink` border, with a ribbon absolutely positioned `top: -10, left: 22` (ink background, paper text, mono 9px, 4px radius, padding 3×10) reading `BEST VALUE`.

#### 3b. HotelsSection

- 3-column grid of hotel cards. Card: 1px line-soft border, `--r` radius, overflow hidden, paper bg.
- Card anatomy: 4/3 photo placeholder (no radius, flush to card), body padding 18. Body = neighborhood mono muted, 22 serif name, stars row (filled accent `★` + 25%-opacity remaining `★`, tracking 2px), 1px hr, then footer row `Per night / $210–$280` + `VIEW ↗` btn-link.

#### 3c. ActivitiesSection

- Header: kicker `03 · Things to do`, section title `Activities`, right: `Matched to your interests · via Google Maps`.
- For each category (Food / Culture / Beaches):
  - Category head (`.act-cat-head`): 22 serif category name left, `SHOW ALL N` btn-link right (toggles to `SHOW LESS`). Bottom 1px dashed `--line` divider.
  - Items (`.act-item`, border-bottom 1px line-soft): index in mono (`01`, `02` — min-width 28), center name (15/500) + mono type (`Food hall` / `UNESCO site` / `Windswept coast · 40 min`), right rating (18 serif tabular `4.6` + mono muted `42k`).
  - First 3 shown until expanded.
- Footer italic mono: `Note: results may skew toward popular categories.`

#### 3d. VisaSection (`.sec-sm`)

Small card, 1px line-soft, `--r-lg`, padding 22. Head: kicker `Visa` + Shield icon right.
Body: pill badge `Visa free` with 8×8 `--go` dot. 22 serif sentence `US passport holders enter Portugal visa-free for up to 90 days.` with `90 days` in tabular. HR. Two-col meta (Passport 🇺🇸 United States / Destination 🇵🇹 Portugal). `EMBASSY SOURCE ↗` btn-link.

Color pills per visa type: `free → --go`, `on_arrival → --caution`, `required → --stop`, `evisa → --info`, `free_movement → teal`.

#### 3e. CostSection (`.sec-sm.card-ink`) — the hero card of the sidebar

Ink background, paper text, --r-lg radius. Kicker `Estimate` at top. Massive total `$4,434` in 56 serif tabular with tight line-height. Mono sub `Total · 2 travelers · 7 nights`.
HR (paper-at-22%-opacity). Three breakdown rows: `Flights / $642 × 2 / $1,284`, `Hotels / $270 × 7 × 2 / $1,890`, `Daily · food, transit, play / $90 × 7 × 2 / $1,260`. Each row has name+sub on left, tabular amount right, divider between.

One-way variant: show only `Flights` row + italic note `Return date unknown — only flight cost shown.`

#### 3f. WeatherSection (`.sec-sm`)

Kicker `Weather` + Cloud icon. Top row: big 44 serif `22°/14°` (low in 22 muted), mono `Avg high/low · °C`. Right aligned: `18%` (28 serif) + mono `Rainy days`.
Chart: 7-column grid, 120px tall, bars align to bottom. Each day has a 10px-wide stack — accent-colored high bar (`height = high/30*100%`), lighter accent low bar in front. When `rain > 30%`, a small 6×6 `--ink-3` circle floats 10px above the bars. Mono day labels underneath.
Footer italic mono: `Historical · same week, 2025 · Open-Meteo`.

**Real implementation:** keep recharts AreaChart if you prefer, but the bar-stack is lighter and more editorial.

#### 3g. CurrencySection (`.sec-sm`)

Kicker `Currency` + Coin icon. Two-col top row: left `1 USD / €0.92` (36 serif tabular); right aligned `Your budget / €2,208` (24 serif).
HR. Two-column grid of reference rows: `$50 → €46`, `$100 → €92`, `$200 → €184`, `$500 → €460`. Each row has mono `$X` left, serif tabular `€Y` right, dashed bottom border.

### 4. Chatbot (`components/ChatBot.tsx`)

**FAB:** fixed bottom-right, 56px circle, ink bg, paper text, Sparkles icon, hover scales to 1.06.

**Panel:** fixed bottom-right 28/28, 400×560 (max 80vh), `--r-lg`, big shadow, paper bg, 1px line border, `overflow: hidden`, `display: flex column`.
- Header (16/18 padding): 32px ink circle with Sparkles, `Concierge` (18 serif), mono muted `Llama 3.3 · trip context loaded`, close icon-btn right.
- Body: flex-1 overflow-y auto, 18 padding, gap 14. Messages: AI = left, avatar `AI` (26 round accent-soft bg) + paper-2 bubble with `--line-soft` border, 12/14 radius 14. User = right (`margin-left: auto`), ink bg + paper text.
- Input row: 14 padding, top 1px line-soft border. Input = paper-2 bg, line-soft border, 999 radius, 10/16 padding. Send button = 36px ink circle with Send icon.

Wire to your existing `/api/chat` (Groq streaming) — append assistant tokens as they arrive.

### 5. Nav (replace layout's Nav)

- Height 68, sticky top 0, paper-at-80% bg + blur 16, bottom 1px line-soft.
- Brand left: 30px dark circle with italic serif `T` + `Travel<em>AI</em>` (italic accent on `AI`).
- Right: `Plan` / `Results` / `Guides` text links (13px ink-3, hover ink), Tweaks icon-btn (SlidersHorizontal) + theme toggle icon-btn (Moon/Sun). Icon buttons are 36px round with `--line` border, color `--ink-3`.

---

## Interactions & Behavior

- **Theme toggle** — toggles `data-theme="dark"` on `<html>`, persists to `localStorage.travelai-theme`. Transition background/color over .35s.
- **SearchForm steps** — fade-up on step change, or keep existing Framer Motion x-slide AnimatePresence. Next/Back disabled when required fields missing (same canNext0/canNext1/canSubmit logic as existing).
- **Round Trip / One Way toggle** — when one-way, hide Return date in step 1 and Budget in step 2. Pass `oneWay: boolean` through encoded params.
- **Activity category expand** — `SHOW ALL N` button flips `expanded[cat]` to show all items; label toggles to `SHOW LESS`. Items collapse back to 3.
- **Chatbot open/close** — FAB → panel mounts with `transform: translateY(20) scale(.96) → translateY(0) scale(1)` opacity 0→1 over .25s ease.
- **Flight row** — hover lifts border to `--ink-4`, background to `--paper-2`. Book button opens Google Flights deep-link in new tab.
- **Marquee** — pure CSS animation, 40s linear infinite, duplicates content to avoid seam.
- **Destination cards** — hover translates `.dest-photo` up 4px over .3s.
- **Hover timing** — all default .2s ease; cards .3s; theme swap .35s.
- **Shimmer / loading state** — reuse existing `.shimmer` keyframe (linear-gradient with animated background-position). Swap in skeleton rectangles of the right shape for each section while fetching.

---

## State Management

No structural change. Each results-page section stays an independent client component with its own `fetch → loading → result/error` lifecycle. `TripContextProvider` remains. All existing API routes unchanged.

Add for theming and tweak persistence:
```
localStorage.travelai-theme   // "light" | "dark"
```

The design-time Tweaks panel (accent/density/radius/hero) is **not** needed in production — drop it.

---

## Responsive Behavior

Breakpoint: `max-width: 960px` (single-column mobile/tablet).

- `.wrap` padding → 24px
- Hero grid → single column, gap 40
- Trip grid → single column (sidebar stacks below main)
- Trip header → single column
- `.what-grid` and `.dest-grid` → 2 columns
- `.hotel-grid` → 1 column
- `.flight-row` → 2 columns with row-gap 12 (stack times/duration/price into 3 rows)
- `.chat-panel` → `width: calc(100vw - 24px)`, right/bottom 12

---

## Assets

### Photography
All photo placeholders (hero, destinations, hotels, trip hero) are labeled striped boxes. For production, replace with:
- **Unsplash by destination name** (e.g., `source.unsplash.com/1200x1500/?lisbon,rooftops`) — free, fast to ship.
- Or curated editorial photography per destination.
- Aspect ratios: hero 4/5, trip hero 1/1, destination cards 3/4, hotel cards 4/3.

### Icons
`lucide-react` (already in your deps) — see icon list in Design Tokens above.

### Fonts
`next/font/google` — Fraunces, Inter, JetBrains Mono. Replace Playfair + DM Sans imports in `app/layout.tsx`.

### Flags
Use native emoji (🇺🇸 🇵🇹) as in the prototype, or `react-country-flag` for consistency across OSes.

---

## Implementation Order (suggested)

1. Swap fonts and CSS variables in `app/globals.css` + `app/layout.tsx` — whole app inherits new look immediately.
2. Rebuild `Nav` in layout.
3. Rebuild `SearchForm.tsx` — same state shape, new markup.
4. Rebuild landing `app/page.tsx` — hero + search + what-arrives grid + in-season strip + footer.
5. Rebuild `app/trip/[id]/page.tsx` — trip bar, trip header, two-column grid.
6. Rebuild each section component (`FlightCard → FlightsSection`, `HotelCard → HotelsSection`, etc.) — wire existing fetch hooks into the new layouts.
7. Rebuild `ChatBot.tsx`.
8. QA dark mode across all surfaces. Sanity-check mobile breakpoint.
9. Replace photo placeholders with real images.

---

## Files in this handoff

```
design_handoff_travelai_redesign/
  README.md                              ← this file
  design_reference/
    TravelAI.html                        ← full working prototype (open in browser)
    styles.css                           ← all design tokens + component CSS
    app.jsx                              ← React root / view switching / tweaks wiring
    components/
      icons.jsx                          ← inline Lucide-equivalent SVG icons
      nav.jsx                            ← top nav
      search_form.jsx                    ← 3-step wizard
      landing.jsx                        ← hero + sections + footer
      results_sections.jsx               ← all 7 trip sections (mock data included)
      results.jsx                        ← trip bar + header + grid layout
      chatbot.jsx                        ← concierge FAB + panel
      tweaks.jsx                         ← design-time tweaks (NOT for production)
```

Open `design_reference/TravelAI.html` in a browser to interact with the full prototype. Click **Results** in the nav to see the trip page.
