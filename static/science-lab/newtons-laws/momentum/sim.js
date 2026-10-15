/* Newton's Laws, Chapter 5: Momentum and Collisions. Three interactive pieces:
   1. the air track (main simulation, with missions), 2. impulse and crash safety, 3. a pool table for 2-D collisions.
   The models are in physics.js (window.NL5Phys) and tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, P = W.NL5Phys, root = D.getElementById('nl5-lab');
  if (!root || !L || !P) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, DEG = Math.PI / 180;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', panel: 'rgba(11,27,39,.9)' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function grp(s) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function arrow(c, x, y, dx, dy, col, o) {
    o = o || {};
    var len = Math.hypot(dx, dy); if (len < 2) return;
    var ux = dx / len, uy = dy / len, hw = o.head || clamp(3 + len * 0.16, 5, 10), lw = o.width || 3;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.glow) { c.shadowColor = col; c.shadowBlur = 9; }
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx - ux * hw * 1.3, y + dy - uy * hw * 1.3); c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(x + dx, y + dy);
    c.lineTo(x + dx - ux * hw * 1.9 - uy * hw * 0.85, y + dy - uy * hw * 1.9 + ux * hw * 0.85);
    c.lineTo(x + dx - ux * hw * 1.9 + uy * hw * 0.85, y + dy - uy * hw * 1.9 - ux * hw * 0.85);
    c.closePath(); c.fill(); c.restore();
  }
  function label(c, text, x, y, col, o) {
    o = o || {};
    c.save(); c.font = (o.bold ? '600 ' : '') + (o.size || 12) + 'px system-ui,-apple-system,"Segoe UI",sans-serif';
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
    if (o.fit) { var tw = c.measureText(text).width, cw = c.canvas.width / (c.getTransform ? c.getTransform().a || 1 : 1), lft = o.align === 'right' ? x - tw : o.align === 'center' ? x - tw / 2 : x; if (lft < 6) x += 6 - lft; else if (lft + tw > cw - 6) x -= lft + tw - (cw - 6); }
    if (!o.plain) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(6,17,26,.92)'; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = col; c.fillText(text, x, y); c.restore();
  }
  function rrect(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function bg(c, w, h) { var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1c2a'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  function seg(groupEl, attr, val) { groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === val)); }); }
  function panelBox(c, x, y, w, h, title) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) label(c, title, x + 10, y + 13, C.muted, { size: 10.5, bold: true });
  }
  function hatch(c, x, y, w, h, col) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath();
    for (var i = -h; i < w + h; i += 6) { c.moveTo(x + i, y + h); c.lineTo(x + i + h, y); }
    c.stroke(); c.restore();
  }

  /* =====================================================================================
     1. THE AIR TRACK
     ===================================================================================== */
  (function () {
    var view = $('nl5-view'), cv = $('nl5-cv'), hud = $('nl5-hud'); if (!cv) return;
    var G5 = L.canvas(cv), c = G5.c, store = L.store('nl5');
    var TLEN = 2.0, X1 = 0.42, X2 = 1.38, BUMP = 0.03;
    var el = { m1: $('nl5-m1'), m1O: $('nl5-m1-o'), v1: $('nl5-v1'), v1O: $('nl5-v1-o'), m2: $('nl5-m2'), m2O: $('nl5-m2-o'), v2: $('nl5-v2'), v2O: $('nl5-v2-o'),
      e: $('nl5-e'), eO: $('nl5-e-o'), slow: $('nl5-slowmo'), read: $('nl5-read'), pre: $('nl5-pre'), go: $('nl5-go'), go2: $('nl5-go2'), replay: $('nl5-replay'), pause: $('nl5-pause') };
    var S = { m1: 0.4, m2: 0.4, v1: 0.6, v2: 0, e: 1, slowAuto: store.get('slow', true) !== false, state: 'ready', run: null, ts: 1, replay: false, paused: false,
      parts: [], flash: 0, shimmer: 0, scale: null, last: null, msg: '' };
    function glen(m) { return 0.12 + 0.08 * Math.sqrt(m); }
    function make() { return new P.Track({ m1: S.m1, m2: S.m2, e: S.e, v1: S.v1, v2: S.v2, x1: X1, x2: X2, l1: glen(S.m1), l2: glen(S.m2), len: TLEN, tau: 0.06 }); }
    function scales() { // chart scales fixed for the whole run, from the before and after values
      var r = P.collide(S.m1, S.v1, S.m2, S.v2, S.e), p = S.m1 * S.v1 + S.m2 * S.v2;
      var pm = Math.max(Math.abs(S.m1 * S.v1), Math.abs(S.m2 * S.v2), Math.abs(p), Math.abs(S.m1 * r.v1), Math.abs(S.m2 * r.v2), 0.02);
      var K = P.ke(S.m1, S.v1) + P.ke(S.m2, S.v2);
      return { p: pm * 1.12, K: Math.max(K, 1e-4) * 1.08, F: Math.PI * Math.abs(r.J) / (2 * 0.06) * 1.15 || 1, J: r.J };
    }
    function reset() { S.run = make(); S.state = 'ready'; S.replay = false; S.ts = 1; S.scale = scales(); S.parts.length = 0; S.msg = ''; buttons(); }
    function launch() {
      if (S.v1 <= S.v2) { L.toast(view, 'They will never meet: give A a bigger rightward speed than B.'); }
      S.run = make(); S.scale = scales(); S.state = 'running'; S.replay = false; S.ts = 1; S.parts.length = 0; S.msg = ''; setPause(false); buttons();
    }
    function replay() {
      if (!S.last) return;
      S.run = make(); S.scale = scales();
      var tc = S.last.t0; S.run.step(Math.max(0, tc - 0.12)); S.state = 'running'; S.replay = true; S.ts = 1 / 40; setPause(false); buttons();
    }
    function setPause(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
    function buttons() { el.replay.disabled = !S.last; }
    function eText(e) { return e === 0 ? '0: they stick' : e === 1 ? '1: perfectly elastic' : fmt(e, 2) + (e < 0.35 ? ': nearly dead' : e < 0.8 ? ': partly bouncy' : ': very bouncy'); }
    function sync() {
      el.m1.value = S.m1; el.m1O.textContent = fmt(S.m1, 2) + ' kg';
      el.m2.value = S.m2; el.m2O.textContent = fmt(S.m2, 2) + ' kg';
      el.v1.value = S.v1; el.v1O.textContent = (S.v1 > 0 ? '+' : '') + fmt(S.v1, 2) + ' m/s';
      el.v2.value = S.v2; el.v2O.textContent = (S.v2 > 0 ? '+' : '') + fmt(S.v2, 2) + ' m/s';
      el.e.value = S.e; el.eO.textContent = eText(S.e); el.slow.checked = S.slowAuto;
      el.pre.querySelectorAll('button').forEach(function (b) { var q = PRE[b.dataset.pre]; b.setAttribute('aria-pressed', String(q.m1 === S.m1 && q.m2 === S.m2 && q.v1 === S.v1 && q.v2 === S.v2 && q.e === S.e)); });
    }
    var PRE = { stick: { m1: 0.4, m2: 0.4, v1: 0.6, v2: 0, e: 0 }, bounce: { m1: 0.4, m2: 0.4, v1: 0.6, v2: 0, e: 1 }, heavy: { m1: 1.6, m2: 0.2, v1: 0.5, v2: 0, e: 1 }, head: { m1: 0.6, m2: 0.3, v1: 0.5, v2: -0.7, e: 0.7 } };
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre]; S.m1 = q.m1; S.m2 = q.m2; S.v1 = q.v1; S.v2 = q.v2; S.e = q.e; sync(); reset(); });
    [['m1', 'm1'], ['m2', 'm2'], ['v1', 'v1'], ['v2', 'v2'], ['e', 'e']].forEach(function (pr) { el[pr[0]].addEventListener('input', function () { S[pr[1]] = +el[pr[0]].value; sync(); reset(); }); });
    el.slow.addEventListener('change', function () { S.slowAuto = el.slow.checked; store.set('slow', S.slowAuto); });
    el.go.addEventListener('click', launch); el.go2.addEventListener('click', launch);
    el.replay.addEventListener('click', replay);
    $('nl5-reset').addEventListener('click', reset);
    el.pause.addEventListener('click', function () { setPause(!S.paused); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'Enter' || k === 'l' || k === 'L') launch(); else if (k === ' ') setPause(!S.paused); else if (k === 'r' || k === 'R') reset(); else if (k === 'z' || k === 'Z') replay(); else used = false;
      if (used) e.preventDefault();
    });

    /* missions */
    var MIS = [
      { id: 'stick', title: 'Stick and stop dead', goal: 'Make the gliders stick together and stop completely.' },
      { id: 'pass', title: 'Pass it on', goal: 'Equal masses, perfectly elastic, one at rest: hand all the motion to the other glider.' },
      { id: 'swap', title: 'Head-on swap', goal: 'Two equal gliders meet head-on, perfectly elastic. Make them trade velocities.' },
      { id: 'double', title: 'Nearly twice as fast', goal: 'A heavy glider hits a light one at rest. Launch the light one at more than 1.8 times the heavy one’s speed.' },
      { id: 'bounce', title: 'Bounce back', goal: 'Send a light glider into a heavy one at rest, so it bounces back with at least 80% of its speed.' },
      { id: 'half', title: 'Where did the energy go?', goal: 'Lose exactly half of the kinetic energy in one collision (within 1%).' }
    ];
    var M = L.missions($('nl5-missions'), 'nl5', MIS, function (id) {
      var q = { stick: { m1: 0.5, m2: 0.25, v1: 0.4, v2: -0.4, e: 0 }, pass: { m1: 0.4, m2: 0.3, v1: 0.6, v2: 0, e: 1 }, swap: { m1: 0.4, m2: 0.4, v1: 0.5, v2: 0, e: 1 },
        double: { m1: 0.6, m2: 0.4, v1: 0.5, v2: 0, e: 1 }, bounce: { m1: 0.4, m2: 0.6, v1: 0.6, v2: 0, e: 0.8 }, half: { m1: 0.4, m2: 0.4, v1: 0.6, v2: 0, e: 0.5 } }[id];
      S.m1 = q.m1; S.m2 = q.m2; S.v1 = q.v1; S.v2 = q.v2; S.e = q.e; sync(); reset();
      var tips = { stick: 'Set the bounciness to 0. Then make the two momenta equal and opposite: m₁v₁ = −m₂v₂.', pass: 'Make the masses equal and the bounciness 1, then launch.', swap: 'Make the masses equal, the bounciness 1, and give B a leftward speed.',
        double: 'Make A much heavier than B, and the bounciness 1.', bounce: 'Make B much heavier than A, and the bounciness close to 1.', half: 'Try equal masses, one at rest, and think about what sticking does.' };
      L.toast(view, tips[id]);
      var r = view.getBoundingClientRect(); if (r.top < 0 || r.bottom > (W.innerHeight || 800)) view.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    });
    function win(id, text) { if (M.done(id)) { L.toast(view, '★ ' + text); S.flash = 1.2; } }
    function judge(T) {
      var b = T.before, a = T.after, m1 = T.m1, m2 = T.m2, e = T.e, eq = Math.abs(m1 - m2) < 1e-9;
      var K0 = b.K1 + b.K2, K1 = a.K1 + a.K2;
      if (e === 0 && Math.abs(a.v1) < 0.005) win('stick', 'Equal and opposite momenta add to zero, so the stuck pair can’t move.');
      var aRest = Math.abs(b.v1) < 1e-9, bRest = Math.abs(b.v2) < 1e-9, st = null;
      if (bRest && b.v1 > 0) st = { vs: b.v1, vsA: a.v1, vt: a.v2, ms: m1, mt: m2 };
      else if (aRest && b.v2 < 0) st = { vs: -b.v2, vsA: -a.v2, vt: -a.v1, ms: m2, mt: m1 };
      if (st && eq && e >= 0.999 && Math.abs(st.vsA) < 0.01 * st.vs) win('pass', 'The striker stops dead and the other leaves at its speed: all the momentum and all the energy handed over.');
      if (eq && e >= 0.999 && b.v1 > 0 && b.v2 < 0 && Math.abs(a.v1 - b.v2) < 1e-6 && Math.abs(a.v2 - b.v1) < 1e-6) win('swap', 'Equal masses, elastic: they trade velocities, as if they passed through each other.');
      if (st && st.ms > st.mt && st.vt >= 1.8 * st.vs) win('double', 'The light one leaves at ' + fmt(st.vt / st.vs, 2) + '× the speed. In the limit of a very heavy striker it would be exactly 2×.');
      if (st && st.ms < st.mt && st.vsA < 0 && -st.vsA >= 0.8 * st.vs) win('bounce', 'It bounced back at ' + Math.round(-st.vsA / st.vs * 100) + '% of its speed, and the heavy one barely moved: like a ball off a wall.');
      if (K0 > 1e-9 && Math.abs(K1 / K0 - 0.5) < 0.005) win('half', 'Half the kinetic energy became heat, sound and bent bumper, yet momentum came through untouched.');
    }

    /* drawing */
    function trackGeom() {
      var w = G5.w, h = G5.h, narrow = w < 600;
      var th = narrow ? h * 0.46 : h * 0.44, x0 = 18, x1 = w - 18;
      return { w: w, h: h, narrow: narrow, th: th, x0: x0, x1: x1, sc: (x1 - x0) / TLEN, ty: th - (narrow ? 66 : 56) };
    }
    function glider(g, x, len, m, col, hi, name, side, squeeze, sticky) {
      var X = g.x0 + (x - len / 2) * g.sc, Wd = len * g.sc, b = BUMP * g.sc, hgt = 28, y = g.ty - hgt;
      var bodyX = side > 0 ? X : X + b, bodyW = Wd - b;
      var gd = c.createLinearGradient(0, y, 0, g.ty); gd.addColorStop(0, hi); gd.addColorStop(1, col);
      c.fillStyle = gd; rrect(c, bodyX, y, bodyW, hgt, 5); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke();
      // the sail on top
      c.fillStyle = hi; c.beginPath(); c.moveTo(bodyX + bodyW * 0.3, y); c.lineTo(bodyX + bodyW * 0.5, y - 14); c.lineTo(bodyX + bodyW * 0.7, y); c.closePath(); c.fill();
      label(c, name, bodyX + bodyW / 2, y + hgt / 2 + 1, '#06111a', { bold: true, size: 15, align: 'center', plain: true });
      label(c, fmt(m, 2) + ' kg', bodyX + bodyW / 2, y - 24, hi, { size: 11, bold: true, align: 'center', fit: true });
      // the bumper on the facing side
      var bx0 = side > 0 ? bodyX + bodyW : bodyX, sq = clamp(squeeze, 0, 0.85 * b), bl = b - sq, dir = side > 0 ? 1 : -1;
      if (sticky) { c.fillStyle = '#868e96'; c.fillRect(side > 0 ? bx0 : bx0 - Math.max(3, bl * 0.35), y + 4, Math.max(3, bl * 0.35), hgt - 8); hatch(c, side > 0 ? bx0 : bx0 - Math.max(3, bl * 0.35), y + 4, Math.max(3, bl * 0.35), hgt - 8, 'rgba(0,0,0,.35)'); }
      else {
        c.strokeStyle = '#dbe7ef'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx0, y + hgt / 2);
        var n = 6; for (var i = 1; i <= n; i++) c.lineTo(bx0 + dir * bl * i / n, y + hgt / 2 + (i % 2 ? -5 : 5) * (i < n ? 1 : 0));
        c.stroke(); c.fillStyle = '#dbe7ef'; c.fillRect(bx0 + dir * bl - (dir > 0 ? 2 : 0), y + hgt / 2 - 6, 2, 12);
      }
      return { cx: X + Wd / 2, top: y - 30 };
    }
    function draw() {
      var g = trackGeom(), w = g.w, h = g.h, T = S.run; bg(c, w, h);
      // the track
      var ty = g.ty;
      c.fillStyle = 'rgba(116,192,252,.06)'; c.fillRect(g.x0, ty - 3, g.x1 - g.x0, 3);
      var tg = c.createLinearGradient(0, ty, 0, ty + 16); tg.addColorStop(0, '#c9d6de'); tg.addColorStop(1, '#5f7684');
      c.fillStyle = tg; c.fillRect(g.x0, ty, g.x1 - g.x0, 16);
      S.shimmer += 0.016;
      for (var hx = g.x0 + 8; hx < g.x1 - 4; hx += 11) { var al = reduced ? 0.45 : 0.3 + 0.25 * Math.sin(hx * 0.37 + S.shimmer * 6); c.fillStyle = 'rgba(116,192,252,' + al.toFixed(3) + ')'; c.beginPath(); c.arc(hx, ty + 3, 1.3, 0, 7); c.fill(); }
      c.fillStyle = '#2f4c61'; c.fillRect(g.x0 - 6, ty - 20, 6, 36); c.fillRect(g.x1, ty - 20, 6, 36);
      // ruler
      c.strokeStyle = 'rgba(143,179,198,.4)'; c.lineWidth = 1; c.beginPath();
      for (var r = 0; r <= TLEN + 1e-9; r += 0.1) { var rx = g.x0 + r * g.sc, big = Math.abs(r * 2 - Math.round(r * 2)) < 1e-6; c.moveTo(rx + 0.5, ty + 18); c.lineTo(rx + 0.5, ty + (big ? 27 : 22)); if (big && (!g.narrow || Math.abs(r - Math.round(r)) < 1e-6)) label(c, fmt(r, 1) + ' m', rx, ty + 35, C.muted, { size: 9.5, align: 'center' }); }
      c.stroke();
      // center of mass marker
      var xcm = (T.m1 * T.x1 + T.m2 * T.x2) / (T.m1 + T.m2), cmx = g.x0 + xcm * g.sc;
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(cmx, ty + 17); c.lineTo(cmx - 5, ty + 25); c.lineTo(cmx + 5, ty + 25); c.closePath(); c.fill();
      label(c, g.narrow ? 'c.m.' : 'center of mass', cmx, ty + 47, '#fff', { size: 9.5, align: 'center', fit: true });
      // gliders
      var over = Math.max(0, -T.gap()), sticky = T.e === 0;
      var A = glider(g, T.x1, T.l1, T.m1, '#b8860b', C.gold, 'A', 1, over / 2, sticky), B = glider(g, T.x2, T.l2, T.m2, '#1c7ed6', C.blue, 'B', -1, over / 2, sticky);
      // flash and sparks at the contact
      if (T.phase === 'contact') {
        var fx = g.x0 + (T.x1 + T.l1 / 2 - over / 2) * g.sc, fr = 8 + 26 * T.F / (S.scale.F || 1);
        var gl = c.createRadialGradient(fx, ty - 12, 1, fx, ty - 12, fr * 1.6); gl.addColorStop(0, 'rgba(255,240,200,.85)'); gl.addColorStop(1, 'rgba(255,212,121,0)');
        c.fillStyle = gl; c.beginPath(); c.arc(fx, ty - 12, fr * 1.6, 0, 7); c.fill();
        if (!reduced && Math.random() < 0.6) S.parts.push({ x: fx, y: ty - 12, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 90, life: 0.8 });
      }
      for (var i = S.parts.length - 1; i >= 0; i--) { var pt = S.parts[i]; c.globalAlpha = clamp(pt.life, 0, 1); c.fillStyle = C.gold; c.fillRect(pt.x, pt.y, 2, 2); }
      c.globalAlpha = 1;
      // velocity arrows
      var ka = Math.min(110, w * 0.13);
      [[A, T.v1, '#ffd479'], [B, T.v2, '#74c0fc']].forEach(function (q, j) {
        var y = q[0].top - 14 - j * 7;
        if (Math.abs(q[1]) > 0.004) arrow(c, q[0].cx, y, q[1] * ka, 0, q[2], { glow: true, width: 3 });
        label(c, (q[1] > 0 ? '+' : '') + fmt(q[1], 2) + ' m/s', q[0].cx + (j ? 6 : -6), y - 15, q[2], { size: 11, bold: true, align: j ? 'left' : 'right', fit: true });
      });
      var my = g.narrow ? g.th - 4 : g.th * 0.18 + 6;
      if (S.state === 'ready') label(c, 'Press ▶ Launch', w / 2, my, C.gold, { bold: true, size: 14, align: 'center' });
      if (S.msg) label(c, S.msg, w / 2, my, C.gold, { bold: true, size: g.narrow ? 11.5 : 13, align: 'center', fit: true });
      if (S.ts < 0.9) label(c, '🐢 slow motion ×1/' + Math.round(1 / S.ts), g.x1 - 4, g.th - 8, C.blue, { size: 11, bold: true, align: 'right' });
      charts(g);
    }
    function charts(g) {
      var T = S.run, w = g.w, h = g.h, y0 = g.th + 6, pad = 10, sc = S.scale;
      var now = T.phase === 'after' ? T.after : T.snapshot(), bef = T.before || T.snapshot(), hasAfter = T.phase !== 'before';
      var boxes;
      if (!g.narrow) { var cw = (w - pad * 4) / 3; boxes = { p: [pad, y0, cw * 1.05, h - y0 - pad], K: [pad * 2 + cw * 1.05, y0, cw * 0.9, h - y0 - pad], F: [pad * 3 + cw * 1.95, y0, cw * 1.05, h - y0 - pad] }; }
      else { var hh1 = (h - y0 - pad * 2) * 0.56, cw2 = (w - pad * 3) / 2; boxes = { p: [pad, y0, cw2, hh1], K: [pad * 2 + cw2, y0, cw2, hh1], F: [pad, y0 + hh1 + pad, w - pad * 2, h - y0 - hh1 - pad * 2] }; }
      // momentum bars
      var b = boxes.p; panelBox(c, b[0], b[1], b[2], b[3], g.narrow ? 'MOMENTUM (kg·m/s)' : 'MOMENTUM p = mv (kg·m/s)');
      var top = b[1] + 46, bot = b[1] + b[3] - 20, mid = (top + bot) / 2, ky = (bot - top) / 2 / sc.p;
      c.strokeStyle = 'rgba(143,179,198,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(b[0] + 8, mid); c.lineTo(b[0] + b[2] - 8, mid); c.stroke();
      var gw = (b[2] - 24) / 2, bw = Math.min(26, gw / 4.2);
      function pgroup(x, s, ghost, title) {
        var vals = [[s.p1, C.gold, 'A'], [s.p2, C.blue, 'B'], [s.p1 + s.p2, '#ffffff', 'total']];
        vals.forEach(function (v, i) {
          var bx = x + gw / 2 - bw * 1.75 + i * bw * 1.25, hgt = v[0] * ky;
          c.globalAlpha = ghost ? 0.25 : 1; c.fillStyle = v[1]; if (Math.abs(hgt) > 0.5) c.fillRect(bx, Math.min(mid, mid - hgt), bw, Math.abs(hgt));
          c.globalAlpha = 1; label(c, v[2], bx + bw / 2, bot + 9, C.muted, { size: 9.5, align: 'center' });
          if (i === 2 && !ghost) label(c, fmt(v[0], 3), bx + bw / 2, hgt >= 0 ? mid - hgt - 9 : mid - hgt + 9, '#fff', { size: 10, bold: true, align: 'center' });
        });
        label(c, title, x + gw / 2, b[1] + 30, C.ink, { size: 10.5, bold: true, align: 'center' });
      }
      pgroup(b[0] + 12, bef, false, 'Before');
      pgroup(b[0] + 12 + gw, now, !hasAfter && S.state === 'ready', T.phase === 'after' ? 'After' : 'Now');
      // kinetic energy bars
      b = boxes.K; panelBox(c, b[0], b[1], b[2], b[3], g.narrow ? 'ENERGY ½mv² (J)' : 'KINETIC ENERGY ½mv² (J)');
      top = b[1] + 46; bot = b[1] + b[3] - 20;
      var kk = (bot - top) / sc.K, K0 = bef.K1 + bef.K2, Kn = now.K1 + now.K2, bw2 = Math.min(34, (b[2] - 30) / 4);
      function kbar(x, s, lost, ttl) {
        var y = bot, a = s.K1 * kk, bb = s.K2 * kk;
        c.fillStyle = C.gold; c.fillRect(x, y - a, bw2, a); c.fillStyle = C.blue; c.fillRect(x, y - a - bb, bw2, bb);
        if (lost > 1e-9) { var lh = lost * kk; c.fillStyle = 'rgba(255,135,135,.22)'; c.fillRect(x, y - a - bb - lh, bw2, lh); hatch(c, x, y - a - bb - lh, bw2, lh, 'rgba(255,135,135,.8)'); }
        label(c, ttl, x + bw2 / 2, bot + 9, C.muted, { size: 9.5, align: 'center' });
      }
      var bx1 = b[0] + b[2] * 0.25 - bw2 / 2, bx2 = b[0] + b[2] * 0.62 - bw2 / 2;
      kbar(bx1, bef, 0, 'Before'); if (S.state !== 'ready' || hasAfter) kbar(bx2, now, Math.max(0, K0 - Kn), T.phase === 'after' ? 'After' : 'Now');
      label(c, fmt(K0, 3) + ' J', bx1 + bw2 / 2, bot - K0 * kk - 9, '#fff', { size: 10, bold: true, align: 'center' });
      if (S.state !== 'ready' || hasAfter) {
        var lostPct = K0 > 1e-9 ? (K0 - Kn) / K0 * 100 : 0;
        label(c, fmt(Kn, 3) + ' J', bx2 + bw2 / 2, bot - Kn * kk - 9 - (lostPct > 0.5 ? (K0 - Kn) * kk : 0), '#fff', { size: 10, bold: true, align: 'center' });
        if (lostPct > 0.5) label(c, (T.phase === 'contact' ? 'in the bumpers ' : 'lost as heat & sound ') + Math.round(lostPct) + '%', b[0] + b[2] - 8, b[1] + 28, C.red, { size: 9.5, align: 'right', bold: true });
      }
      // force–time graph
      b = boxes.F; panelBox(c, b[0], b[1], b[2], b[3], g.narrow ? 'FORCE ON B (N) vs TIME (ms)' : 'CONTACT FORCE ON B (N) vs TIME (ms)');
      var gx = b[0] + 36, gx2 = b[0] + b[2] - 10, gy = b[1] + b[3] - 20, gy2 = b[1] + 46;
      c.strokeStyle = 'rgba(143,179,198,.4)'; c.beginPath(); c.moveTo(gx, gy2); c.lineTo(gx, gy); c.lineTo(gx2, gy); c.stroke();
      if (T.c) {
        var tau = T.c.tau, J = T.c.J, peak = T.c.peak, sx = (gx2 - gx) / (tau * 1.25), sy = (gy - gy2) / (peak * 1.12), now_s = T.phase === 'contact' ? T.t - T.c.t0 : tau;
        c.beginPath(); c.moveTo(gx, gy);
        for (var i2 = 0; i2 <= 60; i2++) { var s = tau * i2 / 60; c.lineTo(gx + s * sx, gy - P.pulseF(J, tau, s) * sy); } c.lineTo(gx + tau * sx, gy); c.closePath();
        c.fillStyle = 'rgba(255,212,121,.10)'; c.fill();
        c.save(); c.beginPath(); c.rect(gx, gy2 - 10, Math.max(0, now_s) * sx, gy - gy2 + 10); c.clip();
        c.beginPath(); c.moveTo(gx, gy); for (i2 = 0; i2 <= 60; i2++) { s = tau * i2 / 60; c.lineTo(gx + s * sx, gy - P.pulseF(J, tau, s) * sy); } c.lineTo(gx + tau * sx, gy); c.closePath();
        c.fillStyle = 'rgba(255,212,121,.45)'; c.fill(); c.restore();
        c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); for (i2 = 0; i2 <= 60; i2++) { s = tau * i2 / 60; var px = gx + s * sx, py = gy - P.pulseF(J, tau, s) * sy; if (i2) c.lineTo(px, py); else c.moveTo(px, py); } c.stroke();
        if (T.phase === 'contact') { c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx + now_s * sx, gy2); c.lineTo(gx + now_s * sx, gy); c.stroke(); }
        label(c, fmt(peak, peak < 10 ? 2 : 1) + ' N', gx - 4, gy - peak * sy, C.muted, { size: 9.5, align: 'right' });
        label(c, '0', gx - 4, gy, C.muted, { size: 9.5, align: 'right' });
        label(c, fmt(tau * 1000, 0) + ' ms', gx + tau * sx, gy + 10, C.muted, { size: 9.5, align: 'center' });
        label(c, 'area = impulse J = ' + fmt(J, 3) + ' N·s = Δp of B', b[0] + 10, b[1] + 29, C.gold, { size: 10.5, bold: true });
      } else label(c, 'The push between the gliders appears here.', (gx + gx2) / 2, (gy + gy2) / 2, C.muted, { size: 11, align: 'center' });
    }
    function readouts() {
      var T = S.run, b = T.before || T.snapshot(), a = T.after, p0 = b.p1 + b.p2, K0 = b.K1 + b.K2;
      var rows = [['Total momentum before', fmt(p0, 3) + ' kg·m/s'], ['Total momentum after', a ? fmt(a.p1 + a.p2, 3) + ' kg·m/s' : '—'],
        ['Kinetic energy before', fmt(K0, 3) + ' J'], ['Kinetic energy after', a ? fmt(a.K1 + a.K2, 3) + ' J' : '—'], ['Energy lost', a ? (K0 > 0 ? Math.round((K0 - a.K1 - a.K2) / K0 * 100) + '%' : '0%') : '—'],
        ['A after', a ? fmt(a.v1, 3) + ' m/s' : '—'], ['B after', a ? fmt(a.v2, 3) + ' m/s' : '—'], ['Impulse on B', T.c ? fmt(T.c.J, 3) + ' N·s' : '—'], ['Peak contact force', T.c ? fmt(T.c.peak, 2) + ' N' : '—']];
      var html = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
      if (el.read._h !== html) { el.read.innerHTML = html; el.read._h = html; }
      var pn = T.p(), hh = '<b>Total momentum</b> ' + fmt(pn, 3) + ' kg·m/s' + (T.phase === 'contact' ? ' <span style="color:#63e6be">(still the same!)</span>' : '') + '<br>A: ' + fmt(T.m1 * T.v1, 3) + ' · B: ' + fmt(T.m2 * T.v2, 3);
      if (hud._h !== hh) { hud.innerHTML = hh; hud._h = hh; }
    }
    L.loop(function (dt) {
      var T = S.run;
      if (S.state === 'running' && !S.paused) {
        var target = 1;
        if (S.replay) target = 1 / 40;
        else if (S.slowAuto) {
          var near = T.phase === 'contact' || (T.phase === 'before' && T.v1 > T.v2 && T.gap() / (T.v1 - T.v2) < 0.06) || (T.phase === 'after' && T.c && T.t - T.c.t0 - T.c.tau < 0.04);
          if (near) target = 1 / 25;
        }
        S.ts = target < S.ts ? target : S.ts + (target - S.ts) * Math.min(1, dt * 6);
        var wasPhase = T.phase;
        T.step(dt * S.ts);
        if (wasPhase !== 'after' && T.phase === 'after') {
          S.last = { t0: T.c.t0 }; buttons();
          if (!S.replay) judge(T);
        }
        if (S.replay && T.phase === 'after' && T.t - T.c.t0 - T.c.tau > 0.1) { S.replay = false; }
        if (!T.done && T.phase === 'after' && T.v1 === 0 && T.v2 === 0 && !S.replay) { T.done = true; T.why = 'rest'; }
        if (T.done) { S.state = 'done'; S.msg = T.why === 'miss' ? 'They never met. Give A more speed to the right than B.' : T.why === 'rest' ? 'Stopped dead. Launch again, or replay the hit (⟲).' : 'Run over. Launch again, or replay the hit (⟲).'; }
      }
      for (var i = S.parts.length - 1; i >= 0; i--) { var pt = S.parts[i]; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 300 * dt; pt.life -= dt * 1.5; if (pt.life <= 0) S.parts.splice(i, 1); }
      draw(); readouts();
    }, view);
    sync(); reset();
    if (/[?&]debug\b/.test(location.search)) W.NL5Debug = { S: S, M: M, launch: launch, sync: sync, reset: reset };
  })();

  /* =====================================================================================
     2. IMPULSE AND CRASH SAFETY
     ===================================================================================== */
  (function () {
    var view = $('nl5i-view'), cv = $('nl5i-cv'); if (!cv) return;
    var G5 = L.canvas(cv), c = G5.c, modeG = $('nl5i-mode'), dEl = $('nl5i-d'), dO = $('nl5i-d-o'), dLab = $('nl5i-d-l'), tab = $('nl5i-tab');
    var CRACK = 25; // N: the average force at which this simulation cracks an egg (a rough guess; real eggs vary a lot)
    var MODES = {
      egg: { m: 0.06, v: Math.sqrt(2 * P.G * 1.0), dA: 0.002, nameA: 'Hard floor', nameB: 'Cushion', min: 0.005, max: 0.15, def: 0.03 },
      car: { m: 1500, v: 50 / 3.6, dA: 0.1, nameA: 'No crumple zone', nameB: 'Crumple zone', min: 0.2, max: 1.0, def: 0.6 }
    };
    var I = { mode: 'egg', d: 0.03, clock: -1, run: false };
    function md() { return MODES[I.mode]; }
    function setMode(m) { I.mode = m; var q = md(); dEl.min = q.min; dEl.max = q.max; dEl.step = m === 'egg' ? 0.005 : 0.05; I.d = q.def; dEl.value = I.d; seg(modeG, 'data-mode', m); I.clock = -1; I.run = false; upd(); }
    function upd() { var q = md(); dO.textContent = I.mode === 'egg' ? fmt(I.d * 100, 1) + ' cm' : fmt(I.d, 2) + ' m'; dLab.textContent = I.mode === 'egg' ? 'How far the cushion squashes' : 'How far the crumple zone crushes'; table(); }
    modeG.addEventListener('click', function (e) { var b = e.target.closest('button[data-mode]'); if (b) setMode(b.dataset.mode); });
    dEl.addEventListener('input', function () { I.d = +dEl.value; I.clock = -1; I.run = false; upd(); });
    $('nl5i-go').addEventListener('click', function () { I.clock = 0; I.run = true; });
    function stops() { var q = md(); return { A: P.stop(q.m, q.v, q.dA), B: P.stop(q.m, q.v, I.d) }; }
    function table() {
      var s = stops(), q = md(), egg = I.mode === 'egg';
      function row(n, a, b) { return '<tr><th scope="row">' + n + '</th><td>' + a + '</td><td>' + b + '</td></tr>'; }
      function N(v) { return v >= 1e4 ? grp(fmt(v / 1000, 0)) + ' kN' : grp(fmt(v, v < 100 ? 1 : 0)) + ' N'; }
      var html = '<thead><tr><th></th><th scope="col">' + q.nameA + '</th><th scope="col">' + q.nameB + '</th></tr></thead><tbody>' +
        row('Change in momentum Δp', fmt(s.A.J, egg ? 3 : 0) + ' kg·m/s', fmt(s.B.J, egg ? 3 : 0) + ' kg·m/s') +
        row('Stopping distance', egg ? fmt(q.dA * 1000, 0) + ' mm' : fmt(q.dA, 2) + ' m', egg ? fmt(I.d * 100, 1) + ' cm' : fmt(I.d, 2) + ' m') +
        row('Stopping time Δt', fmt(s.A.dt * 1000, egg ? 2 : 1) + ' ms', fmt(s.B.dt * 1000, 1) + ' ms') +
        row('Average force Δp/Δt', N(s.A.Favg), N(s.B.Favg)) + row('Peak force', N(s.A.Fpeak), N(s.B.Fpeak)) +
        (egg ? row('The egg', s.A.Favg > CRACK ? 'cracks' : 'survives', s.B.Favg > CRACK ? 'cracks' : 'survives') : row('Average slowing', fmt(s.A.g, 0) + ' g', fmt(s.B.g, 1) + ' g')) + '</tbody>';
      tab.innerHTML = html;
    }
    function drawLanes(s, tA, tB, g) { // tA, tB: time since contact in each lane (s); negative = still approaching
      var q = md(), w = g.w, lh = g.lh, egg = I.mode === 'egg';
      var lanes = [{ x: 10, w: w / 2 - 15, t: tA, st: s.A, d: q.dA, name: q.nameA, col: C.red }, { x: w / 2 + 5, w: w / 2 - 15, t: tB, st: s.B, d: I.d, name: q.nameB, col: C.green }];
      lanes.forEach(function (ln) {
        panelBox(c, ln.x, 8, ln.w, lh - 8, ln.name.toUpperCase());
        var pen = 0; // how far into the cushion or crumple zone
        if (ln.t > 0) { var tt = Math.min(ln.t, ln.st.dt), k = Math.PI / ln.st.dt, X = ln.st.J * (tt - Math.sin(k * tt) / k) / 2; pen = q.v * tt - X / q.m; }
        var stopped = ln.t >= ln.st.dt, broke = egg && ln.st.Favg > CRACK && ln.t > 0;
        if (egg) {
          var floorY = lh - 18, sc = (floorY - 40) / 1.2, cushion = ln === lanes[1] ? Math.max(0.05, I.d * 1.6) * sc : 6, surf = floorY - cushion;
          c.fillStyle = '#3d4f5c'; c.fillRect(ln.x + 10, floorY, ln.w - 20, 8);
          if (ln === lanes[1]) { var cy = surf + pen * sc; c.fillStyle = '#e7d4f5'; rrect(c, ln.x + ln.w * 0.18, Math.min(cy, floorY - 3), ln.w * 0.64, floorY - Math.min(cy, floorY - 3), 10); c.fill(); }
          else { c.fillStyle = '#868e96'; c.fillRect(ln.x + 10, surf, ln.w - 20, cushion); }
          var drop = 1.0, ey;
          if (ln.t < 0) { var tf = Math.sqrt(2 * drop / P.G) + ln.t; ey = surf - (drop - 0.5 * P.G * Math.max(0, tf) * Math.max(0, tf)) * sc; }
          else ey = surf + pen * sc;
          var ex = ln.x + ln.w / 2, er = clamp(ln.w * 0.07, 9, 16);
          c.save(); c.translate(ex, ey - er * 1.25);
          var squash = ln.t > 0 && !stopped ? 1 - 0.12 * Math.sin(Math.PI * ln.t / ln.st.dt) : 1;
          c.scale(1 / squash, squash);
          if (broke && stopped) { c.fillStyle = '#fff3bf'; c.beginPath(); c.ellipse(0, er * 1.0, er * 1.9, er * 0.35, 0, 0, 7); c.fill(); c.fillStyle = '#ffd43b'; c.beginPath(); c.arc(0, er * 0.85, er * 0.45, 0, 7); c.fill(); }
          else { c.fillStyle = '#fff4e6'; c.beginPath(); c.ellipse(0, 0, er, er * 1.25, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.stroke(); if (broke) { c.strokeStyle = '#495057'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-er * 0.8, er * 0.2); c.lineTo(-er * 0.3, -er * 0.1); c.lineTo(0, er * 0.3); c.lineTo(er * 0.4, -er * 0.05); c.lineTo(er * 0.8, er * 0.25); c.stroke(); } }
          c.restore();
          if (stopped) label(c, broke ? 'Cracked!' : 'Safe', ex, 36, broke ? C.red : C.green, { bold: true, size: 14, align: 'center' });
          label(c, '1 m drop', ln.x + 14, 34, C.muted, { size: 10 });
        } else {
          var gy = lh * 0.62, wallX = ln.x + ln.w - 24, sc2 = (ln.w - 60) / 7.5, carL = 4.4 * sc2, crush = Math.min(pen, ln.d) * sc2;
          c.fillStyle = '#3d4f5c'; c.fillRect(ln.x + 8, gy + 14, ln.w - 16, 6);
          c.fillStyle = '#868e96'; c.fillRect(wallX, gy - 46, 14, 66); hatch(c, wallX, gy - 46, 14, 66, 'rgba(0,0,0,.35)');
          var front = ln.t < 0 ? wallX + ln.t * q.v * sc2 : wallX, back = front - carL + crush;
          if (ln.t < 0) back = front - carL;
          c.fillStyle = ln === lanes[0] ? '#c92a2a' : '#2b8a3e';
          rrect(c, back, gy - 16, front - back, 26, 6); c.fill(); rrect(c, back + (front - back) * 0.22, gy - 34, (front - back) * 0.45, 20, 6); c.fill();
          if (ln.t > 0 && ln === lanes[1]) { c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.5; c.beginPath(); for (var z = 0; z < 5; z++) { var zx = front - 4 - z * Math.max(3, (ln.d * sc2 - crush) / 5 + 2); c.moveTo(zx, gy - 14); c.lineTo(zx - 3, gy); c.lineTo(zx, gy + 8); } c.stroke(); }
          c.fillStyle = '#111'; c.beginPath(); c.arc(back + (front - back) * 0.2, gy + 10, 7, 0, 7); c.arc(back + (front - back) * 0.8, gy + 10, 7, 0, 7); c.fill();
          label(c, '50 km/h into a wall', ln.x + 14, 34, C.muted, { size: 10 });
          if (stopped) label(c, 'Average ' + fmt(ln.st.g, ln.st.g < 30 ? 1 : 0) + ' g', ln.x + ln.w / 2, 56, ln.col, { bold: true, size: 14, align: 'center' });
        }
      });
    }
    function drawGraph(s, tA, tB, g) {
      var y0 = g.lh + 6, x = 10, wv = g.w - 20, hv = g.h - y0 - 8; panelBox(c, x, y0, wv, hv, 'FORCE (N) vs TIME (ms) DURING THE STOP');
      var gx = x + 44, gx2 = x + wv - 12, gy = y0 + hv - 20, gy2 = y0 + 50, Tm = Math.max(s.A.dt, s.B.dt) * 1.12, Fm = Math.max(s.A.Fpeak, s.B.Fpeak) * 1.1;
      var sx = (gx2 - gx) / Tm, sy = (gy - gy2) / Fm;
      c.strokeStyle = 'rgba(143,179,198,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, gy2); c.lineTo(gx, gy); c.lineTo(gx2, gy); c.stroke();
      [[s.A, C.red, tA], [s.B, C.green, tB]].forEach(function (q) {
        var st = q[0], col = q[1];
        c.beginPath(); c.moveTo(gx, gy); for (var i = 0; i <= 80; i++) { var t = st.dt * i / 80; c.lineTo(gx + t * sx, gy - P.pulseF(st.J, st.dt, t) * sy); } c.lineTo(gx + st.dt * sx, gy); c.closePath();
        c.fillStyle = col === C.red ? 'rgba(255,135,135,.28)' : 'rgba(99,230,190,.28)'; c.fill(); c.strokeStyle = col; c.lineWidth = 2; c.stroke();
        if (q[2] > 0 && q[2] < st.dt) { c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx + q[2] * sx, gy2); c.lineTo(gx + q[2] * sx, gy); c.stroke(); }
        label(c, st.Fpeak >= 1e4 ? grp(fmt(st.Fpeak / 1000, 0)) + ' kN' : grp(fmt(st.Fpeak, st.Fpeak < 100 ? 1 : 0)) + ' N', gx + st.dt * sx / 2, gy - st.Fpeak * sy - 9, col, { size: 10, bold: true, align: 'center', fit: true });
      });
      label(c, '0', gx - 4, gy, C.muted, { size: 9.5, align: 'right' });
      label(c, fmt(Tm * 1000, Tm < 0.01 ? 1 : 0) + ' ms', gx2, gy + 10, C.muted, { size: 9.5, align: 'right' });
      label(c, 'Both shaded areas = Δp = ' + grp(fmt(s.A.J, I.mode === 'egg' ? 3 : 0)) + ' N·s', x + 10, y0 + 30, C.gold, { size: 10.5, bold: true });
    }
    L.loop(function (dt) {
      var w = G5.w, h = G5.h, g = { w: w, h: h, lh: Math.round(h * 0.5) }, s = stops(), q = md(); bg(c, w, h);
      var tA = -1, tB = -1;
      if (I.clock >= 0) {
        if (I.run) I.clock += dt;
        // approach in real time (car: from 3 m away; egg: the 1 m fall), then the stop in slow motion so the longer one lasts 2 s
        var tApp = I.mode === 'egg' ? Math.sqrt(2 * 1.0 / P.G) : 3 / q.v, warp = Math.max(s.A.dt, s.B.dt) / 2.0;
        var tr = I.clock < tApp ? I.clock - tApp : (I.clock - tApp) * warp;
        tA = tr; tB = tr;
        if (tr > Math.max(s.A.dt, s.B.dt) + 0.3 * warp) I.run = false;
      } else { tA = tB = -(I.mode === 'egg' ? Math.sqrt(2 / P.G) : 3 / q.v); }
      drawLanes(s, tA, tB, g); drawGraph(s, tA, tB, g);
      if (I.clock >= 0 && tA > 0 && I.run) label(c, '🐢 slow motion ×1/' + Math.round(1 / Math.max(s.A.dt, s.B.dt) * 2), w - 14, g.lh - 14, C.blue, { size: 11, bold: true, align: 'right' });
    }, view);
    setMode('egg');
  })();

  /* =====================================================================================
     3. THE POOL TABLE: 2-D COLLISIONS
     ===================================================================================== */
  (function () {
    var view = $('nl5b-view'), cv = $('nl5b-cv'); if (!cv) return;
    var G5 = L.canvas(cv), c = G5.c, eEl = $('nl5b-e'), eO = $('nl5b-e-o'), read = $('nl5b-read');
    var TW = 2.54, TH = 1.27, R = 0.0286, M = 0.17, SLOW = 0.25, CUSH = 0.8, POCK = 0.065, VMAX = 3;
    var B = { e: 1, balls: null, aim: { a: 0, p: 0.5 }, drag: null, moving: false, trails: [[], []], hit: null, msg: '', sunk: [false, false] };
    var POCKETS = [[0, 0], [TW / 2, -0.01], [TW, 0], [0, TH], [TW / 2, TH + 0.01], [TW, TH]];
    function layoutBalls(rand) {
      var ox = rand ? 1.45 + Math.random() * 0.6 : 1.75, oy = rand ? 0.3 + Math.random() * 0.67 : 0.5;
      B.balls = [{ x: 0.64, y: TH / 2, vx: 0, vy: 0, m: M }, { x: ox, y: oy, vx: 0, vy: 0, m: M }];
      B.trails = [[], []]; B.hit = null; B.sunk = [false, false]; B.moving = false; B.msg = '';
      var b0 = B.balls[0], b1 = B.balls[1]; B.aim.a = Math.atan2(b1.y - b0.y + 0.03, b1.x - b0.x); B.aim.p = 0.5;
    }
    eEl.addEventListener('input', function () { B.e = +eEl.value; eO.textContent = fmt(B.e, 2) + (B.e === 1 ? ' (ideal)' : ''); });
    $('nl5b-reset').addEventListener('click', function () { layoutBalls(false); });
    $('nl5b-new').addEventListener('click', function () { layoutBalls(true); });
    $('nl5b-shoot').addEventListener('click', shoot);
    var MIS = [
      { id: 'cut', title: 'Right angle', goal: 'Hit the gold ball off-center. Watch the two paths split at 90°.' },
      { id: 'stop', title: 'Stop shot', goal: 'Hit the gold ball dead center, so the white ball stops on the spot.' },
      { id: 'pot', title: 'Pot it', goal: 'Knock the gold ball into a pocket without sinking the white one.' }
    ];
    var Ms = L.missions($('nl5b-missions'), 'nl5-pool', MIS);
    function win(id, t) { if (Ms.done(id)) L.toast(view, '★ ' + t); }
    function geom() { var w = G5.w, h = G5.h, rail = 16, s = Math.min((w - 2 * rail - 28) / TW, (h - 2 * rail - 28) / TH), ox = (w - TW * s) / 2, oy = (h - TH * s) / 2; return { w: w, h: h, s: s, ox: ox, oy: oy, rail: rail }; }
    function shoot() {
      if (B.moving || B.sunk[0]) return;
      var b = B.balls[0], v = B.aim.p * VMAX; b.vx = Math.cos(B.aim.a) * v; b.vy = Math.sin(B.aim.a) * v; B.moving = true; B.hit = null; B.trails = [[{ x: b.x, y: b.y }], [{ x: B.balls[1].x, y: B.balls[1].y }]]; B.msg = '';
    }
    function step(dt) {
      var bs = B.balls, left = dt, guard = 0;
      while (left > 1e-9 && guard++ < 10) {
        var tc = (B.sunk[0] || B.sunk[1]) ? Infinity : P.tContact(bs[0], bs[1], R), h = Math.min(left, tc);
        bs.forEach(function (b, i) { if (B.sunk[i]) return; b.x += b.vx * h; b.y += b.vy * h; });
        left -= h;
        if (h === tc) {
          var u = { vx: bs[0].vx, vy: bs[0].vy }, J = P.hit2D(bs[0], bs[1], B.e);
          if (J > 0 && !B.hit) {
            var s0 = Math.hypot(bs[0].vx, bs[0].vy), s1 = Math.hypot(bs[1].vx, bs[1].vy), ang = s0 > 1e-6 && s1 > 1e-6 ? Math.acos(clamp((bs[0].vx * bs[1].vx + bs[0].vy * bs[1].vy) / s0 / s1, -1, 1)) / DEG : null;
            B.hit = { x: bs[0].x, y: bs[0].y, x1: bs[1].x, y1: bs[1].y, a0: Math.atan2(bs[0].vy, bs[0].vx), a1: Math.atan2(bs[1].vy, bs[1].vx), s0: s0, s1: s1, ang: ang, u: Math.hypot(u.vx, u.vy) };
            if (ang !== null && s0 > 0.05 && s1 > 0.05 && Math.abs(ang - 90) < 5) win('cut', 'The paths split at ' + fmt(ang, 1) + '°. Equal masses + elastic = a right angle, every time.');
            if (s0 < 0.03 * B.hit.u) win('stop', 'The white ball stopped dead and handed all its momentum to the gold one.');
          }
          left = Math.max(0, left - 1e-9);
        }
      }
      // cushions, slowdown, pockets
      bs.forEach(function (b, i) {
        if (B.sunk[i]) return;
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * CUSH; } if (b.x > TW - R) { b.x = TW - R; b.vx = -Math.abs(b.vx) * CUSH; }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * CUSH; } if (b.y > TH - R) { b.y = TH - R; b.vy = -Math.abs(b.vy) * CUSH; }
        var sp = Math.hypot(b.vx, b.vy); if (sp > 0) { var ns = Math.max(0, sp - SLOW * dt); b.vx *= ns / sp; b.vy *= ns / sp; }
        POCKETS.forEach(function (pk) { if (!B.sunk[i] && Math.hypot(b.x - pk[0], b.y - pk[1]) < POCK) { B.sunk[i] = true; b.vx = b.vy = 0; b.x = pk[0]; b.y = pk[1]; } });
        var tr = B.trails[i], last = tr[tr.length - 1]; if (!last || Math.hypot(b.x - last.x, b.y - last.y) > 0.01) { tr.push({ x: b.x, y: b.y }); if (tr.length > 600) tr.shift(); }
      });
      if (B.moving && bs.every(function (b, i) { return B.sunk[i] || (b.vx === 0 && b.vy === 0); })) {
        B.moving = false;
        if (B.sunk[1] && !B.sunk[0]) { win('pot', 'Potted! Aim so the line of centers at contact points at the pocket.'); B.msg = 'Potted! Press 🎲 for a new layout.'; }
        else if (B.sunk[0]) B.msg = 'The white ball went in. Press ↺ to try again.';
      }
    }
    function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function toTable(q) { var g = geom(); return { x: (q.x - g.ox) / g.s, y: (q.y - g.oy) / g.s }; }
    cv.addEventListener('pointerdown', function (e) {
      if (B.moving || B.sunk[0]) return; var q = toTable(pos(e)), b = B.balls[0];
      B.drag = { sx: q.x, sy: q.y }; cv.setPointerCapture(e.pointerId); aimFrom(q); e.preventDefault();
    });
    function aimFrom(q) {
      var b = B.balls[0], dx = b.x - q.x, dy = b.y - q.y, d = Math.hypot(dx, dy);
      if (d < 0.01) return;
      var near = Math.hypot(B.drag.sx - b.x, B.drag.sy - b.y) < 0.25;
      if (near) { B.aim.a = Math.atan2(dy, dx); B.aim.p = clamp(d / 0.6, 0.08, 1); } // pulled back from the white ball, like a slingshot
      else { B.aim.a = Math.atan2(q.y - b.y, q.x - b.x); }                         // or point at where you want it to go
    }
    cv.addEventListener('pointermove', function (e) { if (B.drag) aimFrom(toTable(pos(e))); });
    cv.addEventListener('pointerup', function () { if (B.drag) { var near = Math.hypot(B.drag.sx - B.balls[0].x, B.drag.sy - B.balls[0].y) < 0.25; B.drag = null; if (near) shoot(); } });
    cv.addEventListener('pointercancel', function () { B.drag = null; });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'ArrowLeft') B.aim.a -= (e.shiftKey ? 5 : 0.5) * DEG; else if (k === 'ArrowRight') B.aim.a += (e.shiftKey ? 5 : 0.5) * DEG;
      else if (k === 'ArrowUp') B.aim.p = clamp(B.aim.p + 0.05, 0.08, 1); else if (k === 'ArrowDown') B.aim.p = clamp(B.aim.p - 0.05, 0.08, 1);
      else if (k === ' ' || k === 'Enter') shoot(); else if (k === 'r' || k === 'R') layoutBalls(false); else used = false;
      if (used) e.preventDefault();
    });
    function draw() {
      var g = geom(), s = g.s, X = function (x) { return g.ox + x * s; }, Y = function (y) { return g.oy + y * s; };
      bg(c, g.w, g.h);
      c.fillStyle = '#5c3a1e'; rrect(c, g.ox - g.rail, g.oy - g.rail, TW * s + 2 * g.rail, TH * s + 2 * g.rail, 12); c.fill();
      var fg = c.createRadialGradient(X(TW / 2), Y(TH / 2), 10, X(TW / 2), Y(TH / 2), TW * s * 0.6); fg.addColorStop(0, '#1f7a4d'); fg.addColorStop(1, '#125a37');
      c.fillStyle = fg; c.fillRect(X(0), Y(0), TW * s, TH * s);
      c.fillStyle = '#05080a'; POCKETS.forEach(function (pk) { c.beginPath(); c.arc(X(pk[0]), Y(pk[1]), POCK * s * 0.95, 0, 7); c.fill(); });
      c.fillStyle = 'rgba(255,255,255,.35)'; [0.25, 0.5, 0.75].forEach(function (f) { c.beginPath(); c.arc(X(TW * f), Y(-0.04), 2, 0, 7); c.arc(X(TW * f), Y(TH + 0.04), 2, 0, 7); c.fill(); });
      // trails
      [['rgba(255,255,255,.55)', 0], ['rgba(255,212,121,.7)', 1]].forEach(function (q) { var tr = B.trails[q[1]]; if (tr.length < 2) return; c.strokeStyle = q[0]; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath(); tr.forEach(function (p, i) { if (i) c.lineTo(X(p.x), Y(p.y)); else c.moveTo(X(p.x), Y(p.y)); }); c.stroke(); c.setLineDash([]); });
      // the right-angle marker at the hit
      if (B.hit && B.hit.ang !== null) {
        var hx = X(B.hit.x), hy = Y(B.hit.y), rr = Math.max(18, 0.12 * s);
        var a0 = B.hit.a0, a1 = B.hit.a1, d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy, rr, a0, a0 + d, d < 0); c.stroke();
        arrow(c, hx, hy, Math.cos(a0) * rr * 2.2, Math.sin(a0) * rr * 2.2, '#fff', { width: 2 });
        arrow(c, hx, hy, Math.cos(a1) * rr * 2.2, Math.sin(a1) * rr * 2.2, C.gold, { width: 2 });
        label(c, fmt(B.hit.ang, 1) + '°', hx + Math.cos(a0 + d / 2) * (rr + 16), hy + Math.sin(a0 + d / 2) * (rr + 16), C.gold, { bold: true, size: 13, align: 'center' });
      }
      // aim guide
      var b0 = B.balls[0], b1 = B.balls[1];
      if (!B.moving && !B.sunk[0]) {
        var ux = Math.cos(B.aim.a), uy = Math.sin(B.aim.a), dx = b1.x - b0.x, dy = b1.y - b0.y, along = dx * ux + dy * uy, perp = Math.abs(dx * uy - dy * ux), Lline = 3;
        var ghost = null;
        if (!B.sunk[1] && along > 0 && perp < 2 * R) { var back = Math.sqrt(4 * R * R - perp * perp); Lline = along - back; ghost = { x: b0.x + ux * Lline, y: b0.y + uy * Lline }; }
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.setLineDash([3, 5]); c.beginPath(); c.moveTo(X(b0.x), Y(b0.y)); c.lineTo(X(b0.x + ux * Lline), Y(b0.y + uy * Lline)); c.stroke(); c.setLineDash([]);
        if (ghost) {
          c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(X(ghost.x), Y(ghost.y), R * s, 0, 7); c.stroke();
          var nx = (b1.x - ghost.x) / (2 * R), ny = (b1.y - ghost.y) / (2 * R), tx = ux - (ux * nx + uy * ny) * nx, ty2 = uy - (ux * nx + uy * ny) * ny, tl = Math.hypot(tx, ty2);
          c.setLineDash([6, 6]); c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,212,121,.6)'; c.beginPath(); c.moveTo(X(b1.x), Y(b1.y)); c.lineTo(X(b1.x + nx * 0.45), Y(b1.y + ny * 0.45)); c.stroke();
          if (tl > 0.05) { c.strokeStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(X(ghost.x), Y(ghost.y)); c.lineTo(X(ghost.x + tx / tl * 0.45), Y(ghost.y + ty2 / tl * 0.45)); c.stroke(); }
          c.setLineDash([]);
        }
        // the cue and its power
        var pull = 0.06 + B.aim.p * 0.22, cs = X(b0.x - ux * (R + pull)), ct = Y(b0.y - uy * (R + pull));
        c.strokeStyle = '#d9b382'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(cs, ct); c.lineTo(cs - ux * 0.9 * s, ct - uy * 0.9 * s); c.stroke();
        label(c, 'speed ' + fmt(B.aim.p * VMAX, 1) + ' m/s', X(b0.x), Y(b0.y) + R * s + 14, '#fff', { size: 10.5, align: 'center' });
      }
      // balls
      [[b0, '#f8f9fa', 0], [b1, '#ffc928', 1]].forEach(function (q) {
        if (B.sunk[q[2]]) return; var bx = X(q[0].x), by = Y(q[0].y), rp = Math.max(4, R * s);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(bx + 2, by + 2, rp, 0, 7); c.fill();
        var gr = c.createRadialGradient(bx - rp * 0.35, by - rp * 0.35, 1, bx, by, rp); gr.addColorStop(0, '#fff'); gr.addColorStop(1, q[1]);
        c.fillStyle = gr; c.beginPath(); c.arc(bx, by, rp, 0, 7); c.fill();
      });
      if (B.msg) label(c, B.msg, g.w / 2, g.oy - g.rail / 2, C.gold, { bold: true, size: 12, align: 'center' });
    }
    L.loop(function (dt) {
      if (B.moving) { var n = 4; for (var i = 0; i < n; i++) step(dt / n); }
      draw();
      var h = B.hit, html = h ? '<dt>White ball before</dt><dd>' + fmt(h.u, 2) + ' m/s</dd><dt>White ball after</dt><dd>' + fmt(h.s0, 2) + ' m/s</dd><dt>Gold ball after</dt><dd>' + fmt(h.s1, 2) + ' m/s</dd><dt>Angle between paths</dt><dd>' + (h.ang === null ? '—' : fmt(h.ang, 1) + '°') + '</dd><dt>Speeds² check: ' + fmt(h.s0 * h.s0, 2) + ' + ' + fmt(h.s1 * h.s1, 2) + '</dt><dd>= ' + fmt(h.s0 * h.s0 + h.s1 * h.s1, 2) + ' (before ' + fmt(h.u * h.u, 2) + ')</dd>' : '<dt>Shoot to see the numbers</dt><dd></dd>';
      if (read._h !== html) { read.innerHTML = html; read._h = html; }
    }, view);
    layoutBalls(false);
  })();
})(window, document);
