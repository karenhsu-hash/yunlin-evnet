<script setup lang="ts">
definePageMeta({ layout: 'admin' })

/**
 * 抽獎名單系統（輕量）：
 * 系統只做「資格判定 → 生成名單 → 匯出」，
 * 開獎、對獎與獎品寄送皆為人工作業，故此頁不含庫存與自動通知。
 */

const weekId = ref('w4')
const week = computed(() => LOTTERY_WEEKS.find((w) => w.id === weekId.value)!)

/**
 * 資格條件：最低抽獎次數。
 * 次數：累積點數每滿 1,000 點加一次，再加上完成的推薦路線數，算法在 useCampaign 的 draws。
 */
const minDraws = ref(1)
const DRAW_OPTIONS = [1, 2, 3]

const eligibleCount = computed(() =>
  Math.round(week.value.eligible * (minDraws.value === 1 ? 1 : minDraws.value === 2 ? 0.62 : 0.34))
)
const entryCount = computed(() =>
  Math.round(week.value.entries * (minDraws.value === 1 ? 1 : minDraws.value === 2 ? 0.65 : 0.38))
)

const generating = ref(false)
const generated = ref(false)

interface WinnerRow {
  no: number
  name: string
  /** 註冊時驗證過的信箱；註冊流程已不收手機，寄送前需另行索取聯絡電話 */
  email: string
  identity: 'local' | 'visitor'
  /** 累積總點數 */
  points: number
  /** 抽獎次數 */
  draws: number
  prize: string
  address: string
}

const winners = ref<WinnerRow[]>([])

const SURNAMES = ['王', '陳', '林', '黃', '張', '李', '吳', '劉', '蔡', '楊', '許', '鄭']
const MAIL_HOSTS = ['gmail.com', 'yahoo.com.tw', 'hotmail.com', 'msn.com']
const CITIES = ['台中市西屯區', '台北市大安區', '高雄市左營區', '雲林縣斗六市', '桃園市中壢區', '台南市東區']

function generate() {
  generating.value = true
  generated.value = false
  setTimeout(() => {
    const rows: WinnerRow[] = []
    let no = 1
    for (const p of week.value.prizes) {
      // 名單筆數以獎項數量為準；示意用固定序列，不用隨機來源
      for (let i = 0; i < Math.min(p.qty, 6); i++) {
        const s = SURNAMES[(no * 5 + i) % SURNAMES.length]
        const isLocal = (no + i) % 4 === 0
        rows.push({
          no,
          name: `${s}＊＊`,
          email: `${'abcdefghijk'[(no + i) % 11]}***${String(100 + ((no * 37) % 900))}@${MAIL_HOSTS[(no + i) % MAIL_HOSTS.length]}`,
          identity: isLocal ? 'local' : 'visitor',
          points: 1000 + ((no * 300 + i * 100) % 2600),
          draws: 1 + ((no + i) % 4),
          prize: p.name,
          address: `${CITIES[(no + i) % CITIES.length]}＊＊＊`
        })
        no++
      }
    }
    winners.value = rows
    generating.value = false
    generated.value = true
  }, 1100)
}

function exportWinners() {
  downloadCsv(`中獎名單_${week.value.label}.csv`, [
    ['序號', '姓名', '信箱', '身分', '累積點數', '抽獎次數', '獎項', '寄送地址'],
    ...winners.value.map((w) => [
      w.no, w.name, w.email,
      w.identity === 'local' ? '雲林在地' : '外地旅客',
      w.points, w.draws, w.prize, w.address
    ])
  ])
}

const physicalCount = computed(
  () => winners.value.filter((w) => week.value.prizes.find((p) => p.name === w.prize)?.physical).length
)
</script>

