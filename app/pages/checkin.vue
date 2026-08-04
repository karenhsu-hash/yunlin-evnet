<script setup lang="ts">
import type { Coupon, Spot } from '~/composables/useCampaign'

const route = useRoute()
const { isLoggedIn, member, completedStages, nextNeed, isCheckedIn, spotById, checkIn } = useCampaign()

type Phase = 'idle' | 'scanning' | 'locating' | 'done'
const phase = ref<Phase>('idle')

const target = ref<Spot | null>(
  (typeof route.query.spot === 'string' ? spotById(route.query.spot) : null) ?? null
)

const result = ref<{
  ok: boolean
  duplicated: boolean
  newStage: number | null
  coupon: Coupon | null
} | null>(null)

function pickSpot(): Spot {
  const todo = ALL_SPOTS.filter((s) => !isCheckedIn(s.id))
  const pool = todo.length ? todo : ALL_SPOTS
  return pool[Math.floor(Math.random() * pool.length)]
}

let timers: ReturnType<typeof setTimeout>[] = []
onUnmounted(() => timers.forEach(clearTimeout))

function startScan() {
  if (!target.value) target.value = pickSpot()
  result.value = null
  phase.value = 'scanning'

  // 模擬掃碼、定位、寫入紀錄三段耗時
  timers.push(
    setTimeout(() => (phase.value = 'locating'), 1400),
    setTimeout(() => {
      const spot = target.value!
      const duplicated = isCheckedIn(spot.id)
      const outcome = duplicated ? { newStage: null, coupon: null } : checkIn(spot.id)
      result.value = { ok: true, duplicated, ...outcome }
      phase.value = 'done'
    }, 2600)
  )
}

function reset() {
  timers.forEach(clearTimeout)
  timers = []
  target.value = null
  result.value = null
  phase.value = 'idle'
}

const busy = computed(() => phase.value === 'scanning' || phase.value === 'locating')

