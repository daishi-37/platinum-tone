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
        primary: "#003040",
        "primary-hover": "#1a5068",
        accent: "#4a9e8a",
        "page-bg": "#f5f7f6",
        "section-bg": "#eaf0f2",
        "card-bg": "#ffffff",
        "text-main": "#2c3e3a",
        "text-sub": "#6b8080",
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
