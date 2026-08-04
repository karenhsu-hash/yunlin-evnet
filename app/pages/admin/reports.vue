<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { totalIssued, totalRedeemed, redeemRate, canEdit, weekly } = useAdmin()

type Tab = 'weekly' | 'summary' | 'effect'
const tab = ref<Tab>('weekly')

const tabs: { key: Tab; label: string }[] = [
  { key: 'weekly', label: '店家核銷週報' },
  { key: 'summary', label: '全案核銷總表' },
  { key: 'effect', label: '活動成效' }
]

/** 週次選擇 */
const week = ref('W8')
const weekData = computed(() => WEEKLY.find((w) => w.week === week.value)!)

/** 該週各店家的核銷分攤（依店家佔比推估，示意用） */
const storeTotal = STORES.reduce((s, x) => s + x.amount, 0)
const weeklyRows = computed(() =>
  STORES.map((s) => {
    const share = s.amount / storeTotal
    const amount = Math.round((weekData.value.redeemed * share) / 50) * 50
    const count = Math.max(1, Math.round(s.count * share * 2))
    return { ...s, weekAmount: amount, weekCount: count }
  })
)
const weeklySum = computed(() => weeklyRows.value.reduce((s, r) => s + r.weekAmount, 0))

const exported = ref('')
function flash(msg: string) {
  exported.value = msg
  setTimeout(() => (exported.value = ''), 2600)
}

function exportWeekly() {
  downloadCsv(`核銷週報_${week.value}.csv`, [
    ['店家名稱', '統一編號', '鄉鎮市', '核銷筆數', '核銷金額'],
    ...weeklyRows.value.map((r) => [r.name, r.taxId, r.town, r.weekCount, r.weekAmount]),
    ['合計', '', '', weeklyRows.value.reduce((s, r) => s + r.weekCount, 0), weeklySum.value]
  ])
  flash(`已匯出 核銷週報_${week.value}.csv`)
}

function exportSummary() {
  downloadCsv('全案核銷總表.csv', [
    ['週次', '發券金額', '核銷金額', '核銷率'],
    ...WEEKLY.map((w) => [w.week, w.issued, w.redeemed, `${((w.redeemed / w.issued) * 100).toFixed(1)}%`]),
    ['合計', totalIssued.value, totalRedeemed.value, `${redeemRate.value.toFixed(1)}%`]
  ])
  flash('已匯出 全案核銷總表.csv')
}

/** 活動成效指標（GA 串接示意） */
const GA = [
  { label: '網站工作階段', value: '186,420', hint: '較上週 +8.2%' },
  { label: '不重複使用者', value: '58,930', hint: '較上週 +6.4%' },
  { label: '平均停留時間', value: '3 分 12 秒', hint: '較上週 +4.1%' },
  { label: '掃碼頁跳出率', value: '18.6%', hint: '較上週 -2.3%' }
]
</script>

