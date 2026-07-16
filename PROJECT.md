# PROJECT — sector-rrg

建立：2026-07-09  
狀態：Active（production-protected）

## 目標

- 將台股全市場產業資金輪動呈現為可在手機與桌面使用的投資工作台。
- 第一眼回答「目前輪動到哪、下一棒看什麼」，再以 RRG 四象限、分類軌跡與成分股訊號驗證。

## 架構

- `index.html`：無框架單頁前端，含 CSS、RRG SVG 與互動邏輯。
- `rrg_web.json`：schema v3 每日資料；含 12／34／229 個三層 RRG 分類、1,970 家全市場公司索引、MoneyDJ 多標籤與逐層覆蓋率；前端採 network-first。
- `rrg_web_data.js`：離線 fallback 快照。
- `manifest.json`、`sw.js`、`icons/`：PWA 與離線快取。
- 分類完整性：`HoldingsRadar/build_rrg_universe.py` 以 TWSE／TPEX 公司基本資料 API 的現行掛牌名冊為母體，每週爬 MoneyDJ 全目錄；目錄未命中者再查 MoneyDJ 個股相關產業頁。不能以當日成交行情代替掛牌名冊，否則零成交／暫停交易公司會被漏掉。
- 資料流：`HoldingsRadar/build_rrg_universe.py` → `HoldingsRadar/rrg_web_export.py` → `HoldingsRadar/web/` → `deploy_web.py` 白名單同步 → 本 repo → GitHub Pages。

## 執行方式

- 純靜態網站，可在 repo 根目錄執行：`python -m http.server 8765`。
- 開啟 `http://127.0.0.1:8765/`；不需安裝前端相依套件。

## 測試

- 實際視窗：390×844、1280×720。
- smoke test：資料載入、時間視角、搜尋、象限篩選、題材選取、時間軸、主題切換。
- 完整性 test：現役公司代碼唯一、每家公司在三層各有且只有一個分類、MoneyDJ 分類頁零抓取錯誤，並固定檢查台玻 `1802`、萬潤 `6187` 與 9xxx 公司。
- UI 狀態測試：`?ui=loading`、`?ui=empty`、`?ui=error`。
- 確認無水平溢出、主要控制至少約 44px、console error 為 0。

## 部署

- 公開站：`https://madeintw80.github.io/sector-rrg/`。
- 本 repo 為 GitHub Pages 發布 repo；每日排程由 `HoldingsRadar/deploy_web.py` 同步白名單檔並 push。
- 手動 push 或任何部署變更都需 PM 明確授權。

## 已知風險 / 注意事項

- UI 真正來源在 `C:/Users/User/projects/HoldingsRadar/web/`；只改公開 repo 會在下一次排程被覆蓋。
- 產生資料可能在來源 repo 保持未 commit 狀態；UI commit 必須只納入明確 UI 檔案。
- 1,062 個 MoneyDJ 類別保留為可搜尋的多標籤，不直接當成互斥 RRG 分類；三層 taxonomy 才是正式分類 SSOT。

## 產業分類層級

- 掛牌母體：TWSE 上市公司基本資料＋TPEX 上櫃公司基本資料，納入四位數公司普通股；排除產業碼 `91`／名稱 `-DR` 的 4 檔 TDR，目前共 1,970 家。先前 `[1-8]\d{3}` 規則誤漏 43 家合法 9xxx 公司。
- 大分類（sector）：12 類，參考 XQ 的「產業群 → 產業 → 細產業」資訊架構，自行依官方產業碼映射；1,970／1,970。
- 產業（industry）：34 類，直接使用現行 TWSE／TPEX 官方產業碼；1,970／1,970。
- 細產業（subindustry）：229 類，在官方產業父層內選 MoneyDJ 主題；少於 4 家的小類合併至同產業綜合類，避免一股成類；1,970／1,970。
- MoneyDJ 多標籤：全目錄 1,062 類，現行實際命中 827 類；1,969 家由目錄命中，`6741` 由個股相關產業頁命中，合計 1,970／1,970。多標籤不受互斥分類合併影響。
- RRG 代表股：每分類以當日成交額前 8 家合成指數；這只影響座標計算，不改變成員歸屬與覆蓋率。前端可切換三層，成交額門檻只是顯示篩選。
- 舊人工 59→57 題材與 FinMind 36 類檔退出正式管線；每週刷新只重建 `rrg_universe.json` taxonomy SSOT。
