import type { MetadataRoute } from 'next'

/**
 * robots.txt（ビルド時に静的生成 → out/robots.txt）
 *
 * 会員・管理・課金・認証系のパスはクロール対象から除外する。
 * 管理ログインの秘匿パス（NEXT_PUBLIC_ADMIN_LOGIN_PATH）は、ここに書くと
 * 逆に存在を公開してしまうため、あえて記載しない。
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tone-ac.com').replace(/\/$/, '')

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/members/',
        '/dashboard/',
        '/billing/',
        '/login/',
        '/register/',
        '/forgot-password/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
