/* ============================================================
   SHABRAN ASSOCIATES — Logik Resit Automatik
   ============================================================ */

(function () {
  "use strict";

  const MONTHS = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

  function fmtMY(key) {
    if (!key) return "-";
    const p = String(key).split("-");
    if (p.length !== 3) return key;
    return parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function fmtTime(hhmm) {
    if (!hhmm) return "-";
    let s = String(hhmm).trim();
    const iso = s.match(/^\d{4}-\d{2}-\d{2}T/);
    if (iso) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        s = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      }
    }
    const m = s.match(/(\d{1,2}):(\d{2})/);
    if (!m) return s || "-";
    let h = parseInt(m[1], 10);
    const min = m[2];
    const ap = h >= 12 ? "pm" : "am";
    if (h === 0) h = 12; else if (h > 12) h = h - 12;
    return h + "." + min + " " + ap;
  }

  function fmtDateTime(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() +
      ", " + fmtTime(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"));
  }

  function statusLabel(s) {
    return { PENDING: "MENUNGGU PENGESAHAN BAYARAN", CONFIRMED: "LUNAS &bull; BAYARAN DISAHKAN", REJECTED: "BATAL &bull; BAYARAN DITOLAK" }[s] || s;
  }

  function render(b) {
    $("#receiptLoading").style.display = "none";
    $("#receiptError").style.display = "none";
    $("#receiptDoc").style.display = "";

    const status = b.status || "PENDING";
    $("#rReceiptNo").textContent = "SR-" + (b.ref || "").replace("SHA-", "");
    $("#rRef").textContent = b.ref;
    $("#rName").textContent = b.name;
    $("#rIc").textContent = "No. K/P: " + b.ic;
    $("#rPhone").textContent = "Tel: " + b.phone;
    $("#rEmail").textContent = "Email: " + b.email;
    $("#rDate").textContent = fmtDateTime(b.created);
    $("#rSessionDate").textContent = fmtMY(b.date);
    $("#rSessionTime").textContent = "Bermula " + fmtTime(b.time) + " (sesi 45 minit)";
    $("#rCategory").textContent = b.category || "-";
    $("#rPayRef").textContent = b.payRef || "-";
    $("#rBank").textContent = b.bank || "-";
    $("#rPayDate").textContent = fmtMY(b.payDate);
    $("#rAmount").textContent = Number(b.amount || CONFIG.fee).toFixed(2);
    $("#rTotal").textContent = fmtMoney(b.amount || CONFIG.fee);
    $("#rDesc").textContent = CONFIG.feeDesc;

    const stamp = $("#rStamp");
    stamp.textContent = statusLabel(status);
    stamp.classList.toggle("waiting", status !== "CONFIRMED");

    $("#rStatusNote").textContent =
      status === "CONFIRMED" ? "Bayaran telah disahkan oleh pihak firma." :
      status === "REJECTED" ? "Tempahan ditolak. Sila hubungi firma untuk bayaran balik / penjelasan." :
      "Resit ini sah sebaik sahaja bayaran disahkan oleh pihak firma (biasanya dalam 24 jam).";
  }

  async function load() {
    const params = new URLSearchParams(window.location.search);
    let ref = (params.get("ref") || "").trim().toUpperCase();

    if (!ref) {
      try {
        const saved = JSON.parse(localStorage.getItem(CONFIG.storage.booking));
        if (saved && saved.ref) ref = saved.ref.toUpperCase();
      } catch (e) { /* ignore */ }
    }

    if (!ref) { showError(); return; }

    if (isBackendReady()) {
      try {
        const data = await apiCall("getBooking", { ref: ref });
        if (data && data.booking) { render(data.booking); return; }
      } catch (e) { /* fall through ke local */ }
    }

    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.storage.booking));
      if (saved && saved.ref && saved.ref.toUpperCase() === ref) { render(saved); return; }
    } catch (e) { /* ignore */ }

    showError();
  }

  function showError() {
    $("#receiptLoading").style.display = "none";
    $("#receiptError").style.display = "";
  }

  document.addEventListener("DOMContentLoaded", load);
})();
