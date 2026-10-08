/* Streets of Rome and Athens: a top-down city game in the style of the first Grand Theft Auto, made family-friendly.
   Walk the streets, take chariots from the stables, run errands for a patron, race, catch thieves and lose the watch.
   People in the street greet you in Latin or Koine Greek. Map data and missions in city-data.js. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('ct'); if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var CD = W.CityData;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
  var TR = function (s) { return W.grTranslit ? W.grTranslit(s) : ''; };
  var RM = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- save ----------
  var KEY = 'trb-city-v1', st = { done: { rome: [], athens: [] }, coins: 0, words: true, city: 'rome' };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }

  // ---------- canvas ----------
  var cv = $('canvas'), c = cv.getContext('2d'), dpr = 1, Wd = 0, Ht = 0, T = 32, zoom = 1;
  var touch = ('ontouchstart' in W) || (W.matchMedia && W.matchMedia('(pointer:coarse)').matches);
  function fit() { dpr = Math.min(2, W.devicePixelRatio || 1); Wd = cv.clientWidth; Ht = cv.clientHeight; cv.width = Math.round(Wd * dpr); cv.height = Math.round(Ht * dpr); }
  W.addEventListener('resize', fit);

  // ---------- the world ----------
  var G = null; // { city, m, mapImg, mini, p, cars, peds, guards, items, mission, ... }
  var PX = 24; // pixels per tile in the pre-drawn map
  function nearestWalk(m, x, y) {
    var sx0 = Math.floor(x), sy0 = Math.floor(y); if (m.walk(sx0, sy0)) return [sx0 + 0.5, sy0 + 0.5];
    for (var r = 1; r < 12; r++) for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (m.walk(sx0 + dx, sy0 + dy) && m.get(sx0 + dx, sy0 + dy) !== 8) return [sx0 + dx + 0.5, sy0 + dy + 0.5]; }
    return [x, y];
  }
  function lmById(id) { return G.m.lm.filter(function (l) { return l.id === id; })[0]; }
  function spot(id) { var l = lmById(id); if (!l) return null; if (!l.spot) l.spot = nearestWalk(G.m, (l.visit || [l.x, l.y])[0], (l.visit || [l.x, l.y])[1]); return l.spot; }

  function hash(x, y) { var h = (x * 374761393 + y * 668265263) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function drawMap(m) {
    var cvs = D.createElement('canvas'); cvs.width = m.w * PX; cvs.height = m.h * PX;
    var g = cvs.getContext('2d'), P = m.palette, x, y, t;
    for (y = 0; y < m.h; y++) for (x = 0; x < m.w; x++) {
      t = m.get(x, y); var X = x * PX, Y = y * PX, h = hash(x, y);
      if (t === 0 || t === 5) { g.fillStyle = P.road; g.fillRect(X, Y, PX, PX); g.fillStyle = 'rgba(0,0,0,.07)'; if (h < 0.5) g.fillRect(X + (h * 40 % PX), Y + (h * 97 % PX), 5, 3); g.strokeStyle = 'rgba(0,0,0,.05)'; g.strokeRect(X + 0.5, Y + 0.5, PX - 1, PX - 1); if (t === 5) { g.fillStyle = '#7d6a50'; if (!m.walk(x, y - 1) || m.get(x, y - 1) === 4) g.fillRect(X, Y, PX, 3); if (!m.walk(x, y + 1) || m.get(x, y + 1) === 4) g.fillRect(X, Y + PX - 3, PX, 3); } }
      else if (t === 2) { g.fillStyle = P.plaza; g.fillRect(X, Y, PX, PX); g.strokeStyle = 'rgba(120,100,70,.18)'; g.strokeRect(X + 0.5, Y + 0.5, PX - 1, PX - 1); }
      else if (t === 3 || t === 7) { g.fillStyle = P.grass; g.fillRect(X, Y, PX, PX); g.fillStyle = 'rgba(40,70,20,.18)'; g.fillRect(X + h * 20, Y + (h * 53 % 20), 3, 3); }
      else if (t === 4) { g.fillStyle = '#3f7fb0'; g.fillRect(X, Y, PX, PX); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(X + h * 14, Y + 6 + (h * 31 % 12), 8, 2); }
      else if (t === 8) { g.fillStyle = '#dcc48e'; g.fillRect(X, Y, PX, PX); g.fillStyle = 'rgba(150,110,50,.15)'; g.fillRect(X + h * 18, Y + (h * 71 % 20), 4, 2); }
      else if (t === 9) { g.fillStyle = '#c9bba0'; g.fillRect(X, Y, PX, PX); g.strokeStyle = 'rgba(80,70,50,.35)'; g.strokeRect(X + 0.5, Y + 0.5, PX - 1, PX - 1); }
      else if (t === 10 || t === 11) { g.fillStyle = t === 10 ? '#b3a283' : '#c8b896'; g.fillRect(X, Y, PX, PX); g.strokeStyle = 'rgba(80,65,40,.25)'; g.beginPath(); g.moveTo(X + h * PX, Y); g.lineTo(X + PX * 0.6, Y + PX); g.stroke(); }
      else if (t === 6) { g.fillStyle = '#d8ccb4'; g.fillRect(X, Y, PX, PX); }
      else { // houses: tiled roofs, one colour per block, a shadow on the street side
        var bh = hash(Math.floor(x / 3), Math.floor(y / 3)); g.fillStyle = P.roof[Math.floor(bh * P.roof.length)]; g.fillRect(X, Y, PX, PX);
        g.fillStyle = 'rgba(0,0,0,.12)'; for (var r = 4; r < PX; r += 6) g.fillRect(X, Y + r, PX, 1);
        if (m.get(x, y + 1) !== 1) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(X, Y + PX - 4, PX, 4); }
        if (m.get(x + 1, y) !== 1) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(X + PX - 3, Y, 3, PX); }
        if (bh > 0.82 && hash(x + 7, y) > 0.7) { g.fillStyle = 'rgba(255,240,200,.25)'; g.fillRect(X + 3, Y + 3, PX - 6, PX - 6); } // a courtyard
      }
      if (t === 7) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(X + PX * 0.6, Y + PX * 0.62, PX * 0.42, 0, 7); g.fill(); g.fillStyle = h > 0.5 ? '#3f6b2a' : '#2f5a26'; g.beginPath(); g.arc(X + PX / 2, Y + PX / 2, PX * 0.45, 0, 7); g.fill(); }
      if ((t === 0 || t === 2) && m.get(x, y - 1) === 1) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(X, Y, PX, 5); }
    }
    m.deco.forEach(function (d) { drawDeco(g, d); });
    // labels
    m.lm.forEach(function (l) {
      if (!l.label) return;
      var X = l.x * PX, Y = l.y * PX;
      g.textAlign = 'center';
      if (l.w) { g.font = (m.lang === 'g' ? '' : '') + Math.round(PX * 1.05) + 'px "Gentium Book Plus",Georgia,serif'; g.lineWidth = 5; g.strokeStyle = 'rgba(255,250,235,.85)'; g.strokeText(l.w, X, Y); g.fillStyle = '#5a1d10'; g.fillText(l.w, X, Y); }
      g.font = 'italic ' + Math.round(PX * 0.5) + 'px Georgia,serif'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,250,235,.85)'; var e = l.e.split(' (')[0]; if (!l.w) e = l.e; g.strokeText(e, X, Y + PX * 0.62); g.fillStyle = '#3d4a43'; g.fillText(e, X, Y + PX * 0.62);
    });
    return cvs;
  }
  function drawDeco(g, d) {
    var P = PX;
    function cols(x, y, w, h, n) { g.fillStyle = '#f4efe2'; for (var i = 0; i < n; i++) { g.beginPath(); g.arc(x + (i + 0.5) * w / n, y, P * 0.12, 0, 7); g.fill(); g.beginPath(); g.arc(x + (i + 0.5) * w / n, y + h, P * 0.12, 0, 7); g.fill(); } }
    if (d.k === 'temple' || d.k === 'house' || d.k === 'shop') {
      var X = d.x * P, Y = d.y * P, w = d.w * P, h = d.h * P;
      g.fillStyle = d.k === 'temple' ? '#efe8d8' : d.k === 'shop' ? '#c9784a' : '#d07a4f'; g.fillRect(X, Y, w, h);
      g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(X, Y + h / 2, w, 2);
      if (d.k === 'temple') { g.strokeStyle = '#b8a888'; g.strokeRect(X + 1, Y + 1, w - 2, h - 2); cols(X + 2, Y + 3, w - 4, h - 6, Math.max(3, d.w * 2)); }
      if (d.k === 'shop') { g.fillStyle = '#8a3a20'; for (var i = 0; i < d.w; i++) g.fillRect(X + i * P + 3, Y + h - 6, P - 6, 6); }
    } else if (d.k === 'amph') {
      var cx = d.x * P, cy = d.y * P;
      g.fillStyle = '#d9cdb2'; g.beginPath(); g.ellipse(cx, cy, d.rx * P, d.ry * P, 0, 0, 7); g.fill();
      g.strokeStyle = '#9c8c6c'; g.lineWidth = 2; for (var r = 0; r < 4; r++) { g.beginPath(); g.ellipse(cx, cy, (d.rx - r * 0.7) * P, (d.ry - r * 0.7) * P, 0, 0, 7); g.stroke(); }
      g.fillStyle = '#e2c98f'; g.beginPath(); g.ellipse(cx, cy, (d.rx - 3) * P, (d.ry - 3) * P, 0, 0, 7); g.fill();
      g.fillStyle = '#7a6a50'; for (var a = 0; a < 6.28; a += 0.16) g.fillRect(cx + Math.cos(a) * (d.rx - 0.2) * P - 2, cy + Math.sin(a) * (d.ry - 0.2) * P - 2, 4, 4);
    } else if (d.k === 'circus') {
      g.fillStyle = 'rgba(120,100,70,.25)'; for (var x = 0; x < d.w; x++) { g.fillRect((d.x + x) * P, d.y * P + 4, P - 2, 3); g.fillRect((d.x + x) * P, (d.y + d.h) * P - 7, P - 2, 3); }
      g.fillStyle = '#efe8d8'; g.fillRect(37 * P + 4, 56 * P + 4, 19 * P - 8, P - 8); g.fillStyle = '#c9973a'; [37, 55].forEach(function (mx) { g.beginPath(); g.arc((mx + 0.5) * P, 56.5 * P, P * 0.45, 0, 7); g.fill(); });
      g.fillStyle = '#b05a3a'; g.fillRect(46 * P, 56 * P + 2, P, P - 4); // an obelisk
    } else if (d.k === 'pantheon') {
      var px = d.x * P, py = d.y * P; g.fillStyle = '#cfc6b2'; g.beginPath(); g.arc(px, py, d.r * P, 0, 7); g.fill();
      g.strokeStyle = '#a99c80'; g.lineWidth = 2; for (var rr = 0.6; rr < d.r; rr += 0.6) { g.beginPath(); g.arc(px, py, rr * P, 0, 7); g.stroke(); }
      g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(px, py, P * 0.35, 0, 7); g.fill(); // the oculus
      g.fillStyle = '#efe8d8'; g.fillRect(25 * P, 17 * P, 3 * P, 2 * P); cols(25 * P + 2, 17 * P + 4, 3 * P - 4, 2 * P - 8, 6);
    } else if (d.k === 'baths') {
      var bx = d.x * P, by = d.y * P; g.fillStyle = '#d6c7aa'; g.fillRect(bx, by, d.w * P, d.h * P); g.fillStyle = '#5fa3c9'; g.fillRect(bx + P * 2, by + P * 2, (d.w - 4) * P, (d.h - 4) * P); g.strokeStyle = '#a99c80'; g.lineWidth = 2; g.strokeRect(bx + 2, by + 2, d.w * P - 4, d.h * P - 4);
    } else if (d.k === 'stoa') {
      var sx0 = d.x * P, sy0 = d.y * P; g.fillStyle = '#efe8d8'; g.fillRect(sx0, sy0, d.w * P, d.h * P); g.fillStyle = '#c06a45'; g.fillRect(sx0 + P, sy0, P, d.h * P);
      g.fillStyle = '#fff'; for (var i2 = 0; i2 < d.h * 2; i2++) { g.beginPath(); g.arc(sx0 + 4, sy0 + (i2 + 0.5) * P / 2, 2.5, 0, 7); g.fill(); }
    } else if (d.k === 'parthenon') {
      var tx = (d.x - 4) * P, ty = (d.y - 1.6) * P, tw = 8 * P, th = 3.6 * P;
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(tx + 4, ty + 4, tw, th); g.fillStyle = '#f2ece0'; g.fillRect(tx, ty, tw, th);
      g.fillStyle = '#c9bfa8'; g.fillRect(tx + P * 0.7, ty + P * 0.7, tw - P * 1.4, th - P * 1.4); cols(tx + 2, ty + 4, tw - 4, th - 8, 17);
      g.fillStyle = '#e8dfcf'; g.fillRect(36 * P, 42 * P, 3 * P, 3 * P); // the gateway (Propylaia)
    } else if (d.k === 'fountain') {
      var fx = d.x * P, fy = d.y * P; g.fillStyle = '#e8e0cc'; g.fillRect(fx, fy, d.w * P, d.h * P); g.fillStyle = '#5fa3c9'; g.fillRect(fx + 6, fy + 6, d.w * P - 12, d.h * P - 12);
    } else if (d.k === 'tower') {
      var ox = d.x * P, oy = d.y * P; g.fillStyle = '#efe8d8'; g.beginPath(); for (var j = 0; j < 8; j++) { var aa = j * Math.PI / 4 + Math.PI / 8; g.lineTo(ox + Math.cos(aa) * P * 1.25, oy + Math.sin(aa) * P * 1.25); } g.closePath(); g.fill(); g.strokeStyle = '#a99c80'; g.stroke();
    } else if (d.k === 'theatre') {
      var qx = d.x * P, qy = d.y * P; g.fillStyle = '#e4dccb'; g.beginPath(); g.arc(qx, qy, d.r * P, 0, Math.PI); g.fill();
      g.strokeStyle = '#b8a888'; g.lineWidth = 1.5; for (var rq = 1.4; rq < d.r; rq += 0.45) { g.beginPath(); g.arc(qx, qy, rq * P, 0.05, Math.PI - 0.05); g.stroke(); }
      g.fillStyle = '#d8c9a8'; g.beginPath(); g.arc(qx, qy, 1.2 * P, 0, Math.PI); g.fill();
    } else if (d.k === 'stadium') {
      g.fillStyle = 'rgba(120,100,70,.25)'; for (var xx = 0; xx < d.w; xx++) { g.fillRect((d.x + xx) * P, d.y * P + 4, P - 2, 3); g.fillRect((d.x + xx) * P, (d.y + d.h) * P - 7, P - 2, 3); }
      g.fillStyle = '#efe8d8'; g.fillRect(78 * P + 3, 53 * P + 3, 8 * P - 6, 2 * P - 6); g.fillStyle = '#c9973a'; [78, 85].forEach(function (mx) { g.beginPath(); g.arc((mx + 0.5) * P, 54 * P, P * 0.4, 0, 7); g.fill(); });
    }
  }
  function drawMini(m) {
    var cvs = D.createElement('canvas'); cvs.width = m.w; cvs.height = m.h; var g = cvs.getContext('2d'), img = g.createImageData(m.w, m.h);
    var COL = { 0: [214, 200, 168], 1: [170, 90, 60], 2: [236, 228, 210], 3: [130, 165, 90], 4: [63, 127, 176], 5: [150, 130, 100], 6: [240, 236, 224], 7: [60, 100, 45], 8: [220, 196, 142], 9: [190, 178, 150], 10: [170, 155, 125], 11: [200, 184, 150] };
    for (var i = 0; i < m.w * m.h; i++) { var col = COL[m.t[i]] || [0, 0, 0]; img.data[i * 4] = col[0]; img.data[i * 4 + 1] = col[1]; img.data[i * 4 + 2] = col[2]; img.data[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0); return cvs;
  }

  // ---------- flow fields (for the watch, and for the thief to run from you) ----------
  function bfs(m, tx, ty) {
    var w = m.w, h = m.h, d = new Int16Array(w * h).fill(-1), q = new Int32Array(w * h), qh = 0, qt = 0, s = Math.floor(ty) * w + Math.floor(tx);
    if (s < 0 || s >= w * h) return d;
    d[s] = 0; q[qt++] = s;
    while (qh < qt) { var i = q[qh++], x = i % w, y = (i - x) / w; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) { var nx = x + o[0], ny = y + o[1]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) return; var j = ny * w + nx; if (d[j] >= 0 || !m.walk(nx, ny)) return; d[j] = d[i] + 1; q[qt++] = j; }); }
    return d;
  }
  function flowStep(m, d, x, y, away) { // the best neighbouring cell centre
    var cx = Math.floor(x), cy = Math.floor(y), best = null, bv = away ? -1 : 1e9;
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (o) {
      var nx = cx + o[0], ny = cy + o[1]; if (!m.walk(nx, ny)) return; if (o[0] && o[1] && (!m.walk(cx + o[0], cy) || !m.walk(cx, cy + o[1]))) return;
      var v = d[ny * m.w + nx]; if (v < 0) return; v += (o[0] && o[1]) ? 0.4 : 0; if (away) v += Math.random() * 0.8;
      if (away ? v > bv : v < bv) { bv = v; best = [nx + 0.5, ny + 0.5]; }
    });
    return best;
  }

  // ---------- movement with walls ----------
  function solidAt(m, x, y, r) { return !m.walk(x - r, y - r) || !m.walk(x + r, y - r) || !m.walk(x - r, y + r) || !m.walk(x + r, y + r); }
  function move(o, dx, dy, r) { // returns true if blocked
    var m = G.m, hit = false;
    if (!solidAt(m, o.x + dx, o.y, r)) o.x += dx; else hit = true;
    if (!solidAt(m, o.x, o.y + dy, r)) o.y += dy; else hit = true;
    return hit;
  }

  // ---------- setting up a city ----------
  function startCity(city) {
    st.city = city; save();
    var m = CD[city]();
    G = { city: city, m: m, mapImg: null, mini: drawMini(m), t: 0, cars: [], peds: [], guards: [], items: [], fx: [], bubbles: [], wanted: 0, lostT: 0, seen: {}, flowT: 0, flow: null, mission: null, msgQ: [], camX: 0, camY: 0, zoom: 1 };
    G.mapImg = drawMap(m);
    var s = m.spots.start; G.p = { x: s[0], y: s[1], a: Math.PI / 2, car: null, walk: 0, item: null };
    m.spots.chariots.forEach(function (q) { G.cars.push(makeCar(q[0], q[1], 'chariot')); });
    for (var i = 0; i < m.spots.carts; i++) { var cs = randomRoad(); G.cars.push(makeCar(cs[0], cs[1], 'cart', true)); }
    for (i = 0; i < 46; i++) { var ps = randomRoad(true); G.peds.push(makePed(ps[0], ps[1])); }
    G.camX = G.p.x; G.camY = G.p.y;
    hud(); patronMarker();
  }
  function randomRoad(anyFloor) { var m = G.m; for (var i = 0; i < 2000; i++) { var x = Math.floor(rnd(1, m.w - 1)), y = Math.floor(rnd(1, m.h - 1)), t = m.get(x, y); if (t === 0 || (anyFloor && (t === 2 || t === 11))) return [x + 0.5, y + 0.5]; } return [m.spots.start[0], m.spots.start[1]]; }
  var TUNIC = ['#d9c9a0', '#b04a3a', '#3f6fa8', '#8a6a3a', '#e8e0d0', '#6b8a3a', '#a85a8a', '#c9973a'];
  function makePed(x, y) { return { x: x, y: y, a: rnd(0, 6.28), sp: rnd(0.9, 1.5), t: rnd(0, 3), col: pick(TUNIC), hair: pick(['#3a2516', '#1d1d1d', '#6b4a2a', '#9a9a9a']), down: 0, dodge: 0, said: 0, step: 0 }; }
  function makeCar(x, y, kind, ai) { return { x: x, y: y, a: kind === 'chariot' ? -Math.PI / 2 : rnd(0, 6.28), v: 0, kind: kind, ai: !!ai, r: kind === 'chariot' ? 0.42 : 0.5, vmax: kind === 'chariot' ? 10.5 : 2.2, col: kind === 'chariot' ? '#8a5a2b' : '#7a5a34', t: rnd(0, 3) }; }

  // ---------- missions ----------
  function patronMarker() { G.patron = G.m.spots.patron; }
  function missionIdx() { var d = st.done[G.city] || []; for (var i = 0; i < G.m.missions.length; i++) if (d.indexOf(G.m.missions[i].id) < 0) return i; return -1; }
  function offerMission() {
    var i = missionIdx(), list = G.m.missions, done = st.done[G.city] || [];
    var opts = list.map(function (M, j) { var ok = j === i || done.indexOf(M.id) >= 0 || (i < 0); return '<button class="ct-mb" data-j="' + j + '"' + (ok ? '' : ' disabled') + '><b>' + (j + 1) + '. ' + esc(M.title) + '</b>' + (done.indexOf(M.id) >= 0 ? ' ✓' : ok ? '' : ' 🔒') + '</button>'; }).join('');
    var who = G.city === 'rome' ? 'Gaius the merchant' : 'Nikias the merchant';
    var o = ov('<h2>' + who + '</h2><p class="ct-small">' + (i < 0 ? 'You have done every job. Play any of them again, or explore the city.' : 'Choose a job. Finish one to unlock the next.') + '</p><div class="ct-ms">' + opts + '</div><button class="ct-btn" id="ct-close">Explore the city</button>');
    o.querySelectorAll('.ct-mb').forEach(function (b) { b.addEventListener('click', function () { brief(+b.dataset.j); }); });
    $('#ct-close').addEventListener('click', function () { closeOv(); G.patronCool = 2.5; });
  }
  function brief(j) {
    var M = G.m.missions[j], gk = G.m.lang === 'g';
    var o = ov('<p class="ct-small">' + esc(G.m.name) + ' · job ' + (j + 1) + ' of ' + G.m.missions.length + '</p><h2>' + esc(M.title) + '</h2><p>' + esc(M.brief) + '</p>' +
      (st.words ? '<div class="ct-words">' + M.words.map(function (w) { return '<span><b class="' + (gk ? 'gk' : 'la') + '">' + esc(w[0]) + '</b>' + (gk && TR(w[0]) ? ' <i>' + esc(TR(w[0])) + '</i>' : '') + ' = ' + esc(w[1]) + '</span>'; }).join('') + '</div>' : '') +
      (M.time ? '<p class="ct-small">Time: ' + Math.floor(M.time / 60) + ':' + ('0' + M.time % 60).slice(-2) + '</p>' : '') +
      '<button class="ct-btn pri" id="ct-go">Start</button> <button class="ct-btn" id="ct-back">Back</button>');
    $('#ct-go').addEventListener('click', function () { closeOv(); startMission(j); });
    $('#ct-back').addEventListener('click', offerMission);
  }
  function startMission(j) {
    var M = G.m.missions[j];
    G.mission = { j: j, M: M, s: 0, time: M.time || 0, left: M.time || 0 };
    if (st.words) M.words.forEach(function (w) { logWord(w[0], w[1]); });
    beginStep();
  }
  function beginStep() {
    var Mi = G.mission, S = Mi.M.steps[Mi.s];
    Mi.target = null;
    if (S.wanted) setWanted(Math.max(G.wanted, S.wanted));
    if (S.t === 'go' || S.t === 'ride' || S.t === 'escape') Mi.target = spot(S.at);
    if (S.t === 'escape') setWanted(S.wanted);
    if (S.t === 'catch') { var f = nearestWalk(G.m, G.p.x + 3, G.p.y + 2); G.thief = makePed(f[0], f[1]); G.thief.thief = 1; G.thief.col = '#3a3a3a'; G.thief.stam = 22; G.peds.push(G.thief); }
    if (S.t === 'collect') { G.items = G.m.spots.scrolls.map(function (q) { var w = nearestWalk(G.m, q[0], q[1]); return { x: w[0], y: w[1], k: 'scroll' }; }); }
    if (S.t === 'race') startRace();
    note(S.text);
  }
  function stepDone() {
    var Mi = G.mission; Mi.s++;
    if (Mi.s >= Mi.M.steps.length) return missionWon();
    beginStep(); beep('ok');
  }
  function missionWon() {
    var Mi = G.mission, M = Mi.M, d = st.done[G.city] = st.done[G.city] || [];
    var first = d.indexOf(M.id) < 0; if (first) d.push(M.id);
    var pay = 50 + (Mi.left > 0 ? Math.round(Mi.left / 2) : 0); st.coins += pay; save();
    endMission(); setWanted(0); beep('win');
    var gk = G.m.lang === 'g', next = missionIdx();
    var o = ov('<h2>' + (gk ? 'Εὖ!' : 'Euge!') + ' <span class="ct-small">(' + (gk ? 'Well done!' : 'Well done!') + ')</span></h2><p>' + esc(M.title) + ' done. You earn ' + pay + ' ' + (gk ? 'drachmas' : 'denarii') + '.</p>' +
      (st.words ? '<div class="ct-words">' + M.words.map(function (w) { return '<span><b class="' + (gk ? 'gk' : 'la') + '">' + esc(w[0]) + '</b> = ' + esc(w[1]) + '</span>'; }).join('') + '</div>' : '') +
      (next >= 0 ? '<button class="ct-btn pri" id="ct-next">Next job</button> ' : '<p><b>You have finished every job in ' + esc(G.m.name) + '!</b> ' + (G.city === 'rome' ? 'Try Athens next.' : 'Try Rome next.') + '</p>') + '<button class="ct-btn" id="ct-close">Explore the city</button>');
    if ($('#ct-next')) $('#ct-next').addEventListener('click', function () { brief(next); });
    $('#ct-close').addEventListener('click', closeOv);
    hud();
  }
  function missionFailed(why) {
    var Mi = G.mission; if (!Mi) return; var j = Mi.j; endMission(); beep('bad');
    var o = ov('<h2>Job failed</h2><p>' + esc(why) + '</p><button class="ct-btn pri" id="ct-retry">Try again</button> <button class="ct-btn" id="ct-close">Explore the city</button>');
    $('#ct-retry').addEventListener('click', function () { closeOv(); if (G.p.car && G.p.car.race) leaveCar(); startMission(j); });
    $('#ct-close').addEventListener('click', closeOv);
  }
  function endMission() {
    var Mi = G.mission; G.mission = null; G.items = []; G.p.item = null;
    if (G.thief) { G.peds.splice(G.peds.indexOf(G.thief), 1); G.thief = null; }
    if (G.race) { G.cars = G.cars.filter(function (c) { return !c.rival; }); G.peds = G.peds.filter(function (p) { return !p.rival; }); if (G.p.car && G.p.car.race) { var s = spot(G.city === 'rome' ? 'stabulum2' : 'hippoi2'); G.p.car.race = false; } G.race = null; }
    note('');
  }
  function startRace() {
    var R = G.m.spots.race; G.race = { R: R, lap: 0, cp: 1, t: 0, go: 3, done: [] };
    if (G.p.car) leaveCar();
    var g0 = R.grid[0];
    if (R.vehicle) { var car = makeCar(g0[0], g0[1], 'chariot'); car.a = 0; car.race = true; car.col = R.you[1]; G.cars.push(car); enterCar(car, true); }
    else { G.p.x = g0[0]; G.p.y = g0[1]; G.p.a = 0; }
    R.rivals.forEach(function (rv, i) {
      var q = R.grid[i + 1], o;
      if (R.vehicle) { o = makeCar(q[0], q[1], 'chariot', false); o.a = 0; o.rival = rv; o.col = rv[1]; o.cp = 1; o.lap = 0; o.skill = 0.84 + i * 0.045; G.cars.push(o); }
      else { o = makePed(q[0], q[1]); o.rival = rv; o.col = rv[1]; o.cp = 1; o.lap = 0; o.skill = 0.86 + i * 0.04; o.a = 0; G.peds.push(o); }
    });
  }

  // ---------- wanted level ----------
  function setWanted(n) {
    n = clamp(n, 0, 3); if (n === G.wanted) return;
    if (n > G.wanted) { for (var i = G.guards.length; i < n + 1; i++) spawnGuard(); }
    G.wanted = n; G.lostT = 0;
    if (!n) G.guards.forEach(function (g) { g.leave = 1; });
    hud();
  }
  function spawnGuard() {
    var m = G.m, p = G.p; for (var k = 0; k < 300; k++) { var a = rnd(0, 6.28), r = rnd(11, 16), x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r; if (m.walk(x, y) && m.get(x, y) !== 8) { G.guards.push({ x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, a: 0, step: 0, leave: 0 }); return; } }
  }

  // ---------- the player and cars ----------
  function enterCar(car, silent) { G.p.car = car; car.ai = false; car.v = 0; G.p.x = car.x; G.p.y = car.y; if (!silent) beep('ok'); hud(); }
  function leaveCar() { var car = G.p.car; if (!car) return; G.p.car = null; var a = car.a + Math.PI / 2, x = car.x + Math.cos(a) * 0.9, y = car.y + Math.sin(a) * 0.9; if (!G.m.walk(x, y)) { a += Math.PI; x = car.x + Math.cos(a) * 0.9; y = car.y + Math.sin(a) * 0.9; } if (G.m.walk(x, y)) { G.p.x = x; G.p.y = y; } car.v = 0; hud(); }
  function nearCar() { var p = G.p, best = null, bd = 1.6; G.cars.forEach(function (c) { if (c.kind !== 'chariot' || c.rival) return; var d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; best = c; } }); return best; }
  function action() { if (!G || paused) return; if (G.race && G.race.go > 0) return; if (G.p.car) { if (G.p.car.race && G.race) return; leaveCar(); } else { var c = nearCar(); if (c) enterCar(c); } }

  var keys = {}, stick = { x: 0, y: 0, on: false };
  function inputVec() { var x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), y = (keys.down ? 1 : 0) - (keys.up ? 1 : 0); if (stick.on) { x = stick.x; y = stick.y; } return { x: x, y: y }; }

  function stepPlayer(dt) {
    var p = G.p, m = G.m, iv = inputVec();
    if (G.race && G.race.go > 0) return;
    if (p.car) {
      var car = p.car, thr, steer;
      if (stick.on) { var mag = Math.min(1, Math.hypot(iv.x, iv.y)); if (mag > 0.2) { var want = Math.atan2(iv.y, iv.x), da = angDiff(car.a, want); steer = clamp(da * 2.2, -1, 1); thr = mag * (Math.abs(da) > 2.2 ? -0.6 : 1); } else { steer = 0; thr = 0; } }
      else { steer = iv.x; thr = -iv.y; }
      driveCar(car, thr, steer, keys.run, dt);
      p.x = car.x; p.y = car.y; p.a = car.a;
    } else {
      var run = keys.run || (stick.on && Math.hypot(iv.x, iv.y) > 0.92), sp = run ? 5 : 3, l = Math.hypot(iv.x, iv.y);
      if (l > 0.1) { var nx = iv.x / Math.max(1, l), ny = iv.y / Math.max(1, l); move(p, nx * sp * dt, ny * sp * dt, 0.28); p.a = Math.atan2(ny, nx); p.walk += dt * sp * 2.5; }
    }
  }
  function driveCar(car, thr, steer, brake, dt) {
    var m = G.m, ground = m.get(car.x, car.y), slow = ground === 3 ? 0.55 : ground === 8 ? 0.95 : 1, vmax = car.vmax * slow;
    if (brake) car.v *= Math.pow(0.05, dt);
    if (thr > 0) car.v = Math.min(vmax * thr, car.v + 7 * dt * thr);
    else if (thr < 0) car.v = Math.max(-3, car.v + 9 * dt * thr);
    else car.v *= Math.pow(0.35, dt);
    if (car.v > vmax) car.v -= 8 * dt;
    var turn = 2.6 * steer * clamp(Math.abs(car.v) / 3, 0, 1) * (car.v < 0 ? -1 : 1) * (Math.abs(car.v) > 7 ? 0.8 : 1);
    car.a += turn * dt;
    var dx = Math.cos(car.a) * car.v * dt, dy = Math.sin(car.a) * car.v * dt;
    if (move(car, dx, dy, car.r)) { if (Math.abs(car.v) > 4) { bump(car.x, car.y); } car.v *= -0.25; }
    car.t += dt * Math.abs(car.v);
  }
  function bump(x, y) { if (!RM) G.shake = 0.15; for (var i = 0; i < 5; i++) G.fx.push({ x: x + rnd(-0.3, 0.3), y: y + rnd(-0.3, 0.3), vx: rnd(-2, 2), vy: rnd(-2, 2), life: 0.5, col: 'rgba(200,180,140,.8)' }); }

  // ---------- people ----------
  function stepPed(o, dt) {
    var m = G.m, p = G.p;
    if (o.down > 0) { o.down -= dt; return; }
    if (o.rival) return stepRunner(o, dt);
    if (o.thief) return stepThief(o, dt);
    // get out of the way of a fast chariot
    var car = p.car;
    if (car && Math.abs(car.v) > 3) {
      var d = Math.hypot(car.x - o.x, car.y - o.y);
      if (d < 3 && o.dodge <= 0) { var ax = Math.cos(car.a), ay = Math.sin(car.a), side = ((o.x - car.x) * ay - (o.y - car.y) * ax) > 0 ? 1 : -1; o.dodge = 0.6; o.da = Math.atan2(-ax * side, ay * side); }
      if (d < car.r + 0.3 && Math.abs(car.v) > 4) { o.down = 2.5; G.fx.push({ star: 1, x: o.x, y: o.y, life: 2.5 }); if (!G.mission || G.mission.M.steps[G.mission.s].t !== 'race') setWanted(Math.min(3, G.wanted + 1)); beep('bad'); say(G.m.lang === 'g' ? ['Βλέπετε!', 'Watch out!'] : ['Cave!', 'Watch out!'], o); return; }
    }
    if (o.dodge > 0) { o.dodge -= dt; move(o, Math.cos(o.da) * 4 * dt, Math.sin(o.da) * 4 * dt, 0.25); o.step += dt * 10; return; }
    o.t -= dt;
    var dx = Math.cos(o.a) * o.sp * dt, dy = Math.sin(o.a) * o.sp * dt, t = m.get(o.x + Math.cos(o.a) * 0.5, o.y + Math.sin(o.a) * 0.5);
    if (o.t <= 0 || move(o, dx, dy, 0.25) || t === 8) { o.t = rnd(2, 6); var dirs = [0, Math.PI / 2, Math.PI, -Math.PI / 2].filter(function (a) { var tt = m.get(o.x + Math.cos(a), o.y + Math.sin(a)); return m.walk(o.x + Math.cos(a), o.y + Math.sin(a)) && tt !== 8; }); if (dirs.length) o.a = pick(dirs) + rnd(-0.2, 0.2); }
    o.step += dt * o.sp * 2.5;
    // say hello to someone on foot
    if (!p.car && !o.said && Math.hypot(p.x - o.x, p.y - o.y) < 1.6 && G.t - (G.lastSay || 0) > 2.5) { o.said = 1; say(pick(G.m.lines), o); }
  }
  function stepThief(o, dt) {
    var p = G.p, d = Math.hypot(p.x - o.x, p.y - o.y), sp = o.stam > 0 ? 4.6 : 2.6; o.stam -= dt;
    if (d < 0.6 && !p.car) { caught(); return; }
    if (d < 0.8 && p.car && Math.abs(p.car.v) < 5) { caught(); return; }
    if (!o.goal || Math.hypot(o.goal[0] - o.x, o.goal[1] - o.y) < 0.15) { o.goal = flowStep(G.m, G.fromP || bfs(G.m, p.x, p.y), o.x, o.y, true); }
    if (o.goal) { var a = Math.atan2(o.goal[1] - o.y, o.goal[0] - o.x); o.a = a; move(o, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, 0.25); o.step += dt * sp * 2.5; }
    function caught() { var gk = G.m.lang === 'g'; o.down = 99; G.fx.push({ star: 1, x: o.x, y: o.y, life: 2 }); logWord(gk ? 'κλέπτης' : 'fur', 'thief'); stepDone(); }
  }
  function stepRunner(o, dt) { // a foot-race rival
    var R = G.race; if (!R || R.go > 0) return; var pts = R.R.pts, q = pts[o.cp], a = Math.atan2(q[1] - o.y, q[0] - o.x), sp = 5 * o.skill * (1 + 0.04 * Math.sin(G.t * 1.3 + o.skill * 9));
    o.a = a; move(o, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, 0.25); o.step += dt * sp * 2.5;
    if (Math.hypot(q[0] - o.x, q[1] - o.y) < 1.1) advanceCp(o);
  }
  function advanceCp(o) { var R = G.race, n = R.R.pts.length; o.cp = (o.cp + 1) % n; if (o.cp === 1) { o.lap++; if (o.lap >= R.R.laps && R.done.indexOf(o) < 0) R.done.push(o); } }

  function stepCar(car, dt) {
    if (car === G.p.car) return;
    if (car.rival) { var R = G.race; if (!R || R.go > 0) return; var pts = R.R.pts, q = pts[car.cp], want = Math.atan2(q[1] - car.y, q[0] - car.x), da = angDiff(car.a, want); driveCar(car, car.skill * (Math.abs(da) > 0.9 ? 0.55 : 1), clamp(da * 2.5, -1, 1), false, dt); if (Math.hypot(q[0] - car.x, q[1] - car.y) < 1.6) advanceCp(car); return; }
    if (!car.ai) { car.v *= Math.pow(0.2, dt); return; }
    // ox carts plod along the roads
    var m = G.m, ahead = m.get(car.x + Math.cos(car.a) * 0.9, car.y + Math.sin(car.a) * 0.9);
    car.t2 = (car.t2 || 0) - dt;
    if (ahead !== 0 && ahead !== 5 || car.t2 <= 0) { car.t2 = rnd(3, 8); var dirs = [0, Math.PI / 2, Math.PI, -Math.PI / 2].filter(function (a) { var tt = m.get(car.x + Math.cos(a) * 1.2, car.y + Math.sin(a) * 1.2); return tt === 0 || tt === 5; }); if (dirs.length) car.a = pick(dirs); car.x = Math.floor(car.x) + 0.5; car.y = Math.floor(car.y) + 0.5; }
    var blocked = move(car, Math.cos(car.a) * 1.4 * dt, Math.sin(car.a) * 1.4 * dt, 0.4); car.t += dt * 1.4; if (blocked) car.t2 = 0;
  }
  function stepGuard(g, dt) {
    var p = G.p, m = G.m;
    if (g.leave) { g.leave += dt; return; }
    var d = Math.hypot(p.x - g.x, p.y - g.y), sp = [3.6, 4.1, 4.6, 5.0][G.wanted] * (G.m.get(g.x, g.y) === 3 ? 0.8 : 1);
    if (d < 0.6 && (!p.car || Math.abs(p.car.v) < 1.5)) return arrested();
    if (!g.goal || Math.hypot(g.goal[0] - g.x, g.goal[1] - g.y) < 0.15) g.goal = G.toP ? flowStep(m, G.toP, g.x, g.y, false) : null;
    if (d < 1.2) g.goal = [p.x, p.y];
    if (g.goal) { var a = Math.atan2(g.goal[1] - g.y, g.goal[0] - g.x); g.a = a; move(g, Math.cos(a) * sp * dt, Math.sin(a) * sp * dt, 0.25); g.step += dt * sp * 2.5; }
  }
  function arrested() {
    var gk = G.m.lang === 'g', fine = Math.min(st.coins, 20); st.coins -= fine; save();
    setWanted(0); G.guards = [];
    if (G.p.car) leaveCar();
    var s = G.m.spots.start; G.p.x = s[0] + 1.2; G.p.y = s[1] + 1;
    if (G.mission) missionFailed('The ' + (gk ? 'guards' : 'watch') + ' caught you' + (fine ? ' and fined you ' + fine + ' ' + (gk ? 'drachmas' : 'denarii') : '') + '.');
    else { var o = ov('<h2>Caught!</h2><p>The ' + (gk ? 'guards' : 'watch') + ' caught you' + (fine ? ' and fined you ' + fine + ' ' + (gk ? 'drachmas' : 'denarii') : '') + '. Drive more carefully!</p><button class="ct-btn pri" id="ct-close">Carry on</button>'); $('#ct-close').addEventListener('click', closeOv); }
    hud();
  }

  // ---------- the main step ----------
  function step(dt) {
    var m = G.m, p = G.p;
    G.t += dt;
    // flow fields toward and away from the player, a few times a second
    G.flowT -= dt; if (G.flowT <= 0) { G.flowT = 0.35; if (G.guards.length || G.thief) { G.toP = bfs(m, p.x, p.y); G.fromP = G.toP; } }
    if (G.race) {
      var R = G.race; if (R.go > 0) { var b4 = Math.ceil(R.go); R.go -= dt; if (Math.ceil(R.go) !== b4) beep(R.go <= 0 ? 'win' : 'ok'); }
      else { R.t += dt; var me = p.car && p.car.race ? p.car : p; if (me.cp == null) { me.cp = 1; me.lap = 0; } var q = R.R.pts[me.cp]; if (Math.hypot(q[0] - me.x, q[1] - me.y) < (R.R.vehicle ? 1.8 : 1.2)) { advanceCp(me); beep('tick'); } if (R.done.indexOf(me) >= 0) { var place = R.done.indexOf(me) + 1; if (place === 1) { stepDone(); } else missionFailed('You came ' + ['', 'first', 'second', 'third', 'fourth'][place] + '. Only the winner gets the palm. Try again!'); } else if (R.done.length >= 1 && R.done.indexOf(me) < 0 && R.done.length >= 3) { missionFailed('You came last. Try again!'); } }
    }
    stepPlayer(dt);
    G.cars.forEach(function (c) { stepCar(c, dt); });
    // cars bump into each other
    for (var i = 0; i < G.cars.length; i++) for (var j = i + 1; j < G.cars.length; j++) { var A = G.cars[i], B = G.cars[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), r = A.r + B.r; if (d < r && d > 0.001) { var push = (r - d) / 2, nx = dx / d, ny = dy / d; move(A, -nx * push, -ny * push, A.r); move(B, nx * push, ny * push, B.r); if (Math.abs(A.v - B.v) > 5 && (A === p.car || B === p.car)) bump(A.x + dx / 2, A.y + dy / 2); A.v *= 0.8; B.v *= 0.8; } }
    if (p.car) { p.x = p.car.x; p.y = p.car.y; }
    G.peds.forEach(function (o) { stepPed(o, dt); });
    G.guards.forEach(function (g) { stepGuard(g, dt); }); G.guards = G.guards.filter(function (g) { return !g.leave || g.leave < 4; });
    // wanted level wears off when no guard can see you
    if (G.wanted > 0) {
      var close = G.guards.some(function (g) { return !g.leave && Math.hypot(g.x - p.x, g.y - p.y) < 10; });
      if (close) G.lostT = 0; else { G.lostT += dt; if (G.lostT > 6) { setWanted(G.wanted - 1); G.lostT = 0; G.guards.pop(); } }
    }
    // the mission
    var Mi = G.mission;
    if (Mi) {
      if (Mi.time) { Mi.left -= dt; if (Mi.left <= 0) { missionFailed('Out of time.'); return; } }
      var S = Mi.M.steps[Mi.s], tg = Mi.target;
      if (S.t === 'go' && tg && Math.hypot(tg[0] - p.x, tg[1] - p.y) < 1.4) { if (S.need === 'vehicle' && !p.car) note('You need a chariot for this. ' + S.text); else { if (S.item) { p.item = S.item; note(S.pick); } else if (Mi.s > 0 && Mi.M.steps[Mi.s - 1].item) p.item = null; stepDone(); } }
      else if (S.t === 'ride' && p.car && !p.car.race) stepDone();
      else if (S.t === 'escape' && tg && Math.hypot(tg[0] - p.x, tg[1] - p.y) < 1.4) { if (G.wanted > 0) note('Lose the ' + (G.m.lang === 'g' ? 'guards' : 'watch') + ' first! They stop chasing if they lose sight of you.'); else stepDone(); }
      else if (S.t === 'collect') { G.items = G.items.filter(function (it) { if (Math.hypot(it.x - p.x, it.y - p.y) < 0.9) { beep('tick'); var gk = G.m.lang === 'g'; logWord(gk ? 'βιβλίον' : 'liber', 'book, scroll'); return false; } return true; }); if (!G.items.length) stepDone(); else note(S.text + ' ' + (5 - G.items.length) + ' of 5.'); }
      else if (S.t === 'catch' && G.thief && !G.thief.down) { if (Math.hypot(G.thief.x - p.x, G.thief.y - p.y) > 40) missionFailed('The thief got away.'); }
    } else if (G.patron && !G.patronCool && Math.hypot(G.patron[0] - p.x, G.patron[1] - p.y) < 1.1 && !p.car) { offerMission(); G.patronCool = 1; }
    if (G.patronCool && Math.hypot(G.patron[0] - p.x, G.patron[1] - p.y) > 2) G.patronCool = 0;
    // landmarks: the first time you come near one, its name pops up
    m.lm.forEach(function (l) { if (!l.w || G.seen[l.id]) return; var s = spot(l.id); if (Math.hypot(s[0] - p.x, s[1] - p.y) < 3.5) { G.seen[l.id] = 1; say([l.w, l.e], null, true); } });
    G.fx.forEach(function (f) { f.life -= dt; if (f.vx) { f.x += f.vx * dt; f.y += f.vy * dt; } }); G.fx = G.fx.filter(function (f) { return f.life > 0; });
    G.bubbles.forEach(function (b) { b.life -= dt; }); G.bubbles = G.bubbles.filter(function (b) { return b.life > 0; });
    if (G.shake) G.shake = Math.max(0, G.shake - dt);
    // camera: zooms out a little at speed, as in the original game
    var spd = p.car ? Math.abs(p.car.v) : 0, wantZ = 1 - clamp(spd / 10.5, 0, 1) * 0.28; G.zoom += (wantZ - G.zoom) * Math.min(1, dt * 1.5);
    var la = p.car ? clamp(p.car.v, -3, 10) * 0.25 : 0;
    G.camX += (p.x + Math.cos(p.a) * la - G.camX) * Math.min(1, dt * 5); G.camY += (p.y + Math.sin(p.a) * la - G.camY) * Math.min(1, dt * 5);
    hudLive();
  }

  // ---------- drawing ----------
  function draw() {
    var m = G.m, p = G.p;
    var base = Math.max(22, Math.min(40, Math.min(Wd, Ht) / 13)); T = base * G.zoom;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = '#5a4a38'; c.fillRect(0, 0, Wd, Ht);
    var sh = G.shake ? rnd(-3, 3) : 0;
    var ox = Wd / 2 - G.camX * T + sh, oy = Ht / 2 - G.camY * T + sh;
    c.imageSmoothingEnabled = true;
    c.drawImage(G.mapImg, ox, oy, m.w * T, m.h * T);
    c.save(); c.translate(ox, oy);
    // markers
    var Mi = G.mission;
    if (!Mi && G.patron) marker(G.patron[0], G.patron[1], '#e8b830', '!');
    if (Mi && Mi.target) marker(Mi.target[0], Mi.target[1], '#e8b830', '★');
    G.items.forEach(function (it) { scroll(it.x, it.y); });
    if (G.race) drawRaceLine();
    G.cars.forEach(function (car) { drawCar(car); });
    G.peds.forEach(function (o) { drawPerson(o.x, o.y, o.a, o.col, o.hair, o.step, o.down > 0, o.thief ? 'thief' : null); });
    G.guards.forEach(function (g) { drawPerson(g.x, g.y, g.a, m.guards.col, '#3a2516', g.step, false, 'guard'); });
    if (!p.car) drawPerson(p.x, p.y, p.a, '#2e8b57', '#3a2516', p.walk, false, 'you');
    if (p.item && !p.car) { c.fillStyle = '#b5683a'; c.beginPath(); c.ellipse(p.x * T, (p.y - 0.55) * T, T * 0.12, T * 0.18, 0, 0, 7); c.fill(); }
    G.fx.forEach(function (f) { if (f.star) { c.fillStyle = '#ffde4a'; c.font = Math.round(T * 0.45) + 'px system-ui'; c.textAlign = 'center'; c.fillText('★ ★', f.x * T, (f.y - 0.5) * T + Math.sin(G.t * 8) * 2); } else { c.globalAlpha = clamp(f.life * 2, 0, 1); c.fillStyle = f.col; c.fillRect(f.x * T - 3, f.y * T - 3, 6, 6); c.globalAlpha = 1; } });
    G.bubbles.forEach(function (b) { bubble(b); });
    c.restore();
    // arrow to the target when it is off screen
    if (Mi) { var tg = Mi.target || (G.thief && !G.thief.down ? [G.thief.x, G.thief.y] : null) || (G.items.length ? nearestItem() : null) || (G.race ? G.race.R.pts[(p.car && p.car.race ? p.car : p).cp || 1] : null); if (tg) edgeArrow(tg[0] * T + ox, tg[1] * T + oy); }
    drawMinimap();
    if (G.race && G.race.go > 0) { c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(Wd / 2 - 60, Ht / 2 - 60, 120, 120); c.fillStyle = '#fff'; c.font = 'bold 64px Georgia,serif'; c.textAlign = 'center'; c.fillText(String(Math.ceil(G.race.go)), Wd / 2, Ht / 2 + 22); }
  }
  function nearestItem() { var p = G.p, b = null, bd = 1e9; G.items.forEach(function (it) { var d = Math.hypot(it.x - p.x, it.y - p.y); if (d < bd) { bd = d; b = [it.x, it.y]; } }); return b; }
  function marker(x, y, col, ch) { var r = T * (0.55 + 0.08 * Math.sin(G.t * 5)); c.fillStyle = 'rgba(232,184,48,.25)'; c.beginPath(); c.arc(x * T, y * T, r * 1.5, 0, 7); c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(x * T, y * T, r, 0, 7); c.stroke(); c.fillStyle = col; c.font = 'bold ' + Math.round(T * 0.6) + 'px system-ui'; c.textAlign = 'center'; c.fillText(ch, x * T, y * T + T * 0.22); }
  function scroll(x, y) { var X = x * T, Y = y * T + Math.sin(G.t * 4 + x) * 2; c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(X, Y + T * 0.3, T * 0.3, T * 0.1, 0, 0, 7); c.fill(); c.fillStyle = '#f2e6c4'; c.fillRect(X - T * 0.25, Y - T * 0.12, T * 0.5, T * 0.24); c.fillStyle = '#8a5a2b'; c.fillRect(X - T * 0.3, Y - T * 0.16, T * 0.08, T * 0.32); c.fillRect(X + T * 0.22, Y - T * 0.16, T * 0.08, T * 0.32); }
  function drawRaceLine() { var q = G.race.R.pts[0]; c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(q[0] * T - 2, (q[1] - 2) * T, 4, T * 4); }
  function drawPerson(x, y, a, col, hair, stp, down, kind) {
    var X = x * T, Y = y * T, s = T * 1.35;
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(X + 2, Y + 3, s * 0.26, s * 0.2, 0, 0, 7); c.fill();
    c.save(); c.translate(X, Y); c.rotate(a);
    if (down) { c.globalAlpha = 0.85; c.scale(1.2, 0.8); }
    var sw = Math.sin(stp) * s * 0.12;
    c.fillStyle = '#c99a72'; c.beginPath(); c.arc(s * 0.02 + sw, -s * 0.2, s * 0.07, 0, 7); c.arc(s * 0.02 - sw, s * 0.2, s * 0.07, 0, 7); c.fill(); // hands
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, s * 0.17, s * 0.25, 0, 0, 7); c.fill();
    c.fillStyle = kind === 'guard' ? '#9a9aa0' : hair; c.beginPath(); c.arc(0, 0, s * 0.13, 0, 7); c.fill();
    if (kind === 'guard') { c.fillStyle = G.m.guards.col; c.fillRect(-s * 0.15, -s * 0.03, s * 0.3, s * 0.06); }
    if (kind === 'you') { c.strokeStyle = '#ffde4a'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s * 0.3, 0, 7); c.stroke(); }
    if (kind === 'thief') { c.fillStyle = '#ffde4a'; c.beginPath(); c.arc(-s * 0.18, 0, s * 0.08, 0, 7); c.fill(); }
    c.restore();
  }
  function drawCar(car) {
    var X = car.x * T, Y = car.y * T, s = T * 1.25;
    c.save(); c.translate(X, Y); c.rotate(car.a);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-s * 0.55 + 3, -s * 0.38 + 3, s * 1.5, s * 0.76);
    var leg = Math.sin(car.t * 3) * s * 0.06;
    if (car.kind === 'chariot') {
      // two horses ahead, the car behind
      [-0.17, 0.17].forEach(function (o, i) { c.fillStyle = i ? '#6b4a2a' : '#8a5a34'; c.beginPath(); c.ellipse(s * 0.55 + (i ? leg : -leg), o * s, s * 0.32, s * 0.12, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(s * 0.88 + (i ? leg : -leg), o * s, s * 0.1, s * 0.07, 0, 0, 7); c.fill(); });
      c.strokeStyle = '#3a2516'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 0.35, 0); c.stroke();
      c.fillStyle = '#3a2516'; c.fillRect(-s * 0.3, -s * 0.36, s * 0.16, s * 0.08); c.fillRect(-s * 0.3, s * 0.28, s * 0.16, s * 0.08); // wheels
      c.fillStyle = car.col; c.beginPath(); c.moveTo(-s * 0.05, -s * 0.28); c.quadraticCurveTo(s * 0.12, 0, -s * 0.05, s * 0.28); c.lineTo(-s * 0.4, s * 0.28); c.lineTo(-s * 0.4, -s * 0.28); c.closePath(); c.fill();
      var who = car === G.p.car || car.rival; if (who) { c.fillStyle = car === G.p.car ? '#2e8b57' : car.col; c.beginPath(); c.arc(-s * 0.2, 0, s * 0.15, 0, 7); c.fill(); c.fillStyle = '#3a2516'; c.beginPath(); c.arc(-s * 0.2, 0, s * 0.1, 0, 7); c.fill(); }
      if (car === G.p.car) { c.strokeStyle = '#ffde4a'; c.lineWidth = 2; c.beginPath(); c.arc(-s * 0.2, 0, s * 0.22, 0, 7); c.stroke(); }
    } else {
      c.fillStyle = '#e8e0d0'; c.beginPath(); c.ellipse(s * 0.6, 0, s * 0.3, s * 0.16, 0, 0, 7); c.fill(); c.fillStyle = '#d0c8b8'; c.beginPath(); c.ellipse(s * 0.92, 0, s * 0.1, s * 0.09, 0, 0, 7); c.fill();
      c.fillStyle = car.col; c.fillRect(-s * 0.5, -s * 0.32, s * 0.8, s * 0.64); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-s * 0.45, -s * 0.05, s * 0.7, s * 0.1);
      c.fillStyle = '#b5683a'; c.beginPath(); c.arc(-s * 0.2, -s * 0.12, s * 0.1, 0, 7); c.arc(0, s * 0.12, s * 0.1, 0, 7); c.fill();
    }
    c.restore();
  }
  function bubble(b) {
    var X = b.x * T, Y = (b.y - 0.75) * T, gk = G.m.lang === 'g';
    c.font = Math.round(T * 0.5) + 'px "Gentium Book Plus",Georgia,serif'; var w = c.measureText(b.w).width + 14;
    c.fillStyle = 'rgba(255,252,240,.95)'; c.strokeStyle = '#7a4a12'; c.lineWidth = 1.5; c.beginPath(); if (c.roundRect) c.roundRect(X - w / 2, Y - T * 0.62, w, T * 0.6, 8); else c.rect(X - w / 2, Y - T * 0.62, w, T * 0.6); c.fill(); c.stroke();
    c.fillStyle = '#1d2320'; c.textAlign = 'center'; c.fillText(b.w, X, Y - T * 0.17);
  }
  function edgeArrow(tx, ty) {
    var m = 34; if (tx > m && tx < Wd - m && ty > m + 30 && ty < Ht - m) return;
    var cx = Wd / 2, cy = Ht / 2, a = Math.atan2(ty - cy, tx - cx), k = Math.min((Wd / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (Ht / 2 - m) / Math.abs(Math.sin(a) || 1e-6)), x = cx + Math.cos(a) * k, y = cy + Math.sin(a) * k;
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#e8b830'; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(16, 0); c.lineTo(-10, -11); c.lineTo(-4, 0); c.lineTo(-10, 11); c.closePath(); c.fill(); c.stroke(); c.restore();
  }
  function drawMinimap() {
    var m = G.m, sz = Math.min(170, Math.max(96, Wd * 0.2)), sc = sz / m.w, h = m.h * sc, X = Wd - sz - 10, Y = 44;
    c.globalAlpha = 0.9; c.drawImage(G.mini, X, Y, sz, h); c.globalAlpha = 1; c.strokeStyle = '#1d2320'; c.lineWidth = 2; c.strokeRect(X, Y, sz, h);
    function dot(x, y, col, r) { c.fillStyle = col; c.beginPath(); c.arc(X + x * sc, Y + y * sc, r, 0, 7); c.fill(); }
    G.guards.forEach(function (g) { if (!g.leave) dot(g.x, g.y, m.guards.col, 2.5); });
    if (G.mission && G.mission.target) dot(G.mission.target[0], G.mission.target[1], '#e8b830', 4);
    if (!G.mission && G.patron) dot(G.patron[0], G.patron[1], '#e8b830', 4);
    G.items.forEach(function (it) { dot(it.x, it.y, '#fff', 3); });
    if (G.thief && !G.thief.down) dot(G.thief.x, G.thief.y, '#111', 3);
    dot(G.p.x, G.p.y, '#2e8b57', 3.5); c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath(); c.arc(X + G.p.x * sc, Y + G.p.y * sc, 3.5, 0, 7); c.stroke();
  }

  // ---------- words ----------
  var sayT = null;
  function say(line, who, landmark) {
    if (!st.words && !landmark) return;
    if (who) { G.bubbles.push({ x: who.x, y: who.y, w: line[0], life: 2.4 }); G.lastSay = G.t; }
    var el = $('#ct-word'), gk = G.m.lang === 'g';
    if (!line[0]) { el.innerHTML = '<span class="ex">' + esc(line[1]) + '</span>'; }
    else el.innerHTML = '<b class="' + (gk ? 'gk' : 'la') + '">' + esc(line[0]) + '</b>' + (gk && TR(line[0]) ? ' <i>' + esc(TR(line[0])) + '</i>' : '') + ' = ' + esc(line[1]);
    el.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(function () { el.classList.remove('on'); }, 2800);
    if (line[0]) logWord(line[0].replace(/[!.?]+$/, ''), line[1].replace(/[!.?]+$/, ''));
  }
  function logWord(f, e) { try { if (st.words && W.TRBWords) W.TRBWords.log('city', G.m.lang, f, e); } catch (er) { } }
  function note(t) { $('#ct-obj').textContent = t || ''; $('#ct-obj').hidden = !t; }

  // ---------- sound ----------
  var AC = null;
  function beep(n) { if (!st.sound) return; try { AC = AC || new (W.AudioContext || W.webkitAudioContext)(); } catch (e) { return; } var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime, f = { ok: [520, 780, 0.15], tick: [880, 1100, 0.08], win: [523, 1046, 0.5], bad: [300, 150, 0.3] }[n] || [440, 440, 0.1]; o.type = 'triangle'; o.frequency.setValueAtTime(f[0], t); o.frequency.exponentialRampToValueAtTime(f[1], t + f[2]); g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + f[2] + 0.05); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + f[2] + 0.06); }

  // ---------- HUD ----------
  function hud() {
    if (!G) return;
    $('#ct-city').textContent = G.m.name;
    $('#ct-coins').textContent = '🪙 ' + st.coins;
    $('#ct-want').innerHTML = G.wanted ? '<span title="Wanted">' + '🛡️'.repeat(G.wanted) + '</span>' : '';
    $('#ct-act').textContent = G.p.car ? 'Get out' : 'Get in';
    hudLive();
  }
  function hudLive() {
    var Mi = G.mission, t = '';
    if (Mi && Mi.time) { var s = Math.max(0, Math.ceil(Mi.left)); t = '⏱ ' + Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
    if (G.race && G.race.go <= 0) { var me = G.p.car && G.p.car.race ? G.p.car : G.p; t = 'Lap ' + Math.min(G.race.R.laps, (me.lap || 0) + 1) + ' of ' + G.race.R.laps; }
    $('#ct-time').textContent = t;
    var act = $('#ct-act'), can = G.p.car ? !(G.p.car.race && G.race) : !!nearCar(); act.disabled = !can;
  }

  // ---------- overlays ----------
  var paused = true;
  function ov(html) { var o = $('#ct-ov'); o.innerHTML = '<div class="ct-box">' + html + '</div>'; o.hidden = false; paused = true; keys = {}; return o; }
  function closeOv() { $('#ct-ov').hidden = true; paused = false; last = 0; }
  function title() {
    var o = ov('<h1>Streets of Rome and Athens</h1><p class="ct-sub">Walk the streets of an ancient city, borrow a chariot from the stables, and run errands for a merchant: deliveries, races, a thief to catch, and the watch to escape. The people you pass talk to you in Latin or Greek.</p>' +
      '<div class="ct-cities"><button class="ct-city" data-c="rome"><b>Rome</b><span>About AD 110, under the emperor Trajan. The Forum, the Colosseum, the Circus Maximus. Latin.</span><small>' + (st.done.rome || []).length + ' of 7 jobs done</small></button>' +
      '<button class="ct-city" data-c="athens"><b>Athens</b><span>About AD 50, when the apostle Paul visited. The market, the Acropolis, the Areopagus, the stadium. Koine Greek.</span><small>' + (st.done.athens || []).length + ' of 7 jobs done</small></button></div>' +
      '<div class="ct-opts"><label><input type="checkbox" id="ct-w"' + (st.words ? ' checked' : '') + '> Latin and Greek words</label><label><input type="checkbox" id="ct-s"' + (st.sound ? ' checked' : '') + '> Sound</label></div>' +
      '<details><summary>How to play</summary><ul><li><b>Keyboard:</b> arrow keys or WASD to walk; hold Shift to run. <b>E</b> or Enter gets into a chariot or out of it. In a chariot, ↑ goes forward, ↓ slows down and reverses, ← → turn, Shift brakes. P pauses.</li><li><b>Phone:</b> drag the left half of the screen to move or steer; the chariot heads the way you point. Use the buttons to get in and out and to run.</li><li>The ! on the map is your patron. Walk into it for a job. The ★ marks where to go next; the arrow at the edge of the screen points to it.</li><li>Knocking people over with a chariot brings out the watch (🛡️). Get out of their sight for a while and they give up; if they catch you, you pay a fine.</li><li>Your progress is saved in this browser.</li></ul></details>' +
      '<p class="ct-small">This is a cartoon city. The street plan is invented; the great buildings are in roughly the right places, and the history is real.</p>');
    o.querySelectorAll('.ct-city').forEach(function (b) { b.addEventListener('click', function () { startCity(b.dataset.c); closeOv(); }); });
    $('#ct-w').addEventListener('change', function () { st.words = this.checked; save(); });
    $('#ct-s').addEventListener('change', function () { st.sound = this.checked; save(); if (st.sound) beep('ok'); });
  }
  function pause() {
    if (!G || !$('#ct-ov').hidden) return;
    var o = ov('<h2>Paused</h2><p class="ct-small">' + esc(G.m.name) + ', ' + esc(G.m.when) + '</p><button class="ct-btn pri" id="ct-res">Continue</button> ' + (G.mission ? '<button class="ct-btn" id="ct-quit">Give up this job</button> ' : '') + '<button class="ct-btn" id="ct-menu2">Choose a city</button>');
    $('#ct-res').addEventListener('click', closeOv);
    if ($('#ct-quit')) $('#ct-quit').addEventListener('click', function () { endMission(); setWanted(0); closeOv(); });
    $('#ct-menu2').addEventListener('click', function () { G = null; title(); });
  }

  // ---------- input ----------
  var KM = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ShiftLeft: 'run', ShiftRight: 'run', Space: 'run' };
  D.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (!G) return;
    if (e.code === 'KeyP' || e.code === 'Escape') { if (!paused) pause(); else if ($('#ct-res')) closeOv(); e.preventDefault(); return; }
    if (paused) return;
    if (e.code === 'KeyE' || e.code === 'Enter') { action(); e.preventDefault(); return; }
    var k = KM[e.code]; if (!k) return; keys[k] = true; e.preventDefault();
  });
  D.addEventListener('keyup', function (e) { var k = KM[e.code]; if (k) keys[k] = false; });
  W.addEventListener('blur', function () { keys = {}; });
  D.addEventListener('visibilitychange', function () { if (D.hidden && G && !paused) pause(); });
  // touch: drag on the left two-thirds of the screen like a joystick
  var sid = null, s0 = null;
  cv.addEventListener('pointerdown', function (e) { if (!G || paused) return; var r = cv.getBoundingClientRect(); if (e.clientX - r.left > r.width * 0.66 && e.pointerType !== 'mouse') return; sid = e.pointerId; s0 = { x: e.clientX, y: e.clientY }; stick.on = true; stick.x = 0; stick.y = 0; cv.setPointerCapture(e.pointerId); e.preventDefault(); });
  cv.addEventListener('pointermove', function (e) { if (e.pointerId !== sid) return; var dx = e.clientX - s0.x, dy = e.clientY - s0.y, l = Math.hypot(dx, dy), R = 55; if (l > R) { dx *= R / l; dy *= R / l; } stick.x = dx / R; stick.y = dy / R; G && (G.stickPos = { x: s0.x, y: s0.y, dx: dx, dy: dy }); });
  function sEnd(e) { if (e.pointerId !== sid) return; sid = null; stick.on = false; stick.x = stick.y = 0; if (G) G.stickPos = null; }
  cv.addEventListener('pointerup', sEnd); cv.addEventListener('pointercancel', sEnd);
  $('#ct-act').addEventListener('click', action);
  var runB = $('#ct-run');
  runB.addEventListener('pointerdown', function (e) { e.preventDefault(); keys.run = true; runB.classList.add('on'); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { runB.addEventListener(ev, function () { keys.run = false; runB.classList.remove('on'); }); });
  $('#ct-pause').addEventListener('click', pause);
  if (touch) root.classList.add('touch');

  // ---------- loop ----------
  var last = 0;
  function frame(ts) {
    W.requestAnimationFrame(frame);
    if (!G) { last = 0; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = '#2a2218'; c.fillRect(0, 0, Wd, Ht); return; }
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (!paused) { var n = Math.ceil(dt / (1 / 90)); for (var i = 0; i < n && G && !paused; i++) step(dt / n); }
    if (G) { draw(); if (G.stickPos) { var r = cv.getBoundingClientRect(), sp = G.stickPos; c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(sp.x - r.left, sp.y - r.top, 55, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(sp.x - r.left + sp.dx, sp.y - r.top + sp.dy, 22, 0, 7); c.fill(); } }
  }
  fit(); title(); W.requestAnimationFrame(frame);
  W.__city = { get G() { return G; }, start: function (cty) { startCity(cty); closeOv(); }, mission: function (j) { startMission(j); }, keys: keys, setKeys: function (o) { for (var k in o) keys[k] = o[k]; }, step: function (s) { for (var t = 0; t < s; t += 1 / 90) step(1 / 90); }, hold: function (v) { paused = v; }, action: action, spot: spot, bfs: bfs, enter: function (car) { enterCar(car); } };
})(window, document);
