<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { login, member } = useCampaign()

const email = ref('')
const code = ref('')
/** 同註冊頁：記錄驗證碼寄給哪個信箱，信箱一改舊碼即失效 */
const codeSentTo = ref('')
const codeSent = computed(() => !!codeSentTo.value && codeSentTo.value === normalizedEmail.value)
const countdown = ref(0)
const submitting = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

/** 註冊時驗證過的信箱就是登入帳號；比對前正規化，避免大小寫造成登不進去 */
const normalizedEmail = computed(() => email.value.trim().toLowerCase())
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.value))
const codeValid = computed(() => /^\d{6}$/.test(code.value))

function sendCode() {
  if (!emailValid.value) return
  codeSentTo.value = normalizedEmail.value
  countdown.value = 60
  timer && clearInterval(timer)
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) clearInterval(timer)
  }, 1000)
}
onUnmounted(() => timer && clearInterval(timer))

const redirect = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/member'
)

function submit() {
  if (!codeValid.value || !codeSent.value) return
  submitting.value = true
  setTimeout(() => {
    if (normalizedEmail.value) member.value.email = normalizedEmail.value
    login()
    submitting.value = false
    router.push(redirect.value)
  }, 900)
}

/** 示範用：直接以既有會員登入，省去輸入 */
function demoLogin() {
  login()
  router.push(redirect.value)
}
</script>

<template>
  <div class="container-narrow py-10 sm:py-16">
    <div class="mx-auto max-w-md">
      <header class="text-center">
        <img src="/images/logo.png" alt="雲林縣 捲動國旅" class="mx-auto h-16 w-auto">
        <h1 class="mt-4 text-2xl font-black sm:text-3xl">會員登入</h1>
        <p class="mt-2 text-sm text-ink-soft">
          登入後查看你的觀光護照、點數與優惠券
        </p>
      </header>

      <div class="mt-7 card p-5 sm:p-7">
        <label class="text-xs font-bold text-ink-soft" for="email">電子信箱</label>
        <div class="mt-1.5 flex gap-2">
          <UInput
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
            size="xl"
            class="flex-1"
            :ui="{ base: 'font-bold' }"
          />
          <UButton
            :color="emailValid && countdown === 0 ? 'primary' : 'neutral'"
            :variant="emailValid && countdown === 0 ? 'solid' : 'soft'"
            size="xl"
            :disabled="!emailValid || countdown > 0"
            class="shrink-0 rounded-xl font-bold"
            @click="sendCode"
          >{{ countdown > 0 ? `${countdown}s` : codeSent ? '重寄' : '寄送驗證碼' }}</UButton>
        </div>
        <p v-if="email && !emailValid" class="mt-2 text-xs font-bold text-vermilion-600">
          信箱格式不正確
        </p>

        <div v-if="codeSent" class="mt-5">
          <label class="text-xs font-bold text-ink-soft" for="code">驗證碼</label>
          <UInput
            id="code"
            v-model="code"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="6 位數字"
            size="xl"
            class="mt-1.5 w-full"
            :ui="{ base: 'text-lg font-black tracking-[0.4em]' }"
          />
          <p class="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
            驗證碼已寄至 <b class="text-ink-soft">{{ normalizedEmail }}</b>，請輸入信中的 6 位數字。<br>
            沒收到請確認垃圾郵件匣。
          </p>
        </div>

        <UButton
          :color="codeValid && codeSent ? 'primary' : 'neutral'"
          :variant="codeValid && codeSent ? 'solid' : 'soft'"
          size="xl"
          block
          :loading="submitting"
          :disabled="!codeValid || !codeSent"
          class="mt-6 rounded-full font-bold"
          @click="submit"
        >登入</UButton>

        <div class="mt-5 flex items-center gap-3">
          <span class="h-px flex-1 bg-paper-deep" />
          <span class="text-[11px] text-ink-faint">或</span>
          <span class="h-px flex-1 bg-paper-deep" />
        </div>

        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          block
          icon="i-lucide-zap"
          class="mt-4 rounded-full font-bold"
          @click="demoLogin"
        >快速登入</UButton>
      </div>

      <p class="mt-5 text-center text-sm text-ink-soft">
        還沒有帳號？
        <NuxtLink to="/register" class="-my-2 inline-block py-2 font-bold text-vermilion-600">立即註冊</NuxtLink>
      </p>
    </div>
  </div>
</template>
