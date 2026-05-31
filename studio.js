/* Prashant Chauhan — Studio Edition (light) · vanilla JS */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  $("#yr") && ($("#yr").textContent = new Date().getFullYear());

  const boot = () => { document.body.classList.add("ready"); $(".hero") && $(".hero").classList.add("in"); reveal(); counters(); };

  /* loader */
  const loader = $("#loader");
  if (loader && !reduce) {
    const fill = $("#loaderFill"), pct = $("#loaderPct"); let n = 0;
    const t = () => {
      n += Math.max(1, Math.round((100 - n) * 0.09)); if (n >= 100) n = 100;
      fill && (fill.style.width = n + "%"); pct && (pct.textContent = n + "%");
      if (n < 100) setTimeout(t, 24); else setTimeout(() => { loader.classList.add("done"); setTimeout(boot, 480); }, 300);
    };
    setTimeout(t, 280);
  } else { if (loader) loader.style.display = "none"; boot(); }

  /* cursor */
  if (fine && !reduce) {
    const cur = $("#cur"), dot = $("#curDot"); let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; } });
    (function r() { cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2); if (cur) { cur.style.left = cx + "px"; cur.style.top = cy + "px"; } requestAnimationFrame(r); })();
    $$("[data-cur='hover']").forEach(el => { el.addEventListener("mouseenter", () => cur.classList.add("hover")); el.addEventListener("mouseleave", () => cur.classList.remove("hover")); });
    $$("[data-cur='open']").forEach(el => { el.addEventListener("mouseenter", () => cur.classList.add("open")); el.addEventListener("mouseleave", () => cur.classList.remove("open")); });
  }

  /* nav scrolled state */
  const nav = $("#nav");
  addEventListener("scroll", () => { if (nav) nav.classList.toggle("scrolled", scrollY > 40); }, { passive: true });

  /* reveal (replays in/out) */
  function reveal() {
    const items = $$("[data-rv]");
    if (reduce) { items.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
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
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) anim(e.target);
      else { const d = parseInt(e.target.dataset.dec || "0", 10); e.target.textContent = (0).toFixed(d); }
    }), { threshold: 0.6 });
    cs.forEach(c => io.observe(c));
  }

  /* magnetic */
  if (fine && !reduce) {
    $$(".magnetic").forEach(b => {
      b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`; });
      b.addEventListener("mouseleave", () => b.style.transform = "translate(0,0)");
    });
  }
})();
