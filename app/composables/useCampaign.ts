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
   * 定位判定半徑（公尺）。未填用 CAMPAIGN.geoRadiusM。
   * 步道、濕地、農業區這種「面」而不是「點」的場域要放大，否則旅客站在園區裡也判定不到。
   */
  radiusM?: number
  /** 完成這個任務（在此站打卡）可得的點數，100～500，取自 TASK_POINTS */
  points: number
}

/**
 * 兌換到手的券。兩種通路：
 *   store　　合作店家折抵用的優惠券，有面額
 *   station　借問站領取的限量好禮，沒有面額，核銷後領實體
 */
export interface Coupon {
  id: string
  /** 來源獎項 */
  rewardId: string
  name: string
  /** 面額（店家折抵用）；借問站好禮為 0 */
  value: number
  /** 兌換時花掉的點數 */
  cost: number
  channel: 'store' | 'station'
  status: 'unused' | 'used' | 'expired'
  code: string
  issuedAt: string
  expiresAt: string
  usedAt?: string
  usedStore?: string
}

/**
 * 每個任務（站點）的點數。客戶規則：「每個任務依難度不同，可獲得 100～500 點」。
 * ⚠️ 以下為示意值，依「要花多少力氣才到得了」分四級；客戶的正式點數表來了只換這一張：
 *   100　市區、交通方便的街區地標
 *   200　觀光工廠、園區與親子景點
 *   300　海線、濕地與食農體驗，需要安排半天
 *   500　偏遠山區與出海口，得特地前往
 */
export const TASK_POINTS: Record<string, 100 | 200 | 300 | 500> = {
  r1: 100, r2: 100, r7: 100, g8: 100, n4: 100, g9: 100,
  r3: 200, r9: 200, n8: 200, n5: 200, r8: 200, n6: 200, g2: 200, r10: 200,
  r5: 300, r6: 300, n1: 300, n2: 300, n7: 300, g1: 300, n3: 300, g5: 300, r4: 300, g4: 300, g7: 300,
  g3: 500, g10: 500, g6: 500
}

