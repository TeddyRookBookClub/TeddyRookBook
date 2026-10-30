/* Earth & Space Ladder, Weather and Climate (weather): problem generators for every topic.
   Built from /tmp/work_weather/src/g*.js by build.js; edit the sources, not this file.
   Self-contained: the formulas live here (the kit's MathLadder.earthModels is used only by the tests). */
(function (ML) {
  'use strict';
  // ---------- g00_head.js ----------
  var G = ML.gen, TT = ML.T, U = ML.util, MA = Math;
  var NB = ' '; // no-break space between a number and its unit
  function fix(x) { return U.fix(x); }
  function rnd(x, dp) { return U.round(x, dp || 0); }
  function sig(x, s) { if (!x) return 0; var e = MA.floor(MA.log10(MA.abs(x))), p = MA.pow(10, s - 1 - e); return fix(MA.round(x * p) / p); }
  // a number as text: no float noise, a real minus sign, thousands commas from 1,000 up; dp: fixed decimals
  function nt(x, dp) {
    x = dp == null ? fix(x) : rnd(x, dp); var neg = x < 0; x = MA.abs(x);
    var s = dp == null ? String(x) : x.toFixed(dp); if (/e/.test(s)) s = String(sig(x, 6));
    var p = s.split('.'); if (p[0].length > 3) p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg && +s !== 0 ? '−' : '') + p.join('.');
  }
  function q(x, u, dp) { return nt(x, dp) + (u ? (u.charAt(0) === '%' ? '' : NB) + u : ''); } // a quantity as text: "15 °C"
  function sgn(x, u, dp) { return (x > 0 ? '+' : '') + q(x, u, dp); } // a signed change: "+2.5 °C", "−3 hPa"
  // answer specs
  function vstr(x) { x = fix(x); if (Number.isInteger(x)) return String(x); var s = String(x); return s.length > 10 ? String(sig(x, 6)) : s; }
  function num(x, rtol, tol) { var a = { t: 'num', v: vstr(x), rtol: rtol == null ? 0.01 : rtol }; if (tol != null) a.tol = tol; return a; }
  function numT(x, tol) { return { t: 'num', v: vstr(x), tol: tol == null ? 0.051 : tol, rtol: 0.005 }; } // temperatures and other values near zero
  function pct(x, tol) { return { t: 'num', v: vstr(x), pct: true, tol: tol == null ? 0.51 : tol, rtol: 0.005 }; }
  function mc(right, wrongs) { return U.mc(right, wrongs, 4); }
  function mcAll(right, wrongs) { return U.mc(right, wrongs, 1 + wrongs.length); }
  function mcK(right, wrongs) { var a = U.mc(right, wrongs, 1 + wrongs.length); a.keep = true; return a; } // keep this order
  function tf(v) { return { t: 'tf', v: !!v }; }
  // a problem; x may carry unit, viz, vk (the kind of check verify.js applies) and vd (the inputs, for verify.js)
  function pr(qs, a, steps, hint, x) { var p = { q: qs, a: a, steps: steps, hint: hint }; if (x) for (var k in x) p[k] = x[k]; return p; }
  // pick one of several problem makers by level: lv(R, ctx, [makers at 1], [at 2], [at 3])
  function lv(R, ctx, a, b, c) { var list = ML.byLevel(ctx, a, b, c); return R.pick(list)(); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function an(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a'; }
  function table(head, rows, cap2) { // an HTML table for a question (styled by math.css), first column as row headers
    var h = '<div class="mlp-table-wrap"><table class="mlp-table">' + (cap2 ? '<caption>' + cap2 + '</caption>' : '');
    if (head) h += '<thead><tr>' + head.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead>';
    return h + '<tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 && head ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function M(s) { return '$' + s + '$'; }
  function DM(s) { return '$$' + s + '$$'; }
  var CK = 273.15; // K = °C + 273.15
  var TOWNS = ['Ridgeville', 'Maple Falls', 'Port Ellis', 'Cedar Bluff', 'Harmon', 'Westbrook', 'Lakeside', 'Pine Hollow', 'Fairview', 'Stone Harbor', 'Elm Grove', 'Bayport'];
  function town(R) { return R.pick(TOWNS); }
  var NAMES = ['Maya', 'Leo', 'Ana', 'Sam', 'Priya', 'Jamal', 'Kenji', 'Rosa', 'Omar', 'Lily', 'Diego', 'Nora', 'Eli', 'Zara', 'Ben', 'Mei'];
  function nm(R) { return R.pick(NAMES); }

  // ---------- g01_air.js ----------
  // ===================== Unit 1: The Air Around Us =====================
  var INHG = 33.86, GR = 9.8, RD = 287;
  G('weather.pressure-units', function (R, ctx) {
    function toHpa() {
      var x = R.int(2900, 3070) / 100;
      return pr('A U.S. weather report gives the air pressure as ' + q(x, 'inHg', 2) + '. What is that in hectopascals? (1 inHg = 33.86 hPa)', num(x * INHG, 0.002), [
        'Multiply by the conversion factor: ' + q(x, 'inHg', 2) + ' × 33.86 hPa/inHg.',
        'The inHg units cancel: ' + q(rnd(x * INHG, 1), 'hPa') + '.'
      ], 'Each inch of mercury is 33.86 hPa.', { unit: 'hPa', vk: 'inhg2hpa', vd: { x: x } });
    }
    function toInhg() {
      var p = R.int(975, 1042);
      return pr('A weather map shows a sea-level pressure of ' + q(p, 'hPa') + '. What is that in inches of mercury? (1 inHg = 33.86 hPa)', num(p / INHG, 0.002), [
        'Divide by the number of hectopascals in one inch of mercury: ' + q(p, 'hPa') + ' ÷ 33.86 hPa/inHg.',
        '= ' + q(rnd(p / INHG, 2), 'inHg') + '.'
      ], 'Divide by 33.86.', { unit: 'inHg', vk: 'hpa2inhg', vd: { p: p } });
    }
    function siUnits() {
      var k = R.int(0, 2);
      if (k === 0) { var pa = R.int(970, 1040) * 100 + R.pick([0, 20, 50, 80]); return pr('A sensor reads ' + q(pa, 'Pa') + '. What is that in hectopascals?', num(pa / 100, 0.001), ['One hectopascal is 100 Pa ("hecto" means 100).', q(pa, 'Pa') + ' ÷ 100 = ' + q(pa / 100, 'hPa') + '.'], '"Hecto" means one hundred.', { unit: 'hPa', vk: 'pa2hpa', vd: { pa: pa } }); }
      if (k === 1) { var h = R.int(9700, 10400) / 10; return pr('Write ' + q(h, 'hPa') + ' in kilopascals.', num(h / 10, 0.001), ['1 kPa = 1000 Pa and 1 hPa = 100 Pa, so 1 kPa = 10 hPa.', q(h, 'hPa') + ' ÷ 10 = ' + q(h / 10, 'kPa') + '.'], 'How many hectopascals make a kilopascal?', { unit: 'kPa', vk: 'hpa2kpa', vd: { h: h } }); }
      var mb = R.int(980, 1035);
      return pr('An old weather log lists the pressure as ' + q(mb, 'mb') + ' (millibars). What is it in hectopascals?', num(mb, 0.001), ['A millibar and a hectopascal are the same size: 1 mb = 1 hPa = 100 Pa.', 'So ' + q(mb, 'mb') + ' = ' + q(mb, 'hPa') + '.'], 'Compare the sizes of the two units.', { unit: 'hPa', vk: 'mb', vd: { mb: mb } });
    }
    function force() {
      var o = R.pick([['a tabletop', 1.2, 0.6], ['a window', 1.5, 1.0], ['a desk', 1.4, 0.7], ['a door', 2.0, 0.9], ['a poster', 0.9, 0.6]]), p = R.int(995, 1030), A = rnd(o[1] * o[2], 2), F = p * 100 * A;
      return pr('The air pressure is ' + q(p, 'hPa') + '. What force does the air push with on one side of ' + o[0] + ' ' + q(o[1], 'm') + ' by ' + q(o[2], 'm') + '?', num(F, 0.01), [
        'Area: ' + q(o[1], 'm') + ' × ' + q(o[2], 'm') + ' = ' + q(A, 'm²') + '.',
        'Pressure in pascals: ' + q(p, 'hPa') + ' × 100 = ' + q(p * 100, 'Pa') + ' (newtons per square meter).',
        'Force: $F = PA$ = ' + q(p * 100, 'Pa') + ' × ' + q(A, 'm²') + ' = ' + q(rnd(F, 0), 'N') + '. The air on the other side pushes back just as hard, so nothing breaks.'
      ], 'Convert to pascals, then multiply by the area.', { unit: 'N', vk: 'force', vd: { p: p, a: o[1], b: o[2] } });
    }
    function column() {
      var p = R.int(990, 1035), A = R.pick([1, 2, 0.5]), m = p * 100 * A / GR;
      return pr('The pressure at the ground is ' + q(p, 'hPa') + '. What mass of air stands on ' + (A === 1 ? 'each square meter (1 m²)' : q(A, 'm²')) + ' of ground? Use g = 9.8 N/kg.', num(m, 0.01), [
        'Pressure in pascals: ' + q(p * 100, 'Pa') + '. The force on ' + q(A, 'm²') + ' is $F = PA$ = ' + q(p * 100 * A, 'N') + '.',
        'That force is the weight of the air column, $mg$, so $m = F/g$ = ' + q(p * 100 * A, 'N') + ' ÷ 9.8 N/kg.',
        '$m$ ≈ ' + q(rnd(m, 0), 'kg') + '.'
      ], 'The pressure is the weight of the air column per square meter.', { unit: 'kg', vk: 'column', vd: { p: p, A: A } });
    }
    function liquidBarometer() {
      var water = R.coin(), p = R.int(990, 1030), rho = water ? 1000 : 13600, h = p * 100 / (rho * GR);
      return pr('How tall a column of ' + (water ? 'water (density 1000 kg/m³)' : 'mercury (density 13,600 kg/m³)') + ' would the air hold up in a barometer when the pressure is ' + q(p, 'hPa') + '? Use g = 9.8 N/kg and give the height in meters.', num(h, 0.01), [
        'The liquid column\'s weight per area, $\\rho g h$, must equal the air pressure: $\\rho g h = P$.',
        '$h = P/(\\rho g)$ = ' + q(p * 100, 'Pa') + ' ÷ (' + nt(rho) + ' × 9.8).',
        '$h$ ≈ ' + q(rnd(h, water ? 2 : 3), 'm') + (water ? '. That is why barometers use dense mercury, not water.' : ', about ' + nt(rnd(h * 1000, 0)) + ' mm.')
      ], 'Set the liquid\'s pressure, ρgh, equal to the air pressure.', { unit: 'm', vk: 'baro', vd: { p: p, rho: rho } });
    }
    function concept() {
      var K = R.pick([
        ['What does a barometer at sea level measure?', 'The weight of the whole column of air above each square meter', ['The weight of the air inside the room', 'How fast the air is moving', 'How much water vapor the air holds']],
        ['A barometer is carried from the beach to the top of a hill. Why does its reading drop?', 'Part of the air column is now below it, so less air presses from above', ['The air on the hill is colder', 'There is less oxygen on the hill', 'The wind is stronger on the hill']],
        ['A sealed room and the air just outside its window are at the same height. How do their barometer readings compare?', 'They are the same, because the whole column above the building presses on the room\'s air', ['The room reads lower, because it holds less air', 'The room reads zero, because it is sealed', 'The room reads higher, because walls trap the air']],
        ['Why doesn\'t the air\'s push of about 70,000 N break a tabletop?', 'The air under the table pushes up just as hard as the air above pushes down', ['Air only pushes down, and tables are strong', 'Air pressure only acts outdoors', 'The table is lighter than the air above it']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Air pressure comes from the weight of the air above, and it pushes equally in all directions.', 'Answer: ' + K[1] + '.'], 'Think of the whole column of air overhead.', { vk: 'concept' });
    }
    return lv(R, ctx, [toHpa, toInhg, siUnits], [toHpa, toInhg, force, column, concept], [force, column, liquidBarometer, concept, toHpa]);
  });

  G('weather.pressure-height', function (R, ctx) {
    function halvings() {
      var k = R.int(1, 3), p0 = R.int(995, 1030), z = rnd(5.5 * k, 1), p = p0 / MA.pow(2, k);
      return pr('The pressure at sea level is ' + q(p0, 'hPa') + '. Using the rule that pressure halves for every 5.5 km of height, about what is the pressure at ' + q(z, 'km') + '?', num(p, 0.01), [
        q(z, 'km') + ' is ' + k + ' step' + (k > 1 ? 's' : '') + ' of 5.5 km, so the pressure halves ' + (k === 1 ? 'once' : k === 2 ? 'twice' : 'three times') + '.',
        q(p0, 'hPa') + ' ÷ ' + MA.pow(2, k) + ' = ' + q(rnd(p, 1), 'hPa') + '.'
      ], 'How many 5.5 km steps is that?', { unit: 'hPa', vk: 'halve', vd: { p0: p0, z: z } });
    }
    function backward() {
      var k = R.int(1, 4), p0 = R.pick([1000, 1008, 1024, 992, 1016]), p = p0 / MA.pow(2, k), z = 5.5 * k;
      return pr('A weather balloon\'s barometer reads ' + q(p, 'hPa') + ' while the ground reads ' + q(p0, 'hPa') + '. About how high is the balloon? Use the halving rule (half for every 5.5 km).', num(z, 0.01), [
        q(p0, 'hPa') + ' ÷ ' + q(p, 'hPa') + ' = ' + MA.pow(2, k) + ' = $2^{' + k + '}$, so the pressure has halved ' + k + ' time' + (k > 1 ? 's' : '') + '.',
        'Height: ' + k + ' × 5.5 km = ' + q(z, 'km') + '.'
      ], 'How many times has the pressure been cut in half?', { unit: 'km', vk: 'back', vd: { p0: p0, p: p } });
    }
    function below() {
      var k = R.int(1, 3), z = rnd(5.5 * k, 1), f = 100 * (1 - 1 / MA.pow(2, k));
      return pr('Pressure is the weight of the air above. If pressure halves for every 5.5 km, what percent of the atmosphere\'s mass lies below ' + q(z, 'km') + '?', pct(f), [
        'At ' + q(z, 'km') + ' the pressure is $(\\tfrac{1}{2})^{' + k + '}$ = ' + nt(100 / MA.pow(2, k)) + '% of the ground\'s, so that share of the air\'s weight is still above.',
        'The rest is below: 100% − ' + nt(100 / MA.pow(2, k)) + '% = ' + nt(f) + '%.'
      ], 'The pressure at a height tells you how much air is above it.', { vk: 'below', vd: { z: z } });
    }
    function layerDrop() {
      var p0 = R.pick([1000, 1008, 1016, 1024, 992]), k = R.int(1, 2), a = 5.5 * (k - 1), b = 5.5 * k, d = p0 / MA.pow(2, k - 1) - p0 / MA.pow(2, k);
      return pr('The ground pressure is ' + q(p0, 'hPa') + '. With the halving rule (half every 5.5 km), by how many hectopascals does the pressure drop between ' + q(a, 'km') + ' and ' + q(b, 'km') + '?', num(d, 0.01), [
        'At ' + q(a, 'km') + ': ' + q(p0 / MA.pow(2, k - 1), 'hPa') + '. At ' + q(b, 'km') + ': ' + q(p0 / MA.pow(2, k), 'hPa') + '.',
        'Drop: ' + q(p0 / MA.pow(2, k - 1), 'hPa') + ' − ' + q(p0 / MA.pow(2, k), 'hPa') + ' = ' + q(d, 'hPa') + '.' + (k === 2 ? ' Only half the drop of the first 5.5 km, though the layer is just as thick.' : '')
      ], 'Find the pressure at both heights first.', { unit: 'hPa', vk: 'layer', vd: { p0: p0, a: a, b: b } });
    }
    function anyHeight() {
      var p0 = R.int(1000, 1025), z = R.pick([1, 1.5, 2, 2.5, 3, 4, 7, 8, 9, 1.2, 3.5, 5, 6]), p = p0 * MA.pow(0.5, z / 5.5);
      return pr('Use $P = P_0 \\left(\\tfrac{1}{2}\\right)^{z/5.5}$ with $z$ in km. If $P_0$ = ' + q(p0, 'hPa') + ', what is the pressure at ' + q(z, 'km') + '? Round to the nearest hectopascal.', num(p, 0.006), [
        'Exponent: $z/5.5$ = ' + nt(z) + ' ÷ 5.5 ≈ ' + nt(rnd(z / 5.5, 3)) + '.',
        '$(\\tfrac{1}{2})^{' + nt(rnd(z / 5.5, 3)) + '}$ ≈ ' + nt(rnd(MA.pow(0.5, z / 5.5), 3)) + '.',
        '$P$ ≈ ' + q(p0, 'hPa') + ' × ' + nt(rnd(MA.pow(0.5, z / 5.5), 3)) + ' ≈ ' + q(rnd(p, 0), 'hPa') + '.'
      ], 'Work out the exponent z/5.5 first.', { unit: 'hPa', vk: 'any', vd: { p0: p0, z: z } });
    }
    function solveZ() {
      var p0 = 1000, p = R.pick([900, 850, 800, 700, 600, 400, 300, 200, 250, 350, 500]), z = 5.5 * MA.log(p0 / p) / MA.LN2;
      return pr('With $P = P_0 \\left(\\tfrac{1}{2}\\right)^{z/5.5}$ and a ground pressure of ' + q(p0, 'hPa') + ', at about what height (in km) is the pressure ' + q(p, 'hPa') + '?', num(z, 0.02), [
        'Divide: $(\\tfrac{1}{2})^{z/5.5} = ' + p + '/' + p0 + '$, so $2^{z/5.5}$ = ' + nt(rnd(p0 / p, 4)) + '.',
        'Take logarithms: $z/5.5 = \\log_2$(' + nt(rnd(p0 / p, 4)) + ') = ' + nt(rnd(MA.log(p0 / p) / MA.LN2, 3)) + '.',
        '$z$ ≈ 5.5 × ' + nt(rnd(MA.log(p0 / p) / MA.LN2, 3)) + ' ≈ ' + q(rnd(z, 2), 'km') + '.'
      ], 'Count the halvings with a base-2 logarithm.', { unit: 'km', vk: 'solvez', vd: { p0: p0, p: p } });
    }
    function trap() {
      var K = R.pick([
        ['Pressure falls by about the same number of hectopascals for every kilometer you climb.', false, 'It falls by about the same fraction (about 12%) each kilometer, so each kilometer\'s drop is smaller than the one below.'],
        ['By 11 km the pressure has fallen to about zero.', false, 'Two halvings leave about a quarter: roughly 250 hPa.'],
        ['About half of the atmosphere\'s mass is below 5.5 km.', true, 'At 5.5 km the pressure is half, so half of the air\'s weight is above and half below.'],
        ['The drop in pressure across the first kilometer is bigger than across the tenth kilometer.', true, 'The lowest air is densest, so the same fraction of a bigger pressure is a bigger drop.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Pressure falls by a fraction for each step up, not by a fixed amount.', { vk: 'concept' });
    }
    return lv(R, ctx, [halvings, backward, below], [halvings, backward, layerDrop, below, trap], [anyHeight, solveZ, layerDrop, trap]);
  });

  G('weather.gas-law-air', function (R, ctx) {
    function ratioK() {
      var a = R.pick([250, 260, 270, 280]), b = a + R.pick([20, 30, 40, 50]), r = b / a;
      return pr('Two air samples are at the same pressure: one at ' + q(a, 'K') + ' and one at ' + q(b, 'K') + '. How many times as dense is the colder sample as the warmer one? (Round to two decimal places.)', num(r, 0.006), [
        'From $P = \\rho R T$ at the same $P$: $\\rho$ is proportional to $1/T$.',
        'So $\\rho_{\\text{cold}}/\\rho_{\\text{warm}} = T_{\\text{warm}}/T_{\\text{cold}}$ = ' + b + '/' + a + ' ≈ ' + nt(rnd(r, 3)) + '.'
      ], 'At the same pressure, density goes as 1 over the kelvin temperature.', { vk: 'ratioK', vd: { a: a, b: b } });
    }
    function denser() {
      var t1 = R.int(-15, 10), t2 = t1 + R.int(10, 30), p = R.int(990, 1030);
      var wrongs = ['The ' + q(t2, '°C') + ' air', 'They have the same density, because the pressure is the same', 'You can\'t tell without the volume'];
      return pr('At ' + q(p, 'hPa') + ', which air is denser: air at ' + q(t1, '°C') + ' or air at ' + q(t2, '°C') + '?', mc('The ' + q(t1, '°C') + ' air', wrongs), [
        '$\\rho = P/(RT)$ with $T$ in kelvins: ' + q(t1 + 273.15, 'K') + ' and ' + q(t2 + 273.15, 'K') + '.',
        'Same $P$, smaller $T$ → bigger $\\rho$: the colder air (' + q(t1, '°C') + ') is denser, which is why it sinks and warmer air rises.'
      ], 'At the same pressure, density goes as 1 over the kelvin temperature.', { vk: 'concept' });
    }
    function density() {
      var p = R.int(950, 1035), t = R.int(-20, 38), rho = p * 100 / (RD * (t + CK));
      return pr('Find the density of air at ' + q(p, 'hPa') + ' and ' + q(t, '°C') + '. Use $P = \\rho R T$ with $R$ = 287 J/(kg·K).', num(rho, 0.01), [
        'Pressure in pascals: ' + q(p * 100, 'Pa') + '. Temperature in kelvins: ' + nt(t) + ' + 273.15 = ' + q(t + CK, 'K') + '.',
        '$\\rho = P/(RT)$ = ' + nt(p * 100) + ' ÷ (287 × ' + nt(t + CK) + ').',
        '$\\rho$ ≈ ' + q(rnd(rho, 3), 'kg/m³') + '.'
      ], 'Convert to pascals and kelvins first.', { unit: 'kg/m³', vk: 'rho', vd: { p: p, t: t } });
    }
    function pressure() {
      var rho = R.int(60, 130) / 100, t = R.int(-40, 30), p = rho * RD * (t + CK) / 100;
      return pr('A weather balloon measures air with a density of ' + q(rho, 'kg/m³') + ' at ' + q(t, '°C') + '. What is the pressure in hectopascals? Use $R$ = 287 J/(kg·K).', num(p, 0.01), [
        'Kelvins: ' + nt(t) + ' + 273.15 = ' + q(t + CK, 'K') + '.',
        '$P = \\rho R T$ = ' + nt(rho) + ' × 287 × ' + nt(t + CK) + ' ≈ ' + q(rnd(p * 100, 0), 'Pa') + '.',
        'Divide by 100: ≈ ' + q(rnd(p, 1), 'hPa') + '.'
      ], 'Use kelvins, then divide pascals by 100 for hectopascals.', { unit: 'hPa', vk: 'press', vd: { rho: rho, t: t } });
    }
    function temperature() {
      var p = R.int(500, 1030), rho = R.int(70, 135) / 100, T = p * 100 / (rho * RD), tc = T - CK;
      for (var tries = 0; tries < 20 && (tc < -60 || tc > 45 || MA.abs(tc) < 2); tries++) { rho = rnd(p * 100 / (RD * (R.int(-30, 30) + CK)), 2); T = p * 100 / (rho * RD); tc = T - CK; }
      return pr('Air at ' + q(p, 'hPa') + ' has a density of ' + q(rho, 'kg/m³') + '. What is its temperature in °C? Use $R$ = 287 J/(kg·K).', numT(tc, 0.15), [
        '$T = P/(\\rho R)$ = ' + nt(p * 100) + ' ÷ (' + nt(rho) + ' × 287) ≈ ' + q(rnd(T, 1), 'K') + '.',
        'In Celsius: ' + nt(rnd(T, 1)) + ' − 273.15 ≈ ' + q(rnd(tc, 1), '°C') + '.'
      ], 'Solve P = ρRT for T, which comes out in kelvins.', { unit: '°C', vk: 'temp', vd: { p: p, rho: rho } });
    }
    function lessDense() {
      var t1 = R.int(-10, 10), t2 = t1 + R.pick([20, 25, 30, 35, 40]), f = 100 * (1 - (t1 + CK) / (t2 + CK));
      return pr('At the same pressure, by what percent is air at ' + q(t2, '°C') + ' less dense than air at ' + q(t1, '°C') + '?', pct(f, 0.15), [
        'In kelvins: ' + q(t1 + CK, 'K') + ' and ' + q(t2 + CK, 'K') + '. At the same pressure, $\\rho$ is proportional to $1/T$.',
        '$\\rho_{\\text{warm}}/\\rho_{\\text{cold}}$ = ' + nt(t1 + CK) + '/' + nt(t2 + CK) + ' ≈ ' + nt(rnd((t1 + CK) / (t2 + CK), 4)) + '.',
        'Less dense by 1 − ' + nt(rnd((t1 + CK) / (t2 + CK), 4)) + ' ≈ ' + nt(rnd(f, 1)) + '%. (With Celsius you would get nonsense, like dividing by zero at 0 °C.)'
      ], 'Change both temperatures to kelvins first.', { vk: 'lessdense', vd: { t1: t1, t2: t2 } });
    }
    function spot() {
      var t = R.int(-12, -2), p = 1000;
      var right = 'Use kelvins: T = ' + q(t + CK, 'K') + ', so ρ ≈ ' + q(rnd(p * 100 / (RD * (t + CK)), 2), 'kg/m³');
      return pr(nm(R) + ' finds the density of air at ' + q(p, 'hPa') + ' and ' + q(t, '°C') + ' as 100,000 ÷ (287 × (' + nt(t) + ')) and gets a negative density. What is the fix?', mc(right, ['Use ' + q(-t, '°C') + ' instead, since density must be positive', 'Use the pressure in hectopascals, 1000, instead of pascals', 'Nothing: very cold air has a negative density']), [
        'The gas law needs absolute temperature: ' + nt(t) + ' + 273.15 = ' + q(t + CK, 'K') + '.',
        'ρ = 100,000 ÷ (287 × ' + nt(t + CK) + ') ≈ ' + q(rnd(p * 100 / (RD * (t + CK)), 3), 'kg/m³') + ', a sensible value for cold air.'
      ], 'What temperature scale does the gas law need?', { vk: 'concept' });
    }
    return lv(R, ctx, [ratioK, denser, density], [density, pressure, ratioK, spot], [temperature, lessDense, pressure, density]);
  });

  // ---------- g02_energy.js ----------
  // ===================== Unit 2: Sunlight and Earth's Energy =====================
  var SIG = 5.67e-8, WIEN = 2898, S0 = 1361;
  function sinD(d) { return MA.sin(d * MA.PI / 180); }
  function sci(x, s) { // "3.4 × 10⁶" as TeX
    var e = MA.floor(MA.log10(MA.abs(x))), m = rnd(x / MA.pow(10, e), s == null ? 2 : s); if (MA.abs(m) >= 10) { m = rnd(m / 10, s == null ? 2 : s); e++; }
    return M(nt(m) + ' \\times 10^{' + e + '}');
  }
  G('weather.radiation-wavelength', function (R, ctx) {
    var OBJ = [['the Sun\'s surface', 5800], ['a star', 9660], ['a red dwarf star', 2898], ['a hot stove ring', 966], ['lava', 1449], ['a campfire coal', 1159], ['a candle flame', 1932], ['a cool star', 3622]];
    var COOL = [['the ground on a mild day', 290], ['a person\'s skin', 306], ['a snowfield', 263], ['a high cloud top', 223], ['ocean water', 295], ['a desert at noon', 322]];
    function peak() {
      var o = R.pick(R.coin() ? OBJ : COOL); o = [o[0], o[1] < 400 ? o[1] + R.int(-6, 6) : o[1]]; var lam = WIEN / o[1];
      return pr('Use Wien\'s law, $\\lambda_{\\text{peak}} = 2898\\ \\mu\\text{m·K} \\div T$. At what wavelength does ' + o[0] + ' at ' + q(o[1], 'K') + ' glow brightest?', num(lam, 0.02), [
        '$\\lambda_{\\text{peak}}$ = 2898 ÷ ' + nt(o[1]) + ' μm.',
        '≈ ' + q(sig(lam, 3), 'μm') + ', which is ' + (lam < 0.4 ? 'ultraviolet' : lam <= 0.7 ? 'visible light' : 'infrared') + '.'
      ], 'Divide 2898 by the temperature in kelvins.', { unit: 'μm', vk: 'peak', vd: { T: o[1] } });
    }
    function band() {
      var lam = R.pick([0.25, 0.3, 0.35, 0.45, 0.5, 0.55, 0.6, 0.65, 1.5, 3, 5, 10, 12, 15, 0.4, 0.7, 0.8, 0.9, 1, 1.2, 2, 2.5, 3.5, 4, 6, 7, 8, 9]);
      var right = lam < 0.4 ? 'Ultraviolet' : lam <= 0.7 ? 'Visible light' : 'Infrared';
      return pr('Light with a wavelength of ' + q(lam, 'μm') + ' is which kind? (Visible light runs from about 0.4 to 0.7 μm.)', mcK(right, ['Ultraviolet', 'Visible light', 'Infrared'].filter(function (x) { return x !== right; })), [
        'Visible light: about 0.4 to 0.7 μm. Shorter is ultraviolet; longer is infrared.',
        q(lam, 'μm') + ' is ' + right.toLowerCase() + '.'
      ], 'Compare with the visible range, 0.4 to 0.7 μm.', { vk: 'band', vd: { lam: lam } });
    }
    function tempFrom() {
      var lam = R.pick([0.5, 0.6, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14, 0.7, 0.9, 1.2, 3.5, 6, 7]), T = WIEN / lam, inC = lam >= 8 && R.coin();
      return pr('An object\'s glow peaks at ' + q(lam, 'μm') + '. Using $\\lambda_{\\text{peak}} = 2898\\ \\mu\\text{m·K} \\div T$, what is its temperature' + (inC ? ' in °C?' : ' in kelvins?'), inC ? numT(T - CK, 1) : num(T, 0.01), [
        'Solve for $T$: $T = 2898 \\div \\lambda_{\\text{peak}}$ = 2898 ÷ ' + nt(lam) + ' ≈ ' + q(rnd(T, 1), 'K') + '.'
      ].concat(inC ? ['In Celsius: ' + nt(rnd(T, 1)) + ' − 273.15 ≈ ' + q(rnd(T - CK, 1), '°C') + '.'] : []), 'Rearrange Wien\'s law for T.', { unit: inC ? '°C' : 'K', vk: inC ? 'tempC' : 'tempK', vd: { lam: lam } });
    }
    function ratio() {
      var a = R.pick([[5800, 290, 'the Sun (5800 K)', 'Earth (290 K)'], [6000, 300, 'a star at 6000 K', 'a rock at 300 K'], [3000, 300, 'a lamp filament at 3000 K', 'a wall at 300 K'], [1500, 250, 'lava at 1500 K', 'a cloud top at 250 K']]), r = a[0] / a[1];
      return pr('How many times longer is the peak wavelength of ' + a[3] + ' than that of ' + a[2] + '?', num(r, 0.01), [
        'Wien\'s law: $\\lambda_{\\text{peak}}$ is proportional to $1/T$, so the ratio of wavelengths is the inverse ratio of temperatures.',
        nt(a[0]) + ' ÷ ' + nt(a[1]) + ' = ' + nt(rnd(r, 2)) + '.'
      ], 'A temperature ratio, flipped.', { vk: 'ratio', vd: { a: a[0], b: a[1] } });
    }
    function tfq() {
      var K = R.pick([
        ['A block of ice at −10 °C gives off no radiation at all.', false, 'Anything above 0 K glows; ice at 263 K peaks near 11 μm, in the infrared.'],
        ['Earth\'s surface gives off most of its radiation as infrared.', true, 'At about 288 K its glow peaks near 10 μm.'],
        ['The Sun\'s light peaks at a shorter wavelength than Earth\'s glow because the Sun is hotter.', true, 'Peak wavelength = 2898/T: a bigger T gives a shorter wavelength.'],
        ['Your body gives off light, but in the infrared, which your eyes can\'t see.', true, 'At about 306 K, skin peaks near 9.5 μm; thermal cameras see it.'],
        ['Only objects hot enough to glow red give off electromagnetic radiation.', false, 'Every object above absolute zero radiates; cool ones just radiate at longer, invisible wavelengths.'],
        ['Carbon dioxide absorbs most incoming visible sunlight.', false, 'CO₂ lets visible sunlight through; it absorbs in parts of the infrared.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Everything above absolute zero glows; temperature sets where the glow peaks.', { vk: 'concept' });
    }
    function why() {
      return pr('Why can the air let most sunlight reach the ground while absorbing much of the ground\'s glow?', mc('Sunlight peaks in the visible, which greenhouse gases barely absorb; the ground glows in the infrared, which they absorb strongly', ['The ground\'s glow is weaker, so it is easier to stop', 'Greenhouse gases reflect sunlight back to space', 'Infrared light travels more slowly than visible light']), [
        'The Sun (about 5800 K) peaks near 0.5 μm; the ground (about 290 K) near 10 μm.',
        'Water vapor and CO₂ absorb in infrared bands but let most visible light through, so the two kinds of light are treated differently.'
      ], 'Compare the two peak wavelengths.', { vk: 'concept' });
    }
    return lv(R, ctx, [peak, band, tfq], [peak, tempFrom, ratio, tfq], [tempFrom, ratio, why, peak]);
  });

  G('weather.stefan-boltzmann', function (R, ctx) {
    function ratio() {
      var P = R.pick([[300, 600], [200, 400], [250, 500], [300, 900], [200, 600], [400, 600], [300, 450], [500, 250], [600, 300], [150, 300], [350, 700], [280, 560], [400, 200], [100, 300], [240, 360], [320, 480]]), r = MA.pow(P[1] / P[0], 4);
      return pr('A surface at ' + q(P[0], 'K') + ' is heated (or cooled) to ' + q(P[1], 'K') + '. By what factor does the energy it gives off per square meter change?', num(r, 0.01), [
        '$E = \\sigma T^4$, so the ratio is $(T_2/T_1)^4$ = (' + P[1] + '/' + P[0] + ')⁴ = (' + nt(P[1] / P[0]) + ')⁴.',
        '= ' + nt(rnd(r, 4)) + '.'
      ], 'Find T₂/T₁ first, then raise it to the fourth power.', { vk: 'ratio', vd: { a: P[0], b: P[1] } });
    }
    function reverse() {
      var k = R.pick([2, 3, 0.5, 0.6, 1, 2.5]), f = MA.pow(k, 4), T1 = R.pick([120, 150, 200, 220, 250, 260, 280, 300, 320, 350, 400]);
      return pr('A surface at ' + q(T1, 'K') + ' changes temperature, and now each square meter gives off ' + (k < 1 ? '1/16 as much' : nt(f) + ' times as much') + ' energy. What is its new temperature?', num(T1 * k, 0.01), [
        'The energy goes as $T^4$, so the temperature changes by the fourth root of the energy factor: $\\sqrt[4]{' + (k < 1 ? '1/16' : nt(f)) + '}$ = ' + nt(k) + '.',
        'New temperature: ' + nt(T1) + ' × ' + nt(k) + ' = ' + q(T1 * k, 'K') + '.'
      ], 'Undo a fourth power with a fourth root.', { unit: 'K', vk: 'reverse', vd: { T1: T1, _k: k } });
    }
    function emit() {
      var t = R.int(200, 335), E = SIG * MA.pow(t, 4);
      return pr('Using $E = \\sigma T^4$ with $\\sigma = 5.67 \\times 10^{-8}$ W m⁻² K⁻⁴, how much energy does each square meter of a surface at ' + q(t, 'K') + ' give off?', num(E, 0.02), [
        '$T^4$ = ' + nt(t) + '⁴ ≈ ' + sci(MA.pow(t, 4), 3) + ' K⁴.',
        '$E$ = 5.67 × 10⁻⁸ × ' + sci(MA.pow(t, 4), 3) + ' ≈ ' + q(rnd(E, 0), 'W/m²') + '.'
      ], 'Raise the kelvin temperature to the fourth power, then multiply by σ.', { unit: 'W/m²', vk: 'emit', vd: { t: t } });
    }
    function temp() {
      var E = R.int(15, 50) * 10, T = MA.pow(E / SIG, 0.25);
      return pr('A surface gives off ' + q(E, 'W/m²') + ' of infrared. If it radiates like a perfect emitter ($E = \\sigma T^4$, $\\sigma = 5.67 \\times 10^{-8}$ W m⁻² K⁻⁴), what is its temperature in kelvins?', num(T, 0.01), [
        '$T^4 = E/\\sigma$ = ' + nt(E) + ' ÷ (5.67 × 10⁻⁸) ≈ ' + sci(E / SIG, 3) + '.',
        '$T$ = (' + sci(E / SIG, 3) + ')$^{1/4}$ ≈ ' + q(rnd(T, 1), 'K') + ' (' + q(rnd(T - CK, 1), '°C') + ').'
      ], 'Divide by σ, then take the fourth root.', { unit: 'K', vk: 'temp', vd: { E: E } });
    }
    function celsius() {
      var t1 = R.int(-10, 20), t2 = t1 + R.pick([5, 10, 15, 20, 30, 7, 11, 19, 25, 29]), r = MA.pow((t2 + CK) / (t1 + CK), 4);
      return pr('A field warms from ' + q(t1, '°C') + ' to ' + q(t2, '°C') + '. By what factor does its infrared glow increase? (Round to three decimal places.)', num(r, 0.004), [
        'Use kelvins: ' + q(t1 + CK, 'K') + ' and ' + q(t2 + CK, 'K') + '.',
        'Ratio: (' + nt(t2 + CK) + '/' + nt(t1 + CK) + ')⁴ ≈ ' + nt(rnd((t2 + CK) / (t1 + CK), 4)) + '⁴ ≈ ' + nt(rnd(r, 3)) + '.',
        'A modest rise, nothing like the 16 times you would get by "doubling" a Celsius temperature.'
      ], 'Change both temperatures to kelvins first.', { vk: 'celsius', vd: { t1: t1, t2: t2 } });
    }
    function oneK() {
      var t = R.int(250, 305), d = SIG * (MA.pow(t + 1, 4) - MA.pow(t, 4));
      return pr('Earth\'s surface at ' + q(t, 'K') + ' warms by 1 K. By how many W/m² does each square meter\'s glow increase? Use $\\sigma = 5.67 \\times 10^{-8}$ W m⁻² K⁻⁴.', num(d, 0.02), [
        'Glow at ' + nt(t) + ' K: σ·' + nt(t) + '⁴ ≈ ' + q(rnd(SIG * MA.pow(t, 4), 1), 'W/m²') + '. At ' + nt(t + 1) + ' K: ≈ ' + q(rnd(SIG * MA.pow(t + 1, 4), 1), 'W/m²') + '.',
        'Difference ≈ ' + q(rnd(d, 2), 'W/m²') + '. (A shortcut: about $4\\sigma T^3$.) This extra glow is why a warmer Earth sheds more heat.'
      ], 'Compute σT⁴ at both temperatures and subtract.', { unit: 'W/m²', vk: 'onek', vd: { t: t } });
    }
    function tfq() {
      var K = R.pick([
        ['Doubling a surface\'s kelvin temperature doubles the energy it gives off.', false, 'It multiplies the energy by 2⁴ = 16.'],
        ['A surface at 600 K gives off 16 times as much energy per square meter as one at 300 K.', true, '(600/300)⁴ = 2⁴ = 16.'],
        ['Warming from 10 °C to 20 °C multiplies a surface\'s glow by 16.', false, 'In kelvins that is 283 K to 293 K, a factor of about 1.15.'],
        ['A slightly warmer Earth gives off noticeably more infrared, which helps steady its temperature.', true, 'Because of the fourth power, a 1% rise in kelvins raises the glow by about 4%.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'E = σT⁴, with T in kelvins.', { vk: 'concept' });
    }
    return lv(R, ctx, [ratio, reverse, tfq], [emit, ratio, temp, reverse, tfq], [celsius, oneK, temp, emit]);
  });

  G('weather.insolation', function (R, ctx) {
    function sinNote(h) { return 'sin ' + nt(h) + '° ≈ ' + nt(rnd(sinD(h), 3)); }
    function onGround() {
      var h = R.pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]), b = R.pick([800, 900, 1000, 1050]), s3 = rnd(sinD(h), 3), E = b * s3;
      return pr('The Sun is ' + q(h, '°') + ' above the horizon, and the direct beam carries ' + q(b, 'W/m²') + ' on a surface facing the Sun. How much falls on each square meter of level ground? (' + sinNote(h) + ')', num(E, 0.01), [
        'Level ground gets the beam times $\\sin h$, because the beam spreads over $1/\\sin h$ times the area.',
        nt(b) + ' × ' + nt(s3) + ' ≈ ' + q(rnd(E, 0), 'W/m²') + '.'
      ], 'Multiply the beam by the sine of the Sun\'s height.', { unit: 'W/m²', vk: 'ground', vd: { h: h, b: b } });
    }
    function spread() {
      var h = R.pick([30, 30, 20, 40, 50, 60, 90]), s3 = rnd(sinD(h), 3), Lg = 1 / s3;
      return pr('A beam of sunlight 1 m wide strikes level ground with the Sun ' + q(h, '°') + ' high. How long a strip of ground does it cover? (' + sinNote(h) + ')', num(Lg, 0.01), [
        'The strip is $1/\\sin h$ meters long: 1 ÷ ' + nt(s3) + ' ≈ ' + q(rnd(Lg, 2), 'm') + '.',
        h === 90 ? 'With the Sun overhead, the beam is not spread at all.' : 'The same energy is shared over ' + nt(rnd(Lg, 2)) + ' times the area, so each square meter gets less.'
      ], 'A lower Sun stretches the beam\'s footprint.', { unit: 'm', vk: 'spread', vd: { h: h } });
    }
    var DATES = [['the March equinox', 0], ['the September equinox', 0], ['the June solstice', 23.4], ['the December solstice', -23.4]];
    function latS(l) { return l === 0 ? 'the equator' : nt(MA.abs(l)) + '° ' + (l > 0 ? 'N' : 'S'); }
    function noon() {
      var lat = R.pick([1, -1]) * R.int(0, 60), D = R.pick(DATES), h = 90 - MA.abs(lat - D[1]);
      if (h > 90 || h < 5) { lat = 35; h = 90 - MA.abs(lat - D[1]); }
      return pr('How high above the horizon is the noon Sun at ' + latS(lat) + ' on ' + D[0] + '? (The Sun is overhead at ' + (D[1] === 0 ? 'the equator' : '23.4° ' + (D[1] > 0 ? 'N' : 'S')) + ' that day.)', numT(h, 0.06), [
        'Noon Sun height: $h = 90^\\circ - |\\text{latitude} - \\text{Sun\'s latitude}|$, counting north as + and south as −.',
        '|' + nt(lat) + ' − (' + nt(D[1]) + ')| = ' + nt(rnd(MA.abs(lat - D[1]), 1)) + '°, so $h$ = 90° − ' + nt(rnd(MA.abs(lat - D[1]), 1)) + '° = ' + q(rnd(h, 1), '°') + '.'
      ], 'How many degrees of latitude are you from where the Sun is overhead?', { unit: '°', vk: 'noon', vd: { lat: MA.abs(lat), _lat: lat, _dec: D[1] } });
    }
    function compare() {
      var lat = R.int(25, 60), sN = 90 - MA.abs(lat - 23.4), sW = 90 - (lat + 23.4), r = sinD(sN) / sinD(sW);
      return pr('At ' + q(lat, '° N') + ', compare the noon sunlight on level ground on the June and December solstices (the Sun is overhead at 23.4° N and 23.4° S on those days). How many times as much energy per square meter arrives at noon in June, for the same beam?', num(r, 0.02), [
        'June: $h$ = 90° − (' + nt(lat) + '° − 23.4°) = ' + nt(rnd(sN, 1)) + '°. December: $h$ = 90° − (' + nt(lat) + '° + 23.4°) = ' + nt(rnd(sW, 1)) + '°.',
        'Ratio: sin ' + nt(rnd(sN, 1)) + '° ÷ sin ' + nt(rnd(sW, 1)) + '° ≈ ' + nt(rnd(sinD(sN), 3)) + ' ÷ ' + nt(rnd(sinD(sW), 3)) + ' ≈ ' + nt(rnd(r, 2)) + '.'
      ], 'Find both noon Sun heights, then compare their sines.', { vk: 'compare', vd: { lat: lat } });
    }
    function concept() {
      var K = R.pick([
        ['On a clear day, what is the main reason the low winter Sun warms the ground less?', 'Its beam spreads over more ground, so each square meter gets less energy', ['The Sun is farther from Earth in winter', 'Its light passes through more air, which absorbs most of it', 'Winter sunlight has longer wavelengths']],
        ['Where on Earth is the noon Sun highest on the June solstice?', 'Overhead at about 23.4° N', ['Overhead at the equator', 'At the North Pole', 'Overhead at about 23.4° S']],
        ['At the same noon Sun height, which surface receives the most sunlight per square meter?', 'One facing the Sun directly', ['Level ground', 'A slope facing away from the Sun', 'All receive the same']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['A beam\'s energy per square meter depends on how directly it strikes the surface.', 'Answer: ' + K[1] + '.'], 'Think of a flashlight tilted over a table.', { vk: 'concept' });
    }
    function noonFlux() {
      var lat = R.pick([1, -1]) * R.int(10, 55), D = R.pick(DATES), h = 90 - MA.abs(lat - D[1]), b = 1000, E = b * sinD(h);
      return pr('The direct beam carries ' + q(b, 'W/m²') + '. How much reaches each square meter of level ground at noon at ' + latS(lat) + ' on ' + D[0] + '? (The Sun is overhead at ' + (D[1] === 0 ? 'the equator' : '23.4° ' + (D[1] > 0 ? 'N' : 'S')) + ' that day.)', num(E, 0.01), [
        'Noon Sun height: 90° − |' + nt(lat) + ' − (' + nt(D[1]) + ')| = ' + nt(rnd(h, 1)) + '°.',
        'On level ground: 1000 × sin ' + nt(rnd(h, 1)) + '° ≈ 1000 × ' + nt(rnd(sinD(h), 3)) + ' ≈ ' + q(rnd(E, 0), 'W/m²') + '.'
      ], 'Find the Sun\'s height, then multiply the beam by its sine.', { unit: 'W/m²', vk: 'noonflux', vd: { lat: MA.abs(lat), _lat: lat, _dec: D[1] } });
    }
    return lv(R, ctx, [onGround, spread, noon], [onGround, noon, concept, spread], [compare, noonFlux, noon]);
  });

  G('weather.albedo', function (R, ctx) {
    var SURF = [['fresh snow', 0.85], ['fresh snow', 0.8], ['sea ice', 0.6], ['desert sand', 0.4], ['grassland', 0.25], ['a forest', 0.12], ['open ocean', 0.06], ['a dark parking lot', 0.05], ['a white roof', 0.7]];
    function absorbed() {
      var s = R.pick(SURF), I = R.pick([400, 500, 600, 700, 800, 900, 1000]), A = (1 - s[1]) * I;
      return pr('Sunlight of ' + q(I, 'W/m²') + ' falls on ' + s[0] + ' with an albedo of ' + nt(s[1]) + '. How much does each square meter absorb?', num(A, 0.01), [
        'The share absorbed is 1 − albedo = 1 − ' + nt(s[1]) + ' = ' + nt(fix(1 - s[1])) + '.',
        nt(fix(1 - s[1])) + ' × ' + nt(I) + ' = ' + q(fix(A), 'W/m²') + '.'
      ], 'Albedo is the share reflected; the rest is absorbed.', { unit: 'W/m²', vk: 'abs', vd: { a: s[1], I: I } });
    }
    function reflected() {
      var s = R.pick(SURF), I = R.pick([300, 400, 500, 600, 800, 1000, 350, 700, 900]), Rf = s[1] * I;
      return pr('Sunlight of ' + q(I, 'W/m²') + ' falls on ' + s[0] + ' (albedo ' + nt(s[1]) + '). How much is reflected from each square meter?', num(Rf, 0.01), [
        'Reflected = albedo × incoming = ' + nt(s[1]) + ' × ' + nt(I) + ' = ' + q(fix(Rf), 'W/m²') + '.'
      ], 'Albedo is the fraction reflected.', { unit: 'W/m²', vk: 'refl', vd: { a: s[1], I: I } });
    }
    function findAlbedo() {
      var I = R.pick([200, 250, 300, 340, 400, 500, 800, 1000, 350, 600, 700, 900]), a = R.pick([0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.75, 0.8, 0.9, 0.06, 0.07, 0.08, 0.09, 0.12, 0.15, 0.35, 0.5, 0.7]), Rf = fix(a * I), asP = R.coin();
      return pr('A satellite measures ' + q(I, 'W/m²') + ' of sunlight reaching a region and ' + q(Rf, 'W/m²') + ' reflected back. What is the region\'s albedo' + (asP ? ', as a percent?' : ', as a decimal?'), asP ? pct(a * 100, 0.05) : { t: 'num', v: vstr(a), tol: 0.0051 }, [
        'Albedo = reflected ÷ incoming = ' + nt(Rf) + ' ÷ ' + nt(I) + ' = ' + nt(a) + (asP ? ' = ' + nt(a * 100) + '%' : '') + '.'
      ], 'Divide what is reflected by what arrives.', { vk: 'find', vd: { I: I, Rf: Rf, _pct: asP ? 1 : 0 } });
    }
    function compare() {
      var I = R.pick([500, 600, 800, 700]), A = [['open ocean', 0.06], ['a forest', 0.12]], B = [['fresh snow', 0.85], ['fresh snow', 0.88], ['sea ice', 0.6]], a = R.pick(A), b = R.pick(B), r = (1 - a[1]) / (1 - b[1]);
      return pr('Under the same sunlight (' + q(I, 'W/m²') + '), how many times as much energy does ' + a[0] + ' (albedo ' + nt(a[1]) + ') absorb as ' + b[0] + ' (albedo ' + nt(b[1]) + ')?', num(r, 0.01), [
        a[0] + ' absorbs ' + nt(fix(1 - a[1])) + ' × ' + nt(I) + ' = ' + q(fix((1 - a[1]) * I), 'W/m²') + '; ' + b[0] + ' absorbs ' + nt(fix(1 - b[1])) + ' × ' + nt(I) + ' = ' + q(fix((1 - b[1]) * I), 'W/m²') + '.',
        'Ratio: ' + nt(fix((1 - a[1]) * I)) + ' ÷ ' + nt(fix((1 - b[1]) * I)) + ' ≈ ' + nt(rnd(r, 2)) + '. Melting ice that uncovers ocean multiplies the energy absorbed.'
      ], 'Compare the absorbed shares, 1 − albedo.', { vk: 'cmp', vd: { a: a[1], b: b[1], I: I } });
    }
    function concept() {
      var K = R.pick([
        ['Fresh snow has a high albedo. What does that mean?', 'It reflects most of the sunlight that hits it, so it absorbs little', ['It absorbs most of the sunlight that hits it', 'It gives off a lot of infrared', 'It lets sunlight pass through to the ground']],
        ['Which surface has the lowest albedo?', 'Open ocean', ['Fresh snow', 'Desert sand', 'Sea ice']],
        ['Which surface has the highest albedo?', 'Fresh snow', ['Open ocean', 'A forest', 'Grassland']],
        ['Arctic sea ice melts and uncovers open ocean. What happens to the sunlight absorbed there?', 'It increases, because the dark ocean has a much lower albedo than ice', ['It decreases, because water reflects more than ice', 'It stays the same, because the sunlight is the same', 'It drops to zero']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Albedo is the fraction of sunlight reflected; absorbed = 1 − albedo.', 'Answer: ' + K[1] + '.'], 'High albedo: bright and reflective.', { vk: 'concept' });
    }
    function mixArea() {
      var f = R.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 0.3, 0.35, 0.7]), aS = 0.8, aG = 0.2, a = f * aS + (1 - f) * aG;
      return pr('A valley is ' + nt(f * 100) + '% covered by snow (albedo ' + nt(aS) + ') and the rest is bare ground (albedo ' + nt(aG) + '). What is the albedo of the valley as a whole?', { t: 'num', v: vstr(fix(a)), tol: 0.0051 }, [
        'Average the albedos, weighted by area: ' + nt(f) + ' × ' + nt(aS) + ' + ' + nt(fix(1 - f)) + ' × ' + nt(aG) + '.',
        '= ' + nt(fix(f * aS)) + ' + ' + nt(fix((1 - f) * aG)) + ' = ' + nt(fix(a)) + '.'
      ], 'Weight each surface\'s albedo by the share of area it covers.', { vk: 'mix', vd: { f: f * 100, aS: aS, aG: aG } });
    }
    function earthDrop() {
      var a1 = 0.3, a2 = R.pick([0.29, 0.31, 0.32, 0.28, 0.3]), I = 340, d = (1 - a2) * I - (1 - a1) * I;
      return pr('Earth receives about ' + q(I, 'W/m²') + ' of sunlight on average, and its albedo is ' + nt(a1) + '. If clouds and ice changed the albedo to ' + nt(a2) + ', by how many W/m² would the absorbed sunlight change? (Give a negative number for a decrease.)', { t: 'num', v: vstr(fix(d)), tol: 0.05 }, [
        'Before: (1 − ' + nt(a1) + ') × ' + nt(I) + ' = ' + q(fix((1 - a1) * I), 'W/m²') + '. After: (1 − ' + nt(a2) + ') × ' + nt(I) + ' = ' + q(fix((1 - a2) * I), 'W/m²') + '.',
        'Change: ' + sgn(fix(d), 'W/m²') + '. A change of a few W/m² is about as big as the push from doubling carbon dioxide.'
      ], 'Compute the absorbed sunlight both ways and subtract.', { unit: 'W/m²', vk: 'earth', vd: { a1: a1, a2: a2, I: I } });
    }
    return lv(R, ctx, [absorbed, reflected, findAlbedo], [absorbed, compare, findAlbedo, concept], [mixArea, earthDrop, compare, concept]);
  });

  G('weather.energy-balance', function (R, ctx) {
    var BODIES = [['Earth', 1361, 0.3], ['the Moon', 1361, 0.12], ['Mars', 586, 0.25], ['Venus', 2601, 0.76]];
    function body() { if (R.chance(0.5)) return R.pick(BODIES); var S = R.int(18, 60) * 50, a = R.int(2, 12) * 0.05; a = fix(a); return ['a planet that gets ' + q(S, 'W/m²') + ' of sunlight', S, a]; }
    function teq(S, a) { return MA.pow(S * (1 - a) / (4 * SIG), 0.25); }
    function absorbed() {
      var b = body(), A = b[1] * (1 - b[2]) / 4;
      return pr('Sunlight at ' + b[0] + '\'s distance is ' + q(b[1], 'W/m²') + ' and its albedo is ' + nt(b[2]) + '. Averaged over its whole sphere, how much sunlight does each square meter absorb?', num(A, 0.01), [
        'Spread over the sphere: ' + nt(b[1]) + ' ÷ 4 = ' + q(rnd(b[1] / 4, 2), 'W/m²') + ' (a disk catches it; a sphere four times the disk\'s area shares it).',
        'Absorbed: (1 − ' + nt(b[2]) + ') × ' + nt(rnd(b[1] / 4, 2)) + ' ≈ ' + q(rnd(A, 1), 'W/m²') + '.'
      ], 'Divide by 4, then keep the share that is not reflected.', { unit: 'W/m²', vk: 'abs', vd: { S: b[1], a: b[2] } });
    }
    function balanceT() {
      var b = body(), T = teq(b[1], b[2]);
      return pr('Find the balance temperature (no greenhouse effect) of ' + b[0] + ', where sunlight is ' + q(b[1], 'W/m²') + ' and the albedo is ' + nt(b[2]) + '. Use $\\sigma T^4 = S(1 - \\alpha)/4$ with $\\sigma = 5.67 \\times 10^{-8}$ W m⁻² K⁻⁴. Give the answer in kelvins.', num(T, 0.01), [
        'Absorbed per square meter: ' + nt(b[1]) + ' × (1 − ' + nt(b[2]) + ') ÷ 4 ≈ ' + q(rnd(b[1] * (1 - b[2]) / 4, 1), 'W/m²') + '.',
        '$T^4$ ≈ ' + nt(rnd(b[1] * (1 - b[2]) / 4, 1)) + ' ÷ (5.67 × 10⁻⁸) ≈ ' + sci(b[1] * (1 - b[2]) / 4 / SIG, 3) + '.',
        '$T$ ≈ ' + q(rnd(T, 1), 'K') + ' (' + q(rnd(T - CK, 1), '°C') + ').'
      ], 'Absorbed sunlight per square meter, then σT⁴ equal to it.', { unit: 'K', vk: 'te', vd: { S: b[1], a: b[2] } });
    }
    function distance() {
      var D = R.pick([4, 9, 16, 0.25, 2.25]), k = D * D, T0 = R.pick([200, 210, 240, 250, 255, 260, 270, 280, 300]), T = T0 / MA.sqrt(D);
      var dist = D === 0.25 ? 'to a quarter of its distance from the Sun' : nt(D) + ' times as far from the Sun';
      return pr('A planet with a balance temperature of ' + q(T0, 'K') + ' is moved ' + dist + ', keeping its albedo. Sunlight weakens as 1/distance². What is its new balance temperature?', num(T, 0.01), [
        'The sunlight changes by a factor of 1/' + nt(D) + '² = ' + (D < 1 ? nt(k === 1 / 16 ? 16 : 1 / k) + ' (it gets stronger)' : '1/' + nt(k)) + '.',
        '$T$ goes as $S^{1/4}$, so it changes by the fourth root of that, which is 1/√' + nt(D) + ' = ' + nt(rnd(1 / MA.sqrt(D), 4)) + '.',
        nt(T0) + ' × ' + nt(rnd(1 / MA.sqrt(D), 4)) + ' ≈ ' + q(rnd(T, 1), 'K') + '.'
      ], 'Temperature goes as the fourth root of the sunlight.', { unit: 'K', vk: 'dist', vd: { T0: T0, _D: D } });
    }
    function factor4() {
      return pr('In $\\sigma T^4 = S(1 - \\alpha)/4$, where does the 4 come from?', mc('Earth catches sunlight on a disk of area πR² but gives off heat from its whole sphere, area 4πR²', ['A quarter of the sunlight is absorbed by the air', 'The Sun shines on Earth only a quarter of each day', 'It comes from the fourth power in σT⁴']), [
        'Sunlight arrives from one direction, so Earth\'s shadow, a disk of area πR², measures what it catches.',
        'Earth glows from every side: area 4πR². Average sunlight per square meter of sphere is S/4.'
      ], 'Compare the area that catches sunlight with the area that glows.', { vk: 'concept' });
    }
    function albedoFrom() {
      var T = R.pick([240, 245, 250, 255, 260, 265]), S = 1361, a = 1 - 4 * SIG * MA.pow(T, 4) / S;
      return pr('Satellites show a planet getting ' + q(S, 'W/m²') + ' of sunlight that balances at ' + q(T, 'K') + ' (no greenhouse effect). Using $\\sigma T^4 = S(1 - \\alpha)/4$ and $\\sigma = 5.67 \\times 10^{-8}$ W m⁻² K⁻⁴, what is its albedo? (Give a decimal.)', { t: 'num', v: vstr(rnd(a, 4)), tol: 0.006 }, [
        'Emitted per square meter: $\\sigma T^4$ = 5.67 × 10⁻⁸ × ' + nt(T) + '⁴ ≈ ' + q(rnd(SIG * MA.pow(T, 4), 1), 'W/m²') + '.',
        'Absorbed must match: $S(1 - \\alpha)/4$ = ' + nt(rnd(SIG * MA.pow(T, 4), 1)) + ', so $1 - \\alpha$ = 4 × ' + nt(rnd(SIG * MA.pow(T, 4), 1)) + ' ÷ ' + nt(S) + ' ≈ ' + nt(rnd(1 - a, 3)) + '.',
        '$\\alpha$ ≈ ' + nt(rnd(a, 3)) + '.'
      ], 'Work out σT⁴, then solve for (1 − α).', { vk: 'alb', vd: { T: T, S: S } });
    }
    function forget() {
      var T = teq(S0, 0.3), Tw = MA.pow(S0 * 0.7 / SIG, 0.25);
      return pr(nm(R) + ' computes Earth\'s balance temperature as $(1361 \\times 0.7 \\div \\sigma)^{1/4}$ and gets about ' + q(rnd(Tw, 0), 'K') + ', near boiling. What went wrong?', mc('The sunlight should be divided by 4, since Earth\'s sphere has four times the area of the disk that catches it; the answer is about 255 K', ['The albedo should be 0.3, not 0.7, so use 1361 × 0.3', 'σ should be multiplied, not divided', 'Nothing: Earth would be that hot without an atmosphere']), [
        'Average absorbed sunlight per square meter: 1361 × 0.7 ÷ 4 ≈ 238 W/m².',
        '$T = (238/\\sigma)^{1/4}$ ≈ ' + q(rnd(T, 0), 'K') + ', about −18 °C.'
      ], 'Check how the sunlight is spread over the planet.', { vk: 'concept' });
    }
    return lv(R, ctx, [absorbed, distance, factor4], [balanceT, absorbed, distance, forget], [balanceT, albedoFrom, distance]);
  });

  G('weather.greenhouse-layer', function (R, ctx) {
    function ts(Te, e) { return Te * MA.pow(2 / (2 - e), 0.25); }
    function full() {
      var Te = R.pick([210, 230, 240, 250, 255, 260]), T = ts(Te, 1);
      return pr('In the one-layer model, an air layer absorbs <b>all</b> of the ground\'s infrared ($\\varepsilon = 1$). If the balance temperature seen from space is ' + q(Te, 'K') + ', what is the surface temperature? ($2^{1/4} \\approx 1.189$)', num(T, 0.01), [
        'With $\\varepsilon = 1$: $T_s = T_e \\times 2^{1/4}$.',
        nt(Te) + ' × 1.189 ≈ ' + q(rnd(T, 1), 'K') + '.'
      ], 'The ground gets sunlight plus an equal amount back from the layer.', { unit: 'K', vk: 'full', vd: { Te: Te } });
    }
    function down() {
      var A = R.pick([200, 220, 238, 240, 250, 260]);
      return pr('In the one-layer model with a layer that absorbs all of the ground\'s infrared, the planet absorbs ' + q(A, 'W/m²') + ' of sunlight. How much energy per square meter does the ground receive in all (sunlight plus the layer\'s downward glow)?', num(2 * A, 0.01), [
        'Seen from space only the layer glows, so it sends ' + q(A, 'W/m²') + ' up to balance the sunlight.',
        'A layer glows equally up and down: ' + q(A, 'W/m²') + ' down. The ground gets ' + nt(A) + ' + ' + nt(A) + ' = ' + q(2 * A, 'W/m²') + '.'
      ], 'The layer glows the same amount from its top and its bottom.', { unit: 'W/m²', vk: 'down', vd: { A: A } });
    }
    function general() {
      var Te = R.pick([250, 253, 255, 258]), e = R.pick([0.5, 0.6, 0.7, 0.75, 0.78, 0.8, 0.85, 0.9]), T = ts(Te, e);
      return pr('Use $T_s = T_e\\left(\\dfrac{2}{2 - \\varepsilon}\\right)^{1/4}$ with $T_e$ = ' + q(Te, 'K') + ' and $\\varepsilon$ = ' + nt(e) + '. What is the surface temperature in kelvins?', num(T, 0.005), [
        '$2 - \\varepsilon$ = ' + nt(fix(2 - e)) + ', and 2 ÷ ' + nt(fix(2 - e)) + ' ≈ ' + nt(rnd(2 / (2 - e), 4)) + '.',
        'Fourth root: ' + nt(rnd(2 / (2 - e), 4)) + '$^{1/4}$ ≈ ' + nt(rnd(MA.pow(2 / (2 - e), 0.25), 4)) + '.',
        '$T_s$ ≈ ' + nt(Te) + ' × ' + nt(rnd(MA.pow(2 / (2 - e), 0.25), 4)) + ' ≈ ' + q(rnd(T, 1), 'K') + ' (' + q(rnd(T - CK, 1), '°C') + ').'
      ], 'Work inside the parentheses first, then take the fourth root.', { unit: 'K', vk: 'gen', vd: { Te: Te, e: e } });
    }
    function epsFrom() {
      var Te = 255, Ts = R.pick([270, 275, 280, 285, 288, 290, 295]), e = 2 - 2 * MA.pow(Te / Ts, 4);
      return pr('In the one-layer model, $T_e$ = ' + q(Te, 'K') + '. What value of $\\varepsilon$ would give a surface temperature of ' + q(Ts, 'K') + '? (Solve $T_s^4 = T_e^4 \\cdot 2/(2 - \\varepsilon)$; give a decimal.)', { t: 'num', v: vstr(rnd(e, 4)), tol: 0.006 }, [
        '$(T_e/T_s)^4$ = (' + nt(Te) + '/' + nt(Ts) + ')⁴ ≈ ' + nt(rnd(MA.pow(Te / Ts, 4), 4)) + ' = $(2 - \\varepsilon)/2$.',
        '$2 - \\varepsilon$ ≈ 2 × ' + nt(rnd(MA.pow(Te / Ts, 4), 4)) + ' ≈ ' + nt(rnd(2 * MA.pow(Te / Ts, 4), 3)) + ', so $\\varepsilon$ ≈ ' + nt(rnd(e, 3)) + '.'
      ], 'Rearrange for (2 − ε) first.', { vk: 'eps', vd: { Te: Te, Ts: Ts } });
    }
    function height() {
      var ts0 = R.pick([14, 15, 16]), te = R.pick([-18, -19, -20]), g = R.pick([6, 6.5]), z = (ts0 - te) / g;
      return pr('Earth\'s surface averages ' + q(ts0, '°C') + ', and the infrared that escapes to space comes on average from air at ' + q(te, '°C') + '. If the air cools ' + q(g, '°C') + ' per km with height, about how high is that average escape level?', num(z, 0.02), [
        'Temperature difference: ' + nt(ts0) + ' − (' + nt(te) + ') = ' + q(ts0 - te, '°C') + '.',
        'Height: ' + nt(ts0 - te) + ' ÷ ' + nt(g) + ' ≈ ' + q(rnd(z, 1), 'km') + '. Earth sheds its heat from high, cold air; the surface below must be warmer.'
      ], 'How many kilometers of cooling make up the difference?', { unit: 'km', vk: 'height', vd: { ts0: ts0, te: te, g: g } });
    }
    function concept() {
      var K = R.pick([
        ['With greenhouse gases in the air, how does the energy Earth sends to space compare with the sunlight it absorbs, once things settle?', 'They are equal; more of the outgoing energy comes from high, cold air, so the surface must be warmer', ['Earth sends out much less, because the gases trap the heat for good', 'Earth sends out more, because the gases add energy', 'Earth sends out none of its infrared']],
        ['Why does a layer of air that absorbs infrared warm the ground below it?', 'It glows downward as well as upward, so the ground receives sunlight plus the layer\'s glow', ['It reflects sunlight down onto the ground', 'It blocks the Sun\'s ultraviolet light', 'It stops all heat from leaving Earth']],
        ['Adding more carbon dioxide to the air first causes what?', 'Earth briefly sends out less energy than it absorbs, so it warms until the balance returns', ['Earth immediately reflects more sunlight', 'The ozone hole grows', 'Earth sends out more energy and cools']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Energy out to space must equal sunlight absorbed once the temperatures settle.', 'Answer: ' + K[1] + '.'], 'Follow the energy: in from the Sun, out to space.', { vk: 'concept' });
    }
    return lv(R, ctx, [full, down, concept], [general, full, height, concept], [general, epsFrom, height]);
  });

  G('weather.specific-heat', function (R, ctx) {
    var CW = 4186, CS = 830;
    function dT() {
      var water = R.coin(), m = R.pick([1, 2, 5, 10, 20, 50]), c = water ? CW : CS, dt = R.pick([2, 4, 5, 8, 10]), Q = m * c * dt;
      return pr('A sample of ' + q(m, 'kg') + ' of ' + (water ? 'water ($c$ = 4186 J/(kg·°C))' : 'dry sand ($c$ = 830 J/(kg·°C))') + ' absorbs ' + q(Q, 'J') + '. By how much does its temperature rise?', numT(dt, 0.05), [
        '$\\Delta T = Q/(mc)$ = ' + nt(Q) + ' ÷ (' + nt(m) + ' × ' + nt(c) + ').',
        '= ' + nt(Q) + ' ÷ ' + nt(m * c) + ' = ' + q(dt, '°C') + '.'
      ], 'Rearrange Q = mcΔT for ΔT.', { unit: '°C', vk: 'dt', vd: { m: m, c: c, Q: Q } });
    }
    function Qcalc() {
      var water = R.coin(), m = R.pick([2, 3, 5, 10, 25, 100]), c = water ? CW : CS, dt = R.pick([1, 2, 3, 5, 6, 10]), Q = m * c * dt;
      return pr('How much energy does it take to warm ' + q(m, 'kg') + ' of ' + (water ? 'water ($c$ = 4186 J/(kg·°C))' : 'dry sand ($c$ = 830 J/(kg·°C))') + ' by ' + q(dt, '°C') + '?', num(Q, 0.01), [
        '$Q = mc\\Delta T$ = ' + nt(m) + ' × ' + nt(c) + ' × ' + nt(dt) + '.',
        '= ' + q(Q, 'J') + '.'
      ], 'Multiply mass, specific heat and temperature change.', { unit: 'J', vk: 'q', vd: { m: m, c: c, dt: dt } });
    }
    function compare() {
      var mw = R.pick([1, 2, 5]), ms = mw, Q = R.pick([8372, 16744, 41860, 83720]), dw = Q / (mw * CW), ds = Q / (ms * CS);
      return pr('The same ' + q(Q, 'J') + ' of sunlight goes into ' + q(mw, 'kg') + ' of water ($c$ = 4186) and into ' + q(ms, 'kg') + ' of dry sand ($c$ = 830 J/(kg·°C)). How many times bigger is the sand\'s temperature rise?', num(ds / dw, 0.01), [
        'Water: ' + nt(Q) + ' ÷ (' + nt(mw) + ' × 4186) = ' + q(rnd(dw, 2), '°C') + '. Sand: ' + nt(Q) + ' ÷ (' + nt(ms) + ' × 830) ≈ ' + q(rnd(ds, 2), '°C') + '.',
        'Ratio: ' + nt(rnd(ds, 2)) + ' ÷ ' + nt(rnd(dw, 2)) + ' ≈ ' + nt(rnd(ds / dw, 2)) + ', the ratio of the specific heats, 4186 ÷ 830.'
      ], 'With equal masses and equal energy, the ratio of warming is the inverse ratio of specific heats.', { vk: 'cmp', vd: { Q: Q, mw: mw } });
    }
    function mass() {
      var Q = R.pick([418600, 837200, 2093000, 4186000]), dt = R.pick([1, 2, 5, 10]), m = Q / (CW * dt);
      return pr('An energy of ' + q(Q, 'J') + ' warms a mass of water by ' + q(dt, '°C') + '. What is the mass of the water? ($c$ = 4186 J/(kg·°C))', num(m, 0.01), [
        '$m = Q/(c\\Delta T)$ = ' + nt(Q) + ' ÷ (4186 × ' + nt(dt) + ').',
        '= ' + q(fix(m), 'kg') + '.'
      ], 'Rearrange Q = mcΔT for m.', { unit: 'kg', vk: 'mass', vd: { Q: Q, dt: dt } });
    }
    function concept() {
      var K = R.pick([
        ['Two towns are at the same latitude: one on the ocean, one 1,000 km inland. Which has the larger difference between summer and winter temperatures?', 'The inland town', ['The ocean town', 'They are the same, since the latitude is the same', 'It depends only on elevation']],
        ['Why does the ocean warm so slowly in summer?', 'Each kilogram of water needs much more energy per degree, and mixing spreads the heat through a deep layer', ['Water reflects most sunlight', 'Water is wet, so it cannot heat up', 'Sunlight cannot enter water']],
        ['On a sunny afternoon at the beach, which is warmer?', 'The dry sand', ['The sea', 'They are always the same', 'Whichever is darker in color only']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Water\'s specific heat (4186 J/(kg·°C)) is about five times dry sand\'s (about 830).', 'Answer: ' + K[1] + '.'], 'Think of Q = mcΔT with a large c for water.', { vk: 'concept' });
    }
    function ocean() {
      var d = R.pick([10, 20, 25, 50, 100]), Pw = R.pick([50, 100, 200]), Q = 1000 * d * CW, days = Q / Pw / 86400;
      return pr('A column of ocean 1 m² across and ' + q(d, 'm') + ' deep (density 1000 kg/m³, $c$ = 4186 J/(kg·°C)) gains a steady ' + q(Pw, 'W/m²') + ' from the Sun. About how many days does it take to warm the column by 1 °C? (1 day = 86,400 s)', num(days, 0.02), [
        'Mass: ' + nt(d) + ' m³ × 1000 kg/m³ = ' + q(1000 * d, 'kg') + '. Energy for 1 °C: ' + nt(1000 * d) + ' × 4186 × 1 = ' + q(Q, 'J') + '.',
        'Time: ' + nt(Q) + ' J ÷ ' + nt(Pw) + ' J/s = ' + q(rnd(Q / Pw, 0), 's') + ' ≈ ' + q(rnd(days, 1), 'days') + '.',
        'A few centimeters of soil would warm by 1 °C in minutes.'
      ], 'Find the energy needed, then divide by the energy per second.', { unit: 'days', vk: 'ocean', vd: { d: d, Pw: Pw } });
    }
    return lv(R, ctx, [dT, Qcalc, concept], [dT, compare, mass, concept], [ocean, compare, mass]);
  });

  G('weather.latent-heat', function (R, ctx) {
    var LV = 2.5e6, LF = 3.34e5, CPA = 1005;
    function evap() {
      var g = R.int(1, 50) * 10, cond = R.coin(), Q = g / 1000 * LV;
      return pr((cond ? 'How much energy is released when ' + q(g, 'g') + ' of water vapor condenses into cloud droplets?' : 'How much energy does it take to evaporate ' + q(g, 'g') + ' of water?') + ' Use $L_v = 2.5 \\times 10^6$ J/kg.', num(Q, 0.01), [
        'Mass in kilograms: ' + q(g, 'g') + ' = ' + q(g / 1000, 'kg') + '.',
        '$Q = mL_v$ = ' + nt(g / 1000) + ' × 2,500,000 = ' + q(Q, 'J') + (cond ? ', released into the surrounding air.' : ', taken from the surroundings.')
      ], 'Convert grams to kilograms, then use Q = mL.', { unit: 'J', vk: 'evap', vd: { g: g } });
    }
    function direction() {
      var K = R.pick([
        ['When water vapor condenses into a cloud, the surrounding air', 'is warmed by the latent heat released', ['is cooled, because condensing takes in heat', 'does not change temperature', 'loses water vapor and cools']],
        ['When sweat evaporates from your skin, your skin', 'is cooled, because evaporating water takes in energy', ['is warmed by the energy released', 'does not change temperature', 'gains water vapor']],
        ['A lake loses water by evaporation on a sunny day. The evaporation', 'cools the lake by taking energy with the vapor', ['warms the lake', 'has no effect on the lake\'s temperature', 'releases latent heat into the lake']],
        ['Snowflakes melting as they fall through the air', 'take in heat and cool the air around them', ['release heat and warm the air', 'have no effect on the air', 'turn straight into vapor']]
      ]);
      return pr(K[0] + '…', mc(K[1], K[2]), ['Evaporating and melting take in energy (cooling the surroundings); condensing and freezing release it (warming the surroundings).', 'Answer: ' + K[1] + '.'], 'Does the change need energy, or give energy back?', { vk: 'concept' });
    }
    function massFrom() {
      var Q = R.int(1, 40) * 1.25e6, m = Q / LV;
      return pr('A sunny lake surface uses ' + sci(Q, 3) + ' J for evaporation. How much water evaporates? Use $L_v = 2.5 \\times 10^6$ J/kg.', num(m, 0.01), [
        '$m = Q/L_v$ = ' + sci(Q, 3) + ' ÷ (2.5 × 10⁶).',
        '= ' + q(fix(m), 'kg') + '.'
      ], 'Rearrange Q = mL for m.', { unit: 'kg', vk: 'mass', vd: { _Q: Q } });
    }
    function airWarm() {
      var g = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 0.6, 0.7, 0.8, 0.9, 1.2, 3.5, 7, 9]), Q = g / 1000 * LV, dT = Q / CPA;
      return pr('In a rising cloud, ' + q(g, 'g') + ' of water vapor condenses in each kilogram of air. If all the latent heat went into that kilogram of air ($c_p$ = 1005 J/(kg·°C)), by how much would it warm? Use $L_v = 2.5 \\times 10^6$ J/kg.', num(dT, 0.02), [
        'Energy released: ' + nt(g / 1000) + ' kg × 2,500,000 J/kg = ' + q(Q, 'J') + '.',
        'Warming: $\\Delta T = Q/(mc_p)$ = ' + nt(Q) + ' ÷ 1005 ≈ ' + q(rnd(dT, 1), '°C') + '. In a rising parcel this offsets part of the cooling from expansion.'
      ], 'Find the energy released, then use Q = mcΔT for the air.', { unit: '°C', vk: 'air', vd: { g: g } });
    }
    function ratio() {
      var dt = R.pick([1, 2, 5, 10, 20, 25, 50, 100, 1.2, 3, 4, 8, 12, 35, 60, 90]), r = LV / (4186 * dt);
      return pr('How many times as much energy does it take to evaporate 1 kg of water as to warm 1 kg of liquid water by ' + q(dt, '°C') + '? ($L_v = 2.5 \\times 10^6$ J/kg, $c$ = 4186 J/(kg·°C))', num(r, 0.01), [
        'Evaporating: 2,500,000 J. Warming: 4186 × ' + nt(dt) + ' = ' + q(4186 * dt, 'J') + '.',
        'Ratio: 2,500,000 ÷ ' + nt(4186 * dt) + ' ≈ ' + nt(rnd(r, 1)) + '.'
      ], 'Compute both energies for 1 kg and divide.', { vk: 'ratio', vd: { dt: dt } });
    }
    function storm() {
      var mm = R.pick([5, 10, 20, 25, 40, 50, 6, 7, 9, 12, 30, 35]), km2 = R.pick([10, 50, 100, 200, 500, 12, 30, 70, 150, 400]), Q = mm * km2 * 1e6 * LV;
      return pr('A storm drops ' + q(mm, 'mm') + ' of rain over ' + q(km2, 'km²') + '. Each millimeter of rain on a square meter is 1 kg of water. How much latent heat was released when that water condensed in the clouds? Use $L_v = 2.5 \\times 10^6$ J/kg and give your answer in joules.', num(Q, 0.01), [
        'Area: ' + nt(km2) + ' km² = ' + sci(km2 * 1e6, 3) + ' m². Water: ' + nt(mm) + ' kg/m² × ' + sci(km2 * 1e6, 3) + ' m² = ' + sci(mm * km2 * 1e6, 3) + ' kg.',
        '$Q = mL_v$ = ' + sci(mm * km2 * 1e6, 3) + ' × 2.5 × 10⁶ ≈ ' + sci(Q, 3) + ' J, released into the air inside the storm.'
      ], 'Find the mass of rain first: millimeters times square meters gives kilograms.', { unit: 'J', vk: 'storm', vd: { mm: mm, km2: km2 } });
    }
    function melt() {
      var m = R.pick([0.2, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10, 0.25, 0.3, 0.4, 0.6, 0.8, 0.9, 3.5, 6, 8, 9]), Q = m * LF;
      return pr('How much energy does it take to melt ' + q(m, 'kg') + ' of ice at 0 °C? Use $L_f = 3.34 \\times 10^5$ J/kg.', num(Q, 0.01), [
        '$Q = mL_f$ = ' + nt(m) + ' × 334,000 = ' + q(Q, 'J') + '.',
        'That is far less than the ' + q(m * LV, 'J') + ' it would take to evaporate the same water.'
      ], 'Use Q = mL with the latent heat of melting.', { unit: 'J', vk: 'melt', vd: { m: m } });
    }
    return lv(R, ctx, [evap, direction, melt], [evap, airWarm, massFrom, direction, ratio], [storm, airWarm, ratio, massFrom]);
  });

  // ---------- g03_vapor.js ----------
  // ===================== Unit 3: Water Vapor =====================
  function esat(t) { return 6.112 * MA.exp(17.67 * t / (t + 243.5)); } // hPa over water (Magnus, Bolton constants)
  function est(t) { return rnd(esat(t), 1); } // the rounded table value shown to learners
  function esLine(ts) { return ts.map(function (t) { return q(t, '°C') + ': ' + q(est(t), 'hPa'); }).join('; '); }
  function esNote(ts) { return ' (Saturation vapor pressure: ' + esLine(ts) + '.)'; }
  var T5 = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35];
  G('weather.saturation', function (R, ctx) {
    function room() {
      var t = R.pick(T5.slice(2)), es = est(t), e = rnd(es * R.int(30, 85) / 100, 1);
      return pr('Air at ' + q(t, '°C') + ' has a vapor pressure of ' + q(e, 'hPa') + '. How many more hectopascals of vapor pressure can it gain before it is saturated?' + esNote([t]), num(fix(es - e), 0.01, 0.051), [
        'Saturation at ' + q(t, '°C') + ': ' + q(es, 'hPa') + '.',
        'Room left: ' + nt(es) + ' − ' + nt(e) + ' = ' + q(fix(es - e), 'hPa') + '.'
      ], 'Compare with the saturation vapor pressure at this temperature.', { unit: 'hPa', vk: 'room', vd: { t: t, e: e } });
    }
    function state() {
      var t = R.pick(T5.slice(1)), es = est(t), k = R.int(0, 2), e = k === 0 ? es : k === 1 ? rnd(es * R.int(40, 85) / 100, 1) : rnd(es * R.int(110, 140) / 100, 1);
      var ch = ['Saturated: evaporation and condensation balance', 'Not saturated: more water can evaporate into it', 'Past saturation: vapor condenses until it is back to saturation'];
      return pr('Air at ' + q(t, '°C') + ' has a vapor pressure of ' + q(e, 'hPa') + '. Which describes it?' + esNote([t]), mcK(ch[k], ch.filter(function (x, i) { return i !== k; })), [
        'Saturation at ' + q(t, '°C') + ' is ' + q(es, 'hPa') + '.',
        q(e, 'hPa') + (k === 0 ? ' equals it: saturated.' : k === 1 ? ' is less: not saturated.' : ' is more: the extra vapor condenses into droplets (dew, fog or cloud).')
      ], 'Compare the vapor pressure with the saturation value.', { vk: 'state', vd: { t: t, e: e } });
    }
    function condense() {
      var t1 = R.pick([15, 20, 25, 30, 35]), t2 = t1 - R.pick([5, 10, 15]), e1 = est(t1), e2 = est(t2);
      return pr('Saturated air at ' + q(t1, '°C') + ' (vapor pressure ' + q(e1, 'hPa') + ') cools to ' + q(t2, '°C') + '. By how many hectopascals must its vapor pressure drop, as vapor condenses into dew or fog?' + esNote([t2]), num(fix(e1 - e2), 0.01, 0.051), [
        'At ' + q(t2, '°C') + ', saturation is only ' + q(e2, 'hPa') + '.',
        'The vapor above that must condense: ' + nt(e1) + ' − ' + nt(e2) + ' = ' + q(fix(e1 - e2), 'hPa') + '.'
      ], 'What is the most vapor pressure the cooler air can keep?', { unit: 'hPa', vk: 'cond', vd: { t1: t1, t2: t2, e1: e1 } });
    }
    function doubling() {
      var t = R.pick([-10, -5, 0, 5, 10, 15, 20, 25]), a = est(t), b = est(t + 10);
      return pr('Using the table, how many times as large is the saturation vapor pressure at ' + q(t + 10, '°C') + ' as at ' + q(t, '°C') + '? (Round to two decimal places.)' + esNote([t, t + 10]), num(b / a, 0.01), [
        nt(b) + ' ÷ ' + nt(a) + ' ≈ ' + nt(rnd(b / a, 2)) + '.',
        'About double for 10 °C, a little less at higher temperatures.'
      ], 'Divide the two saturation values.', { vk: 'dbl', vd: { t: t, a: a, b: b } });
    }
    function tfq() {
      var K = R.pick([
        ['Air is like a sponge: the nitrogen and oxygen hold the water vapor.', false, 'Saturation is a balance between evaporation and condensation that depends on temperature; it happens even with no air.'],
        ['In a sealed jar with all the air pumped out, water still evaporates until the vapor reaches a saturation pressure.', true, 'Saturation needs only water and vapor at a temperature.'],
        ['The saturation vapor pressure is higher at 30 °C than at 10 °C.', true, 'It is about 42.5 hPa at 30 °C and 12.3 hPa at 10 °C.'],
        ['Saturation means the air has as much water vapor as any air can ever have.', false, 'Saturation depends on temperature: warmer air reaches saturation at a much higher vapor pressure.'],
        ['When saturated air cools, some of its vapor condenses.', true, 'Cooling lowers the saturation vapor pressure, so the extra vapor condenses.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Saturation is a balance set by temperature.', { vk: 'concept' });
    }
    function magnus() {
      var t = R.int(-15, 40); if (t % 5 === 0) t += 2;
      var es = esat(t);
      return pr('Use the Magnus formula $e_s = 6.112\\,\\exp\\!\\left(\\dfrac{17.67\\,T}{T + 243.5}\\right)$ hPa, with $T$ in °C, to find the saturation vapor pressure at ' + q(t, '°C') + '.', num(es, 0.01), [
        'Exponent: 17.67 × ' + nt(t) + ' ÷ (' + nt(t) + ' + 243.5) ≈ ' + nt(rnd(17.67 * t / (t + 243.5), 4)) + '.',
        '$e_s$ ≈ 6.112 × e^' + nt(rnd(17.67 * t / (t + 243.5), 4)) + ' ≈ ' + q(rnd(es, 2), 'hPa') + '.'
      ], 'Work out the exponent first, then use the e^x key.', { unit: 'hPa', vk: 'magnus', vd: { t: t } });
    }
    function perDeg() {
      var t = R.pick([-10, 0, 10, 15, 20, 30]), f = 100 * (esat(t + 1) / esat(t) - 1);
      return pr('Using $e_s = 6.112\\,\\exp\\!\\left(\\dfrac{17.67\\,T}{T + 243.5}\\right)$ hPa, by what percent does the saturation vapor pressure increase when the temperature rises from ' + q(t, '°C') + ' to ' + q(t + 1, '°C') + '? (Round to one decimal place.)', pct(f, 0.06), [
        '$e_s$(' + nt(t) + ') ≈ ' + q(rnd(esat(t), 3), 'hPa') + ' and $e_s$(' + nt(t + 1) + ') ≈ ' + q(rnd(esat(t + 1), 3), 'hPa') + '.',
        'Increase: ' + nt(rnd(esat(t + 1), 3)) + ' ÷ ' + nt(rnd(esat(t), 3)) + ' − 1 ≈ ' + nt(rnd(f, 1)) + '%. About 6 to 7% per degree is a number climate scientists use often.'
      ], 'Compute both values and compare.', { vk: 'perdeg', vd: { t: t } });
    }
    return lv(R, ctx, [room, state, tfq], [condense, doubling, state, tfq], [magnus, perDeg, condense]);
  });

  G('weather.relative-humidity', function (R, ctx) {
    function rh() {
      var t = R.pick(T5.slice(2)), es = est(t), e = rnd(es * R.int(20, 95) / 100, 1), v = 100 * e / es;
      return pr('Air at ' + q(t, '°C') + ' has a vapor pressure of ' + q(e, 'hPa') + '. What is its relative humidity?' + esNote([t]), pct(v, 0.6), [
        'RH = $e / e_s$ = ' + nt(e) + ' ÷ ' + nt(es) + ' ≈ ' + nt(rnd(e / es, 3)) + '.',
        '≈ ' + nt(rnd(v, 0)) + '%.'
      ], 'Divide the vapor pressure by the saturation value at this temperature.', { vk: 'rh', vd: { t: t, e: e } });
    }
    function eFrom() {
      var t = R.pick(T5.slice(1)), es = est(t), r = R.int(2, 19) * 5, e = r / 100 * es;
      return pr('Air at ' + q(t, '°C') + ' has a relative humidity of ' + r + '%. What is its vapor pressure?' + esNote([t]), num(e, 0.01, 0.051), [
        '$e$ = RH × $e_s$ = ' + nt(r / 100) + ' × ' + nt(es) + '.',
        '≈ ' + q(rnd(e, 2), 'hPa') + '.'
      ], 'Take that percent of the saturation vapor pressure.', { unit: 'hPa', vk: 'efrom', vd: { t: t, r: r } });
    }
    function warm() {
      var t1 = R.pick([0, 5, 10, 15, 20]), t2 = t1 + R.pick([5, 10, 15]), r1 = R.pick([100, 90, 80, 70, 60]), e = r1 / 100 * est(t1), r2 = 100 * e / est(t2);
      return pr('Air at ' + q(t1, '°C') + ' with ' + r1 + '% relative humidity warms to ' + q(t2, '°C') + ' without gaining or losing water vapor. What is its new relative humidity?' + esNote([t1, t2]), pct(r2, 0.6), [
        'Vapor pressure (unchanged): ' + nt(r1 / 100) + ' × ' + nt(est(t1)) + ' ≈ ' + q(rnd(e, 2), 'hPa') + '.',
        'New RH: ' + nt(rnd(e, 2)) + ' ÷ ' + nt(est(t2)) + ' ≈ ' + nt(rnd(r2, 0)) + '%. Same vapor, lower RH, because the saturation value grew.'
      ], 'Find the vapor pressure first; it doesn\'t change.', { vk: 'warm', vd: { t1: t1, t2: t2, r1: r1 } });
    }
    function compare() {
      for (var k = 0; k < 30; k++) {
        var tA = R.pick(T5.slice(2)), tB = R.pick(T5.slice(2)), rA = R.int(2, 20) * 5, rB = R.int(2, 20) * 5, eA = rA / 100 * est(tA), eB = rB / 100 * est(tB);
        if (tA !== tB && MA.abs(eA - eB) / MA.max(eA, eB) > 0.12 && ((rA > rB) !== (eA > eB) || R.chance(0.3))) break;
      }
      var right = eA > eB ? 'Air A' : 'Air B';
      return pr('Air A is at ' + q(tA, '°C') + ' with ' + rA + '% relative humidity. Air B is at ' + q(tB, '°C') + ' with ' + rB + '% relative humidity. Which holds more water vapor?' + esNote([tA, tB].sort(function (a, b) { return a - b; })), mcK(right, [right === 'Air A' ? 'Air B' : 'Air A', 'They hold the same amount', 'The one with the higher relative humidity, whatever the temperature']), [
        'Air A: $e$ = ' + nt(rA / 100) + ' × ' + nt(est(tA)) + ' ≈ ' + q(rnd(eA, 1), 'hPa') + '. Air B: $e$ = ' + nt(rB / 100) + ' × ' + nt(est(tB)) + ' ≈ ' + q(rnd(eB, 1), 'hPa') + '.',
        right + ' has more vapor.' + ((rA > rB) !== (eA > eB) ? ' Notice that it has the lower relative humidity.' : '')
      ], 'Turn each RH into a vapor pressure before comparing.', { vk: 'cmp', vd: { tA: tA, tB: tB, rA: rA, rB: rB } });
    }
    function indoor() {
      var to = R.pick([-10, -5, 0, 5]), ro = R.pick([60, 70, 80, 90, 100]), ti = 20, e = ro / 100 * est(to), r = 100 * e / est(ti);
      return pr('Winter air outdoors is ' + q(to, '°C') + ' with ' + ro + '% relative humidity. It leaks inside and is heated to ' + q(ti, '°C') + ' without adding vapor. What is its relative humidity indoors?' + esNote([to, ti]), pct(r, 0.6), [
        'Vapor pressure: ' + nt(ro / 100) + ' × ' + nt(est(to)) + ' ≈ ' + q(rnd(e, 2), 'hPa') + '.',
        'Indoors: ' + nt(rnd(e, 2)) + ' ÷ ' + nt(est(ti)) + ' ≈ ' + nt(rnd(r, 0)) + '%. That is why heated rooms feel so dry in winter.'
      ], 'The vapor stays the same; the saturation value changes.', { vk: 'indoor', vd: { to: to, ro: ro, ti: ti } });
    }
    function cooled() {
      var t1 = R.pick([20, 25, 30, 35]), r1 = R.pick([30, 40, 50]), e = r1 / 100 * est(t1), t2 = t1 - R.pick([5, 10]), r2 = 100 * e / est(t2);
      if (r2 > 99) { t2 = t1 - 5; r2 = 100 * e / est(t2); }
      return pr('In the evening, air at ' + q(t1, '°C') + ' and ' + r1 + '% relative humidity cools to ' + q(t2, '°C') + ' with no change in its vapor. What is its relative humidity now?' + esNote([t2, t1]), pct(r2, 0.6), [
        'Vapor pressure: ' + nt(r1 / 100) + ' × ' + nt(est(t1)) + ' ≈ ' + q(rnd(e, 2), 'hPa') + '.',
        'At ' + q(t2, '°C') + ': ' + nt(rnd(e, 2)) + ' ÷ ' + nt(est(t2)) + ' ≈ ' + nt(rnd(r2, 0)) + '%. Cooling raises RH; that is why it peaks near dawn.'
      ], 'Keep the vapor pressure; change the saturation value.', { vk: 'cooled', vd: { t1: t1, r1: r1, t2: t2 } });
    }
    function tfq() {
      var K = R.pick([
        ['Air at 100% relative humidity always holds more water vapor than air at 50%.', false, 'Saturated cold air can hold less vapor than half-saturated warm air.'],
        ['If air warms and gains no vapor, its relative humidity falls.', true, 'The saturation vapor pressure grows, so the ratio shrinks.'],
        ['Relative humidity is usually highest around dawn.', true, 'Dawn is usually the coolest time of day, when the saturation value is lowest.'],
        ['Relative humidity tells you the amount of water vapor directly.', false, 'It is a ratio to the saturation amount, which depends on temperature.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'RH is a ratio, and its bottom depends on temperature.', { vk: 'concept' });
    }
    return lv(R, ctx, [rh, eFrom, tfq], [warm, compare, rh, tfq], [indoor, cooled, compare]);
  });

  G('weather.dew-point', function (R, ctx) {
    function fromE() {
      var td = R.pick(T5), e = est(td), others = [td - 5, td + 5, td + 10].filter(function (x) { return x >= -10 && x <= 40; });
      var t = td + R.pick([0, 5, 10, 15]);
      return pr('Air at ' + q(t, '°C') + ' has a vapor pressure of ' + q(e, 'hPa') + '. What is its dew point?' + esNote([td].concat(others).sort(function (a, b) { return a - b; })), numT(td, 0.3), [
        'The dew point is the temperature at which this vapor would saturate the air: find ' + q(e, 'hPa') + ' in the table.',
        'Saturation is ' + q(e, 'hPa') + ' at ' + q(td, '°C') + ', so $T_d$ = ' + q(td, '°C') + '.' + (t === td ? ' The air is already saturated.' : '')
      ], 'Read the table backward: which temperature has this saturation value?', { unit: '°C', vk: 'frome', vd: { t: t, e: e } });
    }
    function fromRH() {
      var td = R.pick([0, 5, 10, 15, 20, 25]), t = td + R.pick([5, 10, 15]), r = MA.round(100 * est(td) / est(t)), e = r / 100 * est(t);
      return pr('Air at ' + q(t, '°C') + ' has a relative humidity of ' + r + '%. Use the table to find its dew point.' + esNote([td - 5, td, td + 5, t].filter(function (x, i, a) { return a.indexOf(x) === i && x >= -10; }).sort(function (a, b) { return a - b; })), numT(td, 0.6), [
        'Vapor pressure: $e$ = ' + nt(r / 100) + ' × ' + nt(est(t)) + ' ≈ ' + q(rnd(e, 1), 'hPa') + '.',
        'That is the saturation value at about ' + q(td, '°C') + ', so $T_d$ ≈ ' + q(td, '°C') + ' (a spread of ' + q(t - td, '°C') + ').'
      ], 'Turn the RH into a vapor pressure, then read the table backward.', { unit: '°C', vk: 'fromrh', vd: { t: t, r: r } });
    }
    function fog() {
      var td = R.int(-6, 18), t = td + R.int(4, 12), low = td + R.pick([-3, -2, -1, 2, 3, 5]);
      var reach = low <= td, frost = td < 0;
      var right = reach ? (frost ? 'Frost is likely: the air cools to its dew point, which is below freezing' : 'Dew and possibly fog: the air cools to its dew point') : 'No dew or fog: the air stays warmer than its dew point';
      var all = ['Dew and possibly fog: the air cools to its dew point', 'Frost is likely: the air cools to its dew point, which is below freezing', 'No dew or fog: the air stays warmer than its dew point', 'Rain: the dew point is falling'];
      return pr('At sunset it is ' + q(t, '°C') + ' with a dew point of ' + q(td, '°C') + '. The night will be clear and calm, with a forecast low of ' + q(low, '°C') + '. What should you expect by morning?', mcK(right, all.filter(function (x) { return x !== right; })), [
        'Compare the low with the dew point: ' + q(low, '°C') + (reach ? ' is at or below ' : ' is above ') + q(td, '°C') + '.',
        reach ? (frost ? 'The air reaches saturation below 0 °C, so vapor deposits as ice: frost.' : 'The air reaches saturation, so dew forms and fog may form.') : 'The air never reaches saturation, so nothing condenses.'
      ], 'Will the air cool all the way to its dew point?', { vk: 'fog', vd: { t: t, td: td, low: low } });
    }
    function comfort() {
      var f = R.pick([38, 42, 45, 48, 50, 52, 53, 57, 58, 60, 61, 62, 63, 67, 68, 70, 72, 74, 76]);
      var cats = ['Dry and comfortable', 'Sticky', 'Oppressive'], right = f < 55 ? cats[0] : f < 65 ? cats[1] : cats[2];
      return pr('The National Weather Service describes dew points below 55 °F as dry and comfortable, 55 to 65 °F as sticky, and above 65 °F as oppressive. How would a dew point of ' + q(f, '°F') + ' feel?', mcK(right, cats.filter(function (x) { return x !== right; })), [
        q(f, '°F') + ' is ' + (f < 55 ? 'below 55 °F' : f < 65 ? 'between 55 and 65 °F' : 'above 65 °F') + '.',
        'So it feels ' + right.toLowerCase() + '. The dew point measures the vapor itself, which is what slows the drying of sweat.'
      ], 'Place the dew point on the scale.', { vk: 'comfort', vd: { f: f } });
    }
    function muggy() {
      var A = [R.pick([25, 30, 35]), R.pick([40, 50, 60, 70])], B = [R.pick([5, 10, 15]), 100], eA = A[1] / 100 * est(A[0]), eB = est(B[0]);
      if (MA.abs(eA - eB) / MA.max(eA, eB) < 0.15) { A = [30, 60]; eA = 0.6 * est(30); }
      var right = eA > eB ? 'Town A' : 'Town B';
      return pr('Town A: ' + q(A[0], '°C') + ' with ' + A[1] + '% relative humidity. Town B: ' + q(B[0], '°C') + ' with 100% relative humidity. Which air has the higher dew point (more water vapor)?' + esNote([B[0], A[0]]), mcK(right, [right === 'Town A' ? 'Town B' : 'Town A', 'Neither: their dew points are equal', 'Town B, because 100% is the most humid air possible']), [
        'Town B is saturated, so its dew point equals its temperature, ' + q(B[0], '°C') + ' (' + q(eB, 'hPa') + ').',
        'Town A: $e$ = ' + nt(A[1] / 100) + ' × ' + nt(est(A[0])) + ' ≈ ' + q(rnd(eA, 1), 'hPa') + (eA > eB ? ', more than Town B, so its dew point is higher.' : ', less than Town B, so its dew point is lower.')
      ], 'Compare vapor pressures, not relative humidities.', { vk: 'muggy', vd: { tA: A[0], rA: A[1], tB: B[0] } });
    }
    function rule() {
      var t = R.int(5, 35), r = R.int(12, 19) * 5, td = t - (100 - r) / 5;
      return pr('For relative humidity above about 60%, a handy rule is $T_d \\approx T - \\dfrac{100 - \\text{RH}}{5}$ (with $T$ in °C and RH in percent). Estimate the dew point of air at ' + q(t, '°C') + ' and ' + r + '% relative humidity.', numT(td, 0.051), [
        '(100 − ' + r + ') ÷ 5 = ' + nt((100 - r) / 5) + '.',
        '$T_d$ ≈ ' + nt(t) + ' − ' + nt((100 - r) / 5) + ' = ' + q(td, '°C') + '.'
      ], 'Every 5 percentage points below 100% is about 1 °C of spread.', { unit: '°C', vk: 'rule', vd: { t: t, r: r } });
    }
    function tfq() {
      var K = R.pick([
        ['The dew point can be higher than the air temperature for hours at a time.', false, 'Any vapor beyond saturation condenses, so the dew point stays at or below the temperature.'],
        ['A higher dew point means more water vapor in the air.', true, 'The dew point is the vapor pressure written as a temperature.'],
        ['When the afternoon warms up and no vapor is added, the dew point stays about the same.', true, 'The dew point measures the vapor, which hasn\'t changed; the relative humidity falls instead.'],
        ['Fog is a cloud whose base is at the ground.', true, 'It forms when air near the ground cools to its dew point.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'The dew point measures the vapor itself.', { vk: 'concept' });
    }
    return lv(R, ctx, [fromE, comfort, tfq], [fromRH, fog, muggy, tfq], [fromRH, rule, muggy, fog]);
  });

  // ---------- g04_rising.js ----------
  // ===================== Unit 4: Rising Air and Stability =====================
  function rateNote(g) { return g === 10 ? 'Use 10 °C per km (the dry rate, rounded).' : 'Use 9.8 °C per km.'; }
  G('weather.adiabatic-cooling', function (R, ctx) {
    function lift() {
      var g = R.pick([10, 9.8]), t0 = R.int(-5, 35), dz = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), t = t0 - g * dz;
      return pr('A parcel of unsaturated air at ' + q(t0, '°C') + ' rises ' + q(dz, 'km') + '. What is its temperature now? ' + rateNote(g), numT(fix(t), 0.051), [
        'Cooling: ' + nt(dz) + ' km × ' + nt(g) + ' °C/km = ' + q(fix(g * dz), '°C') + '.',
        nt(t0) + ' − ' + nt(fix(g * dz)) + ' = ' + q(fix(t), '°C') + '.'
      ], 'Rising unsaturated air cools at the dry rate.', { unit: '°C', vk: 'lift', vd: { t0: t0, dz: dz, g: g } });
    }
    function sink() {
      var g = R.pick([10, 9.8]), z = R.pick([1, 1.5, 2, 2.5, 3, 4, 5]), tz = R.int(-25, 10), t = tz + g * z;
      return pr('Air at ' + q(z, 'km') + ' up has a temperature of ' + q(tz, '°C') + '. It sinks to the ground (0 km) without any condensation or evaporation. What is its temperature when it arrives? ' + rateNote(g), numT(fix(t), 0.051), [
        'Sinking air is squeezed and warms at the dry rate: ' + nt(z) + ' × ' + nt(g) + ' = ' + q(fix(g * z), '°C') + '.',
        nt(tz) + ' + ' + nt(fix(g * z)) + ' = ' + q(fix(t), '°C') + '.'
      ], 'Sinking air warms at the same rate rising air cools.', { unit: '°C', vk: 'sink', vd: { z: z, tz: tz, g: g } });
    }
    function howHigh() {
      var t0 = R.int(10, 35), drop = R.pick([5, 10, 15, 20, 25, 30]), dz = drop / 10;
      return pr('How high must unsaturated air starting at ' + q(t0, '°C') + ' rise to cool to ' + q(t0 - drop, '°C') + '? Use 10 °C per km.', num(dz, 0.01), [
        'It must cool ' + q(drop, '°C') + '.',
        nt(drop) + ' ÷ 10 °C/km = ' + q(dz, 'km') + '.'
      ], 'Divide the cooling needed by the cooling per kilometer.', { unit: 'km', vk: 'high', vd: { t0: t0, t1: t0 - drop } });
    }
    function why() {
      var K = R.pick([
        ['Why does a rising parcel of air cool?', 'It expands as the pressure around it drops, and the energy to push the surrounding air aside comes from its own molecules', ['It gets closer to cold outer space', 'It moves away from the warm ground, which was heating it', 'It mixes with cold air that falls from above']],
        ['Air sinks from 3 km into a cold valley without condensation or evaporation. What happens to its temperature?', 'It warms, because it is squeezed as it sinks', ['It cools, because the valley is cold', 'It stays the same', 'It cools, because it moves toward the ground']],
        ['In the Science Lab\'s first law, ΔU = Q − W (W done by the gas). For a rising parcel, which is true?', 'Q ≈ 0 and W > 0, so ΔU < 0 and the parcel cools', ['Q > 0 and W = 0, so the parcel warms', 'Q < 0 because space takes its heat, so it cools', 'Q = 0 and W = 0, so nothing changes']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Expanding air does work on its surroundings; with no heat flowing in, its internal energy and temperature drop.', 'Answer: ' + K[1] + '.'], 'Think about expansion and work, not about distance from the ground.', { vk: 'concept' });
    }
    function energy() {
      var dz = R.pick([0.5, 1, 1.5, 2, 2.5, 3]), dT = 9.8 * dz * 1000 / 1005;
      return pr('For a rising parcel, the drop in thermal energy per kilogram, $c_p\\,\\Delta T$, equals the gain in height energy, $g\\,\\Delta z$. With $g$ = 9.8 m/s² and $c_p$ = 1005 J/(kg·°C), how much does a dry parcel cool when it rises ' + q(dz, 'km') + '?', num(dT, 0.01), [
        '$g\\,\\Delta z$ = 9.8 × ' + nt(dz * 1000) + ' = ' + q(fix(9.8 * dz * 1000), 'J/kg') + '.',
        '$\\Delta T$ = ' + nt(fix(9.8 * dz * 1000)) + ' ÷ 1005 ≈ ' + q(rnd(dT, 2), '°C') + ', which is 9.75 °C per km: the dry adiabatic rate.'
      ], 'Set c_p ΔT equal to g Δz, with Δz in meters.', { unit: '°C', vk: 'energy', vd: { dz: dz } });
    }
    function cabin() {
      var z = R.pick([9, 10, 11, 12]), tz = R.pick([-56, -50, -45, -40]), t = tz + 9.8 * z;
      return pr('Outside an airliner at ' + q(z, 'km') + ' the air is ' + q(tz, '°C') + '. If that air were brought down to sea level with no heat added or removed, how warm would it be? Use 9.8 °C per km.', numT(fix(t), 0.06), [
        'Warming by compression: ' + nt(z) + ' × 9.8 = ' + q(fix(9.8 * z), '°C') + '.',
        nt(tz) + ' + ' + nt(fix(9.8 * z)) + ' = ' + q(fix(t), '°C') + '. Squeezed air gets hot, which is why air compressed for a cabin must be cooled.'
      ], 'Compressing air warms it at the dry rate for each kilometer of descent.', { unit: '°C', vk: 'cabin', vd: { z: z, tz: tz } });
    }
    return lv(R, ctx, [lift, sink, why], [lift, sink, howHigh, why], [energy, cabin, howHigh, sink]);
  });

  G('weather.lifting', function (R, ctx) {
    var SC = [
      ['On a hot, calm afternoon, bubbles of warm air rise from sunny fields and puffy clouds pop up.', 'Convection'],
      ['Moist wind from the ocean blows against a mountain range, and clouds cover the windward slopes.', 'Orographic lifting (forced over mountains)'],
      ['A wedge of cold, dense air pushes into a region of warm, humid air, and a line of storms forms along its edge.', 'Frontal lifting'],
      ['Sea breezes from both coasts of a peninsula flow inland and meet in the middle, and storms grow where they meet.', 'Convergence'],
      ['Winds near the ground spiral inward toward the center of a low-pressure system, and the air there rises.', 'Convergence'],
      ['Warm air slides up a gentle slope over a retreating mass of cold air, and a wide sheet of cloud spreads ahead.', 'Frontal lifting'],
      ['A dark parking lot heats in the morning sun and a thermal rises above it, topped by a small cumulus cloud.', 'Convection'],
      ['Air flowing east across the plains reaches the Rocky Mountains and is pushed upward.', 'Orographic lifting (forced over mountains)']
    ];
    var KINDS = ['Convection', 'Orographic lifting (forced over mountains)', 'Frontal lifting', 'Convergence'];
    function classify() {
      var s = R.pick(SC);
      return pr('What lifts the air here? ' + s[0], mcK(s[1], KINDS.filter(function (k) { return k !== s[1]; })), [
        'Look for the reason the air goes up: heated ground, a slope, a wedge of cold air, or winds flowing together.',
        'Here it is ' + s[1].toLowerCase() + '.'
      ], 'Ground heating, mountains, fronts or winds meeting?', { vk: 'concept' });
    }
    function ridge() {
      var t0 = R.int(5, 30), h = R.pick([0.5, 1, 1.2, 1.5, 2, 2.5, 3, 0.6, 0.7, 0.8, 0.9]), t = t0 - 10 * h;
      return pr('Wind pushes unsaturated air at ' + q(t0, '°C') + ' up a mountain ' + q(h, 'km') + ' high. If no cloud forms, what is its temperature at the top? Use 10 °C per km.', numT(fix(t), 0.051), [
        'Cooling: ' + nt(h) + ' × 10 = ' + q(fix(10 * h), '°C') + '.',
        nt(t0) + ' − ' + nt(fix(10 * h)) + ' = ' + q(fix(t), '°C') + '.'
      ], 'Forced lifting cools the air at the dry rate.', { unit: '°C', vk: 'ridge', vd: { t0: t0, h: h } });
    }
    function overAndBack() {
      var t0 = R.int(5, 30), h = R.pick([0.5, 1, 1.5, 2, 0.6, 0.7, 0.9, 1.2]);
      return pr('Unsaturated air at ' + q(t0, '°C') + ' crosses a ridge ' + q(h, 'km') + ' high and comes back down to its starting height on the other side. No cloud forms. What is its temperature at the end? Use 10 °C per km both ways.', numT(t0, 0.051), [
        'Going up it cools ' + q(10 * h, '°C') + ', to ' + q(fix(t0 - 10 * h), '°C') + '.',
        'Coming down it warms by the same ' + q(10 * h, '°C') + ', back to ' + q(t0, '°C') + '. With no condensation, the trip is reversible.'
      ], 'Rising and sinking dry air change temperature at the same rate.', { unit: '°C', vk: 'back', vd: { t0: t0, h: h } });
    }
    function tfq() {
      var K = R.pick([
        ['Most clouds form where air is lifted and cools to its dew point.', true, 'Lifting by convection, mountains, fronts or convergence makes almost every cloud.'],
        ['Clouds form mainly where water evaporates straight up into them from below.', false, 'Vapor is everywhere; clouds form where air rises and cools to its dew point.'],
        ['Where winds near the ground flow together, the air must rise.', true, 'Air piling up near the ground has nowhere to go but up.'],
        ['A cumulus cloud\'s flat base marks the height where rising air reaches its dew point.', true, 'Bubbles from the same ground air saturate at the same height.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Clouds come from rising, cooling air.', { vk: 'concept' });
    }
    function where() {
      var K = R.pick([
        ['A steady west wind blows moist air from the ocean toward a north–south mountain range. Where are clouds and rain most likely?', 'On the west (windward) slopes', ['On the east (lee) slopes', 'Only over the ocean', 'Evenly on both sides']],
        ['Near the ground, where do winds flow together and force air upward?', 'Toward the center of a low-pressure system', ['Out from the center of a high-pressure system', 'Over a calm lake at night', 'Directly under a clear sky']],
        ['On a sunny summer day, over which surface do convection clouds usually form first?', 'A dry, dark field that heats quickly', ['A large, cool lake', 'A snowfield', 'A shaded forest floor at dawn']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Air must be lifted to cool and form clouds.', 'Answer: ' + K[1] + '.'], 'Where is the air being pushed or floated upward?', { vk: 'concept' });
    }
    return lv(R, ctx, [classify, ridge, tfq], [classify, ridge, where, tfq], [overAndBack, where, classify, ridge]);
  });

  G('weather.cloud-base', function (R, ctx) {
    function baseM() {
      var t = R.int(12, 36), s = R.int(2, 16), td = t - s, h = 125 * s;
      return pr('At the ground the temperature is ' + q(t, '°C') + ' and the dew point is ' + q(td, '°C') + '. About how high is the base of the cumulus clouds that form in rising air? Use 125 m per °C of spread.', num(h, 0.01), [
        'Spread: ' + nt(t) + ' − ' + nt(td) + ' = ' + q(s, '°C') + '.',
        'Cloud base ≈ ' + nt(s) + ' × 125 m = ' + q(h, 'm') + '.'
      ], 'The temperature–dew point gap closes about 8 °C per km.', { unit: 'm', vk: 'basem', vd: { t: t, td: td } });
    }
    function baseFt() {
      var t = R.int(60, 95), s = R.int(4, 30), td = t - s, h = 228 * s;
      return pr('A pilot reads a temperature of ' + q(t, '°F') + ' and a dew point of ' + q(td, '°F') + '. Estimate the cloud base in feet, using 228 ft per °F of spread.', num(h, 0.01), [
        'Spread: ' + nt(t) + ' − ' + nt(td) + ' = ' + q(s, '°F') + '.',
        'Cloud base ≈ ' + nt(s) + ' × 228 = ' + q(h, 'ft') + ' (or ' + nt(s) + ' ÷ 4.4 ≈ ' + nt(rnd(s / 4.4, 1)) + ' thousand feet).'
      ], 'Multiply the spread in °F by 228 ft.', { unit: 'ft', vk: 'baseft', vd: { t: t, td: td } });
    }
    function backward() {
      var t = R.int(15, 35), h = R.pick([500, 750, 1000, 1250, 1500, 1750, 2000, 2500]), td = t - h / 125;
      return pr('Cumulus bases are at ' + q(h, 'm') + ' on an afternoon when the temperature is ' + q(t, '°C') + '. Estimate the dew point at the ground, using 125 m per °C of spread.', numT(td, 0.051), [
        'Spread: ' + nt(h) + ' ÷ 125 = ' + q(h / 125, '°C') + '.',
        '$T_d$ ≈ ' + nt(t) + ' − ' + nt(h / 125) + ' = ' + q(td, '°C') + '.'
      ], 'Turn the height into a spread first.', { unit: '°C', vk: 'back', vd: { t: t, h: h } });
    }
    function atBase() {
      var t = R.int(15, 35), s = R.pick([4, 8, 12, 16]), td = t - s, h = s / 8, tb = t - 10 * h, which = R.coin();
      return pr('Ground air is ' + q(t, '°C') + ' with a dew point of ' + q(td, '°C') + '. A parcel rises, cooling 10 °C per km while its dew point drops 2 °C per km. ' + (which ? 'What is the parcel\'s temperature when it reaches the cloud base?' : 'How high, in km, is the cloud base?'), which ? numT(tb, 0.051) : num(h, 0.01), [
        'The gap of ' + q(s, '°C') + ' closes at 10 − 2 = 8 °C per km, so the base is ' + nt(s) + ' ÷ 8 = ' + q(h, 'km') + ' up.',
        'Temperature there: ' + nt(t) + ' − 10 × ' + nt(h) + ' = ' + q(tb, '°C') + ', and the dew point: ' + nt(td) + ' − 2 × ' + nt(h) + ' = ' + q(fix(td - 2 * h), '°C') + '. They match.'
      ], 'Find how fast the gap closes.', { unit: which ? '°C' : 'km', vk: which ? 'tbase' : 'hkm', vd: { t: t, td: td } });
    }
    function trap() {
      var t = R.int(20, 32), s = R.pick([6, 8, 10, 12]), td = t - s;
      return pr(nm(R) + ' estimates the cloud base for ' + q(t, '°C') + ' and a dew point of ' + q(td, '°C') + ' by assuming the parcel cools 10 °C per km while its dew point stays at ' + q(td, '°C') + ', and gets ' + q(100 * s, 'm') + '. What is the better estimate?', mc(q(125 * s, 'm') + ': the dew point also drops about 2 °C per km, so the gap closes at about 8 °C per km', [q(100 * s, 'm') + ': the method is right', q(80 * s, 'm') + ': the gap closes at 12 °C per km', q(1000 * s, 'm') + ': each degree of spread is 1 km']), [
        'A rising parcel\'s dew point falls about 2 °C per km as its vapor spreads out.',
        'The gap closes at 10 − 2 = 8 °C per km: ' + nt(s) + ' ÷ 8 × 1000 = ' + q(125 * s, 'm') + '.'
      ], 'Does the rising parcel\'s dew point stay the same?', { vk: 'concept' });
    }
    function change() {
      var t1 = R.int(14, 20), td = R.int(8, 12), t2 = t1 + R.pick([4, 6, 8, 10]), d = 125 * (t2 - t1);
      if (td >= t1) td = t1 - 2;
      return pr('At 9 a.m. the temperature is ' + q(t1, '°C') + ' and the dew point is ' + q(td, '°C') + '. By 3 p.m. the temperature is ' + q(t2, '°C') + ' and the dew point is unchanged. By how many meters has the cumulus base risen? Use 125 m per °C of spread.', num(d, 0.01), [
        'Morning base: ' + nt(t1 - td) + ' × 125 = ' + q(125 * (t1 - td), 'm') + '. Afternoon base: ' + nt(t2 - td) + ' × 125 = ' + q(125 * (t2 - td), 'm') + '.',
        'It rose by ' + q(d, 'm') + ': cloud bases climb through a sunny day as the spread grows.'
      ], 'Find both cloud bases and subtract.', { unit: 'm', vk: 'change', vd: { t1: t1, td: td, t2: t2 } });
    }
    return lv(R, ctx, [baseM, backward, trap], [baseM, baseFt, atBase, trap], [atBase, change, baseFt, backward]);
  });

  G('weather.moist-adiabatic', function (R, ctx) {
    function inCloud() {
      var zb = R.pick([0.5, 1, 1.5, 2]), tb = R.int(5, 22), zt = zb + R.pick([1, 2, 3, 4, 5]), t = tb - 6 * (zt - zb);
      return pr('A saturated parcel at its cloud base, ' + q(zb, 'km') + ' up, has a temperature of ' + q(tb, '°C') + '. It keeps rising to ' + q(zt, 'km') + '. What is its temperature there? Use 6 °C per km.', numT(fix(t), 0.051), [
        'It rises ' + nt(zt) + ' − ' + nt(zb) + ' = ' + q(fix(zt - zb), 'km') + ' while saturated.',
        'Cooling: ' + nt(fix(zt - zb)) + ' × 6 = ' + q(fix(6 * (zt - zb)), '°C') + '; ' + nt(tb) + ' − ' + nt(fix(6 * (zt - zb))) + ' = ' + q(fix(t), '°C') + '.'
      ], 'Inside the cloud, use the moist rate.', { unit: '°C', vk: 'incloud', vd: { zb: zb, tb: tb, zt: zt } });
    }
    function full() {
      var t0 = R.int(16, 34), s = R.pick([4, 8, 12, 16]), td0 = t0 - s, zb = s / 8, zt = R.pick([3, 4, 5, 6]), tb = t0 - 10 * zb, t = tb - 6 * (zt - zb);
      return pr('Ground air at ' + q(t0, '°C') + ' with a dew point of ' + q(td0, '°C') + ' is lifted to ' + q(zt, 'km') + '. Use 10 °C per km (dry), 2 °C per km for the dew point and 6 °C per km (moist). What is its temperature at ' + q(zt, 'km') + '?', numT(fix(t), 0.051), [
        'Cloud base: ' + nt(s) + ' °C of spread ÷ 8 °C per km = ' + q(zb, 'km') + '.',
        'At the base: ' + nt(t0) + ' − 10 × ' + nt(zb) + ' = ' + q(tb, '°C') + '.',
        'Then moist: ' + nt(tb) + ' − 6 × ' + nt(fix(zt - zb)) + ' = ' + q(fix(t), '°C') + '.'
      ], 'Find the cloud base first: dry below it, moist above.', { unit: '°C', vk: 'full', vd: { t0: t0, td0: td0, zt: zt } });
    }
    function diff() {
      var dz = R.pick([1, 2, 3, 4, 5]), d = 4 * dz;
      return pr('Two parcels start at the same temperature at the same height. One is saturated and cools 6 °C per km; the other is dry and cools 10 °C per km. After both rise ' + q(dz, 'km') + ', how much warmer is the saturated one?', num(d, 0.01), [
        'Saturated: cools ' + nt(6 * dz) + ' °C. Dry: cools ' + nt(10 * dz) + ' °C.',
        'Difference: ' + q(d, '°C') + ', the latent heat released by condensing vapor.'
      ], 'Compare the total cooling of each.', { unit: '°C', vk: 'diff', vd: { dz: dz } });
    }
    function freeze() {
      var zb = R.pick([0.5, 1, 1.5]), tb = R.pick([6, 9, 12, 15, 18]), target = R.pick([0, -12]), z = zb + (tb - target) / 6;
      return pr('A cloud\'s base is ' + q(zb, 'km') + ' up, where the rising saturated air is ' + q(tb, '°C') + '. At what height does the rising air reach ' + q(target, '°C') + '? Use 6 °C per km.', num(z, 0.01), [
        'It must cool ' + nt(tb) + ' − (' + nt(target) + ') = ' + q(tb - target, '°C') + ' more, at 6 °C per km: ' + nt(tb - target) + ' ÷ 6 = ' + q(rnd((tb - target) / 6, 2), 'km') + '.',
        'Height: ' + nt(zb) + ' + ' + nt(rnd((tb - target) / 6, 2)) + ' ≈ ' + q(rnd(z, 2), 'km') + '.'
      ], 'How far above the base must it rise to cool that much?', { unit: 'km', vk: 'freeze', vd: { zb: zb, tb: tb, target: target } });
    }
    function tfq() {
      var K = R.pick([
        ['Inside a cloud, the latent heat released makes a rising parcel warm up as it rises.', false, 'It still cools, only more slowly: about 6 °C per km instead of 9.8.'],
        ['A saturated parcel cools more slowly than a dry one because condensing vapor releases heat.', true, 'The latent heat pays back part of the cooling from expansion.'],
        ['The moist rate is smaller in warm, humid air than in very cold air.', true, 'Warm saturated air condenses much more vapor per degree of cooling.'],
        ['The moist rate is the same everywhere: exactly 6 °C per km.', false, 'About 4 °C per km in warm humid air, nearly 9.8 in very cold air; 6 is an average.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Latent heat slows the cooling; it doesn\'t reverse it.', { vk: 'concept' });
    }
    return lv(R, ctx, [inCloud, diff, tfq], [full, inCloud, diff, tfq], [full, freeze, tfq]);
  });

  G('weather.rain-shadow', function (R, ctx) {
    function satStart() {
      var t0 = R.int(5, 20), H = R.pick([1, 1.5, 2, 2.5, 3, 1.2]), top = t0 - 6 * H, lee = top + 10 * H;
      return pr('Saturated air at ' + q(t0, '°C') + ' (its cloud base is at the ground) crosses a mountain ' + q(H, 'km') + ' high, raining all the way up. Coming down the other side it is dry. What is its temperature back at its starting height? Use 6 °C per km up and 10 °C per km down.', numT(fix(lee), 0.051), [
        'Up, moist: ' + nt(t0) + ' − 6 × ' + nt(H) + ' = ' + q(fix(top), '°C') + ' at the top.',
        'Down, dry: ' + nt(fix(top)) + ' + 10 × ' + nt(H) + ' = ' + q(fix(lee), '°C') + ', ' + q(fix(lee - t0), '°C') + ' warmer than at the start.'
      ], 'Moist rate up, dry rate down.', { unit: '°C', vk: 'sat', vd: { t0: t0, H: H } });
    }
    function full() {
      var t0 = R.int(14, 28), s = R.pick([4, 8, 12, 5, 7, 11]), td0 = t0 - s, zb = s / 8, H = R.pick([2, 2.5, 3, 3.5, 4]), tb = t0 - 10 * zb, top = tb - 6 * (H - zb), lee = top + 10 * H;
      return pr('Air at ' + q(t0, '°C') + ' with a dew point of ' + q(td0, '°C') + ' crosses a mountain range ' + q(H, 'km') + ' high. Use 10 °C per km (dry), 2 °C per km for the dew point and 6 °C per km (moist). What is its temperature when it returns to its starting height on the lee side?', numT(fix(lee), 0.051), [
        'Cloud base: ' + nt(s) + ' ÷ 8 = ' + q(zb, 'km') + ', at ' + nt(t0) + ' − 10 × ' + nt(zb) + ' = ' + q(tb, '°C') + '.',
        'Moist to the top: ' + nt(tb) + ' − 6 × ' + nt(fix(H - zb)) + ' = ' + q(fix(top), '°C') + '.',
        'Dry all the way down: ' + nt(fix(top)) + ' + 10 × ' + nt(H) + ' = ' + q(fix(lee), '°C') + '.'
      ], 'Three legs: dry to the cloud base, moist to the top, dry down.', { unit: '°C', vk: 'full', vd: { t0: t0, td0: td0, H: H } });
    }
    function noCloud() {
      var t0 = R.int(15, 30), s = R.pick([16, 20, 24, 17, 19, 23]), td0 = t0 - s, H = R.pick([0.5, 1, 1.5, 0.6, 0.8, 1.2]), zb = s / 8;
      return pr('Air at ' + q(t0, '°C') + ' with a dew point of ' + q(td0, '°C') + ' crosses a ridge ' + q(H, 'km') + ' high. Its cloud base would be ' + nt(s) + ' × 125 m = ' + q(125 * s, 'm') + '. What is its temperature when it comes back down to its starting height on the far side? (Use 10 °C per km.)', numT(t0, 0.051), [
        'The cloud base (' + q(zb, 'km') + ') is above the ridge (' + q(H, 'km') + '), so no cloud forms.',
        'It cools ' + nt(10 * H) + ' °C going up and warms ' + nt(10 * H) + ' °C coming down: back to ' + q(t0, '°C') + '. No rain, no rain shadow, no extra warmth.'
      ], 'Does the air ever reach its dew point?', { unit: '°C', vk: 'nocloud', vd: { t0: t0, td0: td0, H: H } });
    }
    function leeTd() {
      var t0 = R.int(14, 26), s = R.pick([4, 8]), td0 = t0 - s, zb = s / 8, H = R.pick([2, 3, 4]), top = t0 - 10 * zb - 6 * (H - zb), tdl = top + 2 * H;
      return pr('Air at ' + q(t0, '°C') + ' with a dew point of ' + q(td0, '°C') + ' crosses a ' + q(H, 'km') + ' mountain. It is saturated at the top, so its dew point there equals its temperature. Coming down, its dew point rises 2 °C per km. Use 10 °C per km (dry), 2 °C per km for the dew point on the way up, and 6 °C per km (moist). What is its dew point back at its starting height?', numT(fix(tdl), 0.051), [
        'Cloud base at ' + nt(s) + ' ÷ 8 = ' + q(zb, 'km') + ' (' + q(t0 - 10 * zb, '°C') + '); top: ' + nt(t0 - 10 * zb) + ' − 6 × ' + nt(fix(H - zb)) + ' = ' + q(fix(top), '°C') + ', so the dew point at the top is ' + q(fix(top), '°C') + '.',
        'Down ' + nt(H) + ' km: ' + nt(fix(top)) + ' + 2 × ' + nt(H) + ' = ' + q(fix(tdl), '°C') + ', far below the ' + q(td0, '°C') + ' it started with: the rain removed vapor.'
      ], 'The dew point at the top equals the temperature at the top.', { unit: '°C', vk: 'leetd', vd: { t0: t0, td0: td0, H: H } });
    }
    function side() {
      var d = R.pick([['west', 'east'], ['east', 'west'], ['north', 'south'], ['south', 'north']]);
      return pr('Moist wind blows from the ' + d[0] + ' across a long mountain range. Which side is in the rain shadow?', mcK('The ' + d[1] + ' side (the lee side)', ['The ' + d[0] + ' side (the windward side)', 'Both sides get the same rain', 'Neither: mountains don\'t change rainfall']), [
        'The wind comes from the ' + d[0] + ', so air rises, cools and rains on the ' + d[0] + ' slopes.',
        'It sinks and warms on the ' + d[1] + ' side, which is dry: the rain shadow.'
      ], 'Where does the air rise, and where does it sink?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['A chinook is warm because it blows in from a warmer region.', false, 'It warms by compression as it sinks, and keeps the latent heat released when its vapor rained out.'],
        ['Air that rains out its moisture crossing a mountain usually arrives on the lee side warmer and drier than it started.', true, 'It cooled at the moist rate up but warms at the dry rate down.'],
        ['If no cloud forms as air crosses a mountain, the air ends up at the same temperature it started with.', true, 'Dry rate both ways: the cooling and warming cancel.'],
        ['The windward side of a mountain range is usually the drier side.', false, 'The windward side gets the rain; the lee side is in the rain shadow.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Moist rate up, dry rate down.', { vk: 'concept' });
    }
    return lv(R, ctx, [satStart, side, tfq], [full, satStart, noCloud, tfq], [full, leeTd, noCloud]);
  });

  G('weather.stability', function (R, ctx) {
    function liftTest() {
      var t0 = R.int(10, 30), env = R.pick([4, 5, 7, 7.5, 8, 9, 11, 12]), sat = R.coin(), rate = sat ? 6 : 10, dz = R.pick([1, 2]);
      if ((sat && MA.abs(env - 6) < 0.6) || (!sat && MA.abs(env - 10) < 0.6)) env = sat ? 8 : 7;
      var tp = t0 - rate * dz, te = t0 - env * dz, up = tp > te;
      var right = up ? 'It is warmer than the surrounding air, so it keeps rising: unstable' : 'It is colder than the surrounding air, so it sinks back: stable';
      return pr('The surrounding air is ' + q(t0, '°C') + ' at the ground and cools ' + q(env, '°C') + ' per km. A ' + (sat ? 'saturated parcel (cooling 6 °C per km)' : 'dry parcel (cooling 10 °C per km)') + ' starts at ' + q(t0, '°C') + ' and is lifted ' + q(dz, 'km') + '. What happens?', mcK(right, [up ? 'It is colder than the surrounding air, so it sinks back: stable' : 'It is warmer than the surrounding air, so it keeps rising: unstable', 'It is the same temperature as the surrounding air, so it stays put', 'It always rises, because it started at the ground']), [
        'Parcel: ' + nt(t0) + ' − ' + nt(rate) + ' × ' + nt(dz) + ' = ' + q(fix(tp), '°C') + '. Surroundings: ' + nt(t0) + ' − ' + nt(env) + ' × ' + nt(dz) + ' = ' + q(fix(te), '°C') + '.',
        up ? 'The parcel is warmer, so it is less dense and keeps rising: unstable.' : 'The parcel is colder, so it is denser and sinks back: stable.'
      ], 'Compare the parcel with its surroundings at the same height.', { vk: 'lifttest', vd: { t0: t0, env: env, dz: dz } });
    }
    var CL = ['Absolutely unstable', 'Conditionally unstable', 'Absolutely stable', 'An inversion (very stable)'];
    function classify() {
      var env = R.pick([12, 11, 10.5, 8.5, 8, 7.5, 7, 6.5, 5, 4, 3, 2, -2, -4]), k = env < 0 ? 3 : env > 9.8 ? 0 : env > 6 ? 1 : 2;
      return pr('Take the dry rate as 9.8 °C per km and the moist rate as 6 °C per km. How would you describe a layer of air that ' + (env < 0 ? 'gets ' + q(-env, '°C') + ' warmer per km' : 'cools ' + q(env, '°C') + ' per km') + ' with height?', mcK(CL[k], CL.filter(function (x, i) { return i !== k; })), [
        'Compare the layer\'s lapse rate with 9.8 (dry) and 6 (moist).',
        env < 0 ? 'Temperature rises with height: an inversion, the most stable case.' : env > 9.8 ? 'Faster than the dry rate: even dry parcels keep rising.' : env > 6 ? 'Between the moist and dry rates: stable for dry parcels, unstable for saturated ones.' : 'Slower than the moist rate: every parcel sinks back.'
      ], 'Is it faster than 9.8, between 6 and 9.8, slower than 6, or warming with height?', { vk: 'classify', vd: { _env: env } });
    }
    function rateFrom() {
      var z1 = 0, t1 = R.int(10, 30), z2 = R.pick([1, 1.5, 2, 3]), g = R.pick([4, 5, 6.5, 7, 8, 9, 11]), t2 = t1 - g * z2;
      return pr('A weather balloon measures ' + q(t1, '°C') + ' at the ground and ' + q(fix(t2), '°C') + ' at ' + q(z2, 'km') + '. How fast does the surrounding air cool with height, in °C per km?', num(g, 0.01), [
        'Change: ' + nt(t1) + ' − (' + nt(fix(t2)) + ') = ' + q(fix(g * z2), '°C') + ' over ' + q(z2, 'km') + '.',
        'Lapse rate: ' + nt(fix(g * z2)) + ' ÷ ' + nt(z2) + ' = ' + q(g, '°C/km') + '.'
      ], 'Divide the temperature drop by the height change.', { unit: '°C/km', vk: 'rate', vd: { t1: t1, t2: fix(t2), z2: z2 } });
    }
    function diffT() {
      var t0 = R.int(15, 32), env = R.pick([5, 6.5, 7, 8, 9, 11]), sat = R.coin(), rate = sat ? 6 : 10, dz = R.pick([1, 1.5, 2, 3]), d = (t0 - rate * dz) - (t0 - env * dz);
      return pr('Surrounding air: ' + q(t0, '°C') + ' at the ground, cooling ' + q(env, '°C') + ' per km. A ' + (sat ? 'saturated parcel (6 °C per km)' : 'dry parcel (10 °C per km)') + ' starts at ' + q(t0, '°C') + ' and is lifted ' + q(dz, 'km') + '. How much warmer than its surroundings is the parcel then? (Give a negative number if it is colder.)', numT(fix(d), 0.051), [
        'Parcel: ' + q(fix(t0 - rate * dz), '°C') + '. Surroundings: ' + q(fix(t0 - env * dz), '°C') + '.',
        'Difference: ' + sgn(fix(d), '°C') + (d > 0 ? ': warmer, so it keeps rising.' : d < 0 ? ': colder, so it sinks back.' : ': the same, neutral.')
      ], 'Find both temperatures at the new height.', { unit: '°C', vk: 'difft', vd: { t0: t0, env: env, dz: dz } });
    }
    function tfq() {
      var K = R.pick([
        ['A very hot day at the ground is always unstable.', false, 'Stability depends on how fast the air cools with height compared with a rising parcel, not on the ground temperature.'],
        ['An inversion, where air gets warmer with height, traps haze and smog below it.', true, 'Rising air quickly becomes colder than the warm layer above and sinks back.'],
        ['Air that cools 8 °C per km is unstable for saturated parcels but stable for dry ones.', true, '8 lies between the moist rate (about 6) and the dry rate (9.8): conditionally unstable.'],
        ['If a lifted parcel ends up colder than the air around it, it keeps rising.', false, 'Colder means denser, so it sinks back: stable.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Warmer than the surroundings rises; colder sinks back.', { vk: 'concept' });
    }
    return lv(R, ctx, [liftTest, rateFrom, tfq], [liftTest, classify, rateFrom, tfq], [diffT, classify, liftTest]);
  });

  // ---------- g05_clouds.js ----------
  // ===================== Unit 5: Clouds and Precipitation =====================
  var CLOUDN = ['cirrus', 'cirrostratus', 'cirrocumulus', 'altostratus', 'altocumulus', 'stratus', 'stratocumulus', 'nimbostratus', 'cumulus', 'cumulonimbus'];
  var CLOUDLEV = { cirrus: 'high', cirrostratus: 'high', cirrocumulus: 'high', altostratus: 'middle', altocumulus: 'middle', stratus: 'low', stratocumulus: 'low', nimbostratus: 'low (often reaching into the middle level)', cumulus: 'low', cumulonimbus: 'through all levels' };
  function others(R, right, list, k) { return R.sample(list.filter(function (x) { return x !== right; }), k); }
  G('weather.cloud-types', function (R, ctx) {
    var DESC = [
      ['Thin, white wisps high in the sky, like brush strokes or curls of hair.', 'cirrus'],
      ['A thin, milky veil over the whole sky, with a halo around the Sun.', 'cirrostratus'],
      ['Rows of tiny white ripples very high up, a "mackerel sky."', 'cirrocumulus'],
      ['A gray sheet at middle height; the Sun shows dimly, as if through frosted glass.', 'altostratus'],
      ['Gray and white puffs in rows at middle height, each puff about the size of your thumb held at arm\'s length.', 'altocumulus'],
      ['A flat, gray, featureless layer close to the ground, like fog that doesn\'t touch it.', 'stratus'],
      ['A low, lumpy gray layer of rolls with gaps of blue between them.', 'stratocumulus'],
      ['A thick, dark gray layer that brings steady rain or snow for hours.', 'nimbostratus'],
      ['Puffy white heaps with flat bases on a sunny afternoon.', 'cumulus'],
      ['A huge tower with an anvil-shaped top, lightning and heavy showers.', 'cumulonimbus']
    ];
    function describe() {
      var d = R.pick(DESC);
      return pr('Which cloud is this? ' + d[0], mc(cap(d[1]), others(R, d[1], CLOUDN, 3).map(cap)), [
        'Height: ' + CLOUDLEV[d[1]] + '. Shape: ' + (/cumul/.test(d[1]) ? 'heaped (cumulo-)' : /strat/.test(d[1]) ? 'layered (strato-)' : 'wispy (cirro-)') + (/nimb/.test(d[1]) ? ', bringing rain (nimbo-)' : '') + '.',
        'So it is ' + d[1] + '.'
      ], 'Decide the height first, then the shape.', { vk: 'concept' });
    }
    function roots() {
      var K = R.pick([['cirro-', 'High and wispy, made of ice crystals'], ['alto-', 'Middle height'], ['strato-', 'Spread in a flat layer'], ['cumulo-', 'Piled up in heaps'], ['nimbo- or -nimbus', 'Bringing rain or snow']]);
      var all = ['High and wispy, made of ice crystals', 'Middle height', 'Spread in a flat layer', 'Piled up in heaps', 'Bringing rain or snow'];
      return pr('In a cloud\'s name, what does "' + K[0] + '" tell you?', mc(K[1], all.filter(function (x) { return x !== K[1]; })), ['Cloud names combine Latin roots for height and shape.', '"' + K[0] + '" means: ' + K[1].toLowerCase() + '.'], 'Think of the Latin roots: curl, high, layer, heap, rain.', { vk: 'concept' });
    }
    function weatherOf() {
      var K = R.pick([['thunderstorms with lightning and hail', 'cumulonimbus'], ['light, steady rain or snow that lasts for hours', 'nimbostratus'], ['a halo around the Moon', 'cirrostratus'], ['fair weather on a summer afternoon', 'cumulus'], ['a gray blanket with drizzle at most', 'stratus']]);
      return pr('Which cloud usually brings ' + K[0] + '?', mc(cap(K[1]), others(R, K[1], CLOUDN, 3).map(cap)), ['Heaped clouds come from rising, unstable air; layered clouds from gentle, widespread lifting; ice-crystal clouds are high.', 'Answer: ' + K[1] + '.'], 'Match the weather to the way the air is moving.', { vk: 'concept' });
    }
    function level() {
      var n = R.pick(['cirrus', 'altostratus', 'altocumulus', 'stratus', 'stratocumulus', 'cirrocumulus', 'cirrostratus']), lv0 = CLOUDLEV[n];
      var ch = ['High (about 5–13 km)', 'Middle (about 2–7 km)', 'Low (below about 2 km)'], right = lv0 === 'high' ? ch[0] : lv0 === 'middle' ? ch[1] : ch[2];
      return pr('At what level do ' + n + ' clouds usually form (in the middle latitudes)?', mcK(right, ch.filter(function (x) { return x !== right; })), ['The name tells you: cirro- is high, alto- is middle, and plain strato- or cumulo- clouds are low.', n + ': ' + right.toLowerCase() + '.'], 'Look for cirro- or alto- in the name.', { vk: 'concept' });
    }
    function picture() {
      var n = R.pick(CLOUDN);
      return pr('Name the highlighted cloud in the picture.', mc(cap(n), others(R, n, CLOUDN, 3).map(cap)), ['Check its height on the scale and its shape: wisps, sheet, puffs, or a tower.', 'It is ' + n + ' (' + CLOUDLEV[n] + ').'], 'Read its height first, then its shape.', { vk: 'concept', viz: { name: 'es-clouds', opts: { mode: 'atlas', highlight: n, quiet: true, lock: true } } });
    }
    function tfq() {
      var K = R.pick([
        ['Dark gray clouds are made of smoke or dirt, unlike white clouds.', false, 'All clouds are droplets or ice crystals; dark ones are thick enough to block most sunlight.'],
        ['High clouds such as cirrus are made mostly of ice crystals.', true, 'At 5 to 13 km the air is far below freezing.'],
        ['Heaped (cumulus) clouds form in rising bubbles of unstable air.', true, 'The bubbles rise on their own, piling the cloud upward.'],
        ['A cloud seen from an airplane above it looks dark, just as it does from below.', false, 'From above, the sunlit top is bright white.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'All clouds are droplets or ice; shape and height tell the rest.', { vk: 'concept' });
    }
    return lv(R, ctx, [describe, roots, tfq], [describe, weatherOf, level, picture], [picture, weatherOf, describe]);
  });

  G('weather.raindrop-growth', function (R, ctx) {
    function count() {
      var r = R.pick([5, 10, 20, 25, 50]), Rm = R.pick([0.1, 0.2, 0.25, 0.5, 1, 1.5, 2]), Ru = Rm * 1000, n = MA.pow(Ru / r, 3);
      if (Ru / r < 4) { Rm = 1; Ru = 1000; n = MA.pow(Ru / r, 3); }
      return pr('How many cloud droplets of radius ' + q(r, 'μm') + ' does it take to make one drop of radius ' + q(Rm, 'mm') + '? (1 mm = 1000 μm)', num(n, 0.01), [
        'Same units: ' + q(Rm, 'mm') + ' = ' + q(Ru, 'μm') + '. Ratio of radii: ' + nt(Ru) + ' ÷ ' + nt(r) + ' = ' + nt(Ru / r) + '.',
        'Volume goes as the cube of the radius: ' + nt(Ru / r) + '³ = ' + nt(n) + ' droplets.'
      ], 'Compare radii, then cube the ratio.', { vk: 'count', vd: { r: r, Rm: Rm } });
    }
    function radius() {
      var r = R.pick([5, 10, 20]), k = R.pick([10, 20, 50, 100, 200]), n = k * k * k;
      return pr('A drop is made of ' + nt(n) + ' cloud droplets, each of radius ' + q(r, 'μm') + '. What is the drop\'s radius, in micrometers?', num(r * k, 0.01), [
        'Volume ratio ' + nt(n) + ', so the radius ratio is its cube root: $\\sqrt[3]{' + n + '}$ = ' + nt(k) + '.',
        'Radius: ' + nt(r) + ' × ' + nt(k) + ' = ' + q(r * k, 'μm') + ' (' + q(r * k / 1000, 'mm') + ').'
      ], 'Undo the cube with a cube root.', { unit: 'μm', vk: 'radius', vd: { r: r, n: n } });
    }
    function fallTime() {
      var v = R.pick([0.5, 1, 1.2, 2]), d = R.pick([0.5, 1, 2]), t = d * 1000 * 100 / v / 3600;
      return pr('A cloud droplet falls ' + q(v, 'cm/s') + ' through still air. How many hours would it take to fall ' + q(d, 'km') + '?', num(t, 0.01), [
        q(d, 'km') + ' = ' + q(d * 100000, 'cm') + '. Time: ' + nt(d * 100000) + ' ÷ ' + nt(v) + ' = ' + q(rnd(d * 100000 / v, 0), 's') + '.',
        'In hours: ÷ 3600 ≈ ' + q(rnd(t, 1), 'h') + '. It would evaporate long before reaching the ground.'
      ], 'Convert to centimeters, divide, then convert seconds to hours.', { unit: 'h', vk: 'fall', vd: { v: v, d: d } });
    }
    function volume() {
      var r = R.pick([5, 10, 15, 20, 25, 50]), V = 4 / 3 * MA.PI * r * r * r;
      return pr('What is the volume of a cloud droplet of radius ' + q(r, 'μm') + '? Use $V = \\tfrac{4}{3}\\pi r^3$ and give the answer in cubic micrometers.', num(V, 0.01), [
        '$r^3$ = ' + nt(r) + '³ = ' + nt(r * r * r) + ' μm³.',
        '$V$ = 4/3 × π × ' + nt(r * r * r) + ' ≈ ' + q(rnd(V, 0), 'μm³') + '.'
      ], 'Cube the radius first.', { unit: 'μm³', vk: 'vol', vd: { r: r } });
    }
    function process() {
      var K = R.pick([
        ['In a cloud at −10 °C with both ice crystals and liquid droplets, which grow?', 'The ice crystals grow while the droplets evaporate', ['The droplets grow while the ice crystals melt', 'Both stop growing until the cloud warms', 'Neither: nothing grows below 0 °C']],
        ['How do drops grow in a warm cloud (above 0 °C everywhere)?', 'Bigger drops fall faster, hit smaller ones and join them', ['Ice crystals steal vapor from the droplets', 'The droplets get heavier by cooling', 'Lightning fuses the droplets together']],
        ['Why do ice crystals grow at the expense of water droplets below 0 °C?', 'Saturation over ice is at a lower vapor pressure than over water, so air saturated for the droplets is supersaturated for the ice', ['Ice is heavier, so it pulls the droplets toward it', 'Water droplets freeze onto ice instantly at any temperature', 'Ice crystals give off heat that melts the droplets']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Two ways to grow: collision and coalescence (warm clouds) and the ice-crystal process (cold clouds).', 'Answer: ' + K[1] + '.'], 'Think about which surface vapor condenses onto more easily.', { vk: 'concept' });
    }
    function updraft() {
      var U = R.pick([1, 2, 3, 5, 7]), D = [[0.2, 0.72], [0.5, 2.06], [1, 4.03], [2, 6.49], [4, 8.83]];
      var ok = D.filter(function (x) { return x[1] > U; }), right = ok.length ? q(ok[0][0], 'mm') : 'None of them';
      var choices = D.map(function (x) { return q(x[0], 'mm'); });
      return pr('An updraft rises at ' + q(U, 'm/s') + '. Drops fall through still air at these speeds: ' + D.map(function (x) { return q(x[0], 'mm') + ' across: ' + q(x[1], 'm/s'); }).join('; ') + '. What is the smallest of these drops that can fall out of the updraft?', mcK(right, choices.filter(function (x) { return x !== right; }).slice(0, 4)), [
        'A drop falls out only if its fall speed beats the updraft: faster than ' + q(U, 'm/s') + '.',
        'The smallest that does: ' + right + '.'
      ], 'Compare each fall speed with the updraft.', { vk: 'updraft', vd: { U: U } });
    }
    function iceWater() {
      var P = R.pick([[-5, 4.21, 4.02], [-10, 2.87, 2.60], [-15, 1.91, 1.65], [-20, 1.25, 1.03]]), f = 100 * (P[1] / P[2] - 1);
      return pr('At ' + q(P[0], '°C') + ', the saturation vapor pressure is ' + q(P[1], 'hPa') + ' over liquid water and ' + q(P[2], 'hPa') + ' over ice. Air that is just saturated for the water droplets is supersaturated for ice crystals by what percent?', pct(f, 0.3), [
        'Relative to ice: ' + nt(P[1]) + ' ÷ ' + nt(P[2]) + ' ≈ ' + nt(rnd(P[1] / P[2], 3)) + '.',
        'That is about ' + nt(rnd(f, 0)) + '% above ice saturation, so the crystals grow fast while the droplets evaporate.'
      ], 'Divide the water value by the ice value.', { vk: 'icew', vd: { t: P[0], w: P[1], i: P[2] } });
    }
    function tfq() {
      var K = R.pick([
        ['Cloud droplets fall as rain as soon as they form.', false, 'They are so small that any updraft holds them up; they must grow about a million times in volume.'],
        ['One raindrop holds about a million cloud droplets\' worth of water.', true, '(1000 μm ÷ 10 μm)³ = 100³ = 1,000,000.'],
        ['Much of the rain in the middle latitudes begins as snow high in the cloud.', true, 'The ice-crystal process makes snow, which melts on the way down.'],
        ['A drop 10 times wider than a droplet holds 10 droplets\' worth of water.', false, 'Volume goes as the cube: 10³ = 1000.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Volume grows as the cube of the radius.', { vk: 'concept' });
    }
    return lv(R, ctx, [count, tfq, process], [count, radius, fallTime, volume, process], [updraft, iceWater, radius, volume]);
  });

  G('weather.precipitation-types', function (R, ctx) {
    function profile(kind) { // [height m, T °C] from the cloud base (3000 m) to the ground, and a description
      var top = -R.int(5, 9), wp = R.int(3, 6), d;
      if (kind === 'snow') { var g = -R.int(1, 6); return { p: [[3000, top], [1500, MA.round((top + g) / 2)], [0, g]], d: 'The air is below freezing from the cloud base at 3,000 m all the way down, with ' + q(g, '°C') + ' at the ground.' }; }
      if (kind === 'rain') { var gr = R.int(5, 12), z0 = R.pick([1800, 2000, 2200]); return { p: [[3000, top], [z0, 0], [0, gr]], d: 'Below the cloud at 3,000 m the air warms steadily, crossing 0 °C at ' + q(z0, 'm') + ' and reaching ' + q(gr, '°C') + ' at the ground.' }; }
      if (kind === 'sleet') { var gs = -R.int(6, 10), zc = R.pick([1200, 1400, 1500]); return { p: [[3000, top], [2400, 0], [1800, wp], [zc, 0], [0, gs]], d: 'Below the cloud at 3,000 m, a warm layer reaches ' + q(wp, '°C') + ' between 2,400 m and ' + q(zc, 'm') + '. Below ' + q(zc, 'm') + ' the air is below freezing all the way down, with ' + q(gs, '°C') + ' at the ground.' }; }
      var gf = -R.int(1, 3), zf = R.pick([150, 200, 250]);
      return { p: [[3000, top], [2400, 0], [1400, wp], [zf + 100, 1], [zf, 0], [0, gf]], d: 'Below the cloud at 3,000 m, a warm layer reaches ' + q(wp, '°C') + ' and stays above freezing down to ' + q(zf, 'm') + '. Only the lowest ' + q(zf, 'm') + ' is below freezing, with ' + q(gf, '°C') + ' at the ground.' };
    }
    var KINDS = ['Snow', 'Rain', 'Sleet (ice pellets)', 'Freezing rain'];
    var KEYS = { snow: 'Snow', rain: 'Rain', sleet: 'Sleet (ice pellets)', fz: 'Freezing rain' };
    var WHYK = { snow: 'No layer is warm enough to melt the snowflakes.', rain: 'The warm layer melts the snow, and the air stays above freezing to the ground.', sleet: 'The warm layer melts the snow, and the deep cold layer below refreezes the drops into ice pellets.', fz: 'The warm layer melts the snow, and the cold layer at the ground is too shallow to refreeze the drops, so they freeze on contact.' };
    function sounding() {
      var k = R.pick(['snow', 'rain', 'sleet', 'fz', 'sleet', 'fz']), P = profile(k);
      return pr('Snow forms in a cloud whose base is at 3,000 m. ' + P.d + ' What reaches the ground?', mcK(KEYS[k], KINDS.filter(function (x) { return x !== KEYS[k]; })), [
        'Does a warm layer melt the flakes? Then, is the cold air below it deep enough to refreeze the drops?',
        WHYK[k] + ' Answer: ' + KEYS[k].toLowerCase() + '.'
      ], 'Follow a snowflake down through each layer.', { vk: 'ptype', vd: { _k: k }, viz: { name: 'es-clouds', opts: { mode: 'ptype', profile: P.p, quiet: true, lock: true } }, prof: P.p });
    }
    function looks() {
      var K = R.pick([['Small ice pellets bounce off the car and pile up like tiny beads.', 'Sleet (ice pellets)'], ['Rain falls, but tree branches and power lines are coated in a growing glaze of clear ice.', 'Freezing rain'], ['Six-sided flakes drift down and pile up softly.', 'Snow'], ['Drops fall and the puddles stay liquid on a 6 °C day.', 'Rain']]);
      return pr('What is falling? ' + K[0], mcK(K[1], KINDS.filter(function (x) { return x !== K[1]; })), ['Sleet freezes in the air and bounces; freezing rain lands liquid and freezes on contact; snow falls as flakes.', 'Answer: ' + K[1].toLowerCase() + '.'], 'Did it freeze in the air, on contact, or not at all?', { vk: 'concept' });
    }
    function depth() {
      return pr('Two winter storms both have a warm layer aloft that melts the snow. In town A the cold layer near the ground is 1,500 m deep; in town B it is 150 m deep. Which is most likely?', mc('Sleet in town A, freezing rain in town B', ['Freezing rain in town A, sleet in town B', 'Snow in both towns', 'Rain in both towns']), [
        'A deep cold layer gives melted drops time to refreeze in the air: sleet.',
        'A shallow cold layer lets them reach the ground as supercooled liquid, which freezes on contact: freezing rain.'
      ], 'Where do the drops have time to refreeze?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['Sleet and freezing rain are two names for the same thing.', false, 'Sleet freezes in the air into pellets; freezing rain lands as liquid and freezes on contact.'],
        ['Freezing rain needs a layer of above-freezing air somewhere above the ground.', true, 'That warm layer melts the snow into drops.'],
        ['Snow can reach the ground only if the ground temperature is far below freezing.', false, 'If the whole column is near or below 0 °C, snow can reach the ground even with the ground just about at freezing.'],
        ['Most winter precipitation starts as snow, even if it lands as rain.', true, 'It forms by the ice-crystal process and melts in warm layers on the way down.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Follow the flake down through each layer.', { vk: 'concept' });
    }
    return lv(R, ctx, [sounding, looks, tfq], [sounding, depth, looks], [sounding, depth, tfq]);
  });

  // ---------- g06_wind.js ----------
  // ===================== Unit 6: Pressure and Wind =====================
  var OMEGA = 7.29e-5;
  var SINS = { 10: 0.174, 20: 0.342, 30: 0.5, 40: 0.643, 45: 0.707, 50: 0.766, 60: 0.866, 70: 0.940, 90: 1 };
  var DIRS = ['north', 'east', 'south', 'west'];
  var C8 = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  function bearingName(b) { b = ((b % 360) + 360) % 360; return C8[MA.round(b / 45) % 8]; }
  G('weather.pressure-gradient', function (R, ctx) {
    function grad() {
      var p1 = R.int(250, 258) * 4, k = R.pick([1, 2, 3]), dn = R.pick([100, 150, 200, 250, 300, 400, 600, 120, 350, 500]), g = 4 * k / dn * 100;
      return pr('Two isobars, ' + q(p1, 'hPa') + ' and ' + q(p1 - 4 * k, 'hPa') + ', are ' + q(dn, 'km') + ' apart. What is the pressure gradient, in hPa per 100 km?', num(g, 0.01), [
        'Difference: ' + nt(p1) + ' − ' + nt(p1 - 4 * k) + ' = ' + q(4 * k, 'hPa') + '.',
        'Per 100 km: ' + nt(4 * k) + ' ÷ ' + nt(dn) + ' × 100 ≈ ' + nt(rnd(g, 2)) + ' hPa per 100 km.'
      ], 'Pressure difference divided by distance.', { unit: 'hPa per 100 km', vk: 'grad', vd: { p1: p1, p2: p1 - 4 * k, dn: dn } });
    }
    function windier() {
      var a = R.pick([100, 150, 200, 250, 120]), b = a * R.pick([2, 3]), sw = R.coin();
      var A = sw ? b : a, B = sw ? a : b, right = A < B ? 'Town A, where the isobars are closer together' : 'Town B, where the isobars are closer together';
      return pr('On a weather map with isobars every 4 hPa, the isobars near town A are ' + q(A, 'km') + ' apart and near town B ' + q(B, 'km') + ' apart. Where is the wind likely stronger?', mcK(right, [A < B ? 'Town B, where the isobars are farther apart' : 'Town A, where the isobars are farther apart', 'The same, since the isobars are 4 hPa apart in both', 'Wherever the pressure is lowest, whatever the spacing']), [
        'The push depends on the gradient: the same 4 hPa over a shorter distance is a steeper gradient.',
        'Closer isobars, stronger push, stronger wind: ' + right.split(',')[0] + '.'
      ], 'Compare the spacing.', { vk: 'concept' });
    }
    function accel() {
      var dp = R.pick([2, 4, 6, 8, 3, 5, 7]), dn = R.pick([100, 200, 300, 400, 120, 150, 250, 350]), rho = R.pick([1.2, 1.0, 0.8, 0.9]), a = dp * 100 / (rho * dn * 1000);
      return pr('The pressure drops ' + q(dp, 'hPa') + ' over ' + q(dn, 'km') + ', and the air density is ' + q(rho, 'kg/m³') + '. What acceleration does the pressure gradient force give the air? Use $a = \\dfrac{\\Delta p}{\\rho\\,\\Delta n}$.', num(a, 0.01), [
        'Convert: ' + q(dp, 'hPa') + ' = ' + q(dp * 100, 'Pa') + '; ' + q(dn, 'km') + ' = ' + q(dn * 1000, 'm') + '.',
        '$a$ = ' + nt(dp * 100) + ' ÷ (' + nt(rho) + ' × ' + nt(dn * 1000) + ') ≈ ' + q(sig(a, 3), 'm/s²') + '.'
      ], 'Use pascals and meters.', { unit: 'm/s²', vk: 'accel', vd: { dp: dp, dn: dn, rho: rho } });
    }
    function direction() {
      var i = R.int(0, 3), hi = DIRS[i], lo = DIRS[(i + 2) % 4];
      return pr('High pressure lies to the ' + hi + ' of a town and low pressure to the ' + lo + '. Which way does the pressure gradient force push the air at the town?', mcK('Toward the ' + lo, ['Toward the ' + hi, 'Toward the ' + DIRS[(i + 1) % 4], 'Toward the ' + DIRS[(i + 3) % 4]]), [
        'The pressure gradient force points from high toward low pressure, straight across the isobars.',
        'So it pushes toward the ' + lo + '. (The Coriolis effect will then turn the moving air.)'
      ], 'From high toward low.', { vk: 'concept' });
    }
    function gain() {
      var a = R.pick([0.001, 0.002, 0.003, 0.004, 0.0012, 0.0015, 0.0025, 0.0035]), h = R.pick([1, 2, 3]), v = a * h * 3600;
      return pr('If the pressure gradient force gave the air a steady acceleration of ' + q(a, 'm/s²') + ' and nothing else acted, how fast would air starting at rest be moving after ' + q(h, h === 1 ? 'hour' : 'hours') + '?', num(v, 0.01), [
        'Time: ' + nt(h) + ' × 3600 = ' + q(h * 3600, 's') + '.',
        '$v = at$ = ' + nt(a) + ' × ' + nt(h * 3600) + ' = ' + q(fix(v), 'm/s') + '. In reality the Coriolis effect turns the air long before this.'
      ], 'Speed gained = acceleration × time, with time in seconds.', { unit: 'm/s', vk: 'gain', vd: { a: a, h: h } });
    }
    function rings() {
      var outer = R.int(251, 254) * 4, n = R.int(2, 5), c = outer - 4 * (n - 1);
      return pr('A low is surrounded by ' + n + ' closed isobars, drawn every 4 hPa. The outermost is ' + q(outer, 'hPa') + '. What is the value of the innermost isobar?', num(c, 0.0001), [
        'Each ring inward is 4 hPa lower. From the outermost to the innermost is ' + (n - 1) + ' steps.',
        nt(outer) + ' − 4 × ' + (n - 1) + ' = ' + q(c, 'hPa') + '.'
      ], 'Count the 4 hPa steps inward.', { unit: 'hPa', vk: 'rings', vd: { outer: outer, n: n } });
    }
    return lv(R, ctx, [grad, windier, direction], [grad, accel, windier, rings], [accel, gain, grad]);
  });

  G('weather.coriolis', function (R, ctx) {
    function turn() {
      var h = R.pick(['N', 'S']), lat = R.int(15, 70), i = R.int(0, 7), mv = C8[i], to = C8[(i + (h === 'N' ? 2 : 6)) % 8];
      var wr = R.sample(C8.filter(function (d) { return d !== to && d !== mv; }), 3);
      return pr('Air at ' + lat + '° ' + h + ' is moving toward the ' + mv + '. Which way does the Coriolis effect turn it?', mc('Toward the ' + to, wr.map(function (d) { return 'Toward the ' + d; })), [
        (h === 'N' ? 'Northern Hemisphere: moving air turns to its right.' : 'Southern Hemisphere: moving air turns to its left.'),
        'Facing ' + mv + ', your ' + (h === 'N' ? 'right' : 'left') + ' is ' + to + '.'
      ], 'Face the way the air moves, then turn right (north) or left (south).', { vk: 'turn', vd: { _h: h, _i: i } });
    }
    function fval() {
      var lat = R.pick([10, 20, 30, 40, 45, 50, 60, 70, 90]), s = SINS[lat], f = 2 * OMEGA * s;
      return pr('Find the Coriolis parameter $f = 2\\Omega\\sin\\varphi$ at ' + q(lat, '°') + ' latitude. Use $\\Omega = 7.29 \\times 10^{-5}$ s⁻¹ and $\\sin ' + lat + '^\\circ \\approx ' + s + '$.', num(f, 0.01), [
        '$f$ = 2 × 7.29 × 10⁻⁵ × ' + nt(s) + '.',
        '≈ ' + M(nt(sig(f / 1e-5, 3)) + ' \\times 10^{-5}') + ' s⁻¹.'
      ], 'Multiply 2Ω by the sine of the latitude.', { unit: 's⁻¹', vk: 'fval', vd: { lat: lat } });
    }
    function ratio() {
      var P = R.pick([[90, 30], [60, 30], [45, 30], [90, 60], [60, 20], [30, 10], [70, 20], [50, 20], [40, 10], [90, 45], [70, 30], [60, 10], [45, 20], [50, 30]]), r = SINS[P[0]] / SINS[P[1]];
      return pr('How many times stronger is the Coriolis effect (for the same wind speed) at ' + q(P[0], '°') + ' latitude than at ' + q(P[1], '°') + '? (sin ' + P[0] + '° ≈ ' + SINS[P[0]] + ', sin ' + P[1] + '° ≈ ' + SINS[P[1]] + ')', num(r, 0.01), [
        '$f$ is proportional to $\\sin\\varphi$.',
        'Ratio: ' + nt(SINS[P[0]]) + ' ÷ ' + nt(SINS[P[1]]) + ' ≈ ' + nt(rnd(r, 2)) + '.'
      ], 'Compare the sines of the two latitudes.', { vk: 'ratio', vd: { a: P[0], b: P[1] } });
    }
    function accel() {
      var lat = R.pick([20, 30, 40, 45, 50, 60, 70]), v = R.int(3, 45), f = 2 * OMEGA * SINS[lat], a = f * v;
      return pr('At ' + q(lat, '°') + ' N, $f$ ≈ ' + M(nt(sig(f / 1e-5, 3)) + ' \\times 10^{-5}') + ' s⁻¹. What sideways (Coriolis) acceleration does a ' + q(v, 'm/s') + ' wind feel?', num(sig(f, 3) * v, 0.01), [
        'Coriolis acceleration = $f \\times v$ = ' + nt(sig(f / 1e-5, 3)) + ' × 10⁻⁵ × ' + nt(v) + '.',
        '≈ ' + M(nt(sig(sig(f, 3) * v / 1e-4, 3)) + ' \\times 10^{-4}') + ' m/s², pointing to the right of the wind.'
      ], 'Multiply f by the speed.', { unit: 'm/s²', vk: 'accel', vd: { lat: lat, v: v } });
    }
    function tfq() {
      var K = R.pick([
        ['The Coriolis effect speeds up the wind.', false, 'It acts at right angles to the motion, so it changes only the direction.'],
        ['The Coriolis effect is strongest at the equator.', false, 'It grows with sin(latitude): zero at the equator, largest at the poles.'],
        ['Hurricanes almost never form within about 5° of the equator, because the Coriolis effect there is too weak to start the spin.', true, 'At the equator f = 0.'],
        ['The Coriolis effect decides which way water swirls down a bathroom sink.', false, 'It is far too weak at that small scale; the basin\'s shape and the water\'s motion matter more.'],
        ['In the Southern Hemisphere, moving air is turned to its left.', true, 'Seen from above the South Pole, Earth spins clockwise.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Direction only, zero at the equator, right in the north, left in the south.', { vk: 'concept' });
    }
    function drift() {
      var lat = R.pick([30, 45, 60]), v = R.pick([20, 50, 100]), t = R.pick([30, 60, 100]), f = 2 * OMEGA * SINS[lat], d = 0.5 * f * v * t * t;
      return pr('A ball is launched at ' + q(v, 'm/s') + ' at ' + q(lat, '°') + ' N, where $f$ = 2 × 7.29 × 10⁻⁵ × ' + SINS[lat] + ' s⁻¹. For a short flight, the sideways drift is about $\\tfrac{1}{2} f v t^2$. How far does it drift sideways in ' + q(t, 's') + '?', num(d, 0.02), [
        '$f$ ≈ ' + M(nt(sig(f / 1e-5, 3)) + ' \\times 10^{-5}') + ' s⁻¹.',
        'Drift ≈ ½ × ' + nt(sig(f / 1e-5, 3)) + ' × 10⁻⁵ × ' + nt(v) + ' × ' + nt(t) + '² ≈ ' + q(sig(d, 3), 'm') + ', to the right. Tiny for a ball; large for winds that blow for hours.'
      ], 'Find f, then use ½ f v t².', { unit: 'm', vk: 'drift', vd: { lat: lat, v: v, t: t } });
    }
    return lv(R, ctx, [turn, ratio, tfq], [turn, fval, accel, tfq], [fval, drift, accel, turn]);
  });

  G('weather.geostrophic-wind', function (R, ctx) {
    function vg(dp, dn, s, rho) { return dp * 100 / (rho * 2 * OMEGA * s * dn * 1000); }
    function speed() {
      var lat = R.pick([30, 40, 45, 50, 60]), s = SINS[lat], dp = R.pick([4, 8]), dn = R.pick([200, 300, 400, 500]), rho = R.pick([1.2, 1.0, 0.7, 0.5]), V = vg(dp, dn, s, rho);
      return pr('At ' + q(lat, '°') + ' N (sin ' + lat + '° ≈ ' + s + ', $\\Omega = 7.29 \\times 10^{-5}$ s⁻¹), the pressure changes by ' + q(dp, 'hPa') + ' over ' + q(dn, 'km') + ' at a level where the air density is ' + q(rho, 'kg/m³') + '. Find the geostrophic wind speed, $V = \\dfrac{\\Delta p}{\\rho f \\Delta n}$.', num(V, 0.02), [
        '$f$ = 2 × 7.29 × 10⁻⁵ × ' + nt(s) + ' ≈ ' + M(nt(sig(2 * OMEGA * s / 1e-5, 3)) + ' \\times 10^{-5}') + ' s⁻¹.',
        '$\\Delta p/\\Delta n$ = ' + nt(dp * 100) + ' Pa ÷ ' + nt(dn * 1000) + ' m = ' + M(nt(sig(dp * 100 / (dn * 1000) / 1e-3, 3)) + ' \\times 10^{-3}') + ' Pa/m.',
        '$V$ ≈ ' + q(rnd(V, 1), 'm/s') + '.'
      ], 'Work in pascals and meters; find f first.', { unit: 'm/s', vk: 'speed', vd: { lat: lat, dp: dp, dn: dn, rho: rho } });
    }
    function dir() {
      var h = R.pick(['N', 'S']), i = R.int(0, 3), lo = DIRS[i], hi = DIRS[(i + 2) % 4];
      // facing direction F such that the low is on the left (N) or right (S)
      var face = DIRS[(i + (h === 'N' ? 1 : 3)) % 4], from = DIRS[(DIRS.indexOf(face) + 2) % 4];
      return pr('High above the ground in the ' + (h === 'N' ? 'Northern' : 'Southern') + ' Hemisphere, low pressure lies to the ' + lo + ' and high pressure to the ' + hi + '. Which way does the wind blow?', mcK('From the ' + from + ', toward the ' + face, DIRS.filter(function (d) { return d !== face; }).map(function (d) { return 'From the ' + DIRS[(DIRS.indexOf(d) + 2) % 4] + ', toward the ' + d; })), [
        'Aloft, the wind blows along the isobars with low pressure on its ' + (h === 'N' ? 'left (Northern Hemisphere)' : 'right (Southern Hemisphere)') + '.',
        'With the low to the ' + lo + ' on your ' + (h === 'N' ? 'left' : 'right') + ', you face ' + face + ': the wind blows from the ' + from + ' toward the ' + face + '.'
      ], 'Which way must you face to put the low on your left (north) or right (south)?', { vk: 'dir', vd: { _h: h, _i: i } });
    }
    function scale() {
      var k = R.pick([2, 3, 0.5]), V0 = R.pick([10, 15, 20, 25]), V = V0 * k;
      var how = k === 2 ? 'the isobars become half as far apart' : k === 3 ? 'the pressure difference across the same distance triples' : 'the isobars become twice as far apart';
      return pr('Aloft at one place the geostrophic wind is ' + q(V0, 'm/s') + '. If ' + how + ' (same latitude and density), what is the new geostrophic wind?', num(V, 0.01), [
        '$V = \\dfrac{1}{\\rho f}\\dfrac{\\Delta p}{\\Delta n}$: it is proportional to the pressure gradient.',
        'The gradient is multiplied by ' + nt(k) + ', so $V$ = ' + nt(V0) + ' × ' + nt(k) + ' = ' + q(V, 'm/s') + '.'
      ], 'How does the gradient change?', { unit: 'm/s', vk: 'scale', vd: { V0: V0, _k: k } });
    }
    function latRatio() {
      var P = R.pick([[30, 60], [30, 90], [20, 60], [30, 45]]), r = SINS[P[1]] / SINS[P[0]];
      return pr('The same pressure gradient and air density are found at ' + q(P[0], '°') + ' and at ' + q(P[1], '°') + ' latitude. How many times faster is the geostrophic wind at ' + q(P[0], '°') + '? (sin ' + P[0] + '° ≈ ' + SINS[P[0]] + ', sin ' + P[1] + '° ≈ ' + SINS[P[1]] + ')', num(r, 0.01), [
        '$V$ is proportional to $1/f$, and $f$ to $\\sin\\varphi$.',
        'Ratio: ' + nt(SINS[P[1]]) + ' ÷ ' + nt(SINS[P[0]]) + ' ≈ ' + nt(rnd(r, 2)) + '. A weaker Coriolis force needs a faster wind to balance the same push.'
      ], 'V goes as 1/sin(latitude).', { vk: 'lat', vd: { a: P[0], b: P[1] } });
    }
    function withGas() {
      var p = R.pick([500, 300]), t = p === 500 ? R.int(-25, -15) : R.int(-50, -40), rho = p * 100 / (287 * (t + CK)), dp = R.pick([4, 6, 8]), dn = R.pick([200, 300]), s = SINS[45], V = vg(dp, dn, s, rho);
      return pr('On the ' + q(p, 'hPa') + ' map, the air is ' + q(t, '°C') + ' and the pressure changes by ' + q(dp, 'hPa') + ' over ' + q(dn, 'km') + ' at 45° N ($f$ = 2 × 7.29 × 10⁻⁵ × 0.707 s⁻¹). First find the density with $\\rho = P/(RT)$, $R$ = 287 J/(kg·K), then the geostrophic wind.', num(V, 0.02), [
        '$\\rho$ = ' + nt(p * 100) + ' ÷ (287 × ' + nt(t + CK) + ') ≈ ' + q(rnd(rho, 3), 'kg/m³') + '.',
        '$f$ ≈ ' + M('1.03 \\times 10^{-4}') + ' s⁻¹; $\\Delta p/\\Delta n$ = ' + nt(dp * 100) + ' ÷ ' + nt(dn * 1000) + ' Pa/m.',
        '$V$ ≈ ' + q(rnd(V, 1), 'm/s') + ': thin air aloft makes fast winds.'
      ], 'Density from the gas law, then the geostrophic formula.', { unit: 'm/s', vk: 'gas', vd: { p: p, t: t, dp: dp, dn: dn } });
    }
    function tfq() {
      var K = R.pick([
        ['High above the ground, winds blow straight across the isobars toward low pressure.', false, 'Aloft, the pressure and Coriolis forces balance and the wind blows along the isobars.'],
        ['In the Northern Hemisphere, the wind aloft blows with low pressure on its left.', true, 'Coriolis pulls to the right, balancing the push toward the low on the left.'],
        ['Closer isobars aloft mean faster winds.', true, 'The geostrophic speed is proportional to the pressure gradient.'],
        ['Geostrophic balance works well right at the equator.', false, 'There f = 0, so the Coriolis force can\'t balance the pressure push.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Aloft: balanced forces, wind along the isobars.', { vk: 'concept' });
    }
    return lv(R, ctx, [dir, scale, tfq], [speed, dir, latRatio, scale], [withGas, speed, latRatio]);
  });

  G('weather.highs-and-lows', function (R, ctx) {
    var SP = { NL: 'counterclockwise, spiraling inward', NH: 'clockwise, spiraling outward', SL: 'clockwise, spiraling inward', SH: 'counterclockwise, spiraling outward' };
    function rotation() {
      var h = R.pick(['N', 'S']), sys = R.pick(['L', 'H']), place = h === 'N' ? R.pick(['Canada', 'Japan', 'Texas', 'France', 'Germany', 'Mexico', 'Ohio', 'Spain', 'Korea', 'Alaska', 'Egypt', 'India']) : R.pick(['Argentina', 'Australia', 'New Zealand', 'South Africa', 'Chile', 'Uruguay', 'Madagascar', 'Tasmania']);
      var right = SP[h + sys];
      return pr('Near the ground in ' + place + ', how does the air move around a ' + (sys === 'L' ? 'low' : 'high') + '-pressure center?', mcK(cap(right), Object.keys(SP).map(function (k) { return cap(SP[k]); }).filter(function (x) { return x !== cap(right); })), [
        place + ' is in the ' + (h === 'N' ? 'Northern' : 'Southern') + ' Hemisphere, where moving air turns ' + (h === 'N' ? 'right' : 'left') + '.',
        'Friction lets air cross the isobars ' + (sys === 'L' ? 'into the low' : 'out of the high') + ', and the turning makes it ' + right + '.'
      ], 'Which hemisphere? Then: into a low, out of a high.', { vk: 'concept' });
    }
    function weather() {
      var sys = R.pick(['L', 'H']);
      var right = sys === 'L' ? 'Clouds and rain, because air converging into it rises and cools' : 'Clear skies, because air sinking in it warms and dries';
      return pr('What weather usually comes with a ' + (sys === 'L' ? 'low' : 'high') + '-pressure center?', mcK(right, [sys === 'L' ? 'Clear skies, because air sinking in it warms and dries' : 'Clouds and rain, because air converging into it rises and cools', 'Strong winds blowing straight out from the center', 'No change: pressure doesn\'t affect clouds']), [
        sys === 'L' ? 'Surface air spirals in, piles up and rises; rising air cools to its dew point.' : 'Surface air spirals out, and air sinks from above to replace it, warming as it sinks.',
        right + '.'
      ], 'Converging air rises; diverging air sinks.', { vk: 'concept' });
    }
    function buys() {
      var h = R.pick(['N', 'S']), fromI = R.int(0, 3), from = DIRS[fromI], face = DIRS[(fromI + 2) % 4], low = DIRS[(fromI + 2 + (h === 'N' ? 3 : 1)) % 4];
      return pr('In the ' + (h === 'N' ? 'Northern' : 'Southern') + ' Hemisphere, a steady surface wind blows from the ' + from + '. Using Buys Ballot\'s law, roughly where is the nearest low?', mcK('To the ' + low, DIRS.filter(function (d) { return d !== low; }).map(function (d) { return 'To the ' + d; })), [
        'Stand with your back to the wind: you face ' + face + '.',
        'The low is on your ' + (h === 'N' ? 'left' : 'right') + ' (a little ahead): to the ' + low + '.'
      ], 'Back to the wind; low on the left in the north, on the right in the south.', { vk: 'buys', vd: { _h: h, _f: fromI } });
    }
    function pointWind() {
      var h = R.pick(['N', 'S']), sys = R.pick(['L', 'H']), side = R.int(0, 3); // town lies to the north/east/south/west of the center
      var rx = [0, 1, 0, -1][side], ry = [1, 0, -1, 0][side];
      var ccw = (h === 'N') === (sys === 'L'), tx = ccw ? -ry : ry, ty = ccw ? rx : -rx, sg = sys === 'L' ? -1 : 1, a = 30 * MA.PI / 180;
      var wx = MA.cos(a) * tx + MA.sin(a) * sg * rx, wy = MA.cos(a) * ty + MA.sin(a) * sg * ry, toB = MA.atan2(wx, wy) * 180 / MA.PI, from = bearingName(toB + 180);
      var opts = C8.filter(function (c, i) { return i % 2 === 1; }).map(function (c) { return 'From the ' + c; });
      return pr('In the ' + (h === 'N' ? 'Northern' : 'Southern') + ' Hemisphere, a town lies due ' + DIRS[side] + ' of a ' + (sys === 'L' ? 'low' : 'high') + '-pressure center. Surface winds circle the center and cross the isobars at about 30° ' + (sys === 'L' ? 'inward' : 'outward') + '. From which direction does the wind blow at the town?', mcK('From the ' + from, opts.filter(function (x) { return x !== 'From the ' + from; })), [
        'Around a ' + (sys === 'L' ? 'low' : 'high') + ' in the ' + (h === 'N' ? 'north' : 'south') + ', air turns ' + (ccw ? 'counterclockwise' : 'clockwise') + ', so at a point due ' + DIRS[side] + ' of the center it moves toward the ' + bearingName(MA.atan2(tx, ty) * 180 / MA.PI) + '.',
        'It also slants ' + (sys === 'L' ? 'in toward' : 'out from') + ' the center, so it blows toward the ' + bearingName(toB) + ': a wind from the ' + from + '.'
      ], 'Sketch the circle of wind, then tilt it inward for a low or outward for a high.', { vk: 'point', vd: { _h: h, _s: sys, _side: side } });
    }
    function surfaceDir() {
      var h = R.pick(['N', 'S']), from = R.int(0, 7) * 45, al = R.pick([10, 15, 20, 25, 30, 35, 40, 12, 16, 22, 26, 28, 34, 38]), sf = ((from + (h === 'N' ? -al : al)) % 360 + 360) % 360;
      return pr('In the ' + (h === 'N' ? 'Northern' : 'Southern') + ' Hemisphere, the wind 2 km up blows along the isobars from ' + q(from, '°') + ' (a compass bearing: 0° is north, 90° east). Near the ground, friction turns the wind ' + q(al, '°') + ' toward the low. From what bearing does the surface wind blow?', numT(sf, 0.5), [
        'Aloft, the low is on the wind\'s ' + (h === 'N' ? 'left' : 'right') + '. Turning toward it ' + (h === 'N' ? 'swings the wind counterclockwise' : 'swings the wind clockwise') + ' on the compass.',
        'Surface wind: ' + nt(from) + '° ' + (h === 'N' ? '−' : '+') + ' ' + nt(al) + '° = ' + q(sf, '°') + (sf !== (h === 'N' ? from - al : from + al) ? ' (adjusted to between 0° and 360°)' : '') + '.'
      ], 'Which side of the wind is the low on?', { unit: '°', vk: 'surf', vd: { from: from, al: al, _h: h } });
    }
    function tfq() {
      var K = R.pick([
        ['In the Southern Hemisphere, surface air spirals clockwise into a low.', true, 'Moving air turns left there, which sets up a clockwise spin around a low.'],
        ['Near the ground, friction makes winds cross the isobars toward low pressure.', true, 'Friction slows the wind, weakening the Coriolis force, so the pressure push wins a little.'],
        ['In the Northern Hemisphere, air circles a high counterclockwise.', false, 'Around a northern high it moves clockwise and outward.'],
        ['Air spiraling into a low sinks toward the ground.', false, 'Converging air has nowhere to go but up, so it rises.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'North: counterclockwise into a low, clockwise out of a high.', { vk: 'concept' });
    }
    return lv(R, ctx, [rotation, weather, tfq, buys], [rotation, buys, surfaceDir, tfq], [pointWind, surfaceDir, buys]);
  });

  // ---------- g07_global.js ----------
  // ===================== Unit 7: The Global Circulation =====================
  G('weather.three-cells', function (R, ctx) {
    var BELTS = ['Rising air: a rainy belt of thunderstorms', 'Sinking air: a dry belt of high pressure and deserts', 'Rising air where westerlies meet polar air: a stormy, wet belt', 'Sinking cold air: a cold, dry polar high'];
    function belt() {
      var k = R.int(0, 3), lat = [R.int(0, 5), R.int(25, 33), R.int(55, 63), R.int(85, 90)][k], h = R.pick(['N', 'S']);
      return pr('In the three-cell picture of the global circulation, what usually lies near ' + (lat === 0 ? 'the equator' : lat + '° ' + h) + '?', mcK(BELTS[k], BELTS.filter(function (x, i) { return i !== k; })), [
        'Air rises near the equator and near 60°, and sinks near 30° and at the poles.',
        (lat === 0 ? 'The equator' : lat + '° ' + h) + ': ' + BELTS[k].toLowerCase() + '.'
      ], 'Rising near 0° and 60°; sinking near 30° and 90°.', { vk: 'belt', vd: { lat: lat } });
    }
    var WINDS = { tradeN: 'The northeast trade winds (from the northeast)', tradeS: 'The southeast trade winds (from the southeast)', westN: 'The westerlies (from the southwest and west)', westS: 'The westerlies (from the northwest and west)', polN: 'The polar easterlies (from the northeast)', polS: 'The polar easterlies (from the southeast)' };
    function wind() {
      var h = R.pick(['N', 'S']), lat = R.pick([R.int(8, 25), R.int(35, 55), R.int(65, 80)]), key = (lat < 30 ? 'trade' : lat < 60 ? 'west' : 'pol') + h;
      var all = Object.keys(WINDS).map(function (k) { return WINDS[k]; });
      return pr('What prevailing surface wind blows at ' + lat + '° ' + h + '?', mc(WINDS[key], R.sample(all.filter(function (x) { return x !== WINDS[key]; }), 3)), [
        lat < 30 ? 'Between 0° and 30°, surface air flows back toward the equator.' : lat < 60 ? 'Between 30° and 60°, surface air flows toward the pole.' : 'Beyond 60°, cold air flows away from the pole.',
        'The Coriolis effect turns it ' + (h === 'N' ? 'right' : 'left') + ': ' + WINDS[key].charAt(0).toLowerCase() + WINDS[key].slice(1) + '.'
      ], 'Which way does surface air flow in that cell, and which way is it turned?', { vk: 'wind', vd: { lat: lat, _h: h } });
    }
    function desert() {
      return pr('Why are the Sahara, Arabian and Australian deserts near 20° to 30° latitude so dry?', mc('Air sinks there, warming as it comes down, so clouds can\'t form', ['They are closer to the Sun than other places', 'The trade winds blow all the clouds to the poles', 'There is no water vapor at all in the air there']), [
        'Air that rose near the equator sinks around 30°.',
        'Sinking air warms by compression and its relative humidity drops, so it rarely rains.'
      ], 'Is the air there rising or sinking?', { vk: 'concept' });
    }
    function itcz() {
      var m = R.pick([['July', 'N'], ['August', 'N'], ['June', 'N'], ['January', 'S'], ['February', 'S'], ['December', 'S']]);
      var right = m[1] === 'N' ? 'North of the equator, following the high summer Sun' : 'South of the equator, following the high summer Sun';
      return pr('In ' + m[0] + ', where is the rainy belt of the Intertropical Convergence Zone, on average?', mcK(right, [m[1] === 'N' ? 'South of the equator, following the high summer Sun' : 'North of the equator, following the high summer Sun', 'Exactly on the equator all year', 'Near 30° latitude, over the deserts']), [
        'The ITCZ follows the latitude where the Sun is high, with a lag.',
        'In ' + m[0] + ' the Sun is high over the ' + (m[1] === 'N' ? 'Northern' : 'Southern') + ' Hemisphere: ' + right.split(',')[0].toLowerCase() + '.'
      ], 'Where is it summer in that month?', { vk: 'itcz', vd: { _m: m[1] } });
    }
    function sink() {
      var z = R.pick([8, 9, 10, 11]), t = R.pick([-35, -40, -45, -50]), zb = R.pick([1, 2]), T = t + 9.8 * (z - zb);
      return pr('In the sinking branch of the Hadley cell, air at ' + q(z, 'km') + ' and ' + q(t, '°C') + ' sinks to ' + q(zb, 'km') + ' without any condensation or evaporation. What is its temperature then? Use 9.8 °C per km.', numT(fix(T), 0.06), [
        'It sinks ' + nt(z - zb) + ' km and warms ' + nt(z - zb) + ' × 9.8 = ' + q(fix(9.8 * (z - zb)), '°C') + '.',
        nt(t) + ' + ' + nt(fix(9.8 * (z - zb))) + ' = ' + q(fix(T), '°C') + '. Warm and very dry: desert air.'
      ], 'Sinking air warms at the dry rate.', { unit: '°C', vk: 'sink', vd: { z: z, t: t, zb: zb } });
    }
    function tfq() {
      var K = R.pick([
        ['The great subtropical deserts are dry mainly because they are closer to the Sun.', false, 'They lie under sinking air near 30°; the equator gets more sunlight and is very wet.'],
        ['The trade winds blow toward the equator.', true, 'They are the surface return flow of the Hadley cell, turned by Coriolis.'],
        ['The westerlies blow between about 30° and 60° latitude.', true, 'They are the surface flow of the Ferrel cell, turned eastward by Coriolis.'],
        ['The rainy belt near the equator stays in the same place all year.', false, 'It follows the high Sun north and south with the seasons.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Rising air near 0° and 60°, sinking near 30°.', { vk: 'concept' });
    }
    return lv(R, ctx, [belt, wind, tfq], [wind, desert, itcz, belt, tfq], [sink, wind, itcz]);
  });

  G('weather.jet-stream', function (R, ctx) {
    function flight() {
      var d = R.pick([3000, 3600, 4200, 4800, 5400, 6000]), a = R.pick([800, 850, 900]), w = R.pick([100, 150, 200]), east = R.coin(), gs = east ? a + w : a - w, t = d / gs;
      return pr('A plane with an airspeed of ' + q(a, 'km/h') + ' flies ' + q(d, 'km') + (east ? ' eastward with' : ' westward against') + ' a ' + q(w, 'km/h') + ' jet-stream wind. How many hours does the trip take?', num(t, 0.01), [
        'Ground speed: ' + nt(a) + (east ? ' + ' : ' − ') + nt(w) + ' = ' + q(gs, 'km/h') + '.',
        'Time: ' + nt(d) + ' ÷ ' + nt(gs) + ' ≈ ' + q(rnd(t, 2), 'h') + '.'
      ], 'Add the wind when it is behind you; subtract it when it is ahead.', { unit: 'h', vk: 'flight', vd: { d: d, a: a, w: w } });
    }
    function saved() {
      var d = R.pick([3600, 4500, 5400]), a = R.pick([800, 900]), w = R.pick([100, 150]), diff = d / (a - w) - d / (a + w);
      return pr('A route of ' + q(d, 'km') + ' runs west to east. A plane flies at ' + q(a, 'km/h') + ' through a ' + q(w, 'km/h') + ' west wind. How many hours longer is the westbound trip than the eastbound one?', num(diff, 0.01), [
        'East: ' + nt(d) + ' ÷ ' + nt(a + w) + ' ≈ ' + q(rnd(d / (a + w), 2), 'h') + '. West: ' + nt(d) + ' ÷ ' + nt(a - w) + ' ≈ ' + q(rnd(d / (a - w), 2), 'h') + '.',
        'Difference ≈ ' + q(rnd(diff, 2), 'h') + '.'
      ], 'Work out both trip times.', { unit: 'h', vk: 'saved', vd: { d: d, a: a, w: w } });
    }
    function troughRidge() {
      var tr = R.coin(), reg = R.pick(['the eastern United States', 'Europe', 'the central United States', 'western Canada']);
      var right = tr ? 'Colder and often stormy, as polar air flows south under the trough' : 'Warmer and more settled, as warm air flows north under the ridge';
      return pr('The jet stream ' + (tr ? 'dips far south (a trough)' : 'bulges far north (a ridge)') + ' over ' + reg + '. What weather is likely there?', mcK(right, [tr ? 'Warmer and more settled, as warm air flows north under the ridge' : 'Colder and often stormy, as polar air flows south under the trough', 'No change: the jet is too high to matter', 'Calm winds and fog everywhere']), [
        'The jet marks the boundary between cold air (poleward) and warm air.',
        tr ? 'Under a trough the cold side reaches south: cold, with storms forming near the trough.' : 'Under a ridge the warm side reaches north: warm and settled.'
      ], 'Which side of the jet is cold?', { vk: 'concept' });
    }
    function winter() {
      return pr('Why is the polar jet stream usually fastest in winter?', mc('The temperature contrast between the tropics and the poles is greatest then', ['The air is thinner in winter', 'Earth spins faster in winter', 'Winter storms push the jet from behind']), [
        'The jet is a wind driven by the pressure difference that forms over a temperature contrast.',
        'In winter the poles are far colder while the tropics stay warm, so the contrast, and the jet, are strongest.'
      ], 'What sets the strength of the jet?', { vk: 'concept' });
    }
    function wavelength() {
      var lat = R.pick([40, 45, 50, 60]), cs = { 40: 0.766, 45: 0.707, 50: 0.643, 60: 0.5 }[lat], n = R.pick([3, 4, 5, 6]), L0 = 40075 * cs / n;
      return pr('The jet stream circles Earth near ' + lat + '° N in ' + n + ' waves. Earth\'s circumference at the equator is 40,075 km, and a circle of latitude is shorter by a factor of cos(latitude) (cos ' + lat + '° ≈ ' + cs + '). About how long is each wave (trough to trough)?', num(L0, 0.01), [
        'Length of the ' + lat + '° circle: 40,075 × ' + nt(cs) + ' ≈ ' + q(rnd(40075 * cs, 0), 'km') + '.',
        'Each of ' + n + ' waves: ' + nt(rnd(40075 * cs, 0)) + ' ÷ ' + n + ' ≈ ' + q(rnd(L0, 0), 'km') + '.'
      ], 'Find the length of the latitude circle, then divide by the number of waves.', { unit: 'km', vk: 'wave', vd: { lat: lat, n: n } });
    }
    function tfq() {
      var K = R.pick([
        ['The jet stream is a steady, straight band of wind.', false, 'It meanders in waves of troughs and ridges that steer storms.'],
        ['The polar jet stream blows generally from west to east.', true, 'It is part of the westerlies aloft, with low pressure (cold air) on its left in the north.'],
        ['Mid-latitude storms tend to form and travel along the jet stream.', true, 'The jet steers them, and its troughs help them grow.'],
        ['Flights from New York to Los Angeles usually take less time than the return trip.', false, 'Westbound flights fight the jet stream\'s headwind, so they usually take longer.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'A west-to-east wind that meanders.', { vk: 'concept' });
    }
    return lv(R, ctx, [flight, troughRidge, tfq], [flight, saved, winter, troughRidge], [wavelength, saved, flight]);
  });

  G('weather.enso', function (R, ctx) {
    var PH = ['El Niño', 'La Niña', 'Neutral'];
    function phaseOf(a) { return a >= 0.5 ? 'El Niño' : a <= -0.5 ? 'La Niña' : 'Neutral'; }
    function anomaly() {
      var nrm = R.int(260, 280) / 10, a = R.pick([-1.6, -1.2, -0.9, -0.7, -0.3, 0.2, 0.4, 0.8, 1.1, 1.5, 2.1]), v = fix(nrm + a);
      return pr('In one season the Niño 3.4 region of the Pacific averages ' + q(v, '°C') + '. Its normal for that season is ' + q(nrm, '°C') + '. What is the anomaly?', numT(a, 0.051), [
        'Anomaly = value − normal = ' + nt(v) + ' − ' + nt(nrm) + ' = ' + sgn(a, '°C') + '.'
      ], 'Subtract the normal from the value.', { unit: '°C', vk: 'anom', vd: { v: v, nrm: nrm } });
    }
    function classify() {
      var a = R.pick([-2.1, -1.4, -1.0, -0.8, -0.6, -0.3, -0.1, 0.1, 0.3, 0.6, 0.9, 1.3, 1.8, 2.4]), right = phaseOf(a);
      return pr('NOAA calls it El Niño when the Niño 3.4 anomaly is +0.5 °C or more, and La Niña at −0.5 °C or less (each lasting several months). A season\'s anomaly is ' + sgn(a, '°C') + '. Which phase does it point to?', mcK(right, PH.filter(function (x) { return x !== right; })), [
        'Compare ' + sgn(a, '°C') + ' with +0.5 °C and −0.5 °C.',
        'It points to ' + right + (right === 'Neutral' ? ': between the thresholds.' : ' conditions, if they last.')
      ], 'Compare with ±0.5 °C.', { vk: 'classify', vd: { _a: a } });
    }
    function avg3() {
      var b = R.pick([-1, 1]) * R.int(3, 12) / 10, m = [fix(b + R.int(-3, 3) / 10), fix(b + R.int(-3, 3) / 10), fix(b + R.int(-3, 3) / 10)], av = (m[0] + m[1] + m[2]) / 3;
      if (MA.abs(MA.abs(av) - 0.5) < 0.03) { m[2] = fix(m[2] + 0.2 * MA.sign(av)); av = (m[0] + m[1] + m[2]) / 3; }
      return pr('Three monthly Niño 3.4 anomalies are ' + m.map(function (x) { return sgn(x, '°C'); }).join(', ') + '. What is their three-month average? (Round to two decimal places.)', numT(rnd(av, 3), 0.006), [
        'Sum: ' + m.map(function (x) { return '(' + nt(x) + ')'; }).join(' + ') + ' = ' + nt(fix(m[0] + m[1] + m[2])) + ' °C.',
        'Average: ' + nt(fix(m[0] + m[1] + m[2])) + ' ÷ 3 ≈ ' + sgn(rnd(av, 2), '°C') + ', which points to ' + phaseOf(av) + (phaseOf(av) === 'Neutral' ? ' conditions.' : ' conditions.')
      ], 'Add the three anomalies, then divide by 3.', { unit: '°C', vk: 'avg', vd: { a: m[0], b: m[1], c: m[2] } });
    }
    function effects() {
      var K = R.pick([
        ['During El Niño, what happens to the Pacific trade winds?', 'They weaken, letting warm water spread east', ['They strengthen, piling warm water in the west', 'They reverse and blow from the north', 'Nothing: El Niño is only in the ocean']],
        ['During La Niña, the eastern tropical Pacific is', 'cooler than normal, with stronger upwelling', ['warmer than normal', 'covered by the heaviest tropical rain', 'unchanged']],
        ['During El Niño, the heaviest tropical Pacific rain', 'shifts east toward the central and eastern Pacific', ['shifts west to Indonesia', 'stops everywhere', 'moves to the poles']],
        ['In a normal (neutral) year, the warmest tropical Pacific water lies', 'in the west, pushed there by the trade winds', ['off the coast of Peru', 'evenly across the whole Pacific', 'near the North Pole']]
      ]);
      return pr(K[0] + (K[0].slice(-1) === '?' ? '' : '…'), mc(K[1], K[2]), ['The trade winds push warm surface water west; El Niño weakens them, La Niña strengthens them.', 'Answer: ' + K[1] + '.'], 'Start with what the trade winds do.', { vk: 'concept' });
    }
    function episode() {
      var len = R.int(3, 8), base = R.pick([0.6, 0.8, 1.0, -0.6, -0.8, -1.1]), sgn0 = base > 0 ? 1 : -1, vals = [], i;
      vals.push(fix(sgn0 * R.int(0, 3) / 10));
      for (i = 0; i < len; i++) vals.push(fix(base + sgn0 * R.int(0, 6) / 10));
      vals.push(fix(sgn0 * R.int(0, 4) / 10));
      var run = 0, best = 0; vals.forEach(function (v) { if (sgn0 > 0 ? v >= 0.5 : v <= -0.5) { run++; best = MA.max(best, run); } else run = 0; });
      var name = sgn0 > 0 ? 'El Niño' : 'La Niña', yes = best >= 5;
      var right = yes ? 'Yes: at least five overlapping seasons in a row pass the threshold' : 'No: fewer than five seasons in a row pass the threshold';
      return pr('NOAA counts an ' + name + ' episode when the three-month Niño 3.4 anomaly (the Oceanic Niño Index) is ' + (sgn0 > 0 ? '+0.5 °C or more' : '−0.5 °C or less') + ' for at least five overlapping seasons in a row. Consecutive values are: ' + vals.map(function (x) { return sgn(x, '°C'); }).join(', ') + '. Was this an ' + name + ' episode?', mcK(right, [yes ? 'No: fewer than five seasons in a row pass the threshold' : 'Yes: at least five overlapping seasons in a row pass the threshold', 'Yes: one season past the threshold is enough', 'You can\'t tell without the rainfall']), [
        'Count the longest run of values ' + (sgn0 > 0 ? 'at or above +0.5' : 'at or below −0.5') + ' °C: ' + best + '.',
        best >= 5 ? 'Five or more: an episode.' : 'Fewer than five: not an episode, just a brief excursion.'
      ], 'Count the longest unbroken run past the threshold.', { vk: 'episode', vd: { _v: vals, _s: sgn0 } });
    }
    function tfq() {
      var K = R.pick([
        ['El Niño causes every unusual storm that happens during an El Niño year.', false, 'It shifts the odds of certain patterns in certain regions; it doesn\'t cause any single storm.'],
        ['El Niño and La Niña recur irregularly, about every 2 to 7 years.', true, 'The ocean and the trade winds push each other back and forth.'],
        ['In El Niño, the trade winds across the tropical Pacific are stronger than normal.', false, 'They weaken; in La Niña they strengthen.'],
        ['A positive Niño 3.4 anomaly of +1.2 °C points toward El Niño conditions.', true, 'It is above the +0.5 °C threshold.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'ENSO tilts the odds; it doesn\'t decide each storm.', { vk: 'concept' });
    }
    return lv(R, ctx, [anomaly, classify, tfq], [avg3, classify, effects, tfq], [episode, avg3, effects]);
  });

  // ---------- g08_fronts.js ----------
  // ===================== Unit 8: Air Masses, Fronts and Weather Maps =====================
  function pcode(h) { var t = MA.round(h * 10) % 1000; return ('00' + t).slice(-3); }
  function pdec(c) { var v = parseInt(c, 10); return v >= 500 ? 900 + v / 10 : 1000 + v / 10; }
  G('weather.station-model', function (R, ctx) {
    function decode() {
      var h = R.int(9600, 10450) / 10, c = pcode(h);
      return pr('A station model shows the pressure code ' + c + '. What is the sea-level pressure in hPa?', num(h, 0.00005), [
        'Put a decimal point before the last digit: ' + c.slice(0, 2) + '.' + c.slice(2) + '.',
        (parseInt(c, 10) >= 500 ? 'The code is 500 or more, so put 9 in front' : 'The code is below 500, so put 10 in front') + ': ' + q(h, 'hPa', 1) + '.'
      ], 'Codes of 500 or more start with 9; below 500, with 10.', { unit: 'hPa', vk: 'decode', vd: { _c: c } });
    }
    function encode() {
      var h = R.int(9600, 10450) / 10, c = pcode(h);
      return pr('A station measures a sea-level pressure of ' + q(h, 'hPa', 1) + '. What three-digit code is plotted on its station model?', { t: 'num', v: String(parseInt(c, 10)) }, [
        'Write the pressure in tenths: ' + nt(MA.round(h * 10)).replace(/,/g, '') + '.',
        'Keep the last three digits: ' + c + '.'
      ], 'Drop the decimal point and keep the last three digits.', { vk: 'encode', vd: { h: h } });
    }
    function barbs() {
      var pn = R.pick([0, 0, 1, 1, 2]), fl = R.int(0, 4), hf = R.int(0, 1); if (pn + fl + hf === 0) fl = 2;
      var parts = []; if (pn) parts.push(pn + ' pennant' + (pn > 1 ? 's' : '')); if (fl) parts.push(fl + ' full barb' + (fl > 1 ? 's' : '')); if (hf) parts.push('1 half barb');
      var kt = 50 * pn + 10 * fl + 5 * hf;
      return pr('A wind barb has ' + U.list(parts) + '. What is the wind speed in knots?', num(kt, 0.0001), [
        'Pennant = 50 kt, full barb = 10 kt, half barb = 5 kt.',
        (pn ? pn + ' × 50' : '') + (pn && (fl || hf) ? ' + ' : '') + (fl ? fl + ' × 10' : '') + (fl && hf ? ' + ' : '') + (hf ? '5' : '') + ' = ' + q(kt, 'kt') + ' (about ' + q(MA.round(kt * 1.15078), 'mph') + ').'
      ], 'Add 50 for each pennant, 10 for each full barb and 5 for a half barb.', { unit: 'kt', vk: 'barbs', vd: { pn: pn, fl: fl, hf: hf } });
    }
    function tendency() {
      var now = R.int(9800, 10300) / 10, ch = R.pick([-1, 1]) * R.int(5, 35), prev = fix(now - ch / 10);
      return pr('A station reads ' + q(now, 'hPa', 1) + ', and its pressure-change entry is ' + (ch > 0 ? '+' : '−') + MA.abs(ch) + ' (tenths of a hectopascal over the last 3 hours). What was the pressure 3 hours ago?', num(prev, 0.00005), [
        'The change is ' + sgn(ch / 10, 'hPa') + ' over 3 hours.',
        '3 hours ago: ' + nt(now) + ' − (' + nt(ch / 10) + ') = ' + q(prev, 'hPa', 1) + '.' + (ch < 0 ? ' Falling pressure often means a low is approaching.' : '')
      ], 'The entry is in tenths of a hectopascal.', { unit: 'hPa', vk: 'tend', vd: { now: now, _ch: ch } });
    }
    function cover() {
      var k = R.pick([0, 2, 4, 6, 8]), name = { 0: 'Clear', 2: 'About 2/8 of the sky covered (few clouds)', 4: 'About half the sky covered (scattered clouds)', 6: 'About 6/8 covered (broken clouds)', 8: 'Overcast' }[k];
      var fill = { 0: 'empty', 2: 'one quarter filled in', 4: 'half filled in', 6: 'three quarters filled in', 8: 'completely filled in' }[k];
      var all = ['Clear', 'About 2/8 of the sky covered (few clouds)', 'About half the sky covered (scattered clouds)', 'About 6/8 covered (broken clouds)', 'Overcast'];
      return pr('A station circle is ' + fill + '. What does it say about the sky?', mc(name, R.sample(all.filter(function (x) { return x !== name; }), 3)), ['The filled fraction of the circle is the fraction of sky covered, in eighths.', 'Answer: ' + name.toLowerCase() + '.'], 'Filled fraction = sky covered.', { vk: 'concept' });
    }
    function picture() {
      var T = R.int(25, 90), Td = T - R.int(2, 20), h = R.int(9850, 10350) / 10, dirI = R.int(0, 7), kt = R.pick([5, 10, 15, 20, 25, 30, 35, 55, 65]), st = { T: T, Td: Td, p: h, tend: R.pick([-2.1, -1.2, 0.6, 1.5]), dir: dirI * 45, kt: kt, cover: R.pick([0, 2, 4, 6, 8]), wx: 'none' };
      var ask = R.int(0, 2), viz = { name: 'es-weather-map', opts: { mode: 'station', station: st, quiet: true, lock: true } };
      if (ask === 0) return pr('Read the station model. What is the sea-level pressure, in hPa?', num(h, 0.00005), ['The code at the upper right is ' + pcode(h) + '.', (parseInt(pcode(h), 10) >= 500 ? 'Code 500 or more: put 9 in front' : 'Code below 500: put 10 in front') + ' of ' + pcode(h).slice(0, 2) + '.' + pcode(h).slice(2) + ': ' + q(h, 'hPa', 1) + '.'], 'Decode the three digits at the upper right.', { unit: 'hPa', vk: 'pic-p', vd: { _h: h }, viz: viz });
      if (ask === 1) return pr('Read the station model. What is the wind speed, in knots?', num(kt, 0.0001), ['Count the feathers on the barb: pennants are 50, full barbs 10, half barbs 5.', 'Total: ' + q(kt, 'kt') + '.'], 'Add up the pennants and barbs.', { unit: 'kt', vk: 'pic-kt', vd: { _kt: kt }, viz: viz });
      var from = C8[dirI];
      return pr('Read the station model. From which direction does the wind blow? (North is up.)', mc('From the ' + from, R.sample(C8.filter(function (c) { return c !== from; }), 3).map(function (c) { return 'From the ' + c; })), ['The staff points toward where the wind comes from.', 'It points ' + from + ': a wind from the ' + from + '.'], 'The staff points into the wind.', { vk: 'pic-dir', vd: { _d: dirI }, viz: viz });
    }
    function spread() {
      var T = R.int(30, 95), Td = T - R.int(0, 25);
      return pr('A station model shows ' + T + ' at the upper left and ' + Td + ' at the lower left (°F). What is the temperature–dew point spread?', num(T - Td, 0.0001), ['Upper left is the temperature, lower left the dew point.', 'Spread: ' + T + ' − ' + Td + ' = ' + q(T - Td, '°F') + (T - Td <= 2 ? ': nearly saturated; fog is possible.' : '.')], 'Temperature minus dew point.', { unit: '°F', vk: 'spread', vd: { T: T, Td: Td } });
    }
    return lv(R, ctx, [decode, barbs, spread, cover], [decode, encode, tendency, picture], [picture, tendency, encode]);
  });

  G('weather.air-mass-modification', function (R, ctx) {
    var AM = [['cP', 'Cold and dry', 'northern Canada in winter'], ['cA', 'Very cold and dry', 'the Arctic in winter'], ['mP', 'Cool and humid', 'the North Pacific or North Atlantic'], ['mT', 'Warm and humid', 'the Gulf of Mexico'], ['cT', 'Hot and dry', 'the deserts of northern Mexico in summer']];
    function code() {
      var a = R.pick(AM);
      return pr('An air mass formed over ' + a[2] + '. What is its two-letter code?', mc(a[0], AM.filter(function (x) { return x[0] !== a[0]; }).map(function (x) { return x[0]; })), [
        'c = continental (over land, dry), m = maritime (over water, humid); P = polar, T = tropical, A = arctic.',
        a[2] + ': ' + a[0] + ' (' + a[1].toLowerCase() + ').'
      ], 'Land or water? Cold or warm?', { vk: 'concept' });
    }
    function props() {
      var a = R.pick(AM);
      return pr('What are the typical properties of a ' + a[0] + ' air mass?', mc(a[1], AM.filter(function (x) { return x[0] !== a[0] && x[1] !== a[1]; }).map(function (x) { return x[1]; }).slice(0, 3)), [
        'First letter: c dry (continental), m humid (maritime). Second: P cold, A very cold, T warm.',
        a[0] + ': ' + a[1].toLowerCase() + '.'
      ], 'Decode each letter.', { vk: 'concept' });
    }
    function lake() {
      var tl = R.int(2, 10), t8 = -R.int(4, 20), d = tl - t8;
      if (MA.abs(d - 13) < 1) { t8 -= 3; d = tl - t8; }
      var yes = d >= 13;
      return pr('A lake\'s surface is ' + q(tl, '°C') + ' and the air at 850 hPa (about 1.5 km up) is ' + q(t8, '°C') + '. Forecasters expect lake-effect snow when the lake is at least 13 °C warmer than the 850 hPa air. How much warmer is the lake?', num(d, 0.0001), [
        'Difference: ' + nt(tl) + ' − (' + nt(t8) + ') = ' + q(d, '°C') + '.',
        d >= 13 ? 'That is at least 13 °C: lake-effect snow is likely downwind.' : 'That is less than 13 °C: the air is probably not unstable enough for lake-effect snow.'
      ], 'Subtract the 850 hPa temperature from the lake temperature.', { unit: '°C', vk: 'lake', vd: { tl: tl, t8: t8 } });
    }
    function lapse() {
      var tl = R.int(3, 9), t8 = -R.int(8, 18), g = (tl - t8) / 1.5;
      return pr('Air just above a lake is heated to the lake\'s ' + q(tl, '°C') + ', while the air 1.5 km up is ' + q(t8, '°C') + '. At what rate does the temperature fall with height in this layer, in °C per km? (Compare it with the dry rate, 9.8 °C per km.)', num(g, 0.01), [
        'Drop: ' + nt(tl) + ' − (' + nt(t8) + ') = ' + q(tl - t8, '°C') + ' over 1.5 km.',
        'Rate: ' + nt(tl - t8) + ' ÷ 1.5 ≈ ' + q(rnd(g, 1), '°C/km') + (g > 9.8 ? ', faster than 9.8: absolutely unstable, so snow showers boil up.' : ', between the moist and dry rates: unstable once saturated.')
      ], 'Temperature difference divided by the height.', { unit: '°C/km', vk: 'lapse', vd: { tl: tl, t8: t8 } });
    }
    function shore() {
      var w = R.pick([['northwest', 'southeast'], ['west', 'east'], ['north', 'south'], ['southwest', 'northeast']]);
      var lake0 = R.pick(['Lake Erie', 'Lake Ontario', 'Lake Michigan', 'Lake Superior', 'a large lake']);
      return pr('A cold ' + w[0] + ' wind blows across ' + lake0 + ' in early winter. Which shore is most likely to get lake-effect snow?', mc('The ' + w[1] + ' shore', C8.filter(function (c) { return c !== w[1] && c !== w[0]; }).slice(0, 3).map(function (c) { return 'The ' + c + ' shore'; })), [
        'The air gains heat and moisture crossing the water and drops snow when it reaches land downwind.',
        'A ' + w[0] + ' wind blows toward the ' + w[1] + ': the ' + w[1] + ' shore.'
      ], 'Where does the wind blow toward?', { vk: 'shore', vd: { _w: w[0] } });
    }
    function change() {
      var K = R.pick([
        ['Frigid air flows over a lake that is much warmer than it. How does the air change?', 'It warms and gains moisture from below and becomes unstable', ['It cools from below and becomes more stable', 'It loses moisture to the lake', 'It does not change, because air masses keep their properties']],
        ['Warm, humid air flows over cold ground or cold water. What often forms?', 'Fog or low stratus, because the air is chilled from below and becomes stable', ['Towering thunderstorms', 'Lake-effect snow', 'A hot, dry wind']],
        ['Arctic air reaches Florida after several days over warmer land. Compared with when it left Canada, it is', 'warmer, because it was heated from below on the way', ['colder, because cold air gets colder as it travels', 'exactly the same', 'more humid, because it crossed the Rockies']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['An air mass is changed from below by the surface it crosses.', 'Answer: ' + K[1] + '.'], 'Is the bottom of the air being heated or cooled?', { vk: 'concept' });
    }
    return lv(R, ctx, [code, props, change], [lake, shore, change, code], [lapse, lake, shore]);
  });

  G('weather.cold-fronts', function (R, ctx) {
    function arrive() {
      var d = R.pick([60, 90, 120, 150, 180, 240, 300, 70, 80, 100, 200, 250]), v = R.pick([20, 25, 30, 40, 50, 60, 22, 28, 36, 44, 52, 58]), t = d / v;
      return pr('A cold front is ' + q(d, 'km') + ' west of a town and moving east at ' + q(v, 'km/h') + '. In how many hours will it reach the town?', num(t, 0.01), ['Time = distance ÷ speed = ' + nt(d) + ' ÷ ' + nt(v) + '.', '= ' + q(rnd(t, 2), 'h') + '.'], 'Divide the distance by the speed.', { unit: 'h', vk: 'arrive', vd: { d: d, v: v } });
    }
    function after() {
      var K = R.pick([
        ['A cold front has just passed a town in Kansas. What change is most likely?', 'The temperature and dew point drop, the pressure rises and the wind shifts to the northwest', ['The temperature rises and the wind shifts to the south', 'Steady rain begins and lasts all day', 'The pressure keeps falling for a day']],
        ['Which is the surest sign that a cold front has passed?', 'A sharp drop in the dew point with a shift to northwest winds', ['A thin veil of cirrus with a halo', 'Rising humidity and south winds', 'A slow rise in temperature']],
        ['What weather usually comes right along a cold front?', 'A narrow band of showers and thunderstorms', ['A wide band of light, steady rain hundreds of kilometers ahead', 'Fog and drizzle for days', 'Clear skies and calm winds']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Cold air plows under warm air and lifts it sharply; cold, dry, dense air follows.', 'Answer: ' + K[1] + '.'], 'What kind of air arrives behind the front?', { vk: 'concept' });
    }
    function depth() {
      var k = R.pick([50, 60, 80, 100, 70, 90]), d = R.pick([50, 100, 150, 200, 240, 300, 60, 70, 80, 90, 120, 250]), h = d / k;
      return pr('A cold front slopes 1 km up for every ' + q(k, 'km') + ' of horizontal distance. How deep is the cold air ' + q(d, 'km') + ' behind the front at the ground?', num(h, 0.01), ['Height = distance ÷ ' + k + ' = ' + nt(d) + ' ÷ ' + nt(k) + '.', '≈ ' + q(rnd(h, 2), 'km') + '.'], 'Use the slope: 1 km up per ' + k + ' km across.', { unit: 'km', vk: 'depth', vd: { k: k, d: d } });
    }
    function record() {
      var t0 = R.int(24, 32), h0 = R.pick([1, 2, 3]), hp = h0 + R.pick([2, 3, 4]), rows = [], i;
      for (i = 0; i <= 6; i++) {
        var hr = h0 + i, after = hr >= hp, T = after ? t0 - R.int(8, 12) + (hr - hp) * 0 : t0 - (i === 0 ? 0 : R.int(0, 1)), Td = after ? T - R.int(8, 12) : t0 - R.int(5, 7), w = after ? 'NW' : (hr >= hp - 1 ? 'SW' : 'S'), pP = after ? 1004 + (hr - hp) * 2 : 1006 - (hr - h0);
        rows.push([hr + ' p.m.', q(T, '°C'), q(Td, '°C'), w, q(pP, 'hPa')]);
      }
      return pr('A station\'s hourly record is below. At what hour (p.m.) is the first report taken after the cold front passed?' + table(['Time', 'Temperature', 'Dew point', 'Wind from', 'Pressure'], rows),  num(hp, 0.0001), [
        'Look for the sudden change: temperature and dew point drop, the wind turns northwest, and the pressure starts rising.',
        'That first appears at ' + hp + ' p.m.'
      ], 'Find the first report with the wind from the northwest and a sharp drop in dew point.', { vk: 'record', vd: { _hp: hp } });
    }
    function symbol() {
      return pr('On a weather map, how is a cold front drawn?', mc('A blue line with triangles pointing the way it moves', ['A red line with half circles pointing the way it moves', 'A purple line with triangles and half circles on the same side', 'Alternating red half circles and blue triangles on opposite sides']), ['Cold front: blue with triangles. Warm: red with half circles. Occluded: purple with both on one side. Stationary: red and blue, on opposite sides.', 'Answer: a blue line with triangles.'], 'Cold is blue.', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['After a cold front passes, the weather usually turns warmer and more humid.', false, 'Cold, dry air arrives behind it: the temperature and dew point fall.'],
        ['A cold front is steeper than a warm front.', true, 'Dense cold air wedges under the warm air, and friction steepens the front.'],
        ['The pressure usually reaches its lowest as a cold front arrives and rises after it passes.', true, 'The front lies in a trough of low pressure; dense cold air follows.'],
        ['Cold fronts usually bring a wide band of gentle rain that lasts for a day or more.', false, 'That is typical of warm fronts; cold fronts bring a narrow band of heavy showers.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Cold, dry, dense air follows a cold front.', { vk: 'concept' });
    }
    return lv(R, ctx, [arrive, after, symbol, tfq], [arrive, depth, after, tfq], [record, depth, arrive]);
  });

  G('weather.warm-fronts', function (R, ctx) {
    function ahead() {
      var k = R.pick([150, 200, 250, 300]), h = R.pick([3, 4, 6, 8, 9, 5, 7]), d = h * k;
      return pr('A warm front slopes 1 km up for every ' + q(k, 'km') + '. How far ahead of the front at the ground is the frontal surface ' + q(h, 'km') + ' up?', num(d, 0.01), ['Distance = height × ' + k + ' = ' + nt(h) + ' × ' + nt(k) + '.', '= ' + q(d, 'km') + '. High clouds can arrive that far ahead of the front.'], 'Each kilometer up is ' + k + ' km ahead.', { unit: 'km', vk: 'ahead', vd: { k: k, h: h } });
    }
    function when() {
      var d = R.pick([300, 450, 600, 750, 900, 1200, 350, 400, 500, 700, 800, 1000]), v = R.pick([15, 20, 25, 30, 16, 21, 24, 29]), t = d / v;
      return pr('Cirrostratus clouds spread over a town while the warm front is ' + q(d, 'km') + ' away, moving toward it at ' + q(v, 'km/h') + '. About how many hours until the front passes the town?', num(t, 0.01), ['Time = ' + nt(d) + ' ÷ ' + nt(v) + ' = ' + q(rnd(t, 1), 'h') + '.'], 'Distance divided by speed.', { unit: 'h', vk: 'when', vd: { d: d, v: v } });
    }
    function order() {
      var right = 'Cirrus, cirrostratus, altostratus, nimbostratus';
      return pr('A warm front is approaching. In what order do the clouds usually arrive?', mcK(right, ['Nimbostratus, altostratus, cirrostratus, cirrus', 'Cumulus, cumulonimbus, stratus, cirrus', 'Altostratus, cirrus, nimbostratus, cirrostratus']), ['The frontal surface slopes gently, so its highest part arrives first.', 'High to low: ' + right.toLowerCase() + ', with steady rain from the nimbostratus.'], 'The highest clouds come first.', { vk: 'concept' });
    }
    function passage() {
      var K = R.pick([
        ['A warm front has just passed a town in Ohio. What change is most likely?', 'Warmer, more humid air, with the wind shifting to the south or southwest', ['Colder, drier air with northwest winds', 'A narrow line of severe storms', 'Falling temperatures and snow']],
        ['Why does steady rain often fall for many hours ahead of a warm front?', 'Warm air rises slowly over a wide area along the gentle frontal slope', ['A narrow wall of cold air lifts the air sharply', 'The warm air sinks and dries', 'The cold air rises over the warm air']],
        ['How does warm air move at a warm front?', 'It glides up over the denser cold air, which slowly retreats', ['It pushes the cold air away along the ground', 'It sinks under the cold air', 'It stops and lets the cold air pass']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['At a warm front, warm air rides up a gentle ramp of cold air.', 'Answer: ' + K[1] + '.'], 'Which air is denser, and where does it stay?', { vk: 'concept' });
    }
    function compare() {
      var kc = R.pick([60, 80, 100, 62, 78, 98]), kw = R.pick([200, 250, 300]), d = R.pick([300, 400, 600, 350, 500]), diff = d / kc - d / kw;
      return pr('A cold front slopes 1 km per ' + q(kc, 'km') + ' and a warm front 1 km per ' + q(kw, 'km') + '. At ' + q(d, 'km') + ' from each front (into the cold air), how much higher is the cold front\'s surface than the warm front\'s?', num(diff, 0.01), [
        'Cold front: ' + nt(d) + ' ÷ ' + nt(kc) + ' = ' + q(rnd(d / kc, 2), 'km') + '. Warm front: ' + nt(d) + ' ÷ ' + nt(kw) + ' = ' + q(rnd(d / kw, 2), 'km') + '.',
        'Difference ≈ ' + q(rnd(diff, 2), 'km') + ': the cold front is much steeper.'
      ], 'Find each height, then subtract.', { unit: 'km', vk: 'cmp', vd: { kc: kc, kw: kw, d: d } });
    }
    function symbol() {
      return pr('On a weather map, how is a warm front drawn?', mc('A red line with half circles on the side it moves toward', ['A blue line with triangles on the side it moves toward', 'A purple line with triangles and half circles on the same side', 'Alternating red half circles and blue triangles on opposite sides']), ['Warm front: red with half circles pointing the way it moves.', 'Answer: a red line with half circles.'], 'Warm is red.', { vk: 'concept' });
    }
    return lv(R, ctx, [order, symbol, when], [ahead, when, passage, order], [compare, ahead, passage]);
  });

  G('weather.midlatitude-cyclones', function (R, ctx) {
    function order() {
      var right = 'Kink on a stationary front → open wave → occlusion → the low fills and fades';
      return pr('Put the life of a mid-latitude cyclone in order.', mcK(right, ['Occlusion → kink on a stationary front → open wave → the low fills and fades', 'Open wave → the low fills and fades → kink on a stationary front → occlusion', 'Kink on a stationary front → occlusion → open wave → the low fills and fades']), ['Birth on a stationary front, growth as an open wave with a warm sector, occlusion late in life, then decay.', right + '.'], 'Occlusion comes late.', { vk: 'concept' });
    }
    function occl() {
      var K = R.pick([
        ['What does an occluded front on a map tell you about a storm?', 'It is mature or old: the cold front has caught the warm front, and the low will soon weaken', ['It is just forming', 'It is a new cold front moving in', 'It is stationary and won\'t move']],
        ['Why does a mid-latitude cyclone occlude?', 'The cold front usually moves faster than the warm front and catches it', ['The warm front speeds up and catches the cold front', 'The jet stream stops blowing', 'The low runs out of cold air']],
        ['How is an occluded front drawn on a weather map?', 'A purple line with triangles and half circles on the same side', ['A blue line with triangles', 'A red line with half circles', 'Red half circles and blue triangles on opposite sides']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Occlusion happens late, when the faster cold front catches the warm front.', 'Answer: ' + K[1] + '.'], 'Which front is faster?', { vk: 'concept' });
    }
    function catchup() {
      var vc = R.pick([35, 40, 45, 50, 36, 41, 44, 49]), vw = R.pick([20, 25, 30, 21, 26, 29]), gap = R.pick([300, 450, 600, 750, 350, 400, 500, 700]), t = gap / (vc - vw);
      return pr('A storm\'s cold front moves at ' + q(vc, 'km/h') + ' and its warm front at ' + q(vw, 'km/h') + ', in the same direction, ' + q(gap, 'km') + ' apart. In about how many hours does the cold front catch up (occlusion)?', num(t, 0.01), ['The gap closes at ' + nt(vc) + ' − ' + nt(vw) + ' = ' + q(vc - vw, 'km/h') + '.', 'Time: ' + nt(gap) + ' ÷ ' + nt(vc - vw) + ' = ' + q(rnd(t, 1), 'h') + '.'], 'How fast is the gap closing?', { unit: 'h', vk: 'catch', vd: { vc: vc, vw: vw, gap: gap } });
    }
    function travel() {
      var v = R.pick([30, 35, 40, 45, 50, 31, 36, 41, 44, 49]), dys = R.pick([2, 3, 4]), d = v * 24 * dys;
      return pr('A mid-latitude low travels east at ' + q(v, 'km/h') + ' for ' + dys + ' days. How far does it go?', num(d, 0.01), ['Hours: ' + dys + ' × 24 = ' + (24 * dys) + '.', 'Distance: ' + nt(v) + ' × ' + (24 * dys) + ' = ' + q(d, 'km') + ': across much of a continent in its lifetime.'], 'Change days to hours.', { unit: 'km', vk: 'travel', vd: { v: v, dys: dys } });
    }
    function jet() {
      return pr('How does the jet stream help a surface low deepen?', mc('Air spreading apart aloft, ahead of a jet-stream trough, pulls air up from below the low', ['The jet blows the low\'s clouds away', 'The jet pushes cold air down into the low', 'The jet adds water vapor to the low']), ['If air spreads out aloft faster than it flows in near the ground, the surface pressure falls.', 'Divergence aloft ahead of a trough lifts air from below and deepens the low.'], 'What happens if air leaves the top of the column?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['An occluded front means a new storm is just forming.', false, 'Occlusion comes late in a storm\'s life.'],
        ['A mid-latitude cyclone usually lives a few days.', true, 'It grows, matures, occludes and fills over a few days.'],
        ['A mid-latitude cyclone has a warm front and a cold front attached to its low.', true, 'They are the two arms of the same storm.'],
        ['Warm fronts usually move faster than cold fronts.', false, 'Cold fronts usually move faster, which is why occlusion happens.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Occlusion is old age.', { vk: 'concept' });
    }
    return lv(R, ctx, [occl, travel, tfq], [order, catchup, occl, tfq], [catchup, jet, travel]);
  });

  G('weather.surface-maps', function (R, ctx) {
    function isobar() {
      var c = R.int(245, 252) * 4, n = R.int(1, 4), lo = R.coin(), v = lo ? c + 4 * n : c - 4 * n;
      return pr('The innermost isobar around a ' + (lo ? 'low' : 'high') + ' is ' + q(c, 'hPa') + '. Isobars are drawn every 4 hPa. A town lies ' + n + ' isobar' + (n > 1 ? 's' : '') + ' farther out. About what is the pressure at the town?', num(v, 0.0001), [
        'Moving outward from a ' + (lo ? 'low, pressure rises' : 'high, pressure falls') + ' 4 hPa per isobar.',
        nt(c) + (lo ? ' + ' : ' − ') + n + ' × 4 = ' + q(v, 'hPa') + '.'
      ], 'Which way does pressure change as you move away from the center?', { unit: 'hPa', vk: 'isobar', vd: { c: c, n: n } });
    }
    function eta() {
      var d = R.pick([400, 500, 600, 800, 900, 1000, 1200, 700]), v = R.pick([30, 40, 50, 31, 39, 49]), t = d / v;
      return pr('A low is ' + q(d, 'km') + ' west of a city and moving east at ' + q(v, 'km/h') + '. In about how many hours will it reach the city\'s longitude?', num(t, 0.01), ['Time = ' + nt(d) + ' ÷ ' + nt(v) + ' = ' + q(rnd(t, 1), 'h') + '.'], 'Distance divided by speed.', { unit: 'h', vk: 'eta', vd: { d: d, v: v } });
    }
    function fall() {
      var g = R.pick([1, 2, 3, 4]), v = R.pick([25, 40, 50, 60, 27, 37, 49, 59]), hrs = R.pick([3, 6]), r0 = g * v / 100, tot = r0 * hrs;
      return pr('Ahead of an approaching low, the pressure rises ' + q(g, 'hPa') + ' for every 100 km toward the east, and the pattern moves east at ' + q(v, 'km/h') + ' without changing. By how much does a town\'s pressure fall in ' + hrs + ' hours?', num(tot, 0.01), [
        'Each hour the pattern moves ' + nt(v) + ' km, so the town sees ' + nt(v) + '/100 × ' + nt(g) + ' = ' + q(fix(r0), 'hPa') + ' less pressure per hour.',
        'In ' + hrs + ' hours: ' + nt(fix(r0)) + ' × ' + hrs + ' = ' + q(fix(tot), 'hPa') + '.'
      ], 'How far does the pattern move each hour, and how much does pressure change over that distance?', { unit: 'hPa', vk: 'fall', vd: { g: g, v: v, hrs: hrs } });
    }
    function windAt() {
      var side = R.int(0, 3), names = ['north', 'east', 'south', 'west'], ans = ['From the northeast', 'From the southeast', 'From the southwest', 'From the northwest'][side];
      return pr('On a Northern Hemisphere surface map, a city lies due ' + names[side] + ' of a low. Winds circle the low counterclockwise and slant in toward it. From which direction does the wind blow at the city?', mcK(ans, ['From the northeast', 'From the southeast', 'From the southwest', 'From the northwest'].filter(function (x) { return x !== ans; })), [
        'Counterclockwise around a low: on its ' + names[side] + ' side the air moves toward the ' + ['west', 'north', 'east', 'south'][side] + '.',
        'Slanting inward too, it blows ' + ['toward the southwest', 'toward the northwest', 'toward the northeast', 'toward the southeast'][side] + ': a wind ' + ans.toLowerCase() + '.'
      ], 'Trace the counterclockwise circle, then tilt it toward the center.', { vk: 'windat', vd: { _side: side } });
    }
    function next() {
      var K = R.pick([
        ['A city is in the warm sector of a low, with a cold front 200 km to its west moving east. What is coming in the next several hours?', 'A band of showers or storms, then a shift to northwest winds and cooler, drier air', ['Many hours of steady rain, then warmer air', 'Clear, calm weather all day', 'A slow warm-up with south winds and no change']],
        ['High pressure is centered just west of a city. What weather is likely tomorrow?', 'Mostly clear and dry, with sinking air', ['Heavy rain and thunderstorms', 'Lake-effect snow everywhere', 'A hurricane']],
        ['Where on a surface map is the wind likely strongest?', 'Where the isobars are packed closest together', ['At the center of a high', 'Where the isobars are farthest apart', 'Exactly at the center of a low']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Systems move west to east; fronts and lows bring clouds and rain; highs bring sinking, clearing air; crowded isobars mean strong winds.', 'Answer: ' + K[1] + '.'], 'What lies to the west, and how is it moving?', { vk: 'concept' });
    }
    return lv(R, ctx, [isobar, eta, next], [isobar, windAt, next, eta], [fall, windAt, next]);
  });

  // ---------- g09_storms.js ----------
  // ===================== Unit 9: Storms =====================
  var EFT = [[0, 65, 85], [1, 86, 110], [2, 111, 135], [3, 136, 165], [4, 166, 200], [5, 201, 1000]];
  var SST = [[1, 74, 95], [2, 96, 110], [3, 111, 129], [4, 130, 156], [5, 157, 1000]];
  function efOf(m) { var r = -1; EFT.forEach(function (e) { if (m >= e[1]) r = e[0]; }); return r; }
  function ssOf(m) { var r = 0; SST.forEach(function (e) { if (m >= e[1]) r = e[0]; }); return r; }
  function wcF(T, V) { var v = MA.pow(V, 0.16); return 35.74 + 0.6215 * T - 35.75 * v + 0.4275 * T * v; }
  function hiF(T, RH) {
    var s = 0.5 * (T + 61 + (T - 68) * 1.2 + RH * 0.094); if ((s + T) / 2 < 80) return s;
    var H = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    if (RH < 13 && T >= 80 && T <= 112) H -= ((13 - RH) / 4) * MA.sqrt((17 - MA.abs(T - 95)) / 17);
    if (RH > 85 && T >= 80 && T <= 87) H += ((RH - 85) / 10) * ((87 - T) / 5);
    return H;
  }
  G('weather.thunderstorms', function (R, ctx) {
    var ST = ['Cumulus stage', 'Mature stage', 'Dissipating stage'];
    function stage() {
      var K = R.pick([
        ['A towering cloud grows fast, made only of rising air; no rain has reached the ground yet.', 0],
        ['Updrafts and downdrafts sit side by side; heavy rain, lightning and gusty, cool winds reach the ground.', 1],
        ['Downdrafts fill the storm, the rain becomes light, and the anvil spreads and thins.', 2],
        ['The first lightning flashes and the first heavy rain reach the ground beside a strong updraft.', 1],
        ['Puffy cumulus merge into a tall tower whose updraft carries droplets above the freezing level, with no downdraft yet.', 0]
      ]);
      return pr('Which stage of a thunderstorm is this? ' + K[0], mcK(ST[K[1]], ST.filter(function (x, i) { return i !== K[1]; })), ['Cumulus: all updraft. Mature: updraft and downdraft together, rain and lightning. Dissipating: downdraft takes over.', 'Answer: ' + ST[K[1]].toLowerCase() + '.'], 'Is there a downdraft yet, and does it dominate?', { vk: 'concept' });
    }
    function ingredients() {
      var K = R.pick([
        ['Which three ingredients does a thunderstorm need?', 'Moisture, unstable air and a lift', ['Cold air, high pressure and calm winds', 'Snow, a warm front and fog', 'Dry air, sinking air and sunshine']],
        ['On a hot, humid afternoon with very unstable air, no storms form all day. What ingredient was most likely missing?', 'Something to lift the air to its cloud base', ['Moisture', 'Instability', 'Sunlight']],
        ['A cold front pushes into hot, humid, unstable air. What does the front supply?', 'The lift', ['The moisture', 'The instability', 'The latent heat']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Thunderstorms need moisture, instability and a lift.', 'Answer: ' + K[1] + '.'], 'Moisture, instability, lift.', { vk: 'concept' });
    }
    function updraft() {
      var w = R.pick([5, 8, 10, 15, 20, 25, 6, 11, 14, 17, 21, 24]), zb = R.pick([1, 1.5, 2, 1.2]), zt = R.pick([9, 10, 12, 14, 11, 13]), t = (zt - zb) * 1000 / w / 60;
      return pr('A thunderstorm\'s updraft rises at ' + q(w, 'm/s') + ' from the cloud base at ' + q(zb, 'km') + ' to the top at ' + q(zt, 'km') + '. How many minutes does the air take to make the trip?', num(t, 0.01), [
        'Distance: ' + nt(zt) + ' − ' + nt(zb) + ' = ' + q(fix(zt - zb), 'km') + ' = ' + q(fix((zt - zb) * 1000), 'm') + '.',
        'Time: ' + nt(fix((zt - zb) * 1000)) + ' ÷ ' + nt(w) + ' = ' + q(rnd((zt - zb) * 1000 / w, 0), 's') + ' ≈ ' + q(rnd(t, 1), 'min') + '.'
      ], 'Distance in meters divided by speed, then seconds to minutes.', { unit: 'min', vk: 'up', vd: { w: w, zb: zb, zt: zt } });
    }
    function topT() {
      var t0 = R.int(22, 34), zt = R.pick([10, 11, 12]), g = 6.5, T = t0 - g * zt;
      return pr('The surrounding air cools about ' + q(g, '°C') + ' per km from ' + q(t0, '°C') + ' at the ground. Roughly how cold is the air at a storm top ' + q(zt, 'km') + ' up?', numT(fix(T), 0.06), [
        'Cooling: ' + nt(g) + ' × ' + nt(zt) + ' = ' + q(fix(g * zt), '°C') + '.',
        nt(t0) + ' − ' + nt(fix(g * zt)) + ' = ' + q(fix(T), '°C') + ': the top of the storm is made of ice.'
      ], 'Lapse rate times height, subtracted from the ground temperature.', { unit: '°C', vk: 'top', vd: { t0: t0, zt: zt } });
    }
    function downdraft() {
      return pr('What starts a thunderstorm\'s cold downdraft?', mc('Falling rain drags air down, and rain evaporating into drier air below chills it', ['Cold air blowing down from the stratosphere', 'The Coriolis effect pushing air down', 'Lightning heating the air above it']), ['The downdraft forms inside the storm.', 'Drag from falling precipitation plus cooling by evaporation make the air dense, so it sinks.'], 'Where does the cold come from?', { vk: 'concept' });
    }
    function anvil() {
      return pr('Why does a mature thunderstorm\'s top flatten into an anvil?', mc('The updraft reaches the stable stratosphere, where rising air quickly becomes colder than its surroundings and spreads out', ['The cloud runs out of water vapor', 'Strong winds aloft push the cloud down', 'The top of the cloud freezes solid']), ['Above the troposphere the temperature stops falling with height.', 'That stable layer acts as a lid, and the rising air spreads sideways.'], 'What kind of air lies above the troposphere?', { vk: 'concept' });
    }
    return lv(R, ctx, [stage, ingredients, updraft], [stage, updraft, downdraft, ingredients], [topT, anvil, updraft, downdraft]);
  });

  G('weather.lightning-thunder', function (R, ctx) {
    function dist() {
      var t = R.int(2, 30), d = 343 * t / 1000;
      return pr('You see a flash and count ' + t + ' seconds before you hear the thunder. Using 343 m/s for the speed of sound, how far away was the lightning, in km?', num(d, 0.01), ['Distance = speed × time = 343 × ' + t + ' = ' + q(343 * t, 'm') + '.', '≈ ' + q(rnd(d, 2), 'km') + '. (The shortcut, 3 s per km, gives ' + nt(rnd(t / 3, 1)) + ' km.)'], 'Light arrives almost at once; the delay is the sound\'s travel time.', { unit: 'km', vk: 'dist', vd: { t: t } });
    }
    function rule() {
      var miles = R.coin(), t = R.pick([3, 6, 9, 10, 12, 15, 18, 20, 24, 30]), d = miles ? t / 5 : t / 3;
      return pr('Using the rule of ' + (miles ? '5 seconds per mile' : '3 seconds per kilometer') + ', how far away is lightning whose thunder arrives ' + t + ' seconds after the flash?', num(d, 0.01), [t + ' ÷ ' + (miles ? 5 : 3) + ' = ' + q(rnd(d, 2), miles ? 'mi' : 'km') + '.'], 'Divide the seconds by the rule\'s number.', { unit: miles ? 'mi' : 'km', vk: 'rule', vd: { t: t } });
    }
    function delay() {
      var d = R.pick([1, 2, 3, 4, 5, 6, 8, 10, 7, 9]), t = d * 1000 / 343;
      return pr('Lightning strikes ' + q(d, 'km') + ' away. How many seconds pass before you hear the thunder? Use 343 m/s.', num(t, 0.01), ['Time = distance ÷ speed = ' + nt(d * 1000) + ' ÷ 343 ≈ ' + q(rnd(t, 1), 's') + '.'], 'Distance divided by the speed of sound.', { unit: 's', vk: 'delay', vd: { d: d } });
    }
    function approach() {
      var t1 = R.pick([15, 18, 21, 24, 27, 30]), t2 = R.pick([3, 6, 9]), m = R.pick([5, 10, 15, 20, 6, 11, 14, 19]), v = (t1 - t2) / 3 / (m / 60);
      return pr('At first the thunder comes ' + t1 + ' s after the flash; ' + m + ' minutes later it comes ' + t2 + ' s after. Using 3 s per km, about how fast is the storm approaching, in km/h?', num(v, 0.01), [
        'Distances: ' + t1 + ' ÷ 3 = ' + q(t1 / 3, 'km') + ', then ' + t2 + ' ÷ 3 = ' + q(t2 / 3, 'km') + '. It came ' + q((t1 - t2) / 3, 'km') + ' closer.',
        m + ' minutes = ' + nt(rnd(m / 60, 3)) + ' h. Speed: ' + nt((t1 - t2) / 3) + ' ÷ ' + nt(rnd(m / 60, 3)) + ' ≈ ' + q(rnd(v, 1), 'km/h') + '.'
      ], 'Turn each delay into a distance, then divide the change by the time.', { unit: 'km/h', vk: 'approach', vd: { t1: t1, t2: t2, m: m } });
    }
    function tfq() {
      var K = R.pick([
        ['Lightning never strikes the same place twice.', false, 'Tall, exposed objects are struck again and again; the Empire State Building is hit more than 20 times in a typical year.'],
        ['Thunder is the sound of air heated by lightning expanding violently.', true, 'Heated to about 30,000 °C in an instant, the channel\'s air expands with a shock wave.'],
        ['You see lightning before you hear thunder because light travels far faster than sound.', true, 'Light: about 300,000 km/s; sound: about 0.34 km/s.'],
        ['The longer the gap between flash and thunder, the closer the lightning.', false, 'A longer gap means the sound traveled farther.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Sound takes about 3 s per km.', { vk: 'concept' });
    }
    function charge() {
      return pr('How does a thunderstorm build up the electric charge that becomes lightning?', mc('Collisions between ice crystals and soft hail in the updraft separate charge, leaving the upper cloud mostly positive and the lower cloud mostly negative', ['Friction between raindrops and the ground', 'The Sun charges the cloud tops', 'Wind blowing over the anvil makes static']), ['In the cold part of the storm, light ice crystals and heavier graupel collide.', 'The updraft carries the positively charged crystals up while the graupel stays lower, separating the charges.'], 'Think about the ice particles in the updraft.', { vk: 'concept' });
    }
    return lv(R, ctx, [rule, dist, tfq], [dist, delay, approach, tfq], [approach, delay, charge]);
  });

  G('weather.tornadoes', function (R, ctx) {
    function rate() {
      var m = R.pick([70, 80, 90, 100, 105, 115, 125, 130, 140, 150, 160, 170, 185, 195, 210, 220, 120, 200]), e = efOf(m);
      return pr('A damage survey estimates a tornado\'s strongest 3-second gusts at ' + q(m, 'mph') + '. On the Enhanced Fujita scale (EF0 65–85, EF1 86–110, EF2 111–135, EF3 136–165, EF4 166–200, EF5 over 200 mph), what is its rating?', mcK('EF' + e, ['EF0', 'EF1', 'EF2', 'EF3', 'EF4', 'EF5'].filter(function (x) { return x !== 'EF' + e; }).slice(0, 5)), [
        q(m, 'mph') + ' falls in the range ' + EFT[e][1] + (e === 5 ? ' and up' : '–' + EFT[e][2]) + ' mph.',
        'Rating: EF' + e + '.'
      ], 'Find the range that contains the wind.', { vk: 'ef', vd: { m: m } });
    }
    function rateKmh() {
      var kmh = R.pick([120, 150, 160, 190, 200, 230, 250, 280, 300, 340]), m = kmh / 1.609, e = efOf(m);
      return pr('A survey estimates a tornado\'s gusts at ' + q(kmh, 'km/h') + '. Convert to mph (1 mph ≈ 1.609 km/h) and give its EF rating (EF0 65–85, EF1 86–110, EF2 111–135, EF3 136–165, EF4 166–200, EF5 over 200 mph).', mcK('EF' + e, ['EF0', 'EF1', 'EF2', 'EF3', 'EF4', 'EF5'].filter(function (x) { return x !== 'EF' + e; }).slice(0, 5)), [
        nt(kmh) + ' ÷ 1.609 ≈ ' + q(rnd(m, 0), 'mph') + '.',
        'That is in ' + EFT[e][1] + (e === 5 ? ' and up' : '–' + EFT[e][2]) + ' mph: EF' + e + '.'
      ], 'Convert first, then find the range.', { vk: 'efkmh', vd: { kmh: kmh } });
    }
    function convert() {
      var m = R.pick([65, 86, 111, 136, 166, 200, 120, 150]), k = m * 1.609;
      return pr('Convert ' + q(m, 'mph') + ' to km/h (1 mph ≈ 1.609 km/h).', num(k, 0.01), [nt(m) + ' × 1.609 ≈ ' + q(rnd(k, 0), 'km/h') + '.'], 'Multiply by 1.609.', { unit: 'km/h', vk: 'conv', vd: { m: m } });
    }
    function shear() {
      var K = R.pick([
        ['What gives a supercell\'s updraft its rotation?', 'Wind that changes speed or direction with height makes horizontal spin, which the updraft tilts upright', ['The Coriolis effect spins every storm', 'Lightning makes the air rotate', 'Hail falling in a spiral']],
        ['How are tornadoes rated on the EF scale?', 'After they pass, from the damage they did', ['By radar measurements of their width', 'By how long they stay on the ground', 'By the air pressure in the funnel']],
        ['Which kind of storm produces most strong tornadoes?', 'Supercells, thunderstorms with a rotating updraft', ['Fair-weather cumulus', 'Nimbostratus', 'Lake-effect snow bands']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Shear plus a strong updraft makes a rotating storm (a supercell); tornadoes are rated by damage surveys.', 'Answer: ' + K[1] + '.'], 'Think of wind shear and damage surveys.', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['Tornadoes don\'t cross rivers or hit big cities.', false, 'Tornadoes have crossed wide rivers and struck the centers of large cities.'],
        ['A tornado\'s EF rating is decided from the damage it caused.', true, 'Surveyors estimate the winds from damage to buildings and trees.'],
        ['Every thunderstorm with wind shear makes a tornado.', false, 'Only a small share of supercells produce tornadoes.'],
        ['The United States has more tornadoes than any other country.', true, 'About 1,200 in a typical year.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'No terrain stops a tornado.', { vk: 'concept' });
    }
    return lv(R, ctx, [rate, shear, tfq], [rate, convert, shear, tfq], [rateKmh, rate, shear]);
  });

  G('weather.hurricanes', function (R, ctx) {
    var SSN = 'Category 1: 74–95, 2: 96–110, 3: 111–129, 4: 130–156, 5: 157 mph or more';
    function cat() {
      var m = R.int(74, 185), c = ssOf(m);
      return pr('A hurricane\'s maximum sustained winds are ' + q(m, 'mph') + '. What is its Saffir–Simpson category? (' + SSN + '.)', num(c, 0.0001), [q(m, 'mph') + ' is in the range ' + SST[c - 1][1] + (c === 5 ? ' and up' : '–' + SST[c - 1][2]) + ' mph.', 'Category ' + c + (c >= 3 ? ', a major hurricane.' : '.')], 'Find the range that contains the wind.', { vk: 'cat', vd: { m: m } });
    }
    function catKt() {
      var kt = R.int(13, 32) * 5, m = kt * 1.151, c = ssOf(m);
      return pr('A hurricane\'s maximum sustained winds are ' + q(kt, 'kt') + '. Convert to mph (1 knot ≈ 1.151 mph) and find its category. (' + SSN + '.)', num(c, 0.0001), [nt(kt) + ' × 1.151 ≈ ' + q(rnd(m, 0), 'mph') + '.', 'Category ' + c + '.'], 'Convert knots to mph first.', { vk: 'catkt', vd: { kt: kt } });
    }
    function spin() {
      var h = R.pick([['the Gulf of Mexico', 'N'], ['the western Pacific near the Philippines', 'N'], ['the Atlantic east of the Caribbean', 'N'], ['the Coral Sea east of Australia', 'S'], ['the Indian Ocean near Madagascar', 'S'], ['the Bay of Bengal', 'N']]);
      var right = h[1] === 'N' ? 'Counterclockwise' : 'Clockwise';
      return pr('Seen from above, which way do the winds of a tropical cyclone in ' + h[0] + ' circle its center?', mcK(right, [right === 'Clockwise' ? 'Counterclockwise' : 'Clockwise', 'It doesn\'t spin', 'It changes direction every few hours']), [h[0] + ' is in the ' + (h[1] === 'N' ? 'Northern' : 'Southern') + ' Hemisphere.', 'Air spiraling into a low there circles ' + right.toLowerCase() + '.'], 'Which hemisphere is it in?', { vk: 'spin', vd: { _h: h[1] } });
    }
    function needs() {
      var K = R.pick([
        ['Why do hurricanes weaken quickly after moving over land?', 'They lose their supply of warm ocean water and the latent heat its vapor releases', ['Mountains block the Coriolis effect', 'The land pushes the eye open', 'The air over land is too humid']],
        ['Why do hurricanes almost never form right at the equator?', 'The Coriolis effect is zero there, so the storm can\'t start spinning', ['The water there is too cold', 'There is no water vapor at the equator', 'The trade winds are too weak']],
        ['About how warm must the ocean be for a hurricane to form?', 'About 26.5 °C (80 °F) or warmer', ['About 10 °C (50 °F) or warmer', 'Below freezing', 'Any temperature will do']],
        ['What does a hurricane\'s Saffir–Simpson category measure?', 'Only its maximum sustained wind', ['Its storm surge', 'Its total rainfall', 'All of its dangers together']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Warm water supplies the latent heat; Coriolis supplies the spin; the category rates only wind.', 'Answer: ' + K[1] + '.'], 'Fuel, spin and what the category counts.', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['A Category 1 hurricane can\'t be deadly, because its winds are the weakest on the scale.', false, 'Storm surge and flooding rain, which the category doesn\'t measure, cause most hurricane deaths.'],
        ['Most U.S. hurricane deaths are caused by water: storm surge and flooding rain.', true, 'The category measures only wind.'],
        ['A hurricane\'s energy comes mainly from latent heat released as water vapor condenses.', true, 'Warm ocean water evaporates; the vapor condenses in the eyewall.'],
        ['Hurricanes in the Southern Hemisphere spin counterclockwise.', false, 'They spin clockwise there.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'The category is only about wind.', { vk: 'concept' });
    }
    function ktmph() {
      var kt = R.int(60, 160), m = kt * 1.151;
      return pr('Convert ' + q(kt, 'kt') + ' to mph (1 knot ≈ 1.151 mph).', num(m, 0.01), [nt(kt) + ' × 1.151 ≈ ' + q(rnd(m, 1), 'mph') + '.'], 'Multiply by 1.151.', { unit: 'mph', vk: 'ktmph', vd: { kt: kt } });
    }
    return lv(R, ctx, [cat, spin, tfq], [cat, needs, ktmph, tfq], [catKt, needs, spin]);
  });

  G('weather.wind-chill-heat-index', function (R, ctx) {
    var WT = [40, 30, 20, 10, 0, -10], WV = [5, 10, 20, 30, 40], HT = [86, 90, 94, 98], HR = [40, 50, 60, 70];
    function readWC() {
      var Ts = R.sample(WT, 3).sort(function (a, b) { return b - a; }), Vs = R.sample(WV, 3).sort(function (a, b) { return a - b; }), T = R.pick(Ts), V = R.pick(Vs), w = MA.round(wcF(T, V));
      var tb = table(['Air'].concat(Vs.map(function (v) { return 'Wind ' + v + ' mph'; })), Ts.map(function (t) { return [q(t, '°F')].concat(Vs.map(function (v) { return nt(MA.round(wcF(t, v))); })); }), 'Part of the NWS wind chill chart (°F).');
      return pr('Use the wind chill chart. What is the wind chill at ' + q(T, '°F') + ' with a ' + q(V, 'mph') + ' wind?' + tb, num(w, 0.0001, 0.01), ['Find the row for ' + q(T, '°F') + ' and the column for ' + q(V, 'mph') + '.', 'Wind chill: ' + q(w, '°F') + '.'], 'Row for the temperature, column for the wind.', { unit: '°F', vk: 'wc', vd: { _T: T, _V: V } });
    }
    function readHI() {
      var Ts = R.sample(HT, 3).sort(function (a, b) { return a - b; }), Rs = R.sample(HR, 3).sort(function (a, b) { return a - b; }), T = R.pick(Ts), Rh = R.pick(Rs), h = MA.round(hiF(T, Rh));
      var tb = table(['Air'].concat(Rs.map(function (r) { return 'RH ' + r + '%'; })), Ts.map(function (t) { return [q(t, '°F')].concat(Rs.map(function (r) { return nt(MA.round(hiF(t, r))); })); }), 'Part of the NWS heat index chart (°F, in the shade).');
      return pr('Use the heat index chart. What is the heat index at ' + q(T, '°F') + ' and ' + Rh + '% relative humidity?' + tb, num(h, 0.0001, 0.01), ['Find the row for ' + q(T, '°F') + ' and the column for ' + Rh + '%.', 'Heat index: ' + q(h, '°F') + '.'], 'Row for the temperature, column for the humidity.', { unit: '°F', vk: 'hi', vd: { _T: T, _R: Rh } });
    }
    function feelsDiff() {
      var T = R.pick([30, 20, 10, 0]), V = R.pick([10, 20, 30]), w = MA.round(wcF(T, V));
      return pr('It is ' + q(T, '°F') + ' with a ' + q(V, 'mph') + ' wind, and the NWS wind chill is ' + q(w, '°F') + '. How many degrees colder does it feel than the air temperature?', num(T - w, 0.0001, 0.01), [nt(T) + ' − (' + nt(w) + ') = ' + q(T - w, '°F') + '.'], 'Subtract the wind chill from the air temperature.', { unit: '°F', vk: 'diff', vd: { T: T, w: w } });
    }
    function objects() {
      var T = R.pick([34, 36, 38, 40, 45]), w = MA.round(wcF(T, 25));
      return pr('The air is ' + q(T, '°F') + ' with a 25 mph wind, and the wind chill is ' + q(w, '°F') + '. How cold can the wind make an outdoor water pipe?', mc('No colder than the air, ' + q(T, '°F') + ': wind only speeds up cooling toward the air temperature', ['Down to ' + q(w, '°F') + ', the wind chill', 'Down to 32 °F, because the wind freezes it', 'Down to ' + q(w - 10, '°F') + ', colder than the wind chill']), ['Wind carries heat away faster, but only until the pipe reaches the air temperature.', 'So the wind can bring the pipe down to ' + q(T, '°F') + ' and no lower; the wind chill applies to people and animals, which make their own heat.'], 'Can wind cool something below the air temperature?', { vk: 'concept' });
    }
    function why() {
      var K = R.pick([
        ['Why does humid air make hot weather feel hotter?', 'Sweat evaporates more slowly, so the body loses less heat by evaporation', ['Humid air is warmer than dry air at the same temperature', 'Water vapor gives off heat onto the skin', 'Humid air blocks sunlight']],
        ['Why does wind make cold air feel colder?', 'It strips away the thin layer of warmed air next to the skin, so heat flows out faster', ['It lowers the air temperature', 'It carries in colder air from above', 'It makes the skin wet']],
        ['The heat index is figured for shade. What does full sunshine do?', 'It can raise the heat index by up to about 15 °F', ['It lowers the heat index', 'It has no effect', 'It doubles the heat index']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Both indexes describe how fast the body loses heat, not the air\'s real temperature.', 'Answer: ' + K[1] + '.'], 'Think about how your body sheds heat.', { vk: 'concept' });
    }
    function formula() {
      var T = R.pick([35, 25, 15, 5, -5, -15]), V = R.pick([8, 12, 15, 18, 25, 35, 45]), w = wcF(T, V);
      return pr('The NWS wind chill formula is $W = 35.74 + 0.6215T - 35.75V^{0.16} + 0.4275TV^{0.16}$, with $T$ in °F and $V$ in mph. Find the wind chill for ' + q(T, '°F') + ' and ' + q(V, 'mph') + ', to the nearest degree.', num(rnd(w, 1), 0.0001, 0.6), [
        '$V^{0.16}$ = ' + nt(V) + '^0.16 ≈ ' + nt(rnd(MA.pow(V, 0.16), 4)) + '.',
        '$W$ ≈ 35.74 + 0.6215(' + nt(T) + ') − 35.75(' + nt(rnd(MA.pow(V, 0.16), 4)) + ') + 0.4275(' + nt(T) + ')(' + nt(rnd(MA.pow(V, 0.16), 4)) + ') ≈ ' + q(rnd(w, 1), '°F') + ', about ' + q(MA.round(w), '°F') + '.'
      ], 'Work out V^0.16 first.', { unit: '°F', vk: 'formula', vd: { T: T, V: V } });
    }
    return lv(R, ctx, [readWC, readHI, objects], [readWC, readHI, feelsDiff, why], [formula, objects, why, readHI]);
  });

  // ---------- g10_forecast.js ----------
  // ===================== Unit 10: Observing and Forecasting =====================
  G('weather.instruments', function (R, ctx) {
    var INS = [['air temperature', 'Thermometer'], ['air pressure', 'Barometer'], ['humidity', 'Hygrometer'], ['wind speed', 'Anemometer'], ['wind direction', 'Wind vane'], ['the amount of rain', 'Rain gauge'], ['temperature and humidity high above the ground', 'Radiosonde (weather balloon)']];
    function match() {
      var k = R.pick(INS);
      return pr('Which instrument measures ' + k[0] + '?', mc(k[1], R.sample(INS.filter(function (x) { return x[1] !== k[1]; }), 3).map(function (x) { return x[1]; })), ['Each instrument measures one property of the air.', k[1] + ' measures ' + k[0] + '.'], 'Match the instrument to what it measures.', { vk: 'concept' });
    }
    function vane() {
      var i = R.int(0, 7), smoke = R.coin(), opp = C8[(i + 4) % 8];
      if (smoke) return pr('Smoke from a chimney drifts toward the ' + opp + '. Which way does the wind vane on the roof point?', mc('Toward the ' + C8[i], R.sample(C8.filter(function (c) { return c !== C8[i]; }), 3).map(function (c) { return 'Toward the ' + c; })), ['The smoke drifts downwind, toward the ' + opp + ', so the wind comes from the ' + C8[i] + '.', 'A vane points into the wind: toward the ' + C8[i] + '.'], 'A vane points toward where the wind comes from.', { vk: 'vane-s', vd: { _i: i } });
      return pr('A wind vane\'s arrow points toward the ' + C8[i] + '. Which way is the wind blowing?', mc('From the ' + C8[i] + ' toward the ' + opp, ['From the ' + opp + ' toward the ' + C8[i], 'From the ' + C8[(i + 2) % 8] + ' toward the ' + C8[(i + 6) % 8], 'From the ' + C8[(i + 6) % 8] + ' toward the ' + C8[(i + 2) % 8]]), ['The wind pushes the big tail downwind, so the arrowhead points into the wind.', 'The wind comes from the ' + C8[i] + ' and blows toward the ' + opp + '.'], 'The arrow points into the wind.', { vk: 'vane', vd: { _i: i } });
    }
    function gauge() {
      var toMM = R.coin(), x = toMM ? R.pick([0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.4, 3, 0.1]) : R.pick([5, 10, 12.7, 20, 25.4, 38.1, 50.8, 76.2, 100]), v = toMM ? x * 25.4 : x / 25.4;
      return pr('A rain gauge collects ' + (toMM ? q(x, 'in') : q(x, 'mm')) + ' of rain. How much is that in ' + (toMM ? 'millimeters' : 'inches') + '? (1 inch = 25.4 mm)', num(v, 0.01), [toMM ? nt(x) + ' × 25.4 = ' + q(fix(v), 'mm') + '.' : nt(x) + ' ÷ 25.4 ≈ ' + q(rnd(v, 2), 'in') + '.'], toMM ? 'Multiply by 25.4.' : 'Divide by 25.4.', { unit: toMM ? 'mm' : 'in', vk: toMM ? 'in2mm' : 'mm2in', vd: { x: x } });
    }
    function balloon() {
      var v = R.pick([4, 5, 6]), z = R.pick([10, 15, 20, 25, 30, 33]), t = z * 1000 / v / 60;
      return pr('A weather balloon rises at about ' + q(v, 'm/s') + '. How many minutes does it take to reach ' + q(z, 'km') + '?', num(t, 0.01), ['Time = ' + nt(z * 1000) + ' m ÷ ' + nt(v) + ' m/s = ' + q(rnd(z * 1000 / v, 0), 's') + '.', '÷ 60 ≈ ' + q(rnd(t, 1), 'min') + '.'], 'Meters divided by meters per second, then seconds to minutes.', { unit: 'min', vk: 'balloon', vd: { v: v, z: z } });
    }
    function shelter() {
      var K = R.pick([
        ['Why are thermometers at weather stations kept in shaded, ventilated shelters?', 'So they measure the air\'s temperature, not sunlight heating the thermometer itself', ['To keep them from being stolen', 'Because thermometers only work in the dark', 'To measure the temperature of the ground']],
        ['Why are weather balloons launched at the same two times every day all over the world?', 'So forecasters get a snapshot of the whole atmosphere at one instant', ['Because the balloons rise faster at those times', 'Because the air is calm only at those times', 'To avoid airplanes']],
        ['What does a radiosonde measure as its balloon rises?', 'Temperature, humidity and pressure, and its drift gives the wind', ['Only the height of the clouds', 'Only rainfall', 'The temperature of the ground below']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Instruments are set up to measure the air itself, and at the same times everywhere.', 'Answer: ' + K[1] + '.'], 'What exactly should the instrument measure?', { vk: 'concept' });
    }
    return lv(R, ctx, [match, vane, gauge], [vane, gauge, balloon, shelter], [balloon, vane, shelter]);
  });

  G('weather.radar-satellite', function (R, ctx) {
    var C0 = 3e8;
    function echo() {
      var us = R.pick([100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500]), d = C0 * us * 1e-6 / 2 / 1000;
      return pr('A radar pulse returns ' + q(us, 'μs') + ' (microseconds) after it was sent. How far away is the rain, in km? ($c = 3 \\times 10^8$ m/s; 1 μs = 10⁻⁶ s)', num(d, 0.01), ['The pulse goes out and back, so $d = ct/2$.', '$d$ = 3 × 10⁸ × ' + nt(us) + ' × 10⁻⁶ ÷ 2 = ' + q(fix(d * 1000), 'm') + ' = ' + q(fix(d), 'km') + '.'], 'Out and back: divide c × t by 2.', { unit: 'km', vk: 'echo', vd: { us: us } });
    }
    function delayFor() {
      var d = R.pick([15, 30, 45, 60, 90, 120, 150, 180, 240, 300]), us = fix(2 * d * 1000 / C0 * 1e6);
      return pr('How long, in microseconds, does a radar pulse take to reach rain ' + q(d, 'km') + ' away and return? ($c = 3 \\times 10^8$ m/s)', num(us, 0.01), ['Round trip: 2 × ' + nt(d * 1000) + ' = ' + q(2 * d * 1000, 'm') + '.', '$t$ = ' + nt(2 * d * 1000) + ' ÷ (3 × 10⁸) = ' + q(fix(us), 'μs') + '.'], 'The pulse travels twice the distance.', { unit: 'μs', vk: 'delay', vd: { d: d } });
    }
    function top() {
      var tg = R.int(15, 32), tt = -R.pick([30, 40, 45, 50, 55, 60, 65]), g = 6.5, z = (tg - tt) / g;
      return pr('An infrared satellite reads a cloud top at ' + q(tt, '°C') + '. The ground is ' + q(tg, '°C') + ', and the air cools about ' + q(g, '°C') + ' per km. About how high is the cloud top?', num(z, 0.01), ['Difference: ' + nt(tg) + ' − (' + nt(tt) + ') = ' + q(tg - tt, '°C') + '.', 'Height: ' + nt(tg - tt) + ' ÷ ' + nt(g) + ' ≈ ' + q(rnd(z, 1), 'km') + '.'], 'How many kilometers of cooling make that difference?', { unit: 'km', vk: 'top', vd: { tg: tg, tt: tt } });
    }
    function images() {
      var K = R.pick([
        ['At 2 a.m., which satellite image still shows the clouds?', 'An infrared image', ['A visible image', 'Neither', 'Only a photograph from the ground']],
        ['On a standard infrared satellite image, which clouds look brightest?', 'The coldest, highest cloud tops', ['The warmest, lowest clouds', 'The clouds with the most rain under them', 'The thinnest clouds']],
        ['Which tool shows where rain is actually falling right now?', 'Weather radar', ['A visible satellite image', 'An infrared satellite image', 'A barometer']],
        ['Why can\'t radar see most fair-weather clouds?', 'Cloud droplets are too small to return a strong echo', ['Clouds are transparent to all light', 'Radar works only at night', 'Clouds absorb all radio waves']],
        ['What extra information does a Doppler radar give?', 'Whether the rain is moving toward or away from the radar, and how fast', ['The temperature of the rain', 'The dew point near the ground', 'The height of the tropopause']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Visible images need sunlight; infrared images read temperature; radar sees precipitation-sized particles.', 'Answer: ' + K[1] + '.'], 'What does each tool actually detect?', { vk: 'concept' });
    }
    function range() {
      var ms = R.pick([1, 1.5, 2, 3, 4]), d = C0 * ms / 1000 / 2 / 1000;
      return pr('A radar sends a pulse every ' + q(ms, 'ms') + ' and must hear each echo before the next pulse. What is the farthest distance it can measure without confusion, in km? ($c = 3 \\times 10^8$ m/s)', num(d, 0.01), ['The echo must return within ' + q(ms, 'ms') + ': $d = c t / 2$.', '3 × 10⁸ × ' + nt(ms / 1000) + ' ÷ 2 = ' + q(fix(d * 1000), 'm') + ' = ' + q(fix(d), 'km') + '.'], 'Use the time between pulses as the round-trip time.', { unit: 'km', vk: 'range', vd: { ms: ms } });
    }
    function tfq() {
      var K = R.pick([
        ['Satellite images show where it is raining.', false, 'They show clouds; radar shows precipitation.'],
        ['Visible satellite images are dark at night.', true, 'They show reflected sunlight.'],
        ['Infrared satellite images work day and night.', true, 'They measure the infrared every surface gives off.'],
        ['On an infrared image, the brightest clouds are usually the warmest.', false, 'Infrared images are usually drawn so the coldest, highest tops look brightest.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Clouds on satellites, precipitation on radar.', { vk: 'concept' });
    }
    return lv(R, ctx, [echo, images, tfq], [echo, top, delayFor, images], [range, top, delayFor]);
  });

  G('weather.forecast-models', function (R, ctx) {
    function grid() {
      var A = R.pick([2000000, 4000000, 8000000, 10000000]), dx = R.pick([5, 10, 20, 25]), lev = R.pick([30, 40, 50, 60]), n = A / (dx * dx) * lev;
      return pr('A weather model covers ' + q(A, 'km²') + ' with grid columns ' + q(dx, 'km') + ' apart and ' + lev + ' levels. How many grid points is that?', num(n, 0.01), ['Columns: ' + nt(A) + ' ÷ (' + dx + ' × ' + dx + ') = ' + nt(A / (dx * dx)) + '.', 'Points: ' + nt(A / (dx * dx)) + ' × ' + lev + ' = ' + nt(n) + '.'], 'Area per column is the spacing squared.', { vk: 'grid', vd: { A: A, dx: dx, lev: lev } });
    }
    function steps() {
      var hrs = R.pick([48, 72, 120, 168, 240]), dt = R.pick([2, 3, 5, 10]), n = hrs * 60 / dt;
      return pr('A model steps forward ' + q(dt, 'min') + ' at a time. How many steps does it take to make a ' + q(hrs, 'h') + ' forecast?', num(n, 0.0001), [nt(hrs) + ' h = ' + nt(hrs * 60) + ' min.', nt(hrs * 60) + ' ÷ ' + dt + ' = ' + nt(n) + ' steps.'], 'Convert hours to minutes first.', { vk: 'steps', vd: { hrs: hrs, dt: dt } });
    }
    function doubling() {
      var e0 = R.pick([0.05, 0.1, 0.2, 0.25]), T = R.pick([1, 2, 3]), dys = T * R.int(2, 6), e = e0 * MA.pow(2, dys / T);
      return pr('A forecast starts with a temperature error of ' + q(e0, '°C') + ' that doubles every ' + (T === 1 ? 'day' : T + ' days') + '. How big is the error after ' + dys + ' days?', num(e, 0.01), [dys + ' days is ' + dys / T + ' doublings.', nt(e0) + ' × 2^' + dys / T + ' = ' + nt(e0) + ' × ' + MA.pow(2, dys / T) + ' = ' + q(fix(e), '°C') + '.'], 'Count the doublings.', { unit: '°C', vk: 'double', vd: { e0: e0, _T: T, dys: dys } });
    }
    function ens() {
      var N = R.pick([20, 25, 30, 40, 50]), k = R.int(1, N - 1), p = 100 * k / N;
      return pr('In an ensemble of ' + N + ' model runs, ' + k + ' show rain at a town on Friday. What chance of rain does the ensemble give, in percent?', pct(p, 0.05), [k + ' ÷ ' + N + ' = ' + nt(rnd(k / N, 3)) + '.', 'That is ' + nt(rnd(p, 1)) + '%.'], 'The share of members with rain.', { vk: 'ens', vd: { N: N, k: k } });
    }
    function chaos() {
      var K = R.pick([
        ['Why do forecasts lose skill after about a week to ten days?', 'Tiny errors in the starting state grow until they swamp the forecast (chaos)', ['Computers are too slow to go further', 'The laws of physics change after a week', 'Weather stations shut down on weekends']],
        ['Why do forecasters run an ensemble of many model runs?', 'Their spread shows how uncertain the forecast is, and their agreement gives probabilities', ['To average away all errors so the forecast is perfect', 'Because one run is never finished in time', 'To check the computer for bugs']],
        ['Members of an ensemble agree closely for 3 days, then spread far apart. What does this tell you?', 'The forecast is confident for 3 days and uncertain after that', ['The model is broken', 'The weather will be calm after 3 days', 'The forecast is equally certain on all days']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Small errors grow (chaos), so forecasters use ensembles to measure uncertainty.', 'Answer: ' + K[1] + '.'], 'Think about errors that grow.', { vk: 'concept' });
    }
    function whenBad() {
      var e0 = R.pick([0.1, 0.2]), T = R.pick([2, 3]), E0 = R.pick([1.6, 3.2, 6.4]) * (e0 === 0.2 ? 2 : 1), t = T * MA.log(E0 / e0) / MA.LN2;
      return pr('A forecast\'s starting error of ' + q(e0, '°C') + ' doubles every ' + T + ' days. After how many days does it reach ' + q(fix(E0), '°C') + '?', num(t, 0.01), ['Growth factor: ' + nt(fix(E0)) + ' ÷ ' + nt(e0) + ' = ' + nt(rnd(E0 / e0, 3)) + ' = 2^' + nt(rnd(MA.log(E0 / e0) / MA.LN2, 3)) + '.', 'Days: ' + nt(rnd(MA.log(E0 / e0) / MA.LN2, 3)) + ' doublings × ' + T + ' = ' + q(rnd(t, 1), 'days') + '.'], 'How many doublings turn the first number into the second?', { unit: 'days', vk: 'whenbad', vd: { e0: e0, T: T, E0: fix(E0) } });
    }
    return lv(R, ctx, [steps, ens, chaos], [grid, doubling, ens, chaos], [whenBad, grid, doubling]);
  });

  G('weather.probability-of-precipitation', function (R, ctx) {
    function pop() {
      var C = R.pick([40, 50, 60, 70, 80, 90, 100]), A = R.pick([20, 30, 40, 50, 60, 80, 100]), p = C * A / 100;
      return pr('A forecaster is ' + C + '% confident that rain will fall somewhere in the area and expects it to cover ' + A + '% of the area if it does. Using PoP = C × A, what probability of precipitation goes in the forecast?', pct(p, 0.05), ['PoP = ' + nt(C / 100) + ' × ' + nt(A / 100) + ' = ' + nt(fix(p / 100)) + '.', '= ' + nt(p) + '%.'], 'Multiply the confidence by the area fraction.', { vk: 'pop', vd: { C: C, A: A } });
    }
    function dry() {
      var p = R.int(1, 9) * 10;
      return pr('The forecast gives a ' + p + '% chance of rain. What is the chance of no measurable rain at your location?', pct(100 - p, 0.05), ['The two outcomes cover all cases: 100% − ' + p + '% = ' + (100 - p) + '%.'], 'Use the complement.', { vk: 'dry', vd: { p: p } });
    }
    function meaning() {
      var p = R.pick([20, 30, 40, 60, 70]);
      return pr('What does a "' + p + '% chance of rain" mean in a National Weather Service forecast?', mc('A ' + p + '% chance that at least 0.01 inch of rain falls at any given spot in the area during the period', ['Rain will fall for ' + p + '% of the day', 'Rain will fall over ' + p + '% of the area', p + '% of the forecasters think it will rain']), ['PoP is the chance of measurable precipitation at any given point in the area during the forecast period.', 'It is not a share of the time or of the area.'], 'It is about any one spot.', { vk: 'concept' });
    }
    function calib() {
      var p = R.pick([10, 20, 30, 40, 50, 60, 70]), N = R.pick([20, 40, 50, 60, 80, 100]), e = p / 100 * N;
      return pr('A forecaster gave a ' + p + '% chance of rain on ' + N + ' days. If those forecasts are well calibrated, on about how many of those days should it have rained?', num(e, 0.01), [nt(p / 100) + ' × ' + N + ' = ' + nt(fix(e)) + ' days.'], 'Calibrated means the percent matches how often it happens.', { unit: 'days', vk: 'calib', vd: { p: p, N: N } });
    }
    function conf() {
      var A = R.pick([40, 50, 80, 100]), p = R.pick([20, 30, 40]), C = 100 * p / A;
      if (C > 100) { A = 100; C = p; }
      return pr('A forecast gives a ' + p + '% chance of rain. The forecaster expected rain to cover ' + A + '% of the area if it fell. Using PoP = C × A, how confident was the forecaster that rain would fall somewhere in the area?', pct(C, 0.05), ['$C = \\text{PoP}/A$ = ' + nt(p / 100) + ' ÷ ' + nt(A / 100) + ' = ' + nt(fix(C / 100)) + '.', 'That is ' + nt(fix(C)) + '%.'], 'Divide the PoP by the area fraction.', { vk: 'conf', vd: { p: p, A: A } });
    }
    function tfq() {
      var K = R.pick([
        ['If the forecast said 30% and it rained at your house, the forecast was wrong.', false, 'A 30% chance means rain happens about 3 times in 10 in such situations.'],
        ['A forecaster 100% sure that rain will cover 40% of the area gives a 40% chance of rain.', true, '1.0 × 0.4 = 0.4.'],
        ['A 40% chance of rain means it will rain for 40% of the day.', false, 'It is the chance of measurable rain at a given spot during the period.'],
        ['Measurable precipitation means at least 0.01 inch.', true, 'That is about 0.25 mm.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'PoP = C × A, at any given spot.', { vk: 'concept' });
    }
    return lv(R, ctx, [pop, dry, meaning], [pop, calib, meaning, tfq], [conf, calib, pop]);
  });

  // ---------- g11_climate.js ----------
  // ===================== Unit 11: Climate and Climate Zones =====================
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  G('weather.climate-normals', function (R, ctx) {
    function anomaly() {
      var F = R.coin(), nrm = F ? R.int(20, 95) : R.int(-150, 300) / 10, a = F ? R.nz(-12, 12) : R.nz(-60, 60) / 10, v = fix(nrm + a), u = F ? '°F' : '°C';
      return pr('A town\'s normal for this month is ' + q(nrm, u) + '. This month averaged ' + q(v, u) + '. What was the anomaly?', numT(a, 0.051), ['Anomaly = value − normal = ' + nt(v) + ' − (' + nt(nrm) + ').', '= ' + sgn(a, u) + (a > 0 ? ': warmer than normal.' : ': colder than normal.')], 'Subtract the normal from the value.', { unit: u, vk: 'anom', vd: { v: v, nrm: nrm } });
    }
    function value() {
      var nrm = R.int(-100, 300) / 10, a = R.nz(-50, 50) / 10, v = fix(nrm + a);
      return pr('A city\'s June normal is ' + q(nrm, '°C') + ', and this June\'s anomaly was ' + sgn(a, '°C') + '. What did this June average?', numT(v, 0.051), ['Value = normal + anomaly = ' + nt(nrm) + ' + (' + nt(a) + ') = ' + q(v, '°C') + '.'], 'Add the anomaly to the normal.', { unit: '°C', vk: 'value', vd: { nrm: nrm, a: a } });
    }
    function normal() {
      var v = R.int(-50, 350) / 10, a = R.nz(-40, 40) / 10, nrm = fix(v - a);
      return pr('Last month averaged ' + q(v, '°C') + ', an anomaly of ' + sgn(a, '°C') + '. What is the normal for that month?', numT(nrm, 0.051), ['Normal = value − anomaly = ' + nt(v) + ' − (' + nt(a) + ') = ' + q(nrm, '°C') + '.'], 'Undo the anomaly.', { unit: '°C', vk: 'normal', vd: { v: v, a: a } });
    }
    function season() {
      var m = [R.nz(-30, 30) / 10, R.nz(-30, 30) / 10, R.nz(-30, 30) / 10], av = (m[0] + m[1] + m[2]) / 3;
      return pr('The monthly temperature anomalies for a summer were ' + m.map(function (x) { return sgn(x, '°C'); }).join(', ') + '. What was the anomaly for the season as a whole (their average)? Round to two decimal places.', numT(rnd(av, 3), 0.006), ['Sum: ' + nt(fix(m[0] + m[1] + m[2])) + ' °C.', 'Average: ' + nt(fix(m[0] + m[1] + m[2])) + ' ÷ 3 ≈ ' + sgn(rnd(av, 2), '°C') + '.'], 'Average the three anomalies.', { unit: '°C', vk: 'season', vd: { a: m[0], b: m[1], c: m[2] } });
    }
    function rebase() {
      var shift = R.pick([0.2, 0.3, 0.4, 0.5, 0.6]), a1 = R.int(5, 15) / 10, a2 = fix(a1 - shift);
      return pr('A month was ' + sgn(a1, '°C') + ' compared with the 1961–1990 normal. The 1991–2020 normal for that month is ' + q(shift, '°C') + ' warmer than the 1961–1990 normal. What is the month\'s anomaly compared with the 1991–2020 normal?', numT(a2, 0.051), ['A warmer baseline lowers every anomaly by the same amount.', nt(a1) + ' − ' + nt(shift) + ' = ' + sgn(a2, '°C') + '. The month itself did not change; only the zero line moved.'], 'How much higher is the new zero line?', { unit: '°C', vk: 'rebase', vd: { a1: a1, shift: shift } });
    }
    function read() {
      var K = R.pick([
        ['On a July temperature anomaly map, Phoenix is shaded blue at −1 °C. What does that mean?', 'Phoenix was 1 °C cooler than its own July normal, though still very hot', ['Phoenix was −1 °C in July', 'Phoenix had its coldest July ever', 'Phoenix was colder than Seattle']],
        ['How long a period is a climate normal averaged over?', '30 years', ['1 year', '5 years', '100 years']],
        ['NOAA\'s current U.S. climate normals cover which years?', '1991–2020', ['1951–1980', '1900–1950', '2001–2010']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['A normal is a 30-year average; an anomaly is the difference from it.', 'Answer: ' + K[1] + '.'], 'An anomaly is a difference, not a temperature.', { vk: 'concept' });
    }
    return lv(R, ctx, [anomaly, value, read], [anomaly, normal, value, read], [season, rebase, normal]);
  });

  function climData(R, kind, south) { // a made-up town's monthly normals (°C, mm)
    var mean = { A: R.int(250, 280) / 10, B: R.int(150, 260) / 10, C: R.int(100, 180) / 10, D: R.int(-20, 70) / 10, E: R.int(-200, -90) / 10 }[kind];
    var amp = { A: R.int(5, 30) / 10, B: R.int(60, 120) / 10, C: R.int(50, 90) / 10, D: R.int(120, 200) / 10, E: R.int(80, 140) / 10 }[kind];
    if (kind === 'C' && mean - amp < 1) amp = mean - 1 - R.int(0, 30) / 10;
    var T = [], P = [], tot = { A: R.int(150, 300) * 10, B: R.int(4, 25) * 10, C: R.int(60, 140) * 10, D: R.int(45, 90) * 10, E: R.int(18, 40) * 10 }[kind], pat = R.pick(['summer', 'winter', 'even']), w = [];
    for (var m = 0; m < 12; m++) {
      var ph = MA.cos(2 * MA.PI * (m - (south ? 0.5 : 6.5)) / 12); T.push(rnd(mean + amp * ph, 1));
      w.push(pat === 'summer' ? 1 + 0.8 * ph : pat === 'winter' ? 1 - 0.8 * ph : 1 + 0.15 * MA.sin(m));
    }
    var sw = w.reduce(function (a, b) { return a + b; }, 0); w.forEach(function (x) { P.push(MA.round(tot * x / sw)); });
    return { T: T, P: P };
  }
  function koppenGroup(T, P) {
    var s = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); }, MAT = s(T) / 12, MAP = s(P), Tw = MA.max.apply(null, T), Tc = MA.min.apply(null, T);
    var nh = [3, 4, 5, 6, 7, 8], sh = [9, 10, 11, 0, 1, 2], sumN = s(nh.map(function (i) { return T[i]; })), sumS = s(sh.map(function (i) { return T[i]; })), summer = sumN >= sumS ? nh : sh;
    var share = s(summer.map(function (i) { return P[i]; })) / MAP, Pth = 20 * MAT + (share >= 0.7 ? 280 : share >= 0.3 ? 140 : 0);
    var g = Tw < 10 ? 'E' : MAP < Pth ? 'B' : Tc >= 18 ? 'A' : Tc > -3 ? 'C' : 'D';
    return { g: g, MAT: MAT, MAP: MAP, Tw: Tw, Tc: Tc, share: share, Pth: Pth, desert: MAP < Pth / 2 };
  }
  G('weather.climographs', function (R, ctx) {
    function town() { for (var k = 0; k < 20; k++) { var kind = R.pick(['A', 'B', 'C', 'C', 'D']), south = R.chance(0.35), d = climData(R, kind, south); var Tw = MA.max.apply(null, d.T), Tc = MA.min.apply(null, d.T); if (Tw - Tc >= 1) return { d: d, south: south }; } return { d: d, south: south }; }
    function dtab(d, which) { var head = ['Month'].concat(which !== 'P' ? ['Temperature (°C)'] : []).concat(which !== 'T' ? ['Precipitation (mm)'] : []); return table(head, MON.map(function (m, i) { return [m].concat(which !== 'P' ? [nt(d.T[i])] : []).concat(which !== 'T' ? [String(d.P[i])] : []); }), 'A town\'s monthly normals.'); }
    function vz(d) { return { name: 'es-climate-data', opts: { mode: 'climograph', data: { temp: d.T, precip: d.P, name: 'A town' }, quiet: true, lock: true } }; }
    function range() {
      var t = town(), d = t.d, Tw = MA.max.apply(null, d.T), Tc = MA.min.apply(null, d.T);
      return pr('What is this town\'s annual temperature range?' + dtab(d, 'T'), numT(fix(Tw - Tc), 0.051), ['Warmest month: ' + q(Tw, '°C') + '; coldest: ' + q(Tc, '°C') + '.', 'Range: ' + nt(Tw) + ' − (' + nt(Tc) + ') = ' + q(fix(Tw - Tc), '°C') + '.'], 'Warmest month minus coldest month.', { unit: '°C', vk: 'range', viz: vz(d), vd: { _T: d.T } });
    }
    function hemi() {
      var t = town(), d = t.d, right = t.south ? 'Southern Hemisphere: its warmest months are December to February' : 'Northern Hemisphere: its warmest months are June to August';
      return pr('In which hemisphere is this town?' + dtab(d, 'T'), mcK(right, [t.south ? 'Northern Hemisphere: its warmest months are June to August' : 'Southern Hemisphere: its warmest months are December to February', 'You can\'t tell from temperatures', 'On the equator, because it has seasons']), ['Find the warmest months: ' + (t.south ? 'December to February' : 'June to August') + '.', right + '.'], 'When is it warmest?', { vk: 'hemi', viz: vz(d), vd: { _T: d.T } });
    }
    function total() {
      var t = town(), d = t.d, tot = d.P.reduce(function (a, b) { return a + b; }, 0);
      return pr('What is this town\'s total yearly precipitation?' + dtab(d, 'P'), num(tot, 0.0001), ['Add the twelve months: ' + d.P.join(' + ') + '.', '= ' + q(tot, 'mm') + '.'], 'Add all twelve months.', { unit: 'mm', vk: 'total', vd: { _P: d.P } });
    }
    function wet() {
      for (var k = 0; k < 30; k++) { var t = town(), d = t.d, best = 0, bi = 0; for (var i = 0; i < 12; i++) { var s3 = d.P[i] + d.P[(i + 1) % 12] + d.P[(i + 2) % 12]; if (s3 > best) { best = s3; bi = i; } } var ss = [0, 3, 6, 9].map(function (i) { return d.P[i] + d.P[i + 1] + d.P[i + 2]; }), mx = MA.max.apply(null, ss), si = ss.indexOf(mx); var sorted = ss.slice().sort(function (a, b) { return b - a; }); if (sorted[0] - sorted[1] >= 0.15 * sorted[0]) break; }
      var labels = ['January to March', 'April to June', 'July to September', 'October to December'];
      return pr('Which three months are the wettest in this town?' + dtab(d, 'P'), mcK(labels[si], labels.filter(function (x, i) { return i !== si; })), ['Totals: ' + labels.map(function (l, i) { return l + ' ' + ss[i] + ' mm'; }).join('; ') + '.', 'Wettest: ' + labels[si] + '.'], 'Add each group of three months.', { vk: 'wet', viz: vz(d), vd: { _P: d.P } });
    }
    function meanT() {
      var t = town(), d = t.d, m = d.T.reduce(function (a, b) { return a + b; }, 0) / 12;
      return pr('What is this town\'s average yearly temperature? Round to one decimal place.' + dtab(d, 'T'), numT(rnd(m, 2), 0.06), ['Sum of the twelve months: ' + nt(fix(d.T.reduce(function (a, b) { return a + b; }, 0))) + ' °C.', 'Divide by 12: ≈ ' + q(rnd(m, 1), '°C') + '.'], 'Add the twelve months and divide by 12.', { unit: '°C', vk: 'mean', vd: { _T: d.T } });
    }
    return lv(R, ctx, [range, hemi], [range, hemi, total, wet], [meanT, total, wet]);
  });

  G('weather.climate-zones', function (R, ctx) {
    var GN = { A: 'A, tropical', B: 'B, dry', C: 'C, temperate', D: 'D, continental', E: 'E, polar' };
    function make(kind) { for (var k = 0; k < 40; k++) { var south = R.chance(0.3), d = climData(R, kind, south), K = koppenGroup(d.T, d.P); if (K.g === kind && MA.abs(K.Tc + 3) > 1 && MA.abs(K.Tc - 18) > 1 && MA.abs(K.Tw - 10) > 1 && MA.abs(K.MAP - K.Pth) > 0.15 * MA.max(K.Pth, 50)) return { d: d, K: K }; } return null; }
    function shareText(s) { return s >= 0.7 ? 'mostly in the summer half of the year' : s < 0.3 ? 'mostly in the winter half of the year' : 'spread through the year'; }
    function classify() {
      var kind = R.pick(['A', 'B', 'C', 'D', 'E']), m = make(kind); if (!m) { kind = 'C'; m = make('C'); }
      var K = m.K;
      return pr('Classify this climate in a Köppen group. Warmest month ' + q(K.Tw, '°C') + ', coldest month ' + q(K.Tc, '°C') + ', yearly average ' + q(rnd(K.MAT, 1), '°C') + ', yearly precipitation ' + q(K.MAP, 'mm') + ', falling ' + shareText(K.share) + '. (Dry threshold: 20 × average + 280 mm if mostly in summer, + 140 if spread out, + 0 if mostly in winter. C and D split at −3 °C.)', mcK(GN[K.g], Object.keys(GN).filter(function (g) { return g !== K.g; }).map(function (g) { return GN[g]; })), [
        'E? Warmest month ' + q(K.Tw, '°C') + (K.Tw < 10 ? ' is below 10 °C: polar.' : ' is 10 °C or more: not polar.'),
        K.Tw < 10 ? 'Group E.' : 'B? Dry threshold: 20 × ' + nt(rnd(K.MAT, 1)) + ' + ' + (K.share >= 0.7 ? 280 : K.share >= 0.3 ? 140 : 0) + ' ≈ ' + q(rnd(K.Pth, 0), 'mm') + '; precipitation ' + q(K.MAP, 'mm') + (K.MAP < K.Pth ? ' is below it: dry, group B.' : ' is above it: not dry.'),
        K.g === 'A' || K.g === 'C' || K.g === 'D' ? 'Coldest month ' + q(K.Tc, '°C') + ': ' + (K.g === 'A' ? '18 °C or more, tropical (A).' : K.g === 'C' ? 'between −3 and 18 °C, temperate (C).' : '−3 °C or colder, continental (D).') : 'Answer: ' + GN[K.g] + '.'
      ], 'Check E first, then B, then use the coldest month.', { vk: 'kop', viz: { name: 'es-climate-data', opts: { mode: 'climograph', data: { temp: m.d.T, precip: m.d.P, name: 'A town' }, quiet: true, lock: true, koppen: false } }, vd: { _T: m.d.T, _P: m.d.P } });
    }
    function threshold() {
      var mat = R.int(-5, 28), sh = R.pick([0, 140, 280]), th = 20 * mat + sh;
      if (th <= 0) { mat = R.int(5, 28); th = 20 * mat + sh; }
      return pr('A place averages ' + q(mat, '°C') + ' over the year, with its precipitation falling ' + (sh === 280 ? 'mostly in summer' : sh === 140 ? 'evenly through the year' : 'mostly in winter') + '. What is its Köppen dry threshold (20 × average temperature + 280 mm if mostly in summer, + 140 if spread out, + 0 if mostly in winter)?', num(th, 0.0001), ['20 × ' + nt(mat) + ' + ' + sh + ' = ' + q(th, 'mm') + '.', 'With less precipitation than this, the climate is dry (B).'], 'Pick the right extra amount for the rain\'s timing.', { unit: 'mm', vk: 'thresh', vd: { mat: mat, _sh: sh } });
    }
    function desert() {
      var mat = R.int(10, 26), sh = R.pick([0, 140, 280]), th = 20 * mat + sh, map = R.coin() ? R.int(1, Math.floor(th / 2 / 10) - 2) * 10 : R.int(Math.ceil(th / 2 / 10) + 2, Math.floor(th / 10) - 2) * 10, des = map < th / 2;
      var right = des ? 'Desert (BW): less than half the dry threshold' : 'Steppe (BS): between half the threshold and the threshold';
      return pr('A dry place averages ' + q(mat, '°C') + ', gets ' + q(map, 'mm') + ' a year, and its dry threshold works out to ' + q(th, 'mm') + '. Is it a desert or a steppe?', mcK(right, [des ? 'Steppe (BS): between half the threshold and the threshold' : 'Desert (BW): less than half the dry threshold', 'Neither: it is temperate (C)', 'Polar (E)']), ['Half the threshold: ' + q(th / 2, 'mm') + '.', q(map, 'mm') + (des ? ' is below it: desert.' : ' is above it but below ' + q(th, 'mm') + ': steppe.')], 'Compare with half of the threshold.', { vk: 'desert', vd: { map: map, th: th } });
    }
    function single() {
      var K = R.pick([
        ['The warmest month in a place averages 6 °C. Which Köppen group is it?', 'E, polar', ['D, continental', 'C, temperate', 'B, dry']],
        ['A rainy place\'s coldest month averages 24 °C. Which group?', 'A, tropical', ['C, temperate', 'B, dry', 'E, polar']],
        ['A well-watered place has a coldest month of 4 °C and a warmest of 22 °C. Which group?', 'C, temperate', ['D, continental', 'A, tropical', 'E, polar']],
        ['A well-watered place has a coldest month of −12 °C and a warmest of 18 °C. Which group?', 'D, continental', ['C, temperate', 'E, polar', 'A, tropical']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['E: warmest below 10 °C. A: coldest 18 °C or more. C: coldest between −3 and 18 °C. D: coldest −3 °C or colder.', 'Answer: ' + K[1] + '.'], 'Use the warmest month for E, the coldest for A, C and D.', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['Every desert is hot.', false, 'Deserts are defined by too little precipitation; Antarctica is the largest desert.'],
        ['The dry threshold rises with temperature because warm places lose more water to evaporation.', true, '20 × the average temperature is part of the threshold.'],
        ['A tropical rainforest and a hot desert can have about the same average temperature.', true, 'They differ in precipitation, not heat.'],
        ['In Köppen\'s scheme, a place with a warmest month of 5 °C is in group E.', true, 'Its warmest month is below 10 °C.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Dryness is about precipitation against a threshold.', { vk: 'concept' });
    }
    return lv(R, ctx, [single, threshold, tfq], [classify, threshold, desert, single], [classify, desert, classify]);
  });

  // ---------- g12_climate.js ----------
  // ===================== Unit 12: The Carbon Cycle and Climate Change =====================
  var PPMC = 2.124, CO2YR = [[1960, 317], [1970, 326], [1980, 339], [1990, 354], [2000, 370], [2010, 390], [2020, 414], [2024, 425]];
  G('weather.carbon-cycle', function (R, ctx) {
    function residence() {
      var res = R.int(80, 95) * 10, a = R.int(21, 27) * 5, b = R.int(14, 19) * 5, t = res / (a + b);
      return pr('The air holds about ' + q(res, 'GtC') + '. Each year about ' + q(a, 'GtC') + ' moves into plants by photosynthesis and about ' + q(b, 'GtC') + ' into the ocean. On average, how many years does a carbon atom stay in the air before it is swapped out?', num(t, 0.01), ['Total leaving each year: ' + nt(a) + ' + ' + nt(b) + ' = ' + q(a + b, 'GtC') + '.', 'Average stay: ' + nt(res) + ' ÷ ' + nt(a + b) + ' ≈ ' + q(rnd(t, 2), 'years') + '. (Similar amounts come back each year; extra carbon takes far longer to remove.)'], 'Reservoir divided by the flux out.', { unit: 'years', vk: 'res', vd: { res: res, a: a, b: b } });
    }
    function fastSlow() {
      var K = R.pick([['photosynthesis by forests', 'Fast'], ['the ocean surface taking up and releasing CO₂', 'Fast'], ['respiration and decay', 'Fast'], ['weathering of rocks', 'Slow'], ['volcanoes releasing CO₂', 'Slow'], ['burial of shells and plankton on the seafloor', 'Slow'], ['the formation of coal from buried plants', 'Slow']]);
      var right = K[1] === 'Fast' ? 'The fast cycle: large amounts moving each year' : 'The slow cycle: small amounts over very long times';
      return pr('Which part of the carbon cycle is ' + K[0] + '?', mcK(right, [K[1] === 'Fast' ? 'The slow cycle: small amounts over very long times' : 'The fast cycle: large amounts moving each year', 'Neither: it doesn\'t move carbon']), ['The fast cycle runs through living things, the air and the ocean surface; the slow cycle through rocks, burial and volcanoes.', 'Answer: ' + right.toLowerCase() + '.'], 'Living things and the ocean surface are fast; rocks are slow.', { vk: 'concept' });
    }
    function glucose() {
      var m = R.pick([45, 90, 180, 270, 360, 450, 540, 720, 900, 1800]), co2 = R.coin(), v = co2 ? m * 264 / 180 : m * 72 / 180;
      return pr(co2 ? 'Photosynthesis makes glucose: $6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$. How many grams of CO₂ (44 g/mol) does a plant take from the air to make ' + q(m, 'g') + ' of glucose (180 g/mol)?' : 'Glucose, $\\text{C}_6\\text{H}_{12}\\text{O}_6$, has a molar mass of 180 g/mol, and carbon is 12 g/mol. How many grams of carbon, all taken from CO₂ in the air, are in ' + q(m, 'g') + ' of glucose?', num(v, 0.01), co2 ? ['Each 180 g of glucose needs 6 × 44 = 264 g of CO₂.', nt(m) + ' × 264 ÷ 180 = ' + q(fix(v), 'g') + '.'] : ['Each 180 g of glucose holds 6 × 12 = 72 g of carbon.', nt(m) + ' × 72 ÷ 180 = ' + q(fix(v), 'g') + '.'], 'Use the ratio from the formula.', { unit: 'g', vk: co2 ? 'co2' : 'carbon', vd: { m: m } });
    }
    function net() {
      var inn = R.int(76, 92), out = inn - R.pick([1.5, 2, 2.5, 2.8, 3, 3.5]);
      return pr('Each year the ocean takes up about ' + q(inn, 'GtC') + ' from the air and gives back about ' + q(fix(out), 'GtC') + '. What is the ocean\'s net uptake?', num(fix(inn - out), 0.01), ['Net = in − out = ' + nt(inn) + ' − ' + nt(fix(out)) + ' = ' + q(fix(inn - out), 'GtC') + ' a year.', 'Two huge fluxes that nearly cancel leave a small net uptake: the ocean sink.'], 'Subtract what comes out from what goes in.', { unit: 'GtC', vk: 'net', vd: { inn: inn, out: fix(out) } });
    }
    function volc() {
      var h = R.pick([8, 9, 9.5, 10, 10.5, 11, 12]), v = R.pick([0.1, 0.2, 0.25]), r = h / v;
      return pr('People emit about ' + q(h, 'GtC') + ' a year, and volcanoes about ' + q(v, 'GtC') + ' a year. How many times as much carbon do people emit?', num(r, 0.01), [nt(h) + ' ÷ ' + nt(v) + ' = ' + nt(fix(r)) + '.'], 'Divide the two fluxes.', { vk: 'volc', vd: { h: h, v: v } });
    }
    function tfq() {
      var K = R.pick([
        ['Most of a tree\'s dry mass comes from the soil.', false, 'Nearly all of it is built from carbon dioxide taken from the air, plus water.'],
        ['Burning fossil fuels moves carbon from the slow cycle into the fast cycle.', true, 'Carbon buried for millions of years returns to the air in decades.'],
        ['The ocean holds far more carbon than the atmosphere.', true, 'About 38,000 GtC, compared with about 900 GtC in the air.'],
        ['Volcanoes release more carbon each year than people do.', false, 'People emit roughly a hundred times as much.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Follow the carbon.', { vk: 'concept' });
    }
    return lv(R, ctx, [fastSlow, residence, tfq], [residence, glucose, net, volc], [glucose, residence, net]);
  });

  G('weather.carbon-budget', function (R, ctx) {
    function rise() {
      var E = R.pick([8, 9, 10, 10.5, 11, 11.5, 12]), af = R.pick([0.4, 0.45, 0.5]), d = E * af / PPMC;
      return pr('In one year, people emit ' + q(E, 'GtC') + ', and ' + nt(af * 100) + '% of it stays in the air. By how many ppm does CO₂ rise? (2.124 GtC = 1 ppm)', num(d, 0.01), ['Carbon staying in the air: ' + nt(E) + ' × ' + nt(af) + ' = ' + q(fix(E * af), 'GtC') + '.', 'In ppm: ' + nt(fix(E * af)) + ' ÷ 2.124 ≈ ' + q(rnd(d, 2), 'ppm') + '.'], 'Find the carbon that stays, then divide by 2.124.', { unit: 'ppm', vk: 'rise', vd: { E: E, af: af * 100 } });
    }
    function afFrom() {
      var E = R.pick([10, 10.5, 11, 11.5]), dp = R.pick([2.2, 2.3, 2.4, 2.5, 2.6]), af = 100 * dp * PPMC / E;
      return pr('In a year with ' + q(E, 'GtC') + ' of emissions, CO₂ in the air rose ' + q(dp, 'ppm') + '. What percent of the emissions stayed in the air (the airborne fraction)? (2.124 GtC = 1 ppm)', pct(af, 0.3), ['Carbon added to the air: ' + nt(dp) + ' × 2.124 ≈ ' + q(rnd(dp * PPMC, 2), 'GtC') + '.', 'Fraction: ' + nt(rnd(dp * PPMC, 2)) + ' ÷ ' + nt(E) + ' ≈ ' + nt(rnd(af, 0)) + '%.'], 'Turn the ppm rise into GtC, then compare with emissions.', { vk: 'af', vd: { E: E, dp: dp } });
    }
    function emis() {
      var dp = R.pick([2, 2.2, 2.4, 2.5]), af = R.pick([0.45, 0.5]), E = dp * PPMC / af;
      return pr('CO₂ rose ' + q(dp, 'ppm') + ' in a year, and ' + nt(af * 100) + '% of emissions stay in the air. About how much carbon was emitted? (2.124 GtC = 1 ppm)', num(E, 0.01), ['Carbon added to the air: ' + nt(dp) + ' × 2.124 ≈ ' + q(rnd(dp * PPMC, 3), 'GtC') + '.', 'That is ' + nt(af * 100) + '% of emissions: ' + nt(rnd(dp * PPMC, 3)) + ' ÷ ' + nt(af) + ' ≈ ' + q(rnd(E, 1), 'GtC') + '.'], 'Work backward from the air\'s share.', { unit: 'GtC', vk: 'emis', vd: { dp: dp, af: af * 100 } });
    }
    function toCO2() {
      var c = R.pick([1, 2.5, 6, 9.6, 10, 11, 12]), back = R.coin(), v = back ? c * 44 / 12 : c;
      if (back) return pr('Convert ' + q(c, 'GtC') + ' (billion tonnes of carbon) into billion tonnes of CO₂. (CO₂ has 44 units of mass for every 12 of carbon.)', num(v, 0.01), [nt(c) + ' × 44/12 ≈ ' + nt(rnd(v, 2)) + ' billion tonnes of CO₂.'], 'Multiply by 44/12.', { unit: 'Gt', vk: 'toco2', vd: { c: c } });
      var g = R.pick([11, 22, 33, 36.7, 44]), cc = g * 12 / 44;
      return pr('A country reports emitting ' + q(g, 'Gt') + ' (billion tonnes) of CO₂. How many GtC of carbon is that? (CO₂ has 44 units of mass for every 12 of carbon.)', num(cc, 0.01), [nt(g) + ' × 12/44 ≈ ' + q(rnd(cc, 2), 'GtC') + '.'], 'Multiply by 12/44.', { unit: 'GtC', vk: 'toc', vd: { g: g } });
    }
    function land() {
      var f = R.pick([9.4, 9.6, 9.9]), lu = R.pick([1.1, 1.3]), air = R.pick([5.0, 5.2, 5.4]), oc = R.pick([2.6, 2.8, 3.0]), ld = fix(f + lu - air - oc);
      return pr('A year\'s carbon budget (GtC): fossil fuels ' + nt(f) + ', land-use change ' + nt(lu) + '. The air gained ' + nt(air) + ' and the ocean took up ' + nt(oc) + '. If the budget balances, how much did the land take up?', num(ld, 0.01), ['Sources: ' + nt(f) + ' + ' + nt(lu) + ' = ' + q(fix(f + lu), 'GtC') + '.', 'Land sink: ' + nt(fix(f + lu)) + ' − ' + nt(air) + ' − ' + nt(oc) + ' = ' + q(ld, 'GtC') + '.'], 'Everything emitted must end up somewhere.', { unit: 'GtC', vk: 'land', vd: { f: f, lu: lu, air: air, oc: oc } });
    }
    function derive() {
      var mAir = 5.1e18, mol = mAir / 0.029, c = mol * 1e-6 * 12 / 1e15;
      return pr('The atmosphere has a mass of about $5.1 \\times 10^{18}$ kg, and a mole of air has a mass of 0.029 kg. One ppm of CO₂ means one CO₂ molecule per million molecules of air. How many GtC (1 GtC = $10^{15}$ g) is 1 ppm of CO₂? Carbon is 12 g/mol.', num(c, 0.02), ['Moles of air: 5.1 × 10¹⁸ ÷ 0.029 ≈ ' + M('1.76 \\times 10^{20}') + ' mol.', 'One ppm: ' + M('1.76 \\times 10^{14}') + ' mol of CO₂, holding 12 g of carbon each: ' + M('2.1 \\times 10^{15}') + ' g.', '≈ ' + q(rnd(c, 2), 'GtC') + ': the 2.124 used in carbon budgets.'], 'Find the moles of air, then a millionth of them.', { unit: 'GtC', vk: 'derive', vd: {} });
    }
    function tfq() {
      var K = R.pick([
        ['All the CO₂ people emit stays in the atmosphere.', false, 'A little under half stays; the ocean and land take up the rest.'],
        ['About 2.1 GtC added to the air raises CO₂ by about 1 ppm.', true, 'That follows from the mass of the atmosphere.'],
        ['The carbon the ocean takes up makes seawater more acidic.', true, 'Dissolved CO₂ forms carbonic acid.'],
        ['If emissions stayed level, CO₂ in the air would stop rising.', false, 'Level emissions still add more than the sinks remove each year, so CO₂ keeps rising.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Emissions, sinks and what stays in the air.', { vk: 'concept' });
    }
    return lv(R, ctx, [rise, toCO2, tfq], [rise, afFrom, land, toCO2], [emis, afFrom, derive, land]);
  });

  G('weather.co2-record', function (R, ctx) {
    function pair() { var i = R.int(0, CO2YR.length - 2), j = R.int(i + 1, CO2YR.length - 1); return [CO2YR[i], CO2YR[j]]; }
    function rate() {
      var p = pair(), r = (p[1][1] - p[0][1]) / (p[1][0] - p[0][0]);
      return pr('Mauna Loa measured about ' + q(p[0][1], 'ppm') + ' of CO₂ in ' + p[0][0] + ' and about ' + q(p[1][1], 'ppm') + ' in ' + p[1][0] + '. What was the average rate of rise, in ppm per year?', num(r, 0.01), ['Change: ' + p[1][1] + ' − ' + p[0][1] + ' = ' + q(p[1][1] - p[0][1], 'ppm') + ' over ' + (p[1][0] - p[0][0]) + ' years.', 'Rate: ' + (p[1][1] - p[0][1]) + ' ÷ ' + (p[1][0] - p[0][0]) + ' ≈ ' + q(rnd(r, 2), 'ppm/yr') + '.'], 'Change in CO₂ divided by change in years.', { unit: 'ppm/yr', vk: 'rate', vd: { y1: p[0][0], c1: p[0][1], y2: p[1][0], c2: p[1][1] } });
    }
    function pctUp() {
      var c = R.pick(CO2YR.slice(2)), f = 100 * (c[1] - 280) / 280;
      return pr('Before industry, the air held about 280 ppm of CO₂. In ' + c[0] + ' it held about ' + q(c[1], 'ppm') + '. By what percent had it risen?', pct(f, 0.3), ['Increase: ' + c[1] + ' − 280 = ' + q(c[1] - 280, 'ppm') + '.', 'Percent: ' + (c[1] - 280) + ' ÷ 280 ≈ ' + nt(rnd(f, 1)) + '%.'], 'Divide the increase by the starting value.', { vk: 'pct', vd: { y: c[0], c: c[1] } });
    }
    function when() {
      var start = 425, r = R.pick([2, 2.5, 3]), target = R.pick([450, 475, 500]), yrs = (target - start) / r;
      return pr('CO₂ was about 425 ppm in 2024. If it kept rising ' + q(r, 'ppm') + ' a year, in about how many years would it reach ' + q(target, 'ppm') + '?', num(yrs, 0.01), ['It must rise ' + (target - start) + ' ppm.', (target - start) + ' ÷ ' + nt(r) + ' ≈ ' + q(rnd(yrs, 1), 'years') + ' (around ' + MA.round(2024 + yrs) + ', if the rate stayed the same).'], 'Gap divided by the yearly rise.', { unit: 'years', vk: 'when', vd: { r: r, target: target } });
    }
    function season() {
      var K = R.pick([
        ['In which months is CO₂ at Mauna Loa usually highest in the yearly cycle?', 'Around May', ['Around September', 'Around December', 'It is the same every month']],
        ['In which months is CO₂ at Mauna Loa usually lowest in the yearly cycle?', 'Around September and October', ['Around May', 'Around January', 'It is the same every month']],
        ['What causes the yearly wiggle in the Mauna Loa record?', 'Northern Hemisphere plants taking in CO₂ as they grow in spring and summer, and releasing it as they decay', ['Volcanoes in Hawaii erupting every winter', 'Changes in fossil-fuel use between seasons', 'The ocean freezing every winter']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Northern plants draw CO₂ down through the growing season; decay and respiration return it in fall and winter.', 'Answer: ' + K[1] + '.'], 'When are northern plants growing fastest?', { vk: 'concept' });
    }
    function swing() {
      var hi = rnd(R.int(4200, 4300) / 10, 1), lo = rnd(hi - R.int(55, 70) / 10, 1);
      return pr('In one year, CO₂ at Mauna Loa peaked at ' + q(hi, 'ppm') + ' in May and fell to ' + q(lo, 'ppm') + ' in late September. What was the size of the seasonal swing?', num(fix(hi - lo), 0.01, 0.051), [nt(hi) + ' − ' + nt(lo) + ' = ' + q(fix(hi - lo), 'ppm') + '.', 'The next May will be higher still: the swing rides on the rise.'], 'Peak minus low.', { unit: 'ppm', vk: 'swing', vd: { hi: hi, lo: lo } });
    }
    function compare() {
      var r1 = (326 - 317) / 10, r2 = (414 - 390) / 10, x = r2 / r1;
      return pr('CO₂ rose from about 317 to 326 ppm between 1960 and 1970, and from about 390 to 414 ppm between 2010 and 2020. How many times faster was the rise in the 2010s?', num(x, 0.01), ['1960s: (326 − 317) ÷ 10 = ' + q(r1, 'ppm/yr') + '. 2010s: (414 − 390) ÷ 10 = ' + q(r2, 'ppm/yr') + '.', 'Ratio: ' + nt(r2) + ' ÷ ' + nt(r1) + ' ≈ ' + nt(rnd(x, 2)) + '.'], 'Find each decade\'s rate, then divide.', { vk: 'cmp', vd: {} });
    }
    function tfq() {
      var K = R.pick([
        ['The drop in CO₂ each summer shows that the long-term rise is reversing.', false, 'The drop comes every year as plants grow; each yearly average is higher than the last.'],
        ['CO₂ at Mauna Loa has risen faster in recent decades than in the 1960s.', true, 'About 0.9 ppm a year then; about 2.4 ppm a year in the 2010s.'],
        ['Before industry, CO₂ was about 280 ppm.', true, 'Ice cores show that level for the thousands of years before industry.'],
        ['Mauna Loa was chosen because it is next to a big city.', false, 'It was chosen because it is far from cities and forests, so it samples well-mixed air.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'A yearly wiggle on a rising curve.', { vk: 'concept' });
    }
    return lv(R, ctx, [rate, season, tfq], [rate, pctUp, when, swing], [compare, pctUp, when]);
  });

  G('weather.climate-forcings', function (R, ctx) {
    var FO = [['carbon dioxide', 2.2], ['methane', 0.5], ['nitrous oxide, halocarbons and ozone', 1.1], ['aerosols', -1.1], ['land use', -0.2]];
    function sum() {
      var k = R.sample(FO, R.int(2, 4)), s = fix(k.reduce(function (a, b) { return a + b[1]; }, 0));
      return pr('Using rounded IPCC values for 1750 to 2019 (W/m²): ' + k.map(function (x) { return x[0] + ' ' + sgn(x[1]); }).join(', ') + '. What is their total forcing?', numT(s, 0.051), ['Add with signs: ' + k.map(function (x) { return '(' + nt(x[1]) + ')'; }).join(' + ') + '.', '= ' + sgn(s, 'W/m²') + '.'], 'Add the positive pushes and subtract the negative ones.', { unit: 'W/m²', vk: 'sum', vd: { _k: k.map(function (x) { return x[1]; }) } });
    }
    function sign() {
      var K = R.pick([['more carbon dioxide in the air', 'Warming (positive forcing)'], ['a large volcanic eruption that puts sulfur haze in the stratosphere', 'Cooling (negative forcing)'], ['more pollution particles (sulfate aerosols)', 'Cooling (negative forcing)'], ['more methane in the air', 'Warming (positive forcing)'], ['clearing dark forest for brighter farmland', 'Cooling (negative forcing)'], ['a slightly brighter Sun', 'Warming (positive forcing)']]);
      return pr('Does ' + K[0] + ' push the climate toward warming or cooling?', mcK(K[1], ['Warming (positive forcing)', 'Cooling (negative forcing)', 'No effect at all'].filter(function (x) { return x !== K[1]; })), ['A forcing that adds energy (more sunlight absorbed or less infrared escaping) is positive; one that removes it is negative.', 'Answer: ' + K[1].toLowerCase() + '.'], 'Does it trap more energy or reflect more sunlight?', { vk: 'concept' });
    }
    function formula() {
      var C = R.pick([340, 350, 380, 400, 420, 450, 500, 560, 700, 600]), F = 5.35 * MA.log(C / 280);
      return pr('Use $\\Delta F = 5.35 \\ln(C/C_0)$ W/m² with $C_0$ = 280 ppm. What is the forcing when CO₂ is ' + q(C, 'ppm') + '?', num(F, 0.01), ['$C/C_0$ = ' + C + '/280 ≈ ' + nt(rnd(C / 280, 4)) + '; ln of that ≈ ' + nt(rnd(MA.log(C / 280), 4)) + '.', '$\\Delta F$ ≈ 5.35 × ' + nt(rnd(MA.log(C / 280), 4)) + ' ≈ ' + q(rnd(F, 2), 'W/m²') + '.'], 'Divide by 280, take the natural log, multiply by 5.35.', { unit: 'W/m²', vk: 'formula', vd: { C: C } });
    }
    function noFB() {
      var F = R.pick([1, 2, 2.7, 3.7, 4.5]), dT = F / 3.2;
      return pr('With no feedbacks except Earth\'s own extra glow (about 3.2 W/m² more for each °C), how much would a forcing of ' + q(F, 'W/m²') + ' warm Earth at balance?', num(dT, 0.01), ['Warming = forcing ÷ 3.2 = ' + nt(F) + ' ÷ 3.2 ≈ ' + q(rnd(dT, 2), '°C') + '.', 'Feedbacks such as water vapor make the real warming larger.'], 'Divide the push by the extra glow per degree.', { unit: '°C', vk: 'nofb', vd: { F: F } });
    }
    function volcano() {
      var K = R.pick([
        ['What does a large volcanic eruption usually do to global temperature over the next year or two?', 'Cools it, because a sulfur haze in the stratosphere reflects sunlight', ['Warms it, because of the hot lava', 'Warms it a lot, because of the CO₂ released', 'Nothing measurable']],
        ['Why does a volcano\'s cooling fade after a year or two, while CO₂\'s warming lasts?', 'The haze droplets settle out within a couple of years, but added CO₂ stays in the air for centuries', ['Volcanoes stop cooling after they stop erupting', 'CO₂ is heavier than haze', 'The ocean absorbs the haze in a few days']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Volcanic sulfur makes a short-lived reflective haze: a negative, temporary forcing.', 'Answer: ' + K[1] + '.'], 'What does the haze do to sunlight, and how long does it last?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['A big volcanic eruption warms the climate for decades.', false, 'Its sulfur haze cools Earth for a year or two; Pinatubo (1991) cooled it about half a degree in 1992.'],
        ['Pollution particles (aerosols) have masked part of the warming from greenhouse gases.', true, 'Their forcing is about −1.1 W/m², though very uncertain.'],
        ['Changes in the Sun since 1750 explain most of the recent warming.', false, 'Their forcing is close to zero over that time.'],
        ['A positive forcing pushes Earth toward warming.', true, 'It adds energy to the climate system.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Positive forcings warm; negative ones cool.', { vk: 'concept' });
    }
    return lv(R, ctx, [sign, sum, tfq], [sum, formula, volcano, sign], [formula, noFB, sum]);
  });

  G('weather.feedbacks', function (R, ctx) {
    function classify() {
      var K = R.pick([
        ['Warming melts snow, uncovering darker ground that absorbs more sunlight.', 'Positive feedback'],
        ['Warmer air holds more water vapor, a greenhouse gas, which traps more heat.', 'Positive feedback'],
        ['A warmer Earth gives off more infrared to space (σT⁴), which cools it.', 'Negative feedback'],
        ['Cooling lets ice sheets grow, which reflect more sunlight and cool Earth further.', 'Positive feedback'],
        ['A thermostat turns on the heat when a room cools, warming it back up.', 'Negative feedback']
      ]);
      return pr('Is this a positive or negative feedback? ' + K[0], mcK(K[1], ['Positive feedback', 'Negative feedback', 'Not a feedback'].filter(function (x) { return x !== K[1]; })), ['A positive feedback strengthens the change that started it; a negative one weakens it.', 'Here the response ' + (K[1] === 'Positive feedback' ? 'pushes the same way as the change: positive.' : 'pushes against the change: negative.')], 'Does the response push the same way as the change, or against it?', { vk: 'concept' });
    }
    function warming() {
      var F = R.pick([1.5, 2, 2.5, 2.7, 3, 3.7, 4, 4.5, 5, 7.4]), lam = R.pick([0.9, 1, 1.15, 1.2, 1.25, 1.5, 1.8, 2]), dT = F / lam;
      return pr('A forcing of ' + q(F, 'W/m²') + ' acts on a climate whose net feedback is ' + sgn(-lam) + ' W/m² per °C. How much does Earth warm at balance?', num(dT, 0.01), ['Warming = forcing ÷ (minus the net feedback) = ' + nt(F) + ' ÷ ' + nt(lam) + '.', '≈ ' + q(rnd(dT, 2), '°C') + '.'], 'Divide the forcing by the size of the net feedback.', { unit: '°C', vk: 'warm', vd: { F: F, lam: lam } });
    }
    function netSum() {
      var p = R.pick([-3.2, -3.3, -3.1]), v = R.pick([1.1, 1.2, 1.3, 1.4, 1.5]), i = R.pick([0.25, 0.3, 0.35, 0.4, 0.45]), c = R.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.12, 0.15, 0.25, 0.35]), n = fix(p + v + i + c);
      return pr('Feedback values (W/m² per °C): Earth\'s glow ' + nt(p) + ', water vapor ' + sgn(v) + ', ice and snow ' + sgn(i) + ', clouds ' + sgn(c) + '. What is the net feedback?', numT(n, 0.006), ['Add with signs: ' + nt(p) + ' + ' + nt(v) + ' + ' + nt(i) + ' + ' + nt(c) + ' = ' + nt(n) + '.', 'Still negative, so the climate settles, but much less negative than the glow alone.'], 'Add them, keeping the signs.', { unit: 'W/m² per °C', vk: 'net', vd: { p: p, v: v, i: i, c: c } });
    }
    function amp() {
      var lam = R.pick([1, 1.15, 1.25, 1.4, 1.6, 2]), a = 3.2 / lam;
      return pr('With only Earth\'s glow as a feedback (−3.2 W/m² per °C), a forcing warms Earth by some amount. With all feedbacks the net is −' + nt(lam) + ' W/m² per °C. How many times larger is the warming with all feedbacks?', num(a, 0.01), ['Warming = forcing ÷ |net feedback|, so the ratio is 3.2 ÷ ' + nt(lam) + '.', '≈ ' + nt(rnd(a, 2)) + ' times.'], 'Compare the two sizes of the net feedback.', { vk: 'amp', vd: { lam: lam } });
    }
    function tfq() {
      var K = R.pick([
        ['A positive feedback is a good thing for the climate.', false, '"Positive" only means the change strengthens itself, whatever its effects.'],
        ['Earth\'s extra infrared glow when it warms is the strongest negative feedback.', true, 'About −3.2 W/m² for each °C.'],
        ['Water vapor is a positive feedback.', true, 'Warmer air holds more water vapor, a greenhouse gas.'],
        ['Scientists are equally certain about every feedback.', false, 'Cloud feedbacks are the least certain.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], '"Positive" means self-strengthening.', { vk: 'concept' });
    }
    return lv(R, ctx, [classify, tfq, warming], [classify, warming, netSum, tfq], [amp, netSum, warming]);
  });

  G('weather.orbital-cycles', function (R, ctx) {
    var CY = [['the shape of Earth\'s orbit (eccentricity)', 'About 100,000 years (and 400,000)'], ['the tilt of Earth\'s axis', 'About 41,000 years'], ['the direction Earth\'s axis points (precession)', 'About 19,000 to 23,000 years']];
    function match() {
      var c = R.pick(CY);
      return pr('About how long is the cycle in ' + c[0] + '?', mc(c[1], CY.filter(function (x) { return x[1] !== c[1]; }).map(function (x) { return x[1]; }).concat(['About 11 years'])), ['Eccentricity: about 100,000 and 400,000 years. Tilt: about 41,000. Precession: about 19,000 to 23,000.', 'Answer: ' + c[1].toLowerCase() + '.'], 'Shape is slowest; precession is fastest.', { vk: 'concept' });
    }
    function sun() {
      var a = R.pick([147.1, 146, 145]), b = R.pick([152.1, 153, 155]), r = MA.pow(b / a, 2);
      return pr('In some era, Earth is ' + q(a, 'million km') + ' from the Sun at its closest and ' + q(b, 'million km') + ' at its farthest. How many times stronger is the sunlight at the closest point? (Sunlight weakens as 1/distance².)', num(r, 0.005), ['Ratio: (' + nt(b) + ' ÷ ' + nt(a) + ')² ≈ ' + nt(rnd(b / a, 4)) + '² ≈ ' + nt(rnd(r, 3)) + '.'], 'Square the ratio of the distances.', { vk: 'sun', vd: { a: a, b: b } });
    }
    function count() {
      var P = R.pick([[100000, 41000, 'tilt cycles (41,000 years each)'], [100000, 21000, 'precession cycles (about 21,000 years each)'], [400000, 100000, 'eccentricity cycles (about 100,000 years each)'], [800000, 100000, 'ice-age cycles (about 100,000 years each)']]), n = P[0] / P[1];
      return pr('How many ' + P[2] + ' fit into ' + nt(P[0]) + ' years?', num(n, 0.01), [nt(P[0]) + ' ÷ ' + nt(P[1]) + ' ≈ ' + nt(rnd(n, 2)) + '.'], 'Divide the span by the cycle length.', { vk: 'count', vd: { a: P[0], b: P[1] } });
    }
    function rates() {
      var d1 = R.pick([4, 5, 6]), y1 = R.pick([8000, 10000]), d2 = R.pick([1.0, 1.1, 1.2]), y2 = R.pick([120, 150]), x = (d2 / y2) / (d1 / y1);
      return pr('At the end of the last ice age, Earth warmed about ' + q(d1, '°C') + ' over about ' + nt(y1) + ' years. Since the late 1800s it has warmed about ' + q(d2, '°C') + ' in about ' + y2 + ' years. How many times faster is the recent warming?', num(x, 0.01), ['Ice-age end: ' + nt(d1) + ' ÷ ' + nt(y1) + ' = ' + nt(sig(d1 / y1, 3)) + ' °C per year. Recent: ' + nt(d2) + ' ÷ ' + y2 + ' ≈ ' + nt(sig(d2 / y2, 3)) + ' °C per year.', 'Ratio ≈ ' + nt(rnd(x, 1)) + '.'], 'Compare degrees per year.', { vk: 'rates', vd: { d1: d1, y1: y1, d2: d2, y2: y2 } });
    }
    function how() {
      var K = R.pick([
        ['Orbital cycles change Earth\'s yearly total sunlight only a little. How do they set off ice ages?', 'They change how much summer sunlight falls far north; weak northern summers let snow survive and ice sheets grow, and feedbacks amplify the change', ['They move Earth much closer to the Sun', 'They block sunlight with dust', 'They change the Sun\'s brightness']],
        ['What happens to carbon dioxide in the air during an ice age, according to ice cores?', 'It drops, which amplifies the cooling', ['It rises, which ends the ice age at once', 'It stays exactly the same', 'It disappears completely']],
        ['Which orbital situation favors the growth of ice sheets?', 'Weak northern summers: less tilt, with the far point of the orbit in northern summer', ['Strong northern summers: more tilt', 'Earth closest to the Sun in northern summer', 'A perfectly circular orbit only']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['The cycles shift sunlight between seasons and latitudes; ice and CO₂ feedbacks do the rest.', 'Answer: ' + K[1] + '.'], 'Think about summers far north.', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['Orbital cycles explain today\'s warming.', false, 'They act over tens of thousands of years; today\'s orbit would very slowly cool Earth.'],
        ['Ice ages have come about every 100,000 years for the last 800,000 years.', true, 'Ice cores and ocean sediments record the cycles.'],
        ['Earth is closest to the Sun in early January.', true, 'About 147 million km then, about 152 million km in early July.'],
        ['The seasons happen because Earth is closer to the Sun in summer.', false, 'They come from the tilt; Earth is closest in northern winter.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Orbital cycles are slow.', { vk: 'concept' });
    }
    return lv(R, ctx, [match, count, tfq], [match, sun, how, count], [rates, sun, how]);
  });

  G('weather.paleoclimate', function (R, ctx) {
    function layers() {
      var t = R.pick([1, 2, 2.5, 4, 5]), d = R.pick([10, 20, 25, 50, 100]), n = d * 100 / t;
      return pr('Near the top of an ice core, yearly layers are about ' + q(t, 'cm') + ' thick. About how many years does the top ' + q(d, 'm') + ' cover?', num(n, 0.01), [q(d, 'm') + ' = ' + q(d * 100, 'cm') + '.', nt(d * 100) + ' ÷ ' + nt(t) + ' = ' + nt(n) + ' layers, about ' + nt(n) + ' years.'], 'Convert to centimeters, then count layers.', { unit: 'years', vk: 'layers', vd: { t: t, d: d } });
    }
    function rings() {
      var y = R.pick([2020, 2023, 2024, 2025]), n = R.int(80, 900), start = y - n + 1;
      return pr('A tree cut in ' + y + ' has ' + n + ' growth rings, one per year, including the ring for ' + y + '. In what year did it make its first ring?', num(start, 0.0001), ['The rings cover ' + n + ' years ending in ' + y + '.', 'First ring: ' + y + ' − ' + n + ' + 1 = ' + start + '.'], 'Count back, remembering to include the last year.', { vk: 'rings', vd: { y: y, n: n } });
    }
    function compare() {
      var now = R.pick([415, 420, 425]), hi = 300, lo = 180, ask = R.coin();
      if (ask) return pr('Ice cores show CO₂ between about 180 and 300 ppm over the last 800,000 years. Today it is about ' + q(now, 'ppm') + '. By how many ppm does today exceed the highest level in the cores?', num(now - hi, 0.0001), [now + ' − 300 = ' + q(now - hi, 'ppm') + '.'], 'Subtract the cores\' highest value.', { unit: 'ppm', vk: 'over', vd: { now: now } });
      var f = 100 * (now - hi) / hi;
      return pr('Ice cores show CO₂ no higher than about 300 ppm over the last 800,000 years. Today it is about ' + q(now, 'ppm') + '. By what percent does today exceed that highest level?', pct(f, 0.3), ['Excess: ' + now + ' − 300 = ' + q(now - hi, 'ppm') + '.', 'Percent: ' + (now - hi) + ' ÷ 300 ≈ ' + nt(rnd(f, 1)) + '%.'], 'Divide the excess by 300.', { vk: 'overpct', vd: { now: now } });
    }
    function age() {
      var rate = R.pick([0.5, 1, 2, 2.5, 4, 5]), dep = R.pick([50, 100, 150, 200, 300, 400]), a = fix(dep * 100 / rate);
      return pr('Sediment builds up on a lake bottom at a steady ' + q(rate, 'cm') + ' per year. About how old is the mud ' + q(dep, 'm') + ' below the top of a core?', num(a, 0.01), [q(dep, 'm') + ' = ' + q(dep * 100, 'cm') + '.', nt(dep * 100) + ' ÷ ' + nt(rate) + ' = ' + q(a, 'years') + '.'], 'Depth divided by the yearly rate, in the same units.', { unit: 'years', vk: 'age', vd: { rate: rate, dep: dep } });
    }
    function proxy() {
      var K = R.pick([
        ['Which record gives a direct sample of the air from 500,000 years ago?', 'Bubbles trapped in Antarctic ice cores', ['Tree rings', 'Written weather diaries', 'Corals']],
        ['Which record gives year-by-year growing conditions on land for the last few thousand years?', 'Tree rings', ['Deep-sea sediment cores', 'Ice-core bubbles', 'Rocks from volcanoes']],
        ['Which record reaches back tens of millions of years?', 'Shells of tiny plankton in ocean sediment cores', ['Tree rings', 'Thermometer records', 'Ice cores']],
        ['In polar ice, snow that fell in a colder climate has', 'less of the heavy oxygen-18, because more of it rained out on the way', ['more of the heavy oxygen-18', 'no oxygen at all', 'exactly the same mix as warm-climate snow']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Each proxy records a different span of time and a different part of the climate.', 'Answer: ' + K[1] + '.'], 'How old is the record, and what does it trap?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['We know past climates only from written records.', false, 'Ice cores, tree rings, sediments and corals reach back far beyond writing.'],
        ['Antarctic ice cores reach back about 800,000 years.', true, 'The EPICA Dome C core covers about eight glacial cycles.'],
        ['In ice cores, CO₂ and temperature rose and fell together through the ice ages.', true, 'The records track each other through every cycle.'],
        ['Today\'s CO₂ level is within the range found in ice cores for the last 800,000 years.', false, 'About 425 ppm is well above the cores\' highest values, about 300 ppm.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Nature keeps layered records.', { vk: 'concept' });
    }
    return lv(R, ctx, [layers, rings, proxy], [layers, compare, proxy, tfq], [age, compare, proxy]);
  });

  G('weather.climate-sensitivity', function (R, ctx) {
    function doublings() {
      var n = R.int(1, 4), C0 = R.pick([180, 200, 250, 260, 270, 280, 290, 300]), C = C0 * MA.pow(2, n);
      return pr('CO₂ goes from ' + q(C0, 'ppm') + ' to ' + q(C, 'ppm') + '. How many doublings is that?', num(n, 0.0001), [nt(C) + ' ÷ ' + nt(C0) + ' = ' + MA.pow(2, n) + ' = 2^' + n + '.', n + ' doubling' + (n > 1 ? 's' : '') + '.'], 'How many times do you double to get there?', { vk: 'doub', vd: { C0: C0, C: C } });
    }
    function warm() {
      var n = R.int(1, 3), S = R.pick([2, 2.5, 3, 3.5, 4, 4.5]), C0 = 280, C = C0 * MA.pow(2, n);
      return pr('With a climate sensitivity of ' + q(S, '°C') + ' per doubling, how much eventual warming would come from raising CO₂ from 280 to ' + q(C, 'ppm') + '?', num(S * n, 0.01), ['Doublings: ' + C + ' ÷ 280 = ' + MA.pow(2, n) + ', so ' + n + '.', 'Warming: ' + nt(S) + ' × ' + n + ' = ' + q(S * n, '°C') + '.'], 'Count doublings, then multiply.', { unit: '°C', vk: 'warm', vd: { S: S, C: C } });
    }
    function forcing() {
      var r = R.pick([2, 4, 1.5, 3, 8, 1.25, 1.2, 2.5, 5, 6]), F = 5.35 * MA.log(r);
      return pr('Using $\\Delta F = 5.35 \\ln(C/C_0)$, what forcing comes from multiplying CO₂ by ' + nt(r) + '?', num(F, 0.01), ['ln ' + nt(r) + ' ≈ ' + nt(rnd(MA.log(r), 4)) + '.', '5.35 × ' + nt(rnd(MA.log(r), 4)) + ' ≈ ' + q(rnd(F, 2), 'W/m²') + '.'], 'Multiply 5.35 by the natural log of the ratio.', { unit: 'W/m²', vk: 'forc', vd: { r: r } });
    }
    function general() {
      var C = R.pick([350, 400, 425, 450, 500, 600, 700, 800]), S = R.pick([2.5, 3, 3.5, 4]), n = MA.log(C / 280) / MA.LN2, dT = S * n;
      return pr('Eventual warming ≈ $S \\times \\log_2(C/C_0)$. With $S$ = ' + q(S, '°C') + ' per doubling and $C_0$ = 280 ppm, what eventual warming comes with ' + q(C, 'ppm') + '?', num(dT, 0.01), ['$\\log_2$(' + C + '/280) = ln(' + nt(rnd(C / 280, 4)) + ') ÷ ln 2 ≈ ' + nt(rnd(n, 3)) + ' doublings.', 'Warming ≈ ' + nt(S) + ' × ' + nt(rnd(n, 3)) + ' ≈ ' + q(rnd(dT, 2), '°C') + '.'], 'Find the number of doublings with a base-2 logarithm.', { unit: '°C', vk: 'gen', vd: { C: C, S: S } });
    }
    function target() {
      var dT = R.pick([1.5, 2, 3, 4.5, 2.5, 3.5, 4]), S = 3, C = 280 * MA.pow(2, dT / S);
      return pr('With a sensitivity of 3 °C per doubling and $C_0$ = 280 ppm, at what CO₂ level would the eventual warming be ' + q(dT, '°C') + '?', num(C, 0.01), ['Doublings needed: ' + nt(dT) + ' ÷ 3 = ' + nt(rnd(dT / 3, 4)) + '.', '$C$ = 280 × 2^' + nt(rnd(dT / 3, 4)) + ' ≈ ' + q(rnd(C, 0), 'ppm') + '.'], 'Undo the logarithm with a power of 2.', { unit: 'ppm', vk: 'target', vd: { dT: dT } });
    }
    function range() {
      var n = R.pick([0.5, 1, 1.5, 2, 0.6, 0.7, 0.9, 1.2]), vl = R.coin(), a0 = vl ? 2 : 2.5, b0 = vl ? 5 : 4, lo = a0 * n, hi = b0 * n;
      return pr('The equilibrium climate sensitivity is ' + (vl ? 'very likely 2 to 5' : 'likely 2.5 to 4') + ' °C per doubling. For ' + nt(n) + ' doubling' + (n === 1 ? '' : 's') + ' of CO₂, what is the width of that range of eventual warming?', num(hi - lo, 0.01), ['Range: ' + nt(lo) + ' to ' + nt(hi) + ' °C.', 'Width: ' + nt(hi) + ' − ' + nt(lo) + ' = ' + q(fix(hi - lo), '°C') + '.'], 'Multiply both ends by the number of doublings.', { unit: '°C', vk: 'range', vd: { _n: n } });
    }
    function pushN() {
      var n = R.int(1, 4), C0 = R.pick([250, 280, 300]), C = C0 * MA.pow(2, n), F = 3.7 * n;
      return pr('Each doubling of CO₂ adds about 3.7 W/m² of forcing. What is the forcing when CO₂ rises from ' + q(C0, 'ppm') + ' to ' + q(C, 'ppm') + '?', num(F, 0.01), ['Doublings: ' + C + ' ÷ ' + C0 + ' = ' + MA.pow(2, n) + ' = 2^' + n + '.', 'Forcing: ' + n + ' × 3.7 = ' + q(fix(F), 'W/m²') + '.'], 'Count the doublings.', { unit: 'W/m²', vk: 'pushn', vd: { C0: C0, C: C } });
    }
    function sFrom() {
      var n = R.pick([1, 2, 3]), S = R.pick([2, 2.5, 3, 3.5, 4]), dT = S * n;
      return pr('A model warms ' + q(dT, '°C') + ' at equilibrium after CO₂ is multiplied by ' + MA.pow(2, n) + '. What climate sensitivity (°C per doubling) does the model have?', num(S, 0.01), ['Multiplying by ' + MA.pow(2, n) + ' is ' + n + ' doubling' + (n > 1 ? 's' : '') + '.', 'Sensitivity: ' + nt(dT) + ' ÷ ' + n + ' = ' + q(S, '°C') + ' per doubling.'], 'Divide the warming by the number of doublings.', { unit: '°C', vk: 'sfrom', vd: { dT: dT, _n: n } });
    }
    function tfq() {
      var K = R.pick([
        ['Going from 280 to 560 ppm warms about as much as going from 560 to 1120 ppm.', true, 'Each doubling adds about the same forcing.'],
        ['Each extra ppm of CO₂ adds the same amount of warming.', false, 'The forcing grows with the logarithm: each extra ppm adds a little less.'],
        ['The IPCC\'s best estimate of the equilibrium climate sensitivity is about 3 °C per doubling.', true, 'Likely 2.5 to 4 °C.'],
        ['Earth reaches its full equilibrium warming the same year the CO₂ rises.', false, 'The deep ocean takes centuries to warm, so the warming lags.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Equal ratios, equal forcing.', { vk: 'concept' });
    }
    return lv(R, ctx, [doublings, warm, pushN, tfq], [warm, forcing, range, sFrom, tfq], [general, target, forcing, sFrom]);
  });

  G('weather.sea-level-rise', function (R, ctx) {
    var OCEAN = 3.61e8;
    function melt() {
      var V = R.pick([100, 361, 500, 1000, 2000, 3610, 10000]), mm = V * 0.917 / OCEAN * 1e6;
      return pr('A mass of ice on land with a volume of ' + q(V, 'km³') + ' (density 0.917 g/cm³) melts into the ocean. The ocean covers about 361,000,000 km². By about how many millimeters does sea level rise?', num(mm, 0.01), ['Water: ' + nt(V) + ' × 0.917 = ' + q(fix(V * 0.917), 'km³') + '.', 'Spread out: ' + nt(fix(V * 0.917)) + ' ÷ 361,000,000 km² ≈ ' + M(nt(sig(V * 0.917 / OCEAN / 1e-6, 3)) + ' \\times 10^{-6}') + ' km ≈ ' + q(sig(mm, 3), 'mm') + '.'], 'Turn the ice into water, then spread it over the ocean.', { unit: 'mm', vk: 'melt', vd: { V: V } });
    }
    function sheet() {
      var V = R.pick([2.9, 0.1, 0.5, 26.5]), m = V * 1e6 * 0.917 / OCEAN * 1000;
      var nmz = V === 2.9 ? 'Greenland\'s ice sheet (about 2.9 million km³)' : V === 26.5 ? 'Antarctica\'s ice (about 26.5 million km³)' : 'an ice sheet of ' + nt(V) + ' million km³';
      return pr('If all of ' + nmz + ' melted (density 0.917), about how many meters would global sea level rise? Ocean area: about 361,000,000 km².', num(m, 0.02), ['Water: ' + nt(V) + ' × 10⁶ × 0.917 ≈ ' + M(nt(sig(V * 0.917, 3)) + ' \\times 10^{6}') + ' km³.', 'Rise: that ÷ 3.61 × 10⁸ km² ≈ ' + nt(sig(m / 1000, 3)) + ' km ≈ ' + q(sig(m, 3), 'm') + '. (The real figure is a little smaller, since some ice sits below sea level.)'], 'Same method as for a small ice cap, with bigger numbers.', { unit: 'm', vk: 'sheet', vd: { V: V } });
    }
    function thermal() {
      var d = R.pick([500, 700, 1000, 2000, 600, 800, 1200, 1500]), b = R.pick([0.0001, 0.0002, 0.0003, 0.00012, 0.00015, 0.00025]), t = R.pick([0.2, 0.5, 1, 0.25, 0.6, 0.9]), h = d * b * t;
      return pr('The top ' + q(d, 'm') + ' of the ocean warms by ' + q(t, '°C') + ', and seawater expands by ' + nt(b) + ' of its height for each °C. By how many centimeters does sea level rise?', num(h * 100, 0.01), ['Rise = ' + nt(d) + ' × ' + nt(b) + ' × ' + nt(t) + ' = ' + q(fix(h), 'm') + '.', '= ' + q(fix(h * 100), 'cm') + '.'], 'Multiply the depth by the expansion per degree and the warming.', { unit: 'cm', vk: 'thermal', vd: { d: d, b: b, t: t } });
    }
    function rate() {
      var r = R.pick([3, 3.7, 4, 4.5]), y = R.pick([10, 20, 25, 50, 12, 26, 36, 48]), x = r * y / 10;
      return pr('If sea level rises ' + q(r, 'mm') + ' a year, how many centimeters does it rise in ' + y + ' years?', num(x, 0.01), [nt(r) + ' × ' + y + ' = ' + q(fix(r * y), 'mm') + ' = ' + q(fix(x), 'cm') + '.'], 'Multiply, then change millimeters to centimeters.', { unit: 'cm', vk: 'rate', vd: { r: r, y: y } });
    }
    function which() {
      var K = R.pick([
        ['Which would raise sea level if it melted?', 'Glaciers in the Himalayas', ['Floating Arctic sea ice', 'Icebergs already in the ocean', 'Ice cubes floating in a glass']],
        ['Why doesn\'t melting sea ice raise sea level much?', 'Floating ice already pushes aside its own weight of water', ['Sea ice is made of salt, not water', 'Sea ice evaporates instead of melting', 'Sea ice is too thin to matter']],
        ['Since 1971, roughly what share of sea-level rise came from warming water expanding?', 'About half', ['None of it', 'All of it', 'About a tenth']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Land ice adds water to the ocean; floating ice does not; warming water expands.', 'Answer: ' + K[1] + '.'], 'Is the ice floating or on land?', { vk: 'concept' });
    }
    function tfq() {
      var K = R.pick([
        ['Melting Arctic sea ice is a major cause of sea-level rise.', false, 'Floating ice already displaces its own weight; only land ice adds water.'],
        ['Warming seawater takes up more space, raising sea level.', true, 'Thermal expansion has caused about half of the rise since 1971.'],
        ['Global sea level rose about 20 cm from 1901 to 2018.', true, 'IPCC (2021).'],
        ['Sea level stopped rising once satellite measurements began in 1993.', false, 'Satellites show about 10 cm of rise since 1993, and the rate has increased.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Floating ice or land ice?', { vk: 'concept' });
    }
    return lv(R, ctx, [rate, which, tfq], [melt, thermal, which, rate], [sheet, melt, thermal]);
  });

  G('weather.climate-projections', function (R, ctx) {
    var SSP = [['SSP1-1.9', 1.4, 1.0, 1.8], ['SSP1-2.6', 1.8, 1.3, 2.4], ['SSP2-4.5', 2.7, 2.1, 3.5], ['SSP3-7.0', 3.6, 2.8, 4.6], ['SSP5-8.5', 4.4, 3.3, 5.7]];
    function tbl() { return SSP.map(function (s) { return s[0] + ': ' + nt(s[1]) + ' (' + nt(s[2]) + '–' + nt(s[3]) + ')'; }).join('; '); }
    function diff() {
      var a = R.int(0, 3), b = R.int(a + 1, 4), d = fix(SSP[b][1] - SSP[a][1]);
      return pr('IPCC best estimates (and very likely ranges) of warming by 2081–2100 compared with 1850–1900, in °C: ' + tbl() + '. How much more warming does ' + SSP[b][0] + ' project than ' + SSP[a][0] + '?', num(d, 0.0001, 0.01), [nt(SSP[b][1]) + ' − ' + nt(SSP[a][1]) + ' = ' + q(d, '°C') + '.'], 'Subtract the best estimates.', { unit: '°C', vk: 'diff', vd: { _a: a, _b: b } });
    }
    function width() {
      var s = R.pick(SSP), w = fix(s[3] - s[2]);
      return pr('For scenario ' + s[0] + ', the IPCC gives a very likely range of ' + nt(s[2]) + ' to ' + nt(s[3]) + ' °C of warming by 2081–2100. How wide is that range?', num(w, 0.0001, 0.01), [nt(s[3]) + ' − ' + nt(s[2]) + ' = ' + q(w, '°C') + '.'], 'High end minus low end.', { unit: '°C', vk: 'width', vd: { lo: s[2], hi: s[3] } });
    }
    function coin() {
      var n = R.pick([100, 400, 2500, 10000]), ask = R.coin();
      if (ask) return pr('A fair coin is tossed ' + nt(n) + ' times. About how many heads do you expect?', num(n / 2, 0.0001), ['Each toss has a 1/2 chance: ' + nt(n) + ' × 0.5 = ' + nt(n / 2) + '.', 'One toss is unpredictable; the total is very predictable, like climate compared with weather.'], 'Probability times the number of tosses.', { vk: 'heads', vd: { n: n } });
      var sd = MA.sqrt(n * 0.25);
      return pr('For ' + nt(n) + ' tosses of a fair coin, the number of heads has a standard deviation of $\\sqrt{n \\times 0.5 \\times 0.5}$. What is it?', num(sd, 0.01), ['$\\sqrt{' + n + ' \\times 0.25}$ = √' + nt(n * 0.25) + ' = ' + nt(sd) + '.', 'So about 95% of the time the count lands within ' + nt(2 * sd) + ' of ' + nt(n / 2) + ': a small spread around a predictable average.'], 'Multiply, then take the square root.', { vk: 'sd', vd: { n: n } });
    }
    function concept() {
      var K = R.pick([
        ['What does a climate model projection give for 2080?', 'The likely average climate (and the range of its weather) under a given emissions scenario', ['The weather on a particular day in 2080', 'An exact temperature for each city on each date', 'A guarantee of what emissions will be']],
        ['Why can climate be projected decades ahead when weather can\'t be forecast two weeks ahead?', 'Climate is the average of weather, set by the energy balance, which depends on the forcings, not on tiny details of today\'s weather', ['Climate models use different laws of physics', 'Climate models run on faster computers', 'Weather is less chaotic over long times']],
        ['By late this century, what is the biggest source of uncertainty in how much Earth warms?', 'Which path of emissions people take', ['Not knowing today\'s temperature', 'The Coriolis effect', 'Errors in weather balloons']],
        ['How are climate models tested?', 'By running them over the past and comparing with the measured climate', ['They cannot be tested at all', 'By checking tomorrow\'s weather forecast', 'By asking forecasters to vote']]
      ]);
      return pr(K[0], mc(K[1], K[2]), ['Projections describe long-term statistics for a scenario, not dated weather.', 'Answer: ' + K[1] + '.'], 'Climate is the average of weather.', { vk: 'concept' });
    }
    function ens() {
      var v = [R.int(25, 35) / 10, R.int(25, 35) / 10, R.int(25, 35) / 10, R.int(25, 35) / 10, R.int(25, 35) / 10], m = v.reduce(function (a, b) { return a + b; }, 0) / 5;
      return pr('Five climate models project these warmings by 2100 for the same scenario (°C): ' + v.map(function (x) { return nt(x); }).join(', ') + '. What is their average?', num(rnd(m, 3), 0.0001, 0.006), ['Sum: ' + nt(fix(v.reduce(function (a, b) { return a + b; }, 0))) + '.', 'Average: ÷ 5 = ' + q(rnd(m, 2), '°C') + '. The spread among models shows part of the uncertainty.'], 'Add them and divide by 5.', { unit: '°C', vk: 'ens', vd: { _v: v } });
    }
    function tfq() {
      var K = R.pick([
        ['Because weather can\'t be forecast weeks ahead, climate can\'t be projected decades ahead.', false, 'Climate is the average of weather, set by the energy balance.'],
        ['Global surface temperature in 2011–2020 was about 1.1 °C above 1850–1900.', true, 'IPCC (2021).'],
        ['A projection for a very-high-emissions scenario predicts what will happen no matter what people do.', false, 'Each projection depends on its scenario of future emissions.'],
        ['Climate models reproduce the last century\'s warming only when human forcings are included.', true, 'Natural forcings alone don\'t produce it.']
      ]);
      return pr('True or false: ' + K[0], tf(K[1]), [K[2], K[1] ? 'True.' : 'False.'], 'Projections are scenario-based averages.', { vk: 'concept' });
    }
    return lv(R, ctx, [concept, width, tfq], [diff, width, coin, concept], [diff, ens, coin]);
  });

})(window.MathLadder);

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
  var COURSE = 'weather', YOUNG = false, VAR = {};
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
