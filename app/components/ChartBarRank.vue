<script setup lang="ts">
/**
 * 站點集章排行。站點已不分類型，單一數列、單一色，不需要圖例。
 */
const props = defineProps<{
  data: { name: string; count: number }[]
}>()

const max = computed(() => Math.max(...props.data.map((d) => d.count)))
</script>

<template>
  <figure class="m-0">
    <ul class="space-y-2">
      <li v-for="d in data" :key="d.name">
        <div class="flex items-baseline justify-between gap-2">
          <span class="min-w-0 truncate text-[11px] font-bold text-ink-soft">{{ d.name }}</span>
          <span class="shrink-0 text-[11px] font-bold tabular-nums text-ink">{{ toComma(d.count) }}</span>
        </div>
        <div class="mt-1 h-3.5 w-full rounded bg-paper-soft">
          <div
            class="h-3.5 rounded bg-chart-redeemed transition-all duration-500"
            :style="{ width: `${(d.count / max) * 100}%` }"
            :title="`${d.name}：${toComma(d.count)} 次`"
          />
        </div>
      </li>
    </ul>
  </figure>
</template>
