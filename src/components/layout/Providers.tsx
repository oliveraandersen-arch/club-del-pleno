'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { MusicPlayer } from '@/components/features/MusicPlayer'
import { MusicModal } from '@/components/features/MusicModal'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <MusicModal />
      <MusicPlayer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            border: '1px solid #E5DDD0',
            color: '#1A1A1A',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          },
        }}
      />
    </QueryClientProvider>
  )
}
