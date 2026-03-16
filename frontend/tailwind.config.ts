import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#97d3c3",          // ミントグリーン
        "primary-hover": "#7bbfae",  // ホバー（少し暗め）
        accent: "#b8e3d8",           // ライトミント
        "page-bg": "#f7fbfa",        // 薄いミントホワイト
        "section-bg": "#edf6f3",     // ライトミントベージュ
        "card-bg": "#ffffff",
        "text-main": "#2D4659",      // ネイビーブルー
        "text-sub": "#6a8699",       // ミュートブルーグレー
        "sidebar-bg": "#2D4659",     // サイドバー用
      },
      fontFamily: {
        sans: ["Noto Sans JP", "Inter", "sans-serif"],
        serif: ["Noto Serif JP", "serif"],
      },
      lineHeight: {
        relaxed: "1.9",
      },
    },
  },
  plugins: [],
};
export default config;
