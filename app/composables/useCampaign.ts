/**
 * 活動核心狀態 —— 示意用假資料層。
 * 之後接上真實 API 時，只需替換這裡的讀寫，畫面不用動。
 */

/**
 * 活動站點。
 *
 * 前兩版分別是「紅點／綠點」與「體驗站／亮點站」，都要求旅客湊站點類型、
 * 體驗站還得消費滿 300 才能打卡。2026-09 客戶要求簡化，改成會員等級制後取消分類：
 * 所有站點到現場就能蓋章，消費留在地改由「優惠券需消費滿 300」把關。
 */
export interface Spot {
  id: string
  name: string
  town: string
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
  /** 面額；由點數 1:1 兌換而來 */
  value: 250 | 500
  status: 'unused' | 'used' | 'expired'
  code: string
  issuedAt: string
  expiresAt: string
  usedAt?: string
  usedStore?: string
}

export const ALL_SPOTS: Spot[] = [
  { id: 'r1', name: '北港朝天宮商圈', town: '北港鎮', desc: '三百年香火與廟口小吃一條街', distanceKm: 2.4, lat: 23.5748, lng: 120.3038, icon: 'i-lucide-landmark', photo: '/images/spots/r1.jpg', art: '/images/art/temple.webp', mapX: 30, mapY: 62 },
  { id: 'r2', name: '西螺延平老街', town: '西螺鎮', desc: '巴洛克街屋與百年醬油老鋪', distanceKm: 12.8, lat: 23.7986, lng: 120.4658, icon: 'i-lucide-building-2', photo: '/images/spots/r2.jpg', art: '/images/art/village.webp', mapX: 58, mapY: 18 },
  { id: 'r3', name: '虎尾糖廠冰城', town: '虎尾鎮', desc: '日治製糖遺構，必吃古早味冰棒', distanceKm: 8.1, lat: 23.7079, lng: 120.4436, icon: 'i-lucide-ice-cream-cone', photo: '/images/spots/r3.jpg', art: '/images/art/cake.webp', mapX: 52, mapY: 40 },
  { id: 'r4', name: '古坑華山咖啡園區', town: '古坑鄉', desc: '台灣咖啡原鄉，山景配一杯手沖', distanceKm: 24.6, lat: 23.6229, lng: 120.6236, icon: 'i-lucide-coffee', photo: '/images/spots/r4.jpg', art: '/images/art/coffee.webp', mapX: 84, mapY: 55 },
  { id: 'r5', name: '口湖遊客中心', town: '口湖鄉', desc: '烏魚子與在地海產伴手禮', distanceKm: 18.3, lat: 23.5556, lng: 120.1886, icon: 'i-lucide-fish', photo: '/images/spots/r5.jpg', art: '/images/art/seafood-plate.webp', mapX: 14, mapY: 70 },
  { id: 'r6', name: '台西海口生活館', town: '台西鄉', desc: '蚵貝彩繪與現撈海鮮餐桌', distanceKm: 21.5, lat: 23.7028, lng: 120.1958, icon: 'i-lucide-shell', photo: '/images/spots/r6.jpg', art: '/images/art/clam-bowl.webp', mapX: 12, mapY: 44 },
  { id: 'r7', name: '斗六太平老街', town: '斗六市', desc: '整排洋樓立面，夜市小吃集散', distanceKm: 15.2, lat: 23.7118, lng: 120.5426, icon: 'i-lucide-store', photo: '/images/spots/r7.jpg', art: '/images/art/village.webp', mapX: 72, mapY: 38 },
  { id: 'r8', name: '劍湖山世界', town: '古坑鄉', desc: '摩天輪與親子遊樂設施', distanceKm: 26.9, lat: 23.6338, lng: 120.5883, icon: 'i-lucide-ferris-wheel', photo: '/images/spots/r8.jpg', art: '/images/art/kids-run.webp', mapX: 80, mapY: 62 },
  { id: 'r9', name: '興隆毛巾觀光工廠', town: '虎尾鎮', desc: '毛巾蛋糕 DIY，把伴手禮捲回家', distanceKm: 9.7, lat: 23.7305, lng: 120.3803, icon: 'i-lucide-factory', photo: '/images/spots/r9.jpg', art: '/images/art/farmhouse.webp', mapX: 44, mapY: 33 },
  { id: 'r10', name: '水林番薯會社', town: '水林鄉', desc: '地瓜之鄉，現烤蜜番薯', distanceKm: 6.5, lat: 23.5722, lng: 120.2431, icon: 'i-lucide-sprout', photo: '/images/spots/r10.jpg', art: '/images/art/veggie-basket.webp', mapX: 22, mapY: 66 },

  // ── 以下八站來自《亮點100新玩法更新內容_0828》的首推二日遊行程 ──
  // ⚠️ 座標與照片為示意值：照片先借用同類型的既有圖庫圖，正式上線前必須換成實拍。
  { id: 'n1', name: '台灣鯛生態創意園區', town: '口湖鄉', desc: '認識台灣鯛的養殖與加工，食魚教育體驗', distanceKm: 19.4, lat: 23.5836, lng: 120.1889, icon: 'i-lucide-fish', photo: '/images/spots/r5.jpg', art: '/images/art/boat.webp', mapX: 15, mapY: 72 },
  { id: 'n2', name: '馬蹄蛤主題館', town: '水林鄉', desc: '下水摸馬蹄蛤，親子最愛的體驗池', distanceKm: 16.8, lat: 23.5539, lng: 120.2069, icon: 'i-lucide-shell', photo: '/images/spots/r6.jpg', art: '/images/art/clam-bowl.webp', mapX: 18, mapY: 74 },
  { id: 'n5', name: '鵝童樂園', town: '東勢鄉', desc: '鵝媽媽觀光工廠改建的親子樂園', distanceKm: 13.6, lat: 23.6889, lng: 120.2569, icon: 'i-lucide-ferris-wheel', photo: '/images/spots/r8.jpg', art: '/images/art/kids-run.webp', mapX: 24, mapY: 48 },
  { id: 'n7', name: '綠金蕃茄南瓜農場', town: '斗六市', desc: '溫室採果，認識瓜果從開花到收成', distanceKm: 17.9, lat: 23.7003, lng: 120.5502, icon: 'i-lucide-leaf', photo: '/images/spots/r10.jpg', art: '/images/art/veggie-basket.webp', mapX: 70, mapY: 34 },
  { id: 'n8', name: '奶奶的熊毛巾故事館', town: '虎尾鎮', desc: '毛巾玩偶 DIY 與觀光工廠導覽', distanceKm: 10.2, lat: 23.7218, lng: 120.4391, icon: 'i-lucide-factory', photo: '/images/spots/r9.jpg', art: '/images/art/farmhouse.webp', mapX: 48, mapY: 36 },

  { id: 'g1', name: '成龍濕地', town: '口湖鄉', desc: '國際環境藝術節的水上裝置', distanceKm: 17.2, lat: 23.5183, lng: 120.1719, icon: 'i-lucide-bird', photo: '/images/spots/g1.jpg', art: '/images/art/paddy.webp', mapX: 10, mapY: 78 },
  { id: 'g2', name: '虎尾鐵橋', town: '虎尾鎮', desc: '橫跨虎尾溪的百年糖鐵橋', distanceKm: 8.4, lat: 23.7095, lng: 120.4392, icon: 'i-lucide-train-front', photo: '/images/spots/g2.jpg', art: '/images/art/farmhouse.webp', mapX: 55, mapY: 44 },
  { id: 'g3', name: '草嶺石壁森林步道', town: '古坑鄉', desc: '雲嘉南最高柳杉林與雲海', distanceKm: 42.1, lat: 23.5333, lng: 120.7042, icon: 'i-lucide-trees', photo: '/images/spots/g3.jpg', art: '/images/art/grove.webp', mapX: 90, mapY: 78, hasQr: false, radiusM: 600 },
  { id: 'g4', name: '五元二角綠廊', town: '古坑鄉', desc: '竹編涼亭串起的社區綠廊', distanceKm: 23.4, lat: 23.6408, lng: 120.5747, icon: 'i-lucide-leaf', photo: '/images/spots/g4.jpg', art: '/images/art/tree-round.webp', mapX: 78, mapY: 50, hasQr: false, radiusM: 300 },
  { id: 'g5', name: '三條崙海水浴場', town: '四湖鄉', desc: '西海岸落日與防風林', distanceKm: 19.8, lat: 23.6389, lng: 120.1636, icon: 'i-lucide-sunset', photo: '/images/spots/g5.jpg', art: '/images/art/sun.webp', mapX: 8, mapY: 58, hasQr: false, radiusM: 400 },
  { id: 'g6', name: '濁水溪出海口', town: '麥寮鄉', desc: '台灣最長河川的入海處', distanceKm: 28.6, lat: 23.8447, lng: 120.1608, icon: 'i-lucide-waves', photo: '/images/spots/g6.jpg', art: '/images/art/boat.webp', mapX: 16, mapY: 12, hasQr: false, radiusM: 500 },
  { id: 'g7', name: '湖山水庫', town: '斗六市', desc: '環湖步道與壩頂展望台', distanceKm: 20.5, lat: 23.6931, lng: 120.6083, icon: 'i-lucide-droplets', photo: '/images/spots/g7.jpg', art: '/images/art/paddy.webp', mapX: 86, mapY: 40, hasQr: false, radiusM: 500 },
  { id: 'g8', name: '北港女兒橋', town: '北港鎮', desc: '糖鐵改建，夜間點燈超好拍', distanceKm: 2.9, lat: 23.5761, lng: 120.2986, icon: 'i-lucide-rainbow', photo: '/images/spots/g8.jpg', art: '/images/art/village.webp', mapX: 28, mapY: 56 },
  { id: 'g9', name: '頂溪彩繪社區', town: '虎尾鎮', desc: '屋牆上的貓咪彩繪小村', distanceKm: 11.3, lat: 23.7286, lng: 120.4694, icon: 'i-lucide-palette', photo: '/images/spots/g9.jpg', art: '/images/art/farmhouse.webp', mapX: 62, mapY: 30 },
  { id: 'g10', name: '樟湖茶園步道', town: '古坑鄉', desc: '梯田茶園與山嵐早晨', distanceKm: 38.7, lat: 23.5619, lng: 120.6653, icon: 'i-lucide-mountain', photo: '/images/spots/g10.jpg', art: '/images/art/hill-green.webp', mapX: 88, mapY: 68, hasQr: false, radiusM: 600 },

  // ── 同樣來自 0828 更新內容的首推行程；座標與照片為示意值 ──
  { id: 'n3', name: '金湖休閒農業區', town: '口湖鄉', desc: '魚塭與濕地交界的農漁村風景', distanceKm: 20.1, lat: 23.5333, lng: 120.1667, icon: 'i-lucide-sprout', photo: '/images/spots/g5.jpg', art: '/images/art/oyster-rack.webp', mapX: 11, mapY: 74, hasQr: false, radiusM: 800 },
  { id: 'n4', name: '雲林溪藝文廊帶', town: '斗六市', desc: '縣府主推的水岸光廊與街區彩繪', distanceKm: 15.8, lat: 23.7075, lng: 120.5439, icon: 'i-lucide-palette', photo: '/images/spots/g8.jpg', art: '/images/art/village.webp', mapX: 73, mapY: 36 },
  { id: 'n6', name: '膨鼠森林公園', town: '斗六市', desc: '大型木製溜滑梯與森林系共融遊具', distanceKm: 16.2, lat: 23.7128, lng: 120.5478, icon: 'i-lucide-trees', photo: '/images/spots/g4.jpg', art: '/images/art/tree-pine.webp', mapX: 75, mapY: 33 }
]

