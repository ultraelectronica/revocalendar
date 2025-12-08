import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Revo | Plan • Track • Achieve',
  description: 'A beautiful, feature-rich calendar application with event management, notes, and smart planning tools.',
  keywords: ['calendar', 'planner', 'events', 'productivity', 'schedule'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
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
        {children}
      </body>
    </html>
  )
}
