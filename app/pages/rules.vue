<script setup lang="ts">
/**
 * 活動辦法。
 * 參照政府活動網站慣用的條文式版面：章節編號、橫線分隔、重點粗體，
 * 但配色沿用活動主視覺。這是全站唯一適合使用精確條文語氣的頁面。
 */

interface RuleItem {
  text: string
  subs?: string[]
}
interface Chapter {
  id: string
  no: string
  title: string
  intro?: string
  items: RuleItem[]
}

const chapters: Chapter[] = [
  {
    id: 'period',
    no: '一',
    title: '活動期間',
    items: [
      { text: `活動期間自 <b>${CAMPAIGN.startDate}</b> 起至 <b>${CAMPAIGN.endDate}</b> 止，為期二個月。` },
      { text: `優惠券之使用期限為發券後 <b>${CAMPAIGN.couponValidDays} 天</b>內，且不得超過活動結束日。` },
      { text: '活動期間內，主辦單位得視實際執行情形調整活動內容，並於官方網站公告。' }
    ]
  },
  {
    id: 'eligibility',
    no: '二',
    title: '參加對象與資格',
    items: [
      { text: '凡完成本活動會員註冊者，均可參加。' },
      {
        text: '註冊時須擇一選擇身分別，並以通訊地址交叉判別：',
        subs: [
          '雲林在地：設籍或居住於雲林縣內。',
          '外地旅客：設籍或居住於雲林縣以外地區。'
        ]
      },
      { text: '兩種身分之<b>獎勵條件完全相同</b>，身分別僅供活動統計與成效分析之用。' },
      { text: '本活動採<b>一人一帳號</b>控管，以電子郵件信箱及身分證字號進行識別，重複註冊者不予發券。' },
      { text: '填報資料不實者，主辦單位得取消其參加與中獎資格。' }
    ]
  },
  {
    id: 'mission',
    no: '三',
    title: '活動機制：遊樂路線與三段任務',
    intro: `本活動規劃 ${ROUTES.length} 條遊樂路線，引導旅客照行程走訪雲林各觀光亮點，並將消費留在在地合作店家。`,
    items: [
      {
        text: `本活動規劃 <b>${ROUTES.length} 條遊樂路線</b>，旅客可自由選擇一條或多條走訪：`,
        subs: ROUTES.map((r) => `${r.name}：${r.tagline}`)
      },
      { text: '路線僅為建議動線，<b>不限定走訪順序</b>，亦不限定僅能完成單一路線。' },
      {
        text: `活動站點共 <b>${ALL_SPOTS.length} 處</b>，分為兩類：`,
        subs: [
          `${SPOT_KIND.experience.label}（可消費站點）${EXPERIENCE_SPOTS.length} 處：老街、商圈、觀光工廠與食農食漁體驗等，須於現場消費滿 ${CAMPAIGN.minSpend} 元。`,
          `${SPOT_KIND.highlight.label}（不可消費站點）${HIGHLIGHT_SPOTS.length} 處：步道、濕地、風景區等，以拍照打卡完成。`
        ]
      },
      { text: '每一景點於現場設置專屬 QR code。旅客掃碼時，系統擷取所在位置並與景點座標比對，確認到訪後記入該會員之任務進度。' },
      { text: '<b>同一會員於同一景點僅計算一次</b>，重複掃碼不重複計入。' },
      {
        text: `完成「一個${SPOT_KIND.experience.label} ＋ 一個${SPOT_KIND.highlight.label}」為一組，共分三段解鎖獎勵：`,
        subs: [
          '第一段（體驗 ＋ 亮點）：優惠券 250 元',
          '第二段（體驗 ＋ 亮點）：優惠券 250 元',
          '第三段（體驗 ＋ 亮點）：優惠券 500 元'
        ]
      },
      { text: `三段合計 <b>${toComma(CAMPAIGN.quota)} 元</b>，為每人可領取之上限。` },
      { text: '各階段之完成間隔不限，同一日內連續完成三段亦可。' }
    ]
  },
  {
    id: 'issue',
    no: '四',
    title: '優惠券發放',
    items: [
      { text: '完成各階段條件後，系統<b>即時自動核發</b>對應面額之優惠券，不另設審核程序。' },
      { text: '優惠券直接存入旅遊護照之券夾，並以 Email 及 LINE 官方帳號通知。' },
      { text: `每人累計發放上限為 ${toComma(CAMPAIGN.quota)} 元，達上限後不再發放。` }
    ]
  },
  {
    id: 'usage',
    no: '五',
    title: '優惠券使用規則',
    items: [
      { text: '優惠券面額分為 <b>250 元</b>與 <b>500 元</b>兩種。' },
      { text: `每次消費須達 <b>${CAMPAIGN.minSpend} 元</b>以上方可使用優惠券折抵；500 元券亦適用相同門檻，不分級距。` },
      { text: '優惠券<b>不找零</b>。消費金額未達券面額者，差額不予退還；超過部分由消費者自行支付。' },
      { text: '每次消費限使用一張優惠券，不得合併使用。' },
      { text: `優惠券限於本活動<b>合作店家</b>（約 ${CAMPAIGN.storeCount} 家）使用，不得兌換現金或轉讓。` },
      {
        text: '使用方式：',
        subs: [
          '結帳時向店家出示旅遊護照中之優惠券。',
          '由店家確認消費金額並完成折抵。',
          '店家端完成扣券後，該張券即標記為已使用。'
        ]
      },
      { text: '優惠券逾有效期限未使用者，視同放棄，不予補發。' }
    ]
  },
  {
    id: 'privacy',
    no: '六',
    title: '會員與個人資料',
    items: [
      {
        text: '報名參加即表示同意主辦單位於本活動目的範圍內蒐集、處理及利用下列個人資料：',
        subs: [
          '姓名、電子郵件信箱。',
          '通訊地址（供身分別判別之用）。',
          '身分證字號（供身分核對之用）。'
        ]
      },
      { text: '個人資料之利用期間為活動期間及活動結束後依法令規定應保存之期間，利用地區為中華民國境內。' },
      { text: '會員得依個人資料保護法規定，向主辦單位請求查詢、閱覽、補正、刪除或停止利用其個人資料；惟行使前述權利致無法完成活動所需之身分確認者，將無法繼續參加本活動。' },
      { text: '綁定 LINE 官方帳號為選擇性項目，主要用於任務完成與券到帳之通知。' }
    ]
  },
  {
    id: 'notice',
    no: '七',
    title: '注意事項與爭議處理',
    items: [
      { text: '參加者不得以任何不正當方式（包含但不限於偽造位置資訊、大量申辦信箱、代刷等）取得活動資格。經查證屬實者，主辦單位得取消其資格並追回已發放之獎勵。' },
      { text: '系統將持續監控異常之核銷行為；經判定異常者，該筆交易得暫緩結算並進行人工複核。' },
      { text: '如遇天災或其他不可抗力因素，主辦單位得暫停、變更或終止本活動，並於官方網站公告。' },
      { text: '本活動辦法如有未盡事宜，主辦單位保留修改、變更或終止之權利，並以官方網站公告為準。' },
      { text: '參加本活動即視為已詳閱並同意本活動辦法之全部內容。' }
    ]
  }
]

