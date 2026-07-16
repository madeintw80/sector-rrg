# PROJECT — sector-rrg

建立：2026-07-09  
狀態：Active（production-protected）

## 目標

- 將台股全市場產業資金輪動呈現為可在手機與桌面使用的投資工作台。
- 第一眼回答「目前輪動到哪、下一棒看什麼」，再以 RRG 四象限、分類軌跡與成分股訊號驗證。

## 架構

- `index.html`：無框架單頁前端，含 CSS、RRG SVG 與互動邏輯。桌機寬版採左控制／中 RRG／右下鑽；一般筆電採左控制＋中 RRG、下鑽置於圖下；980px 以下的 PWA 改用「輪動圖／設定／下鑽」固定底部分頁。
- `rrg_web.json`：schema v7 每日資料；保留 12／34／229 個三層互斥產業分類，另含受控 `topic_rrg`、1,970 家全市場公司索引、MoneyDJ 多標籤、逐層覆蓋率、5／20／60 日群組確認資料、近 126 個交易日個股價量，以及分類 50%／題材 30% 的 `index_weighting` 契約；前端採 network-first。
- `rrg_web_data.js`：離線 fallback 快照。
- `manifest.json`、`sw.js`、`icons/`：PWA 與離線快取。
- 題材標籤 RRG：只從搜尋命中或使用者自選進入，預設最多 12 個、硬上限 20 個；成分至少 5 家才可比較，完全相同成分合併為別名，每股合成權重上限 30%，原始單股成交額占比超過 60% 時揭露品質警告。
- 分類完整性：`HoldingsRadar/build_rrg_universe.py` 以 TWSE／TPEX 公司基本資料 API 的現行掛牌名冊為母體，每週爬 MoneyDJ 全目錄；目錄未命中者再查 MoneyDJ 個股相關產業頁。不能以當日成交行情代替掛牌名冊，否則零成交／暫停交易公司會被漏掉。
- 資料流：`HoldingsRadar/build_rrg_universe.py` → `HoldingsRadar/rrg_web_export.py`／`radar/rrg_web_pipeline.py` → `HoldingsRadar/web/` → `deploy_web.py` 白名單同步 → 本 repo → GitHub Pages。

## 執行方式

- 純靜態網站，可在 repo 根目錄執行：`python -m http.server 8765`。
- 開啟 `http://127.0.0.1:8765/`；不需安裝前端相依套件。

## 測試

- 實際視窗：390×844、1280×720、1440×900。
- smoke test：資料載入、產業／題材模式切換、時間視角、搜尋與題材多選、象限篩選、時間軸、下鑽公司圖卡、主題切換。
- 成交額權重 test：正式分類只從具 >120 日價格的成分選成交額前 8 家、至少 3 家、單股不超過 50%；題材維持全部有效成分、至少 5 家、單股不超過 30%；成交額全缺時改等權，且 RS-Ratio／RS-Momentum 公式不變。
- 題材資料品質 test：別名成分一致、可比較標籤至少 5 家、各股實際權重不超過 30%、單股原始成交額占比警告正確，且五個時間視角都有相同可比較標籤集合。
- 價格確認 test：12／34／229 個正式分類與 371 個可比較題材皆有 5／20／60 日絕對報酬、相對加權指數超額報酬，以及站上 MA20／MA60、20 日上漲比例；所有廣度值須落在 0–100%。
- 個股價格 test：1,970 家公司皆有至少 2 個交易日的還原收盤價與成交量，compact offset 不可超出 126 日共用時間軸；前端需顯示現價、當日漲跌、MA20、MA60、成交量，短歷史新股只畫上市以來資料。
- 完整性 test：現役公司代碼唯一、每家公司在三層各有且只有一個分類、MoneyDJ 分類頁零抓取錯誤，並固定檢查台玻 `1802`、萬潤 `6187` 與 9xxx 公司。
- UI 狀態測試：`?ui=loading`、`?ui=empty`、`?ui=error`。
- 確認無水平溢出、主要控制至少約 44px、console error 為 0。

## 回測與研究工具

