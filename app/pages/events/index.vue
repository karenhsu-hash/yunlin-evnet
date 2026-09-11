<script setup lang="ts">
/**
 * 活動景點 —— 以「遊樂路線」為主結構。
 *
 * 旅客的心智模型是「今天走哪一條」，所以頁籤是路線。站點不再分類型；
 * 唯一需要標出來的是等級三的指定站（圖釘外加旗標），讓人知道升級要蓋哪幾站。
 *
 * 路線只是建議動線，不綁定走訪順序 —— 強制順序會被 GPS 誤差與臨時改行程打爆。
 */
const { isCheckedIn, routeProgress } = useCampaign()

/** 'all' = 不限路線，看全部站點 */
const activeRouteId = ref<string>('all')
const activeRoute = computed(() => ROUTES.find((r) => r.id === activeRouteId.value) ?? null)

/** 只看還沒蓋章的 */
const todoOnly = ref(false)

/** 目前路線的站點，照行程順序排；未選路線時是全部站點 */
const routeSpots = computed(() => {
  if (!activeRoute.value) return ALL_SPOTS
  const ids = routeSpotIds(activeRoute.value)
  return ALL_SPOTS.filter((s) => ids.includes(s.id)).sort(
    (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)
  )
})

const visibleSpots = computed(() =>
  todoOnly.value ? routeSpots.value.filter((s) => !isCheckedIn(s.id)) : routeSpots.value
)

/** 站點在目前路線裡的順序（1 起算），用來在地圖上標出動線 */
const orderOf = computed(() => {
  const m = new Map<string, number>()
  if (activeRoute.value) routeSpotIds(activeRoute.value).forEach((id, i) => m.set(id, i + 1))
  return m
})

const spotOf = (id: string) => ALL_SPOTS.find((s) => s.id === id)

const activePin = ref<string | null>(null)
const activeSpot = computed(() => ALL_SPOTS.find((s) => s.id === activePin.value) || null)

