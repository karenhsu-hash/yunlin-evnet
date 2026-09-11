<script setup lang="ts">
/**
 * 會員等級階梯：三格等級＋可用點數＋距下一級還差什麼。
 * 取代原本的三段任務（StageProgress），版面沿用同一套三格階梯的視覺語言。
 */
withDefaults(
  defineProps<{
    /** 精簡版：只顯示三格階梯 */
    compact?: boolean
  }>(),
  { compact: false }
)

const { level, points, nextLevel } = useCampaign()
</script>

<template>
  <div>
    <!-- 三個等級 -->
    <ol class="flex items-stretch gap-1.5 sm:gap-2.5">
      <li
        v-for="l in LEVELS"
        :key="l.level"
        class="flex-1 rounded-2xl border-2 px-2 py-2.5 text-center transition-colors sm:py-3.5"
        :class="
          level >= l.level
            ? 'bg-marigold-100 border-marigold-500'
            : level + 1 === l.level
              ? 'bg-white border-dashed border-vermilion-300'
              : 'bg-paper-soft border-transparent'
        "
      >
        <p
          class="text-[10px] font-bold tracking-wider sm:text-xs"
          :class="level >= l.level ? 'text-marigold-700' : 'text-ink-faint'"
        >等級{{ ['一', '二', '三'][l.level - 1] }}</p>

        <p
          class="mt-0.5 font-black leading-tight"
          :class="[compact ? 'text-sm' : 'text-base sm:text-xl', level >= l.level ? 'text-ink' : 'text-ink-faint']"
        >{{ l.name }}</p>

        <p
          class="mt-1 flex items-center justify-center gap-1 text-[10px] leading-tight sm:text-xs"
          :class="level >= l.level ? 'text-marigold-700' : 'text-ink-faint'"
        >
          <UIcon v-if="level >= l.level" name="i-lucide-circle-check" class="size-3.5 shrink-0" />
          +{{ l.reward }} 點
        </p>
      </li>
    </ol>

    <div v-if="!compact" class="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
      <div class="flex items-center gap-2 rounded-2xl bg-marigold-50 px-3.5 py-2 sm:py-2.5">
        <UIcon name="i-lucide-coins" class="size-4 shrink-0 text-marigold-700" />
        <span class="text-xs font-bold text-marigold-700 sm:text-sm">可用點數</span>
        <span class="text-sm font-black text-ink sm:text-base">{{ toComma(points) }}</span>
      </div>

      <p v-if="nextLevel" class="flex-1 text-xs text-ink-soft sm:text-sm">
        再蓋 <b class="text-vermilion-600">{{ nextLevel.remaining }} {{ nextLevel.designatedOnly ? '個指定站' : '枚章' }}</b>，
        升級為<b class="text-ink">{{ nextLevel.name }}</b>，獲得 {{ nextLevel.reward }} 點
      </p>
      <p v-else class="flex flex-1 items-center gap-1.5 text-xs font-bold text-marigold-700 sm:text-sm">
        <UIcon name="i-lucide-party-popper" class="size-4" />
        已是最高等級，累積 {{ toComma(CAMPAIGN.quota) }} 點
      </p>
    </div>
  </div>
</template>
