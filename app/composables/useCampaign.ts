/**
 * 活動核心狀態 —— 示意用假資料層。
 * 之後接上真實 API 時，只需替換這裡的讀寫，畫面不用動。
 */

export type SpotType = 'red' | 'green'

export interface Spot {
  id: string
  name: string
  town: string
  type: SpotType
  /** 紅點的現場消費門檻（元）；綠點為 0 */
  threshold: number
  desc: string
  /** 距離使用者多遠（示意）*/
  distanceKm: number
  lat: number
  lng: number
  icon: string
  /** 圖庫示意照，正式上線請替換為實際景點照片 */
  photo: string
  /** 在示意地圖上的位置（%），mobile 直式地圖用 */
  mapX: number
  mapY: number
}

export interface Coupon {
  id: string
  /** 面額 */
  value: 250 | 500
  status: 'unused' | 'used' | 'expired'
  /** 由第幾段任務發出 */
  stage: 1 | 2 | 3
  code: string
  issuedAt: string
  expiresAt: string
  usedAt?: string
  usedStore?: string
}

/** 紅點 10 組：可消費景點 */
export const RED_SPOTS: Spot[] = [
  { id: 'r1', name: '北港朝天宮商圈', town: '北港鎮', type: 'red', threshold: 300, desc: '三百年香火與廟口小吃一條街', distanceKm: 2.4, lat: 23.5748, lng: 120.3038, icon: 'i-lucide-landmark', photo: '/images/spots/r1.jpg', mapX: 30, mapY: 62 },
  { id: 'r2', name: '西螺延平老街', town: '西螺鎮', type: 'red', threshold: 300, desc: '巴洛克街屋與百年醬油老鋪', distanceKm: 12.8, lat: 23.7986, lng: 120.4658, icon: 'i-lucide-building-2', photo: '/images/spots/r2.jpg', mapX: 58, mapY: 18 },
  { id: 'r3', name: '虎尾糖廠冰城', town: '虎尾鎮', type: 'red', threshold: 300, desc: '日治製糖遺構，必吃古早味冰棒', distanceKm: 8.1, lat: 23.7079, lng: 120.4436, icon: 'i-lucide-ice-cream-cone', photo: '/images/spots/r3.jpg', mapX: 52, mapY: 40 },
  { id: 'r4', name: '古坑華山咖啡園區', town: '古坑鄉', type: 'red', threshold: 300, desc: '台灣咖啡原鄉，山景配一杯手沖', distanceKm: 24.6, lat: 23.6229, lng: 120.6236, icon: 'i-lucide-coffee', photo: '/images/spots/r4.jpg', mapX: 84, mapY: 55 },
  { id: 'r5', name: '口湖遊客中心', town: '口湖鄉', type: 'red', threshold: 300, desc: '烏魚子與在地海產伴手禮', distanceKm: 18.3, lat: 23.5556, lng: 120.1886, icon: 'i-lucide-fish', photo: '/images/spots/r5.jpg', mapX: 14, mapY: 70 },
  { id: 'r6', name: '台西海口生活館', town: '台西鄉', type: 'red', threshold: 300, desc: '蚵貝彩繪與現撈海鮮餐桌', distanceKm: 21.5, lat: 23.7028, lng: 120.1958, icon: 'i-lucide-shell', photo: '/images/spots/r6.jpg', mapX: 12, mapY: 44 },
  { id: 'r7', name: '斗六太平老街', town: '斗六市', type: 'red', threshold: 300, desc: '整排洋樓立面，夜市小吃集散', distanceKm: 15.2, lat: 23.7118, lng: 120.5426, icon: 'i-lucide-store', photo: '/images/spots/r7.jpg', mapX: 72, mapY: 38 },
  { id: 'r8', name: '劍湖山世界', town: '古坑鄉', type: 'red', threshold: 300, desc: '摩天輪與親子遊樂設施', distanceKm: 26.9, lat: 23.6338, lng: 120.5883, icon: 'i-lucide-ferris-wheel', photo: '/images/spots/r8.jpg', mapX: 80, mapY: 62 },
  { id: 'r9', name: '興隆毛巾觀光工廠', town: '虎尾鎮', type: 'red', threshold: 300, desc: '毛巾蛋糕 DIY，把伴手禮捲回家', distanceKm: 9.7, lat: 23.7305, lng: 120.3803, icon: 'i-lucide-factory', photo: '/images/spots/r9.jpg', mapX: 44, mapY: 33 },
  { id: 'r10', name: '水林番薯會社', town: '水林鄉', type: 'red', threshold: 300, desc: '地瓜之鄉，現烤蜜番薯', distanceKm: 6.5, lat: 23.5722, lng: 120.2431, icon: 'i-lucide-sprout', photo: '/images/spots/r10.jpg', mapX: 22, mapY: 66 }
]