const SPOT_DATA: Omit<Spot, 'points'>[] = [
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
  { id: 'g3', name: '草嶺石壁森林步道', town: '古坑鄉', desc: '雲嘉南最高柳杉林與雲海', distanceKm: 42.1, lat: 23.5333, lng: 120.7042, icon: 'i-lucide-trees', photo: '/images/spots/g3.jpg', art: '/images/art/grove.webp', mapX: 90, mapY: 78, radiusM: 600 },
  { id: 'g4', name: '五元二角綠廊', town: '古坑鄉', desc: '竹編涼亭串起的社區綠廊', distanceKm: 23.4, lat: 23.6408, lng: 120.5747, icon: 'i-lucide-leaf', photo: '/images/spots/g4.jpg', art: '/images/art/tree-round.webp', mapX: 78, mapY: 50, radiusM: 300 },
  { id: 'g5', name: '三條崙海水浴場', town: '四湖鄉', desc: '西海岸落日與防風林', distanceKm: 19.8, lat: 23.6389, lng: 120.1636, icon: 'i-lucide-sunset', photo: '/images/spots/g5.jpg', art: '/images/art/sun.webp', mapX: 8, mapY: 58, radiusM: 400 },
  { id: 'g6', name: '濁水溪出海口', town: '麥寮鄉', desc: '台灣最長河川的入海處', distanceKm: 28.6, lat: 23.8447, lng: 120.1608, icon: 'i-lucide-waves', photo: '/images/spots/g6.jpg', art: '/images/art/boat.webp', mapX: 16, mapY: 12, radiusM: 500 },
  { id: 'g7', name: '湖山水庫', town: '斗六市', desc: '環湖步道與壩頂展望台', distanceKm: 20.5, lat: 23.6931, lng: 120.6083, icon: 'i-lucide-droplets', photo: '/images/spots/g7.jpg', art: '/images/art/paddy.webp', mapX: 86, mapY: 40, radiusM: 500 },
  { id: 'g8', name: '北港女兒橋', town: '北港鎮', desc: '糖鐵改建，夜間點燈超好拍', distanceKm: 2.9, lat: 23.5761, lng: 120.2986, icon: 'i-lucide-rainbow', photo: '/images/spots/g8.jpg', art: '/images/art/village.webp', mapX: 28, mapY: 56 },
  { id: 'g9', name: '頂溪彩繪社區', town: '虎尾鎮', desc: '屋牆上的貓咪彩繪小村', distanceKm: 11.3, lat: 23.7286, lng: 120.4694, icon: 'i-lucide-palette', photo: '/images/spots/g9.jpg', art: '/images/art/farmhouse.webp', mapX: 62, mapY: 30 },
  { id: 'g10', name: '樟湖茶園步道', town: '古坑鄉', desc: '梯田茶園與山嵐早晨', distanceKm: 38.7, lat: 23.5619, lng: 120.6653, icon: 'i-lucide-mountain', photo: '/images/spots/g10.jpg', art: '/images/art/hill-green.webp', mapX: 88, mapY: 68, radiusM: 600 },

  // ── 同樣來自 0828 更新內容的首推行程；座標與照片為示意值 ──
  { id: 'n3', name: '金湖休閒農業區', town: '口湖鄉', desc: '魚塭與濕地交界的農漁村風景', distanceKm: 20.1, lat: 23.5333, lng: 120.1667, icon: 'i-lucide-sprout', photo: '/images/spots/g5.jpg', art: '/images/art/oyster-rack.webp', mapX: 11, mapY: 74, radiusM: 800 },
  { id: 'n4', name: '雲林溪藝文廊帶', town: '斗六市', desc: '縣府主推的水岸光廊與街區彩繪', distanceKm: 15.8, lat: 23.7075, lng: 120.5439, icon: 'i-lucide-palette', photo: '/images/spots/g8.jpg', art: '/images/art/village.webp', mapX: 73, mapY: 36 },
  { id: 'n6', name: '膨鼠森林公園', town: '斗六市', desc: '大型木製溜滑梯與森林系共融遊具', distanceKm: 16.2, lat: 23.7128, lng: 120.5478, icon: 'i-lucide-trees', photo: '/images/spots/g4.jpg', art: '/images/art/tree-pine.webp', mapX: 75, mapY: 33 }
]

export const ALL_SPOTS: Spot[] = SPOT_DATA.map((s) => ({ ...s, points: TASK_POINTS[s.id] ?? 100 }))

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
 * 會員等級。依客戶 2026-09 修訂的「觀光護照玩法」：
 *   完成任務得點數（每站 100～500），累積點數達門檻自動升級。
 * 等級看的是「累積獲得」的點數，兌換掉的不扣，所以兌換不會降級。
 *
 * 註冊禮 200 點剛好是等級一門檻，會員最低就是等級一；
 * 若之後註冊禮調低，這裡要補「未達等級一」的狀態。
 */
export interface Level {
  level: 1 | 2 | 3
  name: string
  /** 升到這一級所需的累積點數 */
  threshold: number
  /** 等級插圖：啟程＝載著行李出發、探索＝跑進景點、達成＝全家玩完一趟 */
  art: string
}

export const LEVELS: Level[] = [
  { level: 1, name: '啟程會員', threshold: 200, art: '/images/art/car-family.webp' },
  { level: 2, name: '探索會員', threshold: 500, art: '/images/art/kids-run.webp' },
  { level: 3, name: '達成會員', threshold: 1000, art: '/images/art/family-four.webp' }
]

// ── 任務 ────────────────────────────────────────────

/**
 * 任務是點數的唯一來源（註冊禮除外）。
 *
 * 分兩類：
 *   打卡任務　綁定站點，到現場以定位確認抵達，每站限一次
 *   指定任務　食農教育與 iRent 租車，沒有座標，以憑證認定，且可累積次數
 *
 * 「累積租車 3 次解鎖自駕玩家」這種里程碑，用**計數器推導**而不是做成可重複的任務：
 * 租車次數是唯一事實，里程碑只讀它，不會有重複發點的風險。
 */
export type TaskKind = 'checkin' | 'foodagri' | 'irent'

