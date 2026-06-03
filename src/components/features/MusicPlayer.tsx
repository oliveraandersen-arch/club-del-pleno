'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Pause, Play, VolumeX, ChevronDown, Music } from 'lucide-react'
import { TRACKS, TrackKey } from './MusicModal'

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement | string, opts: object) => YTPlayerInstance
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}
interface YTPlayerInstance {
  playVideo(): void; pauseVideo(): void; stopVideo(): void
  setVolume(v: number): void; getPlayerState(): number; destroy(): void
}

export function MusicPlayer() {
  const { musicChoice, setMusicChoice } = useAppStore()
  const [minimized, setMinimized] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const iframeId = 'yt-music-player'

  const trackKey = musicChoice as TrackKey | null
  const track = trackKey && TRACKS[trackKey] ? TRACKS[trackKey] : null

  useEffect(() => {
    if (!track?.id || musicChoice === 'none') {
      try { playerRef.current?.stopVideo() } catch {}
      setPlaying(false)
      return
    }

    function initYT() {
      if (!window.YT?.Player) return
      try { playerRef.current?.destroy() } catch {}

      playerRef.current = new window.YT.Player(iframeId, {
        height: '0', width: '0',
        videoId: track!.id,
        playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady: (e: { target: YTPlayerInstance }) => {
            setReady(true)
            e.target.setVolume(65)
            e.target.playVideo()
            setPlaying(true)
          },
          onStateChange: (e: { data: number }) => {
            setPlaying(e.data === 1)
          },
        },
      })
    }

    if (window.YT?.Player) {
      initYT()
    } else {
      if (!document.getElementById('yt-api-script')) {
        const s = document.createElement('script')
        s.id = 'yt-api-script'
        s.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(s)
      }
      window.onYouTubeIframeAPIReady = initYT
    }

    return () => {
      try { playerRef.current?.stopVideo() } catch {}
    }
  }, [musicChoice])

  function togglePlay() {
    if (!playerRef.current) return
    if (playing) { playerRef.current.pauseVideo(); setPlaying(false) }
    else { playerRef.current.playVideo(); setPlaying(true) }
  }

  function stop() {
    try { playerRef.current?.stopVideo() } catch {}
    setPlaying(false)
    setMusicChoice('none')
  }

  return (
    <>
      <div id={iframeId} style={{ position: 'fixed', top: -9999, width: 1, height: 1, pointerEvents: 'none' }} />

      {track && musicChoice !== 'none' && (
        <AnimatePresence>
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 right-6 z-40"
          >
            {minimized ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMinimized(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold"
                style={{ background: '#FFFFFF', border: '1.5px solid #E5DDD0', color: '#B8860B' }}
              >
                <motion.div
                  animate={playing ? { rotate: 360 } : {}}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Music className="w-4 h-4" />
                </motion.div>
                {playing && (
                  <div className="flex gap-0.5 items-end h-3.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 rounded-full"
                        style={{ background: '#B8860B' }}
                        animate={{ height: ['4px', '10px', '4px'] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            ) : (
              <motion.div
                className="rounded-2xl p-4 shadow-xl min-w-[230px]"
                style={{ background: '#FFFFFF', border: '1px solid #E5DDD0' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ambiente</span>
                  <button onClick={() => setMinimized(true)}>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{track.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{track.label}</div>
                    <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={togglePlay}
                    disabled={!ready}
                    className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: playing ? '#FEF3C7' : 'rgba(184,134,11,0.1)',
                      border: `1px solid rgba(184,134,11,0.25)`,
                      color: '#B8860B',
                    }}
                  >
                    {playing
                      ? <><Pause className="w-3 h-3" />Pausar</>
                      : <><Play className="w-3 h-3" />Reproducir</>}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={stop}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #E5DDD0', color: '#9CA3AF' }}
                  >
                    <VolumeX className="w-4 h-4" />
                  </motion.button>
                </div>
                {!ready && (
                  <p className="text-xs text-center mt-2" style={{ color: '#B8860B' }}>
                    Cargando canción...
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  )
}
