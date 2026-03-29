import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";

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

          {/* サイドバー（デスクトップ固定 + モバイルドロワー） */}
          <Sidebar />

          {/* ─── メインコンテンツ ─── */}
          {/* モバイル: 上部ヘッダー分の padding-top、デスクトップ: サイドバー分の margin-left */}
          <div className="flex-1 min-w-0 pt-14 md:pt-0 md:ml-64">
            {children}
          </div>

        </AuthProvider>
      </body>
    </html>
  );
}
