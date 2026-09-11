<script setup lang="ts">
/** 未登入時顯示的替代區塊，取代原本會露出個人資料的位置 */
withDefaults(
  defineProps<{
    title?: string
    desc?: string
    /** 插圖；預設是載著行李出發的家庭房車，對應「註冊就開啟護照」 */
    art?: string
  }>(),
  {
    title: '登入後查看你的專屬進度',
    desc: '登入後就能看到你的觀光護照、點數與優惠券。',
    art: '/images/art/car-family.webp'
  }
)

const route = useRoute()
</script>

<template>
  <div class="card flex flex-col items-center p-8 text-center sm:p-10">
    <img :src="art" alt="" class="h-24 w-auto object-contain sm:h-28">
    <h3 class="mt-4 text-lg font-black sm:text-xl">{{ title }}</h3>
    <p class="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{{ desc }}</p>

    <div class="mt-5 flex flex-wrap justify-center gap-3">
      <UButton
        :to="`/login?redirect=${route.fullPath}`"
        color="primary"
        size="lg"
        icon="i-lucide-log-in"
        class="rounded-full font-bold"
      >會員登入</UButton>
      <UButton
        to="/register"
        color="neutral"
        variant="outline"
        size="lg"
        class="rounded-full font-bold"
      >免費註冊，領 {{ CAMPAIGN.signupBonus }} 點</UButton>
    </div>
  </div>
</template>
