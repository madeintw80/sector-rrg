/* 輪動訊號追蹤頁：讀 rotation_signals.json、渲染 OOS 統計與對帳明細。
   資料由 research/rotation_tracker.py 每日排程產出。 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function fmtPct(value, digits = 1, signed = false) {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    const text = Number(value).toFixed(digits);
    return (signed && value > 0 ? "+" : "") + text + "%";
  }

  function renderStats(payload) {
    const stats = payload.stats || {};
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

  function resultCell(signal, isReference) {
    if (isReference) return '<span class="sig-ref">參考</span>';
    if (signal.excess_eqw_5 === null || signal.excess_eqw_5 === undefined)
      return '<span class="sig-wait">⏳ 等待</span>';
    return signal.win
      ? '<span class="sig-win">✓ 贏</span>'
      : '<span class="sig-loss">✗ 輸</span>';
  }

  function renderRows(payload) {
    const labels = payload.level_labels || {};
    const oosStart = payload.oos_start || "";
    const rows = (payload.signals || []).map((signal) => {
      const isReference = signal.date < oosStart;
      const excess = signal.excess_eqw_5;
      const excessText = (excess === null || excess === undefined)
        ? "—"
        : fmtPct(excess, 2, true);
      const excessClass = (excess === null || excess === undefined)
        ? "sig-wait" : (excess > 0 ? "sig-win" : "sig-loss");
      const level = labels[signal.level] || signal.level;
      const members = (signal.members || []).slice(0, 6).join("、");
      const rowClass = isReference ? ' class="sig-ref"' : "";
      return `<tr${rowClass}>` +
        `<td>${signal.date}</td>` +
        `<td>${signal.group_name}<span class="level-chip">${level}</span></td>` +
        `<td class="members">${members}</td>` +
        `<td class="num">${signal.turnover_heat ?? "—"}x</td>` +
        `<td class="num">${signal.breadth_up20 !== undefined && signal.breadth_up20 !== null
          ? Math.round(signal.breadth_up20 * 100) + "%" : "—"}</td>` +
        `<td class="num ${excessClass}">${excessText}</td>` +
        `<td>${resultCell(signal, isReference)}</td>` +
        "</tr>";
    });
    $("signalRows").innerHTML = rows.join("");
    $("ledgerCount").textContent = `共 ${rows.length} 筆`;
    $("emptyNote").hidden = rows.length > 0;
  }

  function boot(payload) {
    $("headerAsOf").textContent = `資料日 ${payload.as_of || "—"}`;
    $("generatedAt").textContent = payload.generated
      ? `更新於 ${String(payload.generated).slice(0, 16).replace("T", " ")}`
      : "僅供研究驗證";
    renderStats(payload);
    renderRows(payload);
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
