<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 已完成段數 0–3 */
    completed: number
    /** 精簡版 */
    compact?: boolean
  }>(),
  { compact: false }
)

const { checkedRed, checkedGreen } = useCampaign()
</script>

<template>
  <div>
    <!-- 三段獎勵階梯 -->
    <ol class="flex items-stretch gap-1.5 sm:gap-2.5">
      <li
        v-for="s in STAGES"
        :key="s.stage"
        class="flex-1 rounded-2xl border-2 px-2 py-2.5 text-center transition-colors sm:py-3.5"
        :class="
          completed >= s.stage
            ? 'bg-marigold-100 border-marigold-500'
            : completed + 1 === s.stage
              ? 'bg-white border-dashed border-vermilion-300'
              : 'bg-paper-soft border-transparent'
        "
      >
        <p
          class="text-[10px] font-bold tracking-wider sm:text-xs"
          :class="completed >= s.stage ? 'text-marigold-700' : 'text-ink-faint'"
        >{{ s.label }}</p>

        <p
          class="mt-0.5 font-black leading-none"
          :class="[compact ? 'text-lg' : 'text-xl sm:text-3xl', completed >= s.stage ? 'text-ink' : 'text-ink-faint']"
        >
          <span class="text-[11px] align-top sm:text-sm">$</span>{{ s.value }}
        </p>

        <p
          class="mt-1 flex items-center justify-center gap-1 text-[10px] leading-tight sm:text-xs"
          :class="completed >= s.stage ? 'text-marigold-700' : 'text-ink-faint'"
        >
          <UIcon v-if="completed >= s.stage" name="i-lucide-circle-check" class="size-3.5 shrink-0" />
          {{ completed >= s.stage ? '已入袋' : '一紅 + 一綠' }}
        </p>
      </li>
    </ol>

    <!-- 紅綠打卡計數 -->
    <div v-if="!compact" class="mt-3 flex items-center gap-2 sm:gap-3">
      <div class="flex-1 flex items-center gap-2 rounded-2xl bg-vermilion-50 px-3 py-2 sm:py-2.5">
        <span class="size-2.5 rounded-full bg-vermilion-500 shrink-0" />
        <span class="text-xs font-bold text-vermilion-700 sm:text-sm">紅點</span>
        <span class="ml-auto text-sm font-black text-vermilion-700 sm:text-base">
          {{ checkedRed.length }}<span class="text-ink-faint font-bold">/3</span>
        </span>
      </div>
      <div class="flex-1 flex items-center gap-2 rounded-2xl bg-moss-50 px-3 py-2 sm:py-2.5">
        <span class="size-2.5 rounded-full bg-moss-500 shrink-0" />
        <span class="text-xs font-bold text-moss-700 sm:text-sm">綠點</span>
        <span class="ml-auto text-sm font-black text-moss-700 sm:text-base">
          {{ checkedGreen.length }}<span class="text-ink-faint font-bold">/3</span>
        </span>
      </div>
    </div>
  </div>
</template>
