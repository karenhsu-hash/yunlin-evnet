<script setup lang="ts">
const { isCheckedIn } = useCampaign()

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
    <section class="relative isolate flex items-center overflow-hidden border-b border-paper-deep min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
      <img
        src="/images/kv-banner.jpg"
        alt="捲動國旅 活動橫幅"
        class="absolute inset-0 -z-10 size-full object-cover"
      >
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-paper via-paper/85 to-paper/30" />

      <div class="container-page py-10">
        <span class="chip bg-vermilion-500 text-white">紅配綠 ‧ 三段任務</span>
        <h1 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">活動景點</h1>
        <p class="mt-2 max-w-lg text-sm text-ink-soft sm:text-base">
          紅點吃喝買、綠點拍美照，{{ ALL_SPOTS.length }} 個亮點等你走一趟。
        </p>
      </div>
    </section>


    <!-- ── 地圖 + 清單 ──────────────────────────── -->
    <section class="container-page py-6 sm:py-8">
      <div class="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <!-- 地圖 -->
        <div class="lg:col-span-3">
          <div class="lg:sticky lg:top-24">
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

    <!-- ── 玩法說明：條文式 ─────────────────────── -->
    <section class="container-page pb-6">
      <div class="mx-auto max-w-3xl">
        <h2 class="border-b-2 border-ink pb-2.5 text-xl font-black text-ink sm:text-2xl">玩法說明</h2>

        <p class="mt-5 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
          本活動以「紅配綠」為核心機制，將雲林各觀光亮點分為紅點與綠點兩類。
          旅客於景點現場掃描專屬 QR code 完成到訪紀錄，並以「一紅一綠」為一組，
          分三段依序解鎖折價券獎勵，最高可累積 {{ toComma(CAMPAIGN.quota) }} 元，
          於全縣合作店家直接折抵。
        </p>

        <ol class="mt-6 space-y-4">
          <li
            v-for="(t, i) in [
              `紅點為可消費景點，共 ${RED_SPOTS.length} 處，包含老街、商圈與觀光工廠等。旅客須於現場消費滿 ${CAMPAIGN.minSpend} 元後掃碼，始認定完成。`,
              `綠點為不可消費景點，共 ${GREEN_SPOTS.length} 處，包含步道、濕地與風景區等。以拍照打卡或直接掃碼即可完成。`,
              '完成「一紅點 ＋ 一綠點」為一組。三段依序解鎖：第一段 250 元、第二段 250 元、第三段 500 元。',
              '各階段之完成間隔不限，同一日內連續完成三段亦可；符合條件後由系統即時自動核發折價券。',
              '同一會員於同一景點僅計算一次，重複掃碼不重複計入。'
            ]"
            :key="i"
            class="flex gap-3.5"
          >
            <span
              class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-paper-deep text-[11px] font-black text-ink-soft"
            >{{ i + 1 }}</span>
            <p class="text-sm leading-relaxed text-ink sm:text-[15px]">{{ t }}</p>
          </li>
        </ol>

        <p class="mt-6 border-t border-paper-deep pt-4 text-xs leading-relaxed text-ink-faint">
          以上為摘要說明，完整條款請參閱
          <NuxtLink to="/rules" class="font-bold text-sky-600 underline underline-offset-2">活動辦法</NuxtLink>。
        </p>
      </div>
    </section>
  </div>
</template>