</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <!-- 未登入：打卡需對應到會員帳號 -->
    <div v-if="!isLoggedIn" class="container-narrow">
      <LoginGate
        title="登入後才能掃碼打卡"
        desc="打卡會記錄在你的帳號下，請先登入再開始。"
        icon="i-lucide-qr-code"
      />
    </div>

    <template v-else>
    <!-- ── 頁首 ─────────────────────────────────── -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <span class="chip bg-vermilion-100 text-vermilion-700">景點打卡</span>
        <h1 class="mt-2 text-3xl font-black leading-tight sm:text-4xl">掃碼打卡</h1>
        <p class="mt-1.5 max-w-lg text-sm text-ink-soft">
          在景點現場掃一下 QR code，就完成到訪紀錄。
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
        <!-- 掃描中 -->
        <template v-if="phase !== 'done'">
          <div class="overflow-hidden rounded-card bg-ink p-6 sm:p-8">
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
                  <p class="mt-3 text-xs text-white/70">將景點的 QR code<br>對準取景框</p>
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

          <div v-if="target" class="mt-4 card flex items-center gap-3 p-4 animate-pop-in">
            <span
              class="grid place-items-center size-12 shrink-0 rounded-2xl"
              :class="target.type === 'red' ? 'bg-vermilion-50 text-vermilion-600' : 'bg-moss-50 text-moss-600'"
            >
              <UIcon :name="target.icon" class="size-6" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[11px] text-ink-faint">即將打卡</p>
              <p class="font-bold truncate">{{ target.name }}</p>
            </div>
            <span
              class="chip shrink-0"
              :class="target.type === 'red' ? 'bg-vermilion-100 text-vermilion-700' : 'bg-moss-100 text-moss-700'"
            >{{ target.type === 'red' ? '紅點' : '綠點' }}</span>
          </div>

          <UButton
            :color="busy ? 'neutral' : 'primary'"
            :variant="busy ? 'soft' : 'solid'"
            size="xl"
            block
            :loading="busy"
            :icon="busy ? undefined : 'i-lucide-scan-line'"
            class="mt-4 rounded-full font-bold"
            @click="startScan"
          >
            {{ busy ? '辨識中…' : target ? '開始掃碼' : '模擬掃描附近 QR code' }}
          </UButton>

          <p class="mt-3 text-center text-[11px] leading-relaxed text-ink-faint">
            紅點請先消費滿 {{ CAMPAIGN.minSpend }} 元再掃碼，綠點拍張照就完成
          </p>
        </template>

        <!-- 打卡結果 -->
        <template v-else-if="target && result">
          <div v-if="result.duplicated" class="card overflow-hidden animate-pop-in">
            <div class="bg-paper-deep px-6 py-10 text-center">
              <UIcon name="i-lucide-rotate-ccw" class="size-14 text-ink-soft" />
              <h2 class="mt-3 text-xl font-black sm:text-2xl">這個景點已經打過卡了</h2>
              <p class="mt-1.5 text-xs text-ink-soft">每個景點只能算一次，換個地方再來吧</p>
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
              :class="target.type === 'red' ? 'bg-vermilion-50' : 'bg-moss-50'"
            >
              <UIcon
                name="i-lucide-circle-check-big"
                class="size-16"
                :class="target.type === 'red' ? 'text-vermilion-500' : 'text-moss-500'"
              />
              <h2 class="mt-3 text-2xl font-black sm:text-3xl">打卡成功！</h2>
              <p class="mt-1.5 text-xs text-ink-soft">已記入你的任務進度</p>
            </div>

            <div class="p-5 sm:p-6">
              <div class="flex items-center gap-3">
                <span
                  class="grid place-items-center size-12 shrink-0 rounded-2xl"
                  :class="target.type === 'red' ? 'bg-vermilion-50 text-vermilion-600' : 'bg-moss-50 text-moss-600'"
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
                  <dt class="text-ink-faint">景點類型</dt>
                  <dd class="mt-0.5 font-bold">
                    {{ target.type === 'red' ? '紅點 ‧ 可消費' : '綠點 ‧ 拍照打卡' }}
                  </dd>
                </div>
                <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
                  <dt class="text-ink-faint">打卡時間</dt>
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
                完成第 {{ result.newStage }} 段任務，折價券已自動入袋
              </p>
              <p class="mt-0.5 text-[11px] text-ink/70">已存進你的券包</p>
            </div>
            <div class="mt-4">
              <CouponCard :coupon="result.coupon" />
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-3">
            <UButton color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold" @click="reset">
              再掃一個
            </UButton>
            <UButton to="/events" color="primary" size="lg" class="flex-1 rounded-full font-bold">
              回景點地圖
            </UButton>
          </div>
        </template>
      </div>

      <!-- ── 右：任務進度 + 快速挑景點 ───────────── -->
      <div class="space-y-5">
        <div class="card p-5 sm:p-6">
          <h2 class="text-lg font-black">我的進度</h2>
          <div class="mt-4">
            <StageProgress :completed="completedStages" />
          </div>

          <p v-if="nextNeed" class="mt-4 rounded-2xl bg-paper-soft px-3.5 py-3 text-xs text-ink-soft sm:text-sm">
            再打
            <b v-if="nextNeed.needRed" class="text-vermilion-600">{{ nextNeed.needRed }} 個紅點</b>
            <template v-if="nextNeed.needRed && nextNeed.needGreen"> ＋ </template>
            <b v-if="nextNeed.needGreen" class="text-moss-600">{{ nextNeed.needGreen }} 個綠點</b>
            ，即可解鎖 <b class="text-marigold-700">{{ nextNeed.reward }} 元</b>折價券
          </p>
          <p
            v-else
            class="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-marigold-100 px-3.5 py-3 text-xs font-bold text-marigold-700"
          >
            <UIcon name="i-lucide-party-popper" class="size-4" />
            三段任務全部完成，共領取 {{ CAMPAIGN.quota }} 元
          </p>
        </div>

        <div v-if="phase === 'idle'" class="card p-5 sm:p-6">
          <h2 class="text-lg font-black">或直接挑一個景點</h2>
          <p class="mt-0.5 text-xs text-ink-soft">選一個景點，模擬掃描它的 QR code</p>

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
                :class="spot.type === 'red' ? 'bg-vermilion-50 text-vermilion-600' : 'bg-moss-50 text-moss-600'"
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
