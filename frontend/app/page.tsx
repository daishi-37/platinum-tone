import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import PlanCTA from "@/components/PlanCTA";

export default function Home() {
  return (
    <div>

      <HeroSection />

      <div className="px-4 sm:px-8 py-10 sm:py-12 space-y-16">

        {/* サービス紹介 */}
        <section id="about">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">About</p>
          <h2 className="text-2xl font-bold text-primary mb-4">
            グリーンノートを代表する声優が直接伝える、<br />
            声優になるための『在り方』と『知識』と『技術』。
          </h2>
          <p className="text-text-sub leading-relaxed max-w-2xl">
            選択理論心理学を用いた声優オンラインアカデミー「tone」。<br />
            全国どこにいても、現役声優から直接学べる環境を提供します。
          </p>
        </section>

        {/* 講師紹介 */}
        <section id="instructors">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Instructors</p>
          <h2 className="text-2xl font-bold text-primary mb-6">講師紹介</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
            {[
              {
                name: "仙台エリ",
                role: "声優 / グリーンノート代表",
                image: "/assets/images/sendaieri.webp",
                works: ["『メダロット』甘酒アリカ", "『yes！プリキュア5GoGo！』ミルク/ミルキィローズ", "『GUNSLINGER GIRL』トリエラ", "『中二病でも恋がしたい！』小鳥遊十花", "『ガールズ&パンツァー』カエサル"],
                bio: "6歳で児童劇団に入団。15歳でアニメ声優デビュー（デビュー作で主役）。2020年7月に声優事務所「グリーンノート」を設立。2026年、選択理論心理学を用いたクオリティー声優オンラインアカデミー「tone」を設立。",
              },
              {
                name: "優希比呂",
                role: "声優 / グリーンノート顧問",
                image: "/assets/images/yuukihiro.webp",
                works: ["『覇王大系リューナイト』アデュー・ウォルサム", "『ヴァイスクロイツ』オミ / 月夜野臣", "『新世紀エヴァンゲリオン』日向マコト", "『仙界伝 封神演義』太公望", "『アンジェリーク』マルセル"],
                bio: "キャリアのスタートは舞台での芝居。次々と劇団を辞めていく仲間を見送りながら、勉強を続けた。その後、台詞の勉強を集中してやりたいことから声優養成所に移り、数々のアニメ作品に出演。",
              },
            ].map((p) => (
              <div key={p.name} className="card overflow-hidden">
                <div className="relative h-64" style={{ maxWidth: "210px", margin: "auto" }}>
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-contain object-center"
                  />
                </div>
                <div className="p-6">
                <h3 className="text-lg font-bold text-primary text-center mb-0.5">{p.name}</h3>
                <p className="text-text-sub text-xs text-center mb-3">{p.role}</p>
                <ul className="text-xs text-text-sub space-y-1 mb-3">
                  {p.works.map((w) => <li key={w}>・{w}</li>)}
                </ul>
                <p className="text-xs text-text-main leading-relaxed">{p.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* できること */}
        <section id="features">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">What you can do</p>
          <h2 className="text-2xl font-bold text-primary mb-6">toneで出来ること</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {[
              { title: "最先端の業界情報", desc: "全国どこにいても、最先端の声優業界情報を得ることができます。", image: "/assets/images/features1.webp" },
              { title: "月二回全体ミーティング", desc: "月2回のミーティングで、講師2人から直接アドバイスをもらえます。（アーカイブあり）", image: "/assets/images/features2.webp" },
              { title: "Podcast配信", desc: "podcast「声優登竜門バックステージ」を聞くことができます。", image: "/assets/images/features3.webp" },
              { title: "個別グループレッスンへの参加", desc: "オプション（別途料金）", image: "/assets/images/features4.webp" },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <Image src={item.image} alt={item.title} width={56} height={56} className="mb-3" />
                <h3 className="font-bold text-primary text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-text-sub leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* toneに向いてる人 */}
        <section>
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">For You</p>
          <h2 className="text-2xl font-bold text-primary mb-6">toneに向いてる人</h2>
          <ul className="space-y-4 max-w-2xl">
            {[
              { main: "積極的に質問ができる方。", sub: "「問い」のないところに「答え」は訪れません。" },
              { main: "なりたい未来を求めて選択し、目標を達成しようと努力し続けられる方。", sub: "目標を設定し、未来を決めるのは今の自分です。" },
              { main: "我こそは原石であると、自分を信じることができる方。", sub: "または、そのような自分になりたいと求めている方。" },
            ].map((item, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="mt-1 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-primary leading-relaxed">{item.main}</p>
                  {item.sub && <p className="text-xs text-text-sub mt-0.5">{item.sub}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* プラン */}
        <section id="plan">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Plan</p>
          <h2 className="text-2xl font-bold text-primary mb-6">プラン</h2>
          <div className="max-w-xl space-y-4">
            <div className="card p-6 border-2 border-primary">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-white bg-primary px-3 py-1 rounded-full">基本プラン</span>
                  <h3 className="text-lg font-bold text-primary mt-2">オンラインアカデミー</h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">¥9,200</p>
                  <p className="text-text-sub text-xs">/ 月（税込）</p>
                </div>
              </div>
              <ul className="text-sm space-y-2 mb-5">
                {["全デジタルコンテンツへのアクセス", "月二回全体ミーティング（アーカイブ付き）", "会員限定Podcast・動画"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-text-main">
                    <span className="text-accent mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <PlanCTA />
            </div>
            <div className="card p-4">
              <h3 className="font-bold text-primary text-sm mb-1">オプション</h3>
              <p className="text-text-sub text-xs">グループレッスン・個人レッスン（詳細は別途お知らせ）</p>
            </div>
          </div>
        </section>

        {/* コンテンツ一覧 */}
        <section id="contents">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Contents</p>
          <h2 className="text-2xl font-bold text-primary mb-6">コンテンツ</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { label: "What's 声優業界", type: "ブログ" },
              { label: "トレーニング", type: "動画" },
              { label: "対談", type: "動画" },
            ].map((sec) => (
              <div key={sec.label}>
                <h3 className="font-bold text-primary border-l-4 border-primary pl-3 mb-3 text-sm">{sec.label}</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-3 flex gap-3 items-center hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-16 h-12 rounded bg-section-bg flex-shrink-0" />
                      <div>
                        <span className="text-xs text-white bg-accent px-2 py-0.5 rounded-full">{sec.type}</span>
                        <p className="text-xs font-medium text-primary mt-1">タイトルが入ります</p>
                        <p className="text-xs text-text-sub">2026.02.20</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* フッター */}
      <footer className="bg-primary text-white py-10 mt-8">
        <div className="px-4 sm:px-8">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold tracking-widest mb-1">tone</p>
            <p className="text-white/60 text-xs">声優オンラインアカデミー</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-xs text-white/70 mb-6">
            <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <a href="/tokusho" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
            <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
          </nav>
          <p className="text-center text-white/40 text-xs">© 2026 tone / GREEN NOTE All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
