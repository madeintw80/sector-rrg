# PROJECT — sector-rrg

建立：2026-07-09  
狀態：Active（production-protected）

## 目標

- 將台股題材資金輪動呈現為可在手機與桌面使用的投資工作台。
- 第一眼回答「目前輪動到哪、下一棒看什麼」，再以 RRG 四象限、題材軌跡與成分股訊號驗證。

## 架構

- `index.html`：無框架單頁前端，含 CSS、RRG SVG 與互動邏輯。
- `rrg_web.json`：每日最新線上資料；除 57 個核心 RRG 題材外，`universe` 另含全部現役上市／上櫃公司、MoneyDJ 題材、官方產業與覆蓋率；前端採 network-first。
- `rrg_web_data.js`：離線 fallback 快照。
- `manifest.json`、`sw.js`、`icons/`：PWA 與離線快取。
- 題材完整性：`HoldingsRadar/build_rrg_universe.py` 每週爬 MoneyDJ 全目錄，並以 TWSE／TPEX 公司基本資料 API 的現行掛牌名冊為母體；目錄未命中者再查 MoneyDJ 個股相關產業頁，兩層皆未命中才以 FinMind 官方產業補底。不能以當日成交行情代替掛牌名冊，否則零成交／暫停交易公司會被漏掉。
- 資料流：`HoldingsRadar/build_rrg_universe.py` → `HoldingsRadar/rrg_web_export.py` → `HoldingsRadar/web/` → `deploy_web.py` 白名單同步 → 本 repo → GitHub Pages。

## 執行方式

- 純靜態網站，可在 repo 根目錄執行：`python -m http.server 8765`。
- 開啟 `http://127.0.0.1:8765/`；不需安裝前端相依套件。

## 測試

- 實際視窗：390×844、1280×720。
- smoke test：資料載入、時間視角、搜尋、象限篩選、題材選取、時間軸、主題切換。
- 完整性 test：現役公司代碼唯一、每家公司至少一個題材、MoneyDJ 分類頁零抓取錯誤，並固定檢查台玻 `1802`、萬潤 `6187`。
- UI 狀態測試：`?ui=loading`、`?ui=empty`、`?ui=error`。
- 確認無水平溢出、主要控制至少約 44px、console error 為 0。

## 部署

- 公開站：`https://madeintw80.github.io/sector-rrg/`。
- 本 repo 為 GitHub Pages 發布 repo；每日排程由 `HoldingsRadar/deploy_web.py` 同步白名單檔並 push。
- 手動 push 或任何部署變更都需 PM 明確授權。

## 已知風險 / 注意事項

- UI 真正來源在 `C:/Users/User/projects/HoldingsRadar/web/`；只改公開 repo 會在下一次排程被覆蓋。
- 產生資料可能在來源 repo 保持未 commit 狀態；UI commit 必須只納入明確 UI 檔案。
- 全市場「公司／題材索引」與「主圖核心 RRG 題材」是兩層資料：所有公司都能搜尋並查看題材，但不把 1,062 個 MoneyDJ 分類全部畫成主圖圓點，以免圖表失去可讀性。

## 產業分類層級

- 掛牌母體：TWSE 上市公司基本資料＋TPEX 上櫃公司基本資料，代碼限 `[1-8]\d{3}` 的公司普通股；目前共 1,927 檔。
- 公司題材層：MoneyDJ 全目錄 1,062 個原始分類，現行公司實際命中 827 類；同一家公司可同時屬於多個題材。目錄未命中時查個股相關產業頁，最後才用 FinMind 官方產業補底；目前 MoneyDJ 1,927／1,927、官方補底 0。
- 核心 RRG 層：人工整理 59 個可讀的核心題材籃子，將金控／銀行／證券合併為金融後為 57 題材；每題材以當日成交額前 8 大成分股計算，前端預設再用題材成交額 100 億門檻顯示活躍題材。
- 官方粗分類層：另保留 FinMind 36 個官方產業別模式，供粗粒度比較；不是目前網站主圖的預設分類。
- 舊 `rrg_themes.json` 的「官方產業母體 2,032」只代表 36 個非「其他」產業籃子內曾出現過的唯一代碼，不是現行掛牌公司數；其中含 169 個非現行掛牌代碼，另漏掉 64 個現行但官方產業為「其他」的公司，所以 `2,032 - 169 + 64 = 1,927`。
