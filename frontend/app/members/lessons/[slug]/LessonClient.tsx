'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Hls from 'hls.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Lesson = {
  id: number
  title: string
  slug: string
  description: string | null
  hls_url?: string | null
  hls_ready: boolean
  thumbnail_url: string | null
  sort_order: number
}

/** 秒数を m:ss / h:mm:ss 形式に整形 */
function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const s = Math.floor(sec % 60)
  const m = Math.floor((sec / 60) % 60)
  const h = Math.floor(sec / 3600)
  const ss = s.toString().padStart(2, '0')
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${ss}`
  return `${m}:${ss}`
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2] as const

/** AES-HLS 動画プレーヤー（hls.js / Safariネイティブ対応・カスタムUI） */
function HlsVideoPlayer({ src, poster }: { src: string; poster: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rateIndex, setRateIndex] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 同一オリジン配信のため Cookie は自動送信されるが、念のため withCredentials を有効化
    let hls: Hls | null = null
    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true
        },
      })
      hls.loadSource(src)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari はネイティブHLS再生
      video.src = src
    }
    return () => {
      hls?.destroy()
    }
  }, [src])

  // video要素のイベントを購読してUIに反映
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTime = () => setCurrentTime(video.currentTime)
    const onMeta = () => setDuration(video.duration)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => {
      setIsPlaying(false)
      setShowControls(true)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setShowControls(true)
    }
    const onVolume = () => {
      setVolume(video.volume)
      setMuted(video.muted)
    }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('durationchange', onMeta)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('volumechange', onVolume)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('durationchange', onMeta)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('volumechange', onVolume)
    }
  }, [])

  // フルスクリーン状態を購読
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // 再生中のみコントロールを一定時間後に隠す
  const revealControls = () => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false)
    }, 2500)
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      revealControls()
    } else {
      video.pause()
    }
  }

  const skip = (delta: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), video.duration || 0)
    setCurrentTime(video.currentTime)
    revealControls()
  }

  const seek = (value: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value
    setCurrentTime(value)
  }

  const cycleRate = () => {
    const video = videoRef.current
    if (!video) return
    const next = (rateIndex + 1) % PLAYBACK_RATES.length
    video.playbackRate = PLAYBACK_RATES[next]
    setRateIndex(next)
  }

  const changeVolume = (value: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = value
    video.muted = value === 0
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      ref={containerRef}
      onMouseMove={revealControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full mb-8 overflow-hidden bg-black ${
        isFullscreen ? 'h-screen' : 'pb-[56.25%] rounded-xl'
      }`}
    >
      <video
        ref={videoRef}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onClick={togglePlay}
        poster={poster ?? undefined}
        playsInline
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* 中央の再生ボタン（停止時） */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group"
          aria-label="再生"
        >
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-black/50 group-hover:bg-primary transition-colors">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M8 5.5v13a1 1 0 001.5.87l11-6.5a1 1 0 000-1.74l-11-6.5A1 1 0 008 5.5z" />
            </svg>
          </span>
        </button>
      )}

      {/* 下部コントロールバー */}
      <div
        onClick={stop}
        className={`absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* シークバー */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full h-1.5 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #97d3c3 ${progress}%, rgba(255,255,255,0.35) ${progress}%)`,
          }}
          aria-label="再生位置"
        />

        <div className="flex items-center gap-3 mt-2 text-white">
          <button type="button" onClick={togglePlay} aria-label={isPlaying ? '一時停止' : '再生'} className="hover:text-primary transition-colors">
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13a1 1 0 001.5.87l11-6.5a1 1 0 000-1.74l-11-6.5A1 1 0 008 5.5z" />
              </svg>
            )}
          </button>

          <button type="button" onClick={() => skip(-10)} aria-label="10秒戻る" className="hover:text-primary transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 17l-5-5 5-5" />
              <path d="M18 17l-5-5 5-5" />
            </svg>
          </button>
          <button type="button" onClick={() => skip(10)} aria-label="10秒進む" className="hover:text-primary transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 17l5-5-5-5" />
              <path d="M6 17l5-5-5-5" />
            </svg>
          </button>

          {/* 音量 */}
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={toggleMute} aria-label={muted ? 'ミュート解除' : 'ミュート'} className="hover:text-primary transition-colors">
              {muted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.5 8.5a5 5 0 010 7" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-16 h-1 appearance-none rounded-full cursor-pointer hidden sm:block"
              style={{
                background: `linear-gradient(to right, #fff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.35) ${(muted ? 0 : volume) * 100}%)`,
              }}
              aria-label="音量"
            />
          </div>

          <span className="text-xs tabular-nums ml-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          <button
            type="button"
            onClick={cycleRate}
            className="px-2 py-0.5 rounded text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors tabular-nums"
            aria-label="再生速度を変更"
          >
            {PLAYBACK_RATES[rateIndex]}倍速
          </button>

          <button type="button" onClick={toggleFullscreen} aria-label="全画面表示" className="hover:text-primary transition-colors">
            {isFullscreen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function LessonContent() {
  const [slug, setSlug] = useState('')
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parts = window.location.pathname.replace(/\/$/, '').split('/')
    setSlug(parts[parts.length - 1])
  }, [])

  useEffect(() => {
    if (!slug || slug === '_') return
    setLoading(true)
    apiRequest<Lesson>(`/members/lessons/${slug}`)
      .then(setLesson)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lesson) return <p className="p-8 text-text-sub">動画が見つかりません。</p>

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/members/lessons" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← レッスン一覧へ戻る
      </Link>

      <p className="text-xs text-text-sub mb-1">第 {lesson.sort_order} 回</p>
      <h1 className="text-2xl font-bold text-text-main mb-6">{lesson.title}</h1>

      {lesson.hls_ready && lesson.hls_url ? (
        <HlsVideoPlayer src={lesson.hls_url} poster={lesson.thumbnail_url} />
      ) : (
        <p className="text-text-sub mb-6">動画を準備中です。</p>
      )}

      {lesson.description && (
        <div className="card p-6 prose prose-sm max-w-none text-text-main leading-relaxed">
          <h2 className="font-bold text-text-main mb-3 not-prose">このレッスンについて</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{lesson.description}</ReactMarkdown>
        </div>
      )}
    </main>
  )
}

export default function LessonClient() {
  return (
    <RequireMember>
      <LessonContent />
    </RequireMember>
  )
}