/**
 * 遊樂路線。旅客先選一條路線，再照 A→B→C 走。
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

// ── 會員等級與點數 ──────────────────────────────────

/**
 * 會員等級。名稱、條件與點數直接取自客戶 2026-09-11 提供的規則表。
 * 點數只在升級時發放（一站＝一個任務，打卡本身不另給點），最高累積 1,000 點。
 */
export interface Level {
  level: 1 | 2 | 3
  name: string
  condition: string
  /** 升到這一級時獲得的點數 */
  reward: number
  /** 到這一級為止的累積點數，也是可兌換的優惠價值上限 */
  total: number
}

export const LEVELS: Level[] = [
  { level: 1, name: '啟程會員', condition: '完成會員註冊', reward: 250, total: 250 },
  { level: 2, name: '探索會員', condition: '完成 2 個行程打卡任務', reward: 250, total: 500 },
  { level: 3, name: '達成會員', condition: '完成所有指定打卡任務', reward: 500, total: 1000 }
]

/** 升等級二需要的打卡站數；任意站點皆可 */
export const LEVEL_TWO_CHECKINS = 2

/**
 * 等級三的「指定打卡任務」＝首推路線的全部站點。
 * 客戶正式圈選前先用這組；要換成別的站點，改這一行即可，全站（印章格標記、
 * 地圖外環、升級判定、後台篩選）都讀這一份。
 */
