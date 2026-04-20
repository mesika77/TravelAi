'use client'

import { createContext, useContext } from 'react'
import type { TripParams } from '@/lib/types'

interface TripContextValue {
  params: TripParams
  nights: number
}

const TripContext = createContext<TripContextValue | null>(null)

export function useTripContext() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTripContext must be used within TripContextProvider')
  return ctx
}

export function TripContextProvider({
  params,
  nights,
  children,
}: {
  params: TripParams
  nights: number
  children: React.ReactNode
}) {
  return (
    <TripContext.Provider value={{ params, nights }}>
      {children}
    </TripContext.Provider>
  )
}
