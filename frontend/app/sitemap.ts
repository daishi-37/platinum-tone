import type { MetadataRoute } from 'next'

/**
 * サイトマップ（ビルド時に静的生成）
 *
 * 静的エクスポート（output: 'export'）のため、`next build` 実行時に一度だけ評価され、
 * `out/sitemap.xml` として出力される。動的ページ（ブログ・ポッドキャスト）は
 * 本番APIから公開コンテンツの一覧を取得してURLを列挙する。
 *
 * 取得に失敗した場合は該当セクションを空にして静的ページのみでビルドを継続する
 * （オフラインビルドやAPI障害でビルドが落ちないようにするため）。
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tone-ac.com').replace(/\/$/, '')
const API_BASE = (process.env.SITEMAP_API_BASE ?? 'https://tone-ac.com/api').replace(/\/$/, '')

export const dynamic = 'force-static'

type PublicPost = { slug: string; published_at: string | null }
type PublicEpisode = { id: number; published_at: string | null }

async function fetchList<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? (data as T[]) : []
  } catch (error) {
    console.warn(`[sitemap] ${url} の取得に失敗しました。該当URLはスキップします。`, error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 公開静的ページ（会員・管理・課金・認証ページは含めない）
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/podcast/`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/board/`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/terms/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/tokusho/`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const [posts, episodes] = await Promise.all([
    fetchList<PublicPost>(`${API_BASE}/blog`),
    fetchList<PublicEpisode>(`${API_BASE}/podcast`),
  ])

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}/`,
      lastModified: p.published_at ? new Date(p.published_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  const episodeEntries: MetadataRoute.Sitemap = episodes
    .filter((e) => e.id != null)
    .map((e) => ({
      url: `${SITE_URL}/podcast/${e.id}/`,
      lastModified: e.published_at ? new Date(e.published_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  return [...staticEntries, ...postEntries, ...episodeEntries]
}
