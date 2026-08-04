<script setup lang="ts">
const { completedStages, isCheckedIn, checkedIn } = useCampaign()

type Filter = 'all' | 'red' | 'green' | 'todo'
const filter = ref<Filter>('all')

const filters: { key: Filter; label: string; count: number | null }[] = [
  { key: 'all', label: '全部', count: ALL_SPOTS.length },
  { key: 'red', label: '紅點', count: RED_SPOTS.length },
  { key: 'green', label: '綠點', count: GREEN_SPOTS.length },
  { key: 'todo', label: '未打卡', count: null }
]

const visibleSpots = computed(() => {
  switch (filter.value) {
    case 'red': return RED_SPOTS
    case 'green': return GREEN_SPOTS
    case 'todo': return ALL_SPOTS.filter((s) => !isCheckedIn(s.id))
    default: return ALL_SPOTS
  }
})

const activePin = ref<string | null>(null)
const activeSpot = computed(() => ALL_SPOTS.find((s) => s.id === activePin.value) || null)
</script>

<template>
  <div>
    <!-- ── 頁首 ─────────────────────────────────── -->
    <section class="relative isolate overflow-hidden border-b border-paper-deep">
      <img
        src="/images/kv-banner.jpg"
        alt="捲動國旅 活動橫幅"
        class="absolute inset-0 -z-10 size-full object-cover"
      >
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-paper via-paper/85 to-paper/30" />

      <div class="container-page py-10 sm:py-14">
        <span class="chip bg-vermilion-500 text-white">紅配綠 ‧ 三段任務</span>
        <h1 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">活動景點</h1>
        <p class="mt-2 max-w-lg text-sm text-ink-soft sm:text-base">
          紅點吃喝買、綠點拍美照，{{ ALL_SPOTS.length }} 個亮點等你走一趟。
        </p>
      </div>
    </section>

    <!-- ── 進度摘要 ─────────────────────────────── -->
    <div class="sticky top-16 z-30 border-b border-paper-deep bg-paper/95 backdrop-blur">
      <div class="container-page py-3">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div class="flex-1">
            <StageProgress :completed="completedStages" compact />
          </div>
          <div class="flex items-center text-[11px] text-ink-soft lg:shrink-0 lg:text-xs">
            <span>已走過 {{ checkedIn.length }} / {{ ALL_SPOTS.length }} 個亮點</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 地圖 + 清單 ──────────────────────────── -->
    <section class="container-page py-6 sm:py-8">
      <div class="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <!-- 地圖 -->
        <div class="lg:col-span-3">
          <div class="lg:sticky lg:top-40">
            <h2 class="mb-3 text-lg font-black sm:text-xl">景點分布</h2>
            <div
              class="relative aspect-4/5 w-full overflow-hidden rounded-card border-2 border-paper-deep
                     bg-gradient-to-b from-sky-100 via-moss-50 to-marigold-50 sm:aspect-4/3"
            >
              <div class="absolute inset-y-0 left-0 w-[22%] bg-sky-200/70" />
              <div class="absolute inset-y-0 left-[20%] w-[6%] bg-sky-100/60" />
              <div class="absolute inset-y-0 right-0 w-[26%] bg-moss-100/70" />
              <div class="absolute top-3 left-3 chip bg-white/80 text-ink-soft">台灣海峽</div>
              <div class="absolute top-3 right-3 chip bg-white/80 text-ink-soft">阿里山山脈</div>

              <button
                v-for="spot in visibleSpots"
                :key="spot.id"
                class="absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center transition-transform hover:scale-110 active:scale-95"
                :style="{ left: `${spot.mapX}%`, top: `${spot.mapY}%` }"
                :aria-label="spot.name"
                @click="activePin = activePin === spot.id ? null : spot.id"
              >
                <span
                  v-if="!isCheckedIn(spot.id)"
                  class="absolute size-7 rounded-full animate-ping-ring"
                  :class="spot.type === 'red' ? 'bg-vermilion-500' : 'bg-moss-500'"
                />
                <span
                  class="relative grid place-items-center size-9 rounded-full border-2 border-white text-white shadow-card"
                  :class="[
                    spot.type === 'red' ? 'bg-vermilion-500' : 'bg-moss-500',
                    activePin === spot.id ? 'ring-4 ring-white/70 scale-110' : ''
                  ]"
                >
                  <UIcon
                    :name="isCheckedIn(spot.id) ? 'i-lucide-check' : spot.icon"
                    class="size-4.5"
                  />
                </span>
              </button>

              <div class="absolute bottom-3 left-3 flex flex-col gap-1 rounded-2xl bg-white/85 px-3 py-2 backdrop-blur">
                <span class="flex items-center gap-1.5 text-[10px] font-bold text-ink-soft">
                  <i class="size-2.5 rounded-full bg-vermilion-500 not-italic" />紅點 ‧ 需消費
                </span>
                <span class="flex items-center gap-1.5 text-[10px] font-bold text-ink-soft">
                  <i class="size-2.5 rounded-full bg-moss-500 not-italic" />綠點 ‧ 拍照
                </span>
              </div>
            </div>

            <div v-if="activeSpot" class="mt-4 animate-pop-in">
              <SpotCard :spot="activeSpot" />
            </div>
            <p v-else class="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
              <UIcon name="i-lucide-mouse-pointer-click" class="size-4" />
              點一下地圖上的標記看景點詳情
            </p>
          </div>
        </div>

        <!-- 清單 -->
        <div class="lg:col-span-2">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-black sm:text-xl">景點清單</h2>
            <span class="text-xs text-ink-faint">依距離排序</span>
          </div>

          <div class="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              v-for="f in filters"
              :key="f.key"
              class="shrink-0 flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors"
              :class="filter === f.key ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
              @click="filter = f.key"
            >
              <i
                v-if="f.key === 'red' || f.key === 'green'"
                class="size-2 rounded-full not-italic"
                :class="f.key === 'red' ? 'bg-vermilion-500' : 'bg-moss-500'"
              />
              {{ f.label }}
              <span v-if="f.count !== null" class="opacity-70">{{ f.count }}</span>
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <SpotCard v-for="spot in visibleSpots" :key="spot.id" :spot="spot" />
            <div
              v-if="!visibleSpots.length"
              class="rounded-card border-2 border-dashed border-paper-deep p-10 text-center"
            >
              <UIcon name="i-lucide-party-popper" class="size-8 text-marigold-500" />
              <p class="mt-2 text-sm text-ink-soft">所有景點都打完卡了</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 規則說明 ─────────────────────────────── -->
    <section class="container-page pb-4">
      <div class="card p-5 sm:p-6">
        <h2 class="text-lg font-black sm:text-xl">玩法說明</h2>
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">
          <li
            v-for="r in [
              { icon: 'i-lucide-circle-dollar-sign', tone: 'vermilion', t: '紅點', d: `老街、商圈、觀光工廠。現場消費滿 ${CAMPAIGN.minSpend} 元再掃碼。` },
              { icon: 'i-lucide-camera', tone: 'moss', t: '綠點', d: '步道、濕地、鐵橋。拍張照掃碼就完成。' },
              { icon: 'i-lucide-layers', tone: 'marigold', t: '一組', d: `一紅一綠湊成一組，三段共 ${CAMPAIGN.quota} 元。` },
              { icon: 'i-lucide-clock', tone: 'sky', t: '時間', d: '同一天連跑三段也可以，完成當下就發券。' }
            ]"
            :key="r.t"
            class="flex gap-3 rounded-2xl bg-paper-soft p-3.5"
          >
            <span
              class="grid place-items-center size-9 shrink-0 rounded-xl bg-white"
              :class="{
                'text-vermilion-600': r.tone === 'vermilion',
                'text-moss-600': r.tone === 'moss',
                'text-marigold-700': r.tone === 'marigold',
                'text-sky-600': r.tone === 'sky'
              }"
            >
              <UIcon :name="r.icon" class="size-5" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-bold">{{ r.t }}</p>
              <p class="mt-0.5 text-xs leading-relaxed text-ink-soft">{{ r.d }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
