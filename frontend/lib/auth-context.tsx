'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'

export type User = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  subscription_status: 'none' | 'trialing' | 'active' | 'past_due' | 'cancelled'
  trial_ends_at: string | null
  subscription_ends_at: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const u = await apiRequest<User>('/auth/user')
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ user, loading, refresh: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export const SUBSCRIBED_STATUSES = ['trialing', 'active'] as const

export function isSubscribed(user: User | null): boolean {
  return !!user && SUBSCRIBED_STATUSES.includes(user.subscription_status as typeof SUBSCRIBED_STATUSES[number])
}
