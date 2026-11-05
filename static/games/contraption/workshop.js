/* Contraption Workshop (/games/contraption/): the screen, drawing and controls. Needs engine.js (window.CW),
   levels.js (window.CW_LEVELS) and /js/rule-drag.js (window.RuleDrag), all written for this site.

   Building: every drag asks the engine for the spots where the part is allowed (placement rules: it must fit, and
   some parts must stand on the floor, a level ramp or a wall) and shows the nearest one; spots that hand motion to
   a neighbor pull a little harder. While a part is dragged the rest of the stage grays out where it can't go, and a
   faint path shows where the balls would roll, worked out by running the real physics a few seconds ahead.
   Running: fixed 1/60 s steps (engine.js), so slow motion and Step show exactly the same motion.
   Saved per browser (localStorage, if allowed): each level's layout, stars and the two toggles. A link (#lv=…&m=…)
   carries a layout. */
(function () {
  'use strict';
  var CW = window.CW, LEVELS = window.CW_LEVELS, RD = window.RuleDrag;
  var root = document.getElementById('cw');
  if (!root || !CW || !LEVELS || !RD) return;
  var W = CW.W, H = CW.H, FLOOR = CW.FLOOR;
  var $ = function (id) { return document.getElementById(id); };
  var can = $('cw-can'), ctx = can.getContext('2d'), stage = root.querySelector('.cw-stage');
  var NAMES = {}; Object.keys(CW.TYPES).forEach(function (k) { NAMES[k] = CW.TYPES[k].name; });
  var SHORT = { wheel: 'Wheel', screw: 'Screw lift', dominoes: 'Dominoes' };
  var ORDER = ['ball', 'ramp', 'funnel', 'dominoes', 'lever', 'pulley', 'wheel', 'wedge', 'screw', 'spring', 'cup', 'bell'];

  // ---------- storage (never required) ----------
  function load(k, d) { try { var v = localStorage.getItem('cw-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem('cw-' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }

  // ---------- state ----------
  var S = {
    lv: null, parts: [], sel: null, uid: 1, sim: null, running: false, paused: false, acc: 0, last: 0, done: false,
    slow: !!load('slow', false), showPath: load('path', true) !== false, path: null, drag: null, won: false,
    stars: load('stars', {}), lastRun: null, note: '', noteT: 0, keyStates: null
  };

  // ---------- colors from the theme ----------
  var C = {};
  function theme() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    C = dark ? {
      bg: '#18201c', grid: 'rgba(255,255,255,.045)', floor: '#2c3731', floorTop: '#46544b', wood: '#c9965a', woodD: '#8e6233', metal: '#9aa8a0', metalD: '#61706a',
      ball: '#6cc79a', ballD: '#2f7a55', gold: '#d8b45a', goldD: '#9c7c2c', ink: '#e6ece8', muted: '#a5b5ab', green: '#6cc79a', sand: '#b89a62', cream: '#ece4d2', creamD: '#8d846f',
      stone: '#3b4740', stoneD: '#56645b', grey: 'rgba(8,12,10,.5)', ok: 'rgba(108,199,154,.9)', path: 'rgba(108,199,154,.55)', sel: '#d8b45a', fixed: 'rgba(255,255,255,.07)'
    } : {
      bg: '#fbf8f0', grid: 'rgba(0,66,37,.05)', floor: '#e3d9c2', floorTop: '#b9aa86', wood: '#b9853f', woodD: '#7d5420', metal: '#7d8b84', metalD: '#4c5a53',
      ball: '#00562f', ballD: '#002f19', gold: '#b8963e', goldD: '#7a5b12', ink: '#1d2320', muted: '#56625b', green: '#00562f', sand: '#cdb27a', cream: '#fffaf0', creamD: '#6f6552',
      stone: '#d6cdb8', stoneD: '#a99d82', grey: 'rgba(60,70,64,.28)', ok: 'rgba(0,86,47,.85)', path: 'rgba(0,86,47,.45)', sel: '#b8963e', fixed: 'rgba(0,0,0,.05)'
    };
    drawPalette();
  }

  // ---------- sizing ----------
  var scale = 1, dpr = 1;
  function size() {
    var locked = document.documentElement.classList.contains('game-lock');
    var w = stage.clientWidth, h;
    if (locked) {
      var avail = Math.max(160, Math.min(window.innerHeight * 0.62, w * H / W));
      h = avail; w = Math.min(w, h * W / H); h = w * H / W;
    } else { h = w * H / W; }
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    can.style.width = Math.floor(w) + 'px'; can.style.height = Math.floor(h) + 'px';
    can.width = Math.floor(w * dpr); can.height = Math.floor(h * dpr);
    scale = Math.floor(w) / W;
    S.greyCanvas = null;
    draw();
  }
  function toWorld(e) {
    var r = can.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  function overStage(e) {
    var r = can.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }

  // ---------- parts helpers ----------
  function others(p) { return S.parts.filter(function (q) { return q !== p && q.id !== p.id; }); }
  function remaining(t) {
    if (!S.lv.palette) return Infinity;
    var max = S.lv.palette[t]; if (max === undefined) return 0;
    return max - S.parts.filter(function (p) { return !p.fixed && p.t === t; }).length;
  }
  function defaults(t) {
    var p = { id: 'u' + (S.uid++), t: t, x: 0, y: 0, a: 0, n: 0 };
    if (t === 'ramp') { p.a = 15; p.n = 4; }
    if (t === 'dominoes') { p.a = 1; p.n = 5; }
    if (t === 'lever' || t === 'screw' || t === 'pulley') p.a = (t === 'lever' ? -1 : 1);
    if (t === 'screw') p.n = 4;
    return p;
  }
  function anchorOf(p) { return { x: p.x, y: p.y }; }
  function hitPart(pt, slop) {
    var best = null, bd = Infinity;
    for (var i = S.parts.length - 1; i >= 0; i--) {
      var p = S.parts[i], sh = CW.shapes(p);
      for (var j = 0; j < sh.length; j++) {
        var s = sh[j], d = segDist(pt.x, pt.y, s) - s[4];
        if (p.t === 'ball' || p.t === 'bell') d -= 4;
        if (d < bd) { bd = d; best = p; }
      }
    }
    return bd < slop ? best : null;
  }
  function segDist(px, py, s) {
    var dx = s[2] - s[0], dy = s[3] - s[1], L = dx * dx + dy * dy, t = L ? ((px - s[0]) * dx + (py - s[1]) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - s[0] - dx * t, py - s[1] - dy * t);
  }
  // Handles: the knobs on the selected part that change its angle, size or side. Each is a set of allowed states.
  function handleOf(p) {
    if (!p || p.fixed) return null;
    var T = CW.TYPES[p.t];
    function list(fn) { var out = []; fn(out); return out.filter(function (q) { return CW.placeOK(q, others(p)); }); }
    switch (p.t) {
      case 'ramp': return { states: list(function (o) { T.angles.forEach(function (a) { T.sizes.forEach(function (n) { o.push(Object.assign({}, p, { a: a, n: n })); }); }); }),
        at: function (q) { var L = q.n * 20, r = q.a * Math.PI / 180; return { x: q.x + Math.cos(r) * L, y: q.y + Math.sin(r) * L }; }, tip: 'Drag the knob to turn the ramp and change its length.' };
      case 'dominoes': return { states: list(function (o) { [1, -1].forEach(function (a) { T.sizes.forEach(function (n) { o.push(Object.assign({}, p, { a: a, n: n })); }); }); }),
        at: function (q) { return { x: q.x + q.a * (q.n - 1) * CW.DOM.pitch, y: q.y - CW.DOM.h - 8 }; }, tip: 'Drag the knob to add or take away dominoes, or to turn the row around.' };
      case 'screw': return { states: list(function (o) { T.sizes.forEach(function (n) { o.push(Object.assign({}, p, { n: n })); }); }),
        at: function (q) { return { x: q.x, y: q.y - q.n * 40 - 10 }; }, tip: 'Drag the knob to make the screw lift taller or shorter.' };
      case 'spring': return { states: list(function (o) { T.angles.forEach(function (a) { o.push(Object.assign({}, p, { a: a })); }); }),
        at: function (q) { var r = q.a * Math.PI / 180; return { x: q.x + Math.cos(r) * 30, y: q.y - CW.SPRING.h + Math.sin(r) * 30 }; }, tip: 'Drag the knob to tilt the spring.' };
      case 'lever': return { states: list(function (o) { [1, -1].forEach(function (a) { o.push(Object.assign({}, p, { a: a })); }); }),
        at: function (q) { var t = q.a * CW.LEVER.lim; return { x: q.x + Math.cos(t) * 80 * q.a, y: q.y - CW.LEVER.h - 3 + Math.sin(t) * 80 * q.a + 10 }; }, tip: 'Drag the knob to choose which end starts down.' };
      case 'pulley': return { states: list(function (o) { [1, -1].forEach(function (a) { o.push(Object.assign({}, p, { a: a })); }); }),
        at: function (q) { return { x: q.x + q.a * CW.PULLEY.r, y: q.y + CW.PULLEY.rope - CW.PULLEY.range + CW.PULLEY.bh + 12 }; }, tip: 'Drag the knob to choose which bucket you fill.' };
    }
    return null;
  }

  // ---------- level loading ----------
  function openLevel(id, code) {
    var lv = LEVELS.filter(function (l) { return l.id === id; })[0] || LEVELS[1];
    stop(true);
    S.lv = lv; S.sel = null; S.won = false; S.lastRun = null; S.keyStates = null;
    S.parts = lv.fixed.map(function (p) { return Object.assign({}, p); });
    var placed = code !== undefined ? CW.decode(code) : CW.decode(load('lay-' + lv.id, ''));
    placed.forEach(function (p) {
      p.id = 'u' + (S.uid++);
      var T = CW.TYPES[p.t]; if (!T || p.t === 'block') return;
      if (remaining(p.t) <= 0) return;
      if (T.angles && T.angles.indexOf(p.a) < 0) return;
      if (T.sizes && T.sizes.indexOf(p.n) < 0) return;
      if (CW.placeOK(p, S.parts)) S.parts.push(p);
    });
    $('cw-level').value = lv.id;
    save('level', lv.id);
    renderTop(); renderPalette(); renderSel(); renderInfo();
    changed(true);
    showIntro();
  }
  function persist() { save('lay-' + S.lv.id, CW.encode(S.parts)); }
  function changed(noSave) {
    S.keyStates = null; S.path = null;
    if (!noSave) persist();
    renderPalette(); renderInfo();
    schedulePath();
    draw();
  }

  // ---------- predicted path ----------
  var pathPending = false;
  function schedulePath(parts) {
    S.pathParts = parts || null;
    if (pathPending) return;
    pathPending = true;
    requestAnimationFrame(function () {
      pathPending = false;
      if (!S.showPath || S.running) { S.path = null; draw(); return; }
      S.path = predict(S.pathParts || S.parts, S.drag ? 3 : 5);
      draw();
    });
  }
  function predict(parts, secs) {
    var sim = new CW.Sim(parts), tracks = sim.balls.map(function () { return []; }), steps = Math.round(secs * 60);
    for (var i = 0; i < steps; i++) {
      sim.step();
      if (i % 3 === 0) sim.balls.forEach(function (b, k) { var tr = tracks[k], l = tr[tr.length - 1]; if (!l || Math.hypot(l[0] - b.x, l[1] - b.y) > 5) tr.push([b.x, b.y]); });
      if (sim.t > 1 && sim.quiet > 0.6) break;
    }
    return tracks;
  }

  // ---------- running ----------
  function run() {
    if (S.running && !S.paused) { S.paused = true; renderBar(); return; }
    if (S.running && S.paused) { S.paused = false; S.last = performance.now(); renderBar(); loop(); return; }
    S.sel = null; renderSel();
    S.sim = new CW.Sim(S.parts.map(function (p) { return Object.assign({}, p); }));
    S.running = true; S.paused = false; S.acc = 0; S.done = false; S.won = false; S.last = performance.now(); S.path = null;
    renderBar(); loop();
  }
  function stop(silent) {
    S.running = false; S.paused = false; S.sim = null;
    if (!silent) { renderBar(); schedulePath(); draw(); }
  }
  function stepOnce() {
    if (!S.running) { run(); S.paused = true; }
    for (var i = 0; i < 6; i++) S.sim.step();
    afterSteps(); renderBar(); draw();
  }
  function loop() {
    if (!S.running || S.paused) return;
    var now = performance.now(), dt = Math.min(0.1, (now - S.last) / 1000);
    S.last = now;
    S.acc += dt * (S.slow ? 0.25 : 1);
    var n = 0;
    while (S.acc >= CW.DT && n < 6) { S.sim.step(); S.acc -= CW.DT; n++; }
    if (n === 6) S.acc = 0;
    afterSteps();
    draw();
    if (S.sim && (S.sim.t > 40 || (S.sim.t > 3 && S.sim.quiet > 3))) { S.paused = true; renderBar(); return; }
    requestAnimationFrame(loop);
  }
  function afterSteps() {
    var r = S.sim.result();
    S.lastRun = r;
    $('cw-time').textContent = S.sim.t.toFixed(1) + ' s';
    renderInfo();
    if (!S.lv.sandbox && !S.won && CW.goalMet(S.lv.goal, r)) {
      S.won = true;
      var st = CW.stars(S.lv, S.parts.filter(function (p) { return !p.fixed; }).length, r);
      var best = S.stars[S.lv.id] || 0;
      if (st.n > best) { S.stars[S.lv.id] = st.n; save('stars', S.stars); renderLevels(); renderTop(); }
      setTimeout(function () { showWin(st, r); }, 700);
    }
  }

  // ---------- drawing ----------
  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = 40; x < W; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, FLOOR); }
    for (var y = 40; y < FLOOR; y += 40) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    // floor
    ctx.fillStyle = C.floor; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = C.floorTop; ctx.fillRect(0, FLOOR, W, 3);
    var sim = S.running ? S.sim : null;
    // gray-out while dragging
    if (S.drag && S.drag.grey) drawGrey(S.drag);
    // parts
    var dragging = S.drag;
    S.parts.forEach(function (p) {
      if (dragging && dragging.part && p.id === dragging.part.id) return;
      drawPart(p, sim, 1);
    });
    if (dragging && dragging.cur) drawPart(dragging.cur, null, dragging.kind === 'handle' ? 1 : 0.85);
    // predicted path
    if (!sim && S.path) {
      ctx.save(); ctx.strokeStyle = C.path; ctx.lineWidth = 2; ctx.setLineDash([2, 6]); ctx.lineCap = 'round';
      S.path.forEach(function (tr) { if (tr.length < 2) return; ctx.beginPath(); ctx.moveTo(tr[0][0], tr[0][1]); for (var i = 1; i < tr.length; i++) ctx.lineTo(tr[i][0], tr[i][1]); ctx.stroke(); });
      ctx.restore();
    }
    // selection and handle
    if (!sim && S.sel && !S.drag) drawSelection(S.sel);
    if (S.drag && S.drag.kind === 'handle') drawSelection(S.drag.cur, true);
    // a note
    if (S.note && performance.now() < S.noteT) {
      $('cw-note').hidden = false; $('cw-note').textContent = S.note;
    } else { $('cw-note').hidden = true; }
  }
  function drawGrey(d) {
    ctx.save();
    ctx.fillStyle = C.grey;
    if (d.supported) {
      ctx.fillRect(0, 0, W, FLOOR);
      ctx.fillStyle = C.ok;
      d.states.forEach(function (q) { ctx.fillRect(q.x - 1.5, q.y - 3, 3, 3); });
    } else {
      var ok = d.okSet;
      for (var y = 20; y <= FLOOR; y += 20) for (var x = 20; x < W; x += 20) if (!ok[x + ',' + y]) ctx.fillRect(x - 10, y - 10, 20, 20);
    }
    ctx.fillStyle = C.gold;
    ctx.globalAlpha = 0.8; d.states.forEach(function (q) { if (q.bonus) { ctx.beginPath(); ctx.arc(q.x, q.y, 2.6, 0, 7); ctx.fill(); } });
    ctx.restore();
  }
  function drawSelection(p, active) {
    var sh = CW.shapes(p), x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    sh.forEach(function (s) { x1 = Math.min(x1, s[0] - s[4], s[2] - s[4]); y1 = Math.min(y1, s[1] - s[4], s[3] - s[4]); x2 = Math.max(x2, s[0] + s[4], s[2] + s[4]); y2 = Math.max(y2, s[1] + s[4], s[3] + s[4]); });
    ctx.save(); ctx.strokeStyle = C.sel; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.strokeRect(x1 - 6, y1 - 6, x2 - x1 + 12, y2 - y1 + 12); ctx.setLineDash([]);
    var h = handleOf(p);
    if (h) {
      var hp = h.at(p);
      if (active) { ctx.fillStyle = C.sel; h.states.forEach(function (q) { var a = h.at(q); ctx.globalAlpha = .45; ctx.beginPath(); ctx.arc(a.x, a.y, 3, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1; }
      ctx.fillStyle = C.sel; ctx.strokeStyle = C.bg; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(hp.x, hp.y, 9, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hp.x, hp.y, 4.5, 0.6, 5.2); ctx.stroke();
    }
    ctx.restore();
  }
  function line(x1, y1, x2, y2, w, col, cap) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = cap || 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function kinOf(sim, p) { if (!sim) return null; return sim.kins.filter(function (k) { return k.owner === p.id; }); }
  function drawPart(p, sim, alpha) {
    ctx.save(); ctx.globalAlpha = alpha;
    var x = p.x, y = p.y, i, ks = kinOf(sim, p), k;
    switch (p.t) {
      case 'ball': {
        var b = sim ? sim.balls.filter(function (q) { return q.owner === p.id; })[0] : null;
        var bx = b ? b.x : x, by = b ? b.y : y, spin = b ? b.spin : 0;
        ballArt(bx, by, spin); break;
      }
      case 'ramp': {
        var sh = CW.shapes(p)[0];
        line(sh[0], sh[1], sh[2], sh[3], 9, C.woodD); line(sh[0], sh[1], sh[2], sh[3], 6, C.wood);
        ctx.fillStyle = C.metalD; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill();
        break;
      }
      case 'block': {
        ctx.fillStyle = C.stone; ctx.fillRect(x, y, p.a, p.n);
        ctx.strokeStyle = C.stoneD; ctx.lineWidth = 1.5; ctx.strokeRect(x + .75, y + .75, p.a - 1.5, p.n - 1.5);
        ctx.beginPath();
        for (var yy = y + 20, row = 0; yy < y + p.n; yy += 20, row++) { ctx.moveTo(x, yy); ctx.lineTo(x + p.a, yy); for (var xx = x + (row % 2 ? 20 : 10); xx < x + p.a; xx += 40) { ctx.moveTo(xx, yy - 20); ctx.lineTo(xx, yy); } }
        ctx.lineWidth = 1; ctx.globalAlpha = alpha * .5; ctx.stroke();
        break;
      }
      case 'dominoes':
        for (i = 0; i < p.n; i++) {
          var kk = ks && ks[i], d = p.a, piv = x + d * i * CW.DOM.pitch + d * CW.DOM.w / 2, q = kk ? kk.q : 0;
          ctx.save(); ctx.translate(kk ? kk.px : piv, kk ? kk.py : y); ctx.rotate(q);
          var bx0 = d > 0 ? -CW.DOM.w : 0;
          ctx.fillStyle = C.cream; ctx.strokeStyle = C.creamD; ctx.lineWidth = 1.5;
          ctx.fillRect(bx0, -CW.DOM.h, CW.DOM.w, CW.DOM.h); ctx.strokeRect(bx0, -CW.DOM.h, CW.DOM.w, CW.DOM.h);
          ctx.fillStyle = C.creamD; ctx.fillRect(bx0 + 1, -CW.DOM.h / 2 - .5, CW.DOM.w - 2, 1);
          ctx.beginPath(); ctx.arc(bx0 + CW.DOM.w / 2, -CW.DOM.h * .75, 1.3, 0, 7); ctx.arc(bx0 + CW.DOM.w / 2, -CW.DOM.h * .25, 1.3, 0, 7); ctx.fill();
          ctx.restore();
        }
        break;
      case 'lever': {
        var top = y - CW.LEVER.h;
        ctx.fillStyle = C.metal; ctx.strokeStyle = C.metalD; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x - 15, y); ctx.lineTo(x, top); ctx.lineTo(x + 15, y); ctx.closePath(); ctx.fill(); ctx.stroke();
        k = ks && ks[0];
        var qq = k ? k.q : p.a * CW.LEVER.lim, hl = CW.LEVER.len / 2;
        ctx.save(); ctx.translate(x, top); ctx.rotate(qq);
        line(-hl, -3, hl, -3, 8, C.woodD); line(-hl, -3, hl, -3, 5, C.wood);
        line(p.a * hl, -3, p.a * hl, -12, 4, C.woodD);
        ctx.restore();
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, top, 3, 0, 7); ctx.fill();
        break;
      }
      case 'pulley': {
        k = ks && ks[0];
        var sq = k ? k.q : -CW.PULLEY.range, R = CW.PULLEY.r, ax = x + p.a * R, bx2 = x - p.a * R, top0 = y + CW.PULLEY.rope;
        var ya = top0 + sq, yb = top0 - sq;
        // mount
        line(x, y, x, Math.max(0, y - 40), 3, C.metalD);
        line(ax, y, ax, ya, 1.6, C.creamD); line(bx2, y, bx2, yb, 1.6, C.creamD);
        bucketArt(ax, ya, false); bucketArt(bx2, yb, true);
        ctx.save(); ctx.translate(x, y); ctx.rotate(sq / R);
        ctx.fillStyle = C.metal; ctx.strokeStyle = C.metalD; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 2; for (i = 0; i < 3; i++) { var an = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(-Math.cos(an) * R, -Math.sin(an) * R); ctx.lineTo(Math.cos(an) * R, Math.sin(an) * R); ctx.stroke(); }
        ctx.restore();
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
        break;
      }
      case 'spring': {
        var sp = sim ? sim.springs.filter(function (q) { return q.owner === p.id; })[0] : null, sqz = sp ? sp.squash : 0;
        var hgt = CW.SPRING.h * (1 - 0.35 * sqz), r = p.a * Math.PI / 180, tc = Math.cos(r) * 22, ts = Math.sin(r) * 22;
        line(x - 16, y - 2, x + 16, y - 2, 4, C.metalD);
        ctx.strokeStyle = C.metal; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y - 3);
        for (i = 1; i <= 6; i++) ctx.lineTo(x + (i % 2 ? 7 : -7), y - 3 - (hgt - 4) * i / 6);
        ctx.lineTo(x, y - hgt); ctx.stroke();
        line(x - tc, y - hgt - ts, x + tc, y - hgt + ts, 6, C.green);
        break;
      }
      case 'funnel': {
        var fs = CW.shapes(p);
        ctx.fillStyle = C.metal; ctx.globalAlpha = alpha * 0.22;
        ctx.beginPath(); ctx.moveTo(fs[0][0], fs[0][1]); ctx.lineTo(fs[0][2], fs[0][3]); ctx.lineTo(fs[2][2], fs[2][3]); ctx.lineTo(fs[3][2], fs[3][3]); ctx.lineTo(fs[1][2], fs[1][3]); ctx.lineTo(fs[1][0], fs[1][1]); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = alpha;
        fs.forEach(function (s) { line(s[0], s[1], s[2], s[3], 6, C.metalD); line(s[0], s[1], s[2], s[3], 3, C.metal); });
        break;
      }
      case 'cup': {
        var cw2 = CW.CUP.w / 2, ch = CW.CUP.h;
        ctx.fillStyle = C.green; ctx.globalAlpha = alpha * 0.15; ctx.fillRect(x - cw2, y - ch, CW.CUP.w, ch - 3); ctx.globalAlpha = alpha;
        ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - cw2, y - ch); ctx.lineTo(x - cw2, y - 3); ctx.lineTo(x + cw2, y - 3); ctx.lineTo(x + cw2, y - ch); ctx.stroke();
        break;
      }
      case 'bell': {
        var bl = sim ? sim.bells.filter(function (q) { return q.owner === p.id; })[0] : null;
        bellArt(x, y, bl ? bl.swing : 0, bl ? bl.rung : 0, bl && bl.cool > 0 ? bl.cool : 0);
        break;
      }
      case 'wedge': {
        ctx.fillStyle = C.wood; ctx.strokeStyle = C.woodD; ctx.lineWidth = 2; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(x - CW.WEDGE.w / 2, y); ctx.lineTo(x, y - CW.WEDGE.h); ctx.lineTo(x + CW.WEDGE.w / 2, y); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
      case 'screw': {
        var sc = sim ? sim.screws.filter(function (q) { return q.owner === p.id; })[0] : null, turn = sc ? sc.turn : 0;
        var hh = p.n * 40, w2 = CW.SCREW.w / 2;
        ctx.fillStyle = C.metal; ctx.globalAlpha = alpha * 0.18; ctx.fillRect(x - w2, y - hh, CW.SCREW.w, hh); ctx.globalAlpha = alpha;
        // the thread: slanted bars that climb as it turns
        ctx.save(); ctx.beginPath(); ctx.rect(x - w2 + 2, y - hh + 2, CW.SCREW.w - 4, hh - 4); ctx.clip();
        ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
        var off = (turn * 12) % 16;
        for (var ty = y + off; ty > y - hh - 20; ty -= 16) { ctx.beginPath(); ctx.moveTo(x - w2, ty); ctx.lineTo(x + w2, ty - 8); ctx.stroke(); }
        ctx.restore();
        line(x, y - hh, x, y, 3, C.metalD);
        CW.shapes(p).forEach(function (s) { line(s[0], s[1], s[2], s[3], 6, C.metalD); line(s[0], s[1], s[2], s[3], 3, C.metal); });
        // arrow at the outlet
        ctx.fillStyle = C.green; var ox = x + p.a * (w2 + 8), oy = y - hh + 16;
        ctx.beginPath(); ctx.moveTo(ox, oy - 5); ctx.lineTo(ox + p.a * 7, oy); ctx.lineTo(ox, oy + 5); ctx.closePath(); ctx.fill();
        break;
      }
      case 'wheel': {
        k = ks && ks[0];
        var wq = k ? k.q : 0, WR = CW.WHEEL.r;
        ctx.save(); ctx.translate(x, y); ctx.rotate(wq);
        ctx.strokeStyle = C.metal; ctx.lineWidth = 2; ctx.globalAlpha = alpha * 0.6; ctx.beginPath(); ctx.arc(0, 0, WR * 0.55, 0, 7); ctx.stroke(); ctx.globalAlpha = alpha;
        for (i = 0; i < 4; i++) { var a2 = i * Math.PI / 2 + Math.PI / 4; line(0, 0, Math.cos(a2) * WR, Math.sin(a2) * WR, 7, C.woodD); line(0, 0, Math.cos(a2) * WR, Math.sin(a2) * WR, 4, C.wood); }
        ctx.restore();
        ctx.fillStyle = C.metalD; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
        ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
        break;
      }
    }
    if (p.fixed && p.t !== 'block' && p.t !== 'ball') {
      // a small pin: this part is fixed
      var an2 = p.t === 'bell' ? [x + 16, y - 16] : CW.shapes(p)[0];
      var px = an2[0], py = an2[1];
      ctx.globalAlpha = alpha * 0.9; ctx.fillStyle = C.metalD; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, 7); ctx.fill();
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(px, py, 1.2, 0, 7); ctx.fill();
    }
    ctx.restore();
  }
  function ballArt(x, y, spin) {
    var r = CW.BALL_R, g = ctx.createRadialGradient(x - r * .35, y - r * .35, 1, x, y, r);
    g.addColorStop(0, C.ball); g.addColorStop(1, C.ballD);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x, y, r * .62, spin, spin + 1.3); ctx.stroke();
  }
  function bucketArt(cx, top, sand) {
    var w = CW.PULLEY.bw / 2, h = CW.PULLEY.bh;
    ctx.fillStyle = C.metal; ctx.strokeStyle = C.metalD; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx - w, top); ctx.lineTo(cx - w + 3, top + h); ctx.lineTo(cx + w - 3, top + h); ctx.lineTo(cx + w, top); ctx.closePath();
    ctx.globalAlpha *= 0.35; ctx.fill(); ctx.globalAlpha /= 0.35; ctx.stroke();
    if (sand) { ctx.fillStyle = C.sand; ctx.beginPath(); ctx.moveTo(cx - w + 3, top + 10); ctx.quadraticCurveTo(cx, top + 2, cx + w - 3, top + 10); ctx.lineTo(cx + w - 4.5, top + h - 1.5); ctx.lineTo(cx - w + 4.5, top + h - 1.5); ctx.closePath(); ctx.fill(); }
    line(cx - w, top, cx, top - 12, 1.2, C.metalD); line(cx + w, top, cx, top - 12, 1.2, C.metalD);
  }
  function bellArt(x, y, swing, rung, glow) {
    // a bracket from above, then the bell, which swings when it rings
    line(x, y - 15, x, y - 24, 3, C.metalD); line(x - 9, y - 24, x + 9, y - 24, 3, C.metalD);
    ctx.save(); ctx.translate(x, y - 15); ctx.rotate(Math.max(-0.6, Math.min(0.6, swing * 0.05)));
    ctx.fillStyle = C.gold; ctx.strokeStyle = C.goldD; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-8, 3, -9, 14); ctx.quadraticCurveTo(-11, 24, -16, 27); ctx.lineTo(16, 27); ctx.quadraticCurveTo(11, 24, 9, 14); ctx.quadraticCurveTo(8, 3, 5, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.goldD; ctx.beginPath(); ctx.arc(0, 29, 3.2, 0, 7); ctx.fill();
    ctx.restore();
    if (glow > 0) {
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.globalAlpha *= Math.min(1, glow * 4);
      for (var i = 1; i <= 2; i++) { ctx.beginPath(); ctx.arc(x, y, 18 + i * 7 + (0.25 - glow) * 30, -2.6, -0.5); ctx.stroke(); }
    }
  }

  // ---------- palette ----------
  function paletteTypes() {
    if (!S.lv.palette) return ORDER.slice();
    return ORDER.filter(function (t) { return S.lv.palette[t] !== undefined; });
  }
  function renderPalette() {
    var box = $('cw-pal'), types = paletteTypes();
    if (box.dataset.lv !== S.lv.id) {
      box.dataset.lv = S.lv.id; box.innerHTML = '';
      types.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button'; b.dataset.t = t;
        b.innerHTML = '<canvas width="96" height="64" aria-hidden="true"></canvas><span>' + (SHORT[t] || NAMES[t]) + '</span><i></i>';
        box.appendChild(b);
        wirePalette(b, t);
      });
      drawPalette();
    }
    Array.prototype.forEach.call(box.children, function (b) {
      var left = remaining(b.dataset.t), lab = b.querySelector('i');
      lab.textContent = left === Infinity ? '' : '×' + left;
      b.disabled = left <= 0 || S.running;
      b.setAttribute('aria-label', NAMES[b.dataset.t] + (left === Infinity ? '' : ', ' + left + ' left') + '. Drag it onto the stage, or press Enter to add it.');
    });
  }
  function drawPalette() {
    var box = $('cw-pal'); if (!box || !C.bg) return;
    Array.prototype.forEach.call(box.querySelectorAll('canvas'), function (cv) {
      var t = cv.parentNode.dataset.t, c2 = cv.getContext('2d');
      var save = ctx; ctx = c2;
      c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, 96, 64);
      var p = defaults(t), bb = iconBox(t);
      S.uid--;
      p.x = bb.x; p.y = bb.y; if (t === 'ramp') { p.a = 15; p.n = 4; } if (t === 'dominoes') p.n = 4; if (t === 'screw') p.n = 2;
      var s = Math.min(96 / bb.w, 64 / bb.h);
      c2.setTransform(s, 0, 0, s, 48 - p.x * s + bb.dx * s, 32 - p.y * s + bb.dy * s);
      drawPart(p, null, 1);
      ctx = save;
    });
  }
  function iconBox(t) {
    switch (t) {
      case 'ball': return { x: 100, y: 100, w: 40, h: 30, dx: 0, dy: 0 };
      case 'ramp': return { x: 100, y: 100, w: 170, h: 110, dx: 0, dy: 0 };
      case 'funnel': return { x: 100, y: 100, w: 110, h: 76, dx: 0, dy: -33 };
      case 'dominoes': return { x: 100, y: 100, w: 110, h: 70, dx: -36, dy: 20 };
      case 'lever': return { x: 100, y: 100, w: 175, h: 90, dx: 0, dy: 28 };
      case 'pulley': return { x: 100, y: 60, w: 130, h: 230, dx: 0, dy: -75 };
      case 'wheel': return { x: 100, y: 100, w: 105, h: 105, dx: 0, dy: 0 };
      case 'wedge': return { x: 100, y: 100, w: 100, h: 66, dx: 0, dy: 20 };
      case 'screw': return { x: 100, y: 100, w: 90, h: 100, dx: 0, dy: 40 };
      case 'spring': return { x: 100, y: 100, w: 60, h: 46, dx: 0, dy: 14 };
      case 'cup': return { x: 100, y: 100, w: 76, h: 54, dx: 0, dy: 20 };
      case 'bell': return { x: 100, y: 100, w: 54, h: 66, dx: 0, dy: -4 };
    }
    return { x: 100, y: 100, w: 100, h: 70, dx: 0, dy: 0 };
  }
  // Drag a new part from the palette (or tap it to add it at a good spot).
  function wirePalette(btn, t) {
    var moved = false, start = null;
    RD.attach(btn, {
      point: function (e) { return toWorld(e); },
      begin: function (pt, e) {
        if (S.running || remaining(t) <= 0) return null;
        moved = false; start = { x: e.clientX, y: e.clientY };
        var p = defaults(t);
        var d = moveSession(p, null, false);
        var inner = d.move;
        d.move = function (st, q) {
          if (!moved && start && Math.hypot(lastEv.clientX - start.x, lastEv.clientY - start.y) > 6) moved = true;
          if (!moved) return;
          if (!overStage(lastEv)) { S.drag.cur = null; draw(); return; }
          inner(st, q);
        };
        d.end = function (st) {
          var dd = S.drag; S.drag = null;
          if (!moved) { addAtBest(p); return; }
          if (!dd || !dd.cur || !overStage(lastEv)) { draw(); schedulePath(); return; }
          place(Object.assign({}, st));
        };
        d.cancel = function () { S.drag = null; draw(); schedulePath(); };
        return d;
      }
    });
    btn.addEventListener('pointermove', function (e) { lastEv = e; }, true);
    btn.addEventListener('pointerdown', function (e) { lastEv = e; }, true);
    btn.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !btn.disabled) { e.preventDefault(); addAtBest(defaults(t)); can.focus(); }
    });
  }
  var lastEv = { clientX: 0, clientY: 0 };
  function addAtBest(p) {
    var others0 = S.parts, sts = CW.candidates(p, others0);
    if (!sts.length) { say('There is no room for the ' + NAMES[p.t].toLowerCase() + '. Move or remove a part first.'); return; }
    // prefer a spot that connects, nearest the middle of the stage
    var best = null, bd = Infinity;
    sts.forEach(function (q) { var d = Math.hypot(q.x - W / 2, q.y - H / 2) - (CW.connects(q, others0) ? 400 : 0); if (d < bd) { bd = d; best = q; } });
    place(best);
  }
  function place(p) {
    delete p.bonus;
    S.parts.push(p); S.sel = p;
    renderSel(); changed();
    say(NAMES[p.t] + ' added. ' + (handleOf(p) ? handleOf(p).tip : ''));
  }

  // ---------- moving parts on the stage ----------
  function moveSession(p, orig, grab) {
    var oth = orig ? others(orig) : S.parts.slice(), sts = CW.candidates(p, oth), okSet = {};
    sts.forEach(function (q) { q.bonus = CW.connects(q, oth) ? 1 : 0; okSet[q.x + ',' + q.y] = 1; });
    var d = { kind: 'move', part: orig, cur: null, states: sts, okSet: okSet, supported: CW.TYPES[p.t].supported, grey: true };
    S.drag = d;
    return {
      states: sts, at: anchorOf, bonus: function (q) { return q.bonus ? 16 : 0; }, grab: grab ? anchorOf(p) : null,
      move: function (st) {
        if (d.cur !== st) { d.cur = st; schedulePath(oth.concat([st])); }
        draw();
      },
      end: function (st) {
        S.drag = null;
        if (orig) { var i = S.parts.indexOf(orig); var np = Object.assign({}, st); delete np.bonus; S.parts[i] = np; S.sel = np; }
        renderSel(); changed();
      },
      cancel: function () { S.drag = null; draw(); schedulePath(); }
    };
  }
  RD.attach(can, {
    point: toWorld,
    begin: function (pt, e) {
      can.focus({ preventScroll: true });
      if (S.running) { return null; }
      var slop = e.pointerType === 'touch' ? 14 : 7;
      // a handle?
      if (S.sel) {
        var h = handleOf(S.sel);
        if (h) {
          var hp = h.at(S.sel);
          if (Math.hypot(hp.x - pt.x, hp.y - pt.y) < slop + 9) {
            var orig = S.sel, d = { kind: 'handle', cur: orig, part: orig };
            S.drag = d;
            return { states: h.states, at: h.at, grab: hp,
              move: function (st) { if (d.cur !== st) { d.cur = st; var i = S.parts.indexOf(orig); schedulePath(S.parts.slice(0, i).concat([st], S.parts.slice(i + 1))); } draw(); },
              end: function (st) { S.drag = null; var i = S.parts.indexOf(orig); S.parts[i] = Object.assign({}, st); S.sel = S.parts[i]; renderSel(); changed(); },
              cancel: function () { S.drag = null; draw(); schedulePath(); } };
          }
        }
      }
      var p = hitPart(pt, slop);
      if (!p) { if (S.sel) { S.sel = null; renderSel(); draw(); } return null; }
      if (p.fixed) { S.sel = null; renderSel(); say('That ' + NAMES[p.t].toLowerCase() + ' is part of the level and can’t be moved.'); draw(); return null; }
      S.sel = p; renderSel();
      return moveSession(p, p, true);
    }
  });

  // ---------- keyboard ----------
  can.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === ' ' ) { e.preventDefault(); run(); return; }
    if (k === 'Escape') { if (S.running) { stop(); } else { S.sel = null; renderSel(); draw(); } return; }
    if (S.running) { if (k === 's' || k === 'S') stepOnce(); return; }
    if (k === ']' || k === '[' || k === 'n' || k === 'N') {
      var mov = S.parts.filter(function (p) { return !p.fixed; });
      if (!mov.length) { say('Add a part from the palette first.'); return; }
      var i = mov.indexOf(S.sel); i = (k === '[' ? i - 1 + mov.length : i + 1) % mov.length;
      S.sel = mov[i]; renderSel(); draw(); e.preventDefault(); return;
    }
    if (!S.sel) { if (k.indexOf('Arrow') === 0) say('Press N to pick a part, or add one from the palette.'); return; }
    var p = S.sel;
    if (k.indexOf('Arrow') === 0) {
      e.preventDefault();
      if (!S.keyStates || S.keyStates.id !== p.id) S.keyStates = { id: p.id, list: CW.candidates(p, others(p)) };
      var dx = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0, dy = k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0;
      var nx = RD.toward(S.keyStates.list, anchorOf, anchorOf(p), dx, dy);
      if (nx) { replaceSel(Object.assign({}, nx)); } else say('It can’t go further that way.');
      return;
    }
    if (k === 'r' || k === 'R') { e.preventDefault(); turn(p); return; }
    if (k === '+' || k === '=' || k === '-' || k === '_') { e.preventDefault(); resize(p, k === '+' || k === '=' ? 1 : -1); return; }
    if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); remove(p); return; }
  });
  function replaceSel(np) {
    var i = S.parts.indexOf(S.sel); if (i < 0) return;
    S.parts[i] = np; S.sel = np; S.keyStates = null; renderSel(); changed();
    describeSel();
  }
  function turn(p) {
    var T = CW.TYPES[p.t], tries = [];
    if (T.angles) { var ix = T.angles.indexOf(p.a); for (var j = 1; j < T.angles.length; j++) tries.push(Object.assign({}, p, { a: T.angles[(ix + j) % T.angles.length] })); }
    else if (['dominoes', 'lever', 'pulley', 'screw'].indexOf(p.t) >= 0) tries.push(Object.assign({}, p, { a: -p.a }));
    else { say('The ' + NAMES[p.t].toLowerCase() + ' has nothing to turn.'); return; }
    for (var i = 0; i < tries.length; i++) if (CW.placeOK(tries[i], others(p))) { replaceSel(tries[i]); return; }
    say('There isn’t room to turn it here.');
  }
  function resize(p, d) {
    var T = CW.TYPES[p.t];
    if (!T.sizes) { say('The ' + NAMES[p.t].toLowerCase() + ' comes in one size.'); return; }
    var ix = T.sizes.indexOf(p.n) + d;
    while (ix >= 0 && ix < T.sizes.length) {
      var q = Object.assign({}, p, { n: T.sizes[ix] });
      if (CW.placeOK(q, others(p))) { replaceSel(q); return; }
      ix += d;
    }
    say(d > 0 ? 'It can’t get bigger here.' : 'That is the smallest it goes.');
  }
  function remove(p) {
    var i = S.parts.indexOf(p); if (i < 0 || p.fixed) return;
    S.parts.splice(i, 1); S.sel = null; renderSel(); changed();
    say(NAMES[p.t] + ' removed.');
  }

  // ---------- panels ----------
  function starStr(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '<span class="off">★</span>'; return s; }
  function renderLevels() {
    var sel = $('cw-level'), v = sel.value; sel.innerHTML = '';
    LEVELS.forEach(function (l, i) {
      var o = document.createElement('option'); o.value = l.id;
      var st = S.stars[l.id] || 0;
      o.textContent = l.sandbox ? 'Sandbox' : i + '. ' + l.name + (st ? '  ' + '★★★'.slice(0, st) + '☆☆☆'.slice(0, 3 - st) : '');
      sel.appendChild(o);
    });
    if (v) sel.value = v;
  }
  function renderTop() {
    var lv = S.lv, g = $('cw-goal');
    if (lv.sandbox) g.innerHTML = '<b>Sandbox.</b> Build anything; the panel below names the machines it uses.';
    else g.innerHTML = '<b>' + lv.goalText + '</b> <span class="cw-stars" aria-label="Best: ' + (S.stars[lv.id] || 0) + ' of 3 stars">' + starStr(S.stars[lv.id] || 0) + '</span>';
  }
  function renderSel() {
    var p = S.sel, box = $('cw-tools'), nm = $('cw-selname');
    if (!p) { nm.textContent = S.running ? 'Running…' : 'Tap a part to select it.'; box.hidden = true; return; }
    nm.textContent = NAMES[p.t] + ' selected'; box.hidden = false;
    var T = CW.TYPES[p.t];
    $('cw-turn').disabled = !(T.angles || ['dominoes', 'lever', 'pulley', 'screw'].indexOf(p.t) >= 0);
    $('cw-bigger').disabled = $('cw-smaller').disabled = !T.sizes;
  }
  function describeSel() {
    var p = S.sel; if (!p) return;
    var t = NAMES[p.t] + ' at column ' + Math.round(p.x / 40) + ', row ' + Math.round(p.y / 40);
    if (p.t === 'ramp') t += ', tilted ' + Math.abs(p.a) + ' degrees ' + (p.a > 0 ? 'down to the right' : p.a < 0 ? 'down to the left' : '(level)') + ', ' + p.n + ' cells long';
    if (p.t === 'dominoes') t += ', ' + p.n + ' dominoes falling ' + (p.a > 0 ? 'right' : 'left');
    if (p.t === 'screw') t += ', ' + p.n + ' cells tall';
    $('cw-live').textContent = t + '.';
  }
  function renderBar() {
    var b = $('cw-run');
    b.innerHTML = S.running ? (S.paused ? '▶ Resume' : '❚❚ Pause') : '▶ Run';
    b.setAttribute('aria-label', S.running ? (S.paused ? 'Resume' : 'Pause') : 'Run the machine');
    $('cw-reset').disabled = !S.running;
    $('cw-clear').disabled = S.running;
    $('cw-slow').checked = S.slow;
    $('cw-path').setAttribute('aria-pressed', S.showPath ? 'true' : 'false');
    if (!S.running) $('cw-time').textContent = '0.0 s';
    renderPalette(); renderSel();
  }
  function renderInfo() {
    var has = {}, used = (S.running && S.lastRun) ? S.lastRun.used : {};
    S.parts.forEach(function (p) { var m = CW.TYPES[p.t].machine; if (m) has[m] = true; });
    var n = 0;
    $('cw-mach').innerHTML = '<span class="cw-h">Simple machines</span> ' + CW.MACHINES.map(function (m) {
      var u = used[m.k]; if (u) n++;
      return '<span class="cw-chip' + (u ? ' used' : has[m.k] ? ' has' : '') + '" title="' + m.name + ': ' + m.part + '">' + (u ? '✓ ' : '') + m.name + '</span>';
    }).join(' ') + (S.running ? ' <span>' + n + ' of 6 working</span>' : '');
    var ch = $('cw-chain');
    if (S.running && S.lastRun) {
      var r = S.lastRun, byId = {}; S.parts.forEach(function (p) { byId[p.id] = p; });
      var names = r.chain.map(function (id) { var p = byId[id]; return p ? (p.fixed && p.t === 'ramp' ? 'Shelf' : NAMES[p.t]) : '?'; });
      var rung = r.rings.length ? ' → <b>Bell!</b>' : '';
      ch.innerHTML = '<b>Chain:</b> ' + (names.length ? names.join(' → ') : '…') + rung + ' <span>(' + r.steps + ' step' + (r.steps === 1 ? '' : 's') + (r.rings.length ? ' before the bell' : '') + ')</span>';
    } else {
      ch.innerHTML = S.lv.sandbox ? 'Press <b>Run</b> to watch the chain of steps.' : '<b>Goal:</b> ' + S.lv.goalText + (S.lv.par ? ' Use ' + S.lv.par + ' part' + (S.lv.par > 1 ? 's' : '') + ' or fewer for the second star. ' + S.lv.bonusText : '');
    }
  }

  // ---------- overlays ----------
  function overlay(html, focusSel) {
    var ov = $('cw-ov');
    ov.innerHTML = '<div class="cw-card" role="dialog" aria-modal="true" aria-labelledby="cw-ovh">' + html + '</div>';
    ov.hidden = false;
    var f = ov.querySelector(focusSel || 'button'); if (f) f.focus();
    ov.onclick = function (e) {
      var a = e.target.closest('[data-act]'); if (!a) return;
      var act = a.dataset.act;
      if (act === 'close') closeOv(e.detail === 0);
      if (act === 'next') { closeOv(); var i = LEVELS.indexOf(S.lv); openLevel(LEVELS[Math.min(LEVELS.length - 1, i + 1)].id); }
      if (act === 'again') { closeOv(); stop(); }
      if (act === 'copy') { var inp = ov.querySelector('input'); inp.select(); try { navigator.clipboard.writeText(inp.value).then(function () { a.textContent = 'Copied'; }, function () { a.textContent = 'Select and copy'; }); } catch (err) { a.textContent = 'Select and copy'; } }
    };
  }
  function closeOv(kb) { $('cw-ov').hidden = true; $('cw-ov').innerHTML = ''; if (kb) can.focus({ preventScroll: true }); }
  function showIntro() {
    var lv = S.lv;
    overlay('<h3 id="cw-ovh">' + (lv.sandbox ? 'Sandbox' : lv.name) + '</h3><p>' + lv.intro + '</p>' +
      (lv.sandbox ? '' : '<p><b>Goal:</b> ' + lv.goalText + '</p><p class="no">★ the goal · ★ ' + lv.par + ' part' + (lv.par > 1 ? 's' : '') + ' or fewer · ★ ' + lv.bonusText + '</p>') +
      '<div class="row"><button type="button" class="cw-btn cw-pri" data-act="close">Start building</button></div>');
  }
  function showWin(st, r) {
    var lv = S.lv, t = CW.goalTime(lv.goal, r);
    overlay('<h3 id="cw-ovh">' + (st.n === 3 ? 'Perfect!' : 'You did it!') + '</h3><p class="cw-stars" aria-label="' + st.n + ' of 3 stars">' + starStr(st.n) + '</p>' +
      '<ul><li class="ok">✓ ' + lv.goalText + (t !== null ? ' (' + t.toFixed(1) + ' s)' : '') + '</li>' +
      '<li class="' + (st.par ? 'ok' : 'no') + '">' + (st.par ? '✓' : '✗') + ' ' + lv.par + ' part' + (lv.par > 1 ? 's' : '') + ' or fewer</li>' +
      '<li class="' + (st.bonus ? 'ok' : 'no') + '">' + (st.bonus ? '✓' : '✗') + ' ' + lv.bonusText + '</li></ul>' +
      '<p>Chain: ' + r.steps + ' step' + (r.steps === 1 ? '' : 's') + '. Machines that moved: ' + (Object.keys(r.used).map(function (k) { return CW.MACHINES.filter(function (m) { return m.k === k; })[0].name.toLowerCase(); }).join(', ') || 'none') + '.</p>' +
      '<div class="row">' + (LEVELS.indexOf(lv) < LEVELS.length - 1 ? '<button type="button" class="cw-btn cw-pri" data-act="next">Next level</button>' : '') +
      '<button type="button" class="cw-btn" data-act="close">Watch it</button><button type="button" class="cw-btn" data-act="again">Back to building</button></div>');
  }
  function showHelp() {
    overlay('<h3 id="cw-ovh">How to play</h3>' +
      '<ul><li>Drag a part from the palette onto the stage, or tap it to drop it in a good spot. Gray areas are where it can’t go; gold dots are spots where it would take the motion from a neighbor.</li>' +
      '<li>Drag a part to move it. Select it to see its knob: drag the knob to turn a ramp, add dominoes or make the screw lift taller.</li>' +
      '<li>The dotted line shows where the balls will roll. Press <b>Run</b> to set it going, <b>Step</b> to go a tenth of a second at a time, and <b>Reset</b> to put everything back.</li>' +
      '<li>Keyboard: click the stage, then N picks the next part, arrows move it, R turns it, + and − change its size, Delete removes it, Space runs, S steps, Esc stops.</li></ul>' +
      '<p>The six classical simple machines are the lever, the wheel and axle, the pulley, the inclined plane, the wedge and the screw. The panel lights up each one that moves while your machine runs.</p>' +
      '<div class="row"><button type="button" class="cw-btn cw-pri" data-act="close">Close</button></div>');
  }
  function share() {
    var url = location.href.split('#')[0] + '#lv=' + S.lv.id + '&m=' + CW.encode(S.parts);
    overlay('<h3 id="cw-ovh">Share this machine</h3><p>Anyone who opens this link sees your layout for this level.</p><input type="text" readonly value="' + url.replace(/"/g, '&quot;') + '" aria-label="Link to this machine"><div class="row"><button type="button" class="cw-btn cw-pri" data-act="copy">Copy link</button><button type="button" class="cw-btn" data-act="close">Close</button></div>', 'input');
  }
  function say(t) { S.note = t; S.noteT = performance.now() + 2600; $('cw-live').textContent = t; draw(); setTimeout(draw, 2700); }

  // ---------- wiring ----------
  renderLevels();
  $('cw-level').addEventListener('change', function () { openLevel(this.value); });
  $('cw-run').addEventListener('click', run);
  $('cw-step').addEventListener('click', stepOnce);
  $('cw-reset').addEventListener('click', function () { stop(); });
  $('cw-slow').addEventListener('change', function () { S.slow = this.checked; save('slow', S.slow); });
  $('cw-path').addEventListener('click', function () { S.showPath = !S.showPath; save('path', S.showPath); renderBar(); schedulePath(); });
  $('cw-clear').addEventListener('click', function () {
    S.parts = S.parts.filter(function (p) { return p.fixed; }); S.sel = null; renderSel(); changed(); say('Cleared your parts.');
  });
  $('cw-share').addEventListener('click', share);
  $('cw-help').addEventListener('click', showHelp);
  $('cw-turn').addEventListener('click', function () { if (S.sel) turn(S.sel); });
  $('cw-bigger').addEventListener('click', function () { if (S.sel) resize(S.sel, 1); });
  $('cw-smaller').addEventListener('click', function () { if (S.sel) resize(S.sel, -1); });
  $('cw-del').addEventListener('click', function () { if (S.sel) remove(S.sel); });
  $('cw-ov').addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOv(true); });
  document.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (!$('cw-ov').hidden) return;
    if (document.activeElement === can) return;
    if (e.key === ' ' && root.contains(document.activeElement) && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); run(); }
  });
  // the stage's focus ring shows only for keyboard users
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab') root.classList.add('kb'); }, true);
  document.addEventListener('pointerdown', function () { root.classList.remove('kb'); }, true);
  new MutationObserver(function () { theme(); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  if (window.ResizeObserver) new ResizeObserver(function () { size(); }).observe(stage); else window.addEventListener('resize', size);
  theme();

  var m = /lv=([a-z0-9-]+)/.exec(location.hash), mm = /[&#]m=([a-z0-9.\-]*)/.exec(location.hash);
  var start = m ? m[1] : load('level', 'first-ring');
  if (!LEVELS.some(function (l) { return l.id === start; })) start = 'first-ring';
  size();
  openLevel(start, mm ? mm[1] : undefined);
  renderBar();
})();
