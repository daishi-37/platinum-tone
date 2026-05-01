'use client'

import { useAuth } from '@/lib/auth-context'

export default function AdminDashboard() {
  const { user } = useAuth()

  const cards = [
    { label: 'ユーザー管理', desc: '管理者・会員の追加・編集', href: '/admin/users' },
    { label: 'ブログ', desc: '記事の作成・編集・公開', href: '/admin/blog' },
    { label: 'ポッドキャスト', desc: 'エピソードの追加・編集', href: '/admin/podcast' },
    { label: 'レッスン動画', desc: 'トレーニング・対談の管理', href: '/admin/lessons' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1 text-gray-900">ダッシュボード</h1>
      <p className="text-gray-500 text-sm mb-8">ようこそ、{user?.name} さん</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-sm transition"
          >
            <p className="font-semibold text-gray-900 mb-1">{card.label}</p>
            <p className="text-gray-500 text-sm">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
