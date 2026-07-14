'use client'

import { useEffect } from 'react'
import { useAuth, isAdmin } from '@/lib/auth-context'

/**
 * 管理者としてログインしている端末を計測対象から除外する。
 * 一度管理者ログインを検知すると localStorage に tone_notrack を保存し、
 * 以後はログイン状態に関わらず（layout.tsx のインラインスクリプトが）
 * dataLayer に traffic_type='internal' を push する。
 */
export default function InternalTrafficFlag() {
  const { user } = useAuth()

  useEffect(() => {
    if (!isAdmin(user)) return
    try {
      if (localStorage.getItem('tone_notrack') === '1') return
      localStorage.setItem('tone_notrack', '1')
      // 現在のセッションにも即時反映
      const w = window as unknown as { dataLayer?: Record<string, unknown>[] }
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push({ traffic_type: 'internal' })
    } catch {
      /* localStorage 不可環境は無視 */
    }
  }, [user])

  return null
}
