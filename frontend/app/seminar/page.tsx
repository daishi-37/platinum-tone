import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "オンライン説明会 | tone 声優オンラインアカデミー",
  description:
    "声優オンラインアカデミー「tone」のオンライン説明会。主催者の優希比呂・仙台エリが、なぜこのサロンを開いたのか、toneで学べることを直接お話しし、質疑応答にもお答えします。参加無料・Zoom開催。",
};

/* ─────────────────────────────────────────────
   申し込みは公式LINEで受け付ける。
   参加者が希望日のキーワードを送信 → 自動返信でその回のZoom URLを送る想定。
   公式LINEのキーワード応答（自動応答メッセージ）に、以下を設定する。
     「7月29日 参加希望」→ 第1回 7/29(水) 21:00-22:00
        https://us02web.zoom.us/j/84418308921?pwd=0VNbw0aytMlJT2rI94K4MfHQakTBp9.1
     「7月30日 参加希望」→ 第2回 7/30(木) 21:00-22:00
        https://us02web.zoom.us/j/83108715105?pwd=olKP1vAoay6IDTO4EKSfVsNvy1qddb.1
   ───────────────────────────────────────────── */
const LINE_URL = "https://lin.ee/82lwfPY"; // TODO: tone 公式LINEの友だち追加URLに差し替える

const schedule = [
  {
    label: "第1回",
    date: "2026年7月29日（水）",
    time: "21:00 〜 22:00",
    keyword: "7月29日 参加希望",
  },
  {
    label: "第2回",
    date: "2026年7月30日（木）",
    time: "21:00 〜 22:00",
    keyword: "7月30日 参加希望",
  },
];

const pillars = [
  {
    no: "01",
    title: "なぜ、私たちはこのサロンを開いたのか",
    desc: "主催者である優希比呂・仙台エリの2人が、何を想い、何のために tone を立ち上げたのか。その原点を、自分たちの言葉で直接お話しします。",
  },
  {
    no: "02",
    title: "tone で、あなたが学べること",
    desc: "講義動画・音声配信・月1回の全体ミーティング。tone でどんな学びが得られ、どう力をつけていけるのかを、具体的にご説明します。",
  },
  {
    no: "03",
    title: "あなたの疑問に、直接お答えする Q&A",
    desc: "「自分にも続けられる？」「どんな人が学んでいる？」——どんな小さなことでも、その場で2人に直接質問していただけます。",
  },
];

const learnings = [
  {
    title: "最先端の声優業界の知識",
    desc: "全国どこにいても、現役で活動する声優だからこそ伝えられる、リアルな業界の情報と考え方を学べます。",
  },
  {
    title: "月1回の全体ミーティング",
    desc: "月に一度、講師2人から直接アドバイスをもらえる場があります（アーカイブ視聴も可能）。",
  },
  {
    title: "音声配信「声優登竜門 backstage」",
    desc: "会員限定の音声配信で、声優として大切にすべき「在り方」や日々の学びに触れられます。",
  },
  {
    title: "選択理論心理学にもとづいた学び",
    desc: "技術だけでなく、声優として進み続けるための心の在り方も、選択理論心理学の考え方をベースに学べます。",
  },
];

const agenda = [
  { time: "00:00", title: "オープニング", desc: "本日の流れと、主催者2人の自己紹介。" },
  { time: "00:05", title: "なぜ tone を開いたのか", desc: "優希比呂・仙台エリの2人が、サロンに込めた想いをお話しします。" },
  { time: "00:25", title: "tone で学べること", desc: "コンテンツの中身や学びの進め方を、実際の画面もお見せしながらご紹介。" },
  { time: "00:45", title: "料金・入会の流れ", desc: "料金プランと、入会から学習スタートまでの手順をご説明します。" },
  { time: "00:50", title: "質疑応答（Q&A）", desc: "チャット・口頭どちらでもOK。気になることを直接ご質問ください。" },
];

