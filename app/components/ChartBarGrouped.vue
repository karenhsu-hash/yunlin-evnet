<script setup lang="ts">
/**
 * 分組長條圖：兩個同單位系列共用一條 Y 軸（絕不使用雙軸）。
 * 色票 #B37F06 / #0E6FA5 已通過 dataviz 六項檢核。
 */
const props = defineProps<{
  data: { week: string; issued: number; redeemed: number }[]
}>()

const W = 340
const H = 190
const PAD = { l: 40, r: 8, t: 14, b: 26 }

const plotW = W - PAD.l - PAD.r
const plotH = H - PAD.t - PAD.b

/** 讓 4 等分後的刻度落在好讀的整數上（1 / 2 / 2.5 / 4 / 5 × 10ⁿ） */
function niceStep(raw: number) {
  const mag = 10 ** Math.floor(Math.log10(raw))
  for (const m of [1, 2, 2.5, 4, 5, 10]) {
    if (m * mag >= raw) return m * mag
  }
  return 10 * mag
}

const step = computed(() => {
  const m = Math.max(...props.data.flatMap((d) => [d.issued, d.redeemed]))
  return niceStep(m / 4)
})
const max = computed(() => step.value * 4)

const ticks = computed(() => {
  const t = []
  for (let i = 0; i <= 4; i++) t.push((max.value / 4) * i)
  return t
})

const groupW = computed(() => plotW / props.data.length)
const BAR = 14
const GAP = 2 // 相鄰長條之間的表面間隙

const y = (v: number) => PAD.t + plotH - (v / max.value) * plotH

/** 頂端 4px 圓角、底部貼齊基線的長條路徑 */
function barPath(xLeft: number, value: number) {
  const top = y(value)
  const base = PAD.t + plotH
  const r = Math.min(4, (base - top) / 2, BAR / 2)
  if (base - top < 0.5) return ''
  return [
    `M${xLeft},${base}`,
    `L${xLeft},${top + r}`,
    `Q${xLeft},${top} ${xLeft + r},${top}`,
    `L${xLeft + BAR - r},${top}`,
    `Q${xLeft + BAR},${top} ${xLeft + BAR},${top + r}`,
    `L${xLeft + BAR},${base}`,
    'Z'
  ].join(' ')
}

const groups = computed(() =>
  props.data.map((d, i) => {
    const cx = PAD.l + groupW.value * i + groupW.value / 2
    const xA = cx - BAR - GAP / 2
    const xB = cx + GAP / 2
    return { ...d, i, cx, xA, xB, pathA: barPath(xA, d.issued), pathB: barPath(xB, d.redeemed) }
  })
)

const hover = ref<number | null>(null)
const active = computed(() => (hover.value === null ? null : groups.value[hover.value]))
</script>

<template>
  <figure class="m-0">
    <!-- 圖例：兩個以上系列一律提供，身分不靠顏色單獨承載 -->
    <figcaption class="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span class="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
        <i class="w-2.5 h-2.5 rounded-sm bg-chart-issued not-italic" />發券金額
      </span>
      <span class="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
        <i class="w-2.5 h-2.5 rounded-sm bg-chart-redeemed not-italic" />核銷金額
      </span>
    </figcaption>

    <div class="relative">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" role="img" aria-label="每週發券與核銷金額分組長條圖">
        <!-- recessive 格線與刻度 -->
        <g>
          <line
            v-for="(t, i) in ticks"
            :key="i"
            :x1="PAD.l" :x2="W - PAD.r" :y1="y(t)" :y2="y(t)"
            stroke="#E7DECC" stroke-width="1"
          />
          <text
            v-for="(t, i) in ticks"
            :key="`l${i}`"
            :x="PAD.l - 6" :y="y(t) + 3"
            text-anchor="end" font-size="9" fill="#9A9288"
          >{{ t === 0 ? '0' : `${(t / 10000).toFixed(0)}萬` }}</text>
        </g>

        <!-- 長條 -->
        <g v-for="g in groups" :key="g.week">
          <path :d="g.pathA" fill="#B37F06" />
          <path :d="g.pathB" fill="#0E6FA5" />
          <text
            :x="g.cx" :y="H - 8"
            text-anchor="middle" font-size="9"
            :fill="hover === g.i ? '#3D3A35' : '#9A9288'"
            :font-weight="hover === g.i ? 700 : 400"
          >{{ g.week }}</text>

          <!-- 命中區大於長條本身 -->
          <rect
            :x="PAD.l + groupW * g.i" :y="PAD.t"
            :width="groupW" :height="plotH"
            fill="transparent" class="cursor-pointer"
            @mouseenter="hover = g.i" @mouseleave="hover = null"
            @click="hover = hover === g.i ? null : g.i"
          />
          <rect
            v-if="hover === g.i"
            :x="PAD.l + groupW * g.i" :y="PAD.t"
            :width="groupW" :height="plotH"
            fill="#3D3A35" opacity="0.05" pointer-events="none"
          />
        </g>

        <!-- 基線 -->
        <line :x1="PAD.l" :x2="W - PAD.r" :y1="PAD.t + plotH" :y2="PAD.t + plotH" stroke="#C9BCA3" stroke-width="1" />
      </svg>

      <!-- hover 浮層 -->
      <div
        v-if="active"
        class="pointer-events-none absolute top-1 rounded-xl bg-ink px-2.5 py-1.5 text-white shadow-pop"
        :style="{ left: `${(active.cx / W) * 100}%`, transform: 'translateX(-50%)' }"
      >
        <p class="text-[10px] font-bold">{{ active.week }}</p>
        <p class="mt-0.5 flex items-center gap-1 text-[10px] whitespace-nowrap">
          <i class="w-2 h-2 rounded-sm bg-chart-issued not-italic" />發券 {{ toWan(active.issued) }}
        </p>
        <p class="flex items-center gap-1 text-[10px] whitespace-nowrap">
          <i class="w-2 h-2 rounded-sm bg-chart-redeemed not-italic" />核銷 {{ toWan(active.redeemed) }}
        </p>
      </div>
    </div>
  </figure>
</template>
