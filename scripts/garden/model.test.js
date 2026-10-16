/* Tests for the Food Garden Planner pictures. Run: node scripts/garden/model.test.js
   The sun: model.js uses the NOAA Solar Calculator equations. Here they are written out again, separately, as the
   reference (NOAA GML's NOAA_Solar_Calculations_day sheet: positions, sunrise hour angle with 0.833 deg), and the
   model is also checked against NOAA's shorter "General Solar Position Calculations" series, published day lengths,
   and the 2026 equinox and solstice times. The rest is checked against data/garden/viz.json and hand calculations. */
'use strict';
var path = require('path'), fs = require('fs');
var ROOT = path.join(__dirname, '..', '..');
var M = require(path.join(ROOT, 'static', 'garden', 'viz', 'model.js'));

var V = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'garden', 'viz.json'), 'utf8'));
var CROPS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'garden', 'crops.json'), 'utf8')).crops;
var pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('FAIL: ' + msg); } }
function near(a, b, tol, msg) { ok(Math.abs(a - b) <= tol, msg + ' (got ' + a + ', want ' + b + ' ± ' + tol + ')'); }

// ---------- NOAA spreadsheet reference ----------
var R = Math.PI / 180, D = 180 / Math.PI;
function jdOf(y, m, d, utHours) { if (m <= 2) { y--; m += 12; } var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + utHours / 24; }
function noaa(jd) {
  var T = (jd - 2451545) / 36525;
  var L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  var Ma = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  var e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  var C = Math.sin(Ma * R) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * Ma * R) * (0.019993 - 0.000101 * T) + Math.sin(3 * Ma * R) * 0.000289;
  var app = L0 + C - 0.00569 - 0.00478 * Math.sin((125.04 - 1934.136 * T) * R);
  var eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  var eps = eps0 + 0.00256 * Math.cos((125.04 - 1934.136 * T) * R);
  var dec = Math.asin(Math.sin(eps * R) * Math.sin(app * R)) * D;
  var y = Math.pow(Math.tan(eps * R / 2), 2);
  var eot = 4 * D * (y * Math.sin(2 * L0 * R) - 2 * e * Math.sin(Ma * R) + 4 * e * y * Math.sin(Ma * R) * Math.cos(2 * L0 * R) - 0.5 * y * y * Math.sin(4 * L0 * R) - 1.25 * e * e * Math.sin(2 * Ma * R));
  return { dec: dec, eot: eot };
}
function noaaPos(lat, lon, y, m, d, utH) { // altitude (no refraction) and azimuth, as in the NOAA sheet
  var s = noaa(jdOf(y, m, d, utH)), tst = ((utH * 60 + s.eot + 4 * lon) % 1440 + 1440) % 1440;
  var ha = tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180;
  var cz = Math.sin(lat * R) * Math.sin(s.dec * R) + Math.cos(lat * R) * Math.cos(s.dec * R) * Math.cos(ha * R), zen = Math.acos(Math.max(-1, Math.min(1, cz))) * D;
  var a = Math.acos(Math.max(-1, Math.min(1, (Math.sin(lat * R) * Math.cos(zen * R) - Math.sin(s.dec * R)) / (Math.cos(lat * R) * Math.sin(zen * R))))) * D;
  var az = ha > 0 ? (a + 180) % 360 : (540 - a) % 360;
  return { alt: 90 - zen, az: az, eot: s.eot, dec: s.dec };
}
function noaaDayLen(lat, y, m, d) { // sunrise-to-sunset with 0.833 deg, declination at local solar noon (longitude 0)
  var s = noaa(jdOf(y, m, d, 12)), c = Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(s.dec * R)) - Math.tan(lat * R) * Math.tan(s.dec * R);
  return c <= -1 ? 24 : c >= 1 ? 0 : 2 * Math.acos(c) * D / 15;
}

