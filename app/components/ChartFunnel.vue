<script setup lang="ts">
/**
 * 參與漏斗：單一系列（量值），採單一色相由淺至深的循序色階。
 * 每列直接標值，不需圖例。
 */
const props = defineProps<{
  data: { label: string; value: number }[]
}>()

/** sky 色相的循序色階，淺 → 深 */
const RAMP = ['#94CBE2', '#6FB6D6', '#4E9DC2', '#3C7EA1', '#31647E', '#264E63']

const top = computed(() => props.data[0]?.value || 1)
const rows = computed(() =>
  props.data.map((d, i) => ({
    ...d,
    pct: (d.value / top.value) * 100,
    // 相對前一級的轉換率
    step: i === 0 ? null : (d.value / props.data[i - 1].value) * 100,
    color: RAMP[Math.min(i, RAMP.length - 1)]
  }))
)
</script>

<template>
  <ul class="space-y-2">
    <li v-for="(r, i) in rows" :key="r.label">
      <div class="flex items-baseline justify-between gap-2">
        <span class="text-[11px] font-bold text-ink-soft">{{ r.label }}</span>
        <span class="shrink-0 text-[11px] tabular-nums text-ink-faint">
          <b class="text-ink">{{ toComma(r.value) }}</b>
          <template v-if="r.step"> ‧ 轉換 {{ r.step.toFixed(0) }}%</template>
        </span>
      </div>
      <!-- 4px 圓角、貼齊起點的長條 -->
      <div class="mt-1 h-5 w-full rounded bg-paper-soft">
        <div
          class="h-5 rounded transition-all duration-500"
          :style="{ width: `${Math.max(r.pct, 3)}%`, background: r.color }"
          :title="`${r.label}：${toComma(r.value)} 人`"
        />
      </div>
    </li>
  </ul>
</template>
