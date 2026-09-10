/**
 * 活動核心狀態 —— 示意用假資料層。
 * 之後接上真實 API 時，只需替換這裡的讀寫，畫面不用動。
 */

/**
 * 站點類型。原本是「紅點／綠點」，改成遊樂路線之後不再用顏色分類，
 * 沿用 docx 更新內容自己的語彙（食農體驗／100 亮點）改成功能導向的兩型。
 */
export type SpotType = 'experience' | 'highlight'

/**
 * ⚠️ 站點類型的所有對外呈現集中在這裡 —— 名稱、說明、圖示、配色。
 * 命名還沒定案，之後要把「體驗站」改成別的叫法，改這一個物件全站就同步，
 * 不必再去八支檔案裡追 `type === 'red' ? '紅點' : '綠點'` 這種三元式。
 */
export const SPOT_KIND = {
  experience: {
    label: '體驗站',
    short: '消費滿 300',
    desc: '老街、商圈、觀光工廠與食農食漁體驗，於現場消費後掃碼完成。',
    icon: 'i-lucide-utensils',
    pin: 'bg-vermilion-500',
    dot: 'bg-vermilion-500',
    chip: 'bg-vermilion-100 text-vermilion-700',
    soft: 'bg-vermilion-50 text-vermilion-600'
  },
  highlight: {
    label: '亮點站',
    short: '拍照打卡',
    desc: '濕地、步道、風景區與公共亮點，拍照打卡或直接掃碼即可完成。',
    icon: 'i-lucide-camera',
    pin: 'bg-moss-500',
    dot: 'bg-moss-500',
    chip: 'bg-moss-100 text-moss-700',
    soft: 'bg-moss-50 text-moss-600'
  }
} as const

export const kindOf = (t: SpotType) => SPOT_KIND[t]

