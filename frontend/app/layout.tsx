import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "tone | 声優オンラインアカデミー",
  description: "声優を目指す全ての人へ。グリーンノートを代表する声優が直接伝える、声優になるためのマインドとナレッジとスキル。",
  icons: {
    icon: "/assets/images/favicon.png",
  },
  openGraph: {
    title: "tone | 声優オンラインアカデミー",
    description: "声優を目指す全ての人へ。グリーンノートを代表する声優が直接伝える、声優になるためのマインドとナレッジとスキル。",
    images: [{ url: "https://tone-ac.com/assets/images/ogp_image.jpg" }],
  },
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
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
