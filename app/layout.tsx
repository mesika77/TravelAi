'use client'

import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import { useEffect, useState } from 'react'
import { Moon, Sun, Sparkles } from 'lucide-react'
import Link from 'next/link'
import './globals.css'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

function Nav() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    const isDark = html.classList.contains('dark')
    setDark(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  return (
    <header className="nav">
      <Link href="/" className="nav-brand">
        <div className="nav-brand-mark">T</div>
        Travel<em style={{ color: 'var(--accent)' }}>AI</em>
      </Link>
      <div className="nav-right">
        <Link href="/" className="nav-link" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Plan</Link>
        <button
          onClick={toggle}
          className="icon-btn"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') document.documentElement.classList.add('dark')
  }, [])

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <title>TravelAI — Plan your perfect trip</title>
        <meta name="description" content="AI-powered travel planning with real-time flights, visa checks, hotels, weather, and a personal travel concierge." />
      </head>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
