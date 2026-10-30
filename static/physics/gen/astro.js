// ---- 00_head.js
/* Physics Ladder · Astronomy (astro): problem generators for all 52 topics.
   Built from /tmp/work_astro/gen/*.js by build_gen.js. Every answer is computed from the numbers each problem shows.
   Each problem also carries vf (the inputs it was built from) so an independent test can recompute the answer.
   Constants follow the Physics Ladder overview: c = 3.00 × 10^8 m/s in algebra-based problems, G = 6.674 × 10^-11,
   AU = 1.496 × 10^11 m, ly = 9.46 × 10^15 m, pc = 3.26 ly, Wien b = 2.90 × 10^6 nm·K, H0 = 70 km/s/Mpc unless given. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel, M = Math;

  // ---------- numbers ----------
  function rnd(x, n) { if (x === 0 || !isFinite(x)) return x; return Number(x.toPrecision(n || 3)); }
  function fix(x) { return Number(Number(x).toPrecision(12)); }
  /* ans(x, n): the canonical answer string for a num spec, n significant figures (default 3) */
  function ans(x, n) {
    n = n || 3; var a = M.abs(x);
    if (a !== 0 && (a >= 1e6 || a < 1e-3)) { var s = x.toExponential(n - 1).replace(/\.?0+e/, 'e').replace('e+', 'e'); return s; }
    return String(rnd(x, n));
  }
  /* fx(x, n): TeX for x to n significant figures; scientific notation outside 0.001 to 99,999 */
  function fx(x, n) {
    n = n || 3; var a = M.abs(x);
    if (a !== 0 && (a >= 1e5 || a < 1e-3)) {
      var e = M.floor(M.log10(a)), m = rnd(x / M.pow(10, e), n);
      if (M.abs(m) >= 10) { m = rnd(m / 10, n); e++; }
      var ms = m.toFixed(M.max(0, n - 1));
      return ms.replace('-', '-') + ' \\times 10^{' + e + '}';
    }
    return T.commas(rnd(x, n));
  }
  /* fk(x, n): like fx but keeps trailing zeros to n significant figures (3.00, 1.50) */
  function fk(x, n) {
    n = n || 3; var a = M.abs(x);
    if (a !== 0 && (a >= 1e5 || a < 1e-3)) return fx(x, n);
    var e = a === 0 ? 0 : M.floor(M.log10(a)), d = M.max(0, n - 1 - e), s = rnd(x, n).toFixed(d);
    return a >= 1e4 ? T.commas(Number(s)) : s;
  }
  /* fd(x, d): fixed decimals with float noise removed, trailing zeros dropped */
  function fd(x, d) { var s = fix(x).toFixed(d == null ? 2 : d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; }
  /* tx(x, n): a number for plain text (outside math), with thousands commas */
  function tx(x, n) { return Number(rnd(x, n || 3)).toLocaleString('en-US', { maximumFractionDigits: 6 }); }
  function un(s) { return '\\,\\text{' + s + '}'; }           // a unit after a number in math
  function q$(x, n, u) { return '$' + fx(x, n) + (u ? un(u) : '') + '$'; } // a quantity in text
  function deg(x) { return fd(x, 1) + '^\\circ'; }

  // ---------- answers ----------
  function num(x, n, rtol) { return { t: 'num', v: ans(x, n), rtol: rtol == null ? 0.02 : rtol }; }
  function pnum(x, n, rtol) { return { t: 'num', v: ans(x, n), rtol: rtol == null ? 0.02 : rtol, pct: true }; }
  function exact(x) { return { t: 'num', v: String(fix(x)) }; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  /* pickWrongs(R, pool, k, not): k different wrong choices from a pool */
  function wrongs(R, pool, k, not) { return R.sample(pool.filter(function (w) { return w !== not; }), M.min(k || 3, pool.length)); }
  function P(q, a, steps, hint, extra) { var p = { q: q, a: a, steps: steps }; if (hint) p.hint = hint; if (extra) for (var k in extra) p[k] = extra[k]; return p; }

  // ---------- constants (overview values) ----------
  var C = 3.00e8, CKM = 3.00e5, GN = 6.674e-11, AU = 1.496e11, LY = 9.46e15, PC_LY = 3.26, WIEN = 2.90e6, SIGMA = 5.67e-8,
    MSUN = 1.989e30, RSUN = 6.96e8, LSUN = 3.83e26, TSUN = 5772, MEARTH = 5.972e24, REARTH = 6.371e6, YR = 3.156e7, MPC_KM = 3.086e19;

// ---- 01_sky.js

  // =====================================================================================================
  // Unit 1: The Sky
  var LATS = [[30, 'Houston'], [34, 'Los Angeles'], [36, 'Nashville'], [38, 'Washington, D.C.'], [40, 'Denver'], [42, 'Boston'], [45, 'Minneapolis'], [47, 'Seattle'], [52, 'London'], [60, 'Anchorage'], [26, 'Miami'], [33, 'Phoenix'], [41, 'Chicago'], [43, 'Toronto'], [35, 'Albuquerque']];
  function ra(h, m) { return h + '^{\\mathrm{h}}' + (m ? '\\,' + m + '^{\\mathrm{m}}' : ''); }

  G('astro.celestial-sphere', function (R, ctx) {
    var shape = by(ctx, R.pick(['deg', 'deg', 'why', 'pole']), R.pick(['deg', 'hours', 'why', 'pole', 'dir']), R.pick(['hours', 'trail', 'dir', 'why']));
    if (shape === 'deg') {
      var h = R.int(1, 23);
      return P('The sky turns once around the celestial pole in about 24 hours. Through how many degrees does a star near the pole move in $' + h + '$ hours?',
        exact(15 * h), ['In 24 hours the sky turns $360^\\circ$, so each hour it turns $360^\\circ \\div 24 = 15^\\circ$.', 'In $' + h + '$ hours: $' + h + ' \\times 15^\\circ = ' + 15 * h + '^\\circ$.'],
        'How many degrees per hour?', { unit: '°', vf: { k: 'deg', h: h } });
    }
    if (shape === 'hours' || shape === 'trail') {
      var hh = R.int(1, 24) / 2, d = 15 * hh;
      var q = shape === 'trail' ? 'A camera pointed at the north celestial pole takes one long exposure. Each star makes a curved trail around the pole, and every trail is an arc of $' + d + '^\\circ$. How long was the exposure, in hours?'
        : 'You watch a star circle the north celestial pole. It moves $' + d + '^\\circ$ around the pole. About how many hours have passed?';
      return P(q, exact(hh), ['The sky turns $15^\\circ$ each hour ($360^\\circ$ in 24 h).', 'Hours $= ' + d + '^\\circ \\div 15^\\circ/\\text{h} = ' + hh + '$ h.', shape === 'trail' ? 'Every star trail has the same angle, because the whole sky turns together as Earth spins.' : 'Stars near the pole never set, so you can watch the whole arc.'],
        'Divide the angle by the turning rate.', { unit: 'h', vf: { k: 'hours', d: d } });
    }
    if (shape === 'why') {
      var right = 'Earth spins from west to east, so the whole sky seems to turn the other way.';
      var wr = ['The stars orbit Earth once a day.', 'Earth goes around the Sun once a day.', 'The stars drift west because the Sun pulls on them.', 'Each star moves on its own path, faster than the planets.'];
      return P('Why do stars rise in the east and set in the west?', mc(right, wrongs(R, wr, 3)),
        ['The stars are far away and barely move across our sky over a lifetime.', 'Earth turns toward the east once a day, so we are carried past the stars, and they appear to move west.', 'This is the same reason the Sun rises in the east.'], 'What is moving: the stars, or us?', { vf: { k: 'mc' } });
    }
    if (shape === 'pole') {
      var ok = 'Polaris, because it lies almost exactly above Earth\'s North Pole', wr2 = ['Sirius, because it is the brightest star', 'Any star near the celestial equator', 'The star that is overhead at midnight', 'Vega, because it is high in summer'];
      return P('Seen from the Northern Hemisphere, which star stays almost still while the rest of the sky turns around it?', mc(ok, wrongs(R, wr2, 3)),
        ['The sky seems to turn around the celestial poles, the points straight above Earth\'s poles.', 'Polaris sits within about $1^\\circ$ of the north celestial pole, so it hardly moves.', 'Polaris is not especially bright; its position is what makes it special.'], 'Think about the axis Earth spins on.', { vf: { k: 'mc' } });
    }
    // dir
    var face = R.pick(['north', 'south']);
    var ans2 = face === 'north' ? 'counterclockwise around Polaris' : 'from east (left) to west (right)';
    var pool = face === 'north' ? ['clockwise around Polaris', 'they do not move at all', 'from west to east'] : ['from west (right) to east (left)', 'straight up and down', 'they do not move at all'];
    return P('You stand in the Northern Hemisphere at night, facing ' + face + '. How do the stars in front of you move over a few hours?', mc(ans2, pool),
      [face === 'north' ? 'Facing north you look at the north celestial pole. Earth\'s spin makes the stars circle it counterclockwise.' : 'Facing south, the stars rise on your left (east), arc across, and set on your right (west).', 'Either way, it is Earth turning toward the east that makes the sky turn.'],
      'East is to your right when you face north.', { vf: { k: 'mc' } });
  });

  G('astro.altitude-latitude', function (R, ctx) {
    var shape = by(ctx, R.pick(['polaris', 'lat']), R.pick(['circ', 'south', 'polaris', 'lat', 'mcp']), R.pick(['max', 'circ', 'south', 'max']));
    var L = R.pick(LATS), lat = L[0], city = L[1];
    if (shape === 'polaris') return P('In ' + city + ' (latitude $' + lat + '^\\circ$ N), how high above the northern horizon is Polaris? Give its altitude in degrees.', exact(lat),
      ['The north celestial pole sits above the horizon at an altitude equal to your latitude.', 'Polaris is within about $1^\\circ$ of the pole.', 'So its altitude is about $' + lat + '^\\circ$.'], 'Altitude of the pole = latitude.', { unit: '°', vf: { k: 'id', x: lat } });
    if (shape === 'lat') { var a = R.int(5, 80); return P('From a campsite, you measure Polaris at $' + a + '^\\circ$ above the northern horizon. What is your latitude (in degrees north)?', exact(a),
      ['The altitude of the celestial pole equals the observer\'s latitude.', 'So the latitude is about $' + a + '^\\circ$ N.'], 'Polaris\'s altitude tells you directly.', { unit: '°', vf: { k: 'id', x: a } }); }
    if (shape === 'circ') { return P('At latitude $' + lat + '^\\circ$ N, a star never sets if it is close enough to the north celestial pole. What is the smallest declination a star can have and still be circumpolar there?', exact(90 - lat),
      ['A circumpolar star\'s whole daily circle stays above the horizon.', 'The pole is $' + lat + '^\\circ$ up, so circles of radius up to $' + lat + '^\\circ$ around it clear the northern horizon.', 'A star at declination $\\delta$ is $90^\\circ - \\delta$ from the pole, so we need $90^\\circ - \\delta \\le ' + lat + '^\\circ$, that is $\\delta \\ge 90^\\circ - ' + lat + '^\\circ = ' + (90 - lat) + '^\\circ$.'],
      'How far is the pole above the horizon, and how far is the star from the pole?', { unit: '°', vf: { k: 'circ', lat: lat } }); }
    if (shape === 'south') { return P('At latitude $' + lat + '^\\circ$ N, some southern stars never rise. What is the most southern declination you can ever see (just reaching the southern horizon)? Give a negative number for south.', exact(-(90 - lat)),
      ['The celestial equator crosses the meridian $90^\\circ - ' + lat + '^\\circ = ' + (90 - lat) + '^\\circ$ above the southern horizon.', 'So you can see $' + (90 - lat) + '^\\circ$ south of the equator, but no farther.', 'The limit is declination $-' + (90 - lat) + '^\\circ$.'],
      'How high is the celestial equator in the south?', { unit: '°', vf: { k: 'south', lat: lat } }); }
    if (shape === 'max') {
      var stars = [['Vega', 38.8], ['Arcturus', 19.2], ['Sirius', -16.7], ['Rigel', -8.2], ['Deneb', 45.3], ['Capella', 46.0], ['Antares', -26.4], ['Altair', 8.9], ['Spica', -11.2], ['Betelgeuse', 7.4]];
      var s = R.pick(stars), alt = fix(90 - M.abs(lat - s[1]));
      return P('From latitude $' + lat + '^\\circ$ N, what is the highest altitude ' + s[0] + ' (declination $' + fd(s[1], 1) + '^\\circ$) reaches during the night?', num(alt, 3, 0.01),
        ['A star is highest when it crosses the meridian.', 'There its altitude is $90^\\circ - |\\text{latitude} - \\text{declination}|$.', '$90^\\circ - |' + lat + ' - (' + fd(s[1], 1) + ')|^\\circ = 90^\\circ - ' + fd(M.abs(lat - s[1]), 1) + '^\\circ = ' + fd(alt, 1) + '^\\circ$.'],
        'Compare the star\'s declination with your latitude.', { unit: '°', vf: { k: 'max', lat: lat, dec: s[1] } });
    }
    // mcp: misconception check
    var right = 'Polaris is not very bright; it matters because it sits near the north celestial pole';
    var wr = ['Polaris is the brightest star in the night sky', 'Polaris is straight overhead everywhere in the Northern Hemisphere', 'Polaris rises in the east and sets in the west like other stars', 'Polaris can be seen from every place on Earth'];
    return P('Which statement about Polaris (the North Star) is true?', mc(right, wrongs(R, wr, 3)),
      ['Polaris is only about the 50th brightest star.', 'It is special because it lies within about $1^\\circ$ of the north celestial pole, so it stays put as the sky turns.', 'Its altitude equals your latitude: overhead only at the North Pole, on the horizon at the equator, and out of sight south of it.'], 'What makes it useful to navigators?', { vf: { k: 'mc' } });
  });

  G('astro.celestial-coordinates', function (R, ctx) {
    var shape = by(ctx, R.pick(['toDeg', 'toDeg', 'overhead']), R.pick(['toDeg', 'toRA', 'meridian', 'mc', 'overhead']), R.pick(['meridian', 'toRA', 'mc', 'meridian2']));
    if (shape === 'toDeg') {
      var h = R.int(1, 23), m = by(ctx, R.pick([0, 0, 20, 40]), R.pick([0, 12, 20, 24, 36, 40, 48]), R.pick([4, 8, 12, 16, 20, 28, 32, 36, 44, 48, 52, 56])), d = 15 * (h + m / 60);
      return P('A star has right ascension $' + ra(h, m) + '$. How many degrees east of the starting line (the March equinox) is that?', num(d, 4, 0.002),
        ['The 24 hours of right ascension cover $360^\\circ$, so $1^{\\mathrm{h}} = 15^\\circ$' + (m ? ' and $1^{\\mathrm{m}} = 15\' = 0.25^\\circ$' : '') + '.', m ? '$' + ra(h, m) + ' = ' + h + ' + \\frac{' + m + '}{60} = ' + fd(h + m / 60, 3) + '$ h.' : 'The angle is $' + h + ' \\times 15^\\circ$.', '$' + fd(h + m / 60, 3) + ' \\times 15^\\circ = ' + fd(d, 2) + '^\\circ$.'],
        'One hour of right ascension is 15 degrees.', { unit: '°', vf: { k: 'toDeg', h: h, m: m } });
    }
    if (shape === 'toRA') {
      var dd = 15 * R.int(1, 23) + R.pick([0, 0, 7.5]), hrs = dd / 15;
      return P('A point on the celestial equator is $' + fd(dd, 1) + '^\\circ$ east of the March equinox. What is its right ascension, in hours?', num(hrs, 3, 0.002),
        ['$1^{\\mathrm{h}}$ of right ascension $= 15^\\circ$.', '$' + fd(dd, 1) + '^\\circ \\div 15^\\circ = ' + fd(hrs, 2) + '$ h' + (hrs % 1 ? ', which is $' + ra(M.floor(hrs), 30) + '$.' : '.')],
        'Divide by 15.', { unit: 'h', vf: { k: 'toRA', d: dd } });
    }
    if (shape === 'overhead') {
      var st = R.pick([['Vega', 38.8], ['Arcturus', 19.2], ['Deneb', 45.3], ['Capella', 46.0], ['Altair', 8.9], ['Castor', 31.9], ['Regulus', 12.0], ['Aldebaran', 16.5]]);
      return P(st[0] + ' has declination $+' + fd(st[1], 1) + '^\\circ$. At what latitude (in degrees north) does it pass straight overhead?', num(st[1], 3, 0.005),
        ['Declination is the sky\'s latitude: the celestial equator lies over Earth\'s equator.', 'A star passes through your zenith when its declination equals your latitude.', 'So ' + st[0] + ' passes overhead at latitude $' + fd(st[1], 1) + '^\\circ$ N.'], 'Declination works like latitude.', { unit: '°', vf: { k: 'id', x: st[1] } });
    }
    if (shape === 'meridian' || shape === 'meridian2') {
      var a1 = R.int(1, 18), a2 = a1 + R.int(2, 5), m1 = R.pick([0, 30]), m2 = R.pick([0, 30]), dh = (a2 + m2 / 60) - (a1 + m1 / 60);
      if (shape === 'meridian2') {
        var t1 = R.int(8, 10);
        return P('Star A (right ascension $' + ra(a1, m1) + '$) crosses your meridian at ' + t1 + ':00 pm. Star B has right ascension $' + ra(a2, m2) + '$. About how many hours after star A does star B cross the meridian?', num(dh, 3, 0.03),
          ['The sky turns westward, so stars cross the meridian in order of increasing right ascension.', 'B is $' + ra(a2, m2) + ' - ' + ra(a1, m1) + ' = ' + fd(dh, 1) + '$ h of right ascension east of A.', 'It crosses about $' + fd(dh, 1) + '$ h later (a few seconds less on a clock, since the sky turns once in 23 h 56 min).'],
          'The difference in right ascension is the wait.', { unit: 'h', vf: { k: 'dra', a: a1 + m1 / 60, b: a2 + m2 / 60 } });
      }
      return P('Two stars have right ascensions $' + ra(a1, m1) + '$ and $' + ra(a2, m2) + '$. How many hours apart do they cross your meridian?', num(dh, 3, 0.03),
        ['Right ascension measures how far east a star is, in hours, as the sky turns.', 'Difference: $' + fd(a2 + m2 / 60, 1) + ' - ' + fd(a1 + m1 / 60, 1) + ' = ' + fd(dh, 1) + '$ h.', 'The star with the smaller right ascension crosses first.'],
        'Subtract the right ascensions.', { unit: 'h', vf: { k: 'dra', a: a1 + m1 / 60, b: a2 + m2 / 60 } });
    }
    var hr = R.pick([6, 18, 12, 3, 21]);
    var right = 'It is $' + 15 * hr + '^\\circ$ east of the March equinox along the celestial equator';
    var wr = ['It rises at ' + (hr % 12 || 12) + (hr < 12 ? ' am' : ' pm') + ' every night', 'It can only be seen at ' + (hr % 12 || 12) + (hr < 12 ? ' am' : ' pm'), 'It is ' + hr + ' hours of travel away by light', 'It is $' + hr + '^\\circ$ above the horizon'];
    return P('A star has right ascension $' + hr + '^{\\mathrm{h}}$. What does that tell you?', mc(right, wrongs(R, wr, 3)),
      ['Right ascension is like longitude on the sky, measured eastward from the March equinox.', 'It is written in hours because the sky turns $15^\\circ$ each hour: $' + hr + '^{\\mathrm{h}} = ' + 15 * hr + '^\\circ$.', 'It is not a clock time: the star rises about 4 minutes earlier each night, so the time it rises changes through the year.'],
      'Right ascension hours are an angle.', { vf: { k: 'mc' } });
  });

  G('astro.solar-sidereal-day', function (R, ctx) {
    var shape = by(ctx, R.pick(['earlier', 'earlier', 'mc']), R.pick(['earlier', 'days', 'mc', 'count', 'earlier']), R.pick(['sid', 'days', 'count', 'deg', 'earlier']));
    if (shape === 'earlier') {
      var n = R.int(4, 45), t0 = R.int(8, 11), min = 3.94 * n;
      return P('A bright star rises at ' + t0 + ':00 pm tonight. About how many minutes earlier will it rise ' + n + ' days from now?', num(min, 3, 0.05),
        ['Earth turns once relative to the stars in 23 h 56 min, about 4 min less than a solar day.', 'So each night a star rises about 4 minutes earlier by the clock.', 'After ' + n + ' days: $' + n + ' \\times 3.94 \\approx ' + fd(min, 0) + '$ min earlier' + (min >= 60 ? ', about ' + fd(min / 60, 1) + ' h.' : '.')],
        'How much shorter is a sidereal day?', { unit: 'min', vf: { k: 'earlier', n: n } });
    }
    if (shape === 'days') {
      var hrs = R.pick([1, 2, 3, 4, 6]), days = hrs * 60 / 3.94;
      return P('Each night a star rises about 4 minutes earlier. After about how many days will it rise ' + hrs + ' hour' + (hrs > 1 ? 's' : '') + ' earlier than it does tonight?', num(days, 3, 0.05),
        ['$' + hrs + '$ h $= ' + hrs * 60 + '$ min.', 'At about 3.94 min per day: $' + hrs * 60 + ' \\div 3.94 \\approx ' + fd(days, 0) + '$ days.', 'That is why the night sky changes with the seasons: about 2 hours each month.'],
        'Turn hours into minutes first.', { unit: 'days', vf: { k: 'days', hrs: hrs } });
    }
    if (shape === 'mc') {
      var right = 'About $361^\\circ$, because Earth also moves about $1^\\circ$ along its orbit in a day';
      var wr = ['Exactly $360^\\circ$, because a day is one spin', 'About $359^\\circ$, because Earth\'s orbit carries it ahead', 'About $375^\\circ$, because the Moon pulls it along', 'It depends on the season, from $350^\\circ$ to $370^\\circ$'];
      return P('From one noon to the next (24 hours), how far does Earth turn on its axis?', mc(right, wrongs(R, wr, 3)),
        ['In 24 hours Earth moves about $360^\\circ \\div 365.25 \\approx 1^\\circ$ along its orbit.', 'To bring the Sun back to the meridian it must turn that extra $1^\\circ$: about $361^\\circ$ in all.', 'One full $360^\\circ$ turn, relative to the stars, takes 23 h 56 min: the sidereal day.'], 'Does the Sun stay in the same direction as Earth orbits?', { vf: { k: 'mc' } });
    }
    if (shape === 'count') {
      if (R.coin()) { var ny = R.int(60, 900), pn = R.pick(['An imaginary planet', 'A planet in a science-fiction story', 'A made-up planet']);
        return P(pn + ' spins in the same direction as it orbits its star, and its year lasts $' + ny + '$ of its solar days. How many times does it turn relative to the stars (how many sidereal days are in its year)?', num(ny + 1, 4, 0.0005),
          ['Going once around its star in the same direction as it spins, the planet makes one extra turn relative to the stars.', 'Sidereal days $= ' + ny + ' + 1 = ' + (ny + 1) + '$.'],
          'One extra turn per orbit.', { vf: { k: 'count', n: ny } }); }
      return P('In one year of $365.25$ solar days, how many times does Earth turn relative to the stars (how many sidereal days are in a year)?', num(366.25, 5, 0.0005),
        ['Going once around the Sun in the same direction as it spins, Earth makes one extra turn relative to the stars.', 'Sidereal days $= 365.25 + 1 = 366.25$.', 'Check: $366.25 \\times 23.934\\text{ h} \\approx 365.25 \\times 24\\text{ h} = 8766$ h.'], 'The orbit itself adds one turn.', { vf: { k: 'count' } });
    }
    if (shape === 'deg') {
      if (R.coin()) { var sp = R.pick([10, 12, 15, 18, 20, 24, 30]), mv = R.pick([0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]), mn = mv / sp * 60;
        return P('An imaginary planet spins $' + sp + '^\\circ$ per hour and moves about $' + fd(mv, 1) + '^\\circ$ along its orbit each day, in the same direction. About how many minutes longer is its solar day than its sidereal day?', num(mn, 3, 0.02),
          ['To face its star again, the planet must turn an extra $' + fd(mv, 1) + '^\\circ$ beyond one full turn.', 'At $' + sp + '^\\circ$ per hour that takes $' + fd(mv, 1) + ' \\div ' + sp + ' = ' + fd(mv / sp, 4) + '$ h.', '$' + fd(mv / sp, 4) + ' \\times 60 \\approx ' + fd(mn, 2) + '$ min.'],
          'Extra angle ÷ spin rate.', { unit: 'min', vf: { k: 'deg', sp: sp, mv: mv } }); }
      return P('Earth spins $15^\\circ$ per hour and moves about $0.986^\\circ$ along its orbit each day. About how many minutes does the extra turn take that a solar day needs beyond a sidereal day?', num(0.986 / 15 * 60, 3, 0.02),
        ['Earth must turn an extra $0.986^\\circ$ to face the Sun again.', 'At $15^\\circ$ per hour, that takes $0.986 \\div 15 = 0.0657$ h.', '$0.0657 \\times 60 \\approx 3.94$ min, so a sidereal day is about 23 h 56 min.'], 'Time = angle ÷ rate.', { unit: 'min', vf: { k: 'deg' } });
    }
    // sid: compute the sidereal day from the formula
    var year = 365.25;
    if (R.coin()) { var sd = R.pick([10, 12, 16, 18, 20, 30, 36, 48]), yd = R.pick([100, 150, 200, 250, 300, 400, 500, 700, 1000]), yh = sd * yd, sid = 1 / (1 / sd + 1 / yh);
      return P('An imaginary planet spins in the same direction as it orbits. Its solar day is $' + sd + '$ h and its year is $' + yd + '$ of those days ($' + T.commas(yh) + '$ h). Use $\\dfrac{1}{\\text{sidereal day}} = \\dfrac{1}{\\text{solar day}} + \\dfrac{1}{\\text{year}}$ to find its sidereal day, in hours. (Give 4 significant figures.)', num(sid, 5, 0.0003),
        ['$\\frac{1}{' + sd + '} + \\frac{1}{' + yh + '} = ' + fd(1 / sd + 1 / yh, 6) + '$ per hour.', 'Sidereal day $= 1 \\div ' + fd(1 / sd + 1 / yh, 6) + ' \\approx ' + fd(sid, 3) + '$ h.'],
        'Add the rates, then take 1 over the sum.', { unit: 'h', vf: { k: 'sid', sd: sd, yh: yh } }); }
    return P('Use $\\dfrac{1}{\\text{sidereal day}} = \\dfrac{1}{\\text{solar day}} + \\dfrac{1}{\\text{year}}$ with a solar day of $24$ h and a year of $365.25 \\times 24 = 8766$ h. How long is the sidereal day, in hours? (Give 4 significant figures.)', num(1 / (1 / 24 + 1 / 8766), 5, 0.0003),
      ['$\\frac{1}{24} + \\frac{1}{8766} = 0.041667 + 0.000114 = 0.041781$ per hour.', 'Sidereal day $= 1 \\div 0.041781 = 23.934$ h.', '$0.934$ h $\\approx 56$ min, so 23 h 56 min.'], 'Add the rates of turning, then flip.', { unit: 'h', vf: { k: 'sid' } });
  });

  G('astro.seasons', function (R, ctx) {
    var shape = by(ctx, R.pick(['date', 'overhead']), R.pick(['circle', 'tilt', 'overhead', 'date']), R.pick(['tilt', 'tilt2', 'circle', 'mc']));
    var TILT = 23.4;
    if (shape === 'date') {
      var d = R.pick([['June solstice (about June 21)', '+23.4^\\circ'], ['December solstice (about December 21)', '-23.4^\\circ'], ['March equinox (about March 20)', '0^\\circ'], ['September equinox (about September 22)', '0^\\circ']]);
      var choices = ['$+23.4^\\circ$', '$-23.4^\\circ$', '$0^\\circ$', '$+66.6^\\circ$', '$-66.6^\\circ$'];
      var right = '$' + d[1].replace('+', '+') + '$';
      return P('What is the Sun\'s declination on the ' + d[0] + '?', mc(right, choices.filter(function (c) { return c !== right; })),
        ['Because Earth\'s axis is tilted $23.4^\\circ$, the Sun\'s declination swings between $+23.4^\\circ$ (June) and $-23.4^\\circ$ (December).', 'At the equinoxes the Sun is on the celestial equator: declination $0^\\circ$.', 'On the ' + d[0] + ' it is $' + d[1] + '$.'], 'Solstice: farthest from the equator. Equinox: on it.', { vf: { k: 'mc' } });
    }
    if (shape === 'overhead') {
      var e = R.pick([['the June solstice', TILT], ['the December solstice', -TILT], ['the March equinox', 0], ['the September equinox', 0]]);
      return P('At what latitude is the Sun straight overhead at noon on ' + e[0] + '? Use north positive and south negative.', exact(e[1]),
        ['The Sun is overhead where the latitude equals the Sun\'s declination.', 'On ' + e[0] + ' the declination is $' + fd(e[1], 1) + '^\\circ$.', e[1] > 0 ? 'So latitude $23.4^\\circ$ N: the Tropic of Cancer.' : e[1] < 0 ? 'So latitude $23.4^\\circ$ S: the Tropic of Capricorn (enter $-23.4$).' : 'So the equator, latitude $0^\\circ$.'],
        'Declination works like latitude.', { unit: '°', vf: { k: 'id', x: e[1] } });
    }
    if (shape === 'circle') {
      var south = R.coin();
      return P('On the ' + (south ? 'December' : 'June') + ' solstice, the Sun never sets for anyone poleward of a certain latitude in the ' + (south ? 'Southern' : 'Northern') + ' Hemisphere. What latitude is that (in degrees from the equator)?', num(90 - TILT, 3, 0.005),
        ['On that day the Sun is $23.4^\\circ$ from the celestial equator, toward the ' + (south ? 'south' : 'north') + ' celestial pole.', 'Circles of the sky within $23.4^\\circ$ of the pole are circumpolar where the pole is at least $90^\\circ - 23.4^\\circ$ up.', 'So the Sun stays up all day poleward of $90^\\circ - 23.4^\\circ = 66.6^\\circ$: the ' + (south ? 'Antarctic' : 'Arctic') + ' Circle.'],
        'The polar circles are $90^\\circ$ minus the tilt.', { unit: '°', vf: { k: 'polar', tilt: TILT } });
    }
    if (shape === 'tilt' || shape === 'tilt2') {
      var pl = R.pick([['Mars', 25.2], ['Saturn', 26.7], ['Neptune', 28.3], ['an imaginary planet', R.pick([10, 15, 20, 30, 35, 40, 12, 16, 22, 28, 34, 38])]]);
      var askPolar = shape === 'tilt2' || R.coin(), val = askPolar ? 90 - pl[1] : pl[1];
      return P('The axis of ' + pl[0] + ' is tilted $' + fd(pl[1], 1) + '^\\circ$. If it had tropics and polar circles like Earth\'s, at what latitude would its ' + (askPolar ? 'polar circles' : 'tropics') + ' be?', num(val, 3, 0.005),
        ['The Sun\'s declination swings up to the tilt angle, $' + fd(pl[1], 1) + '^\\circ$, on each side of the equator.', askPolar ? 'Polar circles: where the Sun can stay up all day, $90^\\circ$ minus the tilt: $90^\\circ - ' + fd(pl[1], 1) + '^\\circ = ' + fd(val, 1) + '^\\circ$.' : 'Tropics: the farthest from the equator the Sun can be overhead, equal to the tilt: $' + fd(val, 1) + '^\\circ$.'],
        askPolar ? 'Polar circle = 90° − tilt.' : 'Tropic = tilt.', { unit: '°', vf: { k: askPolar ? 'polar' : 'tropic', tilt: pl[1] } });
    }
    var right = 'They are set by Earth\'s $23.4^\\circ$ tilt: the tropics at $23.4^\\circ$ and the polar circles at $90^\\circ - 23.4^\\circ$';
    var wr = ['They were chosen by mapmakers to divide Earth into equal parts', 'They mark where Earth is closest to and farthest from the Sun', 'They move a few degrees every year with the seasons', 'They are where the Moon is overhead at the solstices'];
    return P('Why are the tropics and the polar circles where they are?', mc(right, wrongs(R, wr, 3)),
      ['The Sun can be straight overhead only between $23.4^\\circ$ N and $23.4^\\circ$ S, because its declination never goes farther from the equator.', 'Poleward of $66.6^\\circ$, the Sun stays up all day near one solstice and down all day near the other.', 'Both lines come straight from the tilt (which wobbles only slowly, over thousands of years).'], 'What sets how far the Sun\'s declination can swing?', { vf: { k: 'mc' } });
  });

  G('astro.sun-noon-altitude', function (R, ctx) {
    var shape = by(ctx, R.pick(['equinox', 'solstice']), R.pick(['solstice', 'reverse', 'south', 'equinox']), R.pick(['erato', 'reverse2', 'south', 'mc']));
    var L = R.pick(LATS), lat = L[0], city = L[1];
    if (shape === 'equinox') return P('What is the Sun\'s altitude at noon in ' + city + ' (latitude $' + lat + '^\\circ$ N) on an equinox?', exact(90 - lat),
      ['Noon altitude $= 90^\\circ - \\text{latitude} + \\delta$, where $\\delta$ is the Sun\'s declination.', 'At an equinox $\\delta = 0^\\circ$, so the altitude is just $90^\\circ - \\text{latitude}$.', '$90^\\circ - ' + lat + '^\\circ = ' + (90 - lat) + '^\\circ$.'], 'On an equinox the Sun is on the celestial equator.', { unit: '°', vf: { k: 'noon', lat: lat, dec: 0 } });
    if (shape === 'solstice') {
      var jun = R.coin(), dec = jun ? 23.4 : -23.4, alt = 90 - lat + dec;
      return P('What is the Sun\'s altitude at noon in ' + city + ' (latitude $' + lat + '^\\circ$ N) on the ' + (jun ? 'June' : 'December') + ' solstice?', num(alt, 3, 0.005),
        ['Noon altitude $= 90^\\circ - \\text{latitude} + \\delta$.', 'On the ' + (jun ? 'June' : 'December') + ' solstice $\\delta = ' + fd(dec, 1) + '^\\circ$.', '$90^\\circ - ' + lat + '^\\circ ' + (jun ? '+ 23.4^\\circ' : '- 23.4^\\circ') + ' = ' + fd(alt, 1) + '^\\circ$.'],
        'Start from the equinox value, then add the declination.', { unit: '°', vf: { k: 'noon', lat: lat, dec: dec } });
    }
    if (shape === 'reverse' || shape === 'reverse2') {
      var d2 = shape === 'reverse2' ? R.pick([23.4, -23.4]) : 0, h = d2 < 0 ? R.int(15, 65) : R.int(25, 75), la = 90 - h + d2;
      return P('On ' + (d2 === 0 ? 'an equinox' : d2 > 0 ? 'the June solstice' : 'the December solstice') + ', you measure the noon Sun at $' + h + '^\\circ$ above the southern horizon. What is your latitude (degrees north)?', num(la, 3, 0.005),
        ['Noon altitude $h = 90^\\circ - \\text{latitude} + \\delta$, so latitude $= 90^\\circ - h + \\delta$.', 'Here $\\delta = ' + fd(d2, 1) + '^\\circ$.', 'Latitude $= 90^\\circ - ' + h + '^\\circ ' + (d2 > 0 ? '+ 23.4^\\circ' : d2 < 0 ? '- 23.4^\\circ' : '') + ' = ' + fd(la, 1) + '^\\circ$ N.'],
        'Solve the noon-altitude formula for latitude.', { unit: '°', vf: { k: 'revnoon', h: h, dec: d2 } });
    }
    if (shape === 'south') {
      var sc = R.pick([['Sydney', 34], ['Cape Town', 34], ['Buenos Aires', 35], ['Santiago', 33], ['Melbourne', 38], ['Auckland', 37], ['Perth', 32], ['Brisbane', 27], ['Wellington', 41], ['Montevideo', 35], ['Hobart', 43]]), jun2 = R.coin(), dec2 = jun2 ? 23.4 : -23.4, alt2 = 90 - M.abs(-sc[1] - dec2);
      return P('What is the noon Sun\'s altitude in ' + sc[0] + ' (latitude $' + sc[1] + '^\\circ$ S) on the ' + (jun2 ? 'June' : 'December') + ' solstice?', num(alt2, 3, 0.005),
        ['In general, noon altitude $= 90^\\circ - |\\text{latitude} - \\delta|$, with south counted negative.', 'Latitude $= -' + sc[1] + '^\\circ$, $\\delta = ' + fd(dec2, 1) + '^\\circ$: the difference is $' + fd(M.abs(-sc[1] - dec2), 1) + '^\\circ$.', 'Altitude $= 90^\\circ - ' + fd(M.abs(-sc[1] - dec2), 1) + '^\\circ = ' + fd(alt2, 1) + '^\\circ$' + (jun2 ? ': winter there, so the Sun is low (in the north).' : ': summer there, so the Sun is high (in the north).')],
        'In the Southern Hemisphere the seasons are reversed.', { unit: '°', vf: { k: 'noon', lat: -sc[1], dec: dec2 } });
    }
    if (shape === 'erato') {
      var ang = R.pick([6, 7.2, 7.5, 8, 9, 10, 4, 4.5, 5, 6.4, 12]), dist = R.pick([600, 700, 800, 900, 1000, 400, 450, 500, 550, 650, 750, 850, 1200]), circ = dist * 360 / ang;
      return P('At noon on the June solstice the Sun is straight overhead in one town, while in a second town $' + dist + '$ km due north the Sun is $' + fd(ang, 1) + '^\\circ$ from overhead. Using Eratosthenes\'s method, how big around is the planet, in km?', num(circ, 3, 0.02),
        ['The Sun\'s rays arrive parallel, so the $' + fd(ang, 1) + '^\\circ$ difference is the angle between the towns at Earth\'s center.', '$' + fd(ang, 1) + '^\\circ$ is $\\frac{' + fd(ang, 1) + '}{360}$ of a full circle, and it spans $' + dist + '$ km.', 'Circumference $= ' + dist + ' \\times \\frac{360}{' + fd(ang, 1) + '} = ' + T.commas(rnd(circ, 3)) + '$ km.'],
        'What fraction of 360° is the angle?', { unit: 'km', vf: { k: 'erato', ang: ang, dist: dist } });
    }
    var la2 = R.pick([35, 40, 42, 45, 47, 30, 32, 33, 38, 44, 50, 52, 55, 60, 34, 36, 46, 48, 54, 56, 58]), mx = 90 - la2 + 23.4;
    var right = 'No. The highest it gets is $' + fd(mx, 1) + '^\\circ$, at noon on the June solstice';
    var wr = ['Yes, at noon on the June solstice', 'Yes, at noon every day in summer', 'Yes, at noon on the equinoxes', 'No, because the Sun is always due east at noon'];
    return P('At latitude $' + la2 + '^\\circ$ N, is the Sun ever straight overhead?', mc(right, wrongs(R, wr, 3)),
      ['The Sun is overhead only where latitude equals its declination, which stays between $-23.4^\\circ$ and $+23.4^\\circ$.', 'At $' + la2 + '^\\circ$ N the noon Sun is highest in June: $90^\\circ - ' + la2 + '^\\circ + 23.4^\\circ = ' + fd(mx, 1) + '^\\circ$.', 'Only places between the tropics ever have the Sun straight overhead.'], 'Compare your latitude with the Tropic of Cancer.', { vf: { k: 'mc' } });
  });

  var PHASES = [['new moon', 0, 6], ['waxing crescent', 45, 9], ['first quarter', 90, 12], ['waxing gibbous', 135, 15], ['full moon', 180, 18], ['waning gibbous', 225, 21], ['third quarter', 270, 0], ['waning crescent', 315, 3]];
  function clock(h) { h = ((h % 24) + 24) % 24; return h === 0 ? 'midnight' : h === 12 ? 'noon' : (h % 12) + ':00 ' + (h < 12 ? 'am' : 'pm'); }
  G('astro.moon-phases', function (R, ctx) {
    var shape = by(ctx, R.pick(['rise', 'rise', 'pic']), R.pick(['rise', 'which', 'elong', 'pic', 'set']), R.pick(['age', 'later', 'elong', 'which', 'set']));
    if (shape === 'rise' || shape === 'set') {
      var ph = R.pick(PHASES), setT = shape === 'set', t = setT ? ph[2] + 12 : ph[2];
      var opts = [0, 3, 6, 9, 12, 15, 18, 21].map(clock), right = clock(t);
      return P('About what time does a <b>' + ph[0] + '</b> ' + (setT ? 'set' : 'rise') + '?', mc(right, wrongs(R, opts, 3, right)),
        ['The ' + ph[0] + ' is about $' + ph[1] + '^\\circ$ east of the Sun' + (ph[1] === 0 ? ' (next to it)' : '') + '.', 'The sky turns $15^\\circ$ per hour, so the Moon rises about $' + ph[1] + ' \\div 15 = ' + ph[1] / 15 + '$ h after the Sun (6:00 am): ' + clock(ph[2]) + '.', setT ? 'It sets about 12 hours after rising: ' + clock(t) + '.' : 'It sets about 12 hours later, at ' + clock(ph[2] + 12) + '.'],
        'How far east of the Sun is this phase?', { vf: { k: 'mc' } });
    }
    if (shape === 'which') {
      var w = R.pick([['high in the south at sunset', 'first quarter'], ['rising in the east at sunset', 'full moon'], ['rising at midnight', 'third quarter'], ['high in the south at sunrise', 'third quarter'], ['high in the south at midnight', 'full moon'], ['setting in the west at sunset, close to the Sun', 'waxing crescent'], ['rising in the east just before sunrise', 'waning crescent'], ['rising at noon', 'first quarter']]);
      var names = PHASES.map(function (q) { return q[0]; });
      return P('You see the Moon ' + w[0] + '. Which phase is it?', mc(w[1], wrongs(R, names, 3, w[1])),
        ['Each phase sits at its own angle from the Sun, so it keeps its own schedule.', 'Work out how far east of the Sun the Moon must be: every $15^\\circ$ is one hour later than the Sun.', 'That angle matches the ' + w[1] + '.'], 'Where is the Sun at that time, and where is the Moon?', { vf: { k: 'mc' } });
    }
    if (shape === 'elong') {
      var e = R.pick([30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]), hrs = e / 15;
      return P('The Moon is $' + e + '^\\circ$ east of the Sun. About how many hours after sunrise does it rise?', exact(hrs),
        ['The sky turns $15^\\circ$ per hour.', 'A Moon $' + e + '^\\circ$ east of the Sun reaches the horizon $' + e + ' \\div 15 = ' + hrs + '$ h after the Sun.', 'With sunrise at 6:00 am, it rises about ' + clock(6 + hrs) + '.'], 'How many 15° steps?', { unit: 'h', vf: { k: 'elong', e: e } });
    }
    if (shape === 'age') {
      var age = R.pick([3, 4, 5, 6, 8, 10, 11, 12, 16, 18, 20, 22]), el = 360 * age / 29.5, hr2 = el / 15;
      return P('The Moon is ' + age + ' days past new moon. The phases repeat every 29.5 days. About how many hours after the Sun does it rise?', num(hr2, 3, 0.05),
        ['Each day the Moon moves $360^\\circ \\div 29.5 \\approx 12.2^\\circ$ farther east of the Sun.', 'After ' + age + ' days: $' + age + ' \\times 12.2^\\circ \\approx ' + fd(el, 0) + '^\\circ$.', 'At $15^\\circ$ per hour: $' + fd(el, 0) + ' \\div 15 \\approx ' + fd(hr2, 1) + '$ h after the Sun.'],
        'First find the angle from the Sun.', { unit: 'h', vf: { k: 'age', age: age } });
    }
    if (shape === 'later') {
      return P('The Moon rises about 12.2° farther behind the Sun each day, and the sky turns $15^\\circ$ per hour. About how many minutes later does the Moon rise each day?', num(12.2 / 15 * 60, 3, 0.05),
        ['$12.2^\\circ \\div 15^\\circ$ per hour $= 0.81$ h.', '$0.81 \\times 60 \\approx 49$ min, about 50 minutes later each day.'], 'Time = angle ÷ rate.', { unit: 'min', vf: { k: 'later' } });
    }
    // pic: which lettered Moon is at a given phase
    var idx = R.int(0, 7), others = R.sample([0, 1, 2, 3, 4, 5, 6, 7].filter(function (i) { return i !== idx; }), 3), pos = R.shuffle(others.concat([idx])), tags = {}, ch = ['A', 'B', 'C', 'D'];
    pos.forEach(function (i, n) { tags['moon' + i] = ch[n]; });
    return P('The picture looks down on Earth from above its North Pole, with sunlight coming from the left. Which lettered Moon is at <b>' + PHASES[idx][0] + '</b>?', { t: 'mc', choices: ch, v: pos.indexOf(idx), keep: true },
      ['The Moon goes around counterclockwise in this view, starting from new moon between Earth and the Sun (on the left).', 'Each eighth of the orbit is an eighth of the cycle: first quarter at the bottom, full moon opposite the Sun (right), third quarter at the top.', 'The ' + PHASES[idx][0] + ' is the one labeled ' + ch[pos.indexOf(idx)] + '.'],
      'New moon is on the Sun\'s side of Earth.', { viz: { name: 'ph-sky', opts: { mode: 'moon', moonAge: 0, interactive: false, quiet: true, tags: tags } }, vf: { k: 'mc' } });
  });

  G('astro.synodic-month', function (R, ctx) {
    var shape = by(ctx, R.pick(['earthDeg', 'moonK', 'moonK']), R.pick(['moonK', 'reverse', 'earth', 'earthDeg']), R.pick(['planet', 'reverse', 'moonK']));
    if (shape === 'earthDeg') {
      if (R.chance(0.75)) { var IV = R.pick([['one synodic month ($29.5$ days)', 29.5], ['one week ($7$ days)', 7], ['$10$ days', 10], ['two weeks ($14$ days)', 14], ['$30$ days', 30], ['$45$ days', 45], ['$60$ days', 60], ['$73$ days', 73], ['one season (about $91.3$ days)', 91.3], ['$100$ days', 100], ['$120$ days', 120], ['$146$ days', 146], ['half a year ($182.6$ days)', 182.6], ['$200$ days', 200], ['$250$ days', 250], ['$300$ days', 300]]), dg = IV[1] * 360 / 365.25;
        return P('In ' + IV[0] + ', how many degrees does Earth move along its orbit? (A year is $365.25$ days.)', num(dg, 3, 0.02),
          ['Earth moves $360^\\circ$ in $365.25$ days: $0.986^\\circ$ per day.', '$' + fd(IV[1], 1) + ' \\times \\dfrac{360^\\circ}{365.25} \\approx ' + fd(dg, 1) + '^\\circ$.'],
          'Degrees per day × days.', { unit: '°', vf: { k: 'earthDeg', d: IV[1] } }); }
      return P('In one sidereal month ($27.3$ days), how many degrees does Earth move along its orbit? (A year is $365.25$ days.)', num(27.3 * 360 / 365.25, 3, 0.02),
        ['Earth moves $360^\\circ$ in $365.25$ days: $0.986^\\circ$ per day.', '$27.3 \\times 0.986^\\circ \\approx ' + fd(27.3 * 360 / 365.25, 1) + '^\\circ$.', 'So after one orbit relative to the stars, the Moon still has about $27^\\circ$ to go to line up with the Sun again: two more days.'], 'Degrees per day × days.', { unit: '°', vf: { k: 'earthDeg' } });
    }
    if (shape === 'earth') {
      var S = 1 / (1 / 27.32 - 1 / 365.25);
      return P('The Moon orbits Earth in $27.32$ days relative to the stars, and Earth orbits the Sun in $365.25$ days. Use $\\dfrac{1}{S} = \\dfrac{1}{P_{\\text{moon}}} - \\dfrac{1}{P_{\\text{year}}}$ to find the synodic month $S$ in days.', num(S, 4, 0.002),
        ['$\\frac{1}{27.32} = 0.036603$ and $\\frac{1}{365.25} = 0.002738$ per day.', '$\\frac{1}{S} = 0.036603 - 0.002738 = 0.033865$ per day.', '$S = 1 \\div 0.033865 \\approx 29.53$ days.'], 'Subtract the rates, then flip.', { unit: 'days', vf: { k: 'syn', p: 27.32, y: 365.25 } });
    }
    if (shape === 'moonK' || shape === 'reverse') {
      var k = R.pick([3, 4, 5, 6, 7, 9, 11, 13, 16, 21, 26]), p = R.pick([2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20]), y = k * p, s = p * k / (k - 1);
      if (shape === 'reverse') return P('On a moon of a distant planet, the phases repeat every $' + fd(s, 3) + '$ days. The planet orbits its star in $' + y + '$ days. How long does the moon take to orbit the planet relative to the stars?', num(p, 3, 0.01),
        ['The synodic month is longer than the sidereal one: $\\frac{1}{S} = \\frac{1}{P} - \\frac{1}{Y}$, so $\\frac{1}{P} = \\frac{1}{S} + \\frac{1}{Y}$.', '$\\frac{1}{P} = \\frac{1}{' + fd(s, 3) + '} + \\frac{1}{' + y + '} = ' + fd(1 / s, 5) + ' + ' + fd(1 / y, 5) + ' = ' + fd(1 / s + 1 / y, 5) + '$ per day.', '$P = ' + fd(p, 2) + '$ days.'],
        'The sidereal month is the shorter one.', { unit: 'days', vf: { k: 'sid', s: s, y: y } });
      return P('A moon orbits its planet in $' + p + '$ days relative to the stars, and the planet orbits its star in $' + y + '$ days, both in the same direction. How long is the moon\'s cycle of phases (its synodic month)?', num(s, 3, 0.01),
        ['$\\frac{1}{S} = \\frac{1}{P} - \\frac{1}{Y} = \\frac{1}{' + p + '} - \\frac{1}{' + y + '}$.', 'Common denominator $' + y + '$: $\\frac{' + k + ' - 1}{' + y + '} = \\frac{' + (k - 1) + '}{' + y + '}$.', '$S = \\frac{' + y + '}{' + (k - 1) + '} = ' + fd(s, 2) + '$ days, a bit longer than ' + p + ' days.'],
        'Subtract the rates.', { unit: 'days', vf: { k: 'syn', p: p, y: y } });
    }
    var pl = R.pick([['Mars', 1.88], ['Jupiter', 11.86], ['Saturn', 29.46], ['Venus', 0.615], ['Mercury', 0.241], ['Uranus', 84.0], ['Neptune', 164.8], ['the dwarf planet Ceres', 4.60], ['an imaginary planet', R.pick([1.5, 2, 2.5, 3, 4, 5, 6, 8])], ['an imaginary planet', R.pick([0.3, 0.4, 0.5, 0.6, 0.75, 0.8])]]), inner = pl[1] < 1, S2 = 1 / M.abs(1 / pl[1] - 1);
    return P('The same idea gives a planet\'s synodic period, the time between one ' + (inner ? 'inferior conjunction' : 'opposition') + ' and the next: $\\dfrac{1}{S} = \\left|\\dfrac{1}{P} - \\dfrac{1}{1\\,\\text{yr}}\\right|$. ' + pl[0] + ' orbits the Sun in $' + fd(pl[1], 3) + '$ years. Find its synodic period in years.', num(S2, 3, 0.01),
      ['Rates: ' + pl[0] + ' goes around $\\frac{1}{' + fd(pl[1], 3) + '} = ' + fd(1 / pl[1], 4) + '$ times per year, Earth once per year.', 'The faster one gains on the slower at $' + fd(M.abs(1 / pl[1] - 1), 4) + '$ laps per year.', '$S = 1 \\div ' + fd(M.abs(1 / pl[1] - 1), 4) + ' \\approx ' + fd(S2, 2) + '$ years' + (inner ? '.' : ': that is how often ' + pl[0] + ' goes into retrograde.')],
      'Which planet laps the other?', { unit: 'yr', vf: { k: 'planetSyn', p: pl[1] } });
  });

  G('astro.eclipses', function (R, ctx) {
    var shape = by(ctx, R.pick(['phase', 'why']), R.pick(['angle', 'widths', 'season', 'why', 'phase']), R.pick(['ta', 'angle', 'drift', 'season']));
    if (shape === 'phase') {
      var lunar = R.coin();
      return P('At which phase of the Moon can a ' + (lunar ? 'lunar' : 'solar') + ' eclipse happen?', mc(lunar ? 'full moon' : 'new moon', wrongs(R, lunar ? ['new moon', 'first quarter', 'third quarter', 'any phase'] : ['full moon', 'first quarter', 'third quarter', 'any phase'], 3)),
        [lunar ? 'In a lunar eclipse the Moon passes through Earth\'s shadow, so Earth must be between the Sun and the Moon.' : 'In a solar eclipse the Moon blocks the Sun, so the Moon must be between the Sun and Earth.', lunar ? 'That arrangement is full moon.' : 'That arrangement is new moon.'], 'What has to line up with what?', { vf: { k: 'mc' } });
    }
    if (shape === 'why') {
      var right = 'The Moon\'s orbit is tilted about $5^\\circ$, so the Moon usually passes above or below the Sun–Earth line';
      var wr = ['The Moon\'s orbit is too far away for its shadow to reach Earth', 'Earth\'s tilt of $23.4^\\circ$ keeps the shadows apart', 'The Moon is too small to cover the Sun except twice a year', 'Eclipses do happen every month, but most are hidden by clouds'];
      return P('Why isn\'t there a solar eclipse at every new moon?', mc(right, wrongs(R, wr, 3)),
        ['The Moon\'s orbit is tilted about $5^\\circ$ to Earth\'s orbit.', 'Most months the new moon passes a little north or south of the Sun, and its shadow misses Earth.', 'Only when new moon falls near a node (where the orbits cross) does the shadow land on Earth: in the eclipse seasons.'], 'Picture the Moon\'s orbit as a tilted hoop.', { vf: { k: 'mc' } });
    }
    if (shape === 'widths') {
      return P('The Moon\'s orbit is tilted $5.1^\\circ$, and the Sun looks about $0.53^\\circ$ wide. At most, how many Sun-widths above or below the Sun can the new moon pass?', num(5.1 / 0.53, 3, 0.04),
        ['The Moon can be up to $5.1^\\circ$ above or below the Sun–Earth line.', '$5.1^\\circ \\div 0.53^\\circ \\approx ' + fd(5.1 / 0.53, 1) + '$ Sun-widths.', 'A miss by even one Sun-width means no eclipse, so most new moons miss.'], 'Divide the tilt by the Sun\'s width.', { vf: { k: 'widths' } });
    }
    if (shape === 'angle' || shape === 'ta') {
      var d = R.pick([357000, 362000, 370000, 384000, 395000, 400000, 405000]), th = 57.3 * 3474 / d, sun = 0.533, total = th > sun;
      if (shape === 'ta') return P('During a solar eclipse the Moon is $' + T.commas(d) + '$ km from Earth. The Moon is $3474$ km across, and the Sun looks $0.533^\\circ$ wide. Will a perfectly lined-up eclipse be total or annular (a ring of Sun showing)?', mc(total ? 'Total: the Moon looks bigger than the Sun' : 'Annular: the Moon looks smaller than the Sun', [total ? 'Annular: the Moon looks smaller than the Sun' : 'Total: the Moon looks bigger than the Sun', 'Neither: the Moon and Sun always look the same size', 'Partial only, because the Moon\'s orbit is tilted']),
        ['Angular size $\\approx 57.3^\\circ \\times \\frac{\\text{diameter}}{\\text{distance}}$.', 'Moon: $57.3^\\circ \\times \\frac{3474}{' + T.commas(d) + '} = ' + fd(th, 3) + '^\\circ$.', total ? 'That is larger than the Sun\'s $0.533^\\circ$, so the Moon covers the whole Sun: total.' : 'That is smaller than the Sun\'s $0.533^\\circ$, so a ring of Sun is left: annular.'],
        'Compare angular sizes.', { vf: { k: 'mc' } });
      return P('The Moon is $3474$ km across. How wide does it look (its angular diameter, in degrees) when it is $' + T.commas(d) + '$ km away? Use angle $\\approx 57.3^\\circ \\times \\dfrac{\\text{diameter}}{\\text{distance}}$.', num(th, 3, 0.02),
        ['$57.3^\\circ$ is one radian: the small-angle formula.', '$57.3^\\circ \\times \\frac{3474}{' + T.commas(d) + '} = ' + fd(th, 3) + '^\\circ$.', 'The Sun looks about $0.53^\\circ$ wide, so this eclipse would be ' + (total ? 'total.' : 'annular.')],
        'Diameter ÷ distance, times 57.3°.', { unit: '°', vf: { k: 'ang', D: 3474, d: d } });
    }
    if (shape === 'season') {
      return P('Eclipse seasons come when the line of nodes points at the Sun, about every half eclipse year. The eclipse year is $346.6$ days. About how many days apart are the eclipse seasons?', num(173.3, 3, 0.02),
        ['The line of nodes points at the Sun twice per eclipse year, once at each node.', '$346.6 \\div 2 = 173.3$ days, a little under six months.'], 'Twice per eclipse year.', { unit: 'days', vf: { k: 'season' } });
    }
    return P('The eclipse year ($346.6$ days) is shorter than the calendar year ($365.25$ days), because the Moon\'s nodes slowly slide around. By about how many days do the eclipse seasons arrive earlier each year?', num(365.25 - 346.6, 3, 0.03),
      ['Each eclipse season repeats after one eclipse year.', '$365.25 - 346.6 = 18.65$ days.', 'So eclipse seasons drift about 19 days earlier each year and pass through every month in about 18.6 years.'], 'Subtract the two years.', { unit: 'days', vf: { k: 'drift' } });
  });

// ---- 02_orbits.js

  // =====================================================================================================
  // Unit 2: Gravity and Orbits
  var ORB = [['Mercury', 0.387, 0.206], ['Venus', 0.723, 0.007], ['Earth', 1.000, 0.017], ['Mars', 1.524, 0.093], ['Jupiter', 5.20, 0.049], ['Saturn', 9.54, 0.057], ['Pluto', 39.5, 0.249], ['Halley\'s Comet', 17.8, 0.967], ['the asteroid Ceres', 2.77, 0.079], ['the dwarf planet Eris', 67.7, 0.44]];

  G('astro.heliocentric-model', function (R, ctx) {
    var shape = by(ctx, R.pick(['retro', 'when', 'venus']), R.pick(['retro', 'which', 'venus', 'size', 'when']), R.pick(['size', 'which', 'lap', 'venus']));
    if (shape === 'retro') {
      var pl = R.pick(['Mars', 'Jupiter', 'Saturn']);
      return P('For a few weeks ' + pl + ' seems to stop, drift backward (west) against the stars, then move forward again. What causes this retrograde loop?', mc('Earth, moving faster on its inner orbit, catches up with and passes ' + pl, wrongs(R, [pl + ' turns around and moves backward along its orbit for a while', 'The Sun\'s gravity briefly pulls ' + pl + ' backward', pl + '\'s moons tug it backward', 'Earth\'s daily spin reverses for a few weeks', pl + ' slows down near the far end of its orbit and slides back'], 3)),
        ['In a Sun-centered model every planet moves forward around the Sun all the time.', 'Earth is closer to the Sun and moves faster, so it overtakes ' + pl + ', the way a faster car passes a slower one.', 'While Earth passes, our line of sight to ' + pl + ' swings backward against the distant stars: an apparent loop, not a real one.'],
        'Think of passing a slower car on a highway.', { viz: R.coin() ? { name: 'astro-retrograde', opts: { interactive: false, quiet: true, t: 0.5 } } : undefined, vf: { k: 'mc' } });
    }
    if (shape === 'when') {
      return P('When does Mars appear to move backward (retrograde) in our sky?', mc('Around opposition, when Earth passes between Mars and the Sun', wrongs(R, ['When Mars is behind the Sun, on the far side of its orbit', 'When Mars is at aphelion, farthest from the Sun', 'Whenever Mars is closest to the Sun', 'Every night, just after sunset', 'Only during a lunar eclipse'], 3)),
        ['Retrograde motion happens while Earth overtakes Mars.', 'That is when the two planets are on the same side of the Sun, with Earth in between: Mars is opposite the Sun in our sky (opposition).', 'Mars is then closest and brightest, high at midnight.'], 'When does a faster runner pass a slower one?', { vf: { k: 'mc' } });
    }
    if (shape === 'venus') {
      var right = 'Venus shows a full set of phases, from crescent to nearly full, and looks smallest when nearly full';
      return P('Galileo\'s telescope revealed something about Venus that the Earth-centered model could not explain. What was it?', mc(right, wrongs(R, ['Venus has four large moons', 'Venus has mountains and craters', 'Venus never shows any phases', 'Venus moves backward every few weeks', 'Venus is always exactly as bright as Jupiter'], 3)),
        ['In the Earth-centered model, Venus always stays between Earth and the Sun, so we would only ever see it as a crescent.', 'Galileo saw gibbous and nearly full phases, which need Venus to go around to the far side of the Sun.', 'It also looked small when nearly full (far away, beyond the Sun) and large as a crescent (close by): just what a Sun-centered orbit predicts.'],
        'Which phases need Venus to go behind the Sun?', { vf: { k: 'mc' } });
    }
    if (shape === 'which') {
      var good = R.pick(['the full set of phases of Venus', 'moons orbiting Jupiter, so not everything circles Earth', 'retrograde loops happening only when a planet is opposite the Sun (or, for Venus and Mercury, near the Sun)']);
      return P('Which observation supports a Sun-centered solar system over an Earth-centered one?', mc(good, wrongs(R, ['the Sun rising in the east every morning', 'the stars circling Polaris every night', 'the Moon showing phases', 'planets shining by reflected sunlight', 'the Sun appearing to move along the ecliptic during the year'], 3)),
        ['The Sun rising, the stars circling and the Moon\'s phases fit both models equally well, so they cannot decide between them.', 'The correct choice is something the Earth-centered model gets wrong or cannot explain without extra machinery.', 'Galileo\'s Venus phases and Jupiter\'s moons, along with the simple explanation of retrograde motion, favored Copernicus.'],
        'Look for something only one model explains.', { vf: { k: 'mc' } });
    }
    if (shape === 'size') {
      var p = R.pick([['Venus', 0.72], ['Mercury', 0.39]]), near = 1 - p[1], far = 1 + p[1], ratio = far / near;
      return P(p[0] + ' orbits the Sun at $' + fd(p[1], 2) + '$ AU and Earth at $1$ AU. In the Sun-centered model, how many times larger does ' + p[0] + ' look when it is closest to Earth than when it is farthest away?', num(ratio, 3, 0.02),
        ['Closest (between Earth and the Sun): $1 - ' + fd(p[1], 2) + ' = ' + fd(near, 2) + '$ AU. Farthest (beyond the Sun): $1 + ' + fd(p[1], 2) + ' = ' + fd(far, 2) + '$ AU.', 'Apparent size is inversely proportional to distance.', 'Ratio $= ' + fd(far, 2) + ' \\div ' + fd(near, 2) + ' \\approx ' + fd(ratio, 1) + '$.'],
        'Find the nearest and farthest distances.', { vf: { k: 'size', r: p[1] } });
    }
    var pp = R.pick([['Jupiter', 11.86], ['Saturn', 29.46], ['Mars', 1.88], ['Uranus', 84.0]]), S = 1 / (1 - 1 / pp[1]);
    return P('Retrograde loops of ' + pp[0] + ' repeat each time Earth laps it. ' + pp[0] + ' orbits the Sun in $' + fd(pp[1], 2) + '$ years. How many years apart are its retrograde loops?', num(S, 3, 0.01),
      ['Earth goes around once per year; ' + pp[0] + ' goes around $\\frac{1}{' + fd(pp[1], 2) + '}$ of a time per year.', 'Earth gains $1 - \\frac{1}{' + fd(pp[1], 2) + '} = ' + fd(1 - 1 / pp[1], 4) + '$ laps per year.', 'One lap takes $1 \\div ' + fd(1 - 1 / pp[1], 4) + ' \\approx ' + fd(S, 2) + '$ years.'],
      'How fast does Earth gain on it?', { unit: 'yr', vf: { k: 'lap', p: pp[1] } });
  });

  G('astro.kepler-first-law', function (R, ctx) {
    var shape = by(ctx, R.pick(['peri', 'aph', 'mc']), R.pick(['aOf', 'eOf', 'peri', 'aph', 'pic']), R.pick(['eOf', 'center', 'aOf', 'pic']));
    var o = R.pick(ORB), a = o[1], e = o[2];
    if (shape === 'peri' || shape === 'aph') {
      var isP = shape === 'peri', d = isP ? a * (1 - e) : a * (1 + e);
      return P(o[0][0].toUpperCase() + o[0].slice(1) + ' has an orbit with semi-major axis $a = ' + fd(a, 3) + '$ AU and eccentricity $e = ' + fd(e, 3) + '$. How far from the Sun is it at ' + (isP ? 'perihelion (closest)' : 'aphelion (farthest)') + '?', num(d, 3, 0.01),
        ['The Sun sits at a focus, a distance $ae$ from the center of the ellipse.', isP ? 'Perihelion: $a - ae = a(1 - e)$.' : 'Aphelion: $a + ae = a(1 + e)$.', '$' + fd(a, 3) + ' \\times (1 ' + (isP ? '-' : '+') + ' ' + fd(e, 3) + ') = ' + fd(d, 3) + '$ AU.'],
        'The Sun is off-center by a·e.', { unit: 'AU', vf: { k: isP ? 'peri' : 'aph', a: a, e: e } });
    }
    if (shape === 'aOf' || shape === 'eOf') {
      var q = R.pick([0.5, 0.6, 0.8, 1.0, 1.2, 1.5, 2, 3, 4, 0.3, 0.4, 0.7, 0.9, 2.5, 5, 6, 0.35, 3.5]), Q = q + R.pick([0.4, 1, 2, 3, 5, 8, 12, 20, 30, 0.2, 0.6, 1.5, 4, 6, 10, 15, 25, 40, 0.25, 0.3, 0.35, 0.5, 0.7, 0.8, 0.9, 1.2, 2.5, 3.5, 7, 9, 35]), aa = (q + Q) / 2, ee = (Q - q) / (Q + q);
      if (shape === 'aOf') return P('An asteroid comes within $' + fd(q, 2) + '$ AU of the Sun at perihelion and goes out to $' + fd(Q, 2) + '$ AU at aphelion. What is the semi-major axis of its orbit?', num(aa, 3, 0.01),
        ['Perihelion and aphelion are the two ends of the long axis, which has length $2a$.', '$2a = ' + fd(q, 2) + ' + ' + fd(Q, 2) + ' = ' + fd(q + Q, 2) + '$ AU.', '$a = ' + fd(aa, 3) + '$ AU.'], 'The long axis runs from perihelion to aphelion.', { unit: 'AU', vf: { k: 'aOf', q: q, Q: Q } });
      return P('A comet\'s perihelion distance is $' + fd(q, 2) + '$ AU and its aphelion distance is $' + fd(Q, 2) + '$ AU. What is the eccentricity of its orbit?', num(ee, 3, 0.01),
        ['$q = a(1 - e)$ and $Q = a(1 + e)$, so $Q - q = 2ae$ and $Q + q = 2a$.', 'Dividing: $e = \\frac{Q - q}{Q + q}$.', '$e = \\frac{' + fd(Q - q, 2) + '}{' + fd(Q + q, 2) + '} = ' + fd(ee, 3) + '$.'], 'Combine the two distances to cancel a.', { vf: { k: 'eOf', q: q, Q: Q } });
    }
    if (shape === 'center') {
      return P('The orbit of ' + o[0] + ' has $a = ' + fd(a, 3) + '$ AU and $e = ' + fd(e, 3) + '$. How far is the Sun from the center of the ellipse?', num(a * e, 3, 0.01),
        ['Eccentricity is the focus-to-center distance divided by $a$: $e = c/a$.', '$c = ae = ' + fd(a, 3) + ' \\times ' + fd(e, 3) + ' = ' + fd(a * e, 4) + '$ AU.'], 'Eccentricity = c ÷ a.', { unit: 'AU', vf: { k: 'center', a: a, e: e } });
    }
    if (shape === 'pic') {
      var es = R.shuffle([0.05, 0.3, 0.6, 0.85]), most = R.coin(), target = most ? 0.85 : 0.05;
      return P('The four orbits A to D go around the same kind of star. Which orbit has the ' + (most ? 'largest' : 'smallest') + ' eccentricity?', { t: 'mc', choices: ['A', 'B', 'C', 'D'], v: es.indexOf(target), keep: true },
        ['Eccentricity measures how stretched an ellipse is: $e = 0$ is a circle, and $e$ near $1$ is a long, thin ellipse.', 'It also shows in how far off-center the star sits: the focus is a distance $ae$ from the center.', 'The ' + (most ? 'most stretched orbit, with the star far off-center,' : 'roundest orbit, with the star almost at the center,') + ' is ' + 'ABCD'[es.indexOf(target)] + '.'],
        'Look at how far the star is from the middle of each ellipse.', { viz: { name: 'ph-orbit', opts: { mode: 'kepler', a: 1, interactive: false, quiet: true, hide: ['pa', 'velocity', 'foci'], t: 0.2, panel: es.map(function (x) { return { e: x }; }) } }, vf: { k: 'mc' } });
    }
    var right = 'Most are nearly circles: Earth\'s eccentricity is only $0.017$';
    return P('Which statement about the shapes of the planets\' orbits is true?', mc(right, wrongs(R, ['They are long, thin ellipses, like comets\' orbits', 'They are perfect circles with the Sun at the center', 'They are ellipses with the Sun at the center', 'Their eccentricity is about 0.5 on average'], 3)),
      ['Kepler\'s first law: orbits are ellipses with the Sun at one focus (not the center).', 'For the planets the ellipses are barely stretched. Earth: $e = 0.017$; even Mercury is only $0.21$.', 'Drawn on paper, Earth\'s orbit would look like a circle with the Sun a little off-center.'], 'Look up a few eccentricities.', { vf: { k: 'mc' } });
  });

  G('astro.kepler-second-law', function (R, ctx) {
    var shape = by(ctx, R.pick(['fast', 'fast', 'same']), R.pick(['ratio', 'vap', 'fast', 'same']), R.pick(['ratioE', 'vap', 'ratio']));
    if (shape === 'fast') {
      var slow = R.coin(), tags = { peri: 'A', apo: 'B' };
      return P('The picture shows a planet\'s orbit, with points A and B tagged. Where does the planet move ' + (slow ? 'slowest' : 'fastest') + '?', mc(slow ? 'At B, farthest from the star' : 'At A, closest to the star', [slow ? 'At A, closest to the star' : 'At B, farthest from the star', 'It moves at the same speed at A and B', 'It depends on the planet\'s mass']),
        ['Kepler\'s second law: the line from the star to the planet sweeps out equal areas in equal times.', 'Near the star the line is short, so to sweep the same area the planet must cover more distance: it moves fastest at perihelion (A).', 'Far away the line is long, so it moves slowest at aphelion (B).'],
        'Equal areas: a short line has to sweep faster.', { viz: { name: 'ph-orbit', opts: { mode: 'areas', e: 0.6, a: 1, interactive: false, quiet: true, hide: ['velocity', 'pa'], t: 0.15, tags: tags } }, vf: { k: 'mc' } });
    }
    if (shape === 'same') {
      var days = R.pick([10, 15, 20, 30, 45, 60, 5, 7, 12, 25, 40, 50, 90, 6, 8, 9, 35, 70, 80]);
      return P('Near perihelion, a comet takes $' + days + '$ days to sweep out a certain area (the triangle-like region between the Sun and its path). Far out, near aphelion, how many days does it take to sweep out an area of the same size?', exact(days),
        ['Kepler\'s second law: equal areas in equal times, anywhere on the orbit.', 'So the same area takes the same time: $' + days + '$ days.', 'Near aphelion that area is a long, thin wedge, so the comet covers much less of its path in those ' + days + ' days.'],
        'Equal areas, equal times.', { unit: 'days', vf: { k: 'same', d: days } });
    }
    if (shape === 'ratio' || shape === 'ratioE') {
      var o = R.pick(ORB.filter(function (x) { return x[2] > 0.04; }));
      if (shape === 'ratioE') {
        var r1 = (1 + o[2]) / (1 - o[2]);
        return P('The orbit of ' + o[0] + ' has eccentricity $e = ' + fd(o[2], 3) + '$. How many times faster does it move at perihelion than at aphelion? (At those two points the speed times the distance is the same.)', num(r1, 3, 0.01),
          ['At perihelion and aphelion the motion is sideways to the Sun, so equal areas means $v_p\\, r_p = v_a\\, r_a$.', '$\\frac{v_p}{v_a} = \\frac{r_a}{r_p} = \\frac{a(1 + e)}{a(1 - e)} = \\frac{1 + e}{1 - e}$.', '$\\frac{1 + ' + fd(o[2], 3) + '}{1 - ' + fd(o[2], 3) + '} = ' + fd(r1, 3) + '$.'],
          'Write both distances with a and e.', { vf: { k: 'ratioE', e: o[2] } });
      }
      var q = R.pick([0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 0.2, 0.7, 0.9, 1.2, 1.5, 2.0, 0.25, 0.35]), Q = q * R.pick([1.5, 2, 2.5, 3, 4, 5, 10, 1.2, 3.5, 6, 8, 20, 7, 9, 12, 15]);
      return P('A small body is $' + fd(q, 2) + '$ AU from the Sun at perihelion and $' + fd(Q, 2) + '$ AU at aphelion. How many times faster does it move at perihelion than at aphelion?', num(Q / q, 3, 0.01),
        ['At the ends of the orbit, equal areas in equal times gives $v_p\\, r_p = v_a\\, r_a$.', '$\\frac{v_p}{v_a} = \\frac{r_a}{r_p} = \\frac{' + fd(Q, 2) + '}{' + fd(q, 2) + '} = ' + fd(Q / q, 3) + '$.'],
        'Speed times distance is the same at both ends.', { vf: { k: 'ratio', q: q, Q: Q } });
    }
    var rp = R.pick([0.5, 0.6, 0.8, 1.0, 1.2, 0.3, 0.4, 0.7, 0.9, 1.5, 2.0, 0.35]), ra2 = rp * R.pick([1.5, 2, 3, 4, 6, 1.2, 2.5, 5, 8, 10, 3.5, 7, 9]), vp = R.pick([30, 36, 40, 45, 50, 60, 20, 24, 25, 32, 35, 48, 54, 70]), va = vp * rp / ra2;
    return P('A comet moves at $' + vp + '$ km/s at perihelion, $' + fd(rp, 2) + '$ AU from the Sun. Its aphelion is $' + fd(ra2, 2) + '$ AU from the Sun. How fast is it moving at aphelion?', num(va, 3, 0.01),
      ['At perihelion and aphelion, Kepler\'s second law gives $v_p\\, r_p = v_a\\, r_a$.', '$v_a = v_p \\cdot \\frac{r_p}{r_a} = ' + vp + ' \\times \\frac{' + fd(rp, 2) + '}{' + fd(ra2, 2) + '}$.', '$v_a = ' + fd(va, 3) + '$ km/s: slower, because it is farther out.'],
      'Speed times distance stays the same.', { unit: 'km/s', vf: { k: 'vap', vp: vp, rp: rp, ra: ra2 } });
  });

  G('astro.kepler-third-law', function (R, ctx) {
    var shape = by(ctx, R.pick(['pFromA', 'aFromP']), R.pick(['pDec', 'aDec', 'ratio', 'mc']), R.pick(['days', 'aDec', 'ratio', 'pDec']));
    if (shape === 'pFromA') { var a = R.pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 1.44, 2.25, 6.25, 12.25, 169, 196, 225, 256, 400]), pp = M.pow(a, 1.5);
      return P('An asteroid orbits the Sun with semi-major axis $' + a + '$ AU. What is its orbital period in years?', exact(pp),
        ['Kepler\'s third law with $P$ in years and $a$ in AU: $P^2 = a^3$.', '$P^2 = ' + a + '^3 = ' + T.commas(a * a * a) + '$.', '$P = \\sqrt{' + T.commas(a * a * a) + '} = ' + pp + '$ years. (Or $P = a^{3/2} = (\\sqrt{' + a + '})^3 = ' + M.sqrt(a) + '^3$.)'],
        'P² = a³; a perfect square makes the root easy.', { unit: 'yr', vf: { k: 'p', a: a } }); }
    if (shape === 'aFromP') { var b = R.int(2, 20), P0 = b * b * b, aa = b * b;
      return P('A distant object takes $' + P0 + '$ years to orbit the Sun. What is the semi-major axis of its orbit, in AU?', exact(aa),
        ['$P^2 = a^3$, so $a = P^{2/3} = \\left(\\sqrt[3]{P}\\right)^2$.', '$\\sqrt[3]{' + P0 + '} = ' + b + '$.', '$a = ' + b + '^2 = ' + aa + '$ AU.'],
        'Take the cube root first.', { unit: 'AU', vf: { k: 'a', p: P0 } }); }
    if (shape === 'pDec') { var o = R.chance(0.4) ? R.pick([['Jupiter', 5.20], ['Saturn', 9.54], ['Ceres', 2.77], ['Mars', 1.52], ['Uranus', 19.2], ['Neptune', 30.1], ['Pluto', 39.5]]) : [R.pick(['An asteroid', 'A Kuiper belt object', 'A main-belt asteroid', 'A newly found comet']), R.pick([R.real(1.6, 4.5, 2), R.real(30, 60, 1), R.real(5, 25, 1)])], p2 = M.pow(o[1], 1.5);
      return P(o[0] + ' orbits the Sun with semi-major axis $' + fd(o[1], 2) + '$ AU. Use Kepler\'s third law to find its period in years.', num(p2, 3, 0.01),
        ['$P^2 = a^3 = ' + fd(o[1], 2) + '^3 = ' + fd(M.pow(o[1], 3), 1) + '$.', '$P = \\sqrt{' + fd(M.pow(o[1], 3), 1) + '} = ' + fd(p2, 3) + '$ years.'],
        'Cube a, then take the square root.', { unit: 'yr', vf: { k: 'p', a: o[1] } }); }
    if (shape === 'aDec') { var c = R.chance(0.4) ? R.pick([['Halley\'s Comet', 76], ['Comet Encke', 3.3], ['Comet Swift–Tuttle', 133], ['Comet Tempel–Tuttle', 33]]) : [R.pick(['An asteroid', 'A comet', 'A trans-Neptunian object']), R.pick([R.real(2, 9, 1), R.real(10, 300, 0)])], a3 = M.pow(c[1], 2 / 3);
      return P(c[0] + ' orbits the Sun once every $' + fd(c[1], 1) + '$ years. What is the semi-major axis of its orbit?', num(a3, 3, 0.01),
        ['$a^3 = P^2 = ' + fd(c[1], 1) + '^2 = ' + fd(c[1] * c[1], 2) + '$.', '$a = \\sqrt[3]{' + fd(c[1] * c[1], 2) + '} = ' + fd(a3, 3) + '$ AU.'],
        'Square P, then take the cube root.', { unit: 'AU', vf: { k: 'a', p: c[1] } }); }
    if (shape === 'ratio') { var k = R.pick([1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 1.2, 3.5, 7, 9, 12, 16, 20, 15]), r = M.pow(k, 1.5);
      return P('Planet B orbits a star $' + k + '$ times as far out as planet A does. How many times longer is planet B\'s year?', num(r, 3, 0.01),
        ['Kepler\'s third law: $P^2 \\propto a^3$, so $P \\propto a^{3/2}$.', '$\\frac{P_B}{P_A} = ' + k + '^{3/2} = ' + k + '\\sqrt{' + k + '} = ' + fd(r, 3) + '$.', 'More than ' + k + ' times: the farther planet has a longer path <em>and</em> moves more slowly.'],
        'Raise the distance ratio to the 3/2 power.', { vf: { k: 'ratio', k2: k } }); }
    if (shape === 'days') { var pl = R.pick([['Mercury', 88.0], ['Venus', 224.7], ['Mars', 687], ['Jupiter', 4333], ['Saturn', 10759], ['the dwarf planet Ceres', 1680]]), py = pl[1] / 365.25, ad = M.pow(py, 2 / 3);
      return P(pl[0] + ' orbits the Sun in $' + fd(pl[1], 1) + '$ days. How far from the Sun is it on average (its semi-major axis, in AU)? A year is $365.25$ days.', num(ad, 3, 0.01),
        ['Kepler\'s form needs years: $P = ' + fd(pl[1], 1) + ' \\div 365.25 = ' + fd(py, 4) + '$ yr.', '$a^3 = P^2 = ' + fd(py * py, 4) + '$.', '$a = \\sqrt[3]{' + fd(py * py, 4) + '} = ' + fd(ad, 3) + '$ AU.'],
        'Convert days to years first.', { unit: 'AU', vf: { k: 'a', p: py } }); }
    var right = 'About $2.8$ times as long, because it has a longer path and also moves more slowly';
    return P('A planet orbits twice as far from its star as Earth does from the Sun (same star mass). How long is its year compared with Earth\'s?', mc(right, ['Exactly twice as long, because its path is twice as long', 'The same, because the star is the same', 'Half as long, because gravity is weaker out there', '4 times as long, because gravity falls off as the square of distance']),
      ['$P^2 = a^3$: $P = 2^{3/2} = 2\\sqrt{2} \\approx 2.83$ years.', 'The path is twice as long, and weaker gravity out there means a slower orbit: both stretch the year.'], 'Use P² = a³ with a = 2.', { vf: { k: 'mc' } });
  });

  G('astro.weighing-with-orbits', function (R, ctx) {
    var shape = by(ctx, R.pick(['solar', 'solar', 'mc']), R.pick(['solar', 'si', 'period', 'mc']), R.pick(['si', 'period', 'solar']));
    if (shape === 'solar') {
      var c = R.chance(0.5) ? R.pick([[1, 0.5], [2, 2], [3, 3], [4, 4], [4, 8], [2, 4], [0.5, 0.25], [1, 2], [4, 16], [9, 27], [2, 1], [6, 6], [0.25, 0.25], [5, 5], [3, 1]]) : (function () { var a0 = R.pick([0.4, 0.6, 0.8, 1.2, 1.5, 2.5, 3.5, 5, 7]), m0 = R.pick([0.3, 0.6, 0.8, 1.2, 1.5, 2.5, 3.5]); return [a0, rnd(M.sqrt(a0 * a0 * a0 / m0), 3)]; })(), Ms = c[0] * c[0] * c[0] / (c[1] * c[1]);
      return P('A planet orbits a distant star with semi-major axis $' + fd(c[0], 2) + '$ AU and period $' + fd(c[1], 2) + '$ years. What is the star\'s mass, in solar masses? (The planet\'s mass is tiny.)', num(Ms, 3, 0.01),
        ['Newton\'s form of Kepler\'s third law in solar units: $M = \\frac{a^3}{P^2}$ ($M$ in solar masses, $a$ in AU, $P$ in years).', '$M = \\frac{' + fd(c[0], 2) + '^3}{' + fd(c[1], 2) + '^2} = \\frac{' + fd(c[0] * c[0] * c[0], 4) + '}{' + fd(c[1] * c[1], 4) + '}$.', '$M = ' + fd(Ms, 3) + '$ solar masses.'],
        'Check: Earth (1 AU, 1 yr) gives 1 solar mass.', { unit: 'M☉', vf: { k: 'solar', a: c[0], p: c[1] } });
    }
    if (shape === 'si') {
      var m = R.pick([['Jupiter', 'Io', 4.22e8, 1.769, 'days'], ['Earth', 'the Moon', 3.84e8, 27.32, 'days'], ['Saturn', 'Titan', 1.222e9, 15.95, 'days'], ['Mars', 'Phobos', 9.38e6, 7.66, 'hours'], ['the Sun', 'Earth', 1.496e11, 365.25, 'days'], ['Uranus', 'Titania', 4.36e8, 8.71, 'days']]);
      var Ps = m[3] * (m[4] === 'days' ? 86400 : 3600), Mk = 4 * M.PI * M.PI * M.pow(m[2], 3) / (GN * Ps * Ps);
      return P(m[1] + ' orbits ' + m[0] + ' at an average distance of $' + fx(m[2], 3) + '$ m, once every $' + fd(m[3], 3) + '$ ' + m[4] + '. Use $M = \\dfrac{4\\pi^2 a^3}{G P^2}$ with $G = 6.674 \\times 10^{-11}\\,\\text{N·m}^2/\\text{kg}^2$ to find the mass of ' + m[0] + '.', num(Mk, 3, 0.02),
        ['Convert the period to seconds: $P = ' + fd(m[3], 3) + ' \\times ' + (m[4] === 'days' ? '86{,}400' : '3600') + ' = ' + fx(Ps, 4) + '$ s.', '$a^3 = (' + fx(m[2], 3) + ')^3 = ' + fx(M.pow(m[2], 3), 3) + '\\,\\text{m}^3$.', '$M = \\frac{4\\pi^2 \\times ' + fx(M.pow(m[2], 3), 3) + '}{6.674 \\times 10^{-11} \\times (' + fx(Ps, 4) + ')^2} = ' + fx(Mk, 3) + '$ kg.'],
        'Put the period in seconds before you use G.', { unit: 'kg', vf: { k: 'si', a: m[2], P: Ps } });
    }
    if (shape === 'period') {
      var Ms2 = R.pick([0.5, 2, 4, 9, 0.25, 0.8, 1.5, 3, 0.3, 0.6, 1.2, 2.5, 6, 16]), a2 = R.pick([1, 2, 4, 0.5, 0.3, 1.5, 3, 6, 0.1, 0.2, 0.8, 2.5, 5, 8, 10]), P2 = M.sqrt(a2 * a2 * a2 / Ms2);
      return P('A planet orbits a star of $' + fd(Ms2, 2) + '$ solar masses at $' + fd(a2, 2) + '$ AU. What is its orbital period in years?', num(P2, 3, 0.01),
        ['$M = \\frac{a^3}{P^2}$, so $P = \\sqrt{\\frac{a^3}{M}}$.', '$P = \\sqrt{\\frac{' + fd(a2 * a2 * a2, 3) + '}{' + fd(Ms2, 2) + '}} = ' + fd(P2, 3) + '$ years.', Ms2 > 1 ? 'A heavier star pulls harder, so the planet orbits faster than it would around the Sun.' : 'A lighter star pulls more weakly, so the year is longer than it would be around the Sun.'],
        'Solve M = a³/P² for P.', { unit: 'yr', vf: { k: 'period', M: Ms2, a: a2 } });
    }
    var right = 'They would have the same period: a small satellite\'s own mass barely matters';
    return P('A $1000$ kg satellite and a $1$ kg bolt orbit Earth side by side at the same distance. How do their orbital periods compare?', mc(right, ['The satellite has a shorter period, because gravity pulls harder on it', 'The bolt has a shorter period, because it is lighter', 'The satellite has a longer period, because it has more inertia', 'Only the satellite can orbit; the bolt would fall']),
      ['Gravity on each is proportional to its mass, and so is its inertia, so the two cancel: every object at that distance gets the same acceleration.', 'That is why Kepler\'s third law, $M = a^3/P^2$, measures the mass of the central body, not the orbiting one (strictly, it gives the sum of both masses, and the small one hardly adds anything).'],
      'Compare the pull with the inertia.', { vf: { k: 'mc' } });
  });

  G('astro.orbits-escape', function (R, ctx) {
    var shape = by(ctx, R.pick(['esc', 'esc', 'mc']), R.pick(['vc', 'escS', 'esc', 'mc']), R.pick(['period', 'vc', 'escS']));
    var B = [['Earth', 3.986e14, 6371], ['Mars', 4.283e13, 3390], ['the Moon', 4.905e12, 1737], ['Jupiter', 1.267e17, 69911], ['Venus', 3.249e14, 6052]];
    if (shape === 'esc') {
      var vc = R.pick([1.68, 3.55, 7.91, 7.33, 42.1, 0.4, 2.1, 5.2, 7.7, 3.07, 1.5, 2.5, 3.9, 4.6, 6.0, 7.1, 7.5, 10.2, 13.1, 17.3, 25.1, 29.8]);
      return P('A spacecraft is in a circular orbit moving at $' + fd(vc, 3) + '$ km/s. What speed would it need, at that same distance, to escape the planet\'s gravity completely?', num(vc * M.SQRT2, 3, 0.01),
        ['Circular speed $v_c = \\sqrt{GM/r}$; escape speed $v_{\\text{esc}} = \\sqrt{2GM/r}$.', 'So $v_{\\text{esc}} = \\sqrt{2}\\,v_c$.', '$1.414 \\times ' + fd(vc, 3) + ' = ' + fd(vc * M.SQRT2, 3) + '$ km/s.'],
        'Escape speed is √2 times the circular speed.', { unit: 'km/s', vf: { k: 'esc', vc: vc } });
    }
    if (shape === 'vc' || shape === 'period') {
      var b = R.pick(B), h = b[0] === 'Earth' ? R.pick([200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 5000, 10000, 20200, 35786, 250, 700, 900, 1200, 3000, 4000, 6000, 7000, 9000, 15000, 20000, 25000, 35000]) : R.pick([50, 100, 150, 200, 300, 400, 500, 750, 1000, 2000, 60, 70, 90, 120, 250, 600, 700, 800, 1200, 1500]), r = (b[2] + h) * 1000, v = M.sqrt(b[1] / r);
      if (shape === 'period') {
        var Tm = 2 * M.PI * r / v / 60;
        return P('A satellite circles ' + b[0] + ' $' + T.commas(h) + '$ km above the surface. ' + b[0][0].toUpperCase() + b[0].slice(1) + '\'s radius is $' + T.commas(b[2]) + '$ km and $GM = ' + fx(b[1], 4) + '\\,\\text{m}^3/\\text{s}^2$. How many minutes does one orbit take?', num(Tm, 3, 0.02),
          ['Orbit radius $r = ' + T.commas(b[2]) + ' + ' + T.commas(h) + ' = ' + T.commas(b[2] + h) + '$ km $= ' + fx(r, 4) + '$ m.', '$v = \\sqrt{GM/r} = \\sqrt{\\frac{' + fx(b[1], 4) + '}{' + fx(r, 4) + '}} = ' + fx(v, 4) + '$ m/s.', 'Period $= \\frac{2\\pi r}{v} = \\frac{2\\pi \\times ' + fx(r, 4) + '}{' + fx(v, 4) + '} = ' + fx(Tm * 60, 4) + '$ s $= ' + fx(Tm, 3) + '$ min.'],
          'Find the speed first, then distance ÷ speed.', { unit: 'min', vf: { k: 'period', GM: b[1], r: r } });
      }
      return P('What speed does a satellite need for a circular orbit $' + T.commas(h) + '$ km above ' + b[0] + '? The radius of ' + b[0] + ' is $' + T.commas(b[2]) + '$ km and $GM = ' + fx(b[1], 4) + '\\,\\text{m}^3/\\text{s}^2$. Give the answer in km/s.', num(v / 1000, 3, 0.02),
        ['Gravity supplies the centripetal force: $\\frac{GMm}{r^2} = \\frac{mv^2}{r}$, so $v = \\sqrt{GM/r}$.', '$r = ' + T.commas(b[2] + h) + '$ km $= ' + fx(r, 4) + '$ m (measured from the center).', '$v = \\sqrt{\\frac{' + fx(b[1], 4) + '}{' + fx(r, 4) + '}} = ' + fx(v, 4) + '$ m/s $= ' + fd(v / 1000, 2) + '$ km/s.'],
        'Measure r from the planet\'s center.', { unit: 'km/s', vf: { k: 'vc', GM: b[1], r: r } });
    }
    if (shape === 'escS') {
      var b2 = R.pick(B), r2 = b2[2] * 1000, ve = M.sqrt(2 * b2[1] / r2);
      return P('Find the escape speed from the surface of ' + b2[0] + ', in km/s. Its radius is $' + T.commas(b2[2]) + '$ km and $GM = ' + fx(b2[1], 4) + '\\,\\text{m}^3/\\text{s}^2$.', num(ve / 1000, 3, 0.02),
        ['To escape, kinetic energy must at least cancel the (negative) gravitational energy: $\\frac{1}{2}mv^2 = \\frac{GMm}{r}$.', 'So $v_{\\text{esc}} = \\sqrt{\\frac{2GM}{r}} = \\sqrt{\\frac{2 \\times ' + fx(b2[1], 4) + '}{' + fx(r2, 4) + '}}$.', '$v_{\\text{esc}} = ' + fx(ve, 4) + '$ m/s $= ' + fd(ve / 1000, 2) + '$ km/s.'],
        'Set kinetic energy equal to GMm/r.', { unit: 'km/s', vf: { k: 'escS', GM: b2[1], r: r2 } });
    }
    var right = 'No engine is needed: the craft is falling toward Earth the whole time, but moving sideways fast enough to keep missing it';
    return P('Why doesn\'t the International Space Station need to keep its engines on to stay in orbit?', mc(right, wrongs(R, ['There is no gravity at its height, so it just floats', 'Its engines do run all the time, very quietly', 'The air at that height holds it up like a balloon', 'It is pulled up by the Moon as much as it is pulled down by Earth', 'It is held in place by Earth\'s magnetic field'], 3)),
      ['At $400$ km up, gravity is still about 90% as strong as on the ground.', 'An orbit is a fall: gravity bends the path toward Earth, and at about $7.7$ km/s sideways the ground curves away as fast as the station falls.', 'No push is needed to keep moving (Newton\'s first law). The station fires its thrusters only now and then, to make up for the slight drag of the thin air.'],
      'What would happen to a ball thrown sideways very, very fast?', { vf: { k: 'mc' } });
  });

  G('astro.tides', function (R, ctx) {
    var shape = by(ctx, R.pick(['phase', 'phase', 'mc']), R.pick(['range', 'days', 'phase', 'pic']), R.pick(['sunmoon', 'perigee', 'range', 'days']));
    if (shape === 'phase') {
      var ph = R.pick([['new moon', 'spring'], ['full moon', 'spring'], ['first quarter', 'neap'], ['third quarter', 'neap']]);
      return P('What kind of tides come at ' + ph[0] + '?', mc(ph[1] === 'spring' ? 'Spring tides: the biggest range between high and low tide' : 'Neap tides: the smallest range between high and low tide', ph[1] === 'spring' ? ['Neap tides: the smallest range between high and low tide', 'No tides at all, because the Sun and Moon cancel', 'Spring tides, but only if it is spring'] : ['Spring tides: the biggest range between high and low tide', 'No tides at all, because the Sun and Moon cancel', 'The highest tides of the year, because the Sun and Moon are lined up']),
        [ph[1] === 'spring' ? 'At ' + ph[0] + ' the Sun, Earth and Moon are in a line.' : 'At ' + ph[0] + ' the Sun and Moon are $90^\\circ$ apart as seen from Earth.', ph[1] === 'spring' ? 'The Sun\'s tidal bulges line up with the Moon\'s and add: higher highs and lower lows.' : 'The Sun\'s bulges sit at right angles to the Moon\'s and partly cancel them: a small range.', 'Spring and neap tides each come twice a month, all year round.'],
        'Are the Sun and Moon lined up or at right angles?', { vf: { k: 'mc' } });
    }
    if (shape === 'pic') {
      var spring = R.coin(), ages = spring ? [0, 14.8] : [7.4, 22.1];
      return P('The picture shows the Moon\'s position around Earth, with sunlight from the left. Which kind of tide is happening?', mc(spring ? 'A spring tide' : 'A neap tide', [spring ? 'A neap tide' : 'A spring tide', 'No tide', 'The tide is the same all month']),
        ['Look at where the Moon is compared with the Sun.', spring ? 'The Moon is in line with the Sun and Earth, so the two tides add: a spring tide.' : 'The Moon is at right angles to the Sun–Earth line, so the Sun\'s tide partly cancels the Moon\'s: a neap tide.'],
        'Lined up, or at right angles?', { viz: { name: 'astro-springneap', opts: { age: R.pick(ages), interactive: false, quiet: true } }, vf: { k: 'mc' } });
    }
    if (shape === 'range') {
      var am = R.pick([0.8, 1.0, 1.2, 1.5, 2.0, 2.4, 3.0, 0.5, 0.6, 0.9, 1.1, 1.3, 1.6, 1.8, 2.2, 2.6, 3.5, 4.0, 5.0, 0.7, 2.5]), as = fix(am * 0.46), spr = R.coin(), v = spr ? am + as : am - as;
      return P('On one coast the Moon alone would raise a tidal range of $' + fd(am, 2) + '$ m, and the Sun alone $' + fd(as, 3) + '$ m. What is the tidal range at ' + (spr ? 'spring' : 'neap') + ' tide?', num(v, 3, 0.01),
        [spr ? 'At spring tide (new or full moon) the two tides line up and add.' : 'At neap tide (quarter moons) the Sun\'s bulges sit between the Moon\'s and partly cancel them.', spr ? '$' + fd(am, 2) + ' + ' + fd(as, 3) + ' = ' + fd(v, 3) + '$ m.' : '$' + fd(am, 2) + ' - ' + fd(as, 3) + ' = ' + fd(v, 3) + '$ m.'],
        spr ? 'Lined up: add.' : 'At right angles: subtract.', { unit: 'm', vf: { k: spr ? 'spring' : 'neap', am: am, as: as } });
    }
    if (shape === 'days') {
      var which = R.pick(['spring', 'neap', 'sn']), d = which === 'sn' ? 29.53 / 4 : 29.53 / 2;
      return P(which === 'sn' ? 'About how many days pass from a spring tide to the next neap tide? (The phases repeat every $29.53$ days.)' : 'About how many days pass from one ' + which + ' tide to the next? (The phases repeat every $29.53$ days.)', num(d, 3, 0.02),
        [which === 'sn' ? 'Spring tides come at new and full moon; neap tides at the quarters, a quarter of the cycle later.' : (which === 'spring' ? 'Spring tides come at both new moon and full moon.' : 'Neap tides come at both first and third quarter.'), which === 'sn' ? '$29.53 \\div 4 \\approx 7.4$ days.' : 'That is twice per cycle: $29.53 \\div 2 \\approx 14.8$ days.'],
        'How many times per lunar cycle does it happen?', { unit: 'days', vf: { k: which, d: 29.53 } });
    }
    if (shape === 'sunmoon') {
      return P('Tidal stretching is proportional to $\\dfrac{M}{d^3}$. The Sun has mass $1.989 \\times 10^{30}$ kg at $1.496 \\times 10^{8}$ km; the Moon $7.35 \\times 10^{22}$ kg at $3.84 \\times 10^{5}$ km. How strong is the Sun\'s tidal effect on Earth, as a fraction of the Moon\'s?', num((1.989e30 / M.pow(1.496e8, 3)) / (7.35e22 / M.pow(3.84e5, 3)), 3, 0.03),
        ['Ratio $= \\frac{M_\\odot}{M_{\\text{Moon}}} \\times \\left(\\frac{d_{\\text{Moon}}}{d_\\odot}\\right)^3$.', 'Mass ratio: $\\frac{1.989 \\times 10^{30}}{7.35 \\times 10^{22}} = 2.71 \\times 10^{7}$. Distance ratio: $\\frac{3.84 \\times 10^5}{1.496 \\times 10^8} = 2.57 \\times 10^{-3}$, cubed $= 1.69 \\times 10^{-8}$.', 'Product $\\approx 0.46$: the Sun\'s tides are a little under half as strong as the Moon\'s.'],
        'Tides depend on the difference in pull across Earth, which falls off as 1/d³.', { vf: { k: 'sunmoon' } });
    }
    if (shape === 'perigee') {
      var dp = R.pick([357000, 360000, 363000, 356500, 358000, 361000, 362000, 364000, 365000]), da = R.pick([405000, 406000, 404000, 404500, 405500, 406500]), rr = M.pow(da / dp, 3);
      return P('The Moon\'s tidal effect goes as $1/d^3$. How many times stronger is it at perigee ($' + T.commas(dp) + '$ km) than at apogee ($' + T.commas(da) + '$ km)?', num(rr, 3, 0.01),
        ['Ratio $= \\left(\\frac{d_{\\text{apogee}}}{d_{\\text{perigee}}}\\right)^3 = \\left(\\frac{' + T.commas(da) + '}{' + T.commas(dp) + '}\\right)^3$.', '$' + fd(da / dp, 4) + '^3 = ' + fd(rr, 3) + '$.', 'When a perigee falls near new or full moon, spring tides are unusually large.'],
        'Cube the distance ratio.', { vf: { k: 'perigee', dp: dp, da: da } });
    }
    var right = 'Spring tides come twice a month, at new and full moon, in every season';
    return P('Which statement about spring tides is true?', mc(right, wrongs(R, ['Spring tides happen only in the spring', 'Spring tides happen at the quarter moons', 'Spring tides happen once a year, when Earth is closest to the Sun', 'Spring tides are caused by melting snow raising the sea'], 3)),
      ['"Spring" here means springing up, not the season.', 'They happen whenever the Sun, Earth and Moon line up: at new moon and at full moon, about every two weeks.'], 'Think about when the Sun and Moon line up.', { vf: { k: 'mc' } });
  });