const speakers = [
  {
    name: "仙台エリ",
    role: "声優 / グリーンノート代表",
    image: "/assets/images/sendaieri.webp",
    bio: "6歳で児童劇団に入団。15歳でアニメ声優デビュー（デビュー作で主役）。2020年7月に声優事務所「グリーンノート」を設立。2026年、選択理論心理学を用いたクオリティー声優オンラインアカデミー「tone」を設立。",
  },
  {
    name: "優希比呂",
    role: "声優 / グリーンノート顧問",
    image: "/assets/images/yuukihiro.webp",
    bio: "キャリアのスタートは舞台での芝居。次々と劇団を辞めていく仲間を見送りながら、勉強を続けた。その後、台詞の勉強を集中してやりたいことから声優養成所に移り、数々のアニメ作品に出演。",
  },
];

const targets = [
  "声優を目指していて、本気で力をつけたいと考えている方",
  "独学・養成所・オンラインのどれが自分に合うか迷っている方",
  "tone の入会を検討中で、内容を詳しく知ってから決めたい方",
  "主催者2人がどんな想いで tone をつくったのか、知ってみたい方",
];

const faq = [
  {
    q: "参加費はかかりますか？",
    a: "無料です。どなたでもお気軽にご参加いただけます。",
  },
  {
    q: "顔出し・声出しは必要ですか？",
    a: "不要です。カメラ・マイクをオフにして、聞くだけのご参加で問題ありません。気軽にのぞいてみてください。",
  },
  {
    q: "2つの日程で内容は違いますか？",
    a: "両日とも同じ内容です。ご都合の良い日程をお選びください。",
  },
  {
    q: "質問はその場でできますか？",
    a: "はい。後半に質疑応答（Q&A）の時間を設けています。チャット・口頭どちらでもご質問いただけます。",
  },
  {
    q: "申し込んだあと、Zoomの参加URLはどこで分かりますか？",
    a: "公式LINEで参加希望日を送っていただくと、自動返信で参加URLをお送りします。当日までにZoomアプリ（無料）をご準備ください。",
  },
  {
    q: "参加したら必ず入会しないといけませんか？",
    a: "いいえ。説明会は、tone を知っていただくための場です。ご検討のうえ、ご自身のタイミングで判断していただいて構いません。",
  },
];