export const DESIGNATED_SPOT_IDS: string[] = routeSpotIds(ROUTES.find((r) => r.featured) ?? ROUTES[0]!)

export const isDesignated = (id: string) => DESIGNATED_SPOT_IDS.includes(id)

/**
 * 兌換專區的品項。
 * ⚠️ 正式品項待客戶提供；目前以 1 點＝1 元的等值優惠券示意，
 * 等級越高能兌換的面額越大，對應規則表的「可兌換優惠價值」。
 */
export interface Reward {
  id: string
  name: string
  desc: string
  /** 所需點數，兌換後即為同面額優惠券 */
  cost: 250 | 500
  /** 最低會員等級 */
  minLevel: 1 | 2 | 3
}

export const REWARDS: Reward[] = [
  { id: 'coupon-250', name: '250 元優惠券', desc: '全縣合作店家消費滿 300 元可折抵', cost: 250, minLevel: 1 },
  { id: 'coupon-500', name: '500 元優惠券', desc: '全縣合作店家消費滿 300 元可折抵', cost: 500, minLevel: 2 }
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
  /** 每人可累積的點數上限（＝等級三的累積點數） */
  quota: 1000,
  /** 兌換後的券有效天數 */
  couponValidDays: 30,
  /** 定位打卡的預設判定半徑（公尺）。站點可用 radiusM 個別覆寫。 */
  geoRadiusM: 150,
  storeCount: 100
}

