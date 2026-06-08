'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Hls from 'hls.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Lesson = {
  id: number
  title: string
  slug: string
  description: string | null
  hls_url?: string | null
  hls_ready: boolean
  thumbnail_url: string | null
  sort_order: number
}

/** AES-HLS 動画プレーヤー（hls.js / Safariネイティブ対応） */
function HlsVideoPlayer({ src, poster }: { src: string; poster: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // 同一オリジン配信のため Cookie は自動送信されるが、念のため withCredentials を有効化
    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          xhr.withCredentials = true
        },
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari はネイティブHLS再生
      video.src = src
    }
  }, [src])

  return (
    <div className="relative w-full pb-[56.25%] mb-8 rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        poster={poster ?? undefined}
        playsInline
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}

function LessonContent() {
  const [slug, setSlug] = useState('')
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parts = window.location.pathname.replace(/\/$/, '').split('/')
    setSlug(parts[parts.length - 1])
  }, [])

  useEffect(() => {
    if (!slug || slug === '_') return
    setLoading(true)
    apiRequest<Lesson>(`/members/lessons/${slug}`)
      .then(setLesson)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lesson) return <p className="p-8 text-text-sub">動画が見つかりません。</p>

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/members/lessons" className="text-sm text-text-sub hover:text-primary transition-colors mb-6 inline-block">
        ← レッスン一覧へ戻る
      </Link>

      <p className="text-xs text-text-sub mb-1">第 {lesson.sort_order} 回</p>
      <h1 className="text-2xl font-bold text-text-main mb-6">{lesson.title}</h1>

      {lesson.hls_ready && lesson.hls_url ? (
        <HlsVideoPlayer src={lesson.hls_url} poster={lesson.thumbnail_url} />
      ) : (
        <p className="text-text-sub mb-6">動画を準備中です。</p>
      )}

      {lesson.description && (
        <div className="card p-6 prose prose-sm max-w-none text-text-main leading-relaxed">
          <h2 className="font-bold text-text-main mb-3 not-prose">このレッスンについて</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{lesson.description}</ReactMarkdown>
        </div>
      )}
    </main>
  )
}

export default function LessonClient() {
  return (
    <RequireMember>
      <LessonContent />
    </RequireMember>
  )
}
