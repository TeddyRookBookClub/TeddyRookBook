/* Newton's Laws, Chapter 6: Circles and Gravity. Four interactive pieces:
   1. the ball on a string (main simulation, with missions), 2. a car on a curve, 3. Newton's Moon test, 4. the Cavendish balance.
   The models are in physics.js (window.NL6Phys) and tested in node. */
(function (W, D) {
  'use strict';
  var L = W.TRBLab, P = W.NL6Phys, root = D.getElementById('nl6-lab');
  if (!root || !L || !P) return;
  function $(id) { return D.getElementById(id); }
  var fmt = L.fmt, reduced = L.reduced, DEG = Math.PI / 180, TAU = Math.PI * 2, G0 = P.G0;
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', violet: '#b197fc', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function grp(s) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(v, d) { if (!isFinite(v) || v === 0) return '0'; var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e); if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; e++; } return fmt(m, d) + ' × 10' + String(e).split('').map(function (ch) { return SUP[ch]; }).join(''); }
  function fN(v) { return v >= 1e4 ? grp(fmt(v / 1000, 1)) + ' kN' : grp(fmt(v, v < 10 ? 2 : v < 100 ? 1 : 0)) + ' N'; }
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
  function panelBox(c, x, y, w, h, title) {
    c.fillStyle = 'rgba(255,255,255,.035)'; c.strokeStyle = 'rgba(120,170,200,.16)'; c.lineWidth = 1; rrect(c, x, y, w, h, 10); c.fill(); c.stroke();
    if (title) label(c, title, x + 10, y + 13, C.muted, { size: 10.5, bold: true });
  }
  function seg(groupEl, attr, val) { groupEl.querySelectorAll('button[' + attr + ']').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === val)); }); }
  function stars(c, w, h, n, seed) { c.fillStyle = 'rgba(255,255,255,.5)'; for (var i = 0; i < n; i++) { var x = (Math.sin(i * 12.9898 + seed) * 43758.5453) % 1, y = (Math.sin(i * 78.233 + seed) * 12543.123) % 1; c.fillRect(Math.abs(x) * w, Math.abs(y) * h, 1.2, 1.2); } }

  /* =====================================================================================
     1. THE BALL ON A STRING
     ===================================================================================== */
  (function () {
    var view = $('nl6-view'), cv = $('nl6-cv'), hud = $('nl6-hud'); if (!cv) return;
    var G6 = L.canvas(cv), c = G6.c, store = L.store('nl6');
    var el = { v: $('nl6-v'), vO: $('nl6-v-o'), r: $('nl6-r'), rO: $('nl6-r-o'), m: $('nl6-m'), mO: $('nl6-m-o'), s: $('nl6-s'), sO: $('nl6-s-o'), unb: $('nl6-unb'),
      aim: $('nl6-aim'), read: $('nl6-read'), pre: $('nl6-pre'), cut: $('nl6-cut'), cut2: $('nl6-cut2'), slow: $('nl6-slow'), pause: $('nl6-pause') };
    var S = { v: 3, r: 0.8, m: 0.2, str: 40, unb: false, aim: store.get('aim', true) !== false, phi: 0, mode: 'spin', ball: null, rel: null, flyT: 0, wait: 0, fade: 1,
      trail: [], targets: [], streak: 0, hits: 0, slow: false, paused: false, parts: [], settled: null, pend: false, lastIn: 0, snapped: false, ghost: 0, rings: [] };
    function F() { return P.tension(S.m, S.v, S.r); }
    function strength() { return S.unb ? Infinity : S.str; }
    function scale() { var w = G6.w, h = G6.h; return Math.min(w, h) * 0.45 / 1.5; }
    function center() { return { x: G6.w / 2, y: G6.h / 2 + 8 }; }
    function sync() {
      el.v.value = S.v; el.vO.textContent = fmt(S.v, 1) + ' m/s'; el.r.value = S.r; el.rO.textContent = fmt(S.r, 2) + ' m'; el.m.value = S.m; el.mO.textContent = fmt(S.m, 2) + ' kg';
      el.s.value = S.str; el.sO.textContent = S.unb ? 'unbreakable' : fmt(S.str, 0) + ' N'; el.s.disabled = S.unb; el.unb.checked = S.unb; el.aim.checked = S.aim;
      el.pre.querySelectorAll('button').forEach(function (b) { var q = PRE[b.dataset.pre]; b.setAttribute('aria-pressed', String(q.v === S.v && q.r === S.r && q.m === S.m && q.str === S.str && q.unb === S.unb)); });
    }
    var PRE = { easy: { v: 2, r: 1.0, m: 0.2, str: 40, unb: false }, fast: { v: 6, r: 0.6, m: 0.2, str: 40, unb: true }, weak: { v: 3, r: 0.8, m: 0.5, str: 20, unb: false } };
    function changed() { S.pend = true; S.lastIn = performance.now(); sync(); }
    el.pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre]; S.v = q.v; S.r = q.r; S.m = q.m; S.str = q.str; S.unb = q.unb; changed(); });
    ['v', 'r', 'm'].forEach(function (k) { el[k].addEventListener('input', function () { S[k] = +el[k].value; changed(); }); });
    el.s.addEventListener('input', function () { S.str = +el.s.value; changed(); });
    el.unb.addEventListener('change', function () { S.unb = el.unb.checked; changed(); });
    el.aim.addEventListener('change', function () { S.aim = el.aim.checked; store.set('aim', S.aim); });
    function setPause(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
    el.pause.addEventListener('click', function () { setPause(!S.paused); });
    el.slow.addEventListener('click', function () { S.slow = !S.slow; el.slow.setAttribute('aria-pressed', String(S.slow)); });
    $('nl6-reset').addEventListener('click', function () { newTargets(); S.streak = 0; S.hits = 0; S.mode = 'spin'; S.trail.length = 0; S.fade = 1; setPause(false); });
    el.cut.addEventListener('click', cut); el.cut2.addEventListener('click', cut);
    cv.addEventListener('pointerdown', function (e) { e.preventDefault(); cut(); });
    cv.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === ' ' || k === 'Enter') cut();
      else if (k === 'ArrowRight') { S.v = clamp(Math.round((S.v + 0.1) * 10) / 10, 0.5, 8); changed(); }
      else if (k === 'ArrowLeft') { S.v = clamp(Math.round((S.v - 0.1) * 10) / 10, 0.5, 8); changed(); }
      else if (k === 'ArrowUp') { S.r = clamp(Math.round((S.r + 0.05) * 20) / 20, 0.3, 1.5); changed(); }
      else if (k === 'ArrowDown') { S.r = clamp(Math.round((S.r - 0.05) * 20) / 20, 0.3, 1.5); changed(); }
      else if (k === 'p' || k === 'P') setPause(!S.paused);
      else used = false;
      if (used) e.preventDefault();
    });

    /* targets */
    function newTarget() {
      var w = G6.w, h = G6.h, sc = scale(), o = center(), R = 0.16;
      for (var tries = 0; tries < 200; tries++) {
        var a = Math.random() * TAU, d = 1.75 + Math.random() * 2.2, x = d * Math.cos(a), y = d * Math.sin(a), px = o.x + x * sc, py = o.y - y * sc, rp = R * sc;
        if (px < rp + 10 || px > w - rp - 10 || py < rp + 10 || py > h - rp - 52) continue;
        if (px < 240 && py < 64 + rp) continue; if (px > w - 200 && py < 56 + rp) continue; // keep clear of the readouts and buttons
        if (S.targets.some(function (t) { return Math.hypot(t.x - x, t.y - y) < 0.6; })) continue;
        return { x: x, y: y, R: R, pop: 0 };
      }
      return { x: 1.9, y: 0.6, R: R, pop: 0 };
    }
    function newTargets() { S.targets = []; for (var i = 0; i < 3; i++) S.targets.push(newTarget()); }

    /* missions */
    var MIS = [
      { id: 'cut', title: 'Let it go', goal: 'Cut the string. Which way does the ball go: straight out from the center, or along its path?' },
      { id: 'hit', title: 'Bullseye', goal: 'Cut the string at the right moment to hit a gold target.' },
      { id: 'streak', title: 'Three in a row', goal: 'Hit three targets in a row without a miss.' },
      { id: 'x4', title: 'Twice as fast', goal: 'Keep the radius and mass the same and double the speed. What happens to the pull on the string?' },
      { id: 'same', title: 'Same pull, bigger circle', goal: 'Double the radius, then find the speed that needs the same pull as before (within 5%).' },
      { id: 'snap', title: 'Snap!', goal: 'Spin the ball until a 20 N string breaks.' }
    ];
    var M = L.missions($('nl6-missions'), 'nl6', MIS, function (id) {
      if (id === 'cut' || id === 'hit' || id === 'streak') { S.v = 2; S.r = 1.0; S.m = 0.2; S.unb = true; S.slow = id === 'streak' ? S.slow : true; el.slow.setAttribute('aria-pressed', String(S.slow)); L.toast(view, id === 'cut' ? 'Press ✂ Cut, tap the picture or press Space.' : 'Slow motion is on. Use the aim line: cut when it points at a target.'); }
      if (id === 'x4') { S.v = 2; S.r = 0.8; S.m = 0.2; S.unb = true; L.toast(view, 'Note the pull, then set the speed to 4 m/s.'); }
      if (id === 'same') { S.v = 2; S.r = 0.6; S.m = 0.2; S.unb = true; L.toast(view, 'Note the pull. Set the radius to 1.2 m, then adjust the speed.'); }
      if (id === 'snap') { S.v = 2; S.r = 0.8; S.m = 0.5; S.str = 20; S.unb = false; L.toast(view, 'Speed it up slowly and watch the pink arrow and the gauge.'); }
      S.pend = false; S.settled = { v: S.v, r: S.r, m: S.m, F: F() }; sync();
      var rr = view.getBoundingClientRect(); if (rr.top < 0 || rr.bottom > (W.innerHeight || 800)) view.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    });
    function win(id, t) { if (M.done(id)) L.toast(view, '★ ' + t); }
    function settle() {
      var now = { v: S.v, r: S.r, m: S.m, F: F() }, o = S.settled; S.settled = now; S.pend = false;
      if (!o || Math.abs(o.m - now.m) > 1e-9) return;
      var rv = now.v / o.v, rr = now.r / o.r, rf = now.F / o.F;
      if (Math.abs(rr - 1) < 1e-9 && (Math.abs(rv - 2) < 0.03 || Math.abs(rv - 0.5) < 0.008)) win('x4', 'Speed ×' + fmt(rv, 2) + ' → pull ×' + fmt(rf, 2) + '. The force grows with the square of the speed.');
      if ((Math.abs(rr - 2) < 0.03 || Math.abs(rr - 0.5) < 0.008) && Math.abs(rf - 1) < 0.05) win('same', 'Radius ×' + fmt(rr, 2) + ' and speed ×' + fmt(rv, 2) + ' (about √2): the same ' + fN(now.F) + ' pull. F = mv²/r.');
    }

    function cut(auto) {
      if (S.mode !== 'spin' || S.fade < 1) return;
      var p = P.onCircle(S.r, S.v, S.phi);
      S.mode = 'fly'; S.ball = p; S.rel = { x: p.x, y: p.y, vx: p.vx, vy: p.vy, phi: S.phi, v: S.v, r: S.r }; S.flyT = 0; S.ghost = 1; S.snapped = auto === true;
      // will it hit a target? the motion is a straight line, so this can be decided now
      var best = null; S.targets.forEach(function (t) { var th = P.rayHit(p.x, p.y, p.vx, p.vy, t.x, t.y, t.R + 0.035); if (th !== null && (!best || th < best.t)) best = { t: th, tg: t }; });
      S.rel.hit = best;
      win('cut', 'Straight ahead along the tangent, not outward. With no string pulling it in, it simply keeps going (the first law).');
      if (S.snapped) win('snap', 'Snap! It needed ' + fN(F()) + ' but the string holds ' + fN(S.str) + '. Faster, heavier or tighter means a bigger pull.');
    }
    function land(hit) {
      if (hit) {
        S.hits++; S.streak++; hit.tg.pop = 1;
        S.rings.push({ x: hit.tg.x, y: hit.tg.y, t: 0 });
        if (!reduced) for (var i = 0; i < 26; i++) { var a = Math.random() * TAU, sp = 40 + Math.random() * 120; S.parts.push({ x: hit.tg.x, y: hit.tg.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, col: Math.random() < 0.5 ? C.gold : C.green }); }
        win('hit', 'Hit! The ball left along the tangent line, the dashed aim line.');
        if (S.streak >= 3) win('streak', 'Three in a row. You are aiming with the first law.');
        var idx = S.targets.indexOf(hit.tg); setTimeout(function () { if (idx >= 0) S.targets[idx] = newTarget(); }, 450);
      } else S.streak = 0;
      S.mode = 'wait'; S.wait = 0.7;
    }

    function draw() {
      var w = G6.w, h = G6.h, sc = scale(), o = center(); bg(c, w, h);
      function X(x) { return o.x + x * sc; } function Y(y) { return o.y - y * sc; }
      // grid rings
      c.strokeStyle = 'rgba(120,170,200,.07)'; c.lineWidth = 1;
      for (var rr = 0.5; rr < 6; rr += 0.5) { c.beginPath(); c.arc(o.x, o.y, rr * sc, 0, TAU); c.stroke(); }
      // targets
      S.targets.forEach(function (t) {
        var px = X(t.x), py = Y(t.y), rp = t.R * sc;
        var gl = c.createRadialGradient(px, py, 1, px, py, rp * 1.8); gl.addColorStop(0, 'rgba(255,212,121,.35)'); gl.addColorStop(1, 'rgba(255,212,121,0)'); c.fillStyle = gl; c.beginPath(); c.arc(px, py, rp * 1.8, 0, TAU); c.fill();
        c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, rp, 0, TAU); c.stroke(); c.beginPath(); c.arc(px, py, rp * 0.55, 0, TAU); c.stroke();
        c.fillStyle = C.gold; c.beginPath(); c.arc(px, py, rp * 0.18, 0, TAU); c.fill();
      });
      S.rings.forEach(function (rg) { c.strokeStyle = 'rgba(99,230,190,' + (1 - rg.t).toFixed(2) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(X(rg.x), Y(rg.y), (0.16 + rg.t * 0.6) * sc, 0, TAU); c.stroke(); });
      S.parts.forEach(function (p) { c.globalAlpha = clamp(p.life, 0, 1); c.fillStyle = p.col; c.fillRect(X(p.x) - 1.5, Y(p.y) - 1.5, 3, 3); }); c.globalAlpha = 1;
      // the circle the ball travels on
      c.strokeStyle = 'rgba(116,192,252,.25)'; c.setLineDash([4, 6]); c.lineWidth = 1.2; c.beginPath(); c.arc(o.x, o.y, S.r * sc, 0, TAU); c.stroke(); c.setLineDash([]);
      // strain gauge around the hand
      var Fv = F(), ratio = S.unb ? Math.min(1, Fv / 100) : Math.min(1, Fv / S.str);
      c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 6; c.beginPath(); c.arc(o.x, o.y, 26, -Math.PI / 2, 1.5 * Math.PI); c.stroke();
      c.strokeStyle = ratio > 0.85 && !S.unb ? C.red : C.pink; c.beginPath(); c.arc(o.x, o.y, 26, -Math.PI / 2, -Math.PI / 2 + TAU * ratio); c.stroke();
      // the hand
      c.fillStyle = '#e9c39b'; c.beginPath(); c.arc(o.x, o.y, 13, 0, TAU); c.fill(); c.fillStyle = '#c99a6b'; c.beginPath(); c.arc(o.x, o.y, 5, 0, TAU); c.fill();
      // after a cut: what would "straight outward" look like, and the real path
      if (S.rel && S.ghost > 0) {
        var r0 = S.rel, ux = Math.cos(r0.phi), uy = Math.sin(r0.phi), Lg = 3.5;
        c.globalAlpha = Math.min(1, S.ghost);
        c.strokeStyle = 'rgba(255,135,135,.75)'; c.setLineDash([6, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(X(r0.x), Y(r0.y)); c.lineTo(X(r0.x + ux * Lg), Y(r0.y + uy * Lg)); c.stroke();
        var tvx = r0.vx / r0.v, tvy = r0.vy / r0.v;
        c.strokeStyle = 'rgba(99,230,190,.85)'; c.beginPath(); c.moveTo(X(r0.x), Y(r0.y)); c.lineTo(X(r0.x + tvx * 6), Y(r0.y + tvy * 6)); c.stroke(); c.setLineDash([]);
        label(c, '✗ not straight out', X(r0.x + ux * 0.45), Y(r0.y + uy * 0.45) - 12, C.red, { bold: true, size: 12, align: 'center', fit: true });
        label(c, '✓ along the tangent', X(r0.x + tvx * 0.9) + 0, Y(r0.y + tvy * 0.9) + 16, C.green, { bold: true, size: 12, align: 'center', fit: true });
        c.globalAlpha = 1;
      }
      // the ball, its string, trail and arrows
      var b = S.mode === 'spin' ? P.onCircle(S.r, S.v, S.phi) : S.ball;
      if (S.mode === 'spin') {
        // a fading arc of trail
        if (!reduced) { var span = Math.min(2.2, 0.9 * S.v / S.r * 0.12 + 0.6); for (var k = 0; k < 18; k++) { var a0 = S.phi - span * k / 18, a1 = S.phi - span * (k + 1) / 18; c.strokeStyle = 'rgba(255,212,121,' + (0.45 * (1 - k / 18)).toFixed(3) + ')'; c.lineWidth = 7 * (1 - k / 18) + 1; c.beginPath(); c.arc(o.x, o.y, S.r * sc, -a0, -a1, false); c.stroke(); } }
        c.strokeStyle = S.unb ? '#dbe7ef' : ratio > 0.85 ? '#ffc9c9' : '#dbe7ef'; c.lineWidth = 2; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(X(b.x), Y(b.y)); c.stroke();
        if (S.aim) { c.strokeStyle = 'rgba(99,230,190,.35)'; c.setLineDash([3, 7]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(b.x), Y(b.y)); c.lineTo(X(b.x + b.vx / S.v * 6), Y(b.y + b.vy / S.v * 6)); c.stroke(); c.setLineDash([]); }
      } else if (S.mode === 'fly' || S.mode === 'wait') {
        c.strokeStyle = 'rgba(255,212,121,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(S.rel.x), Y(S.rel.y)); c.lineTo(X(S.ball.x), Y(S.ball.y)); c.stroke();
        if (S.snapped) { c.strokeStyle = '#dbe7ef'; c.lineWidth = 2; var sx = X(S.rel.x * 0.5), sy = Y(S.rel.y * 0.5); c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(sx + 4, sy - 3); c.stroke(); }
      }
      if (S.mode !== 'wait') {
        var bx = X(b.x), by = Y(b.y), br = clamp(Math.cbrt(S.m) * 17, 8, 17);
        c.globalAlpha = S.fade;
        var gr = c.createRadialGradient(bx, by, 1, bx, by, br * 2.6); gr.addColorStop(0, 'rgba(255,212,121,.55)'); gr.addColorStop(1, 'rgba(255,212,121,0)'); c.fillStyle = gr; c.beginPath(); c.arc(bx, by, br * 2.6, 0, TAU); c.fill();
        var bgd = c.createRadialGradient(bx - br * 0.35, by - br * 0.35, 1, bx, by, br); bgd.addColorStop(0, '#fff7d6'); bgd.addColorStop(1, '#f2b600'); c.fillStyle = bgd; c.beginPath(); c.arc(bx, by, br, 0, TAU); c.fill();
        c.globalAlpha = 1;
        var vs = clamp(S.v * 16, 18, 120);
        arrow(c, bx, by, b.vx / S.v * vs, -b.vy / S.v * vs, C.blue, { glow: true });
        label(c, 'v', bx + b.vx / S.v * (vs + 10), by - b.vy / S.v * (vs + 10), C.blue, { bold: true, size: 13, align: 'center' });
        if (S.mode === 'spin') {
          var room = S.r * sc - 30, fl = Math.min(room, Math.max(14, Fv * 12)), ex = (o.x - bx) / (S.r * sc), ey = (o.y - by) / (S.r * sc); // 12 px per newton
          arrow(c, bx, by, ex * fl, ey * fl, C.pink, { glow: true, width: 3.5 });
          if (Fv * 12 > room) { c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + ex * fl * 0.5 - ey * 6, by + ey * fl * 0.5 + ex * 6); c.lineTo(bx + ex * fl * 0.5 + ey * 6, by + ey * fl * 0.5 - ex * 6); c.stroke(); }
          label(c, 'F ' + fN(Fv), bx + ex * fl * 0.55 - ey * 16, by + ey * fl * 0.55 + ex * 16, C.pink, { bold: true, size: 12, align: 'center', fit: true });
        }
      }
      if (S.hits) label(c, '🎯 ' + S.hits + (S.streak > 1 ? ' · streak ' + S.streak : ''), 12, h - 18, C.gold, { bold: true, size: 13 });
      if (S.slow) label(c, '🐢 slow motion ×¼', 12, h - (S.hits ? 40 : 18), C.blue, { bold: true, size: 11.5 });
    }
    function readouts() {
      var Fv = F(), w = S.v / S.r, rows = [['Speed v', fmt(S.v, 1) + ' m/s'], ['Radius r', fmt(S.r, 2) + ' m'], ['Turns per second', fmt(w / TAU, 2)], ['Time for one turn', fmt(TAU / w, 2) + ' s'],
        ['Centripetal acceleration v²/r', fmt(S.v * S.v / S.r, 1) + ' m/s² (' + fmt(S.v * S.v / S.r / G0, 1) + ' g)'], ['Pull needed mv²/r', fN(Fv)], ['String holds', S.unb ? 'any pull' : fN(S.str)]];
      var html = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
      if (el.read._h !== html) { el.read.innerHTML = html; el.read._h = html; }
      var hh = '<b>F = mv²/r</b> = ' + fmt(S.m, 2) + ' × ' + fmt(S.v, 1) + '² / ' + fmt(S.r, 2) + ' = ' + fN(Fv);
      if (hud._h !== hh) { hud.innerHTML = hh; hud._h = hh; }
    }
    L.loop(function (dt) {
      var h = S.paused ? 0 : dt * (S.slow ? 0.25 : 1);
      if (S.pend && performance.now() - S.lastIn > 600) settle();
      S.phi = (S.phi + S.v / S.r * h) % TAU;
      if (S.mode === 'spin') {
        if (S.fade < 1) S.fade = Math.min(1, S.fade + dt * 3);
        if (h > 0 && F() > strength()) cut(true);
      } else if (S.mode === 'fly') {
        S.flyT += h; var q = { x: S.rel.x + S.rel.vx * S.flyT, y: S.rel.y + S.rel.vy * S.flyT }; S.ball = { x: q.x, y: q.y, vx: S.rel.vx, vy: S.rel.vy };
        var hit = S.rel.hit;
        if (hit && S.flyT >= hit.t) { S.ball.x = S.rel.x + S.rel.vx * hit.t; S.ball.y = S.rel.y + S.rel.vy * hit.t; land(hit); }
        else { var sc = scale(), o = center(), px = o.x + q.x * sc, py = o.y - q.y * sc; if (px < -30 || px > G6.w + 30 || py < -30 || py > G6.h + 30) land(null); }
      } else if (S.mode === 'wait') {
        S.wait -= dt; if (S.wait <= 0) { S.mode = 'spin'; S.fade = 0; S.snapped = false; }
      }
      if (S.mode !== 'fly') S.ghost = Math.max(0, S.ghost - dt * 0.6);
      for (var i = S.parts.length - 1; i >= 0; i--) { var p = S.parts[i], sc2 = scale(); p.x += p.vx / sc2 * dt; p.y += p.vy / sc2 * dt; p.life -= dt * 1.2; if (p.life <= 0) S.parts.splice(i, 1); }
      for (var j = S.rings.length - 1; j >= 0; j--) { S.rings[j].t += dt * 1.5; if (S.rings[j].t >= 1) S.rings.splice(j, 1); }
      draw(); readouts();
    }, view);
    sync(); S.settled = { v: S.v, r: S.r, m: S.m, F: F() };
    W.addEventListener('resize', function () { newTargets(); });
    newTargets();
    if (/[?&]debug\b/.test(location.search)) W.NL6Debug = { S: S, M: M, cut: cut, sync: sync, aim: function () { var t = S.targets[0]; return P.aimAngle(S.r, t.x, t.y); } };
  })();

  /* =====================================================================================
     2. A CAR ON A CURVE
     ===================================================================================== */
  (function () {
    var view = $('nl6c-view'), cv = $('nl6c-cv'); if (!cv) return;
    var G6 = L.canvas(cv), c = G6.c, read = $('nl6c-read'), pre = $('nl6c-pre');
    var el = { r: $('nl6c-r'), rO: $('nl6c-r-o'), b: $('nl6c-b'), bO: $('nl6c-b-o'), v: $('nl6c-v'), vO: $('nl6c-v-o'), s: $('nl6c-s') };
    var SURF = { dry: { us: 1.0, uk: 0.7, name: 'dry' }, wet: { us: 0.6, uk: 0.4, name: 'wet' } }, MASS = 1500;
    var Cr = { r: 100, bank: 0, kmh: 60, surf: 'dry', ang: 0, skid: false, x: 0, y: 0, hd: 0, off: 0, idealT: 0, edgeT: 0, trail: [] };
    var PRE = { flatdry: { r: 50, bank: 0, surf: 'dry', kmh: 60 }, flatwet: { r: 50, bank: 0, surf: 'wet', kmh: 50 }, banked: { r: 100, bank: 31, surf: 'dry', kmh: 60 } };
    function sync() {
      el.r.value = Cr.r; el.rO.textContent = Cr.r + ' m'; el.b.value = Cr.bank; el.bO.textContent = Cr.bank + '°'; el.v.value = Cr.kmh; el.vO.textContent = Cr.kmh + ' km/h (' + Math.round(Cr.kmh / 1.609344) + ' mph)'; el.s.value = Cr.surf;
      pre.querySelectorAll('button').forEach(function (b) { var q = PRE[b.dataset.pre]; b.setAttribute('aria-pressed', String(q.r === Cr.r && q.bank === Cr.bank && q.surf === Cr.surf && q.kmh === Cr.kmh)); });
    }
    function grip() { Cr.skid = false; Cr.off = 0; Cr.trail.length = 0; }
    pre.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; var q = PRE[b.dataset.pre]; Cr.r = q.r; Cr.bank = q.bank; Cr.surf = q.surf; Cr.kmh = q.kmh; grip(); sync(); });
    el.r.addEventListener('input', function () { Cr.r = +el.r.value; grip(); sync(); });
    el.b.addEventListener('input', function () { Cr.bank = +el.b.value; grip(); sync(); });
    el.v.addEventListener('input', function () { Cr.kmh = +el.v.value; sync(); });
    el.s.addEventListener('change', function () { Cr.surf = el.s.value; grip(); sync(); });
    var MIS = [
      { id: 'ideal', title: 'No friction needed', goal: 'On a banked curve, find the speed where friction does nothing at all.' },
      { id: 'edge', title: 'On the edge', goal: 'On a flat, wet curve, drive within 3 km/h of the top speed without skidding.' },
      { id: 'skid', title: 'Skid out', goal: 'Go too fast for the curve and watch which way the car slides.' }
    ];
    var Mc = L.missions($('nl6c-missions'), 'nl6-car', MIS);
    function win(id, t) { if (Mc.done(id)) L.toast(view, '★ ' + t); }
    function nums() {
      var s = SURF[Cr.surf], th = Cr.bank * DEG, v = Cr.kmh / 3.6, q = P.curve(MASS, v, Cr.r, th);
      return { s: s, th: th, v: v, q: q, fmax: s.us * q.N, vI: P.vIdeal(Cr.r, th), vM: P.vMax(Cr.r, th, s.us), vm: P.vMin(Cr.r, th, s.us) };
    }
    function draw(n) {
      var w = G6.w, h = G6.h, narrow = w < 560; bg(c, w, h);
      // left: the road from above
      var lw = narrow ? w : w * 0.55, lh = narrow ? h * 0.52 : h, cx = lw / 2, cy = lh / 2 + 6, R = Math.min(lw, lh) * 0.36, rw = Math.max(14, R * 0.16);
      c.fillStyle = '#16301f'; c.fillRect(0, 0, lw, lh);
      c.strokeStyle = '#3d4f5c'; c.lineWidth = rw; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
      if (Cr.bank > 0) { c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = rw * 0.45; c.beginPath(); c.arc(cx, cy, R + rw * 0.22, 0, TAU); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.setLineDash([10, 12]); c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(cx, cy, 3, 0, TAU); c.fill();
      label(c, 'r = ' + Cr.r + ' m', cx, cy + 14, C.muted, { size: 11, align: 'center' });
      Cr.trail.forEach(function (p, i) { c.fillStyle = 'rgba(255,135,135,' + (0.15 + 0.5 * i / Cr.trail.length).toFixed(2) + ')'; c.fillRect(cx + p.x * R - 1.5, cy - p.y * R - 1.5, 3, 3); });
      var px = cx + Cr.x * R, py = cy - Cr.y * R;
      c.save(); c.translate(px, py); c.rotate(-Cr.hd);
      c.fillStyle = Cr.skid ? '#ff6b6b' : '#ffd43b'; rrect(c, -11, -6, 22, 12, 3); c.fill(); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(2, -5, 5, 10);
      c.restore();
      if (!Cr.skid) { // the net force on the car points to the center
        var ux = (cx - px), uy = (cy - py), ul = Math.hypot(ux, uy); arrow(c, px, py, ux / ul * Math.min(R * 0.6, 26 + 20 * n.q.ac / 9.81), uy / ul * Math.min(R * 0.6, 26 + 20 * n.q.ac / 9.81), C.gold, { glow: true, width: 3 });
      }
      label(c, 'from above', 10, 14, C.muted, { size: 10.5, bold: true });
      if (Cr.skid) label(c, Cr.off ? 'Off the road!' : 'Skidding!', cx, 34, C.red, { bold: true, size: 15, align: 'center' });
      // right: the cross-section seen from behind, with the forces
      var rx = narrow ? 0 : lw, ry = narrow ? lh : 0, rwid = narrow ? w : w - lw, rh = narrow ? h - lh : h;
      c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(rx, ry, rwid, rh);
      label(c, 'from behind (center of the curve to the left)', rx + 10, ry + 14, C.muted, { size: 10.5, bold: true });
      var th = n.th, ox = rx + rwid * 0.5, oy = ry + rh * 0.66, half = rwid * 0.42;
      c.strokeStyle = '#5c7a8d'; c.lineWidth = 6; c.beginPath(); c.moveTo(ox - Math.cos(th) * half, oy + Math.sin(th) * half); c.lineTo(ox + Math.cos(th) * half, oy - Math.sin(th) * half); c.stroke();
      c.fillStyle = '#3d4f5c'; c.beginPath(); c.moveTo(ox - Math.cos(th) * half, oy + Math.sin(th) * half + 3); c.lineTo(ox + Math.cos(th) * half, oy - Math.sin(th) * half + 3); c.lineTo(ox + Math.cos(th) * half, ry + rh); c.lineTo(ox - Math.cos(th) * half, ry + rh); c.closePath(); c.fill();
      if (Cr.bank > 0) { c.strokeStyle = C.gold; c.lineWidth = 1.5; c.beginPath(); c.arc(ox - Math.cos(th) * half, oy + Math.sin(th) * half, 34, -th, 0); c.stroke(); label(c, Cr.bank + '°', ox - Math.cos(th) * half + 40, oy + Math.sin(th) * half - 8, C.gold, { size: 11, bold: true }); c.strokeStyle = 'rgba(143,179,198,.4)'; c.beginPath(); c.moveTo(ox - Math.cos(th) * half, oy + Math.sin(th) * half); c.lineTo(ox - Math.cos(th) * half + 60, oy + Math.sin(th) * half); c.stroke(); }
      // the car from behind
      var cw = Math.min(70, rwid * 0.26), chh = cw * 0.55, slide = Cr.skid ? Math.min(1, Cr.off ? 1 : 0.5) * (n.v > (n.vM || 0) ? 1 : -1) * cw * 0.6 : 0;
      c.save(); c.translate(ox + Math.cos(th) * slide, oy - Math.sin(th) * slide); c.rotate(-th);
      c.fillStyle = '#ffd43b'; rrect(c, -cw / 2, -chh - 8, cw, chh, 6); c.fill(); c.fillStyle = '#1c2b36'; rrect(c, -cw * 0.32, -chh - 4, cw * 0.64, chh * 0.42, 4); c.fill();
      c.fillStyle = '#111'; c.fillRect(-cw / 2 + 2, -10, 12, 10); c.fillRect(cw / 2 - 14, -10, 12, 10);
      c.restore();
      // forces at the car's center (scaled to its weight)
      var k = Math.min(rh * 0.22, 70) / n.q.W, ccx = ox - Math.sin(th) * (chh * 0.6 + 8) + Math.cos(th) * slide, ccy = oy - Math.cos(th) * (chh * 0.6 + 8) - Math.sin(th) * slide;
      arrow(c, ccx, ccy, 0, n.q.W * k, C.pink, { glow: true }); label(c, 'mg', ccx + 6, ccy + n.q.W * k - 4, C.pink, { bold: true, size: 11 });
      arrow(c, ccx, ccy, -Math.sin(th) * n.q.N * k, -Math.cos(th) * n.q.N * k, C.blue, { glow: true }); label(c, 'N', ccx - Math.sin(th) * n.q.N * k - 14, ccy - Math.cos(th) * n.q.N * k, C.blue, { bold: true, size: 11 });
      var fShow = Cr.skid ? (n.v > n.vI ? 1 : -1) * n.s.uk * n.q.N : n.q.f;
      if (Math.abs(fShow) > 0.01 * n.q.W) { var fx = -Math.cos(th) * fShow * k, fy = Math.sin(th) * fShow * k, base = { x: ox - Math.sin(th) * 2 + Math.cos(th) * slide, y: oy - Math.cos(th) * 2 - Math.sin(th) * slide }; arrow(c, base.x, base.y, fx, fy, C.red, { glow: true }); label(c, 'f', base.x + fx - (fx < 0 ? 10 : -6), base.y + fy - 8, C.red, { bold: true, size: 11 }); }
      if (!Cr.skid) { var ny = ccy - chh - 18; arrow(c, ccx, ny, -n.q.Fc * k, 0, C.gold, { width: 4, glow: true }); label(c, 'net = mv²/r', ccx - n.q.Fc * k / 2, ny - 14, C.gold, { bold: true, size: 11, align: 'center', fit: true }); }
      // a friction gauge
      var gx = rx + 12, gy = ry + rh - 30, gw = rwid - 24, need = Math.abs(n.q.f) / n.fmax;
      label(c, Cr.skid ? 'Not enough friction: sliding (kinetic friction)' : 'Friction needed: ' + fN(Math.abs(n.q.f)) + ' of ' + fN(n.fmax) + ' available', gx, gy - 10, Cr.skid ? C.red : C.ink, { size: 11, bold: true, fit: true });
      c.fillStyle = 'rgba(255,255,255,.08)'; rrect(c, gx, gy, gw, 9, 4); c.fill();
      c.fillStyle = need > 1 ? C.red : need > 0.85 ? C.gold : C.blue; rrect(c, gx, gy, Math.max(4, Math.min(1, need) * gw), 9, 4); c.fill();
    }
    L.loop(function (dt) {
      var n = nums(), v = n.v, lap = TAU * Cr.r / Math.max(v, 0.1), speed = Math.max(1, lap / 7); // time-lapse so a lap takes about 7 s
      var hdt = dt * speed;
      var tooFast = v > n.vM + 1e-9, tooSlow = v < n.vm - 1e-9;
      if (!Cr.skid && (tooFast || tooSlow)) { Cr.skid = true; Cr.dir = tooFast; win('skid', tooFast ? 'Too fast: the car slides outward, toward the tangent, because friction can’t supply mv²/r.' : 'Too slow for this steep bank: the car slides down the slope, toward the inside.'); }
      if (!Cr.skid) {
        Cr.ang = (Cr.ang + v / Cr.r * hdt) % TAU; Cr.x = Math.cos(Cr.ang); Cr.y = Math.sin(Cr.ang); Cr.hd = Cr.ang + Math.PI / 2;
        Cr.idealT = (Cr.bank >= 5 && Math.abs(n.q.f) < 0.02 * n.q.W && Cr.kmh >= 10) ? Cr.idealT + dt : 0;
        if (Cr.idealT > 1) win('ideal', 'At ' + Cr.kmh + ' km/h the slope alone supplies mv²/r: tan θ = v²/(rg). Mass doesn’t matter.');
        Cr.edgeT = (Cr.bank === 0 && Cr.surf === 'wet' && n.vM * 3.6 - Cr.kmh <= 3 && Cr.kmh <= n.vM * 3.6) ? Cr.edgeT + dt : 0;
        if (Cr.edgeT > 2) win('edge', 'Top speed on this wet curve: √(μs g r) = ' + fmt(n.vM * 3.6, 0) + ' km/h. On a dry road it would be ' + fmt(P.vMax(Cr.r, 0, 1.0) * 3.6, 0) + ' km/h.');
      } else if (!Cr.off) {
        // skidding: the path bends with the sideways acceleration kinetic friction can give
        var a = P.skidAccel(n.th, n.s.uk, Cr.dir), rx = Cr.x * Cr.r, ry = Cr.y * Cr.r, steps = 10, hh = hdt / steps;
        for (var i = 0; i < steps; i++) {
          var hx = Math.cos(Cr.hd), hy = Math.sin(Cr.hd); rx += hx * v * hh; ry += hy * v * hh;
          var turn = (isFinite(a) ? a : v * v / Cr.r) / v; Cr.hd += turn * hh; // the bend is always toward the inside of the curve
        }
        Cr.x = rx / Cr.r; Cr.y = ry / Cr.r; Cr.trail.push({ x: Cr.x, y: Cr.y }); if (Cr.trail.length > 200) Cr.trail.shift();
        var dist = Math.hypot(Cr.x, Cr.y);
        if (dist > 1.25 || dist < 0.75) Cr.off = 1.6;
      } else { Cr.off -= dt; if (Cr.off <= 0) { grip(); } }
      draw(n);
      var rows = [['Needed sideways force mv²/r', fN(n.q.Fc)], ['Friction needed', fN(Math.abs(n.q.f)) + (Math.abs(n.q.f) > 1 ? (n.q.f > 0 ? ' (down the slope)' : ' (up the slope)') : '')], ['Friction available μs N', fN(n.fmax)],
        ['No-friction speed', Cr.bank > 0 ? fmt(n.vI * 3.6, 0) + ' km/h' : '— (flat road)'], ['Top speed', isFinite(n.vM) ? fmt(n.vM * 3.6, 0) + ' km/h' : 'none'], ['Lowest speed', n.vm > 0 ? fmt(n.vm * 3.6, 0) + ' km/h' : '0']];
      var html = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
      if (read._h !== html) { read.innerHTML = html; read._h = html; }
    }, view);
    sync();
  })();

  /* =====================================================================================
     3. NEWTON'S MOON TEST
     ===================================================================================== */
  (function () {
    var view = $('nl6m-view'), cv = $('nl6m-cv'); if (!cv) return;
    var G6 = L.canvas(cv), c = G6.c, read = $('nl6m-read'), chart = $('nl6m-chart'), CH = L.canvas(chart), modeG = $('nl6m-mode');
    var MT = P.moonTest(), Mo = { mode: 's1', t: 0, dur: 1, run: false, slow: 3 };
    function start(m) { Mo.mode = m; Mo.dur = m === 's1' ? 1 : 60; Mo.t = 0; Mo.run = true; seg(modeG, 'data-m', m); }
    modeG.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) start(b.dataset.m); });
    function draw() {
      var w = G6.w, h = G6.h, narrow = w < 560; bg(c, w, h);
      var frac = Mo.t / Mo.dur, tt = Mo.t; // seconds of real time shown
      // left: the apple
      var lw = narrow ? w * 0.38 : w * 0.34, top = 60, bot = h - 34, sc = (bot - top) / 5.2;
      panelBox(c, 6, 6, lw - 12, h - 12, 'THE APPLE');
      var trX = lw * 0.26, crR = Math.min(lw * 0.17, 42);
      c.fillStyle = '#5c3a1e'; c.fillRect(trX - 4, top - 6, 8, bot - top + 6); c.strokeStyle = '#5c3a1e'; c.lineWidth = 3; c.beginPath(); c.moveTo(trX, top + 4); c.lineTo(lw * 0.62, top - 10); c.stroke();
      c.fillStyle = '#2b8a3e'; c.beginPath(); c.arc(trX, top - 6, crR, 0, TAU); c.fill(); c.beginPath(); c.arc(lw * 0.5, top - 14, crR * 0.7, 0, TAU); c.fill();
      c.fillStyle = '#23394a'; c.fillRect(6, bot, lw - 12, 6);
      var fall = Mo.mode === 's1' ? 0.5 * G0 * tt * tt : Math.min(5.2, 0.5 * G0 * tt * tt), ax = lw * 0.62, ay = top + Math.min(fall, 5.0) * sc;
      // ruler
      c.strokeStyle = 'rgba(143,179,198,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(lw - 26, top); c.lineTo(lw - 26, top + 5 * sc);
      for (var m = 0; m <= 5; m++) { c.moveTo(lw - 30, top + m * sc); c.lineTo(lw - 22, top + m * sc); } c.stroke();
      for (m = 0; m <= 5; m++) label(c, m + ' m', lw - 34, top + m * sc, C.muted, { size: 9.5, align: 'right' });
      // ghost apples every 0.25 s
      if (Mo.mode === 's1') for (var q = 0.25; q <= Math.min(tt, 1) + 1e-9; q += 0.25) { c.fillStyle = 'rgba(255,107,107,.25)'; c.beginPath(); c.arc(ax, top + 0.5 * G0 * q * q * sc, 7, 0, TAU); c.fill(); }
      if (ay < bot - 4) { c.fillStyle = '#ff6b6b'; c.beginPath(); c.arc(ax, ay, 8, 0, TAU); c.fill(); c.fillStyle = '#2b8a3e'; c.fillRect(ax - 1, ay - 12, 2, 5); }
      label(c, (Mo.mode === 's1' || tt < 1.01 ? (narrow ? '' : 'fallen ') + fmt(0.5 * G0 * Math.min(tt, 1) * Math.min(tt, 1), 2) + ' m' : 'in 1 s: 4.90 m'), 14, h - 18, C.ink, { size: 11.5, bold: true });
      // right: the Moon (not to scale)
      var rx = lw, rw = w - lw;
      panelBox(c, rx + 4, 6, rw - 10, h - 12, narrow ? 'THE MOON (not to scale)' : 'THE MOON (path greatly exaggerated)');
      c.save(); c.beginPath(); c.rect(rx + 4, 6, rw - 10, h - 12); c.clip(); stars(c, w, h, 60, 3); c.restore();
      var ex = rx + rw * (narrow ? 0.14 : 0.2), ey = h * (narrow ? 0.82 : 0.86), Rm = Math.min(rw * (narrow ? 0.95 : 0.75), h * 0.72);
      c.fillStyle = '#1c7ed6'; c.beginPath(); c.arc(ex, ey, 14, 0, TAU); c.fill(); c.fillStyle = '#2f9e44'; c.beginPath(); c.arc(ex - 4, ey - 3, 6, 0, TAU); c.fill();
      label(c, 'Earth', ex, ey + 24, C.muted, { size: 10.5, align: 'center' });
      var a0 = narrow ? 1.4 : 1.25, span = narrow ? 0.5 : 0.55, a1 = a0 - span * frac; // the Moon moves clockwise along the arc
      c.strokeStyle = 'rgba(219,231,239,.3)'; c.setLineDash([3, 5]); c.lineWidth = 1.2; c.beginPath(); c.arc(ex, ey, Rm, -a0 - 0.2, -a0 + span + 0.25); c.stroke(); c.setLineDash([]);
      var m0x = ex + Rm * Math.cos(a0), m0y = ey - Rm * Math.sin(a0), tx = Math.sin(a0), ty = Math.cos(a0); // tangent direction (clockwise)
      var L1 = Rm * Math.tan(span * frac), sx = m0x + tx * L1, sy = m0y + ty * L1, mx = ex + Rm * Math.cos(a1), my = ey - Rm * Math.sin(a1);
      c.strokeStyle = 'rgba(99,230,190,.7)'; c.setLineDash([6, 6]); c.lineWidth = 1.8; c.beginPath(); c.moveTo(m0x, m0y); c.lineTo(m0x + tx * Rm * 0.75, m0y + ty * Rm * 0.75); c.stroke(); c.setLineDash([]);
      label(c, narrow ? 'no gravity: straight on' : 'with no gravity: straight on', m0x + tx * Rm * 0.45 + 6, m0y + ty * Rm * 0.45 - 16, C.green, { size: 10.5, bold: true, fit: true });
      if (frac > 0) { c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy); c.lineTo(mx, my); c.stroke(); arrow(c, sx, sy, (mx - sx), (my - sy), C.gold, { width: 2, head: 6 }); }
      c.fillStyle = 'rgba(219,231,239,.35)'; c.beginPath(); c.arc(m0x, m0y, 9, 0, TAU); c.fill();
      c.fillStyle = '#e9ecef'; c.beginPath(); c.arc(mx, my, 10, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.arc(mx + 3, my + 2, 3, 0, TAU); c.fill();
      var drop = P.dropBelowTangent(MT.r, MT.T, tt);
      var txt = (narrow ? 'below the line: ' : 'fallen below the straight line: ') + (drop < 1 ? fmt(drop * 1000, 2) + ' mm' : fmt(drop, 2) + ' m');
      label(c, txt, rx + 14, h - 18, C.gold, { size: 11.5, bold: true, fit: true });
      label(c, 'time: ' + (Mo.dur === 1 ? fmt(tt, 2) + ' s' : fmt(tt, 1) + ' s'), rx + rw - 14, narrow ? 36 : 30, C.ink, { size: 12, bold: true, align: 'right' });
    }
    function drawChart() {
      var g = CH.c, w = CH.w, h = CH.h; g.clearRect(0, 0, w, h);
      var dark = L.dark(), ink = dark ? '#e6ece8' : '#1d2320', mut = dark ? '#a9b8af' : '#5d6862', grid = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)';
      var x0 = 40, x1 = w - 16, y0 = h - 26, y1 = 8, lx0 = 0, lx1 = 2, ly0 = -3, ly1 = 1.2; // log10 axes: 1–100 Earth radii, 0.001–15 m/s²
      function X(d) { return x0 + (Math.log10(d) - lx0) / (lx1 - lx0) * (x1 - x0); } function Y(a) { return y0 - (Math.log10(a) - ly0) / (ly1 - ly0) * (y0 - y1); }
      g.strokeStyle = grid; g.lineWidth = 1; g.beginPath();
      [1, 10, 100].forEach(function (d) { g.moveTo(X(d), y0); g.lineTo(X(d), y1); });
      [0.001, 0.01, 0.1, 1, 10].forEach(function (a) { g.moveTo(x0, Y(a)); g.lineTo(x1, Y(a)); }); g.stroke();
      g.font = '10px system-ui,sans-serif'; g.fillStyle = mut; g.textAlign = 'center';
      [1, 10, 100].forEach(function (d) { g.fillText(String(d), X(d), y0 + 12); }); g.fillText('distance from Earth’s center (Earth radii)', (x0 + x1) / 2, h - 2);
      g.textAlign = 'right'; [0.001, 0.01, 0.1, 1, 10].forEach(function (a) { g.fillText(String(a), x0 - 4, Y(a) + 3); });
      g.strokeStyle = '#2f9e6f'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(1), Y(G0)); g.lineTo(X(100), Y(G0 / 10000)); g.stroke();
      g.fillStyle = '#e03131'; g.beginPath(); g.arc(X(1), Y(G0), 4.5, 0, TAU); g.fill();
      g.fillStyle = dark ? '#ffd479' : '#b8860b'; g.beginPath(); g.arc(X(MT.ratio), Y(MT.a), 5, 0, TAU); g.fill();
      g.fillStyle = ink; g.textAlign = 'left'; g.font = '600 10.5px system-ui,sans-serif'; g.fillText('apple', X(1) + 7, Y(G0) + 4); g.textAlign = 'right'; g.fillText('Moon', X(MT.ratio) - 7, Y(MT.a) - 5);
      g.textAlign = 'left'; g.font = '10px system-ui,sans-serif'; g.fillStyle = '#2f9e6f'; g.fillText('g ÷ distance²', X(3), Y(G0 / 9) - 6);
    }
    L.onTheme(drawChart); W.addEventListener('resize', drawChart);
    L.loop(function (dt) {
      if (Mo.run) { Mo.t += dt / Mo.slow * (Mo.dur === 60 ? 20 : 1); if (Mo.t >= Mo.dur) { Mo.t = Mo.dur; Mo.run = false; } }
      draw();
    }, view);
    read.innerHTML = '<dt>Moon’s distance r</dt><dd>384,400 km</dd><dt>That is, in Earth radii</dt><dd>' + fmt(MT.ratio, 1) + '</dd><dt>Time for one orbit T</dt><dd>27.32 days</dd><dt>Moon’s speed 2πr/T</dt><dd>' + fmt(MT.v / 1000, 2) + ' km/s</dd>' +
      '<dt>Its acceleration 4π²r/T²</dt><dd>' + fmt(MT.a * 1000, 3) + ' mm/s²</dd><dt>g ÷ 60² = g ÷ 3600</dt><dd>' + fmt(MT.gOver3600 * 1000, 3) + ' mm/s²</dd><dt>Fall in 1 s, ½at²</dt><dd>' + fmt(MT.fall1s * 1000, 2) + ' mm</dd><dt>Fall in 1 minute</dt><dd>' + fmt(MT.fall60s, 2) + ' m</dd>';
    drawChart(); start('s1'); Mo.run = false; Mo.t = 0;
  })();

  /* =====================================================================================
     4. THE CAVENDISH BALANCE
     ===================================================================================== */
  (function () {
    var view = $('nl6k-view'), cv = $('nl6k-cv'); if (!cv) return;
    var G6 = L.canvas(cv), c = G6.c, read = $('nl6k-read'), posG = $('nl6k-pos'), spG = $('nl6k-speed');
    var cav = P.cavendish(), Z = 0.03, MAG = 100;
    var K = { pos: 0, s: { th: 0, om: 0, t: 0 }, speed: 60, hist: [], ext: [], lastSign: 0, Tm: null, eqm: null, paused: false };
    function p() { return { I: cav.I, kappa: cav.kappa, c: 2 * Z * Math.sqrt(cav.kappa * cav.I), eq: K.pos * cav.theta }; }
    function setPos(v) { if (K.pos === v) return; K.pos = v; K.ext = []; K.Tm = null; K.eqm = null; K.mark = K.s.t; seg(posG, 'data-pos', String(v)); }
    posG.addEventListener('click', function (e) { var b = e.target.closest('button[data-pos]'); if (b) setPos(+b.dataset.pos); });
    spG.addEventListener('click', function (e) { var b = e.target.closest('button[data-sp]'); if (!b) return; K.speed = +b.dataset.sp; seg(spG, 'data-sp', b.dataset.sp); });
    $('nl6k-reset').addEventListener('click', function () { K.s = { th: 0, om: 0, t: 0 }; K.hist = []; K.ext = []; K.Tm = null; K.eqm = null; K.pos = 0; seg(posG, 'data-pos', '0'); });
    function measure() {
      // turning points of the swing: their spacing gives the period, and the middle of a swing gives the new resting angle
      var e = K.ext; if (e.length < 3) return;
      var a = e[e.length - 3], b = e[e.length - 2], cc = e[e.length - 1];
      K.Tm = cc.t - a.t; K.eqm = (a.th + 2 * b.th + cc.th) / 4; // averaging three turning points cancels most of the damping bias
    }
    function draw() {
      var w = G6.w, h = G6.h, narrow = w < 560; bg(c, w, h);
      var top = narrow ? h * 0.56 : h, lw = narrow ? w : w * 0.58, cx = lw / 2, cy = top / 2 + 4, Rr = Math.min(lw * 0.38, top * 0.38);
      label(c, 'from above (twist magnified ×' + MAG + ')', 10, 14, C.muted, { size: 10.5, bold: true });
      c.strokeStyle = 'rgba(143,179,198,.25)'; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, Rr * 1.22, 0, TAU); c.stroke();
      // the big balls on their frame: away (0), one side (+1) or the other (−1)
      var bigR = Math.max(12, Rr * 0.17);
      [0, Math.PI].forEach(function (off) {
        var ang = off + (K.pos === 0 ? 1.15 : K.pos * 0.5), bx = cx + Math.cos(ang) * Rr, by = cy - Math.sin(ang) * Rr; // both pull the same way round
        var gr = c.createRadialGradient(bx - bigR * 0.3, by - bigR * 0.3, 2, bx, by, bigR); gr.addColorStop(0, '#adb5bd'); gr.addColorStop(1, '#495057'); c.fillStyle = gr; c.beginPath(); c.arc(bx, by, bigR, 0, TAU); c.fill();
      });
      if (K.pos !== 0) label(c, '158 kg', cx + Math.cos(K.pos * 0.5) * Rr, cy - Math.sin(K.pos * 0.5) * Rr - bigR - 9, C.muted, { size: 10, align: 'center', fit: true }); else if (!narrow) label(c, '158 kg lead balls, swung away', cx + Rr * 0.35, cy - Rr - bigR + 6, C.muted, { size: 10, fit: true });
      // the rod with the small balls, turned by the twist (magnified)
      var th = K.s.th * MAG;
      c.save(); c.translate(cx, cy); c.rotate(-th);
      c.strokeStyle = '#c9a26b'; c.lineWidth = 4; c.beginPath(); c.moveTo(-Rr, 0); c.lineTo(Rr, 0); c.stroke();
      c.fillStyle = C.gold; c.beginPath(); c.arc(-Rr, 0, 6, 0, TAU); c.arc(Rr, 0, 6, 0, TAU); c.fill();
      c.fillStyle = '#dbe7ef'; c.fillRect(-3, -8, 6, 16); // the mirror on the fiber
      c.restore();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 2.5, 0, TAU); c.fill();
      // the light beam: from a lamp, off the mirror, onto a scale (the beam turns by twice the twist)
      var lampX = cx, lampY = Math.min(top - 8, cy + Rr * 1.45), scaleY = narrow ? Math.max(30, cy - Rr * 1.3) : 34, beamA = -Math.PI / 2 - 2 * th;
      c.strokeStyle = 'rgba(255,135,135,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(lampX, lampY); c.lineTo(cx, cy); var bl = (cy - scaleY) / Math.max(0.2, -Math.sin(beamA)); var spotX = cx + Math.cos(beamA) * bl; c.lineTo(spotX, scaleY); c.stroke();
      c.strokeStyle = 'rgba(219,231,239,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - Rr, scaleY - 6); c.lineTo(cx + Rr, scaleY - 6); for (var tk = -10; tk <= 10; tk++) { c.moveTo(cx + tk * Rr / 10, scaleY - 6); c.lineTo(cx + tk * Rr / 10, scaleY - (tk % 5 ? 10 : 13)); } c.stroke();
      var gl = c.createRadialGradient(spotX, scaleY, 1, spotX, scaleY, 12); gl.addColorStop(0, 'rgba(255,135,135,.9)'); gl.addColorStop(1, 'rgba(255,135,135,0)'); c.fillStyle = gl; c.beginPath(); c.arc(spotX, scaleY, 12, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(spotX, scaleY, 2.5, 0, TAU); c.fill();
      c.fillStyle = '#ffd8a8'; c.fillRect(lampX - 5, lampY - 3, 10, 6);
      // the graph of the twist
      var gx0 = narrow ? 10 : lw + 6, gy0 = narrow ? top + 4 : 10, gw = narrow ? w - 20 : w - lw - 16, gh = narrow ? h - top - 12 : h - 20;
      panelBox(c, gx0, gy0, gw, gh, 'TWIST θ (milliradians) vs TIME (minutes)');
      var span = 60 * 60, t1 = K.s.t, t0 = Math.max(0, t1 - span), py0 = gy0 + 30, py1 = gy0 + gh - 22, thMax = 2.6 * cav.theta;
      function GX(t) { return gx0 + 34 + (t - t0) / span * (gw - 44); } function GY(v) { return (py0 + py1) / 2 - v / thMax * (py1 - py0) / 2; }
      c.strokeStyle = 'rgba(143,179,198,.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx0 + 34, GY(0)); c.lineTo(gx0 + gw - 10, GY(0)); c.stroke();
      [-1, 1].forEach(function (s) { c.strokeStyle = 'rgba(255,212,121,.35)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(gx0 + 34, GY(s * cav.theta)); c.lineTo(gx0 + gw - 10, GY(s * cav.theta)); c.stroke(); c.setLineDash([]); label(c, fmt(s * cav.theta * 1000, 2), gx0 + 30, GY(s * cav.theta), C.gold, { size: 9.5, align: 'right' }); });
      label(c, '0', gx0 + 30, GY(0), C.muted, { size: 9.5, align: 'right' });
      c.strokeStyle = C.green; c.lineWidth = 2; c.beginPath(); var first = true;
      K.hist.forEach(function (q) { if (q.t < t0) return; if (first) { c.moveTo(GX(q.t), GY(q.th)); first = false; } else c.lineTo(GX(q.t), GY(q.th)); }); c.stroke();
      label(c, fmt(t0 / 60, 0) + ' min', gx0 + 34, py1 + 12, C.muted, { size: 9.5 });
      label(c, fmt(t1 / 60, 1) + ' min', gx0 + gw - 10, py1 + 12, C.muted, { size: 9.5, align: 'right' });
    }
    L.loop(function (dt) {
      if (!K.paused) {
        var steps = Math.ceil(dt * K.speed / 1), hh = dt * K.speed / steps, pp = p();
        for (var i = 0; i < steps; i++) {
          var om0 = K.s.om; P.swingStep(K.s, pp, hh);
          if (K.pos !== 0 && om0 !== 0 && Math.sign(om0) !== Math.sign(K.s.om)) { K.ext.push({ t: K.s.t, th: K.s.th }); measure(); }
        }
        var last = K.hist[K.hist.length - 1]; if (!last || K.s.t - last.t > 4) { K.hist.push({ t: K.s.t, th: K.s.th }); if (K.hist.length > 2000) K.hist.shift(); }
      }
      draw();
      var Gm = K.Tm && K.eqm !== null ? P.gFromSwing(P.CAV, K.Tm, Math.abs(K.eqm)) : null, Me = Gm ? P.earthMass(Gm, P.K.GM_EARTH / (P.K.R_EARTH * P.K.R_EARTH), P.K.R_EARTH) : null;
      var rows = '<dt>Pull between each pair of balls</dt><dd>' + sci(cav.F, 2) + ' N</dd><dt>Twist right now</dt><dd>' + fmt(K.s.th * 1000, 3) + ' mrad</dd><dt>Swing period, measured</dt><dd>' + (K.Tm ? fmt(K.Tm / 60, 2) + ' min' : 'swing the balls in') + '</dd>' +
        '<dt>New resting twist, measured</dt><dd>' + (K.eqm !== null ? fmt(Math.abs(K.eqm) * 1000, 3) + ' mrad' : '…') + '</dd><dt>Your G = 2π²Ld²θ / (MT²)</dt><dd>' + (Gm ? sci(Gm, 3) : '…') + '</dd><dt>Earth’s mass from your G</dt><dd>' + (Me ? sci(Me, 2) + ' kg' : '…') + '</dd>';
      if (read._h !== rows) { read.innerHTML = rows; read._h = rows; }
    }, view);
  })();
})(window, document);
