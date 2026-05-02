'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiRequest, ApiError } from '@/lib/api'
import PodcastForm, { PodcastFormData } from '@/components/admin/PodcastForm'

export default function EditPodcastPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">読み込み中...</p>}>
      <EditPodcastForm />
    </Suspense>
  )
}

function EditPodcastForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const episodeId = searchParams.get('id')

  const [initial, setInitial] = useState<PodcastFormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!episodeId) return
    apiRequest<PodcastFormData & { published_at: string | null }>(`/admin/podcast/${episodeId}`).then((ep) => {
      setInitial({
        episode_number:   ep.episode_number,
        title:            ep.title,
        description:      ep.description ?? '',
        audio_url:        ep.audio_url ?? '',
        duration_seconds: ep.duration_seconds ?? 0,
        thumbnail_url:    ep.thumbnail_url ?? '',
        is_published:     ep.is_published,
        published_at:     ep.published_at ? ep.published_at.slice(0, 16) : '',
      })
    })
  }, [episodeId])

  async function handleSubmit(data: PodcastFormData) {
    setSaving(true)
    setErrors({})
    try {
      await apiRequest(`/admin/podcast/${episodeId}`, {
        method: 'PUT',
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

  if (!initial) return <p className="text-gray-400">読み込み中...</p>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/podcast" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧に戻る</a>
        <h1 className="text-2xl font-semibold text-gray-900">エピソード編集</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <PodcastForm
          initial={initial}
          onSubmit={handleSubmit}
          saving={saving}
          errors={errors}
        />
      </div>
    </div>
  )
}
