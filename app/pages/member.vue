<script setup lang="ts">
const { isLoggedIn, member, coupons, completedStages, walletAmount, earnedAmount, checkedRed, checkedGreen, resetDemo } = useCampaign()
const { redeemRecords } = useMember()

type Tab = 'task' | 'coupon' | 'redeem'
const tab = ref<Tab>('task')

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'task', label: '任務進度', icon: 'i-lucide-target' },
  { key: 'coupon', label: '我的折價券', icon: 'i-lucide-ticket' },
  { key: 'redeem', label: '核銷紀錄', icon: 'i-lucide-receipt-text' }
]

const usedTotal = computed(() => redeemRecords.value.reduce((s, r) => s + r.couponValue, 0))
</script>

<template>
  <div>
    <!-- 未登入：整頁以登入提示取代 -->
    <div v-if="!isLoggedIn" class="container-narrow py-12 sm:py-20">
      <LoginGate
        title="登入後查看會員中心"
        desc="登入後就能看到你的任務進度、折價券與使用紀錄。"
        icon="i-lucide-circle-user-round"
      />
    </div>

    <template v-else>
    <!-- ── 會員頁首 ─────────────────────────────── -->
    <section class="bg-indigoink-500 text-white">
      <div class="container-page py-8 sm:py-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-4">
            <span class="grid place-items-center size-16 shrink-0 rounded-full bg-white/15 sm:size-20">
              <UIcon :name="member.avatar" class="size-8 sm:size-10" />
            </span>
            <div class="min-w-0">
              <h1 class="text-2xl font-black leading-tight sm:text-3xl">{{ member.name }}</h1>
              <p class="text-xs text-white/70">{{ member.phone }}</p>
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

          <dl class="grid grid-cols-2 gap-2.5 sm:gap-4 lg:w-[300px]">
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">已完成</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">
                {{ completedStages }}<span class="text-[10px] font-bold"> /3 段</span>
              </dd>
            </div>
            <div class="rounded-2xl bg-white/10 px-3 py-3 text-center">
              <dt class="text-[10px] text-white/70">券包餘額</dt>
              <dd class="mt-1 text-xl font-black leading-none sm:text-2xl">
                <span class="text-[10px] align-top">$</span>{{ walletAmount }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <div class="container-page py-6 sm:py-8">
      <div class="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <!-- ── 分頁（桌機為側欄）─────────────────── -->
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
          >重置示範資料</button>
        </nav>

        <!-- ── 內容 ──────────────────────────────── -->
        <div>
          <!-- 任務進度 -->
          <div v-if="tab === 'task'" class="space-y-4">
            <div class="card p-5 sm:p-6">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h2 class="text-lg font-black sm:text-xl">三段任務</h2>
                <span class="text-xs text-ink-soft">
                  累計取得 <b class="text-marigold-700">{{ earnedAmount }}</b> 元
                </span>
              </div>
              <div class="mt-4">
                <StageProgress :completed="completedStages" />
              </div>
            </div>

            <div class="card p-5 sm:p-6">
              <h3 class="text-lg font-black">已打卡景點</h3>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div
                  v-for="grp in [
                    { label: '紅點 ‧ 可消費', ids: checkedRed, tone: 'vermilion' },
                    { label: '綠點 ‧ 拍照打卡', ids: checkedGreen, tone: 'moss' }
                  ]"
                  :key="grp.label"
                >
                  <p
                    class="text-xs font-bold"
                    :class="grp.tone === 'vermilion' ? 'text-vermilion-700' : 'text-moss-700'"
                  >{{ grp.label }}（{{ grp.ids.length }}）</p>

                  <ul class="mt-2 space-y-1.5">
                    <li
                      v-for="id in grp.ids"
                      :key="id"
                      class="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold"
                      :class="grp.tone === 'vermilion' ? 'bg-vermilion-50 text-vermilion-700' : 'bg-moss-50 text-moss-700'"
                    >
                      <UIcon :name="ALL_SPOTS.find((s) => s.id === id)?.icon || 'i-lucide-map-pin'" class="size-4 shrink-0" />
                      {{ ALL_SPOTS.find((s) => s.id === id)?.name }}
                    </li>
                    <li v-if="!grp.ids.length" class="text-[11px] text-ink-faint">尚未打卡</li>
                  </ul>
                </div>
              </div>
              <UButton to="/events" color="neutral" variant="outline" class="mt-5 rounded-full font-bold" trailing-icon="i-lucide-chevron-right">
                找下一個景點
              </UButton>
            </div>
          </div>

          <!-- 我的折價券 -->
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
              <UIcon name="i-lucide-ticket" class="size-9 text-ink-faint" />
              <p class="mt-2 text-sm text-ink-soft">還沒有折價券</p>
              <UButton to="/checkin" color="neutral" variant="outline" size="sm" class="mt-3 rounded-full font-bold">
                去打卡
              </UButton>
            </div>

            <p class="mt-4 rounded-2xl bg-paper-soft px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
              每張券消費滿 {{ CAMPAIGN.minSpend }} 元即可使用，不找零，
              發券後 {{ CAMPAIGN.couponValidDays }} 天內有效，限雲林合作店家。
            </p>
          </div>

          <!-- 核銷紀錄 -->
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
                <UIcon name="i-lucide-receipt-text" class="size-9 text-ink-faint" />
                <p class="mt-2 text-sm text-ink-soft">尚無核銷紀錄</p>
              </div>
            </div>
          </div>

          <button class="mt-8 w-full text-center text-[11px] text-ink-faint underline lg:hidden" @click="resetDemo">
            重置示範資料
          </button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
