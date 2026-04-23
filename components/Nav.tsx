'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'

export default function Nav() {
  const [dark, setDark] = useState(() => (
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  ))

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
        <Link
          href="/"
          className="nav-link"
          style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Plan
        </Link>
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