export const TASK_KINDS: { key: TaskKind; label: string; desc: string; icon: string }[] = [
  { key: 'checkin', label: '打卡任務', desc: '到站點現場以定位確認抵達，每站限完成一次', icon: 'i-lucide-stamp' },
  { key: 'foodagri', label: '食農教育', desc: '完成食農食漁體驗後，輸入現場提供的活動代碼', icon: 'i-lucide-sprout' },
  { key: 'irent', label: 'iRent 租車', desc: '登錄租車訂單編號，次數累積可解鎖里程碑', icon: 'i-lucide-car-front' }
]

export interface Task {
  id: string
  kind: TaskKind
  title: string
  desc: string
  points: number
  /** 完成後蓋在護照上的印章插圖 */
  art: string
  /** 打卡任務綁定的站點 */
  spotId?: string
  /** 里程碑：計數器達標即自動完成，不需要另外送憑證 */
  milestone?: { counter: 'foodagri' | 'irent'; need: number }
  /** 租車情境任務：任一筆租車紀錄符合此條件即完成 */
  rentalFlag?: 'inYunlin' | 'electric'
  /** 憑證欄位標題；有值代表這個任務靠輸入憑證完成 */
  codeLabel?: string
}

/** 打卡任務：由站點產生，點數沿用 TASK_POINTS */
const CHECKIN_TASKS: Task[] = ALL_SPOTS.map((s) => ({
  id: `chk-${s.id}`,
  kind: 'checkin' as const,
  title: s.name,
  desc: `${s.town} ‧ ${s.desc}`,
  points: s.points,
  art: s.art,
  spotId: s.id
}))

/** 食農教育：8 個體驗（各一次）＋ 2 個里程碑。⚠️ 內容為示意，待客戶提供正式清單 */
const FOODAGRI_TASKS: Task[] = [
  { id: 'fa1', kind: 'foodagri', title: '台灣鯛食魚教育', desc: '認識台灣鯛的養殖與加工，完成食魚教育課程', points: 300, art: '/images/art/seafood-plate.webp', codeLabel: '活動代碼' },
  { id: 'fa2', kind: 'foodagri', title: '馬蹄蛤下水體驗', desc: '下水摸蛤，認識馬蹄蛤的養殖環境', points: 300, art: '/images/art/clam-bowl.webp', codeLabel: '活動代碼' },
  { id: 'fa3', kind: 'foodagri', title: '綠金溫室採果', desc: '溫室現採蕃茄與南瓜，認識瓜果從開花到收成', points: 300, art: '/images/art/veggie-basket.webp', codeLabel: '活動代碼' },
  { id: 'fa4', kind: 'foodagri', title: '金湖友善養殖導覽', desc: '走進魚塭，認識不用藥的友善養殖', points: 300, art: '/images/art/oyster-rack.webp', codeLabel: '活動代碼' },
  { id: 'fa5', kind: 'foodagri', title: '口湖烏魚子加工體驗', desc: '從整形、日曬到烘烤，做一片自己的烏魚子', points: 300, art: '/images/art/boat.webp', codeLabel: '活動代碼' },
  { id: 'fa6', kind: 'foodagri', title: '水林地瓜窯食農課', desc: '挖地瓜、堆窯、悶烤，吃一顆自己烤的蜜番薯', points: 300, art: '/images/art/paddy.webp', codeLabel: '活動代碼' },
  { id: 'fa7', kind: 'foodagri', title: '古坑咖啡烘豆課', desc: '從生豆到手沖，認識台灣咖啡原鄉的風味', points: 300, art: '/images/art/coffee.webp', codeLabel: '活動代碼' },
  { id: 'fa8', kind: 'foodagri', title: '西螺醬油釀造導覽', desc: '看見黑豆蔭油從入缸到曝曬的一百八十天', points: 300, art: '/images/art/village.webp', codeLabel: '活動代碼' },
  { id: 'fa-m3', kind: 'foodagri', title: '食農學徒', desc: '累積完成 3 個食農教育體驗', points: 500, art: '/images/art/kids-run.webp', milestone: { counter: 'foodagri', need: 3 } },
  { id: 'fa-m6', kind: 'foodagri', title: '食農達人', desc: '累積完成 6 個食農教育體驗', points: 500, art: '/images/art/family-four.webp', milestone: { counter: 'foodagri', need: 6 } }
]

