<script setup lang="ts">
import type { Coupon, Task } from '~/composables/useCampaign'

/**
 * 我的觀光護照 —— 原本的「會員中心」。
 *
 * 從護照的角度重新組織：頁首是護照的個人資料頁（持有人、護照號碼、會員等級、
 * 有效期限），內容三頁分別是印章頁、點數兌換與使用紀錄。
 *
 * 印章頁把任務攤成印章格，完成的顯示彩色印章、沒完成的留灰階淡影 ——
 * 護照真正好玩的地方就是那一頁的空格。分成打卡章與指定任務章兩區，
 * 每一格標出任務點數，讓人挑下一個任務時知道值多少。
 */
const {
  isLoggedIn, member, coupons, levelInfo, points, earnedPoints, walletAmount,
  isTaskDone, completedTasks, draws, routeProgress, completedRoutes,
  canRedeem, redeem, resetDemo
} = useCampaign()
const { redeemRecords } = useMember()

type Tab = 'stamps' | 'points' | 'redeem'
const tab = ref<Tab>('stamps')

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'stamps', label: '印章頁', icon: 'i-lucide-stamp' },
  { key: 'points', label: '點數兌換', icon: 'i-lucide-gift' },
  { key: 'redeem', label: '使用紀錄', icon: 'i-lucide-receipt-text' }
]

const usedTotal = computed(() => redeemRecords.value.reduce((s, r) => s + r.couponValue, 0))

/** 兌換品項連同「能不能換、不能的話為什麼、還剩幾份」一起算好，模板只管顯示 */
const rewardList = computed(() =>
  REWARDS.map((r) => {
    const check = canRedeem(r)
    return {
      ...r,
      ok: check.ok,
      reason: check.ok ? '' : check.reason,
      left: stockLeft(r),
      soldOut: isSoldOut(r)
    }
  })
)

/** 剛兌換到的券，用來在兌換區上方給一個確認提示 */
const justRedeemed = ref<Coupon | null>(null)
function onRedeem(rewardId: string) {
  justRedeemed.value = redeem(rewardId)
}

/**
 * 護照號碼：從信箱推出一組穩定的編號，重新整理不會變。
 * 只是呈現用的識別碼，不具任何驗證意義。
 */
const passportNo = computed(() => {
  const seed = [...(member.value.email || 'guest')].reduce((n, c) => n + c.charCodeAt(0), 0)
  return `YL-2026-${String(seed % 100000).padStart(5, '0')}`
})

/** 印章頁分兩區：打卡章與指定任務章。各自把完成的排前面，先看到成果 */
const byDoneFirst = (list: Task[]) =>
  [...list].sort((a, b) => Number(isTaskDone(b)) - Number(isTaskDone(a)))

const stampSections = computed(() => [
  {
    key: 'checkin',
    label: '打卡章',
    desc: '走到站點現場定位取得',
    tasks: byDoneFirst(tasksOfKind('checkin'))
  },
  {
    key: 'designated',
    label: '指定任務章',
    desc: '食農教育與 iRent 租車任務',
    tasks: byDoneFirst(DESIGNATED_TASKS)
  }
])

