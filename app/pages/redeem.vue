<script setup lang="ts">
import type { Coupon } from '~/composables/useCampaign'

const { coupons, member } = useCampaign()

/**
 * 同一個核銷端，兩種身分：
 *   店家　　核銷折抵券，要輸入消費金額（最低消費門檻）
 *   借問站　核銷限量好禮的兌換券，沒有金額，核銷完直接給實體
 * 兩者都靠一組專屬核銷碼防止消費者自行核銷。
 */
type Mode = 'store' | 'station'
const mode = ref<Mode>('store')

/** 店家資料（示意）。核銷碼僅店家知道，全程不對消費者顯示。 */
const MERCHANT = {
  name: '北港圓仔湯老店',
  taxId: '54327891',
  contact: '05-782-1234',
  code: '2468'
}

const stationId = ref(STATIONS[0]!.id)
const station = computed(() => STATIONS.find((s) => s.id === stationId.value)!)

/** 目前這個身分的顯示資料與核銷碼 */
const desk = computed(() =>
  mode.value === 'store'
    ? { label: '店家核銷端', name: MERCHANT.name, sub: `統編 ${MERCHANT.taxId} ‧ ${MERCHANT.contact}`, code: MERCHANT.code, icon: 'i-lucide-store' }
    : { label: '借問站核銷端', name: station.value.name, sub: `${station.value.address} ‧ ${station.value.hours}`, code: station.value.code, icon: 'i-lucide-map-pin' }
)

type Step = 'pick' | 'amount' | 'code' | 'done'
const step = ref<Step>('pick')

const picked = ref<Coupon | null>(null)
const amount = ref('')
const codeInput = ref('')
const codeError = ref(false)

/** 只列得到這個身分能核銷的券：店家核折抵券，借問站核好禮券 */
const usable = computed(() =>
  coupons.value.filter((c) => c.status === 'unused' && c.channel === mode.value)
)
const amountNum = computed(() => Number(amount.value) || 0)

/** 最低消費一律 300 元，不分券別 */
const meetsMin = computed(() => amountNum.value >= CAMPAIGN.minSpend)

/** 不找零：未達面額不退差額；超過部分由消費者自付 */
const payBySelf = computed(() => (picked.value ? Math.max(0, amountNum.value - picked.value.value) : 0))
const forfeited = computed(() => (picked.value ? Math.max(0, picked.value.value - amountNum.value) : 0))

const todayLog = ref([
  { time: '13:48', member: '陳＊＊', value: 250, amount: 420, code: 'YL26-250-K3PW' },
  { time: '12:05', member: '林＊＊', value: 500, amount: 680, code: 'YL26-500-2QN8' },
  { time: '11:22', member: '黃＊＊', value: 250, amount: 300, code: 'YL26-250-A7VD' }
])
const todayTotal = computed(() => todayLog.value.reduce((s, r) => s + r.value, 0))

/** 借問站沒有消費金額這一步 */
const steps = computed(() =>
  mode.value === 'store' ? ['出示券', '輸入金額', '核銷碼', '完成'] : ['出示券', '核銷碼', '完成']
)
const stepOrder = computed(() =>
  mode.value === 'store' ? ['pick', 'amount', 'code', 'done'] : ['pick', 'code', 'done']
)

function pick(c: Coupon) {
  picked.value = c
  amount.value = ''
  codeInput.value = ''
  codeError.value = false
  step.value = mode.value === 'store' ? 'amount' : 'code'
}

/** 切換身分時整個流程重來，避免拿著店家選到的券跑到借問站核銷 */
watch(mode, () => {
  picked.value = null
  amount.value = ''
  codeInput.value = ''
  codeError.value = false
  step.value = 'pick'
})

function toCodeStep() {
  if (!meetsMin.value) return
  codeInput.value = ''
  codeError.value = false
  step.value = 'code'
}

function tapKey(k: string) {
  codeError.value = false
  if (k === 'del') {
    codeInput.value = codeInput.value.slice(0, -1)
    return
  }
  if (codeInput.value.length >= 4) return
  codeInput.value += k

  if (codeInput.value.length === 4) {
    setTimeout(() => {
      if (codeInput.value !== desk.value.code) {
        codeError.value = true
        codeInput.value = ''
        return
      }
      const target = coupons.value.find((c) => c.id === picked.value?.id)
      if (target) {
        target.status = 'used'
        target.usedAt = '2026.09.20 14:51'
        target.usedStore = desk.value.name
      }
      todayLog.value.unshift({
        time: '14:51',
        member: `${member.value.name.slice(0, 1)}＊＊`,
        value: picked.value!.value,
        amount: amountNum.value,
        code: picked.value!.code
      })
      step.value = 'done'
    }, 220)
  }
}

