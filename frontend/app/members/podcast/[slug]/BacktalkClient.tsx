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
  vimeo_url: string
  published_at: string
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)(?:\/([a-f0-9]+))?/)
  if (!match) return ''
  return match[2]
    ? `https://player.vimeo.com/video/${match[1]}?h=${match[2]}`
    : `https://player.vimeo.com/video/${match[1]}`
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

  if (!episode) return <p className="p-8 text-text-sub">動画が見つかりません。</p>

  const embedUrl = getVimeoEmbedUrl(episode.vimeo_url)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/members/podcast" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← 声優登竜門 裏トーク 一覧へ
      </Link>

      <p className="text-xs text-text-sub mb-2">
        {new Date(episode.published_at).toLocaleDateString('ja-JP')}
      </p>
      <h1 className="text-2xl font-bold text-text-main mb-6">{episode.title}</h1>

      {embedUrl ? (
        <div className="rounded-xl overflow-hidden bg-black aspect-video mb-6">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="text-text-sub mb-6">動画を読み込めませんでした。</p>
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