const stampCount = (list: Task[]) => list.filter(isTaskDone).length

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
        title="登入後查看你的觀光護照"
        desc="登入後就能看到你蓋了哪些章、拿到哪些券，以及用在哪些店家。"
        art="/images/art/family-four.webp"
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
            <UIcon name="i-lucide-book-marked" class="size-3.5" />雲林觀光護照
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

          <dl class="grid grid-cols-2 gap-2.5 sm:gap-4 lg:w-[460px] lg:grid-cols-4">
            <div class="rounded-2xl bg-marigold-500 px-3 py-3 text-center text-ink">
              <dt class="text-[10px] font-bold text-ink/70">等級{{ ['一', '二', '三'][levelInfo.level - 1] }}</dt>
              <dd class="mt-1 text-base font-black leading-none sm:text-lg">{{ levelInfo.name }}</dd>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">累積點數</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">{{ toComma(earnedPoints) }}</dd>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">可用點數</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">{{ toComma(points) }}</dd>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">抽獎資格</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">
                {{ draws.total }}<span class="text-[10px] font-bold"> 次</span>
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
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
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
            class="mt-6 hidden w-full py-2 text-left text-[11px] text-ink-faint underline lg:block"
            @click="resetDemo"
          >重置我的紀錄</button>
        </nav>

        <!-- ── 內容 ──────────────────────────────── -->
        <div>
          <!-- 印章頁 -->
          <div v-if="tab === 'stamps'" class="space-y-4">
            <!-- 會員等級 -->
            <div class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h2 class="text-lg font-black sm:text-xl">會員等級</h2>
                <span class="text-xs text-ink-soft">
                  累積獲得 <b class="text-marigold-700">{{ toComma(earnedPoints) }}</b> 點
                </span>
              </div>
              <div class="mt-4">
                <LevelProgress />
              </div>
            </div>

            <!-- 印章格：打卡章與指定任務章兩區 -->
            <div v-for="sec in stampSections" :key="sec.key" class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h3 class="text-lg font-black">{{ sec.label }}</h3>
                <span class="text-xs text-ink-soft">
                  {{ stampCount(sec.tasks) }} / {{ sec.tasks.length }} 枚
                </span>
              </div>
              <p class="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                <UIcon name="i-lucide-coins" class="size-3.5 text-marigold-600" />
                {{ sec.desc }}，每一枚依難度可得 100～500 點
              </p>

              <ul class="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-5">
                <li v-for="t in sec.tasks" :key="t.id" class="flex flex-col items-center text-center">
                  <span class="relative">
                    <span
                      class="grid size-[4.5rem] place-items-center rounded-full transition-transform sm:size-20"
                      :class="isTaskDone(t)
                        ? 'border-[3px] border-vermilion-500 bg-vermilion-50 shadow-card'
                        : 'border-2 border-dashed border-paper-deep bg-paper-soft'"
                      :style="isTaskDone(t) ? { transform: `rotate(${tiltOf(t.id)}deg)` } : undefined"
                    >
                      <!-- 沒完成的先給灰階淡影，讓人看得到「還缺這一枚長什麼樣」 -->
                      <img
                        :src="t.art"
                        alt=""
                        loading="lazy"
                        class="size-12 object-contain sm:size-14"
                        :class="isTaskDone(t) ? '' : 'opacity-25 grayscale'"
                      >
                    </span>
                    <!-- 任務點數；放在外層，不跟著印章傾斜。完成的改成實心，表示已入帳 -->
                    <span
                      class="absolute -right-2 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ring-2 ring-white"
                      :class="isTaskDone(t) ? 'bg-marigold-500 text-ink' : 'bg-marigold-50 text-marigold-700'"
                    >+{{ t.points }}</span>
                  </span>
                  <span
                    class="mt-2 line-clamp-2 text-[11px] font-bold leading-tight"
                    :class="isTaskDone(t) ? 'text-ink' : 'text-ink-faint'"
                  >{{ t.title }}</span>
                </li>
              </ul>

              <UButton
                :to="sec.key === 'checkin' ? '/checkin' : '/tasks'"
                color="primary"
                class="mt-6 rounded-full font-bold"
                trailing-icon="i-lucide-chevron-right"
              >{{ sec.key === 'checkin' ? '去蓋下一枚章' : '看任務牆' }}</UButton>
            </div>

            <!-- 抽獎資格 -->
            <div class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h3 class="text-lg font-black">抽獎資格</h3>
                <span class="text-lg font-black text-marigold-700">{{ draws.total }} 次</span>
              </div>
              <p class="mt-0.5 text-xs text-ink-soft">累積點數與路線成就都算，兌換優惠不會扣掉資格</p>

              <dl class="mt-4 space-y-2 text-sm">
                <div class="flex items-center justify-between rounded-2xl bg-paper-soft px-3.5 py-2.5">
                  <dt class="text-ink-soft">
                    累積 {{ toComma(earnedPoints) }} 點 ÷ 每 {{ toComma(CAMPAIGN.lotteryUnit) }} 點
                  </dt>
                  <dd class="font-black">{{ draws.fromPoints }} 次</dd>
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-paper-soft px-3.5 py-2.5">
                  <dt class="text-ink-soft">完成 {{ completedRoutes }} 條推薦路線加碼</dt>
                  <dd class="font-black">{{ draws.fromRoutes }} 次</dd>
                </div>
              </dl>

              <p class="mt-3 text-[11px] text-ink-faint">
                再累積 {{ toComma(draws.toNext) }} 點可再取得一次抽獎資格。開獎與獎品寄送由主辦單位辦理。
              </p>
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

          <!-- 點數兌換：上半兌換專區，下半已兌換的券 -->
          <div v-else-if="tab === 'points'" class="space-y-4">
            <div class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-black sm:text-xl">兌換專區</h2>
                  <p class="mt-0.5 text-xs text-ink-soft">兌換後扣除點數，不影響已取得的會員等級</p>
                </div>
                <div class="flex items-center gap-2 rounded-2xl bg-marigold-50 px-3.5 py-2">
                  <UIcon name="i-lucide-coins" class="size-4 text-marigold-700" />
                  <span class="text-xs font-bold text-marigold-700">可用點數</span>
                  <span class="text-lg font-black text-ink">{{ toComma(points) }}</span>
                </div>
              </div>

              <div
                v-if="justRedeemed"
                class="mt-4 flex items-center gap-2 rounded-2xl bg-moss-50 px-4 py-3 text-sm font-bold text-moss-700 animate-pop-in"
              >
                <UIcon name="i-lucide-circle-check" class="size-5 shrink-0" />
                已兌換「{{ justRedeemed.name }}」，放進下方券夾了
              </div>

              <ul class="mt-4 grid gap-3 sm:grid-cols-2">
                <li
                  v-for="r in rewardList"
                  :key="r.id"
                  class="flex flex-col rounded-2xl border-2 p-4"
                  :class="[
                    r.ok ? 'border-marigold-500 bg-marigold-50/50' : 'border-paper-deep bg-white',
                    r.soldOut ? 'opacity-60' : ''
                  ]"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-black">{{ r.name }}</p>
                      <p class="mt-0.5 text-[11px] text-ink-soft">{{ r.desc }}</p>
                    </div>
                    <span class="chip shrink-0 bg-paper-soft text-ink-soft">
                      {{ LEVELS[r.minLevel - 1]!.name }}起
                    </span>
                  </div>

                  <!-- 限量與取得方式：兌換前最需要知道的兩件事 -->
                  <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                    <span class="flex items-center gap-1 text-ink-soft">
                      <UIcon
                        :name="r.channel === 'station' ? 'i-lucide-map-pin' : 'i-lucide-store'"
                        class="size-3.5"
                      />
                      {{ r.channel === 'station' ? '借問站領取' : '合作店家折抵' }}
                    </span>
                    <span v-if="r.left === null" class="text-ink-faint">不限量</span>
                    <span v-else-if="r.soldOut" class="font-bold text-vermilion-600">已兌完</span>
                    <span v-else class="font-bold text-marigold-700">限量剩 {{ r.left }} 份</span>
                  </div>

                  <div class="mt-4 flex items-center justify-between gap-2">
                    <span class="text-sm font-black text-marigold-700">{{ toComma(r.cost) }} 點</span>
                    <UButton
                      :color="r.ok ? 'primary' : 'neutral'"
                      :variant="r.ok ? 'solid' : 'soft'"
                      size="md"
                      :disabled="!r.ok"
                      class="rounded-full font-bold"
                      @click="onRedeem(r.id)"
                    >
                      {{ r.ok ? '兌換' : r.reason }}
                    </UButton>
                  </div>
                </li>
              </ul>

              <p class="mt-4 text-[11px] leading-relaxed text-ink-faint">
                點數不得折換現金、找零、轉讓或轉移至其他會員帳號。
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-card">
                <span class="text-sm font-bold">我的券夾</span>
                <span class="text-sm text-ink-soft">
                  未使用 <b class="text-lg font-black text-vermilion-500">${{ walletAmount }}</b>
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
                <p class="mt-2 text-sm text-ink-soft">券夾還是空的，用點數在上方兌換優惠券</p>
              </div>

              <p class="mt-4 rounded-2xl bg-paper-soft px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
                折抵券消費滿 {{ CAMPAIGN.minSpend }} 元即可使用、不找零，限雲林合作店家；
                限量好禮請至 {{ STATIONS.length }} 處借問站出示兌換券領取。
                兩者皆於兌換後 {{ CAMPAIGN.couponValidDays }} 天內有效。
              </p>
            </div>
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

          <button class="mt-6 w-full py-2 text-center text-[11px] text-ink-faint underline lg:hidden" @click="resetDemo">
            重置我的紀錄
          </button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