/** iRent 租車：3 個累積里程碑 ＋ 2 個情境任務。全部由「登錄租車紀錄」推導 */
const IRENT_TASKS: Task[] = [
  { id: 'ir-m1', kind: 'irent', title: '自駕新手', desc: '完成第 1 次 iRent 租車', points: 300, art: '/images/art/car-family.webp', milestone: { counter: 'irent', need: 1 } },
  { id: 'ir-m3', kind: 'irent', title: '自駕玩家', desc: '累積 3 次 iRent 租車', points: 400, art: '/images/art/kids-run.webp', milestone: { counter: 'irent', need: 3 } },
  { id: 'ir-m5', kind: 'irent', title: '自駕達人', desc: '累積 5 次 iRent 租車', points: 500, art: '/images/art/family-four.webp', milestone: { counter: 'irent', need: 5 } },
  { id: 'ir-yunlin', kind: 'irent', title: '雲林借還車', desc: '於雲林縣內的 iRent 站點借車並還車', points: 300, art: '/images/art/farmhouse.webp', rentalFlag: 'inYunlin' },
  { id: 'ir-ev', kind: 'irent', title: '電動車體驗', desc: '租用 iRent 電動車完成一趟雲林旅程', points: 300, art: '/images/art/tree-pine.webp', rentalFlag: 'electric' }
]

export const TASKS: Task[] = [...CHECKIN_TASKS, ...FOODAGRI_TASKS, ...IRENT_TASKS]

export const tasksOfKind = (k: TaskKind) => TASKS.filter((t) => t.kind === k)
export const taskById = (id: string) => TASKS.find((t) => t.id === id)
/** 指定任務：非打卡的都算，護照的印章頁用它分區 */
export const DESIGNATED_TASKS = TASKS.filter((t) => t.kind !== 'checkin')

/** 一筆租車紀錄。inYunlin／electric 由 iRent 訂單資料判定，demo 由使用者勾選 */
export interface Rental {
  code: string
  inYunlin: boolean
  electric: boolean
  at: string
}

/**
 * 兌換專區的品項。⚠️ 正式品項待客戶提供，以下為示意。
 * 點數上限拿掉之後，預算改由**限量**控管：總預算＝各獎項發行份數 × 價值，
 * 不再是人數 × 每人上限。stock 為 null 代表不限量。
 */
export interface Reward {
  id: string
  name: string
  desc: string
  /** 所需點數 */
  cost: number
  /** 折抵面額；借問站好禮為 0 */
  value: number
  /** 最低會員等級 */
  minLevel: 1 | 2 | 3
  /** store：合作店家折抵　station：借問站領取 */
  channel: 'store' | 'station'
  /** 發行份數；null 為不限量 */
  stock: number | null
  /** 已被兌換份數（示意值） */
  claimed: number
  /** 每人限兌一次 */
  oncePerMember?: boolean
}

export const REWARDS: Reward[] = [
  { id: 'coupon-250', name: '250 元優惠券', desc: '全縣合作店家消費滿 300 元可折抵', cost: 250, value: 250, minLevel: 1, channel: 'store', stock: null, claimed: 1840 },
  { id: 'coupon-500', name: '500 元優惠券', desc: '全縣合作店家消費滿 300 元可折抵', cost: 500, value: 500, minLevel: 2, channel: 'store', stock: null, claimed: 960 },
  { id: 'gift-goods', name: '雲林良品伴手禮', desc: '至借問站出示兌換券領取，數量有限', cost: 800, value: 0, minLevel: 2, channel: 'station', stock: 200, claimed: 188, oncePerMember: true },
  { id: 'gift-tote', name: '限量文創提袋', desc: '活動主視覺聯名款，至借問站領取', cost: 1200, value: 0, minLevel: 3, channel: 'station', stock: 50, claimed: 50, oncePerMember: true }
]

/** 剩餘份數；不限量回傳 null */
export const stockLeft = (r: Reward) => (r.stock === null ? null : Math.max(0, r.stock - r.claimed))
export const isSoldOut = (r: Reward) => stockLeft(r) === 0