<template>
  <div>
    <section>
      <h2 class="text-lg font-black">抽獎名單</h2>
      <p class="mt-0.5 text-xs text-ink-soft">
        系統負責資格判定與名單生成；開獎、對獎、寄送由主辦人工處理
      </p>
    </section>

    <!-- ── 條件設定 ─────────────────────────────── -->
    <section class="mt-3">
      <div class="card p-4">
        <h3 class="font-black">產生條件</h3>

        <div class="mt-3 grid gap-3 lg:grid-cols-2">
          <div>
            <label class="text-xs font-bold text-ink-soft" for="wk">抽獎週次</label>
            <select
              id="wk" v-model="weekId"
              class="mt-1.5 w-full rounded-2xl border-2 border-paper-deep bg-white px-3 py-2.5 text-sm font-bold outline-none"
            >
              <option v-for="w in LOTTERY_WEEKS" :key="w.id" :value="w.id">
                {{ w.label }} ‧ {{ w.drawDate }} 開獎
              </option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-ink-soft">資格門檻</label>
            <div class="mt-1.5 flex gap-1.5">
              <button
                v-for="n in DRAW_OPTIONS" :key="n"
                class="flex-1 rounded-2xl border-2 py-2.5 text-xs font-bold transition-colors"
                :class="minDraws === n ? 'border-ink bg-ink text-white' : 'border-paper-deep bg-white text-ink-soft'"
                @click="minDraws = n"
              >{{ n }} 次以上</button>
            </div>
          </div>
        </div>

        <!-- 資格算法說明 -->
        <div class="mt-3 rounded-2xl bg-sky-50 px-3 py-2.5">
          <p class="text-[11px] leading-relaxed text-sky-700">
            抽獎次數為累積總點數每滿 {{ toComma(CAMPAIGN.lotteryUnit) }} 點加一次，再加上完成的推薦路線數。兌換優惠所扣除的點數不影響已取得的次數。
          </p>
        </div>

        <div class="mt-3 grid grid-cols-3 gap-2.5">
          <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
            <p class="text-[11px] font-bold text-ink-soft">具資格人數</p>
            <p class="mt-0.5 text-lg font-black leading-none tabular-nums">{{ toComma(eligibleCount) }}</p>
          </div>
          <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
            <p class="text-[11px] font-bold text-ink-soft">加權後次數</p>
            <p class="mt-0.5 text-lg font-black leading-none tabular-nums">{{ toComma(entryCount) }}</p>
          </div>
          <div class="rounded-2xl bg-paper-soft px-3 py-2.5">
            <p class="text-[11px] font-bold text-ink-soft">獎項名額</p>
            <p class="mt-0.5 text-lg font-black leading-none tabular-nums">
              {{ week.prizes.reduce((s, p) => s + p.qty, 0) }}
            </p>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="p in week.prizes" :key="p.id" class="chip bg-marigold-50 text-marigold-700">
            <UIcon :name="p.icon" class="size-3.5" />{{ p.name }} ×{{ p.qty }}{{ p.physical ? ' ‧ 需寄送' : '' }}
          </span>
        </div>

        <UButton
          :color="generating ? 'neutral' : 'primary'"
          :variant="generating ? 'soft' : 'solid'"
          size="lg"
          :loading="generating"
          :disabled="generating"
          class="mt-5 rounded-full font-bold"
          @click="generate"
        >{{ generating ? '判定中…' : '產生中獎名單' }}</UButton>
      </div>
    </section>

    <!-- ── 名單結果 ─────────────────────────────── -->
    <section v-if="generated" class="mt-4 animate-pop-in">
      <div class="card p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-black">{{ week.label }} 中獎名單</h3>
            <p class="mt-0.5 text-xs text-ink-soft">
              共 {{ winners.length }} 筆 ‧ 其中 {{ physicalCount }} 筆為實體獎品需寄送
            </p>
          </div>
          <button
            class="inline-flex shrink-0 items-center gap-1 rounded-full bg-moss-500 px-3.5 py-1.5 text-xs font-bold text-white"
            @click="exportWinners"
          ><UIcon name="i-lucide-download" class="size-3.5" />匯出 Excel</button>
        </div>

        <div class="mt-3.5 overflow-x-auto">
          <table class="w-full min-w-[600px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">#</th>
                <th class="py-2 pr-3 font-bold">姓名</th>
                <th class="py-2 pr-3 font-bold">信箱</th>
                <th class="py-2 pr-3 font-bold">身分</th>
                <th class="py-2 pr-3 text-right font-bold">累積點數</th>
                <th class="py-2 pr-3 text-right font-bold">抽獎次數</th>
                <th class="py-2 pr-3 font-bold">獎項</th>
                <th class="py-2 font-bold">寄送地址</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in winners" :key="w.no" class="border-b border-paper-deep">
                <td class="py-2 pr-3 tabular-nums text-ink-faint">{{ w.no }}</td>
                <td class="py-2 pr-3 font-bold">{{ w.name }}</td>
                <td class="py-2 pr-3 text-ink-soft">{{ w.email }}</td>
                <td class="py-2 pr-3">
                  <span
                    class="chip"
                    :class="w.identity === 'local' ? 'bg-moss-100 text-moss-700' : 'bg-sky-100 text-sky-700'"
                  >{{ w.identity === 'local' ? '在地' : '外地' }}</span>
                </td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(w.points) }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ w.draws }}</td>
                <td class="py-2 pr-3">{{ w.prize }}</td>
                <td class="py-2 text-ink-soft">{{ w.address }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-3 rounded-2xl bg-marigold-50 px-3 py-2.5 text-[11px] leading-relaxed text-marigold-700">
          名單僅供人工開獎與寄送作業使用。系統不含自動開獎、獎品庫存管理與自動通知；地址為會員註冊時填寫，寄送前請人工複核。
        </p>
      </div>
    </section>

    <!-- ── 歷史週次 ─────────────────────────────── -->
    <section class="mt-4">
      <div class="card p-4">
        <h3 class="font-black">各週抽獎統計</h3>
        <div class="mt-3 overflow-x-auto">
          <table class="w-full min-w-[420px] text-xs">
            <thead>
              <tr class="border-b-2 border-paper-deep text-left text-ink-soft">
                <th class="py-2 pr-3 font-bold">週次</th>
                <th class="py-2 pr-3 font-bold">開獎日</th>
                <th class="py-2 pr-3 text-right font-bold">具資格人數</th>
                <th class="py-2 pr-3 text-right font-bold">總次數</th>
                <th class="py-2 font-bold">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in LOTTERY_WEEKS" :key="w.id" class="border-b border-paper-deep">
                <td class="py-2 pr-3 font-bold">{{ w.label }}</td>
                <td class="py-2 pr-3 text-ink-soft">{{ w.drawDate }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(w.eligible) }}</td>
                <td class="py-2 pr-3 text-right tabular-nums">{{ toComma(w.entries) }}</td>
                <td class="py-2">
                  <span
                    class="chip"
                    :class="{
                      'bg-moss-100 text-moss-700': w.status === 'open',
                      'bg-paper-deep text-ink-faint': w.status === 'drawn',
                      'bg-sky-100 text-sky-700': w.status === 'upcoming'
                    }"
                  >{{ w.status === 'open' ? '進行中' : w.status === 'drawn' ? '已開獎' : '尚未開始' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
