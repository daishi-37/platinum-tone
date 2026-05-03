'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { apiRequest } from '@/lib/api'
import remarkBreaks from 'remark-breaks'

// SSR を避けるため動的インポート
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export type BlogFormData = {
  title: string
  slug: string
  excerpt: string
  body: string
  thumbnail_url: string
  is_published: boolean
  published_at: string
}

type Props = {
  initial: BlogFormData
  onSubmit: (data: BlogFormData) => Promise<void>
  saving: boolean
  errors: Record<string, string>
}

export function defaultBlogForm(): BlogFormData {
  return {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    thumbnail_url: '',
    is_published: false,
    published_at: '',
  }
}

export default function BlogForm({ initial, onSubmit, saving, errors }: Props) {
  const [form, setForm] = useState<BlogFormData>(initial)
  const [slugLoading, setSlugLoading] = useState(false)

  function set<K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function generateSlug() {
    if (!form.title) return
    setSlugLoading(true)
    try {
      const res = await apiRequest<{ slug: string }>('/admin/blog/slug-suggestion', {
        method: 'POST',
        body: JSON.stringify({ title: form.title }),
      })
      set('slug', res.slug)
    } finally {
      setSlugLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          className={field(errors.title)}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* スラッグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          スラッグ <span className="text-gray-400 font-normal text-xs">（URLに使用: 半角英数字・ハイフンのみ）</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            required
            placeholder="my-article"
            className={field(errors.slug) + ' flex-1'}
          />
          <button
            type="button"
            onClick={generateSlug}
            disabled={slugLoading || !form.title}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
          >
            {slugLoading ? '生成中...' : 'タイトルから生成'}
          </button>
        </div>
        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
      </div>

      {/* 抜粋 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          抜粋 <span className="text-gray-400 font-normal text-xs">（一覧に表示される短い説明文）</span>
        </label>
        <textarea
          value={form.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          rows={2}
          className={field(errors.excerpt)}
        />
      </div>

      {/* 本文（Markdownエディタ） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">本文</label>
        <div data-color-mode="light">
          <MDEditor
            value={form.body}
            onChange={(v) => set('body', v ?? '')}
            height={400}
            preview="live"
            previewOptions={{ remarkPlugins: [remarkBreaks] }}
          />
        </div>
        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
      </div>

      {/* サムネイルURL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">サムネイルURL</label>
        <input
          type="text"
          value={form.thumbnail_url}
          onChange={(e) => set('thumbnail_url', e.target.value)}
          placeholder="https://..."
          className={field(errors.thumbnail_url)}
        />
      </div>

      {/* 公開設定 */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set('is_published', e.target.checked)}
            className="rounded border-gray-300 text-primary"
          />
          <span className="text-sm text-gray-700">公開する</span>
        </label>

        {form.is_published && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">公開日時（空白の場合は今すぐ）</label>
            <input
              type="datetime-local"
              value={form.published_at}
              onChange={(e) => set('published_at', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存する'}
      </button>
    </form>
  )
}

function field(error?: string) {
  return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
    error ? 'border-red-400' : 'border-gray-300'
  }`
}
