/**
 * 合作店家（前台公開展示用）。
 * 與 useAdmin.ts 的 STORES 不同：那份是後台對帳視角（統編、核銷金額），
 * 這份是消費者視角（分類、特色、可折抵資訊）。
 */

export type StoreCategory = 'snack' | 'gift' | 'meal' | 'cafe' | 'experience' | 'stay'

export interface PublicStore {
  id: string
  name: string
  town: string
  category: StoreCategory
  desc: string
  /** 招牌品項 */
  highlight: string
  icon: string
  /** 圖庫示意照 */
  photo: string
  /** 是否為紅點景點所在的店家 */
  nearSpot?: string
}

export const STORE_CATEGORIES: { key: StoreCategory; label: string; icon: string }[] = [
  { key: 'snack', label: '小吃', icon: 'i-lucide-utensils' },
  { key: 'gift', label: '伴手禮', icon: 'i-lucide-gift' },
  { key: 'meal', label: '餐廳', icon: 'i-lucide-chef-hat' },
  { key: 'cafe', label: '咖啡甜點', icon: 'i-lucide-coffee' },
  { key: 'experience', label: '體驗', icon: 'i-lucide-palette' },
  { key: 'stay', label: '住宿', icon: 'i-lucide-bed-double' }
]

export const PUBLIC_STORES: PublicStore[] = [
  { id: 'ps1', name: '北港圓仔湯老店', town: '北港鎮', category: 'snack', desc: '朝天宮廟口飄香一甲子的手工圓仔', highlight: '綜合圓仔湯', photo: '/images/stores/ps1.jpg', icon: 'i-lucide-soup', nearSpot: '北港朝天宮商圈' },
  { id: 'ps2', name: '西螺丸莊醬油', town: '西螺鎮', category: 'gift', desc: '百年黑豆蔭油，老街上的釀造工藝', highlight: '黑豆蔭油禮盒', photo: '/images/stores/ps2.jpg', icon: 'i-lucide-package', nearSpot: '西螺延平老街' },
  { id: 'ps3', name: '虎尾魷魚嘴羹', town: '虎尾鎮', category: 'snack', desc: '在地人從小吃到大的古早味', highlight: '魷魚嘴羹 + 肉燥飯', photo: '/images/stores/ps3.jpg', icon: 'i-lucide-utensils', nearSpot: '虎尾糖廠冰城' },
  { id: 'ps4', name: '華山觀景咖啡', town: '古坑鄉', category: 'cafe', desc: '海拔 700 公尺俯瞰嘉南平原', highlight: '古坑單品手沖', photo: '/images/stores/ps4.jpg', icon: 'i-lucide-coffee', nearSpot: '古坑華山咖啡園區' },
  { id: 'ps5', name: '口湖烏魚子專賣', town: '口湖鄉', category: 'gift', desc: '產地直送，日曬熟成烏魚子', highlight: '一口吃烏魚子', photo: '/images/stores/ps5.jpg', icon: 'i-lucide-fish', nearSpot: '口湖遊客中心' },
  { id: 'ps6', name: '台西蚵嗲本舖', town: '台西鄉', category: 'snack', desc: '現剝鮮蚵現炸，海口味十足', highlight: '特大蚵嗲', photo: '/images/stores/ps6.jpg', icon: 'i-lucide-shell', nearSpot: '台西海口生活館' },
  { id: 'ps7', name: '斗六太平洋樓餐酒', town: '斗六市', category: 'meal', desc: '老街洋樓改造，在地食材創意料理', highlight: '雲林牧場牛小排', photo: '/images/stores/ps7.jpg', icon: 'i-lucide-chef-hat', nearSpot: '斗六太平老街' },
  { id: 'ps8', name: '水林番薯會社', town: '水林鄉', category: 'gift', desc: '地瓜之鄉，現烤蜜番薯與地瓜酥', highlight: '焦糖蜜地瓜', photo: '/images/stores/ps8.jpg', icon: 'i-lucide-sprout', nearSpot: '水林番薯會社' },
  { id: 'ps9', name: '興隆毛巾觀光工廠', town: '虎尾鎮', category: 'experience', desc: '毛巾蛋糕 DIY，把伴手禮捲回家', highlight: '毛巾蛋糕手作', photo: '/images/stores/ps9.jpg', icon: 'i-lucide-palette', nearSpot: '興隆毛巾觀光工廠' },
  { id: 'ps10', name: '古坑咖啡莊園民宿', town: '古坑鄉', category: 'stay', desc: '住進咖啡園，清晨採果體驗', highlight: '雙人房含早餐', photo: '/images/stores/ps10.jpg', icon: 'i-lucide-bed-double' },
  { id: 'ps11', name: '莿桐米食工坊', town: '莿桐鄉', category: 'experience', desc: '西螺米產地的米食手作課', highlight: '米苔目 DIY', photo: '/images/stores/ps11.jpg', icon: 'i-lucide-wheat' },
  { id: 'ps12', name: '崙背手作優格', town: '崙背鄉', category: 'cafe', desc: '酪農專區直送鮮乳製品', highlight: '鮮乳優格聖代', photo: '/images/stores/ps12.jpg', icon: 'i-lucide-ice-cream-bowl' }
]

export function useStores() {
  const category = useState<StoreCategory | 'all'>('storeCategory', () => 'all')

  const filtered = computed(() =>
    category.value === 'all'
      ? PUBLIC_STORES
      : PUBLIC_STORES.filter((s) => s.category === category.value)
  )

  const countByCategory = (key: StoreCategory) =>
    PUBLIC_STORES.filter((s) => s.category === key).length

  const categoryLabel = (key: StoreCategory) =>
    STORE_CATEGORIES.find((c) => c.key === key)?.label ?? ''

  const categoryIcon = (key: StoreCategory) =>
    STORE_CATEGORIES.find((c) => c.key === key)?.icon ?? 'i-lucide-store'

  return { category, filtered, countByCategory, categoryLabel, categoryIcon, stores: PUBLIC_STORES }
}
