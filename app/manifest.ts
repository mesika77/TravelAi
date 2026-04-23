import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TravelAI',
    short_name: 'TravelAI',
    description: 'AI-powered travel planning with real-time flights, visa checks, hotels, weather, and a personal travel concierge.',
    start_url: '/?source=homescreen',
    scope: '/',
    display: 'standalone',
    background_color: '#faf7f1',
    theme_color: '#faf7f1',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
