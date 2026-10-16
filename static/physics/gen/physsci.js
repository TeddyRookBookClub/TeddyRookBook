/* Physics Ladder, Physical Science (physsci): problem generators for every topic.
   Built from /tmp/work_physsci/src/g*.js by build.js; edit the sources, not this file. g = 9.8 N/kg. */
(function (ML) {
  'use strict';
  // ---------- g0_head.js ----------
  var G = ML.gen, T = ML.T, U = ML.util, MA = Math;
  var GRAV = 9.8; // N/kg near Earth's surface
  function fix(x) { return U.fix(x); }
  function rnd(x, dp) { return U.round(x, dp); }
  function sig(x, s) { if (!x) return 0; var e = MA.floor(MA.log10(MA.abs(x))), p = MA.pow(10, s - 1 - e); return fix(MA.round(x * p) / p); }
  // a number as TeX: no float noise, thousands commas from 1,000 up
  function N(x) { x = fix(x); return MA.abs(x) >= 1000 ? T.commas(x) : T.num(x); }
  // a unit as TeX ('m/s²' -> \mathrm{m/s^2}); Q(x, u) a quantity
  function uT(u) {
    if (u === '°C') return '^{\\circ}\\mathrm{C}';
    return '\\mathrm{' + u.replace(/²/g, '^2').replace(/³/g, '^3').replace(/Ω/g, '\\Omega').replace(/·/g, '\\cdot ').replace(/μ/g, '\\mu ') + '}';
  }
  function Q(x, u) { return N(x) + (u === '°C' ? '' : '\\,') + uT(u); }
  function M(s) { return '$' + s + '$'; } // inline math
  function MQ(x, u) { return M(Q(x, u)); } // a quantity in inline math
  // answer specs
  function vstr(x) { x = fix(x); if (Number.isInteger(x)) return String(x); var s = String(x); return s.length > 9 ? String(sig(x, 4)) : s; }
  function num(x, rtol) { return { t: 'num', v: vstr(x), rtol: rtol == null ? 0.01 : rtol }; }
  function mc(right, wrongs) { return U.mc(right, wrongs, 4); }
  function mcAll(right, wrongs) { return U.mc(right, wrongs, 1 + wrongs.length); }
  function tf(v) { return { t: 'tf', v: !!v }; }
  // a problem: q, a, steps, hint, and extras (unit, viz, vk = the kind of check verify.js applies)
  function pr(q, a, steps, hint, x) { var p = { q: q, a: a, steps: steps, hint: hint }; if (x) for (var k in x) p[k] = x[k]; return p; }
  // pick one of several problem makers by level: lv(ctx, [makers at 1], [at 2], [at 3])
  function lv(R, ctx, a, b, c) { var list = ML.byLevel(ctx, a, b, c); return R.pick(list)(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var NAMES = ['Maya', 'Leo', 'Ana', 'Sam', 'Priya', 'Jamal', 'Kenji', 'Rosa', 'Omar', 'Lily', 'Diego', 'Nora', 'Eli', 'Zara', 'Ben', 'Mei'];
  function nm(R) { return R.pick(NAMES); }
  function frac(n, d) { return '\\dfrac{' + n + '}{' + d + '}'; }
  // "a" or "an" before a number: an 8, an 11, an 18, an 80, an 11,000; a 7, a 110
  function an(x) { var i = String(MA.floor(MA.abs(fix(x)))), lead = i.length % 3 === 0 ? i.slice(0, 3) : i.slice(0, i.length % 3); return (i.charAt(0) === '8' || lead === '11' || lead === '18') ? 'an' : 'a'; }
  function aQ(x, u) { return an(x) + ' ' + MQ(x, u); }

  // ---------- g1_motion.js ----------
  // ===================== Unit 1: Describing Motion =====================
  function stepPick(R, lo, hi, st) { return lo + st * R.int(0, MA.round((hi - lo) / st)); }
  var MOVERS_MS = [
    { w: 'runner', v: [3, 8, 1], t: [20, 80, 5] }, { w: 'cyclist', v: [5, 12, 1], t: [30, 120, 10] },
    { w: 'toy car', v: [2, 6, 1], t: [3, 12, 1] }, { w: 'drone', v: [6, 15, 1], t: [10, 40, 5] },
    { w: 'skateboarder', v: [3, 7, 1], t: [10, 60, 5] }, { w: 'horse', v: [8, 14, 1], t: [20, 90, 10] }
  ];
  var MOVERS_KMH = [
    { w: 'car', v: [40, 110, 5], t: [2, 5, 1] }, { w: 'train', v: [80, 240, 20], t: [2, 4, 1] },
    { w: 'jet', v: [600, 900, 50], t: [2, 6, 1] }, { w: 'bus', v: [30, 70, 5], t: [2, 4, 1] }
  ];
  function mover(R, kmh) {
    var m = R.pick(kmh ? MOVERS_KMH : MOVERS_MS), v = stepPick(R, m.v[0], m.v[1], m.v[2]), t = stepPick(R, m.t[0], m.t[1], m.t[2]);
    return { w: m.w, v: v, t: t, d: v * t, du: kmh ? 'km' : 'm', tu: kmh ? 'h' : 's', vu: kmh ? 'km/h' : 'm/s' };
  }
  G('physsci.speed', function (R, ctx) {
    function findS() {
      var m = mover(R, R.chance(0.35));
      return pr('A ' + m.w + ' covers ' + MQ(m.d, m.du) + ' in ' + MQ(m.t, m.tu) + '. What is its average speed?', num(m.v), [
        'Average speed is distance divided by time: ' + M('s = \\dfrac{d}{t}') + '.',
        M('s = \\dfrac{' + Q(m.d, m.du) + '}{' + Q(m.t, m.tu) + '} = ' + Q(m.v, m.vu)) + '.'
      ], 'Divide the distance by the time.', { unit: m.vu, vk: 'div' });
    }
    function findD() {
      var m = mover(R, R.chance(0.5));
      return pr('A ' + m.w + ' moves at an average speed of ' + MQ(m.v, m.vu) + ' for ' + MQ(m.t, m.tu) + '. How far does it go?', num(m.d), [
        'Rearrange ' + M('s = \\dfrac{d}{t}') + ' to ' + M('d = s\\,t') + '.',
        M('d = ' + Q(m.v, m.vu) + ' \\times ' + Q(m.t, m.tu) + ' = ' + Q(m.d, m.du)) + '.'
      ], 'Distance = speed × time.', { unit: m.du, vk: 'mul' });
    }
    function findT() {
      var m = mover(R, R.chance(0.5));
      return pr('How long does it take a ' + m.w + ' moving at an average speed of ' + MQ(m.v, m.vu) + ' to cover ' + MQ(m.d, m.du) + '?', num(m.t), [
        'Rearrange ' + M('s = \\dfrac{d}{t}') + ' to ' + M('t = \\dfrac{d}{s}') + '.',
        M('t = \\dfrac{' + Q(m.d, m.du) + '}{' + Q(m.v, m.vu) + '} = ' + Q(m.t, m.tu)) + '.'
      ], 'Time = distance ÷ speed.', { unit: m.tu, vk: 'divr' });
    }
    function trip() { // two legs given as distances and times
      var kmh = R.coin(), w = kmh ? R.pick(['car', 'bus', 'delivery van']) : R.pick(['runner', 'cyclist', 'robot']);
      var t1 = kmh ? R.int(1, 3) : stepPick(R, 20, 60, 10), t2 = kmh ? R.int(1, 3) : stepPick(R, 20, 60, 10);
      var v1 = kmh ? stepPick(R, 30, 100, 10) : R.int(2, 8), v2 = kmh ? stepPick(R, 30, 100, 10) : R.int(2, 8);
      if (v1 === v2) v2 += kmh ? 20 : 2;
      var du = kmh ? 'km' : 'm', tu = kmh ? 'h' : 's', vu = kmh ? 'km/h' : 'm/s', d1 = v1 * t1, d2 = v2 * t2, D = d1 + d2, Tt = t1 + t2, avg = D / Tt;
      return pr('A ' + w + ' goes ' + MQ(d1, du) + ' in ' + MQ(t1, tu) + ', then ' + MQ(d2, du) + ' in ' + MQ(t2, tu) + '. What is the average speed for the whole trip?', num(sig(avg, 3)), [
        'Total distance: ' + M(N(d1) + ' + ' + N(d2) + ' = ' + Q(D, du)) + '.',
        'Total time: ' + M(N(t1) + ' + ' + N(t2) + ' = ' + Q(Tt, tu)) + '.',
        'Average speed: ' + M('\\dfrac{' + Q(D, du) + '}{' + Q(Tt, tu) + '} ' + (Number.isInteger(fix(avg)) ? '= ' : '\\approx ') + Q(sig(avg, 3), vu)) + '.'
      ], 'Divide the total distance by the total time.', { unit: vu, vk: 'trip' });
    }
    function tripS() { // two legs given as distances and speeds: the trap
      var kmh = R.coin(), w = kmh ? R.pick(['car', 'bus', 'truck']) : R.pick(['cyclist', 'rowing boat', 'robot']);
      var pairs = kmh ? [[30, 60], [40, 60], [20, 60], [60, 90], [40, 120], [30, 90], [45, 90], [50, 75]] : [[2, 4], [3, 6], [4, 6], [2, 6], [3, 4], [4, 12], [6, 12], [5, 10]];
      var pq = R.pick(pairs), s1 = pq[0], s2 = pq[1]; if (R.coin()) { s1 = pq[1]; s2 = pq[0]; }
      var L = U.lcm(s1, s2) * (kmh ? R.int(1, 2) : stepPick(R, 5, 20, 5)), d1 = L, d2 = L;
      if (R.chance(0.3)) d2 = L * 2;
      var du = kmh ? 'km' : 'm', tu = kmh ? 'h' : 's', vu = kmh ? 'km/h' : 'm/s', t1 = d1 / s1, t2 = d2 / s2, D = d1 + d2, Tt = t1 + t2, avg = D / Tt;
      return pr('A ' + w + ' goes ' + MQ(d1, du) + ' at ' + MQ(s1, vu) + ', then ' + MQ(d2, du) + ' at ' + MQ(s2, vu) + '. What is the average speed for the whole trip?', num(sig(avg, 3)), [
        'Time for the first part: ' + M('t_1 = \\dfrac{' + Q(d1, du) + '}{' + Q(s1, vu) + '} = ' + Q(t1, tu)) + '.',
        'Time for the second part: ' + M('t_2 = \\dfrac{' + Q(d2, du) + '}{' + Q(s2, vu) + '} = ' + Q(t2, tu)) + '.',
        'Total distance ' + MQ(D, du) + ', total time ' + MQ(Tt, tu) + '.',
        'Average speed: ' + M('\\dfrac{' + Q(D, du) + '}{' + Q(Tt, tu) + '} ' + (Number.isInteger(fix(avg)) ? '= ' : '\\approx ') + Q(sig(avg, 3), vu)) + '. (Averaging the two speeds would give ' + MQ((s1 + s2) / 2, vu) + ', which is wrong because the times are different.)'
      ], 'Find the time for each part first, then divide total distance by total time.', { unit: vu, vk: 'tripS' });
    }
    function conv() {
      if (R.coin()) {
        var v = R.int(2, 30), w = R.pick(['sprinter', 'deer', 'cyclist', 'kangaroo', 'speedboat']);
        return pr('A ' + w + ' moves at ' + MQ(v, 'm/s') + '. What is this speed in km/h?', num(v * 3.6), [
          'In one hour (3,600 s) it would go ' + M(N(v) + ' \\times 3{,}600 = ' + Q(v * 3600, 'm')) + '.',
          'That is ' + MQ(v * 3.6, 'km') + ' each hour, so ' + MQ(v * 3.6, 'km/h') + '. (Shortcut: multiply m/s by 3.6.)'
        ], 'There are 3,600 seconds in an hour and 1,000 meters in a kilometer.', { unit: 'km/h', vk: 'x3.6' });
      }
      var k = R.pick([18, 36, 54, 72, 90, 108, 126, 144]), w2 = R.pick(['car', 'train', 'motorcycle', 'bus']);
      return pr('A ' + w2 + ' travels at ' + MQ(k, 'km/h') + '. What is this speed in m/s?', num(k / 3.6), [
        M(Q(k, 'km/h')) + ' means ' + MQ(k * 1000, 'm') + ' in ' + MQ(3600, 's') + '.',
        M('\\dfrac{' + N(k * 1000) + '\\,\\mathrm{m}}{3{,}600\\,\\mathrm{s}} = ' + Q(k / 3.6, 'm/s')) + '. (Shortcut: divide km/h by 3.6.)'
      ], 'Change kilometers to meters and hours to seconds.', { unit: 'm/s', vk: '/3.6' });
    }
    return lv(R, ctx, [findS, findS, findD], [findS, findD, findT, trip], [findT, trip, tripS, tripS, conv]);
  });

  // a three-part graph from corner points; returns {pts, segs:[{a,b,rate}]}
  function threeSeg(R, opt) {
    for (var tries = 0; tries < 50; tries++) {
      var durs = [R.int(2, 4), R.int(2, 4), R.int(2, 4)], rates = opt.rates(R), pts = [[0, opt.y0 != null ? opt.y0(R) : 0]];
      for (var i = 0; i < 3; i++) { var p = pts[i]; pts.push([p[0] + durs[i], fix(p[1] + rates[i] * durs[i])]); }
      if (opt.ok && !opt.ok(pts, rates)) continue;
      return { pts: pts, rates: rates, durs: durs };
    }
    return null;
  }
  var DT_WHO = ['walker', 'toy robot', 'dog', 'jogger', 'remote-control car', 'delivery robot'];
  var PTN = ['A', 'B', 'C', 'D'];
  function ptsText(pts, xu, yu) { return pts.map(function (p, i) { return PTN[i] + ' ' + M('(' + Q(p[0], xu) + ',\\ ' + Q(p[1], yu) + ')'); }).join(', '); }
  G('physsci.distance-time-graphs', function (R, ctx) {
    function walk() {
      var stop = R.chance(0.6), z = R.int(0, 2);
      var g = threeSeg(R, { rates: function (R) { var r = R.sample([1, 2, 3, 4, 5], 3); if (stop) r[z] = 0; return r; } });
      return g;
    }
    function viz(g) { return { name: 'ph-graph', opts: { pts: g.pts, xlab: 't', xunit: 's', ylab: 'd', yunit: 'm', tool: 'none', interactive: false, quiet: true, domain: [0, g.pts[3][0]], tags: { p0: 'A', p1: 'B', p2: 'C', p3: 'D' } } }; }
    function slopeQ() {
      var g = walk(), who = R.pick(DT_WHO), i = R.int(0, 2), a = g.pts[i], b = g.pts[i + 1], s = g.rates[i];
      return pr('The graph shows the distance a ' + who + ' has traveled. Its corners are ' + ptsText(g.pts, 's', 'm') + '. What was the ' + who + '\'s speed between ' + PTN[i] + ' and ' + PTN[i + 1] + '?', num(s), [
        'Speed is the slope: rise over run.',
        'Rise: ' + M(N(b[1]) + ' - ' + N(a[1]) + ' = ' + Q(b[1] - a[1], 'm')) + '. Run: ' + M(N(b[0]) + ' - ' + N(a[0]) + ' = ' + Q(b[0] - a[0], 's')) + '.',
        'Speed: ' + M('\\dfrac{' + Q(b[1] - a[1], 'm') + '}{' + Q(b[0] - a[0], 's') + '} = ' + Q(s, 'm/s')) + (s === 0 ? '. The line is flat: the ' + who + ' was stopped.' : '.')
      ], 'Divide the change in distance by the change in time for that part.', { unit: 'm/s', viz: viz(g), vk: 'dtslope', seg: i });
    }
    function whichQ() {
      var g = threeSeg(R, { rates: function (R) { return R.sample([0, 1, 2, 3, 4, 5], 3); } }), who = R.pick(DT_WHO);
      var hasStop = g.rates.indexOf(0) >= 0, askStop = hasStop && R.coin();
      var target = askStop ? g.rates.indexOf(0) : g.rates.indexOf(MA.max.apply(null, g.rates));
      var ch = [0, 1, 2].map(function (i) { return 'From ' + PTN[i] + ' to ' + PTN[i + 1]; });
      var a = { t: 'mc', choices: ch, v: target, keep: true };
      return pr('The graph shows the distance a ' + who + ' has traveled. Its corners are ' + ptsText(g.pts, 's', 'm') + '. During which part was it ' + (askStop ? 'stopped' : 'moving fastest') + '?', a, [
        'Speed is the slope of each part: ' + [0, 1, 2].map(function (i) { return PTN[i] + PTN[i + 1] + ': ' + M('\\dfrac{' + N(g.pts[i + 1][1] - g.pts[i][1]) + '}{' + N(g.durs[i]) + '} = ' + Q(g.rates[i], 'm/s')); }).join('; ') + '.',
        askStop ? 'The flat part (zero slope) is where it was stopped: ' + ch[target] + '.' : 'The steepest part is the fastest: ' + ch[target] + '.'
      ], askStop ? 'Look for the part where the distance does not change.' : 'Look for the steepest part.', { viz: viz(g), vk: askStop ? 'dtstop' : 'dtfast' });
    }
    function concept() {
      var who = R.pick(['hiker', 'cyclist', 'bus', 'dog', 'robot', 'skater']);
      var K = R.pick([
        ['A ' + who + '\'s distance-time graph is a straight line that slopes steeply upward. What does this show?', 'It moves at a steady, fast speed.', ['It is going up a steep hill.', 'It is speeding up.', 'It is standing still.']],
        ['A ' + who + '\'s distance-time graph is flat (horizontal) for five minutes. What was it doing then?', 'Standing still', ['Moving at a steady speed', 'Moving on flat, level ground', 'Speeding up']],
        ['A ' + who + '\'s distance-time graph curves upward, getting steeper and steeper. What is happening?', 'It is speeding up.', ['It is slowing down.', 'It is climbing a hill that gets steeper.', 'It is moving at a steady speed.']],
        ['A ' + who + '\'s distance-time graph curves and gets flatter and flatter. What is happening?', 'It is slowing down.', ['It is speeding up.', 'It is reaching the top of a hill.', 'It is moving at a steady speed.']],
        ['Two distance-time graphs start together. Line P is steeper than line Q. What does that mean?', 'P is moving faster than Q.', ['Q is moving faster than P.', 'P is going uphill and Q is on level ground.', 'P has been moving for a longer time.']],
        ['A ' + who + ' moves at a steady speed along a perfectly flat road. What does its distance-time graph look like?', 'A straight line sloping upward', ['A flat line, because the road is flat', 'A line sloping downward', 'A curve that gets steeper']],
        ['What does the slope of a distance-time graph tell you?', 'The speed', ['The steepness of the road', 'The total time', 'The direction of travel on a map']]
      ]);
      return pr(K[0], mc(K[1], K[2]), [
        'On a distance-time graph, the slope (rise over run) is distance per time: the speed. The graph is not a picture of the path.',
        'Steeper means faster, flat means stopped, and a curve means the speed is changing.',
        'So the answer is: ' + K[1]
      ], 'Ask what rise over run means on these axes.', { vk: 'concept' });
    }
    function avgQ() {
      var g = walk(), who = R.pick(DT_WHO), D = g.pts[3][1], Tt = g.pts[3][0], s = D / Tt;
      return pr('The graph shows the distance a ' + who + ' has traveled. Its corners are ' + ptsText(g.pts, 's', 'm') + '. What was the average speed for the whole trip, from A to D?', num(sig(s, 3)), [
        'Average speed is total distance over total time.',
        'Total distance: ' + MQ(D, 'm') + ' (the height of D). Total time: ' + MQ(Tt, 's') + '.',
        M('s = \\dfrac{' + Q(D, 'm') + '}{' + Q(Tt, 's') + '} ' + (Number.isInteger(fix(s)) ? '= ' : '\\approx ') + Q(sig(s, 3), 'm/s')) + '.'
      ], 'Use the first and last points only.', { unit: 'm/s', viz: viz(g), vk: 'dtavg' });
    }
    return lv(R, ctx, [slopeQ, slopeQ, concept], [slopeQ, whichQ, concept], [slopeQ, whichQ, concept, avgQ]);
  });

  var DIRS = [['east', 'west'], ['north', 'south'], ['forward', 'backward'], ['right', 'left'], ['up', 'down']];
  var WHERE = { east: ' east of', west: ' west of', north: ' north of', south: ' south of', forward: ' ahead of', backward: ' behind', right: ' to the right of', left: ' to the left of', up: ' above', down: ' below' };
  function where(x, d) { return MQ(MA.abs(x), 'm') + WHERE[x > 0 ? d[0] : d[1]] + ' the start'; }
  G('physsci.distance-displacement', function (R, ctx) {
    function moves(n) {
      for (var tries = 0; tries < 50; tries++) {
        var arr = [], s = R.sign();
        for (var i = 0; i < n; i++) { arr.push(s * R.int(2, 20)); s = R.chance(0.75) ? -s : s; }
        var net = U.sum(arr), signs = arr.map(MA.sign);
        if (net !== 0 && signs.indexOf(1) >= 0 && signs.indexOf(-1) >= 0) return arr;
      }
      return [12, -5];
    }
    function story(arr, d, who) {
      var verb = d[0] === 'up' ? 'rides an elevator' : who.v;
      var parts = arr.map(function (x, i) { return (i ? (i === arr.length - 1 ? 'and then ' : 'then ') : '') + MQ(MA.abs(x), 'm') + ' ' + (x > 0 ? d[0] : d[1]); });
      return arr.length === 2 ? parts.join(' ') : parts.join(', ');
    }
    var WHO = [{ n: 'A dog', v: 'runs' }, { n: 'A hiker', v: 'walks' }, { n: 'A crab', v: 'scuttles' }, { n: 'A robot', v: 'rolls' }, { n: 'A child', v: 'walks' }, { n: 'A bike courier', v: 'rides' }];
    function make(kind, n) {
      var arr = moves(n), d = R.pick(DIRS.slice(0, 4)), who = R.pick(WHO), dist = U.sum(arr.map(MA.abs)), net = U.sum(arr);
      if (R.chance(0.15)) { d = DIRS[4]; who = { n: 'An elevator', v: 'moves' }; }
      var q = who.n + ' ' + who.v + ' ' + story(arr, d, who) + ' along a straight line. ';
      var sum = arr.map(function (x, i) { return i ? (x < 0 ? ' - ' + N(-x) : ' + ' + N(x)) : N(x); }).join('');
      var dsum = arr.map(function (x) { return N(MA.abs(x)); }).join(' + ');
      if (kind === 'dist') return pr(q + 'What total distance does it travel?', num(dist, 0), [
        'Distance counts every meter of the path, whatever the direction.',
        M(dsum + ' = ' + Q(dist, 'm')) + '.'
      ], 'Add the lengths of all the moves.', { unit: 'm', vk: 'dist' });
      if (kind === 'far') return pr(q + 'How far from its starting point does it end up?', num(MA.abs(net), 0), [
        'Call ' + d[0] + ' positive and ' + d[1] + ' negative.',
        'Final position: ' + M(sum + ' = ' + N(net)) + ' m.',
        'So it ends ' + where(net, d) + '. That is the size of the displacement; the distance traveled, ' + MQ(dist, 'm') + ', is a different question.'
      ], 'Moves in opposite directions cancel. Where is it at the end?', { unit: 'm', vk: 'far' });
      return pr(q + 'Taking ' + d[0] + ' as positive, what is its displacement?', num(net, 0), [
        'With ' + d[0] + ' positive, the ' + d[1] + ' moves are negative.',
        M(sum + ' = ' + Q(net, 'm')) + '.',
        (net > 0 ? 'Positive' : 'Negative') + ': it ends ' + where(net, d) + '.'
      ], 'Give the moves signs, then add them.', { unit: 'm', vk: 'disp' });
    }
    function lap() {
      var L = R.pick([200, 400]), k = R.int(1, 4), half = R.chance(0.4), askD = R.coin();
      var dist = L * k + (half ? L / 2 : 0), across = L === 400 ? 110 : 55;
      if (!half) return pr('A runner starts at the finish line of ' + aQ(L, 'm') + ' track, runs ' + k + ' full lap' + (k > 1 ? 's' : '') + ', and stops at the finish line. What is her ' + (askD ? 'distance traveled' : 'displacement') + '?', num(askD ? dist : 0, 0), askD ? [
        'Distance is the whole path: ' + M(N(k) + ' \\times ' + Q(L, 'm') + ' = ' + Q(dist, 'm')) + '.'
      ] : [
        'Displacement is the change in position from start to finish.',
        'She ends exactly where she started, so the displacement is ' + MQ(0, 'm') + ', even though she ran ' + MQ(dist, 'm') + '.'
      ], askD ? 'Count the whole path.' : 'Compare where she starts and where she stops.', { unit: 'm', vk: askD ? 'lapd' : 'lap0' });
      return pr('A runner runs ' + k + ' and a half laps of ' + aQ(L, 'm') + ' track. Halfway around, the finish line is ' + MQ(across, 'm') + ' away in a straight line across the field. What distance did she travel?', num(dist, 0), [
        'Distance is the whole path, not the straight-line gap.',
        M(N(k) + ' \\times ' + Q(L, 'm') + ' + ' + Q(L / 2, 'm') + ' = ' + Q(dist, 'm')) + '. (Her displacement is only about ' + MQ(across, 'm') + '.)'
      ], 'Count every meter she ran.', { unit: 'm', vk: 'laph' });
    }
    return lv(R, ctx, [function () { return make('dist', 2); }, function () { return make('far', 2); }],
      [function () { return make('dist', R.int(2, 3)); }, function () { return make('far', R.int(2, 3)); }, function () { return make('disp', R.int(2, 3)); }],
      [function () { return make('far', R.int(3, 4)); }, function () { return make('disp', R.int(3, 4)); }, lap]);
  });

  G('physsci.velocity', function (R, ctx) {
    var who = R.pick([{ n: 'cyclist', p: 'her' }, { n: 'runner', p: 'his' }, { n: 'boat', p: 'its' }, { n: 'train', p: 'its' }, { n: 'skater', p: 'her' }, { n: 'scooter', p: 'its' }]);
    function signed() {
      var d = R.pick(DIRS.slice(0, 4)), v = R.int(2, 25), neg = R.coin();
      return pr('Take ' + d[0] + ' as positive. A ' + who.n + ' moves at ' + MQ(v, 'm/s') + ' ' + (neg ? d[1] : d[0]) + '. What is ' + who.p + ' velocity?', num(neg ? -v : v, 0), [
        'Velocity is speed with a direction; on a line the sign gives the direction.',
        cap(neg ? d[1] : d[0]) + ' is the ' + (neg ? 'negative' : 'positive') + ' direction, so ' + M('v = ' + Q(neg ? -v : v, 'm/s')) + '.'
      ], 'Which direction is positive?', { unit: 'm/s', vk: 'signed', neg: neg });
    }
    function same() {
      var v = R.pick([20, 30, 40, 50, 60, 80, 100]), d = R.pick([['north', 'south'], ['east', 'west']]), K = R.int(0, 2);
      if (K === 0) return pr('Car A drives at ' + MQ(v, 'km/h') + ' ' + d[0] + '. Car B drives at ' + MQ(v, 'km/h') + ' ' + d[1] + '. Which statement is true?', mc('They have the same speed but different velocities.', ['They have the same speed and the same velocity.', 'They have different speeds and different velocities.', 'They have the same velocity but different speeds.']), [
        'Speed is how fast: both go ' + MQ(v, 'km/h') + ', so the speeds match.',
        'Velocity includes direction: ' + d[0] + ' is not ' + d[1] + ', so the velocities differ (' + M('+' + v) + ' and ' + M('-' + v) + ' km/h if ' + d[0] + ' is positive).'
      ], 'Velocity includes the direction.', { vk: 'concept' });
      if (K === 1) { var v2 = v + R.pick([5, 10, 20]);
        return pr('Which two objects have the same velocity?', mc('A cart at ' + v + ' km/h ' + d[0] + ' and a truck at ' + v + ' km/h ' + d[0], ['A cart at ' + v + ' km/h ' + d[0] + ' and a truck at ' + v + ' km/h ' + d[1], 'A cart at ' + v + ' km/h ' + d[0] + ' and a truck at ' + v2 + ' km/h ' + d[0], 'A cart at ' + v + ' km/h ' + d[0] + ' and a truck at ' + v2 + ' km/h ' + d[1]]), [
          'Same velocity needs the same speed <b>and</b> the same direction.',
          'Only ' + v + ' km/h ' + d[0] + ' with ' + v + ' km/h ' + d[0] + ' matches both.'
        ], 'Check both the speed and the direction.', { vk: 'concept' }); }
      var circ = R.pick(['a circular track', 'a roundabout', 'a curved ramp']), sp = R.pick([10, 12, 15, 20]), askV = R.coin();
      return pr('A car drives around ' + circ + ' at a steady ' + MQ(sp, 'm/s') + '. True or false: its ' + (askV ? 'velocity' : 'speed') + ' stays the same.', tf(!askV), [
        'Its speed stays ' + MQ(sp, 'm/s') + ' the whole time.',
        'Its direction keeps turning, so its velocity keeps changing.',
        askV ? 'False: the velocity changes.' : 'True: the speed stays the same.'
      ], 'Velocity includes direction. Does the direction change on a curve?', { vk: 'concept' });
    }
    function avg() {
      var d = R.pick(DIRS.slice(0, 2)), t = R.pick([10, 20, 25, 40, 50, 100]), vv = R.int(1, 4), vs = vv + R.int(1, 4);
      var back = fix((vs - vv) * t / 2), out = fix(vv * t + back); // out - back = vv t ; out + back = vs t
      if (!Number.isInteger(back) || back <= 0) { t = t * 2; back = (vs - vv) * t / 2; out = vv * t + back; }
      return pr('A ' + who.n + ' goes ' + MQ(out, 'm') + ' ' + d[0] + ', then ' + MQ(back, 'm') + ' ' + d[1] + ', taking ' + MQ(t, 's') + ' in all. Taking ' + d[0] + ' as positive, find the average speed and the average velocity.', { t: 'multi', parts: [
        { label: 'Average speed', a: num(vs), unit: 'm/s' }, { label: 'Average velocity', a: num(vv), unit: 'm/s' }] }, [
        'Distance: ' + M(N(out) + ' + ' + N(back) + ' = ' + Q(out + back, 'm')) + '. Average speed: ' + M('\\dfrac{' + Q(out + back, 'm') + '}{' + Q(t, 's') + '} = ' + Q(vs, 'm/s')) + '.',
        'Displacement: ' + M(N(out) + ' - ' + N(back) + ' = +' + Q(out - back, 'm')) + '. Average velocity: ' + M('\\dfrac{+' + Q(out - back, 'm') + '}{' + Q(t, 's') + '} = +' + Q(vv, 'm/s')) + ', that is, ' + MQ(vv, 'm/s') + ' ' + d[0] + '.'
      ], 'Speed uses distance; velocity uses displacement.', { vk: 'avgv' });
    }
    function change() {
      var v1 = R.int(2, 9), v2 = R.int(1, v1), d = R.pick(DIRS.slice(0, 2)), thing = R.pick(['A ball rolls', 'A hockey puck slides', 'A toy car rolls']);
      return pr(thing + ' ' + d[0] + ' at ' + MQ(v1, 'm/s') + ', bounces off a wall and moves ' + d[1] + ' at ' + MQ(v2, 'm/s') + '. Taking ' + d[0] + ' as positive, what is its change in velocity (final minus initial)?', num(-v2 - v1, 0), [
        'Initial velocity: ' + M('+' + Q(v1, 'm/s')) + '. Final velocity: ' + M(Q(-v2, 'm/s')) + '.',
        'Change: ' + M(Q(-v2, 'm/s') + ' - (+' + Q(v1, 'm/s') + ') = ' + Q(-v2 - v1, 'm/s')) + '.',
        'The speed changed by only ' + MQ(MA.abs(v1 - v2), 'm/s') + ', but the velocity changed by ' + MQ(v1 + v2, 'm/s') + ' because the direction reversed.'
      ], 'Give the two velocities signs first.', { unit: 'm/s', vk: 'dv' });
    }
    return lv(R, ctx, [signed, same], [signed, same, avg], [same, avg, change]);
  });

  G('physsci.acceleration-intro', function (R, ctx) {
    var thing = R.pick(['car', 'bus', 'motorcycle', 'train', 'cyclist', 'skateboarder']);
    function up() {
      var a = R.int(1, 5), t = R.int(2, 8), v1 = R.int(0, 10), v2 = v1 + a * t;
      return pr('A ' + thing + ' speeds up from ' + MQ(v1, 'm/s') + ' to ' + MQ(v2, 'm/s') + ' in ' + MQ(t, 's') + '. What is its acceleration?', num(a), [
        'Change in velocity: ' + M('\\Delta v = ' + N(v2) + ' - ' + N(v1) + ' = ' + Q(v2 - v1, 'm/s')) + '.',
        M('a = \\dfrac{\\Delta v}{t} = \\dfrac{' + Q(v2 - v1, 'm/s') + '}{' + Q(t, 's') + '} = ' + Q(a, 'm/s²')) + '.'
      ], 'Find the change in velocity, then divide by the time.', { unit: 'm/s²', vk: 'acc' });
    }
    function down() {
      var a = R.pick([1, 1.5, 2, 2.5, 3, 4, 5]), t = R.int(2, 6), v2 = R.chance(0.5) ? 0 : R.int(1, 6), v1 = fix(v2 + a * t);
      return pr('Take forward as positive. A ' + thing + ' moving forward at ' + MQ(v1, 'm/s') + ' slows to ' + MQ(v2, 'm/s') + ' in ' + MQ(t, 's') + '. What is its acceleration?', num(-a), [
        M('\\Delta v = ' + N(v2) + ' - ' + N(v1) + ' = ' + Q(v2 - v1, 'm/s')) + '.',
        M('a = \\dfrac{' + Q(v2 - v1, 'm/s') + '}{' + Q(t, 's') + '} = ' + Q(-a, 'm/s²')) + '.',
        'The minus sign means the acceleration points backward, so the ' + thing + ' slows down.'
      ], 'Final minus initial. Is the change positive or negative?', { unit: 'm/s²', vk: 'acc' });
    }
    function vf() {
      var a = R.int(1, 4), t = R.int(2, 8), v1 = R.int(0, 12), v2 = v1 + a * t;
      return pr('A ' + thing + ' moving at ' + MQ(v1, 'm/s') + ' speeds up with an acceleration of ' + MQ(a, 'm/s²') + ' for ' + MQ(t, 's') + '. How fast is it going then?', num(v2), [
        'Each second it gains ' + MQ(a, 'm/s') + ', so in ' + MQ(t, 's') + ' it gains ' + M(N(a) + ' \\times ' + N(t) + ' = ' + Q(a * t, 'm/s')) + '.',
        M('v_f = ' + N(v1) + ' + ' + N(a * t) + ' = ' + Q(v2, 'm/s')) + '.'
      ], 'Acceleration is the speed gained each second.', { unit: 'm/s', vk: 'vf' });
    }
    function tQ() {
      var a = R.int(1, 5), t = R.int(2, 9), v1 = R.int(0, 10), v2 = v1 + a * t;
      return pr('How long does it take a ' + thing + ' to go from ' + MQ(v1, 'm/s') + ' to ' + MQ(v2, 'm/s') + ' with a steady acceleration of ' + MQ(a, 'm/s²') + '?', num(t), [
        'It must gain ' + M(N(v2) + ' - ' + N(v1) + ' = ' + Q(v2 - v1, 'm/s')) + '.',
        'At ' + MQ(a, 'm/s') + ' per second: ' + M('t = \\dfrac{' + Q(v2 - v1, 'm/s') + '}{' + Q(a, 'm/s²') + '} = ' + Q(t, 's')) + '.'
      ], 'Rearrange a = Δv/t to t = Δv/a.', { unit: 's', vk: 'tacc' });
    }
    function fall() {
      var t = R.int(1, 5);
      return pr('A stone is dropped from a high cliff. Air resistance is small enough to ignore, so it gains ' + MQ(9.8, 'm/s') + ' of downward speed every second. How fast is it falling after ' + MQ(t, 's') + '?', num(9.8 * t), [
        'It starts at 0 and gains ' + MQ(9.8, 'm/s') + ' each second.',
        M('v = 9.8\\,\\mathrm{m/s^2} \\times ' + Q(t, 's') + ' = ' + Q(9.8 * t, 'm/s')) + '.'
      ], 'Speed gained = acceleration × time.', { unit: 'm/s', vk: 'fall' });
    }
    function kmh() {
      var v = R.pick([36, 54, 72, 90, 108]), t = R.pick([2, 3, 4, 5, 6, 10]), ms = v / 3.6, a = ms / t;
      if (!Number.isInteger(fix(a * 2))) { t = R.pick([2, 5, 10]); a = ms / t; }
      return pr('A car goes from rest to ' + MQ(v, 'km/h') + ' in ' + MQ(t, 's') + '. What is its acceleration in m/s²?', num(sig(a, 3)), [
        'First change the speed to m/s: ' + M(N(v) + ' \\div 3.6 = ' + Q(ms, 'm/s')) + '.',
        M('a = \\dfrac{' + Q(ms, 'm/s') + '}{' + Q(t, 's') + '} = ' + Q(sig(a, 3), 'm/s²')) + '.'
      ], 'Change km/h to m/s first (divide by 3.6).', { unit: 'm/s²', vk: 'acckmh' });
    }
    function which() {
      var acc = ['A car turning a corner at a steady 20 km/h', 'A bike slowing down for a stop sign', 'A runner speeding up off the starting line', 'A Ferris wheel seat moving in a circle at a steady speed', 'A ball dropped from a balcony', 'A plane slowing down after landing'];
      var not = ['A car driving straight ahead at a steady 60 km/h', 'A book lying on a table', 'A train moving along a straight track at a steady 30 m/s', 'A jet cruising straight and level at a steady 250 m/s', 'A parked bicycle'];
      if (R.coin()) { var r = R.pick(acc); return pr('Which of these is accelerating?', mc(r, R.sample(not, 3)), [
        'Acceleration means the velocity is changing: speeding up, slowing down or changing direction.',
        'The others keep the same speed in the same direction (or stay at rest), so their velocity does not change.', 'Accelerating: ' + r + '.'
      ], 'Look for a change in speed or in direction.', { vk: 'concept' }); }
      var n = R.pick(not); return pr('Which of these is <b>not</b> accelerating?', mc(n, R.sample(acc, 3)), [
        'Acceleration means the velocity is changing: speeding up, slowing down or changing direction.',
        'Each of the other three changes its speed or its direction.', 'Not accelerating: ' + n + '.'
      ], 'Turning and slowing down both count as accelerating.', { vk: 'concept' });
    }
    return lv(R, ctx, [up, up, vf], [up, down, vf, which], [down, tQ, fall, kmh, which]);
  });

  G('physsci.speed-time-graphs', function (R, ctx) {
    function build() {
      var kinds = R.shuffle(['up', 'flat', 'down']);
      return threeSeg(R, {
        y0: function (R) { return kinds[0] === 'down' ? R.int(8, 12) : R.int(0, 4); },
        rates: function (R) { return kinds.map(function (k) { return k === 'flat' ? 0 : (k === 'up' ? 1 : -1) * R.pick([1, 1.5, 2, 2.5, 3]); }); },
        ok: function (pts, rates) { var fi = rates.indexOf(0); return pts.every(function (p) { return p[1] >= 0 && p[1] <= 20; }) && pts[fi][1] >= 2; }
      }) || { pts: [[0, 2], [3, 8], [6, 8], [8, 4]], rates: [2, 0, -2], durs: [3, 3, 2] };
    }
    function viz(g) { return { name: 'ph-graph', opts: { pts: g.pts, xlab: 't', xunit: 's', ylab: 'speed', yunit: 'm/s', tool: 'none', interactive: false, quiet: true, domain: [0, g.pts[3][0]], tags: { p0: 'A', p1: 'B', p2: 'C', p3: 'D' } } }; }
    var who = R.pick(['car', 'cyclist', 'train', 'go-kart', 'scooter', 'bus']);
    function slopeQ() {
      var g = build(), i = R.int(0, 2), a = g.pts[i], b = g.pts[i + 1], acc = g.rates[i];
      return pr('The speed-time graph of a ' + who + ' has corners ' + ptsText(g.pts, 's', 'm/s') + '. What is its acceleration between ' + PTN[i] + ' and ' + PTN[i + 1] + '?', num(acc), [
        'Acceleration is the slope of a speed-time graph.',
        'Rise: ' + M(N(b[1]) + ' - ' + N(a[1]) + ' = ' + Q(b[1] - a[1], 'm/s')) + '. Run: ' + M(Q(b[0] - a[0], 's')) + '.',
        M('a = \\dfrac{' + Q(b[1] - a[1], 'm/s') + '}{' + Q(b[0] - a[0], 's') + '} = ' + Q(acc, 'm/s²')) + (acc === 0 ? '. Flat line: steady speed, no acceleration.' : acc < 0 ? '. Negative: it is slowing down.' : '.')
      ], 'Change in speed divided by the time for that part.', { unit: 'm/s²', viz: viz(g), vk: 'vtslope', seg: i });
    }
    function whichQ() {
      var g = build(), want = R.pick(['flat', 'up', 'down']), lab = { flat: 'moving at a steady speed', up: 'speeding up', down: 'slowing down' };
      var idx = g.rates.map(function (r) { return r === 0 ? 'flat' : r > 0 ? 'up' : 'down'; }).indexOf(want);
      var ch = [0, 1, 2].map(function (i) { return 'From ' + PTN[i] + ' to ' + PTN[i + 1]; });
      var a = { t: 'mc', choices: ch, v: idx, keep: true };
      return pr('The speed-time graph of a ' + who + ' has corners ' + ptsText(g.pts, 's', 'm/s') + '. During which part is it ' + lab[want] + '?', a, [
        'Rising line: speeding up. Flat line: steady speed. Falling line: slowing down.',
        'The ' + (want === 'flat' ? 'flat' : want === 'up' ? 'rising' : 'falling') + ' part is ' + ch[idx] + '.'
      ], 'Is the speed going up, staying the same, or going down?', { viz: viz(g), vk: 'vtwhich' });
    }
    function concept() {
      var K = R.pick([
        ['On a speed-time graph, a ' + who + '\'s line is flat at ' + MQ(R.int(5, 25), 'm/s') + '. What is the ' + who + ' doing?', 'Moving at a steady speed', ['Standing still', 'Speeding up', 'Slowing down']],
        ['On a distance-time graph, a ' + who + '\'s line is flat. What is the ' + who + ' doing?', 'Standing still', ['Moving at a steady speed', 'Speeding up', 'Slowing down']],
        ['On a speed-time graph, a ' + who + '\'s line slopes downward. What is the ' + who + ' doing?', 'Slowing down', ['Going downhill', 'Moving backward', 'Standing still']],
        ['On a speed-time graph, a ' + who + '\'s line slopes upward in a straight line. What is the ' + who + ' doing?', 'Speeding up steadily', ['Moving at a steady speed', 'Going uphill', 'Standing still']],
        ['What does the slope of a speed-time graph tell you?', 'The acceleration', ['The distance traveled', 'The speed', 'The height of the road']],
        ['A ' + who + '\'s speed-time graph lies along the time axis (speed 0). What is the ' + who + ' doing?', 'Standing still', ['Moving at a steady speed', 'Slowing down', 'Speeding up']]
      ]);
      return pr(K[0], mc(K[1], K[2]), [
        'Read the side axis first: on a speed-time graph the height is the speed, and the slope is the acceleration.',
        'Flat and above zero means a steady speed; flat on a distance-time graph means stopped.', 'Answer: ' + K[1] + '.'
      ], 'Check which graph it is: distance or speed?', { vk: 'concept' });
    }
    function areaQ() {
      var g = build(), i = g.rates.indexOf(0), a = g.pts[i], b = g.pts[i + 1], d = a[1] * (b[0] - a[0]);
      if (a[1] === 0) return slopeQ();
      return pr('The speed-time graph of a ' + who + ' has corners ' + ptsText(g.pts, 's', 'm/s') + '. How far does it travel between ' + PTN[i] + ' and ' + PTN[i + 1] + '?', num(d), [
        'From ' + PTN[i] + ' to ' + PTN[i + 1] + ' the line is flat: a steady ' + MQ(a[1], 'm/s') + ' for ' + M(N(b[0]) + ' - ' + N(a[0]) + ' = ' + Q(b[0] - a[0], 's')) + '.',
        'Distance = speed × time: ' + M(Q(a[1], 'm/s') + ' \\times ' + Q(b[0] - a[0], 's') + ' = ' + Q(d, 'm')) + '. (That is the area of the rectangle under the line.)'
      ], 'At a steady speed, distance = speed × time.', { unit: 'm', viz: viz(g), vk: 'vtarea', seg: i });
    }
    return lv(R, ctx, [slopeQ, concept], [slopeQ, whichQ, concept], [slopeQ, whichQ, concept, areaQ]);
  });

  // ---------- g2_forces.js ----------
  // ===================== Unit 2: Forces and Newton's Laws =====================
  G('physsci.forces-intro', function (R, ctx) {
    var BY = [
      ['A book rests on a table. What pushes the book up?', 'The table', ['Earth', 'The air', 'Nothing; the book holds itself up']],
      ['A lamp hangs from the ceiling by a cord. What pulls the lamp up?', 'The cord', ['Earth', 'The lamp itself', 'The air in the room']],
      ['An apple falls from a tree. What pulls it down?', 'Earth', ['The air', 'The branch it fell from', 'Its own speed']],
      ['A magnet picks up a paper clip without touching it. What pulls the paper clip?', 'The magnet', ['The air', 'Earth', 'Nothing; no force acts without touching']],
      ['A boat floats on a lake. What pushes the boat up?', 'The water', ['The air', 'The boat\'s engine', 'Earth']],
      ['A soccer player kicks a ball. During the kick, what pushes the ball?', 'The player\'s foot', ['The ball\'s own force', 'The air', 'The ground']],
      ['A skydiver\'s parachute opens and slows her down. What pushes up on the parachute?', 'The air', ['Earth', 'Her speed', 'Nothing; parachutes slow down on their own']],
      ['A dog pulls a sled across the snow with a rope. What pulls the sled forward?', 'The rope', ['The snow', 'The sled\'s own motion', 'Earth']]
    ];
    function byWhat() { var K = R.pick(BY); return pr(K[0], mc(K[1], K[2]), [
      'Every force is a push or pull by one object on another. Ask which object does this pushing or pulling.',
      'Answer: ' + K[1].charAt(0).toLowerCase() + K[1].slice(1) + '.'
    ], 'Which object is touching it, or pulling across a gap?', { vk: 'concept' }); }
    function thrown() {
      var obj = R.pick(['baseball', 'basketball', 'stone', 'frisbee', 'paper airplane', 'tennis ball']), K = R.int(0, 1);
      if (K === 0) return pr('A ' + obj + ' has just left your hand and is flying through the air. Which forces act on it now?', mc('Gravity (Earth\'s pull) and air resistance', ['The force of the throw, gravity and air resistance', 'Only the force of the throw', 'No forces at all; it moves on its own']), [
        'A force needs an object that exerts it. Your hand no longer touches the ' + obj + ', so it exerts no force.',
        'Earth still pulls it (gravity), and the air pushes against its motion (air resistance).',
        'It keeps moving because it is already moving, not because a "force of the throw" travels with it.'
      ], 'For each force, name the object that exerts it.', { vk: 'concept' });
      return pr('True or false: a moving ' + obj + ' carries a "force of motion" inside it that keeps it going.', tf(false), [
        'A force is a push or pull by one object on another; an object can\'t carry one inside it.',
        'Once thrown, the ' + obj + ' keeps moving on its own. The only forces on it are gravity and air resistance.',
        'False.'
      ], 'What object would exert that force?', { vk: 'concept' });
    }
    function contact() {
      var nc = ['Earth\'s gravity pulling a falling leaf', 'A magnet pulling a nail from a few centimeters away', 'A charged balloon pulling on bits of paper', 'The Sun\'s gravity pulling on Earth'];
      var c = ['A hand pushing a door', 'Friction slowing a sliding box', 'A rope pulling a wagon', 'A table holding up a cup', 'Wind pushing a sail', 'A foot kicking a ball'];
      if (R.coin()) { var r = R.pick(nc); return pr('Which of these is a force that acts <b>without touching</b>?', mc(r, R.sample(c, 3)), ['Gravity, magnetic forces and electric forces act across a gap.', 'The others are contact forces: the objects touch.', 'Answer: ' + r + '.'], 'Do the two objects touch?', { vk: 'concept' }); }
      var r2 = R.pick(c); return pr('Which of these is a <b>contact</b> force?', mc(r2, R.sample(nc, 3)), ['A contact force acts only where two objects touch.', 'Gravity, magnetic and electric forces work across a gap.', 'Answer: ' + r2 + '.'], 'Do the two objects touch?', { vk: 'concept' });
    }
    function kN() {
      var who = R.pick(['A tow truck pulls a car', 'A crane lifts a beam', 'A rocket engine pushes', 'A tractor pulls a plow', 'A train engine pulls its cars']);
      if (R.coin()) { var k = R.pick([1.5, 2.4, 3.2, 4.5, 6, 7.8, 12, 25, 0.8]); return pr(who + ' with a force of ' + MQ(k, 'kN') + '. How many newtons is that?', num(k * 1000, 0), [
        'The prefix kilo- means 1,000, so ' + M('1\\,\\mathrm{kN} = 1{,}000\\,\\mathrm{N}') + '.',
        M(N(k) + ' \\times 1{,}000 = ' + Q(k * 1000, 'N')) + '.'
      ], 'Kilo means a thousand.', { unit: 'N', vk: 'kN' }); }
      var n = R.pick([1200, 2500, 3600, 4800, 650, 15000, 9000]); return pr(who + ' with a force of ' + MQ(n, 'N') + '. How many kilonewtons is that?', num(n / 1000, 0), [
        M('1{,}000\\,\\mathrm{N} = 1\\,\\mathrm{kN}') + ', so divide by 1,000.',
        M(N(n) + ' \\div 1{,}000 = ' + Q(n / 1000, 'kN')) + '.'
      ], 'Kilo means a thousand.', { unit: 'kN', vk: 'toKN' });
    }
    return lv(R, ctx, [byWhat, thrown, contact], [byWhat, thrown, contact, kN], [thrown, contact, kN]);
  });

  function fbdViz(forces, scene) { return { name: 'ph-fbd', opts: { scene: scene || 'block', forces: forces, interactive: false, quiet: true } }; }
  G('physsci.net-force', function (R, ctx) {
    var CTX = [
      { s: 'In a tug of war, the left team pulls with', l: 'left', r: 'right', a: 'the right team pulls with', u: 10, lo: 300, hi: 900, lt: 'tension', lb: 'the left team', rt: 'tension', rb: 'the right team' },
      { s: 'A dog pulls a toy to the left with', l: 'left', r: 'right', a: 'a child pulls it to the right with', u: 1, lo: 10, hi: 60, lt: 'applied', lb: 'the dog', rt: 'applied', rb: 'the child' },
      { s: 'Wind pushes a sailboat backward with', l: 'backward', r: 'forward', a: 'its motor pushes it forward with', u: 10, lo: 100, hi: 600, lt: 'drag', lb: 'the wind', rt: 'applied', rb: 'the motor' },
      { s: 'Friction pushes a sliding box to the left with', l: 'left', r: 'right', a: 'a worker pushes it to the right with', u: 5, lo: 20, hi: 200, lt: 'friction', lb: 'the floor', rt: 'applied', rb: 'the worker' }
    ];
    function opp(signed) {
      var c = R.pick(CTX), A = c.u * R.int(c.lo / c.u, c.hi / c.u), B = c.u * R.int(c.lo / c.u, c.hi / c.u); if (A === B) B += c.u * R.int(1, 5);
      var net = B - A, fz = [{ type: c.lt, mag: A, angle: 180, by: c.lb }, { type: c.rt, mag: B, angle: 0, by: c.rb }];
      var q = c.s + ' ' + MQ(A, 'N') + ', and ' + c.a + ' ' + MQ(B, 'N') + '. ';
      if (signed) return pr(q + 'Taking ' + c.r + ' as positive, what is the net force?', num(net, 0), [
        c.r.charAt(0).toUpperCase() + c.r.slice(1) + ' is positive, so the ' + c.l + ' force counts as ' + M('-' + N(A)) + ' N.',
        M('\\Sigma F = ' + N(B) + ' + (-' + N(A) + ') = ' + Q(net, 'N')) + '.',
        net > 0 ? 'Positive: the net force points ' + c.r + '.' : 'Negative: the net force points ' + c.l + '.'
      ], 'Opposite forces subtract. Which one is bigger?', { unit: 'N', viz: fbdViz(fz), vk: 'net2s' });
      return pr(q + 'How big is the net force?', num(MA.abs(net), 0), [
        'The forces point in opposite directions, so subtract the smaller from the bigger.',
        M(N(MA.max(A, B)) + ' - ' + N(MA.min(A, B)) + ' = ' + Q(MA.abs(net), 'N')) + ', pointing ' + (net > 0 ? c.r : c.l) + '.'
      ], 'Opposite forces subtract.', { unit: 'N', viz: fbdViz(fz), vk: 'net2' });
    }
    function same() {
      var n = R.int(2, 3), fs = []; for (var i = 0; i < n; i++) fs.push(5 * R.int(4, 60));
      var tot = U.sum(fs), who = R.pick(['friends push a stalled car forward', 'movers push a piano across a stage', 'dogs pull a sled forward', 'tugboats push a ship forward']);
      return pr(cap(U.words(n)) + ' ' + who + ' with forces of ' + U.list(fs.map(function (f) { return MQ(f, 'N'); })) + '. Ignoring friction, what is the net force?', num(tot, 0), [
        'All the forces point the same way, so their sizes add.',
        M(fs.map(N).join(' + ') + ' = ' + Q(tot, 'N')) + '.'
      ], 'Same direction: add.', { unit: 'N', vk: 'sum' });
    }
    function four() {
      var W = 10 * R.int(5, 30), P = 5 * R.int(4, 30), f = 5 * R.int(1, P / 5); if (f === P && R.coin()) f -= 5;
      var net = P - f, obj = R.pick(['crate', 'box', 'sled', 'cart']);
      return pr('A ' + obj + ' on a floor feels four forces: gravity ' + MQ(W, 'N') + ' down, the normal force ' + MQ(W, 'N') + ' up, a push of ' + MQ(P, 'N') + ' to the right and friction of ' + MQ(f, 'N') + ' to the left. What is the size of the net force?', num(net, 0), [
        'Up and down: ' + M(N(W) + ' - ' + N(W) + ' = 0') + '. They balance.',
        'Sideways: ' + M(N(P) + ' - ' + N(f) + ' = ' + Q(net, 'N')) + (net === 0 ? '. All the forces balance: the net force is zero.' : ', to the right.')
      ], 'Handle up-down and left-right separately.', { unit: 'N', viz: fbdViz([{ type: 'gravity', mag: W }, { type: 'normal', mag: W }, { type: 'applied', mag: P }, { type: 'friction', mag: f }]), vk: 'four' });
    }
    function missing() {
      var A = 10 * R.int(20, 80), want = R.pick([0, 0, 10 * R.int(2, 10)]), B = A + want;
      return pr('Team Red pulls a rope to the left with ' + MQ(A, 'N') + '. How hard must Team Blue pull to the right so the net force is ' + (want ? MQ(want, 'N') + ' to the right' : 'zero') + '?', num(B, 0), [
        'Taking right as positive: ' + M('B - ' + N(A) + ' = ' + N(want)) + '.',
        M('B = ' + N(A) + ' + ' + N(want) + ' = ' + Q(B, 'N')) + '.'
      ], 'Write the net force as Blue minus Red.', { unit: 'N', vk: 'missing' });
    }
    function balanced() {
      var K = R.pick([
        ['A lamp hangs at rest from a cord. What is the net force on it?', 'Zero: the forces are balanced.'],
        ['A car cruises along a straight highway at a steady 100 km/h. What is the net force on it?', 'Zero: the forces are balanced.'],
        ['A book sits still on a shelf. What is the net force on it?', 'Zero: the forces are balanced.'],
        ['A skydiver falls at a steady speed (terminal speed). What is the net force on her?', 'Zero: the forces are balanced.']
      ]);
      return pr(K[0], mc(K[1], ['It points down, toward Earth.', 'It points in the direction of motion.', 'It equals the object\'s weight.']), [
        'If the velocity is not changing (at rest, or a steady speed in a straight line), the forces must cancel.',
        'Answer: ' + K[1]
      ], 'Is the motion changing?', { vk: 'concept' });
    }
    return lv(R, ctx, [function () { return opp(false); }, same], [function () { return opp(true); }, same, four, balanced], [function () { return opp(true); }, four, missing, balanced]);
  });

  G('physsci.first-law-inertia', function (R, ctx) {
    function coast() {
      var v = R.pick([8, 11, 15, 17, 20, 25]), when = R.pick(['an hour', 'a day', 'a week', 'a year']), d = R.pick(['away from the Sun', 'toward a distant star', 'in a straight line']);
      return pr('A space probe far from any planet or star coasts ' + d + ' at ' + MQ(v, 'km/s') + ' with its engines off. Ignoring tiny pulls from distant objects, what is its speed ' + when + ' later?', num(v, 0), [
        'Far from planets and stars there is almost no friction, air or gravity, so the net force is about zero.',
        'By the first law, zero net force means the velocity does not change: still ' + MQ(v, 'km/s') + '.'
      ], 'What would change its speed?', { unit: 'km/s', vk: 'same' });
    }
    function concept() {
      var obj = R.pick(['hockey puck', 'curling stone', 'toy car', 'skateboard']);
      var K = R.pick([
        ['A ' + obj + ' slides across a floor and slows to a stop. Why does it stop?', 'Friction from the floor pushes against its motion.', ['The force from the push runs out.', 'Its inertia gets used up.', 'Moving things naturally stop when nothing pushes them.']],
        ['A ' + obj + ' glides on very smooth ice after the push ends. What happens to it?', 'It keeps going at nearly the same speed in a straight line.', ['It slows down right away because no force pushes it.', 'It speeds up for a moment, then stops.', 'It curves to the side.']],
        ['A bus brakes suddenly. Why do the standing passengers lurch forward?', 'Their bodies keep moving forward while the bus slows down.', ['The bus pushes them forward.', 'A force of motion throws them forward.', 'Gravity pulls them toward the front.']],
        ['A ' + obj + ' moves at ' + MQ(R.int(2, 9), 'm/s') + ' east, and the net force on it is zero. What happens next?', 'It keeps moving east at the same speed.', ['It slows down and stops.', 'It speeds up.', 'It stops at once.']],
        ['A magician yanks a tablecloth out from under a set of dishes, and the dishes stay put. Why?', 'The dishes\' inertia: the quick, small friction force barely changes their motion.', ['The dishes are glued to the table.', 'Air pressure holds the dishes down.', 'The tablecloth pushes the dishes backward.']],
        ['Which has more inertia?', 'A ' + R.int(6, 20) + ' kg bowling ball', ['A 0.5 kg soccer ball', 'A 0.06 kg tennis ball', 'They all have the same inertia']]
      ]);
      return pr(K[0], mc(K[1], K[2]), [
        'Newton\'s first law: with zero net force, velocity stays the same. A force is needed to change motion, not to keep it.',
        'Inertia grows with mass. Things slow down only when some object pushes against them, such as the floor (friction) or the air.',
        'Answer: ' + K[1]
      ], 'A force changes motion; it is not needed to keep motion going.', { vk: 'concept' });
    }
    function truefalse() {
      var K = R.pick([
        ['If the net force on a moving object is zero, it slows down and stops.', false],
        ['A force is needed to change an object\'s velocity.', true],
        ['An object at rest with zero net force stays at rest.', true],
        ['A rolling ball stops because its force of motion runs out.', false],
        ['A heavier object has more inertia than a lighter one.', true],
        ['A spaceship coasting in deep space needs its engines on to keep moving.', false]
      ]);
      return pr('True or false: ' + K[0].charAt(0).toLowerCase() + K[0].slice(1), tf(K[1]), [
        'First law: with zero net force, an object keeps the velocity it has, at rest or moving.',
        K[1] ? 'True.' : 'False.'
      ], 'Does motion need a force, or does a change in motion need a force?', { vk: 'concept' });
    }
    function inertia() {
      var a = R.pick([[2, 'cat'], [5, 'bag of rice'], [8, 'bowling ball'], [15, 'suitcase'], [40, 'child'], [70, 'adult']]), b = R.pick([[0.4, 'soccer ball'], [1, 'textbook'], [3, 'cat'], [25, 'dog'], [120, 'motorbike'], [1500, 'car']]);
      if (a[0] === b[0]) b = [a[0] * 3, 'crate'];
      var big = a[0] > b[0] ? a : b, small = a[0] > b[0] ? b : a;
      return pr('Which is harder to start moving or to stop: a ' + N(a[0]) + ' kg ' + a[1] + ' or a ' + N(b[0]) + ' kg ' + b[1] + '?', mc('The ' + N(big[0]) + ' kg ' + big[1], ['The ' + N(small[0]) + ' kg ' + small[1], 'Both are equally hard', 'It depends only on how fast they move']), [
        'Inertia, the resistance to changes in motion, depends on mass.',
        'More mass means more inertia: the ' + big[1] + '.'
      ], 'Compare the masses.', { vk: 'inertia' });
    }
    return lv(R, ctx, [concept, truefalse, coast], [concept, truefalse, coast, inertia], [concept, coast, inertia, truefalse]);
  });

  G('physsci.second-law-intro', function (R, ctx) {
    var OBJ = [['cart', 1, 10], ['sled', 5, 40], ['crate', 10, 80], ['wagon', 5, 30], ['go-kart', 100, 200], ['car', 800, 1600], ['boat', 200, 900]];
    function obj() { var o = R.pick(OBJ), m = o[2] > 100 ? 50 * R.int(o[1] / 50 || 1, o[2] / 50) : R.int(o[1], o[2]); return { n: o[0], m: m }; }
    function findA() {
      var o = obj(), a = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), F = fix(o.m * a);
      return pr('A net force of ' + MQ(F, 'N') + ' acts on ' + aQ(o.m, 'kg') + ' ' + o.n + '. What is its acceleration?', num(a), [
        M('a = \\dfrac{\\Sigma F}{m} = \\dfrac{' + Q(F, 'N') + '}{' + Q(o.m, 'kg') + '} = ' + Q(a, 'm/s²')) + '.'
      ], 'Divide the net force by the mass.', { unit: 'm/s²', vk: 'Fm' });
    }
    function findF() {
      var o = obj(), a = R.pick([0.5, 1, 1.5, 2, 3, 4, 6]), F = fix(o.m * a);
      return pr('What net force gives ' + aQ(o.m, 'kg') + ' ' + o.n + ' an acceleration of ' + MQ(a, 'm/s²') + '?', num(F), [
        M('\\Sigma F = m\\,a = ' + Q(o.m, 'kg') + ' \\times ' + Q(a, 'm/s²') + ' = ' + Q(F, 'N')) + '.'
      ], 'Multiply mass by acceleration.', { unit: 'N', vk: 'ma' });
    }
    function findM() {
      var o = obj(), a = R.pick([0.5, 1, 2, 2.5, 4, 5]), F = fix(o.m * a);
      return pr('A net force of ' + MQ(F, 'N') + ' gives a ' + o.n + ' an acceleration of ' + MQ(a, 'm/s²') + '. What is its mass?', num(o.m), [
        'Rearrange ' + M('\\Sigma F = m\\,a') + ' to ' + M('m = \\dfrac{\\Sigma F}{a}') + '.',
        M('m = \\dfrac{' + Q(F, 'N') + '}{' + Q(a, 'm/s²') + '} = ' + Q(o.m, 'kg')) + '.'
      ], 'Divide the force by the acceleration.', { unit: 'kg', vk: 'Fa' });
    }
    function withFriction() {
      var o = obj(), a = R.pick([0.5, 1, 1.5, 2, 3]), net = fix(o.m * a), f = o.m > 100 ? 50 * R.int(2, 20) : 5 * R.int(1, 12), P = fix(net + f);
      return pr('' + cap(aQ(o.m, 'kg')) + ' ' + o.n + ' is pushed with ' + MQ(P, 'N') + ' while friction pushes back with ' + MQ(f, 'N') + '. What is its acceleration?', num(a), [
        'Net force: ' + M(N(P) + ' - ' + N(f) + ' = ' + Q(net, 'N')) + '.',
        M('a = \\dfrac{' + Q(net, 'N') + '}{' + Q(o.m, 'kg') + '} = ' + Q(a, 'm/s²')) + '.'
      ], 'Find the net force first.', { unit: 'm/s²', vk: 'fric' });
    }
    function ratio() {
      var m1 = R.int(2, 6), a1 = R.int(2, 6), F = m1 * a1, m2 = R.pick(U.factors(F).filter(function (x) { return x !== m1 && x > 1 && x <= 3 * F; })) || m1 * 2, a2 = F / m2;
      return pr('A push gives ' + aQ(m1, 'kg') + ' cart an acceleration of ' + MQ(a1, 'm/s²') + '. What acceleration would the same push give ' + aQ(m2, 'kg') + ' cart?', num(a2), [
        'First find the push: ' + M('F = ' + N(m1) + ' \\times ' + N(a1) + ' = ' + Q(F, 'N')) + '.',
        'Then ' + M('a = \\dfrac{' + Q(F, 'N') + '}{' + Q(m2, 'kg') + '} = ' + Q(a2, 'm/s²')) + '.'
      ], 'The force is the same for both carts.', { unit: 'm/s²', vk: 'ratio' });
    }
    function concept() {
      var K = R.pick([
        ['A constant net force keeps acting on a cart on a frictionless track. What happens to its speed?', 'It keeps increasing by the same amount each second.', ['It stays constant.', 'It increases for a while, then stays constant.', 'It decreases.']],
        ['The same net force acts on two carts. Cart B has twice the mass of cart A. How does B\'s acceleration compare?', 'Half of A\'s', ['Twice A\'s', 'The same as A\'s', 'Four times A\'s']],
        ['The net force on a cart is doubled. What happens to its acceleration?', 'It doubles.', ['It halves.', 'It stays the same.', 'It becomes four times as big.']],
        ['A box slides at a steady speed while you push it. What is the net force on it?', 'Zero: your push just balances friction.', ['Your push, since it keeps the box moving.', 'Friction, since it acts backward.', 'The weight of the box.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), [
        'Second law: ' + M('a = \\dfrac{\\Sigma F}{m}') + '. A steady net force gives a steady acceleration; more mass gives less acceleration.',
        'A steady speed (no acceleration) means the net force is zero.', 'Answer: ' + K[1]
      ], 'Use a = ΣF / m.', { vk: 'concept' });
    }
    return lv(R, ctx, [findA, findF], [findA, findF, findM, withFriction, concept], [findM, withFriction, ratio, concept]);
  });

  var PLANETS = [['the Moon', 1.6], ['Mars', 3.7], ['Jupiter (at its cloud tops)', 24.8], ['Venus', 8.9], ['Mercury', 3.7]];
  G('physsci.mass-weight', function (R, ctx) {
    function wE() {
      var m = R.pick([2, 5, 10, 20, 25, 30, 40, 45, 50, 60, 65, 70, 80, 0.5, 1.5]), what = m < 5 ? R.pick(['bag of flour', 'melon', 'textbook']) : m < 35 ? R.pick(['dog', 'suitcase', 'bag of cement']) : R.pick(['student', 'astronaut', 'teacher']);
      return pr('What is the weight on Earth of ' + aQ(m, 'kg') + ' ' + what + '? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(m * 9.8), [
        M('W = m\\,g = ' + Q(m, 'kg') + ' \\times 9.8\\,\\mathrm{N/kg} = ' + Q(m * 9.8, 'N')) + '.'
      ], 'Weight = mass × 9.8 N/kg.', { unit: 'N', vk: 'W' });
    }
    function mFromW() {
      var m = R.pick([2, 5, 10, 15, 20, 30, 40, 50, 60, 75]), W = fix(m * 9.8);
      return pr('A crate weighs ' + MQ(W, 'N') + ' on Earth. What is its mass? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(m), [
        'Rearrange ' + M('W = m\\,g') + ' to ' + M('m = \\dfrac{W}{g}') + '.',
        M('m = \\dfrac{' + Q(W, 'N') + '}{9.8\\,\\mathrm{N/kg}} = ' + Q(m, 'kg')) + '.'
      ], 'Divide the weight by g.', { unit: 'kg', vk: 'm' });
    }
    function planet() {
      var p = R.pick(PLANETS), m = R.pick([10, 20, 40, 50, 60, 70, 80, 90, 100, 120]), askM = R.chance(0.35);
      if (askM) return pr('An astronaut has a mass of ' + MQ(m, 'kg') + ' on Earth. What is her mass on ' + p[0] + '?', num(m, 0), [
        'Mass is the amount of matter in her body. Traveling does not change it.',
        'Her mass is still ' + MQ(m, 'kg') + '. Only her weight changes.'
      ], 'Does flying somewhere change how much matter you are made of?', { unit: 'kg', vk: 'sameM' });
      return pr('On ' + p[0] + ', ' + M('g = ' + N(p[1]) + '\\,\\mathrm{N/kg}') + '. What does ' + aQ(m, 'kg') + ' rover weigh there?', num(m * p[1]), [
        'The mass is still ' + MQ(m, 'kg') + '.',
        M('W = m\\,g = ' + Q(m, 'kg') + ' \\times ' + Q(p[1], 'N/kg') + ' = ' + Q(m * p[1], 'N')) + '.'
      ], 'Use that place\'s g, not 9.8.', { unit: 'N', vk: 'Wp' });
    }
    function concept() {
      var m = R.int(40, 90);
      var K = R.pick([
        ['Which of these is a weight?', Q(m * 9.8, 'N'), [Q(m, 'kg'), Q(m, 'm'), Q(m, 'kg/m^3')]],
        ['An astronaut flies from Earth to the Moon. What happens to her mass and her weight?', 'Her mass stays the same; her weight gets smaller.', ['Both get smaller.', 'Her mass gets smaller; her weight stays the same.', 'Both stay the same.']],
        ['What does a weight measure?', 'The pull of gravity on an object', ['The amount of matter in an object', 'How much space an object takes up', 'How fast an object falls']],
        ['A bathroom scale shows ' + m + ' kg. What is actually being pushed on the scale?', 'A force of about ' + N(m * 9.8) + ' N (the person\'s weight)', ['A force of ' + m + ' kg', 'A mass of ' + N(m * 9.8) + ' N', 'No force; scales measure mass directly']]
      ]);
      var isMath = /\\/.test(K[1]);
      return pr(K[0], mc(isMath ? M(K[1]) : K[1], K[2].map(function (w) { return isMath ? M(w) : w; })), [
        'Mass (kg) is the amount of matter and is the same everywhere. Weight (N) is the force of gravity on that mass: ' + M('W = m\\,g') + '.',
        'Answer: ' + (isMath ? M(K[1]) : K[1])
      ], 'Kilograms measure mass; newtons measure force.', { vk: 'concept' });
    }
    return lv(R, ctx, [wE, wE, concept], [wE, mFromW, planet, concept], [mFromW, planet, concept]);
  });

  G('physsci.friction-intro', function (R, ctx) {
    var obj = R.pick(['box', 'crate', 'dresser', 'sofa', 'filing cabinet', 'bookcase']);
    function stat() {
      var need = 5 * R.int(8, 40), push = 5 * R.int(2, need / 5 - 1);
      return pr('A ' + obj + ' needs ' + MQ(need, 'N') + ' of push to start sliding. You push it with ' + MQ(push, 'N') + ', and it does not move. How big is the friction force on it?', num(push, 0), [
        'The ' + obj + ' stays still, so the net force on it is zero.',
        'Static friction must cancel your push exactly: ' + MQ(push, 'N') + ', against your push.',
        'It is not ' + MQ(need, 'N') + ': that is only the most static friction can give.'
      ], 'If it doesn\'t move, the forces balance.', { unit: 'N', vk: 'static' });
    }
    function steady() {
      var push = 5 * R.int(6, 40);
      return pr('You push a ' + obj + ' across the floor at a steady speed with a force of ' + MQ(push, 'N') + '. How big is the friction force?', num(push, 0), [
        'Steady speed in a straight line means no acceleration, so the net force is zero.',
        'Friction must balance the push: ' + MQ(push, 'N') + '.'
      ], 'Steady speed means balanced forces.', { unit: 'N', vk: 'steady' });
    }
    function net() {
      var f = 5 * R.int(4, 30), push = f + 5 * R.int(1, 20);
      return pr('A ' + obj + ' slides across the floor while you push it with ' + MQ(push, 'N') + '. Kinetic friction on it is ' + MQ(f, 'N') + '. What is the net force?', num(push - f, 0), [
        'Friction points against the sliding, opposite to your push.',
        M(N(push) + ' - ' + N(f) + ' = ' + Q(push - f, 'N')) + ', in the direction of your push.'
      ], 'Friction subtracts from the push.', { unit: 'N', vk: 'fnet' });
    }
    function netA() {
      var m = R.pick([10, 20, 25, 40, 50]), a = R.pick([0.5, 1, 1.5, 2]), f = 5 * R.int(4, 20), push = fix(f + m * a);
      return pr('' + cap(aQ(m, 'kg')) + ' ' + obj + ' is pushed with ' + MQ(push, 'N') + ' and slides; kinetic friction is ' + MQ(f, 'N') + '. What is its acceleration?', num(a), [
        'Net force: ' + M(N(push) + ' - ' + N(f) + ' = ' + Q(push - f, 'N')) + '.',
        M('a = \\dfrac{' + Q(push - f, 'N') + '}{' + Q(m, 'kg') + '} = ' + Q(a, 'm/s²')) + '.'
      ], 'Net force first, then a = ΣF/m.', { unit: 'm/s²', vk: 'fa' });
    }
    function concept() {
      var K = R.pick([
        ['When you walk forward, which way does friction from the ground push on your shoe?', 'Forward', ['Backward', 'Straight down', 'There is no friction when you walk']],
        ['A car speeds up on a dry road. What force from the road pushes the car forward?', 'Friction on the tires', ['The normal force', 'Gravity', 'Air resistance']],
        ['A ' + obj + ' slides to the right across a floor. Which way does friction on it point?', 'To the left', ['To the right', 'Up', 'Down']],
        ['Which change makes it harder to slide a ' + obj + ' across a floor?', 'Loading it with heavy books', ['Waxing the floor', 'Putting it on smooth plastic sliders', 'Taking everything out of it']],
        ['Which change lowers the friction on a sliding ' + obj + '?', 'Putting smooth plastic sliders under it', ['Loading it with heavy books', 'Pushing down on it while you slide it', 'Laying a rough rug under it']],
        ['Why is it hard to walk on smooth ice?', 'There is very little friction to push your feet forward.', ['Ice pulls your feet backward.', 'Gravity is stronger on ice.', 'Your shoes push too hard on the ice.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), [
        'Friction acts where surfaces touch and opposes their sliding against each other. It grows when the surfaces press harder or are rougher.',
        'When you walk or a tire turns, the surface would slip backward against the ground, so friction pushes it forward.', 'Answer: ' + K[1] + '.'
      ], 'Which way would the surfaces slide against each other without friction?', { vk: 'concept' });
    }
    return lv(R, ctx, [stat, steady, concept], [stat, steady, net, concept], [stat, net, netA, concept]);
  });

  G('physsci.third-law-intro', function (R, ctx) {
    function pairF() {
      var C = R.pick([
        ['A truck hits a fly. The truck pushes on the fly with ' , 'How hard does the fly push on the truck?', [0.5, 1, 2, 3]],
        ['A skater pushes on a wall with ', 'How hard does the wall push on the skater?', [40, 60, 90, 120, 150]],
        ['A heavy bowling ball hits a pin with ', 'How hard does the pin push on the ball?', [200, 300, 450, 600]],
        ['A hammer hits a nail with ', 'How hard does the nail push on the hammer?', [500, 800, 1200, 1500]],
        ['A big dog and a small dog bump heads. The big dog pushes on the small dog with ', 'How hard does the small dog push on the big dog?', [30, 50, 80]],
        ['A bat hits a baseball with ', 'How hard does the ball push on the bat?', [2000, 3000, 4000]]
      ]), F = R.pick(C[2]);
      return pr(C[0] + MQ(F, 'N') + '. ' + C[1], num(F, 0), [
        'These two forces are a third-law pair: A on B and B on A.',
        'They are always the same size, whatever the masses or speeds: ' + MQ(F, 'N') + ', in the opposite direction.'
      ], 'Third-law pairs are equal in size.', { unit: 'N', vk: 'pair' });
    }
    function skaters() {
      var m1 = R.int(40, 80), m2 = R.int(25, m1 - 5), F = 10 * R.int(6, 20);
      return pr('' + cap(aQ(m1, 'kg')) + ' skater and ' + aQ(m2, 'kg') + ' skater stand on ice and push each other apart. The bigger skater pushes the smaller one with ' + MQ(F, 'N') + '. What force does the smaller skater exert on the bigger one?', num(F, 0), [
        'The two pushes are a third-law pair, so they are equal in size and opposite in direction: ' + MQ(F, 'N') + '.',
        'The smaller skater moves away faster only because the same force does more to a smaller mass.'
      ], 'Does mass change the size of a third-law pair?', { unit: 'N', vk: 'pair' });
    }
    function reaction() {
      var C = R.pick([
        ['You push a wall with your hands.', 'The wall pushes your hands', ['Friction on your feet pushes you', 'Gravity pulls you down', 'The floor pushes up on you']],
        ['Earth pulls down on a falling apple.', 'The apple pulls up on Earth', ['The air pushes up on the apple', 'The tree pulls on the apple', 'The ground pushes up on the apple']],
        ['A swimmer pushes water backward with her arms.', 'The water pushes the swimmer forward', ['Gravity pulls the swimmer down', 'The water pushes the swimmer down', 'The swimmer\'s legs push her forward']],
        ['A rocket pushes hot gas downward out of its engine.', 'The gas pushes the rocket upward', ['The air under the rocket pushes it upward', 'The launch pad pushes the rocket upward', 'Gravity pulls the gas downward']],
        ['A book presses down on a table.', 'The table pushes up on the book', ['Earth pulls down on the book', 'The book pulls up on Earth', 'The floor pushes up on the table']]
      ]);
      return pr(C[0] + ' Which force is the other half of this third-law pair?', mc(C[1], C[2]), [
        'A third-law pair swaps the two objects: "A pushes B" pairs with "B pushes A."',
        'So the partner is: ' + C[1] + '.'
      ], 'Swap the two objects in the sentence.', { vk: 'concept' });
    }
    function concept() {
      var K = R.pick([
        ['A loaded truck and a small car crash head-on. Which pushes harder on the other?', 'They push on each other equally hard.', ['The truck pushes harder.', 'The car pushes harder.', 'Whichever is moving faster pushes harder.']],
        ['If third-law forces are equal and opposite, why don\'t they cancel out?', 'They act on different objects.', ['They do cancel, so nothing ever moves.', 'One of them is always bigger.', 'They act at different times.']],
        ['Why can a rocket accelerate in empty space, where there is no air?', 'It pushes exhaust gas out, and the gas pushes back on the rocket.', ['It pushes against the air around it.', 'Gravity pulls it forward.', 'It can\'t; rockets only work in air.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Third law: A on B equals B on A, opposite in direction, and the two forces act on different objects.', 'Answer: ' + K[1]], 'Third-law pairs: equal size, opposite direction, different objects.', { vk: 'concept' });
    }
    return lv(R, ctx, [pairF, reaction, concept], [pairF, skaters, reaction, concept], [skaters, reaction, concept, pairF]);
  });

  G('physsci.momentum-intro', function (R, ctx) {
    var THINGS = [['bowling ball', [5, 7]], ['baseball', [0.15, 0.15]], ['bicycle and rider', [70, 90]], ['car', [1000, 1500]], ['shopping cart', [20, 40]], ['football player', [80, 110]], ['soccer ball', [0.4, 0.4]], ['truck', [3000, 6000]]];
    function thing() { var t = R.pick(THINGS), m = t[1][0] === t[1][1] ? t[1][0] : (t[1][1] > 100 ? 100 * R.int(t[1][0] / 100, t[1][1] / 100) : R.int(t[1][0], t[1][1])); return { n: t[0], m: m }; }
    function p() {
      var t = thing(), v = t.m < 1 ? R.int(10, 40) : t.m > 500 ? R.int(5, 30) : R.int(2, 12);
      return pr('What is the momentum of ' + aQ(t.m, 'kg') + ' ' + t.n + ' moving at ' + MQ(v, 'm/s') + '?', num(t.m * v), [
        M('p = m\\,v = ' + Q(t.m, 'kg') + ' \\times ' + Q(v, 'm/s') + ' = ' + Q(t.m * v, 'kg·m/s')) + '.'
      ], 'Multiply mass by velocity.', { unit: 'kg·m/s', vk: 'p' });
    }
    function compare() {
      var mA = R.pick([100, 150, 200, 300, 500]), vA = R.int(1, 4), mB = R.pick([40, 50, 60, 75, 80]), vB = R.int(4, 12), pA = mA * vA, pB = mB * vB;
      if (R.chance(0.2)) { vB = pA / mB; if (!Number.isInteger(vB) || vB > 20) vB = R.int(4, 12); pB = mB * vB; }
      var A = '' + aQ(mA, 'kg') + ' cart rolling at ' + MQ(vA, 'm/s'), B = '' + aQ(mB, 'kg') + ' runner moving at ' + MQ(vB, 'm/s');
      var right = pA > pB ? 'The cart' : pB > pA ? 'The runner' : 'They have the same momentum';
      return pr('Which has more momentum: ' + A + ', or ' + B + '?', mcAll(right, ['The cart', 'The runner', 'They have the same momentum'].filter(function (x) { return x !== right; })), [
        'Cart: ' + M('p = ' + N(mA) + ' \\times ' + N(vA) + ' = ' + Q(pA, 'kg·m/s')) + '.',
        'Runner: ' + M('p = ' + N(mB) + ' \\times ' + N(vB) + ' = ' + Q(pB, 'kg·m/s')) + '.',
        pA === pB ? 'They are equal.' : (pA > pB ? 'The cart' : 'The runner') + ' has more, even though it is ' + (pA > pB ? 'slower' : 'lighter') + '.'
      ], 'Multiply mass by velocity for each, then compare.', { vk: 'cmp' });
    }
    function vFromP() {
      var m = R.pick([2, 4, 5, 10, 20, 50, 60, 80]), v = R.int(2, 15), P = m * v;
      return pr('' + cap(aQ(m, 'kg')) + ' object has a momentum of ' + MQ(P, 'kg·m/s') + '. How fast is it moving?', num(v), [
        'Rearrange ' + M('p = m\\,v') + ' to ' + M('v = \\dfrac{p}{m}') + '.',
        M('v = \\dfrac{' + Q(P, 'kg·m/s') + '}{' + Q(m, 'kg') + '} = ' + Q(v, 'm/s')) + '.'
      ], 'Divide the momentum by the mass.', { unit: 'm/s', vk: 'v' });
    }
    function stick() {
      for (var k = 0; k < 40; k++) { var m1 = R.int(1, 6), m2 = R.int(1, 6), v1 = R.int(2, 9), P = m1 * v1, vf = P / (m1 + m2); if (Number.isInteger(vf * 2)) break; }
      var what = R.pick(['cart', 'glider', 'bumper car']);
      return pr('' + cap(aQ(m1, 'kg')) + ' ' + what + ' moving at ' + MQ(v1, 'm/s') + ' hits ' + aQ(m2, 'kg') + ' ' + what + ' at rest, and they stick together. How fast do they move afterward?', num(vf), [
        'Momentum before: ' + M(N(m1) + ' \\times ' + N(v1) + ' + ' + N(m2) + ' \\times 0 = ' + Q(P, 'kg·m/s')) + '.',
        'After, they move as one object of mass ' + M(N(m1) + ' + ' + N(m2) + ' = ' + Q(m1 + m2, 'kg')) + ' with the same total momentum.',
        M('v = \\dfrac{' + Q(P, 'kg·m/s') + '}{' + Q(m1 + m2, 'kg') + '} = ' + Q(vf, 'm/s')) + '.'
      ], 'Total momentum before = total momentum after.', { unit: 'm/s', vk: 'stick' });
    }
    function recoil() {
      for (var k = 0; k < 40; k++) { var m1 = R.int(40, 90), m2 = R.int(30, 70), v1 = R.int(1, 4), v2 = m1 * v1 / m2; if (Number.isInteger(v2 * 2) && m1 !== m2) break; }
      return pr('Two skaters stand still on ice and push apart. The ' + MQ(m1, 'kg') + ' skater glides away at ' + MQ(v1, 'm/s') + '. How fast does the ' + MQ(m2, 'kg') + ' skater glide away?', num(v2), [
        'Total momentum before: 0, since both are still.',
        'After, the two momenta must cancel: ' + M(N(m1) + ' \\times ' + N(v1) + ' = ' + N(m2) + ' \\times v') + '.',
        M('v = \\dfrac{' + N(m1 * v1) + '}{' + N(m2) + '} = ' + Q(v2, 'm/s')) + ', in the opposite direction.'
      ], 'The total momentum stays zero.', { unit: 'm/s', vk: 'recoil' });
    }
    return lv(R, ctx, [p, p, compare], [p, compare, vFromP, stick], [compare, stick, recoil, vFromP]);
  });

  G('physsci.collision-time', function (R, ctx) {
    var OBJ = [['ball', [0.5, 0.6]], ['egg', [0.06, 0.06]], ['baseball', [0.15, 0.15]], ['crash-test dummy', [50, 80]], ['skateboarder', [40, 70]], ['bowling ball', [6, 6]]];
    function setup() {
      for (var k = 0; k < 60; k++) {
        var o = R.pick(OBJ), m = o[1][0] === o[1][1] ? o[1][0] : o[1][0] < 1 ? R.pick(o[1]) : R.int(o[1][0], o[1][1]), v = o[0] === 'egg' ? R.int(3, 6) : o[1][0] > 10 ? R.int(5, 15) : R.int(4, 20);
        var dp = fix(m * v), t = R.pick(o[1][0] > 10 ? [0.05, 0.1, 0.2, 0.25, 0.5] : [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1]), F = dp / t;
        if (Number.isInteger(fix(F))) return { n: o[0], m: m, v: v, dp: dp, t: t, F: fix(F) };
      }
      return { n: 'ball', m: 0.5, v: 10, dp: 5, t: 0.01, F: 500 };
    }
    function force() {
      var s = setup(), how = s.n === 'crash-test dummy' ? R.pick(['an airbag', 'a seat belt']) : s.n === 'skateboarder' ? 'a padded wall' : R.pick(['a wall', 'a catcher\'s mitt', 'a pile of sand', 'a net']);
      return pr('' + cap(aQ(s.m, 'kg')) + ' ' + s.n + ' moving at ' + MQ(s.v, 'm/s') + ' is brought to a stop by ' + how + ' in ' + MQ(s.t, 's') + '. What is the average force on it?', num(s.F), [
        'Change in momentum: ' + M('\\Delta p = ' + N(s.m) + ' \\times ' + N(s.v) + ' = ' + Q(s.dp, 'kg·m/s')) + '.',
        M('F = \\dfrac{\\Delta p}{t} = \\dfrac{' + Q(s.dp, 'kg·m/s') + '}{' + Q(s.t, 's') + '} = ' + Q(s.F, 'N')) + '.'
      ], 'F = change in momentum ÷ stopping time.', { unit: 'N', vk: 'F' });
    }
    function compare() {
      var s = setup(), k = R.pick([2, 4, 5, 10, 20]), t2 = fix(s.t * k), F2 = fix(s.dp / t2);
      return pr('' + cap(aQ(s.m, 'kg')) + ' ' + s.n + ' moving at ' + MQ(s.v, 'm/s') + ' stops in ' + MQ(s.t, 's') + ' on a hard floor. On a soft mat, the same stop takes ' + MQ(t2, 's') + '. What is the average force on the mat?', num(F2), [
        'The change in momentum is the same both times: ' + M(N(s.m) + ' \\times ' + N(s.v) + ' = ' + Q(s.dp, 'kg·m/s')) + '.',
        'On the mat: ' + M('F = \\dfrac{' + Q(s.dp, 'kg·m/s') + '}{' + Q(t2, 's') + '} = ' + Q(F2, 'N')) + '.',
        k + ' times the stopping time gives 1/' + k + ' of the force (it was ' + MQ(s.F, 'N') + ' on the floor).'
      ], 'The momentum change is the same; only the time changes.', { unit: 'N', vk: 'F2' });
    }
    function time() {
      var s = setup(), Fmax = s.F / R.pick([2, 4, 5, 10]);
      return pr('' + cap(aQ(s.m, 'kg')) + ' ' + s.n + ' moving at ' + MQ(s.v, 'm/s') + ' must be stopped with an average force of ' + MQ(Fmax, 'N') + '. How long must the stop take?', num(s.dp / Fmax), [
        'Change in momentum: ' + M(N(s.m) + ' \\times ' + N(s.v) + ' = ' + Q(s.dp, 'kg·m/s')) + '.',
        'Rearrange ' + M('F\\,t = \\Delta p') + ': ' + M('t = \\dfrac{' + Q(s.dp, 'kg·m/s') + '}{' + Q(Fmax, 'N') + '} = ' + Q(fix(s.dp / Fmax), 's')) + '.'
      ], 't = Δp ÷ F.', { unit: 's', vk: 't' });
    }
    function concept() {
      var K = R.pick([
        ['An airbag lowers the force on a passenger in a crash mainly because it…', 'makes the passenger\'s stop take longer.', ['reduces the passenger\'s change in momentum.', 'makes the car stop sooner.', 'reduces the passenger\'s mass.']],
        ['Why do you bend your knees when you land after a jump?', 'It makes the stop take longer, so the force on your legs is smaller.', ['It lowers your momentum before you land.', 'It makes the stop shorter, so the force is smaller.', 'It increases your change in momentum.']],
        ['An egg is dropped from the same height onto a pillow and onto a floor. Compare its change in momentum.', 'It is the same on both.', ['It is smaller on the pillow.', 'It is smaller on the floor.', 'It is zero on the pillow.']],
        ['A car\'s front end is built to crumple in a crash. What does this do?', 'It stretches the stop over more time, lowering the force on the people inside.', ['It reduces the car\'s momentum before the crash.', 'It makes the car stop in less time.', 'It increases the car\'s mass.']],
        ['A catcher pulls her mitt back as she catches a fast ball. Why?', 'The longer stopping time means a smaller force on her hand.', ['It reduces the ball\'s change in momentum.', 'It makes the ball lighter.', 'It speeds up the catch.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), [
        'The object goes from moving to stopped either way, so its change in momentum is the same.',
        'Since ' + M('F = \\dfrac{\\Delta p}{t}') + ', a longer stopping time gives a smaller force.', 'Answer: ' + K[1]
      ], 'Which part of F = Δp/t can padding change?', { vk: 'concept' });
    }
    return lv(R, ctx, [force, concept], [force, compare, concept], [compare, time, concept]);
  });

  G('physsci.gravity-mass-distance', function (R, ctx) {
    function frD(k) { return k === 2 ? 'twice' : k === 3 ? 'three times' : k === 4 ? 'four times' : k + ' times'; }
    function scale(lvl) {
      var F = R.pick([36, 72, 144, 180, 360, 720, 900, 1800]), mk = 1, dk = 1, half = false;
      var kind = lvl === 1 ? R.pick(['m', 'd']) : R.pick(['m', 'd', 'both', 'both']);
      if (kind !== 'd') mk = R.pick([2, 3, 4]); if (kind !== 'm') dk = R.pick([2, 3]);
      if (lvl === 3 && kind !== 'm' && R.chance(0.4)) { half = true; dk = 0.5; }
      var F2 = F * mk / (dk * dk), pair = R.pick(['Two asteroids', 'Two lead balls', 'A planet and its moon', 'Two space probes']);
      var change = [];
      if (mk !== 1) change.push('one of them is replaced by an object with ' + frD(mk) + ' the mass');
      if (dk !== 1) change.push(half ? 'the distance between their centers is cut in half' : 'the distance between their centers becomes ' + frD(dk) + ' as large');
      var st = [];
      if (mk !== 1) st.push('Mass × ' + mk + ': force × ' + mk + '.');
      if (dk !== 1) st.push(half ? 'Distance ÷ 2: force × ' + M('2^2 = 4') + '.' : 'Distance × ' + dk + ': force ÷ ' + M(dk + '^2 = ' + dk * dk) + '.');
      st.push('New force: ' + M(N(F) + (mk !== 1 ? ' \\times ' + mk : '') + (dk !== 1 ? (half ? ' \\times 4' : ' \\div ' + dk * dk) : '') + (Number.isInteger(fix(F2)) ? ' = ' : ' \\approx ') + Q(sig(F2, 3), 'N')) + '.');
      return pr(pair + ' pull on each other with a gravitational force of ' + MQ(F, 'N') + '. Then ' + change.join(', and ') + '. What is the force now?', num(sig(F2, 4)), st, 'Force grows with each mass and falls with the square of the distance.', { unit: 'N', vk: 'grav' });
    }
    function radii() {
      var k = R.pick([2, 3, 4]), u = k * k * 5, W = u * R.int(MA.ceil(500 / u), MA.floor(900 / u));
      return pr('An astronaut weighs ' + MQ(W, 'N') + ' on Earth\'s surface, one Earth radius from Earth\'s center. What would she weigh ' + frD(k) + ' as far from Earth\'s center?', num(sig(W / (k * k), 4)), [
        'Distance × ' + k + ' means the pull is divided by ' + M(k + '^2 = ' + k * k) + '.',
        M(N(W) + ' \\div ' + k * k + (Number.isInteger(W / (k * k)) ? ' = ' : ' \\approx ') + Q(sig(W / (k * k), 3), 'N')) + '.'
      ], 'Square the distance factor.', { unit: 'N', vk: 'rad' });
    }
    function concept() {
      var K = R.pick([
        ['Astronauts float inside the space station, about 400 km above Earth. Why?', 'They and the station are falling around Earth together.', ['There is no gravity in space.', 'There is no air up there for gravity to act through.', 'The station\'s walls block Earth\'s gravity.']],
        ['The distance between two moons doubles. What happens to the gravitational pull between them?', 'It becomes one quarter as strong.', ['It becomes half as strong.', 'It doubles.', 'It stays the same.']],
        ['Which pair pulls on each other with gravity?', 'Any two objects that have mass', ['Only planets and stars', 'Only objects that are touching', 'Only objects surrounded by air']],
        ['Why don\'t you feel the gravitational pull of the person sitting next to you?', 'The pull is real but far too small to notice, because people have so little mass.', ['Gravity only acts between planets.', 'The air blocks it.', 'People\'s pulls cancel out exactly.']],
        ['Does gravity need air to act?', 'No: it works across empty space, which is how the Sun holds Earth in orbit.', ['Yes: without air there is no gravity.', 'Only on planets with thick air.', 'Yes, which is why astronauts float.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), [
        'Every two masses attract. The pull grows with the masses, falls with the square of the distance, and crosses empty space.',
        'Answer: ' + K[1]
      ], 'Gravity acts between all masses, everywhere.', { vk: 'concept' });
    }
    return lv(R, ctx, [function () { return scale(1); }, concept], [function () { return scale(2); }, radii, concept], [function () { return scale(3); }, radii, concept]);
  });

  G('physsci.pressure', function (R, ctx) {
    function findP() {
      var A = R.pick([0.01, 0.02, 0.025, 0.04, 0.05, 0.1, 0.2, 0.25, 0.5, 2]), P = R.pick([200, 500, 1000, 1500, 2000, 4000, 6000, 10000, 20000]), F = fix(P * A);
      if (F < 5) { A = A * 100; F = fix(P * A); }
      var what = R.pick(['A crate', 'A statue', 'A hiker', 'A box of books', 'A water tank']);
      return pr(what + ' pushes down with a force of ' + MQ(F, 'N') + ' on an area of ' + MQ(A, 'm²') + '. What pressure does it put on the ground?', num(P), [
        M('P = \\dfrac{F}{A} = \\dfrac{' + Q(F, 'N') + '}{' + Q(A, 'm²') + '} = ' + Q(P, 'Pa')) + '.'
      ], 'Pressure = force ÷ area.', { unit: 'Pa', vk: 'P' });
    }
    function findF() {
      var A = R.pick([0.5, 1, 2, 3, 0.25]), P = R.pick([1000, 2000, 5000, 10000, 101000]), F = fix(P * A);
      var what = P === 101000 ? 'The air at sea level presses with a pressure of about' : 'Water presses on the bottom of a tank with a pressure of';
      return pr(what + ' ' + MQ(P, 'Pa') + '. What force does it put on an area of ' + MQ(A, 'm²') + '?', num(F), [
        'Rearrange ' + M('P = \\dfrac{F}{A}') + ' to ' + M('F = P\\,A') + '.',
        M('F = ' + Q(P, 'Pa') + ' \\times ' + Q(A, 'm²') + ' = ' + Q(F, 'N')) + '.'
      ], 'Force = pressure × area.', { unit: 'N', vk: 'F' });
    }
    function findA() {
      var F = R.pick([600, 800, 1200, 2400, 3000]), P = R.pick([1000, 2000, 3000, 4000, 6000, 12000]), A = F / P;
      if (!Number.isInteger(fix(A * 1000))) { P = 2000; A = F / P; }
      return pr('Snow can hold a pressure of ' + MQ(P, 'Pa') + ' before you sink in. What total area must snowshoes have to hold up ' + aQ(F, 'N') + ' person?', num(fix(A)), [
        'Rearrange ' + M('P = \\dfrac{F}{A}') + ' to ' + M('A = \\dfrac{F}{P}') + '.',
        M('A = \\dfrac{' + Q(F, 'N') + '}{' + Q(P, 'Pa') + '} = ' + Q(fix(A), 'm²')) + '.'
      ], 'Area = force ÷ pressure.', { unit: 'm²', vk: 'A' });
    }
    function compare() {
      var F1 = R.pick([300, 400, 500]), A1 = R.pick([0.01, 0.02]), F2 = F1 * R.pick([2, 3]), A2 = A1 * R.pick([4, 5, 10]);
      var P1 = F1 / A1, P2 = F2 / A2, right = P1 > P2 ? 'The child' : 'The adult';
      return pr('' + cap(aQ(F1, 'N')) + ' child stands in boots with a total area of ' + MQ(A1, 'm²') + '. ' + cap(aQ(F2, 'N')) + ' adult stands on snowshoes with a total area of ' + MQ(A2, 'm²') + '. Who puts more pressure on the snow?', mcAll(right, ['The child', 'The adult', 'They put the same pressure'].filter(function (x) { return x !== right; })), [
        'Child: ' + M('\\dfrac{' + N(F1) + '}{' + N(A1) + '} = ' + Q(fix(P1), 'Pa')) + '.',
        'Adult: ' + M('\\dfrac{' + N(F2) + '}{' + N(A2) + '} = ' + Q(fix(P2), 'Pa')) + '.',
        right + ' does, even though ' + (right === 'The child' ? 'the child weighs less: the small area matters more.' : 'the area is bigger.')
      ], 'Compare force ÷ area, not force alone.', { vk: 'cmpP' });
    }
    function cm2() {
      var Acm = R.pick([2, 5, 10, 20, 50, 100, 200]), P = R.pick([1000, 5000, 10000, 20000, 50000]), A = Acm / 10000, F = fix(P * A);
      return pr('A force of ' + MQ(F, 'N') + ' presses on an area of ' + MQ(Acm, 'cm²') + '. What is the pressure in pascals? (' + M('1\\,\\mathrm{m^2} = 10{,}000\\,\\mathrm{cm^2}') + ')', num(P), [
        'Change the area to square meters: ' + M(N(Acm) + ' \\div 10{,}000 = ' + Q(A, 'm²')) + '.',
        M('P = \\dfrac{' + Q(F, 'N') + '}{' + Q(A, 'm²') + '} = ' + Q(P, 'Pa')) + '.'
      ], 'A pascal is a newton per square meter, so convert the area first.', { unit: 'Pa', vk: 'Pcm' });
    }
    function concept() {
      var K = R.pick([
        ['Why does a sharp knife cut better than a dull one?', 'Its thin edge puts the force on a tiny area, so the pressure is huge.', ['A sharp knife pushes with more force.', 'A sharp edge has a bigger area.', 'Sharp knives weigh more.']],
        ['Why do snowshoes keep you from sinking into deep snow?', 'They spread your weight over a bigger area, lowering the pressure.', ['They make you lighter.', 'They reduce the force of gravity on you.', 'They increase the pressure on the snow.']],
        ['A brick is laid flat, then stood on its end. What happens to the pressure it puts on the ground?', 'It goes up, because the same weight presses on a smaller area.', ['It goes down, because the weight is spread out.', 'It stays the same, because the weight is the same.', 'It drops to zero.']],
        ['A tractor has very wide tires. Why?', 'Wide tires spread the weight, so they sink less into soft soil.', ['Wide tires make the tractor lighter.', 'Wide tires push harder into the soil.', 'Wide tires increase the pressure.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Pressure is force divided by area. The same force on a smaller area gives more pressure; on a bigger area, less.', 'Answer: ' + K[1]], 'P = F/A: what happens when A changes?', { vk: 'concept' });
    }
    return lv(R, ctx, [findP, findP, concept], [findP, findF, findA, compare, concept], [findA, compare, cm2, concept]);
  });

  // ---------- g3_energy.js ----------
  // ===================== Unit 3: Energy, Work and Heat =====================
  G('physsci.energy-forms', function (R, ctx) {
    var FORMS = { K: 'kinetic energy (motion)', G: 'gravitational potential energy (height)', E: 'elastic potential energy (stretch or squeeze)', T: 'thermal energy', C: 'chemical energy', L: 'electrical energy', R: 'light energy', S: 'sound energy' };
    function form() {
      var K = R.pick([
        ['a stretched rubber band', 'E'], ['a squeezed spring in a toy launcher', 'E'], ['a drawn bow, just before the arrow flies', 'E'],
        ['a rock resting at the edge of a cliff', 'G'], ['water held behind a tall dam', 'G'], ['a book on a high shelf', 'G'],
        ['a rolling bowling ball', 'K'], ['wind blowing through a field', 'K'], ['a flying soccer ball', 'K'],
        ['a sandwich', 'C'], ['the gasoline in a car\'s tank', 'C'], ['a charged battery that is not connected to anything', 'C'], ['a log of firewood', 'C'],
        ['a cup of hot cocoa (compared with a cold one)', 'T'], ['the glow you feel from a campfire\'s embers', 'T']
      ]);
      var wrongs = R.sample(Object.keys(FORMS).filter(function (k) { return k !== K[1]; }), 3).map(function (k) { return cap(FORMS[k]); });
      return pr('What kind of energy is mainly stored in or carried by ' + K[0] + '?', mc(cap(FORMS[K[1]]), wrongs), [
        'Ask what makes it able to cause a change: motion, height, a stretch or squeeze, hotness, or something stored in its substance.',
        'Here it is ' + FORMS[K[1]] + '.'
      ], 'Is it moving, high up, stretched, hot, or storing energy in its substance?', { vk: 'concept' });
    }
    function chain() {
      var K = R.pick([
        ['an electric toaster', 'Electrical energy into thermal energy', ['Thermal energy into electrical energy', 'Chemical energy into light energy', 'Kinetic energy into electrical energy']],
        ['a battery-powered flashlight', 'Chemical energy into electrical energy into light (and some heat)', ['Light into chemical energy', 'Thermal energy into chemical energy', 'Sound into light']],
        ['a wind turbine', 'Kinetic energy of the wind into electrical energy', ['Electrical energy into wind', 'Chemical energy into electrical energy', 'Light into kinetic energy']],
        ['a solar panel', 'Light energy into electrical energy', ['Electrical energy into light energy', 'Thermal energy into chemical energy', 'Sound into electrical energy']],
        ['a person riding a bicycle', 'Chemical energy from food into kinetic energy (and heat)', ['Kinetic energy into chemical energy', 'Electrical energy into kinetic energy', 'Light into kinetic energy']],
        ['a loudspeaker', 'Electrical energy into sound energy', ['Sound energy into electrical energy', 'Chemical energy into sound energy', 'Light into sound']],
        ['a ball dropped from a window (while it falls)', 'Gravitational potential energy into kinetic energy', ['Kinetic energy into gravitational potential energy', 'Chemical energy into kinetic energy', 'Thermal energy into kinetic energy']],
        ['a car\'s brakes slowing it down', 'Kinetic energy into thermal energy', ['Thermal energy into kinetic energy', 'Chemical energy into kinetic energy', 'Kinetic energy into chemical energy']],
        ['a gas stove burner', 'Chemical energy into thermal energy and light', ['Thermal energy into chemical energy', 'Electrical energy into chemical energy', 'Kinetic energy into thermal energy']]
      ]);
      return pr('Which energy change happens in ' + K[0] + '?', mc(K[1], K[2]), [
        'Find where the energy starts (what is used up or slowed down) and where it ends up (what the device is for).',
        'Answer: ' + K[1] + '.'
      ], 'Where does the energy come from, and where does it go?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['When a battery goes flat, its energy has been destroyed.', false, 'The energy has turned into light, sound and heat; it was not destroyed.'],
        ['Energy can change from one form into another.', true, 'Every device and process changes energy from one form to others.'],
        ['A force and an energy are the same thing, measured in different units.', false, 'A force is a push or pull (newtons); energy is an amount that can be stored and passed along (joules).'],
        ['When a swing slows down, some of its energy becomes thermal energy and sound.', true, 'Air resistance and rubbing turn some motion into heat and sound.'],
        ['The total amount of energy stays the same in every change.', true, 'Energy is conserved: it only changes form or moves.'],
        ['Food stores chemical energy.', true, 'Food\'s chemical energy is released when your body uses it.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Energy is never created or destroyed.', { vk: 'concept' });
    }
    function units() {
      if (R.coin()) { var k = R.pick([2.5, 4, 12, 36, 0.5, 150, 7.2]); return pr('A snack bar has ' + MQ(k * 100, 'kJ') + ' of energy. How many joules is that?', num(k * 100000, 0), [
        'Kilo means 1,000, so ' + M('1\\,\\mathrm{kJ} = 1{,}000\\,\\mathrm{J}') + '.', M(N(k * 100) + ' \\times 1{,}000 = ' + Q(k * 100000, 'J')) + '.'
      ], 'Kilo means a thousand.', { unit: 'J', vk: 'kJ' }); }
      var cal = R.pick([50, 100, 150, 200, 250, 300]);
      return pr('One food Calorie is ' + MQ(4184, 'J') + '. How many joules are in a snack labeled ' + cal + ' Calories?', num(cal * 4184), [
        M(N(cal) + ' \\times 4{,}184\\,\\mathrm{J} = ' + Q(cal * 4184, 'J')) + '.'
      ], 'Multiply by the joules in one Calorie.', { unit: 'J', vk: 'cal' });
    }
    return lv(R, ctx, [form, chain, tfq], [form, chain, tfq, units], [chain, tfq, units, form]);
  });

  G('physsci.kinetic-energy', function (R, ctx) {
    var OBJ = [['ball', [1, 2, 4, 6]], ['cart', [2, 4, 5, 10, 20]], ['bicycle and rider', [60, 70, 80, 90]], ['car', [800, 1000, 1200, 1500]], ['runner', [50, 60, 70, 80]], ['bowling ball', [4, 6, 8]]];
    function ke() {
      var o = R.pick(OBJ), m = R.pick(o[1]), v = m >= 800 ? R.pick([10, 15, 20, 25, 30]) : m >= 50 ? R.int(2, 10) : R.int(2, 12), E = m * v * v / 2;
      return pr('Find the kinetic energy of ' + aQ(m, 'kg') + ' ' + o[0] + ' moving at ' + MQ(v, 'm/s') + '.', num(E), [
        'Square the speed first: ' + M(N(v) + '^2 = ' + N(v * v)) + '.',
        M('\\text{KE} = \\tfrac{1}{2} \\times ' + N(m) + ' \\times ' + N(v * v) + ' = ' + Q(E, 'J')) + '.'
      ], 'KE = ½ m v². Square the speed before multiplying.', { unit: 'J', vk: 'KE' });
    }
    function ratio() {
      var k = R.pick([2, 3, 4, 0.5]), E = R.pick([50, 100, 120, 200, 400, 500, 1000]), E2 = E * k * k, how = k === 2 ? 'doubles' : k === 3 ? 'triples' : k === 4 ? 'becomes four times as fast' : 'is cut in half';
      return pr('A skateboarder has ' + MQ(E, 'J') + ' of kinetic energy. If her speed ' + how + ', what is her kinetic energy?', num(E2), [
        'KE depends on the speed squared, so multiply the energy by ' + M((k === 0.5 ? '\\left(\\tfrac{1}{2}\\right)' : k) + '^2 = ' + (k === 0.5 ? '\\tfrac{1}{4}' : k * k)) + '.',
        M(N(E) + ' \\times ' + (k === 0.5 ? '\\tfrac{1}{4}' : k * k) + ' = ' + Q(E2, 'J')) + '.'
      ], 'Speed is squared in the formula.', { unit: 'J', vk: 'ratio' });
    }
    function findV() {
      var m = R.pick([2, 4, 5, 10, 50, 100]), v = R.int(2, 10), E = m * v * v / 2;
      return pr('' + cap(aQ(m, 'kg')) + ' object has ' + MQ(E, 'J') + ' of kinetic energy. How fast is it moving?', num(v), [
        M(N(E) + ' = \\tfrac{1}{2} \\times ' + N(m) + ' \\times v^2') + ', so ' + M(N(E) + ' = ' + (m === 2 ? '' : N(m / 2) + '\\,') + 'v^2') + '.',
        M('v^2 = ' + (m === 2 ? N(v * v) : N(E) + ' \\div ' + N(m / 2) + ' = ' + N(v * v))) + ', so ' + M('v = \\sqrt{' + N(v * v) + '} = ' + Q(v, 'm/s')) + '.'
      ], 'Undo the ½ m first, then take the square root.', { unit: 'm/s', vk: 'v' });
    }
    function findM() {
      var v = R.int(2, 10), m = R.pick([2, 3, 4, 5, 6, 8, 10, 20]), E = m * v * v / 2;
      return pr('A cart moving at ' + MQ(v, 'm/s') + ' has ' + MQ(E, 'J') + ' of kinetic energy. What is its mass?', num(m), [
        M('\\tfrac{1}{2}\\,m\\,v^2 = \\tfrac{1}{2} \\times m \\times ' + N(v * v) + ' = ' + N(v * v / 2) + '\\,m') + '.',
        M(N(v * v / 2) + '\\,m = ' + N(E)) + ', so ' + M('m = ' + Q(m, 'kg')) + '.'
      ], 'Work out ½ v² first, then divide.', { unit: 'kg', vk: 'm' });
    }
    function compare() {
      var mA = R.pick([1000, 1200, 1500]), vA = R.pick([10, 12, 15]), mB = mA / 2, vB = vA * 2, EA = mA * vA * vA / 2, EB = mB * vB * vB / 2;
      return pr('Car A has a mass of ' + MQ(mA, 'kg') + ' and moves at ' + MQ(vA, 'm/s') + '. Car B has half the mass and moves twice as fast. Which has more kinetic energy?', mcAll('Car B', ['Car A', 'They have the same kinetic energy']), [
        'Car A: ' + M('\\tfrac{1}{2} \\times ' + N(mA) + ' \\times ' + N(vA) + '^2 = ' + Q(EA, 'J')) + '.',
        'Car B: ' + M('\\tfrac{1}{2} \\times ' + N(mB) + ' \\times ' + N(vB) + '^2 = ' + Q(EB, 'J')) + '.',
        'Halving the mass halves KE, but doubling the speed multiplies it by 4, so B has twice as much.'
      ], 'Which matters more: the mass or the speed?', { vk: 'cmpKE' });
    }
    return lv(R, ctx, [ke, ke, ratio], [ke, ratio, findV, findM], [ratio, findV, findM, compare]);
  });

  G('physsci.potential-energy', function (R, ctx) {
    function pe() {
      var m = R.pick([0.5, 1, 2, 3, 4, 5, 10, 20, 50]), h = R.pick([0.5, 1, 1.5, 2, 3, 4, 5, 10, 20]), E = fix(m * 9.8 * h);
      var what = R.pick(['box', 'backpack', 'bucket of water', 'potted plant', 'bag of sand']);
      return pr('' + cap(aQ(m, 'kg')) + ' ' + what + ' is lifted ' + MQ(h, 'm') + ' above the floor. How much gravitational potential energy does it gain? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(E), [
        M('\\text{PE} = m\\,g\\,h = ' + N(m) + ' \\times 9.8 \\times ' + N(h) + ' = ' + Q(E, 'J')) + '.'
      ], 'PE = m × g × h.', { unit: 'J', vk: 'PE' });
    }
    function findH() {
      var m = R.pick([1, 2, 5, 10, 20, 50]), h = R.pick([1, 2, 3, 4, 5, 8, 10, 12, 15]), E = fix(m * 9.8 * h);
      return pr('' + cap(aQ(m, 'kg')) + ' rock gains ' + MQ(E, 'J') + ' of potential energy when it is lifted. How high was it lifted? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(h), [
        'Weight: ' + M(N(m) + ' \\times 9.8 = ' + Q(fix(m * 9.8), 'N')) + '.',
        M('h = \\dfrac{\\text{PE}}{m\\,g} = \\dfrac{' + N(E) + '}{' + N(fix(m * 9.8)) + '} = ' + Q(h, 'm')) + '.'
      ], 'Divide the PE by the weight m × g.', { unit: 'm', vk: 'h' });
    }
    function change() {
      var m = R.pick([1, 2, 3, 5]), t = R.pick([0.6, 0.75, 0.8, 0.9, 1.0]), s = fix(t + R.pick([0.5, 0.8, 1, 1.2, 1.5])), d = fix(s - t), E = fix(m * 9.8 * d);
      return pr('' + cap(aQ(m, 'kg')) + ' book moves from a table ' + MQ(t, 'm') + ' above the floor to a shelf ' + MQ(s, 'm') + ' above the floor. By how much does its potential energy increase? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(E), [
        'Only the change in height matters: ' + M(N(s) + ' - ' + N(t) + ' = ' + Q(d, 'm')) + '.',
        M('\\Delta \\text{PE} = m\\,g\\,\\Delta h = ' + N(m) + ' \\times 9.8 \\times ' + N(d) + ' = ' + Q(E, 'J')) + '.',
        'Measuring from the floor or from the table gives this same change.'
      ], 'Use the difference in height, measured from one zero level.', { unit: 'J', vk: 'dPE' });
    }
    function ref() {
      var m = R.pick([2, 3, 5]), t = R.pick([0.8, 1.0]), h = R.pick([0.5, 1, 1.5, 2]), H = fix(t + h), E = fix(m * 9.8 * h);
      return pr('' + cap(aQ(m, 'kg')) + ' vase sits on a shelf ' + MQ(h, 'm') + ' above a tabletop, and the tabletop is ' + MQ(t, 'm') + ' above the floor. Using the <b>tabletop</b> as the zero level, what is the vase\'s potential energy? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(E), [
        'Measure the height from the chosen zero, the tabletop: ' + MQ(h, 'm') + '.',
        M('\\text{PE} = ' + N(m) + ' \\times 9.8 \\times ' + N(h) + ' = ' + Q(E, 'J')) + '. (From the floor it would be ' + MQ(fix(m * 9.8 * H), 'J') + '; both are fine as long as you stick to one zero.)'
      ], 'Which level is zero?', { unit: 'J', vk: 'ref' });
    }
    function concept() {
      var K = R.pick([
        ['Two identical boxes sit on shelves. Box A is 2 m up; box B is 4 m up. Compare their potential energies (floor as zero).', 'B has twice as much as A.', ['A has twice as much as B.', 'They have the same.', 'B has four times as much as A.']],
        ['A 2 kg rock and a 6 kg rock sit on the same ledge. Compare their potential energies.', 'The 6 kg rock has three times as much.', ['They have the same, because they are at the same height.', 'The 2 kg rock has more.', 'The 6 kg rock has nine times as much.']],
        ['What happens to a ball\'s potential energy as it rolls down a hill?', 'It decreases, turning into kinetic energy.', ['It increases.', 'It stays the same.', 'It disappears.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['PE = m g h: it is proportional to the mass and to the height above the zero level.', 'Answer: ' + K[1]], 'PE grows in proportion to both mass and height.', { vk: 'concept' });
    }
    return lv(R, ctx, [pe, pe, concept], [pe, findH, change, concept], [findH, change, ref, concept]);
  });

  G('physsci.energy-conservation-intro', function (R, ctx) {
    var HV = [[0.4, 2.8], [1.6, 5.6], [3.6, 8.4], [6.4, 11.2], [10, 14], [14.4, 16.8], [2.5, 7], [4.9, 9.8]];
    function bottom() {
      var m = R.pick([0.5, 1, 2, 3, 5, 10]), h = R.pick([1, 2, 2.5, 4, 5, 10, 20]), E = fix(m * 9.8 * h), obj = R.pick(['ball', 'stone', 'apple', 'water balloon']);
      return pr('' + cap(aQ(m, 'kg')) + ' ' + obj + ' is dropped from ' + MQ(h, 'm') + '. Ignoring air resistance, what is its kinetic energy just before it lands? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(E), [
        'At the top: ' + M('\\text{PE} = ' + N(m) + ' \\times 9.8 \\times ' + N(h) + ' = ' + Q(E, 'J')) + ', and KE = 0.',
        'At the bottom all of it has become kinetic energy: ' + MQ(E, 'J') + '.'
      ], 'All the PE at the top becomes KE at the bottom.', { unit: 'J', vk: 'KEb' });
    }
    function up() {
      var m = R.pick([0.5, 1, 2, 4, 5]), h = R.pick([1, 2, 2.5, 3, 4, 5, 10]), E = fix(m * 9.8 * h);
      return pr('' + cap(aQ(m, 'kg')) + ' ball is thrown straight up with ' + MQ(E, 'J') + ' of kinetic energy. Ignoring air resistance, how high does it rise? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(h), [
        'At the top it stops for an instant, so all ' + MQ(E, 'J') + ' has become potential energy.',
        M('h = \\dfrac{\\text{PE}}{m\\,g} = \\dfrac{' + N(E) + '}{' + N(fix(m * 9.8)) + '} = ' + Q(h, 'm')) + '.'
      ], 'At the highest point, KE has all turned into PE.', { unit: 'm', vk: 'up' });
    }
    function mid() {
      var m = R.pick([1, 2, 4, 5]), h = R.pick([5, 8, 10, 12, 20]), h2 = R.int(1, h - 1), Etot = fix(m * 9.8 * h), PE2 = fix(m * 9.8 * h2), KE2 = fix(Etot - PE2);
      return pr('' + cap(aQ(m, 'kg')) + ' ball is dropped from ' + MQ(h, 'm') + '. Ignoring air resistance, what is its kinetic energy when it is ' + MQ(h2, 'm') + ' above the ground? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(KE2), [
        'Total energy (all PE at the start): ' + M(N(m) + ' \\times 9.8 \\times ' + N(h) + ' = ' + Q(Etot, 'J')) + '.',
        'PE at ' + MQ(h2, 'm') + ': ' + M(N(m) + ' \\times 9.8 \\times ' + N(h2) + ' = ' + Q(PE2, 'J')) + '.',
        'KE is the rest: ' + M(N(Etot) + ' - ' + N(PE2) + ' = ' + Q(KE2, 'J')) + '.'
      ], 'KE + PE stays equal to the starting total.', { unit: 'J', vk: 'mid' });
    }
    function speed() {
      var hv = R.pick(HV), m = R.pick([1, 2, 5]);
      return pr('' + cap(aQ(m, 'kg')) + ' ball rolls from rest down a smooth slide that drops ' + MQ(hv[0], 'm') + '. Ignoring friction, how fast is it going at the bottom? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(hv[1]), [
        'PE at the top: ' + M(N(m) + ' \\times 9.8 \\times ' + N(hv[0]) + ' = ' + Q(fix(m * 9.8 * hv[0]), 'J')) + '. That all becomes KE.',
        M('\\tfrac{1}{2} \\times ' + N(m) + ' \\times v^2 = ' + N(fix(m * 9.8 * hv[0]))) + ', so ' + M('v^2 = ' + N(fix(2 * 9.8 * hv[0])) ) + '.',
        M('v = \\sqrt{' + N(fix(2 * 9.8 * hv[0])) + '} = ' + Q(hv[1], 'm/s')) + '. (The mass cancels: any ball would reach the same speed.)'
      ], 'Set ½ m v² equal to m g h.', { unit: 'm/s', vk: 'speed' });
    }
    function thermal() {
      var top = 10 * R.int(20, 80), lost = 10 * R.int(2, Math.floor(top / 30)), K = top - lost, what = R.pick(['roller-coaster car', 'sled', 'skateboarder', 'swing']);
      return pr('A ' + what + ' starts at the top with ' + MQ(top, 'J') + ' of potential energy and no kinetic energy. At the bottom it has ' + MQ(K, 'J') + ' of kinetic energy (and no potential energy). How much energy became thermal energy and sound?', num(lost, 0), [
        'Energy is conserved: the total at the bottom must still be ' + MQ(top, 'J') + '.',
        M(N(top) + ' - ' + N(K) + ' = ' + Q(lost, 'J')) + ' went into thermal energy and sound through friction and air resistance.'
      ], 'Nothing disappears: find the missing joules.', { unit: 'J', vk: 'thermal' });
    }
    function concept() {
      var K = R.pick([
        ['A playground swing slowly comes to a stop when no one pushes it. What happened to its energy?', 'It turned into thermal energy and sound.', ['It was destroyed by friction.', 'It was used up.', 'It turned into mass.']],
        ['A pendulum swings with no friction. Where is its kinetic energy greatest?', 'At the bottom of the swing', ['At the highest points of the swing', 'Halfway up', 'It is the same everywhere']],
        ['A frictionless roller coaster car starts from rest at the top of a 30 m hill. Can it get over a 35 m hill?', 'No: it has only enough energy to reach 30 m.', ['Yes, if it goes fast enough at the bottom.', 'Yes, because it speeds up going down.', 'Only if it is heavy.']],
        ['A ball is thrown straight up. At its highest point, what kind of energy does it have the most of?', 'Gravitational potential energy', ['Kinetic energy', 'Thermal energy', 'Elastic energy']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Energy changes form but the total stays the same: KE + PE (+ thermal energy, if there is friction).', 'Answer: ' + K[1]], 'Track the total energy.', { vk: 'concept' });
    }
    return lv(R, ctx, [bottom, bottom, concept], [bottom, up, mid, thermal, concept], [mid, speed, thermal, concept]);
  });

  G('physsci.work-intro', function (R, ctx) {
    function w() {
      var F = R.pick([10, 20, 25, 40, 50, 60, 80, 100, 150, 200]), d = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 20]), who = R.pick(['You push a shopping cart', 'A horse pulls a wagon', 'A student drags a box', 'A tow rope pulls a sled']);
      return pr(who + ' with a steady ' + MQ(F, 'N') + ' for ' + MQ(d, 'm') + ' in the direction of the force. How much work is done?', num(F * d), [
        M('W = F\\,d = ' + Q(F, 'N') + ' \\times ' + Q(d, 'm') + ' = ' + Q(F * d, 'J')) + '.'
      ], 'Work = force × distance.', { unit: 'J', vk: 'W' });
    }
    function findF() {
      var F = R.pick([20, 25, 40, 50, 75, 120]), d = R.pick([2, 4, 5, 8, 10]);
      return pr('A worker does ' + MQ(F * d, 'J') + ' of work pushing a crate ' + MQ(d, 'm') + ' across a floor. What steady force did the worker apply?', num(F), [
        'Rearrange ' + M('W = F\\,d') + ' to ' + M('F = \\dfrac{W}{d}') + '.',
        M('F = \\dfrac{' + Q(F * d, 'J') + '}{' + Q(d, 'm') + '} = ' + Q(F, 'N')) + '.'
      ], 'Divide the work by the distance.', { unit: 'N', vk: 'F' });
    }
    function findD() {
      var F = R.pick([20, 30, 40, 50, 60, 100]), d = R.pick([3, 4, 5, 6, 10, 15]);
      return pr('A steady ' + MQ(F, 'N') + ' force does ' + MQ(F * d, 'J') + ' of work on a cart. How far did the cart move along the force?', num(d), [
        M('d = \\dfrac{W}{F} = \\dfrac{' + Q(F * d, 'J') + '}{' + Q(F, 'N') + '} = ' + Q(d, 'm')) + '.'
      ], 'Divide the work by the force.', { unit: 'm', vk: 'd' });
    }
    function lift() {
      var m = R.pick([2, 5, 10, 15, 20, 25]), h = R.pick([0.5, 1, 1.2, 1.5, 2, 3]), F = fix(m * 9.8), W = fix(F * h);
      return pr('You lift ' + aQ(m, 'kg') + ' box straight up ' + MQ(h, 'm') + ' at a steady speed. How much work do you do? Use ' + M('g = 9.8\\,\\mathrm{N/kg}') + '.', num(W), [
        'Lifting steadily, your force equals the box\'s weight: ' + M(N(m) + ' \\times 9.8 = ' + Q(F, 'N')) + '.',
        M('W = ' + Q(F, 'N') + ' \\times ' + Q(h, 'm') + ' = ' + Q(W, 'J')) + '.'
      ], 'First find the force needed: the weight.', { unit: 'J', vk: 'lift' });
    }
    function concept() {
      var K = R.pick([
        ['In which case is work done on the object?', 'A girl lifts a backpack from the floor to a desk.', ['A man holds a heavy suitcase still for five minutes.', 'A student pushes hard on a wall that doesn\'t move.', 'A waiter carries a tray across a room at a steady height and speed (the upward force on the tray).']],
        ['A weightlifter holds a 1,000 N barbell still above her head for 3 s. How much work does she do on the barbell during those 3 s?', 'None, because the barbell does not move.', ['3,000 J', '1,000 J', '333 J']],
        ['You push against a brick wall with 200 N, and it doesn\'t move. How much work do you do on the wall?', 'Zero', ['200 J', '400 J', 'It depends on how long you push']],
        ['Which unit is the same as a joule?', 'A newton-meter (N·m)', ['A newton per meter (N/m)', 'A kilogram (kg)', 'A watt (W)']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Work is done only when the object moves along the direction of the force: ' + M('W = F\\,d') + '.', 'Answer: ' + K[1]], 'Did the object move along the force?', { vk: 'concept' });
    }
    return lv(R, ctx, [w, w, concept], [w, findF, findD, lift, concept], [findF, findD, lift, concept]);
  });

  G('physsci.power-intro', function (R, ctx) {
    function p() {
      var P = R.pick([50, 60, 100, 150, 200, 250, 300, 500, 750, 1000, 1500]), t = R.pick([2, 4, 5, 10, 20, 30, 60]), W = P * t, who = R.pick(['A motor', 'An elevator motor', 'A crane', 'A cyclist', 'A pump']);
      return pr(who + ' does ' + MQ(W, 'J') + ' of work in ' + MQ(t, 's') + '. What is its power?', num(P), [
        M('P = \\dfrac{W}{t} = \\dfrac{' + Q(W, 'J') + '}{' + Q(t, 's') + '} = ' + Q(P, 'W')) + '.'
      ], 'Power = energy ÷ time.', { unit: 'W', vk: 'P' });
    }
    function e() {
      var P = R.pick([40, 60, 100, 800, 1000, 1200, 1500, 2000]), t = R.pick([10, 30, 60, 90, 120, 300]), thing = P <= 100 ? 'light bulb' : R.pick(['microwave', 'hair dryer', 'space heater', 'toaster']);
      return pr('' + cap(aQ(P, 'W')) + ' ' + thing + ' runs for ' + MQ(t, 's') + '. How much energy does it use?', num(P * t), [
        'A watt is a joule per second, so ' + M('W = P\\,t') + '.',
        M(Q(P, 'W') + ' \\times ' + Q(t, 's') + ' = ' + Q(P * t, 'J')) + '.'
      ], 'Energy = power × time.', { unit: 'J', vk: 'E' });
    }
    function t() {
      var P = R.pick([100, 200, 250, 500, 1000]), tt = R.pick([4, 5, 8, 10, 20, 30]);
      return pr('How long does it take ' + aQ(P, 'W') + ' motor to do ' + MQ(P * tt, 'J') + ' of work?', num(tt), [
        M('t = \\dfrac{W}{P} = \\dfrac{' + Q(P * tt, 'J') + '}{' + Q(P, 'W') + '} = ' + Q(tt, 's')) + '.'
      ], 'Time = energy ÷ power.', { unit: 's', vk: 't' });
    }
    function stairs() {
      var W = R.pick([400, 450, 500, 600, 700, 800]), h = R.pick([3, 4, 5, 6, 8, 10]), t = R.pick([4, 5, 6, 8, 10, 12]), E = W * h, P = E / t;
      return pr('' + cap(aQ(W, 'N')) + ' student runs up stairs that rise ' + MQ(h, 'm') + ' in ' + MQ(t, 's') + '. What power does she develop lifting herself?', num(sig(P, 3)), [
        'Work against gravity: ' + M(Q(W, 'N') + ' \\times ' + Q(h, 'm') + ' = ' + Q(E, 'J')) + '.',
        M('P = \\dfrac{' + Q(E, 'J') + '}{' + Q(t, 's') + '} ' + (Number.isInteger(P) ? '= ' : '\\approx ') + Q(sig(P, 3), 'W')) + '.'
      ], 'Work = weight × height; then divide by the time.', { unit: 'W', vk: 'stairs' });
    }
    function concept() {
      var K = R.pick([
        ['Two students carry identical boxes up the same stairs. Ana takes 10 s and Ben takes 20 s. Which is true?', 'They do the same work, but Ana\'s power is twice Ben\'s.', ['Ana does twice the work.', 'Ben\'s power is twice Ana\'s.', 'They have the same power.']],
        ['Which is a unit of power?', 'Watt', ['Joule', 'Newton', 'Meter per second']],
        ['A heater is labeled 1,500 W. What does that tell you?', 'It uses 1,500 joules every second while it runs.', ['It uses 1,500 joules in all.', 'It pushes with 1,500 newtons.', 'It runs for 1,500 seconds.']],
        ['One watt is the same as…', 'one joule per second.', ['one joule times one second.', 'one newton per meter.', 'one newton times one second.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Power is how fast energy is transferred: joules per second, or watts.', 'Answer: ' + K[1]], 'Joules are an amount; watts are a rate.', { vk: 'concept' });
    }
    return lv(R, ctx, [p, p, concept], [p, e, t, concept], [e, t, stairs, concept]);
  });

  G('physsci.efficiency', function (R, ctx) {
    var DEV = ['electric motor', 'light bulb', 'car engine', 'solar panel', 'kettle', 'generator', 'pulley system'];
    function eff() {
      var inn = R.pick([200, 400, 500, 800, 1000, 1200, 2000, 5000]), pct = R.pick([10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90]), out = inn * pct / 100, d = R.pick(DEV);
      return pr('A ' + d + ' takes in ' + MQ(inn, 'J') + ' and gives out ' + MQ(out, 'J') + ' of useful energy. What is its efficiency, as a percent?', { t: 'num', v: String(pct), pct: true, rtol: 0.01 }, [
        M('\\text{efficiency} = \\dfrac{' + N(out) + '}{' + N(inn) + '} \\times 100\\% = ' + pct + '\\%') + '.'
      ], 'Useful out ÷ energy in, times 100%.', { vk: 'eff' });
    }
    function out() {
      var inn = R.pick([200, 500, 1000, 2000, 4000]), pct = R.pick([10, 20, 25, 40, 50, 60, 80]), d = R.pick(DEV);
      return pr('A ' + d + ' is ' + pct + '% efficient. If it takes in ' + MQ(inn, 'J') + ', how much useful energy does it give out?', num(inn * pct / 100), [
        pct + '% of ' + MQ(inn, 'J') + ': ' + M(N(pct / 100) + ' \\times ' + N(inn) + ' = ' + Q(inn * pct / 100, 'J')) + '.'
      ], 'Change the percent to a decimal and multiply.', { unit: 'J', vk: 'out' });
    }
    function waste() {
      var inn = R.pick([300, 500, 800, 1000, 2500]), pct = R.pick([20, 30, 40, 60, 70, 85]), o = inn * pct / 100, d = R.pick(DEV);
      return pr('A ' + d + ' takes in ' + MQ(inn, 'J') + ' and is ' + pct + '% efficient. How much energy is wasted (as heat, sound and so on)?', num(inn - o), [
        'Useful output: ' + M(N(pct / 100) + ' \\times ' + N(inn) + ' = ' + Q(o, 'J')) + '.',
        'Wasted: ' + M(N(inn) + ' - ' + N(o) + ' = ' + Q(inn - o, 'J')) + '. Nothing is destroyed; it just isn\'t useful.'
      ], 'Energy in = useful out + wasted.', { unit: 'J', vk: 'waste' });
    }
    function inp() {
      var inn = R.pick([200, 400, 500, 800, 1000, 1200, 2000]), pct = R.pick([20, 25, 40, 50, 60, 75]), o = inn * pct / 100;
      return pr('A machine is ' + pct + '% efficient. How much energy must go in to get ' + MQ(o, 'J') + ' of useful energy out?', num(inn), [
        M(N(pct / 100) + ' \\times E_{\\text{in}} = ' + N(o)) + '.',
        M('E_{\\text{in}} = ' + N(o) + ' \\div ' + N(pct / 100) + ' = ' + Q(inn, 'J')) + '.'
      ], 'Useful out = efficiency × energy in. Solve for energy in.', { unit: 'J', vk: 'in' });
    }
    function concept() {
      var a = R.pick([800, 1000, 1200]), b = a + R.pick([100, 200, 300]);
      var K = R.pick([
        ['An inventor claims her motor takes in ' + N(a) + ' J of electrical energy and lifts loads gaining ' + N(b) + ' J of energy. What should you think?', 'It is impossible: no machine gives out more energy than it takes in.', ['It is a very well-built motor.', 'It works because motors make energy.', 'It is possible if the motor runs fast enough.']],
        ['Why is no real machine 100% efficient?', 'Some energy always leaves as heat, sound or other forms that aren\'t useful.', ['Energy gets destroyed inside machines.', 'Machines use up energy.', 'Only electric machines lose energy.']],
        ['Where does most of the wasted energy from a car engine go?', 'Into heat that leaves through the radiator and exhaust', ['It is destroyed by the engine.', 'Into extra speed', 'Into the gasoline']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Energy in = useful energy out + wasted energy. The wasted part is never zero, so efficiency is always below 100%.', 'Answer: ' + K[1]], 'Energy can\'t be created.', { vk: 'concept' });
    }
    return lv(R, ctx, [eff, eff, concept], [eff, out, waste, concept], [out, waste, inp, concept]);
  });

  G('physsci.simple-machines', function (R, ctx) {
    function ramp() {
      var h = R.pick([0.5, 1, 1.5, 2]), k = R.pick([2, 3, 4, 5, 6]), Lr = fix(h * k), W = 10 * R.int(20, 120), F = fix(W / k);
      if (!Number.isInteger(F * 10)) { W = W - W % k; F = W / k; }
      return pr('A worker pushes ' + aQ(W, 'N') + ' cart up a frictionless ramp ' + MQ(Lr, 'm') + ' long onto a platform ' + MQ(h, 'm') + ' high. What force must she push with, along the ramp?', num(F), [
        'Work out: ' + M(Q(W, 'N') + ' \\times ' + Q(h, 'm') + ' = ' + Q(fix(W * h), 'J')) + '.',
        'Work in must be the same: ' + M('F \\times ' + Q(Lr, 'm') + ' = ' + Q(fix(W * h), 'J')) + ', so ' + M('F = ' + Q(F, 'N')) + '.'
      ], 'Input work = output work. The push acts over the ramp\'s length.', { unit: 'N', viz: { name: 'ph-torque', opts: { scene: 'ramp', load: W, rampLength: Lr, rampHeight: h, interactive: false, quiet: true } }, vk: 'ramp' });
    }
    function ma() {
      var Fin = R.pick([20, 25, 40, 50, 100]), k = R.pick([2, 3, 4, 5, 8, 10]), Fout = Fin * k, tool = R.pick(['A car jack', 'A pair of pliers', 'A crowbar', 'A wheelbarrow', 'A pulley system']);
      return pr(tool + ' lets ' + aQ(Fin, 'N') + ' input force exert ' + aQ(Fout, 'N') + ' output force. What is its mechanical advantage?', num(k, 0), [
        M('\\text{MA} = \\dfrac{F_{\\text{out}}}{F_{\\text{in}}} = \\dfrac{' + N(Fout) + '}{' + N(Fin) + '} = ' + k) + '.'
      ], 'Divide the output force by the input force.', { vk: 'MA' });
    }
    function pulley() {
      var n = R.pick([2, 3, 4, 6]), load = n * 10 * R.int(5, 40), lift = R.pick([0.5, 1, 1.5, 2]), askD = R.coin();
      if (askD) return pr('A block and tackle has ' + n + ' rope strands holding up the load. To lift an engine ' + MQ(lift, 'm') + ', how much rope must you pull?', num(fix(n * lift)), [
        'Each of the ' + n + ' strands must get ' + MQ(lift, 'm') + ' shorter.',
        'So you pull ' + M(n + ' \\times ' + Q(lift, 'm') + ' = ' + Q(fix(n * lift), 'm')) + ' of rope. The force is smaller; the distance is longer.'
      ], 'Every strand shortens by the lift distance.', { unit: 'm', viz: { name: 'ph-torque', opts: { scene: 'pulley-block', load: load, strands: n, interactive: false, quiet: true } }, vk: 'pd' });
      return pr('A block and tackle has ' + n + ' rope strands holding up ' + aQ(load, 'N') + ' load. Ignoring friction and the pulleys\' weight, how hard must you pull?', num(load / n), [
        'The ' + n + ' strands share the load equally.',
        M(N(load) + ' \\div ' + n + ' = ' + Q(load / n, 'N')) + '.'
      ], 'Divide the load among the strands.', { unit: 'N', viz: { name: 'ph-torque', opts: { scene: 'pulley-block', load: load, strands: n, interactive: false, quiet: true } }, vk: 'pF' });
    }
    function work() {
      var W = 10 * R.int(20, 80), h = R.pick([1, 2, 3]), Lr = h * R.pick([2, 3, 4]);
      return pr('' + cap(aQ(W, 'N')) + ' box is pushed up a frictionless ' + MQ(Lr, 'm') + ' ramp onto ' + aQ(h, 'm') + ' high stage. How much work does the push do?', num(W * h), [
        'An ideal machine puts out the same work it takes in.',
        'The box gains ' + M(Q(W, 'N') + ' \\times ' + Q(h, 'm') + ' = ' + Q(W * h, 'J')) + ', so the push does ' + MQ(W * h, 'J') + ' of work (the same as lifting it straight up).'
      ], 'A machine doesn\'t change the work.', { unit: 'J', vk: 'rampW' });
    }
    function real() {
      var W = 10 * R.int(30, 90), h = 1, Lr = R.pick([2, 4, 5]), ideal = W / Lr, push = fix(ideal + 5 * R.int(2, 10)), eff = W * h / (push * Lr) * 100;
      return pr('Pushing ' + aQ(W, 'N') + ' crate up ' + aQ(Lr, 'm') + ' ramp onto ' + aQ(h, 'm') + ' platform actually takes ' + MQ(push, 'N') + ', because of friction. What is the ramp\'s efficiency, as a percent?', { t: 'num', v: String(sig(eff, 3)), pct: true, rtol: 0.01 }, [
        'Useful work out: ' + M(N(W) + ' \\times ' + N(h) + ' = ' + Q(W * h, 'J')) + '.',
        'Work in: ' + M(N(push) + ' \\times ' + N(Lr) + ' = ' + Q(fix(push * Lr), 'J')) + '.',
        'Efficiency: ' + M('\\dfrac{' + N(W * h) + '}{' + N(fix(push * Lr)) + '} \\times 100\\% \\approx ' + N(sig(eff, 3)) + '\\%') + '.'
      ], 'Efficiency = work out ÷ work in.', { vk: 'rampEff' });
    }
    function concept() {
      var K = R.pick([
        ['What does a simple machine like a ramp or a pulley do?', 'It lets you use a smaller force over a longer distance.', ['It reduces the work you have to do.', 'It creates extra energy.', 'It lets you use a smaller force over a shorter distance.']],
        ['A ramp lets you push a heavy box onto a truck with less force. Compared with lifting it straight up (ignoring friction), the work you do is…', 'the same.', ['less.', 'more, by the ratio of the lengths.', 'zero.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['An ideal machine keeps the work the same: ' + M('F_{\\text{in}}\\,d_{\\text{in}} = F_{\\text{out}}\\,d_{\\text{out}}') + '. It trades force for distance.', 'Answer: ' + K[1]], 'Machines trade force for distance.', { vk: 'concept' });
    }
    return lv(R, ctx, [ramp, ma, pulley], [ramp, ma, pulley, work, concept], [ramp, pulley, work, real, concept]);
  });

  G('physsci.levers', function (R, ctx) {
    var KIDS = ['Maya', 'Leo', 'Ana', 'Sam', 'Priya', 'Jamal', 'Rosa', 'Omar'];
    function seesawViz(m1, d1, m2, d2) { return { name: 'ph-torque', opts: { scene: 'seesaw', beamLength: 6, masses: [{ x: fix(3 - d1), m: m1 }, { x: fix(3 + d2), m: m2 }], interactive: false, quiet: true } }; }
    function findD() {
      for (var k = 0; k < 50; k++) { var m1 = 5 * R.int(6, 12), d1 = R.pick([1, 1.5, 2, 2.5]), m2 = 5 * R.int(4, 14), d2 = m1 * d1 / m2; if (m1 !== m2 && Number.isInteger(fix(d2 * 10)) && d2 <= 3) break; }
      var ab = R.sample(KIDS, 2);
      return pr(ab[0] + ' (' + MQ(m1, 'kg') + ') sits ' + MQ(d1, 'm') + ' from the pivot of a seesaw. How far from the pivot must ' + ab[1] + ' (' + MQ(m2, 'kg') + ') sit on the other side to balance?', num(fix(d2)), [
        'Balance: ' + M(N(m1) + ' \\times ' + N(d1) + ' = ' + N(m2) + ' \\times d') + '. (Both weights are mass × 9.8, so the 9.8 cancels.)',
        M(N(fix(m1 * d1)) + ' = ' + N(m2) + '\\,d') + ', so ' + M('d = ' + Q(fix(d2), 'm')) + '.'
      ], 'Weight × distance must match on both sides.', { unit: 'm', vk: 'd' });
    }
    function findM() {
      for (var k = 0; k < 50; k++) { var m1 = 5 * R.int(6, 12), d1 = R.pick([1, 1.5, 2]), d2 = R.pick([0.5, 1, 1.5, 2, 2.5, 3]), m2 = m1 * d1 / d2; if (d1 !== d2 && Number.isInteger(fix(m2)) && m2 >= 10 && m2 <= 120) break; }
      return pr('' + cap(aQ(m1, 'kg')) + ' child sits ' + MQ(d1, 'm') + ' from a seesaw\'s pivot. What mass, placed ' + MQ(d2, 'm') + ' from the pivot on the other side, balances the seesaw?', num(fix(m2)), [
        'Balance: ' + M(N(m1) + ' \\times ' + N(d1) + ' = m \\times ' + N(d2)) + '.',
        M('m = \\dfrac{' + N(fix(m1 * d1)) + '}{' + N(d2) + '} = ' + Q(fix(m2), 'kg')) + '.'
      ], 'Weight × distance must match on both sides.', { unit: 'kg', viz: { name: 'ph-torque', opts: { scene: 'seesaw', beamLength: 6, masses: [{ x: fix(3 - d1), m: m1 }], forces: [{ x: fix(3 + d2), mag: fix(m2 * 9.8), angle: -90, label: '?' }], interactive: false, quiet: true } }, vk: 'm' });
    }
    function tips() {
      for (var k = 0; k < 50; k++) { var m1 = 5 * R.int(6, 16), d1 = R.pick([0.5, 1, 1.5]), m2 = 5 * R.int(4, 10), d2 = R.pick([1.5, 2, 2.5, 3]); if (m1 > m2 && m1 * d1 !== m2 * d2) break; }
      var ab = R.sample(KIDS, 2), t1 = fix(m1 * d1), t2 = fix(m2 * d2), right = t1 > t2 ? ab[0] + '\'s side goes down.' : ab[1] + '\'s side goes down.';
      return pr(ab[0] + ' (' + MQ(m1, 'kg') + ') sits ' + MQ(d1, 'm') + ' from the pivot. ' + ab[1] + ' (' + MQ(m2, 'kg') + ') sits ' + MQ(d2, 'm') + ' from the pivot on the other side. The seesaw is held level and then let go. What happens?', mcAll(right, [ab[0] + '\'s side goes down.', ab[1] + '\'s side goes down.', 'The seesaw balances.'].filter(function (x) { return x !== right; })), [
        ab[0] + ': ' + M(N(m1) + ' \\times ' + N(d1) + ' = ' + N(t1)) + '. ' + ab[1] + ': ' + M(N(m2) + ' \\times ' + N(d2) + ' = ' + N(t2)) + '.',
        'The bigger product wins: ' + right + (t1 < t2 ? ' The lighter child wins by sitting farther out.' : '')
      ], 'Compare mass × distance, not mass alone.', { viz: seesawViz(m1, d1, m2, d2), vk: 'tip' });
    }
    function effort() {
      var load = 10 * R.int(20, 90), dl = R.pick([0.1, 0.2, 0.25]), de = R.pick([0.8, 1, 1.2, 1.5, 2]), F = fix(load * dl / de), tool = R.pick(['crowbar', 'lever', 'pry bar']);
      return pr('A ' + tool + '\'s pivot is ' + MQ(dl, 'm') + ' from a heavy rock and ' + MQ(de, 'm') + ' from your hand. The rock pushes back on the bar with ' + MQ(load, 'N') + '. What force must your hand apply to balance it?', num(sig(F, 3)), [
        'Balance: ' + M('F \\times ' + N(de) + ' = ' + N(load) + ' \\times ' + N(dl) + ' = ' + N(fix(load * dl))) + '.',
        M('F = ' + N(fix(load * dl)) + ' \\div ' + N(de) + (Number.isInteger(F) ? ' = ' : ' \\approx ') + Q(sig(F, 3), 'N')) + '.'
      ], 'Force × distance on your side = force × distance on the rock\'s side.', { unit: 'N', vk: 'effort' });
    }
    return lv(R, ctx, [findD, findD, tips], [findD, findM, tips], [findM, tips, effort]);
  });

  G('physsci.heat-transfer', function (R, ctx) {
    var SC = [
      ['A metal spoon left in a cup of hot cocoa gets hot at the handle.', 'Conduction'], ['You warm your hands by holding a mug of tea.', 'Conduction'], ['An egg cooks on a hot frying pan.', 'Conduction'], ['Your feet feel cold on a tile floor.', 'Conduction'], ['An ice cube melts in your hand.', 'Conduction'],
      ['Warm air rises from a heater and cool air sinks, warming the whole room.', 'Convection'], ['Water at the bottom of a pot rises as it heats while cooler water sinks.', 'Convection'], ['A sea breeze blows in from the cool ocean toward warm land.', 'Convection'], ['Hot air from a hair dryer warms your hair.', 'Convection'],
      ['Sunlight warms your face on a cold day.', 'Radiation'], ['You feel the warmth of a campfire from several meters away.', 'Radiation'], ['The Sun\'s energy reaches Earth through empty space.', 'Radiation'], ['A red-hot stove burner warms your hand held to the side of it.', 'Radiation'], ['A thermal camera "sees" people by the infrared light they give off.', 'Radiation']
    ];
    function which() { var s = R.pick(SC); return pr(s[0] + ' Which kind of heat transfer is this mainly?', { t: 'mc', choices: ['Conduction', 'Convection', 'Radiation'], v: ['Conduction', 'Convection', 'Radiation'].indexOf(s[1]), keep: true }, [
      'Conduction: through touching materials. Convection: carried by a moving liquid or gas. Radiation: as light, even across empty space.',
      'Here: ' + s[1].toLowerCase() + '.'
    ], 'Touching, moving fluid, or light?', { vk: 'concept' }); }
    function dir() {
      var hot = R.pick([['a cup of hot soup', 60, 90], ['a warm loaf of bread', 40, 70], ['a hot pan', 80, 150], ['your warm hand', 33, 36]]), cold = R.pick([['the air in the room', 18, 24], ['a cold kitchen counter', 10, 18], ['an ice pack', -5, 0], ['a cold window', 2, 10]]);
      var a = R.int(hot[1], hot[2]), b = R.int(cold[1], cold[2]), A = hot[0], B = cold[0];
      return pr(cap(A) + ' at ' + MQ(a, '°C') + ' touches ' + B + ' at ' + MQ(b, '°C') + '. Which way does heat flow?', mcAll('From ' + A + ' to ' + B, ['From ' + B + ' to ' + A, 'Cold flows from ' + B + ' into ' + A, 'No heat flows until they touch for a long time']), [
        'Heat always flows from the hotter object to the colder one.',
        cap(A) + ' (' + MQ(a, '°C') + ') is hotter than ' + B + ' (' + MQ(b, '°C') + '), so heat flows from ' + A + ' to ' + B + '. There is no such thing as "cold" flowing.'
      ], 'Heat moves from hot to cold.', { vk: 'dir' });
    }
    function concept() {
      var K = R.pick([
        ['On a cool morning, a metal bench and a wooden bench sit side by side in a park. The metal one feels colder. Why?', 'Metal conducts heat away from your skin faster, though both are at the same temperature.', ['The metal bench is at a lower temperature.', 'Metal gives off cold.', 'Wood makes its own heat.']],
        ['Why do pots often have plastic or wooden handles?', 'Plastic and wood are poor conductors (insulators), so the handle stays cooler.', ['Plastic and wood are good conductors.', 'They block radiation from the stove.', 'They make convection currents.']],
        ['How does a thermos with a vacuum between its walls keep soup hot?', 'The vacuum stops conduction and convection, since there are no particles to carry the heat.', ['The vacuum stops radiation.', 'The vacuum makes cold.', 'The vacuum adds heat to the soup.']],
        ['Why is the warmest air in a room near the ceiling?', 'Warm air is less dense, so convection carries it upward.', ['Heat always moves upward by conduction.', 'The ceiling gives off radiation.', 'Cold air rises.']],
        ['How does the Sun\'s energy reach Earth?', 'By radiation, which needs no material to travel through.', ['By conduction through space.', 'By convection currents in space.', 'It doesn\'t; Earth makes its own heat.']],
        ['A winter coat keeps you warm mainly by…', 'trapping still air, a poor conductor, so less heat leaves your body.', ['adding heat to your body.', 'keeping the cold from flowing in.', 'reflecting the Sun\'s radiation into you.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Heat flows from hot to cold by conduction (touching), convection (moving fluid) or radiation (light).', 'Answer: ' + K[1]], 'Think about which way heat flows and how it travels.', { vk: 'concept' });
    }
    return lv(R, ctx, [which, which, dir], [which, dir, concept], [which, concept, concept, dir]);
  });

  G('physsci.phase-changes', function (R, ctx) {
    function curve() {
      var Tm = R.pick([-40, -20, 10, 20, 30, 40, 50, 60, 80]), Tb = Tm + R.pick([40, 60, 80, 100, 120]), T0 = Tm - R.pick([20, 30, 40]), T1 = Tb + R.pick([20, 30]);
      var t = [0, R.int(2, 4)]; t.push(t[1] + R.int(3, 5)); t.push(t[2] + R.int(3, 6)); t.push(t[3] + R.int(5, 8)); t.push(t[4] + R.int(2, 4));
      var pts = [[t[0], T0], [t[1], Tm], [t[2], Tm], [t[3], Tb], [t[4], Tb], [t[5], T1]];
      return { pts: pts, Tm: Tm, Tb: Tb, viz: { name: 'ph-graph', opts: { pts: pts, xlab: 't', xunit: 'min', ylab: 'T', yunit: '°C', tool: 'none', interactive: false, quiet: true, domain: [0, t[5]], tags: { p0: 'A', p1: 'B', p2: 'C', p3: 'D', p4: 'E', p5: 'F' } } } };
    }
    function corners(c) { return c.pts.map(function (p, i) { return 'ABCDEF'[i] + ' ' + M('(' + Q(p[0], 'min') + ',\\ ' + Q(p[1], '°C') + ')'); }).join(', '); }
    function readT() {
      var c = curve(), askM = R.coin();
      return pr('A solid is heated at a steady rate. Its temperature graph has corners ' + corners(c) + '. What is its ' + (askM ? 'melting' : 'boiling') + ' point?', num(askM ? c.Tm : c.Tb, 0), [
        'A phase change shows up as a flat part: the temperature stops rising while energy goes into changing the state.',
        'The first flat part (B to C) is melting; the second (D to E) is boiling.',
        (askM ? 'Melting point: ' + MQ(c.Tm, '°C') : 'Boiling point: ' + MQ(c.Tb, '°C')) + '.'
      ], 'Look for the flat parts of the graph.', { unit: '°C', viz: c.viz, vk: askM ? 'Tm' : 'Tb' });
    }
    function seg() {
      var c = curve(), want = R.pick(['melting', 'boiling', 'solid', 'liquid', 'gas']), segs = ['From A to B', 'From B to C', 'From C to D', 'From D to E', 'From E to F'];
      var idx = { solid: 0, melting: 1, liquid: 2, boiling: 3, gas: 4 }[want];
      var ask = { melting: 'is the substance melting', boiling: 'is the substance boiling', solid: 'is the substance a solid getting warmer', liquid: 'is the substance a liquid getting warmer', gas: 'is the substance a gas getting warmer' }[want];
      return pr('A solid is heated at a steady rate. Its temperature graph has corners ' + corners(c) + '. During which part ' + ask + '?', { t: 'mc', choices: segs, v: idx, keep: true }, [
        'Rising parts: one state warming up (solid, then liquid, then gas). Flat parts: a change of state (melting, then boiling).',
        'So: A to B solid warming, B to C melting, C to D liquid warming, D to E boiling, E to F gas warming.',
        'Answer: ' + segs[idx] + '.'
      ], 'Flat means a change of state; rising means warming.', { viz: c.viz, vk: 'seg' });
    }
    function concept() {
      var K = R.pick([
        ['A pot of water is boiling at 100 °C. You turn the burner up. What happens to the water\'s temperature?', 'It stays at 100 °C; the water just boils away faster.', ['It rises above 100 °C.', 'It drops.', 'It rises slowly to 120 °C.']],
        ['Ice at 0 °C is melting in a warm room. Where does the energy it absorbs go?', 'Into breaking the molecules free from their fixed places, not into raising the temperature', ['Into raising its temperature above 0 °C', 'Nowhere; melting needs no energy', 'Into making the molecules heavier']],
        ['When water vapor condenses into droplets on a cold glass, the water vapor…', 'gives off energy to the glass.', ['absorbs energy from the glass.', 'neither absorbs nor gives off energy.', 'gets hotter.']],
        ['Which of these changes of state gives off energy?', 'Freezing', ['Melting', 'Boiling', 'Evaporating']],
        ['Which of these changes of state takes in energy?', 'Boiling', ['Freezing', 'Condensing', 'None of them']],
        ['On a heating curve, what does a flat part mean?', 'The substance is changing state, so its temperature stays the same.', ['The heater was switched off.', 'The substance is cooling down.', 'The substance is warming quickly.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['During melting and boiling, added energy pulls particles apart instead of speeding them up, so the temperature holds steady. Freezing and condensing give that energy back.', 'Answer: ' + K[1]], 'During a change of state, where does the energy go?', { vk: 'concept' });
    }
    function melt() {
      var g = R.pick([10, 20, 25, 50, 100, 200, 500]), boil = R.chance(0.35);
      return pr(boil ? 'Boiling away 1 g of water at 100 °C takes about ' + MQ(2260, 'J') + '. How much energy does it take to boil away ' + MQ(g, 'g') + ' of water that is already at 100 °C?' : 'Melting 1 g of ice at 0 °C takes about ' + MQ(334, 'J') + '. How much energy does it take to melt ' + MQ(g, 'g') + ' of ice that is already at 0 °C?', num(g * (boil ? 2260 : 334)), [
        'The temperature does not change during the change of state; every gram needs the same energy.',
        M(N(g) + ' \\times ' + Q(boil ? 2260 : 334, 'J') + ' = ' + Q(g * (boil ? 2260 : 334), 'J')) + '.'
      ], 'Energy = grams × energy per gram.', { unit: 'J', vk: boil ? 'Lv' : 'Lf' });
    }
    return lv(R, ctx, [concept, readT], [readT, seg, concept], [seg, concept, melt]);
  });

  // ---------- g4_waves.js ----------
  // ===================== Unit 4: Waves, Sound and Light =====================
  G('physsci.wave-parts', function (R, ctx) {
    var SRC = ['A buoy bobs up and down', 'A guitar string vibrates', 'A child\'s toy boat rocks', 'A float on a fishing line bobs', 'A speaker cone moves back and forth'];
    function period() {
      var f = R.pick([2, 4, 5, 8, 10, 20, 25, 50, 0.5, 0.25]);
      return pr('Waves pass a point with a frequency of ' + MQ(f, 'Hz') + '. What is their period?', num(1 / f), [
        'The period is the time for one wave: ' + M('T = \\dfrac{1}{f}') + '.',
        M('T = \\dfrac{1}{' + N(f) + '} = ' + Q(fix(1 / f), 's')) + '.'
      ], 'Period = 1 ÷ frequency.', { unit: 's', vk: 'T' });
    }
    function freq() {
      var T = R.pick([0.5, 0.25, 0.2, 0.1, 0.05, 2, 4, 5]);
      return pr('Each wave takes ' + MQ(T, 's') + ' to pass a point. What is the frequency?', num(1 / T), [
        M('f = \\dfrac{1}{T} = \\dfrac{1}{' + N(T) + '} = ' + Q(fix(1 / T), 'Hz')) + '.'
      ], 'Frequency = 1 ÷ period.', { unit: 'Hz', vk: 'f' });
    }
    function count() {
      var f = R.pick([2, 3, 4, 5, 6, 8, 10]), t = R.pick([2, 3, 4, 5, 10]), n = f * t, s = R.pick(SRC);
      return pr(s + ' ' + n + ' times in ' + MQ(t, 's') + '. What is the frequency?', num(f), [
        'Frequency is the number of cycles per second.',
        M(N(n) + ' \\div ' + Q(t, 's') + ' = ' + Q(f, 'Hz')) + '.'
      ], 'How many cycles each second?', { unit: 'Hz', vk: 'count' });
    }
    function crests() {
      var lam = R.pick([0.5, 0.8, 1.2, 1.5, 2, 2.5, 3, 4]), x0 = R.pick([0.5, 1, 1.5, 2]), k = R.int(3, 4), xs = []; for (var i = 0; i < k; i++) xs.push(fix(x0 + i * lam));
      return pr('A snapshot of a wave on a rope shows crests at ' + U.list(xs.map(function (x) { return MQ(x, 'm'); })) + ' along the rope. What is the wavelength?', num(lam), [
        'Wavelength is the distance from one crest to the next.',
        M(N(xs[1]) + ' - ' + N(xs[0]) + ' = ' + Q(lam, 'm')) + ', and every other pair gives the same.'
      ], 'Crest to the next crest.', { unit: 'm', vk: 'lam' });
    }
    function half() {
      if (R.coin()) { var d = R.pick([0.6, 1, 1.4, 2, 3, 0.8]); return pr('On a water wave, the horizontal distance from a crest to the very next trough is ' + MQ(d, 'm') + '. What is the wavelength?', num(fix(2 * d)), [
        'From a crest to the next trough is only half a wave.',
        'A full wavelength (crest to crest) is ' + M('2 \\times ' + Q(d, 'm') + ' = ' + Q(fix(2 * d), 'm')) + '.'
      ], 'Is crest-to-trough a whole wave?', { unit: 'm', vk: 'half' }); }
      var h = R.pick([20, 30, 40, 50, 60, 1.2, 0.8]), u = h > 10 ? 'cm' : 'm';
      return pr('The vertical distance from the top of a crest to the bottom of a trough is ' + MQ(h, u) + '. What is the amplitude?', num(h / 2), [
        'Amplitude is measured from the rest position to a crest, not crest to trough.',
        'Crest to trough is twice the amplitude: ' + M(Q(h, u) + ' \\div 2 = ' + Q(fix(h / 2), u)) + '.'
      ], 'Where is amplitude measured from?', { unit: u, vk: 'amp' });
    }
    function concept() {
      var K = R.pick([
        ['A duck floats on a pond as waves pass. What does the duck do?', 'It bobs up and down, staying in about the same place.', ['It is carried along with the waves.', 'It stays perfectly still.', 'It moves sideways faster than the waves.']],
        ['What does a wave carry from place to place?', 'Energy', ['The water or rope itself', 'Air', 'Nothing']],
        ['A wave\'s frequency doubles. What happens to its period?', 'It is cut in half.', ['It doubles.', 'It stays the same.', 'It becomes four times as long.']],
        ['Which wave carries the most energy?', 'One with a large amplitude', ['One with a small amplitude', 'One with a long period and tiny amplitude', 'Amplitude has nothing to do with energy']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['A wave carries energy, not the medium: each bit of the medium moves back and forth around one spot. Bigger amplitude means more energy, and T = 1/f.', 'Answer: ' + K[1]], 'The wave shape travels; the medium stays put.', { vk: 'concept' });
    }
    return lv(R, ctx, [period, count, crests, concept], [period, freq, count, crests, half, concept], [freq, crests, half, concept]);
  });

  G('physsci.wave-speed', function (R, ctx) {
    var KIND = [['Waves on a rope', [0.5, 1, 2, 4, 5], [0.5, 1, 1.5, 2, 3]], ['Ocean waves', [0.1, 0.2, 0.25, 0.5], [8, 10, 12, 20, 30]], ['Ripples on a pond', [2, 4, 5, 10], [0.02, 0.05, 0.1, 0.2]], ['Waves on a slinky', [1, 2, 3, 4], [0.25, 0.5, 0.75, 1]]];
    function v() {
      var k = R.pick(KIND), f = R.pick(k[1]), lam = R.pick(k[2]);
      return pr(k[0] + ' have a frequency of ' + MQ(f, 'Hz') + ' and a wavelength of ' + MQ(lam, 'm') + '. How fast do they travel?', num(fix(f * lam)), [
        M('v = f\\,\\lambda = ' + Q(f, 'Hz') + ' \\times ' + Q(lam, 'm') + ' = ' + Q(fix(f * lam), 'm/s')) + '.'
      ], 'Speed = frequency × wavelength.', { unit: 'm/s', vk: 'v' });
    }
    function lam() {
      var f = R.pick([86, 171.5, 343, 686, 1372, 245, 490, 98]), L0 = 343 / f;
      return pr('Sound travels at ' + MQ(343, 'm/s') + ' in air. What is the wavelength of a ' + MQ(f, 'Hz') + ' sound?', num(sig(L0, 3)), [
        'Rearrange ' + M('v = f\\,\\lambda') + ' to ' + M('\\lambda = \\dfrac{v}{f}') + '.',
        M('\\lambda = \\dfrac{343}{' + N(f) + '} = ' + Q(sig(L0, 3), 'm')) + '.'
      ], 'Wavelength = speed ÷ frequency.', { unit: 'm', vk: 'lam' });
    }
    function f() {
      var vv = R.pick([2, 4, 6, 8, 10, 12, 20]), L0 = R.pick([0.5, 1, 2, 4]), ff = vv / L0;
      return pr('Waves travel along a string at ' + MQ(vv, 'm/s') + ' with a wavelength of ' + MQ(L0, 'm') + '. What is their frequency?', num(fix(ff)), [
        'Rearrange ' + M('v = f\\,\\lambda') + ' to ' + M('f = \\dfrac{v}{\\lambda}') + '.',
        M('f = \\dfrac{' + N(vv) + '}{' + N(L0) + '} = ' + Q(fix(ff), 'Hz')) + '.'
      ], 'Frequency = speed ÷ wavelength.', { unit: 'Hz', vk: 'f' });
    }
    function change() {
      var vv = R.pick([4, 6, 8, 12]), f1 = R.pick([1, 2, 4]), k = R.pick([2, 3, 4]), L1 = vv / f1, L2 = vv / (f1 * k);
      return pr('Waves on a rope travel at ' + MQ(vv, 'm/s') + '. At ' + MQ(f1, 'Hz') + ' their wavelength is ' + MQ(fix(L1), 'm') + '. You shake the rope ' + (k === 2 ? 'twice' : k === 3 ? 'three times' : 'four times') + ' as fast, without changing the rope. What is the new wavelength?', num(sig(L2, 3)), [
        'The rope sets the speed, so ' + MQ(vv, 'm/s') + ' stays the same.',
        'New frequency: ' + MQ(f1 * k, 'Hz') + '. ' + M('\\lambda = \\dfrac{' + N(vv) + '}{' + N(f1 * k) + '} ' + (Number.isInteger(fix(L2 * 100)) ? '= ' : '\\approx ') + Q(sig(L2, 3), 'm')) + '.',
        'Higher frequency, shorter waves, same speed.'
      ], 'Which stays the same: the speed or the wavelength?', { unit: 'm', vk: 'chg' });
    }
    function radio() {
      var MHz = R.pick([75, 100, 150, 300, 600, 1500]), L0 = 300 / MHz;
      return pr('A radio station broadcasts at ' + MQ(MHz, 'MHz') + ' (' + M(N(MHz) + ' \\times 10^{6}\\,\\mathrm{Hz}') + '). Radio waves travel at ' + M('3.0 \\times 10^{8}\\,\\mathrm{m/s}') + '. What is the wavelength?', num(fix(L0)), [
        M('\\lambda = \\dfrac{v}{f} = \\dfrac{3.0 \\times 10^{8}}{' + N(MHz) + ' \\times 10^{6}}') + '.',
        M('= \\dfrac{300}{' + N(MHz) + '} = ' + Q(fix(L0), 'm')) + '.'
      ], 'λ = v ÷ f; cancel the powers of ten.', { unit: 'm', vk: 'radio' });
    }
    function concept() {
      var a = R.pick([200, 300, 440, 500]), b = a * 2;
      var K = R.pick([
        ['Two sounds travel through the same air: one at ' + a + ' Hz and one at ' + b + ' Hz. Which arrives first from the same distance?', 'They arrive at the same time.', ['The ' + b + ' Hz sound', 'The ' + a + ' Hz sound', 'It depends on how loud they are']],
        ['You shake a rope faster, without changing the rope. What happens to the waves?', 'Their wavelength gets shorter; their speed stays the same.', ['They travel faster.', 'Their wavelength gets longer.', 'They travel slower.']],
        ['What mainly decides how fast a wave travels?', 'The medium it travels through', ['Its frequency', 'Its wavelength', 'Its amplitude']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['The medium sets a wave\'s speed. Changing the frequency changes the wavelength so that ' + M('f\\,\\lambda') + ' stays equal to that speed.', 'Answer: ' + K[1]], 'What belongs to the medium?', { vk: 'concept' });
    }
    return lv(R, ctx, [v, v, f], [v, lam, f, change, concept], [lam, change, radio, concept]);
  });

  G('physsci.wave-types', function (R, ctx) {
    var EXS = [
      ['Sound traveling through air', 'L'], ['A push-and-pull pulse sent along a stretched slinky', 'L'], ['An ultrasound wave in the body', 'L'], ['An earthquake P wave', 'L'], ['Sound traveling through water', 'L'],
      ['A wave made by shaking a rope up and down', 'T'], ['Light', 'T'], ['A "stadium wave" in a crowd', 'T'], ['A wiggle on a plucked guitar string', 'T'], ['An earthquake S wave', 'T'], ['A side-to-side wiggle sent along a slinky', 'T']
    ];
    function classify() { var e = R.pick(EXS); var right = e[1] === 'L' ? 'Longitudinal' : 'Transverse'; return pr('What kind of wave is this? ' + e[0] + '.', { t: 'mc', choices: ['Transverse', 'Longitudinal'], v: e[1] === 'L' ? 1 : 0, keep: true }, [
      'Transverse: the medium moves across the direction of travel. Longitudinal: it moves back and forth along it.',
      e[1] === 'L' ? 'Here the medium is squeezed and stretched along the direction of travel: longitudinal.' : 'Here the medium moves across the direction of travel: transverse.'
    ], 'Which way does the medium move compared with the wave?', { vk: 'concept' }); }
    function motion() {
      var dir = R.pick(['east', 'north', 'to the right']), long = R.coin();
      var opp = { east: 'north-south', north: 'east-west', 'to the right': 'up and down' }[dir], along = { east: 'east-west', north: 'north-south', 'to the right': 'left and right' }[dir];
      return pr('A ' + (long ? 'longitudinal' : 'transverse') + ' wave travels ' + dir + ' through a medium. Which way do the bits of the medium move?', mc('Back and forth ' + (long ? along : opp), ['Back and forth ' + (long ? opp : along), 'Steadily ' + dir + ', along with the wave', 'They don\'t move at all']), [
        long ? 'In a longitudinal wave the medium moves back and forth along the direction of travel.' : 'In a transverse wave the medium moves across the direction of travel.',
        'The bits of the medium don\'t travel with the wave; they move back and forth around their own spots.'
      ], 'Along the path, or across it?', { vk: 'concept' });
    }
    function lamQ() {
      var d = R.pick([0.4, 0.5, 0.8, 1, 1.2, 1.5, 2]), halfQ = R.coin();
      if (halfQ) return pr('In a sound wave, the distance from the center of a compression to the center of the next rarefaction is ' + MQ(d, 'm') + '. What is the wavelength?', num(fix(2 * d)), [
        'Compression to the next rarefaction is half a wave; compression to the next compression is a whole wave.',
        M('\\lambda = 2 \\times ' + Q(d, 'm') + ' = ' + Q(fix(2 * d), 'm')) + '.'
      ], 'Is compression-to-rarefaction a whole wave?', { unit: 'm', vk: 'half' });
      return pr('In a sound wave, the compressions are ' + MQ(d, 'm') + ' apart. What is the wavelength?', num(d), [
        'One compression to the next is one full wave, just as one crest to the next is for a transverse wave.',
        M('\\lambda = ' + Q(d, 'm')) + '.'
      ], 'What is one full wave of a longitudinal wave?', { unit: 'm', vk: 'same' });
    }
    function concept() {
      var K = R.pick([
        ['In a sound wave, what are compressions?', 'Places where the air is squeezed together', ['The highest points of the wave', 'Places where the air is spread out', 'Places with no air at all']],
        ['In a sound wave, what are rarefactions?', 'Places where the air is spread out', ['Places where the air is squeezed together', 'The lowest points of the wave', 'Places where the sound is loudest']],
        ['Earthquake S waves can\'t pass through Earth\'s outer core. What does that tell scientists?', 'The outer core is liquid, since S waves (transverse) can\'t travel through liquids.', ['The outer core is empty space.', 'The outer core is the hottest layer.', 'The outer core is solid iron.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Longitudinal waves are squeezes (compressions) and stretches (rarefactions) along the direction of travel; transverse waves have crests and troughs across it.', 'Answer: ' + K[1]], 'Picture a slinky being pushed and pulled.', { vk: 'concept' });
    }
    return lv(R, ctx, [classify, classify, motion], [classify, motion, lamQ, concept], [motion, lamQ, concept, classify]);
  });

  G('physsci.sound', function (R, ctx) {
    function compare() {
      var f1 = R.pick([110, 220, 262, 330, 440, 523, 660, 880]), f2 = R.pick([110, 220, 262, 330, 440, 523, 660, 880].filter(function (x) { return x !== f1; })), a1 = R.int(1, 5), a2 = R.int(1, 5); if (a1 === a2) a2 = a1 + 2;
      var askPitch = R.coin(), r = askPitch ? (f1 > f2 ? 'Sound A' : 'Sound B') : (a1 > a2 ? 'Sound A' : 'Sound B');
      return pr('Sound A has a frequency of ' + MQ(f1, 'Hz') + ' and an amplitude of ' + a1 + ' units. Sound B has a frequency of ' + MQ(f2, 'Hz') + ' and an amplitude of ' + a2 + ' units. Which sound is ' + (askPitch ? 'higher in pitch' : 'louder') + '?', { t: 'mc', choices: ['Sound A', 'Sound B', 'They are the same'], v: r === 'Sound A' ? 0 : 1, keep: true }, [
        askPitch ? 'Pitch depends on frequency: the higher frequency is the higher note.' : 'Loudness depends on amplitude: the bigger amplitude is louder.',
        askPitch ? M(N(MA.max(f1, f2)) + '\\,\\mathrm{Hz}') + ' is higher, so ' + r + ' is higher in pitch.' : 'Amplitude ' + MA.max(a1, a2) + ' is bigger, so ' + r + ' is louder.'
      ], askPitch ? 'Pitch goes with frequency.' : 'Loudness goes with amplitude.', { vk: askPitch ? 'pitch' : 'loud' });
    }
    function thunder() {
      var t = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15]), km = R.coin();
      return pr('You see lightning and hear its thunder ' + MQ(t, 's') + ' later. Sound travels at ' + MQ(343, 'm/s') + '; the light arrives almost instantly. About how far away was the lightning' + (km ? ', in kilometers' : '') + '?', num(km ? 343 * t / 1000 : 343 * t, km ? 0.03 : 0.02), [
        M('d = v\\,t = 343\\,\\mathrm{m/s} \\times ' + Q(t, 's') + ' = ' + Q(343 * t, 'm')) + (km ? ' = ' + MQ(fix(0.343 * t), 'km') : '') + '.',
        'Rule of thumb: about 3 seconds for each kilometer.'
      ], 'Distance = speed × time for the sound.', { unit: km ? 'km' : 'm', vk: km ? 'thkm' : 'th' });
    }
    function time() {
      var d = R.pick([686, 1029, 1715, 3430, 343, 2058]);
      return pr('How long does sound take to travel ' + MQ(d, 'm') + ' through air at ' + MQ(343, 'm/s') + '?', num(d / 343), [
        M('t = \\dfrac{d}{v} = \\dfrac{' + N(d) + '}{343} = ' + Q(d / 343, 's')) + '.'
      ], 'Time = distance ÷ speed.', { unit: 's', vk: 'time' });
    }
    function concept() {
      var hz = R.pick([5, 10, 30000, 40000, 50000]), ok = R.pick([100, 440, 1000, 5000, 15000]);
      var K = R.pick([
        ['Two astronauts float a few meters apart outside their spacecraft, in empty space. Can one hear the other shout?', 'No: sound needs a medium, and space has almost none.', ['Yes, but the sound is fainter.', 'Yes, sound travels faster in space.', 'Only high-pitched shouts get through.']],
        ['You turn up the volume on a song. What changes about the sound waves?', 'Their amplitude gets bigger.', ['Their frequency gets higher.', 'They travel faster.', 'Their wavelength gets shorter.']],
        ['In which of these does sound travel fastest?', 'Steel', ['Water', 'Air', 'Empty space']],
        ['Which of these sounds can a person with typical hearing hear?', 'A ' + N(ok) + ' Hz tone', ['A ' + N(hz) + ' Hz tone', 'Sound in empty space', 'None of these']],
        ['A guitarist tightens a string so it vibrates faster. What happens to the note?', 'Its pitch goes up.', ['It gets louder.', 'Its pitch goes down.', 'Nothing changes.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Pitch comes from frequency, loudness from amplitude. Sound needs a medium and travels faster in liquids and solids than in air. People hear about 20 Hz to 20,000 Hz.', 'Answer: ' + K[1]], 'Frequency ↔ pitch; amplitude ↔ loudness.', { vk: 'concept' });
    }
    return lv(R, ctx, [compare, compare, concept], [compare, thunder, concept], [thunder, time, concept, compare]);
  });

  G('physsci.echoes', function (R, ctx) {
    var MED = [['air', 343, 'You shout toward a cliff', 'the cliff'], ['air', 343, 'A bat chirps at a moth', 'the moth'], ['seawater', 1500, 'A ship\'s sonar sends a pulse straight down', 'the seabed'], ['seawater', 1500, 'A dolphin clicks toward a fish', 'the fish'], ['air', 343, 'You clap in front of a tall building', 'the building']];
    function dist() {
      var m = R.pick(MED), t = m[1] === 343 ? (m[3] === 'the moth' ? R.int(4, 30) / 1000 : R.int(2, 30) / 10) : (m[3] === 'the fish' ? R.int(2, 20) / 100 : R.int(2, 16) / 2);
      var d = m[1] * t / 2;
      return pr(m[2] + ' and hears the echo from ' + m[3] + ' ' + MQ(t, 's') + ' later. Sound travels at ' + MQ(m[1], 'm/s') + ' in ' + m[0] + '. How far away is ' + m[3] + '?', num(sig(d, 4)), [
        'Total path (there and back): ' + M(N(m[1]) + ' \\times ' + N(t) + ' = ' + Q(fix(m[1] * t), 'm')) + '.',
        'One way: ' + M(N(fix(m[1] * t)) + ' \\div 2 = ' + Q(fix(d), 'm')) + '.'
      ], 'The sound goes there and back: halve the total path.', { unit: 'm', vk: 'd' });
    }
    function time() {
      var water = R.coin(), v = water ? 1500 : 343, d = water ? R.pick([150, 300, 750, 1500, 3000]) : R.pick([34.3, 68.6, 171.5, 343, 686]), t = 2 * d / v;
      return pr((water ? 'The seabed is ' : 'A cliff is ') + MQ(d, 'm') + ' away. Sound travels at ' + MQ(v, 'm/s') + (water ? ' in seawater' : ' in air') + '. How long after sending a sound will the echo return?', num(fix(t)), [
        'The sound must go there and back: ' + M('2 \\times ' + N(d) + ' = ' + Q(fix(2 * d), 'm')) + '.',
        M('t = \\dfrac{' + N(fix(2 * d)) + '}{' + N(v) + '} = ' + Q(fix(t), 's')) + '.'
      ], 'Double the distance, then divide by the speed.', { unit: 's', vk: 't' });
    }
    function speed() {
      var v = R.pick([340, 343, 1480, 1500]), d = R.pick([50, 100, 150, 200, 300, 600]), t = fix(2 * d / v);
      t = sig(t, 3); var vv = 2 * d / t;
      return pr('A student stands ' + MQ(d, 'm') + ' from a wall' + (v > 1000 ? ' in a long water tank' : '') + ' and times an echo: ' + MQ(t, 's') + ' from clap to echo. What speed of sound does this give?', num(sig(vv, 3), 0.02), [
        'The sound traveled to the wall and back: ' + M('2 \\times ' + N(d) + ' = ' + Q(2 * d, 'm')) + '.',
        M('v = \\dfrac{' + Q(2 * d, 'm') + '}{' + Q(t, 's') + '} \\approx ' + Q(sig(vv, 3), 'm/s')) + '.'
      ], 'Speed = round-trip distance ÷ time.', { unit: 'm/s', vk: 'v' });
    }
    function concept() {
      var K = R.pick([
        ['Why do we divide by 2 when finding a distance from an echo?', 'The sound travels to the object and back.', ['Sound slows to half speed after it reflects.', 'Only half the sound comes back.', 'Echoes always travel half as far.']],
        ['A ship\'s sonar hears the echo from the seabed later than before. What does that mean?', 'The water under the ship is deeper.', ['The water is shallower.', 'The sound got louder.', 'The sonar\'s frequency went up.']],
        ['Many bats find insects in the dark mainly by…', 'listening to echoes of their own high-pitched calls.', ['seeing them with very sensitive eyes.', 'smelling them from far away.', 'feeling the air move.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['An echo is reflected sound. Its round trip takes time ' + M('t') + ', so the one-way distance is ' + M('d = \\dfrac{v\\,t}{2}') + '.', 'Answer: ' + K[1]], 'There and back.', { vk: 'concept' });
    }
    return lv(R, ctx, [dist, dist, concept], [dist, time, concept], [dist, time, speed, concept]);
  });

  G('physsci.wave-behavior', function (R, ctx) {
    function pct() {
      var a = R.int(1, 8) * 5, b = R.int(1, 6) * 5, roles = R.shuffle(['reflects', 'absorbs', 'transmits']), mat = R.pick(['A sheet of tinted glass', 'A frosted window', 'A thin curtain', 'A pair of sunglasses lenses', 'A sheet of colored plastic']);
      var c = 100 - a - b;
      var nm2 = { reflects: 'reflected', absorbs: 'absorbed', transmits: 'transmitted' };
      return pr(mat + ' ' + roles[0] + ' ' + a + '% of the light that hits it and ' + roles[1] + ' ' + b + '%. What percent of the light does it ' + roles[2].replace(/s$/, '') + '?', { t: 'num', v: String(c), pct: true, rtol: 0.001 }, [
        'Reflected + absorbed + transmitted = 100% of the light that arrives.',
        M('100 - ' + a + ' - ' + b + ' = ' + c) + '%, so ' + c + '% is ' + nm2[roles[2]] + '.'
      ], 'The three parts add up to 100%.', { vk: 'pct' });
    }
    function what() {
      var K = R.pick([
        ['Most of the sunlight hitting a black car is…', 'absorbed, warming the car.', ['reflected.', 'transmitted through the car.', 'destroyed.']],
        ['Most of the light hitting a clear window is…', 'transmitted.', ['absorbed.', 'reflected.', 'turned into sound.']],
        ['You shout at a cliff and hear your voice come back. The sound was…', 'reflected.', ['absorbed.', 'transmitted.', 'refracted into light.']],
        ['Thick foam panels in a recording studio mainly…', 'absorb sound.', ['reflect sound.', 'transmit sound.', 'make sound louder.']],
        ['An X-ray image shows bones as light shapes because bones…', 'absorb more X-rays than soft tissue does.', ['reflect X-rays back to the machine.', 'transmit more X-rays than soft tissue.', 'make their own X-rays.']],
        ['Why can you see a sheet of paper in a lit room?', 'It reflects light, scattered in all directions, into your eyes.', ['It makes its own light.', 'It absorbs all the light.', 'Only shiny things reflect light, so you see its shadow.']],
        ['A white wall looks bright because it…', 'reflects most of the light that hits it.', ['absorbs most of the light.', 'transmits most of the light.', 'glows on its own.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['When a wave meets a material, its energy is reflected, absorbed or transmitted, in some mix.', 'Answer: ' + K[1]], 'Bounce back, taken in, or pass through?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['Only shiny surfaces like mirrors reflect light.', false, 'Paper, skin and walls reflect light too, scattered in all directions; that is how you see them.'],
        ['When light hits a material, the reflected, absorbed and transmitted parts add up to all of the light.', true, 'Energy is conserved, so the three shares add to 100%.'],
        ['Sound can be reflected, absorbed and transmitted, just like light.', true, 'All waves can do all three.'],
        ['A dark object absorbs more light than a white one.', true, 'Dark objects absorb most colors; white objects reflect most.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Think about where the wave\'s energy goes.', { vk: 'concept' });
    }
    return lv(R, ctx, [what, tfq, pct], [what, tfq, pct], [pct, what, tfq]);
  });

  var BANDS = ['radio waves', 'microwaves', 'infrared', 'visible light', 'ultraviolet', 'X-rays', 'gamma rays'];
  G('physsci.em-spectrum', function (R, ctx) {
    function order() {
      var idx = R.sample([0, 1, 2, 3, 4, 5, 6], 4).sort(function (a, b) { return a - b; }), longest = R.coin(), pick = longest ? idx[0] : idx[3];
      var opts = idx.map(function (i) { return cap(BANDS[i]); });
      return pr('Which has the ' + (longest ? 'longest wavelength' : 'highest frequency') + ': ' + U.list(R.shuffle(idx.map(function (i) { return BANDS[i]; }))).replace(' and ', ' or ') + '?', { t: 'mc', choices: opts, v: longest ? 0 : 3 }, [
        'From longest wavelength (lowest frequency) to shortest (highest frequency): radio, microwave, infrared, visible, ultraviolet, X-ray, gamma.',
        'So the answer is ' + BANDS[pick] + '.'
      ], 'Radio waves are longest; gamma rays are shortest. Longer wavelength means lower frequency.', { vk: 'order' });
    }
    function classify() {
      var W = [['3 m', 0], ['300 m', 0], ['1 km', 0], ['12 cm', 1], ['1 cm', 1], ['10 micrometers (0.00001 m)', 2], ['50 micrometers', 2], ['450 nm', 3], ['550 nm', 3], ['650 nm', 3], ['250 nm', 4], ['300 nm', 4], ['1 nm', 5], ['0.1 nm', 5], ['0.001 nm', 6]];
      var w = R.pick(W), others = R.sample([0, 1, 2, 3, 4, 5, 6].filter(function (i) { return i !== w[1]; }), 3);
      return pr('An electromagnetic wave has a wavelength of ' + w[0] + '. Which part of the spectrum is it in?', mc(cap(BANDS[w[1]]), others.map(function (i) { return cap(BANDS[i]); })), [
        'Rough ranges (the edges are not sharp): radio waves longer than about 1 m; microwaves about 1 mm to 1 m; infrared about 700 nm to 1 mm; visible light about 400 to 700 nm; ultraviolet about 10 to 400 nm; X-rays about 0.01 to 10 nm; gamma rays shorter still.',
        w[0] + ' is in the ' + BANDS[w[1]] + ' range.'
      ], 'Visible light is about 400 to 700 nm.', { vk: 'class' });
    }
    function travel() {
      var T = R.pick([['the Moon', 384000], ['the Sun', 150000000], ['a satellite', 36000], ['Mars, at a close approach', 60000000], ['a spacecraft near Jupiter', 750000000]]), t = T[1] / 300000;
      return pr('Light and radio waves travel at about ' + MQ(300000, 'km/s') + ' in space. How long does a signal take to arrive from ' + T[0] + ', ' + MQ(T[1], 'km') + ' away?', num(sig(t, 3)), [
        M('t = \\dfrac{d}{v} = \\dfrac{' + N(T[1]) + '}{300{,}000} ' + (Number.isInteger(fix(t * 100)) ? '= ' : '\\approx ') + Q(sig(t, 3), 's')) + '.'
      ], 'Time = distance ÷ speed.', { unit: 's', vk: 'travel' });
    }
    function concept() {
      var b = R.pick(BANDS);
      var K = R.pick([
        ['How fast do ' + b + ' travel through empty space?', 'At the speed of light, about 300,000 km/s', ['At the speed of sound, about 343 m/s', 'Faster than visible light', 'They can\'t travel through empty space']],
        ['A radio picks up a station. What is actually traveling from the station\'s tower to the radio?', 'Electromagnetic waves (a kind of light)', ['Sound waves', 'Electric current through the air', 'Air molecules']],
        ['Which of these is NOT an electromagnetic wave?', 'Sound', ['Radio waves', 'X-rays', 'Infrared']],
        ['Which part of the electromagnetic spectrum can our eyes see?', 'Only a narrow band, visible light', ['All of it', 'Only radio waves', 'Everything except gamma rays']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Radio, microwaves, infrared, visible, ultraviolet, X-rays and gamma rays are all electromagnetic waves (light). All travel at about 300,000 km/s in space. Sound is not one of them.', 'Answer: ' + K[1]], 'All of these are light, at the same speed in space.', { vk: 'concept' });
    }
    return lv(R, ctx, [order, concept], [order, classify, concept, travel], [classify, travel, concept, order]);
  });

  G('physsci.color', function (R, ctx) {
    var COL = { R: 'red', G: 'green', B: 'blue' };
    var OBJ = { white: 'RGB', black: '', red: 'R', green: 'G', blue: 'B', yellow: 'RG', cyan: 'GB', magenta: 'RB' };
    function name(set) { var key = (set.indexOf('R') >= 0 ? 'R' : '') + (set.indexOf('G') >= 0 ? 'G' : '') + (set.indexOf('B') >= 0 ? 'B' : ''); return { '': 'black', R: 'red', G: 'green', B: 'blue', RG: 'yellow', GB: 'cyan', RB: 'magenta', RGB: 'white' }[key]; }
    function inter(a, b) { return a.split('').filter(function (c) { return b.indexOf(c) >= 0; }).join(''); }
    var LIGHTS = { white: 'RGB', red: 'R', green: 'G', blue: 'B' };
    function under() {
      var obj = R.pick(['white', 'red', 'green', 'blue', 'yellow', 'black']), light = R.pick(['red', 'green', 'blue', 'white']), thing = R.pick(['shirt', 'ball', 'flower', 'card', 'cup']);
      var seen = name(inter(OBJ[obj], LIGHTS[light]));
      var choices = ['black', 'red', 'green', 'blue', 'white', 'yellow'];
      var wr = R.sample(choices.filter(function (c) { return c !== seen; }), 3);
      return pr('A ' + obj + ' ' + thing + ' (it looks ' + obj + ' in white light) is lit only by ' + (light === 'white' ? 'white' : 'pure ' + light) + ' light. What color does it look?', mc(cap(seen), wr.map(cap)), [
        'A ' + obj + ' object reflects ' + (OBJ[obj] ? U.list(OBJ[obj].split('').map(function (c) { return COL[c]; })) + ' light' : 'almost no light') + ' and absorbs the rest.',
        'The light contains ' + U.list(LIGHTS[light].split('').map(function (c) { return COL[c]; })) + '.',
        seen === 'black' ? 'None of the light can be reflected, so it looks black.' : 'Only ' + seen + ' light is reflected to your eye, so it looks ' + seen + '.'
      ], 'Which colors are both in the light and reflected by the object?', { vk: 'under' });
    }
    function filter() {
      var F1 = R.pick(['red', 'green', 'blue', 'yellow', 'cyan', 'magenta']), two = R.coin(), F2 = R.pick(['red', 'green', 'blue', 'yellow', 'cyan', 'magenta'].filter(function (x) { return x !== F1; }));
      var out = two ? inter(OBJ[F1], OBJ[F2]) : OBJ[F1], seen = out ? name(out) : 'black';
      var cs = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'white'];
      var wr = R.sample(cs.filter(function (c) { return c !== seen; }), 3).map(function (c) { return cap(c); });
      var right = seen === 'black' ? 'No light gets through (dark)' : cap(seen);
      if (seen !== 'black' && R.coin()) wr[2] = 'No light gets through (dark)';
      return pr('White light passes through a ' + F1 + ' filter' + (two ? ' and then a ' + F2 + ' filter' : '') + ' onto a white screen. What color is the spot on the screen?', mc(right, wr), [
        'A filter transmits its own color(s) and absorbs the rest. A ' + F1 + ' filter passes ' + U.list(OBJ[F1].split('').map(function (c) { return COL[c]; })) + (two ? '; a ' + F2 + ' filter passes ' + U.list(OBJ[F2].split('').map(function (c) { return COL[c]; })) : '') + '.',
        two ? 'Only light that both filters pass gets through: ' + (out ? U.list(out.split('').map(function (c) { return COL[c]; })) + ', which looks ' + seen : 'none, so the spot is dark') + '.' : 'So the spot is ' + seen + '.'
      ], 'Filters can only take colors away.', { vk: 'filter' });
    }
    function concept() {
      var K = R.pick([
        ['What does a red filter do to white light?', 'It absorbs the other colors and lets red through.', ['It adds red to the light.', 'It turns all the colors into red.', 'It reflects the red and lets the other colors through.']],
        ['Why does a green leaf look green in sunlight?', 'It reflects green light and absorbs most other colors.', ['It absorbs green light.', 'It makes green light.', 'It turns sunlight into green.']],
        ['A prism spreads white light into a rainbow. What does this show?', 'White light is a mix of all the colors.', ['The prism adds colors to the light.', 'White light is a single color.', 'The prism paints the light.']],
        ['Why does a black shirt get warmer in sunlight than a white one?', 'It absorbs most of the light instead of reflecting it.', ['It reflects more light.', 'Black makes its own heat.', 'It transmits the light.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['White light holds all colors. Objects look the color they reflect; filters transmit their color and absorb the rest.', 'Answer: ' + K[1]], 'Color comes from which light is reflected or transmitted.', { vk: 'concept' });
    }
    return lv(R, ctx, [under, filter, concept], [under, filter, concept], [under, filter, concept]);
  });

  G('physsci.refraction-intro', function (R, ctx) {
    var MAT = [['air', 300000], ['water', 225000], ['glass', 200000], ['diamond', 124000]];
    function bend() {
      var a = R.int(0, 3), b = R.int(0, 3); while (b === a) b = R.int(0, 3);
      var A = MAT[a], B = MAT[b], angs = [0, 0, 20, 30, 40, 50, 60].filter(function (x) { return B[1] <= A[1] || MA.sin(x * MA.PI / 180) < 0.9 * A[1] / B[1]; }), ang = R.pick(angs);
      var right = ang === 0 ? 'It does not bend; it goes straight through.' : B[1] < A[1] ? 'It bends toward the normal.' : 'It bends away from the normal.';
      return pr('Light travels from ' + A[0] + ' (about ' + MQ(A[1], 'km/s') + ') into ' + B[0] + ' (about ' + MQ(B[1], 'km/s') + '), hitting the boundary at ' + M(T.deg(ang)) + ' from the normal. What happens to its direction?', mcAll(right, ['It bends toward the normal.', 'It bends away from the normal.', 'It does not bend; it goes straight through.'].filter(function (x) { return x !== right; })), [
        ang === 0 ? 'At ' + M(T.deg(0)) + ' the light meets the boundary straight on. It changes speed but not direction.' : 'It hits at an angle, so it bends.',
        ang === 0 ? 'So it goes straight through.' : (B[1] < A[1] ? 'It slows down (into ' + B[0] + '), so it bends toward the normal.' : 'It speeds up (into ' + B[0] + '), so it bends away from the normal.')
      ], 'Is it hitting at an angle? Does it slow down or speed up?', { vk: 'bend' });
    }
    function times() {
      var M2 = R.pick(MAT.slice(1)), k = 300000 / M2[1];
      return pr('Light travels at about ' + MQ(300000, 'km/s') + ' in air (almost the same as in empty space) and about ' + MQ(M2[1], 'km/s') + ' in ' + M2[0] + '. How many times faster is it in air than in ' + M2[0] + '?', num(sig(k, 3)), [
        M('\\dfrac{300{,}000}{' + N(M2[1]) + '} ' + (Number.isInteger(fix(k * 100)) ? '= ' : '\\approx ') + N(sig(k, 3))) + '.',
        'This ratio is called the index of refraction of ' + M2[0] + ': the bigger it is, the more the light bends.'
      ], 'Divide the faster speed by the slower one.', { vk: 'ratio' });
    }
    function concept() {
      var K = R.pick([
        ['A straw in a glass of water looks broken at the water\'s surface. Why?', 'Light from the straw bends as it leaves the water.', ['The water actually bends the straw.', 'The glass acts as a mirror.', 'Light speeds up in water.']],
        ['A swimming pool looks shallower than it really is. Why?', 'Light from the bottom bends as it leaves the water, so the bottom appears raised.', ['Water absorbs the light from the bottom.', 'The pool\'s walls reflect the light.', 'Light can\'t travel through water.']],
        ['Which kind of lens brings parallel light rays together at a point?', 'A converging lens, thicker in the middle', ['A diverging lens, thinner in the middle', 'A flat sheet of glass', 'Any mirror']],
        ['What causes light to bend when it passes from air into glass at an angle?', 'It changes speed at the boundary.', ['Glass attracts light.', 'Its frequency changes.', 'Some of the light is absorbed.']],
        ['A laser beam hits a block of glass straight on (along the normal). What happens?', 'It slows down but keeps going in the same direction.', ['It bends toward the normal.', 'It bends away from the normal.', 'It stops.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Light bends when it crosses a boundary at an angle and changes speed: toward the normal when it slows down, away when it speeds up. Straight on, it does not bend. Lenses use this bending to focus light.', 'Answer: ' + K[1]], 'Refraction comes from a change in speed at an angle.', { vk: 'concept' });
    }
    return lv(R, ctx, [bend, concept], [bend, concept, times], [bend, times, concept]);
  });

  G('physsci.radiation-energy', function (R, ctx) {
    var ORDER = ['radio', 'microwave', 'infrared', 'red', 'green', 'blue', 'violet', 'ultraviolet', 'X-ray', 'gamma-ray'];
    function compare() {
      var ij = R.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 2), hi = MA.max(ij[0], ij[1]), lo = MA.min(ij[0], ij[1]), a = ORDER[ij[0]], b = ORDER[ij[1]];
      var askMore = R.coin(), ans = askMore ? ORDER[hi] : ORDER[lo];
      return pr('Which carries ' + (askMore ? 'more' : 'less') + ' energy per photon: a ' + a + ' photon or a ' + b + ' photon?', { t: 'mc', choices: ['The ' + a + ' photon', 'The ' + b + ' photon', 'They carry the same energy'], v: ans === a ? 0 : 1, keep: true }, [
        'Photon energy rises with frequency. In order of increasing frequency: radio, microwave, infrared, red, green, blue, violet, ultraviolet, X-ray, gamma ray.',
        'The ' + ORDER[hi] + ' photon has the higher frequency, so it carries more energy; the ' + ORDER[lo] + ' photon carries less.'
      ], 'Higher frequency, more energy per photon.', { vk: 'cmp' });
    }
    function scale() {
      var E = R.pick([1, 1.5, 2, 2.5, 3]), k = R.pick([2, 3, 4, 5, 10]), half = R.chance(0.25);
      if (half) return pr('A photon of frequency ' + M('f') + ' carries ' + MQ(E * k, 'eV') + ' of energy. How much energy does a photon of frequency ' + M('\\dfrac{f}{' + k + '}') + ' carry?', num(E), [
        'Photon energy is proportional to frequency.',
        M('\\dfrac{1}{' + k + '}') + ' of the frequency gives ' + M('\\dfrac{1}{' + k + '}') + ' of the energy: ' + M(N(E * k) + ' \\div ' + k + ' = ' + Q(E, 'eV')) + '.'
      ], 'Energy is proportional to frequency.', { unit: 'eV', vk: 'div' });
      return pr('A photon of frequency ' + M('f') + ' carries ' + MQ(E, 'eV') + ' of energy (eV is a tiny energy unit). How much energy does a photon of frequency ' + M(k + 'f') + ' carry?', num(fix(E * k)), [
        'Photon energy is proportional to frequency.',
        k + ' times the frequency gives ' + k + ' times the energy: ' + M(N(E) + ' \\times ' + k + ' = ' + Q(fix(E * k), 'eV')) + '.'
      ], 'Energy is proportional to frequency.', { unit: 'eV', vk: 'mul' });
    }
    function concept() {
      var K = R.pick([
        ['A very bright red lamp and a dim ultraviolet lamp shine on a sample of molecules that one UV photon can break apart. Which breaks the molecules?', 'The dim ultraviolet lamp', ['The bright red lamp', 'Both equally', 'Neither']],
        ['Making a light brighter (without changing its color) changes…', 'the number of photons, not the energy of each photon.', ['the energy of each photon.', 'the frequency of the light.', 'the color of each photon.']],
        ['Why can ultraviolet light damage skin cells when even very bright visible light doesn\'t?', 'Each UV photon carries enough energy to break some molecules in cells; a visible photon doesn\'t.', ['UV light is brighter than visible light.', 'There are more UV photons in sunlight.', 'UV light is a kind of heat.']],
        ['Which kind of light has the least energy per photon?', 'Radio waves', ['Gamma rays', 'X-rays', 'Ultraviolet']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['A photon\'s energy depends on its frequency alone. Brightness is the number of photons. Breaking a molecule needs one photon with enough energy.', 'Answer: ' + K[1]], 'Think one photon at a time.', { vk: 'concept' });
    }
    return lv(R, ctx, [compare, concept], [compare, scale, concept], [compare, scale, concept]);
  });

  G('physsci.digital-signals', function (R, ctx) {
    function levels() {
      var n = R.int(1, 8);
      return pr('How many different values can a signal with ' + n + ' bit' + (n > 1 ? 's' : '') + ' send?', num(MA.pow(2, n), 0), [
        'Each bit has 2 choices (0 or 1), so ' + n + ' bits give ' + M('2^{' + n + '}') + ' combinations.',
        M('2^{' + n + '} = ' + MA.pow(2, n)) + '.'
      ], 'Multiply 2 by itself once for each bit.', { vk: 'lev' });
    }
    function bits() {
      var want = R.pick([4, 8, 16, 32, 64, 100, 200, 256, 1000]), n = MA.ceil(MA.log2(want) - 1e-9);
      return pr('What is the smallest number of bits that can give each of ' + N(want) + ' different values its own code?', num(n, 0), [
        'Powers of 2: ' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, n + 1).map(function (k) { return M('2^{' + k + '} = ' + MA.pow(2, k)); }).join(', ') + '.',
        M('2^{' + n + '} = ' + MA.pow(2, n)) + ' is the first one at least ' + N(want) + ', so ' + n + ' bits.'
      ], 'Find the first power of 2 that is big enough.', { vk: 'bits' });
    }
    function read() {
      var n = R.int(4, 6), b = [], vs = [];
      for (var i = 0; i < n; i++) { var bit = R.coin() ? 1 : 0; b.push(bit); vs.push(bit ? fix(5 - R.int(0, 12) / 10) : fix(R.int(0, 12) / 10)); }
      return pr('A receiver reads 0 V as a 0 and 5 V as a 1. Noise has changed the voltages, and it receives ' + vs.map(function (v) { return MQ(v, 'V'); }).join(', ') + '. What bits were sent? (Type them as one string, like 0110.)', { t: 'text', v: [b.join('')] }, [
        'Each voltage is read as whichever value it is closer to: above 2.5 V means 1, below means 0.',
        vs.map(function (v, i) { return N(v) + ' V → ' + b[i]; }).join(', ') + '.',
        'Bits: ' + b.join('') + '. The noise did no harm, because each reading is still much closer to the right value.'
      ], 'Is each voltage closer to 0 V or to 5 V?', { vk: 'read' });
    }
    function concept() {
      var K = R.pick([
        ['Which of these signals is digital?', 'A text message sent as 0s and 1s', ['A voice on an old AM radio', 'The groove of a vinyl record', 'The height of liquid in a glass thermometer']],
        ['Which of these is analog?', 'The groove of a vinyl record, which copies the sound wave\'s shape', ['A song stored as numbers on a phone', 'A photo stored as 0s and 1s', 'A message in Morse code dots and dashes']],
        ['Why can a digital signal be copied many times without getting worse?', 'Each bit only has to be read as 0 or 1, so small errors are cleaned up every time.', ['Digital signals have no noise at all.', 'Digital signals are electronic.', 'Digital signals travel faster than analog ones.']],
        ['What does "digital" mean for a signal?', 'It is sent as separate, countable values, such as 0s and 1s.', ['It is sent using electricity.', 'It is sent by radio.', 'It is sent by a computer.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Digital signals use a few distinct values (bits). Small noise can\'t change which value a bit is, so the message can be read and copied exactly. Analog signals vary smoothly, so noise becomes part of them.', 'Answer: ' + K[1]], 'Digital means separate values, not "electronic".', { vk: 'concept' });
    }
    return lv(R, ctx, [levels, concept, read], [levels, read, concept], [bits, read, concept, levels]);
  });

  // ---------- g5_elec.js ----------
  // ===================== Unit 5: Electricity and Magnetism =====================
  var ATOMS = [['hydrogen', 1], ['helium', 2], ['lithium', 3], ['carbon', 6], ['nitrogen', 7], ['oxygen', 8], ['fluorine', 9], ['sodium', 11], ['magnesium', 12], ['aluminum', 13], ['sulfur', 16], ['chlorine', 17], ['calcium', 20], ['iron', 26]];
  function sgn(n) { return n > 0 ? '+' + n : String(n); }
  G('physsci.charges-in-atoms', function (R, ctx) {
    var IONS = [['sodium', 11, 'loses', 1], ['magnesium', 12, 'loses', 2], ['aluminum', 13, 'loses', 3], ['calcium', 20, 'loses', 2], ['lithium', 3, 'loses', 1], ['potassium', 19, 'loses', 1], ['iron', 26, 'loses', 2], ['iron', 26, 'loses', 3], ['oxygen', 8, 'gains', 2], ['chlorine', 17, 'gains', 1], ['fluorine', 9, 'gains', 1], ['sulfur', 16, 'gains', 2], ['nitrogen', 7, 'gains', 3]];
    function net() {
      var a = R.pick(IONS), gain = a[2] === 'gains', k = a[3], e = gain ? a[1] + k : a[1] - k;
      return pr((/^[aeiou]/.test(a[0]) ? 'An ' : 'A ') + a[0] + ' atom has ' + a[1] + ' protons. It ' + a[2] + ' ' + k + ' electron' + (k > 1 ? 's' : '') + '. What is its net charge, in units of the electron\'s charge? (Use a sign: positive or negative.)', num(a[1] - e, 0), [
        'A neutral atom has as many electrons as protons: ' + a[1] + '. After ' + (gain ? 'gaining' : 'losing') + ' ' + k + ', it has ' + e + '.',
        'Net charge: ' + M(a[1] + ' - ' + e + ' = ' + sgn(a[1] - e)) + '.'
      ], 'Net charge = protons − electrons.', { vk: 'net' });
    }
    function counts() {
      var p = R.int(5, 40), e = p + R.pick([-4, -3, -2, -1, 1, 2, 3, 0]), q = p - e;
      var right = q > 0 ? 'Positive' : q < 0 ? 'Negative' : 'Neutral';
      return pr('An object has ' + p + ' units of positive charge (protons) and ' + e + ' electrons. What is its overall charge?', { t: 'mc', choices: ['Positive', 'Negative', 'Neutral'], v: ['Positive', 'Negative', 'Neutral'].indexOf(right), keep: true }, [
        'Compare: ' + M(p + ' - ' + e + ' = ' + sgn(q)) + '.',
        q === 0 ? 'Equal numbers: neutral.' : q > 0 ? 'More protons than electrons: positive.' : 'More electrons than protons: negative.'
      ], 'More electrons means negative.', { vk: 'sign' });
    }
    function cons() {
      var n = R.pick([2, 3, 5, 8, 10, 20, 50]), unit = R.pick(['million', 'billion']), A = R.pick([['A balloon', 'your hair'], ['A plastic comb', 'a wool sweater'], ['A glass rod', 'a silk cloth'], ['A sock', 'a towel in the dryer']]), aGains = R.coin();
      var askPos = R.coin();
      return pr(A[0] + ' is rubbed on ' + A[1] + ' and ' + (aGains ? 'gains' : 'loses') + ' ' + n + ' ' + unit + ' electrons. How many electrons did ' + A[1] + ' ' + (aGains ? 'lose' : 'gain') + ', in ' + unit + 's?', num(n, 0), [
        'Charge is conserved: electrons only move from one object to the other.',
        'So ' + A[1] + ' ' + (aGains ? 'lost' : 'gained') + ' exactly ' + n + ' ' + unit + ' electrons, and ended up ' + (aGains ? 'positive' : 'negative') + ' by the same amount.'
      ], 'Where did the electrons come from?', { vk: 'cons' });
    }
    function concept() {
      var K = R.pick([
        ['How does a neutral object usually become positively charged?', 'It loses electrons.', ['It gains protons.', 'It gains electrons.', 'It loses protons.']],
        ['Rubbing gives a plastic rod a negative charge. What happened?', 'Electrons moved onto the rod.', ['Protons moved off the rod.', 'Protons moved onto the rod.', 'New electrons were created.']],
        ['Why do electrons, not protons, move when objects are rubbed together?', 'Outer electrons are loosely held; protons are locked in the nucleus.', ['Protons are too small to move.', 'Electrons are heavier than protons.', 'Protons have no charge.']],
        ['A neutral atom has…', 'equal numbers of protons and electrons.', ['no protons or electrons.', 'more protons than electrons.', 'only neutrons.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['In everyday charging, electrons move; protons stay in their nuclei. Gaining electrons makes an object negative; losing them makes it positive.', 'Answer: ' + K[1]], 'Only electrons move.', { vk: 'concept' });
    }
    return lv(R, ctx, [counts, net, concept], [net, cons, concept], [net, cons, concept, counts]);
  });

  G('physsci.static-forces', function (R, ctx) {
    function pair() {
      var P0 = R.pick([['positive', 'positive'], ['negative', 'negative'], ['positive', 'negative'], ['negative', 'positive'], ['negative', 'neutral'], ['positive', 'neutral']]);
      var right = P0[1] === 'neutral' ? 'They attract.' : P0[0] === P0[1] ? 'They repel.' : 'They attract.';
      var objs = R.pick([['bead', 'bead'], ['balloon', 'balloon'], ['rod', 'ball'], ['comb', 'scrap of paper']]);
      return pr('A ' + P0[0] + 'ly charged ' + objs[0] + ' is brought near a ' + (P0[1] === 'neutral' ? 'neutral (uncharged)' : P0[1] + 'ly charged') + ' ' + objs[1] + '. What happens?', { t: 'mc', choices: ['They attract.', 'They repel.', 'Nothing: there is no force.'], v: right === 'They attract.' ? 0 : 1, keep: true }, [
        P0[1] === 'neutral' ? 'The charged ' + objs[0] + ' shifts the charges in the neutral ' + objs[1] + ': the near side becomes slightly opposite in charge, and nearer charges pull harder.' : P0[0] === P0[1] ? 'Like charges repel.' : 'Unlike charges attract.',
        right
      ], 'Like charges repel; unlike charges attract. A charged object also attracts a neutral one.', { vk: 'pair' });
    }
    function scale() {
      var F = R.pick([0.2, 0.4, 0.6, 0.9, 1.2, 1.8, 3.6, 7.2]), kind = R.pick(['d2', 'd3', 'dh', 'q2', 'q3', 'both']), k = 1, txt = [], st = [];
      if (kind === 'd2' || kind === 'both') { k /= 4; txt.push('the distance between them is doubled'); st.push('Distance × 2: force ÷ 4.'); }
      if (kind === 'd3') { k /= 9; txt.push('the distance between them is tripled'); st.push('Distance × 3: force ÷ 9.'); }
      if (kind === 'dh') { k *= 4; txt.push('the distance between them is cut in half'); st.push('Distance ÷ 2: force × 4.'); }
      if (kind === 'q2' || kind === 'both') { k *= 2; txt.push('the charge on one of them is doubled'); st.push('One charge × 2: force × 2.'); }
      if (kind === 'q3') { k *= 3; txt.push('the charge on one of them is tripled'); st.push('One charge × 3: force × 3.'); }
      var F2 = fix(F * k);
      st.push('New force: ' + M(N(F) + ' \\times ' + (k >= 1 ? N(k) : '\\tfrac{' + (k === 0.5 ? '1}{2' : k === 0.25 ? '1}{4' : '1}{9') + '}') + (Number.isInteger(fix(F2 * 1000)) ? ' = ' : ' \\approx ') + Q(sig(F2, 3), 'N')) + '.');
      return pr('Two small charged spheres push on each other with ' + MQ(F, 'N') + '. Then ' + txt.join(' and ') + '. What is the force now?', num(sig(F2, 3)), st, 'The force grows with each charge and falls with the square of the distance.', { unit: 'N', vk: 'scale' });
    }
    function concept() {
      var K = R.pick([
        ['A balloon rubbed on hair sticks to a neutral wall. Why?', 'The balloon shifts the wall\'s charges, and the nearer, opposite charges pull harder than the farther ones push.', ['The wall has a hidden positive charge.', 'Only opposite charges attract, so the wall must be charged.', 'Air pressure pushes the balloon onto the wall.']],
        ['Two charged balls are moved closer together. What happens to the force between them?', 'It gets stronger.', ['It gets weaker.', 'It stays the same.', 'It changes from a push to a pull.']],
        ['Socks often cling together when they come out of a clothes dryer. Why?', 'Tumbling moves electrons between them, leaving them with opposite charges that attract.', ['The dryer makes them magnetic.', 'Heat makes cloth sticky.', 'They have the same charge, which attracts.']],
        ['Two balloons, both rubbed on the same sweater, hang near each other. They…', 'push apart, because they have the same kind of charge.', ['pull together, because they are both charged.', 'don\'t affect each other.', 'pull together, because they have opposite charges.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Like charges repel, unlike charges attract, and the force is stronger when the charges are closer. A charged object attracts a neutral one by shifting its charges.', 'Answer: ' + K[1]], 'Closer charges pull or push harder.', { vk: 'concept' });
    }
    return lv(R, ctx, [pair, pair, concept], [pair, scale, concept], [scale, concept, pair]);
  });

  G('physsci.fields-intro', function (R, ctx) {
    var PL = [['Earth', 9.8], ['the Moon', 1.6], ['Mars', 3.7], ['Jupiter (at its cloud tops)', 24.8]];
    function force() {
      var p = R.pick(PL), m = R.pick([2, 5, 10, 20, 40, 50, 100]);
      return pr('The gravitational field near the surface of ' + p[0] + ' is about ' + MQ(p[1], 'N/kg') + '. What force does it exert on a ' + MQ(m, 'kg') + ' object?', num(fix(m * p[1])), [
        'A field of ' + MQ(p[1], 'N/kg') + ' puts ' + MQ(p[1], 'N') + ' on each kilogram.',
        M('F = ' + N(m) + ' \\times ' + N(p[1]) + ' = ' + Q(fix(m * p[1]), 'N')) + '.'
      ], 'Force = mass × field strength.', { unit: 'N', vk: 'gF' });
    }
    function strength() {
      var g0 = R.pick([1.6, 3.7, 8.9, 9.8, 11.2, 24.8]), m = R.pick([2, 5, 10, 20]), F = fix(m * g0);
      return pr('On a distant planet, a ' + MQ(m, 'kg') + ' test mass is pulled down with ' + MQ(F, 'N') + '. What is the gravitational field strength there?', num(g0), [
        'Field strength is force per kilogram.',
        M('\\dfrac{' + Q(F, 'N') + '}{' + Q(m, 'kg') + '} = ' + Q(g0, 'N/kg')) + '.'
      ], 'Divide the force by the mass.', { unit: 'N/kg', vk: 'g' });
    }
    function efield() {
      var q = R.pick([2, 3, 4, 5]), E = R.pick([10, 20, 50, 100, 200]);
      return pr('A small object with ' + MQ(q, 'C') + ' of charge feels an electric force of ' + MQ(q * E, 'N') + '. What is the electric field strength there, in newtons per coulomb?', num(E), [
        'Electric field strength is force per coulomb of charge.',
        M('\\dfrac{' + Q(q * E, 'N') + '}{' + Q(q, 'C') + '} = ' + Q(E, 'N/C')) + '.'
      ], 'Divide the force by the charge.', { unit: 'N/C', vk: 'E' });
    }
    function concept() {
      var K = R.pick([
        ['Which of these forces can act across empty space, without touching?', 'Gravity', ['Friction', 'A push from your hand', 'The tension in a rope']],
        ['On a field-line drawing, where is the field strongest?', 'Where the lines are closest together', ['Where the lines are farthest apart', 'At the ends of the lines', 'It is the same everywhere']],
        ['What do field lines show?', 'The direction of the force at each point, and how strong it is', ['The paths objects must follow', 'Real strings connecting the objects', 'Where the objects will end up']],
        ['Can two field lines from the same field ever cross?', 'No: at each point the force has only one direction.', ['Yes, wherever the field is strong.', 'Yes, at the poles.', 'Only in magnetic fields.']],
        ['Outside a bar magnet, which way do its field lines run?', 'From the north pole to the south pole', ['From the south pole to the north pole', 'In circles around the middle', 'Straight out of both poles and never back']],
        ['Which kind of field acts on a compass needle?', 'A magnetic field', ['A gravitational field', 'An electric field from a charged balloon', 'No field: compasses point north on their own']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Gravity, electric and magnetic forces act at a distance through fields. Field lines map the direction of the force; crowded lines mean a strong field.', 'Answer: ' + K[1]], 'A field is a map of the force at each point.', { vk: 'concept' });
    }
    return lv(R, ctx, [concept, force], [concept, force, strength], [force, strength, efield, concept]);
  });

  G('physsci.current-voltage', function (R, ctx) {
    function I() {
      var a = R.pick([0.5, 1, 2, 3, 4, 5, 10]), t = R.pick([2, 4, 5, 10, 20, 30, 60]), Qc = fix(a * t);
      return pr(MQ(Qc, 'C') + ' of charge flows through a ' + R.pick(['lamp', 'wire', 'heater', 'motor']) + ' in ' + MQ(t, 's') + '. What is the current?', num(a), [
        M('I = \\dfrac{Q}{t} = \\dfrac{' + Q(Qc, 'C') + '}{' + Q(t, 's') + '} = ' + Q(a, 'A')) + '.'
      ], 'Current = charge ÷ time.', { unit: 'A', vk: 'I' });
    }
    function Qq() {
      var a = R.pick([0.2, 0.5, 1.5, 2, 3, 6]), t = R.pick([10, 30, 60, 120, 300]);
      return pr('A current of ' + MQ(a, 'A') + ' flows for ' + MQ(t, 's') + '. How much charge passes?', num(fix(a * t)), [
        'Rearrange ' + M('I = \\dfrac{Q}{t}') + ': ' + M('Q = I\\,t = ' + N(a) + ' \\times ' + N(t) + ' = ' + Q(fix(a * t), 'C')) + '.'
      ], 'Charge = current × time.', { unit: 'C', vk: 'Q' });
    }
    function energy() {
      var V = R.pick([1.5, 3, 6, 9, 12]), Qc = R.pick([2, 4, 5, 10, 20, 100]);
      if (R.coin()) return pr('A ' + MQ(V, 'V') + ' battery pushes ' + MQ(Qc, 'C') + ' of charge around a circuit. How much energy does it give the charge?', num(fix(V * Qc)), [
        'Each coulomb gets ' + MQ(V, 'J') + ' (that is what ' + MQ(V, 'V') + ' means).',
        M(N(Qc) + ' \\times ' + N(V) + ' = ' + Q(fix(V * Qc), 'J')) + '.'
      ], 'Volts = joules per coulomb.', { unit: 'J', vk: 'E' });
      return pr('A battery gives ' + MQ(fix(V * Qc), 'J') + ' of energy to ' + MQ(Qc, 'C') + ' of charge. What is its voltage?', num(V), [
        'Voltage is energy per coulomb.',
        M('V = \\dfrac{' + Q(fix(V * Qc), 'J') + '}{' + Q(Qc, 'C') + '} = ' + Q(V, 'V')) + '.'
      ], 'Divide the energy by the charge.', { unit: 'V', vk: 'V' });
    }
    function same() {
      var a = R.pick([0.2, 0.3, 0.5, 0.8, 1.5, 2]);
      return pr('In a simple loop with a battery and one bulb, an ammeter just before the bulb reads ' + MQ(a, 'A') + '. What does an ammeter just after the bulb read?', num(a, 0), [
        'The charge that goes into the bulb comes out of it; current is not used up.',
        'So it reads the same: ' + MQ(a, 'A') + '. What the bulb takes is energy, not charge.'
      ], 'Is charge used up in the bulb?', { unit: 'A', vk: 'same' });
    }
    function concept() {
      var K = R.pick([
        ['What does a bulb take from the flowing charge?', 'Energy, which it turns into light and heat', ['The charge itself, so less current leaves it', 'Electrons, which are used up', 'Voltage, which becomes current']],
        ['What does the voltage of a battery tell you?', 'How much energy it gives each coulomb of charge', ['How much charge it holds', 'How fast the electrons move', 'How long it will last']],
        ['A current of 2 A means…', '2 coulombs of charge pass a point each second.', ['2 electrons pass each second.', '2 joules of energy per coulomb.', '2 volts of push.']],
        ['Which instrument measures current?', 'An ammeter', ['A voltmeter', 'A thermometer', 'A compass']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Current is the flow of charge (coulombs per second, amperes). Voltage is energy per coulomb (volts). Charge is not used up; energy is transferred.', 'Answer: ' + K[1]], 'Current = charge per second; voltage = energy per charge.', { vk: 'concept' });
    }
    return lv(R, ctx, [I, same, concept], [I, Qq, energy, same, concept], [Qq, energy, concept, same]);
  });

  G('physsci.circuits-intro', function (R, ctx) {
    function sw() { // which switches must be closed for a bulb to light
      var main = R.coin(), which = R.int(1, 2), circ = main ? 'V(6) series(S1:0, par(series(S2:0, B1:6), series(S3:0, B2:6)))' : 'V(6) par(series(S1:0, B1:6), series(S2:0, B2:6))';
      var right, wr;
      if (main) { right = 'S1 and S' + (which + 1); wr = ['S' + (which + 1) + ' only', 'S1 only', 'S' + (which === 1 ? 3 : 2) + ' and S' + (which + 1)]; }
      else { right = 'S' + which + ' only'; wr = ['S' + (which === 1 ? 2 : 1) + ' only', 'Both S1 and S2', 'Neither switch']; }
      return pr('In the circuit shown, every switch is open. Which switches must be closed to light bulb B' + which + ' (and only what it needs)?', mc(right, wr), [
        'A bulb lights only if there is a closed loop from the battery, through that bulb, and back.',
        main ? 'Every path from the battery passes through S1, and B' + which + '\'s own branch has switch S' + (which + 1) + '. Both must be closed.' : 'B' + which + '\'s branch connects straight across the battery through switch S' + which + ' alone.',
        'Answer: ' + right + '.'
      ], 'Trace a loop from the battery through that bulb and back.', { viz: { name: 'ph-circuit', opts: { circuit: circ, interactive: false, quiet: true } }, vk: 'sw' });
    }
    function count() {
      var C = R.pick([
        ['Three bulbs are connected in one single loop with a battery and a switch. The switch is open.', 0, 'All three bulbs share one loop, and the open switch breaks it.'],
        ['Three bulbs are connected in one single loop with a battery and a switch. The switch is closed.', 3, 'The single loop is complete, so current flows through all three.'],
        ['Two bulbs are on separate branches, each connected straight across a battery. Only the first branch has a switch, and it is open.', 1, 'The second branch is still a complete loop through the battery.'],
        ['Three bulbs are on separate branches, each connected straight across a battery. Each branch has its own switch; two of the switches are open.', 1, 'Only the branch with the closed switch makes a complete loop.'],
        ['Two bulbs in one single loop with a battery. One bulb\'s filament breaks.', 0, 'The broken filament is a gap in the only loop, so the current stops everywhere.'],
        ['Three bulbs are on separate branches, each connected straight across a battery. One bulb\'s filament breaks.', 2, 'The other two branches are still complete loops.'],
        ['Four bulbs are on separate branches, each connected straight across a battery, with one switch in the wire leading out of the battery. That switch is open.', 0, 'Every branch needs the shared wire with the open switch, so no loop is complete.']
      ]);
      return pr(C[0] + ' How many bulbs are lit?', num(C[1], 0), [
        'A bulb lights only if it is part of a complete (closed) loop through the battery.',
        C[2] + ' So ' + C[1] + ' bulb' + (C[1] === 1 ? ' is' : 's are') + ' lit.'
      ], 'Look for complete loops through each bulb.', { vk: 'count' });
    }
    function concept() {
      var K = R.pick([
        ['A bulb\'s two connection points are joined, one to each terminal of a battery. What happens?', 'The bulb lights, because there is a complete loop.', ['Nothing, because the bulb needs only one wire.', 'The bulb lights only if a switch is added.', 'The battery sends current one way only, so nothing happens.']],
        ['A wire runs from a battery\'s + terminal to one point on a bulb. Nothing else is connected. What happens?', 'Nothing: there is no path back to the battery.', ['The bulb lights dimly.', 'The bulb lights brightly.', 'The battery empties quickly.']],
        ['What does a switch do when it is opened?', 'It makes a gap, so current stops in that loop.', ['It lets more current through.', 'It stores charge for later.', 'It reverses the current.']],
        ['Why does one switch by the door turn off a ceiling light across the room?', 'The switch and the light are in the same loop, so opening the switch breaks the whole loop.', ['The switch sends a signal through the air.', 'The light uses up the current.', 'The switch stores the charge.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Charge flows only around a closed loop from one battery terminal, through the devices, back to the other. Any gap stops the current in that loop.', 'Answer: ' + K[1]], 'Is there a complete loop?', { vk: 'concept' });
    }
    return lv(R, ctx, [concept, count], [count, sw, concept], [sw, count, concept]);
  });

  G('physsci.ohms-law', function (R, ctx) {
    function cviz(V, Rr, show) { return { name: 'ph-circuit', opts: { circuit: 'V(' + V + ') series(A1, R1:' + Rr + ')', interactive: false, quiet: true } }; }
    function findI() {
      var Rr = R.pick([2, 3, 4, 5, 6, 8, 10, 12, 20]), I0 = R.pick([0.5, 1, 1.5, 2, 3, 4]), V = fix(Rr * I0);
      return pr('A ' + MQ(V, 'V') + ' battery is connected to ' + aQ(Rr, 'Ω') + ' resistor. What current flows?', num(I0), [
        M('I = \\dfrac{V}{R} = \\dfrac{' + Q(V, 'V') + '}{' + Q(Rr, 'Ω') + '} = ' + Q(I0, 'A')) + '.'
      ], 'Current = voltage ÷ resistance.', { unit: 'A', viz: cviz(V, Rr), vk: 'I' });
    }
    function findV() {
      var Rr = R.pick([5, 10, 15, 20, 50, 100]), I0 = R.pick([0.1, 0.2, 0.3, 0.5, 1, 2]), V = fix(Rr * I0);
      return pr('A current of ' + MQ(I0, 'A') + ' flows through ' + aQ(Rr, 'Ω') + ' resistor. What is the voltage across it?', num(V), [
        M('V = I\\,R = ' + Q(I0, 'A') + ' \\times ' + Q(Rr, 'Ω') + ' = ' + Q(V, 'V')) + '.'
      ], 'Voltage = current × resistance.', { unit: 'V', vk: 'V' });
    }
    function findR() {
      var Rr = R.pick([3, 4, 6, 8, 12, 15, 24, 30, 60]), I0 = R.pick([0.25, 0.5, 2, 3, 4]), V = fix(Rr * I0);
      return pr('A lamp draws ' + MQ(I0, 'A') + ' from ' + aQ(V, 'V') + ' supply. What is its resistance?', num(Rr), [
        M('R = \\dfrac{V}{I} = \\dfrac{' + Q(V, 'V') + '}{' + Q(I0, 'A') + '} = ' + Q(Rr, 'Ω')) + '.'
      ], 'Resistance = voltage ÷ current.', { unit: 'Ω', vk: 'R' });
    }
    function predict() {
      var Rr = R.pick([4, 5, 8, 10, 20]), V1 = R.pick([2, 4, 6]), k = R.pick([2, 3, 1.5, 0.5]), V2 = fix(V1 * k), I1 = fix(V1 / Rr), I2 = fix(V2 / Rr);
      return pr('A resistor carries ' + MQ(I1, 'A') + ' when ' + MQ(V1, 'V') + ' is across it. What current flows when the voltage is changed to ' + MQ(V2, 'V') + '?', num(I2), [
        'The resistance stays the same: ' + M('R = \\dfrac{' + N(V1) + '}{' + N(I1) + '} = ' + Q(Rr, 'Ω')) + '.',
        M('I = \\dfrac{' + N(V2) + '}{' + N(Rr) + '} = ' + Q(I2, 'A')) + '. (The current changes in proportion to the voltage.)'
      ], 'Find R first; it doesn\'t change.', { unit: 'A', vk: 'pred' });
    }
    function concept() {
      var K = R.pick([
        ['The voltage across an ordinary resistor is doubled. What happens?', 'The current doubles and the resistance stays the same.', ['The resistance doubles and the current stays the same.', 'The current halves.', 'Both the current and the resistance double.']],
        ['Which of these has the most resistance?', 'A long, thin wire', ['A short, thick wire', 'A long, thick wire', 'A short, thin piece of the same wire']],
        ['What is the unit of resistance?', 'The ohm (Ω)', ['The ampere (A)', 'The volt (V)', 'The watt (W)']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Ohm\'s law: ' + M('V = I\\,R') + '. For an ordinary resistor, R is fixed by the resistor itself (material, length, thickness), so the current is proportional to the voltage.', 'Answer: ' + K[1]], 'R belongs to the resistor.', { vk: 'concept' });
    }
    return lv(R, ctx, [findI, findV], [findI, findV, findR, concept], [findR, predict, concept, findI]);
  });

  G('physsci.series-parallel-intro', function (R, ctx) {
    var PAIRS = [[2, 4], [3, 6], [2, 2], [4, 4], [1, 3], [2, 6], [4, 12], [6, 6], [3, 3], [2, 10]];
    function seriesI() {
      var p = R.pick(PAIRS), Rt = p[0] + p[1], I0 = R.pick([0.5, 1, 1.5, 2, 3]), V = fix(I0 * Rt);
      return pr('A ' + MQ(V, 'V') + ' battery is connected to ' + aQ(p[0], 'Ω') + ' and ' + aQ(p[1], 'Ω') + ' resistor <b>in series</b>. What current flows?', num(I0), [
        'In series, resistances add: ' + M(N(p[0]) + ' + ' + N(p[1]) + ' = ' + Q(Rt, 'Ω')) + '.',
        M('I = \\dfrac{' + N(V) + '}{' + N(Rt) + '} = ' + Q(I0, 'A')) + ', the same through both.'
      ], 'Add series resistances first.', { unit: 'A', viz: { name: 'ph-circuit', opts: { circuit: 'V(' + V + ') series(R1:' + p[0] + ', R2:' + p[1] + ')', interactive: false, quiet: true } }, vk: 'sI' });
    }
    function seriesV() {
      var p = R.pick(PAIRS.filter(function (x) { return x[0] !== x[1]; })), Rt = p[0] + p[1], I0 = R.pick([0.5, 1, 2]), V = fix(I0 * Rt), which = R.int(0, 1);
      return pr('A ' + MQ(V, 'V') + ' battery is connected to resistors R1 = ' + MQ(p[0], 'Ω') + ' and R2 = ' + MQ(p[1], 'Ω') + ' in series. What is the voltage across R' + (which + 1) + '?', num(fix(I0 * p[which])), [
        'Total resistance: ' + M(Q(Rt, 'Ω')) + '. Current: ' + M(N(V) + ' \\div ' + N(Rt) + ' = ' + Q(I0, 'A')) + '.',
        'Across R' + (which + 1) + ': ' + M(N(I0) + ' \\times ' + N(p[which]) + ' = ' + Q(fix(I0 * p[which]), 'V')) + '. (The two voltages add up to the battery\'s ' + MQ(V, 'V') + '.)'
      ], 'Find the current first, then V = IR for that resistor.', { unit: 'V', viz: { name: 'ph-circuit', opts: { circuit: 'V(' + V + ') series(R1:' + p[0] + ', R2:' + p[1] + ')', interactive: false, quiet: true } }, vk: 'sV' });
    }
    function parI() {
      var p = R.pick(PAIRS), V = R.pick(p[0] <= 2 ? [6, 12] : [6, 12, 24]), which = R.pick([0, 1, 2]), I1 = fix(V / p[0]), I2 = fix(V / p[1]);
      var ask = which === 2 ? 'the total current from the battery' : 'the current through R' + (which + 1);
      var ans = which === 0 ? I1 : which === 1 ? I2 : fix(I1 + I2);
      return pr('Resistors R1 = ' + MQ(p[0], 'Ω') + ' and R2 = ' + MQ(p[1], 'Ω') + ' are connected <b>in parallel</b> to ' + aQ(V, 'V') + ' battery. What is ' + ask + '?', num(ans), [
        'In parallel, each branch gets the full ' + MQ(V, 'V') + '.',
        'R1: ' + M(N(V) + ' \\div ' + N(p[0]) + ' = ' + Q(I1, 'A')) + '. R2: ' + M(N(V) + ' \\div ' + N(p[1]) + ' = ' + Q(I2, 'A')) + '.',
        which === 2 ? 'Total: ' + M(N(I1) + ' + ' + N(I2) + ' = ' + Q(fix(I1 + I2), 'A')) + '.' : 'So ' + ask + ' is ' + MQ(ans, 'A') + '.'
      ], 'Each parallel branch has the full battery voltage.', { unit: 'A', viz: { name: 'ph-circuit', opts: { circuit: 'V(' + V + ') par(R1:' + p[0] + ', R2:' + p[1] + ')', interactive: false, quiet: true } }, vk: which === 2 ? 'pT' : 'pI' + (which + 1) });
    }
    function parR() {
      var p = R.pick([[3, 6], [6, 6], [4, 12], [2, 2], [12, 6], [10, 10], [20, 5]]), V = 12, It = fix(V / p[0] + V / p[1]), Req = fix(V / It);
      return pr('Resistors of ' + MQ(p[0], 'Ω') + ' and ' + MQ(p[1], 'Ω') + ' are connected in parallel to ' + aQ(V, 'V') + ' battery. Find the total current, then the total resistance of the pair (battery voltage ÷ total current).', num(Req), [
        'Branch currents: ' + M('12 \\div ' + N(p[0]) + ' = ' + Q(fix(V / p[0]), 'A')) + ' and ' + M('12 \\div ' + N(p[1]) + ' = ' + Q(fix(V / p[1]), 'A')) + '. Total ' + MQ(It, 'A') + '.',
        M('R = \\dfrac{12}{' + N(It) + '} = ' + Q(Req, 'Ω')) + '. That is less than either resistor alone: a second path makes it easier for current to flow.'
      ], 'Add the branch currents, then R = V ÷ I.', { unit: 'Ω', vk: 'pR' });
    }
    function concept() {
      var K = R.pick([
        ['Three identical bulbs are in series with a battery. How do their brightnesses compare?', 'All three are equally bright.', ['The first bulb is brightest.', 'The last bulb is brightest.', 'The middle bulb is brightest.']],
        ['One bulb is removed from a string of bulbs wired in series. What happens to the others?', 'They all go out.', ['They all get brighter.', 'They stay the same.', 'Only the next bulb goes out.']],
        ['One lamp in a house burns out. Why do the other lamps stay on?', 'Household outlets are wired in parallel, so each lamp has its own loop.', ['Household outlets are wired in series.', 'The other lamps have spare current.', 'Lamps don\'t need a complete loop.']],
        ['Two identical bulbs are connected to the same battery, first in series, then in parallel. In which case does each bulb glow brighter?', 'In parallel, because each bulb gets the full battery voltage', ['In series, because the current goes through both', 'They glow the same either way', 'In series, because the voltages add']],
        ['In a series circuit, how does the current through the first resistor compare with the current through the last?', 'It is the same.', ['It is larger.', 'It is smaller.', 'It depends on which resistor is bigger.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Series: one path, the same current through every part, and the voltage is shared. Parallel: each branch gets the full voltage and works on its own.', 'Answer: ' + K[1]], 'One path or several paths?', { vk: 'concept' });
    }
    return lv(R, ctx, [seriesI, parI, concept], [seriesI, seriesV, parI, concept], [seriesV, parI, parR, concept]);
  });

  G('physsci.electric-power', function (R, ctx) {
    var DEV = [['hair dryer', 120, [10, 12.5]], ['toaster', 120, [6, 7.5, 9]], ['laptop charger', 20, [2, 3, 3.25]], ['flashlight bulb', 3, [0.5, 0.25]], ['car headlight', 12, [5, 4.5]], ['electric kettle', 120, [12.5, 15]], ['space heater', 120, [12.5, 10]]];
    function P() {
      var d = R.pick(DEV), I0 = R.pick(d[2]), Pw = fix(d[1] * I0);
      return pr('A ' + d[0] + ' draws ' + MQ(I0, 'A') + ' from ' + aQ(d[1], 'V') + ' supply. What is its power?', num(Pw), [
        M('P = V\\,I = ' + Q(d[1], 'V') + ' \\times ' + Q(I0, 'A') + ' = ' + Q(Pw, 'W')) + '.'
      ], 'Power = voltage × current.', { unit: 'W', vk: 'P' });
    }
    function I() {
      var Pw = R.pick([60, 120, 240, 600, 900, 1200, 1500, 1800]), V = 120;
      return pr('A ' + MQ(Pw, 'W') + ' appliance runs on ' + aQ(V, 'V') + ' outlet. What current does it draw?', num(fix(Pw / V)), [
        'Rearrange ' + M('P = V\\,I') + ' to ' + M('I = \\dfrac{P}{V}') + '.',
        M('I = \\dfrac{' + N(Pw) + '}{120} = ' + Q(fix(Pw / V), 'A')) + '.'
      ], 'Current = power ÷ voltage.', { unit: 'A', vk: 'I' });
    }
    function kwh() {
      var Pw = R.pick([0.5, 1, 1.2, 1.5, 2, 3, 4.5]), h = R.pick([2, 3, 4, 5, 6, 8, 10]), thing = R.pick(['space heater', 'air conditioner', 'oven', 'pool pump', 'clothes dryer']);
      var askW = R.chance(0.35);
      return pr('A ' + (askW ? MQ(Pw * 1000, 'W') : MQ(Pw, 'kW')) + ' ' + thing + ' runs for ' + MQ(h, 'h') + '. How much energy does it use, in kilowatt-hours?', num(fix(Pw * h)), [
        askW ? 'First change to kilowatts: ' + M(N(Pw * 1000) + '\\,\\mathrm{W} = ' + Q(Pw, 'kW')) + '.' : 'Energy = power × time, with power in kW and time in hours.',
        M(Q(Pw, 'kW') + ' \\times ' + Q(h, 'h') + ' = ' + Q(fix(Pw * h), 'kWh')) + '.'
      ], 'kWh = kW × hours.', { unit: 'kWh', vk: askW ? 'kwhW' : 'kwh' });
    }
    function cost() {
      var Pw = R.pick([0.1, 0.5, 1, 1.5, 2]), h = R.pick([2, 4, 5, 10, 20, 30]), c = R.pick([10, 12, 15, 20]), E = fix(Pw * h), C = fix(E * c);
      return pr('A ' + MQ(Pw, 'kW') + ' device runs for ' + MQ(h, 'h') + '. Electricity costs ' + c + ' cents per kWh. What does the energy cost, in cents?', num(C, 0.01), [
        'Energy: ' + M(Q(Pw, 'kW') + ' \\times ' + Q(h, 'h') + ' = ' + Q(E, 'kWh')) + '.',
        'Cost: ' + M(N(E) + ' \\times ' + c + ' = ' + N(C)) + ' cents.'
      ], 'Find the kWh first, then multiply by the price.', { vk: 'cost' });
    }
    function concept() {
      var K = R.pick([
        ['Which of these is an amount of energy?', '3 kWh', ['3 kW', '3 A', '3 V']],
        ['A 2 kW kettle and a 2 kW heater are both switched on. Which uses more energy?', 'Whichever runs longer', ['The kettle, always', 'The heater, always', 'They always use the same energy']],
        ['What does a power company charge you for?', 'Energy, in kilowatt-hours', ['Power, in kilowatts', 'Current, in amperes', 'Voltage, in volts']],
        ['A 100 W bulb and a 10 W LED give the same light. Over the same time, the LED uses…', 'one tenth of the energy.', ['the same energy.', 'ten times the energy.', 'no energy.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Power (W or kW) is a rate; energy (J or kWh) is an amount: energy = power × time.', 'Answer: ' + K[1]], 'Rate or amount?', { vk: 'concept' });
    }
    return lv(R, ctx, [P, kwh, concept], [P, I, kwh, concept], [I, kwh, cost, concept]);
  });

  G('physsci.magnets', function (R, ctx) {
    function poles() {
      var a = R.pick(['north', 'south']), b = R.pick(['north', 'south']), right = a === b ? 'They repel.' : 'They attract.';
      return pr('The ' + a + ' pole of one magnet is brought near the ' + b + ' pole of another. What happens?', { t: 'mc', choices: ['They attract.', 'They repel.', 'Nothing happens.'], v: right === 'They attract.' ? 0 : 1, keep: true }, [
        'Like poles repel; unlike poles attract.',
        a + ' and ' + b + ' are ' + (a === b ? 'like' : 'unlike') + ' poles, so: ' + right.toLowerCase()
      ], 'Like poles repel.', { vk: 'poles' });
    }
    function pieces() {
      var n = R.int(2, 6), askN = R.coin();
      return pr('A bar magnet is snapped into ' + n + ' pieces. Altogether, how many ' + (askN ? 'north' : 'south') + ' poles are there now?', num(n, 0), [
        'Every piece of a magnet is a complete magnet with its own north and south pole.',
        'So ' + n + ' pieces have ' + n + ' ' + (askN ? 'north' : 'south') + ' poles (and ' + n + ' of the other kind).'
      ], 'Does a piece of a magnet ever have just one pole?', { vk: 'pieces' });
    }
    function concept() {
      var K = R.pick([
        ['A compass needle\'s north pole points toward the Arctic. What kind of magnetic pole is near the Arctic?', 'A magnetic south pole', ['A magnetic north pole', 'No pole at all', 'Both poles']],
        ['Which of these is attracted to a magnet?', 'An iron nail', ['An aluminum can', 'A copper coin', 'A plastic spoon']],
        ['Outside a bar magnet, its field lines run…', 'from the north pole to the south pole.', ['from the south pole to the north pole.', 'only around the middle.', 'away from both poles and never return.']],
        ['A bar magnet is cut in half. What do you get?', 'Two smaller magnets, each with a north and a south pole', ['A north pole and a separate south pole', 'Two pieces that are no longer magnets', 'Two north poles']],
        ['Where is a bar magnet\'s pull strongest?', 'At its poles (the ends)', ['In the middle', 'Equally everywhere', 'Far from the magnet']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Every magnet has a north and a south pole; like poles repel and unlike attract. Field lines run from north to south outside the magnet. Iron, nickel and cobalt are attracted; most other metals are not.', 'Answer: ' + K[1]], 'Think of the rules for poles.', { vk: 'concept' });
    }
    function identify() {
      var test = R.pick(['north', 'south']), att = R.coin(), end = R.pick(['end A', 'the painted end', 'the end marked with tape', 'end X', 'the red end', 'the left end']), thing = R.pick(['an unlabeled bar magnet', 'a magnet from an old speaker', 'a horseshoe magnet with its labels worn off', 'a fridge magnet\'s strip']);
      var ans = att ? (test === 'north' ? 'south' : 'north') : test;
      return pr('You bring the ' + test + ' pole of a labeled magnet near ' + end + ' of ' + thing + ', and they ' + (att ? 'attract' : 'repel') + '. What kind of pole is ' + end + '?', { t: 'mc', choices: ['A north pole', 'A south pole', 'It can\'t be a pole'], v: ans === 'north' ? 0 : 1, keep: true }, [
        att ? 'Unlike poles attract, so ' + end + ' is the opposite of ' + test + '.' : 'Like poles repel, so ' + end + ' is the same as ' + test + '.',
        'It is a ' + ans + ' pole.' + (att ? ' (A repel test is the surest check: an unmagnetized piece of iron would be attracted too, but only a like pole repels.)' : '')
      ], 'Like poles repel; unlike poles attract.', { vk: 'ident' });
    }
    return lv(R, ctx, [poles, identify, concept], [poles, pieces, identify, concept], [pieces, identify, concept, poles]);
  });

  G('physsci.electromagnets', function (R, ctx) {
    function stronger() {
      var ok = R.pick(['Wind more turns of wire on the coil', 'Increase the current through the coil', 'Put an iron core inside the coil']);
      return pr('Which change makes an electromagnet stronger?', mc(ok, ['Use a wooden core instead of an iron one', 'Reverse the direction of the current', 'Reduce the current through the coil']), [
        'More current, more turns and an iron core all strengthen an electromagnet.',
        'Reversing the current only swaps its north and south poles.', 'Answer: ' + ok + '.'
      ], 'What adds to the magnetic field?', { vk: 'concept' });
    }
    function concept() {
      var K = R.pick([
        ['What happens when the current to an electromagnet is switched off?', 'Its magnetic field mostly disappears.', ['It becomes a permanent magnet.', 'Its field gets stronger.', 'Its poles swap.']],
        ['A compass is placed next to a wire. When current flows, the needle turns. What does this show?', 'An electric current makes a magnetic field.', ['The wire is made of iron.', 'The compass makes a current.', 'Electricity and magnetism are unrelated.']],
        ['The current in an electromagnet is reversed. What happens?', 'Its north and south poles swap.', ['It stops working.', 'It gets twice as strong.', 'Nothing changes.']],
        ['An electric motor changes…', 'electrical energy into kinetic energy (motion).', ['kinetic energy into electrical energy.', 'chemical energy into light.', 'heat into electrical energy.']],
        ['Why is a scrapyard crane magnet an electromagnet instead of a permanent magnet?', 'It can be switched off to drop its load.', ['Permanent magnets can\'t lift iron.', 'Electromagnets don\'t need electricity.', 'It is lighter than any permanent magnet.']],
        ['Which of these makes a magnetic field?', 'A wire carrying an electric current', ['A wire with no current in it', 'A plastic rod', 'A glass of water']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Every electric current makes a magnetic field. A coil concentrates it, and an iron core makes it much stronger. In a motor, magnetic forces on a current-carrying coil make it spin.', 'Answer: ' + K[1]], 'Currents make magnetic fields.', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['Only permanent magnets can make magnetic fields.', false, 'Any electric current makes a magnetic field.'],
        ['Adding more turns of wire to an electromagnet\'s coil makes it stronger.', true, 'The fields of the turns add together.'],
        ['An iron core makes an electromagnet weaker.', false, 'The iron\'s own tiny magnets line up and add a much bigger field.'],
        ['An electric motor uses magnetic forces to make something spin.', true, 'Magnetic forces on the current in its coil turn it.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Currents make magnetic fields.', { vk: 'concept' });
    }
    return lv(R, ctx, [stronger, concept, tfq], [stronger, concept, tfq], [stronger, concept, tfq]);
  });

  G('physsci.generators', function (R, ctx) {
    function when() {
      var K = R.pick([
        ['A magnet sits still inside a coil connected to a meter. What does the meter show?', 'No current, because nothing is changing', ['A steady current', 'A current that slowly grows', 'A current that flips back and forth']],
        ['A magnet is pushed quickly into a coil. What does the meter show?', 'A current while the magnet moves', ['No current, because the magnet is moving', 'A current only after the magnet stops', 'A current that keeps flowing forever']],
        ['A magnet is pushed into a coil and the meter swings right. What happens when the magnet is pulled back out?', 'The meter swings left: the current flows the other way.', ['The meter swings right again.', 'The meter shows nothing.', 'The meter swings right, but further.']],
        ['How can you get a bigger induced current from a magnet and a coil?', 'Move the magnet faster', ['Hold the magnet still inside the coil', 'Use fewer turns of wire', 'Move the magnet more slowly']],
        ['A coil is moved toward a magnet that stays still. Is a current induced?', 'Yes: what matters is the relative motion.', ['No: only a moving magnet works.', 'Only if the coil is made of iron.', 'Only if a battery is connected.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['A current is induced in a coil only while the magnetic field through it is changing. Faster changes, stronger magnets and more turns give more current; reversing the motion reverses the current.', 'Answer: ' + K[1]], 'Is the magnetic field through the coil changing?', { vk: 'concept' });
    }
    function energy() {
      var K = R.pick([
        ['A hydroelectric dam\'s generators are turned by falling water. What energy change happens?', 'The water\'s gravitational potential energy becomes kinetic energy, then electrical energy.', ['Electrical energy becomes potential energy.', 'Chemical energy becomes electrical energy.', 'Light energy becomes electrical energy.']],
        ['A bicycle light is powered by a small generator on the wheel. Where does the light\'s energy come from?', 'The rider\'s pedaling (kinetic energy of the wheel)', ['The generator makes energy from nothing', 'A battery inside the generator', 'The magnet slowly loses its energy']],
        ['How is a generator different from a motor?', 'A generator turns motion into electrical energy; a motor turns electrical energy into motion.', ['They do the same thing.', 'A generator turns electrical energy into motion.', 'A motor needs no magnet.']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['A generator turns kinetic energy into electrical energy. Energy is conserved: the electrical energy comes from the work done turning it.', 'Answer: ' + K[1]], 'Follow the energy.', { vk: 'concept' });
    }
    function eff() {
      var inn = R.pick([1000, 2000, 5000, 10000]), pct = R.pick([80, 85, 90, 95]), out = inn * pct / 100;
      return pr('A generator is turned with ' + MQ(inn, 'J') + ' of kinetic energy and delivers ' + MQ(out, 'J') + ' of electrical energy. Where did the other ' + MQ(inn - out, 'J') + ' go, and what is its efficiency, as a percent?', { t: 'num', v: String(pct), pct: true, rtol: 0.001 }, [
        'The missing energy became heat (and some sound) from friction and from current in the coil\'s wires; none was destroyed.',
        'Efficiency: ' + M('\\dfrac{' + N(out) + '}{' + N(inn) + '} \\times 100\\% = ' + pct + '\\%') + '.'
      ], 'Useful energy out ÷ energy in.', { vk: 'eff' });
    }
    function freq() {
      var f = R.pick([50, 60, 10, 20, 30]);
      return pr('A simple generator\'s coil turns ' + f + ' times each second, and its current flows one way for half of each turn and the other way for the other half. How many complete back-and-forth cycles of current does it make each second (its frequency, in Hz)?', num(f, 0), [
        'Each full turn of the coil gives one full cycle: one way, then the other way.',
        f + ' turns per second → ' + MQ(f, 'Hz') + '.'
      ], 'One turn, one cycle.', { unit: 'Hz', vk: 'freq' });
    }
    return lv(R, ctx, [when, energy], [when, energy, eff], [when, eff, freq, energy]);
  });

})(window.MathLadder);
