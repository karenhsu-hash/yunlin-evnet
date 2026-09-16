<script setup lang="ts">
import type { Level, Spot } from '~/composables/useCampaign'

/**
 * 打卡一律用定位：按「我已抵達」取瀏覽器座標，與站點座標比對，在判定半徑內就算完成。
 * 不做 QR code —— 實體立牌要印製、換位、補發，維護成本高，定位就足以確認人在現場。
 */
const route = useRoute()
const { isLoggedIn, member, isCheckedIn, spotById, checkIn, earnedPoints } = useCampaign()

type Phase = 'idle' | 'locating' | 'done'

const phase = ref<Phase>('idle')

const target = ref<Spot | null>(
  (typeof route.query.spot === 'string' ? spotById(route.query.spot) : null) ?? null
)

const result = ref<{
  ok: boolean
  duplicated: boolean
  /** 這一章加了幾點 */
  gained: number
  /** 這一章剛好讓會員升級時，升到哪一級 */
  levelUp: Level | null
  /** 順帶解鎖的里程碑任務 */
  unlocked: Task[]
} | null>(null)

/** 定位打卡的狀態機。far＝有拿到座標但距離不夠近，error＝根本沒拿到座標 */
const geo = ref<{
  state: 'idle' | 'far' | 'error'
  distance: number | null
  accuracy: number | null
  /** 距離不夠時，離你最近的那個站點叫什麼 */
  nearest: string | null
  message: string | null
}>({ state: 'idle', distance: null, accuracy: null, nearest: null, message: null })

const resetGeo = () =>
  (geo.value = { state: 'idle', distance: null, accuracy: null, nearest: null, message: null })

const targetRadius = computed(() => (target.value ? radiusOf(target.value) : CAMPAIGN.geoRadiusM))

// 換站點時清掉上一次的定位結果。
// 打卡完成後 target 可能是被定位反查填上的，這時不能清掉剛算出來的距離
watch(target, () => {
  if (phase.value === 'done') return
  resetGeo()
})

/** 快速挑站：還沒蓋的站點，由近到遠 */
const pickList = computed(() =>
  ALL_SPOTS.filter((s) => !isCheckedIn(s.id))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8)
)

/** 寫入打卡紀錄，並記下加了幾點、是否升級、是否順帶解鎖里程碑 */
function finish(spot: Spot) {
  const duplicated = isCheckedIn(spot.id)
  const outcome = duplicated ? { gained: 0, levelUp: null, unlocked: [] } : checkIn(spot.id)
  result.value = { ok: true, duplicated, ...outcome }
  phase.value = 'done'
}

function locate() {
  const spot = target.value
  result.value = null
  resetGeo()

  if (!import.meta.client || !('geolocation' in navigator)) {
    geo.value = { ...geo.value, state: 'error', message: '這個瀏覽器不支援定位功能，請更換瀏覽器再試。' }
    return
  }
  // 定位 API 只在安全來源可用（HTTPS 或 localhost），正式站沒上 HTTPS 會整個拿不到座標
  if (!window.isSecureContext) {
    geo.value = { ...geo.value, state: 'error', message: '目前連線不是安全連線（HTTPS），瀏覽器不允許取得位置。' }
    return
  }

  phase.value = 'locating'
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      const acc = pos.coords.accuracy

      // 已指定站點就只判斷那一個；沒指定就反查「你現在站在哪一站」
      const ranked = (spot ? [spot] : ALL_SPOTS)
        .map((s) => ({ s, d: distanceM(here, s) }))
        .sort((a, b) => a.d - b.d)
      const hit = ranked.find(({ s, d }) => d <= radiusOf(s))

      if (hit) {
        geo.value = { state: 'idle', distance: hit.d, accuracy: acc, nearest: null, message: null }
        target.value = hit.s
        finish(hit.s)
      } else {
        const near = ranked[0]!
        geo.value = {
          state: 'far',
          distance: near.d,
          accuracy: acc,
          nearest: near.s.name,
          message: null
        }
        phase.value = 'idle'
      }
    },
    (err) => {
      const messages: Record<number, string> = {
        1: '你拒絕了定位權限。請在瀏覽器設定中允許本站取得位置後再試一次。',
        2: '目前收不到定位訊號。請移動到空曠處，並確認裝置的定位服務已開啟。',
        3: '定位逾時。訊號較弱時可能需要多試幾次。'
      }
      geo.value = {
        state: 'error',
        distance: null,
        accuracy: null,
        nearest: null,
        message: messages[err.code] ?? '定位失敗，請稍後再試一次。'
      }
      phase.value = 'idle'
    },
    // maximumAge 0：不吃快取座標，避免用上一個地點的舊定位過關
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  )
}

