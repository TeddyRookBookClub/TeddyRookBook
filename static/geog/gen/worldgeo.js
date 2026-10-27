/* Generators for worldgeo, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* World Geography (Geography Ladder, course key worldgeo), part A: units 1-6 (latitude and longitude, maps and projections,
   time, the physical world, climate and biomes, countries of the world). Source: /tmp/work_worldgeo_A/src/g_*.js, joined by
   /tmp/work_worldgeo_A/build_gen.sh into /tmp/work_worldgeo_A/out/gen.js and merged by /tmp/merge_parts.js.
   Answers are mc (letters with keep: true when the choices name marks on a picture), tf, num with rtol for rounded
   geography numbers, and multi. Pictures come from the kit (static/geog/viz/geog.js) and are computed from the same data
   as the answers (MathLadder.geog, called inside each generator). Levels: 1 = one clear question, very different choices;
   2 = choices from the topic's trouble note; 3 = reverse, two-step or "choose all" questions. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var LET = ['A', 'B', 'C', 'D', 'E'];
  function tidy(s) { return typeof s === 'string' ? s.replace(/(a\.m\.|p\.m\.)\./g, '$1') : s; }
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); p.steps = p.steps.map(tidy); return p; }); } // generators register through ML.gen; steps never end in "a.m.."
  function offStr(h) { return h === 0 ? '0' : ML.geog.fmtUTC(h).replace('UTC', ''); }
  function GG() { return ML.geog; }
  function mc(choices, right, keep) { var o = { t: 'mc', choices: choices, v: choices.indexOf(right) }; if (o.v < 0) throw new Error('mc: right answer missing: ' + right); if (keep) o.keep = true; return o; }
  function letters(n, i) { return { t: 'mc', choices: LET.slice(0, n), v: i, keep: true }; }
  function num(v, rtol, unit) { var a = { t: 'num', v: String(v) }; if (rtol) a.rtol = rtol; return a; }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lat(v) { return GG().fmtLat(v); }
  function lon(v) { return GG().fmtLon(v); }
  function coord(la, lo) { return lat(la) + ', ' + lon(lo); }
  function uniqStr(a) { var s = {}; return a.filter(function (x) { if (s[x]) return false; s[x] = 1; return true; }); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function fmtN(v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // a true-or-false item from a bank of [statement, true?, explanation]
  function tfItem(R, bank, hint) { var it = R.pick(bank); return { q: '<p>True or false? ' + it[0] + '</p>', a: { t: 'tf', v: it[1] }, hint: hint, steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] }; }
  // choose all that are true: k items from a bank, at least one true and one false
  function chooseAll(R, bank, k, hint, lead) {
    var tr = bank.filter(function (x) { return x[1]; }), fl = bank.filter(function (x) { return !x[1]; }), nt = R.int(Math.max(1, k - fl.length), Math.min(k - 1, tr.length));
    var list = R.shuffle(R.sample(tr, nt).concat(R.sample(fl, k - nt)));
    return { q: '<p>' + (lead || 'Which statements are true? Choose all that are true.') + '</p>', a: { t: 'mc', choices: list.map(function (x) { return x[0]; }), v: list.map(function (x, i) { return x[1] ? i : -1; }).filter(function (i) { return i >= 0; }) },
      hint: hint, steps: list.map(function (x) { return (x[1] ? 'True: ' : 'Not true: ') + x[0] + ' ' + x[2]; }) };
  }

  /* ================================================================== unit 1: latitude and longitude */
  var PM_BANK = [
    ['Parallels run east and west around the globe.', true, 'They circle the globe like rings, parallel to the equator.'],
    ['Meridians run from the North Pole to the South Pole.', true, 'Each meridian is a half circle from pole to pole.'],
    ['Parallels are used to measure how far north or south a place is.', true, 'Moving from one parallel to the next takes you north or south.'],
    ['Meridians are used to measure how far east or west a place is.', true, 'Moving from one meridian to the next takes you east or west.'],
    ['All meridians meet at the North Pole and the South Pole.', true, 'That is why they are far apart at the equator and close together near the poles.'],
    ['Parallels never meet, no matter how far they go.', true, 'They stay the same distance apart all the way around.'],
    ['Parallels get shorter as you go toward the poles.', true, 'The circles get smaller near the poles; the equator is the longest.'],
    ['The equator is a parallel.', true, 'It is the parallel at 0° latitude.'],
    ['The prime meridian is a meridian.', true, 'It is the meridian at 0° longitude, through Greenwich.'],
    ['Lines of latitude are also called parallels.', true, 'Latitude lines and parallels are the same thing.'],
    ['Parallels measure how far east or west a place is.', false, 'Parallels run east-west, but they measure north-south position (latitude).'],
    ['Meridians measure how far north or south a place is.', false, 'Meridians run north-south, but they measure east-west position (longitude).'],
    ['Meridians never meet.', false, 'All meridians meet at the two poles.'],
    ['Parallels meet at the poles.', false, 'Parallels never meet; meridians do.'],
    ['The equator is a meridian.', false, 'The equator runs east-west around the middle of Earth, so it is a parallel.'],
    ['The prime meridian runs east and west.', false, 'Like every meridian, it runs north-south, from pole to pole.'],
    ['Lines of longitude are also called parallels.', false, 'Lines of longitude are meridians; lines of latitude are parallels.'],
    ['Every parallel is the same length as the equator.', false, 'Parallels shrink toward the poles; only meridians are all the same length.']];
  var PM_DESC = [
    ['a line that runs from the North Pole to the South Pole', 'm'], ['a line that circles the globe from east to west', 'p'], ['a line that never meets any other line of its kind', 'p'],
    ['a line that meets all the others of its kind at the poles', 'm'], ['a line of latitude', 'p'], ['a line of longitude', 'm'], ['the equator', 'p'], ['the prime meridian', 'm'],
    ['the Tropic of Cancer', 'p'], ['the Arctic Circle', 'p'], ['the 180° line on the far side of the globe from Greenwich', 'm']];
  G('worldgeo.parallels-meridians', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['name', 'globe', 'tf']) : L === 2 ? R.pick(['measure', 'globe', 'tf', 'name']) : R.pick(['all', 'measure', 'tf']);
    var PN = 'A parallel (a line of latitude)', MN = 'A meridian (a line of longitude)';
    if (shape === 'name') {
      var d = R.pick(PM_DESC), right = d[1] === 'p' ? PN : MN;
      return { q: '<p>What is ' + d[0] + '?</p>', a: mc([PN, MN], right), hint: 'Parallels go around the globe east-west; meridians go pole to pole.',
        steps: [cap1(d[0]) + (d[1] === 'p' ? ' runs east and west around the globe.' : ' runs north and south, from pole to pole.'), 'So it is ' + right.toLowerCase() + '.'] };
    }
    if (shape === 'globe') {
      var k = R.pick(['equator', 'prime', 'cancer', 'capricorn', 'arctic', 'prime', 'dateline']), isP = ML.geog.LINES[k].lat !== undefined;
      return { q: '<p>Is the colored line on this globe a parallel or a meridian?</p>', viz: { name: 'gg-globe', opts: { center: [R.pick([-40, -10, 20, 60]), 20], lines: [k], quiet: true, interactive: false, ask: k, lineLabels: false, size: 300 } },
        a: mc(['A parallel', 'A meridian'], isP ? 'A parallel' : 'A meridian'), hint: 'Does the line go around the globe, or from pole to pole?',
        steps: ['The line ' + (isP ? 'circles the globe east-west and never reaches a pole' : 'runs from the North Pole to the South Pole') + '.', 'So it is ' + (isP ? 'a parallel' : 'a meridian') + ': the ' + ML.geog.LINES[k].n.replace(/^Prime/, 'prime') + '.'] };
    }
    if (shape === 'measure') {
      var dir = R.pick(['north or south', 'east or west']), wantP = dir === 'north or south';
      var ch = L === 3 ? ['Parallels, which run east-west', 'Meridians, which run north-south', 'Parallels, which run north-south', 'Meridians, which run east-west'] : ['Parallels (lines of latitude)', 'Meridians (lines of longitude)'];
      var right2 = L === 3 ? (wantP ? 'Parallels, which run east-west' : 'Meridians, which run north-south') : (wantP ? 'Parallels (lines of latitude)' : 'Meridians (lines of longitude)');
      return { q: '<p>You want to tell how far <b>' + dir + '</b> a place is. Which lines do you use?</p>', a: mc(ch, right2),
        hint: 'Think about what changes when you step from one line to the next.',
        steps: [wantP ? 'Stepping from one parallel to the next moves you north or south.' : 'Stepping from one meridian to the next moves you east or west.', 'So use ' + right2.toLowerCase() + '.', 'Careful: the lines run the other way from what they measure.'] };
    }
    if (shape === 'tf') return tfItem(R, PM_BANK, 'Parallels run east-west and measure north-south; meridians run north-south and measure east-west.');
    return chooseAll(R, PM_BANK, 4, 'Parallels never meet; meridians meet at the poles.');
  });

  /* ---------------------------------------------------------- latitude */
  function readLatLon(R, L, which) { // a point on a grid, for reading latitude ('lat'), longitude ('lon') or both ('both')
    // the views are at most 180° (step 30), 90° (step 15) or 60° (step 10) wide, so the edge labels never crowd on a phone
    var step = L === 1 ? 30 : 15, la, lo, bbox, c0, r0, opts0;
    if (L === 1) { la = R.pick([-60, -30, 30, 60]); lo = R.pick([-150, -120, -90, -60, -30, 30, 60, 90, 120, 150]);
      opts0 = []; for (c0 = -180; c0 <= 0; c0 += 30) if (lo >= c0 + 30 && lo <= c0 + 150) opts0.push(c0); c0 = R.pick(opts0); bbox = [c0, -90, c0 + 180, 90]; }
    else { la = R.pick([-75, -45, -15, 15, 45, 75, -60, -30, 30, 60]); lo = R.pick([-165, -135, -105, -75, -45, -15, 15, 45, 75, 105, 135, 165]);
      opts0 = []; for (c0 = -180; c0 <= 90; c0 += 15) if (lo >= c0 + 15 && lo <= c0 + 75) opts0.push(c0); c0 = R.pick(opts0);
      var rr = []; for (r0 = -90; r0 <= 0; r0 += 15) if (la >= r0 + 15 && la <= r0 + 75) rr.push(r0); r0 = R.pick(rr); bbox = [c0, r0, c0 + 90, r0 + 90]; }
    if (L === 3) { step = 10; la = R.pick([-1, 1]) * R.pick([15, 25, 35, 45, 55, 65]); lo = R.pick([-1, 1]) * R.pick([15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135]);
      var lo0 = Math.max(-180, Math.min(120, Math.floor((lo - 30) / 10) * 10 + R.int(0, 2) * 10)), la0 = Math.max(-80, Math.min(45, Math.floor((la - 20) / 10) * 10));
      bbox = [lo0, la0, lo0 + 60, la0 + 40]; }
    var opts = { point: [lo, la], quiet: true, interactive: false, mark: '?', step: step };
    if (bbox) opts.bbox = bbox;
    return { la: la, lo: lo, viz: { name: 'gg-latlon', opts: opts } };
  }
  G('worldgeo.latitude', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['read', 'describe', 'pole']) : L === 2 ? R.pick(['read', 'readmulti', 'describe', 'valid']) : R.pick(['readmulti', 'valid', 'farther']);
    if (shape === 'read' || shape === 'readmulti') {
      var P = readLatLon(R, shape === 'readmulti' ? Math.max(2, L) : L), la = P.la, a = Math.abs(la), right = lat(la), opp = lat(-la);
      var steps = ['Follow the point straight across to the left edge and read the latitude there: ' + a + '°' + (a % P.viz.opts.step ? ' (halfway between two grid lines)' : '') + '.', 'The point is ' + (la > 0 ? 'above (north of)' : 'below (south of)') + ' the equator, so the letter is ' + (la > 0 ? 'N' : 'S') + '.', 'Latitude: ' + right + '.'];
      if (shape === 'readmulti') return { q: '<p>What is the latitude of the point marked <b>?</b> Give the number of degrees and choose N or S.</p>', viz: P.viz,
        a: { t: 'multi', parts: [{ label: 'Degrees', a: num(a), unit: '°' }, { label: 'North or south', a: { t: 'mc', choices: ['N', 'S'], v: la > 0 ? 0 : 1, keep: true } }] },
        hint: 'Read the number on the left edge, then check: is the point above or below the equator (0°)?', steps: steps };
      var wr = [opp, lat((a === 30 ? 60 : a === 60 ? 30 : a + (a < 60 ? 15 : -15)) * Math.sign(la)), a + '° ' + R.pick(['E', 'W'])];
      return { q: '<p>What is the latitude of the point marked <b>?</b></p>', viz: P.viz, a: mc([right].concat(wr), right), hint: 'Latitude is read on the left edge. Is the point north or south of the equator?', steps: steps };
    }
    if (shape === 'describe') {
      var d = R.pick([10, 15, 20, 25, 35, 40, 50, 55, 65, 70, 80]), ns = R.coin() ? 'north' : 'south', rr = d + '° ' + (ns === 'north' ? 'N' : 'S');
      var ch = [rr, d + '° ' + (ns === 'north' ? 'S' : 'N'), d + '°', (90 - d) + '° ' + (ns === 'north' ? 'N' : 'S')];
      return { q: '<p>A town is ' + d + '° ' + ns + ' of the equator. How do you write its latitude?</p>', a: mc(ch, rr), hint: 'Write the degrees, then the letter for north or south.',
        steps: ['The number is how far from the equator: ' + d + '°.', 'It is ' + ns + ' of the equator, so the letter is ' + (ns === 'north' ? 'N' : 'S') + '.', 'Without the letter, "' + d + '°" could be on either side of the equator.'] };
    }
    if (shape === 'pole') {
      var q = R.pick([['the North Pole', '90° N'], ['the South Pole', '90° S'], ['the equator', '0°']]);
      return { q: '<p>What is the latitude of ' + q[0] + '?</p>', a: mc(['90° N', '90° S', '0°', '180° N'], q[1]), hint: 'The equator is 0°; the poles are as far from it as you can go.',
        steps: ['Latitude counts degrees from the equator (0°) toward a pole.', 'A pole is a quarter of the way around Earth from the equator: 90°.', q[0] === 'the equator' ? 'The equator itself is 0°, with no letter.' : 'So ' + q[0] + ' is ' + q[1] + '.'] };
    }
    if (shape === 'valid') {
      var good = R.pick([5, 15, 25, 35, 45, 55, 65, 75, 85]) + '° ' + R.pick(['N', 'S']);
      var bad = R.sample([R.pick([95, 120, 150]) + '° N', R.pick([100, 135, 170]) + '° S', R.pick([20, 40, 60]) + '° ' + R.pick(['E', 'W']), R.pick([200, 250, 300]) + '° N'], 3);
      return { q: '<p>Which of these could be a latitude?</p>', a: mc([good].concat(bad), good), hint: 'A latitude is from 0° to 90°, with N or S.',
        steps: ['Latitude goes from 0° at the equator to 90° at a pole, so no latitude is more than 90°.', 'Its letter is N or S; E and W belong to longitude.', 'Only ' + good + ' fits both rules.'] };
    }
    // farther from the equator
    var CS = ML.geog.CITIES.filter(function (c) { return Math.abs(c.lat) >= 3; }), a1, b1, n = 0;
    do { a1 = R.pick(CS); b1 = R.pick(CS); n++; } while ((a1 === b1 || Math.abs(Math.abs(a1.lat) - Math.abs(b1.lat)) < 6 || Math.sign(a1.lat) === Math.sign(b1.lat)) && n < 200);
    var far = Math.abs(a1.lat) > Math.abs(b1.lat) ? a1 : b1, near = far === a1 ? b1 : a1;
    var fmt = function (c) { return c.n + ' (' + lat(Math.round(c.lat)) + ')'; };
    return { q: '<p>Which city is farther from the equator?</p>', a: mc([fmt(a1), fmt(b1)], fmt(far)), hint: 'Compare the numbers only; N or S tells which side, not how far.',
      steps: ['Distance from the equator is the number of degrees, whichever letter it has.', far.n + ': ' + Math.abs(Math.round(far.lat)) + '°; ' + near.n + ': ' + Math.abs(Math.round(near.lat)) + '°.', far.n + ' is farther from the equator.'] };
  });

  /* ---------------------------------------------------------- longitude */
  G('worldgeo.longitude', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['read', 'describe', 'prime']) : L === 2 ? R.pick(['read', 'readmulti', 'describe', 'valid']) : R.pick(['readmulti', 'valid', 'opposite']);
    if (shape === 'read' || shape === 'readmulti') {
      var P = readLatLon(R, shape === 'readmulti' ? Math.max(2, L) : L), lo = P.lo, a = Math.abs(lo), right = lon(lo);
      var steps = ['Follow the point straight down to the bottom edge and read the longitude there: ' + a + '°' + (a % P.viz.opts.step ? ' (halfway between two grid lines)' : '') + '.', 'The point is ' + (lo > 0 ? 'right of (east of)' : 'left of (west of)') + ' the prime meridian, 0°, so the letter is ' + (lo > 0 ? 'E' : 'W') + '.', 'Longitude: ' + right + '.'];
      if (shape === 'readmulti') return { q: '<p>What is the longitude of the point marked <b>?</b> Give the number of degrees and choose E or W.</p>', viz: P.viz,
        a: { t: 'multi', parts: [{ label: 'Degrees', a: num(a), unit: '°' }, { label: 'East or west', a: { t: 'mc', choices: ['E', 'W'], v: lo > 0 ? 0 : 1, keep: true } }] },
        hint: 'Read the number on the bottom edge, then check: is the point left or right of the prime meridian (0°)?', steps: steps };
      var other = a + 30 <= 180 ? a + 30 : a - 30;
      var wr = [lon(-lo), lon(other * Math.sign(lo)), (a <= 90 ? a : 180 - a) + '° ' + R.pick(['N', 'S'])];
      return { q: '<p>What is the longitude of the point marked <b>?</b></p>', viz: P.viz, a: mc(uniqStr([right].concat(wr)), right), hint: 'Longitude is read along the bottom edge. Is the point east or west of the prime meridian?', steps: steps };
    }
    if (shape === 'describe') {
      var d = R.pick([15, 20, 30, 45, 60, 75, 90, 100, 120, 135, 150, 165]), ew = R.coin() ? 'east' : 'west', rr = d + '° ' + (ew === 'east' ? 'E' : 'W');
      var ch = [rr, d + '° ' + (ew === 'east' ? 'W' : 'E'), d + '° ' + (ew === 'east' ? 'N' : 'S'), (360 - d) + '° ' + (ew === 'east' ? 'E' : 'W')];
      return { q: '<p>A meridian is ' + d + '° ' + ew + ' of the prime meridian. How do you write its longitude?</p>', a: mc(ch, rr), hint: 'Write the degrees, then E or W.',
        steps: ['The number is how far from the prime meridian: ' + d + '°.', 'It is ' + ew + ' of it, so the letter is ' + (ew === 'east' ? 'E' : 'W') + '.', 'N and S are for latitude, and longitude never goes past 180°.'] };
    }
    if (shape === 'prime') {
      var q = R.pick([['Where does the prime meridian (0° longitude) run?', 'Through Greenwich, in London, from the North Pole to the South Pole', ['Around the middle of Earth, like the equator', 'Through Washington, D.C., from east to west', 'Along the 180° line in the Pacific']],
        ['What is the longitude of a place on the prime meridian?', '0°', ['90° E', '180°', '0° N']], ['What is the largest longitude a place can have?', '180°', ['90°', '360°', '100°']]]);
      return { q: '<p>' + q[0] + '</p>', a: mc([q[1]].concat(q[2]), q[1]), hint: 'Longitude counts east and west from the prime meridian at Greenwich.',
        steps: ['The prime meridian is 0° longitude. It runs from pole to pole through Greenwich, in London.', 'Longitude counts up to 180° east and 180° west, which meet on the far side of the globe.'] };
    }
    if (shape === 'valid') {
      var good = R.pick([10, 35, 65, 95, 125, 145, 170]) + '° ' + R.pick(['E', 'W']);
      var bad = R.sample([R.pick([190, 220, 270]) + '° E', R.pick([200, 300, 350]) + '° W', R.pick([40, 70]) + '° ' + R.pick(['N', 'S']), '360° E'], 3);
      return { q: '<p>Which of these could be a longitude?</p>', a: mc([good].concat(bad), good), hint: 'A longitude is from 0° to 180°, with E or W.',
        steps: ['Longitude goes from 0° at the prime meridian to 180° east or west, so it is never more than 180°.', 'Its letter is E or W.', 'Only ' + good + ' fits both rules.'] };
    }
    var d2 = R.pick([10, 20, 30, 45, 60, 75, 100, 120, 135, 150]), e = R.coin(), opp = 180 - d2, rr2 = opp + '° ' + (e ? 'W' : 'E');
    return { q: '<p>What longitude is exactly halfway around the globe from ' + d2 + '° ' + (e ? 'E' : 'W') + '?</p>', a: mc(uniqStr([rr2, opp + '° ' + (e ? 'E' : 'W'), (d2 + 180) + '° ' + (e ? 'E' : 'W'), d2 + '° ' + (e ? 'W' : 'E')]), rr2),
      hint: 'Going halfway around means 180°. Cross the 180° line and count back down on the other side.',
      steps: ['Halfway around the globe is 180° away.', 'From ' + d2 + '° ' + (e ? 'E' : 'W') + ', going ' + (e ? 'east' : 'west') + ' ' + (180 - d2) + '° reaches the 180° line.', 'The other ' + d2 + '° continue into the ' + (e ? 'Western' : 'Eastern') + ' Hemisphere: 180 − ' + d2 + ' = ' + opp + '.', 'Answer: ' + rr2 + '. (Longitudes never go past 180°.)'] };
  });

  /* ---------------------------------------------------------- reading coordinates */
  G('worldgeo.read-coordinates', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 3 ? R.pick(['format', 'read', 'format']) : 'read';
    if (shape === 'read') {
      var P, n = 0; do { P = readLatLon(R, L); n++; } while (Math.abs(P.la) === Math.abs(P.lo) && n < 20);
      var la = P.la, lo = P.lo, right = coord(la, lo);
      // the trouble spots: longitude first (or the numbers swapped), and a wrong letter
      var swapped = Math.abs(lo) <= 90 ? lat(Math.sign(la) * Math.abs(lo)) + ', ' + lon(Math.sign(lo) * Math.abs(la)) : lon(lo) + ', ' + lat(la);
      var wr = [coord(-la, lo), coord(la, -lo)];
      if (L >= 2) wr.push(coord(la + (la > 0 ? 5 : -5), lo));
      var ch = [right, swapped].concat(R.sample(wr, 2));
      return { q: '<p>What are the coordinates of the point marked <b>?</b></p>', viz: P.viz, a: mc(uniqStr(ch), right), hint: 'Latitude first (left edge, N or S), then longitude (bottom edge, E or W).',
        steps: ['Latitude: the parallel through the point is ' + lat(la) + ' (' + (la > 0 ? 'north' : 'south') + ' of the equator).', 'Longitude: the meridian through the point is ' + lon(lo) + ' (' + (lo > 0 ? 'east' : 'west') + ' of the prime meridian).', 'Latitude first: ' + right + '.'] };
    }
    var la2 = R.pick([5, 15, 25, 35, 45, 55, 65]), lo2 = R.pick([20, 40, 70, 110, 130, 150, 170]), ns = R.coin(), ew = R.coin();
    var right2 = la2 + '° ' + (ns ? 'N' : 'S') + ', ' + lo2 + '° ' + (ew ? 'E' : 'W');
    var ch2 = [right2, lo2 + '° ' + (ew ? 'E' : 'W') + ', ' + la2 + '° ' + (ns ? 'N' : 'S'), la2 + '° ' + (ew ? 'E' : 'W') + ', ' + lo2 + '° ' + (ns ? 'N' : 'S'), la2 + ', ' + lo2];
    return { q: '<p>A place is ' + la2 + '° ' + (ns ? 'north' : 'south') + ' of the equator and ' + lo2 + '° ' + (ew ? 'east' : 'west') + ' of the prime meridian. Which shows its coordinates the way geographers write them?</p>',
      a: mc(ch2, right2), hint: 'Latitude comes first, and every number needs its own letter.',
      steps: ['Latitude (north or south of the equator) comes first: ' + la2 + '° ' + (ns ? 'N' : 'S') + '.', 'Then longitude (east or west of the prime meridian): ' + lo2 + '° ' + (ew ? 'E' : 'W') + '.', 'Writing longitude first, swapping the letters, or leaving them off are all mistakes.'] };
  });

  /* ---------------------------------------------------------- find a place by its coordinates */
  function cityPick(R, n, minGap, filt) {
    var CS = ML.geog.CITIES.filter(function (c) { return Math.abs(c.lat) >= 3 && Math.abs(c.lon) >= 3 && (!filt || filt(c)); }), out = [], tries = 0;
    for (var gap = minGap; gap >= 10 && out.length < n; gap -= 10) {
      out = []; tries = 0;
      while (out.length < n && tries < 400) { tries++; var c = R.pick(CS); if (out.every(function (o) { return o.n !== c.n && Math.abs(o.lat - c.lat) + Math.abs(o.lon - c.lon) >= gap && o.c !== c.c; })) out.push(c); }
    }
    if (out.length < n) throw new Error('cityPick: not enough cities');
    return out;
  }
  G('worldgeo.find-by-coordinates', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? 'map' : L === 2 ? R.pick(['map', 'map', 'name']) : R.pick(['mirror', 'name', 'map']);
    if (shape === 'map') {
      var cs = cityPick(R, L === 1 ? 3 : 4, L === 1 ? 60 : 30), t = R.int(0, cs.length - 1), c = cs[t];
      return { q: '<p>Which letter is at about <b>' + coord(Math.round(c.lat), Math.round(c.lon)) + '</b>?</p>', viz: { name: 'gg-latlon', opts: { cities: cs.map(function (x) { return { n: x.n, lon: x.lon, lat: x.lat }; }), cityMarks: true, quiet: true, interactive: false, step: 60 } },
        a: letters(cs.length, t), hint: 'Go ' + (c.lat > 0 ? 'up' : 'down') + ' from the equator to the latitude, then ' + (c.lon > 0 ? 'right' : 'left') + ' from the prime meridian to the longitude.',
        steps: [lat(Math.round(c.lat)) + ' is ' + (c.lat > 0 ? 'north (up)' : 'south (down)') + ' from the equator.', lon(Math.round(c.lon)) + ' is ' + (c.lon > 0 ? 'east (right)' : 'west (left)') + ' of the prime meridian.', 'The lines meet at letter ' + LET[t] + ': ' + c.n + '.'] };
    }
    if (shape === 'mirror') { // the same numbers with one letter flipped: which city?
      var PAIRS = [['Sydney', 'Los Angeles'], ['Buenos Aires', 'Tokyo'], ['Santiago', 'Los Angeles'], ['Cape Town', 'Sydney'], ['Johannesburg', 'Riyadh'], ['Rio de Janeiro', 'Dubai'], ['Lima', 'Mumbai'], ['Perth', 'Dubai'], ['Jakarta', 'Lagos'], ['Nairobi', 'Singapore']];
      var pr = R.pick(PAIRS), A = ML.geog.city(pr[0]), B = ML.geog.city(pr[1]), tgt = R.coin() ? A : B;
      var far = function (x, y) { return Math.abs(x.lat - y.lat) + Math.abs(x.lon - y.lon) >= 25; }, opts = cityPick(R, 2, 30, function (x) { return x.c !== A.c && x.c !== B.c && far(x, A) && far(x, B); });
      var ch = [A.n, B.n].concat(opts.map(function (x) { return x.n; }));
      return { q: '<p>Which city is at about <b>' + coord(Math.round(tgt.lat), Math.round(tgt.lon)) + '</b>?</p>', viz: { name: 'gg-latlon', opts: { cities: ch.map(function (n) { return ML.geog.city(n); }), quiet: false, interactive: false, step: 60 } },
        a: mc(ch, tgt.n), hint: 'Check both letters: N or S, and E or W. Then find the dot.',
        steps: [lat(Math.round(tgt.lat)) + ' is ' + (tgt.lat > 0 ? 'north' : 'south') + ' of the equator, and ' + lon(Math.round(tgt.lon)) + ' is ' + (tgt.lon > 0 ? 'east' : 'west') + ' of the prime meridian.', 'That point is ' + tgt.n + '.', 'Do not be fooled by a city in another hemisphere with similar numbers.'] };
    }
    var cs2 = cityPick(R, 4, 25), t2 = R.int(0, 3), c2 = cs2[t2];
    return { q: '<p>Which city is at about <b>' + coord(Math.round(c2.lat), Math.round(c2.lon)) + '</b>?</p>', a: mc(cs2.map(function (x) { return x.n; }), c2.n),
      hint: 'First decide the hemispheres from the letters, then the continent.',
      steps: [lat(Math.round(c2.lat)) + ' puts it in the ' + (c2.lat > 0 ? 'Northern' : 'Southern') + ' Hemisphere; ' + lon(Math.round(c2.lon)) + ' in the ' + (c2.lon > 0 ? 'Eastern' : 'Western') + ' Hemisphere.', 'Of the choices, only ' + c2.n + ' is at ' + coord(Math.round(c2.lat), Math.round(c2.lon)) + '.'] };
  });

  /* ---------------------------------------------------------- the tropics and the polar circles */
  var PLACES_ZONE = [ // extra places for zone questions (latitude, rounded)
    ['Tromsø, Norway', 70], ['Murmansk, Russia', 69], ['Utqiagvik, Alaska', 71], ['McMurdo Station, Antarctica', -78], ['Nuuk, Greenland', 64], ['Singapore', 1], ['Bangkok, Thailand', 14], ['Mumbai, India', 19],
    ['Lagos, Nigeria', 6], ['Nairobi, Kenya', -1], ['Lima, Peru', -12], ['Rio de Janeiro, Brazil', -23], ['Cairo, Egypt', 30], ['Rome, Italy', 42], ['Chicago, U.S.', 42], ['Buenos Aires, Argentina', -35],
    ['Sydney, Australia', -34], ['London, England', 52], ['Tokyo, Japan', 36], ['Honolulu, Hawaii', 21], ['Mexico City, Mexico', 19], ['Moscow, Russia', 56], ['Cape Town, South Africa', -34], ['Jakarta, Indonesia', -6]];
  var ZN = { T: 'In the tropics', M: 'In the middle latitudes', P: 'Inside a polar circle' };
  function zoneOf(la) { var a = Math.abs(la); return a < 23.44 ? 'T' : a < 66.56 ? 'M' : 'P'; }
  G('worldgeo.special-parallels', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['line', 'lat']) : L === 2 ? R.pick(['line', 'lat', 'zone']) : R.pick(['zone', 'sun', 'compute', 'line']);
    var LN = ML.geog.LINES, names = ['cancer', 'capricorn', 'arctic', 'antarctic'];
    if (shape === 'line') {
      var k = R.pick(names), lines = L === 1 ? ['equator', k] : ['equator', 'cancer', 'capricorn', 'arctic', 'antarctic'];
      var plon = R.pick([-35, -25, 60, 75, 160]);
      return { q: '<p>Which named parallel is marked with the <b>?</b></p>', viz: { name: 'gg-map', opts: { color: 'plain', lines: lines, lineLabels: false, points: [{ lon: plon, lat: LN[k].lat, mark: '?' }], quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: mc((L === 1 ? R.sample(names.filter(function (x) { return x !== k; }), 2).concat([k]) : names).map(function (x) { return LN[x].n; }), LN[k].n),
        hint: 'Is it north or south of the equator? Is it near the equator or near a pole?',
        steps: ['The marked line is ' + (LN[k].lat > 0 ? 'north' : 'south') + ' of the equator and ' + (Math.abs(LN[k].lat) < 45 ? 'fairly close to it' : 'close to the pole') + '.', 'That is the ' + LN[k].n + ', at about ' + Math.abs(LN[k].lat).toFixed(1) + '° ' + (LN[k].lat > 0 ? 'N' : 'S') + '.'] };
    }
    if (shape === 'lat') {
      var k2 = R.pick(names), v = LN[k2].lat, f = function (x) { return Math.abs(x).toFixed(1) + '° ' + (x > 0 ? 'N' : 'S'); };
      var ch = uniqStr([f(v), f(-v), f(v > 0 ? (Math.abs(v) > 45 ? 23.44 : 66.56) : (Math.abs(v) > 45 ? -23.44 : -66.56)), (v > 0 ? '45.0° N' : '45.0° S')]);
      return { q: '<p>About what is the latitude of the ' + LN[k2].n + '?</p>', a: mc(ch, f(v)), hint: 'The tropics are about 23.4° from the equator; the polar circles about 66.6°. Cancer and the Arctic are north.',
        steps: ['The tropics are about 23.4° from the equator, and the polar circles about 66.6° (that is, 23.4° from the poles).', 'The ' + LN[k2].n + ' is the ' + (v > 0 ? 'northern' : 'southern') + ' one: ' + f(v) + '.'] };
    }
    if (shape === 'zone') {
      var pl, n = 0; do { pl = R.pick(PLACES_ZONE); n++; } while (Math.abs(Math.abs(pl[1]) - 23.44) < 1.2 || Math.abs(Math.abs(pl[1]) - 66.56) < 1.2);
      var z = zoneOf(pl[1]);
      return { q: '<p>' + pl[0] + (pl[0].indexOf(',') > 0 ? ',' : '') + ' is at about ' + lat(pl[1]) + '. Where is it?</p>', a: mc([ZN.T, ZN.M, ZN.P], ZN[z]), hint: 'The tropics reach 23.4° on each side of the equator; the polar circles are at 66.6°.',
        steps: ['The number ' + Math.abs(pl[1]) + '° is ' + (z === 'T' ? 'less than 23.4°' : z === 'M' ? 'between 23.4° and 66.6°' : 'more than 66.6°') + '.', 'So ' + pl[0] + ' is ' + ZN[z].toLowerCase() + '.'] };
    }
    if (shape === 'sun') {
      var ins = PLACES_ZONE.filter(function (p) { return Math.abs(p[1]) < 21; }), outs = PLACES_ZONE.filter(function (p) { return Math.abs(p[1]) > 26; });
      var pick = R.pick(ins), others = R.sample(outs, 2), list = R.shuffle([pick].concat(others));
      var fm = function (p) { return p[0] + ' (' + lat(p[1]) + ')'; };
      return { q: '<p>At which place is the noon Sun straight overhead on at least one day every year?</p>', a: mc(list.map(fm), fm(pick)), hint: 'The noon Sun can be straight overhead only between the Tropic of Cancer and the Tropic of Capricorn.',
        steps: ['The noon Sun is straight overhead somewhere between 23.4° N and 23.4° S, depending on the season.', 'Only ' + pick[0] + ', at ' + lat(pick[1]) + ', is inside the tropics.', 'Places farther from the equator never have the Sun straight overhead.'] };
    }
    var which = R.pick(['arctic', 'antarctic']);
    return { q: '<p>The ' + LN[which].n + ' is at about ' + Math.abs(LN[which].lat).toFixed(1) + '° ' + (which === 'arctic' ? 'N' : 'S') + '. How many degrees of latitude is it from the ' + (which === 'arctic' ? 'North' : 'South') + ' Pole?</p>',
      a: { t: 'num', v: '23.4', tol: 0.15 }, unit: '°', hint: 'The pole is at 90°.',
      steps: ['The pole is at 90°.', '90 − 66.6 = 23.4.', 'That matches Earth\'s tilt, about 23.4°, the same angle that sets the tropics.'] };
  });

  /* ---------------------------------------------------------- coordinates and hemispheres */
  var HEMI = ['Northern and Eastern', 'Northern and Western', 'Southern and Eastern', 'Southern and Western'];
  function hemiOf(la, lo) { return (la > 0 ? 'Northern' : 'Southern') + ' and ' + (lo > 0 ? 'Eastern' : 'Western'); }
  var WEST_SURPRISE = [['London, England', 51.5, -0.1], ['Lisbon, Portugal', 38.7, -9.1], ['Madrid, Spain', 40.4, -3.7], ['Dublin, Ireland', 53.3, -6.3], ['Dakar, Senegal', 14.7, -17.4], ['Accra, Ghana', 5.6, -0.2], ['Reykjavík, Iceland', 64.1, -22.0]];
  var EAST_LIKE = [['Paris, France', 48.9, 2.3], ['Cairo, Egypt', 30.0, 31.2], ['Nairobi, Kenya', -1.3, 36.8], ['Berlin, Germany', 52.5, 13.4], ['Lagos, Nigeria', 6.5, 3.4], ['Rome, Italy', 41.9, 12.5]];
  G('worldgeo.coordinates-hemispheres', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? 'coords' : L === 2 ? R.pick(['city', 'coords', 'reverse']) : R.pick(['west', 'reverse', 'city']);
    if (shape === 'coords') {
      var la = R.sign() * R.int(5, 75), lo = R.sign() * R.int(5, 175), h = hemiOf(la, lo);
      return { q: '<p>A place is at <b>' + coord(la, lo) + '</b>. Which two hemispheres is it in?</p>', a: mc(HEMI.slice(), h), hint: 'N or S tells north or south; E or W tells east or west.',
        steps: ['The latitude letter is ' + (la > 0 ? 'N: Northern' : 'S: Southern') + ' Hemisphere.', 'The longitude letter is ' + (lo > 0 ? 'E: Eastern' : 'W: Western') + ' Hemisphere.'] };
    }
    if (shape === 'city') {
      var pool = ML.geog.CITIES.map(function (c) { return [c.n, r1(c.lat), r1(c.lon)]; }).concat(WEST_SURPRISE).filter(function (p) { return Math.abs(p[1]) > 1 && Math.abs(p[2]) > 0.05; });
      var p = L === 3 && R.coin() ? R.pick(WEST_SURPRISE) : R.pick(pool), la2 = Math.round(p[1]) || p[1], lo2 = Math.abs(p[2]) < 1 ? p[2] : Math.round(p[2]);
      var lostr = Math.abs(lo2) < 1 ? Math.abs(lo2).toFixed(1) + '° ' + (lo2 > 0 ? 'E' : 'W') : lon(lo2);
      return { q: '<p>' + p[0] + ' is at about <b>' + lat(la2) + ', ' + lostr + '</b>. Which two hemispheres is it in?</p>', a: mc(HEMI.slice(), hemiOf(la2, lo2)),
        hint: 'Use the letters, not the continent.', steps: ['Latitude ' + lat(la2) + ': ' + (la2 > 0 ? 'Northern' : 'Southern') + ' Hemisphere.', 'Longitude ' + lostr + ': ' + (lo2 > 0 ? 'Eastern' : 'Western') + ' Hemisphere.', 'So ' + p[0] + ' is in the ' + hemiOf(la2, lo2) + ' Hemispheres.'] };
    }
    if (shape === 'reverse') {
      var h2 = R.pick(HEMI), wantN = h2.indexOf('Northern') === 0, wantE = h2.indexOf('Eastern') > 0, a = R.int(10, 70), b = R.int(10, 170);
      var mk = function (n, e) { return a + '° ' + (n ? 'N' : 'S') + ', ' + b + '° ' + (e ? 'E' : 'W'); };
      var right = mk(wantN, wantE), ch = [mk(true, true), mk(true, false), mk(false, true), mk(false, false)];
      return { q: '<p>A place is in the <b>' + h2 + '</b> Hemispheres. Which could be its coordinates?</p>', a: mc(ch, right), hint: (wantN ? 'Northern means N' : 'Southern means S') + '; ' + (wantE ? 'Eastern means E.' : 'Western means W.'),
        steps: ['The ' + (wantN ? 'Northern' : 'Southern') + ' Hemisphere means the latitude ends in ' + (wantN ? 'N' : 'S') + '.', 'The ' + (wantE ? 'Eastern' : 'Western') + ' Hemisphere means the longitude ends in ' + (wantE ? 'E' : 'W') + '.', 'So: ' + right + '.'] };
    }
    var ws = R.sample(WEST_SURPRISE, R.int(1, 2)), es = R.sample(EAST_LIKE, 4 - ws.length), list = R.shuffle(ws.concat(es));
    var fm = function (p) { return p[0] + ' (' + Math.abs(p[2]).toFixed(1) + '° ' + (p[2] > 0 ? 'E' : 'W') + ')'; };
    return { q: '<p>Which of these places are in the Western Hemisphere? Choose all that are.</p>', a: { t: 'mc', choices: list.map(fm), v: list.map(function (p, i) { return p[2] < 0 ? i : -1; }).filter(function (i) { return i >= 0; }) },
      hint: 'Look only at the longitude letter: W means the Western Hemisphere, even in Europe or Africa.',
      steps: list.map(function (p) { return p[0] + ': ' + Math.abs(p[2]).toFixed(1) + '° ' + (p[2] > 0 ? 'E, Eastern' : 'W, Western') + ' Hemisphere.'; }).concat(['The prime meridian runs through London, so places a little west of it, in Europe and West Africa, are in the Western Hemisphere.']) };
  });

  /* ---------------------------------------------------------- degrees and minutes */
  G('worldgeo.degrees-minutes', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['toDec', 'trap']) : L === 2 ? R.pick(['toDec', 'toMin', 'trap', 'gps']) : R.pick(['toDM', 'gpsNeg', 'gps', 'toDec']);
    var MINS = L === 1 ? [15, 30, 45] : [6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54];
    var d = R.int(10, 75), m = R.pick(MINS), dec = Math.round((d + m / 60) * 1000) / 1000, ns = R.coin() ? 'N' : 'S';
    if (shape === 'toDec') {
      return { q: '<p>Write <b>' + d + '° ' + m + '′ ' + ns + '</b> as a decimal number of degrees.</p>', a: num(dec), unit: '°', hint: 'A degree has 60 minutes, so ' + m + '′ is ' + m + '/60 of a degree.',
        steps: [m + '′ = ' + m + '/60 of a degree = ' + (m / 60) + '°.', d + ' + ' + (m / 60) + ' = ' + dec + '.', 'So ' + d + '° ' + m + '′ ' + ns + ' = ' + dec + '° ' + ns + '.'] };
    }
    if (shape === 'trap') {
      var r3 = function (x) { return String(Math.round(x * 1000) / 1000); }, right = r3(dec);
      var wr = uniqStr([d + '.' + (m < 10 ? '0' + m : m), r3(dec + 0.1), r3(dec - 0.1), r3(d + m / 100 + 0.2)]).filter(function (x) { return x !== right && Number(x) !== dec; }).slice(0, 3);
      return { q: '<p>Which decimal is the same as <b>' + d + '° ' + m + '′</b>?</p>', a: mc([right + '°'].concat(wr.map(function (x) { return x + '°'; })), right + '°'), hint: 'Minutes are sixtieths of a degree, not hundredths.',
        steps: [m + '′ is ' + m + ' out of 60, not ' + m + ' out of 100.', m + ' ÷ 60 = ' + (m / 60) + '.', 'So ' + d + '° ' + m + '′ = ' + right + '°, not ' + d + '.' + (m < 10 ? '0' + m : m) + '°.'] };
    }
    if (shape === 'toMin') {
      var fr = m / 60;
      return { q: '<p>How many minutes (′) are in <b>' + fr + '</b> of a degree?</p>', a: num(m), hint: 'Multiply the decimal by 60.', steps: [fr + ' × 60 = ' + m + '.', 'So ' + fr + '° = ' + m + '′.'] };
    }
    if (shape === 'toDM') {
      return { q: '<p>Write <b>' + dec + '° ' + ns + '</b> in degrees and minutes.</p>', a: { t: 'multi', parts: [{ label: 'Degrees (°)', a: num(d) }, { label: 'Minutes (′)', a: num(m) }] },
        hint: 'Keep the whole degrees; multiply the decimal part by 60 to get minutes.', steps: ['Whole degrees: ' + d + '°.', 'Decimal part: ' + String(Math.round((dec - d) * 1000) / 1000) + ' × 60 = ' + m + '.', 'So ' + dec + '° ' + ns + ' = ' + d + '° ' + m + '′ ' + ns + '.'] };
    }
    var la = R.int(1, 70) + R.pick([0, 0.2, 0.5, 0.8]), lo = R.int(1, 170) + R.pick([0, 0.3, 0.6]), sla = R.sign(), slo = R.sign();
    var gla = r1(la * sla), glo = r1(lo * slo), right2 = Math.abs(gla) + '° ' + (gla > 0 ? 'N' : 'S') + ', ' + Math.abs(glo) + '° ' + (glo > 0 ? 'E' : 'W');
    if (shape === 'gpsNeg') {
      var dd = R.int(10, 60), mm = R.pick([12, 15, 30, 45, 48]), w = R.coin(), v = -Math.round((dd + mm / 60) * 1000) / 1000;
      return { q: '<p>GPS apps write south and west as negative numbers. A place is at <b>' + dd + '° ' + mm + '′ ' + (w ? 'W' : 'S') + '</b>. What number would a GPS app show for this ' + (w ? 'longitude' : 'latitude') + '?</p>',
        a: num(v), hint: 'Change the minutes to a decimal, then make the number negative for ' + (w ? 'W' : 'S') + '.',
        steps: [mm + '′ = ' + mm + ' ÷ 60 = ' + (mm / 60) + '°.', dd + ' + ' + (mm / 60) + ' = ' + (-v) + '.', (w ? 'West' : 'South') + ' is negative: ' + v + '.'] };
    }
    var ch = uniqStr([right2, Math.abs(gla) + '° ' + (gla > 0 ? 'S' : 'N') + ', ' + Math.abs(glo) + '° ' + (glo > 0 ? 'W' : 'E'), Math.abs(glo) + '° ' + (glo > 0 ? 'N' : 'S') + ', ' + Math.abs(gla) + '° ' + (gla > 0 ? 'E' : 'W'), Math.abs(gla) + '° ' + (gla > 0 ? 'N' : 'S') + ', ' + Math.abs(glo) + '° ' + (glo > 0 ? 'W' : 'E')]);
    return { q: '<p>A phone shows a place at <b>' + gla + ', ' + glo + '</b> (latitude, longitude). Which is the same place?</p>', a: mc(ch, right2), hint: 'A minus sign means south (for latitude) or west (for longitude).',
      steps: ['The first number is the latitude: ' + gla + (gla < 0 ? ' is negative, so south: ' : ' is positive, so north: ') + Math.abs(gla) + '° ' + (gla > 0 ? 'N' : 'S') + '.', 'The second is the longitude: ' + glo + (glo < 0 ? ' is negative, so west: ' : ' is positive, so east: ') + Math.abs(glo) + '° ' + (glo > 0 ? 'E' : 'W') + '.'] };
  });

  /* ---------------------------------------------------------- how far is a degree? */
  var LON_KM = { 0: 111, 20: 104, 40: 85, 60: 56, 80: 19 };
  G('worldgeo.degree-distance', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['lat', 'lat', 'concept']) : L === 2 ? R.pick(['lat', 'lon', 'minutes', 'concept']) : R.pick(['lon', 'reverse', 'compare', 'minutes']);
    if (shape === 'lat') {
      var d = L === 1 ? R.int(2, 9) : R.int(3, 25), a, b, n0 = 0;
      do { a = R.int(-40, 50); b = a + d; n0++; } while ((a === 0 || b === 0 || (L === 1 && a < 0 && b > 0)) && n0 < 50);
      var km = d * 111, fl = function (x) { return x === 0 ? '0° (the equator)' : lat(x); };
      var how = a < 0 && b > 0 ? 'One is south and one is north of the equator, so add: ' + (-a) + ' + ' + b + ' = ' + d + ' degrees.'
        : 'Both are ' + (b > 0 ? 'north' : 'south') + ' of the equator, so subtract: ' + Math.max(Math.abs(a), Math.abs(b)) + ' − ' + Math.min(Math.abs(a), Math.abs(b)) + ' = ' + d + ' degrees.';
      return { q: '<p>Two towns are on the same meridian, one at ' + fl(a) + ' and the other at ' + fl(b) + '. About how far apart are they? Use 111 km for one degree of latitude.</p>',
        a: num(km, 0.02), unit: 'km', hint: 'Find how many degrees of latitude apart they are, then multiply by 111 km.',
        steps: [how, d + ' × 111 km = ' + fmtN(km) + ' km.'] };
    }
    if (shape === 'lon') {
      var at = R.pick(L === 2 ? [0, 60] : [20, 40, 60, 80]), dd = R.int(2, 8), per = LON_KM[at], km2 = dd * per;
      return { q: '<p>Two towns are both at ' + (at === 0 ? 'the equator' : at + '° N') + ', ' + dd + '° of longitude apart. At this latitude, one degree of longitude is about ' + per + ' km. About how far apart are the towns?</p>',
        a: num(km2, 0.02), unit: 'km', hint: 'Multiply the degrees of longitude by the length of one degree at this latitude.',
        steps: ['At ' + (at === 0 ? 'the equator' : at + '° N') + ', 1° of longitude ≈ ' + per + ' km.', dd + ' × ' + per + ' = ' + fmtN(km2) + ' km.'].concat(at ? ['At the equator the same ' + dd + '° would be ' + fmtN(dd * 111) + ' km: meridians get closer toward the poles.'] : []) };
    }
    if (shape === 'minutes') {
      var mins = R.pick([10, 15, 20, 30, 40, 45]), kmm = r1(mins * 1.85);
      return { q: '<p>One minute of latitude is about 1.85 km (one nautical mile). About how far north must you travel to go ' + mins + '′ of latitude?</p>', a: num(kmm, 0.02), unit: 'km',
        hint: 'Multiply the minutes by 1.85 km.', steps: [mins + ' × 1.85 = ' + kmm + ' km.', 'Check: ' + mins + '′ is ' + mins + '/60 of a degree, and 111 × ' + mins + ' ÷ 60 ≈ ' + r1(mins / 60 * 111) + ' km.'] };
    }
    if (shape === 'reverse') {
      var deg = R.int(2, 12), dist = deg * 111;
      return { q: '<p>Two cities on the same meridian are about ' + fmtN(dist) + ' km apart. How many degrees of latitude apart are they?</p>', a: num(deg, 0.02), unit: '°', hint: 'Divide by 111 km per degree.',
        steps: [fmtN(dist) + ' ÷ 111 = ' + deg + '.', 'They are about ' + deg + '° of latitude apart.'] };
    }
    if (shape === 'compare') {
      var at3 = R.pick([40, 60, 80]);
      return { q: '<p>At ' + at3 + '° N, which is longer: one degree of latitude or one degree of longitude?</p>', a: mc(['One degree of latitude', 'One degree of longitude', 'They are the same'], 'One degree of latitude'),
        hint: 'Which lines come together toward the poles?', steps: ['A degree of latitude is about 111 km everywhere.', 'A degree of longitude shrinks away from the equator: at ' + at3 + '° it is about ' + LON_KM[at3] + ' km.', 'So the degree of latitude is longer.'] };
    }
    var c = R.pick([['Where is one degree of longitude the longest?', 'At the equator', ['At 45° N', 'At 60° S', 'Near the North Pole']], ['Where is one degree of longitude the shortest?', 'Near the poles', ['At the equator', 'At the Tropic of Cancer', 'It is the same everywhere']],
      ['About how long is one degree of latitude?', 'About 111 km', ['About 11 km', 'About 1,111 km', 'It depends on the longitude']]]);
    return { q: '<p>' + c[0] + '</p>', a: mc([c[1]].concat(c[2]), c[1]), hint: 'Meridians are far apart at the equator and meet at the poles; parallels are evenly spaced.',
      steps: ['Parallels are evenly spaced, so a degree of latitude is about 111 km everywhere.', 'Meridians meet at the poles, so a degree of longitude is 111 km at the equator and shrinks to 0 at the poles.'] };
  });

  /* ================================================================== unit 2: maps and projections */
  var PNAME = { mercator: 'Mercator', gallpeters: 'Gall-Peters', mollweide: 'Mollweide', equalearth: 'Equal Earth', robinson: 'Robinson', winkel: 'Winkel tripel' };
  var PCLASS = { mercator: 'shape', gallpeters: 'area', mollweide: 'area', equalearth: 'area', robinson: 'comp', winkel: 'comp' };
  var FLAT_BANK = [
    ['Every flat map of the whole world stretches or squeezes something.', true, 'A curved surface cannot be flattened without stretching or tearing.'],
    ['A globe shows sizes and shapes more truly than any flat world map.', true, 'A globe has the same curved shape as Earth, so it needs no stretching.'],
    ['A map projection is a way of moving the globe\'s grid onto a flat surface.', true, 'Each projection is one method, with its own trade-offs.'],
    ['Mapmakers choose a projection by deciding what the map must keep true.', true, 'Size, shape, distance or direction: no map keeps them all.'],
    ['One flat world map is correct, and all the others are wrong.', false, 'Every flat map is a trade-off; the right one depends on the job.'],
    ['A flat world map can keep every size, shape and distance true at once.', false, 'That is impossible; Euler proved in 1775 that no flat map keeps every distance true.'],
    ['Countries look the same size on every world map.', false, 'Different projections stretch different places.'],
    ['Greenland really is about as big as Africa.', false, 'Africa is about 14 times bigger; Mercator maps make Greenland look huge.']];
  G('worldgeo.flat-maps', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['tf', 'compare', 'what']) : L === 2 ? R.pick(['compare', 'tf', 'what']) : R.pick(['all', 'compare']);
    if (shape === 'compare') {
      var other = R.pick(['equalearth', 'mollweide', 'gallpeters']), list = R.shuffle(['mercator', other]), mi = list.indexOf('mercator');
      var big = R.pick([['GRL', 'Greenland'], ['RUS', 'Russia'], ['CAN', 'Canada']]);
      return { q: '<p>Maps A and B show the same world on two different projections. On which map does ' + big[1] + ' look biggest compared with Africa?</p>',
        viz: { name: 'gg-projection', opts: { compare: list, highlight: [big[0], 'AF'], quiet: true, interactive: false } }, a: letters(2, mi),
        hint: 'Compare the two orange areas on each map. Which map stretches lands far from the equator?',
        steps: ['On map ' + LET[mi] + ', ' + big[1] + ' looks much bigger next to Africa than on map ' + LET[1 - mi] + '.', 'Map ' + LET[mi] + ' is a Mercator map: it enlarges places far from the equator.', 'Map ' + LET[1 - mi] + ' (' + PNAME[other] + ') keeps areas true.'] };
    }
    if (shape === 'what') {
      var it = R.pick([['Why does every flat world map distort something?', 'You cannot flatten a curved surface without stretching or tearing it', ['Mapmakers are careless', 'Earth\'s continents keep changing size', 'Paper is too small to show the whole world']],
        ['What does a flat world map have to give up?', 'Some of the truth about sizes, shapes, distances or directions', ['Nothing, if it is drawn carefully', 'Only the colors', 'Only the names of the oceans']],
        ['Which shows the sizes of countries most truly?', 'A globe', ['A Mercator world map', 'Any flat world map', 'A road atlas']]]);
      return { q: '<p>' + it[0] + '</p>', a: mc([it[1]].concat(it[2]), it[1]), hint: 'Think about peeling an orange and pressing the peel flat.', steps: ['Earth is curved in every direction, like a ball.', 'A flat sheet cannot match it everywhere, so a flat map must stretch or squeeze some places.', 'Answer: ' + it[1] + '.'] };
    }
    if (shape === 'tf') return tfItem(R, FLAT_BANK, 'No flat map is free of distortion.');
    return chooseAll(R, FLAT_BANK, 4, 'No flat map is free of distortion; a globe is the truest picture.');
  });

  /* ---------------------------------------------------------- Mercator */
  var MERC_PAIRS = [ // [looks bigger on Mercator, really bigger, its area, the other's area (million km²)]
    ['Greenland', 'Africa', 2.17, 30.3], ['Greenland', 'South America', 2.17, 17.8], ['Greenland', 'Australia', 2.17, 7.7], ['Russia', 'Africa', 17.1, 30.3],
    ['Antarctica', 'South America', 14.0, 17.8], ['Greenland', 'India', 2.17, 3.29], ['Alaska', 'Mexico', 1.72, 1.96], ['Scandinavia (Norway, Sweden and Finland)', 'India', 1.18, 3.29]];
  var MERC_BANK = [
    ['On a Mercator map, a straight line is a steady compass course.', true, 'Mercator keeps angles true, which is why sailors used it.'],
    ['A Mercator map keeps the shapes of small areas true.', true, 'It keeps angles, so small shapes look right.'],
    ['A Mercator map makes lands near the poles look too big.', true, 'Areas grow more and more toward the poles.'],
    ['A Mercator map shows Greenland and Africa at their true sizes.', false, 'Greenland looks about as big as Africa, but Africa is about 14 times bigger.'],
    ['A Mercator map is the best choice for comparing the sizes of countries.', false, 'For sizes, use an equal-area map.'],
    ['A Mercator map can show the North Pole.', false, 'The poles would be infinitely far away, so the map stops before them.'],
    ['Mercator made his map in 1569 to help sailors.', true, 'Gerardus Mercator published it in 1569 for navigation.'],
    ['On a Mercator map, places near the equator are stretched the most.', false, 'Places near the equator are stretched least; the stretching grows toward the poles.']];
  G('worldgeo.mercator', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['bigger', 'tf', 'use']) : L === 2 ? R.pick(['bigger', 'where', 'ratio', 'tf']) : R.pick(['ratio', 'where', 'factor']);
    if (shape === 'bigger') {
      var pr = R.pick(MERC_PAIRS);
      return { q: '<p>On a Mercator map, ' + pr[0] + ' looks bigger than ' + pr[1] + ', or about the same. Which is bigger in real life?</p>', a: mc([pr[0], pr[1], 'They are the same size'], pr[1]),
        hint: 'Mercator enlarges lands far from the equator.', steps: [pr[0] + ' is about ' + pr[2] + ' million km²; ' + pr[1] + ' is about ' + pr[3] + ' million km².', pr[0] + ' is farther from the equator, where Mercator enlarges areas most.', 'In real life ' + pr[1] + ' is bigger.'] };
    }
    if (shape === 'use') {
      var u = R.pick([['What was the Mercator map made for?', 'Steering ships by compass', ['Comparing the sizes of countries', 'Showing time zones', 'Measuring the heights of mountains']],
        ['What does a Mercator map keep true?', 'Angles and directions, and the shapes of small areas', ['The sizes of all countries', 'Every distance', 'Nothing at all']]]);
      return { q: '<p>' + u[0] + '</p>', a: mc([u[1]].concat(u[2]), u[1]), hint: 'Mercator was a mapmaker in 1569, when long sea voyages were growing.', steps: ['Mercator keeps angles true, so a straight line on it is one steady compass direction.', 'That made it ideal for steering ships, but it enlarges lands near the poles.'] };
    }
    if (shape === 'tf') return tfItem(R, MERC_BANK, 'Mercator keeps angles and small shapes; it enlarges areas toward the poles.');
    if (shape === 'where') {
      var C = ML.geog.C.filter(function (c) { return c.km2 > 150000 && Math.abs(c.ly) < 72; }), pick = [], n = 0;
      while (pick.length < 3 && n < 500) { n++; var c = R.pick(C); if (pick.every(function (p) { return Math.abs(Math.abs(p.ly) - Math.abs(c.ly)) >= 15 && Math.abs(p.lx - c.lx) >= 12; })) pick.push(c); }
      var far = pick.slice().sort(function (a, b) { return Math.abs(b.ly) - Math.abs(a.ly); })[0], mark = {}; pick.forEach(function (p, i) { mark[p.id] = LET[i]; });
      return { q: '<p>This is a Mercator map. Which lettered country does it enlarge the most, compared with its true size?</p>', viz: { name: 'gg-map', opts: { proj: 'mercator', color: 'plain', mark: mark, highlight: pick.map(function (p) { return p.id; }), quiet: true, interactive: false, disputedNote: false } },
        a: letters(3, pick.indexOf(far)), hint: 'Which lettered country is farthest from the equator, north or south?',
        steps: ['Mercator enlarges areas more and more the farther they are from the equator.', pick.map(function (p, i) { return LET[i] + ' is at about ' + lat(Math.round(p.ly)); }).join('; ') + '.', LET[pick.indexOf(far)] + ' (' + far.n + ') is farthest from the equator, so it is enlarged the most.'] };
    }
    if (shape === 'ratio') {
      var p2 = R.pick(MERC_PAIRS.filter(function (x) { return x[3] / x[2] >= 2; })), rat = Math.round(p2[3] / p2[2] * 10) / 10;
      return { q: '<p>' + p2[0] + ' covers about ' + p2[2] + ' million km², and ' + p2[1] + ' about ' + p2[3] + ' million km². How many times bigger is ' + p2[1] + '? Round to one decimal place.</p>',
        a: num(rat, 0.03), hint: 'Divide the bigger area by the smaller one.', steps: [p2[3] + ' ÷ ' + p2[2] + ' ≈ ' + rat + '.', p2[1] + ' is about ' + rat + ' times bigger, even if a Mercator map makes them look closer in size.'] };
    }
    var row = R.pick([[45, 2], [60, 4], [70, 8.5]]), area = R.pick([100, 200, 300, 400, 500]) * 1000;
    return { q: '<p>On a Mercator map, areas at ' + row[0] + '° look about ' + row[1] + ' times too big. A country at ' + row[0] + '° N covers ' + fmtN(area) + ' km². On the map it looks as big as a country of how many km² on the equator?</p>',
      a: num(area * row[1], 0.02), unit: 'km²', hint: 'Multiply the true area by how many times Mercator enlarges it there.',
      steps: ['At ' + row[0] + '°, Mercator enlarges areas about ' + row[1] + ' times.', fmtN(area) + ' × ' + row[1] + ' = ' + fmtN(area * row[1]) + ' km².'] };
  });

  /* ---------------------------------------------------------- equal-area maps */
  var EQ_BANK = [
    ['An equal-area map shows every country at its true size compared with the others.', true, 'That is what equal-area means.'],
    ['An equal-area map keeps shapes true everywhere.', false, 'It keeps areas but bends shapes, especially near the edges.'],
    ['Gall-Peters, Mollweide and Equal Earth are equal-area projections.', true, 'All three keep areas in true proportion.'],
    ['Mercator is an equal-area projection.', false, 'Mercator keeps angles and shapes; it enlarges areas toward the poles.'],
    ['An equal-area map has no distortion at all.', false, 'No flat map is free of distortion; equal-area maps bend shapes.'],
    ['To compare how much land different countries have, an equal-area map is a good choice.', true, 'Sizes on it can be compared fairly.'],
    ['On a Gall-Peters map, lands near the equator look tall and thin.', true, 'Gall-Peters stretches lands north-south near the equator.'],
    ['The Equal Earth projection was made in 2018.', true, 'Šavrič, Patterson and Jenny published it in 2018.']];
  G('worldgeo.equal-area', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['pick', 'tf', 'which']) : L === 2 ? R.pick(['which', 'tf', 'classify', 'pick']) : R.pick(['ratio', 'classify', 'which']);
    if (shape === 'pick') {
      var job = R.pick(['compare how much land each country has', 'show where the world\'s forests are, fairly by size', 'compare the sizes of the continents', 'show which countries grow the most wheat by area of farmland']);
      var right = R.pick(['Equal Earth', 'Mollweide', 'Gall-Peters']);
      return { q: '<p>You want a world map to ' + job + '. Which projection should you use?</p>', a: mc([right, 'Mercator', 'Robinson', 'Winkel tripel'], right), hint: 'Which kind of map keeps every area in true proportion?',
        steps: ['The job compares sizes, so areas must be fair.', right + ' is an equal-area projection.', 'Mercator enlarges the north; Robinson and Winkel tripel are compromises that do not keep areas exactly.'] };
    }
    if (shape === 'which') {
      var eq = R.pick(['gallpeters', 'mollweide', 'equalearth']), list = R.shuffle(['mercator', eq]), ei = list.indexOf(eq);
      return { q: '<p>One of these maps is an equal-area map. Which one?</p>', viz: { name: 'gg-projection', opts: { compare: list, highlight: ['GRL', 'AF'], quiet: true, interactive: false } }, a: letters(2, ei),
        hint: 'On a true-size map, Greenland (orange, far north) is much smaller than Africa.', steps: ['On map ' + LET[ei] + ', Greenland is small next to Africa, as it really is (Africa is about 14 times bigger).', 'Map ' + LET[1 - ei] + ' is a Mercator map, which blows up Greenland.', 'So map ' + LET[ei] + ' (' + PNAME[eq] + ') is equal-area.'] };
    }
    if (shape === 'classify') {
      var k = R.pick(Object.keys(PNAME)), isEq = PCLASS[k] === 'area';
      return { q: '<p>True or false? The ' + PNAME[k] + ' projection is an equal-area projection.</p>', a: { t: 'tf', v: isEq }, hint: 'Equal-area: Gall-Peters, Mollweide, Equal Earth.',
        steps: [isEq ? 'True. ' + PNAME[k] + ' keeps every area in true proportion, and bends shapes to do it.' : 'False. ' + PNAME[k] + (k === 'mercator' ? ' keeps angles and shapes and enlarges areas toward the poles.' : ' is a compromise: it keeps nothing exactly.')] };
    }
    if (shape === 'tf') return tfItem(R, EQ_BANK, 'Equal-area maps keep sizes and bend shapes.');
    var C = ML.geog.C.filter(function (c) { return c.km2 > 300000; }), a, b, n = 0;
    do { a = R.pick(C); b = R.pick(C); n++; } while ((a === b || a.km2 / b.km2 < 1.5 || a.km2 / b.km2 > 12) && n < 300);
    var A = Math.round(a.km2 / 1e5) / 10, B = Math.round(b.km2 / 1e5) / 10, rat = Math.round(A / B * 10) / 10;
    return { q: '<p>On an equal-area map, ' + a.n + ' (about ' + A + ' million km²) and ' + b.n + ' (about ' + B + ' million km²) are drawn in true proportion. About how many times as much map does ' + a.n + ' cover as ' + b.n + '? Round to one decimal place.</p>',
      a: num(rat, 0.04), hint: 'On an equal-area map, map area is in proportion to real area, so divide.', steps: ['On an equal-area map, the ratio of map areas equals the ratio of real areas.', A + ' ÷ ' + B + ' ≈ ' + rat + '.'] };
  });

  /* ---------------------------------------------------------- compromise maps */
  var JOBS = [['steer a ship across the ocean by compass', 'Mercator'], ['plan a sailing route with steady compass headings', 'Mercator'], ['compare the sizes of countries fairly', 'An equal-area map'],
    ['show how much of each continent is desert', 'An equal-area map'], ['hang one world map on a classroom wall for a fair overall picture', 'A compromise map, such as Winkel tripel'], ['print a general world map in an atlas', 'A compromise map, such as Winkel tripel']];
  var COMP_BANK = [
    ['A compromise projection keeps nothing perfectly but keeps every error small.', true, 'That is the idea of a compromise.'],
    ['Robinson and Winkel tripel are compromise projections.', true, 'Both balance errors in area, shape and distance.'],
    ['Arthur Robinson designed his projection in 1963.', true, 'He made it for the atlas maker Rand McNally.'],
    ['The National Geographic Society switched to the Winkel tripel for its world maps in 1998.', true, 'It replaced the Robinson projection, used since 1988.'],
    ['A compromise map keeps every area exactly true.', false, 'Only equal-area maps do that.'],
    ['A compromise map is best for steering by compass.', false, 'Mercator is best for that: its straight lines are steady compass courses.'],
    ['Over a small area, like one city, every projection is nearly true.', true, 'Distortion matters most for large areas such as the whole world.']];
  G('worldgeo.compromise-projections', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['job', 'tf']) : L === 2 ? R.pick(['job', 'sort', 'tf']) : R.pick(['sort', 'all', 'job']);
    var CH = ['Mercator', 'An equal-area map', 'A compromise map, such as Winkel tripel'];
    if (shape === 'job') {
      var j = R.pick(JOBS);
      return { q: '<p>Which kind of map is best if you want to ' + j[0] + '?</p>', a: mc(CH.slice(), j[1]), hint: 'Navigation: Mercator. Sizes: equal-area. A general picture: a compromise.',
        steps: [j[1] === 'Mercator' ? 'Steering by compass needs true directions, which Mercator keeps.' : j[1] === 'An equal-area map' ? 'Comparing amounts of land needs true sizes, which an equal-area map keeps.' : 'A general world map should look like the globe overall, with small errors everywhere: a compromise.', 'Answer: ' + (j[1] === 'Mercator' ? j[1] : j[1].charAt(0).toLowerCase() + j[1].slice(1)) + '.'] };
    }
    if (shape === 'sort') {
      var k = R.pick(Object.keys(PNAME)), cls = PCLASS[k], K = { shape: 'It keeps shapes (angles); areas grow toward the poles', area: 'It keeps areas; shapes bend', comp: 'It keeps nothing exactly but keeps errors small' };
      return { q: '<p>What does the ' + PNAME[k] + ' projection keep true?</p>', a: mc([K.shape, K.area, K.comp], K[cls]), hint: 'Mercator keeps shapes; Gall-Peters, Mollweide and Equal Earth keep areas; Robinson and Winkel tripel are compromises.',
        steps: [PNAME[k] + ' is ' + (cls === 'shape' ? 'the classic conformal (shape-keeping) map.' : cls === 'area' ? 'an equal-area projection.' : 'a compromise projection.'), 'So: ' + K[cls].charAt(0).toLowerCase() + K[cls].slice(1) + '.'] };
    }
    if (shape === 'tf') return tfItem(R, COMP_BANK, 'A compromise keeps every error small but nothing exact.');
    return chooseAll(R, COMP_BANK, 4, 'Robinson and Winkel tripel are compromises; Mercator is for navigation.');
  });

  /* ---------------------------------------------------------- Tissot circles */
  var TIS = { shape: 'Shapes: the circles stay round, but areas grow toward the poles', area: 'Areas: the circles turn into ovals, but keep the same area', comp: 'Neither exactly: the circles change a little in both size and shape' };
  var TIS_BANK = [
    ['On the globe, every Tissot circle is the same size.', true, 'That is what makes them a fair test of a map.'],
    ['If the circles on a map stay round, the map keeps shapes in small areas.', true, 'Round circles mean no stretching in one direction more than another.'],
    ['If the circles on a map all cover the same area, the map is equal-area.', true, 'Same area everywhere means sizes are kept.'],
    ['On a Mercator map, the circles near the poles are much bigger than those at the equator.', true, 'Mercator enlarges areas toward the poles.'],
    ['On an equal-area map, the circles all stay perfectly round.', false, 'They turn into ovals: equal-area maps bend shapes.'],
    ['Circles that turn into ovals show that a map bends shapes there.', true, 'An oval means more stretch in one direction than the other.'],
    ['On a Mercator map, the circles turn into flat ovals near the poles.', false, 'On Mercator they stay round; they only grow.'],
    ['Tissot circles let you judge distortion without knowing the true shapes of countries.', true, 'You only need to compare the circles with each other.']];
  G('worldgeo.tissot', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['read', 'describe', 'tf']) : L === 2 ? R.pick(['read', 'describe', 'which', 'tf', 'num']) : R.pick(['read', 'num', 'which', 'all']);
    if (shape === 'tf') return tfItem(R, TIS_BANK, 'Round circles: shapes kept. Same area: areas kept.');
    if (shape === 'all') return chooseAll(R, TIS_BANK, 4, 'Round circles: shapes kept. Same area: areas kept.');
    if (shape === 'read') {
      var k = L === 1 ? R.pick(['mercator', 'gallpeters', 'mercator', 'mollweide']) : R.pick(Object.keys(PNAME)), cls = PCLASS[k];
      return { q: '<p>All the circles on this map are the same size on the globe. What does this map keep true?</p>', viz: { name: 'gg-projection', opts: { proj: k, tissot: true, quiet: true, interactive: false } },
        a: mc([TIS.shape, TIS.area, TIS.comp], TIS[cls]), hint: 'Compare circles near the equator with circles near the poles: do they grow, turn into ovals, or both a little?',
        steps: [cls === 'shape' ? 'The circles stay round but get much bigger toward the poles.' : cls === 'area' ? 'Near the poles the circles are squashed into ovals, but each covers the same area.' : 'The circles grow a little and squash a little toward the poles.', 'This is the ' + PNAME[k] + ' projection: ' + (cls === 'shape' ? 'it keeps shapes.' : cls === 'area' ? 'it keeps areas.' : 'a compromise.')] };
    }
    if (shape === 'describe') {
      var d = R.pick([['round, but much bigger near the poles', 'shape'], ['squashed into ovals near the poles, but each covers the same area', 'area'], ['a little bigger and a little squashed near the poles', 'comp']]);
      var AN = { shape: 'A Mercator map: it keeps shapes', area: 'An equal-area map: it keeps areas', comp: 'A compromise map: it keeps neither exactly' };
      return { q: '<p>On a world map, same-size circles from the globe come out ' + d[0] + '. What kind of map is it?</p>', a: mc([AN.shape, AN.area, AN.comp], AN[d[1]]), hint: 'Round circles mean shapes are kept; same-area circles mean areas are kept.',
        steps: ['Round circles: shapes kept. Same area: areas kept.', 'Here the circles are ' + d[0] + '.', 'So it is ' + AN[d[1]].charAt(0).toLowerCase() + AN[d[1]].slice(1) + '.'] };
    }
    if (shape === 'which') {
      var two = R.shuffle(['mercator', R.pick(['gallpeters', 'mollweide', 'equalearth'])]), want = R.pick(['shape', 'area']), wi = two.map(function (x) { return PCLASS[x]; }).indexOf(want);
      return { q: '<p>Which map keeps <b>' + (want === 'shape' ? 'shapes' : 'areas') + '</b> true? Look at the circles.</p>', viz: { name: 'gg-projection', opts: { compare: two, tissot: true, quiet: true, interactive: false } }, a: letters(2, wi),
        hint: want === 'shape' ? 'Shapes are kept where the circles stay round.' : 'Areas are kept where the circles keep the same area, even if they become ovals.',
        steps: ['On map ' + LET[two.indexOf('mercator')] + ' the circles stay round but grow toward the poles: shapes kept.', 'On map ' + LET[1 - two.indexOf('mercator')] + ' the circles become ovals of the same area: areas kept.', 'So the answer is map ' + LET[wi] + '.'] };
    }
    var f = R.pick([1.5, 2, 2.5, 3, 4, 5]);
    return { q: '<p>On a Mercator map, the circles near one latitude are still round but ' + f + ' times as wide as the circles at the equator. How many times too big do areas look there?</p>', a: num(f * f, 0.01),
      hint: 'A circle that is ' + f + ' times as wide is also ' + f + ' times as tall.', steps: ['Mercator stretches lengths the same in every direction, so width and height both grow ' + f + ' times.', 'Area grows ' + f + ' × ' + f + ' = ' + (f * f) + ' times.'] };
  });

  /* ---------------------------------------------------------- map scale */
  var SCALES = [10000, 20000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000];
  G('worldgeo.map-scale', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['verbal', 'toGround']) : L === 2 ? R.pick(['toGround', 'toMap', 'largeSmall']) : R.pick(['toMap', 'inch', 'largeSmall', 'toGround']);
    if (shape === 'verbal') {
      var per = R.pick([2, 5, 10, 20, 50]), d = R.int(2, 9);
      return { q: '<p>On a map, 1 cm stands for ' + per + ' km. Two towns are ' + d + ' cm apart on the map. How far apart are they in real life?</p>', a: num(d * per), unit: 'km', hint: 'Each centimeter is ' + per + ' km.', steps: [d + ' × ' + per + ' = ' + (d * per) + ' km.'] };
    }
    if (shape === 'toGround') {
      var S = R.pick(L === 1 ? [100000, 1000000, 50000] : SCALES), d2 = L === 1 ? R.int(2, 9) : R.pick([1.5, 2, 2.5, 3, 4, 4.5, 6, 7, 8, 12]), cm = d2 * S, km = cm / 100000;
      return { q: '<p>A map has a scale of 1:' + fmtN(S) + '. A road is ' + d2 + ' cm long on the map. How long is the real road, in kilometers?</p>', a: num(+km.toFixed(4), 0.005), unit: 'km',
        hint: 'Multiply by ' + fmtN(S) + ' to get centimeters, then divide by 100,000 to get kilometers.',
        steps: [d2 + ' cm × ' + fmtN(S) + ' = ' + fmtN(Math.round(cm)) + ' cm on the ground.', '100,000 cm = 1 km, so ' + fmtN(Math.round(cm)) + ' ÷ 100,000 = ' + +km.toFixed(4) + ' km.'] };
    }
    if (shape === 'toMap') {
      var S2 = R.pick([100000, 200000, 250000, 500000, 1000000]), kmPerCm = S2 / 100000, cms = R.pick([2, 3, 4, 5, 6, 8, 10, 12]), ground = cms * kmPerCm;
      return { q: '<p>Two lakes are ' + fmtN(ground) + ' km apart. How far apart are they on a map with a scale of 1:' + fmtN(S2) + '?</p>', a: num(cms, 0.005), unit: 'cm',
        hint: 'First find how many kilometers 1 cm stands for.', steps: ['1 cm on the map = ' + fmtN(S2) + ' cm = ' + kmPerCm + ' km.', fmtN(ground) + ' ÷ ' + kmPerCm + ' = ' + cms + ' cm.'] };
    }
    if (shape === 'inch') {
      var mi = R.int(2, 9);
      return { q: '<p>Many U.S. maps use a scale of 1:63,360. There are 63,360 inches in a mile. On such a map, two towns are ' + mi + ' inches apart. How many miles apart are they?</p>', a: num(mi), unit: 'miles',
        hint: 'What does 1 inch on this map stand for?', steps: ['1 inch on the map = 63,360 inches = 1 mile.', 'So ' + mi + ' inches = ' + mi + ' miles.'] };
    }
    var three = R.sample([10000, 50000, 250000, 1000000, 10000000], 3), want = R.pick(['detail', 'area']);
    var sorted = three.slice().sort(function (a, b) { return a - b; }), right = want === 'detail' ? sorted[0] : sorted[2];
    return { q: '<p>Which map ' + (want === 'detail' ? 'is the largest scale and shows the most detail' : 'shows the largest area of land') + '?</p>', a: mc(three.map(function (s) { return '1:' + fmtN(s); }), '1:' + fmtN(right)),
      hint: 'Think of the scale as a fraction: 1/10,000 is bigger than 1/1,000,000.',
      steps: ['A scale is a fraction: the smaller the second number, the larger the scale.', 'Large scale = things drawn bigger = a small area in great detail. Small scale = a large area with little detail.', 'So the answer is 1:' + fmtN(right) + '.'] };
  });

  /* ---------------------------------------------------------- kinds of maps */
  var KINDS = { political: 'A political map', physical: 'A physical map', thematic: 'A thematic map' };
  var KDESC = [['shows the borders of countries and their capital cities', 'political'], ['shows mountains, rivers and deserts in shaded colors', 'physical'], ['shades each country by how much rain falls there', 'thematic'],
    ['shows the states of the U.S. and their capitals', 'political'], ['shows where earthquakes happened, as dots', 'thematic'], ['shows the heights of the land with colors from green to brown', 'physical'],
    ['shows which language most people speak in each country', 'thematic'], ['shows the countries of Europe, each in its own color', 'political'], ['shows the world\'s ocean depths and mountain ranges', 'physical'],
    ['shades each state by its number of people', 'thematic']];
  G('worldgeo.kinds-of-maps', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['desc', 'look']) : L === 2 ? R.pick(['desc', 'look', 'chor']) : R.pick(['chor', 'chortf', 'look']);
    if (shape === 'desc') {
      var d = R.pick(KDESC);
      return { q: '<p>A map ' + d[0] + '. What kind of map is it?</p>', a: mc([KINDS.political, KINDS.physical, KINDS.thematic], KINDS[d[1]]), hint: 'Borders and cities: political. Landforms and water: physical. One topic: thematic.',
        steps: [d[1] === 'political' ? 'It is about borders and places people govern.' : d[1] === 'physical' ? 'It is about the land and water themselves.' : 'It is about one topic shown on a map.', 'So it is ' + KINDS[d[1]].toLowerCase() + '.'] };
    }
    if (shape === 'look') {
      var reg = R.pick(['AF', 'sam', 'EU', 'AS', 'NA']), k = R.pick(['political', 'physical', 'thematic']), opts;
      if (k === 'political') opts = { region: reg, capitals: true, capLabels: false };
      else if (k === 'physical') opts = { region: reg, color: 'plain', features: ['range', 'desert', 'rivers', 'plateau', 'basin'], featureLabels: false, featureFocus: reg === 'sam' ? 'SA' : reg };
      else { var data = {}; ML.geog.countries({ cont: reg === 'sam' ? 'SA' : reg }).forEach(function (c) { data[c.id] = Math.round(c.km2 / 1000); }); opts = { region: reg, data: data, breaks: [50, 200, 500, 1000], legend: 'Area (thousand km²)' }; }
      opts.quiet = true; opts.interactive = false; opts.disputedNote = false;
      return { q: '<p>What kind of map is this?</p>', viz: { name: 'gg-map', opts: opts }, a: mc([KINDS.political, KINDS.physical, KINDS.thematic], KINDS[k]),
        hint: 'Does it show borders and capitals, landforms and rivers, or one topic with a key?',
        steps: [k === 'political' ? 'Each country has its own color and capitals are marked with stars.' : k === 'physical' ? 'It shows mountains, deserts and rivers, not borders.' : 'Each country is shaded by one number, explained in the key: a choropleth, a kind of thematic map.', 'So it is ' + KINDS[k].toLowerCase() + '.'] };
    }
    if (shape === 'chor') {
      var reg2 = R.pick(['sam', 'AF', 'EU']), cont = reg2 === 'sam' ? 'SA' : reg2, cs = ML.geog.countries({ cont: cont }).filter(function (c) { return c.km2 > 20000; });
      var data2 = {}; cs.forEach(function (c) { data2[c.id] = Math.round(c.km2 / 1000); });
      var top = cs.slice().sort(function (a, b) { return b.km2 - a.km2; }), pick = [top[0]].concat(R.sample(cs.filter(function (c) { return c.km2 < 480000; }), 2)), mark = {}; pick = R.shuffle(pick); pick.forEach(function (c, i) { mark[c.id] = LET[i]; });
      return { q: '<p>This choropleth shades each country by its area. Use the key. Which lettered country is in the class with the largest areas?</p>', viz: { name: 'gg-map', opts: { region: reg2, data: data2, breaks: [50, 200, 500, 1000], legend: 'Area (thousand km²)', mark: mark, quiet: true, interactive: false, disputedNote: false } },
        a: letters(3, pick.indexOf(top[0])), hint: 'Find the color for the largest class in the key, then the letter on that color.',
        steps: ['The key shows which color stands for the largest areas (1,000 thousand km² or more).', 'The lettered country in that class is ' + LET[pick.indexOf(top[0])] + ', ' + top[0].n + ', at about ' + fmtN(Math.round(top[0].km2 / 1000)) + ' thousand km².'] };
    }
    var st = R.pick([['A choropleth map gives one value for each whole area.', true, 'Each area gets one shade for one number.'], ['A choropleth of population shows exactly where people live inside each country.', false, 'It gives one number per country; people may live mostly in a few cities.'],
      ['On a choropleth, a dark country means every part of it has a high value.', false, 'The shade is for the whole country; parts can differ a lot.'], ['A thematic map shows one topic, such as rainfall or language.', true, 'That is what thematic means.'],
      ['A physical map must show the borders of every country.', false, 'Physical maps show landforms and water; borders are optional.'], ['A political map shows countries, borders and cities.', true, 'That is a political map.']]);
    return { q: '<p>True or false? ' + st[0] + '</p>', a: { t: 'tf', v: st[1] }, hint: 'A choropleth shades each whole area by one number.', steps: [(st[1] ? 'True. ' : 'False. ') + st[2]] };
  });

  /* ---------------------------------------------------------- GPS, GIS and satellite images */
  var TOOLJOBS = [['tell a hiker her exact coordinates', 0], ['show a car\'s position on a road', 0], ['give a ship its latitude and longitude', 0], ['help a farmer steer a tractor in straight rows by position', 0],
    ['show the smoke from a forest fire, seen from space', 1], ['show how a city grew over 40 years of pictures from space', 1], ['show how much ice covers the Arctic Ocean this summer, from space', 1], ['see a hurricane\'s clouds from above', 1],
    ['stack layers of roads, rivers and schools to find schools near a flood zone', 2], ['combine bus routes and homes to choose a place for a new bus stop', 2], ['overlay soil, rainfall and farm maps to plan where to plant', 2], ['find every home more than 1 km from a park', 2]];
  var TOOLS = ['GPS', 'A satellite image', 'A GIS'];
  var GPS_BANK = [
    ['GPS gives your position; it does not draw the map.', true, 'The map comes from a separate map app.'],
    ['A GPS receiver needs signals from at least four satellites to find its position and height.', true, 'Four distances fix latitude, longitude, height and time.'],
    ['GPS is operated by the U.S. Space Force.', true, 'The U.S. Space Force operates the satellites and control stations.'],
    ['The U.S. keeps at least 24 GPS satellites working.', true, 'The government commits to at least 24 operating satellites.'],
    ['A GIS stacks layers of map data to answer questions.', true, 'Layers such as roads, rivers and homes can be combined.'],
    ['GPS and GIS are two names for the same thing.', false, 'GPS finds a position; a GIS combines layers of map data.'],
    ['GPS only works when you are looking at a map.', false, 'GPS gives coordinates with or without a map.'],
    ['Satellite images are photographs or scans of Earth taken from space.', true, 'Landsat satellites have taken them since 1972.'],
    ['GPS is the only satellite positioning system in the world.', false, 'Europe (Galileo), Russia (GLONASS) and China (BeiDou) run others.']];
  G('worldgeo.gps-gis', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['job', 'tf']) : L === 2 ? R.pick(['job', 'tf', 'sats']) : R.pick(['all', 'job', 'sats']);
    if (shape === 'job') {
      var j = R.pick(TOOLJOBS);
      return { q: '<p>Which tool fits this job best: to ' + j[0] + '?</p>', a: mc(TOOLS.slice(), TOOLS[j[1]]), hint: 'GPS: where am I? Satellite image: what does it look like from space? GIS: what do these layers tell me together?',
        steps: [j[1] === 0 ? 'The job needs a position: coordinates.' : j[1] === 1 ? 'The job needs a picture of Earth from above.' : 'The job combines several layers of map data.', 'So the best tool is ' + TOOLS[j[1]].replace('A ', 'a ') + '.'] };
    }
    if (shape === 'sats') {
      var w = R.pick([['At least how many satellites must a GPS receiver hear from to find its latitude, longitude and height?', '4', ['1', '2', '24']], ['At least how many working GPS satellites does the United States commit to keep?', '24', ['4', '7', '1,000']]]);
      return { q: '<p>' + w[0] + '</p>', a: mc([w[1]].concat(w[2]), w[1]), hint: 'One distance from each satellite; three unknowns plus the time.',
        steps: ['A receiver measures its distance from each satellite.', 'Four satellites give four distances, enough for latitude, longitude, height and the exact time.', 'The U.S. keeps at least 24 satellites working so that four or more are always in view.'] };
    }
    if (shape === 'tf') return tfItem(R, GPS_BANK, 'GPS gives a position; a GIS combines layers; satellites also take pictures.');
    return chooseAll(R, GPS_BANK, 4, 'GPS gives a position; a GIS combines layers.');
  });

  /* ================================================================== unit 3: time around the world */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function clk(m) { return GG().fmtClock(m); }
  function dayAt(d, mins) { return DAYS[(((d + Math.floor(mins / 1440)) % 7) + 7) % 7]; } // weekday after adding minutes from midnight of day d
  function tz(h) { return GG().fmtUTC(h); }
  G('worldgeo.why-time-zones', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['perhour', 'deg2h', 'h2deg']) : L === 2 ? R.pick(['deg2h', 'h2deg', 'sun', 'fact']) : R.pick(['sun', 'fact', 'deg2h']);
    if (shape === 'perhour') {
      var w = R.pick([['How many degrees does Earth turn in one hour?', '15°', ['24°', '1°', '360°']], ['How many hours does Earth take to turn all the way around, 360°?', '24 hours', ['12 hours', '15 hours', '365 hours']]]);
      return { q: '<p>' + w[0] + '</p>', a: mc([w[1]].concat(w[2]), w[1]), hint: 'One full turn is 360° in 24 hours.', steps: ['Earth turns 360° in 24 hours.', '360 ÷ 24 = 15°, so it turns 15° each hour.'] };
    }
    if (shape === 'deg2h') {
      var h = L === 1 ? R.int(2, 6) : R.int(2, 12), deg = h * 15;
      return { q: '<p>Earth turns 15° each hour. How many hours does it take to turn ' + deg + '°?</p>', a: num(h), unit: 'hours', hint: 'Divide by 15.', steps: [deg + ' ÷ 15 = ' + h + ' hours.'] };
    }
    if (shape === 'h2deg') {
      var h2 = R.int(2, 12);
      return { q: '<p>Earth turns 15° each hour. How many degrees does it turn in ' + h2 + ' hours?</p>', a: num(h2 * 15), unit: '°', hint: 'Multiply by 15.', steps: [h2 + ' × 15 = ' + (h2 * 15) + '°.'] };
    }
    if (shape === 'sun') {
      var d = R.pick([15, 30, 45, 60, 75, 90, 105, 120]), east = R.coin(), dh = d / 15, ans = 720 + (east ? 1 : -1) * dh * 60;
      var ch = uniqStr([clk(ans), clk(720 - (east ? 1 : -1) * dh * 60), clk(720 + (east ? 1 : -1) * d * 60 / 10), clk(720 + (east ? 1 : -1) * (dh + 1) * 60)]);
      return { q: '<p>Town A is ' + d + '° of longitude <b>' + (east ? 'east' : 'west') + '</b> of Town B. When the Sun is highest (noon by the Sun) in Town B, what is the Sun time in Town A?</p>', a: mc(ch, clk(ans)),
        hint: 'Earth turns toward the east, so places to the east reach noon first.', steps: [d + '° ÷ 15° per hour = ' + dh + ' hour' + (dh > 1 ? 's' : '') + '.', 'Places to the ' + (east ? 'east are ahead: they had noon earlier, so add.' : 'west are behind: their noon has not come yet, so subtract.'), '12:00 noon ' + (east ? '+ ' : '− ') + dh + ' = ' + clk(ans) + '.'] };
    }
    var f = R.pick([['China uses one time zone, even though it spans about 60° of longitude.', true, 'All of China uses UTC+8.'], ['Time zones follow straight lines exactly every 15°.', false, 'They bend around countries and states.'],
      ['India uses a time zone that is not a whole number of hours from UTC.', true, 'India uses UTC+5:30.'], ['Places to the east of you have their noon later than you do.', false, 'Earth turns toward the east, so eastern places reach noon earlier.'],
      ['Time zones are counted as hours ahead of or behind UTC, the time at the prime meridian.', true, 'UTC is the reference time at 0° longitude.'], ['Before time zones, each town set its clocks by its own Sun.', true, 'Railroads led to shared time zones in the 1880s.'],
      ['Every country uses exactly one time zone.', false, 'Large countries such as the United States, Canada and Russia use several.']]);
    return { q: '<p>True or false? ' + f[0] + '</p>', a: { t: 'tf', v: f[1] }, hint: 'Time zones are about 15° wide, but borders bend them.', steps: [(f[1] ? 'True. ' : 'False. ') + f[2]] };
  });

  /* ---------------------------------------------------------- time math with UTC offsets */
  function cityPair(R, L) {
    var CS = ML.geog.CITIES.filter(function (c) { return L === 3 || c.utc % 1 === 0; }), a, b, n = 0;
    do { a = R.pick(CS); b = R.pick(CS); n++; } while ((a.utc === b.utc || Math.abs(a.utc - b.utc) < 2 || (L === 1 && Math.abs(a.utc - b.utc) > 9) || (L === 3 && a.utc % 1 === 0 && b.utc % 1 === 0 && R.chance(0.6))) && n < 300);
    return [a, b];
  }
  G('worldgeo.world-time-math', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? 'convert' : L === 2 ? R.pick(['convert', 'convert', 'utc']) : R.pick(['convert', 'convert', 'diff']);
    var pr = cityPair(R, L), A = pr[0], B = pr[1], tA, n = 0, d0 = R.int(0, 6), tB;
    do { tA = R.int(L === 1 ? 7 : 0, L === 1 ? 17 : 23) * 60 + R.pick([0, 0, 30]); tB = tA + Math.round((B.utc - A.utc) * 60); n++; } while (L === 1 && (tB < 0 || tB >= 1440) && n < 400);
    var utcMin = tA - Math.round(A.utc * 60), tzv = { name: 'gg-timezones', opts: { cities: [A.n, B.n], utc: ((utcMin % 1440) + 1440) % 1440, quiet: true, interactive: false, ask: B.n } };
    function lbl(m) { var dd = Math.floor(m / 1440); return clk(m) + (dd === 0 ? '' : ' ' + dayAt(d0, m)); }
    if (shape === 'utc') {
      var ans = lbl(utcMin), ch = uniqStr([ans, lbl(tA + Math.round(A.utc * 60)), lbl(utcMin + 60), lbl(utcMin - 60)]);
      return { q: '<p>It is ' + clk(tA) + ' on ' + DAYS[d0] + ' in ' + A.n + ' (' + tz(A.utc) + '). What time is it in UTC?' + (ans.indexOf('day') > 0 ? '' : '') + '</p>', a: mc(ch.map(function (x) { return x.indexOf('day') > 0 ? x : x + ' ' + DAYS[d0]; }), ans.indexOf('day') > 0 ? ans : ans + ' ' + DAYS[d0]),
        hint: 'To get UTC, subtract the offset (subtracting a negative offset means adding).', steps: [A.n + ' is ' + tz(A.utc) + '.', 'UTC = ' + clk(tA) + ' − (' + (A.utc >= 0 ? '+' : '−') + Math.abs(A.utc) + ' h) = ' + clk(utcMin) + (Math.floor(utcMin / 1440) ? ' on ' + dayAt(d0, utcMin) : '') + '.'] };
    }
    if (shape === 'diff') {
      var diff = B.utc - A.utc, dh = Math.abs(diff), txt = Math.floor(dh) + ' hours' + (dh % 1 ? ' ' + Math.round((dh % 1) * 60) + ' minutes' : '');
      var opts = uniqStr([txt + ' ' + (diff > 0 ? 'ahead of' : 'behind'), txt + ' ' + (diff > 0 ? 'behind' : 'ahead of'), Math.floor(dh) + (dh % 1 ? 1 : 2) + ' hours ' + (diff > 0 ? 'ahead of' : 'behind'), Math.abs(B.utc + A.utc) + ' hours ' + (diff > 0 ? 'ahead of' : 'behind')]);
      return { q: '<p>' + A.n + ' is at ' + tz(A.utc) + ' and ' + B.n + ' is at ' + tz(B.utc) + ' (standard time). How does ' + B.n + '\'s clock compare with ' + A.n + '\'s?</p>', a: mc(opts.map(function (o) { return B.n + ' is ' + o + ' ' + A.n; }), B.n + ' is ' + opts[0] + ' ' + A.n),
        hint: 'Subtract the offsets: ' + B.n + '\'s minus ' + A.n + '\'s.', steps: ['Difference = (' + offStr(B.utc) + ') − (' + offStr(A.utc) + ') = ' + (diff > 0 ? '+' : '−') + txt.replace(' hours', ' h').replace(' minutes', ' min') + '.', diff > 0 ? 'Positive: ' + B.n + ' is ahead.' : 'Negative: ' + B.n + ' is behind.'] };
    }
    var right = tB, ans2 = clk(right) + (Math.floor(right / 1440) === 0 ? (L === 1 ? '' : ' ' + DAYS[d0]) : ' ' + dayAt(d0, right));
    function opt(m) { return clk(m) + (Math.floor(m / 1440) === 0 ? (L === 1 ? '' : ' ' + DAYS[d0]) : ' ' + dayAt(d0, m)); }
    var wrongDir = tA - Math.round((B.utc - A.utc) * 60), noFrac = tA + Math.trunc(B.utc - A.utc) * 60, offDay = right + (right >= 1440 ? -1440 : right < 0 ? 1440 : (R.coin() ? 1440 : -1440));
    var ch2 = uniqStr([ans2, opt(wrongDir), opt(noFrac), L === 1 ? opt(right + 60) : clk(right) + ' ' + dayAt(d0, offDay), opt(right - 60)]).slice(0, 4);
    if (ch2.indexOf(ans2) < 0) ch2[0] = ans2;
    return { q: '<p>It is <b>' + clk(tA) + (L === 1 ? '' : ' on ' + DAYS[d0]) + '</b> in ' + A.n + ' (' + tz(A.utc) + '). What time is it in ' + B.n + ' (' + tz(B.utc) + ')?' + (L === 1 ? '' : ' Give the day too.') + ' (Standard time, no daylight saving.)</p>', viz: tzv,
      a: mc(ch2, ans2), hint: 'Subtract ' + A.n + '\'s offset to get UTC, then add ' + B.n + '\'s offset.',
      steps: ['To UTC: ' + clk(tA) + ' − (' + offStr(A.utc) + ' h) = ' + clk(utcMin) + (Math.floor(utcMin / 1440) ? ' (' + dayAt(d0, utcMin) + ')' : '') + '.', 'To ' + B.n + ': ' + clk(utcMin) + ' + (' + offStr(B.utc) + ' h) = ' + clk(right) + '.',
        Math.floor(right / 1440) === 0 ? 'It is still the same day.' : 'The time passed midnight, so it is ' + dayAt(d0, right) + ' in ' + B.n + '.'] };
  });

  /* ---------------------------------------------------------- the International Date Line */
  var EDGE = [['Kiritimati, Kiribati', 14], ['Apia, Samoa', 13], ['Nukuʻalofa, Tonga', 13], ['Auckland, New Zealand', 12], ['Suva, Fiji', 12], ['Sydney, Australia', 10], ['Tokyo, Japan', 9], ['London, England', 0], ['New York, U.S.', -5], ['Honolulu, Hawaii', -10], ['Pago Pago, American Samoa', -11]];
  G('worldgeo.date-line', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['cross', 'rule']) : L === 2 ? R.pick(['cross', 'first', 'samoa']) : R.pick(['flight', 'first', 'samoa']);
    if (shape === 'rule' || shape === 'cross') {
      var d = R.int(0, 6), west = R.coin(), t = R.pick([360, 540, 720, 900, 1080]), nd = DAYS[(d + (west ? 1 : 6)) % 7];
      if (shape === 'rule') return { q: '<p>A ship crosses the International Date Line sailing <b>' + (west ? 'west' : 'east') + '</b>. What happens to the date?</p>', a: mc(['It goes ahead one day', 'It goes back one day', 'It stays the same'], west ? 'It goes ahead one day' : 'It goes back one day'),
        hint: 'Going west across the line, you skip ahead.', steps: ['Crossing the date line going west: skip ahead one day.', 'Going east: go back one day.', 'This ship goes ' + (west ? 'west, so the date goes ahead.' : 'east, so the date goes back.')] };
      return { q: '<p>A ship crosses the International Date Line sailing <b>' + (west ? 'west' : 'east') + '</b> at ' + clk(t) + ' on ' + DAYS[d] + '. What is the day and time just after it crosses?</p>',
        a: mc([clk(t) + ' ' + DAYS[(d + 1) % 7], clk(t) + ' ' + DAYS[(d + 6) % 7], clk(t) + ' ' + DAYS[d], clk(t + 720) + ' ' + DAYS[d]], clk(t) + ' ' + nd), hint: 'The clock time stays about the same; only the date changes.',
        steps: ['Going ' + (west ? 'west' : 'east') + ' across the date line, the date ' + (west ? 'skips ahead' : 'goes back') + ' one day.', 'The clock time does not change: ' + clk(t) + '.', 'So it becomes ' + clk(t) + ' on ' + nd + '.'] };
    }
    if (shape === 'first') {
      var four = [], pool = R.shuffle(EDGE); pool.forEach(function (p) { if (four.length < (L === 2 ? 3 : 4) && four.every(function (q) { return q[1] !== p[1]; })) four.push(p); }); var want = R.coin() ? 'first' : 'last', best = four.slice().sort(function (a, b) { return want === 'first' ? b[1] - a[1] : a[1] - b[1]; })[0];
      var fm = function (p) { return p[0] + ' (' + tz(p[1]) + ')'; };
      return { q: '<p>Which of these places is the <b>' + want + '</b> to start each new day?</p>', a: mc(four.map(fm), fm(best)), hint: 'The bigger the UTC offset, the earlier a place reaches midnight.',
        steps: ['A place ' + Math.abs(best[1]) + ' hours ' + (best[1] >= 0 ? 'ahead of' : 'behind') + ' UTC reaches midnight ' + (want === 'first' ? 'before' : 'after') + ' the others here.', 'The largest offset starts the day first; the smallest, last.', 'So ' + best[0] + ' is ' + want + '.'] };
    }
    if (shape === 'samoa') {
      var d2 = R.int(0, 6), t2 = R.pick([480, 600, 720, 840, 1020]), fromS = R.coin();
      var A = fromS ? ['Samoa', 13] : ['American Samoa', -11], B = fromS ? ['American Samoa', -11] : ['Samoa', 13], nd2 = DAYS[(d2 + (fromS ? 6 : 1)) % 7];
      return { q: '<p>Samoa (' + tz(13) + ') and American Samoa (' + tz(-11) + ') are islands less than 200 km apart, on opposite sides of the date line. It is ' + clk(t2) + ' on ' + DAYS[d2] + ' in ' + A[0] + '. What is the day and time in ' + B[0] + '?</p>',
        a: mc([clk(t2) + ' ' + DAYS[(d2 + 1) % 7], clk(t2) + ' ' + DAYS[(d2 + 6) % 7], clk(t2) + ' ' + DAYS[d2], clk(t2 + 120) + ' ' + DAYS[d2]], clk(t2) + ' ' + nd2), hint: 'Find the difference in the offsets: 13 − (−11).',
        steps: ['The offsets differ by 13 − (−11) = 24 hours: exactly one day.', B[0] + ' is ' + (fromS ? 'behind' : 'ahead') + ', so it is the same clock time on ' + nd2 + '.'] };
    }
    var dep = R.pick([['Tokyo', 9], ['Sydney', 10], ['Auckland', 12]]), arr = R.pick([['Honolulu', -10], ['Los Angeles', -8], ['Anchorage', -9]]), fh = R.int(7, 12), d3 = R.int(0, 6), tdep = R.pick([18, 19, 20, 21, 22]) * 60;
    var tarr = tdep - dep[1] * 60 + fh * 60 + arr[1] * 60, ansd = dayAt(d3, tarr), ans3 = clk(tarr) + ' ' + ansd;
    var wrong = [clk(tarr) + ' ' + dayAt(d3, tarr + 1440), clk(tdep + fh * 60) + ' ' + dayAt(d3, tdep + fh * 60), clk(tarr) + ' ' + dayAt(d3, tarr - 1440)];
    return { q: '<p>A plane leaves ' + dep[0] + ' (' + tz(dep[1]) + ') at ' + clk(tdep) + ' on ' + DAYS[d3] + ' and flies east across the date line for ' + fh + ' hours to ' + arr[0] + ' (' + tz(arr[1]) + '). What is the local day and time when it lands?</p>',
      a: mc(uniqStr([ans3].concat(wrong)), ans3), hint: 'Change the departure time to UTC, add the flight time, then change to ' + arr[0] + ' time.',
      steps: ['Departure in UTC: ' + clk(tdep) + ' − ' + dep[1] + ' h = ' + clk(tdep - dep[1] * 60) + ' ' + dayAt(d3, tdep - dep[1] * 60) + '.', 'Add ' + fh + ' hours of flying: ' + clk(tdep - dep[1] * 60 + fh * 60) + ' ' + dayAt(d3, tdep - dep[1] * 60 + fh * 60) + ' UTC.', 'Change to ' + arr[0] + ' (' + tz(arr[1]) + '): ' + ans3 + '.', 'Flying east across the date line, the plane can land on an earlier date than it left.'] };
  });

  /* ================================================================== unit 4: the physical world */
  // continent areas, million km² (rounded; Grokipedia "Continent")
  var CONT_AREA = [['Asia', 44.6], ['Africa', 30.3], ['North America', 24.7], ['South America', 17.8], ['Antarctica', 14.0], ['Europe', 10.2], ['Australia', 7.7]];
  var CONT_BANK = [
    ['Asia is the largest continent by area.', true, 'Asia covers about 44.6 million km².'], ['Asia has more people than any other continent.', true, 'Asia is first in people; Africa is second.'],
    ['Australia is the smallest continent.', true, 'Australia covers about 7.7 million km².'], ['Antarctica has no permanent residents.', true, 'Only scientists and staff live there for a time.'],
    ['Europe and Asia share one landmass, called Eurasia.', true, 'The usual line between them follows the Ural Mountains and the Caucasus.'],
    ['Europe is completely surrounded by water.', false, 'Europe is joined to Asia along a long land border.'], ['Africa is the largest continent.', false, 'Africa is second; Asia is the largest.'],
    ['Europe is larger than South America.', false, 'South America (about 17.8 million km²) is larger than Europe (about 10.2 million km²).'],
    ['Antarctica is larger than Europe.', true, 'Antarctica is about 14.0 million km²; Europe about 10.2 million km².'], ['North America is larger than South America.', true, 'About 24.7 against 17.8 million km².']];
  G('worldgeo.continents-compared', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['record', 'map', 'bigger']) : L === 2 ? R.pick(['bigger', 'record', 'tf', 'order']) : R.pick(['order', 'ratio', 'all']);
    if (shape === 'record') {
      var r = R.pick([['the largest continent by area', 'Asia'], ['the smallest continent', 'Australia'], ['the continent with the most people', 'Asia'], ['the continent with no permanent residents', 'Antarctica'], ['the second-largest continent by area', 'Africa'], ['the continent with the second-most people', 'Africa']]);
      var wr = R.sample(CONT_AREA.map(function (c) { return c[0]; }).filter(function (n) { return n !== r[1]; }), 3);
      return { q: '<p>Which is ' + r[0] + '?</p>', a: mc([r[1]].concat(wr), r[1]), hint: 'Asia is first in area and in people; Africa is second in both.', steps: ['Asia is the largest and has the most people; Africa is second in both.', 'Australia is the smallest; Antarctica has no permanent residents.', 'So the answer is ' + r[1] + '.'] };
    }
    if (shape === 'map') {
      var CL = ML.geog.CONTINENT_LABELS, c = R.pick(CL), name = c.n;
      var wr2 = R.sample(CL.filter(function (x) { return x.id !== c.id; }).map(function (x) { return x.n; }), 2);
      return { q: '<p>Which continent has the <b>?</b> on it?</p>', viz: { name: 'gg-map', opts: { color: 'continents', points: [{ lon: c.lon, lat: c.lat, mark: '?' }], quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: mc([name].concat(wr2), name), hint: 'Look at the shape and where it sits compared with the equator.', steps: ['The question mark is on ' + name + '.'] };
    }
    if (shape === 'bigger') {
      var two = R.sample(CONT_AREA, 2), big = two[0][1] > two[1][1] ? two[0] : two[1];
      return { q: '<p>Which continent is larger: ' + two[0][0] + ' or ' + two[1][0] + '?</p>', a: mc([two[0][0], two[1][0]], big[0]), hint: 'From largest: Asia, Africa, North America, South America, Antarctica, Europe, Australia.',
        steps: [two[0][0] + ': about ' + two[0][1] + ' million km². ' + two[1][0] + ': about ' + two[1][1] + ' million km².', big[0] + ' is larger.'] };
    }
    if (shape === 'order') {
      var three = R.sample(CONT_AREA, 3), s = three.slice().sort(function (a, b) { return b[1] - a[1]; }), right = s.map(function (x) { return x[0]; }).join(', ');
      var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(function (p) { return p.map(function (i) { return s[i][0]; }).join(', '); });
      return { q: '<p>Put these continents in order from <b>largest to smallest</b> area: ' + three.map(function (x) { return x[0]; }).join(', ') + '.</p>', a: mc([right].concat(R.sample(perms.slice(1), 3)), right),
        hint: 'Asia, Africa, North America, South America, Antarctica, Europe, Australia.', steps: s.map(function (x) { return x[0] + ': about ' + x[1] + ' million km².'; }).concat(['Largest to smallest: ' + right + '.']) };
    }
    if (shape === 'ratio') {
      var p, q2, n = 0; do { p = R.pick(CONT_AREA); q2 = R.pick(CONT_AREA); n++; } while ((p[1] / q2[1] < 1.6) && n < 100);
      var rat = Math.round(p[1] / q2[1] * 10) / 10;
      return { q: '<p>' + p[0] + ' covers about ' + p[1] + ' million km² and ' + q2[0] + ' about ' + q2[1] + ' million km². About how many times bigger is ' + p[0] + '? Round to one decimal place.</p>', a: num(rat, 0.03), hint: 'Divide the larger area by the smaller one.', steps: [p[1] + ' ÷ ' + q2[1] + ' ≈ ' + rat + '.'] };
    }
    if (shape === 'tf') return tfItem(R, CONT_BANK, 'Asia is the largest; Australia the smallest; Europe is joined to Asia.');
    return chooseAll(R, CONT_BANK, 4, 'Asia, Africa, North America, South America, Antarctica, Europe, Australia.');
  });

  /* ---------------------------------------------------------- oceans and seas */
  var SEA_OCEAN = { 'Mediterranean Sea': 'Atlantic', 'Caribbean Sea': 'Atlantic', 'North Sea': 'Atlantic', 'Baltic Sea': 'Atlantic', 'Arabian Sea': 'Indian', 'Bay of Bengal': 'Indian', 'Red Sea': 'Indian', 'Persian Gulf': 'Indian',
    'South China Sea': 'Pacific', 'Bering Sea': 'Pacific', 'Sea of Japan': 'Pacific', 'Coral Sea': 'Pacific', 'Tasman Sea': 'Pacific' };
  function seaName(n) { return n === 'Gulf of Mexico' ? 'Gulf of Mexico (Gulf of America)' : n; }
  var OCEAN_ORDER = ['Pacific', 'Atlantic', 'Indian', 'Southern', 'Arctic'];
  G('worldgeo.oceans-seas', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['mark', 'ocean', 'size']) : L === 2 ? R.pick(['mark', 'ocean', 'lake', 'size']) : R.pick(['mark', 'lake', 'ocean']);
    if (shape === 'mark') {
      var S = ML.geog.SEAS.filter(function (s) { return s.n !== 'Caspian Sea'; }), pick = [], n = 0;
      while (pick.length < (L === 1 ? 3 : 4) && n < 500) { n++; var s = R.pick(S); if (pick.every(function (p) { return p.n !== s.n && Math.abs(p.lon - s.lon) + Math.abs(p.lat - s.lat) >= 18; })) pick.push(s); }
      var t = R.int(0, pick.length - 1);
      return { q: '<p>Which letter is on the <b>' + seaName(pick[t].n) + '</b>?</p>', viz: { name: 'gg-map', opts: { color: 'plain', points: pick.map(function (p, i) { return { lon: p.lon, lat: p.lat, mark: LET[i] }; }), quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: letters(pick.length, t), hint: 'Which land surrounds it? Find those continents first.', steps: ['The ' + seaName(pick[t].n) + ' is at letter ' + LET[t] + '.'].concat(pick.filter(function (p, i) { return i !== t; }).map(function (p) { return 'Letter ' + LET[pick.indexOf(p)] + ' is the ' + seaName(p.n) + '.'; })) };
    }
    if (shape === 'ocean') {
      var sea = R.pick(Object.keys(SEA_OCEAN)), oc = SEA_OCEAN[sea];
      return { q: '<p>The ' + sea + ' is part of which ocean?</p>', a: mc(OCEAN_ORDER.slice(0, 4).map(function (o) { return o + ' Ocean'; }), oc + ' Ocean'), hint: 'Find the sea on a map, then follow its water out to the open ocean.',
        steps: ['The ' + sea + ' opens into the ' + oc + ' Ocean.'] };
    }
    if (shape === 'size') {
      var w = R.pick([['the largest ocean', 0], ['the smallest ocean', 4], ['the second-largest ocean', 1], ['the third-largest ocean', 2]]);
      return { q: '<p>Which is ' + w[0] + '?</p>', a: mc(R.sample(OCEAN_ORDER.filter(function (o, i) { return i !== w[1]; }), 3).concat([OCEAN_ORDER[w[1]]]).map(function (o) { return o + ' Ocean'; }), OCEAN_ORDER[w[1]] + ' Ocean'),
        hint: 'From largest: Pacific, Atlantic, Indian, Southern, Arctic.', steps: ['From largest to smallest: Pacific, Atlantic, Indian, Southern, Arctic.', 'So the answer is the ' + OCEAN_ORDER[w[1]] + ' Ocean.'] };
    }
    var it = R.pick([['Which of these is really a lake, with land all around it?', 'The Caspian Sea', ['The Red Sea', 'The North Sea', 'The South China Sea']], ['Which of these is a salty lake, not part of the ocean?', 'The Dead Sea', ['The Black Sea', 'The Arabian Sea', 'The Bering Sea']],
      ['True or false: the Caspian Sea is part of the ocean.', 'False', ['True']], ['True or false: a sea is a smaller part of the ocean, partly closed in by land.', 'True', ['False']], ['True or false: every body of water named "sea" is part of the ocean.', 'False', ['True']]]);
    if (it[1] === 'True' || it[1] === 'False') return { q: '<p>' + it[0].replace('True or false: ', 'True or false? ').replace(/^(True or false\? )(.)/, function (m, a, b) { return a + b.toUpperCase(); }) + '</p>', a: { t: 'tf', v: it[1] === 'True' }, hint: 'Does the water connect to the open ocean?',
      steps: [it[1] === 'True' ? 'True. Seas are arms of the ocean, partly enclosed by land.' : 'False. The Caspian Sea and the Dead Sea are salty lakes: land surrounds them and their water never reaches the ocean.'] };
    return { q: '<p>' + it[0] + '</p>', a: mc([it[1]].concat(it[2]), it[1]), hint: 'Does the water connect to the open ocean?', steps: [it[1] + ' has land all around it; its water never reaches the ocean.', 'The others are arms of the ocean.'] };
  });

  /* ---------------------------------------------------------- great rivers */
  var RIV = { nile: ['Africa', 'the Mediterranean Sea'], amazon: ['South America', 'the Atlantic Ocean'], yangtze: ['Asia', 'the East China Sea (Pacific Ocean)'], mississippi: ['North America', 'the Gulf of Mexico (Gulf of America)'],
    congo: ['Africa', 'the Atlantic Ocean'], ganges: ['Asia', 'the Bay of Bengal'], mekong: ['Asia', 'the South China Sea'], danube: ['Europe', 'the Black Sea'], volga: ['Europe', 'the Caspian Sea'],
    niger: ['Africa', 'the Gulf of Guinea (Atlantic Ocean)'], indus: ['Asia', 'the Arabian Sea'], rhine: ['Europe', 'the North Sea'], parana: ['South America', 'the Río de la Plata (Atlantic Ocean)'] };
  var RCONT = { Africa: 'AF', 'South America': 'SA', Asia: 'AS', 'North America': 'NA', Europe: 'EU' };
  G('worldgeo.world-rivers', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['mark', 'cont']) : L === 2 ? R.pick(['mark', 'mouth', 'cont', 'fact']) : R.pick(['mark', 'mouth', 'fact']);
    var ids = Object.keys(RIV);
    if (shape === 'mark') {
      var set;
      if (L === 1) { var byC = {}; ['nile', 'amazon', 'yangtze', 'mississippi', 'danube', 'volga', 'congo', 'ganges'].forEach(function (r) { (byC[RIV[r][0]] = byC[RIV[r][0]] || []).push(r); }); set = R.sample(Object.keys(byC), 3).map(function (c) { return R.pick(byC[c]); }); }
      else { var cont = R.pick(['Africa', 'Asia', 'Europe', 'South America']), same = ids.filter(function (r) { return RIV[r][0] === cont; }); set = R.sample(same, Math.min(3, same.length)); if (set.length < 3) set = set.concat(R.sample(ids.filter(function (r) { return set.indexOf(r) < 0 && RIV[r][0] !== cont; }), 3 - set.length)); }
      var t = R.int(0, set.length - 1), mark = {}; set.forEach(function (r, i) { mark[r] = LET[i]; });
      var conts = uniqStr(set.map(function (r) { return RIV[r][0]; })), opts = { color: 'plain', features: set, mark: mark, featureLabels: false, quiet: true, interactive: false, dots: false, disputedNote: false };
      if (conts.length === 1) opts.region = RCONT[conts[0]];
      return { q: '<p>Which letter marks the <b>' + ML.geog.river(set[t]).n + '</b> River?</p>', viz: { name: 'gg-map', opts: opts }, a: letters(set.length, t),
        hint: 'Which continent is it on? Where does it reach the sea?', steps: ['The ' + ML.geog.river(set[t]).n + ' flows through ' + RIV[set[t]][0] + ' into ' + RIV[set[t]][1] + '.', 'That is letter ' + LET[t] + '.'] };
    }
    if (shape === 'cont') {
      var r = R.pick(ids), c = RIV[r][0];
      return { q: '<p>On which continent is the ' + ML.geog.river(r).n + ' River?</p>', a: mc(['Africa', 'Asia', 'Europe', 'North America', 'South America'].filter(function (x) { return x !== c; }).slice(0, 3).concat([c]), c),
        hint: 'Picture where it reaches the sea.', steps: ['The ' + ML.geog.river(r).n + ' flows through ' + c + ' into ' + RIV[r][1] + '.'] };
    }
    if (shape === 'mouth') {
      var r2 = R.pick(ids), right = RIV[r2][1], oc = (right.match(/Atlantic|Pacific/) || ['@'])[0], wr = R.sample(uniqStr(ids.filter(function (x) { return RIV[x][1] !== right && RIV[x][1].indexOf(oc) < 0; }).map(function (x) { return RIV[x][1]; })), 3);
      return { q: '<p>Into which body of water does the ' + ML.geog.river(r2).n + ' River flow?</p>', a: mc([right].concat(wr).map(cap1), cap1(right)), hint: 'Which continent is it on, and which sea or ocean is at its end?',
        steps: ['The ' + ML.geog.river(r2).n + ' is in ' + RIV[r2][0] + '.', 'It ends at ' + right + '.'] };
    }
    var f = R.pick([['Which way does the Nile flow?', 'North, into the Mediterranean Sea', ['South, into the Indian Ocean', 'West, into the Atlantic Ocean', 'East, into the Red Sea']],
      ['Which river carries the most water of any river?', 'The Amazon', ['The Nile', 'The Mississippi', 'The Volga']], ['Which is the longest river in Europe?', 'The Volga', ['The Danube', 'The Rhine', 'The Thames']],
      ['Which is the longest river in Asia?', 'The Yangtze', ['The Ganges', 'The Mekong', 'The Indus']], ['Which river flows through or along ten countries, more than any other?', 'The Danube', ['The Volga', 'The Rhine', 'The Amazon']],
      ['Why is it hard to say whether the Nile or the Amazon is longer?', 'It depends on where you say each river begins', ['Nobody has ever measured either one', 'Both rivers change direction every year', 'The Amazon is underground for half its length']]]);
    return { q: '<p>' + f[0] + '</p>', a: mc([f[1]].concat(f[2]), f[1]), hint: 'Rivers flow downhill, from their source to their mouth.', steps: ['Answer: ' + f[1] + '.', f[0].indexOf('Nile flow') >= 0 ? 'The Nile starts in the highlands of East Africa and flows north; north is not downhill.' : f[0].indexOf('longer') >= 0 ? 'Most lists put the Nile first; some studies that trace the Amazon from a farther source find it longer.' : 'The ' + f[1].replace(/^The /, '') + ' holds that record.'] };
  });

  /* ---------------------------------------------------------- mountains */
  var RANGES = { himalayas: 'Asia', andes: 'South America', rockies: 'North America', alps: 'Europe', urals: 'Europe and Asia', atlas: 'Africa', appalachians: 'North America', greatdividing: 'Australia', pyrenees: 'Europe', caucasus: 'Europe and Asia', drakensberg: 'Africa' };
  var PEAKS = [['Asia', 'Mount Everest', 8849], ['South America', 'Aconcagua', 6961], ['Africa', 'Kilimanjaro', 5895], ['North America', 'Denali (Mount McKinley)', 6190]];
  var MT_BANK = [['The Himalayas hold the highest mountain on Earth.', true, 'Mount Everest, 8,849 m, is in the Himalayas.'], ['The Andes are the longest mountain range on land.', true, 'They run more than 7,000 km along South America.'],
    ['The highest mountains are near the poles because it is cold there.', false, 'Height comes from plates pushing together; Everest is at about 28° N.'], ['The Ural Mountains mark part of the line between Europe and Asia.', true, 'The usual boundary follows the Urals.'],
    ['Old mountain ranges, such as the Appalachians, are usually lower and rounder than young ones.', true, 'They have been worn down for hundreds of millions of years.'], ['Mount Everest is on the border of Nepal and China.', true, 'Its summit is on that border.'],
    ['Kilimanjaro is the highest mountain in Africa.', true, 'It rises 5,895 m, in Tanzania.'], ['The Alps are in South America.', false, 'The Alps are in Europe; the Andes are in South America.'], ['Mountains near the equator can never have snow.', false, 'High peaks are cold: Kilimanjaro, near the equator, has snow and ice on top.']];
  G('worldgeo.world-mountains', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['mark', 'cont', 'peak']) : L === 2 ? R.pick(['mark', 'peak', 'tf', 'cont']) : R.pick(['mark', 'diff', 'all']);
    var ids = Object.keys(RANGES);
    if (shape === 'mark') {
      var pool = L === 1 ? ['himalayas', 'andes', 'rockies', 'alps', 'atlas', 'greatdividing'] : ids, set = [], n = 0;
      while (set.length < 3 && n < 300) { n++; var r = R.pick(pool); if (set.indexOf(r) < 0 && (L > 1 || set.every(function (x) { return RANGES[x] !== RANGES[r]; }))) set.push(r); }
      var t = R.int(0, 2), mark = {}; set.forEach(function (x, i) { mark[x] = LET[i]; });
      return { q: '<p>Which letter marks the <b>' + ML.geog.phys(set[t]).n + '</b>?</p>', viz: { name: 'gg-map', opts: { color: 'plain', features: set, mark: mark, featureLabels: false, quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: letters(3, t), hint: 'On which continent is it?', steps: ['The ' + ML.geog.phys(set[t]).n + ' are in ' + RANGES[set[t]] + '.', 'That is letter ' + LET[t] + '.'] };
    }
    if (shape === 'cont') {
      var r2 = R.pick(ids), c = RANGES[r2], all = ['Asia', 'South America', 'North America', 'Europe', 'Africa', 'Australia', 'Europe and Asia'];
      return { q: '<p>Where are the ' + ML.geog.phys(r2).n + '?</p>', a: mc([c].concat(R.sample(all.filter(function (x) { return x !== c; }), 3)), c), hint: 'Picture the range on a world map.', steps: ['The ' + ML.geog.phys(r2).n + ' are in ' + c + '.'] };
    }
    if (shape === 'peak') {
      var pk = R.pick(PEAKS), rev = L === 2 && R.coin();
      if (rev) return { q: '<p>' + pk[1] + ' (' + fmtN(pk[2]) + ' m) is the highest mountain of which continent?</p>', a: mc(PEAKS.map(function (x) { return x[0]; }), pk[0]), hint: 'Everest: Asia. Aconcagua: the Andes. Kilimanjaro: East Africa. Denali: Alaska.', steps: [pk[1] + ' is the highest point of ' + pk[0] + '.'] };
      return { q: '<p>What is the highest mountain in ' + pk[0] + '?</p>', a: mc(PEAKS.map(function (x) { return x[1]; }), pk[1]), hint: 'Everest: Asia. Aconcagua: the Andes. Kilimanjaro: East Africa. Denali: Alaska.', steps: [pk[1] + ', ' + fmtN(pk[2]) + ' m, is the highest point of ' + pk[0] + '.'] };
    }
    if (shape === 'diff') {
      var two = R.sample(PEAKS, 2), hi = two[0][2] > two[1][2] ? two[0] : two[1], lo = hi === two[0] ? two[1] : two[0];
      return { q: '<p>' + hi[1] + ' is ' + fmtN(hi[2]) + ' m high and ' + lo[1] + ' is ' + fmtN(lo[2]) + ' m. How much higher is ' + hi[1] + '?</p>', a: num(hi[2] - lo[2]), unit: 'm', hint: 'Subtract the smaller height from the larger.', steps: [fmtN(hi[2]) + ' − ' + fmtN(lo[2]) + ' = ' + fmtN(hi[2] - lo[2]) + ' m.'] };
    }
    if (shape === 'tf') return tfItem(R, MT_BANK, 'High mountains come from plates pushing together, not from latitude.');
    return chooseAll(R, MT_BANK, 4, 'High mountains come from plates pushing together, not from latitude.');
  });

  /* ---------------------------------------------------------- deserts */
  var DESERTS = { sahara: ['Africa', 'hot'], gobi: ['Asia', 'cold'], kalahari: ['Africa', 'hot'], rubalkhali: ['Asia', 'hot'], atacama: ['South America', 'cool coastal'], namib: ['Africa', 'coastal'], greatvictoria: ['Australia', 'hot'], thar: ['Asia', 'hot'], sonoran: ['North America', 'hot'], taklimakan: ['Asia', 'cold'] };
  var DES_BANK = [['A desert is any place that gets very little precipitation.', true, 'Dryness, not heat, makes a desert.'], ['Every desert is hot and sandy.', false, 'Antarctica and the Gobi are cold deserts, and most deserts are rock and gravel.'],
    ['Antarctica is the largest desert of all.', true, 'Very little new snow falls there each year.'], ['The Sahara is the largest hot desert.', true, 'It covers about 9.2 million km² of North Africa.'], ['The Atacama is the driest place outside the poles.', true, 'Some parts get almost no rain for years.'],
    ['Many hot deserts lie near 20° to 30° north and south of the equator.', true, 'Dry air sinks there.'], ['The Gobi is a hot desert near the equator.', false, 'The Gobi is a cold desert in Mongolia and China, at about 40° to 45° N.'], ['The Sahara is in South America.', false, 'It is in North Africa.']];
  G('worldgeo.world-deserts', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['mark', 'record', 'rain']) : L === 2 ? R.pick(['mark', 'record', 'cont', 'rain', 'tf']) : R.pick(['mark', 'all', 'rain', 'cont']);
    var ids = Object.keys(DESERTS);
    if (shape === 'mark') {
      var set = [], n = 0; while (set.length < 3 && n < 300) { n++; var d = R.pick(ids); if (set.indexOf(d) < 0 && (L > 1 || set.every(function (x) { return DESERTS[x][0] !== DESERTS[d][0]; }))) set.push(d); }
      var t = R.int(0, 2), mark = {}; set.forEach(function (x, i) { mark[x] = LET[i]; });
      return { q: '<p>Which letter marks the <b>' + ML.geog.phys(set[t]).n + '</b>?</p>', viz: { name: 'gg-map', opts: { color: 'plain', features: set, mark: mark, featureLabels: false, quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: letters(3, t), hint: 'On which continent is it?', steps: ['The ' + ML.geog.phys(set[t]).n + ' is in ' + DESERTS[set[t]][0] + '.', 'That is letter ' + LET[t] + '.'] };
    }
    if (shape === 'record') {
      var r = R.pick([['the largest hot desert', 'The Sahara'], ['the driest place outside the poles', 'The Atacama'], ['the largest desert of all', 'Antarctica'], ['a cold desert in Mongolia and China', 'The Gobi']]);
      return { q: '<p>Which is ' + r[0] + '?</p>', a: mc(['The Sahara', 'The Atacama', 'Antarctica', 'The Gobi'], r[1]), hint: 'Deserts are defined by dryness, so cold places can be deserts too.', steps: [r[1] + ' is ' + r[0] + '.'] };
    }
    if (shape === 'cont') {
      var d2 = R.pick(ids), c = DESERTS[d2][0];
      return { q: '<p>On which continent is the ' + ML.geog.phys(d2).n + '?</p>', a: mc([c].concat(R.sample(['Africa', 'Asia', 'South America', 'North America', 'Australia'].filter(function (x) { return x !== c; }), 3)), c), hint: 'Picture it on a world map.', steps: ['The ' + ML.geog.phys(d2).n + ' is in ' + c + '.'] };
    }
    if (shape === 'rain') {
      var mm = R.pick([20, 50, 90, 120, 180, 220, 300, 400, 600, 900, 1500]), yes = mm < 250;
      return { q: '<p>A place gets about ' + fmtN(mm) + ' mm of precipitation a year. Using the usual rule (less than 250 mm a year), is it a desert?</p>', a: { t: 'tf', v: yes }, hint: 'Compare ' + mm + ' mm with 250 mm.',
        steps: [fmtN(mm) + ' mm is ' + (yes ? 'less' : 'more') + ' than 250 mm.', yes ? 'So it is dry enough to be a desert, hot or cold.' : 'So it is too wet to be a desert by this rule.'] };
    }
    if (shape === 'tf') return tfItem(R, DES_BANK, 'A desert is defined by dryness, not heat.');
    return chooseAll(R, DES_BANK, 4, 'A desert is defined by dryness, not heat.');
  });

  /* ---------------------------------------------------------- lakes and waterfalls */
  var WATERS = [['Caspian Sea', 51, 42, 'between Europe and Asia', 'lake'], ['Lake Baikal', 108.2, 53.5, 'in Russia (Siberia)', 'lake'], ['Lake Superior', -87.5, 47.7, 'in the United States and Canada', 'lake'],
    ['Lake Victoria', 33, -1, 'in Uganda, Kenya and Tanzania', 'lake'], ['Lake Titicaca', -69.4, -15.8, 'in Peru and Bolivia', 'lake'], ['Lake Tanganyika', 29.6, -6.2, 'in East Africa', 'lake'],
    ['Angel Falls', -62.54, 5.97, 'in Venezuela', 'falls'], ['Victoria Falls', 25.86, -17.92, 'on the border of Zambia and Zimbabwe', 'falls'], ['Iguazu Falls', -54.44, -25.69, 'on the border of Argentina and Brazil', 'falls'], ['Niagara Falls', -79.07, 43.08, 'on the border of the United States and Canada', 'falls']];
  var RECORDS = [['the largest lake by area', 'The Caspian Sea'], ['the deepest lake', 'Lake Baikal'], ['the largest freshwater lake by area', 'Lake Superior'], ['the tallest waterfall', 'Angel Falls'], ['the largest lake in Africa', 'Lake Victoria'], ['the lake that holds the most fresh water', 'Lake Baikal']];
  G('worldgeo.lakes-falls', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['record', 'where']) : L === 2 ? R.pick(['record', 'mark', 'where', 'caspian']) : R.pick(['mark', 'ratio', 'record']);
    if (shape === 'record') {
      var r = R.pick(RECORDS), pool = ['The Caspian Sea', 'Lake Baikal', 'Lake Superior', 'Lake Victoria', 'Angel Falls', 'Niagara Falls', 'Lake Titicaca'];
      if (r[1] === 'Angel Falls') pool = ['Angel Falls', 'Niagara Falls', 'Victoria Falls', 'Iguazu Falls'];
      return { q: '<p>Which is ' + r[0] + '?</p>', a: mc([r[1]].concat(R.sample(pool.filter(function (x) { return x !== r[1]; }), 3)), r[1]),
        hint: 'Caspian: largest. Baikal: deepest. Superior: largest freshwater by area. Angel Falls: tallest.', steps: [r[1] + ' is ' + r[0] + '.', 'The Caspian Sea is largest (about 371,000 km²); Baikal is deepest (1,642 m); Superior is the largest freshwater lake by area (about 82,100 km²); Angel Falls drops 979 m.'] };
    }
    if (shape === 'where') {
      var w = R.pick(WATERS), wr = R.sample(WATERS.filter(function (x) { return x[3] !== w[3]; }), 3).map(function (x) { return cap1(x[3]); });
      return { q: '<p>Where is ' + w[0] + '?</p>', a: mc([cap1(w[3])].concat(wr), cap1(w[3])), hint: 'Think of the continent first.', steps: [w[0] + ' is ' + w[3] + '.'] };
    }
    if (shape === 'mark') {
      var set = [], n = 0; while (set.length < 3 && n < 300) { n++; var x = R.pick(WATERS); if (set.every(function (y) { return y[0] !== x[0] && Math.abs(y[1] - x[1]) + Math.abs(y[2] - x[2]) >= 20; })) set.push(x); }
      var t = R.int(0, 2);
      var wn = function (x) { return /Sea$/.test(x) ? 'the ' + x : x; };
      return { q: '<p>Which letter marks <b>' + wn(set[t][0]) + '</b>?</p>', viz: { name: 'gg-map', opts: { color: 'plain', points: set.map(function (p, i) { return { lon: p[1], lat: p[2], mark: LET[i] }; }), quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: letters(3, t), hint: 'Which continent is it on?', steps: [cap1(wn(set[t][0])) + ' is ' + set[t][3] + ': letter ' + LET[t] + '.'] };
    }
    if (shape === 'caspian') {
      var it = R.pick([['True or false? The Caspian Sea is part of the ocean.', false, 'Land surrounds it; it is a salty lake.'], ['True or false? Lake Baikal holds more water than Lake Superior, even though its surface is smaller.', true, 'Baikal is much deeper: about 23,600 km³ against about 12,100 km³.'],
        ['True or false? The largest lake by area is a freshwater lake.', false, 'The largest, the Caspian Sea, is salty.'], ['True or false? Angel Falls is in Africa.', false, 'Angel Falls is in Venezuela, South America.']]);
      return { q: '<p>' + it[0].replace('True or false? ', 'True or false? ') + '</p>', a: { t: 'tf', v: it[1] }, hint: 'Think about the records: Caspian, Baikal, Superior, Angel Falls.', steps: [(it[1] ? 'True. ' : 'False. ') + it[2]] };
    }
    var pr = R.pick([['the Caspian Sea', 371000, 'Lake Superior', 82100], ['Lake Superior', 82100, 'Lake Baikal', 31700], ['the Caspian Sea', 371000, 'Lake Baikal', 31700]]);
    var rat = Math.round(pr[1] / pr[3] * 10) / 10;
    return { q: '<p>' + cap1(pr[0]) + ' covers about ' + fmtN(pr[1]) + ' km² and ' + pr[2] + ' about ' + fmtN(pr[3]) + ' km². About how many times larger is the surface of ' + pr[0] + '? Round to one decimal place.</p>',
      a: num(rat, 0.03), hint: 'Divide the larger area by the smaller.', steps: [fmtN(pr[1]) + ' ÷ ' + fmtN(pr[3]) + ' ≈ ' + rat + '.'] };
  });

  /* ---------------------------------------------------------- islands and peninsulas */
  var ISL = [['Greenland', 2166], ['New Guinea', 786], ['Borneo', 743], ['Madagascar', 587], ['Baffin Island', 507], ['Sumatra', 473], ['Honshu', 228], ['Great Britain', 219]];
  var PEN = { Iberian: [['ESP', 'PRT'], 'EU', 'Spain and Portugal'], Italian: [['ITA'], 'EU', 'Italy'], Scandinavian: [['NOR', 'SWE'], 'EU', 'Norway and Sweden'], Korean: [['PRK', 'KOR'], 'eas', 'North Korea and South Korea'], Arabian: [['SAU', 'YEM', 'OMN', 'ARE', 'QAT', 'KWT'], 'was', 'Saudi Arabia and its neighbors'] };
  G('worldgeo.islands-peninsulas', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['largest', 'kind', 'pen']) : L === 2 ? R.pick(['pen', 'bigger', 'mark', 'kind']) : R.pick(['mark', 'bigger', 'australia', 'pen']);
    if (shape === 'largest') {
      return { q: '<p>Which is the largest island in the world?</p>', a: mc(['Greenland', 'Australia', 'Madagascar', 'Great Britain'], 'Greenland'), hint: 'Australia counts as a continent, not an island.', steps: ['Australia is a continent, so it is not counted as an island.', 'The largest island is Greenland, about 2.17 million km².'] };
    }
    if (shape === 'australia') {
      return { q: '<p>Australia is surrounded by water and is bigger than Greenland. Why is Greenland called the largest island?</p>', a: mc(['Australia is counted as a continent', 'Greenland is really bigger than Australia', 'Australia is a peninsula', 'Islands must be cold'], 'Australia is counted as a continent'),
        hint: 'What else do we call Australia?', steps: ['Geographers count Australia as a continent, on its own continental plate.', 'So the largest island that is not a continent is Greenland.', 'Australia (about 7.7 million km²) is really about 3.5 times bigger than Greenland.'] };
    }
    if (shape === 'kind') {
      var f = R.pick(ML.geog.PHYS.filter(function (p) { return p.k === 'island' || p.k === 'peninsula'; }));
      var the = /Peninsula|subcontinent|^Horn/.test(f.n) ? 'the ' : '';
      return { q: '<p>Is ' + the + f.n + ' an island or a peninsula?</p>', a: mc(['An island', 'A peninsula'], f.k === 'island' ? 'An island' : 'A peninsula'),
        hint: 'Water all around: island. Water on three sides, joined to land: peninsula.', steps: [cap1(the + f.n) + (f.k === 'island' ? ' has water all around it.' : ' is joined to the mainland on one side and has water on the others.'), 'So it is ' + (f.k === 'island' ? 'an island.' : 'a peninsula.')] };
    }
    if (shape === 'pen') {
      var k = R.pick(Object.keys(PEN)), p = PEN[k];
      return { q: '<p>Which peninsula is highlighted?</p>', viz: { name: 'gg-map', opts: { region: p[1], highlight: p[0], quiet: true, interactive: false, color: 'plain', dots: false, disputedNote: false } },
        a: mc(Object.keys(PEN).filter(function (x) { return x !== k; }).slice(0, 3).concat([k]).map(function (x) { return 'The ' + x + ' Peninsula'; }), 'The ' + k + ' Peninsula'), hint: 'Which countries are highlighted?',
        steps: ['The highlighted land is ' + p[2] + '.', 'That is the ' + k + ' Peninsula.'] };
    }
    if (shape === 'bigger') {
      var two = R.sample(ISL, 2), b = two[0][1] > two[1][1] ? two[0] : two[1];
      return { q: '<p>Which island is larger: ' + two[0][0] + ' or ' + two[1][0] + '?</p>', a: mc([two[0][0], two[1][0]], b[0]), hint: 'Greenland, New Guinea, Borneo, Madagascar, Baffin, Sumatra, Honshu, Great Britain.',
        steps: [two[0][0] + ': about ' + fmtN(two[0][1]) + ' thousand km². ' + two[1][0] + ': about ' + fmtN(two[1][1]) + ' thousand km².', b[0] + ' is larger.'] };
    }
    var pool = ML.geog.PHYS.filter(function (x) { return x.k === 'island' || x.k === 'peninsula'; }), set = [], n = 0;
    while (set.length < 3 && n < 300) { n++; var x = R.pick(pool); if (set.every(function (y) { return y.id !== x.id && y.cont !== x.cont; })) set.push(x); }
    var t = R.int(0, 2), mark = {}; set.forEach(function (y, i) { mark[y.id] = LET[i]; });
    return { q: '<p>Which letter marks ' + (set[t].k === 'island' ? '' : 'the ') + '<b>' + set[t].n + '</b>?</p>', viz: { name: 'gg-map', opts: { color: 'plain', features: set.map(function (y) { return y.id; }), mark: mark, featureLabels: false, quiet: true, interactive: false, dots: false, disputedNote: false } },
      a: letters(3, t), hint: 'Which continent is it next to?', steps: [set[t].n + ' is ' + (set[t].k === 'island' ? 'an island' : 'a peninsula') + ' of ' + (ML.geog.CONT[set[t].cont] || set[t].cont) + ': letter ' + LET[t] + '.'] };
  });

  /* ---------------------------------------------------------- straits and canals */
  var STRAITS = [['the Strait of Gibraltar', -5.6, 35.95, 'the Atlantic Ocean and the Mediterranean Sea', 'Spain and Morocco'], ['the Bosporus', 29.05, 41.1, 'the Black Sea and the Sea of Marmara', 'Europe and Asia, in Istanbul'],
    ['the Strait of Hormuz', 56.4, 26.6, 'the Persian Gulf and the Gulf of Oman', 'Iran and Oman'], ['the Strait of Malacca', 100.5, 3.2, 'the Andaman Sea (Indian Ocean) and the South China Sea', 'the Malay Peninsula and Sumatra'],
    ['the Bering Strait', -168.9, 65.8, 'the Arctic Ocean and the Bering Sea', 'Russia (Asia) and Alaska (North America)'], ['the Panama Canal', -79.7, 9.1, 'the Caribbean Sea (Atlantic) and the Pacific Ocean', 'North and South America, across the Isthmus of Panama'],
    ['the Suez Canal', 32.35, 30.6, 'the Mediterranean Sea and the Red Sea', 'Africa and Asia, across the Isthmus of Suez']];
  G('worldgeo.straits-canals', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['joins', 'word']) : L === 2 ? R.pick(['joins', 'between', 'mark', 'word']) : R.pick(['mark', 'between', 'years', 'joins']);
    if (shape === 'joins') {
      var s = R.pick(STRAITS), wr = R.sample(STRAITS.filter(function (x) { return x !== s; }), 3).map(function (x) { return cap1(x[3]); });
      return { q: '<p>Which two bodies of water does ' + s[0] + ' join?</p>', a: mc([cap1(s[3])].concat(wr), cap1(s[3])), hint: 'Picture where it is on the map, then look at the water on each side.', steps: [cap1(s[0]) + ' lies between ' + s[4] + '.', 'It joins ' + s[3] + '.'] };
    }
    if (shape === 'between') {
      var s2 = R.pick(STRAITS);
      return { q: '<p>Which passage lies between ' + s2[4] + '?</p>', a: mc(R.sample(STRAITS.filter(function (x) { return x !== s2; }), 3).concat([s2]).map(function (x) { return cap1(x[0]); }), cap1(s2[0])), hint: 'Picture the two lands on a map.', steps: [cap1(s2[0]) + ' lies between ' + s2[4] + ', joining ' + s2[3] + '.'] };
    }
    if (shape === 'mark') {
      var set = [], n = 0; while (set.length < 3 && n < 300) { n++; var x = R.pick(STRAITS); if (set.every(function (y) { return y !== x && Math.abs(y[1] - x[1]) + Math.abs(y[2] - x[2]) >= 20; })) set.push(x); }
      var t = R.int(0, 2);
      return { q: '<p>Which letter marks <b>' + set[t][0] + '</b>?</p>', viz: { name: 'gg-map', opts: { color: 'plain', points: set.map(function (p, i) { return { lon: p[1], lat: p[2], mark: LET[i] }; }), quiet: true, interactive: false, dots: false, disputedNote: false } },
        a: letters(3, t), hint: 'Which lands is it between?', steps: [cap1(set[t][0]) + ' lies between ' + set[t][4] + ': letter ' + LET[t] + '.'] };
    }
    if (shape === 'years') {
      var w = R.coin();
      if (w) return { q: '<p>The Suez Canal opened in 1869 and the Panama Canal in 1914. How many years apart did they open?</p>', a: num(45), unit: 'years', hint: 'Subtract.', steps: ['1914 − 1869 = 45 years.'] };
      return { q: '<p>Which canal opened first?</p>', a: mc(['The Suez Canal (1869)', 'The Panama Canal (1914)'], 'The Suez Canal (1869)'), hint: 'Compare the years.', steps: ['The Suez Canal opened in 1869; the Panama Canal in 1914.'] };
    }
    var it = R.pick([['A narrow passage of water joining two larger bodies of water', 'A strait'], ['A narrow strip of land joining two larger landmasses', 'An isthmus'], ['A waterway dug by people', 'A canal'], ['Water on three sides of a piece of land, joined to the mainland', 'A peninsula']]);
    return { q: '<p>What is the word for this: ' + it[0].charAt(0).toLowerCase() + it[0].slice(1) + '?</p>', a: mc(['A strait', 'An isthmus', 'A canal', 'A peninsula'], it[1]), hint: 'A strait is water; an isthmus is land; a canal is made by people.',
      steps: ['A strait is narrow water; an isthmus is narrow land; a canal is a waterway dug by people, often across an isthmus.', 'So the answer is ' + it[1].toLowerCase() + '.'] };
  });

  /* ================================================================== unit 5: climate and biomes */
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var CONTROLS = ['Latitude', 'Elevation', 'Nearness to the ocean', 'Ocean currents', 'Winds', 'Mountains (a rain shadow)'];
  var CTRL_CASES = [
    ['Quito, Ecuador, is almost on the equator but is mild all year, because it sits 2,850 m up in the Andes.', 1], ['Snow stays all year on top of Kilimanjaro, only about 3° from the equator.', 1],
    ['Singapore, near the equator, is hot all year, while Oslo, Norway, far to the north, is cool.', 0], ['Places near the poles get low, slanting sunlight, so they stay cold.', 0],
    ['A coastal city has cooler summers and milder winters than a city far inland at the same latitude.', 2], ['Winters in the middle of Russia are much colder than winters on the coast of Norway at the same latitude.', 2],
    ['Western Europe has milder winters than eastern Canada at the same latitude, thanks to the warm North Atlantic Current.', 3], ['Lima, Peru, on the coast, is cool and dry, because a cold current flows north along the shore.', 3],
    ['Summer winds blowing in from the Indian Ocean bring heavy rains to India.', 4], ['Dry winds blowing out from the Sahara bring dusty, dry months to West Africa.', 4],
    ['The Atacama Desert is very dry partly because the Andes block moist air coming from the east.', 5], ['The west side of the Cascade Mountains is rainy, while the east side is dry.', 5]];
  G('worldgeo.climate-controls', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['case', 'lapse', 'coast']) : L === 2 ? R.pick(['case', 'lapse', 'shadow', 'coast']) : R.pick(['lapse', 'graph', 'case', 'shadow']);
    if (shape === 'case') {
      var c = R.pick(CTRL_CASES), right = CONTROLS[c[1]];
      return { q: '<p>Which climate control explains this? ' + c[0] + '</p>', a: mc([right].concat(R.sample(CONTROLS.filter(function (x) { return x !== right; }), 3)), right),
        hint: 'Latitude, elevation, the ocean, currents, winds or mountains: which one is the story about?', steps: ['The key fact here is about ' + right.toLowerCase() + '.', 'So the control is ' + right.toLowerCase() + '.'] };
    }
    if (shape === 'lapse') {
      var T0 = R.int(L === 1 ? 24 : 18, 32), h = L === 1 ? R.pick([1000, 2000, 3000]) : R.pick([1500, 2000, 2500, 3000, 3500, 4000]), drop = 6.5 * h / 1000, T = Math.round((T0 - drop) * 100) / 100;
      return { q: '<p>A town at sea level has an average temperature of ' + T0 + ' °C. Air cools about 6.5 °C for every 1,000 m you climb. About what is the average temperature in a village ' + fmtN(h) + ' m higher nearby?</p>',
        a: { t: 'num', v: String(T), tol: 0.6 }, unit: '°C', hint: 'Find how many thousands of meters higher it is, then multiply by 6.5.',
        steps: [fmtN(h) + ' m is ' + (h / 1000) + ' thousand meters.', (h / 1000) + ' × 6.5 = ' + drop + ' °C cooler.', T0 + ' − ' + drop + ' = ' + T + ' °C.'] };
    }
    if (shape === 'coast') {
      var w = R.pick([['has colder winters', 'The inland city'], ['has milder winters', 'The coastal city'], ['has the bigger difference between summer and winter', 'The inland city'], ['has cooler summers', 'The coastal city']]);
      return { q: '<p>Two cities are at the same latitude. One is on the ocean coast, with winds from the sea; the other is far inland. Which city ' + w[0] + '?</p>', a: mc(['The coastal city', 'The inland city', 'They are the same'], w[1]),
        hint: 'Water heats up and cools down slowly.', steps: ['The ocean warms slowly in summer and cools slowly in winter, so it keeps coasts mild.', 'Inland, nothing evens out the temperature: hotter summers, colder winters.', 'So: ' + w[1].toLowerCase() + '.'] };
    }
    if (shape === 'shadow') {
      var s = R.pick([['the side the wind blows toward (the windward side)', 'Wetter'], ['the far side, away from the wind (the leeward side)', 'Drier']]);
      return { q: '<p>Moist wind from the ocean blows against a tall mountain range. Compared with the other side, is ' + s[0] + ' wetter or drier?</p>', a: mc(['Wetter', 'Drier'], s[1]), hint: 'Air rises over the mountains, cools and drops its rain.',
        steps: ['Air rising up the windward side cools, and its moisture falls as rain or snow.', 'The air that crosses the top has lost its moisture, so the far side is dry: a rain shadow.', 'So the answer is ' + s[1].toLowerCase() + '.'] };
    }
    var pair = R.shuffle(['Cfb', R.pick(['Dfb', 'Dfa'])]), ci = pair.indexOf('Cfb');
    return { q: '<p>These climographs are for two cities at about the same latitude. One is on a west coast, the other far inland. Which is the coastal city?</p>', viz: { name: 'gg-climate', opts: { compare: pair, quiet: true, interactive: false } }, a: letters(2, ci),
      hint: 'Which line goes up and down less over the year?', steps: ['Climograph ' + LET[ci] + ' has mild winters (above 0 °C) and cool summers: a small yearly range.', 'Climograph ' + LET[1 - ci] + ' has freezing winters and warm summers: a big range.', 'The ocean evens out temperatures, so ' + LET[ci] + ' is the coastal city.'] };
  });

  /* ---------------------------------------------------------- climate zones */
  var GN = { A: 'Tropical (A)', B: 'Dry (B)', C: 'Temperate (C)', D: 'Continental (D)', E: 'Polar (E)' };
  var ZDESC = [['Warm every month, with lots of rain', 'A'], ['Less rain than the heat evaporates; deserts and steppes', 'B'], ['Mild winters and warm or hot summers, often near coasts', 'C'], ['Cold, snowy winters and warm summers, deep inside big northern continents', 'D'], ['Cold all year; even the warmest month is below 10 °C', 'E']];
  G('worldgeo.climate-zones', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['desc', 'graph']) : L === 2 ? R.pick(['graph', 'rule', 'desc', 'where']) : R.pick(['rule', 'graph', 'where']);
    var GR = ['A', 'B', 'C', 'D', 'E'];
    if (shape === 'desc') {
      var d = R.pick(ZDESC);
      return { q: '<p>Which climate group is this? ' + d[0] + '.</p>', a: mc(GR.map(function (g) { return GN[g]; }), GN[d[1]]), hint: 'A tropical, B dry, C temperate, D continental, E polar.', steps: ['That describes the ' + GN[d[1]].toLowerCase() + ' group.'] };
    }
    if (shape === 'graph') {
      var keys = Object.keys(ML.geog.CLIMATES), k = R.pick(keys), g = ML.geog.CLIMATES[k].g, hemi = L === 3 && R.coin() ? 'S' : 'N';
      return { q: '<p>Which climate group does this climograph show?</p>', viz: { name: 'gg-climate', opts: { type: k, hemi: hemi, quiet: true, interactive: false } }, a: mc(GR.map(function (x) { return GN[x]; }), GN[g]),
        hint: 'Check the coldest month, the warmest month, and how much rain falls.',
        steps: [g === 'A' ? 'Every month is above 18 °C.' : g === 'B' ? 'The bars are tiny: very little rain for the heat.' : g === 'C' ? 'The coldest month is above 0 °C, and summers are warm.' : g === 'D' ? 'Winters are below 0 °C, and the warmest month is above 10 °C.' : 'Even the warmest month is below 10 °C.', 'So it is ' + GN[g].charAt(0).toLowerCase() + GN[g].slice(1) + ': ' + (/^[aeiou]/i.test(ML.geog.CLIMATES[k].n) ? 'an ' : 'a ') + ML.geog.CLIMATES[k].n + ' climate.'] };
    }
    if (shape === 'rule') {
      var g2 = R.pick(['A', 'C', 'D', 'E']), cold, warm;
      if (g2 === 'A') { cold = R.int(19, 26); warm = cold + R.int(1, 4); } else if (g2 === 'C') { cold = R.int(2, 12); warm = R.int(16, 28); } else if (g2 === 'D') { cold = -R.int(4, 25); warm = R.int(14, 24); } else { warm = R.int(-10, 8); cold = warm - R.int(15, 30); }
      return { q: '<p>A place has rain or snow in every season. Its coldest month averages ' + String(cold).replace('-', '−') + ' °C and its warmest month ' + String(warm).replace('-', '−') + ' °C. Which climate group is it?</p>', a: mc(GR.filter(function (x) { return x !== 'B'; }).map(function (x) { return GN[x]; }), GN[g2]),
        hint: 'Warmest below 10 °C: polar. Coldest 18 °C or more: tropical. Otherwise compare the coldest month with 0 °C.',
        steps: ['It is wet enough not to be dry (B).', warm < 10 ? 'The warmest month is below 10 °C, so it is polar (E).' : cold >= 18 ? 'Even the coldest month is 18 °C or more, so it is tropical (A).' : cold > 0 ? 'The coldest month is above 0 °C, so it is temperate (C).' : 'The coldest month is below 0 °C and the warmest above 10 °C, so it is continental (D).'] };
    }
    var w = R.pick([['Where are most hot deserts found?', 'Near 20° to 30° north and south of the equator', ['Right on the equator', 'Near the Arctic Circle', 'Only on islands']], ['Why are there almost no continental (D) climates in the Southern Hemisphere?', 'There is very little land at those latitudes there', ['It is always summer there', 'The Southern Hemisphere has no winter', 'The equator blocks cold air']],
      ['Why are west coasts in the middle latitudes often milder than east coasts?', 'Winds blow from the ocean onto west coasts there', ['West coasts are closer to the equator', 'West coasts are higher', 'The Sun shines longer in the west']]]);
    return { q: '<p>' + w[0] + '</p>', a: mc([w[1]].concat(w[2]), w[1]), hint: 'Climate zones are bent by winds, oceans and land.', steps: ['Answer: ' + w[1] + '.', 'Climate zones are not neat bands: winds, oceans, land and mountains bend them.'] };
  });

  /* ---------------------------------------------------------- reading a climograph */
  function argUnique(a, f) { var best = f(a[0], a[0]) ? 0 : 0, i, n = 0; for (i = 1; i < a.length; i++) if (f(a[i], a[best])) best = i; for (i = 0; i < a.length; i++) if (a[i] === a[best]) n++; return n === 1 ? best : -1; }
  G('worldgeo.climographs', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['warm', 'wet']) : L === 2 ? R.pick(['warm', 'wet', 'hemi', 'temp']) : R.pick(['hemi', 'temp', 'wet', 'dry']);
    var keys = Object.keys(ML.geog.CLIMATES), k, c, hemi, idx, n = 0, want = shape === 'warm' || shape === 'temp' ? 't' : 'p';
    do { k = R.pick(keys); hemi = L >= 2 && R.coin() ? 'S' : 'N'; c = ML.geog.climate(k, hemi); idx = shape === 'dry' ? argUnique(c.p, function (x, y) { return x < y; }) : argUnique(c[want], function (x, y) { return x > y; }); n++; }
    while ((idx < 0 || (shape === 'hemi' && (Math.max.apply(null, c.t) - Math.min.apply(null, c.t) < 8)) || (shape === 'dry' && Math.min.apply(null, c.p) > 30)) && n < 300);
    var viz = { name: 'gg-climate', opts: { type: k, hemi: hemi, quiet: true, interactive: false } };
    if (shape === 'warm' || shape === 'wet' || shape === 'dry') {
      var right = MONTHS[idx], wr = R.sample(MONTHS.filter(function (m, i) { return Math.abs(i - idx) >= 2 && Math.abs(i - idx) <= 10; }), 3);
      var word = shape === 'warm' ? 'warmest' : shape === 'wet' ? 'wettest' : 'driest';
      return { q: '<p>Which month is the <b>' + word + '</b> on this climograph?</p>', viz: viz, a: mc([right].concat(wr), right),
        hint: shape === 'warm' ? 'Find the highest point of the line.' : shape === 'wet' ? 'Find the tallest bar.' : 'Find the shortest bar.',
        steps: [shape === 'warm' ? 'The temperature line is highest in ' + right + ', at about ' + Math.round(c.t[idx]) + ' °C.' : 'The ' + (shape === 'wet' ? 'tallest' : 'shortest') + ' bar is ' + right + ', with about ' + c.p[idx] + ' mm.', 'Read the line on the °C axis (left) and the bars on the mm axis (right).'] };
    }
    if (shape === 'hemi') {
      var hot = argUnique(c.t, function (x, y) { return x > y; }), isS = hemi === 'S';
      return { q: '<p>Is this place in the Northern or the Southern Hemisphere?</p>', viz: viz, a: mc(['Northern Hemisphere', 'Southern Hemisphere'], isS ? 'Southern Hemisphere' : 'Northern Hemisphere'),
        hint: 'When is summer? June to August is summer in the north; December to February in the south.', steps: ['The warmest months are around ' + MONTHS[hot] + '.', isS ? 'Summer in December to February means the Southern Hemisphere.' : 'Summer in June to August means the Northern Hemisphere.'] };
    }
    var tmax = Math.round(c.t[idx]), base = Math.round(tmax / 5) * 5;
    var ch = [base, base + 10, base - 10, base + 20].map(function (v) { return 'About ' + String(v).replace('-', '−') + ' °C'; });
    return { q: '<p>About how warm is the warmest month on this climograph?</p>', viz: viz, a: mc(ch, ch[0]), hint: 'Find the top of the line, then read across to the °C axis on the left, not the mm axis.',
      steps: ['The highest point of the line is in ' + MONTHS[idx] + '.', 'Reading across to the left axis gives about ' + tmax + ' °C, closest to ' + String(base).replace('-', '−') + ' °C.'] };
  });

  /* ---------------------------------------------------------- biomes */
  var BK = ['rainforest', 'savanna', 'desert', 'grassland', 'deciduous', 'shrubland', 'taiga', 'tundra'];
  var BWHERE = { rainforest: 'the Amazon and Congo basins', savanna: 'East Africa and northern Australia', desert: 'the Sahara and Arabia', grassland: 'the Great Plains and the Pampas', deciduous: 'the eastern United States and western Europe', shrubland: 'the lands around the Mediterranean and southern California', taiga: 'across Canada and Russia, south of the tundra', tundra: 'Arctic coasts of Canada, Alaska and Russia' };
  var BIO_BANK = [['A biome is defined by its climate and plants.', true, 'Biomes are large regions with a similar climate and plant life.'], ['One biome can stretch across many countries and continents.', true, 'The taiga runs across North America, Europe and Asia.'],
    ['A biome is the same thing as a country.', false, 'Biomes ignore borders; one country can hold several biomes.'], ['The tundra has no trees.', true, 'It is too cold, with frozen ground, for trees.'],
    ['The taiga is a forest of mostly conifers such as spruce and fir.', true, 'Conifers survive long cold winters.'], ['A savanna is grassland with scattered trees and a long dry season.', true, 'That is a savanna.'],
    ['Deserts in Africa and the Americas have similar plants because the plants are close relatives.', false, 'The plants are often unrelated; the same dry climate led to similar solutions.'], ['A biome is the home of just one kind of animal.', false, 'A biome holds many plants and animals.']];
  function bn(k) { return ML.geog.BIOMES[k].n; }
  G('worldgeo.biomes', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['scene', 'desc']) : L === 2 ? R.pick(['scene', 'desc', 'where', 'tf']) : R.pick(['where', 'desc', 'all']);
    if (shape === 'scene' || shape === 'desc') {
      var k = R.pick(BK), B = ML.geog.BIOMES[k], wr = R.sample(BK.filter(function (x) { return x !== k; }), 3).map(bn), what = R.pick(['plants', 'animals', 'climate']);
      if (shape === 'scene') return { q: '<p>Which biome does this picture show?</p>', viz: { name: 'gg-biome', opts: { biome: k, quiet: true, interactive: false } }, a: mc([B.n].concat(wr).map(cap1), cap1(B.n)),
        hint: 'Look at the plants: tall trees, scattered trees, grass, cactuses, conifers or low moss?', steps: ['The picture shows ' + B.plants + '.', 'That is the ' + B.n + '.'] };
      return { q: '<p>Which biome has this ' + (what === 'climate' ? 'climate' : what) + ': ' + B[what] + '?</p>', a: mc([B.n].concat(wr).map(cap1), cap1(B.n)), hint: 'Think about which climate those ' + (what === 'climate' ? 'conditions' : what) + ' need.',
        steps: ['The ' + B.n + ': climate ' + B.climate + '; plants: ' + B.plants + '; animals: ' + B.animals + '.'] };
    }
    if (shape === 'where') {
      var k2 = R.pick(BK), wr2 = R.sample(BK.filter(function (x) { return x !== k2; }), 3).map(bn);
      return { q: '<p>Which biome covers much of ' + BWHERE[k2] + '?</p>', a: mc([bn(k2)].concat(wr2).map(cap1), cap1(bn(k2))), hint: 'Think about the climate there: hot or cold, wet or dry?', steps: ['Much of ' + BWHERE[k2] + ' is ' + bn(k2) + '.'] };
    }
    if (shape === 'tf') return tfItem(R, BIO_BANK, 'A biome is a large region with a similar climate, plants and animals.');
    return chooseAll(R, BIO_BANK, 4, 'A biome is a large region with a similar climate, plants and animals.');
  });

  /* ---------------------------------------------------------- matching biomes and climates */
  var CLIM_BIOME = { Af: 'rainforest', Aw: 'savanna', BWh: 'desert', Cfa: 'deciduous', Dfc: 'taiga', ET: 'tundra' };
  function steadyBiome(T, P) { // the same biome a little way around the point, so the answer is clear
    var b = ML.geog.biomeOf(T, P), d = [[0, 0], [2, 0], [-2, 0], [0, 12], [0, -12], [2, 12], [-2, -12]];
    for (var i = 0; i < d.length; i++) if (ML.geog.biomeOf(T + d[i][0], Math.max(1, P + d[i][1])) !== b) return null;
    if (P > 60 + (T + 20) * 12 - 20) return null; // inside the chart's triangle of real climates
    return b;
  }
  G('worldgeo.biome-climate', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['numbers', 'chart']) : L === 2 ? R.pick(['chart', 'graph', 'numbers']) : R.pick(['graph', 'chart', 'trap']);
    if (shape === 'numbers' || shape === 'chart' || shape === 'trap') {
      var T, P, b = null, n = 0;
      if (shape === 'trap') { T = R.int(22, 30); P = R.pick([5, 10, 15]); b = 'desert'; }
      else do { T = R.int(-12, 28); P = R.int(1, 40) * 10; b = steadyBiome(T, P); n++; } while ((!b || ['rainforest', 'savanna', 'desert', 'grassland', 'deciduous', 'taiga', 'tundra'].indexOf(b) < 0 || (shape === 'trap' && !(T >= 20 && b === 'desert'))) && n < 500);
      var right = cap1(bn(b)), others = ['rainforest', 'savanna', 'desert', 'grassland', 'deciduous', 'taiga', 'tundra'].filter(function (x) { return x !== b; });
      var wr = shape === 'trap' ? ['rainforest', 'savanna', 'deciduous'].map(bn) : R.sample(others, 3).map(bn);
      var q = 'A place has a yearly average temperature of ' + String(T).replace('-', '−') + ' °C and gets ' + P + ' cm of precipitation a year.';
      var o = { q: '<p>' + q + ' Which biome is most likely there?' + (shape === 'chart' ? ' The point on the chart shows it.' : '') + '</p>', a: mc([right].concat(wr.map(cap1)), right),
        hint: 'Use both numbers: first hot or cold, then wet or dry.', steps: [T >= 20 ? 'It is hot.' : T >= 3 ? 'It is mild or cool.' : T >= -5 ? 'It is cold.' : 'It is very cold.', P < 25 ? 'Under 25 cm of precipitation is very dry.' : P >= 250 ? 'Over 250 cm is very wet.' : 'The precipitation is in between: ' + P + ' cm.', 'On the biome chart that is ' + bn(b) + '.'] };
      if (shape === 'chart') o.viz = { name: 'gg-biome', opts: { point: [T, P], quiet: true, interactive: false } };
      return o;
    }
    var k = R.pick(Object.keys(CLIM_BIOME)), bb = CLIM_BIOME[k];
    return { q: '<p>Which biome would you expect in this climate?</p>', viz: { name: 'gg-climate', opts: { type: k, quiet: true, interactive: false } },
      a: mc([cap1(bn(bb))].concat(R.sample(BK.filter(function (x) { return x !== bb && x !== 'shrubland'; }), 3).map(function (x) { return cap1(bn(x)); })), cap1(bn(bb))),
      hint: 'Read both the line (temperature) and the bars (rain).', steps: ['This is ' + (/^[aeiou]/i.test(ML.geog.CLIMATES[k].n) ? 'an ' : 'a ') + ML.geog.CLIMATES[k].n + ' climate.', 'Its biome is the ' + bn(bb) + '.'] };
  });

  /* ================================================================== unit 6: countries of the world */
  var UNCAT = { member: 'A UN member state', observer: 'A UN observer state', other: 'Not on the UN list of members or observers' };
  G('worldgeo.how-many-countries', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['count', 'record']) : L === 2 ? R.pick(['count', 'observer', 'status', 'map']) : R.pick(['status', 'map', 'why', 'observer']);
    var g = ML.geog;
    if (shape === 'count') {
      var c = R.pick([['How many member states does the United Nations have?', '193', ['195', '50', '200']], ['How many UN observer states are there?', '2', ['0', '5', '193']], ['This course lists the UN member states plus the UN observer states. How many countries is that?', '195', ['193', '197', '200']]]);
      return { q: '<p>' + c[0] + '</p>', a: mc([c[1]].concat(c[2]), c[1]), hint: '193 members, plus 2 observer states.', steps: ['The UN has 193 member states.', 'The Holy See and the State of Palestine are its 2 observer states.', '193 + 2 = 195.'] };
    }
    if (shape === 'record') {
      var r = R.pick([['the largest country by area', 'Russia', ['Canada', 'China', 'Brazil']], ['the smallest country by area', 'The Holy See (Vatican City)', ['Monaco', 'San Marino', 'Liechtenstein']]]);
      return { q: '<p>Which is ' + r[0] + '?</p>', a: mc([r[1]].concat(r[2]), r[1]), hint: 'One stretches across two continents; the other fits inside a city.', steps: ['Russia covers about 17 million km², the most of any country.', 'The Holy See (Vatican City), inside Rome, covers less than half a square kilometer.'] };
    }
    if (shape === 'observer') {
      var ob = R.pick(['The Holy See (Vatican City)', 'The State of Palestine']), mem = R.sample(g.countries({ un: 'member' }).filter(function (c) { return c.km2 < 60000 && c.g !== 'was'; }), 3).map(function (c) { return c.n; });
      return { q: '<p>Which of these is a UN <b>observer state</b>, not a member?</p>', a: mc([ob].concat(mem), ob), hint: 'There are only two observer states.', steps: ['The two UN observer states are the Holy See and the State of Palestine.', 'The others are UN member states.'] };
    }
    if (shape === 'status' || shape === 'map') {
      var kind = R.pick(['member', 'member', 'observer', 'other']), id, name;
      if (kind === 'member') { var mm = R.pick(g.countries({ un: 'member' }).filter(function (c) { return c.km2 > 30000; })); id = mm.id; name = mm.n; }
      else if (kind === 'observer') { id = R.pick(['VAT', 'PSE']); name = g.area(id).n; }
      else { id = R.pick(['TWN', 'XKX']); name = g.area(id).n; }
      var info = g.area(id), why = kind === 'member' ? name + ' is one of the 193 UN member states.' : kind === 'observer' ? name + ' is one of the two UN observer states.' : info.note;
      if (shape === 'status') return { q: '<p>Which describes ' + name + '?</p>', a: mc([UNCAT.member, UNCAT.observer, UNCAT.other], UNCAT[kind]), hint: 'There are 193 members and 2 observers; some places that govern themselves are on neither list.', steps: [why] };
      var reg = kind === 'member' ? (g.country(id).g) : id === 'VAT' ? 'seu' : id === 'PSE' ? 'was' : id === 'TWN' ? 'eas' : 'seu';
      return { q: '<p>What is the highlighted place?</p>', viz: { name: 'gg-map', opts: { region: reg, highlight: [id], quiet: true, interactive: false, dots: true, disputedNote: false } },
        a: mc([UNCAT.member + ': ' + name, UNCAT.observer + ': ' + name, name + ', ' + UNCAT.other.charAt(0).toLowerCase() + UNCAT.other.slice(1)].map(function (x) { return x; }), kind === 'member' ? UNCAT.member + ': ' + name : kind === 'observer' ? UNCAT.observer + ': ' + name : name + ', ' + UNCAT.other.charAt(0).toLowerCase() + UNCAT.other.slice(1)),
        hint: 'Name the place first, then decide which list it is on.', steps: ['The highlighted place is ' + name + '.', why] };
    }
    return { q: '<p>Why do different lists give different numbers of countries?</p>', a: mc(['Some places are recognized as countries by some governments and not by others', 'The UN changes its list every year', 'Some countries are too small to count', 'Mapmakers cannot agree on where the oceans are'], 'Some places are recognized as countries by some governments and not by others'),
      hint: 'Who decides what counts as a country?', steps: ['No single world office decides what is a country; each government decides whom it recognizes.', 'Places such as Taiwan and Kosovo govern themselves but are not UN members, so some lists include them and others do not.', 'This course uses the 193 UN members plus the 2 observer states.'] };
  });

  /* ---------------------------------------------------------- landlocked countries */
  G('worldgeo.landlocked', function (R, ctx) {
    var L = ctx.level || 1, shape = L === 1 ? R.pick(['map', 'which', 'fact']) : L === 2 ? R.pick(['map', 'which', 'pair', 'fact']) : R.pick(['caspian', 'double', 'which', 'count']);
    var g = ML.geog, LL = g.countries({ landlocked: true }), isL = function (c) { return g.has(c, 'L'); };
    if (shape === 'map') {
      var yes = R.coin(), c = yes ? R.pick(LL.filter(function (x) { return x.km2 > 20000; })) : R.pick(g.C.filter(function (x) { return !isL(x) && x.km2 > 50000 && x.g !== 'car' && x.g !== 'oce'; }));
      return { q: '<p>Is the highlighted country landlocked?</p>', viz: { name: 'gg-map', opts: { region: c.g, highlight: [c.id], quiet: true, interactive: false, dots: false, disputedNote: false } }, a: { t: 'tf', v: yes },
        hint: 'Does any part of the highlighted country touch the open ocean (or a sea that leads to it)?', steps: [yes ? 'The highlighted country, ' + c.n + ', has no coast on the open ocean.' : 'The highlighted country, ' + c.n + ', has a coast on the ocean or on a sea that opens to it.', yes ? 'So yes, it is landlocked.' : 'So no, it is not landlocked.'] };
    }
    if (shape === 'which') {
      var ll = R.pick(LL), pool = L === 3 ? g.C.filter(function (x) { return !isL(x) && ll.nb.indexOf(x.id) >= 0; }) : g.C.filter(function (x) { return !isL(x) && x.cont === ll.cont; });
      if (pool.length < 3) pool = g.C.filter(function (x) { return !isL(x) && x.cont === ll.cont; });
      var wr = R.sample(pool, 3).map(function (x) { return x.n; });
      return { q: '<p>Which of these countries is landlocked?</p>', a: mc([ll.n].concat(wr), ll.n), hint: 'Picture each country: which one has no coast?', steps: [ll.n + ' has no coast on the open ocean.', 'The others all have coasts: ' + wr.join(', ') + '.'] };
    }
    if (shape === 'pair') {
      var p = R.pick([['Paraguay', 'Uruguay'], ['Bolivia', 'Peru'], ['Austria', 'Germany'], ['Ethiopia', 'Eritrea'], ['Mali', 'Senegal'], ['Laos', 'Vietnam'], ['Switzerland', 'Italy'], ['Mongolia', 'China']]);
      return { q: '<p>Which one is landlocked: ' + p[0] + ' or ' + p[1] + '?</p>', a: mc([p[0], p[1], 'Both', 'Neither'], p[0]), hint: 'Which one has a coastline?', steps: [p[1] + ' has a coast; ' + p[0] + ' does not.', 'So ' + p[0] + ' is landlocked.'] };
    }
    if (shape === 'fact') {
      var f = R.pick([['Which is the largest landlocked country?', 'Kazakhstan', ['Mongolia', 'Chad', 'Bolivia']], ['Which two countries of South America are landlocked?', 'Bolivia and Paraguay', ['Uruguay and Paraguay', 'Bolivia and Ecuador', 'Chile and Argentina']],
        ['Which continent has the most landlocked countries?', 'Africa', ['Europe', 'Asia', 'South America']], ['What makes a country landlocked?', 'It has no coast on the open ocean', ['It has no rivers', 'It is surrounded by mountains', 'It is smaller than its neighbors']]]);
      return { q: '<p>' + f[0] + '</p>', a: mc([f[1]].concat(f[2]), f[1]), hint: 'Landlocked means no coast on the open ocean.', steps: ['Answer: ' + f[1] + '.', 'On our list there are 44 landlocked countries: 16 in Africa, 14 in Europe, 12 in Asia and 2 in South America. Kazakhstan is the largest.'] };
    }
    if (shape === 'caspian') {
      var cz = R.pick(['KAZ', 'TKM', 'AZE']);
      return { q: '<p>All of these countries touch the Caspian Sea. Which one is <b>landlocked</b>?</p>', a: mc([g.country(cz).n, 'Iran', 'Russia'], g.country(cz).n), hint: 'The Caspian is a lake. Which of these countries has no coast on the open ocean at all?',
        steps: ['The Caspian Sea is a lake, so a Caspian shore does not count as an ocean coast.', 'Iran has a coast on the Persian Gulf and Russia on the Arctic and Pacific Oceans.', g.country(cz).n + ' has only the Caspian, so it is landlocked.'] };
    }
    if (shape === 'double') {
      var dl = R.pick(['LIE', 'UZB']), wr2 = R.sample(['CHE', 'AUT', 'KAZ', 'AFG', 'MNG', 'BOL', 'HUN'], 3).map(function (x) { return g.country(x).n; });
      var nbs = g.country(dl).nb.map(function (x) { return g.country(x).n; });
      return { q: '<p>Which of these countries is <b>doubly landlocked</b>: every one of its neighbors is landlocked too?</p>', a: mc([g.country(dl).n].concat(wr2), g.country(dl).n), hint: 'Check each country\'s neighbors. Only two countries in the world are doubly landlocked.',
        steps: [g.country(dl).n + '\'s neighbors are ' + nbs.join(', ') + ': all landlocked.', 'The world\'s two doubly landlocked countries are Liechtenstein and Uzbekistan.'] };
    }
    var cont = R.pick([['AF', 'Africa'], ['EU', 'Europe'], ['AS', 'Asia'], ['SA', 'South America']]), cnt = LL.filter(function (x) { return x.cont === cont[0]; }).length;
    return { q: '<p>On this course\'s list of 195 countries, how many landlocked countries are in ' + cont[1] + '?</p>', a: mc(uniqStr([String(cnt), String(cnt + 2), String(Math.max(0, cnt - 2)), String(cnt + 5)]), String(cnt)),
      hint: 'Africa 16, Europe 14, Asia 12, South America 2.', steps: ['The 44 landlocked countries: 16 in Africa, 14 in Europe, 12 in Asia, 2 in South America.', cont[1] + ': ' + cnt + '.'] };
  });
})(typeof window !== "undefined" ? window.MathLadder : null);

/* ---- part B ---- */
/* World Geography (Geography Ladder, course worldgeo), part B: units 7-12 (the Americas, Europe, Africa, Asia, Oceania and
   Antarctica, People and Cities): problem generators for 41 topics. Source: /tmp/work_worldgeo_B/gen_B.js (copied to
   out/gen.js and merged by /tmp/merge_parts.js geog worldgeo). Conventions: /tmp/work_geog/overview.md.
   - Country, capital, neighbour and landlocked facts come from the kit's model (MathLadder.geog), so a problem's picture and
     its answer always agree. Text answers use G.names(id) / G.capNames(id) (every accepted spelling).
   - Disputed areas are never asked about as countries; neighbour questions use firm borders only and never offer a country
     in G.unsureNeighbors(id) as a wrong choice; borders that run through disputed land (India, Pakistan, China) are not asked.
     Capitals of Israel and Palestine (flag X) are never quizzed, and they are left out of location questions here.
   - A country whose capital has a note (flag C) never sees its other capital offered as a wrong choice (wrong choices are
     filtered against G.capNames of the asked country); Equatorial Guinea and Nauru are asked only with typed answers.
   - Levels: 1 = one clear question with very different choices; 2 = choices from the topic's trouble note (look-alike
     names, neighbours, big cities that are not capitals) and typed answers; 3 = reverse questions, shapes, choose-all.
   - Numbers (UN World Population Prospects 2024; UN World Urbanization Prospects 2025; CIA World Factbook areas) are rounded
     and labeled "about" with their year. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var Gen = ML.gen;
  function GG() { return ML.geog; }
  var LET = ['A', 'B', 'C', 'D', 'E'];
  var THE = { USA: 1, BHS: 1, DOM: 1, NLD: 1, GBR: 1, CAF: 1, COD: 1, COG: 1, GMB: 1, PHL: 1, ARE: 1, MHL: 1, SLB: 1, MDV: 1, COM: 1, VAT: 1 };
  function C(id) { return GG().country(id); }
  function nm(id) { var c = C(id) || GG().area(id); return c ? c.n : id; }
  function tn(id) { return (THE[id] ? 'the ' : '') + nm(id); }            // "the Netherlands"
  function Tn(id) { var s = tn(id); return s.charAt(0).toUpperCase() + s.slice(1); }
  function b(s) { return '<b>' + s + '</b>'; }
  function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function capOf(id) { return C(id).cap; }
  function fold(s) { return GG().fold(String(s)).toLowerCase().replace(/[^a-z]/g, ''); }
  function isCapOf(city, id) { var f = fold(city); return GG().capNames(id).some(function (x) { return fold(x) === f; }); }
  function has(id, f) { var c = C(id); return !!(c && c.f && c.f.indexOf(f) >= 0); }
  function listAnd(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function listOr(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' or ' + a[a.length - 1]; }
  function mc(choices, right) { return { t: 'mc', choices: choices, v: choices.indexOf(right) }; }
  function letters(n, i) { return { t: 'mc', choices: LET.slice(0, n), v: i, keep: true }; }
  function textName(id) { return { t: 'text', v: GG().names(id) }; }
  function textCap(id) { return { t: 'text', v: GG().capNames(id) }; }
  function uniq(a) { var o = []; a.forEach(function (x) { if (x != null && o.indexOf(x) < 0) o.push(x); }); return o; }
  function without(a, bad) { return a.filter(function (x) { return bad.indexOf(x) < 0; }); }
  function map(opts) { return { name: 'gg-map', opts: Object.assign({ quiet: true, interactive: false }, opts) }; }
  function fmtN(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ------------------------------------------------------------------ where a country is (for worked steps) */
  function nbs(id) { return GG().neighbors(id); }
  function desc(id, W) {
    if (W && W[id]) return W[id];
    var n = nbs(id), c = C(id);
    if (!n.length) return 'an island country' + (c && c.km2 < 1000 ? ', and a small one' : '');
    var s = 'the country that borders ' + listAnd(n.slice(0, 4).map(tn)) + (n.length > 4 ? ' and more' : '');
    if (has(id, 'L')) s += '; it has no coast';
    return s;
  }

  /* ------------------------------------------------------------------ choosing other countries */
  // far: very different (not neighbours, not look-alikes); close: look-alikes first, then neighbours, then the region
  function others(R, cfg, id, n, close) {
    var conf = (cfg.confuse && cfg.confuse[id]) || [], nb = nbs(id), un = unsure(cfg, id);
    var pool = without(cfg.pool, [id].concat(cfg.skip || []));
    var out;
    if (close) {
      out = R.shuffle(conf.filter(function (x) { return C(x) && (cfg.skip || []).indexOf(x) < 0; }));
      out = out.concat(R.shuffle(nb.filter(function (x) { return pool.indexOf(x) >= 0; })));
      out = out.concat(R.shuffle(pool));
    } else {
      out = R.shuffle(pool.filter(function (x) { return nb.indexOf(x) < 0 && conf.indexOf(x) < 0 && un.indexOf(x) < 0; })).concat(R.shuffle(pool));
    }
    return uniq(without(out, [id])).slice(0, n);
  }
  function regionFor(cfg, ids) { return cfg.regionOf ? cfg.regionOf(ids) : ids; }

  /* ------------------------------------------------------------------ location problems (Countries of …) */
  function qLetter(R, L, cfg, id) {
    var ot = others(R, cfg, id, L === 1 ? 2 : 3, L > 1), ids = R.shuffle([id].concat(ot)), mk = {};
    ids.forEach(function (x, i) { mk[x] = LET[i]; });
    var i0 = ids.indexOf(id);
    return { q: 'Which letter marks ' + b(tn(id)) + '?', viz: map({ region: regionFor(cfg, ids), mark: mk, label: 'A map with lettered countries.' }),
      a: letters(ids.length, i0), hint: cfg.hint || 'Find the country\'s neighbors or its coast first.',
      steps: [Tn(id) + ' is ' + desc(id, cfg.where) + '.', 'That is letter ' + LET[i0] + '.'].concat(ot.length ? ['The other letters mark ' + listAnd(ot.map(function (x) { return tn(x) + ' (' + mk[x] + ')'; })) + '.'] : []) };
  }
  function qName(R, L, cfg, id) {
    var region = cfg.regionOf ? cfg.regionOf([id]) : cfg.region;
    var v = map({ region: region, highlight: [id], ask: id, label: 'A map with one country highlighted.' });
    var st = ['The highlighted country is ' + tn(id) + ', ' + desc(id, cfg.where) + '.'];
    if (L === 3) return { q: 'Name the highlighted country.', viz: v, a: textName(id), hint: 'Look at its neighbors and its coast.', steps: st };
    var ch = R.shuffle([id].concat(others(R, cfg, id, L === 1 ? 2 : 3, L > 1)));
    return { q: 'Which country is highlighted?', viz: v, a: mc(ch.map(nm), nm(id)), hint: 'Look at its neighbors and its coast.', steps: st };
  }
  function qReverse(R, L, cfg, id) {
    var ot = others(R, cfg, id, 3, true), ids = R.shuffle([id].concat(ot)), mk = {};
    ids.forEach(function (x, i) { mk[x] = LET[i]; });
    var l = mk[id];
    return { q: 'Which country does letter ' + b(l) + ' mark? Type its name.', viz: map({ region: regionFor(cfg, ids), mark: mk, label: 'A map with lettered countries.' }),
      a: textName(id), hint: 'Look at what is around the letter: its neighbors, a coast, a sea.',
      steps: ['Letter ' + l + ' is on ' + tn(id) + ', ' + desc(id, cfg.where) + '.'] };
  }
  function qOutline(R, L, cfg, id) {
    var sh = cfg.shapes || cfg.pool, ot = R.shuffle(without(sh, [id])).slice(0, L === 3 ? 3 : 2), ids = R.shuffle([id].concat(ot));
    var i0 = ids.indexOf(id);
    return { q: 'Here are the outlines of ' + ids.length + ' countries, each drawn to fit its box (the bar shows 500 km). Which shape is ' + b(tn(id)) + '?',
      viz: { name: 'gg-outline', opts: { ids: ids, quiet: true, interactive: false } }, a: letters(ids.length, i0), hint: 'Think about its shape on the map: long or round, coast or no coast, one piece or islands.',
      steps: ['Shape ' + LET[i0] + ' is ' + tn(id) + (cfg.shapeWhy && cfg.shapeWhy[id] ? ': ' + cfg.shapeWhy[id] : '') + '.'].concat(['The others are ' + listAnd(ot.map(function (x) { return tn(x) + ' (' + LET[ids.indexOf(x)] + ')'; })) + '.']) };
  }
  // neighbours only through a disputed area (the kit's list, plus pairs that meet only across Kosovo)
  function unsure(cfg, id) { return GG().unsureNeighbors(id).concat((cfg.avoid && cfg.avoid[id]) || []); }
  function nbTargets(cfg) {
    var skip = (cfg.noNb || []).concat(cfg.skip || []);
    return cfg.pool.filter(function (id) {
      if (skip.indexOf(id) >= 0) return false;
      var nb = nbs(id), un = unsure(cfg, id);
      var yes = nb.filter(function (x) { return cfg.pool.indexOf(x) >= 0 && skip.indexOf(x) < 0; });
      var no = cfg.pool.filter(function (x) { return x !== id && nb.indexOf(x) < 0 && un.indexOf(x) < 0 && skip.indexOf(x) < 0; });
      return yes.length >= 1 && no.length >= 2;
    });
  }
  function qNeighbor(R, L, cfg) {
    var id = R.pick(nbTargets(cfg)), skip = (cfg.noNb || []).concat(cfg.skip || []);
    var nb = nbs(id), un = unsure(cfg, id), inPool = nb.filter(function (x) { return cfg.pool.indexOf(x) >= 0 && skip.indexOf(x) < 0; });
    var wrongPool = cfg.pool.filter(function (x) { return x !== id && nb.indexOf(x) < 0 && un.indexOf(x) < 0 && skip.indexOf(x) < 0; });
    if (L === 3 && wrongPool.length >= 1 && inPool.length >= 2) {
      var k = Math.min(inPool.length, R.int(2, 3)), right = R.sample(inPool, k), wrong = R.sample(wrongPool, Math.min(wrongPool.length, 4 - k)), ch = R.shuffle(right.concat(wrong));
      return { q: 'Which of these countries border ' + b(tn(id)) + '? Choose all that do.', viz: map({ region: cfg.regionOf ? cfg.regionOf([id].concat(ch)) : cfg.region, highlight: [id], label: 'A map with one country highlighted.', quiet: false }),
        a: { t: 'mc', choices: ch.map(nm), v: ch.map(function (x, i) { return right.indexOf(x) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; }) },
        hint: 'Find the highlighted country, then check which countries touch it.',
        steps: [Tn(id) + ' borders ' + listAnd(nb.map(tn)) + '.', 'So ' + listAnd(right.map(tn)) + ' border it; ' + listAnd(wrong.map(tn)) + (wrong.length > 1 ? ' do not.' : ' does not.')] };
    }
    var r1 = R.pick(inPool), w = R.sample(wrongPool, Math.min(wrongPool.length, L === 1 ? 2 : 3)), ch2 = R.shuffle([r1].concat(w));
    return { q: 'Which of these countries borders ' + b(tn(id)) + '?', viz: L === 1 ? map({ region: cfg.regionOf ? cfg.regionOf([id].concat(ch2)) : cfg.region, highlight: [id], label: 'A map with one country highlighted.', quiet: false }) : undefined,
      a: mc(ch2.map(nm), nm(r1)), hint: 'Picture ' + tn(id) + ' on the map. Which country touches it?',
      steps: [Tn(id) + ' borders ' + listAnd(nb.map(tn)) + '.', 'Of the choices, only ' + tn(r1) + ' does.'] };
  }
  function qLandlocked(R, L, cfg) {
    var ll = cfg.pool.filter(function (x) { return has(x, 'L') && (cfg.skip || []).indexOf(x) < 0; }), co = cfg.pool.filter(function (x) { return !has(x, 'L') && (cfg.skip || []).indexOf(x) < 0; });
    var r1 = R.pick(ll), w = R.sample(co, Math.min(co.length, L === 1 ? 2 : 3)), ch = R.shuffle([r1].concat(w));
    return { q: 'Which of these countries is ' + b('landlocked') + ' (has no coast on the ocean or the open sea)?', a: mc(ch.map(nm), nm(r1)),
      hint: 'Picture each country. Does it touch the sea?',
      steps: [Tn(r1) + ' is landlocked: ' + desc(r1, cfg.where) + '.', listAnd(w.map(Tn)) + (w.length > 1 ? ' all have coasts.' : ' has a coast.')].concat(ll.length > 1 ? ['The landlocked countries of this region are ' + listAnd(ll.map(tn)) + '.'] : []) };
  }
  function qFact(R, L, cfg) {
    var f = R.pick(cfg.facts);
    return { q: 'True or false? ' + f[0], a: { t: 'tf', v: f[1] }, hint: cfg.factHint || 'Picture the map of the region.', steps: [(f[1] ? 'True. ' : 'False. ') + f[2]] };
  }
  function qAuthored(R, L, cfg) {
    var m = R.pick(cfg.mcq), ch = R.shuffle([m[1]].concat(m[2]));
    return { q: m[0], a: mc(ch, m[1]), hint: m[4] || 'Picture the map.', steps: [m[3]], viz: m[5] };
  }
  function pickTarget(R, cfg) { return R.pick(without(cfg.pool, cfg.skip || [])); }
  function locate(cfg) {
    return function (R, ctx) {
      var L = ctx.level || 1, id = pickTarget(R, cfg);
      var opts = L === 1 ? ['letter', 'letter', 'name', 'name', 'fact'] : L === 2 ? ['letter', 'letter', 'name', 'neighbor', 'fact', 'outline'] : ['reverse', 'name', 'letter', 'outline', 'neighbor', 'fact'];
      if (cfg.extra) opts = opts.concat(cfg.extra[L - 1] || []);
      if (!cfg.facts) opts = without(opts, ['fact']);
      if (!nbTargets(cfg).length) opts = without(opts, ['neighbor']);
      if (cfg.noOutline) opts = without(opts, ['outline']);
      var s = R.pick(opts);
      if (s === 'letter') return qLetter(R, L, cfg, id);
      if (s === 'name') return qName(R, L, cfg, id);
      if (s === 'reverse') return qReverse(R, L, cfg, id);
      if (s === 'outline') { var sh = cfg.shapes || cfg.pool; return qOutline(R, L, cfg, sh.indexOf(id) >= 0 ? id : R.pick(sh)); }
      if (s === 'neighbor') return qNeighbor(R, L, cfg);
      if (s === 'landlocked') return qLandlocked(R, L, cfg);
      if (s === 'mcq') return qAuthored(R, L, cfg);
      if (s === 'fact') return qFact(R, L, cfg);
      return cfg.special[s](R, L, id);
    };
  }

  /* ------------------------------------------------------------------ capitals */
  var TRAP = {
    CAN: ['Toronto', 'Montreal', 'Vancouver'], USA: ['New York City', 'Los Angeles', 'Chicago'], MEX: ['Guadalajara', 'Monterrey'], BLZ: ['Belize City'],
    NIC: ['León', 'Granada'], HND: ['San Pedro Sula'], PAN: ['Colón'], CUB: ['Santiago de Cuba'], JAM: ['Montego Bay'], BHS: ['Freeport'], HTI: ['Cap-Haïtien'],
    BRA: ['Rio de Janeiro', 'São Paulo', 'Salvador'], ARG: ['Córdoba', 'Rosario'], COL: ['Medellín', 'Cali'], ECU: ['Guayaquil'], PER: ['Cusco', 'Arequipa'],
    VEN: ['Maracaibo'], CHL: ['Valparaíso'], PRY: ['Ciudad del Este'], BOL: ['Santa Cruz de la Sierra', 'Cochabamba'],
    GBR: ['Manchester', 'Birmingham'], IRL: ['Cork'], NOR: ['Bergen'], SWE: ['Gothenburg'], DNK: ['Aarhus'], FIN: ['Turku'], EST: ['Tartu'], LTU: ['Kaunas'],
    DEU: ['Munich', 'Hamburg', 'Bonn'], CHE: ['Zurich', 'Geneva'], FRA: ['Lyon', 'Marseille'], BEL: ['Antwerp'], NLD: ['Rotterdam'], AUT: ['Salzburg'],
    ITA: ['Milan', 'Venice'], ESP: ['Barcelona', 'Seville'], PRT: ['Porto'], GRC: ['Thessaloniki'], HRV: ['Split'], SRB: ['Novi Sad'], BIH: ['Mostar'], ALB: ['Durrës'], SVN: ['Maribor'],
    POL: ['Kraków'], RUS: ['St. Petersburg'], UKR: ['Kharkiv', 'Odesa'], CZE: ['Brno'], SVK: ['Košice'], BGR: ['Plovdiv'], ROU: ['Cluj-Napoca'],
    MAR: ['Casablanca', 'Marrakesh'], EGY: ['Alexandria'], LBY: ['Benghazi'], DZA: ['Oran'], TUN: ['Sfax'],
    NGA: ['Lagos', 'Kano'], GHA: ['Kumasi'], MLI: ['Timbuktu'], BFA: ['Bobo-Dioulasso'],
    CMR: ['Douala'], COD: ['Lubumbashi'], AGO: ['Benguela'], GAB: ['Port-Gentil'],
    KEN: ['Mombasa'], UGA: ['Entebbe'], MOZ: ['Beira'], ZWE: ['Bulawayo'], ZMB: ['Kitwe'], MWI: ['Blantyre'], MDG: ['Toamasina'],
    ZAF: ['Johannesburg', 'Durban'], NAM: ['Walvis Bay'], BWA: ['Francistown'],
    TUR: ['Istanbul', 'Izmir'], ARE: ['Dubai'], SAU: ['Jeddah'], IRQ: ['Basra'], SYR: ['Aleppo'], OMN: ['Salalah'], JOR: ['Aqaba'], GEO: ['Batumi'], CYP: ['Limassol'],
    PAK: ['Karachi', 'Lahore'], IND: ['Mumbai', 'Kolkata'], KAZ: ['Almaty'], BGD: ['Chittagong'], AFG: ['Kandahar'], IRN: ['Isfahan'], UZB: ['Samarkand'], NPL: ['Pokhara'], KGZ: ['Osh'],
    CHN: ['Shanghai', 'Guangzhou'], JPN: ['Osaka', 'Kyoto'], KOR: ['Busan'],
    VNM: ['Ho Chi Minh City'], MMR: ['Yangon', 'Mandalay'], THA: ['Chiang Mai', 'Phuket'], PHL: ['Cebu City', 'Davao City'], IDN: ['Surabaya', 'Bandung'], KHM: ['Siem Reap'], LAO: ['Luang Prabang'], MYS: ['George Town'],
    AUS: ['Sydney', 'Melbourne'], NZL: ['Auckland', 'Christchurch'], PNG: ['Lae'], FJI: ['Nadi']
  };
  var CAPWHY = {
    CAN: 'Toronto is Canada\'s largest city, but Ottawa, on the Ottawa River, is the capital.',
    USA: 'New York City is the largest U.S. city, but the capital is Washington, D.C.',
    BLZ: 'Belize City is the largest city and was the capital until 1970, when the government moved inland to Belmopan.',
    BRA: 'Rio de Janeiro was the capital until 1960, when Brasília, a city planned and built inland, took its place. São Paulo is the largest city.',
    ECU: 'Guayaquil is Ecuador\'s largest city, but the capital is Quito, high in the Andes.',
    CHL: 'The national congress meets in Valparaíso, but the capital is Santiago.',
    BOL: 'Bolivia has two capitals: Sucre (the constitutional capital) and La Paz (the seat of government). Santa Cruz de la Sierra is the largest city.',
    DEU: 'Bonn was the seat of government of West Germany; since reunification the capital has been Berlin.',
    CHE: 'Zurich is the largest Swiss city. Switzerland\'s laws name no capital; Bern is the federal city, where the government and parliament sit.',
    NLD: 'Amsterdam is the capital named in the constitution; the government and parliament sit in The Hague (both are accepted here).',
    POL: 'Kraków was Poland\'s capital centuries ago; Warsaw is the capital today.',
    RUS: 'St. Petersburg was Russia\'s capital for about two hundred years; Moscow is the capital today.',
    MAR: 'Casablanca is Morocco\'s largest city, but the capital is Rabat.',
    NGA: 'Lagos is Nigeria\'s largest city and was the capital until 1991, when the government moved to Abuja, a planned city near the center of the country.',
    KAZ: 'Almaty is Kazakhstan\'s largest city and was the capital until 1997; the capital is now Astana.',
    PAK: 'Karachi is Pakistan\'s largest city and was its first capital; Islamabad, a planned city in the north, is the capital.',
    IND: 'Mumbai is India\'s biggest business city, but the capital is New Delhi.',
    TUR: 'Istanbul is Türkiye\'s largest city, but the capital is Ankara, in the middle of the country.',
    ARE: 'Dubai is the best-known city of the United Arab Emirates, but the capital is Abu Dhabi.',
    CHN: 'Shanghai is China\'s largest city, but the capital is Beijing.',
    JPN: 'Osaka is a very big city, and Kyoto was the old capital; Tokyo is the capital today.',
    VNM: 'Ho Chi Minh City is Vietnam\'s largest city, but the capital is Hanoi, in the north.',
    MMR: 'Yangon (Rangoon) was the capital until 2005, when the government moved to Naypyidaw, a new city.',
    AUS: 'Sydney and Melbourne are Australia\'s largest cities. Canberra was built as the capital, between the two, as a compromise.',
    NZL: 'Auckland is New Zealand\'s largest city, but the capital is Wellington, at the south end of the North Island.',
    ZAF: 'Johannesburg is South Africa\'s largest city, but it is not one of the three capitals: Pretoria, Cape Town and Bloemfontein.',
    TZA: 'Dodoma is the official capital; Dar es Salaam, the largest city, still holds many government offices (both are accepted when you type).',
    CIV: 'Yamoussoukro is the official capital; Abidjan is the largest city and holds most government offices (both are accepted when you type).',
    BEN: 'Porto-Novo is the official capital; Cotonou is the largest city and the seat of government (both are accepted when you type).'
  };
  function capNote(id) { return CAPWHY[id] || (has(id, 'C') && C(id).note ? C(id).note : null); }
  function capPool(cfg) { return cfg.pool.filter(function (id) { return GG().capQuiz(id) && (cfg.skip || []).indexOf(id) < 0; }); }
  function mcPool(cfg) { return capPool(cfg).filter(function (id) { return (cfg.textOnly || []).indexOf(id) < 0; }); }
  function wrongCaps(R, cfg, id, n, close) {
    var conf = close ? ((cfg.confuse && cfg.confuse[id]) || []).concat(nbs(id).filter(function (x) { return cfg.pool.indexOf(x) >= 0; })) : [];
    var cand = R.shuffle(conf).concat(R.shuffle(capPool(cfg))).filter(function (x) { return x !== id && C(x) && GG().capQuiz(x); }).map(capOf);
    if (close && TRAP[id]) cand = R.shuffle(TRAP[id].slice()).concat(cand);
    return uniq(cand.filter(function (c) { return !isCapOf(c, id); })).slice(0, n);
  }
  function capSteps(id) { var s = ['The capital of ' + tn(id) + ' is ' + capOf(id) + '.']; var n = capNote(id); if (n) s.push(n); return s; }
  function qCapMC(R, L, cfg, id) {
    var w = wrongCaps(R, cfg, id, L === 1 ? 2 : 3, L > 1), ch = R.shuffle([capOf(id)].concat(w));
    var v = L === 1 ? map({ region: cfg.regionOf ? cfg.regionOf([id]) : cfg.region, highlight: [id], label: 'A map with one country highlighted.', quiet: false }) : undefined;
    return { q: 'What is the capital of ' + b(tn(id)) + '?', viz: v, a: mc(ch, capOf(id)), hint: 'The biggest city is not always the capital.', steps: capSteps(id) };
  }
  function qCapTrap(R, L, cfg, id) {
    var tr = (TRAP[id] || []).filter(function (c) { return !isCapOf(c, id); });
    var w = R.shuffle(tr).slice(0, 2), more = wrongCaps(R, cfg, id, 3 - w.length, true).filter(function (x) { return w.indexOf(x) < 0; });
    var ch = R.shuffle([capOf(id)].concat(w, more).slice(0, 4));
    return { q: 'Which city is the capital of ' + b(tn(id)) + '?', a: mc(uniq(ch), capOf(id)), hint: 'Careful: the largest or best-known city is not always the capital.',
      steps: capSteps(id).concat(w.length && !CAPWHY[id] ? [listAnd(w) + (w.length > 1 ? ' are cities' : ' is a city') + ' in ' + tn(id) + ', but not the capital.'] : []) };
  }
  function qCapText(R, L, cfg, id) {
    var v = map({ region: cfg.regionOf ? cfg.regionOf([id]) : cfg.region, highlight: [id], capitals: [id], capLabels: false, ask: id, label: 'A map with one country highlighted and a star at its capital.' });
    return { q: 'The star marks the capital of the highlighted country. Type the name of the capital.', viz: v, a: textCap(id), hint: 'First name the highlighted country, then its capital.',
      steps: ['The highlighted country is ' + tn(id) + '.'].concat(capSteps(id)) };
  }
  function qCapTextPlain(R, L, cfg, id) { return { q: 'Type the capital of ' + b(tn(id)) + '.', a: textCap(id), hint: 'Picture the country\'s capital star on the map.', steps: capSteps(id) }; }
  function qCountryOf(R, L, cfg, id) {
    var c = capOf(id);
    if (L === 3) return { q: b(c) + ' is the capital of which country? Type its name.', a: textName(id), hint: 'Picture where ' + c + ' is on the map.', steps: [c + ' is the capital of ' + tn(id) + '.'] };
    var ot = others(R, { pool: capPool(cfg), confuse: cfg.confuse, skip: cfg.skip }, id, 3, L > 1), ch = R.shuffle([id].concat(ot));
    return { q: b(c) + ' is the capital of which country?', a: mc(ch.map(nm), nm(id)), hint: 'Picture where ' + c + ' is on the map.', steps: [c + ' is the capital of ' + tn(id) + '.'] };
  }
  function qCapLetter(R, L, cfg, id) {
    var ot = others(R, { pool: capPool(cfg), confuse: cfg.confuse, skip: cfg.skip, regionOf: cfg.regionOf }, id, 3, true), ids = R.shuffle([id].concat(ot)), mk = {};
    ids.forEach(function (x, i) { mk[x] = LET[i]; });
    return { q: 'Which letter marks the country whose capital is ' + b(capOf(id)) + '?', viz: map({ region: regionFor(cfg, ids), mark: mk, label: 'A map with lettered countries.' }),
      a: letters(ids.length, ids.indexOf(id)), hint: 'Two steps: which country has this capital, and where is that country?',
      steps: [capOf(id) + ' is the capital of ' + tn(id) + '.', Tn(id) + ' is ' + desc(id, cfg.where) + ': letter ' + mk[id] + '.'] };
  }
  function qCapTF(R, L, cfg, id) {
    var t = R.coin(), city = t ? capOf(id) : (wrongCaps(R, cfg, id, 1, true)[0] || capOf(id)); if (city === capOf(id)) t = true;
    return { q: 'True or false? ' + city + ' is the capital of ' + tn(id) + '.', a: { t: 'tf', v: t }, hint: 'Picture the country and its capital star.',
      steps: (t ? ['True.'] : ['False.']).concat(capSteps(id)) };
  }
  function capitals(cfg) {
    return function (R, ctx) {
      var L = ctx.level || 1, P = capPool(cfg), MP = mcPool(cfg);
      var opts = L === 1 ? ['mc', 'mc', 'tf', 'countryOf'] : L === 2 ? ['mc', 'trap', 'text', 'countryOf', 'tf'] : ['text', 'textPlain', 'countryOf', 'letter', 'trap'];
      var s = R.pick(opts), id;
      if (s === 'trap') { var tp = MP.filter(function (x) { return (TRAP[x] || []).some(function (c) { return !isCapOf(c, x); }); }); if (tp.length) return qCapTrap(R, L, cfg, R.pick(tp)); s = 'mc'; }
      if (s === 'text' || s === 'textPlain') { id = R.pick(P); return s === 'text' ? qCapText(R, L, cfg, id) : qCapTextPlain(R, L, cfg, id); }
      id = R.pick(MP);
      if (s === 'mc') return qCapMC(R, L, cfg, id);
      if (s === 'tf') return qCapTF(R, L, cfg, id);
      if (s === 'countryOf') return qCountryOf(R, L, cfg, id);
      return qCapLetter(R, L, cfg, id);
    };
  }
  // small regions: countries and capitals together
  function combined(cfg, cfgCap) {
    var lo = locate(cfg), ca = capitals(cfgCap || cfg);
    return function (R, ctx) { return R.chance(0.5) ? lo(R, ctx) : ca(R, ctx); };
  }

  /* ------------------------------------------------------------------ physical features */
  // a feature: { id, n, k: kind word, pt: [lon, lat] (a point, for peaks and lakes; otherwise drawn from the kit's data), d: description }
  function featViz(cfg, feats, mk, hi) {
    var o = { region: cfg.region, color: 'plain', featureLabels: false, label: 'A physical map with lettered features.' }, f = [], pts = [];
    feats.forEach(function (x) { if (x.pt) pts.push({ lon: x.pt[0], lat: x.pt[1], mark: mk ? mk[x.id] : (hi === x.id ? '?' : undefined) }); else f.push(x.id); });
    if (f.length) o.features = f; if (pts.length) o.points = pts;
    // rivers stored as one line (St. Lawrence, Thames) get no letter from the kit, so their letter sits on a point on the river
    if (mk) { o.mark = {}; feats.forEach(function (x) { if (x.pt) return; if (x.markPt) pts.push({ lon: x.markPt[0], lat: x.markPt[1], mark: mk[x.id], r: 2 }); else o.mark[x.id] = mk[x.id]; }); if (pts.length) o.points = pts; }
    if (hi) { var h = feats.filter(function (x) { return x.id === hi; })[0]; if (h && !h.pt) { o.hiFeature = hi; o.ask = hi; } o.label = 'A physical map with one feature highlighted.'; }
    if (cfg.regionFor) o.region = cfg.regionFor(feats);
    return map(o);
  }
  function sameKind(cfg, x) { return cfg.feats.filter(function (y) { return y.id !== x.id && y.group === x.group; }); }
  function physical(cfg) {
    return function (R, ctx) {
      var L = ctx.level || 1, s = R.pick(L === 1 ? ['letter', 'letter', 'mcq', 'fact'] : L === 2 ? ['letter', 'name', 'mcq', 'fact'] : ['letter', 'name', 'mcq', 'mcq', 'fact']);
      if (s === 'fact') return qFact(R, L, cfg);
      if (s === 'mcq') return qAuthored(R, L, cfg);
      var x = R.pick(cfg.feats.filter(function (f) { return !f.noAsk; }));
      if (s === 'letter') {
        var pool = L === 1 ? cfg.feats.filter(function (y) { return y.id !== x.id && y.group !== x.group && !y.noMark; }) : sameKind(cfg, x).filter(function (y) { return !y.noMark; });
        if (pool.length < 2) pool = cfg.feats.filter(function (y) { return y.id !== x.id && !y.noMark; });
        var ot = R.sample(pool, Math.min(pool.length, L === 1 ? 2 : 3)), fs = R.shuffle([x].concat(ot)), mk = {};
        fs.forEach(function (y, i) { mk[y.id] = LET[i]; });
        return { q: 'Which letter marks ' + b(x.n) + '?', viz: featViz(cfg, fs, mk), a: letters(fs.length, fs.indexOf(x)), hint: cfg.hint || 'Think about where it is: north or south, east or west, near which countries?',
          steps: [cap1(x.n) + ' is ' + x.d + '.', 'That is letter ' + mk[x.id] + '.'] };
      }
      var same = sameKind(cfg, x), ch = R.shuffle([x].concat(R.sample(same.length >= 2 ? same : cfg.feats.filter(function (y) { return y.id !== x.id; }), Math.min(3, Math.max(2, same.length)))));
      return { q: 'What is the ' + (x.pt ? 'place marked with a question mark' : 'highlighted ' + x.k) + '?', viz: featViz(cfg, [x], null, x.id), a: mc(ch.map(function (y) { return cap1(y.n); }), cap1(x.n)),
        hint: 'Look at where it is on the continent.', steps: ['It is ' + x.n + ', ' + x.d + '.'] };
    };
  }

  /* ================================================================== UNIT 7: THE AMERICAS */
  var CAM = ['MEX', 'GTM', 'BLZ', 'HND', 'SLV', 'NIC', 'CRI', 'PAN'];
  var NCA; NCA = { pool: ['USA', 'CAN', 'MEX', 'BLZ', 'GTM', 'HND', 'SLV', 'NIC', 'CRI', 'PAN'],
    regionOf: function (ids) { return ids.some(function (x) { return x === 'USA' || x === 'CAN'; }) ? uniq(NCA.pool.concat(ids)) : uniq(CAM.concat(ids)); }, region: 'nca',
    confuse: { GTM: ['BLZ', 'HND'], BLZ: ['GTM', 'HND'], HND: ['NIC', 'SLV', 'GTM'], SLV: ['HND', 'GTM'], NIC: ['HND', 'CRI'], CRI: ['PAN', 'NIC'], PAN: ['CRI', 'COL'], MEX: ['GTM', 'BLZ'], USA: ['CAN', 'MEX'], CAN: ['USA'] },
    where: { MEX: 'the large country south of the United States; it is part of North America, and Central America begins at its southern border', PAN: 'the narrow country at the end of Central America, next to Colombia in South America', SLV: 'the small country with only a Pacific coast, between Guatemala and Honduras', BLZ: 'the small country on the Caribbean coast, east of Guatemala and south of Mexico', CRI: 'the country between Nicaragua and Panama', USA: 'the country between Canada and Mexico', CAN: 'the country north of the United States, the largest in North America' },
    shapes: ['USA', 'CAN', 'MEX', 'GTM', 'HND', 'NIC', 'CRI', 'PAN', 'SLV', 'BLZ'],
    shapeWhy: { PAN: 'a thin S-shaped strip', MEX: 'wide in the north, narrowing to the south and east, with the long Baja California peninsula', CRI: 'small, with coasts on both oceans', SLV: 'small and wide, with only a Pacific coast' },
    facts: [['Mexico is part of North America.', true, 'Mexico is in North America; Central America begins at its southern border, with Guatemala and Belize.'],
      ['Mexico is one of the countries of Central America.', false, 'Mexico is part of North America; the seven countries of Central America are Belize, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica and Panama.'],
      ['Central America has seven countries.', true, 'Belize, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica and Panama.'],
      ['Panama is the Central American country that borders South America.', true, 'Panama borders Colombia.'],
      ['Belize has a coast on the Pacific Ocean.', false, 'Belize is on the Caribbean Sea. El Salvador is the country with only a Pacific coast.'],
      ['El Salvador has a coast only on the Pacific Ocean.', true, 'It is the one Central American country with no Caribbean coast.'],
      ['The United States borders exactly two countries: Canada and Mexico.', true, 'Canada to the north and Mexico to the south.'],
      ['Costa Rica lies between Nicaragua and Panama.', true, 'Nicaragua is to its north and Panama to its south.'],
      ['Guatemala borders Mexico.', true, 'Guatemala is just south and east of Mexico.']] };
  Gen('worldgeo.countries-nca', locate(NCA));
  Gen('worldgeo.capitals-nca', capitals(NCA));

  var CAR = { pool: ['CUB', 'JAM', 'HTI', 'DOM', 'BHS', 'TTO', 'BRB', 'ATG', 'DMA', 'GRD', 'KNA', 'LCA', 'VCT'], region: 'car',
    confuse: { HTI: ['DOM'], DOM: ['HTI', 'DMA'], DMA: ['DOM', 'LCA'], GRD: ['VCT', 'BRB'], LCA: ['VCT', 'DMA'], VCT: ['LCA', 'GRD'], KNA: ['ATG'], ATG: ['KNA', 'DMA'], JAM: ['CUB', 'HTI'], CUB: ['JAM', 'BHS'], TTO: ['BRB', 'GRD'], BRB: ['TTO', 'LCA'], BHS: ['CUB'] },
    where: { CUB: 'the largest island of the Caribbean, just south of Florida', JAM: 'the island south of Cuba', HTI: 'the western part of the island of Hispaniola', DOM: 'the eastern part of the island of Hispaniola, the larger part', BHS: 'the chain of islands north of Cuba, in the Atlantic Ocean', TTO: 'the two islands just off the coast of Venezuela, at the south end of the Caribbean', BRB: 'the island farthest east, out in the Atlantic', DMA: 'a small island between Guadeloupe and Martinique, in the Lesser Antilles', GRD: 'the small island at the south end of the Lesser Antilles, north of Trinidad', KNA: 'two small islands in the northern Lesser Antilles, west of Antigua', ATG: 'two islands in the northern Lesser Antilles, east of Saint Kitts and Nevis', LCA: 'an island in the Lesser Antilles, south of Martinique', VCT: 'an island and a chain of smaller ones, south of Saint Lucia' },
    shapes: ['CUB', 'JAM', 'HTI', 'DOM', 'TTO', 'BHS'], noOutline: false, shapeWhy: { CUB: 'long and thin, like a lizard', JAM: 'an oval island', HTI: 'shaped like a crab\'s claw, open to the west', DOM: 'the wider eastern part of Hispaniola' },
    facts: [['Haiti and the Dominican Republic share the island of Hispaniola.', true, 'Haiti is the western part and the Dominican Republic the eastern part.'],
      ['Puerto Rico is an independent country.', false, 'Puerto Rico is a territory of the United States; its people are U.S. citizens.'],
      ['Cuba is the largest island in the Caribbean.', true, 'Cuba is the biggest island; Hispaniola is second.'],
      ['Dominica and the Dominican Republic are the same country.', false, 'They are two different countries. Dominica is a small island in the Lesser Antilles; the Dominican Republic shares Hispaniola with Haiti.'],
      ['Trinidad and Tobago lies close to the coast of South America.', true, 'Trinidad is only a few miles from Venezuela.'],
      ['Aruba and Curaçao are independent countries.', false, 'Aruba and Curaçao are parts of the Kingdom of the Netherlands.'],
      ['Jamaica is south of Cuba.', true, 'Jamaica lies about 150 km (90 miles) south of Cuba.'],
      ['Haiti is on the eastern part of Hispaniola.', false, 'Haiti is the western part; the Dominican Republic is the eastern part.']],
    extra: [['island'], ['island'], ['island']],
    special: {
      island: function (R, L) {
        var TERR = [['Puerto Rico', 'a territory of the United States'], ['Aruba', 'part of the Kingdom of the Netherlands'], ['Curaçao', 'part of the Kingdom of the Netherlands'], ['the Cayman Islands', 'a territory of the United Kingdom'], ['the U.S. Virgin Islands', 'a territory of the United States'], ['the Turks and Caicos Islands', 'a territory of the United Kingdom'], ['Guadeloupe', 'part of France'], ['Martinique', 'part of France']];
        var id = R.pick(['CUB', 'JAM', 'BHS', 'BRB', 'TTO', 'DMA', 'GRD', 'LCA', 'HTI', 'DOM']), t = R.sample(TERR, L === 1 ? 2 : 3);
        if (L === 3 || R.coin()) { // which one is NOT a country
          var ids2 = R.sample(['CUB', 'JAM', 'BHS', 'BRB', 'TTO', 'DMA', 'GRD', 'LCA'], 2), t1 = t[0], ch = R.shuffle(ids2.map(nm).concat([cap1(t1[0])]));
          return { q: 'Which of these is ' + b('not') + ' an independent country?', a: mc(ch, cap1(t1[0])), hint: 'Some Caribbean islands belong to other countries.',
            steps: [cap1(t1[0]) + ' is ' + t1[1] + '.', listAnd(ids2.map(Tn)) + ' are independent countries.'] };
        }
        var ch2 = R.shuffle([nm(id)].concat(t.map(function (x) { return cap1(x[0]); })));
        return { q: 'Which of these is an independent country?', a: mc(ch2, nm(id)), hint: 'Some Caribbean islands belong to other countries.',
          steps: [Tn(id) + ' is an independent country.'].concat(t.map(function (x) { return cap1(x[0]) + ' is ' + x[1] + '.'; })) };
      } } };
  Gen('worldgeo.countries-caribbean', locate(CAR));
  Gen('worldgeo.capitals-caribbean', capitals(CAR));

  var SAM = { pool: ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN'], region: 'sam',
    confuse: { URY: ['PRY'], PRY: ['URY', 'BOL'], BOL: ['PRY', 'PER'], ECU: ['PER', 'COL'], PER: ['ECU', 'BOL'], GUY: ['SUR'], SUR: ['GUY'], COL: ['VEN', 'ECU'], VEN: ['COL', 'GUY'], ARG: ['CHL', 'URY'], CHL: ['ARG', 'PER'], BRA: ['ARG', 'COL'] },
    where: { URY: 'the small country on the Atlantic coast between Brazil and Argentina', PRY: 'the landlocked country north of Argentina, between Bolivia and Brazil', BOL: 'the landlocked country high in the Andes, west of Brazil', CHL: 'the long, narrow country along the Pacific coast, west of the Andes', ECU: 'the country on the Pacific coast that the equator crosses, between Colombia and Peru', BRA: 'the largest country of South America; it borders every South American country except Chile and Ecuador', SUR: 'the small country on the north coast, between Guyana and French Guiana', GUY: 'the country on the north coast, east of Venezuela' },
    shapes: ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'PRY', 'PER', 'URY', 'VEN'], shapeWhy: { CHL: 'very long and thin', BRA: 'huge, with a long Atlantic coast bulging to the east', ARG: 'long, wide in the north and narrowing to the south' },
    facts: [['Brazil borders every country of South America except Chile and Ecuador.', true, 'Brazil touches ten countries and territories, including French Guiana, a part of France.'],
      ['Paraguay has a coast on the Atlantic Ocean.', false, 'Paraguay is landlocked. Uruguay is the one on the coast.'],
      ['Uruguay lies on the coast between Brazil and Argentina.', true, 'Uruguay is on the Atlantic and the Río de la Plata.'],
      ['Chile is long and narrow, between the Andes and the Pacific Ocean.', true, 'Chile is more than 4,000 km long but rarely more than 350 km wide.'],
      ['Bolivia and Paraguay are the two landlocked countries of South America.', true, 'Every other South American country has a coast.'],
      ['French Guiana is an independent country.', false, 'French Guiana is part of France.'],
      ['The equator crosses Ecuador.', true, 'Ecuador is named for the equator (ecuador in Spanish).'],
      ['Argentina is the largest country in South America.', false, 'Brazil is by far the largest; Argentina is second.']],
    extra: [['landlocked'], ['landlocked'], ['landlocked']] };
  Gen('worldgeo.countries-south-america', locate(SAM));
  Gen('worldgeo.capitals-south-america', capitals(SAM));

  var AMF = [
    { id: 'rockies', n: 'the Rocky Mountains', k: 'mountain range', group: 'range', d: 'the long range of western North America, from Canada through the western United States' },
    { id: 'andes', n: 'the Andes', k: 'mountain range', group: 'range', d: 'the long range along the whole west side of South America' },
    { id: 'appalachians', n: 'the Appalachian Mountains', k: 'mountain range', group: 'range', d: 'the old, worn-down range near the east coast of the United States' },
    { id: 'sierramadreocc', n: 'the Sierra Madre Occidental', k: 'mountain range', group: 'range', d: 'the range in western Mexico' },
    { id: 'greatplains', n: 'the Great Plains', k: 'plain', group: 'plain', d: 'the wide, flat grassland east of the Rocky Mountains' },
    { id: 'pampas', n: 'the Pampas', k: 'plain', group: 'plain', d: 'the flat grassland of Argentina and Uruguay' },
    { id: 'llanos', n: 'the Llanos', k: 'plain', group: 'plain', d: 'the grassy plains of Venezuela and Colombia, along the Orinoco River' },
    { id: 'amazonbasin', n: 'the Amazon Basin', k: 'basin', group: 'plain', d: 'the huge lowland drained by the Amazon River, covered by the largest rainforest on Earth' },
    { id: 'atacama', n: 'the Atacama Desert', k: 'desert', group: 'desert', d: 'the very dry desert along the coast of northern Chile' },
    { id: 'patagonia', n: 'Patagonia', k: 'region', group: 'desert', d: 'the dry, windy southern end of South America, in Argentina and Chile' },
    { id: 'canadianshield', n: 'the Canadian Shield', k: 'region', group: 'plain', d: 'the rocky land of lakes and forests around Hudson Bay' },
    { id: 'amazon', n: 'the Amazon River', k: 'river', group: 'river', d: 'the great river that flows east across northern South America to the Atlantic' },
    { id: 'mississippi', n: 'the Mississippi River', k: 'river', group: 'river', d: 'the river that flows south through the middle of the United States to the Gulf of Mexico' },
    { id: 'parana', n: 'the Paraná River', k: 'river', group: 'river', d: 'the river that flows south past Paraguay and Argentina to the Río de la Plata' },
    { id: 'orinoco', n: 'the Orinoco River', k: 'river', group: 'river', d: 'the river of Venezuela, flowing to the Atlantic' },
    { id: 'stlawrence', n: 'the St. Lawrence River', k: 'river', group: 'river', d: 'the river that carries water from the Great Lakes to the Atlantic', markPt: [-71.3, 46.85] },
    { id: 'mackenzie', n: 'the Mackenzie River', k: 'river', group: 'river', d: 'the long river of northern Canada, flowing to the Arctic Ocean' },
    { id: 'aconcagua', n: 'Aconcagua', k: 'mountain', group: 'peak', pt: [-70.01, -32.65], d: 'the highest mountain in the Americas (about 6,961 m), in the Andes of Argentina, near Chile' },
    { id: 'titicaca', n: 'Lake Titicaca', k: 'lake', group: 'peak', pt: [-69.4, -15.8], d: 'the large lake high in the Andes, on the border of Peru and Bolivia' }];
  Gen('worldgeo.physical-americas', physical({ feats: AMF, region: 'SA',
    regionFor: function (fs) { var na = ['rockies', 'appalachians', 'sierramadreocc', 'greatplains', 'canadianshield', 'mississippi', 'stlawrence', 'mackenzie']; var n = fs.filter(function (f) { return na.indexOf(f.id) >= 0; }).length; return n === fs.length ? 'NA' : n === 0 ? 'SA' : ['CAN', 'USA', 'MEX', 'COL', 'BRA', 'ARG', 'CHL']; },
    facts: [['The Amazon rainforest is only in Brazil.', false, 'Brazil holds about 60 percent of it; the rest is in Peru, Colombia, Venezuela, Ecuador, Bolivia, Guyana, Suriname and French Guiana.'],
      ['The Rockies and the Andes both run along the western side of the Americas.', true, 'Both great ranges are near the Pacific side of their continents.'],
      ['The Andes run along the east coast of South America.', false, 'The Andes run along the west side, near the Pacific.'],
      ['The Great Plains lie east of the Rocky Mountains.', true, 'The plains stretch east from the foot of the Rockies.'],
      ['The Amazon River flows into the Pacific Ocean.', false, 'It rises in the Andes and flows east to the Atlantic Ocean.'],
      ['Aconcagua, in Argentina, is the highest mountain in the Americas.', true, 'It is about 6,961 m (22,800 feet) high.'],
      ['The Pampas are a flat grassland in Argentina.', true, 'The Pampas are some of the best farmland and ranch land in South America.'],
      ['The Atacama Desert, in Chile, is one of the driest places on Earth.', true, 'Some parts get almost no rain for years.']],
    mcq: [['About how much of the Amazon rainforest is in Brazil?', 'About 60 percent', ['All of it', 'About 10 percent'], 'Brazil holds about 60 percent; the rest spreads into eight other countries and territories.'],
      ['Which mountain range runs down the west side of South America?', 'The Andes', ['The Rocky Mountains', 'The Appalachian Mountains'], 'The Andes stretch more than 7,000 km along the west side of South America.'],
      ['Which river flows south through the middle of the United States?', 'The Mississippi', ['The Amazon', 'The Orinoco'], 'The Mississippi flows from Minnesota to the Gulf of Mexico.'],
      ['Which plain lies in Argentina?', 'The Pampas', ['The Great Plains', 'The Llanos'], 'The Pampas are in Argentina and Uruguay; the Great Plains are in the United States and Canada; the Llanos are in Venezuela and Colombia.'],
      ['Where is Lake Titicaca?', 'High in the Andes, between Peru and Bolivia', ['On the Great Plains', 'At the mouth of the Amazon'], 'Lake Titicaca lies about 3,800 m above sea level.'],
      ['In which direction does the Amazon River flow?', 'East, to the Atlantic Ocean', ['West, to the Pacific Ocean', 'South, to Argentina'], 'The Amazon begins in the Andes of Peru, close to the Pacific, but flows east across the continent to the Atlantic.']] }));

  /* ================================================================== UNIT 8: EUROPE */
  var NEU = { pool: ['GBR', 'IRL', 'ISL', 'NOR', 'SWE', 'FIN', 'DNK', 'EST', 'LVA', 'LTU'], region: 'neu',
    confuse: { EST: ['LVA', 'LTU'], LVA: ['EST', 'LTU'], LTU: ['LVA', 'EST'], NOR: ['SWE', 'DNK'], SWE: ['NOR', 'FIN'], FIN: ['SWE', 'EST'], DNK: ['NOR', 'SWE'], IRL: ['GBR', 'ISL'], GBR: ['IRL'], ISL: ['IRL', 'NOR'] },
    where: { EST: 'the northernmost of the three Baltic states, across the sea from Finland', LVA: 'the middle Baltic state, between Estonia and Lithuania', LTU: 'the southernmost Baltic state, next to Poland and Belarus', NOR: 'the long country on the west side of the Scandinavian Peninsula', SWE: 'the country on the east side of the Scandinavian Peninsula, between Norway and Finland', FIN: 'the country east of Sweden, next to Russia', DNK: 'the peninsula and islands north of Germany', ISL: 'the island far out in the North Atlantic', IRL: 'the country that covers most of the island of Ireland, west of Great Britain', GBR: 'the country on the island of Great Britain and the northeast corner of Ireland' },
    shapes: ['GBR', 'IRL', 'ISL', 'NOR', 'SWE', 'FIN', 'DNK', 'EST', 'LVA', 'LTU'], shapeWhy: { NOR: 'long and thin along the coast, wide in the south', DNK: 'a peninsula and many islands', ISL: 'one round island' },
    facts: [['From north to south, the Baltic states are Estonia, Latvia and Lithuania.', true, 'That is also alphabetical order: E, L-a, L-i.'],
      ['Lithuania is the northernmost Baltic state.', false, 'Estonia is the northernmost; Lithuania is the southernmost.'],
      ['Iceland is an island in the North Atlantic Ocean.', true, 'Iceland lies far west of Norway, just south of the Arctic Circle.'],
      ['Ireland and the United Kingdom share a land border.', true, 'The border runs across the island of Ireland, between Ireland and Northern Ireland.'],
      ['Denmark borders Germany.', true, 'Denmark\'s mainland is a peninsula north of Germany.'],
      ['Norway and Russia share a border in the far north.', true, 'Their border is above the Arctic Circle.'],
      ['Sweden is west of Norway.', false, 'Norway is the western country of the Scandinavian Peninsula; Sweden is east of it.'],
      ['Greenland is an independent country.', false, 'Greenland is a self-governing part of the Kingdom of Denmark.']] };
  Gen('worldgeo.countries-northern-europe', locate(NEU));
  Gen('worldgeo.capitals-northern-europe', capitals(Object.assign({}, NEU, { confuse: { NOR: ['SWE', 'DNK', 'FIN'], SWE: ['NOR', 'DNK', 'FIN'], DNK: ['NOR', 'SWE', 'FIN'], FIN: ['SWE', 'NOR', 'EST'], EST: ['LVA', 'LTU', 'FIN'], LVA: ['EST', 'LTU'], LTU: ['LVA', 'EST'], IRL: ['GBR', 'ISL'], GBR: ['IRL'], ISL: ['NOR', 'DNK'] } })));

  var WEU = { pool: ['FRA', 'DEU', 'BEL', 'NLD', 'LUX', 'CHE', 'AUT', 'LIE', 'MCO'], region: 'weu',
    confuse: { BEL: ['NLD', 'LUX'], NLD: ['BEL', 'LUX'], LUX: ['BEL', 'LIE'], AUT: ['CHE', 'DEU'], CHE: ['AUT', 'LIE'], LIE: ['LUX', 'MCO'], MCO: ['LIE', 'LUX'], DEU: ['AUT', 'FRA'], FRA: ['BEL', 'DEU'] },
    where: { NLD: 'the northern one of the three Low Countries, on the North Sea', BEL: 'the middle one of the three Low Countries, between the Netherlands and France', LUX: 'the small landlocked country south of Belgium, between France and Germany', LIE: 'the tiny landlocked country between Switzerland and Austria', MCO: 'the tiny city-state on the Mediterranean coast, surrounded by France', CHE: 'the landlocked country in the Alps, between France, Germany, Austria and Italy', AUT: 'the landlocked country east of Switzerland, in the Alps', FRA: 'the large country between the Atlantic and the Mediterranean', DEU: 'the large country in the middle, with nine neighbors' },
    shapes: ['FRA', 'DEU', 'BEL', 'NLD', 'CHE', 'AUT'], shapeWhy: { FRA: 'roughly a six-sided shape, often called the Hexagon', AUT: 'long from east to west, narrow in the west', CHE: 'compact, with lakes and mountains' },
    facts: [['The Netherlands is the northernmost of Belgium, the Netherlands and Luxembourg.', true, 'From north to south: the Netherlands, Belgium, Luxembourg.'],
      ['Luxembourg has a coast on the North Sea.', false, 'Luxembourg is landlocked, south of Belgium.'],
      ['Switzerland and Austria are landlocked.', true, 'Both are in the Alps, far from the sea.'],
      ['Monaco is a tiny city-state on the Mediterranean coast.', true, 'Monaco is surrounded on land by France.'],
      ['Liechtenstein lies between Switzerland and Austria.', true, 'It is a tiny country in the Alps.'],
      ['Germany has nine neighbors.', true, 'Denmark, Poland, Czechia, Austria, Switzerland, France, Luxembourg, Belgium and the Netherlands.'],
      ['Belgium is north of the Netherlands.', false, 'The Netherlands is north of Belgium.']],
    extra: [['landlocked'], ['landlocked'], ['landlocked']] };
  Gen('worldgeo.countries-western-europe', locate(WEU));
  Gen('worldgeo.capitals-western-europe', capitals(WEU));

  var SEU = { pool: ['PRT', 'ESP', 'AND', 'ITA', 'SMR', 'VAT', 'MLT', 'SVN', 'HRV', 'BIH', 'SRB', 'MNE', 'ALB', 'MKD', 'GRC'], region: 'seu',
    confuse: { SVN: ['HRV', 'SVK'], HRV: ['SVN', 'BIH', 'SRB'], BIH: ['HRV', 'SRB', 'MNE'], SRB: ['BIH', 'MNE', 'MKD'], MNE: ['ALB', 'BIH'], ALB: ['MNE', 'MKD'], MKD: ['ALB', 'SRB', 'BGR'], PRT: ['ESP'], ESP: ['PRT', 'AND'], AND: ['SMR', 'MCO'], SMR: ['VAT', 'AND'], VAT: ['SMR', 'MLT'], MLT: ['SMR', 'VAT'], ITA: ['GRC', 'SVN'], GRC: ['ALB', 'MKD'] },
    where: { SVN: 'the small country at the top of the Adriatic Sea, next to Italy and Austria', HRV: 'the country with the long Adriatic coast, shaped like a crescent', BIH: 'the country almost surrounded by Croatia, with only a tiny coast', SRB: 'the landlocked country east of Bosnia and Herzegovina', MNE: 'the small country on the Adriatic, between Bosnia and Herzegovina and Albania', ALB: 'the country on the coast across the sea from the heel of Italy', MKD: 'the landlocked country north of Greece', VAT: 'the tiny city-state inside Rome', SMR: 'the tiny country surrounded by Italy, near the Adriatic', AND: 'the tiny country in the Pyrenees, between France and Spain', MLT: 'the small island country south of Sicily', PRT: 'the country on the west coast of the Iberian Peninsula', ESP: 'the large country that covers most of the Iberian Peninsula', ITA: 'the boot-shaped peninsula in the Mediterranean', GRC: 'the country at the southern tip of the Balkan Peninsula, with many islands' },
    skip: [], avoid: { SRB: ['ALB'], ALB: ['SRB'], MNE: ['MKD'], MKD: ['MNE'] }, shapes: ['PRT', 'ESP', 'ITA', 'HRV', 'GRC', 'BIH', 'SRB', 'ALB'], shapeWhy: { ITA: 'a boot, with Sicily at its toe', HRV: 'a crescent, curving around Bosnia and Herzegovina', PRT: 'a narrow rectangle along the Atlantic', GRC: 'a mainland with long fingers of land and many islands' },
    facts: [['Slovenia, Croatia, Bosnia and Herzegovina, Serbia, Montenegro and North Macedonia were all once part of Yugoslavia.', true, 'They became separate countries in the 1990s and 2000s.'],
      ['Portugal borders France.', false, 'Portugal\'s only neighbor is Spain.'],
      ['Vatican City is inside the city of Rome.', true, 'It is the territory of the Holy See, a UN observer state.'],
      ['San Marino is surrounded by Italy.', true, 'San Marino is a tiny country in north-central Italy.'],
      ['Andorra lies in the Pyrenees, between France and Spain.', true, 'It is a tiny landlocked country in the mountains.'],
      ['Malta is an island country south of Sicily.', true, 'Malta is in the middle of the Mediterranean Sea.'],
      ['Serbia has a coast on the Adriatic Sea.', false, 'Serbia is landlocked.'],
      ['Greece is at the southern end of the Balkan Peninsula.', true, 'Greece has a mainland and thousands of islands.']],
    extra: [['landlocked'], ['landlocked'], []] };
  Gen('worldgeo.countries-southern-europe', locate(SEU));
  Gen('worldgeo.capitals-southern-europe', capitals(SEU));

  var EEU = { pool: ['POL', 'CZE', 'SVK', 'HUN', 'ROU', 'BGR', 'MDA', 'UKR', 'BLR', 'RUS'], region: 'eeu',
    regionOf: function (ids) { return uniq(ids.concat(['POL', 'UKR'])); },
    confuse: { SVK: ['SVN', 'CZE'], CZE: ['SVK', 'POL'], HUN: ['ROU', 'SVK'], ROU: ['HUN', 'BGR'], BGR: ['ROU', 'SRB'], MDA: ['ROU', 'UKR'], UKR: ['BLR', 'MDA'], BLR: ['UKR', 'POL'], POL: ['BLR', 'CZE'], RUS: ['UKR', 'BLR'] },
    where: { SVK: 'the landlocked country east of Czechia, north of Hungary', CZE: 'the landlocked country between Germany, Poland, Slovakia and Austria', HUN: 'the landlocked country in the middle of the Danube plain, south of Slovakia', ROU: 'the country on the Black Sea, east of Hungary', BGR: 'the country on the Black Sea, south of Romania', MDA: 'the small landlocked country between Romania and Ukraine', UKR: 'the large country north of the Black Sea', BLR: 'the landlocked country north of Ukraine', POL: 'the country on the Baltic Sea, east of Germany', RUS: 'the largest country in the world, stretching from Europe across northern Asia' },
    shapes: ['POL', 'CZE', 'SVK', 'HUN', 'ROU', 'BGR', 'UKR', 'BLR', 'MDA'],
    facts: [['Slovakia borders Czechia.', true, 'They were one country, Czechoslovakia, until 1993.'],
      ['Slovenia borders Czechia.', false, 'Slovenia is on the Adriatic, next to Italy and Croatia. Slovakia is the one next to Czechia.'],
      ['Russia is the largest country in the world by area.', true, 'Russia covers about 17 million square kilometers.'],
      ['Moldova lies between Romania and Ukraine.', true, 'It is a small landlocked country.'],
      ['Belarus is landlocked.', true, 'Belarus has no coast.'],
      ['Poland has a coast on the Baltic Sea.', true, 'Poland\'s north coast is on the Baltic.'],
      ['Hungary has a coast on the Black Sea.', false, 'Hungary is landlocked. Romania and Bulgaria have Black Sea coasts.']],
    extra: [['landlocked'], ['landlocked'], ['landlocked']] };
  Gen('worldgeo.countries-eastern-europe', locate(EEU));
  Gen('worldgeo.capitals-eastern-europe', capitals(Object.assign({}, EEU, { confuse: { HUN: ['ROU', 'SVK'], ROU: ['HUN', 'BGR'], SVK: ['CZE', 'HUN'], CZE: ['SVK', 'POL'], BGR: ['ROU'], MDA: ['ROU', 'UKR'], UKR: ['BLR', 'MDA'], BLR: ['UKR', 'POL'], POL: ['BLR', 'CZE'], RUS: ['UKR', 'BLR'] } })));

  var EUF = [
    { id: 'alps', n: 'the Alps', k: 'mountain range', group: 'range', d: 'the high range that curves through Switzerland, Austria, northern Italy and southeastern France' },
    { id: 'pyrenees', n: 'the Pyrenees', k: 'mountain range', group: 'range', d: 'the range between France and Spain' },
    { id: 'carpathians', n: 'the Carpathian Mountains', k: 'mountain range', group: 'range', d: 'the range that curves through Slovakia, Ukraine and Romania' },
    { id: 'urals', n: 'the Ural Mountains', k: 'mountain range', group: 'range', d: 'the long north-south range in Russia that is the usual border between Europe and Asia' },
    { id: 'apennines', n: 'the Apennines', k: 'mountain range', group: 'range', d: 'the range that runs down the length of Italy' },
    { id: 'scandinavianmts', n: 'the Scandinavian Mountains', k: 'mountain range', group: 'range', d: 'the range along the Scandinavian Peninsula, mostly in Norway' },
    { id: 'caucasus', n: 'the Caucasus Mountains', k: 'mountain range', group: 'range', d: 'the range between the Black Sea and the Caspian Sea' },
    { id: 'neplain', n: 'the North European Plain', k: 'plain', group: 'plain', d: 'the wide lowland from France through Germany and Poland into Russia' },
    { id: 'danube', n: 'the Danube River', k: 'river', group: 'river', d: 'the long river that flows east from Germany through ten countries to the Black Sea' },
    { id: 'rhine', n: 'the Rhine River', k: 'river', group: 'river', d: 'the river that flows north from the Alps through Germany and the Netherlands to the North Sea' },
    { id: 'volga', n: 'the Volga River', k: 'river', group: 'river', d: 'Europe\'s longest river, flowing through Russia to the Caspian Sea' },
    { id: 'dnieper', n: 'the Dnieper River', k: 'river', group: 'river', d: 'the river that flows south through Belarus and Ukraine to the Black Sea' },
    { id: 'thames', n: 'the Thames', k: 'river', group: 'river', d: 'the river that flows through London to the North Sea', markPt: [-1.0, 51.55] },
    { id: 'scandinavia', n: 'the Scandinavian Peninsula', k: 'peninsula', group: 'pen', d: 'the large peninsula of Norway and Sweden' },
    { id: 'balkan', n: 'the Balkan Peninsula', k: 'peninsula', group: 'pen', d: 'the peninsula in southeastern Europe, from Slovenia to Greece' }];
  var EU_MCQ = [['Which mountains are usually taken as the border between Europe and Asia?', 'The Ural Mountains', ['The Alps', 'The Pyrenees'], 'The Urals run north to south across Russia.'],
    ['Which mountain range separates France and Spain?', 'The Pyrenees', ['The Alps', 'The Carpathians'], 'The Pyrenees run from the Atlantic to the Mediterranean.'],
    ['Which peninsula do Spain and Portugal share?', 'The Iberian Peninsula', ['The Italian Peninsula', 'The Balkan Peninsula'], 'Spain and Portugal (and tiny Andorra and Gibraltar) are on the Iberian Peninsula.', 'Picture the southwest corner of Europe.', map({ region: ['ESP', 'PRT', 'FRA', 'ITA'], highlight: ['ESP', 'PRT'], color: 'plain', label: 'A map with two countries highlighted.' })],
    ['Into which sea does the Danube flow?', 'The Black Sea', ['The North Sea', 'The Baltic Sea'], 'The Danube flows east from Germany\'s Black Forest to the Black Sea.'],
    ['Why is western Europe milder in winter than places as far north in Canada?', 'Warm ocean water (the North Atlantic Current) and westerly winds', ['It is closer to the equator', 'It has more mountains'], 'The North Atlantic Current carries warm water toward Europe, and westerly winds bring that mild air over the land.'],
    ['Into which sea does the Rhine flow?', 'The North Sea', ['The Black Sea', 'The Mediterranean Sea'], 'The Rhine flows north from the Swiss Alps to the North Sea in the Netherlands.'],
    ['Which is Europe\'s longest river?', 'The Volga', ['The Thames', 'The Rhine'], 'The Volga flows through Russia to the Caspian Sea.']];
  Gen('worldgeo.physical-europe', physical({ feats: EUF, region: 'EU', regionFor: function (fs) { return fs.some(function (f) { return f.id === 'urals' || f.id === 'volga' || f.id === 'caucasus'; }) ? ['ESP', 'NOR', 'GRC', 'KAZ', 'FIN', 'GEO'] : ['ESP', 'NOR', 'GRC', 'POL', 'GBR', 'UKR']; },
    facts: [['Much of Europe is as far north as Canada.', true, 'London is about as far north as Calgary, Canada, and Paris is farther north than Seattle.'],
      ['Western Europe is mild because the North Atlantic Current brings warm water toward it.', true, 'The warm current and westerly winds keep winters mild near the coast.'],
      ['The Alps are in Spain and Portugal.', false, 'The Alps curve through Switzerland, Austria, northern Italy and southeastern France.'],
      ['The Rhine flows into the North Sea.', true, 'It reaches the sea in the Netherlands.'],
      ['The Danube flows into the North Sea.', false, 'The Danube flows east to the Black Sea.'],
      ['Italy is a peninsula.', true, 'The Italian Peninsula is shaped like a boot.'],
      ['The Pyrenees lie between France and Spain.', true, 'They run from the Bay of Biscay to the Mediterranean.']], mcq: EU_MCQ }));

  /* ================================================================== UNIT 9: AFRICA */
  var NAF = { pool: ['MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN'], region: 'naf',
    regionOf: function () { return ['MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN', 'ESH']; },
    confuse: { MAR: ['DZA', 'TUN'], DZA: ['MAR', 'LBY'], TUN: ['LBY', 'MAR'], LBY: ['TUN', 'EGY'], EGY: ['SDN', 'LBY'], SDN: ['EGY', 'LBY'] },
    where: { MAR: 'the country in the northwest corner of Africa, with coasts on the Atlantic and the Mediterranean', DZA: 'the largest country in Africa, between Morocco and Libya', TUN: 'the smallest country of North Africa, on the Mediterranean between Algeria and Libya', LBY: 'the country on the Mediterranean between Tunisia and Egypt', EGY: 'the country in the northeast corner of Africa, on the Nile', SDN: 'the country south of Egypt, on the Red Sea and the Nile' },
    shapes: ['MAR', 'DZA', 'TUN', 'LBY', 'EGY', 'SDN'], shapeWhy: { EGY: 'nearly square, with the Sinai Peninsula in the northeast', TUN: 'small and tall', DZA: 'huge, reaching deep into the Sahara' },
    facts: [['The Sahara stretches across about ten countries and territories.', true, 'It reaches from the Atlantic to the Red Sea.'],
      ['The Sahara is a country.', false, 'The Sahara is a desert that covers parts of about ten countries and territories.'],
      ['Algeria is the largest country in Africa by area.', true, 'Algeria covers about 2.4 million square kilometers.'],
      ['Morocco has coasts on both the Atlantic Ocean and the Mediterranean Sea.', true, 'Morocco is at the northwest corner of Africa.'],
      ['Egypt\'s capital, Cairo, is on the Nile.', true, 'Cairo sits where the Nile spreads into its delta.'],
      ['Tunisia is the smallest country of North Africa.', true, 'Tunisia is small next to its huge neighbors Algeria and Libya.'],
      ['Western Sahara is one of the 193 UN member states.', false, 'Western Sahara is a territory whose status is disputed; it is not a UN member. The UN lists it as a non-self-governing territory.']] };
  Gen('worldgeo.countries-north-africa', combined(NAF));

  var WAF = { pool: ['SEN', 'GMB', 'GNB', 'GIN', 'SLE', 'LBR', 'CIV', 'GHA', 'TGO', 'BEN', 'NGA', 'NER', 'BFA', 'MLI', 'MRT', 'CPV'], region: 'waf',
    confuse: { GIN: ['GNB', 'GNQ'], GNB: ['GIN', 'GNQ'], NER: ['NGA'], NGA: ['NER', 'CMR'], GMB: ['SEN', 'GNB'], SEN: ['GMB', 'MRT'], GHA: ['TGO', 'CIV'], TGO: ['BEN', 'GHA'], BEN: ['TGO', 'NGA'], LBR: ['SLE', 'CIV'], SLE: ['LBR', 'GIN'], MLI: ['MRT', 'NER'], MRT: ['MLI', 'SEN'], BFA: ['NER', 'MLI'], CIV: ['GHA', 'LBR'], CPV: ['GMB', 'GNB'] },
    where: { GIN: 'the country on the west coast, curving around Sierra Leone, next to Guinea-Bissau', GNB: 'the small country on the west coast between Senegal and Guinea', GMB: 'the narrow country along the Gambia River, almost surrounded by Senegal', NGA: 'the large country at the east end of West Africa, on the Gulf of Guinea', NER: 'the large landlocked country north of Nigeria, in the Sahara and the Sahel', TGO: 'the narrow country between Ghana and Benin', BEN: 'the narrow country between Togo and Nigeria', CPV: 'the group of islands out in the Atlantic, west of Senegal', LBR: 'the country on the coast southeast of Sierra Leone', SLE: 'the small country on the coast between Guinea and Liberia', BFA: 'the landlocked country north of Ghana', MLI: 'the large landlocked country east of Mauritania, reaching into the Sahara', MRT: 'the large country on the Atlantic coast north of Senegal' },
    shapes: ['NGA', 'NER', 'MLI', 'MRT', 'GHA', 'TGO', 'BEN', 'SEN', 'GIN', 'CIV', 'BFA', 'GMB'], shapeWhy: { GMB: 'a long, thin strip along a river', TGO: 'a narrow strip running north from the coast', BEN: 'narrow at the coast and wider to the north' },
    facts: [['Nigeria is the most populous country in Africa.', true, 'Nigeria has about 233 million people (UN, 2024).'],
      ['The Gambia is almost completely surrounded by Senegal.', true, 'The Gambia follows the Gambia River inland; its only other side is the Atlantic coast.'],
      ['Niger and Nigeria are the same country.', false, 'Niger is the large landlocked country to the north; Nigeria is on the coast to the south.'],
      ['Equatorial Guinea is in West Africa, next to Guinea.', false, 'Equatorial Guinea is far to the east, in Central Africa, next to Cameroon and Gabon.'],
      ['Cabo Verde is a group of islands in the Atlantic Ocean.', true, 'It lies about 600 km west of Senegal.'],
      ['Mali, Niger and Burkina Faso are landlocked.', true, 'All three are far from the coast, in the Sahel and the Sahara.'],
      ['Guinea-Bissau borders Guinea.', true, 'Guinea-Bissau is just northwest of Guinea.']],
    extra: [['landlocked'], ['landlocked'], ['landlocked']] };
  Gen('worldgeo.countries-west-africa', locate(WAF));
  Gen('worldgeo.capitals-west-africa', capitals(WAF));

  var MAF = { pool: ['CMR', 'TCD', 'CAF', 'GNQ', 'GAB', 'COG', 'COD', 'AGO', 'STP'], region: 'maf', textOnly: ['GNQ'],
    confuse: { COG: ['COD', 'GAB'], COD: ['COG', 'CAF'], GAB: ['GNQ', 'COG'], GNQ: ['GAB', 'GIN', 'GNB'], CAF: ['TCD', 'COD'], TCD: ['CAF', 'NER'], CMR: ['GAB', 'NGA'], STP: ['GNQ', 'GAB'], AGO: ['COD', 'ZMB'] },
    where: { COD: 'the very large country in the middle of Africa, the second largest on the continent', COG: 'the smaller Congo, west of the Congo River', GNQ: 'the small country on the coast between Cameroon and Gabon, with the island of Bioko', GAB: 'the country on the equator, on the Atlantic coast', CAF: 'the landlocked country in the very middle of Africa, north of the two Congos', TCD: 'the large landlocked country north of the Central African Republic, reaching into the Sahara', CMR: 'the country on the Gulf of Guinea, between Nigeria and Gabon', STP: 'two small islands in the Gulf of Guinea', AGO: 'the large country south of the DR Congo, on the Atlantic coast' },
    shapes: ['CMR', 'TCD', 'CAF', 'GAB', 'COG', 'COD', 'AGO'], shapeWhy: { CMR: 'a triangle that stretches north to Lake Chad', COD: 'huge, with only a tiny piece of Atlantic coast' },
    facts: [['The Democratic Republic of the Congo is much larger than the Republic of the Congo.', true, 'The DR Congo is the second-largest country in Africa.'],
      ['Kinshasa and Brazzaville face each other across the Congo River.', true, 'Only the river separates the two capital cities.'],
      ['Chad and the Central African Republic are landlocked.', true, 'Both are far inland.'],
      ['São Tomé and Príncipe is an island country in the Gulf of Guinea.', true, 'It is made of two main islands.'],
      ['The equator crosses Gabon.', true, 'The equator runs through Gabon, the Republic of the Congo and the DR Congo.'],
      ['The Republic of the Congo is the larger of the two Congos.', false, 'The Democratic Republic of the Congo is far larger.']],
    extra: [['landlocked'], ['landlocked'], []] };
  Gen('worldgeo.countries-central-africa', locate(MAF));
  Gen('worldgeo.capitals-central-africa', capitals(MAF));

  var EAF = { pool: ['ERI', 'DJI', 'ETH', 'SOM', 'SSD', 'KEN', 'UGA', 'RWA', 'BDI', 'TZA', 'MWI', 'ZMB', 'ZWE', 'MOZ', 'MDG', 'COM', 'MUS', 'SYC'], region: 'eaf',
    confuse: { RWA: ['BDI', 'UGA'], BDI: ['RWA'], ERI: ['DJI', 'ETH'], DJI: ['ERI', 'SOM'], ZMB: ['ZWE', 'MWI'], ZWE: ['ZMB', 'MOZ'], MWI: ['ZMB', 'MOZ'], MUS: ['SYC', 'COM'], SYC: ['MUS', 'COM'], COM: ['MUS', 'SYC'], UGA: ['KEN', 'RWA'], KEN: ['UGA', 'TZA'], SOM: ['ETH', 'DJI'], ETH: ['SOM', 'ERI'], SSD: ['SDN', 'UGA'], TZA: ['KEN', 'MOZ'], MOZ: ['MWI', 'TZA'], MDG: ['MOZ', 'COM'] },
    where: { ETH: 'the large landlocked country in the Horn of Africa', SOM: 'the country along the coast of the Horn of Africa, shaped like a number 7', ERI: 'the country on the Red Sea north of Ethiopia', DJI: 'the small country at the mouth of the Red Sea, between Eritrea and Somalia', KEN: 'the country on the Indian Ocean that the equator crosses, east of Uganda', UGA: 'the landlocked country on the north shore of Lake Victoria', RWA: 'the small landlocked country just north of Burundi', BDI: 'the small landlocked country just south of Rwanda, on Lake Tanganyika', TZA: 'the large country south of Kenya, with Mount Kilimanjaro', MDG: 'the large island off the southeast coast', ZMB: 'the landlocked country north of Zimbabwe, across the Zambezi River', ZWE: 'the landlocked country south of Zambia', MWI: 'the long, narrow landlocked country along Lake Malawi', SSD: 'the landlocked country south of Sudan', MUS: 'a small island country in the Indian Ocean, east of Madagascar', SYC: 'a group of small islands in the Indian Ocean, northeast of Madagascar', COM: 'a group of islands between Mozambique and Madagascar' },
    shapes: ['ETH', 'SOM', 'KEN', 'TZA', 'UGA', 'MDG', 'MOZ', 'ZMB', 'ZWE', 'MWI', 'SSD', 'ERI'], shapeWhy: { SOM: 'shaped like the number 7', MWI: 'long and thin', MDG: 'one long island', ZMB: 'shaped like a butterfly' },
    facts: [['The Horn of Africa holds Somalia, Ethiopia, Eritrea and Djibouti.', true, 'The Horn is the peninsula that sticks out into the Indian Ocean.'],
      ['The Horn of Africa is one country.', false, 'It is a peninsula with four countries: Somalia, Ethiopia, Eritrea and Djibouti.'],
      ['Madagascar is a large island country off the coast of East Africa.', true, 'It is one of the largest islands in the world.'],
      ['Ethiopia is landlocked.', true, 'Ethiopia has no coast; Eritrea and Djibouti lie between it and the sea.'],
      ['The equator crosses Kenya.', true, 'The equator runs through Kenya, Uganda and Somalia.'],
      ['Lake Victoria is shared by Kenya, Uganda and Tanzania.', true, 'It is the largest lake in Africa.'],
      ['South Sudan has a coast on the Red Sea.', false, 'South Sudan is landlocked.'],
      ['Mauritius, Seychelles and Comoros are island countries in the Indian Ocean.', true, 'All three are groups of islands off East Africa.']],
    extra: [['landlocked'], ['landlocked'], ['landlocked']] };
  Gen('worldgeo.countries-east-africa', locate(EAF));
  Gen('worldgeo.capitals-east-africa', capitals(EAF));

  var SAF = { pool: ['ZAF', 'NAM', 'BWA', 'LSO', 'SWZ'], region: 'saf',
    regionOf: function () { return ['ZAF', 'NAM', 'BWA', 'LSO', 'SWZ', 'ZWE', 'MOZ']; },
    confuse: { LSO: ['SWZ'], SWZ: ['LSO'], NAM: ['BWA'], BWA: ['NAM', 'ZWE'], ZAF: ['NAM'] },
    where: { LSO: 'the small country completely surrounded by South Africa', SWZ: 'the small country between South Africa and Mozambique', NAM: 'the country on the Atlantic coast, north of South Africa', BWA: 'the landlocked country north of South Africa, mostly covered by the Kalahari', ZAF: 'the country at the southern tip of Africa' },
    shapes: ['ZAF', 'NAM', 'BWA', 'LSO', 'SWZ'], shapeWhy: { NAM: 'with a long, thin strip (the Caprivi Strip) reaching east', LSO: 'a small, round country' },
    facts: [['Lesotho is completely surrounded by South Africa.', true, 'Lesotho is an independent country inside South Africa.'],
      ['Lesotho is part of South Africa.', false, 'Lesotho is an independent country; it is surrounded by South Africa.'],
      ['South Africa has three capital cities.', true, 'Pretoria (executive), Cape Town (legislative) and Bloemfontein (judicial).'],
      ['Eswatini was called Swaziland until 2018.', true, 'Both names appear on older maps.'],
      ['Namibia has a coast on the Atlantic Ocean.', true, 'The Namib Desert runs along that coast.'],
      ['Botswana is landlocked.', true, 'Botswana has no coast.'],
      ['Johannesburg is one of South Africa\'s capitals.', false, 'Johannesburg is the largest city; the capitals are Pretoria, Cape Town and Bloemfontein.']],
    extra: [['zaf'], ['zaf', 'landlocked'], ['zaf', 'landlocked']],
    special: { zaf: function (R, L) {
      var caps = ['Pretoria', 'Cape Town', 'Bloemfontein'], not = R.pick(['Johannesburg', 'Durban']);
      if (L === 3) { var miss = R.pick(caps), rest = caps.filter(function (c) { return c !== miss; });
        return { q: 'South Africa has three capitals: ' + rest.join(', ') + ' and one more. Type the third.', a: { t: 'text', v: [miss] }, hint: 'One is for the government leaders, one for parliament, one for the highest courts.',
          steps: ['Pretoria is the executive capital (the president and government), Cape Town the legislative capital (parliament), and Bloemfontein the judicial capital (the highest court of appeal).', 'The missing one is ' + miss + '.'] }; }
      var ch = R.shuffle(caps.concat([not]));
      return { q: 'Which of these cities is ' + b('not') + ' one of South Africa\'s three capitals?', a: mc(ch, not), hint: 'The largest city is not always a capital.',
        steps: ['South Africa\'s capitals are Pretoria, Cape Town and Bloemfontein.', not + ' is a big city, but not a capital.'] }; } } };
  var SAFcap = Object.assign({}, SAF);
  Gen('worldgeo.countries-southern-africa', function (R, ctx) { return combined(SAF, SAFcap)(R, ctx); });

  var AFF = [
    { id: 'sahara', n: 'the Sahara', k: 'desert', group: 'desert', d: 'the largest hot desert on Earth, across northern Africa' },
    { id: 'kalahari', n: 'the Kalahari Desert', k: 'desert', group: 'desert', d: 'the dry, sandy land of Botswana and its neighbors, in southern Africa' },
    { id: 'namib', n: 'the Namib Desert', k: 'desert', group: 'desert', d: 'the desert along the Atlantic coast of Namibia' },
    { id: 'sahel', n: 'the Sahel', k: 'region', group: 'desert', d: 'the dry grassland belt along the southern edge of the Sahara' },
    { id: 'nile', n: 'the Nile River', k: 'river', group: 'river', d: 'the river that flows north from East Africa through Sudan and Egypt to the Mediterranean' },
    { id: 'congo', n: 'the Congo River', k: 'river', group: 'river', d: 'the great river of Central Africa, which crosses the equator twice on its way to the Atlantic' },
    { id: 'niger', n: 'the Niger River', k: 'river', group: 'river', d: 'the river of West Africa that curves through Mali and Niger to Nigeria' },
    { id: 'zambezi', n: 'the Zambezi River', k: 'river', group: 'river', d: 'the river of southern Africa that flows east to the Indian Ocean, with Victoria Falls on it' },
    { id: 'riftvalley', n: 'the Great Rift Valley', k: 'valley', group: 'land', d: 'the long chain of valleys and lakes in East Africa, where the land is pulling apart' },
    { id: 'ethiopianhighlands', n: 'the Ethiopian Highlands', k: 'highland', group: 'land', d: 'the high plateau of Ethiopia, where the Blue Nile begins' },
    { id: 'atlas', n: 'the Atlas Mountains', k: 'mountain range', group: 'land', d: 'the range in Morocco, Algeria and Tunisia, in the northwest' },
    { id: 'congobasin', n: 'the Congo Basin', k: 'basin', group: 'land', d: 'the rainforest lowland drained by the Congo River' },
    { id: 'kilimanjaro', n: 'Mount Kilimanjaro', k: 'mountain', group: 'point', pt: [37.35, -3.07], d: 'Africa\'s highest mountain (about 5,895 m), in Tanzania near the border with Kenya' },
    { id: 'victoria', n: 'Lake Victoria', k: 'lake', group: 'point', pt: [33.0, -1.0], d: 'Africa\'s largest lake, shared by Uganda, Kenya and Tanzania' },
    { id: 'tanganyika', n: 'Lake Tanganyika', k: 'lake', group: 'point', pt: [29.6, -6.0], d: 'the long, deep lake in the western branch of the Rift Valley' },
    { id: 'lakechad', n: 'Lake Chad', k: 'lake', group: 'point', pt: [14.3, 13.2], d: 'the shallow lake on the edge of the Sahara, where Chad, Niger, Nigeria and Cameroon meet' }];
  Gen('worldgeo.physical-africa', physical({ feats: AFF, region: 'AF',
    facts: [['Africa is all desert.', false, 'Africa has deserts, but also wide savannas, rainforests, high plateaus and snowy mountains.'],
      ['The Sahel lies along the southern edge of the Sahara.', true, 'It is a belt of dry grassland between the desert and the wetter savannas.'],
      ['The Nile flows north.', true, 'It flows from East Africa north to the Mediterranean Sea.'],
      ['Mount Kilimanjaro, in Tanzania, is the highest mountain in Africa.', true, 'It is about 5,895 m high, with snow near the equator.'],
      ['Lake Victoria is the largest lake in Africa.', true, 'It is shared by Uganda, Kenya and Tanzania.'],
      ['The Kalahari is in North Africa.', false, 'The Kalahari is in southern Africa, mostly in Botswana.'],
      ['The Congo River crosses the equator twice.', true, 'It flows north across the equator and then curves back south across it to the Atlantic.']],
    mcq: [['Which river flows north through Egypt?', 'The Nile', ['The Congo', 'The Zambezi'], 'The Nile flows north to the Mediterranean.'],
      ['Which is Africa\'s highest mountain?', 'Mount Kilimanjaro', ['The Atlas Mountains', 'The Ethiopian Highlands'], 'Kilimanjaro, in Tanzania, is about 5,895 m high.'],
      ['What covers most of the land near the equator in Central Africa?', 'Rainforest', ['Desert', 'Ice'], 'The Congo Basin is covered by the second-largest rainforest on Earth.'],
      ['Which describes Africa best?', 'Deserts, savannas, rainforests, plateaus and mountains', ['Almost all desert', 'Almost all rainforest'], 'Africa has every one of these.'],
      ['Where is the Great Rift Valley?', 'In East Africa', ['In the Sahara', 'Along the Atlantic coast'], 'The Rift Valley runs from the Red Sea south through Ethiopia, Kenya and Tanzania toward Mozambique.'],
      ['Which is the largest lake in Africa?', 'Lake Victoria', ['Lake Chad', 'Lake Tanganyika'], 'Lake Victoria covers about 68,800 square kilometers.']] }));

  /* ================================================================== UNIT 10: ASIA */
  var WAS = { pool: ['TUR', 'GEO', 'ARM', 'AZE', 'CYP', 'SYR', 'LBN', 'JOR', 'IRQ', 'KWT', 'SAU', 'BHR', 'QAT', 'ARE', 'OMN', 'YEM', 'ISR', 'PSE'], skip: ['ISR', 'PSE'], region: 'was',
    confuse: { IRQ: ['IRN', 'SYR'], SYR: ['IRQ', 'JOR', 'LBN'], JOR: ['SYR', 'IRQ'], LBN: ['SYR', 'CYP'], QAT: ['BHR', 'ARE'], BHR: ['QAT', 'KWT'], KWT: ['BHR', 'QAT'], ARE: ['QAT', 'OMN'], OMN: ['YEM', 'ARE'], YEM: ['OMN', 'SAU'], ARM: ['AZE', 'GEO'], AZE: ['ARM', 'GEO'], GEO: ['ARM', 'AZE'], TUR: ['SYR', 'GEO'], CYP: ['LBN', 'TUR'], SAU: ['YEM', 'IRQ'] },
    where: { IRQ: 'the country between Syria and Iran, where the Tigris and Euphrates flow', TUR: 'the large country between the Black Sea and the Mediterranean, partly in Europe', SAU: 'the country that covers most of the Arabian Peninsula', YEM: 'the country at the southwest corner of the Arabian Peninsula', OMN: 'the country on the southeast corner of the Arabian Peninsula', BHR: 'the small island country in the Gulf, off the coast of Saudi Arabia', QAT: 'the small peninsula sticking north into the Gulf', KWT: 'the small country at the top of the Gulf, between Iraq and Saudi Arabia', ARE: 'the country on the Gulf between Qatar and Oman', GEO: 'the country on the Black Sea, south of the Caucasus Mountains', ARM: 'the small landlocked country between Georgia, Azerbaijan, Iran and Türkiye', AZE: 'the country on the Caspian Sea, east of Armenia', CYP: 'the island in the eastern Mediterranean', LBN: 'the small country on the Mediterranean coast, west of Syria', JOR: 'the country east of the Jordan River, south of Syria', SYR: 'the country between Türkiye and Iraq, on the Mediterranean' },
    shapes: ['TUR', 'SAU', 'IRQ', 'SYR', 'YEM', 'OMN', 'JOR', 'GEO', 'AZE', 'QAT'], shapeWhy: { TUR: 'a long rectangle, with a small piece in Europe', QAT: 'a small thumb of land', SAU: 'huge, covering most of the Arabian Peninsula' },
    facts: [['The Tigris and Euphrates rivers flow through Iraq.', true, 'Much of Iraq lies between these two rivers.'],
      ['Iran is west of Iraq.', false, 'Iran is east of Iraq, and much larger.'],
      ['Saudi Arabia covers most of the Arabian Peninsula.', true, 'The rest is Yemen, Oman, the United Arab Emirates, Qatar and Kuwait.'],
      ['Bahrain is an island country in the Gulf.', true, 'It lies off the coast of Saudi Arabia.'],
      ['Türkiye lies partly in Europe and partly in Asia.', true, 'Istanbul sits on both sides of the Bosporus.'],
      ['Armenia is landlocked.', true, 'Armenia has no coast.'],
      ['Georgia, Armenia and Azerbaijan lie in the region called the Caucasus.', true, 'They are between the Black Sea and the Caspian Sea.']],
    extra: [['iranIraq'], ['iranIraq'], ['iranIraq']],
    special: { iranIraq: function (R, L) {
      var t = R.coin(), mk = t ? { IRQ: 'A', IRN: 'B' } : { IRN: 'A', IRQ: 'B' }, ask = R.pick(['IRQ', 'IRN']);
      return { q: 'Iran and Iraq sit side by side. Which letter marks ' + b(nm(ask)) + '?', viz: map({ region: ['IRQ', 'IRN', 'SYR', 'SAU'], mark: mk, label: 'A map with two lettered countries.' }), a: letters(2, mk[ask] === 'A' ? 0 : 1),
        hint: 'One is the smaller country on the Tigris and Euphrates; the other is the larger one to the east.',
        steps: ['Iraq is the smaller, western one, where the Tigris and Euphrates flow. Iran is the larger one to the east.', nm(ask) + ' is letter ' + mk[ask] + '.'] }; } } };
  Gen('worldgeo.countries-southwest-asia', locate(WAS));
  Gen('worldgeo.capitals-southwest-asia', capitals(WAS));

  var CSA = { pool: ['KAZ', 'UZB', 'TKM', 'KGZ', 'TJK', 'AFG', 'IRN', 'PAK', 'IND', 'NPL', 'BTN', 'BGD', 'LKA', 'MDV'], region: 'csa', noNb: ['IND', 'PAK', 'CHN', 'AFG'],
    confuse: { KGZ: ['TJK', 'KAZ'], TJK: ['KGZ', 'AFG'], TKM: ['UZB', 'KAZ'], UZB: ['TKM', 'KAZ'], KAZ: ['UZB', 'TKM'], NPL: ['BTN', 'BGD'], BTN: ['NPL', 'BGD'], BGD: ['BTN', 'NPL'], LKA: ['MDV', 'BGD'], MDV: ['LKA'], AFG: ['PAK', 'TJK'], PAK: ['AFG', 'IND'], IRN: ['IRQ', 'AFG'], IND: ['PAK', 'BGD'] },
    where: { KAZ: 'the largest of the Central Asian countries, south of Russia', UZB: 'the country in the middle of Central Asia, south of Kazakhstan', TKM: 'the country on the Caspian Sea, north of Iran', KGZ: 'the small mountain country east of Uzbekistan, next to China', TJK: 'the small mountain country north of Afghanistan', AFG: 'the landlocked country between Iran and Pakistan', IRN: 'the large country between Iraq and Pakistan, on the Gulf and the Caspian Sea', PAK: 'the country along the Indus River, west of India', IND: 'the large country on the peninsula south of the Himalayas', NPL: 'the landlocked country in the Himalayas, west of Bhutan', BTN: 'the small landlocked country in the eastern Himalayas', BGD: 'the country on the Bay of Bengal, almost surrounded by India', LKA: 'the island off the southern tip of India', MDV: 'a chain of tiny islands in the Indian Ocean, southwest of India' },
    shapes: ['KAZ', 'UZB', 'TKM', 'KGZ', 'TJK', 'AFG', 'IRN', 'PAK', 'NPL', 'BGD', 'LKA'], shapeWhy: { LKA: 'a teardrop-shaped island', NPL: 'a long, thin rectangle', KAZ: 'very wide from east to west' },
    facts: [['Kazakhstan is the largest of the five Central Asian "-stan" countries.', true, 'From largest to smallest: Kazakhstan, Turkmenistan, Uzbekistan, Kyrgyzstan, Tajikistan.'],
      ['Tajikistan is the largest of the Central Asian "-stans".', false, 'Tajikistan is the smallest; Kazakhstan is the largest.'],
      ['Nepal and Bhutan lie in the Himalayas between India and China.', true, 'Both are landlocked mountain countries.'],
      ['Bangladesh is almost surrounded by India.', true, 'Bangladesh also borders Myanmar and has a coast on the Bay of Bengal.'],
      ['Sri Lanka is an island south of India.', true, 'It lies just off India\'s southern tip.'],
      ['Kazakhstan has a coast on the open ocean.', false, 'Kazakhstan is landlocked; it is the largest landlocked country in the world.'],
      ['Uzbekistan is doubly landlocked: all of its neighbors are landlocked too.', true, 'Liechtenstein, in Europe, is the only other doubly landlocked country.']],
    extra: [['stans'], ['stans', 'landlocked'], ['stans', 'landlocked']],
    special: { stans: function (R, L) {
      var order = ['KAZ', 'TKM', 'UZB', 'KGZ', 'TJK'], pick = R.sample(order, 3), big = L === 3 ? !R.coin() : true;
      var right = pick.slice().sort(function (a, c) { return big ? order.indexOf(a) - order.indexOf(c) : order.indexOf(c) - order.indexOf(a); })[0];
      return { q: 'Which of these Central Asian countries is the ' + (big ? 'largest' : 'smallest') + ' by area?', a: mc(R.shuffle(pick.map(nm)), nm(right)), hint: 'From largest to smallest: Kazakhstan, Turkmenistan, Uzbekistan, Kyrgyzstan, Tajikistan.',
        viz: map({ region: order, highlight: pick, label: 'A map of Central Asia with three countries highlighted.' }),
        steps: ['From largest to smallest, the five are Kazakhstan, Turkmenistan, Uzbekistan, Kyrgyzstan and Tajikistan.', 'So of ' + listAnd(pick.map(nm)) + ', the ' + (big ? 'largest' : 'smallest') + ' is ' + nm(right) + '.'] }; } } };
  Gen('worldgeo.countries-central-south-asia', locate(CSA));
  Gen('worldgeo.capitals-central-south-asia', capitals(CSA));

  var EAS = { pool: ['CHN', 'JPN', 'MNG', 'PRK', 'KOR'], region: 'eas', noNb: ['CHN'],
    regionOf: function () { return ['CHN', 'JPN', 'MNG', 'PRK', 'KOR']; },
    confuse: { PRK: ['KOR'], KOR: ['PRK', 'JPN'], JPN: ['KOR'], MNG: ['CHN'], CHN: ['MNG'] },
    where: { CHN: 'the huge country that covers most of East Asia', JPN: 'the chain of islands east of Korea', MNG: 'the landlocked country between Russia and China', PRK: 'the northern half of the Korean Peninsula', KOR: 'the southern half of the Korean Peninsula' },
    shapes: ['CHN', 'JPN', 'MNG', 'PRK', 'KOR'], noOutline: false,
    facts: [['Mongolia is landlocked, between Russia and China.', true, 'Mongolia has only two neighbors.'],
      ['Japan is made up of islands.', true, 'Its four main islands are Hokkaido, Honshu, Shikoku and Kyushu.'],
      ['North Korea and South Korea share the Korean Peninsula.', true, 'North Korea is the northern part, South Korea the southern.'],
      ['Shanghai is the capital of China.', false, 'Shanghai is China\'s largest city; the capital is Beijing.'],
      ['Tokyo is on the island of Honshu.', true, 'Honshu is Japan\'s largest island.'],
      ['Taiwan is one of the 193 UN member states.', false, 'Taiwan governs itself but is not a UN member; its status is disputed, and countries treat it in different ways.']] };
  Gen('worldgeo.countries-east-asia', combined(EAS));

  var SEA = { pool: ['MMR', 'THA', 'LAO', 'KHM', 'VNM', 'MYS', 'SGP', 'BRN', 'IDN', 'PHL', 'TLS'], region: 'sea',
    confuse: { LAO: ['KHM', 'VNM'], KHM: ['LAO', 'THA'], VNM: ['LAO', 'KHM'], BRN: ['SGP', 'MYS'], SGP: ['BRN', 'MYS'], TLS: ['IDN', 'PHL'], MYS: ['IDN', 'BRN'], IDN: ['MYS', 'PHL'], MMR: ['THA', 'LAO'], THA: ['MMR', 'KHM'], PHL: ['IDN', 'MYS'] },
    where: { LAO: 'the landlocked country between Vietnam and Thailand', KHM: 'the country south of Laos, between Thailand and Vietnam', VNM: 'the long S-shaped country along the east coast of the Indochina Peninsula', THA: 'the country in the middle of the mainland, with a long arm down the Malay Peninsula', MMR: 'the country west of Thailand, on the Bay of Bengal', MYS: 'the country partly on the Malay Peninsula and partly on the island of Borneo', SGP: 'the small island city-state at the tip of the Malay Peninsula', BRN: 'the small country on the north coast of Borneo', IDN: 'the country of thousands of islands, from Sumatra to New Guinea', PHL: 'the country of islands east of Vietnam, north of Borneo', TLS: 'the eastern half of the island of Timor' },
    shapes: ['MMR', 'THA', 'LAO', 'KHM', 'VNM', 'PHL', 'IDN'], shapeWhy: { VNM: 'long and S-shaped', THA: 'like an elephant\'s head, with its trunk running down the Malay Peninsula', IDN: 'a long chain of islands' },
    facts: [['Indonesia is a single island.', false, 'Indonesia is made of more than 17,000 islands; it is the largest island country in the world.'],
      ['Laos is the only landlocked country in Southeast Asia.', true, 'Every other Southeast Asian country has a coast.'],
      ['Malaysia is partly on the mainland and partly on the island of Borneo.', true, 'The South China Sea lies between its two parts.'],
      ['Brunei is on the island of Borneo.', true, 'Borneo is shared by Indonesia, Malaysia and Brunei.'],
      ['Timor-Leste shares the island of Timor with Indonesia.', true, 'Timor-Leste is the eastern half of the island.'],
      ['Singapore is a city-state at the southern tip of the Malay Peninsula.', true, 'It is one main island and many small ones.'],
      ['The Philippines is on the mainland of Asia.', false, 'The Philippines is a country of more than 7,000 islands.']],
    extra: [['mainland'], ['mainland'], ['mainland']],
    special: { mainland: function (R, L) {
      var main = ['MMR', 'THA', 'LAO', 'KHM', 'VNM'], isl = ['IDN', 'PHL', 'SGP', 'BRN', 'TLS'], m = R.coin();
      var right = R.pick(m ? main : isl), wrong = R.sample(m ? isl : main, L === 1 ? 2 : 3), ch = R.shuffle([right].concat(wrong));
      return { q: 'Which of these countries is ' + (m ? b('on the mainland') + ' of Asia (on the Indochina Peninsula)' : b('only on islands')) + '?', a: mc(ch.map(nm), nm(right)), hint: 'Picture the map: the mainland peninsula, then the islands to the south and east.',
        steps: ['The mainland countries of Southeast Asia are Myanmar, Thailand, Laos, Cambodia and Vietnam (and part of Malaysia).', 'The island countries are Indonesia, the Philippines, Singapore, Brunei and Timor-Leste.', 'So the answer is ' + tn(right) + '.'] }; } } };
  Gen('worldgeo.countries-southeast-asia', locate(SEA));
  Gen('worldgeo.capitals-southeast-asia', capitals(SEA));

  var ASF = [
    { id: 'himalayas', n: 'the Himalayas', k: 'mountain range', group: 'range', d: 'the highest mountains on Earth, between India and the Plateau of Tibet' },
    { id: 'hindukush', n: 'the Hindu Kush', k: 'mountain range', group: 'range', d: 'the range in Afghanistan and Pakistan' },
    { id: 'tianshan', n: 'the Tian Shan', k: 'mountain range', group: 'range', d: 'the range in Kyrgyzstan and western China' },
    { id: 'zagros', n: 'the Zagros Mountains', k: 'mountain range', group: 'range', d: 'the range in western Iran' },
    { id: 'tibet', n: 'the Plateau of Tibet', k: 'plateau', group: 'land', d: 'the highest and largest plateau on Earth, north of the Himalayas' },
    { id: 'siberia', n: 'Siberia', k: 'region', group: 'land', d: 'the huge, cold land of northern Asia, in Russia' },
    { id: 'deccan', n: 'the Deccan Plateau', k: 'plateau', group: 'land', d: 'the plateau that covers most of southern India' },
    { id: 'gobi', n: 'the Gobi Desert', k: 'desert', group: 'desert', d: 'the cold desert of southern Mongolia and northern China' },
    { id: 'arabianpen', n: 'the Arabian Peninsula', k: 'peninsula', group: 'land', d: 'the large, dry peninsula between the Red Sea and the Gulf' },
    { id: 'taklimakan', n: 'the Taklimakan Desert', k: 'desert', group: 'desert', d: 'the sandy desert in western China' },
    { id: 'thar', n: 'the Thar Desert', k: 'desert', group: 'desert', d: 'the desert on the border of India and Pakistan' },
    { id: 'yangtze', n: 'the Yangtze River', k: 'river', group: 'river', d: 'Asia\'s longest river, flowing east across China to the sea at Shanghai' },
    { id: 'yellow', n: 'the Yellow River (Huang He)', k: 'river', group: 'river', d: 'the river of northern China that carries yellow silt' },
    { id: 'ganges', n: 'the Ganges River', k: 'river', group: 'river', d: 'the river that flows from the Himalayas across northern India to the Bay of Bengal' },
    { id: 'indus', n: 'the Indus River', k: 'river', group: 'river', d: 'the river that flows through Pakistan to the Arabian Sea' },
    { id: 'mekong', n: 'the Mekong River', k: 'river', group: 'river', d: 'the river that flows south from Tibet through Laos, Cambodia and Vietnam' },
    { id: 'euphrates', n: 'the Euphrates River', k: 'river', group: 'river2', d: 'the western of the two great rivers of Iraq, flowing from Türkiye' },
    { id: 'tigris', n: 'the Tigris River', k: 'river', group: 'river2', d: 'the eastern of the two great rivers of Iraq, flowing past Baghdad' },
    { id: 'everest', n: 'Mount Everest', k: 'mountain', group: 'point', pt: [86.93, 27.99], d: 'the highest mountain on Earth (about 8,849 m), on the border of Nepal and China' },
    { id: 'baikal', n: 'Lake Baikal', k: 'lake', group: 'point', pt: [108.0, 53.5], d: 'the deepest lake on Earth, in southern Siberia' }];
  Gen('worldgeo.physical-asia', physical({ feats: ASF, region: 'AS',
    regionFor: function (fs) { var sw = fs.every(function (f) { return f.group === 'river2' || f.id === 'zagros' || f.id === 'arabianpen'; }); return sw ? ['IRQ', 'SYR', 'IRN', 'SAU', 'TUR'] : ['CHN', 'IND', 'SAU', 'MNG', 'IDN', 'KAZ']; },
    facts: [['Many of Asia\'s great rivers begin on or near the Plateau of Tibet.', true, 'The Yangtze, Yellow, Mekong, Indus and Brahmaputra rise there, and the Ganges begins nearby in the Himalayas.'],
      ['Mount Everest is in the Himalayas.', true, 'It stands on the border of Nepal and China.'],
      ['The Gobi is a hot, sandy desert near the equator.', false, 'The Gobi is a cold desert in Mongolia and northern China, mostly gravel and rock.'],
      ['The Tigris and Euphrates flow through Iraq.', true, 'They join before they reach the Gulf.'],
      ['Lake Baikal is the deepest lake on Earth.', true, 'It is about 1,642 m deep at its deepest.'],
      ['The Yangtze flows into the Indian Ocean.', false, 'The Yangtze flows east across China to the East China Sea at Shanghai.'],
      ['Siberia is in southern Asia.', false, 'Siberia is the cold north of Asia, in Russia.']],
    mcq: [['Where do the Yangtze, the Mekong and the Indus all begin?', 'On or near the Plateau of Tibet', ['In Siberia', 'On the Arabian Peninsula'], 'The high plateau collects snow and rain that feed many of Asia\'s great rivers.'],
      ['Which is the highest mountain range on Earth?', 'The Himalayas', ['The Urals', 'The Zagros Mountains'], 'The Himalayas hold Mount Everest and many other peaks over 8,000 m.'],
      ['Which two rivers flow through Iraq?', 'The Tigris and the Euphrates', ['The Ganges and the Indus', 'The Yangtze and the Mekong'], 'Their valley was home to some of the first cities.'],
      ['Which river flows across northern India to the Bay of Bengal?', 'The Ganges', ['The Indus', 'The Yellow River'], 'The Ganges flows east from the Himalayas through India and Bangladesh.'],
      ['Which desert is in Mongolia?', 'The Gobi', ['The Thar', 'The Sahara'], 'The Gobi covers southern Mongolia and northern China.'],
      ['How high is Mount Everest?', 'About 8,849 m', ['About 5,895 m', 'About 3,000 m'], 'A 2020 survey by China and Nepal measured it at about 8,849 m (29,032 feet).']] }));

  /* ================================================================== UNIT 11: OCEANIA AND ANTARCTICA */
  var OCE = { pool: ['AUS', 'NZL', 'PNG', 'FJI', 'SLB', 'VUT', 'KIR', 'MHL', 'FSM', 'NRU', 'PLW', 'WSM', 'TON', 'TUV'], region: 'oce', textOnly: ['NRU'],
    regionOf: function (ids) { return ids.some(function (x) { return ['KIR', 'MHL', 'FSM', 'NRU', 'PLW', 'WSM', 'TON', 'TUV', 'FJI'].indexOf(x) >= 0; }) ? 'oce' : ['AUS', 'NZL', 'PNG', 'SLB', 'VUT'].concat(ids); },
    confuse: { NZL: ['AUS', 'FJI'], AUS: ['NZL', 'PNG'], SLB: ['VUT', 'PNG'], VUT: ['SLB', 'FJI'], FJI: ['VUT', 'TON'], WSM: ['TON', 'TUV'], TON: ['WSM', 'FJI'], MHL: ['FSM', 'KIR'], KIR: ['TUV', 'MHL'], TUV: ['KIR', 'NRU'], PLW: ['FSM'], FSM: ['PLW', 'MHL'], NRU: ['TUV', 'KIR'], PNG: ['SLB', 'AUS'] },
    where: { AUS: 'the country that covers the whole continent of Australia', NZL: 'two large islands about 2,000 km southeast of Australia', PNG: 'the eastern half of the island of New Guinea, north of Australia', FJI: 'a group of islands in Melanesia, east of Vanuatu', SLB: 'a chain of islands east of Papua New Guinea', VUT: 'a chain of islands in Melanesia, west of Fiji', KIR: 'islands spread across the central Pacific, on both sides of the equator', MHL: 'chains of coral atolls in Micronesia, north of Kiribati', FSM: 'islands spread across the western Pacific, east of Palau', NRU: 'one tiny island just south of the equator', PLW: 'islands at the western edge of Micronesia, east of the Philippines', WSM: 'islands in Polynesia, northeast of Fiji', TON: 'islands in Polynesia, southeast of Fiji', TUV: 'tiny atolls in Polynesia, north of Fiji' },
    shapes: ['AUS', 'NZL', 'PNG'], noOutline: true,
    facts: [['New Zealand is part of Australia.', false, 'New Zealand is a separate country, about 2,000 km (1,200 miles) southeast of Australia.'],
      ['New Zealand lies southeast of Australia, across the Tasman Sea.', true, 'It is about 2,000 km (1,200 miles) away.'],
      ['Papua New Guinea shares the island of New Guinea with Indonesia.', true, 'Papua New Guinea is the eastern half.'],
      ['Australia is both a country and a continent.', true, 'It is the only country that covers a whole continent.'],
      ['Nauru is one of the smallest countries in the world.', true, 'It is a single island of about 21 square kilometers.'],
      ['Samoa and Tonga are in Polynesia.', true, 'Polynesia is the large triangle of islands in the central and southern Pacific.'],
      ['Palau and the Marshall Islands are in Melanesia.', false, 'They are in Micronesia, the region of small islands north of the equator.']],
    extra: [['sub'], ['sub'], ['sub']],
    special: { sub: function (R, L) {
      var SUBN = { mel: 'Melanesia', mic: 'Micronesia', pol: 'Polynesia' }, ids = ['PNG', 'FJI', 'SLB', 'VUT', 'MHL', 'FSM', 'NRU', 'PLW', 'KIR', 'WSM', 'TON', 'TUV'], id = R.pick(ids), sub = C(id).sub;
      return { q: 'In which part of the Pacific is ' + b(tn(id)) + '?', a: mc(['Melanesia', 'Micronesia', 'Polynesia'], SUBN[sub]), hint: 'Melanesia is near New Guinea; Micronesia is the small islands north of the equator; Polynesia is the big triangle to the east.',
        viz: map({ region: 'oce', highlight: [id], label: 'A map of the Pacific with one country highlighted.' }),
        steps: [Tn(id) + ' is ' + desc(id, OCE.where) + '.', 'So it is in ' + SUBN[sub] + '.'] }; } } };
  Gen('worldgeo.countries-oceania', locate(OCE));
  Gen('worldgeo.capitals-oceania', capitals(OCE));

  var OCF = [
    { id: 'greatdividing', n: 'the Great Dividing Range', k: 'mountain range', group: 'land', d: 'the long range along Australia\'s east coast' },
    { id: 'greatvictoria', n: 'the Great Victoria Desert', k: 'desert', group: 'desert', d: 'the largest desert in Australia, in the south-central Outback' },
    { id: 'greatsandy', n: 'the Great Sandy Desert', k: 'desert', group: 'desert', d: 'the desert in the northwest of Australia' },
    { id: 'nullarbor', n: 'the Nullarbor Plain', k: 'plain', group: 'desert', d: 'the flat, treeless plain along Australia\'s south coast' },
    { id: 'murray', n: 'the Murray River', k: 'river', group: 'river', d: 'Australia\'s longest river, in the southeast' },
    { id: 'southernalps', n: 'the Southern Alps', k: 'mountain range', group: 'land', d: 'the mountains that run down New Zealand\'s South Island' },
    { id: 'newguinea', n: 'New Guinea', k: 'island', group: 'land', d: 'the large island north of Australia, shared by Papua New Guinea and Indonesia' },
    { id: 'tasmania', n: 'Tasmania', k: 'island', group: 'land', d: 'the island state south of Australia\'s mainland' },
    { id: 'reef', n: 'the Great Barrier Reef', k: 'reef', group: 'point', pt: [147.5, -18.5], d: 'the largest coral reef system on Earth, off the coast of Queensland in northeast Australia' },
    { id: 'uluru', n: 'Uluru', k: 'rock', group: 'point', pt: [131.04, -25.34], d: 'the huge sandstone rock in the middle of Australia\'s Outback' }];
  var OC_MCQ = [['Who owns Antarctica?', 'No country: the Antarctic Treaty sets aside countries\' claims', ['The United States', 'Australia'], 'Seven countries have claims, but the Antarctic Treaty (1959) sets them aside; the continent is kept for peace and science.'],
    ['What is Antarctica mostly used for today?', 'Science', ['Farming', 'Large cities'], 'Scientists from many countries work at research stations; no one lives there permanently.'],
    ['What covers almost all of Antarctica?', 'A thick sheet of ice', ['Rainforest', 'Sandy desert'], 'About 98 percent of the land is under ice, on average almost 2 km thick.'],
    ['What is the Outback?', 'The dry, thinly peopled interior of Australia', ['A mountain range in New Zealand', 'A coral reef'], 'The Outback covers most of Australia; most Australians live near the coasts.'],
    ['Where do most Australians live?', 'Near the coasts, especially the southeast', ['In the Outback', 'On the Great Barrier Reef'], 'Big cities such as Sydney, Melbourne and Brisbane are on or near the coast.'],
    ['Which ocean surrounds Antarctica?', 'The Southern Ocean', ['The Arctic Ocean', 'The Indian Ocean only'], 'The Southern Ocean circles the continent.', 'Picture the bottom of the globe.', { name: 'gg-globe', opts: { center: [0, -90], oceans: true, quiet: true, interactive: false, buttons: false, label: 'A globe seen from below the South Pole.' } }]];
  Gen('worldgeo.physical-oceania-antarctica', physical({ feats: OCF, region: ['AUS', 'NZL', 'PNG'],
    facts: [['Antarctica belongs to one country.', false, 'Several countries have claims, but the Antarctic Treaty (1959) sets them aside and keeps the continent for peace and science.'],
      ['Antarctica has no countries and no permanent residents.', true, 'Scientists and staff live there for a season or a year at research stations.'],
      ['The Great Barrier Reef is off the northeast coast of Australia.', true, 'It stretches more than 2,300 km along Queensland.'],
      ['The Great Dividing Range runs along Australia\'s west coast.', false, 'It runs along the east coast.'],
      ['Most of Australia\'s interior is dry.', true, 'The dry Outback covers most of the continent.'],
      ['The Southern Alps are in New Zealand.', true, 'They run down the South Island; Aoraki/Mount Cook is the highest peak.'],
      ['Antarctica is the coldest continent.', true, 'It is also the windiest and, on average, the driest.']], mcq: OC_MCQ }));

  /* ================================================================== UNIT 12: PEOPLE AND CITIES */
  // UN World Population Prospects 2024: population in 2024, millions (rounded)
  var POP = { IND: 1451, CHN: 1419, USA: 345, IDN: 283, PAK: 251, NGA: 233, BRA: 212, BGD: 174, RUS: 145, ETH: 132, MEX: 131, JPN: 124, EGY: 117, PHL: 116, COD: 109 };
  var POPORDER = ['IND', 'CHN', 'USA', 'IDN', 'PAK', 'NGA', 'BRA', 'BGD', 'RUS', 'ETH', 'MEX', 'JPN', 'EGY', 'PHL', 'COD'];
  function mil(m) { return m >= 1000 ? 'about ' + (m / 1000).toFixed(2).replace(/0$/, '') + ' billion' : 'about ' + m + ' million'; }
  var CONTPOP = [['Asia', 4.8], ['Africa', 1.5], ['Europe', 0.74], ['North America', 0.61], ['South America', 0.44], ['Oceania', 0.05]];
  Gen('worldgeo.world-population', function (R, ctx) {
    var L = ctx.level || 1, s = R.pick(L === 1 ? ['size', 'asia', 'most', 'tf'] : L === 2 ? ['asia', 'most', 'second', 'empty', 'tf', 'milestone'] : ['calc', 'second', 'empty', 'order', 'milestone']);
    var TF = [['The world has about 8.2 billion people (UN, 2025).', true, 'The UN estimates about 8.2 billion people in 2025.'],
      ['People are spread evenly over the land.', false, 'About 6 in 10 people live in Asia, and deserts, ice and the far north have almost no one.'],
      ['The world\'s population is still growing, but more slowly than around 1970.', true, 'Growth peaked at about 2 percent a year in the late 1960s and is now under 1 percent a year.'],
      ['More people live in Africa than in Asia.', false, 'Asia has about 4.8 billion people; Africa about 1.5 billion (UN, 2024).'],
      ['Antarctica has no permanent residents.', true, 'Only scientists and staff live there for a while.']];
    if (s === 'size') { var ch = R.shuffle(['About 8.2 billion', 'About 820 million', 'About 82 billion']);
      return { q: 'About how many people live in the world (UN, 2025)?', a: mc(ch, 'About 8.2 billion'), hint: 'It passed 8 billion in 2022.', steps: ['The UN estimates about 8.2 billion people in 2025.', 'That is 8,200,000,000: more than eight thousand million.'] }; }
    if (s === 'asia') { var c2 = ['About 6 in 10', 'About 1 in 10', 'About 3 in 10', 'About 9 in 10'];
      return { q: 'About how many out of every 10 people in the world live in Asia?', viz: map({ color: 'continents', continents: true, label: 'A world map with the continents in colors.', wholeWorld: true }), a: mc(c2, 'About 6 in 10'), hint: 'Asia has about 4.8 billion of the world\'s 8.2 billion people.',
        steps: ['Asia has about 4.8 billion people (UN, 2024) out of about 8.2 billion.', '4.8 ÷ 8.2 is about 0.59, so about 6 in every 10 people live in Asia.'] }; }
    if (s === 'most' || s === 'second') { var want = s === 'most' ? 'Asia' : 'Africa', ch3 = R.shuffle(R.sample(['Europe', 'North America', 'South America', 'Oceania'], 2).concat(s === 'most' ? ['Asia', 'Africa'] : ['Africa', 'Europe']));
      ch3 = uniq(ch3);
      return { q: 'Which continent has the ' + (s === 'most' ? 'most' : 'second most') + ' people?', a: mc(ch3, want), hint: 'Think of the countries with the most people.',
        steps: ['About 4.8 billion people live in Asia, about 1.5 billion in Africa and about 0.74 billion in Europe (UN, 2024).', 'So ' + want + ' has the ' + (s === 'most' ? 'most' : 'second most') + '.'] }; }
    if (s === 'empty') { var EMP = ['The middle of the Sahara', 'Antarctica', 'Northern Siberia', 'The middle of Greenland'], FULL = ['The Ganges plain of India and Bangladesh', 'The island of Java in Indonesia', 'The Nile valley in Egypt', 'Eastern China'], few = R.coin();
      var r1 = R.pick(few ? EMP : FULL), w1 = R.sample(few ? FULL : EMP, 2), ch4 = R.shuffle([r1].concat(w1));
      return { q: 'Which of these places has ' + (few ? b('very few') : b('a great many')) + ' people?', a: mc(ch4, r1), hint: 'People crowd where there is water, flat land and a mild climate.',
        steps: ['Deserts, ice sheets and the cold far north have very few people.', 'River valleys, plains and warm, wet coasts can feed many people, so they are crowded.', 'So the answer is ' + r1.charAt(0).toLowerCase() + r1.slice(1) + '.'] }; }
    if (s === 'milestone') { var ms = R.pick([['8 billion', '2022'], ['7 billion', '2011']]), ys = ['1999', '2011', '2022', '1987'];
      return { q: 'In which year did the world\'s population reach ' + ms[0] + ' (UN)?', a: mc(ys, ms[1]), hint: 'The world gained about a billion people every 11 to 13 years.', steps: ['The UN dates 6 billion to 1999, 7 billion to 2011 and 8 billion to November 2022.', 'So ' + ms[0] + ' was reached in ' + ms[1] + '.'] }; }
    if (s === 'order') { var conts = R.sample(CONTPOP, 3), sorted = conts.slice().sort(function (a, c) { return c[1] - a[1]; });
      var right = sorted.map(function (x) { return x[0]; }).join(', '), perms = [right, sorted.slice().reverse().map(function (x) { return x[0]; }).join(', '), [sorted[1], sorted[0], sorted[2]].map(function (x) { return x[0]; }).join(', ')];
      return { q: 'Put these continents in order from the most people to the fewest: ' + listAnd(conts.map(function (x) { return x[0]; })) + '.', a: mc(R.shuffle(uniq(perms)), right), hint: 'Asia first, then Africa, then Europe.',
        steps: conts.map(function (x) { return x[0] + ': about ' + (x[1] >= 1 ? x[1] + ' billion' : Math.round(x[1] * 1000) + ' million'); }).concat(['So the order is ' + right + '.']) }; }
    if (s === 'calc') { var sh = R.pick([[6, 'Asia'], [2, 'Africa']]);
      return { q: 'About ' + sh[0] + ' in every 10 people live in ' + sh[1] + '. If the world has about 8.2 billion people, about how many billion live in ' + sh[1] + '? Round to one decimal place.', a: { t: 'num', v: String(Math.round(8.2 * sh[0]) / 10), tol: 0.11 }, unit: 'billion',
        hint: sh[0] + ' in 10 is ' + sh[0] + '/10 of the whole.', steps: [sh[0] + ' in 10 means ' + sh[0] + '/10 of the people.', '8.2 × ' + sh[0] + ' ÷ 10 = ' + (Math.round(8.2 * sh[0] * 10) / 100) + ', about ' + (Math.round(8.2 * sh[0]) / 10) + ' billion.', '(The UN\'s figures: about 4.8 billion in Asia and 1.5 billion in Africa, 2024.)'] }; }
    var f = R.pick(TF); return { q: 'True or false? ' + f[0], a: { t: 'tf', v: f[1] }, hint: 'Think about where people live.', steps: [(f[1] ? 'True. ' : 'False. ') + f[2]] };
  });

  Gen('worldgeo.most-populous', function (R, ctx) {
    var L = ctx.level || 1, s = R.pick(L === 1 ? ['top', 'compare', 'tf'] : L === 2 ? ['top', 'compare', 'rank', 'map', 'tf'] : ['rank', 'diff', 'map', 'name', 'compare']);
    if (s === 'top') { var ch = R.shuffle(['India', 'China', 'United States', R.pick(['Indonesia', 'Russia', 'Brazil'])]);
      return { q: 'Which country has the most people (UN World Population Prospects 2024)?', a: mc(ch, 'India'), hint: 'It passed China in 2023.', steps: ['India has about 1.45 billion people and China about 1.42 billion (UN, 2024).', 'India passed China in 2023, according to the UN, so India has the most.'] }; }
    if (s === 'compare') { var cand = L === 1 ? POPORDER.slice(0, 9) : POPORDER, a, c, tries = 0;
      do { var pr = R.sample(cand, 2); a = pr[0]; c = pr[1]; tries++; } while ((Math.max(POP[a], POP[c]) / Math.min(POP[a], POP[c]) < 1.08) && tries < 50);
      var big = POP[a] > POP[c] ? a : c;
      return { q: 'Which country has more people: ' + tn(a) + ' or ' + tn(c) + '?', a: mc([nm(a), nm(c)], nm(big)), hint: 'Think of the list of the most populous countries.',
        steps: [Tn(a) + ': ' + mil(POP[a]) + '; ' + tn(c) + ': ' + mil(POP[c]) + ' (UN, 2024).', 'So ' + tn(big) + ' has more.'] }; }
    if (s === 'rank') { var k = R.pick(L === 2 ? [1, 2, 3] : [3, 4, 5, 6]), id = POPORDER[k - 1], ord = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][k - 1];
      var ch2 = uniq(R.shuffle([id].concat(R.sample(without(POPORDER.slice(0, 9), [id]), 3))));
      return { q: 'Which country is ' + ord + ' in the world by population (UN, 2024)?', a: mc(ch2.map(nm), nm(id)), hint: 'India, China, the United States, Indonesia, Pakistan, Nigeria …',
        steps: ['The most populous countries are India, China, the United States, Indonesia, Pakistan and Nigeria (UN, 2024).', 'The ' + ord + ' is ' + tn(id) + ', with ' + mil(POP[id]) + ' people.'] }; }
    if (s === 'diff') { var x = R.pick([['IND', 'CHN'], ['USA', 'IDN'], ['IDN', 'PAK'], ['PAK', 'NGA'], ['NGA', 'BRA'], ['BRA', 'BGD'], ['BGD', 'RUS']]), d = POP[x[0]] - POP[x[1]];
      return { q: 'In 2024, ' + tn(x[0]) + ' had about ' + fmtN(POP[x[0]]) + ' million people and ' + tn(x[1]) + ' about ' + fmtN(POP[x[1]]) + ' million (UN). About how many million more people did ' + tn(x[0]) + ' have?', a: { t: 'num', v: String(d) }, unit: 'million',
        hint: 'Subtract the smaller number from the larger.', steps: [fmtN(POP[x[0]]) + ' − ' + fmtN(POP[x[1]]) + ' = ' + d + '.', 'So about ' + d + ' million more.'] }; }
    var top = R.sample(POPORDER.slice(0, 8), 3), want = R.pick(top), mk = {}; top.forEach(function (x2, i) { mk[x2] = LET[i]; });
    var data = {}; POPORDER.forEach(function (x2) { data[x2] = POP[x2]; });
    if (s === 'name') { var big2 = top.slice().sort(function (p, q) { return POP[q] - POP[p]; })[0];
      return { q: 'The letters mark three of the world\'s most populous countries. Which letter marks the one with the ' + b('most') + ' people? ', viz: map({ mark: mk, data: data, breaks: [150, 200, 300, 1000], legend: 'People (millions, 2024)', wholeWorld: true, label: 'A world map with lettered countries, colored by population.' }),
        a: letters(3, top.indexOf(big2)), hint: 'Name each lettered country first.', steps: top.map(function (x2) { return mk[x2] + ' is ' + tn(x2) + ': ' + mil(POP[x2]) + '.'; }).concat(['So letter ' + mk[big2] + ' (' + tn(big2) + ') has the most.']) }; }
    if (s === 'map') return { q: 'Which letter marks ' + b(tn(want)) + ', one of the world\'s most populous countries?', viz: map({ mark: mk, wholeWorld: true, label: 'A world map with lettered countries.' }), a: letters(3, top.indexOf(want)),
      hint: 'Think about which continent it is on.', steps: [Tn(want) + ' (' + mil(POP[want]) + ' people, 2024) is in ' + GG().contName(C(want).cont) + '.', 'That is letter ' + mk[want] + '.'] };
    var TF = [['China still has more people than India.', false, 'India passed China in 2023, according to the UN.'], ['India passed China as the most populous country in 2023.', true, 'That is the UN\'s finding.'], ['The United States is the third most populous country.', true, 'About 345 million people (UN, 2024).'], ['Nigeria is the most populous country in Africa.', true, 'About 233 million people (UN, 2024).'], ['Most of the ten most populous countries are in Europe.', false, 'Only Russia is partly in Europe; most are in Asia.']];
    var f = R.pick(TF); return { q: 'True or false? ' + f[0], a: { t: 'tf', v: f[1] }, hint: 'Think of the UN\'s 2024 list.', steps: [(f[1] ? 'True. ' : 'False. ') + f[2]] };
  });

  // CIA World Factbook total area (land and inland water), km², rounded to thousands of km²
  var AREA = { RUS: 17098, CAN: 9985, USA: 9834, CHN: 9597, BRA: 8516, AUS: 7741, IND: 3287, ARG: 2780, KAZ: 2725, DZA: 2382, COD: 2345 };
  var AREAORDER = ['RUS', 'CAN', 'USA', 'CHN', 'BRA', 'AUS', 'IND', 'ARG', 'KAZ', 'DZA', 'COD'];
  var CLOSE = { CAN: 1, USA: 1, CHN: 1 };
  function mkm(k) { return (k / 1000).toFixed(1) + ' million km²'; }
  Gen('worldgeo.largest-countries', function (R, ctx) {
    var L = ctx.level || 1, s = R.pick(L === 1 ? ['largest', 'compare', 'tf'] : L === 2 ? ['largest', 'second', 'compare', 'mercator', 'tf'] : ['times', 'mercator', 'compare', 'continent', 'second']);
    if (s === 'largest') { var ch = R.shuffle(['Russia', 'China', R.pick(['United States', 'Brazil']), R.pick(['Australia', 'India'])]);
      return { q: 'Which is the largest country in the world by area?', a: mc(uniq(ch), 'Russia'), hint: 'It stretches across Europe and northern Asia.', steps: ['Russia covers about 17.1 million km², far more than any other country (CIA World Factbook).', 'Canada is second, with about 10.0 million km².'] }; }
    if (s === 'second') { var ch2 = R.shuffle(['Canada', 'Brazil', 'Australia', 'India']);
      return { q: 'Which country is the second largest by total area (land and inland water)?', a: mc(ch2, 'Canada'), hint: 'It is in North America, and it has a great many lakes.', steps: ['After Russia (about 17.1 million km²) comes Canada (about 10.0 million km²).', 'Then the United States and China, each about 9.6 to 9.8 million km²; their order depends on how water and disputed land are counted.'] }; }
    if (s === 'compare') { var a, c, t = 0; do { var pr = R.sample(L === 1 ? AREAORDER.slice(0, 7) : AREAORDER, 2); a = pr[0]; c = pr[1]; t++; } while (((CLOSE[a] && CLOSE[c]) || Math.max(AREA[a], AREA[c]) / Math.min(AREA[a], AREA[c]) < 1.08) && t < 60);
      var big = AREA[a] > AREA[c] ? a : c;
      return { q: 'Which country is larger in area: ' + tn(a) + ' or ' + tn(c) + '?', a: mc([nm(a), nm(c)], nm(big)), hint: 'Careful: a Mercator map makes countries far from the equator look larger than they are.',
        steps: [Tn(a) + ': about ' + mkm(AREA[a]) + '; ' + tn(c) + ': about ' + mkm(AREA[c]) + ' (CIA World Factbook).', 'So ' + tn(big) + ' is larger.'] }; }
    if (s === 'times') { var p = R.pick([['RUS', 'AUS', 2], ['RUS', 'IND', 5], ['BRA', 'ARG', 3], ['CAN', 'IND', 3], ['RUS', 'DZA', 7], ['AUS', 'IND', 2]]), r = AREA[p[0]] / AREA[p[1]];
      return { q: Tn(p[0]) + ' covers about ' + mkm(AREA[p[0]]) + ' and ' + tn(p[1]) + ' about ' + mkm(AREA[p[1]]) + '. About how many times as large as ' + tn(p[1]) + ' is ' + tn(p[0]) + '? Round to the nearest whole number.',
        a: { t: 'num', v: String(Math.round(r)) }, hint: 'Divide the larger area by the smaller one.', steps: [(AREA[p[0]] / 1000).toFixed(1) + ' ÷ ' + (AREA[p[1]] / 1000).toFixed(1) + ' ≈ ' + r.toFixed(2) + '.', 'Rounded: about ' + Math.round(r) + ' times as large.'] }; }
    if (s === 'mercator') { var M2 = R.pick([['Greenland', 'Africa', 'Africa', 'Africa is about 14 times as large as Greenland (about 30 million km² against about 2.2 million km²).', ['GRL', 'AF']], ['Canada', 'Brazil', 'Canada', 'Canada (about 10.0 million km²) is larger than Brazil (about 8.5 million km²), but by much less than a Mercator map suggests.', ['CAN', 'BRA']], ['Russia', 'Africa', 'Africa', 'Africa (about 30 million km²) is far larger than Russia (about 17.1 million km²), though Russia looks bigger on a Mercator map.', ['RUS', 'AF']]]);
      return { q: 'On a Mercator map, ' + M2[0] + ' looks about as big as ' + M2[1] + ', or bigger. Which is really larger?', viz: { name: 'gg-projection', opts: { proj: 'mercator', highlight: M2[4], quiet: true, interactive: false, label: 'A Mercator world map with two places highlighted.' } },
        a: mc([M2[0], M2[1]], M2[2]), hint: 'Mercator stretches land more and more the farther it is from the equator.', steps: ['Mercator stretches places near the poles, so northern lands look too big.', M2[3]] }; }
    if (s === 'continent') { var id = R.pick(['RUS', 'CAN', 'BRA', 'AUS', 'ARG', 'KAZ', 'DZA', 'COD', 'IND']), cn = { RUS: 'Europe and Asia', CAN: 'North America', BRA: 'South America', AUS: 'Australia (Oceania)', ARG: 'South America', KAZ: 'Asia', DZA: 'Africa', COD: 'Africa', IND: 'Asia' };
      var ch3 = uniq(R.shuffle([cn[id]].concat(R.sample(without(['Europe and Asia', 'North America', 'South America', 'Australia (Oceania)', 'Africa', 'Asia'], [cn[id]]), 2))));
      return { q: Tn(id) + ' is one of the ten largest countries. Where is it?', a: mc(ch3, cn[id]), hint: 'Picture it on a globe.', steps: [Tn(id) + ' (about ' + mkm(AREA[id]) + ') is in ' + cn[id] + '.'] }; }
    var TF = [['Russia is the largest country in the world.', true, 'About 17.1 million km².'], ['Brazil is larger than Australia.', true, 'Brazil about 8.5 million km², Australia about 7.7 million km².'], ['A Mercator map shows every country at its true size.', false, 'Mercator stretches lands far from the equator, so Canada, Russia and Greenland look too big.'], ['India is larger than Russia.', false, 'India covers about 3.3 million km²; Russia about 17.1 million km².'], ['Algeria is the largest country in Africa.', true, 'About 2.4 million km².']];
    var f = R.pick(TF); return { q: 'True or false? ' + f[0], a: { t: 'tf', v: f[1] }, hint: 'Think of a globe, not a Mercator map.', steps: [(f[1] ? 'True. ' : 'False. ') + f[2]] };
  });

  // density data: UN WPP 2024 population (millions) and CIA total area (thousand km²)
  var DENS = { BGD: [174, 148], IND: [1451, 3287], JPN: [124, 378], NLD: [18, 42], PAK: [251, 796], NGA: [233, 924], DEU: [85, 357], GBR: [69, 244],
    USA: [345, 9834], BRA: [212, 8516], RUS: [145, 17098], CAN: [40, 9985], AUS: [27, 7741], MNG: [3.5, 1564] };
  var DENSE = ['BGD', 'IND', 'JPN', 'NLD', 'PAK', 'NGA', 'DEU', 'GBR'], SPARSE = ['USA', 'BRA', 'RUS', 'CAN', 'AUS', 'MNG'];
  function dens(id) { return DENS[id][0] * 1000 / DENS[id][1]; }
  var PLACES = ['an island', 'a valley', 'a county', 'a small country', 'a province', 'a farming district', 'a coastal region'];
  Gen('worldgeo.population-density', function (R, ctx) {
    var L = ctx.level || 1, s = R.pick(L === 1 ? ['calc', 'calc', 'real'] : L === 2 ? ['calc', 'reverse', 'compare', 'real'] : ['compare', 'reverse', 'real', 'calc2', 'area']);
    if (s === 'calc' || s === 'calc2') {
      var A = L === 1 ? R.pick([100, 200, 400, 500, 1000, 2000]) : R.pick([250, 400, 800, 1500, 2500, 4000, 12000, 60000]), d = L === 1 ? R.pick([5, 10, 20, 25, 50, 100, 200]) : R.pick([15, 35, 45, 60, 75, 120, 150, 240, 350, 480]), P = A * d, pl = R.pick(PLACES);
      return { q: cap1(pl) + ' has ' + fmtN(P) + ' people living on ' + fmtN(A) + ' square kilometers of land. What is its population density, in people per square kilometer?', a: { t: 'num', v: String(d) },
        hint: 'Density = people ÷ area.', steps: ['Population density = number of people ÷ land area.', fmtN(P) + ' ÷ ' + fmtN(A) + ' = ' + d + '.', 'So there are about ' + d + ' people per square kilometer.'] }; }
    if (s === 'reverse') { var A2 = R.pick([300, 500, 800, 1200, 2000, 5000]), d2 = R.pick([20, 40, 60, 80, 150, 300]), pl2 = R.pick(PLACES);
      return { q: cap1(pl2) + ' covers ' + fmtN(A2) + ' square kilometers and has a population density of ' + d2 + ' people per square kilometer. How many people live there?', a: { t: 'num', v: String(A2 * d2) },
        hint: 'If each square kilometer has ' + d2 + ' people, multiply by the number of square kilometers.', steps: ['Density × area = people.', d2 + ' × ' + fmtN(A2) + ' = ' + fmtN(A2 * d2) + '.', 'So about ' + fmtN(A2 * d2) + ' people live there.'] }; }
    if (s === 'area') { var d3 = R.pick([25, 40, 50, 80, 125, 200]), A3 = R.pick([400, 600, 1000, 1500, 3000]);
      return { q: 'A region has ' + fmtN(d3 * A3) + ' people and a population density of ' + d3 + ' people per square kilometer. How many square kilometers does it cover?', a: { t: 'num', v: String(A3) }, unit: 'km²',
        hint: 'Area = people ÷ density.', steps: ['People ÷ density = area.', fmtN(d3 * A3) + ' ÷ ' + d3 + ' = ' + fmtN(A3) + '.', 'So it covers ' + fmtN(A3) + ' km².'] }; }
    if (s === 'compare') { // a bigger population that is less crowded (the trouble note)
      var Ab = R.pick([4000, 5000, 8000, 10000]), db = R.pick([20, 25, 40]), Pb = Ab * db, As = R.pick([200, 250, 400, 500]), ds = R.pick([100, 150, 200, 300]), Ps = As * ds;
      var names = R.shuffle(['Country A', 'Country B']), big = names[0], sm = names[1];
      return { q: big + ' has ' + fmtN(Pb) + ' people on ' + fmtN(Ab) + ' km². ' + sm + ' has ' + fmtN(Ps) + ' people on ' + fmtN(As) + ' km². Which is more crowded (has the higher population density)?', a: mc(['Country A', 'Country B'], sm),
        hint: 'Work out people per square kilometer for each one.', steps: [big + ': ' + fmtN(Pb) + ' ÷ ' + fmtN(Ab) + ' = ' + db + ' people per km².', sm + ': ' + fmtN(Ps) + ' ÷ ' + fmtN(As) + ' = ' + ds + ' people per km².', sm + ' has fewer people but is more crowded, because they share much less land.'] }; }
    var dn = R.pick(DENSE), sp = R.pick(SPARSE), ch = R.shuffle([nm(dn), nm(sp)]);
    return { q: 'Which country is more crowded (has more people per square kilometer): ' + tn(ch[0] === nm(dn) ? dn : sp) + ' or ' + tn(ch[0] === nm(dn) ? sp : dn) + '?', a: mc(ch, nm(dn)), hint: 'Divide people by area for each.',
      steps: [Tn(dn) + ': about ' + fmtN(DENS[dn][0]) + ' million people on about ' + fmtN(DENS[dn][1] * 1000) + ' km², about ' + fmtN(Math.round(dens(dn))) + ' people per km².', Tn(sp) + ': about ' + DENS[sp][0] + ' million people on about ' + fmtN(DENS[sp][1] * 1000) + ' km², about ' + fmtN(Math.round(dens(sp))) + ' people per km².', 'So ' + tn(dn) + ' is far more crowded' + (DENS[sp][0] > DENS[dn][0] ? ', even though ' + tn(sp) + ' has more people.' : '.'), '(Populations: UN, 2024; areas: CIA World Factbook.)'] };
  });

  var CITY = [{ n: 'Jakarta', c: 'IDN', lon: 106.83, lat: -6.17, p: 42, cap: 1 }, { n: 'Dhaka', c: 'BGD', lon: 90.41, lat: 23.73, p: 40, cap: 1 }, { n: 'Tokyo', c: 'JPN', lon: 139.75, lat: 35.69, p: 33, cap: 1 }];
  var OTHERCITY = [{ n: 'Cairo', c: 'EGY', lon: 31.25, lat: 30.05, cap: 1 }, { n: 'Delhi', c: 'IND', lon: 77.2, lat: 28.6 }, { n: 'Shanghai', c: 'CHN', lon: 121.43, lat: 31.22 }, { n: 'Lagos', c: 'NGA', lon: 3.39, lat: 6.45 }, { n: 'São Paulo', c: 'BRA', lon: -46.63, lat: -23.56 }, { n: 'Mexico City', c: 'MEX', lon: -99.13, lat: 19.44 }, { n: 'New York', c: 'USA', lon: -73.98, lat: 40.75 }];
  Gen('worldgeo.largest-cities', function (R, ctx) {
    var L = ctx.level || 1, s = R.pick(L === 1 ? ['first', 'country', 'tf'] : L === 2 ? ['first', 'country', 'map', 'why', 'diff', 'tf'] : ['map', 'why', 'diff', 'mega', 'countryText', 'old']);
    if (s === 'first') { var ch = R.shuffle(['Jakarta', 'Tokyo', R.pick(['London', 'New York', 'Paris'])]);
      return { q: 'In the UN\'s 2025 count (World Urbanization Prospects), which city has the most people?', a: mc(ch, 'Jakarta'), hint: 'It is the capital of Indonesia.', steps: ['The UN\'s 2025 report puts Jakarta first, with nearly 42 million people, then Dhaka (almost 40 million) and Tokyo (about 33 million).'] }; }
    if (s === 'country' || s === 'countryText') { var cty = R.pick(CITY.concat(OTHERCITY.slice(0, 3)));
      if (s === 'countryText') return { q: 'In which country is the city of ' + b(cty.n) + '? Type the country.', a: textName(cty.c), hint: 'Picture the city on the map.', steps: [cty.n + ' is in ' + tn(cty.c) + '.'] };
      var ot = R.sample(without(['IDN', 'BGD', 'JPN', 'EGY', 'IND', 'CHN', 'PHL', 'THA'], [cty.c]), 2), ch2 = R.shuffle([cty.c].concat(ot));
      return { q: 'In which country is ' + b(cty.n) + ', one of the world\'s largest cities?', a: mc(ch2.map(nm), nm(cty.c)), hint: 'Picture the city on the map.', steps: [cty.n + ' is ' + (cty.cap ? 'the capital of' : 'a city in') + ' ' + tn(cty.c) + '.'] }; }
    if (s === 'map') { var pick = R.shuffle(R.sample(CITY, 2).concat(R.sample(OTHERCITY, L === 3 ? 2 : 1))), want = R.pick(pick.slice(0, 3));
      var pts = pick.map(function (x, i) { return { lon: x.lon, lat: x.lat, mark: LET[i] }; });
      return { q: 'Which letter marks ' + b(want.n) + '?', viz: map({ points: pts, wholeWorld: true, color: 'plain', label: 'A world map with lettered cities.' }), a: letters(pick.length, pick.indexOf(want)), hint: 'Which country is it in?',
        steps: [want.n + ' is in ' + tn(want.c) + ', in ' + GG().contName(C(want.c).cont) + '.', 'That is letter ' + LET[pick.indexOf(want)] + '.'] }; }
    if (s === 'why') { var right = 'They draw the edges of a city in different places', ch3 = R.shuffle([right, 'Cities move from year to year', 'Some lists count only children']);
      return { q: 'Why do lists of the world\'s largest cities disagree?', a: mc(ch3, right), hint: 'Where does a city end?', steps: ['A city has no sharp edge: suburbs and towns run into each other.', 'Each list draws the edge in its own place, so the counts differ.', 'The UN\'s 2025 report uses a new method that counts the area where people actually live close together; that is why it puts Jakarta first, while its older lists put Tokyo first.'] }; }
    if (s === 'diff') { var pr = R.pick([[CITY[0], CITY[2]], [CITY[1], CITY[2]], [CITY[0], CITY[1]]]), d = pr[0].p - pr[1].p;
      return { q: 'In the UN\'s 2025 count, ' + pr[0].n + ' has about ' + pr[0].p + ' million people and ' + pr[1].n + ' about ' + pr[1].p + ' million. About how many million more people does ' + pr[0].n + ' have?', a: { t: 'num', v: String(d) }, unit: 'million',
        hint: 'Subtract.', steps: [pr[0].p + ' − ' + pr[1].p + ' = ' + d + '.', 'So about ' + d + ' million more.'] }; }
    if (s === 'mega') { var ch4 = ['10 million or more', '1 million or more', '100 million or more'];
      return { q: 'A megacity is a city with how many people?', a: mc(ch4, '10 million or more'), hint: 'Mega- means very large.', steps: ['A megacity has 10 million people or more.', 'The UN counted 33 megacities in 2025, 19 of them in Asia.'] }; }
    if (s === 'old') { var ch5 = R.shuffle(['Tokyo', 'Jakarta', 'Dhaka']);
      return { q: 'Which city was first in the UN\'s older (2018) list of the largest cities?', a: mc(ch5, 'Tokyo'), hint: 'The 2025 report changed the method.', steps: ['The 2018 report put Tokyo first, with about 37 million people.', 'The 2025 report measures cities differently and puts Jakarta first; Tokyo is third, with about 33 million.'] }; }
    var TF = [['Cairo is the only city outside Asia in the UN\'s 2025 top ten.', true, 'The other nine largest cities are all in Asia.'], ['Every list of the largest cities gives the same order.', false, 'Lists draw city edges differently, so their orders differ.'], ['Most of the world\'s megacities are in Asia.', true, '19 of the 33 megacities in 2025 were in Asia (UN).'], ['In the UN\'s 2025 count, Tokyo is the largest city.', false, 'Jakarta is first, then Dhaka, then Tokyo.']];
    var f = R.pick(TF); return { q: 'True or false? ' + f[0], a: { t: 'tf', v: f[1] }, hint: 'Think of the UN\'s 2025 report.', steps: [(f[1] ? 'True. ' : 'False. ') + f[2]] };
  });
})(window.MathLadder);
