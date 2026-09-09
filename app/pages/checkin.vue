<script setup lang="ts">
import type { Coupon, Spot } from '~/composables/useCampaign'

/**
 * 打卡有兩種方式：
 *   掃碼　—— 站點現場的實體 QR code，掃完再比對經緯度確認人真的在現場
 *   定位　—— 步道、濕地、出海口這類開放場域沒有立牌可掛 QR，改成按「我已抵達」，
 *            直接取瀏覽器定位與站點座標比對，在判定半徑內就算完成
 *
 * hasQr 為 false 的站點只提供定位打卡，選到時自動切過去，掃碼那個分頁會被停用。
 */
const route = useRoute()
const { isLoggedIn, member, completedStages, nextNeed, isCheckedIn, spotById, checkIn } = useCampaign()

type Method = 'qr' | 'geo'
type Phase = 'idle' | 'scanning' | 'locating' | 'done'

const phase = ref<Phase>('idle')

const target = ref<Spot | null>(
  (typeof route.query.spot === 'string' ? spotById(route.query.spot) : null) ?? null
)

/**
 * 預設方式要看初始站點決定：從 /checkin?spot=g6 這種無 QR 的站點進來時，
 * target 是初始值而不是「變更」，下面的 watch 不會觸發，
 * 若一律預設 qr 會直接卡在被停用的掃碼分頁。
 */
const method = ref<Method>(target.value && !hasQr(target.value) ? 'geo' : 'qr')