/**
 * ⚠️ 示範用：跳過真實定位直接判定抵達。
 * 測試的人不會真的站在雲林，沒有這顆按鈕就無法演示後續的發券流程。
 * 正式上線務必移除。
 */
function simulateArrival() {
  if (!target.value) return
  geo.value = { state: 'idle', distance: 18, accuracy: 10, nearest: null, message: null }
  finish(target.value)
}

function reset() {
  target.value = null
  result.value = null
  resetGeo()
  phase.value = 'idle'
}

const busy = computed(() => phase.value === 'locating')
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <!-- 未登入：打卡需對應到會員帳號 -->
    <div v-if="!isLoggedIn" class="container-narrow">
      <LoginGate
        title="登入後才能打卡"
        desc="打卡會記錄在你的帳號下，請先登入再開始。"
        art="/images/art/kids-run.webp"
      />
    </div>

    <template v-else>
    <!-- ── 頁首 ─────────────────────────────────── -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <span class="chip bg-vermilion-100 text-vermilion-700">觀光護照</span>
        <h1 class="mt-2 text-3xl font-black leading-tight sm:text-4xl">護照集章</h1>
        <p class="mt-1.5 max-w-lg text-sm text-ink-soft">
          走到站點現場按下「我已抵達」，系統確認你在範圍內就蓋章。
        </p>
      </div>
      <div class="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-card">
        <span class="grid place-items-center size-9 rounded-full bg-sky-100 text-sky-700">
          <UIcon :name="member.avatar" class="size-5" />
        </span>
        <div class="leading-tight">
          <p class="text-[11px] text-ink-faint">目前會員</p>
          <p class="text-sm font-bold">{{ member.name }}</p>
        </div>
      </div>
    </header>

    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <!-- ── 左：定位雷達 / 結果 ──────────────────── -->
      <div>
        <template v-if="phase !== 'done'">
          <!-- 定位雷達 -->
          <div class="overflow-hidden rounded-card bg-ink p-6 sm:p-8">
            <div class="relative mx-auto grid aspect-square w-full max-w-xs place-items-center rounded-3xl bg-black/40">
              <!-- 判定半徑的示意同心圓 -->
              <span
                v-for="(size, i) in ['size-52', 'size-36', 'size-20']"
                :key="i"
                class="absolute rounded-full border border-marigold-500/30"
                :class="[size, phase === 'locating' ? 'animate-ping-ring' : '']"
                :style="{ animationDelay: `${i * 0.4}s` }"
              />
              <div class="relative px-6 text-center">
                <UIcon
                  :name="phase === 'locating' ? 'i-lucide-locate-fixed' : 'i-lucide-map-pin'"
                  class="size-14"
                  :class="phase === 'locating' ? 'animate-pulse text-marigold-500' : 'text-white/70'"
                />
                <p
                  class="mt-3 text-xs"
                  :class="phase === 'locating' ? 'font-bold text-marigold-500' : 'text-white/70'"
                >
                  <template v-if="phase === 'locating'">正在取得你的位置…</template>
                  <template v-else-if="target">
                    走到<b class="text-white">{{ target.name }}</b><br>
                    進入 {{ targetRadius }} 公尺內按下方按鈕
                  </template>
                  <template v-else>沒有指定站點時<br>系統會自動判斷你在哪一站</template>
                </p>
              </div>
            </div>
          </div>

          <!-- 目標站點 -->
          <div v-if="target" class="mt-4 card p-4 animate-pop-in">
            <div class="flex items-center gap-3">
              <span class="grid place-items-center size-12 shrink-0 rounded-2xl bg-vermilion-50 text-vermilion-600">
                <UIcon :name="target.icon" class="size-6" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] text-ink-faint">即將蓋章</p>
                <p class="font-bold truncate">{{ target.name }}</p>
              </div>
              <span class="chip shrink-0 bg-marigold-100 text-marigold-700">
                <UIcon name="i-lucide-coins" class="size-3" />+{{ target.points }} 點
              </span>
            </div>

            <p class="mt-3 flex items-start gap-1.5 rounded-2xl bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-700">
              <UIcon name="i-lucide-info" class="mt-px size-3.5 shrink-0" />
              <span>走進<b>{{ targetRadius }} 公尺</b>內按「我已抵達」即可蓋章，不需要掃描任何 QR code。</span>
            </p>
          </div>

          <!-- 定位結果：距離不夠 -->
          <div
            v-if="geo.state === 'far'"
            class="mt-4 rounded-card border-2 border-marigold-500 bg-marigold-50 p-4 animate-pop-in"
          >
            <p class="flex items-center gap-2 text-sm font-black text-marigold-700">
              <UIcon name="i-lucide-navigation" class="size-4.5 shrink-0" />還沒到現場
            </p>
            <p class="mt-1.5 text-xs leading-relaxed text-ink-soft">
              <template v-if="geo.nearest && !target">
                離你最近的是<b>{{ geo.nearest }}</b>，距離 <b>{{ readableDistance(geo.distance!) }}</b>。
              </template>
              <template v-else>
                你距離 <b>{{ target?.name }}</b> 還有 <b>{{ readableDistance(geo.distance!) }}</b>，需進入 {{ targetRadius }} 公尺內才能蓋章。
              </template>
              <template v-if="geo.accuracy"><br>本次定位誤差約 {{ Math.round(geo.accuracy) }} 公尺。</template>
            </p>
          </div>

          <!-- 定位結果：拿不到座標 -->
          <div
            v-else-if="geo.state === 'error'"
            class="mt-4 rounded-card border-2 border-vermilion-300 bg-vermilion-50 p-4 animate-pop-in"
          >
            <p class="flex items-center gap-2 text-sm font-black text-vermilion-700">
              <UIcon name="i-lucide-triangle-alert" class="size-4.5 shrink-0" />定位失敗
            </p>
            <p class="mt-1.5 text-xs leading-relaxed text-ink-soft">{{ geo.message }}</p>
          </div>

          <!-- 主要動作 -->
          <UButton
            :color="busy ? 'neutral' : 'primary'"
            :variant="busy ? 'soft' : 'solid'"
            size="xl"
            block
            :loading="busy"
            :icon="busy ? undefined : 'i-lucide-map-pin-check'"
            class="mt-4 rounded-full font-bold"
            @click="locate"
          >
            <template v-if="busy">定位中…</template>
            <template v-else>{{ geo.state === 'far' ? '再定位一次' : '我已抵達，蓋章' }}</template>
          </UButton>

          <!-- ⚠️ 示範用捷徑，正式上線移除 -->
          <button
            v-if="target"
            class="mt-2.5 w-full text-center text-[11px] font-bold text-ink-faint underline underline-offset-2 hover:text-ink-soft"
            @click="simulateArrival"
          >
            略過定位，直接蓋章
          </button>

          <p class="mt-3 text-center text-[11px] leading-relaxed text-ink-faint">
            到了現場就能蓋章，每一站限蓋一枚
          </p>
        </template>

        <!-- 打卡結果 -->
        <template v-else-if="target && result">
          <div v-if="result.duplicated" class="card overflow-hidden animate-pop-in">
            <div class="bg-paper-deep px-6 py-10 text-center">
              <span class="mx-auto grid size-24 place-items-center rounded-full border-2 border-dashed border-ink-faint bg-white/60">
                <img :src="target.art" alt="" class="size-16 object-contain opacity-60 grayscale">
              </span>
              <h2 class="mt-3 text-xl font-black sm:text-2xl">這一站已經蓋過章了</h2>
              <p class="mt-1.5 text-xs text-ink-soft">每一站只能蓋一枚章，換個地方再來吧</p>
            </div>
            <div class="p-5">
              <p class="flex items-center gap-2 font-bold">
                <UIcon :name="target.icon" class="size-5 text-ink-soft" />{{ target.name }}
              </p>
              <p class="mt-1 text-xs text-ink-soft">{{ target.town }} ‧ {{ target.desc }}</p>
            </div>
          </div>

          <div v-else class="card overflow-hidden animate-pop-in">
            <div class="bg-vermilion-50 px-6 py-10 text-center">
              <!-- 蓋下去的就是護照印章格裡的那一枚：同一張插圖、同樣的紅框與傾斜 -->
              <span class="mx-auto grid size-28 -rotate-6 place-items-center rounded-full border-4 border-vermilion-500 bg-white shadow-card animate-pop-in">
                <img :src="target.art" alt="" class="size-20 object-contain">
              </span>
              <h2 class="mt-3 text-2xl font-black sm:text-3xl">蓋章成功！</h2>
              <p class="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-marigold-500 px-4 py-1.5 text-base font-black text-ink">
                <UIcon name="i-lucide-coins" class="size-4.5" />+{{ result.gained }} 點
              </p>
              <p class="mt-2 text-xs text-ink-soft">已蓋進你的觀光護照，累積 {{ toComma(earnedPoints) }} 點</p>
            </div>

            <div class="p-5 sm:p-6">
              <div class="flex items-center gap-3">
                <span class="grid place-items-center size-12 shrink-0 rounded-2xl bg-vermilion-50 text-vermilion-600">
                  <UIcon :name="target.icon" class="size-6" />
                </span>
                <div class="min-w-0">
                  <p class="font-bold truncate">{{ target.name }}</p>
                  <p class="text-xs text-ink-soft">{{ target.town }} ‧ {{ target.desc }}</p>
                </div>
              </div>

              <dl class="mt-4 grid grid-cols-2 gap-2.5 text-[11px]">
                <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
                  <dt class="text-ink-faint">任務點數</dt>
                  <dd class="mt-0.5 font-bold">{{ target.points }} 點</dd>
                </div>
                <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
                  <dt class="text-ink-faint">蓋章時間</dt>
                  <dd class="mt-0.5 font-bold">2026.09.20 14:32</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- 這一章剛好升級 -->
          <div v-if="result.levelUp" class="mt-4 rounded-card bg-marigold-500 p-5 text-center shadow-pop animate-pop-in">
            <img :src="result.levelUp.art" alt="" class="mx-auto h-20 w-auto object-contain">
            <p class="mt-1.5 text-lg font-black text-ink">
              升級為等級{{ ['一', '二', '三'][result.levelUp.level - 1] }}「{{ result.levelUp.name }}」
            </p>
            <p class="mt-0.5 text-[11px] text-ink/70">
              累積點數已達 {{ toComma(result.levelUp.threshold) }} 點，可兌換這個等級的專屬優惠
            </p>
            <UButton to="/member" color="neutral" variant="solid" size="sm" class="mt-3 rounded-full font-bold" trailing-icon="i-lucide-chevron-right">
              去兌換
            </UButton>
          </div>

          <!-- 順帶解鎖的里程碑（打卡任務不會觸發，但共用同一個結果結構） -->
          <div
            v-for="m in result.unlocked"
            :key="m.id"
            class="mt-4 flex items-center gap-3 rounded-card border-2 border-marigold-500 bg-marigold-50 p-4 animate-pop-in"
          >
            <img :src="m.art" alt="" class="h-12 w-auto shrink-0 object-contain">
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-bold text-marigold-700">解鎖里程碑</p>
              <p class="font-black">{{ m.title }}</p>
            </div>
            <span class="shrink-0 font-black text-marigold-700">+{{ m.points }}</span>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <UButton color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold" @click="reset">
              再蓋一枚
            </UButton>
            <UButton to="/tasks" color="primary" size="lg" class="flex-1 rounded-full font-bold">
              回任務牆
            </UButton>
          </div>
        </template>
      </div>

      <!-- ── 右：我的護照 + 快速挑站點 ───────────── -->
      <div class="space-y-5">
        <div class="card p-5 sm:p-6">
          <h2 class="text-lg font-black">我的護照</h2>
          <div class="mt-4">
            <LevelProgress />
          </div>
        </div>

        <div v-if="phase === 'idle'" class="card p-5 sm:p-6">
          <h2 class="text-lg font-black">或直接挑一個站點</h2>
          <p class="mt-0.5 text-xs text-ink-soft">選定站點後，到現場按「我已抵達」即可蓋章</p>

          <div class="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button
              v-for="spot in pickList"
              :key="spot.id"
              class="flex items-center gap-2.5 rounded-2xl border-2 bg-white px-3 py-2.5 text-left transition-colors"
              :class="target?.id === spot.id ? 'border-ink' : 'border-paper-deep hover:border-ink-faint'"
              @click="target = spot"
            >
              <span class="grid place-items-center size-9 shrink-0 rounded-xl bg-vermilion-50 text-vermilion-600">
                <UIcon :name="spot.icon" class="size-5" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-xs font-bold">{{ spot.name }}</span>
                <span class="block text-[10px] text-ink-faint">
                  {{ spot.town }} ‧ <b class="text-marigold-700">+{{ spot.points }} 點</b>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
