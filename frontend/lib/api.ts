/**
 * Laravel Sanctum SPA 認証用 API クライアント
 *
 * セッション / Cookie ベースの認証を使用。
 * POST/PUT/PATCH/DELETE の前に自動で CSRF クッキーを取得する。
 */

/** XSRF-TOKEN クッキーをデコードして返す */
function getXsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

/** CSRF クッキーを取得（state-changing リクエスト前に呼ぶ） */
async function fetchCsrfCookie(): Promise<void> {
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' })
}

export type ApiError = {
  status: number
  message: string
  errors: Record<string, string[]>
}

/**
 * API リクエストを送信する
 *
 * @throws {ApiError} レスポンスが 2xx 以外の場合
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    await fetchCsrfCookie()
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': getXsrfToken(),
      ...options.headers,
    },
  })

  if (response.status === 204) return {} as T

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: data.message ?? 'エラーが発生しました。',
      errors: data.errors ?? {},
    }
    throw error
  }

  return data as T
}