/**
 * 借問站：五處旅遊服務據點，負責限量好禮的核銷與領取。
 * 核銷碼僅站點人員知道，全程不對旅客顯示。
 */
export interface Station {
  id: string
  name: string
  town: string
  address: string
  hours: string
  code: string
}

export const STATIONS: Station[] = [
  { id: 'st1', name: '北港朝天宮借問站', town: '北港鎮', address: '北港鎮中山路 178 號', hours: '09:00–18:00', code: '1357' },
  { id: 'st2', name: '西螺延平老街借問站', town: '西螺鎮', address: '西螺鎮延平路 92 號', hours: '10:00–18:00', code: '2468' },
  { id: 'st3', name: '斗六太平老街借問站', town: '斗六市', address: '斗六市太平路 55 號', hours: '09:30–19:00', code: '3579' },
  { id: 'st4', name: '虎尾糖廠借問站', town: '虎尾鎮', address: '虎尾鎮中山路 2 號', hours: '09:00–17:30', code: '4680' },
  { id: 'st5', name: '口湖遊客中心借問站', town: '口湖鄉', address: '口湖鄉光復路 6 號', hours: '09:00–17:00', code: '5791' }
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
  /**
   * 點數不設上限：客戶規則要求「持續累積、不歸零」，且每 1,000 點換一次抽獎資格，
   * 有上限第二次就永遠拿不到。預算改由獎項的 stock 控管。
   * 每累積這麼多點，取得一次抽獎資格。
   */
  lotteryUnit: 1000,
  /** 註冊禮點數（＝等級一門檻，註冊即為啟程會員） */
  signupBonus: 200,
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
   * 示範初始狀態：
   *   註冊禮 200 ＋ 打卡 3 站（100＋100＋200）＝ 600
   *   ＋ 食農體驗 2 個（300×2）＝ 1,200
   *   ＋ 租車 1 次 → 自駕新手 300、雲林借還車 300 ＝ 1,800 點（等級三、1 次抽獎資格）
   * 已兌換一張 250 元券，所以可用點數 1,550。
   */
  const checkedIn = useState<string[]>('checkedIn', () => ['r1', 'g8', 'r3'])

  /** 已完成的指定任務（靠憑證完成的那種；里程碑是算出來的，不存在這裡） */
  const doneTaskIds = useState<string[]>('doneTaskIds', () => ['fa1', 'fa2'])

  /** 租車紀錄。里程碑與情境任務都由這份推導 */
  const rentals = useState<Rental[]>('rentals', () => [
    { code: 'IR-2609-8842', inYunlin: true, electric: false, at: '2026.09.14' }
  ])

  /** 用過的憑證，避免同一張重複送 */
  const usedCodes = useState<string[]>('usedCodes', () => ['FA-TILAPIA-01', 'FA-CLAM-02', 'IR-2609-8842'])

  /** 已兌換的券 */
  const coupons = useState<Coupon[]>('coupons', () => [
    {
      id: 'c1',
      rewardId: 'coupon-250',
      name: '250 元優惠券',
      value: 250,
      cost: 250,
      channel: 'store',
      status: 'unused',
      code: 'YL26-250-8FK2',
      issuedAt: '2026.09.12',
      expiresAt: '2026.10.12'
    }
  ])

  const isCheckedIn = (id: string) => checkedIn.value.includes(id)

  const spotById = (id: string) => ALL_SPOTS.find((s) => s.id === id)

  /** 已完成的食農體驗數（不含里程碑本身），里程碑讀這個 */
  const foodagriCount = computed(
    () => tasksOfKind('foodagri').filter((t) => !t.milestone && doneTaskIds.value.includes(t.id)).length
  )

  /** 租車次數，里程碑讀這個 */
  const rentalCount = computed(() => rentals.value.length)

  /** 任務完成與否：打卡看站點、里程碑看計數器、情境看租車紀錄、其餘看憑證 */
  function isTaskDone(t: Task): boolean {
    if (t.kind === 'checkin') return isCheckedIn(t.spotId!)
    if (t.milestone) {
      const n = t.milestone.counter === 'irent' ? rentalCount.value : foodagriCount.value
      return n >= t.milestone.need
    }
    if (t.rentalFlag) return rentals.value.some((r) => r[t.rentalFlag!])
    return doneTaskIds.value.includes(t.id)
  }

  const completedTasks = computed(() => TASKS.filter(isTaskDone))

  /** 某一類任務的完成數與總數，任務牆的分頁標籤用 */
  const kindProgress = (k: TaskKind) => {
    const list = tasksOfKind(k)
    return { done: list.filter(isTaskDone).length, total: list.length }
  }

  /**
   * 累積獲得的點數：註冊禮 ＋ 所有已完成任務。
   * 不設上限（客戶規則：持續累積、不歸零），兌換也不會讓它減少，所以等級只升不降。
   */
  const earnedPoints = computed(
    () => CAMPAIGN.signupBonus + completedTasks.value.reduce((s, t) => s + t.points, 0)
  )

  /** 目前等級：已達門檻的最高一級 */
  const level = computed<1 | 2 | 3>(
    () => [...LEVELS].reverse().find((l) => earnedPoints.value >= l.threshold)?.level ?? 1
  )

  const levelInfo = computed(() => LEVELS[level.value - 1]!)

  /** 已兌換掉的點數（兌換時的花費，與面額不一定相同） */
  const spentPoints = computed(() => coupons.value.reduce((s, c) => s + c.cost, 0))

  /** 可用點數 */
  const points = computed(() => earnedPoints.value - spentPoints.value)

  /** 距離下一級還差幾點；已是最高等級時為 null */
  const nextLevel = computed(() => {
    if (level.value === 3) return null
    const target = LEVELS[level.value]!
    return { ...target, remaining: target.threshold - earnedPoints.value }
  })

  /** 目前等級往下一級的進度（0～1），給進度條用 */
  const levelProgress = computed(() => {
    if (!nextLevel.value) return 1
    const from = levelInfo.value.threshold
    return (earnedPoints.value - from) / (nextLevel.value.threshold - from)
  })

  /** 未使用的店家折抵券面額合計；借問站好禮沒有面額，不列入 */
  const walletAmount = computed(() =>
    coupons.value.filter((c) => c.status === 'unused').reduce((s, c) => s + c.value, 0)
  )

  /** 一條路線走了幾站 / 共幾站 */
  const routeProgress = (r: Route) => {
    const ids = routeSpotIds(r)
    return { done: ids.filter((id) => isCheckedIn(id)).length, total: ids.length }
  }

  /** 走完整條的路線數，抽獎加碼用 */
  const completedRoutes = computed(
    () => ROUTES.filter((r) => routeProgress(r).done === routeProgress(r).total).length
  )

  /**
   * 抽獎資格：每累積 lotteryUnit 點 ＋1 次，每走完一條推薦路線再 ＋1 次。
   * 用累積點數而非可用點數 —— 兌換不該影響抽獎資格。
   */
  const draws = computed(() => ({
    fromPoints: Math.floor(earnedPoints.value / CAMPAIGN.lotteryUnit),
    fromRoutes: completedRoutes.value,
    get total() { return this.fromPoints + this.fromRoutes },
    /** 距離下一次純點數資格還差幾點 */
    toNext: CAMPAIGN.lotteryUnit - (earnedPoints.value % CAMPAIGN.lotteryUnit)
  }))

  const hasRedeemed = (rewardId: string) => coupons.value.some((c) => c.rewardId === rewardId)

  /**
   * 能不能兌換某個品項。順序照「使用者能不能自己解決」排：
   * 已兌完與已兌換過是死路，等級不足要長期經營，點數不足只差一點努力。
   */
  function canRedeem(r: Reward): { ok: true } | { ok: false; reason: string } {
    if (isSoldOut(r)) return { ok: false, reason: '已兌完' }
    if (r.oncePerMember && hasRedeemed(r.id)) return { ok: false, reason: '已兌換過' }
    if (level.value < r.minLevel) return { ok: false, reason: `${LEVELS[r.minLevel - 1]!.name}以上可兌換` }
    if (points.value < r.cost) return { ok: false, reason: `還差 ${r.cost - points.value} 點` }
    return { ok: true }
  }

  /** 兌換：扣點並產生一張券，不影響等級與抽獎資格 */
  function redeem(rewardId: string): Coupon | null {
    const r = REWARDS.find((x) => x.id === rewardId)
    if (!r || !canRedeem(r).ok) return null
    const now = new Date()
    const expires = new Date(now.getTime() + CAMPAIGN.couponValidDays * 86400000)
    const coupon: Coupon = {
      id: `c${coupons.value.length + 1}`,
      rewardId: r.id,
      name: r.name,
      value: r.value,
      cost: r.cost,
      channel: r.channel,
      status: 'unused',
      code: `YL26-${r.cost}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      issuedAt: fmtDate(now),
      expiresAt: fmtDate(expires)
    }
    coupons.value.push(coupon)
    r.claimed += 1
    return coupon
  }

  /** 完成任務後的共同結果：加了幾點、是否升級、順帶解鎖了哪些里程碑 */
  interface TaskResult {
    gained: number
    levelUp: Level | null
    unlocked: Task[]
  }
  function withTaskResult(fn: () => void): TaskResult {
    const beforePts = earnedPoints.value
    const beforeLv = level.value
    const beforeDone = new Set(completedTasks.value.map((t) => t.id))
    fn()
    return {
      gained: earnedPoints.value - beforePts,
      levelUp: level.value > beforeLv ? levelInfo.value : null,
      unlocked: completedTasks.value.filter((t) => !beforeDone.has(t.id) && !!t.milestone)
    }
  }

  /**
   * 打卡：擷取經緯度 + 綁定會員 + 去重。
   * 單一任務最多 500 點，不可能一次跨兩級。
   */
  function checkIn(id: string): TaskResult {
    return withTaskResult(() => {
      if (!checkedIn.value.includes(id)) checkedIn.value.push(id)
    })
  }

  /** 指定任務：輸入現場給的活動代碼。同一組代碼不能重複使用 */
  function submitTaskCode(taskId: string, code: string): TaskResult | { error: string } {
    const t = taskById(taskId)
    const key = code.trim().toUpperCase()
    if (!t || !t.codeLabel) return { error: '這個任務不是用代碼完成的' }
    if (key.length < 4) return { error: '代碼格式不正確' }
    if (usedCodes.value.includes(key)) return { error: '這組代碼已經使用過了' }
    if (isTaskDone(t)) return { error: '這個任務已經完成過了' }
    return withTaskResult(() => {
      usedCodes.value.push(key)
      doneTaskIds.value.push(t.id)
    })
  }

  /**
   * 登錄一筆租車紀錄。iRent 的 5 個任務全部由這份紀錄推導：
   * 次數推里程碑，取還車地點與車種推情境任務。
   */
  function logRental(input: { code: string; inYunlin: boolean; electric: boolean }): TaskResult | { error: string } {
    const key = input.code.trim().toUpperCase()
    if (key.length < 4) return { error: '訂單編號格式不正確' }
    if (usedCodes.value.includes(key)) return { error: '這筆訂單已經登錄過了' }
    return withTaskResult(() => {
      usedCodes.value.push(key)
      rentals.value.push({ ...input, code: key, at: fmtDate(new Date()) })
    })
  }

  /** 回到剛註冊完的狀態：等級一、註冊禮 200 點，沒有任何任務紀錄 */
  function resetDemo() {
    checkedIn.value = []
    doneTaskIds.value = []
    rentals.value = []
    usedCodes.value = []
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
    doneTaskIds,
    rentals,
    coupons,
    level,
    levelInfo,
    levelProgress,
    earnedPoints,
    spentPoints,
    points,
    nextLevel,
    draws,
    walletAmount,
    isCheckedIn,
    isTaskDone,
    completedTasks,
    kindProgress,
    foodagriCount,
    rentalCount,
    routeProgress,
    completedRoutes,
    spotById,
    hasRedeemed,
    canRedeem,
    redeem,
    checkIn,
    submitTaskCode,
    logRental,
    resetDemo
  }
}
