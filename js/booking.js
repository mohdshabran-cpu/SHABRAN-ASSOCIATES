/* ============================================================
   SHABRAN ASSOCIATES — Logik Tempahan (4 langkah + kalendar)
   ============================================================ */

(function () {
  "use strict";

  let currentStep = 1;
  let calYear, calMonth;
  let selectedDate = null;   /* "YYYY-MM-DD" */
  let selectedSlot = null;
  let blockedDates = [];     /* ["YYYY-MM-DD", ...] */
  let bookedSlots = {};      /* { "YYYY-MM-DD": ["09:00", ...] } */
  let backendReady = isBackendReady();
  let lastBooking = null;

  const MONTHS_MS = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
  const DAYS_MS = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];

  function todayStr() {
    const d = new Date();
    return fmtDateKey(d);
  }

  function fmtDateKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function fmtDateMY(key) {
    const p = key.split("-");
    return p[2] + " " + MONTHS_MS[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function maxDate() {
    const d = new Date();
    d.setMonth(d.getMonth() + CONFIG.maxMonthAdvance);
    return d;
  }

  /* ---------- Navigasi langkah ---------- */
  function goStep(n) {
    currentStep = n;
    [1, 2, 3, 4].forEach(function (i) {
      const card = $("#step" + i);
      const pill = $('.step-pill[data-step="' + i + '"]');
      if (card) card.style.display = i === n ? "" : "none";
      if (pill) {
        pill.classList.toggle("active", i === n);
        pill.classList.toggle("done", i < n);
      }
    });
    if (n === 2) refreshCalendar();
    if (n === 3) fillPaySummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Langkah 1: pengesahan ---------- */
  function validateStep1() {
    let ok = true;
    const rules = [
      ["#fName", function (v) { return v.length >= 3; }],
      ["#fIc", function (v) { return v.length >= 6; }],
      ["#fPhone", function (v) { return /^[0-9+\-\s]{9,15}$/.test(v); }],
      ["#fEmail", function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }],
      ["#fCategory", function (v) { return v !== ""; }]
    ];
    rules.forEach(function (r) {
      const el = $(r[0]);
      const good = r[1](el.value.trim());
      markInvalid(el, !good);
      if (!good) ok = false;
    });
    if (ok) {
      goStep(2);
    } else {
      toast("Sila lengkapkan maklumat bertanda * dengan betul.", "error");
    }
  }

  /* ---------- Langkah 2: kalendar & slot ---------- */
  async function loadAvailability() {
    if (!backendReady) {
      $("#backendNote").style.display = "";
      return;
    }
    try {
      const data = await apiCall("getAvailability");
      if (data) {
        blockedDates = data.blocked || [];
        bookedSlots = data.booked || {};
        (data.blockedTimes || []).forEach(function (bt) {
          if (bookedSlots[bt.date] && bookedSlots[bt.date].indexOf(bt.time) !== -1) return;
          if (!bookedSlots[bt.date]) bookedSlots[bt.date] = [];
          bookedSlots[bt.date].push(bt.time);
        });
      }
    } catch (e) {
      if (e.message === "BACKEND_NOT_CONFIGURED") {
        backendReady = false;
        $("#backendNote").style.display = "";
      }
    }
  }

  function refreshCalendar() {
    const now = new Date();
    if (calYear === undefined) {
      calYear = now.getFullYear();
      calMonth = now.getMonth();
    }
    renderCalendar();
  }

  function renderCalendar() {
    $("#calTitle").textContent = MONTHS_MS[calMonth] + " " + calYear;
    const grid = $("#calGrid");
    grid.innerHTML = "";

    DAYS_MS.forEach(function (d) {
      const el = document.createElement("div");
      el.className = "cal-dow";
      el.textContent = d;
      grid.appendChild(el);
    });

    const first = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const startDow = first.getDay();
    const today = todayStr();
    const max = fmtDateKey(maxDate());

    for (let i = 0; i < startDow; i++) {
      grid.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = calYear + "-" + String(calMonth + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      const btn = document.createElement("button");
      btn.className = "cal-day";
      btn.textContent = d;
      btn.type = "button";

      let disabled = false;
      if (key < today) disabled = true;
      if (key > max) disabled = true;
      if (CONFIG.closedDays.indexOf(new Date(calYear, calMonth, d).getDay()) !== -1) disabled = true;
      if (blockedDates.indexOf(key) !== -1) disabled = true;

      if (key === today) btn.classList.add("today");
      if (key === selectedDate) btn.classList.add("selected");

      if (disabled) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", function () {
          selectedDate = key;
          selectedSlot = null;
          renderCalendar();
          renderSlots();
        });
      }
      grid.appendChild(btn);
    }
  }

  function renderSlots() {
    const wrap = $("#slotsWrap");
    if (!selectedDate) { wrap.style.display = "none"; return; }
    wrap.style.display = "";
    $("#slotsTitle").textContent = "Masa tersedia — " + fmtDateMY(selectedDate);
    const grid = $("#slotGrid");
    grid.innerHTML = "";
    const taken = bookedSlots[selectedDate] || [];
    CONFIG.timeSlots.forEach(function (slot) {
      const btn = document.createElement("button");
      btn.className = "slot";
      btn.textContent = slot;
      btn.type = "button";
      btn.disabled = taken.indexOf(slot) !== -1;
      if (slot === selectedSlot) btn.classList.add("selected");
      if (!btn.disabled) {
        btn.addEventListener("click", function () {
          selectedSlot = slot;
          renderSlots();
        });
      }
      grid.appendChild(btn);
    });
    updateNext2();
  }

  function updateNext2() {
    const btn = $("#btnNext2");
    btn.disabled = !selectedDate || !selectedSlot;
  }

  /* ---------- Langkah 3: ringkasan bayaran ---------- */
  function fillPaySummary() {
    $("#payDate").textContent = fmtDateMY(selectedDate);
    $("#payTime").textContent = selectedSlot + " (45 minit)";
    $("#payName").textContent = $("#fName").value.trim();
  }

  function validateStep3() {
    if (!$("#fTerms").checked) {
      toast("Sila sahkan pengesahan dengan menandakan kotak persetujuan.", "error");
      return false;
    }
    return true;
  }

  /* ---------- Hantar tempahan ---------- */
  async function submitBooking() {
    if (!validateStep3()) return;

    const booking = {
      ref: genRef(),
      date: selectedDate,
      time: selectedSlot,
      name: $("#fName").value.trim(),
      ic: $("#fIc").value.trim(),
      phone: $("#fPhone").value.trim(),
      email: $("#fEmail").value.trim(),
      category: $("#fCategory").value,
      description: $("#fDesc").value.trim(),
      amount: CONFIG.fee,
      status: "PENDING",
      created: new Date().toISOString()
    };

    const btn = $("#btnSubmit");
    btn.disabled = true;
    btn.classList.add("loading");

    try {
      if (!backendReady) {
        lastBooking = booking;
        finishBooking(booking);
        toast("Pratonton: backend belum disambung. Tempahan disimpan setempat sahaja.", "error");
        return;
      }
      const res = await apiCall("createBooking", booking);
      if (res && res.ok && res.ref) {
        booking.ref = res.ref;
        lastBooking = booking;
        finishBooking(booking);
      } else {
        throw new Error("Gagal mencipta tempahan");
      }
    } catch (e) {
      let msg = "Ralat semasa menghantar tempahan. Sila cuba lagi.";
      if (e.message === "SLOT_TAKEN") {
        msg = "Maaf, slot ini baru sahaja ditempah oleh orang lain. Sila pilih slot lain.";
        loadAvailability().then(function () {
          if (selectedSlot) {
            bookedSlots[selectedDate] = (bookedSlots[selectedDate] || []).concat(selectedSlot);
            selectedSlot = null;
            renderSlots();
          }
        });
      } else if (e.message === "DUPLICATE") {
        msg = "Nombor pengenalan ini telah membuat tempahan untuk tarikh yang sama. Sila semak status tempahan anda.";
      } else if (e.message === "BACKEND_NOT_CONFIGURED") {
        msg = "Sistem belum dikonfigurasikan sepenuhnya. Hubungi pentadbir.";
      }
      toast(msg, "error");
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
    }
  }

  function finishBooking(booking) {
    $("#finalRef").textContent = booking.ref;
    $("#btnReceipt").href = "receipt.html?ref=" + encodeURIComponent(booking.ref);
    try {
      localStorage.setItem(CONFIG.storage.booking, JSON.stringify(booking));
    } catch (e) { /* ignore */ }
    goStep(4);
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    $("#btnNext1").addEventListener("click", validateStep1);
    $("#btnBack1").addEventListener("click", function () { goStep(1); });
    $("#btnBack2").addEventListener("click", function () { goStep(2); });
    $("#btnNext2").addEventListener("click", function () { if (selectedDate && selectedSlot) goStep(3); });
    $("#btnSubmit").addEventListener("click", submitBooking);

    $("#calPrev").addEventListener("click", function () {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      renderCalendar();
    });
    $("#calNext").addEventListener("click", function () {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    });

    loadAvailability();
  });
})();
