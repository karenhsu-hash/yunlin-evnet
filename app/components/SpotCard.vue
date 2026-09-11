<script setup lang="ts">
import type { Spot } from '~/composables/useCampaign'

defineProps<{ spot: Spot }>()

const { isCheckedIn } = useCampaign()
</script>

<template>
  <NuxtLink
    :to="`/checkin?spot=${spot.id}`"
    class="card group flex gap-3 overflow-hidden p-3 items-center transition-shadow hover:shadow-pop sm:gap-4"
    :class="isCheckedIn(spot.id) ? 'opacity-70' : ''"
  >
    <div class="relative shrink-0 size-20 overflow-hidden rounded-2xl sm:size-24">
      <img
        :src="spot.photo"
        :alt="spot.name"
        loading="lazy"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <!-- 這個任務值幾點：旅客挑下一站時最想知道的數字，直接壓在照片上 -->
      <span class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-marigold-500/95 py-1 text-[11px] font-black text-ink">
        <UIcon name="i-lucide-coins" class="size-3 shrink-0" />+{{ spot.points }} 點
      </span>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <UIcon :name="spot.icon" class="size-3.5 shrink-0 text-ink-faint" />
        <span class="text-[11px] text-ink-faint shrink-0">{{ spot.town }}</span>
      </div>

      <h3 class="mt-1 font-bold truncate sm:text-lg">{{ spot.name }}</h3>
      <p class="text-xs text-ink-soft truncate sm:text-sm">{{ spot.desc }}</p>

      <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-faint">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-map-pin" class="size-3.5" />{{ spot.distanceKm }} km
        </span>
        <span class="flex items-center gap-1">
          <UIcon :name="hasQr(spot) ? 'i-lucide-scan-line' : 'i-lucide-map-pin-check'" class="size-3.5" />
          {{ hasQr(spot) ? '掃碼或定位蓋章' : '定位蓋章' }}
        </span>
      </div>
    </div>

    <div class="shrink-0 self-center pr-1">
      <span v-if="isCheckedIn(spot.id)" class="chip bg-marigold-100 text-marigold-700">
        <UIcon name="i-lucide-check" class="size-3.5" />已蓋章
      </span>
      <UIcon
        v-else
        name="i-lucide-chevron-right"
        class="size-5 text-ink-faint transition-transform group-hover:translate-x-0.5"
      />
    </div>
  </NuxtLink>
</template>
