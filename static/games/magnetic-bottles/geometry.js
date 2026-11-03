/* Magnetic Bottles: "The geometry of the donut" (layouts/science-lab/magnetic-bottles.html, section #mb-geo).
   Loaded only when the section comes near the screen (a small loader in the layout). Our own drawing: a torus with a
   field line that winds q times the long way for each turn the short way, and three nested tori with q rising outward.

   The field line on a torus of major radius R and minor radius r, with toroidal angle phi and poloidal angle theta:
     x = (R + r cos theta) cos phi,  y = (R + r cos theta) sin phi,  z = r sin theta,  theta = phi / q.
   For q = m/n in lowest terms the line closes after m turns the long way and n the short way; we trace it with
   phi = 2 pi m s, theta = 2 pi n s (0 <= s <= 1), so it returns to its start exactly. For an irrational q it never closes.
   The same formula is used for the numerical check (MBGeo.math). Formulas are typeset with static/math/core/tex.js
   (\role colors, docs/formula-colors.md), loaded on demand. */
(function (W, D) {
  'use strict';
  var PI = Math.PI, TAU = 2 * PI, PHI = (1 + Math.sqrt(5)) / 2;
  var R0 = 1, A0 = 0.42;                                       // major radius, minor radius (drawing units)

  // ---------- pure math (also used by the tests) ----------
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function fracOf(x) { var k = Math.round(x * 100), g = gcd(k, 100); return { m: k / g, n: 100 / g }; }  // slider values are hundredths
  function torusPt(R, r, th, ph) { var c = R + r * Math.cos(th); return [c * Math.cos(ph), c * Math.sin(ph), r * Math.sin(th)]; }
  // point on the line after t turns the long way: rational lines use the exact (m, n) parametrization
  function linePt(Q, t, R, r) {
    var ph, th;
    if (Q.m) { var s = t / Q.m; ph = TAU * Q.m * s; th = TAU * Q.n * s; }
    else { ph = TAU * t; th = ph / Q.q; }
    return torusPt(R, r, th, ph);
  }
  var M = { gcd: gcd, fracOf: fracOf, torusPt: torusPt, linePt: linePt, PHI: PHI };
  W.MBGeo = { math: M };
  if (!D || !D.getElementById) return;

  var sec = D.getElementById('mb-geo'), cv = D.getElementById('mbg-cv'), L = W.TRBLab;
  if (!sec || !cv || !L || sec._mbg) return;
  sec._mbg = 1;
  var reduced = L.reduced, store = L.store('magnetic-bottles');
  var hud = D.getElementById('mbg-hud'), live = D.getElementById('mbg-live');
  var g = L.canvas(cv), view = cv.parentNode;

  // ---------- formulas: tex.js typesets them (with role colors) when it arrives ----------
  function typeset() {
    var ML = W.MathLadder; if (!ML || !ML.typeset) return;
    sec.querySelectorAll('[data-tex]').forEach(function (el) {
      if (el._done) return; el._done = 1;
      el.innerHTML = el.getAttribute('data-tex').split('||').map(function (t) { return '$$' + t + '$$'; }).join('');
      ML.typeset(el);
    });
    draw();
  }
  (function loadTex() {
    if (W.MathLadder && W.MathLadder.typeset) { typeset(); return; }
    var css = sec.getAttribute('data-texcss'), js = sec.getAttribute('data-tex-js');
    if (css && !D.querySelector('link[data-mbg]')) { var l = D.createElement('link'); l.rel = 'stylesheet'; l.href = css; l.setAttribute('data-mbg', '1'); D.head.appendChild(l); }
    if (js) { var s = D.createElement('script'); s.src = js; s.onload = typeset; D.head.appendChild(s); }
  })();
  function roleCol(k, fb) { var ML = W.MathLadder, on = !ML || !ML.roles || ML.roles.on(); if (!on) return fb; var r = ML && ML.roles && ML.roles.list[k]; return r ? r.dark : fb; } // the canvas is always dark

  // ---------- state ----------
  var PRE = { '1': { m: 1, n: 1 }, '2': { m: 2, n: 1 }, '3/2': { m: 3, n: 2 }, '2/3': { m: 2, n: 3 }, 'phi': { q: PHI, name: 'golden ratio' } };
  var st = { mode: store.get('geoMode', 'line') === 'nest' ? 'nest' : 'line', pre: '3/2', Q: null };
  var cam = { yaw: -0.55, pitch: 0.8, zoom: 1 };
  function setQ(Q) {
    Q.q = Q.m ? Q.m / Q.n : Q.q; st.Q = Q;
    trace.reset();
  }

  // ---------- the growing field line, its coverage of the surface ----------
  var NT = 20, NP = 60, MAXSEG = (W.innerWidth || 1000) < 700 ? 1100 : 1800, TMAX = 240;           // surface grid (short way x long way), drawn segments, turns cap
  var trace = {
    pts: [], cells: new Uint16Array(NT * NP), covered: 0, t: 0, end: 0, done: false, clock: 0, spt: 96,
    reset: function () {
      var Q = st.Q; this.pts = []; this.cells = new Uint16Array(NT * NP); this.covered = 0; this.t = 0; this.clock = 0; this.done = false; this.full = 0;
      this.end = Q.m ? Q.m : TMAX;
      this.spt = Math.min(240, Math.ceil(72 + 64 / Q.q));         // samples per turn the long way: finer when the line winds fast
      this.add(0);
      if (reduced) this.grow(Q.m ? this.end : 40);                 // no animation: show the finished line (or 40 turns)
      say(); draw(); kick();
    },
    add: function (t) {
      var Q = st.Q, p = linePt(Q, t, R0, A0 * 1.012);
      // the cell this point lies in
      var ph, th;
      if (Q.m) { var s = t / Q.m; ph = TAU * Q.m * s; th = TAU * Q.n * s; } else { ph = TAU * t; th = ph / Q.q; }
      var i = Math.floor(((th % TAU) + TAU) % TAU / TAU * NT) % NT, j = Math.floor(((ph % TAU) + TAU) % TAU / TAU * NP) % NP, k = i * NP + j;
      if (!this.cells[k]) this.covered++;
      if (this.cells[k] < 65000) this.cells[k]++;
      this.pts.push({ p: p, th: th, ph: ph });
    },
    grow: function (to) {
      to = Math.min(to, this.end);
      var step = 1 / this.spt;
      while (this.t + step < to - 1e-9) { this.t += step; this.add(this.t); }
      if (to >= this.end - 1e-9) {
        this.t = this.end; this.add(this.end); this.done = true;
      } else { this.t = to; }
      if (this.pts.length > MAXSEG + 1) this.pts.splice(0, this.pts.length - MAXSEG - 1);
    }
  };

  // ---------- 3-D: rotate, project, shade ----------
  var P = { ca: 1, sa: 0, cb: 1, sb: 0, S: 100, cx: 0, cy: 0, Dv: 8 };
  function setup() {
    P.ca = Math.cos(cam.yaw); P.sa = Math.sin(cam.yaw); P.cb = Math.cos(cam.pitch); P.sb = Math.sin(cam.pitch);
    P.cx = g.w / 2; P.cy = g.h / 2;
    P.S = Math.min(g.w * 0.84, g.h * 1.25) / (2 * (R0 + A0) * 1.12) * cam.zoom;
  }
  // world -> [screen x, screen y, depth (bigger is farther)]
  function proj(v) {
    var x1 = v[0] * P.ca - v[1] * P.sa, y1 = v[0] * P.sa + v[1] * P.ca, z1 = v[2];
    var y2 = y1 * P.cb - z1 * P.sb, z2 = y1 * P.sb + z1 * P.cb, f = P.Dv / (P.Dv + y2);
    return [P.cx + P.S * x1 * f, P.cy - P.S * z2 * f, y2];
  }
  function rotN(n) { var x1 = n[0] * P.ca - n[1] * P.sa, y1 = n[0] * P.sa + n[1] * P.ca; return [x1, y1 * P.cb - n[2] * P.sb, y1 * P.sb + n[2] * P.cb]; }
  var LGT = (function () { var v = [-0.45, -0.75, 0.5], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function rgb(c, k, al) { return 'rgba(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ',' + (al === undefined ? 1 : al) + ')'; }

  // a surface: quads on a theta x phi grid (phi from p0 to p1). Returns primitives for the depth sort.
  function surfPrims(prims, r, nt, np, p0, p1, base, paint, cells, closed) {
    var V = [], N = [];
    for (var j = 0; j <= np; j++) {
      var ph = p0 + (p1 - p0) * j / np;
      for (var i = 0; i <= nt; i++) {
        var th = TAU * i / nt;
        V.push(proj(torusPt(R0, r, th, ph)));
        N.push(rotN([Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th)]));
      }
    }
    var W1 = nt + 1;
    for (j = 0; j < np; j++) for (i = 0; i < nt; i++) {
      var a = j * W1 + i, b = a + 1, c = a + W1 + 1, d = a + W1;
      var thm = TAU * (i + 0.5) / nt, phm = p0 + (p1 - p0) * (j + 0.5) / np;
      var n = rotN([Math.cos(thm) * Math.cos(phm), Math.cos(thm) * Math.sin(phm), Math.sin(thm)]);
      var back = n[1] > 0;                                   // normal points away from the viewer
      if (back && closed) continue;                           // a closed torus hides its own back side
      var dep = (V[a][2] + V[b][2] + V[c][2] + V[d][2]) / 4;
      var ndl = n[0] * LGT[0] + n[1] * LGT[1] + n[2] * LGT[2];
      var li = back ? 0.22 + 0.3 * Math.max(0, -ndl) : 0.34 + 0.66 * Math.max(0, ndl);   // the inside of a cut shell is lit dimly
      var col = base;
      if (cells) { var v = cells[i * NP + j]; if (v) col = mix(base, paint, Math.min(0.6, 0.25 + 0.12 * v)); }
      var rim = Math.pow(1 - Math.abs(n[1]), 3) * 0.25;      // a little light on the silhouette
      prims.push({ d: dep, k: 0, q: [V[a], V[b], V[c], V[d]], f: rgb(col, Math.min(1.25, li + rim)) });
    }
  }
  function linePrims(prims, pts, col, wid, fade, all) {
    var nseg = pts.length - 1;
    for (var s = 0; s < nseg; s++) {
      var A = pts[s], B = pts[s + 1];
      var thm = (A.th + B.th) / 2, phm = (A.ph + B.ph) / 2;
      var n = rotN([Math.cos(thm) * Math.cos(phm), Math.cos(thm) * Math.sin(phm), Math.sin(thm)]);
      if (!all && n[1] > 0.02) continue;                      // on the far side of the surface
      var a = proj(A.p), b = proj(B.p);
      var age = fade ? (nseg - s) / nseg : 0;
      prims.push({ d: (a[2] + b[2]) / 2 - 0.07, k: 1, a: a, b: b, w: wid, c: rgb(col, 1, fade ? 1 - 0.15 * Math.floor(age * 4.99) : 1) });   // four steps of fading, so runs batch
    }
  }
  // painter's algorithm: far to near. Quads are filled a touch larger than they are, so no seams show without a stroke;
  // runs of line segments with the same style are stroked as one path (much cheaper on phones).
  function paint(prims) {
    prims.sort(function (x, y) { return y.d - x.d; });
    var c = g.c, run = null;
    c.lineJoin = 'round'; c.lineCap = 'round';
    function flush() { if (run) { c.strokeStyle = run.c; c.lineWidth = run.w; c.stroke(); run = null; } }
    for (var i = 0; i < prims.length; i++) {
      var p = prims[i];
      if (p.k === 0) {
        flush();
        var q = p.q, mx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, my = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4, e = 1.06;
        c.beginPath();
        for (var k = 0; k < 4; k++) { var x = mx + (q[k][0] - mx) * e, y = my + (q[k][1] - my) * e; if (k) c.lineTo(x, y); else c.moveTo(x, y); }
        c.fillStyle = p.f; c.fill();
      } else {
        if (!run || run.c !== p.c || run.w !== p.w) { flush(); run = p; c.beginPath(); }
        c.moveTo(p.a[0], p.a[1]); c.lineTo(p.b[0], p.b[1]);
      }
    }
    flush();
  }

  // ---------- the two scenes ----------
  var BASE = [52, 100, 128], PAINT = [214, 178, 92], LINE = [99, 230, 190];
  var NEST = [
    { rho: 1 / 3, col: [255, 212, 121], name: 'inner' },
    { rho: 2 / 3, col: [99, 230, 190], name: 'middle' },
    { rho: 1, col: [116, 192, 252], name: 'outer' }
  ];
  function qProf(rho) { return 1 + 2 * rho * rho; }            // a made-up but typical profile: q = 1 on the axis, 3 at the edge
  NEST.forEach(function (s) { s.q = qProf(s.rho); s.r = A0 * s.rho; });
  // each surface is cut open around the side that faces the viewer at the start (F), the outer ones more widely
  var GAP = [0, 0.6, 1.15], F = -0.75;

  function drawLine() {
    var prims = [];
    surfPrims(prims, A0, NT, NP, 0, TAU, BASE, PAINT, trace.cells, true);
    linePrims(prims, trace.pts, LINE, 2.6, !trace.done || trace.pts.length > 600);
    paint(prims);
    var c = g.c, last = trace.pts[trace.pts.length - 1], first = trace.pts[0];
    // start and head markers
    if (first && trace.pts.length < MAXSEG) { var s0 = proj(first.p); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(s0[0], s0[1], 3.2, 0, TAU); c.fill(); }
    if (last && !trace.done) { var h = proj(last.p); c.fillStyle = '#fff6d6'; c.beginPath(); c.arc(h[0], h[1], 4.2, 0, TAU); c.fill(); }
    guides();
  }
  // R and r, in the formula's "position" color: center -> tube center -> tube edge, at phi = 0
  function guides() {
    var c = g.c, col = roleCol('position', '#b8c7d2');
    var O = proj([0, 0, 0]), Cc = proj([R0, 0, 0]), E = proj(torusPt(R0, A0, PI / 2, 0));
    c.save(); c.setLineDash([5, 4]); c.lineWidth = 1.6; c.strokeStyle = col; c.fillStyle = col;
    c.beginPath(); c.moveTo(O[0], O[1]); c.lineTo(Cc[0], Cc[1]); c.stroke();
    c.beginPath(); c.moveTo(Cc[0], Cc[1]); c.lineTo(E[0], E[1]); c.stroke();
    c.setLineDash([]); c.beginPath(); c.arc(O[0], O[1], 2.6, 0, TAU); c.fill(); c.beginPath(); c.arc(Cc[0], Cc[1], 2.6, 0, TAU); c.fill();
    c.font = 'italic 600 15px Georgia,serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('R', (O[0] + Cc[0]) / 2 + 2, (O[1] + Cc[1]) / 2 - 11);
    c.fillText('r', (Cc[0] + E[0]) / 2 + 10, (Cc[1] + E[1]) / 2);
    c.restore();
  }
  function drawNest() {
    var prims = [];
    NEST.forEach(function (s, k) {
      var p0 = F + GAP[k], p1 = F + TAU - GAP[k], base = mix([20, 40, 54], s.col, 0.42);
      surfPrims(prims, s.r, 16, 46, p0, p1, base, null, null, k === 0);
      // four field lines on this surface, drawn where the surface is
      for (var L2 = 0; L2 < 4; L2++) {
        var pts = [], th0 = TAU * L2 / 4, N2 = 110;
        for (var u = 0; u <= N2; u++) {
          var ph = p0 + (p1 - p0) * u / N2, th = th0 + (ph - p0) / s.q;
          pts.push({ p: torusPt(R0, s.r + 0.012, th, ph), th: th, ph: ph });
        }
        linePrims(prims, pts, s.col.map(function (x) { return Math.min(255, x * 1.08 + 20); }), 2, false);
      }
      // the cut edges: a ring where each opened surface ends (sorted with everything else, so they hide correctly)
      if (GAP[k]) [p0, p1].forEach(function (pc) {
        var ring = [];
        for (var i = 0; i <= 48; i++) { var th = TAU * i / 48; ring.push({ p: torusPt(R0, s.r, th, pc), th: th, ph: pc }); }
        linePrims(prims, ring, s.col, 1.5, false, true);
      });
    });
    paint(prims);
  }
  function draw() {
    g.fit(); setup();
    var c = g.c; c.clearRect(0, 0, g.w, g.h);
    if (st.mode === 'line') drawLine(); else drawNest();
  }

  // ---------- text: the HUD and the live line for screen readers ----------
  function qName(Q) { return Q.m ? (Q.n === 1 ? String(Q.m) : Q.m + '/' + Q.n) : '1.618… (the golden ratio)'; }
  function hudText() {
    if (st.mode === 'nest') return 'q rises outward: <b>' + NEST.map(function (s) { return L.fmt(s.q, 2); }).join('</b>, <b>') + '</b><br>inner lines twist most, outer least';
    var Q = st.Q, pct = Math.round(100 * trace.covered / (NT * NP));
    var a = 'q = <b>' + qName(Q) + '</b> · ' + (trace.t < 10 ? L.fmt(trace.t, 1) : Math.floor(trace.t)) + ' turns the long way<br>';
    if (Q.m) a += trace.done ? '<span class="mbg-closed">closed</span> after ' + Q.m + ' long, ' + Q.n + ' short' : 'it will close after ' + Q.m + ' long, ' + Q.n + ' short';
    else a += (trace.done ? 'stopped after ' + Math.round(trace.t) + ' turns; it never closes' : 'never closes');
    return a + ' · covered ' + pct + '%';
  }
  var lastHud = '';
  function updHud() { var t = hudText(); if (t !== lastHud) { hud.innerHTML = t; lastHud = t; } }
  function say() {
    if (!live) return;
    if (st.mode === 'nest') { live.textContent = 'Three nested surfaces. The safety factor q is ' + NEST.map(function (s) { return L.fmt(s.q, 2); }).join(', ') + ' from the inside out.'; return; }
    var Q = st.Q;
    live.textContent = Q.m ? 'q = ' + qName(Q) + '. The line closes after ' + Q.m + ' turn' + (Q.m > 1 ? 's' : '') + ' the long way and ' + Q.n + ' the short way.'
      : 'q = the golden ratio. The line never closes; it slowly covers the whole surface.';
  }

  // ---------- the animation loop (runs only while something changes and the view is on screen) ----------
  var raf = 0, onScreen = true, lastT = 0, dragging = false;
  function busy() { return st.mode === 'line' && !trace.done && !reduced && !paused; }
  function kick() { if (!raf && onScreen && !D.hidden) { lastT = performance.now(); raf = W.requestAnimationFrame(frame); } }
  var paused = false;
  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
    if (busy()) {
      trace.clock += dt;
      var speed = Math.min(5, 0.45 + 0.22 * trace.clock);   // turns per second, speeding up so a long line fills in
      trace.grow(trace.t + speed * dt);
      if (!st.Q.m && !reduced && !trace.full && trace.covered === NT * NP) { trace.full = 1; trace.end = Math.min(TMAX, Math.ceil(trace.t) + 4); }  // painted all over: a few more turns, then rest
      if (trace.done) say();
    }
    draw(); updHud();
    if (busy() && onScreen && !D.hidden) raf = W.requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) kick(); }).observe(view);
  D.addEventListener('visibilitychange', function () { if (!D.hidden) kick(); });

  // ---------- turning the view ----------
  var ptrs = {}, lastX = 0, lastY = 0, pinch0 = 0, zoom0 = 1;
  function turn(dx, dy) { cam.yaw -= dx * 0.008; cam.pitch = Math.max(0.05, Math.min(1.5, cam.pitch + dy * 0.008)); kick(); }
  cv.addEventListener('pointerdown', function (e) { ptrs[e.pointerId] = [e.clientX, e.clientY]; lastX = e.clientX; lastY = e.clientY; dragging = true; try { cv.setPointerCapture(e.pointerId); } catch (er) { } var k = Object.keys(ptrs); if (k.length === 2) { pinch0 = Math.hypot(ptrs[k[0]][0] - ptrs[k[1]][0], ptrs[k[0]][1] - ptrs[k[1]][1]); zoom0 = cam.zoom; } });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = [e.clientX, e.clientY];
    var k = Object.keys(ptrs);
    if (k.length === 2 && pinch0) { var d = Math.hypot(ptrs[k[0]][0] - ptrs[k[1]][0], ptrs[k[0]][1] - ptrs[k[1]][1]); cam.zoom = Math.max(0.6, Math.min(2.2, zoom0 * d / pinch0)); kick(); return; }
    turn(e.clientX - lastX, e.clientY - lastY); lastX = e.clientX; lastY = e.clientY;
  });
  function up(e) { delete ptrs[e.pointerId]; if (!Object.keys(ptrs).length) { dragging = false; pinch0 = 0; } }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('keydown', function (e) {
    var k = e.key, h = true;
    if (k === 'ArrowLeft') turn(-14, 0); else if (k === 'ArrowRight') turn(14, 0); else if (k === 'ArrowUp') turn(0, -14); else if (k === 'ArrowDown') turn(0, 14);
    else if (k === '+' || k === '=') { cam.zoom = Math.min(2.2, cam.zoom * 1.12); kick(); } else if (k === '-') { cam.zoom = Math.max(0.6, cam.zoom / 1.12); kick(); }
    else if (k === '0') { cam.yaw = -0.55; cam.pitch = 0.8; cam.zoom = 1; kick(); } else h = false;
    if (h) e.preventDefault();
  });

  // ---------- controls ----------
  var qs = D.getElementById('mbg-q'), qo = D.getElementById('mbg-qo'), pre = D.getElementById('mbg-pre');
  var lineBox = D.getElementById('mbg-linebox'), nestBox = D.getElementById('mbg-nestbox'), playB = D.getElementById('mbg-play'), againB = D.getElementById('mbg-again');
  function presetPressed(id) { pre.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-q') === id ? 'true' : 'false'); }); }
  function fromPreset(id) {
    var p = PRE[id]; st.pre = id; presetPressed(id);
    var Q = p.m ? { m: p.m, n: p.n } : { q: p.q };
    qs.value = (p.m ? p.m / p.n : p.q).toFixed(2); showQ(Q); paused = false; setPlay(); setQ(Q);
  }
  function showQ(Q) { var v = Q.m ? Q.m / Q.n : Q.q; qo.textContent = (Q.m ? (Q.n === 1 ? Q.m + '' : Q.m + '/' + Q.n + ' = ' + L.fmt(v, Q.n > 9 ? 2 : 3).replace(/0+$/, '').replace(/\.$/, '')) : 'φ = 1.618…'); qs.setAttribute('aria-valuetext', Q.m ? 'q = ' + qName(Q) : 'q = the golden ratio, 1.618'); }
  pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-q]'); if (b) fromPreset(b.getAttribute('data-q')); });
  qs.addEventListener('input', function () { var Q = fracOf(+qs.value); presetPressed(''); showQ(Q); paused = false; setPlay(); setQ(Q); });
  function setPlay() { playB.textContent = paused ? 'Play' : 'Pause'; playB.setAttribute('aria-pressed', paused ? 'true' : 'false'); playB.disabled = reduced || trace.done; }
  playB.addEventListener('click', function () { paused = !paused; setPlay(); kick(); });
  againB.addEventListener('click', function () {
    if (reduced && !st.Q.m) { trace.grow(Math.min(TMAX, trace.t + 20)); updHud(); draw(); return; }  // without motion: 20 more turns per press
    paused = false; setQ(st.Q); setPlay();
  });
  if (reduced) againB.textContent = 'Wind 20 more turns';
  var modeSeg = D.getElementById('mbg-mode');
  function setMode(m) {
    st.mode = m; store.set('geoMode', m);
    modeSeg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-m') === m ? 'true' : 'false'); });
    lineBox.hidden = m !== 'line'; nestBox.hidden = m !== 'nest';
    cv.setAttribute('aria-label', m === 'line' ? 'A doughnut-shaped surface with one magnetic field line winding around it. Drag or use the arrow keys to turn it.' : 'Three nested doughnut surfaces, cut open, each with field lines that twist by a different amount. Drag or use the arrow keys to turn it.');
    say(); kick(); draw(); updHud();
  }
  modeSeg.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) setMode(b.getAttribute('data-m')); });

  // the q profile in the nested mode (SVG, drawn once)
  (function profile() {
    var sv = D.getElementById('mbg-prof'); if (!sv) return;
    var X = function (r) { return 34 + r * 196; }, Y = function (q) { return 118 - (q - 0) / 3.4 * 104; };
    var h = '';
    [1, 2, 3].forEach(function (q) { h += '<line class="gd" x1="34" x2="230" y1="' + Y(q) + '" y2="' + Y(q) + '"/><text x="26" y="' + (Y(q) + 4) + '" text-anchor="end">' + q + '</text>'; });
    h += '<path class="ax" d="M34 10V118H232"/>';
    var d = ''; for (var i = 0; i <= 40; i++) { var r = i / 40; d += (i ? 'L' : 'M') + X(r).toFixed(1) + ' ' + Y(qProf(r)).toFixed(1); }
    h += '<path class="cv" d="' + d + '"/>';
    NEST.forEach(function (s) { h += '<circle cx="' + X(s.rho) + '" cy="' + Y(s.q) + '" r="5.5" fill="rgb(' + s.col.join(',') + ')" stroke="#06111a" stroke-width="1.2"/>'; });
    h += '<text x="34" y="136">axis</text><text x="230" y="136" text-anchor="end">edge</text><text x="132" y="136" text-anchor="middle">distance out</text><text x="40" y="20">q</text>';
    sv.innerHTML = h;
  })();

  W.addEventListener('resize', function () { draw(); });
  L.onTheme(function () { draw(); });
  new MutationObserver(function () { draw(); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-fcolors'] });
  fromPreset('3/2'); setMode(st.mode);
  W.MBGeo.state = function () { return { mode: st.mode, Q: st.Q, t: trace.t, done: trace.done, covered: trace.covered / (NT * NP), pts: trace.pts.length }; };
})(window, typeof document !== 'undefined' ? document : null);
