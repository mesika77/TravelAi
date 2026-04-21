'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Users, Wallet, Globe, ChevronRight, ChevronLeft } from 'lucide-react'
import { encodeTripId } from '@/lib/encode'
import type { TripParams } from '@/lib/types'
import CityAutocomplete from './CityAutocomplete'

const INTERESTS = [
  { id: 'food', label: '🍽 Food' },
  { id: 'culture', label: '🎭 Culture' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'nightlife', label: '🎶 Nightlife' },
  { id: 'adventure', label: '🧗 Adventure' },
  { id: 'shopping', label: '🛍 Shopping' },
  { id: 'history', label: '🏛 History' },
  { id: 'beaches', label: '🏖 Beaches' },
]

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IL', name: 'Israel' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
  { code: 'AE', name: 'UAE' },
]

export default function SearchForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [oneWay, setOneWay] = useState(false)
  const [form, setForm] = useState<Partial<TripParams>>({
    adults: 1,
    children: 0,
    budget: 2000,
    interests: [],
  })

  const set = (key: keyof TripParams, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }))

  const toggleInterest = (id: string) => {
    const current = form.interests ?? []
    set('interests', current.includes(id) ? current.filter((i) => i !== id) : [...current, id])
  }

  const handleSubmit = () => {
    const params: TripParams = {
      origin: form.origin ?? '',
      destination: form.destination ?? '',
      departureDate: form.departureDate ?? '',
      returnDate: oneWay ? (form.departureDate ?? '') : (form.returnDate ?? ''),
      oneWay,
      adults: form.adults ?? 1,
      children: form.children ?? 0,
      budget: form.budget ?? 2000,
      passport: form.passport ?? 'US',
      interests: form.interests ?? [],
    }
    const id = encodeTripId(params)
    router.push(`/trip/${id}`)
  }

  const canNext0 = form.origin && form.destination && form.departureDate && (oneWay || form.returnDate)
  const canNext1 = (form.adults ?? 0) > 0 && (oneWay || (form.budget ?? 0) > 0)
  const canSubmit = canNext1 && form.passport && (form.interests?.length ?? 0) > 0

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  const [dir, setDir] = useState(1)
  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  return (
    <div
      className="rounded-2xl shadow-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === step ? '2rem' : '0.5rem',
              background: i === step ? 'var(--accent)' : i < step ? 'var(--accent)' : 'var(--border)',
              opacity: i < step ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      <div className="p-6 overflow-hidden" style={{ minHeight: '320px' }}>
        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div
              key="step0"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Plane size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                  <span className="font-semibold text-lg" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
                    Where are you going?
                  </span>
                </div>
                <div className="flex items-center rounded-lg overflow-hidden text-xs font-medium" style={{ border: '1px solid var(--border)' }}>
                  {['Round Trip', 'One Way'].map((label) => {
                    const isOne = label === 'One Way'
                    const active = oneWay === isOne
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setOneWay(isOne)}
                        className="px-3 py-1.5 transition-all duration-200"
                        style={{
                          background: active ? 'var(--accent)' : 'transparent',
                          color: active ? 'white' : 'var(--text-muted)',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CityAutocomplete
                  label="From"
                  placeholder="New York"
                  value={form.origin ?? ''}
                  onChange={(val) => set('origin', val)}
                />
                <CityAutocomplete
                  label="To"
                  placeholder="Paris"
                  value={form.destination ?? ''}
                  onChange={(val) => set('destination', val)}
                />
              </div>
              <div className={`grid gap-3 ${oneWay ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Departure</label>
                  <input
                    type="date"
                    value={form.departureDate ?? ''}
                    onChange={(e) => set('departureDate', e.target.value)}
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    className="rounded-xl border p-3 w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
                {!oneWay && (
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Return</label>
                    <input
                      type="date"
                      value={form.returnDate ?? ''}
                      onChange={(e) => set('returnDate', e.target.value)}
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      className="rounded-xl border p-3 w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => goTo(1)}
                disabled={!canNext0}
                className="flex items-center justify-center gap-2 btn-primary mt-2 disabled:opacity-40"
              >
                Next <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <span className="font-semibold text-lg" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
                  Who&apos;s traveling?
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Adults</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.adults ?? 1}
                    onChange={(e) => set('adults', parseInt(e.target.value) || 1)}
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    className="rounded-xl border p-3 w-full transition-all duration-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Children</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={form.children ?? 0}
                    onChange={(e) => set('children', parseInt(e.target.value) || 0)}
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    className="rounded-xl border p-3 w-full transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>
              {!oneWay && (
                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Wallet size={14} strokeWidth={1.5} /> Budget per person (USD)
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={form.budget ?? 2000}
                    onChange={(e) => set('budget', parseInt(e.target.value))}
                    style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    className="rounded-xl border p-3 w-full transition-all duration-200 focus:outline-none"
                  />
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={() => goTo(0)} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft size={18} strokeWidth={1.5} /> Back
                </button>
                <button
                  onClick={() => goTo(2)}
                  disabled={!canNext1}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Next <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Globe size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <span className="font-semibold text-lg" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--text)' }}>
                  Your preferences
                </span>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Passport Country</label>
                <select
                  value={form.passport ?? 'US'}
                  onChange={(e) => set('passport', e.target.value)}
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  className="rounded-xl border p-3 w-full transition-all duration-200 focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
                  Travel Interests (pick at least one)
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const selected = form.interests?.includes(interest.id)
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className="px-3 py-1.5 rounded-full text-sm transition-all duration-200 font-medium"
                        style={{
                          background: selected ? 'var(--accent)' : 'var(--surface-2)',
                          color: selected ? 'white' : 'var(--text)',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        {interest.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => goTo(1)} className="btn-secondary flex items-center gap-1">
                  <ChevronLeft size={18} strokeWidth={1.5} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Plan My Trip <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
