/* Food Garden Planner pictures: the math behind them. Sun position and day length (NOAA general solar position
   equations), planting calendar windows (counted from the gardener's own frost dates), weekly harvest estimates,
   the to-scale garden layout and the shade a fence, house or tree casts. Pure functions with no page access, so
   node can test them: node scripts/garden/model.test.js */
(function (root, make) {
  'use strict';
  var M = make();
  if (typeof module === 'object' && module.exports) module.exports = M; else root.GardenModel = M;
})(this, function () {
  'use strict';
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  var sin = Math.sin, cos = Math.cos, tan = Math.tan, abs = Math.abs, sqrt = Math.sqrt, min = Math.min, max = Math.max;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ---------- dates: day of year in a 365-day reference year (Jan 1 = 1); days past 365 roll into next year ----------
  var MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function doy(m, d) { var n = d; for (var i = 0; i < m - 1; i++) n += MD[i]; return n; }
  function wrap(n) { return ((Math.round(n) - 1) % 365 + 365) % 365 + 1; }
  function mdOf(n) { n = wrap(n); var m = 0; while (n > MD[m]) { n -= MD[m]; m++; } return { m: m + 1, d: n }; }
  function parseMD(s) {
    var x = /^(\d{1,2})-(\d{1,2})$/.exec(String(s || '')); if (!x) return null;
    var m = +x[1], d = +x[2]; return m >= 1 && m <= 12 && d >= 1 && d <= MD[m - 1] ? doy(m, d) : null;
  }
  function pad(v) { return (v < 10 ? '0' : '') + v; }
  function mdStr(n) { var x = mdOf(n); return pad(x.m) + '-' + pad(x.d); }
  function fmtDay(n, long) { var x = mdOf(n); return (long ? MONTH : MON)[x.m - 1] + ' ' + x.d; }
  function monthStarts(a, b) { // day numbers of the 1st of each month between a and b (may run past 365)
    var out = [], y0 = Math.floor((a - 1) / 365) - 1;
    for (var y = y0; y <= y0 + 4; y++) for (var m = 1; m <= 12; m++) { var n = doy(m, 1) + 365 * y; if (n >= a && n <= b) out.push({ n: n, m: m }); }
    return out;
  }

  // ---------- the sun: the NOAA Solar Calculator equations (NOAA GML spreadsheet, after Meeus) ----------
  // Times are local solar time in hours: the sun is highest at 12. n is the day of the year in YEAR (set by the page).
  var YEAR = 2026;
  function setYear(y) { if (y > 1900 && y < 2100) YEAR = y; }
  function jdOf(y, m, d, ut) { if (m <= 2) { y--; m += 12; } var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + ut / 24; }
  var memo = {};
  function solar(n, h) { // declination (deg) and equation of time (min); h is the hour (solar time, treated as UT)
    var key = n + ':' + (h == null ? 12 : Math.round(h * 20) / 20); if (memo[key]) return memo[key];
    var md = mdOf(n), y = YEAR + Math.floor((Math.round(n) - 1) / 365), T = (jdOf(y, md.m, md.d, h == null ? 12 : h) - 2451545) / 36525;
    var L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360, Ma = 357.52911 + T * (35999.05029 - 0.0001537 * T);
    var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
    var C = sin(Ma * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T)) + sin(2 * Ma * RAD) * (0.019993 - 0.000101 * T) + sin(3 * Ma * RAD) * 0.000289;
    var om = (125.04 - 1934.136 * T) * RAD, lam = L0 + C - 0.00569 - 0.00478 * sin(om);
    var eps = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60 + 0.00256 * cos(om);
    var yv = Math.pow(tan(eps * RAD / 2), 2);
    var eot = 4 * DEG * (yv * sin(2 * L0 * RAD) - 2 * e * sin(Ma * RAD) + 4 * e * yv * sin(Ma * RAD) * cos(2 * L0 * RAD) - 0.5 * yv * yv * sin(4 * L0 * RAD) - 1.25 * e * e * sin(2 * Ma * RAD));
    var o = { dec: Math.asin(sin(eps * RAD) * sin(lam * RAD)) * DEG, eot: eot };
    if (Object.keys(memo).length > 4000) memo = {};
    memo[key] = o; return o;
  }
  function decl(n, h) { return solar(n, h).dec; }
  function eqTime(n, h) { return solar(n, h).eot; }
  function sunAt(lat, dec, t) { // altitude (deg above the horizon, no refraction) and azimuth (deg clockwise from north)
    var p = clamp(lat, -89.99, 89.99) * RAD, d = dec * RAD, h = (t - 12) * 15 * RAD;
    var alt = Math.asin(clamp(sin(p) * sin(d) + cos(p) * cos(d) * cos(h), -1, 1));
    var az = Math.atan2(sin(h), cos(h) * sin(p) - tan(d) * cos(p)) * DEG + 180;
    return { alt: alt * DEG, az: (az + 360) % 360 };
  }
  function sunPos(lat, n, t) { return sunAt(lat, decl(n, t), t); }
  // sunrise and sunset: the sun's center 0.833 deg below the horizon (refraction plus the sun's radius), as NOAA uses;
  // civil twilight: 6 deg below
  function hourAngle(lat, dec, zen) {
    var p = clamp(lat, -89.99, 89.99) * RAD, d = dec * RAD;
    return cos(zen * RAD) / (cos(p) * cos(d)) - tan(p) * tan(d);
  }
  function dayInfo(lat, n) {
    var dec = decl(n), c = hourAngle(lat, dec, 90.833), tw = hourAngle(lat, dec, 96), o = { dec: dec };
    if (c <= -1) { o.len = 24; o.rise = 0; o.set = 24; o.polar = 'day'; }
    else if (c >= 1) { o.len = 0; o.rise = 12; o.set = 12; o.polar = 'night'; }
    else { var H = Math.acos(c) * DEG / 15; o.len = 2 * H; o.rise = 12 - H; o.set = 12 + H; }
    o.civil = tw <= -1 ? 24 : tw >= 1 ? 0 : 2 * Math.acos(tw) * DEG / 15;
    o.noonAlt = 90 - abs(lat - dec);
    if (o.noonAlt > 90) o.noonAlt = 180 - o.noonAlt;
    return o;
  }
  function sunVec(alt, az) { var a = alt * RAD, z = az * RAD; return [sin(z) * cos(a), cos(z) * cos(a), sin(a)]; } // x east, y north, z up
  function compass(az) { return ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'][Math.round(((az % 360) + 360) % 360 / 45) % 8]; }
  function fmtTime(t) { // solar hours -> "6:42 am"
    var mins = Math.round(t * 60); mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60), m = mins % 60, ap = h < 12 ? 'am' : 'pm', hh = h % 12 || 12;
    return hh + ':' + pad(m) + ' ' + ap;
  }
  function fmtHours(x) { var m = Math.round(x * 60); return Math.floor(m / 60) + ' h ' + pad(m % 60) + ' min'; }
  // the dates on which day length is at least `need` hours (sunrise to sunset), as runs of days
  function longDays(lat, need) {
    var runs = [], cur = null;
    for (var n = 1; n <= 365; n++) {
      var ok = dayInfo(lat, n).len >= need;
      if (ok && !cur) cur = { a: n, b: n }; else if (ok) cur.b = n; else if (cur) { runs.push(cur); cur = null; }
    }
    if (cur) runs.push(cur);
    if (runs.length > 1 && runs[0].a === 1 && runs[runs.length - 1].b === 365) { var last = runs.pop(); runs[0] = { a: last.a, b: runs[0].b + 365 }; }
    return runs;
  }

  // ---------- planting calendar ----------
  // L, F: average last spring frost and first fall frost (day numbers, F > L). cal: the crop's entry in data/garden/viz.json.
  // dh: days to harvest [early, late]. tender: true when frost kills the crop.
  function cropCal(cal, dh, tender, L, F) {
    if (!cal || !cal.pw || !dh || dh[0] == null) return null;
    var p0 = L + 7 * cal.pw[0], p1 = L + 7 * cal.pw[1], pm = (p0 + p1) / 2, o = { p: [p0, p1], later: !!cal.later, pm: pm };
    if (cal.si) o.si = [p0 - 7 * cal.si[1], p0 - 7 * cal.si[0]];
    var d1 = dh[1] == null ? dh[0] : dh[1], h0 = pm + dh[0], h1 = pm + d1;
    o.first = [h0, h1];
    if (cal.hv === 'pick') h1 = max(h1, F); // picked until the first fall frost
    if (tender) {
      if (h0 >= F) o.warn = 'none';
      else if (pm + d1 > F) o.warn = 'late';
      h1 = min(h1, F);
    }
    if (h1 > h0) o.h = [h0, h1];
    if (cal.fall || cal.fd) {
      var f0, f1, tf = tender ? 14 : 0;
      if (cal.fd) { f0 = F - cal.fd[0]; f1 = F - cal.fd[1]; }
      else { f0 = F - 14 - tf - d1; f1 = F - 14 - tf - dh[0]; } // UNL G1343 count-back, without the harvest period
      if (cal.fd) { if (f1 > p0) o.fall = [max(f0, p0), f1]; }
      else if (f1 > p1 + 14) o.fall = [max(f0, p1 + 14), f1];
    }
    return o;
  }
  // spread each crop's season harvest evenly over its harvest window, by week. items: [{k, g, lb, h: [a, b]}]
  function weekly(items, x0, x1) {
    var nw = Math.max(1, Math.ceil((x1 - x0) / 7)), bins = [];
    for (var i = 0; i < nw; i++) bins.push({ d0: x0 + 7 * i, d1: x0 + 7 * i + 7, tot: 0, by: {}, crops: {} });
    items.forEach(function (it) {
      var a = it.h[0], b = it.h[1]; if (!(b > a) || !(it.lb > 0)) return;
      var rate = it.lb / (b - a);
      bins.forEach(function (w) {
        var ov = min(b, w.d1) - max(a, w.d0); if (ov <= 0) return;
        var v = rate * ov; w.tot += v; w.by[it.g] = (w.by[it.g] || 0) + v; w.crops[it.k] = (w.crops[it.k] || 0) + v;
      });
    });
    return bins;
  }

  // ---------- garden layout (feet; x east, y south on the drawing: north is up) ----------
  // Crops are poured, tallest first, into "lanes": with beds running north-south each bed fills from its north end;
  // with beds running east-west the north half of each bed fills first, west to east. So tall crops always sit north
  // of shorter ones (Texas A&M E-289, VCE 426-312, Oregon State). In the Southern Hemisphere everything flips.
  function pour(lanes, items) {
    var pieces = [], li = 0, used = 0, eps = 1e-6;
    items.forEach(function (it, idx) {
      var left = it.a;
      while (left > eps && li < lanes.length) {
        var ln = lanes[li], cap = ln.w * ln.h - used;
        if (cap <= eps) { li++; used = 0; continue; }
        var take = min(left, cap), r;
        if (ln.along === 'y') { var dy = take / ln.w; r = { x: ln.x, y: ln.y + used / ln.w, w: ln.w, h: dy }; }
        else { var dx = take / ln.h; r = { x: ln.x + used / ln.h, y: ln.y, w: dx, h: ln.h }; }
        pieces.push({ i: idx, k: it.k, a: take, share: take / it.a, x: r.x, y: r.y, w: r.w, h: r.h, bed: ln.bed });
        used += take; left -= take;
        if (ln.w * ln.h - used <= 1e-4 * ln.w * ln.h) { li++; used = 0; }
      }
      if (left > max(0.01, it.a * 0.005)) it.overflow = left;
    });
    var open = [];
    for (; li < lanes.length; li++, used = 0) {
      var L = lanes[li], rest = L.w * L.h - used; if (rest < 0.05) continue;
      open.push(L.along === 'y' ? { x: L.x, y: L.y + used / L.w, w: L.w, h: rest / L.w, bed: L.bed } : { x: L.x + used / L.h, y: L.y, w: rest / L.h, h: L.h, bed: L.bed });
    }
    return { pieces: pieces, open: open };
  }
  function sortItems(items) {
    return items.slice().sort(function (a, b) { return (b.ht || 0) - (a.ht || 0) || (a.g - b.g) || (b.a - a.a); });
  }
  function flipY(o) {
    function f(r) { r.y = o.H - r.y - r.h; }
    o.beds.forEach(f); o.pieces.forEach(f); o.open.forEach(f); o.paths.forEach(f);
  }
  // o: {w, l (ft), dir: 'ns' | 'ew', path (ft), south (bool), items: [{k, a, ht, g}]}
  function layoutBeds(o) {
    var S = min(o.w, o.l), Lg = max(o.w, o.l), nb = S <= 5 ? 1 : max(2, Math.round(S / 4)), bw = S / nb, pw = nb > 1 ? max(0, o.path || 0) : 0;
    var beds = [], lanes = [], paths = [], ns = o.dir !== 'ew', i;
    for (i = 0; i < nb; i++) {
      var b = ns ? { x: i * (bw + pw), y: 0, w: bw, h: Lg } : { x: 0, y: i * (bw + pw), w: Lg, h: bw };
      b.n = i + 1; beds.push(b);
      if (ns) lanes.push({ x: b.x, y: 0, w: bw, h: Lg, along: 'y', bed: i });
      else if (bw >= 3) { lanes.push({ x: 0, y: b.y, w: Lg, h: bw / 2, along: 'x', bed: i }); lanes.push({ x: 0, y: b.y + bw / 2, w: Lg, h: bw / 2, along: 'x', bed: i }); }
      else lanes.push({ x: 0, y: b.y, w: Lg, h: bw, along: 'x', bed: i });
      if (i && pw) paths.push(ns ? { x: b.x - pw, y: 0, w: pw, h: Lg } : { x: 0, y: b.y - pw, w: Lg, h: pw });
    }
    var items = sortItems(o.items), r = pour(lanes, items);
    var out = { kind: 'beds', W: ns ? nb * bw + (nb - 1) * pw : Lg, H: ns ? Lg : nb * bw + (nb - 1) * pw, nb: nb, bw: bw, len: Lg, pw: pw, dir: ns ? 'ns' : 'ew',
      beds: beds, paths: paths, pieces: r.pieces, open: r.open, items: items };
    if (o.south) flipY(out);
    return out;
  }
  // a farm: the land as a square, four strips running north-south with lanes between and headlands at both ends,
  // sized so 80% is planted (the planner's figure)
  function laneFrac(nb, share) { // lane width as a fraction of the side: (1 - (nb-1)x)(1 - 2x) = share
    var a = 2 * (nb - 1), b = -(nb + 1), c = 1 - share;
    return (-b - sqrt(b * b - 4 * a * c)) / (2 * a);
  }
  function layoutFarm(o) {
    var s = sqrt(o.land), nb = 4, x = laneFrac(nb, 0.8) * s, bw = (s - (nb - 1) * x) / nb, h = s - 2 * x;
    var beds = [], lanes = [], paths = [];
    for (var i = 0; i < nb; i++) {
      var b = { x: i * (bw + x), y: x, w: bw, h: h, n: i + 1 }; beds.push(b);
      lanes.push({ x: b.x, y: x, w: bw, h: h, along: 'y', bed: i });
      if (i) paths.push({ x: b.x - x, y: x, w: x, h: h });
    }
    paths.push({ x: 0, y: 0, w: s, h: x }); paths.push({ x: 0, y: s - x, w: s, h: x });
    var items = sortItems(o.items), r = pour(lanes, items);
    var out = { kind: 'farm', W: s, H: s, nb: nb, bw: bw, len: h, pw: x, dir: 'ns', beds: beds, paths: paths, pieces: r.pieces, open: r.open, items: items };
    if (o.south) flipY(out);
    return out;
  }
  // indoors or on a balcony when only the total space is known: one planter area (the shape is only an example)
  function layoutArea(o) {
    var S = min(2, sqrt(o.area)), Lg = o.area / S, lanes = [{ x: 0, y: 0, w: Lg, h: S, along: 'x', bed: 0 }];
    var items = sortItems(o.items), r = pour(lanes, items);
    return { kind: 'area', W: Lg, H: S, nb: 1, bw: S, len: Lg, pw: 0, dir: 'ew', beds: [{ x: 0, y: 0, w: Lg, h: S, n: 1 }], paths: [], pieces: r.pieces, open: r.open, items: items };
  }
  // containers, drawn to scale and packed in rows. pots: [{sh, d, l, w (inches), k (crop key or null)}]
  function layoutPots(pots, gapIn) {
    var g = (gapIn == null ? 4 : gapIn) / 12, tot = 0, big = 0;
    var P = pots.map(function (p) { var dx = (p.sh === 'rect' ? p.l : p.d) / 12, dy = (p.sh === 'rect' ? p.w : p.d) / 12; tot += (dx + g) * (dy + g); big = max(big, dx); return { p: p, dx: dx, dy: dy }; });
    var rowW = max(big, sqrt(tot * 2.2)), x = 0, y = 0, rowH = 0, W = 0, out = [];
    P.forEach(function (q) {
      if (x > 0 && x + q.dx > rowW + 1e-9) { y += rowH + g; x = 0; rowH = 0; }
      out.push({ x: x, y: y, w: q.dx, h: q.dy, sh: q.p.sh, k: q.p.k, p: q.p });
      x += q.dx + g; rowH = max(rowH, q.dy); W = max(W, x - g);
    });
    return { kind: 'pots', W: W, H: y + rowH, pots: out };
  }
  // n plants evenly in a rectangle, in rows; returns centers and the spacing between them
  function plantGrid(r, n) {
    if (!(n >= 1) || !(r.w > 0) || !(r.h > 0)) return { pts: [], s: 0 };
    n = Math.round(n);
    var s = sqrt(r.w * r.h / n), rows = clamp(Math.round(r.h / s), 1, n), cols = Math.ceil(n / rows);
    rows = Math.ceil(n / cols);
    var pts = [], k = 0, cw = r.w / cols, rh = r.h / rows;
    for (var i = 0; i < rows && k < n; i++) {
      var inRow = min(cols, n - k), off = (cols - inRow) * cw / 2;
      for (var j = 0; j < inRow; j++, k++) pts.push([r.x + off + (j + 0.5) * cw, r.y + (i + 0.5) * rh]);
    }
    return { pts: pts, s: min(cw, rh) };
  }

  // ---------- shade from a fence, house or tree ----------
  // Ground coordinates in feet: x east, y north, z up. ob: {kind, x, y (center of its base), ang (direction of its long
  // side, radians from east toward north), w (length), d (depth), h (height)}; a tree has a round canopy of radius r
  // whose center is at height cz (trunk not counted).
  function obstacleFrom(kind, side, dist, h, w, bed) {
    // side: compass bearing (deg) from the bed's center; dist: gap from the bed's edge to the near face (ft); bed: {W, H}
    var a = side * RAD, ux = sin(a), uy = cos(a);
    var reach = abs(ux) * bed.W / 2 + abs(uy) * bed.H / 2; // center to the bed edge along that bearing (rectangle support)
    var ob = { kind: kind, h: h, w: w, ang: Math.atan2(uy, ux) + Math.PI / 2 };
    if (kind === 'tree') { ob.r = w / 2; ob.cz = max(h - ob.r, ob.r * 0.5); ob.h = ob.cz + ob.r; ob.d = w; }
    else ob.d = kind === 'house' ? max(8, min(30, w * 0.75)) : 0.3;
    var off = reach + dist + (kind === 'tree' ? ob.r : ob.d / 2);
    ob.x = ux * off; ob.y = uy * off; ob.side = side; ob.dist = dist;
    return ob;
  }
  function hits(px, py, s, ob) { // does the ray from ground point (px, py) toward the sun hit the obstacle?
    if (s[2] <= 0) return true;
    var rx = px - ob.x, ry = py - ob.y;
    if (ob.kind === 'tree') {
      var cz = -ob.cz, b = rx * s[0] + ry * s[1] + cz * s[2], c = rx * rx + ry * ry + cz * cz - ob.r * ob.r, disc = b * b - c;
      return disc >= 0 && (-b + sqrt(disc)) > 0;
    }
    var ca = cos(ob.ang), sa = sin(ob.ang);
    var pu = rx * ca + ry * sa, pv = -rx * sa + ry * ca, su = s[0] * ca + s[1] * sa, sv = -s[0] * sa + s[1] * ca;
    var t0 = 0, t1 = Infinity;
    function slab(p, d, lo, hi) {
      if (abs(d) < 1e-12) return p >= lo && p <= hi;
      var a = (lo - p) / d, b = (hi - p) / d; if (a > b) { var t = a; a = b; b = t; }
      if (a > t0) t0 = a; if (b < t1) t1 = b; return t0 <= t1;
    }
    return slab(pu, su, -ob.w / 2, ob.w / 2) && slab(pv, sv, -ob.d / 2, ob.d / 2) && slab(0, s[2], 0, ob.h) && t1 > 0;
  }
  function obPoints(ob) { // 3D points outlining the obstacle (for its shadow and its outline against the sky)
    var pts = [], i, j;
    if (ob.kind === 'tree') {
      for (i = 0; i <= 12; i++) for (j = 0; j < 24; j++) {
        var th = Math.PI * i / 12, ph = 2 * Math.PI * j / 24;
        pts.push([ob.x + ob.r * sin(th) * cos(ph), ob.y + ob.r * sin(th) * sin(ph), ob.cz + ob.r * cos(th)]);
      }
      pts.push([ob.x, ob.y, 0]);
      return pts;
    }
    var ca = cos(ob.ang), sa = sin(ob.ang);
    for (i = 0; i <= 16; i++) for (j = 0; j <= 2; j++) for (var k = 0; k <= 1; k++) {
      var u = (i / 16 - 0.5) * ob.w, v = (j / 2 - 0.5) * ob.d;
      pts.push([ob.x + u * ca - v * sa, ob.y + u * sa + v * ca, k * ob.h]);
    }
    return pts;
  }
  function hull(p) { // convex hull, monotone chain
    p = p.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (p.length < 3) return p;
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop(); lo.push(p[i]); }
    for (i = p.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop(); up.push(p[i]); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function shadow(ob, s) { // the obstacle's shadow on the ground, as a polygon; null when the sun is down
    if (s[2] <= 0.002) return null;
    var k = max(s[2], 0.02);
    return hull(obPoints(ob).map(function (q) { return [q[0] - q[2] * s[0] / k, q[1] - q[2] * s[1] / k]; }));
  }
  // the obstacle against the sky as seen from ground point (cx, cy): for each azimuth i + 0.5 deg (i = 0..359), the
  // lowest and highest angles it covers (deg), or -1 where it isn't in that direction. Exact, not sampled.
  function skyline(ob, cx, cy) {
    var top = new Float32Array(360).fill(-1), bot = new Float32Array(360).fill(-1);
    var rx = cx - ob.x, ry = cy - ob.y, ca = cos(ob.ang), sa = sin(ob.ang);
    for (var i = 0; i < 360; i++) {
      var a = (i + 0.5) * RAD, ux = sin(a), uy = cos(a);
      if (ob.kind === 'tree') {
        var dc = -(rx * ux + ry * uy), dp = abs(-rx * uy + ry * ux); // along the view and across it, to the canopy center
        if (dp >= ob.r || dc <= 0) continue;
        var rr = sqrt(ob.r * ob.r - dp * dp), dd = sqrt(dc * dc + ob.cz * ob.cz); if (dd <= rr) { top[i] = 90; bot[i] = 0; continue; }
        var th = Math.atan2(ob.cz, dc), al = Math.asin(rr / dd);
        top[i] = (th + al) * DEG; bot[i] = max(0, (th - al) * DEG);
      } else { // nearest point of the footprint along the view; its top edge is highest there
        var pu = rx * ca + ry * sa, pv = -rx * sa + ry * ca, su = ux * ca + uy * sa, sv = -ux * sa + uy * ca, t0 = 0, t1 = Infinity, hit = true;
        [[pu, su, ob.w / 2], [pv, sv, ob.d / 2]].forEach(function (q) {
          if (!hit) return;
          if (abs(q[1]) < 1e-12) { if (abs(q[0]) > q[2]) hit = false; return; }
          var x = (-q[2] - q[0]) / q[1], y = (q[2] - q[0]) / q[1]; if (x > y) { var t = x; x = y; y = t; }
          t0 = max(t0, x); t1 = min(t1, y); if (t0 > t1) hit = false;
        });
        if (!hit || t1 <= 0) continue;
        top[i] = t0 <= 1e-9 ? 90 : Math.atan2(ob.h, t0) * DEG; bot[i] = 0;
      }
    }
    return { top: top, bot: bot };
  }
  // hours of direct sun at each cell center of a grid over the bed, for one day. g: {x0, y0, w, h, nx, ny} (feet, y north)
  function sunHours(lat, n, g, obs, dt) {
    dt = dt || 0.1;
    var out = new Float32Array(g.nx * g.ny), dec = decl(n), info = dayInfo(lat, n);
    if (info.len <= 0) return { h: out, open: 0 };
    var t0 = info.polar === 'day' ? 0 : info.rise, t1 = info.polar === 'day' ? 24 : info.set, steps = Math.max(1, Math.round((t1 - t0) / dt)), st = (t1 - t0) / steps;
    for (var k = 0; k < steps; k++) {
      var t = t0 + (k + 0.5) * st, sp = sunAt(lat, dec, t);
      if (sp.alt <= -0.833) continue;
      var s = sunVec(max(sp.alt, 0.05), sp.az);
      for (var j = 0; j < g.ny; j++) for (var i = 0; i < g.nx; i++) {
        var px = g.x0 + (i + 0.5) * g.w / g.nx, py = g.y0 + (j + 0.5) * g.h / g.ny, blocked = false;
        for (var q = 0; q < obs.length && !blocked; q++) blocked = hits(px, py, s, obs[q]);
        if (!blocked) out[j * g.nx + i] += st;
      }
    }
    return { h: out, open: t1 - t0 };
  }

  return {
    MON: MON, MONTH: MONTH, doy: doy, wrap: wrap, mdOf: mdOf, parseMD: parseMD, mdStr: mdStr, fmtDay: fmtDay, monthStarts: monthStarts,
    setYear: setYear, jdOf: jdOf, decl: decl, eqTime: eqTime, sunAt: sunAt, sunPos: sunPos, dayInfo: dayInfo, sunVec: sunVec, compass: compass, fmtTime: fmtTime, fmtHours: fmtHours, longDays: longDays,
    cropCal: cropCal, weekly: weekly,
    layoutBeds: layoutBeds, layoutFarm: layoutFarm, layoutArea: layoutArea, layoutPots: layoutPots, plantGrid: plantGrid, laneFrac: laneFrac,
    obstacleFrom: obstacleFrom, hits: hits, shadow: shadow, skyline: skyline, sunHours: sunHours, hull: hull
  };
});
