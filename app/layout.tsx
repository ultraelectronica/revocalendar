import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FSVT Calendar',
  description: 'A modern, feature-rich calendar application with event management capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black">{children}</body>
    </html>
  )
}

