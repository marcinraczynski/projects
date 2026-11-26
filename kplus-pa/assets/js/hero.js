/* K+ PA – hero: bryła z punktów i linii (three.js r128, plik lokalny).
   Pętla: plus → sieć → plus → kula → plus → fala. Paski tematów pokazują postęp, klik w temat przełącza bryłę.
   Na bazie projektu kplus-hero; kolory przestawione na granat K+ PA.
   Bez WebGL zostaje statyczny obraz bryły; przy prefers-reduced-motion bryła stoi i nie przełącza się sama. */
(function () {
  var visual = document.querySelector('.hero__visual');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.topics .topic'));
  if (!visual || !tabs.length) return;

  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = reduceMq.matches;
  var cur = 0, anim = false;

  function select(i, focus) {
    cur = i;
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      t.querySelector('.topic__bar i').style.transform = on && (reduce || !anim) ? 'scaleX(1)' : 'scaleX(0)';
    });
    if (focus) tabs[i].focus();
    /* Na telefonie lista tematów to poziomy slider: przewiń go do aktywnego (bez ruszania strony). */
    var list = tabs[i].parentNode;
    if (list.scrollWidth > list.clientWidth + 2) {
      list.scrollTo({ left: tabs[i].offsetLeft - list.firstElementChild.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  /* Klawiatura dla tablisty: strzałki, Home, End. */
  tabs.forEach(function (t, k) {
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, j = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (k + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (k - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j === null) return;
      e.preventDefault();
      tabs[j].click();
      tabs[j].focus();
    });
  });

  var canvas = document.createElement('canvas');
  var gl = null;
  try { gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'); } catch (e) { gl = null; }
  if (!window.THREE || !gl) {
    /* Fallback: statyczna bryła, klik zmienia tylko aktywny temat. */
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { select(k); }); });
    select(0);
    return;
  }

  var THREE = window.THREE;
  var R = Math.random, ga = Math.PI * (3 - Math.sqrt(5));
  function fib(n, r, c) {
    c = c || [0, 0, 0];
    var o = [];
    for (var i = 0; i < n; i++) {
      var y = 1 - i / (n - 1) * 2, rr = Math.sqrt(1 - y * y), a = ga * i;
      o.push([c[0] + Math.cos(a) * rr * r, c[1] + y * r, c[2] + Math.sin(a) * rr * r]);
    }
    return o;
  }

  /* ---------- bryły: p = punkty, y = akcent (0/1), th = dystans krawędzi, k = maks. krawędzi z punktu ---------- */
  function plusShape() {
    var p = [], y = [], L = .9, T = .3, D = .3, st = .15, e = 1e-6;
    for (var x = -L; x <= L + e; x += st) for (var yy = -L; yy <= L + e; yy += st) for (var z = -D; z <= D + e; z += st) {
      var v = Math.abs(x) <= T + e, h = Math.abs(yy) <= T + e;
      if (!(v || h)) continue;
      var surf = Math.abs(z) > D - e || Math.abs(x) > L - e || Math.abs(yy) > L - e || (v && !h && Math.abs(x) > T - e) || (h && !v && Math.abs(yy) > T - e);
      if (!surf) continue;
      p.push([x, yy, z]); y.push(0);
    }
    return { p: p, y: y, th: .16, k: 4 };
  }
  function sphereShell() { var p = fib(520, 1.02); return { p: p, y: p.map(function () { return 0; }), th: .2, k: 3 }; }
  function ripple() {
    var p = [], y = [];
    for (var r = .12; r <= 1.45; r += .11) {
      var n = Math.max(8, Math.round(r * 42));
      for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; p.push([Math.cos(a) * r, 0, Math.sin(a) * r]); y.push(r < .2 ? 1 : 0); }
    }
    return { p: p, y: y, th: .17, k: 3 };
  }
  /* Sieć interesariuszy: organizacja w centrum, kluczowi interesariusze wokół (koalicja = pierścień),
     dalsze otoczenie na zewnątrz, połączenia pokazują wzajemne zależności. */
  function network() {
    var p = [], y = [], nodes = [];
    var add = function (pos, r, n, acc) { nodes.push({ p: pos }); fib(n, r, pos).forEach(function (q) { p.push(q); y.push(acc ? 1 : 0); }); return nodes.length - 1; };
    var link = function (i, j) {
      var A = nodes[i].p, B = nodes[j].p, len = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]), m = Math.round(len / .09);
      for (var k = 2; k < m - 1; k++) { var u = k / m; p.push([A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u]); y.push(0); }
    };
    var hub = add([0, 0, 0], .17, 34, true);
    var prim = [], sec = [], i;
    for (i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2 + .3;
      prim.push(add([Math.cos(a) * .82, Math.sin(a) * .7, (i % 2 ? .38 : -.38)], .1, 18, i === 1 || i === 4));
    }
    for (i = 0; i < 6; i++) {
      [-.38, .38].forEach(function (off, j) {
        if (i % 3 === 2 && j === 1) return;
        var a = i / 6 * Math.PI * 2 + .3 + off, z = (i % 2 ? .38 : -.38) + (j ? .35 : -.35);
        sec.push({ from: prim[i], idx: add([Math.cos(a) * 1.3, Math.sin(a) * 1.08, z], .06, 10, false) });
      });
    }
    prim.forEach(function (n, k) { link(hub, n); link(n, prim[(k + 1) % 6]); });
    sec.forEach(function (sc) { link(sc.from, sc.idx); });
    /* kilka powiązań między dalszymi interesariuszami */
    for (i = 1; i < sec.length; i += 3) link(sec[i].idx, sec[(i + 1) % sec.length].idx);
    link(prim[0], prim[3]);
    return { p: p, y: y, th: .13, k: 3 };
  }

  /* 0 = plus, 1 = sieć, 2 = kula, 3 = fala (kolejność jak tematy 01–03) */
  var RAW = [plusShape(), network(), sphereShell(), ripple()];
  var N = Math.max.apply(null, RAW.map(function (s) { return s.p.length; }));

  function edges(s) {
    var P = s.p, E = [], seen = {};
    for (var i = 0; i < P.length; i++) {
      var d = [];
      for (var j = 0; j < P.length; j++) {
        if (j === i) continue;
        var q = Math.pow(P[i][0] - P[j][0], 2) + Math.pow(P[i][1] - P[j][1], 2) + Math.pow(P[i][2] - P[j][2], 2);
        if (q < s.th * s.th) d.push([q, j]);
      }
      d.sort(function (a, b) { return a[0] - b[0]; });
      d.slice(0, s.k).forEach(function (dj) {
        var jj = dj[1], key = i < jj ? i + '_' + jj : jj + '_' + i;
        if (!seen[key]) { seen[key] = 1; E.push(i, jj); }
      });
    }
    return E;
  }
  /* Każda bryła ma N punktów, ułożonych od lewej do prawej, żeby przejścia „przepływały”. */
  var SH = RAW.map(function (s) {
    var L = s.p.length, ord = [], inv = new Array(L), rep = new Array(L), i;
    for (i = 0; i < L; i++) ord.push(i);
    ord.sort(function (a, b) { return (s.p[a][0] + s.p[a][1] * .25) - (s.p[b][0] + s.p[b][1] * .25); });
    ord.forEach(function (k, r) { inv[k] = r; });
    var p = new Float32Array(N * 3), y = new Float32Array(N);
    for (i = 0; i < N; i++) {
      var r = Math.min(L - 1, Math.floor(i * L / N)), k = ord[r];
      p[i * 3] = s.p[k][0]; p[i * 3 + 1] = s.p[k][1]; p[i * 3 + 2] = s.p[k][2]; y[i] = s.y[k];
      if (rep[r] === undefined) rep[r] = i;
    }
    var E = edges(s).map(function (k) { return rep[inv[k]]; });
    return { p: p, y: y, E: new Uint32Array(E) };
  });

  /* ---------- three ---------- */
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (e) { tabs.forEach(function (t, k) { t.addEventListener('click', function () { select(k); }); }); select(0); return; }
  canvas.className = 'hero__gl';
  visual.appendChild(canvas);
  visual.classList.add('is-gl');
  anim = true;

  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
  cam.position.set(0, 0, 6.6);
  var pos = new Float32Array(N * 3), acc = new Float32Array(N);
  var geo = new THREE.BufferGeometry();
  var aPos = new THREE.BufferAttribute(pos, 3), aY = new THREE.BufferAttribute(acc, 1);
  aPos.setUsage(THREE.DynamicDrawUsage); aY.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', aPos); geo.setAttribute('aY', aY);

  /* Kolory: grafit #111, akcent #2F5FD0 → #5B7FCC, tło #F3F3EF (głębia rozmywa się w tło). */
  var depth = 'float c=-(modelViewMatrix*vec4(0.,0.,0.,1.)).z;vD=clamp((-mv.z-(c-.95))/1.8,0.,1.);';
  var pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uPx: { value: 1 } },
    vertexShader: 'attribute float aY;uniform float uPx;varying float vY;varying float vD;' +
      'void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;' + depth +
      'vY=aY;gl_PointSize=19.*uPx*(1.+vY*.3)*mix(1.35,.8,vD)/(-mv.z);}',
    fragmentShader: 'varying float vY;varying float vD;' +
      'void main(){float r=length(gl_PointCoord-.5);float m=1.-smoothstep(.34,.46,r);if(m<.02)discard;' +
      'vec3 bg=vec3(.953,.953,.937);vec3 ink=mix(vec3(.067),bg,vD*.55);vec3 ac=mix(vec3(.18,.37,.82),vec3(.36,.5,.8),vD*.5);' +
      'gl_FragColor=vec4(mix(ink,ac,smoothstep(.2,.8,vY)),mix(1.,.45,vD)*m);}'
  });
  function lineMat() {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uOp: { value: 1 } },
      vertexShader: 'attribute float aY;varying float vY;varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;' + depth + 'vY=aY;}',
      fragmentShader: 'uniform float uOp;varying float vY;varying float vD;void main(){vec3 col=mix(vec3(.12),vec3(.18,.37,.82),smoothstep(.3,.9,vY));' +
        'gl_FragColor=vec4(col,uOp*mix(mix(.34,.07,vD),mix(.8,.35,vD),smoothstep(.3,.9,vY)));}'
    });
  }
  function lineGeo() { var g = new THREE.BufferGeometry(); g.setAttribute('position', aPos); g.setAttribute('aY', aY); return g; }
  var gA = lineGeo(), gB = lineGeo(), mA = lineMat(), mB = lineMat();
  var lA = new THREE.LineSegments(gA, mA), lB = new THREE.LineSegments(gB, mB), pts = new THREE.Points(geo, pMat);
  lA.frustumCulled = lB.frustumCulled = pts.frustumCulled = false;
  var grp = new THREE.Group(); grp.add(lA, lB, pts); scene.add(grp);

  function size() {
    var W = visual.clientWidth, H = visual.clientHeight;
    if (!W || !H) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
    pMat.uniforms.uPx.value = dpr * (H / 520) * 1.8;
    grp.scale.setScalar(Math.min(1, W / H) * 1.12);
  }
  window.addEventListener('resize', size);
  size();

  /* ---------- ruch własny każdej bryły ---------- */
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function fx(x, y, z, k, t, o) {
    var c, s, X = x, Y = y, Z = z, a;
    if (k === 0) { a = Math.sin(t * .5) * .4; c = Math.cos(a); s = Math.sin(a); X = c * x - s * z; Z = s * x + c * z; }
    else if (k === 2) { a = t * .2; c = Math.cos(a); s = Math.sin(a); X = c * x - s * z; Z = s * x + c * z; }
    else if (k === 3) { var r = Math.hypot(x, z); y = .3 * Math.sin(r * 6 - t * 2.6) * Math.exp(-r * .6); c = Math.cos(.32); s = Math.sin(.32); X = x; Y = c * y - s * z; Z = s * y + c * z; }
    else { a = t * .15; c = Math.cos(a); s = Math.sin(a); X = c * x - s * z; Z = s * x + c * z; Y = y + Math.sin(t * .8 + x * 3) * .02; }
    o[0] = X; o[1] = Y; o[2] = Z;
  }
  /* Światło akcentu przechodzące przez bryłę */
  var band = function (s, c, w) { return Math.exp(-Math.pow((s - c) * w, 2)); };
  function sweep(k, x, y, z, t) {
    if (k === 0) return band((x + y) * .72, ((t / 2.8) % 1) * 3.4 - 1.7, 4.5);
    if (k === 2) return band(-y, ((t / 3.2) % 1) * 2.8 - 1.4, 5);
    if (k === 3) return band(Math.hypot(x, z), ((t / 2.6) % 1) * 1.9, 6);
    return band(Math.hypot(x, y, z), ((t / 3) % 1) * 1.7, 6);  /* sieć: impuls od centrum do interesariuszy */
  }

  /* ---------- sekwencja: plus → sieć → plus → kula → plus → fala ---------- */
  var SEQ = [0, 1, 0, 2, 0, 3], HOLD = [2600, 5200], TR = 2300;
  var si = 1, kA = 1, kB = 1, T = 1, tStart = 0, stateStart = 0;
  var ord = new Float32Array(N), jit = new Float32Array(N);
  for (var i = 0; i < N; i++) { ord[i] = i / N; jit[i] = R(); }
  function setIdx(g, E) { g.setIndex(new THREE.BufferAttribute(E, 1)); }
  function go(s, now) {
    si = (s + SEQ.length) % SEQ.length;
    kA = kB; kB = SEQ[si];
    setIdx(gA, SH[kA].E); setIdx(gB, SH[kB].E);
    T = reduce ? 1 : 0;
    /* Pasek tematu obejmuje plus przed bryłą i samą bryłę. */
    var c = Math.floor(si / 2);
    if (c !== cur) { tStart = now; select(c); }
    stateStart = now;
    render(now);
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () {
      var now = performance.now();
      if (si !== k * 2 + 1) go(k * 2 + 1, now);
      select(k);
      tStart = now - HOLD[0]; stateStart = now;
    });
  });

  var mx = 0, my = 0, tx = 0, ty = 0;
  var heroEl = visual.closest('.hero') || visual;
  if (!reduce) heroEl.addEventListener('mousemove', function (e) {
    var r = heroEl.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
  });

  var a = [0, 0, 0], b = [0, 0, 0];
  function update(now) {
    var t = reduce ? 0 : now / 1000, PA = SH[kA].p, PB = SH[kB].p, YA = SH[kA].y, YB = SH[kB].y;
    for (var i = 0; i < N; i++) {
      var d = ord[i] * .42 + jit[i] * .1, u = ease(Math.min(1, Math.max(0, (T - d) / .48))), i3 = i * 3;
      fx(PA[i3], PA[i3 + 1], PA[i3 + 2], kA, t, a); fx(PB[i3], PB[i3 + 1], PB[i3 + 2], kB, t, b);
      var mxx = (a[0] + b[0]) / 2, myy = (a[1] + b[1]) / 2, mzz = (a[2] + b[2]) / 2, l = Math.hypot(mxx, myy, mzz) || 1, sn = Math.sin(Math.PI * u);
      pos[i3] = a[0] + (b[0] - a[0]) * u + mxx / l * .24 * sn;
      pos[i3 + 1] = a[1] + (b[1] - a[1]) * u + (myy / l * .24 + .16) * sn;
      pos[i3 + 2] = a[2] + (b[2] - a[2]) * u + mzz / l * .24 * sn;
      var yv = YA[i] + (YB[i] - YA[i]) * u;
      var sw = reduce ? 0 : sweep(kA, pos[i3], pos[i3 + 1], pos[i3 + 2], t) * (1 - u) + sweep(kB, pos[i3], pos[i3 + 1], pos[i3 + 2], t) * u;
      acc[i] = Math.max(yv, sw);
    }
    aPos.needsUpdate = true; aY.needsUpdate = true;
    mA.uniforms.uOp.value = kA === kB ? 1 : 1 - Math.min(1, T / .45);
    mB.uniforms.uOp.value = kA === kB ? 0 : Math.max(0, (T - .55) / .45);
  }

  var last = performance.now(), ph = 0, raf = 0, visible = true;
  function render(now) {
    update(now);
    grp.rotation.y = -.45 + Math.sin(ph) * .4 + mx * .4;
    grp.rotation.x = .18 + Math.sin(ph * .6) * .05 + my * .2;
    renderer.render(scene, cam);
  }
  function frame(now) {
    raf = 0;
    var dt = Math.min(50, now - last); last = now;
    if (T < 1) T = Math.min(1, T + dt / TR);
    if (now - stateStart > HOLD[si % 2]) go(si + 1, now);
    var total = HOLD[0] + HOLD[1];
    tabs[cur].querySelector('.topic__bar i').style.transform = 'scaleX(' + Math.min(1, (now - tStart) / total) + ')';
    mx += (tx - mx) * .04; my += (ty - my) * .04; ph += dt * .00022;
    render(now);
    loop();
  }
  function loop() { if (!reduce && visible && !document.hidden && !raf) raf = requestAnimationFrame(frame); }
  function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  /* Animacja działa tylko, gdy hero jest widoczne i karta aktywna. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible) { var n = performance.now(); var gap = n - last; stateStart += gap; tStart += gap; last = n; loop(); } else pause();
    }).observe(visual);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause();
    else { var n = performance.now(); var gap = n - last; stateStart += gap; tStart += gap; last = n; loop(); }
  });
  reduceMq.addEventListener && reduceMq.addEventListener('change', function (m) {
    reduce = m.matches; select(cur); if (reduce) { pause(); T = 1; render(performance.now()); } else { last = performance.now(); loop(); }
  });

  /* Start na temacie 01 (sieć). */
  var now0 = performance.now();
  setIdx(gA, SH[1].E); setIdx(gB, SH[1].E);
  tStart = now0 - HOLD[0]; stateStart = now0;
  select(0);
  render(now0);
  loop();
})();
