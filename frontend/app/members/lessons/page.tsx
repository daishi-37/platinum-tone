'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'
import RequireMember from '@/components/RequireMember'

type Lesson = {
  id: number
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  sort_order: number
  hls_ready: boolean
}

function LessonsContent() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Lesson[]>('/members/lessons')
      .then(setLessons)
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
      <h1 className="text-2xl font-bold text-text-main mb-2">声優レッスン動画</h1>
      <p className="text-text-sub text-sm mb-8">仙台エリ・優希比呂による直接指導</p>

      {lessons.length === 0 ? (
        <p className="text-text-sub">コンテンツを準備中です。</p>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/members/lessons/${lesson.slug}`}
              className="card p-5 flex items-center gap-5 hover:shadow-md transition-shadow group"
            >
              {/* サムネイル */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                {lesson.thumbnail_url ? (
                  <img src={lesson.thumbnail_url} alt={lesson.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-sidebar-bg/10 flex items-center justify-center text-2xl">
                    🎬
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="text-white text-base ml-0.5">▶</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-sub mb-1">第 {lesson.sort_order} 回</p>
                <h2 className="font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">
                  {lesson.title}
                </h2>
                {lesson.description && (
                  <p className="text-text-sub text-sm mt-1 line-clamp-2">{lesson.description}</p>
                )}
              </div>

              <span className="text-text-sub text-xl flex-shrink-0">›</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

export default function LessonsPage() {
  return (
    <RequireMember>
      <LessonsContent />
    </RequireMember>
  )
}
