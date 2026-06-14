'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiRequest } from '@/lib/api'

type Item = {
  id: number
  title: string
  slug: string
  thumbnail_url: string | null
  published_at?: string | null
}

type Props = {
  /** セクション見出し（例: トレーニング） */
  title: string
  /** バッジ文言（例: 動画 / 音声） */
  badge: string
  /** 取得先の公開APIパス（例: /lessons/featured） */
  endpoint: string
  /** 各カードのリンク先プレフィックス（例: /members/lessons） */
  hrefBase: string
  /** 「一覧を見る」のリンク先（例: /members/lessons） */
  listHref: string
  /** サムネのプレースホルダー絵文字 */
  emoji?: string
}

export default function FeaturedContent({ title, badge, endpoint, hrefBase, listHref, emoji = '🎬' }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest<Item[]>(endpoint)
      .then((data) => setItems(data.slice(0, 3)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [endpoint])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-primary border-l-4 border-primary pl-3 text-sm">{title}</h3>
        <Link href={listHref} className="text-xs text-text-sub hover:text-primary transition-colors">
          一覧を見る →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-3 flex gap-3 items-center animate-pulse">
              <div className="w-16 h-12 rounded bg-section-bg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-section-bg rounded w-3/4" />
                <div className="h-2 bg-section-bg rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-3 text-xs text-text-sub text-center py-6">準備中です</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`${hrefBase}/${item.slug}`}
              className="card p-3 flex gap-3 items-center hover:shadow-md transition-shadow group"
            >
              <div className="w-16 h-12 rounded bg-section-bg flex-shrink-0 overflow-hidden flex items-center justify-center">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{emoji}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs text-white bg-accent px-2 py-0.5 rounded-full">{badge}</span>
                <p className="text-xs font-medium text-primary group-hover:underline mt-1 line-clamp-1">
                  {item.title}
                </p>
                {item.published_at && (
                  <p className="text-xs text-text-sub">
                    {new Date(item.published_at).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
