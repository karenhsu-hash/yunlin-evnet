<script setup lang="ts">
const { isLoggedIn, member, completedStages } = useCampaign()
const { myEntries, perStage, currentWeek, weeks } = useLottery()
const { lotteryRecords } = useMember()

const statusLabel = { drawn: '已開獎', open: '進行中', upcoming: '尚未開始' } as const
</script>

<template>
  <div>
    <!-- ── 頁首 ─────────────────────────────────── -->
    <section class="relative isolate overflow-hidden bg-indigoink-500 text-white">
      <div class="absolute -right-16 -top-16 -z-10 size-72 rounded-full bg-white/10" />
      <UIcon
        name="i-lucide-gift"
        class="absolute right-4 top-1/2 -z-10 size-40 -translate-y-1/2 text-white/15 sm:right-16 sm:size-56"
      />

      <div class="container-page py-10 sm:py-14">
        <span class="chip bg-marigold-500 text-ink">週週抽</span>
        <h1 class="mt-3 text-3xl font-black leading-tight sm:text-4xl">加碼抽獎</h1>
        <p class="mt-2 max-w-md text-sm leading-relaxed text-white/85">
          完成的段數越多，抽獎次數越多。獎項豐富，實體獎品直接寄到府。
        </p>
      </div>
    </section>

    <div class="container-page py-6 sm:py-8">
      <div class="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <!-- ── 我的抽獎資格 ───────────────────────── -->
        <div class="lg:col-span-1">
          <LoginGate
            v-if="!isLoggedIn"
            title="登入後查看你的抽獎次數"
            desc="登入後就能看到你目前有幾次抽獎機會。"
            icon="i-lucide-dices"
          />
          <div v-else class="card p-5 sm:p-6 lg:sticky lg:top-24">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-black">我的抽獎次數</h2>
              <span class="text-4xl font-black leading-none text-vermilion-500">{{ myEntries }}</span>
            </div>

            <div class="mt-4 grid grid-cols-3 gap-2">
              <div
                v-for="s in STAGES"
                :key="s.stage"
                class="rounded-2xl px-2 py-3 text-center"
                :class="completedStages >= s.stage ? 'bg-marigold-100' : 'bg-paper-soft'"
              >
                <p class="text-[10px] font-bold" :class="completedStages >= s.stage ? 'text-marigold-700' : 'text-ink-faint'">
                  {{ s.label }}
                </p>
                <p class="mt-1 text-base font-black" :class="completedStages >= s.stage ? 'text-ink' : 'text-ink-faint'">
                  {{ completedStages >= s.stage ? `+${perStage}` : '—' }}
                </p>
              </div>
            </div>

            <p class="mt-4 rounded-2xl bg-sky-50 px-3.5 py-3 text-[11px] leading-relaxed text-sky-700">
              你是<b>{{ member.identity === 'visitor' ? '外地旅客' : '雲林在地' }}</b>，
              每完成一段任務可獲得 <b>{{ perStage }}</b> 次抽獎機會。
            </p>

            <UButton
              v-if="completedStages < 3"
              to="/checkin"
              color="primary"
              size="lg"
              block
              icon="i-lucide-qr-code"
              class="mt-4 rounded-full font-bold"
            >去打卡增加次數</UButton>
          </div>
        </div>

        <!-- ── 本週獎項 ───────────────────────────── -->
        <div class="lg:col-span-2">
          <SectionHead
            :title="`${currentWeek.label}獎項`"
            :sub="`${currentWeek.drawDate} 開獎 ‧ 目前 ${toComma(currentWeek.entries)} 次參與`"
          />

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div v-for="p in currentWeek.prizes" :key="p.id" class="card flex items-center gap-3 p-4">
              <span class="grid place-items-center size-12 shrink-0 rounded-2xl bg-marigold-50 text-marigold-700">
                <UIcon :name="p.icon" class="size-6" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="font-bold truncate">{{ p.name }}</p>
                <p class="mt-0.5 text-[11px] text-ink-soft">
                  {{ p.physical ? '實體獎品 ‧ 寄送到府' : '電子獎項 ‧ 線上發放' }}
                </p>
              </div>
              <span class="chip shrink-0 bg-paper-soft text-ink-soft">{{ p.qty }} 名</span>
            </div>
          </div>

          <div class="mt-4 flex items-start gap-2.5 rounded-2xl bg-marigold-50 px-4 py-3">
            <UIcon name="i-lucide-mailbox" class="size-5 shrink-0 text-marigold-700" />
            <p class="text-[11px] leading-relaxed text-marigold-700">
              實體獎品會寄到府上，記得確認會員資料的地址是正確的。
            </p>
          </div>

          <!-- 每週開獎 -->
          <div class="mt-8">
            <SectionHead title="每週開獎" sub="活動期間週週抽，中獎會以 Email 與 LINE 通知" />
            <div class="mt-4 space-y-3">
              <div v-for="w in weeks" :key="w.id" class="card p-4 sm:p-5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="min-w-0">
                    <p class="font-bold">{{ w.label }}</p>
                    <p class="text-[11px] text-ink-faint">{{ w.drawDate }} 開獎</p>
                  </div>
                  <span
                    class="chip shrink-0"
                    :class="{
                      'bg-moss-100 text-moss-700': w.status === 'open',
                      'bg-paper-deep text-ink-faint': w.status === 'drawn',
                      'bg-sky-100 text-sky-700': w.status === 'upcoming'
                    }"
                  >{{ statusLabel[w.status] }}</span>
                </div>

                <div v-if="w.status !== 'upcoming'" class="mt-3 flex gap-2.5">
                  <div class="flex-1 rounded-xl bg-paper-soft px-3 py-2.5">
                    <p class="text-[10px] text-ink-faint">具資格人數</p>
                    <p class="text-base font-black tabular-nums">{{ toComma(w.eligible) }}</p>
                  </div>
                  <div class="flex-1 rounded-xl bg-paper-soft px-3 py-2.5">
                    <p class="text-[10px] text-ink-faint">總抽獎次數</p>
                    <p class="text-base font-black tabular-nums">{{ toComma(w.entries) }}</p>
                  </div>
                </div>

                <div class="mt-3 flex flex-wrap gap-1.5">
                  <span v-for="p in w.prizes" :key="p.id" class="chip bg-marigold-50 text-marigold-700">
                    <UIcon :name="p.icon" class="size-3.5" />{{ p.name }} ×{{ p.qty }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 紀錄 + 說明 ──────────────────────────── -->
      <div class="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHead title="我的抽獎紀錄" to="/member" more="會員中心" />
          <LoginGate
            v-if="!isLoggedIn"
            title="登入後查看抽獎紀錄"
            desc="登入後就能看到歷次的抽獎結果。"
            icon="i-lucide-trophy"
            class="mt-4"
          />
          <div v-else class="mt-4 card divide-y divide-paper-deep overflow-hidden">
            <div v-for="r in lotteryRecords" :key="r.id" class="flex items-center gap-3 p-4">
              <span
                class="grid place-items-center size-10 shrink-0 rounded-2xl"
                :class="r.result === 'won' ? 'bg-marigold-100 text-marigold-700' : 'bg-paper-soft text-ink-faint'"
              >
                <UIcon :name="r.result === 'won' ? 'i-lucide-trophy' : 'i-lucide-dices'" class="size-5" />
              </span>
              <p class="min-w-0 flex-1 font-bold">{{ r.week }}</p>
              <span
                class="chip shrink-0"
                :class="r.result === 'won' ? 'bg-marigold-500 text-ink' : 'bg-paper-deep text-ink-faint'"
              >{{ r.result === 'won' ? `中獎 ‧ ${r.prize}` : '未中獎' }}</span>
            </div>
          </div>
        </div>

        <div>
          <SectionHead title="抽獎說明" />
          <div class="mt-4 card p-5 sm:p-6">
            <ol class="space-y-3 text-xs leading-relaxed text-ink-soft sm:text-sm">
              <li
                v-for="(t, i) in [
                  '每完成一段任務就取得一次抽獎機會，活動期間內累計。',
                  `外地旅客每段 ${ENTRY_RULE.visitor} 次、雲林在地每段 ${ENTRY_RULE.local} 次。`,
                  '每週開獎一次，中獎名單由主辦單位公告。',
                  '中獎會以 Email 與 LINE 通知，實體獎品依你填寫的地址寄送。'
                ]"
                :key="i"
                class="flex gap-2.5"
              >
                <span class="grid place-items-center size-5 shrink-0 rounded-full bg-marigold-100 text-[10px] font-black text-marigold-700">
                  {{ i + 1 }}
                </span>
                {{ t }}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
