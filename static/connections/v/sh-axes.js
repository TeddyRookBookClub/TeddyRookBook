/* Icosahedral symmetry (/connections/shells/): a T = 1 shell (20 faces, three copies of one protein on each, one gold).
   Buttons turn it to look down a 5-fold, 3-fold or 2-fold axis; "Turn one step" spins it about that axis by 1/n of a turn,
   which carries every copy onto the place of another. Drag or use the arrow keys to turn it by hand. */
(function () {
  var F = (1 + Math.sqrt(5)) / 2;
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function addv(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mulv(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function crs(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function nrm(a) { var l = Math.sqrt(dot(a, a)) || 1; return mulv(a, 1 / l); }
  function lerp(a, b, t) { return addv(a, mulv(sub(b, a), t)); }
  // quaternions [w, x, y, z]
  function qmul(a, b) { return [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]]; }
  function qaxis(ax, an) { var s = Math.sin(an / 2), n = nrm(ax); return [Math.cos(an / 2), n[0] * s, n[1] * s, n[2] * s]; }
  function qrot(q, v) { var p = qmul(qmul(q, [0, v[0], v[1], v[2]]), [q[0], -q[1], -q[2], -q[3]]); return [p[1], p[2], p[3]]; }
  function qnorm(q) { var l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; }
  function qtwo(u, v) { u = nrm(u); v = nrm(v); var d = dot(u, v); if (d > 0.999999) return [1, 0, 0, 0]; if (d < -0.999999) { var o = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; return qaxis(crs(u, o), Math.PI); } var c = crs(u, v); return qnorm([1 + d, c[0], c[1], c[2]]); }
  function slerp(a, b, t) {
    var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; if (d < 0) { b = b.map(function (x) { return -x; }); d = -d; }
    if (d > 0.9995) return qnorm(a.map(function (x, i) { return x + (b[i] - x) * t; }));
    var th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
    return a.map(function (x, i) { return x * wa + b[i] * wb; });
  }
  // the icosahedron
  var V = [];
  [-1, 1].forEach(function (s1) { [-1, 1].forEach(function (s2) { V.push([0, s1, s2 * F]); V.push([s1, s2 * F, 0]); V.push([s2 * F, 0, s1]); }); });
  var FACES = [], EDGES = [];
  for (var i = 0; i < 12; i++) for (var j = i + 1; j < 12; j++) {
    if (Math.abs(dot(sub(V[i], V[j]), sub(V[i], V[j])) - 4) > 1e-6) continue;
    EDGES.push([i, j]);
    for (var k = j + 1; k < 12; k++) {
      if (Math.abs(dot(sub(V[i], V[k]), sub(V[i], V[k])) - 4) > 1e-6 || Math.abs(dot(sub(V[j], V[k]), sub(V[j], V[k])) - 4) > 1e-6) continue;
      var f = [i, j, k]; if (dot(crs(sub(V[j], V[i]), sub(V[k], V[i])), addv(addv(V[i], V[j]), V[k])) < 0) f = [i, k, j];
      FACES.push(f);
    }
  }
  var AX = {
    5: { v: V[FACES[0][0]], n: 6, name: '5-fold', where: 'a corner, where five faces meet' },
    3: { v: addv(addv(V[FACES[0][0]], V[FACES[0][1]]), V[FACES[0][2]]), n: 10, name: '3-fold', where: 'the middle of a face' },
    2: { v: addv(V[FACES[0][0]], V[FACES[0][1]]), n: 15, name: '2-fold', where: 'the middle of an edge' }
  };
  Cx.viz('sh-axes', function (v) {
    var q = qnorm(qmul(qaxis([1, 0.4, 0], 0.45), qtwo(AX[3].v, [0, 0, 1]))), anim = null, fold = 0, drag = null, marks = true;
    var cv = v.canvas({ aspect: 0.62, min: 230, max: 420, label: 'A turning icosahedral virus shell' });
    cv.el.tabIndex = 0;
    var out = document.createElement('p'); out.className = 'sh-out'; v.stage.parentNode.insertBefore(out, v.bar);
    var vb = {};
    [5, 3, 2].forEach(function (n) { vb[n] = v.button('Look down a ' + AX[n].name + ' axis', function () { look(n); }); vb[n].setAttribute('aria-pressed', 'false'); });
    var step = v.button('Turn one step', function () { if (!fold) return; go(qmul(qaxis([0, 0, 1], 2 * Math.PI / fold), q), 700); }, { pri: true });
    step.disabled = true;
    var spin = v.loop(function (dt) { if (!anim && !drag) { q = qnorm(qmul(qaxis([0.3, 1, 0.1], dt * 0.35), q)); setFold(0); v.redraw(); } }, { label: 'Spin', auto: false });
    v.toggle('Show the axes', true, function (on) { marks = on; v.redraw(); });
    function setFold(n) {
      if (fold === n) return; fold = n;
      [5, 3, 2].forEach(function (m) { vb[m].setAttribute('aria-pressed', m === n ? 'true' : 'false'); });
      step.disabled = !n; step.textContent = n ? 'Turn 1/' + n + ' of a turn' : 'Turn one step';
      text();
    }
    function text() {
      if (!fold) { out.innerHTML = 'An icosahedron has <b>6</b> five-fold axes (red pentagons), <b>10</b> three-fold axes (triangles) and <b>15</b> two-fold axes (ovals): 1 + 6×4 + 10×2 + 15×1 = <b>60</b> turns, one for each copy of the protein.'; return; }
      var A = AX[fold];
      out.innerHTML = 'Looking down a <b>' + A.name + ' axis</b>, through ' + A.where + '. The shell looks the same after each 1/' + fold + ' of a turn. It has <b>' + A.n + '</b> axes like this. Press the turn button and watch the gold copy move into another copy’s place.';
    }
    function go(target, ms) { anim = { a: q, b: target, t0: performance.now(), ms: v.reduced ? 1 : ms }; tick(); }
    function tick() {
      if (!anim) return; var t = Math.min(1, (performance.now() - anim.t0) / anim.ms), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      q = slerp(anim.a, anim.b, e); drawNow();
      if (t < 1) requestAnimationFrame(tick); else { q = anim.b; anim = null; drawNow(); }
    }
    function look(n) {
      if (spin.on) spin.pause();
      var cur = qrot(q, AX[n].v), target = qmul(qtwo(cur, [0, 0, 1]), q);
      setFold(n); go(target, 800);
      v.say('Looking down a ' + AX[n].name + ' axis.');
    }
    cv.el.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY]; try { cv.el.setPointerCapture(e.pointerId); } catch (x) { } if (spin.on) spin.pause(); });
    cv.el.addEventListener('pointermove', function (e) {
      if (!drag) return; var dx = e.clientX - drag[0], dy = e.clientY - drag[1]; drag = [e.clientX, e.clientY];
      if (!dx && !dy) return;
      q = qnorm(qmul(qaxis([dy, dx, 0], Math.hypot(dx, dy) * 0.01), q)); setFold(0); drawNow();
    });
    function end() { drag = null; }
    cv.el.addEventListener('pointerup', end); cv.el.addEventListener('pointercancel', end);
    cv.el.addEventListener('keydown', function (e) {
      var m = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key]; if (!m) return;
      e.preventDefault(); q = qnorm(qmul(qaxis([m[0], m[1], 0], 0.12), q)); setFold(0); drawNow();
    });
    var C = null;
    function drawNow() { if (C) paint(C); }
    v.draw(function (c) { C = c; paint(c); });
    function paint(c) {
      cv.fit(); var ctx = cv.ctx, W = cv.w, H = cv.h; cv.clear(c.bg);
      var sc = Math.min(W, H) * 0.36 / F, cx = W / 2, cy = H / 2;
      var R = V.map(function (p) { return qrot(q, p); });
      function X(p) { return [cx + sc * p[0], cy - sc * p[1]]; }
      var light = nrm([-0.4, 0.6, 1]);
      var fs = FACES.map(function (f, fi) { var a = R[f[0]], b = R[f[1]], d = R[f[2]], n = nrm(crs(sub(b, a), sub(d, a))); return { f: f, fi: fi, n: n, z: (a[2] + b[2] + d[2]) / 3 }; })
        .filter(function (o) { return o.n[2] > 1e-3; }).sort(function (a, b) { return a.z - b.z; });
      ctx.lineJoin = 'round';
      fs.forEach(function (o) {
        var P = o.f.map(function (i) { return R[i]; }), ce = mulv(addv(addv(P[0], P[1]), P[2]), 1 / 3);
        var sh = 0.55 + 0.45 * Math.max(0, dot(o.n, light));
        ctx.beginPath(); P.map(X).forEach(function (s, m) { m ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath();
        ctx.fillStyle = c.a(c.dark ? '#24362c' : '#e4ece7', 1); ctx.fill(); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.stroke();
        for (var m = 0; m < 3; m++) {
          var A = P[m], B = P[(m + 1) % 3], mid = lerp(A, B, 0.5);
          var poly = [lerp(ce, A, 0.12), lerp(ce, A, 0.86), lerp(A, B, 0.42), lerp(ce, mid, 0.78)].map(X);
          ctx.beginPath(); poly.forEach(function (s, n) { n ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]); }); ctx.closePath();
          var gold = o.fi === 0 && m === 0;
          ctx.globalAlpha = sh; ctx.fillStyle = gold ? c.gold : c.green; ctx.fill(); ctx.globalAlpha = 1;
          ctx.strokeStyle = c.bg; ctx.lineWidth = 1.2; ctx.stroke();
        }
      });
      if (!marks) return;
      function mark(p, n, rot) {
        if (nrm(p)[2] < 0.2) return; var s = X(p), r = n === 2 ? 0 : (n === 5 ? 9 : 8);
        ctx.beginPath();
        if (n === 2) ctx.ellipse(s[0], s[1], 8, 4.5, rot, 0, 7);
        else for (var m = 0; m < n; m++) { var th = rot + m * 2 * Math.PI / n; ctx.lineTo(s[0] + r * Math.cos(th), s[1] + r * Math.sin(th)); }
        ctx.closePath(); ctx.fillStyle = n === 5 ? c.red : n === 3 ? c.blue : c.purple; ctx.fill(); ctx.strokeStyle = c.bg; ctx.lineWidth = 1.5; ctx.stroke();
      }
      R.forEach(function (p) { mark(p, 5, -Math.PI / 2); });
      FACES.forEach(function (f) { var p = mulv(addv(addv(R[f[0]], R[f[1]]), R[f[2]]), 1 / 3), a = X(R[f[0]]), s = X(p); mark(p, 3, Math.atan2(a[1] - s[1], a[0] - s[0])); });
      EDGES.forEach(function (e) { var p = lerp(R[e[0]], R[e[1]], 0.5), a = X(R[e[0]]), b = X(R[e[1]]); mark(p, 2, Math.atan2(b[1] - a[1], b[0] - a[0])); });
    }
    text();
  });
})();
