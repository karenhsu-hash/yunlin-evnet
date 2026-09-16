<script setup lang="ts">
import type { Task, TaskKind } from '~/composables/useCampaign'

/**
 * 任務牆 —— 所有可完成的任務與點數。
 *
 * 三類任務的完成方式不同：
 *   打卡任務　到站點現場定位（連到 /checkin）
 *   食農教育　體驗結束後輸入現場給的活動代碼
 *   iRent 租車　登錄訂單編號；次數累積推里程碑，取還車地點與車種推情境任務
 *
 * 里程碑任務沒有自己的輸入口，它讀計數器自動完成 —— 次數是唯一事實，
 * 這樣不會有「同一次租車被兩個任務各發一次點」的問題。
 */
useSeoMeta({
  title: '任務牆｜雲林縣 捲動國旅',
  description: '打卡任務、食農教育與 iRent 租車任務，完成即可獲得點數。'
})

const {
  isLoggedIn, isTaskDone, kindProgress, foodagriCount, rentalCount,
  submitTaskCode, logRental, earnedPoints
} = useCampaign()

const kind = ref<TaskKind>('checkin')
const visibleTasks = computed(() => tasksOfKind(kind.value))
const kindMeta = computed(() => TASK_KINDS.find((k) => k.key === kind.value)!)

/** 該類任務的點數總和，讓人知道這一類值多少 */
const kindPoints = (k: TaskKind) => tasksOfKind(k).reduce((s, t) => s + t.points, 0)

/** 里程碑進度：目前次數 / 需要次數 */
const milestoneNow = (t: Task) =>
  t.milestone?.counter === 'irent' ? rentalCount.value : foodagriCount.value

// ── 輸入憑證 ────────────────────────────────────
const dialog = ref<{ open: boolean; task: Task | null }>({ open: false, task: null })
const form = ref({ code: '', inYunlin: false, electric: false })
const feedback = ref<{ error?: string; gained?: number; unlocked?: Task[] } | null>(null)

function openDialog(task: Task | null) {
  dialog.value = { open: true, task }
  form.value = { code: '', inYunlin: false, electric: false }
  feedback.value = null
}

