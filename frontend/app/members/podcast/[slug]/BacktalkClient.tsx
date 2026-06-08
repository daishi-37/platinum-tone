'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Hls from 'hls.js'
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

/** AES-HLS 音声プレーヤー（hls.js / Safariネイティブ対応） */
function HlsAudioPlayer({ src, poster }: { src: string; poster: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // 同一オリジン配信のため Cookie は自動送信されるが、念のため withCredentials を有効化
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true
        },
      })
      hls.loadSource(src)
      hls.attachMedia(audio)
      return () => hls.destroy()
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari はネイティブHLS再生
      audio.src = src
    }
  }, [src])

  return (
    <div className="rounded-xl overflow-hidden bg-section-bg mb-6 p-6">
      {poster && (
        <img src={poster} alt="" className="w-full max-h-72 object-cover rounded-lg mb-4" />
      )}
      <audio
        ref={audioRef}
        controls
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        className="w-full"
      />
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
        ← 声優登竜門 バックステージ 一覧へ
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
        <div className="card p-6 text-text-main text-sm leading-relaxed whitespace-pre-wrap">
          {episode.description}
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
