<script setup lang="ts">
const { isLoggedIn, checkedIn } = useCampaign()

const nearbySpots = computed(() =>
  [...ALL_SPOTS].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 8)
)

/**
 * 遊樂路線選擇。預設落在首推那條（0828 更新內容的親子二日遊），
 * 找不到就退回第一條，之後改動 ROUTES 的順序也不會壞掉。
 */
const activeRouteId = ref((ROUTES.find((r) => r.featured) ?? ROUTES[0]!).id)
const currentRoute = computed(() => ROUTES.find((r) => r.id === activeRouteId.value)!)
const spotOf = (id: string) => ALL_SPOTS.find((s) => s.id === id)

/** 形象展示：本案的三個主張 */
const brandPoints = [
  {
    art: '/images/art/temple.webp',
    title: '走進雲林的日常',
    desc: `從北港廟口的香火、西螺老街的醬油香，到古坑山上的咖啡園與濁水溪出海口的落日 —— ${ALL_SPOTS.length} 個亮點串成一條可以慢慢走的路線。`
  },
  {
    art: '/images/art/veggie-basket.webp',
    title: '把消費留在在地',
    desc: '券只能在雲林的店家使用。你吃的那碗麵、帶走的那罐醬油，都留在這片土地上。'
  },
  {
    art: '/images/art/car-family.webp',
    title: '走得越深，拿得越多',
    desc: '完成越多任務、累積越多點數，就能逐步升級並解鎖更多優惠。兌換優惠不影響已取得的會員等級。'
  }
]

/** 怎麼玩：自動輪播的三個步驟 */
const steps = [
  {
    key: 'join',
    art: LEVELS[0]!.art,
    title: `註冊領 ${CAMPAIGN.signupBonus} 點`,
    desc: '完成會員註冊就開通觀光護照，直接成為等級一。'
  },
  {
    key: 'stamp',
    art: LEVELS[1]!.art,
    title: '完成任務得點數',
    desc: '打卡、食農體驗、iRent 租車都算任務，依難度可得 100～500 點。'
  },
  {
    key: 'redeem',
    art: '/images/art/seafood-plate.webp',
    title: '升級兌換抽獎',
    desc: '點數持續累積：達門檻自動升級、換各等級專屬優惠，每 1,000 點還有一次抽獎資格。'
  }
]

const active = ref(0)
const paused = ref(false)
const reduceMotion = ref(false)
const STEP_MS = 4200
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion.value) return
  timer = setInterval(() => {
    if (!paused.value) active.value = (active.value + 1) % steps.length
  }, STEP_MS)
})
onUnmounted(() => timer && clearInterval(timer))

function goStep(i: number) {
  active.value = i
}

