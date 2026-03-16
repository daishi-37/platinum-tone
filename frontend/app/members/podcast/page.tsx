'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Episode = {
  id: number
  episode_number: number
  title: string
  description: string
  duration_seconds: number
  thumbnail_url: string | null
  published_at: string
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function PodcastContent() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Episode[]>('/members/podcast')
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
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-text-main mb-2">会員限定 Podcast</h1>
      <p className="text-text-sub text-sm mb-8">声優業界の裏話・マインドセット</p>

      {episodes.length === 0 ? (
        <p className="text-text-sub">エピソードを準備中です。</p>
      ) : (
        <div className="space-y-4">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/members/podcast/${ep.id}`}
              className="card p-5 flex items-center gap-5 hover:shadow-md transition-shadow group"
            >
              <div className="w-14 h-14 bg-sidebar-bg/10 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">
                🎙️
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-sub mb-1">EP.{ep.episode_number}</p>
                <h2 className="font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">
                  {ep.title}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-sub">
                  <span>🕐 {formatDuration(ep.duration_seconds)}</span>
                  <span>{new Date(ep.published_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>

              <span className="text-text-sub text-xl flex-shrink-0">›</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default function PodcastPage() {
  return (
    <RequireMember>
      <PodcastContent />
    </RequireMember>
  )
}
