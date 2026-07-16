# CHECKPOINT

Updated: 2026-07-16T23:05:00+08:00
Task Lead: Echo
Status: in_progress
Branch: master
Last verified commit: 34a785f

## PM requested

- 2026-07-16：獨立驗證 RRG 有效性。以 walk-forward／lagged inputs 比較現行單日成交額 50% 封頂、落後一期 20 日均成交額 50% 封頂、等權，以及舊版單日成交額無封頂；先做正式分類，檢驗四象限、關鍵轉換與 5／20／60 日絕對／超額報酬，另評估成交額升溫、廣度與既有超額報酬的熱門確認增益。不得修改正式每日 pipeline、push、deploy、排程或公開發布。
- 2026-07-16：第三項 RRG 改良調整群組指數成交額權重；正式分類保留成交額前 8 家、單股最高 50%，題材維持全部有效成分與 30% 上限。只調整指數建構權重，不改 RS-Ratio／RS-Momentum、回測、父層基準、均線、排程或公開發布；本輪只做本機重建、測試與 commits。
- 2026-07-16：第二項 RRG 改良在既有公司圖卡加入近 6 個月個股價格小圖，至少含現價、當日漲跌、MA20、MA60 與成交量；分類／題材成分股都能開啟，保留基本資料、題材標籤、燈號與既有下鑽。本輪只做本機修改、重建、測試與 commits，不 push／deploy、不改排程或 RS-Ratio／RS-Momentum。
- 2026-07-16：RRG 後續改善一次只做一項；第一項先加入分類／題材的 5／20／60 日絕對報酬、大盤報酬、超額報酬與成分股廣度確認層。本輪只做本機修改、重建、測試與 commit，不 push／deploy、不改排程。
- 2026-07-16：新增題材分類的「強勢起始組」本機預覽；預設只選領先續強與改善接近領先的題材，並改善手機搜尋選取／取消、樣本不足與已選狀態對比。先啟動本機頁面給 PM 驗收，不 push／deploy。
- 2026-07-16：題材分類搜尋需支援公司名與股號；命中公司後直接列出其所屬受控題材，供逐一或批次加入目前比較。本輪仍只更新本機預覽，不 push／deploy。
- 2026-07-16：PM 驗收桌機與手機本機預覽後，明確授權將強勢起始組、搜尋對比與公司→題材搜尋正式 commit、push、deploy；發布版號為 UI／PWA v4.1.1。

- PM 追加明確授權：本輪完成後直接 commit＋push，將 UI v3.0.1／v3.0.2／v4.0.0 與 schema v4 發布至公開 GitHub Pages；發布後需驗證公開頁、資料與 PWA cache。
- 將桌面首屏改成投資工作台：左側集中品牌、資料摘要、輪動結論、訊號與控制；中央以 RRG 為首屏主視覺；右側保留題材下鑽與公司圖卡。
- 一般筆電不可因硬塞三欄讓 RRG 過小；手機改用「輪動圖／設定／下鑽」分頁，不硬塞三欄。
- 新增獨立「題材標籤 RRG」模式，與 12／34／229 三層互斥產業分類清楚分開；只畫搜尋命中／使用者自選標籤，預設最多 12、上限 20。
- 題材標籤至少 5 家公司；成分完全相同者合併為別名；單股權重上限 30%，成交額占比逾 60% 或有效樣本不足時顯示警告。
- 本輪可修改、測試與 commit；不得 push／deploy，公開發布需另行確認。
- 題材下鑽後，點成分股清單中的任一家公司，也要在右側上方顯示與搜尋公司相同的完整公司圖卡。
- 改善 MoneyDJ 多標籤搜尋：搜尋「散熱」時，不要讓只命中弱關聯標籤的同欣電排在奇鋐、健策、雙鴻等核心散熱股前面。
- 建議先呈現命中的 MoneyDJ 標籤，再依標籤命中數與關聯強度排序個股；公司名／股號精確搜尋維持最高優先。
- 推翻「59 個核心題材只涵蓋 914 檔也可以」的分層假設；新版每一個分類層級都必須涵蓋全部現行普通上市櫃公司。
- 可直接重做分類，優先研究 XQ 的產業分類作為參考；Echo 全權主導修改、測試與 commit，不需再交接給 Batnini。
- 將 RRG 個股覆蓋擴充為全部現役上市、上櫃公司；每家公司都必須有題材對應，不能再因 59 個人工挑選的 MoneyDJ 分類頁而靜默消失。
- 先確認 MoneyDJ 是否真的缺少台玻、萬潤等分類；若 MoneyDJ 有資料，改正來源擷取方式，不無故更換參考來源。
- 修正搜尋提示與實際功能不一致：搜尋需支援題材關鍵字、公司名與股號，`AI 伺服器` 等含空格輸入也要命中，並自動顯示可選建議。