// ---- 03_light.js

  // =====================================================================================================
  // Unit 3: Light and Telescopes
  G('astro.light-travel-time', function (R, ctx) {
    var shape = by(ctx, R.pick(['ly', 'sun', 'planet']), R.pick(['planet', 'lykm', 'probe', 'ly', 'mc']), R.pick(['probe', 'rover', 'lykm', 'planet']));
    if (shape === 'ly') {
      var s = R.chance(0.5) ? R.pick([['Sirius', 8.6], ['Vega', 25], ['Arcturus', 37], ['Betelgeuse', 550], ['Rigel', 860], ['Proxima Centauri', 4.2], ['Polaris', 430], ['the Pleiades cluster', 440], ['the Andromeda Galaxy', 2500000]]) : [R.pick(['A star', 'A red giant', 'A star cluster', 'A nebula']), R.pick([R.int(6, 99), 10 * R.int(10, 99), 100 * R.int(10, 60)])];
      var nm = s[0].replace(/^A /, 'the ');
      return P(s[0] + ' is about ' + tx(s[1]) + ' light-years away. How many years ago did the light we see from it tonight leave it?', num(s[1], 3, 0.01),
        ['A light-year is the distance light travels in one year.', 'Light from ' + tx(s[1]) + ' light-years away has been traveling for ' + tx(s[1]) + ' years.', 'We see ' + nm + ' as it was then, not as it is now.'], 'A light-year is a distance, set by a time.', { unit: 'yr', vf: { k: 'ly', d: s[1] } });
    }
    if (shape === 'sun' || shape === 'planet') {
      var b = shape === 'sun' ? ['the Sun', 1.496e8] : R.chance(0.4) ? R.pick([['Mars at its closest', 5.6e7], ['Mars at its farthest', 4.0e8], ['Venus at its closest', 4.1e7], ['the Moon', 3.84e5]]) : R.pick([['Mars', R.int(6, 39) * 1e7], ['Jupiter', R.int(59, 96) * 1e7], ['Saturn', R.int(120, 165) * 1e7], ['Venus', R.int(5, 25) * 1e7], ['Neptune', R.int(430, 465) * 1e7], ['Uranus', R.int(260, 315) * 1e7]]);
      var t = b[1] / CKM, inMin = t >= 60, tv = inMin ? t / 60 : t;
      return P('Light travels at $3.00 \\times 10^{5}$ km/s. How long does light take to reach us from ' + b[0] + ', $' + fx(b[1], 3) + '$ km away? Give the answer in ' + (inMin ? 'minutes' : 'seconds') + '.', num(tv, 3, 0.02),
        ['Time $= \\frac{\\text{distance}}{\\text{speed}} = \\frac{' + fx(b[1], 3) + '\\text{ km}}{3.00 \\times 10^{5}\\text{ km/s}} = ' + fx(t, 3) + '$ s.', inMin ? 'In minutes: $' + fx(t, 3) + ' \\div 60 = ' + fx(tv, 3) + '$ min.' : 'So we see it as it was about $' + fx(t, 2) + '$ s ago.'],
        'Distance ÷ speed.', { unit: inMin ? 'min' : 's', vf: { k: inMin ? 'tmin' : 'ts', d: b[1] } });
    }
    if (shape === 'lykm') {
      var yrs = R.pick([1, 4.2, 8.6, 10, 25, 100, 2, 3, 5, 6, 11.4, 16.7, 20, 37, 50, 65, 200, 300, 1000]);
      return P('Light travels $3.00 \\times 10^{5}$ km every second, and a year has $3.156 \\times 10^{7}$ s. How many kilometers is ' + (yrs === 1 ? 'one light-year' : tx(yrs) + ' light-years') + '?', num(yrs * CKM * YR, 3, 0.02),
        ['One light-year: $3.00 \\times 10^{5} \\times 3.156 \\times 10^{7} = 9.47 \\times 10^{12}$ km.', yrs === 1 ? 'About 9.5 trillion km.' : 'Times ' + tx(yrs) + ': $' + fx(yrs * CKM * YR, 3) + '$ km.'],
        'Speed × time.', { unit: 'km', vf: { k: 'lykm', y: yrs } });
    }
    if (shape === 'probe') {
      var dk = R.pick([1.5e10, 2.0e10, 2.4e10, 1.2e10, 3.0e10, 1.0e10, 1.8e10, 2.2e10, 2.7e10, 3.6e10, 4.5e10]), th = dk / CKM / 3600;
      return P('A space probe is $' + fx(dk, 2) + '$ km from Earth. How many hours does a radio command (which travels at the speed of light, $3.00 \\times 10^{5}$ km/s) take to reach it?', num(th, 3, 0.02),
        ['Radio waves are light, so they move at $3.00 \\times 10^{5}$ km/s.', 'Time $= \\frac{' + fx(dk, 2) + '}{3.00 \\times 10^{5}} = ' + fx(dk / CKM, 3) + '$ s.', 'In hours: $\\div 3600 = ' + fd(th, 1) + '$ h.'],
        'Find seconds, then convert.', { unit: 'h', vf: { k: 'probe', d: dk } });
    }
    if (shape === 'rover') {
      var dm = R.pick([7.8e7, 1.5e8, 2.25e8, 3.0e8, 3.75e8, 6.0e7, 9.0e7, 1.2e8, 1.8e8, 2.0e8, 2.5e8, 3.3e8, 4.0e8]), rt = 2 * dm / CKM / 60;
      return P('A rover on Mars is $' + fx(dm, 3) + '$ km from Earth. A driver sends a command and waits for the rover\'s reply. How many minutes at least pass between sending and receiving? (Light speed: $3.00 \\times 10^{5}$ km/s.)', num(rt, 3, 0.02),
        ['The signal goes there and back: $2 \\times ' + fx(dm, 3) + ' = ' + fx(2 * dm, 3) + '$ km.', 'Time $= \\frac{' + fx(2 * dm, 3) + '}{3.00 \\times 10^{5}} = ' + fx(2 * dm / CKM, 3) + '$ s $= ' + fd(rt, 1) + '$ min.', 'That is why rovers drive themselves between commands.'],
        'Round trip: double the distance.', { unit: 'min', vf: { k: 'rover', d: dm } });
    }
    var right = 'We see it as it was when the light left, about ' + R.pick(['640', '550']) + ' years ago; it may have changed since';
    return P('Betelgeuse is a few hundred light-years away. Which statement about the Betelgeuse we see tonight is true?', mc(right, wrongs(R, ['We see it exactly as it is right now', 'We see it as it was one year ago, since that is what a light-year means', 'Light from stars arrives instantly, so distance does not matter', 'We see its future, because light travels faster than time'], 3)),
      ['Light takes time to cross space: one year for each light-year.', 'So the light reaching us left Betelgeuse centuries ago (distance estimates range from about 500 to 700 light-years).', 'If it exploded today, we would not see it for centuries.'], 'How long has the light been traveling?', { vf: { k: 'mc' } });
  });

  G('astro.color-temperature', function (R, ctx) {
    var shape = by(ctx, R.pick(['lam', 'lam', 'mc']), R.pick(['T', 'lam', 'celsius', 'mc']), R.pick(['ratio', 'T', 'celsius', 'micron']));
    if (shape === 'lam') {
      var o = R.chance(0.5) ? R.pick([['a red star', 3000], ['an orange star', 4000], ['the Sun', 5800], ['a white star', 7250], ['a blue-white star', 14500], ['a hot blue star', 29000]]) : ['a star', 100 * R.int(25, 300)], lam = WIEN / o[1];
      return P('At what wavelength does ' + o[0] + ' with a surface temperature of $' + T.commas(o[1]) + '$ K give off the most light? Use $\\lambda_{\\text{peak}} = \\dfrac{2.90 \\times 10^{6}\\ \\text{nm·K}}{T}$.', num(lam, 3, 0.02),
        ['Wien\'s law: the peak wavelength is inversely proportional to temperature.', '$\\lambda_{\\text{peak}} = \\frac{2.90 \\times 10^{6}}{' + T.commas(o[1]) + '} = ' + fx(lam, 3) + '$ nm.', lam < 400 ? 'That is ultraviolet: the star looks blue-white to us.' : lam > 700 ? 'That is infrared: in visible light the star looks red.' : 'That is in the visible range (about 400 to 700 nm).'],
        'Divide Wien\'s constant by the temperature.', { unit: 'nm', vf: { k: 'lam', T: o[1] } });
    }
    if (shape === 'T') {
      var l2 = R.chance(0.5) ? R.pick([290, 350, 414, 483, 500, 580, 725, 966, 1160, 145, 200]) : 10 * R.int(12, 110), T2 = WIEN / l2;
      return P('A star\'s spectrum peaks at $' + l2 + '$ nm. What is its surface temperature? Use $\\lambda_{\\text{peak}} T = 2.90 \\times 10^{6}$ nm·K.', num(T2, 3, 0.02),
        ['$T = \\frac{2.90 \\times 10^{6}}{\\lambda_{\\text{peak}}} = \\frac{2.90 \\times 10^{6}}{' + l2 + '}$.', '$T = ' + T.commas(rnd(T2, 3)) + '$ K.', T2 > 7500 ? 'A hot star: it looks blue-white.' : T2 < 4500 ? 'A cool star: it looks orange-red.' : 'Similar to the Sun: it looks yellow-white.'],
        'Solve Wien\'s law for T.', { unit: 'K', vf: { k: 'T', lam: l2 } });
    }
    if (shape === 'celsius') {
      var c = R.pick([[727, 'A stove coil'], [1227, 'A glowing piece of iron'], [2727, 'A lamp filament'], [37, 'A person\'s skin, roughly'], [5227, 'A hot gas'], [-73, 'A cold dust cloud']]), K = c[0] + 273, l3 = WIEN / K;
      return P(c[1] + ' is at $' + c[0] + '^\\circ$C. At what wavelength does its thermal glow peak? Use $\\lambda_{\\text{peak}} = \\dfrac{2.90 \\times 10^{6}\\ \\text{nm·K}}{T}$ with $T$ in kelvins.', num(l3, 3, 0.02),
        ['Wien\'s law needs kelvins: $T = ' + c[0] + ' + 273 = ' + K + '$ K.', '$\\lambda_{\\text{peak}} = \\frac{2.90 \\times 10^{6}}{' + K + '} = ' + fx(l3, 3) + '$ nm.', l3 > 750 ? 'That is infrared, so most of its glow is invisible to us.' : 'That is visible light.'],
        'Convert to kelvins first.', { unit: 'nm', vf: { k: 'celsius', C: c[0] } });
    }
    if (shape === 'micron') {
      var Tm = R.pick([10, 20, 50, 100, 310, 2.725, 5, 15, 30, 40, 60, 80, 150, 200, 250, 290]), lm = WIEN / Tm / 1000;
      return P('Something at $' + fd(Tm, 3) + '$ K glows with a peak at what wavelength, in micrometers (one micrometer is 1000 nm)? Use $\\lambda_{\\text{peak}} = \\dfrac{2.90 \\times 10^{6}\\ \\text{nm·K}}{T}$.', num(lm, 3, 0.02),
        ['$\\lambda_{\\text{peak}} = \\frac{2.90 \\times 10^{6}}{' + fd(Tm, 3) + '} = ' + fx(lm * 1000, 3) + '$ nm.', 'In micrometers: $\\div 1000 = ' + fx(lm, 3) + '\\ \\mu$m.', Tm < 100 ? 'Far infrared or microwave: cold things need special telescopes.' : 'Infrared.'],
        'Find nanometers, then divide by 1000.', { unit: 'μm', vf: { k: 'micron', T: Tm } });
    }
    if (shape === 'ratio') {
      var r = R.pick([1.5, 2, 2.5, 3, 4, 5, 1.2, 1.25, 1.6, 6, 8, 10]), lb = R.pick([400, 500, 600, 800, 900, 1000, 300, 450, 550, 650, 700, 750, 1200, 1500]);
      return P('Star A\'s spectrum peaks at $' + lb + '$ nm and star B\'s at $' + fd(lb / r, 1) + '$ nm. How many times hotter is star B than star A?', num(r, 3, 0.02),
        ['Wien\'s law: $\\lambda_{\\text{peak}} \\propto \\frac{1}{T}$, so $\\frac{T_B}{T_A} = \\frac{\\lambda_A}{\\lambda_B}$.', '$\\frac{' + lb + '}{' + fd(lb / r, 1) + '} = ' + fd(r, 2) + '$.'], 'Shorter peak, hotter star.', { vf: { k: 'ratio', a: lb, b: lb / r } });
    }
    var right = R.pick(['the blue-white star', 'the blue star']);
    return P('Three stars look red, yellow and blue-white. Which is hottest?', mc(right, ['the red star', 'the yellow star', 'they are all the same temperature', 'there is no way to tell from color']),
      ['Hotter objects peak at shorter wavelengths (Wien\'s law).', 'Blue light has shorter wavelengths than yellow or red.', 'So the blue-white star is hottest and the red one coolest, the opposite of the hot and cold colors on a faucet.'], 'Which color has the shortest wavelength?', { vf: { k: 'mc' } });
  });

  G('astro.luminosity-radius-temperature', function (R, ctx) {
    var shape = by(ctx, R.pick(['L', 'L', 'mc']), R.pick(['R', 'L', 'cmp', 'mc']), R.pick(['si', 'R', 'cmp']));
    if (shape === 'L') {
      var Rr = R.pick([0.1, 0.2, 0.5, 0.8, 1.5, 2, 3, 4, 5, 8, 10, 20, 50, 100, 0.3, 0.4, 0.6, 1.2, 2.5, 6, 15, 30, 40, 70, 200, 0.12, 0.15, 0.25, 0.35, 0.7, 0.9, 1, 3.5, 7, 9, 12, 25, 35, 60, 80, 90, 120, 150]), Tt = R.pick([0.4, 0.5, 0.6, 0.7, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 0.55, 0.65, 0.75, 0.9, 1.1, 1.3, 1.7, 1.8, 4, 5, 3.5]), Lv = Rr * Rr * M.pow(Tt, 4);
      return P('A star has $' + fd(Rr, 2) + '$ times the Sun\'s radius and $' + fd(Tt, 2) + '$ times the Sun\'s surface temperature. How many times as luminous as the Sun is it?', num(Lv, 3, 0.02),
        ['In solar units, $L = R^2 T^4$.', '$R^2 = ' + fd(Rr * Rr, 4) + '$ and $T^4 = ' + fd(Tt, 2) + '^4 = ' + fd(M.pow(Tt, 4), 4) + '$.', '$L = ' + fd(Rr * Rr, 4) + ' \\times ' + fd(M.pow(Tt, 4), 4) + ' = ' + fx(Lv, 3) + '$ times the Sun\'s luminosity.'],
        'Square the radius; raise the temperature to the fourth power.', { unit: 'L☉', vf: { k: 'L', R: Rr, T: Tt } });
    }
    if (shape === 'R') {
      var c = R.pick([[100, 0.5], [400, 0.5], [10000, 2], [1, 2], [0.01, 2], [900, 0.6], [16, 2], [81, 3], [10000, 0.5], [0.04, 1.5], [2500, 1], [36, 0.5], [1000, 0.8], [0.1, 1.2], [625, 5], [256, 2], [50, 0.75], [4, 0.5], [0.0025, 0.5]]), Rv = M.sqrt(c[0]) / (c[1] * c[1]);
      return P('A star is $' + T.commas(c[0]) + '$ times as luminous as the Sun, with $' + fd(c[1], 2) + '$ times the Sun\'s surface temperature. What is its radius, in solar radii?', num(Rv, 3, 0.02),
        ['$L = R^2 T^4$ in solar units, so $R = \\frac{\\sqrt{L}}{T^2}$.', '$\\sqrt{' + T.commas(c[0]) + '} = ' + fd(M.sqrt(c[0]), 3) + '$ and $T^2 = ' + fd(c[1] * c[1], 4) + '$.', '$R = ' + fd(M.sqrt(c[0]), 3) + ' \\div ' + fd(c[1] * c[1], 4) + ' = ' + fx(Rv, 3) + '$ solar radii.', Rv > 10 ? 'A giant.' : Rv < 0.1 ? 'Tiny: a white dwarf.' : 'A main-sequence-sized star.'],
        'Solve L = R²T⁴ for R.', { unit: 'R☉', vf: { k: 'R', L: c[0], T: c[1] } });
    }
    if (shape === 'cmp') {
      var sameT = R.coin(), k = sameT ? R.pick([4, 9, 25, 100, 10000]) : R.pick([2, 3, 0.5, 0.6, 1, 2.5]);
      if (sameT) return P('Two stars have the same surface temperature, but one is $' + T.commas(k) + '$ times as luminous as the other. How many times larger is its radius?', num(M.sqrt(k), 3, 0.01),
        ['Same $T$, so $L \\propto R^2$.', '$\\frac{R_1}{R_2} = \\sqrt{' + T.commas(k) + '} = ' + fd(M.sqrt(k), 3) + '$.'], 'With T fixed, L goes as R².', { vf: { k: 'cmpR', r: k } });
      return P('Two stars have the same radius, but one has $' + fd(k, 2) + '$ times the surface temperature of the other. How many times as luminous is it?', num(M.pow(k, 4), 3, 0.01),
        ['Same $R$, so $L \\propto T^4$.', '$' + fd(k, 2) + '^4 = ' + fd(M.pow(k, 4), 4) + '$.', k < 1 ? 'Cooler, so much dimmer.' : 'Even a modest rise in temperature makes a big change in power.'], 'With R fixed, L goes as T⁴.', { vf: { k: 'cmpT', t: k } });
    }
    if (shape === 'si') {
      var s = R.pick([['the Sun', 6.96e8, 5772], ['Sirius A', 1.19e9, 9940], ['a red dwarf', 1.4e8, 3100], ['a white dwarf', 7.0e6, 25000], ['a red giant', 3.5e10, 4000]]), Lw = 4 * M.PI * s[1] * s[1] * SIGMA * M.pow(s[2], 4);
      return P('Find the luminosity (in watts) of ' + s[0] + ', with radius $' + fx(s[1], 3) + '$ m and surface temperature $' + T.commas(s[2]) + '$ K. Use $L = 4\\pi R^2 \\sigma T^4$ with $\\sigma = 5.67 \\times 10^{-8}\\ \\text{W/(m}^2\\text{K}^4)$.', num(Lw, 3, 0.02),
        ['Surface area: $4\\pi R^2 = 4\\pi (' + fx(s[1], 3) + ')^2 = ' + fx(4 * M.PI * s[1] * s[1], 3) + '\\ \\text{m}^2$.', 'Power per square meter: $\\sigma T^4 = 5.67 \\times 10^{-8} \\times ' + T.commas(s[2]) + '^4 = ' + fx(SIGMA * M.pow(s[2], 4), 3) + '$ W/m².', 'Multiply: $L = ' + fx(Lw, 3) + '$ W.'],
        'Area × power per area.', { unit: 'W', vf: { k: 'si', R: s[1], T: s[2] } });
    }
    var right = 'No: a white dwarf is hotter than the Sun but much fainter, because it is so small';
    return P('Is a hotter star always more luminous than a cooler one?', mc(right, ['Yes: luminosity depends only on temperature', 'Yes: hotter stars are always bigger too', 'No: cooler stars are always more luminous', 'Only if both stars are at the same distance from us']),
      ['$L = 4\\pi R^2 \\sigma T^4$: luminosity depends on size as well as temperature.', 'Sirius B is about $25{,}000$ K, four times hotter than the Sun, yet it is about Earth-sized and gives off only a few percent of the Sun\'s power.', 'A red giant is cooler than the Sun but so huge that it outshines it hundreds of times.'], 'What else is in L = 4πR²σT⁴?', { vf: { k: 'mc' } });
  });

  var LINESET = [['hydrogen', '656.3 and 486.1'], ['sodium', '589.0 and 589.6'], ['helium', '587.6 and 447.1'], ['calcium (ionized)', '393.4 and 396.8'], ['mercury', '546.1 and 435.8']];
  G('astro.spectral-lines', function (R, ctx) {
    var shape = by(ctx, R.pick(['kind', 'kind', 'dark']), R.pick(['kind', 'energy', 'match', 'dark']), R.pick(['levels', 'energy', 'match', 'kind']));
    if (shape === 'kind') {
      var k = R.pick([['the glowing filament of a hot light bulb', 'a continuous spectrum'], ['a glowing tube of thin neon gas', 'an emission (bright-line) spectrum'], ['sunlight, which passes through the cooler gas of the Sun\'s outer layers', 'an absorption (dark-line) spectrum'], ['a hot, thin gas cloud lit up by nearby stars, seen against dark sky', 'an emission (bright-line) spectrum'], ['a hot, dense star seen through a cooler cloud of gas', 'an absorption (dark-line) spectrum'], ['a red-hot stove coil', 'a continuous spectrum']]);
      return P('What kind of spectrum do you get from ' + k[0] + '?', mc(k[1], ['a continuous spectrum', 'an emission (bright-line) spectrum', 'an absorption (dark-line) spectrum', 'no spectrum at all'].filter(function (x) { return x !== k[1]; })),
        ['Kirchhoff\'s laws: a hot, dense object gives a continuous rainbow; a hot, thin gas gives bright lines; a cooler, thin gas in front of a hotter source gives dark lines.', 'Here: ' + k[1] + '.'], 'Is it dense or thin? Is it in front of something hotter?', { viz: R.chance(0.3) ? { name: 'ph-spectrum', opts: { mode: 'kirchhoff', interactive: false } } : undefined, vf: { k: 'mc' } });
    }
    if (shape === 'dark') {
      var el = R.pick(['hydrogen', 'sodium', 'calcium', 'iron', 'helium']);
      return P('A star\'s spectrum shows dark lines at exactly the wavelengths where ' + el + ' gives bright lines in the lab. What does that tell us?', mc('There is ' + el + ' in the cooler gas of the star\'s outer layers, absorbing those wavelengths', wrongs(R, ['The star has no ' + el + ' at all', 'The star is made only of ' + el, el[0].toUpperCase() + el.slice(1) + ' blocks all other colors of light', 'The dark lines are caused by Earth\'s atmosphere'], 3)),
        ['An atom absorbs exactly the same wavelengths it emits, because both come from jumps between the same energy levels.', 'So dark lines at ' + el + '\'s wavelengths mean ' + el + ' atoms are present, between us and the hotter layers below.', 'Dark lines are a fingerprint of what is there, not of what is missing.'], 'Absorption and emission use the same energy levels.', { vf: { k: 'mc' } });
    }
    if (shape === 'energy') {
      var ln = R.pick([['the hydrogen-alpha line', 656.3], ['the hydrogen-beta line', 486.1], ['the sodium line', 589.0], ['the calcium K line', 393.4], ['the helium line', 587.6], ['the mercury green line', 546.1]]), E = 1240 / ln[1];
      return P('What is the energy of a photon in ' + ln[0] + ' at $' + fd(ln[1], 1) + '$ nm? Use $E = \\dfrac{hc}{\\lambda}$ with $hc = 1240$ eV·nm.', num(E, 3, 0.01),
        ['$E = \\frac{1240\\ \\text{eV·nm}}{' + fd(ln[1], 1) + '\\ \\text{nm}} = ' + fd(E, 3) + '$ eV.', 'That is exactly the energy gap between two of the atom\'s levels.'], 'Divide 1240 by the wavelength.', { unit: 'eV', vf: { k: 'energy', lam: ln[1] } });
    }
    if (shape === 'levels') {
      var lv = [[-13.6, 1], [-3.40, 2], [-1.51, 3], [-0.85, 4], [-0.54, 5]], u = R.int(2, 4), d = R.int(1, u - 1), up = lv[u], lo = lv[d], dE = up[0] - lo[0], lam = 1240 / dE;
      return P('Hydrogen\'s energy levels are $E_1 = -13.6$ eV, $E_2 = -3.40$ eV, $E_3 = -1.51$ eV, $E_4 = -0.85$ eV and $E_5 = -0.54$ eV. What wavelength of light does an atom emit when its electron drops from level ' + up[1] + ' to level ' + lo[1] + '? Use $hc = 1240$ eV·nm.', num(lam, 3, 0.01),
        ['Photon energy $=$ the drop in energy: $E_{' + up[1] + '} - E_{' + lo[1] + '} = ' + fd(up[0], 2) + ' - (' + fd(lo[0], 2) + ') = ' + fd(dE, 2) + '$ eV.', '$\\lambda = \\frac{1240}{' + fd(dE, 2) + '} = ' + fd(lam, 0) + '$ nm.', lam < 400 ? 'Ultraviolet: jumps down to level 1 (the Lyman series) are all ultraviolet.' : lam > 700 ? 'Infrared.' : 'Visible: a Balmer line, one of hydrogen\'s visible colors.'],
        'Find the energy gap, then λ = 1240/ΔE.', { unit: 'nm', vf: { k: 'levels', Eu: up[0], El: lo[0] } });
    }
    var m = R.pick(LINESET);
    return P('Lab measurements give these pairs of strong lines (nm): hydrogen $656.3, 486.1$; sodium $589.0, 589.6$; helium $587.6, 447.1$; ionized calcium $393.4, 396.8$; mercury $546.1, 435.8$. A gas cloud shows bright lines at ' + m[1].replace(' and ', ' nm and ') + ' nm. Which element is glowing?', mc(m[0], LINESET.map(function (x) { return x[0]; }).filter(function (x) { return x !== m[0]; })),
      ['Each element has its own set of wavelengths, set by its energy levels.', 'Match the measured lines to the lab list: ' + m[1] + ' nm belong to ' + m[0] + '.'], 'Look for both wavelengths in one row.', { vf: { k: 'mc' } });
  });

  G('astro.doppler-light', function (R, ctx) {
    var shape = by(ctx, R.pick(['v', 'v', 'dir']), R.pick(['v', 'obs', 'dir', 'mc']), R.pick(['wobble', 'obs', 'v']));
    var lines = [['hydrogen-alpha', 656.3], ['hydrogen-beta', 486.1], ['sodium', 589.0], ['calcium K', 393.4], ['magnesium', 517.3]];
    if (shape === 'v') {
      var l = R.pick(lines), vv = R.pick([-300, -150, -90, -60, 30, 60, 75, 120, 150, 240, 450, 600, -45, -600, -450, -240, -200, -120, -75, -30, 15, 45, 90, 180, 200, 300, 360, 750, 900]), dl = rnd(l[1] * vv / CKM, 2), lam = fix(l[1] + dl), vr = CKM * (lam - l[1]) / l[1];
      return P('In the lab, the ' + l[0] + ' line is at $' + fd(l[1], 1) + '$ nm. In a star\'s spectrum it is at $' + fd(lam, 3) + '$ nm. Find the star\'s radial velocity in km/s, with $+$ for moving away from us and $-$ for moving toward us. ($c = 3.00 \\times 10^{5}$ km/s.)', num(vr, 3, 0.03),
        ['Shift: $\\Delta\\lambda = ' + fd(lam, 3) + ' - ' + fd(l[1], 1) + ' = ' + fd(lam - l[1], 3) + '$ nm (' + (lam > l[1] ? 'longer: a redshift' : 'shorter: a blueshift') + ').', '$v = c\\,\\frac{\\Delta\\lambda}{\\lambda} = 3.00 \\times 10^{5} \\times \\frac{' + fd(lam - l[1], 3) + '}{' + fd(l[1], 1) + '}$.', '$v = ' + fd(vr, 0) + '$ km/s: ' + (vr > 0 ? 'moving away.' : 'moving toward us.')],
        'Δλ/λ = v/c.', { unit: 'km/s', vf: { k: 'v', l0: l[1], l: lam } });
    }
    if (shape === 'obs') {
      var l2 = R.pick(lines), v2 = R.pick([-200, -60, 45, 90, 150, 300, 1500, 3000, 6000, -1000, -500, -120, -30, 30, 60, 120, 250, 600, 900, 2000, 4500, 9000]), lo = l2[1] * (1 + v2 / CKM);
      return P('A galaxy moves ' + (v2 > 0 ? 'away from' : 'toward') + ' us at $' + T.commas(M.abs(v2)) + '$ km/s. Where do we see its ' + l2[0] + ' line, whose lab wavelength is $' + fd(l2[1], 1) + '$ nm? ($c = 3.00 \\times 10^{5}$ km/s.) Give at least two decimal places.', { t: 'num', v: ans(lo, 7), tol: fix(rnd(M.max(0.003, 0.04 * M.abs(lo - l2[1])), 2)) },
        ['$\\Delta\\lambda = \\lambda\\,\\frac{v}{c} = ' + fd(l2[1], 1) + ' \\times \\frac{' + v2 + '}{3.00 \\times 10^{5}} = ' + fd(l2[1] * v2 / CKM, 3) + '$ nm.', 'Observed: $' + fd(l2[1], 1) + (v2 > 0 ? ' + ' : ' - ') + fd(M.abs(l2[1] * v2 / CKM), 3) + ' = ' + fd(lo, 3) + '$ nm (' + (v2 > 0 ? 'redshifted' : 'blueshifted') + ').'],
        'Find the shift, then add it (away) or subtract it (toward).', { unit: 'nm', vf: { k: 'obs', l0: l2[1], v: v2 } });
    }
    if (shape === 'dir') {
      var red = R.coin();
      return P('All the lines in a star\'s spectrum appear at slightly ' + (red ? 'longer' : 'shorter') + ' wavelengths than in the lab. What does that tell us?', mc(red ? 'The star is moving away from us' : 'The star is moving toward us', [red ? 'The star is moving toward us' : 'The star is moving away from us', 'The star is moving across the sky, sideways to us', 'The star is ' + (red ? 'cooler' : 'hotter') + ' than the lab gas']),
        ['A source moving away stretches the light waves (longer wavelengths: redshift); one moving toward us squeezes them (blueshift).', 'Only motion along our line of sight shifts the lines; sideways motion does not.', 'Here the lines are ' + (red ? 'longer, so it is moving away.' : 'shorter, so it is moving toward us.')], 'Away stretches; toward squeezes.', { vf: { k: 'mc' } });
    }
    if (shape === 'wobble') {
      var w = R.pick([12.5, 30, 60, 0.09, 100, 0.5, 1, 5, 10, 20, 40, 50, 75, 150, 200]), l3 = R.pick(lines), dd = l3[1] * w / 3.00e8;
      return P('A planet tugs its star back and forth at $' + fd(w, 2) + '$ m/s. How big a shift does that make in the ' + l3[0] + ' line at $' + fd(l3[1], 1) + '$ nm? Give $\\Delta\\lambda$ in nm. ($c = 3.00 \\times 10^{8}$ m/s.)', num(dd, 3, 0.02),
        ['$\\Delta\\lambda = \\lambda\\,\\frac{v}{c} = ' + fd(l3[1], 1) + ' \\times \\frac{' + fd(w, 2) + '}{3.00 \\times 10^{8}}$.', '$\\Delta\\lambda = ' + fx(dd, 3) + '$ nm: tiny, which is why planet hunters need extremely stable spectrographs.'],
        'Keep both speeds in m/s.', { unit: 'nm', vf: { k: 'wobble', l0: l3[1], v: w } });
    }
    var right = 'No. Every line moves by the same small fraction, so the star\'s color barely changes';
    return P('A star is moving away from us at $30$ km/s, so its light is redshifted. Does the star look redder to our eyes?', mc(right, ['Yes, it looks noticeably red', 'Yes, because redshift means the star is cooling', 'No, because redshift makes stars look blue', 'Only through a telescope']),
      ['$\\frac{\\Delta\\lambda}{\\lambda} = \\frac{v}{c} = \\frac{30}{300{,}000} = 0.0001$.', 'A $500$ nm line moves to $500.05$ nm, far too little for the eye to notice.', 'We measure redshift by comparing the dark lines with lab wavelengths, not by the star\'s color.'], 'Compute v/c.', { vf: { k: 'mc' } });
  });

  G('astro.telescopes', function (R, ctx) {
    var shape = by(ctx, R.pick(['ratio', 'ratio', 'mc']), R.pick(['eye', 'res', 'ratio', 'mc']), R.pick(['res', 'time', 'mag', 'eye']));
    if (shape === 'ratio') {
      var d1 = R.pick([2, 3, 4, 5, 10, 8, 6, 1, 1.5, 2.5, 7, 12, 16]), d2 = d1 * R.pick([2, 3, 4, 5, 1.5, 2.5]), u = R.pick(['m', 'inch']);
      return P('Telescope A has a mirror $' + fd(d1, 2) + '$ ' + u + (u === 'inch' ? 'es' : '') + ' across and telescope B one $' + fd(d2, 2) + '$ ' + u + (u === 'inch' ? 'es' : '') + ' across. How many times more light does B collect?', num(M.pow(d2 / d1, 2), 3, 0.01),
        ['Light collected is proportional to the mirror\'s area, which goes as the diameter squared.', '$\\left(\\frac{' + fd(d2, 2) + '}{' + fd(d1, 2) + '}\\right)^2 = ' + fd(d2 / d1, 2) + '^2 = ' + fd(M.pow(d2 / d1, 2), 3) + '$.'], 'Area goes as D².', { vf: { k: 'ratio', a: d1, b: d2 } });
    }
    if (shape === 'eye') {
      var D = R.pick([[0.1, '10 cm backyard telescope'], [0.2, '20 cm amateur telescope'], [2.4, '2.4 m Hubble Space Telescope'], [6.5, '6.5 m James Webb Space Telescope'], [10, '10 m Keck telescope']]), rr = M.pow(D[0] / 0.007, 2);
      return P('A dark-adapted eye has a pupil about $7$ mm across. How many times more light does a ' + D[1] + ' collect than your eye?', num(rr, 3, 0.02),
        ['Ratio of areas $= \\left(\\frac{D}{d_{\\text{eye}}}\\right)^2$. Use the same units: $' + fd(D[0], 2) + '$ m $= ' + T.commas(D[0] * 1000) + '$ mm.', '$\\left(\\frac{' + T.commas(D[0] * 1000) + '}{7}\\right)^2 = ' + fx(rr, 3) + '$.'], 'Put both diameters in mm.', { vf: { k: 'eye', D: D[0] } });
    }
    if (shape === 'res') {
      var Dm = R.pick([0.1, 0.2, 1, 2.4, 6.5, 10, 0.25, 0.5, 0.08, 0.15, 0.3, 0.4, 0.6, 0.8, 1.5, 3.5, 4, 8.2]), lam = R.pick([500, 550, 600, 2000, 400, 450, 650, 700, 1000, 1500]), th = 2.5e5 * lam * 1e-9 / Dm;
      return P('The finest detail a telescope can resolve is about $\\theta = 2.5 \\times 10^{5}\\,\\dfrac{\\lambda}{D}$ arcseconds, with $\\lambda$ and $D$ in the same units. What is $\\theta$ for a $' + fd(Dm, 2) + '$ m telescope observing at $' + lam + '$ nm?', num(th, 3, 0.02),
        ['$\\lambda = ' + lam + '$ nm $= ' + fx(lam * 1e-9, 3) + '$ m.', '$\\theta = 2.5 \\times 10^{5} \\times \\frac{' + fx(lam * 1e-9, 3) + '}{' + fd(Dm, 2) + '} = ' + fx(th, 3) + '$ arcseconds.', 'A bigger aperture gives a smaller angle: finer detail.'],
        'Convert nm to m first.', { unit: 'arcsec', vf: { k: 'res', lam: lam, D: Dm } });
    }
    if (shape === 'time') {
      var t1 = R.pick([20, 40, 60, 80, 90, 120, 10, 15, 30, 45, 50, 100, 150, 180, 240]), f = R.pick([2, 3, 4]);
      return P('A photo of a faint galaxy needs a $' + t1 + '$-minute exposure on a telescope with a $0.5$ m mirror. How many minutes would the same photo take on a telescope with a mirror $' + f + '$ times as wide?', num(t1 / (f * f), 3, 0.01),
        ['A mirror ' + f + ' times as wide has $' + f + '^2 = ' + f * f + '$ times the area, so it collects light ' + f * f + ' times as fast.', 'Time $= ' + t1 + ' \\div ' + f * f + ' = ' + fd(t1 / (f * f), 2) + '$ min.'], 'Light gathered goes as D².', { unit: 'min', vf: { k: 'time', t: t1, f: f } });
    }
    if (shape === 'mag') {
      var fo = R.pick([900, 1000, 1200, 2000, 500, 600, 750, 800, 1500, 2400, 3000]), fe = R.pick([10, 20, 25, 40, 4, 5, 6, 8, 12, 15, 30, 32]);
      return P('A telescope\'s objective has a focal length of $' + T.commas(fo) + '$ mm and its eyepiece $' + fe + '$ mm. What is the magnification?', num(fo / fe, 3, 0.01),
        ['Magnification $= \\frac{f_{\\text{objective}}}{f_{\\text{eyepiece}}} = \\frac{' + T.commas(fo) + '}{' + fe + '} = ' + fd(fo / fe, 1) + '$.', 'Swapping eyepieces changes the magnification, but not how much light the telescope gathers or the finest detail it can show.'], 'Divide the focal lengths.', { vf: { k: 'mag', fo: fo, fe: fe } });
    }
    var right = 'Collecting light and resolving fine detail, both set by the diameter of the mirror or lens';
    return P('What are the most important jobs of an astronomical telescope?', mc(right, wrongs(R, ['Magnifying, which is set by the length of the tube', 'Magnifying, which is set by the eyepiece alone', 'Bringing the stars closer to Earth', 'Making stars look bigger, so they show as disks'], 3)),
      ['Most objects are faint, so the main job is gathering light: the collecting area goes as $D^2$.', 'The second is resolution: a wider aperture shows finer detail.', 'Magnification comes from the eyepiece and is easy to change; without enough light and resolution, more magnification only shows a bigger blur.'], 'What does a bigger mirror give you?', { vf: { k: 'mc' } });
  });

  G('astro.observing-the-spectrum', function (R, ctx) {
    var shape = by(ctx, R.pick(['ground', 'band']), R.pick(['ground', 'band', 'freq', 'mc']), R.pick(['freq', 'dish', 'band']));
    if (shape === 'ground') {
      var b = R.pick([['X-rays', 'space'], ['gamma rays', 'space'], ['most ultraviolet light', 'space'], ['far-infrared light', 'space'], ['radio waves', 'ground'], ['visible light', 'ground']]);
      return P('Where must a telescope be to observe ' + b[0] + ' from space objects?', mc(b[1] === 'space' ? 'Above the atmosphere, in space' : 'It can work from the ground', b[1] === 'space' ? ['It can work from the ground', 'Only underground', 'Only at the South Pole'] : ['Above the atmosphere, in space', 'Only underground', 'Only on the Moon']),
        ['Earth\'s atmosphere lets visible light and most radio waves through ("windows"), plus some near infrared.', 'It blocks gamma rays, X-rays, most ultraviolet and much of the infrared.', b[1] === 'space' ? 'So ' + b[0] + ' must be observed from space.' : 'So ' + b[0] + ' can be observed from the ground.'], 'Which kinds of light reach the ground?', { vf: { k: 'mc' } });
    }
    if (shape === 'band') {
      var w = R.pick([['21 cm', 'radio'], ['10 μm', 'infrared'], ['500 nm', 'visible'], ['200 nm', 'ultraviolet'], ['1 nm', 'X-ray'], ['0.001 nm', 'gamma-ray'], ['3 m', 'radio'], ['2 μm', 'infrared'], ['650 nm', 'visible'], ['100 nm', 'ultraviolet'], ['6 cm', 'radio']]);
      var pool = ['radio', 'infrared', 'visible', 'ultraviolet', 'X-ray', 'gamma-ray'].filter(function (x) { return x !== w[1]; }).map(function (x) { return 'a ' + x + ' telescope'; });
      return P('A telescope is built to detect light of wavelength ' + w[0] + '. What kind of telescope is it?', mc('a ' + w[1] + ' telescope', wrongs(R, pool, 3)),
        ['From long to short wavelengths: radio (millimeters to meters and longer), infrared (about 1 mm down to 700 nm), visible (700 to 400 nm), ultraviolet (400 to about 10 nm), X-rays (about 10 nm down to 0.01 nm), gamma rays (shorter still).', w[0] + ' falls in the ' + w[1] + ' band.'], 'Place the wavelength on the spectrum.', { vf: { k: 'mc' } });
    }
    if (shape === 'freq') {
      var f = R.pick([['the 21 cm line of hydrogen', 0.21], ['a 3 m radio wave', 3], ['a 1 mm microwave', 0.001], ['a 6 cm radio wave', 0.06], ['a 10 μm infrared wave', 1e-5]]), hz = C / f[1];
      return P('What is the frequency of ' + f[0] + '? ($c = 3.00 \\times 10^{8}$ m/s.)', num(hz, 3, 0.02),
        ['$f = \\frac{c}{\\lambda}$, with $\\lambda$ in meters: $' + fx(f[1], 3) + '$ m.', '$f = \\frac{3.00 \\times 10^{8}}{' + fx(f[1], 3) + '} = ' + fx(hz, 3) + '$ Hz.'], 'f = c/λ.', { unit: 'Hz', vf: { k: 'freq', lam: f[1] } });
    }
    if (shape === 'dish') {
      var lam = R.pick([0.21, 0.06, 0.01]), Dk = 2.4 * lam / 500e-9 / 1000;
      return P('Resolution goes as $\\lambda/D$. How wide (in km) would a single radio dish observing at $' + fd(lam * 100, 0) + '$ cm need to be to see details as fine as the $2.4$ m Hubble telescope sees at $500$ nm?', num(Dk, 3, 0.02),
        ['Same detail means the same $\\lambda/D$: $D_{\\text{radio}} = D_{\\text{Hubble}} \\times \\frac{\\lambda_{\\text{radio}}}{\\lambda_{\\text{visible}}}$.', '$\\frac{' + fx(lam, 2) + '\\text{ m}}{5.00 \\times 10^{-7}\\text{ m}} = ' + fx(lam / 500e-9, 3) + '$.', '$D = 2.4 \\times ' + fx(lam / 500e-9, 3) + ' = ' + fx(Dk * 1000, 3) + '$ m $= ' + fx(Dk, 3) + '$ km. That is why radio astronomers link dishes across continents (interferometry).'],
        'Keep λ/D the same.', { unit: 'km', vf: { k: 'dish', lam: lam } });
    }
    var right = R.pick(['Radio waves pass through the atmosphere, so radio telescopes work on the ground, day or night', 'X-ray telescopes must be in space, because the atmosphere absorbs X-rays']);
    return P('Which statement about telescopes is true?', mc(right, wrongs(R, ['Radio telescopes must be in space because the air blocks radio waves', 'Every telescope collects visible light and converts it to other kinds', 'Infrared telescopes see heat, so they cannot see stars', 'X-ray telescopes work best on mountaintops'], 3)),
      ['The atmosphere is transparent to visible light and most radio waves, so telescopes for those can sit on the ground.', 'Gamma rays, X-rays and most ultraviolet are absorbed high in the air, and water vapor blocks much infrared, so those telescopes fly above it.'], 'Which kinds of light reach the ground?', { vf: { k: 'mc' } });
  });

