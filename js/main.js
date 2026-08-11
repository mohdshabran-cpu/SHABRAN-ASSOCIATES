/* ============================================================
   SHABRAN ASSOCIATES — JS Utama (semua halaman)
   ============================================================ */

/* ---------- Utils ---------- */
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function esc(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function fmtMoney(n) {
  return "RM" + Number(n || 0).toFixed(2);
}

function fmtTime12(v) {
  if (!v) return "-";
  let s = String(v).trim();
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

function genRef() {
  const d = new Date();
  const p = function (x, l) { return String(x).padStart(l || 2, "0"); };
  return "SHA-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" +
    Math.random().toString(36).slice(2, 7).toUpperCase();
}

/* ---------- Toast ---------- */
function toast(msg, type) {
  let wrap = $(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = "toast " + (type || "");
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .3s"; }, 4200);
  setTimeout(function () { t.remove(); }, 4600);
}

/* ---------- Backend (Google Apps Script) ---------- */
async function apiCall(action, payload) {
  const url = CONFIG.scriptUrl;
  if (!url || url.indexOf("REPLACE_WITH_YOUR_URL") !== -1) {
    throw new Error("BACKEND_NOT_CONFIGURED");
  }
  const body = Object.assign({ action: action }, payload || {});
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("HTTP_" + res.status);
  let data;
  try { data = await res.json(); } catch (e) { throw new Error("INVALID_RESPONSE"); }
  if (data && data.ok === false) throw new Error(data.error || "UNKNOWN_ERROR");
  return data;
}

function isBackendReady() {
  return CONFIG.scriptUrl && CONFIG.scriptUrl.indexOf("REPLACE_WITH_YOUR_URL") === -1;
}

/* ---------- Custom images (upload admin: pusat di Drive + fallback setempat) ---------- */
function setImageSrc(attr, src) {
  const imgs = $all("[data-img=" + attr + "]");
  imgs.forEach(function (i) { i.onerror = null; i.src = src; i.style.display = ""; });
  if (attr === "photo2") {
    const mono = document.getElementById("photoMono2");
    if (mono) mono.style.display = "none";
  }
}

function applyLocal() {
  const qr = localStorage.getItem(CONFIG.storage.qr);
  if (qr) setImageSrc("qr", qr);
  const photo = localStorage.getItem(CONFIG.storage.photo);
  if (photo) setImageSrc("photo", photo);
  const photo2 = localStorage.getItem(CONFIG.storage.photo2);
  if (photo2) setImageSrc("photo2", photo2);
}

function applyRemote(photos) {
  if (!photos) return;
  if (photos.qr) setImageSrc("qr", photos.qr);
  if (photos.photo) setImageSrc("photo", photos.photo);
  if (photos.photo2) setImageSrc("photo2", photos.photo2);
}

function applyCustomImages() {
  try { applyLocal(); } catch (e) { /* ignore */ }
  if (!isBackendReady()) return;

  /* cache tempatan dahulu (offline) */
  try {
    const cached = JSON.parse(localStorage.getItem(CONFIG.storage.remote) || "null");
    if (cached) applyRemote(cached);
  } catch (e) { /* ignore */ }

  /* segar dari pelayan (Drive) — gambar sama di semua peranti */
  apiCall("getPhotos")
    .then(function (d) {
      if (!d || !d.ok || !d.photos) return;
      try { localStorage.setItem(CONFIG.storage.remote, JSON.stringify(d.photos)); } catch (e) { /* ignore */ }
      applyRemote(d.photos);
    })
    .catch(function () { /* pelayan tiada - kekal setempat */ });
}

/* ---------- Navbar ---------- */
function initNav() {
  const nav = $("#navbar");
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }
  if (nav) {
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 10);
    });
  }
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const els = $all(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("visible"); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
}

/* ---------- Footer year ---------- */
function initYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

/* ---------- Counter animasi ---------- */
function initCounters() {
  const els = $all("[data-count]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.textContent = el.dataset.count; });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const dur = 1600;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  els.forEach(function (el) { io.observe(el); });
}

/* ---------- Borang pertanyaan (hantar ke WhatsApp) ---------- */
function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let ok = true;
    const rules = [
      ["#cName", function (v) { return v.length >= 3; }],
      ["#cPhone", function (v) { return /^[0-9+\-\s]{9,15}$/.test(v); }],
      ["#cMsg", function (v) { return v.length >= 5; }]
    ];
    rules.forEach(function (r) {
      const el = $(r[0]);
      const good = r[1](el.value.trim());
      markInvalid(el, !good);
      if (!good) ok = false;
    });
    if (!ok) { toast("Sila lengkapkan borang dengan betul.", "error"); return; }

    const name = getVal("#cName");
    const phone = getVal("#cPhone");
    const email = getVal("#cEmail");
    const msg = getVal("#cMsg");

    const wa = "https://wa.me/" + CONFIG.whatsapp + "?text=" +
      "Assalamualaikum%2C%20saya%20" + encodeURIComponent(name) +
      ".%0A%0APertanyaan%20saya%3A%20" + encodeURIComponent(msg) +
      "%0A%0ATelefon%3A%20" + encodeURIComponent(phone) +
      (email ? "%0AEmail%3A%20" + encodeURIComponent(email) : "");

    window.open(wa, "_blank");
    toast("Terima kasih! Pertanyaan anda akan diteruskan ke WhatsApp kami.", "success");
    form.reset();
  });
}

/* ---------- Field helpers ---------- */
function markInvalid(el, bad) {
  const g = el.closest(".form-group");
  if (!g) return;
  g.classList.toggle("invalid", !!bad);
}

function getVal(sel) {
  const el = $(sel);
  return el ? el.value.trim() : "";
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initReveal();
  initYear();
  initCounters();
  initContactForm();
  applyCustomImages();
});
window.addEventListener("load", function () { applyCustomImages(); });
window.addEventListener("storage", function (e) {
  if (e.key === CONFIG.storage.qr || e.key === CONFIG.storage.photo || e.key === CONFIG.storage.photo2) {
    applyCustomImages();
  }
});
