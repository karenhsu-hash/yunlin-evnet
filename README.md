# 雲林縣觀光促進活動 — 前端介面示意

依 `docs/雲林觀光案_服務建議書.docx` 的活動機制（折價券 ＋ 店家核銷），以 **Nuxt 4 + Vue 3 + Nuxt UI 4 + Tailwind CSS 4** 製作的響應式網頁（web first、RWD 向下相容手機）畫面示意。

介面全面使用 Lucide 圖示，不使用 emoji。

> 目前為**純前端示意**：所有資料來自 `app/composables/` 的模擬資料，尚未接後端 API。

## 本機執行

需求：Node 20.19+ 或 22.12+（目前環境為 v24.13.0）、pnpm（目前 10.33.4）。

```bash
cd /Users/user/Desktop/new/yunlin-events
pnpm install     # 第一次或換機時才需要
pnpm dev         # → http://localhost:3000
```

按 `Ctrl + C` 結束。其他指令：

| 指令 | 用途 |
| --- | --- |
| `pnpm dev` | 開發模式，改檔即時更新 |
| `pnpm build` + `pnpm preview` | 正式建置後在本機預覽 |
| `pnpm generate` | 產生純靜態檔到 `.output/public/`，可直接丟主機 |

### 手機實機測試

```bash
pnpm dev --host
```

手機與電腦連同一個 Wi-Fi，開 `http://<你的區網IP>:3000`（用 `ipconfig getifaddr en0` 查 IP）。

### 埠被占用時

Nuxt 遇到 3000 被占用會**自動改用 3001、3002**，而不是報錯 —— 很容易誤以為在看新版，實際上連到的是舊的 server。啟動後請確認終端機印出的 `Local:` 是哪個埠。

要確實關掉殘留的 server（`pkill -f "nuxt dev"` 抓不到，因為實際指令是 `node .../nuxt.mjs dev`）：

```bash
pkill -f "yunlin-events"     # 以專案路徑比對，不會誤殺其他專案
lsof -i :3000                # 確認 3000 已淨空
```

修改 `app/assets/css/main.css` 的 `@theme`（例如新增顏色）後**必須重啟** dev server；只有 `.vue` 檔的變更會透過 HMR 即時生效。

## 頁面結構

分成三種使用者端，頂部導覽列右側的「端點切換」可在三者之間跳轉。

### 旅客端（頂部導覽：首頁／活動景點／合作店家／掃碼打卡／加碼抽獎）

| 路徑 | 頁面 | 內容 | 需登入 |
| --- | --- | --- | --- |
| `/` | 首頁 | 形象展示（主視覺、活動主張、玩法）＋ 合作店家 ＋ 附近亮點 ＋ 加碼抽獎 ＋ FAQ | 個人區塊 |
| `/events` | 活動頁 | 紅綠景點地圖／清單、篩選、紅配綠規則說明 | 否 |
| `/stores` | 合作店家 | 六大分類篩選、店家卡、折價券使用說明 | 否 |
| `/lottery` | 抽獎頁 | 本週獎項、每週開獎、抽獎說明 | 我的次數／紀錄 |
| `/checkin` | 打卡頁 | 掃碼動畫 → 經緯度比對 → 綁定會員去重 → 觸發自動發券 | 是 |
| `/member` | 會員中心 | 任務進度／我的折價券／核銷紀錄／抽獎紀錄 | 是 |
| `/login` | 會員登入 | 手機 + 驗證碼，另有「示範帳號快速登入」 | — |
| `/register` | 註冊流程 | 手機驗證 → 基本資料 → 在地外地身分 → LINE 綁定（完成即登入） | — |

**登入分界**：首頁、景點、店家、抽獎辦法皆為公開的形象與招商內容；
任務進度、券包、核銷與抽獎紀錄等個人資料一律登入後才顯示，未登入時以 `LoginGate`
元件顯示登入／註冊引導。登入狀態存於 cookie（`yl_logged_in`），重新整理不會被登出，
SSR 也能取得，因此不會有 hydration 落差。

### 店家端

| 路徑 | 頁面 | 內容 |
| --- | --- | --- |
| `/redeem` | 核銷頁 | 四步驟：出示券 → 輸入金額 → 專屬核銷碼 → 完成，含本店核銷清單 |

### 管理後台（`app/layouts/admin.vue`）

| 路徑 | 頁面 | 內容 |
| --- | --- | --- |
| `/admin` | 儀表板 | KPI、每週發券／核銷長條圖、好友與會員成長、參與漏斗、景點排行、異常告警 |
| `/admin/data` | 資料維護 | 會員／景點與 QR／合作店家／活動參數 |
| `/admin/reports` | 報表請款 | 店家核銷週報、全案核銷總表、活動成效（GA、漏斗、消費結構） |
| `/admin/lottery` | 抽獎名單 | 資格條件設定 → 產生中獎名單 → 匯出 |

