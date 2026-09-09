<script setup lang="ts">
import type { RegisterStepKey } from '~/composables/useMember'

const { member, login } = useCampaign()
const {
  draft, addressInYunlin, identityMismatch,
  phoneValid, otpValid, emailValid, idNoValid, profileValid
} = useMember()

const step = ref<RegisterStepKey>('phone')
const stepIndex = computed(() => REGISTER_STEPS.findIndex((s) => s.key === step.value))

const otpSent = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function sendOtp() {
  if (!phoneValid.value) return
  otpSent.value = true
  countdown.value = 60
  timer && clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) clearInterval(timer)
  }, 1000)
}
onUnmounted(() => timer && clearInterval(timer))

/** 一人一帳號控管：門號去重（示意，固定幾組視為已註冊） */
const TAKEN_PHONES = ['0911-111-111', '0922-222-222']
const phoneTaken = computed(() => TAKEN_PHONES.includes(draft.value.phone.trim()))

const lineBinding = ref(false)
function bindLine() {
  lineBinding.value = true
  setTimeout(() => {
    lineBinding.value = false
    member.value.name = draft.value.name || member.value.name
    member.value.phone = draft.value.phone || member.value.phone
    member.value.identity = (draft.value.identity || 'visitor') as 'local' | 'visitor'
    member.value.lineBound = true
    login()
    step.value = 'done'
  }, 1500)
}

function skipLine() {
  member.value.name = draft.value.name || member.value.name
  member.value.identity = (draft.value.identity || 'visitor') as 'local' | 'visitor'
  member.value.lineBound = false
  login()
  step.value = 'done'
}

function fillDemo() {
  draft.value.phone = '0912-345-678'
  draft.value.name = '王小雲'
  draft.value.email = 'demo@example.com'
  draft.value.address = '台中市西屯區台灣大道三段 99 號'
  draft.value.idNo = 'N123456789'
  draft.value.otp = '123456'
  otpSent.value = true
}
</script>

