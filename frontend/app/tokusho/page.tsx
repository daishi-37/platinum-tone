export default function TokushoPage() {
  const items = [
    {
      label: "販売業者の名称",
      value: "プリズムレイン",
    },
    {
      label: "運営統括責任者",
      value: "仙台エリ",
    },
    {
      label: "所在地",
      value: "〒170-0013\n東京都豊島区東池袋２丁目６２番８号 BIGオフィスプラザ池袋１２０６",
    },
    {
      label: "電話番号",
      value: "080-5612-9464\n（受付時間 10:00〜18:00、土日祝を除く）",
    },
    {
      label: "メールアドレス",
      value: "info33@tone-ac.com",
    },
    {
      label: "販売価格",
      value: "月額 9,350円（税込）",
    },
    {
      label: "追加手数料等の追加料金",
      value: "個人・グループレッスンに関しては別途お見積りとなります。",
    },
    {
      label: "交換および返品（返金ポリシー）",
      value: "＜契約の申込みの撤回・解除（返金）について＞\n商品の性質上、デジタルコンテンツ及びオンラインサービスの提供開始後のお客様都合による返金・返品は原則としてお受けできません。契約期間中の解約（退会）はいつでも可能ですが、日割り精算による返金は行いません。解約手続きが完了した時点で、次回の決済は発生いたしません。\n\n＜サービスに瑕疵がある場合＞\nサービスに不具合や技術的な問題が発生し、サービスの継続的な利用が困難と当社が判断した場合、調査の上、速やかに適切な対応をいたします。対応が困難な場合は、残存契約期間に応じた返金を行うことがあります。",
    },
    {
      label: "引渡時期",
      value: "基本決済後即時にサービスをご利用いただけます。システム上のトラブル等、やむを得ない事情により対応に時間がかかる場合は、2〜3日程度お時間をいただく場合がございます。",
    },
    {
      label: "受け付け可能な決済手段",
      value: "クレジットカード決済のみ",
    },
    {
      label: "決済期間",
      value: "即時処理",
    },
  ]

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-primary mb-2">特定商取引法に基づく表記</h1>
      <p className="text-text-sub text-sm mb-10">
        特定商取引法第11条に基づき、以下の事項を表示します。
      </p>

      <div className="space-y-0 border-t border-gray-200">
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col sm:flex-row border-b border-gray-200 py-5 gap-2 sm:gap-8">
            <dt className="text-sm font-medium text-primary sm:w-48 flex-shrink-0">{label}</dt>
            <dd className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
      </div>
    </main>
  )
}
