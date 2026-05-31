/* Prashant Chauhan — FUSION edition · vanilla JS + three.js */
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
  const boot = () => { document.body.classList.add("ready"); $(".hero") && $(".hero").classList.add("in"); reveal(); counters(); gaugeFx(); duel(); fieldCtl = startField(); };

  /* loader */
  const loader = $("#loader");
  if (loader && !reduce) {
    const fill = $("#loaderFill"), pct = $("#loaderPct"); let n = 0;
    const t = () => { n += Math.max(1, Math.round((100 - n) * 0.09)); if (n >= 100) n = 100; fill && (fill.style.width = n + "%"); pct && (pct.textContent = n + "%"); if (n < 100) setTimeout(t, 22); else setTimeout(() => { loader.classList.add("done"); setTimeout(boot, 440); }, 280); };
    setTimeout(t, 240);
  } else { if (loader) loader.style.display = "none"; boot(); }

  /* cursor */
  if (fine && !reduce) {
    const cur = $("#cur"), dot = $("#curDot"); let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; } });
    (function r() { cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2); if (cur) { cur.style.left = cx + "px"; cur.style.top = cy + "px"; } requestAnimationFrame(r); })();
    $$("[data-cur='hover']").forEach(el => { el.addEventListener("mouseenter", () => cur.classList.add("hover")); el.addEventListener("mouseleave", () => cur.classList.remove("hover")); });
  }

  /* settings */
  const gear = $("#gear"), panel = $("#panel");
  gear && gear.addEventListener("click", e => { e.stopPropagation(); panel.classList.toggle("open"); });
  document.addEventListener("click", e => { if (panel && panel.classList.contains("open") && !panel.contains(e.target) && !gear.contains(e.target)) panel.classList.remove("open"); });
  $("#tMotion") && $("#tMotion").addEventListener("click", () => { const on = $("#tMotion").classList.toggle("on"); document.body.classList.toggle("no-motion", !on); if (fieldCtl) on ? fieldCtl.play() : fieldCtl.pause(); });
  $("#tFull") && $("#tFull").addEventListener("click", () => { $("#tFull").classList.toggle("on"); if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); else document.exitFullscreen && document.exitFullscreen(); });

  /* scroll engine: nav + horizontal gallery */
  const nav = $("#nav"), workPin = $("#workPin"), workTrack = $("#workTrack"), workProg = $("#workProg");
  let ticking = false;
  function frame() {
    const y = scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 50);
    if (workPin && workTrack && !reduce && innerWidth > 900) {
      const r = workPin.getBoundingClientRect(), h = workPin.offsetHeight - innerHeight;
      const p = clamp(-r.top / h, 0, 1);
      const dist = Math.max(0, workTrack.scrollWidth - innerWidth + innerWidth * 0.06);
      workTrack.style.transform = `translateX(${-(p * dist).toFixed(1)}px)`;
      if (workProg) workProg.style.width = (6 + p * 94) + "%";
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(frame); ticking = true; } }, { passive: true });
  addEventListener("resize", () => requestAnimationFrame(frame));
  requestAnimationFrame(frame);

  /* reveal */
  function reveal() {
    const items = $$("[data-rv]");
    if (reduce) { items.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("in", e.isIntersecting)), { threshold: 0.16, rootMargin: "0px 0px -7% 0px" });
    items.forEach(e => io.observe(e));
  }

  /* counters */
  function counters() {
    const cs = $$(".count"); if (!cs.length) return;
    const anim = el => { const to = parseFloat(el.dataset.to || "0"), dec = parseInt(el.dataset.dec || "0", 10), suf = el.dataset.suf || ""; if (reduce) { el.textContent = to.toFixed(dec) + suf; return; } const dur = 1500, st = performance.now(); (function s(now) { const p = clamp((now - st) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(s); else el.textContent = to.toFixed(dec) + suf; })(st); };
    if (reduce) { cs.forEach(anim); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) anim(e.target); else { const d = parseInt(e.target.dataset.dec || "0", 10); e.target.textContent = (0).toFixed(d); } }), { threshold: 0.6 });
    cs.forEach(c => io.observe(c));
  }

  /* gauge */
  function gaugeFx() {
    const sec = $("#telemetry"), svg = $("#gauge"); if (!sec) return;
    try {
      const NS = "http://www.w3.org/2000/svg";
      if (svg && !svg.querySelector("defs")) {
        const defs = document.createElementNS(NS, "defs"), g = document.createElementNS(NS, "linearGradient");
        g.id = "gaugeGrad"; g.setAttribute("x1", "0"); g.setAttribute("x2", "1");
        [["0", "#2F5DFF"], ["0.55", "#83A9FF"], ["1", "#E0143C"]].forEach(([o, c]) => { const st = document.createElementNS(NS, "stop"); st.setAttribute("offset", o); st.setAttribute("stop-color", c); g.appendChild(st); });
        defs.appendChild(g); svg.insertBefore(defs, svg.firstChild);
      }
    } catch (e) {}
    if (reduce) { sec.classList.add("run"); return; }
    new IntersectionObserver(es => es.forEach(e => sec.classList.toggle("run", e.isIntersecting)), { threshold: 0.4 }).observe(sec);
  }

  /* two-sides interactive duel */
  function duel() {
    const stage = $("#duelStage"); if (!stage) return;
    const set = s => { stage.classList.toggle("hover-left", s === "left"); stage.classList.toggle("hover-right", s === "right"); };
    $$(".duel-zone", stage).forEach(z => {
      z.addEventListener("mouseenter", () => set(z.dataset.side));
      z.addEventListener("focus", () => set(z.dataset.side));
      z.addEventListener("click", e => { e.preventDefault(); set(z.dataset.side); });
    });
    stage.addEventListener("mouseleave", () => set(null));
  }

  /* magnetic */
  if (fine && !reduce) {
    $$(".magnetic").forEach(b => { b.addEventListener("mousemove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`; }); b.addEventListener("mouseleave", () => b.style.transform = "translate(0,0)"); });
  }

  /* =========================================================
     DUAL-TINT WEBGL GRASS (hero-scoped)
     ========================================================= */
  function startField() {
    const r = reduce ? null : rain();
    return { play: () => { r && r.play(); }, pause: () => { r && r.pause(); } };
  }

  /* binary "waterfall" rain over the hero (blue left, mint right) */
  function rain() {
    const cv = $("#rain"); if (!cv) return null;
    const ctx = cv.getContext("2d"); const host = cv.parentElement;
    let w, h, cols, drops, raf = null, running = false, fs = 14;
    const G = "01";
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fs = Math.max(12, Math.round(w / 120)); cols = Math.ceil(w / fs);
      drops = Array.from({ length: cols }, () => Math.random() * -h / fs);
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.font = fs + "px 'Space Mono', monospace";
      const trail = 16;
      for (let i = 0; i < cols; i++) {
        const x = i * fs, head = drops[i], blue = i < cols / 2;
        const c = blue ? "13,153,255" : "153,250,244";
        for (let k = 0; k < trail; k++) {
          const yy = (head - k) * fs; if (yy < 0 || yy > h) continue;
          const a = k === 0 ? 1 : (1 - k / trail) * 0.55;
          ctx.fillStyle = "rgba(" + c + "," + a + ")";
          ctx.fillText(G[(Math.random() * G.length) | 0], x, yy);
        }
        drops[i] += blue ? 0.5 : 0.58;
        if (head * fs > h + trail * fs) drops[i] = Math.random() * -16;
      }
      raf = requestAnimationFrame(draw);
    }
    const play = () => { if (!running) { running = true; raf = requestAnimationFrame(draw); } };
    const pause = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, w, h); };
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => { document.hidden ? pause() : (document.body.classList.contains("no-motion") ? null : play()); });
    resize(); play();
    return { play, pause };
  }
  function grass(cv) {
    const T = window.THREE, host = cv.parentElement;
    const W = () => host.clientWidth || innerWidth, H = () => host.clientHeight || innerHeight;
    const renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    const scene = new T.Scene(); scene.fog = new T.Fog(0x08090e, 10, 38);
    const camera = new T.PerspectiveCamera(50, W() / H(), 0.1, 140);
    camera.position.set(0, 1.7, 9); const look = new T.Vector3(0, 0.5, -12);
    const blade = new T.PlaneGeometry(0.07, 1, 1, 5); blade.translate(0, 0.5, 0);
    const uniforms = {
      uTime: { value: 0 }, uBlue: { value: new T.Color(0x2f5dff) }, uCrimson: { value: new T.Color(0xe0143c) },
      uLight: { value: new T.Vector3(0, 0, -8) }, uFog: { value: new T.Color(0x08090e) }, uFogD: { value: 0.05 },
    };
    const mat = new T.ShaderMaterial({
      uniforms, side: T.DoubleSide, fog: false,
      vertexShader: `uniform float uTime; varying float vH; varying vec3 vW;
        void main(){ vH=uv.y; vec3 pos=position; vec4 io=instanceMatrix*vec4(0.,0.,0.,1.);
          float w=sin(uTime*1.4+io.x*.5+io.z*.6)+.5*sin(uTime*2.1+io.z*1.1); float bend=pow(uv.y,2.);
          pos.x+=w*bend*.5; pos.z+=cos(uTime*1.1+io.x*.4)*bend*.22;
          vec4 world=modelMatrix*instanceMatrix*vec4(pos,1.); vW=world.xyz;
          gl_Position=projectionMatrix*viewMatrix*world; }`,
      fragmentShader: `precision highp float; varying float vH; varying vec3 vW;
        uniform vec3 uBlue,uCrimson,uLight,uFog; uniform float uFogD;
        void main(){ vec3 tint=mix(uBlue,uCrimson, smoothstep(-16.,16.,vW.x));
          float d=distance(vW.xz,uLight.xz); float lit=smoothstep(18.,0.,d);
          vec3 col=tint*(0.3+lit*1.5); col*=0.4+0.6*vH;
          float fd=length(vW-cameraPosition); float f=1.-exp(-uFogD*uFogD*fd*fd);
          col=mix(col,uFog,clamp(f,0.,1.)); gl_FragColor=vec4(col,1.); }`,
    });
    const COUNT = Math.min(40000, Math.floor(W() * H() / 22));
    const mesh = new T.InstancedMesh(blade, mat, COUNT); const d = new T.Object3D();
    for (let i = 0; i < COUNT; i++) { d.position.set((Math.random() - 0.5) * 46, 0, 6 - Math.random() * 44); d.rotation.y = Math.random() * Math.PI; d.scale.set(0.8 + Math.random() * 0.6, 0.7 + Math.random() * 1.4, 1); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); }
    scene.add(mesh);
    const cube = new T.Mesh(new T.BoxGeometry(1.25, 1.25, 1.25), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.06 }));
    cube.position.set(0, 2, -4.5); scene.add(cube);
    const key = new T.PointLight(0xffffff, 1.3, 50); key.position.set(4, 7, 3); scene.add(key); scene.add(new T.AmbientLight(0x3a2030, 0.9));
    let raf = null, running = false, t0 = performance.now(); const m = { x: 0, y: 0 };
    function frame2() {
      const t = (performance.now() - t0) / 1000; uniforms.uTime.value = t;
      camera.position.x = lerp(camera.position.x, m.x * 1.6, 0.04); camera.position.y = lerp(camera.position.y, 1.7 + m.y * 0.5, 0.04); camera.lookAt(look);
      cube.rotation.set(t * 0.3, t * 0.42, 0); cube.position.y = 2 + Math.sin(t * 0.8) * 0.28;
      renderer.render(scene, camera); raf = requestAnimationFrame(frame2);
    }
    const play = () => { if (!running) { running = true; raf = requestAnimationFrame(frame2); } };
    const pause = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };
    function resize() { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); }
    addEventListener("resize", resize);
    addEventListener("mousemove", e => { m.x = (e.clientX / innerWidth - 0.5) * 2; m.y = (e.clientY / innerHeight - 0.5) * -2; });
    document.addEventListener("visibilitychange", () => { document.hidden ? pause() : (document.body.classList.contains("no-motion") ? null : play()); });
    resize(); play();
    return { play, pause };
  }
})();
