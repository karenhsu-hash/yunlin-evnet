<script setup lang="ts">
/**
 * 單一系列的小倍數圖（small multiple）。
 * 兩張並排時各自只有一個系列，標題即為系列名，因此不需圖例。
 */
const props = defineProps<{
  title: string
  points: number[]
  labels: string[]
  /** 循序色階的單一色相 */
  color?: string
}>()

const color = computed(() => props.color || '#4E9DC2')

/**
 * 漸層的 id 必須是合法且唯一的識別字。
 * 先前直接用 title 組出的 id 含空白（如「g-LINE 好友」），
 * url(#…) 會解析失敗而讓區域填成黑色，故改用 useId()。
 */
const gradId = `spark-${useId()}`

const W = 150
const H = 56

const max = computed(() => Math.max(...props.points))
const coords = computed(() =>
  props.points.map((p, i) => ({
    x: (i / (props.points.length - 1)) * W,
    y: H - (p / max.value) * (H - 6) - 3,
    v: p,
    label: props.labels[i]
  }))
)

const line = computed(() => coords.value.map((c, i) => `${i ? 'L' : 'M'}${c.x},${c.y}`).join(' '))
const area = computed(() => `${line.value} L${W},${H} L0,${H} Z`)

const hover = ref<number | null>(null)
const active = computed(() => (hover.value === null ? null : coords.value[hover.value]))
const last = computed(() => props.points[props.points.length - 1])
</script>

<template>
  <div class="rounded-2xl bg-paper-soft p-3">
    <p class="text-[11px] font-bold text-ink-soft">{{ title }}</p>
    <p class="mt-0.5 text-xl font-black leading-none tabular-nums">
      {{ toComma(active ? active.v : last) }}
      <span class="text-[10px] font-bold text-ink-faint">
        {{ active ? active.label : '累計' }}
      </span>
    </p>

    <div class="relative mt-2">
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" role="img" :aria-label="title">
        <defs>
          <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
            <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <path :d="area" :fill="`url(#${gradId})`" />
        <!-- 2px 線寬 -->
        <path :d="line" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- ≥8px 的端點標記 -->
        <circle
          :cx="coords[coords.length - 1].x - 2" :cy="coords[coords.length - 1].y"
          r="3.5" :fill="color" stroke="#FDF9F0" stroke-width="2"
        />

        <g v-if="active">
          <line :x1="active.x" :x2="active.x" :y1="0" :y2="H" stroke="#3D3A35" stroke-width="1" opacity="0.25" />
          <circle :cx="active.x" :cy="active.y" r="4" :fill="color" stroke="#FDF9F0" stroke-width="2" />
        </g>

        <!-- 命中區大於標記本身 -->
        <rect
          v-for="(c, i) in coords" :key="i"
          :x="c.x - W / coords.length / 2" y="0"
          :width="W / coords.length" :height="H"
          fill="transparent"
          @mouseenter="hover = i" @mouseleave="hover = null"
        />
      </svg>
    </div>
  </div>
</template>
