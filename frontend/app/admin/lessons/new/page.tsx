'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest, apiUpload, ApiError } from '@/lib/api'
import LessonForm, { defaultLessonForm, LessonFormData } from '@/components/admin/LessonForm'

export default function NewLessonPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(data: LessonFormData, hlsFile: File | null) {
    setSaving(true)
    setErrors({})
    try {
      const created = await apiRequest<{ id: number }>('/admin/lessons', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (hlsFile) {
        const fd = new FormData()
        fd.append('file', hlsFile)
        await apiUpload(`/admin/lessons/${created.id}/hls`, fd)
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

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/lessons" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧に戻る</a>
        <h1 className="text-2xl font-semibold text-gray-900">新規レッスン作成</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <LessonForm initial={defaultLessonForm()} onSubmit={handleSubmit} saving={saving} errors={errors} />
      </div>
    </div>
  )
}