/** 主視覺的行動點：捲動到下方內容而非直接換頁 */
function scrollToContent() {
  document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const faqItems = [
  { label: '優惠券怎麼用？', content: '到指定店家出示優惠券即可兌換。' },
  {
    label: '點數怎麼拿？',
    content: `註冊即得 ${CAMPAIGN.signupBonus} 點；之後共有 ${TASKS.length} 個任務（站點打卡、食農教育、iRent 租車），依難度可得 100～500 點。累積達 ${LEVELS.map((l) => toComma(l.threshold)).join('／')} 點分別升級為等級一、二、三。點數持續累積不歸零。`
  },
  {
    label: '點數怎麼用？',
    content: '到「我的護照」的兌換專區換優惠券。兌換會扣除點數，但不影響已取得的會員等級。點數不得折換現金、找零或轉讓。'
  },
  { label: '券的有效期多久？', content: `兌換後 ${CAMPAIGN.couponValidDays} 天內，且不超過活動結束日 ${CAMPAIGN.endDate}。` },
  { label: '哪裡可以使用優惠券？', content: `全縣約 ${CAMPAIGN.storeCount} 家合作店家，小吃、伴手禮、餐廳、咖啡、體驗與住宿都有。` }
]
</script>

<template>
  <div>
    <!-- ══ 主視覺：全寬滿版一屏 ═══════════════════ -->
    <section class="relative w-full bg-paper kv-section">
      <div class="relative size-full">
        <img
          src="/images/kv-main.jpg"
          alt="雲林縣 台灣觀光100亮點 捲動國旅 主視覺"
          class="kv-hero"
        >

        <!--
          桌機：行動點置於主視覺「下半部的正中間」——
          以下半部（h-1/2、貼齊底部）為容器再置中，約落在整體高度 75% 處，
          既不壓到上方的手寫標題，也不會貼到底邊。
          手機主視覺較矮，按鈕改放下方標題區。
        -->
        <div class="absolute inset-x-0 bottom-0 hidden h-1/2 items-center justify-center gap-3 lg:flex">
          <UButton
            size="xl"
            color="primary"
            :icon="isLoggedIn ? 'i-lucide-qr-code' : 'i-lucide-user-plus'"
            class="rounded-full font-bold shadow-pop"
            @click="scrollToContent"
          >{{ isLoggedIn ? '馬上集章' : '馬上參加' }}</UButton>
          <UButton
            size="xl"
            color="neutral"
            variant="solid"
            icon="i-lucide-scroll-text"
            class="rounded-full bg-white font-bold text-ink shadow-pop hover:bg-white"
            @click="scrollToContent"
          >了解活動辦法</UButton>
        </div>
      </div>
    </section>

    <!-- ══ 標題區塊：置中 ═══════════════════════ -->
    <section class="container-page py-10 text-center sm:py-14">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <span class="chip bg-paper-soft text-ink-soft">
          <UIcon name="i-lucide-calendar-days" class="size-3.5" />
          {{ CAMPAIGN.startDate }} – {{ CAMPAIGN.endDate }}
        </span>
        <span class="chip bg-indigoink-500 text-white">與{{ CAMPAIGN.partner }}一起出發</span>
      </div>

      <h1 class="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
        {{ CAMPAIGN.county }}{{ CAMPAIGN.title }}
      </h1>

      <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
        走訪雲林各地亮點，完成觀光護照任務，<b class="text-vermilion-600">沿途集章解鎖優惠</b>，在合作店家直接兌換。
      </p>

      <!-- 手機版行動點 -->
      <div class="mt-7 flex flex-wrap justify-center gap-3 lg:hidden">
        <UButton
          size="xl"
          color="primary"
          :icon="isLoggedIn ? 'i-lucide-qr-code' : 'i-lucide-user-plus'"
          class="rounded-full font-bold"
          @click="scrollToContent"
        >{{ isLoggedIn ? '馬上集章' : '馬上參加' }}</UButton>
        <UButton
          size="xl"
          color="neutral"
          variant="outline"
          icon="i-lucide-scroll-text"
          class="rounded-full font-bold"
          @click="scrollToContent"
        >了解活動辦法</UButton>
      </div>
    </section>

    <!-- ══ 加入會員 CTA：不隨登入狀態切換內容 ═══ -->
    <section id="intro" class="container-page scroll-mt-20 pt-6 sm:pt-8">
      <div class="card overflow-hidden">
        <div class="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
          <div>
            <span class="chip bg-vermilion-100 text-vermilion-700">
              <UIcon name="i-lucide-book-marked" class="size-3.5" />觀光護照
            </span>
            <h2 class="mt-3 text-xl font-black sm:text-2xl">加入會員，開啟你的觀光護照</h2>
            <p class="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              註冊成為會員，即可獲得 {{ CAMPAIGN.signupBonus }} 點並開啟觀光護照。完成越多任務、累積越多點數，就能逐步升級並解鎖更多優惠。
            </p>

            <!-- 護照的三個等級門檻：一眼看懂點數怎麼長上去，完整規則在下方「觀光護照玩法」 -->
            <ol class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
              <template v-for="(l, i) in LEVELS" :key="l.level">
                <UIcon v-if="i > 0" name="i-lucide-chevron-right" class="size-3.5 shrink-0 text-ink-faint" />
                <li class="flex items-center gap-1.5 rounded-full bg-paper-soft px-3 py-1.5 text-xs font-bold text-ink-soft">
                  {{ l.name }}
                  <span class="font-black text-marigold-700">{{ toComma(l.threshold) }} 點</span>
                </li>
              </template>
            </ol>
          </div>

          <div class="flex flex-wrap gap-3 lg:flex-col">
            <UButton to="/register" color="primary" size="xl" icon="i-lucide-user-plus" class="rounded-full font-bold">
              免費註冊，領 {{ CAMPAIGN.signupBonus }} 點
            </UButton>
            <UButton to="/login" color="neutral" variant="outline" size="xl" icon="i-lucide-log-in" class="rounded-full font-bold">
              我已有帳號
            </UButton>
          </div>
        </div>
      </div>
    </section>


    <!-- ══ 關於這場活動 ═══════════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead title="關於這場活動" sub="為什麼要走一趟雲林" />

      <dl class="mt-5 grid grid-cols-3 divide-x divide-paper-deep rounded-card bg-white py-5 shadow-card">
        <div v-for="s in [
          { k: '活動亮點', v: `${ALL_SPOTS.length} 處` },
          { k: '合作店家', v: `${CAMPAIGN.storeCount} 家` },
          { k: '任務總數', v: `${TASKS.length} 個` }
        ]" :key="s.k" class="px-3 text-center">
          <dt class="text-[11px] font-bold text-ink-faint">{{ s.k }}</dt>
          <!-- 手機一欄只有 110px 左右，「1,000 點」在 text-2xl 會斷成兩行，縮一級並禁止換行 -->
          <dd class="mt-1 whitespace-nowrap text-xl font-black text-ink sm:text-3xl">{{ s.v }}</dd>
        </div>
      </dl>

      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <article v-for="b in brandPoints" :key="b.title" class="card p-5 sm:p-6">
          <img :src="b.art" alt="" loading="lazy" class="h-16 w-auto object-contain sm:h-20">
          <h3 class="mt-3.5 text-lg font-black">{{ b.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ b.desc }}</p>
        </article>
      </div>
    </section>

    <!-- ══ 怎麼玩：一到三，由左至右 ═══════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead title="怎麼玩" sub="註冊領點，打卡升級，點數兌換" />

      <div
        class="relative mt-8"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <!-- 由左至右推進的連接線（桌機） -->
        <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-12 hidden px-[16.6%] md:block">
          <div class="h-1 rounded-full bg-paper-deep">
            <div
              class="h-full rounded-full bg-vermilion-500 transition-[width] duration-700 ease-out"
              :style="{ width: `${(active / (steps.length - 1)) * 100}%` }"
            />
          </div>
        </div>

        <ol class="relative grid gap-8 md:grid-cols-3 md:gap-6">
          <li v-for="(s, i) in steps" :key="s.key">
            <button class="flex w-full flex-col items-center text-center" @click="goStep(i)">
              <span
                class="relative grid size-24 place-items-center rounded-full border-4 bg-white transition-colors duration-500"
                :class="active >= i ? 'border-vermilion-500' : 'border-paper-deep'"
              >
                <img
                  :src="s.art"
                  alt=""
                  loading="lazy"
                  class="size-16 object-contain transition duration-500"
                  :class="active >= i ? '' : 'opacity-40 grayscale'"
                >
                <span
                  class="absolute -bottom-2 grid size-6 place-items-center rounded-full text-[11px] font-black transition-colors duration-500"
                  :class="active >= i ? 'bg-vermilion-500 text-white' : 'bg-paper-deep text-ink-faint'"
                >{{ i + 1 }}</span>
              </span>

              <span
                class="mt-5 text-lg font-black transition-colors duration-500"
                :class="active === i ? 'text-ink' : 'text-ink-soft'"
              >{{ s.title }}</span>
              <span class="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-soft">{{ s.desc }}</span>
            </button>
          </li>
        </ol>
      </div>
    </section>

    <!-- ══ 觀光護照玩法：客戶 2026-09 修訂版的文案與等級表 ═══ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead title="觀光護照玩法" />
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
        依序完成觀光護照任務，即可獲得點數。每個任務依難度不同，可獲得 100～500 點。累積點數達到指定門檻後，會員等級會自動提升，並可兌換該等級對應的專屬優惠。
      </p>

      <!-- 客戶的表只有兩欄，手機也放得下，不必另做卡片版 -->
      <div class="mt-5 overflow-hidden rounded-card bg-white shadow-card">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b-2 border-paper-deep text-xs text-ink-faint">
              <th class="px-4 py-3 font-bold sm:px-6">會員等級</th>
              <th class="px-4 py-3 text-right font-bold sm:px-6">累積點數</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-paper-deep">
            <tr v-for="l in LEVELS" :key="l.level">
              <td class="px-4 py-3 sm:px-6">
                <span class="flex items-center gap-3">
                  <img :src="l.art" alt="" loading="lazy" class="h-10 w-14 shrink-0 object-contain">
                  <span>
                    <span class="block text-xs font-bold text-ink-faint">等級{{ ['一', '二', '三'][l.level - 1] }}</span>
                    <b class="whitespace-nowrap">{{ l.name }}</b>
                  </span>
                </span>
              </td>
              <td class="px-4 py-3 text-right text-base font-black tabular-nums text-marigold-700 sm:px-6">
                {{ toComma(l.threshold) }} 點
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="mt-4 text-sm leading-relaxed text-ink-soft">
        完成越多任務、累積越多點數，就能逐步升級並解鎖更多優惠。兌換優惠不影響已取得的會員等級。
      </p>
      <p class="mt-2 flex items-start gap-1.5 text-xs text-ink-faint">
        <UIcon name="i-lucide-info" class="mt-px size-3.5 shrink-0" />
        註冊即送 {{ CAMPAIGN.signupBonus }} 點（直接達等級一）；點數持續累積不歸零，每 {{ toComma(CAMPAIGN.lotteryUnit) }} 點另可取得一次抽獎資格。
      </p>
    </section>

    <!-- ══ 任務牆入口：三類任務各一張卡 ═══════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead
        title="任務牆"
        :sub="`${TASKS.length} 個任務，完成就有點數`"
        to="/tasks"
        more="看全部任務"
      />

      <ul class="mt-5 grid gap-4 md:grid-cols-3">
        <li v-for="k in TASK_KINDS" :key="k.key">
          <NuxtLink
            to="/tasks"
            class="card group flex h-full flex-col p-5 transition-shadow hover:shadow-pop sm:p-6"
          >
            <div class="flex items-center gap-3">
              <span class="grid place-items-center size-11 shrink-0 rounded-2xl bg-vermilion-50 text-vermilion-600">
                <UIcon :name="k.icon" class="size-6" />
              </span>
              <div class="min-w-0">
                <p class="font-black">{{ k.label }}</p>
                <p class="text-[11px] text-ink-faint">{{ tasksOfKind(k.key).length }} 個任務</p>
              </div>
            </div>
            <p class="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{{ k.desc }}</p>
            <p class="mt-3 flex items-center gap-1 text-xs font-bold text-sky-600">
              去看看
              <UIcon name="i-lucide-chevron-right" class="size-4 transition-transform group-hover:translate-x-0.5" />
            </p>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- ══ 推薦路線：文字頁籤 ＋ A→B→C 動線 ═══════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead
        title="推薦路線"
        :sub="`${ROUTES.length} 條路線，把打卡任務串成一趟行程`"
        to="/events"
        more="看全部路線"
      />

      <!-- 路線頁籤。純文字，手機自動換行成兩列 -->
      <div class="mt-5 flex flex-wrap gap-2 sm:gap-2.5" role="tablist" aria-label="遊樂路線">
        <button
          v-for="r in ROUTES"
          :key="r.id"
          role="tab"
          :aria-selected="activeRouteId === r.id"
          class="flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors"
          :class="activeRouteId === r.id
            ? 'border-ink bg-ink text-white'
            : 'border-paper-deep bg-white text-ink-soft hover:border-ink/40'"
          @click="activeRouteId = r.id"
        >
          <UIcon :name="r.icon" class="size-4 shrink-0" />
          {{ r.name }}
          <span
            v-if="r.featured"
            class="rounded-full px-1.5 py-px text-[10px] font-black"
            :class="activeRouteId === r.id ? 'bg-white/20 text-white' : 'bg-marigold-100 text-marigold-700'"
          >首推</span>
        </button>
      </div>

      <!-- 選中路線的行程動線 -->
      <div :key="currentRoute.id" class="card mt-4 p-5 animate-pop-in sm:p-6">
        <div class="flex items-start gap-4">
          <img :src="currentRoute.art" alt="" class="h-16 w-20 shrink-0 object-contain sm:h-20 sm:w-28">
          <div class="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-lg font-black sm:text-xl">{{ currentRoute.name }}</h3>
              <p class="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">{{ currentRoute.tagline }}</p>
            </div>
            <span class="chip shrink-0 bg-marigold-100 text-marigold-700">
              <UIcon name="i-lucide-award" class="size-3.5" />
              完成解鎖 ‧ {{ currentRoute.achievement }}
            </span>
          </div>
        </div>

        <div class="mt-5 space-y-4">
          <div v-for="day in currentRoute.days" :key="day.label">
            <p class="text-[11px] font-black tracking-wider text-ink-faint">{{ day.label }}</p>
            <ol class="mt-2 flex flex-wrap items-center gap-x-1 gap-y-2">
              <template v-for="(id, i) in day.spotIds" :key="id">
                <UIcon v-if="i > 0" name="i-lucide-chevron-right" class="size-3.5 shrink-0 text-ink-faint" />
                <li>
                  <NuxtLink
                    :to="`/checkin?spot=${id}`"
                    class="flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-xs font-bold transition-colors"
                    :class="checkedIn.includes(id)
                      ? 'border-moss-500 bg-moss-50 text-moss-700'
                      : 'border-paper-deep bg-white text-ink hover:border-ink/40'"
                  >
                    <UIcon
                      :name="checkedIn.includes(id) ? 'i-lucide-check' : spotOf(id)!.icon"
                      class="size-3.5 shrink-0"
                    />
                    {{ spotOf(id)?.name }}
                    <span class="text-[10px] font-black text-marigold-700">+{{ spotOf(id)?.points }}</span>
                  </NuxtLink>
                </li>
              </template>
            </ol>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-paper-deep pt-4">
          <span class="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
            <UIcon name="i-lucide-coins" class="size-3.5 text-marigold-600" />
            站名旁為該站任務點數
          </span>
          <NuxtLink
            to="/events"
            class="group -my-2 ml-auto flex items-center gap-0.5 py-2 text-xs font-bold text-sky-600 sm:text-sm"
          >
            在地圖上看這條路線
            <UIcon name="i-lucide-chevron-right" class="size-4 transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ══ 離你最近的亮點 ═══════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead
        title="離你最近的亮點"
        to="/events"
      />
      <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="spot in nearbySpots"
          :key="spot.id"
          :to="`/checkin?spot=${spot.id}`"
          class="card group overflow-hidden transition-shadow hover:shadow-pop"
        >
          <div class="relative aspect-4/3 overflow-hidden">
            <img
              :src="spot.photo"
              :alt="spot.name"
              loading="lazy"
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />

            <span
              v-if="checkedIn.includes(spot.id)"
              class="absolute top-2.5 right-2.5 grid place-items-center size-7 rounded-full bg-white/90 text-moss-600"
            >
              <UIcon name="i-lucide-check" class="size-4" />
            </span>

            <div class="absolute inset-x-0 bottom-0 p-3">
              <p class="font-bold text-white drop-shadow truncate">{{ spot.name }}</p>
              <p class="text-[11px] text-white/85">{{ spot.town }} ‧ {{ spot.distanceKm }} km</p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 px-3.5 py-2.5">
            <p class="min-w-0 truncate text-xs text-ink-soft">{{ spot.desc }}</p>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- ══ 帶著券去吃喝（導往合作店家）═══════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <NuxtLink
        to="/stores"
        class="card group flex flex-col items-start gap-4 p-6 transition-shadow hover:shadow-pop sm:flex-row sm:items-center sm:p-8"
      >
        <!-- 三道在地吃食疊在一起，比單一店舖圖示更像「去吃喝」 -->
        <span aria-hidden="true" class="flex shrink-0 items-end -space-x-4">
          <img src="/images/art/seafood-plate.webp" alt="" loading="lazy" class="h-14 w-auto sm:h-16">
          <img src="/images/art/coffee.webp" alt="" loading="lazy" class="relative h-12 w-auto sm:h-14">
          <img src="/images/art/veggie-basket.webp" alt="" loading="lazy" class="h-12 w-auto sm:h-14">
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl font-black">帶著券去吃喝</h2>
          <p class="mt-1.5 text-sm leading-relaxed text-ink-soft">
            全縣約 {{ CAMPAIGN.storeCount }} 家合作店家 —— 小吃、伴手禮、餐廳、咖啡、體驗與住宿，結帳時出示優惠券當場折抵。
          </p>
        </div>
        <span class="flex shrink-0 items-center gap-1 text-sm font-bold text-sky-600">
          看合作店家
          <UIcon name="i-lucide-chevron-right" class="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </NuxtLink>
    </section>

    <!-- ══ 常見問題 ═════════════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead title="常見問題" />
      <div class="mt-5 card p-2 sm:p-4">
        <UAccordion :items="faqItems" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/**
 * 主視覺全寬滿版：高度為一整屏（扣掉 4rem 頁首，剛好填滿可視範圍）。
 * 滿版必然要裁切，故用 object-cover 由中心裁切；
 * 手機螢幕較窄，改用較保守的高度避免插畫被裁得只剩天空。
 */
.kv-section {
  height: 62svh;
  min-height: 380px;
}

@media (min-width: 1024px) {
  .kv-section {
    height: calc(100svh - 4rem);
  }
}

.kv-hero {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 靠上對齊：滿版裁切時優先保留上方的標題與天空，不切到字 */
  object-position: center top;
}

</style>
