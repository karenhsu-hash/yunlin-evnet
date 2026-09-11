<script setup lang="ts">
import type { RegisterStepKey } from '~/composables/useMember'

const { member, login, resetDemo } = useCampaign()
const {
  draft, addressInYunlin, identityMismatch,
  emailValid, codeValid, idNoValid, profileValid
} = useMember()

const step = ref<RegisterStepKey>('email')
const stepIndex = computed(() => REGISTER_STEPS.findIndex((s) => s.key === step.value))

/**
 * 驗證碼是寄到「哪一個」信箱的。
 * 只記布林值會有漏洞：寄給 A 之後把信箱改成 B，舊的已寄狀態與舊驗證碼仍留著，
 * 使用者可以直接按下一步，等於 B 從來沒被驗證過。改成比對收件信箱，
 * 信箱一改 codeSent 立刻變 false，驗證碼欄位收起、下一步也擋住。
 */
const codeSentTo = ref('')
const codeSent = computed(() => !!codeSentTo.value && codeSentTo.value === normalizedEmail.value)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

/** 寄出信箱驗證碼；60 秒內不得重寄（以 session 為單位節流，避免改一個字就能重寄） */
function sendCode() {
  if (!emailValid.value || emailTaken.value) return
  codeSentTo.value = normalizedEmail.value
  countdown.value = 60
  timer && clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) clearInterval(timer)
  }, 1000)
}
onUnmounted(() => timer && clearInterval(timer))

/**
 * 一人一帳號控管：信箱去重。
 * 比對前一律轉小寫並去除前後空白 —— 信箱的 local part 理論上區分大小寫，
 * 但實務上沒有服務這樣做，若不正規化，Abc@x.com 與 abc@x.com 會被當成兩個帳號。
 */
const TAKEN_EMAILS = ['taken@example.com', 'used@example.com']
const normalizedEmail = computed(() => draft.value.email.trim().toLowerCase())
const emailTaken = computed(() => TAKEN_EMAILS.includes(normalizedEmail.value))

/**
 * 寫入會員資料並開通護照。
 * 新會員一律從等級一（註冊禮 200 點）開始：清掉示範資料留下的章與券，
 * 否則完成頁說「你已成為啟程會員」，護照卻顯示探索會員。
 */
function completeRegistration(lineBound: boolean) {
  member.value.name = draft.value.name || member.value.name
  member.value.email = normalizedEmail.value || member.value.email
  member.value.identity = (draft.value.identity || 'visitor') as 'local' | 'visitor'
  member.value.lineBound = lineBound
  resetDemo()
  login()
  step.value = 'done'
}

const lineBinding = ref(false)
function bindLine() {
  lineBinding.value = true
  setTimeout(() => {
    lineBinding.value = false
    completeRegistration(true)
  }, 1500)
}

function skipLine() {
  completeRegistration(false)
}

function fillDemo() {
  draft.value.email = 'demo@example.com'
  draft.value.code = '123456'
  draft.value.name = '王小雲'
  draft.value.address = '台中市西屯區台灣大道三段 99 號'
  draft.value.idNo = 'N123456789'
  codeSentTo.value = 'demo@example.com'
}
</script>

