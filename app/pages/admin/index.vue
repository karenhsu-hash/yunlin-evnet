<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { totalIssued, totalRedeemed, redeemRate, latest, weekly } = useAdmin()

/** 最近兩週的週增率，供 KPI 顯示方向 */
const prev = WEEKLY[WEEKLY.length - 2]
const friendsDelta = ((latest.value.friends - prev.friends) / prev.friends) * 100
const membersDelta = ((latest.value.members - prev.members) / prev.members) * 100
const issuedDelta = ((latest.value.issued - prev.issued) / prev.issued) * 100
const redeemedDelta = ((latest.value.redeemed - prev.redeemed) / prev.redeemed) * 100

/** 無障礙：圖表一律提供表格檢視 */
const showTable = ref(false)

const flaggedStores = computed(() => STORES.filter((s) => s.flagged))
</script>

<template>
  <div>
    <!-- ── KPI ──────────────────────────────────── -->
    <section>
      <h2 class="text-lg font-black">活動總覽</h2>
      <p class="mt-0.5 text-xs text-ink-soft">
        {{ CAMPAIGN.startDate }} – {{ CAMPAIGN.endDate }} ‧ 資料截至 {{ latest.week }}
      </p>

      <div class="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatTile
          label="LINE 好友累計" icon="i-lucide-message-circle"
          :value="toComma(latest.friends)" :delta="friendsDelta" hint="較上週"
        />
        <StatTile
          label="會員數累計" icon="i-lucide-users"
          :value="toComma(latest.members)" :delta="membersDelta" hint="較上週"
        />
        <StatTile
          label="發券總金額" icon="i-lucide-ticket"
          :value="toWan(totalIssued)" :delta="issuedDelta" hint="較上週"
        />
        <StatTile
          label="核銷總金額" icon="i-lucide-store"
          :value="toWan(totalRedeemed)" :delta="redeemedDelta" hint="較上週"
        />
      </div>

      <div class="mt-2.5 card flex items-center gap-3 p-3.5">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-bold text-ink-soft">核銷率</p>
          <p class="mt-0.5 text-xs text-ink-faint">
            核銷 {{ toWan(totalRedeemed) }} ÷ 發券 {{ toWan(totalIssued) }}
          </p>
        </div>
        <p class="shrink-0 text-2xl font-black tabular-nums">{{ redeemRate.toFixed(1) }}%</p>
      </div>
    </section>

    <!-- ── 發券 vs 核銷 ─────────────────────────── -->
    <section class="mt-6">
      <div class="card p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="font-black">每週發券與核銷金額</h2>
            <p class="mt-0.5 text-xs text-ink-soft">兩者同為金額，共用一條 Y 軸</p>
          </div>
          <button
            class="shrink-0 rounded-full border-2 border-paper-deep px-2.5 py-2 text-[11px] font-bold text-ink-soft"
            @click="showTable = !showTable"
          >{{ showTable ? '看圖表' : '看表格' }}</button>
        </div>

        <div v-if="!showTable" class="mt-3">
          <ChartBarGrouped :data="weekly" />
        </div>

        <!-- 表格檢視 -->
        <div v-else class="mt-3 overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">週次</th>
                <th class="py-2 pr-3 text-right font-bold">發券金額</th>
                <th class="py-2 text-right font-bold">核銷金額</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in weekly" :key="w.week" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">{{ w.week }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(w.issued) }}</td>
                <td class="py-2 text-right tabular-nums">{{ toComma(w.redeemed) }}</td>
              </tr>
              <tr class="font-black">
                <td class="py-2 pr-3">合計</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(totalIssued) }}</td>
                <td class="py-2 text-right tabular-nums">{{ toComma(totalRedeemed) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ── 成長 small multiples ─────────────────── -->
    <section class="mt-4">
      <div class="card p-4">
        <h2 class="font-black">好友與會員成長</h2>
        <p class="mt-0.5 text-xs text-ink-soft">兩張小倍數圖各自只有一個系列，標題即系列名</p>
        <div class="mt-3 grid grid-cols-2 gap-2.5">
          <ChartSparkArea
            title="LINE 好友"
            :points="weekly.map((w) => w.friends)"
            :labels="weekly.map((w) => w.week)"
          />
          <ChartSparkArea
            title="會員數"
            :points="weekly.map((w) => w.members)"
            :labels="weekly.map((w) => w.week)"
          />
        </div>
      </div>
    </section>

    <!-- ── 漏斗 + 景點排行 ──────────────────────── -->
    <section class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div class="card p-4">
        <h2 class="font-black">參與漏斗</h2>
        <p class="mt-0.5 mb-3 text-xs text-ink-soft">從加好友到實際使用優惠券</p>
        <ChartFunnel :data="FUNNEL" />
      </div>

      <div class="card p-4">
        <h2 class="font-black">站點集章排行</h2>
        <p class="mt-0.5 mb-3 text-xs text-ink-soft">
          全部 {{ ALL_SPOTS.length }} 站，取前 {{ SPOT_RANK.length }} 名
        </p>
        <ChartBarRank :data="SPOT_RANK" />
      </div>
    </section>

    <!-- ── 異常告警 ─────────────────────────────── -->
    <section class="mt-4">
      <div class="card p-4">
        <div class="flex items-center gap-2">
          <h2 class="font-black">異常核銷告警</h2>
          <span class="chip bg-vermilion-100 text-vermilion-700">{{ flaggedStores.length }} 筆</span>
        </div>
        <p class="mt-0.5 text-xs text-ink-soft">短時間大量或集中核銷，需人工複核</p>

        <ul class="mt-3 space-y-2">
          <li
            v-for="s in flaggedStores"
            :key="s.id"
            class="flex items-center gap-3 rounded-2xl bg-vermilion-50 px-3 py-2.5"
          >
            <UIcon name="i-lucide-triangle-alert" class="size-5 shrink-0 text-vermilion-600" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold truncate">{{ s.name }}</p>
              <p class="text-[11px] text-ink-soft">{{ s.town }} ‧ 統編 {{ s.taxId }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-black tabular-nums">{{ toComma(s.count) }} 筆</p>
              <p class="text-[10px] text-ink-faint">${{ toComma(s.amount) }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- ── 抽獎統計 ─────────────────────────────── -->
    <section class="mt-4">
      <div class="card p-4">
        <h2 class="font-black">抽獎統計</h2>
        <p class="mt-0.5 text-xs text-ink-soft">
          資格＝累積點數 ÷ {{ toComma(CAMPAIGN.lotteryUnit) }} ＋ 完成的推薦路線數；
          開獎與寄送為人工作業
        </p>
        <div class="mt-3 grid grid-cols-3 gap-2.5">
          <div v-for="w in LOTTERY_WEEKS" :key="w.id" class="rounded-2xl bg-paper-soft px-3 py-2.5">
            <p class="text-[11px] font-bold text-ink-soft">{{ w.label }}</p>
            <p class="mt-0.5 text-lg font-black leading-none tabular-nums">{{ toComma(w.entries) }}</p>
            <p class="mt-0.5 text-[10px] text-ink-faint">次 ‧ {{ toComma(w.eligible) }} 人</p>
          </div>
        </div>
        <UButton
          to="/admin/lottery"
          color="neutral"
          variant="outline"
          class="mt-4 rounded-full font-bold"
          trailing-icon="i-lucide-chevron-right"
        >產生中獎名單</UButton>
      </div>
    </section>
  </div>
</template>
