# CHECKPOINT

Updated: 2026-07-16T12:30:36+08:00
Task Lead: Echo
Status: in_progress
Branch: master
Last verified commit: 386c161

## PM requested

- 改善 MoneyDJ 多標籤搜尋：搜尋「散熱」時，不要讓只命中弱關聯標籤的同欣電排在奇鋐、健策、雙鴻等核心散熱股前面。
- 建議先呈現命中的 MoneyDJ 標籤，再依標籤命中數與關聯強度排序個股；公司名／股號精確搜尋維持最高優先。
- 推翻「59 個核心題材只涵蓋 914 檔也可以」的分層假設；新版每一個分類層級都必須涵蓋全部現行普通上市櫃公司。
- 可直接重做分類，優先研究 XQ 的產業分類作為參考；Echo 全權主導修改、測試與 commit，不需再交接給 Batnini。
- 將 RRG 個股覆蓋擴充為全部現役上市、上櫃公司；每家公司都必須有題材對應，不能再因 59 個人工挑選的 MoneyDJ 分類頁而靜默消失。
- 先確認 MoneyDJ 是否真的缺少台玻、萬潤等分類；若 MoneyDJ 有資料，改正來源擷取方式，不無故更換參考來源。
- 修正搜尋提示與實際功能不一致：搜尋需支援題材關鍵字、公司名與股號，`AI 伺服器` 等含空格輸入也要命中，並自動顯示可選建議。

## Completed

- 官方母體最終校正為 1,970 家：四位數普通公司 1,974 家，排除官方產業碼 91／名稱 `-DR` 的 4 檔 TDR。先前 `[1-8]\d{3}` 誤漏 43 家 9xxx 普通公司。
- 完成 XQ 式三層 taxonomy：12 大分類／34 官方產業／229 細產業；每層 assigned=1,970、member_union=1,970、coverage=100%、duplicate_primary=0。
- MoneyDJ 全目錄 1,062／1,062 抓取成功、errors=0；1,969 家由目錄命中，`6741` 由個股頁命中，最終 MoneyDJ 1,970／1,970、官方補底 0。
- 細產業以官方產業為父層，優先選相關 MoneyDJ 主題；少於 4 家的小類合併至同產業綜合類。MoneyDJ 原始 1,062 類仍全數作為多標籤保留。
- `rrg_web.json` 升級 schema v3：12／34／229 類 × week／month／quarter／half／year 全數可計算，1,360／1,360 主角訊號成功，JSON 10.95 MB。
- 前端 UI v3.0.0 新增大分類／產業／細產業切換與穩定分類 ID；同名細產業不再互撞，選「全部」可顯示 12／34／229 個分類。
- 週更正式管線取消人工 59 類與舊 36 類步驟，只重建 `rrg_universe.json` taxonomy SSOT；Telegram RRG 與題材深查同步改讀完整 taxonomy／MoneyDJ 多標籤。
- HoldingsRadar 本機 commit `dd5ea88`；sector-rrg 功能／資料 commit `386c161` 已由 PM 授權後 fast-forward push 至 `origin/master`。
- MoneyDJ 全目錄共 1,062 類，全部分類頁抓取成功、errors=0；TWSE／TPEX 公司基本資料 API 的現行普通股掛牌母體共有 1,927 檔公司。
- 全目錄直接命中 1,926 檔；唯一目錄未命中的 `6741 91APP*-KY` 經 MoneyDJ 個股相關產業頁二次查核，取得 Internet技術與基礎設施、應用軟體、軟體業、電商服務 4 題材。最終 MoneyDJ 覆蓋 1,927／1,927（100%），官方補底 0 檔。
- 修正先前以每日成交行情代替掛牌名冊的口徑錯誤；補回 14 檔仍掛牌但當日零成交／無行情公司，包含 `1589 永冠-KY`，其成交額保留為 0 而不再從索引消失。
- 對帳舊官方題材檔的「2,032 檔」：它是 36 個非「其他」產業籃子內的唯一歷史代碼，不是現行掛牌名冊；扣除 169 個非現行掛牌代碼、補回 64 個現行但官方產業為「其他」的公司後，`2,032 - 169 + 64 = 1,927`。
- `1802 台玻` 命中 6 題材：傳產其他、印刷電路板相關、建材、玻璃、玻纖布、複合材料。
- `6187 萬潤` 命中 2 題材：封測用設備、設備儀器商。
- 新增 `HoldingsRadar/build_rrg_universe.py`，週更流程擴為三步；擷取失敗、目錄少於 1,000 類、現役公司少於 1,900 檔或 MoneyDJ 覆蓋低於 80% 時不覆蓋舊檔。
- `rrg_web.json`／離線快照新增 `coverage` 與 `universe`；前端 UI v2.1.2 可搜尋所有公司、股號及 MoneyDJ 題材，並區分「MoneyDJ 全產業目錄／個股相關產業」來源。
- HoldingsRadar 本機實作 commits：`8b43010`、`7fc0c77`；sector-rrg 本機功能 commits：`d77d972`、`32bd5d3`。皆未 push。
- 現行掛牌母體修正 commits：HoldingsRadar `33e6784`；sector-rrg `c57262c`。皆未 push。
- PM 於 2026-07-16 明確回覆 `push`；已將 `d349298..c91d53f` 以 fast-forward 推送至 `origin/master`，無遠端分岔或強制推送。
- 公開 GitHub Pages 已實測為 `UI v2.0.4`；智慧搜尋、桌機寬版、字級與對比修正均已上線，PWA cache 為 `rrg-v2.0.4`。
- 搜尋索引擴充為題材名稱、公司名、股號；比對會忽略空格、連字號與常見分隔符，`AI 伺服器` 可正確命中 `AI伺服器`。
- 新增即時搜尋建議，清楚標示「題材」或「個股」及所屬題材；支援滑鼠、方向鍵、Enter 與 Esc。
- 選取公司後會直接開啟所屬題材，將命中公司置頂高亮；若成交值或象限篩選擋住該結果，會自動解除衝突條件。
- 無建議時顯示「找不到題材、公司名或股號」，搜尋框與空結果文案不再只描述題材。
- PWA cache 更新為 `rrg-v2.0.4`，畫面版本更新為 `UI v2.0.4`。
- `HoldingsRadar/web/` 來源 UI 本機 commit：`c3b07ee`（只含 `index.html`、`sw.js`）。
- `sector-rrg` 公開 repo 本機實作 commit：`2d7e7f0`（只含 `index.html`、`sw.js`）。
- 主內容最大寬度由 1240px 放寬為 1760px；桌機右欄改為 360–440px 自適應，圖表會使用其餘空間。
- 1280px 以上採 16px 正文與較大標題／控制項；1600px 以上採 17px 正文、15px 成分股主文字與 13–14px 輔助資訊。
- 720px 以下的手機規則未修改，維持既有字級、單欄排列與觸控尺寸。
- PWA cache 更新為 `rrg-v2.0.3`，畫面版本更新為 `UI v2.0.3`。
- `HoldingsRadar/web/` 來源 UI 本機 commit：`550f7ae`（只含 `index.html`、`sw.js`）。
- `sector-rrg` 公開 repo 本機實作 commit：`a793c5c`（只含 `index.html`、`sw.js`）。
- 修正 `.legend-btn.sel` 的 CSS specificity：選取文字改用 `--btn-on-ink`，會隨深／淺主題的選取底色切換正確高對比字色。
- 選取文字加粗為 700；未選取分類透明度由 0.42 提高為 0.72，避免其餘選項也過淡。
- PWA cache 更新為 `rrg-v2.0.2`，畫面版本更新為 `UI v2.0.2`。
- `HoldingsRadar/web/` 來源 UI 本機 commit：`2f3bdcc`（只含 `index.html`、`sw.js`）。
- `sector-rrg` 公開 repo 本機實作 commit：`99e6ac7`（只含 `index.html`、`sw.js`）。