function reset() {
  picked.value = null
  amount.value = ''
  codeInput.value = ''
  codeError.value = false
  step.value = 'pick'
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
</script>

<template>
  <div>
    <!-- ── 店家端頁首 ───────────────────────────── -->
    <section class="bg-clay-600 text-white">
      <div class="container-page py-7 sm:py-9">
        <!-- 身分切換：同一支核銷端給店家與借問站共用 -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="m in ([
              { key: 'store', label: '合作店家', icon: 'i-lucide-store' },
              { key: 'station', label: '借問站', icon: 'i-lucide-map-pin' }
            ] as const)"
            :key="m.key"
            class="flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-xs font-bold transition-colors"
            :class="mode === m.key ? 'bg-white text-clay-700' : 'bg-white/15 text-white/80 hover:bg-white/25'"
            @click="mode = m.key"
          >
            <UIcon :name="m.icon" class="size-3.5" />{{ m.label }}
          </button>

          <select
            v-if="mode === 'station'"
            v-model="stationId"
            class="rounded-full bg-white/15 px-3 py-2.5 text-xs font-bold text-white outline-none"
          >
            <option v-for="s in STATIONS" :key="s.id" :value="s.id" class="text-ink">{{ s.name }}</option>
          </select>
        </div>

        <div class="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3.5">
            <span class="grid place-items-center size-12 shrink-0 rounded-2xl bg-white/15 sm:size-14">
              <UIcon :name="desk.icon" class="size-6 sm:size-7" />
            </span>
            <div class="min-w-0">
              <span class="chip bg-white/20 text-white">{{ desk.label }}</span>
              <h1 class="mt-1.5 text-xl font-black leading-tight sm:text-2xl">{{ desk.name }}</h1>
              <p class="text-[11px] text-white/70">{{ desk.sub }}</p>
            </div>
          </div>

          <dl class="grid grid-cols-2 gap-3 lg:w-72">
            <div class="rounded-2xl bg-white/10 px-3.5 py-3">
              <dt class="text-[10px] text-white/70">本日核銷</dt>
              <dd class="mt-1 text-xl font-black leading-none">
                <span class="text-xs align-top">$</span>{{ todayTotal }}
              </dd>
            </div>
            <div class="rounded-2xl bg-white/10 px-3.5 py-3">
              <dt class="text-[10px] text-white/70">本日筆數</dt>
              <dd class="mt-1 text-xl font-black leading-none">{{ todayLog.length }} 筆</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <div class="container-page py-6 sm:py-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <!-- ── 核銷流程 ───────────────────────────── -->
        <div>
          <!-- 步驟指示 -->
          <ol class="card flex items-center justify-between gap-1 px-3 py-3 sm:px-5">
            <li v-for="(s, i) in steps" :key="s" class="flex flex-1 items-center gap-2">
              <span
                class="grid place-items-center size-6 shrink-0 rounded-full text-[10px] font-black"
                :class="stepOrder.indexOf(step) >= i ? 'bg-clay-500 text-white' : 'bg-paper-deep text-ink-faint'"
              >
                <UIcon v-if="stepOrder.indexOf(step) > i" name="i-lucide-check" class="size-3.5" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span
                class="hidden text-xs font-bold sm:block"
                :class="stepOrder.indexOf(step) >= i ? 'text-ink' : 'text-ink-faint'"
              >{{ s }}</span>
              <span
                v-if="i < steps.length - 1"
                class="hidden h-0.5 flex-1 rounded-full sm:block"
                :class="stepOrder.indexOf(step) > i ? 'bg-clay-500' : 'bg-paper-deep'"
              />
            </li>
          </ol>

          <!-- 步驟 1：出示券 -->
          <section v-if="step === 'pick'" class="mt-5">
            <h2 class="text-lg font-black sm:text-xl">
              請旅客出示{{ mode === 'store' ? '優惠券' : '好禮兌換券' }}
            </h2>
            <p class="mt-1 text-xs text-ink-soft">
              {{ mode === 'store'
                ? '店家零設備、零掃描；由店家在本頁選取消費者出示的券'
                : '借問站人員在本頁選取旅客出示的兌換券，核銷後交付好禮' }}
            </p>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <button v-for="c in usable" :key="c.id" class="block w-full text-left" @click="pick(c)">
                <CouponCard :coupon="c" selectable />
              </button>
            </div>

            <div
              v-if="!usable.length"
              class="mt-4 rounded-card border-2 border-dashed border-paper-deep p-10 text-center"
            >
              <UIcon name="i-lucide-ticket" class="size-9 text-ink-faint" />
              <p class="mt-2 text-sm text-ink-soft">
                目前沒有可核銷的{{ mode === 'store' ? '折抵券' : '好禮兌換券' }}
              </p>
              <UButton to="/member" color="neutral" variant="outline" size="sm" class="mt-3 rounded-full font-bold">
                去護照兌換
              </UButton>
            </div>

            <template v-if="coupons.some((c) => c.status === 'used')">
              <h3 class="mt-8 text-sm font-black text-ink-soft">已核銷</h3>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <CouponCard v-for="c in coupons.filter((c) => c.status === 'used')" :key="c.id" :coupon="c" />
              </div>
            </template>
          </section>

          <!-- 步驟 2：輸入金額 -->
          <section v-else-if="step === 'amount' && picked" class="mt-5">
            <h2 class="text-lg font-black sm:text-xl">輸入本次消費金額</h2>
            <p class="mt-1 text-xs text-ink-soft">
              最低消費 {{ CAMPAIGN.minSpend }} 元方可核銷（{{ picked.value }} 元券亦同，不分級）
            </p>

            <div class="mt-4 max-w-md">
              <CouponCard :coupon="picked" />
            </div>

            <div class="mt-5 card max-w-md p-5">
              <label class="text-xs font-bold text-ink-soft" for="amount">消費金額</label>
              <UInput
                id="amount"
                v-model="amount"
                type="number"
                placeholder="0"
                size="xl"
                class="mt-1.5 w-full"
                :ui="{ base: 'text-2xl font-black' }"
              >
                <template #leading>
                  <span class="text-lg font-black text-ink-faint">$</span>
                </template>
              </UInput>

              <UAlert
                v-if="amount && !meetsMin"
                color="error"
                variant="soft"
                icon="i-lucide-triangle-alert"
                :title="`未達最低消費 ${CAMPAIGN.minSpend} 元`"
                :description="`尚差 ${CAMPAIGN.minSpend - amountNum} 元`"
                class="mt-3"
              />

              <dl v-if="meetsMin" class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <dt class="text-ink-soft">消費金額</dt>
                  <dd class="font-bold">${{ amountNum }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-ink-soft">優惠券折抵</dt>
                  <dd class="font-bold text-vermilion-600">－${{ picked.value }}</dd>
                </div>
                <div v-if="forfeited" class="flex justify-between rounded-xl bg-marigold-50 px-2.5 py-2 text-xs">
                  <dt class="text-marigold-700">未達面額不找零，差額不退</dt>
                  <dd class="font-bold text-marigold-700">${{ forfeited }}</dd>
                </div>
                <div class="flex justify-between border-t border-paper-deep pt-2.5">
                  <dt class="font-bold">消費者應付</dt>
                  <dd class="text-xl font-black">${{ payBySelf }}</dd>
                </div>
              </dl>

              <div class="mt-5 flex gap-3">
                <UButton color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold" @click="reset">
                  取消
                </UButton>
                <UButton
                  :color="meetsMin ? 'primary' : 'neutral'"
                  :variant="meetsMin ? 'solid' : 'soft'"
                  size="lg"
                  :disabled="!meetsMin"
                  class="flex-1 rounded-full font-bold"
                  @click="toCodeStep"
                >下一步：核銷</UButton>
              </div>
            </div>
          </section>

          <!-- 步驟 3：核銷碼 -->
          <section v-else-if="step === 'code' && picked" class="mt-5">
            <div class="max-w-md rounded-card bg-clay-700 p-6 text-white">
              <div class="text-center">
                <span class="chip bg-white/15 text-white">
                  <UIcon name="i-lucide-lock" class="size-3.5" />請由店家人員操作
                </span>
                <h2 class="mt-3 text-lg font-black sm:text-xl">輸入店家專屬核銷碼</h2>
                <p class="mt-1.5 text-[11px] leading-relaxed text-white/70">
                  核銷碼不對消費者顯示，用以防止自行核銷
                </p>
              </div>

              <div class="mt-5 flex justify-center gap-3">
                <span
                  v-for="i in 4"
                  :key="i"
                  class="grid place-items-center h-14 w-12 rounded-2xl border-2 transition-colors"
                  :class="codeError
                    ? 'border-vermilion-300 bg-vermilion-500/20'
                    : codeInput.length >= i ? 'border-marigold-500 bg-white/10' : 'border-white/25 bg-white/5'"
                >
                  <UIcon v-if="codeInput.length >= i" name="i-lucide-circle" class="size-4 text-marigold-500" />
                </span>
              </div>

              <p v-if="codeError" class="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-vermilion-300">
                <UIcon name="i-lucide-triangle-alert" class="size-4" />核銷碼錯誤，請重新輸入
              </p>

              <div class="mt-5 grid grid-cols-3 gap-2.5">
                <button
                  v-for="(k, i) in keys"
                  :key="i"
                  class="grid h-14 place-items-center rounded-2xl text-xl font-black transition-transform active:scale-95"
                  :class="k === '' ? 'invisible' : 'bg-white/10 text-white hover:bg-white/15'"
                  :disabled="k === ''"
                  @click="tapKey(k)"
                >
                  <UIcon v-if="k === 'del'" name="i-lucide-delete" class="size-5" />
                  <template v-else>{{ k }}</template>
                </button>
              </div>

            </div>

            <div class="mt-4 card max-w-md p-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-ink-soft">{{ mode === 'store' ? '券別 / 消費' : '兌換品項' }}</span>
                <span class="font-bold">
                  <template v-if="mode === 'store'">${{ picked.value }} 券 ‧ 消費 ${{ amountNum }}</template>
                  <template v-else>{{ picked.name }}</template>
                </span>
              </div>
              <div class="mt-1.5 flex items-center justify-between text-sm">
                <span class="text-ink-soft">券碼</span>
                <span class="font-mono font-bold tracking-wider">{{ picked.code }}</span>
              </div>
            </div>

            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              class="mt-4 max-w-md rounded-full font-bold"
              block
              @click="step = mode === 'store' ? 'amount' : 'pick'"
            >上一步</UButton>
          </section>

          <!-- 步驟 4：完成 -->
          <section v-else-if="step === 'done' && picked" class="mt-5 animate-pop-in">
            <div class="card max-w-md overflow-hidden">
              <div class="bg-moss-50 px-6 py-10 text-center">
                <UIcon name="i-lucide-circle-check-big" class="size-16 text-moss-600" />
                <h2 class="mt-3 text-2xl font-black">核銷完成</h2>
                <p class="mt-1.5 text-xs text-ink-soft">
                  {{ mode === 'store' ? '券已扣除，本筆將列入本週核銷請款' : '券已扣除，請將好禮交付旅客' }}
                </p>
              </div>

              <dl class="divide-y divide-paper-deep px-5">
                <div class="flex justify-between py-3 text-sm">
                  <dt class="text-ink-soft">{{ mode === 'store' ? '券面額' : '兌換品項' }}</dt>
                  <dd class="font-bold">
                    <template v-if="mode === 'store'">${{ picked.value }}</template>
                    <template v-else>{{ picked.name }}</template>
                  </dd>
                </div>
                <template v-if="mode === 'store'">
                  <div class="flex justify-between py-3 text-sm">
                    <dt class="text-ink-soft">消費金額</dt><dd class="font-bold">${{ amountNum }}</dd>
                  </div>
                  <div class="flex justify-between py-3 text-sm">
                    <dt class="text-ink-soft">消費者實付</dt><dd class="font-bold">${{ payBySelf }}</dd>
                  </div>
                </template>
                <div class="flex justify-between py-3 text-sm">
                  <dt class="text-ink-soft">券碼</dt>
                  <dd class="font-mono font-bold tracking-wider">{{ picked.code }}</dd>
                </div>
                <div class="flex justify-between py-3 text-sm">
                  <dt class="text-ink-soft">核銷時間</dt><dd class="font-bold">2026.09.20 14:51</dd>
                </div>
              </dl>
            </div>

            <UButton color="primary" size="lg" class="mt-5 max-w-md rounded-full font-bold" block @click="reset">
              繼續核銷下一筆
            </UButton>
          </section>
        </div>

        <!-- ── 本日核銷清單 ───────────────────────── -->
        <aside>
          <div class="lg:sticky lg:top-24">
            <h2 class="text-lg font-black">本店核銷清單</h2>
            <p class="mt-0.5 text-xs text-ink-soft">週結算，自動生成核銷週報供對帳請款</p>

            <div class="mt-4 card divide-y divide-paper-deep overflow-hidden">
              <div v-for="(row, i) in todayLog" :key="i" class="flex items-center gap-3 p-3.5">
                <span class="w-11 shrink-0 text-xs font-bold text-ink-faint">{{ row.time }}</span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold">{{ row.member }}</p>
                  <p class="font-mono text-[10px] text-ink-faint">{{ row.code }}</p>
                </div>
                <div class="shrink-0 text-right">
                  <p class="font-black text-clay-600">－${{ row.value }}</p>
                  <p class="text-[10px] text-ink-faint">消費 ${{ row.amount }}</p>
                </div>
              </div>
            </div>

            <div class="mt-3 flex items-start gap-2.5 rounded-2xl bg-marigold-50 px-3.5 py-3">
              <UIcon name="i-lucide-bell-ring" class="size-4.5 shrink-0 text-marigold-700" />
              <p class="text-[11px] leading-snug text-marigold-700">
                系統持續偵測短時間大量或集中核銷之異常，超出門檻將自動告警。
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
