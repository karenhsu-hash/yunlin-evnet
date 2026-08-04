/**
 * 會員系統 —— 註冊流程、LINE 綁定、會員中心紀錄。
 * 一樣是示意用假資料層，之後替換讀寫來源即可。
 */

export interface RegisterDraft {
  phone: string
  otp: string
  name: string
  email: string
  address: string
  idNo: string
  /** 註冊時強制選擇，並以通訊地址交叉判別 */
  identity: 'local' | 'visitor' | ''
  agreed: boolean
}

export interface RedeemRecord {
  id: string
  store: string
  town: string
  couponValue: 250 | 500
  spend: number
  at: string
}

export interface LotteryRecord {
  id: string
  week: string
  entries: number
  result: 'pending' | 'won' | 'lost'
  prize?: string
}

/** 註冊流程的步驟定義 */
export const REGISTER_STEPS = [
  { key: 'phone', label: '手機驗證', icon: 'i-lucide-smartphone' },
  { key: 'profile', label: '基本資料', icon: 'i-lucide-clipboard-pen' },
  { key: 'identity', label: '身分選擇', icon: 'i-lucide-compass' },
  { key: 'line', label: '綁定 LINE', icon: 'i-lucide-message-circle' }
] as const

export type RegisterStepKey = (typeof REGISTER_STEPS)[number]['key'] | 'done'

/** 雲林縣轄內鄉鎮市，用來與通訊地址交叉判別在地／外地 */
export const YUNLIN_TOWNS = [
  '斗六市', '斗南鎮', '虎尾鎮', '西螺鎮', '土庫鎮', '北港鎮',
  '古坑鄉', '大埤鄉', '莿桐鄉', '林內鄉', '二崙鄉', '崙背鄉',
  '麥寮鄉', '東勢鄉', '褒忠鄉', '台西鄉', '元長鄉', '四湖鄉',
  '口湖鄉', '水林鄉'
]

export function useMember() {
  const draft = useState<RegisterDraft>('registerDraft', () => ({
    phone: '',
    otp: '',
    name: '',
    email: '',
    address: '',
    idNo: '',
    identity: '',
    agreed: false
  }))

  /** 地址是否落在雲林縣內 —— 用於提示身分選擇與實際不符 */
  const addressInYunlin = computed(() => {
    const addr = draft.value.address
    if (!addr) return null
    return addr.includes('雲林') || YUNLIN_TOWNS.some((t) => addr.includes(t))
  })

  /** 交叉判別：選了「在地」但地址不在雲林，或反之，給出提醒 */
  const identityMismatch = computed(() => {
    if (!draft.value.identity || addressInYunlin.value === null) return false
    return (
      (draft.value.identity === 'local' && !addressInYunlin.value) ||
      (draft.value.identity === 'visitor' && addressInYunlin.value)
    )
  })

  const phoneValid = computed(() => /^09\d{2}-?\d{3}-?\d{3}$/.test(draft.value.phone.replace(/\s/g, '')))
  const otpValid = computed(() => draft.value.otp.length === 6)
  const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.value.email))
  const idNoValid = computed(() => /^[A-Za-z][12]\d{8}$/.test(draft.value.idNo))
  const profileValid = computed(
    () => draft.value.name.trim().length >= 2 && emailValid.value && draft.value.address.trim().length >= 6 && idNoValid.value
  )

  /** 會員中心：核銷紀錄 */
  const redeemRecords = useState<RedeemRecord[]>('redeemRecords', () => [
    { id: 'rr1', store: '北港圓仔湯老店', town: '北港鎮', couponValue: 250, spend: 420, at: '2026.09.20 14:51' },
    { id: 'rr2', store: '西螺丸莊醬油', town: '西螺鎮', couponValue: 250, spend: 680, at: '2026.09.14 11:08' }
  ])

  /** 會員中心：抽獎紀錄 */
  const lotteryRecords = useState<LotteryRecord[]>('lotteryRecords', () => [
    { id: 'lr1', week: '第 3 週', entries: 3, result: 'won', prize: '雲林良品禮盒' },
    { id: 'lr2', week: '第 2 週', entries: 3, result: 'lost' },
    { id: 'lr3', week: '第 1 週', entries: 3, result: 'lost' }
  ])

  function resetDraft() {
    draft.value = {
      phone: '', otp: '', name: '', email: '', address: '', idNo: '', identity: '', agreed: false
    }
  }

  return {
    draft,
    addressInYunlin,
    identityMismatch,
    phoneValid,
    otpValid,
    emailValid,
    idNoValid,
    profileValid,
    redeemRecords,
    lotteryRecords,
    resetDraft
  }
}