// ---- 04_solar.js

  // =====================================================================================================
  // Unit 4: The Solar System (masses and radii from the NASA planetary fact sheets)
  var PLAN = [['Mercury', 3.30e23, 2440, 'rocky'], ['Venus', 4.87e24, 6052, 'rocky'], ['Earth', 5.97e24, 6371, 'rocky'], ['Mars', 6.42e23, 3390, 'rocky'], ['Jupiter', 1.898e27, 69911, 'giant'], ['Saturn', 5.68e26, 58232, 'giant'], ['Uranus', 8.68e25, 25362, 'giant'], ['Neptune', 1.02e26, 24622, 'giant'], ['the Moon', 7.35e22, 1737, 'rocky']];
  function dens(Mkg, Rkm) { return Mkg / (4 / 3 * M.PI * M.pow(Rkm * 1e3, 3)) / 1000; } // g/cm^3

  G('astro.planet-families', function (R, ctx) {
    var shape = by(ctx, R.pick(['simple', 'simple', 'mc']), R.pick(['full', 'class', 'mc', 'simple']), R.pick(['full', 'mass', 'float']));
    if (shape === 'simple') {
      var mm = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 1, 7, 15, 16, 20, 11, 13, 14, 17, 18, 19]), vv = R.pick([1, 2, 3, 4, 5, 6, 8, 2.5, 10, 1.2, 1.5, 3.5, 7, 9]), d = mm / vv;
      var big = R.coin(), Mx = mm * (big ? 1e26 : 1e23), Vx = vv * (big ? 1e23 : 1e20);
      return P('A planet has a mass of $' + fx(Mx, 2) + '$ kg and a volume of $' + fx(Vx, 2) + '\\ \\text{m}^3$. What is its average density in g/cm³? ($1000\\ \\text{kg/m}^3 = 1\\ \\text{g/cm}^3$.)', num(d, 3, 0.01),
        ['Density $= \\frac{\\text{mass}}{\\text{volume}} = \\frac{' + fx(Mx, 2) + '}{' + fx(Vx, 2) + '} = ' + fx(d * 1000, 3) + '\\ \\text{kg/m}^3$.', 'Divide by $1000$: $' + fd(d, 3) + '$ g/cm³.', d > 3 ? 'Dense enough for rock and metal: a rocky planet.' : 'Light, like a giant planet made mostly of hydrogen, helium and ices.'],
        'Mass ÷ volume, then convert.', { unit: 'g/cm³', vf: { k: 'simple', M: Mx, V: Vx } });
    }
    if (shape === 'full' || shape === 'class') {
      var p = R.pick(PLAN), d2 = dens(p[1], p[2]);
      if (shape === 'class') return P(p[0][0].toUpperCase() + p[0].slice(1) + ' has an average density of about $' + fd(rnd(d2, 2), 2) + '$ g/cm³. What does that tell us about what it is made of?', mc(p[3] === 'rocky' ? 'Mostly rock and metal' : 'Mostly hydrogen and helium (with ices), around a small dense core', [p[3] === 'rocky' ? 'Mostly hydrogen and helium (with ices), around a small dense core' : 'Mostly rock and metal', 'Mostly liquid water', 'Mostly iron, like a solid cannonball']),
        ['Rock is about $3$ g/cm³, iron about $8$, water $1$, and hydrogen and helium far less.', d2 > 3 ? 'An average above about $3.5$ g/cm³ needs rock with some metal: a rocky (terrestrial) body.' : 'An average below about $2$ g/cm³ means mostly light materials: a giant planet.'],
        'Compare with rock (about 3 g/cm³) and water (1 g/cm³).', { vf: { k: 'mc' } });
      return P(p[0][0].toUpperCase() + p[0].slice(1) + ' has a mass of $' + fx(p[1], 3) + '$ kg and a radius of $' + T.commas(p[2]) + '$ km. Find its average density in g/cm³.', num(d2, 3, 0.02),
        ['Radius in meters: $' + fx(p[2] * 1000, 4) + '$ m.', 'Volume $= \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi (' + fx(p[2] * 1000, 4) + ')^3 = ' + fx(4 / 3 * M.PI * M.pow(p[2] * 1000, 3), 3) + '\\ \\text{m}^3$.', 'Density $= \\frac{' + fx(p[1], 3) + '}{' + fx(4 / 3 * M.PI * M.pow(p[2] * 1000, 3), 3) + '} = ' + fx(d2 * 1000, 3) + '$ kg/m³ $= ' + fd(d2, 2) + '$ g/cm³.'],
        'Find the volume of a sphere first; keep units in meters.', { unit: 'g/cm³', vf: { k: 'full', M: p[1], R: p[2] } });
    }
    if (shape === 'mass') {
      var dd = R.pick([1.5, 2, 3, 4, 5, 5.5, 1, 2.5, 3.5, 4.5, 1.2]), rr = R.pick([2000, 3000, 5000, 8000, 10000, 1000, 1500, 2500, 4000, 6000, 7000, 1200, 3500, 9000]), Mm = dd * 1000 * 4 / 3 * M.PI * M.pow(rr * 1000, 3);
      return P('An exoplanet has a radius of $' + T.commas(rr) + '$ km. If it is rocky with an average density of $' + fd(dd, 2) + '$ g/cm³, what is its mass in kg?', num(Mm, 3, 0.02),
        ['Density in SI: $' + fd(dd, 2) + '$ g/cm³ $= ' + T.commas(dd * 1000) + '$ kg/m³.', 'Volume $= \\frac{4}{3}\\pi (' + fx(rr * 1000, 3) + ')^3 = ' + fx(4 / 3 * M.PI * M.pow(rr * 1000, 3), 3) + '\\ \\text{m}^3$.', 'Mass $= \\rho V = ' + fx(Mm, 3) + '$ kg.'], 'Mass = density × volume.', { unit: 'kg', vf: { k: 'mass', d: dd, R: rr } });
    }
    if (shape === 'float') {
      var p2 = R.pick(PLAN.filter(function (x) { return x[3] === 'giant'; })), d3 = dens(p2[1], p2[2]);
      return P('Compute the average density of ' + p2[0] + ' (mass $' + fx(p2[1], 3) + '$ kg, radius $' + T.commas(p2[2]) + '$ km) in g/cm³. (In a big enough bathtub, a planet less dense than water, $1$ g/cm³, would float.)', num(d3, 3, 0.02),
        ['$V = \\frac{4}{3}\\pi (' + fx(p2[2] * 1000, 4) + ')^3 = ' + fx(4 / 3 * M.PI * M.pow(p2[2] * 1000, 3), 3) + '\\ \\text{m}^3$.', '$\\rho = \\frac{' + fx(p2[1], 3) + '}{' + fx(4 / 3 * M.PI * M.pow(p2[2] * 1000, 3), 3) + '} = ' + fd(d3 * 1000, 0) + '$ kg/m³ $= ' + fd(d3, 2) + '$ g/cm³.', d3 < 1 ? 'Less than water: Saturn would float.' : 'More than water, though far less than rock.'],
        'Volume of a sphere, then mass ÷ volume.', { unit: 'g/cm³', vf: { k: 'full', M: p2[1], R: p2[2] } });
    }
    var right = 'No: the giant planets are the least dense; Earth is the densest planet';
    return P('Jupiter is about 318 times as massive as Earth. Does that make it the densest planet?', mc(right, ['Yes: the most massive planet is always the densest', 'Yes: gravity squeezes it to the highest density', 'No: Saturn is the densest planet', 'There is no way to know a planet\'s density from Earth']),
      ['Density is mass divided by volume, and Jupiter\'s volume is about 1300 times Earth\'s.', 'Jupiter: $1.33$ g/cm³. Earth: $5.51$ g/cm³, the highest of all the planets.', 'Big planets are made mostly of light hydrogen and helium; small ones of rock and metal.'], 'Divide the mass by the volume.', { vf: { k: 'mc' } });
  });

  G('astro.solar-system-formation', function (R, ctx) {
    var shape = by(ctx, R.pick(['evidence', 'frost', 'mc']), R.pick(['spin', 'evidence', 'frost', 'mc']), R.pick(['spin', 'spin2', 'evidence']));
    if (shape === 'evidence') {
      var good = R.pick(['All the planets orbit the Sun in the same direction, in nearly the same plane', 'The Sun spins in the same direction the planets orbit', 'Rocky planets lie close to the Sun and giant planets farther out', 'Disks of gas and dust are seen around many young stars']);
      return P('Which observation is evidence that the solar system formed from a single spinning, flattened disk?', mc(good, wrongs(R, ['The planets have different colors', 'Some planets have rings', 'The Sun is much bigger than the planets', 'Mars has two small moons', 'The planets are different distances from the Sun'], 3)),
        ['A spinning cloud that collapses flattens into a disk, and everything that forms in it keeps going around the same way.', 'So the disk model predicts orbits in one plane and one direction, a Sun spinning the same way, and sorting by temperature from the warm middle outward.', 'We also see such disks around young stars today.'], 'What would a flat, spinning disk leave behind?', { vf: { k: 'mc' } });
    }
    if (shape === 'frost') {
      var q = R.pick([['Why are the inner planets rocky and small?', 'Close to the young Sun it was too warm for ices to freeze, so only rock and metal could condense, and there was little of them'], ['Why did the giant planets form far from the Sun?', 'Beyond the frost line ices could freeze, giving plenty of solid material to build big cores that then pulled in hydrogen and helium gas']]);
      return P(q[0], mc(q[1], wrongs(R, ['The Sun\'s gravity pulled the heavy elements inward after the planets formed', 'The planets were thrown out of the Sun and the heaviest pieces fell back closest', 'Collisions with comets carried the gas outward', 'The outer planets formed first and drifted out to where they are now', 'Sunlight pushed all the rock out of the outer solar system'], 3)),
        ['In the disk around the young Sun, the temperature fell with distance.', 'Rock and metal can condense even where it is hot, but ices (water, ammonia, methane) freeze only far out, beyond the frost line, a few AU from the Sun.', 'Out there, plentiful ice built large cores, which grew massive enough to capture hydrogen and helium: the giant planets.'], 'Think about what can freeze where.', { vf: { k: 'mc' } });
    }
    if (shape === 'spin' || shape === 'spin2') {
      var f = R.pick([2, 3, 4, 5, 10, 20, 100, 2.5, 7, 9, 25, 40, 60, 90]);
      if (shape === 'spin2') return P('A slowly turning cloud of gas shrinks until its radius is $\\frac{1}{' + f + '}$ of what it was. Its angular momentum, which goes as $r^2\\omega$ for its spinning parts, stays the same. By what factor does its spin rate $\\omega$ increase?', num(f * f, 3, 0.01),
        ['Angular momentum is conserved: $r_1^2 \\omega_1 = r_2^2 \\omega_2$.', '$\\frac{\\omega_2}{\\omega_1} = \\left(\\frac{r_1}{r_2}\\right)^2 = ' + f + '^2 = ' + f * f + '$.', 'Spinning that fast, the cloud flattens into a disk: the birthplace of planets.'], 'Like a spinning skater pulling in her arms.', { vf: { k: 'spin', f: f } });
      return P('A spinning cloud shrinks to half its radius while keeping its angular momentum ($r^2\\omega$ stays the same). How many times faster does it spin?', num(4, 3, 0.01),
        ['$r_1^2\\omega_1 = r_2^2\\omega_2$ with $r_2 = \\frac{1}{2}r_1$.', '$\\omega_2 = \\omega_1 \\times 2^2 = 4\\omega_1$.'], 'Square the shrink factor.', { vf: { k: 'spin', f: 2 } });
    }
    var right = 'From a cloud of gas and dust that collapsed into the Sun and a spinning disk, about 4.6 billion years ago';
    return P('How did the planets form, according to the evidence?', mc(right, wrongs(R, ['From material flung out of the Sun after it formed', 'From pieces of a star that collided with the Sun', 'Each from its own separate cloud, captured later by the Sun\'s gravity', 'From the debris of an exploded planet between Mars and Jupiter'], 3)),
      ['The leading model, supported by disks seen around young stars, is that the Sun and planets formed together from one collapsing cloud.', 'Dust grains stuck together into pebbles, then into kilometer-sized planetesimals, which collided and grew into planets.', 'The oldest meteorites, about 4.57 billion years old, date the start.'], 'Did the planets come out of the Sun, or form beside it?', { vf: { k: 'mc' } });
  });

  G('astro.small-bodies', function (R, ctx) {
    var shape = by(ctx, R.pick(['tail', 'shower', 'tail']), R.pick(['tail', 'period', 'aph', 'shower']), R.pick(['period', 'aph', 'periodA']));
    if (shape === 'tail') {
      var out = R.coin();
      return P('A comet is heading ' + (out ? 'outward, away from the Sun, after rounding it' : 'inward, toward the Sun') + '. Which way does its tail point?', mc('Away from the Sun', ['Behind the comet, back along its path', 'Toward the Sun', 'Straight ahead of the comet, along its path']),
        ['A comet\'s tails are made by sunlight and the solar wind pushing gas and dust off its icy nucleus.', 'That push is always directly away from the Sun, whichever way the comet is moving.', out ? 'So when the comet heads outward, its tail actually goes in front of it.' : 'So on the way in, the tail trails behind it, but only because "behind" happens to be away from the Sun.'],
        'What pushes the tail?', { vf: { k: 'mc' } });
    }
    if (shape === 'shower') {
      var s = R.pick([['Perseids', 'August', 'Comet Swift–Tuttle'], ['Leonids', 'November', 'Comet Tempel–Tuttle'], ['Orionids', 'October', 'Halley\'s Comet'], ['Eta Aquariids', 'May', 'Halley\'s Comet']]);
      return P('The ' + s[0] + ' meteor shower returns every ' + s[1] + '. Why at the same time each year?', mc('Each ' + s[1] + ' Earth crosses the trail of dust left along the orbit of ' + s[2], wrongs(R, ['A comet passes close to Earth every ' + s[1], 'Stars fall from the constellation it is named after', 'The Moon\'s gravity pulls rocks toward Earth every ' + s[1], 'Earth\'s tilt makes the sky clearer in ' + s[1]], 3)),
        ['Comets shed dust along their orbits.', 'Earth\'s orbit crosses that trail at the same point, so on the same date, every year.', 'The bits of dust burn up in the air as meteors, tiny grains moving tens of kilometers per second.'], 'Where is Earth in its orbit on that date?', { vf: { k: 'mc' } });
    }
    if (shape === 'period' || shape === 'periodA') {
      var q = R.pick([0.3, 0.5, 0.6, 0.8, 1.0, 1.2]), Q = R.pick([5, 10, 20, 35, 50, 70, 100]), a = (q + Q) / 2, Pp = M.pow(a, 1.5);
      if (shape === 'periodA') return P('A comet\'s orbit has a semi-major axis of $' + fd(a, 3) + '$ AU. How many years does it take to come back? Use $P^2 = a^3$.', num(Pp, 3, 0.01),
        ['$P^2 = ' + fd(a, 3) + '^3 = ' + fx(a * a * a, 4) + '$.', '$P = \\sqrt{' + fx(a * a * a, 4) + '} = ' + fx(Pp, 3) + '$ years.'], 'Cube a, then take the square root.', { unit: 'yr', vf: { k: 'periodA', a: a } });
      return P('A comet swings within $' + fd(q, 2) + '$ AU of the Sun and goes out to $' + Q + '$ AU. How many years does one orbit take?', num(Pp, 3, 0.01),
        ['Semi-major axis: $a = \\frac{' + fd(q, 2) + ' + ' + Q + '}{2} = ' + fd(a, 3) + '$ AU.', 'Kepler\'s third law: $P = a^{3/2} = ' + fd(a, 3) + '^{1.5} = ' + fx(Pp, 3) + '$ years.'], 'Average the two distances to get a.', { unit: 'yr', vf: { k: 'period', q: q, Q: Q } });
    }
    var qq = R.pick([0.4, 0.6, 0.8, 1.0]), aa = R.pick([3, 5, 10, 17.8, 25]), QQ = 2 * aa - qq;
    return P('A comet has a semi-major axis of $' + fd(aa, 2) + '$ AU and comes within $' + fd(qq, 2) + '$ AU of the Sun. How far from the Sun is it at aphelion?', num(QQ, 3, 0.01),
      ['Perihelion plus aphelion is the whole long axis: $q + Q = 2a$.', '$Q = 2a - q = 2 \\times ' + fd(aa, 2) + ' - ' + fd(qq, 2) + ' = ' + fd(QQ, 2) + '$ AU.'], 'The long axis is 2a.', { unit: 'AU', vf: { k: 'aph', a: aa, q: qq } });
  });

  G('astro.exoplanets', function (R, ctx) {
    var shape = by(ctx, R.pick(['depth', 'depth', 'mc']), R.pick(['depth', 'radius', 'wobble', 'mc']), R.pick(['radius', 'wobble', 'orbit', 'depthKm']));
    if (shape === 'depth') {
      var r = R.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.02, 0.03, 0.01, 0.04, 0.06, 0.07, 0.09, 0.11, 0.13, 0.14, 0.16, 0.18, 0.25, 0.012, 0.015, 0.025, 0.035]), pct = r * r * 100;
      return P('A planet whose radius is $' + fd(r, 2) + '$ of its star\'s radius passes in front of the star. By what percent does the star\'s light dip?', pnum(pct, 3, 0.01),
        ['The planet blocks a disk of area $\\pi R_p^2$ out of the star\'s $\\pi R_\\star^2$.', 'Fraction blocked $= \\left(\\frac{R_p}{R_\\star}\\right)^2 = ' + fd(r, 2) + '^2 = ' + fd(r * r, 6) + '$.', 'As a percent: $' + fd(pct, 4) + '\\%$.'], 'Compare the areas of the two disks.', { viz: { name: 'ph-orbit', opts: { mode: 'transit', rp: r, interactive: false, quiet: true, t: 0.5 } }, vf: { k: 'depth', r: r } });
    }
    if (shape === 'radius' || shape === 'depthKm') {
      var dp = R.pick([0.25, 0.36, 0.49, 0.64, 1, 1.21, 1.44, 2.25, 0.01, 0.04, 0.09, 0.16, 0.81, 1.69, 1.96, 4, 0.0084, 0.02, 0.5]), Rs = R.pick([[1, 696000, 'Sun-like'], [0.5, 348000, 'small'], [0.2, 139000, 'red dwarf']]), rp = M.sqrt(dp / 100) * Rs[1];
      if (shape === 'depthKm') return P('A ' + Rs[2] + ' star with a radius of $' + T.commas(Rs[1]) + '$ km dims by $' + fd(dp, 2) + '\\%$ each time its planet passes in front. What is the planet\'s radius, in km?', num(rp, 3, 0.02),
        ['Depth $= \\left(\\frac{R_p}{R_\\star}\\right)^2 = ' + fd(dp / 100, 4) + '$.', '$\\frac{R_p}{R_\\star} = \\sqrt{' + fd(dp / 100, 4) + '} = ' + fd(M.sqrt(dp / 100), 3) + '$.', '$R_p = ' + fd(M.sqrt(dp / 100), 3) + ' \\times ' + T.commas(Rs[1]) + ' = ' + T.commas(rnd(rp, 3)) + '$ km.'], 'Take the square root of the depth (as a fraction).', { unit: 'km', vf: { k: 'depthKm', d: dp, Rs: Rs[1] } });
      return P('A star dims by $' + fd(dp, 2) + '\\%$ when its planet transits. What is the planet\'s radius as a fraction of the star\'s radius?', num(M.sqrt(dp / 100), 3, 0.01),
        ['Depth as a fraction: $' + fd(dp, 2) + '\\% = ' + fd(dp / 100, 4) + '$.', '$\\frac{R_p}{R_\\star} = \\sqrt{' + fd(dp / 100, 4) + '} = ' + fd(M.sqrt(dp / 100), 3) + '$.'], 'Depth = (Rp/R★)², so take a square root.', { vf: { k: 'radius', d: dp } });
    }
    if (shape === 'wobble') {
      var pl = R.pick([['a Jupiter-like planet', 13.1, 1 / 1047], ['an Earth-like planet', 29.8, 1 / 333000], ['a Saturn-like planet', 9.7, 1 / 3498], ['a "hot Jupiter"', 130, 1 / 1047]]), vs = pl[1] * 1000 * pl[2];
      return P('Both a star and its planet circle their common center of mass, so (mass × speed) is the same for each. A Sun-like star has ' + pl[0] + ' moving at $' + pl[1] + '$ km/s, with $\\frac{1}{' + T.commas(rnd(1 / pl[2], 4)) + '}$ of the star\'s mass. How fast does the star wobble, in m/s?', num(vs, 3, 0.02),
        ['$M_\\star v_\\star = m_p v_p$, so $v_\\star = v_p\\,\\frac{m_p}{M_\\star}$.', '$v_\\star = ' + pl[1] + '\\ \\text{km/s} \\times \\frac{1}{' + T.commas(rnd(1 / pl[2], 4)) + '} = ' + fx(vs / 1000, 3) + '$ km/s $= ' + fx(vs, 3) + '$ m/s.', 'The star\'s spectral lines shift back and forth by $\\Delta\\lambda/\\lambda = v_\\star/c$, which is how the planet is found.'],
        'Momenta balance about the center of mass.', { unit: 'm/s', vf: { k: 'wobble', vp: pl[1], ratio: pl[2] } });
    }
    if (shape === 'orbit') {
      var Ms = R.pick([1, 0.5, 2, 0.8, 1.2, 0.3, 0.6, 0.7, 1.5, 1.8, 2.5, 3, 0.35, 0.4, 0.9]), Py = R.pick([0.1, 0.25, 0.5, 1, 2, 4, 0.05, 0.2, 0.75, 1.5, 3, 5, 8, 10, 0.06, 0.07, 0.09, 0.12, 0.3, 0.35, 0.4, 0.7, 0.8, 0.9, 2.5, 3.5, 7, 9]), aa = M.cbrt(Ms * Py * Py);
      return P('Transits repeat every $' + fd(Py, 2) + '$ years around a star of $' + fd(Ms, 2) + '$ solar masses. How far from the star is the planet (its semi-major axis, in AU)? Use $M = \\dfrac{a^3}{P^2}$.', num(aa, 3, 0.01),
        ['The time between transits is the orbital period.', '$a^3 = M P^2 = ' + fd(Ms, 2) + ' \\times ' + fd(Py, 2) + '^2 = ' + fd(Ms * Py * Py, 4) + '$.', '$a = \\sqrt[3]{' + fd(Ms * Py * Py, 4) + '} = ' + fd(aa, 3) + '$ AU.'], 'Solve Newton\'s form of Kepler\'s law for a.', { unit: 'AU', vf: { k: 'orbit', M: Ms, P: Py } });
    }
    var right = 'Most were found by the transit method: the planet dims its star as it passes in front';
    return P('How have most of the thousands of known exoplanets been discovered?', mc(right, wrongs(R, ['Most were photographed directly through large telescopes', 'Most were found by their own radio signals', 'Most were seen as dots crossing the sky against the stars', 'Most were found by spacecraft that flew to them'], 3)),
      ['Planets are tiny and faint next to their stars, so very few have been photographed directly.', 'Most are found indirectly: the transit method (the star dims by $(R_p/R_\\star)^2$; Kepler and TESS found thousands) and the wobble method (Doppler shifts of the star).', 'NASA\'s Exoplanet Archive lists the transit method as the most productive by far.'], 'Planets are much fainter than their stars.', { vf: { k: 'mc' } });
  });

  // =====================================================================================================
  // Unit 5: The Sun
  G('astro.sun-layers', function (R, ctx) {
    var shape = by(ctx, R.pick(['which', 'which', 'mc']), R.pick(['which', 'km', 'order', 'mc']), R.pick(['km', 'depth', 'order']));
    var LAY = [['the core', 'Nuclear fusion makes the Sun\'s energy here, at about 15 million K'], ['the radiative zone', 'Energy creeps outward as light, absorbed and re-emitted countless times'], ['the convective zone', 'Hot gas rises and cooler gas sinks, carrying energy to the surface'], ['the photosphere', 'The visible "surface," at about 5800 K, where light finally escapes into space'], ['the chromosphere', 'A thin, reddish layer just above the visible surface'], ['the corona', 'The very thin outer atmosphere, over a million kelvins, seen during a total eclipse']];
    if (shape === 'which') {
      var l = R.pick(LAY);
      return P('Which layer of the Sun is this? <em>"' + l[1] + '."</em>', mc(l[0], wrongs(R, LAY.map(function (x) { return x[0]; }), 3, l[0])),
        ['From the inside out: core, radiative zone, convective zone, photosphere, chromosphere, corona.', 'The description matches ' + l[0] + '.'], 'Inside to outside: core, radiative, convective, photosphere, chromosphere, corona.', { vf: { k: 'mc' } });
    }
    if (shape === 'order') {
      var pick = R.sample(LAY.slice(0, 4), 2), outer = LAY.indexOf(pick[0]) > LAY.indexOf(pick[1]) ? pick[0] : pick[1];
      return P('A photon made in the core travels outward. Which does it reach later: ' + pick[0][0] + ' or ' + pick[1][0] + '?', mc(outer[0], [pick[0][0] === outer[0] ? pick[1][0] : pick[0][0], 'it reaches both at the same time', 'it never reaches either']),
        ['The order outward is core, radiative zone, convective zone, photosphere.', 'So it reaches ' + outer[0] + ' later.'], 'List the layers from the center out.', { vf: { k: 'mc' } });
    }
    if (shape === 'km') {
      var f = R.pick([[0.25, 'the core extends out to about 0.25 of the radius'], [0.7, 'the convective zone begins at about 0.7 of the radius']]);
      return P('The Sun\'s radius is $696{,}000$ km, and ' + f[1] + '. How far from the center is that, in km?', num(f[0] * 696000, 3, 0.01),
        ['$' + f[0] + ' \\times 696{,}000 = ' + T.commas(f[0] * 696000) + '$ km.'], 'Multiply the fraction by the radius.', { unit: 'km', vf: { k: 'km', f: f[0] } });
    }
    return P('The convective zone runs from $0.7$ of the Sun\'s radius out to the surface. The radius is $696{,}000$ km. How deep is the convective zone, in km?', num(0.3 * 696000, 3, 0.01),
      ['Its thickness is $1 - 0.7 = 0.3$ of the radius.', '$0.3 \\times 696{,}000 = 208{,}800$ km, more than 16 Earths stacked across.'], 'Subtract fractions first.', { unit: 'km', vf: { k: 'depth' } });
  });

  G('astro.sun-fusion', function (R, ctx) {
    var shape = by(ctx, R.pick(['perkg', 'frac', 'mc']), R.pick(['perkg', 'rate', 'mev', 'mc']), R.pick(['rate', 'hrate', 'mev']));
    if (shape === 'frac') {
      var m = R.int(1, 40) * R.pick([1, 10, 100]);
      return P('When hydrogen fuses into helium, about $0.7\\%$ of the mass turns into energy. If $' + T.commas(m) + '$ kg of hydrogen fuses, how many kilograms of mass become energy?', num(0.007 * m, 3, 0.01),
        ['$0.7\\% = 0.007$.', '$0.007 \\times ' + T.commas(m) + ' = ' + fd(0.007 * m, 3) + '$ kg.', 'The other $99.3\\%$ ends up as helium.'], 'Turn the percent into a decimal.', { unit: 'kg', vf: { k: 'frac', m: m } });
    }
    if (shape === 'perkg') {
      var m2 = R.int(1, 60), E = 0.007 * m2 * C * C;
      return P('About $0.7\\%$ of the mass of fused hydrogen becomes energy. How many joules come from fusing $' + m2 + '$ kg of hydrogen? Use $E = mc^2$ with $c = 3.00 \\times 10^{8}$ m/s.', num(E, 3, 0.02),
        ['Mass converted: $0.007 \\times ' + m2 + ' = ' + fd(0.007 * m2, 3) + '$ kg.', '$E = mc^2 = ' + fd(0.007 * m2, 3) + ' \\times (3.00 \\times 10^{8})^2 = ' + fx(E, 3) + '$ J.', 'Burning ' + m2 + ' kg of coal gives only about $' + fx(3e7 * m2, 1) + '$ J: fusion is millions of times richer.'],
        'Find the mass that disappears, then E = mc².', { unit: 'J', vf: { k: 'perkg', m: m2 } });
    }
    if (shape === 'rate') {
      var Lr = R.chance(0.3) ? [3.83e26, 'the Sun'] : (function () { var k = R.pick([0.01, 0.05, 0.25, 2, 5, 10, 25, 100, 1000, 0.1, 0.5, 3, 50, 500, 10000, 0.012, 0.03, 0.08, 0.3, 0.7, 1.2, 6, 15, 40, 90, 300, 800, 2000, 4000, 9000]); return [rnd(3.83e26 * k, 3), 'a star ' + (k < 1 ? fd(k, 2) + ' times' : T.commas(k) + ' times') + ' as luminous as the Sun']; })(), dm = Lr[0] / (C * C);
      return P(Lr[1][0].toUpperCase() + Lr[1].slice(1) + ' gives off $' + fx(Lr[0], 3) + '$ W. How many kilograms of mass does it turn into energy every second? ($c = 3.00 \\times 10^{8}$ m/s.)', num(dm, 3, 0.02),
        ['Power is energy per second, and $E = mc^2$, so mass per second $= \\frac{L}{c^2}$.', '$\\frac{' + fx(Lr[0], 3) + '}{(3.00 \\times 10^{8})^2} = \\frac{' + fx(Lr[0], 3) + '}{9.00 \\times 10^{16}} = ' + fx(dm, 3) + '$ kg/s.', Lr[1] === 'the Sun' ? 'Millions of tonnes per second, yet tiny next to the Sun\'s $2 \\times 10^{30}$ kg.' : 'Large by everyday standards, but tiny next to the mass of a star.'],
        'Divide the power by c².', { unit: 'kg/s', vf: { k: 'rate', L: Lr[0] } });
    }
    if (shape === 'hrate') {
      var kk = R.chance(0.3) ? 1 : R.pick([0.1, 0.2, 0.5, 2, 3, 4, 5, 8, 10, 20, 50, 100, 1000]), dm2 = 3.83e26 * kk / (C * C), h = dm2 / 0.007;
      return P((kk === 1 ? 'The Sun' : 'A star ' + T.commas(kk) + ' times as luminous as the Sun') + ' converts $' + fx(dm2, 3) + '$ kg of mass into energy each second, and that is $0.7\\%$ of the hydrogen it fuses. How many kilograms of hydrogen does it fuse each second?', num(h, 3, 0.02),
        ['Mass converted $= 0.007 \\times$ hydrogen fused.', 'Hydrogen fused $= \\frac{' + fx(dm2, 3) + '}{0.007} = ' + fx(h, 3) + '$ kg/s' + (kk === 1 ? ': about 600 million tonnes every second.' : '.')], 'Divide by 0.007.', { unit: 'kg/s', vf: { k: 'hrate', dm: dm2, kk: kk } });
    }
    if (shape === 'mev') {
      var mH = 1.007825, mHe = 4.002603, dmu = 4 * mH - mHe, mev = dmu * 931.5, nHe = R.chance(0.35) ? 1 : R.int(2, 60);
      if (nHe > 1) return P('In the Sun\'s core, every helium-4 atom made from four hydrogen atoms ($1.007825$ u each; helium-4 is $4.002603$ u) releases energy. How much energy, in MeV, is released in making $' + nHe + '$ helium-4 atoms? ($1$ u of mass $= 931.5$ MeV.)', num(nHe * mev, 3, 0.01),
        ['Mass lost for one helium atom: $4 \\times 1.007825 - 4.002603 = 0.028697$ u.', 'Energy for one: $0.028697 \\times 931.5 = ' + fd(mev, 2) + '$ MeV.', 'For $' + nHe + '$ atoms: $' + nHe + ' \\times ' + fd(mev, 2) + ' = ' + fd(nHe * mev, 1) + '$ MeV.'], 'Find the energy for one helium atom first.', { unit: 'MeV', vf: { k: 'mev', n: nHe } });
      return P('Four hydrogen atoms ($1.007825$ u each) end up as one helium-4 atom ($4.002603$ u). How much energy, in MeV, does that release? ($1$ u of mass $= 931.5$ MeV.)', num(mev, 3, 0.01),
        ['Mass before: $4 \\times 1.007825 = 4.031300$ u.', 'Mass lost: $4.031300 - 4.002603 = 0.028697$ u, which is $0.71\\%$ of the starting mass.', 'Energy: $0.028697 \\times 931.5 = ' + fd(mev, 1) + '$ MeV.'], 'Find the mass difference first.', { unit: 'MeV', vf: { k: 'mev' } });
    }
    var right = 'Nuclear fusion of hydrogen into helium in its core, which turns a little mass into energy';
    return P('What powers the Sun?', mc(right, wrongs(R, ['Burning, like a giant fire of gas', 'Nuclear fission of uranium in its core', 'Slowly shrinking, so gravity heats it', 'Electricity from its magnetic field', 'Heat left over from when it formed, slowly cooling'], 3)),
      ['Fire is chemical burning and needs oxygen; a Sun-sized fire would burn out in a few thousand years.', 'Shrinking would last only tens of millions of years, far less than Earth\'s 4.5-billion-year age.', 'In the core, at about 15 million K, hydrogen nuclei fuse into helium; $0.7\\%$ of the mass becomes energy by $E = mc^2$.'], 'Which source could last billions of years?', { vf: { k: 'mc' } });
  });

  G('astro.sun-lifetime', function (R, ctx) {
    var shape = by(ctx, R.pick(['simple', 'mc', 'simple']), R.pick(['full', 'coal', 'simple', 'mc']), R.pick(['full', 'star', 'coal']));
    if (shape === 'simple') {
      var E = R.int(5, 40) * 1e43, Lw = R.pick([3.83e26, 4e26, 1e26, 2e26, 8e26, 3.83e27, 5e26, 6e26, 1.5e27, 3e25, 3.5e+25, 5e+25, 7e+25, 9e+25, 1.5e+26, 3.5e+26, 9e+26, 1.2e+27, 2.5e+27, 3.5e+27]), ts = E / Lw, ty = ts / YR;
      return P('A star has $' + fx(E, 3) + '$ J of usable fusion energy and gives off $' + fx(Lw, 3) + '$ W. About how many years can it shine at that rate? (One year is $3.156 \\times 10^{7}$ s.)', num(ty, 3, 0.03),
        ['Time $= \\frac{\\text{energy}}{\\text{power}} = \\frac{' + fx(E, 3) + '}{' + fx(Lw, 3) + '} = ' + fx(ts, 3) + '$ s.', 'In years: $\\frac{' + fx(ts, 3) + '}{3.156 \\times 10^{7}} = ' + fx(ty, 2) + '$ years.'], 'Fuel ÷ rate of use.', { unit: 'yr', vf: { k: 'simple', E: E, L: Lw } });
    }
    if (shape === 'full') {
      var fr = R.pick([0.1, 0.1, 0.08, 0.12, 0.09, 0.11, 0.15]), Et = fr * 0.007 * MSUN * C * C, ty2 = Et / LSUN / YR;
      return P('Estimate the Sun\'s main-sequence lifetime. Only the core, about $' + fd(fr * 100, 0) + '\\%$ of the Sun\'s $1.99 \\times 10^{30}$ kg, gets hot enough to fuse; $0.7\\%$ of that mass becomes energy; and the Sun gives off $3.83 \\times 10^{26}$ W. ($c = 3.00 \\times 10^{8}$ m/s; $1$ yr $= 3.156 \\times 10^{7}$ s.)', num(ty2, 3, 0.04),
        ['Mass converted: $' + fd(fr, 2) + ' \\times 0.007 \\times 1.99 \\times 10^{30} = ' + fx(fr * 0.007 * MSUN, 3) + '$ kg.', 'Energy: $E = mc^2 = ' + fx(fr * 0.007 * MSUN, 3) + ' \\times 9.00 \\times 10^{16} = ' + fx(Et, 3) + '$ J.', 'Time: $\\frac{' + fx(Et, 3) + '}{3.83 \\times 10^{26}} = ' + fx(Et / LSUN, 3) + '$ s $= ' + fx(ty2, 2) + '$ years.'],
        'Fuel energy ÷ power, then convert to years.', { unit: 'yr', vf: { k: 'full', f: fr } });
    }
    if (shape === 'coal') {
      var ec = R.pick([3e7, 2.5e7, 2.4e7, 2.8e7, 3.2e7]), tc = MSUN * ec / LSUN / YR;
      return P('Suppose the Sun were a giant lump of coal, releasing $' + fx(ec, 2) + '$ J per kilogram when burned. With mass $1.99 \\times 10^{30}$ kg and power $3.83 \\times 10^{26}$ W, how many years could it shine? ($1$ yr $= 3.156 \\times 10^{7}$ s.)', num(tc, 3, 0.03),
        ['Energy: $1.99 \\times 10^{30} \\times ' + fx(ec, 2) + ' = ' + fx(MSUN * ec, 3) + '$ J.', 'Time: $\\frac{' + fx(MSUN * ec, 3) + '}{3.83 \\times 10^{26}} = ' + fx(MSUN * ec / LSUN, 3) + '$ s $\\approx ' + T.commas(rnd(tc, 2)) + '$ years.', 'Only a few thousand years, far shorter than the age of Earth\'s rocks, so the Sun cannot be burning: it must run on fusion.'],
        'Total energy ÷ power.', { unit: 'yr', vf: { k: 'coal', e: ec } });
    }
    if (shape === 'star') {
      var pair = R.pick([[2, 16], [3, 81], [0.5, 0.06], [4, 256], [0.8, 0.4], [1.5, 5], [6, 1300], [1.2, 2.1], [0.7, 0.24], [10, 10000], [5, 625], [2.5, 39], [1.1, 1.5], [1.3, 2.9], [0.9, 0.66], [3.5, 150], [7, 2400], [8, 4100]]), t2 = 10 * pair[0] / pair[1];
      return P('Stars burn about the same fraction of their mass on the main sequence, so a star\'s lifetime is about $10$ billion years $\\times \\dfrac{M}{L}$ (in solar units). How long does a star of $' + fd(pair[0], 2) + '$ solar masses and $' + T.commas(pair[1]) + '$ solar luminosities last, in billions of years?', num(t2, 3, 0.02),
        ['Fuel goes as $M$; the rate of use goes as $L$.', '$t = 10 \\times \\frac{' + fd(pair[0], 2) + '}{' + T.commas(pair[1]) + '} = ' + fx(t2, 3) + '$ billion years.', pair[0] > 1 ? 'More fuel, but used much faster: a shorter life.' : 'Less fuel, but used very slowly: a longer life.'],
        'Fuel ÷ rate, scaled to the Sun.', { unit: 'billion years', vf: { k: 'star', M: pair[0], L: pair[1] } });
    }
    var right = 'About 10 billion years in all; it is about 4.6 billion years old, and it will swell into a red giant, not explode';
    return P('How long will the Sun keep shining as it does now, and how will it end?', mc(right, wrongs(R, ['A few thousand more years, then it burns out like a fire', 'About 10 billion years, then it explodes as a supernova', 'Forever, because fusion never runs out', 'About 1 million years, then it becomes a black hole'], 3)),
      ['The Sun has fuel for about 10 billion years on the main sequence and has used a little under half.', 'It is far too light to explode as a supernova or become a black hole.', 'In about 5 billion years it will become a red giant, then shed its outer layers and end as a white dwarf.'], 'How much fuel, and how fast is it used?', { vf: { k: 'mc' } });
  });

  G('astro.solar-activity', function (R, ctx) {
    var shape = by(ctx, R.pick(['mc', 'cycle', 'mc']), R.pick(['ratio', 'cycle', 'mc', 'why']), R.pick(['ratio', 'cycle2', 'rot']));
    if (shape === 'mc') {
      var right = 'They are cooler than the surrounding surface, so they look dark next to it';
      return P('Why do sunspots look dark?', mc(right, wrongs(R, ['They are holes through which we see the dark interior', 'They are hotter than the rest of the surface', 'They are shadows of planets crossing the Sun', 'They are clouds of dust floating above the Sun'], 3)),
        ['Sunspots are about $3800$ to $4500$ K, against about $5800$ K for the rest of the photosphere.', 'Strong magnetic fields there hold back the hot gas rising from below, so the region cools.', 'A sunspot on its own would glow brightly; it only looks dark beside the hotter surface.'], 'Compare temperatures.', { vf: { k: 'mc' } });
    }
    if (shape === 'why') {
      return P('What causes sunspots?', mc('Strong, concentrated magnetic fields that block hot gas from rising', wrongs(R, ['Comets crashing into the Sun', 'The Sun running low on fuel in patches', 'The shadows of Mercury and Venus', 'Cold gas falling from the corona'], 3)),
        ['The Sun\'s gas is a plasma that drags magnetic field lines along as it moves.', 'Twisted fields burst through the surface in loops; where they come out, they block convection and cool the gas.'], 'Think about magnets and moving gas.', { vf: { k: 'mc' } });
    }
    if (shape === 'ratio') {
      var Ts = R.pick([3800, 4000, 4200, 4500, 3500, 3600, 3900, 4100, 4400, 4600]), Tp = R.pick([5800, 5772]), rr = M.pow(Ts / Tp, 4);
      return P('A sunspot is at $' + T.commas(Ts) + '$ K and the surrounding photosphere at $' + T.commas(Tp) + '$ K. Each square meter gives off power in proportion to $T^4$. What fraction of the surrounding brightness does the sunspot give off, per square meter?', num(rr, 3, 0.03),
        ['Ratio $= \\left(\\frac{' + T.commas(Ts) + '}{' + T.commas(Tp) + '}\\right)^4 = ' + fd(Ts / Tp, 3) + '^4$.', '$= ' + fd(rr, 2) + '$: only about $' + fd(rr * 100, 0) + '\\%$ as bright, so it looks dark by contrast, though it is still hotter than a lamp filament.'], 'Fourth power of the temperature ratio.', { vf: { k: 'ratio', a: Ts, b: Tp } });
    }
    if (shape === 'cycle' || shape === 'cycle2') {
      var y0 = R.pick([2001, 2014, 2025, 1989, 1979, 1968, 1958, 1947, 1937]), what = shape === 'cycle2' ? R.pick([['the third maximum after it', 33], ['the second maximum after it', 22], ['the next minimum', 5.5]]) : ['the next maximum', 11];
      return P('A solar maximum (the peak of sunspot activity) happened around ' + y0 + '. The cycle averages about 11 years, with minima about halfway between maxima. About how many years after ' + y0 + ' would ' + what[0] + ' come?', num(what[1], 3, 0.1),
        ['Maxima repeat about every 11 years (single cycles run from about 9 to 14 years).', what[1] === 5.5 ? 'A minimum comes about halfway along: $11 \\div 2 = 5.5$ years.' : '$' + what[1] / 11 + ' \\times 11 = ' + what[1] + '$ years.'], 'Count cycles of 11 years.', { unit: 'yr', vf: { k: 'cycle', v: what[1] } });
    }
    var dd = R.pick([25, 27]), frac = R.pick([0.25, 0.5]);
    return P('A sunspot near the Sun\'s equator takes about $' + dd + '$ days to go once around as seen from Earth. How many days does it take to cross ' + (frac === 0.5 ? 'from one edge of the visible disk to the other' : 'a quarter of the way around') + '?', num(dd * frac, 3, 0.02),
      ['One full turn takes ' + dd + ' days; ' + (frac === 0.5 ? 'the visible half is half a turn.' : 'a quarter turn is a quarter of that.'), '$' + dd + ' \\times ' + frac + ' = ' + fd(dd * frac, 2) + '$ days.', 'Sunspots let Galileo show that the Sun rotates.'], 'What fraction of a full turn?', { unit: 'days', vf: { k: 'rot', d: dd, f: frac } });
  });