const activeId = ref(chapters[0].id)

/** 桌機側邊目錄：捲動時標示目前章節 */
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length) activeId.value = visible[0].target.id
    },
    { rootMargin: '-88px 0px -70% 0px' }
  )
  chapters.forEach((c) => {
    const el = document.getElementById(c.id)
    if (el) observer.observe(el)
  })
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div>
    <!-- ── 頁首 ─────────────────────────────────── -->
    <section class="relative isolate flex items-center overflow-hidden border-b border-paper-deep min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
      <img
        src="/images/kv-banner.jpg"
        alt="捲動國旅 活動橫幅"
        class="absolute inset-0 -z-10 size-full object-cover"
      >
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-paper via-paper/85 to-paper/30" />

      <div class="container-page py-10">
        <span class="chip bg-ink text-white">
          <UIcon name="i-lucide-scroll-text" class="size-3.5" />活動辦法
        </span>
        <h1 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">
          {{ CAMPAIGN.county }}{{ CAMPAIGN.title }}活動辦法
        </h1>
        <p class="mt-2 text-sm text-ink-soft">
          活動期間 {{ CAMPAIGN.startDate }} – {{ CAMPAIGN.endDate }}　｜
          主辦：{{ CAMPAIGN.county }}政府　｜　合作：{{ CAMPAIGN.partner }}
        </p>
      </div>
    </section>

    <div class="container-page py-8 sm:py-10">
      <div class="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <!-- ── 目錄（桌機側欄）───────────────────── -->
        <nav class="lg:sticky lg:top-24 lg:self-start">
          <p class="text-xs font-black tracking-widest text-ink-faint">目錄</p>
          <ol class="mt-3 space-y-0.5 border-l-2 border-paper-deep">
            <li v-for="c in chapters" :key="c.id">
              <a
                :href="`#${c.id}`"
                class="-ml-0.5 block border-l-2 py-1.5 pl-3 text-sm font-bold transition-colors"
                :class="activeId === c.id
                  ? 'border-vermilion-500 text-vermilion-600'
                  : 'border-transparent text-ink-soft hover:text-ink'"
              >{{ c.no }}、{{ c.title }}</a>
            </li>
          </ol>
        </nav>

        <!-- ── 條文本體 ───────────────────────────── -->
        <article class="max-w-3xl">
          <section
            v-for="c in chapters"
            :key="c.id"
            :id="c.id"
            class="scroll-mt-24 pb-10 last:pb-0"
          >
            <h2 class="border-b-2 border-ink pb-2.5 text-xl font-black text-ink sm:text-2xl">
              {{ c.no }}、{{ c.title }}
            </h2>

            <p v-if="c.intro" class="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              {{ c.intro }}
            </p>

            <ol class="mt-4 space-y-3.5">
              <li v-for="(item, i) in c.items" :key="i" class="flex gap-3">
                <span
                  class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-paper-deep text-[11px] font-black text-ink-soft"
                >{{ i + 1 }}</span>

                <div class="min-w-0 flex-1">
                  <p class="text-sm leading-relaxed text-ink sm:text-[15px]" v-html="item.text" />

                  <ul v-if="item.subs" class="mt-2 space-y-1.5">
                    <li
                      v-for="(sub, j) in item.subs"
                      :key="j"
                      class="flex gap-2 text-sm leading-relaxed text-ink-soft"
                    >
                      <span class="mt-2 size-1.5 shrink-0 rounded-full bg-vermilion-300" />
                      <span>{{ sub }}</span>
                    </li>
                  </ul>
                </div>
              </li>
            </ol>
          </section>

          <!-- 頁尾行動 -->
          <div class="mt-4 rounded-card bg-paper-soft p-6 text-center sm:p-8">
            <h2 class="text-lg font-black sm:text-xl">看完了，出發吧</h2>
            <p class="mt-1.5 text-sm text-ink-soft">走訪五條遊樂路線，最高帶走 {{ toComma(CAMPAIGN.quota) }} 元優惠券。</p>
            <div class="mt-5 flex flex-wrap justify-center gap-3">
              <UButton to="/register" color="primary" size="lg" icon="i-lucide-user-plus" class="rounded-full font-bold">
                馬上參加
              </UButton>
              <UButton to="/events" color="neutral" variant="outline" size="lg" icon="i-lucide-map" class="rounded-full font-bold">
                看活動景點
              </UButton>
            </div>
          </div>

        </article>
      </div>
    </div>
  </div>
</template>
