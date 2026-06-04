export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--beige)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl animate-spin" style={{ animationDuration: '1s' }}>⚽</div>
        <p className="text-sm font-medium" style={{ color: '#B8860B' }}>Cargando...</p>
      </div>
    </div>
  )
}