<template>
  <div class="container-narrow py-8 sm:py-12">
    <!-- ── 頁首 ─────────────────────────────────── -->
    <header class="text-center">
      <span class="chip bg-sky-100 text-sky-700">會員註冊</span>
      <h1 class="mt-2 text-3xl font-black leading-tight sm:text-4xl">加入捲動國旅</h1>
      <p class="mt-2 text-sm text-ink-soft">完成註冊即可開始打卡任務，一支門號限一組帳號</p>
    </header>

    <!-- ── 步驟指示 ─────────────────────────────── -->
    <ol v-if="step !== 'done'" class="mt-7 flex items-center justify-between gap-1 sm:gap-2">
      <li
        v-for="(s, i) in REGISTER_STEPS"
        :key="s.key"
        class="flex flex-1 items-center gap-2"
      >
        <span
          class="grid place-items-center size-8 shrink-0 rounded-full text-xs font-black transition-colors sm:size-9"
          :class="stepIndex >= i ? 'bg-vermilion-500 text-white' : 'bg-paper-deep text-ink-faint'"
        >
          <UIcon v-if="stepIndex > i" name="i-lucide-check" class="size-4" />
          <UIcon v-else :name="s.icon" class="size-4" />
        </span>
        <span
          class="hidden text-xs font-bold sm:block"
          :class="stepIndex >= i ? 'text-ink' : 'text-ink-faint'"
        >{{ s.label }}</span>
        <span
          v-if="i < REGISTER_STEPS.length - 1"
          class="hidden h-0.5 flex-1 rounded-full sm:block"
          :class="stepIndex > i ? 'bg-vermilion-500' : 'bg-paper-deep'"
        />
      </li>
    </ol>

    <!-- ── 步驟 1：手機驗證 ─────────────────────── -->
    <section v-if="step === 'phone'" class="mt-6">
      <div class="card p-5 sm:p-7">
        <h2 class="flex items-center gap-2 text-lg font-black">
          <UIcon name="i-lucide-smartphone" class="size-5 text-vermilion-500" />手機門號驗證
        </h2>
        <p class="mt-1 text-xs text-ink-soft">一支門號限一組帳號</p>

        <div class="mt-5">
          <label class="text-xs font-bold text-ink-soft" for="phone">手機號碼</label>
          <div class="mt-1.5 flex gap-2">
            <UInput
              id="phone"
              v-model="draft.phone"
              type="tel"
              placeholder="09xx-xxx-xxx"
              size="xl"
              class="flex-1"
              :ui="{ base: 'font-bold' }"
            />
            <UButton
              :color="phoneValid && !phoneTaken && countdown === 0 ? 'primary' : 'neutral'"
              :variant="phoneValid && !phoneTaken && countdown === 0 ? 'solid' : 'soft'"
              size="xl"
              :disabled="!phoneValid || phoneTaken || countdown > 0"
              class="shrink-0 rounded-xl font-bold"
              @click="sendOtp"
            >
              {{ countdown > 0 ? `${countdown}s` : otpSent ? '重寄' : '發送驗證碼' }}
            </UButton>
          </div>

          <p v-if="draft.phone && !phoneValid" class="mt-2 text-xs font-bold text-vermilion-600">
            手機格式不正確
          </p>
          <UAlert
            v-else-if="phoneTaken"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="此門號已註冊過"
            description="請改用其他門號註冊。"
            class="mt-3"
          />
        </div>

        <div v-if="otpSent && !phoneTaken" class="mt-5">
          <label class="text-xs font-bold text-ink-soft" for="otp">簡訊驗證碼</label>
          <UInput
            id="otp"
            v-model="draft.otp"
            maxlength="6"
            placeholder="6 位數字"
            size="xl"
            class="mt-1.5 w-full"
            :ui="{ base: 'text-lg font-black tracking-[0.4em]' }"
          />
          <p class="mt-1.5 text-[11px] text-ink-faint">請輸入簡訊中的 6 位數驗證碼</p>
        </div>

        <UButton
          :color="otpValid && !phoneTaken ? 'primary' : 'neutral'"
          :variant="otpValid && !phoneTaken ? 'solid' : 'soft'"
          size="xl"
          block
          :disabled="!otpValid || phoneTaken"
          class="mt-6 rounded-full font-bold"
          @click="step = 'profile'"
        >驗證並繼續</UButton>
      </div>

      <button class="mt-3 w-full text-xs text-ink-faint underline" @click="fillDemo">
        快速帶入資料
      </button>
    </section>

    <!-- ── 步驟 2：基本資料 ─────────────────────── -->
    <section v-else-if="step === 'profile'" class="mt-6">
      <div class="card p-5 sm:p-7">
        <h2 class="flex items-center gap-2 text-lg font-black">
          <UIcon name="i-lucide-clipboard-pen" class="size-5 text-vermilion-500" />基本資料
        </h2>
        <p class="mt-1 text-xs text-ink-soft">用於活動通知與聯繫</p>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label class="text-xs font-bold text-ink-soft" for="name">姓名</label>
            <UInput id="name" v-model="draft.name" placeholder="請填寫真實姓名" size="lg" class="mt-1.5 w-full" />
          </div>

          <div>
            <label class="text-xs font-bold text-ink-soft" for="email">Email</label>
            <UInput id="email" v-model="draft.email" type="email" placeholder="name@example.com" size="lg" class="mt-1.5 w-full" />
            <p v-if="draft.email && !emailValid" class="mt-1 text-[11px] font-bold text-vermilion-600">
              Email 格式不正確
            </p>
          </div>

          <div class="sm:col-span-2">
            <label class="text-xs font-bold text-ink-soft" for="addr">通訊地址</label>
            <UInput id="addr" v-model="draft.address" placeholder="縣市 / 鄉鎮市區 / 路名門牌" size="lg" class="mt-1.5 w-full" />
            <p
              v-if="addressInYunlin !== null"
              class="mt-1 flex items-center gap-1 text-[11px] font-bold"
              :class="addressInYunlin ? 'text-moss-600' : 'text-sky-600'"
            >
              <UIcon name="i-lucide-map-pin" class="size-3.5" />
              {{ addressInYunlin ? '判別為雲林縣內地址' : '判別為雲林縣外地址' }}
            </p>
          </div>

          <div class="sm:col-span-2">
            <label class="text-xs font-bold text-ink-soft" for="idno">身分證字號</label>
            <UInput id="idno" v-model="draft.idNo" maxlength="10" placeholder="A123456789" size="lg" class="mt-1.5 w-full" :ui="{ base: 'uppercase' }" />
            <p class="mt-1 text-[11px] text-ink-faint">
              僅用於身分核對與中獎資格確認
              <span v-if="draft.idNo && !idNoValid" class="font-bold text-vermilion-600">‧ 格式不正確</span>
            </p>
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <UButton color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold" @click="step = 'phone'">
            上一步
          </UButton>
          <UButton
            :color="profileValid ? 'primary' : 'neutral'"
            :variant="profileValid ? 'solid' : 'soft'"
            size="lg"
            :disabled="!profileValid"
            class="flex-1 rounded-full font-bold"
            @click="step = 'identity'"
          >下一步</UButton>
        </div>
      </div>
    </section>

    <!-- ── 步驟 3：在地／外地 ───────────────────── -->
    <section v-else-if="step === 'identity'" class="mt-6">
      <div class="card p-5 sm:p-7">
        <h2 class="flex items-center gap-2 text-lg font-black">
          <UIcon name="i-lucide-compass" class="size-5 text-vermilion-500" />選擇身分
        </h2>
        <p class="mt-1 text-xs text-ink-soft">兩種身分的優惠券條件完全相同</p>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            v-for="opt in [
              { key: 'visitor', icon: 'i-lucide-car-front', title: '外地旅客', desc: '設籍雲林縣以外' },
              { key: 'local', icon: 'i-lucide-house', title: '雲林在地', desc: '設籍雲林縣內' }
            ]"
            :key="opt.key"
            class="flex items-center gap-3 rounded-card border-2 p-4 text-left transition-colors"
            :class="draft.identity === opt.key ? 'border-vermilion-500 bg-vermilion-50' : 'border-paper-deep bg-white hover:border-ink-faint'"
            @click="draft.identity = opt.key as 'local' | 'visitor'"
          >
            <span class="grid place-items-center size-11 shrink-0 rounded-2xl bg-white text-vermilion-600">
              <UIcon :name="opt.icon" class="size-6" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-bold">{{ opt.title }}</p>
              <p class="text-xs text-ink-soft">{{ opt.desc }}</p>
            </div>
          </button>
        </div>

        <UAlert
          v-if="identityMismatch"
          color="warning"
          variant="soft"
          icon="i-lucide-triangle-alert"
          title="所選身分與通訊地址判別不一致"
          description="優惠券條件不受影響；如填報不實，主辦單位得取消參加資格。"
          class="mt-4"
        />

        <label class="mt-5 flex items-start gap-2.5">
          <UCheckbox v-model="draft.agreed" />
          <span class="text-[11px] leading-relaxed text-ink-soft">
            我已閱讀並同意活動辦法與個人資料蒐集利用告知事項，並確認所填資料屬實。
          </span>
        </label>

        <div class="mt-6 flex gap-3">
          <UButton color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold" @click="step = 'profile'">
            上一步
          </UButton>
          <UButton
            :color="draft.identity && draft.agreed ? 'primary' : 'neutral'"
            :variant="draft.identity && draft.agreed ? 'solid' : 'soft'"
            size="lg"
            :disabled="!draft.identity || !draft.agreed"
            class="flex-1 rounded-full font-bold"
            @click="step = 'line'"
          >下一步</UButton>
        </div>
      </div>
    </section>

    <!-- ── 步驟 4：LINE 綁定 ────────────────────── -->
    <section v-else-if="step === 'line'" class="mt-6">
      <div class="card overflow-hidden">
        <div class="bg-moss-50 px-6 py-10 text-center">
          <UIcon name="i-lucide-message-circle" class="size-14 text-moss-600" />
          <h2 class="mt-3 text-xl font-black sm:text-2xl">綁定 LINE 官方帳號</h2>
          <p class="mt-1.5 text-xs text-ink-soft">接收任務完成與券到帳通知</p>
        </div>

        <div class="p-5 sm:p-7">
          <div class="flex items-center gap-3 rounded-2xl bg-marigold-50 p-4">
            <UIcon name="i-lucide-gift" class="size-6 shrink-0 text-marigold-700" />
            <p class="text-xs leading-relaxed text-marigold-700">
              加好友即贈 <b>50 元</b>店家折抵金
            </p>
          </div>

          <ul class="mt-4 space-y-2 text-xs text-ink-soft">
            <li v-for="t in ['任務完成、優惠券到帳即時通知', '活動與店家最新消息', '推播頻率低，不擾民']" :key="t" class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="size-4 shrink-0 text-moss-600" />{{ t }}
            </li>
          </ul>

          <UButton
            :color="lineBinding ? 'neutral' : 'primary'"
            :variant="lineBinding ? 'soft' : 'solid'"
            size="xl"
            block
            :loading="lineBinding"
            class="mt-6 rounded-full font-bold"
            @click="bindLine"
          >{{ lineBinding ? '綁定中…' : '加好友並綁定' }}</UButton>

          <button class="mt-3 w-full text-xs text-ink-faint underline" @click="skipLine">
            略過，稍後再綁定
          </button>
        </div>
      </div>
    </section>

    <!-- ── 完成 ─────────────────────────────────── -->
    <section v-else class="mt-6 animate-pop-in">
      <div class="card overflow-hidden">
        <div class="bg-vermilion-50 px-6 py-12 text-center">
          <UIcon name="i-lucide-party-popper" class="size-16 text-vermilion-500" />
          <h2 class="mt-3 text-2xl font-black sm:text-3xl">註冊完成</h2>
          <p class="mt-1.5 text-xs text-ink-soft">護照已開通，現在就出發蓋下第一枚章</p>
        </div>

        <dl class="divide-y divide-paper-deep px-5 sm:px-7">
          <div class="flex justify-between py-3 text-sm">
            <dt class="text-ink-soft">會員姓名</dt>
            <dd class="font-bold">{{ member.name }}</dd>
          </div>
          <div class="flex justify-between py-3 text-sm">
            <dt class="text-ink-soft">身分</dt>
            <dd class="font-bold">{{ member.identity === 'visitor' ? '外地旅客' : '雲林在地' }}</dd>
          </div>
          <div class="flex justify-between py-3 text-sm">
            <dt class="text-ink-soft">LINE 綁定</dt>
            <dd class="font-bold" :class="member.lineBound ? 'text-moss-600' : 'text-ink-faint'">
              {{ member.lineBound ? '已綁定 ‧ +50 元折抵金' : '尚未綁定' }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="mt-5 flex flex-wrap gap-3">
        <UButton to="/events" color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold">
          看景點
        </UButton>
        <UButton to="/checkin" color="primary" size="lg" icon="i-lucide-qr-code" class="flex-1 rounded-full font-bold">
          開始打卡
        </UButton>
      </div>
    </section>
  </div>
</template>
