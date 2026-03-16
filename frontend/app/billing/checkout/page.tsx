'use client'

import { useEffect, useState } from 'react'
import { apiRequest, type ApiError } from '@/lib/api'

export default function BillingCheckoutPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<{ url: string }>('/billing/checkout', { method: 'POST' })
      .then(({ url }) => {
        window.location.href = url
      })
      .catch((err: ApiError) => {
        setError(err.message)
      })
  }, [])

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/login" className="text-primary hover:underline text-sm">
            ログインページへ
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-sub text-sm">Stripeのお支払いページに移動しています...</p>
      </div>
    </main>
  )
}
