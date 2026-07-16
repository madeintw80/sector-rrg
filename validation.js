(function () {
  "use strict";

  var METHOD_NAMES = {
    A_1d_capped: "現行 1 日成交額",
    B_20d_capped: "20 日均額",
    C_equal: "等權基準",
    D_legacy_uncapped: "舊版未設上限"
  };
  var METHOD_TONES = {
    A_1d_capped: "mint",
    B_20d_capped: "blue",
    C_equal: "slate",
    D_legacy_uncapped: "amber"
  };
  var STATE_META = {
    Leading: { zh: "領先", color: "#52d6a0", x: 76, y: 28 },
    Improving: { zh: "改善", color: "#5aa7ff", x: 26, y: 30 },
    Weakening: { zh: "轉弱", color: "#f4c86a", x: 74, y: 76 },
    Lagging: { zh: "落後", color: "#f27c7c", x: 28, y: 74 }
  };

  function el(id) { return document.getElementById(id); }
  function num(value, digits) {
    var n = Number(value);
    return Number.isFinite(n) ? n.toFixed(digits == null ? 2 : digits) : "—";
  }
  function pct(value, digits) { return num(value, digits) + (Number.isFinite(Number(value)) ? "%" : ""); }
  function count(value) {
    var n = Number(value);
    return Number.isFinite(n) ? Math.round(n).toLocaleString("zh-TW") : "—";
  }
  function signed(value, digits, suffix) {
    var n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return (n >= 0 ? "+" : "") + n.toFixed(digits == null ? 2 : digits) + (suffix || "");
  }
  function find(rows, method, confirmation) {
    return (rows || []).find(function (row) {
      return row.method === method && (confirmation == null || row.confirmation === confirmation);
    }) || {};
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch];
    });
  }

  function setupTabs() {
    var tabs = Array.from(document.querySelectorAll("[data-tab]"));
    var panels = Array.from(document.querySelectorAll("[data-panel]"));
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        tabs.forEach(function (item) {
          var active = item === tab;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", active ? "true" : "false");
        });
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-panel") !== target;
        });
      });
    });
  }

  function renderQuestions(items) {
    var titles = ["象限有沒有預測力？", "產業指數怎麼組較好？", "單股上限能不能防扭曲？", "能不能排除假熱門？"];
    el("questionGrid").innerHTML = (items || []).map(function (text, index) {
      return '<article><span>Q' + (index + 1) + '</span><div><b>' + escapeHtml(titles[index] || "驗證問題") +
        '</b><p>' + escapeHtml(text) + '</p></div></article>';
    }).join("");
  }

  function renderMethods(rows) {
    el("methodList").innerHTML = (rows || []).map(function (row, index) {
      var tone = METHOD_TONES[row.method] || "slate";
      var width = Math.max(0, Math.min(100, Number(row.excess_win_rate) * 2));
      return '<div class="method-row"><div class="method-letter ' + tone + '">' + String.fromCharCode(65 + index) +
        '</div><div class="method-main"><div class="method-name"><span class="method-label">' +
        escapeHtml(METHOD_NAMES[row.method] || row.method) + '</span><b>' + pct(row.excess_win_rate) +
        '</b></div><div class="bar-track"><span class="bar-fill ' + tone + '" style="width:' + width.toFixed(2) +
        '%"></span></div><small class="sample-note">n = ' + count(row.sample) +
        ' · 中位 ' + pct(row.excess_median) + ' · 最差 ' + pct(row.excess_min) +
        '</small></div><div class="method-side"><small>平均</small><strong>' + pct(row.excess_mean) + '</strong></div></div>';
    }).join("");
  }

  function renderStates(rows) {
    var order = ["Leading", "Improving", "Weakening", "Lagging"];
    var sorted = order.map(function (state) { return (rows || []).find(function (row) { return row.state === state; }); }).filter(Boolean);
    el("stateRows").innerHTML = sorted.map(function (row) {
      var meta = STATE_META[row.state];
      return '<div class="state-row"><span><i style="background:' + meta.color + '"></i>' + meta.zh +
        '</span><strong>' + pct(row.excess_win_rate) + '</strong><em>' + pct(row.excess_mean) +
        '</em><em>' + pct(row.excess_median) + '</em></div>';
    }).join("");
    sorted.forEach(function (row) {
      var meta = STATE_META[row.state];
      var point = document.createElement("div");
      point.className = "rrg-point";
      point.style.left = meta.x + "%";
      point.style.top = meta.y + "%";
      point.style.borderColor = meta.color;
      point.style.boxShadow = "0 0 0 7px " + meta.color + "18";
      point.innerHTML = "<strong>" + pct(row.excess_win_rate) + "</strong><span>" + meta.zh + " · " + row.state + "</span>";
      el("quadrantMap").appendChild(point);
    });
    var best = sorted.slice().sort(function (a, b) { return Number(b.excess_win_rate) - Number(a.excess_win_rate); })[0];
    if (best) {
      el("quadrantInsight").textContent = "樣本內「" + STATE_META[best.state].zh + "」的 20 日超額勝率最高（" +
        pct(best.excess_win_rate) + "）；但各象限平均與中位數仍需一起判讀。";
    }
  }

  function renderYears(rows) {
    var years = Array.from(new Set((rows || []).map(function (row) { return String(row.year); }))).sort();
    el("yearRows").innerHTML = years.map(function (year) {
      function win(method, confirmation) {
        var row = (rows || []).find(function (item) {
          return String(item.year) === year && item.method === method && item.confirmation === confirmation;
        }) || {};
        return pct(row.excess_win_rate);
      }
      return '<div class="year-row"><b>' + escapeHtml(year === years[years.length - 1] ? year + " YTD" : year) +
        '</b><strong>' + win("A_1d_capped", "confirmed") + '</strong><span>' + win("A_1d_capped", "unconfirmed") +
        '</span><strong>' + win("B_20d_capped", "confirmed") + '</strong><span>' + win("B_20d_capped", "unconfirmed") + '</span></div>';
    }).join("");
  }

  function render(data) {
    var bullish = data.tests && data.tests.bullish_state_20d || [];
    var stability = data.tests && data.tests.weight_stability || [];
    var hot = data.tests && data.tests.hot_confirmation_20d || [];
    var states = data.tests && data.tests.quadrant_state_20d_current_A || [];
    var yearly = data.tests && data.tests.hot_confirmation_yearly_20d || [];
    var a = find(bullish, "A_1d_capped");
    var b = find(bullish, "B_20d_capped");
    var d = find(bullish, "D_legacy_uncapped");
    var aStable = find(stability, "A_1d_capped");
    var bStable = find(stability, "B_20d_capped");
    var hotOn = find(hot, "A_1d_capped", "confirmed");
    var hotOff = find(hot, "A_1d_capped", "unconfirmed");
    var churnDrop = Number(aStable.mean_selection_churn) > 0 ?
      (1 - Number(bStable.mean_selection_churn) / Number(aStable.mean_selection_churn)) * 100 : NaN;
    var winDelta = Number(b.excess_win_rate) - Number(a.excess_win_rate);

    document.title = "RRG 有效性驗證｜資料截至 " + data.as_of;
    el("headerAsOf").textContent = "資料截至 " + data.as_of;
    if (data.recommendation && data.recommendation.title === "目前不建議更換正式權重") {
      el("heroTitle").innerHTML = "目前不建議<br><em>更換正式權重</em>";
    } else {
      el("heroTitle").textContent = data.recommendation && data.recommendation.title || "RRG 有效性驗證";
    }
    el("decisionScore").textContent = data.recommendation && data.recommendation.status === "keep_current_A" ? "保留 A" : "持續觀察";
    el("decisionSummary").textContent = data.recommendation && data.recommendation.summary || "研究結果等待更新";
    el("tradingDays").textContent = count(data.data_window && data.data_window.trading_days);
    el("categoryCount").textContent = count(data.scope && data.scope.formal_categories);
    el("methodCount").textContent = count(data.scope && data.scope.methods);

    el("legacyWorst").textContent = pct(d.excess_min);
    el("cappedWorst").textContent = pct(a.excess_min);
    el("aChurn").textContent = pct(Number(aStable.mean_selection_churn) * 100);
    el("bChurn").textContent = pct(Number(bStable.mean_selection_churn) * 100);
    el("stabilityCardText").textContent = "20 日均額使成分更穩，但 20 日超額勝率由 " + pct(a.excess_win_rate) + " 降到 " + pct(b.excess_win_rate) + "。";
    el("hotOffWin").textContent = pct(hotOff.excess_win_rate);
    el("hotOnWin").textContent = pct(hotOn.excess_win_rate);
    el("hotCardText").textContent = "確認後勝率增加 " + signed(Number(hotOn.excess_win_rate) - Number(hotOff.excess_win_rate), 2, " 個百分點") + "，但平均與中位超額仍為負。";

    el("hotOffWinDetail").textContent = pct(hotOff.excess_win_rate);
    el("hotOnWinDetail").textContent = pct(hotOn.excess_win_rate);
    el("hotOffSample").textContent = "n = " + count(hotOff.sample);
    el("hotOnSample").textContent = "n = " + count(hotOn.sample);
    el("hotGain").textContent = signed(Number(hotOn.excess_win_rate) - Number(hotOff.excess_win_rate), 2);
    el("hotMean").textContent = pct(hotOn.excess_mean);
    el("hotMedian").textContent = pct(hotOn.excess_median);
    el("hotWorst").textContent = pct(hotOn.excess_min);

    el("churnReduction").textContent = Number.isFinite(churnDrop) ? "−" + churnDrop.toFixed(0) + "%" : "—";
    el("aChurnDetail").textContent = pct(Number(aStable.mean_selection_churn) * 100);
    el("bChurnDetail").textContent = pct(Number(bStable.mean_selection_churn) * 100);
    el("aChurnBar").style.width = Math.min(100, Number(aStable.mean_selection_churn) * 1000) + "%";
    el("bChurnBar").style.width = Math.min(100, Number(bStable.mean_selection_churn) * 1000) + "%";
    el("aTurnover").textContent = pct(Number(aStable.mean_weight_turnover) * 100);
    el("bTurnover").textContent = pct(Number(bStable.mean_weight_turnover) * 100);
    el("bDecisionText").textContent = "雖然成分更穩，20 日超額勝率仍比 A " + signed(winDelta, 2, " 個百分點") + "。";

    el("baselineDate").textContent = data.as_of;
    el("baselineText").textContent = count(data.data_window && data.data_window.trading_days) + " 個交易日 · " + count(data.scope && data.scope.formal_categories) + " 個正式分類";
    el("generatedAt").textContent = "產生於 " + String(data.generated_at || "—").replace("T", " ");
    el("limitationsList").innerHTML = (data.limitations || []).map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("");

    renderQuestions(data.what_is_being_tested);
    renderMethods(bullish);
    renderStates(states);
    renderYears(yearly);
  }

  function showError(error) {
    el("loadingState").innerHTML = '<div><b>暫時讀不到回測資料</b><p>' + escapeHtml(error && error.message || "請稍後重試") +
      '</p><div class="error-actions"><button type="button" id="retryValidation">重新載入</button><a class="back-link" href="index.html">回輪動圖</a></div></div>';
    var retry = el("retryValidation");
    if (retry) retry.addEventListener("click", function () { location.reload(); });
  }

  setupTabs();
  fetch("rrg_validation.json?ts=" + Date.now(), { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      if (Number(data.schema_version) !== 1) throw new Error("不支援的回測資料版本");
      render(data);
      el("loadingState").hidden = true;
      el("validationApp").hidden = false;
    })
    .catch(showError);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
