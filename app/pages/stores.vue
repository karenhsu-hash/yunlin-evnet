<script setup lang="ts">
import type { StoreCategory } from '~/composables/useStores'

const route = useRoute()
const { category, filtered, countByCategory, stores } = useStores()

/** 支援從首頁分類連結帶入 ?c=cafe */
onMounted(() => {
  const c = route.query.c
  if (typeof c === 'string' && STORE_CATEGORIES.some((x) => x.key === c)) {
    category.value = c as StoreCategory
  }
})

const towns = computed(() => [...new Set(stores.map((s) => s.town))])
</script>

<template>
  <div>
    <!-- ── 頁首 ─────────────────────────────────── -->
    <section class="relative isolate flex items-center overflow-hidden border-b border-paper-deep min-h-[280px] sm:min-h-[340px] lg:min-h-[400px]">
      <img
        src="/images/kv-banner.jpg"
        alt="捲動國旅 活動橫幅"
        class="absolute inset-0 -z-10 size-full object-cover"
      >
      <div class="absolute inset-0 -z-10 bg-gradient-to-r from-paper via-paper/85 to-paper/30" />

      <div class="container-page py-10">
        <span class="chip bg-clay-500 text-white">
          <UIcon name="i-lucide-store" class="size-3.5" />優惠券適用
        </span>
        <h1 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">合作店家</h1>
        <p class="mt-2 max-w-xl text-sm text-ink-soft sm:text-base">
          全縣約 {{ CAMPAIGN.storeCount }} 家店，遍及 {{ towns.length }} 個鄉鎮市。
          帶著優惠券，吃一碗麵、買一罐醬油、喝一杯山上的咖啡。
        </p>
      </div>
    </section>

    <div class="container-page py-6 sm:py-8">
      <!-- ── 分類篩選 ───────────────────────────── -->
      <div class="flex flex-wrap gap-2">
        <button
          class="flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-xs font-bold transition-colors"
          :class="category === 'all' ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
          @click="category = 'all'"
        >
          全部 <span class="opacity-70">{{ stores.length }}</span>
        </button>
        <button
          v-for="c in STORE_CATEGORIES"
          :key="c.key"
          class="flex items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-xs font-bold transition-colors"
          :class="category === c.key ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
          @click="category = c.key"
        >
          <UIcon :name="c.icon" class="size-4" />
          {{ c.label }} <span class="opacity-70">{{ countByCategory(c.key) }}</span>
        </button>
      </div>

      <!-- ── 店家列表 ───────────────────────────── -->
      <div class="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StoreCard v-for="s in filtered" :key="s.id" :store="s" />
      </div>

      <p v-if="!filtered.length" class="mt-8 text-center text-sm text-ink-soft">
        此分類目前沒有店家。
      </p>

    </div>
  </div>
</template>
