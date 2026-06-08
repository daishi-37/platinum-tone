'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiRequest, apiUpload, ApiError } from '@/lib/api'
import LessonForm, { LessonFormData } from '@/components/admin/LessonForm'

export default function EditLessonPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">読み込み中...</p>}>
      <EditLessonForm />
    </Suspense>
  )
}

function EditLessonForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('id')
  const [initial, setInitial] = useState<LessonFormData | null>(null)
  const [hlsReady, setHlsReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!lessonId) return
    apiRequest<LessonFormData & { hls_ready?: boolean }>(`/admin/lessons/${lessonId}`).then((l) => {
      setInitial({
        title:         l.title,
        slug:          l.slug,
        description:   l.description ?? '',
        thumbnail_url: l.thumbnail_url ?? '',
        sort_order:    l.sort_order ?? 0,
        is_published:  l.is_published,
      })
      setHlsReady(!!l.hls_ready)
    })
  }, [lessonId])

  async function handleSubmit(data: LessonFormData, hlsFile: File | null) {
    setSaving(true)
    setErrors({})
    try {
      await apiRequest(`/admin/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) })
      if (hlsFile) {
        const fd = new FormData()
        fd.append('file', hlsFile)
        await apiUpload(`/admin/lessons/${lessonId}/hls`, fd)
      }
      router.push('/admin/lessons')
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) mapped[k] = (v as string[])[0]
        setErrors(mapped)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!initial) return <p className="text-gray-400">読み込み中...</p>

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/lessons" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧に戻る</a>
        <h1 className="text-2xl font-semibold text-gray-900">レッスン編集</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <LessonForm initial={initial} initialHlsReady={hlsReady} onSubmit={handleSubmit} saving={saving} errors={errors} />
      </div>
    </div>
  )
}
