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
  const boot = () => { document.body.classList.add("ready"); $(".hero") && $(".hero").classList.add("in"); reveal(); counters(); if (!reduce) fieldCtl = startField(); };

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
  function startField() {
    const cv = $("#field"); if (!cv) return null;
    if (window.THREE) { try { return grassWebGL(cv); } catch (e) { console.warn("grass webgl failed, using 2D", e); } }
    return field(cv);
  }

  /* ---- WebGL instanced grass (three.js) ---- */
  function grassWebGL(cv) {
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    const scene = new T.Scene();
    scene.fog = new T.Fog(0x0a0a0b, 10, 36);
    const camera = new T.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 140);
    camera.position.set(0, 1.7, 9);
    const look = new T.Vector3(0, 0.5, -12);

    const blade = new T.PlaneGeometry(0.07, 1, 1, 5); blade.translate(0, 0.5, 0);
    const uniforms = {
      uTime: { value: 0 }, uBase: { value: new T.Color(0x2a0109) }, uTip: { value: new T.Color(0xdb1533) },
      uLight: { value: new T.Vector3(1.5, 0, -8) }, uFog: { value: new T.Color(0x0a0a0b) }, uFogDensity: { value: 0.05 },
    };
    const mat = new T.ShaderMaterial({
      uniforms, side: T.DoubleSide, fog: false,
      vertexShader: `
        uniform float uTime; varying float vH; varying vec3 vW;
        void main(){
          vH = uv.y; vec3 pos = position;
          vec4 io = instanceMatrix * vec4(0.0,0.0,0.0,1.0);
          float w = sin(uTime*1.4 + io.x*0.5 + io.z*0.6) + 0.5*sin(uTime*2.1 + io.z*1.1);
          float bend = pow(uv.y, 2.0);
          pos.x += w * bend * 0.5;
          pos.z += cos(uTime*1.1 + io.x*0.4) * bend * 0.22;
          vec4 world = modelMatrix * instanceMatrix * vec4(pos,1.0);
          vW = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }`,
      fragmentShader: `
        precision highp float; varying float vH; varying vec3 vW;
        uniform vec3 uBase, uTip, uLight, uFog; uniform float uFogDensity;
        void main(){
          vec3 col = mix(uBase, uTip, vH);
          float d = distance(vW.xz, uLight.xz);
          float lit = smoothstep(18.0, 0.0, d);
          col *= 0.32 + lit*1.6;
          col *= 0.4 + 0.6*vH;
          float fd = length(vW - cameraPosition);
          float f = 1.0 - exp(-uFogDensity*uFogDensity*fd*fd);
          col = mix(col, uFog, clamp(f,0.0,1.0));
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const COUNT = Math.min(42000, Math.floor(innerWidth * innerHeight / 24));
    const mesh = new T.InstancedMesh(blade, mat, COUNT);
    const d = new T.Object3D();
    for (let i = 0; i < COUNT; i++) {
      d.position.set((Math.random() - 0.5) * 46, 0, 6 - Math.random() * 44);
      d.rotation.y = Math.random() * Math.PI;
      d.scale.set(0.8 + Math.random() * 0.6, 0.7 + Math.random() * 1.4, 1);
      d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
    }
    scene.add(mesh);

    const cube = new T.Mesh(new T.BoxGeometry(1.25, 1.25, 1.25), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05 }));
    cube.position.set(0, 2, -4.5); scene.add(cube);
    const key = new T.PointLight(0xffffff, 1.3, 50); key.position.set(4, 7, 3); scene.add(key);
    scene.add(new T.AmbientLight(0x4a1018, 0.9));

    let raf = null, running = false, t0 = performance.now();
    const m = { x: 0, y: 0 };
    function frame() {
      const t = (performance.now() - t0) / 1000;
      uniforms.uTime.value = t;
      camera.position.x = lerp(camera.position.x, m.x * 1.6, 0.04);
      camera.position.y = lerp(camera.position.y, 1.7 + m.y * 0.5, 0.04);
      camera.lookAt(look);
      cube.rotation.set(t * 0.3, t * 0.42, 0); cube.position.y = 2 + Math.sin(t * 0.8) * 0.28;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    const play = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
    const pause = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };
    function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
    addEventListener("resize", resize);
    addEventListener("mousemove", e => { m.x = (e.clientX / innerWidth - 0.5) * 2; m.y = (e.clientY / innerHeight - 0.5) * -2; });
    document.addEventListener("visibilitychange", () => { document.hidden ? pause() : (document.body.classList.contains("no-motion") ? null : play()); });
    resize(); play();
    return { play, pause };
  }

  function field(cv) {
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