## Current state

- taxonomy v3、RRG 資料、UI 與週更／每日排程程式皆已完成並驗證。
- `HoldingsRadar` 完成本機 commit `dd5ea88`；此 repo 未設定 git remote，因此沒有可推送目的地。
- `sector-rrg/master` 已 push；GitHub Pages 公開檔案已確認 UI v3、PWA cache v3、schema v3 與 1,970 家資料生效。

## Verification

- 正常 TLS 下重爬 MoneyDJ 1,062／1,062、errors=0；公司 1,970 unique，9xxx 硬性樣本全在，`9103／9105／9110／9136` TDR 全不在。
- taxonomy：sector 12／industry 34／subindustry 229；三層皆 assigned=1,970、union=1,970、coverage=1.0、duplicate=0。
- RRG schema v3：三層 month 類別 ID 分別 12／34／229 unique，全部 `status=ok`；其餘四 spans 亦全部可計算。
- 本機瀏覽器：選「全部」實測依序畫出 12／34／229 點；台玻顯示「原物料 → 玻璃陶瓷 → 玻璃陶瓷綜合」，萬潤連到「封測用設備」，寶成 `9904` 連到「運動用品」。
- 390×844：document body 寬 375px、三個層級按鈕各 105px、無水平溢出；Browser console error／warning 0。
- 公開檔案驗證：`UI v3.0.0=True`、`level_control=True`、`rrg-v3.0.0=True`、`schema_version=3`、`companies=1970`、JSON 11,486,083 bytes。
- 正常 TLS 憑證驗證下重爬 MoneyDJ 1,062／1,062 類成功，零分類頁錯誤；再複核 1 個目錄未命中公司的 MoneyDJ 個股頁，輸出 1,927 unique codes、0 topicless、1,927 MoneyDJ、0 official fallback。
- `rrg_web_export.py` 完成 57 題材 × 5 spans、359／359 檔訊號與 1,927 檔全市場輸出；JSON 約 2.30 MB。
- AST 2／2、1,927 unique、0 topicless、14 檔零成交公司全部存在且 `tv=0`；兩個 repo 的 UI／資料四檔 SHA-256 一致，`git diff --check` 通過。
- 本機瀏覽器實測 `1802`、`6187`、`6741`、`2330`、`1589` 及題材關鍵字 `玻璃`：公司卡、MoneyDJ 題材、個股頁二次查核來源與既有 RRG 題材連動皆正確；`1589 永冠-KY` 顯示成交額 0 億與「機械零組件」，UI v2.1.2 正確顯示全市場 1,927 檔。
- 390×844 實測台玻卡片左右界線 30–345px，document/body scroll width 375px，無水平溢出；Browser console error／warning：0。
- AST 3／3、PowerShell launcher 語法、JSON 完整性斷言與 `git diff --check` 通過；兩個 repo 的 `index.html`、`sw.js`、`rrg_web.json`、`rrg_web_data.js` SHA-256 全數一致。
- 發布前 `git fetch origin --prune` 後確認 `HEAD...origin/master` 為 `8 0`，只有本機領先；`git push origin master` 成功：`d349298..c91d53f`。
- 公開頁 `https://madeintw80.github.io/sector-rrg/?verify=20260716-v204` 顯示 `UI v2.0.4`，資料日期 2026-07-15，主圖與題材下鑽正常。
- 公開頁輸入 `AI 伺服器` 顯示「題材｜AI伺服器｜13 檔成分股」；輸入 `2330` 顯示「個股｜台積電 2330｜所屬題材：晶圓代工」。
- 點選公開站的 `2330` 建議後成功進入晶圓代工，台積電列置頂；公開 `sw.js` 顯示 `const CACHE = 'rrg-v2.0.4'`，Browser console error／warning：0。
- `AI 伺服器`：忽略空格後顯示唯一「題材｜AI伺服器」建議，圖表與題材清單均正確過濾。
- `2330`／`台積電`：均顯示「個股｜台積電 2330｜所屬題材：晶圓代工」；點選後開啟晶圓代工並將台積電置頂高亮。
- 低成交題材測試 `2634`：預設 100 億門檻下原本為空；點選「漢翔 2634」後自動切至「全部」、開啟軍工國防並高亮漢翔。
- 鍵盤測試：ArrowDown 設定 active option、Enter 選取 AI伺服器並開啟題材、Esc 關閉建議。
- 390×844：建議框寬 317.3px，位於 375px client width 內；選項高 56.5px、輸入字級 15px，頁面與選單無水平溢出。
- 深／淺主題建議框文字與底色正常；主頁 Browser console error／warning：0。
- 390×844 強制 loading／empty／error 狀態皆正常，建議框保持關閉且無水平溢出。
- `git diff --check` 通過；兩個 repo UI 檔 SHA-256 一致；資料、計算、API、排程與部署程式未修改。
- 1280×720：正文 16px、內容區 1264.7px、圖表 820.7px、右欄 360px，無水平溢出。
- 1440×900：正文 16px、內容區 1424.7px、圖表 937.5px、右欄 403.2px，無水平溢出。
- 2048×1024：正文 17px、標題 32px、內容區 1760px、圖表 1236px、右欄 440px；成分股主文字 15px，右欄與每列均無溢出。
- 2560×1280：內容區維持 1760px，左右各約 400px 留白，避免超寬螢幕視線跨度過長；相較原 1240px 顯著放寬。
- 390×844：仍為正文 15px、標題 22px、圖例 12px、單欄 346.7px；成分股清單與頁面均無水平溢出。
- 實測時間視角、搜尋、分類篩選、深／淺主題切換；主頁 Browser console error／warning：0。
- 390×844 強制 loading／empty／error 狀態皆可顯示且無水平溢出。
- `git diff --check` 通過；兩個 repo 對應 UI 檔 SHA-256 一致；資料、計算、API、排程與部署程式未修改。
- 1280×720 深色模式：選取底色 `rgb(220,232,239)`、文字 `rgb(11,17,23)`，WCAG 對比 15.21:1。
- 1280×720 淺色模式：選取底色 `rgb(19,35,49)`、文字白色，WCAG 對比 16:1。
- 390×844：頁面 client width 與 scroll width 均 375px，無水平溢出；選取字重 700、未選透明度 0.72。
- Browser console error／warning：0；`git diff --check` 通過。
- 兩個 repo 對應檔案 SHA-256 一致；行情資料、RRG 計算、API、排程、輸出格式與資料檔未修改。

