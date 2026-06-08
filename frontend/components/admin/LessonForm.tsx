'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { apiRequest } from '@/lib/api'
import MediaPicker from './MediaPicker'

// SSR を避けるため動的インポート
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export type LessonFormData = {
  title: string
  slug: string
  description: string
  thumbnail_url: string
  sort_order: number
  is_published: boolean
}

type Props = {
  initial: LessonFormData
  /** 編集時、HLSが既にアップロード済みか */
  initialHlsReady?: boolean
  onSubmit: (data: LessonFormData, hlsFile: File | null) => Promise<void>
  saving: boolean
  errors: Record<string, string>
}

export function defaultLessonForm(): LessonFormData {
  return {
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    sort_order: 0,
    is_published: false,
  }
}

export default function LessonForm({ initial, initialHlsReady, onSubmit, saving, errors }: Props) {
  const [form, setForm] = useState<LessonFormData>(initial)
  const [hlsFile, setHlsFile] = useState<File | null>(null)
  const [slugLoading, setSlugLoading] = useState(false)
  const [thumbOpen, setThumbOpen] = useState(false)

  function set<K extends keyof LessonFormData>(key: K, value: LessonFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function generateSlug() {
    if (!form.title) return
    setSlugLoading(true)
    try {
      const res = await apiRequest<{ slug: string }>('/admin/lessons/slug-suggestion', {
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
    onSubmit(form, hlsFile)
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
            placeholder="lesson-01"
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

      {/* 説明文（Markdownエディタ） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          説明文 <span className="text-gray-400 font-normal text-xs">（Markdown対応）</span>
        </label>
        <div data-color-mode="light">
          <MDEditor
            value={form.description}
            onChange={(v) => set('description', v ?? '')}
            height={240}
            preview="live"
            previewOptions={{ remarkPlugins: [remarkGfm, remarkBreaks] }}
          />
        </div>
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* HLS動画アップロード（メイン） */}
      <div className="border border-primary/40 bg-primary/5 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          動画（暗号化HLS zip）
          {initialHlsReady && (
            <span className="ml-2 text-xs text-green-600 font-semibold">アップロード済み</span>
          )}
        </label>
        <p className="text-xs text-gray-500 mb-2 leading-relaxed">
          ローカルで <code className="bg-slate-100 px-1 rounded">scripts/encrypt-hls-video.sh 動画.mp4 スラッグ</code> を実行して生成した
          <code className="bg-slate-100 px-1 rounded mx-1">スラッグ.zip</code> を選択してください。
          {initialHlsReady && '（新しく選択すると差し替わります）'}
        </p>
        <input
          type="file"
          accept=".zip,application/zip"
          onChange={(e) => setHlsFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold hover:file:bg-primary-hover"
        />
        {hlsFile && (
          <p className="text-xs text-gray-600 mt-2">選択中: {hlsFile.name}（{(hlsFile.size / 1024 / 1024).toFixed(1)} MB）</p>
        )}
        {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
      </div>

      {/* サムネイルURL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">サムネイルURL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.thumbnail_url}
            onChange={(e) => set('thumbnail_url', e.target.value)}
            placeholder="https://... または画像を選択"
            className={field(errors.thumbnail_url) + ' flex-1'}
          />
          <button
            type="button"
            onClick={() => setThumbOpen(true)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            画像を選択
          </button>
        </div>
        {form.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.thumbnail_url}
            alt="サムネイルプレビュー"
            className="mt-2 h-28 w-auto rounded-lg border border-gray-200 object-cover"
          />
        )}
      </div>

      <MediaPicker
        open={thumbOpen}
        onClose={() => setThumbOpen(false)}
        onSelect={(url) => {
          set('thumbnail_url', url)
          setThumbOpen(false)
        }}
        title="サムネイルを選択"
        showAlt={false}
      />

      {/* 公開設定・並び順 */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">並び順（第 N 回）</label>
          <input
            type="number"
            min={0}
            value={form.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.sort_order && <p className="text-red-500 text-xs mt-1">{errors.sort_order}</p>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set('is_published', e.target.checked)}
            className="rounded border-gray-300 text-primary"
          />
          <span className="text-sm text-gray-700">公開する</span>
        </label>
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
