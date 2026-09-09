/**
 * 後台管理／報表的示意資料。
 * 數字為模擬值，但彼此對得起來（漏斗遞減、週資料加總＝累計）。
 */

export interface WeekPoint {
  week: string
  /** LINE 官方帳號好友累計 */
  friends: number
  /** 會員數累計 */
  members: number
  /** 當週發券金額（元） */
  issued: number
  /** 當週核銷金額（元） */
  redeemed: number
}

export const WEEKLY: WeekPoint[] = [
  { week: 'W1', friends: 4200, members: 2800, issued: 620000, redeemed: 210000 },
  { week: 'W2', friends: 8100, members: 5900, issued: 840000, redeemed: 430000 },
  { week: 'W3', friends: 11800, members: 8700, issued: 1020000, redeemed: 610000 },
  { week: 'W4', friends: 15200, members: 11300, issued: 1180000, redeemed: 720000 },
  { week: 'W5', friends: 18100, members: 13600, issued: 1250000, redeemed: 780000 },
  { week: 'W6', friends: 20900, members: 15800, issued: 1160000, redeemed: 760000 },
  { week: 'W7', friends: 23100, members: 17300, issued: 1080000, redeemed: 800000 },
  { week: 'W8', friends: 24860, members: 18420, issued: 927500, redeemed: 702250 }
]

/** 參與漏斗，逐級遞減 */
export const FUNNEL = [
  { label: '加 LINE 好友', value: 24860 },
  { label: '完成會員註冊', value: 18420 },
  { label: '首次景點打卡', value: 14205 },
  { label: '完成第一段領券', value: 11380 },
  { label: '完成三段領滿', value: 6240 },
  { label: '實際使用優惠券', value: 5180 }
]

/** 景點打卡次數 TOP 8 */
export const SPOT_RANK = [
  { name: '北港朝天宮商圈', type: 'experience' as const, count: 9840 },
  { name: '虎尾糖廠冰城', type: 'experience' as const, count: 8720 },
  { name: '北港女兒橋', type: 'highlight' as const, count: 8150 },
  { name: '虎尾鐵橋', type: 'highlight' as const, count: 7460 },
  { name: '西螺延平老街', type: 'experience' as const, count: 6980 },
  { name: '古坑華山咖啡園區', type: 'experience' as const, count: 5410 },
  { name: '成龍濕地', type: 'highlight' as const, count: 4870 },
  { name: '五元二角綠廊', type: 'highlight' as const, count: 4120 }
]

export interface StoreRow {
  id: string
  name: string
  taxId: string
  town: string
  count: number
  amount: number
  /** 異常偵測：短時間大量或集中核銷 */
  flagged: boolean
}

export const STORES: StoreRow[] = [
  { id: 's1', name: '北港圓仔湯老店', taxId: '54327891', town: '北港鎮', count: 412, amount: 118500, flagged: false },
  { id: 's2', name: '西螺丸莊醬油', taxId: '21458003', town: '西螺鎮', count: 388, amount: 132000, flagged: false },
  { id: 's3', name: '虎尾魷魚嘴羹', taxId: '78120456', town: '虎尾鎮', count: 356, amount: 96750, flagged: false },
  { id: 's4', name: '華山觀景咖啡', taxId: '33901287', town: '古坑鄉', count: 341, amount: 145250, flagged: true },
  { id: 's5', name: '口湖烏魚子專賣', taxId: '65482210', town: '口湖鄉', count: 297, amount: 128000, flagged: false },
  { id: 's6', name: '斗六太平old街屋', taxId: '90223145', town: '斗六市', count: 264, amount: 79500, flagged: false },
  { id: 's7', name: '台西蚵嗲本舖', taxId: '11785624', town: '台西鄉', count: 231, amount: 62250, flagged: true },
  { id: 's8', name: '水林番薯會社', taxId: '44098317', town: '水林鄉', count: 208, amount: 58000, flagged: false }
]

export interface MemberRow {
  id: string
  name: string
  phone: string
  identity: 'local' | 'visitor'
  stages: 0 | 1 | 2 | 3
  issued: number
  used: number
  /** 一人一帳號控管：門號／身分證去重命中 */
  dupFlag: boolean
}

export const MEMBERS: MemberRow[] = [
  { id: 'm1', name: '王＊雲', phone: '0912-***-678', identity: 'visitor', stages: 3, issued: 1000, used: 750, dupFlag: false },
  { id: 'm2', name: '陳＊華', phone: '0933-***-201', identity: 'local', stages: 2, issued: 500, used: 500, dupFlag: false },
  { id: 'm3', name: '林＊文', phone: '0955-***-843', identity: 'visitor', stages: 3, issued: 1000, used: 1000, dupFlag: false },
  { id: 'm4', name: '黃＊婷', phone: '0987-***-115', identity: 'visitor', stages: 1, issued: 250, used: 0, dupFlag: true },
  { id: 'm5', name: '張＊豪', phone: '0921-***-390', identity: 'local', stages: 0, issued: 0, used: 0, dupFlag: false },
  { id: 'm6', name: '李＊芳', phone: '0966-***-724', identity: 'visitor', stages: 2, issued: 500, used: 250, dupFlag: false }
]

export function useAdmin() {
  const totalIssued = computed(() => WEEKLY.reduce((s, w) => s + w.issued, 0))
  const totalRedeemed = computed(() => WEEKLY.reduce((s, w) => s + w.redeemed, 0))
  const redeemRate = computed(() => (totalRedeemed.value / totalIssued.value) * 100)
  const latest = computed(() => WEEKLY[WEEKLY.length - 1])

  /** 主辦（縣府）為唯讀，本公司為管理權限 */
  const role = useState<'organizer' | 'operator'>('adminRole', () => 'operator')
  const canEdit = computed(() => role.value === 'operator')

  return { totalIssued, totalRedeemed, redeemRate, latest, role, canEdit, weekly: WEEKLY }
}

/**
 * 匯出 CSV（Excel 可直接開啟）。
 * 前置 BOM，否則 Excel 會把中文判成亂碼。
 */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** 金額縮寫：1250000 → 125.0 萬 */
export function toWan(n: number, digits = 1) {
  return `${(n / 10000).toFixed(digits)} 萬`
}

export function toComma(n: number) {
  return n.toLocaleString('en-US')
}
