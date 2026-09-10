<script setup lang="ts">
/**
 * 我的旅遊護照 —— 原本的「會員中心」。
 *
 * 從護照的角度重新組織：頁首是護照的個人資料頁（持有人、護照號碼、簽發身分、
 * 有效期限），內容三頁分別是印章頁、券夾與使用紀錄。
 *
 * 最大的改動在印章頁：原本是兩欄的文字清單，改成把全部站點攤成印章格，
 * 蓋過的顯示彩色印章、沒蓋的留虛線空格 —— 護照真正好玩的地方就是那一頁的空格。
 */
const {
  isLoggedIn, member, coupons, completedStages, walletAmount, earnedAmount,
  checkedIn, isCheckedIn, routeProgress, resetDemo
} = useCampaign()
const { redeemRecords } = useMember()

type Tab = 'stamps' | 'coupon' | 'redeem'
const tab = ref<Tab>('stamps')

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'stamps', label: '印章頁', icon: 'i-lucide-stamp' },
  { key: 'coupon', label: '我的券夾', icon: 'i-lucide-ticket' },
  { key: 'redeem', label: '使用紀錄', icon: 'i-lucide-receipt-text' }
]

const usedTotal = computed(() => redeemRecords.value.reduce((s, r) => s + r.couponValue, 0))

/**
 * 護照號碼：從信箱推出一組穩定的編號，重新整理不會變。
 * 只是呈現用的識別碼，不具任何驗證意義。
 */
const passportNo = computed(() => {
  const seed = [...(member.value.email || 'guest')].reduce((n, c) => n + c.charCodeAt(0), 0)
  return `YL-2026-${String(seed % 100000).padStart(5, '0')}`
})

/** 印章頁：全部站點，蓋過的排前面，讓已完成的成果先被看到 */
const stampPage = computed(() =>
  [...ALL_SPOTS].sort((a, b) => Number(isCheckedIn(b.id)) - Number(isCheckedIn(a.id)))
)

/**
 * 每枚印章給一點角度，看起來像手蓋上去的。
 * 用 id 推導而非隨機，否則每次重繪角度都會跳動。
 */
