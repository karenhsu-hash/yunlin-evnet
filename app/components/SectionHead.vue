<script setup lang="ts">
defineProps<{
  title: string
  sub?: string
  to?: string
  more?: string
}>()
</script>

<template>
  <div class="flex items-end justify-between gap-3">
    <div class="min-w-0">
      <h2 class="text-lg font-black text-ink leading-tight sm:text-2xl">{{ title }}</h2>
      <p v-if="sub" class="mt-0.5 text-xs text-ink-soft sm:text-sm">{{ sub }}</p>
    </div>
    <NuxtLink
      v-if="to"
      :to="to"
      class="group -my-2 shrink-0 flex items-center gap-0.5 py-2 text-xs font-bold text-sky-600 sm:text-sm"
    >
      {{ more || '看全部' }}
      <UIcon name="i-lucide-chevron-right" class="size-4 transition-transform group-hover:translate-x-0.5" />
    </NuxtLink>
  </div>
</template>
