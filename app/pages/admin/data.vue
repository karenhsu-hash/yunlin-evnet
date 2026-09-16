<script setup lang="ts">
import type { Task, TaskKind } from '~/composables/useCampaign'

definePageMeta({ layout: 'admin' })

const { canEdit } = useAdmin()

type Tab = 'members' | 'tasks' | 'spots' | 'stores' | 'params'
const tab = ref<Tab>('members')

const tabs: { key: Tab; label: string; count?: number }[] = [
  { key: 'members', label: '會員', count: MEMBERS.length },
  { key: 'tasks', label: '任務', count: TASKS.length },
  { key: 'spots', label: '站點', count: ALL_SPOTS.length },
  { key: 'stores', label: '合作店家', count: STORES.length },
  { key: 'params', label: '活動參數' }
]

/** 任務分頁：依類型篩選 */
const taskFilter = ref<'all' | TaskKind>('all')
const visibleTasks = computed(() =>
  taskFilter.value === 'all' ? TASKS : tasksOfKind(taskFilter.value)
)
/** 任務的重複規則，後台要一眼看出哪些可以累積 */
const repeatRule = (t: Task) => {
  if (t.milestone) return `累積 ${t.milestone.need} 次自動完成`
  if (t.rentalFlag) return '任一筆符合條件的租車'
  return '每人限一次'
}

const memberFilter = ref<'all' | 'local' | 'visitor' | 'dup'>('all')
const visibleMembers = computed(() => {
  switch (memberFilter.value) {
    case 'local': return MEMBERS.filter((m) => m.identity === 'local')
    case 'visitor': return MEMBERS.filter((m) => m.identity === 'visitor')
    case 'dup': return MEMBERS.filter((m) => m.dupFlag)
    default: return MEMBERS
  }
})

/** 依任務點數篩選；客戶審點數分配時可以一眼看出哪些站被訂成幾點 */
const POINT_TIERS = [...new Set(ALL_SPOTS.map((s) => s.points))].sort((a, b) => a - b)
const spotFilter = ref<'all' | number>('all')
const visibleSpots = computed(() =>
  spotFilter.value === 'all' ? ALL_SPOTS : ALL_SPOTS.filter((s) => s.points === spotFilter.value)
)
const spotFilters = computed(() => [
  { key: 'all' as const, label: `全部 ${ALL_SPOTS.length}` },
  ...POINT_TIERS.map((p) => ({ key: p, label: `${p} 點 ${ALL_SPOTS.filter((s) => s.points === p).length}` }))
])

function exportMembers() {
  downloadCsv('會員清單.csv', [
    ['姓名', '信箱', '身分', '會員等級', '累積點數', '已兌換點數', '抽獎次數', '去重註記'],
    ...MEMBERS.map((m) => [
      m.name, m.email, m.identity === 'local' ? '雲林在地' : '外地旅客',
      LEVELS[m.level - 1]!.name, m.earned, m.spent, m.draws, m.dupFlag ? '疑似重複' : ''
    ])
  ])
}

function exportStores() {
  downloadCsv('合作店家清單.csv', [
    ['店家名稱', '統一編號', '鄉鎮市', '核銷筆數', '核銷金額', '異常註記'],
    ...STORES.map((s) => [s.name, s.taxId, s.town, s.count, s.amount, s.flagged ? '異常' : ''])
  ])
}
</script>

