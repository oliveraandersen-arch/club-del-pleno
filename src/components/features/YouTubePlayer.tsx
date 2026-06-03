'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  videoId: string
  autoplay?: boolean
  onReady?: () => void
}

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YouTubePlayerInstance
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubePlayerInstance {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  setVolume(v: number): void
  getPlayerState(): number
  destroy(): void
}

export function useYouTubePlayer(videoId: string, autoplay = false) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayerInstance | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!videoId) return

    function initPlayer() {
      if (!containerRef.current || !window.YT?.Player) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 0,
        },
        events: {
          onReady: () => {
            setReady(true)
            if (autoplay) {
              playerRef.current?.setVolume(70)
              playerRef.current?.playVideo()
              setPlaying(true)
            }
          },
          onStateChange: (e: { data: number }) => {
            setPlaying(e.data === 1)
          },
        },
      })
    }

    if (window.YT?.Player) {
      initPlayer()
    } else {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      playerRef.current?.destroy()
    }
  }, [videoId, autoplay])

  function togglePlay() {
    if (!playerRef.current) return
    if (playing) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  function setVolume(v: number) {
    playerRef.current?.setVolume(v)
  }

  return { containerRef, ready, playing, togglePlay, setVolume }
}