<template>
  <div class="container-narrow py-8 sm:py-12">
    <!-- ── 頁首 ─────────────────────────────────── -->
    <header class="text-center">
      <span class="chip bg-sky-100 text-sky-700">會員註冊</span>
      <h1 class="mt-2 text-3xl font-black leading-tight sm:text-4xl">加入捲動國旅</h1>
      <p class="mt-2 text-sm text-ink-soft">完成註冊即獲得 {{ CAMPAIGN.signupBonus }} 點，一個信箱限一組帳號</p>
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

    <!-- ── 步驟 1：信箱驗證 ─────────────────────── -->
    <section v-if="step === 'email'" class="mt-6">
      <div class="card p-5 sm:p-7">
        <h2 class="flex items-center gap-2 text-lg font-black">
          <UIcon name="i-lucide-mail" class="size-5 text-vermilion-500" />電子信箱驗證
        </h2>
        <p class="mt-1 text-xs text-ink-soft">一個信箱限一組帳號，之後也用這個信箱登入</p>

        <div class="mt-5">
          <label class="text-xs font-bold text-ink-soft" for="email">電子信箱</label>
          <div class="mt-1.5 flex gap-2">
            <UInput
              id="email"
              v-model="draft.email"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              size="xl"
              class="flex-1"
              :ui="{ base: 'font-bold' }"
            />
            <UButton
              :color="emailValid && !emailTaken && countdown === 0 ? 'primary' : 'neutral'"
              :variant="emailValid && !emailTaken && countdown === 0 ? 'solid' : 'soft'"
              size="xl"
              :disabled="!emailValid || emailTaken || countdown > 0"
              class="shrink-0 rounded-xl font-bold"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : codeSent ? '重寄' : '寄送驗證碼' }}
            </UButton>
          </div>

          <p v-if="draft.email && !emailValid" class="mt-2 text-xs font-bold text-vermilion-600">
            信箱格式不正確
          </p>
          <UAlert
            v-else-if="emailTaken"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            title="此信箱已註冊過"
            description="請改用其他信箱註冊，或直接以此信箱登入。"
            class="mt-3"
          />
        </div>

        <div v-if="codeSent && !emailTaken" class="mt-5">
          <label class="text-xs font-bold text-ink-soft" for="code">驗證碼</label>
          <UInput
            id="code"
            v-model="draft.code"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="6 位數字"
            size="xl"
            class="mt-1.5 w-full"
            :ui="{ base: 'text-lg font-black tracking-[0.4em]' }"
          />
          <p class="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
            驗證碼已寄至 <b class="text-ink-soft">{{ draft.email }}</b>，請輸入信中的 6 位數字。<br>
            沒收到請確認垃圾郵件匣，或於倒數結束後重寄。
          </p>
        </div>

        <UButton
          :color="codeValid && codeSent && !emailTaken ? 'primary' : 'neutral'"
          :variant="codeValid && codeSent && !emailTaken ? 'solid' : 'soft'"
          size="xl"
          block
          :disabled="!codeValid || !codeSent || emailTaken"
          class="mt-6 rounded-full font-bold"
          @click="step = 'profile'"
        >驗證並繼續</UButton>
      </div>

      <button class="mt-1 w-full py-2 text-xs text-ink-faint underline" @click="fillDemo">
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

          <!-- 信箱在第一步就驗證過了，這裡只做確認，不再開放編輯 -->
          <div>
            <span class="text-xs font-bold text-ink-soft">電子信箱</span>
            <div class="mt-1.5 flex items-center gap-2 rounded-xl bg-paper-soft px-3 py-2.5">
              <UIcon name="i-lucide-badge-check" class="size-4 shrink-0 text-moss-600" />
              <span class="min-w-0 flex-1 truncate text-sm font-bold">{{ draft.email }}</span>
              <button
                class="shrink-0 text-[11px] font-bold text-sky-600 underline underline-offset-2"
                @click="step = 'email'"
              >更改</button>
            </div>
            <p class="mt-1 text-[11px] text-ink-faint">已完成驗證</p>
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
              僅用於身分核對與一人一帳號控管
              <span v-if="draft.idNo && !idNoValid" class="font-bold text-vermilion-600">‧ 格式不正確</span>
            </p>
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <UButton color="neutral" variant="outline" size="lg" class="flex-1 rounded-full font-bold" @click="step = 'email'">
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
        <p class="mt-1 text-xs text-ink-soft">兩種身分的會員等級與點數條件完全相同</p>

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
          description="等級與點數條件不受影響；如填報不實，主辦單位得取消參加資格。"
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
          <p class="mt-1.5 text-xs text-ink-soft">選擇性綁定，不影響會員等級與點數</p>
        </div>

        <div class="p-5 sm:p-7">
          <ul class="space-y-2 text-xs text-ink-soft">
            <li v-for="t in ['會員升級、點數到帳即時通知', '優惠券到期前提醒', '活動與店家最新消息，推播頻率低']" :key="t" class="flex items-center gap-2">
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
          <img :src="LEVELS[0]!.art" alt="" class="mx-auto h-24 w-auto object-contain">
          <h2 class="mt-3 text-2xl font-black sm:text-3xl">註冊完成</h2>
          <p class="mt-1.5 text-xs text-ink-soft">護照已開通，現在就出發蓋下第一枚章</p>

          <!-- 註冊即是等級一 -->
          <div class="mx-auto mt-5 inline-flex items-center gap-3 rounded-2xl bg-marigold-500 px-5 py-3 text-left text-ink shadow-card">
            <UIcon name="i-lucide-coins" class="size-7 shrink-0" />
            <div>
              <p class="text-[11px] font-bold text-ink/70">等級一 ‧ {{ LEVELS[0]!.name }}</p>
              <p class="text-lg font-black leading-tight">獲得 {{ CAMPAIGN.signupBonus }} 點</p>
            </div>
          </div>
          <p class="mt-3 text-[11px] text-ink-soft">
            每完成一個任務可得 100～500 點，累積 {{ LEVELS[1]!.threshold }} 點升級為{{ LEVELS[1]!.name }}
          </p>
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
              {{ member.lineBound ? '已綁定' : '尚未綁定' }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="mt-5 flex flex-wrap gap-3">
        <UButton to="/member" color="neutral" variant="outline" size="lg" icon="i-lucide-book-marked" class="flex-1 rounded-full font-bold">
          看我的護照
        </UButton>
        <UButton to="/checkin" color="primary" size="lg" icon="i-lucide-stamp" class="flex-1 rounded-full font-bold">
          開始蓋章
        </UButton>
      </div>
    </section>
  </div>
</template>
