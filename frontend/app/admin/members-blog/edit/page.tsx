'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiRequest, ApiError } from '@/lib/api'
import BlogForm, { BlogFormData } from '@/components/admin/BlogForm'

export default function EditMembersBlogPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">読み込み中...</p>}>
      <EditMembersBlogForm />
    </Suspense>
  )
}

function EditMembersBlogForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')

  const [initial, setInitial] = useState<BlogFormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!postId) return
    apiRequest<BlogFormData & { published_at: string | null }>(`/admin/blog/${postId}`).then((p) => {
      setInitial({
        title:         p.title,
        slug:          p.slug,
        excerpt:       p.excerpt ?? '',
        body:          p.body,
        thumbnail_url: p.thumbnail_url ?? '',
        is_published:  p.is_published,
        published_at:  p.published_at ? p.published_at.slice(0, 16) : '',
      })
    })
  }, [postId])

  async function handleSubmit(data: BlogFormData) {
    setSaving(true)
    setErrors({})
    try {
      await apiRequest(`/admin/blog/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      router.push('/admin/members-blog')
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
        <a href="/admin/members-blog" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧に戻る</a>
        <h1 className="text-2xl font-semibold text-gray-900">記事編集</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <BlogForm
          initial={initial}
          onSubmit={handleSubmit}
          saving={saving}
          errors={errors}
        />
      </div>
    </div>
  )
}
