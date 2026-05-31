/* =========================================================
   Prashant Chauhan — Portfolio interactions
   Vanilla JS · no dependencies
   ========================================================= */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine   = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- footer year ---------- */
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- stagger indices ---------- */
  $$(".telemetry, .builds, .cap-grid, .focus-list").forEach(group => {
    $$(".reveal", group).forEach((el, i) => el.style.setProperty("--i", i));
  });
  $$(".hero [data-reveal]").forEach((el, i) => el.style.setProperty("--i", i));

  /* =========================================================
     PRELOADER
     ========================================================= */
  const pre = $("#preloader");
  const initAfterLoad = () => {
    document.body.classList.add("loaded");
    revealObserver();      // start reveals only after the curtain lifts
    counterObserver();
  };
  if (pre && !reduce) {
    const countEl = $("#preCount"), fill = $("#preLineFill");
    let n = 0;
    const tick = () => {
      n += Math.max(1, Math.round((100 - n) * 0.08));
      if (n >= 100) n = 100;
      if (countEl) countEl.textContent = String(n).padStart(2, "0");
      if (fill) fill.style.width = n + "%";
      if (n < 100) setTimeout(tick, 28);
      else setTimeout(() => { pre.classList.add("done"); setTimeout(initAfterLoad, 700); }, 360);
    };
    setTimeout(tick, 360);
  } else {
    if (pre) pre.style.display = "none";
    initAfterLoad();
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  if (fine && !reduce) {
    const cur = $("#cursor"), dot = $("#cursorDot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
    });
    const render = () => {
      cx = lerp(cx, mx, 0.18); cy = lerp(cy, my, 0.18);
      if (cur) { cur.style.left = cx + "px"; cur.style.top = cy + "px"; }
      requestAnimationFrame(render);
    };
    render();
    const setState = (cls, on) => cur && cur.classList.toggle(cls, on);
    $$("[data-cursor='hover']").forEach(el => {
      el.addEventListener("mouseenter", () => setState("is-hover", true));
      el.addEventListener("mouseleave", () => setState("is-hover", false));
    });
    $$("[data-cursor='view']").forEach(el => {
      el.addEventListener("mouseenter", () => setState("is-view", true));
      el.addEventListener("mouseleave", () => setState("is-view", false));
    });
  }

  /* =========================================================
     NAV + SCROLL PROGRESS
     ========================================================= */
  const nav = $("#nav"), bar = $("#progressBar");
  const onScrollUI = () => {
    const y = scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 60);
    if (bar) {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  };
  addEventListener("scroll", onScrollUI, { passive: true });
  onScrollUI();

  /* mobile menu */
  const burger = $("#burger");
  if (burger && nav) {
    burger.addEventListener("click", () => nav.classList.toggle("menu-open"));
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => nav.classList.remove("menu-open")));
  }

  /* =========================================================
     REVEAL ON SCROLL  (re-fires on enter AND exit → replays)
     ========================================================= */
  function revealObserver() {
    const items = $$("[data-reveal]");
    if (reduce) { items.forEach(el => el.classList.add("in-view")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.target.classList.toggle("in-view", e.isIntersecting));
    }, { threshold: 0.16, rootMargin: "0px 0px -7% 0px" });
    items.forEach(el => io.observe(el));
  }

  /* =========================================================
     ANIMATED COUNTERS
     ========================================================= */
  function animateCounter(el) {
    const to = parseFloat(el.dataset.to || "0");
    const dec = parseInt(el.dataset.dec || "0", 10);
    const suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
    const dur = 1500; const start = performance.now();
    const step = (now) => {
      const p = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = to.toFixed(dec) + suf;
    };
    requestAnimationFrame(step);
  }
  function counterObserver() {
    const counters = $$(".counter");
    if (!counters.length) return;
    if (reduce) { counters.forEach(animateCounter); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) animateCounter(e.target);
        else { const d = parseInt(e.target.dataset.dec || "0", 10); e.target.textContent = (0).toFixed(d); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => io.observe(c));
  }

  /* =========================================================
     PARALLAX + TIMELINE FILL
     ========================================================= */
  const parallaxEls = $$("[data-parallax]");
  const tlFill = $("#tlFill");
  const timeline = $(".timeline");
  let ticking = false;
  const onScrollFX = () => {
    if (reduce) return;
    const y = scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - innerHeight / 2;
      el.style.transform = `translateY(${(-center * speed).toFixed(1)}px)`;
    });
    if (tlFill && timeline) {
      const r = timeline.getBoundingClientRect();
      const prog = clamp((innerHeight * 0.5 - r.top) / r.height, 0, 1);
      tlFill.style.height = (prog * 100) + "%";
    }
  };
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(() => { onScrollFX(); ticking = false; }); ticking = true; }
  }, { passive: true });
  onScrollFX();

  /* =========================================================
     ROTATING TAGLINE
     ========================================================= */
  const rot = $("#rotator");
  if (rot && !reduce) {
    const phrases = [
      "LLM observability at scale",
      "payments &amp; tax-compliance flows",
      "zero-downtime migrations",
      "reconciliation, done right",
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % phrases.length;
      rot.style.opacity = "0";
      rot.style.transform = "translateY(6px)";
      rot.style.transition = "opacity .4s ease, transform .4s ease";
      setTimeout(() => {
        rot.innerHTML = phrases[i];
        rot.style.opacity = "1";
        rot.style.transform = "none";
      }, 420);
    }, 2800);
  }

  /* =========================================================
     MAGNETIC BUTTONS
     ========================================================= */
  if (fine && !reduce) {
    $$(".magnetic").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = "translate(0,0)"; });
    });

    /* card 3D tilt */
    $$(".build").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1200px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateZ(0)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = "perspective(1200px) rotateX(0) rotateY(0)"; });
    });
  }

  /* =========================================================
     HERO PARTICLE NETWORK (canvas)
     ========================================================= */
  const canvas = $("#heroCanvas");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles = [], raf, mouse = { x: -999, y: -999 };
    const COUNT = () => Math.min(90, Math.floor(innerWidth / 16));
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      particles = Array.from({ length: COUNT() }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // mouse repulse
        const dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.hypot(dxm, dym);
        if (dm < 130) { p.x += (dxm / dm) * 0.8; p.y += (dym / dm) * 0.8; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(131,169,255,0.8)";
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(47,93,255,${(1 - d / 130) * 0.22})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    const hero = $(".hero");
    canvas.addEventListener("mousemove", e => {
      const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener("mouseleave", () => { mouse.x = -999; mouse.y = -999; });
    addEventListener("resize", () => { resize(); seed(); });
    resize(); seed(); draw();
    // pause when hero off-screen
    new IntersectionObserver((en) => {
      en.forEach(e => {
        if (e.isIntersecting && !raf) { raf = requestAnimationFrame(draw); }
        else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 }).observe(hero);
  }
})();
