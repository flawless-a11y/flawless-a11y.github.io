/* Prashant Chauhan — Studio Edition v2 (dark · crimson) · vanilla JS */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  $("#yr") && ($("#yr").textContent = new Date().getFullYear());

  let fieldCtl = null;
  const boot = () => { document.body.classList.add("ready"); $(".hero") && $(".hero").classList.add("in"); reveal(); counters(); if (!reduce) fieldCtl = field(); };

  /* loader */
  const loader = $("#loader");
  if (loader && !reduce) {
    const fill = $("#loaderFill"), pct = $("#loaderPct"); let n = 0;
    const t = () => {
      n += Math.max(1, Math.round((100 - n) * 0.09)); if (n >= 100) n = 100;
      fill && (fill.style.width = n + "%"); pct && (pct.textContent = n + "%");
      if (n < 100) setTimeout(t, 22); else setTimeout(() => { loader.classList.add("done"); setTimeout(boot, 460); }, 280);
    };
    setTimeout(t, 260);
  } else { if (loader) loader.style.display = "none"; boot(); }

  /* cursor */
  if (fine && !reduce) {
    const cur = $("#cur"), dot = $("#curDot"); let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; } });
    (function r() { cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2); if (cur) { cur.style.left = cx + "px"; cur.style.top = cy + "px"; } requestAnimationFrame(r); })();
    $$("[data-cur='hover']").forEach(el => { el.addEventListener("mouseenter", () => cur.classList.add("hover")); el.addEventListener("mouseleave", () => cur.classList.remove("hover")); });
    $$("[data-cur='open']").forEach(el => { el.addEventListener("mouseenter", () => cur.classList.add("open")); el.addEventListener("mouseleave", () => cur.classList.remove("open")); });
  }

  /* nav */
  const nav = $("#nav");
  addEventListener("scroll", () => { if (nav) nav.classList.toggle("scrolled", scrollY > 40); }, { passive: true });

  /* settings panel + toggles */
  const gear = $("#gear"), panel = $("#panel");
  gear && gear.addEventListener("click", e => { e.stopPropagation(); panel.classList.toggle("open"); });
  document.addEventListener("click", e => { if (panel && panel.classList.contains("open") && !panel.contains(e.target) && e.target !== gear && !gear.contains(e.target)) panel.classList.remove("open"); });
  const tTheme = $("#tTheme"), tMotion = $("#tMotion"), tFull = $("#tFull");
  tTheme && tTheme.addEventListener("click", () => { tTheme.classList.toggle("on"); document.body.classList.toggle("light"); });
  tMotion && tMotion.addEventListener("click", () => {
    const on = tMotion.classList.toggle("on");
    document.body.classList.toggle("no-motion", !on);
    if (fieldCtl) on ? fieldCtl.play() : fieldCtl.pause();
  });
  tFull && tFull.addEventListener("click", () => {
    tFull.classList.toggle("on");
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
    else document.exitFullscreen && document.exitFullscreen();
  });

  /* reveal */
  function reveal() {
    const items = $$("[data-rv]");
    if (reduce) { items.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("in", e.isIntersecting)), { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    items.forEach(e => io.observe(e));
  }

  /* counters */
  function counters() {
    const cs = $$(".count"); if (!cs.length) return;
    const anim = el => {
      const to = parseFloat(el.dataset.to || "0"), dec = parseInt(el.dataset.dec || "0", 10), suf = el.dataset.suf || "";
      if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
      const dur = 1500, st = performance.now();
      (function s(now) { const p = clamp((now - st) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(s); else el.textContent = to.toFixed(dec) + suf; })(st);
    };
    if (reduce) { cs.forEach(anim); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) anim(e.target); else { const d = parseInt(e.target.dataset.dec || "0", 10); e.target.textContent = (0).toFixed(d); } }), { threshold: 0.6 });
    cs.forEach(c => io.observe(c));
  }

  /* magnetic */
  if (fine && !reduce) {
    $$(".magnetic").forEach(b => {
      b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`; });
      b.addEventListener("mouseleave", () => b.style.transform = "translate(0,0)");
    });
  }

  /* =========================================================
     CRIMSON FIELD  (lightweight 2D-canvas "fur/grass")
     ========================================================= */
  function field() {
    const cv = $("#field"); if (!cv) return null;
    const ctx = cv.getContext("2d");
    let w, h, dpr, blades = [], t = 0, raf = null, running = false;
    const mouse = { x: -999, y: -999 };
    function seed() {
      const n = Math.min(1700, Math.floor(w * 1.05));
      blades = [];
      for (let i = 0; i < n; i++) {
        const r = Math.pow(Math.random(), 0.6);        // bias toward bottom
        const by = h * (0.33 + 0.72 * r);
        const d = clamp((by - h * 0.33) / (h * 0.72), 0, 1); // 0 far/top → 1 near/bottom
        blades.push({ x: Math.random() * w, by, len: (16 + d * 78) * (0.7 + Math.random() * 0.6), amp: 5 + d * 22, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 0.7, d, lw: 0.6 + d * 1.3 });
      }
      blades.sort((a, b) => a.by - b.by);              // far first
    }
    function resize() { dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); seed(); }
    function draw() {
      t += 0.012; ctx.clearRect(0, 0, w, h);
      for (const b of blades) {
        const sway = Math.sin(t * b.sp + b.ph) * b.amp * (0.5 + b.d);
        const tx = b.x + sway, ty = b.by - b.len;
        let mb = 0; const dx = b.x - mouse.x, dy = b.by - mouse.y, dm = Math.hypot(dx, dy);
        if (dm < 220) mb = (1 - dm / 220) * 0.55;
        const L = 12 + b.d * 30 + mb * 42;
        ctx.strokeStyle = `hsl(348 ${68 + b.d * 16}% ${L}%)`;
        ctx.lineWidth = b.lw; ctx.globalAlpha = 0.5 + b.d * 0.5;
        ctx.beginPath(); ctx.moveTo(b.x, b.by);
        ctx.quadraticCurveTo((b.x + tx) / 2, b.by - b.len * 0.6, tx, ty); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    const play = () => { if (!running) { running = true; raf = requestAnimationFrame(draw); } };
    const pause = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };
    addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => { document.hidden ? pause() : (document.body.classList.contains("no-motion") ? null : play()); });
    resize(); play();
    return { play, pause };
  }
})();
