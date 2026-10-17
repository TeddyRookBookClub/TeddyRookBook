/* Earth & Space Ladder, Earth Science (earthsci): problem generators for every topic.
   Built from /tmp/work_earthsci/src/g*.js by build.js; edit the sources, not this file. g = 9.8 m/s². */
(function (ML) {
  'use strict';
  // ---------- g00_head.js ----------
  var G = ML.gen, T = ML.T, U = ML.util, MA = Math;
  function fix(x) { return U.fix(x); }
  function rnd(x, dp) { return U.round(x, dp); }
  function sig(x, s) { if (!x) return 0; var e = MA.floor(MA.log10(MA.abs(x))), p = MA.pow(10, s - 1 - e); return fix(MA.round(x * p) / p); }
  // a number as TeX: no float noise, thousands commas from 1,000 up (10,000 and up in text too)
  function N(x) { x = fix(x); return MA.abs(x) >= 1000 ? T.commas(x) : T.num(x); }
  // a unit as TeX ('m/s²' -> \mathrm{m/s^2}); Q(x, u) a quantity
  function uT(u) {
    if (u === '°C') return '^{\\circ}\\mathrm{C}';
    if (u === '°F') return '^{\\circ}\\mathrm{F}';
    if (u === '°') return '^{\\circ}';
    if (u === '%') return '\\%';
    return '\\mathrm{' + u.replace(/²/g, '^2').replace(/³/g, '^3').replace(/ /g, '\\ ').replace(/·/g, '\\cdot ').replace(/μ/g, '\\mu ') + '}';
  }
  function Q(x, u) { return N(x) + (u === '°C' || u === '°F' || u === '°' || u === '%' ? '' : '\\,') + uT(u); }
  function M(s) { return '$' + s + '$'; } // inline math
  function MQ(x, u) { return M(Q(x, u)); } // a quantity in inline math
  function D(x) { return M(N(x) + '^{\\circ}'); } // degrees
  // answer specs
  function vstr(x) { x = fix(x); if (Number.isInteger(x)) return String(x); var s = String(x); return s.length > 9 ? String(sig(x, 5)) : s; }
  function num(x, rtol) { return { t: 'num', v: vstr(x), rtol: rtol == null ? 0.02 : rtol }; }
  function exact(x) { return { t: 'num', v: typeof x === 'string' ? x : vstr(x) }; }
  function mc(right, wrongs) { return U.mc(right, wrongs, 4); }
  function mcAll(right, wrongs) { return U.mc(right, wrongs, 1 + wrongs.length); }
  function mcK(choices, idx) { return { t: 'mc', choices: choices, v: idx, keep: true }; } // fixed order (letters, orderings)
  function tf(v) { return { t: 'tf', v: !!v }; }
  function text(list) { return { t: 'text', v: list }; }
  // letters in order: accepts "DBAC", "D B A C", "D, B, A, C", "D-B-A-C", "D → B → A → C", "D > B > A > C"
  function orderSpec(letters) {
    var seps = ['', ' ', ',', ', ', '-', ' - ', '→', ' → ', '>', ' > ', ' then '], out = [];
    seps.forEach(function (s) { out.push(letters.join(s)); });
    out.push(letters.slice(0, -1).join(', ') + ' and ' + letters[letters.length - 1]);
    out.push(letters.slice(0, -1).join(', ') + ', then ' + letters[letters.length - 1]);
    return { t: 'text', v: out };
  }
  // a problem: q, a, steps, hint, and extras (unit, viz, vk = the kind of check verify.js applies)
  function pr(q, a, steps, hint, x) { var p = { q: q, a: a, steps: steps, hint: hint }; if (x) for (var k in x) { if (x[k] === undefined) continue; p[/^(q|a|steps|hint|id|seed|level)$/.test(k) ? 'x_' + k : k] = x[k]; } return p; }
  // pick one of several problem makers by level: lv(R, ctx, [makers at 1], [at 2], [at 3])
  function lv(R, ctx, a, b, c) { var list = ML.byLevel(ctx, a, b, c); return R.pick(list)(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var NAMES = ['Maya', 'Leo', 'Ana', 'Sam', 'Priya', 'Jamal', 'Kenji', 'Rosa', 'Omar', 'Lily', 'Diego', 'Nora', 'Eli', 'Zara', 'Ben', 'Mei', 'Tariq', 'Ivy'];
  function nm(R) { return R.pick(NAMES); }
  function frac(n, d) { return '\\dfrac{' + n + '}{' + d + '}'; }
  function an(x) { var i = String(MA.floor(MA.abs(fix(x)))), lead = i.length % 3 === 0 ? i.slice(0, 3) : i.slice(0, i.length % 3); return (i.charAt(0) === '8' || lead === '11' || lead === '18') ? 'an' : 'a'; }
  var LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // a statement bank as a true/false problem: items [[statement, true|false, why], …]
  function tfq(R, items, hint, vk) {
    var K = R.pick(items);
    return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'So the statement is true.' : 'So the statement is false.'], hint, { vk: vk || 'concept' });
  }
  // a multiple-choice problem from a bank: items [[question, right, [wrongs], why], …]
  function mcq(R, items, hint, vk) {
    var K = R.pick(items);
    return pr(K[0], mc(K[1], K[2]), [K[3], 'Answer: ' + K[1] + '.'], hint, { vk: vk || 'concept' });
  }
  /* es-strata letters: the visual letters deposits, lava flows, intrusions, faults and buried erosion surfaces in a shuffled
     order drawn from mulberry32(seed * 31 + 5). This copies that rule so a problem and its picture agree (checked in the browser). */
  function mulberry(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = MA.imul(t ^ t >>> 15, t | 1); t ^= t + MA.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function strataLetters(events, seed) {
    var feats = [];
    events.forEach(function (e, i) { if (e.t === 'deposit' || e.t === 'lava' || e.t === 'intrude' || e.t === 'fault') feats.push(i); else if (e.t === 'erode' && events.slice(i + 1).some(function (q) { return q.t === 'deposit' || q.t === 'lava'; })) feats.push(i); });
    var rs = mulberry(seed * 31 + 5), perm = feats.slice(), out = {};
    for (var p = perm.length - 1; p > 0; p--) { var q = MA.floor(rs() * (p + 1)), tq = perm[p]; perm[p] = perm[q]; perm[q] = tq; }
    perm.forEach(function (fi, li) { out[fi] = LET[li]; });
    return out; // event index -> letter
  }

  // ---------- g01_studying.js ----------
  // ===================== Unit 1: Studying Earth =====================
  var SPHERES = ['Geosphere', 'Hydrosphere', 'Atmosphere', 'Biosphere'];
  var SPH_ITEMS = [
    ['a granite boulder', 0], ['sand on a beach', 0], ['magma deep underground', 0], ['Earth\'s iron core', 0], ['a mountain range', 0], ['a layer of clay', 0], ['a grain of volcanic ash', 0],
    ['a glacier', 1], ['groundwater in the spaces between sand grains', 1], ['the Pacific Ocean', 1], ['an iceberg', 1], ['a river', 1], ['sea ice', 1], ['a lake', 1],
    ['the wind', 2], ['the ozone layer', 2], ['carbon dioxide gas in the air', 2], ['the nitrogen gas in the air', 2], ['water vapor in the air', 2],
    ['a mushroom', 3], ['bacteria in the soil', 3], ['a pine forest', 3], ['plankton drifting in the ocean', 3], ['a herd of elk', 3], ['a coral polyp', 3]
  ];
  var SPH_PAIRS = [
    ['Wind blows sand into dunes.', [2, 0]], ['Water evaporates from the ocean.', [1, 2]], ['Tree roots grow into a crack and split a rock.', [3, 0]],
    ['A fish takes in oxygen dissolved in a lake.', [3, 1]], ['A volcano puffs gases into the air.', [0, 2]], ['Grass takes in carbon dioxide from the air.', [3, 2]],
    ['Waves wear away a rocky cliff.', [1, 0]], ['A deer drinks from a stream.', [3, 1]], ['Groundwater slowly dissolves limestone.', [1, 0]],
    ['Wind whips up waves on a lake.', [2, 1]], ['Earthworms mix fallen leaves into the soil.', [3, 0]], ['A dust storm lifts soil high into the sky.', [2, 0]]
  ];
  var SPH_FLOWS = [
    ['A plant takes in carbon dioxide from the air to build its leaves.', 2, 3], ['A volcano releases gases from deep inside Earth into the air.', 0, 2],
    ['A fallen tree rots and becomes part of the soil.', 3, 0], ['A river dissolves salt from rocks and carries it to the sea.', 0, 1],
    ['Animals breathe out carbon dioxide.', 3, 2], ['Shells of dead sea creatures pile up and harden into limestone.', 3, 0],
    ['Water evaporates from a lake.', 1, 2], ['Water vapor in the air condenses into dew on a cold rock.', 2, 1], ['A camel drinks from a desert spring.', 1, 3]
  ];
  G('earthsci.earth-systems', function (R, ctx) {
    function sortOne() {
      var K = R.pick(SPH_ITEMS);
      return pr('Which of Earth\'s four spheres does ' + K[0] + ' belong to?', mc(SPHERES[K[1]], SPHERES.filter(function (s, i) { return i !== K[1]; })), [
        'Ask what it is made of: rock (geosphere), water (hydrosphere), air (atmosphere) or living things (biosphere).',
        cap(K[0]) + ' is part of the ' + SPHERES[K[1]].toLowerCase() + '.'
      ], 'Is it rock, water, air or alive?', { vk: 'concept' });
    }
    function pairOne() {
      var K = R.pick(SPH_PAIRS), name = function (pr2) { return SPHERES[pr2[0]] + ' and ' + SPHERES[pr2[1]].toLowerCase(); };
      var all = [], i, j; for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) if (i < j) all.push([i, j]);
      var right = K[1].slice().sort(), wrongs = all.filter(function (p) { return p[0] !== right[0] || p[1] !== right[1]; });
      return pr(K[0] + ' Which two spheres interact here?', mc(name(right), R.sample(wrongs, 3).map(name)), [
        'Name each thing in the event and its sphere.',
        'Here the two spheres are the ' + SPHERES[right[0]].toLowerCase() + ' and the ' + SPHERES[right[1]].toLowerCase() + '.'
      ], 'List the things in the event: air, water, rock or soil, living things.', { vk: 'concept' });
    }
    function flowOne() {
      var K = R.pick(SPH_FLOWS), s = function (a, b) { return 'From the ' + SPHERES[a].toLowerCase() + ' into the ' + SPHERES[b].toLowerCase(); };
      var others = [0, 1, 2, 3].filter(function (x) { return x !== K[1] && x !== K[2]; });
      return pr(K[0] + ' Which way does matter move?', mc(s(K[1], K[2]), [s(K[2], K[1]), s(K[1], others[0]), s(others[1], K[2])]), [
        'Find where the matter starts and where it ends up.',
        'It starts in the ' + SPHERES[K[1]].toLowerCase() + ' and ends in the ' + SPHERES[K[2]].toLowerCase() + '.'
      ], 'Where was the matter before, and where is it after?', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['Most events on Earth involve only one sphere.', false, 'Most events move matter or energy between two or more spheres, like rain (atmosphere) soaking into soil (geosphere).'],
        ['A glacier is part of the hydrosphere.', true, 'The hydrosphere holds all of Earth\'s water, frozen water included.'],
        ['Soil belongs to the biosphere because things grow in it.', false, 'Soil is mostly broken rock, so it is counted in the geosphere, even though living things fill it.'],
        ['When you breathe out, matter moves from the biosphere into the atmosphere.', true, 'Your body (biosphere) gives off carbon dioxide and water vapor into the air (atmosphere).'],
        ['The atmosphere is made of living things.', false, 'The atmosphere is the layer of gases around Earth; living things make up the biosphere.']
      ], 'Think about where the matter comes from and where it goes.');
    }
    return lv(R, ctx, [sortOne, sortOne, pairOne], [pairOne, flowOne, sortOne], [flowOne, tfOne, pairOne]);
  });

  G('earthsci.latitude-longitude', function (R, ctx) {
    function dirs(lat, lon) { return M(N(MA.abs(lat)) + '^{\\circ}\\,\\mathrm{' + (lat >= 0 ? 'N' : 'S') + '}') + ', ' + M(N(MA.abs(lon)) + '^{\\circ}\\,\\mathrm{' + (lon >= 0 ? 'E' : 'W') + '}'); }
    function words() {
      var la = R.pick([15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) * R.sign(), lo = R.pick([20, 35, 40, 70, 75, 100, 110, 120, 140]) * R.sign();
      if (MA.abs(la) === MA.abs(lo)) lo = lo + 5 * (lo > 0 ? 1 : -1);
      var thing = R.pick(['A ship', 'A research buoy', 'A weather balloon', 'A sailboat', 'A whale tagged by scientists']);
      var q = thing + ' is ' + N(MA.abs(la)) + '° ' + (la > 0 ? 'north' : 'south') + ' of the equator and ' + N(MA.abs(lo)) + '° ' + (lo > 0 ? 'east' : 'west') + ' of the prime meridian. Which gives its location?';
      var sw = MA.abs(lo) <= 90 ? dirs(MA.sign(la) * MA.abs(lo), MA.sign(lo) * MA.abs(la)) : dirs(-la, -lo);
      return pr(q, mc(dirs(la, lo), [dirs(-la, lo), dirs(la, -lo), sw]), [
        'Latitude first: north or south of the equator, ' + N(MA.abs(la)) + '° ' + (la > 0 ? 'N' : 'S') + '.',
        'Then longitude: east or west of the prime meridian, ' + N(MA.abs(lo)) + '° ' + (lo > 0 ? 'E' : 'W') + '.'
      ], 'Latitude (N or S) comes first, then longitude (E or W).', { vk: 'll-words', la: la, lo: lo });
    }
    function globe() {
      var c = R.pick([0, 0, 180]), la = R.pick([15, 30, 45]), lo = R.pick([15, 30, 45]);
      var pts = [[la, c - lo], [-la, c - lo], [la, c + lo], [-la, c + lo]].map(function (p) { var L2 = p[1]; if (L2 > 180) L2 -= 360; if (L2 <= -180) L2 += 360; return [p[0], L2]; });
      var t = R.int(0, 3), order = R.shuffle([0, 1, 2, 3]), letters = {};
      order.forEach(function (pi, k) { letters[pi] = LET[k]; });
      var P = pts[t], opts = { mode: 'globe', terminator: false, grid: 15, lon: c, viewLat: 0, play: false, quiet: true, lock: true, points: order.map(function (pi, k) { return { lat: pts[pi][0], lon: pts[pi][1], label: LET[k] }; }) };
      return pr('Which marked point is at ' + dirs(P[0], P[1]) + '? (Grid lines are every 15°.)', mcK(['A', 'B', 'C', 'D'], 'ABCD'.indexOf(letters[t])), [
        P[0] > 0 ? 'North latitude: the point is above the equator.' : 'South latitude: the point is below the equator.',
        (P[1] > 0 ? 'East' : 'West') + ' longitude: ' + (c === 0 ? (P[1] > 0 ? 'to the right of the prime meridian (east).' : 'to the left of the prime meridian (west).') : (P[1] > 0 ? 'on the west side of the 180° line, where longitudes are east (they count up to 180° E).' : 'on the east side of the 180° line, where longitudes are west.')),
        'Only point ' + letters[t] + ' fits both.'
      ], 'First decide above or below the equator, then which side of the ' + (c === 0 ? 'prime meridian' : '180° meridian') + '.', { vk: 'll-globe', viz: { name: 'es-earth-sun', opts: opts }, target: P, pts: pts, letters: letters });
    }
    function between() {
      var a = R.pick([5, 10, 15, 20, 25, 30, 40, 45, 50]), b = R.pick([5, 10, 15, 20, 30, 35, 40, 55]), same = R.coin();
      if (same && a === b) b += 10;
      var A = a, B = same ? b : -b, place = R.pick(['towns', 'weather stations', 'research camps', 'islands']);
      var d = MA.abs(A - B), km = ctx.level >= 3 && R.coin();
      var q = 'Two ' + place + ' lie on the same line of longitude. One is at ' + M(N(a) + '^{\\circ}\\,\\mathrm{N}') + ' and the other at ' + M(N(b) + '^{\\circ}\\,\\mathrm{' + (same ? 'N' : 'S') + '}') + '. ' + (km ? 'Each degree of latitude is about 111 km. About how many kilometers apart are they?' : 'How many degrees of latitude apart are they?');
      var steps = same ? ['Both are north of the equator, so subtract: ' + M(N(MA.max(a, b)) + ' - ' + N(MA.min(a, b)) + ' = ' + N(d)) + ' degrees.'] : ['They are on opposite sides of the equator, so add the distances to the equator: ' + M(N(a) + ' + ' + N(b) + ' = ' + N(d)) + ' degrees.'];
      if (km) steps.push('Multiply by 111 km per degree: ' + M(N(d) + ' \\times 111 = ' + N(d * 111)) + ' km.');
      return pr(q, km ? num(d * 111, 0.02) : exact(d), steps, same ? 'Both are on the same side of the equator.' : 'Go to the equator, then keep going.', { vk: km ? 'll-km' : 'll-deg', unit: km ? 'km' : '°', A: A, B: B });
    }
    function signed() {
      var la = R.pick([12, 18, 25, 33, 35, 41, 47, 52, 64]) * R.sign(), lo = R.pick([3, 15, 58, 70, 74, 87, 105, 122, 151, 174]) * R.sign();
      return pr('On a map that uses signs, north and east are positive and south and west are negative. Write ' + dirs(la, lo) + ' as an ordered pair (latitude, longitude).', { t: 'tuple', v: [String(la), String(lo)] }, [
        (la > 0 ? 'North' : 'South') + ' makes the latitude ' + (la > 0 ? 'positive' : 'negative') + ': ' + M(N(la)) + '.',
        (lo > 0 ? 'East' : 'West') + ' makes the longitude ' + (lo > 0 ? 'positive' : 'negative') + ': ' + M(N(lo)) + '.',
        'Latitude first: ' + M('(' + N(la) + ', ' + N(lo) + ')') + '.'
      ], 'Like the coordinate plane: north and east are positive.', { vk: 'll-signed', la: la, lo: lo });
    }
    function tfOne() {
      return tfq(R, [
        ['Lines of latitude meet at the North and South Poles.', false, 'Lines of latitude are rings parallel to the equator; they never meet. Lines of longitude meet at the poles.'],
        ['All lines of longitude meet at the poles.', true, 'Every meridian runs from the North Pole to the South Pole.'],
        ['A latitude can be as large as 120° N.', false, 'Latitude stops at 90°, the pole.'],
        ['The equator is the line of 0° latitude.', true, 'Latitude is measured north and south from the equator.'],
        ['The prime meridian is the line of 0° latitude.', false, 'The prime meridian is 0° longitude; the equator is 0° latitude.'],
        ['Longitude is measured east or west, up to 180°.', true, 'Halfway around the world from the prime meridian is 180°.']
      ], 'Latitude rings never meet; longitude lines run pole to pole.');
    }
    return lv(R, ctx, [words, globe, words], [globe, between, signed, words], [between, signed, globe, tfOne]);
  });

  G('earthsci.topographic-maps', function (R, ctx) {
    function map(o2) { // a contour map with a random steep side; returns opts
      var o = { base: o2.base, interval: o2.iv, n: o2.n, steep: o2.steep, index: 0, labels: o2.labels, points: o2.points, quiet: true, lock: true };
      return { name: 'earthsci-contours', opts: o };
    }
    function setup() {
      var iv = R.pick([10, 20, 20, 25, 50]), n = R.int(7, 9), base = iv * R.int(2, 12);
      return { iv: iv, n: n, base: base, steep: R.pick(['E', 'W', 'N', 'S']) };
    }
    function readOne() {
      var s = setup(), c = R.int(2, s.n - 1), ang = R.pick([30, 60, 120, 150, 210, 240, 300, 330]), e = s.base + c * s.iv;
      var v = map({ base: s.base, iv: s.iv, n: s.n, steep: s.steep, labels: [0], points: [{ c: c, ang: ang, label: 'A' }] });
      return pr('The outermost contour line is labeled ' + MQ(s.base, 'm') + ', and the contour interval is ' + MQ(s.iv, 'm') + '. Point A sits on a contour line. What is the elevation of A?', exact(e), [
        'Count the lines from the outermost one up to A\'s line: ' + c + ' steps.',
        'Each step is ' + MQ(s.iv, 'm') + ': ' + M(N(s.base) + ' + ' + c + ' \\times ' + N(s.iv) + ' = ' + Q(e, 'm')) + '.'
      ], 'Count lines from the labeled one, then multiply by the interval.', { vk: 'topo-read', unit: 'm', viz: v });
    }
    function steepOne() {
      var s = setup(), names = { E: 'East', W: 'West', N: 'North', S: 'South' };
      var v = map({ base: s.base, iv: s.iv, n: s.n, steep: s.steep, labels: [0], points: [] });
      return pr('On which side is this hill steepest?', mc(names[s.steep] + ' side', Object.keys(names).filter(function (k) { return k !== s.steep; }).map(function (k) { return names[k] + ' side'; })), [
        'Steep ground climbs a lot in a short distance, so the contour lines crowd together there.',
        'The lines are closest on the ' + names[s.steep].toLowerCase() + ' side (north is up on the map).'
      ], 'Look for where the lines are packed closest together.', { vk: 'concept', viz: v });
    }
    function diffOne() {
      var s = setup(), c1 = R.int(0, 3), c2 = R.int(c1 + 2, s.n - 1), e1 = s.base + c1 * s.iv, e2 = s.base + c2 * s.iv, a1 = R.pick([160, 200, 250]), a2 = R.pick([20, 70, 340]);
      var v = map({ base: s.base, iv: s.iv, n: s.n, steep: s.steep, labels: [0], points: [{ c: c1, ang: a1, label: 'A' }, { c: c2, ang: a2, label: 'B' }] });
      return pr('The outermost contour line is ' + MQ(s.base, 'm') + ' and the contour interval is ' + MQ(s.iv, 'm') + '. How much higher is point B than point A?', exact(e2 - e1), [
        'A is on line ' + c1 + ' above the outermost line (' + MQ(e1, 'm') + '); B is on line ' + c2 + ' (' + MQ(e2, 'm') + ').',
        'Difference: ' + M((c2 - c1) + ' \\times ' + N(s.iv) + ' = ' + Q(e2 - e1, 'm')) + '.'
      ], 'Count the lines you cross going from A to B.', { vk: 'topo-diff', unit: 'm', viz: v });
    }
    function intervalOne() {
      var iv = R.pick([10, 20, 25, 50]), k = R.pick([4, 4, 3]), lo = iv * (k + 1) * R.int(2, 9), hi = lo + iv * (k + 1);
      return pr('On a topographic map, two index contours are labeled ' + MQ(lo, 'm') + ' and ' + MQ(hi, 'm') + ', with ' + k + ' thinner contour lines between them. What is the contour interval?', exact(iv), [
        'With ' + k + ' lines between, there are ' + (k + 1) + ' equal gaps from one index line to the next.',
        'Height change: ' + M(N(hi) + ' - ' + N(lo) + ' = ' + N(hi - lo)) + ' m.',
        'Interval: ' + M(N(hi - lo) + ' \\div ' + (k + 1) + ' = ' + Q(iv, 'm')) + '.'
      ], 'Count the gaps, not the lines.', { vk: 'topo-iv', unit: 'm' });
    }
    function summitOne() {
      var s = setup(), top = s.base + (s.n - 1) * s.iv;
      var v = map({ base: s.base, iv: s.iv, n: s.n, steep: s.steep, labels: [0, s.n - 1], points: [] });
      return pr('The highest closed contour on this hill is ' + MQ(top, 'm') + ' and the contour interval is ' + MQ(s.iv, 'm') + '. The summit (×) is at least ' + MQ(top, 'm') + '. It must be less than what elevation?', exact(top + s.iv), [
        'The summit is inside the ' + MQ(top, 'm') + ' loop, so it is at least that high.',
        'If it reached ' + M(N(top) + ' + ' + N(s.iv) + ' = ' + Q(top + s.iv, 'm')) + ', the map would show one more loop.',
        'So the summit is less than ' + MQ(top + s.iv, 'm') + '.'
      ], 'What would the next contour line be?', { vk: 'topo-summit', unit: 'm', viz: v });
    }
    function gradOne() {
      var rise = R.pick([60, 80, 100, 120, 150, 200, 240, 300]), run = R.pick([0.5, 1, 1.5, 2, 2.5, 4]);
      var g = rise / run; if (!Number.isInteger(g)) { run = 2; g = rise / 2; }
      var who = nm(R);
      return pr(who + ' hikes from a trailhead on the ' + MQ(1000, 'm') + ' contour to a lookout on the ' + MQ(1000 + rise, 'm') + ' contour. On the map the two points are ' + MQ(run, 'km') + ' apart. What is the average gradient in meters of climb per kilometer?', exact(g), [
        'Climb: ' + M(N(1000 + rise) + ' - 1{,}000 = ' + N(rise)) + ' m.',
        'Gradient = climb ÷ distance: ' + M(N(rise) + ' \\div ' + N(run) + ' = ' + N(g)) + ' m per km.'
      ], 'Gradient is the height change divided by the distance.', { vk: 'topo-grad', unit: 'm/km' });
    }
    function tfOne() {
      return tfq(R, [
        ['Where contour lines are close together, the land is nearly flat.', false, 'Close lines mean the height changes a lot over a short distance: steep ground.'],
        ['Two contour lines can never cross.', true, 'A point has only one elevation, so it can\'t lie on two different contour lines.'],
        ['Where a stream crosses contour lines, the lines bend into V\'s that point upstream.', true, 'The valley cuts back into higher ground, so the lines bend uphill, toward where the stream comes from.'],
        ['A contour line on a map shows a hiking trail.', false, 'A contour line joins points of equal elevation; it is not anything you could see on the ground.']
      ], 'Each contour line is a single height.');
    }
    return lv(R, ctx, [readOne, steepOne, readOne], [diffOne, intervalOne, readOne, steepOne], [summitOne, gradOne, diffOne, tfOne]);
  });

  // ---------- g02_sunmoon.js ----------
  // ===================== Unit 2: Earth, Sun and Moon =====================
  // a clock time from minutes after midnight: 215 -> "3:35 a.m."; 720 -> "12:00 noon"; 0 -> "12:00 midnight"
  function clock(min) {
    min = ((MA.round(min) % 1440) + 1440) % 1440;
    if (min === 720) return '12:00 noon'; if (min === 0) return '12:00 midnight';
    var h = MA.floor(min / 60), m = min % 60, ap = h < 12 ? 'a.m.' : 'p.m.', h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }
  function lonT(lon) { return M(N(MA.abs(lon)) + '^{\\circ}\\,\\mathrm{' + (lon >= 0 ? 'E' : 'W') + '}'); }
  function latT(lat) { return M(N(MA.abs(lat)) + '^{\\circ}\\,\\mathrm{' + (lat >= 0 ? 'N' : 'S') + '}'); }

  G('earthsci.day-and-night', function (R, ctx) {
    function turnDeg() {
      var h = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 18]);
      return pr('Earth turns once (360°) in about 24 hours. Through how many degrees does it turn in ' + h + ' hours?', exact(15 * h), [
        'Rate: ' + M('360^{\\circ} \\div 24 = 15^{\\circ}') + ' per hour.',
        'In ' + h + ' hours: ' + M(h + ' \\times 15 = ' + N(15 * h) + '^{\\circ}') + '.'
      ], 'First find how many degrees Earth turns in one hour.', { vk: 'dn-deg', unit: '°' });
    }
    function turnHours() {
      var d = R.pick([30, 45, 60, 75, 90, 120, 135, 150, 180, 270]);
      return pr('Earth turns 15° each hour. How many hours does it take to turn through ' + D(d) + '?', exact(d / 15), [
        M(N(d) + ' \\div 15 = ' + N(d / 15)) + ' hours.'
      ], 'Divide the angle by the turning rate.', { vk: 'dn-hours', unit: 'h' });
    }
    function solarTime() {
      var a = R.pick([-120, -105, -90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90, 105, 120]), dh = R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), b = a + 15 * dh;
      if (MA.abs(b) > 165) { b = a - 15 * dh; dh = -dh; }
      var right = clock(720 + 60 * dh), wrongs = [clock(720 - 60 * dh), clock(720 + 120 * dh), clock(720 + 60 * dh + 720)].filter(function (c) { return c !== right; });
      return pr('It is solar noon (the Sun is at its highest) in a town at ' + lonT(a) + '. What is the solar time in a town at ' + lonT(b) + '?', mc(right, wrongs), [
        'The second town is ' + N(MA.abs(b - a)) + '° farther ' + (dh > 0 ? 'east' : 'west') + '.',
        'Each 15° is one hour: ' + M(N(MA.abs(b - a)) + ' \\div 15 = ' + MA.abs(dh)) + ' hour' + (MA.abs(dh) > 1 ? 's' : '') + '.',
        (dh > 0 ? 'Places to the east turned into the sunlight earlier, so their clocks are ahead: ' : 'Places to the west are behind: ') + right + '.'
      ], 'Earth turns toward the east, so eastern places see noon first.', { vk: 'dn-solar', la: a, lb: b });
    }
    function sunriseFirst() {
      var x = R.pick([-120, -100, -90, -80, -70, 10, 20, 30, 100, 120, 140]), y = x + R.pick([-1, 1]) * R.pick([10, 15, 20, 25]);
      var A = R.pick(['Riverton', 'Lakeside', 'Pine Bluff', 'Harbor City']), B = R.pick(['Millbrook', 'Westfield', 'Cedar Falls', 'Oak Ridge']);
      var east = y > x ? B : A;
      return pr(A + ' is at ' + lonT(x) + ' and ' + B + ' is at ' + lonT(y) + ', at the same latitude. Which town sees the Sun rise first?', mc(east, [east === A ? B : A, 'Both at the same moment', 'It depends on the season']), [
        'Earth spins toward the east, so eastern places turn into the morning sunlight first.',
        'Compare the longitudes: ' + east + ' is farther east.'
      ], 'Which way does Earth spin?', { vk: 'dn-east', x: x, y: y, A: A, B: B, east: east });
    }
    function eqSpeed() {
      var h = R.pick([1, 2, 3, 6, 12]);
      var d = 40075 * h / 24;
      return pr('The equator is about ' + MQ(40075, 'km') + ' around, and Earth turns once in 24 hours. How far does a person standing on the equator travel in ' + h + ' hour' + (h > 1 ? 's' : '') + '?', num(d, 0.02), [
        'Speed: ' + M('40{,}075 \\div 24 \\approx 1{,}670') + ' km per hour.',
        (h > 1 ? 'In ' + h + ' hours: ' + M(N(40075) + ' \\times ' + h + ' \\div 24 \\approx ' + N(MA.round(d))) + ' km.' : 'In one hour that is about ' + MQ(1670, 'km') + '.'),
        'We don\'t feel it, because the ground, the air and we all move together.'
      ], 'One turn carries you all the way around the equator.', { vk: 'dn-speed', unit: 'km' });
    }
    function whyNight() {
      return mcq(R, [
        ['Why is it night in your town?', 'Your side of Earth has turned to face away from the Sun.', ['The Sun has moved around to the other side of Earth.', 'The Moon blocks the Sun\'s light.', 'Clouds cover the Sun.'], 'Earth spins; the Sun stays put. Night is the half of Earth facing away from the Sun.'],
        ['Why does the Sun seem to rise in the east?', 'Earth spins toward the east, carrying us into the sunlight.', ['The Sun moves from east to west around Earth.', 'The Sun is closer to the eastern sky.', 'Earth orbits the Sun from east to west each day.'], 'Turning toward the east, we first see the Sun on the eastern horizon.'],
        ['At any moment, how much of Earth is having daytime?', 'About half', ['All of it, at noon', 'About a quarter', 'It changes from day to day, from none to all'], 'The Sun always lights the half of Earth that faces it.']
      ], 'Picture a globe spinning in front of a lamp.');
    }
    return lv(R, ctx, [turnDeg, turnHours, whyNight], [solarTime, sunriseFirst, turnDeg, turnHours], [solarTime, eqSpeed, sunriseFirst]);
  });

  G('earthsci.seasons', function (R, ctx) {
    var SEAS = ['Summer', 'Winter', 'Spring', 'Fall'];
    function seasonOf() {
      var mo = R.pick([['December', 0], ['January', 0], ['February', 0], ['June', 1], ['July', 1], ['August', 1]]);
      var place = R.pick([['Sydney, Australia', 'S'], ['Buenos Aires, Argentina', 'S'], ['Cape Town, South Africa', 'S'], ['Auckland, New Zealand', 'S'], ['Chicago, USA', 'N'], ['Madrid, Spain', 'N'], ['Tokyo, Japan', 'N'], ['Toronto, Canada', 'N']]);
      var northSummer = mo[1] === 1, summer = place[1] === 'N' ? northSummer : !northSummer, right = summer ? 'Summer' : 'Winter';
      return pr('What season is it in ' + place[0] + ' (' + (place[1] === 'N' ? 'Northern' : 'Southern') + ' Hemisphere) in ' + mo[0] + '?', mc(right, SEAS.filter(function (s) { return s !== right; })), [
        'In ' + mo[0] + ' the ' + (northSummer ? 'Northern' : 'Southern') + ' Hemisphere is tilted toward the Sun.',
        place[0] + ' is in the ' + (place[1] === 'N' ? 'Northern' : 'Southern') + ' Hemisphere, so it has ' + right.toLowerCase() + '.'
      ], 'The two hemispheres have opposite seasons.', { vk: 'concept' });
    }
    function noonEq() {
      var lat = R.pick([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) * (R.chance(0.3) ? -1 : 1), d = R.pick(['March 20', 'September 22']);
      return pr('On ' + d + ' (an equinox) the noon Sun is straight overhead at the equator. How high above the horizon is the noon Sun at ' + latT(lat) + '?', exact(90 - MA.abs(lat)), [
        'The place is ' + N(MA.abs(lat)) + '° from the equator.',
        'For each degree away, the noon Sun is a degree lower: ' + M('90 - ' + N(MA.abs(lat)) + ' = ' + N(90 - MA.abs(lat))) + '°.'
      ], 'Start from 90° (overhead) and subtract the distance from the equator.', { vk: 'se-eq', unit: '°', lat: lat });
    }
    function noonSol() {
      var lat = R.pick([25, 30, 35, 40, 45, 50, 55, 60]) * (R.chance(0.3) ? -1 : 1), june = R.coin(), dec = june ? 23.4 : -23.4;
      var away = MA.abs(lat - dec), h = fix(90 - away);
      return pr('On ' + (june ? 'June 21' : 'December 21') + ' the noon Sun is straight overhead at ' + latT(dec) + '. How high above the horizon is the noon Sun at ' + latT(lat) + '?', num(h, 0.003), [
        'Distance from where the Sun is overhead: ' + ((lat > 0) === (dec > 0) ? M(N(MA.abs(lat)) + ' - 23.4 = ' + N(away)) : M(N(MA.abs(lat)) + ' + 23.4 = ' + N(away))) + ' degrees.',
        'Noon Sun height: ' + M('90 - ' + N(away) + ' = ' + N(h)) + '°.',
        (h > 50 ? 'A high Sun: summer there.' : 'A low Sun: winter there.')
      ], 'How far is the place from the latitude where the Sun is overhead?', { vk: 'se-sol', unit: '°', lat: lat, dec: dec });
    }
    function tropic() {
      return mcq(R, [
        ['On about which date is the noon Sun straight overhead at 23.4° S (the Tropic of Capricorn)?', 'December 21', ['June 21', 'March 20', 'September 22'], 'In late December the Southern Hemisphere leans toward the Sun, and the Sun is overhead at 23.4° S.'],
        ['On about which date is the noon Sun straight overhead at 23.4° N (the Tropic of Cancer)?', 'June 21', ['December 21', 'March 20', 'January 3'], 'In late June the Northern Hemisphere leans toward the Sun, and the Sun is overhead at 23.4° N.'],
        ['On about which dates are day and night close to 12 hours everywhere?', 'March 20 and September 22', ['June 21 and December 21', 'January 3 and July 4', 'Only on June 21'], 'At the equinoxes neither hemisphere leans toward the Sun.'],
        ['Earth is closest to the Sun in early January. What season does the Northern Hemisphere have then?', 'Winter', ['Summer', 'Spring', 'Fall'], 'Distance barely matters; in January the Northern Hemisphere is tilted away from the Sun.']
      ], 'Think about which hemisphere leans toward the Sun.');
    }
    function beam() {
      var a = R.pick([0, 10, 20]), b = a + R.pick([30, 40, 50]);
      var o = { mode: 'beam', compare: [a, b], date: '03-20', quiet: true, lock: true };
      return pr('At noon on March 20, which place gets more sunlight energy on each square meter of flat ground: ' + latT(a) + ' (picture A) or ' + latT(b) + ' (picture B)?', mc(latT(a), [latT(b), 'Both get the same', 'It depends on how far each is from the Sun']), [
        'The noon Sun is higher at ' + latT(a) + ' (' + D(90 - a) + ') than at ' + latT(b) + ' (' + D(90 - b) + ').',
        'A low Sun spreads the same beam over more ground, so each square meter gets less.',
        'So ' + latT(a) + ' gets more.'
      ], 'Which place has the higher noon Sun?', { vk: 'se-beam', viz: { name: 'es-earth-sun', opts: o }, la: a, lb: b });
    }
    function tfOne() {
      return tfq(R, [
        ['Summer happens when Earth is closest to the Sun.', false, 'Earth is closest in early January, during northern winter; the tilt of the axis makes the seasons.'],
        ['When it is summer in Canada, it is winter in Argentina.', true, 'The hemispheres take turns leaning toward the Sun, so their seasons are opposite.'],
        ['Earth\'s axis flips to point the other way every six months.', false, 'The axis keeps pointing the same way in space all year; Earth\'s motion around the Sun changes which hemisphere leans toward it.'],
        ['In summer the Sun is higher at noon and the days are longer.', true, 'Both give each square meter more sunlight energy.']
      ], 'Tilt, not distance.');
    }
    return lv(R, ctx, [seasonOf, noonEq, tfOne], [noonEq, beam, seasonOf, tropic], [noonSol, beam, tropic, tfOne]);
  });

  G('earthsci.moon-phases', function (R, ctx) {
    var PH = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'third quarter', 'waning crescent'];
    function picture() {
      var i = R.int(0, 7), hemi = ctx.level >= 3 && R.coin() ? 'S' : 'N';
      var near = [(i + 4) % 8, (8 - i) % 8, (i + 1) % 8, (i + 7) % 8].filter(function (j, k, a) { return j !== i && a.indexOf(j) === k; });
      while (near.length < 3) { var r2 = R.int(0, 7); if (r2 !== i && near.indexOf(r2) < 0) near.push(r2); }
      return pr('The picture shows the Moon on its orbit (seen from above the North Pole, with sunlight coming from the right) and, in the small view, how it looks from Earth' + (hemi === 'S' ? ' from the Southern Hemisphere' : '') + '. Which phase is it?', mc(cap(PH[i]), near.slice(0, 3).map(function (j) { return cap(PH[j]); })), [
        'Find where the Moon is: ' + ['between Earth and the Sun', 'a little past the Sun\'s side', 'a quarter of the way around', 'past the quarter mark', 'on the far side of Earth from the Sun', 'past full', 'three quarters of the way around', 'nearly back to the Sun\'s side'][i] + '.',
        'Its lit half always faces the Sun. From Earth we see ' + ['none of the lit half', 'a sliver of it', 'half of the face lit', 'most of the face lit', 'the whole lit half', 'most of the face lit', 'half of the face lit', 'a sliver of it'][i] + (i > 0 && i < 4 ? ', growing (waxing)' : i > 4 ? ', shrinking (waning)' : '') + '.',
        'Phase: ' + PH[i] + '.'
      ], 'Waxing phases come after new moon, as the Moon moves counterclockwise away from the Sun\'s direction.', { vk: 'mp-pic', viz: { name: 'es-moon', opts: { mode: 'phases', angle: 45 * i, hemisphere: hemi, quiet: true, lock: true, rise: false } }, idx: i });
    }
    function nextPhase() {
      var i = R.int(0, 7), j = (i + 1) % 8;
      return pr('Which phase comes right after ' + (i === 0 || i === 4 ? 'a ' : '') + PH[i] + '?', mc(cap(PH[j]), [cap(PH[(i + 7) % 8]), cap(PH[(i + 4) % 8]), cap(PH[(j + 4) % 8])].filter(function (c, k, a) { return a.indexOf(c) === k && c !== cap(PH[j]); })), [
        'The order is new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, third quarter, waning crescent, then new again.',
        'After ' + PH[i] + ' comes ' + PH[j] + '.'
      ], 'Waxing means growing toward full; waning means shrinking toward new.', { vk: 'concept' });
    }
    function days() {
      var K = R.pick([['first quarter', 7.4, 0.75], ['full moon', 14.8, 0.8], ['third quarter', 22.1, 0.75]]);
      return pr('The Moon goes from new moon to new moon in about 29.5 days. About how many days after a new moon is the next ' + K[0] + '?', { t: 'num', v: String(K[1]), tol: K[2] }, [
        K[0] === 'first quarter' ? 'First quarter is a quarter of the way around: ' + M('29.5 \\div 4 \\approx 7.4') + ' days.' : K[0] === 'full moon' ? 'Full moon is halfway around: ' + M('29.5 \\div 2 \\approx 14.8') + ' days.' : 'Third quarter is three quarters of the way: ' + M('29.5 \\times \\tfrac{3}{4} \\approx 22.1') + ' days.',
        'So about ' + MA.round(K[1]) + ' days.'
      ], 'What fraction of the way around its orbit is the Moon?', { vk: 'mp-days', unit: 'days' });
    }
    function untilFull() {
      var ago = R.pick([3, 5, 8, 10, 12, 20, 24]);
      return pr('A full moon happened ' + ago + ' days ago. The phases repeat every 29.5 days. In about how many days will the next full moon be?', { t: 'num', v: String(fix(29.5 - ago)), tol: 0.6 }, [
        'One full cycle is 29.5 days.',
        M('29.5 - ' + ago + ' = ' + N(fix(29.5 - ago))) + ' days.'
      ], 'Subtract the days already gone from one full cycle.', { vk: 'mp-until', unit: 'days' });
    }
    function rise() {
      return mcq(R, [
        ['About when does a full moon rise?', 'Around sunset', ['Around sunrise', 'Around noon', 'Around midnight'], 'A full moon is opposite the Sun, so it comes up as the Sun goes down.'],
        ['About when does a first-quarter moon rise?', 'Around noon', ['Around sunset', 'Around midnight', 'Around sunrise'], 'It is a quarter turn behind the Sun, so it rises about 6 hours after sunrise.'],
        ['About when does a new moon rise?', 'Around sunrise', ['Around sunset', 'Around midnight', 'It never rises'], 'A new moon is in the same direction as the Sun, so it rises and sets with the Sun.'],
        ['About when does a third-quarter moon rise?', 'Around midnight', ['Around noon', 'Around sunset', 'Around sunrise'], 'It is three quarters of the way around, so it rises about 6 hours after sunset.']
      ], 'Where is the Moon compared with the Sun?');
    }
    function tfOne() {
      return tfq(R, [
        ['The phases happen because Earth\'s shadow covers part of the Moon.', false, 'Earth\'s shadow reaches the Moon only during a lunar eclipse; phases come from how much of the Moon\'s lit half we see.'],
        ['Half of the Moon is always lit by the Sun (except during a lunar eclipse).', true, 'Like Earth, the Moon always has a day side facing the Sun.'],
        ['During a waxing crescent, the lit part we see is growing each night.', true, 'Waxing means growing, from new moon toward full.'],
        ['A full moon happens when the Moon is between Earth and the Sun.', false, 'That is a new moon. At full moon, Earth is between the Sun and the Moon.']
      ], 'Picture a ball lit by a lamp as it circles you.');
    }
    return lv(R, ctx, [picture, nextPhase, days], [picture, untilFull, rise, tfOne], [picture, untilFull, rise, days]);
  });

  G('earthsci.eclipses', function (R, ctx) {
    function phaseFor() {
      var solar = R.coin();
      return pr('A ' + (solar ? 'solar' : 'lunar') + ' eclipse can happen only at which phase of the Moon?', mc(solar ? 'New moon' : 'Full moon', [solar ? 'Full moon' : 'New moon', 'First quarter', 'Third quarter']), [
        solar ? 'In a solar eclipse the Moon is between the Sun and Earth, which is where it is at new moon.' : 'In a lunar eclipse Earth is between the Sun and the Moon, which is where the Moon is at full moon.'
      ], 'Which body is in the middle?', { vk: 'concept' });
    }
    function middle() {
      var solar = R.coin();
      return pr('During a ' + (solar ? 'solar' : 'lunar') + ' eclipse, which body is in the middle of the line-up?', mc(solar ? 'The Moon' : 'Earth', [solar ? 'Earth' : 'The Moon', 'The Sun', 'None: they form a triangle']), [
        solar ? 'The Moon blocks the Sun\'s light from reaching part of Earth, so the Moon is between them.' : 'Earth blocks sunlight from reaching the Moon, so Earth is between them.'
      ], 'Whose shadow falls on whom?', { vk: 'concept' });
    }
    function rare() {
      return mcq(R, [
        ['Why doesn\'t a solar eclipse happen at every new moon?', 'The Moon\'s orbit is tilted about 5° to Earth\'s, so the Moon usually passes above or below the Sun.', ['The Moon is too small to block the Sun except in summer.', 'Clouds usually hide the Sun at new moon.', 'The Moon moves too fast to block the Sun most months.'], 'Only a new moon near one of the two crossing points of the orbits lines up exactly.'],
        ['Why can everyone on Earth\'s night side see a lunar eclipse, but a total solar eclipse is seen only along a narrow path?', 'Earth\'s shadow covers the whole Moon, but the Moon\'s small shadow covers only a small patch of Earth.', ['The Moon is brighter than the Sun.', 'Solar eclipses happen only at the poles.', 'Lunar eclipses last a whole night everywhere.'], 'Earth is much bigger than the Moon, so its shadow is much bigger too.'],
        ['About how many eclipse seasons are there each year?', 'Two, about six months apart', ['Twelve, one each month', 'One, every December', 'None: eclipses are random'], 'The Sun lines up with the Moon\'s two orbit crossing points about twice a year.']
      ], 'Think about the Moon\'s tilted orbit.');
    }
    function ratio() {
      var K = R.pick([['wide', 1392000, 3475, 'The Sun is about', 'km wide', 'km'], ['far away', 150000000, 384000, 'The Sun is about', 'km from Earth', 'km']]);
      var r = K[1] / K[2];
      return pr(K[0] === 'wide' ? 'The Sun is about ' + MQ(K[1], 'km') + ' wide and the Moon about ' + MQ(K[2], 'km') + ' wide. About how many times wider is the Sun?' : 'The Sun is about ' + MQ(K[1], 'km') + ' from Earth and the Moon about ' + MQ(K[2], 'km') + '. About how many times farther away is the Sun?', num(r, 0.03), [
        M(N(K[1]) + ' \\div ' + N(K[2]) + ' \\approx ' + N(MA.round(r))) + '.',
        'The Sun is about 400 times wider and also about 400 times farther, so the two look almost the same size in our sky.'
      ], 'Divide the bigger number by the smaller one.', { vk: 'ec-ratio' });
    }
    function season() {
      var M2 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var DM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], m = R.int(0, 11), d = R.int(20, 28), doy = d; for (var i = 0; i < m; i++) doy += DM[i];
      var nd = (doy - 1 + 173) % 365 + 1, nm = 0; while (nd > DM[nm]) { nd -= DM[nm]; nm++; }
      var right = M2[nm], wr = [M2[(nm + 1) % 12], M2[(nm + 3) % 12], M2[(nm + 11) % 12] === M2[m] ? M2[(nm + 2) % 12] : M2[m]].filter(function (x, k, a) { return x !== right && a.indexOf(x) === k; });
      return pr('An eclipse season was centered on ' + M2[m] + ' ' + d + '. Eclipse seasons come about every 173 days, a little less than six months. In which month will the next one be centered?', mc(right, wr), [
        '173 days is just under 6 months (6 months is about 183 days).',
        M2[m] + ' ' + d + ' plus 173 days is ' + M2[nm] + ' ' + nd + '.'
      ], 'Count about 6 months ahead, then back up about 10 days.', { vk: 'ec-season', m: m, d: d });
    }
    function tfOne() {
      return tfq(R, [
        ['There is a solar eclipse every month, at each new moon.', false, 'The Moon\'s orbit is tilted about 5°, so most new moons pass above or below the Sun.'],
        ['During a lunar eclipse, Earth\'s shadow falls on the Moon.', true, 'Earth is between the Sun and the Moon.'],
        ['A lunar eclipse can happen at a first-quarter moon.', false, 'Only a full moon is on the far side of Earth, where Earth\'s shadow points.'],
        ['The Moon can just cover the Sun because the Sun is about 400 times wider and about 400 times farther away.', true, 'The two effects cancel, so they look nearly the same size.']
      ], 'Solar: Moon in the middle. Lunar: Earth in the middle.');
    }
    return lv(R, ctx, [phaseFor, middle, tfOne], [rare, phaseFor, ratio, middle], [ratio, season, rare, tfOne]);
  });

  G('earthsci.gravity-orbits', function (R, ctx) {
    var BOD = [['the Moon', 0.17], ['Mars', 0.38], ['Mercury', 0.38], ['Jupiter', 2.36], ['Neptune', 1.12], ['Venus', 0.9]];
    function weight() {
      var b = R.pick(BOD), w = R.pick([300, 400, 450, 500, 550, 600, 650, 700, 800, 900]), thing = R.pick(['an astronaut in a spacesuit', 'a robot explorer', 'a student', 'a camera crate']);
      var x = w * b[1];
      return pr('Gravity at the surface of ' + b[0] + ' is about ' + N(b[1]) + ' times Earth\'s. If ' + thing + ' weighs ' + MQ(w, 'N') + ' on Earth, about how much would it weigh on ' + b[0] + '?', num(x, 0.02), [
        'Weight is the pull of gravity, so it scales with the strength of gravity.',
        M(N(w) + ' \\times ' + N(b[1]) + ' = ' + N(fix(x))) + ' N.'
      ], 'Multiply the Earth weight by the gravity factor.', { vk: 'gr-weight', unit: 'N' });
    }
    function mass() {
      var b = R.pick(BOD), m = R.pick([40, 45, 50, 55, 60, 80, 120, 200]);
      return pr('A backpack has a mass of ' + MQ(m, 'kg') + ' on Earth. Gravity on ' + b[0] + ' is about ' + N(b[1]) + ' times Earth\'s. What is its mass on ' + b[0] + '?', exact(m), [
        'Mass is the amount of matter in the backpack. Moving it doesn\'t add or remove any matter.',
        'Its weight changes, but its mass stays ' + MQ(m, 'kg') + '.'
      ], 'Is mass the same thing as weight?', { vk: 'gr-mass', unit: 'kg' });
    }
    function invSq() {
      var k = R.pick([2, 3, 4, 5, 10]), back = ctx.level >= 3 && R.coin();
      if (back) return pr('A space probe moves away from a planet until the planet\'s pull on it is ' + M('\\tfrac{1}{' + k * k + '}') + ' as strong as at the start. How many times farther from the planet\'s center is it than it was at the start?', exact(k), [
        'Gravity weakens with the square of the distance.',
        'Which number squared is ' + (k * k) + '? ' + M(k + '^2 = ' + k * k) + ', so it is ' + k + ' times as far.'
      ], 'Undo the square.', { vk: 'gr-back' });
      return pr('A satellite moves from ' + '1 to ' + k + ' Earth radii from Earth\'s center (' + k + ' times as far). What fraction of its starting pull does Earth\'s gravity now have?', { t: 'num', v: '1/' + (k * k) }, [
        'Gravity weakens with the square of the distance.',
        M(k + '^2 = ' + (k * k)) + ', so the pull is ' + M('\\tfrac{1}{' + k * k + '}') + ' as strong.'
      ], 'Square the change in distance.', { vk: 'gr-inv' });
    }
    function concept() {
      return mcq(R, [
        ['Astronauts float inside the space station, about 400 km above Earth. Why?', 'They and the station are falling around Earth together.', ['There is no gravity in space.', 'The station is too far for Earth\'s gravity to reach.', 'The air inside the station holds them up.'], 'Gravity there is still about 90% as strong as on the ground; everything falls together, so nothing presses on the floor.'],
        ['What would happen to the Moon if it suddenly stopped moving sideways along its orbit?', 'It would fall toward Earth.', ['It would float in place.', 'It would fly off in a straight line.', 'It would keep orbiting as before.'], 'Gravity keeps pulling; the sideways motion is what keeps the Moon missing Earth.'],
        ['What would happen to the Moon if Earth\'s gravity suddenly switched off?', 'It would fly off in a straight line.', ['It would fall toward Earth.', 'It would stop moving.', 'It would keep circling Earth.'], 'Without a pull toward Earth, nothing bends its path, so it moves in a straight line.'],
        ['Which pulls on Earth harder: the Sun or Jupiter?', 'The Sun: it has far more mass and is much closer.', ['Jupiter, because it is a giant planet.', 'They pull equally.', 'Neither pulls on Earth.'], 'The Sun has about 1,000 times the mass of Jupiter and is also much closer, so its pull is far stronger.']
      ], 'An orbit is falling while moving sideways.');
    }
    function tfOne() {
      return tfq(R, [
        ['There is no gravity in space.', false, 'Gravity reaches across space; it holds the Moon in orbit around Earth and Earth around the Sun.'],
        ['Every object with mass pulls on every other object with mass.', true, 'Even you and a pencil attract each other, though very weakly.'],
        ['Gravity gets weaker as two objects get farther apart.', true, 'Twice as far gives one quarter the pull.'],
        ['Your mass on the Moon is less than your mass on Earth.', false, 'Your weight is less; your mass, the amount of matter in you, is the same.']
      ], 'Gravity depends on mass and distance.');
    }
    return lv(R, ctx, [weight, concept, tfOne], [weight, mass, invSq, concept], [invSq, weight, concept, mass]);
  });

  G('earthsci.tides', function (R, ctx) {
    function nextHigh() {
      var t0 = R.int(0, 47) * 15 + R.pick([0, 5, 10]), right = clock(t0 + 745);
      return pr('High tide at a harbor is at ' + clock(t0) + '. High tides come about 12 hours 25 minutes apart. About when is the next high tide?', mc(right, [clock(t0 + 720), clock(t0 + 372), clock(t0 + 1490)].filter(function (c) { return c !== right; })), [
        'Add 12 hours: ' + clock(t0 + 720) + '.',
        'Add 25 minutes more: ' + right + '.'
      ], 'Add 12 hours, then 25 minutes.', { vk: 'ti-next', t0: t0 });
    }
    function tomorrow() {
      var t0 = R.int(0, 47) * 15, right = clock(t0 + 1490);
      return pr('Today\'s morning high tide is at ' + clock(t0) + '. The tide pattern repeats about every 24 hours 50 minutes. About when is the matching high tide tomorrow?', mc(right, [clock(t0), clock(t0 + 1440 - 50), clock(t0 + 745)].filter(function (c) { return c !== right; })), [
        'Earth must turn a little more than once to face the Moon again, because the Moon has moved along its orbit.',
        'So tomorrow\'s tide comes about 50 minutes later: ' + right + '.'
      ], 'Tides come about 50 minutes later each day.', { vk: 'ti-day', t0: t0 });
    }
    function lowAfter() {
      return mcq(R, [
        ['About how long after a high tide does the next low tide come?', 'About 6 hours', ['About 12 hours', 'About 24 hours', 'About 3 hours'], 'Low tide is halfway between two high tides, which are about 12 h 25 min apart: about 6 h 12 min.'],
        ['About how many high tides does a typical coast get in one day?', 'Two', ['One', 'Four', 'Six'], 'Earth turns through two bulges every 24 h 50 min.'],
        ['What mainly causes the ocean tides?', 'The Moon\'s gravity, pulling unequally on the near and far sides of Earth', ['The wind blowing across the ocean', 'Earth\'s rotation alone', 'Ocean currents'], 'The difference in the Moon\'s pull across Earth stretches the ocean into two bulges; the Sun adds a smaller effect.']
      ], 'There are two bulges.');
    }
    function springNeap() {
      var K = R.pick([['new moon', true], ['full moon', true], ['first-quarter moon', false], ['third-quarter moon', false]]);
      var right = K[1] ? 'Spring tides: higher highs and lower lows' : 'Neap tides: the smallest difference between high and low';
      return pr('This week there is a ' + K[0] + '. What kind of tides should a coast have?', mc(right, [K[1] ? 'Neap tides: the smallest difference between high and low' : 'Spring tides: higher highs and lower lows', 'Only one high tide each day', 'No tides at all']), [
        K[1] ? 'At new and full moon the Sun, Earth and Moon are in a line, so the Sun\'s tide adds to the Moon\'s.' : 'At a quarter moon the Sun and Moon pull at right angles, so the Sun\'s tide partly cancels the Moon\'s.',
        right + '.'
      ], 'Are the Sun and Moon lined up or at right angles?', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['There is only one tidal bulge, on the side of Earth facing the Moon.', false, 'There is a second bulge on the far side, which is why most coasts get two high tides a day.'],
        ['Spring tides happen only in the spring.', false, 'Spring tides happen twice a month, at new and full moon; the name means the water "springs up".'],
        ['The Sun also makes tides, but they are smaller than the Moon\'s.', true, 'The Sun\'s tide is a bit less than half as strong as the Moon\'s.'],
        ['High tides come about 50 minutes later each day.', true, 'The tide pattern repeats every 24 hours 50 minutes.']
      ], 'Two bulges, and the Moon moves on a little each day.');
    }
    return lv(R, ctx, [lowAfter, springNeap, nextHigh], [nextHigh, springNeap, tfOne, lowAfter], [tomorrow, nextHigh, tfOne, springNeap]);
  });

  // ---------- g03_solar.js ----------
  // ===================== Unit 3: The Solar System and Beyond =====================
  // NASA planetary fact sheets, rounded: name, mean distance (AU), diameter (km), year (Earth years), mean temperature (°C), moons (known, rounded), kind
  var PLAN = [
    ['Mercury', 0.39, 4879, 0.24, 167, 'rocky'], ['Venus', 0.72, 12104, 0.62, 464, 'rocky'], ['Earth', 1, 12756, 1, 15, 'rocky'], ['Mars', 1.52, 6792, 1.88, -65, 'rocky'],
    ['Jupiter', 5.2, 142984, 11.9, -110, 'giant'], ['Saturn', 9.6, 120536, 29.4, -140, 'giant'], ['Uranus', 19.2, 51118, 84, -195, 'giant'], ['Neptune', 30.1, 49528, 165, -200, 'giant']
  ];
  G('earthsci.solar-system-objects', function (R, ctx) {
    var KINDS = ['A rocky planet', 'A giant planet', 'A dwarf planet', 'An asteroid', 'A comet', 'A moon'];
    function classify() {
      var K = R.pick([
        ['a ball of ice and dust that grows a long glowing tail pointing away from the Sun when it comes close', 4],
        ['a rocky chunk a few kilometers across that orbits the Sun between Mars and Jupiter', 3],
        ['a huge world made mostly of hydrogen and helium, with rings and dozens of moons', 1],
        ['a small world of rock and metal close to the Sun, with a solid surface and no rings', 0],
        ['a round icy world beyond Neptune that orbits the Sun among many other icy objects', 2],
        ['Ceres, a round body in the asteroid belt that shares its path with many asteroids', 2],
        ['Titan, a large icy world that circles Saturn', 5],
        ['Phobos, a small lumpy rock that circles Mars', 5],
        ['Neptune, a cold blue world made mostly of hydrogen, helium and ices', 1]
      ]);
      var wr = KINDS.filter(function (k, i) { return i !== K[1]; });
      return pr('What kind of object is ' + K[0] + '?', mc(KINDS[K[1]], R.sample(wr, 3)), [
        'Look at what it is made of, how big it is and what it orbits.',
        'It is ' + KINDS[K[1]].toLowerCase() + '.'
      ], 'Does it orbit the Sun or a planet? Is it rocky, icy or gas?', { vk: 'concept' });
    }
    function order() {
      var i = R.int(0, 7), ord = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][i];
      var wr = R.sample(PLAN.filter(function (p, j) { return j !== i && MA.abs(j - i) <= 3; }).map(function (p) { return p[0]; }), 3);
      return pr('Which planet is ' + ord + ' from the Sun?', mc(PLAN[i][0], wr), [
        'In order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
        'The ' + ord + ' is ' + PLAN[i][0] + '.'
      ], 'Rocky ones first, then the giants.', { vk: 'concept' });
    }
    function table() {
      var f = R.pick([['hottest', 4, 1], ['largest', 2, 1], ['longest year', 3, 1], ['closest to the Sun', 1, -1]]);
      var ids = f[0] === 'hottest' && R.chance(0.7) ? R.shuffle([0, 1].concat(R.sample([2, 3, 4, 5, 6, 7], 2))) : R.sample([0, 1, 2, 3, 4, 5, 6, 7], 4);
      var col = { hottest: ['Average temperature', '°C'], largest: ['Diameter', 'km'], 'longest year': ['One orbit takes', 'Earth years'], 'closest to the Sun': ['Distance from the Sun', 'AU'] }[f[0]];
      var best = ids.slice().sort(function (a, b) { return f[2] * (PLAN[b][f[1]] - PLAN[a][f[1]]); })[0];
      var rows = ids.map(function (j) { return PLAN[j][0] + ': ' + M(N(PLAN[j][f[1]]) + (col[1] === '°C' ? '^{\\circ}\\mathrm{C}' : '\\,\\mathrm{' + col[1].replace(/ /g, '\\ ') + '}')); }).join('; ');
      return pr('Using these values from NASA (' + col[0].charAt(0).toLowerCase() + col[0].slice(1).replace('the sun', 'the Sun') + '): ' + rows + '. Which of these planets is ' + f[0] + '?', mc(PLAN[best][0], ids.filter(function (j) { return j !== best; }).map(function (j) { return PLAN[j][0]; })), [
        'Compare the numbers: the ' + (f[2] > 0 ? 'biggest' : 'smallest') + ' is ' + PLAN[best][0] + '\'s.',
        f[0] === 'hottest' && best === 1 ? 'Venus beats Mercury even though Mercury is closer: Venus\'s thick carbon dioxide air traps heat.' : PLAN[best][0] + ' is ' + f[0] + '.'
      ], 'Read the numbers, not your guess.', { vk: 'ss-table', ids: ids, f: f[1], dir: f[2] });
    }
    function tfOne() {
      return tfq(R, [
        ['Mercury is the hottest planet because it is closest to the Sun.', false, 'Venus is hotter (about 464 °C) because its thick carbon dioxide atmosphere traps heat.'],
        ['The four inner planets are rocky, and the four outer planets are giants.', true, 'Mercury, Venus, Earth and Mars are rocky; Jupiter, Saturn, Uranus and Neptune are giants.'],
        ['A comet\'s tail always points behind it, the way it came from.', false, 'Sunlight and the solar wind push the tail away from the Sun, whichever way the comet moves.'],
        ['Most asteroids orbit the Sun between Mars and Jupiter.', true, 'That region is the asteroid belt.'],
        ['Pluto is now called a dwarf planet.', true, 'It is round but shares its region with many other icy objects.']
      ], 'Think about what each family of objects is made of and where it orbits.');
    }
    return lv(R, ctx, [classify, order, tfOne], [classify, table, order], [table, tfOne, classify]);
  });

  G('earthsci.solar-system-scale', function (R, ctx) {
    function au2km() {
      var p = R.pick([['Mercury', 0.4], ['Venus', 0.7], ['Mars', 1.5], ['Ceres', 2.8], ['Jupiter', 5.2], ['Saturn', 9.6], ['Uranus', 19.2], ['Neptune', 30], ['Pluto', 39.5], ['a comet', R.pick([3, 4, 6, 12, 25])], ['an asteroid', R.pick([2.2, 2.5, 3.2])], ['a space probe', R.pick([50, 80, 120, 160])]]);
      var km = fix(p[1] * 150);
      return pr(cap(p[0]) + ' is about ' + MQ(p[1], 'AU') + ' from the Sun. If 1 AU is about 150 million km, about how many million kilometers is that?', num(km, 0.02), [
        'Multiply by 150 million km for each AU.',
        M(N(p[1]) + ' \\times 150 = ' + N(km)) + ', so about ' + N(km) + ' million km.'
      ], 'One AU is about 150 million km.', { vk: 'sc-au2km', unit: 'million km' });
    }
    function km2au() {
      var au = R.pick([2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 24, 30, 40, 50, 60]), km = au * 150;
      return pr('A space probe is ' + N(km) + ' million km from the Sun. If 1 AU is about 150 million km, how many AU is that?', num(au, 0.02), [
        'Divide by 150 million km per AU.',
        M(N(km) + ' \\div 150 = ' + N(au)) + ' AU.'
      ], 'How many 150s fit into the distance?', { vk: 'sc-km2au', unit: 'AU' });
    }
    function model() {
      var s = R.pick([1, 2, 3, 4, 5, 6, 10, 12, 20, 25]), p = R.pick(PLAN.slice(1)), d = fix(p[1] * s);
      return pr('In a scale model on a field, 1 AU is ' + MQ(s, 'm') + '. ' + p[0] + ' is about ' + MQ(p[1], 'AU') + ' from the Sun. How far from the model Sun should it go?', num(d, 0.02), [
        'Every AU becomes ' + MQ(s, 'm') + '.',
        M(N(p[1]) + ' \\times ' + N(s) + ' = ' + N(d)) + ' m.'
      ], 'Multiply the distance in AU by the meters per AU.', { vk: 'sc-model', unit: 'm' });
    }
    function sizes() {
      var e = R.pick([0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5]), sun = fix(109 * e);
      return pr('The Sun is about 109 times as wide as Earth. In a model where Earth is a bead ' + MQ(e, 'cm') + ' wide, how wide is the model Sun?', num(sun, 0.02), [
        'Every width is scaled by the same factor, so the Sun stays 109 times as wide.',
        M('109 \\times ' + N(e) + ' = ' + N(sun)) + ' cm.'
      ], 'Ratios stay the same in a scale model.', { vk: 'sc-size', unit: 'cm' });
    }
    function light() {
      var p = R.pick([['Mercury', 0.4], ['Venus', 0.7], ['Mars', 1.5], ['Ceres', 2.8], ['Jupiter', 5.2], ['Saturn', 9.6], ['Uranus', 19.2], ['Neptune', 30], ['Pluto', 39.5]]), t = fix(p[1] * 8.3);
      return pr('Sunlight takes about 8.3 minutes to travel 1 AU. About how many minutes does it take to reach ' + p[0] + ', about ' + MQ(p[1], 'AU') + ' from the Sun?', num(t, 0.03), [
        'Light covers each AU in about 8.3 minutes.',
        M(N(p[1]) + ' \\times 8.3 \\approx ' + N(rnd(t, 1))) + ' minutes.'
      ], 'Multiply the AU by the minutes per AU.', { vk: 'sc-light', unit: 'min' });
    }
    function tfOne() {
      return tfq(R, [
        ['If the Sun were a ball 1 m wide, Earth would be about the size of a pea, more than 100 m away.', true, 'Earth is 109 times smaller than the Sun (about 9 mm) and about 107 Sun-widths away.'],
        ['The planets are close to one another compared with their sizes, as most book pictures show.', false, 'Book pictures squeeze the distances; the gaps between planets are thousands of times their sizes.'],
        ['One astronomical unit is the average distance from Earth to the Sun.', true, 'About 150 million km.'],
        ['Neptune is about 30 times farther from the Sun than Earth is.', true, 'Neptune is about 30 AU from the Sun.']
      ], 'Compare sizes with distances.');
    }
    return lv(R, ctx, [au2km, model, sizes, au2km], [au2km, km2au, model, sizes, light], [light, sizes, km2au, model, tfOne]);
  });

  G('earthsci.stars-galaxies', function (R, ctx) {
    function ly2km() {
      var d = R.pick([2, 4, 4.2, 8.6, 10, 11, 20, 25, 40]), km = fix(d * 9.5);
      return pr('A star is about ' + N(d) + ' light-years away. One light-year is about 9.5 trillion km. About how many trillion kilometers away is the star?', num(km, 0.02), [
        M(N(d) + ' \\times 9.5 = ' + N(km)) + ', so about ' + N(km) + ' trillion km.'
      ], 'Multiply by the kilometers in one light-year.', { vk: 'sg-km', unit: 'trillion km' });
    }
    function lookback() {
      var d = R.pick([8.6, 25, 65, 100, 430, 640, 1000, 2500000]), obj = d >= 1e6 ? 'the Andromeda Galaxy' : R.pick(['a star', 'a bright star', 'a star cluster']);
      return pr('The light reaching you tonight from ' + obj + ' ' + N(d) + ' light-years away left it how many years ago?', num(d, 0.01), [
        'Light travels one light-year in one year.',
        'So it has been traveling for ' + N(d) + ' years. We see ' + obj + ' as it was then.'
      ], 'A light-year is how far light goes in a year.', { vk: 'sg-back', unit: 'years' });
    }
    function cross() {
      var d = R.pick([100000, 50000, 26000, 2500000]), what = { 100000: 'across the Milky Way (about 100,000 light-years)', 50000: 'from the center of the Milky Way to its edge (about 50,000 light-years)', 26000: 'from the center of the Milky Way to the Sun (about 26,000 light-years)', 2500000: 'from the Andromeda Galaxy to us (about 2.5 million light-years)' }[d];
      return pr('How many years does light take to travel ' + what + '?', num(d, 0.01), [
        'Light takes one year to go one light-year.',
        'So it takes about ' + N(d) + ' years.'
      ], 'Light-years and years match up for light.', { vk: 'sg-back', unit: 'years' });
    }
    function biggest() {
      var all = [['the Moon', 0], ['Earth', 1], ['the Sun', 2], ['the solar system', 3], ['the Milky Way', 4], ['the group of galaxies the Milky Way belongs to', 5]];
      var pick = R.sample(all, 4), big = pick.slice().sort(function (a, b) { return b[1] - a[1]; })[0], small = pick.slice().sort(function (a, b) { return a[1] - b[1]; })[0];
      var askBig = R.coin(), right = askBig ? big : small;
      return pr('Which of these is the ' + (askBig ? 'largest' : 'smallest') + '?', mc(cap(right[0]), pick.filter(function (x) { return x !== right; }).map(function (x) { return cap(x[0]); })), [
        'From small to large: the Moon, Earth, the Sun, the solar system, the Milky Way, then groups of galaxies.',
        'Here the ' + (askBig ? 'largest' : 'smallest') + ' is ' + right[0] + '.'
      ], 'Planets orbit stars; stars gather in galaxies.', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['A light-year is a unit of time.', false, 'It is a distance: how far light travels in one year, about 9.5 trillion km.'],
        ['The Sun is an ordinary star, one of hundreds of billions in the Milky Way.', true, 'The Sun is a medium-sized star.'],
        ['The nearest stars are just beyond Neptune.', false, 'The nearest other star is about 4.2 light-years away, thousands of times farther than Neptune.'],
        ['When we look at a distant galaxy, we see it as it was long ago.', true, 'Its light took millions of years to reach us.'],
        ['The Milky Way is one of billions of galaxies.', true, 'Telescopes show galaxies in every direction.']
      ], 'A light-year is a distance.');
    }
    return lv(R, ctx, [lookback, biggest, tfOne], [ly2km, lookback, cross, biggest], [ly2km, cross, tfOne, lookback]);
  });

  // ---------- g04_inside.js ----------
  // ===================== Unit 4: Inside Earth =====================
  var MATS = [['cork', 0.24], ['pine wood', 0.5], ['oak wood', 0.75], ['candle wax', 0.9], ['ice', 0.92], ['rubber', 1.2], ['brick', 1.9], ['granite', 2.7], ['aluminum', 2.7], ['basalt', 3.0], ['steel', 7.9], ['lead', 11.3], ['gold', 19.3]];
  var FLU = [['fresh water', 1], ['seawater', 1.025], ['vegetable oil', 0.92], ['corn syrup', 1.37]];
  G('earthsci.density', function (R, ctx) {
    function dens() {
      var m0 = R.pick(MATS), v = R.pick([10, 20, 25, 40, 50, 60, 80, 100, 120, 150, 200]), m = fix(m0[1] * v);
      return pr('A block of ' + m0[0] + ' has a volume of ' + MQ(v, 'cm³') + ' and a mass of ' + MQ(m, 'g') + '. What is its density?', num(m0[1], 0.01), [
        'Density = mass ÷ volume.',
        M(N(m) + ' \\div ' + N(v) + ' = ' + N(m0[1])) + ' g/cm³.'
      ], 'Divide the mass by the volume.', { vk: 'de-div', unit: 'g/cm³' });
    }
    function box() {
      var m0 = R.pick(MATS.filter(function (x) { return x[1] >= 0.5; })), a = R.int(2, 6), b = R.int(2, 6), c = R.int(2, 10), V2 = a * b * c, m = fix(m0[1] * V2);
      return pr('A rectangular block is ' + MQ(a, 'cm') + ' by ' + MQ(b, 'cm') + ' by ' + MQ(c, 'cm') + ' and has a mass of ' + MQ(m, 'g') + '. What is its density?', num(m0[1], 0.01), [
        'Volume: ' + M(a + ' \\times ' + b + ' \\times ' + c + ' = ' + V2) + ' cm³.',
        'Density: ' + M(N(m) + ' \\div ' + V2 + ' = ' + N(m0[1])) + ' g/cm³.'
      ], 'Find the volume first: length × width × height.', { vk: 'de-box', unit: 'g/cm³' });
    }
    function mass() {
      var m0 = R.pick(MATS), v = R.pick([5, 10, 20, 30, 50, 100, 250]), m = fix(m0[1] * v);
      return pr(cap(m0[0]) + ' has a density of ' + MQ(m0[1], 'g/cm³') + '. What is the mass of ' + MQ(v, 'cm³') + ' of it?', num(m, 0.01), [
        'Mass = density × volume.',
        M(N(m0[1]) + ' \\times ' + N(v) + ' = ' + N(m)) + ' g.'
      ], 'Each cubic centimeter has a mass equal to the density.', { vk: 'de-mul', unit: 'g' });
    }
    function vol() {
      var m0 = R.pick([['granite', 2.7], ['basalt', 3], ['iron ore (hematite)', 5.3], ['quartz', 2.65], ['lead', 11.3]]), v = R.pick([10, 20, 30, 40, 50, 100]), m = fix(m0[1] * v);
      return pr('A sample of ' + m0[0] + ' (density ' + MQ(m0[1], 'g/cm³') + ') has a mass of ' + MQ(m, 'g') + '. What is its volume?', num(v, 0.01), [
        'Volume = mass ÷ density.',
        M(N(m) + ' \\div ' + N(m0[1]) + ' = ' + N(v)) + ' cm³.'
      ], 'Undo the multiplication: divide the mass by the density.', { vk: 'de-vol', unit: 'cm³' });
    }
    function floatSink() {
      var m0 = R.pick(MATS.filter(function (x) { return x[0] !== 'aluminum'; })), f = R.pick(FLU);
      if (MA.abs(m0[1] - f[1]) < 0.05) f = FLU[0];
      var fl = m0[1] < f[1], size = R.pick(['A huge block', 'A tiny chip', 'A 10 kg chunk', 'A thin sheet']);
      return pr(size + ' of ' + m0[0] + ' (density ' + MQ(m0[1], 'g/cm³') + ') is placed in ' + f[0] + ' (density ' + MQ(f[1], 'g/cm³') + '). Does it float or sink?', mc(fl ? 'It floats' : 'It sinks', [fl ? 'It sinks' : 'It floats', 'It depends on how big it is', 'It hangs halfway, neither floating nor sinking']), [
        'Compare densities: ' + M(N(m0[1]) + (fl ? ' < ' : ' > ') + N(f[1])) + '.',
        (fl ? 'Less dense than the fluid: it floats.' : 'Denser than the fluid: it sinks.') + ' Its size doesn\'t matter.'
      ], 'Only the densities matter, not the size.', { vk: 'de-float', rb: m0[1], rf: f[1] });
    }
    function under() {
      var m0 = R.pick([['ice', 0.92], ['oak wood', 0.75], ['pine wood', 0.5], ['candle wax', 0.9], ['a plastic toy', 0.95], ['cork', 0.24]]), f = R.pick([FLU[0], FLU[0], FLU[3]]);
      var p = fix(rnd(m0[1] / f[1] * 100, 1));
      return pr(cap(m0[0]) + ' (density ' + MQ(m0[1], 'g/cm³') + ') floats in ' + f[0] + ' (density ' + MQ(f[1], 'g/cm³') + '). What percent of it is below the surface?', { t: 'num', v: String(p), rtol: 0.02, pct: true }, [
        'Fraction under = density of the object ÷ density of the fluid.',
        M(N(m0[1]) + ' \\div ' + N(f[1]) + ' \\approx ' + N(rnd(m0[1] / f[1], 3))) + ', which is about ' + N(p) + '%.'
      ], 'Divide the two densities.', { vk: 'de-under' });
    }
    function tfOne() {
      return tfq(R, [
        ['Heavy things always sink in water.', false, 'A huge log is heavy but floats; what matters is density, not mass.'],
        ['If you cut a floating block of wood in half, each half still floats.', true, 'Cutting changes mass and volume together, so the density stays the same.'],
        ['Iron sank to Earth\'s center because it is denser than rock.', true, 'When young Earth was hot, its materials sorted by density.'],
        ['A substance\'s density changes when you have more of it.', false, 'More of a substance has more mass and more volume in the same ratio, so its density is the same.']
      ], 'Density is mass per volume.');
    }
    return lv(R, ctx, [dens, floatSink, mass], [box, mass, floatSink, dens, tfOne], [vol, under, box]);
  });

  G('earthsci.earth-layers', function (R, ctx) {
    var LAY = ['Crust', 'Mantle', 'Outer core', 'Inner core'];
    var BOUND = 'Use these depths: crust 0 to 35 km, mantle 35 to 2,900 km, outer core 2,900 to 5,150 km, inner core 5,150 to 6,371 km.';
    function label() {
      var i = R.int(0, 3);
      return pr('The picture shows Earth cut open, with the layers lettered from the outside in. Which layer is ' + LET[i] + '?', mc(LAY[i], LAY.filter(function (x, j) { return j !== i; })), [
        'From the outside in, the layers are crust, mantle, outer core and inner core.',
        'So ' + LET[i] + ' is the ' + LAY[i].toLowerCase() + '.'
      ], 'Start from the thin outer skin.', { vk: 'el-label', viz: { name: 'es-interior', opts: { mode: 'layers', letters: true, quiet: true, lock: true } }, idx: i });
    }
    function depth() {
      var K = R.pick([[R.pick([10, 20, 30]), 0], [R.pick([100, 400, 700, 1000, 1500, 2000, 2500]), 1], [R.pick([3000, 3500, 4000, 4500, 5000]), 2], [R.pick([5300, 5600, 6000, 6300]), 3]]);
      return pr('A wave probe reaches a depth of ' + MQ(K[0], 'km') + '. Which layer is it in? ' + BOUND, mc(LAY[K[1]], LAY.filter(function (x, j) { return j !== K[1]; })), [
        'Find the range that ' + MQ(K[0], 'km') + ' falls in.',
        'It is in the ' + LAY[K[1]].toLowerCase() + '.'
      ], 'Compare the depth with each boundary.', { vk: 'el-depth', d: K[0], idx: K[1] });
    }
    function thick() {
      var K = R.pick([['mantle', 35, 2900], ['outer core', 2900, 5150], ['inner core', 5150, 6371], ['core (outer and inner together)', 2900, 6371]]);
      var t = K[2] - K[1];
      return pr('How thick is the ' + K[0] + '? ' + BOUND, exact(t), [
        'It runs from ' + MQ(K[1], 'km') + ' to ' + MQ(K[2], 'km') + '.',
        M(N(K[2]) + ' - ' + N(K[1]) + ' = ' + N(t)) + ' km.'
      ], 'Subtract the top depth from the bottom depth.', { vk: 'el-thick', unit: 'km', top: K[1], bot: K[2] });
    }
    function concept() {
      return mcq(R, [
        ['Which layer of Earth is liquid?', 'The outer core', ['The mantle', 'The inner core', 'The crust'], 'S waves can\'t pass through the outer core, so it must be liquid; the mantle and inner core are solid.'],
        ['Which layer is the densest?', 'The inner core', ['The crust', 'The mantle', 'The outer core'], 'Density increases toward the center; the inner core is about 13 g/cm³.'],
        ['Which layer is the thickest?', 'The mantle', ['The crust', 'The outer core', 'The inner core'], 'The mantle is about 2,900 km thick, far more than any other layer.'],
        ['What are Earth\'s two core layers made of?', 'Mostly iron and nickel', ['Mostly granite', 'Mostly water and ice', 'Mostly hydrogen gas'], 'Iron and nickel are dense metals that sank to the center.'],
        ['How do scientists know the outer core is liquid?', 'S waves from earthquakes cannot pass through it.', ['Drills have reached it.', 'Lava comes from it.', 'It is visible from space.'], 'S waves travel only through solids; they never cross the outer core.']
      ], 'Think about density and earthquake waves.');
    }
    function tfOne() {
      return tfq(R, [
        ['The mantle is a thick layer of liquid magma.', false, 'The mantle is almost all solid rock that creeps very slowly; only the outer core is liquid.'],
        ['The crust is the thinnest layer.', true, 'It is about 5 to 70 km thick, compared with thousands of kilometers for the others.'],
        ['The inner core is solid even though it is extremely hot.', true, 'The enormous pressure keeps the iron solid.'],
        ['People have drilled all the way through the crust into the mantle.', false, 'The deepest hole ever drilled is about 12 km, still in the crust.']
      ], 'Only one layer is liquid.');
    }
    return lv(R, ctx, [label, concept, depth], [depth, thick, label, concept], [thick, tfOne, depth, concept]);
  });

  G('earthsci.lithosphere-asthenosphere', function (R, ctx) {
    function which() {
      return mcq(R, [
        ['Which layer is broken into the tectonic plates?', 'The lithosphere', ['The asthenosphere', 'The outer core', 'Only the crust'], 'Plates are pieces of the stiff lithosphere: crust plus the top of the mantle.'],
        ['What is the lithosphere made of?', 'The crust plus the uppermost mantle', ['The crust only', 'The mantle only', 'The core'], 'The stiff outer shell reaches below the crust into the cold top of the mantle.'],
        ['What is the asthenosphere like?', 'Hot, soft rock that is solid but can slowly flow', ['A layer of liquid magma', 'Cold, brittle rock', 'Liquid iron'], 'It is near its melting point, so it is weak and creeps, but it is not liquid.'],
        ['What do the tectonic plates slide over?', 'The asthenosphere', ['The outer core', 'A layer of water', 'The inner core'], 'The plates ride on the weak, hot asthenosphere.']
      ], 'Lithosphere = stiff; asthenosphere = soft.');
    }
    function mantlePart() {
      var c = R.pick([7, 10, 30, 35, 40, 50]), l = R.pick([70, 80, 100, 120, 150, 180]);
      if (l - c < 30) l = c + 60;
      return pr('In one place the crust is ' + MQ(c, 'km') + ' thick and the lithosphere is ' + MQ(l, 'km') + ' thick. How many kilometers of the lithosphere are mantle rock?', exact(l - c), [
        'The lithosphere is the crust plus the stiff top of the mantle.',
        M(N(l) + ' - ' + N(c) + ' = ' + N(l - c)) + ' km of mantle.'
      ], 'Subtract the crust from the whole lithosphere.', { vk: 'la-sub', unit: 'km' });
    }
    function depth() {
      var d = R.pick([20, 50, 80, 150, 200, 250, 300]), lith = d < 100, crust = d <= 35;
      var right = crust ? 'The crust, in the lithosphere' : lith ? 'The mantle, in the lithosphere' : 'The mantle, in the asthenosphere';
      return pr('Here the crust is 35 km thick, the lithosphere 100 km thick, and the asthenosphere reaches to 350 km. Rock ' + MQ(d, 'km') + ' down is in which layers?', mc(right, ['The crust, in the lithosphere', 'The mantle, in the lithosphere', 'The mantle, in the asthenosphere', 'The crust, in the asthenosphere'].filter(function (x) { return x !== right; })), [
        crust ? MQ(d, 'km') + ' is within the top 35 km: crust.' : MQ(d, 'km') + ' is below the 35 km crust: mantle.',
        lith ? 'It is above 100 km: still the stiff lithosphere.' : 'It is below 100 km: the soft asthenosphere.'
      ], 'Check the depth against both kinds of boundary.', { vk: 'la-depth', d: d });
    }
    function tfOne() {
      return tfq(R, [
        ['Tectonic plates are made of crust only.', false, 'Plates are lithosphere: the crust plus the top of the mantle.'],
        ['The plates float on a layer of liquid rock.', false, 'The asthenosphere is hot and weak but solid; it flows very slowly.'],
        ['The boundary between the lithosphere and asthenosphere lies inside the mantle.', true, 'The stiff top of the mantle belongs to the lithosphere.'],
        ['Hot rock can be solid and still flow very slowly over thousands of years.', true, 'Rock near its melting point creeps, like warm wax or stiff putty.']
      ], 'Lithosphere: stiff. Asthenosphere: soft but solid.');
    }
    return lv(R, ctx, [which, mantlePart, which], [depth, mantlePart, which, tfOne], [depth, tfOne, mantlePart]);
  });

  G('earthsci.convection', function (R, ctx) {
    function pot() {
      return mcq(R, [
        ['A pot of water sits over a burner in its center. Where does the water rise?', 'Over the burner, in the middle', ['At the sides of the pot', 'Everywhere equally', 'Nowhere: water in a pot doesn\'t move'], 'Water over the burner warms, expands and becomes less dense, so cooler water sinks and pushes it up.'],
        ['In a convection loop, why does cooler fluid sink?', 'It is denser, so gravity pulls it down more strongly.', ['Cold is heavier than heat.', 'Heat pushes it down.', 'It has more particles moving fast.'], 'Cooling packs the particles closer: same mass in less space.'],
        ['What happens to warm fluid when it reaches the top of a convection loop?', 'It cools, becomes denser and sinks.', ['It stays at the top forever.', 'It turns into a gas.', 'It keeps rising into space.'], 'Losing heat at the top makes it denser, closing the loop.'],
        ['Why does warming water make it less dense?', 'Its particles move faster and spread apart, so the same mass takes up more space.', ['Warming removes some of its mass.', 'Heat is lighter than water.', 'Warm water has fewer particles.'], 'Same mass, bigger volume: lower density.']
      ], 'Warm = less dense; cool = more dense.');
    }
    function where() {
      var K = R.pick([
        ['the mantle', 'Hot rock deep in the mantle slowly rises, and cooler rock sinks, a few centimeters a year.', 'helps move the tectonic plates'],
        ['the air over a sunny parking lot', 'Air touching the hot pavement warms and rises; cooler air flows in to replace it.', 'makes rising air that can build clouds'],
        ['the ocean near the poles', 'Cold, salty surface water is dense and sinks toward the sea floor.', 'drives slow deep ocean currents'],
        ['a room with a heater on the floor', 'Air warmed by the heater rises; cooler air near the windows sinks.', 'carries warmth around the room']
      ]);
      var all = ['helps move the tectonic plates', 'makes rising air that can build clouds', 'drives slow deep ocean currents', 'carries warmth around the room'];
      return pr('Convection happens in ' + K[0] + '. ' + K[1] + ' What does this convection do?', mc(cap(K[2]), all.filter(function (x) { return x !== K[2]; }).map(cap)), [
        K[1],
        'Here it ' + K[2] + '.'
      ], 'Which loop happens in that place?', { vk: 'concept' });
    }
    function slow() {
      var v = R.pick([2, 4, 5, 10]), d = R.pick([500, 1000, 2000, 3000]), t = d * 1e5 / v / 1e6;
      return pr('Mantle rock in a convection loop creeps about ' + MQ(v, 'cm') + ' a year. How many million years does it take to move ' + MQ(d, 'km') + '? (1 km = 100,000 cm)', num(t, 0.01), [
        'Distance in centimeters: ' + M(N(d) + ' \\times 100{,}000 = ' + N(d * 1e5)) + ' cm.',
        'Time: ' + M(N(d * 1e5) + ' \\div ' + v + ' = ' + N(d * 1e5 / v)) + ' years, which is ' + N(t) + ' million years.'
      ], 'Change kilometers to centimeters first.', { vk: 'cv-slow', unit: 'million years' });
    }
    function tfOne() {
      return tfq(R, [
        ['Heat rises because heat is lighter than cold.', false, 'Heat is energy, not a substance. Warm fluid rises because the denser, cooler fluid around it sinks and pushes it up.'],
        ['Convection needs gravity.', true, 'Gravity is what pulls the denser fluid down; in orbit, a candle flame doesn\'t rise.'],
        ['Convection in the mantle happens even though the mantle is mostly solid.', true, 'Hot solid rock creeps very slowly, a few centimeters a year.'],
        ['In a pot heated from below, the hottest water stays at the bottom.', false, 'The warm water at the bottom is less dense, so it is pushed up.']
      ], 'Density differences drive convection.');
    }
    return lv(R, ctx, [pot, where, tfOne], [pot, where, slow, tfOne], [slow, pot, where]);
  });

  // ---------- g05_rocks.js ----------
  // ===================== Unit 5: Minerals and Rocks =====================
  G('earthsci.what-is-a-mineral', function (R, ctx) {
    var WHY = ['Yes: it passes all five tests', 'No: it is not formed by nature', 'No: it is made by living things', 'No: it is not a solid', 'No: it has no orderly crystal structure', 'No: it is a mixture of minerals (a rock)'];
    var ITEMS = [
      ['a quartz crystal found in a cave', 0, 'It is natural, inorganic, solid, always SiO₂, and its atoms repeat in a pattern.'],
      ['a grain of halite (rock salt) from a dried-up lake', 0, 'Halite is natural NaCl with a cubic crystal structure.'],
      ['the ice in a glacier', 0, 'Natural ice is solid H₂O with a six-sided crystal structure, so it counts.'],
      ['a gold nugget from a stream', 0, 'Native gold is a natural, inorganic, crystalline element.'],
      ['a natural diamond', 0, 'Diamond is carbon atoms in a natural, orderly crystal pattern.'],
      ['a calcite crystal from limestone', 0, 'Calcite (CaCO₃) forms naturally with a regular crystal structure.'],
      ['a diamond grown in a laboratory', 1, 'It has the right makeup and structure, but people made it, so it is not naturally occurring.'],
      ['a steel nail', 1, 'Steel is made by people in factories.'],
      ['a plastic bottle cap', 1, 'Plastic is made in factories (and from oil, which comes from living things).'],
      ['a lump of coal', 2, 'Coal formed from ancient plants and has no definite makeup.'],
      ['a piece of amber', 2, 'Amber is hardened tree resin, made by living things.'],
      ['a seashell', 2, 'A shell is made by a living animal, so it is not counted as a mineral.'],
      ['liquid water in a lake', 3, 'Liquid water is not a solid. (Frozen, it would be the mineral ice.)'],
      ['a drop of liquid mercury', 3, 'Mercury is a liquid at room temperature.'],
      ['obsidian (volcanic glass)', 4, 'Lava froze too fast for atoms to line up, so it has no crystal structure.'],
      ['window glass', 4, 'Glass has jumbled atoms, and it is also made in factories.'],
      ['a chunk of granite', 5, 'Granite is a rock: a mixture of quartz, feldspar, mica and other minerals.'],
      ['a piece of sandstone', 5, 'Sandstone is a rock made of many cemented mineral grains.']
    ];
    function judge() {
      var K = R.pick(ITEMS), wr = WHY.filter(function (w, i) { return i !== K[1]; });
      if (K[0] === 'window glass') wr = wr.filter(function (w) { return w !== WHY[1]; }); // glass fails two tests; offer only one of them
      return pr('Is ' + K[0] + ' a mineral?', mc(WHY[K[1]], R.sample(wr, 3)), [
        'Check the tests: natural, inorganic, solid, definite makeup, orderly crystal structure.',
        K[2]
      ], 'Go through the five tests one at a time.', { vk: 'concept' });
    }
    function yesNo() {
      var K = R.pick(ITEMS);
      return pr('True or false: ' + cap(K[0]) + ' is a mineral.', tf(K[1] === 0), [K[2], K[1] === 0 ? 'So it is a mineral.' : 'So it is not a mineral.'], 'Natural, inorganic, solid, fixed recipe, orderly crystals.', { vk: 'concept' });
    }
    function rockVs() {
      return mcq(R, [
        ['What is the difference between a rock and a mineral?', 'A rock is usually a mixture of minerals; a mineral is a single substance with a definite makeup and crystal structure.', ['A mineral is always bigger than a rock.', 'Rocks are natural; minerals are made by people.', 'There is no difference.'], 'Granite, for example, is a rock made of quartz, feldspar and mica.'],
        ['Which test does volcanic glass (obsidian) fail?', 'It has no orderly crystal structure.', ['It is not natural.', 'It is not solid.', 'It is made by living things.'], 'Lava cooled too fast for its atoms to line up.'],
        ['Why does halite (rock salt) break into little cubes?', 'Its atoms are arranged in a repeating cube pattern.', ['It was cut by people.', 'Water dissolves it into cubes.', 'All minerals break into cubes.'], 'A mineral\'s shape and breakage come from its crystal structure.']
      ], 'A mineral is one substance; a rock is a mix.');
    }
    return lv(R, ctx, [judge, yesNo], [judge, yesNo, rockVs], [judge, rockVs]);
  });

  G('earthsci.mineral-properties', function (R, ctx) {
    var MOHS = [[1, 'talc'], [2, 'gypsum'], [3, 'calcite'], [4, 'fluorite'], [5, 'apatite'], [6, 'orthoclase'], [7, 'quartz'], [8, 'topaz'], [9, 'corundum'], [10, 'diamond']];
    var TOOLS = [[2.5, 'a fingernail'], [3.5, 'a copper coin'], [5.5, 'a steel nail'], [5.5, 'a glass plate']];
    function scratch() {
      var a = R.sample(MOHS, 2), hard = a[0][0] > a[1][0] ? a[0] : a[1], soft = hard === a[0] ? a[1] : a[0];
      return pr('On the Mohs scale, ' + a[0][1] + ' is ' + a[0][0] + ' and ' + a[1][1] + ' is ' + a[1][0] + '. What happens if you rub them together?', mc(cap(hard[1]) + ' scratches ' + soft[1] + '.', [cap(soft[1]) + ' scratches ' + hard[1] + '.', 'Each scratches the other.', 'Neither can scratch the other.']), [
        'A harder mineral scratches a softer one.',
        hard[1] + ' (' + hard[0] + ') is harder than ' + soft[1] + ' (' + soft[0] + '), so ' + hard[1] + ' scratches ' + soft[1] + '.'
      ], 'The higher Mohs number scratches the lower one.', { vk: 'mn-scratch', h: hard[0], s: soft[0] });
    }
    function range() {
      var lo = R.pick([TOOLS[0], TOOLS[1], [3, 'calcite'], [4, 'fluorite']]), his = MOHS.filter(function (m) { return m[0] > lo[0] + 1; }), hi = R.pick(his.slice(0, 4));
      var mids = MOHS.filter(function (m) { return m[0] > lo[0] && m[0] < hi[0]; });
      if (!mids.length) { hi = MOHS[MA.min(9, MA.ceil(lo[0]) + 1)]; mids = MOHS.filter(function (m) { return m[0] > lo[0] && m[0] < hi[0]; }); }
      var right = mids[R.int(0, mids.length - 1)], wr = MOHS.filter(function (m) { return m[0] <= lo[0] || m[0] >= hi[0]; });
      return pr('A mystery mineral scratches ' + lo[1] + ' (hardness ' + N(lo[0]) + ') but is scratched by ' + hi[1] + ' (hardness ' + hi[0] + '). Which of these could it be?', mc(cap(right[1]) + ' (' + right[0] + ')', R.sample(wr, 3).map(function (m) { return cap(m[1]) + ' (' + m[0] + ')'; })), [
        'It scratches ' + lo[1] + ', so it is harder than ' + N(lo[0]) + '.',
        'It is scratched by ' + hi[1] + ', so it is softer than ' + hi[0] + '.',
        'Only ' + right[1] + ' (' + right[0] + ') is between them.'
      ], 'Harder than the first, softer than the second.', { vk: 'mn-range', lo: lo[0], hi: hi[0], r: right[0] });
    }
    var IDS = [
      ['metallic', 'dark gray', 'a red-brown streak', 'hematite', ''], ['metallic', 'black', 'a black streak', 'magnetite', 'it pulls on a magnet'],
      ['metallic', 'brassy yellow', 'a greenish-black streak', 'pyrite', ''], ['metallic', 'lead gray', 'a lead-gray streak', 'galena', 'it breaks into cubes and feels very heavy'],
      ['nonmetallic', 'white', 'a white streak', 'calcite', 'it fizzes in weak acid'], ['nonmetallic', 'clear', 'no streak, because it is harder than the tile', 'quartz', 'it scratches glass']
    ];
    function streak() {
      var K = R.pick(IDS);
      return pr('A sample has ' + K[0] + ' luster, looks ' + K[1] + ' and leaves ' + K[2] + (K[4] ? '; also, ' + K[4] : '') + '. Use this table: hematite: metallic, red-brown streak; magnetite: metallic, black streak, magnetic; pyrite: metallic, brassy, greenish-black streak; galena: metallic, lead-gray streak, very dense, cubes; calcite: nonmetallic, white streak, fizzes in acid; quartz: nonmetallic, hardness 7, scratches glass. Which mineral is it?', mc(cap(K[3]), R.sample(IDS.filter(function (x) { return x !== K; }), 3).map(function (x) { return cap(x[3]); })), [
        'Match the luster first, then the streak, which is more reliable than color.',
        'A ' + K[0] + ' mineral with ' + K[2].replace(/, because.*$/, '') + (K[4] ? ' that ' + K[4].replace(/^it /, '') : '') + ': ' + K[3] + '.'
      ], 'Streak beats color.', { vk: 'concept' });
    }
    function densId() {
      var K = R.pick([['galena', 7.5], ['quartz', 2.65], ['pyrite', 5.0], ['calcite', 2.71], ['magnetite', 5.2], ['halite', 2.16]]), v = R.pick([2, 4, 5, 8, 10, 20]), m = fix(K[1] * v);
      var all = ['galena (7.5 g/cm³)', 'quartz (2.65 g/cm³)', 'pyrite (5.0 g/cm³)', 'halite (2.16 g/cm³)'];
      if (K[0] === 'calcite' || K[0] === 'magnetite') all = ['galena (7.5 g/cm³)', K[0] === 'calcite' ? 'calcite (2.71 g/cm³)' : 'magnetite (5.2 g/cm³)', 'halite (2.16 g/cm³)', K[0] === 'calcite' ? 'pyrite (5.0 g/cm³)' : 'quartz (2.65 g/cm³)'];
      var right = all.filter(function (x) { return x.indexOf(K[0]) === 0; })[0];
      return pr('A mineral sample has a mass of ' + MQ(m, 'g') + ' and a volume of ' + MQ(v, 'cm³') + '. Which of these minerals is it most likely to be?', mc(right, all.filter(function (x) { return x !== right; })), [
        'Density = mass ÷ volume: ' + M(N(m) + ' \\div ' + v + ' = ' + N(K[1])) + ' g/cm³.',
        'That matches ' + right + '.'
      ], 'Find the density first.', { vk: 'mn-dens', d: K[1] });
    }
    function tfOne() {
      return tfq(R, [
        ['On the Mohs scale, diamond (10) is exactly ten times as hard as talc (1).', false, 'The Mohs scale is only a ranking; the steps are not equal, and diamond is far more than ten times as hard.'],
        ['Color is the most reliable way to identify a mineral.', false, 'Small traces of other elements change color; streak, hardness and cleavage are more reliable.'],
        ['A mineral\'s streak is the color of its powder.', true, 'Rubbing it on unglazed tile powders it.'],
        ['Cleavage means a mineral breaks along flat surfaces.', true, 'Weak directions in the crystal structure split cleanly.'],
        ['A mineral that scratches glass is harder than about 5.5.', true, 'Glass is about 5.5 on the Mohs scale.']
      ], 'Hardness is a ranking; streak beats color.');
    }
    return lv(R, ctx, [scratch, streak, tfOne], [range, streak, scratch, densId], [range, densId, tfOne, streak]);
  });

  G('earthsci.igneous-rocks', function (R, ctx) {
    function setting() {
      var K = R.pick([
        ['Magma cools slowly, miles underground, over thousands of years.', 'Large crystals you can see'],
        ['Lava pours out of a volcano and cools in the open air over days.', 'Tiny crystals too small to see'],
        ['Lava flows into the sea and freezes almost instantly.', 'Glass with no crystals'],
        ['Frothy, gas-filled lava is blasted into the air and hardens.', 'A rock full of gas holes'],
        ['Magma cools slowly deep down for a while, then erupts and the rest cools fast.', 'Large crystals scattered in a fine-grained background']
      ]);
      var all = ['Large crystals you can see', 'Tiny crystals too small to see', 'Glass with no crystals', 'A rock full of gas holes', 'Large crystals scattered in a fine-grained background'];
      return pr(K[0] + ' What texture will the rock have?', mc(K[1], R.sample(all.filter(function (x) { return x !== K[1]; }), 3)), [
        'Crystals need time to grow: slow cooling, big crystals; fast cooling, small ones; instant freezing, glass; trapped gas leaves holes.',
        'So: ' + K[1].toLowerCase() + '.'
      ], 'How much time did the crystals have to grow?', { vk: 'concept' });
    }
    var ROCKS = [
      ['coarse-grained (large crystals) and light-colored, rich in silica', 'Granite'], ['coarse-grained and dark-colored, rich in iron and magnesium', 'Gabbro'],
      ['fine-grained (tiny crystals) and dark-colored', 'Basalt'], ['fine-grained and light-colored', 'Rhyolite'],
      ['glassy and black, breaking along smooth curves', 'Obsidian'], ['light-colored and full of gas holes, so light it can float', 'Pumice']
    ];
    function name() {
      var K = R.pick(ROCKS), show = { Granite: 'granite', Basalt: 'basalt', Obsidian: 'obsidian', Pumice: 'pumice', Gabbro: 'gabbro', Rhyolite: 'rhyolite' }[K[1]];
      var p = pr('An igneous rock is ' + K[0] + '. What is it?', mc(K[1], R.sample(ROCKS.filter(function (x) { return x !== K; }).map(function (x) { return x[1]; }), 3)), [
        'Texture tells cooling: coarse = slow (underground), fine = fast (surface), glassy = very fast, holes = gas.',
        'Color tells makeup: light = rich in silica, dark = rich in iron and magnesium.',
        'So it is ' + K[1].toLowerCase() + '.'
      ], 'First texture, then color.', { vk: 'concept' });
      if (ctx.level >= 2 && R.coin()) p.viz = { name: 'es-rock-key', opts: { sample: show, quiet: true, lock: true } };
      return p;
    }
    function where() {
      var K = R.pick([['granite', 'Deep underground, cooling slowly', 'It has large crystals.'], ['gabbro', 'Deep underground, cooling slowly', 'It has large crystals.'], ['basalt', 'At the surface, cooling quickly', 'Its crystals are tiny.'], ['rhyolite', 'At the surface, cooling quickly', 'Its crystals are tiny.'], ['obsidian', 'At the surface, cooling almost instantly', 'It is glass.']]);
      var all = ['Deep underground, cooling slowly', 'At the surface, cooling quickly', 'At the surface, cooling almost instantly', 'In a lake, from layers of sand'];
      return pr('Where and how did ' + K[0] + ' most likely form?', mc(K[1], all.filter(function (x) { return x !== K[1]; })), [K[2], 'So: ' + K[1].toLowerCase() + '.'], 'Crystal size records the cooling rate.', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['Lava that cools quickly grows large crystals.', false, 'Crystals need time to grow, so fast cooling makes small crystals, or glass.'],
        ['Granite cooled slowly underground.', true, 'Its large crystals show slow cooling.'],
        ['Pumice can float on water because it is full of gas holes.', true, 'The bubbles make its overall density less than water\'s.'],
        ['Obsidian is made of large, well-formed crystals.', false, 'Obsidian is volcanic glass, which froze too fast to form crystals.'],
        ['A rock with large crystals in a fine background cooled in two stages.', true, 'Slow cooling grew the big crystals; fast cooling made the fine background.']
      ], 'Slow cooling, big crystals.');
    }
    return lv(R, ctx, [setting, name, tfOne], [name, where, setting], [name, tfOne, where, setting]);
  });

  G('earthsci.sedimentary-rocks', function (R, ctx) {
    function size() {
      var K = R.pick([
        [R.pick([5, 10, 20, 40]), 'rounded', 'Conglomerate'], [R.pick([5, 10, 30]), 'sharp-edged', 'Breccia'],
        [R.pick([0.1, 0.25, 0.5, 1, 1.5]), 'rounded', 'Sandstone'], [R.pick([0.01, 0.02, 0.03, 0.05]), 'tiny', 'Siltstone'], [R.pick([0.001, 0.002, 0.003]), 'microscopic', 'Shale']
      ]);
      var all = ['Conglomerate', 'Breccia', 'Sandstone', 'Siltstone', 'Shale'];
      return pr('A sedimentary rock is made of ' + K[1] + ' grains about ' + MQ(K[0], 'mm') + ' across, cemented together. Using the grain-size table (gravel over 2 mm, sand 1/16 to 2 mm, silt 1/256 to 1/16 mm, clay under 1/256 mm), what is it?', mc(K[2], R.sample(all.filter(function (x) { return x !== K[2]; }), 3)), [
        'Compare: 1/16 mm ≈ 0.06 mm and 1/256 mm ≈ 0.004 mm.',
        MQ(K[0], 'mm') + ' is ' + { Conglomerate: 'gravel', Breccia: 'gravel', Sandstone: 'sand', Siltstone: 'silt', Shale: 'clay' }[K[2]] + '-sized' + (K[2] === 'Conglomerate' ? ', rounded: conglomerate.' : K[2] === 'Breccia' ? ', with sharp edges: breccia.' : ': ' + K[2].toLowerCase() + '.')
      ], 'Change the fractions to decimals and compare.', { vk: 'sd-size', d: K[0], rock: K[2] });
    }
    function steps() {
      var S = ['Weathering', 'Erosion', 'Deposition', 'Compaction', 'Cementation'], i = R.int(0, 3);
      return pr('Sedimentary rock forms in five steps: weathering, erosion, deposition, compaction, cementation. Which step comes right after ' + S[i].toLowerCase() + '?', mc(S[i + 1], S.filter(function (x, j) { return j !== i + 1; }).slice(0, 4).filter(function (x, j) { return j < 3; })), [
        'Rock is broken (weathering), carried (erosion), dropped (deposition), squeezed (compaction) and glued (cementation).',
        'After ' + S[i].toLowerCase() + ' comes ' + S[i + 1].toLowerCase() + '.'
      ], 'Break, carry, drop, squeeze, glue.', { vk: 'concept' });
    }
    function origin() {
      return mcq(R, [
        ['Coal forms from what?', 'Thick layers of buried plant remains', ['Cooled lava', 'Sand grains cemented together', 'Salt left by evaporating seawater'], 'Plants buried in swamps were squeezed and heated into coal.'],
        ['Rock salt forms how?', 'Seawater or lake water evaporates and leaves its dissolved salt behind', ['Magma cools slowly', 'Shells pile up on the sea floor', 'Sand is squeezed together'], 'As water evaporates, halite crystals grow from the salty water.'],
        ['Much limestone forms from what?', 'Shells and skeletons of sea creatures', ['Volcanic ash', 'Quartz sand', 'Plant remains in swamps'], 'Calcite shells pile up on the sea floor and become limestone.'],
        ['What glues the grains of sandstone together?', 'Minerals left by water flowing through the pores, such as calcite or silica', ['Ice', 'Melted rock', 'Nothing: the grains just dry out'], 'Dissolved minerals crystallize between grains as natural cement.']
      ], 'Think about what the rock is made of.');
    }
    function tfOne() {
      return tfq(R, [
        ['Mud turns into shale simply by drying out in the sun.', false, 'Sediment becomes rock by burial (compaction) and natural cement (cementation); dry mud just crumbles.'],
        ['Sedimentary rocks often form in flat layers.', true, 'Sediment settles in layers on the floors of lakes and seas.'],
        ['Fossils are found mostly in sedimentary rocks.', true, 'Remains buried in sediment can be preserved as the sediment hardens.'],
        ['Conglomerate is made of grains smaller than sand.', false, 'Conglomerate is made of rounded gravel, larger than 2 mm.']
      ], 'Burial and cement, not drying.');
    }
    return lv(R, ctx, [steps, size, tfOne], [size, origin, steps], [size, origin, tfOne]);
  });

  G('earthsci.metamorphic-rocks', function (R, ctx) {
    var PAIRS = [['limestone', 'Marble'], ['sandstone', 'Quartzite'], ['shale', 'Slate'], ['granite', 'Gneiss']];
    function parent() {
      var K = R.pick(PAIRS), all = ['Marble', 'Quartzite', 'Slate', 'Gneiss', 'Obsidian', 'Basalt'];
      if (R.coin()) return pr('When ' + K[0] + ' is heated and squeezed without melting, which metamorphic rock does it usually become?', mc(K[1], R.sample(all.filter(function (x) { return x !== K[1]; }), 3)), [
        'Limestone → marble; sandstone → quartzite; shale → slate (and at higher grades schist and gneiss); granite → gneiss.',
        cap(K[0]) + ' becomes ' + K[1].toLowerCase() + '.'
      ], 'Match each starting rock to its changed form.', { vk: 'concept' });
      return pr(K[1] + ' is a metamorphic rock. Which rock did it most likely start as?', mc(cap(K[0]), PAIRS.filter(function (x) { return x !== K; }).map(function (x) { return cap(x[0]); })), [
        K[1] + ' forms from ' + K[0] + '.'
      ], 'Think about what minerals it is made of.', { vk: 'concept' });
    }
    function foliated() {
      var K = R.pick([['Slate', true], ['Schist', true], ['Gneiss', true], ['Phyllite', true], ['Marble', false], ['Quartzite', false]]);
      return pr('Is ' + K[0].toLowerCase() + ' foliated (minerals lined up in layers or bands)?', mc(K[1] ? 'Yes: its flat minerals are lined up in layers' : 'No: its crystals interlock with no layers', [K[1] ? 'No: its crystals interlock with no layers' : 'Yes: its flat minerals are lined up in layers', 'Only if it melted first', 'Only if it has fossils']), [
        K[1] ? K[0] + ' formed under pressure that lined up flat minerals like mica.' : K[0] + ' is made mostly of one mineral (' + (K[0] === 'Marble' ? 'calcite' : 'quartz') + ') with grains that do not line up.'
      ], 'Shale and granite make layered rocks; limestone and sandstone do not.', { vk: 'concept' });
    }
    function grade() {
      var G3 = ['Slate', 'Phyllite', 'Schist', 'Gneiss'], k = R.sample([0, 1, 2, 3], 3).sort(), hiQ = R.coin();
      var right = hiQ ? G3[k[2]] : G3[k[0]];
      return pr('Shale changes to slate, then phyllite, then schist, then gneiss as heat and pressure rise. Which of ' + G3[k[0]].toLowerCase() + ', ' + G3[k[1]].toLowerCase() + ' and ' + G3[k[2]].toLowerCase() + ' formed under the ' + (hiQ ? 'most' : 'least') + ' heat and pressure?', mc(right, [G3[k[0]], G3[k[1]], G3[k[2]]].filter(function (x) { return x !== right; }).concat(['Marble'])), [
        'The order of rising grade is slate, phyllite, schist, gneiss.',
        'Of these, ' + right.toLowerCase() + ' is ' + (hiQ ? 'last' : 'first') + '.'
      ], 'Slate is low grade; gneiss is high grade.', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['Metamorphic rock forms when rock melts and cools.', false, 'Melted rock cools into igneous rock; metamorphism happens while rock stays solid.'],
        ['Heat from nearby magma can turn limestone into marble.', true, 'Contact with hot magma bakes the rock around it.'],
        ['Any kind of rock, even a metamorphic one, can be metamorphosed.', true, 'Slate can be metamorphosed further into schist and gneiss.'],
        ['Gneiss forms at lower temperatures than slate.', false, 'Gneiss is a high-grade rock; slate is low grade.']
      ], 'Changed, not melted.');
    }
    return lv(R, ctx, [parent, tfOne, foliated], [parent, foliated, grade], [grade, parent, tfOne]);
  });

  G('earthsci.rock-cycle', function (R, ctx) {
    var ARR = [['magma', 'igneous rock', 'Cooling and crystallizing'], ['igneous rock', 'sediment', 'Uplift, weathering and erosion'], ['sediment', 'sedimentary rock', 'Deposition, compaction and cementation'],
      ['sedimentary rock', 'metamorphic rock', 'Heat and pressure'], ['metamorphic rock', 'magma', 'Melting'], ['sedimentary rock', 'sediment', 'Uplift, weathering and erosion'], ['metamorphic rock', 'sediment', 'Uplift, weathering and erosion'],
      ['igneous rock', 'metamorphic rock', 'Heat and pressure'], ['sedimentary rock', 'magma', 'Melting'], ['igneous rock', 'magma', 'Melting']];
    var PROC = ['Cooling and crystallizing', 'Uplift, weathering and erosion', 'Deposition, compaction and cementation', 'Heat and pressure', 'Melting'];
    function process() {
      var K = R.pick(ARR);
      return pr('Which process turns ' + K[0] + ' into ' + K[1] + '?', mc(K[2], R.sample(PROC.filter(function (x) { return x !== K[2]; }), 3)), [
        'Melting makes magma; cooling makes igneous rock; weathering and erosion make sediment; compaction and cementation make sedimentary rock; heat and pressure make metamorphic rock.',
        K[0] + ' → ' + K[1] + ': ' + K[2].toLowerCase() + '.'
      ], 'What has to happen to the starting material?', { vk: 'concept' });
    }
    function letter() {
      var i = R.int(0, 9), K = ARR[i];
      return pr('In the rock cycle diagram the arrows are lettered. Arrow ' + LET[i] + ' goes from ' + K[0] + ' to ' + K[1] + '. Which process does it stand for?', mc(K[2], R.sample(PROC.filter(function (x) { return x !== K[2]; }), 3)), [
        'Look at where the arrow starts and ends.',
        K[0] + ' → ' + K[1] + ': ' + K[2].toLowerCase() + '.'
      ], 'What would you have to do to the starting rock?', { vk: 'rc-letter', viz: { name: 'es-rock-cycle', opts: { paths: 'all', blank: true, lock: true } }, idx: i });
    }
    function energy() {
      return mcq(R, [
        ['What mainly powers the weathering and erosion of rock at the surface?', 'Energy from the Sun (through wind, rain and ice) and gravity', ['Heat from Earth\'s core', 'The Moon\'s gravity', 'Radioactive rocks at the surface'], 'Sunlight drives the water cycle and winds; gravity moves sediment downhill.'],
        ['What mainly powers melting and metamorphism?', 'Heat from inside Earth', ['Sunlight', 'Wind', 'Ocean tides'], 'Deep rock is heated by Earth\'s inner heat.'],
        ['What pushes deep rocks up to the surface, where they can weather?', 'Earth\'s inner heat, which drives plate motion and mountain building', ['Sunlight warming the rock', 'Rain soaking into the ground', 'The Moon\'s pull'], 'Uplift comes from forces inside Earth.']
      ], 'Two engines: Earth\'s heat inside, the Sun outside.');
    }
    function trip() {
      var K = R.pick([
        ['Basalt is worn into sand, the sand is buried and cemented, then the rock is heated and squeezed deep in a mountain range.', 'Metamorphic rock'],
        ['Gneiss melts deep underground, and the magma rises and cools slowly in a pluton.', 'Igneous rock'],
        ['Granite is worn down by rain and ice, and the grains are washed into a river.', 'Sediment'],
        ['Marble is lifted into mountains and broken down by frost and rain.', 'Sediment'],
        ['Shale is buried so deep that it melts.', 'Magma'],
        ['Mud settles in a lake, is buried under more layers and is cemented.', 'Sedimentary rock']
      ]);
      var all = ['Igneous rock', 'Sedimentary rock', 'Metamorphic rock', 'Sediment', 'Magma'];
      return pr(K[0] + ' What is the material at the end?', mc(K[1], R.sample(all.filter(function (x) { return x !== K[1]; }), 3)), [
        'Follow each process in order; only the last one decides the final form.',
        'It ends as ' + K[1].toLowerCase() + '.'
      ], 'Look at the last thing that happens.', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['Rocks always go from igneous to sedimentary to metamorphic, in that order.', false, 'Any rock can become any other kind; for example, metamorphic rock can weather straight into sediment.'],
        ['Igneous rock can become metamorphic rock without ever becoming sediment.', true, 'Heat and pressure can change igneous rock directly.'],
        ['Rock is used up in the rock cycle and never comes back.', false, 'Rock material is recycled, not destroyed.'],
        ['The rock cycle is powered by Earth\'s inner heat and by the Sun.', true, 'Inner heat melts and bakes rock; the Sun drives weathering and erosion.']
      ], 'Any rock can become any other kind.');
    }
    return lv(R, ctx, [process, letter, tfOne], [letter, energy, process, trip], [trip, letter, tfOne, energy]);
  });

  // ---------- g06_surface.js ----------
  // ===================== Unit 6: Weathering, Erosion and Soil =====================
  G('earthsci.weathering', function (R, ctx) {
    var KIND = ['Mechanical weathering', 'Chemical weathering', 'Erosion, not weathering'];
    var EVENTS = [
      ['Water in a crack freezes each night, widening the crack until the rock splits.', 0, 'Freezing water pries the rock apart; the pieces are the same rock (frost wedging).'],
      ['A tree root grows into a crack and pushes a boulder apart.', 0, 'The root only breaks the rock into pieces (root wedging).'],
      ['Wind-blown sand wears a smooth, pitted surface on a desert rock.', 0, 'Grains knock bits off the rock without changing its minerals (abrasion).', 'abr'],
      ['Rocks tumbling in a river bang together and become rounded.', 0, 'Rubbing and banging break off pieces: abrasion.', 'abr'],
      ['A granite dome peels off in curved sheets as the rock above it wears away.', 0, 'The rock expands as weight is removed and cracks into sheets (unloading).'],
      ['Rainwater slowly dissolves limestone, carving out a cave.', 1, 'Dissolving changes calcite into substances carried off in water.'],
      ['Iron-rich rock slowly turns red-brown and crumbly.', 1, 'Iron combines with oxygen to form rust, a new substance (oxidation).'],
      ['Feldspar crystals in granite slowly turn into soft clay.', 1, 'Water reacts with feldspar to make a new mineral, clay.'],
      ['Lichens on a boulder give off acids that eat away its surface.', 1, 'Acids change the rock\'s minerals.'],
      ['A river carries sand downstream to the sea.', 2, 'Carrying sediment away is erosion; weathering is breaking rock down where it sits.'],
      ['Wind blows loose soil off a dry field.', 2, 'Moving material away is erosion.'],
      ['A glacier drags boulders down a valley.', 2, 'Moving rock to a new place is erosion.']
    ];
    function classify() {
      var K = R.pick(EVENTS.filter(function (e) { return ctx.level >= 2 ? !e[3] : e[1] < 2; }));
      var ch = ctx.level >= 2 ? KIND : KIND.slice(0, 2);
      return pr(K[0] + ' What is happening?', ctx.level >= 2 ? mc(KIND[K[1]], KIND.filter(function (k, i) { return i !== K[1]; })) : mc(KIND[K[1]], [KIND[1 - K[1]]]), [
        'Ask: did the rock just break into pieces, did it change into new substances, or was material carried away?',
        K[2]
      ], 'Smaller pieces of the same rock, or a new substance?', { vk: 'concept' });
    }
    function newSub() {
      return mcq(R, [
        ['Which kind of weathering makes new substances?', 'Chemical weathering', ['Mechanical weathering', 'Both make new substances', 'Neither'], 'Chemical weathering changes minerals into new ones, like clay and rust.'],
        ['Why does freezing water break rock?', 'Water expands by about 9% when it freezes, pushing the crack apart.', ['Ice is heavier than water.', 'Cold makes rock melt.', 'Ice dissolves the rock.'], 'Expanding ice wedges the crack wider each time it freezes.'],
        ['What makes rainwater able to dissolve limestone?', 'Rain picks up carbon dioxide and becomes a weak acid.', ['Rain is salty.', 'Rain is hot.', 'Lightning charges the water.'], 'Carbonic acid slowly reacts with calcite.'],
        ['What is the difference between weathering and erosion?', 'Weathering breaks rock down in place; erosion carries the pieces away.', ['They mean the same thing.', 'Erosion happens only in deserts.', 'Weathering moves rock; erosion breaks it.'], 'Breaking down versus moving away.']
      ], 'Weathering breaks; erosion moves.');
    }
    function tfOne() {
      return tfq(R, [
        ['Weathering and erosion are the same thing.', false, 'Weathering breaks rock down in place; erosion carries the pieces away.'],
        ['Plants can cause both mechanical and chemical weathering.', true, 'Roots pry rocks apart, and plants and lichens give off acids.'],
        ['Rust forming on iron-rich rock is chemical weathering.', true, 'Rust is a new substance.'],
        ['Mechanical weathering changes a rock\'s minerals into new minerals.', false, 'Mechanical weathering only makes smaller pieces of the same minerals.']
      ], 'Did it change into something new, or just break?');
    }
    return lv(R, ctx, [classify, classify, newSub], [classify, newSub, tfOne], [classify, tfOne, newSub]);
  });

  G('earthsci.weathering-rates', function (R, ctx) {
    function oneCube() {
      var s = R.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      return pr('What is the surface area of a cube of rock with edges ' + MQ(s, 'cm') + ' long?', exact(6 * s * s), [
        'A cube has 6 square faces.',
        'Each face: ' + M(s + ' \\times ' + s + ' = ' + s * s) + ' cm². All six: ' + M('6 \\times ' + s * s + ' = ' + 6 * s * s) + ' cm².'
      ], 'Six faces, each a square.', { vk: 'wr-sa', unit: 'cm²', s: s });
    }
    function cut() {
      var k = R.pick([2, 3, 4, 5]), e = R.pick([1, 2, 3]), s = k * e, n = k * k * k, sa = n * 6 * e * e;
      var ask = R.pick(['area', 'area', 'times', 'pieces']);
      var q = 'A cube of rock ' + MQ(s, 'cm') + ' on each edge is broken into cubes ' + MQ(e, 'cm') + ' on each edge. ' + (ask === 'area' ? 'What is the total surface area of all the small cubes?' : ask === 'pieces' ? 'How many small cubes are there?' : 'How many times as much surface area do the small cubes have in all, compared with the big cube?');
      var st = ['Each edge is cut into ' + M(s + ' \\div ' + e + ' = ' + k) + ' pieces, so there are ' + M(k + '^3 = ' + n) + ' small cubes.',
        'Each small cube has ' + M('6 \\times ' + e + '^2 = ' + 6 * e * e) + ' cm²; together ' + M(n + ' \\times ' + 6 * e * e + ' = ' + N(sa)) + ' cm².'];
      if (ask === 'times') st.push('The big cube had ' + M('6 \\times ' + s + '^2 = ' + 6 * s * s) + ' cm², so the area grew ' + M(N(sa) + ' \\div ' + 6 * s * s + ' = ' + k) + ' times.');
      if (ask === 'pieces') st = st.slice(0, 1);
      var x = { vk: { area: 'wr-cut', times: 'wr-times', pieces: 'wr-pieces' }[ask], s: s, e: e }; if (ask !== 'pieces') x.viz = { name: 'es-weathering', opts: { mode: 'cube', cuts: k - 1, size: s, quiet: true, lock: true } }; if (ask === 'area') x.unit = 'cm²';
      return pr(q, exact(ask === 'area' ? sa : ask === 'pieces' ? n : k), st, 'Count the small cubes, then add up all their faces.', x);
    }
    function climate() {
      return mcq(R, [
        ['Where does chemical weathering work fastest?', 'In a warm, wet climate', ['In a cold, dry climate', 'In a hot, dry desert', 'In a cold, icy climate'], 'Water and warmth speed up the chemical reactions that change minerals.'],
        ['Which rock weathers fastest in a rainy climate?', 'Limestone, because rainwater dissolves calcite', ['Granite, because it has big crystals', 'Quartzite, because it is very hard', 'They all weather at the same rate'], 'Calcite dissolves in weakly acidic rain; quartz barely changes.'],
        ['Where is frost wedging most active?', 'Where water freezes and thaws many times each year', ['Where it is always frozen', 'In hot deserts', 'Deep underground'], 'Each freeze widens cracks; each thaw lets more water in.'],
        ['Why do old gravestones of marble get hard to read sooner than granite ones?', 'Marble is calcite, which slowly dissolves in rain; granite\'s minerals resist.', ['Marble is softer to carve, so the letters were shallower.', 'Granite is always newer.', 'Marble is magnetic.'], 'Rock type matters: calcite weathers far faster than quartz and feldspar.']
      ], 'Water, warmth and the rock\'s minerals all matter.');
    }
    function tfOne() {
      return tfq(R, [
        ['Breaking a rock into smaller pieces increases its total surface area.', true, 'Every break makes new faces.'],
        ['Breaking a rock into smaller pieces changes the total volume of rock.', false, 'The amount of rock stays the same; only the surface area grows.'],
        ['Rocks in a hot, dry desert weather chemically faster than rocks in a rain forest.', false, 'Chemical weathering needs water; warm and wet is fastest.'],
        ['Smaller pieces of rock weather faster than one big piece of the same rock.', true, 'More surface is exposed to water and air.']
      ], 'Surface area, climate and rock type.');
    }
    return lv(R, ctx, [oneCube, climate, tfOne], [cut, oneCube, climate], [cut, cut, climate, tfOne]);
  });

  G('earthsci.soil', function (R, ctx) {
    var HOR = [['O', 'leaves and other organic matter on top'], ['A', 'dark topsoil rich in humus and roots'], ['B', 'subsoil with clay and minerals washed down from above'], ['C', 'broken pieces of weathered rock'], ['R', 'solid bedrock']];
    function which() {
      var i = R.int(0, 4);
      return pr('Which soil horizon is made of ' + HOR[i][1] + '?', mc(HOR[i][0] + ' horizon', R.sample(HOR.filter(function (h, j) { return j !== i; }).map(function (h) { return h[0] + ' horizon'; }), 3)), [
        'From the top down: O (organic litter), A (topsoil), B (subsoil), C (weathered rock), R (bedrock).',
        'This is the ' + HOR[i][0] + ' horizon.'
      ], 'Think top to bottom: leaves, topsoil, subsoil, broken rock, bedrock.', { vk: 'concept' });
    }
    function part() {
      var K = R.pick([['air', 25], ['water', 25], ['mineral grains', 45], ['organic matter (humus)', 5]]), v = R.pick([400, 800, 1000, 1200, 2000, 4000]);
      var x = v * K[1] / 100;
      return pr('A garden soil sample is about 45% mineral grains, 5% organic matter, 25% water and 25% air, by volume. How many cubic centimeters of ' + K[0] + ' are in ' + MQ(v, 'cm³') + ' of this soil?', exact(x), [
        K[1] + '% means ' + K[1] + ' out of every 100.',
        M(N(v) + ' \\times ' + N(K[1] / 100) + ' = ' + N(x)) + ' cm³.'
      ], 'Find ' + K[1] + '% of the volume.', { vk: 'so-pct', unit: 'cm³', v: v, p: K[1] });
    }
    function order() {
      var pick = R.sample([0, 1, 2, 3, 4], 4).sort(), shown = R.shuffle(pick.slice()), letters = {};
      shown.forEach(function (h, k) { letters[h] = LET[k]; });
      var desc = shown.map(function (h, k) { return LET[k] + ': ' + HOR[h][1]; }).join('; ');
      var ans = pick.map(function (h) { return letters[h]; });
      return pr('Put these soil layers in order from the top of a soil pit to the bottom. ' + desc + '. Write the letters in order, like ' + LET.slice(0, 4).split('').join('') + '.', orderSpec(ans), [
        'Top to bottom: organic litter, topsoil, subsoil, weathered rock, bedrock.',
        'So the order is ' + ans.join(', ') + '.'
      ], 'Organic matter on top, solid rock at the bottom.', { vk: 'so-order' });
    }
    function forms() {
      return mcq(R, [
        ['Why is topsoil (the A horizon) dark?', 'It is rich in humus from decayed plants and animals.', ['It is full of iron.', 'It is wet all the time.', 'It is made of volcanic ash.'], 'Humus is dark organic matter.'],
        ['Which is NOT one of the main things that affect how soil forms?', 'The phase of the Moon', ['The rock it forms from', 'The climate', 'Living things'], 'Soil depends on the parent rock, climate, living things, the slope of the land and time.'],
        ['Where does the clay in the B horizon mostly come from?', 'It is washed down from the layer above by soaking rainwater.', ['It falls as dust from space.', 'It is pushed up from the core.', 'Earthworms make it from nothing.'], 'Water moving down carries fine clay into the subsoil.'],
        ['Why does soil grow deeper over time?', 'Weathering keeps breaking down the rock below, from the top down.', ['Rain adds new soil from the sky.', 'Bedrock melts into soil.', 'It doesn\'t; soil depth never changes.'], 'The weathering front moves slowly downward into the rock.']
      ], 'Soil = weathered rock + water + air + humus.');
    }
    function tfOne() {
      return tfq(R, [
        ['Soil has always been there; it does not form or change.', false, 'Soil forms slowly from weathered rock and decayed living things.'],
        ['Healthy soil is about half pore space filled with water and air.', true, 'Roots and soil animals need that water and air.'],
        ['The C horizon is made of broken, weathered pieces of the rock below.', true, 'It is the soil\'s parent material.'],
        ['Topsoil lost to erosion grows back in a year or two.', false, 'Topsoil takes centuries or longer to build.']
      ], 'Soil forms slowly from rock.');
    }
    return lv(R, ctx, [which, part, tfOne], [part, order, which, forms], [order, part, forms, tfOne]);
  });

  G('earthsci.erosion-deposition', function (R, ctx) {
    function where() {
      return mcq(R, [
        ['A fast river flows into a calm lake. Where does it drop most of its sediment?', 'Where it enters the lake and slows down', ['In the middle of its fastest stretch', 'At its source in the mountains', 'Nowhere: rivers never drop sediment'], 'Slower water can carry less, so it drops sediment where it slows.'],
        ['A steep mountain stream flows out onto a flat valley floor. What forms there?', 'A fan-shaped pile of sediment (an alluvial fan)', ['A deep canyon', 'A U-shaped valley', 'A sea arch'], 'The stream slows suddenly on the flat ground and drops its load.'],
        ['On a winding river, where does sand pile up?', 'On the inside of the bends, where the water is slowest', ['On the outside of the bends, where the water is fastest', 'Only at the river\'s source', 'In the fastest current'], 'The outside of a bend is eroded; the inside, where water slows, gets sandbars.'],
        ['Why do sand dunes form downwind of beaches and deserts?', 'The wind slows behind small obstacles and drops the sand it carried.', ['Sand grows on its own.', 'Rivers carry sand uphill.', 'Earthquakes push sand into piles.'], 'Wind deposits sand where it slows down.']
      ], 'Sediment drops where the water, wind or ice slows down.');
    }
    function first() {
      var set = R.sample([['boulders', 4], ['gravel', 3], ['sand', 2], ['silt', 1], ['clay', 0]], 3);
      var big = set.slice().sort(function (a, b) { return b[1] - a[1]; }), askFirst = R.coin(), right = askFirst ? big[0] : big[2];
      return pr('A flood carrying ' + set.map(function (x) { return x[0]; }).join(', ') + ' slows down as it spreads over a flat plain. Which settles out ' + (askFirst ? 'first' : 'last') + '?', mc(cap(right[0]), set.filter(function (x) { return x !== right; }).map(function (x) { return cap(x[0]); }).concat(['They all settle at the same time'])), [
        'The bigger and heavier the grain, the faster the water must move to carry it.',
        'As the water slows, ' + big[0][0] + ' drops first and ' + big[2][0] + ' last.'
      ], 'Big grains need fast water.', { vk: 'ed-first', set: set.map(function (x) { return x[1]; }) });
    }
    function agent() {
      var K = R.pick([['a river delta', 'Water'], ['a sand dune', 'Wind'], ['a moraine (a ridge of unsorted rock)', 'Ice'], ['a landslide scar on a hillside', 'Gravity'], ['a beach', 'Water'], ['a field of scattered boulders far from their source rock', 'Ice'], ['a layer of fine windblown dust', 'Wind'], ['a pile of broken rock at the foot of a cliff', 'Gravity']]);
      return pr('Which agent of erosion and deposition most likely made ' + K[0] + '?', mc(K[1], ['Water', 'Wind', 'Ice', 'Gravity'].filter(function (x) { return x !== K[1]; })), [
        'Water builds deltas and beaches; wind builds dunes and dust layers; ice leaves unsorted moraines and boulders; gravity drops rock downslope.',
        'So: ' + K[1].toLowerCase() + '.'
      ], 'Which agent leaves this kind of mark?', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['Erosion only destroys land; it never builds anything.', false, 'Every grain eroded is deposited somewhere, building deltas, beaches and dunes.'],
        ['Faster water can carry larger grains.', true, 'More speed means more push on each grain.'],
        ['Glaciers sort the sediment they carry by size.', false, 'Ice drops all sizes together in unsorted piles.'],
        ['Gravity alone can move rock and soil downhill.', true, 'Landslides, rockfalls and slow soil creep are erosion by gravity.']
      ], 'What is eroded in one place is deposited in another.');
    }
    return lv(R, ctx, [agent, first, tfOne], [where, first, agent], [where, first, tfOne]);
  });

  G('earthsci.landforms', function (R, ctx) {
    var LF = [['a V-shaped valley', 'A river'], ['a U-shaped valley', 'A glacier'], ['a sand dune', 'Wind'], ['a delta', 'A river'], ['an oxbow lake', 'A river'], ['a moraine', 'A glacier'], ['a cirque (a bowl-shaped hollow high on a mountain)', 'A glacier'],
      ['a glacial erratic (a lone boulder far from its source rock)', 'A glacier'], ['a meander (a wide river bend)', 'A river'], ['a sea arch', 'Waves'], ['a floodplain', 'A river'], ['a horn (a sharp, pointed peak)', 'A glacier'], ['a beach', 'Waves'], ['a desert rock polished and pitted by flying sand', 'Wind']];
    function agent() {
      var K = R.pick(LF);
      return pr('What most likely formed ' + K[0] + '?', mc(K[1], ['A river', 'A glacier', 'Wind', 'Waves'].filter(function (x) { return x !== K[1]; })), [
        'Rivers: V-shaped valleys, meanders, oxbow lakes, floodplains, deltas. Glaciers: U-shaped valleys, cirques, horns, moraines, erratics. Wind: dunes, sand-blasted rock. Waves: beaches, sea arches.',
        cap(K[0]) + ': ' + K[1].toLowerCase() + '.'
      ], 'Match the landform to its maker.', { vk: 'concept' });
    }
    function valley() {
      return mcq(R, [
        ['A valley has a narrow bottom and steep, straight sides that meet at the stream. What carved it?', 'A river', ['A glacier', 'Wind', 'Waves'], 'Rivers cut down along a narrow bed, leaving a V.'],
        ['A valley has a wide, rounded floor and steep sides. What carved it?', 'A glacier', ['A river', 'Wind', 'Waves'], 'Ice filling the whole valley grinds it into a U.'],
        ['On a topographic map, contour lines crossing a stream bend into V\'s. Which way do the V\'s point?', 'Upstream, toward higher ground', ['Downstream, toward lower ground', 'Toward the north', 'Away from the stream'], 'The valley cuts back into higher ground.'],
        ['How does an oxbow lake form?', 'A river cuts across the neck of a big meander and leaves the old bend behind.', ['A glacier melts in a hollow.', 'Wind piles sand around a pond.', 'An earthquake opens a crack.'], 'Rivers erode the outside of bends until two bends meet.']
      ], 'Rivers make V\'s; glaciers make U\'s.');
    }
    function sorted() {
      var K = R.pick([['neat layers of sand, all about the same size', false], ['a jumble of clay, sand, pebbles and boulders mixed together', true], ['a layer of rounded pebbles on top of a layer of sand', false], ['huge boulders sitting in fine clay', true]]);
      return pr('A deposit is made of ' + K[0] + '. Was it more likely left by a melting glacier or by flowing water?', mc(K[1] ? 'A melting glacier' : 'Flowing water', [K[1] ? 'Flowing water' : 'A melting glacier', 'Wind', 'It is impossible to tell']), [
        'Water and wind sort grains by size; ice carries all sizes together and drops them unsorted.',
        K[1] ? 'Unsorted: glacial till.' : 'Sorted by size: flowing water.'
      ], 'Is it sorted by size?', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['Glacier deposits are sorted by size, like river deposits.', false, 'Ice drops boulders, sand and clay together in one jumble.'],
        ['A U-shaped valley was most likely carved by a glacier.', true, 'Ice filling a valley grinds it into a U.'],
        ['Sand dunes are built by wind.', true, 'Wind drops sand where it slows down.'],
        ['Deltas form where rivers speed up.', false, 'Deltas form where rivers slow down at a lake or the sea.']
      ], 'Each agent leaves its own landforms.');
    }
    return lv(R, ctx, [agent, valley, tfOne], [agent, sorted, valley], [sorted, agent, tfOne, valley]);
  });

  G('earthsci.slow-and-fast-changes', function (R, ctx) {
    function total() {
      var r = R.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 1, 2]), t = R.pick([1, 2, 3, 4, 5, 6, 8, 10]) * 1e6, mm = fix(r * t), m = mm / 1000;
      var what = R.pick(['A river cuts its canyon deeper by', 'A mountain range wears down by', 'A sea floor collects sediment at']);
      return pr(what + ' about ' + MQ(r, 'mm') + ' a year. How much is that in ' + N(t / 1e6) + ' million years, in meters?', num(m, 0.01), [
        'Total = rate × time: ' + M(N(r) + ' \\times ' + N(t) + ' = ' + N(mm)) + ' mm.',
        'Change to meters (1,000 mm = 1 m): ' + M(N(mm) + ' \\div 1{,}000 = ' + N(m)) + ' m.'
      ], 'Multiply, then change millimeters to meters.', { vk: 'sf-total', unit: 'm', r: r, t: t });
    }
    function time() {
      var r = R.pick([0.1, 0.2, 0.25, 0.4, 0.5, 1]), d = R.pick([100, 200, 300, 500, 600, 800, 1000, 1500]), yrs = d * 1000 / r;
      return pr('A river cuts down through rock at about ' + MQ(r, 'mm') + ' a year. About how many million years does it take to carve a canyon ' + MQ(d, 'm') + ' deep?', num(yrs / 1e6, 0.01), [
        'Change the depth to millimeters: ' + M(N(d) + ' \\times 1{,}000 = ' + N(d * 1000)) + ' mm.',
        'Time = depth ÷ rate: ' + M(N(d * 1000) + ' \\div ' + N(r) + ' = ' + N(yrs)) + ' years, or ' + N(yrs / 1e6) + ' million years.'
      ], 'Divide the depth by the rate, in the same units.', { vk: 'sf-time', unit: 'million years', r: r, d: d });
    }
    function rate() {
      var d = R.pick([600, 900, 1200, 1500, 1800]), t = R.pick([2, 3, 4, 5, 6]), r = d * 1000 / (t * 1e6);
      return pr('A canyon ' + MQ(d, 'm') + ' deep was carved in about ' + N(t) + ' million years. What was the average rate of downcutting, in millimeters per year?', num(r, 0.01), [
        'Depth in millimeters: ' + M(N(d) + ' \\times 1{,}000 = ' + N(d * 1000)) + ' mm.',
        'Rate = depth ÷ time: ' + M(N(d * 1000) + ' \\div ' + N(t * 1e6) + ' = ' + N(fix(r))) + ' mm per year.'
      ], 'Rate is total change divided by time.', { vk: 'sf-rate', unit: 'mm/yr', d: d, t: t });
    }
    function speed() {
      var K = R.pick([['A landslide sends a hillside into a valley.', 'Fast: minutes'], ['A volcano erupts and buries a forest in ash.', 'Fast: hours to days'], ['A flood cuts a new channel across a floodplain.', 'Fast: hours to days'], ['A river carves a canyon.', 'Slow: millions of years'], ['A mountain range is worn down by rain and frost.', 'Slow: millions of years'], ['Soil slowly creeps down a hillside, tilting fence posts.', 'Slow: years to centuries'], ['Sand dunes migrate across a desert.', 'Slow: years to centuries']]);
      var all = ['Fast: minutes', 'Fast: hours to days', 'Slow: years to centuries', 'Slow: millions of years'];
      return pr(K[0] + ' How long does a change like this usually take?', mc(K[1], all.filter(function (x) { return x !== K[1]; })), [
        'Some changes are sudden events; others are tiny yearly changes added up.',
        K[1] + '.'
      ], 'Is it a single event, or a little each year?', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['A canyon over a kilometer deep must have been carved by one giant flood.', false, 'Tiny yearly downcutting over millions of years adds up to over a kilometer.'],
        ['Changes too slow to notice in a lifetime can still build huge landforms.', true, 'Rate × time: small rates over millions of years give big totals.'],
        ['Some changes to the land, like landslides, happen in minutes.', true, 'Fast and slow changes both shape the surface.']
      ], 'Total change = rate × time.');
    }
    return lv(R, ctx, [total, speed, tfOne], [total, time, speed], [time, rate, total]);
  });

  // ---------- g07_history.js ----------
  // ===================== Unit 7: Earth's History =====================
  var ROCKS7 = ['sandstone', 'shale', 'limestone', 'siltstone', 'conglomerate'];
  function layers(R, n) { // n flat deposits of different rocks, oldest first
    var rk = R.sample(ROCKS7, n), fos = { shale: 'trilobite', limestone: 'brachiopod' };
    return rk.map(function (r) { var e = { t: 'deposit', rock: r, thick: R.pick([0.07, 0.08, 0.09]) }; if (fos[r] && R.chance(0.4)) e.fossil = fos[r]; return e; });
  }
  function strataViz(events, seed) { return { name: 'es-strata', opts: { mode: 'section', events: events, seed: seed, letters: true, quiet: true, lock: true } }; }
  function sortedLetters(lt) { return Object.keys(lt).map(function (k) { return lt[k]; }).sort(); }

  G('earthsci.fossils', function (R, ctx) {
    function kind() {
      var K = R.pick([
        ['A dinosaur footprint pressed into mudstone', 'A trace fossil'], ['A worm burrow preserved in sandstone', 'A trace fossil'],
        ['A hollow in rock shaped exactly like a seashell, with no shell inside', 'A mold'], ['A rock copy of a shell, made where minerals filled a shell-shaped hollow', 'A cast'],
        ['A log whose wood has been replaced by quartz, cell by cell', 'Petrified wood'], ['An insect trapped in hardened tree resin', 'Preserved in amber'],
        ['A fish skeleton in shale', 'A body fossil'], ['A woolly mammoth found in frozen ground', 'Preserved remains (frozen)']
      ]);
      var all = ['A trace fossil', 'A mold', 'A cast', 'Petrified wood', 'Preserved in amber', 'A body fossil', 'Preserved remains (frozen)'];
      return pr(K[0] + '. What kind of fossil is it?', mc(K[1], R.sample(all.filter(function (x) { return x !== K[1]; }), 3)), [
        'Body fossils are parts of the living thing; molds and casts are hollows and their fillings; trace fossils are signs the animal left; some remains are kept whole in amber or ice.',
        'This is ' + K[1].toLowerCase() + '.'
      ], 'Is it part of the creature, a copy of it, or a sign it left?', { vk: 'concept' });
    }
    function likely() {
      return mcq(R, [
        ['Which animal is most likely to become a fossil?', 'A clam buried quickly in mud on the sea floor', ['A jellyfish washed up on a beach', 'A worm on the forest floor', 'A bird that dies in a meadow'], 'Hard parts and quick burial in sediment protect remains from decay and scavengers.'],
        ['Why are shells, bones and teeth the most common fossils?', 'Hard parts last much longer than soft parts before they can be buried.', ['Soft-bodied animals never lived long ago.', 'Hard parts attract minerals from the air.', 'Only animals with shells lived in the sea.'], 'Soft tissue rots quickly; hard parts survive long enough to be buried.'],
        ['Which kind of rock holds most fossils?', 'Sedimentary rock', ['Igneous rock', 'Metamorphic rock', 'Magma'], 'Settling sediment can bury remains gently; heat and melting destroy them.']
      ], 'Hard parts plus quick burial.');
    }
    function index() {
      return mcq(R, [
        ['Which makes the best index fossil for dating rock layers?', 'A species that was common, lived all over the world, and existed for only a short time', ['A species that lived for hundreds of millions of years', 'A rare species found in one valley', 'Any large animal'], 'Widespread and common makes it easy to find; a short time span pins down the age.'],
        ['The same index fossil is found in layers in two different countries. What does that suggest?', 'The two layers formed at about the same time.', ['The layers are the same thickness.', 'The countries were once one country.', 'The fossil was carried there by people.'], 'An index fossil lived for only a short time, so rocks holding it are about the same age.'],
        ['Fossils of tropical ferns are found in rock in Antarctica. What does this suggest?', 'Antarctica once had a much warmer climate, or was in a warmer place.', ['Ferns can grow on ice.', 'The fossils are fake.', 'Antarctica has always been warm.'], 'Fossils record past environments; continents also move over time.'],
        ['Fossil sea shells are found high in a mountain range. What does this tell us?', 'The rock formed under the sea and was later pushed up.', ['Sea animals once climbed mountains.', 'The sea was once miles deep everywhere.', 'Birds carried the shells there.'], 'Marine fossils show the rock formed on a sea floor.']
      ], 'Fossils record when and where.');
    }
    function tfOne() {
      return tfq(R, [
        ['Most plants and animals that ever lived became fossils.', false, 'Only a tiny share did, mostly ones with hard parts that were buried quickly.'],
        ['A footprint can be a fossil.', true, 'Footprints, burrows and other signs of life are trace fossils.'],
        ['Fossils are most often found in igneous rock.', false, 'Heat and melting destroy remains; most fossils are in sedimentary rock.'],
        ['Fossils can show that an area was once covered by the sea.', true, 'Sea creatures\' fossils mark old sea floors.']
      ], 'Quick burial in sediment.');
    }
    return lv(R, ctx, [kind, likely, tfOne], [kind, index, likely], [index, tfOne, kind]);
  });

  G('earthsci.superposition', function (R, ctx) {
    function oldYoung() {
      var n = R.int(3, ctx.level >= 2 ? 5 : 4), ev = layers(R, n), seed = R.int(1, 9999), lt = strataLetters(ev, seed), old = R.coin();
      var tilt = ctx.level >= 3 && R.coin();
      if (tilt) ev.push({ t: 'tilt', deg: R.pick([-25, -18, 18, 25]) });
      var target = old ? 0 : n - 1, choices = sortedLetters(lt);
      return pr((tilt ? 'These layers were tilted after they formed. ' : 'These rock layers are flat and have not been overturned. ') + 'Which lettered layer is the ' + (old ? 'oldest' : 'youngest') + '?', mcK(choices, choices.indexOf(lt[target])), [
        'By superposition, each layer settled on top of the ones already there' + (tilt ? ', before the whole stack was tilted' : '') + '.',
        (old ? 'The oldest is the bottom layer: ' : 'The youngest is the top layer: ') + lt[target] + '.'
      ], old ? 'Look at the bottom of the stack.' : 'Look at the top of the stack.', { vk: 'sp-one', viz: strataViz(ev, seed), events: ev, seed: seed, target: target });
    }
    function order() {
      var n = R.int(3, ctx.level >= 3 ? 5 : 4), ev = layers(R, n), seed = R.int(1, 9999), lt = strataLetters(ev, seed);
      var ans = ev.map(function (e, i) { return lt[i]; });
      return pr('These rock layers are flat and have not been overturned. List the layers from oldest to youngest. Write the letters in order, like ' + sortedLetters(lt).join('') + '.', orderSpec(ans), [
        'Oldest at the bottom, youngest at the top.',
        'Read upward: ' + ans.join(', ') + '.'
      ], 'Start at the bottom and read up.', { vk: 'sp-order', viz: strataViz(ev, seed), events: ev, seed: seed });
    }
    function words() {
      var rk = R.sample(['sandstone', 'shale', 'limestone', 'siltstone', 'conglomerate', 'coal'], 4), old = R.coin();
      return pr('A canyon wall shows four flat layers. From the top down they are ' + U.list(rk) + '. Which layer formed ' + (old ? 'first' : 'last') + '?', mc(cap(old ? rk[3] : rk[0]), rk.filter(function (r, i) { return i !== (old ? 3 : 0); }).map(cap)), [
        'The list goes from the top down, so the last one named is at the bottom.',
        (old ? 'The bottom layer formed first: ' + rk[3] : 'The top layer formed last: ' + rk[0]) + '.'
      ], 'Which one is at the bottom?', { vk: 'sp-words', rk: rk, old: old });
    }
    function tfOne() {
      return tfq(R, [
        ['In undisturbed rock layers, the youngest layer is at the bottom.', false, 'Each layer settles on top of older ones, so the youngest is at the top.'],
        ['Sediment is usually laid down in flat layers.', true, 'So steeply tilted layers were tilted after they formed.'],
        ['Superposition tells you the exact age of a layer in years.', false, 'It gives only relative age: older or younger.'],
        ['If layers are folded upside down, the oldest layer can end up on top.', true, 'Geologists look for clues like mud cracks to find which way was up.']
      ], 'Bottom = oldest, unless overturned.');
    }
    return lv(R, ctx, [oldYoung, words, oldYoung], [order, oldYoung, words], [order, oldYoung, tfOne]);
  });

  G('earthsci.cross-cutting', function (R, ctx) {
    function history() { // deposits, a dike, maybe more deposits on top, maybe a fault last
      var n1 = 3, n2 = ctx.level >= 2 ? R.int(0, 2) : R.int(0, 1), rk = R.sample(ROCKS7, n1 + n2);
      var ev = rk.slice(0, n1).map(function (r) { return { t: 'deposit', rock: r, thick: 0.08 }; });
      var dx = R.pick([0.55, 0.7, 1.3, 1.45]); ev.push({ t: 'intrude', kind: 'dike', x: dx, w: 0.1 });
      rk.slice(n1).forEach(function (r) { ev.push({ t: 'deposit', rock: r, thick: 0.07 }); });
      var fault = ctx.level >= 2 && R.coin();
      if (fault) ev.push({ t: 'fault', x: dx < 1 ? R.pick([1.1, 1.25]) : R.pick([0.55, 0.7]), dip: 60, dipDir: R.pick(['left', 'right']), kind: R.pick(['normal', 'reverse']), slip: R.pick([0.06, 0.08]) });
      var seed = R.int(1, 9999);
      return { ev: ev, seed: seed, lt: strataLetters(ev, seed), n1: n1, n2: n2, fault: fault, dike: n1 };
    }
    function desc(h) { return 'The picture shows rock layers, a dike (the dark band of igneous rock, letter ' + h.lt[h.dike] + ')' + (h.fault ? ' and a fault (letter ' + h.lt[h.ev.length - 1] + ')' : '') + '.'; }
    function youngest() {
      var h = history(), yi = h.fault ? h.ev.length - 1 : h.n2 ? h.ev.length - 1 : h.dike, ch = sortedLetters(h.lt);
      var why = h.fault ? 'The fault breaks every layer and the dike, so it came last.' : h.n2 ? 'The top layer lies unbroken across the dike, so it formed after the dike.' : 'The dike cuts across every layer, so it is younger than all of them.';
      return pr(desc(h) + ' Which lettered feature is the youngest?', mcK(ch, ch.indexOf(h.lt[yi])), [
        'Whatever cuts across rock is younger than the rock it cuts; layers lying unbroken on top are younger still.',
        why + ' Youngest: ' + h.lt[yi] + '.'
      ], 'Find the thing that cuts everything, or lies on top of everything.', { vk: 'cc-young', viz: strataViz(h.ev, h.seed), events: h.ev, seed: h.seed, target: yi });
    }
    function relDike() {
      var h = history(); if (!h.n2 && R.coin()) h = history();
      var deps = h.ev.map(function (e, i) { return i; }).filter(function (i) { return h.ev[i].t === 'deposit'; }), li = R.pick(deps), older = li < h.dike;
      return pr(desc(h) + ' Is the dike (' + h.lt[h.dike] + ') older or younger than layer ' + h.lt[li] + '?', mcK(['The dike is older', 'The dike is younger', 'They are the same age'], older ? 1 : 0), [
        older ? 'The dike cuts through layer ' + h.lt[li] + ', so the layer was there first.' : 'Layer ' + h.lt[li] + ' lies unbroken across the top of the dike, so it settled after the dike formed.',
        older ? 'The dike is younger.' : 'The dike is older.'
      ], 'Does the dike cut through that layer, or stop beneath it?', { vk: 'cc-rel', viz: strataViz(h.ev, h.seed), events: h.ev, seed: h.seed, li: li });
    }
    function order() {
      var h = history(), ans = h.ev.map(function (e, i) { return h.lt[i]; });
      return pr(desc(h) + ' List all the lettered features from oldest to youngest. Write the letters in order, like ' + sortedLetters(h.lt).join('') + '.', orderSpec(ans), [
        'First the layers the dike cuts, from the bottom up.',
        'Then the dike' + (h.n2 ? ', then the layers lying on top of it' : '') + (h.fault ? ', and last the fault, which breaks everything' : '') + '.',
        'Order: ' + ans.join(', ') + '.'
      ], 'Layers bottom-up, then whatever cuts them.', { vk: 'cc-order', viz: strataViz(h.ev, h.seed), events: h.ev, seed: h.seed });
    }
    function words() {
      return mcq(R, [
        ['A dike cuts through layers 1, 2 and 3 and stops at the bottom of layer 4. Which is true?', 'The dike is younger than layers 1 to 3 and older than layer 4.', ['The dike is the same age as layer 4.', 'The dike is older than all four layers.', 'The dike is younger than all four layers.'], 'It cuts 1 to 3, so it came after them; layer 4 covers it, so layer 4 came after the dike.'],
        ['A fault breaks layers A, B and C, and a dike D, but not layer E on top. Which is youngest?', 'Layer E', ['The fault', 'The dike D', 'Layer A'], 'E lies unbroken across the fault, so it came after the fault.'],
        ['Pieces of a sandstone layer are found inside a body of granite just below it. Which is older?', 'The sandstone: pieces must exist before they can be caught in the granite.', ['The granite', 'They are the same age', 'There is no way to tell'], 'Inclusions are older than the rock that holds them.'],
        ['A dike cuts across a fault but is not broken by it. Which came first?', 'The fault', ['The dike', 'They formed together', 'There is no way to tell'], 'The unbroken dike cuts the fault, so the dike is younger.']
      ], 'Whatever cuts is younger than what it cuts.');
    }
    return lv(R, ctx, [youngest, relDike, words], [relDike, order, youngest, words], [order, relDike, words]);
  });

  G('earthsci.half-life', function (R, ctx) {
    var ISO = [['carbon-14', 5730, 'years'], ['potassium-40', 1.25, 'billion years'], ['uranium-238', 4.47, 'billion years'], ['uranium-235', 704, 'million years']];
    function frac2(n) { return '1/' + MA.pow(2, n); }
    function left() {
      var n = R.int(1, ctx.level >= 3 ? 5 : 4);
      var dec = ctx.level >= 2 && R.coin(), d2 = MA.pow(2, n);
      var p = dec ? pr('A sample starts with a radioactive isotope. What fraction of the original parent atoms has decayed after ' + n + ' half-li' + (n > 1 ? 'ves' : 'fe') + '?', exact((d2 - 1) + '/' + d2), [
        'Fraction left: ' + M('\\left(\\tfrac{1}{2}\\right)^{' + n + '} = \\tfrac{1}{' + d2 + '}') + '.',
        'Fraction decayed: ' + M('1 - \\tfrac{1}{' + d2 + '} = \\tfrac{' + (d2 - 1) + '}{' + d2 + '}') + '.'
      ], 'First find what is left, then subtract from 1.', { vk: 'hl-dec', n: n }) : pr('A sample starts with a radioactive isotope. What fraction of the original parent atoms is left after ' + n + ' half-li' + (n > 1 ? 'ves' : 'fe') + '?', exact(frac2(n)), [
        'Each half-life halves what is left.',
        M('\\left(\\tfrac{1}{2}\\right)^{' + n + '} = \\tfrac{1}{' + d2 + '}') + '.'
      ], 'Multiply by one half once for each half-life.', { vk: 'hl-frac', n: n });
      if (ctx.level === 1) p.viz = { name: 'es-halflife', opts: { isotope: 'C-14', n: 100, time: n, graph: false, quiet: true, lock: true } };
      return p;
    }
    function atoms() {
      var n = R.int(1, 4), n0 = MA.pow(2, n) * R.pick([25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 500]), k = n0 / MA.pow(2, n);
      var chain = [n0]; for (var i = 0; i < n; i++) chain.push(chain[i] / 2);
      return pr('A rock crystal starts with ' + N(n0) + ' atoms of a radioactive parent. How many parent atoms are left after ' + n + ' half-li' + (n > 1 ? 'ves' : 'fe') + '?', exact(k), [
        'Halve once for each half-life: ' + M(chain.map(N).join(' \\to ')) + '.'
      ], 'Halve it, then halve what is left.', { vk: 'hl-atoms', n0: n0, n: n });
    }
    function age() {
      var I = R.pick(ISO), n = R.int(1, ctx.level >= 3 ? 4 : 3), a = fix(n * I[1]);
      return pr('A sample has ' + M('\\tfrac{1}{' + MA.pow(2, n) + '}') + ' of its original ' + I[0] + ' left. The half-life of ' + I[0] + ' is ' + N(I[1]) + ' ' + I[2] + '. How old is the sample?', num(a, 0.005), [
        M('\\tfrac{1}{' + MA.pow(2, n) + '} = \\left(\\tfrac{1}{2}\\right)^{' + n + '}') + ', so ' + n + ' half-li' + (n > 1 ? 'ves have' : 'fe has') + ' passed.',
        'Age: ' + M(n + ' \\times ' + N(I[1]) + ' = ' + N(a)) + ' ' + I[2] + '.'
      ], 'How many times was it halved?', { vk: 'hl-age', unit: I[2], n: n, h: I[1] });
    }
    function ratio() {
      var I = R.pick(ISO.slice(1)), n = R.int(1, 3), dp = MA.pow(2, n) - 1, a = fix(n * I[1]);
      return pr('In a volcanic crystal there are ' + dp + ' daughter atoms for every parent atom of ' + I[0] + ' (half-life ' + N(I[1]) + ' ' + I[2] + '). Assuming there were no daughter atoms at the start, how old is the crystal?', num(a, 0.005), [
        'Parent left as a fraction of the start: ' + M('\\tfrac{1}{1 + ' + dp + '} = \\tfrac{1}{' + (dp + 1) + '}') + '.',
        M('\\tfrac{1}{' + (dp + 1) + '} = \\left(\\tfrac{1}{2}\\right)^{' + n + '}') + ': ' + n + ' half-li' + (n > 1 ? 'ves' : 'fe') + '.',
        'Age: ' + M(n + ' \\times ' + N(I[1]) + ' = ' + N(a)) + ' ' + I[2] + '.'
      ], 'Every daughter atom was once a parent atom.', { vk: 'hl-ratio', unit: I[2], dp: dp, h: I[1] });
    }
    function mass() {
      var n = R.int(1, 4), t = fix(n * 5730), m0 = MA.pow(2, n) * R.pick([1, 2, 3, 5, 6, 10]), m = m0 / MA.pow(2, n);
      return pr('A sample holds ' + MQ(m0, 'μg') + ' of carbon-14 (half-life 5,730 years). How much carbon-14 is left after ' + N(t) + ' years?', exact(m), [
        'Number of half-lives: ' + M(N(t) + ' \\div 5{,}730 = ' + n) + '.',
        'Fraction left: ' + M('\\left(\\tfrac{1}{2}\\right)^{' + n + '} = \\tfrac{1}{' + MA.pow(2, n) + '}') + '; ' + M(N(m0) + ' \\times \\tfrac{1}{' + MA.pow(2, n) + '} = ' + N(m)) + ' μg.'
      ], 'First find how many half-lives fit into the time.', { vk: 'hl-mass', unit: 'μg', m0: m0, t: t });
    }
    function tfOne() {
      return tfq(R, [
        ['After two half-lives, all of the radioactive atoms are gone.', false, 'After two half-lives one quarter is left: half of a half.'],
        ['After three half-lives, one eighth of the parent atoms remain.', true, M('\\left(\\tfrac{1}{2}\\right)^3 = \\tfrac{1}{8}') + '.'],
        ['Heating a rock speeds up radioactive decay.', false, 'Decay rates don\'t change with heat, pressure or chemistry; that is why they make good clocks.'],
        ['Carbon-14 is used to date dinosaur bones that are 70 million years old.', false, 'After that many half-lives no measurable carbon-14 is left; carbon-14 works up to about 50,000 years.']
      ], 'Each half-life halves what is left.');
    }
    return lv(R, ctx, [left, atoms, left], [age, atoms, ratio, left], [ratio, mass, age, tfOne]);
  });

  G('earthsci.geologic-time-scale', function (R, ctx) {
    var BOUNDS = 'Use these ages: the Paleozoic era began about 539 million years ago, the Mesozoic about 252 million, and the Cenozoic about 66 million; before 539 million years is the Precambrian.';
    function era() {
      var K = R.pick([[R.pick([600, 900, 1500, 2500, 3500]), 'Precambrian'], [R.pick([300, 400, 450, 500]), 'Paleozoic era'], [R.pick([100, 150, 200, 230]), 'Mesozoic era'], [R.pick([2, 10, 30, 50]), 'Cenozoic era']]);
      var all = ['Precambrian', 'Paleozoic era', 'Mesozoic era', 'Cenozoic era'];
      return pr('A rock layer formed about ' + N(K[0]) + ' million years ago. When did it form? ' + BOUNDS, mc(K[1], all.filter(function (x) { return x !== K[1]; })), [
        'Find which span contains ' + N(K[0]) + ' million years ago.',
        'It falls in the ' + K[1] + '.'
      ], 'Compare the age with each boundary.', { vk: 'gt-era', ma: K[0], era: K[1] });
    }
    function first() {
      var EV = [['the first single-celled life', 3800], ['the first animals with shells', 530], ['the first land plants', 470], ['the first dinosaurs', 230], ['the first flowering plants', 130], ['the extinction of the dinosaurs other than birds', 66], ['the first humans of our species', 0.3]];
      var pick = R.sample(EV, 3), early = R.coin(), right = pick.slice().sort(function (a, b) { return early ? b[1] - a[1] : a[1] - b[1]; })[0];
      return pr('Which of these happened ' + (early ? 'first' : 'most recently') + '?', mc(cap(right[0]), pick.filter(function (x) { return x !== right; }).map(function (x) { return cap(x[0]); })), [
        'Approximate times: ' + pick.map(function (x) { return x[0] + ', about ' + (x[1] >= 1 ? N(x[1]) + ' million' : '300,000') + ' years ago'; }).join('; ') + '.',
        (early ? 'The oldest is ' : 'The most recent is ') + right[0] + '.'
      ], 'Life started simple; dinosaurs are Mesozoic; humans are very recent.', { vk: 'concept' });
    }
    function length() {
      var K = R.pick([['the Mesozoic era', 252, 66], ['the Paleozoic era', 539, 252], ['the Cenozoic era (up to today)', 66, 0]]);
      return pr('How many million years long is ' + K[0] + '? ' + BOUNDS, exact(K[1] - K[2]), [
        'It runs from ' + K[1] + ' to ' + K[2] + ' million years ago.',
        M(K[1] + ' - ' + K[2] + ' = ' + (K[1] - K[2])) + ' million years.'
      ], 'Subtract the end from the start.', { vk: 'gt-len', unit: 'million years', from: K[1], to: K[2] });
    }
    function calendar() {
      var K = R.pick([['the dinosaurs (other than birds) died out', 66], ['the Mesozoic era began', 252], ['the Paleozoic era began', 539], ['the first dinosaurs appeared', 230], ['the first flowering plants appeared', 130], ['the first land plants appeared', 470]]);
      var d = K[1] * 365 / 4600;
      return pr('Squeeze Earth\'s 4.6-billion-year (4,600-million-year) history into one 365-day year. About how many days before the end of the year ' + K[0] + ', ' + K[1] + ' million years ago?', num(d, 0.03), [
        'Fraction of Earth\'s history since then: ' + M(N(K[1]) + ' \\div 4{,}600') + '.',
        'Days: ' + M(N(K[1]) + ' \\div 4{,}600 \\times 365 \\approx ' + N(rnd(d, 1))) + ' days.'
      ], 'Find what fraction of 4,600 million years it is, then take that fraction of 365 days.', { vk: 'gt-cal', unit: 'days', ma: K[1] });
    }
    function tfOne() {
      return tfq(R, [
        ['People lived at the same time as the dinosaurs.', false, 'The last dinosaurs other than birds died about 66 million years ago; our species appeared about 300,000 years ago.'],
        ['The Precambrian makes up most of Earth\'s history.', true, 'It lasted from about 4,540 to 539 million years ago, about 88% of all of Earth\'s time.'],
        ['Many boundaries between eras are marked by mass extinctions.', true, 'The Paleozoic and Mesozoic eras both ended with huge extinctions.'],
        ['Dinosaurs lived during the Cenozoic era.', false, 'Dinosaurs (other than birds) lived in the Mesozoic era.']
      ], 'Dinosaurs: Mesozoic. Humans: the very end of the Cenozoic.');
    }
    return lv(R, ctx, [era, first, tfOne], [era, length, first, calendar], [calendar, era, tfOne]);
  });

  // ---------- g08_plates.js ----------
  // ===================== Unit 8: Plate Tectonics =====================
  G('earthsci.continental-drift', function (R, ctx) {
    function evidence() {
      return mcq(R, [
        ['Fossils of Mesosaurus, a small reptile that lived in fresh water, are found only in South America and southern Africa. What does this suggest?', 'The two continents were once joined.', ['Mesosaurus swam across the Atlantic Ocean.', 'The fossils were carried by rivers between the continents.', 'Mesosaurus lived in both places at different times by chance.'], 'A small freshwater reptile could not cross a salty ocean; the land must have been connected.'],
        ['Scratches left by ice sheets about 300 million years ago are found in India and central Africa, near the equator today. What does this suggest?', 'Those lands were once near the South Pole, joined together.', ['The equator used to be colder than the poles.', 'Glaciers can form in rain forests.', 'The scratches were made by rivers.'], 'Ice sheets form near the poles; the continents have moved since.'],
        ['Which is NOT evidence that the continents were once joined?', 'Earth\'s oceans are salty.', ['Coastlines that fit together like puzzle pieces', 'Matching mountain belts on both sides of the Atlantic', 'The same fossil plants on several southern continents'], 'Salty oceans say nothing about where continents were.'],
        ['What was the biggest weakness of Wegener\'s idea of continental drift?', 'He could not explain what force moved the continents.', ['He had no fossil evidence.', 'The coastlines did not fit at all.', 'He thought Earth was flat.'], 'The mechanism came later, from seafloor spreading and plate tectonics.'],
        ['Why do the edges of the continental shelves fit together even better than the coastlines?', 'The shelves are the true edges of the continents; coastlines change as sea level rises and falls.', ['The shelves are made of ice.', 'The coastlines were carved by people.', 'The shelves moved but the coasts didn\'t.'], 'Sea level changes move the shoreline; the continent\'s real edge is the shelf.']
      ], 'Put the continents back together and see what lines up.');
    }
    function fossil() {
      var K = R.pick([['Glossopteris, a seed fern', 'South America, Africa, India, Antarctica and Australia'], ['Mesosaurus, a freshwater reptile', 'South America and southern Africa'], ['Lystrosaurus, a land reptile', 'Africa, India and Antarctica'], ['Cynognathus, a land reptile', 'South America and Africa']]);
      return pr('Fossils of ' + K[0] + ', are found in ' + K[1] + '. Which explanation best fits all the evidence?', mc('These lands were joined in one supercontinent, Pangaea, when it lived.', ['It crossed the oceans by swimming or floating.', 'It evolved separately on each continent.', 'The oceans were dry land then everywhere.']), [
        'A land plant or a land or freshwater animal could not cross a wide ocean.',
        'The same species on several continents means those continents were connected.'
      ], 'Could this living thing cross an ocean?', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['The continents move by plowing through the ocean floor.', false, 'Whole plates move, ocean floor and continents together.'],
        ['About 250 million years ago most land was joined in a supercontinent called Pangaea.', true, 'Pangaea began breaking apart roughly 200 million years ago.'],
        ['Matching rock layers and mountain belts on both sides of the Atlantic support continental drift.', true, 'They line up when the continents are fitted back together.'],
        ['Wegener explained exactly what force moves the continents.', false, 'He could not; that is why many scientists doubted him until the 1960s.']
      ], 'Whole plates move.');
    }
    return lv(R, ctx, [evidence, fossil, tfOne], [evidence, fossil, tfOne], [evidence, tfOne]);
  });

  G('earthsci.seafloor-spreading', function (R, ctx) {
    function age() {
      var r = R.pick([1, 2, 2.5, 3, 4, 5]), t = R.pick([0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 20]), d = fix(r * 10 * t);
      return pr('A mid-ocean ridge spreads at ' + MQ(r, 'cm') + ' a year on each side. About how old is the ocean floor ' + MQ(d, 'km') + ' from the ridge, in millions of years? (1 km = 100,000 cm)', num(t, 0.01), [
        'Distance in centimeters: ' + M(N(d) + ' \\times 100{,}000 = ' + N(d * 1e5)) + ' cm.',
        'Age = distance ÷ rate: ' + M(N(d * 1e5) + ' \\div ' + N(r) + ' = ' + N(fix(d * 1e5 / r))) + ' years, about ' + N(fix(t)) + ' million years.'
      ], 'Change kilometers to centimeters, then divide by the rate.', { vk: 'sf-age', unit: 'million years', d: d, r: r });
    }
    function dist() {
      var r = R.pick([1, 2, 2.5, 3, 4, 5]), t = R.pick([1, 2, 4, 5, 8, 10, 20]), d = r * 10 * t;
      return pr('A ridge spreads at ' + MQ(r, 'cm') + ' a year on each side. How far from the ridge, in kilometers, is ocean floor that is ' + N(t) + ' million years old?', num(d, 0.01), [
        'Distance = rate × time: ' + M(N(r) + ' \\times ' + N(t * 1e6) + ' = ' + N(fix(r * t * 1e6))) + ' cm.',
        'Divide by 100,000 to get kilometers: ' + M(N(fix(d))) + ' km.'
      ], '1 cm a year is 10 km per million years.', { vk: 'sf-dist', unit: 'km', r: r, t: t });
    }
    function rate() {
      var t = R.pick([2, 4, 5, 8, 10, 20]), r = R.pick([1, 2, 2.5, 4, 5]), d = r * 10 * t;
      return pr('Ocean floor ' + MQ(d, 'km') + ' from a ridge is ' + N(t) + ' million years old. How fast does the ridge spread on each side, in centimeters per year?', num(r, 0.01), [
        'In centimeters: ' + M(N(d) + ' \\times 100{,}000 = ' + N(d * 1e5)) + ' cm, over ' + N(t * 1e6) + ' years.',
        'Rate = ' + M(N(d * 1e5) + ' \\div ' + N(t * 1e6) + ' = ' + N(r)) + ' cm per year.'
      ], 'Rate is distance ÷ time; put both in the right units.', { vk: 'sf-rate', unit: 'cm/yr', d: d, t: t });
    }
    function mirror() {
      var d = R.pick([100, 200, 300, 400, 600]), t = R.pick([4, 6, 8, 10, 12, 20]), side = R.pick([['east', 'west'], ['west', 'east'], ['north', 'south']]);
      return pr('Ocean floor ' + MQ(d, 'km') + ' ' + side[0] + ' of a mid-ocean ridge is ' + N(t) + ' million years old. About how old is the floor ' + MQ(d, 'km') + ' ' + side[1] + ' of the ridge?', exact(t), [
        'Spreading carries new rock away equally on both sides of the ridge.',
        'Rock the same distance away on the other side is the same age: about ' + N(t) + ' million years.'
      ], 'The pattern is a mirror image across the ridge.', { vk: 'sf-mirror', unit: 'million years', t: t });
    }
    function concept() {
      return mcq(R, [
        ['Where is the youngest ocean floor?', 'At the mid-ocean ridges', ['Next to the continents', 'In the deepest trenches', 'Evenly spread over the ocean'], 'New rock forms at the ridges and moves away.'],
        ['Why is sea-floor sediment thinnest near a mid-ocean ridge?', 'The rock there is young, so sediment has had little time to pile up.', ['Currents blow it away at ridges.', 'Ridges are too high for sediment.', 'Sediment melts there.'], 'Older floor, farther from the ridge, has collected sediment longer.'],
        ['Why do magnetic stripes on the sea floor form a mirror-image pattern on the two sides of a ridge?', 'New rock records Earth\'s magnetic field as it cools at the ridge, then is carried away to both sides.', ['Magnets on the sea floor attract each other.', 'Ocean currents line up the rocks.', 'The stripes are painted by minerals in seawater.'], 'Each stripe was made at the ridge and split in two by spreading.'],
        ['Almost all ocean floor is younger than about how old?', 'About 200 million years', ['About 4 billion years', 'About 10,000 years', 'About 1 million years'], 'Old ocean floor sinks back into the mantle at trenches.']
      ], 'New floor forms at the ridge.');
    }
    function tfOne() {
      return tfq(R, [
        ['The oldest rocks on Earth are found on the ocean floor.', false, 'Ocean floor is almost all younger than about 200 million years; some continental rock is about 4 billion years old.'],
        ['Ocean floor gets older the farther it is from a mid-ocean ridge.', true, 'It formed at the ridge and has been moving away ever since.'],
        ['Mid-ocean ridges form a mountain chain through every ocean.', true, 'Together they are about 65,000 km long.']
      ], 'Young at the ridge, older away from it.');
    }
    return lv(R, ctx, [concept, mirror, age], [age, dist, mirror, concept], [age, rate, dist, tfOne]);
  });

  G('earthsci.plate-boundaries', function (R, ctx) {
    var TYPES = ['Divergent', 'Convergent', 'Transform'];
    function motion() {
      var K = R.pick([['Two plates move away from each other.', 0], ['Two plates move toward each other.', 1], ['Two plates slide past each other sideways.', 2], ['One plate sinks beneath another.', 1], ['New lithosphere forms as two plates separate.', 0], ['Two plates grind past each other, and lithosphere is neither made nor destroyed.', 2]]);
      return pr(K[0] + ' What kind of plate boundary is this?', mc(TYPES[K[1]], TYPES.filter(function (t, i) { return i !== K[1]; }).concat(['Not a plate boundary'])), [
        'Apart: divergent. Together: convergent. Sideways: transform.',
        TYPES[K[1]] + '.'
      ], 'Apart, together or sideways?', { vk: 'concept' });
    }
    function place() {
      var K = R.pick([['the Mid-Atlantic Ridge', 0], ['Iceland', 0], ['the East African Rift', 0], ['the Andes along South America\'s west coast', 1], ['the Himalayas', 1], ['Japan', 1], ['the San Andreas Fault in California', 2], ['the Cascade volcanoes of Oregon and Washington', 1]]);
      return pr('What kind of plate boundary is found at ' + K[0] + '?', mc(TYPES[K[1]], TYPES.filter(function (t, i) { return i !== K[1]; })), [
        { 0: 'Plates are pulling apart there.', 1: 'Plates are pushing together there.', 2: 'Plates slide past each other there.' }[K[1]],
        TYPES[K[1]] + '.'
      ], 'How are the plates moving there?', { vk: 'concept' });
    }
    function picture() {
      var K = R.pick([['ridge', 0], ['rift', 0], ['ocean-ocean', 1], ['ocean-continent', 1], ['collision', 1], ['transform', 2]]);
      return pr('The cross-section shows a plate boundary (arrows show how the plates move). What kind of boundary is it?', mc(TYPES[K[1]], TYPES.filter(function (t, i) { return i !== K[1]; })), [
        'Look at the arrows: apart is divergent, toward each other is convergent, side by side is transform.',
        'Here: ' + TYPES[K[1]].toLowerCase() + '.'
      ], 'Follow the arrows.', { vk: 'pb-pic', viz: { name: 'es-boundary', opts: { type: K[0], quiet: true, lock: true } }, type: K[0] });
    }
    function balance() {
      return mcq(R, [
        ['New lithosphere forms every year at divergent boundaries. Why doesn\'t Earth get bigger?', 'An equal amount sinks back into the mantle at convergent boundaries.', ['The new rock evaporates.', 'Earth is getting bigger, by about 1 km a year.', 'Transform boundaries crush the extra rock into dust.'], 'Making and destroying lithosphere balance out.'],
        ['What fills the space as two plates move apart?', 'Hot rock rising from the mantle, which cools into new lithosphere', ['Seawater: a growing crack opens', 'Nothing: a gap opens', 'Sediment from rivers'], 'No gap opens; new rock fills it as fast as the plates separate.'],
        ['At which kind of boundary is lithosphere neither made nor destroyed?', 'Transform', ['Divergent', 'Convergent', 'All of them'], 'The plates only slide past each other.']
      ], 'Lithosphere made at one boundary is destroyed at another.');
    }
    return lv(R, ctx, [motion, place, picture], [picture, place, balance, motion], [picture, balance, place]);
  });

  G('earthsci.boundary-features', function (R, ctx) {
    var B = ['Divergent, in an ocean', 'Divergent, on a continent', 'Convergent: ocean meets ocean', 'Convergent: ocean meets continent', 'Convergent: continent meets continent', 'Transform'];
    var F = [
      ['A mid-ocean ridge with a crack down its center', 0], ['A long valley where a continent is splitting, with volcanoes', 1], ['A deep trench beside a curved chain of volcanic islands', 2],
      ['A trench offshore and a chain of volcanoes on the continent', 3], ['Very high folded mountains with no volcanoes', 4], ['A long, straight fault where streams are offset sideways', 5]
    ];
    function feat2b() {
      var K = R.pick(F);
      return pr('Which kind of boundary forms ' + K[0].charAt(0).toLowerCase() + K[0].slice(1) + '?', mc(B[K[1]], R.sample(B.filter(function (b, i) { return i !== K[1]; }), 3)), [
        'Ridges and rifts: plates pulling apart. Trenches with volcanoes: one plate sinking. High folded mountains: continents colliding. Long sideways faults: transform.',
        B[K[1]] + '.'
      ], 'Is a plate sinking, spreading, crumpling or sliding?', { vk: 'concept' });
    }
    function b2feat() {
      var K = R.pick(F);
      return pr('What landforms do you expect at this kind of boundary: ' + B[K[1]].toLowerCase() + '?', mc(K[0], R.sample(F.filter(function (f) { return f !== K; }).map(function (f) { return f[0]; }), 3)), [
        'Think about what each plate does there.',
        K[0] + '.'
      ], 'Which plate, if any, sinks?', { vk: 'concept' });
    }
    function place() {
      var K = R.pick([['the Himalayas', 'Continents colliding: high folded mountains with no volcanoes'], ['the Andes', 'An ocean plate sinking under a continent: volcanic mountains next to a trench'], ['the Mariana Trench and Mariana Islands', 'An ocean plate sinking under another ocean plate: a trench and volcanic islands'], ['the East African Rift', 'A continent pulling apart: a rift valley with volcanoes'], ['Iceland', 'A mid-ocean ridge rising above sea level: spreading with volcanoes'], ['the San Andreas Fault', 'Plates sliding past: a long fault with earthquakes but few volcanoes']]);
      var all = ['Continents colliding: high folded mountains with no volcanoes', 'An ocean plate sinking under a continent: volcanic mountains next to a trench', 'An ocean plate sinking under another ocean plate: a trench and volcanic islands', 'A continent pulling apart: a rift valley with volcanoes', 'A mid-ocean ridge rising above sea level: spreading with volcanoes', 'Plates sliding past: a long fault with earthquakes but few volcanoes'];
      return pr('Which description fits ' + K[0] + '?', mc(K[1], R.sample(all.filter(function (x) { return x !== K[1]; }), 3)), [K[1] + '.'], 'What are the plates doing there?', { vk: 'concept' });
    }
    function why() {
      return mcq(R, [
        ['Why do volcanoes form above a sinking ocean plate?', 'Water released from the sinking plate helps the mantle above it melt.', ['The trench fills with lava from the ocean.', 'Friction melts the whole plate at the surface.', 'The sinking plate pushes the core up.'], 'Water lowers the melting point of hot mantle rock.'],
        ['Why do the Himalayas have no active volcanoes?', 'Both plates carry continents, which are too buoyant to sink, so no magma forms.', ['They are too cold.', 'They are too high for magma to reach.', 'Volcanoes there were all destroyed by glaciers.'], 'Without subduction, the mantle doesn\'t melt; the crust just crumples.'],
        ['Why is the ocean plate the one that sinks when it meets a continent?', 'Oceanic lithosphere is denser than continental lithosphere.', ['Oceanic plates are always bigger.', 'Water pushes it down.', 'Continents are hotter.'], 'Denser basalt sinks under lighter granite-rich crust.']
      ], 'Density decides which plate sinks.');
    }
    function tfOne() {
      return tfq(R, [
        ['All mountains are volcanoes.', false, 'Ranges like the Himalayas and Alps are crumpled crust where continents collide.'],
        ['Deep ocean trenches form where one plate sinks under another.', true, 'Trenches mark subduction at convergent boundaries.'],
        ['Transform boundaries usually have many large volcanoes.', false, 'They have earthquakes but few volcanoes, since lithosphere is neither made nor destroyed.'],
        ['Earthquakes happen at all three kinds of plate boundary.', true, 'Rock breaks and slips wherever plates move against each other.']
      ], 'Each boundary builds its own landforms.');
    }
    return lv(R, ctx, [feat2b, place, tfOne], [feat2b, b2feat, place, why], [why, b2feat, place, tfOne]);
  });

  G('earthsci.plate-motion-rates', function (R, ctx) {
    function distance() {
      var r = R.pick([1, 2, 2.5, 3, 4, 5, 6, 8, 10]), t = R.pick([1, 2, 3, 5, 10, 20, 50]), d = fix(r * 10 * t);
      return pr('A plate moves ' + MQ(r, 'cm') + ' a year. How far does it move in ' + N(t) + ' million years, in kilometers?', num(d, 0.01), [
        'In centimeters: ' + M(N(r) + ' \\times ' + N(t * 1e6) + ' = ' + N(fix(r * t * 1e6))) + ' cm.',
        'In kilometers (1 km = 100,000 cm): ' + M(N(fix(r * t * 1e6)) + ' \\div 100{,}000 = ' + N(d)) + ' km.'
      ], '1 cm a year = 10 km per million years.', { vk: 'pm-dist', unit: 'km', r: r, t: t });
    }
    function time() {
      var r = R.pick([1, 2, 2.5, 3, 4, 5]), t = R.pick([2, 4, 5, 10, 15, 20, 30, 40, 50, 60, 100]), d = fix(r * 10 * t);
      return pr('Two continents move apart at ' + MQ(r, 'cm') + ' a year. How many million years will it take them to move ' + MQ(d, 'km') + ' farther apart?', num(t, 0.01), [
        'Rate in km per million years: ' + M(N(r) + ' \\times 10 = ' + N(r * 10)) + '.',
        'Time: ' + M(N(d) + ' \\div ' + N(r * 10) + ' = ' + N(fix(t))) + ' million years.'
      ], 'Change the rate to km per million years first.', { vk: 'pm-time', unit: 'million years', r: r, d: d });
    }
    function rate() {
      var r = R.pick([1, 2, 3, 4, 5, 6, 8]), t = R.pick([2, 4, 5, 10, 25]), d = r * 10 * t;
      return pr('Rocks that formed together have been carried ' + MQ(d, 'km') + ' apart in ' + N(t) + ' million years. What is the average rate, in centimeters per year?', num(r, 0.01), [
        'Distance in cm: ' + M(N(d) + ' \\times 100{,}000 = ' + N(d * 1e5)) + ' cm. Time: ' + N(t * 1e6) + ' years.',
        'Rate: ' + M(N(d * 1e5) + ' \\div ' + N(t * 1e6) + ' = ' + N(r)) + ' cm per year.'
      ], 'Rate = distance ÷ time, in cm and years.', { vk: 'pm-rate', unit: 'cm/yr', d: d, t: t });
    }
    function life() {
      var r = R.pick([2, 2.5, 3, 4, 5]), y = R.pick([10, 12, 20, 40, 50, 80, 100]), cm = fix(r * y);
      return pr('The Atlantic Ocean widens about ' + MQ(r, 'cm') + ' a year. How many meters wider will it be in ' + y + ' years?', num(cm / 100, 0.01), [
        M(N(r) + ' \\times ' + y + ' = ' + N(cm)) + ' cm.',
        'In meters: ' + M(N(cm) + ' \\div 100 = ' + N(cm / 100)) + ' m.'
      ], 'Multiply, then change centimeters to meters.', { vk: 'pm-life', unit: 'm', r: r, y: y });
    }
    function gps() {
      var mm = R.pick([5, 8, 12, 15, 20, 25, 35, 45]), y = R.pick([10, 20, 30, 50, 100]);
      return pr('A GPS station on a moving plate shifts ' + MQ(mm, 'mm') + ' a year. How many centimeters does it move in ' + y + ' years?', num(mm * y / 10, 0.01), [
        M(N(mm) + ' \\times ' + y + ' = ' + N(mm * y)) + ' mm.',
        '10 mm = 1 cm, so ' + M(N(mm * y) + ' \\div 10 = ' + N(fix(mm * y / 10))) + ' cm.'
      ], 'Multiply, then change millimeters to centimeters.', { vk: 'pm-gps', unit: 'cm', mm: mm, y: y });
    }
    function trap() {
      var r = R.pick([2, 4, 5, 8]), t = R.pick([2, 3, 5]), d = r * 10 * t;
      return pr('A student says a plate moving ' + MQ(r, 'cm') + ' a year travels ' + N(r * t) + ' million km in ' + t + ' million years. How far does it really travel, in kilometers?', num(d, 0.01), [
        M(N(r) + ' \\times ' + N(t * 1e6) + ' = ' + N(r * t * 1e6)) + ' cm, which is ' + N(r * t) + ' million centimeters, not kilometers.',
        'Divide by 100,000: ' + M(N(r * t * 1e6) + ' \\div 100{,}000 = ' + N(d)) + ' km.'
      ], 'The student forgot to change centimeters to kilometers.', { vk: 'pm-dist', unit: 'km', r: r, t: t });
    }
    return lv(R, ctx, [distance, life, gps], [distance, time, rate, life, trap], [time, rate, trap, gps]);
  });

  // ---------- g09_quakes.js ----------
  // ===================== Unit 9: Earthquakes and Volcanoes =====================
  G('earthsci.seismic-waves', function (R, ctx) {
    var SPD = 'Use 6 km/s for P waves and 3.5 km/s for S waves.';
    function arrive() {
      var d = 42 * R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30]), w = R.pick(['P', 'S']), t = w === 'P' ? d / 6 : d / 3.5;
      return pr('A seismometer is ' + MQ(d, 'km') + ' from an earthquake. ' + SPD + ' How many seconds after the quake does the ' + w + ' wave arrive?', num(t, 0.01), [
        'Time = distance ÷ speed.',
        M(N(d) + ' \\div ' + (w === 'P' ? 6 : 3.5) + ' = ' + N(fix(t))) + ' s.'
      ], 'Divide the distance by the wave\'s speed.', { vk: 'sw-t', unit: 's', d: d, w: w });
    }
    function gap() {
      var d = 42 * R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20]), tp = d / 6, ts = d / 3.5;
      return pr('A seismometer is ' + MQ(d, 'km') + ' from an earthquake. ' + SPD + ' How many seconds after the P wave does the S wave arrive?', num(ts - tp, 0.01), [
        'P wave: ' + M(N(d) + ' \\div 6 = ' + N(fix(tp))) + ' s. S wave: ' + M(N(d) + ' \\div 3.5 = ' + N(fix(ts))) + ' s.',
        'Gap: ' + M(N(fix(ts)) + ' - ' + N(fix(tp)) + ' = ' + N(fix(ts - tp))) + ' s.'
      ], 'Find each arrival time, then subtract.', { vk: 'sw-gap', unit: 's', d: d });
    }
    function far() {
      var g = R.pick([5, 10, 15, 20, 25, 30, 40, 50]), d = g * 8.4;
      return pr('With P waves at 6 km/s and S waves at 3.5 km/s, the S wave falls about 1 second behind for every 8.4 km traveled. A station records the S wave ' + MQ(g, 's') + ' after the P wave. About how far away was the earthquake?', num(d, 0.02), [
        'Each second of gap means about 8.4 km.',
        M(N(g) + ' \\times 8.4 = ' + N(fix(d))) + ' km.'
      ], 'Multiply the gap by 8.4 km per second.', { vk: 'sw-far', unit: 'km', g: g });
    }
    function kinds() {
      return mcq(R, [
        ['Which seismic waves arrive first at a seismometer?', 'P waves', ['S waves', 'Surface waves', 'They all arrive together'], 'P waves are the fastest.'],
        ['Which seismic waves cannot travel through liquids?', 'S waves', ['P waves', 'Surface waves', 'All of them can'], 'S waves shake rock side to side, which a liquid can\'t pass along.'],
        ['Which seismic waves usually do the most damage?', 'Surface waves', ['P waves', 'S waves', 'Sound waves'], 'They are slowest but often have the biggest, longest shaking at the surface.'],
        ['Where does the rock first break in an earthquake?', 'At the focus, underground', ['At the epicenter, on the surface', 'At the seismometer', 'In the outer core'], 'The epicenter is the point on the surface straight above the focus.'],
        ['What is the epicenter of an earthquake?', 'The point on the surface directly above where the rock broke', ['The place underground where the rock broke', 'The place where the shaking was strongest', 'The seismometer that recorded it first'], 'The focus is underground; the epicenter is on the map above it.']
      ], 'P first, S second, surface waves last.');
    }
    function tfOne() {
      return tfq(R, [
        ['The epicenter is the point underground where the rock breaks.', false, 'That is the focus; the epicenter is on the surface straight above it.'],
        ['P waves can travel through solids, liquids and gases.', true, 'They push and pull, which any material can pass along.'],
        ['The farther a station is from an earthquake, the longer the gap between the P and S waves.', true, 'The faster P wave pulls further ahead with distance.'],
        ['An earthquake happens when stuck rock along a fault suddenly slips.', true, 'Stored bending energy is released as seismic waves.']
      ], 'Focus below, epicenter above.');
    }
    return lv(R, ctx, [kinds, arrive, tfOne], [arrive, gap, kinds], [gap, far, arrive, tfOne]);
  });

  G('earthsci.earthquake-magnitude', function (R, ctx) {
    function amp() {
      var a = R.int(2, 6) + R.pick([0, 0, 0.5, 0.2, 0.7]), dm = R.int(1, ctx.level >= 2 ? 4 : 3), b = fix(a + dm);
      return pr('A magnitude ' + b + ' and a magnitude ' + a + ' earthquake are recorded the same distance away. How many times taller are the waves on the seismogram of the bigger one?', exact(MA.pow(10, dm)), [
        'Difference: ' + M(N(b) + ' - ' + N(a) + ' = ' + dm) + ' step' + (dm > 1 ? 's' : '') + '.',
        'Each step is × 10: ' + M('10^{' + dm + '} = ' + N(MA.pow(10, dm))) + '.'
      ], 'Subtract the magnitudes, then use a power of 10.', { vk: 'mg-amp', a: a, b: b });
    }
    function energy() {
      var a = R.int(3, 6) + R.pick([0, 0, 0.5, 0.3]), dm = R.int(1, 3), b = fix(a + dm), e = MA.pow(10, 1.5 * dm);
      return pr('Each step up in magnitude releases about 32 times more energy. About how many times more energy does a magnitude ' + b + ' earthquake release than a magnitude ' + a + '?', num(e, 0.05), [
        'Difference: ' + dm + ' step' + (dm > 1 ? 's' : '') + '.',
        dm === 1 ? 'About 32 times.' : dm === 2 ? M('32 \\times 32 \\approx 1{,}000') + ' times.' : M('32 \\times 32 \\times 32 \\approx 32{,}000') + ' times.'
      ], 'Multiply by 32 once for each step.', { vk: 'mg-en', a: a, b: b });
    }
    function back() {
      var dm = R.int(1, 4), a = fix(R.int(2, 5) + R.pick([0, 0, 0.5, 0.4]));
      return pr('One earthquake\'s seismogram waves are ' + N(MA.pow(10, dm)) + ' times taller than those of a magnitude ' + a + ' earthquake recorded the same distance away. What is the bigger quake\'s magnitude?', exact(fix(a + dm)), [
        N(MA.pow(10, dm)) + ' = ' + M('10^{' + dm + '}') + ', so it is ' + dm + ' step' + (dm > 1 ? 's' : '') + ' bigger.',
        M(N(a) + ' + ' + dm + ' = ' + N(fix(a + dm))) + '.'
      ], 'How many times do you multiply by 10?', { vk: 'mg-back', a: a, dm: dm });
    }
    function compare() {
      var a = R.int(2, 4), b = a + R.int(2, 3), dm = b - a;
      return pr('A student says a magnitude ' + b + ' earthquake is "a little more than twice" a magnitude ' + a + '. How many times taller are its seismogram waves really?', exact(MA.pow(10, dm)), [
        'Magnitude is not ordinary counting: each step multiplies wave height by 10.',
        M(b + ' - ' + a + ' = ' + dm) + ' steps: ' + M('10^{' + dm + '} = ' + N(MA.pow(10, dm))) + ' times taller.'
      ], 'Each step is × 10, not + 1.', { vk: 'mg-amp', a: a, b: b });
    }
    function mi() {
      return mcq(R, [
        ['What is the difference between magnitude and intensity?', 'Magnitude is the size of the earthquake itself; intensity is how strongly the ground shook at one place.', ['They are two names for the same number.', 'Intensity is measured only at the epicenter.', 'Magnitude changes from town to town.'], 'One quake has one magnitude but many intensities.'],
        ['Why can one earthquake have many different intensities?', 'Shaking is strongest near the epicenter and weaker farther away, and soft ground shakes more.', ['Each seismometer uses a different scale.', 'The quake changes size as it moves.', 'Intensity depends on the time of day.'], 'Intensity describes local effects.']
      ], 'Size of the quake versus shaking at a place.');
    }
    function tfOne() {
      return tfq(R, [
        ['A magnitude 6 earthquake is twice as big as a magnitude 3.', false, 'It is three steps bigger: waves 1,000 times taller and about 32,000 times the energy.'],
        ['Each whole step in magnitude means waves about 10 times taller on a seismogram.', true, 'The scale counts powers of ten.'],
        ['A magnitude 8 releases about 1,000 times the energy of a magnitude 6.', true, 'Two steps: about ' + M('32 \\times 32 \\approx 1{,}000') + '.'],
        ['One earthquake has a different magnitude in every town.', false, 'It has one magnitude; the shaking (intensity) varies from place to place.']
      ], 'Each step multiplies.');
    }
    return lv(R, ctx, [amp, tfOne, amp], [amp, energy, back, mi], [energy, compare, back, tfOne]);
  });

  G('earthsci.volcanoes', function (R, ctx) {
    var TY = ['A shield volcano', 'A cinder cone', 'A composite volcano'];
    function type() {
      var K = R.pick([
        ['A huge, broad volcano with gentle slopes, built by many flows of runny basalt lava', 0], ['A small, steep cone built of loose cinders blasted out over a few years', 1],
        ['A tall, steep, cone-shaped mountain built of layers of lava and ash, with violent eruptions', 2], ['Mauna Loa in Hawaii, whose runny lava flows build a wide, gently sloping dome', 0],
        ['Mount St. Helens, a steep cone of ash and lava layers that exploded in 1980', 2], ['Parícutin in Mexico, which grew from a cornfield into a steep pile of cinders', 1]
      ]);
      return pr(K[0] + '. What kind of volcano is it?', mc(TY[K[1]], TY.filter(function (t, i) { return i !== K[1]; }).concat(['A hot spring'])), [
        'Broad and gentle: shield. Small and steep, made of cinders: cinder cone. Tall, layered, explosive: composite.',
        TY[K[1]] + '.'
      ], 'Look at the size, the slope and how it erupts.', { vk: 'concept' });
    }
    function style() {
      var K = R.pick([['high in silica and full of gas', 'Explosive, with clouds of ash'], ['low in silica, runny, with little gas', 'Gentle, with lava flowing out'], ['very sticky and rich in silica', 'Explosive, with clouds of ash'], ['hot, runny basalt', 'Gentle, with lava flowing out']]);
      return pr('A volcano\'s magma is ' + K[0] + '. What kind of eruption is most likely?', mc(K[1], ['Explosive, with clouds of ash', 'Gentle, with lava flowing out', 'No eruption is possible', 'Only steam, never lava'].filter(function (x) { return x !== K[1]; })), [
        'Silica makes magma sticky; gas trapped in sticky magma bursts out violently, while runny magma lets gas escape gently.',
        K[1] + '.'
      ], 'Can the gas escape easily?', { vk: 'concept' });
    }
    function picture() {
      var K = R.pick([['shield', 0], ['cinder', 1], ['composite', 2]]);
      return pr('The picture shows a volcano in cross-section. What kind is it?', mc(TY[K[1]], TY.filter(function (t, i) { return i !== K[1]; })), [
        { shield: 'It is broad, with gentle slopes built by runny lava: a shield volcano.', cinder: 'It is small and steep, made of loose cinders: a cinder cone.', composite: 'It is tall and steep, with layers of lava and ash: a composite volcano.' }[K[0]]
      ], 'Compare the width with the height and the slope.', { vk: 'vo-pic', viz: { name: 'es-volcano', opts: { mode: 'volcano', type: K[0], quiet: true, lock: true } }, type: K[0] });
    }
    function hazard() {
      return mcq(R, [
        ['Which volcanic hazard is a fast-moving cloud of hot ash, rock and gas that races down a volcano\'s slopes?', 'A pyroclastic flow', ['A lava flow', 'A lahar', 'Ash fall'], 'Pyroclastic flows are among the deadliest volcanic hazards.'],
        ['Which volcanic hazard is a fast mudflow of ash, rock and water that pours down river valleys?', 'A lahar', ['A pyroclastic flow', 'A lava flow', 'A gas cloud'], 'Lahars can travel far from the volcano along valleys.'],
        ['Which volcanic hazard usually moves slowly enough for people to walk away from?', 'Most lava flows', ['Pyroclastic flows', 'Lahars', 'Falling ash clouds'], 'Lava flows destroy property but rarely move faster than a person can walk.'],
        ['Which hazards have caused the most deaths in volcanic eruptions?', 'Pyroclastic flows and lahars', ['Lava flows', 'Earthquakes at volcanoes', 'Volcanic lightning'], 'They are fast and can reach far from the volcano.']
      ], 'Fast hazards are the deadliest.');
    }
    function tfOne() {
      return tfq(R, [
        ['Lava flows are the main cause of deaths in volcanic eruptions.', false, 'Pyroclastic flows and lahars have killed far more people.'],
        ['Magma rich in silica tends to erupt explosively.', true, 'Sticky magma traps gas until it bursts out.'],
        ['Shield volcanoes are small and steep.', false, 'Shield volcanoes are huge and broad, with gentle slopes.'],
        ['Most volcanoes are found along plate boundaries.', true, 'Spreading and subduction make most magma; hot spots are the exception.']
      ], 'Silica and gas decide the eruption.');
    }
    return lv(R, ctx, [type, style, type], [type, style, hazard], [hazard, tfOne, type, style]);
  });

  G('earthsci.hot-spots', function (R, ctx) {
    function speed() {
      var r = R.pick([2, 4, 5, 6, 8, 9, 10]), t = R.pick([1, 2, 3, 4, 5, 6]), d = r * 10 * t;
      return pr('In a hot-spot island chain, an island ' + MQ(d, 'km') + ' from the active volcano is ' + N(t) + ' million years old. How fast has the plate moved, in centimeters per year?', num(r, 0.01), [
        'Speed: ' + M(N(d) + ' \\div ' + N(t) + ' = ' + N(d / t)) + ' km per million years.',
        '1 cm/yr = 10 km per million years, so ' + M(N(d / t) + ' \\div 10 = ' + N(r)) + ' cm/yr.'
      ], 'Divide distance by age, then change units.', { vk: 'hs-speed', unit: 'cm/yr', d: d, t: t });
    }
    function age() {
      var r = R.pick([4, 5, 8, 10]), d = R.pick([100, 200, 300, 400, 500, 800, 1000]), t = d / (r * 10);
      return pr('A plate moves over a hot spot at ' + MQ(r, 'cm') + ' a year. About how old is a volcanic island ' + MQ(d, 'km') + ' from the hot spot, in millions of years?', num(t, 0.01), [
        'Rate: ' + M(N(r) + ' \\text{ cm/yr} = ' + N(r * 10)) + ' km per million years.',
        'Age: ' + M(N(d) + ' \\div ' + N(r * 10) + ' = ' + N(fix(t))) + ' million years.'
      ], 'Change the rate to km per million years.', { vk: 'hs-age', unit: 'million years', r: r, d: d });
    }
    function dist() {
      var r = R.pick([4, 5, 8, 10]), t = R.pick([1, 2, 3, 5, 10, 20]), d = r * 10 * t;
      return pr('A plate moves over a hot spot at ' + MQ(r, 'cm') + ' a year. How far from the hot spot, in kilometers, should you find volcanoes that are ' + N(t) + ' million years old?', num(d, 0.01), [
        M(N(r) + ' \\text{ cm/yr} = ' + N(r * 10)) + ' km per million years.',
        M(N(r * 10) + ' \\times ' + N(t) + ' = ' + N(d)) + ' km.'
      ], 'Distance = rate × time.', { vk: 'hs-dist', unit: 'km', r: r, t: t });
    }
    function dir() {
      var D2 = [['northwest', 'southeast'], ['west', 'east'], ['north', 'south'], ['northeast', 'southwest'], ['southwest', 'northeast']], K = R.pick(D2);
      return pr('In a chain of hot-spot volcanoes, the active volcano is at the ' + K[1] + ' end, and the islands get older toward the ' + K[0] + '. Which way is the plate moving?', mc(cap(K[0]), [cap(K[1])].concat(R.sample(D2.filter(function (x) { return x !== K; }).map(function (x) { return cap(x[0]); }), 2))), [
        'The hot spot stays put; the plate carries old volcanoes away from it.',
        'The oldest islands lie to the ' + K[0] + ', so the plate moves ' + K[0] + '.'
      ], 'The oldest volcanoes have been carried the farthest.', { vk: 'concept' });
    }
    function tfOne() {
      return tfq(R, [
        ['Every volcano sits on a plate boundary.', false, 'Hot-spot volcanoes like Hawaii and Yellowstone are in the middle of plates.'],
        ['In a hot-spot chain, islands get older the farther they are from the active volcano.', true, 'The plate carries each volcano away after it forms.'],
        ['A hot spot moves along with the plate above it.', false, 'The hot spot stays nearly fixed; the plate slides over it.'],
        ['The ages and distances of hot-spot islands can tell how fast a plate moves.', true, 'Speed = distance ÷ age.']
      ], 'The hot spot stays; the plate moves.');
    }
    return lv(R, ctx, [dir, speed, tfOne], [speed, age, dist, dir], [speed, age, dist]);
  });

  G('earthsci.hazard-forecasting', function (R, ctx) {
    function recur() {
      var n = R.pick([2, 3, 4, 5, 6, 8, 10]), T = R.pick([10, 20, 25, 30, 40, 50, 100]), Y = n * T, what = R.pick(['large floods', 'big earthquakes on a fault', 'eruptions of a volcano', 'major landslides in a valley']);
      return pr('Records show ' + n + ' ' + what + ' in ' + N(Y) + ' years. What is the average time between them (the recurrence interval)?', exact(T), [
        'Recurrence interval = years of record ÷ number of events.',
        M(N(Y) + ' \\div ' + n + ' = ' + N(T)) + ' years.'
      ], 'Divide the years by the number of events.', { vk: 'hz-T', unit: 'years', n: n, Y: Y });
    }
    function chance() {
      var T = R.pick([10, 20, 25, 50, 100, 200, 500]), p = 100 / T;
      return pr('A river\'s "' + N(T) + '-year flood" happens on average once every ' + N(T) + ' years. What is the chance, as a percent, of such a flood in any one year?', { t: 'num', v: String(fix(p)), rtol: 0.02, pct: true }, [
        'Once in ' + N(T) + ' years means a chance of ' + M('\\tfrac{1}{' + N(T) + '}') + ' each year.',
        M('1 \\div ' + N(T) + ' = ' + N(fix(1 / T))) + ', which is ' + N(fix(p)) + '%.'
      ], 'One chance in how many years?', { vk: 'hz-p', T: T });
    }
    function backT() {
      var p = R.pick([1, 2, 4, 5, 10, 20]);
      return pr('A fault has about a ' + p + '% chance of a large earthquake in any one year. On average, how many years are there between large earthquakes?', exact(100 / p), [
        p + '% is ' + M('\\tfrac{' + p + '}{100} = \\tfrac{1}{' + N(100 / p) + '}') + '.',
        'So on average one every ' + N(100 / p) + ' years.'
      ], 'Turn the percent into "1 in how many".', { vk: 'hz-back', unit: 'years', p: p });
    }
    function expect() {
      var p = R.pick([1, 2, 4, 5, 10]), n = R.pick([50, 100, 200, 300]), e = p * n / 100;
      return pr('A town has a ' + p + '% chance of a damaging flood each year. About how many such floods should it expect over ' + n + ' years?', num(e, 0.01), [
        'Expected number = chance per year × number of years.',
        M(N(p / 100) + ' \\times ' + n + ' = ' + N(fix(e))) + '. (The real number could be more or fewer: it is a chance, not a schedule.)'
      ], 'Multiply the yearly chance by the number of years.', { vk: 'hz-exp', p: p, n: n });
    }
    function signs() {
      return mcq(R, [
        ['Which set of signs most suggests a volcano may erupt soon?', 'More small earthquakes, the ground bulging upward and more gas coming out', ['Cooler temperatures and less rain', 'A full moon and high tides', 'Fewer birds in the area'], 'All three come from magma moving up into the volcano.'],
        ['What can an earthquake early-warning system like ShakeAlert do?', 'Detect a quake that has started and warn places farther away seconds before strong shaking arrives', ['Tell the exact day of next year\'s earthquakes', 'Stop an earthquake from happening', 'Warn people a week before an earthquake'], 'It uses the fast P waves of a quake already underway.'],
        ['What is an earthquake forecast?', 'The chance of a quake of a certain size in a region over a span of years', ['The exact date and place of the next quake', 'A list of past earthquakes only', 'A guess based on the weather'], 'Forecasts give probabilities, not dates.']
      ], 'Forecasts give chances, not dates.');
    }
    function tfOne() {
      return tfq(R, [
        ['Scientists can predict the exact day of the next big earthquake.', false, 'No one can yet; forecasts give the chance of a quake over years or decades.'],
        ['After a "100-year flood," a town is safe from another one for 100 years.', false, 'A 100-year flood has a 1% chance every year, so two can happen close together.'],
        ['Swelling ground and small earthquakes at a volcano can be warning signs of an eruption.', true, 'They show magma moving underground.'],
        ['Knowing how often hazards happen helps communities plan and build safely.', true, 'Forecasts guide building codes and land use.']
      ], 'Chances, not schedules.');
    }
    return lv(R, ctx, [recur, signs, tfOne], [recur, chance, signs, backT], [chance, expect, backT, tfOne]);
  });

  // ---------- g10_water.js ----------
  // ===================== Unit 10: Water on Earth =====================
  G('earthsci.water-distribution', function (R, ctx) {
    function fresh() {
      var T2 = R.pick([400, 800, 1000, 1200, 1600, 2000, 2400, 3000, 4000, 5000, 6000, 8000, 10000, 20000, 40000]), f = fix(T2 * 0.025);
      return pr('In a model, all of Earth\'s water is ' + MQ(T2, 'L') + '. About 2.5% of Earth\'s water is fresh. How many liters of the model are fresh water?', num(f, 0.02), [
        '2.5% = 0.025.',
        M(N(T2) + ' \\times 0.025 = ' + N(f)) + ' L.'
      ], 'Find 2.5% of the total.', { vk: 'wd-fresh', unit: 'L', T: T2 });
    }
    function share() {
      var K = R.pick([['ice caps and glaciers', 69], ['groundwater', 30]]), f = R.pick([10, 20, 25, 30, 40, 50, 60, 80, 100, 150, 200, 250, 300, 500]), x = fix(f * K[1] / 100);
      return pr('A model holds ' + MQ(f, 'L') + ' of fresh water, shared out like Earth\'s fresh water. About ' + K[1] + '% of fresh water is in ' + K[0] + '. How many liters of the model is that?', num(x, 0.02), [
        K[1] + '% = ' + N(K[1] / 100) + '.',
        M(N(f) + ' \\times ' + N(K[1] / 100) + ' = ' + N(x)) + ' L.'
      ], 'Find ' + K[1] + '% of the fresh water.', { vk: 'wd-share', unit: 'L', f: f, p: K[1] });
    }
    function salt() {
      var T2 = R.pick([100, 200, 300, 400, 500, 600, 800, 1000, 2000, 5000]), s = fix(T2 * 0.97);
      return pr('About 97% of Earth\'s water is salt water. If Earth\'s water were ' + MQ(T2, 'L') + ', how many liters would be salty?', num(s, 0.02), [
        M(N(T2) + ' \\times 0.97 = ' + N(s)) + ' L.'
      ], 'Find 97% of the total.', { vk: 'wd-salt', unit: 'L', T: T2 });
    }
    function where() {
      return mcq(R, [
        ['Where is most of Earth\'s fresh water?', 'Frozen in ice caps and glaciers', ['In lakes', 'In rivers', 'In the air as water vapor'], 'About 69% of fresh water is ice; about 30% is groundwater.'],
        ['Where is most of Earth\'s liquid fresh water?', 'Underground, as groundwater', ['In lakes', 'In rivers', 'In clouds'], 'Groundwater is about 30% of fresh water; lakes and rivers hold well under 1%.'],
        ['About what share of all Earth\'s water is fresh?', 'About 2.5% to 3%', ['About 50%', 'About 25%', 'About 97%'], 'About 97% is salt water, nearly all in the oceans.'],
        ['About what share of Earth\'s fresh water is in lakes and rivers together?', 'Well under 1%', ['About 30%', 'About 69%', 'About half'], 'Lakes and rivers are the water we see, but they hold only a tiny part.']
      ], 'Most fresh water is ice or underground.');
    }
    function tfOne() {
      return tfq(R, [
        ['Most of Earth\'s fresh water is in lakes and rivers.', false, 'They hold well under 1% of it; most is ice and groundwater.'],
        ['About 97% of Earth\'s water is salty.', true, 'Nearly all of it is in the oceans.'],
        ['Groundwater holds far more fresh water than all the rivers on Earth.', true, 'Groundwater is about 30% of fresh water; rivers are a tiny fraction of 1%.'],
        ['Ice sheets and glaciers hold about two-thirds of Earth\'s fresh water.', true, 'About 69%.']
      ], 'Ice first, groundwater second, lakes and rivers a sliver.');
    }
    return lv(R, ctx, [where, fresh, tfOne], [fresh, share, salt, where], [share, fresh, tfOne]);
  });

  G('earthsci.water-cycle', function (R, ctx) {
    var AR = ['evaporation', 'transpiration', 'condensation', 'precipitation', 'sublimation', 'melting', 'runoff', 'infiltration', 'groundwater flow'];
    function letter() {
      var i = R.pick([0, 1, 2, 3, 6, 7, 8]);
      return pr('In the water cycle picture the arrows are lettered. Which process is arrow ' + LET[i] + '?', mc(cap(AR[i]), R.sample(AR.filter(function (a, j) { return j !== i && j !== 4 && j !== 5; }), 3).map(cap)), [
        { 0: 'It rises from the ocean into the air: evaporation.', 1: 'It rises from plants into the air: transpiration.', 2: 'It turns vapor into cloud: condensation.', 3: 'It falls from the cloud: precipitation.', 6: 'It flows downhill over the land: runoff.', 7: 'It soaks down into the ground: infiltration.', 8: 'It moves through the ground toward the sea: groundwater flow.' }[i]
      ], 'Where does the arrow start and end?', { vk: 'wc-letter', viz: { name: 'es-water', opts: { mode: 'cycle', blank: true, reservoirs: false, flux: false, lock: true } }, idx: i });
    }
    function process() {
      var K = R.pick([
        ['Water vapor in rising air cools and forms tiny droplets.', 'Condensation'], ['A wet road dries in the sunshine.', 'Evaporation'], ['Rain soaks into the soil.', 'Infiltration'],
        ['Rainwater flows over a parking lot into a stream.', 'Runoff'], ['Snow falls from a cloud.', 'Precipitation'], ['A tree gives off water vapor through its leaves.', 'Transpiration'], ['Dew forms on grass on a cool night.', 'Condensation']
      ]);
      var all = ['Evaporation', 'Condensation', 'Precipitation', 'Runoff', 'Infiltration', 'Transpiration'];
      return pr(K[0] + ' Which part of the water cycle is this?', mc(K[1], R.sample(all.filter(function (x) { return x !== K[1]; }), 3)), [
        'Match the change: liquid to vapor is evaporation (transpiration from plants); vapor to liquid is condensation; falling is precipitation; flowing over land is runoff; soaking in is infiltration.',
        K[1] + '.'
      ], 'What changes, and where does the water go?', { vk: 'concept' });
    }
    function power() {
      var K = R.pick([['evaporation', 'Energy from the Sun'], ['transpiration', 'Energy from the Sun'], ['precipitation', 'Gravity'], ['runoff', 'Gravity'], ['infiltration', 'Gravity']]);
      return pr('What mainly drives ' + K[0] + ' in the water cycle?', mc(K[1], ['Energy from the Sun', 'Gravity', 'The Moon\'s pull', 'Heat from Earth\'s core'].filter(function (x) { return x !== K[1]; })), [
        'Lifting water into the air as vapor takes energy, which sunlight supplies; falling and flowing downhill are gravity\'s work.',
        cap(K[0]) + ': ' + K[1].toLowerCase() + '.'
      ], 'Is water going up into the air, or down and downhill?', { vk: 'concept' });
    }
    function residence() {
      var K = R.pick([['the air', 9, 'days'], ['the ocean', 3000, 'years']]);
      return mcq(R, [
        ['What are clouds made of?', 'Tiny drops of liquid water or ice crystals', ['Water vapor gas', 'Smoke', 'Steam that is still a gas'], 'Water vapor is invisible; clouds are visible because the vapor has condensed.'],
        ['About how long does a water molecule stay in the air, on average, before it falls?', 'About 9 days', ['About 3,000 years', 'About 1 hour', 'About 100 years'], 'Water cycles through the atmosphere quickly.'],
        ['About how long does a water molecule stay in the ocean, on average?', 'About 3,000 years', ['About 9 days', 'About 1 year', 'Forever'], 'The ocean is a huge, slowly mixing store.']
      ], 'The air holds water only briefly.');
    }
    function tfOne() {
      return tfq(R, [
        ['Clouds are made of water vapor.', false, 'Water vapor is invisible; clouds are tiny liquid drops or ice crystals.'],
        ['The Sun\'s energy powers evaporation.', true, 'Turning liquid into vapor takes energy, which sunlight supplies.'],
        ['Gravity pulls precipitation down and makes runoff flow downhill.', true, 'Gravity drives the downward half of the cycle.'],
        ['Water that soaks into the ground leaves the water cycle forever.', false, 'Groundwater flows slowly to rivers, lakes and the sea, staying in the cycle.']
      ], 'Sun lifts, gravity brings down.');
    }
    return lv(R, ctx, [letter, process, power], [letter, power, residence, tfOne], [letter, residence, tfOne, process]);
  });

  G('earthsci.groundwater', function (R, ctx) {
    function porosity() {
      var Vt = R.pick([200, 400, 500, 800, 1000]), p = R.pick([10, 15, 20, 25, 30, 35, 40, 45, 50]), v = Vt * p / 100;
      return pr('A ' + MQ(Vt, 'cm³') + ' container of dry sediment can hold ' + MQ(v, 'cm³') + ' of water poured into its spaces. What is the porosity, as a percent?', { t: 'num', v: String(p), rtol: 0.01, pct: true }, [
        'Porosity = pore volume ÷ total volume.',
        M(N(v) + ' \\div ' + N(Vt) + ' = ' + N(p / 100)) + ', which is ' + p + '%.'
      ], 'Divide the water the spaces hold by the total volume.', { vk: 'gw-por', Vt: Vt, v: v });
    }
    function stored() {
      var p = R.pick([20, 25, 30, 35, 40]), Vt = R.pick([10, 20, 50, 100, 1000]), v = fix(Vt * p / 100);
      return pr('A block of sandstone below the water table has a volume of ' + MQ(Vt, 'm³') + ' and a porosity of ' + p + '%. How much water does it hold?', num(v, 0.01), [
        'Below the water table, all the pores are full of water.',
        M(N(Vt) + ' \\times ' + N(p / 100) + ' = ' + N(v)) + ' m³.'
      ], 'The pore space is ' + p + '% of the volume.', { vk: 'gw-store', unit: 'm³', Vt: Vt, p: p });
    }
    function aquifer() {
      return mcq(R, [
        ['Which layer makes the best aquifer?', 'Loose sand and gravel', ['Clay', 'Shale', 'Solid granite with no cracks'], 'Sand and gravel have large, connected pores: porous and permeable.'],
        ['Clay can have a porosity of 50%, yet it makes a poor aquifer. Why?', 'Its pores are tiny, so water barely flows through it (low permeability).', ['It has no pore space at all.', 'Clay dissolves in water.', 'Clay is always above the water table.'], 'Porosity is how much space; permeability is how easily water moves.'],
        ['How deep must a well go to give water all year?', 'Below the water table, into an aquifer', ['Just into the topsoil', 'Exactly to the water table', 'Into the bedrock below any aquifer'], 'Only below the water table are the spaces full of water.'],
        ['What happens to the water table around a well pumped hard for months?', 'It drops in a cone around the well.', ['It rises above the ground.', 'It stays exactly the same.', 'It turns into an underground lake.'], 'Water flows toward the well more slowly than it is pumped out.'],
        ['What is the water table?', 'The top of the zone where all the spaces in the ground are filled with water', ['A table that lists water use', 'The bottom of an aquifer', 'The surface of the nearest lake'], 'Above it the spaces hold air and water; below it, only water.']
      ], 'Porous and permeable, below the water table.');
    }
    function tfOne() {
      return tfq(R, [
        ['Most groundwater flows in underground rivers and lakes.', false, 'Except in caves, groundwater fills tiny spaces between grains and in cracks.'],
        ['Porosity and permeability mean the same thing.', false, 'Porosity is how much open space; permeability is how easily water flows through it.'],
        ['A spring forms where the water table meets the ground surface.', true, 'Groundwater flows out onto the surface there.'],
        ['Rain and snowmelt that soak into the ground refill (recharge) aquifers.', true, 'Infiltration recharges groundwater.']
      ], 'Spaces between grains.');
    }
    return lv(R, ctx, [porosity, aquifer, tfOne], [porosity, stored, aquifer], [stored, porosity, aquifer, tfOne]);
  });

  // ---------- g11_air.js ----------
  // ===================== Unit 11: Air and Weather =====================
  G('earthsci.air-composition', function (R, ctx) {
    var GAS = [['nitrogen', 78], ['oxygen', 21], ['argon', 0.9]];
    function part() {
      var g = R.pick(GAS), V2 = R.pick([100, 200, 300, 500, 600, 800, 1000, 2000, 3000, 5000, 10000, 50000, 200000]), x = fix(V2 * g[1] / 100);
      return pr('Dry air is about 78% nitrogen, 21% oxygen and 0.9% argon. How many liters of ' + g[0] + ' are in ' + MQ(V2, 'L') + ' of dry air?', num(x, 0.02), [
        g[1] + '% = ' + N(g[1] / 100) + '.',
        M(N(V2) + ' \\times ' + N(g[1] / 100) + ' = ' + N(x)) + ' L.'
      ], 'Find the percent of the total.', { vk: 'ac-part', unit: 'L', V: V2, p: g[1] });
    }
    function ppm() {
      var c = R.pick([280, 290, 300, 310, 320, 340, 350, 370, 390, 400, 410, 420]);
      return pr('Air held about ' + N(c) + ' parts per million (ppm) of carbon dioxide. What percent is that?', { t: 'num', v: String(fix(c / 10000)), rtol: 0.01, pct: true }, [
        N(c) + ' ppm = ' + M(N(c) + ' \\div 1{,}000{,}000 = ' + N(fix(c / 1e6))) + '.',
        'As a percent: ' + M(N(fix(c / 1e6)) + ' \\times 100 = ' + N(fix(c / 10000))) + '%.'
      ], 'Divide by a million, then multiply by 100.', { vk: 'ac-ppm', c: c });
    }
    function per() {
      var c = R.pick([280, 400, 420, 500]), n = R.pick([10000, 100000, 1000000]), x = fix(c * n / 1e6);
      return pr('Carbon dioxide makes up about ' + N(c) + ' parts per million of the air. Out of ' + N(n) + ' molecules of air, about how many are carbon dioxide?', num(x, 0.02), [
        N(c) + ' out of every 1,000,000.',
        M(N(n) + ' \\times ' + N(c) + ' \\div 1{,}000{,}000 = ' + N(x)) + '.'
      ], 'Scale ' + N(c) + ' per million to your number.', { vk: 'ac-per', c: c, n: n });
    }
    function most() {
      return mcq(R, [
        ['Which gas makes up most of the air?', 'Nitrogen', ['Oxygen', 'Carbon dioxide', 'Water vapor'], 'Nitrogen is about 78% of dry air.'],
        ['About what share of dry air is oxygen?', 'About 21%', ['About 78%', 'About 50%', 'About 1%'], 'Oxygen is about a fifth of the air.'],
        ['About what share of the air is carbon dioxide?', 'About 0.04%', ['About 4%', 'About 21%', 'About 40%'], 'About 420 parts per million.'],
        ['Which part of the air changes the most from place to place and day to day?', 'Water vapor', ['Nitrogen', 'Argon', 'Oxygen'], 'Water vapor ranges from almost 0% to about 4%.']
      ], 'Nitrogen is the big one.');
    }
    function tfOne() {
      return tfq(R, [
        ['Air is mostly oxygen.', false, 'Air is mostly nitrogen (78%); oxygen is about 21%.'],
        ['Carbon dioxide is about one fifth of the air.', false, 'It is only about 0.04%, about 420 parts per million.'],
        ['Argon is the third most common gas in dry air.', true, 'At about 0.9%, it is more common than carbon dioxide.'],
        ['The amount of water vapor in the air changes with place and weather.', true, 'From almost none in cold deserts to about 4% in steamy tropics.']
      ], '78, 21, about 1.');
    }
    return lv(R, ctx, [most, part, tfOne], [part, ppm, most], [ppm, per, part]);
  });

  G('earthsci.atmosphere-layers', function (R, ctx) {
    var LY = ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'];
    function label() {
      var i = R.int(0, 3);
      return pr('In the picture, the layers of the atmosphere are lettered from the ground up. Which layer is ' + LET[i] + '?', mc(LY[i], LY.filter(function (x, j) { return j !== i; })), [
        'From the ground up: troposphere, stratosphere, mesosphere, thermosphere.',
        LET[i] + ' is the ' + LY[i].toLowerCase() + '.'
      ], 'Follow how the temperature line turns.', { vk: 'al-label', viz: { name: 'es-atmosphere', opts: { letters: true, quiet: true, lock: true, pie: false, markers: false } }, idx: i });
    }
    function where() {
      var K = R.pick([['Thunderstorms and nearly all weather', 0], ['The ozone layer that absorbs ultraviolet light', 1], ['Meteors burning up', 2], ['Auroras and the International Space Station', 3], ['The coldest air in the atmosphere, near −90 °C', 2], ['Air that gets warmer with height because ozone absorbs sunlight', 1]]);
      return pr('In which layer of the atmosphere would you find this: ' + K[0].charAt(0).toLowerCase() + K[0].slice(1) + '?', mc(LY[K[1]], LY.filter(function (x, j) { return j !== K[1]; })), [
        'Troposphere: weather. Stratosphere: ozone. Mesosphere: coldest, meteors. Thermosphere: thin and hot, auroras.',
        LY[K[1]] + '.'
      ], 'Match the event to the layer.', { vk: 'concept' });
    }
    function cool() {
      var T0 = R.pick([10, 15, 18, 20, 24, 25, 30]), h = R.pick([1, 2, 3, 4, 5, 6, 8]), T1 = fix(T0 - 6.5 * h);
      return pr('In the troposphere, air cools about 6.5 °C for each kilometer of height. If it is ' + MQ(T0, '°C') + ' at the ground, about what is the temperature ' + MQ(h, 'km') + ' up?', num(T1, 0.02), [
        'Cooling: ' + M(N(h) + ' \\times 6.5 = ' + N(fix(6.5 * h))) + ' °C.',
        M(N(T0) + ' - ' + N(fix(6.5 * h)) + ' = ' + N(T1)) + ' °C.'
      ], 'Multiply the height by 6.5, then subtract.', { vk: 'al-cool', unit: '°C', T0: T0, h: h });
    }
    function height() {
      var z = R.pick([[5, 0], [10, 0], [25, 1], [40, 1], [60, 2], [80, 2], [100, 3], [400, 3]]);
      return pr('Using these heights (troposphere 0 to 12 km, stratosphere 12 to 50 km, mesosphere 50 to 85 km, thermosphere above 85 km), which layer is ' + MQ(z[0], 'km') + ' above the ground?', mc(LY[z[1]], LY.filter(function (x, j) { return j !== z[1]; })), [
        MQ(z[0], 'km') + ' falls in the range of the ' + LY[z[1]].toLowerCase() + '.'
      ], 'Compare with each boundary.', { vk: 'al-height', z: z[0], idx: z[1] });
    }
    function tfOne() {
      return tfq(R, [
        ['The air gets colder all the way up to space.', false, 'Ozone warms the stratosphere, and the thermosphere is very hot.'],
        ['Almost all weather happens in the troposphere.', true, 'Nearly all the water vapor is there.'],
        ['The ozone layer is in the stratosphere.', true, 'Ozone absorbs ultraviolet sunlight there, warming that layer.'],
        ['The mesosphere is the warmest layer of the atmosphere.', false, 'It is the coldest, near −90 °C at its top.']
      ], 'The temperature zigzags with height.');
    }
    return lv(R, ctx, [label, where, cool], [label, cool, height, where], [cool, tfOne, height, label]);
  });

  G('earthsci.air-pressure', function (R, ctx) {
    function halve() {
      var k = R.int(1, 3), P0 = R.pick([1000, 1000, 1012, 1020, 1008]), h = fix(5.5 * k), P = P0 / MA.pow(2, k);
      var chain = [P0]; for (var i = 0; i < k; i++) chain.push(chain[i] / 2);
      return pr('Air pressure drops to about half for every 5.5 km you go up. If the pressure at sea level is ' + MQ(P0, 'hPa') + ', about what is it ' + MQ(h, 'km') + ' up?', num(P, 0.02), [
        MQ(h, 'km') + ' is ' + k + ' step' + (k > 1 ? 's' : '') + ' of 5.5 km.',
        'Halve ' + k + ' time' + (k > 1 ? 's' : '') + ': ' + M(chain.map(N).join(' \\to ')) + ' hPa.'
      ], 'Count the 5.5 km steps, and halve once for each.', { vk: 'ap-halve', unit: 'hPa', P0: P0, k: k });
    }
    function force() {
      var a = R.pick([5, 10, 15, 20, 25, 30]), b = R.pick([10, 20, 30, 40, 50]), A = a * b, F = A * 10;
      return pr('Air at sea level pushes with about 10 N on every square centimeter. How hard does it push on a ' + MQ(a, 'cm') + ' by ' + MQ(b, 'cm') + ' tabletop (from above)?', exact(F), [
        'Area: ' + M(a + ' \\times ' + b + ' = ' + N(A)) + ' cm².',
        'Force: ' + M(N(A) + ' \\times 10 = ' + N(F)) + ' N. Air under the table pushes up about as hard, so the table doesn\'t collapse.'
      ], 'Force = pressure × area.', { vk: 'ap-force', unit: 'N', a: a, b: b });
    }
    function units() {
      var hpa = R.pick([980, 996, 1004, 1013, 1020, 1032]);
      return pr('A weather station reads ' + MQ(hpa, 'hPa') + '. One kilopascal is 10 hectopascals. What is the pressure in kilopascals?', num(hpa / 10, 0.005), [
        '10 hPa = 1 kPa, so divide by 10.',
        M(N(hpa) + ' \\div 10 = ' + N(fix(hpa / 10))) + ' kPa.'
      ], 'Divide by 10.', { vk: 'ap-units', unit: 'kPa', hpa: hpa });
    }
    function concept() {
      return mcq(R, [
        ['Why is air pressure highest at sea level?', 'The most air is stacked above you there, pressing down.', ['Sea water pushes the air up.', 'The air is warmest there.', 'Gravity is stronger at sea level than anywhere else.'], 'Pressure is the weight of the air above.'],
        ['A sealed bag of chips puffs up when you drive up a mountain. Why?', 'The air pressure outside the bag is lower up high, so the air inside pushes the bag outward.', ['The chips get warmer.', 'The air inside the bag gains mass.', 'Gravity pulls the bag up.'], 'Less push from outside, same push from inside.'],
        ['Why aren\'t we crushed by the air pressing on us?', 'The air and fluids inside our bodies push outward just as hard.', ['Air has no weight.', 'Air pressure only pushes sideways.', 'Our skin blocks air pressure.'], 'The pushes balance.'],
        ['Which way does air pressure push on a surface?', 'In every direction', ['Only downward', 'Only upward', 'Only sideways'], 'Air molecules move in all directions and hit surfaces from all sides.']
      ], 'Pressure is the weight of the air above, pushing every way.');
    }
    function tfOne() {
      return tfq(R, [
        ['Air has no weight.', false, 'Air has mass, and gravity pulls on it; its weight is what makes air pressure.'],
        ['Air pressure pushes only downward.', false, 'It pushes in every direction.'],
        ['Air pressure on a high mountain is lower than at sea level.', true, 'There is less air above you.'],
        ['About half of the air\'s mass is below about 5.5 km.', true, 'That is why pressure there is about half of sea-level pressure.']
      ], 'Weight of the air above.');
    }
    return lv(R, ctx, [concept, halve, tfOne], [halve, force, concept, units], [force, halve, units, tfOne]);
  });

  G('earthsci.wind', function (R, ctx) {
    var DIR = [['north', 0, 'south'], ['east', 90, 'west'], ['south', 180, 'north'], ['west', 270, 'east'], ['northeast', 45, 'southwest'], ['southeast', 135, 'northwest'], ['southwest', 225, 'northeast'], ['northwest', 315, 'southeast']];
    function name() {
      var K = R.pick(DIR);
      var art = function (w) { return (/^[aeiou]/.test(w) ? 'An ' : 'A ') + w + ' wind'; };
      return pr('A wind blows from the ' + K[0] + ' toward the ' + K[2] + '. What is it called?', mc(art(K[0]), [art(K[2])].concat(R.sample(DIR.filter(function (d) { return d !== K && d[0] !== K[2]; }).map(function (d) { return art(d[0]); }), 2))), [
        'Winds are named for the direction they come from.',
        'From the ' + K[0] + ': ' + art(K[0]).toLowerCase() + '.'
      ], 'Where does it come from?', { vk: 'concept' });
    }
    function toward() {
      var K = R.pick(DIR);
      return pr('Smoke from a chimney drifts toward the ' + K[2] + '. What is the wind direction in degrees (the compass bearing the wind comes from: north 0°, east 90°, south 180°, west 270°)?', exact(K[1]), [
        'Smoke drifts away from where the wind comes from, so the wind comes from the ' + K[0] + '.',
        cap(K[0]) + ' is ' + N(K[1]) + '°.'
      ], 'The wind comes from the opposite direction to where the smoke goes.', { vk: 'wi-deg', unit: '°', from: K[0], deg: K[1] });
    }
    function breeze() {
      var day = R.coin();
      return pr('At a beach on a calm, clear ' + (day ? 'afternoon' : 'night') + ', which way does the breeze usually blow near the ground?', mc(day ? 'From the sea toward the land (a sea breeze)' : 'From the land toward the sea (a land breeze)', [day ? 'From the land toward the sea (a land breeze)' : 'From the sea toward the land (a sea breeze)', 'Straight up', 'Parallel to the shore only']), [
        day ? 'By day the land warms faster than the sea; air rises over the land, leaving lower pressure there.' : 'At night the land cools faster than the sea; the air over the sea is warmer and rises, leaving lower pressure there.',
        'Air flows from high pressure to low: ' + (day ? 'from the sea to the land.' : 'from the land to the sea.')
      ], 'Which heats up and cools down faster, land or water?', { vk: 'concept' });
    }
    function flow() {
      return mcq(R, [
        ['Which way does air flow near the ground between a high-pressure area and a low-pressure area?', 'From the high toward the low', ['From the low toward the high', 'Straight up from both', 'It doesn\'t move'], 'Air is pushed from where pressure is higher toward where it is lower.'],
        ['On a weather map, where are winds strongest?', 'Where the isobars (lines of equal pressure) are closest together', ['Where the isobars are farthest apart', 'At the center of a high', 'Wherever it is coldest'], 'Close isobars mean pressure changes fast over a short distance.'],
        ['What starts most winds?', 'Uneven heating of Earth\'s surface, which makes differences in air pressure', ['The Moon\'s gravity', 'Ocean waves', 'Trees waving their branches'], 'Warm air rises (lower pressure); cool air sinks (higher pressure).']
      ], 'High to low.');
    }
    function tfOne() {
      return tfq(R, [
        ['A north wind blows toward the north.', false, 'A north wind blows from the north, toward the south.'],
        ['Wind blows from high pressure toward low pressure.', true, 'The pressure difference pushes the air.'],
        ['A sea breeze blows from the sea onto the land during the day.', true, 'The land warms faster, so air rises over it and sea air flows in.'],
        ['A wind vane points in the direction the wind is going.', false, 'A wind vane points into the wind, toward where it comes from.']
      ], 'Named for where it comes from.');
    }
    return lv(R, ctx, [name, breeze, flow], [name, toward, breeze, flow], [toward, breeze, tfOne, name]);
  });

  G('earthsci.global-winds', function (R, ctx) {
    function belt() {
      var K = R.pick([[10, 'N', 'The northeast trade winds'], [15, 'S', 'The southeast trade winds'], [20, 'N', 'The northeast trade winds'], [45, 'N', 'The westerlies'], [40, 'S', 'The westerlies'], [50, 'N', 'The westerlies'], [70, 'N', 'The polar easterlies'], [75, 'S', 'The polar easterlies']]);
      var all = ['The northeast trade winds', 'The southeast trade winds', 'The westerlies', 'The polar easterlies'];
      return pr('Which wind belt usually blows at the surface at ' + K[0] + '° ' + K[1] + '?', mc(K[2], all.filter(function (x) { return x !== K[2]; })), [
        'Trade winds: between the equator and 30°. Westerlies: 30° to 60°. Polar easterlies: 60° to 90°.',
        K[0] + '° ' + K[1] + ': ' + K[2].toLowerCase() + '.'
      ], 'Which 30° band is it in?', { vk: 'gw-belt', lat: K[0], h: K[1] });
    }
    function bend() {
      var n = R.coin();
      return pr('In the ' + (n ? 'Northern' : 'Southern') + ' Hemisphere, which way does Earth\'s spin bend large-scale moving air (seen from the ground, looking the way the air moves)?', mc(n ? 'To the right' : 'To the left', [n ? 'To the left' : 'To the right', 'Straight up', 'It isn\'t bent at all']), [
        'The Coriolis effect bends moving air to the right in the Northern Hemisphere and to the left in the Southern.',
        n ? 'To the right.' : 'To the left.'
      ], 'Right in the north, left in the south.', { vk: 'concept' });
    }
    function why() {
      return mcq(R, [
        ['Why is there a belt of rising air, clouds and heavy rain near the equator?', 'The Sun heats it most, so warm, moist air rises there.', ['Cold air sinks there.', 'The Moon pulls air up there.', 'Winds from the poles pile up there.'], 'Strong heating makes air rise, cool and rain.'],
        ['Why are many large deserts found near 30° N and 30° S?', 'Air that rose at the equator sinks there, warming and drying out.', ['They are closest to the Sun.', 'Ocean currents never reach them.', 'Winds there are always from the sea.'], 'Sinking air makes high pressure and clear, dry skies.'],
        ['Why do the trade winds north of the equator blow from the northeast instead of from the north?', 'Earth\'s spin bends the air moving toward the equator to the right, toward the west.', ['Mountains turn them.', 'They start at the North Pole.', 'The Moon pulls them west.'], 'The Coriolis effect turns the flow.']
      ], 'Uneven heating plus Earth\'s spin.');
    }
    function tfOne() {
      return tfq(R, [
        ['The Coriolis effect makes sinks drain one way in the north and the other way in the south.', false, 'It is far too weak at that size; it matters only for large, long-lasting motions like winds and hurricanes.'],
        ['Most of the United States lies in the belt of westerlies.', true, 'That is why weather in the U.S. usually moves from west to east.'],
        ['Air rises near the equator and sinks near 30° latitude.', true, 'This loop makes the trade winds and many deserts.'],
        ['The Coriolis effect bends moving air to the left in the Northern Hemisphere.', false, 'It bends to the right in the Northern Hemisphere and to the left in the Southern.']
      ], 'Trades, westerlies, polar easterlies.');
    }
    return lv(R, ctx, [belt, bend, why], [belt, why, tfOne, bend], [belt, tfOne, why]);
  });

  G('earthsci.air-masses-fronts', function (R, ctx) {
    var AM = [['continental polar (cP)', 'cold and dry'], ['maritime polar (mP)', 'cool and moist'], ['maritime tropical (mT)', 'warm and humid'], ['continental tropical (cT)', 'hot and dry']];
    function mass() {
      var K = R.pick([['the frozen land of northern Canada', 0], ['the cold North Pacific Ocean', 1], ['the warm Gulf of Mexico', 2], ['the deserts of northern Mexico', 3], ['the cold North Atlantic Ocean', 1], ['the warm Caribbean Sea', 2], ['Siberia in winter', 0]]);
      return pr('An air mass forms over ' + K[0] + '. What kind is it?', mc(cap(AM[K[1]][0]) + ': ' + AM[K[1]][1], AM.filter(function (a, i) { return i !== K[1]; }).map(function (a) { return cap(a[0]) + ': ' + a[1]; })), [
        'Over land: continental (dry). Over ocean: maritime (moist). Cold region: polar. Warm region: tropical.',
        cap(AM[K[1]][0]) + ': ' + AM[K[1]][1] + '.'
      ], 'Land or water? Cold or warm?', { vk: 'concept' });
    }
    function after() {
      var cold = R.coin();
      return pr('A ' + (cold ? 'cold' : 'warm') + ' front passes your town. What weather should follow?', mc(cold ? 'Cooler, drier air and clearing skies' : 'Warmer, more humid air', [cold ? 'Warmer, more humid air' : 'Cooler, drier air and clearing skies', 'No change at all', 'A week of snow, every time']), [
        cold ? 'Behind a cold front comes the cold air mass that pushed in.' : 'Behind a warm front comes the warm air mass that slid in.',
        cold ? 'Cooler, drier air.' : 'Warmer, more humid air.'
      ], 'What air mass comes in behind the front?', { vk: 'concept' });
    }
    function picture() {
      var cold = R.coin();
      return pr('The cross-section shows a front. Is it a cold front or a warm front?', mc(cold ? 'A cold front' : 'A warm front', [cold ? 'A warm front' : 'A cold front', 'Not a front: the air is mixing evenly']), [
        cold ? 'The cold air pushes in low and steep under the warm air, making tall clouds near the front.' : 'The warm air slides gently up over the cold air, making a long, sloping deck of layered clouds ahead of the front.',
        cold ? 'A cold front.' : 'A warm front.'
      ], 'Is the boundary steep or gently sloping?', { vk: 'af-pic', viz: { name: 'es-weather-map', opts: { mode: 'section', front: cold ? 'cold' : 'warm', quiet: true, lock: true } }, front: cold ? 'cold' : 'warm' });
    }
    function clouds() {
      return mcq(R, [
        ['A line of tall thunderclouds and a short, heavy downpour come with which kind of front?', 'A cold front', ['A warm front', 'No front', 'A high-pressure area'], 'Cold air lifts warm air steeply and fast.'],
        ['Wide sheets of layered clouds and a long, steady rain come with which kind of front?', 'A warm front', ['A cold front', 'A sea breeze', 'A clear high-pressure day'], 'Warm air slides gently up over cold air.'],
        ['On a weather map, a line with blue triangles shows what?', 'A cold front', ['A warm front', 'A river', 'An isobar'], 'Blue triangles point the way the cold front moves.'],
        ['On a weather map, a line with red half-circles shows what?', 'A warm front', ['A cold front', 'A mountain range', 'A hurricane'], 'Red half-circles point the way the warm front moves.']
      ], 'Steep and stormy, or gentle and steady?');
    }
    function tfOne() {
      return tfq(R, [
        ['At a front, warm and cold air quickly mix together.', false, 'The denser cold air stays low and wedges under the warm air, lifting it.'],
        ['Clouds form at fronts because warm air is lifted and cools.', true, 'Cooling makes water vapor condense.'],
        ['A maritime tropical air mass is warm and humid.', true, 'It formed over warm ocean water.'],
        ['Continental air masses are usually moist.', false, 'Air that forms over land is dry; maritime air is moist.']
      ], 'Cold air wedges under warm air.');
    }
    return lv(R, ctx, [mass, after, picture], [picture, mass, clouds, after], [picture, clouds, tfOne, mass]);
  });

  // ---------- g12_climate.js ----------
  // ===================== Unit 12: Oceans and Climate =====================
  G('earthsci.surface-currents', function (R, ctx) {
    var CUR = [['the Gulf Stream, flowing north along the east coast of North America', true], ['the California Current, flowing south along the west coast of North America', false],
      ['the Kuroshio Current, flowing north along the coast of Japan', true], ['the Canary Current, flowing south along the coast of northwest Africa', false],
      ['the Brazil Current, flowing south along the east coast of South America', true], ['the Peru (Humboldt) Current, flowing north along the west coast of South America', false],
      ['the East Australian Current, flowing south along Australia\'s east coast', true], ['the Benguela Current, flowing north along the west coast of southern Africa', false]];
    function warmCold() {
      var K = R.pick(CUR);
      return pr('Is ' + K[0] + ', a warm current or a cool current?', mc(K[1] ? 'Warm: it carries tropical water toward a pole' : 'Cool: it carries water from high latitudes toward the equator', [K[1] ? 'Cool: it carries water from high latitudes toward the equator' : 'Warm: it carries tropical water toward a pole', 'Neither: currents are all the same temperature']), [
        'Currents flowing from the tropics toward a pole are warm; currents flowing toward the equator are cool.',
        K[1] ? 'This one flows away from the equator: warm.' : 'This one flows toward the equator: cool.'
      ], 'Which way is it flowing: toward the equator or away from it?', { vk: 'concept' });
    }
    function gyre() {
      var n = R.coin(), ocean = n ? R.pick(['North Atlantic', 'North Pacific']) : R.pick(['South Atlantic', 'South Pacific', 'Indian Ocean (south of the equator)']);
      return pr('Which way does the big surface-current loop (gyre) in the ' + ocean + ' turn?', mc(n ? 'Clockwise' : 'Counterclockwise', [n ? 'Counterclockwise' : 'Clockwise', 'It changes direction every day with the tides', 'It doesn\'t turn: water flows straight across']), [
        'Winds and Earth\'s spin turn gyres clockwise in the Northern Hemisphere and counterclockwise in the Southern.',
        (n ? 'Northern' : 'Southern') + ' Hemisphere: ' + (n ? 'clockwise.' : 'counterclockwise.')
      ], 'Which hemisphere is it in?', { vk: 'concept' });
    }
    function drive() {
      return mcq(R, [
        ['What mainly drives surface ocean currents?', 'Steady winds blowing over the water', ['The tides', 'The Moon\'s gravity', 'Heat from the sea floor'], 'Winds drag the top layer of water; Earth\'s spin turns it.'],
        ['Why are the coasts of Britain and Norway milder than other places at their latitude?', 'Warm water carried north by the Gulf Stream and North Atlantic Current, and winds off that water', ['They are closer to the Sun.', 'Cold currents keep them warm.', 'They have no winter.'], 'Warm currents carry tropical heat toward the poles.'],
        ['Why are summer days often cool and foggy along the California coast?', 'The cool California Current chills the air above it.', ['The Gulf Stream warms it.', 'Tides bring ice from Alaska every summer.', 'There are no ocean currents there.'], 'Cool water chills the air; its vapor condenses into fog.'],
        ['How do surface currents affect Earth\'s climate overall?', 'They carry heat from the tropics toward the poles.', ['They carry heat from the poles to the tropics.', 'They have no effect on climate.', 'They only move water up and down.'], 'Warm currents move poleward and cool ones return toward the equator.']
      ], 'Wind drives them; they move heat.');
    }
    function tfOne() {
      return tfq(R, [
        ['Tides are the main cause of surface ocean currents.', false, 'Surface currents are driven mainly by steady winds; tides only move water back and forth.'],
        ['Gyres turn clockwise in the Northern Hemisphere.', true, 'And counterclockwise in the Southern Hemisphere.'],
        ['Currents on the western side of an ocean, like the Gulf Stream, tend to be warm.', true, 'They carry water from the tropics toward the poles.'],
        ['Surface currents move only cold water.', false, 'They carry both warm and cool water, moving heat around the globe.']
      ], 'Wind-driven loops that move heat.');
    }
    return lv(R, ctx, [warmCold, gyre, tfOne], [warmCold, drive, gyre], [drive, warmCold, tfOne]);
  });

  G('earthsci.deep-currents', function (R, ctx) {
    function denser() {
      var kind = R.pick(['T', 'S', 'TS']), T1 = R.pick([2, 4, 6, 8]), T2 = T1 + R.pick([8, 10, 12, 15]), S1 = R.pick([34, 35, 36]), S2 = S1 - R.pick([1, 2]);
      var A, B; // A is the denser one
      if (kind === 'T') { A = [T1, S1]; B = [T2, S1]; } else if (kind === 'S') { A = [T1 + 6, S1]; B = [T1 + 6, S2]; } else { A = [T1, S1]; B = [T2, S2]; }
      var swap = R.coin(), X = swap ? B : A, Y = swap ? A : B, ans = swap ? 'Sample 2' : 'Sample 1';
      return pr('Sample 1 is seawater at ' + MQ(X[0], '°C') + ' with ' + N(X[1]) + ' g of salt per kilogram. Sample 2 is at ' + MQ(Y[0], '°C') + ' with ' + N(Y[1]) + ' g/kg. Which is denser and would sink below the other?', mc(ans, [ans === 'Sample 1' ? 'Sample 2' : 'Sample 1', 'They have the same density']), [
        'Colder water is denser; saltier water is denser.',
        (kind === 'T' ? 'Same saltiness, so the colder one is denser.' : kind === 'S' ? 'Same temperature, so the saltier one is denser.' : 'One is both colder and saltier, so it is denser.') + ' ' + ans + '.'
      ], 'Compare temperature, then saltiness.', { vk: 'dc-dense', s1: X, s2: Y });
    }
    function where() {
      return mcq(R, [
        ['Where does most of the water that feeds deep ocean currents sink?', 'Near Greenland in the North Atlantic, and around Antarctica', ['Along the equator', 'In warm, shallow lagoons', 'At the mouths of big rivers'], 'There the surface water gets cold and salty enough to sink.'],
        ['When seawater freezes into sea ice, what happens to the water left below?', 'It gets saltier, so it becomes denser and can sink.', ['It gets fresher and floats.', 'It warms up and rises.', 'Nothing changes.'], 'Ice leaves most of the salt behind.'],
        ['About how long does water take to travel all the way around the global conveyor belt?', 'About 1,000 years', ['About a week', 'About a year', 'About a million years'], 'Deep currents creep very slowly.'],
        ['What drives deep ocean currents?', 'Differences in density from temperature and saltiness', ['Winds at the surface', 'The tides', 'Volcanoes on the sea floor'], 'Dense water sinks and spreads along the bottom.']
      ], 'Cold and salty sinks.');
    }
    function tfOne() {
      return tfq(R, [
        ['Adding salt makes water less dense.', false, 'Dissolved salt adds mass to the same volume, so salty water is denser.'],
        ['The deep ocean water is completely still.', false, 'It moves slowly in currents that circle the globe.'],
        ['Cold, salty water is the densest seawater.', true, 'That is the water that sinks to the ocean floor near the poles.'],
        ['Deep currents carry water from the polar seas toward the equator along the ocean floor.', true, 'Then it slowly rises in other oceans.']
      ], 'Density drives the deep ocean.');
    }
    return lv(R, ctx, [denser, where, tfOne], [denser, where, tfOne], [denser, where]);
  });

  G('earthsci.weather-vs-climate', function (R, ctx) {
    function sort() {
      var K = R.pick([
        ['It is raining in Seattle right now.', 'Weather'], ['Phoenix gets about 20 cm of rain in a typical year.', 'Climate'], ['Yesterday\'s high in Miami was 31 °C.', 'Weather'],
        ['July is usually the hottest month in Chicago.', 'Climate'], ['A thunderstorm is expected this afternoon.', 'Weather'], ['The Sahara is hot and dry most of the year.', 'Climate'],
        ['Fairbanks averages about −20 °C in January.', 'Climate'], ['Fog rolled in this morning.', 'Weather'], ['A cold front will bring snow tomorrow.', 'Weather']
      ]);
      return pr('Is this a statement about weather or climate? "' + K[0] + '"', mc(K[1], [K[1] === 'Weather' ? 'Climate' : 'Weather']), [
        'Weather: one place and time. Climate: the long-term pattern, averaged over about 30 years.',
        K[1] + '.'
      ], 'Is it about right now, or about what usually happens?', { vk: 'concept' });
    }
    function mean() {
      var n = R.pick([4, 5, 5, 6]), base = R.int(-5, 28), vals = []; for (var i = 0; i < n; i++) vals.push(base + R.int(-3, 3));
      var s = vals.reduce(function (a, b) { return a + b; }, 0), m = fix(s / n);
      if (String(m).length > 5) { vals[n - 1] += (n - (s % n + n) % n) % n; s = vals.reduce(function (a, b) { return a + b; }, 0); m = fix(s / n); }
      var month = R.pick(['January', 'April', 'July', 'October']);
      return pr('A town\'s average ' + month + ' temperatures for ' + n + ' years were ' + vals.map(function (v) { return M(N(v)); }).join(', ') + ' °C. What is their mean?', exact(String(m)), [
        'Add them: ' + M(vals.map(function (v) { return v < 0 ? '(' + N(v) + ')' : N(v); }).join(' + ') + ' = ' + N(s)) + '.',
        'Divide by ' + n + ': ' + M(N(s) + ' \\div ' + n + ' = ' + N(m)) + ' °C.'
      ], 'Add the values, then divide by how many there are.', { vk: 'wc-mean', unit: '°C', vals: vals, nolint: ['+ 0'] });
    }
    function range() {
      var lo = R.int(-20, 10), hi = lo + R.int(8, 35);
      return pr('A city\'s coldest month averages ' + MQ(lo, '°C') + ' and its warmest month averages ' + MQ(hi, '°C') + '. What is its annual temperature range?', exact(hi - lo), [
        'Range = warmest − coldest.',
        M(N(hi) + ' - ' + (lo < 0 ? '(' + N(lo) + ')' : N(lo)) + ' = ' + N(hi - lo)) + ' °C.'
      ], 'Subtract the coldest month from the warmest.', { vk: 'wc-range', unit: '°C', lo: lo, hi: hi });
    }
    function tfOne() {
      return tfq(R, [
        ['One unusually cold week proves the climate is not warming.', false, 'A week is weather; climate is about averages over decades.'],
        ['Climate normals are usually 30-year averages.', true, 'NOAA\'s current normals cover 1991 to 2020.'],
        ['Weather can change from hour to hour.', true, 'Weather is the state of the air at one time and place.'],
        ['A place\'s climate is the weather on one particular day.', false, 'Climate is the long-term pattern of weather.']
      ], 'Weather is now; climate is the long-term pattern.');
    }
    return lv(R, ctx, [sort, mean, sort], [mean, sort, range, tfOne], [mean, range, tfOne]);
  });

  G('earthsci.climate-factors', function (R, ctx) {
    function elev() {
      var T0 = R.pick([16, 18, 20, 22, 24, 26, 28, 30]), km = R.pick([1, 1.5, 2, 2.5, 3, 4]), T1 = fix(T0 - 6.5 * km);
      return pr('A town at sea level averages ' + MQ(T0, '°C') + ' in summer. Temperature drops about 6.5 °C for each kilometer of height. About what is the average in a mountain village ' + MQ(km * 1000, 'm') + ' high nearby?', num(T1, 0.02), [
        MQ(km * 1000, 'm') + ' = ' + N(km) + ' km. Cooling: ' + M(N(km) + ' \\times 6.5 = ' + N(fix(6.5 * km))) + ' °C.',
        M(N(T0) + ' - ' + N(fix(6.5 * km)) + ' = ' + N(T1)) + ' °C.'
      ], 'Change meters to kilometers, then multiply by 6.5.', { vk: 'cf-elev', unit: '°C', T0: T0, km: km });
    }
    function coast() {
      var a = R.int(8, 15), b = a + R.int(12, 25);
      var coastal = R.coin() ? 'A' : 'B', ra = coastal === 'A' ? a : b, rb = coastal === 'A' ? b : a;
      return pr('Two towns are at the same latitude. Town A\'s warmest and coldest months differ by ' + MQ(ra, '°C') + '; town B\'s differ by ' + MQ(rb, '°C') + '. Which town is more likely on the coast?', mc('Town ' + coastal, ['Town ' + (coastal === 'A' ? 'B' : 'A'), 'Neither: latitude decides it']), [
        'Water warms and cools slowly, so coastal towns have smaller temperature swings.',
        'The smaller range, ' + MQ(MA.min(ra, rb), '°C') + ', belongs to town ' + coastal + '.'
      ], 'Which town has the smaller swing?', { vk: 'cf-coast', ra: ra, rb: rb, ans: coastal });
    }
    function shadow() {
      return mcq(R, [
        ['Moist winds blow from the ocean over a mountain range. Which side is usually wetter?', 'The side facing the wind (windward), where air rises and cools', ['The far side (leeward), in the rain shadow', 'Both sides get the same rain', 'Neither side ever gets rain'], 'Rising air cools and drops its moisture on the windward side.'],
        ['Why is eastern Washington much drier than Seattle, west of the Cascade Mountains?', 'It lies in the rain shadow: the air dropped its moisture on the western slopes.', ['It is closer to the equator.', 'It is next to a warm current.', 'It is at sea level.'], 'Air crossing the mountains has already lost its water.'],
        ['A city lies next to a cold ocean current. What effect does that usually have?', 'Cooler summers than inland places at the same latitude', ['Hotter summers', 'Heavier snow every summer', 'No effect at all'], 'Cool water chills the air above it.'],
        ['Quito, Ecuador, is almost on the equator, yet it is cool all year. What best explains it?', 'Its high elevation, about 2,800 m', ['Its distance from the Sun', 'A warm ocean current', 'Its latitude'], 'Higher places are cooler, about 6.5 °C per kilometer.']
      ], 'Check each factor: latitude, elevation, water, currents, mountains, winds.');
    }
    function tfOne() {
      return tfq(R, [
        ['Places at the same latitude always have the same climate.', false, 'Elevation, nearness to the ocean, currents and mountains can make them very different.'],
        ['Coastal places usually have milder winters than inland places at the same latitude.', true, 'The ocean warms and cools slowly.'],
        ['Higher places are usually cooler than lower places nearby.', true, 'About 6.5 °C cooler per kilometer of height.'],
        ['The leeward side of a mountain range is usually the rainy side.', false, 'The windward side gets the rain; the leeward side is in the rain shadow.']
      ], 'Latitude is only the starting point.');
    }
    return lv(R, ctx, [elev, coast, shadow], [elev, coast, shadow, tfOne], [elev, shadow, coast, tfOne]);
  });

  G('earthsci.greenhouse-effect', function (R, ctx) {
    function gas() {
      var right = R.pick(['Carbon dioxide (CO₂)', 'Water vapor (H₂O)', 'Methane (CH₄)', 'Nitrous oxide (N₂O)']);
      return pr('Which of these is a greenhouse gas?', mc(right, ['Nitrogen (N₂)', 'Oxygen (O₂)', 'Argon (Ar)']), [
        'Greenhouse gases absorb infrared light; molecules with three or more atoms, like CO₂, H₂O and CH₄, can.',
        'Nitrogen, oxygen and argon let infrared pass through. ' + right + ' is a greenhouse gas.'
      ], 'Which molecule has three or more atoms?', { vk: 'concept' });
    }
    function steps() {
      var S = ['Sunlight passes through the air and warms the ground.', 'The warm ground gives off infrared light.', 'Greenhouse gases absorb some of the infrared.', 'The gases send part of that energy back down, warming the surface more.'];
      var i = R.int(0, 2);
      return pr('In the greenhouse effect, what happens right after this step: "' + S[i] + '"?', mc(S[i + 1], S.filter(function (s, j) { return j !== i + 1 && j !== i; }).concat(['The ozone layer blocks the infrared.'])), [
        'The order: sunlight warms the ground; the ground gives off infrared; greenhouse gases absorb some; they send part back down.',
        'Next: ' + S[i + 1].charAt(0).toLowerCase() + S[i + 1].slice(1)
      ], 'Follow the energy from the Sun to the ground and back up.', { vk: 'concept' });
    }
    function diff() {
      var K = R.pick([[15, -18, 'Earth'], [14, -19, 'a model Earth'], [12, -20, 'a model planet'], [20, -10, 'a model planet with a thicker atmosphere']]);
      return pr('With its greenhouse gases, ' + K[2] + ' averages about ' + MQ(K[0], '°C') + '. Without them, it would average about ' + MQ(K[1], '°C') + '. How many degrees of warming do the greenhouse gases provide?', exact(K[0] - K[1]), [
        M(N(K[0]) + ' - (' + N(K[1]) + ') = ' + N(K[0]) + ' + ' + N(-K[1]) + ' = ' + N(K[0] - K[1])) + '.',
        'About ' + N(K[0] - K[1]) + ' °C.'
      ], 'Subtracting a negative number adds it.', { vk: 'gh-diff', unit: '°C', hi: K[0], lo: K[1] });
    }
    function what() {
      return mcq(R, [
        ['What kind of light do greenhouse gases mainly absorb?', 'Infrared light given off by the warm surface', ['Incoming visible sunlight', 'Ultraviolet light from the Sun', 'Radio waves'], 'Sunlight passes through; the outgoing infrared is absorbed.'],
        ['How is the greenhouse effect different from the ozone hole?', 'The greenhouse effect is about gases absorbing infrared; the ozone hole is thinning of the ozone that absorbs ultraviolet.', ['They are the same thing.', 'The ozone hole lets greenhouse gases escape.', 'The greenhouse effect only happens over Antarctica.'], 'They are separate topics with separate causes.'],
        ['What happens to Earth\'s surface temperature as more carbon dioxide is added to the air?', 'It rises, because more outgoing infrared is absorbed.', ['It falls.', 'It stays the same.', 'It rises only at night.'], 'The surface must warm to send the same energy back to space.']
      ], 'Infrared out, absorbed, partly sent back down.');
    }
    function tfOne() {
      return tfq(R, [
        ['Greenhouse gases trap incoming sunlight.', false, 'Sunlight mostly passes through; the gases absorb the infrared the warm surface gives off.'],
        ['Without any greenhouse effect, Earth would be far colder than it is.', true, 'About −18 °C on average instead of about 15 °C.'],
        ['The greenhouse effect and the ozone hole are the same thing.', false, 'The ozone hole is thinning of stratospheric ozone; the greenhouse effect is about infrared.'],
        ['Water vapor is a greenhouse gas.', true, 'It absorbs infrared, like carbon dioxide and methane.']
      ], 'Infrared, not sunlight.');
    }
    return lv(R, ctx, [gas, what, diff], [steps, diff, gas, what], [steps, tfOne, diff, what]);
  });

  G('earthsci.climate-change-evidence', function (R, ctx) {
    var MLO = [[1960, 317], [1970, 326], [1980, 339], [1990, 354], [2000, 370], [2010, 390], [2020, 414]];
    function rate() {
      var i = R.int(0, 4), j = R.int(i + 1, 6), a = MLO[i], b = MLO[j], r = (b[1] - a[1]) / (b[0] - a[0]);
      return pr('Carbon dioxide measured at Mauna Loa, Hawaii, was about ' + a[1] + ' ppm in ' + a[0] + ' and about ' + b[1] + ' ppm in ' + b[0] + ' (NOAA, rounded). What was the average rise per year?', num(r, 0.02), [
        'Change: ' + M(b[1] + ' - ' + a[1] + ' = ' + (b[1] - a[1])) + ' ppm. Time: ' + M(b[0] + ' - ' + a[0] + ' = ' + (b[0] - a[0])) + ' years.',
        'Rate: ' + M((b[1] - a[1]) + ' \\div ' + (b[0] - a[0]) + ' \\approx ' + N(rnd(r, 2))) + ' ppm per year.'
      ], 'Change in ppm ÷ change in years.', { vk: 'ce-rate', unit: 'ppm/yr', a: a, b: b });
    }
    function pct() {
      var b = R.pick([340, 350, 370, 392, 406, 420]), inc = b - 280, p = fix(rnd(inc / 280 * 100, 1));
      return pr('Before the 1800s, carbon dioxide was about 280 ppm. By what percent had it risen when it reached ' + b + ' ppm?', { t: 'num', v: String(p), rtol: 0.02, pct: true }, [
        'Increase: ' + M(b + ' - 280 = ' + inc) + ' ppm.',
        'Percent: ' + M(inc + ' \\div 280 \\approx ' + N(rnd(inc / 280, 3))) + ', about ' + N(p) + '%.'
      ], 'Divide the increase by the starting amount.', { vk: 'ce-pct', b: b });
    }
    function decades() {
      var base = R.pick([0.1, 0.2, 0.3, 0.4]), d = R.pick([0.1, 0.2, 0.3]);
      var A = [], B = []; for (var i = 0; i < 5; i++) { A.push(fix(base + R.int(-2, 2) / 10)); B.push(fix(base + d + R.int(-2, 2) / 10)); }
      var ma = fix(A.reduce(function (s, v) { return s + v; }, 0) / 5), mb = fix(B.reduce(function (s, v) { return s + v; }, 0) / 5), diff = fix(rnd(mb - ma, 2));
      return pr('Made-up yearly temperature differences from a long-term average (°C), five years in each group. Earlier years: ' + A.map(function (v) { return M(N(v)); }).join(', ') + '. Later years: ' + B.map(function (v) { return M(N(v)); }).join(', ') + '. How much warmer is the later group\'s mean than the earlier group\'s?', { t: 'num', v: String(diff), tol: 0.005 }, [
        'Earlier mean: ' + M(N(fix(A.reduce(function (s, v) { return s + v; }, 0))) + ' \\div 5 = ' + N(ma)) + '. Later mean: ' + M(N(fix(B.reduce(function (s, v) { return s + v; }, 0))) + ' \\div 5 = ' + N(mb)) + '.',
        'Difference: ' + M(N(mb) + ' - ' + (ma < 0 ? '(' + N(ma) + ')' : N(ma)) + ' = ' + N(diff)) + ' °C. Single years bounce around; the means show the trend.'
      ], 'Find each group\'s mean, then subtract.', { vk: 'ce-dec', unit: '°C', A: A, B: B });
    }
    function sea() {
      var cm = R.pick([18, 20, 21]), y0 = 1901, y1 = 2018, mm = cm * 10, r = mm / (y1 - y0);
      return pr('Global sea level rose about ' + cm + ' cm between ' + y0 + ' and ' + y1 + ' (IPCC, rounded). What was the average rise per year, in millimeters?', num(r, 0.02), [
        cm + ' cm = ' + mm + ' mm. Years: ' + M(y1 + ' - ' + y0 + ' = ' + (y1 - y0)) + '.',
        M(mm + ' \\div ' + (y1 - y0) + ' \\approx ' + N(rnd(r, 2))) + ' mm per year.'
      ], 'Change cm to mm, then divide by the years.', { vk: 'ce-sea', unit: 'mm/yr', cm: cm });
    }
    function evid() {
      return mcq(R, [
        ['Which is evidence that Earth has warmed over the last century?', 'Glaciers around the world are shrinking.', ['One winter was colder than usual.', 'It snowed in April one year.', 'A single cool summer in one city'], 'Long-term, worldwide changes are evidence; single events are weather.'],
        ['Why do scientists look at averages over decades instead of single years?', 'Single years bounce up and down; averages reveal the long-term trend.', ['Single years are never measured.', 'Decades are easier to remember.', 'Temperature only changes once a decade.'], 'Averaging cancels out short-term ups and downs.'],
        ['About how much warmer was Earth in 2011–2020 than in 1850–1900?', 'About 1.1 °C', ['About 11 °C', 'About 0.01 °C', 'It was cooler'], 'IPCC: about 1.1 °C.'],
        ['What does the IPCC conclude caused most of the recent warming?', 'Human activities, mainly burning fossil fuels', ['Changes in the Sun alone', 'Volcanoes alone', 'Natural ups and downs alone'], 'IPCC (2021): it is unequivocal that human influence has warmed the climate.']
      ], 'Many records, long averages.');
    }
    function tfOne() {
      return tfq(R, [
        ['A single cold year shows that global warming has stopped.', false, 'Years bounce up and down; the trend shows in averages over decades.'],
        ['Carbon dioxide in the air has risen by about half since before the 1800s.', true, 'From about 280 ppm to above 420 ppm.'],
        ['Global sea level has been rising.', true, 'About 20 cm from 1901 to 2018.'],
        ['Each of the last four decades was warmer than any decade before it since 1850.', true, 'That is a finding of the IPCC (2021).']
      ], 'Look at decades, not single years.');
    }
    return lv(R, ctx, [evid, pct, tfOne], [rate, pct, decades, evid], [rate, decades, sea, pct]);
  });

  // ---------- g13_people.js ----------
  // ===================== Unit 13: Resources and People =====================
  G('earthsci.natural-resources', function (R, ctx) {
    function kind() {
      var K = R.pick([['sunlight', true], ['wind', true], ['coal', false], ['oil', false], ['natural gas', false], ['copper ore', false], ['iron ore', false], ['timber from a forest that is replanted', true], ['flowing river water used to make electricity', true], ['uranium ore for nuclear power plants', false], ['a field of wheat replanted each year', true]]);
      return pr('Is ' + K[0] + ' a renewable or a nonrenewable resource?', mc(K[1] ? 'Renewable: nature replaces it within a human lifetime' : 'Nonrenewable: it took millions of years to form', [K[1] ? 'Nonrenewable: it took millions of years to form' : 'Renewable: nature replaces it within a human lifetime']), [
        'Ask how fast nature makes more of it.',
        K[1] ? cap(K[0]) + ' is replaced quickly: renewable.' : cap(K[0]) + ' formed over millions of years: nonrenewable.'
      ], 'Could nature replace it in your lifetime?', { vk: 'concept' });
    }
    function last() {
      var use = R.pick([5, 10, 20, 25, 40, 50]), yrs = R.pick([10, 20, 30, 40, 50, 80, 100]), res = use * yrs, what = R.pick(['a mineral', 'coal', 'an ore', 'oil (in millions of barrels)']);
      return pr('A region has about ' + N(res) + ' million tonnes of ' + what + ' it can mine and uses ' + N(use) + ' million tonnes a year. At that rate, about how many years will it last?', exact(yrs), [
        'Years = amount available ÷ amount used each year.',
        M(N(res) + ' \\div ' + N(use) + ' = ' + N(yrs)) + ' years.'
      ], 'Divide the supply by the yearly use.', { vk: 'nr-last', unit: 'years', res: res, use: use });
    }
    function budget() {
      var rin = R.pick([1, 2, 3, 4, 5, 6]), out = R.pick([1, 2, 3, 5, 7, 8, 10]); if (rin === out) out = rin + 2;
      var d = rin - out;
      return pr('An aquifer gains about ' + rin + ' million m³ of water a year from rain soaking in, and wells pump out ' + out + ' million m³ a year. What is the yearly change in the water stored, in million m³? (Use a negative number for a loss.)', exact(d), [
        'Change = water in − water out.',
        M(rin + ' - ' + out + ' = ' + d) + ' million m³ per year: ' + (d < 0 ? 'the aquifer is shrinking, and the water table drops.' : 'the aquifer is filling up.')
      ], 'In minus out.', { vk: 'nr-budget', unit: 'million m³', rin: rin, out: out });
    }
    function form() {
      return mcq(R, [
        ['Where did most oil and natural gas come from?', 'Tiny sea creatures buried in sediment and slowly cooked by Earth\'s heat over millions of years', ['Dinosaur bones', 'Lava from volcanoes', 'Rainwater soaking into rock'], 'Plankton on the sea floor became oil and gas.'],
        ['Where did much of the world\'s coal come from?', 'Swamp plants buried about 300 million years ago', ['Ocean salt', 'Cooled magma', 'Ancient glaciers'], 'Thick layers of plant remains were squeezed into coal.'],
        ['Why are metal ores found only in certain places?', 'They formed only where particular geologic processes, such as hot water near magma, concentrated metals.', ['People placed them there.', 'They are spread evenly through all rock.', 'They fall from space.'], 'Geology decides where resources are.'],
        ['Why can pumping some aquifers use up their water?', 'Some aquifers refill only over thousands of years, much slower than wells pump.', ['Water in aquifers evaporates quickly.', 'Aquifers refill every night.', 'Pumping makes more water.'], 'Use faster than recharge lowers the water table.']
      ], 'How fast does nature replace it?');
    }
    function tfOne() {
      return tfq(R, [
        ['Natural resources like oil and metal ores are spread evenly around the world.', false, 'They are found only where past geologic processes put them.'],
        ['All groundwater refills within a few years.', false, 'Some aquifers take thousands of years to refill.'],
        ['Fossil fuels are nonrenewable.', true, 'They took millions of years to form.'],
        ['Wind and sunlight are renewable energy resources.', true, 'They are replaced continuously.']
      ], 'Renewable means replaced within a lifetime.');
    }
    return lv(R, ctx, [kind, form, last], [last, budget, kind, form], [budget, last, tfOne, form]);
  });

  G('earthsci.human-impact', function (R, ctx) {
    function total() {
      var p = R.pick([2000, 5000, 10000, 20000, 50000, 100000]), u = R.pick([100, 150, 200, 250, 300, 400]), t = p * u;
      var p0 = pr('A town of ' + N(p) + ' people uses about ' + MQ(u, 'L') + ' of water per person each day. How many liters does the town use in a day?', exact(t), [
        'Total = people × use per person.',
        M(N(p) + ' \\times ' + N(u) + ' = ' + N(t)) + ' L.'
      ], 'Multiply the number of people by each person\'s use.', { vk: 'hi-total', unit: 'L', p: p, u: u });
      if (ctx.level === 1) p0.viz = { name: 'earthsci-impact', opts: { people: p / 1000, use: u, pUnit: 'thousand people', uUnit: 'L per person', tUnit: 'thousand L', quiet: true, lock: true } };
      return p0;
    }
    function per() {
      var p = R.pick([4, 5, 8, 10, 20]), u = R.pick([2, 3, 4, 5, 6, 8, 10]), t = p * u;
      return pr('A country of ' + p + ' million people uses ' + t + ' million tonnes of a resource a year. What is the use per person, in tonnes per year?', exact(u), [
        'Use per person = total ÷ people.',
        M(t + ' \\div ' + p + ' = ' + u) + ' tonnes per person per year.'
      ], 'Divide the total by the number of people.', { vk: 'hi-per', unit: 't', p: p, t: t });
    }
    function change() {
      var a = R.pick([10, 20, 25, 50]), b = R.pick([10, 20, 25, 40, 50]), up = R.coin();
      var fp = 1 + a / 100, fu = up ? 1 + b / 100 : 1 - b / 100, f = fix(fp * fu), pc = fix(rnd(f * 100, 2));
      return pr('A city\'s population grows by ' + a + '% while each person\'s energy use ' + (up ? 'also grows' : 'falls') + ' by ' + b + '%. The new total energy use is what percent of the old total?', { t: 'num', v: String(pc), rtol: 0.005, pct: true }, [
        'People × ' + N(fp) + '; use per person × ' + N(fu) + '.',
        'Total × ' + M(N(fp) + ' \\times ' + N(fu) + ' = ' + N(f)) + ', which is ' + N(pc) + '% of the old total.'
      ], 'Multiply the two growth factors.', { vk: 'hi-change', a: a, b: b, up: up });
    }
    function which() {
      return mcq(R, [
        ['Total use = people × use per person. Which change would lower the total for sure?', 'Fewer people and less use per person', ['More people and less use per person', 'More people and the same use per person', 'Fewer people and more use per person'], 'Only when neither factor grows is the total sure to fall.'],
        ['A population doubles while use per person is cut in half. What happens to the total?', 'It stays the same.', ['It doubles.', 'It is cut in half.', 'It becomes four times as big.'], M('2 \\times \\tfrac{1}{2} = 1') + ': the changes cancel.'],
        ['Both the number of people and the use per person double. What happens to the total?', 'It becomes four times as big.', ['It doubles.', 'It stays the same.', 'It triples.'], M('2 \\times 2 = 4') + '.']
      ], 'The two factors multiply.');
    }
    function tfOne() {
      return tfq(R, [
        ['Human impact depends only on how many people there are.', false, 'It depends on the number of people times the use per person.'],
        ['If use per person falls while the population grows, the total can stay the same.', true, 'The two changes multiply and can cancel.'],
        ['Using water more efficiently lowers the use per person.', true, 'That is one of the two factors in the total.'],
        ['If both the population and use per person grow, the total grows even faster than either one.', true, 'The growth factors multiply.']
      ], 'Total = people × use per person.');
    }
    return lv(R, ctx, [total, which, per], [total, per, change, which], [change, per, tfOne]);
  });

})(window.MathLadder);