export interface Spot {
  id: string
  name: string
  town: string
  type: SpotType
  /** 體驗站的現場消費門檻（元）；亮點站為 0 */
  threshold: number
  desc: string
  /** 距離使用者多遠（示意）*/
  distanceKm: number
  lat: number
  lng: number
  icon: string
  /** 圖庫示意照，正式上線請替換為實際景點照片 */
  photo: string
  /**
   * 水彩插圖（來自和泰主視覺素材），用於護照的印章格。
   * 與 icon 併存：icon 是小尺寸與地圖用的線性圖示，art 是有溫度的手繪版本。
   */
  art: string
  /** 在示意地圖上的位置（%），mobile 直式地圖用 */
  mapX: number
  mapY: number
  /**
   * 現場是否設有實體 QR code。步道、濕地、出海口這類開放場域沒有立牌可掛，
   * 標為 false 之後前端只提供定位打卡。未填視為 true。
   */
  hasQr?: boolean
  /**
   * 定位判定半徑（公尺）。未填用 CAMPAIGN.geoRadiusM。
   * 步道、濕地、農業區這種「面」而不是「點」的場域要放大，否則旅客站在園區裡也判定不到。
   */
  radiusM?: number
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

/** 體驗站：可消費，須於現場消費滿門檻金額 */
export const EXPERIENCE_SPOTS: Spot[] = [
  { id: 'r1', name: '北港朝天宮商圈', town: '北港鎮', type: 'experience', threshold: 300, desc: '三百年香火與廟口小吃一條街', distanceKm: 2.4, lat: 23.5748, lng: 120.3038, icon: 'i-lucide-landmark', photo: '/images/spots/r1.jpg', art: '/images/art/temple.webp', mapX: 30, mapY: 62 },
  { id: 'r2', name: '西螺延平老街', town: '西螺鎮', type: 'experience', threshold: 300, desc: '巴洛克街屋與百年醬油老鋪', distanceKm: 12.8, lat: 23.7986, lng: 120.4658, icon: 'i-lucide-building-2', photo: '/images/spots/r2.jpg', art: '/images/art/village.webp', mapX: 58, mapY: 18 },
  { id: 'r3', name: '虎尾糖廠冰城', town: '虎尾鎮', type: 'experience', threshold: 300, desc: '日治製糖遺構，必吃古早味冰棒', distanceKm: 8.1, lat: 23.7079, lng: 120.4436, icon: 'i-lucide-ice-cream-cone', photo: '/images/spots/r3.jpg', art: '/images/art/cake.webp', mapX: 52, mapY: 40 },
  { id: 'r4', name: '古坑華山咖啡園區', town: '古坑鄉', type: 'experience', threshold: 300, desc: '台灣咖啡原鄉，山景配一杯手沖', distanceKm: 24.6, lat: 23.6229, lng: 120.6236, icon: 'i-lucide-coffee', photo: '/images/spots/r4.jpg', art: '/images/art/coffee.webp', mapX: 84, mapY: 55 },
  { id: 'r5', name: '口湖遊客中心', town: '口湖鄉', type: 'experience', threshold: 300, desc: '烏魚子與在地海產伴手禮', distanceKm: 18.3, lat: 23.5556, lng: 120.1886, icon: 'i-lucide-fish', photo: '/images/spots/r5.jpg', art: '/images/art/seafood-plate.webp', mapX: 14, mapY: 70 },
  { id: 'r6', name: '台西海口生活館', town: '台西鄉', type: 'experience', threshold: 300, desc: '蚵貝彩繪與現撈海鮮餐桌', distanceKm: 21.5, lat: 23.7028, lng: 120.1958, icon: 'i-lucide-shell', photo: '/images/spots/r6.jpg', art: '/images/art/clam-bowl.webp', mapX: 12, mapY: 44 },
  { id: 'r7', name: '斗六太平老街', town: '斗六市', type: 'experience', threshold: 300, desc: '整排洋樓立面，夜市小吃集散', distanceKm: 15.2, lat: 23.7118, lng: 120.5426, icon: 'i-lucide-store', photo: '/images/spots/r7.jpg', art: '/images/art/village.webp', mapX: 72, mapY: 38 },
  { id: 'r8', name: '劍湖山世界', town: '古坑鄉', type: 'experience', threshold: 300, desc: '摩天輪與親子遊樂設施', distanceKm: 26.9, lat: 23.6338, lng: 120.5883, icon: 'i-lucide-ferris-wheel', photo: '/images/spots/r8.jpg', art: '/images/art/kids-run.webp', mapX: 80, mapY: 62 },
  { id: 'r9', name: '興隆毛巾觀光工廠', town: '虎尾鎮', type: 'experience', threshold: 300, desc: '毛巾蛋糕 DIY，把伴手禮捲回家', distanceKm: 9.7, lat: 23.7305, lng: 120.3803, icon: 'i-lucide-factory', photo: '/images/spots/r9.jpg', art: '/images/art/farmhouse.webp', mapX: 44, mapY: 33 },
  { id: 'r10', name: '水林番薯會社', town: '水林鄉', type: 'experience', threshold: 300, desc: '地瓜之鄉，現烤蜜番薯', distanceKm: 6.5, lat: 23.5722, lng: 120.2431, icon: 'i-lucide-sprout', photo: '/images/spots/r10.jpg', art: '/images/art/veggie-basket.webp', mapX: 22, mapY: 66 },

  // ── 以下八站來自《亮點100新玩法更新內容_0828》的首推二日遊行程 ──
  // ⚠️ 座標與照片為示意值：照片先借用同類型的既有圖庫圖，正式上線前必須換成實拍。
  { id: 'n1', name: '台灣鯛生態創意園區', town: '口湖鄉', type: 'experience', threshold: 300, desc: '認識台灣鯛的養殖與加工，食魚教育體驗', distanceKm: 19.4, lat: 23.5836, lng: 120.1889, icon: 'i-lucide-fish', photo: '/images/spots/r5.jpg', art: '/images/art/boat.webp', mapX: 15, mapY: 72 },
  { id: 'n2', name: '馬蹄蛤主題館', town: '水林鄉', type: 'experience', threshold: 300, desc: '下水摸馬蹄蛤，親子最愛的體驗池', distanceKm: 16.8, lat: 23.5539, lng: 120.2069, icon: 'i-lucide-shell', photo: '/images/spots/r6.jpg', art: '/images/art/clam-bowl.webp', mapX: 18, mapY: 74 },
  { id: 'n5', name: '鵝童樂園', town: '東勢鄉', type: 'experience', threshold: 300, desc: '鵝媽媽觀光工廠改建的親子樂園', distanceKm: 13.6, lat: 23.6889, lng: 120.2569, icon: 'i-lucide-ferris-wheel', photo: '/images/spots/r8.jpg', art: '/images/art/kids-run.webp', mapX: 24, mapY: 48 },
  { id: 'n7', name: '綠金蕃茄南瓜農場', town: '斗六市', type: 'experience', threshold: 300, desc: '溫室採果，認識瓜果從開花到收成', distanceKm: 17.9, lat: 23.7003, lng: 120.5502, icon: 'i-lucide-leaf', photo: '/images/spots/r10.jpg', art: '/images/art/veggie-basket.webp', mapX: 70, mapY: 34 },
  { id: 'n8', name: '奶奶的熊毛巾故事館', town: '虎尾鎮', type: 'experience', threshold: 300, desc: '毛巾玩偶 DIY 與觀光工廠導覽', distanceKm: 10.2, lat: 23.7218, lng: 120.4391, icon: 'i-lucide-factory', photo: '/images/spots/r9.jpg', art: '/images/art/farmhouse.webp', mapX: 48, mapY: 36 }
]

/** 亮點站：不可消費，拍照打卡即完成 */
export const HIGHLIGHT_SPOTS: Spot[] = [
  { id: 'g1', name: '成龍濕地', town: '口湖鄉', type: 'highlight', threshold: 0, desc: '國際環境藝術節的水上裝置', distanceKm: 17.2, lat: 23.5183, lng: 120.1719, icon: 'i-lucide-bird', photo: '/images/spots/g1.jpg', art: '/images/art/paddy.webp', mapX: 10, mapY: 78 },
  { id: 'g2', name: '虎尾鐵橋', town: '虎尾鎮', type: 'highlight', threshold: 0, desc: '橫跨虎尾溪的百年糖鐵橋', distanceKm: 8.4, lat: 23.7095, lng: 120.4392, icon: 'i-lucide-train-front', photo: '/images/spots/g2.jpg', art: '/images/art/farmhouse.webp', mapX: 55, mapY: 44 },
  { id: 'g3', name: '草嶺石壁森林步道', town: '古坑鄉', type: 'highlight', threshold: 0, desc: '雲嘉南最高柳杉林與雲海', distanceKm: 42.1, lat: 23.5333, lng: 120.7042, icon: 'i-lucide-trees', photo: '/images/spots/g3.jpg', art: '/images/art/grove.webp', mapX: 90, mapY: 78, hasQr: false, radiusM: 600 },
  { id: 'g4', name: '五元二角綠廊', town: '古坑鄉', type: 'highlight', threshold: 0, desc: '竹編涼亭串起的社區綠廊', distanceKm: 23.4, lat: 23.6408, lng: 120.5747, icon: 'i-lucide-leaf', photo: '/images/spots/g4.jpg', art: '/images/art/tree-round.webp', mapX: 78, mapY: 50, hasQr: false, radiusM: 300 },
  { id: 'g5', name: '三條崙海水浴場', town: '四湖鄉', type: 'highlight', threshold: 0, desc: '西海岸落日與防風林', distanceKm: 19.8, lat: 23.6389, lng: 120.1636, icon: 'i-lucide-sunset', photo: '/images/spots/g5.jpg', art: '/images/art/sun.webp', mapX: 8, mapY: 58, hasQr: false, radiusM: 400 },
  { id: 'g6', name: '濁水溪出海口', town: '麥寮鄉', type: 'highlight', threshold: 0, desc: '台灣最長河川的入海處', distanceKm: 28.6, lat: 23.8447, lng: 120.1608, icon: 'i-lucide-waves', photo: '/images/spots/g6.jpg', art: '/images/art/boat.webp', mapX: 16, mapY: 12, hasQr: false, radiusM: 500 },
  { id: 'g7', name: '湖山水庫', town: '斗六市', type: 'highlight', threshold: 0, desc: '環湖步道與壩頂展望台', distanceKm: 20.5, lat: 23.6931, lng: 120.6083, icon: 'i-lucide-droplets', photo: '/images/spots/g7.jpg', art: '/images/art/paddy.webp', mapX: 86, mapY: 40, hasQr: false, radiusM: 500 },
  { id: 'g8', name: '北港女兒橋', town: '北港鎮', type: 'highlight', threshold: 0, desc: '糖鐵改建，夜間點燈超好拍', distanceKm: 2.9, lat: 23.5761, lng: 120.2986, icon: 'i-lucide-rainbow', photo: '/images/spots/g8.jpg', art: '/images/art/village.webp', mapX: 28, mapY: 56 },
  { id: 'g9', name: '頂溪彩繪社區', town: '虎尾鎮', type: 'highlight', threshold: 0, desc: '屋牆上的貓咪彩繪小村', distanceKm: 11.3, lat: 23.7286, lng: 120.4694, icon: 'i-lucide-palette', photo: '/images/spots/g9.jpg', art: '/images/art/farmhouse.webp', mapX: 62, mapY: 30 },
  { id: 'g10', name: '樟湖茶園步道', town: '古坑鄉', type: 'highlight', threshold: 0, desc: '梯田茶園與山嵐早晨', distanceKm: 38.7, lat: 23.5619, lng: 120.6653, icon: 'i-lucide-mountain', photo: '/images/spots/g10.jpg', art: '/images/art/hill-green.webp', mapX: 88, mapY: 68, hasQr: false, radiusM: 600 },

  // ── 同樣來自 0828 更新內容的首推行程；座標與照片為示意值 ──
  { id: 'n3', name: '金湖休閒農業區', town: '口湖鄉', type: 'highlight', threshold: 0, desc: '魚塭與濕地交界的農漁村風景', distanceKm: 20.1, lat: 23.5333, lng: 120.1667, icon: 'i-lucide-sprout', photo: '/images/spots/g5.jpg', art: '/images/art/oyster-rack.webp', mapX: 11, mapY: 74, hasQr: false, radiusM: 800 },
  { id: 'n4', name: '雲林溪藝文廊帶', town: '斗六市', type: 'highlight', threshold: 0, desc: '縣府主推的水岸光廊與街區彩繪', distanceKm: 15.8, lat: 23.7075, lng: 120.5439, icon: 'i-lucide-palette', photo: '/images/spots/g8.jpg', art: '/images/art/village.webp', mapX: 73, mapY: 36 },
  { id: 'n6', name: '膨鼠森林公園', town: '斗六市', type: 'highlight', threshold: 0, desc: '大型木製溜滑梯與森林系共融遊具', distanceKm: 16.2, lat: 23.7128, lng: 120.5478, icon: 'i-lucide-trees', photo: '/images/spots/g4.jpg', art: '/images/art/tree-pine.webp', mapX: 75, mapY: 33 }
]

export const ALL_SPOTS: Spot[] = [...EXPERIENCE_SPOTS, ...HIGHLIGHT_SPOTS]

/**
 * 遊樂路線 —— 取代原本「紅配綠湊組合」的心智模型。
 * 旅客先選一條路線，再照 A→B→C 走；站點類型只是路線裡每一站的角色。
 *
 * 第一條為《亮點100新玩法更新內容_0828》的首推親子二日遊，其餘四條依地理分區
 * 由既有站點組成。同一站可以出現在多條路線裡（行程本來就會重疊）。
 */
export interface RouteDay {
  label: string
  spotIds: string[]
}
export interface Route {
  id: string
  name: string
  /** 路線的代表插圖 */
  art: string
  /** 一句話的路線訴求 */
  tagline: string
  /** 完成整條路線可解鎖的成就名 */
  achievement: string
  icon: string
  days: RouteDay[]
  featured?: boolean
}

export const ROUTES: Route[] = [
  {
    id: 'nature',
    name: '自然探險二日遊',
    art: '/images/art/clam-bowl.webp',
    tagline: '從口湖魚塭、濕地一路玩到斗六農場與森林，邊吃邊玩邊認識雲林的海味與土地。',
    achievement: '海味探索',
    icon: 'i-lucide-fish',
    featured: true,
    days: [
      { label: 'DAY 1', spotIds: ['n1', 'r5', 'n2', 'g1', 'n3'] },
      { label: 'DAY 2', spotIds: ['n4', 'n5', 'n6', 'n7', 'n8'] }
    ]
  },
  {
    id: 'coast',
    name: '海線漁鄉線',
    art: '/images/art/boat.webp',
    tagline: '西海岸的落日、防風林與現撈海鮮，走一趟雲林最靠海的那一側。',
    achievement: '濕地觀察',
    icon: 'i-lucide-waves',
    days: [{ label: '一日行程', spotIds: ['g6', 'r6', 'g5', 'r5', 'g1', 'r10'] }]
  },
  {
    id: 'sugar',
    name: '糖鐵小鎮線',
    art: '/images/art/farmhouse.webp',
    tagline: '沿著百年糖業鐵道，從虎尾一路走到西螺的老街與醬油香。',
    achievement: '田野發現',
    icon: 'i-lucide-train-front',
    days: [{ label: '一日行程', spotIds: ['r3', 'g2', 'r9', 'g9', 'r2'] }]
  },
  {
    id: 'temple',
    name: '廟口香路線',
    art: '/images/art/temple.webp',
    tagline: '三百年香火的廟埕小吃，配上夜裡點燈的糖鐵舊橋。',
    achievement: '街區漫遊',
    icon: 'i-lucide-landmark',
    days: [{ label: '半日行程', spotIds: ['r1', 'g8', 'r10'] }]
  },
  {
    id: 'mountain',
    name: '山線茶咖線',
    art: '/images/art/coffee.webp',
    tagline: '台灣咖啡原鄉的山景手沖、雲海柳杉林與清晨的梯田茶園。',
    achievement: '山嵐漫遊',
    icon: 'i-lucide-mountain',
    days: [{ label: '二日行程', spotIds: ['r7', 'g7', 'r4', 'g4', 'r8', 'g3', 'g10'] }]
  }
]

/** 站點現場是否設有實體 QR code */
export const hasQr = (s: Spot) => s.hasQr !== false

/** 這個站點的定位判定半徑（公尺） */
export const radiusOf = (s: Spot) => s.radiusM ?? CAMPAIGN.geoRadiusM

/**
 * 兩組經緯度之間的距離（公尺），Haversine 公式。
 * 活動範圍只有一個縣，用球面近似綽綽有餘，不需要 Vincenty 那種橢球體算法。
 */
export function distanceM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** 距離的人話化：1 公里以下講公尺，以上講公里 */
export const readableDistance = (m: number) =>
  m < 1000 ? `${Math.round(m)} 公尺` : `${(m / 1000).toFixed(1)} 公里`

/** 路線上的所有站點（攤平、去重、保留順序） */
export const routeSpotIds = (r: Route) => [...new Set(r.days.flatMap((d) => d.spotIds))]

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
  /** 每人優惠券上限 */
  quota: 1000,
  /** 發券後有效天數 */
  couponValidDays: 30,
  /** 定位打卡的預設判定半徑（公尺）。站點可用 radiusM 個別覆寫。 */
  geoRadiusM: 150,
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
    email: 'demo@example.com',
    /** local：在地　visitor：外地 */
    identity: 'visitor' as 'local' | 'visitor',
    lineBound: true,
    avatar: 'i-lucide-user-round'
  }))

  /** 已打卡的景點 id（同景點僅計一次） */
  const checkedIn = useState<string[]>('checkedIn', () => ['r1', 'g8', 'r3'])

  /** 已持有的優惠券 */
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

  const checkedExperience = computed(() =>
    checkedIn.value.filter((id) => EXPERIENCE_SPOTS.some((s) => s.id === id))
  )
  const checkedHighlight = computed(() =>
    checkedIn.value.filter((id) => HIGHLIGHT_SPOTS.some((s) => s.id === id))
  )

  /** 一個體驗站 ＋ 一個亮點站為一組，最多三段 */
  const completedStages = computed(() =>
    Math.min(checkedExperience.value.length, checkedHighlight.value.length, 3)
  )

  /** 下一段還缺什麼 */
  const nextNeed = computed(() => {
    if (completedStages.value >= 3) return null
    const e = checkedExperience.value.length
    const h = checkedHighlight.value.length
    return {
      stage: (completedStages.value + 1) as 1 | 2 | 3,
      needExperience: Math.max(0, completedStages.value + 1 - e),
      needHighlight: Math.max(0, completedStages.value + 1 - h),
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

  /** 一條路線走了幾站 / 共幾站 */
  const routeProgress = (r: Route) => {
    const ids = routeSpotIds(r)
    return { done: ids.filter((id) => isCheckedIn(id)).length, total: ids.length }
  }

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
    checkedExperience,
    checkedHighlight,
    completedStages,
    nextNeed,
    earnedAmount,
    walletAmount,
    isCheckedIn,
    routeProgress,
    spotById,
    checkIn,
    resetDemo
  }
}
