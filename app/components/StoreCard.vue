<script setup lang="ts">
import type { PublicStore } from '~/composables/useStores'

defineProps<{ store: PublicStore }>()

const { categoryLabel } = useStores()
</script>

<template>
  <!--
    編輯式排版：方形照片 ＋ 照片下方的文字。
    不加卡片外框、陰影與標籤，讓照片本身成為主體。
  -->
  <article class="group">
    <div class="relative aspect-square overflow-hidden rounded-md bg-paper-deep">
      <img
        :src="store.photo"
        :alt="store.name"
        loading="lazy"
        class="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      >
    </div>

    <div class="mt-3.5">
      <p class="text-[11px] font-bold tracking-[0.15em] text-ink-faint">
        {{ store.town }}　{{ categoryLabel(store.category) }}
      </p>

      <h3 class="mt-1.5 text-base font-black leading-snug text-ink sm:text-lg">
        {{ store.name }}
      </h3>

      <p class="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
        {{ store.desc }}
      </p>

      <p class="mt-2.5 text-xs text-ink-faint">
        招牌 —— {{ store.highlight }}
      </p>
    </div>
  </article>
</template>
