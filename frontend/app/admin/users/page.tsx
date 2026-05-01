'use client'

import { useEffect, useState } from 'react'
import { apiRequest, ApiError } from '@/lib/api'

type UserRow = {
  id: number
  name: string
  email: string
  is_admin: boolean
  subscription_status: string
  email_verified_at: string | null
  created_at: string
}

const STATUS_LABEL: Record<string, string> = {
  none:      '未契約',
  trialing:  'トライアル',
  active:    '有効',
  past_due:  '支払い遅延',
  cancelled: '解約済み',
}

const STATUS_COLOR: Record<string, string> = {
  none:      'bg-gray-100 text-gray-600',
  trialing:  'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  past_due:  'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<UserRow[]>('/admin/users')
      .then(setUsers)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(user: UserRow) {
    if (!confirm(`「${user.name}」を削除しますか？`)) return
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (e) {
      alert((e as ApiError).message)
    }
  }

  if (loading) return <p className="text-gray-400">読み込み中...</p>
  if (error)   return <p className="text-red-500">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">ユーザー管理</h1>
        <a
          href="/admin/users/new"
          className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + 新規作成
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">名前</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">メール</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">権限</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">サブスク</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  {user.is_admin
                    ? <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">管理者</span>
                    : <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">会員</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[user.subscription_status] ?? STATUS_COLOR.none}`}>
                    {STATUS_LABEL[user.subscription_status] ?? user.subscription_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <a href={`/admin/users/edit/?id=${user.id}`} className="text-primary hover:underline">編集</a>
                  <button onClick={() => handleDelete(user)} className="text-red-400 hover:underline">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-gray-400 py-8">ユーザーがいません</p>
        )}
      </div>
    </div>
  )
}