// 1. sun position against the NOAA sheet: many latitudes, dates and times (longitude 0, so UT = solar time - EoT)
(function () {
  var worstAlt = 0, worstAz = 0, worstDec = 0, worstEot = 0, nPts = 0;
  [-45, -20, 0, 25, 33.7, 40, 47.6, 61.2].forEach(function (lat) {
    for (var m = 1; m <= 12; m++) for (var dd = 1; dd <= 28; dd += 9) {
      var n = M.doy(m, dd);
      for (var t = 5; t <= 19; t += 1.25) {
        var ref = noaaPos(lat, 0, 2026, m, dd, 12), utH = t - ref.eot / 60, r = noaaPos(lat, 0, 2026, m, dd, utH), p = M.sunPos(lat, n, t);
        worstDec = Math.max(worstDec, Math.abs(M.decl(n, t) - r.dec)); worstEot = Math.max(worstEot, Math.abs(M.eqTime(n, t) - r.eot));
        if (r.alt < 1) continue; // below or at the horizon: altitude only matters for "sun up"
        worstAlt = Math.max(worstAlt, Math.abs(p.alt - r.alt));
        if (r.alt < 85) { var da = Math.abs(p.az - r.az); worstAz = Math.max(worstAz, Math.min(da, 360 - da)); }
        nPts++;
      }
    }
  });
  console.log('sun vs NOAA sheet: ' + nPts + ' points; worst altitude ' + worstAlt.toFixed(3) + '°, azimuth ' + worstAz.toFixed(3) + '°, declination ' + worstDec.toFixed(3) + '°, equation of time ' + worstEot.toFixed(2) + ' min');
  ok(worstAlt < 0.1, 'altitude within 0.1° of NOAA');
  ok(worstAz < 0.3, 'azimuth within 0.3° of NOAA (sun below 85°)');
  ok(worstDec < 0.06, 'declination within 0.06° of NOAA');
  ok(worstEot < 0.6, 'equation of time within 0.6 min of NOAA');
})();

// 2. day length against the NOAA sheet (|lat| <= 66) and against published values
(function () {
  var worst = 0;
  [-50, -33.9, -10, 0, 21.3, 25.8, 30, 35, 39.7, 42, 45, 47.6, 52, 61.2, 66].forEach(function (lat) {
    for (var m = 1; m <= 12; m++) for (var dd = 1; dd <= 28; dd += 3) worst = Math.max(worst, Math.abs(M.dayInfo(lat, M.doy(m, dd)).len - noaaDayLen(lat, 2026, m, dd)) * 60);
  });
  console.log('day length vs NOAA sheet: worst ' + worst.toFixed(2) + ' min');
  ok(worst < 1.5, 'day length within 1.5 min of NOAA sheet');
  // published sunrise-to-sunset day lengths (US Naval Observatory / timeanddate tables), within 4 minutes
  [[0, 3, 20, 12 + 7 / 60, 'equator, March equinox (12 h 7 min)'],
   [39.74, 6, 21, 15 + 1 / 60, 'Denver, June solstice (15 h 1 min)'], [39.74, 12, 21, 9 + 20 / 60, 'Denver, December solstice (9 h 20 min)'],
   [47.61, 6, 21, 15 + 59 / 60, 'Seattle, June solstice (15 h 59 min)'], [47.61, 12, 21, 8 + 25 / 60, 'Seattle, December solstice (8 h 25 min)'],
   [25.76, 6, 21, 13 + 45 / 60, 'Miami, June solstice (13 h 45 min)'], [25.76, 12, 21, 10 + 32 / 60, 'Miami, December solstice (10 h 32 min)'],
   [61.22, 6, 21, 19 + 21 / 60, 'Anchorage, June solstice (19 h 21 min)'], [61.22, 12, 21, 5 + 27 / 60, 'Anchorage, December solstice (5 h 27 min)']
  ].forEach(function (c) { near(M.dayInfo(c[0], M.doy(c[1], c[2])).len, c[3], 4 / 60, c[4]); });
  // 2026 equinoxes and solstices (UT): Mar 20 14:46, Jun 21 08:24, Sep 23 00:05, Dec 21 20:50
  near(M.decl(M.doy(3, 20), 14 + 46 / 60), 0, 0.01, 'declination 0 at the March 2026 equinox');
  near(M.decl(M.doy(9, 23), 5 / 60), 0, 0.01, 'declination 0 at the September 2026 equinox');
  near(M.decl(M.doy(6, 21), 8.4), 23.436, 0.005, 'declination +23.436 at the June 2026 solstice');
  near(M.decl(M.doy(12, 21), 20 + 50 / 60), -23.436, 0.005, 'declination -23.436 at the December 2026 solstice');
  // NOAA's shorter Fourier series agrees to within its own accuracy (about half a degree, a day's drift)
  var sp = 0; for (var n = 1; n <= 365; n++) { var g = 2 * Math.PI / 365 * (n - 1); var dS = (0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g)) * D; sp = Math.max(sp, Math.abs(dS - M.decl(n))); }
  ok(sp < 0.5, 'NOAA general series within 0.5° (' + sp.toFixed(2) + '°)');
  near(M.decl(M.doy(6, 21)), 23.44, 0.06, 'declination at the June solstice');
  near(M.decl(M.doy(12, 21)), -23.44, 0.06, 'declination at the December solstice');
  ok(Math.abs(M.decl(M.doy(3, 20))) < 0.45 && Math.abs(M.decl(M.doy(9, 22))) < 0.45, 'declination near 0 at the equinoxes');
  var fb = M.dayInfo(70, M.doy(6, 21)), fw = M.dayInfo(70, M.doy(12, 21));
  ok(fb.len === 24 && fb.polar === 'day' && fw.len === 0 && fw.polar === 'night', 'midnight sun and polar night at 70°N');
  var noon = M.sunPos(40, M.doy(3, 20), 12);
  near(noon.alt, 90 - 40 + M.decl(M.doy(3, 20)), 0.05, 'noon altitude = 90 - latitude + declination');
  near(noon.az, 180, 0.01, 'the noon sun is due south at 40°N');
  near(M.sunPos(-33.9, M.doy(6, 21), 12).az % 360, 0, 0.01, 'the noon sun is due north at 33.9°S');
  ok(M.sunPos(40, M.doy(6, 21), 9).az < 180 && M.sunPos(40, M.doy(6, 21), 15).az > 180, 'morning sun in the east, afternoon in the west');
  var di = M.dayInfo(40, M.doy(6, 21)), rise = M.sunPos(40, M.doy(6, 21), di.rise);
  near(rise.alt, -0.833, 0.06, 'altitude at the computed sunrise is -0.833°');
  ok(M.fmtTime(12) === '12:00 pm' && M.fmtTime(6.5) === '6:30 am' && M.fmtTime(18.25) === '6:15 pm', 'time formatting');
  var lr = M.longDays(40, 14);
  ok(lr.length === 1 && /^May [4-6]$/.test(M.fmtDay(lr[0].a)), 'at 40°N days reach 14 h in early May (' + M.fmtDay(lr[0].a) + ')');
  ok(M.longDays(25.76, 14).length === 0, 'at Miami days never reach 14 h sunrise to sunset');
  var ls = M.longDays(-40, 14);
  ok(ls.length === 1 && ls[0].b > 365, 'Southern Hemisphere long days wrap past New Year');
})();