## Completed

- 第三項 RRG 改良已完成：正式分類從具 >120 日價格的成分取成交額前 8 家，成交額加權後單股最高 50%；題材維持全部有效成分與 30% 上限。
- schema v7 新增 `index_weighting`，明確記錄分類／題材的權重方法、上限、最小有效樣本與成交額缺值 fallback；RS-Ratio／RS-Momentum、分類歸屬、確認層、個股價格與 UI 均未修改。
- 正式分類最小有效樣本為 3 家；目前 12 大分類＋34 產業＋229 細產業共 275／275 類均可計算，沒有因新股短歷史而掉點。題材五視角仍為 371／371。
- 今日比較：50% 上限影響 5／12 大分類、13／34 產業、158／229 細產業的原始權重；月視角訊號變動 28／275。台積電在資訊科技 26.6%、半導體業 29.6% 不變，只有晶圓代工 56.5%→50%。
- 相同輸入下題材 month 序列與 1,970 家 `company_prices` 逐值不變；只調整正式分類群組指數建構權重。
- `HoldingsRadar` 來源 commit `a27618e`；`sector-rrg` feature commit `34a785f`。依保護規則只建立本機 commits，未 push／deploy、未改排程。
- 第二項 RRG 改良已完成：schema v6 新增 `company_prices`，用 126 日共用交易軸＋compact offset 輸出 1,970／1,970 家的還原收盤價與成交量；短歷史新股保留上市以來資料。
- UI／PWA v4.3.1 在既有公司圖卡加入現價、當日漲跌、MA20、MA60、收盤／雙均線 SVG 與成交量柱；分類與題材成分股沿用相同圖卡、完整分類、MoneyDJ 標籤、燈號與下鑽流程。
- RRG 計算仍只使用 >120 日的既有價序列；短歷史資料只供公司圖卡，RS-Ratio／RS-Momentum 公式、象限、代表股與題材權重均未修改。
- `HoldingsRadar` 來源 commit `8f9ff71`；`sector-rrg` feature commit `04dd15b`。依保護規則均只在本機 commit，未 push／deploy、未改排程。
- 第一項 RRG 改良已完成：schema v5 新增獨立 `confirmation` map，涵蓋 12 大分類＋34 產業＋229 細產業＋371 可比較題材，共 646 組。
- 每組提供 5／20／60 日還原收盤價報酬、相對加權指數的幾何超額報酬，以及全體有效成分股站上 MA20、站上 MA60、20日上漲比例與樣本數；RRG 的 RS-Ratio／RS-Momentum 公式、象限與既有序列未修改。
- UI v4.2.0／PWA cache `rrg-v4.2.0` 在分類與題材下鑽區加入價格確認卡，先顯示絕對／超額報酬，再以「多數同步／少數帶動／廣度分歧」提示成分股一致性。
- `HoldingsRadar` 來源 commit `cee60fa`；`sector-rrg` feature commit `2d27a99`。依保護規則均只在本機 commit，未 push／deploy、未改排程。
- UI／PWA v4.1.1 已完成正式發布：題材模式預設套用 5 個領先續強＋3 個改善接近領先的強勢起始組；搜尋卡片具高對比未選／已選／樣本不足狀態；題材模式可用公司名或股號直接列出所屬受控題材，批次加入會保留既有比較清單。
- 來源端 `HoldingsRadar` commit `b790e59`；公開站 `sector-rrg` feature commit `aad2585` 已 fast-forward push 至 `origin/master`，GitHub Pages 首頁、PWA cache 與公開資料均完成驗證。
- PM 追加授權後，已將 `82ddc38..9529a30` fast-forward push 至 `origin/master`；累積未發布的搜尋／公司圖卡改善、UI v4.0.0、schema v4、受控題材標籤 RRG 與 release SSOT 均已公開。
- GitHub Pages 公開頁、`rrg_web.json` 與 `sw.js` 已完成 cache-busting 驗證；首頁 UI v4.0.0、schema v4、PWA cache `rrg-v4.0.0` 均生效。
- UI v4.0.0 完成投資工作台重構：1440px 以上為左 320–380px／中央彈性 RRG／右 360–440px；1280px 筆電改兩欄並把下鑽放到圖下，避免壓縮主圖。
- 980px 以下 PWA 改為固定底部「輪動圖／設定／下鑽」三分頁；預設開圖、控制與下鑽各自使用完整手機寬度，含 safe-area 與至少 46px 的分頁觸控高度。
- 新增獨立題材標籤模式，文案與 12／34／229 三層互斥產業分類清楚分開；只畫搜尋命中／自選，預設最多 12 個、硬上限 20 個。
- schema v4 輸出 836 個來源標籤，完全相同成分合併後 809 組，其中 371 組達 5 家門檻；27 個名稱列為別名，五個時間視角各 371／371 可計算。
- 題材指數使用所有有效成分股、每股權重上限 30%；原始單股成交額占比逾 60% 或有效樣本不足時，在下鑽區顯示品質警告。
- `HoldingsRadar` 本機功能 commit `cb6a159`；`sector-rrg` 本機功能 commit `3c24fe1`。依本輪授權只 commit，未 push／deploy。
- UI v3.0.2 將題材下鑽的每一列成分股改為可點擊的原生按鈕；點擊後沿用既有完整公司圖卡，並將該公司置頂高亮。
- 公司圖卡出現後會取得焦點並自動捲到可見位置；手機從清單底部點擊也不會只在畫面外更新。
- HoldingsRadar 本機 commit `f8d798a`；sector-rrg 功能 commit `07c222e`。本次改善尚未 push，等待 PM 公開發布授權。
- UI v3.0.1 將搜尋結果拆成「分類／標籤／個股」：先顯示實際命中的 MoneyDJ 標籤，再依標籤命中數、字面關聯與成交額次要訊號排序個股；公司名／股號精確命中仍為最高優先。
- 搜尋「散熱」實測先顯示 6 個 MoneyDJ 標籤；個股前段為奇鋐、力致、台達電、尼得科超眾、雙鴻，同欣電不再因單一 `LED散熱基板` 弱關聯擠入前段。
- 點選 `散熱模組` 標籤會自動解除成交額門檻並顯示 7 個含相關公司的細產業；搜尋 `2308` 仍精確只列出台達電。
- HoldingsRadar 本機 commit `db993e8`；sector-rrg 功能 commit `58132b6`。本次改善尚未 push，等待 PM 新一輪公開發布授權。
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

