'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// Canvas constellation/starfield logic from 2nd file:
type Star = { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }
type Point = { x: number; y: number }
type Constellations = Record<string, Point[]>

export default function Home() {
  const [isHovering, setIsHovering] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    function resizeCanvas() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrameId: number
    let rotation = 0

    const CONSTELLATIONS: Constellations = {
      orion: [
        { x: 0, y: -30 },
        { x: -20, y: -15 },
        { x: 20, y: -15 },
        { x: -15, y: 0 },
        { x: 0, y: 0 },
        { x: 15, y: 0 },
        { x: -25, y: 25 },
        { x: 25, y: 25 },
        { x: 0, y: 40 },
      ],
      scorpio: [
        { x: 0, y: 0 },
        { x: 20, y: -10 },
        { x: 40, y: -5 },
        { x: 60, y: 0 },
        { x: -15, y: 15 },
        { x: -25, y: 30 },
        { x: -30, y: 50 },
        { x: -20, y: 65 },
        { x: -10, y: 75 },
      ],
      leo: [
        { x: 0, y: 0 },
        { x: -20, y: -10 },
        { x: -25, y: 5 },
        { x: -15, y: 15 },
        { x: 20, y: 0 },
        { x: 40, y: -5 },
        { x: 60, y: 0 },
        { x: 50, y: 20 },
        { x: 65, y: 25 },
        { x: 75, y: 15 },
      ],
      cassiopeia: [
        { x: -40, y: 0 },
        { x: -20, y: -15 },
        { x: 0, y: 0 },
        { x: 20, y: -15 },
        { x: 40, y: 0 },
      ],
      ursa_major: [
        { x: 0, y: 0 },
        { x: 25, y: 0 },
        { x: 50, y: 5 },
        { x: 65, y: -10 },
        { x: 75, y: 10 },
        { x: 60, y: 35 },
        { x: 40, y: 40 },
      ],
      sagittarius: [
        { x: 0, y: 0 },
        { x: -20, y: 20 },
        { x: -35, y: 10 },
        { x: -40, y: -5 },
        { x: 15, y: -15 },
        { x: 20, y: 10 },
        { x: 15, y: 35 },
        { x: 0, y: 50 },
        { x: -10, y: 60 },
      ],
    }
    const constellationKeys = Object.keys(CONSTELLATIONS)

    const chosen: { name: string; position: Point }[] = []
    while (chosen.length < 3) {
      const name = constellationKeys[Math.floor(Math.random() * constellationKeys.length)]
      if (!chosen.find((c) => c.name === name)) {
        chosen.push({
          name,
          position: {
            x: Math.random() * (canvas.width - 300) + 150,
            y: Math.random() * (canvas.height - 300) + 150,
          },
        })
      }
    }

    const stars: Star[] = []
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.2 + 0.3,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.3,
      })
    }

    function drawConstellation(center: Point, pattern: Point[]) {
      const scale = 3
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < pattern.length - 1; i++) {
        ctx.beginPath()
        ctx.moveTo(center.x + pattern[i].x * scale, center.y + pattern[i].y * scale)
        ctx.lineTo(center.x + pattern[i + 1].x * scale, center.y + pattern[i + 1].y * scale)
        ctx.stroke()
      }
      pattern.forEach((point) => {
        const x = center.x + point.x * scale
        const y = center.y + point.y * scale
        ctx.fillStyle = 'rgba(150, 200, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    function drawSimpleBlackHole(centerX: number, centerY: number, radius: number) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255, 150, 50, 0.7)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.65, rotation, rotation + Math.PI * 1.2)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(255, 100, 30, 0.5)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.45, -rotation * 0.6, -rotation * 0.6 + Math.PI * 1.5)
      ctx.stroke()

      const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 0.9)
      glowGradient.addColorStop(0, 'rgba(255, 120, 40, 0.1)')
      glowGradient.addColorStop(1, 'rgba(255, 80, 20, 0)')
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2)
      ctx.fill()
    }

    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      const bgGradient = ctx.createLinearGradient(0, 0, canvas!.width, canvas!.height)


      bgGradient.addColorStop(0, '#0a0815')
      bgGradient.addColorStop(0.5, '#1a0a35')
      bgGradient.addColorStop(1, '#050810')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas!.width, canvas!.height)

      stars.forEach((star) => {
        star.x += star.speedX
        star.y += star.speedY
        if (star.x > canvas!.width) star.x = 0
        if (star.x < 0) star.x = canvas!.width
        if (star.y > canvas!.height) star.y = 0
        if (star.y < 0) star.y = canvas!.height
        ctx.fillStyle = `rgba(255,255,255,${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
      })

      chosen.forEach(({ name, position }) => drawConstellation(position, CONSTELLATIONS[name]))

      drawSimpleBlackHole(canvas!.width / 2, canvas!.height / 2, 120)
      rotation += 0.012
      animationFrameId = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Main JSX: everything from your first file, with canvas overlay
  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-purple-400 to-cyan-400 animate-pulse">
              🎓 Universe
            </h1>
            <p className="text-2xl text-cyan-300 font-light">
              MJCET's AI-Powered Student Assistant
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-slate-400 leading-relaxed">
            Your personal mentor for academics, college life, and everything in between.
            Powered by advanced AI, designed for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/login">
              <button
                className="px-8 py-3 bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Get Started
              </button>
            </Link>
            <Link href="/features">
              <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500 font-semibold rounded-lg transition-all duration-300">
                Learn More
              </button>
            </Link>
          </div>

          {/* Features teaser */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30 hover:border-cyan-500/50 transition-all">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="text-cyan-300 font-semibold">Study Assistant</h3>
              <p className="text-slate-400 text-sm">AI-powered explanations & summaries</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30 hover:border-cyan-500/50 transition-all">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="text-cyan-300 font-semibold">College Hub</h3>
              <p className="text-slate-400 text-sm">Faculty, events, announcements</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30 hover:border-cyan-500/50 transition-all">
              <div className="text-2xl mb-2">💡</div>
              <h3 className="text-cyan-300 font-semibold">Smart Chat</h3>
              <p className="text-slate-400 text-sm">Ask anything, get intelligent answers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