// ---- 05_stars.js

  // =====================================================================================================
  // Unit 6: Measuring the Stars
  G('astro.parallax', function (R, ctx) {
    var shape = by(ctx, R.pick(['d', 'd', 'p']), R.pick(['d', 'ly', 'mas', 'mc', 'p']), R.pick(['mas', 'ly', 'ratio', 'au']));
    var named = [['Proxima Centauri', 0.768], ['Sirius', 0.379], ['Vega', 0.130], ['Altair', 0.195], ['Procyon', 0.285], ['Arcturus', 0.0888], ['Barnard\'s Star', 0.547], ['Polaris', 0.0075]];
    if (shape === 'd') {
      var s = R.chance(0.5) ? R.pick(named) : ['a star', R.int(2, 80) / 100], d = 1 / s[1];
      return P('The parallax of ' + s[0] + ' is $' + fd(s[1], 4) + '$ arcseconds. How far away is it, in parsecs?', num(d, 3, 0.01),
        ['$d\\,(\\text{pc}) = \\frac{1}{p\\,(\\text{arcsec})}$.', '$d = \\frac{1}{' + fd(s[1], 4) + '} = ' + fx(d, 3) + '$ pc.'], 'Distance is 1 over the parallax.', { unit: 'pc', vf: { k: 'd', p: s[1] } });
    }
    if (shape === 'p') {
      var dd = R.chance(0.3) ? 1.3 : R.int(2, 250);
      return P('A star is $' + dd + '$ parsecs away. What is its parallax, in arcseconds?', num(1 / dd, 3, 0.01),
        ['$p = \\frac{1}{d} = \\frac{1}{' + dd + '} = ' + fx(1 / dd, 3) + '$ arcseconds.', 'Every star\'s parallax is less than 1 arcsecond: even the nearest is more than 1 pc away.'], 'Parallax is 1 over the distance.', { unit: 'arcsec', vf: { k: 'p', d: dd } });
    }
    if (shape === 'ly') {
      var s2 = R.pick(named.slice(0, 7)), d2 = 1 / s2[1];
      return P('The parallax of ' + s2[0] + ' is $' + fd(s2[1], 4) + '$ arcseconds. How far away is it in light-years? ($1$ pc $= 3.26$ ly.)', num(d2 * PC_LY, 3, 0.01),
        ['$d = \\frac{1}{' + fd(s2[1], 4) + '} = ' + fd(d2, 3) + '$ pc.', '$' + fd(d2, 3) + ' \\times 3.26 = ' + fd(d2 * PC_LY, 3) + '$ light-years.'], 'Parsecs first, then convert.', { unit: 'ly', vf: { k: 'ly', p: s2[1] } });
    }
    if (shape === 'mas') {
      var m = R.chance(0.5) ? R.pick([1, 2, 4, 5, 8, 10, 20, 25, 40, 0.5, 0.6, 0.8, 0.9, 1.5, 3, 3.5, 7, 12, 15, 35]) : R.real(0.5, 60, 1);
      return P('The Gaia spacecraft measures a star\'s parallax as $' + fd(m, 2) + '$ milliarcseconds ($1$ mas $= 0.001$ arcsecond). How far away is the star, in parsecs?', num(1000 / m, 3, 0.01),
        ['$p = ' + fd(m, 2) + '$ mas $= ' + fd(m / 1000, 5) + '$ arcseconds.', '$d = \\frac{1}{' + fd(m / 1000, 5) + '} = ' + fx(1000 / m, 3) + '$ pc.'], 'Convert to arcseconds first.', { unit: 'pc', vf: { k: 'mas', m: m } });
    }
    if (shape === 'ratio') {
      var k = R.pick([2, 3, 4, 5, 10, 2.5, 6, 8, 20, 3.5, 7, 9, 12, 15]), big = R.coin();
      return P('Star A\'s parallax is $' + k + '$ times ' + (big ? 'larger' : 'smaller') + ' than star B\'s. How many times farther away is ' + (big ? 'star B than star A' : 'star A than star B') + '?', num(k, 3, 0.01),
        ['Distance is inversely proportional to parallax: $d = 1/p$.', big ? 'A\'s larger parallax means A is closer; B is ' + k + ' times farther.' : 'A\'s smaller parallax means A is farther: ' + k + ' times as far as B.'], 'A bigger shift means a closer star.', { vf: { k: 'ratio', r: k } });
    }
    if (shape === 'au') {
      return P('A parsec is the distance at which $1$ AU spans an angle of $1$ arcsecond. There are $3600$ arcseconds in a degree and $57.30$ degrees in a radian. How many AU are in a parsec?', num(206265, 4, 0.002),
        ['Small angles: angle (in radians) $= \\frac{\\text{size}}{\\text{distance}}$, so distance $= \\frac{1\\ \\text{AU}}{\\theta}$.', '$1$ arcsecond $= \\frac{1}{3600 \\times 57.30}$ radian $= \\frac{1}{206{,}280}$ radian.', 'So $1$ pc $\\approx 206{,}000$ AU (more precisely, $206{,}265$ AU).'], 'Turn 1 arcsecond into radians.', { unit: 'AU', vf: { k: 'au' } });
    }
    var right = 'Star A, because a larger parallax means a closer star';
    return P('Star A has a parallax of $0.3$ arcseconds and star B $0.1$ arcseconds. Which star is closer?', mc(right, ['Star B, because a smaller parallax means a closer star', 'They are the same distance, since parallax measures size', 'There is no way to tell without their brightness']),
      ['Parallax is the star\'s apparent shift as Earth goes around the Sun.', 'A near star shifts a lot against the background; a far one barely moves (hold a finger close to your face and blink: it jumps more than a distant post).', '$d = 1/p$: A is $3.3$ pc away, B is $10$ pc away.'], 'Hold a finger near your eye and blink.', { vf: { k: 'mc' } });
  });

  G('astro.brightness-distance', function (R, ctx) {
    var shape = by(ctx, R.pick(['ratio', 'ratio', 'mc']), R.pick(['flux', 'sameb', 'ratio', 'planet']), R.pick(['lum', 'flux', 'sameb', 'planet']));
    if (shape === 'ratio') {
      var k = R.chance(0.5) ? R.pick([2, 3, 4, 5, 10, 0.5, 1.5, 0.6, 0.8, 1, 2.5, 3.5, 7, 9]) : R.real(1.2, 9, 1), b = 1 / (k * k);
      return P('A star is moved to $' + fd(k, 2) + '$ times its distance from us. Its apparent brightness becomes what fraction of what it was?', num(b, 3, 0.01),
        ['Light spreads over a sphere of area $4\\pi d^2$, so brightness $b = \\frac{L}{4\\pi d^2} \\propto \\frac{1}{d^2}$.', '$\\frac{b_{\\text{new}}}{b_{\\text{old}}} = \\frac{1}{' + fd(k, 2) + '^2} = ' + fx(b, 3) + '$.'], 'Inverse square.', { vf: { k: 'ratio', k2: k } });
    }
    if (shape === 'flux' || shape === 'planet') {
      var pl = shape === 'flux' ? ['Earth', 1] : R.pick([['Mercury', 0.387], ['Venus', 0.723], ['Mars', 1.524], ['Jupiter', 5.20], ['Saturn', 9.54], ['Neptune', 30.1]]), dm = pl[1] * AU, f = LSUN / (4 * M.PI * dm * dm);
      return P('The Sun gives off $3.83 \\times 10^{26}$ W. How many watts of sunlight fall on each square meter at ' + pl[0] + '\'s distance, $' + fx(dm, 3) + '$ m (facing the Sun, above any air)?', num(f, 3, 0.02),
        ['$b = \\frac{L}{4\\pi d^2}$: the Sun\'s power spread over a sphere as big as the orbit.', '$4\\pi d^2 = 4\\pi (' + fx(dm, 3) + ')^2 = ' + fx(4 * M.PI * dm * dm, 3) + '\\ \\text{m}^2$.', '$b = \\frac{3.83 \\times 10^{26}}{' + fx(4 * M.PI * dm * dm, 3) + '} = ' + fx(f, 3) + '$ W/m².'],
        'Spread the power over a sphere.', { unit: 'W/m²', vf: { k: 'flux', d: dm } });
    }
    if (shape === 'sameb') {
      var Lr = R.chance(0.5) ? R.pick([4, 9, 16, 25, 100, 2, 10]) : R.int(3, 500);
      return P('Two stars look equally bright, but star A is $' + Lr + '$ times as luminous as star B. How many times farther away is star A?', num(M.sqrt(Lr), 3, 0.01),
        ['Equal brightness: $\\frac{L_A}{4\\pi d_A^2} = \\frac{L_B}{4\\pi d_B^2}$.', '$\\frac{d_A}{d_B} = \\sqrt{\\frac{L_A}{L_B}} = \\sqrt{' + Lr + '} = ' + fd(M.sqrt(Lr), 3) + '$.'], 'Set the two brightnesses equal.', { vf: { k: 'sameb', r: Lr } });
    }
    if (shape === 'lum') {
      var dpc = R.pick([5, 8, 10, 15, 20, 25, 40, 50, 100, 2, 3, 4, 6, 12, 30, 60, 200, 2.5, 3.5, 7, 9, 35, 70, 80, 90, 120, 150]), bb = R.int(1, 9) * R.pick([1e-8, 1e-9, 1e-10]), dmet = dpc * 3.086e16, Lw = 4 * M.PI * dmet * dmet * bb;
      return P('A star ' + dpc + ' pc away delivers $' + fx(bb, 2) + '$ W/m² to Earth. What is its luminosity, in watts? ($1$ pc $= 3.086 \\times 10^{16}$ m.)', num(Lw, 3, 0.02),
        ['$L = 4\\pi d^2 b$.', '$d = ' + dpc + ' \\times 3.086 \\times 10^{16} = ' + fx(dmet, 4) + '$ m.', '$L = 4\\pi (' + fx(dmet, 4) + ')^2 \\times ' + fx(bb, 2) + ' = ' + fx(Lw, 3) + '$ W, about $' + fx(Lw / LSUN, 2) + '$ times the Sun.'],
        'Solve b = L/(4πd²) for L.', { unit: 'W', vf: { k: 'lum', d: dmet, b: bb } });
    }
    var right = 'A quarter as bright, because the same light spreads over four times the area';
    return P('If the Sun were twice as far away, how bright would it look?', mc(right, ['Half as bright, because brightness falls with distance', 'Just as bright, because its power is the same', 'One-eighth as bright, because brightness falls with the cube of distance']),
      ['The light spreads over a sphere whose area grows as $d^2$.', 'Twice as far: $2^2 = 4$ times the area, so each square meter gets a quarter as much light.'], 'Think of light spreading over a growing sphere.', { viz: { name: 'ph-cosmic', opts: { mode: 'inverse-square', d: 2, interactive: false, quiet: true } }, vf: { k: 'mc' } });
  });

  G('astro.magnitudes', function (R, ctx) {
    var shape = by(ctx, R.pick(['which', 'five', 'five']), R.pick(['one', 'five', 'ratio2m', 'which']), R.pick(['one', 'ratio2m', 'dist']));
    if (shape === 'which') {
      var a = R.real(-1.5, 4, 1), b = fix(a + R.real(0.3, 5, 1)), first = R.coin();
      var mA = first ? a : b, mB = first ? b : a, br = mA < mB ? 'A' : 'B';
      return P('Star A has magnitude $' + fd(mA, 1) + '$ and star B has magnitude $' + fd(mB, 1) + '$. Which looks brighter?', mc('Star ' + br, ['Star ' + (br === 'A' ? 'B' : 'A'), 'They look equally bright', 'You cannot tell from magnitudes']),
        ['On the magnitude scale, <b>smaller</b> numbers mean <b>brighter</b> stars (it began as "first-class" stars being the brightest).', 'Star ' + br + ' has the smaller magnitude, so it looks brighter.'], 'Smaller magnitude = brighter.', { vf: { k: 'mc' } });
    }
    if (shape === 'five') {
      var dm = R.pick([5, 10, 15, 20, 2.5, 7.5, 1, 2, 3, 4, 6, 8, 12.5, 1.2, 1.5, 3.5, 7, 9, 12]), r = M.pow(10, dm / 2.5);
      return P('Two stars differ by $' + fd(dm, 1) + '$ magnitudes. How many times brighter is the brighter one? (Every $5$ magnitudes is a factor of $100$.)', num(r, 3, 0.01),
        ['$5$ magnitudes $= 100\\times$, so each $2.5$ magnitudes is $\\sqrt{100} = 10\\times$.', '$' + fd(dm, 1) + '$ magnitudes $= ' + fd(dm / 2.5, 0) + '$ steps of $2.5$: $10^{' + fd(dm / 2.5, 0) + '} = ' + T.commas(r) + '$.'], 'Count steps of 5 (factor 100) or 2.5 (factor 10).', { vf: { k: 'dm', dm: dm } });
    }
    if (shape === 'one') {
      var d1 = R.chance(0.5) ? R.pick([1, 2, 3, 4, 6, 1.5, 1.2, 2.5, 3.5, 5]) : R.real(0.5, 7, 1), r1 = M.pow(100, d1 / 5);
      return P('Star A is magnitude $' + fd(1 + d1, 1) + '$ and star B is magnitude $1.0$. How many times brighter is star B? (Brightness ratio $= 100^{\\Delta m / 5}$.)', num(r1, 3, 0.01),
        ['$\\Delta m = ' + fd(1 + d1, 1) + ' - 1.0 = ' + fd(d1, 1) + '$.', 'Ratio $= 100^{' + fd(d1, 1) + '/5} = 2.512^{' + fd(d1, 1) + '} = ' + fd(r1, 3) + '$.', 'Star B (the smaller magnitude) is the brighter one.'], 'Each magnitude is a factor of about 2.512.', { vf: { k: 'dm', dm: d1 } });
    }
    if (shape === 'ratio2m') {
      var rr = R.chance(0.5) ? R.pick([10, 100, 1000, 10000, 1e6, 2.512, 6.31, 40]) : R.int(3, 900), dmm = 2.5 * M.log10(rr);
      return P('One star is $' + T.commas(rr) + '$ times brighter than another. How many magnitudes apart are they? ($\\Delta m = 2.5 \\log_{10}$ of the brightness ratio.)', num(dmm, 3, 0.01),
        ['$\\Delta m = 2.5 \\log_{10}(' + T.commas(rr) + ')$.', '$\\log_{10}(' + T.commas(rr) + ') = ' + fd(M.log10(rr), 3) + '$, so $\\Delta m = ' + fd(dmm, 2) + '$.'], 'Each factor of 10 is 2.5 magnitudes.', { vf: { k: 'r2m', r: rr } });
    }
    var f = R.pick([10, 100, 2, 4, 1000]);
    return P('A star is moved from $10$ pc to $' + T.commas(10 * f) + '$ pc away. By how many magnitudes does it get fainter?', num(5 * M.log10(f), 3, 0.01),
      ['Brightness goes as $1/d^2$: ' + f + ' times as far means $' + T.commas(f * f) + '$ times fainter.', '$\\Delta m = 2.5 \\log_{10}(' + T.commas(f * f) + ') = ' + fd(5 * M.log10(f), 2) + '$ magnitudes (that is, $5\\log_{10}$ of the distance ratio).'], 'Inverse square first, then convert to magnitudes.', { vf: { k: 'dist', f: f } });
  });

  var CLS = [['O', 30000, 50000], ['B', 10000, 30000], ['A', 7500, 10000], ['F', 6000, 7500], ['G', 5200, 6000], ['K', 3700, 5200], ['M', 2400, 3700]];
  G('astro.spectral-classes', function (R, ctx) {
    var shape = by(ctx, R.pick(['order', 'hot', 'sun']), R.pick(['classify', 'order', 'hlines', 'hot']), R.pick(['classify', 'compare', 'hlines']));
    var tab = 'O: above $30{,}000$ K; B: $10{,}000$ to $30{,}000$ K; A: $7500$ to $10{,}000$ K; F: $6000$ to $7500$ K; G: $5200$ to $6000$ K; K: $3700$ to $5200$ K; M: below $3700$ K';
    if (shape === 'order') {
      var right = 'O, B, A, F, G, K, M';
      return P('Which list puts the spectral classes in order from hottest to coolest?', mc(right, wrongs(R, ['A, B, F, G, K, M, O', 'M, K, G, F, A, B, O', 'O, A, B, F, G, M, K', 'B, A, F, G, K, M, O', 'A, F, G, B, K, M, O'], 3)),
        ['The classes were first ordered by the strength of hydrogen lines (A strongest), then rearranged by temperature once spectra were understood.', 'Hottest to coolest: O, B, A, F, G, K, M.'], 'It is not alphabetical.', { vf: { k: 'mc' } });
    }
    if (shape === 'hot' || shape === 'compare') {
      var two = R.sample(CLS, 2), hot = CLS.indexOf(two[0]) < CLS.indexOf(two[1]) ? two[0] : two[1];
      return P('Which is hotter: a class ' + two[0][0] + ' star or a class ' + two[1][0] + ' star?', mc('class ' + hot[0], ['class ' + (hot === two[0] ? two[1][0] : two[0][0]), 'they are the same temperature', 'it depends on how big they are']),
        ['From hottest to coolest the classes run O, B, A, F, G, K, M.', 'Class ' + hot[0] + ' comes earlier in that list, so it is hotter.'], 'O is hottest; M is coolest.', { vf: { k: 'mc' } });
    }
    if (shape === 'sun') {
      return P('The Sun\'s surface is about $5800$ K. Using the table (' + tab + '), what is its spectral class?', mc('G', ['K', 'A', 'M', 'F', 'O', 'B'].slice(0, 3)),
        ['$5800$ K lies between $5200$ and $6000$ K.', 'That is class G. (The Sun is G2.)'], 'Find the row that contains 5800 K.', { vf: { k: 'mc' } });
    }
    if (shape === 'classify') {
      var c = R.pick(CLS), T0 = c[0] === 'O' ? R.pick([35000, 40000]) : c[0] === 'M' ? R.pick([3000, 3200, 3500]) : rnd((c[1] + c[2]) / 2 + R.int(-2, 2) * (c[2] - c[1]) / 10, 2);
      var others = CLS.map(function (x) { return x[0]; }).filter(function (x) { return x !== c[0]; });
      return P('A star\'s surface temperature is $' + T.commas(T0) + '$ K. Using the table (' + tab + '), what is its spectral class?', mc(c[0], wrongs(R, others, 3)),
        ['Find the temperature range that contains $' + T.commas(T0) + '$ K.', 'It falls in class ' + c[0] + '.'], 'Look along the table.', { vf: { k: 'mc' } });
    }
    return P('Hydrogen\'s visible (Balmer) lines are strongest in which class of star?', mc('A stars, near 10,000 K', wrongs(R, ['O stars, the hottest', 'M stars, the coolest', 'G stars, like the Sun', 'All classes equally'], 3)),
      ['Balmer lines need hydrogen atoms with an electron already in level 2.', 'In cool stars almost all electrons sit in level 1; in the hottest stars the hydrogen is ionized and has no electron at all.', 'The balance is best near $10{,}000$ K: class A. So line strength depends on temperature, not just on what the star is made of.'], 'Too cold, the electron sits in level 1; too hot, it is knocked off.', { viz: { name: 'ph-spectrum', opts: { mode: 'classes', interactive: false, quiet: true } }, vf: { k: 'mc' } });
  });

  G('astro.hr-diagram', function (R, ctx) {
    var shape = by(ctx, R.pick(['where', 'axis']), R.pick(['pic', 'where', 'radius', 'axis']), R.pick(['pic', 'radius', 'radius2']));
    if (shape === 'axis') {
      var right = 'Temperature increases to the left: hot stars are on the left';
      return P('On a standard H–R diagram, which way does surface temperature increase along the horizontal axis?', mc(right, ['Temperature increases to the right, like a normal graph', 'Temperature increases upward', 'Temperature is the vertical axis']),
        ['By tradition, H–R diagrams put the hottest (blue, class O) stars on the left and the coolest (red, class M) on the right.', 'Luminosity increases upward.'], 'O stars are drawn on the left.', { viz: { name: 'ph-hr', opts: { mode: 'diagram', interactive: false, quiet: true, hide: ['labels'] } }, vf: { k: 'mc' } });
    }
    if (shape === 'where') {
      var w = R.pick([['hot but very dim', 'lower left: the white dwarfs'], ['cool but very luminous', 'upper right: the giants and supergiants'], ['like the Sun, burning hydrogen in its core', 'the main sequence, the band from upper left to lower right'], ['cool and very dim, burning hydrogen in its core', 'lower right end of the main sequence: red dwarfs']]);
      var pool = ['lower left: the white dwarfs', 'upper right: the giants and supergiants', 'the main sequence, the band from upper left to lower right', 'lower right end of the main sequence: red dwarfs', 'upper left end of the main sequence: hot, massive stars'];
      return P('Where on the H–R diagram is a star that is ' + w[0] + '?', mc(w[1], wrongs(R, pool, 3, w[1])),
        ['Hot is left, cool is right; luminous is up, dim is down.', 'So: ' + w[1] + '.', 'Using $L = R^2T^4$: hot but dim means tiny; cool but luminous means huge.'], 'Hot is left; bright is up.', { vf: { k: 'mc' } });
    }
    if (shape === 'pic') {
      var stars = ['Sun', 'Sirius B', 'Betelgeuse', 'Proxima Centauri', 'Rigel', 'Vega'], show = R.sample(stars, 4), tags = {}; show.forEach(function (s, i) { tags[s] = 'ABCD'[i]; });
      var qs = [['a white dwarf', 'Sirius B'], ['a red supergiant', 'Betelgeuse'], ['a red dwarf on the main sequence', 'Proxima Centauri'], ['a blue supergiant', 'Rigel'], ['a main-sequence star hotter than the Sun', 'Vega'], ['a main-sequence star like the Sun', 'Sun']].filter(function (q) { return show.indexOf(q[1]) >= 0; }), q = R.pick(qs);
      return P('Four stars are tagged A to D on the H–R diagram. Which one is ' + q[0] + '?', { t: 'mc', choices: ['A', 'B', 'C', 'D'], v: show.indexOf(q[1]), keep: true },
        ['Read each star\'s place: left is hot, right is cool, up is luminous, down is dim.', q[0][0].toUpperCase() + q[0].slice(1) + ' sits ' + { 'Sirius B': 'low on the left: hot but very dim, so tiny', 'Betelgeuse': 'high on the right: cool but hugely luminous, so huge', 'Proxima Centauri': 'low on the right end of the main sequence', 'Rigel': 'high on the left: hot and hugely luminous', 'Vega': 'on the main sequence, above and left of the Sun', 'Sun': 'in the middle of the main sequence' }[q[1]] + '.', 'That is star ' + 'ABCD'[show.indexOf(q[1])] + '.'],
        'Hot is left; bright is up.', { viz: { name: 'ph-hr', opts: { mode: 'diagram', interactive: false, quiet: true, hide: ['labels', 'regions'], highlight: show, tags: tags } }, vf: { k: 'mc' } });
    }
    if (shape === 'radius' || shape === 'radius2') {
      var Lk = R.pick([100, 400, 10000, 0.01, 0.0001, 2500]), sameT = shape === 'radius' || R.coin(), Tk = sameT ? 1 : R.pick([0.5, 2]), Rv = M.sqrt(Lk) / (Tk * Tk);
      return P('A star ' + (sameT ? 'has the same surface temperature as the Sun' : 'has ' + fd(Tk, 1) + ' times the Sun\'s surface temperature') + ' but is $' + T.commas(Lk) + '$ times as luminous. How many times the Sun\'s radius is it? (Use $L = R^2T^4$ in solar units.)', num(Rv, 3, 0.01),
        ['$R = \\frac{\\sqrt{L}}{T^2} = \\frac{\\sqrt{' + T.commas(Lk) + '}}{' + fd(Tk, 1) + '^2}$.', '$R = ' + fx(Rv, 3) + '$ solar radii.', Rv > 5 ? 'Large: it sits above the main sequence, among the giants.' : Rv < 0.1 ? 'Tiny: it sits below the main sequence, among the white dwarfs.' : 'Sun-sized.'],
        'Solve L = R²T⁴ for R.', { unit: 'R☉', vf: { k: 'radius', L: Lk, T: Tk } });
    }
  });

  G('astro.binary-stars', function (R, ctx) {
    var shape = by(ctx, R.pick(['total', 'total', 'ratio']), R.pick(['total', 'split', 'vel', 'mc']), R.pick(['split', 'vel2', 'total']));
    var combos = [[2, 1], [4, 2], [4, 4], [6, 6], [8, 8], [10, 10], [9, 9], [4, 8], [20, 50], [10, 20], [5, 5], [3, 1], [16, 16], [12, 24]];
    if (shape === 'total') {
      var c = R.pick(combos), Mt = c[0] * c[0] * c[0] / (c[1] * c[1]);
      return P('Two stars orbit each other with a separation (semi-major axis) of $' + c[0] + '$ AU and a period of $' + c[1] + '$ years. What is their combined mass, in solar masses?', num(Mt, 3, 0.01),
        ['Newton\'s form of Kepler\'s law: $M_1 + M_2 = \\frac{a^3}{P^2}$ (solar masses, AU, years).', '$\\frac{' + c[0] + '^3}{' + c[1] + '^2} = \\frac{' + T.commas(c[0] * c[0] * c[0]) + '}{' + c[1] * c[1] + '} = ' + fd(Mt, 3) + '$.'], 'a³ ÷ P².', { unit: 'M☉', vf: { k: 'total', a: c[0], p: c[1] } });
    }
    if (shape === 'ratio') {
      var r1 = R.pick([1, 2, 3, 4, 5, 6]), r2 = r1 * R.pick([2, 3, 4, 1.5, 2.5, 5, 3.5]);
      return P('In a binary star, star A stays $' + r1 + '$ AU from the center of mass and star B $' + fd(r2, 2) + '$ AU from it. How many times more massive is star A than star B?', num(r2 / r1, 3, 0.01),
        ['The center of mass is the balance point: $M_A r_A = M_B r_B$.', '$\\frac{M_A}{M_B} = \\frac{r_B}{r_A} = \\frac{' + fd(r2, 2) + '}{' + r1 + '} = ' + fd(r2 / r1, 2) + '$.', 'The heavier star stays closer to the center, like the heavier child on a seesaw.'], 'Like a seesaw.', { vf: { k: 'ratio', a: r1, b: r2 } });
    }
    if (shape === 'split') {
      var c2 = R.pick(combos.filter(function (x) { return x[0] * x[0] * x[0] / (x[1] * x[1]) >= 2; })), Mt2 = c2[0] * c2[0] * c2[0] / (c2[1] * c2[1]), q = R.pick([1, 2, 3, 4]), big = Mt2 * q / (q + 1);
      return P('Two stars orbit each other with $a = ' + c2[0] + '$ AU and $P = ' + c2[1] + '$ years. ' + (q === 1 ? 'The two stars are the same distance from their center of mass.' : 'Star B is $' + q + '$ times as far from their center of mass as star A is.') + ' What is star A\'s mass, in solar masses?', num(big, 3, 0.01),
        ['Total mass: $\\frac{a^3}{P^2} = \\frac{' + T.commas(c2[0] * c2[0] * c2[0]) + '}{' + c2[1] * c2[1] + '} = ' + fd(Mt2, 3) + '\\ M_\\odot$.', 'Seesaw rule: $\\frac{M_A}{M_B} = \\frac{r_B}{r_A} = ' + q + '$.', 'So $M_A = ' + fd(Mt2, 3) + ' \\times \\frac{' + q + '}{' + (q + 1) + '} = ' + fd(big, 3) + '\\ M_\\odot$.'],
        'Total from Kepler; split with the seesaw rule.', { unit: 'M☉', vf: { k: 'split', a: c2[0], p: c2[1], q: q } });
    }
    if (shape === 'vel' || shape === 'vel2') {
      var v1 = R.pick([10, 15, 20, 30, 40, 5, 8, 12, 25, 50, 6, 7, 9, 35]), v2 = v1 * R.pick([2, 3, 1.5, 4, 2.5, 5, 3.5]);
      if (shape === 'vel2') {
        var tot = R.pick([2, 3, 4, 5, 6, 8, 1.5, 2.5, 3.5, 10, 7, 9]), mA = tot * v2 / (v1 + v2);
        return P('In a binary, Doppler shifts show star A moving at $' + v1 + '$ km/s and star B at $' + v2 + '$ km/s around their center of mass. Their total mass is $' + tot + '$ solar masses. What is star A\'s mass?', num(mA, 3, 0.01),
          ['Both stars take the same time to go around, so speed is proportional to orbit size: $\\frac{M_A}{M_B} = \\frac{v_B}{v_A} = ' + fd(v2 / v1, 2) + '$.', '$M_A = ' + tot + ' \\times \\frac{' + v2 + '}{' + v1 + ' + ' + v2 + '} = ' + fd(mA, 3) + '\\ M_\\odot$.'], 'The slower star is the heavier one.', { unit: 'M☉', vf: { k: 'vel2', v1: v1, v2: v2, M: tot } });
      }
      return P('In a binary, star A moves at $' + v1 + '$ km/s and star B at $' + v2 + '$ km/s around their center of mass. How many times more massive is star A?', num(v2 / v1, 3, 0.01),
        ['Same period, so each star\'s speed is proportional to its distance from the center of mass.', 'Seesaw rule: $\\frac{M_A}{M_B} = \\frac{v_B}{v_A} = \\frac{' + v2 + '}{' + v1 + '} = ' + fd(v2 / v1, 2) + '$.'], 'Heavier stars move less.', { vf: { k: 'vel', v1: v1, v2: v2 } });
    }
    var right = 'Mass: the more massive a main-sequence star, the hotter and more luminous it is';
    return P('Binary-star masses showed what changes along the main sequence. What is it?', mc(right, wrongs(R, ['Age: stars slide down the main sequence as they get older', 'Distance: farther stars sit lower on the main sequence', 'Composition: hotter stars are made of different elements', 'Size only: mass is the same for all main-sequence stars'], 3)),
      ['Weighing binaries with $M_1 + M_2 = a^3/P^2$ showed a tight link for main-sequence stars: luminosity rises steeply with mass, roughly as $M^{3.5}$.', 'So the main sequence is a sequence of mass: massive stars at the hot, bright upper left, small ones at the cool, dim lower right.', 'A star stays near the same spot for most of its life.'], 'What did weighing binary stars reveal?', { viz: { name: 'ph-hr', opts: { mode: 'mass-luminosity', interactive: false, quiet: true } }, vf: { k: 'mc' } });
  });

