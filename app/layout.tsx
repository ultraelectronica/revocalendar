import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import EncryptionProvider from '@/components/EncryptionProvider'
import SpotifyProvider from '@/components/SpotifyProvider'

export const metadata: Metadata = {
  title: 'Revo | Smart Calendar & Productivity App',
  description: 'A beautiful, end-to-end encrypted calendar app with smart planning, focus timer, and Spotify integration. Plan, track, and achieve your goals securely.',
  keywords: ['calendar', 'planner', 'productivity', 'encrypted', 'focus timer', 'spotify', 'schedule', 'task management', 'privacy', 'secure'],
  authors: [{ name: 'Revo Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Revo - Plan • Track • Achieve',
    description: 'A beautiful, end-to-end encrypted calendar app with smart planning, focus timer, and Spotify integration.',
    type: 'website',
    siteName: 'Revo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revo - Smart Calendar & Productivity App',
    description: 'End-to-end encrypted calendar with focus timer and Spotify integration. Plan, track, and achieve your goals.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a12] min-h-screen antialiased">
        <AuthProvider>
          <EncryptionProvider>
            <SpotifyProvider>
        {children}
            </SpotifyProvider>
          </EncryptionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
