/* ============================================================
   SHABRAN ASSOCIATES — Logik Resit Automatik
   ============================================================ */

(function () {
  "use strict";

  function fmtMY(key) {
    const MONTHS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    if (!key) return "-";
    const p = String(key).split("-");
    if (p.length !== 3) return key;
    return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function fmtDateTime(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const MONTHS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() +
      ", " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
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
    $("#rSessionTime").textContent = b.time + " (45 minit)";
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
