<script setup lang="ts">
/**
 * KPI 單格。單一數字不需要圖，因此沒有任何圖形編碼，
 * 只有數值 ＋ 說明 ＋ 變化方向（附箭頭圖示與文字，不靠顏色單獨承載）。
 */
withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    /** 週變化百分比 */
    delta?: number
    icon?: string
  }>(),
  { hint: '', delta: undefined, icon: '' }
)
</script>

<template>
  <div class="card p-3.5 sm:p-4">
    <div class="flex items-start justify-between gap-2">
      <p class="text-[11px] font-bold text-ink-soft sm:text-xs">{{ label }}</p>
      <UIcon v-if="icon" :name="icon" class="size-4 shrink-0 text-ink-faint" />
    </div>

    <p class="mt-1.5 text-2xl font-black leading-none tabular-nums sm:text-3xl">{{ value }}</p>

    <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
      <span
        v-if="delta !== undefined"
        class="chip"
        :class="delta >= 0 ? 'bg-moss-100 text-moss-700' : 'bg-vermilion-100 text-vermilion-700'"
      >
        <UIcon
          :name="delta >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
          class="size-3.5"
        />
        {{ Math.abs(delta).toFixed(1) }}%
      </span>
      <span v-if="hint" class="text-[10px] text-ink-faint">{{ hint }}</span>
    </div>
  </div>
</template>
