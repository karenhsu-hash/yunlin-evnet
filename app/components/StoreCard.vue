<script setup lang="ts">
import type { PublicStore } from '~/composables/useStores'

defineProps<{ store: PublicStore }>()

const { categoryLabel, categoryIcon } = useStores()
</script>

<template>
  <article class="card group overflow-hidden transition-shadow hover:shadow-pop">
    <div class="relative aspect-16/10 overflow-hidden">
      <img
        :src="store.photo"
        :alt="store.name"
        loading="lazy"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <span class="absolute top-2.5 left-2.5 chip bg-white/90 text-ink backdrop-blur">
        <UIcon :name="categoryIcon(store.category)" class="size-3.5" />
        {{ categoryLabel(store.category) }}
      </span>
      <span class="absolute top-2.5 right-2.5 chip bg-marigold-500 text-ink">可折抵</span>
    </div>

    <div class="p-4">
      <div class="flex items-center gap-1.5 text-[11px] text-ink-faint">
        <UIcon name="i-lucide-map-pin" class="size-3.5" />{{ store.town }}
      </div>
      <h3 class="mt-1 font-bold truncate">{{ store.name }}</h3>
      <p class="mt-1 text-xs leading-relaxed text-ink-soft line-clamp-2">{{ store.desc }}</p>

      <div class="mt-3 flex items-center gap-1.5 rounded-xl bg-paper-soft px-2.5 py-2">
        <UIcon :name="store.icon" class="size-4 shrink-0 text-vermilion-600" />
        <span class="truncate text-[11px] font-bold text-ink-soft">招牌 ‧ {{ store.highlight }}</span>
      </div>

      <p v-if="store.nearSpot" class="mt-2 flex items-center gap-1 text-[11px] text-ink-faint">
        <UIcon name="i-lucide-route" class="size-3.5 shrink-0" />
        鄰近 {{ store.nearSpot }}
      </p>
    </div>
  </article>
</template>