/** 換路線時收起展開的站點，免得看到不屬於這條路線的卡片 */
watch(activeRouteId, () => {
  activePin.value = null
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
        <span class="chip bg-vermilion-500 text-white">{{ ROUTES.length }} 條路線 ‧ 打卡升級</span>
        <h1 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">活動景點</h1>
        <p class="mt-2 max-w-lg text-sm text-ink-soft sm:text-base">
          選一條路線走一趟，{{ ALL_SPOTS.length }} 個站點串起雲林的海味、田野與山線。
        </p>
      </div>
    </section>

    <!-- ── 路線頁籤 ─────────────────────────────── -->
    <section class="container-page pt-6 sm:pt-8">
      <div class="flex flex-wrap gap-2 sm:gap-2.5" role="tablist" aria-label="遊樂路線">
        <button
          role="tab"
          :aria-selected="activeRouteId === 'all'"
          class="rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors"
          :class="activeRouteId === 'all'
            ? 'border-ink bg-ink text-white'
            : 'border-paper-deep bg-white text-ink-soft hover:border-ink/40'"
          @click="activeRouteId = 'all'"
        >
          全部站點
          <span class="opacity-70">{{ ALL_SPOTS.length }}</span>
        </button>

        <button
          v-for="r in ROUTES"
          :key="r.id"
          role="tab"
          :aria-selected="activeRouteId === r.id"
          class="flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors"
          :class="activeRouteId === r.id
            ? 'border-ink bg-ink text-white'
            : 'border-paper-deep bg-white text-ink-soft hover:border-ink/40'"
          @click="activeRouteId = r.id"
        >
          <UIcon :name="r.icon" class="size-4 shrink-0" />
          {{ r.name }}
          <span
            v-if="r.featured"
            class="rounded-full px-1.5 py-px text-[10px] font-black"
            :class="activeRouteId === r.id ? 'bg-white/20 text-white' : 'bg-marigold-100 text-marigold-700'"
          >首推</span>
        </button>
      </div>

      <!-- 選中路線的介紹與行程 -->
      <div v-if="activeRoute" class="mt-4 card p-5 animate-pop-in sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-lg font-black sm:text-xl">{{ activeRoute.name }}</h2>
            <p class="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">{{ activeRoute.tagline }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-[11px] font-bold text-ink-faint">完成解鎖</p>
            <p class="text-sm font-black text-marigold-700">{{ activeRoute.achievement }}</p>
          </div>
        </div>

        <!-- 行程動線：A → B → C，分日呈現 -->
        <div class="mt-4 space-y-3">
          <div v-for="day in activeRoute.days" :key="day.label">
            <p class="text-[11px] font-black tracking-wider text-ink-faint">{{ day.label }}</p>
            <ol class="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-2">
              <template v-for="(id, i) in day.spotIds" :key="id">
                <UIcon v-if="i > 0" name="i-lucide-chevron-right" class="size-3.5 shrink-0 text-ink-faint" />
                <li>
                  <button
                    class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors"
                    :class="isCheckedIn(id)
                      ? 'border-moss-500 bg-moss-50 text-moss-700'
                      : 'border-paper-deep bg-white text-ink hover:border-ink/40'"
                    @click="activePin = activePin === id ? null : id"
                  >
                    <UIcon
                      :name="isCheckedIn(id) ? 'i-lucide-check' : isDesignated(id) ? 'i-lucide-flag' : spotOf(id)!.icon"
                      class="size-3.5 shrink-0"
                    />
                    {{ spotOf(id)?.name }}
                  </button>
                </li>
              </template>
            </ol>
          </div>
        </div>

        <!-- 這條路線走了幾站 -->
        <div class="mt-4 flex items-center gap-3 border-t border-paper-deep pt-3.5">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-paper-deep">
            <div
              class="h-full rounded-full bg-marigold-500 transition-[width] duration-500"
              :style="{ width: `${(routeProgress(activeRoute).done / routeProgress(activeRoute).total) * 100}%` }"
            />
          </div>
          <p class="shrink-0 text-xs font-bold text-ink-soft">
            {{ routeProgress(activeRoute).done }} / {{ routeProgress(activeRoute).total }} 站
          </p>
        </div>
      </div>
    </section>

    <!-- ── 地圖 + 清單 ──────────────────────────── -->
    <section class="container-page py-6 sm:py-8">
      <div class="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <!-- 地圖 -->
        <div class="lg:col-span-3">
          <div class="lg:sticky lg:top-24">
            <h2 class="mb-3 text-lg font-black sm:text-xl">
              {{ activeRoute ? '路線動線' : '站點分布' }}
            </h2>
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
                <!-- 指定站用主色＋旗標，一般站點用靛藍；顏色之外還有圖示與圖例，不單靠顏色辨識 -->
                <span
                  v-if="!isCheckedIn(spot.id)"
                  class="absolute size-7 rounded-full animate-ping-ring"
                  :class="isDesignated(spot.id) ? 'bg-vermilion-500' : 'bg-indigoink-500'"
                />
                <span
                  class="relative grid place-items-center size-9 rounded-full border-2 border-white text-white shadow-card"
                  :class="[
                    isDesignated(spot.id) ? 'bg-vermilion-500' : 'bg-indigoink-500',
                    activePin === spot.id ? 'ring-4 ring-white/70 scale-110' : ''
                  ]"
                >
                  <!-- 選了路線就標序號（第幾站），沒選路線才顯示站點圖示 -->
                  <span v-if="orderOf.get(spot.id)" class="text-xs font-black">
                    {{ orderOf.get(spot.id) }}
                  </span>
                  <UIcon
                    v-else
                    :name="isCheckedIn(spot.id) ? 'i-lucide-check' : isDesignated(spot.id) ? 'i-lucide-flag' : spot.icon"
                    class="size-4.5"
                  />
                </span>
              </button>

              <div class="absolute bottom-3 left-3 flex flex-col gap-1 rounded-2xl bg-white/85 px-3 py-2 backdrop-blur">
                <span class="flex items-center gap-1.5 text-[10px] font-bold text-ink-soft">
                  <i class="size-2.5 rounded-full bg-vermilion-500 not-italic" />{{ LEVELS[2]!.name }}指定站
                </span>
                <span class="flex items-center gap-1.5 text-[10px] font-bold text-ink-soft">
                  <i class="size-2.5 rounded-full bg-indigoink-500 not-italic" />一般站點
                </span>
              </div>
            </div>

            <div v-if="activeSpot" class="mt-4 animate-pop-in">
              <SpotCard :spot="activeSpot" />
            </div>
            <p v-else class="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
              <UIcon name="i-lucide-mouse-pointer-click" class="size-4" />
              點一下地圖上的標記看站點詳情
            </p>
          </div>
        </div>

        <!-- 清單 -->
        <div class="lg:col-span-2">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-black sm:text-xl">
              {{ activeRoute ? '本路線站點' : '站點清單' }}
            </h2>
            <button
              class="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors"
              :class="todoOnly ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
              @click="todoOnly = !todoOnly"
            >
              <UIcon :name="todoOnly ? 'i-lucide-check-square' : 'i-lucide-square'" class="size-3.5" />
              只看未蓋章
            </button>
          </div>
          <p class="mt-1 text-xs text-ink-faint">
            {{ activeRoute ? '依建議動線排序，實際走訪順序不限' : '依距離排序' }}
          </p>

          <div class="mt-4 space-y-3">
            <SpotCard v-for="spot in visibleSpots" :key="spot.id" :spot="spot" />
            <div
              v-if="!visibleSpots.length"
              class="rounded-card border-2 border-dashed border-paper-deep p-10 text-center"
            >
              <UIcon name="i-lucide-party-popper" class="size-8 text-marigold-500" />
              <p class="mt-2 text-sm text-ink-soft">
                {{ activeRoute ? '這條路線的章都蓋滿了' : '所有站點的章都蓋滿了' }}
              </p>
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
          本活動規劃 {{ ROUTES.length }} 條遊樂路線，串起雲林 {{ ALL_SPOTS.length }} 個活動站點。
          旅客於站點現場掃碼或定位完成打卡，依打卡進度升級會員等級並獲得點數，
          最高累積 {{ toComma(CAMPAIGN.quota) }} 點，可於護照的兌換專區換取優惠券。
        </p>

        <ol class="mt-6 space-y-4">
          <li
            v-for="(t, i) in [
              `${ROUTES.length} 條路線為建議動線，不限定走訪順序，也不限定只能完成一條。`,
              `完成會員註冊即成為等級一「${LEVELS[0]!.name}」，獲得 ${LEVELS[0]!.reward} 點。`,
              `任意 ${LEVEL_TWO_CHECKINS} 個站點打卡，升級為等級二「${LEVELS[1]!.name}」，再獲得 ${LEVELS[1]!.reward} 點。`,
              `首推路線 ${DESIGNATED_SPOT_IDS.length} 個指定站全部打卡，升級為等級三「${LEVELS[2]!.name}」，再獲得 ${LEVELS[2]!.reward} 點。`,
              '點數可於兌換專區換取符合目前等級的優惠；兌換扣除點數，但不影響已取得的等級。',
              '同一會員於同一站點僅計算一次，重複打卡不重複計入。'
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