## Decisions and assumptions

- 「全市場覆蓋」定義為 TWSE／TPEX 公司基本資料 API 中代碼符合 `[1-8]\d{3}` 的現行掛牌公司普通股；排除 ETF、ETN、權證、DR 與興櫃，並保留零成交／暫停交易公司。
- MoneyDJ 完整題材是公司資料／搜尋層；現有 57 個合併題材是 RRG 計算與主圖層。未落入 57 個核心題材的公司仍會顯示所有 MoneyDJ 題材，但不捏造 RRG 座標。
- 搜尋建議以 10 筆為上限；題材完全／前綴匹配優先，再依所屬題材成交額排序個股結果。
- 使用者明確選取建議時，結果可自動解除會擋住目標的成交值或象限篩選；直接輸入但未選取時仍保留既有篩選條件。
- 超寬桌機保留適度邊界，不把內容無上限拉滿；1760px 在資訊密度與閱讀視線跨度間折衷。
- 桌機用 1280px／1600px 兩段式放大，避免同一套大字套到手機造成擁擠。
- 沿用既有主題變數，不寫死單一顏色；確保深色與淺色模式都使用與選取底色配對的前景色。
- PM 於 2026-07-16 明確授權 push；依生產保護規則完成公開發布與線上驗證。

## Next actions

