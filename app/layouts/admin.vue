<script setup lang="ts">
const route = useRoute()
const { role } = useAdmin()

const navs = [
  { to: '/admin', label: '儀表板', icon: 'i-lucide-layout-dashboard' },
  { to: '/admin/data', label: '資料維護', icon: 'i-lucide-database' },
  { to: '/admin/reports', label: '報表請款', icon: 'i-lucide-receipt-text' },
  { to: '/admin/lottery', label: '抽獎名單', icon: 'i-lucide-dices' }
]

const isActive = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))
const mobileOpen = ref(false)
watch(() => route.path, () => (mobileOpen.value = false))
</script>

<template>
  <div class="min-h-screen flex flex-col bg-paper-soft">
    <!-- 後台頁首 -->
    <header class="sticky top-0 z-50 bg-ink text-white">
      <div class="container-page">
        <div class="flex h-16 items-center gap-3">
          <NuxtLink to="/admin" class="flex items-center gap-2.5 min-w-0">
            <span class="grid place-items-center size-9 rounded-xl bg-white/15 shrink-0">
              <UIcon name="i-lucide-layout-dashboard" class="size-5" />
            </span>
            <span class="leading-tight min-w-0">
              <span class="block text-[10px] text-white/60 truncate">
                {{ CAMPAIGN.county }} ‧ {{ CAMPAIGN.title }}
              </span>
              <span class="block text-sm font-black">後台管理系統</span>
            </span>
          </NuxtLink>

          <!-- 桌機導覽 -->
          <nav class="ml-6 hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="n in navs"
              :key="n.to"
              :to="n.to"
              class="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-colors"
              :class="isActive(n.to) ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'"
            >
              <UIcon :name="n.icon" class="size-4" />
              {{ n.label }}
            </NuxtLink>
          </nav>

          <div class="ml-auto flex items-center gap-2">
            <!-- 權限分層：主辦唯讀 vs 本公司管理 -->
            <div class="hidden sm:flex rounded-full bg-white/10 p-0.5">
              <button
                v-for="r in ([
                  { key: 'operator', label: '管理' },
                  { key: 'organizer', label: '主辦唯讀' }
                ] as const)"
                :key="r.key"
                class="rounded-full px-3 py-2 text-xs font-bold transition-colors"
                :class="role === r.key ? 'bg-white text-ink' : 'text-white/70'"
                @click="role = r.key"
              >{{ r.label }}</button>
            </div>

            <UButton
              to="/"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-arrow-left"
              class="hidden lg:inline-flex py-2 text-white/70 hover:text-white font-bold"
            >回旅客端</UButton>

            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'"
              class="md:hidden text-white"
              aria-label="開啟選單"
              @click="mobileOpen = !mobileOpen"
            />
          </div>
        </div>
      </div>

      <!-- 行動裝置導覽 -->
      <div v-if="mobileOpen" class="md:hidden border-t border-white/10 bg-ink">
        <nav class="container-page flex flex-col gap-1 py-3">
          <NuxtLink
            v-for="n in navs"
            :key="n.to"
            :to="n.to"
            class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold"
            :class="isActive(n.to) ? 'bg-white/15 text-white' : 'text-white/60'"
          >
            <UIcon :name="n.icon" class="size-5" />
            {{ n.label }}
          </NuxtLink>

          <div class="my-2 h-px bg-white/10" />

          <div class="flex gap-1.5 px-3">
            <button
              v-for="r in ([
                { key: 'operator', label: '管理' },
                { key: 'organizer', label: '主辦唯讀' }
              ] as const)"
              :key="r.key"
              class="flex-1 rounded-full px-3 py-2 text-xs font-bold transition-colors"
              :class="role === r.key ? 'bg-white text-ink' : 'bg-white/10 text-white/70'"
              @click="role = r.key"
            >{{ r.label }}</button>
          </div>

          <NuxtLink to="/" class="mt-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white/60">
            <UIcon name="i-lucide-arrow-left" class="size-5" />回旅客端
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- 唯讀提示 -->
    <div v-if="role === 'organizer'" class="bg-marigold-100">
      <p class="container-page flex items-center gap-2 py-2.5 text-xs font-bold text-marigold-700">
        <UIcon name="i-lucide-lock" class="size-4 shrink-0" />
        主辦唯讀模式：可檢視與匯出，不可編輯資料或調整活動參數。
      </p>
    </div>

    <main class="container-page flex-1 py-6 lg:py-8">
      <slot />
    </main>

    <footer class="mt-8 border-t border-paper-deep bg-paper">
      <div class="container-page flex flex-wrap items-center justify-between gap-3 py-4">
        <NuxtLink to="/" class="py-2 text-xs font-bold text-sky-600">← 回旅客端</NuxtLink>
      </div>
    </footer>
  </div>
</template>
