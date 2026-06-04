'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--beige)' }}>
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-black mb-2" style={{ color: '#1A1A1A' }}>Algo salió mal</h2>
        <p className="text-sm mb-6" style={{ color: '#6B6260' }}>Hubo un error al cargar esta página.</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #B8860B, #96700A)', color: '#fff' }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
