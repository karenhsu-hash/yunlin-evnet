<script setup lang="ts">
const { isLoggedIn, member, completedStages, nextNeed, walletAmount, coupons, checkedIn } = useCampaign()
const { stores } = useStores()

const nearbySpots = computed(() =>
  [...ALL_SPOTS].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 8)
)

/** 首頁只露出部分店家，其餘導往合作店家頁 */
const featuredStores = computed(() => stores.slice(0, 6))

const howItWorks = [
  {
    icon: 'i-lucide-qr-code',
    title: '走到景點',
    desc: '在現場掃一下 QR code，就完成到訪紀錄。'
  },
  {
    icon: 'i-lucide-circle-dot',
    title: '湊一紅一綠',
    desc: '紅點吃喝買、綠點拍美照，兩個湊成一組。'
  },
  {
    icon: 'i-lucide-ticket',
    title: '折價券入袋',
    desc: '完成當下立刻發券，直接進你的券包。'
  }
]

/** 形象展示：本案的三個主張 */
const brandPoints = [
  {
    icon: 'i-lucide-mountain-snow',
    title: '走進雲林的日常',
    desc: '從北港廟口的香火、西螺老街的醬油香，到古坑山上的咖啡園與濁水溪出海口的落日 —— 20 個亮點串成一條可以慢慢走的路線。'
  },
  {
    icon: 'i-lucide-hand-coins',
    title: '把消費留在在地',
    desc: '券只能在雲林的店家使用。你吃的那碗麵、帶走的那罐醬油，都留在這片土地上。'
  },
  {
    icon: 'i-lucide-users-round',
    title: '玩得越深，拿得越多',
    desc: '三段任務最高帶走 1,000 元，完成的段數越多，每週抽獎的次數也越多。'
  }
]

const faqItems = [
  { label: '折價券可以找零嗎？', content: '不找零。消費金額若低於券面額，差額不退還。' },
  { label: '每人最多可以領多少？', content: `三段任務合計 ${CAMPAIGN.quota} 元，這是每人上限。` },
  { label: '券的有效期多久？', content: `發券後 ${CAMPAIGN.couponValidDays} 天內，且不超過活動結束日 ${CAMPAIGN.endDate}。` },
  { label: '三段一定要分天完成嗎？', content: '不用，同一天也可以連續跑完三段。' },
  {
    label: '在地與外地的差別是什麼？',
    content: `折價券的條件完全一樣，差別只在抽獎次數：外地旅客每段 ${ENTRY_RULE.visitor} 次、雲林在地每段 ${ENTRY_RULE.local} 次。`
  }
]
</script>

