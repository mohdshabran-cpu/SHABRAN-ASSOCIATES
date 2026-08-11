/* ============================================================
   SHABRAN ASSOCIATES — Logik Semak Status Tempahan
   Aliran: PENDING -> CONFIRMED (masa disahkan, QR dipapar)
           -> PAID (resit dihantar) -> FINALIZED (muktamad)
   ============================================================ */

(function () {
  "use strict";

  const MONTHS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

  let currentBooking = null;
  let receiptFileData = null;

  function fmtMY(key) {
    if (!key) return "-";
    const p = String(key).split("-");
    if (p.length !== 3) return key;
    return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function statusInfo(s) {
    return {
      PENDING: ["pending", "Menunggu Pengesahan Masa"],
      CONFIRMED: ["confirmed", "Masa Disahkan - Menunggu Bayaran"],
      PAID: ["paid", "Resit Diterima - Menunggu Pengesahan Bayaran"],
      FINALIZED: ["final", "Muktamad"],
      REJECTED: ["rejected", "Ditolak"]
    }[s] || ["pending", "Menunggu Pengesahan Masa"];
  }

  function render(b) {
    currentBooking = b;
    const [cls, label] = statusInfo(b.status);
    const badge = $("#sBadge");
    badge.textContent = label;
    badge.className = "badge " + cls;

    $("#sRef").textContent = b.ref;
    $("#sDate").textContent = fmtMY(b.date);
    $("#sTime").textContent = "Bermula " + fmtTime12(b.time) + " (sesi 45 minit)";
    $("#sName").textContent = b.name;
    $("#sCategory").textContent = b.category || "-";
    $("#sAmount").textContent = fmtMoney(b.amount || CONFIG.fee);
    $("#sReceipt").href = "receipt.html?ref=" + encodeURIComponent(b.ref);
    $("#payRefLabel").textContent = b.ref;

    /* Banner: slot kini tidak tersedia */
    const blocked = $("#sBlocked");
    if (blocked) blocked.style.display = b.slotBlocked ? "" : "none";

    /* Panel bayaran (QR + resit) */
    const panel = $("#payPanel");
    if (panel) {
      if (b.status === "CONFIRMED") {
        panel.style.display = "";
        $("#payStepPay").style.display = "";
        $("#payStepUpload").style.display = "none";
        $("#payStepFinal").style.display = "none";
        $("#payStepUploadForm").style.display = "";
      } else if (b.status === "PAID") {
        panel.style.display = "";
        $("#payStepPay").style.display = "none";
        $("#payStepUpload").style.display = "";
        $("#payStepFinal").style.display = "none";
        $("#payStepUploadForm").style.display = "none";
      } else if (b.status === "FINALIZED") {
        panel.style.display = "";
        $("#payStepPay").style.display = "none";
        $("#payStepUpload").style.display = "none";
        $("#payStepFinal").style.display = "";
        $("#payStepUploadForm").style.display = "none";
      } else {
        panel.style.display = "none";
      }
    }

    const tl = $("#sTimeline");
    tl.innerHTML = "";

    const steps = [
      { done: true, t: "Tempahan Diterima", s: "Kelengkapan tempahan dihantar pada " + (b.created ? new Date(b.created).toLocaleString("ms-MY") : "-") + "." },
      { done: b.status !== "PENDING" && b.status !== "REJECTED", t: "Pengesahan Masa Tempahan", s: b.status === "CONFIRMED" || b.status === "PAID" || b.status === "FINALIZED" ? "Masa tempahan anda telah disahkan oleh Shabran Associates." : b.status === "REJECTED" ? "Tempahan anda ditolak. Sila hubungi firma." : "Pihak firma sedang mengesahkan masa tempahan anda (biasanya dalam 24 jam bekerja)." },
      { done: b.status === "CONFIRMED" || b.status === "PAID" || b.status === "FINALIZED", t: "Bayaran - RM" + (b.amount || CONFIG.fee).toFixed(2), s: b.status === "PAID" ? "Resit anda telah diterima. Menunggu pengesahan bayaran oleh pihak firma." : b.status === "FINALIZED" ? "Bayaran anda telah disahkan. Tempahan adalah MUKTAMAD." : "Imbas QR di bawah dan muat naik resit bayaran untuk memuktamadkan tempahan." },
      { done: b.status === "FINALIZED", t: "Sesi Konsultasi", s: "Sesi anda dijadualkan pada " + fmtMY(b.date) + ", " + fmtTime12(b.time) + ". Sila hadir 10 minit awal." }
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

  /* ---------- Muat naik resit ---------- */
  function setupReceipt() {
    const fileInput = $("#receiptFile");
    const zone = $("#receiptZone");
    const btn = $("#btnUploadReceipt");
    if (!fileInput || !btn) return;

    fileInput.addEventListener("change", function () {
      const f = fileInput.files[0];
      if (!f) return;
      if (f.size > 10 * 1024 * 1024) { toast("Resit terlalu besar (maksimum 10MB).", "error"); return; }
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          try {
            let w = img.width, h = img.height;
            const MAX = 1600;
            if (w > MAX || h > MAX) {
              if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
              else { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
            receiptFileData = canvas.toDataURL("image/jpeg", 0.85);
            btn.style.display = "";
            if (zone) zone.style.outline = "2px solid var(--green-600)";
            toast("Resit dipilih. Tekan Muat Naik Resit untuk hantar.", "success");
          } catch (err) {
            toast("Resit gagal diproses. Sila pilih gambar yang lebih kecil.", "error");
          }
        };
        img.onerror = function () { toast("Fail resit tidak sah. Sila pilih JPG / PNG.", "error"); };
        img.src = e.target.result;
      };
      reader.readAsDataURL(f);
    });

    btn.addEventListener("click", async function () {
      if (!receiptFileData) { toast("Sila pilih fail resit dahulu.", "error"); return; }
      if (!currentBooking) return;
      if (!isBackendReady()) { toast("Sistem belum bersambung ke pelayan. Cuba lagi kemudian.", "error"); return; }

      btn.disabled = true;
      btn.classList.add("loading");
      try {
        await apiCall("uploadReceipt", { ref: currentBooking.ref, data: receiptFileData, password: "" });
        toast("Resit diterima! Tempahan anda kini menunggu pengesahan bayaran oleh pihak firma.", "success");
        receiptFileData = null;
        btn.style.display = "none";
        fileInput.value = "";
        const fresh = await apiCall("getBooking", { ref: currentBooking.ref });
        if (fresh && fresh.booking) render(fresh.booking);
      } catch (e) {
        toast("Ralat menghantar resit: " + e.message, "error");
      } finally {
        btn.disabled = false;
        btn.classList.remove("loading");
      }
    });
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

    setupReceipt();
    const mp = window.location.search.match(/[?&]ref=([^&]+)/);
    if (mp) {
      input.value = decodeURIComponent(mp[1]);
      run();
    }
  });
})();