<template>
  <div>
    <section>
      <h2 class="text-lg font-black">資料維護</h2>
      <p class="mt-0.5 text-xs text-ink-soft">會員、景點、店家與活動參數的維護與匯出</p>
    </section>

    <div class="mt-3 flex gap-1 overflow-x-auto no-scrollbar">
      <button
        v-for="t in tabs" :key="t.key"
        class="shrink-0 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors"
        :class="tab === t.key ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
        @click="tab = t.key"
      >
        {{ t.label }}<span v-if="t.count" class="ml-1 opacity-70">{{ t.count }}</span>
      </button>
    </div>

    <!-- ── 會員 ─────────────────────────────────── -->
    <section v-if="tab === 'members'" class="mt-4">
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="f in ([
              { key: 'all', label: '全部' },
              { key: 'visitor', label: '外地旅客' },
              { key: 'local', label: '雲林在地' },
              { key: 'dup', label: '疑似重複' }
            ] as const)"
            :key="f.key"
            class="rounded-full px-2.5 py-2 text-[11px] font-bold transition-colors"
            :class="memberFilter === f.key ? 'bg-ink text-white' : 'bg-paper-soft text-ink-soft'"
            @click="memberFilter = f.key"
          >{{ f.label }}</button>

          <button
            class="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full bg-moss-500 px-3 py-2.5 text-[11px] font-bold text-white"
            @click="exportMembers"
          ><UIcon name="i-lucide-download" class="size-3.5" />匯出</button>
        </div>

        <div class="mt-3.5 overflow-x-auto">
          <table class="w-full min-w-[560px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">姓名</th>
                <th class="py-2 pr-3 font-bold">信箱</th>
                <th class="py-2 pr-3 font-bold">身分</th>
                <th class="py-2 pr-3 font-bold">等級</th>
                <th class="py-2 pr-3 text-right font-bold">累積點數</th>
                <th class="py-2 pr-3 text-right font-bold">已兌換</th>
                <th class="py-2 pr-3 text-right font-bold">抽獎次數</th>
                <th class="py-2 font-bold">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in visibleMembers" :key="m.id" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">{{ m.name }}</td>
                <td class="py-2 pr-3 text-ink-soft">{{ m.email }}</td>
                <td class="py-2 pr-3">
                  <span
                    class="chip"
                    :class="m.identity === 'local' ? 'bg-moss-100 text-moss-700' : 'bg-sky-100 text-sky-700'"
                  >{{ m.identity === 'local' ? '在地' : '外地' }}</span>
                </td>
                <td class="py-2 pr-3">{{ LEVELS[m.level - 1]!.name }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(m.earned) }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(m.spent) }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ m.draws }}</td>
                <td class="py-2">
                  <span v-if="m.dupFlag" class="chip bg-vermilion-100 text-vermilion-700">疑似重複</span>
                  <span v-else class="text-ink-faint">正常</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-3 rounded-2xl bg-paper-soft px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
          一人一帳號控管：以電子信箱與身分證字號去重，命中者標記為疑似重複並暫停發放點數，待人工複核。
        </p>
      </div>
    </section>

    <!-- ── 任務 ─────────────────────────────────── -->
    <section v-else-if="tab === 'tasks'" class="mt-4">
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="f in ([{ key: 'all', label: `全部 ${TASKS.length}` }, ...TASK_KINDS.map((k) => ({ key: k.key, label: `${k.label} ${tasksOfKind(k.key).length}` }))] as const)"
            :key="f.key"
            class="rounded-full px-2.5 py-2 text-[11px] font-bold transition-colors"
            :class="taskFilter === f.key ? 'bg-ink text-white' : 'bg-paper-soft text-ink-soft'"
            @click="taskFilter = f.key"
          >{{ f.label }}</button>

          <button
            class="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2.5 text-[11px] font-bold"
            :class="canEdit ? 'bg-sky-500 text-white' : 'bg-paper-deep text-ink-faint'"
            :disabled="!canEdit"
          ><UIcon name="i-lucide-plus" class="size-3.5" />新增任務</button>
        </div>

        <div class="mt-3.5 overflow-x-auto">
          <table class="w-full min-w-[640px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">任務</th>
                <th class="py-2 pr-3 font-bold">類型</th>
                <th class="py-2 pr-3 text-right font-bold">點數</th>
                <th class="py-2 pr-3 font-bold">認定方式</th>
                <th class="py-2 font-bold">重複規則</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in visibleTasks" :key="t.id" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">{{ t.title }}</td>
                <td class="py-2 pr-3">
                  <span class="chip bg-paper-soft text-ink-soft">
                    {{ TASK_KINDS.find((k) => k.key === t.kind)!.label }}
                  </span>
                </td>
                <td class="py-2 pr-3 text-right font-bold tabular-nums text-marigold-700">{{ t.points }}</td>
                <td class="py-2 pr-3 text-ink-soft">
                  <template v-if="t.kind === 'checkin'">現場定位</template>
                  <template v-else-if="t.codeLabel">輸入{{ t.codeLabel }}</template>
                  <template v-else>由租車紀錄推導</template>
                </td>
                <td class="py-2 text-ink-soft">{{ repeatRule(t) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-3 rounded-2xl bg-paper-soft px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
          共 {{ TASKS.length }} 個任務，總點數 {{ toComma(TASKS.reduce((s, t) => s + t.points, 0)) }} 點。
          一般任務每人限完成一次；租車與食農教育的里程碑以累積次數自動認定，
          同一筆訂單或同一組活動代碼僅計算一次。任務內容與點數目前為示意值，待主辦提供正式清單。
        </p>
      </div>
    </section>

    <!-- ── 站點 ─────────────────────────────────── -->
    <section v-else-if="tab === 'spots'" class="mt-4">
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-1.5">
          <button
            v-for="f in spotFilters"
            :key="f.key"
            class="rounded-full px-2.5 py-2 text-[11px] font-bold transition-colors"
            :class="spotFilter === f.key ? 'bg-ink text-white' : 'bg-paper-soft text-ink-soft'"
            @click="spotFilter = f.key"
          >{{ f.label }}</button>

          <button
            class="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2.5 text-[11px] font-bold"
            :class="canEdit ? 'bg-sky-500 text-white' : 'bg-paper-deep text-ink-faint'"
            :disabled="!canEdit"
          ><UIcon name="i-lucide-plus" class="size-3.5" />新增景點</button>
        </div>

        <div class="mt-3.5 overflow-x-auto">
          <table class="w-full min-w-[600px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">站點</th>
                <th class="py-2 pr-3 font-bold">鄉鎮市</th>
                <th class="py-2 pr-3 text-right font-bold">任務點數</th>
                <th class="py-2 pr-3 text-right font-bold">判定半徑</th>
                <th class="py-2 font-bold">經緯度</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in visibleSpots" :key="s.id" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">
                  <span class="flex items-center gap-1.5">
                    <UIcon :name="s.icon" class="size-4 shrink-0 text-ink-soft" />{{ s.name }}
                  </span>
                </td>
                <td class="py-2 pr-3 text-ink-soft">{{ s.town }}</td>
                <td class="py-2 pr-3 text-right font-bold tabular-nums text-marigold-700">{{ s.points }}</td>
                <td class="py-2 pr-3 text-right tabular-nums text-ink-soft">{{ radiusOf(s) }} m</td>
                <td class="py-2 tabular-nums text-ink-soft">
                  {{ s.lat.toFixed(4) }}, {{ s.lng.toFixed(4) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-3 rounded-2xl bg-paper-soft px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
          共 {{ ALL_SPOTS.length }} 個站點，一律以定位打卡，不設置實體 QR code。
          打卡時擷取經緯度與站點座標比對，於判定半徑內即記入，並綁定會員身分去重。
          面狀場域（步道、濕地、農業區）的半徑另行放大。
        </p>
      </div>
    </section>

    <!-- ── 合作店家 ─────────────────────────────── -->
    <section v-else-if="tab === 'stores'" class="mt-4">
      <div class="card p-4">
        <div class="flex flex-wrap items-center gap-2">
          <p class="text-xs text-ink-soft">
            共 {{ CAMPAIGN.storeCount }} 家合作店家，以下為核銷金額前 {{ STORES.length }} 名
          </p>
          <button
            class="ml-auto shrink-0 inline-flex items-center gap-1 rounded-full bg-moss-500 px-3 py-2.5 text-[11px] font-bold text-white"
            @click="exportStores"
          ><UIcon name="i-lucide-download" class="size-3.5" />匯出</button>
        </div>

        <div class="mt-3.5 overflow-x-auto">
          <table class="w-full min-w-[560px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">店家</th>
                <th class="py-2 pr-3 font-bold">統編</th>
                <th class="py-2 pr-3 font-bold">鄉鎮市</th>
                <th class="py-2 pr-3 text-right font-bold">核銷筆數</th>
                <th class="py-2 pr-3 text-right font-bold">核銷金額</th>
                <th class="py-2 font-bold">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in STORES" :key="s.id" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">{{ s.name }}</td>
                <td class="py-2 pr-3 tabular-nums text-ink-soft">{{ s.taxId }}</td>
                <td class="py-2 pr-3 text-ink-soft">{{ s.town }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(s.count) }}</td>
                <td class="py-2 pr-3 text-right tabular-nums font-bold">${{ toComma(s.amount) }}</td>
                <td class="py-2">
                  <span v-if="s.flagged" class="chip bg-vermilion-100 text-vermilion-700">異常告警</span>
                  <span v-else class="text-ink-faint">正常</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-3 rounded-2xl bg-paper-soft px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
          每家店有專屬核銷碼（密碼），核銷時由店家人員輸入，對消費者隱藏。店家零設備、零掃描。
        </p>
      </div>
    </section>

    <!-- ── 活動參數 ─────────────────────────────── -->
    <section v-else class="mt-4">
      <div class="card p-4">
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-black">活動參數</h3>
          <span v-if="!canEdit" class="chip bg-paper-deep text-ink-faint">唯讀</span>
        </div>
        <p class="mt-0.5 text-xs text-ink-soft">比例與門檻可依實際成效調整</p>

        <div class="mt-3 grid gap-2.5 lg:grid-cols-2">
          <div
            v-for="p in [
              { label: '獎勵模式', value: '完成任務得點數 → 累積升級 → 兌換優惠券 → 店家核銷' },
              { label: '註冊禮', value: `${CAMPAIGN.signupBonus} 點（直接達等級一）` },
              { label: '任務點數', value: `每站依難度 ${Math.min(...ALL_SPOTS.map((s) => s.points))}～${Math.max(...ALL_SPOTS.map((s) => s.points))} 點（示意值）` },
              { label: '等級門檻', value: LEVELS.map((l) => `${l.name} ${toComma(l.threshold)}`).join('／') },
              { label: '點數上限', value: '不設上限，持續累積不歸零；預算改由獎項限量控管' },
              { label: '抽獎資格', value: `每累積 ${toComma(CAMPAIGN.lotteryUnit)} 點 ＋1 次，每完成一條推薦路線 ＋1 次` },
              { label: '任務數', value: TASK_KINDS.map((k) => `${k.label} ${tasksOfKind(k.key).length}`).join('、') },
              { label: '兌換品項', value: REWARDS.map((r) => `${r.name} ${r.cost} 點（${stockLeft(r) === null ? '不限量' : `限量 ${r.stock}，剩 ${stockLeft(r)}`}）`).join('；') },
              { label: '借問站', value: `${STATIONS.length} 處：${STATIONS.map((s) => s.town).join('、')}` },
              { label: '券面額', value: '250、500 兩種，不找零' },
              { label: '最低消費', value: `一律 ${CAMPAIGN.minSpend} 元（不分級）` },
              { label: '券有效期', value: `兌換後 ${CAMPAIGN.couponValidDays} 天，且不超過活動結束日` },
              { label: '站點數', value: `${ALL_SPOTS.length} 站，一律定位打卡（不設 QR code）` },
              { label: '合作店家', value: `約 ${CAMPAIGN.storeCount} 家` },
              { label: '活動總期程', value: `${CAMPAIGN.startDate} – ${CAMPAIGN.endDate}（2 個月）` },
              { label: '結算', value: '週結算核銷請款' }
            ]"
            :key="p.label"
            class="flex items-start justify-between gap-3 rounded-2xl bg-paper-soft px-3 py-2.5"
          >
            <span class="shrink-0 text-[11px] font-bold text-ink-soft">{{ p.label }}</span>
            <span class="text-right text-[11px] font-bold text-ink">{{ p.value }}</span>
          </div>
        </div>

        <UButton
          :color="canEdit ? 'primary' : 'neutral'"
          :variant="canEdit ? 'solid' : 'soft'"
          size="lg"
          :disabled="!canEdit"
          class="mt-5 rounded-full font-bold"
        >{{ canEdit ? '儲存參數' : '唯讀模式無法編輯' }}</UButton>
      </div>
    </section>
  </div>
</template>
