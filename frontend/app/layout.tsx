import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import SidebarNav from "@/components/SidebarNav";

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
        <AuthProvider>

          {/* ─── 左固定サイドバー ─── */}
          <aside className="w-64 fixed left-0 top-0 bottom-0 bg-sidebar-bg text-white flex flex-col overflow-y-auto z-40 shrink-0">

            {/* ロゴ */}
            <div className="px-6 py-8 border-b border-white/10">
              <a href="/" className="block">
                <p className="text-2xl font-bold tracking-widest">tone</p>
                <p className="text-white/50 text-xs mt-1">声優オンラインアカデミー</p>
              </a>
            </div>

            {/* ナビ・SNS・CTA（ログイン状態に応じて切り替わる） */}
            <SidebarNav />

          </aside>

          {/* ─── メインコンテンツ ─── */}
          <div className="ml-64 flex-1 min-w-0">
            {children}
          </div>

        </AuthProvider>
      </body>
    </html>
  );
}