const result = ref<{
  ok: boolean
  duplicated: boolean
  newStage: number | null
  coupon: Coupon | null
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

/** 目標站點是否有實體 QR；沒有就只能定位 */
const targetHasQr = computed(() => (target.value ? hasQr(target.value) : true))
const targetRadius = computed(() => (target.value ? radiusOf(target.value) : CAMPAIGN.geoRadiusM))

// 換站點時清掉上一次的定位結果；選到沒有 QR 的站點就自動切到定位打卡
// 打卡完成後 target 可能是被定位反查填上的，這時不能清掉剛算出來的距離
watch(target, (t) => {
  if (phase.value === 'done') return
  resetGeo()
  if (t && !hasQr(t)) method.value = 'geo'
})

function pickSpot(): Spot {
  const todo = ALL_SPOTS.filter((s) => !isCheckedIn(s.id))
  const pool = todo.length ? todo : ALL_SPOTS
  return pool[Math.floor(Math.random() * pool.length)]
}

let timers: ReturnType<typeof setTimeout>[] = []
onUnmounted(() => timers.forEach(clearTimeout))

/** 寫入打卡紀錄（兩種方式共用），回傳是否剛好觸發新的一段任務 */
function finish(spot: Spot) {
  const duplicated = isCheckedIn(spot.id)
  const outcome = duplicated ? { newStage: null, coupon: null } : checkIn(spot.id)
  result.value = { ok: true, duplicated, ...outcome }
  phase.value = 'done'
}

// ── 掃碼打卡 ────────────────────────────────────
function startScan() {
  if (!target.value) target.value = pickSpot()
  if (!targetHasQr.value) return
  result.value = null
  phase.value = 'scanning'

  // 模擬掃碼、定位、寫入紀錄三段耗時
  timers.push(
    setTimeout(() => (phase.value = 'locating'), 1400),
    setTimeout(() => finish(target.value!), 2600)
  )
}

// ── 定位打卡 ────────────────────────────────────
function locate() {
  const spot = target.value
  result.value = null
  resetGeo()

  if (!import.meta.client || !('geolocation' in navigator)) {
    geo.value = { ...geo.value, state: 'error', message: '這個瀏覽器不支援定位功能，請改用掃碼或更換瀏覽器。' }
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
  timers.forEach(clearTimeout)
  timers = []
  target.value = null
  result.value = null
  resetGeo()
  phase.value = 'idle'
}

const busy = computed(() => phase.value === 'scanning' || phase.value === 'locating')
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <!-- 未登入：打卡需對應到會員帳號 -->
    <div v-if="!isLoggedIn" class="container-narrow">
      <LoginGate
        title="登入後才能打卡"
        desc="打卡會記錄在你的帳號下，請先登入再開始。"
        icon="i-lucide-qr-code"
      />
    </div>

    <template v-else>
    <!-- ── 頁首 ─────────────────────────────────── -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <span class="chip bg-vermilion-100 text-vermilion-700">旅遊護照</span>
        <h1 class="mt-2 text-3xl font-black leading-tight sm:text-4xl">護照集章</h1>
        <p class="mt-1.5 max-w-lg text-sm text-ink-soft">
          走到站點現場，掃碼或定位，就能在護照上蓋下一枚章。
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

    <div class="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
      <!-- ── 左：掃描器 / 結果 ────────────────────── -->
      <div>
        <!-- 打卡前：先選方式，再掃碼或定位 -->
        <template v-if="phase !== 'done'">
          <!-- 打卡方式。沒有實體 QR 的站點會停用掃碼那一顆 -->
          <div class="flex gap-2" role="tablist" aria-label="集章方式">
            <button
              role="tab"
              :aria-selected="method === 'qr'"
              :disabled="!!target && !targetHasQr"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              :class="method === 'qr' ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
              @click="method = 'qr'"
            >
              <UIcon name="i-lucide-scan-line" class="size-4" />掃碼集章
            </button>
            <button
              role="tab"
              :aria-selected="method === 'geo'"
              class="flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition-colors"
              :class="method === 'geo' ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
              @click="method = 'geo'"
            >
              <UIcon name="i-lucide-map-pin-check" class="size-4" />定位集章
            </button>
          </div>

          <!-- 掃碼取景框 -->
          <div v-if="method === 'qr'" class="mt-4 overflow-hidden rounded-card bg-ink p-6 sm:p-8">
            <div class="relative mx-auto aspect-square w-full max-w-xs rounded-3xl bg-black/40">
              <span class="absolute left-0 top-0 size-10 rounded-tl-3xl border-l-4 border-t-4 border-marigold-500" />
              <span class="absolute right-0 top-0 size-10 rounded-tr-3xl border-r-4 border-t-4 border-marigold-500" />
              <span class="absolute left-0 bottom-0 size-10 rounded-bl-3xl border-l-4 border-b-4 border-marigold-500" />
              <span class="absolute right-0 bottom-0 size-10 rounded-br-3xl border-r-4 border-b-4 border-marigold-500" />

              <span
                v-if="busy"
                class="absolute left-2 right-2 top-0 h-0.5 bg-marigold-500 shadow-[0_0_12px_2px_rgb(245_196_51/0.8)] animate-scan-line"
              />

              <div class="absolute inset-0 grid place-items-center px-6 text-center">
                <div v-if="phase === 'idle'">
                  <UIcon name="i-lucide-scan-line" class="size-14 text-white/70" />
                  <p class="mt-3 text-xs text-white/70">將站點的 QR code<br>對準取景框</p>
                </div>
                <div v-else-if="phase === 'scanning'">
                  <UIcon name="i-lucide-qr-code" class="size-12 animate-pulse text-marigold-500" />
                  <p class="mt-3 text-xs font-bold text-marigold-500">讀取 QR code…</p>
                </div>
                <div v-else>
                  <UIcon name="i-lucide-satellite-dish" class="size-12 animate-pulse text-marigold-500" />
                  <p class="mt-3 text-xs font-bold text-marigold-500">確認你在現場…</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 定位雷達 -->
          <div v-else class="mt-4 overflow-hidden rounded-card bg-ink p-6 sm:p-8">
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
              <span
                class="grid place-items-center size-12 shrink-0 rounded-2xl"
                :class="kindOf(target.type).soft"
              >
                <UIcon :name="target.icon" class="size-6" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] text-ink-faint">即將蓋章</p>
                <p class="font-bold truncate">{{ target.name }}</p>
              </div>
              <span class="chip shrink-0" :class="kindOf(target.type).chip">
                {{ kindOf(target.type).label }}
              </span>
            </div>

            <p
              v-if="!targetHasQr"
              class="mt-3 flex items-start gap-1.5 rounded-2xl bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-700"
            >
              <UIcon name="i-lucide-info" class="mt-px size-3.5 shrink-0" />
              <span>這是開放場域，現場沒有設置實體 QR code，請用<b>定位集章</b>完成（判定半徑 {{ targetRadius }} 公尺）。</span>
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
                你距離 <b>{{ target?.name }}</b> 還有 <b>{{ readableDistance(geo.distance!) }}</b>，
                需進入 {{ targetRadius }} 公尺內才能蓋章。
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
            :icon="busy ? undefined : method === 'qr' ? 'i-lucide-scan-line' : 'i-lucide-map-pin-check'"
            class="mt-4 rounded-full font-bold"
            @click="method === 'qr' ? startScan() : locate()"
          >
            <template v-if="busy">{{ phase === 'locating' ? '定位中…' : '辨識中…' }}</template>
            <template v-else-if="method === 'qr'">{{ target ? '開始掃碼' : '掃描附近的 QR code' }}</template>
            <template v-else>{{ geo.state === 'far' ? '再定位一次' : '我已抵達，蓋章' }}</template>
          </UButton>

          <!-- ⚠️ 示範用捷徑，正式上線移除 -->
          <button
            v-if="method === 'geo' && target"
            class="mt-2.5 w-full text-center text-[11px] font-bold text-ink-faint underline underline-offset-2 hover:text-ink-soft"
            @click="simulateArrival"
          >
            略過定位，直接蓋章
          </button>

          <p class="mt-3 text-center text-[11px] leading-relaxed text-ink-faint">
            {{ SPOT_KIND.experience.label }}請先消費滿 {{ CAMPAIGN.minSpend }} 元再蓋章，{{ SPOT_KIND.highlight.label }}拍張照就完成
          </p>
        </template>

        <!-- 打卡結果 -->
        <template v-else-if="target && result">
          <div v-if="result.duplicated" class="card overflow-hidden animate-pop-in">
            <div class="bg-paper-deep px-6 py-10 text-center">
              <UIcon name="i-lucide-rotate-ccw" class="size-14 text-ink-soft" />
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
            <div
              class="px-6 py-10 text-center"
              :class="target.type === 'experience' ? 'bg-vermilion-50' : 'bg-moss-50'"
            >
              <UIcon
                name="i-lucide-circle-check-big"
                class="size-16"
                :class="target.type === 'experience' ? 'text-vermilion-500' : 'text-moss-500'"
              />
              <h2 class="mt-3 text-2xl font-black sm:text-3xl">蓋章成功！</h2>
              <p class="mt-1.5 text-xs text-ink-soft">已蓋進你的旅遊護照</p>
            </div>

            <div class="p-5 sm:p-6">
              <div class="flex items-center gap-3">
                <span
                  class="grid place-items-center size-12 shrink-0 rounded-2xl"
                  :class="kindOf(target.type).soft"
                >
                  <UIcon :name="target.icon" class="size-6" />
                </span>
                <div class="min-w-0">
                  <p class="font-bold truncate">{{ target.name }}</p>
                  <p class="text-xs text-ink-soft">{{ target.town }} ‧ {{ target.desc }}</p>
                </div>
              </div>

              <dl class="mt-4 grid grid-cols-2 gap-2.5 text-[11px]">
                <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
                  <dt class="text-ink-faint">站點類型</dt>
                  <dd class="mt-0.5 font-bold">
                    {{ kindOf(target.type).label }} ‧ {{ kindOf(target.type).short }}
                  </dd>
                </div>
                <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
                  <dt class="text-ink-faint">蓋章時間</dt>
                  <dd class="mt-0.5 font-bold">2026.09.20 14:32</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- 觸發發券 -->
          <div v-if="result.coupon" class="mt-4 rounded-card bg-marigold-500 p-5 shadow-pop animate-pop-in">
            <div class="text-center">
              <UIcon name="i-lucide-party-popper" class="size-9 text-ink" />
              <p class="mt-1.5 font-black text-ink">
                完成第 {{ result.newStage }} 段任務，優惠券已自動入袋
              </p>
              <p class="mt-0.5 text-[11px] text-ink/70">已存進你的券包</p>
            </div>
            <div class="mt-4">
              <CouponCard :coupon="result.coupon" />
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <UButton color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold" @click="reset">
              再蓋一枚
            </UButton>
            <UButton to="/events" color="primary" size="lg" class="flex-1 rounded-full font-bold">
              回路線地圖
            </UButton>
          </div>
        </template>
      </div>

      <!-- ── 右：任務進度 + 快速挑景點 ───────────── -->
      <div class="space-y-5">
        <div class="card p-5 sm:p-6">
          <h2 class="text-lg font-black">我的護照</h2>
          <div class="mt-4">
            <StageProgress :completed="completedStages" />
          </div>

          <p v-if="nextNeed" class="mt-4 rounded-2xl bg-paper-soft px-3.5 py-3 text-xs text-ink-soft sm:text-sm">
            再打
            <b v-if="nextNeed.needExperience" class="text-vermilion-600">{{ nextNeed.needExperience }} 個{{ SPOT_KIND.experience.label }}</b>
            <template v-if="nextNeed.needExperience && nextNeed.needHighlight"> ＋ </template>
            <b v-if="nextNeed.needHighlight" class="text-moss-600">{{ nextNeed.needHighlight }} 個{{ SPOT_KIND.highlight.label }}</b>
            ，即可解鎖 <b class="text-marigold-700">{{ nextNeed.reward }} 元</b>優惠券
          </p>
          <p
            v-else
            class="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-marigold-100 px-3.5 py-3 text-xs font-bold text-marigold-700"
          >
            <UIcon name="i-lucide-party-popper" class="size-4" />
            三段任務全部完成，共領取 {{ toComma(CAMPAIGN.quota) }} 元
          </p>
        </div>

        <div v-if="phase === 'idle'" class="card p-5 sm:p-6">
          <h2 class="text-lg font-black">或直接挑一個站點</h2>
          <p class="mt-0.5 text-xs text-ink-soft">選定站點後，掃碼或定位都能蓋章</p>

          <div class="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button
              v-for="spot in ALL_SPOTS.filter((s) => !isCheckedIn(s.id)).slice(0, 8)"
              :key="spot.id"
              class="flex items-center gap-2.5 rounded-2xl border-2 bg-white px-3 py-2.5 text-left transition-colors"
              :class="target?.id === spot.id ? 'border-ink' : 'border-paper-deep hover:border-ink-faint'"
              @click="target = spot"
            >
              <span
                class="grid place-items-center size-9 shrink-0 rounded-xl"
                :class="kindOf(spot.type).soft"
              >
                <UIcon :name="spot.icon" class="size-5" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-xs font-bold">{{ spot.name }}</span>
                <span class="block text-[10px] text-ink-faint">{{ spot.town }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
