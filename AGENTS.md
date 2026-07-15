# AGENTS — sector-rrg 協作規則

本 repo 是公開 GitHub Pages 前端，也是 `HoldingsRadar` 每日排程的部署目標。最高規則見 `C:/Users/User/agent-workspace/brain/PROTOCOL.md`。

## 保護模式

- 本專案涉及公開發布與每日排程，預設採保護模式；每次 push、deploy、排程、資料契約或匯出流程變更都要有 PM 明確授權。
- 2026-07-15 PM 已單次授權 Echo 主導 `Professional Investment Workbench` UI、commit 與 push；這不代表永久開放其他生產變更。
- UI 工作不得更動行情資料、RRG 計算、API、排程、資料格式、`deploy_web.py` 或 `rrg_web_export.py`。

## 開工固定流程

1. 讀 `brain/PROTOCOL.md` 與最新 `brain/CHANGELOG.md`。
2. 依序讀 `PROJECT.md → CHECKPOINT.md → TASKS.md → DECISIONS.md`。
3. 跑 `git status`、`git log -5 --oneline`；若有不明或重疊變更、另一位 Lead 仍在工作、或 merge conflict，停手回報 PM。
4. 禁止讀取任何 `.env`、auth、token、secret、credential、password 類檔案。

## UI 來源同步規則

- 公開 repo 的 `index.html`、`manifest.json`、`sw.js` 每日會由 `C:/Users/User/projects/HoldingsRadar/web/` 覆蓋。
- 修改這三個 UI 檔時，必須同步更新來源端與本 repo，否則下一次排程會把新版 UI 蓋回。
- `rrg_web.json`、`rrg_web_data.js` 是產生檔；UI 任務不得手改、不得納入 UI commit。

## 收尾條件

- 實測 390×844 與 1280×720，確認圖表、控制列、題材選取與 loading／empty／error 狀態。
- console error 為 0；保留資料契約與既有匯出、PWA、下載功能。
- 更新 `CHECKPOINT.md`、`TASKS.md`、`DECISIONS.md`，建立語意清楚 commit；只有 PM 明確授權時才 push。

