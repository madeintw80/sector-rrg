# CHECKPOINT

Updated: 2026-07-15T22:58:51+08:00
Task Lead: Echo
Status: in_progress
Branch: master
Last verified commit: a793c5c

## PM requested

- 修正搜尋提示與實際功能不一致：搜尋需支援題材關鍵字、公司名與股號，`AI 伺服器` 等含空格輸入也要命中，並自動顯示可選建議。

## Completed

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

- 正在擴充前端搜尋索引與可存取的即時建議介面；前兩輪本機 UI commits 尚未 push。

## Verification

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

- 超寬桌機保留適度邊界，不把內容無上限拉滿；1760px 在資訊密度與閱讀視線跨度間折衷。
- 桌機用 1280px／1600px 兩段式放大，避免同一套大字套到手機造成擁擠。
- 沿用既有主題變數，不寫死單一顏色；確保深色與淺色模式都使用與選取底色配對的前景色。
- 本回合 PM 要求修正，但未再次授權 push；依生產保護規則停在本機 commit。

## Next actions

1. 完成搜尋與建議選單，實測題材、空格、公司名、股號、鍵盤與手機版後同步兩個 repo。

## Risks / blockers

- 無程式 blocker；公開站尚未發布 `UI v2.0.2` 對比修正與本次 `UI v2.0.3` 桌機寬版。
- `HoldingsRadar` 原有 `web/rrg_web.json`、`web/rrg_web_data.js` 產生檔變更仍保留，未納入本次 commit、未修改或清除。

## Previous eval_records (pending Batnini transcription)

```json
{"task_id":"CE-005","completed_at":"2026-07-15T19:24:56+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"standard","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","elapsed_minutes":25,"requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit 088c72a","projects/sector-rrg commits a3bff54 and cee758e","projects/sector-rrg/CHECKPOINT.md","public GitHub Pages UI v2.0.1"],"notes":"完成燈號、主角與 RSI 使用說明、響應式驗證及 PM 授權後公開發布；公開頁 HTTP 200 驗證通過"}
```

```json
{"task_id":"CE-006","completed_at":"2026-07-15T22:39:12+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"quick","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","elapsed_minutes":15,"requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit 2f3bdcc","projects/sector-rrg commit 99e6ac7","projects/sector-rrg/CHECKPOINT.md","dark contrast 15.21:1 and light contrast 16:1"],"notes":"修正題材分類選取文字的主題色覆蓋問題，提高未選項目可讀性，並完成桌機雙主題與手機版驗證；依生產保護規則尚未 push"}
```

## eval_record

```json
{"task_id":"CE-007","completed_at":"2026-07-15T22:55:11+08:00","task_type":"implementation","lead":"echo","mode":"solo","effort":"standard","outcome":"success","one_pass":true,"pm_restatement_count":0,"rework_required":false,"reviewer":"none","review_value":"not_applicable","handoff_applicable":false,"handoff_success":"not_applicable","safety_gate":"pass","elapsed_minutes":35,"requested_model":"not_applicable","actual_model":"not_applicable","evidence":["projects/HoldingsRadar commit 550f7ae","projects/sector-rrg commit a793c5c","projects/sector-rrg/CHECKPOINT.md","responsive tests at widths 390, 1280, 1440, 2048 and 2560"],"notes":"放寬桌機內容區並以兩段式斷點放大字級及成分股右欄；手機規則維持不變，多尺寸、互動與 UI 狀態驗證通過，依保護規則尚未 push"}
```
