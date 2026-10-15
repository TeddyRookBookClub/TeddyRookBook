/* The Laws of Thermodynamics hub: the hero animation. Two boxes of gas share a wall that lets heat through. The hot side
   glows orange, the cold side blue; heat flows across until both match, then a flame or a block of ice upsets the
   balance again. Each side's temperature follows Newton's law of cooling, and its molecules' speeds are scaled so their
   average kinetic energy is proportional to that temperature. With reduced motion it draws one still frame. */
(function () {
  'use strict';
  var LAB = window.TRBLab, cv = document.getElementById('thh-cv'), cap = document.getElementById('thh-cap');
  if (!cv || !LAB) return;
  var K = LAB.canvas(cv), g = K.c, reduced = LAB.reduced;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var STOPS = [[0, [116, 192, 252]], [40, [150, 140, 205]], [70, [255, 135, 135]], [100, [255, 212, 121]]];
  function rgb(c) { c = clamp(c, 0, 100); for (var i = 1; i < STOPS.length; i++) if (c <= STOPS[i][0]) { var a = STOPS[i - 1], b = STOPS[i], f = (c - a[0]) / (b[0] - a[0]); return [lerp(a[1][0], b[1][0], f), lerp(a[1][1], b[1][1], f), lerp(a[1][2], b[1][2], f)]; } return STOPS[3][1]; }
  function col(T, a) { var c = rgb((T - 120) / 8.8); return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : a) + ')'; }

  var N = 56, side = [[], []], T = [900, 150], sparks = [], phase = 'flow', hold = 0, kick = null, t = 0, kicks = 0;
  for (var s = 0; s < 2; s++) for (var i = 0; i < N; i++) { var a = Math.random() * 6.283; side[s].push({ x: Math.random(), y: Math.random(), vx: Math.cos(a) * (0.6 + Math.random() * 0.8), vy: Math.sin(a) * (0.6 + Math.random() * 0.8), tr: [] }); }
  if (reduced) { T = [700, 330]; }

  var L = {};
  function lay() {
    var w = K.w, h = K.h; L.w = w; L.h = h; L.wide = w >= 760;
    if (L.wide) { L.x0 = Math.max(w * 0.5, w - 560); L.x1 = w - 26; L.y0 = 34; L.y1 = h - 64; }
    else { L.x0 = 14; L.x1 = w - 14; L.y1 = h - 58; L.y0 = h - 236; }
    L.mid = (L.x0 + L.x1) / 2; L.wall = 6;
    for (var q = 0; q < 2; q++) for (var r = 0; r < side[q].length; r++) side[q][r].tr = [];
    L.box = [{ x: L.x0, y: L.y0, w: L.mid - L.wall / 2 - L.x0, h: L.y1 - L.y0 }, { x: L.mid + L.wall / 2, y: L.y0, w: L.x1 - L.mid - L.wall / 2, h: L.y1 - L.y0 }];
  }
  function setCap(text) { if (cap && cap.textContent !== text) cap.textContent = text; }

  function step(dt) {
    t += dt;
    // heat across the wall: equal heat capacities, so each side moves toward the average
    var k = 0.13, d = T[0] - T[1], q = d * (1 - Math.exp(-2 * k * dt)) / 2;
    T[0] -= q; T[1] += q;
    if (phase === 'flow' && Math.abs(T[0] - T[1]) < 10) { phase = 'rest'; hold = 0; }
    if (phase === 'rest') { hold += dt; if (hold > 2.2) { var mean = (T[0] + T[1]) / 2, sd = Math.random() < 0.5 ? 0 : 1, heat = mean < 520 || (mean < 700 && kicks % 2 === 0); kick = { side: sd, heat: heat, age: 0 }; phase = 'kick'; kicks++; } }
    if (phase === 'kick') {
      kick.age += dt; var target = kick.heat ? 980 : 110, r = 1 - Math.exp(-dt * 2.6);
      T[kick.side] += (target - T[kick.side]) * r * 0.55;
      if (kick.age > 1.3) { phase = 'flow'; }
    }
    if (kick && kick.age < 2.4 && phase !== 'kick') kick.age += dt;
    // molecules
    for (var s = 0; s < 2; s++) {
      var B = L.box[s], v = 26 * Math.sqrt(T[s] / 10), arr = side[s], ms = 0, i, p;
      for (i = 0; i < arr.length; i++) {
        p = arr[i]; p.x += p.vx * v * dt / B.w; p.y += p.vy * v * dt / B.h;
        if (p.x < 0) { p.x = -p.x; p.vx = Math.abs(p.vx); if (s === 1) hitWall(1, p); }
        if (p.x > 1) { p.x = 2 - p.x; p.vx = -Math.abs(p.vx); if (s === 0) hitWall(0, p); }
        if (p.y < 0) { p.y = -p.y; p.vy = Math.abs(p.vy); } if (p.y > 1) { p.y = 2 - p.y; p.vy = -Math.abs(p.vy); }
        p.x = clamp(p.x, 0, 1); p.y = clamp(p.y, 0, 1);
        // gentle random turns stand in for collisions between molecules
        var ang = (Math.random() - 0.5) * dt * 2.2, c = Math.cos(ang), sn = Math.sin(ang), vx = p.vx * c - p.vy * sn; p.vy = p.vx * sn + p.vy * c; p.vx = vx;
        ms += p.vx * p.vx + p.vy * p.vy;
        p.tr.push(B.x + p.x * B.w, B.y + p.y * B.h); if (p.tr.length > 10) p.tr.splice(0, 2);
      }
      var sc = Math.sqrt(arr.length / ms); for (i = 0; i < arr.length; i++) { arr[i].vx *= sc; arr[i].vy *= sc; }
    }
    for (var j = sparks.length - 1; j >= 0; j--) { var sp = sparks[j]; sp.u += dt * 1.8; if (sp.u >= 1) sparks.splice(j, 1); }
    var gap = Math.abs(T[0] - T[1]);
    setCap(phase === 'kick' ? (kick.heat ? 'A flame heats one side…' : 'Ice cools one side…') : gap > 12 ? 'Heat flows from hot to cold through the wall' : 'Equilibrium: both sides at ' + Math.round((T[0] + T[1]) / 2) + ' K');
  }
  function hitWall(s, p) {
    var d = T[0] - T[1]; if (Math.abs(d) < 8 || sparks.length > 40) return;
    if ((d > 0 && s === 0) || (d < 0 && s === 1)) if (Math.random() < Math.min(0.8, Math.abs(d) / 500)) sparks.push({ y: L.box[s].y + p.y * L.box[s].h, u: 0, dir: d > 0 ? 1 : -1, T: Math.max(T[0], T[1]) });
  }

  function draw() {
    var w = K.w, h = K.h; if (w !== L.w || h !== L.h) lay();
    g.clearRect(0, 0, w, h);
    // background: a faint grid and a glow behind each box
    g.fillStyle = '#06111a'; g.fillRect(0, 0, w, h);
    for (var s = 0; s < 2; s++) {
      var B = L.box[s], cx = B.x + B.w / 2, cy = B.y + B.h / 2, R = Math.max(B.w, B.h) * 0.95;
      var gr = g.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, col(T[s], 0.55)); gr.addColorStop(0.55, col(T[s], 0.18)); gr.addColorStop(1, col(T[s], 0));
      g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    }
    g.strokeStyle = 'rgba(120,170,200,.07)'; g.lineWidth = 1;
    for (var gx = 0; gx < w; gx += 34) { g.beginPath(); g.moveTo(gx + 0.5, 0); g.lineTo(gx + 0.5, h); g.stroke(); }
    for (var gy = 0; gy < h; gy += 34) { g.beginPath(); g.moveTo(0, gy + 0.5); g.lineTo(w, gy + 0.5); g.stroke(); }
    if (L.wide) { var sh = g.createLinearGradient(0, 0, L.x0, 0); sh.addColorStop(0, 'rgba(6,17,26,.97)'); sh.addColorStop(0.8, 'rgba(6,17,26,.75)'); sh.addColorStop(1, 'rgba(6,17,26,0)'); g.fillStyle = sh; g.fillRect(0, 0, L.x0, h); }
    // the boxes
    for (s = 0; s < 2; s++) {
      B = L.box[s];
      g.fillStyle = 'rgba(6,17,26,.35)'; g.fillRect(B.x, B.y, B.w, B.h);
      g.strokeStyle = col(T[s], 0.75); g.lineWidth = 1.5; g.strokeRect(B.x + 0.5, B.y + 0.5, B.w - 1, B.h - 1);
      var arr = side[s];
      for (var i = 0; i < arr.length; i++) {
        var p = arr[i], x = B.x + p.x * B.w, y = B.y + p.y * B.h, sp = Math.hypot(p.vx, p.vy), Tp = T[s] * sp * sp;
        if (!reduced && p.tr.length > 3) { g.strokeStyle = col(Tp, 0.22); g.lineWidth = 2; g.beginPath(); g.moveTo(p.tr[0], p.tr[1]); for (var k = 2; k < p.tr.length; k += 2) g.lineTo(p.tr[k], p.tr[k + 1]); g.stroke(); }
        g.fillStyle = col(Tp, 0.25); g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill();
        g.fillStyle = col(Tp, 1); g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill();
      }
      // a thermometer bar under each box
      var bx = B.x + 10, by = B.y + B.h + 14, bw = B.w - 20, f = clamp((T[s] - 80) / 940, 0, 1);
      g.fillStyle = 'rgba(219,231,239,.12)'; g.fillRect(bx, by, bw, 6);
      g.fillStyle = col(T[s]); g.fillRect(bx, by, bw * f, 6);
      g.font = '700 12px ui-monospace,Menlo,Consolas,monospace'; g.textAlign = s ? 'right' : 'left'; g.fillStyle = col(T[s]);
      g.fillText(Math.round(T[s]) + ' K', s ? B.x + B.w - 10 : B.x + 10, B.y + 18);
    }
    // the wall, and energy crossing it
    var wg = g.createLinearGradient(0, L.y0, 0, L.y1); wg.addColorStop(0, '#9fb2c1'); wg.addColorStop(1, '#5b6a77');
    g.fillStyle = wg; g.fillRect(L.mid - L.wall / 2, L.y0, L.wall, L.y1 - L.y0);
    for (var j = 0; j < sparks.length; j++) {
      var q = sparks[j], sx = L.mid + q.dir * (q.u - 0.5) * 34, al = Math.sin(q.u * Math.PI);
      g.fillStyle = 'rgba(255,212,121,' + (0.9 * al) + ')'; g.beginPath(); g.arc(sx, q.y, 3, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,212,121,' + (0.25 * al) + ')'; g.beginPath(); g.arc(sx, q.y, 8, 0, 7); g.fill();
    }
    // the flame or the ice that upsets the balance
    if (kick && kick.age < 1.8) {
      var KB = L.box[kick.side], kx = KB.x + KB.w / 2, ky = KB.y + KB.h - 4, al2 = clamp(1.8 - kick.age, 0, 1);
      g.globalAlpha = al2;
      if (kick.heat) {
        for (var fl = 0; fl < 5; fl++) {
          var fx = kx + (fl - 2) * 18, fh = 22 + 8 * Math.sin(t * 10 + fl * 1.7);
          var fg = g.createLinearGradient(0, ky, 0, ky - fh); fg.addColorStop(0, 'rgba(116,192,252,.9)'); fg.addColorStop(0.35, 'rgba(255,212,121,.95)'); fg.addColorStop(1, 'rgba(255,135,135,0)');
          g.fillStyle = fg; g.beginPath(); g.moveTo(fx - 9, ky); g.quadraticCurveTo(fx - 7, ky - fh * 0.6, fx, ky - fh); g.quadraticCurveTo(fx + 7, ky - fh * 0.6, fx + 9, ky); g.closePath(); g.fill();
        }
      } else {
        for (var ic = 0; ic < 4; ic++) { g.fillStyle = 'rgba(200,235,255,.8)'; g.fillRect(kx + (ic - 2) * 22 + 2, ky - 18 - (ic % 2) * 3, 18, 16); g.strokeStyle = '#fff'; g.strokeRect(kx + (ic - 2) * 22 + 2, ky - 18 - (ic % 2) * 3, 18, 16); }
      }
      g.globalAlpha = 1;
    }
  }
  lay();
  if (reduced) {
    draw(); setCap('Heat flows from hot to cold until both match');
    window.addEventListener('resize', function () { K.fit(); draw(); });
    return;
  }
  LAB.loop(function (dt) { if (K.w !== L.w || K.h !== L.h) lay(); step(dt); draw(); }, cv);
})();
