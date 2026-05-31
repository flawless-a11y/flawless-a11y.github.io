/* =========================================================
   Prashant Chauhan — Portfolio interactions (v2 · cinematic)
   Vanilla JS · no dependencies
   ========================================================= */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine   = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  $("#year") && ($("#year").textContent = new Date().getFullYear());

  /* split preloader monogram into letters */
  const mono = $("#preMono");
  if (mono) mono.innerHTML = [...mono.textContent].map(c => `<span>${c}</span>`).join("");

  /* ---------- stagger indices ---------- */
  $$(".telemetry, .cap-grid, .focus-list").forEach(g => $$(".reveal", g).forEach((el, i) => el.style.setProperty("--i", i)));
  $$(".hero [data-reveal]").forEach((el, i) => el.style.setProperty("--i", i));

  /* ---------- split hero title into chars ---------- */
  function splitChars() {
    let ci = 0;
    $$(".hero-title .split").forEach(node => {
      const text = node.textContent;
      node.textContent = "";
      [...text].forEach(ch => {
        const s = document.createElement("span");
        s.className = "char"; s.textContent = ch;
        s.style.setProperty("--ci", ci++);
        node.appendChild(s);
      });
    });
    // make the (non-clipped) line the reveal trigger
    $$(".hero-title .line").forEach(l => l.setAttribute("data-reveal", ""));
  }

  /* =========================================================
     PRELOADER
     ========================================================= */
  const pre = $("#preloader");
  const boot = () => { document.body.classList.add("loaded"); splitChars(); revealObserver(); counterObserver(); gaugeObserver(); scrambleObserver(); };
  if (pre && !reduce) {
    const countEl = $("#preCount"), fill = $("#preLineFill");
    let n = 0;
    const tick = () => {
      n += Math.max(1, Math.round((100 - n) * 0.08)); if (n >= 100) n = 100;
      countEl && (countEl.textContent = String(n).padStart(2, "0"));
      fill && (fill.style.width = n + "%");
      if (n < 100) setTimeout(tick, 26);
      else setTimeout(() => { pre.classList.add("done"); setTimeout(boot, 680); }, 340);
    };
    setTimeout(tick, 320);
  } else { if (pre) pre.style.display = "none"; splitChars(); boot(); }

  /* =========================================================
     CURSOR + AURA
     ========================================================= */
  if (fine && !reduce) {
    const cur = $("#cursor"), dot = $("#cursorDot"), aura = $("#cursorAura");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, ax = mx, ay = my;
    addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
      if (aura) aura.style.opacity = "1";
    });
    (function render() {
      cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2);
      ax = lerp(ax, mx, 0.08); ay = lerp(ay, my, 0.08);
      if (cur) { cur.style.left = cx + "px"; cur.style.top = cy + "px"; }
      if (aura) { aura.style.left = ax + "px"; aura.style.top = ay + "px"; }
      requestAnimationFrame(render);
    })();
    const set = (cls, on) => cur && cur.classList.toggle(cls, on);
    $$("[data-cursor='hover']").forEach(el => { el.addEventListener("mouseenter", () => set("is-hover", true)); el.addEventListener("mouseleave", () => set("is-hover", false)); });
    $$("[data-cursor='view']").forEach(el => { el.addEventListener("mouseenter", () => set("is-view", true)); el.addEventListener("mouseleave", () => set("is-view", false)); });
  }

  /* =========================================================
     SCROLL ENGINE (rAF-batched)
     ========================================================= */
  const nav = $("#nav"), bar = $("#progressBar"), tlFill = $("#tlFill"), timeline = $(".timeline");
  const parallaxEls = $$("[data-parallax]");
  const railLinks = $$(".rail a");
  const sections = $$("main section[id]");
  const marquee = $("#marqueeTrack");
  const workPin = $("#workPin"), workTrack = $("#workTrack"), workProg = $("#workProg");
  const accents = {
    hero:["rgba(47,93,255,.16)","72%"], performance:["rgba(47,93,255,.14)","30%"],
    engineer:["rgba(201,167,105,.10)","82%"], work:["rgba(47,93,255,.18)","50%"],
    trajectory:["rgba(110,180,205,.10)","22%"], capabilities:["rgba(201,167,105,.10)","70%"],
    contact:["rgba(47,93,255,.20)","50%"],
  };
  let lastY = scrollY, vel = 0, marqOffset = 0, current = "", ticking = false;

  function frame() {
    const y = scrollY;
    vel = y - lastY; lastY = y;

    // progress + nav
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    if (nav) nav.classList.toggle("scrolled", y > 60);

    // active section + accent
    const mid = y + innerHeight / 2;
    let active = current;
    sections.forEach(s => { if (s.offsetTop <= mid && s.offsetTop + s.offsetHeight > mid) active = s.id; });
    if (active !== current) {
      current = active;
      railLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
      const ac = accents[current];
      if (ac) { document.documentElement.style.setProperty("--accent", ac[0]); document.documentElement.style.setProperty("--ax", ac[1]); }
    }

    // parallax
    if (!reduce) parallaxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translateY(${(-c * (parseFloat(el.dataset.parallax) || .1)).toFixed(1)}px)`;
    });

    // timeline fill
    if (tlFill && timeline) {
      const r = timeline.getBoundingClientRect();
      tlFill.style.height = clamp((innerHeight * .5 - r.top) / r.height, 0, 1) * 100 + "%";
    }

    // marquee velocity (skew + drift)
    if (marquee && !reduce) {
      marqOffset += vel * 0.35;
      marquee.style.transform = `translateX(${(-marqOffset % (innerWidth)) }px) skewX(${clamp(vel * .2, -8, 8)}deg)`;
    }

    // horizontal pinned gallery
    if (workPin && workTrack && !reduce && innerWidth > 900) {
      const r = workPin.getBoundingClientRect(), h = workPin.offsetHeight - innerHeight;
      const p = clamp(-r.top / h, 0, 1);
      const dist = Math.max(0, workTrack.scrollWidth - innerWidth + (innerWidth * 0.06));
      workTrack.style.transform = `translateX(${-(p * dist).toFixed(1)}px)`;
      if (workProg) workProg.style.width = (6 + p * 94) + "%";
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(frame); ticking = true; } }, { passive: true });
  addEventListener("resize", () => requestAnimationFrame(frame));
  requestAnimationFrame(frame);

  /* mobile menu */
  const burger = $("#burger");
  if (burger && nav) {
    burger.addEventListener("click", () => nav.classList.toggle("menu-open"));
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => nav.classList.remove("menu-open")));
  }

  /* =========================================================
     REVEAL (re-fires on enter AND exit)
     ========================================================= */
  function revealObserver() {
    const items = $$("[data-reveal]");
    if (reduce) { items.forEach(el => el.classList.add("in-view")); return; }
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("in-view", e.isIntersecting)),
      { threshold: 0.16, rootMargin: "0px 0px -7% 0px" });
    items.forEach(el => io.observe(el));
  }

  /* =========================================================
     COUNTERS (with slight overshoot — a "rev")
     ========================================================= */
  function animateCounter(el) {
    const to = parseFloat(el.dataset.to || "0"), dec = parseInt(el.dataset.dec || "0", 10), suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
    const dur = 1600, start = performance.now();
    (function step(now) {
      const p = clamp((now - start) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const over = p < .85 ? e * 1.04 : e; // tiny overshoot then settle
      el.textContent = (Math.min(to * over, to) ).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = to.toFixed(dec) + suf;
    })(start);
  }
  function counterObserver() {
    const cs = $$(".counter"); if (!cs.length) return;
    if (reduce) { cs.forEach(animateCounter); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) animateCounter(e.target);
      else { const d = parseInt(e.target.dataset.dec || "0", 10); e.target.textContent = (0).toFixed(d); }
    }), { threshold: 0.6 });
    cs.forEach(c => io.observe(c));
  }

  /* =========================================================
     GAUGE (revs when in view)
     ========================================================= */
  function gaugeObserver() {
    const dyno = $(".dyno"), svg = $("#gauge"), ticks = $("#gaugeTicks");
    if (!dyno) return;
    // inject gradient + ticks
    try {
      const NS = "http://www.w3.org/2000/svg";
      if (svg && !svg.querySelector("defs")) {
        const defs = document.createElementNS(NS, "defs");
        const g = document.createElementNS(NS, "linearGradient");
        g.id = "gaugeGrad"; g.setAttribute("x1", "0"); g.setAttribute("x2", "1");
        [["0", "#2F5DFF"], ["0.7", "#83A9FF"], ["1", "#C9A769"]].forEach(([o, c]) => {
          const st = document.createElementNS(NS, "stop"); st.setAttribute("offset", o); st.setAttribute("stop-color", c); g.appendChild(st);
        });
        defs.appendChild(g); svg.insertBefore(defs, svg.firstChild);
      }
      if (ticks && !ticks.childNodes.length) {
        for (let i = 0; i <= 10; i++) {
          const ang = Math.PI + (i / 10) * Math.PI; // 180°→360°
          const cx = 160, cy = 180;
          const x1 = cx + 132 * Math.cos(ang), y1 = cy + 132 * Math.sin(ang);
          const x2 = cx + 120 * Math.cos(ang), y2 = cy + 120 * Math.sin(ang);
          const ln = document.createElementNS(NS, "line");
          ln.setAttribute("x1", x1.toFixed(1)); ln.setAttribute("y1", y1.toFixed(1));
          ln.setAttribute("x2", x2.toFixed(1)); ln.setAttribute("y2", y2.toFixed(1));
          ticks.appendChild(ln);
        }
      }
    } catch (e) {}
    if (reduce) { dyno.classList.add("run"); return; }
    new IntersectionObserver(es => es.forEach(e => dyno.classList.toggle("run", e.isIntersecting)), { threshold: 0.4 })
      .observe(dyno);
  }

  /* =========================================================
     TEXT SCRAMBLE (short strings)
     ========================================================= */
  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>*#";
  function scramble(el, text, dur = 900) {
    if (reduce) { el.textContent = text; return; }
    const start = performance.now();
    (function step(now) {
      const p = clamp((now - start) / dur, 0, 1);
      const reveal = Math.floor(p * text.length);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        if (i < reveal || text[i] === " ") out += text[i];
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step); else el.textContent = text;
    })(start);
  }
  function scrambleObserver() {
    $$("[data-scramble]").forEach(el => {
      if (el.id === "rotator") return;
      if (el.textContent.trim().length > 30) return; // skip long copy
      const final = el.textContent;
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) scramble(el, final, 700); }), { threshold: .6 });
      io.observe(el);
    });
  }

  /* ---------- rotating tagline (scramble cycle) ---------- */
  const rot = $("#rotator");
  if (rot && !reduce) {
    const phrases = ["LLM observability at scale", "zero-downtime migrations", "payments & tax compliance", "reconciliation, done right"];
    let i = 0;
    setInterval(() => { i = (i + 1) % phrases.length; scramble(rot, phrases[i], 800); }, 3000);
  }

  /* =========================================================
     MAGNETIC + TILT
     ========================================================= */
  if (fine && !reduce) {
    $$(".magnetic").forEach(b => {
      b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      b.addEventListener("mouseleave", () => b.style.transform = "translate(0,0)");
    });
    $$(".build").forEach(c => {
      c.addEventListener("mousemove", e => { const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(1200px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`; });
      c.addEventListener("mouseleave", () => c.style.transform = "perspective(1200px) rotateX(0) rotateY(0)");
    });
    // hero mouse tilt
    const tilts = $$("[data-tilt]");
    tilts.forEach(t => t.style.transition = "transform .4s ease-out");
    const hero = $(".hero");
    if (hero) hero.addEventListener("mousemove", e => {
      const dx = (e.clientX / innerWidth - .5), dy = (e.clientY / innerHeight - .5);
      tilts.forEach(t => { const s = parseFloat(t.dataset.tilt) || 8; t.style.transform = `translate3d(${dx * s}px, ${dy * s}px, 0) rotateY(${dx * s * .25}deg) rotateX(${-dy * s * .25}deg)`; });
    });
    if (hero) hero.addEventListener("mouseleave", () => tilts.forEach(t => t.style.transform = "none"));
  }

  /* =========================================================
     HERO PARTICLE FIELD
     ========================================================= */
  const canvas = $("#heroCanvas");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, parts = [], raf = null, mouse = { x: -999, y: -999 };
    const COUNT = () => Math.min(110, Math.floor(innerWidth / 14));
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const seed = () => { parts = Array.from({ length: COUNT() }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 1.7 + .4 })); };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        const dmx = p.x - mouse.x, dmy = p.y - mouse.y, dm = Math.hypot(dmx, dmy);
        if (dm < 140) { p.x += (dmx / dm) * 1.0; p.y += (dmy / dm) * 1.0; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fillStyle = "rgba(131,169,255,.85)"; ctx.fill();
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
          if (d < 132) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(47,93,255,${(1 - d / 132) * .22})`; ctx.lineWidth = .6; ctx.stroke(); }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.addEventListener("mouseleave", () => { mouse.x = -999; mouse.y = -999; });
    addEventListener("resize", () => { resize(); seed(); });
    resize(); seed(); draw();
    const hero = $(".hero");
    if (hero) new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(draw);
      else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }), { threshold: 0 }).observe(hero);
  }
})();