const tiltOf = (id: string) =>
  ((([...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 9) - 4) * 1.5).toFixed(1)
</script>

<template>
  <div>
    <!-- 未登入：整頁以登入提示取代 -->
    <div v-if="!isLoggedIn" class="container-narrow py-12 sm:py-20">
      <LoginGate
        title="登入後查看你的旅遊護照"
        desc="登入後就能看到你蓋了哪些章、拿到哪些券，以及用在哪些店家。"
        icon="i-lucide-book-marked"
      />
    </div>

    <template v-else>
    <!-- ── 護照個人資料頁 ───────────────────────── -->
    <section class="relative overflow-hidden bg-indigoink-500 text-white">
      <!-- 環境裝飾：壓低透明度，不跟資料搶注意力 -->
      <img
        src="/images/art/sun.webp" alt="" aria-hidden="true"
        class="pointer-events-none absolute -right-10 -top-10 w-36 opacity-20 sm:w-48"
      >
      <img
        src="/images/art/cloud-white.webp" alt="" aria-hidden="true"
        class="pointer-events-none absolute right-32 top-20 hidden w-40 opacity-10 lg:block"
      >

      <div class="container-page relative py-8 sm:py-10">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="chip bg-white/15 text-white">
            <UIcon name="i-lucide-book-marked" class="size-3.5" />雲林旅遊護照
          </span>
          <span class="font-mono text-[11px] tracking-[0.2em] text-white/60">
            {{ passportNo }}
          </span>
        </div>

        <div class="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-4">
            <!-- 護照的證件照位 -->
            <span
              class="grid place-items-center size-16 shrink-0 rounded-xl bg-white/15 ring-2 ring-white/25 sm:size-20"
            >
              <UIcon :name="member.avatar" class="size-8 sm:size-10" />
            </span>
            <div class="min-w-0">
              <p class="text-[10px] tracking-[0.2em] text-white/50">持有人 ‧ HOLDER</p>
              <h1 class="text-2xl font-black leading-tight sm:text-3xl">{{ member.name }}</h1>
              <p class="truncate text-xs text-white/70">{{ member.email }}</p>
              <div class="mt-2 flex flex-wrap items-center gap-1.5">
                <span class="chip bg-white/20 text-white">
                  {{ member.identity === 'visitor' ? '外地旅客' : '雲林在地' }}
                </span>
                <span v-if="member.lineBound" class="chip bg-moss-500 text-white">
                  <UIcon name="i-lucide-message-circle" class="size-3" />LINE 已綁定
                </span>
                <NuxtLink v-else to="/register" class="chip bg-marigold-500 text-ink">去綁定 LINE</NuxtLink>
              </div>
            </div>
          </div>

          <dl class="grid grid-cols-3 gap-2.5 sm:gap-4 lg:w-[380px]">
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">已蓋章</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">
                {{ checkedIn.length }}<span class="text-[10px] font-bold"> /{{ ALL_SPOTS.length }}</span>
              </dd>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">已解鎖</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">
                {{ completedStages }}<span class="text-[10px] font-bold"> /3 段</span>
              </dd>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">券夾餘額</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">
                <span class="text-[10px] align-top">$</span>{{ walletAmount }}
              </dd>
            </div>
          </dl>
        </div>

        <p class="mt-5 border-t border-white/15 pt-3 text-[11px] text-white/50">
          有效期限 {{ CAMPAIGN.startDate }} – {{ CAMPAIGN.endDate }}
        </p>
      </div>
    </section>

    <!-- ── 護照內頁的水彩風景帶。純裝飾，虛線是護照的頁緣 ── -->
    <div aria-hidden="true" class="container-page">
      <div class="flex items-end justify-center gap-3 pt-5 sm:gap-7">
        <img src="/images/art/tree-pine.webp" alt="" class="h-11 w-auto sm:h-16">
        <img src="/images/art/farmhouse.webp" alt="" class="h-8 w-auto sm:h-12">
        <img src="/images/art/grove.webp" alt="" class="h-12 w-auto sm:h-[4.5rem]">
        <img src="/images/art/car-family.webp" alt="" class="h-10 w-auto sm:h-14">
        <img src="/images/art/boat.webp" alt="" class="hidden h-10 w-auto sm:block sm:h-14">
        <img src="/images/art/tree-round.webp" alt="" class="hidden h-12 w-auto sm:block sm:h-16">
      </div>
      <div class="mt-1 border-b-2 border-dashed border-paper-deep" />
    </div>

    <div class="container-page py-6 sm:py-8">
      <div class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <!-- ── 護照分頁（桌機為側欄）───────────────── -->
        <nav class="lg:sticky lg:top-24 lg:self-start">
          <div class="flex gap-1.5 overflow-x-auto no-scrollbar lg:flex-col lg:gap-1">
            <button
              v-for="t in tabs"
              :key="t.key"
              class="flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition-colors lg:w-full"
              :class="tab === t.key ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:bg-paper-deep/50'"
              @click="tab = t.key"
            >
              <UIcon :name="t.icon" class="size-4.5 shrink-0" />
              {{ t.label }}
            </button>
          </div>

          <button
            class="mt-6 hidden w-full text-left text-[11px] text-ink-faint underline lg:block"
            @click="resetDemo"
          >重置我的紀錄</button>
        </nav>

        <!-- ── 內容 ──────────────────────────────── -->
        <div>
          <!-- 印章頁 -->
          <div v-if="tab === 'stamps'" class="space-y-4">
            <!-- 集章獎勵 -->
            <div class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h2 class="text-lg font-black sm:text-xl">集章獎勵</h2>
                <span class="text-xs text-ink-soft">
                  累計取得 <b class="text-marigold-700">{{ earnedAmount }}</b> 元
                </span>
              </div>
              <div class="mt-4">
                <StageProgress :completed="completedStages" />
              </div>
            </div>

            <!-- 印章格 -->
            <div class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h3 class="text-lg font-black">我的印章</h3>
                <span class="text-xs text-ink-soft">
                  {{ checkedIn.length }} / {{ ALL_SPOTS.length }} 枚
                </span>
              </div>

              <ul class="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-5">
                <li v-for="spot in stampPage" :key="spot.id" class="flex flex-col items-center text-center">
                  <span
                    class="grid size-[4.5rem] place-items-center rounded-full transition-transform sm:size-20"
                    :class="isCheckedIn(spot.id)
                      ? [kindOf(spot.type).chip, 'border-[3px] border-current shadow-card']
                      : 'border-2 border-dashed border-paper-deep bg-paper-soft'"
                    :style="isCheckedIn(spot.id) ? { transform: `rotate(${tiltOf(spot.id)}deg)` } : undefined"
                  >
                    <!-- 沒蓋到的先給灰階淡影，讓人看得到「還缺這一枚長什麼樣」 -->
                    <img
                      :src="spot.art"
                      alt=""
                      loading="lazy"
                      class="size-12 object-contain sm:size-14"
                      :class="isCheckedIn(spot.id) ? '' : 'opacity-25 grayscale'"
                    >
                  </span>
                  <span
                    class="mt-2 line-clamp-2 text-[11px] font-bold leading-tight"
                    :class="isCheckedIn(spot.id) ? 'text-ink' : 'text-ink-faint'"
                  >{{ spot.name }}</span>
                  <span class="text-[10px] text-ink-faint">{{ spot.town }}</span>
                </li>
              </ul>

              <UButton to="/checkin" color="primary" class="mt-6 rounded-full font-bold" trailing-icon="i-lucide-chevron-right">
                去蓋下一枚章
              </UButton>
            </div>

            <!-- 路線成就 -->
            <div class="card p-5 sm:p-6">
              <h3 class="text-lg font-black">路線成就</h3>
              <p class="mt-0.5 text-xs text-ink-soft">走完整條路線即可解鎖該路線的紀念成就</p>

              <ul class="mt-4 space-y-3.5">
                <li v-for="r in ROUTES" :key="r.id">
                  <div class="flex items-center gap-2.5">
                    <img :src="r.art" alt="" loading="lazy" class="size-9 shrink-0 object-contain">
                    <span class="text-sm font-bold">{{ r.name }}</span>
                    <span
                      v-if="routeProgress(r).done === routeProgress(r).total"
                      class="chip bg-marigold-100 text-marigold-700"
                    >
                      <UIcon name="i-lucide-award" class="size-3" />{{ r.achievement }}
                    </span>
                    <span class="ml-auto shrink-0 text-xs font-bold text-ink-soft">
                      {{ routeProgress(r).done }} / {{ routeProgress(r).total }}
                    </span>
                  </div>
                  <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep">
                    <div
                      class="h-full rounded-full transition-[width] duration-500"
                      :class="routeProgress(r).done === routeProgress(r).total ? 'bg-marigold-500' : 'bg-ink/30'"
                      :style="{ width: `${(routeProgress(r).done / routeProgress(r).total) * 100}%` }"
                    />
                  </div>
                </li>
              </ul>

              <UButton to="/events" color="neutral" variant="outline" class="mt-5 rounded-full font-bold" trailing-icon="i-lucide-chevron-right">
                看所有路線
              </UButton>
            </div>
          </div>

          <!-- 我的券夾 -->
          <div v-else-if="tab === 'coupon'">
            <div class="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-card">
              <span class="text-sm text-ink-soft">可用餘額</span>
              <span class="text-xl font-black text-vermilion-500">
                <span class="text-sm align-top">$</span>{{ walletAmount }}
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <CouponCard v-for="c in coupons" :key="c.id" :coupon="c" />
            </div>
            <div
              v-if="!coupons.length"
              class="mt-4 rounded-card border-2 border-dashed border-paper-deep p-10 text-center"
            >
              <img src="/images/art/car-family.webp" alt="" class="mx-auto h-20 w-auto opacity-70">
              <p class="mt-2 text-sm text-ink-soft">券夾還是空的，出發蓋章就有券</p>
              <UButton to="/checkin" color="neutral" variant="outline" size="sm" class="mt-3 rounded-full font-bold">
                去蓋章
              </UButton>
            </div>

            <p class="mt-4 rounded-2xl bg-paper-soft px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
              每張券消費滿 {{ CAMPAIGN.minSpend }} 元即可使用，不找零，
              發券後 {{ CAMPAIGN.couponValidDays }} 天內有效，限雲林合作店家。
            </p>
          </div>

          <!-- 使用紀錄 -->
          <div v-else>
            <div class="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-card">
              <span class="text-sm text-ink-soft">已使用 {{ redeemRecords.length }} 張</span>
              <span class="text-xl font-black text-clay-600">－${{ usedTotal }}</span>
            </div>

            <div class="mt-4 card divide-y divide-paper-deep overflow-hidden">
              <div v-for="r in redeemRecords" :key="r.id" class="flex items-center gap-3 p-4">
                <span class="grid place-items-center size-11 shrink-0 rounded-2xl bg-clay-100 text-clay-600">
                  <UIcon name="i-lucide-store" class="size-5" />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="font-bold truncate">{{ r.store }}</p>
                  <p class="text-[11px] text-ink-faint">{{ r.town }} ‧ {{ r.at }}</p>
                </div>
                <div class="shrink-0 text-right">
                  <p class="font-black text-clay-600">－${{ r.couponValue }}</p>
                  <p class="text-[10px] text-ink-faint">消費 ${{ r.spend }}</p>
                </div>
              </div>
              <div v-if="!redeemRecords.length" class="p-10 text-center">
                <img src="/images/art/village.webp" alt="" class="mx-auto h-16 w-auto opacity-70">
                <p class="mt-2 text-sm text-ink-soft">還沒在合作店家用過券</p>
              </div>
            </div>
          </div>

          <button class="mt-8 w-full text-center text-[11px] text-ink-faint underline lg:hidden" @click="resetDemo">
            重置我的紀錄
          </button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