/** YYYY.MM.DD，與站內其他日期同格式 */
const fmtDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`

export function useCampaign() {
  /**
   * 登入狀態。首頁與景點、店家、活動辦法皆為公開內容；
   * 護照、點數、券夾與使用紀錄等個人資料一律要登入後才顯示。
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

  /**
   * 示範初始狀態：已打卡 3 站（等級二，累積 500 點）、已兌換一張 250 元券，
   * 所以可用點數是 250 —— 四個數字彼此對得起來。
   */
  const checkedIn = useState<string[]>('checkedIn', () => ['r1', 'g8', 'r3'])

  /** 已兌換的優惠券 */
  const coupons = useState<Coupon[]>('coupons', () => [
    {
      id: 'c1',
      value: 250,
      status: 'unused',
      code: 'YL26-250-8FK2',
      issuedAt: '2026.09.12',
      expiresAt: '2026.10.12'
    }
  ])

  const isCheckedIn = (id: string) => checkedIn.value.includes(id)

  /** 指定站點蓋了幾站 */
  const designatedProgress = computed(() => ({
    done: DESIGNATED_SPOT_IDS.filter((id) => isCheckedIn(id)).length,
    total: DESIGNATED_SPOT_IDS.length
  }))

  /**
   * 目前等級。能看到護照就代表已完成註冊，所以最低是等級一。
   * 指定站全蓋一定也已蓋滿 2 站，不會有跳過等級二的情況。
   */
  const level = computed<1 | 2 | 3>(() => {
    if (designatedProgress.value.done === designatedProgress.value.total) return 3
    if (checkedIn.value.length >= LEVEL_TWO_CHECKINS) return 2
    return 1
  })

  const levelInfo = computed(() => LEVELS[level.value - 1]!)

  /** 累積獲得的點數（隨等級發放，不會因兌換減少） */
  const earnedPoints = computed(() => levelInfo.value.total)

  /** 已兌換掉的點數；每張券都來自兌換，面額即扣點數 */
  const spentPoints = computed(() => coupons.value.reduce((s, c) => s + c.value, 0))

  /** 可用點數 */
  const points = computed(() => earnedPoints.value - spentPoints.value)

  /** 距離下一級：還差幾站、算的是哪一種站點 */
  const nextLevel = computed(() => {
    if (level.value === 3) return null
    const target = LEVELS[level.value]!
    if (level.value === 1) {
      return { ...target, remaining: Math.max(0, LEVEL_TWO_CHECKINS - checkedIn.value.length), designatedOnly: false }
    }
    return {
      ...target,
      remaining: designatedProgress.value.total - designatedProgress.value.done,
      designatedOnly: true
    }
  })

  /** 未使用的券的面額合計 */
  const walletAmount = computed(() =>
    coupons.value.filter((c) => c.status === 'unused').reduce((s, c) => s + c.value, 0)
  )

  /** 一條路線走了幾站 / 共幾站 */
  const routeProgress = (r: Route) => {
    const ids = routeSpotIds(r)
    return { done: ids.filter((id) => isCheckedIn(id)).length, total: ids.length }
  }

  const spotById = (id: string) => ALL_SPOTS.find((s) => s.id === id)

  /**
   * 能不能兌換某個品項。等級不足優先回報 —— 等級是長期目標，
   * 點數不足則是「差多少」，兩者給使用者的行動建議不同。
   */
  function canRedeem(r: Reward): { ok: true } | { ok: false; reason: string } {
    if (level.value < r.minLevel) return { ok: false, reason: `${LEVELS[r.minLevel - 1]!.name}以上可兌換` }
    if (points.value < r.cost) return { ok: false, reason: `還差 ${r.cost - points.value} 點` }
    return { ok: true }
  }

  /** 兌換：扣點（即新增一張等值券），不影響等級 */
  function redeem(rewardId: string): Coupon | null {
    const r = REWARDS.find((x) => x.id === rewardId)
    if (!r || !canRedeem(r).ok) return null
    const now = new Date()
    const expires = new Date(now.getTime() + CAMPAIGN.couponValidDays * 86400000)
    const coupon: Coupon = {
      id: `c${coupons.value.length + 1}`,
      value: r.cost,
      status: 'unused',
      code: `YL26-${r.cost}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      issuedAt: fmtDate(now),
      expiresAt: fmtDate(expires)
    }
    coupons.value.push(coupon)
    return coupon
  }

  /**
   * 打卡：擷取經緯度 + 綁定會員 + 去重。
   * 不再自動發券；回傳這次打卡是否剛好升級（用來跳出「升級獲得點數」畫面）。
   */
  function checkIn(id: string): { levelUp: Level | null } {
    const before = level.value
    if (!checkedIn.value.includes(id)) checkedIn.value.push(id)
    return { levelUp: level.value > before ? levelInfo.value : null }
  }

  /** 回到剛註冊完的狀態：等級一、250 點、沒有章也沒有券 */
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
    level,
    levelInfo,
    designatedProgress,
    earnedPoints,
    spentPoints,
    points,
    nextLevel,
    walletAmount,
    isCheckedIn,
    routeProgress,
    spotById,
    canRedeem,
    redeem,
    checkIn,
    resetDemo
  }
}
