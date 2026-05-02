'use client'

import { useState } from 'react'
import { apiRequest } from '@/lib/api'

export type BacktalkFormData = {
  title: string
  slug: string
  description: string
  vimeo_url: string
  thumbnail_url: string
  is_published: boolean
  published_at: string
}

type Props = {
  initial: BacktalkFormData
  onSubmit: (data: BacktalkFormData) => Promise<void>
  saving: boolean
  errors: Record<string, string>
}

export function defaultBacktalkForm(): BacktalkFormData {
  return {
    title: '',
    slug: '',
    description: '',
    vimeo_url: '',
    thumbnail_url: '',
    is_published: false,
    published_at: '',
  }
}

function getVimeoEmbedUrl(url: string): string {
  // https://vimeo.com/123456789 または https://vimeo.com/123456789/abcdef (非公開)
  const match = url.match(/vimeo\.com\/(\d+)(?:\/([a-f0-9]+))?/)
  if (!match) return ''
  return match[2]
    ? `https://player.vimeo.com/video/${match[1]}?h=${match[2]}`
    : `https://player.vimeo.com/video/${match[1]}`
}

export default function BacktalkForm({ initial, onSubmit, saving, errors }: Props) {
  const [form, setForm] = useState<BacktalkFormData>(initial)
  const [slugLoading, setSlugLoading] = useState(false)

  function set<K extends keyof BacktalkFormData>(key: K, value: BacktalkFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function generateSlug() {
    if (!form.title) return
    setSlugLoading(true)
    try {
      const res = await apiRequest<{ slug: string }>('/admin/backtalk/slug-suggestion', {
        method: 'POST',
        body: JSON.stringify({ title: form.title }),
      })
      set('slug', res.slug)
    } finally {
      setSlugLoading(false)
    }
  }

  const embedUrl = getVimeoEmbedUrl(form.vimeo_url)

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
            placeholder="episode-01"
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

      {/* 説明文 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className={field(errors.description)}
        />
      </div>

      {/* Vimeo URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vimeo URL
          <span className="text-gray-400 font-normal text-xs ml-2">（例: https://vimeo.com/123456789）</span>
        </label>
        <input
          type="text"
          value={form.vimeo_url}
          onChange={(e) => set('vimeo_url', e.target.value)}
          required
          placeholder="https://vimeo.com/123456789"
          className={field(errors.vimeo_url)}
        />
        {errors.vimeo_url && <p className="text-red-500 text-xs mt-1">{errors.vimeo_url}</p>}

        {/* プレビュー */}
        {embedUrl && (
          <div className="mt-3 rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
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
