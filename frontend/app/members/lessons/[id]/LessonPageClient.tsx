'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Lesson = {
  id: number
  title: string
  description: string
  vimeo_id: string
  sort_order: number
}

function LessonContent() {
  const { id } = useParams<{ id: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Lesson>(`/members/lessons/${id}`)
      .then(setLesson)
      .finally(() => setLoading(false))
  }, [id])

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

      {/* Vimeo 埋め込み（16:9） */}
      <div className="relative w-full pb-[56.25%] mb-8 rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${lesson.vimeo_id}?color=7aaa94&title=0&byline=0&portrait=0`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-text-main mb-3">このレッスンについて</h2>
        <p className="text-text-sub text-sm leading-relaxed">{lesson.description}</p>
      </div>

    </main>
  )
}

export default function LessonPageClient() {
  return (
    <RequireMember>
      <LessonContent />
    </RequireMember>
  )
}
