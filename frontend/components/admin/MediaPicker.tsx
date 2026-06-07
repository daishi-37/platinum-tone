'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiRequest, apiUpload, type ApiError } from '@/lib/api'

export type MediaItem = {
  filename: string
  url: string
  size: number
  uploaded_at: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  /** 画像を選択したとき。url は /api/media/xxx の相対パス */
  onSelect: (url: string, alt: string) => void
  /** ヘッダーのタイトル（既定: 画像を挿入） */
  title?: string
  /** 代替テキスト入力欄を表示するか（本文挿入用。既定: true） */
  showAlt?: boolean
}

/**
 * WordPress のメディアライブラリ風の画像ピッカー。
 * - アップロード（ドラッグ＆ドロップ / ファイル選択）
 * - アップロード済み画像の一覧から選択
 */
export default function MediaPicker({ open, onClose, onSelect, title = '画像を挿入', showAlt = true }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [alt, setAlt] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiRequest<MediaItem[]>('/admin/media')
      setItems(res)
    } catch (e) {
      setError((e as ApiError).message ?? '画像の読み込みに失敗しました。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setSelected(null)
      setAlt('')
      setError('')
      loadItems()
    }
  }, [open, loadItems])

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return

    setUploading(true)
    setError('')
    try {
      let firstUploaded: MediaItem | null = null
      for (const file of list) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await apiUpload<MediaItem>('/admin/media', fd)
        if (!firstUploaded) firstUploaded = res
      }
      await loadItems()
      // アップロード直後の画像を選択状態に
      if (firstUploaded) {
        setSelected(firstUploaded)
        setAlt('')
      }
    } catch (e) {
      const err = e as ApiError
      setError(err.errors?.file?.[0] ?? err.message ?? 'アップロードに失敗しました。')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(e.target.files)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files)
  }

  function confirmSelect() {
    if (!selected) return
    onSelect(selected.url, alt.trim())
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 本体 */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* アップロードエリア */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-5 cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
              dragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-gray-600">
              {uploading ? 'アップロード中...' : 'ここに画像をドラッグ、またはクリックして選択'}
            </p>
            <p className="mt-1 text-xs text-gray-400">JPEG / PNG / GIF / WebP（最大10MB）</p>
          </div>

          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          {/* 画像グリッド */}
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">読み込み中...</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              まだ画像がありません。上のエリアからアップロードしてください。
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => {
                const isSelected = selected?.filename === item.filename
                return (
                  <button
                    type="button"
                    key={item.filename}
                    onClick={() => setSelected(item)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                      isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                    {isSelected && (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center gap-3 border-t border-gray-200 px-5 py-3">
          {showAlt ? (
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="代替テキスト（任意）"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <span className="flex-1" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={confirmSelect}
            disabled={!selected}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-40"
          >
            挿入する
          </button>
        </div>
      </div>
    </div>
  )
}
