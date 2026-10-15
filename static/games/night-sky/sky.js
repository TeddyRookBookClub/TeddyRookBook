/* Sky and Solar System model: where the Sun, Moon and planets are for any moment from 1800 to 2050.
   Planets: JPL "Approximate Positions of the Planets", Table 1 (1800 AD to 2050 AD), Keplerian elements and their rates,
   referred to the mean ecliptic and equinox of J2000 (E. M. Standish, ssd.jpl.nasa.gov/planets/approx_pos.html).
   Moon: the lunar series of J. Meeus, Astronomical Algorithms (2nd ed.), chapter 47 (main terms of ELP-2000/82),
   mean equinox of date, turned to J2000 with the precession formulas of chapter 21.
   Earth = Earth-Moon barycenter minus the Moon's share (mass ratio 81.30057, JPL).
   Times: JS milliseconds (UTC) in, Julian days in Terrestrial Time inside. ΔT from NASA's polynomial fits (Espenak and Meeus).
   Angles in degrees unless a name says rad. Distances in au, the Moon in km.
   Browser: window.NightSky. Node: module.exports. */
(function (root) {
  'use strict';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI, TAU = 2 * Math.PI;
  var K = {
    AU_KM: 149597870.7,          // IAU 2012
    C_AU_DAY: 173.1446327,       // speed of light, au per day
    R_EARTH: 6378.137,           // km, equatorial
    R_MOON: 1737.4,              // km, NASA Moon fact sheet
    R_SUN: 695700,               // km, IAU nominal
    EM_RATIO: 81.30056907,       // Earth mass / Moon mass, JPL
    OBL_J2000: 23.43928,         // obliquity of the ecliptic at J2000 used by the JPL page
    J2000: 2451545.0,
    SYNODIC: 29.530589,          // mean synodic month, days
    MIN_MS: Date.UTC(1800, 0, 1), MAX_MS: Date.UTC(2050, 11, 31, 23, 59)
  };
  var MU = 1 / (1 + K.EM_RATIO);

  /* ---------- time ---------- */
  function jdUT(ms) { return ms / 86400000 + 2440587.5; }
  function msFromJdUT(jd) { return (jd - 2440587.5) * 86400000; }
  /* ΔT = TT − UT in seconds. 1800–2005: NASA polynomial expressions (Espenak and Meeus);
     after 2005: straight lines through measured values (64.7 s in 2005, 69.2 s in 2020), then held at 69.2 s. */
  function deltaT(y) {
    var t;
    if (y < 1800) y = 1800;
    if (y < 1860) { t = y - 1800; return 13.72 - 0.332447 * t + 0.0068612 * t * t + 0.0041116 * t * t * t - 0.00037436 * Math.pow(t, 4) + 0.0000121272 * Math.pow(t, 5) - 0.0000001699 * Math.pow(t, 6) + 0.000000000875 * Math.pow(t, 7); }
    if (y < 1900) { t = y - 1860; return 7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t * t * t - 0.0004473624 * Math.pow(t, 4) + Math.pow(t, 5) / 233174; }
    if (y < 1920) { t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * Math.pow(t, 4); }
    if (y < 1941) { t = y - 1920; return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t * t * t; }
    if (y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547; }
    if (y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718; }
    if (y < 2005) { t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t + 0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5); }
    if (y < 2020) return 64.7 + (y - 2005) * (69.2 - 64.7) / 15;
    return 69.2;
  }
  function jdTT(ms) { var y = 1970 + ms / (365.2425 * 86400000); return jdUT(ms) + deltaT(y) / 86400; }
  function msFromJdTT(jd) { var ms = msFromJdUT(jd); return ms - deltaT(1970 + ms / (365.2425 * 86400000)) * 1000; }

  function norm360(a) { a %= 360; return a < 0 ? a + 360 : a; }
  function norm180(a) { a = norm360(a); return a > 180 ? a - 360 : a; }

  /* ---------- planets (JPL Table 1) ---------- */
  //            a (au)        e            I (deg)       L (deg)          long. peri.     long. node     then rates per Julian century
  var EL = [
    ['Mercury', [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593], [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
    ['Venus', [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255], [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
    ['Earth', [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0], [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
    ['Mars', [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891], [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
    ['Jupiter', [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
    ['Saturn', [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
    ['Uranus', [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
    ['Neptune', [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]]
  ];
  var PLANETS = EL.map(function (r) { return r[0]; });
  // nominal errors stated by JPL for Table 1: heliocentric longitude and latitude (arcsec), distance (1000 km)
  var ERR = { Mercury: [15, 1, 1], Venus: [20, 1, 4], Earth: [20, 8, 6], Mars: [40, 2, 25], Jupiter: [400, 10, 600], Saturn: [600, 25, 1500], Uranus: [50, 2, 1000], Neptune: [10, 1, 200] };

  function elements(i, T) {
    var e0 = EL[i][1], r = EL[i][2];
    return { a: e0[0] + r[0] * T, e: e0[1] + r[1] * T, I: e0[2] + r[2] * T, L: e0[3] + r[3] * T, w: e0[4] + r[4] * T, O: e0[5] + r[5] * T };
  }
  /* Kepler's equation M = E − e·sin E (degrees), Newton's method to 1e-6° as the JPL page asks. */
  function kepler(Mdeg, e) {
    var M = norm180(Mdeg), es = e * R2D, E = M + es * Math.sin(M * D2R), dE = 1, n = 0;
    while (Math.abs(dE) > 1e-6 && n++ < 30) {
      var dM = M - (E - es * Math.sin(E * D2R));
      dE = dM / (1 - e * Math.cos(E * D2R)); E += dE;
    }
    return E;
  }
  /* position in the orbit plane → J2000 ecliptic (x toward the March equinox, z toward the north ecliptic pole) */
  function orbitToEcl(el, xp, yp, out) {
    var w = (el.w - el.O) * D2R, O = el.O * D2R, I = el.I * D2R;
    var cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
    out.x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp;
    out.y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp;
    out.z = (sw * sI) * xp + (cw * sI) * yp;
    return out;
  }
  /* Heliocentric J2000 ecliptic position (au) of planet i (index 2 is the Earth-Moon barycenter) at Julian day jd (TT). */
  function helio(i, jd, out) {
    var T = (jd - K.J2000) / 36525, el = elements(i, T);
    var E = kepler(el.L - el.w, el.e) * D2R;
    return orbitToEcl(el, el.a * (Math.cos(E) - el.e), el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E), out || {});
  }
  /* The orbit as a closed path of n points (au), for drawing. */
  function orbitPath(i, jd, n) {
    var T = (jd - K.J2000) / 36525, el = elements(i, T), pts = [], b = el.a * Math.sqrt(1 - el.e * el.e);
    for (var k = 0; k <= n; k++) {
      var E = TAU * k / n, p = orbitToEcl(el, el.a * (Math.cos(E) - el.e), b * Math.sin(E), {});
      pts.push(p);
    }
    return pts;
  }
  function period(i) { return 365.25 * Math.pow(EL[i][1][0], 1.5); } // days, from Kepler's third law (a in au)
  function siderealPeriod(i) { return 36525 * 360 / EL[i][2][3]; }    // days, from the rate of mean longitude

  /* ---------- precession of ecliptic coordinates (Meeus, eq. 21.5–21.7) ---------- */
  // from epoch T0 (centuries from J2000) to epoch T0 + t
  function precessEcl(lon, lat, T0, t) {
    var as = D2R / 3600;
    var eta = ((47.0029 - 0.06603 * T0 + 0.000598 * T0 * T0) * t + (-0.03302 + 0.000598 * T0) * t * t + 0.000060 * t * t * t) * as;
    var Pi = 174.876384 * D2R + ((3289.4789 * T0 + 0.60622 * T0 * T0) - (869.8089 + 0.50491 * T0) * t + 0.03536 * t * t) * as;
    var p = ((5029.0966 + 2.22226 * T0 - 0.000042 * T0 * T0) * t + (1.11113 - 0.000042 * T0) * t * t - 0.000006 * t * t * t) * as;
    var l0 = lon * D2R, b0 = lat * D2R;
    var A = Math.cos(eta) * Math.cos(b0) * Math.sin(Pi - l0) - Math.sin(eta) * Math.sin(b0);
    var B = Math.cos(b0) * Math.cos(Pi - l0);
    var C = Math.cos(eta) * Math.sin(b0) + Math.sin(eta) * Math.cos(b0) * Math.sin(Pi - l0);
    return { lon: norm360((p + Pi - Math.atan2(A, B)) * R2D), lat: Math.asin(Math.max(-1, Math.min(1, C))) * R2D };
  }
  function toDate(lon, lat, jd) { var T = (jd - K.J2000) / 36525; return precessEcl(lon, lat, 0, T); }
  function toJ2000(lon, lat, jd) { var T = (jd - K.J2000) / 36525; return precessEcl(lon, lat, T, -T); }

  /* ---------- the Moon (Meeus, chapter 47) ---------- */
  // longitude (1e-6 deg) and distance (0.001 km) terms: D, M, M', F, Σl, Σr
  var LR = [
    [0, 0, 1, 0, 6288774, -20905355], [2, 0, -1, 0, 1274027, -3699111], [2, 0, 0, 0, 658314, -2955968], [0, 0, 2, 0, 213618, -569925],
    [0, 1, 0, 0, -185116, 48888], [0, 0, 0, 2, -114332, -3149], [2, 0, -2, 0, 58793, 246158], [2, -1, -1, 0, 57066, -152138],
    [2, 0, 1, 0, 53322, -170733], [2, -1, 0, 0, 45758, -204586], [0, 1, -1, 0, -40923, -129620], [1, 0, 0, 0, -34720, 108743],
    [0, 1, 1, 0, -30383, 104755], [2, 0, 0, -2, 15327, 10321], [0, 0, 1, 2, -12528, 0], [0, 0, 1, -2, 10980, 79661],
    [4, 0, -1, 0, 10675, -34782], [0, 0, 3, 0, 10034, -23210], [4, 0, -2, 0, 8548, -21636], [2, 1, -1, 0, -7888, 24208],
    [2, 1, 0, 0, -6766, 30824], [1, 0, -1, 0, -5163, -8379], [1, 1, 0, 0, 4987, -16675], [2, -1, 1, 0, 4036, -12831],
    [2, 0, 2, 0, 3994, -10445], [4, 0, 0, 0, 3861, -11650], [2, 0, -3, 0, 3665, 14403], [0, 1, -2, 0, -2689, -7003],
    [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 10056], [1, 0, 1, 0, -2348, 6322], [2, -2, 0, 0, 2236, -9884],
    [0, 1, 2, 0, -2120, 5751], [0, 2, 0, 0, -2069, 0], [2, -2, -1, 0, 2048, -4950], [2, 0, 1, -2, -1773, 4130],
    [2, 0, 0, 2, -1595, 0], [4, -1, -1, 0, 1215, -3958], [0, 0, 2, 2, -1110, 0], [3, 0, -1, 0, -892, 3258],
    [2, 1, 1, 0, -810, 2616], [4, -1, -2, 0, 759, -1897], [0, 2, -1, 0, -713, -2117], [2, 2, -1, 0, -700, 2354],
    [2, 1, -2, 0, 691, 0], [2, -1, 0, -2, 596, 0], [4, 0, 1, 0, 549, -1423], [0, 0, 4, 0, 537, -1117],
    [4, -1, 0, 0, 520, -1571], [1, 0, -2, 0, -487, -1739], [2, 1, 0, -2, -399, 0], [0, 0, 2, -2, -381, -4421],
    [1, 1, 1, 0, 351, 0], [3, 0, -2, 0, -340, 0], [4, 0, -3, 0, 330, 0], [2, -1, 2, 0, 327, 0],
    [0, 2, 1, 0, -323, 1165], [1, 1, -1, 0, 299, 0], [2, 0, 3, 0, 294, 0], [2, 0, -1, -2, 0, 8752]
  ];
  // latitude terms (1e-6 deg): D, M, M', F, Σb
  var BT = [
    [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237], [2, 0, -1, 1, 55413],
    [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198], [2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822],
    [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324], [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463],
    [2, -1, 0, 1, 2211], [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870], [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794],
    [0, 0, 0, 3, -1749], [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491], [0, 1, 1, 1, -1475], [0, 1, 1, -1, -1410],
    [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335], [0, 0, 3, 1, 1107], [4, 0, 0, -1, 1021], [4, 0, -1, 1, 833],
    [0, 0, 1, -3, 777], [4, 0, -2, 1, 671], [2, 0, 0, -3, 607], [2, 0, 2, -1, 596], [2, -1, 1, -1, 491],
    [2, 0, -2, 1, -451], [0, 0, 3, -1, 439], [2, 0, 2, 1, 422], [2, 0, -3, -1, 421], [2, 1, -1, 1, -366],
    [2, 1, 0, 1, -351], [4, 0, 0, 1, 331], [2, -1, 1, 1, 315], [2, -2, 0, -1, 302], [0, 0, 1, 3, -283],
    [2, 1, 1, -1, -229], [1, 1, 0, -1, 223], [1, 1, 0, 1, 223], [0, 1, -2, -1, -220], [2, 1, -1, -1, -220],
    [1, 0, 1, 1, -185], [2, -1, -2, -1, 181], [0, 1, 2, 1, -177], [4, 0, -2, -1, 176], [4, -1, -1, -1, 166],
    [1, 0, 1, -1, -164], [4, 0, 1, -1, 132], [1, 0, -1, -1, -119], [4, -1, 0, -1, 115], [2, -2, 0, 1, 107]
  ];
  /* Geocentric Moon, mean equinox of date: lon, lat (deg), dist (km); also the sums, for checking against Meeus's example. */
  function moonDate(jd) {
    var T = (jd - K.J2000) / 36525, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
    var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
    var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
    var A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T, A3 = 313.45 + 481266.484 * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T2, E2 = E * E;
    var d = norm360(D) * D2R, m = norm360(M) * D2R, mp = norm360(Mp) * D2R, f = norm360(F) * D2R;
    var sl = 0, sr = 0, sb = 0, i, r, arg, ef;
    for (i = 0; i < LR.length; i++) {
      r = LR[i]; arg = r[0] * d + r[1] * m + r[2] * mp + r[3] * f;
      ef = r[1] === 0 ? 1 : (r[1] === 1 || r[1] === -1) ? E : E2;
      if (r[4]) sl += r[4] * ef * Math.sin(arg);
      if (r[5]) sr += r[5] * ef * Math.cos(arg);
    }
    for (i = 0; i < BT.length; i++) {
      r = BT[i]; arg = r[0] * d + r[1] * m + r[2] * mp + r[3] * f;
      ef = r[1] === 0 ? 1 : (r[1] === 1 || r[1] === -1) ? E : E2;
      sb += r[4] * ef * Math.sin(arg);
    }
    var lp = norm360(Lp) * D2R;
    sl += 3958 * Math.sin(A1 * D2R) + 1962 * Math.sin(lp - f) + 318 * Math.sin(A2 * D2R);
    sb += -2235 * Math.sin(lp) + 382 * Math.sin(A3 * D2R) + 175 * Math.sin(A1 * D2R - f) + 175 * Math.sin(A1 * D2R + f) + 127 * Math.sin(lp - mp) - 115 * Math.sin(lp + mp);
    return { lon: norm360(Lp + sl / 1e6), lat: sb / 1e6, dist: 385000.56 + sr / 1000, sl: sl, sb: sb, sr: sr, F: norm360(F) };
  }
  /* Mean longitude of the Moon's ascending node, mean equinox of date (Meeus eq. 47.7). */
  function moonNodeDate(jd) {
    var T = (jd - K.J2000) / 36525;
    return norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000);
  }
  /* Geocentric Moon in the J2000 ecliptic frame: lon, lat (deg), dist (km), and x, y, z (km). */
  function moon(jd) {
    var m = moonDate(jd), q = toJ2000(m.lon, m.lat, jd), cl = Math.cos(q.lat * D2R);
    return { lon: q.lon, lat: q.lat, dist: m.dist, x: m.dist * cl * Math.cos(q.lon * D2R), y: m.dist * cl * Math.sin(q.lon * D2R), z: m.dist * Math.sin(q.lat * D2R) };
  }

  /* ---------- Earth, Sun and geocentric planets ---------- */
  function earth(jd, out) {
    var b = helio(2, jd, out || {}), m = moon(jd), k = MU / K.AU_KM;
    b.x -= m.x * k; b.y -= m.y * k; b.z -= m.z * k; return b;
  }
  function emVel(jd) { var a = helio(2, jd - 0.05), b = helio(2, jd + 0.05); return { x: (b.x - a.x) / 0.1, y: (b.y - a.y) / 0.1, z: (b.z - a.z) / 0.1 }; }
  function sph(v) { var r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); return { lon: norm360(Math.atan2(v.y, v.x) * R2D), lat: Math.asin(v.z / r) * R2D, r: r }; }
  /* Apparent geocentric direction (J2000 ecliptic) of body i (0–7 planets, 'sun'), with light time and annual aberration. */
  function geo(i, jd, Eopt) {
    var E = Eopt || earth(jd), v = emVel(jd), d, dist;
    if (i === 'sun') { d = { x: -E.x, y: -E.y, z: -E.z }; }
    else {
      var P = helio(i, jd), tau = 0;
      for (var k = 0; k < 2; k++) {
        d = { x: P.x - E.x, y: P.y - E.y, z: P.z - E.z };
        tau = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z) / K.C_AU_DAY; P = helio(i, jd - tau);
      }
      d = { x: P.x - E.x, y: P.y - E.y, z: P.z - E.z };
    }
    dist = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z);
    var u = { x: d.x / dist + v.x / K.C_AU_DAY, y: d.y / dist + v.y / K.C_AU_DAY, z: d.z / dist + v.z / K.C_AU_DAY };
    var s = sph(u); s.r = dist; return s;
  }
  function sep(l1, b1, l2, b2) {
    var c = Math.sin(b1 * D2R) * Math.sin(b2 * D2R) + Math.cos(b1 * D2R) * Math.cos(b2 * D2R) * Math.cos((l1 - l2) * D2R);
    return Math.acos(Math.max(-1, Math.min(1, c))) * R2D;
  }
  /* Everything at one moment: heliocentric planets, Earth, Moon, Sun, and the planets seen from Earth. */
  function snapshot(jd) {
    var E = earth(jd), sun = geo('sun', jd, E), m = moon(jd), out = { jd: jd, earth: E, sun: sun, moon: m, helio: [], geo: [] };
    for (var i = 0; i < 8; i++) {
      out.helio.push(i === 2 ? E : helio(i, jd));
      if (i === 2) { out.geo.push(null); continue; }
      var g = geo(i, jd, E);
      g.elong = sep(g.lon, g.lat, sun.lon, sun.lat); g.east = norm180(g.lon - sun.lon) > 0; // east of the Sun: evening sky
      out.geo.push(g);
    }
    var ph = phase(jd, m, sun); out.phase = ph;
    return out;
  }

  /* ---------- Moon phase ---------- */
  function phase(jd, mopt, sopt) {
    var m = mopt || moon(jd), s = sopt || geo('sun', jd);
    var D = norm360(m.lon - s.lon);                           // elongation in longitude: 0 new, 90 first quarter, 180 full, 270 last quarter
    var psi = sep(m.lon, m.lat, s.lon, s.lat) * D2R;           // true angle between the Moon and the Sun as seen from Earth
    var R = s.r * K.AU_KM, dm = m.dist;
    var i = Math.atan2(R * Math.sin(psi), dm - R * Math.cos(psi)); // phase angle at the Moon (Sun–Moon–Earth)
    return { D: D, psi: psi * R2D, i: i * R2D, k: (1 + Math.cos(i)) / 2, waxing: D < 180 };
  }
  /* The moment (jd TT) nearest to jd0 in direction dir (+1 next, −1 previous, 0 nearest) when the elongation equals target. */
  function findPhase(jd0, target, dir) {
    var D = phase(jd0).D, rate = 12.190749;
    var diff = norm360(target - D), dt;
    if (dir > 0) dt = diff / rate; else if (dir < 0) dt = (diff - 360) / rate; else dt = norm180(diff) / rate;
    if (dir > 0 && dt < 1e-4) dt += 360 / rate;
    var jd = jd0 + dt;
    for (var k = 0; k < 8; k++) { var e = norm180(target - phase(jd).D); jd += e / rate; if (Math.abs(e) < 1e-7) break; }
    return jd;
  }
  /* All primary phases between jdA and jdB: [{jd, q}] with q = 0 new, 1 first quarter, 2 full, 3 last quarter. */
  function phasesBetween(jdA, jdB) {
    var out = [], D = phase(jdA).D, q = Math.floor(D / 90) + 1, jd = jdA;
    for (var n = 0; n < 20000; n++) {
      var tq = (q % 4) * 90, t = findPhase(jd, tq, 1);
      if (t > jdB) break;
      if (t >= jdA) out.push({ jd: t, q: q % 4 });
      jd = t + 1; q++;
    }
    return out;
  }

  /* ---------- eclipses ---------- */
  /* At a new moon (q 0) or full moon (q 2) at jd: closest approach of the Moon to the Sun (or to the center of Earth's shadow),
     found by a golden-section search over ±6 h, and the type of eclipse, if any. Geometry as seen from Earth's center:
     solar: some eclipse on Earth if the gap < π☾ − π☉ + s☾ + s☉; the shadow axis hits Earth if the gap < π☾ − π☉.
     lunar: Earth's shadow radii at the Moon's distance, with Earth made 1% larger for its atmosphere (Danjon's rule, used by NASA's eclipse pages):
     umbra 1.01π☾ + π☉ − s☉, penumbra 1.01π☾ + π☉ + s☉. */
  function gapAt(jd, solar) {
    var m = moon(jd), s = geo('sun', jd), l = solar ? s.lon : s.lon + 180, b = solar ? s.lat : -s.lat;
    return { gap: sep(m.lon, m.lat, l, b), m: m, s: s };
  }
  function eclipse(jd, q) {
    var solar = q === 0, a = jd - 0.25, b = jd + 0.25, g = 0.381966, x1 = a + g * (b - a), x2 = b - g * (b - a);
    var f1 = gapAt(x1, solar).gap, f2 = gapAt(x2, solar).gap;
    for (var k = 0; k < 40; k++) {
      if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = a + g * (b - a); f1 = gapAt(x1, solar).gap; }
      else { a = x1; x1 = x2; f1 = f2; x2 = b - g * (b - a); f2 = gapAt(x2, solar).gap; }
    }
    var tm = (a + b) / 2, G = gapAt(tm, solar), gap = G.gap, dm = G.m.dist, R = G.s.r;
    var piM = Math.asin(K.R_EARTH / dm) * R2D, piS = 8.794143 / 3600 / R, sM = Math.asin(K.R_MOON / dm) * R2D, sS = 959.63 / 3600 / R;
    var res = { jd: tm, solar: solar, gap: gap, lat: G.m.lat, piM: piM, sM: sM, sS: sS, type: null, mag: 0 };
    if (solar) {
      var lim = piM - piS + sM + sS, ax = piM - piS;
      if (gap < lim) {
        res.mag = (lim - gap) / (2 * sS);      // fraction of the Sun's diameter covered at the best spot, roughly
        if (gap < ax) {
          var gam = gap / ax, near = dm - K.R_EARTH * Math.sqrt(1 - gam * gam);
          var sNear = Math.asin(K.R_MOON / near) * R2D, sFar = Math.asin(K.R_MOON / Math.sqrt(dm * dm - K.R_EARTH * K.R_EARTH)) * R2D;
          res.gamma = gam;
          res.type = sNear > sS ? (sFar < sS ? 'hybrid' : 'total') : 'annular';
        } else res.type = 'partial';
      }
    } else {
      var ru = 1.01 * piM + piS - sS, rp = 1.01 * piM + piS + sS;
      res.umag = (ru + sM - gap) / (2 * sM); res.pmag = (rp + sM - gap) / (2 * sM); res.ru = ru; res.rp = rp;
      if (gap < ru - sM) res.type = 'total'; else if (gap < ru + sM) res.type = 'partial'; else if (gap < rp + sM) res.type = 'penumbral';
      res.mag = res.umag;
    }
    return res;
  }
  /* Eclipses between two dates: [{jd, solar, type, ...}] */
  function eclipsesBetween(jdA, jdB) {
    return phasesBetween(jdA, jdB).filter(function (p) { return p.q === 0 || p.q === 2; }).map(function (p) {
      var m = moon(p.jd);
      if (Math.abs(m.lat) > 1.7) return null;   // far from a node: no eclipse possible (the widest limit is about 1.6°)
      var e = eclipse(p.jd, p.q); e.phaseJd = p.jd; return e.type ? e : null;
    }).filter(Boolean);
  }

  /* ---------- sky for an observer ---------- */
  function obliquityDate(jd) { var T = (jd - K.J2000) / 36525; return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T; }
  function eclToEq(lon, lat, eps) {
    var l = lon * D2R, b = lat * D2R, e = eps * D2R;
    var ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
    var dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
    return { ra: norm360(ra * R2D), dec: dec * R2D };
  }
  function eqToEcl(ra, dec, eps) {
    var a = ra * D2R, d = dec * D2R, e = eps * D2R;
    var lon = Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e), Math.cos(a));
    var lat = Math.asin(Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a));
    return { lon: norm360(lon * R2D), lat: lat * R2D };
  }
  /* Right ascension and declination, mean equinox of date, from J2000 ecliptic lon/lat. */
  function radecDate(lon, lat, jd) { var q = toDate(lon, lat, jd); return eclToEq(q.lon, q.lat, obliquityDate(jd)); }
  /* Greenwich mean sidereal time (deg) at a UT Julian day (Meeus eq. 12.4). */
  function gmst(jdu) { var T = (jdu - K.J2000) / 36525; return norm360(280.46061837 + 360.98564736629 * (jdu - K.J2000) + 0.000387933 * T * T - T * T * T / 38710000); }
  function altAz(ha, dec, lat) {
    var H = ha * D2R, d = dec * D2R, p = lat * D2R;
    var alt = Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H));
    var az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(p) - Math.tan(d) * Math.cos(p)); // from south, westward (Meeus)
    return { alt: alt * R2D, az: norm360(az * R2D + 180) };                                  // azimuth from north, eastward
  }
  /* Hour angle (deg) when a body of declination dec sits at altitude h0 for latitude lat; NaN if it never does. */
  function hourAngleAt(h0, dec, lat) {
    var c = (Math.sin(h0 * D2R) - Math.sin(lat * D2R) * Math.sin(dec * D2R)) / (Math.cos(lat * D2R) * Math.cos(dec * D2R));
    if (c < -1) return 180; if (c > 1) return NaN;      // 180: never sets (above h0 all day); NaN: never rises
    return Math.acos(c) * R2D;
  }
  /* Sunset or sunrise (UT ms) at longitude lonE (deg, east positive), latitude lat, near the local day of msNoonUT. */
  function sunEvent(msNear, lat, lonE, set) {
    var ms = msNear, ok = true;
    for (var k = 0; k < 4; k++) {
      var jd = jdTT(ms), s = geo('sun', jd), eq = radecDate(s.lon, s.lat, jd), H0 = hourAngleAt(-0.8333, eq.dec, lat);
      if (isNaN(H0) || H0 === 180) { ok = false; break; }
      var lst = norm360(gmst(jdUT(ms)) + lonE), ha = norm180(lst - eq.ra), want = set ? H0 : -H0;
      ms += norm180(want - ha) / 360.9856 * 86400000;
    }
    return ok ? ms : NaN;
  }
  /* The sky above an observer at latitude lat and longitude lonE at UT ms: Sun, Moon and bright planets with altitude and azimuth. */
  function skyAt(ms, lat, lonE) {
    var jd = jdTT(ms), lst = norm360(gmst(jdUT(ms)) + lonE), E = earth(jd), out = [];
    function add(name, lon, lat2, extra) {
      var eq = radecDate(lon, lat2, jd), h = altAz(lst - eq.ra, eq.dec, lat), o = { name: name, alt: h.alt, az: h.az, ra: eq.ra, dec: eq.dec, lon: lon, lat: lat2 };
      for (var k in extra) o[k] = extra[k]; out.push(o); return o;
    }
    var s = geo('sun', jd, E); add('Sun', s.lon, s.lat);
    var m = moon(jd), mp = phase(jd, m, s);
    // the Moon is close: correct its altitude for parallax (seen from the ground, not Earth's center)
    var mo = add('Moon', m.lon, m.lat, { k: mp.k, waxing: mp.waxing }); mo.alt -= Math.asin(K.R_EARTH / m.dist * Math.cos(mo.alt * D2R)) * R2D;
    [0, 1, 3, 4, 5].forEach(function (i) { var g = geo(i, jd, E); add(PLANETS[i], g.lon, g.lat, { idx: i, elong: sep(g.lon, g.lat, s.lon, s.lat) }); });
    return { lst: lst, bodies: out };
  }

  var api = {
    K: K, ERR: ERR, PLANETS: PLANETS, D2R: D2R, R2D: R2D, norm360: norm360, norm180: norm180,
    jdUT: jdUT, jdTT: jdTT, msFromJdUT: msFromJdUT, msFromJdTT: msFromJdTT, deltaT: deltaT,
    elements: elements, kepler: kepler, helio: helio, orbitPath: orbitPath, period: period, siderealPeriod: siderealPeriod,
    precessEcl: precessEcl, toDate: toDate, toJ2000: toJ2000,
    moonDate: moonDate, moonNodeDate: moonNodeDate, moon: moon, earth: earth, geo: geo, sep: sep, sph: sph, snapshot: snapshot,
    phase: phase, findPhase: findPhase, phasesBetween: phasesBetween, eclipse: eclipse, eclipsesBetween: eclipsesBetween,
    obliquityDate: obliquityDate, eclToEq: eclToEq, eqToEcl: eqToEcl, radecDate: radecDate, gmst: gmst, altAz: altAz,
    hourAngleAt: hourAngleAt, sunEvent: sunEvent, skyAt: skyAt
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.NightSky = api;
})(typeof window !== 'undefined' ? window : this);
