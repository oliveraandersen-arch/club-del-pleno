'use client'
import { useEffect, useRef } from 'react'

export function StadiumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Soft floating orbs
    const orbs = Array.from({ length: 5 }, (_, i) => ({
      x: (canvas.width / 5) * i + canvas.width / 10,
      y: Math.random() * canvas.height * 0.6,
      r: 150 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15,
      hue: [40, 60, 140, 30, 50][i], // warm tones + green
      opacity: 0.06 + Math.random() * 0.04,
    }))

    let frame = 0
    let animId: number

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      orbs.forEach(orb => {
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -orb.r) orb.x = canvas.width + orb.r
        if (orb.x > canvas.width + orb.r) orb.x = -orb.r
        if (orb.y < -orb.r) orb.y = canvas.height + orb.r
        if (orb.y > canvas.height + orb.r) orb.y = -orb.r

        const pulse = Math.sin(frame * 0.015 + orb.x * 0.01) * 0.3 + 0.7
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        grad.addColorStop(0, `hsla(${orb.hue}, 55%, 72%, ${orb.opacity * pulse})`)
        grad.addColorStop(1, `hsla(${orb.hue}, 55%, 72%, 0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      frame++
      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, mixBlendMode: 'multiply' }}
    />
  )
}