// 3. dates
(function () {
  ok(M.doy(1, 1) === 1 && M.doy(12, 31) === 365 && M.doy(3, 1) === 60, 'day of year');
  ok(M.parseMD('04-15') === 105 && M.parseMD('02-30') === null && M.parseMD('x') === null, 'parse month-day');
  ok(M.mdStr(105) === '04-15' && M.fmtDay(105) === 'Apr 15' && M.fmtDay(365 + 32) === 'Feb 1', 'format day numbers, rolling into the next year');
  var ms = M.monthStarts(100, 420);
  ok(ms[0].n === 121 && ms[0].m === 5 && ms[ms.length - 1].n === 397 && ms[ms.length - 1].m === 2, 'month starts across New Year');
})();

// 4. planting calendar, by hand, and the data against the planner's own planting notes
(function () {
  var L = M.parseMD('04-15'), F = M.parseMD('10-15');
  var tom = M.cropCal(V.crops.tomatoes, [52, 120], true, L, F);
  ok(tom.p[0] === L + 14 && tom.p[1] === L + 28, 'tomatoes go out 2 to 4 weeks after the last frost');
  ok(tom.si[0] === L + 14 - 49 && tom.si[1] === L + 14 - 35, 'tomato seeds start 5 to 7 weeks before setting out');
  ok(tom.h[0] === L + 21 + 52 && tom.h[1] === F && !tom.warn, 'tomatoes are picked from first ripe fruit until the first fall frost');
  var pk = M.cropCal(V.crops.pumpkins, [85, 130], true, M.parseMD('06-01'), M.parseMD('09-01'));
  ok(pk.warn === 'none' && !pk.h, 'a 92-day season is too short for pumpkins');
  var ws = M.cropCal(V.crops.winter_squash, [80, 105], true, M.parseMD('05-10'), M.parseMD('09-10'));
  ok(ws.warn === 'late' && ws.h[1] === M.parseMD('09-10'), 'late squash varieties cut off by frost');
  var kale = M.cropCal(V.crops.kale, [55, 65], false, L, F);
  ok(kale.p[0] === L - 28 && kale.p[1] === L - 14, 'kale 2 to 4 weeks before the last frost');
  ok(kale.fall[0] === F - 14 - 65 && kale.fall[1] === F - 14 - 55, 'fall kale: count back days to harvest + 14-day fall factor');
  var cu = M.cropCal(V.crops.cucumbers, [45, 65], true, L, F);
  ok(cu.fall[1] === F - 14 - 14 - 45, 'fall cucumbers: add the 14-day frost-tender factor');
  var cp = M.cropCal(V.crops.cowpeas, [65, 125], true, L, F);
  ok(cp.fall[0] === F - 75 && cp.fall[1] === F - 65, 'cowpeas: last planting 65 to 75 days before first frost');
  // Southern Hemisphere: last frost in September, first frost in May of the next year
  var Ls = M.parseMD('09-20'), Fs = M.parseMD('05-01') + 365, ts = M.cropCal(V.crops.tomatoes, [52, 120], true, Ls, Fs);
  ok(M.fmtDay(ts.p[0]) === 'Oct 4' && M.fmtDay(ts.h[1]) === 'May 1', 'calendar works across New Year (Southern Hemisphere)');
  // every planting window matches the planner's own planting note (ps) for the crop
  var bad = [];
  CROPS.forEach(function (c) {
    var v = V.crops[c.k]; if (!v) { bad.push(c.k + ' missing'); return; }
    if (!v.pw) return;
    var ps = c.ps || '', w = v.pw.join(',');
    var want = /^0-2 weeks before/.test(ps) ? '-2,0' : /^2-4 weeks before/.test(ps) ? '-4,-2' : /^2 or more weeks after/.test(ps) ? '2,4' : /^around the average last spring frost/.test(ps) ? '-1,1' : null;
    if (want && want !== w) bad.push(c.k + ' ' + w + ' vs ' + want);
    if (want === '2,4' && !v.later) bad.push(c.k + ' should fade ("or more")');
    if (!c.dh) bad.push(c.k + ' has a planting window but no days to harvest');
    if (v.si && !(v.si[0] < v.si[1])) bad.push(c.k + ' si');
  });
  ok(!bad.length, 'planting windows match the planner notes: ' + bad.join('; '));
  ok(Object.keys(V.crops).length === CROPS.length, 'every crop has picture data');
  ok(V.crops.tomatoes.ht === 3 && V.crops.sweet_corn.ht === 3 && V.crops.carrots.ht === 1 && V.crops.apple.ht === 4, 'height ranks: corn and tomatoes tall, carrots low, trees tallest');
})();

