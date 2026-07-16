# AGENTS — sector-rrg 協作規則

本 repo 是公開 GitHub Pages 前端，也是 `HoldingsRadar` 每日排程的部署目標。最高規則見 `C:/Users/User/agent-workspace/brain/PROTOCOL.md`。

## 保護模式

- 本專案涉及公開發布與每日排程，預設採保護模式；每次 push、deploy、排程、資料契約或匯出流程變更都要有 PM 明確授權。
- 2026-07-15 PM 已單次授權 Echo 主導 `Professional Investment Workbench` UI、commit 與 push；這不代表永久開放其他生產變更。
- 2026-07-16 PM 已單次授權 Echo 將受控題材標籤 RRG 併入本次 UI 重構，可修改本機匯出計算、schema、產生檔並 commit；仍不得 push／deploy，公開發布需另行確認。
- 未取得同等明確授權時，UI 工作不得更動行情資料、RRG 計算、API、排程、資料格式、`deploy_web.py` 或 `rrg_web_export.py`。

## 開工固定流程

1. 讀 `brain/PROTOCOL.md` 與最新 `brain/CHANGELOG.md`。
2. 依序讀 `PROJECT.md → CHECKPOINT.md → TASKS.md → DECISIONS.md`。
3. 跑 `git status`、`git log -5 --oneline`；若有不明或重疊變更、另一位 Lead 仍在工作、或 merge conflict，停手回報 PM。
4. 禁止讀取任何 `.env`、auth、token、secret、credential、password 類檔案。

## UI 來源同步規則

- 公開 repo 的 `index.html`、`manifest.json`、`sw.js` 每日會由 `C:/Users/User/projects/HoldingsRadar/web/` 覆蓋。
- 修改這三個 UI 檔時，必須同步更新來源端與本 repo，否則下一次排程會把新版 UI 蓋回。
- `rrg_web.json`、`rrg_web_data.js` 是產生檔，絕對不得手改；只有 PM 明確授權資料契約／匯出任務時，才可由正式 pipeline 重建、驗證並納入對應 commit。
- 題材標籤 RRG 必須維持獨立模式，不得偽裝成第四層產業分類，也不得同時將全部 MoneyDJ 標籤畫上主圖。

## 收尾條件

- 實測 390×844、1280×720 與桌機寬版；手機需逐一驗證「輪動圖／設定／下鑽」分頁、至少 44px 觸控尺寸、搜尋選標籤、公司圖卡與無水平溢出。
- 題材模式需驗證搜尋／自選入口、12／20 上限、至少 5 家、別名合併、30% 權重上限、60% 主導警告及五個時間視角。
- console error 為 0；保留資料契約與既有匯出、PWA、下載功能。
- 更新 `CHECKPOINT.md`、`TASKS.md`、`DECISIONS.md`，建立語意清楚 commit；只有 PM 明確授權時才 push。

