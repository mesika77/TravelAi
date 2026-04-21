'use client'

import { Playfair_Display, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Plane } from 'lucide-react'
import Link from 'next/link'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
})

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-[var(--surface)]/80 border-b border-[var(--border)]' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ fontFamily: 'var(--font-playfair)' }}>
          <Plane size={20} style={{ color: 'var(--accent)' }} />
          <span style={{ color: scrolled ? 'var(--text)' : 'white' }}>TravelAI</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    setDark(html.classList.contains('dark'))
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light')
  }

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
      style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
    </button>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') document.documentElement.classList.add('dark')
  }, [])

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <title>TravelAI — Plan your perfect trip</title>
        <meta name="description" content="AI-powered travel planning with real-time flights, visa checks, hotels, weather, and a personal travel concierge." />
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <a
              href="https://github.com/maormesika/TravelAi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-all duration-200"
            >
              GitHub
            </a>
            <span className="mx-2">·</span>
            <span>TravelAI © {new Date().getFullYear()}</span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