/** 綠點 10 組：不可消費，拍照打卡即完成 */
export const GREEN_SPOTS: Spot[] = [
  { id: 'g1', name: '成龍濕地', town: '口湖鄉', type: 'green', threshold: 0, desc: '國際環境藝術節的水上裝置', distanceKm: 17.2, lat: 23.5183, lng: 120.1719, icon: 'i-lucide-bird', photo: '/images/spots/g1.jpg', mapX: 10, mapY: 78 },
  { id: 'g2', name: '虎尾鐵橋', town: '虎尾鎮', type: 'green', threshold: 0, desc: '橫跨虎尾溪的百年糖鐵橋', distanceKm: 8.4, lat: 23.7095, lng: 120.4392, icon: 'i-lucide-train-front', photo: '/images/spots/g2.jpg', mapX: 55, mapY: 44 },
  { id: 'g3', name: '草嶺石壁森林步道', town: '古坑鄉', type: 'green', threshold: 0, desc: '雲嘉南最高柳杉林與雲海', distanceKm: 42.1, lat: 23.5333, lng: 120.7042, icon: 'i-lucide-trees', photo: '/images/spots/g3.jpg', mapX: 90, mapY: 78 },
  { id: 'g4', name: '五元二角綠廊', town: '古坑鄉', type: 'green', threshold: 0, desc: '竹編涼亭串起的社區綠廊', distanceKm: 23.4, lat: 23.6408, lng: 120.5747, icon: 'i-lucide-leaf', photo: '/images/spots/g4.jpg', mapX: 78, mapY: 50 },
  { id: 'g5', name: '三條崙海水浴場', town: '四湖鄉', type: 'green', threshold: 0, desc: '西海岸落日與防風林', distanceKm: 19.8, lat: 23.6389, lng: 120.1636, icon: 'i-lucide-sunset', photo: '/images/spots/g5.jpg', mapX: 8, mapY: 58 },
  { id: 'g6', name: '濁水溪出海口', town: '麥寮鄉', type: 'green', threshold: 0, desc: '台灣最長河川的入海處', distanceKm: 28.6, lat: 23.8447, lng: 120.1608, icon: 'i-lucide-waves', photo: '/images/spots/g6.jpg', mapX: 16, mapY: 12 },
  { id: 'g7', name: '湖山水庫', town: '斗六市', type: 'green', threshold: 0, desc: '環湖步道與壩頂展望台', distanceKm: 20.5, lat: 23.6931, lng: 120.6083, icon: 'i-lucide-droplets', photo: '/images/spots/g7.jpg', mapX: 86, mapY: 40 },
  { id: 'g8', name: '北港女兒橋', town: '北港鎮', type: 'green', threshold: 0, desc: '糖鐵改建，夜間點燈超好拍', distanceKm: 2.9, lat: 23.5761, lng: 120.2986, icon: 'i-lucide-rainbow', photo: '/images/spots/g8.jpg', mapX: 28, mapY: 56 },
  { id: 'g9', name: '頂溪彩繪社區', town: '虎尾鎮', type: 'green', threshold: 0, desc: '屋牆上的貓咪彩繪小村', distanceKm: 11.3, lat: 23.7286, lng: 120.4694, icon: 'i-lucide-palette', photo: '/images/spots/g9.jpg', mapX: 62, mapY: 30 },
  { id: 'g10', name: '樟湖茶園步道', town: '古坑鄉', type: 'green', threshold: 0, desc: '梯田茶園與山嵐早晨', distanceKm: 38.7, lat: 23.5619, lng: 120.6653, icon: 'i-lucide-mountain', photo: '/images/spots/g10.jpg', mapX: 88, mapY: 68 }
]

export const ALL_SPOTS: Spot[] = [...RED_SPOTS, ...GREEN_SPOTS]

/** 三段任務的獎勵設定：段 1、2 各 250，段 3 為 500，每人上限 1,000 */
export const STAGES = [
  { stage: 1 as const, value: 250 as const, label: '第一段' },
  { stage: 2 as const, value: 250 as const, label: '第二段' },
  { stage: 3 as const, value: 500 as const, label: '第三段' }
]

