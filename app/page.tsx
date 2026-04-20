import SearchForm from '@/components/SearchForm'
import { Shield, Plane, Bot, DollarSign } from 'lucide-react'

const FEATURES = [
  { icon: Shield, label: 'Visa Check', desc: 'Instant visa requirements' },
  { icon: Plane, label: 'Live Flights', desc: 'Real-time Google Flights' },
  { icon: Bot, label: 'AI Concierge', desc: 'Powered by Llama 3.3' },
  { icon: DollarSign, label: 'Cost Estimate', desc: 'Full trip budget breakdown' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16">
        {/* Animated SVG plane */}
        <svg
          className="absolute top-1/4 left-0 right-0 w-full opacity-20 pointer-events-none"
          height="60"
          viewBox="0 0 800 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="plane-path"
            d="M0 40 Q200 10 400 35 Q600 55 800 20"
            stroke="#e94560"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        <div className="text-center px-6 mb-8 relative z-10">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Plan your
            <br />
            <span style={{ color: '#e94560' }}>perfect trip.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-lg mx-auto">
            Flights, visa, hotels, weather, and an AI travel concierge — all in one place.
          </p>
        </div>

        {/* Search card floating over hero */}
        <div className="w-full max-w-2xl mx-auto px-4 relative z-10">
          <SearchForm />
        </div>
      </section>

      {/* Feature strip */}
      <section className="py-16 px-6" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(233, 69, 96, 0.1)' }}
              >
                <Icon size={22} strokeWidth={1.5} style={{ color: '#e94560' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
