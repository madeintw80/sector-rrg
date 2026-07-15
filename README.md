# 台股題材輪動｜Professional Investment Workbench

台股題材資金輪動的 RRG（Relative Rotation Graph，相對輪動圖）互動前端。首頁先回答「目前輪動到哪、下一棒看什麼」，再用四象限、軌跡與成分股訊號下鑽驗證。

**線上看**：https://madeintw80.github.io/sector-rrg/

## 功能
- 決策摘要：領先主軸、改善蓄勢、轉弱警戒與目前輪動結論
- 四象限（領先／改善／落後／轉弱）散點，點大小＝題材成交額，逐格動態上色
- 時間粒度切換（週／月／季／半年／年）＋ 時間軸播放器
- 點題材 → 軌跡高亮、多選比較；下鑽側欄列成分股紅黃綠燈（位階／RSI／均線／訊號）
- 明確的 loading、empty、error 與離線 fallback 狀態
- 純手刻 SVG + JS，無外部依賴，可離線（PWA，手機可加主畫面）
- 深色／淺色自動跟系統，也可手動切換

## 資料
- 題材分類：MoneyDJ 細分產業 curate 的大母體
- 成交額／技術指標：TWSE／TPEX 公開資料 + yfinance 歷史行情
- 每日盤後更新一次

純公開市場資料的視覺化，個人研究自用，非投資建議。
