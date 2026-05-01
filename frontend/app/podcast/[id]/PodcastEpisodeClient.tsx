'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import { useAuth, isSubscribed } from '@/lib/auth-context'

type Episode = {
  id: number
  episode_number: number
  title: string
  description: string
  duration_seconds: number
  published_at: string
}

export default function PodcastEpisodeClient() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Episode>(`/podcast/${id}`)
      .then(setEpisode)
      .finally(() => setLoading(false))
  }, [id])

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!episode) return <p className="p-8 text-text-sub">エピソードが見つかりません。</p>

  const subscribed = isSubscribed(user)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">

      <Link href="/podcast" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← Podcast 一覧へ戻る
      </Link>

      <p className="text-xs text-text-sub mb-1">EP.{episode.episode_number}</p>
      <h1 className="text-2xl font-bold text-text-main mb-6">{episode.title}</h1>

      {/* 音声プレイヤー or 入会CTA */}
      <div className="card p-6 mb-8">
        {subscribed ? (
          <>
            <audio
              controls
              controlsList="nodownload"
              className="w-full"
              src={`/api/members/podcast/${id}/stream`}
            >
              お使いのブラウザはオーディオ再生に対応していません。
            </audio>
            <p className="text-xs text-text-sub mt-3">
              {new Date(episode.published_at).toLocaleDateString('ja-JP')} 公開
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-text-main font-medium mb-2">このエピソードを聴くには会員登録が必要です</p>
            <p className="text-text-sub text-sm mb-6">月額¥9,200で全エピソードが聴き放題</p>
            <Link
              href="/register"
              className="inline-block bg-accent hover:bg-accent/80 text-white px-8 py-3 rounded-full text-sm font-bold transition-colors"
            >
              今すぐ始める
            </Link>
            <p className="text-text-sub text-xs mt-4">
              すでに会員の方は{' '}
              <Link href="/login" className="text-primary hover:underline">ログイン</Link>
            </p>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-text-main mb-3">エピソードについて</h2>
        <p className="text-text-sub text-sm leading-relaxed">{episode.description}</p>
      </div>

    </main>
  )
}