// ---- 06_lives.js

  // =====================================================================================================
  // Unit 7: The Lives of Stars
  G('astro.star-formation', function (R, ctx) {
    var shape = by(ctx, R.pick(['order', 'where', 'stop']), R.pick(['ir', 'stop', 'brown', 'mc', 'count']), R.pick(['ir', 'brown', 'count', 'order']));
    if (shape === 'order') {
      var right = 'cold cloud → collapsing clump → protostar heating up → hydrogen fusion begins → main-sequence star';
      return P('Which is the right order of events in the birth of a star?', mc(right, wrongs(R, ['protostar → cold cloud → main-sequence star → fusion begins', 'fusion begins → cold cloud collapses → protostar → main-sequence star', 'main-sequence star → protostar → cold cloud', 'cold cloud → fusion begins in the cloud → collapse → protostar'], 3)),
        ['Gravity pulls a dense clump of a cold cloud inward.', 'As it shrinks, it heats up (gravitational energy turns into heat): a protostar, glowing in infrared.', 'When its core reaches about 10 million K, hydrogen fusion starts, the outward pressure balances gravity, and it settles onto the main sequence.'], 'Gravity first, fusion last.', { vf: { k: 'mc' } });
    }
    if (shape === 'where') {
      return P('Where do new stars form?', mc('In cold, dense clouds of gas and dust, at only about 10 to 20 K', wrongs(R, ['In the hot outer layers of old stars', 'In the leftover rubble of planets', 'In empty space far from any gas', 'Inside the cores of other stars'], 3)),
        ['Gravity can only win if the gas is cold (low pressure) and dense.', 'Giant molecular clouds, at about 10 to 20 K, are the coldest, densest places in a galaxy: the Orion Nebula is a nearby example of a star nursery.'], 'Think about what helps gravity win.', { vf: { k: 'mc' } });
    }
    if (shape === 'stop') {
      return P('What stops a protostar from collapsing further and makes it a stable star?', mc('Fusion in its core supplies heat, so the gas pressure pushing out balances gravity pulling in', wrongs(R, ['Its solid iron core holds it up', 'Its spin flings matter outward forever', 'Its magnetic field pushes the gas out', 'It runs out of gas to pull in'], 3)),
        ['A shrinking protostar heats up but also leaks energy away, so it keeps shrinking.', 'Once fusion starts, the core makes as much energy as the surface radiates.', 'The hot gas then pushes out just hard enough to balance gravity: hydrostatic equilibrium. The star is gas all the way through.'], 'What keeps the core hot without shrinking?', { vf: { k: 'mc' } });
    }
    if (shape === 'ir') {
      var Tp = R.pick([10, 20, 30, 50, 100, 300, 500, 1000, 2000, 12, 25, 60, 90, 150, 250, 600, 900, 1500]), lu = 2900 / Tp;
      return P('A ' + (Tp < 100 ? 'cold cloud core' : 'young protostar wrapped in dust') + ' glows at about $' + T.commas(Tp) + '$ K. At what wavelength, in micrometers, does its glow peak? (Wien\'s law: $\\lambda_{\\text{peak}} = \\dfrac{2900\\ \\mu\\text{m·K}}{T}$.)', num(lu, 3, 0.02),
        ['$\\lambda_{\\text{peak}} = \\frac{2900}{' + T.commas(Tp) + '} = ' + fx(lu, 3) + '\\ \\mu$m.', lu > 3 ? 'That is infrared (or longer): invisible to the eye, so star birth is studied with infrared and radio telescopes such as the James Webb Space Telescope and ALMA.' : 'Near infrared: telescopes like the James Webb Space Telescope can see it through the dust.'],
        'Wien\'s law with T in kelvins.', { unit: 'μm', vf: { k: 'ir', T: Tp } });
    }
    if (shape === 'brown') {
      return P('The smallest objects that can fuse ordinary hydrogen have about $0.08$ solar masses. The Sun has $1047$ times Jupiter\'s mass. About how many Jupiter masses is that limit?', num(0.08 * 1047, 3, 0.02),
        ['$0.08 \\times 1047 = ' + fd(0.08 * 1047, 1) + '$ Jupiter masses.', 'Lighter objects never get hot enough in their cores for hydrogen fusion: they are brown dwarfs, glowing faintly as they slowly cool.'], 'Multiply.', { vf: { k: 'brown' } });
    }
    if (shape === 'count') {
      var Mc = R.pick([1e4, 5e4, 1e5, 2e5, 1e6, 12000, 35000, 90000, 400000, 900000]), f = R.pick([0.01, 0.02, 0.05, 0.1, 0.012, 0.03, 0.06, 0.09]), avg = R.pick([0.5, 1]);
      return P('A molecular cloud has $' + fx(Mc, 1) + '$ solar masses of gas. If $' + fd(f * 100, 0) + '\\%$ of it turns into stars with an average mass of $' + fd(avg, 1) + '$ solar masses, about how many stars form?', num(Mc * f / avg, 3, 0.02),
        ['Mass turned into stars: $' + fd(f, 2) + ' \\times ' + fx(Mc, 1) + ' = ' + fx(Mc * f, 2) + '$ solar masses.', 'Number of stars: $' + fx(Mc * f, 2) + ' \\div ' + fd(avg, 1) + ' = ' + fx(Mc * f / avg, 2) + '$.', 'Stars are born in clusters, from one cloud, at nearly the same time.'],
        'Find the mass that becomes stars first.', { vf: { k: 'count', M: Mc, f: f, a: avg } });
    }
    return P('Which statement about where stars come from is true?', mc('Stars form from clouds of gas and dust collapsing under their own gravity', wrongs(R, ['Stars form from the leftover pieces of planets', 'Stars split off from older stars', 'Stars form when two planets collide', 'All the stars formed at the same moment and none form today'], 3)),
      ['Stars form when dense parts of cold gas clouds collapse under gravity.', 'Planets form afterward, from the disk around a new star, not the other way around.', 'Stars are still forming today, for example in the Orion Nebula.'], 'Which comes first, stars or planets?', { vf: { k: 'mc' } });
  });

  G('astro.main-sequence-lifetime', function (R, ctx) {
    var shape = by(ctx, R.pick(['ML', 'ML', 'mc']), R.pick(['pow', 'ML', 'Lfrom', 'mc']), R.pick(['pow', 'ratio', 'Lfrom']));
    if (shape === 'ML') {
      var mm0 = R.chance(0.4) ? R.pick([2, 3, 5, 10, 0.5, 1.5, 4, 20, 0.6, 0.8, 1, 2.5, 3.5, 7, 9, 15]) : R.real(0.6, 15, 1), pr = [mm0, rnd(mm0 < 0.43 ? 0.23 * M.pow(mm0, 2.3) : mm0 < 2 ? M.pow(mm0, 4) : 1.4 * M.pow(mm0, 3.5), 2)], t = 10 * pr[0] / pr[1], useMy = t < 1;
      return P('A main-sequence star has $' + fd(pr[0], 2) + '$ times the Sun\'s mass and $' + T.commas(pr[1]) + '$ times its luminosity. The Sun lasts about $10$ billion years. How long does this star last, in ' + (useMy ? 'millions' : 'billions') + ' of years? (Lifetime $\\propto$ fuel $\\div$ rate $= M/L$.)', num(useMy ? t * 1000 : t, 3, 0.02),
        ['$t = 10\\ \\text{billion years} \\times \\frac{M}{L} = 10 \\times \\frac{' + fd(pr[0], 2) + '}{' + T.commas(pr[1]) + '}$.', '$t = ' + fx(t, 3) + '$ billion years' + (useMy ? ' $= ' + fx(t * 1000, 3) + '$ million years.' : '.')],
        'Fuel ÷ rate, scaled to the Sun.', { unit: useMy ? 'million years' : 'billion years', vf: { k: 'ML', M: pr[0], L: pr[1], my: useMy } });
    }
    if (shape === 'pow') {
      var m = R.chance(0.6) ? R.pick([4, 9, 16, 25, 0.25, 1.21, 2.25, 6.25, 1.44, 1.69, 0.81, 0.64]) : R.real(1.1, 12, 1), tt = 10 * M.pow(m, -2.5), my = tt < 1;
      return P('Main-sequence lifetimes go roughly as $t = 10\\ \\text{billion years} \\times M^{-2.5}$ ($M$ in solar masses). How long does a $' + fd(m, 2) + '$-solar-mass star last, in ' + (my ? 'millions' : 'billions') + ' of years?', num(my ? tt * 1000 : tt, 3, 0.02),
        ['$M^{2.5} = M^2\\sqrt{M} = ' + fd(m, 2) + '^2 \\times \\sqrt{' + fd(m, 2) + '} = ' + fd(M.pow(m, 2.5), 4) + '$.', '$t = \\frac{10}{' + fd(M.pow(m, 2.5), 4) + '} = ' + fx(tt, 3) + '$ billion years' + (my ? ' $= ' + fx(tt * 1000, 3) + '$ million years.' : '.'), m > 1 ? 'More massive, much shorter life.' : 'Less massive, longer than the present age of the universe.'],
        'A perfect square makes M^2.5 easy: M² × √M.', { unit: my ? 'million years' : 'billion years', vf: { k: 'pow', M: m, my: my } });
    }
    if (shape === 'Lfrom') {
      var m2 = R.chance(0.5) ? R.pick([2, 4, 9, 16, 0.25, 0.5, 3]) : R.real(1.2, 8, 1), Lm = M.pow(m2, 3.5);
      return P('For main-sequence stars, luminosity grows roughly as $L = M^{3.5}$ (solar units). About how many times as luminous as the Sun is a $' + fd(m2, 2) + '$-solar-mass star?', num(Lm, 3, 0.02),
        ['$L = ' + fd(m2, 2) + '^{3.5} = ' + fd(m2, 2) + '^3 \\times \\sqrt{' + fd(m2, 2) + '} = ' + fx(Lm, 3) + '$.', m2 > 1 ? 'A star with ' + fd(m2, 2) + ' times the fuel burns it ' + fx(Lm, 3) + ' times as fast.' : 'Much dimmer than the Sun: it sips its fuel.'],
        'M^3.5 = M³ × √M.', { unit: 'L☉', vf: { k: 'Lfrom', M: m2 } });
    }
    if (shape === 'ratio') {
      var a = R.pick([1, 2, 4, 0.5, 3, 0.6, 0.8, 1.2, 1.5, 3.5]), b = a * R.pick([4, 9, 2.25, 16, 6.25, 1.44, 25]), rr = M.pow(b / a, 2.5);
      return P('Star A has $' + fd(a, 2) + '$ solar masses and star B $' + fd(b, 2) + '$ solar masses. Using $t \\propto M^{-2.5}$, how many times longer does star A live than star B?', num(rr, 3, 0.02),
        ['$\\frac{t_A}{t_B} = \\left(\\frac{M_B}{M_A}\\right)^{2.5} = ' + fd(b / a, 2) + '^{2.5}$.', '$= ' + fd(b / a, 2) + '^2 \\times \\sqrt{' + fd(b / a, 2) + '} = ' + fx(rr, 3) + '$.'], 'The lighter star lives longer.', { vf: { k: 'ratio', a: a, b: b } });
    }
    var right = 'The 10-solar-mass star dies first: it has 10 times the fuel but burns it thousands of times faster';
    return P('A 1-solar-mass star and a 10-solar-mass star are born together. Which runs out of core hydrogen first?', mc(right, ['The 1-solar-mass star, because it has less fuel', 'They die at the same time, because they were born together', 'The 10-solar-mass star lives longer, because it has more fuel']),
      ['Luminosity rises steeply with mass, about as $M^{3.5}$: $10^{3.5} \\approx 3200$ times the Sun.', 'Lifetime $\\propto \\frac{M}{L} = \\frac{10}{3200}$ of the Sun\'s: about $30$ million years against $10$ billion.', 'Massive stars live fast and die young.'], 'Compare fuel with burn rate.', { vf: { k: 'mc' } });
  });

  G('astro.red-giants', function (R, ctx) {
    var shape = by(ctx, R.pick(['sun', 'next', 'radius']), R.pick(['radius', 'au', 'wd', 'next']), R.pick(['wd', 'spoon', 'au']));
    if (shape === 'sun') {
      return P('How will the Sun end its life?', mc('It will swell into a red giant, shed its outer layers, and leave a white dwarf about the size of Earth', wrongs(R, ['It will explode as a supernova', 'It will collapse into a black hole', 'It will collapse into a neutron star', 'It will cool off slowly while staying the same size'], 3)),
        ['Supernovae, neutron stars and black holes need stars of more than about 8 solar masses.', 'The Sun will become a red giant, fuse helium into carbon and oxygen, then gently puff off its outer layers as a planetary nebula.', 'Its exposed core, a white dwarf, will slowly cool over billions of years.'], 'How massive must a star be to explode?', { vf: { k: 'mc' } });
    }
    if (shape === 'next') {
      return P('When a Sun-like star runs out of hydrogen in its core, what happens next?', mc('The core shrinks and heats up, hydrogen fuses in a shell around it, and the outer layers swell and cool: a red giant', wrongs(R, ['The star immediately explodes', 'The star shrinks straight down to a white dwarf', 'The star cools and fades out like a dying fire', 'The core starts fusing iron'], 3)),
        ['With no fusion in the core, gravity squeezes it; it heats up.', 'Hydrogen around the core then fuses in a shell, faster than before, and the extra energy puffs the outer layers out to enormous size.', 'The surface cools and reddens while the star grows far more luminous. Later the core reaches about 100 million K and fuses helium into carbon.'], 'What does gravity do to a core with no fusion?', { vf: { k: 'mc' } });
    }
    if (shape === 'radius' || shape === 'au') {
      var c = R.pick([[100, 0.7], [400, 0.65], [1000, 0.6], [2500, 0.55], [200, 0.75], [3000, 0.6], [150, 0.7], [600, 0.6], [1500, 0.58], [5000, 0.55], [800, 0.65]]), Rr = M.sqrt(c[0]) / (c[1] * c[1]), au = Rr * RSUN / AU;
      if (shape === 'au') return P('A red giant has $' + T.commas(c[0]) + '$ times the Sun\'s luminosity and $' + fd(c[1], 2) + '$ of its surface temperature. Its radius in solar radii is $R = \\sqrt{L}/T^2$. How big is that in AU? (The Sun\'s radius is $6.96 \\times 10^{5}$ km and $1$ AU $= 1.496 \\times 10^{8}$ km.)', num(au, 3, 0.02),
        ['$R = \\frac{\\sqrt{' + T.commas(c[0]) + '}}{' + fd(c[1], 2) + '^2} = ' + fd(Rr, 3) + '$ solar radii.', '$1$ solar radius $= \\frac{6.96 \\times 10^{5}}{1.496 \\times 10^{8}} = 0.00465$ AU.', '$' + fd(Rr, 3) + ' \\times 0.00465 = ' + fd(au, 3) + '$ AU.', au > 0.39 ? 'Larger than Mercury\'s orbit.' : 'Still inside Mercury\'s orbit, but over a hundred times the Sun\'s size.'],
        'Find R in solar radii, then convert.', { unit: 'AU', vf: { k: 'au', L: c[0], T: c[1] } });
      return P('A red giant is $' + T.commas(c[0]) + '$ times as luminous as the Sun with $' + fd(c[1], 2) + '$ of the Sun\'s surface temperature. How many times the Sun\'s radius is it? ($L = R^2T^4$ in solar units.)', num(Rr, 3, 0.02),
        ['$R = \\frac{\\sqrt{L}}{T^2} = \\frac{\\sqrt{' + T.commas(c[0]) + '}}{' + fd(c[1], 2) + '^2} = \\frac{' + fd(M.sqrt(c[0]), 3) + '}{' + fd(c[1] * c[1], 4) + '}$.', '$R = ' + fd(Rr, 3) + '$ solar radii: cooler than the Sun, yet far more luminous, because it is enormous.'],
        'Solve L = R²T⁴ for R.', { unit: 'R☉', vf: { k: 'radius', L: c[0], T: c[1] } });
    }
    if (shape === 'wd' || shape === 'spoon') {
      var Mw = R.pick([0.5, 0.6, 0.7, 0.8, 1.0, 0.55, 0.65, 0.9, 1.1, 1.2]), Rk = R.pick([5000, 6000, 7000, 8000, 5500, 6500, 7500, 9000, 10000]), rho = Mw * MSUN / (4 / 3 * M.PI * M.pow(Rk * 1000, 3));
      if (shape === 'spoon') return P('A white dwarf has $' + fd(Mw, 1) + '$ solar masses packed into a radius of $' + T.commas(Rk) + '$ km. What is the mass of one cubic centimeter of its matter, in kg? ($M_\\odot = 1.99 \\times 10^{30}$ kg; $1\\ \\text{cm}^3 = 10^{-6}\\ \\text{m}^3$.)', num(rho * 1e-6, 3, 0.03),
        ['Volume: $\\frac{4}{3}\\pi (' + fx(Rk * 1000, 2) + ')^3 = ' + fx(4 / 3 * M.PI * M.pow(Rk * 1000, 3), 3) + '\\ \\text{m}^3$.', 'Density: $\\frac{' + fd(Mw, 1) + ' \\times 1.99 \\times 10^{30}}{' + fx(4 / 3 * M.PI * M.pow(Rk * 1000, 3), 3) + '} = ' + fx(rho, 3) + '$ kg/m³.', 'One cubic centimeter: $' + fx(rho, 3) + ' \\times 10^{-6} = ' + fx(rho * 1e-6, 3) + '$ kg, about the mass of a car in a sugar cube.'],
        'Find the density in kg/m³, then take a millionth.', { unit: 'kg', vf: { k: 'spoon', M: Mw, R: Rk } });
      return P('A white dwarf has $' + fd(Mw, 1) + '$ solar masses in a radius of $' + T.commas(Rk) + '$ km. What is its average density in kg/m³? ($M_\\odot = 1.99 \\times 10^{30}$ kg.)', num(rho, 3, 0.03),
        ['Mass: $' + fd(Mw, 1) + ' \\times 1.99 \\times 10^{30} = ' + fx(Mw * MSUN, 3) + '$ kg.', 'Volume: $\\frac{4}{3}\\pi (' + fx(Rk * 1000, 2) + ')^3 = ' + fx(4 / 3 * M.PI * M.pow(Rk * 1000, 3), 3) + '\\ \\text{m}^3$.', 'Density $= ' + fx(rho, 3) + '$ kg/m³, about a million times that of water.'],
        'Mass ÷ volume, with the radius in meters.', { unit: 'kg/m³', vf: { k: 'wd', M: Mw, R: Rk } });
    }
  });

  G('astro.star-cluster-ages', function (R, ctx) {
    var shape = by(ctx, R.pick(['which', 'age', 'mc']), R.pick(['age', 'mto', 'pic', 'which']), R.pick(['mto', 'pic', 'age']));
    if (shape === 'age') {
      var m = R.pick([1, 1.21, 1.44, 2.25, 4, 9, 16, 6.25, 0.81, 1.69, 1.96, 3.24, 0.64]), t = 10 * M.pow(m, -2.5), my = t < 1;
      return P('A star cluster\'s main sequence ends (its turnoff) at stars of $' + fd(m, 2) + '$ solar masses. Using $t = 10\\ \\text{billion years} \\times M^{-2.5}$, how old is the cluster, in ' + (my ? 'millions' : 'billions') + ' of years?', num(my ? t * 1000 : t, 3, 0.02),
        ['All the cluster\'s stars formed together. The turnoff stars are just now running out of core hydrogen, so the cluster\'s age equals their lifetime.', '$M^{2.5} = ' + fd(m, 2) + '^{2.5} = ' + fd(M.pow(m, 2.5), 4) + '$, so $t = 10 \\div ' + fd(M.pow(m, 2.5), 4) + ' = ' + fx(t, 3) + '$ billion years' + (my ? ' $= ' + fx(t * 1000, 3) + '$ million years.' : '.')],
        'The age is the lifetime of the turnoff stars.', { unit: my ? 'million years' : 'billion years', vf: { k: 'age', M: m, my: my } });
    }
    if (shape === 'mto') {
      var m2 = R.pick([1, 1.21, 1.44, 2.25, 4, 9, 0.81, 1.69, 1.96, 2.56, 6.25, 16]), age = rnd(10 * M.pow(m2, -2.5), 3), mt = M.pow(10 / age, 0.4);
      return P('A cluster is $' + fd(age, 4) + '$ billion years old. Using $t = 10\\ \\text{billion years} \\times M^{-2.5}$, what is the mass of the stars at its main-sequence turnoff?', num(mt, 3, 0.02),
        ['Set the lifetime equal to the age: $10\\,M^{-2.5} = ' + fd(age, 4) + '$, so $M^{2.5} = \\frac{10}{' + fd(age, 4) + '} = ' + fd(10 / age, 4) + '$.', '$M = (' + fd(10 / age, 4) + ')^{1/2.5} = (' + fd(10 / age, 4) + ')^{0.4} = ' + fd(mt, 3) + '$ solar masses.', 'Stars heavier than that have already left the main sequence.'],
        'Solve for M with the power 1/2.5 = 0.4.', { unit: 'M☉', vf: { k: 'mto', age: age } });
    }
    if (shape === 'which') {
      var pair = R.pick([['B', 'G'], ['A', 'K'], ['O', 'F'], ['B', 'F'], ['A', 'G']]), first = R.coin();
      return P('In cluster X the main sequence still reaches up to class ' + (first ? pair[0] : pair[1]) + ' stars; in cluster Y it stops at class ' + (first ? pair[1] : pair[0]) + '. Which cluster is older?', mc('Cluster ' + (first ? 'Y' : 'X'), ['Cluster ' + (first ? 'X' : 'Y'), 'They are the same age', 'You cannot tell without their distances']),
        ['Hot, massive stars (O, B, A) burn out first.', 'A cluster that still has class ' + pair[0] + ' stars on its main sequence is young; one whose main sequence ends at class ' + pair[1] + ' has already lost its hotter stars, so it is older.'], 'Which stars disappear first?', { vf: { k: 'mc' } });
    }
    if (shape === 'pic') {
      var ages = R.shuffle([0.05, 0.4, 2, 10]), old = R.coin(), target = old ? 10 : 0.05;
      return P('The four H–R diagrams A to D show four star clusters. Which cluster is ' + (old ? 'oldest' : 'youngest') + '?', { t: 'mc', choices: ['A', 'B', 'C', 'D'], v: ages.indexOf(target), keep: true },
        ['As a cluster ages, its most massive stars leave the main sequence first, so the main sequence is eaten away from the top.', old ? 'The oldest cluster has the shortest main sequence, ending at cool, dim stars.' : 'The youngest cluster still has hot, bright stars at the top of its main sequence.', 'That is diagram ' + 'ABCD'[ages.indexOf(target)] + '.'],
        'Look at how high each main sequence reaches.', { viz: { name: 'ph-hr', opts: { mode: 'cluster', interactive: false, quiet: true, panel: ages.map(function (a) { return { age: a }; }) } }, vf: { k: 'mc' } });
    }
    return P('Why can the turnoff point of a cluster\'s main sequence tell its age?', mc('All its stars formed at about the same time, and the more massive ones run out of fuel sooner', wrongs(R, ['Its stars formed at different times, and the turnoff marks the newest one', 'Stars slide down the main sequence as they age', 'The turnoff marks the cluster\'s distance, which grows with age', 'Older clusters are hotter overall'], 3)),
      ['A cluster\'s stars were born together from one cloud, with many different masses.', 'Massive stars burn out first. The heaviest stars still on the main sequence are just reaching the end of their lives.', 'Their lifetime equals the cluster\'s age.'], 'Same birthday, different masses.', { vf: { k: 'mc' } });
  });

  var BPN2 = { 'He-4': 7.0739, 'C-12': 7.6801, 'O-16': 7.9762, 'Ne-20': 8.0322, 'Mg-24': 8.2607, 'Si-28': 8.4477, 'S-32': 8.4931, 'Ni-56': 8.6428, 'Fe-56': 8.7903 };
  G('astro.supernovae', function (R, ctx) {
    var shape = by(ctx, R.pick(['iron', 'which', 'light']), R.pick(['fuse', 'iron', 'elements', 'light']), R.pick(['fuse', 'crab', 'elements']));
    if (shape === 'iron') {
      return P('Why does fusion stop at iron in the core of a massive star?', mc('Iron nuclei are the most tightly bound, so fusing iron absorbs energy instead of releasing it', wrongs(R, ['Iron is too heavy for gravity to squeeze', 'The star runs out of iron to fuse', 'Iron is magnetic and pushes other nuclei away', 'Iron nuclei are too cold to move'], 3)),
        ['Fusion releases energy only while the products are more tightly bound (more binding energy per nucleon) than the fuel.', 'Binding energy per nucleon peaks near iron and nickel, about $8.8$ MeV.', 'Fusing iron would take energy out of the core, so the core loses its support and collapses in less than a second.'], 'Look at the binding-energy curve.', { viz: { name: 'ph-nucleus', opts: { mode: 'binding', interactive: false, quiet: true } }, vf: { k: 'mc' } });
    }
    if (shape === 'which') {
      return P('Which stars end their lives in core-collapse supernovae?', mc('Stars of more than about 8 solar masses', wrongs(R, ['All stars, including the Sun', 'Only stars smaller than the Sun', 'Only red dwarfs', 'Stars of exactly one solar mass'], 3)),
        ['Only a massive star\'s core gets hot enough to fuse carbon, neon, oxygen and silicon, all the way to iron.', 'Its iron core then collapses and the star explodes.', 'Lower-mass stars like the Sun end as white dwarfs instead.'], 'Think about which cores can reach iron.', { vf: { k: 'mc' } });
    }
    if (shape === 'light') {
      var s = R.pick([['SN 1987A, in the Large Magellanic Cloud', 168000, 1987], ['the supernova of 1054 that made the Crab Nebula', 6500, 1054], ['Kepler\'s supernova of 1604', 20000, 1604], ['Tycho\'s supernova of 1572', 8000, 1572]]);
      return P('Light from ' + s[0] + ' traveled about $' + T.commas(s[1]) + '$ light-years to reach Earth in ' + s[2] + '. How many years before ' + s[2] + ' did the star actually explode?', num(s[1], 3, 0.01),
        ['Light covers one light-year per year.', 'So the explosion happened about $' + T.commas(s[1]) + '$ years before we saw it.'], 'A light-year is a distance light covers in a year.', { unit: 'yr', vf: { k: 'light', d: s[1] } });
    }
    if (shape === 'fuse') {
      var rx = R.pick([['3 He-4', 'C-12', 3, 'He-4', 12], ['2 C-12', 'Mg-24', 2, 'C-12', 24], ['2 O-16', 'S-32', 2, 'O-16', 32], ['C-12 + He-4', 'O-16', 0, 'mix', 16], ['2 Si-28', 'Ni-56', 2, 'Si-28', 56]]);
      var before = rx[3] === 'mix' ? 12 * BPN2['C-12'] + 4 * BPN2['He-4'] : rx[4] * BPN2[rx[3]], after = rx[4] * BPN2[rx[1]], Q = after - before;
      var bText = rx[3] === 'mix' ? 'C-12 ($' + BPN2['C-12'] + '$ MeV per nucleon) and He-4 ($' + BPN2['He-4'] + '$)' : rx[3] + ' ($' + BPN2[rx[3]] + '$ MeV per nucleon)';
      return P('In a massive star\'s core, ' + rx[0] + ' fuse into ' + rx[1] + '. Binding energies per nucleon: ' + bText + ', ' + rx[1] + ' ($' + BPN2[rx[1]] + '$ MeV per nucleon). How much energy, in MeV, does one such fusion release?', num(Q, 3, 0.02),
        ['Energy released $=$ binding energy after $-$ binding energy before (the products are held together more tightly).', 'Before: ' + (rx[3] === 'mix' ? '$12 \\times ' + BPN2['C-12'] + ' + 4 \\times ' + BPN2['He-4'] + ' = ' + fd(before, 3) + '$ MeV.' : '$' + rx[4] + ' \\times ' + BPN2[rx[3]] + ' = ' + fd(before, 3) + '$ MeV.') + ' After: $' + rx[4] + ' \\times ' + BPN2[rx[1]] + ' = ' + fd(after, 3) + '$ MeV.', 'Released: $' + fd(after, 3) + ' - ' + fd(before, 3) + ' = ' + fd(Q, 2) + '$ MeV. Each step up to iron and nickel releases energy; beyond iron, fusion would absorb it.'],
        'Total binding = nucleons × binding per nucleon.', { unit: 'MeV', vf: { k: 'fuse', rx: rx[0] + ' -> ' + rx[1] } });
    }
    if (shape === 'crab') {
      var rly = R.pick([5, 5.5, 6]), v = R.pick([1300, 1500, 1700]), tyr = rly * LY / (v * 1000) / YR;
      return P('The Crab Nebula, the wreck of a supernova, has a radius of about $' + fd(rly, 1) + '$ light-years and its gas is flying outward at about $' + T.commas(v) + '$ km/s. If it has always expanded at that speed, how many years ago did the star explode? ($1$ ly $= 9.46 \\times 10^{15}$ m; $1$ yr $= 3.156 \\times 10^{7}$ s.)', num(tyr, 3, 0.03),
        ['Radius in meters: $' + fd(rly, 1) + ' \\times 9.46 \\times 10^{15} = ' + fx(rly * LY, 3) + '$ m.', 'Time $= \\frac{\\text{distance}}{\\text{speed}} = \\frac{' + fx(rly * LY, 3) + '}{' + fx(v * 1000, 2) + '} = ' + fx(rly * LY / (v * 1000), 3) + '$ s.', 'In years: $' + fx(tyr, 3) + '$, close to the Chinese record of a new star in 1054.'],
        'Time = distance ÷ speed.', { unit: 'yr', vf: { k: 'crab', r: rly, v: v } });
    }
    var el = R.pick([['the iron in your blood', 'made in stars and spread by supernovae'], ['the calcium in your bones', 'made in massive stars and spread by supernovae'], ['the oxygen you breathe', 'made in stars and spread by supernovae and stellar winds'], ['the hydrogen in water', 'made in the Big Bang']]);
    return P('Where did ' + el[0] + ' come from?', mc('It was ' + el[1], wrongs(R, ['It was ' + (el[1] === 'made in the Big Bang' ? 'made in supernovae' : 'made in the Big Bang'), 'It formed inside Earth from lighter elements', 'It was made in the Sun and blown to Earth', 'It has always existed in its present form'], 3)),
      ['Hydrogen and most helium date from the Big Bang.', 'Heavier elements, from carbon to iron, were forged by fusion in stars, and the biggest stars spread them through space when they exploded as supernovae.', 'The Sun is too young to have made the heavy elements on Earth; they were already in the cloud the solar system formed from.'], 'Only hydrogen and helium are older than the stars.', { vf: { k: 'mc' } });
  });

  G('astro.neutron-stars', function (R, ctx) {
    var shape = by(ctx, R.pick(['pulse', 'mc', 'period']), R.pick(['density', 'speed', 'pulse', 'mc']), R.pick(['density', 'spinup', 'speed']));
    if (shape === 'pulse') {
      return P('Why do pulsars send us regular pulses?', mc('A spinning neutron star sweeps beams of radiation across Earth, like a lighthouse', wrongs(R, ['The star swells and shrinks once each pulse', 'The star is orbited by a planet that blocks it', 'The star explodes over and over', 'The star switches its fusion on and off'], 3)),
        ['A neutron star has a strong magnetic field, and beams of radiation stream out along its magnetic poles.', 'The magnetic axis is tilted from the spin axis, so as the star spins the beams sweep around.', 'If a beam crosses Earth, we see a pulse once per turn, as regular as a clock.'], 'Think of a lighthouse.', { viz: { name: 'astro-pulsar', opts: { interactive: false, quiet: true, t: 0.15 } }, vf: { k: 'mc' } });
    }
    if (shape === 'period') {
      var n = R.pick([30, 11, 2, 0.5, 100, 641, 716, 4, 1, 3, 7.5, 10, 20, 50, 174, 300]);
      return P('A pulsar sends $' + n + '$ pulses per second, one per turn. How long is its spin period, in seconds?', num(1 / n, 3, 0.01),
        ['Period $= \\frac{1}{\\text{frequency}} = \\frac{1}{' + n + '}$ s.', '$= ' + fx(1 / n, 3) + '$ s.'], 'Period is 1 over the number per second.', { unit: 's', vf: { k: 'period', n: n } });
    }
    if (shape === 'density') {
      var m = R.pick([1.2, 1.4, 1.6, 2.0, 1.3, 1.5, 1.8, 1.9]), rk = R.pick([10, 11, 12, 13, 14]), rho = m * MSUN / (4 / 3 * M.PI * M.pow(rk * 1000, 3));
      return P('A neutron star has $' + fd(m, 1) + '$ solar masses in a radius of $' + rk + '$ km. What is its average density, in kg/m³? ($M_\\odot = 1.99 \\times 10^{30}$ kg.)', num(rho, 3, 0.03),
        ['Mass: $' + fd(m, 1) + ' \\times 1.99 \\times 10^{30} = ' + fx(m * MSUN, 3) + '$ kg.', 'Volume: $\\frac{4}{3}\\pi (' + fx(rk * 1000, 2) + ')^3 = ' + fx(4 / 3 * M.PI * M.pow(rk * 1000, 3), 3) + '\\ \\text{m}^3$.', 'Density $= ' + fx(rho, 3) + '$ kg/m³: a sugar cube of it would have a mass of hundreds of millions of tonnes, like the density of an atomic nucleus.'],
        'Mass ÷ volume.', { unit: 'kg/m³', vf: { k: 'density', M: m, R: rk } });
    }
    if (shape === 'speed') {
      var P0 = R.pick([0.0334, 0.089, 0.00156, 0.25, 1.0, 0.0014, 0.005, 0.01, 0.05, 0.1, 0.5, 2.0]), rk2 = R.pick([10, 12, 11, 13]), v = 2 * M.PI * rk2 * 1000 / P0;
      return P('A neutron star of radius $' + rk2 + '$ km spins once every $' + fd(P0, 4) + '$ s. How fast does a point on its equator move, in m/s?', num(v, 3, 0.02),
        ['Distance per turn: $2\\pi r = 2\\pi \\times ' + fx(rk2 * 1000, 2) + ' = ' + fx(2 * M.PI * rk2 * 1000, 3) + '$ m.', '$v = \\frac{' + fx(2 * M.PI * rk2 * 1000, 3) + '}{' + fd(P0, 4) + '} = ' + fx(v, 3) + '$ m/s' + (v > 3e7 ? ', more than a tenth of the speed of light.' : '.')],
        'Circumference ÷ period.', { unit: 'm/s', vf: { k: 'speed', P: P0, R: rk2 } });
    }
    if (shape === 'spinup') {
      var r0 = R.pick([5000, 6000, 7000, 4000, 7500, 8000]), day = R.pick([1, 2, 5, 10, 3, 7, 25]), f = r0 / 10, Pn = day * 86400 / (f * f);
      return P('A star\'s core of radius $' + T.commas(r0) + '$ km, spinning once every ' + day + ' day' + (day > 1 ? 's' : '') + ', collapses to a neutron star of radius $10$ km, keeping its angular momentum ($r^2\\omega$ fixed). What is its new spin period, in seconds?', num(Pn, 3, 0.02),
        ['$r^2\\omega$ fixed means $\\omega \\propto \\frac{1}{r^2}$: the core spins $\\left(\\frac{' + T.commas(r0) + '}{10}\\right)^2 = ' + T.commas(f * f) + '$ times faster.', 'Old period: $' + day + ' \\times 86{,}400 = ' + T.commas(day * 86400) + '$ s.', 'New period: $\\frac{' + T.commas(day * 86400) + '}{' + T.commas(f * f) + '} = ' + fx(Pn, 3) + '$ s. Collapse alone makes neutron stars spin fast.'],
        'Like a skater pulling in her arms, squared.', { unit: 's', vf: { k: 'spinup', r0: r0, d: day } });
    }
    return P('Which statement about neutron stars is true?', mc('A neutron star packs more than the Sun\'s mass into a ball about 20 km across', wrongs(R, ['A neutron star is as big as the Sun but made of neutrons', 'Neutron stars are planets made of neutrons', 'Neutron stars shine because they fuse neutrons', 'Neutron stars are the cores of red giants that are still burning'], 3)),
      ['In a core-collapse supernova the core is crushed until electrons and protons merge into neutrons.', 'The result has about 1.2 to 2 solar masses in a sphere roughly 20 to 25 km across: city-sized.', 'Neutron pressure, not fusion, holds it up.'], 'How small can matter be squeezed?', { vf: { k: 'mc' } });
  });

  G('astro.black-holes', function (R, ctx) {
    var shape = by(ctx, R.pick(['rs', 'rs', 'mc']), R.pick(['rs', 'mass', 'sgr', 'mc']), R.pick(['sgr', 'earth', 'vesc', 'mass']));
    if (shape === 'rs') {
      var m = R.chance(0.3) ? R.pick([3, 5, 8, 10, 15, 20, 30, 60, 1, 1.2, 2, 2.5, 4, 6, 9, 25, 35, 50]) : R.int(3, 80), rs = 2 * GN * m * MSUN / (C * C) / 1000;
      return P('What is the event-horizon radius $R_s = \\dfrac{2GM}{c^2}$ of a black hole of $' + m + '$ solar mass' + (m > 1 ? 'es' : '') + '? Give it in km. ($G = 6.674 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg, $c = 3.00 \\times 10^{8}$ m/s.)', num(rs, 3, 0.02),
        ['$M = ' + m + ' \\times 1.99 \\times 10^{30} = ' + fx(m * MSUN, 3) + '$ kg.', '$R_s = \\frac{2 \\times 6.674 \\times 10^{-11} \\times ' + fx(m * MSUN, 3) + '}{(3.00 \\times 10^{8})^2} = ' + fx(rs * 1000, 3) + '$ m.', 'That is $' + fd(rs, 1) + '$ km: about $2.95$ km for each solar mass.'],
        'Plug into 2GM/c² with SI units.', { unit: 'km', vf: { k: 'rs', M: m } });
    }
    if (shape === 'mass') {
      var r = R.int(9, 300), mm = r * 1000 * C * C / (2 * GN) / MSUN;
      return P('A black hole\'s event horizon has a radius of $' + r + '$ km. What is its mass in solar masses? ($R_s = \\dfrac{2GM}{c^2}$, $G = 6.674 \\times 10^{-11}$, $c = 3.00 \\times 10^{8}$ m/s, $M_\\odot = 1.99 \\times 10^{30}$ kg.)', num(mm, 3, 0.02),
        ['$M = \\frac{R_s c^2}{2G} = \\frac{' + fx(r * 1000, 2) + ' \\times 9.00 \\times 10^{16}}{2 \\times 6.674 \\times 10^{-11}} = ' + fx(mm * MSUN, 3) + '$ kg.', 'In solar masses: $\\frac{' + fx(mm * MSUN, 3) + '}{1.99 \\times 10^{30}} = ' + fx(mm, 3) + '$.'],
        'Solve R = 2GM/c² for M.', { unit: 'M☉', vf: { k: 'mass', r: r } });
    }
    if (shape === 'sgr') {
      var ms = R.pick([4.3e6, 4.0e6, 6.5e9]), rsm = 2 * GN * ms * MSUN / (C * C), au = rsm / AU, nm = ms > 1e9 ? 'the black hole in the galaxy M87' : 'Sagittarius A*, the black hole at the center of the Milky Way';
      return P(nm[0].toUpperCase() + nm.slice(1) + ' has about $' + fx(ms, 2) + '$ solar masses. What is its event-horizon radius, in AU? ($R_s = 2GM/c^2$; $M_\\odot = 1.99 \\times 10^{30}$ kg; $1$ AU $= 1.496 \\times 10^{11}$ m.)', num(au, 3, 0.02),
        ['$R_s = \\frac{2GM}{c^2} = \\frac{2 \\times 6.674 \\times 10^{-11} \\times ' + fx(ms * MSUN, 3) + '}{9.00 \\times 10^{16}} = ' + fx(rsm, 3) + '$ m.', 'In AU: $\\frac{' + fx(rsm, 3) + '}{1.496 \\times 10^{11}} = ' + fx(au, 3) + '$ AU.', au < 1 ? 'Smaller than Mercury\'s orbit, for millions of Suns\' worth of mass.' : 'Bigger than our whole planetary system: the Event Horizon Telescope photographed its shadow in 2019.'],
        'Kilograms first, then 2GM/c², then AU.', { unit: 'AU', vf: { k: 'sgr', M: ms } });
    }
    if (shape === 'earth') {
      var rse = 2 * GN * MEARTH / (C * C) * 1000;
      return P('How small would Earth ($5.97 \\times 10^{24}$ kg) have to be squeezed to become a black hole? Find $R_s = 2GM/c^2$ in millimeters.', num(rse, 3, 0.02),
        ['$R_s = \\frac{2 \\times 6.674 \\times 10^{-11} \\times 5.97 \\times 10^{24}}{(3.00 \\times 10^{8})^2} = ' + fx(rse / 1000, 3) + '$ m.', 'That is about $' + fd(rse, 1) + '$ mm: the size of a marble.'], 'Same formula, Earth\'s mass.', { unit: 'mm', vf: { k: 'earth' } });
    }
    if (shape === 'vesc') {
      var mv = R.int(3, 40), r2 = 2 * GN * mv * MSUN / (C * C), ve = M.sqrt(2 * GN * mv * MSUN / r2);
      return P('For a ' + mv + '-solar-mass black hole, $R_s = ' + fx(r2, 3) + '$ m. Use $v_{\\text{esc}} = \\sqrt{2GM/r}$ to find the escape speed from that distance, in m/s. ($G = 6.674 \\times 10^{-11}$, $M_\\odot = 1.99 \\times 10^{30}$ kg.)', num(ve, 3, 0.02),
        ['$2GM = 2 \\times 6.674 \\times 10^{-11} \\times ' + fx(mv * MSUN, 3) + ' = ' + fx(2 * GN * mv * MSUN, 3) + '$.', '$v_{\\text{esc}} = \\sqrt{\\frac{' + fx(2 * GN * mv * MSUN, 3) + '}{' + fx(r2, 3) + '}} = ' + fx(ve, 3) + '$ m/s.', 'Exactly the speed of light: that is what defines the event horizon.'],
        'Escape speed at the horizon.', { unit: 'm/s', vf: { k: 'vesc', M: mv, r: r2 } });
    }
    var right = 'Earth would keep orbiting exactly as it does now, because the mass and distance are unchanged';
    return P('If the Sun were suddenly replaced by a black hole of the same mass, what would happen to Earth\'s orbit?', mc(right, ['Earth would be sucked into the black hole', 'Earth would fly off in a straight line', 'Earth\'s orbit would shrink slowly into a spiral']),
      ['Far from a black hole, its gravity is the same as any object of the same mass: $F = GMm/r^2$.', 'Earth is $1$ AU away; a 1-solar-mass black hole\'s horizon is only $3$ km across.', 'Earth\'s orbit would not change (though without sunlight, Earth would freeze). Black holes are not cosmic vacuum cleaners.'], 'Does gravity depend on what the mass is made of?', { vf: { k: 'mc' } });
  });

