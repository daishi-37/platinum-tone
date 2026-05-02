'use client'

import { useState } from 'react'

export type PodcastFormData = {
  episode_number: number
  title: string
  description: string
  audio_url: string
  duration_seconds: number
  thumbnail_url: string
  is_published: boolean
  published_at: string
}

type Props = {
  initial: PodcastFormData
  onSubmit: (data: PodcastFormData) => Promise<void>
  saving: boolean
  errors: Record<string, string>
}

export function defaultPodcastForm(): PodcastFormData {
  return {
    episode_number: 1,
    title: '',
    description: '',
    audio_url: '',
    duration_seconds: 0,
    thumbnail_url: '',
    is_published: false,
    published_at: '',
  }
}

export default function PodcastForm({ initial, onSubmit, saving, errors }: Props) {
  const [form, setForm] = useState<PodcastFormData>(initial)

  function set<K extends keyof PodcastFormData>(key: K, value: PodcastFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* エピソード番号 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">エピソード番号</label>
        <input
          type="number"
          min={1}
          value={form.episode_number}
          onChange={(e) => set('episode_number', parseInt(e.target.value, 10) || 1)}
          required
          className={field(errors.episode_number)}
        />
        {errors.episode_number && <p className="text-red-500 text-xs mt-1">{errors.episode_number}</p>}
      </div>

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

      {/* 音声ファイルパス */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          音声ファイルパス
          <span className="text-gray-400 font-normal text-xs ml-2">（例: podcast/ep01.mp3）</span>
        </label>
        <input
          type="text"
          value={form.audio_url}
          onChange={(e) => set('audio_url', e.target.value)}
          placeholder="podcast/ep01.mp3"
          className={field(errors.audio_url)}
        />
        <p className="text-xs text-gray-400 mt-1">
          音声ファイルはあらかじめ <code className="bg-slate-100 px-1 rounded">storage/app/podcast/</code> にアップロードしておいてください。
        </p>
        {errors.audio_url && <p className="text-red-500 text-xs mt-1">{errors.audio_url}</p>}
      </div>

      {/* 再生時間 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          再生時間（秒）
          <span className="text-gray-400 font-normal text-xs ml-2">（例: 1800 = 30分）</span>
        </label>
        <input
          type="number"
          min={0}
          value={form.duration_seconds}
          onChange={(e) => set('duration_seconds', parseInt(e.target.value, 10) || 0)}
          className={field(errors.duration_seconds)}
        />
        {form.duration_seconds > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {Math.floor(form.duration_seconds / 60)}分{form.duration_seconds % 60}秒
          </p>
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

      {/* 設定 */}
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