// 5. weekly harvest keeps the totals
(function () {
  var items = [{ k: 'a', g: 0, lb: 10, h: [100, 130] }, { k: 'b', g: 2, lb: 7.5, h: [140, 141.5] }, { k: 'c', g: 2, lb: 3, h: [90, 200] }];
  var w = M.weekly(items, 80, 220), tot = w.reduce(function (s, x) { return s + x.tot; }, 0);
  near(tot, 20.5, 1e-9, 'weekly bins add up to the season total');
  near(w[3].crops.a, 10 / 30 * 7, 1e-9, 'an even share per week');
})();

// 6. layout: areas kept, pieces inside beds, tall crops north of short ones in each bed, farm planted share
(function () {
  function check(lay, items, label) {
    var by = {}; lay.pieces.forEach(function (p) { by[p.k] = (by[p.k] || 0) + p.w * p.h; });
    items.forEach(function (it) { near(by[it.k] || 0, it.a, 1e-6 * Math.max(1, it.a), label + ': area of ' + it.k); });
    var inside = lay.pieces.every(function (p) { return lay.beds.some(function (b) { return p.x >= b.x - 1e-6 && p.y >= b.y - 1e-6 && p.x + p.w <= b.x + b.w + 1e-6 && p.y + p.h <= b.y + b.h + 1e-6; }); });
    ok(inside, label + ': every piece inside a bed');
    var ht = {}; items.forEach(function (it) { ht[it.k] = it.ht; });
    var order = true;
    lay.pieces.forEach(function (a) { lay.pieces.forEach(function (b) {
      if (a.bed !== b.bed || ht[a.k] <= ht[b.k]) return;
      var aN = lay.south ? a.y + a.h : a.y, bN = lay.south ? b.y + b.h : b.y;
      if (lay.dir === 'ns' && (lay.south ? a.y < b.y + b.h - 1e-6 : a.y > b.y + 1e-6)) order = false;
      if (lay.dir === 'ew' && !lay.south && a.y > b.y + 1e-6) order = false;
    }); });
    ok(order, label + ': taller crops north of shorter ones in the same bed');
  }
  var items = [{ k: 'carrots', a: 10, ht: 1, g: 1 }, { k: 'tomatoes', a: 14, ht: 3, g: 2 }, { k: 'kale', a: 8, ht: 2, g: 3 }, { k: 'peas', a: 6, ht: 3, g: 0 }, { k: 'onions', a: 5, ht: 1, g: 1 }];
  var a = M.layoutBeds({ w: 5, l: 10, dir: 'ns', path: 1.25, items: items });
  ok(a.nb === 1 && a.W === 5 && a.H === 10, 'a 5 x 10 ft bed stays one bed');
  check(a, items, '5x10 north-south');
  ok(a.pieces[0].k === 'peas' || a.pieces[0].k === 'tomatoes', 'a tall crop at the north end');
  var openA = a.open.reduce(function (s, r) { return s + r.w * r.h; }, 0);
  near(openA, 50 - 43, 1e-6, 'unused room shown as open');
  var big = M.layoutBeds({ w: 20, l: 30, dir: 'ns', path: 3, items: items.map(function (x) { return { k: x.k, a: x.a * 12, ht: x.ht, g: x.g }; }) });
  ok(big.nb === 5 && Math.abs(big.bw - 4) < 1e-9 && Math.abs(big.W - (20 + 4 * 3)) < 1e-9, '20 ft wide becomes five 4 ft beds with four 3 ft paths');
  check(big, big.items, '20x30 north-south');
  var ew = M.layoutBeds({ w: 8, l: 12, dir: 'ew', path: 1.5, items: items });
  check(ew, items, '8x12 east-west'); ew.south = false;
  var so = M.layoutBeds({ w: 4, l: 12, dir: 'ns', path: 1.5, south: true, items: items }); so.south = true;
  check(so, items, 'Southern Hemisphere');
  ok(so.pieces[0].y + so.pieces[0].h > 11.99, 'Southern Hemisphere: tallest crop at the south end');
  var farm = M.layoutFarm({ land: 43560, items: [{ k: 'potatoes', a: 20000, ht: 2, g: 2 }, { k: 'sweet_corn', a: 14848, ht: 3, g: 2 }] });
  var planted = farm.beds.reduce(function (s, b) { return s + b.w * b.h; }, 0);
  near(planted / 43560, 0.8, 1e-9, 'farm: strips are 80% of the land');
  check(farm, farm.items, 'farm');
  var ar = M.layoutArea({ area: 20, items: [{ k: 'lettuce', a: 8, ht: 1, g: 3 }, { k: 'peppers', a: 9, ht: 2, g: 2 }] });
  near(ar.W * ar.H, 20, 1e-9, 'area mode keeps the area');
  var g = M.plantGrid({ x: 0, y: 0, w: 4, h: 3.5 }, 2);
  ok(g.pts.length === 2 && g.pts.every(function (p) { return p[0] > 0 && p[0] < 4 && p[1] > 0 && p[1] < 3.5; }), 'two tomato plants in their block');
  var g2 = M.plantGrid({ x: 0, y: 0, w: 4, h: 2.5 }, 40);
  ok(g2.pts.length === 40 && Math.abs(g2.s - Math.sqrt(0.25)) < 0.1, '40 carrots at about 6-inch spacing');
  var pots = M.layoutPots([{ sh: 'round', d: 12 }, { sh: 'round', d: 12 }, { sh: 'rect', l: 24, w: 8 }, { sh: 'round', d: 26 }], 4);
  var overlap = false; pots.pots.forEach(function (p, i) { pots.pots.forEach(function (q, j) { if (i < j && p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h) overlap = true; }); });
  ok(!overlap && Math.abs(pots.pots[0].w - 1) < 1e-9 && Math.abs(pots.pots[2].w - 2) < 1e-9, 'containers drawn to scale without overlapping');
  near(M.laneFrac(4, 0.8), (5 - Math.sqrt(25 - 4.8)) / 12, 1e-12, 'farm lane width');
})();

