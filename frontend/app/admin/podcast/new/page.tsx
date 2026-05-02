'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest, ApiError } from '@/lib/api'
import PodcastForm, { defaultPodcastForm, PodcastFormData } from '@/components/admin/PodcastForm'

export default function NewPodcastPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(data: PodcastFormData) {
    setSaving(true)
    setErrors({})
    try {
      await apiRequest('/admin/podcast', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      router.push('/admin/podcast')
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(apiErr.errors)) {
          mapped[k] = (v as string[])[0]
        }
        setErrors(mapped)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/podcast" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧に戻る</a>
        <h1 className="text-2xl font-semibold text-gray-900">新規エピソード作成</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <PodcastForm
          initial={defaultPodcastForm()}
          onSubmit={handleSubmit}
          saving={saving}
          errors={errors}
        />
      </div>
    </div>
  )
}
