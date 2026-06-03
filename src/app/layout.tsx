import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Club del Pleno — Prode Mundial 2026',
  description: 'Donde los verdaderos expertos predicen el Mundial. Competí con amigos en el prode más completo del fútbol.',
  keywords: ['prode', 'mundial', 'fútbol', 'predicciones', 'FIFA', 'World Cup 2026'],
  openGraph: {
    title: 'Club del Pleno',
    description: 'Donde los verdaderos expertos predicen el Mundial.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAF7F2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
