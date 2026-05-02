'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'

type VoicedoorEpisode = {
  id: number
  title: string
  description: string | null
  apple_podcast_url: string
  published_at: string | null
}

function getEmbedUrl(url: string): string {
  return url.replace('podcasts.apple.com', 'embed.podcasts.apple.com')
}

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<VoicedoorEpisode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<VoicedoorEpisode[]>('/voicedoor')
      .then(setEpisodes)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">

      {/* ヘッダー */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎙️</span>
          <h1 className="text-2xl font-bold text-text-main">声優登竜門</h1>
        </div>
        <p className="text-text-sub text-sm">声優を目指すあなたへ。業界の本音をお届けします。</p>
      </div>

      {episodes.length === 0 ? (
        <p className="text-text-sub">エピソードを準備中です。</p>
      ) : (
        <div className="space-y-5">
          {episodes.map((ep) => (
            <div key={ep.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-sm font-semibold text-text-main leading-snug">{ep.title}</h2>
                <Link
                  href={`/podcast/${ep.id}/`}
                  className="text-xs text-primary hover:underline whitespace-nowrap flex-shrink-0"
                >
                  詳細を見る →
                </Link>
              </div>
              <iframe
                src={getEmbedUrl(ep.apple_podcast_url)}
                allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                height="152"
                style={{ width: '100%', overflow: 'hidden', borderRadius: 10, border: 'none' }}
                sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
