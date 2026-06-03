'use client'
import { Navbar } from './Navbar'
import { StadiumBackground } from '@/components/features/StadiumBackground'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <StadiumBackground />
      <Navbar />
      <main className="pt-16 relative z-10">
        {children}
      </main>
    </div>
  )
}
