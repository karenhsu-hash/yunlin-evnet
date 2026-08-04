<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { login, member } = useCampaign()

const phone = ref('')
const otp = ref('')
const otpSent = ref(false)
const countdown = ref(0)
const submitting = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const phoneValid = computed(() => /^09\d{2}-?\d{3}-?\d{3}$/.test(phone.value.replace(/\s/g, '')))
const otpValid = computed(() => otp.value.length === 6)

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

const redirect = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
    ? route.query.redirect
    : '/member'
)

function submit() {
  if (!otpValid.value) return
  submitting.value = true
  setTimeout(() => {
    if (phone.value) member.value.phone = phone.value
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
        <span class="grid place-items-center mx-auto size-14 rounded-2xl bg-vermilion-500 text-white">
          <UIcon name="i-lucide-route" class="size-7" />
        </span>
        <h1 class="mt-4 text-2xl font-black sm:text-3xl">會員登入</h1>
        <p class="mt-2 text-sm text-ink-soft">
          登入後查看你的任務進度與折價券
        </p>
      </header>

      <div class="mt-7 card p-5 sm:p-7">
        <label class="text-xs font-bold text-ink-soft" for="phone">手機號碼</label>
        <div class="mt-1.5 flex gap-2">
          <UInput
            id="phone"
            v-model="phone"
            type="tel"
            placeholder="09xx-xxx-xxx"
            size="xl"
            class="flex-1"
            :ui="{ base: 'font-bold' }"
          />
          <UButton
            :color="phoneValid && countdown === 0 ? 'primary' : 'neutral'"
            :variant="phoneValid && countdown === 0 ? 'solid' : 'soft'"
            size="xl"
            :disabled="!phoneValid || countdown > 0"
            class="shrink-0 rounded-xl font-bold"
            @click="sendOtp"
          >{{ countdown > 0 ? `${countdown}s` : otpSent ? '重寄' : '發送驗證碼' }}</UButton>
        </div>
        <p v-if="phone && !phoneValid" class="mt-2 text-xs font-bold text-vermilion-600">
          手機格式不正確
        </p>

        <div v-if="otpSent" class="mt-5">
          <label class="text-xs font-bold text-ink-soft" for="otp">簡訊驗證碼</label>
          <UInput
            id="otp"
            v-model="otp"
            maxlength="6"
            placeholder="6 位數字"
            size="xl"
            class="mt-1.5 w-full"
            :ui="{ base: 'text-lg font-black tracking-[0.4em]' }"
          />
          <p class="mt-1.5 text-[11px] text-ink-faint">輸入任意 6 位數字即可（示範用）</p>
        </div>

        <UButton
          :color="otpValid ? 'primary' : 'neutral'"
          :variant="otpValid ? 'solid' : 'soft'"
          size="xl"
          block
          :loading="submitting"
          :disabled="!otpValid"
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
        >以示範帳號快速登入</UButton>
      </div>

      <p class="mt-5 text-center text-sm text-ink-soft">
        還沒有帳號？
        <NuxtLink to="/register" class="font-bold text-vermilion-600">立即註冊</NuxtLink>
      </p>
    </div>
  </div>
</template>
