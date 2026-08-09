/* ============================================================
   SHABRAN ASSOCIATES — Logik Semak Status Tempahan
   ============================================================ */

(function () {
  "use strict";

  const MONTHS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

  function fmtMY(key) {
    if (!key) return "-";
    const p = String(key).split("-");
    if (p.length !== 3) return key;
    return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function statusInfo(s) {
    return {
      PENDING: ["pending", "Menunggu Pengesahan"],
      CONFIRMED: ["confirmed", "Disahkan"],
      REJECTED: ["rejected", "Ditolak"]
    }[s] || ["pending", "Menunggu Pengesahan"];
  }

  function render(b) {
    const [cls, label] = statusInfo(b.status);
    const badge = $("#sBadge");
    badge.textContent = label;
    badge.className = "badge " + cls;

    $("#sRef").textContent = b.ref;
    $("#sDate").textContent = fmtMY(b.date);
    $("#sTime").textContent = b.time + " (45 minit)";
    $("#sName").textContent = b.name;
    $("#sCategory").textContent = b.category || "-";
    $("#sAmount").textContent = fmtMoney(b.amount || CONFIG.fee);
    $("#sReceipt").href = "receipt.html?ref=" + encodeURIComponent(b.ref);

    const tl = $("#sTimeline");
    tl.innerHTML = "";

    const steps = [
      { done: true, t: "Tempahan Diterima", s: "Tempahan anda telah dihantar pada " + (b.created ? new Date(b.created).toLocaleString("ms-MY") : "-") + ". Resit dijana automatik." },
      { done: b.status !== "PENDING", t: "Pengesahan Bayaran", s: b.status === "CONFIRMED" ? "Bayaran anda telah disahkan oleh Shabran Associates." : b.status === "REJECTED" ? "Bayaran anda ditolak. Sila hubungi firma." : "Bayaran RM" + (b.amount || CONFIG.fee).toFixed(2) + " sedang disemak oleh pihak firma (biasanya dalam 24 jam)." },
      { done: b.status === "CONFIRMED", t: "Sesi Konsultasi", s: "Sesi anda dijadualkan pada " + fmtMY(b.date) + " jam " + b.time + ". Sila hadir 10 minit awal." }
    ];

    steps.forEach(function (st) {
      const item = document.createElement("div");
      item.className = "tl-item" + (st.done ? " done" : "");
      item.innerHTML = '<div class="tl-dot">' + (st.done ? "&#10003;" : "&#8226;") + '</div>' +
        '<div><b>' + st.t + '</b><span>' + st.s + "</span></div>";
      tl.appendChild(item);
    });

    $("#resultCard").style.display = "";
    $("#searchLoading").style.display = "none";
    $("#searchError").style.display = "none";
  }

  async function search(ref) {
    $("#resultCard").style.display = "none";
    $("#searchError").style.display = "none";

    if (!ref) { $("#searchError").style.display = ""; return; }

    if (!isBackendReady()) {
      $("#searchLoading").style.display = "none";
      try {
        const saved = JSON.parse(localStorage.getItem(CONFIG.storage.booking));
        if (saved && saved.ref.toUpperCase() === ref) { render(saved); return; }
      } catch (e) { /* ignore */ }
      $("#searchError").style.display = "";
      return;
    }

    $("#searchLoading").style.display = "";
    try {
      const data = await apiCall("getBooking", { ref: ref });
      if (data && data.booking) {
        render(data.booking);
      } else {
        $("#searchLoading").style.display = "none";
        $("#searchError").style.display = "";
      }
    } catch (e) {
      $("#searchLoading").style.display = "none";
      $("#searchError").style.display = "";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const input = $("#refInput");
    const btn = $("#btnSearch");

    function run() {
      search(input.value.trim().toUpperCase());
    }
    btn.addEventListener("click", run);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  });
})();
