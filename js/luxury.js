/* ============================================================
   SHABRAN ASSOCIATES — Efek Mewah (JavaScript)
   ------------------------------------------------------------
   Progressive enhancement: hanya aktif bila fail ini dimuat.
   Semua elemen sistem (tempahan, admin, upload) TIDAK disentuh.
   Menghormati "prefers-reduced-motion" pengguna.
   ============================================================ */
(function () {
  "use strict";

  if (window.__lux) return;
  window.__lux = true;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  document.documentElement.classList.add("lux");

  /* ---------- 1. Bar kemajuan emas (atas skrin) ---------- */
  var bar = document.createElement("div");
  bar.id = "luxProgress";
  document.body.appendChild(bar);

  function updateBar() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", updateBar, { passive: true });
  window.addEventListener("resize", updateBar);
  updateBar();

  /* ---------- 2. Debu emas terapung (bahagian gelap) ---------- */
  function makeDust() {
    var hosts = document.querySelectorAll(".hero, .cta-banner, .section-dark, .page-hero, .footer");
    if (!hosts.length) return;

    hosts.forEach(function (host) {
      var cv = document.createElement("canvas");
      cv.className = "lux-dust";
      host.appendChild(cv);
      var ctx = cv.getContext("2d");
      var parts = [];
      var W = 0, H = 0;

      function resize() {
        var r = host.getBoundingClientRect();
        W = cv.width = Math.max(1, Math.round(r.width * devicePixelRatio));
        H = cv.height = Math.max(1, Math.round(r.height * devicePixelRatio));
      }
      resize();
      window.addEventListener("resize", resize);

      var count = Math.min(46, Math.max(18, Math.round(W / 34)));
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: (Math.random() * 1.7 + 0.5) * devicePixelRatio,
          vy: (Math.random() * 0.24 + 0.06) * devicePixelRatio,
          ph: Math.random() * Math.PI * 2,
          amp: (Math.random() * 18 + 6) * devicePixelRatio,
          sp: (Math.random() * 0.015 + 0.004) * devicePixelRatio,
          a: Math.random() * 0.5 + 0.15
        });
      }

      var t = 0;
      function draw() {
        t += 1;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.y -= p.vy;
          if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
          var x = p.x + Math.sin(t * p.sp + p.ph) * p.amp;
          var alpha = p.a * (0.6 + 0.4 * Math.sin(t * 0.03 + p.ph));
          ctx.beginPath();
          ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(216,175,62," + alpha.toFixed(3) + ")";
          ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      }
      var raf = requestAnimationFrame(draw);
    });
  }
  if (!reduce) makeDust();

  /* ---------- 3. Kemunculan lancar (reveal + stagger) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var delay = parseInt(el.getAttribute("data-delay"), 10) || 0;
          el.style.setProperty("--r-delay", (delay * 130) + "ms");
          el.classList.add("visible");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 4. Kecondongan 3D pada gambar peguam (desktop) ---------- */
  var frame = document.querySelector(".portrait-frame");
  if (frame && fine && !reduce) {
    var wrap = frame.closest(".hero") || frame.parentElement;
    var glow = document.querySelector(".hero-glow");
    var maxTilt = 7;

    function tilt(e) {
      var r = wrap.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = "perspective(900px) rotateY(" + (px * maxTilt) + "deg) rotateX(" + (-py * maxTilt) + "deg)";
      if (glow) glow.style.transform = "translate(" + (px * 18) + "px," + (py * 18) + "px)";
    }
    function untilt() {
      frame.style.transform = "";
      if (glow) glow.style.transform = "";
    }
    wrap.addEventListener("mousemove", tilt, { passive: true });
    wrap.addEventListener("mouseleave", untilt);
  }

  /* ---------- 5. Senarai halaman utama sudah siap. ---------- */
})();