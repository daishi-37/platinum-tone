'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest, ApiError } from '@/lib/api'

export default function NewUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
    subscription_status: 'none',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      router.push('/admin/users')
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

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/users" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧に戻る</a>
        <h1 className="text-2xl font-semibold text-gray-900">新規ユーザー作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <Field label="名前" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            className={input(errors.name)}
          />
        </Field>

        <Field label="メールアドレス" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            className={input(errors.email)}
          />
        </Field>

        <Field label="パスワード" error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required
            className={input(errors.password)}
          />
        </Field>

        <Field label="サブスクリプション状態" error={errors.subscription_status}>
          <select
            value={form.subscription_status}
            onChange={(e) => set('subscription_status', e.target.value)}
            className={input(errors.subscription_status)}
          >
            <option value="none">未契約</option>
            <option value="trialing">トライアル</option>
            <option value="active">有効</option>
            <option value="past_due">支払い遅延</option>
            <option value="cancelled">解約済み</option>
          </select>
        </Field>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_admin}
            onChange={(e) => set('is_admin', e.target.checked)}
            className="rounded border-gray-300 text-primary"
          />
          <span className="text-sm text-gray-700">管理者権限を付与する</span>
        </label>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {saving ? '作成中...' : '作成する'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function input(error?: string) {
  return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
    error ? 'border-red-400' : 'border-gray-300'
  }`
}
