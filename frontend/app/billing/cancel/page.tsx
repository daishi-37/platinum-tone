import Link from 'next/link'

export default function BillingCancelPage() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md text-center">

        <div className="text-5xl mb-6">😔</div>

        <h1 className="text-2xl font-bold text-text-main mb-3">
          お支払いがキャンセルされました
        </h1>

        <p className="text-text-sub text-sm leading-relaxed mb-8">
          お支払い手続きが中断されました。<br />
          いつでも再度お試しいただけます。7日間は無料でご利用いただけます。
        </p>

        <Link
          href="/billing/checkout"
          className="block bg-accent hover:bg-accent/80 text-white py-3 rounded-full text-sm font-bold transition-colors mb-4"
        >
          もう一度試す
        </Link>

        <Link
          href="/"
          className="block text-sm text-text-sub hover:text-primary transition-colors"
        >
          トップページへ戻る
        </Link>

      </div>
    </main>
  )
}
