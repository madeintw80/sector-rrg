/* 輪動訊號追蹤頁：讀 rotation_signals.json、渲染 OOS 統計與對帳明細。
   資料由 research/rotation_tracker.py 每日排程產出。
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

  // F1 第二張考卷（2026-08-25 拍板）：wl＝轉弱→領先（二次點火）＋熱門確認。
  // 回測 in-sample 參考（混合視角、n=744）：T+0 5 日 49.5%／+0.31、T+1 52.8%／+0.35、
  // 跨年 T+1 49.4/53.0/57.0＝首個 2025 過 50 的格子；僅 C 等權法存在、未達統計顯著。
  // 舊記錄沒有 signal_type＝主考卷 il；主考卷的統計與分層一律先用 isIL 過濾。
  const F1_REF_FALLBACK = {
    t0: { win_rate: 49.5, mean_excess: 0.31 },
    t1: { win_rate: 52.8, mean_excess: 0.35 },
    sample: 744,
  };
  function isIL(s) { return (s.signal_type || "il") === "il"; }

  // 組合 v3（2026-08-24 拍板追蹤）：蓄勢 ≥4 日 ∩ 廣度斜率有值且 ≤0.10。
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
      // F1（wl）列：只掛類別 chip＋中性的歇腳天數；il 的品質標籤（蓄勢/⭐/⚠/重觸發）
      // 是主考卷的分層、對 wl 沒驗證過，不掛。
      chips += `<span class="sig-tag wl" title="F1 第二張考卷：轉弱→領先（二次點火）＋熱門確認，2026-08-25 起與主考卷分開計分（回測 T+1 5 日 52.8%／+0.35%，n=744）">🔁 轉弱→領先</span>`;
      const rest = signal.weakening_days;
      if (rest !== null && rest !== undefined) {
        chips += `<span class="sig-tag" title="跨線前在轉弱區停留 ${rest} 個交易日（純記錄，未掛分層門檻）">歇腳 ${rest} 日</span>`;
      }
      return chips;
    }
    if (isComboV3(signal)) {
      chips += `<span class="sig-tag star" title="組合 v3：蓄勢確認且無追高（回測最佳格 60.3%，n=73 樣本薄，看 OOS）">⭐ 組合 v3</span>`;
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

  function renderStats(stats) {
    $("oosTotal").textContent = stats.oos_total ?? 0;
    $("oosFilled").textContent = stats.oos_filled ?? 0;
    $("oosPending").textContent = stats.oos_pending ?? 0;
    if (stats.oos_filled) {
      $("oosWinRate").textContent = fmtPct(stats.win_rate, 1);
      $("oosSummary").textContent =
        `已對帳 ${stats.oos_filled} 筆 · 平均 ${fmtPct(stats.mean_excess, 2, true)}`;
    } else {
      $("oosWinRate").textContent = "—";
      $("oosSummary").textContent = stats.oos_total
        ? "訊號累積中，等待第一筆對帳"
        : "等待第一筆 OOS 訊號";
    }
    $("statWin").textContent = fmtPct(stats.win_rate, 1);
    $("statMean").textContent = fmtPct(stats.mean_excess, 2, true);
    $("statMedian").textContent = fmtPct(stats.median_excess, 2, true);
  }

  // 平行對帳統計：主判準列吃 stats 本體，其餘列吃 stats.extra（沒回填就顯示累積中）
  function renderParallel(stats) {
    const extra = stats.extra || {};
    const rows = Object.keys(BACKTEST_REF).map((field) => {
      const ref = BACKTEST_REF[field];
      const live = ref.main
        ? { filled: stats.oos_filled, win_rate: stats.win_rate, mean: stats.mean_excess }
        : extra[field];
      const hasLive = live && live.filled;
      const cells = hasLive
        ? `<td>${live.filled} 筆</td><td>${fmtPct(live.win_rate, 1)}</td><td>${fmtPct(live.mean, 2, true)}</td>`
        : '<td class="muted">累積中</td><td class="muted">—</td><td class="muted">—</td>';
      return `<tr${ref.main ? ' class="is-main"' : ""}>` +
        `<td>${ref.label}</td>${cells}` +
        `<td class="muted">${ref.win.toFixed(1)}%／+${ref.mean.toFixed(2)}%</td></tr>`;
    });
    $("parallelRows").innerHTML = rows.join("");
  }

  // vs 加權指數平行對帳表：全部列都吃 stats.extra（這把尺沒有主判準列）
  function renderParallelTwii(stats) {
    const extra = stats.extra || {};
    const rows = Object.keys(BACKTEST_REF_TWII).map((field) => {
      const ref = BACKTEST_REF_TWII[field];
      const live = extra[field];
      const hasLive = live && live.filled;
      const cells = hasLive
        ? `<td>${live.filled} 筆</td><td>${fmtPct(live.win_rate, 1)}</td><td>${fmtPct(live.mean, 2, true)}</td>`
        : '<td class="muted">累積中</td><td class="muted">—</td><td class="muted">—</td>';
      return `<tr><td>${ref.label}</td>${cells}` +
        `<td class="muted">${ref.win.toFixed(1)}%／${fmtPct(ref.mean, 2, true)}</td></tr>`;
    });
    $("parallelTwiiRows").innerHTML = rows.join("");
  }

  // 品質分層對帳（前端自算，只看 OOS 且 5 日 T+0 已回填的訊號）。
  // 只吃主考卷（il）：分層門檻全是 I→L 家族回測宣告的，F1（wl）另開專區不混入。
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
      ["⭐ 組合 v3（蓄勢∩非追高）", done.filter(isComboV3), "回測 60.3%"],
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

  // F1 專區：第二張考卷（wl）的 OOS 戰績卡；wl 統計由後端 stats.wl 供應。
  function renderF1(stats) {
    const box = $("f1Cards");
    if (!box) return;
    const ref = (payload && payload.f1_reference) || F1_REF_FALLBACK;
    const wl = stats.wl || { total: 0, t0: null, t1: null };
    const card = (label, live, refText) => {
      const body = live
        ? `<strong>${fmtPct(live.win_rate, 1)}</strong><span>n=${live.filled} · 平均 ${fmtPct(live.mean, 2, true)}</span>`
        : `<strong class="sig-wait">—</strong><span>等待對帳</span>`;
      return `<div class="tier-card"><small>${label} · ${refText}</small>${body}</div>`;
    };
    box.innerHTML =
      `<div class="tier-card"><small>累積訊號 · 起點 ${payload.f1_start || "2026-08-25"}</small>` +
      `<strong>${wl.total}</strong><span>門檻：百筆、勝率 &gt;50%＋平均 &gt;0</span></div>` +
      card("5 日 T+0（主統計）", wl.t0, `回測 ${ref.t0.win_rate}%／${fmtPct(ref.t0.mean_excess, 2, true)}`) +
      card("5 日 T+1（平行）", wl.t1, `回測 ${ref.t1.win_rate}%／${fmtPct(ref.t1.mean_excess, 2, true)}`);
    const note = $("f1Note");
    if (note) {
      note.textContent = wl.total
        ? `F1 已累積 ${wl.total} 筆 wl 訊號，各視窗滿天數自動對帳；與主考卷永不混算。`
        : "F1 考試 2026-08-25 起跑，第一筆「轉弱→領先＋熱門確認」出現後開始累積。";
    }
  }

  // 🕶 影子單（2026-08-25 拍板 A）：可執行版對帳——T+1 收盤買前 3 大主角、
  // 持 5 日、扣來回成本的「淨損益」。絕對報酬口徑（真的進場賺賠多少），
  // 跟考卷的相對超額是兩把尺；兩張考卷分開列。
  function renderShadow(stats) {
    const box = $("shadowCards");
    if (!box) return;
    const shadow = stats.shadow || {};
    const cost = shadow.assumed_cost ?? 0.45;
    const card = (label, live) => {
      const body = live
        ? `<strong>${fmtPct(live.win_rate, 1)}</strong><span>n=${live.filled} · 淨 ${fmtPct(live.mean_net, 2, true)} · 毛 ${fmtPct(live.mean_gross, 2, true)}</span>`
        : `<strong class="sig-wait">—</strong><span>等待對帳</span>`;
      return `<div class="tier-card"><small>${label}</small>${body}</div>`;
    };
    box.innerHTML =
      card("⚡ 主考卷影子單（改善→領先）", shadow.il) +
      card("🔁 F1 影子單（轉弱→領先）", shadow.wl);
    const note = $("shadowNote");
    if (note) {
      const cfg = (payload && payload.shadow_config) || {};
      note.textContent =
        `規則凍結：訊號隔天（T+1）收盤等金額模擬買進族群成交額前 ${cfg.top_n ?? 3} 大主角、` +
        `持 ${cfg.hold_days ?? 5} 個交易日機械出場，毛報酬扣來回成本 ${cost}%＝淨損益；` +
        `${cfg.start ?? "2026-08-25"} 起的新訊號才記（不補歷史）。勝負以淨損益 >0 判定。`;
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

  function boot(data) {
    payload = data;
    $("headerAsOf").textContent = `資料日 ${payload.as_of || "—"}`;
    $("generatedAt").textContent = payload.generated
      ? `更新於 ${String(payload.generated).slice(0, 16).replace("T", " ")}`
      : "僅供研究驗證";
    const stats = payload.stats || {};
    renderStats(stats);
    renderParallel(stats);
    renderParallelTwii(stats);
    renderF1(stats);
    renderShadow(stats);
    renderTiers(payload.signals || [], payload.oos_start || "");
    setupPills();
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
})();