<template>
  <div>
    <!-- ══ 形象展示：主視覺 ═══════════════════════ -->
    <section class="relative isolate overflow-hidden">
      <img
        src="/images/kv-main.jpg"
        alt="雲林縣 台灣觀光100亮點 捲動國旅 主視覺"
        class="absolute inset-0 -z-10 size-full object-cover"
      >
      <div class="absolute inset-0 -z-10 bg-gradient-to-t from-paper via-paper/70 to-paper/10 md:bg-gradient-to-r md:from-paper md:via-paper/80 md:to-transparent" />

      <div class="container-page py-14 sm:py-20 lg:py-28">
        <div class="max-w-xl">
          <div class="flex flex-wrap items-center gap-2">
            <span class="chip bg-white/90 text-ink shadow-card">
              <UIcon name="i-lucide-calendar-days" class="size-3.5" />
              {{ CAMPAIGN.startDate }} – {{ CAMPAIGN.endDate }}
            </span>
            <span class="chip bg-indigoink-500 text-white shadow-card">
              與 {{ CAMPAIGN.partner }} 一起出發
            </span>
          </div>

          <p class="mt-5 text-sm font-bold tracking-[0.3em] text-indigoink-600 sm:text-base">
            {{ CAMPAIGN.subtitle }}
          </p>
          <h1 class="mt-1 text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
            {{ CAMPAIGN.county }}<br class="sm:hidden">{{ CAMPAIGN.title }}
          </h1>
          <p class="mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            走訪雲林紅綠景點，完成「一紅一綠」三段任務，
            最高帶走 <b class="text-vermilion-600">{{ CAMPAIGN.quota }} 元</b>折價券，
            在合作店家直接折抵。
          </p>

          <div class="mt-7 flex flex-wrap gap-3">
            <UButton
              :to="isLoggedIn ? '/checkin' : '/register'"
              size="xl"
              color="primary"
              :icon="isLoggedIn ? 'i-lucide-qr-code' : 'i-lucide-user-plus'"
              class="rounded-full font-bold"
            >{{ isLoggedIn ? '開始掃碼打卡' : '免費註冊參加' }}</UButton>
            <UButton
              to="/events"
              size="xl"
              color="neutral"
              variant="outline"
              icon="i-lucide-map"
              class="rounded-full bg-white/80 font-bold"
            >瀏覽 20 個亮點</UButton>
          </div>

          <dl class="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <div v-for="s in [
              { k: '紅點景點', v: `${RED_SPOTS.length} 處` },
              { k: '綠點景點', v: `${GREEN_SPOTS.length} 處` },
              { k: '合作店家', v: `${CAMPAIGN.storeCount} 家` }
            ]" :key="s.k">
              <dt class="text-[11px] font-bold text-ink-faint">{{ s.k }}</dt>
              <dd class="text-xl font-black text-ink">{{ s.v }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- ══ 個人專區：登入後才顯示 ═════════════════ -->
    <!--
      這一段用負邊距疊在主視覺上。主視覺是 position:relative（定位元素），
      依 CSS 繪製順序會蓋過後面的 static 區塊，所以這裡也要定位並給 z-index，
      否則卡片頂端會被主視覺遮住且無法點擊。
    -->
    <section class="container-page relative z-10 -mt-4 pb-4 sm:-mt-8">
      <div v-if="isLoggedIn" class="grid gap-4 lg:grid-cols-3">
        <div class="card p-4 sm:p-6 lg:col-span-2">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-lg font-black sm:text-xl">我的三段任務</h2>
            <span class="text-xs text-ink-soft sm:text-sm">
              已完成 <b class="text-vermilion-500">{{ completedStages }}</b> / 3 段
            </span>
          </div>

          <div class="mt-4">
            <StageProgress :completed="completedStages" />
          </div>

          <div v-if="nextNeed" class="mt-4 flex items-center gap-3 rounded-2xl bg-paper-soft p-3 sm:p-4">
            <span class="grid place-items-center size-9 shrink-0 rounded-full bg-white text-vermilion-500">
              <UIcon name="i-lucide-target" class="size-5" />
            </span>
            <p class="flex-1 text-xs leading-snug text-ink-soft sm:text-sm">
              再打
              <b v-if="nextNeed.needRed" class="text-vermilion-600">{{ nextNeed.needRed }} 個紅點</b>
              <template v-if="nextNeed.needRed && nextNeed.needGreen"> ＋ </template>
              <b v-if="nextNeed.needGreen" class="text-moss-600">{{ nextNeed.needGreen }} 個綠點</b>
              ，就能拿到 <b class="text-marigold-700">{{ nextNeed.reward }} 元</b>折價券
            </p>
            <UButton to="/checkin" color="primary" size="sm" class="shrink-0 rounded-full font-bold">
              去打卡
            </UButton>
          </div>

          <div v-else class="mt-4 flex items-center gap-2 rounded-2xl bg-marigold-100 p-4">
            <UIcon name="i-lucide-party-popper" class="size-5 shrink-0 text-marigold-700" />
            <p class="text-sm font-bold text-marigold-700">
              三段任務全數完成，已領滿 {{ CAMPAIGN.quota }} 元
            </p>
          </div>
        </div>

        <div class="card flex flex-col p-4 sm:p-6">
          <div class="flex items-center gap-3">
            <span class="grid place-items-center size-11 rounded-full bg-sky-100 text-sky-700">
              <UIcon :name="member.avatar" class="size-6" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-bold leading-tight truncate">{{ member.name }}</p>
              <div class="mt-1 flex flex-wrap items-center gap-1.5">
                <span class="chip bg-sky-100 text-sky-700">
                  {{ member.identity === 'visitor' ? '外地旅客' : '雲林在地' }}
                </span>
                <span v-if="member.lineBound" class="chip bg-moss-100 text-moss-700">
                  <UIcon name="i-lucide-message-circle" class="size-3" />已綁定
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl bg-paper-soft p-4 text-center">
            <p class="text-xs font-bold text-ink-soft">券包餘額</p>
            <p class="mt-1 text-4xl font-black leading-none text-vermilion-500">
              <span class="text-lg align-top">$</span>{{ walletAmount }}
            </p>
            <p class="mt-1.5 text-[11px] text-ink-faint">
              共 {{ coupons.length }} 張 ‧ 上限 {{ CAMPAIGN.quota }} 元
            </p>
          </div>

          <UButton
            to="/member"
            color="neutral"
            variant="outline"
            block
            class="mt-4 rounded-full font-bold"
            trailing-icon="i-lucide-chevron-right"
          >會員中心</UButton>
        </div>
      </div>

      <!-- 未登入：以號召取代個人資料 -->
      <div v-else class="card overflow-hidden">
        <div class="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
          <div>
            <span class="chip bg-vermilion-100 text-vermilion-700">
              <UIcon name="i-lucide-user-plus" class="size-3.5" />三步驟開始
            </span>
            <h2 class="mt-3 text-xl font-black sm:text-2xl">加入會員，開始累積你的折價券</h2>
            <p class="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
              手機號碼驗證就能加入，馬上開始收集你的折價券。
            </p>

            <ol class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <li
                v-for="(t, i) in ['手機驗證', '填基本資料', '選擇身分']"
                :key="t"
                class="flex items-center gap-1.5 text-xs font-bold text-ink-soft"
              >
                <span class="grid place-items-center size-5 rounded-full bg-paper-soft text-[10px] font-black text-ink">
                  {{ i + 1 }}
                </span>{{ t }}
              </li>
            </ol>
          </div>

          <div class="flex flex-wrap gap-3 lg:flex-col">
            <UButton to="/register" color="primary" size="xl" icon="i-lucide-user-plus" class="rounded-full font-bold">
              免費註冊
            </UButton>
            <UButton to="/login" color="neutral" variant="outline" size="xl" icon="i-lucide-log-in" class="rounded-full font-bold">
              我已有帳號
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ 形象展示：三個主張 ═════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead title="關於這場活動" sub="為什麼要走一趟雲林" />
      <div class="mt-5 grid gap-4 md:grid-cols-3">
        <article v-for="b in brandPoints" :key="b.title" class="card p-5 sm:p-6">
          <span class="grid place-items-center size-12 rounded-2xl bg-indigoink-50 text-indigoink-600">
            <UIcon :name="b.icon" class="size-6" />
          </span>
          <h3 class="mt-3.5 text-lg font-black">{{ b.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ b.desc }}</p>
        </article>
      </div>
    </section>

    <!-- ══ 怎麼玩 ═══════════════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead title="怎麼玩" sub="三個步驟，最高帶走 1,000 元" />
      <ol class="mt-5 grid gap-4 md:grid-cols-3">
        <li v-for="(step, i) in howItWorks" :key="step.title" class="card p-5 sm:p-6">
          <div class="flex items-center gap-3">
            <span class="grid place-items-center size-11 rounded-2xl bg-sky-100 text-sky-700">
              <UIcon :name="step.icon" class="size-6" />
            </span>
            <span class="text-3xl font-black text-paper-deep">0{{ i + 1 }}</span>
          </div>
          <h3 class="mt-3 text-lg font-black">{{ step.title }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-ink-soft">{{ step.desc }}</p>
        </li>
      </ol>
    </section>

    <!-- ══ 合作店家 ═════════════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead
        title="合作店家"
        :sub="`全縣約 ${CAMPAIGN.storeCount} 家，折價券在這裡直接折抵`"
        to="/stores"
        more="看全部店家"
      />

      <!-- 分類一覽 -->
      <div class="mt-5 flex flex-wrap gap-2">
        <NuxtLink
          v-for="c in STORE_CATEGORIES"
          :key="c.key"
          :to="`/stores?c=${c.key}`"
          class="flex items-center gap-1.5 rounded-full border-2 border-paper-deep bg-white px-3.5 py-2 text-xs font-bold text-ink-soft transition-colors hover:border-ink-faint"
        >
          <UIcon :name="c.icon" class="size-4" />{{ c.label }}
        </NuxtLink>
      </div>

      <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StoreCard v-for="s in featuredStores" :key="s.id" :store="s" />
      </div>
    </section>

    <!-- ══ 離你最近的亮點 ═══════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <SectionHead
        title="離你最近的亮點"
        :sub="`紅點 ${RED_SPOTS.length} 處 ‧ 綠點 ${GREEN_SPOTS.length} 處`"
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
              class="absolute top-2.5 left-2.5 chip text-white"
              :class="spot.type === 'red' ? 'bg-vermilion-500' : 'bg-moss-500'"
            >
              <UIcon :name="spot.icon" class="size-3.5" />
              {{ spot.type === 'red' ? '紅點' : '綠點' }}
            </span>

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

    <!-- ══ 加碼抽獎 ═════════════════════════════ -->
    <section class="container-page pt-12 sm:pt-16">
      <div class="grid gap-4 lg:grid-cols-3">
        <NuxtLink
          to="/lottery"
          class="relative isolate overflow-hidden rounded-card bg-indigoink-500 p-6 text-white shadow-pop transition-transform hover:-translate-y-0.5 lg:col-span-2 sm:p-8"
        >
          <div class="absolute -right-10 -top-10 -z-10 size-44 rounded-full bg-white/10" />
          <UIcon
            name="i-lucide-gift"
            class="absolute right-6 top-1/2 -z-10 size-28 -translate-y-1/2 text-white/20 sm:size-36"
          />

          <span class="chip bg-marigold-500 text-ink">週週抽</span>
          <h3 class="mt-3 text-2xl font-black sm:text-3xl">加碼抽獎</h3>
          <p class="mt-2 max-w-md text-sm leading-relaxed text-white/85">
            活動期間週週開獎，3C 家電、實體禮券等你抽。完成的段數越多，抽獎次數越多。
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span class="chip bg-white/15 text-white">外地旅客 ×{{ ENTRY_RULE.visitor }} 次</span>
            <span class="chip bg-white/15 text-white">在地鄉親 ×{{ ENTRY_RULE.local }} 次</span>
          </div>
        </NuxtLink>

        <div class="card flex flex-col justify-center p-6 sm:p-8">
          <span class="grid place-items-center size-12 rounded-2xl bg-clay-100 text-clay-600">
            <UIcon name="i-lucide-store" class="size-6" />
          </span>
          <h3 class="mt-3 text-xl font-black">帶著券去吃喝</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-ink-soft">
            結帳時出示折價券，當場折抵。小吃、伴手禮、咖啡、住宿都能用。
          </p>
          <UButton
            to="/stores"
            color="neutral"
            variant="outline"
            class="mt-4 self-start rounded-full font-bold"
            trailing-icon="i-lucide-chevron-right"
          >看合作店家</UButton>
        </div>
      </div>
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
