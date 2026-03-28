"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const slides = [
  "/assets/images/fv1.webp",
  "/assets/images/fv2.webp",
  "/assets/images/fv3.webp",
  null, // 背景色のみ
];

export default function HeroSection() {
  const { user, loading } = useAuth();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-primary text-white overflow-hidden">
      {/* スライドショー背景 */}
      {slides.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            backgroundImage: src ? `url('${src}')` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
      ))}
      {/* テキスト可読性のためのオーバーレイ（画像スライドのみ） */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: slides[current] ? 1 : 0 }}
      />
      {/* コンテンツ（常に表示） */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-28">
        <p className="text-accent text-xs font-medium tracking-widest uppercase mb-4">
          Voice Actor Online Academy
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">
          声優を目指す、<br />全ての人へ。
        </h1>
        <p className="text-white/80 leading-relaxed mb-8 max-w-lg">
          どんな困難や試練があったとしても<br />
          その道を進むため、学び続ける覚悟はあるか。<br />
          <span className="text-accent font-bold text-xl">君ならできる！</span>
        </p>
        {!loading && (
          user
            ? <a href="/dashboard" className="btn-primary text-base px-10 py-4">マイページ</a>
            : <a href="/register" className="btn-primary text-base px-10 py-4">今すぐ始める</a>
        )}
      </div>
    </section>
  );
}
