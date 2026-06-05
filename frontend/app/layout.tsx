import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import LayoutWrapper from "@/components/LayoutWrapper";

const GTM_ID = "GTM-K3CL3T47";

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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body className="antialiased flex min-h-screen bg-page-bg">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
