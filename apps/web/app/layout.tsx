import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Honeybee — Smart Pet Microchip Platform',
  description: 'Connecting pets, owners, and veterinarians through smart microchip technology.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
