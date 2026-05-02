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

export default function PodcastDetailClient() {
  const [episode, setEpisode] = useState<VoicedoorEpisode | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const parts = window.location.pathname.replace(/\/$/, '').split('/')
    const id = parts[parts.length - 1]
    if (!id || id === '_') return

    apiRequest<VoicedoorEpisode>(`/voicedoor/${id}`)
      .then(setEpisode)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !episode) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-text-sub">エピソードが見つかりません。</p>
        <Link href="/podcast/" className="text-primary text-sm mt-4 inline-block hover:underline">← 一覧に戻る</Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link href="/podcast/" className="text-text-sub text-sm hover:text-text-main transition-colors">← 声優登竜門 一覧</Link>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-text-main mb-4">{episode.title}</h1>

        <iframe
          src={getEmbedUrl(episode.apple_podcast_url)}
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          height="175"
          style={{ width: '100%', overflow: 'hidden', borderRadius: 10, border: 'none' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        />

        {episode.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-text-sub mb-3">エピソードについて</h2>
            <p className="text-text-main text-sm whitespace-pre-line leading-relaxed">{episode.description}</p>
          </div>
        )}
      </div>
    </main>
  )
}
