/* Painted isometric art for the festival game. All drawing is vector (canvas 2D), cached into sprites. */
(function (W) {
  'use strict';
  var TW = 64, TH = 32, HW = TW / 2, HH = TH / 2;
  var PAL = {
    greece: {
      marble: '#f3efe4', marbleS: '#dcd5c2', marbleD: '#c1b8a2', roof: '#cf7d4f', roofD: '#a95f39', accent: '#2f5f93', accent2: '#c9a24a',
      wood: '#8a5a33', stone: '#cfc3a4', stoneD: '#b3a585', sand: '#e6d3a2', water: '#4fa3cf', leaf: '#6f8a47', leafD: '#4d6630', olive: '#8fa06a',
      grass: ['#93b061', '#8ba95a', '#99b667', '#86a355'], path: '#dcc9a0', pathD: '#bca67b', cloth: ['#2f5f93', '#f3efe4']
    },
    rome: {
      marble: '#efe5cf', marbleS: '#d9cbad', marbleD: '#bcad8e', roof: '#b9563b', roofD: '#8f402b', accent: '#8c1d2c', accent2: '#c9a24a',
      wood: '#7a4b2a', stone: '#bdb29d', stoneD: '#9f947f', sand: '#dfc590', water: '#4a97c2', leaf: '#62803c', leafD: '#435e28', olive: '#879a60',
      grass: ['#88a75c', '#809f54', '#8faf62', '#7b994f'], path: '#c2b9a8', pathD: '#a0978a', cloth: ['#8c1d2c', '#c9a24a']
    }
  };

  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); }
    return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
  }
  function P(x, y, z) { return [(x - y) * HW, (x + y) * HH - (z || 0)]; }
  function poly(c, pts, fill, stroke, lw) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1; c.stroke(); }
  }
  // Iso box with footprint (x,y,w,h) in tile units from height z0 to z1.
  function box(c, x, y, w, h, z0, z1, top, left, right, edge) {
    var A = P(x, y, z1), Bt = P(x + w, y, z1), Ct = P(x + w, y + h, z1), Dt = P(x, y + h, z1);
    var B0 = P(x + w, y, z0), C0 = P(x + w, y + h, z0), D0 = P(x, y + h, z0);
    poly(c, [D0, C0, Ct, Dt], left, edge, 0.6);
    poly(c, [B0, C0, Ct, Bt], right, edge, 0.6);
    poly(c, [A, Bt, Ct, Dt], top, edge, 0.6);
  }
  function mbox(c, x, y, w, h, z0, z1, col, edge) { box(c, x, y, w, h, z0, z1, shade(col, 0.12), shade(col, -0.08), shade(col, -0.2), edge); }
  function column(c, x, y, z0, z1, col, r) {
    var a = P(x, y, z0), b = P(x, y, z1); r = r || 3.2;
    var g = c.createLinearGradient(a[0] - r, 0, a[0] + r, 0);
    g.addColorStop(0, shade(col, 0.25)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.28));
    c.fillStyle = g; c.fillRect(a[0] - r, b[1], r * 2, a[1] - b[1]);
    c.fillStyle = shade(col, -0.1); c.fillRect(a[0] - r - 1.5, b[1] - 2, r * 2 + 3, 3);
    c.fillRect(a[0] - r - 1, a[1] - 2, r * 2 + 2, 2);
  }
  // Gable roof with ridge running along x.
  function gable(c, x, y, w, h, z, rise, col, tymp) {
    var r0 = P(x, y + h / 2, z + rise), r1 = P(x + w, y + h / 2, z + rise);
    var a = P(x, y, z), b = P(x + w, y, z), cc = P(x + w, y + h, z), d = P(x, y + h, z);
    poly(c, [a, b, r1, r0], shade(col, -0.25));
    poly(c, [d, cc, r1, r0], shade(col, 0.05), shade(col, -0.35), 0.6);
    poly(c, [b, cc, r1], tymp || shade(col, -0.15), shade(col, -0.35), 0.6);
    // tile lines
    c.strokeStyle = shade(col, -0.2); c.lineWidth = 0.6;
    for (var i = 1; i < w * 4; i++) {
      var t = i / (w * 4), p = P(x + w * t, y + h, z), q = P(x + w * t, y + h / 2, z + rise);
      c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
    }
  }
  function hipRoof(c, x, y, w, h, z, rise, col) {
    var ap = P(x + w / 2, y + h / 2, z + rise), a = P(x, y, z), b = P(x + w, y, z), cc = P(x + w, y + h, z), d = P(x, y + h, z);
    poly(c, [a, b, ap], shade(col, -0.25)); poly(c, [a, d, ap], shade(col, -0.1));
    poly(c, [d, cc, ap], shade(col, 0.06), shade(col, -0.35), 0.6); poly(c, [b, cc, ap], shade(col, -0.18), shade(col, -0.35), 0.6);
  }
  function isoEllipse(c, cx, cy, z, r, a0, a1, ccw) {
    var p = P(cx, cy, z); c.ellipse(p[0], p[1], r * HW * Math.SQRT2, r * HH * Math.SQRT2, 0, a0 == null ? 0 : a0, a1 == null ? Math.PI * 2 : a1, ccw);
  }
  function stadium(x, y, w, h, inset, z) {
    var r = h / 2 - inset, cy = y + h / 2, x0 = x + h / 2, x1 = x + w - h / 2, pts = [], i, a;
    for (i = 0; i <= 12; i++) { a = -Math.PI / 2 + Math.PI * i / 12; pts.push(P(x1 + Math.cos(a) * r, cy + Math.sin(a) * r, z)); }
    for (i = 0; i <= 12; i++) { a = Math.PI / 2 + Math.PI * i / 12; pts.push(P(x0 + Math.cos(a) * r, cy + Math.sin(a) * r, z)); }
    return pts;
  }
  function tree(c, x, y, pal, kind, seed) {
    var base = P(x, y, 0), rnd = mulberry(seed || 7);
    c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(base[0] + 4, base[1] + 2, 16, 7, 0, 0, Math.PI * 2); c.fill();
    if (kind === 'cypress') {
      var g = c.createLinearGradient(base[0] - 8, 0, base[0] + 8, 0); g.addColorStop(0, shade(pal.leafD, 0.25)); g.addColorStop(1, shade(pal.leafD, -0.25));
      c.fillStyle = g; c.beginPath(); c.moveTo(base[0], base[1] - 78);
      c.bezierCurveTo(base[0] + 12, base[1] - 50, base[0] + 11, base[1] - 12, base[0], base[1] - 4);
      c.bezierCurveTo(base[0] - 11, base[1] - 12, base[0] - 12, base[1] - 50, base[0], base[1] - 78); c.fill();
      return;
    }
    c.strokeStyle = shade(pal.wood, -0.1); c.lineWidth = 3.5; c.beginPath(); c.moveTo(base[0], base[1]);
    c.bezierCurveTo(base[0] - 4, base[1] - 10, base[0] + 4, base[1] - 16, base[0] - 1, base[1] - 26); c.stroke();
    for (var i = 0; i < 7; i++) {
      var ox = (rnd() - 0.5) * 30, oy = -28 - rnd() * 18, rr = 8 + rnd() * 6;
      c.fillStyle = i % 2 ? shade(pal.olive, -0.12) : shade(pal.olive, 0.12);
      c.beginPath(); c.ellipse(base[0] + ox, base[1] + oy, rr, rr * 0.8, 0, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(base[0] - 6, base[1] - 44, 7, 4, 0, 0, Math.PI * 2); c.fill();
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shadow(c, w, h, k) {
    k = k || 0.5; c.fillStyle = 'rgba(40,30,10,.13)';
    poly(c, [P(0 + k * 0.3, 0 + k * 0.3, 0), P(w + k, 0 + k * 0.3, 0), P(w + k, h + k * 0.6, 0), P(0 + k * 0.3, h + k * 0.6, 0)], 'rgba(40,30,10,.13)');
  }

  // ---------- buildings ----------
  var DRAW = {
    gate: function (c, w, h, p) {
      mbox(c, 0.08, 0.28, 0.24, 0.44, 0, 64, p.marble); mbox(c, 0.68, 0.28, 0.24, 0.44, 0, 64, p.marble);
      mbox(c, 0.02, 0.22, 0.96, 0.56, 62, 74, p.marbleS);
      var a = P(0.02, 0.78, 74), b = P(0.98, 0.78, 74), t = P(0.5, 0.78, 92);
      poly(c, [a, b, t], p.accent, shade(p.accent, -0.3), 0.8);
      var f0 = P(0.3, 0.78, 60), f1 = P(0.7, 0.78, 60);
      poly(c, [f0, f1, [f1[0], f1[1] + 26], [(f0[0] + f1[0]) / 2, f0[1] + 32], [f0[0], f0[1] + 26]], p.cloth[0], shade(p.cloth[0], -0.3));
    },
    theater: function (c, w, h, p) {
      shadow(c, w, h);
      var cx = w / 2 + 0.25, cy = h / 2 + 0.25, n = 6;
      // outer retaining wall
      c.beginPath(); isoEllipse(c, cx, cy, 0, 1.55, Math.PI, Math.PI * 2); isoEllipse(c, cx, cy, 40, 1.55, Math.PI * 2, Math.PI, true); c.closePath();
      c.fillStyle = shade(p.stone, -0.25); c.fill();
      for (var i = 0; i < n; i++) {
        var r = 1.55 - i * 0.17, z = 40 - i * 6.5;
        c.beginPath(); isoEllipse(c, cx, cy, z, r, Math.PI, Math.PI * 2); c.closePath();
        c.fillStyle = i % 2 ? shade(p.stone, 0.12) : shade(p.stone, 0.02); c.fill();
        c.beginPath(); isoEllipse(c, cx, cy, z - 6.5, r - 0.17, Math.PI, Math.PI * 2); isoEllipse(c, cx, cy, z, r - 0.17, Math.PI * 2, Math.PI, true); c.closePath();
        c.fillStyle = shade(p.stone, -0.18); c.fill();
      }
      // aisles
      c.strokeStyle = shade(p.stone, -0.3); c.lineWidth = 1;
      [1.2, 1.57, 1.94].forEach(function (a) { var ang = Math.PI + a; var o = P(cx + Math.cos(ang) * 0.7 * Math.SQRT2 / 1.4, cy + Math.sin(ang) * 0.7, 6), q = P(cx + Math.cos(ang) * 1.5, cy + Math.sin(ang) * 1.5, 38); c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(q[0], q[1]); c.stroke(); });
      c.beginPath(); isoEllipse(c, cx, cy, 1, 0.62); c.fillStyle = p.sand; c.fill(); c.strokeStyle = shade(p.sand, -0.2); c.stroke();
      c.beginPath(); isoEllipse(c, cx, cy, 1, 0.12); c.fillStyle = p.marble; c.fill();
      // stage building (skene)
      mbox(c, 0.25, h - 0.62, w - 0.5, 0.38, 0, 24, p.marbleS);
      for (var k = 0; k < 6; k++) column(c, 0.45 + k * (w - 0.9) / 5, h - 0.24, 0, 22, p.marble, 2.2);
      mbox(c, 0.2, h - 0.66, w - 0.4, 0.46, 22, 27, p.accent2);
    },
    hippodrome: function (c, w, h, p) {
      shadow(c, w, h, 0.4);
      var outer = stadium(0.05, 0.05, w - 0.1, h - 0.1, 0, 12), outer0 = stadium(0.05, 0.05, w - 0.1, h - 0.1, 0, 0);
      // outer wall (front half visible)
      poly(c, outer0, shade(p.stone, -0.3)); poly(c, outer, shade(p.stone, 0.05), shade(p.stone, -0.35), 0.8);
      // seating rows
      poly(c, stadium(0.05, 0.05, w - 0.1, h - 0.1, 0.18, 9), shade(p.stone, 0.18));
      poly(c, stadium(0.05, 0.05, w - 0.1, h - 0.1, 0.34, 6), shade(p.stone, -0.05));
      poly(c, stadium(0.05, 0.05, w - 0.1, h - 0.1, 0.46, 2), p.sand, shade(p.sand, -0.25), 0.8);
      // spina
      mbox(c, 1.1, h / 2 - 0.1, w - 2.2, 0.2, 2, 8, p.marbleS);
      mbox(c, w / 2 - 0.06, h / 2 - 0.06, 0.12, 0.12, 8, 44, p.marble);
      var tip = P(w / 2, h / 2, 50), b0 = P(w / 2 - 0.06, h / 2 + 0.06, 44), b1 = P(w / 2 + 0.06, h / 2 + 0.06, 44), b2 = P(w / 2 + 0.06, h / 2 - 0.06, 44);
      poly(c, [b0, b1, tip], p.accent2); poly(c, [b1, b2, tip], shade(p.accent2, -0.2));
      [1.05, w - 1.05].forEach(function (mx) { for (var k = -1; k <= 1; k++) { var m = P(mx, h / 2 + k * 0.07, 8); c.fillStyle = p.accent2; c.beginPath(); c.moveTo(m[0] - 2, m[1]); c.lineTo(m[0] + 2, m[1]); c.lineTo(m[0], m[1] - 14); c.fill(); } });
      // starting gates (carceres)
      mbox(c, w - 0.35, 0.35, 0.25, h - 0.7, 0, 20, p.marbleS);
    },
    temple: function (c, w, h, p) {
      shadow(c, w, h);
      mbox(c, 0.05, 0.05, w - 0.1, h - 0.1, 0, 6, p.stone);
      mbox(c, 0.15, 0.15, w - 0.3, h - 0.3, 6, 12, p.marbleS);
      var x0 = 0.35, x1 = w - 0.35, y0 = 0.35, y1 = h - 0.35, i, nx = Math.round((x1 - x0) / 0.4), ny = Math.round((y1 - y0) / 0.4);
      for (i = 0; i <= nx; i++) column(c, x0 + (x1 - x0) * i / nx, y0, 12, 58, p.marble);
      for (i = 1; i < ny; i++) column(c, x0, y0 + (y1 - y0) * i / ny, 12, 58, p.marble);
      mbox(c, 0.75, 0.65, w - 1.5, h - 1.3, 12, 56, p.marbleS);
      c.fillStyle = shade(p.wood, -0.35); var d = P(w - 0.75, h / 2 - 0.2, 12), d2 = P(w - 0.75, h / 2 + 0.2, 12);
      poly(c, [d, d2, [d2[0], d2[1] - 28], [d[0], d[1] - 28]], shade(p.wood, -0.4));
      for (i = 0; i <= nx; i++) column(c, x0 + (x1 - x0) * i / nx, y1, 12, 58, p.marble);
      for (i = 1; i <= ny; i++) column(c, x1, y0 + (y1 - y0) * i / ny, 12, 58, p.marble);
      box(c, 0.2, 0.2, w - 0.4, h - 0.4, 58, 68, shade(p.marble, 0.1), p.accent, shade(p.accent, -0.2));
      gable(c, 0.15, 0.15, w - 0.3, h - 0.3, 68, 24, p.roof, p.marbleS);
      var ped = P(w - 0.15, h / 2, 76); c.fillStyle = p.accent2; c.beginPath(); c.arc(ped[0], ped[1], 3, 0, Math.PI * 2); c.fill();
    },
    palaestra: function (c, w, h, p) {
      shadow(c, w, h);
      poly(c, [P(0, 0, 1), P(w, 0, 1), P(w, h, 1), P(0, h, 1)], p.sand, shade(p.sand, -0.2));
      mbox(c, 0, 0, w, 0.35, 0, 30, p.marbleS); mbox(c, 0, 0.35, 0.35, h - 0.35, 0, 30, p.marbleS);
      box(c, 0, 0, w, 0.5, 30, 34, shade(p.roof, 0.05), p.roofD, p.roofD); box(c, 0, 0.5, 0.5, h - 0.5, 30, 34, shade(p.roof, 0.05), p.roofD, p.roofD);
      // wrestlers
      [[w / 2 - 0.15, h / 2], [w / 2 + 0.15, h / 2 + 0.05]].forEach(function (q, k) { var b = P(q[0], q[1], 1); c.fillStyle = '#b07a4f'; c.fillRect(b[0] - 2.5, b[1] - 16, 5, 13); c.beginPath(); c.arc(b[0], b[1] - 19, 3.2, 0, Math.PI * 2); c.fill(); });
      for (var i = 0; i <= 6; i++) column(c, 0.2 + (w - 0.4) * i / 6, h - 0.18, 0, 26, p.marble, 2.4);
      for (i = 0; i < 6; i++) column(c, w - 0.18, 0.2 + (h - 0.4) * i / 6, 0, 26, p.marble, 2.4);
      box(c, 0.1, h - 0.3, w - 0.1, 0.3, 26, 29, shade(p.roof, 0.05), p.roofD, p.roofD);
      box(c, w - 0.3, 0.1, 0.3, h - 0.4, 26, 29, shade(p.roof, 0.05), p.roofD, p.roofD);
    },
    odeum: function (c, w, h, p) {
      shadow(c, w, h);
      mbox(c, 0.1, 0.1, w - 0.2, h - 0.2, 0, 34, p.marbleS);
      for (var i = 0; i < 4; i++) { var q = P(0.35 + i * 0.4, h - 0.1, 8); c.fillStyle = shade(p.marbleD, -0.3); c.beginPath(); c.moveTo(q[0] - 3, q[1]); c.lineTo(q[0] - 3, q[1] - 12); c.arc(q[0], q[1] - 12, 3, Math.PI, 0); c.lineTo(q[0] + 3, q[1]); c.fill(); }
      hipRoof(c, 0.02, 0.02, w - 0.04, h - 0.04, 34, 26, p.roof);
      var b = P(w - 0.1, h / 2, 0); poly(c, [b, P(w - 0.1, h / 2 + 0.3, 0), P(w - 0.1, h / 2 + 0.3, 20), P(w - 0.1, h / 2, 20)], shade(p.wood, -0.3));
    },
    bakery: function (c, w, h, p) { stall(c, p, function () {
      var l = [[0.35, 0.55], [0.55, 0.45], [0.5, 0.65]]; l.forEach(function (q) { var b = P(q[0], q[1], 17); c.fillStyle = '#c48a45'; c.beginPath(); c.ellipse(b[0], b[1], 6, 3.5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#e0ae6a'; c.beginPath(); c.ellipse(b[0] - 1, b[1] - 1, 3, 1.5, 0, 0, Math.PI * 2); c.fill(); });
    }); },
    tavern: function (c, w, h, p) { stall(c, p, function () {
      [[0.3, 0.8], [0.45, 0.85]].forEach(function (q) { var b = P(q[0], q[1], 0); c.fillStyle = '#b8683f'; c.beginPath(); c.ellipse(b[0], b[1] - 9, 4.5, 8, 0, 0, Math.PI * 2); c.fill(); c.fillRect(b[0] - 1.5, b[1] - 20, 3, 4); });
      var b = P(0.55, 0.5, 17); c.fillStyle = '#6d2436'; c.beginPath(); c.arc(b[0], b[1] - 2, 2.5, 0, Math.PI * 2); c.fill();
    }, true); },
    fountain: function (c, w, h, p) {
      c.beginPath(); isoEllipse(c, 0.5, 0.5, 0, 0.42); isoEllipse(c, 0.5, 0.5, 8, 0.42); c.fillStyle = shade(p.marbleS, -0.15); c.fill();
      c.beginPath(); isoEllipse(c, 0.5, 0.5, 8, 0.42); c.fillStyle = p.marble; c.fill();
      c.beginPath(); isoEllipse(c, 0.5, 0.5, 8, 0.34); var q = P(0.5, 0.5, 8); var g = c.createRadialGradient(q[0], q[1], 1, q[0], q[1], 18); g.addColorStop(0, shade(p.water, 0.35)); g.addColorStop(1, p.water); c.fillStyle = g; c.fill();
      column(c, 0.5, 0.5, 6, 26, p.marble, 3);
      var t = P(0.5, 0.5, 30); c.fillStyle = p.marble; c.beginPath(); c.ellipse(t[0], t[1], 7, 3.5, 0, 0, Math.PI * 2); c.fill();
    },
    baths: function (c, w, h, p) {
      shadow(c, w, h);
      mbox(c, 0.08, 0.08, w - 0.16, h - 0.16, 0, 30, p.marbleS);
      for (var i = 0; i < 3; i++) { var q = P(0.4 + i * 0.5, h - 0.08, 10); c.fillStyle = shade(p.water, -0.45); c.beginPath(); c.moveTo(q[0] - 4, q[1]); c.lineTo(q[0] - 4, q[1] - 10); c.arc(q[0], q[1] - 10, 4, Math.PI, 0); c.lineTo(q[0] + 4, q[1]); c.fill();
        q = P(w - 0.08, 0.4 + i * 0.5, 10); c.beginPath(); c.moveTo(q[0] - 4, q[1]); c.lineTo(q[0] - 4, q[1] - 10); c.arc(q[0], q[1] - 10, 4, Math.PI, 0); c.lineTo(q[0] + 4, q[1]); c.fill(); }
      box(c, 0.02, 0.02, w - 0.04, h - 0.04, 30, 35, p.marble, shade(p.marble, -0.1), shade(p.marble, -0.2));
      var d = P(w / 2, h / 2, 35), g = c.createRadialGradient(d[0] - 10, d[1] - 20, 4, d[0], d[1] - 8, 40);
      g.addColorStop(0, shade(p.marble, 0.3)); g.addColorStop(1, shade(p.marbleD, -0.1));
      c.fillStyle = g; c.beginPath(); c.ellipse(d[0], d[1], 30, 17, 0, Math.PI, 0); c.ellipse(d[0], d[1], 30, 8, 0, 0, Math.PI); c.fill();
      c.fillStyle = p.accent2; c.fillRect(d[0] - 1.5, d[1] - 22, 3, 6);
    },
    latrine: function (c, w, h, p) {
      mbox(c, 0.15, 0.2, 0.7, 0.6, 0, 24, p.stone);
      box(c, 0.1, 0.15, 0.8, 0.7, 24, 28, shade(p.roof, 0.05), p.roofD, shade(p.roofD, -0.1));
      var a = P(0.85, 0.4, 0), b = P(0.85, 0.62, 0); poly(c, [a, b, [b[0], b[1] - 17], [a[0], a[1] - 17]], shade(p.wood, -0.25));
    },
    bench: function (c, w, h, p) {
      mbox(c, 0.25, 0.42, 0.1, 0.16, 0, 6, p.stoneD); mbox(c, 0.65, 0.42, 0.1, 0.16, 0, 6, p.stoneD);
      mbox(c, 0.18, 0.38, 0.64, 0.24, 6, 9, p.marble);
    },
    olive: function (c, w, h, p, seed) { tree(c, 0.5, 0.5, p, 'olive', seed); },
    cypress: function (c, w, h, p, seed) { tree(c, 0.5, 0.5, p, 'cypress', seed); },
    statue: function (c, w, h, p) {
      mbox(c, 0.32, 0.32, 0.36, 0.36, 0, 14, p.marbleS);
      var b = P(0.5, 0.5, 14), g = c.createLinearGradient(b[0] - 5, 0, b[0] + 5, 0); g.addColorStop(0, shade(p.marble, 0.2)); g.addColorStop(1, shade(p.marbleD, -0.1));
      c.fillStyle = g; c.beginPath(); c.moveTo(b[0] - 4, b[1]); c.lineTo(b[0] - 5, b[1] - 22); c.lineTo(b[0] + 5, b[1] - 22); c.lineTo(b[0] + 4, b[1]); c.fill();
      c.fillRect(b[0] + 4, b[1] - 30, 2.5, 10); c.beginPath(); c.arc(b[0], b[1] - 26, 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = shade(p.marbleD, -0.1); c.beginPath(); c.moveTo(b[0] - 5, b[1] - 22); c.lineTo(b[0] - 8, b[1] - 8); c.lineTo(b[0] - 4, b[1] - 8); c.fill();
    },
    flowers: function (c, w, h, p, seed) {
      var r = mulberry(seed || 3), cols = ['#d14d5b', '#f0c330', '#ffffff', '#b565c2', '#e58a3a'];
      poly(c, [P(0.12, 0.12, 1), P(0.88, 0.12, 1), P(0.88, 0.88, 1), P(0.12, 0.88, 1)], shade(p.leaf, -0.05));
      for (var i = 0; i < 26; i++) { var q = P(0.18 + r() * 0.64, 0.18 + r() * 0.64, 3 + r() * 3); c.fillStyle = cols[i % cols.length]; c.beginPath(); c.arc(q[0], q[1], 1.8, 0, Math.PI * 2); c.fill(); }
    }
  };
  function stall(c, p, goods, vine) {
    shadow(c, 1, 1, 0.3);
    mbox(c, 0.18, 0.28, 0.64, 0.5, 0, 15, p.wood);
    goods();
    column(c, 0.2, 0.3, 0, 36, p.wood, 1.5); column(c, 0.8, 0.3, 0, 36, p.wood, 1.5);
    column(c, 0.2, 0.8, 0, 30, p.wood, 1.5); column(c, 0.8, 0.8, 0, 30, p.wood, 1.5);
    if (vine) {
      for (var i = 0; i < 9; i++) { var q = P(0.15 + (i % 3) * 0.33, 0.25 + Math.floor(i / 3) * 0.3, 33); c.fillStyle = i % 2 ? p.leaf : p.leafD; c.beginPath(); c.ellipse(q[0], q[1], 9, 5, 0, 0, Math.PI * 2); c.fill(); }
      return;
    }
    var n = 6;
    for (var k = 0; k < n; k++) {
      var y0 = 0.22, y1 = 0.88, x = 0.14 + 0.72 * k / n, x2 = 0.14 + 0.72 * (k + 1) / n;
      poly(c, [P(x, y0, 38), P(x2, y0, 38), P(x2, y1, 30), P(x, y1, 30)], k % 2 ? p.cloth[1] : p.cloth[0]);
    }
    for (k = 0; k < n; k++) { var a = P(0.14 + 0.72 * k / n, 0.88, 30), b2 = P(0.14 + 0.72 * (k + 1) / n, 0.88, 30); c.fillStyle = k % 2 ? p.cloth[1] : p.cloth[0]; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.lineTo((a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2 + 5); c.fill(); }
  }

  // Sprite cache: draw each building once at 2x into an offscreen canvas.
  var cache = {};
  var MAXZ = 110;
  function sprite(type, w, h, setting, seed) {
    var key = type + w + 'x' + h + setting + (seed || '');
    if (cache[key]) return cache[key];
    var sc = 2, m = 6, cw = (w + h) * HW + m * 2, ch = (w + h) * HH + MAXZ + m * 2;
    var cv = document.createElement('canvas'); cv.width = cw * sc; cv.height = ch * sc;
    var c = cv.getContext('2d'); c.scale(sc, sc); c.translate(h * HW + m, MAXZ + m);
    c.lineJoin = 'round';
    DRAW[type](c, w, h, PAL[setting], seed);
    return (cache[key] = { cv: cv, ox: h * HW + m, oy: MAXZ + m, w: cw, h: ch });
  }
  function icon(canvas, type, w, h, setting) {
    var s = sprite(type, w, h, setting, 5), c = canvas.getContext('2d'), k = Math.min(canvas.width / s.w, canvas.height / (s.h - MAXZ * 0.35)) * 0.95;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(s.cv, (canvas.width - s.w * k) / 2, canvas.height - s.h * k - 2, s.w * k, s.h * k);
  }

  W.FestArt = { TW: TW, TH: TH, PAL: PAL, P: P, poly: poly, shade: shade, sprite: sprite, icon: icon, isoEllipse: isoEllipse, stadium: stadium, mulberry: mulberry };
})(window);
