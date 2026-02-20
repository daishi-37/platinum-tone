import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tone | 声優オンラインアカデミー",
  description: "声優を目指す全ての人へ。グリーンノートを代表する声優が直接伝える、声優になるためのマインドとナレッジとスキル。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased flex min-h-screen bg-page-bg">

        {/* ─── 左固定サイドバー ─── */}
        <aside className="w-64 fixed left-0 top-0 bottom-0 bg-primary text-white flex flex-col overflow-y-auto z-40 shrink-0">

          {/* ロゴ */}
          <div className="px-6 py-8 border-b border-white/10">
            <a href="/" className="block">
              <p className="text-2xl font-bold tracking-widest">tone</p>
              <p className="text-white/50 text-xs mt-1">声優オンラインアカデミー</p>
            </a>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {[
              { href: "#about",       label: "アカデミーについて" },
              { href: "#instructors", label: "講師紹介" },
              { href: "#features",    label: "できること" },
              { href: "#plan",        label: "プラン・料金" },
              { href: "#contents",    label: "コンテンツ" },
              { href: "/blog",        label: "What's 声優業界" },
              { href: "/podcast",     label: "Podcast" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                {label}
              </a>
            ))}

            <div className="border-t border-white/10 my-4" />

            {[
              { href: "/login",    label: "ログイン" },
              { href: "/register", label: "新規登録" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                {label}
              </a>
            ))}
          </nav>

          {/* SNS */}
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-white/40 text-xs mb-3">SNS</p>
            <div className="flex gap-3">
              {["X", "Instagram", "YouTube"].map((sns) => (
                <a
                  key={sns}
                  href="#"
                  className="text-xs text-white/60 hover:text-white transition-colors border border-white/20 px-2 py-1 rounded"
                >
                  {sns}
                </a>
              ))}
            </div>
          </div>

          {/* 入会CTA */}
          <div className="px-4 py-5 border-t border-white/10">
            <a
              href="#register"
              className="block bg-accent hover:bg-accent/80 text-white text-center py-3 rounded-full text-sm font-bold transition-colors"
            >
              7日間無料で始める
            </a>
            <p className="text-white/40 text-xs text-center mt-2">月額 ¥9,200（税込）</p>
          </div>

        </aside>

        {/* ─── メインコンテンツ ─── */}
        <div className="ml-64 flex-1 min-w-0">
          {children}
        </div>

      </body>
    </html>
  );
}
