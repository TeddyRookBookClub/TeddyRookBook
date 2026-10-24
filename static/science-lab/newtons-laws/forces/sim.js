/* Newton's Laws, Chapter 4: Forces at Work. Four interactive pieces on one page:
   1. the ramp lab (main simulation, with missions), 2. the elevator scale, 3. the Atwood machine, 4. the free-body-diagram builder.
   The models are in physics.js (window.NL4Phys) and tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, P = W.NL4Phys, root = D.getElementById('nl4-lab');
  if (!root || !L || !P) return;
  function $(id) { return D.getElementById(id); }
  var DEG = Math.PI / 180, fmt = L.fmt, reduced = L.reduced, GG = P.G;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', cyan: '#66d9e8', lime: '#c0eb75', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', panel: 'rgba(11,27,39,.9)' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fN(v) { return fmt(v, Math.abs(v) < 100 ? 1 : 0) + ' N'; }
  function grp(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- drawing helpers ---------- */
  function arrow(c, x, y, dx, dy, col, o) {
    o = o || {};
    var len = Math.hypot(dx, dy); if (len < 2) return;
    var ux = dx / len, uy = dy / len, hw = o.head || clamp(3 + len * 0.16, 5, 10), lw = o.width || 3;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.glow) { c.shadowColor = col; c.shadowBlur = 9; }
    if (o.dash) c.setLineDash(o.dash);
    var bx = x + dx - ux * hw * 1.3, by = y + dy - uy * hw * 1.3;
    c.beginPath(); c.moveTo(x, y); c.lineTo(bx, by); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x + dx, y + dy);
    c.lineTo(x + dx - ux * hw * 1.9 - uy * hw * 0.85, y + dy - uy * hw * 1.9 + ux * hw * 0.85);
    c.lineTo(x + dx - ux * hw * 1.9 + uy * hw * 0.85, y + dy - uy * hw * 1.9 - ux * hw * 0.85);
    c.closePath(); c.fill(); c.restore();
  }
  function label(c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = (o.bold ? '600 ' : '') + (o.size || 12) + 'px system-ui,-apple-system,"Segoe UI",sans-serif';
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); c.restore();
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function bg(c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function seg(groupEl, attr, val) { groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === val)); }); }
  function setRange(el, out, v, text) { el.value = v; if (out) out.textContent = text; }

  /* =====================================================================================
     1. THE RAMP LAB
     ===================================================================================== */
  (function () {
    var view = $('nl4-view'), cv = $('nl4-cv'), hud = $('nl4-hud'); if (!cv) return;
    var G4 = L.canvas(cv), c = G4.c, store = L.store('nl4');
    var LEN = 6, X0 = 3.0, SHOVE = 1.0, TMAX = 75;
    var el = { mat: $('nl4-mat'), th: $('nl4-th'), thO: $('nl4-th-o'), m: $('nl4-m'), mO: $('nl4-m-o'), p: $('nl4-p'), pO: $('nl4-p-o'),
      comp: $('nl4-comp'), net: $('nl4-net'), read: $('nl4-read'), pre: $('nl4-pre') };
    var S = { mat: store.get('mat', 'wood'), th: store.get('th', 20), m: store.get('m', 10), P: 0, comp: store.get('comp', true) !== false, net: store.get('net', true) !== false,
      x: X0, v: 0, t: 0, paused: false, slow: false, hist: [], parts: [], pop: 0, popText: '', off: 0, offMsg: '', drag: false,
      sawUp: false, sawDown: false, glideT: 0, shoveT: 0, holdT: 0, F: null, lastA: 0 };
    if (!P.MATERIALS.some(function (m) { return m.id === S.mat; })) S.mat = 'wood';
    el.mat.innerHTML = P.MATERIALS.map(function (m) { return '<option value="' + m.id + '">' + m.name + ' (μs ' + m.us + ', μk ' + m.uk + ')</option>'; }).join('');
    function params() { var mt = P.material(S.mat); return { m: S.m, theta: S.th * DEG, us: mt.us, uk: mt.uk, P: S.P }; }
    function sync() {
      el.mat.value = S.mat;
      setRange(el.th, el.thO, S.th, fmt(S.th, 1) + '°');
      setRange(el.m, el.mO, S.m, fmt(S.m, S.m < 10 ? 1 : 0) + ' kg');
      setRange(el.p, el.pO, S.P, S.P === 0 ? 'none' : fmt(Math.abs(S.P), 1) + ' N ' + (S.P > 0 ? 'uphill' : 'downhill'));
      el.comp.checked = S.comp; el.net.checked = S.net;
      el.pre.querySelectorAll('button').forEach(function (b) { var pr = PRE[b.dataset.pre]; b.setAttribute('aria-pressed', String(pr.mat === S.mat && pr.m === S.m && pr.th === S.th)); });
      store.set('mat', S.mat); store.set('th', S.th); store.set('m', S.m); store.set('comp', S.comp); store.set('net', S.net);
    }
    var PRE = { crate: { mat: 'wood', m: 20, th: 15 }, tire: { mat: 'rubber', m: 10, th: 30 }, sled: { mat: 'snow', m: 30, th: 5 }, skate: { mat: 'steelice', m: 5, th: 1 } };
    function resetBlock() { S.x = X0; S.v = 0; S.off = 0; S.hist.length = 0; S.sawUp = S.sawDown = false; S.glideT = S.shoveT = S.holdT = 0; S.parts.length = 0; }
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var pr = PRE[b.dataset.pre]; S.mat = pr.mat; S.m = pr.m; S.th = pr.th; S.P = 0; resetBlock(); sync(); });
    el.mat.addEventListener('change', function () { S.mat = el.mat.value; sync(); });
    el.th.addEventListener('input', function () { S.th = +el.th.value; sync(); });
    el.m.addEventListener('input', function () { S.m = +el.m.value; sync(); });
    el.p.addEventListener('input', function () { S.P = +el.p.value; sync(); });
    el.comp.addEventListener('change', function () { S.comp = el.comp.checked; sync(); });
    el.net.addEventListener('change', function () { S.net = el.net.checked; sync(); });
    $('nl4-nopush').addEventListener('click', function () { S.P = 0; sync(); });
    function shove(d) { if (S.off) return; S.v += d * SHOVE; S.pop = 0.8; S.popText = d > 0 ? 'shove ▲' : 'shove ▼'; }
    $('nl4-up').addEventListener('click', function () { shove(1); });
    $('nl4-down').addEventListener('click', function () { shove(-1); });
    var bPause = $('nl4-pause'), bSlow = $('nl4-slow');
    function setPause(p) { S.paused = p; bPause.textContent = p ? '▶' : '❚❚'; bPause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
    bPause.addEventListener('click', function () { setPause(!S.paused); });
    bSlow.addEventListener('click', function () { S.slow = !S.slow; bSlow.setAttribute('aria-pressed', String(S.slow)); });
    $('nl4-reset').addEventListener('click', function () { resetBlock(); setPause(false); });

    /* missions */
    var MIS = [
      { id: 'slip', title: 'Where does rubber slip?', goal: 'Rubber on dry concrete, no push: tilt the ramp until the block just starts to slide.' },
      { id: 'flip', title: 'Friction changes its mind', goal: 'Without letting the block move, use the push to make static friction point up the ramp and then down it.' },
      { id: 'half', title: 'Not always mg', goal: 'Make the normal force exactly half of the block’s weight.' },
      { id: 'glide', title: 'Steady slide', goal: 'With no push, keep a block sliding down at a steady speed for 1.5 seconds.' },
      { id: 'steady', title: 'Steady push uphill', goal: 'Push the block up the ramp at a steady speed for 1.5 seconds.' },
      { id: 'hold', title: 'The least force that holds it', goal: 'On a slope where the block slides, hold it still with a push no more than 2 N above the least that works.' }
    ];
    var M = L.missions($('nl4-missions'), 'nl4', MIS, function (id) {
      setPause(false); S.P = 0;
      if (id === 'slip') { S.mat = 'rubber'; S.m = 10; S.th = 30; L.toast(view, 'Tilt slowly: drag the top of the ramp, use the slider, or press → on the picture.'); }
      if (id === 'flip') { S.mat = 'wood'; S.m = 10; S.th = 15; L.toast(view, 'Raise the push slowly and watch the red friction arrow.'); }
      if (id === 'half') { S.mat = 'wood'; S.th = 20; L.toast(view, 'Watch the blue normal-force arrow as you tilt.'); }
      if (id === 'glide') { S.mat = 'wood'; S.m = 10; S.th = 10; L.toast(view, 'Shove it down (▼), then find the angle where it neither speeds up nor slows down.'); }
      if (id === 'steady') { S.mat = 'wood'; S.m = 10; S.th = 20; L.toast(view, 'Find the push that keeps it sliding up at a steady speed. Set a push, then shove it up with ▲.'); }
      if (id === 'hold') { S.mat = 'wood'; S.m = 10; S.th = 40; var p = params(); S.P = Math.round(P.holdMin(p) + 20); L.toast(view, 'Ease the push down, but don’t let it slip.'); }
      resetBlock(); sync(); bringIntoView();
    });
    function bringIntoView() { var r = view.getBoundingClientRect(); if (r.top < 0 || r.bottom > (W.innerHeight || 800)) view.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }
    function win(id, text) { if (M.done(id)) { L.toast(view, '★ ' + text); S.pop = 1.4; S.popText = '★'; } }
    function checkMissions(F, h, slipped) {
      var mt = P.material(S.mat);
      if (slipped && S.mat === 'rubber' && Math.abs(S.P) < 0.25 && S.th <= 46.5) win('slip', 'It slips just past 45°: tan 45° = 1.0, the μs of rubber on dry concrete.');
      if (S.v === 0 && F.kind === 'static') {
        if (F.f > 0.5) S.sawUp = true;
        if (F.f < -0.5) S.sawDown = true;
        if (S.sawUp && S.sawDown) win('flip', 'Static friction pushes whichever way stops the slide, and only as hard as it must.');
      } else { S.sawUp = S.sawDown = false; }
      if (Math.abs(F.N / F.W - 0.5) < 0.003) win('half', 'At 60°, N = mg cos 60° = half the weight. The normal force is not always mg.');
      var steady = Math.abs(F.a) < 0.08 || Math.abs(F.net) < 0.6;
      S.glideT = (S.v < -0.05 && Math.abs(S.P) < 0.25 && steady) ? S.glideT + h : 0;
      if (S.glideT > 1.5) win('glide', 'Steady at ' + fmt(S.th, 1) + '°: tan θ = ' + fmt(Math.tan(S.th * DEG), 2) + ' ≈ μk = ' + mt.uk + '. Zero net force, constant speed.');
      S.shoveT = (S.v > 0.05 && S.P > 0 && steady) ? S.shoveT + h : 0;
      if (S.shoveT > 1.5) win('steady', 'A steady ' + fmt(S.P, 1) + ' N keeps it going; starting it took more. μs > μk.');
      var hp = params(), pmin = P.holdMin(hp);
      S.holdT = (S.v === 0 && F.kind === 'static' && S.th > P.slipAngle(mt.us) / DEG + 2 && S.P > 0 && S.P - pmin <= 2) ? S.holdT + h : 0;
      if (S.holdT > 1) win('hold', 'Held with ' + fmt(S.P, 1) + ' N. The least possible is mg(sin θ − μs cos θ) = ' + fmt(pmin, 1) + ' N.');
    }

    /* layout (recomputed each frame from the canvas size) */
    var Lo = {};
    function layout() {
      var w = G4.w, h = G4.h, narrow = w < 560;
      Lo.w = w; Lo.h = h; Lo.narrow = narrow;
      Lo.bot = narrow ? 70 : 66;
      Lo.gx = narrow ? 16 : 26; Lo.gy = h - Lo.bot - 14;
      Lo.Lpx = Math.min(w - Lo.gx - 24, (Lo.gy - 30) / Math.sin(TMAX * DEG));
      Lo.sc = Lo.Lpx / LEN;
      Lo.ins = clamp(Math.min(w * (narrow ? 0.42 : 0.3), h * 0.42), 136, 240);
      Lo.ix = w - Lo.ins - 10; Lo.iy = 54;
    }
    function rampPt(xm, off) { // point at distance xm (m) up the ramp, raised off px above its surface
      var th = S.th * DEG, s = Lo.sc;
      return { x: Lo.gx + Math.cos(th) * xm * s - Math.sin(th) * off, y: Lo.gy - Math.sin(th) * xm * s - Math.cos(th) * off };
    }
    function blockSize() { var k = Math.cbrt(S.m / 10), u = Math.max(Lo.sc, 52); return { w: clamp(0.95 * k, 0.5, 1.5) * u, h: clamp(0.66 * k, 0.36, 1.05) * u }; }

    /* the looks of the materials: ramp surface and block */
    var LOOK = {
      rubber: { ramp: '#7d858c', rampHi: '#9aa3ab', block: '#2b2f33', blockHi: '#444a50', ink: '#cfd6dc' },
      shoe: { ramp: '#8a5a33', rampHi: '#a8774b', block: '#5a3d6e', blockHi: '#7a5a92', ink: '#f3e8ff' },
      steel: { ramp: '#6f8796', rampHi: '#9db4c2', block: '#8ea3b0', blockHi: '#c2d2dc', ink: '#0d1b24' },
      wood: { ramp: '#8a5a33', rampHi: '#a8774b', block: '#b07a43', blockHi: '#d39b5f', ink: '#2b1a0b' },
      ski: { ramp: '#dfeaf2', rampHi: '#ffffff', block: '#c0612d', blockHi: '#e07f45', ink: '#fff' },
      teflon: { ramp: '#6f8796', rampHi: '#9db4c2', block: '#eef2f5', blockHi: '#ffffff', ink: '#1a2a35' }
    };
    function lookFor() {
      var mt = P.material(S.mat), lk = LOOK[mt.look] || LOOK.wood, r = {};
      for (var k in lk) r[k] = lk[k];
      if (/concrete/.test(mt.name)) { r.ramp = mt.id === 'rubberwet' ? '#4d5862' : '#7d858c'; r.rampHi = mt.id === 'rubberwet' ? '#6c7b88' : '#a0a8af'; }
      if (/ice/.test(mt.name)) { r.ramp = '#9fd3f0'; r.rampHi = '#e4f6ff'; }
      if (/snow/.test(mt.name)) { r.ramp = '#dfeaf2'; r.rampHi = '#ffffff'; }
      if (/on wood/.test(mt.name)) { r.ramp = '#8a5a33'; r.rampHi = '#a8774b'; }
      if (/on steel/.test(mt.name)) { r.ramp = '#5f7684'; r.rampHi = '#93aab8'; }
      return r;
    }

    function draw() {
      layout();
      var w = Lo.w, h = Lo.h, th = S.th * DEG, p = params(), F = S.F || P.rampForces(S.v, p), lk = lookFor();
      bg(c, w, h);
      // faint grid
      c.strokeStyle = 'rgba(120,170,200,.06)'; c.lineWidth = 1; c.beginPath();
      for (var gx = 0; gx < w; gx += 40) { c.moveTo(gx + 0.5, 0); c.lineTo(gx + 0.5, Lo.gy); }
      for (var gy = Lo.gy; gy > 0; gy -= 40) { c.moveTo(0, gy + 0.5); c.lineTo(w, gy + 0.5); }
      c.stroke();
      // floor
      c.fillStyle = '#0d2231'; c.fillRect(0, Lo.gy, w, h - Lo.gy);
      c.strokeStyle = 'rgba(143,179,198,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, Lo.gy); c.lineTo(w, Lo.gy); c.stroke();
      // ramp plank
      var top = rampPt(LEN, 0), T = 12, nx = Math.sin(th), ny = Math.cos(th);
      var post = rampPt(LEN * 0.86, -T);
      c.fillStyle = '#23394a'; c.fillRect(post.x - 4, post.y, 8, Lo.gy - post.y);
      c.fillStyle = '#2f4c61'; c.fillRect(post.x - 13, Lo.gy - 6, 26, 6);
      c.beginPath(); c.moveTo(Lo.gx, Lo.gy); c.lineTo(top.x, top.y); c.lineTo(top.x + nx * T, top.y + ny * T); c.lineTo(Lo.gx + nx * T, Lo.gy + ny * T); c.closePath();
      var rg = c.createLinearGradient(Lo.gx, Lo.gy, Lo.gx + nx * T, Lo.gy + ny * T); rg.addColorStop(0, lk.rampHi); rg.addColorStop(1, lk.ramp);
      c.fillStyle = rg; c.fill();
      // surface texture
      c.save(); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.beginPath();
      for (var k = 0.25; k < LEN; k += 0.35) { var q = rampPt(k, 0); c.moveTo(q.x, q.y); c.lineTo(q.x + nx * T * 0.9, q.y + ny * T * 0.9); }
      c.stroke(); c.restore();
      // hinge + angle arc
      c.fillStyle = '#9fb7c6'; c.beginPath(); c.arc(Lo.gx, Lo.gy, 4, 0, 7); c.fill();
      c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.arc(Lo.gx, Lo.gy, 52, -th, 0); c.stroke();
      label(c, 'θ = ' + fmt(S.th, 1) + '°', Lo.gx + 58, Lo.gy - Math.max(9, Math.sin(th / 2) * 52) - 2, C.gold, { bold: true });
      // the drag handle at the top of the ramp
      c.save(); c.strokeStyle = S.drag ? C.gold : 'rgba(255,212,121,.65)'; c.lineWidth = 2; c.fillStyle = 'rgba(255,212,121,.16)';
      c.beginPath(); c.arc(top.x, top.y, S.drag ? 12 : 9, 0, 7); c.fill(); c.stroke(); c.restore();

      // particles (dust and sparks while sliding)
      for (var i = S.parts.length - 1; i >= 0; i--) {
        var pt = S.parts[i]; c.globalAlpha = clamp(pt.life, 0, 1) * 0.8; c.fillStyle = pt.col; c.beginPath(); c.arc(pt.x, pt.y, pt.r, 0, 7); c.fill();
      }
      c.globalAlpha = 1;

      // block
      var bs = blockSize(), ctr = rampPt(S.x, bs.h / 2), cx = ctr.x, cy = ctr.y;
      if (Math.abs(S.v) > 0.3 && !reduced) { // motion blur ghosts
        for (var gI = 3; gI >= 1; gI--) {
          var gp = rampPt(S.x - S.v * 0.025 * gI, bs.h / 2);
          c.save(); c.globalAlpha = 0.09 * (4 - gI); c.translate(gp.x, gp.y); c.rotate(-th); c.fillStyle = lk.blockHi; c.fillRect(-bs.w / 2, -bs.h / 2, bs.w, bs.h); c.restore();
        }
      }
      c.save(); c.translate(cx, cy); c.rotate(-th);
      var bgd = c.createLinearGradient(0, -bs.h / 2, 0, bs.h / 2); bgd.addColorStop(0, lk.blockHi); bgd.addColorStop(1, lk.block);
      c.fillStyle = bgd; rrect(c, -bs.w / 2, -bs.h / 2, bs.w, bs.h, 4); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5; c.stroke();
      if (P.material(S.mat).look === 'wood') { c.strokeStyle = 'rgba(60,30,10,.4)'; c.beginPath(); c.moveTo(-bs.w / 2 + 4, -bs.h / 2 + 4); c.lineTo(bs.w / 2 - 4, bs.h / 2 - 4); c.moveTo(-bs.w / 2 + 4, bs.h / 2 - 4); c.lineTo(bs.w / 2 - 4, -bs.h / 2 + 4); c.stroke(); }
      c.font = '600 ' + clamp(bs.h * 0.34, 10, 15) + 'px system-ui,sans-serif'; c.fillStyle = lk.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(fmt(S.m, S.m < 10 ? 1 : 0) + ' kg', 0, 1);
      c.restore();

      // force arrows on the block (all scaled to the weight)
      var Lw = clamp(Lo.Lpx * 0.22, 48, 112), k = Lw / F.W, cap = 2.4 * Lw;
      function len(v) { var a = Math.abs(v) * k; return a > cap ? cap : a; }
      var ux = Math.cos(th), uy = -Math.sin(th), Nx = -Math.sin(th), Ny = -Math.cos(th); // along the ramp (uphill) and out of its surface
      if (S.comp) {
        arrow(c, cx, cy, -ux * len(F.Wpar), -uy * len(F.Wpar), C.pink, { width: 2, dash: [5, 4], alpha: 0.85 });
        arrow(c, cx, cy, -Nx * len(F.Wperp), -Ny * len(F.Wperp), C.pink, { width: 2, dash: [5, 4], alpha: 0.85 });
      }
      arrow(c, cx, cy, 0, len(F.W), C.pink, { glow: true });
      label(c, 'mg', cx + 7, cy + len(F.W) - 4, C.pink, { bold: true });
      var bot = rampPt(S.x, 0);
      arrow(c, bot.x, bot.y, Nx * len(F.N), Ny * len(F.N), C.blue, { glow: true });
      label(c, 'N', bot.x + Nx * len(F.N) - 14, bot.y + Ny * len(F.N), C.blue, { bold: true });
      if (Math.abs(F.f) > 1e-9) {
        var fb = rampPt(S.x, 2), fl = len(F.f) * Math.sign(F.f);
        arrow(c, fb.x, fb.y, ux * fl, uy * fl, C.red, { glow: true, width: 3.5 });
        label(c, F.kind === 'static' ? 'fₛ' : 'fₖ', fb.x + ux * fl + Nx * 12, fb.y + uy * fl + Ny * 12, C.red, { bold: true, align: 'center' });
      }
      if (Math.abs(S.P) > 1e-9) {
        var pl = len(S.P) * Math.sign(S.P), face = rampPt(S.x - Math.sign(S.P) * bs.w / 2 / Lo.sc, bs.h * 0.55);
        arrow(c, face.x - ux * pl, face.y - uy * pl, ux * pl, uy * pl, C.green, { glow: true });
        label(c, 'F', face.x - ux * pl * 0.6 + Nx * 12, face.y - uy * pl * 0.6 + Ny * 12, C.green, { bold: true, align: 'center' });
      }
      if (S.net && Math.abs(F.net) > 0.05) {
        var nb = rampPt(S.x, bs.h + 16), nl = len(F.net) * Math.sign(F.net);
        arrow(c, nb.x - ux * nl / 2, nb.y - uy * nl / 2, ux * nl, uy * nl, C.gold, { glow: true, width: 4.5 });
        label(c, 'net', nb.x + Nx * 13, nb.y + Ny * 13, C.gold, { bold: true, align: 'center' });
      }
      if (S.pop > 0 && S.popText) { label(c, S.popText, cx, cy - bs.h - 22 - (1 - S.pop) * 16, S.popText === '★' ? C.gold : C.ink, { bold: true, size: 15, align: 'center' }); }
      if (S.off) label(c, S.offMsg, w / 2, Lo.gy - 26, C.gold, { bold: true, size: 14, align: 'center' });

      drawInset(F, p);
      drawMeter(F);
      drawChart();
    }

    function drawInset(F, p) {
      var x = Lo.ix, y = Lo.iy, S2 = Lo.ins, th = S.th * DEG;
      c.save(); c.fillStyle = C.panel; c.strokeStyle = C.line; c.lineWidth = 1; rrect(c, x, y, S2, S2 + 34, 12); c.fill(); c.stroke();
      label(c, 'FREE-BODY DIAGRAM', x + 10, y + 13, C.muted, { size: 10, bold: true });
      var cx = x + S2 / 2, cy = y + S2 / 2 + 8, R = S2 * 0.4, k = R * 0.78 / F.W, cap = R * 1.05;
      function len(v) { var a = Math.abs(v) * k; return a > cap ? cap : a; }
      var ux = Math.cos(th), uy = -Math.sin(th), Nx = -Math.sin(th), Ny = -Math.cos(th);
      // tilted axes
      c.strokeStyle = 'rgba(143,179,198,.35)'; c.setLineDash([3, 4]); c.lineWidth = 1; c.beginPath();
      c.moveTo(cx - ux * R, cy - uy * R); c.lineTo(cx + ux * R, cy + uy * R); c.moveTo(cx - Nx * R * 0.9, cy - Ny * R * 0.9); c.lineTo(cx + Nx * R * 0.9, cy + Ny * R * 0.9); c.stroke(); c.setLineDash([]);
      label(c, 'x', cx + ux * R + 4, cy + uy * R - 6, C.muted, { size: 11 });
      label(c, 'y', cx + Nx * R * 0.9 - 10, cy + Ny * R * 0.9, C.muted, { size: 11 });
      if (S.comp) {
        arrow(c, cx, cy, -ux * len(F.Wpar), -uy * len(F.Wpar), C.pink, { width: 1.8, dash: [4, 3], alpha: 0.8 });
        arrow(c, cx, cy, -Nx * len(F.Wperp), -Ny * len(F.Wperp), C.pink, { width: 1.8, dash: [4, 3], alpha: 0.8 });
      }
      arrow(c, cx, cy, 0, len(F.W), C.pink, { width: 2.6 });
      arrow(c, cx, cy, Nx * len(F.N), Ny * len(F.N), C.blue, { width: 2.6 });
      if (Math.abs(F.f) > 1e-9) arrow(c, cx, cy, ux * len(F.f) * Math.sign(F.f), uy * len(F.f) * Math.sign(F.f), C.red, { width: 2.6 });
      if (Math.abs(S.P) > 1e-9) arrow(c, cx + Nx * 4, cy + Ny * 4, ux * len(S.P) * Math.sign(S.P), uy * len(S.P) * Math.sign(S.P), C.green, { width: 2.6 });
      c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 4, 0, 7); c.fill();
      label(c, 'w', cx + 6, cy + len(F.W) - 2, C.pink, { size: 11, bold: true });
      label(c, 'N', cx + Nx * len(F.N) - 6, cy + Ny * len(F.N) - 7, C.blue, { size: 11, bold: true, align: 'center' });
      var dir = F.net > 0.05 ? 'uphill' : F.net < -0.05 ? 'downhill' : '';
      label(c, 'net ' + (dir ? fN(Math.abs(F.net)) + ' ' + dir : '0 N'), x + 10, y + S2 + 8, C.gold, { size: 11, bold: true });
      label(c, 'a = ' + fmt(Math.abs(F.a), 2) + ' m/s²' + (dir && Math.abs(F.a) > 0.005 ? ' ' + dir : ''), x + 10, y + S2 + 23, C.gold, { size: 11 });
      c.restore();
    }
    function drawMeter(F) {
      var narrow = Lo.narrow, x = 12, w = narrow ? Lo.w - 24 : Lo.w * 0.52 - 18, y = Lo.h - (narrow ? 52 : 34), hh = 12;
      var ratio = F.fmaxS > 0 ? Math.abs(F.f) / F.fmaxS : 0, kin = F.kind === 'kinetic';
      var txt = kin ? 'Sliding: kinetic friction μk N = ' + fN(F.fK) : 'Static friction ' + fN(Math.abs(F.f)) + ' of ' + fN(F.fmaxS) + ' max (μs N)';
      label(c, txt, x, y - 11, kin ? C.red : C.ink, { size: 11.5, bold: true });
      c.fillStyle = 'rgba(255,255,255,.08)'; rrect(c, x, y, w, hh, 6); c.fill();
      var fill = clamp(ratio, 0, 1) * w;
      if (fill > 1) {
        var gd = c.createLinearGradient(x, 0, x + w, 0);
        if (kin) { gd.addColorStop(0, '#c92a2a'); gd.addColorStop(1, C.red); } else { gd.addColorStop(0, '#1c7ed6'); gd.addColorStop(0.75, C.blue); gd.addColorStop(1, ratio > 0.92 ? C.gold : C.blue); }
        c.fillStyle = gd; rrect(c, x, y, Math.max(fill, 8), hh, 6); c.fill();
      }
      c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w - 1, y - 3); c.lineTo(x + w - 1, y + hh + 3); c.stroke();
    }
    function drawChart() {
      if (Lo.narrow) { // tiny chart under the meter
        var x = 12, w = Lo.w - 24, y = Lo.h - 30, hh = 22; chartAt(x, y, w, hh, false); return;
      }
      chartAt(Lo.w * 0.56, Lo.h - 54, Lo.w * 0.44 - 12, 42, true);
    }
    function chartAt(x, y, w, hh, title) {
      c.save(); c.fillStyle = 'rgba(255,255,255,.04)'; rrect(c, x, y, w, hh, 6); c.fill();
      var vmax = 1; S.hist.forEach(function (q) { vmax = Math.max(vmax, Math.abs(q.v)); });
      var mid = y + hh / 2, sy = (hh / 2 - 3) / vmax, span = 8, t1 = S.t, t0 = t1 - span;
      c.strokeStyle = 'rgba(143,179,198,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, mid); c.lineTo(x + w, mid); c.stroke();
      c.strokeStyle = C.green; c.lineWidth = 2; c.beginPath();
      var first = true;
      S.hist.forEach(function (q) { if (q.t < t0) return; var px = x + (q.t - t0) / span * w, py = mid - q.v * sy; if (first) { c.moveTo(px, py); first = false; } else c.lineTo(px, py); });
      c.stroke();
      if (title) label(c, 'speed along the ramp, last 8 s (up = uphill), max ' + fmt(vmax, 1) + ' m/s', x + 6, y - 9, C.muted, { size: 10.5 });
      c.restore();
    }

    function readouts(F) {
      var rows = [
        ['Weight mg', fN(F.W)], ['mg sin θ (down the ramp)', fN(F.Wpar)], ['mg cos θ (into the ramp)', fN(F.Wperp)],
        ['Normal force N', fN(F.N)], [F.kind === 'static' ? 'Static friction' : 'Kinetic friction', fN(Math.abs(F.f)) + (Math.abs(F.f) > 0.05 ? (F.f > 0 ? ' ↗' : ' ↙') : '')],
        ['Most static friction μs N', fN(F.fmaxS)], ['Push F', fN(Math.abs(S.P))], ['Net force', fN(Math.abs(F.net))],
        ['Acceleration', fmt(Math.abs(F.a), 2) + ' m/s²'], ['Speed', fmt(Math.abs(S.v), 2) + ' m/s' + (S.v > 0.005 ? ' ↗' : S.v < -0.005 ? ' ↙' : '')]
      ];
      var html = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
      if (el.read._h !== html) { el.read.innerHTML = html; el.read._h = html; }
      var mt = P.material(S.mat), state = S.off ? S.offMsg : S.v === 0 ? (F.kind === 'static' ? '<b>Holding still</b> · static friction' : '<b>Starting to slip…</b>') : '<b>Sliding ' + (S.v > 0 ? 'uphill' : 'downhill') + '</b> ' + fmt(Math.abs(S.v), 2) + ' m/s';
      var hh = state + '<br>tan θ ' + fmt(Math.tan(S.th * DEG), 3) + ' · μs ' + mt.us + ' · μk ' + mt.uk;
      if (hud._h !== hh) { hud.innerHTML = hh; hud._h = hh; }
    }

    /* input on the canvas: drag the top of the ramp to tilt it; keys */
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function nearHandle(q) { layout(); var t = rampPt(LEN, 0); return Math.hypot(q.x - t.x, q.y - t.y) < 30; }
    function setAngleFrom(q) { var a = Math.atan2(Lo.gy - q.y, q.x - Lo.gx) / DEG; S.th = clamp(Math.round(a * 2) / 2, 0, TMAX); sync(); }
    cv.addEventListener('pointerdown', function (e) { var q = pos(e); if (nearHandle(q)) { S.drag = true; cv.setPointerCapture(e.pointerId); e.preventDefault(); } });
    cv.addEventListener('pointermove', function (e) { var q = pos(e); if (S.drag) setAngleFrom(q); else cv.style.cursor = nearHandle(q) ? 'grab' : 'default'; });
    function up() { S.drag = false; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', function (e) {
      var k = e.key, big = e.shiftKey, used = true;
      if (k === 'ArrowRight') S.th = clamp(S.th + (big ? 5 : 0.5), 0, TMAX);
      else if (k === 'ArrowLeft') S.th = clamp(S.th - (big ? 5 : 0.5), 0, TMAX);
      else if (k === 'ArrowUp') S.P = clamp(S.P + (big ? 10 : 1), -300, 300);
      else if (k === 'ArrowDown') S.P = clamp(S.P - (big ? 10 : 1), -300, 300);
      else if (k === 'w' || k === 'W') shove(1);
      else if (k === 's' || k === 'S') shove(-1);
      else if (k === ' ') setPause(!S.paused);
      else if (k === 'r' || k === 'R') resetBlock();
      else if (k === '0') S.P = 0;
      else used = false;
      if (used) { e.preventDefault(); sync(); }
    });

    function emit(F) {
      if (reduced || S.v === 0 || L.reduced) return;
      var bs = blockSize(), back = Math.sign(S.v) * -1, q = rampPt(S.x + back * bs.w / 2 / Lo.sc, 1), sp = Math.min(1, Math.abs(S.v) / 3);
      var hot = /steel|metal/i.test(P.material(S.mat).name), col = hot ? (Math.random() < 0.5 ? C.gold : '#ffa94d') : (Math.random() < 0.5 ? 'rgba(220,230,240,.9)' : lookFor().rampHi);
      if (Math.random() < 0.25 + sp) S.parts.push({ x: q.x, y: q.y, vx: (Math.random() - 0.5) * 40 + back * Math.cos(S.th * DEG) * 30 * sp, vy: -Math.random() * 50 * (0.3 + sp), r: 1 + Math.random() * 1.8, life: 0.6 + Math.random() * 0.4, col: col });
      if (S.parts.length > 120) S.parts.shift();
    }

    L.loop(function (dt) {
      layout();
      var h = S.paused ? 0 : dt * (S.slow ? 0.25 : 1);
      var p = params(), F0 = P.rampForces(S.v, p), slipped = false;
      if (h > 0) {
        if (S.off > 0) { S.off -= h; if (S.off <= 0) { S.off = 0; S.x = X0; S.v = 0; } }
        else {
          if (S.v === 0 && F0.kind === 'kinetic') { slipped = true; S.pop = 0.9; S.popText = 'slip!'; }
          var s = { x: S.x, v: S.v }; P.rampStep(s, p, h); S.x = s.x; S.v = s.v; S.t += h;
          var half = blockSize().w / 2 / Lo.sc;
          if (S.x < half) { S.x = half; S.v = 0; S.off = 1.2; S.offMsg = 'Reached the bottom. Back to the start…'; }
          else if (S.x > LEN - half) { S.x = LEN - half; S.v = 0; S.off = 1.2; S.offMsg = 'Reached the top. Back to the start…'; }
          S.hist.push({ t: S.t, v: S.v }); while (S.hist.length && S.hist[0].t < S.t - 8.5) S.hist.shift();
        }
        for (var i = S.parts.length - 1; i >= 0; i--) { var pt = S.parts[i]; pt.x += pt.vx * h; pt.y += pt.vy * h; pt.vy += 160 * h; pt.life -= h * 1.4; if (pt.life <= 0) S.parts.splice(i, 1); }
      }
      if (S.pop > 0) S.pop = Math.max(0, S.pop - dt);
      var F = P.rampForces(S.v, p); S.F = F;
      if (h > 0) { emit(F); checkMissions(F, h, slipped); }
      draw(); readouts(F);
    }, view);
    sync();
    if (/[?&]debug\b/.test(location.search)) W.NL4Debug = { S: S, sync: sync, M: M };
  })();

  /* =====================================================================================
     2. THE ELEVATOR SCALE
     ===================================================================================== */
  (function () {
    var view = $('nl4e-view'), cv = $('nl4e-cv'); if (!cv) return;
    var G4 = L.canvas(cv), c = G4.c, mEl = $('nl4e-m'), mO = $('nl4e-m-o'), read = $('nl4e-read'), note = $('nl4e-note'), rideG = $('nl4e-rides');
    var E = { ride: 'up', t: 0, run: false, m: 40, paused: false, trace: [] };
    var PH = { up: ['Waiting', 'Speeding up, going up', 'Cruising up', 'Slowing down, going up', 'Stopped'],
      down: ['Waiting', 'Speeding up, going down', 'Cruising down', 'Slowing down, going down', 'Stopped'],
      drop: ['At the top', 'Free fall', 'Braking', 'Stopped'] };
    function start(r) { E.ride = r; E.t = 0; E.run = true; E.trace = []; seg(rideG, 'data-ride', r); }
    rideG.addEventListener('click', function (e) { var b = e.target.closest('button[data-ride]'); if (b) start(b.dataset.ride); });
    mEl.addEventListener('input', function () { E.m = +mEl.value; mO.textContent = E.m + ' kg'; E.trace = []; });
    var bp = $('nl4e-pause');
    bp.addEventListener('click', function () { E.paused = !E.paused; bp.textContent = E.paused ? '▶' : '❚❚'; bp.setAttribute('aria-label', E.paused ? 'Play' : 'Pause'); });
    function state() {
      var r = P.RIDES[E.ride], T = P.rideDuration(r), q = P.rideAt(r, Math.min(E.t, T + 0.01));
      if (!E.run) q = { y: 0, v: 0, a: 0, phase: 0 };
      q.T = T; q.N = P.scale(E.m, q.a); return q;
    }
    function person(c, x, y, s, float, col) { // feet at (x, y), s = px per m
      var hgt = 1.55 * s, head = 0.13 * s;
      c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(2, s * 0.07); c.lineCap = 'round';
      c.beginPath(); c.moveTo(x - 0.12 * s, y); c.lineTo(x, y - 0.75 * s); c.lineTo(x + 0.12 * s, y);  // legs
      c.moveTo(x, y - 0.75 * s); c.lineTo(x, y - hgt + 2 * head);                                         // body
      var sh = y - hgt + 2.3 * head, arm = float ? -0.5 : 0.45;
      c.moveTo(x - 0.3 * s, sh + arm * s); c.lineTo(x, sh); c.lineTo(x + 0.3 * s, sh + arm * s); c.stroke();
      c.beginPath(); c.arc(x, y - hgt + head, head, 0, 7); c.fillStyle = '#ffcc4d'; c.fill(); c.lineWidth = Math.max(1.5, s * 0.03); c.stroke(); c.fillStyle = col; // head in the one skin color
      if (float) { c.lineWidth = 1.5; c.beginPath(); for (var i = -2; i <= 2; i++) { c.moveTo(x + i * head * 0.35, y - hgt); c.lineTo(x + i * head * 0.5, y - hgt - head * 0.9); } c.stroke(); }
      c.restore();
    }
    function draw(q) {
      var w = G4.w, h = G4.h, narrow = w < 520; bg(c, w, h);
      var lw = narrow ? w * 0.46 : w * 0.4, s = h / 9.5, carY = h * 0.66; // car floor on screen
      var drop = E.ride === 'drop';
      // world → screen: y (m, up) → carY − (y − q.y) s
      function Y(y) { return carY - (y - q.y) * s; }
      c.save(); c.beginPath(); c.rect(0, 0, lw, h); c.clip();
      c.fillStyle = drop ? '#0b1d2b' : '#102636'; c.fillRect(8, 0, lw - 16, h);
      if (!drop) { // floors every 3.75 m
        for (var f = -8; f <= 14; f++) {
          var fy = Y(f * 3.75); if (fy < -20 || fy > h + 20) continue;
          c.fillStyle = '#18384d'; c.fillRect(8, fy, lw - 16, 5);
          label(c, f === 0 ? 'Lobby' : 'Floor ' + f, 14, fy - 10, C.muted, { size: 10 });
        }
      } else { // lattice tower with lights
        c.strokeStyle = '#27506a'; c.lineWidth = 2;
        for (var t = -30; t <= 10; t += 2) { var ty = Y(t), ty2 = Y(t + 2); if (ty < -40 || ty2 > h + 40) continue; c.beginPath(); c.moveTo(lw * 0.22, ty); c.lineTo(lw * 0.78, ty2); c.moveTo(lw * 0.78, ty); c.lineTo(lw * 0.22, ty2); c.stroke(); }
        c.fillStyle = '#27506a'; c.fillRect(lw * 0.2, 0, 4, h); c.fillRect(lw * 0.78, 0, 4, h);
        for (var b = -30; b <= 4; b += 1.5) { var by = Y(b); if (by < 0 || by > h) continue; c.fillStyle = (Math.round(b / 1.5) % 2) ? C.gold : C.pink; c.globalAlpha = 0.5; c.beginPath(); c.arc(lw * 0.2 + 2, by, 2.2, 0, 7); c.arc(lw * 0.78 + 2, by, 2.2, 0, 7); c.fill(); c.globalAlpha = 1; }
        var gr = Y(-29.42); if (gr < h) { c.fillStyle = '#0d2231'; c.fillRect(0, gr, lw, h - gr); }
      }
      // the car or the seat
      var cw = Math.min(lw - 40, 2.2 * s), ch = 2.3 * s, cx = lw / 2, float = Math.abs(q.N) < 1e-6;
      c.fillStyle = drop ? 'rgba(249,168,212,.14)' : 'rgba(116,192,252,.10)'; c.strokeStyle = drop ? C.pink : C.blue; c.lineWidth = 2;
      rrect(c, cx - cw / 2, carY - ch, cw, ch, 6); c.fill(); c.stroke();
      if (!drop) { c.strokeStyle = 'rgba(143,179,198,.5)'; c.beginPath(); c.moveTo(cx, carY - ch); c.lineTo(cx, carY - ch - 400); c.stroke(); }
      // scale and rider
      c.fillStyle = '#dbe7ef'; c.fillRect(cx - 0.32 * s, carY - 0.12 * s, 0.64 * s, 0.12 * s);
      c.fillStyle = '#0b1b27'; c.fillRect(cx - 0.12 * s, carY - 0.1 * s, 0.24 * s, 0.07 * s);
      person(c, cx, carY - 0.12 * s, s, float, '#e9f1f6');
      // arrows on the rider, scaled to the weight
      var Wt = E.m * GG, kk = 1.0 * s / Wt, mid = carY - 0.9 * s;
      arrow(c, cx + 0.45 * s, mid, 0, Wt * kk, C.pink, { glow: true });
      label(c, 'mg', cx + 0.45 * s + 6, mid + Wt * kk - 6, C.pink, { bold: true, size: 11 });
      if (q.N > 1e-6) { arrow(c, cx - 0.45 * s, carY - 0.12 * s, 0, -Math.min(q.N * kk, 3.2 * s), C.blue, { glow: true }); label(c, 'N', cx - 0.45 * s - 14, carY - 0.12 * s - Math.min(q.N * kk, 3.2 * s) + 6, C.blue, { bold: true, size: 11 }); }
      if (Math.abs(q.a) > 0.01) { var ay = -q.a / GG * 0.8 * s, axx = cx + cw / 2 - 14; arrow(c, axx, carY - ch - 12 + (ay > 0 ? -ay : 0), 0, ay, C.gold, { width: 3 }); label(c, 'a', axx - 12, carY - ch - 14 - Math.abs(ay) / 2, C.gold, { bold: true, size: 11 }); }
      c.restore();
      // right side: the dial and the graph
      var rx = lw + 12, rw = w - rx - 10;
      var rr = Math.min(rw * 0.32, h * 0.2), dcx = rx + rr + 6, dcy = 24 + rr;
      var kgNow = q.N / GG, kgMax = Math.max(50, Math.ceil(E.m * 3.4 / 50) * 50);
      c.fillStyle = '#e9eef2'; c.beginPath(); c.arc(dcx, dcy, rr, 0, 7); c.fill();
      c.fillStyle = '#0b1b27'; c.beginPath(); c.arc(dcx, dcy, rr * 0.9, 0, 7); c.fill();
      var a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
      for (var tk = 0; tk <= kgMax; tk += kgMax / 10) {
        var an = a0 + (a1 - a0) * tk / kgMax; c.strokeStyle = '#8fb3c6'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(dcx + Math.cos(an) * rr * 0.78, dcy + Math.sin(an) * rr * 0.78); c.lineTo(dcx + Math.cos(an) * rr * 0.88, dcy + Math.sin(an) * rr * 0.88); c.stroke();
        if (rr > 50) label(c, String(Math.round(tk)), dcx + Math.cos(an) * rr * 0.63, dcy + Math.sin(an) * rr * 0.63, C.muted, { size: 9, align: 'center' });
      }
      var aw = a0 + (a1 - a0) * E.m / kgMax; c.strokeStyle = C.pink; c.lineWidth = 3; c.beginPath(); c.arc(dcx, dcy, rr * 0.93, aw - 0.03, aw + 0.03); c.stroke();
      var an2 = a0 + (a1 - a0) * clamp(kgNow, 0, kgMax) / kgMax;
      c.strokeStyle = C.red; c.lineWidth = 3; c.shadowColor = C.red; c.shadowBlur = 8; c.beginPath(); c.moveTo(dcx, dcy); c.lineTo(dcx + Math.cos(an2) * rr * 0.82, dcy + Math.sin(an2) * rr * 0.82); c.stroke(); c.shadowBlur = 0;
      c.fillStyle = C.red; c.beginPath(); c.arc(dcx, dcy, 4, 0, 7); c.fill();
      label(c, fmt(kgNow, 1) + ' kg', dcx, dcy + rr * 0.45, '#fff', { bold: true, size: 13, align: 'center' });
      var tx = dcx + rr + 12;
      if (tx < w - 70) {
        label(c, 'Scale reads', tx, dcy - 22, C.muted, { size: 11 });
        label(c, grp(fmt(q.N, 0)) + ' N', tx, dcy - 4, '#fff', { bold: true, size: 16 });
        label(c, 'weight ' + grp(fmt(Wt, 0)) + ' N', tx, dcy + 16, C.pink, { size: 11 });
      }
      // graph: scale reading through the ride
      var gx = rx, gy = dcy + rr + 30, gw = rw, gh = h - gy - 22;
      if (gh > 40) {
        c.fillStyle = 'rgba(255,255,255,.04)'; rrect(c, gx, gy, gw, gh, 8); c.fill();
        var T = q.T, Nmax = E.m * GG * (E.ride === 'drop' ? 3.3 : 1.5), X = function (t) { return gx + 6 + (gw - 12) * t / T; }, Yg = function (n) { return gy + gh - 6 - (gh - 12) * n / Nmax; };
        label(c, '0 N', gx + gw - 6, Yg(0) - 7, C.muted, { size: 9.5, align: 'right' }); label(c, grp(fmt(Wt, 0)) + ' N', gx + gw - 6, Yg(Wt) - 8, C.pink, { size: 9.5, align: 'right' });
        c.strokeStyle = C.pink; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(gx + 4, Yg(Wt)); c.lineTo(gx + gw - 4, Yg(Wt)); c.stroke(); c.setLineDash([]);
        c.strokeStyle = C.blue; c.lineWidth = 2.4; c.beginPath();
        E.trace.forEach(function (p, i) { if (i) c.lineTo(X(p.t), Yg(p.N)); else c.moveTo(X(p.t), Yg(p.N)); }); c.stroke();
        label(c, narrow ? 'scale reading (dashed: weight)' : 'scale reading during the ride (dashed: your weight)', gx + 6, gy - 9, C.muted, { size: 10.5 });
      }
      label(c, E.run ? PH[E.ride][q.phase] : 'Pick a ride', 14, 18, C.gold, { bold: true, size: 13 });
      label(c, 'a = ' + (q.a > 0 ? '+' : '') + fmt(q.a, 2) + ' m/s² · v = ' + fmt(q.v, 1) + ' m/s', 14, 36, C.ink, { size: 11.5 });
    }
    L.loop(function (dt) {
      if (E.run && !E.paused) { E.t += dt; var T = P.rideDuration(P.RIDES[E.ride]); if (E.t <= T + 0.05) { var q0 = P.rideAt(P.RIDES[E.ride], Math.min(E.t, T)); E.trace.push({ t: Math.min(E.t, T), N: P.scale(E.m, q0.a) }); } }
      var q = state(); draw(q);
      var html = '<dt>Acceleration</dt><dd>' + fmt(q.a, 2) + ' m/s²</dd><dt>Velocity</dt><dd>' + fmt(q.v, 2) + ' m/s</dd><dt>Weight mg</dt><dd>' + fN(E.m * GG) + '</dd><dt>Scale N = m(g + a)</dt><dd>' + fN(q.N) + '</dd><dt>Scale shows</dt><dd>' + fmt(q.N / GG, 1) + ' kg</dd>';
      if (read._h !== html) { read.innerHTML = html; read._h = html; }
      var n = !E.run ? 'Choose a ride. The scale shows the force it pushes up with, turned into kilograms by dividing by g.' : q.a > 0.01 ? 'Accelerating upward: the floor must push harder than your weight, so you feel heavy.' : q.a < -GG + 0.01 ? 'Free fall: the floor falls as fast as you do, so the scale reads zero. Gravity has not switched off; your weight is still ' + fN(E.m * GG) + '.' : q.a < -0.01 ? 'Accelerating downward: the floor pushes less than your weight, so you feel light.' : 'Zero acceleration, whether still or cruising: the scale reads your weight.';
      if (note._h !== n) { note.textContent = n; note._h = n; }
    }, view);
  })();

  /* =====================================================================================
     3. THE ATWOOD MACHINE
     ===================================================================================== */
  (function () {
    var view = $('nl4a-view'), cv = $('nl4a-cv'); if (!cv) return;
    var G4 = L.canvas(cv), c = G4.c, read = $('nl4a-read'), hud = $('nl4a-hud');
    var m1El = $('nl4a-m1'), m2El = $('nl4a-m2'), m1O = $('nl4a-m1-o'), m2O = $('nl4a-m2-o');
    var A = { m1: 1.2, m2: 0.8, y: 0, v: 0, t: 0, run: false, t1m: null, spin: 0 };
    var TRAVEL = 1.25;
    function upd() { A.m1 = +m1El.value; A.m2 = +m2El.value; m1O.textContent = fmt(A.m1, 2) + ' kg'; m2O.textContent = fmt(A.m2, 2) + ' kg'; reset(); }
    function reset() { A.y = 0; A.v = 0; A.t = 0; A.run = false; A.t1m = null; }
    m1El.addEventListener('input', upd); m2El.addEventListener('input', upd);
    $('nl4a-go').addEventListener('click', function () { if (Math.abs(A.y) >= TRAVEL - 1e-9) reset(); A.run = true; });
    $('nl4a-reset').addEventListener('click', reset);
    function draw(at) {
      var w = G4.w, h = G4.h; bg(c, w, h);
      var cx = w / 2, py = 46, rp = clamp(w * 0.08, 26, 40), s = (h - py - 150) / (TRAVEL * 2 + 0.3);
      c.fillStyle = '#23394a'; c.fillRect(cx - 70, 8, 140, 10);
      c.strokeStyle = '#5c7a8d'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, 18); c.lineTo(cx, py); c.stroke();
      c.fillStyle = '#0d2231'; c.fillRect(0, h - 26, w, 26); c.strokeStyle = 'rgba(143,179,198,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, h - 26); c.lineTo(w, h - 26); c.stroke();
      var base = py + 0.3 * s + TRAVEL * s, y1 = base + A.y * s, y2 = base - A.y * s; // tops of the boxes
      function box(x, ytop, m, col, name) {
        var side = clamp(Math.cbrt(m) * 44, 26, 76);
        var g = c.createLinearGradient(0, ytop, 0, ytop + side); g.addColorStop(0, col); g.addColorStop(1, '#1b3445');
        c.fillStyle = g; rrect(c, x - side / 2, ytop, side, side, 4); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.stroke();
        label(c, name, x, ytop + side / 2 - 6, '#06111a', { bold: true, size: 12, align: 'center', plain: true });
        label(c, fmt(m, 2) + ' kg', x, ytop + side / 2 + 8, '#06111a', { size: 10, align: 'center', plain: true });
        return side;
      }
      c.strokeStyle = '#cfdde6'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - rp, py); c.lineTo(cx - rp, y1); c.moveTo(cx + rp, py); c.lineTo(cx + rp, y2); c.stroke();
      // pulley
      c.fillStyle = '#2f4c61'; c.beginPath(); c.arc(cx, py, rp, 0, 7); c.fill(); c.strokeStyle = '#9fb7c6'; c.lineWidth = 2; c.stroke();
      c.save(); c.translate(cx, py); c.rotate(A.y / (rp / s)); c.strokeStyle = '#9fb7c6'; c.lineWidth = 2; c.beginPath(); for (var i = 0; i < 3; i++) { var an = i * Math.PI / 3; c.moveTo(Math.cos(an) * rp * 0.85, Math.sin(an) * rp * 0.85); c.lineTo(-Math.cos(an) * rp * 0.85, -Math.sin(an) * rp * 0.85); } c.stroke(); c.restore();
      c.fillStyle = '#dbe7ef'; c.beginPath(); c.arc(cx, py, 3.5, 0, 7); c.fill();
      var s1 = box(cx - rp, y1, A.m1, C.gold, 'm₁'), s2 = box(cx + rp, y2, A.m2, C.blue, 'm₂');
      // forces, scaled to the larger weight
      var Wm = Math.max(at.w1, at.w2), k = 64 / Wm, ax = 46;
      arrow(c, cx - rp - ax, y1 + s1 / 2, 0, -at.T * k, C.violet, { glow: true }); label(c, 'T', cx - rp - ax - 12, y1 + s1 / 2 - at.T * k + 6, C.violet, { bold: true });
      arrow(c, cx - rp - ax, y1 + s1 / 2, 0, at.w1 * k, C.pink, { glow: true }); label(c, 'm₁g', cx - rp - ax - 30, y1 + s1 / 2 + at.w1 * k - 4, C.pink, { bold: true });
      arrow(c, cx + rp + ax, y2 + s2 / 2, 0, -at.T * k, C.violet, { glow: true }); label(c, 'T', cx + rp + ax + 6, y2 + s2 / 2 - at.T * k + 6, C.violet, { bold: true });
      arrow(c, cx + rp + ax, y2 + s2 / 2, 0, at.w2 * k, C.pink, { glow: true }); label(c, 'm₂g', cx + rp + ax + 6, y2 + s2 / 2 + at.w2 * k - 4, C.pink, { bold: true });
      // 1 m marks
      c.strokeStyle = 'rgba(255,212,121,.4)'; c.setLineDash([3, 4]); c.lineWidth = 1; c.beginPath();
      var mk = base + (at.a >= 0 ? 1 : -1) * s; c.moveTo(cx - rp - 60, mk); c.lineTo(cx - rp + 30, mk); c.stroke(); c.setLineDash([]);
      label(c, at.a >= 0 ? '1 m down' : '1 m up', cx - rp - 62, mk - 8, C.gold, { size: 10 });
    }
    L.loop(function (dt) {
      var at = P.atwood(A.m1, A.m2);
      if (A.run) {
        A.t += dt; var y0 = A.y;
        A.y = 0.5 * at.a * A.t * A.t; A.v = at.a * A.t;
        if (A.t1m === null && Math.abs(A.y) >= 1) { A.t1m = Math.sqrt(2 / Math.abs(at.a)); }
        if (Math.abs(A.y) >= TRAVEL) { A.y = Math.sign(A.y) * TRAVEL; A.run = false; A.v = 0; }
        if (at.a === 0) { A.run = false; }
      }
      draw(at);
      var hh = '<b>a</b> = (m₁ − m₂)g / (m₁ + m₂) = ' + fmt(Math.abs(at.a), 3) + ' m/s²<br><b>T</b> = 2m₁m₂g / (m₁ + m₂) = ' + fN(at.T);
      if (hud._h !== hh) { hud.innerHTML = hh; hud._h = hh; }
      var r = '<dt>Acceleration</dt><dd>' + fmt(Math.abs(at.a), 3) + ' m/s²</dd><dt>Tension T</dt><dd>' + fN(at.T) + '</dd><dt>Weight m₁g</dt><dd>' + fN(at.w1) + '</dd><dt>Weight m₂g</dt><dd>' + fN(at.w2) + '</dd>' +
        '<dt>Time to move 1 m</dt><dd>' + (at.a === 0 ? 'never' : A.t1m !== null ? fmt(A.t1m, 2) + ' s' : '…') + '</dd><dt>Predicted √(2·1 m / a)</dt><dd>' + (at.a === 0 ? '—' : fmt(Math.sqrt(2 / Math.abs(at.a)), 2) + ' s') + '</dd>';
      if (read._h !== r) { read.innerHTML = r; read._h = r; }
    }, view);
    upd();
  })();

  /* =====================================================================================
     4. THE FREE-BODY-DIAGRAM BUILDER
     ===================================================================================== */
  (function () {
    var box = $('nl4b'), cv = $('nl4b-cv'); if (!cv) return;
    var G4 = L.canvas(cv), c = G4.c, msg = $('nl4b-msg'), tray = $('nl4b-tray'), scG = $('nl4b-scenes'), store = L.store('nl4-fbd');
    var FORCES = {
      gravity: { name: 'Gravity (weight)', sym: 'w', col: C.pink },
      normal: { name: 'Normal force', sym: 'N', col: C.blue },
      friction: { name: 'Friction', sym: 'f', col: C.red },
      tension: { name: 'Tension', sym: 'T', col: C.violet },
      applied: { name: 'Applied push', sym: 'F', col: C.green },
      drag: { name: 'Air drag', sym: 'D', col: C.lime },
      spring: { name: 'Spring force', sym: 'Fₛ', col: C.cyan },
      motion: { name: '“Force of motion”', sym: '?', col: '#adb5bd' }
    };
    var WRONGDIR = {
      gravity: 'Gravity points straight down, toward the center of the Earth.',
      normal: 'A normal force pushes straight out of the surface, at right angles to it.',
      friction: 'Friction acts along the surface, against the sliding (or against the way the object would slide).',
      tension: 'A rope or cord can only pull, along its own length.',
      drag: 'Drag points against the motion through the air.',
      spring: 'This spring is stretched, so it pulls the weight back up.',
      applied: 'Check which way the push goes.'
    };
    var EXTRA = {
      friction: 'No friction here: nothing is sliding or trying to slide along a surface.',
      normal: 'It isn’t resting on a surface, so there is no normal force.',
      tension: 'No rope or cord pulls on it.',
      applied: 'Nobody is pushing it.',
      drag: 'Air drag is far too small to matter here.',
      spring: 'No spring touches it.',
      motion: 'There is no “force of motion.” A moving object keeps moving by itself (the first law). Forces change motion; they aren’t needed to keep it.',
      gravity: ''
    };
    var SCENES = [
      { id: 'book', name: 'Book on a table', text: 'A book lies still on a table.', ans: { gravity: -90, normal: 90 } },
      { id: 'lamp', name: 'Hanging lamp', text: 'A lamp hangs still from a cord.', ans: { gravity: -90, tension: 90 } },
      { id: 'sled', name: 'Sled on a rope', text: 'A sled is pulled to the right at a steady speed by a rope 30° above level. Snow rubs on its runners.', ans: { gravity: -90, normal: 90, tension: 30, friction: 180 } },
      { id: 'car', name: 'Car on a hill', text: 'A car is parked on a hill that rises to the right at 20°. Its brakes are on.', ans: { gravity: -90, normal: 110, friction: 20 }, extra: { friction: 'friction' } },
      { id: 'puck', name: 'Gliding puck', text: 'A hockey puck slides to the right across ice after the hit. Ignore friction: the ice is very smooth.', ans: { gravity: -90, normal: 90 }, extraMsg: { friction: 'We are ignoring friction: the ice is very smooth.' } },
      { id: 'sky', name: 'Skydiver', text: 'A skydiver falls at a steady speed (terminal speed).', ans: { gravity: -90, drag: 90 } },
      { id: 'spring', name: 'Weight on a spring', text: 'A weight hangs still from a stretched spring.', ans: { gravity: -90, spring: 90 } }
    ];
    var B = { sc: 0, arrows: [], sel: null, armed: null, drag: null, shown: false, done: store.get('done', {}), ok: false };
    scG.innerHTML = SCENES.map(function (s, i) { return '<button type="button" data-sc="' + i + '" aria-pressed="' + (i === 0) + '">' + s.name + '</button>'; }).join('');
    tray.innerHTML = Object.keys(FORCES).map(function (k) { var f = FORCES[k]; return '<button type="button" class="nl4-chip" data-f="' + k + '" aria-pressed="false" style="--chip:' + f.col + '"><i aria-hidden="true">' + f.sym + '</i>' + f.name + '</button>'; }).join('');
    function scene() { return SCENES[B.sc]; }
    function say(t, kind) { msg.textContent = t; msg.className = 'nl4-fbd-msg' + (kind ? ' ' + kind : ''); }
    function chips() {
      tray.querySelectorAll('.nl4-chip').forEach(function (b) {
        var k = b.dataset.f, on = B.arrows.some(function (a) { return a.k === k; });
        b.setAttribute('aria-pressed', String(on)); b.classList.toggle('armed', B.armed === k);
      });
      scG.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('nl4-done', !!B.done[SCENES[i].id]); });
    }
    function pickScene(i) { B.sc = i; B.arrows = []; B.sel = null; B.armed = null; B.shown = false; B.ok = false; seg(scG, 'data-sc', String(i)); say(scene().text + ' Add every force that acts on it, then press Check.'); chips(); }
    scG.addEventListener('click', function (e) { var b = e.target.closest('button[data-sc]'); if (b) pickScene(+b.dataset.sc); });
    function geom() {
      var w = G4.w, h = G4.h, cx = w / 2, cy = h * 0.52, Lr = Math.min(w, h) * 0.3;
      var id = scene().id;
      if (id === 'lamp' || id === 'spring') cy = h * 0.55;
      if (id === 'sky') cy = h * 0.48;
      return { w: w, h: h, cx: cx, cy: cy, Lr: Lr };
    }
    function snap(a) { return Math.round(a / 5) * 5; }
    function angTo(q) { var g = geom(); return snap(Math.atan2(g.cy - q.y, q.x - g.cx) / DEG); }
    function addArrow(k, ang) {
      var ex = null; B.arrows.forEach(function (a) { if (a.k === k) ex = a; });
      if (ex) ex.a = ang; else B.arrows.push({ k: k, a: ang });
      B.sel = k; B.armed = null; B.shown = false; B.ok = false; chips();
    }
    function removeArrow(k) { B.arrows = B.arrows.filter(function (a) { return a.k !== k; }); if (B.sel === k) B.sel = null; B.ok = false; chips(); }
    // chips: click toggles (arms, then tap the picture to aim); drag drops it aimed at the drop point; keyboard adds it pointing right
    var ghost = null, cd = null;
    tray.addEventListener('pointerdown', function (e) { var b = e.target.closest('.nl4-chip'); if (!b) return; cd = { k: b.dataset.f, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId }; });
    W.addEventListener('pointermove', function (e) {
      if (!cd || e.pointerId !== cd.id) return;
      if (!cd.moved && Math.hypot(e.clientX - cd.x, e.clientY - cd.y) > 8) {
        cd.moved = true; ghost = D.createElement('div'); ghost.className = 'nl4-ghost'; ghost.textContent = FORCES[cd.k].sym; ghost.style.setProperty('--chip', FORCES[cd.k].col); D.body.appendChild(ghost);
      }
      if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; e.preventDefault(); }
    }, { passive: false });
    W.addEventListener('pointerup', function (e) {
      if (!cd || e.pointerId !== cd.id) return;
      var was = cd; cd = null;
      if (ghost) { ghost.remove(); ghost = null; }
      if (!was.moved) return;
      var r = cv.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        addArrow(was.k, angTo({ x: e.clientX - r.left, y: e.clientY - r.top }));
        say(FORCES[was.k].name + ' added. Drag its tip to aim it.');
        tray._skipClick = true; setTimeout(function () { tray._skipClick = false; }, 50);
      }
    });
    tray.addEventListener('click', function (e) {
      var b = e.target.closest('.nl4-chip'); if (!b || tray._skipClick) return;
      var k = b.dataset.f, on = B.arrows.some(function (a) { return a.k === k; });
      if (on) { removeArrow(k); say(FORCES[k].name + ' removed.'); return; }
      if (e.detail === 0) { addArrow(k, 0); cv.focus(); say(FORCES[k].name + ' added, pointing right. Use ← and → to aim it, Delete to remove it, Tab back to the forces.'); return; }
      B.armed = B.armed === k ? null : k; chips();
      say(B.armed ? 'Now tap the picture where the ' + FORCES[k].name.toLowerCase() + ' should point.' : '');
    });
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function tipHit(q) {
      var g = geom(), best = null, bd = 26;
      B.arrows.forEach(function (a) { var tx = g.cx + Math.cos(a.a * DEG) * g.Lr, ty = g.cy - Math.sin(a.a * DEG) * g.Lr, d = Math.hypot(q.x - tx, q.y - ty); if (d < bd) { bd = d; best = a; } });
      return best;
    }
    cv.addEventListener('pointerdown', function (e) {
      var q = pos(e), hit = tipHit(q);
      if (hit) { B.drag = hit; B.sel = hit.k; cv.setPointerCapture(e.pointerId); e.preventDefault(); return; }
      if (B.armed) { var k = B.armed; addArrow(k, angTo(q)); B.drag = B.arrows.filter(function (a) { return a.k === k; })[0]; cv.setPointerCapture(e.pointerId); say(FORCES[k].name + ' added. Drag its tip to aim it.'); e.preventDefault(); }
    });
    cv.addEventListener('pointermove', function (e) { if (B.drag) { B.drag.a = angTo(pos(e)); B.ok = false; B.shown = false; } else cv.style.cursor = tipHit(pos(e)) ? 'grab' : (B.armed ? 'crosshair' : 'default'); });
    function up() { B.drag = null; }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', function (e) {
      if (!B.arrows.length) return;
      if (!B.sel) B.sel = B.arrows[0].k;
      var a = B.arrows.filter(function (x) { return x.k === B.sel; })[0]; if (!a) return;
      var used = true;
      if (e.key === 'ArrowLeft') a.a = snap(a.a + (e.shiftKey ? 45 : 5));
      else if (e.key === 'ArrowRight') a.a = snap(a.a - (e.shiftKey ? 45 : 5));
      else if (e.key === 'Delete' || e.key === 'Backspace') { removeArrow(a.k); say(FORCES[a.k].name + ' removed.'); }
      else if (e.key === 'n' || e.key === 'N') { var i = B.arrows.indexOf(a); B.sel = B.arrows[(i + 1) % B.arrows.length].k; }
      else used = false;
      if (used) { e.preventDefault(); B.ok = false; B.shown = false; if (B.arrows.length) say(FORCES[B.sel] ? FORCES[B.sel].name + ' points ' + dirWords(a.a) + '.' : ''); }
    });
    function dirWords(a) { a = ((a % 360) + 360) % 360; var n = ['right', 'up and right', 'up', 'up and left', 'left', 'down and left', 'down', 'down and right']; return n[Math.round(a / 45) % 8] + ' (' + (a > 180 ? a - 360 : a) + '°)'; }
    function angDiff(a, b) { var d = ((a - b) % 360 + 540) % 360 - 180; return Math.abs(d); }
    $('nl4b-check').addEventListener('click', function () {
      var sc = scene(), ans = sc.ans, notes = [], good = 0, need = Object.keys(ans).length;
      Object.keys(ans).forEach(function (k) {
        var a = B.arrows.filter(function (x) { return x.k === k; })[0];
        if (!a) notes.push('Missing: ' + FORCES[k].name.toLowerCase() + '.');
        else if (angDiff(a.a, ans[k]) > 20) notes.push(FORCES[k].name + ': ' + WRONGDIR[k]);
        else good++;
      });
      B.arrows.forEach(function (a) { if (!(a.k in ans)) notes.push((sc.extraMsg && sc.extraMsg[a.k]) || EXTRA[a.k]); });
      if (!notes.length && good === need) {
        B.ok = true; var first = !B.done[sc.id]; B.done[sc.id] = 1; store.set('done', B.done); chips();
        var n = Object.keys(B.done).length;
        say('✓ Correct! ' + (first ? n + ' of ' + SCENES.length + ' scenes done.' : '') + (n === SCENES.length && first ? ' You can draw free-body diagrams.' : ''), 'good');
      } else { B.ok = false; say(notes.join(' '), 'bad'); }
    });
    $('nl4b-show').addEventListener('click', function () { B.shown = !B.shown; say(B.shown ? 'The dashed arrows show the answer. ' + scene().text : ''); });
    $('nl4b-clear').addEventListener('click', function () { B.arrows = []; B.sel = null; B.armed = null; B.shown = false; B.ok = false; chips(); say(scene().text); });

    function drawScene(g) {
      var id = scene().id, cx = g.cx, cy = g.cy, w = g.w, h = g.h, u = Math.min(w, h) / 10;
      c.save();
      if (id === 'book' || id === 'puck' || id === 'sled') {
        var top = cy + (id === 'book' ? u * 0.6 : u * 0.45);
        if (id === 'book') {
          c.fillStyle = '#8a5a33'; c.fillRect(cx - u * 4, top, u * 8, u * 0.5);
          c.fillStyle = '#6b4325'; c.fillRect(cx - u * 3.6, top + u * 0.5, u * 0.4, h - top); c.fillRect(cx + u * 3.2, top + u * 0.5, u * 0.4, h - top);
          c.fillStyle = '#2f6db5'; rrect(c, cx - u * 1.5, cy - u * 0.6, u * 3, u * 1.2, 3); c.fill(); c.fillStyle = '#f1f3f5'; c.fillRect(cx - u * 1.4, cy + u * 0.15, u * 2.8, u * 0.35);
        } else {
          c.fillStyle = id === 'puck' ? '#cfe9f7' : '#eef4f8'; c.fillRect(0, top, w, h - top);
          if (id === 'puck') { c.strokeStyle = 'rgba(201,42,42,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(w * 0.15, top); c.lineTo(w * 0.15, h); c.stroke(); c.fillStyle = '#111'; c.beginPath(); c.ellipse(cx, cy + u * 0.2, u * 0.9, u * 0.25, 0, 0, 7); c.fill(); c.fillRect(cx - u * 0.9, cy - u * 0.05, u * 1.8, u * 0.25); c.beginPath(); c.ellipse(cx, cy - u * 0.05, u * 0.9, u * 0.25, 0, 0, 7); c.fillStyle = '#2a2a2a'; c.fill(); }
          else {
            c.fillStyle = '#c0612d'; rrect(c, cx - u * 1.6, cy - u * 0.5, u * 3.2, u * 0.8, 6); c.fill();
            c.strokeStyle = '#495057'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - u * 1.8, top - 2); c.lineTo(cx + u * 1.5, top - 2); c.quadraticCurveTo(cx + u * 2.1, top - 2, cx + u * 2.1, cy - u * 0.2); c.stroke();
            c.strokeStyle = '#e9d8a6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx + u * 1.5, cy - u * 0.2); c.lineTo(cx + u * 1.5 + Math.cos(30 * DEG) * u * 6, cy - u * 0.2 - Math.sin(30 * DEG) * u * 6); c.stroke();
          }
          label(c, id === 'puck' ? 'sliding →' : 'moving → at a steady speed', cx, top + u * 0.9, '#33444f', { size: 12, align: 'center', bold: true, plain: true });
        }
      } else if (id === 'lamp') {
        c.fillStyle = '#23394a'; c.fillRect(0, 0, w, 10);
        c.strokeStyle = '#cfdde6'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, 10); c.lineTo(cx, cy - u * 0.5); c.stroke();
        var gl = c.createRadialGradient(cx, cy + u * 0.6, 2, cx, cy + u * 0.6, u * 3); gl.addColorStop(0, 'rgba(255,212,121,.35)'); gl.addColorStop(1, 'rgba(255,212,121,0)'); c.fillStyle = gl; c.fillRect(0, 0, w, h);
        c.fillStyle = '#ffd479'; c.beginPath(); c.moveTo(cx - u * 0.4, cy - u * 0.5); c.lineTo(cx + u * 0.4, cy - u * 0.5); c.lineTo(cx + u * 1.1, cy + u * 0.5); c.lineTo(cx - u * 1.1, cy + u * 0.5); c.closePath(); c.fill();
      } else if (id === 'car') {
        var a = 20 * DEG, ox = cx - u * 0.6, oy = cy + u * 1.0;
        c.fillStyle = '#3d4f5c'; c.beginPath(); c.moveTo(ox - Math.cos(a) * w, oy + Math.sin(a) * w); c.lineTo(ox + Math.cos(a) * w, oy - Math.sin(a) * w); c.lineTo(w + 10, h + 10); c.lineTo(-10, h + 10); c.closePath(); c.fill();
        c.save(); c.translate(cx + Math.sin(a) * u * 0.05, cy); c.rotate(-a);
        c.fillStyle = '#e03131'; rrect(c, -u * 1.7, -u * 0.55, u * 3.4, u * 0.9, 8); c.fill(); rrect(c, -u * 0.9, -u * 1.15, u * 1.8, u * 0.75, 8); c.fill();
        c.fillStyle = '#a5d8ff'; c.fillRect(-u * 0.75, -u * 1.0, u * 0.65, u * 0.45); c.fillRect(u * 0.05, -u * 1.0, u * 0.65, u * 0.45);
        c.fillStyle = '#111'; c.beginPath(); c.arc(-u * 1.05, u * 0.38, u * 0.38, 0, 7); c.arc(u * 1.05, u * 0.38, u * 0.38, 0, 7); c.fill();
        c.restore();
        label(c, '20°', ox - u * 2.6, oy + u * 0.6, '#ffd479', { size: 12, bold: true });
      } else if (id === 'sky') {
        var sg = c.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, '#1c4a72'); sg.addColorStop(1, '#5b9bd5'); c.fillStyle = sg; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,255,255,.35)'; for (var i = 0; i < 6; i++) { c.beginPath(); c.ellipse((i * 137) % w, (i * 89) % h, u * 1.4, u * 0.4, 0, 0, 7); c.fill(); }
        c.strokeStyle = '#ffd43b'; c.lineWidth = u * 0.28; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - u * 1.3, cy - u * 0.4); c.lineTo(cx, cy); c.lineTo(cx + u * 1.3, cy - u * 0.4); c.moveTo(cx - u * 1, cy + u * 0.9); c.lineTo(cx, cy + u * 0.2); c.lineTo(cx + u * 1, cy + u * 0.9); c.moveTo(cx, cy - u * 0.2); c.lineTo(cx, cy + u * 0.3); c.stroke();
        c.fillStyle = '#ffd43b'; c.beginPath(); c.arc(cx, cy - u * 0.55, u * 0.3, 0, 7); c.fill();
        label(c, 'falling ↓ at a steady speed', cx, h - 18, '#fff', { size: 12, align: 'center', bold: true });
      } else if (id === 'spring') {
        c.fillStyle = '#23394a'; c.fillRect(cx - u * 2, 0, u * 4, 10);
        c.strokeStyle = '#66d9e8'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, 10); var n = 12, top2 = 10 + u * 0.3, bot2 = cy - u * 0.6;
        for (var j = 0; j <= n; j++) c.lineTo(cx + (j % 2 ? u * 0.4 : -u * 0.4) * (j > 0 && j < n ? 1 : 0), top2 + (bot2 - top2) * j / n); c.lineTo(cx, cy - u * 0.5); c.stroke();
        c.fillStyle = '#868e96'; rrect(c, cx - u * 0.75, cy - u * 0.55, u * 1.5, u * 1.3, 4); c.fill(); label(c, '2 kg', cx + u * 0.38, cy + u * 0.45, '#06111a', { bold: true, align: 'center', plain: true, size: 11 });
      }
      c.restore();
    }
    L.loop(function () {
      var g = geom(); bg(c, g.w, g.h); drawScene(g);
      var sc = scene();
      if (B.shown) Object.keys(sc.ans).forEach(function (k) { var a = sc.ans[k] * DEG; arrow(c, g.cx, g.cy, Math.cos(a) * g.Lr * 0.92, -Math.sin(a) * g.Lr * 0.92, FORCES[k].col, { width: 2.5, dash: [6, 5], alpha: 0.9 }); label(c, FORCES[k].sym, g.cx + Math.cos(a) * (g.Lr + 18), g.cy - Math.sin(a) * (g.Lr + 18), FORCES[k].col, { bold: true, size: 13, align: 'center' }); });
      B.arrows.forEach(function (a) {
        var f = FORCES[a.k], an = a.a * DEG, tx = g.cx + Math.cos(an) * g.Lr, ty = g.cy - Math.sin(an) * g.Lr;
        arrow(c, g.cx, g.cy, tx - g.cx, ty - g.cy, f.col, { glow: true, width: 3.5 });
        label(c, f.sym, g.cx + Math.cos(an) * (g.Lr + 18), g.cy - Math.sin(an) * (g.Lr + 18), f.col, { bold: true, size: 14, align: 'center' });
        if (B.sel === a.k) { c.strokeStyle = f.col; c.lineWidth = 1.5; c.beginPath(); c.arc(tx, ty, 13, 0, 7); c.stroke(); }
      });
      c.fillStyle = '#fff'; c.beginPath(); c.arc(g.cx, g.cy, 4.5, 0, 7); c.fill();
      if (B.ok) { c.strokeStyle = C.green; c.lineWidth = 3; c.globalAlpha = 0.8; c.beginPath(); c.arc(g.cx, g.cy, g.Lr + 34, 0, 7); c.stroke(); c.globalAlpha = 1; }
      if (B.armed) label(c, 'Tap where the ' + FORCES[B.armed].name.toLowerCase() + ' should point', g.w / 2, 18, C.gold, { bold: true, align: 'center' });
    }, box);
    pickScene(0);
  })();
})(window, document);
