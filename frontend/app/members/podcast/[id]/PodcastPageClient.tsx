'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Episode = {
  id: number
  episode_number: number
  title: string
  description: string
  duration_seconds: number
  audio_stream_url: string
  published_at: string
}

function PodcastEpisodeContent() {
  const { id } = useParams<{ id: string }>()
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Episode>(`/members/podcast/${id}`)
      .then(setEpisode)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!episode) return <p className="p-8 text-text-sub">エピソードが見つかりません。</p>

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">

      <Link href="/members/podcast" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← Podcast 一覧へ戻る
      </Link>

      <p className="text-xs text-text-sub mb-1">EP.{episode.episode_number}</p>
      <h1 className="text-2xl font-bold text-text-main mb-6">{episode.title}</h1>

      {/* オーディオプレイヤー（ダウンロード禁止） */}
      <div className="card p-6 mb-8">
        <audio
          controls
          controlsList="nodownload"
          className="w-full"
          src={episode.audio_stream_url}
        >
          お使いのブラウザはオーディオ再生に対応していません。
        </audio>
        <p className="text-xs text-text-sub mt-3">
          {new Date(episode.published_at).toLocaleDateString('ja-JP')} 公開
        </p>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-text-main mb-3">エピソードについて</h2>
        <p className="text-text-sub text-sm leading-relaxed">{episode.description}</p>
      </div>

    </main>
  )
}

export default function PodcastPageClient() {
  return (
    <RequireMember>
      <PodcastEpisodeContent />
    </RequireMember>
  )
}