後台的「管理／主辦唯讀」切換可示範權限分層；報表與名單的匯出鈕會實際下載 CSV（含 BOM，Excel 可直接開啟）。

## 已落實的活動規則

規則集中在 `app/composables/useCampaign.ts`，改這裡即可調整參數：

- **紅配綠**：紅點 10 處（需現場消費滿 300 元）＋ 綠點 10 處（拍照打卡即可），共 20 組 QR。
- **三段任務**：一紅一綠為一組，依序解鎖 250 / 250 / 500，每人上限 1,000 元。
- **即時發券**：完成階段條件即自動核發，不設審核佇列。
- **券規則**：不找零、最低消費一律 300 元（500 元券亦同，不分級）、有效期 30 天。
- **去重**：同一會員於同一景點僅計一次。
- **核銷**：店家零設備、零掃描；核銷碼（示意值 `2468`）對消費者隱藏。

## 專案結構

```
nuxt.config.ts              # 模組（@nuxt/ui）、CSS 進入點、head 設定
app/
  app.config.ts             # Nuxt UI 色彩別名（primary=vermilion…）
  assets/css/main.css       # Tailwind v4 @theme：色票、圓角、陰影、動畫、圖表色階
  composables/
    useCampaign.ts          # 景點資料、活動參數、三段任務規則引擎
    useMember.ts            # 註冊流程驗證、在地外地交叉判別、會員紀錄
    useLottery.ts           # 抽獎資格加權、週次與獎項
    useStores.ts            # 合作店家（消費者視角：分類、特色、招牌）
    useAdmin.ts             # 後台統計、漏斗、店家與會員資料、CSV 匯出
  layouts/
    default.vue             # 網頁外框：UHeader 頂部導覽（行動裝置自動收合）+ 頁尾
    admin.vue               # 後台外框：深色頂欄 + 權限切換
  components/               # StageProgress / SpotCard / StoreCard / CouponCard
                            # SectionHead / StatTile / LoginGate / Chart*
  pages/                    # index、events、stores、checkin、redeem、login、
                            # register、member、lottery、
                            # admin/{index,data,reports,lottery}
public/images/              # 主視覺與橫幅（來自 docs/）
  spots/                    # 20 張景點示意照（圖庫圖，待換成實拍）
  stores/                   # 12 張店家示意照（圖庫圖，待換成實拍）
```

> Nuxt 4 預設的原始碼目錄是 `app/`；`nuxt.config.ts`、`public/`、`server/` 仍留在專案根目錄。

## 設計基準

- 色票取自活動主視覺：磚紅 `vermilion`、草綠 `moss`、芥末黃 `marigold`、天空藍 `sky`、土棕 `clay`（店家端）、紙感底色 `paper`。
- 網頁版版型：內容以 `.container-page`（max-w-7xl）收斂，桌機為多欄，`lg` 以下自動收合為單欄；表單型頁面用較窄的 `.container-narrow`。
- 導覽：桌機為頂部橫向導覽，行動裝置由 `UHeader` 收進側滑選單。核銷與後台屬不同使用者，改由頂欄的「端點切換」進入。
- 圖示一律使用 Lucide（`i-lucide-*`），專案內不含任何 emoji。
- 已驗證 390 / 820 / 1440px 三種寬度皆無水平溢出，全站無 hydration mismatch。
- 景點與店家卡片使用圖庫示意照（存於 `public/images/`，執行時不依賴外部網路），
  正式上線請替換為實拍照片。

### 圖表色階

UI 色票為了紙感風格而彩度偏低，直接拿來畫圖會被判定成灰色且對比不足，因此另取同色相的加深版本，定義在 `app/assets/css/main.css` 的 `@theme` 中（`--color-chart-*`）：

| 用途 | 色碼 | 檢核結果 |
| --- | --- | --- |
| 發券金額 | `#B37F06` | 與核銷的 CVD ΔE 22.1、正常視覺 ΔE 26.9 |
| 核銷金額 | `#0E6FA5` | 同上，四項檢核全數通過 |
| 紅點 | `#C4402E` | 與綠點 CVD ΔE 7.9（落在 6–8 下限帶） |
| 綠點 | `#2E7D53` | 故一律搭配圖例＋直接標籤等次要編碼 |

其餘規則：兩個系列共用一條 Y 軸（不用雙軸）、成長改用單系列小倍數圖、漏斗為單一色相循序色階、長條圖提供「看表格」切換以符合無障礙。

## 後續銜接

接上真實 API 時，只需替換 `composables/` 內各檔的讀寫來源，畫面層可維持不動。目前所有互動（打卡發券、核銷扣券、註冊、名單產生）皆在前端狀態中完成，重新整理即回到初始值。
