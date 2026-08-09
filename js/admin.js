/* ============================================================
   SHABRAN ASSOCIATES — Panel Pentadbir
   - Log masuk
   - Dashboard statistik
   - Sahkan / tolak tempahan (notifikasi email ke klien)
   - Upload foto peguam & QR code
   - Urus tarikh cuti
   ============================================================ */

(function () {
  "use strict";

  let loggedIn = false;
  let allBookings = [];
  let blockedList = [];

  const MONTHS = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

  function fmtMY(key) {
    if (!key) return "-";
    const p = String(key).split("-");
    return p[2] + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function fmtDateTime(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() + ", " +
      String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  const statusLabel = { PENDING: "Menunggu", CONFIRMED: "Disahkan", REJECTED: "Ditolak" };
  const statusBadge = { PENDING: "pending", CONFIRMED: "confirmed", REJECTED: "rejected" };

  /* ---------- Log masuk ---------- */
  async function doLogin() {
    const pass = $("#loginPass").value.trim();
    if (!pass) { toast("Sila masukkan kata laluan.", "error"); return; }

    let valid = pass === CONFIG.adminPassword;
    if (!valid && isBackendReady()) {
      try {
        const res = await apiCall("verify", { password: pass });
        valid = !!(res && res.ok);
      } catch (e) { valid = false; }
    }
    if (valid) {
      loggedIn = true;
      sessionStorage.setItem("sha_admin", "1");
      $("#loginCard").style.display = "none";
      $("#adminShell").style.display = "flex";
      loadAll();
      toast("Selamat kembali, Tuan Shabran.");
    } else {
      toast("Kata laluan salah.", "error");
    }
  }

  function doLogout() {
    loggedIn = false;
    sessionStorage.removeItem("sha_admin");
    $("#adminShell").style.display = "none";
    $("#loginCard").style.display = "";
    $("#loginPass").value = "";
  }

  /* ---------- Tabs ---------- */
  function switchTab(name) {
    $all(".admin-tab[data-tab]").forEach(function (t) {
      t.classList.toggle("active", t.dataset.tab === name);
    });
    $all(".admin-panel").forEach(function (p) {
      p.classList.remove("active");
    });
    const panel = $("#panel-" + name);
    if (panel) panel.classList.add("active");
    const titles = { dash: "Dashboard", bookings: "Senarai Tempahan", settings: "Tetapan", blocked: "Tarikh Cuti" };
    $("#panelTitle").textContent = titles[name] || "Dashboard";
  }

  /* ---------- Muat data ---------- */
  async function loadAll() {
    if (isBackendReady()) {
      try {
        const data = await apiCall("getBookings", { password: CONFIG.adminPassword });
        if (data && data.bookings) allBookings = data.bookings;
      } catch (e) {
        toast("Gagal memuatkan tempahan dari server. (" + e.message + ")", "error");
      }
      try {
        const b = await apiCall("getBlocked", {});
        if (b && b.blocked) blockedList = b.blocked;
      } catch (e) { /* ignore */ }
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(CONFIG.storage.booking));
        if (saved) allBookings = [saved];
      } catch (e) { /* ignore */ }
    }
    renderDash();
    renderBookings();
    renderBlocked();
    renderSettings();
  }

  /* ---------- Dashboard ---------- */
  function renderDash() {
    const pending = allBookings.filter(function (b) { return b.status === "PENDING"; }).length;
    const confirmed = allBookings.filter(function (b) { return b.status === "CONFIRMED"; }).length;
    const rejected = allBookings.filter(function (b) { return b.status === "REJECTED"; }).length;
    $("#stTotal").textContent = allBookings.length;
    $("#stPending").textContent = pending;
    $("#stConfirmed").textContent = confirmed;
    $("#stRejected").textContent = rejected;

    const recent = allBookings.slice(-6).reverse();
    const wrap = $("#dashRecent");
    if (!recent.length) {
      wrap.innerHTML = '<p style="color:var(--ink-soft);font-size:14px">Tiada tempahan lagi.</p>';
      return;
    }
    wrap.innerHTML = "<table class='b-table'><thead><tr><th>Rujukan</th><th>Tarikh Sesi</th><th>Nama</th><th>Status</th></tr></thead><tbody>" +
      recent.map(function (b) {
        return "<tr><td class='ref'>" + esc(b.ref) + "</td><td>" + fmtMY(b.date) + " " + esc(b.time) + "</td><td>" + esc(b.name) + "</td><td><span class='badge " + statusBadge[b.status] + "'>" + statusLabel[b.status] + "</span></td></tr>";
      }).join("") + "</tbody></table>";
  }

  /* ---------- Senarai tempahan ---------- */
  function renderBookings() {
    const fStatus = $("#fStatus").value;
    const q = $("#fSearch").value.trim().toLowerCase();
    let list = allBookings.slice().reverse();
    if (fStatus) list = list.filter(function (b) { return b.status === fStatus; });
    if (q) {
      list = list.filter(function (b) {
        return [b.ref, b.name, b.ic, b.email, b.phone].join(" ").toLowerCase().indexOf(q) !== -1;
      });
    }
    const wrap = $("#bookingTable");
    if (!list.length) {
      wrap.innerHTML = '<p style="color:var(--ink-soft);font-size:14px">Tiada tempahan dijumpai.</p>';
      return;
    }
    wrap.innerHTML = "<table class='b-table'><thead><tr><th>Rujukan</th><th>Sesi</th><th>Klien</th><th>Bayaran</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>" +
      list.map(function (b) {
        return "<tr>"
          + "<td class='ref'>" + esc(b.ref) + "<br><span style='font-size:11px;color:var(--ink-soft)'>" + fmtDateTime(b.created) + "</span></td>"
          + "<td>" + fmtMY(b.date) + "<br><b>" + esc(b.time) + "</b> &bull; " + esc(b.category || "-") + "</td>"
          + "<td><b>" + esc(b.name) + "</b><br><span style='font-size:12px;color:var(--ink-soft)'>" + esc(b.ic) + "<br>" + esc(b.phone) + " &bull; " + esc(b.email) + "</span></td>"
          + "<td><b>" + fmtMoney(b.amount || CONFIG.fee) + "</b><br><span style='font-size:12px;color:var(--ink-soft)'>" + esc(b.bank || "-") + "<br>Ruj: " + esc(b.payRef || "-") + "</span></td>"
          + "<td><span class='badge " + statusBadge[b.status] + "'>" + statusLabel[b.status] + "</span>"
          + (b.rejectReason ? "<br><span style='font-size:11px;color:var(--red)'>" + esc(b.rejectReason) + "</span>" : "") + "</td>"
          + "<td class='row-actions'>"
          + (b.status === "PENDING" ? "<button class='btn-icon btn-ok' data-act='confirm' data-ref='" + esc(b.ref) + "'>&#10003; Sahkan</button><button class='btn-icon btn-no' data-act='reject' data-ref='" + esc(b.ref) + "'>&#10007; Tolak</button>" : "")
          + "<button class='btn-icon btn-warn' data-act='mail' data-ref='" + esc(b.ref) + "'>&#9993;</button>"
          + "</td></tr>";
      }).join("") + "</tbody></table>";

    $all("[data-act]", wrap).forEach(function (btn) {
      btn.addEventListener("click", function () { handleAction(btn.dataset.act, btn.dataset.ref); });
    });
  }

  /* ---------- Tindakan ---------- */
  async function handleAction(act, ref) {
    const b = allBookings.find(function (x) { return x.ref === ref; });
    if (!b) return;

    if (act === "confirm") {
      if (!confirm("Sahkan tempahan " + ref + "?\n\nKlien akan dimaklumkan melalui email: " + b.email)) return;
      await doAction("confirmBooking", { ref: ref }, "Tempahan disahkan. Klien telah dimaklumkan melalui email.");
    } else if (act === "reject") {
      const reason = prompt("Sebab penolakan (dihantar ke email klien):", "Bayaran tidak dapat disahkan");
      if (reason === null) return;
      await doAction("rejectBooking", { ref: ref, reason: reason.trim() }, "Tempahan ditolak. Klien telah dimaklumkan melalui email.");
    } else if (act === "mail") {
      const subject = encodeURIComponent("Tempahan Konsultasi - " + ref);
      const body = encodeURIComponent(
        "Assalamualaikum " + b.name + ",\n\nRujukan tempahan: " + ref +
        "\nTarikh: " + fmtMY(b.date) + " jam " + b.time +
        "\nStatus: " + statusLabel[b.status] +
        "\n\nSemak status: https://yoursite.github.io/status.html\n\nShabran Associates"
      );
      window.open("mailto:" + b.email + "?subject=" + subject + "&body=" + body, "_blank");
    }
  }

  async function doAction(action, payload, successMsg) {
    if (!isBackendReady()) {
      const saved = JSON.parse(localStorage.getItem(CONFIG.storage.booking) || "{}");
      if (saved && saved.ref === payload.ref) {
        saved.status = action === "confirmBooking" ? "CONFIRMED" : "REJECTED";
        if (payload.reason) saved.rejectReason = payload.reason;
        localStorage.setItem(CONFIG.storage.booking, JSON.stringify(saved));
        toast("(Mod offline) " + successMsg, "success");
        loadAll();
        return;
      }
      toast("Backend belum disambung. Tindakan tidak disimpan.", "error");
      return;
    }
    const btn = document.activeElement;
    if (btn) { btn.disabled = true; btn.classList.add("loading"); }
    try {
      await apiCall(action, Object.assign({ password: CONFIG.adminPassword }, payload));
      toast(successMsg, "success");
      loadAll();
    } catch (e) {
      toast("Ralat: " + e.message, "error");
    } finally {
      if (btn) { btn.disabled = false; btn.classList.remove("loading"); }
    }
  }

  /* ---------- Tarikh cuti ---------- */
  function renderBlocked() {
    const wrap = $("#blockList");
    if (!blockedList.length) {
      wrap.innerHTML = '<p style="color:var(--ink-soft);font-size:14px">Tiada tarikh cuti. Semua hari bekerja (Isnin-Jumaat) terbuka untuk tempahan.</p>';
      return;
    }
    wrap.innerHTML = "<table class='b-table'><thead><tr><th>Tarikh</th><th>Sebab</th><th></th></tr></thead><tbody>" +
      blockedList.sort().map(function (x) {
        return "<tr><td><b>" + fmtMY(x.date) + "</b></td><td>" + esc(x.reason || "-") + "</td><td><button class='btn-icon btn-no' data-del='" + esc(x.date) + "'>Buang</button></td></tr>";
      }).join("") + "</tbody></table>";
    $all("[data-del]", wrap).forEach(function (btn) {
      btn.addEventListener("click", async function () {
        if (!isBackendReady()) { toast("Backend belum disambung.", "error"); return; }
        try {
          await apiCall("unblockDate", { date: btn.dataset.del, password: CONFIG.adminPassword });
          toast("Tarikh dibuka semula.");
          loadAll();
        } catch (e) { toast("Ralat: " + e.message, "error"); }
      });
    });
  }

  async function addBlock() {
    const date = $("#blockDate").value;
    const reason = $("#blockReason").value.trim();
    if (!date) { toast("Sila pilih tarikh.", "error"); return; }
    if (!isBackendReady()) { toast("Backend belum disambung.", "error"); return; }
    try {
      await apiCall("blockDate", { date: date, reason: reason, password: CONFIG.adminPassword });
      toast("Tarikh ditutup untuk tempahan.");
      $("#blockDate").value = "";
      $("#blockReason").value = "";
      loadAll();
    } catch (e) { toast("Ralat: " + e.message, "error"); }
  }

  /* ---------- Upload gambar ---------- */
  function setupUpload(fileInputId, zoneId, previewId, storageKey, imgType) {
    const fileInput = $(fileInputId);
    const zone = $(zoneId);
    const preview = $(previewId);

    zone.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () {
      const f = fileInput.files[0];
      if (!f) return;
      if (f.size > 5 * 1024 * 1024) { toast("Gambar terlalu besar (maksimum 5MB).", "error"); return; }
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          localStorage.setItem(storageKey, e.target.result);
          toast("Gambar berjaya dimuat naik. Ia akan digunakan di seluruh laman web.");
          renderPreviews();
          applyCustomImages();
        } catch (err) {
          toast("Gambar gagal disimpan (saiz terlalu besar). Sila gunakan gambar yang lebih kecil.", "error");
        }
      };
      reader.readAsDataURL(f);
    });

    const img = document.createElement("img");
    img.id = "img-" + previewId;
    img.style.cssText = "width:120px;height:120px;object-fit:cover;border-radius:12px;border:1px solid #e6dcc4;background:#fff";
    preview.appendChild(img);
  }

  function renderPreviews() {
    try {
      const qr = localStorage.getItem(CONFIG.storage.qr);
      const photo = localStorage.getItem(CONFIG.storage.photo);
      $("#img-qrPreview").src = qr || "images/qr.svg";
      $("#img-photoPreview").src = photo || "images/lawyer.svg";
    } catch (e) { /* ignore */ }
  }

  function renderSettings() {
    const ready = isBackendReady();
    $("#sysInfo").innerHTML =
      "<b>Backend:</b> " + (ready ? "&#10003; Bersambung" : "&#10007; Belum disambung (lihat SETUP.md)") +
      "<br><b>Yuran konsultasi:</b> " + CONFIG.feeText +
      "<br><b>Emel notifikasi:</b> " + CONFIG.email +
      "<br><br><i>Nota: Gambar yang dimuat naik disimpan dalam pelayar ini sahaja. Untuk paparan kekal kepada semua pengunjung, gantikan fail <b>images/lawyer.jpg</b> dan <b>images/qr.png</b> terus dalam folder laman web anda.</i>";
    renderPreviews();
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    $("#btnLogin").addEventListener("click", doLogin);
    $("#loginPass").addEventListener("keydown", function (e) { if (e.key === "Enter") doLogin(); });
    $("#btnLogout").addEventListener("click", doLogout);
    $("#btnRefresh").addEventListener("click", loadAll);
    $("#fStatus").addEventListener("change", renderBookings);
    $("#fSearch").addEventListener("input", renderBookings);
    $("#btnAddBlock").addEventListener("click", addBlock);

    $all(".admin-tab[data-tab]").forEach(function (t) {
      t.addEventListener("click", function () { switchTab(t.dataset.tab); });
    });

    setupUpload("#photoFile", "#photoZone", "photoPreview", CONFIG.storage.photo, "photo");
    setupUpload("#qrFile", "#qrZone", "qrPreview", CONFIG.storage.qr, "qr");

    if (sessionStorage.getItem("sha_admin") === "1") {
      loggedIn = true;
      $("#loginCard").style.display = "none";
      $("#adminShell").style.display = "flex";
      loadAll();
    }
  });
})();