- RRG 有效性驗證進行中；preflight 確認兩 repo 乾淨，HoldingsRadar `a27618e`、sector-rrg `12cb88f`（相對 `origin/master` ahead 6）。
- 本機快取含 2023-07-17～2026-07-16 共 729 個交易日的 1,970 家現行公司價量與加權指數，可做落後輸入 walk-forward。
- `rrg_universe.json` 的 taxonomy／MoneyDJ 題材為 2026-07-16 現行快照，且價量母體以現行掛牌公司為主；本輪必須揭露 survivorship 與分類歷史偏差。正式分類列為探索性驗證，題材不納入核心結論。
- 回測工具、測試與報告尚未完成；正式每日 pipeline、產生檔、UI、排程與公開站均未修改。

## Verification

- 正式匯出：schema v7、資料日期 2026-07-16、1,970 家公司與 1,970 家 `company_prices`；12／34／229 正式分類及 371 題材的 week／month／quarter／half／year 全數可計算。
- 權重品質：正式分類最大實際權重 0.500、題材最大實際權重 0.300；正式分類樣本不足 0，`index_weighting` 正確記錄 top_n=8、分類 min=3／cap=0.5、題材 min=5／cap=0.3。
- 前後比較：月視角大分類 1／12、產業 3／34、細產業 24／229，共 28／275 訊號狀態改變；五視角變動依序 week 24、month 28、quarter 17、half 14、year 36。
- 未混入項目：題材 month 座標序列與公司價量逐值相同，`radar/rrg.py` 未修改；沒有回測、父層基準、更多均線、UI、排程、push 或 deploy。
- Python 單元測試 8／8 通過，涵蓋分類 50% 封頂、龍頭排序、價格有效成分選取、成交額缺值／全缺等權、題材 30% 封頂、別名與五家門檻。
- `HoldingsRadar/web/rrg_web.json`／`rrg_web_data.js` 與 `sector-rrg/` 對應產生檔逐位元一致；兩 repo `git diff --check` 通過。
- 正式匯出：1,970／1,970 家皆有個股價量，126 個共用交易日、compact alignment 錯誤 0；新股 `6907／7803／7823` 分別保留 109／41／104 點。
- RRG 回歸：12／34／229 類與 371 題材的五個時間視角全數可計算，`confirmation.groups=646`，1,627／1,627 檔主角技術訊號成功；短歷史新股未進入 RRG >120 日輸入集合。
- Python 6／6、inline JavaScript 語法、`git diff --check` 通過；兩端 `index.html`、`sw.js`、`rrg_web.json`、`rrg_web_data.js` SHA-256 全數一致。
- 本機瀏覽器：分類「晶圓代工 → 台積電」與題材「晶圓代工 → 采鈺」皆由成分股開啟價量圖；現價／漲跌／MA20／MA60／成交量、完整分類、標籤與燈號同時保留。
- 390×844：指標 2×2、公司卡 325px、圖 296px、主要觸控 46px；1280×720、1440×900 皆無水平溢出，深／淺色正常，console error=0。
- 正式匯出：1,970家公司、12／34／229類、371個題材的五個時間視角全部可計算；1627／1627檔主角技術訊號成功。
- schema v5：`confirmation.groups=646`（12+34+229+371）、periods=5／20／60、缺欄位 0、廣度越界 0、所有 MA20 樣本皆大於 0；資料日期 2026-07-16。
- Python 回歸 5／5 通過：新增固定交易日報酬、幾何超額報酬與廣度測試，既有題材權重／別名測試保持全綠；3段 inline script 語法通過。
- 本機瀏覽器：1280×720、1440×900、390×844 均無水平溢出；分類「晶圓代工」與題材「不鏽鋼」皆顯示確認卡，卡片數字／廣度無截斷，手機下鑽與淺色模式正常，console error=0。
- `HoldingsRadar/web/` 與 `sector-rrg/` 的 `index.html`、`sw.js`、`rrg_web.json`、`rrg_web_data.js` hash 分別一致。
- 公開 UI／PWA v4.1.1：首頁與 `sw.js` 皆 HTTP 200；`UI v4.1.1=True`、強勢起始組=True、公司→題材搜尋=True、`rrg-v4.1.1=True`。
- 公開 `rrg_web.json`：HTTP 200、16,724,540 bytes、schema=4、公司 1,970、canonical 題材 809、可比較 371、min/default/max=5／12／20；`台積電 2330` 題材為 `IC製造、晶圓代工`。
- UI v4.1.1 公司搜尋：`台積電`／`2330` 可映射到 `IC製造`（35 家）與 `晶圓代工`（7 家），兩者皆符合門檻；全市場 universe 題材名稱／別名對 canonical catalog 的未映射數為 0。兩份前端來源 hash 相同、3 段 inline script 均通過語法解析，本機 `http://127.0.0.1:8774/` 回應 HTTP 200。
- 公開首頁與 `sw.js`：HTTP 200；`UI v4.0.0=True`、手機三分頁=True、題材模式=True、`rrg-v4.0.0=True`。
- 公開 `rrg_web.json`：HTTP 200、16,724,540 bytes、schema=4、來源標籤 836、合併後 809、可比較 371、別名 27、min/default/max=5／12／20、weight cap=0.3、warning=0.6，五 spans 皆 371。
- 公開 390×844 PWA：三分頁各 116×46px；搜尋「散熱」加入 6／20，圖上六個標籤完整；`散熱模組` 顯示 18 檔與單股主導／30% 封頂警告，台達電公司圖卡寬 325px，scroll width=client width，console error／warning=0。
- 資料品質：schema=4、JSON 16,724,540 bytes、來源標籤 836、合併後 809、可比較 371、別名 27；173 組揭露單股主導，所有實際權重最大值 0.300。
- 五個時間視角 week／month／quarter／half／year 均為 371／371 可計算；`散熱模組` 18 家、`伺服器用散熱模組` 6 家、`散熱風扇馬達` 9 家、`其他散熱零件` 5 家。
- Python 單元測試 3／3：成交額主導權重封頂與重分配、零成交等權、完全相同成分別名合併／五家門檻全部通過；前端 3 段 inline script 語法通過。
- 1440×900：左欄 320px、RRG 區 681px、右欄 360px，無水平溢出；RRG 位於首屏主要視覺。
- 1280×720：左欄 330px、RRG 區 891px、下鑽置於圖下，無水平溢出；沒有硬塞三欄縮小圖表。
- 390×844 PWA：預設只顯示 RRG；底部三分頁各 116×46px，document scroll width=client width，設定／圖表／下鑽切換均無水平溢出。
- 390×844 題材流程：搜尋「散熱」後加入 6／20，圖上只出現六個命中標籤；點 `散熱模組` 可見 18 家成分與單股主導／30% 封頂警告，點台達電後完整公司圖卡寬 325px、位於 375px client width 內。
- 手機 loading／error 狀態、兩端四檔 SHA-256 同步、`git diff --check` 與瀏覽器 console error／warning=0 均通過。
- 桌機：選取 `玻璃陶瓷綜合` 後，5 檔成分股皆呈現具唯一 accessible name 的 button；點台玻、和成時圖卡正確切換完整分類與 MoneyDJ 標籤，命中列置頂高亮。
- 390×844：從清單底部點 `凱撒衛 1817`，圖卡更新並自動捲至 viewport top 67px；頁面 scroll width 375px＝viewport width，browser console error／warning 0。
- 本機 UI v3.0.1：「散熱」共 6 個標籤建議，前 14 筆不含只命中 `LED散熱基板` 的同欣電；390×844 下選單 14 筆可捲動、頁面無水平溢出，browser console error／warning 0。
- 精確搜尋 `2308` 只顯示 `台達電 2308`；點 `散熱模組` 後輪動圖顯示 7 個含標籤成分公司的細產業。
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