- `C:/Users/User/projects/HoldingsRadar/research/rrg_backtest.py` 是獨立研究工具，只讀 `data/.rrg_market_v2_*.pkl` 與 `data/rrg_universe.json`，不由每日 pipeline、排程或部署程式呼叫。
- 執行：在 HoldingsRadar 根目錄用專案 Python 跑 `python research/rrg_backtest.py`；目前 275 個正式分類 × 4 種 walk-forward 指數約 118 秒，輸出聚合 CSV 與 Markdown 報告到 `research/rrg_backtest_results/`。
- 無前視口徑：t 日權重只使用 t-1 單日成交額，或截至 t-1 的 20 日均成交額；當時價格歷史需至少 121 日。訊號在 t 收盤形成，5／20／60 日結果從 t 收盤後計算。
- 研究限制：3 年快取與 taxonomy 都以 2026-07-16 現行掛牌／分類快照為主，存在 survivorship bias 與分類歷史偏差；歷史成交額是還原收盤價 × 成交量代理值。結果只能作探索性產品決策，不能視為交易保證。
- 回測測試固定 t-1 對齊、20 日窗口、50% 封頂、全缺成交額等權 fallback、缺價重正規化、前瞻報酬日期與輸出樣本／勝率／分位數／最大不利統計；目前全套 15／15 通過。

## 部署

- 公開站：`https://madeintw80.github.io/sector-rrg/`。
- 本 repo 為 GitHub Pages 發布 repo；每日排程由 `HoldingsRadar/deploy_web.py` 同步白名單檔並 push。
- 手動 push 或任何部署變更都需 PM 明確授權。

## 已知風險 / 注意事項

- UI 真正來源在 `C:/Users/User/projects/HoldingsRadar/web/`；只改公開 repo 會在下一次排程被覆蓋。
- 產生資料可能在來源 repo 保持未 commit 狀態；UI commit 必須只納入明確 UI 檔案。
- 目前公司實際命中 836 個 MoneyDJ 標籤，經完全相同成分合併後為 809 組，其中 371 組達到 5 家門檻；不會把全部標籤同時畫上主圖，三層 taxonomy 仍是正式互斥分類 SSOT。
- schema v7 JSON 約 18.44 MiB；個股價量以 126 日共用時間軸、compact offset 與緊湊數值陣列輸出，前端只展開目前公司圖卡與最多 20 個題材。後續若手機實測載入變慢，再評估拆檔或按需載入。

## 產業分類層級

- 掛牌母體：TWSE 上市公司基本資料＋TPEX 上櫃公司基本資料，納入四位數公司普通股；排除產業碼 `91`／名稱 `-DR` 的 4 檔 TDR，目前共 1,970 家。先前 `[1-8]\d{3}` 規則誤漏 43 家合法 9xxx 公司。
- 大分類（sector）：12 類，參考 XQ 的「產業群 → 產業 → 細產業」資訊架構，自行依官方產業碼映射；1,970／1,970。
- 產業（industry）：34 類，直接使用現行 TWSE／TPEX 官方產業碼；1,970／1,970。
- 細產業（subindustry）：229 類，在官方產業父層內選 MoneyDJ 主題；少於 4 家的小類合併至同產業綜合類，避免一股成類；1,970／1,970。
- MoneyDJ 多標籤：全目錄 1,062 類，現行實際命中 827 類；1,969 家由目錄命中，`6741` 由個股相關產業頁命中，合計 1,970／1,970。多標籤不受互斥分類合併影響。
- RRG 代表股：每分類從具 >120 日價格的成分中取當日成交額前 8 家、至少 3 家，成交額加權但單股最高 50%；龍頭仍可和其餘代表股合計一樣重要，避免單股完全取代產業輪動。這只影響座標計算，不改成員歸屬、覆蓋率或 RS-Ratio／RS-Momentum。
- 題材標籤 RRG 使用所有有效成分股合成，不沿用「前 8 家」規則；每股權重封頂 30%，用途是比較細分產品／敘事的轉強，不取代產業分類的全市場資金輪動判讀。
- 舊人工 59→57 題材與 FinMind 36 類檔退出正式管線；每週刷新只重建 `rrg_universe.json` taxonomy SSOT。
