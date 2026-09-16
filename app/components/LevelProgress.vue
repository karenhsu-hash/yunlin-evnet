<script setup lang="ts">
/**
 * 會員等級階梯：三格等級門檻 ＋ 往下一級的點數進度條 ＋ 可用點數。
 * 等級看累積獲得的點數（200／500／1,000），兌換掉的不扣，所以只升不降。
 */
withDefaults(
  defineProps<{
    /** 精簡版：只顯示三格階梯 */
    compact?: boolean
  }>(),
  { compact: false }
)

const { level, earnedPoints, points, nextLevel, levelProgress, draws } = useCampaign()
</script>

<template>
  <div>
    <!-- 三個等級門檻 -->
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
        <img
          v-if="!compact"
          :src="l.art"
          alt=""
          loading="lazy"
          class="mx-auto mb-1 h-9 w-auto object-contain transition sm:h-12"
          :class="level >= l.level ? '' : 'opacity-30 grayscale'"
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
          {{ toComma(l.threshold) }} 點
        </p>
      </li>
    </ol>

    <template v-if="!compact">
      <!-- 往下一級的點數進度 -->
      <div class="mt-4">
        <div class="flex items-baseline justify-between gap-2 text-xs">
          <span class="text-ink-soft">
            累積 <b class="text-base font-black text-ink">{{ toComma(earnedPoints) }}</b>
            <template v-if="nextLevel"> / {{ toComma(nextLevel.threshold) }} 點</template>
            <template v-else> 點</template>
          </span>
          <span v-if="nextLevel" class="text-ink-soft">
            再 <b class="text-vermilion-600">{{ toComma(nextLevel.remaining) }} 點</b>升級為<b class="text-ink">{{ nextLevel.name }}</b>
          </span>
          <span v-else class="flex items-center gap-1 font-bold text-marigold-700">
            <UIcon name="i-lucide-party-popper" class="size-4" />已是最高等級
          </span>
        </div>
        <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-paper-deep">
          <div
            class="h-full rounded-full bg-marigold-500 transition-[width] duration-500"
            :style="{ width: `${Math.round(levelProgress * 100)}%` }"
          />
        </div>
        <p class="mt-1.5 text-[11px] text-ink-faint">
          點數持續累積不歸零；目前已取得 {{ draws.total }} 次抽獎資格，再 {{ toComma(draws.toNext) }} 點可再得一次。
        </p>
      </div>

      <div class="mt-3 inline-flex items-center gap-2 rounded-2xl bg-marigold-50 px-3.5 py-2 sm:py-2.5">
        <UIcon name="i-lucide-coins" class="size-4 shrink-0 text-marigold-700" />
        <span class="text-xs font-bold text-marigold-700 sm:text-sm">可用點數</span>
        <span class="text-sm font-black text-ink sm:text-base">{{ toComma(points) }}</span>
      </div>
    </template>
  </div>
</template>
