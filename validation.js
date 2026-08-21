/* 假設實驗室頁：內容以「凍結研究數字」為主（寫死在 HTML，標註凍結資料窗），
   只有兩塊是活的——
   ① 地基三卡：吃每月排程重跑的 rrg_validation.json（裸象限／熱門確認勝率）
   ② 公開考試：吃每日排程的 rotation_signals.json（OOS 統計）
   任何一份抓不到都不擋頁面，live 欄位維持預設值。 */
(function () {
  "use strict";

  function el(id) { return document.getElementById(id); }
  function pct(value, digits) {
    var n = Number(value);
    return Number.isFinite(n) ? n.toFixed(digits == null ? 1 : digits) + "%" : "—";
  }
  function signedPct(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return (n > 0 ? "+" : "") + n.toFixed(2) + "%";
  }
  function find(rows, criteria) {
    return (rows || []).find(function (row) {
      return Object.keys(criteria).every(function (key) { return row[key] === criteria[key]; });
    }) || {};
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

  // ── 地基三卡：每月排程重跑的驗證 JSON（抓不到就維持 HTML 內的凍結數字）──
  function renderFoundation(data) {
    var tests = data.tests || {};
    var bullishA = find(tests.bullish_state_20d, { method: "A_1d_capped" });
    var hotOn = find(tests.hot_confirmation_20d, { method: "C_equal", confirmation: "confirmed" });
    var hotOff = find(tests.hot_confirmation_20d, { method: "C_equal", confirmation: "unconfirmed" });
    if (bullishA.excess_win_rate !== undefined) el("baseQuadrant").textContent = pct(bullishA.excess_win_rate);
    if (hotOn.excess_win_rate !== undefined) el("baseHotOn").textContent = pct(hotOn.excess_win_rate);
    if (hotOff.excess_win_rate !== undefined) el("baseHotOff").textContent = pct(hotOff.excess_win_rate);
    if (data.as_of) {
      el("headerAsOf").textContent = "地基回測截至 " + data.as_of;
      el("baseAsOf").textContent = "地基回測截至 " + data.as_of + " · 每月 1 日重跑";
    }
    if (data.generated_at) {
      el("generatedAt").textContent = "地基更新於 " + String(data.generated_at).slice(0, 16).replace("T", " ");
    }
  }

  // ── 公開考試：每日排程的訊號帳本（OOS 統計）──
  function renderOos(payload) {
    var stats = payload.stats || {};
    el("heroOos").textContent = (stats.oos_total ?? 0) + " 筆";
    el("oosTotal").textContent = stats.oos_total ?? 0;
    el("oosFilled").textContent = stats.oos_filled ?? 0;
    el("oosWin").textContent = stats.oos_filled ? pct(stats.win_rate) : "—";
    el("oosMean").textContent = stats.oos_filled ? signedPct(stats.mean_excess) : "—";
    if (payload.as_of) {
      el("oosNote").textContent = "訊號資料日 " + payload.as_of +
        "；統計每天 18:00 排程後更新，各視窗滿天數自動回填。";
    }
  }

  setupTabs();

  fetch("rrg_validation.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(renderFoundation)
    .catch(function () { /* 地基 JSON 抓不到＝保留 HTML 凍結數字 */ });

  fetch("rotation_signals.json", { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(renderOos)
    .catch(function () { /* 帳本還沒產出＝live 欄位維持「—」 */ });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
