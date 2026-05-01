'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiRequest, ApiError } from '@/lib/api'

type UserDetail = {
  id: number
  name: string
  email: string
  is_admin: boolean
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export default function EditUserPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">読み込み中...</p>}>
      <EditUserForm />
    </Suspense>
  )
}

function EditUserForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')

  const [user, setUser] = useState<UserDetail | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
    subscription_status: 'none',
    stripe_customer_id: '',
    stripe_subscription_id: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    apiRequest<UserDetail>(`/admin/users/${userId}`).then((u) => {
      setUser(u)
      setForm({
        name: u.name,
        email: u.email,
        password: '',
        is_admin: u.is_admin,
        subscription_status: u.subscription_status,
        stripe_customer_id: u.stripe_customer_id ?? '',
        stripe_subscription_id: u.stripe_subscription_id ?? '',
      })
    })
  }, [userId])

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
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

  async function handleStripePortal() {
    setPortalLoading(true)
    setPortalUrl(null)
    try {
      const res = await apiRequest<{ url: string }>(`/admin/users/${userId}/stripe-portal`, { method: 'POST' })
      setPortalUrl(res.url)
    } catch (err) {
      alert((err as ApiError).message)
    } finally {
      setPortalLoading(false)
    }
  }

  if (!user) return <p className="text-gray-400">読み込み中...</p>

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/users" className="text-gray-400 hover:text-gray-600 text-sm">← 一覧に戻る</a>
        <h1 className="text-2xl font-semibold text-gray-900">ユーザー編集</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <Field label="名前" error={errors.name}>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className={input(errors.name)} />
        </Field>

        <Field label="メールアドレス" error={errors.email}>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required className={input(errors.email)} />
        </Field>

        <Field label="パスワード（変更する場合のみ入力）" error={errors.password}>
          <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="入力しない場合は変更なし" className={input(errors.password)} />
        </Field>

        <Field label="サブスクリプション状態" error={errors.subscription_status}>
          <select value={form.subscription_status} onChange={(e) => set('subscription_status', e.target.value)} className={input(errors.subscription_status)}>
            <option value="none">未契約</option>
            <option value="trialing">トライアル</option>
            <option value="active">有効</option>
            <option value="past_due">支払い遅延</option>
            <option value="cancelled">解約済み</option>
          </select>
        </Field>

        <Field label="Stripe Customer ID" error={errors.stripe_customer_id}>
          <input type="text" value={form.stripe_customer_id} onChange={(e) => set('stripe_customer_id', e.target.value)} placeholder="cus_xxxxx" className={input(errors.stripe_customer_id)} />
        </Field>

        <Field label="Stripe Subscription ID" error={errors.stripe_subscription_id}>
          <input type="text" value={form.stripe_subscription_id} onChange={(e) => set('stripe_subscription_id', e.target.value)} placeholder="sub_xxxxx" className={input(errors.stripe_subscription_id)} />
        </Field>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_admin} onChange={(e) => set('is_admin', e.target.checked)} className="rounded border-gray-300 text-primary" />
          <span className="text-sm text-gray-700">管理者権限を付与する</span>
        </label>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50">
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>

      {user.stripe_customer_id && (
        <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Stripe カスタマーポータル</h2>
          <p className="text-sm text-gray-500 mb-4">URLを発行して、ユーザーのサブスクリプション管理ページへ案内できます。</p>
          <button onClick={handleStripePortal} disabled={portalLoading} className="border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50">
            {portalLoading ? '発行中...' : 'ポータルURLを発行'}
          </button>
          {portalUrl && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">発行されたURL（コピーしてユーザーに送付）</p>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm break-all hover:underline">{portalUrl}</a>
            </div>
          )}
        </div>
      )}
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
