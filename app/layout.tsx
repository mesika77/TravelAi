import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import Nav from '@/components/Nav'
import ClientRuntime from '@/components/ClientRuntime'
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

export const metadata: Metadata = {
  metadataBase: new URL('https://travelai.up.railway.app'),
  title: 'TravelAI — Plan your perfect trip',
  description: 'AI-powered travel planning with real-time flights, visa checks, hotels, weather, and a personal travel concierge.',
  applicationName: 'TravelAI',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TravelAI',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f1' },
    { media: '(prefers-color-scheme: dark)', color: '#17150f' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <ClientRuntime />
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
