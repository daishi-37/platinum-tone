'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Episode = {
  id: number
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  published_at: string
}

function BacktalkListContent() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Episode[]>('/members/podcast').then(setEpisodes).finally(() => setLoading(false))
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
      <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Members</p>
      <h1 className="text-2xl font-bold text-text-main mb-2">声優登竜門 裏トーク</h1>
      <p className="text-text-sub text-sm mb-10">会員限定の動画コンテンツをお届けします。</p>

      {episodes.length === 0 ? (
        <p className="text-text-sub">動画を準備中です。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/members/podcast/${ep.slug}`}
              className="card overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="h-40 bg-section-bg flex items-center justify-center overflow-hidden relative">
                {ep.thumbnail_url ? (
                  <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">🎬</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl ml-1">▶</span>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-text-sub mb-2">
                  {new Date(ep.published_at).toLocaleDateString('ja-JP')}
                </p>
                <h2 className="font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {ep.title}
                </h2>
                {ep.description && (
                  <p className="text-text-sub text-sm line-clamp-2">{ep.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default function MembersPodcastPage() {
  return (
    <RequireMember>
      <BacktalkListContent />
    </RequireMember>
  )
}