export default function SeminarPage() {
  return (
    <div>
      {/* ヒーロー */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
          <p className="text-accent text-xs font-medium tracking-widest uppercase mb-4">
            Online Information Session
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            tone オンライン説明会
          </h1>
          <p className="text-white/85 leading-relaxed mb-6 max-w-xl">
            主催者の優希比呂・仙台エリが、<br />
            なぜこのサロンを開いたのか、tone で学べることを<br className="hidden sm:block" />
            直接お話しし、ご質問にもお答えします。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs font-bold bg-white/15 px-4 py-1.5 rounded-full">参加無料</span>
            <span className="text-xs font-bold bg-white/15 px-4 py-1.5 rounded-full">Zoom開催</span>
            <span className="text-xs font-bold bg-white/15 px-4 py-1.5 rounded-full">約60分</span>
            <span className="text-xs font-bold bg-white/15 px-4 py-1.5 rounded-full">7/29・7/30</span>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-8 py-10 sm:py-14 space-y-16 max-w-3xl mx-auto text-center">
        {/* 導入リード */}
        <section>
          <p className="text-text-sub text-xs tracking-widest uppercase mb-3">Message</p>
          <h2 className="text-xl sm:text-2xl font-bold text-primary leading-relaxed mb-5">
            「声優になりたい」——<br />
            その想いを、どう形にしていけばいいのか。
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-text-main leading-relaxed max-w-2xl mx-auto">
            <p>
              養成所に通うべきか、独学で続けるべきか。世の中には情報があふれていて、
              かえって「何が正解なのか分からない」と立ち止まってしまう方も少なくありません。
            </p>
            <p>
              tone は、全国どこにいても現役声優から直接学べる、声優オンラインアカデミーです。
              この説明会では、主催者である優希比呂・仙台エリの2人が、
              <strong className="font-bold text-text-main">なぜこのサロンを開いたのか</strong>、そして
              <strong className="font-bold text-text-main">tone で何を学べるのか</strong>を、
              自分たちの言葉でお話しします。
            </p>
            <p>
              聞いて気になったことは、その場で直接質問していただけます。
              まずは気軽に、tone の世界をのぞいてみてください。
            </p>
          </div>
        </section>

        {/* 3つの柱 */}
        <section id="about">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">About</p>
          <h2 className="text-2xl font-bold text-primary mb-3">この説明会は、こんな会です</h2>
          <p className="text-sm text-text-main leading-relaxed mb-6 max-w-2xl mx-auto">
            約60分の中で、大きく3つのことをお伝えします。
          </p>
          <div className="space-y-4">
            {pillars.map((p) => (
              <div key={p.no} className="card p-6 sm:p-8">
                <span className="block text-3xl font-bold text-primary/40 tabular-nums leading-none mb-3">
                  {p.no}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-primary leading-relaxed mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-text-sub leading-relaxed max-w-xl mx-auto">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* なぜ開いたのか（※テスト文章・後日差し替え） */}
        {/* TODO: ここを主催者2人の「なぜ tone を開いたのか」という想いの本文に差し替える */}
        <section id="why" className="card p-6 sm:p-8 bg-section-bg">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Why</p>
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-5">
            なぜ、私たちはこのサロンを開いたのか
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-text-main leading-relaxed max-w-2xl mx-auto">
            <p className="text-text-sub text-xs">※ 以下はテスト文章です。後ほど主催者の想いに差し替えます。</p>
            <p>
              これはテスト用のダミー文章です。ここには、優希比呂・仙台エリの2人が、
              これまでの声優人生の中で感じてきたこと、そして「なぜ今このサロンを立ち上げたのか」という想いが入ります。
            </p>
            <p>
              これはテスト用のダミー文章です。声優という仕事に向き合う中で出会った課題や、
              全国の声優を目指す人たちに本当に届けたかったもの——その背景となるストーリーをここで語ります。
            </p>
            <p>
              これはテスト用のダミー文章です。説明会当日は、この想いを2人の言葉で、より深くお話しする予定です。
            </p>
          </div>
        </section>

        {/* 学べること */}
        <section id="learnings">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">What you learn</p>
          <h2 className="text-2xl font-bold text-primary mb-3">tone で学べること</h2>
          <p className="text-sm text-text-main leading-relaxed mb-6 max-w-2xl mx-auto">
            tone では、技術だけでなく、声優として進み続けるための「在り方」までを学べます。
            説明会では、それぞれの中身を具体的にご紹介します。
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {learnings.map((item, i) => (
              <div key={i} className="card p-5 sm:p-6">
                <h3 className="text-sm sm:text-base font-bold text-primary leading-relaxed mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-text-sub leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 当日のながれ */}
        <section id="agenda">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Agenda</p>
          <h2 className="text-2xl font-bold text-primary mb-3">当日のながれ</h2>
          <p className="text-sm text-text-main leading-relaxed mb-6 max-w-2xl mx-auto">
            所要時間は約60分です。後半には質疑応答（Q&A）の時間を設けています。
          </p>
          <ul className="space-y-0 inline-block text-left">
            {agenda.map((item, i) => (
              <li key={i} className="flex gap-4 items-start pb-5 last:pb-0">
                <span className="text-xs font-bold text-primary tabular-nums w-12 text-center pt-0.5 flex-shrink-0">
                  {item.time}
                </span>
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="w-3 h-3 rounded-full bg-primary mt-1" />
                  {i < agenda.length - 1 && <span className="w-px flex-1 bg-primary/30 mt-1" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-bold text-text-main leading-relaxed">{item.title}</p>
                  <p className="text-xs text-text-sub mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 登壇者 */}
        <section id="speakers">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Speakers</p>
          <h2 className="text-2xl font-bold text-primary mb-6">登壇者</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {speakers.map((p) => (
              <div key={p.name} className="card overflow-hidden">
                <div className="relative h-64" style={{ maxWidth: "210px", margin: "auto" }}>
                  <Image src={p.image} alt={p.name} fill className="object-contain object-center" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary text-center mb-0.5">{p.name}</h3>
                  <p className="text-text-sub text-xs text-center mb-3">{p.role}</p>
                  <p className="text-xs text-text-main leading-relaxed text-left">{p.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* こんな方におすすめ */}
        <section id="for-you">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">For You</p>
          <h2 className="text-2xl font-bold text-primary mb-6">こんな方におすすめです</h2>
          <ul className="space-y-3 inline-block text-left">
            {targets.map((t, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-accent mt-0.5 text-lg leading-none flex-shrink-0">✓</span>
                <p className="text-sm text-text-main leading-relaxed">{t}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section id="faq">
          <p className="text-text-sub text-xs tracking-widest uppercase mb-2">FAQ</p>
          <h2 className="text-2xl font-bold text-primary mb-6">よくあるご質問</h2>
          <div className="space-y-4 text-left">
            {faq.map((item, i) => (
              <div key={i} className="card p-5">
                <p className="text-sm font-bold text-primary mb-1.5">Q. {item.q}</p>
                <p className="text-sm text-text-main leading-relaxed">A. {item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 申込（公式LINE） */}
        <section id="apply">
          <div className="card p-6 sm:p-8 bg-section-bg border-2 border-primary">
            <div className="text-center mb-8">
              <p className="text-text-sub text-xs tracking-widest uppercase mb-2">Apply</p>
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">お申し込み方法</h2>
              <p className="text-sm text-text-sub leading-relaxed">
                お申し込みは <strong className="text-text-main font-bold">tone 公式LINE</strong> から。<br />
                友だち追加して、参加希望日をトークで送るだけです。
              </p>
            </div>

            {/* 3ステップ */}
            <ol className="inline-block text-left space-y-4 mb-8">
              {[
                { step: "STEP 1", text: "下のボタンから tone 公式LINEを友だち追加" },
                { step: "STEP 2", text: "トークで参加希望日を送信（下の文をそのまま送ってください）" },
                { step: "STEP 3", text: "自動返信で届く参加URLから、当日Zoomにご参加ください" },
              ].map((s) => (
                <li key={s.step} className="flex gap-3 items-start">
                  <span className="text-[11px] font-bold text-white bg-primary px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <p className="text-sm text-text-main leading-relaxed">{s.text}</p>
                </li>
              ))}
            </ol>

            {/* 希望日ごとの送信文言 */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {schedule.map((s) => (
                <div key={s.label} className="bg-card-bg rounded-xl p-5 text-center border border-primary/20">
                  <span className="text-xs font-bold text-white bg-primary px-3 py-1 rounded-full">
                    {s.label}
                  </span>
                  <p className="text-base font-bold text-text-main mt-3">{s.date}</p>
                  <p className="text-text-sub text-sm mt-1 mb-4">{s.time}</p>
                  <p className="text-xs text-text-sub mb-1.5">この日程の送信文</p>
                  <p className="text-sm font-bold text-primary bg-page-bg rounded-lg px-3 py-2 border border-primary/20">
                    {s.keyword}
                  </p>
                </div>
              ))}
            </div>

            {/* LINEボタン */}
            <div className="text-center">
              <a
                href={LINE_URL}
                className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#06C755" }}
              >
                公式LINEを友だち追加する
              </a>
              <p className="text-xs text-text-sub mt-3">
                ※ 両日とも同じ内容です。ご都合の良い日程をお選びください。
              </p>
            </div>
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
            <a href="/terms" className="hover:text-white transition-colors">利用規約</a>
            <a href="/tokusho" className="hover:text-white transition-colors">特定商取引法に基づく表記</a>
          </nav>
          <p className="text-center text-white/40 text-xs">© 2026 tone / GREEN NOTE All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
