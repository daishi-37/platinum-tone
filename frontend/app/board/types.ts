export type BoardUser = { id: number; name: string }

export type BoardAnswer = {
  id: number
  body: string
  created_at: string
  user: BoardUser
  is_deleted?: boolean // 管理画面のみ true になりうる
}

export type BoardPost = {
  id: number
  type: 'question' | 'announcement'
  body: string
  created_at: string
  user: BoardUser
  answers: BoardAnswer[] | null // announcement の場合は null
  answers_count: number | null // announcement の場合は null
  can_delete: boolean
  is_deleted?: boolean // 管理画面のみ true になりうる
  deleted_at?: string | null
}

export type RemainingInfo = {
  used: number
  limit: number
  remaining: number
  reset_at: string
}

/** 「6月4日」形式 */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 「2026/6/4 14:32」形式 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${time}`
}