// ---- 07_universe.js

  // =====================================================================================================
  // Unit 8: Galaxies and the Universe
  G('astro.milky-way', function (R, ctx) {
    var shape = by(ctx, R.pick(['cross', 'where', 'band']), R.pick(['orbit', 'cross', 'where', 'mc']), R.pick(['orbit', 'laps', 'center']));
    if (shape === 'cross') {
      var d = R.pick([100000, 26000, 1000, 120000, 50000, 4000, 8000, 15000, 30000, 75000]);
      return P('How many years does light take to travel $' + T.commas(d) + '$ light-years' + (d === 26000 ? ', from the center of the Milky Way to us' : d >= 100000 ? ', across the Milky Way\'s disk' : '') + '?', num(d, 3, 0.01),
        ['A light-year is the distance light travels in one year.', 'So $' + T.commas(d) + '$ light-years takes $' + T.commas(d) + '$ years.'], 'Light-years and years match up.', { unit: 'yr', vf: { k: 'cross', d: d } });
    }
    if (shape === 'orbit' || shape === 'laps') {
      var r = R.pick([25000, 26000, 27000, 24000, 28000]), v = R.pick([200, 220, 230, 240, 210, 250]), Ty = 2 * M.PI * r * LY / (v * 1000) / YR;
      if (shape === 'laps') return P('The Sun orbits the galaxy\'s center $' + T.commas(r) + '$ light-years away at $' + v + '$ km/s, taking about $' + fx(Ty, 2) + '$ years per orbit. The Sun is about $4.6 \\times 10^{9}$ years old. How many times has it gone around?', num(4.6e9 / rnd(Ty, 2), 3, 0.05),
        ['Number of orbits $= \\frac{\\text{age}}{\\text{period}} = \\frac{4.6 \\times 10^{9}}{' + fx(Ty, 2) + '}$.', '$\\approx ' + fd(4.6e9 / rnd(Ty, 2), 0) + '$ orbits.'], 'Age ÷ period.', { vf: { k: 'laps', T: rnd(Ty, 2) } });
      return P('The Sun orbits the center of the Milky Way at a distance of $' + T.commas(r) + '$ light-years and a speed of $' + v + '$ km/s. How many years does one orbit take? ($1$ ly $= 9.46 \\times 10^{15}$ m; $1$ yr $= 3.156 \\times 10^{7}$ s.)', num(Ty, 3, 0.03),
        ['Radius: $' + T.commas(r) + ' \\times 9.46 \\times 10^{15} = ' + fx(r * LY, 3) + '$ m.', 'Path: $2\\pi r = ' + fx(2 * M.PI * r * LY, 3) + '$ m; speed $' + fx(v * 1000, 2) + '$ m/s.', 'Time $= ' + fx(2 * M.PI * r * LY / (v * 1000), 3) + '$ s $= ' + fx(Ty, 3) + '$ years.'],
        'Circumference ÷ speed, then convert to years.', { unit: 'yr', vf: { k: 'orbit', r: r, v: v } });
    }
    if (shape === 'where') {
      return P('Where is the Sun in the Milky Way?', mc('In the disk, about 26,000 light-years from the center, in a minor spiral arm', wrongs(R, ['At the exact center of the galaxy', 'Far outside the galaxy, looking at it from above', 'In the central bulge, near the black hole', 'At the very outer edge of the disk'], 3)),
        ['Star counts once suggested we were near the center, because dust hides the distant stars.', 'Mapping globular clusters (Harlow Shapley, 1918) and later radio and infrared surveys showed the center lies about 26,000 light-years away, in Sagittarius.'], 'Dust hides most of the galaxy from view.', { vf: { k: 'mc' } });
    }
    if (shape === 'band') {
      return P('Why does the Milky Way look like a faint band of light across the night sky?', mc('We live inside a flat disk of stars, so looking along the disk we see millions of distant stars blurred together', wrongs(R, ['It is a single giant cloud of glowing gas near the Sun', 'It is the edge of the whole universe', 'It is light from the Sun scattered by dust in the solar system', 'It is a ring of stars that surrounds the solar system'], 3)),
        ['Our galaxy is a thin disk about 100,000 light-years across, and we are inside it.', 'Looking along the disk, we see a band packed with faint, distant stars; looking out of the disk, we see far fewer.', 'Galileo first saw with a telescope that the band is made of countless stars.'], 'What do you see looking along a flat disk from inside it?', { vf: { k: 'mc' } });
    }
    if (shape === 'center') {
      var Mbh = 4.3e6, rau = R.pick([1000, 1200, 950, 800, 900, 1100, 1500, 2000]), Py = M.sqrt(rau * rau * rau / Mbh);
      return P('A star orbits the black hole at the Milky Way\'s center, Sagittarius A* ($' + fx(Mbh, 2) + '$ solar masses), with a semi-major axis of $' + T.commas(rau) + '$ AU. What is its orbital period in years? ($P = \\sqrt{a^3/M}$ in AU, years and solar masses.)', num(Py, 3, 0.02),
        ['$a^3 = ' + T.commas(rau) + '^3 = ' + fx(rau * rau * rau, 3) + '$.', '$P = \\sqrt{\\frac{' + fx(rau * rau * rau, 3) + '}{' + fx(Mbh, 2) + '}} = ' + fd(Py, 1) + '$ years.', 'Stars like this (S2 has a period of about 16 years) are how the black hole was weighed: the 2020 Nobel Prize in Physics.'],
        'Newton\'s form of Kepler\'s third law.', { unit: 'yr', vf: { k: 'center', a: rau, M: Mbh } });
    }
    return P('Which statement about the Milky Way is true?', mc('It is one galaxy among hundreds of billions, a disk of a few hundred billion stars', wrongs(R, ['It is the whole universe', 'The Sun sits at its center', 'It contains only the stars we can see without a telescope', 'It is a cloud of gas inside our solar system'], 3)),
      ['Until the 1920s many astronomers thought the Milky Way might be the whole universe.', 'Edwin Hubble measured the distance to the Andromeda "nebula" (1925) and showed it is a separate galaxy far outside ours.', 'The observable universe holds hundreds of billions of galaxies.'], 'Is there anything beyond our galaxy?', { vf: { k: 'mc' } });
  });

  G('astro.galaxy-types', function (R, ctx) {
    var shape = by(ctx, R.pick(['desc', 'desc', 'pic']), R.pick(['En', 'desc', 'pic', 'mw']), R.pick(['En', 'En2', 'pic']));
    if (shape === 'desc') {
      var d = R.pick([['a flattened disk with spiral arms, lots of gas and dust, and young blue stars in the arms', 'a spiral galaxy'], ['a smooth, round or oval ball of mostly old, reddish stars, with little gas or dust', 'an elliptical galaxy'], ['no regular shape, plenty of gas and young stars', 'an irregular galaxy'], ['a disk with spiral arms that start from the ends of a straight bar of stars through the center', 'a barred spiral galaxy']]);
      return P('A galaxy has ' + d[0] + '. What type is it?', mc(d[1], ['a spiral galaxy', 'an elliptical galaxy', 'an irregular galaxy', 'a barred spiral galaxy'].filter(function (x) { return x !== d[1]; })),
        ['Hubble sorted galaxies by shape: ellipticals (smooth, no disk), spirals (disk with arms, some with a central bar) and irregulars (no clear shape).', 'Spirals and irregulars still have gas and are making new stars; ellipticals have used up or lost most of their gas, so their stars are old.', 'This one is ' + d[1] + '.'], 'Shape, gas and star colors.', { vf: { k: 'mc' } });
    }
    if (shape === 'En' || shape === 'En2') {
      var a = R.pick([10, 8, 5, 20, 4]), n = R.int(0, 7), b = fix(a * (1 - n / 10));
      return P('Elliptical galaxies are labeled $E0$ (round) to $E7$ (most flattened), with the number $n = 10\\left(1 - \\dfrac{b}{a}\\right)$, where $a$ and $b$ are the long and short axes of its image. An elliptical\'s image measures $a = ' + a + '$ cm by $b = ' + fd(b, 2) + '$ cm. What is $n$?', exact(n),
        ['$\\frac{b}{a} = \\frac{' + fd(b, 2) + '}{' + a + '} = ' + fd(b / a, 2) + '$.', '$n = 10(1 - ' + fd(b / a, 2) + ') = ' + n + '$, so it is an $E' + n + '$ galaxy.', n === 0 ? 'Round in the sky (it might still be flattened but seen face-on).' : 'The higher the number, the flatter it looks.'],
        'Find b/a first.', { vf: { k: 'En', a: a, b: b } });
    }
    if (shape === 'mw') {
      return P('What type of galaxy is the Milky Way?', mc('A barred spiral', wrongs(R, ['An elliptical', 'An irregular', 'A spiral with no bar', 'A ring of stars with no center'], 3)),
        ['Infrared and radio maps show the Milky Way is a disk with spiral arms and a bar of stars across its central bulge.', 'So it is a barred spiral, like many large disk galaxies.'], 'Think of the bar seen in infrared maps of the center.', { vf: { k: 'mc' } });
    }
    var types = ['E0', 'E5', 'Sb', 'SBb', 'Irr', 'Sc'], pick4 = R.sample(types, 4), tgt = R.pick(pick4), tags = {}, names = { E0: 'a round elliptical (E0)', E5: 'a flattened elliptical (E5)', Sb: 'a spiral without a bar', Sc: 'a loosely wound spiral', SBb: 'a barred spiral', Irr: 'an irregular galaxy' };
    pick4.forEach(function (t, i) { tags[t] = 'ABCD'[i]; });
    return P('Four galaxies are labeled A to D. Which one is ' + names[tgt] + '?', { t: 'mc', choices: ['A', 'B', 'C', 'D'], v: pick4.indexOf(tgt), keep: true },
      ['Ellipticals are smooth ovals; the number gives the flattening.', 'Spirals have a disk and arms; barred spirals have arms coming off a central bar; irregulars have no clear shape.', 'The answer is ' + 'ABCD'[pick4.indexOf(tgt)] + '.'], 'Look for arms, a bar, or a smooth oval.', { viz: { name: 'astro-galaxies', opts: { types: pick4, interactive: false, quiet: true, tags: tags } }, vf: { k: 'mc' } });
  });

  G('astro.dark-matter', function (R, ctx) {
    var shape = by(ctx, R.pick(['kepler', 'mc', 'flat']), R.pick(['mass', 'kepler', 'frac', 'mc']), R.pick(['mass', 'frac', 'mass2']));
    if (shape === 'kepler' || shape === 'flat') {
      var v1 = R.pick([200, 220, 240, 250, 180, 210, 230, 260, 280]), f = R.pick([4, 9, 16, 2, 3]), v2 = v1 / M.sqrt(f);
      if (shape === 'flat') return P('Stars $30{,}000$ light-years from a galaxy\'s center orbit at $' + v1 + '$ km/s. If almost all the mass were inside that distance, how fast should stars $' + T.commas(30000 * f) + '$ light-years out move? ($v = \\sqrt{GM/r}$.)', num(v2, 3, 0.02),
        ['With the same mass $M$ inside both orbits, $v \\propto \\frac{1}{\\sqrt{r}}$.', '$v_2 = v_1\\sqrt{\\frac{r_1}{r_2}} = ' + v1 + ' \\times \\sqrt{\\frac{1}{' + f + '}} = ' + fd(v2, 1) + '$ km/s.', 'Measured rotation curves stay near ' + v1 + ' km/s instead: there must be much more mass out there than we see.'],
        'Speed falls as 1/√r when the mass is all inside.', { unit: 'km/s', vf: { k: 'kep', v: v1, f: f } });
      return P('If all of a galaxy\'s mass were concentrated near its center, how would the orbital speed of stars change if you went $' + f + '$ times farther out? By what factor would the speed drop?', num(M.sqrt(f), 3, 0.02),
        ['$v = \\sqrt{\\frac{GM}{r}}$ with fixed $M$: $v \\propto \\frac{1}{\\sqrt{r}}$.', 'Speed drops by $\\sqrt{' + f + '} = ' + fd(M.sqrt(f), 3) + '$.', 'Real galaxies don\'t do this: their rotation curves stay flat.'], 'v ∝ 1/√r.', { vf: { k: 'kepf', f: f } });
    }
    if (shape === 'mass' || shape === 'mass2') {
      var v = R.pick([200, 220, 230, 250, 300, 180, 210, 240, 260, 280]), rk = R.pick([26, 30, 50, 60, 100, 20, 40, 75, 150]), r = rk * 1000 * LY, Mk = (v * 1000) * (v * 1000) * r / GN, Ms = Mk / MSUN;
      return P('Gas $' + T.commas(rk * 1000) + '$ light-years from a galaxy\'s center orbits at $' + v + '$ km/s. Treating the orbit as a circle, $M = \\dfrac{v^2 r}{G}$ gives the mass inside it. Find that mass in solar masses. ($1$ ly $= 9.46 \\times 10^{15}$ m; $G = 6.674 \\times 10^{-11}$; $M_\\odot = 1.99 \\times 10^{30}$ kg.)', num(Ms, 3, 0.03),
        ['$r = ' + T.commas(rk * 1000) + ' \\times 9.46 \\times 10^{15} = ' + fx(r, 3) + '$ m; $v = ' + fx(v * 1000, 2) + '$ m/s.', '$M = \\frac{(' + fx(v * 1000, 2) + ')^2 \\times ' + fx(r, 3) + '}{6.674 \\times 10^{-11}} = ' + fx(Mk, 3) + '$ kg.', 'In solar masses: $' + fx(Ms, 3) + '$, far more than the stars and gas we can see.'],
        'Units: m, m/s, kg.', { unit: 'M☉', vf: { k: 'mass', v: v, r: r } });
    }
    if (shape === 'frac') {
      var tot = R.pick([1e12, 5e11, 2e12, 8e11, 3e11, 1.5e12, 4e12, 3.5e+11, 4e+11, 7e+11, 9e+11, 1.2e+12, 3e+12, 3.5e+12]), vis = tot * R.pick([0.1, 0.15, 0.2, 0.05, 0.08, 0.12, 0.25, 0.06, 0.07, 0.09]), pct = (1 - vis / tot) * 100;
      return P('Orbits show a galaxy holds $' + fx(tot, 2) + '$ solar masses in all, but its stars and gas add up to only $' + fx(vis, 2) + '$ solar masses. What percent of its mass is dark? Give the answer as a percent.', pnum(pct, 3, 0.01),
        ['Dark mass $= ' + fx(tot, 2) + ' - ' + fx(vis, 2) + ' = ' + fx(tot - vis, 2) + '$ solar masses.', 'Fraction $= \\frac{' + fx(tot - vis, 2) + '}{' + fx(tot, 2) + '} = ' + fd(1 - vis / tot, 2) + '$, which is $' + fd(pct, 0) + '\\%$.'], 'Subtract, then divide by the total.', { vf: { k: 'frac', t: tot, v: vis } });
    }
    var right = 'Ordinary dark gas, dust and dim stars would block or glow in light we can detect, and the amount of ordinary matter is limited by other evidence';
    return P('Why do astronomers think dark matter is not just ordinary dust, gas and dim stars we have missed?', mc(right, wrongs(R, ['Because dust and gas are always bright', 'Because dark matter is made of black holes we can see', 'Because galaxies have no gas at all', 'Because dark matter is simply the light of very distant stars'], 3)),
      ['Dust glows in infrared and blocks starlight; gas shows up in radio and X-rays; dim stars and planets have been searched for.', 'The Big Bang\'s production of light elements and the cosmic microwave background both limit ordinary matter to about $5\\%$ of the universe, while gravity needs about five times more.', 'So most of the matter must be something that does not emit, absorb or reflect light. What it is remains unknown.'], 'Could normal matter hide that well?', { vf: { k: 'mc' } });
  });

  G('astro.standard-candles', function (R, ctx) {
    var shape = by(ctx, R.pick(['ratio', 'ratio', 'mc']), R.pick(['calib', 'ratio', 'mag', 'mc']), R.pick(['calib', 'snia', 'mag']));
    if (shape === 'ratio') {
      var r = R.chance(0.5) ? R.pick([4, 9, 16, 25, 100, 10000, 1e6]) : R.int(2, 600);
      return P('Two Cepheid variables have the same period, so the same luminosity. One looks $' + T.commas(r) + '$ times fainter than the other. How many times farther away is it?', num(M.sqrt(r), 3, 0.01),
        ['Same $L$, so $b \\propto \\frac{1}{d^2}$, and $\\frac{d_2}{d_1} = \\sqrt{\\frac{b_1}{b_2}}$.', '$\\sqrt{' + T.commas(r) + '} = ' + T.commas(M.sqrt(r)) + '$.'], 'Inverse square, backward.', { vf: { k: 'ratio', r: r } });
    }
    if (shape === 'calib') {
      var d1 = 100 * R.int(2, 25), r2 = R.int(1, 9) * R.pick([1e4, 1e5, 1e6, 1e7, 1e8]), d2 = d1 * M.sqrt(r2);
      return P('A Cepheid in our galaxy, $' + T.commas(d1) + '$ pc away (from parallax), has a period of $10$ days. A 10-day Cepheid in a distant galaxy looks $' + fx(r2, 2) + '$ times fainter. How far away is that galaxy, in parsecs?', num(d2, 3, 0.02),
        ['Same period means the same luminosity (Leavitt\'s law), so the brightness ratio comes only from distance.', '$d_2 = d_1\\sqrt{\\frac{b_1}{b_2}} = ' + T.commas(d1) + ' \\times \\sqrt{' + fx(r2, 2) + '} = ' + T.commas(d1) + ' \\times ' + fx(M.sqrt(r2), 3) + '$.', '$d_2 = ' + fx(d2, 3) + '$ pc.'],
        'The nearby Cepheid calibrates the distant one.', { unit: 'pc', vf: { k: 'calib', d1: d1, r: r2 } });
    }
    if (shape === 'snia') {
      var d0 = R.int(8, 60), rr = R.int(1, 9) * R.pick([100, 1000, 1e4, 1e5, 1e6]), dd = d0 * M.sqrt(rr);
      return P('Type Ia supernovae all peak at nearly the same luminosity. One in a galaxy $' + d0 + '$ Mpc away peaked $' + T.commas(rr) + '$ times brighter than one in a distant galaxy. How far away is the distant galaxy, in Mpc?', num(dd, 3, 0.02),
        ['Equal peak luminosities: $d_2 = d_1\\sqrt{\\frac{b_1}{b_2}}$.', '$d_2 = ' + d0 + ' \\times \\sqrt{' + T.commas(rr) + '} = ' + T.commas(rnd(dd, 4)) + '$ Mpc.'], 'Inverse square, backward.', { unit: 'Mpc', vf: { k: 'snia', d0: d0, r: rr } });
    }
    if (shape === 'mag') {
      var dm = R.chance(0.5) ? R.pick([5, 10, 15, 2.5, 7.5, 3, 4, 7, 8, 12]) : R.real(1, 14, 1), f = M.pow(10, dm / 5);
      return P('Two standard candles have the same luminosity, but one appears $' + fd(dm, 1) + '$ magnitudes fainter. How many times farther away is it? ($5$ magnitudes is a factor of $100$ in brightness.)', num(f, 3, 0.01),
        ['Brightness ratio: $100^{' + fd(dm, 1) + '/5} = ' + T.commas(M.pow(100, dm / 5)) + '$.', 'Distance ratio is the square root: $\\sqrt{' + T.commas(M.pow(100, dm / 5)) + '} = ' + fx(f, 3) + '$.'], 'Magnitudes to brightness, then square root.', { vf: { k: 'mag', dm: dm } });
    }
    var right = 'No: a star that looks faint might be nearby and dim or far away and luminous';
    return P('Two stars look equally bright in the sky. Are they the same distance away?', mc(right, ['Yes: equal brightness means equal distance', 'Yes, if they are in the same constellation', 'No: the brighter-looking star is always the closer one']),
      ['Apparent brightness depends on both luminosity and distance: $b = \\frac{L}{4\\pi d^2}$.', 'Only if we know $L$ (a standard candle) does $b$ tell us $d$.', 'That is why Cepheids, whose luminosity follows from their period, and type Ia supernovae are so valuable.'], 'What else affects brightness?', { vf: { k: 'mc' } });
  });

  G('astro.hubble-law', function (R, ctx) {
    var shape = by(ctx, R.pick(['v', 'd']), R.pick(['d', 'z', 'H', 'mc']), R.pick(['z', 'H', 'zd']));
    var H0 = 70;
    if (shape === 'v') {
      var d = R.chance(0.4) ? R.pick([10, 20, 50, 100, 150, 200, 300, 400]) : R.int(5, 450);
      return P('Using Hubble\'s law with $H_0 = 70$ km/s/Mpc, how fast is a galaxy $' + d + '$ Mpc away receding from us?', num(H0 * d, 3, 0.01),
        ['$v = H_0 d = 70\\ \\text{km/s/Mpc} \\times ' + d + '\\ \\text{Mpc}$.', '$v = ' + T.commas(H0 * d) + '$ km/s.'], 'v = H₀d.', { unit: 'km/s', vf: { k: 'v', d: d, H: 70 } });
    }
    if (shape === 'd') {
      var v = 100 * R.int(10, 300);
      return P('A galaxy recedes at $' + T.commas(v) + '$ km/s. With $H_0 = 70$ km/s/Mpc, how far away is it, in Mpc?', num(v / H0, 3, 0.01),
        ['$d = \\frac{v}{H_0} = \\frac{' + T.commas(v) + '}{70}$.', '$d = ' + fd(v / H0, 1) + '$ Mpc, about $' + fx(v / H0 * 3.26, 3) + '$ million light-years.'], 'd = v/H₀.', { unit: 'Mpc', vf: { k: 'd', v: v, H: 70 } });
    }
    if (shape === 'z' || shape === 'zd') {
      var z = R.int(2, 60) / 1000, vz = z * CKM;
      if (shape === 'zd') return P('A galaxy\'s spectral lines are redshifted by $z = \\Delta\\lambda/\\lambda = ' + z + '$. Using $v = cz$ (fine for small $z$) and $H_0 = 70$ km/s/Mpc, how far away is it, in Mpc? ($c = 3.00 \\times 10^{5}$ km/s.)', num(vz / H0, 3, 0.02),
        ['$v = cz = 3.00 \\times 10^{5} \\times ' + z + ' = ' + T.commas(vz) + '$ km/s.', '$d = \\frac{v}{H_0} = \\frac{' + T.commas(vz) + '}{70} = ' + fd(vz / H0, 1) + '$ Mpc.'], 'Redshift → speed → distance.', { unit: 'Mpc', vf: { k: 'zd', z: z } });
      return P('A galaxy\'s spectral lines are redshifted by $z = ' + z + '$. What is its recession speed, in km/s? ($v = cz$, $c = 3.00 \\times 10^{5}$ km/s.)', num(vz, 3, 0.01),
        ['$v = cz = 3.00 \\times 10^{5} \\times ' + z + '$.', '$v = ' + T.commas(vz) + '$ km/s.'], 'Multiply by c.', { unit: 'km/s', vf: { k: 'z', z: z } });
    }
    if (shape === 'H') {
      var Ht = R.int(64, 76), dd = 10 * R.int(2, 40), vv = Ht * dd;
      return P('A galaxy $' + dd + '$ Mpc away (measured with standard candles) recedes at $' + T.commas(vv) + '$ km/s. What value of the Hubble constant does it give, in km/s/Mpc?', num(Ht, 3, 0.01),
        ['$H_0 = \\frac{v}{d} = \\frac{' + T.commas(vv) + '}{' + dd + '}$.', '$H_0 = ' + Ht + '$ km/s/Mpc. Current measurements range from about 67 to 73.'], 'H₀ = v/d.', { unit: 'km/s/Mpc', vf: { k: 'H', v: vv, d: dd } });
    }
    var right = 'No: in a uniformly expanding universe, observers in every galaxy see the others receding the same way';
    return P('Almost every distant galaxy is moving away from us. Does that mean we are at the center of the universe?', mc(right, ['Yes: they are all fleeing from our galaxy', 'Yes: the Big Bang happened where the Milky Way is now', 'No: the galaxies are actually moving toward us']),
      ['Hubble\'s law, $v = H_0d$, is what a uniform stretching of space looks like from <em>any</em> point.', 'Picture raisins in rising bread: from any raisin, all the others move away, faster when farther.', 'So every galaxy sees the same law, and there is no center.'], 'Picture raisins in rising dough.', { viz: { name: 'ph-cosmic', opts: { mode: 'expansion', interactive: false, quiet: true, t: 2 } }, vf: { k: 'mc' } });
  });

  G('astro.age-of-universe', function (R, ctx) {
    var shape = by(ctx, R.pick(['short', 'short', 'mc']), R.pick(['full', 'short', 'H', 'mc']), R.pick(['full', 'H', 'compare']));
    if (shape === 'short') {
      var H = R.chance(0.4) ? R.pick([50, 60, 65, 67, 70, 73, 75, 80, 100, 90]) : R.int(50, 100), t = 977.8 / H;
      return P('The Hubble time $1/H_0$ estimates the age of the universe. A handy shortcut is $\\dfrac{1}{H_0} = \\dfrac{978}{H_0}$ billion years, with $H_0$ in km/s/Mpc. What is $1/H_0$ for $H_0 = ' + H + '$ km/s/Mpc?', num(t, 3, 0.01),
        ['$\\frac{978}{' + H + '} = ' + fd(t, 2) + '$ billion years.', 'A bigger $H_0$ (faster expansion) means less time to reach today\'s distances, so a younger universe.'], 'Divide 978 by H₀.', { unit: 'billion years', vf: { k: 'age', H: H } });
    }
    if (shape === 'full') {
      var H2 = R.int(45, 100), ts = 3.086e19 / H2, ty = ts / YR / 1e9;
      return P('Find $1/H_0$ in billions of years for $H_0 = ' + H2 + '$ km/s/Mpc. ($1$ Mpc $= 3.086 \\times 10^{19}$ km; $1$ yr $= 3.156 \\times 10^{7}$ s.)', num(ty, 3, 0.02),
        ['$H_0$ is a speed per distance: km/s per Mpc. Put the Mpc in km so the km cancel: $H_0 = \\frac{' + H2 + '\\ \\text{km/s}}{3.086 \\times 10^{19}\\ \\text{km}} = ' + fx(H2 / 3.086e19, 3) + '$ per second.', '$\\frac{1}{H_0} = ' + fx(ts, 3) + '$ s.', 'In years: $\\frac{' + fx(ts, 3) + '}{3.156 \\times 10^{7}} = ' + fx(ts / YR, 3) + '$ years $= ' + fd(ty, 1) + '$ billion years.'],
        'Make the distance units cancel first.', { unit: 'billion years', vf: { k: 'age', H: H2 } });
    }
    if (shape === 'H') {
      var t2 = R.int(7, 25), Hh = 977.8 / t2;
      return P('If $1/H_0$ were $' + t2 + '$ billion years, what would $H_0$ be, in km/s/Mpc? (Use $\\frac{1}{H_0} = \\frac{978}{H_0}$ billion years.)', num(Hh, 3, 0.01),
        ['$\\frac{978}{H_0} = ' + t2 + '$, so $H_0 = \\frac{978}{' + t2 + '} = ' + fd(Hh, 1) + '$ km/s/Mpc.'], 'Solve for H₀.', { unit: 'km/s/Mpc', vf: { k: 'H', t: t2 } });
    }
    if (shape === 'compare') {
      var Ha = R.pick([67, 70]), Hb = 73;
      return P('One method gives $H_0 = ' + Ha + '$ km/s/Mpc, another $' + Hb + '$ km/s/Mpc. By how many billion years do their Hubble times $1/H_0$ differ? (Use $978/H_0$ billion years.)', num(977.8 / Ha - 977.8 / Hb, 3, 0.03),
        ['$\\frac{978}{' + Ha + '} = ' + fd(977.8 / Ha, 2) + '$ and $\\frac{978}{' + Hb + '} = ' + fd(977.8 / Hb, 2) + '$ billion years.', 'Difference: $' + fd(977.8 / Ha - 977.8 / Hb, 2) + '$ billion years. Settling this "Hubble tension" is an open question in cosmology.'], 'Compute each, then subtract.', { unit: 'billion years', vf: { k: 'cmp', a: Ha, b: Hb } });
    }
    var right = 'Convert the megaparsecs to kilometers so the distance units cancel, leaving 1/H₀ in seconds';
    return P('$H_0 = 70$ km/s/Mpc. What must you do before $1/H_0$ gives a time?', mc(right, ['Nothing: 1/70 is already the age in billions of years', 'Multiply by the speed of light', 'Convert km/s to light-years per year and stop there']),
      ['$H_0$ has units of (km/s)/Mpc: a distance over a time over a distance.', 'Writing 1 Mpc as $3.086 \\times 10^{19}$ km makes the distances cancel: $H_0 = 2.27 \\times 10^{-18}$ per second.', '$1/H_0 = 4.41 \\times 10^{17}$ s $= 14.0$ billion years. Skipping the conversion gives a meaningless $1/70$.'], 'Look at the units of H₀.', { vf: { k: 'mc' } });
  });

  G('astro.big-bang-evidence', function (R, ctx) {
    var shape = by(ctx, R.pick(['evidence', 'explosion', 'cmb']), R.pick(['cmb', 'then', 'evidence', 'size']), R.pick(['then', 'size', 'cmb']));
    if (shape === 'evidence') {
      var good = R.pick(['the cosmic microwave background, a nearly uniform glow at 2.7 K from every direction', 'the expansion of the universe: distant galaxies recede, faster when farther', 'the amounts of hydrogen and helium: about 3 parts hydrogen to 1 part helium by mass, everywhere']);
      return P('Which of these is evidence for the Big Bang?', mc(good, wrongs(R, ['the Sun rising in the east', 'the phases of the Moon', 'the rings of Saturn', 'stars twinkling', 'the colors of stars'], 3)),
        ['Three key pieces of evidence: the expansion (Hubble\'s law), the cosmic microwave background (the cooled glow of the hot early universe), and the abundances of the lightest elements made in the first few minutes.'], 'Which one says the universe was once hot and dense?', { vf: { k: 'mc' } });
    }
    if (shape === 'explosion') {
      return P('Which picture of the Big Bang matches the evidence?', mc('Space itself has been expanding everywhere at once from a hot, dense state, with no center and no edge', wrongs(R, ['A bomb exploded at one point in empty space and flung galaxies outward', 'The universe began at the center of the Milky Way', 'Galaxies are flying away from the place where the Sun is now', 'A star exploded and its pieces became the planets and galaxies'], 3)),
        ['The Big Bang was not an explosion into space; it was the expansion of space.', 'Every point was part of the hot, dense early universe, so the leftover glow (the microwave background) fills all of space and arrives from every direction.'], 'Where is the center of an expanding balloon\'s surface?', { vf: { k: 'mc' } });
    }
    if (shape === 'cmb') {
      var T0 = R.pick([2.725, 2.73]), lam = WIEN / T0 / 1e6;
      return P('The cosmic microwave background is blackbody radiation at $' + fd(T0, 3) + '$ K. Where does it peak, in millimeters? ($\\lambda_{\\text{peak}} = \\dfrac{2.90 \\times 10^{6}\\ \\text{nm·K}}{T}$; $1$ mm $= 10^{6}$ nm.)', num(lam, 3, 0.02),
        ['$\\lambda_{\\text{peak}} = \\frac{2.90 \\times 10^{6}}{' + fd(T0, 3) + '} = ' + fx(lam * 1e6, 3) + '$ nm.', 'In millimeters: $' + fd(lam, 2) + '$ mm: microwaves, hence the name.'], 'Wien\'s law, then convert.', { unit: 'mm', vf: { k: 'cmb', T: T0 } });
    }
    if (shape === 'then') {
      var z = R.pick([1100, 1090, 10, 3, 1000, 1, 2, 5, 20, 50, 100, 500]), Tt = 2.725 * (1 + z);
      return P('As space expands, the background radiation cools in proportion: $T = T_{\\text{now}}(1 + z)$, with $T_{\\text{now}} = 2.725$ K. How hot was it at redshift $z = ' + T.commas(z) + '$?', num(Tt, 3, 0.02),
        ['$T = 2.725 \\times (1 + ' + T.commas(z) + ') = 2.725 \\times ' + T.commas(1 + z) + '$.', '$T = ' + T.commas(rnd(Tt, 3)) + '$ K.', z > 500 ? 'About 3000 K: just cool enough for atoms to form, which let the light travel freely. That light is the microwave background.' : 'Hotter than today because the universe was smaller.'],
        'Multiply by 1 + z.', { unit: 'K', vf: { k: 'then', z: z } });
    }
    var z2 = R.pick([1, 2, 3, 9, 1100, 0.5, 0.1, 0.2, 0.25, 4, 5, 7, 19]), s = 1 / (1 + z2);
    return P('Light from a galaxy at redshift $z = ' + T.commas(z2) + '$ left it when the universe was smaller. What fraction of today\'s size was the universe then? (Size then $=\\dfrac{1}{1 + z}$ of today\'s.)', num(s, 3, 0.01),
      ['Wavelengths stretch with space: $1 + z = \\frac{\\text{size now}}{\\text{size then}}$.', 'Size then $= \\frac{1}{1 + ' + T.commas(z2) + '} = ' + fx(s, 3) + '$ of today\'s.'], '1 + z is the stretch factor.', { vf: { k: 'size', z: z2 } });
  });

  G('astro.dark-energy', function (R, ctx) {
    var shape = by(ctx, R.pick(['what', 'pct', 'what']), R.pick(['pct', 'faint', 'what', 'mc']), R.pick(['faint', 'pct2', 'pct']));
    if (shape === 'what') {
      return P('What did astronomers discover in 1998 by measuring distant type Ia supernovae?', mc('The expansion of the universe is speeding up', wrongs(R, ['The expansion of the universe is slowing to a stop', 'The universe has stopped expanding', 'The universe is shrinking', 'The universe is not expanding at all'], 3)),
        ['Distant supernovae looked fainter, so farther away, than they would be in a universe whose expansion was slowing down.', 'The expansion has been speeding up for the last several billion years.', 'The unknown cause is called dark energy; the discovery won the 2011 Nobel Prize in Physics.'], 'Fainter than expected means farther than expected.', { vf: { k: 'mc' } });
    }
    if (shape === 'pct' || shape === 'pct2') {
      var de = 68, dm = 27, om = 5, ask = shape === 'pct2' ? 'dmfrac' : R.pick(['matter', 'dark']);
      if (ask === 'dmfrac') return P('About $68\\%$ of the universe\'s energy is dark energy, $27\\%$ dark matter and $5\\%$ ordinary matter (Planck mission results). What percent of all the <em>matter</em> is dark matter? Give the answer as a percent.', pnum(100 * dm / (dm + om), 3, 0.02),
        ['All matter: $27 + 5 = 32$.', 'Dark matter\'s share: $\\frac{27}{32} = 0.84$, about $84\\%$.'], 'Leave out dark energy.', { vf: { k: 'dmfrac' } });
      return P('About $68\\%$ of the universe\'s energy is dark energy, $27\\%$ dark matter and $5\\%$ ordinary matter. What percent is ' + (ask === 'matter' ? 'matter of any kind' : 'dark (dark matter plus dark energy)') + '? Give the answer as a percent.', pnum(ask === 'matter' ? dm + om : de + dm, 3, 0.01),
        [ask === 'matter' ? 'Matter: $27\\% + 5\\% = 32\\%$.' : 'Dark: $68\\% + 27\\% = 95\\%$.', ask === 'matter' ? 'The rest, $68\\%$, is dark energy.' : 'Everything we have ever seen directly is only about $5\\%$.'], 'Add the parts.', { vf: { k: ask } });
    }
    if (shape === 'faint') {
      var f = R.int(40, 95) / 100, k = 1 / M.sqrt(f);
      return P('A distant type Ia supernova looks only $' + fd(f * 100, 0) + '\\%$ as bright as expected in a universe whose expansion was slowing. How many times farther away is it than expected?', num(k, 3, 0.01),
        ['Same luminosity, so $b \\propto \\frac{1}{d^2}$ and $\\frac{d_{\\text{actual}}}{d_{\\text{expected}}} = \\sqrt{\\frac{b_{\\text{expected}}}{b_{\\text{actual}}}}$.', '$\\sqrt{\\frac{1}{' + fd(f, 2) + '}} = ' + fd(k, 3) + '$.', 'Farther than expected means the universe expanded more than expected since that light left: the expansion sped up.'],
        'Inverse square, backward.', { vf: { k: 'faint', f: f } });
    }
    var right = 'Gravity alone would slow the expansion, but observations show it speeding up, so something else, called dark energy, must be at work';
    return P('Why is the accelerating expansion surprising?', mc(right, ['Because gravity should make the expansion speed up', 'Because the universe was known not to be expanding', 'Because dark energy is a kind of ordinary matter we can see']),
      ['Gravity pulls everything together, so everyone expected the expansion to be slowing down.', 'Supernova distances, the microwave background and galaxy surveys all agree it is speeding up instead.', 'What dark energy is remains one of the biggest open questions in physics.'], 'What should gravity do to an expansion?', { vf: { k: 'mc' } });
  });

