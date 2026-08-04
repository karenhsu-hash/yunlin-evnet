<script setup lang="ts">
const route = useRoute()
const { isLoggedIn, walletAmount, logout } = useCampaign()

/** 網頁版主導覽：桌機橫向排開，行動裝置收進 UHeader 內建選單 */
const links = [
  { label: '首頁', to: '/', icon: 'i-lucide-house' },
  { label: '活動景點', to: '/events', icon: 'i-lucide-map' },
  { label: '合作店家', to: '/stores', icon: 'i-lucide-store' },
  { label: '活動辦法', to: '/rules', icon: 'i-lucide-scroll-text' },
  { label: '掃碼打卡', to: '/checkin', icon: 'i-lucide-qr-code' }
]

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

/** 端點切換：核銷與後台是店家／主辦看的，不放進旅客導覽 */
const roleItems = [
  { label: '旅客端', icon: 'i-lucide-user-round', to: '/' },
  { label: '店家核銷端', icon: 'i-lucide-store', to: '/redeem' },
  { label: '管理後台', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: '會員註冊流程', icon: 'i-lucide-clipboard-pen', to: '/register' }
]

const currentRole = computed(() =>
  route.path.startsWith('/admin') ? '管理後台' : route.path.startsWith('/redeem') ? '店家核銷端' : '旅客端'
)
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
          <!-- 登入後才露出券包餘額 -->
          <NuxtLink
            v-if="isLoggedIn"
            to="/member"
            class="hidden sm:flex items-center gap-1.5 rounded-full bg-marigold-100 px-3 py-1.5 text-xs font-bold text-marigold-700"
          >
            <UIcon name="i-lucide-ticket" class="size-3.5" />
            券包 ${{ walletAmount }}
          </NuxtLink>

          <UDropdownMenu :items="roleItems">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              trailing-icon="i-lucide-chevron-down"
              class="rounded-full font-bold text-white ring-1 ring-white/40 hover:bg-white/10"
            >
              <span class="hidden sm:inline">{{ currentRole }}</span>
              <UIcon name="i-lucide-repeat" class="sm:hidden size-4" />
            </UButton>
          </UDropdownMenu>

          <template v-if="isLoggedIn">
            <UButton
              to="/member"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-circle-user-round"
              class="hidden md:inline-flex rounded-full font-bold text-white hover:bg-white/10"
            >會員中心</UButton>
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
              class="hidden md:inline-flex rounded-full font-bold text-white hover:bg-white/10"
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
              <UIcon name="i-lucide-circle-user-round" class="size-5" />會員中心
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

          <div class="my-3 h-px bg-paper-deep" />

          <p class="px-3 pb-1 text-xs font-bold text-ink-faint">切換示範端點</p>
          <NuxtLink
            v-for="r in roleItems"
            :key="r.to"
            :to="r.to"
            class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-ink-soft"
          >
            <UIcon :name="r.icon" class="size-5" />
            {{ r.label }}
          </NuxtLink>
        </nav>
      </template>
    </UHeader>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="mt-16 border-t border-paper-deep bg-paper">
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

          <nav class="flex flex-wrap gap-x-5 gap-y-2">
            <NuxtLink
              v-for="l in links"
              :key="l.to"
              :to="l.to"
              class="text-xs font-bold text-ink-soft hover:text-vermilion-600"
            >{{ l.label }}</NuxtLink>
          </nav>
        </div>

        <p class="mt-6 border-t border-paper-deep pt-4 text-[11px] text-ink-faint">
          本站為介面示意，內容為模擬資料。
        </p>
      </div>
    </footer>
  </div>
</template>