// 7. shade: a fence's shadow length, a long wall against the hand formula, the sky outline against the ray test
(function () {
  var n = M.doy(3, 20), dec = M.decl(n), alt = 90 - 40 + dec, s = M.sunVec(alt, 180);
  var fence = { kind: 'fence', x: 0, y: 0, ang: 0, w: 20, d: 0.01, h: 6 }, len = 6 / Math.tan(alt * Math.PI / 180);
  ok(M.hits(0, len - 0.3, s, fence) && !M.hits(0, len + 0.3, s, fence), 'a 6 ft fence at noon on the equinox at 40°N casts a ' + len.toFixed(2) + ' ft shadow');
  ok(!M.hits(0, -1, s, fence), 'nothing shades the sunny side of the fence');
  // a long east-west wall 6 ft tall, 6 ft south of the point: shaded while the sun is in the south and tan(profile angle) < 1
  [[40, M.doy(6, 21)], [40, M.doy(3, 20)], [40, M.doy(12, 21)], [30, M.doy(8, 1)], [50, M.doy(5, 1)]].forEach(function (c) {
    var lat = c[0], day = c[1], wall = { kind: 'fence', x: 0, y: -6 - 0.005, ang: 0, w: 4000, d: 0.01, h: 6 };
    var g = M.sunHours(lat, day, { x0: -0.05, y0: -0.05, w: 0.1, h: 0.1, nx: 1, ny: 1 }, [wall], 0.02);
    var info = M.dayInfo(lat, day), hand = 0, dt = 0.001, dc = M.decl(day);
    for (var t = info.rise; t < info.set; t += dt) { var p = M.sunAt(lat, dc, t + dt / 2); if (p.alt <= -0.833) continue; var v = M.sunVec(Math.max(p.alt, 0.05), p.az); var shaded = v[1] < 0 && v[2] / -v[1] < 1; if (!shaded) hand += dt; }
    near(g.h[0], hand, 0.05, 'sun hours behind a long wall at ' + lat + '°, day ' + day);
    near(g.open, info.len, 1e-9, 'open sky hours equal the day length');
  });
  // a point with no obstacle gets the whole day
  var free = M.sunHours(40, M.doy(6, 21), { x0: 0, y0: 0, w: 1, h: 1, nx: 1, ny: 1 }, [], 0.05);
  near(free.h[0], M.dayInfo(40, M.doy(6, 21)).len, 0.03, 'an open spot gets every hour from sunrise to sunset');
  // sky outline agrees with the ray test (tree and house), away from the outline's edge
  [M.obstacleFrom('tree', 200, 6, 30, 20, { W: 10, H: 10 }), M.obstacleFrom('house', 160, 10, 18, 30, { W: 10, H: 10 }), M.obstacleFrom('fence', 270, 2, 6, 16, { W: 4, H: 10 })].forEach(function (ob) {
    var sky = M.skyline(ob, 0, 0), agree = 0, total = 0;
    for (var i = 0; i < 360; i += 2) for (var el = 0.5; el < 89; el += 1.5) {
      var top = sky.top[i], bot = sky.bot[i];
      total++; if (M.hits(0, 0, M.sunVec(el, i + 0.5), ob) === (top >= 0 && el >= bot && el <= top)) agree++;
    }
    ok(agree / total > 0.999, ob.kind + ': sky outline matches the shade test (' + agree + '/' + total + ')');
  });
  var tr = M.obstacleFrom('tree', 180, 5, 30, 20, { W: 4, H: 10 });
  ok(Math.abs(tr.y - -(5 + 5 + 10)) < 1e-9 && Math.abs(tr.x) < 1e-9 && tr.cz === 20, 'a tree due south: 5 ft from a 4 x 10 ft bed, canopy center 20 ft up');
  var shp = M.shadow({ kind: 'fence', x: 0, y: 0, ang: 0, w: 10, d: 0.01, h: 6 }, s);
  var ys = shp.map(function (p) { return p[1]; });
  near(Math.max.apply(null, ys), len, 0.02, 'drawn shadow reaches as far as the shade test says');
})();

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