function submit() {
  const t = dialog.value.task
  const res = t
    ? submitTaskCode(t.id, form.value.code)
    : logRental({ code: form.value.code, inYunlin: form.value.inYunlin, electric: form.value.electric })

  if ('error' in res) {
    feedback.value = { error: res.error }
    return
  }
  feedback.value = { gained: res.gained, unlocked: res.unlocked }
  form.value.code = ''
}
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <!-- ── 頁首 ─────────────────────────────────── -->
    <header>
      <span class="chip bg-vermilion-100 text-vermilion-700">
        <UIcon name="i-lucide-list-checks" class="size-3.5" />任務牆
      </span>
      <h1 class="mt-2 text-3xl font-black leading-tight sm:text-4xl">完成任務，累積點數</h1>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
        共 {{ TASKS.length }} 個任務，每個任務依難度可得 100～500 點。
        點數持續累積不歸零，用來升級會員等級、兌換優惠與取得抽獎資格。
      </p>
      <p v-if="isLoggedIn" class="mt-3 inline-flex items-center gap-2 rounded-2xl bg-marigold-50 px-3.5 py-2">
        <UIcon name="i-lucide-coins" class="size-4 text-marigold-700" />
        <span class="text-xs font-bold text-marigold-700">目前累積</span>
        <span class="text-base font-black text-ink">{{ toComma(earnedPoints) }} 點</span>
      </p>
    </header>

    <!-- ── 分類 ─────────────────────────────────── -->
    <div class="mt-6 flex flex-wrap gap-2 sm:gap-2.5" role="tablist" aria-label="任務分類">
      <button
        v-for="k in TASK_KINDS"
        :key="k.key"
        role="tab"
        :aria-selected="kind === k.key"
        class="flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors"
        :class="kind === k.key
          ? 'border-ink bg-ink text-white'
          : 'border-paper-deep bg-white text-ink-soft hover:border-ink/40'"
        @click="kind = k.key"
      >
        <UIcon :name="k.icon" class="size-4 shrink-0" />
        {{ k.label }}
        <span class="opacity-70">
          <template v-if="isLoggedIn">{{ kindProgress(k.key).done }}/</template>{{ kindProgress(k.key).total }}
        </span>
      </button>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper-soft px-4 py-3">
      <p class="text-xs leading-relaxed text-ink-soft sm:text-sm">{{ kindMeta.desc }}</p>
      <p class="shrink-0 text-xs font-bold text-marigold-700">
        本類合計 {{ toComma(kindPoints(kind)) }} 點
      </p>
    </div>

    <!-- 租車：唯一的登錄入口，5 個任務都由這裡推導 -->
    <div v-if="kind === 'irent'" class="mt-4 card flex flex-wrap items-center gap-4 p-5">
      <img src="/images/art/car-family.webp" alt="" class="h-16 w-auto object-contain">
      <div class="min-w-0 flex-1">
        <p class="font-black">登錄租車紀錄</p>
        <p class="mt-0.5 text-xs text-ink-soft">
          輸入 iRent 訂單編號，系統依取還車地點與車種判定任務。目前已登錄
          <b class="text-ink">{{ rentalCount }}</b> 次。
        </p>
      </div>
      <UButton
        :disabled="!isLoggedIn"
        color="primary"
        class="shrink-0 rounded-full font-bold"
        icon="i-lucide-plus"
        @click="openDialog(null)"
      >{{ isLoggedIn ? '登錄一筆' : '登入後可登錄' }}</UButton>
    </div>

    <!-- ── 任務清單 ─────────────────────────────── -->
    <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="t in visibleTasks"
        :key="t.id"
        class="card flex flex-col gap-3 p-4"
        :class="isTaskDone(t) ? 'border-2 border-moss-500' : ''"
      >
        <div class="flex items-start gap-3">
          <img
            :src="t.art"
            alt=""
            loading="lazy"
            class="h-14 w-16 shrink-0 object-contain"
            :class="isTaskDone(t) ? '' : 'opacity-40 grayscale'"
          >
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="font-black leading-tight">{{ t.title }}</p>
              <span class="chip shrink-0 bg-marigold-100 text-marigold-700">+{{ t.points }}</span>
            </div>
            <p class="mt-1 text-xs leading-relaxed text-ink-soft">{{ t.desc }}</p>
          </div>
        </div>

        <!-- 里程碑：顯示進度條，沒有自己的按鈕 -->
        <div v-if="t.milestone" class="mt-auto">
          <div class="flex items-baseline justify-between text-[11px]">
            <span class="font-bold text-ink-soft">
              {{ t.milestone.counter === 'irent' ? '租車次數' : '完成體驗' }}
              {{ Math.min(milestoneNow(t), t.milestone.need) }} / {{ t.milestone.need }}
            </span>
            <span v-if="isTaskDone(t)" class="font-bold text-moss-600">已達成</span>
            <span v-else class="text-ink-faint">再 {{ t.milestone.need - milestoneNow(t) }} 次</span>
          </div>
          <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep">
            <div
              class="h-full rounded-full transition-[width] duration-500"
              :class="isTaskDone(t) ? 'bg-moss-500' : 'bg-marigold-500'"
              :style="{ width: `${Math.min(100, (milestoneNow(t) / t.milestone.need) * 100)}%` }"
            />
          </div>
        </div>

        <!-- 其餘任務：各自的完成方式 -->
        <div v-else class="mt-auto">
          <p v-if="isTaskDone(t)" class="flex items-center gap-1.5 text-xs font-bold text-moss-600">
            <UIcon name="i-lucide-circle-check" class="size-4" />已完成
          </p>
          <UButton
            v-else-if="t.kind === 'checkin'"
            :to="`/checkin?spot=${t.spotId}`"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full py-2 font-bold"
            trailing-icon="i-lucide-chevron-right"
          >去打卡</UButton>
          <UButton
            v-else-if="t.codeLabel"
            :disabled="!isLoggedIn"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full py-2 font-bold"
            icon="i-lucide-ticket-check"
            @click="openDialog(t)"
          >{{ isLoggedIn ? `輸入${t.codeLabel}` : '登入後可完成' }}</UButton>
          <p v-else class="text-xs text-ink-faint">登錄租車紀錄後自動完成</p>
        </div>
      </li>
    </ul>

    <!-- ── 輸入憑證 ─────────────────────────────── -->
    <UModal v-model:open="dialog.open" :title="dialog.task ? dialog.task.title : '登錄租車紀錄'">
      <template #body>
        <div v-if="feedback?.gained !== undefined" class="text-center">
          <UIcon name="i-lucide-circle-check-big" class="size-14 text-moss-600" />
          <p class="mt-2 text-xl font-black">完成！獲得 {{ feedback.gained }} 點</p>
          <ul v-if="feedback.unlocked?.length" class="mt-3 space-y-1.5">
            <li
              v-for="m in feedback.unlocked"
              :key="m.id"
              class="flex items-center justify-center gap-2 text-sm font-bold text-marigold-700"
            >
              <UIcon name="i-lucide-award" class="size-4" />同時解鎖「{{ m.title }}」
            </li>
          </ul>
          <p class="mt-3 text-xs text-ink-soft">目前累積 {{ toComma(earnedPoints) }} 點</p>
        </div>

        <div v-else>
          <p class="text-xs leading-relaxed text-ink-soft">
            <template v-if="dialog.task">
              體驗結束後，現場人員會提供一組活動代碼，輸入後即可完成任務並獲得 {{ dialog.task.points }} 點。
            </template>
            <template v-else>
              輸入 iRent 訂單編號。同一筆訂單只能登錄一次；正式版會直接與 iRent 訂單資料勾稽。
            </template>
          </p>

          <label class="mt-4 block text-xs font-bold text-ink-soft" for="task-code">
            {{ dialog.task?.codeLabel ?? '訂單編號' }}
          </label>
          <UInput
            id="task-code"
            v-model="form.code"
            :placeholder="dialog.task ? 'FA-XXXX-00' : 'IR-2609-0000'"
            size="xl"
            class="mt-1.5 w-full"
            :ui="{ base: 'font-bold uppercase' }"
          />

          <div v-if="!dialog.task" class="mt-4 space-y-2.5">
            <label class="flex items-center gap-2.5 text-sm">
              <UCheckbox v-model="form.inYunlin" />於雲林縣內的站點借還車
            </label>
            <label class="flex items-center gap-2.5 text-sm">
              <UCheckbox v-model="form.electric" />本次租用電動車
            </label>
            <p class="text-[11px] text-ink-faint">這兩項正式版由 iRent 訂單資料判定，這裡讓你手動指定以便試跑。</p>
          </div>

          <p v-if="feedback?.error" class="mt-3 flex items-center gap-1.5 text-xs font-bold text-vermilion-600">
            <UIcon name="i-lucide-triangle-alert" class="size-4" />{{ feedback.error }}
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full gap-3">
          <UButton
            color="neutral"
            variant="outline"
            class="flex-1 justify-center rounded-full font-bold"
            @click="dialog.open = false"
          >{{ feedback?.gained !== undefined ? '關閉' : '取消' }}</UButton>
          <UButton
            v-if="feedback?.gained === undefined"
            color="primary"
            class="flex-1 justify-center rounded-full font-bold"
            :disabled="form.code.trim().length < 4"
            @click="submit"
          >送出</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
