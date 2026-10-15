/* Sky and Solar System (/games/night-sky/): the planets around the Sun, the Moon's phases, eclipse geometry and tonight's sky,
   for any moment from 1800 to 2050. The astronomy is in sky.js (window.NightSky); this file draws the views,
   handles input and checks the missions. */
(function () {
  'use strict';
  var L = window.TRBLab, N = window.NightSky, root = document.getElementById('night-sky-lab');
  if (!root || !L || !N) return;
  var D2R = N.D2R, R2D = N.R2D, TAU = 2 * Math.PI, DAY = 86400000, K = N.K;
  function $(id) { return document.getElementById(id); }
  var view = $('ns-view'), cv = $('ns-cv'), G = L.canvas(cv), ctx = G.c, store = L.store('night-sky');
  var hudA = $('ns-hud'), readEl = $('ns-read'), listEl = $('ns-list'), tipEl = $('ns-tip');
  var C = { green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)' };
  var PC = ['#cfc8bd', '#ffe3a3', '#74c0fc', '#ff8f70', '#e9c496', '#f3d98b', '#9ee6e6', '#8fa8ff'];
  var PR = [3, 4.5, 4.5, 3.8, 8, 7, 5.5, 5.5];
  var NAMES = N.PLANETS, reduced = L.reduced;
  var SPEEDS = { '0': 0, h: 1 / 24, d: 1, w: 7, m: 30.436875 };
  var SPEED_TXT = { '0': 'Paused', h: '1 hour per second', d: '1 day per second', w: '1 week per second', m: '1 month per second' };
  var SPEED_KEYS = ['0', 'h', 'd', 'w', 'm'];
  var PHASE_NAMES = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];

  /* ---------- small helpers ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function num(v, d) { var s = L.fmt(v, d), p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dateStr(ms) { var d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function timeStr(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function niceDate(ms, withDay) { try { return new Date(ms).toLocaleDateString('en-US', withDay ? { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return dateStr(ms); } }
  function niceTime(ms) { try { return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); } catch (e) { return timeStr(ms); } }
  function niceDT(ms) { return niceDate(ms) + ', ' + niceTime(ms); }
  function utStr(ms) { var d = new Date(ms); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' UT'; }
  function deg(v, d) { return L.fmt(v, d === undefined ? 1 : d) + '°'; }
  function compass(az) { return ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'][Math.round(N.norm360(az) / 45) % 8]; }
  function phaseName(D) { return PHASE_NAMES[Math.round(N.norm360(D) / 45) % 8]; }
  var tzName = ''; try { tzName = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop(); } catch (e) { }

  /* ---------- state ---------- */
  var nowMs = clamp(Date.now(), K.MIN_MS, K.MAX_MS);
  var stdOff = Math.max(new Date(2026, 0, 1).getTimezoneOffset(), new Date(2026, 6, 1).getTimezoneOffset());
  var tzLon = clamp(Math.round(-stdOff / 4), -180, 180);
  var S = {
    ms: nowMs, view: store.get('view', 'orrery'), speed: '0', lastSpeed: 'd', rev: false,
    scale: store.get('scale', 'true'), zoom: store.get('zoom', 'inner'), watch: store.get('watch', 3),
    orbits: store.get('orbits', true) !== false, labels: store.get('labels', true) !== false, south: !!store.get('south', false), tilt3: store.get('tilt3', true) !== false,
    eve: store.get('eve', true) !== false, lat: store.get('lat', 40), lon: tzLon,
    cam: { s: 1, sT: 1, px: 0, py: 0, init: false }, ecam: { az: -18, el: 18 }, stripC: 180, stripSpan: 360, latC: 0, latK: 3.6, stripSnap: true,
    snap: null, jd: 0, rate: [], drag: null,
    race: null, retroDays: 0, ycache: null, orbitCache: null, moonCache: null, sky: null
  };
  if (['orrery', 'moon', 'eclipse', 'tonight'].indexOf(S.view) < 0) S.view = 'orrery';
  var nextFullJd = N.findPhase(N.jdTT(nowMs), 180, 1);

  /* ---------- fast directions for trails (from the Earth-Moon barycenter, no light time) ---------- */
  var H1 = {}, H2 = {};
  function geoFast(i, jd) {
    N.helio(2, jd, H1); N.helio(i, jd, H2);
    var x = H2.x - H1.x, y = H2.y - H1.y, z = H2.z - H1.z;
    return { lon: N.norm360(Math.atan2(y, x) * R2D), lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * R2D };
  }
  function sunFast(jd) { N.helio(2, jd, H1); return N.norm360(Math.atan2(-H1.y, -H1.x) * R2D); }

  /* ---------- stars ---------- */
  var BG = null;
  function makeBG() {
    var c = document.createElement('canvas'), w = Math.round(G.w * G.dpr), h = Math.round(G.h * G.dpr), g = c.getContext('2d'), seed = 11;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    c.width = w; c.height = h;
    g.fillStyle = '#06111a'; g.fillRect(0, 0, w, h);
    var neb = g.createRadialGradient(w * 0.2, h * 0.15, 0, w * 0.2, h * 0.15, Math.max(w, h) * 0.8);
    neb.addColorStop(0, 'rgba(80,90,170,.12)'); neb.addColorStop(1, 'rgba(6,17,26,0)'); g.fillStyle = neb; g.fillRect(0, 0, w, h);
    var n = Math.round(w * h / (3200 * G.dpr * G.dpr));
    for (var i = 0; i < n; i++) {
      var r = (0.3 + rnd() * rnd() * 1.1) * G.dpr, a = 0.2 + rnd() * 0.55, t = rnd();
      g.fillStyle = t < 0.07 ? 'rgba(255,212,121,' + a + ')' : t < 0.14 ? 'rgba(116,192,252,' + a + ')' : 'rgba(219,231,239,' + a + ')';
      g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, TAU); g.fill();
    }
    BG = c;
  }
  // faint stars along the ecliptic for the strip (fixed among the stars, so planets move past them)
  var STRIP_STARS = (function () { var s = 5, out = []; function r() { s = (s * 16807) % 2147483647; return s / 2147483647; } for (var i = 0; i < 300; i++) out.push([r() * 360, (r() - 0.5) * 17, 0.25 + r() * r() * 1.1, 0.25 + r() * 0.5]); return out; })();
  // bright stars: name, right ascension (h), declination (deg), magnitude; J2000
  var STARS = [['Sirius', 6.75247, -16.7161, -1.46], ['Canopus', 6.39919, -52.6958, -0.74], ['Alpha Centauri', 14.66014, -60.8339, -0.27], ['Arcturus', 14.26103, 19.1825, -0.05],
    ['Vega', 18.61564, 38.7836, 0.03], ['Capella', 5.27817, 45.9981, 0.08], ['Rigel', 5.24231, -8.2017, 0.13], ['Procyon', 7.65503, 5.225, 0.34], ['Achernar', 1.62856, -57.2367, 0.46],
    ['Betelgeuse', 5.91953, 7.4069, 0.5], ['Altair', 19.84639, 8.8683, 0.76], ['Aldebaran', 4.59867, 16.5092, 0.86], ['Antares', 16.49014, -26.4319, 0.96], ['Spica', 13.41989, -11.1614, 0.97],
    ['Pollux', 7.75525, 28.0261, 1.14], ['Fomalhaut', 22.96083, -29.6222, 1.16], ['Deneb', 20.69053, 45.2803, 1.25], ['Regulus', 10.13953, 11.9672, 1.35], ['Polaris', 2.53031, 89.2642, 1.98]];
  STARS.forEach(function (s) { var e = N.eqToEcl(s[1] * 15, s[2], K.OBL_J2000); s.push(e.lon, e.lat); });
  var ECL_STARS = STARS.filter(function (s) { return Math.abs(s[5]) < 8; });

  /* ---------- drawing helpers ---------- */
  function glow(x, y, r, col, k) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r * (k || 3.5));
    g.addColorStop(0, col); g.addColorStop(0.3, col + '55'); g.addColorStop(1, col + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * (k || 3.5), 0, TAU); ctx.fill();
  }
  function dot(x, y, r, col, gl) { if (gl) glow(x, y, r, col); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  function font(px, bold) { ctx.font = (bold ? '600 ' : '') + px + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; }
  function label(t, x, y, col, align, px, bold) {
    font(px || 12, bold); align = align || 'left'; ctx.textAlign = align; ctx.textBaseline = 'middle';
    var tw = ctx.measureText(t).width, x0 = align === 'left' ? x : align === 'right' ? x - tw : x - tw / 2;
    if (x0 < 4) x += 4 - x0; else if (x0 + tw > G.w - 4) x -= x0 + tw - G.w + 4;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(6,17,26,.85)'; ctx.strokeText(t, x, y);
    ctx.fillStyle = col || C.muted; ctx.fillText(t, x, y);
  }
  function small() { return G.w < 520; }
  /* The lit part of a disk: k = lit fraction, rot = screen angle (rad) of the direction toward the Sun. */
  function litPath(x, y, r, k, rot) {
    var ci = clamp(2 * k - 1, -1, 1), n = 28;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    for (var j = 0; j <= n; j++) { var yy = r - 2 * r * j / n, xx = -r * ci * Math.sqrt(Math.max(0, 1 - yy * yy / (r * r))); ctx.lineTo(xx, yy); }
    ctx.closePath(); ctx.restore();
  }
  function moonDisk(x, y, r, k, rot, dark) {
    ctx.fillStyle = dark || '#26313c'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    litPath(x, y, r, k, rot); ctx.fillStyle = '#e4e9ee'; ctx.fill();
  }
  function halfLit(x, y, r, rot, col, darkCol) {
    ctx.fillStyle = darkCol || '#1a2733'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, rot - Math.PI / 2, rot + Math.PI / 2); ctx.closePath(); ctx.fill();
  }

  /* ---------- the Moon's face (stylized near side, north up) ---------- */
  var MOONTEX = null;
  function moonTexture(r) {
    var size = Math.round(2 * r * G.dpr);
    if (MOONTEX && MOONTEX.width === size) return MOONTEX;
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), R = size / 2;
    var base = g.createRadialGradient(R * 0.85, R * 0.8, R * 0.1, R, R, R);
    base.addColorStop(0, '#eef1f4'); base.addColorStop(0.75, '#d3d9df'); base.addColorStop(1, '#aab3bc');
    g.fillStyle = base; g.beginPath(); g.arc(R, R, R, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(R, R, R, 0, TAU); g.clip();
    var MARIA = [[-0.30, -0.38, 0.26, 0.22], [0.18, -0.38, 0.15, 0.13], [0.32, -0.12, 0.19, 0.16], [0.66, -0.30, 0.11, 0.09], [0.55, 0.13, 0.13, 0.10], [0.40, 0.31, 0.09, 0.08],
      [-0.57, -0.08, 0.30, 0.38], [-0.15, 0.36, 0.16, 0.12], [-0.48, 0.38, 0.09, 0.08], [-0.05, -0.68, 0.36, 0.06], [0.02, -0.15, 0.08, 0.07], [-0.72, 0.18, 0.12, 0.2]];
    MARIA.forEach(function (m, i) {
      [[1.12, 0.12], [1, 0.2], [0.82, 0.16], [0.6, 0.1]].forEach(function (pass) {
        g.fillStyle = 'rgba(112,122,136,' + pass[1] * (1 + (i % 3) * 0.12) + ')';
        g.beginPath();
        for (var k = 0; k <= 36; k++) {
          var a = TAU * k / 36, w = pass[0] * (1 + 0.14 * Math.sin(3 * a + i) + 0.08 * Math.cos(5 * a + 2 * i));
          var xx = R + (m[0] + m[2] * w * Math.cos(a)) * R, yy = R + (m[1] + m[3] * w * Math.sin(a)) * R;
          if (k) g.lineTo(xx, yy); else g.moveTo(xx, yy);
        }
        g.fill();
      });
    });
    var seed = 3; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 34; i++) {
      var a = rnd() * TAU, d = Math.sqrt(rnd()) * 0.95, cr = (0.01 + rnd() * rnd() * 0.04) * R;
      var cx = R + Math.cos(a) * d * R, cy = R + Math.sin(a) * d * R;
      g.strokeStyle = 'rgba(90,100,110,.22)'; g.lineWidth = Math.max(1, cr * 0.25); g.beginPath(); g.arc(cx, cy, cr, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.arc(cx + cr * 0.15, cy + cr * 0.15, cr, Math.PI * 0.1, Math.PI * 0.9); g.stroke();
    }
    // Tycho and its rays
    var tx = R - 0.12 * R, ty = R + 0.7 * R;
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = Math.max(1, R * 0.008);
    for (var j = 0; j < 14; j++) { var ang = TAU * j / 14 + 0.2; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + Math.cos(ang) * R * (0.4 + (j % 3) * 0.25), ty + Math.sin(ang) * R * (0.4 + (j % 3) * 0.25)); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(tx, ty, R * 0.025, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(R - 0.25 * R, R - 0.1 * R, R * 0.02, 0, TAU); g.fill();
    g.restore();
    MOONTEX = c; return c;
  }

  /* ========== SOLAR SYSTEM (orrery) ========== */
  var SPREAD_K = 0.25, SPREAD_MAX = Math.log(1 + 31 / SPREAD_K);
  function fr(r) { return Math.log(1 + r / SPREAD_K) / SPREAD_MAX; }
  function stripH() { return S.view === 'orrery' ? (small() ? 82 : 96) : 0; }
  function mainBox() { return { w: G.w, h: G.h - stripH() }; }
  function fitScale(which) {
    var b = mainBox(), half = Math.min(b.w, b.h) / 2 - 22, spread = S.scale === 'spread';
    var ext = which === 'inner' ? (spread ? fr(1.7) * 1.06 : 1.72) : (spread ? 1.0 : 31);
    return half / ext;
  }
  function setZoom(which, instant) {
    S.zoom = which; store.set('zoom', which);
    S.cam.sT = fitScale(which); S.cam.px = 0; S.cam.py = 0;
    if (instant || reduced) S.cam.s = S.cam.sT;
    syncSegs();
  }
  function W2S(x, y, out) {
    if (S.scale === 'spread') { var r = Math.sqrt(x * x + y * y); if (r > 0) { var k = fr(r) / r; x *= k; y *= k; } }
    var b = mainBox();
    out = out || {}; out.x = b.w / 2 + S.cam.px + x * S.cam.s; out.y = b.h / 2 + S.cam.py - y * S.cam.s; return out;
  }
  function orbitPaths() {
    var key = Math.round(S.jd / 365.25);
    if (S.orbitCache && S.orbitCache.key === key) return S.orbitCache.paths;
    var paths = [];
    for (var i = 0; i < 8; i++) paths.push(N.orbitPath(i, S.jd, 200));
    S.orbitCache = { key: key, paths: paths }; return paths;
  }
  var P0 = {}, P1 = {};
  function drawOrrery(dt) {
    var b = mainBox(), sn = S.snap, paths = orbitPaths(), spread = S.scale === 'spread';
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, b.w, b.h); ctx.clip();
    // orbits
    if (S.orbits) {
      for (var i = 0; i < 8; i++) {
        var p = paths[i]; ctx.beginPath();
        for (var k = 0; k < p.length; k++) { W2S(p[k].x, p[k].y, P0); if (k) ctx.lineTo(P0.x, P0.y); else ctx.moveTo(P0.x, P0.y); }
        ctx.strokeStyle = PC[i] + (i === S.watch ? '99' : i === 2 ? '77' : '44'); ctx.lineWidth = i === S.watch || i === 2 ? 1.4 : 1; ctx.stroke();
      }
    }
    // the Sun
    var sun = W2S(0, 0, {});
    glow(sun.x, sun.y, 9, '#ffd479', 4.5); dot(sun.x, sun.y, 8, '#fff1c4');
    // motion streaks behind each planet
    for (var j = 0; j < 8; j++) {
      var per = N.siderealPeriod(j), span = per * 0.08, prev = null;
      for (var s2 = 0; s2 <= 12; s2++) {
        var jd = S.jd - span * (1 - s2 / 12); N.helio(j, jd, P1); var q = W2S(P1.x, P1.y, {});
        if (prev) { ctx.strokeStyle = PC[j] + (s2 < 4 ? '22' : s2 < 8 ? '55' : '99'); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        prev = q;
      }
    }
    // sight lines from Earth (true distances only)
    var E = W2S(sn.earth.x, sn.earth.y, {});
    if (S.watch >= 0 && !spread) {
      var w = S.watch, Pw = W2S(sn.helio[w].x, sn.helio[w].y, {}), g = sn.geo[w];
      var dx = Pw.x - E.x, dy = Pw.y - E.y, L0 = Math.hypot(dx, dy) || 1, ext = Math.hypot(b.w, b.h);
      ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
      ctx.strokeStyle = PC[w] + 'aa'; ctx.beginPath(); ctx.moveTo(E.x, E.y); ctx.lineTo(E.x + dx / L0 * ext, E.y + dy / L0 * ext); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,212,121,.6)'; ctx.beginPath(); ctx.moveTo(E.x, E.y); ctx.lineTo(sun.x, sun.y); ctx.stroke();
      ctx.setLineDash([]);
      var a1 = Math.atan2(dy, dx), a2 = Math.atan2(sun.y - E.y, sun.x - E.x), da = Math.atan2(Math.sin(a1 - a2), Math.cos(a1 - a2)), rr = 26;
      ctx.strokeStyle = 'rgba(255,212,121,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(E.x, E.y, rr, a2, a2 + da, da < 0); ctx.stroke();
      var am = a2 + da / 2; label(Math.round(g.elong) + '°', E.x + Math.cos(am) * (rr + 13), E.y + Math.sin(am) * (rr + 13), C.gold, 'center', 12, true);
    }
    // planets
    var placed = [];
    for (var m = 0; m < 8; m++) {
      var h = sn.helio[m], P = W2S(h.x, h.y, {}), r = PR[m];
      if (m === 5) { ctx.strokeStyle = 'rgba(243,217,139,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(P.x, P.y, r * 2, r * 0.75, -0.35, 0, TAU); ctx.stroke(); }
      dot(P.x, P.y, r, PC[m], true);
      if (m === 2) {
        // the Moon beside Earth: true direction, distance not to scale
        var mo = sn.moon, mr = Math.hypot(mo.x, mo.y) || 1, mR = 11;
        ctx.strokeStyle = 'rgba(219,231,239,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(P.x, P.y, mR, 0, TAU); ctx.stroke();
        dot(P.x + mo.x / mr * mR, P.y - mo.y / mr * mR, 2, '#dfe6ee');
      }
      if (m === S.watch) { ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(P.x, P.y, r + 6, 0, TAU); ctx.stroke(); }
      if (S.labels && P.x > -10 && P.x < b.w + 10 && P.y > -10 && P.y < b.h + 10) {
        var lx = P.x + r + 5, ly = P.y - r - 5, tooClose = Math.hypot(P.x - sun.x, P.y - sun.y) < 16;
        for (var t = 0; t < placed.length && !tooClose; t++) if (Math.abs(placed[t][0] - lx) < 44 && Math.abs(placed[t][1] - ly) < 13) tooClose = true;
        if (!tooClose || m === S.watch || m === 2) { label(NAMES[m], lx, ly, PC[m], 'left', small() ? 11 : 12, m === S.watch); placed.push([lx, ly]); }
      }
    }
    // longitude marks around the edge, so the top view and the strip can be compared
    var cx0 = b.w / 2 + S.cam.px, cy0 = b.h / 2 + S.cam.py;
    font(10); ctx.fillStyle = 'rgba(143,179,198,.55)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var aa = 0; aa < 360; aa += 30) {
      var ca = Math.cos(aa * D2R), sa = -Math.sin(aa * D2R), tt = Infinity;
      if (ca > 1e-6) tt = Math.min(tt, (b.w - 14 - cx0) / ca); if (ca < -1e-6) tt = Math.min(tt, (14 - cx0) / ca);
      if (sa > 1e-6) tt = Math.min(tt, (b.h - 34 - cy0) / sa); if (sa < -1e-6) tt = Math.min(tt, (10 - cy0) / sa);
      if (tt > 30 && isFinite(tt)) ctx.fillText(aa + '°', cx0 + ca * tt, cy0 + sa * tt);
    }
    // scale note
    var note = spread ? 'Spread out: distances squeezed, directions true' : 'Distances to scale · planets drawn bigger';
    label(note, 12, b.h - 14, C.muted, 'left', 11);
    if (!spread) {
      var au = S.cam.s, step = au > 120 ? 0.5 : au > 40 ? 1 : au > 12 ? 5 : 10, len = step * au;
      while (len > b.w * 0.3) { step /= 2; len = step * au; }
      var bx = b.w - 14 - len, by = b.h - 14;
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + len, by); ctx.lineTo(bx + len, by - 4); ctx.stroke();
      label(step + ' au', bx + len / 2, by - 10, C.muted, 'center', 11);
    }
    ctx.restore();
    drawStrip(b.h, stripH(), dt);
  }

  /* ---------- the sky strip: the ecliptic as seen from Earth ---------- */
  function drawStrip(y0, hS, dt) {
    var sn = S.snap, w = G.w, mid = y0 + hS / 2 + 3, latK0 = (hS - 34) / 2 / 8.5, latKT = latK0, latCT = 0;
    var g = ctx.createLinearGradient(0, y0, 0, y0 + hS); g.addColorStop(0, 'rgba(3,9,15,.94)'); g.addColorStop(1, 'rgba(10,22,34,.97)');
    ctx.fillStyle = g; ctx.fillRect(0, y0, w, hS);
    ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(0, y0 + 0.5); ctx.lineTo(w, y0 + 0.5); ctx.stroke();
    var watch = S.watch, spanT = 360, target = 180;
    var trail = null;
    if (watch >= 0) {
      trail = [];
      var cur = sn.geo[watch].lon, lo = 0, hi = 0;
      for (var k = 0; k <= 75; k++) { var p = geoFast(watch, S.jd - 150 + 2 * k); trail.push(p); var dd = N.norm180(p.lon - cur); if (dd < lo) lo = dd; if (dd > hi) hi = dd; }
      target = N.norm360(cur + (lo + hi) / 2); spanT = clamp((hi - lo) * 1.15 + 26, 50, 360);
      var bmin = Infinity, bmax = -Infinity; trail.forEach(function (q) { if (q.lat < bmin) bmin = q.lat; if (q.lat > bmax) bmax = q.lat; });
      latCT = (bmin + bmax) / 2; latKT = (hS - 44) / Math.max(2.5, (bmax - bmin) * 1.35);
    }
    var diff = N.norm180(target - S.stripC), k2 = 1 - Math.exp(-dt * 2.5);
    if (S.stripSnap || Math.abs(diff) > 40 || reduced) { S.stripC = target; S.stripSpan = spanT; S.latC = latCT; S.latK = latKT; S.stripSnap = false; }
    else { S.stripC = N.norm360(S.stripC + diff * k2); S.stripSpan += (spanT - S.stripSpan) * k2; S.latC += (latCT - S.latC) * k2; S.latK += (latKT - S.latK) * k2; }
    var span = S.stripSpan, c0 = S.stripC, pxd = (w - 24) / span, latK = S.latK, latC = S.latC;
    function X(lon) { return w / 2 - N.norm180(lon - c0) * pxd; }
    function Y(lat) { return clamp(mid - (lat - latC) * latK, y0 + 18, y0 + hS - 26); }
    function Yt(lat) { return mid - (lat - latC) * latK; }
    function vis(lon) { return Math.abs(N.norm180(lon - c0)) <= span / 2 + 2; }
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0 + 1, w, hS - 1); ctx.clip();
    // background stars, the ecliptic line and longitude ticks
    STRIP_STARS.forEach(function (s) { if (!vis(s[0])) return; ctx.fillStyle = 'rgba(219,231,239,' + s[3] + ')'; ctx.beginPath(); ctx.arc(X(s[0]), mid - s[1] / 2 * latK0, s[2], 0, TAU); ctx.fill(); });
    ctx.strokeStyle = 'rgba(255,212,121,.18)'; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(0, Yt(0)); ctx.lineTo(w, Yt(0)); ctx.stroke(); ctx.setLineDash([]);
    var tick = span > 100 ? 30 : 10;
    font(10); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (var a = 0; a < 360; a += tick) { if (!vis(a)) continue; var x = X(a); ctx.fillStyle = 'rgba(143,179,198,.6)'; ctx.fillRect(x, y0 + hS - 6, 1, 6); if (span > 100 ? a % 60 === 0 : true) ctx.fillText(a + '°', x, y0 + hS - 8); }
    ECL_STARS.forEach(function (s) { if (!vis(s[4])) return; var x = X(s[4]), y = Y(s[5]); dot(x, y, 1.8, '#ffffff'); if (!small() || span < 100) label(s[0], x + 4, y - 7, 'rgba(219,231,239,.6)', 'left', 10); });
    // the Sun, with its glare
    var su = sn.sun;
    if (vis(su.lon)) { var xs = X(su.lon); glow(xs, Y(su.lat), 8, '#ffd479', 4); dot(xs, Y(su.lat), 7, '#fff1c4'); label('Sun', xs, Y(su.lat) + 17, C.gold, 'center', 11, true); }
    // the Moon
    var mo = sn.moon, mp = sn.phase;
    if (vis(mo.lon)) { var xm = X(mo.lon), ym = Y(mo.lat); moonDisk(xm, ym, 5, mp.k, N.norm180(su.lon - mo.lon) > 0 ? Math.PI : 0); label('Moon', xm, ym - 12, '#dfe6ee', 'center', 10); }
    // trails
    if (trail) {
      for (var t = 1; t < trail.length; t++) {
        var A = trail[t - 1], B = trail[t]; if (Math.abs(N.norm180(A.lon - B.lon)) > 20) continue;
        ctx.strokeStyle = PC[watch] + (t < 25 ? '40' : t < 50 ? '80' : 'cc'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(A.lon), Yt(A.lat)); ctx.lineTo(X(B.lon), Yt(B.lat)); ctx.stroke();
        if (t % 5 === 0) dot(X(B.lon), Yt(B.lat), 1.6, PC[watch] + 'cc');
      }
    }
    // planets
    for (var i = 0; i < 8; i++) {
      if (i === 2) continue;
      var gp = sn.geo[i]; if (!vis(gp.lon)) continue;
      var xp = X(gp.lon), yp = i === watch ? Yt(gp.lat) : Y(gp.lat), back = S.rate[i] < 0, big = i === watch;
      if (!trail) { var tp = geoFast(i, S.jd - 30); if (Math.abs(N.norm180(tp.lon - gp.lon)) < 30) { ctx.strokeStyle = PC[i] + '55'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(tp.lon), Y(tp.lat)); ctx.lineTo(xp, yp); ctx.stroke(); } }
      dot(xp, yp, big ? 4.5 : 3.2, PC[i], true);
      if (S.labels || big) label(NAMES[i], xp, yp - 11, PC[i], 'center', small() ? 10 : 11, big);
      if (back && (big || span < 100 || i === 3)) label('backwards', xp, yp + 12, C.pink, 'center', 10);
    }
    ctx.restore();
    label('← east', 8, y0 + 11, C.muted, 'left', 10); label('west →', w - 8, y0 + 11, C.muted, 'right', 10);
    if (!small()) label(watch >= 0 ? NAMES[watch] + ' seen from Earth, last 150 days' + (latK > pxd * 1.2 ? ' (up and down stretched)' : '') : 'The sky seen from Earth, along the ecliptic', w / 2, y0 + 11, C.muted, 'center', 10);
  }

  /* ========== MOON ========== */
  function moonLayout() {
    var w = G.w, h = G.h, land = w > h * 1.12;
    if (land) return { pic: { x: 0, y: 0, w: w * 0.46, h: h }, dia: { x: w * 0.46, y: 0, w: w * 0.54, h: h } };
    return { pic: { x: 0, y: 36, w: w, h: h * 0.40 }, dia: { x: 0, y: 36 + h * 0.40, w: w, h: h * 0.60 - 36 } };
  }
  function drawMoon() {
    var lay = moonLayout(), sn = S.snap, ph = sn.phase, pic = lay.pic, dia = lay.dia;
    // --- the Moon as seen from Earth ---
    var pr = Math.min(pic.w, pic.h) * 0.3, px = pic.x + pic.w / 2, py = pic.y + pic.h / 2 - (G.w > G.h * 1.12 ? 10 : 6);
    var rot = (ph.waxing ? 0 : Math.PI) + (S.south ? Math.PI : 0);
    var g = ctx.createRadialGradient(px, py, pr * 0.8, px, py, pr * 2.2); g.addColorStop(0, 'rgba(219,231,239,' + (0.05 + 0.13 * ph.k) + ')'); g.addColorStop(1, 'rgba(219,231,239,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr * 2.2, 0, TAU); ctx.fill();
    var tex = moonTexture(pr);
    ctx.save(); ctx.translate(px, py); if (S.south) ctx.rotate(Math.PI);
    ctx.fillStyle = '#0b141c'; ctx.beginPath(); ctx.arc(0, 0, pr, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.12; ctx.drawImage(tex, -pr, -pr, 2 * pr, 2 * pr); ctx.globalAlpha = 1;
    ctx.restore();
    ctx.save(); litPath(px, py, pr, ph.k, rot); ctx.clip();
    ctx.translate(px, py); if (S.south) ctx.rotate(Math.PI); ctx.drawImage(tex, -pr, -pr, 2 * pr, 2 * pr); ctx.restore();
    var nm = phaseName(ph.D);
    label(nm, px, py + pr + 22, C.gold, 'center', small() ? 15 : 17, true);
    label(Math.round(ph.k * 100) + '% lit · seen from the ' + (S.south ? 'Southern' : 'Northern') + ' Hemisphere', px, py + pr + 42, C.muted, 'center', 11);
    // --- the view from above ---
    var land = G.w > G.h * 1.12, cx = dia.x + dia.w / 2 - Math.min(dia.w, dia.h) * 0.04, cy = dia.y + dia.h / 2 + (land ? 4 : -4), R = Math.min(dia.w * 0.33, dia.h * (land ? 0.34 : 0.29));
    var sunX = dia.x + dia.w - 10;
    for (var k = -3; k <= 3; k++) {
      var yy = cy + k * R * 0.36;
      ctx.strokeStyle = 'rgba(255,212,121,' + (0.18 - Math.abs(k) * 0.025) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sunX, yy); ctx.lineTo(cx + R + 30, yy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + R + 30, yy); ctx.lineTo(cx + R + 36, yy - 3); ctx.moveTo(cx + R + 30, yy); ctx.lineTo(cx + R + 36, yy + 3); ctx.stroke();
    }
    label('Sunlight', sunX - 2, cy - R * 1.2, C.gold, 'right', 11, true);
    ctx.strokeStyle = 'rgba(219,231,239,.22)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    var short = ['New', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
    for (var q = 0; q < 8; q++) {
      var a = q * 45 * D2R, gx = cx + R * Math.cos(a), gy = cy - R * Math.sin(a);
      halfLit(gx, gy, 7, 0, 'rgba(228,233,238,.55)', 'rgba(26,39,51,.9)');
      var lr = R + (small() ? 20 : 26), lx = cx + lr * Math.cos(a), ly = cy - lr * Math.sin(a), words = short[q].split(' ');
      var al = Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center';
      if (Math.cos(a) > 0.3) lx -= 8; if (Math.cos(a) < -0.3) lx += 8;
      words.forEach(function (wd, wi) { label(wd, lx, ly + (wi - (words.length - 1) / 2) * 12, 'rgba(219,231,239,.7)', al, small() ? 10 : 11); });
    }
    // Earth, lit on the Sun's side
    halfLit(cx, cy, 13, 0, '#74c0fc', '#1b3550'); glow(cx, cy, 13, '#74c0fc', 2);
    label('Earth', cx, cy + 24, C.blue, 'center', 11, true);
    // the real Moon
    var A = ph.D * D2R, mx = cx + R * Math.cos(A), my = cy - R * Math.sin(A);
    ctx.strokeStyle = 'rgba(99,230,190,.6)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);
    glow(mx, my, 11, '#dfe6ee', 2.4); halfLit(mx, my, 11, 0, '#eef1f4', '#2a3642');
    ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, 16, 0, TAU); ctx.stroke();
    // which way it moves
    var a2 = A + 0.32; ctx.strokeStyle = 'rgba(99,230,190,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, -(A + 0.13), -a2, true); ctx.stroke();
    var tx = cx + R * Math.cos(a2), ty = cy - R * Math.sin(a2), dx = -Math.sin(a2), dy = -Math.cos(a2);
    ctx.beginPath(); ctx.moveTo(tx + dx * 6, ty + dy * 6); ctx.lineTo(tx - dy * 4, ty + dx * 4); ctx.lineTo(tx + dy * 4, ty - dx * 4); ctx.closePath(); ctx.fillStyle = 'rgba(99,230,190,.8)'; ctx.fill();
    label('View from above the North Pole · drag the Moon', dia.x + dia.w / 2, dia.y + dia.h - 12, C.muted, 'center', 10);
    S.moonGeo = { cx: cx, cy: cy, R: R, mx: mx, my: my };
  }

  /* ========== ECLIPSES ========== */
  function yearData(y) {
    if (S.ycache && S.ycache.y === y) return S.ycache;
    var a = new Date(y, 0, 1).getTime(), b = new Date(y + 1, 0, 1).getTime(), ja = N.jdTT(a), jb = N.jdTT(b);
    var lat = [], season = [], n = Math.round((jb - ja) * 2);
    for (var k = 0; k <= n; k++) lat.push(N.moon(ja + k / 2).lat);
    for (var d = 0; d <= Math.ceil(jb - ja); d++) {
      var jd = ja + d, ls = sunFast(jd), nd = N.toJ2000(N.moonNodeDate(jd), 0, jd).lon, dn = Math.abs(N.norm180(ls - nd));
      season.push(Math.min(dn, 180 - dn));
    }
    var ph = N.phasesBetween(ja - 2, jb + 2).filter(function (p) { return p.q === 0 || p.q === 2; }).map(function (p) { return { jd: p.jd, q: p.q, lat: N.moon(p.jd).lat }; });
    var ecl = N.eclipsesBetween(ja - 2, jb + 2);
    S.ycache = { y: y, a: a, b: b, ja: ja, jb: jb, lat: lat, season: season, ph: ph, ecl: ecl };
    return S.ycache;
  }
  function eclLayout() {
    var w = G.w, h = G.h, top = Math.round(h * (small() ? 0.5 : 0.55));
    return { top: { x: 0, y: 0, w: w, h: top }, chart: { x: small() ? 34 : 44, y: top + 26, w: w - (small() ? 46 : 60), h: h - top - 56 } };
  }
  function typeName(e) { return (e.type.charAt(0).toUpperCase() + e.type.slice(1)) + (e.solar ? ' solar eclipse' : ' lunar eclipse'); }
  function drawEclipse() {
    var lay = eclLayout(), T = lay.top, sn = S.snap, jd = S.jd;
    var ls = sn.sun.lon, nodeJ = N.toJ2000(N.moonNodeDate(jd), 0, jd).lon, inc = 5.145 * (S.tilt3 ? 3 : 1) * D2R, incT = 5.145 * D2R;
    var sc = Math.min(T.w * (small() ? 0.4 : 0.33), T.h * 0.62), cx = T.w * 0.55, cy = T.h * (small() ? 0.56 : 0.52);
    var az = S.ecam.az * D2R, el = S.ecam.el * D2R, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el), se = Math.sin(el);
    function P(x, y, z) { var X1 = x * ca - y * sa, Y1 = x * sa + y * ca; return { x: cx + X1 * sc, y: cy - (Y1 * se + z * ce) * sc, d: Y1 * ce - z * se }; }
    var phN = (nodeJ - ls + 180) * D2R, cN = Math.cos(phN), sN = Math.sin(phN);
    function ring(u, incl) { var x = Math.cos(u), y = Math.sin(u) * Math.cos(incl), z = Math.sin(u) * Math.sin(incl); return [x * cN - y * sN, x * sN + y * cN, z]; }
    // the Sun on the left, and its light
    var sunP = P(-2.4, 0, 0), sx = Math.max(-20, Math.min(sunP.x, T.w * 0.12)), sy = sunP.y;
    glow(sx, sy, 34, '#ffd479', 2.6); dot(sx, sy, 30, '#fff1c4'); label('Sun', Math.max(sx, 0) + 38, sy - 36, C.gold, 'left', 12, true);
    // the ecliptic plane
    ctx.beginPath();
    for (var k = 0; k <= 72; k++) { var q = P(1.45 * Math.cos(TAU * k / 72), 1.45 * Math.sin(TAU * k / 72), 0); if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
    ctx.fillStyle = 'rgba(116,192,252,.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(116,192,252,.3)'; ctx.lineWidth = 1; ctx.stroke();
    var pl = P(-1.3, -1.0, 0); label('ecliptic plane', pl.x, pl.y + 10, 'rgba(116,192,252,.75)', 'left', 11);
    // Earth's shadow (drawn short)
    var rE = S.tilt3 ? 0.085 : 0.04, rM = S.tilt3 ? 0.032 : 0.016;
    var s1 = P(0, rE, 0), s2 = P(0, -rE, 0), s3 = P(0, 0, rE), s4 = P(0, 0, -rE), tip = P(1.55, 0, 0);
    ctx.fillStyle = 'rgba(255,135,135,.06)'; ctx.strokeStyle = 'rgba(255,135,135,.22)';
    [[s1, s2], [s3, s4]].forEach(function (pp) { ctx.beginPath(); ctx.moveTo(pp[0].x, pp[0].y); ctx.lineTo(tip.x, tip.y); ctx.lineTo(pp[1].x, pp[1].y); ctx.closePath(); ctx.fill(); });
    ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(tip.x, tip.y); ctx.lineTo(s2.x, s2.y); ctx.stroke(); ctx.setLineDash([]);
    var tl = P(1.05, 0, 0); label('Earth’s shadow', tl.x, tl.y - 16, 'rgba(255,135,135,.8)', 'center', 11);
    // the Moon's orbit: below the plane dim and dashed, above it bright
    var prev = null;
    for (var u = 0; u <= 360; u += 3) {
      var r3 = ring(u * D2R, inc), p = P(r3[0], r3[1], r3[2]);
      if (prev) {
        var above = (u - 1.5) % 360 < 180;
        ctx.strokeStyle = above ? 'rgba(219,231,239,.85)' : 'rgba(219,231,239,.35)'; ctx.lineWidth = above ? 2 : 1.4;
        ctx.setLineDash(above ? [] : [4, 4]); ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      prev = p;
    }
    ctx.setLineDash([]);
    // line of nodes
    var nA = ring(0, inc), nD = ring(Math.PI, inc), pa = P(nA[0] * 1.3, nA[1] * 1.3, 0), pd = P(nD[0] * 1.3, nD[1] * 1.3, 0);
    ctx.strokeStyle = 'rgba(255,212,121,.55)'; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pd.x, pd.y); ctx.stroke(); ctx.setLineDash([]);
    var qa = P(nA[0], nA[1], 0), qd = P(nD[0], nD[1], 0);
    dot(qa.x, qa.y, 4, C.gold); dot(qd.x, qd.y, 4, C.gold);
    label('☊ ascending node', qa.x + 8, qa.y - 10, C.gold, 'left', 11); label('☋ descending node', qd.x + 8, qd.y + 12, C.gold, 'left', 11);
    // Earth
    var E0 = P(0, 0, 0), eR = rE * sc, sunDir = Math.atan2(sunP.y - E0.y, sunP.x - E0.x);
    glow(E0.x, E0.y, eR, '#74c0fc', 2.2); halfLit(E0.x, E0.y, Math.max(5, eR), sunDir, '#74c0fc', '#1b3550');
    label('Earth', E0.x, E0.y + Math.max(5, eR) + 12, C.blue, 'center', 11, true);
    // the Moon, placed on the drawn ring
    var dl = (sn.moon.lon - nodeJ) * D2R, um = Math.atan2(Math.sin(dl) / Math.cos(incT), Math.cos(dl)), mr = ring(um, inc), M = P(mr[0], mr[1], mr[2]), mR = Math.max(4, rM * sc);
    var now = S.now || {};
    // the Moon's shadow near new moon
    var D = sn.phase.D;
    if (D < 35 || D > 325) {
      var hit = now.solar, tipM = P(mr[0] + 1.25, mr[1], mr[2]);
      ctx.fillStyle = hit ? 'rgba(0,0,0,.55)' : 'rgba(255,212,121,.08)'; ctx.strokeStyle = hit ? 'rgba(255,212,121,.7)' : 'rgba(255,212,121,.35)';
      var m1 = P(mr[0], mr[1], mr[2] + rM), m2 = P(mr[0], mr[1], mr[2] - rM);
      ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.lineTo(tipM.x, tipM.y); ctx.lineTo(m2.x, m2.y); ctx.closePath(); ctx.fill(); ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      var lm = P(mr[0] * 0.5, mr[1] * 0.5, mr[2]); label(hit ? 'Moon’s shadow hits Earth' : 'Moon’s shadow misses Earth', lm.x, lm.y + (mr[2] >= 0 ? -16 : 16), C.gold, 'center', 11);
    }
    var red = now.lunar ? clamp(now.lunarDepth, 0, 1) : 0;
    glow(M.x, M.y, mR, '#dfe6ee', 2.4);
    halfLit(M.x, M.y, mR, Math.atan2(sunP.y - M.y, sunP.x - M.x), red ? 'rgb(' + Math.round(228 - 40 * red) + ',' + Math.round(233 - 140 * red) + ',' + Math.round(238 - 170 * red) + ')' : '#eef1f4', '#2a3642');
    ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(M.x, M.y, mR + 5, 0, TAU); ctx.stroke();
    label('Moon', M.x + mR + 8, M.y - 8, '#dfe6ee', 'left', 11, true);
    label((S.tilt3 ? 'Tilt drawn 3× bigger · ' : '') + 'sizes and distances not to scale · drag to turn', T.w - 10, T.h - 8, C.muted, 'right', 10);
    S.eclGeo = lay;
    drawEclChart(lay.chart);
  }
  function drawEclChart(B) {
    var d = new Date(S.ms), y = d.getFullYear(), Y = yearData(y), span = Y.jb - Y.ja;
    function X(jd) { return B.x + (jd - Y.ja) / span * B.w; }
    var lim = 6.2; function Yp(b) { return B.y + B.h / 2 - b / lim * B.h / 2; }
    ctx.fillStyle = 'rgba(3,9,15,.6)'; ctx.fillRect(B.x, B.y, B.w, B.h);
    // eclipse seasons
    var s0 = -1;
    for (var k = 0; k <= Y.season.length; k++) {
      var on = k < Y.season.length && Y.season[k] < 18.5;
      if (on && s0 < 0) s0 = k;
      if (!on && s0 >= 0) { var xa = X(Y.ja + s0), xb = X(Y.ja + k); ctx.fillStyle = 'rgba(255,212,121,.1)'; ctx.fillRect(xa, B.y, xb - xa, B.h); label('eclipse season', (xa + xb) / 2, B.y + 9, 'rgba(255,212,121,.75)', 'center', 10); s0 = -1; }
    }
    // the band close enough to the ecliptic
    ctx.fillStyle = 'rgba(99,230,190,.09)'; ctx.fillRect(B.x, Yp(1.5), B.w, Yp(-1.5) - Yp(1.5));
    ctx.strokeStyle = 'rgba(99,230,190,.35)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(B.x, Yp(1.5)); ctx.lineTo(B.x + B.w, Yp(1.5)); ctx.moveTo(B.x, Yp(-1.5)); ctx.lineTo(B.x + B.w, Yp(-1.5)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(219,231,239,.25)'; ctx.beginPath(); ctx.moveTo(B.x, Yp(0)); ctx.lineTo(B.x + B.w, Yp(0)); ctx.stroke();
    // axes
    font(10); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    [5, 0, -5].forEach(function (v) { ctx.fillText((v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + '°', B.x - 5, Yp(v)); });
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var MON = 'JFMAMJJASOND';
    for (var m = 0; m < 12; m++) { var jm = N.jdTT(new Date(y, m, 1).getTime()), xm = X(jm); ctx.fillStyle = 'rgba(143,179,198,.35)'; ctx.fillRect(xm, B.y + B.h - 4, 1, 4); ctx.fillStyle = C.muted; ctx.fillText(MON[m], X(jm + 15), B.y + B.h + 4); }
    label('Moon above or below the ecliptic, ' + y, B.x, B.y - 12, C.ink, 'left', 11, true);
    if (!small()) label('green band: close enough for an eclipse', B.x + B.w, B.y - 12, 'rgba(99,230,190,.8)', 'right', 10);
    // the Moon's path
    ctx.save(); ctx.beginPath(); ctx.rect(B.x, B.y, B.w, B.h); ctx.clip();
    ctx.strokeStyle = 'rgba(116,192,252,.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (var i = 0; i < Y.lat.length; i++) { var xx = X(Y.ja + i / 2), yy = Yp(Y.lat[i]); if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
    ctx.stroke();
    // new and full moons, and eclipses
    Y.ph.forEach(function (p) {
      var x = X(p.jd), yv = Yp(p.lat);
      if (p.q === 0) { ctx.fillStyle = '#0b141c'; ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, yv, 4, 0, TAU); ctx.fill(); ctx.stroke(); }
      else dot(x, yv, 4, '#eef1f4');
    });
    ctx.restore();
    Y.ecl.forEach(function (e) {
      if (e.jd < Y.ja || e.jd > Y.jb) return;
      var x = X(e.jd), yv = Yp(e.lat), col = e.solar ? C.gold : C.red;
      glow(x, yv, 6, col, 2.4); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, yv, 8, 0, TAU); ctx.stroke();
      var up = e.solar, words = small() ? [e.type, e.solar ? 'solar' : 'lunar'] : [typeName(e).replace(' eclipse', ''), niceDate(N.msFromJdTT(e.jd)).replace(/, \d+$/, '')];
      var yb = up ? Math.min(yv - 14, Yp(1.5) - 6) : Math.max(yv + 14, Yp(-1.5) + 6);
      words.forEach(function (wd, wi) { label(wd, x, yb + (up ? -(words.length - 1 - wi) * 12 : wi * 12), col, 'center', 10, wi === 0); });
    });
    // today
    var xc = X(S.jd);
    ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xc, B.y - 2); ctx.lineTo(xc, B.y + B.h + 2); ctx.stroke();
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.moveTo(xc - 6, B.y + B.h + 2); ctx.lineTo(xc + 6, B.y + B.h + 2); ctx.lineTo(xc, B.y + B.h - 6); ctx.closePath(); ctx.fill();
    dot(xc, Yp(S.snap.moon.lat), 3, C.green);
  }

  /* ========== TONIGHT ========== */
  function eveningSky() {
    var d = new Date(S.ms), Yr = d.getFullYear(), Mo = d.getMonth(), Dy = d.getDate();
    var key = Yr + '-' + Mo + '-' + Dy + '|' + S.lat + '|' + S.lon + '|' + S.eve;
    if (S.sky && S.sky.key === key) return S.sky;
    var guess = Date.UTC(Yr, Mo, Dy, S.eve ? 18 : 6) - S.lon / 15 * 3600000;
    var ev = N.sunEvent(guess, S.lat, S.lon, S.eve), ms, note;
    if (isFinite(ev)) { ms = ev + (S.eve ? 1 : -1) * 3600000; note = S.eve ? 'About 1 hour after sunset' : 'About 1 hour before sunrise'; }
    else {
      var mid = Date.UTC(Yr, Mo, Dy, S.eve ? 22 : 2) - S.lon / 15 * 3600000, sk0 = N.skyAt(mid, S.lat, S.lon), sunAlt = sk0.bodies[0].alt;
      ms = mid; note = sunAlt > 0 ? 'The Sun does not set today here (shown at ' + (S.eve ? '10 pm' : '2 am') + ' local time)' : 'The Sun does not rise today here (shown at ' + (S.eve ? '10 pm' : '2 am') + ' local time)';
    }
    var sky = N.skyAt(ms, S.lat, S.lon);
    S.sky = { key: key, ms: ms, ev: ev, note: note, sky: sky };
    return S.sky;
  }
  function drawTonight() {
    var E = eveningSky(), sky = E.sky, w = G.w, h = G.h;
    var R = Math.min(w * 0.45, (h - 92) / 2), cx = w / 2, spare = h - 92 - 2 * R, cy = spare > 120 ? 84 + R * 1.1 : 46 + R + spare / 2;
    function pos(alt, az) { var r = R * (90 - alt) / 90; return { x: cx - r * Math.sin(az * D2R), y: cy - r * Math.cos(az * D2R) }; }
    var sun = sky.bodies[0], sp = pos(sun.alt, sun.az);
    // sky color from the Sun's depth below the horizon, with a glow toward it
    var depth = clamp(-sun.alt / 18, 0, 1), top = 'rgba(' + Math.round(40 - 30 * depth) + ',' + Math.round(70 - 50 * depth) + ',' + Math.round(120 - 80 * depth) + ',1)';
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, top); g.addColorStop(1, 'rgba(' + Math.round(30 - 18 * depth) + ',' + Math.round(55 - 35 * depth) + ',' + Math.round(95 - 60 * depth) + ',1)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
    var tw = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, R * 1.1); tw.addColorStop(0, 'rgba(255,170,90,' + (0.55 * (1 - depth)) + ')'); tw.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = tw; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    // altitude rings
    ctx.strokeStyle = 'rgba(219,231,239,.12)'; ctx.lineWidth = 1;
    [30, 60].forEach(function (a) { ctx.beginPath(); ctx.arc(cx, cy, R * (90 - a) / 90, 0, TAU); ctx.stroke(); });
    // the ecliptic
    var jd = N.jdTT(E.ms), lst = sky.lst, prev = null;
    ctx.strokeStyle = 'rgba(255,212,121,.45)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.3;
    for (var l = 0; l <= 360; l += 3) {
      var eq = N.radecDate(l, 0, jd), hz = N.altAz(lst - eq.ra, eq.dec, S.lat);
      if (hz.alt > -2) { var p = pos(hz.alt, hz.az); if (prev) { ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke(); } prev = p; } else prev = null;
    }
    ctx.setLineDash([]);
    // bright stars
    STARS.forEach(function (s) {
      var eq = N.radecDate(s[4], s[5], jd), hz = N.altAz(lst - eq.ra, eq.dec, S.lat); if (hz.alt < 0) return;
      var p = pos(hz.alt, hz.az), r = clamp(2.3 - s[3] * 0.6, 0.9, 3.2), a = clamp(1 - depth * 0.2 - (1 - depth) * 0.6, 0.25, 0.95);
      ctx.fillStyle = 'rgba(255,255,255,' + a + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
      if (!small() || s[3] < 0.5) label(s[0], p.x + 5, p.y + 8, 'rgba(219,231,239,' + (a * 0.75) + ')', 'left', 10);
    });
    ctx.restore();
    // horizon and directions
    ctx.strokeStyle = 'rgba(219,231,239,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    var DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    DIRS.forEach(function (t, i) { var p = pos(-9, i * 45); label(t, p.x, p.y, i % 2 ? C.muted : C.ink, 'center', i % 2 ? 10 : 12, !(i % 2)); });
    // the Sun below the horizon
    if (sun.alt < 0) { var ep = pos(0, sun.az), ip = pos(8, sun.az); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ip.x, ip.y); ctx.lineTo(ep.x, ep.y); ctx.stroke(); dot(ep.x, ep.y, 3, C.gold); label('Sun ' + Math.round(-sun.alt) + '° below', ip.x, ip.y + (sun.az > 90 && sun.az < 270 ? -10 : 10), C.gold, 'center', 10); }
    // Moon and planets
    sky.bodies.forEach(function (b) {
      if (b.name === 'Sun' || b.alt < -0.5) return;
      var p = pos(Math.max(0, b.alt), b.az);
      if (b.name === 'Moon') {
        var rot = Math.atan2(sp.y - p.y, sp.x - p.x);
        glow(p.x, p.y, 8, '#dfe6ee', 2.4); moonDisk(p.x, p.y, 8, b.k, rot, '#3a4652'); label('Moon', p.x, p.y + 18, '#e4e9ee', 'center', 12, true);
        return;
      }
      var col = PC[b.idx], r = b.idx === 1 || b.idx === 4 ? 5 : 4;
      dot(p.x, p.y, r, col, true); label(b.name, p.x + r + 5, p.y - 2, col, 'left', 12, true);
      label(Math.round(b.alt) + '°', p.x + r + 5, p.y + 11, 'rgba(219,231,239,.7)', 'left', 10);
    });
    label('Overhead', cx, cy + 4, 'rgba(219,231,239,.3)', 'center', 10);
    // with room to spare below the circle (phones), list what is up
    var free = h - (cy + R + 22), up = sky.bodies.filter(function (b) { return b.name !== 'Sun' && b.alt >= 0; });
    if (free > 60) {
      var y0 = cy + R + 34;
      label(up.length ? 'Above the horizon:' : 'No planets or Moon above the horizon now.', 16, y0, C.ink, 'left', 12, true);
      up.slice(0, Math.floor((free - 30) / 17)).forEach(function (b, i) {
        label(b.name + ': ' + compass(b.az) + ', ' + Math.round(b.alt) + '° up', 16, y0 + 19 + i * 17, b.idx !== undefined ? PC[b.idx] : '#e4e9ee', 'left', 12);
      });
    }
  }

  /* ========== frame, readouts and HUD ========== */
  function currentEclipse(sn) {
    var m = sn.moon, s = sn.sun, R = s.r, dm = m.dist;
    var piM = Math.asin(K.R_EARTH / dm) * R2D, piS = 8.794143 / 3600 / R, sM = Math.asin(K.R_MOON / dm) * R2D, sS = 959.63 / 3600 / R;
    var gS = N.sep(m.lon, m.lat, s.lon, s.lat), gL = N.sep(m.lon, m.lat, s.lon + 180, -s.lat);
    var ru = 1.01 * piM + piS - sS;
    return { solar: gS < piM - piS + sM + sS, lunar: gL < ru + sM, lunarDepth: (ru + sM - gL) / (2 * sM) };
  }
  function refresh() {
    S.jd = N.jdTT(S.ms);
    S.snap = N.snapshot(S.jd);
    for (var i = 0; i < 8; i++) if (i !== 2) S.rate[i] = N.norm180(geoFast(i, S.jd + 0.5).lon - geoFast(i, S.jd - 0.5).lon);
    S.now = currentEclipse(S.snap);
  }
  function moonEvents() {
    var c = S.moonCache, jd = S.jd;
    if (!c || jd < c.prevNew || !c.list.length || jd > c.list[0].jd) {
      var prevNew = N.findPhase(jd, 0, -1), list = N.phasesBetween(jd, jd + 32);
      c = S.moonCache = { prevNew: prevNew, list: list };
    }
    return c;
  }
  function nextEclipse() {
    var c = S.eclNext, jd = S.jd;
    if (!c || jd < c.from || !c.list.length || jd > c.list[0].jd) { c = S.eclNext = { from: jd, list: N.eclipsesBetween(jd, jd + 400) }; }
    return c.list[0] || null;
  }
  var lastUI = 0, lastRead = '';
  function setRead(rows) {
    var sig = rows.map(function (r) { return r[0]; }).join('|');
    if (sig !== lastRead) { readEl.innerHTML = rows.map(function (r, i) { return '<dt>' + r[0] + '</dt><dd data-i="' + i + '"></dd>'; }).join(''); lastRead = sig; }
    var dds = readEl.querySelectorAll('dd'); rows.forEach(function (r, i) { if (dds[i] && dds[i].textContent !== r[1]) dds[i].textContent = r[1]; });
  }
  function setList(html) { if (listEl._h !== html) { listEl.innerHTML = html; listEl._h = html; } }
  function skyWord(g) { if (g.elong < 15) return 'lost in the Sun’s glare'; if (g.elong > 165) return 'up all night'; return (g.east ? 'evening' : 'morning') + ' sky'; }
  function uiTick(force) {
    var t = performance.now(); if (!force && t - lastUI < 180) return; lastUI = t;
    var sn = S.snap, playing = SPEEDS[S.speed] > 0;
    var b2 = '';
    if (S.view === 'orrery') {
      var rows = [['Earth to Sun', num(sn.sun.r, 4) + ' au']];
      if (S.watch >= 0) {
        var g = sn.geo[S.watch], nm = NAMES[S.watch];
        rows.push([nm + ' to Earth', num(g.r, 3) + ' au'], ['… in km', num(g.r * K.AU_KM / 1e6, 1) + ' million'], ['Light takes', num(g.r * K.AU_KM / 299792.458 / 60, 1) + ' min'],
          ['Angle from the Sun', deg(g.elong) + (g.elong > 3 ? (g.east ? ' east' : ' west') : '')], ['Seen from Earth', S.rate[S.watch] < 0 ? 'moving backwards' : 'moving forwards']);
        b2 = nm + ' is ' + Math.round(g.elong) + '° from the Sun, ' + (g.elong >= 15 && g.elong <= 165 ? 'in the ' : '') + skyWord(g) + (S.rate[S.watch] < 0 ? ' · moving backwards' : '');
      } else b2 = 'Click a planet to follow it from Earth.';
      if (S.race) rows.push(['Laps since you pressed play', 'Mercury ' + L.fmt(S.race.lap[0] / 360, 2) + ' · Earth ' + L.fmt(S.race.lap[2] / 360, 2)]);
      setRead(rows);
      var html = '<div class="lab-tw"><table class="lab-table ns-tab"><thead><tr><th>Planet</th><th>From Sun</th><th>In the sky</th></tr></thead><tbody>';
      for (var i = 0; i < 8; i++) {
        var h = sn.helio[i], r = Math.sqrt(h.x * h.x + h.y * h.y + h.z * h.z);
        html += '<tr' + (i === S.watch ? ' class="ns-on"' : '') + '><td><i class="ns-sw" style="background:' + PC[i] + '"></i>' + NAMES[i] + '</td><td>' + num(r, 2) + ' au</td><td>' + (i === 2 ? 'you are here' : skyWord(sn.geo[i]) + (S.rate[i] < 0 ? ', backwards' : '')) + '</td></tr>';
      }
      setList(html + '</tbody></table></div>');
    } else if (S.view === 'moon') {
      var ph = sn.phase, me = moonEvents(), age = S.jd - me.prevNew;
      setRead([['Phase', phaseName(ph.D)], ['Lit', Math.round(ph.k * 100) + '%'], ['Age', num(age, 1) + ' days since new moon'], ['Moon–Sun angle', ph.D <= 180 ? deg(ph.D) + ' east' : deg(360 - ph.D) + ' west'], ['Distance', num(sn.moon.dist, 0) + ' km']]);
      var QN = ['New moon', 'First quarter', 'Full moon', 'Last quarter'];
      setList('<p class="ns-lh">Coming up</p><ul class="ns-ul">' + me.list.slice(0, 4).map(function (p) { return '<li><b>' + QN[p.q] + '</b> ' + niceDT(N.msFromJdTT(p.jd)) + '</li>'; }).join('') + '</ul>');
      b2 = phaseName(ph.D) + ' · ' + Math.round(ph.k * 100) + '% lit · ' + num(age, 1) + ' days old';
    } else if (S.view === 'eclipse') {
      var nodeJ = N.toJ2000(N.moonNodeDate(S.jd), 0, S.jd).lon, dA = N.norm180(sn.sun.lon - nodeJ), dD = N.norm180(sn.sun.lon - nodeJ - 180);
      var near = Math.abs(dA) < Math.abs(dD) ? ['ascending', Math.abs(dA)] : ['descending', Math.abs(dD)];
      var Y = yearData(new Date(S.ms).getFullYear()), next = nextEclipse();
      setRead([['Moon above ecliptic', deg(sn.moon.lat, 2)], ['Sun to nearest node', deg(near[1]) + ' (' + near[0] + ')'], ['Eclipse season', near[1] < 18.5 ? 'yes' : 'no'], ['Next eclipse', next ? niceDate(N.msFromJdTT(next.jd)) : '—']]);
      var ys = Y.ecl.filter(function (e) { return e.jd >= Y.ja && e.jd < Y.jb; });
      setList('<p class="ns-lh">Eclipses in ' + Y.y + '</p><ul class="ns-ul">' + ys.map(function (e) { return '<li><b>' + typeName(e) + '</b> ' + niceDT(N.msFromJdTT(e.jd)) + '</li>'; }).join('') + '</ul>');
      b2 = S.now.solar ? 'Solar eclipse happening now (seen from part of Earth)' : S.now.lunar ? 'Lunar eclipse happening now: the Moon is in Earth’s shadow' : near[1] < 18.5 ? 'Eclipse season: the Sun is ' + Math.round(near[1]) + '° from the ' + near[0] + ' node' : 'The Sun is ' + Math.round(near[1]) + '° from the nearest node: no eclipses now';
    } else {
      var E = eveningSky(), place = Math.abs(S.lat) + '° ' + (S.lat >= 0 ? 'N' : 'S') + ', ' + Math.abs(S.lon) + '° ' + (S.lon >= 0 ? 'E' : 'W');
      var evT = isFinite(E.ev) ? (S.lon === tzLon ? niceTime(E.ev) + ' your time' : utStr(E.ev)) : '—';
      setRead([['Place', place], [S.eve ? 'Sunset' : 'Sunrise', evT], ['Sky shown at', S.lon === tzLon ? niceTime(E.ms) + ' your time' : utStr(E.ms)]]);
      var items = E.sky.bodies.filter(function (b) { return b.name !== 'Sun'; }).map(function (b) {
        var t;
        if (b.alt < 0) t = 'below the horizon';
        else if (b.alt < 10) t = 'low in the ' + compass(b.az) + ' (' + Math.round(b.alt) + '° up)' + (b.name === 'Mercury' ? ', hard to see in twilight' : '');
        else if (b.alt > 70) t = 'high overhead (' + Math.round(b.alt) + '° up)';
        else t = 'in the ' + compass(b.az) + ', ' + Math.round(b.alt) + '° up';
        return '<li' + (b.alt < 0 ? ' class="ns-dim"' : '') + '><b>' + b.name + '</b> ' + t + '</li>';
      });
      setList('<p class="ns-lh">What’s up</p><ul class="ns-ul">' + items.join('') + '</ul>');
      b2 = E.note + ' · ' + place;
    }
    var hh = '<b>' + niceDate(S.ms, true) + '</b> · ' + niceTime(S.ms) + (tzName ? ' ' + tzName : '') + '<br>' + (playing ? '▶ ' + SPEED_TXT[S.speed] + (S.rev ? ', backwards' : '') : 'Paused') + (b2 ? '<br><span class="ns-ctx">' + b2.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>' : '');
    if (hudA._h !== hh) { hudA.innerHTML = hh; hudA._h = hh; }
    syncDateInputs();
  }

  /* ---------- time ---------- */
  function setTime(ms, jump) {
    var c = clamp(ms, K.MIN_MS, K.MAX_MS);
    if (c !== ms && SPEEDS[S.speed]) { setSpeed('0'); L.toast(view, 'The orbit table covers 1800 to 2050 only.'); }
    S.ms = c;
    if (jump) { S.race = null; S.retroDays = 0; S.stripSnap = true; }
    refresh();
  }
  function setSpeed(k) {
    if (k !== '0') S.lastSpeed = k;
    S.speed = k; if (k !== '0' && !S.race && !S.rev) S.race = { lap: [0, 0, 0, 0, 0, 0, 0, 0], last: null };
    syncSegs(); uiTick(true);
  }
  function advance(dt) {
    var days = SPEEDS[S.speed] * dt * (S.rev ? -1 : 1), before = S.snap;
    setTime(S.ms + days * DAY, false);
    if (S.race && !S.rev) {
      for (var i = 0; i < 8; i++) {
        var a = before.helio[i], b = S.snap.helio[i];
        S.race.lap[i] += N.norm180((Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x)) * R2D);
      }
    }
    if (!S.rev && S.view === 'orrery' && S.rate[3] < 0) S.retroDays += Math.abs(days);
  }
  function syncDateInputs() {
    var ae = document.activeElement, d = new Date(S.ms), y = d.getFullYear();
    var dI = $('ns-date'), tI = $('ns-time'), yI = $('ns-year'), doy = $('ns-doy');
    if (ae !== dI && dI.value !== dateStr(S.ms)) dI.value = dateStr(S.ms);
    if (ae !== tI && tI.value !== timeStr(S.ms)) tI.value = timeStr(S.ms);
    if (ae !== yI && +yI.value !== y) yI.value = y;
    var start = new Date(y, 0, 1), dn = Math.round((new Date(y, d.getMonth(), d.getDate()) - start) / DAY), len = Math.round((new Date(y + 1, 0, 1) - start) / DAY);
    doy.max = len - 1; if (ae !== doy && +doy.value !== dn) doy.value = dn;
    $('ns-doy-o').textContent = niceDate(S.ms).replace(/, \d+$/, '');
  }
  function syncSegs() {
    function seg(id, attr, val) { $(id).querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(val))); }); }
    seg('ns-views', 'data-view', S.view); seg('ns-speed', 'data-speed', S.speed); seg('ns-scale', 'data-scale', S.scale); seg('ns-zoom', 'data-zoom', S.zoom); seg('ns-eve', 'data-eve', S.eve ? 1 : 0);
    $('ns-speed-o').textContent = SPEED_TXT[S.speed] + (S.rev && S.speed !== '0' ? ', backwards' : '');
    var pb = $('ns-play'), on = S.speed !== '0'; pb.textContent = on ? '❚❚' : '▶'; pb.setAttribute('aria-label', on ? 'Pause' : 'Play');
    $('ns-zin').hidden = $('ns-zout').hidden = S.view !== 'orrery';
    root.querySelectorAll('.ns-grp').forEach(function (g) { g.hidden = g.getAttribute('data-for').split(' ').indexOf(S.view) < 0; });
    $('ns-watch').value = String(S.watch);
  }
  var TIPS = {
    orrery: 'Press a speed and watch the planets go around. Click a planet (or choose it below) to follow it from Earth in the strip.',
    moon: 'Play at 1 day per second, or drag the Moon around Earth. The Sun lights the half that faces it.',
    eclipse: 'Drag along the chart to move through the year. Ringed dots are eclipses: new or full moons inside the green band.',
    tonight: 'Set your latitude and longitude. The circle is your whole sky; the edge is the horizon.'
  };
  function setView(v) {
    S.view = v; store.set('view', v); tipEl.textContent = TIPS[v]; lastRead = ''; listEl._h = '';
    if (v === 'orrery') setZoom(S.zoom || 'inner', true);
    syncSegs(); uiTick(true);
  }

  /* ---------- missions ---------- */
  var MIS = [
    { id: 'birthday', title: 'Your birthday sky', goal: 'Type a date from the past into the Date box (your birthday works) and see where the planets were.' },
    { id: 'full', title: 'Next full moon', goal: 'Find the next full moon after today, to within 6 hours.' },
    { id: 'race', title: 'Inner planets are faster', goal: 'Run time forward until Mercury has gone once around the Sun. How far did Earth get?' },
    { id: 'opp', title: 'Opposition', goal: 'Line up the Sun, Earth and an outer planet (Mars to Neptune), within 1°.' },
    { id: 'retro', title: 'Mars goes backwards', goal: 'In the Solar system view, run time forward for 15 days while Mars moves backwards among the stars.' },
    { id: 'venus', title: 'Venus at its farthest', goal: 'Stop within 3 days of a greatest elongation, when Venus is as far from the Sun as it gets.' },
    { id: 'eclipse', title: 'Line up an eclipse', goal: 'Set the time to within 12 hours of a solar or lunar eclipse.' }
  ];
  var M = L.missions($('ns-missions'), 'night-sky', MIS, pick);
  function win(id, text) { if (M.done(id)) L.toast(view, '★ ' + text); }
  function pick(id) {
    var tips = {
      birthday: 'Click the Date box above and type a date, such as your birthday.',
      full: 'Start from now and play at 1 day per second. Slow down to 1 hour per second near full.',
      race: 'Play at 1 week per second and watch the lap counter under Live numbers.',
      opp: 'Follow Jupiter and play. Opposition is when it is 180° from the Sun, up all night.',
      retro: 'Follow Mars in the strip at the bottom and play at 1 day per second.',
      venus: 'Watch Venus’s angle from the Sun in Live numbers. Pause when it stops growing.',
      eclipse: 'Drag the chart to a ringed dot. Use the arrow keys to step a day (Shift: an hour).'
    };
    if (id === 'birthday') { $('ns-date').focus(); }
    else if (id === 'full') { setView('moon'); setTime(nowMs, true); setSpeed('d'); }
    else if (id === 'race') { setView('orrery'); S.scale = 'true'; store.set('scale', 'true'); setZoom('inner'); S.race = null; setSpeed('w'); }
    else if (id === 'opp') { setView('orrery'); S.scale = 'true'; setZoom('all'); S.watch = 4; setSpeed('w'); }
    else if (id === 'retro') { setView('orrery'); S.scale = 'true'; setZoom('inner'); S.watch = 3; setTime(new Date(2026, 11, 1, 12).getTime(), true); setSpeed('d'); }
    else if (id === 'venus') { setView('orrery'); S.scale = 'true'; setZoom('inner'); S.watch = 1; setSpeed('w'); }
    else if (id === 'eclipse') { setView('eclipse'); setSpeed('0'); }
    syncSegs(); tipEl.textContent = tips[id]; L.toast(view, tips[id]);
    if (id !== 'birthday') { var r = view.getBoundingClientRect(); if (r.bottom < 60 || r.top > window.innerHeight - 60) view.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
  }
  var lastCheck = 0;
  function elongV(jd) { var s = N.geo('sun', jd), g = N.geo(1, jd); return N.sep(g.lon, g.lat, s.lon, s.lat); }
  function checkMissions() {
    var t = performance.now(); if (t - lastCheck < 250) return; lastCheck = t;
    var sn = S.snap, jd = S.jd;
    if (!M.isDone('full') && Math.abs(jd - nextFullJd) < 0.25) win('full', 'Full moon, ' + niceDT(N.msFromJdTT(nextFullJd)) + '. The Moon is opposite the Sun, so it rises as the Sun sets.');
    if (!M.isDone('race') && S.race && S.race.lap[0] >= 360) win('race', 'One Mercury year: 88 days. Earth only got ' + Math.round(S.race.lap[2]) + '° of the way around.');
    if (!M.isDone('opp')) for (var i = 3; i < 8; i++) if (Math.abs(N.norm180(sn.geo[i].lon - sn.sun.lon - 180)) < 1) { win('opp', NAMES[i] + ' is at opposition: Earth sits between it and the Sun, so it is up all night.'); break; }
    if (!M.isDone('retro') && S.retroDays >= 15) win('retro', 'Mars is going backwards! Earth is overtaking it on the inside lane.');
    if (!M.isDone('venus')) { var e0 = sn.geo[1].elong; if (e0 > 44 && e0 >= elongV(jd - 6) && e0 >= elongV(jd + 6)) win('venus', 'Greatest elongation: Venus is ' + deg(e0) + ' from the Sun, as far as it gets.'); }
    if (!M.isDone('eclipse')) {
      var Y = yearData(new Date(S.ms).getFullYear());
      Y.ecl.forEach(function (e) { if (Math.abs(e.jd - jd) < 0.5) win('eclipse', typeName(e) + '! The ' + (e.solar ? 'new' : 'full') + ' moon is right at a node.'); });
    }
  }
  function birthdayText() {
    var sn = S.snap, eve = [], morn = [];
    [0, 1, 3, 4, 5].forEach(function (i) { var g = sn.geo[i]; if (g.elong < 15) return; (g.east ? eve : morn).push(NAMES[i]); });
    function list(a) { return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]; }
    var t = 'On ' + niceDate(S.ms) + ': ' + phaseName(sn.phase.D).toLowerCase();
    if (eve.length) t += '; ' + list(eve) + ' in the evening sky';
    if (morn.length) t += '; ' + list(morn) + ' in the morning sky';
    return t + '.';
  }

  /* ---------- controls ---------- */
  $('ns-views').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setView(b.getAttribute('data-view')); });
  $('ns-speed').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setSpeed(b.getAttribute('data-speed')); });
  $('ns-scale').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.scale = b.getAttribute('data-scale'); store.set('scale', S.scale); setZoom(S.zoom); });
  $('ns-zoom').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setZoom(b.getAttribute('data-zoom')); });
  $('ns-eve').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.eve = b.getAttribute('data-eve') === '1'; store.set('eve', S.eve); syncSegs(); uiTick(true); });
  $('ns-rev').addEventListener('change', function () { S.rev = this.checked; S.race = null; syncSegs(); });
  $('ns-play').addEventListener('click', function () { setSpeed(S.speed === '0' ? S.lastSpeed : '0'); });
  $('ns-now').addEventListener('click', function () { setTime(Date.now(), true); uiTick(true); });
  $('ns-today').addEventListener('click', function () { setTime(Date.now(), true); uiTick(true); });
  $('ns-zin').addEventListener('click', function () { zoomBy(1.4); });
  $('ns-zout').addEventListener('click', function () { zoomBy(1 / 1.4); });
  $('ns-watch').addEventListener('change', function () { S.watch = +this.value; store.set('watch', S.watch); S.stripSnap = true; });
  $('ns-orbits').checked = S.orbits; $('ns-labels').checked = S.labels; $('ns-south').checked = S.south; $('ns-tilt').checked = S.tilt3;
  $('ns-orbits').addEventListener('change', function () { S.orbits = this.checked; store.set('orbits', S.orbits); });
  $('ns-labels').addEventListener('change', function () { S.labels = this.checked; store.set('labels', S.labels); });
  $('ns-south').addEventListener('change', function () { S.south = this.checked; store.set('south', S.south); });
  $('ns-tilt').addEventListener('change', function () { S.tilt3 = this.checked; store.set('tilt3', S.tilt3); });
  function latlon() {
    $('ns-lat-o').textContent = Math.abs(S.lat) + '° ' + (S.lat >= 0 ? 'N' : 'S'); $('ns-lon-o').textContent = Math.abs(S.lon) + '° ' + (S.lon >= 0 ? 'E' : 'W') + (S.lon === tzLon ? ' (your time zone)' : '');
  }
  $('ns-lat').value = S.lat; $('ns-lon').value = S.lon; latlon();
  $('ns-lat').addEventListener('input', function () { S.lat = +this.value; store.set('lat', S.lat); latlon(); uiTick(true); });
  $('ns-lon').addEventListener('input', function () { S.lon = +this.value; latlon(); uiTick(true); });
  $('ns-date').addEventListener('change', function () {
    var p = this.value.split('-').map(Number); if (p.length < 3 || !p[0]) return;
    var d = new Date(S.ms), nd = new Date(p[0], p[1] - 1, p[2], d.getHours(), d.getMinutes());
    if (isNaN(nd.getTime())) return;
    setTime(nd.getTime(), true); uiTick(true);
    if (S.ms < Date.now() - 300 * DAY && S.ms > K.MIN_MS) win('birthday', birthdayText());
  });
  $('ns-time').addEventListener('change', function () {
    var p = this.value.split(':').map(Number); if (p.length < 2 || isNaN(p[0])) return;
    var d = new Date(S.ms); setTime(new Date(d.getFullYear(), d.getMonth(), d.getDate(), p[0], p[1]).getTime(), true); uiTick(true);
  });
  $('ns-doy').addEventListener('input', function () {
    var d = new Date(S.ms); setTime(new Date(d.getFullYear(), 0, 1 + (+this.value), d.getHours(), d.getMinutes()).getTime(), true); uiTick(true);
  });
  function setYear(y) {
    y = clamp(Math.round(y), 1800, 2050); var d = new Date(S.ms), dim = new Date(y, d.getMonth() + 1, 0).getDate();
    setTime(new Date(y, d.getMonth(), Math.min(d.getDate(), dim), d.getHours(), d.getMinutes()).getTime(), true); uiTick(true);
  }
  $('ns-year').addEventListener('change', function () { if (this.value) setYear(+this.value); });
  $('ns-yprev').addEventListener('click', function () { setYear(new Date(S.ms).getFullYear() - 1); });
  $('ns-ynext').addEventListener('click', function () { setYear(new Date(S.ms).getFullYear() + 1); });
  $('ns-scene').addEventListener('change', function () {
    var v = this.value; this.value = ''; if (!v) return;
    var sc = {
      now: [Date.now(), null],
      apollo: [Date.UTC(1969, 6, 20, 20, 17), 'moon', 'Apollo 11 landed at 20:17 UT. The Moon was a waxing crescent, so the landing site had early-morning sunlight.'],
      mars2003: [Date.UTC(2003, 7, 27, 9, 51), 'orrery', 'Mars came within 55.8 million km, its closest in nearly 60,000 years.', 3, 'inner'],
      transit: [Date.UTC(2012, 5, 6, 1, 30), 'orrery', 'Venus passed right between Earth and the Sun. The next time is in December 2117.', 1, 'inner'],
      greatconj: [Date.UTC(2020, 11, 21, 18, 0), 'tonight', 'Jupiter and Saturn looked only a tenth of a degree apart, low in the southwest after sunset.'],
      mars2027: [Date.UTC(2026, 11, 1, 12, 0), 'orrery', 'Follow Mars and play at 1 day per second. It turns back around 10 January 2027.', 3, 'inner']
    }[v];
    if (!sc) return;
    if (sc[1]) setView(sc[1]);
    if (sc[3] !== undefined) { S.watch = sc[3]; store.set('watch', S.watch); }
    if (sc[4]) { S.scale = 'true'; setZoom(sc[4]); }
    if (v === 'greatconj') { S.lat = 40; S.eve = true; $('ns-lat').value = 40; latlon(); }
    setTime(sc[0], true); setSpeed(v === 'mars2027' ? 'd' : '0'); syncSegs(); uiTick(true);
    if (sc[2]) L.toast(view, sc[2]);
  });

  /* ---------- pointer and keys ---------- */
  function zoomBy(f, px, py) {
    if (S.view !== 'orrery') return;
    var b = mainBox(); if (px === undefined) { px = b.w / 2; py = b.h / 2; }
    var ns = clamp(S.cam.sT * f, S.scale === 'spread' ? 60 : 6, S.scale === 'spread' ? 6000 : 4000), k = ns / S.cam.sT;
    S.cam.px = px - b.w / 2 - (px - b.w / 2 - S.cam.px) * k; S.cam.py = py - b.h / 2 - (py - b.h / 2 - S.cam.py) * k;
    S.cam.sT = ns; S.cam.s = ns; S.zoom = ''; syncSegs();
  }
  var ptrs = {}, gest = null;
  function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function pickPlanet(x, y) {
    var best = -1, bd = 22, sn = S.snap, P = {};
    for (var i = 0; i < 8; i++) { if (i === 2) continue; W2S(sn.helio[i].x, sn.helio[i].y, P); var d = Math.hypot(P.x - x, P.y - y); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function moonDrag(x, y) {
    var g = S.moonGeo; if (!g) return;
    var ang = N.norm360(Math.atan2(-(y - g.cy), x - g.cx) * R2D);
    for (var k = 0; k < 3; k++) { var dD = N.norm180(ang - N.phase(N.jdTT(S.ms)).D); S.ms = clamp(S.ms + dD / 12.19 * DAY, K.MIN_MS, K.MAX_MS); }
    setTime(S.ms, true); uiTick(true);
  }
  function chartDrag(x, snap) {
    var B = S.eclGeo && S.eclGeo.chart; if (!B) return;
    var Y = yearData(new Date(S.ms).getFullYear()), jd = Y.ja + clamp((x - B.x) / B.w, 0, 0.9999) * (Y.jb - Y.ja);
    if (snap) { var best = null; Y.ph.forEach(function (p) { var px = B.x + (p.jd - Y.ja) / (Y.jb - Y.ja) * B.w; if (Math.abs(px - x) < 9 && (!best || Math.abs(p.jd - jd) < Math.abs(best.jd - jd))) best = p; }); if (best) jd = best.jd; }
    setTime(N.msFromJdTT(jd), true); uiTick(true);
  }
  cv.addEventListener('pointerdown', function (e) {
    cv.focus({ preventScroll: true }); var p = pos(e); ptrs[e.pointerId] = p;
    try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    var ids = Object.keys(ptrs);
    if (ids.length === 2 && S.view === 'orrery') { var a = ptrs[ids[0]], b = ptrs[ids[1]]; gest = { kind: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]), s0: S.cam.sT }; return; }
    if (S.view === 'orrery') {
      var inStrip = p[1] > mainBox().h;
      gest = { kind: inStrip ? 'none' : 'pan', x0: p[0], y0: p[1], px: S.cam.px, py: S.cam.py, moved: false };
    } else if (S.view === 'moon') {
      var g = S.moonGeo, rr = g ? Math.hypot(p[0] - g.cx, p[1] - g.cy) : 0;
      if (g && rr > g.R * 0.45 && rr < g.R * 1.5) { gest = { kind: 'moon' }; S.drag = true; moonDrag(p[0], p[1]); } else gest = null;
    } else if (S.view === 'eclipse') {
      var B = S.eclGeo && S.eclGeo.chart;
      if (B && p[1] > B.y - 14) { gest = { kind: 'chart' }; S.drag = true; chartDrag(p[0], false); }
      else gest = { kind: 'turn', x0: p[0], y0: p[1], az: S.ecam.az, el: S.ecam.el };
    }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId] || !gest) return; var p = pos(e); ptrs[e.pointerId] = p;
    if (gest.kind === 'pinch') { var ids = Object.keys(ptrs); if (ids.length < 2) return; var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomBy(gest.s0 * d / gest.d0 / S.cam.sT, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return; }
    if (gest.kind === 'pan') { var dx = p[0] - gest.x0, dy = p[1] - gest.y0; if (Math.abs(dx) + Math.abs(dy) > 4) gest.moved = true; if (gest.moved) { S.cam.px = gest.px + dx; S.cam.py = gest.py + dy; S.zoom = ''; } }
    else if (gest.kind === 'moon') moonDrag(p[0], p[1]);
    else if (gest.kind === 'chart') chartDrag(p[0], false);
    else if (gest.kind === 'turn') { S.ecam.az = clamp(gest.az + (p[0] - gest.x0) * 0.4, -60, 60); S.ecam.el = clamp(gest.el + (p[1] - gest.y0) * 0.3, 4, 75); }
  });
  function up(e) {
    if (!ptrs[e.pointerId]) return; var p = ptrs[e.pointerId]; delete ptrs[e.pointerId];
    if (gest && gest.kind === 'pinch') { if (!Object.keys(ptrs).length) gest = null; return; }
    if (gest && gest.kind === 'pan' && !gest.moved) {
      var i = pickPlanet(p[0], p[1]); if (i >= 0) { S.watch = i === S.watch ? -1 : i; store.set('watch', S.watch); S.stripSnap = true; syncSegs(); uiTick(true); }
      else if (S.zoom === '') syncSegs();
    }
    if (gest && gest.kind === 'none') {
      // a tap in the strip picks the nearest planet there
      var sn = S.snap, best = -1, bd = 26, pxd = (G.w - 24) / S.stripSpan;
      for (var j = 0; j < 8; j++) { if (j === 2) continue; var x = G.w / 2 - N.norm180(sn.geo[j].lon - S.stripC) * pxd; if (Math.abs(x - p[0]) < bd) { bd = Math.abs(x - p[0]); best = j; } }
      if (best >= 0) { S.watch = best; store.set('watch', best); S.stripSnap = true; syncSegs(); uiTick(true); }
    }
    if (gest && gest.kind === 'chart') chartDrag(p[0], true);
    gest = null; S.drag = false;
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { if (S.view !== 'orrery') return; e.preventDefault(); var p = pos(e); zoomBy(Math.exp(-clamp(e.deltaY, -200, 200) * 0.0018), p[0], p[1]); }, { passive: false });
  cv.addEventListener('dblclick', function () { if (S.view === 'orrery') setZoom(S.zoom || 'inner'); });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, done = true, i = SPEED_KEYS.indexOf(S.speed);
    if (k === ' ' || k === 'k') setSpeed(S.speed === '0' ? S.lastSpeed : '0');
    else if (k === 'ArrowRight' || k === 'ArrowLeft') { setTime(S.ms + (k === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? DAY / 24 : DAY), true); uiTick(true); }
    else if (k === 'ArrowUp') setSpeed(SPEED_KEYS[Math.min(4, i + 1)]);
    else if (k === 'ArrowDown') setSpeed(SPEED_KEYS[Math.max(0, i - 1)]);
    else if (k >= '1' && k <= '4') setView(['orrery', 'moon', 'eclipse', 'tonight'][+k - 1]);
    else if (k === '+' || k === '=') zoomBy(1.4);
    else if (k === '-' || k === '_') zoomBy(1 / 1.4);
    else if (k === 'n' || k === 'N') { setTime(Date.now(), true); uiTick(true); }
    else done = false;
    if (done) e.preventDefault();
  });

  /* ---------- the loop ---------- */
  var lastW = 0, lastH = 0;
  L.loop(function (dt) {
    G.fit();
    if (G.w !== lastW || G.h !== lastH || !BG) { var fz = lastW > 0; lastW = G.w; lastH = G.h; makeBG(); if (S.view === 'orrery' && S.zoom) setZoom(S.zoom, true); else if (!fz) setZoom(S.zoom || 'inner', true); }
    if (SPEEDS[S.speed] && !S.drag) advance(dt);
    if (S.cam.s !== S.cam.sT) { var kk = reduced ? 1 : 1 - Math.exp(-dt * 7); S.cam.s = Math.exp(Math.log(S.cam.s) + (Math.log(S.cam.sT) - Math.log(S.cam.s)) * kk); if (Math.abs(S.cam.s / S.cam.sT - 1) < 1e-3) S.cam.s = S.cam.sT; }
    ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
    ctx.drawImage(BG, 0, 0, G.w, G.h);
    if (S.view === 'orrery') drawOrrery(dt); else if (S.view === 'moon') drawMoon(); else if (S.view === 'eclipse') drawEclipse(); else drawTonight();
    checkMissions();
    uiTick(false);
  }, view);

  /* ---------- start ---------- */
  refresh();
  if (!S.zoom) S.zoom = 'inner';
  S.cam.init = true; setZoom(S.zoom, true);
  setView(S.view);
  if (/[?&]debug\b/.test(location.search)) window.NightSkyDebug = { S: S, setTime: setTime, setView: setView, setSpeed: setSpeed, missions: M, nextFullJd: nextFullJd, N: N };
})();