- 正式分類 50% 與題材 30% 是刻意不同的產品口徑：分類保留台股真實龍頭集中，題材避免小型敘事被單股扭曲；兩者共用同一套封頂後持續重分配算法。
- 正式分類 50% 代表單一龍頭最多和其餘代表股合計一樣重要；未達 50% 時完全保留原成交額比例，不做人為稀釋。
- 正式分類至少 3 家有效價格才出座標；目前 275 類均達門檻。缺成交額先視為 0，只有整組成交額皆不可用才等權，不把缺值誤當高流動性。
- schema v7 只增加可稽核的權重契約與正式分類座標新結果；UI／PWA 仍為 v4.3.1，不需為 additive metadata 改前端。
- 個股價格資料與 RRG 計算分流：RRG 延續 >120 日門檻與原公式；公司圖卡只要有至少 2 日資料就顯示，避免新掛牌公司被錯誤標成無價格。
- 價量 schema 採共用日期＋每股 offset／close／volume 陣列；MA20／MA60 由前端用同一還原收盤序列計算，避免為每股重複存日期與均線。
- PM 本回合明確授權直接 commit＋push，已解除本次 UI v4／schema v4 的公開發布閘門；授權不擴及其他排程、機密或未來變更。
- 「全市場覆蓋」定義為 TWSE／TPEX 公司基本資料 API 中四位數現行掛牌普通股，排除 ETF、ETN、權證、TDR 與興櫃，並保留零成交／暫停交易公司；目前為 1,970 家。
- 三層 taxonomy 是互斥且完整的全市場產業 RRG；MoneyDJ 題材標籤是搜尋／自選後才比較的非互斥 RRG，不能當成第四層，也不會把全部 836 個標籤同時畫出。
- 題材「至少 5 家」以標籤完整成分為資格門檻；若行情暫缺導致有效成分不足，保留標籤資料但標記樣本不足，不產生座標。
- 搜尋建議以 10 筆為上限；題材完全／前綴匹配優先，再依所屬題材成交額排序個股結果。
- 使用者明確選取建議時，結果可自動解除會擋住目標的成交值或象限篩選；直接輸入但未選取時仍保留既有篩選條件。
- 超寬桌機保留適度邊界，不把內容無上限拉滿；1760px 在資訊密度與閱讀視線跨度間折衷。
- 桌機用 1280px／1600px 兩段式放大，避免同一套大字套到手機造成擁擠。
- 沿用既有主題變數，不寫死單一顏色；確保深色與淺色模式都使用與選取底色配對的前景色。
- PM 於 2026-07-16 明確授權 push；依生產保護規則完成公開發布與線上驗證。

## Next actions

- 等 PM 驗收本機結果；若明確授權公開，再 fast-forward push `sector-rrg` 並驗證 GitHub Pages 的 UI／PWA v4.3.1、schema v7、分類 50%／題材 30% 契約與公開資料。
- 下一項改善尚未開工；依 PM「一個一個來」原則，不把回測、父層基準或其他改善混入本回合。
- 無 Batnini action-required；本回合不建立 handoff。

## Risks / blockers

- MoneyDJ 為外部公開網站；週更爬蟲已限制 4 workers、重試三次，且任一分類頁失敗就拒絕覆蓋舊檔，避免靜默產生殘缺資料。
- schema v7 JSON 約 18.44 MiB（19,333,917 bytes）；本輪只新增少量權重契約，前端結構不變。若公開後實機網路變慢，優先評估個股價量或題材資料按需拆檔。

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
