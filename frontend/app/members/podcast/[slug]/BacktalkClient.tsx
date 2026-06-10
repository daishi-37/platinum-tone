'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Hls from 'hls.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Episode = {
  id: number
  title: string
  slug: string
  description: string | null
  hls_url?: string | null
  hls_ready: boolean
  thumbnail_url: string | null
  published_at: string
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

/** AES-HLS 音声プレーヤー（hls.js / Safariネイティブ対応・カスタムUI） */
function HlsAudioPlayer({ src, poster }: { src: string; poster: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rateIndex, setRateIndex] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // 同一オリジン配信のため Cookie は自動送信されるが、念のため withCredentials を有効化
    let hls: Hls | null = null
    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true
        },
      })
      hls.loadSource(src)
      hls.attachMedia(audio)
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari はネイティブHLS再生
      audio.src = src
    }
    return () => {
      hls?.destroy()
    }
  }, [src])

  // audio要素のイベントを購読してUIに反映
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('durationchange', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('durationchange', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  const skip = (delta: number) => {
    const audio = audioRef.current
    if (!audio) return
    const next = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration || 0)
    audio.currentTime = next
    setCurrentTime(next)
  }

  const seek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
  }

  const cycleRate = () => {
    const audio = audioRef.current
    if (!audio) return
    const next = (rateIndex + 1) % PLAYBACK_RATES.length
    audio.playbackRate = PLAYBACK_RATES[next]
    setRateIndex(next)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="rounded-xl overflow-hidden bg-section-bg mb-6 p-6">
      {poster && (
        <img src={poster} alt="" className="w-full max-w-sm aspect-square object-cover rounded-lg mb-4 mx-auto" />
      )}
      <audio
        ref={audioRef}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        className="hidden"
      />

      {/* シークバー */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={(e) => seek(Number(e.target.value))}
        className="w-full h-1.5 appearance-none rounded-full cursor-pointer bg-white/40"
        style={{
          background: `linear-gradient(to right, #97d3c3 ${progress}%, rgba(255,255,255,0.4) ${progress}%)`,
        }}
        aria-label="再生位置"
      />
      <div className="flex justify-between text-xs text-text-sub mt-1.5 tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* コントロール */}
      <div className="flex items-center justify-center gap-5 mt-4">
        <button
          type="button"
          onClick={() => skip(-10)}
          className="flex flex-col items-center text-text-sub hover:text-primary transition-colors"
          aria-label="10秒戻る"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 17l-5-5 5-5" />
            <path d="M18 17l-5-5 5-5" />
          </svg>
          <span className="text-[10px] mt-0.5">10秒</span>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white transition-colors shadow"
          aria-label={isPlaying ? '一時停止' : '再生'}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 001.5.87l11-6.5a1 1 0 000-1.74l-11-6.5A1 1 0 008 5.5z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(10)}
          className="flex flex-col items-center text-text-sub hover:text-primary transition-colors"
          aria-label="10秒進む"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 17l5-5-5-5" />
            <path d="M6 17l5-5-5-5" />
          </svg>
          <span className="text-[10px] mt-0.5">10秒</span>
        </button>
      </div>

      {/* 再生速度 */}
      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={cycleRate}
          className="px-3 py-1 rounded-full text-xs font-semibold text-text-main bg-white/60 hover:bg-white transition-colors tabular-nums"
          aria-label="再生速度を変更"
        >
          {PLAYBACK_RATES[rateIndex]}倍速
        </button>
      </div>
    </div>
  )
}

function BacktalkDetailContent() {
  const [slug, setSlug] = useState('')
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parts = window.location.pathname.replace(/\/$/, '').split('/')
    setSlug(parts[parts.length - 1])
  }, [])

  useEffect(() => {
    if (!slug || slug === '_') return
    setLoading(true)
    apiRequest<Episode>(`/members/podcast/${slug}`)
      .then(setEpisode)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!episode) return <p className="p-8 text-text-sub">コンテンツが見つかりません。</p>

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/members/podcast" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← 声優登竜門 backstage 一覧へ
      </Link>

      <p className="text-xs text-text-sub mb-2">
        {new Date(episode.published_at).toLocaleDateString('ja-JP')}
      </p>
      <h1 className="text-2xl font-bold text-text-main mb-6">{episode.title}</h1>

      {episode.hls_ready && episode.hls_url ? (
        <HlsAudioPlayer src={episode.hls_url} poster={episode.thumbnail_url} />
      ) : (
        <p className="text-text-sub mb-6">音声を準備中です。</p>
      )}

      {episode.description && (
        <div className="card p-6 prose prose-sm max-w-none text-text-main leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{episode.description}</ReactMarkdown>
        </div>
      )}
    </main>
  )
}

export default function BacktalkClient() {
  return (
    <RequireMember>
      <BacktalkDetailContent />
    </RequireMember>
  )
}