<template>
  <div>
    <section>
      <h2 class="text-lg font-black">報表與請款</h2>
      <p class="mt-0.5 text-xs text-ink-soft">週結算核銷請款，報表自動生成後匯出對帳</p>
    </section>

    <!-- 分頁 -->
    <div class="mt-3 flex gap-1 overflow-x-auto no-scrollbar">
      <button
        v-for="t in tabs" :key="t.key"
        class="shrink-0 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors"
        :class="tab === t.key ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
        @click="tab = t.key"
      >{{ t.label }}</button>
    </div>

    <!-- 匯出提示 -->
    <p v-if="exported" class="mt-3 flex items-center gap-1.5 rounded-2xl bg-moss-100 px-3.5 py-2.5 text-xs font-bold text-moss-700 animate-pop-in">
      <UIcon name="i-lucide-circle-check" class="size-4" />{{ exported }}
    </p>

    <!-- ── 店家核銷週報 ─────────────────────────── -->
    <section v-if="tab === 'weekly'" class="mt-4">
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-2">
          <label class="text-xs font-bold text-ink-soft" for="wk">結算週次</label>
          <select
            id="wk" v-model="week"
            class="rounded-xl border-2 border-paper-deep bg-white px-2.5 py-1.5 text-xs font-bold outline-none"
          >
            <option v-for="w in weekly" :key="w.week" :value="w.week">{{ w.week }}</option>
          </select>
          <!-- 匯出兩種權限皆可（主辦唯讀亦得檢視與匯出） -->
          <button
            class="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-moss-500 px-3.5 py-1.5 text-xs font-bold text-white"
            @click="exportWeekly"
          ><UIcon name="i-lucide-download" class="size-3.5" />匯出 Excel</button>
        </div>

        <div class="mt-3.5 overflow-x-auto">
          <table class="w-full min-w-[520px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">店家</th>
                <th class="py-2 pr-3 font-bold">統編</th>
                <th class="py-2 pr-3 font-bold">鄉鎮市</th>
                <th class="py-2 pr-3 text-right font-bold">核銷筆數</th>
                <th class="py-2 text-right font-bold">核銷金額</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in weeklyRows" :key="r.id" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">
                  {{ r.name }}
                  <span v-if="r.flagged" class="ml-1 chip bg-vermilion-100 text-vermilion-700">異常</span>
                </td>
                <td class="py-2 pr-3 tabular-nums text-ink-soft">{{ r.taxId }}</td>
                <td class="py-2 pr-3 text-ink-soft">{{ r.town }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(r.weekCount) }}</td>
                <td class="py-2 text-right tabular-nums font-bold">${{ toComma(r.weekAmount) }}</td>
              </tr>
              <tr class="font-black">
                <td class="py-2.5 pr-3" colspan="3">{{ week }} 合計</td>
                <td class="py-2.5 pr-3 text-right tabular-nums">
                  {{ toComma(weeklyRows.reduce((s, r) => s + r.weekCount, 0)) }}
                </td>
                <td class="py-2.5 text-right tabular-nums">${{ toComma(weeklySum) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-3 rounded-2xl bg-paper-soft px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
          週報於每週結算日自動生成，供店家對帳與本公司彙整請款；異常標記之店家須人工複核後才計入請款。
        </p>
      </div>
    </section>

    <!-- ── 全案核銷總表 ─────────────────────────── -->
    <section v-else-if="tab === 'summary'" class="mt-4">
      <div class="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile label="發券總額" :value="`$${toComma(totalIssued)}`" hint="全案累計" icon="i-lucide-ticket" />
        <StatTile label="核銷總額" :value="`$${toComma(totalRedeemed)}`" hint="全案累計" icon="i-lucide-store" />
        <StatTile label="核銷率" :value="`${redeemRate.toFixed(1)}%`" hint="核銷 ÷ 發券" icon="i-lucide-trending-up" />
        <StatTile label="未核銷餘額" :value="`$${toComma(totalIssued - totalRedeemed)}`" hint="含未到期與過期" icon="i-lucide-hourglass" />
      </div>

      <div class="mt-3 card p-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-black">逐週明細</h3>
          <button class="inline-flex shrink-0 items-center gap-1 rounded-full bg-moss-500 px-3.5 py-1.5 text-xs font-bold text-white" @click="exportSummary">
            <UIcon name="i-lucide-download" class="size-3.5" />匯出 Excel
          </button>
        </div>

        <div class="mt-3 overflow-x-auto">
          <table class="w-full min-w-[420px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">週次</th>
                <th class="py-2 pr-3 text-right font-bold">發券金額</th>
                <th class="py-2 pr-3 text-right font-bold">核銷金額</th>
                <th class="py-2 text-right font-bold">核銷率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in weekly" :key="w.week" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">{{ w.week }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">${{ toComma(w.issued) }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">${{ toComma(w.redeemed) }}</td>
                <td class="py-2 text-right tabular-nums">{{ ((w.redeemed / w.issued) * 100).toFixed(1) }}%</td>
              </tr>
              <tr class="font-black">
                <td class="py-2.5 pr-3">合計</td>
                <td class="py-2.5 pr-3 text-right tabular-nums">${{ toComma(totalIssued) }}</td>
                <td class="py-2.5 pr-3 text-right tabular-nums">${{ toComma(totalRedeemed) }}</td>
                <td class="py-2.5 text-right tabular-nums">{{ redeemRate.toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-3 rounded-2xl bg-marigold-50 px-3 py-2.5 text-[11px] leading-relaxed text-marigold-700">
          本表供縣府對帳與請款依據；發券與核銷金額之差額為尚未使用或已過期之券，不列入請款。
        </p>
      </div>
    </section>

    <!-- ── 活動成效 ─────────────────────────────── -->
    <section v-else class="mt-4">
      <div class="card p-4">
        <h3 class="font-black">網站流量（GA 串接）</h3>
        <div class="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <div v-for="g in GA" :key="g.label" class="rounded-2xl bg-paper-soft px-3 py-2.5">
            <p class="text-[11px] font-bold text-ink-soft">{{ g.label }}</p>
            <p class="mt-0.5 text-lg font-black leading-none tabular-nums">{{ g.value }}</p>
            <p class="mt-0.5 text-[10px] text-ink-faint">{{ g.hint }}</p>
          </div>
        </div>
      </div>

      <div class="mt-3 grid gap-4 lg:grid-cols-2">
        <div class="card p-4">
          <h3 class="font-black">參與漏斗</h3>
          <p class="mt-0.5 mb-3 text-xs text-ink-soft">各級轉換率</p>
          <ChartFunnel :data="FUNNEL" />
        </div>

        <div class="card p-4">
          <h3 class="font-black">消費金額結構</h3>
          <p class="mt-0.5 text-xs text-ink-soft">由核銷紀錄推估之實際消費</p>

          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between border-b border-paper-deep pb-2">
              <dt class="text-ink-soft">折價券折抵金額</dt>
              <dd class="font-bold tabular-nums">${{ toComma(totalRedeemed) }}</dd>
            </div>
            <div class="flex justify-between border-b border-paper-deep pb-2">
              <dt class="text-ink-soft">消費者自付金額</dt>
              <dd class="font-bold tabular-nums">${{ toComma(Math.round(totalRedeemed * 0.78)) }}</dd>
            </div>
            <div class="flex justify-between border-b border-paper-deep pb-2">
              <dt class="text-ink-soft">帶動總消費</dt>
              <dd class="font-black tabular-nums">${{ toComma(Math.round(totalRedeemed * 1.78)) }}</dd>
            </div>
            <div class="flex justify-between pt-1">
              <dt class="font-bold">每 1 元補助帶動</dt>
              <dd class="text-lg font-black tabular-nums">1.78 元</dd>
            </div>
          </dl>

          <p class="mt-3 rounded-2xl bg-paper-soft px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
            券不找零、最低消費 {{ CAMPAIGN.minSpend }} 元的設計，使每張券都必然帶出額外自付消費，
            是槓桿倍數的主要來源。
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
