/* Physics Ladder: generators for Rocket Boys Math and Physics (course key rocket), 21 topics.
   One generator per topic, registered with MathLadder.gen(id, fn(R, ctx)). Levels: 1 gentlest, 2 (reviews,
   checkpoints, placement), 3 (later reviews). g = 9.8 m/s^2. Every problem carries its inputs in p.d, so a separate
   script can recompute the answer by a second method (energy for kinematics, the law of sines for cotangents, a
   numerical integral for the rocket equation, and so on).
   Safety: nothing here describes propellants, their ingredients or how to make a motor. Motors are "certified,
   commercially made"; numbers for thrust and impulse are the kind printed on a motor's package. */
(function (ML) {
  'use strict';
  if (!ML) return;
  function texWidth(t) {
    function grp(s, k) { var d = 0; for (var q = k; q < s.length; q++) { if (s[q] === '{') d++; else if (s[q] === '}') { d--; if (!d) return [s.slice(k + 1, q), q]; } } return ['', s.length]; }
    t = String(t);
    t = t.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\(left|right|displaystyle)/g, '');
    t = t.replace(/\\[,;!:]|\\quad|\\qquad|\\ /g, ' ');
    var guard = 0;
    while (/\\[dt]?frac\{/.test(t) && guard++ < 60) {
      var i = t.search(/\\[dt]?frac\{/), j = t.indexOf('{', i), a = grp(t, j), b = grp(t, a[1] + 1);
      t = t.slice(0, i) + 'x'.repeat(Math.ceil(Math.max(texWidth(a[0]), texWidth(b[0])))) + t.slice(b[1] + 1);
    }
    t = t.replace(/\\sqrt\{/g, 'xx{');
    t = t.replace(/\^\{[^{}]*\}|_\{[^{}]*\}/g, function (s) { return 'x'.repeat(Math.ceil((s.length - 3) * 0.6)); });
    t = t.replace(/\\(sin|cos|tan|cot|ln|log|arctan)/g, 'xxx');
    t = t.replace(/\\[a-zA-Z]+/g, 'x');
    t = t.replace(/[{}^_]/g, '');
    var n = 0; for (var k = 0; k < t.length; k++) n += /[=+<>\-]/.test(t[k]) ? 1.8 : t[k] === ' ' ? 0 : t[k] === ',' ? 0.6 : 1;
    return n;
  }
  function widenText(s, lim) {
    if (typeof s !== 'string' || !ML.mathSegments) return s;
    var segs = ML.mathSegments(s), out = '';
    for (var i = 0; i < segs.length; i++) {
      var sg = segs[i];
      if (!sg.math) { out += sg.s; continue; }
      if (sg.display || texWidth(sg.tex) <= lim) { out += sg.raw; continue; }
      var nx = segs[i + 1], pun = '';
      if (nx && !nx.math) { var m = /^[.,;:]/.exec(nx.s); if (m) { pun = m[0]; nx.s = nx.s.slice(1); } }
      out += '$$' + sg.tex + pun + '$$';
    }
    return out;
  }
  function W(fn) {
    return function (R, ctx) {
      var p = fn(R, ctx);
      p.q = widenText(p.q, 26);
      p.steps = p.steps.map(function (s) { return widenText(s, 26); });
      if (p.hint) p.hint = widenText(p.hint, 26);
      return p;
    };
  }

  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  var g = 9.8, GRAV = 6.674e-11;
  var abs = Math.abs, sqrt = Math.sqrt, PI = Math.PI, DEG = PI / 180, ln = Math.log;
  function sinD(a) { return Math.sin(a * DEG); }
  function cosD(a) { return Math.cos(a * DEG); }
  function tanD(a) { return Math.tan(a * DEG); }
  function atanD(x) { return Math.atan(x) / DEG; }
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function sv(x, n) {
    var y = sg(x, n || 3); if (y === 0) return '0';
    var e = Math.floor(Math.log10(abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fx(y / Math.pow(10, e)); return String(m) + 'e' + e; }
    return String(fx(y));
  }
  function tn(x, n) {
    var y = sg(x, n || 3); if (y === 0) return '0';
    var e = Math.floor(Math.log10(abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fx(y / Math.pow(10, e)); return (m < 0 ? '-' : '') + String(abs(m)) + ' \\times 10^{' + e + '}'; }
    if (abs(y) >= 1000) return T.commas(y);
    return String(fx(y));
  }
  function tv(x) { x = fx(x); if (abs(x) >= 1000 && abs(x) < 1e6) return T.commas(x); return String(x); }
  var UT = { 'm/s2': '\\text{m/s}^2', 'N·s': '\\text{N}\\cdot\\text{s}', 'kg·m/s': '\\text{kg}\\cdot\\text{m/s}', '°': '^\\circ' };
  function ut(u) { return UT[u] || '\\text{' + u + '}'; }
  function qu(x, u, n) { return u === '°' ? tn(x, n) + '^\\circ' : tn(x, n) + '\\ ' + ut(u); }
  function gv(x, u) { return u === '°' ? tv(x) + '^\\circ' : tv(x) + '\\ ' + ut(u); }
  function A(x, n, rtol) { return { t: 'num', v: sv(x, n || 3), rtol: rtol || 0.02 }; }
  function AX(x) { return { t: 'num', v: String(fx(x)), rtol: 0.005 }; }
  function MC(correct, wrongs) { return U.mc(correct, wrongs.filter(function (w) { return w !== correct; }), 4); }
  function eqa(x, n) { return abs(sg(x, 4) - x) < 1e-9 * Math.max(1, abs(x)) ? '= ' + tv(sg(x, 4)) : '\\approx ' + tn(x, n || 3); }
  var ROCKETS = ['Auk', 'Comet', 'Kestrel', 'Lark', 'Falcon', 'Swift', 'Heron', 'Wren', 'Osprey', 'Plover'];
  function rname(R) { return 'the ' + R.pick(ROCKETS) + ' ' + R.pick(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ===================================================================== Unit 1: Tools of the Trade

  // ---------- rocket.units-sig-figs
  G('rocket.units-sig-figs', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['ft-m', 'm-ft', 'mi-ft']), R.pick(['ft-m', 'mi-m', 'mph', 'sf']), R.pick(['mi-m', 'mph', 'sf', 'sfmul', 'kmh']));
    if (kind === 'ft-m' || kind === 'm-ft') {
      var ft = R.int(12, 160) * 50, m = R.int(8, 99) * 25;
      if (kind === 'ft-m') return {
        q: 'A rocket\'s tracking team reports a height of $' + gv(ft, 'ft') + '$. What is that in meters? ($1\\ \\text{ft} = 0.3048\\ \\text{m}$ exactly.)',
        a: A(ft * 0.3048), unit: 'm',
        steps: ['Multiply by a factor that cancels feet: $' + gv(ft, 'ft') + ' \\times \\dfrac{0.3048\\ \\text{m}}{1\\ \\text{ft}}$.', '$= ' + qu(ft * 0.3048, 'm') + '$.'],
        hint: 'Put feet on the bottom of the conversion factor so they cancel.', d: { k: 'ft-m', ft: ft }
      };
      return {
        q: 'A launch is planned to reach $' + gv(m, 'm') + '$. How many feet is that? ($1\\ \\text{ft} = 0.3048\\ \\text{m}$ exactly.)',
        a: A(m / 0.3048), unit: 'ft',
        steps: ['Put meters on the bottom so they cancel: $' + gv(m, 'm') + ' \\times \\dfrac{1\\ \\text{ft}}{0.3048\\ \\text{m}}$.', '$= ' + qu(m / 0.3048, 'ft') + '$. A foot is shorter than a meter, so there are more feet.'],
        hint: 'Divide by 0.3048. The number of feet must be bigger than the number of meters.', d: { k: 'm-ft', m: m }
      };
    }
    if (kind === 'mi-ft' || kind === 'mi-m') {
      var mi = R.pick([0.5, 0.75, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 0.25, 1.75, 2.25]);
      if (kind === 'mi-ft') return {
        q: 'A rocket climbs $' + gv(mi, 'mi') + '$. How many feet is that? ($1\\ \\text{mi} = 5{,}280\\ \\text{ft}$.)',
        a: AX(mi * 5280), unit: 'ft',
        steps: ['$' + gv(mi, 'mi') + ' \\times \\dfrac{5{,}280\\ \\text{ft}}{1\\ \\text{mi}} = ' + tv(mi * 5280) + '\\ \\text{ft}$.'],
        hint: 'One mile is 5,280 feet.', d: { k: 'mi-ft', mi: mi }
      };
      return {
        q: 'A rocket climbs $' + gv(mi, 'mi') + '$. How many meters is that? ($1\\ \\text{mi} = 5{,}280\\ \\text{ft}$, $1\\ \\text{ft} = 0.3048\\ \\text{m}$.)',
        a: A(mi * 5280 * 0.3048, 3), unit: 'm',
        steps: ['Chain two factors: $' + gv(mi, 'mi') + ' \\times \\dfrac{5{,}280\\ \\text{ft}}{1\\ \\text{mi}} \\times \\dfrac{0.3048\\ \\text{m}}{1\\ \\text{ft}}$.', 'Miles cancel, then feet cancel: $' + qu(mi * 5280 * 0.3048, 'm', 4) + '$.'],
        hint: 'Go from miles to feet, then from feet to meters.', d: { k: 'mi-m', mi: mi }
      };
    }
    if (kind === 'mph' || kind === 'kmh') {
      var s = R.int(6, 60) * 10;
      if (kind === 'mph') return {
        q: 'At burnout a rocket is moving $' + gv(s, 'mi/h') + '$. What is that in meters per second? ($1\\ \\text{mi} = 1{,}609.344\\ \\text{m}$, $1\\ \\text{h} = 3{,}600\\ \\text{s}$.)',
        a: A(s * 1609.344 / 3600), unit: 'm/s',
        steps: ['$' + gv(s, 'mi/h') + ' \\times \\dfrac{1{,}609.344\\ \\text{m}}{1\\ \\text{mi}} \\times \\dfrac{1\\ \\text{h}}{3{,}600\\ \\text{s}}$.', '$= ' + qu(s * 1609.344 / 3600, 'm/s') + '$.'],
        hint: 'Miles on the bottom of one factor, hours on the top of the other.', d: { k: 'mph', s: s }
      };
      return {
        q: 'A rocket\'s top speed is $' + gv(s, 'km/h') + '$. What is that in meters per second?',
        a: A(s / 3.6), unit: 'm/s',
        steps: ['$1\\ \\text{km/h} = \\dfrac{1{,}000\\ \\text{m}}{3{,}600\\ \\text{s}}$, so divide by $3.6$.', '$' + tv(s) + ' / 3.6 ' + eqa(s / 3.6) + '\\ \\text{m/s}$.'],
        hint: 'A kilometer is 1,000 m and an hour is 3,600 s.', d: { k: 'kmh', s: s }
      };
    }
    if (kind === 'sf') {
      var items = [['0.0450', 3], ['1,200.', 4], ['3.07', 3], ['250.0', 4], ['0.008', 1], ['4.500', 4], ['60.2', 3], ['0.1030', 4], ['12.0', 3], ['7', 1], ['508', 3], ['0.70', 2]];
      var it = R.pick(items);
      return {
        q: 'A student writes a measured length as $' + it[0].replace(',', '{,}') + '\\ \\text{m}$. How many significant figures does it have?',
        a: { t: 'num', v: String(it[1]), form: 'int' },
        steps: ['Leading zeros only place the decimal point; they never count.', 'Zeros between other digits count, and trailing zeros count when there is a decimal point.', 'So $' + it[0].replace(',', '{,}') + '$ has ' + it[1] + ' significant ' + (it[1] === 1 ? 'figure' : 'figures') + '.'],
        hint: 'Start counting at the first nonzero digit.', d: { k: 'sf', s: it[0], n: it[1] }
      };
    }
    // sfmul: a product rounded to the fewest significant figures
    var b = R.pick([25.0, 30.0, 40.0, 50.0, 75.0, 100.0]), ang = R.pick([1.73, 1.19, 2.14, 0.839, 1.43, 2.75, 3.08]);
    var prod = b * ang;
    return {
      q: 'A baseline measured as $' + b.toFixed(1) + '\\ \\text{m}$ (3 significant figures) is multiplied by a tangent of $' + ang + '$ (3 significant figures). Give the height to the right number of significant figures.',
      a: { t: 'num', v: sv(prod, 3), form: 'sf', sf: 3, rtol: 0.004 }, unit: 'm',
      steps: ['$' + b.toFixed(1) + ' \\times ' + ang + ' = ' + tv(fx(prod)) + '$ on a calculator.', 'A product keeps as many significant figures as the least precise factor: 3 here.', 'So the height is $' + tn(prod, 3) + '\\ \\text{m}$.'],
      hint: 'Multiply, then round to the fewest significant figures among the factors.', d: { k: 'sfmul', b: b, t: ang }
    };
  }));

  // ---------- rocket.flight-graphs  (a velocity-time graph: straight up during the burn, slope -g after)
  G('rocket.flight-graphs', W(function (R, ctx) {
    var tb = R.pick([1, 1.5, 2, 2.5, 3]), vb = R.int(8, 30) * 5, a = vb / tb, tap = tb + vb / g;
    var desc = 'A rocket\'s velocity-time graph is a straight line from $0$ up to $' + gv(vb, 'm/s') + '$ at burnout, $t = ' + tv(tb) + '\\ \\text{s}$, then a straight line sloping down with slope $-9.8\\ \\text{m/s}^2$ (it coasts).';
    var ask = by(ctx, R.pick(['aboost', 'tap']), R.pick(['aboost', 'tap', 'hb', 'hap']), R.pick(['tap', 'hb', 'hap', 'vat']));
    if (ask === 'aboost') return {
      q: desc + ' What is the acceleration during the burn?', a: A(a), unit: 'm/s2',
      steps: ['Acceleration is the slope of the velocity-time graph.', 'Slope $= \\dfrac{' + tv(vb) + ' - 0}{' + tv(tb) + ' - 0} ' + eqa(a) + '\\ \\text{m/s}^2$.'],
      hint: 'Rise over run on the first straight piece.', d: { k: 'aboost', tb: tb, vb: vb }
    };
    if (ask === 'tap') return {
      q: desc + ' At what time does the rocket reach its highest point?', a: A(tap), unit: 's',
      steps: ['The rocket is highest where its velocity crosses zero, not at burnout.', 'After burnout, $v$ drops by $9.8\\ \\text{m/s}$ each second: $\\dfrac{' + tv(vb) + '}{9.8} ' + eqa(vb / g) + '\\ \\text{s}$ more.', '$t = ' + tv(tb) + ' + ' + tn(vb / g) + ' ' + eqa(tap) + '\\ \\text{s}$.'],
      hint: 'Find where the downward line reaches $v = 0$.', d: { k: 'tap', tb: tb, vb: vb }
    };
    if (ask === 'hb') return {
      q: desc + ' How high is the rocket at burnout?', a: A(0.5 * vb * tb), unit: 'm',
      steps: ['Height gained is the area under the velocity-time graph.', 'Up to burnout the area is a triangle: $\\tfrac12 (' + tv(tb) + ')(' + tv(vb) + ') ' + eqa(0.5 * vb * tb) + '\\ \\text{m}$.'],
      hint: 'Area of a triangle: half base times height.', d: { k: 'hb', tb: tb, vb: vb }
    };
    if (ask === 'hap') { var H = 0.5 * vb * tap; return {
      q: desc + ' How high does the rocket go?', a: A(H), unit: 'm',
      steps: ['The whole area from $t = 0$ to the zero crossing is one big triangle with height $' + gv(vb, 'm/s') + '$.', 'It crosses zero at $t = ' + tv(tb) + ' + ' + tv(vb) + '/9.8 ' + eqa(tap) + '\\ \\text{s}$.', 'Area $= \\tfrac12 (' + tn(tap, 4) + ')(' + tv(vb) + ') ' + eqa(H) + '\\ \\text{m}$.'],
      hint: 'Up to apogee the graph makes one triangle.', d: { k: 'hap', tb: tb, vb: vb }
    }; }
    var t1 = fx(tb + R.int(1, Math.max(1, Math.floor(vb / g))) ), v1 = vb - g * (t1 - tb);
    return {
      q: desc + ' What is the rocket\'s velocity at $t = ' + tv(t1) + '\\ \\text{s}$?', a: A(v1, 3, 0.02), unit: 'm/s',
      steps: ['That time is $' + tv(fx(t1 - tb)) + '\\ \\text{s}$ after burnout.', '$v = ' + tv(vb) + ' - 9.8(' + tv(fx(t1 - tb)) + ') ' + eqa(v1) + '\\ \\text{m/s}$.'],
      hint: 'Start at the burnout speed and lose 9.8 m/s each second.', d: { k: 'vat', tb: tb, vb: vb, t1: t1 }
    };
  }));

  // ---------- rocket.launch-statistics
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function sdev(a) { var m = mean(a); return sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1)); }
  G('rocket.launch-statistics', W(function (R, ctx) {
    var n = by(ctx, 5, R.pick([5, 6]), R.pick([6, 7])), base = R.int(12, 60) * 10, xs = [];
    for (var i = 0; i < n; i++) xs.push(base + R.int(-8, 8) * 5);
    var list = xs.map(function (x) { return T.commas(x); }).join(', ');
    var q0 = 'The same rocket flew ' + n + ' times. The tracking team measured these heights in meters: $' + list.replace(/,(?=\d{3})/g, '{,}') + '$. ';
    var ask = by(ctx, R.pick(['mean', 'range']), R.pick(['mean', 'range', 'median']), R.pick(['median', 'sd', 'sd']));
    if (ask === 'mean') { var m = mean(xs); return {
      q: q0 + 'What is the mean height?', a: A(m, 4, 0.002), unit: 'm',
      steps: ['Add them: $' + xs.join(' + ') + ' = ' + T.commas(xs.reduce(function (s, x) { return s + x; }, 0)) + '$.', 'Divide by ' + n + ': mean ' + '$' + eqa(m, 4) + '\\ \\text{m}$.'],
      hint: 'Add all the heights and divide by how many there are.', d: { k: 'mean', xs: xs }
    }; }
    if (ask === 'range') { var mx = Math.max.apply(null, xs), mn = Math.min.apply(null, xs); return {
      q: q0 + 'What is the range of the heights?', a: AX(mx - mn), unit: 'm',
      steps: ['Range = highest minus lowest.', '$' + mx + ' - ' + mn + ' = ' + (mx - mn) + '\\ \\text{m}$.'],
      hint: 'Highest minus lowest.', d: { k: 'range', xs: xs }
    }; }
    if (ask === 'median') { var s = xs.slice().sort(function (a, b) { return a - b; }), md = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; return {
      q: q0 + 'What is the median height?', a: AX(md), unit: 'm',
      steps: ['In order: $' + s.join(',\\ ') + '$.', s.length % 2 ? 'With ' + s.length + ' values the median is the middle one: $' + md + '\\ \\text{m}$.' : 'With ' + s.length + ' values the median is halfway between the two middle ones: $\\dfrac{' + s[s.length / 2 - 1] + ' + ' + s[s.length / 2] + '}{2} = ' + tv(md) + '\\ \\text{m}$.'],
      hint: 'Sort the list first.', d: { k: 'median', xs: xs }
    }; }
    var mm = mean(xs), sd = sdev(xs), ss = xs.reduce(function (t, x) { return t + (x - mm) * (x - mm); }, 0);
    return {
      q: q0 + 'What is the sample standard deviation of the heights?', a: A(sd, 3, 0.02), unit: 'm',
      steps: ['Mean: $\\bar x ' + eqa(mm, 4) + '$.', 'Sum of squared differences from the mean: $\\sum (x - \\bar x)^2 ' + eqa(ss, 4) + '$.', 'Divide by $n - 1 = ' + (n - 1) + '$ and take the square root: $s = \\sqrt{' + tn(ss / (n - 1), 4) + '} ' + eqa(sd) + '\\ \\text{m}$.'],
      hint: 'Find the mean, square each difference from it, add, divide by n − 1, take the square root.', d: { k: 'sd', xs: xs }
    };
  }));

  // ===================================================================== Unit 2: Pushing Off

  // ---------- rocket.newtons-laws-thrust
  var LAWQ = [
    ['A rocket pushes hot gas down out of its nozzle. Which law says the gas pushes the rocket up just as hard?', 'The third law', ['The first law', 'The second law', 'The law of gravitation']],
    ['A rocket sits on its pad, not moving, because the forces on it balance. Which law describes this?', 'The first law', ['The second law', 'The third law', 'The law of gravitation']],
    ['A rocket with twice the net force on it (and the same mass) speeds up twice as fast. Which law says so?', 'The second law', ['The first law', 'The third law', 'The law of gravitation']],
    ['After burnout, a rocket keeps going up for a while with no thrust at all. Which law explains why it doesn\'t stop at once?', 'The first law', ['The second law', 'The third law', 'Bernoulli\'s principle']]
  ];
  G('rocket.newtons-laws-thrust', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['law', 'acc', 'acc']), R.pick(['law', 'acc', 'net', 'thrust']), R.pick(['acc', 'thrust', 'mass']));
    var mg = R.int(6, 40) * 5, m = mg / 1000, W_ = m * g, Tn = fx(W_ * R.real(2.5, 8, 1)), Tr = sg(Tn, 2);
    if (kind === 'law') { var L = R.pick(LAWQ); return {
      q: L[0], a: MC(L[1], L[2]),
      steps: ['First law: without a net force, motion doesn\'t change. Second law: $F_\\text{net} = ma$. Third law: forces come in equal and opposite pairs.', 'Here: ' + L[1].toLowerCase() + '.'],
      hint: 'Is it about a pair of forces, about balance, or about how much it speeds up?', d: { k: 'law', ans: L[1] }
    }; }
    if (kind === 'acc' || kind === 'net') { var Fn = Tr - W_, a = Fn / m; return {
      q: 'A ' + mg + ' g model rocket has a thrust of $' + gv(Tr, 'N') + '$ just after liftoff. ' + (kind === 'net' ? 'What is the net force on it?' : 'What is its upward acceleration?'),
      a: kind === 'net' ? A(Fn) : A(a), unit: kind === 'net' ? 'N' : 'm/s2',
      steps: ['Mass in kilograms: $m = ' + tv(m) + '\\ \\text{kg}$. Weight: $mg = ' + tv(m) + '(9.8) ' + eqa(W_) + '\\ \\text{N}$.', 'Net force (up is positive): $F_\\text{net} = ' + tv(Tr) + ' - ' + tn(W_) + ' ' + eqa(Fn) + '\\ \\text{N}$.'].concat(kind === 'net' ? [] : ['$a = \\dfrac{F_\\text{net}}{m} = \\dfrac{' + tn(Fn, 4) + '}{' + tv(m) + '} ' + eqa(a) + '\\ \\text{m/s}^2$.']),
      hint: 'Weight pulls down while thrust pushes up. Use the net force.', d: { k: kind, m: m, T: Tr }
    }; }
    if (kind === 'thrust') { var aw = R.int(2, 12) * 5, Th = m * (aw + g); return {
      q: 'A ' + mg + ' g rocket leaves the pad with an upward acceleration of $' + gv(aw, 'm/s2') + '$. What thrust is its motor giving?', a: A(Th), unit: 'N',
      steps: ['$F_\\text{net} = T - mg = ma$, so $T = m(a + g)$.', '$T = ' + tv(m) + '(' + aw + ' + 9.8) ' + eqa(Th) + '\\ \\text{N}$.'],
      hint: 'The thrust has to hold up the weight and give the acceleration too.', d: { k: 'thrust', m: m, a: aw }
    }; }
    var a2 = R.int(3, 10) * 5, mk = Tr / (a2 + g);
    return {
      q: 'A motor gives a thrust of $' + gv(Tr, 'N') + '$, and the rocket rises with an acceleration of $' + gv(a2, 'm/s2') + '$. What is the rocket\'s mass, in grams?', a: A(mk * 1000), unit: 'g',
      steps: ['$T - mg = ma$, so $m = \\dfrac{T}{a + g}$.', '$m = \\dfrac{' + tv(Tr) + '}{' + a2 + ' + 9.8} ' + eqa(mk, 3) + '\\ \\text{kg}$, which is $' + tn(mk * 1000) + '\\ \\text{g}$.'],
      hint: 'Solve T − mg = ma for m.', d: { k: 'mass', T: Tr, a: a2 }
    };
  }));

  // ---------- rocket.thrust-to-weight
  G('rocket.thrust-to-weight', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['twr', 'lift']), R.pick(['twr', 'lift', 'rod', 'minT']), R.pick(['rod', 'minT', 'rodv']));
    var mg = R.int(8, 60) * 5, m = mg / 1000, Wt = m * g;
    if (kind === 'twr' || kind === 'lift') {
      var r = kind === 'lift' ? R.pick([0.6, 0.8, 0.9, 1.5, 3, 5]) : R.real(2, 9, 1), Tr = sg(Wt * r, 2), ratio = Tr / Wt;
      if (kind === 'twr') return {
        q: 'A ' + mg + ' g rocket has a thrust of $' + gv(Tr, 'N') + '$. What is its thrust-to-weight ratio?', a: A(ratio),
        steps: ['Weight: $mg = ' + tv(m) + '(9.8) ' + eqa(Wt) + '\\ \\text{N}$.', 'Ratio: $\\dfrac{T}{mg} = \\dfrac{' + tv(Tr) + '}{' + tn(Wt) + '} ' + eqa(ratio) + '$ (no units: newtons over newtons).'],
        hint: 'Divide the thrust by the weight, both in newtons.', d: { k: 'twr', m: m, T: Tr }
      };
      var lifts = Tr > Wt;
      return {
        q: 'A ' + mg + ' g rocket has a motor whose thrust is $' + gv(Tr, 'N') + '$. Will it lift off the pad?', a: MC(lifts ? 'Yes: thrust is more than its weight' : 'No: thrust is less than its weight', [lifts ? 'No: thrust is less than its weight' : 'Yes: thrust is more than its weight', 'Yes: any thrust lifts a rocket', 'It depends only on the burn time']),
        steps: ['Weight: $' + tv(m) + '(9.8) ' + eqa(Wt) + '\\ \\text{N}$.', 'Thrust $' + gv(Tr, 'N') + '$ is ' + (lifts ? 'more' : 'less') + ' than that, so the rocket ' + (lifts ? 'rises' : 'stays on the pad') + '.'],
        hint: 'Compare the thrust with the weight in newtons.', d: { k: 'lift', m: m, T: Tr }
      };
    }
    if (kind === 'minT') { var rr = R.pick([3, 4, 5]), need = rr * Wt; return {
      q: 'A rocket club wants its rockets to leave the pad with a thrust-to-weight ratio of ' + rr + ', so they are moving fast by the end of the launch rod. What thrust gives a ' + mg + ' g rocket a ratio of ' + rr + '?', a: A(need), unit: 'N',
      steps: ['$T = ' + rr + ' \\times mg = ' + rr + '(' + tv(m) + ')(9.8) ' + eqa(need) + '\\ \\text{N}$.'],
      hint: 'Multiply the weight by the ratio.', d: { k: 'minT', m: m, r: rr }
    }; }
    var Tr2 = sg(Wt * R.real(3, 8, 1), 2), a = (Tr2 - Wt) / m, Lr = R.pick([0.9, 1.0, 1.2, 1.5]), v = sqrt(2 * a * Lr);
    if (kind === 'rod') return {
      q: 'A ' + mg + ' g rocket with $' + gv(Tr2, 'N') + '$ of thrust slides up a $' + gv(Lr, 'm') + '$ launch rod. How fast is it moving as it leaves the rod? (Treat the thrust as steady and ignore friction.)', a: A(v), unit: 'm/s',
      steps: ['$a = \\dfrac{T - mg}{m} = \\dfrac{' + tv(Tr2) + ' - ' + tn(Wt) + '}{' + tv(m) + '} ' + eqa(a) + '\\ \\text{m/s}^2$.', 'From rest, $v^2 = 2aL$: $v = \\sqrt{2(' + tn(a) + ')(' + tv(Lr) + ')} ' + eqa(v) + '\\ \\text{m/s}$.'],
      hint: 'Find the acceleration, then use v² = 2aL.', d: { k: 'rod', m: m, T: Tr2, L: Lr }
    };
    var vt = R.pick([10, 12, 14, 15]), aa = vt * vt / (2 * Lr), Tn = m * (aa + g);
    return {
      q: 'A ' + mg + ' g rocket should leave its $' + gv(Lr, 'm') + '$ rod at $' + gv(vt, 'm/s') + '$. What steady thrust does it need? (Ignore friction.)', a: A(Tn), unit: 'N',
      steps: ['$v^2 = 2aL$, so $a = \\dfrac{' + vt + '^2}{2(' + tv(Lr) + ')} ' + eqa(aa) + '\\ \\text{m/s}^2$.', '$T = m(a + g) = ' + tv(m) + '(' + tn(aa, 4) + ' + 9.8) ' + eqa(Tn) + '\\ \\text{N}$.'],
      hint: 'Work backward: speed gives acceleration, acceleration gives thrust.', d: { k: 'rodv', m: m, v: vt, L: Lr }
    };
  }));

  // ---------- rocket.impulse-momentum
  var CLASSES = [['A', 1.26, 2.5], ['B', 2.5, 5], ['C', 5, 10], ['D', 10, 20], ['E', 20, 40], ['F', 40, 80]];
  G('rocket.impulse-momentum', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['avg', 'avg', 'class']), R.pick(['avg', 'tri', 'dv', 'class']), R.pick(['tri', 'dv', 'dvg', 'trap']));
    var Fa = R.real(3, 12, 1), tb = R.pick([0.5, 0.6, 0.8, 1.0, 1.2, 1.6, 2.0]), J = Fa * tb;
    if (kind === 'avg') return {
      q: 'A certified motor gives an average thrust of $' + gv(Fa, 'N') + '$ for $' + gv(tb, 's') + '$. What total impulse does it deliver?', a: A(J), unit: 'N·s',
      steps: ['Total impulse is the area under the thrust-time curve; with an average thrust it is $J = F_\\text{avg}\\,t$.', '$J = ' + tv(Fa) + '(' + tv(tb) + ') ' + eqa(J) + '\\ \\text{N}\\cdot\\text{s}$.'],
      hint: 'Impulse = force × time.', d: { k: 'avg', F: Fa, t: tb }
    };
    if (kind === 'class') { var c = R.pick(CLASSES), Jc = fx(R.real(c[1] + 0.1, c[2] - 0.1, 1)); return {
      q: 'Motor letter classes go by total impulse: A is up to $2.5\\ \\text{N}\\cdot\\text{s}$, and each letter after it allows twice as much (B up to 5, C up to 10, and so on). A motor\'s package lists a total impulse of $' + gv(Jc, 'N·s') + '$. Which class is it?',
      a: MC(c[0], CLASSES.map(function (x) { return x[0]; })),
      steps: ['The class limits are A 2.5, B 5, C 10, D 20, E 40, F 80 newton-seconds.', '$' + tv(Jc) + '$ is above ' + c[1] + ' and no more than ' + c[2] + ', so it is class ' + c[0] + '.'],
      hint: 'Double 2.5 until you pass the motor\'s impulse.', d: { k: 'class', J: Jc, ans: c[0] }
    }; }
    if (kind === 'tri' || kind === 'trap') {
      var Fp = R.int(8, 30), tp = R.pick([0.2, 0.25, 0.3, 0.4]), tend = R.pick([0.8, 1.0, 1.2, 1.5]), Fs = R.int(2, 6), Jt;
      if (kind === 'tri') { Jt = 0.5 * Fp * tend; return {
        q: 'A thrust curve is a triangle: thrust rises from 0 to a peak of $' + gv(Fp, 'N') + '$ and falls back to 0 at $t = ' + gv(tend, 's') + '$. What is the total impulse?', a: A(Jt), unit: 'N·s',
        steps: ['Impulse is the area under the curve. Here the area is a triangle.', '$J = \\tfrac12 (' + tv(tend) + ')(' + Fp + ') ' + eqa(Jt) + '\\ \\text{N}\\cdot\\text{s}$. (Peak thrust times burn time would be twice too big.)'],
        hint: 'Area of a triangle.', d: { k: 'tri', Fp: Fp, te: tend }
      }; }
      Jt = 0.5 * Fp * tp + 0.5 * (Fp + Fs) * 0 + Fs * (tend - tp) + 0.5 * (Fp - Fs) * 0;
      // spike then plateau: up to Fp at tp (triangle), straight drop to Fs, then flat Fs until tend
      Jt = 0.5 * Fp * tp + Fs * (tend - tp);
      return {
        q: 'A motor\'s thrust rises steadily from 0 to $' + gv(Fp, 'N') + '$ at $t = ' + gv(tp, 's') + '$, then drops at once to a steady $' + gv(Fs, 'N') + '$ until it stops at $t = ' + gv(tend, 's') + '$. What is the total impulse?', a: A(Jt), unit: 'N·s',
        steps: ['Split the area: a triangle, then a rectangle.', 'Triangle: $\\tfrac12 (' + tv(tp) + ')(' + Fp + ') ' + eqa(0.5 * Fp * tp) + '$. Rectangle: $' + Fs + '(' + tv(fx(tend - tp)) + ') ' + eqa(Fs * (tend - tp)) + '$.', 'Total: $J ' + eqa(Jt) + '\\ \\text{N}\\cdot\\text{s}$.'],
        hint: 'Break the shape into pieces whose areas you know.', d: { k: 'trap', Fp: Fp, tp: tp, Fs: Fs, te: tend }
      };
    }
    var mg = R.int(10, 40) * 5, m = mg / 1000, dv = J / m;
    if (kind === 'dv') return {
      q: 'A motor delivers $' + gv(fx(J), 'N·s') + '$ of total impulse to a ' + mg + ' g rocket. Ignoring gravity, drag and the mass of the burned propellant, what speed does it give the rocket?', a: A(dv), unit: 'm/s',
      steps: ['Impulse equals change in momentum: $J = m\\,\\Delta v$.', '$\\Delta v = \\dfrac{' + tv(fx(J)) + '}{' + tv(m) + '} ' + eqa(dv) + '\\ \\text{m/s}$.'],
      hint: 'J = m Δv.', d: { k: 'dv', J: fx(J), m: m }
    };
    var dvg = (J - m * g * tb) / m;
    if (dvg <= 0) { Fa = fx(Fa + 10); J = Fa * tb; dvg = (J - m * g * tb) / m; }
    return {
      q: 'A ' + mg + ' g rocket flies straight up. Its motor gives an average thrust of $' + gv(Fa, 'N') + '$ for $' + gv(tb, 's') + '$. Including gravity (but not drag, and treating the mass as constant), what is its speed at burnout?', a: A(dvg), unit: 'm/s',
      steps: ['Net impulse = thrust impulse minus gravity\'s: $J_\\text{net} = (F - mg)\\,t$.', '$J_\\text{net} = (' + tv(Fa) + ' - ' + tn(m * g) + ')(' + tv(tb) + ') ' + eqa((Fa - m * g) * tb) + '\\ \\text{N}\\cdot\\text{s}$.', '$\\Delta v = J_\\text{net}/m ' + eqa(dvg) + '\\ \\text{m/s}$.'],
      hint: 'Gravity takes away mg × t of the impulse.', d: { k: 'dvg', F: Fa, t: tb, m: m }
    };
  }));

  // ---------- rocket.rocket-equation
  G('rocket.rocket-equation', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['dv', 'dv', 'thrust']), R.pick(['dv', 'mr', 'thrust', 've']), R.pick(['mr', 've', 'grav', 'frac']));
    var ve = R.int(16, 45) * 50, m0 = R.int(10, 60) * 10, mf = fx(m0 * R.real(0.3, 0.85, 2));
    if (kind === 'dv') { var dv = ve * ln(m0 / mf); return {
      q: 'A rocket starts at $' + gv(m0, 'kg') + '$ and burns down to $' + gv(mf, 'kg') + '$. Its exhaust leaves at $' + gv(ve, 'm/s') + '$ relative to the rocket. Ignoring gravity and drag, what change in speed does it get?', a: A(dv), unit: 'm/s',
      steps: ['Tsiolkovsky: $\\Delta v = v_e \\ln\\dfrac{m_0}{m_f}$.', 'Mass ratio: $\\dfrac{' + tv(m0) + '}{' + tv(mf) + '} ' + eqa(m0 / mf, 4) + '$.', '$\\Delta v = ' + tv(ve) + '\\ln(' + tn(m0 / mf, 4) + ') ' + eqa(dv) + '\\ \\text{m/s}$.'],
      hint: 'Full mass over empty mass inside the logarithm.', d: { k: 'dv', ve: ve, m0: m0, mf: mf }
    }; }
    if (kind === 'mr' || kind === 'frac') { var dvt = R.int(10, 60) * 100, MR = Math.exp(dvt / ve), fr = 1 - 1 / MR;
      if (kind === 'mr') return {
        q: 'A rocket\'s exhaust speed is $' + gv(ve, 'm/s') + '$. What mass ratio $m_0/m_f$ does it need to gain $' + gv(dvt, 'm/s') + '$, ignoring gravity and drag?', a: A(MR),
        steps: ['$\\Delta v = v_e \\ln(m_0/m_f)$, so $\\dfrac{m_0}{m_f} = e^{\\Delta v / v_e}$.', '$\\dfrac{\\Delta v}{v_e} = \\dfrac{' + tv(dvt) + '}{' + tv(ve) + '} ' + eqa(dvt / ve, 4) + '$.', '$e^{' + tn(dvt / ve, 4) + '} ' + eqa(MR) + '$.'],
        hint: 'Undo the logarithm with the exponential.', d: { k: 'mr', ve: ve, dv: dvt }
      };
      return {
        q: 'A rocket\'s exhaust speed is $' + gv(ve, 'm/s') + '$. To gain $' + gv(dvt, 'm/s') + '$ (ignoring gravity and drag), what percent of its starting mass must be propellant?', a: { t: 'num', v: sv(fr * 100, 3), rtol: 0.02, pct: true },
        steps: ['Mass ratio: $\\dfrac{m_0}{m_f} = e^{' + tv(dvt) + '/' + tv(ve) + '} ' + eqa(MR) + '$.', 'The empty part is $\\dfrac{m_f}{m_0} = \\dfrac{1}{' + tn(MR) + '}$, so the propellant part is $1 - \\dfrac{1}{' + tn(MR) + '} ' + eqa(fr) + '$.', 'That is about $' + tn(fr * 100) + '\\%$.'],
        hint: 'Find the mass ratio first; the propellant fraction is 1 − m_f/m_0.', d: { k: 'frac', ve: ve, dv: dvt }
      };
    }
    if (kind === 've') { var dv2 = R.int(10, 50) * 100, vv = dv2 / ln(m0 / mf); return {
      q: 'Burning from $' + gv(m0, 'kg') + '$ down to $' + gv(mf, 'kg') + '$ gives a rocket $' + gv(dv2, 'm/s') + '$ of speed (ignoring gravity and drag). What is its exhaust speed?', a: A(vv), unit: 'm/s',
      steps: ['$v_e = \\dfrac{\\Delta v}{\\ln(m_0/m_f)}$.', '$\\ln\\dfrac{' + tv(m0) + '}{' + tv(mf) + '} ' + eqa(ln(m0 / mf), 4) + '$.', '$v_e = \\dfrac{' + tv(dv2) + '}{' + tn(ln(m0 / mf), 4) + '} ' + eqa(vv) + '\\ \\text{m/s}$.'],
      hint: 'Divide the speed change by the logarithm of the mass ratio.', d: { k: 've', dv: dv2, m0: m0, mf: mf }
    }; }
    if (kind === 'thrust') { var md = R.real(0.5, 9, 1), Th = md * ve; return {
      q: 'A rocket engine throws out $' + gv(md, 'kg/s') + '$ of exhaust at $' + gv(ve, 'm/s') + '$ relative to the rocket. What thrust does that give? (Ignore the pressure term.)', a: A(Th), unit: 'N',
      steps: ['Each second, momentum $\\dot m\\,v_e$ goes out the back, so the thrust is $T = \\dot m\\,v_e$.', '$T = ' + tv(md) + '(' + tv(ve) + ') ' + eqa(Th) + '\\ \\text{N}$.'],
      hint: 'Thrust = mass flow rate × exhaust speed.', d: { k: 'thrust', md: md, ve: ve }
    }; }
    var tb = R.int(20, 120), dvi = ve * ln(m0 / mf), dvg = dvi - g * tb;
    if (dvg <= 0) { tb = Math.max(5, Math.floor(dvi / g / 2)); dvg = dvi - g * tb; }
    return {
      q: 'A rocket burns from $' + gv(m0, 'kg') + '$ down to $' + gv(mf, 'kg') + '$ in $' + gv(tb, 's') + '$, flying straight up. Its exhaust speed is $' + gv(ve, 'm/s') + '$. Including the loss to gravity (but not drag), what is its speed at burnout?', a: A(dvg), unit: 'm/s',
      steps: ['Vertical flight: $\\Delta v = v_e \\ln\\dfrac{m_0}{m_f} - g\\,t_b$.', 'Rocket part: $' + tv(ve) + '\\ln(' + tn(m0 / mf, 4) + ') ' + eqa(dvi, 4) + '\\ \\text{m/s}$. Gravity loss: $9.8(' + tb + ') = ' + tv(fx(g * tb)) + '\\ \\text{m/s}$.', '$\\Delta v ' + eqa(dvg) + '\\ \\text{m/s}$.'],
      hint: 'Gravity takes away g × burn time.', d: { k: 'grav', ve: ve, m0: m0, mf: mf, tb: tb }
    };
  }));

  // ---------- rocket.nozzles-concept
  var NOZQ = [
    ['Gas moving slower than sound flows into a part of a pipe that gets narrower. What happens to its speed?', 'It speeds up', ['It slows down', 'It stays the same', 'It stops']],
    ['Gas moving faster than sound flows into a part of a nozzle that gets wider. What happens to its speed?', 'It speeds up', ['It slows down', 'It stays the same', 'It drops below the speed of sound at once']],
    ['In a nozzle that narrows and then widens, where does the gas reach the speed of sound?', 'At the narrowest point, the throat', ['At the entrance', 'At the exit', 'Never']],
    ['Two engines throw out the same mass of exhaust each second, but one\'s exhaust is twice as fast. How do their thrusts compare (ignoring pressure)?', 'The faster one has twice the thrust', ['They are the same', 'The faster one has four times the thrust', 'The faster one has half the thrust']],
    ['As the gas speeds up through the widening part of a rocket nozzle, what happens to its pressure and temperature?', 'Both fall', ['Both rise', 'Pressure rises, temperature falls', 'Neither changes']]
  ];
  G('rocket.nozzles-concept', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['idea', 'idea', 'thrust']), R.pick(['idea', 'thrust', 've']), R.pick(['idea', 've', 'press']));
    if (kind === 'idea') { var Q = R.pick(NOZQ); return {
      q: Q[0], a: MC(Q[1], Q[2]),
      steps: ['Below the speed of sound, a narrowing pipe speeds gas up and a widening one slows it. Above the speed of sound it is the other way around.', 'The flow reaches the speed of sound at the throat, so the widening part beyond it keeps speeding it up, while pressure and temperature fall.', 'Thrust (ignoring pressure) is mass flow times exhaust speed.', 'Answer: ' + Q[1].toLowerCase() + '.'],
      hint: 'Ask whether the gas is slower or faster than sound.', d: { k: 'idea', ans: Q[1] }
    }; }
    var md = R.real(0.2, 6, 2), ve = R.int(15, 40) * 100;
    if (kind === 'thrust') { var Th = md * ve; return {
      q: 'An engine\'s nozzle sends out $' + gv(md, 'kg/s') + '$ of exhaust at $' + gv(ve, 'm/s') + '$. What thrust does the exhaust give (ignoring the pressure term)?', a: A(Th), unit: 'N',
      steps: ['$T = \\dot m\\,v_e = ' + tv(md) + '(' + tv(ve) + ') ' + eqa(Th) + '\\ \\text{N}$.'], hint: 'Mass flow × exhaust speed.', d: { k: 'thrust', md: md, ve: ve }
    }; }
    if (kind === 've') { var Tt = R.int(5, 120) * 100, v2 = Tt / md; return {
      q: 'Tests show an engine makes $' + gv(Tt, 'N') + '$ of thrust while using $' + gv(md, 'kg/s') + '$ of propellant. What is its effective exhaust speed?', a: A(v2), unit: 'm/s',
      steps: ['$v_e = \\dfrac{T}{\\dot m} = \\dfrac{' + tv(Tt) + '}{' + tv(md) + '} ' + eqa(v2) + '\\ \\text{m/s}$.'], hint: 'Divide thrust by mass flow.', d: { k: 've', T: Tt, md: md }
    }; }
    var pe = R.int(40, 140) * 1000, pa = R.pick([101000, 101000, 60000, 30000]), Ae = R.pick([0.05, 0.08, 0.1, 0.2, 0.3]), Tf = md * ve + (pe - pa) * Ae;
    return {
      q: 'Full thrust adds a pressure term: $T = \\dot m\\,v_e + (p_e - p_a)A_e$. An engine has $\\dot m = ' + gv(md, 'kg/s') + '$, $v_e = ' + gv(ve, 'm/s') + '$, exit pressure $p_e = ' + gv(pe, 'Pa') + '$, outside pressure $p_a = ' + gv(pa, 'Pa') + '$ and exit area $A_e = ' + tv(Ae) + '\\ \\text{m}^2$. What is the thrust?', a: A(Tf), unit: 'N',
      steps: ['Momentum part: $' + tv(md) + '(' + tv(ve) + ') ' + eqa(md * ve) + '\\ \\text{N}$.', 'Pressure part: $(' + tv(pe) + ' - ' + tv(pa) + ')(' + tv(Ae) + ') ' + eqa((pe - pa) * Ae) + '\\ \\text{N}$' + (pe < pa ? ' (negative: the outside air pushes back harder than the exhaust pushes out).' : '.'), 'Total: $T ' + eqa(Tf) + '\\ \\text{N}$.'],
      hint: 'Add the momentum part and the pressure part; watch the sign of p_e − p_a.', d: { k: 'press', md: md, ve: ve, pe: pe, pa: pa, Ae: Ae }
    };
  }));

  // ===================================================================== Unit 3: Up and Down

  // ---------- rocket.calculus-of-motion
  G('rocket.calculus-of-motion', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['deriv', 'area']), R.pick(['deriv', 'area', 'integ']), R.pick(['deriv2', 'integ', 'apogee']));
    if (kind === 'deriv' || kind === 'deriv2') { var b = R.int(20, 80), c = 4.9, t1 = R.int(1, 5);
      var v = b - 2 * c * t1;
      if (kind === 'deriv') return {
        q: 'After burnout, a rocket\'s height (in meters, $t$ in seconds) is $h(t) = ' + tv(R.int(20, 90) * 5) + ' + ' + b + 't - 4.9t^2$. What is its velocity at $t = ' + t1 + '\\ \\text{s}$?', a: A(v, 3, 0.01), unit: 'm/s',
        steps: ['Velocity is the derivative of height: $v(t) = h\'(t) = ' + b + ' - 9.8t$.', '$v(' + t1 + ') = ' + b + ' - 9.8(' + t1 + ') ' + eqa(v) + '\\ \\text{m/s}$' + (v < 0 ? ' (negative: it is already coming down).' : '.')],
        hint: 'Differentiate term by term; the constant disappears.', d: { k: 'deriv', b: b, t: t1 }
      };
      var k = R.int(2, 9), p = R.pick([2, 3]), tt = R.pick([0.5, 1, 1.5, 2]), vv = p * k * Math.pow(tt, p - 1);
      return {
        q: 'In a test, a cart\'s position grows as $x(t) = ' + k + 't^{' + p + '}$ (meters, seconds). What is its velocity at $t = ' + tv(tt) + '\\ \\text{s}$?', a: A(vv, 3, 0.01), unit: 'm/s',
        steps: ['$v(t) = x\'(t) = ' + (p * k) + 't' + (p === 3 ? '^{2}' : '') + '$ (power rule).', '$v(' + tv(tt) + ') = ' + (p * k) + '(' + tv(tt) + ')' + (p === 3 ? '^2' : '') + ' ' + eqa(vv) + '\\ \\text{m/s}$.'],
        hint: 'Bring the power down and lower it by one.', d: { k: 'deriv2', c: k, p: p, t: tt }
      };
    }
    if (kind === 'area') { var a1 = R.int(3, 12) * 10, tb = R.pick([0.5, 1, 1.5, 2]), vb = a1 * tb; return {
      q: 'A rocket\'s acceleration graph shows a steady $' + gv(a1, 'm/s2') + '$ upward from $t = 0$ to $t = ' + gv(tb, 's') + '$, starting from rest. What is its velocity at the end of that time?', a: A(vb, 3, 0.01), unit: 'm/s',
      steps: ['The change in velocity is the area under the acceleration graph: $\\Delta v = \\int_0^{' + tv(tb) + '} a\\,dt$.', 'Here it is a rectangle: $' + a1 + ' \\times ' + tv(tb) + ' = ' + tv(vb) + '\\ \\text{m/s}$, and it started at 0.'],
      hint: 'Area under acceleration = change in velocity.', d: { k: 'area', a: a1, t: tb }
    }; }
    if (kind === 'integ') { var p2 = R.int(4, 20), q2 = R.pick([1, 2, 3]), T2 = R.int(1, 4), dx = p2 * T2 * T2 / 2 + (q2 === 1 ? 0 : 0);
      var cc = R.int(10, 40), disp = cc * T2 + p2 * T2 * T2 / 2; return {
      q: 'A rocket\'s velocity during a test is $v(t) = ' + cc + ' + ' + p2 + 't$ (m/s). How far does it rise from $t = 0$ to $t = ' + T2 + '\\ \\text{s}$?', a: A(disp, 3, 0.01), unit: 'm',
      steps: ['Displacement is the integral of velocity: $\\int_0^{' + T2 + '} (' + cc + ' + ' + p2 + 't)\\,dt$.', 'Antiderivative: $' + cc + 't + ' + tv(p2 / 2) + 't^2$.', 'At $t = ' + T2 + '$: $' + cc + '(' + T2 + ') + ' + tv(p2 / 2) + '(' + T2 + ')^2 = ' + tv(disp) + '\\ \\text{m}$.'],
      hint: 'Integrate, then put in the end time (the start gives 0).', d: { k: 'integ', c: cc, p: p2, T: T2 }
    }; }
    var h0 = R.int(10, 60) * 5, b2 = R.int(20, 70), tA = b2 / 9.8, H = h0 + b2 * tA - 4.9 * tA * tA;
    return {
      q: 'After burnout a rocket\'s height is $h(t) = ' + h0 + ' + ' + b2 + 't - 4.9t^2$ (meters, seconds). Use the derivative to find its greatest height.', a: A(H), unit: 'm',
      steps: ['At the top, $h\'(t) = 0$: $' + b2 + ' - 9.8t = 0$, so $t ' + eqa(tA, 4) + '\\ \\text{s}$.', '$h ' + eqa(H) + '\\ \\text{m}$.'],
      hint: 'Set the derivative to zero, then put that time back into h(t).', d: { k: 'apogee', h0: h0, b: b2 }
    };
  }));

  // ---------- rocket.powered-flight
  G('rocket.powered-flight', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['vb', 'hb']), R.pick(['vb', 'hb', 'fromT']), R.pick(['fromT', 'hfromT', 'tb']));
    var a = R.int(4, 20) * 5, tb = R.pick([0.8, 1, 1.2, 1.5, 1.8, 2, 2.5]), vb = a * tb, hb = 0.5 * a * tb * tb;
    if (kind === 'vb') return {
      q: 'A rocket rises from rest with a steady net acceleration of $' + gv(a, 'm/s2') + '$ while its motor burns for $' + gv(tb, 's') + '$. What is its speed at burnout?', a: A(vb, 3, 0.01), unit: 'm/s',
      steps: ['$v_b = a\\,t_b = ' + a + '(' + tv(tb) + ') = ' + tv(fx(vb)) + '\\ \\text{m/s}$.'], hint: 'v = at from rest.', d: { k: 'vb', a: a, t: tb }
    };
    if (kind === 'hb') return {
      q: 'A rocket rises from rest with a steady net acceleration of $' + gv(a, 'm/s2') + '$ while its motor burns for $' + gv(tb, 's') + '$. How high is it at burnout?', a: A(hb, 3, 0.01), unit: 'm',
      steps: ['$h_b = \\tfrac12 a t_b^2 = \\tfrac12 (' + a + ')(' + tv(tb) + ')^2 ' + eqa(hb) + '\\ \\text{m}$.'], hint: 'h = ½at² from rest.', d: { k: 'hb', a: a, t: tb }
    };
    var mg = R.int(20, 80) * 5, m = mg / 1000, Tr = sg(m * g * R.real(3, 9, 1), 2), an = (Tr - m * g) / m;
    if (kind === 'tb') { var vt = R.int(4, 16) * 5, t3 = vt / an; return {
      q: 'A ' + mg + ' g rocket has a steady thrust of $' + gv(Tr, 'N') + '$ (treat its mass as constant). How long must the motor burn for the rocket to reach $' + gv(vt, 'm/s') + '$?', a: A(t3), unit: 's',
      steps: ['$a = \\dfrac{T - mg}{m} = \\dfrac{' + tv(Tr) + ' - ' + tn(m * g) + '}{' + tv(m) + '} ' + eqa(an) + '\\ \\text{m/s}^2$.', '$t = \\dfrac{v}{a} = \\dfrac{' + vt + '}{' + tn(an, 4) + '} ' + eqa(t3) + '\\ \\text{s}$.'],
      hint: 'Get the net acceleration, then t = v/a.', d: { k: 'tb', m: m, T: Tr, v: vt }
    }; }
    var vb2 = an * tb, hb2 = 0.5 * an * tb * tb, isH = kind === 'hfromT';
    return {
      q: 'A ' + mg + ' g rocket has a steady thrust of $' + gv(Tr, 'N') + '$ for $' + gv(tb, 's') + '$ (treat its mass as constant, ignore drag). What is its ' + (isH ? 'height' : 'speed') + ' at burnout?', a: A(isH ? hb2 : vb2), unit: isH ? 'm' : 'm/s',
      steps: ['Net acceleration: $a = \\dfrac{T - mg}{m} = \\dfrac{' + tv(Tr) + ' - ' + tn(m * g) + '}{' + tv(m) + '} ' + eqa(an) + '\\ \\text{m/s}^2$.', isH ? '$h_b = \\tfrac12 a t_b^2 = \\tfrac12(' + tn(an, 4) + ')(' + tv(tb) + ')^2 ' + eqa(hb2) + '\\ \\text{m}$.' : '$v_b = a\\,t_b = ' + tn(an, 4) + '(' + tv(tb) + ') ' + eqa(vb2) + '\\ \\text{m/s}$.'],
      hint: 'Subtract the weight before dividing by the mass.', d: { k: kind, m: m, T: Tr, t: tb }
    };
  }));

  // ---------- rocket.coasting-apogee
  G('rocket.coasting-apogee', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['tc', 'rise']), R.pick(['tc', 'rise', 'apogee', 'fall']), R.pick(['apogee', 'fall', 'delay', 'total']));
    var vb = R.int(10, 50) * 2, hb = R.int(4, 40) * 5, tc = vb / g, rise = vb * vb / (2 * g), H = hb + rise;
    var q0 = 'At burnout a rocket is $' + gv(hb, 'm') + '$ up and moving straight up at $' + gv(vb, 'm/s') + '$. Ignore drag. ';
    if (kind === 'tc') return { q: q0 + 'How long does it coast upward before it stops?', a: A(tc), unit: 's',
      steps: ['It slows by $9.8\\ \\text{m/s}$ each second until $v = 0$.', '$t = \\dfrac{v_b}{g} = \\dfrac{' + vb + '}{9.8} ' + eqa(tc) + '\\ \\text{s}$.'], hint: 'v = v_b − gt = 0.', d: { k: 'tc', vb: vb } };
    if (kind === 'rise') return { q: q0 + 'How much higher does it climb after burnout?', a: A(rise), unit: 'm',
      steps: ['At the top $v = 0$: $0 = v_b^2 - 2g\\,\\Delta h$.', '$\\Delta h = \\dfrac{' + vb + '^2}{2(9.8)} ' + eqa(rise) + '\\ \\text{m}$.'], hint: 'Use v² = v_b² − 2gΔh.', d: { k: 'rise', vb: vb } };
    if (kind === 'apogee') return { q: q0 + 'How high is its apogee (highest point) above the ground?', a: A(H), unit: 'm',
      steps: ['Coast height: $\\dfrac{v_b^2}{2g} = \\dfrac{' + vb + '^2}{19.6} ' + eqa(rise) + '\\ \\text{m}$.', 'Apogee $= ' + hb + ' + ' + tn(rise, 4) + ' ' + eqa(H) + '\\ \\text{m}$.'], hint: 'Add the burnout height.', d: { k: 'apogee', vb: vb, hb: hb } };
    var tf = sqrt(2 * H / g);
    if (kind === 'fall') return { q: q0 + 'If it fell freely from apogee (no parachute), how long would the fall to the ground take?', a: A(tf), unit: 's',
      steps: ['Apogee: $' + hb + ' + \\dfrac{' + vb + '^2}{19.6} ' + eqa(H) + '\\ \\text{m}$.', 'From rest: $H = \\tfrac12 g t^2$, so $t = \\sqrt{2H/g} ' + eqa(tf) + '\\ \\text{s}$.'], hint: 'Find the apogee first, then fall from rest.', d: { k: 'fall', vb: vb, hb: hb } };
    if (kind === 'total') { var tb = R.pick([1, 1.5, 2]), tt = tb + tc; return { q: q0 + 'The motor burned for $' + gv(tb, 's') + '$. How many seconds after liftoff does the rocket reach apogee?', a: A(tt), unit: 's',
      steps: ['Coasting time: $' + vb + '/9.8 ' + eqa(tc) + '\\ \\text{s}$.', 'Total: $' + tv(tb) + ' + ' + tn(tc) + ' ' + eqa(tt) + '\\ \\text{s}$.'], hint: 'Burn time plus coast time.', d: { k: 'total', vb: vb, tb: tb } }; }
    var delays = [3, 4, 5, 6, 7, 8], best = delays.reduce(function (b, d) { return abs(d - tc) < abs(b - tc) ? d : b; }, 3);
    if (tc < 2.6 || tc > 8.4) { vb = R.int(30, 75); tc = vb / g; best = delays.reduce(function (b, d) { return abs(d - tc) < abs(b - tc) ? d : b; }, 3); q0 = 'At burnout a rocket is $' + gv(hb, 'm') + '$ up and moving straight up at $' + gv(vb, 'm/s') + '$. Ignore drag. '; }
    return { q: q0 + 'A model rocket motor\'s delay is the time from burnout until the parachute comes out; it should be about the coasting time. Which delay fits best?', a: MC(best + ' s', delays.filter(function (d) { return d !== best; }).map(function (d) { return d + ' s'; }).slice(0, 3)),
      steps: ['Coasting time: $\\dfrac{v_b}{g} = \\dfrac{' + vb + '}{9.8} ' + eqa(tc) + '\\ \\text{s}$.', 'The closest delay is ' + best + ' s. (Drag makes the real coast a little shorter.)'], hint: 'The parachute should come out near the top, when the rocket is slowest.', d: { k: 'delay', vb: vb, ans: best } };
  }));

  // ---------- rocket.energy-burnout-apogee
  G('rocket.energy-burnout-apogee', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['ke', 'pe']), R.pick(['ke', 'rise', 'pe']), R.pick(['rise', 'lost', 'vfromh']));
    var mg = R.int(20, 100) * 5, m = mg / 1000, vb = R.int(15, 60) * 2, hb = R.int(4, 30) * 5;
    if (kind === 'ke') { var K = 0.5 * m * vb * vb; return { q: 'A ' + mg + ' g rocket is moving at $' + gv(vb, 'm/s') + '$ at burnout. What is its kinetic energy?', a: A(K), unit: 'J',
      steps: ['$K = \\tfrac12 m v^2 = \\tfrac12(' + tv(m) + ')(' + vb + ')^2 ' + eqa(K) + '\\ \\text{J}$.'], hint: 'Mass in kilograms.', d: { k: 'ke', m: m, v: vb } }; }
    if (kind === 'pe') { var H = R.int(10, 80) * 10, U = m * g * H; return { q: 'A ' + mg + ' g rocket reaches $' + gv(H, 'm') + '$. How much gravitational potential energy has it gained since leaving the ground?', a: A(U), unit: 'J',
      steps: ['$U = mgh = ' + tv(m) + '(9.8)(' + H + ') ' + eqa(U) + '\\ \\text{J}$.'], hint: 'U = mgh, with m in kg.', d: { k: 'pe', m: m, h: H } }; }
    var rise = vb * vb / (2 * g);
    if (kind === 'rise') return { q: 'A ' + mg + ' g rocket burns out $' + gv(hb, 'm') + '$ up, moving straight up at $' + gv(vb, 'm/s') + '$. Use energy (no drag) to find its apogee above the ground.', a: A(hb + rise), unit: 'm',
      steps: ['From burnout to apogee, kinetic energy becomes potential energy: $\\tfrac12 m v_b^2 = m g\\,\\Delta h$.', 'The mass cancels: $\\Delta h = \\dfrac{v_b^2}{2g} = \\dfrac{' + vb + '^2}{19.6} ' + eqa(rise) + '\\ \\text{m}$.', 'Apogee: $' + hb + ' + ' + tn(rise, 4) + ' ' + eqa(hb + rise) + '\\ \\text{m}$.'], hint: 'Measure the rise from burnout, then add the burnout height.', d: { k: 'rise', v: vb, hb: hb } };
    if (kind === 'vfromh') { var dh = R.int(20, 150), v0 = sqrt(2 * g * dh); return { q: 'A rocket coasts $' + gv(dh, 'm') + '$ higher after burnout before it stops. Using energy and ignoring drag, how fast was it going at burnout?', a: A(v0), unit: 'm/s',
      steps: ['$\\tfrac12 m v_b^2 = m g\\,\\Delta h$, so $v_b = \\sqrt{2g\\,\\Delta h}$.', '$v_b = \\sqrt{2(9.8)(' + dh + ')} ' + eqa(v0) + '\\ \\text{m/s}$.'], hint: 'Solve ½v² = gΔh.', d: { k: 'vfromh', dh: dh } }; }
    var frac = R.real(0.55, 0.9, 2), actual = fx(Math.round(hb + rise * frac)), lost = 0.5 * m * vb * vb - m * g * (actual - hb);
    return { q: 'A ' + mg + ' g rocket burns out $' + gv(hb, 'm') + '$ up at $' + gv(vb, 'm/s') + '$, but its tracked apogee is only $' + gv(actual, 'm') + '$. How much energy did drag take during the coast?', a: A(lost), unit: 'J',
      steps: ['Kinetic energy at burnout: $\\tfrac12(' + tv(m) + ')(' + vb + ')^2 ' + eqa(0.5 * m * vb * vb) + '\\ \\text{J}$.', 'Potential energy gained after burnout: $' + tv(m) + '(9.8)(' + tv(actual) + ' - ' + hb + ') ' + eqa(m * g * (actual - hb)) + '\\ \\text{J}$.', 'The difference went to the air: $' + eqa(lost) + '\\ \\text{J}$.'], hint: 'Energy at burnout minus energy gained, measured from burnout.', d: { k: 'lost', m: m, v: vb, hb: hb, H: actual } };
  }));

  // ---------- rocket.drag
  G('rocket.drag', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['force', 'idea']), R.pick(['force', 'decel', 'scale']), R.pick(['step', 'step2', 'decel']));
    var rho = 1.2, Cd = R.pick([0.5, 0.6, 0.75]), dcm = R.pick([2.5, 3, 4, 5]), Ar = PI * Math.pow(dcm / 200, 2), v = R.int(10, 80) * 2;
    if (kind === 'idea') { var Qs = [['A rocket\'s speed doubles. About how does its drag force change?', 'It becomes about four times as big', ['It doubles', 'It stays the same', 'It halves']], ['During the coast after burnout, which way does drag push on a rising rocket?', 'Down, adding to gravity', ['Up, against gravity', 'Sideways', 'There is no drag after burnout']], ['On the way down (before the parachute), which way does drag push?', 'Up, against the motion', ['Down, with gravity', 'Sideways', 'There is no drag on the way down']], ['With drag, how does the real apogee compare with the no-drag answer?', 'It is lower', ['It is higher', 'It is the same', 'It depends only on the mass']]], Q = R.pick(Qs); return {
      q: Q[0], a: MC(Q[1], Q[2]), steps: ['Drag points opposite the velocity, and its size grows about as $v^2$: $F_D = \\tfrac12 \\rho C_D A v^2$.', 'So: ' + Q[1].toLowerCase() + '.'], hint: 'Drag always opposes the motion through the air.', d: { k: 'idea', ans: Q[1] } }; }
    var FD = 0.5 * rho * Cd * Ar * v * v;
    if (kind === 'force') return { q: 'Drag is $F_D = \\tfrac12 \\rho C_D A v^2$. A rocket has a body diameter of $' + gv(dcm, 'cm') + '$ (so $A = \\pi r^2$), $C_D = ' + Cd + '$, and moves at $' + gv(v, 'm/s') + '$ through air of density $1.2\\ \\text{kg/m}^3$. What is the drag force?', a: A(FD), unit: 'N',
      steps: ['Radius $' + tv(dcm / 200) + '\\ \\text{m}$, so $A = \\pi(' + tv(dcm / 200) + ')^2 ' + eqa(Ar, 4) + '\\ \\text{m}^2$.', '$F_D = \\tfrac12(1.2)(' + Cd + ')(' + tn(Ar, 4) + ')(' + v + ')^2 ' + eqa(FD) + '\\ \\text{N}$.'], hint: 'Convert the diameter to a radius in meters first.', d: { k: 'force', Cd: Cd, d: dcm, v: v } };
    if (kind === 'scale') { var F1 = R.real(0.2, 3, 2), f = R.pick([2, 3, 1.5, 0.5]), F2 = F1 * f * f; return { q: 'At $' + gv(v, 'm/s') + '$ a rocket feels $' + gv(F1, 'N') + '$ of drag. What drag does it feel at $' + gv(fx(v * f), 'm/s') + '$?', a: A(F2), unit: 'N',
      steps: ['Drag grows as $v^2$. The speed is multiplied by $' + tv(f) + '$, so drag is multiplied by $' + tv(f) + '^2 = ' + tv(fx(f * f)) + '$.', '$F = ' + tv(F1) + ' \\times ' + tv(fx(f * f)) + ' ' + eqa(F2) + '\\ \\text{N}$.'], hint: 'Square the speed factor.', d: { k: 'scale', F: F1, f: f } }; }
    var mg = R.int(40, 150) * 5, m = mg / 1000, Fd = sg(FD, 2), ad = g + Fd / m;
    if (kind === 'decel') return { q: 'A ' + mg + ' g rocket is coasting upward and feels $' + gv(Fd, 'N') + '$ of drag. What is the size of its deceleration?', a: A(ad), unit: 'm/s2',
      steps: ['Going up, gravity and drag both point down: $ma = -(mg + F_D)$.', '$|a| = g + \\dfrac{F_D}{m} = 9.8 + \\dfrac{' + tv(Fd) + '}{' + tv(m) + '} ' + eqa(ad) + '\\ \\text{m/s}^2$.'], hint: 'Add the drag\'s deceleration to g.', d: { k: 'decel', m: m, F: Fd } };
    var dt = R.pick([0.1, 0.2, 0.25, 0.5]), kk = R.pick([0.0005, 0.0008, 0.001, 0.0012, 0.0015]), v0 = R.int(20, 60) * 2, h0 = R.int(10, 60) * 5;
    var a0 = -g - kk * v0 * v0 / m, v1 = v0 + a0 * dt, h1 = h0 + v0 * dt;
    if (kind === 'step') return { q: 'A numerical step (Euler\'s method) for a ' + mg + ' g rocket coasting upward: drag is $F_D = kv^2$ with $k = ' + tv(kk) + '\\ \\text{kg/m}$. Now $v = ' + gv(v0, 'm/s') + '$ and $h = ' + gv(h0, 'm') + '$. Using $\\Delta t = ' + gv(dt, 's') + '$, what is the velocity after one step?', a: A(v1, 3, 0.01), unit: 'm/s',
      steps: ['Acceleration now: $a = -g - \\dfrac{k v^2}{m} = -9.8 - \\dfrac{' + tv(kk) + '(' + v0 + ')^2}{' + tv(m) + '} ' + eqa(a0, 4) + '\\ \\text{m/s}^2$.', 'Step: $v_1 = v_0 + a\\,\\Delta t = ' + v0 + ' + (' + tn(a0, 4) + ')(' + tv(dt) + ') ' + eqa(v1) + '\\ \\text{m/s}$.', '(The height steps too: $h_1 = h_0 + v_0 \\Delta t = ' + tv(fx(h1)) + '\\ \\text{m}$.)'], hint: 'Find a from the current speed, then v₁ = v₀ + aΔt.', d: { k: 'step', m: m, k2: kk, v: v0, h: h0, dt: dt } };
    var a1 = -g - kk * v1 * v1 / m, v2 = v1 + a1 * dt, h2 = h1 + v1 * dt;
    return { q: 'Euler\'s method for a ' + mg + ' g rocket coasting upward: drag is $F_D = kv^2$ with $k = ' + tv(kk) + '\\ \\text{kg/m}$. Now $v = ' + gv(v0, 'm/s') + '$ and $h = ' + gv(h0, 'm') + '$. Take two steps of $\\Delta t = ' + gv(dt, 's') + '$ (update $h$ with the old $v$). What is the height after two steps?', a: A(h2, 4, 0.005), unit: 'm',
      steps: ['Step 1: $a_0 ' + eqa(a0, 4) + '$, $v_1 ' + eqa(v1, 4) + '$, $h_1 = ' + h0 + ' + ' + v0 + '(' + tv(dt) + ') = ' + tv(fx(h1)) + '$.', 'Step 2: $h_2 = h_1 + v_1 \\Delta t = ' + tv(fx(h1)) + ' + ' + tn(v1, 4) + '(' + tv(dt) + ') ' + eqa(h2, 4) + '\\ \\text{m}$.'], hint: 'Each step: h gets v·Δt, then v gets a·Δt.', d: { k: 'step2', m: m, k2: kk, v: v0, h: h0, dt: dt } };
  }));

  // ---------- rocket.stability
  G('rocket.stability', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['stable', 'cm']), R.pick(['cm', 'margin', 'stable']), R.pick(['margin', 'nose', 'cm3']));
    var L = R.int(30, 70), dcm = R.pick([2.5, 3, 4, 5]);
    if (kind === 'stable') { var cm = R.int(Math.round(L * 0.4), Math.round(L * 0.65)), cp = cm + R.pick([-6, -4, -2, 3, 5, 8]), ok = cp > cm; return {
      q: 'Measured from the nose tip, a ' + L + ' cm rocket has its center of mass at ' + cm + ' cm and its center of pressure at ' + cp + ' cm. Is it stable?',
      a: MC(ok ? 'Yes: the center of mass is ahead of the center of pressure' : 'No: the center of pressure is ahead of the center of mass', [ok ? 'No: the center of pressure is ahead of the center of mass' : 'Yes: the center of mass is ahead of the center of pressure', 'Yes: any rocket with fins is stable', 'It depends only on the thrust']),
      steps: ['Stable means the center of mass (CM) is closer to the nose than the center of pressure (CP).', 'CM at ' + cm + ' cm, CP at ' + cp + ' cm: ' + (ok ? 'CM is ahead, so a gust turns the nose back into the wind.' : 'CP is ahead, so a gust turns it further off course.')], hint: 'Which point is closer to the nose?', d: { k: 'stable', cm: cm, cp: cp } }; }
    var parts = [['nose cone', R.int(8, 25), R.int(3, 8)], ['body tube', R.int(15, 40), Math.round(L * 0.5)], ['motor', R.int(15, 45), L - R.int(3, 6)], ['fins', R.int(5, 15), L - R.int(4, 8)]];
    if (kind === 'cm' || kind === 'cm3' || kind === 'margin' || kind === 'nose') {
      if (kind === 'cm') parts = parts.slice(0, 3);
      var M_ = 0, Mx = 0; parts.forEach(function (p) { M_ += p[1]; Mx += p[1] * p[2]; }); var X = Mx / M_;
      var desc = parts.map(function (p) { return 'the ' + p[0] + ', ' + p[1] + ' g centered ' + p[2] + ' cm from the nose tip'; });
      if (kind === 'cm' || kind === 'cm3') return { q: 'A ' + L + ' cm rocket is made of ' + U.list(desc) + '. Where is its center of mass, measured from the nose tip?', a: A(X, 3, 0.01), unit: 'cm',
        steps: ['Center of mass is the mass-weighted average position: $x = \\dfrac{\\sum m_i x_i}{\\sum m_i}$.', '$\\sum m_i x_i = ' + parts.map(function (p) { return p[1] + '(' + p[2] + ')'; }).join(' + ') + ' = ' + Mx + '$; $\\sum m_i = ' + M_ + '$.', '$x = ' + Mx + '/' + M_ + ' ' + eqa(X) + '\\ \\text{cm}$.'], hint: 'Multiply each mass by its position, add, divide by the total mass.', d: { k: kind, parts: parts } };
      if (kind === 'margin') { var cmx = R.int(Math.round(L * 0.45), Math.round(L * 0.6)), cpx = cmx + R.int(2, 12), cal = (cpx - cmx) / dcm; return {
        q: 'Rocketeers measure the stability margin in body diameters ("calibers"): the distance from the center of mass back to the center of pressure, divided by the diameter. A rocket ' + dcm + ' cm across has its center of mass at ' + cmx + ' cm and its center of pressure at ' + cpx + ' cm from the nose. What is its margin in calibers?', a: A(cal, 3, 0.01),
        steps: ['Gap: $' + cpx + ' - ' + cmx + ' = ' + (cpx - cmx) + '\\ \\text{cm}$.', 'Margin: $\\dfrac{' + (cpx - cmx) + '}{' + tv(dcm) + '} ' + eqa(cal) + '$ calibers.'], hint: 'Gap divided by diameter.', d: { k: 'margin', cm: cmx, cp: cpx, d: dcm } }; }
      var add = R.int(3, 15), X2 = (Mx + add * 1) / (M_ + add);
      return { q: 'A rocket\'s parts total ' + M_ + ' g with the center of mass ' + tn(X, 4) + ' cm from the nose tip. A ' + add + ' g piece of clay is pressed into the nose, 1 cm from the tip. Where is the new center of mass?', a: A(X2, 3, 0.01), unit: 'cm',
        steps: ['New total: $' + M_ + ' + ' + add + ' = ' + (M_ + add) + '\\ \\text{g}$.', '$x = \\dfrac{' + M_ + '(' + tn(X, 4) + ') + ' + add + '(1)}{' + (M_ + add) + '} ' + eqa(X2) + '\\ \\text{cm}$. Nose weight moves the center of mass forward, which adds stability.'], hint: 'Weighted average of the old center and the clay.', d: { k: 'nose', M: M_, X: sg(X, 4), add: add } };
    }
  }));

  // ---------- rocket.range-angle
  G('rocket.range-angle', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['range', 'best']), R.pick(['range', 'height', 'time', 'twin']), R.pick(['height', 'time', 'twin', 'speed']));
    var v = R.int(10, 40), th = R.pick([15, 20, 25, 30, 35, 40, 50, 55, 60, 65, 70, 75]), Rg = v * v * sinD(2 * th) / g;
    var q0 = 'A ball leaves the ground at $' + gv(v, 'm/s') + '$, $' + th + '^\\circ$ above level ground (ignore drag). ';
    if (kind === 'range') return { q: q0 + 'How far away does it land?', a: A(Rg), unit: 'm',
      steps: ['Range on level ground: $R = \\dfrac{v^2 \\sin 2\\theta}{g}$.', '$R = \\dfrac{' + v + '^2 \\sin ' + (2 * th) + '^\\circ}{9.8} ' + eqa(Rg) + '\\ \\text{m}$.'], hint: 'Use sin 2θ, not sin θ.', d: { k: 'range', v: v, th: th } };
    if (kind === 'best') return { q: 'On level ground with no drag, which launch angle sends a projectile farthest?', a: MC('$45^\\circ$', ['$30^\\circ$', '$60^\\circ$', '$90^\\circ$']),
      steps: ['$R = v^2 \\sin 2\\theta / g$ is largest when $\\sin 2\\theta = 1$, so $2\\theta = 90^\\circ$.', '$\\theta = 45^\\circ$.'], hint: 'When is sin 2θ biggest?', d: { k: 'best' } };
    if (kind === 'twin') return { q: q0 + 'Which other launch angle (at the same speed) gives the same range?', a: { t: 'num', v: String(90 - th), tol: 0.5 }, unit: '°',
      steps: ['$\\sin 2\\theta = \\sin(180^\\circ - 2\\theta)$, so $\\theta$ and $90^\\circ - \\theta$ share a range.', '$90^\\circ - ' + th + '^\\circ = ' + (90 - th) + '^\\circ$.'], hint: 'Complementary angles.', d: { k: 'twin', th: th } };
    var H = Math.pow(v * sinD(th), 2) / (2 * g), tf = 2 * v * sinD(th) / g;
    if (kind === 'height') return { q: q0 + 'How high does it rise?', a: A(H), unit: 'm',
      steps: ['Only the vertical part matters: $v_y = ' + v + '\\sin ' + th + '^\\circ ' + eqa(v * sinD(th), 4) + '\\ \\text{m/s}$.', '$H = \\dfrac{v_y^2}{2g} ' + eqa(H) + '\\ \\text{m}$.'], hint: 'Use the vertical component.', d: { k: 'height', v: v, th: th } };
    if (kind === 'time') return { q: q0 + 'How long is it in the air?', a: A(tf), unit: 's',
      steps: ['$v_y = ' + v + '\\sin ' + th + '^\\circ ' + eqa(v * sinD(th), 4) + '\\ \\text{m/s}$.', 'Up and back down: $t = \\dfrac{2v_y}{g} ' + eqa(tf) + '\\ \\text{s}$.'], hint: 'Twice the time to the top.', d: { k: 'time', v: v, th: th } };
    var Rt = R.int(20, 90), vs = sqrt(Rt * g / sinD(2 * th));
    return { q: 'A projectile launched at $' + th + '^\\circ$ above level ground lands $' + gv(Rt, 'm') + '$ away (no drag). How fast was it launched?', a: A(vs), unit: 'm/s',
      steps: ['$R = \\dfrac{v^2 \\sin 2\\theta}{g}$, so $v = \\sqrt{\\dfrac{R g}{\\sin 2\\theta}}$.', '$v = \\sqrt{\\dfrac{' + Rt + '(9.8)}{\\sin ' + (2 * th) + '^\\circ}} ' + eqa(vs) + '\\ \\text{m/s}$.'], hint: 'Solve the range formula for v.', d: { k: 'speed', R: Rt, th: th } };
  }));

  // ===================================================================== Unit 4: How High Did It Go?

  // ---------- rocket.altitude-tangent
  G('rocket.altitude-tangent', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['h', 'h', 'heye']), R.pick(['h', 'heye', 'angle', 'base']), R.pick(['angle', 'base', 'ft', 'heye']));
    var b = R.pick([30, 50, 60, 75, 100, 150, 200, 250, 300]), th = R.int(20, 72), h = b * tanD(th);
    if (kind === 'h') return { q: 'An observer stands $' + gv(b, 'm') + '$ from the launch pad and sights the rocket at its highest point, $' + th + '^\\circ$ above level. Assuming it went straight up, how high did it go? (Ignore the observer\'s eye height.)', a: A(h), unit: 'm',
      steps: ['The pad, the observer and the rocket make a right triangle: the baseline is the side next to the angle, the height is the side opposite.', '$\\tan\\theta = \\dfrac{h}{b}$, so $h = b\\tan\\theta$.', '$h = ' + b + '\\tan ' + th + '^\\circ ' + eqa(h) + '\\ \\text{m}$.'], hint: 'Opposite over adjacent is the tangent.', d: { k: 'h', b: b, th: th } };
    if (kind === 'heye') { var e = R.pick([1.5, 1.6, 1.7, 1.2]), he = h + e; return { q: 'A theodolite $' + gv(e, 'm') + '$ above the ground stands $' + gv(b, 'm') + '$ from the pad. It sights a rocket at apogee, $' + th + '^\\circ$ above level. How high was the rocket above the ground?', a: A(he), unit: 'm',
      steps: ['$b\\tan\\theta = ' + b + '\\tan ' + th + '^\\circ ' + eqa(h, 4) + '\\ \\text{m}$ above the instrument.', 'Add the instrument\'s height: $' + tn(h, 4) + ' + ' + tv(e) + ' ' + eqa(he) + '\\ \\text{m}$.'], hint: 'The angle is measured from the instrument, not the ground.', d: { k: 'heye', b: b, th: th, e: e } }; }
    if (kind === 'angle') { var ht = Math.max(20, Math.round(b * R.real(0.4, 3.5, 2) / 10) * 10), an = atanD(ht / b); return { q: 'A rocket is expected to reach $' + gv(ht, 'm') + '$. At what angle above level should an observer $' + gv(b, 'm') + '$ from the pad look for it at apogee?', a: A(an, 3, 0.01), unit: '°',
      steps: ['$\\tan\\theta = \\dfrac{h}{b} = \\dfrac{' + ht + '}{' + b + '} ' + eqa(ht / b, 4) + '$.', '$\\theta = \\tan^{-1}(' + tn(ht / b, 4) + ') ' + eqa(an) + '^\\circ$.'], hint: 'Inverse tangent of height over baseline.', d: { k: 'angle', h: ht, b: b } }; }
    if (kind === 'base') { var ht2 = R.int(5, 60) * 10, want = R.pick([30, 35, 40, 45, 50, 55, 60]), bb = ht2 / tanD(want); return { q: 'A rocket should reach about $' + gv(ht2, 'm') + '$. How far from the pad should the tracker stand so that the rocket is $' + want + '^\\circ$ above level at apogee?', a: A(bb), unit: 'm',
      steps: ['$\\tan\\theta = h/b$, so $b = \\dfrac{h}{\\tan\\theta}$.', '$b = \\dfrac{' + ht2 + '}{\\tan ' + want + '^\\circ} ' + eqa(bb) + '\\ \\text{m}$.'], hint: 'Solve tan θ = h/b for b.', d: { k: 'base', h: ht2, th: want } }; }
    var bf = R.pick([300, 500, 600, 1000, 1500, 2000]), hf = bf * tanD(th);
    return { q: 'A tracker paces off a baseline of $' + gv(bf, 'ft') + '$ from the pad and measures an angle of $' + th + '^\\circ$ to the rocket at apogee. How high did it go, in feet?', a: A(hf), unit: 'ft',
      steps: ['The units of the height match the units of the baseline.', '$h = ' + T.commas(bf) + '\\tan ' + th + '^\\circ ' + eqa(hf) + '\\ \\text{ft}$.'], hint: 'h = b tan θ works in any length unit.', d: { k: 'ft', b: bf, th: th } };
  }));

  // ---------- rocket.angle-error
  G('rocket.angle-error', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['range', 'hi']), R.pick(['range', 'spread', 'pct']), R.pick(['spread', 'pct', 'avg']));
    var b = R.pick([50, 100, 150, 200, 300]), th = R.int(30, 75), dth = R.pick([1, 2]), hl = b * tanD(th - dth), hh = b * tanD(th + dth), h = b * tanD(th);
    var q0 = 'A tracker $' + gv(b, 'm') + '$ from the pad reads $' + th + '^\\circ$, but the reading could be off by $' + dth + '^\\circ$ either way. ';
    if (kind === 'hi') return { q: q0 + 'What is the highest height the rocket could have reached?', a: A(hh), unit: 'm',
      steps: ['The largest angle is $' + (th + dth) + '^\\circ$.', '$h = ' + b + '\\tan ' + (th + dth) + '^\\circ ' + eqa(hh) + '\\ \\text{m}$.'], hint: 'Use the biggest possible angle.', d: { k: 'hi', b: b, th: th, dth: dth } };
    if (kind === 'range') return { q: q0 + 'What is the lowest height the rocket could have reached?', a: A(hl), unit: 'm',
      steps: ['The smallest angle is $' + (th - dth) + '^\\circ$.', '$h = ' + b + '\\tan ' + (th - dth) + '^\\circ ' + eqa(hl) + '\\ \\text{m}$.'], hint: 'Use the smallest possible angle.', d: { k: 'lo', b: b, th: th, dth: dth } };
    if (kind === 'spread') return { q: q0 + 'How wide is the range of possible heights (highest minus lowest)?', a: A(hh - hl), unit: 'm',
      steps: ['Highest: $' + b + '\\tan ' + (th + dth) + '^\\circ ' + eqa(hh, 4) + '$. Lowest: $' + b + '\\tan ' + (th - dth) + '^\\circ ' + eqa(hl, 4) + '$.', 'Spread: $' + eqa(hh - hl) + '\\ \\text{m}$.'], hint: 'Work out both ends.', d: { k: 'spread', b: b, th: th, dth: dth } };
    if (kind === 'pct') { var pc = (hh - h) / h * 100; return { q: q0 + 'By what percent could the height be too low, if the true angle was $' + (th + dth) + '^\\circ$? (Compare with the height from $' + th + '^\\circ$.)', a: { t: 'num', v: sv(pc, 3), rtol: 0.03, pct: true },
      steps: ['From $' + th + '^\\circ$: $h ' + eqa(h, 4) + '\\ \\text{m}$. From $' + (th + dth) + '^\\circ$: $' + eqa(hh, 4) + '\\ \\text{m}$.', 'Percent difference: $\\dfrac{' + tn(hh, 4) + ' - ' + tn(h, 4) + '}{' + tn(h, 4) + '} \\times 100 ' + eqa(pc) + '\\%$.'], hint: 'Difference divided by the measured height.', d: { k: 'pct', b: b, th: th, dth: dth } }; }
    var th2 = th + R.pick([-6, -4, 4, 6]), b2 = b, h2 = b2 * tanD(th2), avg = (h + h2) / 2;
    return { q: 'Two trackers, each $' + gv(b, 'm') + '$ from the pad on opposite sides, read $' + th + '^\\circ$ and $' + th2 + '^\\circ$ at apogee. What is the average of their two height estimates?', a: A(avg), unit: 'm',
      steps: ['$h_1 = ' + b + '\\tan ' + th + '^\\circ ' + eqa(h, 4) + '$, $h_2 = ' + b + '\\tan ' + th2 + '^\\circ ' + eqa(h2, 4) + '$.', 'Average: $' + eqa(avg) + '\\ \\text{m}$. (If the rocket drifted toward one tracker, that one reads high and the other low, so averaging helps.)'], hint: 'Find both heights, then average.', d: { k: 'avg', b: b, th: th, th2: th2 } };
  }));

  // ---------- rocket.triangulation
  G('rocket.triangulation', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['opp', 'same']), R.pick(['opp', 'same', 'dist']), R.pick(['same', 'dist', 'ft']));
    var d = R.pick([100, 120, 150, 200, 250, 300]), a = R.int(25, 65), bb = R.int(25, 65);
    if (kind === 'opp') { var h = d / (1 / tanD(a) + 1 / tanD(bb)); return {
      q: 'Two observers stand $' + gv(d, 'm') + '$ apart with the rocket\'s path between them, all in one line. At apogee one sights it $' + a + '^\\circ$ above level and the other $' + bb + '^\\circ$. How high is it?', a: A(h), unit: 'm',
      steps: ['Let $x$ be the ground distance from the first observer. Then $h = x\\tan ' + a + '^\\circ$ and $h = (' + d + ' - x)\\tan ' + bb + '^\\circ$.', 'So $x = h\\cot ' + a + '^\\circ$ and $' + d + ' - x = h\\cot ' + bb + '^\\circ$; adding, $' + d + ' = h(\\cot ' + a + '^\\circ + \\cot ' + bb + '^\\circ)$.', '$h = \\dfrac{' + d + '}{' + tn(1 / tanD(a), 4) + ' + ' + tn(1 / tanD(bb), 4) + '} ' + eqa(h) + '\\ \\text{m}$.'], hint: 'Write the two ground distances using cotangents; they add to the baseline.', d: { k: 'opp', d: d, a: a, b: bb } }; }
    var near = Math.max(a, bb) + R.int(5, 15), far = Math.min(a, bb); if (near > 80) near = 80;
    var hs = d / (1 / tanD(far) - 1 / tanD(near)), unitL = kind === 'ft' ? 'ft' : 'm', dd = kind === 'ft' ? d * 3 : d; if (kind === 'ft') hs = dd / (1 / tanD(far) - 1 / tanD(near));
    if (kind === 'dist') { var xn = hs / tanD(near); return {
      q: 'Two observers stand on the same side of the pad, in line with it, $' + gv(d, 'm') + '$ apart. The nearer one sights the rocket at apogee $' + near + '^\\circ$ above level, the farther one $' + far + '^\\circ$. How far is the nearer observer from the point under the rocket?', a: A(xn), unit: 'm',
      steps: ['Height: $h = \\dfrac{' + d + '}{\\cot ' + far + '^\\circ - \\cot ' + near + '^\\circ} ' + eqa(hs, 4) + '\\ \\text{m}$.', 'Nearer observer: $x = h\\cot ' + near + '^\\circ ' + eqa(xn) + '\\ \\text{m}$.'], hint: 'Find the height first.', d: { k: 'dist', d: d, far: far, near: near } }; }
    return {
      q: 'Two observers stand on the same side of the pad, in line with it, $' + gv(dd, unitL) + '$ apart. The nearer one sights the rocket at apogee $' + near + '^\\circ$ above level, the farther one $' + far + '^\\circ$. How high is the rocket?', a: A(hs), unit: unitL,
      steps: ['Let $x$ be the nearer observer\'s distance to the point under the rocket: $x = h\\cot ' + near + '^\\circ$ and $x + ' + dd + ' = h\\cot ' + far + '^\\circ$.', 'Subtract: $' + dd + ' = h(\\cot ' + far + '^\\circ - \\cot ' + near + '^\\circ)$.', '$h = \\dfrac{' + dd + '}{' + tn(1 / tanD(far), 4) + ' - ' + tn(1 / tanD(near), 4) + '} ' + eqa(hs) + '\\ \\text{' + unitL + '}$.'], hint: 'Same side: the cotangents subtract.', d: { k: 'same', d: dd, far: far, near: near } };
  }));

  // ===================================================================== Unit 5: Beyond the Sky
  var BODIES = [['Earth', 5.972e24, 6.371e6], ['the Moon', 7.342e22, 1.737e6], ['Mars', 6.417e23, 3.390e6]];
  function bodyGiven(b) { return b[0] + ' (mass $' + tn(b[1], 4) + '\\ \\text{kg}$, radius $' + T.commas(b[2] / 1000) + '\\ \\text{km}$)'; }

  // ---------- rocket.gravity-orbits
  G('rocket.gravity-orbits', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['idea', 'v']), R.pick(['v', 'period', 'idea']), R.pick(['v', 'period', 'alt', 'g']));
    if (kind === 'idea') { var Qs = [['Why doesn\'t a satellite in orbit fall to the ground?', 'It is falling, but it moves sideways so fast that the ground curves away beneath it', ['There is no gravity that high', 'Its engines hold it up', 'The air holds it up']], ['How strong is Earth\'s gravity 200 km up, compared with at the surface?', 'A little weaker, about 94% as strong', ['Zero', 'Half as strong', 'Twice as strong']], ['If a satellite in a circular orbit suddenly slowed down a lot, what would happen?', 'It would fall into a lower path and could come down', ['It would fly off into space', 'It would stop in place', 'Nothing']]], Q = R.pick(Qs); return {
      q: Q[0], a: MC(Q[1], Q[2]), steps: ['In orbit, gravity is what bends the path into a circle. At 200 km up, $g$ is about $(6371/6571)^2 \\approx 0.94$ of its surface value.', 'Answer: ' + Q[1].charAt(0).toLowerCase() + Q[1].slice(1) + '.'], hint: 'Gravity is still there; it supplies the centripetal force.', d: { k: 'idea', ans: Q[1] } }; }
    var B = by(ctx, BODIES[0], R.pick(BODIES), R.pick(BODIES)), alt = R.int(B[0] === 'Earth' ? 15 : 5, B[0] === 'Earth' ? 100 : 60) * 10, r = B[2] + alt * 1000, v = sqrt(GRAV * B[1] / r), P = 2 * PI * r / v;
    var q0 = 'A satellite circles ' + bodyGiven(B) + ' at $' + T.commas(alt) + '\\ \\text{km}$ above the surface. Use $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$. ';
    if (kind === 'v') return { q: q0 + 'What is its orbital speed?', a: A(v), unit: 'm/s',
      steps: ['Gravity supplies the centripetal force: $\\dfrac{GMm}{r^2} = \\dfrac{mv^2}{r}$, so $v = \\sqrt{\\dfrac{GM}{r}}$.', 'Measure $r$ from the center: $r = ' + T.commas(B[2] / 1000) + ' + ' + T.commas(alt) + ' = ' + T.commas(r / 1000) + '\\ \\text{km}$.', '$v ' + eqa(v) + '\\ \\text{m/s}$.'], hint: 'r is the radius plus the altitude, in meters.', d: { k: 'v', M: B[1], R: B[2], alt: alt } };
    if (kind === 'period') return { q: q0 + 'How many minutes does one orbit take?', a: A(P / 60), unit: 'min',
      steps: ['$v = \\sqrt{GM/r} ' + eqa(v, 4) + '\\ \\text{m/s}$ with $r = ' + T.commas(r / 1000) + '\\ \\text{km}$.', '$T = \\dfrac{2\\pi r}{v} ' + eqa(P, 4) + '\\ \\text{s} ' + eqa(P / 60) + '\\ \\text{min}$.'], hint: 'Circumference divided by speed.', d: { k: 'period', M: B[1], R: B[2], alt: alt } };
    if (kind === 'g') { var gg = GRAV * B[1] / (r * r); return { q: q0 + 'What is the acceleration due to gravity at that height?', a: A(gg), unit: 'm/s2',
      steps: ['$g = \\dfrac{GM}{r^2}$ with $r = ' + T.commas(r / 1000) + '\\ \\text{km}$.', '$g ' + eqa(gg) + '\\ \\text{m/s}^2$. Gravity is far from zero in orbit.'], hint: 'GM/r², r from the center.', d: { k: 'g', M: B[1], R: B[2], alt: alt } }; }
    var Pm = R.int(90, 120), Pr = Pm * 60, rr = Math.pow(GRAV * 5.972e24 * Pr * Pr / (4 * PI * PI), 1 / 3), altk = (rr - 6.371e6) / 1000;
    return { q: 'A satellite circles Earth (mass $5.972 \\times 10^{24}\\ \\text{kg}$, radius $6{,}371\\ \\text{km}$) once every ' + Pm + ' minutes. How high above the surface is it, in kilometers? Use $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$.', a: A(altk, 3, 0.03), unit: 'km',
      steps: ['For a circle, $T = 2\\pi\\sqrt{\\dfrac{r^3}{GM}}$, so $r = \\left(\\dfrac{GMT^2}{4\\pi^2}\\right)^{1/3}$.', 'With $T = ' + T.commas(Pr) + '\\ \\text{s}$: $r ' + eqa(rr / 1000, 4) + '\\ \\text{km}$.', 'Altitude: $r - 6{,}371 ' + eqa(altk) + '\\ \\text{km}$.'], hint: 'Solve the period formula for r, then subtract Earth\'s radius.', d: { k: 'alt', P: Pm } };
  }));

  // ---------- rocket.escape-velocity
  G('rocket.escape-velocity', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['ratio', 'esc']), R.pick(['esc', 'ratio', 'alt']), R.pick(['esc', 'alt', 'energy']));
    var B = by(ctx, BODIES[0], R.pick(BODIES), R.pick(BODIES));
    if (kind === 'ratio') { var vo = R.int(15, 80) * 100, ve = vo * Math.SQRT2; return { q: 'At some distance from a planet, the speed for a circular orbit is $' + gv(vo, 'm/s') + '$. What is the escape speed at that same distance?', a: A(ve), unit: 'm/s',
      steps: ['$v_\\text{orbit} = \\sqrt{GM/r}$ and $v_\\text{esc} = \\sqrt{2GM/r}$, so $v_\\text{esc} = \\sqrt{2}\\,v_\\text{orbit}$.', '$\\sqrt2(' + tv(vo) + ') ' + eqa(ve) + '\\ \\text{m/s}$.'], hint: 'Escape speed is √2 times orbit speed at the same r.', d: { k: 'ratio', vo: vo } }; }
    if (kind === 'esc' && R.chance(0.6)) { var fm = R.pick([0.1, 0.2, 0.5, 2, 3, 5, 8]), fr = R.pick([0.3, 0.5, 0.8, 1.2, 1.5, 2]); B = ['a planet', fm * 5.972e24, fr * 6.371e6]; }
    var alt = kind === 'alt' ? R.int(2, 100) * 100 : 0, r = B[2] + alt * 1000, v = sqrt(2 * GRAV * B[1] / r);
    if (kind === 'esc' || kind === 'alt') return { q: 'What is the escape speed ' + (alt ? 'at $' + T.commas(alt) + '\\ \\text{km}$ above the surface of ' : 'from the surface of ') + bodyGiven(B) + '? Use $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$.', a: A(v), unit: 'm/s',
      steps: ['Escape means kinetic energy is enough to climb out of the whole well: $\\tfrac12 m v^2 = \\dfrac{GMm}{r}$.', 'So $v = \\sqrt{\\dfrac{2GM}{r}}$, with $r = ' + T.commas(r / 1000) + '\\ \\text{km}$ from the center.', '$v ' + eqa(v) + '\\ \\text{m/s}$.'], hint: 'r is from the center, in meters.', d: { k: kind, M: B[1], R: B[2], alt: alt } };
    var m = R.int(1, 20) * 100, E = 0.5 * m * v * v;
    return { q: 'How much kinetic energy must a ' + T.commas(m) + ' kg spacecraft have at the surface of ' + bodyGiven(B) + ' to escape (ignoring air)? Use $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$.', a: A(E), unit: 'J',
      steps: ['It needs $K = \\dfrac{GMm}{R}$, the depth of the gravitational well.', '$K = \\dfrac{(6.674 \\times 10^{-11})(' + tn(B[1], 4) + ')(' + m + ')}{' + tn(B[2], 4) + '} ' + eqa(E) + '\\ \\text{J}$.'], hint: 'K = GMm/R.', d: { k: 'energy', M: B[1], R: B[2], m: m } };
  }));

  // ---------- rocket.kepler-ellipses
  G('rocket.kepler-ellipses', W(function (R, ctx) {
    var kind = by(ctx, R.pick(['a', 'e']), R.pick(['a', 'e', 'speed', 'period']), R.pick(['period', 'speed', 'third']));
    var RE = 6371, hp = R.int(15, 60) * 10, ha = hp + R.int(10, 200) * 10, rp = RE + hp, ra = RE + ha, a = (rp + ra) / 2, e = (ra - rp) / (ra + rp);
    var q0 = 'A satellite\'s orbit dips to $' + T.commas(hp) + '\\ \\text{km}$ above Earth at its low point (perigee) and rises to $' + T.commas(ha) + '\\ \\text{km}$ at its high point (apogee). Earth\'s radius is $6{,}371\\ \\text{km}$. ';
    if (kind === 'a') return { q: q0 + 'What is the semi-major axis of the ellipse, in km?', a: A(a, 4, 0.002), unit: 'km',
      steps: ['Distances from Earth\'s center (a focus): $r_p = ' + T.commas(rp) + '$, $r_a = ' + T.commas(ra) + '\\ \\text{km}$.', 'The long axis is $r_p + r_a$, so $a = \\dfrac{r_p + r_a}{2} = ' + tv(a) + '\\ \\text{km}$.'], hint: 'Add Earth\'s radius to each altitude first.', d: { k: 'a', hp: hp, ha: ha } };
    if (kind === 'e') return { q: q0 + 'What is the eccentricity of the orbit?', a: A(e, 3, 0.02),
      steps: ['$r_p = ' + T.commas(rp) + '$, $r_a = ' + T.commas(ra) + '\\ \\text{km}$.', '$e = \\dfrac{r_a - r_p}{r_a + r_p} = \\dfrac{' + (ra - rp) + '}{' + T.commas(ra + rp) + '} ' + eqa(e) + '$. Close to 0 means nearly a circle.'], hint: 'Use distances from the center.', d: { k: 'e', hp: hp, ha: ha } };
    if (kind === 'speed') { var vp = R.int(70, 82) * 100, va = vp * rp / ra; return { q: q0 + 'At perigee it moves at $' + gv(vp, 'm/s') + '$. How fast does it move at apogee?', a: A(va), unit: 'm/s',
      steps: ['Kepler\'s second law (equal areas in equal times) means $r_p v_p = r_a v_a$ at the two ends.', '$v_a = v_p\\dfrac{r_p}{r_a} = ' + tv(vp) + '\\cdot\\dfrac{' + T.commas(rp) + '}{' + T.commas(ra) + '} ' + eqa(va) + '\\ \\text{m/s}$.'], hint: 'Slower when farther: r v is the same at both ends.', d: { k: 'speed', hp: hp, ha: ha, vp: vp } }; }
    if (kind === 'period') { var P = 2 * PI * sqrt(Math.pow(a * 1000, 3) / (GRAV * 5.972e24)); return { q: q0 + 'Earth\'s mass is $5.972 \\times 10^{24}\\ \\text{kg}$ and $G = 6.674 \\times 10^{-11}\\ \\text{N}\\cdot\\text{m}^2/\\text{kg}^2$. How many minutes does one orbit take?', a: A(P / 60), unit: 'min',
      steps: ['Semi-major axis: $a = \\dfrac{' + T.commas(rp) + ' + ' + T.commas(ra) + '}{2} = ' + tv(a) + '\\ \\text{km}$.', 'Kepler\'s third law: $T = 2\\pi\\sqrt{\\dfrac{a^3}{GM}} ' + eqa(P, 4) + '\\ \\text{s}$.', 'That is $' + eqa(P / 60) + '\\ \\text{min}$.'], hint: 'The period depends only on a, not on the shape.', d: { k: 'period', hp: hp, ha: ha } }; }
    var a1 = R.int(70, 120) * 100, k = R.pick([2, 4, 1.5, 3, 2.5]), P1 = Math.round(2 * PI * sqrt(Math.pow(a1 * 1000, 3) / (GRAV * 5.972e24)) / 60), P2 = P1 * Math.pow(k, 1.5);
    return { q: 'Two satellites orbit Earth. Satellite A has a semi-major axis of $' + T.commas(a1) + '\\ \\text{km}$ and a period of ' + P1 + ' minutes. Satellite B\'s orbit has a semi-major axis $' + tv(k) + '$ times as big. What is B\'s period, in minutes?', a: A(P2), unit: 'min',
      steps: ['Kepler\'s third law: $T^2 \\propto a^3$, so $T \\propto a^{3/2}$.', '$T_B = ' + P1 + ' \\times ' + tv(k) + '^{3/2} ' + eqa(P2) + '\\ \\text{min}$.'], hint: 'Square of the period goes as cube of the size.', d: { k: 'third', P: P1, f: k } };
  }));
})(typeof window !== 'undefined' ? window.MathLadder : null);