// ---- 99_tail.js
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : undefined));

/* ---- More forms of the same questions (round 7, "widen"; Physics and Earth ladders): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - check a number: the question and a classmate's numeric answer, either the generator's own answer or that answer
     off by a common slip (a factor of 2, 4 or 10), and "Is that right?" (Yes / No; not in placement);
   - two at once: two different questions of the topic, answered together (short questions only, multiple-choice or
     numeric, each keeping its own unit; at most one of them with a picture, which then comes first).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'astro', YOUNG = false, VAR = {};
  // how often another form is used: a quarter of the time when the topic's own generator already varies a lot at this
  // level, up to half the time when it has few different questions
  // (counted once per topic and level from 40 fixed seeds, ignoring the order of the choices)
  function share(id, base, ctx) {
    var L = (ctx && ctx.level) || 1, key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 40; s++) {
        try {
          var p = base(ML.rand(id + '#variety#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; }
        } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key] >= 36 ? 0.25 : VAR[key] >= 25 ? 0.4 : 0.5;
  }
  function txt(s) { return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var YN = /^(yes|no|true|false|right|wrong|correct|incorrect|not sure)\b/i;
  function checkable(p) {
    var a = p.a;
    if (!a || a.t !== 'mc' || Array.isArray(a.v) || !Array.isArray(a.choices) || a.choices.length < 3) return false;
    if (a.choices.some(function (c) { var t = txt(c); return !t || YN.test(t) || t.length > 180; })) return false;
    if (!p.viz && a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })) return false; // letters name parts of a picture
    if (/\b(is|was) (that|this|it) (right|correct)\b|\btrue or false\b/i.test(txt(p.q))) return false;
    return !p.unit;
  }
  function numable(p) { // a single numeric answer with a plain decimal value (not a fraction or an expression)
    var a = p.a;
    return !!a && a.t === 'num' && /^-?\d+(\.\d+)?(e-?\d+)?$/.test(String(a.v)) && +a.v !== 0 && isFinite(+a.v) &&
      !(a.tol && a.tol >= Math.abs(+a.v) / 3) && !((a.rtol || 0) > 0.3); // a slip by a factor of 2 must fall outside the tolerance
  }
  function sig(v) { var m = String(v).replace(/e.*$/, '').replace(/^-?0*\.?0*/, '').replace('.', ''); return Math.min(6, Math.max(3, m.length)); }
  function show(x, n) { // a number as the classmate would write it: 3 significant figures, scientific notation when large or small
    var ax = Math.abs(x);
    if (ax >= 1e5 || ax < 1e-3) { var e = Math.floor(Math.log10(ax)), m = Number((x / Math.pow(10, e)).toPrecision(n || 3)); if (Math.abs(m) >= 10) { m = m / 10; e++; } return '$' + m + ' \\times 10^{' + e + '}$'; }
    var s = String(Number(x.toPrecision(n || 3)));
    return '$' + (ax >= 1e4 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') : s) + '$';
  }
  function numCheckForm(R, p) {
    var a = p.a, v = +a.v, n = sig(a.v), right = R.coin(), f = R.pick([2, 0.5, 10, 0.1, 4, 0.25]), shown = right ? v : v * f;
    var who = 'A classmate worked it out and got', u = p.unit ? ' ' + p.unit : '';
    var q = p.q + '<p>' + who + ': <b>' + show(shown, n) + u + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right.' : 'No. The answer is ' + show(v, n) + u + '; ' + (f > 1 ? 'the classmate\'s answer is ' + f + ' times too big.' : 'the classmate\'s answer is ' + Math.round(1 / f) + ' times too small.'))].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf' && !numable(p))) return false;
    if (p.a.t !== 'num' && p.unit) return false;
    if (p.a.t === 'mc' && (!Array.isArray(p.a.choices) || (!p.viz && p.a.choices.some(function (c) { return /^[A-H]$/.test(txt(c)); })))) return false;
    return txt(p.q).length <= (YOUNG ? 240 : 480) && !/<(table|svg|img|canvas|ol|ul)\b/i.test(p.q) && !(YOUNG && /<blockquote\b/i.test(p.q));
  }
  function sameQ(p, p2) { // the same question, even with its choices in another order
    function k(x) { var a = x.a; return txt(x.q) + '|' + (a.t === 'mc' ? a.choices.slice().sort().join('|') + '|' + (Array.isArray(a.v) ? a.v.map(function (i) { return a.choices[i]; }).sort().join('|') : a.choices[a.v]) : JSON.stringify(a.v)); }
    return k(p) === k(p2);
  }
  function end(s) { s = String(s).replace(/\s+$/, ''); return /[.!?…”’)]$/.test(txt(s)) ? s : s + '.'; }
  function listed(q) { return /\b(these|those|the following|below|the choices|the options|one of them)\b/i.test(txt(q)); }
  function checkForm(R, p) {
    var a = p.a, right = R.coin(), k = right ? a.v : R.pick(a.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== a.v; }));
    var who = YOUNG ? 'A friend picked' : 'A classmate answered', shown = a.choices[k], good = a.choices[a.v];
    var letters = a.choices.every(function (c) { return /^[A-H]$/.test(txt(c)); });
    var q = p.q + (!letters && listed(p.q.replace(/<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, '')) ? '<p>The choices: ' + a.choices.join(' &middot; ') + '</p>' : '') + '<p>' + who + ': <b>' + shown + '</b></p><p>Is that right?</p>';
    var out = { q: q, a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: [(right ? 'Yes, that is right: ' : 'No. The right answer is: ') + end(good)].concat(p.steps) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function part(l, x) { var o = { label: l, a: x.a }; if (x.unit) o.unit = x.unit; return o; }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [part('1.', p), part('2.', p2)] },
        hint: 'Take them one at a time.',
        steps: ['Question 1: ' + p.steps[0]].concat(p.steps.slice(1), ['Question 2: ' + p2.steps[0]], p2.steps.slice(1)) };
      var nl = [].concat(p.nolint || [], p2.nolint || []); if (nl.length) out.nolint = nl;
      if (p.viz) out.viz = p.viz;
      return out;
    }
    return null;
  }
  ML.genIds().filter(function (id) { return id.indexOf(COURSE + '.') === 0; }).forEach(function (id) {
    var base = ML.getGen(id);
    if (!base || base._forms) return;
    var fn = function (R, ctx) {
      var p = base(R, ctx), L = (ctx && ctx.level) || 1, mode = ctx && ctx.mode;
      if (!p || !p.a || !R.chance(share(id, base, ctx))) return p;
      if (p.a.t === 'mc' && !p.a.choices && Array.isArray(p.choices)) p.a.choices = p.choices;
      var forms = [];
      if (mode !== 'place' && checkable(p)) forms.push('check');
      if (mode !== 'place' && numable(p)) forms.push('ncheck');
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : f === 'ncheck' ? numCheckForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
