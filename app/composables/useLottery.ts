/**
 * 加碼抽獎（輕量）。
 * 依建議書：系統僅負責抽獎資格判定與中獎名單生成匯出，
 * 實際開獎與獎品寄送為人工作業。
 */

export interface Prize {
  id: string
  name: string
  qty: number
  icon: string
  /** 實體獎品需寄送，用以引導填寫真實地址 */
  physical: boolean
}

export interface LotteryWeek {
  id: string
  label: string
  drawDate: string
  status: 'drawn' | 'open' | 'upcoming'
  /** 該週具資格人數 */
  eligible: number
  /** 該週總抽獎次數（資格加權後） */
  entries: number
  prizes: Prize[]
}

/** 在地／外地差別化僅反映於加碼抽獎次數 */
export const ENTRY_RULE = {
  visitor: 3,
  local: 1
} as const

export const LOTTERY_WEEKS: LotteryWeek[] = [
  {
    id: 'w4',
    label: '第 4 週',
    drawDate: '2026.09.28',
    status: 'open',
    eligible: 8420,
    entries: 21360,
    prizes: [
      { id: 'p1', name: '掃地機器人', qty: 1, icon: 'i-lucide-bot', physical: true },
      { id: 'p2', name: '雲林良品禮盒', qty: 20, icon: 'i-lucide-gift', physical: true },
      { id: 'p3', name: '和泰租車折抵券', qty: 50, icon: 'i-lucide-car', physical: false }
    ]
  },
  {
    id: 'w3',
    label: '第 3 週',
    drawDate: '2026.09.21',
    status: 'drawn',
    eligible: 6980,
    entries: 17640,
    prizes: [
      { id: 'p4', name: '平板電腦', qty: 1, icon: 'i-lucide-tablet', physical: true },
      { id: 'p5', name: '雲林良品禮盒', qty: 20, icon: 'i-lucide-gift', physical: true }
    ]
  },
  {
    id: 'w5',
    label: '第 5 週',
    drawDate: '2026.10.05',
    status: 'upcoming',
    eligible: 0,
    entries: 0,
    prizes: [
      { id: 'p6', name: '氣炸鍋', qty: 2, icon: 'i-lucide-cooking-pot', physical: true },
      { id: 'p7', name: '商圈通用禮券', qty: 100, icon: 'i-lucide-ticket', physical: true }
    ]
  }
]

export function useLottery() {
  const { member, completedStages } = useCampaign()

  /** 每完成一段任務取得一次抽獎資格，依身分加權 */
  const perStage = computed(() => ENTRY_RULE[member.value.identity])
  const myEntries = computed(() => completedStages.value * perStage.value)

  const currentWeek = computed(() => LOTTERY_WEEKS.find((w) => w.status === 'open')!)

  return { perStage, myEntries, currentWeek, weeks: LOTTERY_WEEKS }
}
