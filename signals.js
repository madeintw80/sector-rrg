/* 輪動訊號追蹤頁：讀 rotation_signals.json、渲染三張訊號主卡與對帳明細。
   資料由 research/rotation_tracker.py 每日排程產出。
   訊號命名（2026-08-25 Boss 拍板）：改善點火（il）／二次點火（wl）／蓄勢優選（il 分層）
   ——帳本 signal_type 欄位值 il/wl 不動、統計口徑零變動，只改對人顯示的名字。
   口徑原則：5 日 T+0＝凍結主判準（勝負記號、主統計都看它）；
   T+1／10 日／20 日＝平行對照，各自回填、各自統計，永不混成一個數字。 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // 回測 in-sample 參考（凍結於 2023-08~2026-08 資料窗；只當對照，不混入 OOS）
  const BACKTEST_REF = {
    excess_eqw_5:       { label: "5 日 T+0（主判準）", win: 51.5, mean: 0.60, main: true },
    excess_eqw_lag1_5:  { label: "5 日 T+1", win: 49.5, mean: 0.44 },
    excess_eqw_10:      { label: "10 日 T+0", win: 53.0, mean: 1.02 },
    excess_eqw_lag1_10: { label: "10 日 T+1", win: 50.2, mean: 1.00 },
    excess_eqw_20:      { label: "20 日 T+0", win: 49.3, mean: 1.42 },
    excess_eqw_lag1_20: { label: "20 日 T+1", win: 47.4, mean: 1.13 },
  };
  // vs 加權指數平行對帳（2026-08-24 拍板 A 案）：同一批訊號換「加權指數」這把尺打分，
  // 純平行參考、不做判準。回測參考＝benchmark_hot_transition twii 列（C 法＋熱門確認）：
  // 換這把尺全視窗不達標，正是主判準維持等權尺的攤牌證據，放著對照防混淆。
  const BACKTEST_REF_TWII = {
    excess_twii_5:       { label: "5 日 T+0", win: 48.5, mean: 0.18 },
    excess_twii_lag1_5:  { label: "5 日 T+1", win: 46.7, mean: -0.12 },
    excess_twii_10:      { label: "10 日 T+0", win: 46.8, mean: -0.03 },
    excess_twii_lag1_10: { label: "10 日 T+1", win: 44.7, mean: -0.31 },
    excess_twii_20:      { label: "20 日 T+0", win: 41.0, mean: -0.71 },
    excess_twii_lag1_20: { label: "20 日 T+1", win: 38.6, mean: -0.98 },
  };
  // 二次點火（wl）的等權尺回測參考：leading_path_summary.csv「W二次點火 confirmed」列
  // （路徑探查只用等權尺打分＝加權尺沒有 in-sample 參考，該表回測欄顯示「—」）。
  const WL_BACKTEST_REF = {
    excess_eqw_5:       { label: "5 日 T+0（主統計）", win: 49.5, mean: 0.31, main: true },
    excess_eqw_lag1_5:  { label: "5 日 T+1", win: 52.8, mean: 0.35 },
    excess_eqw_10:      { label: "10 日 T+0", win: 53.0, mean: 0.90 },
    excess_eqw_lag1_10: { label: "10 日 T+1", win: 51.7, mean: 0.70 },
    excess_eqw_20:      { label: "20 日 T+0", win: 51.9, mean: 1.57 },
    excess_eqw_lag1_20: { label: "20 日 T+1", win: 53.1, mean: 1.41 },
  };
  // 蓄勢優選（n=73，六視窗同一批事件）：2026-08-25 用 8/24 凍結事件明細補齊六視窗；
  // 補算前先復現候選（499／49.5／+0.44）與宣告格（T+1 5 日 60.3／+1.30）checksum 才落表。
  const COMBO_BACKTEST_REF = {
    excess_eqw_5:       { label: "5 日 T+0（主口徑）", win: 61.6, mean: 1.35, main: true },
    excess_eqw_lag1_5:  { label: "5 日 T+1", win: 60.3, mean: 1.30 },
    excess_eqw_10:      { label: "10 日 T+0", win: 67.1, mean: 2.88 },
    excess_eqw_lag1_10: { label: "10 日 T+1", win: 64.4, mean: 3.00 },
    excess_eqw_20:      { label: "20 日 T+0", win: 61.6, mean: 2.69 },
    excess_eqw_lag1_20: { label: "20 日 T+1", win: 52.1, mean: 2.23 },
  };
  // wl 加權尺六視窗（2026-08-25 補算；n=744，10 日 T+0 743／T+1 741、20 日 729）：
  // 換這把尺全視窗貼平或跌破 50%＝二次點火的優勢也只對等權市場存在。
  const WL_BACKTEST_REF_TWII = {
    excess_twii_5:       { label: "5 日 T+0", win: 50.1, mean: -0.02 },
    excess_twii_lag1_5:  { label: "5 日 T+1", win: 49.7, mean: -0.06 },
    excess_twii_10:      { label: "10 日 T+0", win: 49.4, mean: 0.21 },
    excess_twii_lag1_10: { label: "10 日 T+1", win: 48.9, mean: -0.04 },
    excess_twii_20:      { label: "20 日 T+0", win: 45.5, mean: -0.22 },
    excess_twii_lag1_20: { label: "20 日 T+1", win: 42.7, mean: -0.43 },
  };
  // combo 加權尺六視窗（2026-08-25 補算；n=73）：5 日仍 61.6% 但 20 日 T+1 跌到 45.2%。
  const COMBO_BACKTEST_REF_TWII = {
    excess_twii_5:       { label: "5 日 T+0", win: 61.6, mean: 1.03 },
    excess_twii_lag1_5:  { label: "5 日 T+1", win: 61.6, mean: 0.87 },
    excess_twii_10:      { label: "10 日 T+0", win: 53.4, mean: 1.83 },
    excess_twii_lag1_10: { label: "10 日 T+1", win: 52.1, mean: 1.34 },
    excess_twii_20:      { label: "20 日 T+0", win: 50.7, mean: 0.73 },
    excess_twii_lag1_20: { label: "20 日 T+1", win: 45.2, mean: 0.38 },
  };
  // 對帳視窗切換：pill 選天數 → 明細表顯示該視窗的 T+0／T+1 兩欄
  const WINDOWS = {
    "5":  { t0: "excess_eqw_5",  t1: "excess_eqw_lag1_5" },
    "10": { t0: "excess_eqw_10", t1: "excess_eqw_lag1_10" },
    "20": { t0: "excess_eqw_20", t1: "excess_eqw_lag1_20" },
  };
  let payload = null;
  let currentWin = "5";

  function fmtPct(value, digits = 1, signed = false) {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    const text = Number(value).toFixed(digits);
    return (signed && value > 0 ? "+" : "") + text + "%";
  }

  function excessCell(value) {
    const text = (value === null || value === undefined) ? "—" : fmtPct(value, 2, true);
    const cls = (value === null || value === undefined)
      ? "sig-wait" : (value > 0 ? "sig-win" : "sig-loss");
    return `<td class="num ${cls}">${text}</td>`;
  }

  // 二次點火（wl，2026-08-25 上考）：轉弱→領先＋熱門確認。
  // 回測 in-sample 參考（混合視角、n=744）：T+0 5 日 49.5%／+0.31、T+1 52.8%／+0.35、
  // 跨年 T+1 49.4/53.0/57.0＝首個 2025 過 50 的格子；僅 C 等權法存在、未達統計顯著。
  // 舊記錄沒有 signal_type＝改善點火 il；il 的統計與分層一律先用 isIL 過濾。
  const WL_REF_FALLBACK = {
    t0: { win_rate: 49.5, mean_excess: 0.31 },
    t1: { win_rate: 52.8, mean_excess: 0.35 },
    sample: 744,
  };
  function isIL(s) { return (s.signal_type || "il") === "il"; }

  // 蓄勢優選（2026-08-24 拍板追蹤，原「組合 v3」）：蓄勢 ≥4 日 ∩ 廣度斜率有值且 ≤0.10。
  // 回測 in-sample（T+1 5 日）60.3%／+1.30%（n=73、2025 年 47.1%）＝樣本薄的探索性候選。
  function isComboV3(s) {
    return s.improving_days !== null && s.improving_days !== undefined
      && s.improving_days >= 4
      && s.breadth_slope5 !== null && s.breadth_slope5 !== undefined
      && s.breadth_slope5 <= 0.10;
  }

  function tagChips(signal) {
    let chips = "";
    if (!isIL(signal)) {
      // 二次點火（wl）列：只掛類別 chip＋中性的歇腳天數；il 的品質標籤（蓄勢/⭐/⚠/重觸發）
      // 是改善點火的分層、對 wl 沒驗證過，不掛。
      chips += `<span class="sig-tag wl" title="二次點火：轉弱→領先（曾領先→動能歇腳→再點火）＋熱門確認，2026-08-25 起與改善點火分開計分（回測 T+1 5 日 52.8%／+0.35%，n=744）">🔁 二次點火</span>`;
      const rest = signal.weakening_days;
      if (rest !== null && rest !== undefined) {
        chips += `<span class="sig-tag" title="跨線前在轉弱區停留 ${rest} 個交易日（純記錄，未掛分層門檻）">歇腳 ${rest} 日</span>`;
      }
      return chips;
    }
    if (isComboV3(signal)) {
      chips += `<span class="sig-tag star" title="蓄勢優選：蓄勢確認且無追高（回測最佳格 60.3%，n=73 樣本薄，看 OOS）">⭐ 蓄勢優選</span>`;
    }
    const days = signal.improving_days;
    if (days !== null && days !== undefined) {
      chips += days >= 4
        ? `<span class="sig-tag good" title="蓄勢確認：跨線前在改善區蓄勢 ${days} 個交易日（≥4 日）">✓ 蓄勢 ${days} 日</span>`
        : `<span class="sig-tag" title="蓄勢 ${days} 日（未達 4 日門檻）">蓄勢 ${days} 日</span>`;
    }
    const slope = signal.breadth_slope5;
    if (slope !== null && slope !== undefined && slope > 0.10) {
      chips += `<span class="sig-tag warn" title="追高警戒：廣度 5 日斜率 ${slope}（>0.10，回測最爛桶）">⚠ 追高警戒</span>`;
    }
    // A5a' 重觸發（2026-08-24 上考試）：null＝首次跨線、undefined＝舊記錄還沒回填不顯示
    const gap = signal.days_since_prev_il;
    if (gap === null) {
      chips += `<span class="sig-tag" title="首次跨線：回測窗內這族群第一次 I→L（first 桶回測 50.0%，n=22 樣本薄）">首次跨線</span>`;
    } else if (gap !== undefined) {
      chips += gap <= 20
        ? `<span class="sig-tag retrig" title="重觸發：距同族群上一次 I→L 跨線 ${gap} 個交易日（≤20 日＝輪動進行中，回測 53.5% 較佳桶、三年皆正）">🔁 重觸發 ${gap} 日</span>`
        : `<span class="sig-tag" title="距上一次 I→L 跨線 ${gap} 個交易日（>20 日；回測 21-60 日桶 42.7% 最爛）">間隔 ${gap} 日</span>`;
    }
    return chips;
  }

  // ── 假設記分板（資料驅動：新假設判決＝在這個陣列加一列，別再寫死 HTML）──
  // 數字出處：research/rrg_backtest_results/*.csv＋checkpoint rrg-backtest-alpha.md
  const SCOREBOARD = [
    {
      name: "A1 蓄勢期長度",
      guess: "在改善區蓄勢越久（≥4 日）再跨線越好",
      result: "4~10 日桶 54.4%／+0.94%（n=158）vs ≤3 日 47.2%／+0.20%；增量 +4.9pp、跨年 2/3 同向；20 日仍持方向",
      verdict: { cls: "adopt", label: "✅ 採用" },
      note: "命名「蓄勢確認」，tag 上線 OOS 分層",
    },
    {
      name: "A2 廣度斜率",
      guess: "廣度升溫中（斜率 >0）較好",
      result: "反向：>0.10 最爛（44.4%，n=277）、≤0 最好（54.9%／+0.98%）；20 日同型態",
      verdict: { cls: "flip", label: "🔁 反向轉生" },
      note: "原假設死亡；反向命名「追高警戒」tag 上線記錄",
    },
    {
      name: "A3 好量比",
      guess: "漲日量 ÷ 跌日量越高越好",
      result: "方向一致但增量弱（≥2.5x 僅 +1.9pp）；<1x 爛桶明確（37.0%，n=27 樣本薄）",
      verdict: { cls: "weak", label: "➖ 增量不足" },
      note: "只適合當排除濾網候選",
    },
    {
      name: "A4 已跑贏甜蜜點",
      guess: "已贏 0~5% 最好，贏太多＝追高",
      result: "四桶 48~50% 全平，「贏 >10% 變差」也沒出現",
      verdict: { cls: "dead", label: "❌ 死亡" },
      note: "",
    },
    {
      name: "A5a 同族群再觸發",
      guess: "首次觸發或隔 >60 日的較乾淨",
      result: "反向：≤20 日重觸發最好（53.5%／+0.54%，n=297，跨年增量三年皆正）、21~60 日最爛（42.7%）",
      verdict: { cls: "flip", label: "🔁 反向轉生" },
      note: "反向「重觸發 ≤20 日」已事前宣告、2026-08-24 上線 OOS 分層",
    },
    {
      name: "A5b 同日齊亮",
      guess: "多族群同日齊亮＝輪動大浪更可信",
      result: "三桶無差異",
      verdict: { cls: "dead", label: "❌ 死亡" },
      note: "",
    },
    {
      name: "A6 龍頭 vs 雨露",
      guess: "雨露均霑優於單一龍頭帶動",
      result: "5 日 ≤−2.5% 桶 55.7% 三年一致，但相鄰桶最爛（非單調）、20 日整個翻轉＝雜訊嫌疑大",
      verdict: { cls: "weak", label: "⚠️ 不穩定不採" },
      note: "",
    },
    {
      name: "B1 法人跟單",
      guess: "成分股近 5 日投信／外資淨買超＝加分",
      result: "資料僅 2026-04 起 93 個交易日、無上櫃；窗內 91 筆方向相反（高跟單 54.8% < 同窗基準 61.5%），有擁擠反指味道但單一多頭窗不可下結論",
      verdict: { cls: "nodata", label: "🚫 資料不足" },
      note: "續累積；拆外資／投信重測＝掛起牌",
    },
    {
      name: "B2 籌碼乾淨度",
      guess: "融資增幅低的訊號比較乾淨",
      result: "個股融資餘額零歷史落地，無法回測；要驗得先回補約 700 日資料（另立資料工程）",
      verdict: { cls: "nodata", label: "🚫 無法回測" },
      note: "2026-08-24 拍板「先都用價量」＝掛起",
    },
    {
      name: "A1×A2' 交叉（蓄勢優選）",
      guess: "蓄勢確認 ∩ 無追高＝兩個近乎獨立的條件相交更強",
      result: "T+1 5 日 60.3%／+1.30%＝全部格子最佳，但 n=73、2025 年 47.1%＝樣本薄",
      verdict: { cls: "oos", label: "🎓 上 OOS 考試" },
      note: "2026-08-24 起以「⭐ 蓄勢優選」分層追蹤（本頁訊號三）",
    },
    {
      name: "E1 蓄勢中途",
      guess: "改善區蓄勢滿 4 日就先買、不等跨線",
      result: "裸 43.8%／−0.06（n=6,233）；＋熱門確認 39.5%（n=86，方向與宣告相反）；20 日更爛（38.0%）",
      verdict: { cls: "dead", label: "❌ 死亡" },
      note: "蓄勢的價值在「跨線那一刻」，不在中途",
    },
    {
      name: "E2 翻正衝力",
      guess: "落後→改善跨線、動能斜率越快越好",
      result: "裸 43.7%／−0.09（n=11,286）；斜率桶非單調、跨年全 <50。附帶發現：翻正後 20 日內 87% 觸及領先，但無資訊溢價",
      verdict: { cls: "dead", label: "❌ 死亡" },
      note: "",
    },
    {
      name: "F 組：W→L 路徑（二次點火）",
      guess: "熱門確認進領先的路徑裡，不經改善的「轉弱→領先」值得單獨立訊號",
      result: "佔比屬實（53% 走 W→L）；W→L＋熱門確認 T+1 5 日 52.8%／+0.35%（n=744）、跨年 49.4/53.0/57.0＝首個 2025 過 50 的格子",
      verdict: { cls: "oos", label: "🎓 上 OOS 考試" },
      note: "2026-08-25 起以「🔁 二次點火」獨立計分（本頁訊號二）",
    },
    {
      name: "F 組：La→L 對角跳",
      guess: "落後直接跳領先＋熱門確認＝最猛的點火",
      result: "42.2%＝照事前宣告判死；兩路徑「裸」事件 41~44% 也全死＝alpha 仍全在確認條件",
      verdict: { cls: "dead", label: "❌ 死亡" },
      note: "",
    },
  ];

  // 掛起的牌：資料或決策未到位、暫不翻（狀態，非判決）
  const PARKED = [
    "<b>C 組</b> 營收動能背景濾網——2026-08-24 拍板「先都用價量」，長期掛起",
    "<b>H-X1</b> 題材外生價格動能（散裝航運案例：BDI 領先股價 9~10 個交易日）——新資訊源，掛起",
    "<b>B1'</b> 法人跟單拆外資／投信重測（投信在小族群常缺席）——等資料累積",
    "<b>B2</b> 融資籌碼乾淨度——要先回補約 700 日融資餘額歷史（另立資料工程）",
  ];

  function renderScoreboard() {
    $("scoreboardRows").innerHTML = SCOREBOARD.map((h) =>
      `<tr><td>${h.name}</td><td>${h.guess}</td><td>${h.result}</td>` +
      `<td class="verdict-cell"><span class="verdict ${h.verdict.cls}">${h.verdict.label}</span>` +
      (h.note ? `<br>${h.note}` : "") + `</td></tr>`
    ).join("");
    $("parkedList").innerHTML = PARKED.map((p) => `<li>${p}</li>`).join("");
  }

  // ── 訊號一 ⚡ 改善點火：主卡統計（il 主統計＝5 日 T+0） ──
  function renderIl(stats) {
    $("oosTotal").textContent = stats.oos_total ?? 0;
    $("oosFilled").textContent = stats.oos_filled ?? 0;
    $("oosPending").textContent = stats.oos_pending ?? 0;
    $("ilCount").textContent = `OOS 累積 ${stats.oos_total ?? 0} 筆`;
    if (stats.oos_filled) {
      $("statWin").textContent = fmtPct(stats.win_rate, 1);
      $("ilOosSub").textContent =
        `已對帳 ${stats.oos_filled} 筆 · 平均 ${fmtPct(stats.mean_excess, 2, true)}` +
        ` · 中位 ${fmtPct(stats.median_excess, 2, true)}`;
    } else {
      $("statWin").textContent = "—";
      $("ilOosSub").textContent = stats.oos_total
        ? "訊號累積中，等待第一筆對帳" : "等待第一筆 OOS 訊號";
    }
  }

  // 通用平行對帳表：refs 定義列（label＋回測參考，可為 null＝該格沒回測過）、
  // extra 供 live 彙總、mainLive 供主口徑列（refs 標 main 的那列）。三訊號共用同一格式。
  function renderScaleTable(tbodyId, refs, extra, mainLive) {
    const body = $(tbodyId);
    if (!body) return;
    extra = extra || {};
    const rows = Object.keys(refs).map((field) => {
      const ref = refs[field];
      const live = ref.main && mainLive !== undefined ? mainLive : extra[field];
      const hasLive = live && live.filled;
      const cells = hasLive
        ? `<td>${live.filled} 筆</td><td>${fmtPct(live.win_rate, 1)}</td><td>${fmtPct(live.mean, 2, true)}</td>`
        : '<td class="muted">累積中</td><td class="muted">—</td><td class="muted">—</td>';
      const refText = (ref.win === null || ref.win === undefined)
        ? "—（未回測）"
        : `${ref.win.toFixed(1)}%／${fmtPct(ref.mean, 2, true)}`;
      return `<tr${ref.main ? ' class="is-main"' : ""}>` +
        `<td>${ref.label}</td>${cells}` +
        `<td class="muted">${refText}</td></tr>`;
    });
    body.innerHTML = rows.join("");
  }

  // 品質分層對帳（前端自算，只看 OOS 且 5 日 T+0 已回填的訊號）。
  // 只吃改善點火（il）：分層門檻全是 I→L 家族回測宣告的，二次點火（wl）另開主卡不混入。
  function renderTiers(signals, oosStart) {
    const done = signals.filter((s) => isIL(s) && s.date >= oosStart
      && s.excess_eqw_5 !== null && s.excess_eqw_5 !== undefined);
    const bucket = (rows) => {
      if (!rows.length) return null;
      const wins = rows.filter((s) => s.excess_eqw_5 > 0).length;
      const mean = rows.reduce((sum, s) => sum + s.excess_eqw_5, 0) / rows.length;
      return { n: rows.length, win: (wins / rows.length) * 100, mean };
    };
    const tiers = [
      ["⭐ 蓄勢優選（蓄勢∩非追高）", done.filter(isComboV3), "回測 60.3%"],
      ["✓ 蓄勢確認（≥4 日）", done.filter((s) => (s.improving_days ?? -1) >= 4), "回測 54.4%"],
      ["未蓄勢（≤3 日）", done.filter((s) => s.improving_days !== null && s.improving_days !== undefined && s.improving_days <= 3), "回測 47.2%"],
      ["⚠ 追高警戒（斜率>0.10）", done.filter((s) => (s.breadth_slope5 ?? 0) > 0.10), "回測 44.4%"],
      ["無追高警戒", done.filter((s) => s.breadth_slope5 !== null && s.breadth_slope5 !== undefined && s.breadth_slope5 <= 0.10), "回測 55.9%"],
      // A5a' 重觸發分組（null＝首次是合法值、undefined＝還沒回填不進任何桶）
      ["🔁 重觸發（≤20 日）", done.filter((s) => typeof s.days_since_prev_il === "number" && s.days_since_prev_il <= 20), "回測 53.5%"],
      ["首次／間隔 >20 日", done.filter((s) => s.days_since_prev_il === null || (typeof s.days_since_prev_il === "number" && s.days_since_prev_il > 20)), "回測 43.6%"],
    ];
    $("tierCards").innerHTML = tiers.map(([label, rows, ref]) => {
      const stat = bucket(rows);
      const body = stat
        ? `<strong>${fmtPct(stat.win, 1)}</strong><span>n=${stat.n} · 平均 ${fmtPct(stat.mean, 2, true)}</span>`
        : `<strong class="sig-wait">—</strong><span>等待對帳</span>`;
      return `<div class="tier-card"><small>${label} · ${ref}</small>${body}</div>`;
    }).join("");
    if (done.length) {
      $("tierNote").textContent =
        `已用 ${done.length} 筆 OOS 對帳自動分層（5 日 T+0 口徑）；桶內樣本少時勝率波動大，滿百筆前都只是趨勢參考。`;
    }
  }

  // ── 訊號二 🔁 二次點火：主卡統計（wl 統計由後端 stats.wl 供應） ──
  function renderWl(stats) {
    const box = $("wlCards");
    if (!box) return;
    const ref = (payload && payload.f1_reference) || WL_REF_FALLBACK;
    const wl = stats.wl || { total: 0, t0: null, t1: null };
    $("wlCount").textContent = `OOS 累積 ${wl.total ?? 0} 筆`;
    const card = (label, live, refText) => {
      const body = live
        ? `<strong>${fmtPct(live.win_rate, 1)}</strong><span>n=${live.filled} · 平均 ${fmtPct(live.mean, 2, true)}</span>`
        : `<strong class="sig-wait">—</strong><span>等待對帳</span>`;
      return `<div class="tier-card"><small>${label}</small>${body}</div>`;
    };
    box.innerHTML =
      `<div class="tier-card"><small>回測承諾 · 5 日 T+1</small><strong>${ref.t1.win_rate}%</strong>` +
      `<span>平均 ${fmtPct(ref.t1.mean_excess, 2, true)}（n=${ref.sample}）；T+0 ${ref.t0.win_rate}%／${fmtPct(ref.t0.mean_excess, 2, true)}</span></div>` +
      card(`OOS 實績 · 5 日 T+0（主統計）`, wl.t0) +
      card(`OOS 實績 · 5 日 T+1（平行）`, wl.t1) +
      `<div class="tier-card"><small>🕶 影子單戰績</small><strong id="wlShadowWin">—</strong><span id="wlShadowSub">等待對帳</span></div>`;
    const note = $("wlNote");
    if (note) {
      note.textContent = wl.total
        ? `二次點火已累積 ${wl.total} 筆訊號，各視窗滿天數自動對帳；與改善點火永不混算。`
        : `二次點火考試 ${payload.f1_start || "2026-08-25"} 起跑，第一筆「轉弱→領先＋熱門確認」出現後開始累積。`;
    }
  }

  // ── 訊號三 ⭐ 蓄勢優選：主卡統計（stats.combo_v3 由後端供應；分層、非獨立事件） ──
  function renderCombo(stats, signals, oosStart) {
    const box = $("comboCards");
    if (!box) return;
    const combo = stats.combo_v3 || {};
    const total = (signals || []).filter((s) => isIL(s) && s.date >= oosStart && isComboV3(s)).length;
    $("comboCount").textContent = `OOS 累積 ${total} 筆`;
    const card = (label, live) => {
      const body = live && live.filled
        ? `<strong>${fmtPct(live.win_rate, 1)}</strong><span>n=${live.filled} · 平均 ${fmtPct(live.mean, 2, true)}</span>`
        : `<strong class="sig-wait">—</strong><span>等待對帳</span>`;
      return `<div class="tier-card"><small>${label}</small>${body}</div>`;
    };
    // 🕶 影子單戰績（分層版）：不另外開單，直接取改善點火影子單裡標 ⭐ 的那些筆分組統計
    const shadowRows = (signals || []).filter((s) => isIL(s) && s.date >= oosStart
      && isComboV3(s) && s.shadow_net_5 !== null && s.shadow_net_5 !== undefined);
    let shadowCard;
    if (shadowRows.length) {
      const wins = shadowRows.filter((s) => s.shadow_net_5 > 0).length;
      const meanNet = shadowRows.reduce((t, s) => t + s.shadow_net_5, 0) / shadowRows.length;
      const meanGross = shadowRows.reduce((t, s) => t + (s.shadow_gross_5 ?? 0), 0) / shadowRows.length;
      shadowCard = `<div class="tier-card"><small>🕶 影子單戰績</small>` +
        `<strong>${fmtPct((wins / shadowRows.length) * 100, 1)}</strong>` +
        `<span>n=${shadowRows.length} · 淨 ${fmtPct(meanNet, 2, true)} · 毛 ${fmtPct(meanGross, 2, true)}</span></div>`;
    } else {
      shadowCard = `<div class="tier-card"><small>🕶 影子單戰績</small>` +
        `<strong class="sig-wait">—</strong><span>等待對帳（取 ⭐ 筆分組）</span></div>`;
    }
    box.innerHTML =
      `<div class="tier-card"><small>回測承諾 · 5 日 T+1</small><strong>60.3%</strong>` +
      `<span>平均 +1.30%（n=73、2025 年 47.1%＝樣本薄）</span></div>` +
      card("OOS 實績 · 5 日 T+0（主口徑）", combo.t0) +
      card("OOS 實績 · 5 日 T+1（平行）", combo.t1) +
      shadowCard;
  }

  // 🕶 影子單（2026-08-25 拍板 A）：T+1 收盤買前 3 大主角、持 5 日、扣來回成本的淨損益。
  // 絕對報酬口徑；兩張卡各自顯示自己的淨值，規則說明在共用面板。
  function renderShadow(stats) {
    const shadow = stats.shadow || {};
    const cost = shadow.assumed_cost ?? 0.45;
    const fill = (winId, subId, live) => {
      const winEl = $(winId), subEl = $(subId);
      if (!winEl || !subEl) return;
      if (live && live.filled) {
        winEl.textContent = fmtPct(live.win_rate, 1);
        winEl.classList.remove("sig-wait");
        subEl.textContent = `n=${live.filled} · 淨 ${fmtPct(live.mean_net, 2, true)} · 毛 ${fmtPct(live.mean_gross, 2, true)}`;
      }
    };
    fill("ilShadowWin", "ilShadowSub", shadow.il);
    fill("wlShadowWin", "wlShadowSub", shadow.wl);
    const note = $("shadowNote");
    if (note) {
      const cfg = (payload && payload.shadow_config) || {};
      note.textContent =
        `規則凍結：訊號隔天（T+1）收盤等金額模擬買進族群成交額前 ${cfg.top_n ?? 3} 大主角、` +
        `持 ${cfg.hold_days ?? 5} 個交易日機械出場，毛報酬扣來回成本 ${cost}%＝淨損益；` +
        `${cfg.start ?? "2026-08-25"} 起的新訊號才記（不補歷史）。勝負以淨損益 >0 判定；` +
        `影子單戰績各自顯示在各訊號分頁的主卡（蓄勢優選＝取 ⭐ 筆分組、不另開單）。`;
    }
  }

  function resultCell(signal, isReference) {
    if (isReference) return '<span class="sig-ref">參考</span>';
    if (signal.excess_eqw_5 === null || signal.excess_eqw_5 === undefined)
      return '<span class="sig-wait">⏳ 等待</span>';
    return signal.win
      ? '<span class="sig-win">✓ 贏</span>'
      : '<span class="sig-loss">✗ 輸</span>';
  }

  function renderRows() {
    const labels = payload.level_labels || {};
    const oosStart = payload.oos_start || "";
    const fields = WINDOWS[currentWin];
    $("colT0").textContent = `${currentWin}日 T+0`;
    $("colT1").textContent = `${currentWin}日 T+1`;
    const rows = (payload.signals || []).map((signal) => {
      const isReference = signal.date < oosStart;
      const level = labels[signal.level] || signal.level;
      const members = (signal.members || []).slice(0, 6).join("、");
      const rowClass = isReference ? ' class="sig-ref"' : "";
      return `<tr${rowClass}>` +
        `<td>${signal.date}</td>` +
        `<td>${signal.group_name}<span class="level-chip">${level}</span>${tagChips(signal)}</td>` +
        `<td class="members">${members}</td>` +
        `<td class="num">${signal.turnover_heat ?? "—"}x</td>` +
        `<td class="num">${signal.breadth_up20 !== undefined && signal.breadth_up20 !== null
          ? Math.round(signal.breadth_up20 * 100) + "%" : "—"}</td>` +
        excessCell(signal[fields.t0]) +
        excessCell(signal[fields.t1]) +
        excessCell(signal.shadow_net_5) +
        `<td>${resultCell(signal, isReference)}</td>` +
        "</tr>";
    });
    $("signalRows").innerHTML = rows.join("");
    $("ledgerCount").textContent = `共 ${rows.length} 筆`;
    $("emptyNote").hidden = rows.length > 0;
  }

  // 分頁切換（2026-08-25 Boss 拍板：不想一直下拉）：三訊號各一頁＋對帳與來歷一頁。
  // hash 記住目前分頁（#il/#wl/#combo/#ledger）；主頁舊深連結 #origins＝帳本分頁＋展開來歷。
  function setupTabs() {
    const buttons = Array.from(document.querySelectorAll("#sigTabs button[data-tab]"));
    const panes = Array.from(document.querySelectorAll(".tab-pane"));
    const show = (name) => {
      buttons.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
      panes.forEach((p) => p.classList.toggle("show", p.dataset.pane === name));
    };
    buttons.forEach((b) => b.addEventListener("click", () => {
      show(b.dataset.tab);
      history.replaceState(null, "", "#" + b.dataset.tab);
    }));
    const hash = location.hash.replace("#", "");
    if (hash === "origins") {
      show("ledger");
      const fold = $("originsFold");
      if (fold) fold.open = true;
      const target = $("origins");
      if (target) target.scrollIntoView();
    } else if (["il", "wl", "combo", "ledger"].includes(hash)) {
      show(hash);
    }
  }

  function setupPills() {
    const buttons = Array.from(document.querySelectorAll("#winPills button[data-win]"));
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        currentWin = button.dataset.win;
        buttons.forEach((item) => item.classList.toggle("on", item === button));
        renderRows();
      });
    });
  }

  // ── 研究地基三結論：吃每月排程重跑的 rrg_validation.json（抓不到＝保留 HTML 凍結數字）──
  function renderFoundation(data) {
    const find = (rows, criteria) => (rows || []).find((row) =>
      Object.keys(criteria).every((key) => row[key] === criteria[key])) || {};
    const tests = data.tests || {};
    const bullishA = find(tests.bullish_state_20d, { method: "A_1d_capped" });
    const hotOn = find(tests.hot_confirmation_20d, { method: "C_equal", confirmation: "confirmed" });
    const hotOff = find(tests.hot_confirmation_20d, { method: "C_equal", confirmation: "unconfirmed" });
    const pct = (v) => Number.isFinite(Number(v)) ? Number(v).toFixed(1) + "%" : "—";
    if (bullishA.excess_win_rate !== undefined) $("baseQuadrant").textContent = pct(bullishA.excess_win_rate);
    if (hotOn.excess_win_rate !== undefined) $("baseHotOn").textContent = pct(hotOn.excess_win_rate);
    if (hotOff.excess_win_rate !== undefined) $("baseHotOff").textContent = pct(hotOff.excess_win_rate);
    if (data.as_of) $("baseAsOf").textContent =
      `地基回測截至 ${data.as_of}，每月 1 日 07:10 自動重跑，數字隨最新資料窗更新。`;
  }

  function boot(data) {
    payload = data;
    $("headerAsOf").textContent = `資料日 ${payload.as_of || "—"}`;
    $("generatedAt").textContent = payload.generated
      ? `更新於 ${String(payload.generated).slice(0, 16).replace("T", " ")}`
      : "僅供研究驗證";
    const stats = payload.stats || {};
    renderIl(stats);
    // 六張平行表（三訊號 × 兩把尺）：格式一致，主口徑列各吃自己的主統計
    renderScaleTable("parallelRows", BACKTEST_REF, stats.extra,
      { filled: stats.oos_filled, win_rate: stats.win_rate, mean: stats.mean_excess });
    renderScaleTable("parallelTwiiRows", BACKTEST_REF_TWII, stats.extra);
    const wlStats = stats.wl || {};
    renderScaleTable("parallelWlRows", WL_BACKTEST_REF, wlStats.extra, wlStats.t0 || null);
    renderScaleTable("parallelWlTwiiRows", WL_BACKTEST_REF_TWII, wlStats.extra);
    const comboStats = stats.combo_v3 || {};
    renderScaleTable("parallelComboRows", COMBO_BACKTEST_REF, comboStats.extra, comboStats.t0 || null);
    renderScaleTable("parallelComboTwiiRows", COMBO_BACKTEST_REF_TWII, comboStats.extra);
    renderWl(stats);
    renderCombo(stats, payload.signals || [], payload.oos_start || "");
    renderShadow(stats);
    renderTiers(payload.signals || [], payload.oos_start || "");
    renderScoreboard();
    setupPills();
    setupTabs();
    renderRows();
    $("loadingState").hidden = true;
    $("signalsApp").hidden = false;
  }

  fetch("rotation_signals.json", { cache: "no-cache" })
    .then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
    .then(boot)
    .catch(() => {
      const box = $("loadingState");
      box.innerHTML = "<div><b>訊號帳本尚未產生</b><p>每日 18:00 排程跑完後才有資料；離線時請連網重試。</p></div>";
    });

  fetch("rrg_validation.json", { cache: "no-cache" })
    .then((res) => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
    .then(renderFoundation)
    .catch(() => { /* 地基 JSON 抓不到＝保留 HTML 凍結數字 */ });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