export const CAMPAIGN = {
  title: '捲動國旅',
  subtitle: '台灣觀光 100 亮點',
  county: '雲林縣',
  partner: '和泰汽車',
  startDate: '2026.09.01',
  endDate: '2026.10.31',
  /** 券最低消費門檻，250／500 皆同 */
  minSpend: 300,
  /** 每人折價券上限 */
  quota: 1000,
  /** 發券後有效天數 */
  couponValidDays: 30,
  storeCount: 100
}

export function useCampaign() {
  /**
   * 登入狀態。首頁與景點、店家、抽獎辦法皆為公開內容；
   * 任務進度、券包、核銷與抽獎紀錄等個人資料一律要登入後才顯示。
   *
   * 用 cookie 而非 useState 保存：useState 只活在單次頁面載入，
   * 重新整理就會被登出；cookie 同時讓 SSR 就知道登入狀態，不會有 hydration 落差。
   */
  const isLoggedIn = useCookie<boolean>('yl_logged_in', {
    default: () => false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  /** 會員資料（示意） */
  const member = useState('member', () => ({
    name: '王小雲',
    phone: '0912-345-678',
    /** local：在地　visitor：外地 */
    identity: 'visitor' as 'local' | 'visitor',
    lineBound: true,
    avatar: 'i-lucide-user-round'
  }))

  /** 已打卡的景點 id（同景點僅計一次） */
  const checkedIn = useState<string[]>('checkedIn', () => ['r1', 'g8', 'r3'])

  /** 已持有的折價券 */
  const coupons = useState<Coupon[]>('coupons', () => [
    {
      id: 'c1',
      value: 250,
      status: 'unused',
      stage: 1,
      code: 'YL26-250-8FK2',
      issuedAt: '2026.09.12',
      expiresAt: '2026.10.12'
    }
  ])

  const checkedRed = computed(() =>
    checkedIn.value.filter((id) => RED_SPOTS.some((s) => s.id === id))
  )
  const checkedGreen = computed(() =>
    checkedIn.value.filter((id) => GREEN_SPOTS.some((s) => s.id === id))
  )

  /** 一紅一綠為一組，最多三段 */
  const completedStages = computed(() =>
    Math.min(checkedRed.value.length, checkedGreen.value.length, 3)
  )

  /** 下一段還缺什麼 */
  const nextNeed = computed(() => {
    if (completedStages.value >= 3) return null
    const r = checkedRed.value.length
    const g = checkedGreen.value.length
    return {
      stage: (completedStages.value + 1) as 1 | 2 | 3,
      needRed: Math.max(0, completedStages.value + 1 - r),
      needGreen: Math.max(0, completedStages.value + 1 - g),
      reward: STAGES[completedStages.value].value
    }
  })

  const earnedAmount = computed(() =>
    STAGES.slice(0, completedStages.value).reduce((sum, s) => sum + s.value, 0)
  )

  const walletAmount = computed(() =>
    coupons.value.filter((c) => c.status === 'unused').reduce((s, c) => s + c.value, 0)
  )

  const isCheckedIn = (id: string) => checkedIn.value.includes(id)

  const spotById = (id: string) => ALL_SPOTS.find((s) => s.id === id)

  /**
   * 打卡：擷取經緯度 + 綁定會員 + 去重。
   * 回傳這次打卡是否剛好觸發新的一段任務（用來跳出「券入袋」畫面）。
   */
  function checkIn(id: string) {
    const before = completedStages.value
    if (!checkedIn.value.includes(id)) checkedIn.value.push(id)
    const after = completedStages.value
    if (after > before) {
      const stageInfo = STAGES[after - 1]
      const coupon: Coupon = {
        id: `c${coupons.value.length + 1}`,
        value: stageInfo.value,
        status: 'unused',
        stage: stageInfo.stage,
        code: `YL26-${stageInfo.value}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        issuedAt: '2026.09.20',
        expiresAt: '2026.10.20'
      }
      coupons.value.push(coupon)
      return { newStage: after, coupon }
    }
    return { newStage: null, coupon: null }
  }

  function resetDemo() {
    checkedIn.value = []
    coupons.value = []
  }

  function login() {
    isLoggedIn.value = true
  }

  function logout() {
    isLoggedIn.value = false
  }

  return {
    isLoggedIn,
    login,
    logout,
    member,
    checkedIn,
    coupons,
    checkedRed,
    checkedGreen,
    completedStages,
    nextNeed,
    earnedAmount,
    walletAmount,
    isCheckedIn,
    spotById,
    checkIn,
    resetDemo
  }
}
