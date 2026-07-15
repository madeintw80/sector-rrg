# CHECKPOINT

Updated: 2026-07-15T13:44:00+08:00
Task Lead: Echo
Status: ready_for_review
Branch: master
Last verified commit: 0931a14

## PM requested

- 將 `sector-rrg` 整理成 `Professional Investment Workbench`，直接完成、commit 並 push。
- 第一眼先回答「目前輪動到哪、我該看什麼」，補齊訊號層級與可靠的 loading／empty／error state。
- 不更動行情資料、RRG 計算、API、排程、輸出格式或部署設定。

## Completed

- 完成治理、git、公開桌面／手機 UI 與部署同步路徑盤點。
- UI 方向選定為「決策摘要 → 訊號卡 → 時間視角 → RRG 下鑽」。
- staging 版已完成主要資訊架構、響應式控制列、題材下鑽與狀態設計。
- 已補齊 `AGENTS.md`、`PROJECT.md`、`CHECKPOINT.md`、`TASKS.md`、`DECISIONS.md`。

## Current state

- 本機瀏覽器 smoke test 與視覺 QA 已完成。
- 正式 repo 尚未寫入，下一步是同步來源端與公開 repo 後 commit／push。

## Verification

- 390×844：無水平溢出；主要控制 44–52px；決策摘要、訊號卡、控制列與 333×326 圖表正常。
- 1280×720：無水平溢出；工作區為圖表＋360px 題材明細雙欄。
- 圖表載入 31 個預設可見題材、SVG 88 個繪圖節點；資料日期 2026-07-14。
- 題材點擊：`光學鏡頭` 可下鑽 17 檔成分股與紅／黃／綠燈；時間視角切換後 slider max 19→4、決策摘要同步更新。
- loading／empty／error state 均實看；empty 可清除篩選恢復 57 個題材；error 有原因與重試。
- Browser console error／warning：0；`manifest.json` 解析成功；44 個 HTML id 無重複。
- `rrg_web.json`、`rrg_web_data.js` SHA-256 與正式 repo 相同，確認未修改資料。

## Decisions and assumptions

- `HoldingsRadar/web/` 是 UI 真正來源；正式落地需同步三個 UI 檔，避免每日排程覆蓋。
- 本次為 PM 單次明確授權，不放寬資料、排程與部署程式的保護範圍。

## Next actions

1. 完成本機 smoke test與修正。
2. 同步來源端與公開 repo，精準 commit UI 檔後 push。
3. 驗證 GitHub Pages 新版。

## Risks / blockers

- `HoldingsRadar` 目前已有 `web/rrg_web.json`、`web/rrg_web_data.js` 產生檔變更；必須保留且不得混入 UI commit。
