<script setup lang="ts">
/**
 * 景點打卡排行：紅點／綠點兩類。
 * 這組色的 CVD ΔE 落在 6–8 的下限帶，因此一律搭配圖例 ＋ 每列直接標籤
 * ＋ 類型文字，身分不靠顏色單獨承載。
 */
const props = defineProps<{
  data: { name: string; type: 'red' | 'green'; count: number }[]
}>()

const max = computed(() => Math.max(...props.data.map((d) => d.count)))
</script>

<template>
  <figure class="m-0">
    <figcaption class="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span class="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
        <i class="w-2.5 h-2.5 rounded-sm bg-chart-red not-italic" />紅點 ‧ 可消費
      </span>
      <span class="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
        <i class="w-2.5 h-2.5 rounded-sm bg-chart-green not-italic" />綠點 ‧ 拍照
      </span>
    </figcaption>

    <ul class="space-y-2">
      <li v-for="d in data" :key="d.name">
        <div class="flex items-baseline justify-between gap-2">
          <span class="min-w-0 truncate text-[11px] font-bold text-ink-soft">
            <i
              class="mr-1 inline-block w-1.5 h-1.5 rounded-full align-middle not-italic"
              :class="d.type === 'red' ? 'bg-chart-red' : 'bg-chart-green'"
            />{{ d.name }}
          </span>
          <span class="shrink-0 text-[11px] font-bold tabular-nums text-ink">{{ toComma(d.count) }}</span>
        </div>
        <div class="mt-1 h-3.5 w-full rounded bg-paper-soft">
          <div
            class="h-3.5 rounded transition-all duration-500"
            :class="d.type === 'red' ? 'bg-chart-red' : 'bg-chart-green'"
            :style="{ width: `${(d.count / max) * 100}%` }"
            :title="`${d.name}：${toComma(d.count)} 次`"
          />
        </div>
      </li>
    </ul>
  </figure>
</template>
