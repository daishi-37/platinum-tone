'use client'

import { useState } from 'react'

export type VoicedoorFormData = {
  title: string
  description: string
  apple_podcast_url: string
  is_published: boolean
  published_at: string
}

export function defaultVoicedoorForm(): VoicedoorFormData {
  return {
    title: '',
    description: '',
    apple_podcast_url: '',
    is_published: false,
    published_at: '',
  }
}

function getEmbedUrl(url: string): string {
  if (!url) return ''
  return url.replace('podcasts.apple.com', 'embed.podcasts.apple.com')
}

type Props = {
  initial: VoicedoorFormData
  onSubmit: (data: VoicedoorFormData) => void
  saving: boolean
  errors: Record<string, string>
}

export default function VoicedoorForm({ initial, onSubmit, saving, errors }: Props) {
  const [form, setForm] = useState<VoicedoorFormData>(initial)
  const embedUrl = getEmbedUrl(form.apple_podcast_url)

  function set<K extends keyof VoicedoorFormData>(key: K, value: VoicedoorFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          required
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Apple Podcast URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Apple Podcast URL <span className="text-red-400">*</span></label>
        <input
          type="url"
          value={form.apple_podcast_url}
          onChange={(e) => set('apple_podcast_url', e.target.value)}
          placeholder="https://podcasts.apple.com/..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          required
        />
        {errors.apple_podcast_url && <p className="text-red-500 text-xs mt-1">{errors.apple_podcast_url}</p>}
      </div>

      {/* プレビュー */}
      {embedUrl && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">プレビュー</p>
          <iframe
            src={embedUrl}
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            height="175"
            style={{ width: '100%', maxWidth: 660, overflow: 'hidden', borderRadius: 10, border: 'none' }}
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          />
        </div>
      )}

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
        />
      </div>

      {/* 公開設定 */}
      <div className="flex items-center gap-3">
        <input
          id="is_published"
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => set('is_published', e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="is_published" className="text-sm text-gray-700">公開する</label>
      </div>

      {/* 公開日時 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">公開日時</label>
        <input
          type="datetime-local"
          value={form.published_at}
          onChange={(e) => set('published_at', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <p className="text-gray-400 text-xs mt-1">空白の場合、公開時に現在日時が設定されます</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </form>
  )
}
