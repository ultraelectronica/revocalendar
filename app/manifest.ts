import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Revo | Smart Calendar & Productivity App',
    short_name: 'Revo',
    description: 'A beautiful, end-to-end encrypted calendar app with smart planning, focus timer, and Spotify integration.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a12',
    theme_color: '#0a0a12',
    icons: [
      {
        src: '/revologo.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/revologo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/revologo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
  }
}