- 無 action-required；本回合不建立 Batnini handoff。

## Risks / blockers

- MoneyDJ 為外部公開網站；週更爬蟲已限制 4 workers、重試三次，且任一分類頁失敗就拒絕覆蓋舊檔，避免靜默產生殘缺資料。
- GitHub Pages 的 schema v3 JSON 約 10.95 MB，比舊版 2.30 MB 大；目前本機與公開抓取正常，後續若手機載入變慢可再做跨 span 成分股去重壓縮。

## Previous eval_records (pending Batnini transcription)

```json
{"task_id":"CE-005","completed_at":"2026-07-15T19:24:56+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"standard","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","elapsed_minutes":25,"requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit 088c72a","projects/sector-rrg commits a3bff54 and cee758e","projects/sector-rrg/CHECKPOINT.md","public GitHub Pages UI v2.0.1"],"notes":"完成燈號、主角與 RSI 使用說明、響應式驗證及 PM 授權後公開發布；公開頁 HTTP 200 驗證通過"}
```

```json
{"task_id":"CE-006","completed_at":"2026-07-15T22:39:12+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"quick","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","elapsed_minutes":15,"requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit 2f3bdcc","projects/sector-rrg commit 99e6ac7","projects/sector-rrg/CHECKPOINT.md","dark contrast 15.21:1 and light contrast 16:1"],"notes":"修正題材分類選取文字的主題色覆蓋問題，提高未選項目可讀性，並完成桌機雙主題與手機版驗證；依生產保護規則尚未 push"}
```

## Previous eval_record (CE-007, pending Batnini transcription)

```json
{"task_id":"CE-007","completed_at":"2026-07-15T22:55:11+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"standard","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","elapsed_minutes":35,"requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit 550f7ae","projects/sector-rrg commit a793c5c","projects/sector-rrg/CHECKPOINT.md","responsive tests at widths 390, 1280, 1440, 2048 and 2560"],"notes":"放寬桌機內容區並以兩段式斷點放大字級及成分股右欄；手機規則維持不變，多尺寸、互動與 UI 狀態驗證通過，依保護規則尚未 push"}
```

## eval_record

```json
{"task_id":"CE-008","completed_at":"2026-07-15T23:09:16+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"standard","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","elapsed_minutes":25,"requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit c3b07ee","projects/sector-rrg commit 2d7e7f0","projects/sector-rrg/CHECKPOINT.md","browser tests for AI space query, 2330, 台積電, 2634, keyboard and 390px mobile","public GitHub Pages UI v2.0.4"],"notes":"搜尋擴充至題材、公司名與股號，加入可存取的即時建議、直接題材下鑽與公司高亮；低成交篩選衝突可自動解除，多尺寸與 UI 狀態驗證通過；PM 於 2026-07-16 授權後已公開發布並再次實測"}
```

## eval_record (CE-009)

```json
{"task_id":"CE-009","completed_at":"2026-07-16T11:54:17+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"deep","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit dd5ea88","projects/sector-rrg commit 386c161","12/34/229 levels each cover 1970/1970","public GitHub Pages UI v3.0.0 and schema v3"],"notes":"推翻 59 類部分覆蓋架構，建立 XQ 式三層完整 taxonomy，修正 9xxx 母體遺漏，更新 RRG、UI、Telegram 與週更管線，經 PM 授權後公開發布"}
```
