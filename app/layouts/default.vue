<script setup lang="ts">
const route = useRoute()
const { isLoggedIn, logout } = useCampaign()

/** 網頁版主導覽：桌機橫向排開，行動裝置收進 UHeader 內建選單 */
const links = [
  { label: '首頁', to: '/', icon: 'i-lucide-house' },
  { label: '任務牆', to: '/tasks', icon: 'i-lucide-list-checks' },
  { label: '推薦路線', to: '/events', icon: 'i-lucide-map' },
  { label: '合作店家', to: '/stores', icon: 'i-lucide-store' },
  { label: '活動辦法', to: '/rules', icon: 'i-lucide-scroll-text' },
  { label: '護照集章', to: '/checkin', icon: 'i-lucide-stamp' }
]

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

</script>

<template>
  <div class="min-h-screen flex flex-col bg-paper-soft">
    <UHeader
      mode="slideover"
      :ui="{ root: 'bg-sky-700/95 backdrop-blur border-b border-sky-800', container: 'container-page' }"
      :toggle="{ class: 'text-white hover:bg-white/10' }"
    >
      <!--
        UHeader 已經把 title 插槽包成連結，這裡不能再放 NuxtLink，
        否則會產生巢狀 <a>（不合法 HTML），瀏覽器解析時會搬移節點而造成 hydration mismatch。
      -->
      <template #title>
        <!-- 標準字已含「雲林縣／捲動國旅」，不再另外排文字 -->
        <img
          src="/images/logo.png"
          alt="雲林縣 捲動國旅"
          class="h-10 w-auto sm:h-12"
        >
      </template>

      <!-- 桌機導覽 -->
      <nav class="hidden lg:flex items-center gap-1">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-colors"
          :class="isActive(l.to) ? 'bg-white text-sky-700' : 'text-white/75 hover:bg-white/10 hover:text-white'"
        >
          <UIcon :name="l.icon" class="size-4" />
          {{ l.label }}
        </NuxtLink>
      </nav>

      <template #right>
        <div class="flex items-center gap-2">
          <template v-if="isLoggedIn">
            <UButton
              to="/member"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-circle-user-round"
              class="hidden md:inline-flex rounded-full py-2 font-bold text-white hover:bg-white/10"
            >我的護照</UButton>
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-log-out"
              class="hidden lg:inline-flex rounded-full font-bold text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="登出"
              @click="logout"
            />
          </template>
          <template v-else>
            <UButton
              to="/login"
              color="neutral"
              variant="ghost"
              size="sm"
              class="hidden md:inline-flex rounded-full py-2 font-bold text-white hover:bg-white/10"
            >登入</UButton>
            <UButton
              to="/register"
              color="primary"
              size="sm"
              icon="i-lucide-user-plus"
              class="rounded-full font-bold"
            >註冊</UButton>
          </template>
        </div>
      </template>

      <!-- 行動裝置選單 -->
      <template #body>
        <nav class="flex flex-col gap-1">
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold transition-colors"
            :class="isActive(l.to) ? 'bg-vermilion-50 text-vermilion-600' : 'text-ink-soft'"
          >
            <UIcon :name="l.icon" class="size-5" />
            {{ l.label }}
          </NuxtLink>

          <div class="my-3 h-px bg-paper-deep" />

          <template v-if="isLoggedIn">
            <NuxtLink to="/member" class="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-ink-soft">
              <UIcon name="i-lucide-book-marked" class="size-5" />我的護照
            </NuxtLink>
            <button class="flex items-center gap-3 rounded-2xl px-3 py-3 text-left font-bold text-ink-faint" @click="logout">
              <UIcon name="i-lucide-log-out" class="size-5" />登出
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-ink-soft">
              <UIcon name="i-lucide-log-in" class="size-5" />會員登入
            </NuxtLink>
            <NuxtLink to="/register" class="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-vermilion-600">
              <UIcon name="i-lucide-user-plus" class="size-5" />免費註冊
            </NuxtLink>
          </template>

        </nav>
      </template>
    </UHeader>

    <main class="flex-1">
      <slot />
    </main>

    <!-- 頁尾上方的水彩地平線，景物站在頁尾的上框線上。純裝飾。
         刻意避開護照頁頁首那一排已用過的車子、漁船與農舍，同一頁才不會出現兩排一樣的東西。 -->
    <div aria-hidden="true" class="pointer-events-none mt-16">
      <div class="container-page flex items-end justify-center gap-4 sm:gap-8">
        <img src="/images/art/tree-cone.webp" alt="" loading="lazy" class="h-12 w-auto sm:h-16">
        <img src="/images/art/village.webp" alt="" loading="lazy" class="h-9 w-auto sm:h-12">
        <img src="/images/art/bush.webp" alt="" loading="lazy" class="hidden h-7 w-auto sm:block sm:h-9">
        <img src="/images/art/temple.webp" alt="" loading="lazy" class="h-9 w-auto sm:h-12">
        <img src="/images/art/tree-slim.webp" alt="" loading="lazy" class="h-11 w-auto sm:h-16">
        <img src="/images/art/hill-green.webp" alt="" loading="lazy" class="hidden h-9 w-auto sm:block sm:h-12">
      </div>
    </div>
    <footer class="border-t border-paper-deep bg-paper">
      <div class="container-page py-8">
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-black text-ink">{{ CAMPAIGN.county }} ‧ {{ CAMPAIGN.title }}</p>
            <p class="mt-1 text-xs text-ink-soft">
              主辦：{{ CAMPAIGN.county }}政府　｜　合作：{{ CAMPAIGN.partner }}
            </p>
            <p class="mt-0.5 text-xs text-ink-faint">
              活動期間 {{ CAMPAIGN.startDate }} – {{ CAMPAIGN.endDate }}
            </p>
          </div>

          <!-- 連結本身只有一行字高，用 py＋負 margin 把可點範圍撐到 32px，版面位置不變 -->
          <nav class="flex flex-wrap gap-x-5 gap-y-2">
            <NuxtLink
              v-for="l in links"
              :key="l.to"
              :to="l.to"
              class="-my-2 py-2 text-xs font-bold text-ink-soft hover:text-vermilion-600"
            >{{ l.label }}</NuxtLink>
          </nav>
        </div>

      </div>
    </footer>
  </div>
</template>
