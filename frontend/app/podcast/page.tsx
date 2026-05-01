'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'

type PodcastFile = {
  filename: string
  episode_number: number
  label: string
  stream_url: string
}

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<PodcastFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<PodcastFile[]>('/podcast/files')
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
          <h1 className="text-2xl font-bold text-text-main">Podcast</h1>
        </div>
        <p className="text-text-sub text-sm">声優業界の裏話・マインドセットをお届けします</p>
      </div>

      {episodes.length === 0 ? (
        <p className="text-text-sub">エピソードを準備中です。</p>
      ) : (
        <div className="space-y-5">
          {episodes.map((ep) => (
            <div key={ep.filename} className="card overflow-hidden">
              {/* エピソードヘッダー */}
              <div className="flex items-center gap-4 px-6 pt-5 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">{ep.label}</span>
                </div>
                <div>
                  <p className="text-xs text-text-sub">エピソード {ep.episode_number}</p>
                  <p className="font-semibold text-text-main text-sm">仙台エリ・優希比呂</p>
                </div>
              </div>

              {/* オーディオプレイヤー */}
              <div className="px-6 pb-5">
                <audio
                  controls
                  controlsList="nodownload"
                  className="w-full h-10"
                  src={ep.stream_url}
                  preload="none"
                >
                  お使いのブラウザはオーディオ再生に対応していません。
                </audio>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
