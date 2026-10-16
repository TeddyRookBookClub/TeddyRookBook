/* Generators for phys2, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* Physics Ladder problem generators: Physics 2, part A (units fluids, thermodynamics, electrostatics, circuits).
   Built by /tmp/work_phys2_A/build_gen.js from the unit sources in /tmp/work_phys2_A/src/gen/ (one file per unit) and
   merged with part B by /tmp/merge_parts.js. Every topic has a generator that works at levels 1-3. Answers are computed
   from the generated numbers; a node test in the work dir (test/verify.js) recomputes them by a different route from a
   hidden `chk` record that problems carry only when MathLadder.__p2Atest is set.
   Conventions (Physics Ladder overview): SI units, g = 9.8 m/s², ΔU = Q + W with W the work done ON the gas,
   conventional current, k = 8.99 × 10⁹ N·m²/C², e = 1.60 × 10⁻¹⁹ C, R = 8.31 J/(mol·K), k_B = 1.38 × 10⁻²³ J/K. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, U = ML.util, by = ML.byLevel;

  // ---------------------------------------------------------------- long inline math becomes display math
  function visLen(tex) {
    var t = tex.replace(/\\(left|right|,|;|quad|qquad|!)/g, '').replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, function (m, a, b) { return a.length > b.length ? a : b; })
      .replace(/\\text\{([^}]*)\}/g, '$1'), ops = (t.match(/[-+=<>]|\\(le|ge|cdot|times|pm|ne|approx)(?![a-z])/g) || []).length;
    return t.replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length + 0.7 * ops;
  }
  function displayLong(s, lim) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    var out = '', i = 0;
    while (i < s.length) {
      if (s[i] === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (s[i] === '$' && s[i + 1] === '$') { var j = s.indexOf('$$', i + 2); if (j < 0) { out += s.slice(i); break; } out += s.slice(i, j + 2); i = j + 2; continue; }
      if (s[i] === '$') {
        var k = i + 1; while (k < s.length && !(s[k] === '$' && s[k - 1] !== '\\')) k++;
        if (k >= s.length) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, k);
        if (visLen(tex) > lim && !/\\begin\{/.test(tex)) { if ('.,;'.indexOf(s[k + 1]) >= 0 && k + 1 < s.length) { tex += s[k + 1]; k++; } out += '$$' + tex + '$$'; }
        else out += '$' + tex + '$';
        i = k + 1; continue;
      }
      out += s[i]; i++;
    }
    return out;
  }
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var p = fn(R, ctx);
      if (p && typeof p === 'object') {
        p.q = displayLong(p.q, 30); if (p.hint) p.hint = displayLong(p.hint, 30);
        if (Array.isArray(p.steps)) p.steps = p.steps.map(function (x) { return displayLong(x, 27); });
        if (!ML.__p2Atest) delete p.chk;
      }
      return p;
    });
  }

  // ---------------------------------------------------------------- numbers
  var abs = Math.abs, sqrt = Math.sqrt, PI = Math.PI;
  var K_E = 8.99e9, QE = 1.60e-19, ME = 9.11e-31, MP = 1.67e-27, EPS0 = 8.85e-12, RG = 8.31, KB = 1.38e-23, NA = 6.02e23, SIG = 5.67e-8, WIEN = 2.898e-3;
  var GR = 9.8, PATM = 1.01e5;
  function sfp(x, n) { // {neg, m (string with n-1 decimals), e}
    var a = abs(x), e = Math.floor(Math.log10(a) + 1e-12), m = +(a / Math.pow(10, e)).toFixed(n - 1);
    if (m >= 10) { e++; m = +(a / Math.pow(10, e)).toFixed(n - 1); }
    if (m < 1) { e--; m = +(a / Math.pow(10, e)).toFixed(n - 1); }
    return { neg: x < 0, m: m.toFixed(n - 1), e: e };
  }
  function rd(x, n) { if (!x || !isFinite(x)) return x; var P = sfp(x, n || 3); return (P.neg ? -1 : 1) * +(P.m + 'e' + P.e); } // round to n sig figs
  function group(s) { var m = /^(\d+)(\.\d+)?$/.exec(s); if (!m || m[1].length < 5) return s; return m[1].replace(/\B(?=(\d{3})+(?!\d))/g, '{,}') + (m[2] || ''); }
  /* tn(x, n): TeX of x to n significant figures (default 3), trailing zeros kept (2.50); scientific notation when
     |x| >= 10^5 or |x| < 10^-3; thousands grouped from 10,000 */
  function tn(x, n) {
    n = n || 3; if (x === 0) return '0'; if (!isFinite(x)) throw new Error('tn: ' + x);
    var P = sfp(x, n), sg = P.neg ? '-' : '';
    if (P.e >= 5 || P.e <= -4) return sg + P.m + ' \\times 10^{' + P.e + '}';
    var dp = Math.max(0, n - 1 - P.e), s = (+(P.m + 'e' + P.e)).toFixed(dp);
    return sg + group(s);
  }
  function tx(x) { return T.num(x); } // an exact given number ("2.5", "1200")
  function tg(x) { // a given measured number, at least two significant figures: 5 -> "5.0", 0.5 -> "0.50", 12 -> "12"
    var s = T.num(x), d = s.replace(/^-/, '').replace('.', '').replace(/^0+/, '');
    if (d.length >= 2 || /\{,\}|e/.test(s)) return s;
    return s.indexOf('.') >= 0 ? s + '0' : (Math.abs(x) < 10 ? s + '.0' : s);
  }
  /* vs(x, n): an answer value string to n significant figures ("29400", "0.0123", "1.92e12") */
  function vs(x, n) {
    n = n || 3; if (x === 0) return '0'; var P = sfp(x, n), sg = P.neg ? '-' : '';
    if (P.e >= 5 || P.e <= -4) return sg + P.m + 'e' + P.e;
    var dp = Math.max(0, n - 1 - P.e); return sg + (+(P.m + 'e' + P.e)).toFixed(dp);
  }
  function ans(x, o) { var a = { t: 'num', v: vs(x, (o && o.n) || 3), rtol: (o && o.rtol) || 0.02 }; return a; }
  function exact(x) { return { t: 'num', v: U.numStr(U.fix(x)) }; }
  // TeX units
  var UT = { 'm/s2': '\\text{m/s}^2', 'kg/m3': '\\text{kg/m}^3', 'm2': '\\text{m}^2', 'm3': '\\text{m}^3', 'cm2': '\\text{cm}^2', 'm3/s': '\\text{m}^3\\text{/s}',
    'Ohm': '\\Omega', 'kOhm': '\\text{k}\\Omega', 'Ohm m': '\\Omega \\cdot \\text{m}', 'uC': '\\mu\\text{C}', 'uF': '\\mu\\text{F}', 'uJ': '\\mu\\text{J}', 'uA': '\\mu\\text{A}', 'um': '\\mu\\text{m}',
    'Nm2/C2': '\\text{N}\\cdot\\text{m}^2/\\text{C}^2', 'J/kgK': '\\text{J/(kg}\\cdot\\text{K)}', 'J/molK': '\\text{J/(mol}\\cdot\\text{K)}', 'W/mK': '\\text{W/(m}\\cdot\\text{K)}',
    'W/m2K4': '\\text{W/(m}^2\\cdot\\text{K}^4\\text{)}', 'mK': '\\text{m}\\cdot\\text{K}', 'degC': '^\\circ\\text{C}', 'C2/Nm2': '\\text{C}^2/(\\text{N}\\cdot\\text{m}^2)' };
  function ut(u) { return u === 'degC' ? '\\,^\\circ\\text{C}' : '\\,' + (UT[u] || '\\text{' + u + '}'); }
  function qt(x, u, n) { return tn(x, n) + ut(u); }          // a quantity: "2.94 \times 10^{4}\,\text{Pa}"
  function qx(x, u) { return tg(x) + ut(u); }                 // an exact given quantity
  function qp(x, u, n) { return '(' + qt(x, u, n) + ')'; }   // in parentheses, ready to multiply
  // pick a kind of problem by level: lists of kind names for levels 1, 2, 3
  function kind(R, ctx, a, b, c) { return R.pick(by(ctx, a, b || a, c || b || a)); }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pct(x, n) { return tn(x * 100, n || 3) + '\\%'; }

  // ================================================================ UNIT 1: FLUIDS
  var LIQ = [{ n: 'fresh water', where: 'a lake', rho: 1000 }, { n: 'fresh water', where: 'a swimming pool', rho: 1000 }, { n: 'seawater', where: 'the ocean', rho: 1025 },
    { n: 'olive oil', where: 'a tall tank of olive oil', rho: 920 }, { n: 'glycerin', where: 'a tank of glycerin', rho: 1260 }];

  G('phys2.pressure-depth', function (R, ctx) {
    var k = kind(R, ctx, ['gauge', 'gauge', 'shape', 'depth'], ['gauge', 'absolute', 'depth', 'shape', 'difference'], ['absolute', 'difference', 'force', 'twice', 'depth']);
    var L = k === 'gauge' || k === 'depth' ? R.pick(LIQ) : R.pick(LIQ.slice(0, 3)), rho = L.rho;
    var givenRho = 'Use $\\rho = ' + qx(rho, 'kg/m3') + '$ for ' + L.n + ' and $g = ' + qx(GR, 'm/s2') + '$.';
    if (k === 'shape') {
      var h0 = R.pick([0.5, 0.8, 1.0, 1.2]);
      return { q: 'Four containers of different shapes (narrow, wide, flared at the top and tapered at the top) are filled with ' + L.n + ' to the same depth, $' + qx(h0, 'm') + '$. At which container\'s bottom is the water pressure greatest?',
        a: mc('It is the same at all four bottoms.', ['The wide one, because it holds the most water.', 'The narrow one, because the water is squeezed into a small space.', 'The one flared at the top, because the most water is above its bottom.']),
        steps: ['In a still fluid the pressure at depth $h$ is $P = P_0 + \\rho g h$. Only the depth, the fluid and the air pressure on top appear in it.',
          'All four bottoms are at the same depth, $' + qx(h0, 'm') + '$, in the same liquid with the same air above, so the pressure there is the same.',
          'The extra water in a wide container rests on its larger floor (and the slanted walls push on the water too), so the pressure, force per area, does not grow.'],
        hint: 'Which quantities appear in $P = P_0 + \\rho g h$? Is the width one of them?', chk: { k: k, ans: 0 } };
    }
    if (k === 'gauge') {
      var h = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 12, 15, 20]), Pg = rho * GR * h;
      return { q: 'What is the gauge pressure $' + qx(h, 'm') + '$ below the surface of ' + L.where + '? ' + givenRho, a: ans(Pg), unit: 'Pa',
        steps: ['Gauge pressure leaves out the air pressure on top, so it is the pressure of the liquid column alone: $P_g = \\rho g h$.',
          '$P_g = ' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + qp(h, 'm') + ' = ' + qt(Pg, 'Pa') + '$.',
          'Check the unit: $\\text{kg/m}^3 \\cdot \\text{m/s}^2 \\cdot \\text{m} = \\text{N/m}^2 = \\text{Pa}$.'],
        hint: 'Gauge pressure is $\\rho g h$: the weight of the liquid column per square meter.', chk: { k: k, rho: rho, h: h, ans: Pg } };
    }
    if (k === 'absolute') {
      var h2 = R.pick([2.0, 3.0, 5.0, 8.0, 10, 12, 15, 20, 25, 30]), Pg2 = rho * GR * h2, Pa = (PATM + Pg2) / 1000;
      return { q: 'What is the absolute pressure $' + qx(h2, 'm') + '$ below the surface of ' + L.where + '? The air pressure at the surface is $' + qt(PATM, 'Pa') + '$. ' + givenRho + ' Give your answer in kPa.', a: ans(Pa), unit: 'kPa',
        steps: ['Absolute pressure is the air pressure on top plus the pressure of the liquid column: $P = P_0 + \\rho g h$.',
          'Liquid column: $\\rho g h = ' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + qp(h2, 'm') + ' = ' + qt(Pg2, 'Pa') + '$.',
          '$P = ' + qt(PATM, 'Pa') + ' + ' + qt(Pg2, 'Pa') + ' = ' + qt(Pa * 1000, 'Pa') + ' = ' + qt(Pa, 'kPa') + '$.'],
        hint: 'Add the air pressure at the surface to $\\rho g h$.', chk: { k: k, rho: rho, h: h2, ans: Pa } };
    }
    if (k === 'depth') {
      var h3 = R.pick([1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 7.5, 10]), Pg3 = rd(rho * GR * h3, 3), hh = Pg3 / (rho * GR);
      return { q: 'A gauge in ' + L.where + ' reads a gauge pressure of $' + qt(Pg3, 'Pa') + '$. How deep is the gauge? ' + givenRho, a: ans(hh), unit: 'm',
        steps: ['Gauge pressure is $P_g = \\rho g h$, so $h = \\dfrac{P_g}{\\rho g}$.',
          '$h = \\dfrac{' + qt(Pg3, 'Pa') + '}{' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + '} = ' + qt(hh, 'm') + '$.'],
        hint: 'Solve $P_g = \\rho g h$ for $h$.', chk: { k: k, rho: rho, P: Pg3, ans: hh } };
    }
    if (k === 'difference') {
      var a1 = R.pick([2, 3, 4, 5]), a2 = a1 + R.pick([3, 5, 6, 8, 10, 12]), dP = rho * GR * (a2 - a1);
      return { q: 'A diver in ' + L.where + ' swims down from $' + qx(a1, 'm') + '$ to $' + qx(a2, 'm') + '$ below the surface. By how much does the pressure on her increase? ' + givenRho, a: ans(dP), unit: 'Pa',
        steps: ['At each depth $P = P_0 + \\rho g h$. Subtracting, the air pressure $P_0$ cancels: $\\Delta P = \\rho g\\,\\Delta h$.',
          '$\\Delta h = ' + qx(a2, 'm') + ' - ' + qx(a1, 'm') + ' = ' + qx(a2 - a1, 'm') + '$.',
          '$\\Delta P = ' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + qp(a2 - a1, 'm') + ' = ' + qt(dP, 'Pa') + '$.'],
        hint: 'Only the change in depth matters: $\\Delta P = \\rho g \\Delta h$.', chk: { k: k, rho: rho, h1: a1, h2: a2, ans: dP } };
    }
    if (k === 'force') {
      var h4 = R.pick([20, 30, 40, 50, 80, 100]), A = R.pick([0.040, 0.050, 0.080, 0.10, 0.12, 0.20]), Pg4 = rho * GR * h4, F = Pg4 * A;
      return { q: 'A research submarine has a flat window of area $' + qx(A, 'm2') + '$, $' + qx(h4, 'm') + '$ below the surface of ' + L.where + '. The air inside is kept at atmospheric pressure. What is the net force of the water on the window? ' + givenRho, a: ans(F), unit: 'N',
        steps: ['Air pushes on both sides of the window with atmospheric pressure, so those forces cancel. The net push comes from the gauge pressure $\\rho g h$.',
          '$P_g = ' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + qp(h4, 'm') + ' = ' + qt(Pg4, 'Pa') + '$.',
          'Pressure is force per area, so $F = P_g A = ' + qp(Pg4, 'Pa') + qp(A, 'm2') + ' = ' + qt(F, 'N') + '$.'],
        hint: 'Find the gauge pressure, then use $F = PA$.', chk: { k: k, rho: rho, h: h4, A: A, ans: F } };
    }
    // twice: depth where the absolute pressure is n atmospheres
    var nAt = R.pick([2, 2, 3]), hT = (nAt - 1) * PATM / (rho * GR);
    return { q: 'At what depth in ' + L.where + ' is the absolute pressure ' + (nAt === 2 ? 'twice' : 'three times') + ' the air pressure at the surface, $' + qt(PATM, 'Pa') + '$? ' + givenRho, a: ans(hT), unit: 'm',
      steps: ['We need $P_0 + \\rho g h = ' + nAt + 'P_0$, so the liquid column must supply $' + (nAt - 1 === 1 ? '' : (nAt - 1)) + 'P_0$: $\\rho g h = ' + (nAt - 1 === 1 ? '' : (nAt - 1)) + 'P_0$.',
        '$h = \\dfrac{' + (nAt - 1 === 1 ? '' : nAt - 1 + ' \\times ') + qt(PATM, 'Pa') + '}{' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + '} = ' + qt(hT, 'm') + '$.',
        'So every ' + tn(PATM / (rho * GR), 3) + ' m or so of ' + L.n + ' adds about one more atmosphere.'],
      hint: 'Set $P_0 + \\rho g h$ equal to ' + nAt + ' times $P_0$ and solve for $h$.', chk: { k: k, rho: rho, n: nAt, ans: hT } };
  });

  G('phys2.pascals-principle', function (R, ctx) {
    var k = kind(R, ctx, ['force', 'lift', 'concept'], ['force', 'lift', 'distance', 'diameter', 'concept'], ['diameter', 'work', 'lift', 'distance']);
    if (k === 'concept') {
      return { q: 'In a hydraulic lift, you push a small piston down with a small force and a large piston lifts a heavy load. Ignoring friction, how does the work done on the load compare with the work you do on the small piston?',
        a: mc('They are equal: the load rises a much shorter distance than your piston moves.', ['The work on the load is larger, by the ratio of the piston areas.', 'The work on the load is smaller, by the ratio of the piston areas.', 'The work on the load is larger, because the pressure is multiplied.']),
        viz: { name: 'ph-fluids', opts: { mode: 'hydraulic', interactive: false, quiet: true } },
        steps: ['The pressure is the same on both pistons, so $F_2 = F_1 \\dfrac{A_2}{A_1}$: the force is multiplied.',
          'The liquid does not compress, so the volume pushed out of the small cylinder fills the large one: $A_1 d_1 = A_2 d_2$, so $d_2 = d_1 \\dfrac{A_1}{A_2}$. The distance is divided by the same ratio.',
          'Work out: $F_2 d_2 = F_1 \\dfrac{A_2}{A_1} \\cdot d_1 \\dfrac{A_1}{A_2} = F_1 d_1$, the work in. A hydraulic lift trades distance for force; it does not make energy.'],
        hint: 'Compare how far each piston moves.', chk: { k: k, ans: 0 } };
    }
    if (k === 'force') {
      var A1 = R.pick([2, 4, 5, 8, 10]), ratio = R.pick([20, 25, 40, 50, 60, 80]), A2 = A1 * ratio, F1 = R.pick([50, 80, 100, 120, 150, 200, 250]), F2 = F1 * A2 / A1;
      return { q: 'A hydraulic press has a small piston of area $' + qx(A1, 'cm2') + '$ and a large piston of area $' + qx(A2, 'cm2') + '$. You push the small piston with $' + qx(F1, 'N') + '$. What force does the large piston exert?', a: ans(F2), unit: 'N',
        viz: { name: 'ph-fluids', opts: { mode: 'hydraulic', F: F1, A1: A1 / 1e4, A2: A2 / 1e4, interactive: false, quiet: true } },
        steps: ['Pascal\'s principle: the pressure you add, $F_1/A_1$, reaches every part of the liquid, so $\\dfrac{F_1}{A_1} = \\dfrac{F_2}{A_2}$.',
          '$F_2 = F_1 \\dfrac{A_2}{A_1} = ' + qp(F1, 'N') + '\\dfrac{' + qx(A2, 'cm2') + '}{' + qx(A1, 'cm2') + '} = ' + qx(F1, 'N') + ' \\times ' + ratio + ' = ' + qt(F2, 'N') + '$.',
          'The areas appear as a ratio, so square centimeters are fine; they cancel.'],
        hint: 'The pressure $F/A$ is the same on both pistons.', chk: { k: k, F1: F1, A1: A1, A2: A2, ans: F2 } };
    }
    if (k === 'lift') {
      var m = R.pick([900, 1000, 1200, 1400, 1500, 1800, 2000]), a1 = R.pick([0.010, 0.020, 0.025]), a2 = R.pick([0.40, 0.50, 0.80, 1.0]), W = m * GR, f1 = W * a1 / a2;
      return { q: 'A car lift uses a large piston of area $' + qx(a2, 'm2') + '$ and a small piston of area $' + qx(a1, 'm2') + '$. What force on the small piston holds up a $' + qx(m, 'kg') + '$ car? (Ignore the masses of the pistons; $g = ' + qx(GR, 'm/s2') + '$.)', a: ans(f1), unit: 'N',
        steps: ['The large piston must push up with the car\'s weight: $F_2 = mg = ' + qp(m, 'kg') + qp(GR, 'm/s2') + ' = ' + qt(W, 'N') + '$.',
          'Equal pressures: $\\dfrac{F_1}{A_1} = \\dfrac{F_2}{A_2}$, so $F_1 = F_2 \\dfrac{A_1}{A_2}$.',
          '$F_1 = ' + qp(W, 'N') + '\\dfrac{' + qx(a1, 'm2') + '}{' + qx(a2, 'm2') + '} = ' + qt(f1, 'N') + '$.'],
        hint: 'First find the car\'s weight, then scale it by $A_1/A_2$.', chk: { k: k, m: m, A1: a1, A2: a2, ans: f1 } };
    }
    if (k === 'distance') {
      var r2 = R.pick([20, 25, 40, 50]), d1 = R.pick([20, 25, 30, 40, 50]), d2 = d1 / r2;
      return { q: 'The large piston of a hydraulic jack has ' + r2 + ' times the area of the small one. You push the small piston down $' + qx(d1, 'cm') + '$. How far does the large piston rise?', a: ans(d2), unit: 'cm',
        steps: ['The liquid does not compress, so the volume leaving the small cylinder equals the volume entering the large one: $A_1 d_1 = A_2 d_2$.',
          '$d_2 = d_1 \\dfrac{A_1}{A_2} = \\dfrac{' + qx(d1, 'cm') + '}{' + r2 + '} = ' + qt(d2, 'cm') + '$.',
          'The force is multiplied by ' + r2 + ' and the distance divided by ' + r2 + ', so the work in equals the work out.'],
        hint: 'The same volume of liquid moves from one cylinder to the other.', chk: { k: k, r: r2, d1: d1, ans: d2 } };
    }
    if (k === 'diameter') {
      var D1 = R.pick([1.0, 1.5, 2.0, 2.5]), mult = R.pick([4, 5, 6, 8, 10]), D2 = D1 * mult, F = R.pick([20, 25, 40, 50, 60]), Fo = F * mult * mult;
      return { q: 'A hydraulic system has round pistons. The small one has a diameter of $' + qx(D1, 'cm') + '$ and the large one $' + qx(D2, 'cm') + '$. A force of $' + qx(F, 'N') + '$ pushes on the small piston. What force does the large piston exert?', a: ans(Fo), unit: 'N',
        steps: ['The force grows by the ratio of the areas, $F_2 = F_1 \\dfrac{A_2}{A_1}$.',
          'A circle\'s area is $\\pi d^2/4$, so the area ratio is the square of the diameter ratio: $\\dfrac{A_2}{A_1} = \\left(\\dfrac{d_2}{d_1}\\right)^2 = ' + mult + '^2 = ' + (mult * mult) + '$.',
          '$F_2 = ' + qx(F, 'N') + ' \\times ' + (mult * mult) + ' = ' + qt(Fo, 'N') + '$.'],
        hint: 'Area goes as diameter squared.', chk: { k: k, D1: D1, D2: D2, F: F, ans: Fo } };
    }
    // work: how far to push for a given rise, then the work
    var rr = R.pick([20, 25, 40, 50]), mass = R.pick([200, 250, 400, 500]), hRise = R.pick([2.0, 4.0, 5.0]), Wl = mass * GR * hRise / 100, dPush = hRise * rr;
    return { q: 'A hydraulic lift whose large piston has ' + rr + ' times the area of the small one raises a $' + qx(mass, 'kg') + '$ load by $' + qx(hRise, 'cm') + '$. Ignoring friction, how much work do you do on the small piston? ($g = ' + qx(GR, 'm/s2') + '$)', a: ans(Wl), unit: 'J',
      steps: ['Work done on the load: $W = mgh = ' + qp(mass, 'kg') + qp(GR, 'm/s2') + qp(hRise / 100, 'm') + ' = ' + qt(Wl, 'J') + '$.',
        'You push with $1/' + rr + '$ of the load\'s weight, but $' + rr + '$ times as far ($' + qt(dPush, 'cm') + '$), so your work is the same.',
        'With no friction, energy is conserved: you do $' + qt(Wl, 'J') + '$ of work.'],
      hint: 'A machine without friction gives out the same work it takes in.', chk: { k: k, m: mass, h: hRise, ans: Wl } };
  });

  var SOLIDS = [{ n: 'aluminum', rho: 2700 }, { n: 'granite', rho: 2700 }, { n: 'iron', rho: 7900 }, { n: 'brass', rho: 8500 }, { n: 'copper', rho: 8900 }, { n: 'lead', rho: 11300 }];
  var FLOATERS = [{ n: 'pine', rho: 500 }, { n: 'oak', rho: 750 }, { n: 'ice', rho: 917 }, { n: 'cork', rho: 240 }, { n: 'maple', rho: 650 }, { n: 'a plastic (polyethylene)', rho: 950 }];

  G('phys2.buoyancy', function (R, ctx) {
    var k = kind(R, ctx, ['force', 'fraction', 'concept'], ['force', 'apparent', 'fraction', 'concept'], ['apparent', 'density', 'raft', 'fraction']);
    var fl = R.pick([{ n: 'fresh water', rho: 1000 }, { n: 'fresh water', rho: 1000 }, { n: 'seawater', rho: 1025 }]);
    var gtxt = '$g = ' + qx(GR, 'm/s2') + '$';
    if (k === 'concept') {
      var same = R.coin();
      if (same) return { q: 'A block of aluminum and a block of lead have the same volume. Both hang fully under water from strings. Which feels the larger buoyant force?',
        a: mc('They feel the same buoyant force.', ['The lead block, because it is heavier.', 'The aluminum block, because it is lighter.', 'The lead block, because it is denser.']),
        steps: ['The buoyant force is the weight of the water the object pushes aside: $F_b = \\rho_{\\text{water}} V g$.',
          'Both blocks push aside the same volume of water, so they feel the same buoyant force.',
          'What differs is their weight: the lead block is much heavier, so its string must hold more, but the water pushes up equally on both.'],
        hint: 'What does $F_b = \\rho_{\\text{fluid}} V g$ depend on?', chk: { k: k, ans: 0 } };
      return { q: 'A $1.0\\,\\text{kg}$ block of aluminum ($' + qx(2700, 'kg/m3') + '$) and a $1.0\\,\\text{kg}$ block of lead ($' + qx(11300, 'kg/m3') + '$) hang fully under water. Which feels the larger buoyant force?',
        a: mc('The aluminum block, because it takes up more space.', ['The lead block, because it is denser.', 'They feel the same force, because they have the same mass.', 'Neither: buoyancy acts only on floating objects.']),
        steps: ['The buoyant force is the weight of the water pushed aside, $F_b = \\rho_{\\text{water}} V g$, so it depends on the volume under water.',
          'Same mass, lower density means more volume: $V = m/\\rho$. The aluminum block is about $11300/2700 \\approx 4.2$ times bigger.',
          'So the aluminum block pushes aside more water and feels the larger buoyant force.'],
        hint: 'Which block is bigger?', chk: { k: k, ans: 0 } };
    }
    if (k === 'force') {
      var VL = R.pick([0.50, 0.80, 1.2, 1.5, 2.0, 2.5, 4.0]), V = VL / 1000, Fb = fl.rho * V * GR;
      return { q: 'A rock with a volume of $' + qx(VL, 'L') + '$ ($' + tn(V, 2) + '\\,\\text{m}^3$) rests fully under ' + fl.n + ' ($\\rho = ' + qx(fl.rho, 'kg/m3') + '$). What buoyant force does the water exert on it? (' + gtxt + ')', a: ans(Fb), unit: 'N',
        steps: ['Archimedes\' principle: the buoyant force equals the weight of the fluid pushed aside, $F_b = \\rho_{\\text{fluid}} V_{\\text{sub}} g$.',
          'The rock is fully under, so $V_{\\text{sub}} = ' + tn(V, 2) + '\\,\\text{m}^3$.',
          '$F_b = ' + qp(fl.rho, 'kg/m3') + '(' + tn(V, 2) + '\\,\\text{m}^3)' + qp(GR, 'm/s2') + ' = ' + qt(Fb, 'N') + '$.',
          'The rock\'s own weight does not enter: any object of this volume, fully under, feels this same push.'],
        hint: 'Find the weight of $' + qx(VL, 'L') + '$ of ' + fl.n + '.', chk: { k: k, rho: fl.rho, V: V, ans: Fb } };
    }
    if (k === 'apparent') {
      var S = R.pick(SOLIDS), VL2 = R.pick([0.20, 0.40, 0.50, 0.80, 1.0, 1.5]), V2 = VL2 / 1000, Wt = S.rho * V2 * GR, Fb2 = fl.rho * V2 * GR, Ra = Wt - Fb2;
      return { q: 'A $' + qx(VL2, 'L') + '$ block of ' + S.n + ' ($' + qx(S.rho, 'kg/m3') + '$) hangs from a spring scale, fully under ' + fl.n + ' ($' + qx(fl.rho, 'kg/m3') + '$). What does the scale read? (' + gtxt + ')', a: ans(Ra), unit: 'N',
        viz: { name: 'ph-fluids', opts: { mode: 'buoyancy', objRho: S.rho, objV: V2, rho: fl.rho, t: 1, interactive: false, quiet: true } },
        steps: ['Weight: $W = \\rho_{\\text{block}} V g = ' + qp(S.rho, 'kg/m3') + '(' + tn(V2, 2) + '\\,\\text{m}^3)' + qp(GR, 'm/s2') + ' = ' + qt(Wt, 'N') + '$.',
          'Buoyant force: $F_b = \\rho_{\\text{fluid}} V g = ' + qp(fl.rho, 'kg/m3') + '(' + tn(V2, 2) + '\\,\\text{m}^3)' + qp(GR, 'm/s2') + ' = ' + qt(Fb2, 'N') + '$.',
          'The block is in equilibrium: scale force + buoyant force = weight, so the scale reads $W - F_b = ' + qt(Wt, 'N') + ' - ' + qt(Fb2, 'N') + ' = ' + qt(Ra, 'N') + '$.'],
        hint: 'The scale holds up the weight minus the buoyant force.', chk: { k: k, rho: fl.rho, rhoO: S.rho, V: V2, ans: Ra } };
    }
    if (k === 'fraction') {
      var Fo = R.pick(FLOATERS), fr = Fo.rho / fl.rho;
      return { q: 'A block of ' + Fo.n + ' (density $' + qx(Fo.rho, 'kg/m3') + '$) floats in ' + fl.n + ' (density $' + qx(fl.rho, 'kg/m3') + '$). What percent of its volume is under the surface?', a: { t: 'num', v: vs(fr * 100, 3), pct: true, rtol: 0.01 },
        viz: { name: 'ph-fluids', opts: { mode: 'float', rho: fl.rho, objects: [{ label: Fo.n.replace(/^a /, ''), rho: Fo.rho, w: 1.4 }], interactive: false, quiet: true } },
        steps: ['A floating object sinks until the fluid it pushes aside weighs as much as it does: $\\rho_{\\text{fluid}} V_{\\text{sub}} g = \\rho_{\\text{obj}} V g$.',
          'Cancel $g$: $\\dfrac{V_{\\text{sub}}}{V} = \\dfrac{\\rho_{\\text{obj}}}{\\rho_{\\text{fluid}}} = \\dfrac{' + Fo.rho + '}{' + fl.rho + '} = ' + tn(fr, 3) + '$.',
          'So $' + tn(fr * 100, 3) + '\\%$ of the block is under the surface.'],
        hint: 'The fraction under water is the ratio of the densities.', chk: { k: k, rho: fl.rho, rhoO: Fo.rho, ans: fr * 100 } };
    }
    if (k === 'density') {
      var S2 = R.pick(SOLIDS.concat([{ n: 'mystery metal', rho: 7300 }, { n: 'mystery metal', rho: 4500 }])), m2 = R.pick([0.50, 0.80, 1.2, 1.5, 2.0]), Wa = rd(m2 * GR, 3), Ww = rd(Wa * (1 - 1000 / S2.rho), 3);
      var dens = 1000 * Wa / (Wa - Ww);
      return { q: 'A metal sample weighs $' + qt(Wa, 'N') + '$ in air and $' + qt(Ww, 'N') + '$ when it hangs fully under fresh water ($' + qx(1000, 'kg/m3') + '$). What is the density of the metal? (' + gtxt + ')', a: ans(dens, { rtol: 0.03 }), unit: 'kg/m3',
        steps: ['The scale reading drops by the buoyant force: $F_b = ' + qt(Wa, 'N') + ' - ' + qt(Ww, 'N') + ' = ' + qt(Wa - Ww, 'N') + '$.',
          'That is the weight of water with the sample\'s volume: $V = \\dfrac{F_b}{\\rho_{\\text{water}} g} = \\dfrac{' + qt(Wa - Ww, 'N') + '}{' + qp(1000, 'kg/m3') + qp(GR, 'm/s2') + '} = ' + qt((Wa - Ww) / (1000 * GR), 'm3') + '$.',
          'Mass: $m = \\dfrac{W}{g} = \\dfrac{' + qt(Wa, 'N') + '}{' + qx(GR, 'm/s2') + '} = ' + qt(Wa / GR, 'kg') + '$.',
          'Density: $\\rho = \\dfrac{m}{V} = ' + qt(dens, 'kg/m3') + '$. (Shortcut: $\\rho = \\rho_{\\text{water}} \\dfrac{W_{\\text{air}}}{W_{\\text{air}} - W_{\\text{water}}}$.)'],
        hint: 'The loss of weight in water tells you the volume.', chk: { k: k, Wa: Wa, Ww: Ww, ans: dens } };
    }
    // raft: the most extra load before it is fully under
    var Rw = R.pick(FLOATERS.slice(0, 2).concat([{ n: 'pine', rho: 500 }, { n: 'foam', rho: 100 }])), Vr = R.pick([0.20, 0.30, 0.40, 0.50, 0.60, 0.80]), mx = (fl.rho - Rw.rho) * Vr;
    return { q: 'A raft made of ' + Rw.n + ' (density $' + qx(Rw.rho, 'kg/m3') + '$) has a volume of $' + qx(Vr, 'm3') + '$ and floats in ' + fl.n + ' ($' + qx(fl.rho, 'kg/m3') + '$). What is the largest mass of cargo it can carry before its top reaches the water?', a: ans(mx), unit: 'kg',
      steps: ['When the raft is just fully under, the buoyant force is $\\rho_{\\text{fluid}} V g$, and it must hold up the raft plus the cargo: $\\rho_{\\text{fluid}} V g = (m_{\\text{raft}} + m_{\\text{cargo}}) g$.',
        'Cancel $g$: $m_{\\text{cargo}} = \\rho_{\\text{fluid}} V - \\rho_{\\text{raft}} V = (\\rho_{\\text{fluid}} - \\rho_{\\text{raft}}) V$.',
        '$m_{\\text{cargo}} = (' + fl.rho + ' - ' + Rw.rho + ')\\,\\text{kg/m}^3 \\times ' + qx(Vr, 'm3') + ' = ' + qt(mx, 'kg') + '$.'],
      hint: 'Fully under, the water it displaces must weigh as much as the raft plus the cargo.', chk: { k: k, rho: fl.rho, rhoR: Rw.rho, V: Vr, ans: mx } };
  });

  G('phys2.continuity', function (R, ctx) {
    var k = kind(R, ctx, ['area', 'area', 'flow', 'concept'], ['area', 'diam', 'flow', 'fill', 'concept'], ['diam', 'fill', 'branches', 'flow']);
    if (k === 'concept') {
      return { q: 'Water fills a pipe completely and flows steadily. The pipe narrows to half its cross-sectional area. In the narrow part, the water',
        a: mc('moves twice as fast.', ['moves half as fast.', 'moves at the same speed.', 'moves four times as fast.']),
        viz: { name: 'ph-fluids', opts: { mode: 'flow', A1: 0.016, A2: 0.008, h2: 0, interactive: false, quiet: true } },
        steps: ['Water barely compresses, so every second the same volume must pass every cross-section of a full pipe: $A_1 v_1 = A_2 v_2$.',
          'Half the area means $v_2 = v_1 \\dfrac{A_1}{A_2} = 2v_1$.',
          'That is why you narrow a hose\'s opening with your thumb to make the water shoot farther.'],
        hint: 'The volume per second, $Av$, is the same everywhere.', chk: { k: k, ans: 0 } };
    }
    if (k === 'area') {
      var A2 = R.pick([0.50, 1.0, 1.5, 2.0]), f = R.pick([2, 3, 4, 5]), A1 = U.fix(A2 * f), v1 = R.pick([0.50, 0.80, 1.2, 1.5, 2.0, 2.5]), v2 = v1 * A1 / A2;
      return { q: 'Water flows at $' + qx(v1, 'm/s') + '$ through a hose with a cross-sectional area of $' + qx(A1, 'cm2') + '$. The nozzle has an opening of $' + tx(U.fix(A2)) + '\\,\\text{cm}^2$. How fast does the water leave the nozzle?', a: ans(v2), unit: 'm/s',
        steps: ['For a liquid filling the pipe, the flow rate $Av$ is the same everywhere: $A_1 v_1 = A_2 v_2$.',
          '$v_2 = v_1 \\dfrac{A_1}{A_2} = ' + qp(v1, 'm/s') + '\\dfrac{' + qx(A1, 'cm2') + '}{' + tx(U.fix(A2)) + '\\,\\text{cm}^2} = ' + qt(v2, 'm/s') + '$.',
          'Smaller area, faster water: the speed went up by the same factor, ' + f + ', that the area went down.'],
        hint: 'Use $A_1 v_1 = A_2 v_2$.', chk: { k: k, A1: A1, A2: A2, v1: v1, ans: v2 } };
    }
    if (k === 'diam') {
      var d2 = R.pick([0.50, 1.0, 1.5, 2.0]), fd = R.pick([2, 3, 4]), d1 = U.fix(d2 * fd), w1 = R.pick([0.40, 0.50, 0.60, 0.80, 1.0, 1.5]), w2 = w1 * fd * fd;
      return { q: 'Water moves at $' + qx(w1, 'm/s') + '$ in a round pipe of diameter $' + qx(d1, 'cm') + '$. The pipe narrows to a diameter of $' + tx(U.fix(d2)) + '\\,\\text{cm}$. What is the water\'s speed in the narrow part?', a: ans(w2), unit: 'm/s',
        steps: ['Continuity: $A_1 v_1 = A_2 v_2$, so $v_2 = v_1 \\dfrac{A_1}{A_2}$.',
          'For circles $A = \\pi d^2/4$, so $\\dfrac{A_1}{A_2} = \\left(\\dfrac{d_1}{d_2}\\right)^2 = ' + fd + '^2 = ' + (fd * fd) + '$.',
          '$v_2 = ' + qx(w1, 'm/s') + ' \\times ' + (fd * fd) + ' = ' + qt(w2, 'm/s') + '$.'],
        hint: 'The area ratio is the diameter ratio squared.', chk: { k: k, d1: d1, d2: d2, v1: w1, ans: w2 } };
    }
    if (k === 'flow') {
      var Ac = R.pick([2.0, 3.0, 4.0, 5.0, 6.0]), vv = R.pick([1.5, 2.0, 2.5, 3.0, 4.0]), Qm = Ac * 1e-4 * vv, QL = Qm * 1000;
      return { q: 'Water flows at $' + qx(vv, 'm/s') + '$ through a pipe with a cross-sectional area of $' + qx(Ac, 'cm2') + '$. What is the flow rate in liters per second? ($1\\,\\text{L} = 10^{-3}\\,\\text{m}^3$, $1\\,\\text{cm}^2 = 10^{-4}\\,\\text{m}^2$)', a: ans(QL), unit: 'L/s',
        steps: ['The flow rate is the volume per second: $Q = Av$ (each second, a column $v$ meters long with area $A$ passes by).',
          '$A = ' + qx(Ac, 'cm2') + ' = ' + tn(Ac * 1e-4, 2) + '\\,\\text{m}^2$, so $Q = (' + tn(Ac * 1e-4, 2) + '\\,\\text{m}^2)' + qp(vv, 'm/s') + ' = ' + tn(Qm, 3) + '\\,\\text{m}^3\\text{/s}$.',
          'In liters: $' + tn(Qm, 3) + '\\,\\text{m}^3\\text{/s} \\times 1000\\,\\text{L/m}^3 = ' + qt(QL, 'L/s') + '$.'],
        hint: 'Flow rate is area times speed. Convert the area to square meters first.', chk: { k: k, A: Ac, v: vv, ans: QL } };
    }
    if (k === 'fill') {
      var Ah = R.pick([1.0, 2.0, 2.5, 3.0, 4.0]), vh = R.pick([1.0, 1.5, 2.0, 2.5]), Vb = R.pick([10, 12, 15, 20, 40]), Qh = Ah * 1e-4 * vh * 1000, tf = Vb / Qh;
      return { q: 'A garden hose has a cross-sectional area of $' + qx(Ah, 'cm2') + '$, and water moves through it at $' + qx(vh, 'm/s') + '$. How long does it take to fill a $' + qx(Vb, 'L') + '$ bucket?', a: ans(tf), unit: 's',
        steps: ['Flow rate: $Q = Av = (' + tn(Ah * 1e-4, 2) + '\\,\\text{m}^2)' + qp(vh, 'm/s') + ' = ' + tn(Qh / 1000, 3) + '\\,\\text{m}^3\\text{/s} = ' + qt(Qh, 'L/s') + '$.',
          'Time: $t = \\dfrac{V}{Q} = \\dfrac{' + qx(Vb, 'L') + '}{' + qt(Qh, 'L/s') + '} = ' + qt(tf, 's') + '$.'],
        hint: 'Find the volume per second, then divide the bucket\'s volume by it.', chk: { k: k, A: Ah, v: vh, V: Vb, ans: tf } };
    }
    // branches
    var Am = R.pick([12, 15, 20, 24]), nb = R.pick([2, 3, 4]), ab = R.pick([2.0, 3.0, 4.0]), vm = R.pick([1.0, 1.5, 2.0]), vb = vm * Am / (nb * ab);
    return { q: 'A main pipe of area $' + qx(Am, 'cm2') + '$ carries water at $' + qx(vm, 'm/s') + '$. It splits into ' + U.words(nb) + ' identical branches, each of area $' + qx(ab, 'cm2') + '$. How fast does the water move in each branch?', a: ans(vb), unit: 'm/s',
      steps: ['All the water in the main pipe goes on through the branches, so the flow rates add: $A_m v_m = ' + nb + ' A_b v_b$.',
        '$v_b = \\dfrac{A_m v_m}{' + nb + ' A_b} = \\dfrac{' + qp(Am, 'cm2') + qp(vm, 'm/s') + '}{' + nb + ' \\times ' + qx(ab, 'cm2') + '} = ' + qt(vb, 'm/s') + '$.'],
      hint: 'The flow rate in the main pipe equals the total flow rate in the branches.', chk: { k: k, Am: Am, n: nb, Ab: ab, vm: vm, ans: vb } };
  });

  G('phys2.bernoulli', function (R, ctx) {
    var k = kind(R, ctx, ['torricelli', 'horizontal', 'concept'], ['horizontal', 'torricelli', 'height', 'concept'], ['both', 'venturi', 'horizontal', 'height']);
    var rho = 1000, rtxt = 'Use $\\rho = ' + qx(rho, 'kg/m3') + '$ for water and $g = ' + qx(GR, 'm/s2') + '$.';
    if (k === 'concept') {
      return { q: 'Water flows through a level pipe that narrows and then widens again. Compared with the pressure in the wide parts, the pressure in the narrow part is',
        a: mc('lower, because the water there moves faster.', ['higher, because faster water pushes harder.', 'the same, because the pipe is level.', 'higher, because the water is squeezed into less space.']),
        viz: { name: 'ph-fluids', opts: { mode: 'flow', A1: 0.016, A2: 0.006, h2: 0, interactive: false, quiet: true } },
        steps: ['Continuity: the water speeds up where the pipe narrows.',
          'To speed up, a parcel of water needs a net push forward, so the pressure behind it (in the wide part) must be higher than the pressure ahead of it (in the narrow part).',
          'Bernoulli\'s equation on a level pipe says the same thing: $P + \\tfrac{1}{2}\\rho v^2$ stays constant, so where $v$ is larger, $P$ is smaller.'],
        hint: 'What net force does the water need to speed up as it enters the narrow part?', chk: { k: k, ans: 0 } };
    }
    if (k === 'torricelli') {
      var h = R.pick([0.45, 0.80, 1.25, 1.8, 2.45, 3.2, 5.0]), v = sqrt(2 * GR * h);
      return { q: 'A large open tank of water has a small hole in its side, $' + qx(h, 'm') + '$ below the water surface. How fast does the water come out of the hole? ($g = ' + qx(GR, 'm/s2') + '$)', a: ans(v), unit: 'm/s',
        viz: { name: 'ph-fluids', opts: { mode: 'drain', h0: h, interactive: false, quiet: true } },
        steps: ['Compare the surface (point 1) with the hole (point 2). Both are open to the air, so $P_1 = P_2$. The tank is large, so the surface barely moves: $v_1 \\approx 0$.',
          'Bernoulli: $\\rho g h = \\tfrac{1}{2}\\rho v_2^2$, so $v_2 = \\sqrt{2gh}$, the same speed as a stone dropped from the surface (Torricelli\'s law).',
          '$v_2 = \\sqrt{2' + qp(GR, 'm/s2') + qp(h, 'm') + '} = ' + qt(v, 'm/s') + '$.'],
        hint: 'Both ends are at air pressure, and the surface is nearly still.', chk: { k: k, h: h, ans: v } };
    }
    if (k === 'horizontal') {
      var P1 = R.pick([150, 180, 200, 220, 250, 300]), v1 = R.pick([1.0, 1.5, 2.0, 2.5, 3.0]), f = R.pick([2, 3]), v2 = v1 * f, P2 = P1 - 0.5 * rho * (v2 * v2 - v1 * v1) / 1000;
      return { q: 'Water flows through a level pipe at $' + qx(v1, 'm/s') + '$ with pressure $' + qx(P1, 'kPa') + '$. Farther on, the pipe narrows to $\\tfrac{1}{' + f + '}$ of its area. What is the pressure in the narrow part? ' + rtxt, a: ans(P2), unit: 'kPa',
        viz: { name: 'ph-fluids', opts: { mode: 'flow', v1: v1, A1: 0.012, A2: 0.012 / f, h2: 0, interactive: false, quiet: true } },
        steps: ['Continuity: $v_2 = v_1 \\dfrac{A_1}{A_2} = ' + f + ' \\times ' + qx(v1, 'm/s') + ' = ' + qt(v2, 'm/s') + '$.',
          'Level pipe, so Bernoulli gives $P_1 + \\tfrac{1}{2}\\rho v_1^2 = P_2 + \\tfrac{1}{2}\\rho v_2^2$, or $P_2 = P_1 - \\tfrac{1}{2}\\rho (v_2^2 - v_1^2)$.',
          '$\\tfrac{1}{2}\\rho (v_2^2 - v_1^2) = \\tfrac{1}{2}' + qp(rho, 'kg/m3') + '(' + tn(v2 * v2, 3) + ' - ' + tn(v1 * v1, 3) + ')\\,\\text{m}^2/\\text{s}^2 = ' + qt(0.5 * rho * (v2 * v2 - v1 * v1), 'Pa') + '$.',
          '$P_2 = ' + qx(P1, 'kPa') + ' - ' + qt(0.5 * rho * (v2 * v2 - v1 * v1) / 1000, 'kPa') + ' = ' + qt(P2, 'kPa') + '$. Faster water, lower pressure.'],
        hint: 'Find the new speed with continuity, then use Bernoulli with $h_1 = h_2$.', chk: { k: k, P1: P1, v1: v1, f: f, ans: P2 } };
    }
    if (k === 'height') {
      var Pa = R.pick([200, 250, 300, 350]), dh = R.pick([3.0, 4.0, 5.0, 6.0, 8.0, 10]), Pb = Pa - rho * GR * dh / 1000;
      return { q: 'Water flows steadily up a pipe of constant diameter into the second floor of a house. The pressure at ground level is $' + qx(Pa, 'kPa') + '$. What is the pressure $' + qx(dh, 'm') + '$ higher up? ' + rtxt, a: ans(Pb), unit: 'kPa',
        steps: ['Same diameter, so by continuity the speed is the same at both points and the $\\tfrac{1}{2}\\rho v^2$ terms cancel.',
          'Bernoulli then gives $P_2 = P_1 - \\rho g (h_2 - h_1)$.',
          '$\\rho g \\Delta h = ' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + qp(dh, 'm') + ' = ' + qt(rho * GR * dh, 'Pa') + ' = ' + qt(rho * GR * dh / 1000, 'kPa') + '$.',
          '$P_2 = ' + qx(Pa, 'kPa') + ' - ' + qt(rho * GR * dh / 1000, 'kPa') + ' = ' + qt(Pb, 'kPa') + '$.'],
        hint: 'With equal speeds, only the height term changes.', chk: { k: k, P1: Pa, dh: dh, ans: Pb } };
    }
    if (k === 'both') {
      var P1b = R.pick([200, 250, 300]), v1b = R.pick([1.0, 1.5, 2.0]), fb = R.pick([2, 3]), hb = R.pick([1.0, 2.0, 3.0, 4.0]), v2b = v1b * fb, dyn = 0.5 * rho * (v2b * v2b - v1b * v1b), P2b = P1b - (dyn + rho * GR * hb) / 1000;
      return { q: 'Water enters a pipe at $' + qx(v1b, 'm/s') + '$ and $' + qx(P1b, 'kPa') + '$. The pipe rises $' + qx(hb, 'm') + '$ and narrows to $\\tfrac{1}{' + fb + '}$ of its area. What is the pressure at the higher, narrow end? ' + rtxt, a: ans(P2b), unit: 'kPa',
        viz: { name: 'ph-fluids', opts: { mode: 'flow', v1: v1b, A1: 0.012, A2: 0.012 / fb, h2: Math.min(hb, 2), interactive: false, quiet: true } },
        steps: ['Continuity: $v_2 = ' + fb + ' \\times ' + qx(v1b, 'm/s') + ' = ' + qt(v2b, 'm/s') + '$.',
          'Bernoulli: $P_2 = P_1 - \\tfrac{1}{2}\\rho (v_2^2 - v_1^2) - \\rho g (h_2 - h_1)$.',
          'Speed term: $\\tfrac{1}{2}' + qp(rho, 'kg/m3') + '(' + tn(v2b * v2b, 3) + ' - ' + tn(v1b * v1b, 3) + ')\\,\\text{m}^2/\\text{s}^2 = ' + qt(dyn, 'Pa') + '$. Height term: $' + qp(rho, 'kg/m3') + qp(GR, 'm/s2') + qp(hb, 'm') + ' = ' + qt(rho * GR * hb, 'Pa') + '$.',
          '$P_2 = ' + qx(P1b, 'kPa') + ' - ' + qt(dyn / 1000, 'kPa') + ' - ' + qt(rho * GR * hb / 1000, 'kPa') + ' = ' + qt(P2b, 'kPa') + '$.'],
        hint: 'Find $v_2$ first; both the speed-up and the climb lower the pressure.', chk: { k: k, P1: P1b, v1: v1b, f: fb, h: hb, ans: P2b } };
    }
    // venturi: a measured pressure drop gives the speed
    var fv = R.pick([2, 3]), vA = R.pick([1.0, 1.5, 2.0, 2.5, 3.0]), dP = rd(0.5 * rho * vA * vA * (fv * fv - 1), 3), vv = sqrt(2 * dP / (rho * (fv * fv - 1)));
    return { q: 'A Venturi meter is a level pipe whose throat has $\\tfrac{1}{' + fv + '}$ of the pipe\'s area. With water flowing, the pressure in the throat is $' + qt(dP, 'Pa') + '$ lower than in the wide pipe. How fast is the water moving in the wide pipe? ' + rtxt, a: ans(vv), unit: 'm/s',
      steps: ['Continuity: in the throat $v_2 = ' + fv + 'v_1$.',
        'Level pipe, so Bernoulli gives $P_1 - P_2 = \\tfrac{1}{2}\\rho (v_2^2 - v_1^2) = \\tfrac{1}{2}\\rho (' + (fv * fv) + ' - 1) v_1^2 = ' + tx(0.5 * (fv * fv - 1)) + '\\rho v_1^2$.',
        '$v_1 = \\sqrt{\\dfrac{' + qt(dP, 'Pa') + '}{' + tx(0.5 * (fv * fv - 1)) + ' \\times ' + qx(rho, 'kg/m3') + '}} = ' + qt(vv, 'm/s') + '$.'],
      hint: 'Write $v_2$ in terms of $v_1$, then solve Bernoulli for $v_1$.', chk: { k: k, f: fv, dP: dP, ans: vv } };
  });

  // ================================================================ UNIT 2: THERMODYNAMICS
  function TK(c) { return c + 273; }
  function cdeg(c) { return tx(c) + ut('degC'); }
  function kel(c) { return cdeg(c) + ' + 273 = ' + tx(TK(c)) + '\\,\\text{K}'; }
  var Rtxt = '$R = ' + tx(RG) + '\\,' + UT['J/molK'] + '$';
  var GASES = [{ n: 'helium', M: 4.00 }, { n: 'neon', M: 20.2 }, { n: 'nitrogen', f: 'N_2', M: 28.0 }, { n: 'oxygen', f: 'O_2', M: 32.0 }, { n: 'argon', M: 39.9 }, { n: 'carbon dioxide', f: 'CO_2', M: 44.0 }];
  function pctAns(frac, rtol) { return { t: 'num', v: vs(frac * 100, 3), pct: true, rtol: rtol || 0.01 }; }

  G('phys2.ideal-gas-law', function (R, ctx) {
    var k = kind(R, ctx, ['pressure', 'heated', 'moles', 'concept'], ['pressure', 'moles', 'heated', 'combined', 'molecules', 'concept'], ['combined', 'molecules', 'temperature', 'heated']);
    if (k === 'concept') {
      var c1 = R.pick([10, 20, 25]), c2 = 2 * c1, f = TK(c2) / TK(c1);
      return { q: 'A sealed, rigid can of air is warmed from $' + cdeg(c1) + '$ to $' + cdeg(c2) + '$. What happens to the pressure inside?',
        a: mc('It rises by about ' + Math.round((f - 1) * 100) + '%.', ['It doubles, because the temperature doubled.', 'It stays the same, because the can is sealed.', 'It rises by about 50%.']),
        steps: ['The gas law works with absolute temperature: $P = nRT/V$, and $n$, $V$ stay fixed, so $P$ is proportional to $T$ in kelvins.',
          '$T_1 = ' + kel(c1) + '$ and $T_2 = ' + kel(c2) + '$.',
          '$\\dfrac{P_2}{P_1} = \\dfrac{' + TK(c2) + '}{' + TK(c1) + '} = ' + tn(f, 3) + '$, a rise of about ' + Math.round((f - 1) * 100) + '%. Doubling a Celsius number does not double the temperature.'],
        hint: 'Convert both temperatures to kelvins first.', chk: { k: k, ans: 0 } };
    }
    if (k === 'pressure') {
      var n = R.pick([0.10, 0.20, 0.25, 0.50, 1.0, 2.0]), VL = R.pick([5.0, 10, 12, 20, 25]), tc = R.pick([0, 20, 27, 37, 100, 127]), T = TK(tc), P = n * RG * T / (VL / 1000) / 1000;
      return { q: 'A tank holds $' + tg(n) + '\\,\\text{mol}$ of gas in a volume of $' + qx(VL, 'L') + '$ at $' + cdeg(tc) + '$. What is the pressure of the gas? Use ' + Rtxt + ' and give the answer in kPa.', a: ans(P), unit: 'kPa',
        steps: ['Use kelvins: $T = ' + kel(tc) + '$. Use cubic meters: $V = ' + qx(VL, 'L') + ' = ' + tn(VL / 1000, 2) + '\\,\\text{m}^3$.',
          '$P = \\dfrac{nRT}{V} = \\dfrac{(' + tg(n) + '\\,\\text{mol})(' + tx(RG) + '\\,' + UT['J/molK'] + ')(' + T + '\\,\\text{K})}{' + tn(VL / 1000, 2) + '\\,\\text{m}^3} = ' + qt(P * 1000, 'Pa') + '$.',
          'In kilopascals: $P = ' + qt(P, 'kPa') + '$.'],
        hint: 'Solve $PV = nRT$ for $P$, with $T$ in kelvins and $V$ in cubic meters.', chk: { k: k, n: n, V: VL, tc: tc, ans: P } };
    }
    if (k === 'moles') {
      var P2 = R.pick([100, 150, 200, 250, 300, 500]), V2 = R.pick([2.0, 4.0, 5.0, 10, 20]), t2 = R.pick([0, 20, 27, 50, 77]), n2 = P2 * 1000 * V2 / 1000 / (RG * TK(t2));
      return { q: 'How many moles of gas fill a $' + qx(V2, 'L') + '$ container at a pressure of $' + qx(P2, 'kPa') + '$ and a temperature of $' + cdeg(t2) + '$? Use ' + Rtxt + '.', a: ans(n2), unit: 'mol',
        steps: ['SI units: $P = ' + qt(P2 * 1000, 'Pa') + '$, $V = ' + tn(V2 / 1000, 2) + '\\,\\text{m}^3$, $T = ' + kel(t2) + '$.',
          '$n = \\dfrac{PV}{RT} = \\dfrac{(' + qt(P2 * 1000, 'Pa') + ')(' + tn(V2 / 1000, 2) + '\\,\\text{m}^3)}{(' + tx(RG) + ')(' + TK(t2) + '\\,\\text{K})} = ' + qt(n2, 'mol') + '$.'],
        hint: 'Solve $PV = nRT$ for $n$. Pascals times cubic meters gives joules.', chk: { k: k, P: P2, V: V2, tc: t2, ans: n2 } };
    }
    if (k === 'heated') {
      var p1 = R.pick([100, 120, 150, 200, 250]), a1 = R.pick([0, 10, 20, 27]), a2 = a1 + R.pick([20, 30, 50, 80, 100]), p2 = p1 * TK(a2) / TK(a1);
      return { q: 'A sealed steel tank of gas is at $' + qx(p1, 'kPa') + '$ and $' + cdeg(a1) + '$. It is warmed to $' + cdeg(a2) + '$. What is the new pressure? (The tank does not change size.)', a: ans(p2), unit: 'kPa',
        steps: ['With $n$ and $V$ fixed, $PV = nRT$ gives $P/T = nR/V$, a constant, so $P_2 = P_1 \\dfrac{T_2}{T_1}$, with $T$ in kelvins.',
          '$T_1 = ' + kel(a1) + '$, $T_2 = ' + kel(a2) + '$.',
          '$P_2 = (' + qx(p1, 'kPa') + ')\\dfrac{' + TK(a2) + '\\,\\text{K}}{' + TK(a1) + '\\,\\text{K}} = ' + qt(p2, 'kPa') + '$.'],
        hint: 'Pressure is proportional to the kelvin temperature when $V$ and $n$ stay fixed.', chk: { k: k, P1: p1, t1: a1, t2: a2, ans: p2 } };
    }
    if (k === 'combined') {
      var q1 = R.pick([100, 150, 200]), v1 = R.pick([2.0, 3.0, 4.0, 6.0]), b1 = R.pick([20, 27, 7]), q2 = R.pick([50, 80, 250, 300, 400]), b2 = R.pick([-23, 0, 47, 77, 127]), v2 = v1 * (q1 / q2) * (TK(b2) / TK(b1));
      return { q: 'A balloon holds $' + qx(v1, 'L') + '$ of gas at $' + qx(q1, 'kPa') + '$ and $' + cdeg(b1) + '$. The pressure changes to $' + qx(q2, 'kPa') + '$ and the temperature to $' + cdeg(b2) + '$, with no gas escaping. What is the new volume?', a: ans(v2), unit: 'L',
        steps: ['The amount of gas is fixed, so $\\dfrac{PV}{T} = nR$ stays the same: $\\dfrac{P_1 V_1}{T_1} = \\dfrac{P_2 V_2}{T_2}$.',
          'Kelvins: $T_1 = ' + kel(b1) + '$, $T_2 = ' + kel(b2) + '$.',
          '$V_2 = V_1 \\dfrac{P_1}{P_2}\\dfrac{T_2}{T_1} = (' + qx(v1, 'L') + ')\\left(\\dfrac{' + q1 + '}{' + q2 + '}\\right)\\left(\\dfrac{' + TK(b2) + '}{' + TK(b1) + '}\\right) = ' + qt(v2, 'L') + '$.',
          'The ratios let the volume stay in liters and the pressures in kPa.'],
        hint: 'Use $P_1V_1/T_1 = P_2V_2/T_2$ with kelvin temperatures.', chk: { k: k, P1: q1, V1: v1, t1: b1, P2: q2, t2: b2, ans: v2 } };
    }
    if (k === 'molecules') {
      var P3 = R.pick([100, 101, 200, 50]), V3 = R.pick([1.0, 2.0, 5.0, 10]), t3 = R.pick([0, 20, 27, 37]), N = P3 * 1000 * V3 / 1000 / (KB * TK(t3));
      return { q: 'How many molecules are in $' + qx(V3, 'L') + '$ of air at $' + qx(P3, 'kPa') + '$ and $' + cdeg(t3) + '$? Use $k_B = 1.38 \\times 10^{-23}\\,\\text{J/K}$.', a: ans(N), unit: 'molecules',
        steps: ['Counting molecules, the gas law reads $PV = Nk_BT$, so $N = \\dfrac{PV}{k_BT}$.',
          'SI units: $P = ' + qt(P3 * 1000, 'Pa') + '$, $V = ' + tn(V3 / 1000, 2) + '\\,\\text{m}^3$, $T = ' + kel(t3) + '$.',
          '$N = \\dfrac{(' + qt(P3 * 1000, 'Pa') + ')(' + tn(V3 / 1000, 2) + '\\,\\text{m}^3)}{(1.38 \\times 10^{-23}\\,\\text{J/K})(' + TK(t3) + '\\,\\text{K})} = ' + tn(N, 3) + '$ molecules.'],
        hint: 'Use $PV = Nk_BT$ with SI units.', chk: { k: k, P: P3, V: V3, tc: t3, ans: N } };
    }
    // temperature
    var n4 = R.pick([0.50, 1.0, 2.0]), V4 = R.pick([10, 20, 25, 40]), P4 = rd(n4 * RG * R.pick([260, 300, 350, 400, 450, 500]) / (V4 / 1000) / 1000, 2), T4 = P4 * 1000 * V4 / 1000 / (n4 * RG), C4 = T4 - 273;
    return { q: '$' + tg(n4) + '\\,\\text{mol}$ of gas fills a $' + qx(V4, 'L') + '$ container at a pressure of $' + qx(P4, 'kPa') + '$. What is its temperature in degrees Celsius? Use ' + Rtxt + '.', a: ans(C4, { rtol: 0.03 }), unit: '°C',
      steps: ['$T = \\dfrac{PV}{nR} = \\dfrac{(' + qt(P4 * 1000, 'Pa') + ')(' + tn(V4 / 1000, 2) + '\\,\\text{m}^3)}{(' + tg(n4) + '\\,\\text{mol})(' + tx(RG) + ')} = ' + qt(T4, 'K') + '$.',
        'The gas law gives kelvins. Convert: $' + tn(T4, 3) + ' - 273 = ' + tn(C4, 3) + '\\,^\\circ\\text{C}$.'],
      hint: 'Solve for $T$ in kelvins, then subtract 273.', chk: { k: k, n: n4, V: V4, P: P4, ans: C4 } };
  });

  G('phys2.kinetic-theory', function (R, ctx) {
    var k = kind(R, ctx, ['avgK', 'ratioT', 'concept'], ['avgK', 'vrms', 'internal', 'concept', 'tempFromK'], ['vrms', 'ratioGas', 'internal', 'tempFromK', 'concept']);
    if (k === 'concept') {
      var A = R.pick([GASES[0], GASES[1]]), B = R.pick([GASES[4], GASES[5]]), tc = R.pick([20, 25, 100]);
      if (R.coin()) return { q: 'A container holds a mix of ' + A.n + ' and ' + B.n + ' at $' + cdeg(tc) + '$. How do the average kinetic energies of their molecules compare?',
        a: mc('They are equal.', ['The ' + B.n + ' molecules have more, because they are heavier.', 'The ' + A.n + ' molecules have more, because they move faster.', 'It depends on how much of each gas there is.']),
        viz: { name: 'ph-gas', opts: { N: 60, T: TK(tc), masses: [1, 10], interactive: false, quiet: true } },
        steps: ['The average kinetic energy of a molecule depends only on the temperature: $\\bar K = \\tfrac{3}{2}k_BT$.',
          'Both gases are at the same temperature, so their molecules have the same average kinetic energy.',
          'The heavier ' + B.n + ' molecules move more slowly on average, which is how the same energy works out: $\\tfrac{1}{2}mv^2$ is the same.'],
        hint: 'What does $\\bar K = \\tfrac{3}{2}k_BT$ depend on?', chk: { k: k, v: 'K', ans: 0 } };
      return { q: 'A container holds a mix of ' + A.n + ' and ' + B.n + ' at $' + cdeg(tc) + '$. Which molecules have the greater typical (rms) speed?',
        a: mc('The ' + A.n + ' molecules, because they are lighter.', ['The ' + B.n + ' molecules, because they are heavier and hit harder.', 'Both have the same speed, because they are at the same temperature.', 'Every molecule moves at the same speed, so neither.']),
        viz: { name: 'ph-gas', opts: { N: 60, T: TK(tc), masses: [1, 10], interactive: false, quiet: true } },
        steps: ['Same temperature means the same average kinetic energy, $\\tfrac{1}{2}m\\overline{v^2} = \\tfrac{3}{2}k_BT$.',
          'So $v_{\\text{rms}} = \\sqrt{3k_BT/m}$: the lighter molecules must move faster.',
          'Within each gas the speeds still spread out widely; the rms speed is a typical value, not every molecule\'s speed.'],
        hint: 'Equal $\\tfrac{1}{2}mv^2$ with a smaller $m$ means what about $v$?', chk: { k: k, v: 'v', ans: 0 } };
    }
    if (k === 'avgK') {
      var t = R.pick([0, 20, 27, 100, 227, 727]), Kav = 1.5 * KB * TK(t);
      return { q: 'What is the average kinetic energy of a gas molecule at $' + cdeg(t) + '$? Use $k_B = 1.38 \\times 10^{-23}\\,\\text{J/K}$.', a: ans(Kav), unit: 'J',
        steps: ['Kinetic theory: $\\bar K = \\tfrac{3}{2}k_BT$ with $T$ in kelvins. $T = ' + kel(t) + '$.',
          '$\\bar K = \\tfrac{3}{2}(1.38 \\times 10^{-23}\\,\\text{J/K})(' + TK(t) + '\\,\\text{K}) = ' + qt(Kav, 'J') + '$.',
          'It is the same for every kind of gas at this temperature.'],
        hint: '$\\bar K = \\tfrac{3}{2}k_BT$, with $T$ in kelvins.', chk: { k: k, tc: t, ans: Kav } };
    }
    if (k === 'tempFromK') {
      var T2 = R.pick([150, 200, 250, 300, 400, 500, 600, 800]), K2 = rd(1.5 * KB * T2, 3), Tb = 2 * K2 / (3 * KB);
      return { q: 'The molecules of a gas have an average kinetic energy of $' + qt(K2, 'J') + '$. What is the gas\'s temperature in kelvins? Use $k_B = 1.38 \\times 10^{-23}\\,\\text{J/K}$.', a: ans(Tb), unit: 'K',
        steps: ['$\\bar K = \\tfrac{3}{2}k_BT$, so $T = \\dfrac{2\\bar K}{3k_B}$.',
          '$T = \\dfrac{2(' + qt(K2, 'J') + ')}{3(1.38 \\times 10^{-23}\\,\\text{J/K})} = ' + qt(Tb, 'K') + '$.'],
        hint: 'Solve $\\bar K = \\tfrac{3}{2}k_BT$ for $T$.', chk: { k: k, K: K2, ans: Tb } };
    }
    if (k === 'vrms') {
      var Gs = R.pick(GASES), t3 = R.pick([0, 20, 27, 100]), v = sqrt(3 * RG * TK(t3) / (Gs.M / 1000));
      return { q: 'Find the rms speed of ' + Gs.n + ' molecules (molar mass $' + tx(Gs.M) + '\\,\\text{g/mol}$) at $' + cdeg(t3) + '$. Use ' + Rtxt + '.', a: ans(v), unit: 'm/s',
        steps: ['$\\tfrac{1}{2}m\\overline{v^2} = \\tfrac{3}{2}k_BT$ per molecule. Multiplying by Avogadro\'s number turns $m$ into the molar mass $M$ and $k_B$ into $R$: $v_{\\text{rms}} = \\sqrt{\\dfrac{3RT}{M}}$.',
          'Use SI units: $M = ' + tx(Gs.M) + '\\,\\text{g/mol} = ' + tn(Gs.M / 1000, 3) + '\\,\\text{kg/mol}$, $T = ' + kel(t3) + '$.',
          '$v_{\\text{rms}} = \\sqrt{\\dfrac{3(' + tx(RG) + ')(' + TK(t3) + ')}{' + tn(Gs.M / 1000, 3) + '}} = ' + qt(v, 'm/s') + '$.'],
        hint: 'Use $v_{\\text{rms}} = \\sqrt{3RT/M}$ with $M$ in kg/mol.', chk: { k: k, M: Gs.M, tc: t3, ans: v } };
    }
    if (k === 'ratioT') {
      var f = R.pick([4, 9, 4]), T0 = R.pick([100, 150, 200, 250]), v0 = R.pick([300, 400, 500, 600, 800]), vn = v0 * sqrt(f);
      return { q: 'Helium atoms in a gas at $' + tx(T0) + '\\,\\text{K}$ have an rms speed of $' + qx(v0, 'm/s') + '$. The gas is heated to $' + tx(T0 * f) + '\\,\\text{K}$. What is the new rms speed?', a: ans(vn), unit: 'm/s',
        steps: ['$v_{\\text{rms}} = \\sqrt{3k_BT/m}$, so the speed grows as the square root of the kelvin temperature.',
          'The temperature went up by a factor of $' + tx(T0 * f) + '/' + tx(T0) + ' = ' + f + '$, so the speed goes up by $\\sqrt{' + f + '} = ' + sqrt(f) + '$.',
          '$v_{\\text{rms}} = ' + sqrt(f) + ' \\times ' + qx(v0, 'm/s') + ' = ' + qt(vn, 'm/s') + '$.'],
        hint: 'Speed goes as $\\sqrt{T}$.', chk: { k: k, T0: T0, T1: T0 * f, v0: v0, ans: vn } };
    }
    if (k === 'internal') {
      var Mg = R.pick(['helium', 'neon', 'argon']), n = R.pick([0.50, 1.0, 1.5, 2.0, 3.0]), t5 = R.pick([0, 27, 77, 127]), Ui = 1.5 * n * RG * TK(t5);
      return { q: 'What is the internal energy of $' + tg(n) + '\\,\\text{mol}$ of ' + Mg + ' (a monatomic gas) at $' + cdeg(t5) + '$? Use ' + Rtxt + '.', a: ans(Ui), unit: 'J',
        steps: ['A monatomic gas stores its internal energy as the kinetic energy of its atoms: $U = N\\bar K = N \\cdot \\tfrac{3}{2}k_BT = \\tfrac{3}{2}nRT$.',
          '$T = ' + kel(t5) + '$.',
          '$U = \\tfrac{3}{2}(' + tg(n) + '\\,\\text{mol})(' + tx(RG) + '\\,' + UT['J/molK'] + ')(' + TK(t5) + '\\,\\text{K}) = ' + qt(Ui, 'J') + '$.'],
        hint: 'For a monatomic ideal gas, $U = \\tfrac{3}{2}nRT$.', chk: { k: k, n: n, tc: t5, ans: Ui } };
    }
    // ratioGas: rms speeds of two gases at the same temperature
    var g1 = R.pick([GASES[0], GASES[2]]), g2 = R.pick([GASES[3], GASES[4], GASES[5]]), v1 = g1.M < 10 ? R.pick([1200, 1300, 1350, 1400]) : R.pick([480, 500, 520, 540]), v2 = v1 * sqrt(g1.M / g2.M);
    return { q: 'At a certain temperature, ' + g1.n + ' molecules ($' + tx(g1.M) + '\\,\\text{g/mol}$) have an rms speed of $' + qx(v1, 'm/s') + '$. What is the rms speed of ' + g2.n + ' molecules ($' + tx(g2.M) + '\\,\\text{g/mol}$) at the same temperature?', a: ans(v2), unit: 'm/s',
      steps: ['Same temperature, same average kinetic energy: $\\tfrac{1}{2}m_1 v_1^2 = \\tfrac{1}{2}m_2 v_2^2$.',
        'So $v_2 = v_1\\sqrt{\\dfrac{m_1}{m_2}} = v_1\\sqrt{\\dfrac{M_1}{M_2}} = (' + qx(v1, 'm/s') + ')\\sqrt{\\dfrac{' + tx(g1.M) + '}{' + tx(g2.M) + '}}$.',
        '$v_2 = ' + qt(v2, 'm/s') + '$: the heavier molecules move more slowly.'],
      hint: 'Equal average kinetic energies; speed goes as $1/\\sqrt{m}$.', chk: { k: k, M1: g1.M, M2: g2.M, v1: v1, ans: v2 } };
  });

  var CICE = 2100, CW = 4186, CST = 2010, LF = 3.34e5, LV = 2.26e6;
  var wtxt = '$c_{\\text{ice}} = 2100\\,' + UT['J/kgK'] + '$, $c_{\\text{water}} = 4186\\,' + UT['J/kgK'] + '$, $L_f = 3.34 \\times 10^{5}\\,\\text{J/kg}$';
  G('phys2.latent-heat', function (R, ctx) {
    var k = kind(R, ctx, ['melt', 'boil', 'concept'], ['iceToWater', 'melt', 'massMelted', 'boil', 'concept'], ['iceToWater', 'waterToSteam', 'mix', 'massMelted']);
    if (k === 'concept') {
      if (R.coin()) return { q: 'Ice at $-20\\,^\\circ\\text{C}$ is heated steadily. While it is melting, what happens to its temperature?',
        a: mc('It stays at $0\\,^\\circ\\text{C}$ until all the ice has melted.', ['It keeps rising at the same rate as before.', 'It rises, but more slowly than before.', 'It drops a little, because melting uses energy.']),
        viz: { name: 'ph-thermal', opts: { mode: 'heating-curve', m: 1, T0: -20, T1: 30, q: 0.4, interactive: false, quiet: true } },
        steps: ['During melting, the heat goes into breaking the bonds that hold the ice crystal together, not into making the molecules move faster.',
          'Temperature measures the average kinetic energy of the molecules, so it stays at $0\\,^\\circ\\text{C}$: the flat step on the heating curve.',
          'The heat for this step is $Q = mL_f$. Only after all the ice has melted does the water warm up.'],
        hint: 'Look for the flat steps on a heating curve.', chk: { k: k, v: 'flat', ans: 0 } };
      return { q: 'Which takes more energy for $1.0\\,\\text{kg}$ of water: warming it from $0\\,^\\circ\\text{C}$ to $100\\,^\\circ\\text{C}$, or boiling it all away at $100\\,^\\circ\\text{C}$? ($c = 4186\\,' + UT['J/kgK'] + '$, $L_v = 2.26 \\times 10^{6}\\,\\text{J/kg}$)',
        a: mc('Boiling it away, by more than five times.', ['Warming it, because the temperature changes by 100 degrees.', 'They take the same energy.', 'Boiling it away, but only by a few percent.']),
        steps: ['Warming: $Q = mc\\Delta T = (1.0)(4186)(100) = 4.19 \\times 10^{5}\\,\\text{J}$.',
          'Boiling: $Q = mL_v = (1.0)(2.26 \\times 10^{6}) = 2.26 \\times 10^{6}\\,\\text{J}$.',
          '$2.26 \\times 10^{6} / 4.19 \\times 10^{5} \\approx 5.4$: boiling takes more than five times as much.'],
        hint: 'Compute $mc\\Delta T$ and $mL_v$.', chk: { k: k, v: 'boil', ans: 0 } };
    }
    if (k === 'melt') {
      var mg = R.pick([50, 100, 150, 200, 250, 400, 500]), Q = mg / 1000 * LF;
      return { q: 'How much heat does it take to melt $' + tx(mg) + '\\,\\text{g}$ of ice that is already at $0\\,^\\circ\\text{C}$? Use $L_f = 3.34 \\times 10^{5}\\,\\text{J/kg}$.', a: ans(Q), unit: 'J',
        steps: ['At the melting point, all the heat goes into the change of state: $Q = mL_f$.',
          'Mass in kilograms: $m = ' + tx(mg) + '\\,\\text{g} = ' + tx(mg / 1000) + '\\,\\text{kg}$.',
          '$Q = (' + tx(mg / 1000) + '\\,\\text{kg})(3.34 \\times 10^{5}\\,\\text{J/kg}) = ' + qt(Q, 'J') + '$. The water it makes is still at $0\\,^\\circ\\text{C}$.'],
        hint: 'Use $Q = mL_f$ with the mass in kilograms.', chk: { k: k, m: mg, ans: Q } };
    }
    if (k === 'boil') {
      var mb = R.pick([0.10, 0.20, 0.25, 0.50, 1.5, 2.0]), Qb = mb * LV;
      return { q: 'How much heat is needed to boil away $' + qx(mb, 'kg') + '$ of water that is already at $100\\,^\\circ\\text{C}$? Use $L_v = 2.26 \\times 10^{6}\\,\\text{J/kg}$.', a: ans(Qb), unit: 'J',
        steps: ['At the boiling point the temperature stays at $100\\,^\\circ\\text{C}$; the heat goes into the change of state: $Q = mL_v$.',
          '$Q = ' + qp(mb, 'kg') + '(2.26 \\times 10^{6}\\,\\text{J/kg}) = ' + qt(Qb, 'J') + '$.'],
        hint: 'Use $Q = mL_v$.', chk: { k: k, m: mb, ans: Qb } };
    }
    if (k === 'massMelted') {
      var Qm = R.pick([16700, 33400, 50100, 66800, 100200, 167000]) * R.pick([1, 2]), mm = Qm / LF;
      return { q: 'A block of ice at $0\\,^\\circ\\text{C}$ absorbs $' + qt(Qm, 'J') + '$ of heat. How many kilograms of it melt? Use $L_f = 3.34 \\times 10^{5}\\,\\text{J/kg}$. (Assume there is more ice than this heat can melt.)', a: ans(mm), unit: 'kg',
        steps: ['At $0\\,^\\circ\\text{C}$ all the heat goes into melting: $Q = mL_f$, so $m = Q/L_f$.',
          '$m = \\dfrac{' + qt(Qm, 'J') + '}{3.34 \\times 10^{5}\\,\\text{J/kg}} = ' + qt(mm, 'kg') + '$.'],
        hint: 'Solve $Q = mL_f$ for $m$.', chk: { k: k, Q: Qm, ans: mm } };
    }
    if (k === 'iceToWater') {
      var m = R.pick([0.10, 0.20, 0.25, 0.50, 1.0]), T0 = -R.pick([5, 10, 15, 20, 30]), T1 = R.pick([10, 20, 25, 40, 50]);
      var q1 = m * CICE * (0 - T0), q2 = m * LF, q3 = m * CW * T1, Qt = q1 + q2 + q3;
      return { q: 'How much heat does it take to turn $' + qx(m, 'kg') + '$ of ice at $' + cdeg(T0) + '$ into water at $' + cdeg(T1) + '$? Use ' + wtxt + '.', a: ans(Qt), unit: 'J',
        viz: { name: 'ph-thermal', opts: { mode: 'heating-curve', m: m, T0: T0, T1: T1, q: 1, interactive: false, quiet: true } },
        steps: ['Three stages: warm the ice to $0\\,^\\circ\\text{C}$, melt it, then warm the water.',
          'Warm the ice: $Q_1 = mc_{\\text{ice}}\\Delta T = (' + tg(m) + ')(2100)(' + (0 - T0) + ') = ' + qt(q1, 'J') + '$.',
          'Melt it: $Q_2 = mL_f = (' + tg(m) + ')(3.34 \\times 10^{5}) = ' + qt(q2, 'J') + '$.',
          'Warm the water: $Q_3 = mc_{\\text{water}}\\Delta T = (' + tg(m) + ')(4186)(' + T1 + ') = ' + qt(q3, 'J') + '$.',
          'Total: $Q = ' + tn(q1, 3) + ' + ' + tn(q2, 3) + ' + ' + tn(q3, 3) + ' = ' + qt(Qt, 'J') + '$. The melting step is the biggest.'],
        hint: 'Add the heat for warming the ice, melting it and warming the water.', chk: { k: k, m: m, T0: T0, T1: T1, ans: Qt } };
    }
    if (k === 'waterToSteam') {
      var ms = R.pick([0.10, 0.20, 0.25, 0.50]), Ts = R.pick([10, 20, 25, 40, 60]), qa = ms * CW * (100 - Ts), qb = ms * LV, Qs = qa + qb;
      return { q: 'How much heat does it take to turn $' + qx(ms, 'kg') + '$ of water at $' + cdeg(Ts) + '$ completely into steam at $100\\,^\\circ\\text{C}$? Use $c_{\\text{water}} = 4186\\,' + UT['J/kgK'] + '$ and $L_v = 2.26 \\times 10^{6}\\,\\text{J/kg}$.', a: ans(Qs), unit: 'J',
        steps: ['Two stages: warm the water to $100\\,^\\circ\\text{C}$, then boil it.',
          'Warm: $Q_1 = (' + tg(ms) + ')(4186)(' + (100 - Ts) + ') = ' + qt(qa, 'J') + '$.',
          'Boil: $Q_2 = (' + tg(ms) + ')(2.26 \\times 10^{6}) = ' + qt(qb, 'J') + '$.',
          'Total: $Q = ' + qt(Qs, 'J') + '$.'],
        hint: 'Warm it to the boiling point, then add $mL_v$.', chk: { k: k, m: ms, T0: Ts, ans: Qs } };
    }
    // mix: an ice cube in warm water; all of it melts
    var mi = R.pick([0.020, 0.030, 0.040, 0.050]), mw = R.pick([0.20, 0.25, 0.30, 0.40]), Tw = R.pick([40, 50, 60, 70]);
    var Tf = (mw * CW * Tw - mi * LF) / ((mw + mi) * CW);
    if (Tf <= 2) { mi = 0.020; mw = 0.40; Tw = 60; Tf = (mw * CW * Tw - mi * LF) / ((mw + mi) * CW); }
    return { q: 'An ice cube of mass $' + qx(mi, 'kg') + '$ at $0\\,^\\circ\\text{C}$ is dropped into $' + qx(mw, 'kg') + '$ of water at $' + cdeg(Tw) + '$ in an insulated cup. All of the ice melts. What is the final temperature? Use $c_{\\text{water}} = 4186\\,' + UT['J/kgK'] + '$ and $L_f = 3.34 \\times 10^{5}\\,\\text{J/kg}$; ignore the cup.', a: ans(Tf, { rtol: 0.03 }), unit: '°C',
      steps: ['Heat gained by the ice (melting, then warming from 0 to $T_f$) = heat lost by the warm water: $m_i L_f + m_i c T_f = m_w c (' + Tw + ' - T_f)$.',
        'Melting takes $m_i L_f = (' + tg(mi) + ')(3.34 \\times 10^{5}) = ' + qt(mi * LF, 'J') + '$.',
        'Collect the $T_f$ terms: $(m_i + m_w) c\\,T_f = m_w c (' + Tw + ') - m_i L_f$.',
        '$T_f = \\dfrac{(' + tg(mw) + ')(4186)(' + Tw + ') - ' + tn(mi * LF, 3) + '}{(' + tn(mi + mw, 3) + ')(4186)} = ' + tn(Tf, 3) + '\\,^\\circ\\text{C}$.'],
      hint: 'Do not forget the heat that melts the ice before the melted water warms up.', chk: { k: k, mi: mi, mw: mw, Tw: Tw, ans: Tf } };
  });

  var MATS = [{ n: 'window glass', k: 0.84 }, { n: 'brick', k: 0.84 }, { n: 'wood', k: 0.12 }, { n: 'styrofoam', k: 0.010 }, { n: 'concrete', k: 0.84 }, { n: 'ice', k: 2.2 }];
  G('phys2.conduction-rate', function (R, ctx) {
    var k = kind(R, ctx, ['rate', 'ratio', 'concept'], ['rate', 'ratio', 'energy', 'thickness', 'concept'], ['twoLayer', 'thickness', 'energy', 'rate']);
    if (k === 'concept') {
      return { q: 'A metal bench and a wooden bench have sat side by side in the shade all day, so both are at the same temperature, $15\\,^\\circ\\text{C}$. The metal feels much colder to sit on. Why?',
        a: mc('Metal conducts heat away from your body much faster than wood.', ['The metal is at a lower temperature than the wood.', 'Wood produces a little heat of its own.', 'Metal holds more cold, which flows into your body.']),
        viz: { name: 'ph-thermal', opts: { mode: 'slab', material: 'steel', d: 0.01, dT: 20, interactive: false } },
        steps: ['Both benches are at the same temperature: they have been in the same surroundings for hours.',
          'Your body is warmer, so heat flows from you into the bench at the rate $P = kA\\Delta T/L$.',
          'Metal\'s conductivity $k$ is hundreds of times wood\'s, so it pulls heat from your skin much faster, and your skin cools. "Feeling cold" is sensing that fast heat loss, not the bench\'s temperature.'],
        hint: 'Which one carries heat away from you faster?', chk: { k: k, ans: 0 } };
    }
    if (k === 'rate') {
      var m = R.pick(MATS.slice(0, 3)), A = R.pick([0.80, 1.0, 1.2, 1.5, 2.0]), dmm = m.n === 'window glass' ? R.pick([3.0, 4.0, 5.0, 6.0]) : R.pick([20, 50, 100]), dT = R.pick([10, 15, 20, 25, 30]), P = m.k * A * dT / (dmm / 1000);
      return { q: 'A ' + m.n + ' panel ($k = ' + tx(m.k) + '\\,' + UT['W/mK'] + '$) has an area of $' + qx(A, 'm2') + '$ and a thickness of $' + qx(dmm, 'mm') + '$. Inside it is $' + dT + '\\,^\\circ\\text{C}$ warmer than outside. At what rate does heat flow through it?', a: ans(P), unit: 'W',
        viz: { name: 'ph-thermal', opts: { mode: 'slab', k: m.k, A: A, d: dmm / 1000, dT: dT, interactive: false, quiet: true } },
        steps: ['Rate of conduction: $P = \\dfrac{kA\\Delta T}{L}$, with $L$ in meters: $L = ' + qx(dmm, 'mm') + ' = ' + tn(dmm / 1000, 2) + '\\,\\text{m}$.',
          'A temperature difference of $' + dT + '\\,^\\circ\\text{C}$ is also $' + dT + '\\,\\text{K}$.',
          '$P = \\dfrac{(' + tx(m.k) + ')(' + tg(A) + ')(' + dT + ')}{' + tn(dmm / 1000, 2) + '} = ' + qt(P, 'W') + '$.'],
        hint: 'Use $P = kA\\Delta T/L$ with the thickness in meters.', chk: { k: k, kk: m.k, A: A, d: dmm, dT: dT, ans: P } };
    }
    if (k === 'ratio') {
      var P0 = R.pick([120, 200, 300, 450, 600]), fL = R.pick([2, 3, 0.5]), fA = R.pick([1, 2, 1.5]), Pn = P0 * fA / fL;
      var chg = [];
      if (fL !== 1) chg.push(fL > 1 ? (fL === 2 ? 'twice as thick' : 'three times as thick') : 'half as thick');
      if (fA !== 1) chg.push(fA === 2 ? 'twice the area' : '1.5 times the area');
      return { q: 'Heat flows through a wall at $' + qx(P0, 'W') + '$. A new wall of the same material, with the same temperatures on each side, is ' + chg.join(' and has ') + '. At what rate does heat flow through the new wall?', a: ans(Pn), unit: 'W',
        steps: ['$P = \\dfrac{kA\\Delta T}{L}$: the rate is proportional to the area and inversely proportional to the thickness.',
          (fA !== 1 ? 'The area factor multiplies the rate by $' + tx(fA) + '$. ' : '') + 'The thickness factor divides it by $' + tx(fL) + '$.',
          '$P = ' + qx(P0, 'W') + ' \\times \\dfrac{' + tx(fA) + '}{' + tx(fL) + '} = ' + qt(Pn, 'W') + '$.'],
        hint: 'Which quantities are on top of $kA\\Delta T/L$, and which is on the bottom?', chk: { k: k, P0: P0, fL: fL, fA: fA, ans: Pn } };
    }
    if (k === 'energy') {
      var A2 = R.pick([1.0, 1.5, 2.0]), d2 = R.pick([4.0, 5.0, 6.0]), dT2 = R.pick([10, 15, 20]), hrs = R.pick([1, 2, 8, 10]), P2 = 0.84 * A2 * dT2 / (d2 / 1000), Ekj = P2 * hrs * 3600 / 1e6;
      return { q: 'A single-pane window ($k = 0.84\\,' + UT['W/mK'] + '$) is $' + qx(A2, 'm2') + '$ in area and $' + qx(d2, 'mm') + '$ thick, with a steady $' + dT2 + '\\,^\\circ\\text{C}$ difference across it. How much heat, in megajoules, escapes in ' + U.plural(hrs, 'hour') + '?', a: ans(Ekj), unit: 'MJ',
        steps: ['Rate: $P = \\dfrac{kA\\Delta T}{L} = \\dfrac{(0.84)(' + tg(A2) + ')(' + dT2 + ')}{' + tn(d2 / 1000, 2) + '} = ' + qt(P2, 'W') + '$.',
          'Time: $t = ' + hrs + ' \\times 3600\\,\\text{s} = ' + tx(hrs * 3600) + '\\,\\text{s}$.',
          'Heat: $Q = Pt = (' + qt(P2, 'W') + ')(' + tx(hrs * 3600) + '\\,\\text{s}) = ' + qt(P2 * hrs * 3600, 'J') + ' = ' + qt(Ekj, 'MJ') + '$.'],
        hint: 'Find the rate in watts (joules per second), then multiply by the time in seconds.', chk: { k: k, A: A2, d: d2, dT: dT2, h: hrs, ans: Ekj } };
    }
    if (k === 'thickness') {
      var Pmax = R.pick([20, 25, 40, 50, 80]), A3 = R.pick([2.0, 4.0, 5.0, 10]), dT3 = R.pick([20, 25, 30, 40]), Lm = 0.010 * A3 * dT3 / Pmax;
      return { q: 'A cooler wall made of styrofoam ($k = 0.010\\,' + UT['W/mK'] + '$) has an area of $' + qx(A3, 'm2') + '$ and a $' + dT3 + '\\,^\\circ\\text{C}$ difference across it. How thick must it be so that heat leaks in no faster than $' + qx(Pmax, 'W') + '$? Give the answer in centimeters.', a: ans(Lm * 100), unit: 'cm',
        steps: ['Solve $P = \\dfrac{kA\\Delta T}{L}$ for the thickness: $L = \\dfrac{kA\\Delta T}{P}$.',
          '$L = \\dfrac{(0.010)(' + tg(A3) + ')(' + dT3 + ')}{' + Pmax + '} = ' + qt(Lm, 'm') + ' = ' + qt(Lm * 100, 'cm') + '$.',
          'A thicker wall would leak even less.'],
        hint: 'Rearrange $P = kA\\Delta T/L$ for $L$.', chk: { k: k, A: A3, dT: dT3, P: Pmax, ans: Lm * 100 } };
    }
    // twoLayer: two slabs in series
    var A4 = R.pick([1.0, 2.0, 5.0]), L1 = R.pick([0.10, 0.20]), L2 = R.pick([0.020, 0.050]), dT4 = R.pick([20, 25, 30]);
    var Rt = L1 / 0.84 + L2 / 0.010, P4 = A4 * dT4 / Rt;
    return { q: 'A wall is a layer of brick ($' + qx(L1, 'm') + '$ thick, $k = 0.84\\,' + UT['W/mK'] + '$) backed by a layer of foam ($' + qx(L2, 'm') + '$ thick, $k = 0.010\\,' + UT['W/mK'] + '$). Its area is $' + qx(A4, 'm2') + '$ and the temperature difference across the whole wall is $' + dT4 + '\\,^\\circ\\text{C}$. At what steady rate does heat flow through it?', a: ans(P4), unit: 'W',
      steps: ['In steady flow the same heat per second passes through both layers, and their temperature drops add to $' + dT4 + '\\,^\\circ\\text{C}$.',
        'Each layer\'s drop is $\\Delta T_i = P\\dfrac{L_i}{k_i A}$, so $\\Delta T = \\dfrac{P}{A}\\left(\\dfrac{L_1}{k_1} + \\dfrac{L_2}{k_2}\\right)$.',
        '$\\dfrac{L_1}{k_1} + \\dfrac{L_2}{k_2} = \\dfrac{' + tg(L1) + '}{0.84} + \\dfrac{' + tg(L2) + '}{0.010} = ' + tn(L1 / 0.84, 3) + ' + ' + tn(L2 / 0.010, 3) + ' = ' + tn(Rt, 3) + '\\,\\text{m}^2\\cdot\\text{K/W}$.',
        '$P = \\dfrac{A\\Delta T}{' + tn(Rt, 3) + '} = \\dfrac{(' + tg(A4) + ')(' + dT4 + ')}{' + tn(Rt, 3) + '} = ' + qt(P4, 'W') + '$. The thin foam does most of the insulating.'],
      hint: 'The same heat flow passes through both layers; add their $L/k$ values.', chk: { k: k, A: A4, L1: L1, L2: L2, dT: dT4, ans: P4 } };
  });

  G('phys2.thermal-radiation', function (R, ctx) {
    var k = kind(R, ctx, ['ratio', 'wien', 'concept'], ['ratio', 'power', 'wien', 'wienT', 'concept'], ['net', 'power', 'wienT', 'ratio']);
    var stxt = '$\\sigma = 5.67 \\times 10^{-8}\\,' + UT['W/m2K4'] + '$';
    if (k === 'concept') {
      return { q: 'Which of these objects give off thermal (electromagnetic) radiation: an ice cube at $0\\,^\\circ\\text{C}$, a cup of tea, a person, and a glowing stove element?',
        a: mc('All four of them.', ['Only the glowing stove element.', 'Only the tea and the stove element, the hot objects.', 'Only the stove element and the person.']),
        viz: { name: 'ph-blackbody', opts: { presets: ['stove element', 'person'], scale: 'log', interactive: false } },
        steps: ['Every object above absolute zero radiates, at the rate $P = e\\sigma A T^4$.',
          'Cool objects radiate mostly in the infrared, which our eyes cannot see. Only above about $800\\,\\text{K}$ is enough of the radiation visible for an object to glow red.',
          'So the ice cube, the tea and the person all radiate too, just less, and at longer wavelengths.'],
        hint: 'Is there a temperature in $e\\sigma AT^4$ that gives zero, other than absolute zero?', chk: { k: k, ans: 0 } };
    }
    if (k === 'ratio') {
      var useC = R.coin(), T1 = R.pick([200, 300, 400, 500]), f = R.pick([2, 3, 1.5]), T2 = T1 * f, F = Math.pow(f, 4);
      var t1s = useC ? cdeg(T1 - 273) : tx(T1) + '\\,\\text{K}', t2s = useC ? cdeg(T2 - 273) : tx(T2) + '\\,\\text{K}';
      return { q: 'An object at $' + t1s + '$ is heated to $' + t2s + '$. Its size and surface do not change. By what factor does the power it radiates increase?', a: ans(F, { n: 4, rtol: 0.01 }),
        steps: [(useC ? 'Use kelvins: $' + kel(T1 - 273) + '$ and $' + kel(T2 - 273) + '$. ' : '') + 'Radiated power goes as $T^4$: $\\dfrac{P_2}{P_1} = \\left(\\dfrac{T_2}{T_1}\\right)^4$.',
          '$\\dfrac{T_2}{T_1} = \\dfrac{' + T2 + '}{' + T1 + '} = ' + tx(f) + '$.',
          '$\\dfrac{P_2}{P_1} = ' + tx(f) + '^4 = ' + tx(F) + '$.'],
        hint: 'Power goes as the fourth power of the kelvin temperature.', chk: { k: k, T1: T1, T2: T2, ans: F } };
    }
    if (k === 'power') {
      var e = R.pick([0.50, 0.80, 0.90, 0.95, 1.0]), A = R.pick([0.010, 0.020, 0.050, 0.10, 0.50]), T = R.pick([400, 500, 600, 800, 1000, 1200]), P = e * SIG * A * Math.pow(T, 4);
      return { q: 'A hot plate has emissivity $' + tg(e) + '$, a surface area of $' + qx(A, 'm2') + '$ and a temperature of $' + tx(T) + '\\,\\text{K}$. How much power does it radiate? Use ' + stxt + '.', a: ans(P), unit: 'W',
        steps: ['Stefan–Boltzmann law: $P = e\\sigma A T^4$, with $T$ in kelvins.',
          '$T^4 = (' + T + ')^4 = ' + tn(Math.pow(T, 4), 3) + '\\,\\text{K}^4$.',
          '$P = (' + tg(e) + ')(5.67 \\times 10^{-8})(' + tg(A) + ')(' + tn(Math.pow(T, 4), 3) + ') = ' + qt(P, 'W') + '$.'],
        hint: 'Use $P = e\\sigma AT^4$.', chk: { k: k, e: e, A: A, T: T, ans: P } };
    }
    if (k === 'wien') {
      var obj = R.pick([{ n: 'the Sun\'s surface', T: 5772 }, { n: 'a red giant star\'s surface', T: 3500 }, { n: 'a hot blue star\'s surface', T: 12000 }, { n: 'a stove element', T: 1000 }, { n: 'your skin', T: 306 }, { n: 'a lamp filament', T: 2800 }]);
      var lm = WIEN / obj.T, nm = lm * 1e9;
      return { q: 'Treat ' + obj.n + ' as a blackbody at $' + tx(obj.T) + '\\,\\text{K}$. At what wavelength does its radiation peak? Use $\\lambda_{\\max}T = 2.898 \\times 10^{-3}\\,\\text{m}\\cdot\\text{K}$ and give the answer in nanometers.', a: ans(nm), unit: 'nm',
        viz: { name: 'ph-blackbody', opts: { T: [obj.T], interactive: false, quiet: true } },
        steps: ['Wien\'s law: $\\lambda_{\\max} = \\dfrac{2.898 \\times 10^{-3}\\,\\text{m}\\cdot\\text{K}}{T}$.',
          '$\\lambda_{\\max} = \\dfrac{2.898 \\times 10^{-3}}{' + obj.T + '}\\,\\text{m} = ' + qt(lm, 'm') + ' = ' + qt(nm, 'nm') + '$.',
          nm < 380 ? 'That is ultraviolet, shorter than violet light.' : nm <= 750 ? 'That is in the visible range.' : 'That is infrared, longer than red light.'],
        hint: 'Hotter objects peak at shorter wavelengths: $\\lambda_{\\max} = b/T$.', chk: { k: k, T: obj.T, ans: nm } };
    }
    if (k === 'wienT') {
      var nm2 = R.pick([290, 350, 400, 450, 500, 580, 725, 966]), T3 = WIEN / (nm2 * 1e-9);
      return { q: 'A star\'s light is brightest at a wavelength of $' + tx(nm2) + '\\,\\text{nm}$. Treating it as a blackbody, what is its surface temperature? Use $\\lambda_{\\max}T = 2.898 \\times 10^{-3}\\,\\text{m}\\cdot\\text{K}$.', a: ans(T3), unit: 'K',
        steps: ['Wien\'s law: $T = \\dfrac{2.898 \\times 10^{-3}\\,\\text{m}\\cdot\\text{K}}{\\lambda_{\\max}}$.',
          '$\\lambda_{\\max} = ' + tx(nm2) + '\\,\\text{nm} = ' + tn(nm2 * 1e-9, 3) + '\\,\\text{m}$.',
          '$T = \\dfrac{2.898 \\times 10^{-3}}{' + tn(nm2 * 1e-9, 3) + '}\\,\\text{K} = ' + qt(T3, 'K') + '$.'],
        hint: 'Solve $\\lambda_{\\max}T = b$ for $T$, with the wavelength in meters.', chk: { k: k, nm: nm2, ans: T3 } };
    }
    // net: a person in a cooler room
    var Ab = R.pick([1.5, 1.6, 1.8, 2.0]), Ts = R.pick([306, 307, 308]), Te = R.pick([288, 290, 293, 295]), eb = 0.97, Pn = eb * SIG * Ab * (Math.pow(Ts, 4) - Math.pow(Te, 4));
    return { q: 'A person with $' + qx(Ab, 'm2') + '$ of exposed skin at $' + Ts + '\\,\\text{K}$ (emissivity $0.97$) stands in a room whose walls are at $' + Te + '\\,\\text{K}$. What is the net power the person loses by radiation? Use ' + stxt + '.', a: ans(Pn, { rtol: 0.03 }), unit: 'W',
      steps: ['The person radiates $e\\sigma A T_s^4$ and absorbs $e\\sigma A T_e^4$ from the walls, so the net loss is $P = e\\sigma A (T_s^4 - T_e^4)$.',
        '$T_s^4 - T_e^4 = ' + tn(Math.pow(Ts, 4), 4) + ' - ' + tn(Math.pow(Te, 4), 4) + ' = ' + tn(Math.pow(Ts, 4) - Math.pow(Te, 4), 3) + '\\,\\text{K}^4$.',
        '$P = (0.97)(5.67 \\times 10^{-8})(' + tg(Ab) + ')(' + tn(Math.pow(Ts, 4) - Math.pow(Te, 4), 3) + ') = ' + qt(Pn, 'W') + '$. That is why a room with cold walls can feel chilly even when the air is warm.'],
      hint: 'Net power is $e\\sigma A(T^4 - T_{\\text{env}}^4)$; take the fourth powers before subtracting.', chk: { k: k, A: Ab, Ts: Ts, Te: Te, ans: Pn } };
  });

  // ---------------------------------------------------------------- thermodynamics: work, the first law, processes, cycles, engines, entropy
  function pv(states, path, o) { var op = { mode: 'process', states: states, path: path, interactive: false, quiet: true, hide: ['table'] }; if (o) for (var z in o) op[z] = o[z]; return { name: 'ph-pv', opts: op }; }
  function sJ(x) { return (x > 0 ? '+' : '') + (Number.isInteger(x) ? tx(x) : tn(x, 3)) + '\\,\\text{J}'; } // signed joules

  G('phys2.pv-work', function (R, ctx) {
    var k = kind(R, ctx, ['isobaricOn', 'isobaricBy', 'isochoric'], ['isobaricOn', 'isobaricBy', 'line', 'isochoric'], ['line', 'twoLeg', 'compare', 'isobaricOn']);
    if (k === 'isobaricOn' || k === 'isobaricBy') {
      var P = R.pick([100, 150, 200, 250, 300, 400]), V1 = R.pick([1.0, 2.0, 3.0, 4.0, 5.0]), dV = R.pick([1.0, 2.0, 3.0, 4.0]) * (R.chance(0.6) ? 1 : -1), V2 = V1 + dV;
      if (V2 <= 0) { dV = -dV; V2 = V1 + dV; }
      var Won = -P * dV, Wby = -Won, on = k === 'isobaricOn', exp = dV > 0;
      return { q: 'A gas at a constant pressure of $' + qx(P, 'kPa') + '$ ' + (exp ? 'expands' : 'is compressed') + ' from $' + qx(V1, 'L') + '$ to $' + qx(V2, 'L') + '$. How much work is done ' + (on ? '<b>on</b> the gas' : '<b>by</b> the gas') + '? (Give a negative answer if the energy goes the other way.)',
        a: ans(on ? Won : Wby, { rtol: 0.01 }), unit: 'J',
        viz: pv([[P, V1], [P, V2]], ['isobaric']),
        steps: ['At constant pressure the work done on the gas is $W = -P\\Delta V$, the area under the path, with a minus sign because an expanding gas pushes the piston out and gives energy away.',
          '$\\Delta V = ' + qx(V2, 'L') + ' - ' + qx(V1, 'L') + ' = ' + tx(U.fix(dV)) + '\\,\\text{L} = ' + tn(dV / 1000, 2) + '\\,\\text{m}^3$, and $P = ' + qt(P * 1000, 'Pa') + '$.',
          'Work on the gas: $W = -(' + qt(P * 1000, 'Pa') + ')(' + tn(dV / 1000, 2) + '\\,\\text{m}^3) = ' + sJ(Won) + '$. (Shortcut: $1\\,\\text{kPa} \\cdot \\text{L} = 1\\,\\text{J}$.)',
          on ? (Won < 0 ? 'Negative: the gas does $' + tn(Wby, 3) + '\\,\\text{J}$ of work on the piston.' : 'Positive: the piston pushes the gas in and gives it energy.')
            : 'Work by the gas is the opposite: $W_{\\text{by}} = +P\\Delta V = ' + sJ(Wby) + '$' + (Wby < 0 ? ', negative because the gas is compressed.' : '.')],
        hint: on ? 'Work on the gas is $-P\\Delta V$.' : 'Work by the gas is $+P\\Delta V$; it is positive when the gas expands.', chk: { k: k, P: P, V1: V1, V2: V2, ans: on ? Won : Wby } };
    }
    if (k === 'isochoric') {
      var V = R.pick([2.0, 3.0, 5.0]), Pa = R.pick([100, 150, 200]), Pb = R.coin() ? Pa + R.pick([50, 100, 150]) : Pa - R.pick([30, 50]);
      return { q: 'A gas in a rigid container ($' + qx(V, 'L') + '$) is ' + (Pb > Pa ? 'heated' : 'cooled') + ', and its pressure changes from $' + qx(Pa, 'kPa') + '$ to $' + qx(Pb, 'kPa') + '$. How much work is done on the gas?', a: exact(0), unit: 'J',
        viz: pv([[Pa, V], [Pb, V]], ['isochoric']),
        steps: ['Work needs the boundary to move: $W = -P\\Delta V$, and here $\\Delta V = 0$.',
          'On a P–V diagram the path is a vertical line, with no area under it.',
          'So $W = 0\\,\\text{J}$. All the energy change comes from heat.'],
        hint: 'Does the volume change?', chk: { k: k, ans: 0 } };
    }
    if (k === 'line') {
      var P1 = R.pick([100, 200, 300]), P2 = R.pick([100, 200, 300, 400]), Va = R.pick([1.0, 2.0]), Vb = Va + R.pick([2.0, 3.0, 4.0]);
      if (P2 === P1) P2 = P1 + 100;
      var area = 0.5 * (P1 + P2) * (Vb - Va), W = -area;
      return { q: 'A gas expands along a straight line on a P–V diagram, from $(' + P1 + '\\,\\text{kPa}, ' + tg(Va) + '\\,\\text{L})$ to $(' + P2 + '\\,\\text{kPa}, ' + tg(Vb) + '\\,\\text{L})$. How much work is done on the gas?', a: ans(W, { rtol: 0.01 }), unit: 'J',
        viz: pv([[P1, Va], [P2, Vb]], ['line']),
        steps: ['The size of the work is the area under the path. Under a straight line it is a trapezoid: $\\tfrac{1}{2}(P_1 + P_2)\\Delta V$.',
          'Area $= \\tfrac{1}{2}(' + P1 + ' + ' + P2 + ')\\,\\text{kPa} \\times ' + tg(U.fix(Vb - Va)) + '\\,\\text{L} = ' + tn(area, 3) + '\\,\\text{kPa}\\cdot\\text{L} = ' + qt(area, 'J') + '$.',
          'The gas expands, so it does that work, and the work done on it is negative: $W = ' + sJ(W) + '$.'],
        hint: 'Find the trapezoid\'s area under the line; then decide the sign.', chk: { k: k, P1: P1, P2: P2, V1: Va, V2: Vb, ans: W } };
    }
    if (k === 'twoLeg') {
      var Ph = R.pick([200, 300, 400]), Pl = R.pick([100, 150]), Vx = R.pick([1.0, 2.0]), Vy = Vx + R.pick([2.0, 3.0, 4.0]), first = R.coin();
      // path from (Ph, Vx) to (Pl, Vy): expand at Ph then drop pressure, or drop pressure then expand at Pl
      var Wt = -(first ? Ph : Pl) * (Vy - Vx);
      var desc = first ? 'first expands at a constant $' + qx(Ph, 'kPa') + '$ from $' + qx(Vx, 'L') + '$ to $' + qx(Vy, 'L') + '$, then is cooled at constant volume until the pressure is $' + qx(Pl, 'kPa') + '$'
        : 'first is cooled at constant volume ($' + qx(Vx, 'L') + '$) from $' + qx(Ph, 'kPa') + '$ to $' + qx(Pl, 'kPa') + '$, then expands at a constant $' + qx(Pl, 'kPa') + '$ to $' + qx(Vy, 'L') + '$';
      return { q: 'A gas ' + desc + '. What is the total work done on the gas?', a: ans(Wt, { rtol: 0.01 }), unit: 'J',
        viz: first ? pv([[Ph, Vx], [Ph, Vy], [Pl, Vy]], ['isobaric', 'isochoric']) : pv([[Ph, Vx], [Pl, Vx], [Pl, Vy]], ['isochoric', 'isobaric']),
        steps: ['Add the work of each leg. The constant-volume leg does no work ($\\Delta V = 0$).',
          'The constant-pressure leg: $W = -P\\Delta V = -(' + qx(first ? Ph : Pl, 'kPa') + ')(' + tg(U.fix(Vy - Vx)) + '\\,\\text{L}) = ' + sJ(Wt) + '$.',
          'Total: $W = ' + sJ(Wt) + '$. The same two end states with the legs in the other order would give a different answer: work depends on the path.'],
        hint: 'Only the leg where the volume changes contributes.', chk: { k: k, P: first ? Ph : Pl, V1: Vx, V2: Vy, Ph: Ph, Pl: Pl, ans: Wt } };
    }
    // compare two paths between the same states
    var Pc = R.pick([300, 400]), Pd = R.pick([100, 150]), Vc = 2.0, Vd = R.pick([5.0, 6.0]);
    return { q: 'A gas goes from state A ($' + Pc + '\\,\\text{kPa}$, $' + tg(Vc) + '\\,\\text{L}$) to state C ($' + Pd + '\\,\\text{kPa}$, $' + tg(Vd) + '\\,\\text{L}$) by two different paths. Path 1: expand at $' + Pc + '\\,\\text{kPa}$, then cool at constant volume. Path 2: cool at constant volume, then expand at $' + Pd + '\\,\\text{kPa}$. On which path does the gas do more work?',
      a: mc('Path 1, because it expands at the higher pressure.', ['Path 2, because it ends at the lower pressure.', 'They are equal, because they start and end at the same states.', 'Neither: a gas does work only when it is heated.']),
      viz: pv([[Pc, Vc], [Pc, Vd], [Pd, Vd]], ['isobaric', 'isochoric']),
      steps: ['The work done by the gas is the area under its path on the P–V diagram, and the constant-volume legs add no area.',
        'Path 1: $' + Pc + '\\,\\text{kPa} \\times ' + tg(Vd - Vc) + '\\,\\text{L} = ' + tx(Pc * (Vd - Vc)) + '\\,\\text{J}$. Path 2: $' + Pd + '\\,\\text{kPa} \\times ' + tg(Vd - Vc) + '\\,\\text{L} = ' + tx(Pd * (Vd - Vc)) + '\\,\\text{J}$.',
        'Path 1 does more work. Work is not a property of a state; it depends on the path.'],
      hint: 'Compare the areas under the two paths.', chk: { k: k, ans: 0 } };
  });

  // a work phrase with its sign on the gas: W > 0 means work done ON the gas
  function wPhrase(W) { return W >= 0 ? 'the surroundings do $' + qx(W, 'J') + '$ of work on the gas' : 'the gas does $' + qx(-W, 'J') + '$ of work on its surroundings'; }
  function qPhrase(Q) { return Q >= 0 ? 'absorbs $' + qx(Q, 'J') + '$ of heat' : 'gives off $' + qx(-Q, 'J') + '$ of heat'; }

  G('phys2.first-law', function (R, ctx) {
    var k = kind(R, ctx, ['dU', 'dU', 'isothermal', 'concept'], ['dU', 'Q', 'W', 'concept', 'lab'], ['monatomic', 'Q', 'W', 'lab']);
    if (k === 'concept') {
      var Qx = R.pick([150, 200, 300, 500]);
      return { q: 'An ideal gas absorbs $' + qx(Qx, 'J') + '$ of heat and, at the same time, does $' + qx(Qx, 'J') + '$ of work pushing a piston out. What happens to its temperature?',
        a: mc('It stays the same.', ['It rises, because heat was added.', 'It falls, because the gas did work.', 'It rises, because the gas expanded.']),
        steps: ['First law: $\\Delta U = Q + W$, with $W$ the work done on the gas. Here $Q = +' + Qx + '\\,\\text{J}$ and $W = -' + Qx + '\\,\\text{J}$.',
          '$\\Delta U = ' + Qx + ' - ' + Qx + ' = 0$.',
          'An ideal gas\'s internal energy depends only on its temperature, so the temperature does not change. The heat went straight out as work.'],
        hint: 'Find $\\Delta U$ first.', chk: { k: k, ans: 0 } };
    }
    if (k === 'dU') {
      var Q = R.pick([100, 150, 200, 250, 400, 500, 600]) * (R.chance(0.75) ? 1 : -1), W = R.pick([50, 80, 100, 120, 200, 300]) * R.sign(), dU = Q + W;
      return { q: 'A gas ' + qPhrase(Q) + ' while ' + wPhrase(W) + '. What is the change in the gas\'s internal energy?', a: ans(dU, { rtol: 0.005 }), unit: 'J',
        steps: ['First law: $\\Delta U = Q + W$, where $Q$ is the heat added to the gas and $W$ is the work done <b>on</b> it.',
          'Signs: $Q = ' + sJ(Q) + '$ (' + (Q > 0 ? 'heat in' : 'heat out') + '), $W = ' + sJ(W) + '$ (' + (W > 0 ? 'work done on the gas' : 'the gas does work, so the work done on it is negative') + ').',
          '$\\Delta U = ' + tn(Q, 3) + ' + ' + (W < 0 ? '(' + tn(W, 3) + ')' : tn(W, 3)) + ' = ' + sJ(dU) + '$.'],
        hint: 'Give $Q$ and $W$ their signs, then add.', chk: { k: k, Q: Q, W: W, ans: dU } };
    }
    if (k === 'Q') {
      var dU2 = R.pick([-200, -100, 100, 150, 250, 300]), W2 = R.pick([-300, -200, -150, 100, 200]), Q2 = dU2 - W2;
      return { q: 'The internal energy of a gas changes by $' + sJ(dU2) + '$ while ' + wPhrase(W2) + '. How much heat flows into the gas? (Negative means heat flows out.)', a: ans(Q2, { rtol: 0.005 }), unit: 'J',
        steps: ['$\\Delta U = Q + W$, so $Q = \\Delta U - W$, with $W$ the work done on the gas: $W = ' + sJ(W2) + '$.',
          '$Q = ' + tn(dU2, 3) + ' - ' + (W2 < 0 ? '(' + tn(W2, 3) + ')' : tn(W2, 3)) + ' = ' + sJ(Q2) + '$.',
          Q2 > 0 ? 'Positive: heat flows into the gas.' : 'Negative: heat flows out of the gas.'],
        hint: 'Rearrange $\\Delta U = Q + W$; keep the sign of the work.', chk: { k: k, dU: dU2, W: W2, ans: Q2 } };
    }
    if (k === 'W') {
      var Q3 = R.pick([200, 300, 400, 500, 800]), dU3 = R.pick([50, 100, 150, 250, -100]), W3 = dU3 - Q3;
      return { q: 'A gas absorbs $' + qx(Q3, 'J') + '$ of heat, and its internal energy changes by $' + sJ(dU3) + '$. How much work is done on the gas? (Negative means the gas does work on its surroundings.)', a: ans(W3, { rtol: 0.005 }), unit: 'J',
        steps: ['$\\Delta U = Q + W$, so $W = \\Delta U - Q$.',
          '$W = ' + tn(dU3, 3) + ' - ' + tn(Q3, 3) + ' = ' + sJ(W3) + '$.',
          'Negative work on the gas means the gas did $' + tn(-W3, 3) + '\\,\\text{J}$ of work: of the $' + Q3 + '\\,\\text{J}$ of heat, only $' + tn(dU3, 3) + '\\,\\text{J}$ stayed inside as internal energy.'],
        hint: 'Rearrange $\\Delta U = Q + W$ for $W$.', chk: { k: k, Q: Q3, dU: dU3, ans: W3 } };
    }
    if (k === 'isothermal') {
      var Q4 = R.pick([120, 200, 350, 450, 600]);
      return { q: 'An ideal gas expands slowly at constant temperature while absorbing $' + qx(Q4, 'J') + '$ of heat. How much work does the gas do on its surroundings?', a: ans(Q4, { rtol: 0.005 }), unit: 'J',
        viz: pv([[300, 2], [150, 4]], ['isothermal']),
        steps: ['An ideal gas\'s internal energy depends only on its temperature. Constant temperature means $\\Delta U = 0$.',
          'First law: $0 = Q + W$, so the work done on the gas is $W = -Q = -' + Q4 + '\\,\\text{J}$.',
          'The gas does $' + qx(Q4, 'J') + '$ of work: every joule of heat that came in left as work, so the temperature never rose.'],
        hint: 'What is $\\Delta U$ for an ideal gas at constant temperature?', chk: { k: k, Q: Q4, ans: Q4 } };
    }
    if (k === 'lab') {
      var Q5 = R.pick([300, 400, 500, 600]), Wby = R.pick([100, 150, 200, 250]), dU5 = Q5 - Wby;
      return { q: 'The Science Lab writes the first law as $\\Delta U = Q - W_{\\text{by}}$, where $W_{\\text{by}}$ is the work done <b>by</b> the gas. A gas absorbs $' + qx(Q5, 'J') + '$ of heat and $W_{\\text{by}} = ' + qx(Wby, 'J') + '$. What is $\\Delta U$?', a: ans(dU5, { rtol: 0.005 }), unit: 'J',
        steps: ['Both forms say the same thing, because the work done on the gas is $W = -W_{\\text{by}}$.',
          'Lab form: $\\Delta U = Q - W_{\\text{by}} = ' + Q5 + ' - ' + Wby + ' = ' + dU5 + '\\,\\text{J}$.',
          'This course\'s form: $\\Delta U = Q + W = ' + Q5 + ' + (-' + Wby + ') = ' + dU5 + '\\,\\text{J}$. Same answer.'],
        hint: 'Work done by the gas is the negative of the work done on it.', chk: { k: k, Q: Q5, Wby: Wby, ans: dU5 } };
    }
    // monatomic: dU from n and dT, then Q
    var n = R.pick([0.20, 0.50, 1.0, 2.0]), dT = R.pick([10, 20, 30, 40, 50]), Wm = -R.pick([50, 80, 100, 150, 200]), dUm = 1.5 * n * RG * dT, Qm = dUm - Wm;
    return { q: '$' + tg(n) + '\\,\\text{mol}$ of helium (a monatomic ideal gas) warms by $' + dT + '\\,\\text{K}$ while it does $' + qx(-Wm, 'J') + '$ of work pushing a piston. How much heat was added? Use ' + Rtxt + '.', a: ans(Qm), unit: 'J',
      steps: ['For a monatomic ideal gas $U = \\tfrac{3}{2}nRT$, so $\\Delta U = \\tfrac{3}{2}nR\\Delta T = \\tfrac{3}{2}(' + tg(n) + ')(' + tx(RG) + ')(' + dT + ') = ' + qt(dUm, 'J') + '$.',
        'The gas does work, so the work done on it is $W = -' + (-Wm) + '\\,\\text{J}$.',
        '$Q = \\Delta U - W = ' + tn(dUm, 3) + ' + ' + (-Wm) + ' = ' + qt(Qm, 'J') + '$. The heat paid for the warming and for the work.'],
      hint: 'Find $\\Delta U = \\tfrac{3}{2}nR\\Delta T$, then use $Q = \\Delta U - W$.', chk: { k: k, n: n, dT: dT, Wby: -Wm, ans: Qm } };
  });

  G('phys2.thermo-processes', function (R, ctx) {
    var k = kind(R, ctx, ['identify', 'isothermal', 'adiabatic', 'isochoric'], ['identify', 'isochoric', 'isobaric', 'adiabatic', 'isothermal'], ['isobaric', 'tempChange', 'identify', 'adiabatic']);
    if (k === 'identify') {
      var which = R.pick([['$Q = 0$ (no heat flows in or out)', 'adiabatic'], ['$\\Delta U = 0$ for an ideal gas', 'isothermal'], ['$W = 0$', 'isochoric'], ['the work is $-P\\Delta V$ with a single fixed $P$', 'isobaric']]);
      var all = ['adiabatic', 'isothermal', 'isochoric', 'isobaric'];
      var names = { adiabatic: 'Adiabatic (no heat exchanged)', isothermal: 'Isothermal (constant temperature)', isochoric: 'Isochoric (constant volume)', isobaric: 'Isobaric (constant pressure)' };
      return { q: 'In which kind of process is ' + which[0] + '?', a: mc(names[which[1]], all.filter(function (x) { return x !== which[1]; }).map(function (x) { return names[x]; })),
        steps: ['Isochoric: the volume is fixed, so $W = 0$ and $Q = \\Delta U$.',
          'Isobaric: the pressure is fixed, so $W = -P\\Delta V$ and heat both changes $U$ and pays for the work.',
          'Isothermal: the temperature is fixed, so for an ideal gas $\\Delta U = 0$ and $Q = -W$. Heat does flow!',
          'Adiabatic: no heat flows, $Q = 0$, so $\\Delta U = W$ and the temperature changes.',
          'So the answer is ' + which[1] + '.'],
        hint: 'Match the fixed quantity to what drops out of $\\Delta U = Q + W$.', chk: { k: k, v: which[1], ans: 0 } };
    }
    if (k === 'isochoric') {
      var n = R.pick([0.10, 0.20, 0.50, 1.0, 2.0]), dT = R.pick([10, 20, 25, 40, 50, 100]), Q = 1.5 * n * RG * dT;
      return { q: 'How much heat is needed to warm $' + tg(n) + '\\,\\text{mol}$ of argon (a monatomic ideal gas) by $' + dT + '\\,\\text{K}$ in a sealed rigid container? Use ' + Rtxt + '.', a: ans(Q), unit: 'J',
        viz: pv([[100, 3], [130, 3]], ['isochoric']),
        steps: ['Rigid container: isochoric, so $W = 0$ and $Q = \\Delta U$.',
          'Monatomic ideal gas: $\\Delta U = \\tfrac{3}{2}nR\\Delta T$.',
          '$Q = \\tfrac{3}{2}(' + tg(n) + ')(' + tx(RG) + ')(' + dT + ') = ' + qt(Q, 'J') + '$.'],
        hint: 'No work is done, so all the heat goes into internal energy.', chk: { k: k, n: n, dT: dT, ans: Q } };
    }
    if (k === 'isobaric') {
      var P = R.pick([100, 150, 200, 300]), V1 = R.pick([1.0, 2.0, 3.0]), dV = R.pick([1.0, 2.0, 3.0, 4.0]), ask = R.pick(['Q', 'dU']);
      var W = -P * dV, dU = 1.5 * P * dV, Qb = dU - W;
      return { q: 'A monatomic ideal gas expands at a constant $' + qx(P, 'kPa') + '$ from $' + qx(V1, 'L') + '$ to $' + qx(V1 + dV, 'L') + '$. ' + (ask === 'Q' ? 'How much heat flows into it?' : 'By how much does its internal energy change?'), a: ans(ask === 'Q' ? Qb : dU, { rtol: 0.01 }), unit: 'J',
        viz: pv([[P, V1], [P, V1 + dV]], ['isobaric']),
        steps: ['Work done on the gas: $W = -P\\Delta V = -(' + P + '\\,\\text{kPa})(' + tg(dV) + '\\,\\text{L}) = ' + sJ(W) + '$ ($1\\,\\text{kPa}\\cdot\\text{L} = 1\\,\\text{J}$).',
          'Monatomic: $U = \\tfrac{3}{2}nRT = \\tfrac{3}{2}PV$, so at constant $P$: $\\Delta U = \\tfrac{3}{2}P\\Delta V = ' + sJ(dU) + '$.',
          ask === 'Q' ? 'First law: $Q = \\Delta U - W = ' + tn(dU, 3) + ' + ' + tn(-W, 3) + ' = ' + qt(Qb, 'J') + '$, which is $\\tfrac{5}{2}P\\Delta V$.' : 'So $\\Delta U = ' + qt(dU, 'J') + '$; the heat added was $\\tfrac{5}{2}P\\Delta V = ' + qt(Qb, 'J') + '$, more than $\\Delta U$ because the gas also did work.'],
        hint: 'For a monatomic gas, $\\Delta U = \\tfrac{3}{2}\\Delta(PV)$.', chk: { k: k, P: P, V1: V1, V2: V1 + dV, ask: ask === 'Q' ? 1 : 0, ans: ask === 'Q' ? Qb : dU } };
    }
    if (k === 'isothermal') {
      var Wb = R.pick([150, 250, 400, 500, 800]), comp = R.coin();
      return { q: 'An ideal gas is ' + (comp ? 'compressed slowly at constant temperature; the surroundings do $' + qx(Wb, 'J') + '$ of work on it' : 'allowed to expand slowly at constant temperature, doing $' + qx(Wb, 'J') + '$ of work') + '. How much heat flows into the gas? (Negative means heat flows out.)', a: ans(comp ? -Wb : Wb, { rtol: 0.005 }), unit: 'J',
        viz: pv(comp ? [[150, 4], [300, 2]] : [[300, 2], [150, 4]], ['isothermal']),
        steps: ['Isothermal ideal gas: the temperature does not change, so $\\Delta U = 0$.',
          'Work done on the gas: $W = ' + sJ(comp ? Wb : -Wb) + '$.',
          'First law: $0 = Q + W$, so $Q = -W = ' + sJ(comp ? -Wb : Wb) + '$. ' + (comp ? 'Heat must leave, or the gas would warm up.' : 'Heat must flow in, or the gas would cool down. Isothermal does not mean no heat.')],
        hint: 'At constant temperature an ideal gas has $\\Delta U = 0$.', chk: { k: k, W: Wb, ans: comp ? -Wb : Wb } };
    }
    if (k === 'adiabatic') {
      var Wa = R.pick([100, 150, 200, 300, 450]), cmp = R.coin();
      return { q: 'A gas in an insulated cylinder is ' + (cmp ? 'quickly compressed; $' + qx(Wa, 'J') + '$ of work is done on it' : 'allowed to expand, doing $' + qx(Wa, 'J') + '$ of work on a piston') + '. No heat flows. What is the change in its internal energy?', a: ans(cmp ? Wa : -Wa, { rtol: 0.005 }), unit: 'J',
        viz: pv(cmp ? [[100, 4], [317.5, 2]] : [[317.5, 2], [100, 4]], ['adiabatic']),
        steps: ['Adiabatic: $Q = 0$, so the first law gives $\\Delta U = W$ (the work done on the gas).',
          '$W = ' + sJ(cmp ? Wa : -Wa) + '$, so $\\Delta U = ' + sJ(cmp ? Wa : -Wa) + '$.',
          cmp ? 'The internal energy rises, so the gas gets hotter. That is why a bicycle pump warms up.' : 'The internal energy falls, so the gas cools. That is why air rushing out of a tire valve feels cold.'],
        hint: 'With $Q = 0$, all the work goes into internal energy.', chk: { k: k, W: Wa, ans: cmp ? Wa : -Wa } };
    }
    // tempChange: isobaric heat input to a monatomic gas, find delta T
    var n2 = R.pick([0.50, 1.0, 2.0]), Qi = R.pick([500, 831, 1000, 1500, 2000]), dT2 = Qi / (2.5 * n2 * RG);
    return { q: '$' + qx(Qi, 'J') + '$ of heat flows into $' + tg(n2) + '\\,\\text{mol}$ of neon (a monatomic ideal gas) while it expands at constant pressure. By how much does its temperature rise? Use ' + Rtxt + '.', a: ans(dT2), unit: 'K',
      steps: ['At constant pressure, $W = -P\\Delta V = -nR\\Delta T$ (from $PV = nRT$), and $\\Delta U = \\tfrac{3}{2}nR\\Delta T$.',
        'First law: $Q = \\Delta U - W = \\tfrac{3}{2}nR\\Delta T + nR\\Delta T = \\tfrac{5}{2}nR\\Delta T$.',
        '$\\Delta T = \\dfrac{Q}{\\tfrac{5}{2}nR} = \\dfrac{' + Qi + '}{2.5(' + tg(n2) + ')(' + tx(RG) + ')} = ' + qt(dT2, 'K') + '$. Only $\\tfrac{3}{5}$ of the heat stayed as internal energy.'],
      hint: 'At constant pressure a monatomic gas needs $Q = \\tfrac{5}{2}nR\\Delta T$.', chk: { k: k, n: n2, Q: Qi, ans: dT2 } };
  });

  G('phys2.thermo-cycles', function (R, ctx) {
    var k = kind(R, ctx, ['rect', 'concept', 'rect'], ['rect', 'Qnet', 'triangle', 'concept'], ['triangle', 'missingQ', 'Qnet', 'rect']);
    var Ph = R.pick([200, 250, 300, 400]), Pl = R.pick([50, 80, 100]), V1 = R.pick([1.0, 2.0]), V2 = V1 + R.pick([2.0, 3.0, 4.0]), cw = R.chance(0.7);
    var st = cw ? [[Ph, V1], [Ph, V2], [Pl, V2], [Pl, V1]] : [[Ph, V1], [Pl, V1], [Pl, V2], [Ph, V2]];
    var path = cw ? ['isobaric', 'isochoric', 'isobaric', 'isochoric'] : ['isochoric', 'isobaric', 'isochoric', 'isobaric'];
    var area = (Ph - Pl) * (V2 - V1), WbyNet = cw ? area : -area;
    var rectTxt = 'A gas goes around the rectangle A → B → C → D → A on a P–V diagram: A $(' + Ph + '\\,\\text{kPa}, ' + tg(V1) + '\\,\\text{L})$, B $(' + st[1][0] + '\\,\\text{kPa}, ' + tg(st[1][1]) + '\\,\\text{L})$, C $(' + Pl + '\\,\\text{kPa}, ' + tg(V2) + '\\,\\text{L})$, D $(' + st[3][0] + '\\,\\text{kPa}, ' + tg(st[3][1]) + '\\,\\text{L})$.';
    if (k === 'concept') {
      return { q: 'A gas is taken around a closed cycle and returns to its starting pressure, volume and temperature. Over the whole cycle, what is the change in its internal energy?',
        a: mc('Zero, because the gas is back in its starting state.', ['Equal to the net heat added.', 'Equal to the area enclosed by the cycle.', 'It depends on which way the cycle runs.']),
        viz: pv(st, path, { mode: 'cycle' }),
        steps: ['Internal energy is a property of the state: the same $P$, $V$ and $T$ means the same $U$.',
          'So around any closed cycle $\\Delta U = 0$.',
          'Then the first law gives $Q_{\\text{net}} = -W_{\\text{net}}$: the net heat in equals the net work done by the gas, the enclosed area.'],
        hint: 'Does $U$ depend on the path or only on the state?', chk: { k: k, ans: 0 } };
    }
    if (k === 'rect' || k === 'Qnet') {
      var askBy = R.coin(), isQ = k === 'Qnet', val = isQ ? WbyNet : askBy ? WbyNet : -WbyNet;
      return { q: rectTxt + ' ' + (isQ ? 'What is the net heat added to the gas in one cycle? (Negative means net heat flows out.)' : askBy ? 'What is the net work done <b>by</b> the gas in one cycle?' : 'What is the net work done <b>on</b> the gas in one cycle?'),
        a: ans(val, { rtol: 0.01 }), unit: 'J', viz: pv(st, path, { mode: 'cycle' }),
        steps: ['Only the constant-pressure legs do work. At ' + Ph + ' kPa the gas ' + (cw ? 'expands' : 'is compressed') + ' by ' + tg(V2 - V1) + ' L; at ' + Pl + ' kPa it is ' + (cw ? 'compressed' : 'expands') + ' by the same amount.',
          'Work by the gas: $' + (cw ? '+' : '-') + Ph + ' \\times ' + tg(V2 - V1) + (cw ? ' - ' : ' + ') + Pl + ' \\times ' + tg(V2 - V1) + ' = ' + sJ(WbyNet) + '$, the enclosed area $(' + Ph + ' - ' + Pl + ')\\,\\text{kPa} \\times ' + tg(V2 - V1) + '\\,\\text{L}$, ' + (cw ? 'positive because the cycle runs clockwise.' : 'negative because the cycle runs counterclockwise.'),
          isQ ? 'Around a cycle $\\Delta U = 0$, so $Q_{\\text{net}} = -W_{\\text{on}} = W_{\\text{by}} = ' + sJ(val) + '$.' : askBy ? 'Net work by the gas: $' + sJ(val) + '$.' : 'The work done on the gas is the opposite: $W_{\\text{on}} = ' + sJ(val) + '$.'],
        hint: 'The net work is the enclosed area; clockwise means the gas does positive net work.', chk: { k: k, Ph: Ph, Pl: Pl, V1: V1, V2: V2, ans: val } };
    }
    if (k === 'triangle') {
      var Pa = R.pick([100, 150]), Pb = Pa + R.pick([100, 200, 300]), Va = R.pick([1.0, 2.0]), Vb = Va + R.pick([2.0, 4.0]);
      var tri = 0.5 * (Pb - Pa) * (Vb - Va);
      // A (Pa, Va) -> B (Pa, Vb) -> C (Pb, Va)?  Use: A(Pa,Va) -> B(Pb,Va) -> C(Pa,Vb) -> A : up, then diagonal down-right, then back left: clockwise
      return { q: 'A gas goes around a triangle on a P–V diagram: from A $(' + Pa + '\\,\\text{kPa}, ' + tg(Va) + '\\,\\text{L})$ up to B $(' + Pb + '\\,\\text{kPa}, ' + tg(Va) + '\\,\\text{L})$, along a straight line to C $(' + Pa + '\\,\\text{kPa}, ' + tg(Vb) + '\\,\\text{L})$, and back to A at constant pressure. What is the net work done by the gas per cycle?', a: ans(tri, { rtol: 0.01 }), unit: 'J',
        viz: pv([[Pa, Va], [Pb, Va], [Pa, Vb]], ['isochoric', 'line', 'isobaric'], { mode: 'cycle' }),
        steps: ['The net work by the gas is the area enclosed, positive because the cycle runs clockwise (it expands at higher pressure than it is compressed).',
          'The triangle has base $' + tg(Vb - Va) + '\\,\\text{L}$ and height $' + (Pb - Pa) + '\\,\\text{kPa}$.',
          'Area $= \\tfrac{1}{2}(' + tg(Vb - Va) + '\\,\\text{L})(' + (Pb - Pa) + '\\,\\text{kPa}) = ' + qt(tri, 'J') + '$.'],
        hint: 'Find the enclosed area: one half base times height.', chk: { k: k, Pa: Pa, Pb: Pb, Va: Va, Vb: Vb, ans: tri } };
    }
    // missingQ: three legs with W_on known, heat of two legs known
    var W1 = -R.pick([300, 400, 500]), W2 = 0, W3 = R.pick([100, 150, 200]), Q1 = R.pick([700, 800, 1000, 1200]), Q2 = -R.pick([300, 400, 500]);
    var Q3 = -(W1 + W2 + W3) - Q1 - Q2;
    return { q: 'A gas runs a three-leg cycle. Work done <b>on</b> the gas: leg 1 $' + sJ(W1) + '$, leg 2 $0\\,\\text{J}$, leg 3 $' + sJ(W3) + '$. Heat added: leg 1 $' + sJ(Q1) + '$, leg 2 $' + sJ(Q2) + '$. How much heat is added on leg 3? (Negative means heat leaves.)', a: ans(Q3, { rtol: 0.005 }), unit: 'J',
      steps: ['Around a full cycle $\\Delta U = 0$, so the first law gives $\\sum Q + \\sum W = 0$.',
        '$\\sum W = ' + tn(W1, 3) + ' + 0 + ' + tn(W3, 3) + ' = ' + sJ(W1 + W3) + '$, so the heats must add to $' + sJ(-(W1 + W3)) + '$.',
        '$Q_3 = ' + tn(-(W1 + W3), 3) + ' - ' + tn(Q1, 3) + ' - (' + tn(Q2, 3) + ') = ' + sJ(Q3) + '$.'],
      hint: 'Over the whole cycle the heat and the work add to zero.', chk: { k: k, W1: W1, W3: W3, Q1: Q1, Q2: Q2, ans: Q3 } };
  });

  G('phys2.heat-engines', function (R, ctx) {
    var k = kind(R, ctx, ['eff', 'Qc', 'concept'], ['eff', 'Qc', 'work', 'power', 'concept'], ['power', 'work', 'exhaust', 'eff']);
    if (k === 'concept') {
      return { q: 'An inventor says that with perfect design and no friction, her engine will turn all the heat from its fuel into work. What is wrong with the claim?',
        a: mc('Any engine that runs in a cycle must give off some heat to a colder place.', ['Nothing: with no friction, 100% is possible.', 'Energy is destroyed inside every engine.', 'Work can never be turned back into heat.']),
        viz: { name: 'ph-pv', opts: { mode: 'engine', states: [[200, 2], [200, 5], [80, 5], [80, 2]], path: ['isobaric', 'isochoric', 'isobaric', 'isochoric'], interactive: false, quiet: true } },
        steps: ['An engine runs in a cycle. To get back to its starting state each cycle, it must dump some heat $Q_C$ into a colder reservoir.',
          'That is the second law of thermodynamics (Kelvin\'s statement): no cyclic engine can turn heat completely into work.',
          'So $W = Q_H - Q_C < Q_H$ and $e = W/Q_H < 1$, even with no friction at all. Energy is still conserved; the exhaust carries the rest.'],
        hint: 'Where does the exhaust heat $Q_C$ go, and can it be zero?', chk: { k: k, ans: 0 } };
    }
    if (k === 'eff') {
      var QH = R.pick([1000, 1200, 1500, 2000, 2500, 4000]), e = R.pick([0.15, 0.20, 0.25, 0.30, 0.35, 0.40]), W = QH * e;
      return { q: 'An engine takes in $' + qx(QH, 'J') + '$ of heat each cycle and does $' + qx(W, 'J') + '$ of work. What is its efficiency, as a percent?', a: pctAns(W / QH),
        viz: { name: 'ph-pv', opts: { mode: 'engine', states: [[200, 2], [200, 5], [80, 5], [80, 2]], path: ['isobaric', 'isochoric', 'isobaric', 'isochoric'], interactive: false, quiet: true } },
        steps: ['Efficiency is what you get (work) over what you pay for (heat in): $e = \\dfrac{W}{Q_H}$.',
          '$e = \\dfrac{' + tx(W) + '\\,\\text{J}}{' + tx(QH) + '\\,\\text{J}} = ' + tx(U.fix(W / QH)) + ' = ' + pct(W / QH) + '$.',
          'The other $' + tx(QH - W) + '\\,\\text{J}$ leaves as exhaust heat $Q_C$.'],
        hint: '$e = W/Q_H$.', chk: { k: k, QH: QH, W: W, ans: W / QH * 100 } };
    }
    if (k === 'Qc') {
      var QH2 = R.pick([800, 1000, 1500, 2000, 3000]), W2 = QH2 * R.pick([0.20, 0.25, 0.30, 0.40]), QC = QH2 - W2;
      return { q: 'An engine absorbs $' + qx(QH2, 'J') + '$ of heat from its hot reservoir and does $' + qx(W2, 'J') + '$ of work per cycle. How much heat does it give off to the cold reservoir per cycle?', a: ans(QC, { rtol: 0.005 }), unit: 'J',
        steps: ['Around a cycle $\\Delta U = 0$, so energy in = energy out: $Q_H = W + Q_C$.',
          '$Q_C = Q_H - W = ' + tx(QH2) + ' - ' + tx(W2) + ' = ' + qt(QC, 'J') + '$.'],
        hint: 'Energy is conserved: $Q_H = W + Q_C$.', chk: { k: k, QH: QH2, W: W2, ans: QC } };
    }
    if (k === 'work') {
      var e3 = R.pick([0.18, 0.22, 0.25, 0.30, 0.35, 0.45]), QH3 = R.pick([500, 1200, 2000, 5000, 8000]), W3 = e3 * QH3;
      return { q: 'An engine with an efficiency of $' + tx(e3 * 100) + '\\%$ takes in $' + qx(QH3, 'J') + '$ of heat. How much work does it do?', a: ans(W3, { rtol: 0.005 }), unit: 'J',
        steps: ['$e = W/Q_H$, so $W = eQ_H$.', '$W = (' + tx(e3) + ')(' + tx(QH3) + '\\,\\text{J}) = ' + qt(W3, 'J') + '$.',
          'The rest, $' + qt(QH3 - W3, 'J') + '$, is given off as heat.'],
        hint: 'Write the percent as a decimal and multiply.', chk: { k: k, e: e3 * 100, QH: QH3, ans: W3 } };
    }
    if (k === 'power') {
      var Pout = R.pick([30, 45, 60, 90, 120]), e4 = R.pick([0.25, 0.30, 0.40]), Pin = Pout / e4;
      return { q: 'A car engine delivers $' + qx(Pout, 'kW') + '$ of mechanical power with an efficiency of $' + tx(e4 * 100) + '\\%$. At what rate does it take in heat from burning fuel?', a: ans(Pin), unit: 'kW',
        steps: ['Efficiency works for rates too: $e = \\dfrac{P_{\\text{out}}}{P_{\\text{in}}}$ (joules per second over joules per second).',
          '$P_{\\text{in}} = \\dfrac{P_{\\text{out}}}{e} = \\dfrac{' + qx(Pout, 'kW') + '}{' + tx(e4) + '} = ' + qt(Pin, 'kW') + '$.',
          'So $' + tn(Pin - Pout, 3) + '\\,\\text{kW}$ leaves as heat through the exhaust and radiator.'],
        hint: 'Divide the output power by the efficiency.', chk: { k: k, P: Pout, e: e4 * 100, ans: Pin } };
    }
    // exhaust rate
    var Po = R.pick([20, 40, 60, 100, 500]), e5 = R.pick([0.20, 0.25, 0.33, 0.40]), Pex = Po / e5 - Po;
    return { q: 'A power plant\'s engines produce $' + qx(Po, 'MW') + '$ of work at an efficiency of $' + tx(e5 * 100) + '\\%$. At what rate do they give off waste heat?', a: ans(Pex), unit: 'MW',
      steps: ['Heat input rate: $P_H = \\dfrac{P_{\\text{out}}}{e} = \\dfrac{' + Po + '}{' + tx(e5) + '} = ' + qt(Po / e5, 'MW') + '$.',
        'Energy per second is conserved: $P_C = P_H - P_{\\text{out}} = ' + tn(Po / e5, 3) + ' - ' + Po + ' = ' + qt(Pex, 'MW') + '$.',
        'Most of the energy from the fuel ends up as waste heat.'],
      hint: 'Find the heat input rate first, then subtract the work output.', chk: { k: k, P: Po, e: e5 * 100, ans: Pex } };
  });

  G('phys2.carnot-limit', function (R, ctx) {
    var k = kind(R, ctx, ['effK', 'effC', 'effC'], ['effC', 'maxW', 'claim', 'Tc'], ['claim', 'Tc', 'TH', 'maxW']);
    if (k === 'effK') {
      var TH = R.pick([400, 500, 600, 800, 1000]), TC = R.pick([250, 300, 350]), e = 1 - TC / TH;
      return { q: 'What is the highest possible efficiency of an engine running between reservoirs at $' + TH + '\\,\\text{K}$ and $' + TC + '\\,\\text{K}$? Give a percent.', a: pctAns(e),
        steps: ['The Carnot limit: $e_{\\max} = 1 - \\dfrac{T_C}{T_H}$, with kelvin temperatures.',
          '$e_{\\max} = 1 - \\dfrac{' + TC + '}{' + TH + '} = ' + tn(e, 3) + ' = ' + pct(e) + '$.'],
        hint: 'Use $1 - T_C/T_H$.', chk: { k: k, TH: TH, TC: TC, ans: e * 100 } };
    }
    if (k === 'effC') {
      var th = R.pick([127, 227, 327, 427, 527]), tc = R.pick([17, 20, 27, 37]), e2 = 1 - TK(tc) / TK(th);
      return { q: 'An engine runs between steam at $' + cdeg(th) + '$ and cooling water at $' + cdeg(tc) + '$. What is the highest efficiency it could have? Give a percent.', a: pctAns(e2),
        steps: ['The Carnot formula needs kelvins: $T_H = ' + kel(th) + '$, $T_C = ' + kel(tc) + '$.',
          '$e_{\\max} = 1 - \\dfrac{' + TK(tc) + '}{' + TK(th) + '} = ' + tn(e2, 3) + ' = ' + pct(e2) + '$.',
          'With Celsius you would get $1 - ' + tc + '/' + th + ' = ' + pct(1 - tc / th) + '$, far too high.'],
        hint: 'Convert both temperatures to kelvins first.', chk: { k: k, tH: th, tC: tc, ans: e2 * 100 } };
    }
    if (k === 'maxW') {
      var TH3 = R.pick([500, 600, 750, 800]), TC3 = R.pick([300, 250]), QH = R.pick([1000, 2000, 3000, 4500]), Wm = QH * (1 - TC3 / TH3);
      return { q: 'An engine takes in $' + qx(QH, 'J') + '$ of heat from a reservoir at $' + TH3 + '\\,\\text{K}$ and rejects heat at $' + TC3 + '\\,\\text{K}$. What is the most work it could do with that heat?', a: ans(Wm), unit: 'J',
        steps: ['The best possible engine has the Carnot efficiency: $e = 1 - \\dfrac{' + TC3 + '}{' + TH3 + '} = ' + tn(1 - TC3 / TH3, 3) + '$.',
          '$W_{\\max} = eQ_H = (' + tn(1 - TC3 / TH3, 3) + ')(' + tx(QH) + '\\,\\text{J}) = ' + qt(Wm, 'J') + '$.',
          'At least $' + qt(QH - Wm, 'J') + '$ must leave as heat.'],
        hint: 'Find the Carnot efficiency, then multiply by $Q_H$.', chk: { k: k, QH: QH, TH: TH3, TC: TC3, ans: Wm } };
    }
    if (k === 'claim') {
      var th4 = R.pick([227, 327, 127]), tc4 = R.pick([27, 7]), emax = 1 - TK(tc4) / TK(th4), ecel = 1 - tc4 / th4, ok = R.coin();
      var Lk = Math.round(emax * 100), Lc = Math.round(ecel * 100);
      var claim = ok ? Math.floor(emax * 100 / 5) * 5 - 5 : Math.min(Math.ceil(emax * 100 / 5) * 5 + 5, Math.floor(ecel * 100 / 5) * 5 - 5);
      var right = 'The limit is about ' + Lk + '%, so the claim is ' + (ok ? 'possible.' : 'impossible.');
      var wrongs = ['The limit is about ' + Lk + '%, so the claim is ' + (ok ? 'impossible.' : 'possible.'), 'The limit is about ' + Lc + '%, so the claim is possible.', 'The limit is about ' + Lc + '%, so the claim is impossible.'];
      return { q: 'A company claims its engine reaches $' + claim + '\\%$ efficiency running between $' + cdeg(th4) + '$ and $' + cdeg(tc4) + '$. What is the Carnot limit, and is the claim possible?',
        a: mc(right, wrongs),
        steps: ['Kelvins: $T_H = ' + kel(th4) + '$, $T_C = ' + kel(tc4) + '$.',
          'Carnot limit: $1 - \\dfrac{' + TK(tc4) + '}{' + TK(th4) + '} = ' + pct(emax) + '$. (Celsius would wrongly give $1 - ' + tc4 + '/' + th4 + ' = ' + pct(ecel) + '$.)',
          ok ? 'The claimed $' + claim + '\\%$ is below the limit, so the second law allows it.' : 'The claimed $' + claim + '\\%$ beats the best possible engine, so the claim breaks the second law.'],
        hint: 'Compute the Carnot limit with kelvins and compare.', chk: { k: k, ok: ok ? 1 : 0, emax: emax, claim: claim, ans: 0 } };
    }
    if (k === 'Tc') {
      var TH5 = R.pick([500, 600, 800, 1000]), e5 = R.pick([0.40, 0.50, 0.60, 0.25]), Tc5 = TH5 * (1 - e5);
      return { q: 'A Carnot engine takes in heat at $' + TH5 + '\\,\\text{K}$. What must the temperature of its cold reservoir be for an efficiency of $' + tx(e5 * 100) + '\\%$? Answer in kelvins.', a: ans(Tc5, { rtol: 0.01 }), unit: 'K',
        steps: ['$e = 1 - \\dfrac{T_C}{T_H}$, so $T_C = T_H(1 - e)$.', '$T_C = (' + TH5 + '\\,\\text{K})(1 - ' + tx(e5) + ') = ' + qt(Tc5, 'K') + '$.'],
        hint: 'Solve $e = 1 - T_C/T_H$ for $T_C$.', chk: { k: k, TH: TH5, e: e5 * 100, ans: Tc5 } };
    }
    // TH in Celsius for a target efficiency with cold side in Celsius
    var tc6 = R.pick([27, 7, 17]), e6 = R.pick([0.25, 0.40, 0.50, 0.60]), TH6 = TK(tc6) / (1 - e6), C6 = TH6 - 273;
    return { q: 'A Carnot engine gives off heat at $' + cdeg(tc6) + '$. How hot, in degrees Celsius, must its hot reservoir be for an efficiency of $' + tx(e6 * 100) + '\\%$?', a: ans(C6, { rtol: 0.01 }), unit: '°C',
      steps: ['$T_C = ' + kel(tc6) + '$.', '$e = 1 - \\dfrac{T_C}{T_H}$, so $T_H = \\dfrac{T_C}{1 - e} = \\dfrac{' + TK(tc6) + '}{' + tx(1 - e6) + '} = ' + qt(TH6, 'K') + '$.',
        'In Celsius: $' + tn(TH6, 3) + ' - 273 = ' + tn(C6, 3) + '\\,^\\circ\\text{C}$.'],
      hint: 'Work in kelvins, then convert back at the end.', chk: { k: k, tC: tc6, e: e6 * 100, ans: C6 } };
  });

  G('phys2.refrigerators', function (R, ctx) {
    var k = kind(R, ctx, ['copF', 'Qh', 'concept'], ['copF', 'hpW', 'hpOutside', 'Qh', 'concept'], ['carnotCOP', 'hpOutside', 'hpW', 'copF']);
    if (k === 'concept') {
      var c = R.pick([3, 4]);
      return { q: 'A heat pump delivers ' + c + ' J of heat into a house for every 1 J of electrical work it uses. Does this break conservation of energy?',
        a: mc('No: it moves ' + (c - 1) + ' J of heat in from outside and adds the 1 J of work.', ['Yes: it makes ' + (c - 1) + ' J of energy from nothing.', 'No: the extra comes from the heat pump slowly using up its own internal energy.', 'Yes, but the second law allows it.']),
        viz: { name: 'ph-pv', opts: { mode: 'fridge', states: [[200, 2], [200, 5], [80, 5], [80, 2]], path: ['isobaric', 'isochoric', 'isobaric', 'isochoric'], interactive: false, quiet: true } },
        steps: ['Energy in = energy out: $Q_H = Q_C + W$.',
          'With $Q_H = ' + c + '\\,\\text{J}$ and $W = 1\\,\\text{J}$, the heat drawn from the cold outside air is $Q_C = ' + (c - 1) + '\\,\\text{J}$.',
          'A heat pump does not make heat; it moves heat uphill, from cold to hot, and the work is the price. Energy is conserved.'],
        hint: 'Write the energy balance $Q_H = Q_C + W$.', chk: { k: k, ans: 0 } };
    }
    if (k === 'copF') {
      var W = R.pick([100, 150, 200, 250]), cop = R.pick([2, 2.5, 3, 4, 5]), QC = W * cop;
      return { q: 'Each cycle, a refrigerator removes $' + qx(QC, 'J') + '$ of heat from its inside using $' + qx(W, 'J') + '$ of electrical work. What is its coefficient of performance?', a: ans(QC / W, { rtol: 0.01 }),
        steps: ['For a refrigerator, what you want is the heat removed from the cold side: $\\text{COP} = \\dfrac{Q_C}{W}$.',
          '$\\text{COP} = \\dfrac{' + tx(QC) + '}{' + tx(W) + '} = ' + tx(cop) + '$.',
          'A COP above 1 is normal: it moves more heat than the work it uses.'],
        hint: 'COP of a refrigerator $= Q_C/W$.', chk: { k: k, QC: QC, W: W, ans: QC / W } };
    }
    if (k === 'Qh') {
      var QC2 = R.pick([300, 450, 600, 900, 1200]), W2 = R.pick([100, 150, 200, 300]), QH2 = QC2 + W2;
      return { q: 'A refrigerator removes $' + qx(QC2, 'J') + '$ of heat from the food compartment while using $' + qx(W2, 'J') + '$ of work. How much heat does it release into the kitchen?', a: ans(QH2, { rtol: 0.005 }), unit: 'J',
        steps: ['Over a cycle $\\Delta U = 0$, so all the energy that goes in comes out: $Q_H = Q_C + W$.',
          '$Q_H = ' + QC2 + ' + ' + W2 + ' = ' + qt(QH2, 'J') + '$.',
          'That is why the coils on the back of a refrigerator feel warm.'],
        hint: 'Both the removed heat and the work end up in the kitchen.', chk: { k: k, QC: QC2, W: W2, ans: QH2 } };
    }
    if (k === 'hpW') {
      var QH3 = R.pick([6.0, 8.0, 9.0, 12, 15]), cop3 = R.pick([2.5, 3.0, 4.0]), W3 = QH3 / cop3;
      return { q: 'A heat pump with a coefficient of performance (heating) of $' + tx(cop3) + '$ delivers $' + qx(QH3, 'kW') + '$ of heat to a house. How much electrical power does it use?', a: ans(W3), unit: 'kW',
        steps: ['For a heat pump, what you want is the heat delivered: $\\text{COP}_{\\text{heat}} = \\dfrac{Q_H}{W}$ (or, per second, heat rate over power).',
          '$W = \\dfrac{Q_H}{\\text{COP}} = \\dfrac{' + qx(QH3, 'kW') + '}{' + tx(cop3) + '} = ' + qt(W3, 'kW') + '$.'],
        hint: 'Divide the heat delivered by the COP.', chk: { k: k, QH: QH3, cop: cop3, ans: W3 } };
    }
    if (k === 'hpOutside') {
      var Wp = R.pick([1.5, 2.0, 2.5, 3.0]), cop4 = R.pick([3.0, 3.5, 4.0]), QHp = Wp * cop4, QCp = QHp - Wp;
      return { q: 'A heat pump uses $' + qx(Wp, 'kW') + '$ of electrical power and has a heating COP of $' + tx(cop4) + '$. At what rate does it draw heat from the cold outdoor air?', a: ans(QCp), unit: 'kW',
        steps: ['Heat delivered: $Q_H = \\text{COP} \\times W = ' + tx(cop4) + ' \\times ' + qx(Wp, 'kW') + ' = ' + qt(QHp, 'kW') + '$.',
          'Energy balance: $Q_C = Q_H - W = ' + tn(QHp, 3) + ' - ' + tg(Wp) + ' = ' + qt(QCp, 'kW') + '$.'],
        hint: 'Find the heat delivered, then subtract the work.', chk: { k: k, W: Wp, cop: cop4, ans: QCp } };
    }
    // carnot COP of a heat pump
    var tin = R.pick([20, 22, 25]), tout = R.pick([-10, -5, 0, 5]), copC = TK(tin) / (tin - tout);
    return { q: 'What is the highest possible heating COP for a heat pump that keeps a house at $' + cdeg(tin) + '$ when it is $' + cdeg(tout) + '$ outside?', a: ans(copC),
      steps: ['For an ideal (Carnot) heat pump, $\\dfrac{Q_C}{Q_H} = \\dfrac{T_C}{T_H}$, so $\\text{COP}_{\\max} = \\dfrac{Q_H}{Q_H - Q_C} = \\dfrac{T_H}{T_H - T_C}$, with kelvins.',
        '$T_H = ' + kel(tin) + '$; the difference $T_H - T_C = ' + tin + ' - (' + tout + ') = ' + (tin - tout) + '\\,\\text{K}$ (a difference is the same in kelvins and Celsius degrees).',
        '$\\text{COP}_{\\max} = \\dfrac{' + TK(tin) + '}{' + (tin - tout) + '} = ' + tn(copC, 3) + '$. Real heat pumps fall well below this limit.'],
      hint: 'Use $T_H/(T_H - T_C)$ with $T_H$ in kelvins.', chk: { k: k, tH: tin, tC: tout, ans: copC } };
  });

  G('phys2.entropy', function (R, ctx) {
    var k = kind(R, ctx, ['reservoir', 'flow', 'concept'], ['flow', 'phase', 'reservoir', 'concept'], ['flow', 'carnotQc', 'phase', 'concept']);
    if (k === 'concept') {
      var v = R.pick(['fridge', 'cold2hot', 'ice']);
      if (v === 'fridge') return { q: 'A refrigerator cools the food inside it, so the entropy of the food goes down. Does this break the second law of thermodynamics?',
        a: mc('No: the kitchen gains more entropy than the food loses.', ['Yes: entropy can never go down anywhere.', 'No: the second law does not apply to machines.', 'Yes, but only by a tiny amount.']),
        viz: { name: 'ph-thermal', opts: { mode: 'entropy', Th: 300, Tc: 270, Q: 1000, interactive: false } },
        steps: ['The second law is about the total entropy of an isolated system: it never decreases.',
          'The food loses entropy $Q_C/T_C$, but the refrigerator dumps $Q_H = Q_C + W$ into the warmer kitchen, which gains $Q_H/T_H$.',
          'For any real refrigerator $Q_H/T_H > Q_C/T_C$, so the total entropy still rises. One part can go down as long as the total goes up.'],
        hint: 'The second law is about the total.', chk: { k: k, v: v, ans: 0 } };
      if (v === 'cold2hot') return { q: 'Which of these could happen on its own, with nothing else changing?',
        a: mc('Heat flows from a hot cup of coffee into the cooler room.', ['Heat flows from a cool room into a hot cup of coffee, making it hotter.', 'A lukewarm drink separates into a hot top half and a cold bottom half.', 'Heat flows from an ice cube into the warm water around it.']),
        steps: ['On its own, heat flows from hot to cold. Check with entropy: $Q$ leaving the hot object lowers its entropy by $Q/T_H$; the cold one gains $Q/T_C$, which is larger since $T_C < T_H$.',
          'Total $\\Delta S = Q/T_C - Q/T_H > 0$ for hot-to-cold flow: allowed.',
          'Each of the other changes moves heat from cold to hot, which would make the total entropy decrease, so it never happens by itself.'],
        hint: 'Which way does heat flow without help?', chk: { k: k, v: v, ans: 0 } };
      return { q: 'A block of ice at $0\\,^\\circ\\text{C}$ melts in a room at $20\\,^\\circ\\text{C}$. What happens to the total entropy of the ice and the room?',
        a: mc('It increases.', ['It decreases, because the room loses heat.', 'It stays the same, because energy is conserved.', 'It decreases, because liquid water is more orderly than ice.']),
        steps: ['The ice gains heat $Q$ at $273\\,\\text{K}$: $\\Delta S_{\\text{ice}} = +Q/273$.',
          'The room loses the same $Q$ at $293\\,\\text{K}$: $\\Delta S_{\\text{room}} = -Q/293$.',
          'Since $1/273 > 1/293$, the total change is positive. Heat flowing from hot to cold always raises the total entropy.'],
        hint: 'Compare $Q/T$ for the colder ice and the warmer room.', chk: { k: k, v: v, ans: 0 } };
    }
    if (k === 'reservoir') {
      var Q = R.pick([500, 600, 1000, 1200, 1500, 3000]), T = R.pick([250, 300, 400, 500, 600]), into = R.coin(), dS = (into ? 1 : -1) * Q / T;
      return { q: 'A large reservoir at $' + T + '\\,\\text{K}$ ' + (into ? 'absorbs' : 'gives off') + ' $' + qx(Q, 'J') + '$ of heat while its temperature stays the same. What is its change in entropy? (Negative means a decrease.)', a: ans(dS, { rtol: 0.01 }), unit: 'J/K',
        steps: ['At constant temperature, $\\Delta S = \\dfrac{Q}{T}$, with $Q$ positive for heat in and $T$ in kelvins.',
          '$\\Delta S = \\dfrac{' + (into ? '' : '-') + tx(Q) + '\\,\\text{J}}{' + T + '\\,\\text{K}} = ' + qt(dS, 'J/K') + '$.'],
        hint: '$\\Delta S = Q/T$; heat leaving makes $Q$ negative.', chk: { k: k, Q: Q, T: T, ans: dS } };
    }
    if (k === 'flow') {
      var Q2 = R.pick([600, 1200, 1800, 2400, 3000]), Th = R.pick([400, 500, 600, 800]), Tc = R.pick([200, 250, 300]), dSt = Q2 / Tc - Q2 / Th;
      return { q: '$' + qx(Q2, 'J') + '$ of heat flows on its own from a reservoir at $' + Th + '\\,\\text{K}$ to one at $' + Tc + '\\,\\text{K}$. What is the total change in entropy?', a: ans(dSt), unit: 'J/K',
        viz: { name: 'ph-thermal', opts: { mode: 'entropy', Th: Th, Tc: Tc, Q: Q2, interactive: false, quiet: true } },
        steps: ['Hot reservoir: $\\Delta S_H = -\\dfrac{' + Q2 + '}{' + Th + '} = ' + qt(-Q2 / Th, 'J/K') + '$.',
          'Cold reservoir: $\\Delta S_C = +\\dfrac{' + Q2 + '}{' + Tc + '} = ' + qt(Q2 / Tc, 'J/K') + '$.',
          'Total: $\\Delta S = ' + tn(Q2 / Tc, 3) + ' - ' + tn(Q2 / Th, 3) + ' = ' + qt(dSt, 'J/K') + '$, positive, as the second law requires.'],
        hint: 'Add $-Q/T_H$ and $+Q/T_C$.', chk: { k: k, Q: Q2, Th: Th, Tc: Tc, ans: dSt } };
    }
    if (k === 'phase') {
      var boil = R.coin(), m = R.pick([0.10, 0.20, 0.25, 0.50, 1.0]), L = boil ? LV : LF, Tp = boil ? 373 : 273, dS2 = m * L / Tp;
      return { q: 'What is the entropy change of $' + qx(m, 'kg') + '$ of ' + (boil ? 'water as it boils into steam at $100\\,^\\circ\\text{C}$' : 'ice as it melts at $0\\,^\\circ\\text{C}$') + '? Use ' + (boil ? '$L_v = 2.26 \\times 10^{6}\\,\\text{J/kg}$' : '$L_f = 3.34 \\times 10^{5}\\,\\text{J/kg}$') + '.', a: ans(dS2), unit: 'J/K',
        steps: ['The ' + (boil ? 'boiling' : 'melting') + ' happens at a constant temperature, $T = ' + Tp + '\\,\\text{K}$, so $\\Delta S = Q/T$.',
          'Heat: $Q = mL = (' + tg(m) + ')(' + (boil ? '2.26 \\times 10^{6}' : '3.34 \\times 10^{5}') + ') = ' + qt(m * L, 'J') + '$.',
          '$\\Delta S = \\dfrac{' + tn(m * L, 3) + '\\,\\text{J}}{' + Tp + '\\,\\text{K}} = ' + qt(dS2, 'J/K') + '$. The molecules gain many more ways to arrange themselves.'],
        hint: 'Find $Q = mL$, then divide by the kelvin temperature.', chk: { k: k, m: m, b: boil ? 1 : 0, ans: dS2 } };
    }
    // carnotQc: a reversible engine leaves total entropy unchanged
    var QH = R.pick([1000, 1500, 2000, 3000]), TH = R.pick([500, 600, 800]), TC = R.pick([300, 200]), Qc = QH * TC / TH;
    return { q: 'A reversible (Carnot) engine takes $' + qx(QH, 'J') + '$ of heat from a reservoir at $' + TH + '\\,\\text{K}$ and gives off heat to a reservoir at $' + TC + '\\,\\text{K}$. The total entropy of the reservoirs does not change. How much heat does it give off each cycle?', a: ans(Qc, { rtol: 0.01 }), unit: 'J',
      steps: ['The engine itself returns to its starting state, so its entropy does not change. Total $\\Delta S = 0$ means $-\\dfrac{Q_H}{T_H} + \\dfrac{Q_C}{T_C} = 0$.',
        '$Q_C = Q_H \\dfrac{T_C}{T_H} = (' + tx(QH) + '\\,\\text{J})\\dfrac{' + TC + '}{' + TH + '} = ' + qt(Qc, 'J') + '$.',
        'Any real engine gives off more than this, which is why no engine beats the Carnot efficiency $1 - T_C/T_H$.'],
      hint: 'Set the entropy lost by the hot reservoir equal to the entropy gained by the cold one.', chk: { k: k, QH: QH, TH: TH, TC: TC, ans: Qc } };
  });

  // ================================================================ UNIT 3: ELECTRIC FORCE, FIELD AND POTENTIAL
  var ktxt = '$k = 8.99 \\times 10^{9}\\,' + UT['Nm2/C2'] + '$';
  var etxt = '$e = 1.60 \\times 10^{-19}\\,\\text{C}$';
  function qs(q, u) { return (q > 0 ? '+' : '') + tg(q) + '\\,' + (u === 'nC' ? '\\text{nC}' : '\\mu\\text{C}'); } // signed charge
  function ef(charges, o) { var op = { mode: 'points', charges: charges, interactive: false, quiet: true }; if (o) for (var z in o) op[z] = o[z]; return { name: 'ph-efield', opts: op }; }
  function dirX(v) { return v > 0 ? 'in the $+x$ direction (to the right)' : 'in the $-x$ direction (to the left)'; }

  G('phys2.charge-conservation', function (R, ctx) {
    var k = kind(R, ctx, ['count', 'charge', 'share', 'neutral'], ['count', 'share', 'induction', 'quantized', 'charge'], ['three', 'induction', 'quantized', 'count']);
    if (k === 'neutral') {
      return { q: 'A rubbed balloon carries a negative charge. Why can it pick up small bits of neutral paper?',
        a: mc('The paper\'s charges shift, so its near side becomes slightly positive and is pulled harder than the far side is pushed.', ['Neutral paper has no charges, so it must have picked up charge from the air first.', 'The balloon\'s electrons jump into the paper before it moves, making it negative.', 'Neutral objects are attracted by any charge because opposite charges always outnumber like ones.']),
        viz: { name: 'ph-efield', opts: { mode: 'polarize', interactive: false } },
        steps: ['A neutral object is not empty of charge: it holds equal amounts of positive and negative charge.',
          'The negative balloon pushes the paper\'s electrons slightly away, so the near side is a little positive and the far side a little negative (the paper is polarized).',
          'The near, positive side is closer to the balloon, and Coulomb\'s force grows quickly as distance shrinks, so the pull beats the push. Net result: attraction.'],
        hint: 'Neutral means equal positive and negative charge, not no charge.', chk: { k: k, ans: 0 } };
    }
    if (k === 'count') {
      var n = R.pick([2.5, 5.0, 7.5, 10, 12.5, 20, 25, 50]) * 1e10, neg = R.coin(), q = (neg ? -1 : 1) * n * QE, qn = q * 1e9;
      return { q: 'A plastic rod has a charge of $' + (qn > 0 ? '+' : '') + tn(qn, 2) + '\\,\\text{nC}$. How many electrons has it ' + (neg ? 'gained' : 'lost') + '? Use ' + etxt + '.', a: ans(n), unit: 'electrons',
        steps: ['Charge comes in whole multiples of $e$: $|q| = Ne$, so $N = |q|/e$.',
          '$|q| = ' + tn(abs(qn), 2) + '\\,\\text{nC} = ' + tn(abs(q), 2) + '\\,\\text{C}$.',
          '$N = \\dfrac{' + tn(abs(q), 2) + '\\,\\text{C}}{1.60 \\times 10^{-19}\\,\\text{C}} = ' + tn(n, 3) + '$ electrons ' + (neg ? 'gained (extra electrons make it negative)' : 'lost (missing electrons leave it positive)') + '.'],
        hint: 'Divide the size of the charge by the charge of one electron.', chk: { k: k, q: qn, ans: n } };
    }
    if (k === 'charge') {
      var N = R.pick([1.5, 2.0, 3.0, 4.0, 5.0, 6.0]) * Math.pow(10, R.pick([10, 11, 12])), gain = R.coin(), qq = (gain ? -1 : 1) * N * QE;
      return { q: 'A wool sweater ' + (gain ? 'gains' : 'loses') + ' $' + tn(N, 2) + '$ electrons. What is its charge, in coulombs? (Give the sign.) Use ' + etxt + '.', a: ans(qq), unit: 'C',
        steps: ['Each electron carries $-e = -1.60 \\times 10^{-19}\\,\\text{C}$.',
          (gain ? 'Gaining electrons adds negative charge' : 'Losing electrons leaves an excess of positive charge') + ': $q = ' + (gain ? '-' : '+') + 'Ne$.',
          '$q = ' + (gain ? '-' : '') + '(' + tn(N, 2) + ')(1.60 \\times 10^{-19}\\,\\text{C}) = ' + qt(qq, 'C') + '$.'],
        hint: 'Multiply the number of electrons by $e$, then decide the sign.', chk: { k: k, N: N, ans: qq } };
    }
    if (k === 'share') {
      var q1 = R.pick([-6, -4, 2, 4, 6, 8, 10, 12]), q2 = R.pick([-10, -8, -6, -2, 0, 2, 4]);
      if ((q1 + q2) % 2) q2 += 1; if (q1 === q2) q2 -= 2;
      var fin = (q1 + q2) / 2;
      return { q: 'Two identical metal spheres carry charges of $' + qs(q1, 'nC') + '$ and $' + qs(q2, 'nC') + '$. They touch and are then pulled apart. What is the charge on each sphere now?', a: exact(fin), unit: 'nC',
        steps: ['Charge is conserved: the total stays $' + tx(q1) + ' + ' + (q2 < 0 ? '(' + tx(q2) + ')' : tx(q2)) + ' = ' + tx(q1 + q2) + '\\,\\text{nC}$.',
          'While they touch, the two identical conductors form one conductor, and by symmetry the charge splits equally.',
          'Each sphere: $' + tx(q1 + q2) + '/2 = ' + tx(fin) + '\\,\\text{nC}$.'],
        hint: 'Add the charges, then share them equally.', chk: { k: k, q1: q1, q2: q2, ans: fin } };
    }
    if (k === 'three') {
      var a = R.pick([8, 12, 16, -16]), b = 0, c = R.pick([-4, 4, 0, 2]);
      var ab = (a + b) / 2, ac = (ab + c) / 2;
      return { q: 'Three identical metal spheres A, B and C carry $' + qs(a, 'nC') + '$, $0\\,\\text{nC}$ and $' + qs(c, 'nC') + '$. Sphere A touches B and is pulled away; then A touches C and is pulled away. What is the final charge on A?', a: exact(ac), unit: 'nC',
        steps: ['A touches B: they share $' + tx(a) + ' + 0 = ' + tx(a) + '\\,\\text{nC}$ equally, so A has $' + tx(ab) + '\\,\\text{nC}$.',
          'A touches C: they share $' + tx(ab) + ' + ' + (c < 0 ? '(' + tx(c) + ')' : tx(c)) + ' = ' + tx(ab + c) + '\\,\\text{nC}$, so A has $' + tx(ac) + '\\,\\text{nC}$.',
          'Check conservation: $A + B + C = ' + [ac, ab, ac].map(function (x, i) { return i && x < 0 ? '(' + tx(x) + ')' : tx(x); }).join(' + ') + ' = ' + tx(a + b + c) + '\\,\\text{nC}$, the starting total.'],
        hint: 'Share equally at each touch, one touch at a time.', chk: { k: k, a: a, c: c, ans: ac } };
    }
    if (k === 'induction') {
      var rodNeg = R.coin();
      return { q: 'A ' + (rodNeg ? 'negatively' : 'positively') + ' charged rod is held near, but not touching, a neutral metal sphere on an insulating stand. While the rod is there, you touch the far side of the sphere with a grounded wire, then remove the wire, then take the rod away. What charge is left on the sphere?',
        a: mc(rodNeg ? 'Positive' : 'Negative', [rodNeg ? 'Negative' : 'Positive', 'None: it never touched the rod', 'It depends on how long the wire was touching']),
        viz: { name: 'ph-efield', opts: { mode: 'polarize', interactive: false } },
        steps: ['The rod pushes like charges to the far side of the sphere.', rodNeg ? 'The grounded wire lets those electrons escape to the ground.' : 'Through the grounded wire, electrons flow up from the ground, attracted by the positive rod.',
          'Removing the wire first traps the change; then the rod leaves. The sphere keeps a charge opposite to the rod\'s: ' + (rodNeg ? 'positive' : 'negative') + '. This is charging by induction.'],
        hint: 'Which charges does the rod push toward the ground connection?', chk: { k: k, v: rodNeg ? 'Positive' : 'Negative', ans: 0 } };
    }
    // quantized
    var m = R.pick([2, 3, 4, 5, 6]), good = m * 1.6, bads = [(m + 0.5) * 1.6, m * 1.6 - 0.4, m + 0.5].map(function (x) { return U.fix(x); });
    function sc(x) { return '$' + tn(x * 1e-19, 3) + '\\,\\text{C}$'; }
    return { q: 'Which of these could be the net charge on a small oil drop? ' + etxt,
      a: mc(sc(good), bads.map(sc)),
      steps: ['Charge is quantized: any net charge is a whole number times $e = 1.60 \\times 10^{-19}\\,\\text{C}$.',
        '$' + tn(good * 1e-19, 3) + '\\,\\text{C} = ' + m + 'e$, a whole number of electrons\' worth.',
        'The others give fractions of $e$, so no object could have them.'],
      hint: 'Divide each by $1.60 \\times 10^{-19}\\,\\text{C}$.', chk: { k: k, m: m, ans: 0 } };
  });

  G('phys2.coulombs-law', function (R, ctx) {
    var k = kind(R, ctx, ['force', 'scale', 'third'], ['force', 'scale', 'distance', 'third'], ['charge', 'distance', 'hydrogen', 'scale']);
    if (k === 'third') {
      var a = R.pick([1, 2, 3]), b = a * R.pick([3, 4, 5]);
      return { q: 'A $+' + tg(a) + '\\,\\mu\\text{C}$ charge and a $+' + tg(b) + '\\,\\mu\\text{C}$ charge sit $10\\,\\text{cm}$ apart. How does the force on the small charge compare with the force on the large one?',
        a: mc('They are equal in size and opposite in direction.', ['The small charge feels ' + (b / a) + ' times the force.', 'The large charge feels ' + (b / a) + ' times the force.', 'The large charge feels no force from the small one.']),
        viz: ef([{ q: a, x: -0.05, y: 0 }, { q: b, x: 0.05, y: 0 }], { qUnit: 'μC', view: 0.15, show: ['lines'] }),
        steps: ['Coulomb\'s law gives one number for the pair: $F = k\\dfrac{|q_1 q_2|}{r^2}$. Both charges appear in it the same way.',
          'Newton\'s third law: the force on each charge is equal in size and opposite in direction.',
          'The small charge is pushed by a big charge, and the big charge by a small one; the products are the same.'],
        hint: 'Does $k|q_1q_2|/r^2$ change if you swap the labels?', chk: { k: k, ans: 0 } };
    }
    if (k === 'force') {
      var q1 = R.pick([1, 2, 3, 4, 5, 6]) * R.sign(), q2 = R.pick([1, 2, 3, 4, 5, 8]) * R.sign(), rc = R.pick([10, 15, 20, 25, 30, 50]), r = rc / 100, F = K_E * abs(q1 * q2) * 1e-12 / (r * r);
      return { q: 'Charges of $' + qs(q1) + '$ and $' + qs(q2) + '$ are $' + qx(rc, 'cm') + '$ apart. What is the size of the force between them? Is it attractive or repulsive? (Enter the size.) Use ' + ktxt + '.', a: ans(F), unit: 'N',
        viz: ef([{ q: q1, x: -r / 2, y: 0 }, { q: q2, x: r / 2, y: 0 }], { qUnit: 'μC', view: Math.max(0.15, r * 0.8), show: ['lines'] }),
        steps: ['SI units: $q_1 = ' + tx(q1) + ' \\times 10^{-6}\\,\\text{C}$, $q_2 = ' + tx(q2) + ' \\times 10^{-6}\\,\\text{C}$, $r = ' + tg(r) + '\\,\\text{m}$.',
          '$F = k\\dfrac{|q_1 q_2|}{r^2} = (8.99 \\times 10^{9})\\dfrac{(' + abs(q1) + ' \\times 10^{-6})(' + abs(q2) + ' \\times 10^{-6})}{(' + tg(r) + ')^2} = ' + qt(F, 'N') + '$.',
          (q1 * q2 > 0 ? 'Like signs: the force is repulsive.' : 'Opposite signs: the force is attractive.')],
        hint: 'Convert microcoulombs to coulombs and centimeters to meters first.', chk: { k: k, q1: q1, q2: q2, r: rc, ans: F } };
    }
    if (k === 'scale') {
      var F0 = R.pick([2.0, 4.0, 6.0, 8.0, 12, 18]), fr = R.pick([2, 3, 0.5]), fq = R.pick([1, 2, 3]), F1 = F0 * fq / (fr * fr);
      var what = (fq !== 1 ? 'one charge is made ' + (fq === 2 ? 'twice' : 'three times') + ' as large and ' : '') + 'the distance is ' + (fr === 2 ? 'doubled' : fr === 3 ? 'tripled' : 'halved');
      return { q: 'Two charges pull on each other with a force of $' + qx(F0, 'N') + '$. If ' + what + ', what is the new force?', a: ans(F1), unit: 'N',
        steps: ['$F = k\\dfrac{|q_1 q_2|}{r^2}$: the force is proportional to each charge and to $1/r^2$.',
          (fq !== 1 ? 'The charge factor multiplies $F$ by $' + fq + '$. ' : '') + 'The distance factor $' + tx(fr) + '$ divides it by $' + tx(fr) + '^2 = ' + tx(fr * fr) + '$.',
          '$F = ' + qx(F0, 'N') + ' \\times \\dfrac{' + fq + '}{' + tx(fr * fr) + '} = ' + qt(F1, 'N') + '$.'],
        hint: 'Inverse square: doubling the distance quarters the force.', chk: { k: k, F0: F0, fq: fq, fr: fr, ans: F1 } };
    }
    if (k === 'distance') {
      var a1 = R.pick([2, 3, 4, 5]), a2 = R.pick([2, 4, 5, 6]), Ft = R.pick([0.50, 0.90, 1.2, 2.0, 3.6, 5.0]), rr = sqrt(K_E * a1 * a2 * 1e-12 / Ft);
      return { q: 'Two charges, $+' + tg(a1) + '\\,\\mu\\text{C}$ and $-' + tg(a2) + '\\,\\mu\\text{C}$, attract each other with a force of $' + qx(Ft, 'N') + '$. How far apart are they? Use ' + ktxt + '.', a: ans(rr), unit: 'm',
        steps: ['Solve $F = k\\dfrac{|q_1q_2|}{r^2}$ for $r$: $r = \\sqrt{\\dfrac{k|q_1q_2|}{F}}$.',
          '$r = \\sqrt{\\dfrac{(8.99 \\times 10^{9})(' + a1 + ' \\times 10^{-6})(' + a2 + ' \\times 10^{-6})}{' + tg(Ft) + '}} = \\sqrt{' + tn(rr * rr, 3) + '}\\,\\text{m} = ' + qt(rr, 'm') + '$.'],
        hint: 'Rearrange for $r^2$ first, then take the square root.', chk: { k: k, q1: a1, q2: a2, F: Ft, ans: rr } };
    }
    if (k === 'charge') {
      var b1 = R.pick([2, 4, 5]), rcm = R.pick([20, 30, 40]), qb = R.pick([1.5, 2.0, 3.0, 6.0]), Fb = rd(K_E * b1 * qb * 1e-12 / Math.pow(rcm / 100, 2), 3), qx2 = Fb * Math.pow(rcm / 100, 2) / (K_E * b1 * 1e-6) * 1e6;
      return { q: 'A $+' + tg(b1) + '\\,\\mu\\text{C}$ charge and an unknown charge $' + qx(rcm, 'cm') + '$ away repel each other with a force of $' + qt(Fb, 'N') + '$. What is the unknown charge, in microcoulombs? Use ' + ktxt + '.', a: ans(qx2), unit: 'μC',
        steps: ['They repel, so the unknown charge is positive too.', '$q_2 = \\dfrac{Fr^2}{kq_1} = \\dfrac{(' + qt(Fb, 'N') + ')(' + tg(rcm / 100) + '\\,\\text{m})^2}{(8.99 \\times 10^{9})(' + b1 + ' \\times 10^{-6}\\,\\text{C})} = ' + qt(qx2 * 1e-6, 'C') + '$.',
          'That is $' + tn(qx2, 3) + '\\,\\mu\\text{C}$.'],
        hint: 'Solve Coulomb\'s law for $q_2$.', chk: { k: k, q1: b1, r: rcm, F: Fb, ans: qx2 } };
    }
    // hydrogen
    var rH = 5.29e-11, FH = K_E * QE * QE / (rH * rH);
    return { q: 'In a hydrogen atom, the electron and the proton are about $5.29 \\times 10^{-11}\\,\\text{m}$ apart. What is the size of the electric force between them? Use ' + ktxt + ' and ' + etxt + '.', a: ans(FH), unit: 'N',
      steps: ['Both particles carry a charge of size $e$.', '$F = \\dfrac{ke^2}{r^2} = \\dfrac{(8.99 \\times 10^{9})(1.60 \\times 10^{-19})^2}{(5.29 \\times 10^{-11})^2} = ' + qt(FH, 'N') + '$.',
        'Tiny in everyday terms, but enormous for a particle as light as an electron: it is about $10^{39}$ times the gravitational pull between them.'],
      hint: 'Use $q_1 = q_2 = e$ in Coulomb\'s law.', chk: { k: k, ans: FH } };
  });

  G('phys2.coulomb-superposition', function (R, ctx) {
    var k = kind(R, ctx, ['line', 'perp', 'line'], ['line', 'end', 'right', 'perp'], ['end', 'right', 'zero', 'line']);
    if (k === 'perp') {
      var a = R.pick([3, 5, 6, 8, 9, 12]), b = R.pick([4, 12, 8, 6, 12, 16]), m = sqrt(a * a + b * b);
      return { q: 'A charge feels a $' + qx(a, 'N') + '$ electric force pointing east from one charge and a $' + qx(b, 'N') + '$ force pointing north from another. What is the size of the net force?', a: ans(m), unit: 'N',
        viz: { name: 'ph-vectors', opts: { mode: 'add', vecs: [{ x: a, y: 0, label: 'F₁' }, { x: 0, y: b, label: 'F₂' }], interactive: false, quiet: true } },
        steps: ['Forces are vectors; at right angles, their sizes do not simply add.', 'Put them head to tail: they form a right triangle, so $F_{\\text{net}} = \\sqrt{F_1^2 + F_2^2}$.',
          '$F_{\\text{net}} = \\sqrt{' + a + '^2 + ' + b + '^2} = ' + qt(m, 'N') + '$, not $' + (a + b) + '\\,\\text{N}$.'],
        hint: 'Use the Pythagorean theorem, not plain addition.', chk: { k: k, a: a, b: b, ans: m } };
    }
    if (k === 'line' || k === 'end') {
      var q1, q2, q3, d1, d2, xs, Q, on = k === 'line' ? 1 : 2, Fx, parts;
      for (var tries = 0; tries < 20; tries++) { // avoid cases where the two forces (nearly) cancel
        q1 = R.pick([1, 2, 3, 4]) * R.sign(); q2 = R.pick([1, 2, 3]) * R.sign(); q3 = R.pick([1, 2, 3, 4]) * R.sign(); d1 = R.pick([10, 20, 30]); d2 = R.pick([10, 20, 30]);
        xs = [0, d1 / 100, (d1 + d2) / 100]; Q = [q1, q2, q3]; Fx = 0; parts = [];
        for (var i = 0; i < 3; i++) if (i !== on) { var dx = xs[on] - xs[i], f = K_E * Q[i] * Q[on] * 1e-12 / (dx * dx) * (dx > 0 ? 1 : -1); Fx += f; parts.push({ i: i, f: f, r: abs(dx) }); }
        if (abs(Fx) > 0.1 * Math.max(abs(parts[0].f), abs(parts[1].f))) break;
      }
      var nm = ['A', 'B', 'C'];
      return { q: 'Three charges lie on the $x$-axis: A $= ' + qs(q1) + '$ at $x = 0$, B $= ' + qs(q2) + '$ at $x = ' + tg(xs[1]) + '\\,\\text{m}$, and C $= ' + qs(q3) + '$ at $x = ' + tg(xs[2]) + '\\,\\text{m}$. What is the net electric force on ' + nm[on] + '? Give the $x$-component (positive to the right). Use ' + ktxt + '.',
        a: ans(Fx), unit: 'N',
        viz: ef([{ q: q1, x: xs[0] - xs[2] / 2, y: 0 }, { q: q2, x: xs[1] - xs[2] / 2, y: 0 }, { q: q3, x: xs[2] - xs[2] / 2, y: 0 }], { qUnit: 'μC', view: Math.max(0.2, xs[2] * 0.75), hide: ['lines', 'test'] }),
        steps: parts.map(function (P) {
          return 'Force on ' + nm[on] + ' from ' + nm[P.i] + ': $k\\dfrac{|q_' + nm[P.i] + 'q_' + nm[on] + '|}{r^2} = (8.99 \\times 10^{9})\\dfrac{(' + abs(Q[P.i]) + ' \\times 10^{-6})(' + abs(Q[on]) + ' \\times 10^{-6})}{(' + tg(P.r) + ')^2} = ' + qt(abs(P.f), 'N') + '$, ' + (Q[P.i] * Q[on] > 0 ? 'a push away from ' : 'a pull toward ') + nm[P.i] + ', so ' + dirX(P.f) + ': $' + (P.f > 0 ? '+' : '') + tn(P.f, 3) + '\\,\\text{N}$.';
        }).concat(['Add the components with their signs: $F_x = ' + tn(parts[0].f, 3) + (parts[1].f < 0 ? ' - ' + tn(-parts[1].f, 3) : ' + ' + tn(parts[1].f, 3)) + ' = ' + qt(Fx, 'N') + '$, ' + dirX(Fx).replace(/^in the /, 'pointing in the ') + '.']),
        hint: 'Find each force\'s size and direction separately, then add them with signs.', chk: { k: k, q1: q1, q2: q2, q3: q3, x2: xs[1], x3: xs[2], on: on, ans: Fx } };
    }
    if (k === 'right') {
      var qa = R.pick([2, 3, 4]), qb = R.pick([2, 3, 4]), q0 = R.pick([1, 2]), ra = R.pick([0.20, 0.30]), rb = R.pick([0.20, 0.30, 0.40]);
      var Fa = K_E * qa * q0 * 1e-12 / (ra * ra), Fb = K_E * qb * q0 * 1e-12 / (rb * rb), Fn = sqrt(Fa * Fa + Fb * Fb);
      return { q: 'A $+' + tg(q0) + '\\,\\mu\\text{C}$ charge sits at the origin. A $+' + tg(qa) + '\\,\\mu\\text{C}$ charge is at $(' + tg(ra) + '\\,\\text{m}, 0)$ and a $+' + tg(qb) + '\\,\\mu\\text{C}$ charge is at $(0, ' + tg(rb) + '\\,\\text{m})$. What is the size of the net force on the charge at the origin? Use ' + ktxt + '.', a: ans(Fn), unit: 'N',
        viz: ef([{ q: q0, x: 0, y: 0 }, { q: qa, x: ra, y: 0 }, { q: qb, x: 0, y: rb }], { qUnit: 'μC', view: 0.3, hide: ['lines', 'test'] }),
        steps: ['From the charge on the $x$-axis: $F_1 = (8.99 \\times 10^{9})\\dfrac{(' + qa + ' \\times 10^{-6})(' + q0 + ' \\times 10^{-6})}{(' + tg(ra) + ')^2} = ' + qt(Fa, 'N') + '$, pushing in the $-x$ direction.',
          'From the charge on the $y$-axis: $F_2 = (8.99 \\times 10^{9})\\dfrac{(' + qb + ' \\times 10^{-6})(' + q0 + ' \\times 10^{-6})}{(' + tg(rb) + ')^2} = ' + qt(Fb, 'N') + '$, pushing in the $-y$ direction.',
          'They are at right angles: $F = \\sqrt{F_1^2 + F_2^2} = \\sqrt{(' + tn(Fa, 3) + ')^2 + (' + tn(Fb, 3) + ')^2} = ' + qt(Fn, 'N') + '$.'],
        hint: 'Find each force, then combine perpendicular components with the Pythagorean theorem.', chk: { k: k, q0: q0, qa: qa, qb: qb, ra: ra, rb: rb, ans: Fn } };
    }
    // zero: where a third charge feels no net force between two like charges
    var qA = R.pick([1, 2, 3]), ratio = R.pick([4, 9]), qB = qA * ratio, d = R.pick([0.30, 0.40, 0.60, 0.90]), x = d / (1 + sqrt(ratio));
    return { q: 'A $+' + tg(qA) + '\\,\\mu\\text{C}$ charge is at $x = 0$ and a $+' + tg(qB) + '\\,\\mu\\text{C}$ charge is at $x = ' + tg(d) + '\\,\\text{m}$. At what point between them would a third charge feel no net electric force? Give its $x$-coordinate.', a: ans(x), unit: 'm',
      viz: ef([{ q: qA, x: -d / 2, y: 0 }, { q: qB, x: d / 2, y: 0 }], { qUnit: 'μC', view: Math.max(0.25, d * 0.7), show: ['lines'], hide: ['test'] }),
      steps: ['Between two like charges the two forces on a third charge point in opposite directions, so they can cancel. The point must be closer to the smaller charge.',
        'Equal sizes: $\\dfrac{k' + qA + 'q}{x^2} = \\dfrac{k' + qB + 'q}{(' + tg(d) + ' - x)^2}$, so $\\dfrac{' + tg(d) + ' - x}{x} = \\sqrt{' + ratio + '} = ' + sqrt(ratio) + '$.',
        '$' + tg(d) + ' - x = ' + sqrt(ratio) + 'x$, so $x = \\dfrac{' + tg(d) + '}{' + (1 + sqrt(ratio)) + '} = ' + qt(x, 'm') + '$. The third charge\'s own size and sign do not matter.'],
      hint: 'Set the two force sizes equal and take square roots.', chk: { k: k, qA: qA, qB: qB, d: d, ans: x } };
  });

  G('phys2.electric-field', function (R, ctx) {
    var k = kind(R, ctx, ['point', 'force', 'test'], ['point', 'force', 'fromForce', 'test', 'direction'], ['charge', 'ratio', 'point', 'force']);
    if (k === 'test') {
      var f = R.pick([2, 3, 4]);
      return { q: 'A small test charge $q$ placed at point P feels a force $F$. It is replaced by a test charge $' + f + 'q$. What happens to the electric field at P?',
        a: mc('It stays the same; only the force changes, to ' + f + 'F.', ['It becomes ' + f + ' times larger.', 'It becomes ' + f + ' times smaller.', 'It becomes zero, because a new charge cancels it.']),
        steps: ['The field at P is made by the other charges around; the test charge only measures it: $E = F/q$.',
          'With $' + f + 'q$ the force becomes $' + f + 'F$, and $E = \\dfrac{' + f + 'F}{' + f + 'q} = \\dfrac{F}{q}$: unchanged.',
          'The field would be there even with no test charge at all.'],
        hint: 'What happens to $F/q$ when both grow by the same factor?', chk: { k: k, ans: 0 } };
    }
    if (k === 'direction') {
      var dir = R.pick(['east', 'north', 'west', 'south']), opp = { east: 'west', west: 'east', north: 'south', south: 'north' }, el = R.coin();
      return { q: 'The electric field in a region points ' + dir + '. Which way is the electric force on ' + (el ? 'an electron' : 'a proton') + ' placed there?',
        a: mc(cap(el ? opp[dir] : dir), [cap(el ? dir : opp[dir]), dir === 'east' || dir === 'west' ? 'North' : 'East', 'There is no force unless the particle moves']),
        steps: ['$\\vec F = q\\vec E$: a positive charge is pushed along the field, a negative charge against it.',
          (el ? 'The electron is negative, so the force points opposite the field: ' + opp[dir] + '.' : 'The proton is positive, so the force points along the field: ' + dir + '.')],
        hint: 'Is the charge positive or negative?', chk: { k: k, v: cap(el ? opp[dir] : dir), ans: 0 } };
    }
    if (k === 'point') {
      var q = R.pick([1, 2, 3, 4, 5, 8, 10]) * R.sign(), rc = R.pick([5, 10, 15, 20, 30]), r = rc / 100, E = K_E * abs(q) * 1e-9 / (r * r);
      return { q: 'What is the size of the electric field $' + qx(rc, 'cm') + '$ from a point charge of $' + qs(q, 'nC') + '$? Which way does it point? (Enter the size.) Use ' + ktxt + '.', a: ans(E), unit: 'N/C',
        viz: ef([{ q: q, x: 0, y: 0 }], { view: Math.max(0.12, r * 1.4), test: { x: r, y: 0, q: 1 }, show: ['lines'] }),
        steps: ['$E = k\\dfrac{|q|}{r^2}$, with $q = ' + tx(abs(q)) + ' \\times 10^{-9}\\,\\text{C}$ and $r = ' + tg(r) + '\\,\\text{m}$.',
          '$E = (8.99 \\times 10^{9})\\dfrac{' + tx(abs(q)) + ' \\times 10^{-9}}{(' + tg(r) + ')^2} = ' + qt(E, 'N/C') + '$.',
          'The charge is ' + (q > 0 ? 'positive, so the field points away from it.' : 'negative, so the field points toward it.')],
        hint: 'Use $E = k|q|/r^2$ with SI units.', chk: { k: k, q: q, r: rc, ans: E } };
    }
    if (k === 'force') {
      var E2 = R.pick([200, 500, 800, 1200, 2000, 5000, 15000]), part = R.pick(['electron', 'proton', 'ion']), qq = part === 'ion' ? 2 * QE : QE, F = qq * E2;
      return { q: (part === 'ion' ? 'A doubly charged ion (charge $+2e$)' : 'A' + (part === 'electron' ? 'n electron' : ' proton')) + ' is in a uniform electric field of $' + qx(E2, 'N/C') + '$. What is the size of the electric force on it? Use ' + etxt + '.', a: ans(F), unit: 'N',
        steps: ['$F = |q|E$, by the definition of the field as force per coulomb.',
          '$F = (' + (part === 'ion' ? '2 \\times ' : '') + '1.60 \\times 10^{-19}\\,\\text{C})(' + qx(E2, 'N/C') + ') = ' + qt(F, 'N') + '$.',
          part === 'electron' ? 'Its direction is opposite to the field, because the electron is negative.' : 'Its direction is along the field, because the charge is positive.'],
        hint: 'Multiply the charge by the field.', chk: { k: k, E: E2, ans: F } };
    }
    if (k === 'fromForce') {
      var qn = R.pick([2, 4, 5, 8]), Fn = R.pick([1.0, 2.0, 4.0, 6.0]) * 1e-6, E3 = Fn / (qn * 1e-9);
      return { q: 'A $+' + tg(qn) + '\\,\\text{nC}$ test charge feels a force of $' + tn(Fn, 2) + '\\,\\text{N}$ at point P. What is the size of the electric field at P?', a: ans(E3), unit: 'N/C',
        steps: ['The field is the force per coulomb: $E = \\dfrac{F}{q}$.', '$E = \\dfrac{' + tn(Fn, 2) + '\\,\\text{N}}{' + qn + ' \\times 10^{-9}\\,\\text{C}} = ' + qt(E3, 'N/C') + '$.'],
        hint: 'Divide the force by the test charge.', chk: { k: k, q: qn, F: Fn, ans: E3 } };
    }
    if (k === 'charge') {
      var E4 = R.pick([450, 900, 1800, 3600]), rc4 = R.pick([10, 20, 30]), q4 = E4 * Math.pow(rc4 / 100, 2) / K_E * 1e9;
      return { q: 'The electric field $' + qx(rc4, 'cm') + '$ from a small charged ball is $' + qx(E4, 'N/C') + '$, pointing toward the ball. What is the ball\'s charge, in nanocoulombs? (Give the sign.) Use ' + ktxt + '.', a: ans(-q4), unit: 'nC',
        steps: ['$E = k|q|/r^2$, so $|q| = \\dfrac{Er^2}{k} = \\dfrac{(' + E4 + ')(' + tg(rc4 / 100) + ')^2}{8.99 \\times 10^{9}} = ' + qt(q4 * 1e-9, 'C') + '$.',
          'The field points toward the ball, so the charge is negative: $q = -' + tn(q4, 3) + '\\,\\text{nC}$.'],
        hint: 'Solve $E = k|q|/r^2$ for $|q|$, then use the direction for the sign.', chk: { k: k, E: E4, r: rc4, ans: -q4 } };
    }
    // ratio
    var E0 = R.pick([400, 900, 1600, 3600]), r1 = R.pick([10, 20, 30]), fr = R.pick([2, 3, 0.5]), r2 = r1 * fr, En = E0 / (fr * fr);
    return { q: 'The electric field $' + qx(r1, 'cm') + '$ from a point charge is $' + qx(E0, 'N/C') + '$. What is the field $' + qx(r2, 'cm') + '$ from the same charge?', a: ans(En), unit: 'N/C',
      steps: ['$E = k|q|/r^2$: the field falls off as $1/r^2$.', 'The distance changes by a factor of $' + tx(fr) + '$, so the field changes by $1/' + tx(fr) + '^2 = 1/' + tx(fr * fr) + '$.',
        '$E = \\dfrac{' + E0 + '}{' + tx(fr * fr) + '} = ' + qt(En, 'N/C') + '$.'],
      hint: 'Inverse square law.', chk: { k: k, E0: E0, r1: r1, r2: r2, ans: En } };
  });

  G('phys2.field-superposition', function (R, ctx) {
    var k = kind(R, ctx, ['between', 'dipole', 'lines'], ['between', 'dipole', 'lines', 'right'], ['right', 'zeroPoint', 'between', 'lines']);
    if (k === 'lines') {
      var stmts = [['Field lines never cross, because the field has one direction at each point.', 'Two field lines can cross where two charges\' fields meet.'],
        ['Where field lines are closer together, the field is stronger.', 'Where field lines are closer together, the field is weaker.'],
        ['Field lines start on positive charges and end on negative charges.', 'Field lines start on negative charges and end on positive charges.']];
      var pick = R.pick(stmts), others = ['A charge released from rest always moves along a field line, whatever its starting velocity.', pick[1], 'Field lines show the paths that charges must follow.'];
      return { q: 'Which statement about electric field lines is true?', a: mc(pick[0], others),
        viz: ef([{ q: 2, x: -0.1, y: 0 }, { q: -2, x: 0.1, y: 0 }], { show: ['lines'], hide: ['test'] }),
        steps: ['A field line is drawn so its direction at each point is the field\'s direction there, and lines crowd together where the field is strong.',
          'There is only one field direction at a point, so lines cannot cross. They begin on positive charges and end on negative ones.',
          'Field lines show the direction of the force, which is the direction of the <em>acceleration</em>, not of the velocity, so a moving charge can cross lines.'],
        hint: 'A field line gives the force direction. Is that always the direction of motion?', chk: { k: k, ans: 0 } };
    }
    if (k === 'between') {
      var q1 = R.pick([1, 2, 3, 4, 6, 8]) * R.sign(), q2 = R.pick([1, 2, 3, 4, 6, 8]) * R.sign(), d = R.pick([0.20, 0.30, 0.40]), xp = R.pick([0.25, 0.5, 0.75]) * d;
      xp = U.fix(xp); var E1 = K_E * q1 * 1e-9 / (xp * xp), E2 = -K_E * q2 * 1e-9 / Math.pow(d - xp, 2), Ex = E1 + E2;
      if (abs(Ex) < 0.1 * Math.max(abs(E1), abs(E2))) { q2 = -q2; E2 = -E2; Ex = E1 + E2; }
      return { q: 'A $' + qs(q1, 'nC') + '$ charge is at $x = 0$ and a $' + qs(q2, 'nC') + '$ charge is at $x = ' + tg(d) + '\\,\\text{m}$. What is the electric field at $x = ' + tg(xp) + '\\,\\text{m}$? Give its $x$-component (positive to the right). Use ' + ktxt + '.', a: ans(Ex), unit: 'N/C',
        viz: ef([{ q: q1, x: -d / 2, y: 0 }, { q: q2, x: d / 2, y: 0 }], { view: Math.max(0.2, d * 0.75), test: { x: xp - d / 2, y: 0, q: 1 }, show: ['lines'] }),
        steps: ['From the first charge ($' + tg(xp) + '\\,\\text{m}$ away): size $(8.99 \\times 10^{9})\\dfrac{' + abs(q1) + ' \\times 10^{-9}}{(' + tg(xp) + ')^2} = ' + qt(abs(E1), 'N/C') + '$, ' + (q1 > 0 ? 'pointing away from it, to the right' : 'pointing toward it, to the left') + ': $' + (E1 > 0 ? '+' : '') + tn(E1, 3) + '$.',
          'From the second charge ($' + tg(U.fix(d - xp)) + '\\,\\text{m}$ away): size $(8.99 \\times 10^{9})\\dfrac{' + abs(q2) + ' \\times 10^{-9}}{(' + tg(U.fix(d - xp)) + ')^2} = ' + qt(abs(E2), 'N/C') + '$, ' + (q2 > 0 ? 'pointing away from it, to the left' : 'pointing toward it, to the right') + ': $' + (E2 > 0 ? '+' : '') + tn(E2, 3) + '$.',
          'Add with signs: $E_x = ' + tn(E1, 3) + (E2 < 0 ? ' - ' + tn(-E2, 3) : ' + ' + tn(E2, 3)) + ' = ' + qt(Ex, 'N/C') + '$.'],
        hint: 'Find each field\'s size and direction at the point, then add them with signs.', chk: { k: k, q1: q1, q2: q2, d: d, x: xp, ans: Ex } };
    }
    if (k === 'dipole') {
      var q = R.pick([1, 2, 3, 4, 5]), dd = R.pick([0.10, 0.20, 0.30, 0.40]), Em = 2 * K_E * q * 1e-9 / Math.pow(dd / 2, 2);
      return { q: 'A $+' + tg(q) + '\\,\\text{nC}$ charge and a $-' + tg(q) + '\\,\\text{nC}$ charge are $' + qx(dd, 'm') + '$ apart. What is the size of the electric field at the midpoint between them? Use ' + ktxt + '.', a: ans(Em), unit: 'N/C',
        viz: ef([{ q: q, x: -dd / 2, y: 0 }, { q: -q, x: dd / 2, y: 0 }], { view: Math.max(0.15, dd * 0.8), test: { x: 0, y: 0, q: 1 }, show: ['lines'] }),
        steps: ['Each charge is $' + tg(dd / 2) + '\\,\\text{m}$ from the midpoint, so each makes a field of size $(8.99 \\times 10^{9})\\dfrac{' + q + ' \\times 10^{-9}}{(' + tg(dd / 2) + ')^2} = ' + qt(Em / 2, 'N/C') + '$.',
          'The field of the positive charge points away from it, toward the negative charge; the field of the negative charge points toward itself, the same way.',
          'They add: $E = 2 \\times ' + tn(Em / 2, 3) + ' = ' + qt(Em, 'N/C') + '$, pointing toward the negative charge.'],
        hint: 'At the midpoint, do the two fields point the same way or opposite ways?', chk: { k: k, q: q, d: dd, ans: Em } };
    }
    if (k === 'right') {
      var qa = R.pick([2, 3, 4, 6]), qb = R.pick([2, 4, 6, 8]), a = R.pick([0.20, 0.30]), b = R.pick([0.20, 0.30, 0.40]);
      var Ea = K_E * qa * 1e-9 / (a * a), Eb = K_E * qb * 1e-9 / (b * b), En = sqrt(Ea * Ea + Eb * Eb);
      return { q: 'A $+' + tg(qa) + '\\,\\text{nC}$ charge is at the origin and a $+' + tg(qb) + '\\,\\text{nC}$ charge is at $(' + tg(a) + '\\,\\text{m}, ' + tg(b) + '\\,\\text{m})$. Point P is at $(' + tg(a) + '\\,\\text{m}, 0)$, directly below the second charge. What is the size of the electric field at P? Use ' + ktxt + '.', a: ans(En), unit: 'N/C',
        viz: ef([{ q: qa, x: -a / 2, y: -b / 2 }, { q: qb, x: a / 2, y: b / 2 }], { view: 0.3, test: { x: a / 2, y: -b / 2, q: 1 }, hide: ['lines'] }),
        steps: ['From the charge at the origin ($' + tg(a) + '\\,\\text{m}$ away): $E_1 = (8.99 \\times 10^{9})\\dfrac{' + qa + ' \\times 10^{-9}}{(' + tg(a) + ')^2} = ' + qt(Ea, 'N/C') + '$, pointing in the $+x$ direction.',
          'From the charge above P ($' + tg(b) + '\\,\\text{m}$ away): $E_2 = (8.99 \\times 10^{9})\\dfrac{' + qb + ' \\times 10^{-9}}{(' + tg(b) + ')^2} = ' + qt(Eb, 'N/C') + '$, pointing in the $-y$ direction.',
          'Perpendicular, so $E = \\sqrt{E_1^2 + E_2^2} = ' + qt(En, 'N/C') + '$, not their plain sum.'],
        hint: 'The two fields at P are at right angles.', chk: { k: k, qa: qa, qb: qb, a: a, b: b, ans: En } };
    }
    // zeroPoint
    var qA = R.pick([1, 2, 3, 5]), r = R.pick([4, 9]), qB = qA * r, dz = R.pick([0.30, 0.40, 0.60]), x = dz / (1 + sqrt(r));
    return { q: 'Charges of $+' + tg(qA) + '\\,\\text{nC}$ (at $x = 0$) and $+' + tg(qB) + '\\,\\text{nC}$ (at $x = ' + tg(dz) + '\\,\\text{m}$) sit on the $x$-axis. Where between them is the electric field zero? Give $x$.', a: ans(x), unit: 'm',
      viz: ef([{ q: qA, x: -dz / 2, y: 0 }, { q: qB, x: dz / 2, y: 0 }], { view: Math.max(0.25, dz * 0.7), show: ['lines'], hide: ['test'] }),
      steps: ['Between two positive charges their fields point in opposite directions, so they can cancel, at a point nearer the smaller charge.',
        'Equal sizes: $\\dfrac{k(' + qA + ')}{x^2} = \\dfrac{k(' + qB + ')}{(' + tg(dz) + ' - x)^2}$, so $\\dfrac{' + tg(dz) + ' - x}{x} = \\sqrt{' + r + '} = ' + sqrt(r) + '$.',
        '$x = \\dfrac{' + tg(dz) + '}{' + (1 + sqrt(r)) + '} = ' + qt(x, 'm') + '$.'],
      hint: 'Set the two field sizes equal.', chk: { k: k, qA: qA, qB: qB, d: dz, ans: x } };
  });

  G('phys2.uniform-field', function (R, ctx) {
    var k = kind(R, ctx, ['accel', 'direction', 'accel'], ['accel', 'speed', 'balance', 'direction'], ['deflect', 'speed', 'balance', 'time']);
    if (k === 'direction') {
      var up = R.coin(), el = R.coin();
      return { q: 'Two horizontal metal plates make a uniform electric field pointing ' + (up ? 'up' : 'down') + '. ' + (el ? 'An electron' : 'A proton') + ' is released between them. Which way does it accelerate? (Ignore gravity.)',
        a: mc(((el ? !up : up) ? 'Up' : 'Down') + (el ? ', opposite the field' : ', along the field'), [((el ? up : !up) ? 'Up' : 'Down') + (el ? ', along the field' : ', opposite the field'), 'Sideways, along the plates', 'It does not move, because the field is uniform']),
        viz: { name: 'ph-efield', opts: { mode: 'plates', particle: el ? 'electron' : 'proton', V: 100, d: 0.02, interactive: false, quiet: true } },
        steps: ['$\\vec F = q\\vec E$: positive charges are pushed along $\\vec E$, negative charges opposite to it.',
          (el ? 'The electron is negative, so it accelerates opposite the field: ' + (up ? 'down' : 'up') + '.' : 'The proton is positive, so it accelerates along the field: ' + (up ? 'up' : 'down') + '.'),
          'A uniform field gives a constant force, so a constant acceleration, just like gravity near the ground.'],
        hint: 'Check the sign of the charge.', chk: { k: k, v: ((el ? !up : up) ? 'Up' : 'Down'), ans: 0 } };
    }
    if (k === 'accel') {
      var el2 = R.coin(), E = R.pick([200, 500, 1000, 2000, 5000, 20000]), a = QE * E / (el2 ? ME : MP);
      return { q: 'What is the size of the acceleration of ' + (el2 ? 'an electron ($m = 9.11 \\times 10^{-31}\\,\\text{kg}$)' : 'a proton ($m = 1.67 \\times 10^{-27}\\,\\text{kg}$)') + ' in a uniform electric field of $' + qx(E, 'N/C') + '$? Use ' + etxt + '; ignore gravity.', a: ans(a), unit: 'm/s2',
        steps: ['The force is $F = eE$, constant in a uniform field.', 'Newton\'s second law: $a = \\dfrac{eE}{m} = \\dfrac{(1.60 \\times 10^{-19})(' + E + ')}{' + (el2 ? '9.11 \\times 10^{-31}' : '1.67 \\times 10^{-27}') + '} = ' + qt(a, 'm/s2') + '$.',
          'That is enormous compared with $g$, which is why gravity can be ignored for ' + (el2 ? 'electrons' : 'protons') + ' in fields like this.'],
        hint: 'Find the force $eE$, then divide by the mass.', chk: { k: k, E: E, el: el2 ? 1 : 0, ans: a } };
    }
    if (k === 'speed') {
      var E2 = R.pick([1000, 2000, 5000, 10000]), dcm = R.pick([1.0, 2.0, 4.0, 5.0]), d = dcm / 100, el3 = R.coin(), m = el3 ? ME : MP, v = sqrt(2 * QE * E2 * d / m);
      return { q: (el3 ? 'An electron' : 'A proton') + ' starts from rest and is accelerated across a $' + qx(dcm, 'cm') + '$ gap by a uniform field of $' + qx(E2, 'N/C') + '$. How fast is it moving at the end? Use ' + etxt + ' and ' + (el3 ? '$m_e = 9.11 \\times 10^{-31}\\,\\text{kg}$' : '$m_p = 1.67 \\times 10^{-27}\\,\\text{kg}$') + '.', a: ans(v), unit: 'm/s',
        steps: ['Constant acceleration: $a = \\dfrac{eE}{m} = ' + qt(QE * E2 / m, 'm/s2') + '$.',
          'From rest over a distance $d$: $v^2 = 2ad$, so $v = \\sqrt{2(' + tn(QE * E2 / m, 3) + ')(' + tg(d) + ')} = ' + qt(v, 'm/s') + '$.',
          'The same answer comes from energy: the work $eEd$ becomes kinetic energy $\\tfrac{1}{2}mv^2$.'],
        hint: 'Find $a$, then use $v^2 = 2ad$.', chk: { k: k, E: E2, d: dcm, el: el3 ? 1 : 0, ans: v } };
    }
    if (k === 'balance') {
      var n = R.pick([2, 3, 4, 5, 6, 8]), E3 = R.pick([2.0, 2.5, 4.0, 5.0]) * 1e4, mm = rd(n * QE * E3 / GR, 3), nn = mm * GR / (QE * E3);
      return { q: 'In a Millikan-style experiment, an oil drop of mass $' + qt(mm, 'kg') + '$ hangs at rest between horizontal plates where the electric field is $' + qt(E3, 'N/C') + '$, pointing down. How many extra electrons does the drop carry? Use ' + etxt + ' and $g = 9.8\\,\\text{m/s}^2$.', a: { t: 'num', v: String(n), tol: 0.3 }, unit: 'electrons',
        steps: ['At rest, the upward electric force balances the weight: $|q|E = mg$.', '$|q| = \\dfrac{mg}{E} = \\dfrac{(' + tn(mm, 3) + ')(9.8)}{' + tn(E3, 2) + '} = ' + qt(mm * GR / E3, 'C') + '$.',
          'Number of electrons: $N = |q|/e = ' + tn(nn, 3) + ' \\approx ' + n + '$. (The field points down and the force is up, so the drop is negative, as extra electrons make it.)'],
        hint: 'Balance $qE$ against $mg$, then divide the charge by $e$.', chk: { k: k, m: mm, E: E3, ans: n } };
    }
    if (k === 'time') {
      var L = R.pick([2.0, 4.0, 5.0]), v0 = R.pick([2.0, 4.0, 5.0]) * 1e6, E4 = R.pick([100, 200, 500]), t = L / 100 / v0, vy = QE * E4 / ME * t;
      return { q: 'An electron enters the space between two parallel plates moving parallel to them at $' + qt(v0, 'm/s') + '$. The plates are $' + qx(L, 'cm') + '$ long, and the field between them is $' + qx(E4, 'N/C') + '$. How large is the electron\'s sideways (perpendicular) velocity when it leaves the plates? Use ' + etxt + ' and $m_e = 9.11 \\times 10^{-31}\\,\\text{kg}$.', a: ans(vy), unit: 'm/s',
        steps: ['Like a horizontally launched projectile: the speed along the plates stays $v_0$, so the time between the plates is $t = L/v_0 = \\dfrac{' + tg(L / 100) + '}{' + tn(v0, 2) + '} = ' + qt(t, 's') + '$.',
          'Sideways acceleration: $a = eE/m = ' + qt(QE * E4 / ME, 'm/s2') + '$.', 'Sideways velocity: $v_y = at = ' + qt(vy, 'm/s') + '$.'],
        hint: 'Find the time from the motion along the plates.', chk: { k: k, L: L, v0: v0, E: E4, ans: vy } };
    }
    // deflect
    var L2 = R.pick([2.0, 3.0, 4.0, 5.0]), v1 = R.pick([2.0, 3.0, 4.0, 5.0]) * 1e6, E5 = R.pick([100, 200, 300, 500]), t2 = L2 / 100 / v1, y = 0.5 * QE * E5 / ME * t2 * t2 * 1000;
    return { q: 'An electron moving at $' + qt(v1, 'm/s') + '$ enters a uniform field of $' + qx(E5, 'N/C') + '$ between parallel plates $' + qx(L2, 'cm') + '$ long, moving parallel to the plates. How far sideways, in millimeters, is it pushed by the time it leaves? Use ' + etxt + ' and $m_e = 9.11 \\times 10^{-31}\\,\\text{kg}$.', a: ans(y), unit: 'mm',
      viz: { name: 'ph-efield', opts: { mode: 'plates', particle: 'electron', V: E5 * 0.02, d: 0.02, L: L2 / 100, v0: v1, interactive: false, quiet: true, t: 1 } },
      steps: ['Time between the plates: $t = \\dfrac{L}{v_0} = \\dfrac{' + tg(L2 / 100) + '\\,\\text{m}}{' + tn(v1, 2) + '\\,\\text{m/s}} = ' + qt(t2, 's') + '$.',
        'Sideways acceleration: $a = \\dfrac{eE}{m} = \\dfrac{(1.60 \\times 10^{-19})(' + E5 + ')}{9.11 \\times 10^{-31}} = ' + qt(QE * E5 / ME, 'm/s2') + '$, opposite the field (an electron).',
        'Sideways distance: $y = \\tfrac{1}{2}at^2 = ' + qt(y / 1000, 'm') + ' = ' + qt(y, 'mm') + '$. The path is a parabola, like a ball thrown horizontally.'],
      hint: 'Treat it like a horizontal launch: time from the length, then $y = \\tfrac{1}{2}at^2$.', chk: { k: k, L: L2, v0: v1, E: E5, ans: y } };
  });

  G('phys2.electric-potential-energy', function (R, ctx) {
    var k = kind(R, ctx, ['U', 'concept', 'U'], ['U', 'change', 'concept', 'work'], ['speed', 'three', 'change', 'U']);
    if (k === 'concept') {
      var att = R.coin();
      return { q: 'Two charges ' + (att ? 'of opposite sign' : 'of the same sign') + ' are moved closer together. What happens to their electric potential energy?',
        a: mc(att ? 'It becomes more negative (it decreases).' : 'It becomes more positive (it increases).', att ? ['It becomes more positive (it increases).', 'It stays at zero, because the charges cancel.', 'It does not change, because energy is conserved.'] : ['It becomes more negative (it decreases).', 'It stays the same, because the charges are equal.', 'It becomes zero when they touch.']),
        steps: ['$U = k\\dfrac{q_1q_2}{r}$, with the signs of the charges kept, and $U = 0$ when the charges are far apart.',
          att ? 'Opposite signs make $q_1q_2$ negative, so $U < 0$; a smaller $r$ makes it more negative. Attracting charges lose potential energy as they come together, like a falling ball.' : 'Like signs make $q_1q_2$ positive, so $U > 0$; a smaller $r$ makes it larger. You must do work to push repelling charges together, and that work is stored.'],
        hint: 'Keep the signs in $kq_1q_2/r$.', chk: { k: k, v: att ? 'neg' : 'pos', ans: 0 } };
    }
    if (k === 'U') {
      var q1 = R.pick([1, 2, 3, 4, 5]) * R.sign(), q2 = R.pick([1, 2, 3, 4, 6]) * R.sign(), rc = R.pick([5, 10, 15, 20, 30]), U0 = K_E * q1 * q2 * 1e-12 / (rc / 100);
      return { q: 'What is the electric potential energy of a $' + qs(q1) + '$ charge and a $' + qs(q2) + '$ charge that are $' + qx(rc, 'cm') + '$ apart? Include the sign. Use ' + ktxt + '.', a: ans(U0), unit: 'J',
        steps: ['$U = k\\dfrac{q_1q_2}{r}$, keeping the signs (zero when the charges are far apart).',
          '$U = (8.99 \\times 10^{9})\\dfrac{(' + tx(q1) + ' \\times 10^{-6})(' + tx(q2) + ' \\times 10^{-6})}{' + tg(rc / 100) + '} = ' + qt(U0, 'J') + '$.',
          U0 < 0 ? 'Negative: the charges attract, so energy would have to be added to pull them apart.' : 'Positive: the charges repel, so energy was stored pushing them together.'],
        hint: 'Use $kq_1q_2/r$ with the signs of the charges.', chk: { k: k, q1: q1, q2: q2, r: rc, ans: U0 } };
    }
    if (k === 'change' || k === 'work') {
      var a1 = R.pick([2, 3, 4]), a2 = R.pick([2, 3, 5]) * R.sign(), r1 = R.pick([20, 30, 40, 60]), r2 = R.pick([10, 15, 20]);
      if (k === 'work') { r1 = Infinity; }
      var U1 = r1 === Infinity ? 0 : K_E * a1 * a2 * 1e-12 / (r1 / 100), U2 = K_E * a1 * a2 * 1e-12 / (r2 / 100), dU = U2 - U1;
      return { q: k === 'work' ? 'How much work must an outside agent do to bring a $' + qs(a2) + '$ charge slowly from very far away to a point $' + qx(r2, 'cm') + '$ from a fixed $+' + tg(a1) + '\\,\\mu\\text{C}$ charge? (Negative means the agent holds it back.) Use ' + ktxt + '.'
          : 'A $' + qs(a2) + '$ charge is moved from $' + qx(r1, 'cm') + '$ to $' + qx(r2, 'cm') + '$ from a fixed $+' + tg(a1) + '\\,\\mu\\text{C}$ charge. What is the change in electric potential energy? Use ' + ktxt + '.', a: ans(dU), unit: 'J',
        steps: [(k === 'work' ? 'Far away, $U_i = 0$. Moving slowly, the agent\'s work equals the change in potential energy: $W = \\Delta U = U_f$.' : '$\\Delta U = U_f - U_i = kq_1q_2\\left(\\dfrac{1}{r_f} - \\dfrac{1}{r_i}\\right)$.'),
          (k === 'work' ? '' : '$U_i = (8.99 \\times 10^{9})\\dfrac{(' + a1 + ' \\times 10^{-6})(' + tx(a2) + ' \\times 10^{-6})}{' + tg(r1 / 100) + '} = ' + qt(U1, 'J') + '$. ') + '$U_f = (8.99 \\times 10^{9})\\dfrac{(' + a1 + ' \\times 10^{-6})(' + tx(a2) + ' \\times 10^{-6})}{' + tg(r2 / 100) + '} = ' + qt(U2, 'J') + '$.',
          '$\\Delta U = ' + qt(dU, 'J') + '$. ' + (dU > 0 ? 'Positive: pushing like charges together stores energy.' : 'Negative: opposite charges coming together release energy.')],
        hint: 'Find $U = kq_1q_2/r$ at each distance and subtract.', chk: { k: k, q1: a1, q2: a2, r1: r1 === Infinity ? 0 : r1, r2: r2, ans: dU } };
    }
    if (k === 'speed') {
      var Q1 = R.pick([2, 4, 5]), Q2 = R.pick([1, 2]), m = R.pick([1.0, 2.0, 5.0]) * 1e-3, ri = R.pick([5, 10]), rf = ri * R.pick([2, 4]);
      var dK = K_E * Q1 * Q2 * 1e-12 * (1 / (ri / 100) - 1 / (rf / 100)), v = sqrt(2 * dK / m);
      return { q: 'A small ball of mass $' + tg(m * 1000) + '\\,\\text{g}$ carrying $+' + tg(Q2) + '\\,\\mu\\text{C}$ is held $' + qx(ri, 'cm') + '$ from a fixed $+' + tg(Q1) + '\\,\\mu\\text{C}$ charge, then released. How fast is it moving when it is $' + qx(rf, 'cm') + '$ away? Ignore gravity and friction. Use ' + ktxt + '.', a: ans(v), unit: 'm/s',
        steps: ['Energy is conserved: the drop in electric potential energy becomes kinetic energy, $\\tfrac{1}{2}mv^2 = U_i - U_f$.',
          '$U_i - U_f = kq_1q_2\\left(\\dfrac{1}{r_i} - \\dfrac{1}{r_f}\\right) = (8.99 \\times 10^{9})(' + Q1 + ' \\times 10^{-6})(' + Q2 + ' \\times 10^{-6})\\left(\\dfrac{1}{' + tg(ri / 100) + '} - \\dfrac{1}{' + tg(rf / 100) + '}\\right) = ' + qt(dK, 'J') + '$.',
          '$v = \\sqrt{\\dfrac{2(' + tn(dK, 3) + ')}{' + tn(m, 2) + '}} = ' + qt(v, 'm/s') + '$.'],
        hint: 'Use energy conservation with $U = kq_1q_2/r$.', chk: { k: k, Q1: Q1, Q2: Q2, m: m, ri: ri, rf: rf, ans: v } };
    }
    // three charges on a line: sum of pairs
    var c1 = R.pick([1, 2, 3]) * R.sign(), c2 = R.pick([1, 2, 3]) * R.sign(), c3 = R.pick([1, 2, 3]) * R.sign(), s = R.pick([0.10, 0.20, 0.30]);
    var U12 = K_E * c1 * c2 * 1e-12 / s, U23 = K_E * c2 * c3 * 1e-12 / s, U13 = K_E * c1 * c3 * 1e-12 / (2 * s), Ut = U12 + U23 + U13;
    if (abs(Ut) < 0.1 * Math.max(abs(U12), abs(U23), abs(U13))) { c3 = -c3; U23 = -U23; U13 = -U13; Ut = U12 + U23 + U13; }
    return { q: 'Three charges sit in a row, $' + qx(s, 'm') + '$ apart: $' + qs(c1) + '$, $' + qs(c2) + '$ and $' + qs(c3) + '$. What is the total electric potential energy of the group? Use ' + ktxt + '.', a: ans(Ut), unit: 'J',
      steps: ['The total is the sum over every pair: 1–2, 2–3 and 1–3 (which are $' + tg(2 * s) + '\\,\\text{m}$ apart).',
        '$U_{12} = ' + qt(U12, 'J') + '$, $U_{23} = ' + qt(U23, 'J') + '$, $U_{13} = ' + qt(U13, 'J') + '$ (each $kq_iq_j/r_{ij}$ with signs).',
        '$U = ' + qt(Ut, 'J') + '$, the work needed to assemble the group from far apart.'],
      hint: 'Add $kq_iq_j/r_{ij}$ for all three pairs.', chk: { k: k, c1: c1, c2: c2, c3: c3, s: s, ans: Ut } };
  });

  G('phys2.electric-potential', function (R, ctx) {
    var k = kind(R, ctx, ['point', 'energy', 'concept', 'U'], ['point', 'two', 'energy', 'speed', 'concept'], ['two', 'speed', 'energy', 'point']);
    if (k === 'concept') {
      var el = R.coin(), va = R.pick([50, 100, 200]), vb = va + R.pick([50, 100, 150]);
      var from = el ? va : vb, to = el ? vb : va, gain = abs(vb - va);
      return { q: (el ? 'An electron' : 'A proton') + ' moves, with only electric forces acting, from a point at $' + from + '\\,\\text{V}$ to a point at $' + to + '\\,\\text{V}$. What happens to its kinetic energy?',
        a: mc('It increases by ' + gain + ' eV.', ['It decreases by ' + gain + ' eV.', 'It increases by ' + (from + to) + ' eV.', 'It stays the same, because potential is not energy.']),
        steps: ['The change in potential energy is $\\Delta U = q\\Delta V$, and with only electric forces $\\Delta K = -q\\Delta V$.',
          '$\\Delta V = ' + to + ' - ' + from + ' = ' + (to - from) + '\\,\\text{V}$ and $q = ' + (el ? '-e' : '+e') + '$, so $\\Delta K = ' + (el ? '+e(' + (to - from) + '\\,\\text{V})' : '-e(' + (to - from) + '\\,\\text{V})') + ' = +' + gain + '\\,\\text{eV}$.',
          (el ? 'Electrons speed up moving toward higher potential.' : 'Protons speed up moving toward lower potential, like a ball rolling downhill.')],
        hint: 'Use $\\Delta K = -q\\Delta V$ and keep the sign of the charge.', chk: { k: k, ans: 0 } };
    }
    if (k === 'point') {
      var q = R.pick([1, 2, 3, 4, 5, 6, 8]) * R.sign(), rc = R.pick([5, 10, 15, 20, 30, 50]), V = K_E * q * 1e-9 / (rc / 100);
      return { q: 'What is the electric potential $' + qx(rc, 'cm') + '$ from a point charge of $' + qs(q, 'nC') + '$? (Take $V = 0$ far away; include the sign.) Use ' + ktxt + '.', a: ans(V), unit: 'V',
        steps: ['$V = k\\dfrac{q}{r}$, a scalar with the sign of the charge, and $1/r$, not $1/r^2$.',
          '$V = (8.99 \\times 10^{9})\\dfrac{' + tx(q) + ' \\times 10^{-9}}{' + tg(rc / 100) + '} = ' + qt(V, 'V') + '$.'],
        hint: 'Potential goes as $1/r$ and keeps the sign of $q$.', chk: { k: k, q: q, r: rc, ans: V } };
    }
    if (k === 'two') {
      var q1 = R.pick([2, 3, 4, 6]) * R.sign(), q2 = R.pick([1, 2, 4, 5]) * R.sign(), d = R.pick([0.20, 0.30, 0.40]), x = U.fix(R.pick([0.25, 0.5]) * d);
      var V1 = K_E * q1 * 1e-9 / x, V2 = K_E * q2 * 1e-9 / (d - x), Vt = V1 + V2;
      if (abs(Vt) < 0.1 * Math.max(abs(V1), abs(V2))) { q2 = -q2; V2 = -V2; Vt = V1 + V2; }
      return { q: 'A $' + qs(q1, 'nC') + '$ charge is at $x = 0$ and a $' + qs(q2, 'nC') + '$ charge is at $x = ' + tg(d) + '\\,\\text{m}$. What is the electric potential at $x = ' + tg(x) + '\\,\\text{m}$? Use ' + ktxt + '.', a: ans(Vt), unit: 'V',
        viz: ef([{ q: q1, x: -d / 2, y: 0 }, { q: q2, x: d / 2, y: 0 }], { view: Math.max(0.2, d * 0.75), show: ['equipotentials'], hide: ['lines', 'test'] }),
        steps: ['Potentials are scalars: add them with their signs, no directions needed.', '$V_1 = (8.99 \\times 10^{9})\\dfrac{' + tx(q1) + ' \\times 10^{-9}}{' + tg(x) + '} = ' + qt(V1, 'V') + '$.',
          '$V_2 = (8.99 \\times 10^{9})\\dfrac{' + tx(q2) + ' \\times 10^{-9}}{' + tg(U.fix(d - x)) + '} = ' + qt(V2, 'V') + '$.', '$V = V_1 + V_2 = ' + qt(Vt, 'V') + '$.'],
        hint: 'Add $kq/r$ for each charge, signs included.', chk: { k: k, q1: q1, q2: q2, d: d, x: x, ans: Vt } };
    }
    if (k === 'energy') {
      var dV = R.pick([50, 100, 250, 500, 1000, 2000, 5000]), part = R.pick(['an electron', 'a proton', 'an alpha particle (charge $+2e$)']), z = /alpha/.test(part) ? 2 : 1, K = z * QE * dV;
      return { q: 'Starting from rest, ' + part + ' is accelerated through a potential difference of $' + qx(dV, 'V') + '$. How much kinetic energy does it gain, in joules? Use ' + etxt + '.', a: ans(K), unit: 'J',
        steps: ['The electric force does work $|q|\\Delta V$, which becomes kinetic energy: $K = |q|\\Delta V$.',
          '$K = (' + (z === 2 ? '2 \\times ' : '') + '1.60 \\times 10^{-19}\\,\\text{C})(' + qx(dV, 'V') + ') = ' + qt(K, 'J') + '$.',
          'In electron volts that is simply $' + (z * dV) + '\\,\\text{eV}$.'],
        hint: 'Kinetic energy gained $= |q|\\Delta V$.', chk: { k: k, V: dV, z: z, ans: K } };
    }
    if (k === 'U') {
      var qu = R.pick([2, 3, 4, 5]) * R.sign(), Vu = R.pick([100, 200, 500, 1200]) * R.sign(), Uu = qu * 1e-6 * Vu;
      return { q: 'A $' + qs(qu) + '$ charge sits at a point where the electric potential is $' + tx(Vu) + '\\,\\text{V}$. What is its electric potential energy? (Include the sign.)', a: ans(Uu), unit: 'J',
        steps: ['Potential is potential energy per coulomb, so $U = qV$.', '$U = (' + tx(qu) + ' \\times 10^{-6}\\,\\text{C})(' + tx(Vu) + '\\,\\text{V}) = ' + qt(Uu, 'J') + '$.'],
        hint: 'Multiply the charge by the potential, keeping both signs.', chk: { k: k, q: qu, V: Vu, ans: Uu } };
    }
    // speed of an electron after acceleration
    var dV2 = R.pick([10, 50, 100, 200, 500, 1000]), v = sqrt(2 * QE * dV2 / ME);
    return { q: 'An electron starts from rest and is accelerated through a potential difference of $' + qx(dV2, 'V') + '$. How fast is it moving then? Use ' + etxt + ' and $m_e = 9.11 \\times 10^{-31}\\,\\text{kg}$.', a: ans(v), unit: 'm/s',
      steps: ['Energy: $\\tfrac{1}{2}mv^2 = e\\Delta V$, so $v = \\sqrt{\\dfrac{2e\\Delta V}{m}}$.',
        '$v = \\sqrt{\\dfrac{2(1.60 \\times 10^{-19})(' + dV2 + ')}{9.11 \\times 10^{-31}}} = ' + qt(v, 'm/s') + '$.'],
      hint: 'Set $\\tfrac{1}{2}mv^2$ equal to $e\\Delta V$.', chk: { k: k, V: dV2, ans: v } };
  });

  G('phys2.equipotentials', function (R, ctx) {
    var k = kind(R, ctx, ['plates', 'voltage', 'along'], ['plates', 'between', 'spacing', 'direction', 'zero'], ['between', 'spacing', 'zero', 'plates']);
    if (k === 'along') {
      var Vq = R.pick([50, 100, 200]), qq = R.pick([2, 3, 5]);
      return { q: 'How much work does the electric field do on a $+' + tg(qq) + '\\,\\mu\\text{C}$ charge moved $5.0\\,\\text{cm}$ along an equipotential line at $' + Vq + '\\,\\text{V}$?', a: exact(0), unit: 'J',
        steps: ['The work done by the field is $W = -q\\Delta V$.', 'Along an equipotential, $V$ does not change, so $\\Delta V = 0$ and $W = 0$.',
          'That is why the field is always perpendicular to equipotentials: moving along one, the force has no component along the motion.'],
        hint: 'What is $\\Delta V$ along an equipotential?', chk: { k: k, ans: 0 } };
    }
    if (k === 'plates' || k === 'voltage') {
      var V = R.pick([6.0, 9.0, 12, 24, 50, 100, 120, 500]), dmm = R.pick([1.0, 2.0, 4.0, 5.0, 10, 20]), E = V / (dmm / 1000);
      if (k === 'voltage') return { q: 'The uniform field between two parallel plates $' + qx(dmm, 'mm') + '$ apart is $' + qt(E, 'V/m') + '$. What is the potential difference between the plates?', a: ans(V), unit: 'V',
        steps: ['In a uniform field, $\\Delta V = Ed$.', '$\\Delta V = (' + qt(E, 'V/m') + ')(' + tn(dmm / 1000, 2) + '\\,\\text{m}) = ' + qt(V, 'V') + '$.'],
        hint: 'Multiply the field by the separation in meters.', chk: { k: k, E: E, d: dmm, ans: V } };
      return { q: 'Two parallel plates $' + qx(dmm, 'mm') + '$ apart are connected to a $' + qx(V, 'V') + '$ battery. What is the size of the uniform electric field between them?', a: ans(E), unit: 'V/m',
        viz: { name: 'ph-efield', opts: { mode: 'plates', V: V, d: dmm / 1000, interactive: false, quiet: true } },
        steps: ['In a uniform field, $E = \\dfrac{\\Delta V}{d}$ (and $1\\,\\text{V/m} = 1\\,\\text{N/C}$).', '$E = \\dfrac{' + qx(V, 'V') + '}{' + tn(dmm / 1000, 2) + '\\,\\text{m}} = ' + qt(E, 'V/m') + '$.',
          'It points from the positive plate toward the negative plate, from high potential to low.'],
        hint: 'Divide the voltage by the separation in meters.', chk: { k: k, V: V, d: dmm, ans: E } };
    }
    if (k === 'between') {
      var V2 = R.pick([12, 24, 60, 100, 120]), d2 = R.pick([2.0, 3.0, 4.0, 6.0]), x = U.fix(R.pick([0.25, 0.5, 0.75]) * d2), Vx = V2 * x / d2;
      return { q: 'Two parallel plates are $' + qx(d2, 'cm') + '$ apart; the negative plate is at $0\\,\\text{V}$ and the positive plate at $' + qx(V2, 'V') + '$. What is the potential at a point $' + tg(x) + '\\,\\text{cm}$ from the negative plate?', a: ans(Vx), unit: 'V',
        steps: ['The field between the plates is uniform: $E = \\dfrac{' + V2 + '\\,\\text{V}}{' + tg(d2 / 100) + '\\,\\text{m}} = ' + qt(V2 / (d2 / 100), 'V/m') + '$.',
          'Moving away from the negative plate, against the field, the potential rises by $Ex$: $V = (' + tn(V2 / (d2 / 100), 3) + ')(' + tg(x / 100) + ') = ' + qt(Vx, 'V') + '$.',
          'The potential climbs in equal steps across the gap: equipotentials are evenly spaced planes parallel to the plates.'],
        hint: 'The potential changes linearly across a uniform field.', chk: { k: k, V: V2, d: d2, x: x, ans: Vx } };
    }
    if (k === 'spacing') {
      var dVs = R.pick([5, 10, 20, 50]), dx = R.pick([0.5, 1.0, 2.0, 4.0]), Es = dVs / (dx / 100);
      return { q: 'Neighboring equipotential lines in a region are drawn every $' + dVs + '\\,\\text{V}$ and are $' + qx(dx, 'cm') + '$ apart. What is the size of the electric field there?', a: ans(Es), unit: 'V/m',
        steps: ['The field\'s size is how fast the potential changes with distance across the equipotentials: $E = \\dfrac{\\Delta V}{\\Delta x}$.',
          '$E = \\dfrac{' + dVs + '\\,\\text{V}}{' + tn(dx / 100, 2) + '\\,\\text{m}} = ' + qt(Es, 'V/m') + '$.', 'Closer equipotentials mean a stronger field; the field points toward the lower values.'],
        hint: 'Divide the potential step by the spacing in meters.', chk: { k: k, dV: dVs, dx: dx, ans: Es } };
    }
    if (k === 'direction') {
      var lo = R.pick([10, 20, 30]), hiLeft = R.coin();
      return { q: 'Vertical equipotential lines are labeled, from left to right, $' + (hiLeft ? (lo + 30) + ', ' + (lo + 20) + ', ' + (lo + 10) + ', ' + lo : lo + ', ' + (lo + 10) + ', ' + (lo + 20) + ', ' + (lo + 30)) + '\\,\\text{V}$. Which way does the electric field point?',
        a: mc(hiLeft ? 'To the right' : 'To the left', [hiLeft ? 'To the left' : 'To the right', 'Up, along the lines', 'Down, along the lines']),
        steps: ['The field is perpendicular to the equipotentials, so it is horizontal here.', 'It points from high potential to low potential.',
          'The potential drops toward the ' + (hiLeft ? 'right' : 'left') + ', so the field points to the ' + (hiLeft ? 'right' : 'left') + '.'],
        hint: 'The field points downhill in potential.', chk: { k: k, v: hiLeft ? 'right' : 'left', ans: 0 } };
    }
    // zero
    return { q: 'A $+3\\,\\text{nC}$ charge and a $-3\\,\\text{nC}$ charge are $0.20\\,\\text{m}$ apart. At the midpoint, the potential is $V = 0$. What is the electric field there?',
      a: mc('It is not zero: it points toward the negative charge.', ['It is zero, because the potential is zero.', 'It is not zero: it points toward the positive charge.', 'It is zero, because the two fields cancel.']),
      viz: ef([{ q: 3, x: -0.1, y: 0 }, { q: -3, x: 0.1, y: 0 }], { show: ['equipotentials', 'lines'], hide: ['test'] }),
      steps: ['$V = k(3)/0.10 + k(-3)/0.10 = 0$: the potentials cancel because they are scalars with opposite signs.',
        'The fields do not cancel: the positive charge\'s field points away from it and the negative charge\'s field points toward itself, so both point toward the negative charge.',
        'The field depends on how the potential <em>changes</em> from point to point, not on its value. Here $V$ is zero but drops steeply toward the negative charge.'],
      hint: 'Field is the slope of the potential, not its value.', chk: { k: k, ans: 0 } };
  });

  G('phys2.capacitors', function (R, ctx) {
    var k = kind(R, ctx, ['Q', 'V', 'concept'], ['Q', 'geometry', 'scale', 'concept'], ['geometry', 'dielectric', 'scale', 'Q']);
    if (k === 'concept') {
      return { q: 'A capacitor is connected first to a $6\\,\\text{V}$ battery, then to a $12\\,\\text{V}$ battery. What happens to its capacitance and to its charge?',
        a: mc('The capacitance stays the same; the charge doubles.', ['The capacitance doubles; the charge stays the same.', 'Both double.', 'The capacitance halves; the charge doubles.']),
        steps: ['Capacitance depends only on the capacitor\'s shape and material: for parallel plates, $C = \\kappa\\varepsilon_0 A/d$.',
          'So $C$ does not change. With $Q = CV$, doubling $V$ doubles $Q$.', 'A capacitor\'s $C$ is like a bucket\'s width: it tells how much charge it holds per volt.'],
        hint: 'Which quantities appear in $\\kappa\\varepsilon_0 A/d$?', chk: { k: k, ans: 0 } };
    }
    if (k === 'Q') {
      var C = R.pick([2.2, 4.7, 10, 22, 47, 100, 220]), V = R.pick([1.5, 3.0, 5.0, 6.0, 9.0, 12]), Q = C * V;
      return { q: 'A $' + qx(C, 'uF') + '$ capacitor is connected to a $' + qx(V, 'V') + '$ battery. How much charge is stored on its plates, in microcoulombs?', a: ans(Q), unit: 'μC',
        viz: { name: 'ph-circuit', opts: { circuit: 'V(' + V + ') series(C1:' + C + ')', interactive: false, quiet: true, height: 175 } },
        steps: ['$Q = CV$: each volt across the capacitor holds $C$ coulombs.', '$Q = (' + tg(C) + ' \\times 10^{-6}\\,\\text{F})(' + qx(V, 'V') + ') = ' + qt(Q * 1e-6, 'C') + ' = ' + qt(Q, 'uC') + '$.',
          'The plates hold $+Q$ and $-Q$; the capacitor as a whole stays neutral.'],
        hint: 'Multiply the capacitance by the voltage.', chk: { k: k, C: C, V: V, ans: Q } };
    }
    if (k === 'V') {
      var C2 = R.pick([2.0, 5.0, 10, 20, 50]), V2 = R.pick([3.0, 4.0, 6.0, 8.0, 12, 15]), Q2 = C2 * V2;
      return { q: 'A $' + qx(C2, 'uF') + '$ capacitor holds a charge of $' + qx(Q2, 'uC') + '$. What is the voltage across it?', a: ans(V2), unit: 'V',
        steps: ['$C = Q/V$, so $V = Q/C$.', '$V = \\dfrac{' + qx(Q2, 'uC') + '}{' + qx(C2, 'uF') + '} = ' + qt(V2, 'V') + '$ (the micro prefixes cancel).'],
        hint: 'Solve $Q = CV$ for $V$.', chk: { k: k, C: C2, Q: Q2, ans: V2 } };
    }
    if (k === 'geometry') {
      var A = R.pick([0.010, 0.020, 0.050, 0.10, 0.25]), dmm = R.pick([0.50, 1.0, 2.0, 5.0]), kap = R.pick([1, 1, 2.1, 3.4, 5.0]), Cp = kap * EPS0 * A / (dmm / 1000) * 1e12;
      return { q: 'A parallel-plate capacitor has plates of area $' + qx(A, 'm2') + '$ separated by $' + qx(dmm, 'mm') + '$ of ' + (kap === 1 ? 'air ($\\kappa = 1$)' : 'a material with dielectric constant $\\kappa = ' + tx(kap) + '$') + '. What is its capacitance, in picofarads? Use $\\varepsilon_0 = 8.85 \\times 10^{-12}\\,\\text{F/m}$.', a: ans(Cp), unit: 'pF',
        viz: { name: 'ph-efield', opts: { mode: 'capacitor', A: A, d: dmm / 1000, kappa: kap, inserted: kap > 1, interactive: false, quiet: true } },
        steps: ['$C = \\dfrac{\\kappa\\varepsilon_0 A}{d}$, with $d = ' + tn(dmm / 1000, 2) + '\\,\\text{m}$.',
          '$C = \\dfrac{(' + tx(kap) + ')(8.85 \\times 10^{-12})(' + tg(A) + ')}{' + tn(dmm / 1000, 2) + '} = ' + qt(Cp * 1e-12, 'F') + ' = ' + qt(Cp, 'pF') + '$.'],
        hint: 'Use $C = \\kappa\\varepsilon_0 A/d$ with the gap in meters.', chk: { k: k, A: A, d: dmm, kap: kap, ans: Cp } };
    }
    if (k === 'scale') {
      var C0 = R.pick([10, 20, 30, 40, 60]), fd = R.pick([2, 0.5, 1]), fA = R.pick([1, 2, 3]), fk = R.pick([1, 2, 4]);
      if (fd === 1 && fA === 1 && fk === 1) fk = 3;
      var Cn = C0 * fA * fk / fd, ch = [];
      if (fA !== 1) ch.push('the plate area is made ' + (fA === 2 ? 'twice' : 'three times') + ' as large');
      if (fd !== 1) ch.push('the gap is ' + (fd === 2 ? 'doubled' : 'halved'));
      if (fk !== 1) ch.push('the gap is filled with a dielectric of $\\kappa = ' + fk + '$');
      return { q: 'An air-filled parallel-plate capacitor has $C = ' + qx(C0, 'pF') + '$. If ' + U.list(ch) + ', what is the new capacitance?', a: ans(Cn), unit: 'pF',
        steps: ['$C = \\dfrac{\\kappa\\varepsilon_0 A}{d}$: $C$ is proportional to $\\kappa$ and to $A$, and inversely proportional to $d$.',
          'Factor: $\\dfrac{' + fk + ' \\times ' + fA + '}{' + tx(fd) + '} = ' + tx(fk * fA / fd) + '$.', '$C = ' + C0 + ' \\times ' + tx(fk * fA / fd) + ' = ' + qt(Cn, 'pF') + '$.'],
        hint: 'Which factors are on top of $\\kappa\\varepsilon_0A/d$, and which on the bottom?', chk: { k: k, C0: C0, fd: fd, fA: fA, fk: fk, ans: Cn } };
    }
    // dielectric inserted with the battery connected
    var C3 = R.pick([5.0, 10, 20]), V3 = R.pick([6.0, 9.0, 12]), k3 = R.pick([2, 3, 4, 5]), Qn = k3 * C3 * V3;
    return { q: 'A $' + qx(C3, 'uF') + '$ air capacitor stays connected to a $' + qx(V3, 'V') + '$ battery while a slab with dielectric constant $' + k3 + '$ is slid in to fill the gap. What is the charge on the capacitor afterward, in microcoulombs?', a: ans(Qn), unit: 'μC',
      viz: { name: 'ph-efield', opts: { mode: 'capacitor', kappa: k3, inserted: true, battery: true, V: V3, interactive: false, quiet: true } },
      steps: ['The dielectric multiplies the capacitance: $C = \\kappa C_0 = ' + k3 + ' \\times ' + qx(C3, 'uF') + ' = ' + qt(k3 * C3, 'uF') + '$.',
        'The battery holds the voltage at $' + qx(V3, 'V') + '$, so more charge flows on: $Q = CV = (' + tn(k3 * C3, 3) + '\\,\\mu\\text{F})(' + tg(V3) + '\\,\\text{V}) = ' + qt(Qn, 'uC') + '$.',
        'Before, it held $' + qt(C3 * V3, 'uC') + '$; the charge grew by the factor $\\kappa$.'],
      hint: 'With the battery connected, $V$ stays fixed while $C$ changes.', chk: { k: k, C: C3, V: V3, kap: k3, ans: Qn } };
  });

  G('phys2.capacitor-energy', function (R, ctx) {
    var k = kind(R, ctx, ['CV', 'QV', 'concept'], ['CV', 'QC', 'scale', 'concept'], ['V', 'flash', 'QC', 'scale']);
    if (k === 'concept') {
      return { q: 'A capacitor ends up with charge $Q$ at voltage $V$. Why is the stored energy $\\tfrac{1}{2}QV$ rather than $QV$?',
        a: mc('The voltage grows from 0 to V as it charges, so on average each bit of charge is moved through V/2.', ['Half the energy leaks out of the plates as heat.', 'Only one of the two plates stores energy.', 'The battery gives each charge only half its voltage.']),
        viz: { name: 'ph-graph', opts: { pts: [[0, 0], [6, 12]], domain: [0, 7], range: [0, 14], xlab: 'charge q', xunit: 'μC', ylab: 'voltage V', yunit: 'V', tool: 'area', a: 0, b: 6, interactive: false } },
        steps: ['Moving a small charge $\\Delta q$ onto the capacitor when its voltage is $v$ takes work $v\\,\\Delta q$.',
          'At first $v = 0$, so the first charges cost nothing; the last charges cost nearly $V$ each. The voltage rises in a straight line, $v = q/C$.',
          'The total work is the area under the $v$–$q$ line, a triangle: $\\tfrac{1}{2}QV$. (The battery does supply $QV$; the other half is lost as heat in the wires while the current flows.)'],
        hint: 'Is the voltage $V$ the whole time the capacitor charges?', chk: { k: k, ans: 0 } };
    }
    if (k === 'CV') {
      var C = R.pick([10, 47, 100, 220, 470, 1000]), V = R.pick([3.0, 5.0, 6.0, 9.0, 12, 24]), Uj = 0.5 * C * 1e-6 * V * V;
      return { q: 'How much energy does a $' + qx(C, 'uF') + '$ capacitor store when it is charged to $' + qx(V, 'V') + '$? Give the answer in millijoules.', a: ans(Uj * 1000), unit: 'mJ',
        steps: ['$U = \\tfrac{1}{2}CV^2$.', '$U = \\tfrac{1}{2}(' + tx(C) + ' \\times 10^{-6}\\,\\text{F})(' + tg(V) + '\\,\\text{V})^2 = ' + qt(Uj, 'J') + ' = ' + qt(Uj * 1000, 'mJ') + '$.'],
        hint: 'Use $U = \\tfrac{1}{2}CV^2$ with $C$ in farads.', chk: { k: k, C: C, V: V, ans: Uj * 1000 } };
    }
    if (k === 'QV') {
      var Q = R.pick([10, 20, 30, 50, 60, 120]), V2 = R.pick([5.0, 10, 20, 50, 100]), U2 = 0.5 * Q * 1e-6 * V2;
      return { q: 'A capacitor holds $' + qx(Q, 'uC') + '$ of charge at $' + qx(V2, 'V') + '$. How much energy is stored, in millijoules?', a: ans(U2 * 1000), unit: 'mJ',
        viz: { name: 'ph-graph', opts: { pts: [[0, 0], [Q, V2]], domain: [0, Q * 1.15], range: [0, V2 * 1.2], xlab: 'charge q', xunit: 'μC', ylab: 'voltage V', yunit: 'V', tool: 'area', a: 0, b: Q, interactive: false, quiet: true } },
        steps: ['The stored energy is the area under the $V$–$q$ line, a triangle: $U = \\tfrac{1}{2}QV$.', '$U = \\tfrac{1}{2}(' + Q + ' \\times 10^{-6}\\,\\text{C})(' + tg(V2) + '\\,\\text{V}) = ' + qt(U2, 'J') + ' = ' + qt(U2 * 1000, 'mJ') + '$.'],
        hint: 'Half of charge times voltage.', chk: { k: k, Q: Q, V: V2, ans: U2 * 1000 } };
    }
    if (k === 'QC') {
      var Q3 = R.pick([20, 50, 100, 200, 300]), C3 = R.pick([2.0, 5.0, 10, 25, 50]), U3 = Math.pow(Q3 * 1e-6, 2) / (2 * C3 * 1e-6);
      return { q: 'A $' + qx(C3, 'uF') + '$ capacitor carries $' + qx(Q3, 'uC') + '$ of charge. How much energy does it store, in millijoules?', a: ans(U3 * 1000), unit: 'mJ',
        steps: ['With $Q$ and $C$ known, use $U = \\dfrac{Q^2}{2C}$ (from $U = \\tfrac{1}{2}QV$ with $V = Q/C$).',
          '$U = \\dfrac{(' + Q3 + ' \\times 10^{-6})^2}{2(' + tg(C3) + ' \\times 10^{-6})} = ' + qt(U3, 'J') + ' = ' + qt(U3 * 1000, 'mJ') + '$.'],
        hint: 'Use $Q^2/(2C)$.', chk: { k: k, Q: Q3, C: C3, ans: U3 * 1000 } };
    }
    if (k === 'scale') {
      var U0 = R.pick([2.0, 5.0, 8.0, 12, 20]), f = R.pick([2, 3, 0.5]), Un = U0 * f * f;
      return { q: 'A capacitor stores $' + qx(U0, 'mJ') + '$ when charged to some voltage. How much energy does it store if the voltage is ' + (f === 2 ? 'doubled' : f === 3 ? 'tripled' : 'halved') + '?', a: ans(Un), unit: 'mJ',
        steps: ['$U = \\tfrac{1}{2}CV^2$ with $C$ fixed, so $U$ grows as $V^2$.', 'The voltage changes by $' + tx(f) + '$, so the energy changes by $' + tx(f) + '^2 = ' + tx(f * f) + '$.', '$U = ' + qx(U0, 'mJ') + ' \\times ' + tx(f * f) + ' = ' + qt(Un, 'mJ') + '$.'],
        hint: 'Energy goes as the square of the voltage.', chk: { k: k, U0: U0, f: f, ans: Un } };
    }
    if (k === 'V') {
      var C4 = R.pick([100, 200, 500, 1000]), U4 = R.pick([0.10, 0.25, 0.50, 1.0, 2.0]), V4 = sqrt(2 * U4 / (C4 * 1e-6));
      return { q: 'To what voltage must a $' + qx(C4, 'uF') + '$ capacitor be charged to store $' + qx(U4, 'J') + '$?', a: ans(V4), unit: 'V',
        steps: ['$U = \\tfrac{1}{2}CV^2$, so $V = \\sqrt{\\dfrac{2U}{C}}$.', '$V = \\sqrt{\\dfrac{2(' + tg(U4) + ')}{' + tx(C4) + ' \\times 10^{-6}}} = ' + qt(V4, 'V') + '$.'],
        hint: 'Solve $U = \\tfrac{1}{2}CV^2$ for $V$.', chk: { k: k, C: C4, U: U4, ans: V4 } };
    }
    // flash: energy then average power over a short discharge
    var C5 = R.pick([100, 150, 200, 330]), V5 = R.pick([200, 300, 330]), tms = R.pick([1.0, 2.0, 5.0]), U5 = 0.5 * C5 * 1e-6 * V5 * V5, P5 = U5 / (tms / 1000);
    return { q: 'A camera flash charges a $' + qx(C5, 'uF') + '$ capacitor to $' + qx(V5, 'V') + '$ and then releases all its energy in $' + qx(tms, 'ms') + '$. What is the average power of the flash?', a: ans(P5), unit: 'W',
      steps: ['Energy stored: $U = \\tfrac{1}{2}CV^2 = \\tfrac{1}{2}(' + tx(C5) + ' \\times 10^{-6})(' + V5 + ')^2 = ' + qt(U5, 'J') + '$.',
        'Average power: $P = \\dfrac{U}{t} = \\dfrac{' + tn(U5, 3) + '\\,\\text{J}}{' + tn(tms / 1000, 2) + '\\,\\text{s}} = ' + qt(P5, 'W') + '$.', 'A capacitor can release its energy far faster than a battery can.'],
      hint: 'Find the stored energy, then divide by the time.', chk: { k: k, C: C5, V: V5, t: tms, ans: P5 } };
  });

  // ================================================================ UNIT 4: ELECTRIC CIRCUITS
  function cv(sh, o) { var op = { circuit: sh, interactive: false, quiet: true }; if (o) for (var z in o) op[z] = o[z]; if (op.mode !== 'transient') op.height = op.height || (/par\(/.test(sh) ? 215 : 175); return { name: 'ph-circuit', opts: op }; }
  function ohm(x) { return tg(x) + '\\,\\Omega'; }
  function par2(a, b) { return a * b / (a + b); }
  var PAIRS = [[3, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [6, 3], [12, 4], [8, 8], [5, 20], [30, 60], [10, 40]];
  var SUB = ['₁', '₂', '₃', '₄'];

  G('phys2.current', function (R, ctx) {
    var k = kind(R, ctx, ['I', 'Q', 'concept'], ['I', 'Q', 'electrons', 'time', 'concept', 'direction'], ['electrons', 'time', 'Q', 'I']);
    if (k === 'concept') {
      var I = R.pick([0.20, 0.25, 0.50, 0.75, 1.5]);
      return { q: 'A current of $' + qx(I, 'A') + '$ flows into a light bulb. How much current flows out of the bulb on the other side?', a: ans(I, { rtol: 0.001 }), unit: 'A',
        viz: cv('V(6) series(B1:12)', { show: ['current'] }),
        steps: ['Charge is conserved, and in a steady current it does not pile up anywhere: every coulomb that enters the bulb each second leaves it.',
          'So the current out equals the current in: $' + qx(I, 'A') + '$.',
          'The bulb uses up <em>energy</em> (the charges leave at a lower potential), not charge.'],
        hint: 'Can charge pile up inside the bulb?', chk: { k: k, I: I, ans: I } };
    }
    if (k === 'direction') {
      var left = R.coin();
      return { q: 'In a copper wire, the free electrons drift to the ' + (left ? 'left' : 'right') + '. Which way does the conventional current point?',
        a: mc(left ? 'To the right' : 'To the left', [left ? 'To the left' : 'To the right', 'There is no current, because electrons are negative', 'Both ways at once']),
        steps: ['Conventional current is defined as the direction positive charge would flow.', 'Electrons are negative, so moving them one way is the same as moving positive charge the other way.',
          'The current points opposite the electrons\' drift: to the ' + (left ? 'right' : 'left') + '.'],
        hint: 'Conventional current follows positive charge.', chk: { k: k, v: left ? 'right' : 'left', ans: 0 } };
    }
    if (k === 'I') {
      var Q = R.pick([3.0, 6.0, 12, 15, 30, 45, 90]), t = R.pick([1.5, 2.0, 3.0, 5.0, 10, 30]), I2 = Q / t;
      return { q: '$' + qx(Q, 'C') + '$ of charge passes a point in a wire in $' + qx(t, 's') + '$. What is the current?', a: ans(I2), unit: 'A',
        steps: ['Current is the charge per second: $I = \\dfrac{\\Delta Q}{\\Delta t}$.', '$I = \\dfrac{' + qx(Q, 'C') + '}{' + qx(t, 's') + '} = ' + qt(I2, 'A') + '$ ($1\\,\\text{A} = 1\\,\\text{C/s}$).'],
        hint: 'Divide the charge by the time.', chk: { k: k, Q: Q, t: t, ans: I2 } };
    }
    if (k === 'Q') {
      var I3 = R.pick([0.20, 0.50, 1.5, 2.0, 3.0]), mins = R.pick([1, 2, 5, 10, 30]), Q3 = I3 * mins * 60;
      return { q: 'A phone charger delivers a steady $' + qx(I3, 'A') + '$ for ' + U.plural(mins, 'minute') + '. How much charge flows?', a: ans(Q3), unit: 'C',
        steps: ['$\\Delta Q = I\\,\\Delta t$, with the time in seconds: $' + mins + ' \\times 60 = ' + (mins * 60) + '\\,\\text{s}$.', '$\\Delta Q = (' + qx(I3, 'A') + ')(' + (mins * 60) + '\\,\\text{s}) = ' + qt(Q3, 'C') + '$.'],
        hint: 'Convert minutes to seconds, then multiply by the current.', chk: { k: k, I: I3, t: mins, ans: Q3 } };
    }
    if (k === 'electrons') {
      var I4 = R.pick([0.10, 0.50, 1.0, 2.0, 4.0]), t4 = R.pick([1.0, 2.0, 10, 60]), N = I4 * t4 / QE;
      return { q: 'A current of $' + qx(I4, 'A') + '$ flows for $' + qx(t4, 's') + '$. How many electrons pass any point in the wire? Use ' + etxt + '.', a: ans(N), unit: 'electrons',
        steps: ['Charge: $\\Delta Q = I\\,\\Delta t = (' + tg(I4) + ')(' + tg(t4) + ') = ' + qt(I4 * t4, 'C') + '$.', 'Electrons: $N = \\dfrac{\\Delta Q}{e} = \\dfrac{' + tn(I4 * t4, 3) + '}{1.60 \\times 10^{-19}} = ' + tn(N, 3) + '$.'],
        hint: 'Find the charge, then divide by the charge of one electron.', chk: { k: k, I: I4, t: t4, ans: N } };
    }
    // time
    var Q5 = R.pick([60, 120, 300, 600, 1800, 3600]), I5 = R.pick([0.50, 1.0, 2.0, 5.0]), t5 = Q5 / I5;
    return { q: 'How long does it take a current of $' + qx(I5, 'A') + '$ to move $' + qx(Q5, 'C') + '$ of charge?', a: ans(t5), unit: 's',
      steps: ['$I = \\dfrac{\\Delta Q}{\\Delta t}$, so $\\Delta t = \\dfrac{\\Delta Q}{I}$.', '$\\Delta t = \\dfrac{' + qx(Q5, 'C') + '}{' + qx(I5, 'A') + '} = ' + qt(t5, 's') + '$.'],
      hint: 'Divide the charge by the current.', chk: { k: k, Q: Q5, I: I5, ans: t5 } };
  });

  var RHO = [{ n: 'copper', r: 1.68e-8 }, { n: 'aluminum', r: 2.65e-8 }, { n: 'tungsten', r: 5.6e-8 }, { n: 'nichrome', r: 1.10e-6 }];
  G('phys2.resistivity', function (R, ctx) {
    var k = kind(R, ctx, ['R', 'scale', 'concept'], ['R', 'diam', 'scale', 'concept'], ['diam', 'length', 'stretch', 'scale']);
    if (k === 'concept') {
      return { q: 'Two copper wires have the same length. Wire A is thick and wire B is thin. Which has more resistance?',
        a: mc('Wire B, the thin one: charges have a narrower path.', ['Wire A, the thick one: it has more metal in the way.', 'They are equal, because they are the same metal and length.', 'Wire A, because thick wires carry more current.']),
        steps: ['$R = \\rho\\dfrac{L}{A}$: resistance is inversely proportional to the cross-sectional area.',
          'A thick wire is like many thin wires side by side, giving the charges more paths at once, so its resistance is smaller.',
          'So the thin wire B has more resistance.'],
        hint: 'Is $A$ on the top or the bottom of $\\rho L/A$?', chk: { k: k, ans: 0 } };
    }
    if (k === 'R') {
      var M = R.pick(RHO), L = R.pick([2.0, 5.0, 10, 20, 50]), Amm = R.pick([0.50, 1.0, 1.5, 2.5]), Rr = M.r * L / (Amm * 1e-6);
      return { q: (M.n === 'aluminum' ? 'An ' : 'A ') + M.n + ' wire ($\\rho = ' + tn(M.r, 3) + '\\,' + UT['Ohm m'] + '$) is $' + qx(L, 'm') + '$ long with a cross-sectional area of $' + qx(Amm, 'mm') + '^2$. What is its resistance?', a: ans(Rr), unit: 'Ω',
        steps: ['$R = \\rho\\dfrac{L}{A}$, with $A = ' + tg(Amm) + '\\,\\text{mm}^2 = ' + tn(Amm * 1e-6, 2) + '\\,\\text{m}^2$ ($1\\,\\text{mm}^2 = 10^{-6}\\,\\text{m}^2$).',
          '$R = (' + tn(M.r, 3) + ')\\dfrac{' + tg(L) + '}{' + tn(Amm * 1e-6, 2) + '} = ' + qt(Rr, 'Ohm') + '$.'],
        hint: 'Convert square millimeters to square meters first.', chk: { k: k, rho: M.r, L: L, A: Amm, ans: Rr } };
    }
    if (k === 'diam') {
      var M2 = R.pick(RHO), L2 = R.pick([1.0, 2.0, 10, 25]), dmm = R.pick([0.20, 0.50, 1.0, 2.0]), A2 = PI * Math.pow(dmm / 2000, 2), R2 = M2.r * L2 / A2;
      return { q: (M2.n === 'aluminum' ? 'An ' : 'A ') + M2.n + ' wire ($\\rho = ' + tn(M2.r, 3) + '\\,' + UT['Ohm m'] + '$) is $' + qx(L2, 'm') + '$ long and $' + qx(dmm, 'mm') + '$ in diameter. What is its resistance?', a: ans(R2), unit: 'Ω',
        steps: ['Cross-section: $A = \\pi r^2 = \\pi(' + tn(dmm / 2000, 2) + '\\,\\text{m})^2 = ' + qt(A2, 'm2') + '$ (the radius is half the diameter).',
          '$R = \\rho\\dfrac{L}{A} = (' + tn(M2.r, 3) + ')\\dfrac{' + tg(L2) + '}{' + tn(A2, 3) + '} = ' + qt(R2, 'Ohm') + '$.'],
        hint: 'Find the area from the radius, which is half the diameter.', chk: { k: k, rho: M2.r, L: L2, d: dmm, ans: R2 } };
    }
    if (k === 'scale') {
      var R0 = R.pick([2.0, 4.0, 6.0, 8.0, 12]), fL = R.pick([1, 2, 3]), fd = R.pick([1, 2, 0.5]);
      if (fL === 1 && fd === 1) fd = 2;
      var Rn = R0 * fL / (fd * fd), ch = [];
      if (fL !== 1) ch.push((fL === 2 ? 'twice' : 'three times') + ' as long');
      if (fd !== 1) ch.push((fd === 2 ? 'twice' : 'half') + ' the diameter');
      return { q: 'A wire has a resistance of $' + ohm(R0) + '$. A second wire of the same metal is ' + ch.join(' with ') + '. What is its resistance?', a: ans(Rn), unit: 'Ω',
        steps: ['$R = \\rho L/A$, and the area of a round wire goes as its diameter squared.',
          (fL !== 1 ? 'Length factor $' + fL + '$ multiplies $R$ by $' + fL + '$. ' : '') + (fd !== 1 ? 'Diameter factor $' + tx(fd) + '$ multiplies the area by $' + tx(fd * fd) + '$, which divides $R$ by $' + tx(fd * fd) + '$.' : ''),
          '$R = ' + ohm(R0) + ' \\times \\dfrac{' + fL + '}{' + tx(fd * fd) + '} = ' + qt(Rn, 'Ohm') + '$.'],
        hint: 'Longer means more resistance; thicker means less, by the square of the diameter.', chk: { k: k, R0: R0, fL: fL, fd: fd, ans: Rn } };
    }
    if (k === 'length') {
      var Rt = R.pick([5.0, 10, 20, 24, 50]), dm = R.pick([0.30, 0.40, 0.50]), A3 = PI * Math.pow(dm / 2000, 2), L3 = Rt * A3 / 1.10e-6;
      return { q: 'A heater element needs $' + ohm(Rt) + '$ of resistance. What length of nichrome wire ($\\rho = 1.10 \\times 10^{-6}\\,' + UT['Ohm m'] + '$) with a diameter of $' + qx(dm, 'mm') + '$ is needed?', a: ans(L3), unit: 'm',
        steps: ['Area: $A = \\pi(' + tn(dm / 2000, 2) + '\\,\\text{m})^2 = ' + qt(A3, 'm2') + '$.', 'Solve $R = \\rho L/A$ for $L$: $L = \\dfrac{RA}{\\rho} = \\dfrac{(' + tg(Rt) + ')(' + tn(A3, 3) + ')}{1.10 \\times 10^{-6}} = ' + qt(L3, 'm') + '$.'],
        hint: 'Rearrange $R = \\rho L/A$ for $L$.', chk: { k: k, R: Rt, d: dm, ans: L3 } };
    }
    // stretch: same volume, twice the length
    var R4 = R.pick([2.0, 3.0, 5.0, 8.0]), f = R.pick([2, 3]), R5 = R4 * f * f;
    return { q: 'A $' + ohm(R4) + '$ wire is drawn out (stretched) to ' + (f === 2 ? 'twice' : 'three times') + ' its length. Its volume stays the same. What is its new resistance?', a: ans(R5), unit: 'Ω',
      steps: ['Same volume, $V = AL$: if $L$ grows by ' + f + ', the area must shrink by ' + f + '.', '$R = \\rho L/A$: the longer length multiplies $R$ by ' + f + ' and the smaller area multiplies it by ' + f + ' again.',
        '$R = ' + ohm(R4) + ' \\times ' + (f * f) + ' = ' + qt(R5, 'Ohm') + '$.'],
      hint: 'Both $L$ and $A$ change.', chk: { k: k, R0: R4, f: f, ans: R5 } };
  });

  G('phys2.resistor-power', function (R, ctx) {
    var k = kind(R, ctx, ['IR', 'VR', 'IV'], ['VR', 'rating', 'energy', 'compare'], ['compare', 'rating', 'energy', 'IR']);
    if (k === 'compare') {
      var r1 = R.pick([2, 3, 4]), r2 = r1 * R.pick([2, 3]), ser = R.coin(), V = R.pick([6, 12, 24]);
      return { q: 'A $' + ohm(r1) + '$ resistor and a $' + ohm(r2) + '$ resistor are connected in ' + (ser ? 'series' : 'parallel') + ' to a $' + qx(V, 'V') + '$ battery. Which resistor turns more electrical energy into heat each second?',
        a: mc(ser ? 'The ' + tg(r2) + ' Ω resistor' : 'The ' + tg(r1) + ' Ω resistor', [ser ? 'The ' + tg(r1) + ' Ω resistor' : 'The ' + tg(r2) + ' Ω resistor', 'Both the same', 'Neither: resistors in a circuit do not use power']),
        viz: cv('V(' + V + ') ' + (ser ? 'series(R1:' + r1 + ', R2:' + r2 + ')' : 'par(R1:' + r1 + ', R2:' + r2 + ')')),
        steps: ser ? ['In series the same current flows through both, so compare with $P = I^2R$.', 'Same $I$, bigger $R$, more power: the $' + ohm(r2) + '$ resistor. ($I = ' + tn(V / (r1 + r2), 3) + '\\,\\text{A}$, so $P_1 = ' + qt(Math.pow(V / (r1 + r2), 2) * r1, 'W') + '$ and $P_2 = ' + qt(Math.pow(V / (r1 + r2), 2) * r2, 'W') + '$.)']
          : ['In parallel both resistors have the same voltage, so compare with $P = V^2/R$.', 'Same $V$, smaller $R$, more power: the $' + ohm(r1) + '$ resistor. ($P_1 = ' + V + '^2/' + r1 + ' = ' + qt(V * V / r1, 'W') + '$, $P_2 = ' + V + '^2/' + r2 + ' = ' + qt(V * V / r2, 'W') + '$.)'],
        hint: ser ? 'What is the same for both resistors in series?' : 'What is the same for both resistors in parallel?', chk: { k: k, ser: ser ? 1 : 0, r1: r1, r2: r2, ans: 0 } };
    }
    if (k === 'IR') {
      var I = R.pick([0.50, 1.5, 2.0, 2.5, 3.0]), Rr = R.pick([4.0, 8.0, 10, 20, 50]), P = I * I * Rr;
      return { q: 'A current of $' + qx(I, 'A') + '$ flows through a $' + ohm(Rr) + '$ resistor. At what rate does it turn electrical energy into heat?', a: ans(P), unit: 'W',
        steps: ['$P = IV$ and $V = IR$, so $P = I^2R$.', '$P = (' + qx(I, 'A') + ')^2(' + ohm(Rr) + ') = ' + qt(P, 'W') + '$.'],
        hint: 'Use $P = I^2R$.', chk: { k: k, I: I, R: Rr, ans: P } };
    }
    if (k === 'VR') {
      var V2 = R.pick([6.0, 9.0, 12, 24, 120]), R2 = R.pick([3.0, 6.0, 12, 24, 48, 240]), P2 = V2 * V2 / R2;
      return { q: 'A $' + ohm(R2) + '$ resistor is connected across $' + qx(V2, 'V') + '$. How much power does it use?', a: ans(P2), unit: 'W',
        steps: ['$P = IV$ and $I = V/R$, so $P = \\dfrac{V^2}{R}$.', '$P = \\dfrac{(' + tg(V2) + ')^2}{' + tg(R2) + '} = ' + qt(P2, 'W') + '$.'],
        hint: 'Use $P = V^2/R$.', chk: { k: k, V: V2, R: R2, ans: P2 } };
    }
    if (k === 'IV') {
      var I3 = R.pick([0.25, 0.50, 1.2, 2.0]), V3 = R.pick([3.0, 6.0, 12, 120]), P3 = I3 * V3;
      return { q: 'A device draws $' + qx(I3, 'A') + '$ from a $' + qx(V3, 'V') + '$ supply. How much power does it use?', a: ans(P3), unit: 'W',
        steps: ['Each coulomb gives up $V$ joules, and $I$ coulombs pass each second, so $P = IV$.', '$P = (' + qx(I3, 'A') + ')(' + qx(V3, 'V') + ') = ' + qt(P3, 'W') + '$.'],
        hint: 'Power is current times voltage.', chk: { k: k, I: I3, V: V3, ans: P3 } };
    }
    if (k === 'rating') {
      var Pw = R.pick([40, 60, 100, 600, 1200, 1500]), Vr = 120, ask = R.pick(['I', 'R']), Ir = Pw / Vr, Rr2 = Vr * Vr / Pw;
      return { q: 'A ' + (Pw >= 600 ? 'heater' : 'lamp') + ' is rated $' + qx(Pw, 'W') + '$ at $' + qx(Vr, 'V') + '$. ' + (ask === 'I' ? 'What current does it draw?' : 'What is its resistance when operating?'), a: ans(ask === 'I' ? Ir : Rr2), unit: ask === 'I' ? 'A' : 'Ω',
        steps: ask === 'I' ? ['$P = IV$, so $I = \\dfrac{P}{V} = \\dfrac{' + Pw + '}{' + Vr + '} = ' + qt(Ir, 'A') + '$.'] : ['$P = \\dfrac{V^2}{R}$, so $R = \\dfrac{V^2}{P} = \\dfrac{' + Vr + '^2}{' + Pw + '} = ' + qt(Rr2, 'Ohm') + '$.', 'A higher-power device at the same voltage has a <em>smaller</em> resistance.'],
        hint: ask === 'I' ? 'Use $P = IV$.' : 'Use $P = V^2/R$.', chk: { k: k, P: Pw, V: Vr, ask: ask === 'I' ? 1 : 0, ans: ask === 'I' ? Ir : Rr2 } };
    }
    // energy in kWh
    var Pk = R.pick([60, 100, 500, 1000, 1500, 2000]), h = R.pick([2, 3, 5, 8, 10]), E = Pk * h / 1000;
    return { q: 'A $' + qx(Pk, 'W') + '$ appliance runs for ' + U.plural(h, 'hour') + '. How much energy does it use, in kilowatt-hours?', a: ans(E, { rtol: 0.005 }), unit: 'kWh',
      steps: ['Energy is power times time. In kilowatts and hours: $P = ' + tx(Pk / 1000) + '\\,\\text{kW}$.', '$E = (' + tx(Pk / 1000) + '\\,\\text{kW})(' + h + '\\,\\text{h}) = ' + qt(E, 'kWh') + '$.',
        'In joules: $1\\,\\text{kWh} = 3.6 \\times 10^{6}\\,\\text{J}$, so this is $' + tn(E * 3.6e6, 3) + '\\,\\text{J}$.'],
      hint: 'Convert watts to kilowatts, then multiply by hours.', chk: { k: k, P: Pk, h: h, ans: E } };
  });

  G('phys2.series-resistors', function (R, ctx) {
    var k = kind(R, ctx, ['Req', 'I', 'concept'], ['I', 'Vone', 'divider', 'concept'], ['unknown', 'Vone', 'divider', 'I']);
    var rs = R.pick([[2, 4, 6], [1, 3, 8], [5, 10, 15], [2, 3, 7], [4, 4, 4], [10, 20, 30], [3, 6, 9]]), Req = rs[0] + rs[1] + rs[2], V = R.pick([6, 12, 24, 36]);
    var sh = 'V(' + V + ') series(R1:' + rs[0] + ', R2:' + rs[1] + ', R3:' + rs[2] + ')', desc = '$R_1 = ' + ohm(rs[0]) + '$, $R_2 = ' + ohm(rs[1]) + '$ and $R_3 = ' + ohm(rs[2]) + '$';
    if (k === 'concept') {
      return { q: 'Three resistors, ' + desc + ', are in series with a battery. Compare the current through $R_1$ (first after the battery) with the current through $R_3$ (last).',
        a: mc('They are the same.', ['The current through $R_3$ is smaller: each resistor uses some up.', 'The current through $R_3$ is larger: it is closest to the negative terminal.', 'The current through $R_1$ is larger, by the ratio of the resistances.']),
        viz: cv(sh, { show: ['current'] }),
        steps: ['In series there is only one path, so every charge passes through every resistor.', 'Charge does not pile up or vanish, so the current is the same everywhere in the loop.', 'What each resistor takes is energy: the potential drops across each one, $V_i = IR_i$.'],
        hint: 'How many paths are there for the charge?', chk: { k: k, ans: 0 } };
    }
    if (k === 'Req') return { q: 'What is the equivalent resistance of ' + desc + ' connected in series?', a: ans(Req, { rtol: 0.001 }), unit: 'Ω', viz: cv(sh),
      steps: ['In series the same current passes through each resistor and the voltages add: $V = IR_1 + IR_2 + IR_3 = I(R_1 + R_2 + R_3)$.', 'So $R_{\\text{eq}} = ' + rs[0] + ' + ' + rs[1] + ' + ' + rs[2] + ' = ' + ohm(Req) + '$.'],
      hint: 'Series resistances add.', chk: { k: k, r1: rs[0], r2: rs[1], r3: rs[2], ans: Req } };
    if (k === 'I') { var I = V / Req; return { q: 'A $' + qx(V, 'V') + '$ battery is connected to ' + desc + ' in series. What current flows?', a: ans(I), unit: 'A', viz: cv(sh),
      steps: ['$R_{\\text{eq}} = ' + rs.join(' + ') + ' = ' + ohm(Req) + '$.', 'Ohm\'s law for the whole circuit: $I = \\dfrac{V}{R_{\\text{eq}}} = \\dfrac{' + V + '}{' + Req + '} = ' + qt(I, 'A') + '$, the same through every resistor.'],
      hint: 'Add the resistances, then use $I = V/R$.', chk: { k: k, V: V, r1: rs[0], r2: rs[1], r3: rs[2], ans: I } }; }
    if (k === 'Vone') {
      var j = R.int(0, 2), I2 = V / Req, Vj = I2 * rs[j];
      return { q: 'A $' + qx(V, 'V') + '$ battery is connected to ' + desc + ' in series. What is the voltage across $R_' + (j + 1) + '$?', a: ans(Vj), unit: 'V', viz: cv(sh),
        steps: ['$I = \\dfrac{V}{R_{\\text{eq}}} = \\dfrac{' + V + '}{' + Req + '} = ' + qt(I2, 'A') + '$.', '$V_' + (j + 1) + ' = IR_' + (j + 1) + ' = (' + tn(I2, 3) + ')(' + rs[j] + ') = ' + qt(Vj, 'V') + '$.',
          'Check: the three voltages add to $' + V + '\\,\\text{V}$, and the biggest resistor takes the biggest share.'],
        hint: 'Find the current first.', chk: { k: k, V: V, r1: rs[0], r2: rs[1], r3: rs[2], j: j, ans: Vj } };
    }
    if (k === 'divider') {
      var Ra = R.pick([1, 2, 3, 4]) * 1000, Rb = R.pick([1, 2, 3, 6]) * 1000, Vin = R.pick([5, 9, 12]);
      if (Rb === Ra) Rb = Ra === 1000 ? 3000 : 1000;
      var Vout = Vin * Rb / (Ra + Rb);
      return { q: 'A voltage divider is $R_1 = ' + tx(Ra / 1000) + '\\,\\text{k}\\Omega$ in series with $R_2 = ' + tx(Rb / 1000) + '\\,\\text{k}\\Omega$ across $' + qx(Vin, 'V') + '$. What is the voltage across $R_2$?', a: ans(Vout), unit: 'V',
        viz: cv('V(' + Vin + ') series(R1:' + Ra + ', R2:' + Rb + ')'),
        steps: ['Same current through both: $I = \\dfrac{V}{R_1 + R_2}$, so $V_2 = IR_2 = V\\dfrac{R_2}{R_1 + R_2}$.', '$V_2 = ' + Vin + ' \\times \\dfrac{' + tx(Rb / 1000) + '}{' + tx(Ra / 1000) + ' + ' + tx(Rb / 1000) + '} = ' + qt(Vout, 'V') + '$.',
          'The voltage splits in proportion to the resistances.'],
        hint: 'The voltages split in the same ratio as the resistances.', chk: { k: k, Ra: Ra, Rb: Rb, V: Vin, ans: Vout } };
    }
    // unknown resistor
    var I3 = R.pick([0.50, 1.0, 1.5, 2.0]), R3 = R.pick([2, 4, 5, 6, 8]), r1 = R.pick([2, 3, 4]), r2 = R.pick([1, 2, 6]), V3 = I3 * (r1 + r2 + R3);
    return { q: 'A $' + qx(V3, 'V') + '$ battery drives $' + qx(I3, 'A') + '$ through three resistors in series: $' + ohm(r1) + '$, $' + ohm(r2) + '$ and an unknown $R$. What is $R$?', a: ans(R3), unit: 'Ω',
      steps: ['$R_{\\text{eq}} = \\dfrac{V}{I} = \\dfrac{' + tg(V3) + '}{' + tg(I3) + '} = ' + ohm(r1 + r2 + R3) + '$.', 'Series resistances add: $R = ' + (r1 + r2 + R3) + ' - ' + r1 + ' - ' + r2 + ' = ' + ohm(R3) + '$.'],
      hint: 'Find the total resistance from Ohm\'s law, then subtract the known ones.', chk: { k: k, V: V3, I: I3, r1: r1, r2: r2, ans: R3 } };
  });

  G('phys2.parallel-resistors', function (R, ctx) {
    var k = kind(R, ctx, ['Req2', 'branch', 'concept'], ['Req2', 'total', 'Req3', 'identical', 'concept'], ['Req3', 'unknown', 'total', 'branch']);
    var pr = R.pick(PAIRS), a = pr[0], b = pr[1], Rp = par2(a, b), V = R.pick([6, 12, 24]);
    if (k === 'concept') {
      return { q: 'Two resistors are connected in parallel to a battery. A third resistor is added in parallel with them. What happens to the equivalent resistance and to the current from the battery?',
        a: mc('The equivalent resistance goes down and the battery current goes up.', ['The equivalent resistance goes up and the battery current goes down.', 'Both stay the same.', 'The equivalent resistance goes up and the battery current goes up.']),
        viz: cv('V(12) par(R1:6, R2:6, R3:6)', { show: ['current'] }),
        steps: ['A new parallel branch is a new path for charge. The old branches keep the same voltage and the same currents.',
          'The battery now supplies the old currents plus the new branch\'s current: more total current.', 'More current at the same voltage means a smaller equivalent resistance, $R_{\\text{eq}} = V/I$. Adding a branch always lowers $R_{\\text{eq}}$.'],
        hint: 'Does adding a path make it easier or harder for charge to flow?', chk: { k: k, ans: 0 } };
    }
    var sh2 = 'V(' + V + ') par(R1:' + a + ', R2:' + b + ')';
    if (k === 'Req2') return { q: 'What is the equivalent resistance of a $' + ohm(a) + '$ and a $' + ohm(b) + '$ resistor in parallel?', a: ans(Rp, { rtol: 0.005 }), unit: 'Ω', viz: cv(sh2),
      steps: ['In parallel each branch has the same voltage and the currents add: $\\dfrac{V}{R_{\\text{eq}}} = \\dfrac{V}{R_1} + \\dfrac{V}{R_2}$, so $\\dfrac{1}{R_{\\text{eq}}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$.',
        '$\\dfrac{1}{R_{\\text{eq}}} = \\dfrac{1}{' + a + '} + \\dfrac{1}{' + b + '}$, so $R_{\\text{eq}} = \\dfrac{' + a + ' \\times ' + b + '}{' + a + ' + ' + b + '} = ' + qt(Rp, 'Ohm') + '$.',
        'Check: it is smaller than the smaller resistor, $' + ohm(Math.min(a, b)) + '$.'],
      hint: 'Add the reciprocals, then flip. For two resistors: product over sum.', chk: { k: k, a: a, b: b, ans: Rp } };
    if (k === 'branch') { var j = R.coin() ? a : b, Ij = V / j; return { q: 'A $' + ohm(a) + '$ and a $' + ohm(b) + '$ resistor are in parallel across a $' + qx(V, 'V') + '$ battery. What current flows through the $' + ohm(j) + '$ resistor?', a: ans(Ij), unit: 'A', viz: cv(sh2),
      steps: ['Each parallel branch is connected straight across the battery, so each has the full $' + qx(V, 'V') + '$.', '$I = \\dfrac{V}{R} = \\dfrac{' + V + '}{' + j + '} = ' + qt(Ij, 'A') + '$.', 'The other branch does not change this; each branch acts as if it were alone with the battery.'],
      hint: 'What is the voltage across each branch?', chk: { k: k, V: V, R: j, a: a, b: b, ans: Ij } }; }
    if (k === 'total') { var It = V / a + V / b; return { q: 'A $' + ohm(a) + '$ and a $' + ohm(b) + '$ resistor are in parallel across a $' + qx(V, 'V') + '$ battery. What is the total current from the battery?', a: ans(It), unit: 'A', viz: cv(sh2),
      steps: ['Branch currents: $\\dfrac{' + V + '}{' + a + '} = ' + qt(V / a, 'A') + '$ and $\\dfrac{' + V + '}{' + b + '} = ' + qt(V / b, 'A') + '$.', 'They add at the junction: $I = ' + tn(V / a, 3) + ' + ' + tn(V / b, 3) + ' = ' + qt(It, 'A') + '$.',
        'Check: $R_{\\text{eq}} = ' + tn(Rp, 3) + '\\,\\Omega$ and $V/R_{\\text{eq}} = ' + tn(V / Rp, 3) + '\\,\\text{A}$.'],
      hint: 'Find each branch current and add them.', chk: { k: k, V: V, a: a, b: b, ans: It } }; }
    if (k === 'Req3') {
      var tr = R.pick([[12, 6, 4], [6, 6, 3], [10, 10, 5], [20, 30, 60], [4, 6, 12], [3, 6, 6], [2, 6, 3]]), inv = 1 / tr[0] + 1 / tr[1] + 1 / tr[2], R3 = 1 / inv;
      return { q: 'Find the equivalent resistance of $' + ohm(tr[0]) + '$, $' + ohm(tr[1]) + '$ and $' + ohm(tr[2]) + '$ in parallel.', a: ans(R3, { rtol: 0.005 }), unit: 'Ω',
        viz: cv('V(12) par(R1:' + tr[0] + ', R2:' + tr[1] + ', R3:' + tr[2] + ')'),
        steps: ['$\\dfrac{1}{R_{\\text{eq}}} = \\dfrac{1}{' + tr[0] + '} + \\dfrac{1}{' + tr[1] + '} + \\dfrac{1}{' + tr[2] + '} = ' + tn(inv, 3) + '\\,\\Omega^{-1}$.', '$R_{\\text{eq}} = \\dfrac{1}{' + tn(inv, 3) + '} = ' + qt(R3, 'Ohm') + '$, less than the smallest branch.'],
        hint: 'Add all three reciprocals, then take the reciprocal of the sum.', chk: { k: k, r1: tr[0], r2: tr[1], r3: tr[2], ans: R3 } };
    }
    if (k === 'identical') {
      var n = R.pick([2, 3, 4, 5, 6]), r = R.pick([12, 30, 60, 120]), Rn = r / n;
      return { q: U.words(n).replace(/^./, function (c) { return c.toUpperCase(); }) + ' identical $' + ohm(r) + '$ resistors are connected in parallel. What is their equivalent resistance?', a: ans(Rn, { rtol: 0.005 }), unit: 'Ω',
        steps: ['$\\dfrac{1}{R_{\\text{eq}}} = ' + n + ' \\times \\dfrac{1}{' + r + '}$, so $R_{\\text{eq}} = \\dfrac{' + r + '}{' + n + '} = ' + qt(Rn, 'Ohm') + '$.', 'With $n$ equal paths, the current has $n$ times the room, so the resistance is $1/n$ as big.'],
        hint: 'For $n$ equal resistors in parallel, divide by $n$.', chk: { k: k, n: n, r: r, ans: Rn } };
    }
    // unknown: which resistor in parallel with a gives the target
    var pr2 = R.pick(PAIRS), x = pr2[1], A0 = pr2[0], target = par2(A0, x);
    return { q: 'What resistor must be connected in parallel with a $' + ohm(A0) + '$ resistor to give an equivalent resistance of $' + ohm(U.fix(target)) + '$?', a: ans(x, { rtol: 0.005 }), unit: 'Ω',
      steps: ['$\\dfrac{1}{R_x} = \\dfrac{1}{R_{\\text{eq}}} - \\dfrac{1}{R_1} = \\dfrac{1}{' + tg(U.fix(target)) + '} - \\dfrac{1}{' + A0 + '} = ' + tn(1 / target - 1 / A0, 3) + '\\,\\Omega^{-1}$.', '$R_x = ' + qt(x, 'Ohm') + '$.'],
      hint: 'Subtract reciprocals.', chk: { k: k, R1: A0, Req: target, ans: x } };
  });

  /* A random series-parallel network with friendly numbers. Shapes: 'sp' = R1 + (R2 || R3); 'ps' = (R1 + R2) || R3; 'spp' = R1 + (R2 || (R3 + R4)). */
  function network(R, shape) {
    var V = R.pick([6, 9, 12, 18, 24]), c;
    if (shape === 'sp') { var p = R.pick(PAIRS); c = { R: [R.pick([2, 4, 5, 6, 8]), p[0], p[1]] }; c.Req = c.R[0] + par2(c.R[1], c.R[2]); c.sh = 'V(' + V + ') series(R1:' + c.R[0] + ', par(R2:' + c.R[1] + ', R3:' + c.R[2] + '))'; c.desc = '$R_1 = ' + ohm(c.R[0]) + '$ in series with the parallel pair $R_2 = ' + ohm(c.R[1]) + '$ and $R_3 = ' + ohm(c.R[2]) + '$'; }
    else if (shape === 'ps') { var s = R.pick([[2, 4], [4, 8], [3, 9], [6, 6], [5, 10]]); c = { R: [s[0], s[1], R.pick([3, 4, 6, 12])] }; c.Req = par2(c.R[0] + c.R[1], c.R[2]); c.sh = 'V(' + V + ') par(series(R1:' + c.R[0] + ', R2:' + c.R[1] + '), R3:' + c.R[2] + ')'; c.desc = '$R_1 = ' + ohm(c.R[0]) + '$ and $R_2 = ' + ohm(c.R[1]) + '$ in series, with that pair in parallel with $R_3 = ' + ohm(c.R[2]) + '$'; }
    else { var q = R.pick([[2, 4], [4, 2], [3, 3], [5, 7]]); c = { R: [R.pick([2, 3, 4]), 6 * (q[0] + q[1]) / 6, q[0], q[1]] }; c.R[1] = R.pick([q[0] + q[1], 2 * (q[0] + q[1])]); c.Req = c.R[0] + par2(c.R[1], c.R[2] + c.R[3]); c.sh = 'V(' + V + ') series(R1:' + c.R[0] + ', par(R2:' + c.R[1] + ', series(R3:' + c.R[2] + ', R4:' + c.R[3] + ')))'; c.desc = '$R_1 = ' + ohm(c.R[0]) + '$ in series with a parallel section: $R_2 = ' + ohm(c.R[1]) + '$ on one branch, $R_3 = ' + ohm(c.R[2]) + '$ and $R_4 = ' + ohm(c.R[3]) + '$ in series on the other'; }
    c.V = V; c.shape = shape; c.I = V / c.Req; return c;
  }
  G('phys2.combination-circuits', function (R, ctx) {
    var k = kind(R, ctx, ['Req', 'I', 'concept'], ['Req', 'I', 'Vpar', 'Ibranch'], ['Ibranch', 'P', 'Vpar', 'Req']);
    if (k === 'concept') {
      return { q: 'In a circuit, $R_1$ is connected from point A to point B, and $R_2$ is connected from point B to point C, where a third wire also joins at B. Are $R_1$ and $R_2$ in series?',
        a: mc('No: a third wire joins at B, so the current through them need not be the same.', ['Yes: they are next to each other, end to end.', 'Yes: any two resistors in one circuit are in series.', 'No: they would be in parallel instead.']),
        steps: ['Two resistors are in series only if the same current must pass through both: no junction between them.', 'They are in parallel only if both ends connect to the same two points (the same voltage across them).',
          'Here a third wire at B lets current split or join between them, and their far ends (A and C) are different points, so they are neither in series nor in parallel. Look at the junctions, not at where the parts sit on the page.'],
        hint: 'What does a junction between two resistors do to the current?', chk: { k: k, ans: 0 } };
    }
    var c = network(R, by(ctx, 'sp', R.pick(['sp', 'ps']), R.pick(['sp', 'ps', 'spp'])));
    var V = c.V, viz = cv(c.sh), base = 'A $' + qx(V, 'V') + '$ battery is connected to ' + c.desc + '. ';
    var redSteps = c.shape === 'sp' ? ['Combine the parallel pair: $R_{23} = \\dfrac{' + c.R[1] + ' \\times ' + c.R[2] + '}{' + c.R[1] + ' + ' + c.R[2] + '} = ' + ohm(rd(par2(c.R[1], c.R[2]), 3)) + '$.', 'It is in series with $R_1$: $R_{\\text{eq}} = ' + c.R[0] + ' + ' + tn(par2(c.R[1], c.R[2]), 3) + ' = ' + qt(c.Req, 'Ohm') + '$.']
      : c.shape === 'ps' ? ['Combine the series pair: $R_{12} = ' + c.R[0] + ' + ' + c.R[1] + ' = ' + ohm(c.R[0] + c.R[1]) + '$.', 'It is in parallel with $R_3$: $R_{\\text{eq}} = \\dfrac{' + (c.R[0] + c.R[1]) + ' \\times ' + c.R[2] + '}{' + (c.R[0] + c.R[1]) + ' + ' + c.R[2] + '} = ' + qt(c.Req, 'Ohm') + '$.']
        : ['Innermost first: $R_{34} = ' + c.R[2] + ' + ' + c.R[3] + ' = ' + ohm(c.R[2] + c.R[3]) + '$ (series).', 'That branch is in parallel with $R_2$: $R_{234} = \\dfrac{' + c.R[1] + ' \\times ' + (c.R[2] + c.R[3]) + '}{' + c.R[1] + ' + ' + (c.R[2] + c.R[3]) + '} = ' + ohm(rd(par2(c.R[1], c.R[2] + c.R[3]), 3)) + '$.', 'In series with $R_1$: $R_{\\text{eq}} = ' + c.R[0] + ' + ' + tn(par2(c.R[1], c.R[2] + c.R[3]), 3) + ' = ' + qt(c.Req, 'Ohm') + '$.'];
    var chk = { k: k, shape: c.shape === 'sp' ? 1 : c.shape === 'ps' ? 2 : 3, V: V, r1: c.R[0], r2: c.R[1], r3: c.R[2], r4: c.R[3] || 0 };
    if (k === 'Req') { chk.ans = c.Req; return { q: 'What is the equivalent resistance of ' + c.desc + '?', a: ans(c.Req), unit: 'Ω', viz: viz, steps: redSteps, hint: 'Combine the innermost group first.', chk: chk }; }
    if (k === 'I') { chk.ans = c.I; return { q: base + 'What current does the battery supply?', a: ans(c.I), unit: 'A', viz: viz, steps: redSteps.concat(['$I = \\dfrac{V}{R_{\\text{eq}}} = \\dfrac{' + V + '}{' + tn(c.Req, 3) + '} = ' + qt(c.I, 'A') + '$.']), hint: 'Reduce to one resistor, then use Ohm\'s law.', chk: chk }; }
    // work back out: voltage across the parallel section / a branch current / power
    var Vp, Ib, which, Pn, pstep = [];
    if (c.shape === 'sp') { Vp = c.I * par2(c.R[1], c.R[2]); which = R.coin() ? 2 : 3; Ib = Vp / c.R[which - 1]; pstep = ['Back out: the battery current $' + tn(c.I, 3) + '\\,\\text{A}$ flows through $R_1$ and through the parallel pair as a whole, so $V_{23} = IR_{23} = (' + tn(c.I, 3) + ')(' + tn(par2(c.R[1], c.R[2]), 3) + ') = ' + qt(Vp, 'V') + '$.'];
    } else if (c.shape === 'ps') { Vp = V; which = R.coin() ? 1 : 3; Ib = which === 3 ? V / c.R[2] : V / (c.R[0] + c.R[1]); pstep = ['Both branches are straight across the battery, so each has $' + qx(V, 'V') + '$.'];
    } else { var R234 = par2(c.R[1], c.R[2] + c.R[3]); Vp = c.I * R234; which = R.coin() ? 2 : 3; Ib = which === 2 ? Vp / c.R[1] : Vp / (c.R[2] + c.R[3]); pstep = ['Back out: $V_{\\text{parallel}} = IR_{234} = (' + tn(c.I, 3) + ')(' + tn(R234, 3) + ') = ' + qt(Vp, 'V') + '$.']; }
    var brR = c.shape === 'ps' ? (which === 3 ? c.R[2] : c.R[0] + c.R[1]) : c.shape === 'sp' ? c.R[which - 1] : (which === 2 ? c.R[1] : c.R[2] + c.R[3]);
    var brName = c.shape === 'sp' ? '$R_' + which + '$' : c.shape === 'ps' ? (which === 3 ? '$R_3$' : '$R_1$ (and $R_2$)') : (which === 2 ? '$R_2$' : '$R_3$ (and $R_4$)');
    if (k === 'Vpar') {
      chk.ans = Vp; return { q: base + 'What is the voltage across ' + (c.shape === 'ps' ? '$R_3$' : 'the parallel section') + '?', a: ans(Vp), unit: 'V', viz: viz,
        steps: (c.shape === 'ps' ? [] : redSteps.concat(['$I = \\dfrac{' + V + '}{' + tn(c.Req, 3) + '} = ' + qt(c.I, 'A') + '$.'])).concat(pstep), hint: 'Reduce, find the battery current, then work back out.', chk: chk };
    }
    if (k === 'Ibranch') {
      chk.ans = Ib; return { q: base + 'What current flows through ' + brName + '?', a: ans(Ib), unit: 'A', viz: viz,
        steps: (c.shape === 'ps' ? [] : redSteps.concat(['$I = \\dfrac{' + V + '}{' + tn(c.Req, 3) + '} = ' + qt(c.I, 'A') + '$.'])).concat(pstep).concat(['That branch has $' + tn(brR, 3) + '\\,\\Omega$, so its current is $\\dfrac{' + tn(Vp, 3) + '}{' + tn(brR, 3) + '} = ' + qt(Ib, 'A') + '$.']),
        hint: 'Find the voltage across that branch first.', chk: chk };
    }
    // P: power in R1 (series part) or the branch
    var r1s = c.shape !== 'ps', Ir1 = r1s ? c.I : V / (c.R[0] + c.R[1]); Pn = Ir1 * Ir1 * c.R[0]; chk.ans = Pn;
    return { q: base + 'How much power does $R_1$ use?', a: ans(Pn), unit: 'W', viz: viz,
      steps: (r1s ? redSteps.concat(['The full battery current flows through $R_1$: $I = \\dfrac{' + V + '}{' + tn(c.Req, 3) + '} = ' + qt(c.I, 'A') + '$.']) : ['The $R_1$–$R_2$ branch is straight across the battery: $I_{12} = \\dfrac{' + V + '}{' + (c.R[0] + c.R[1]) + '} = ' + qt(Ir1, 'A') + '$.']).concat(['$P = I^2R_1 = (' + tn(Ir1, 3) + ')^2(' + c.R[0] + ') = ' + qt(Pn, 'W') + '$.']),
      hint: 'Find the current through $R_1$, then use $P = I^2R$.', chk: chk };
  });

  G('phys2.kirchhoff-junction', function (R, ctx) {
    var k = kind(R, ctx, ['node', 'node', 'concept'], ['node', 'split', 'concept', 'multi'], ['split', 'multi', 'node']);
    if (k === 'concept') {
      var r1 = R.pick([2, 3, 5]), r2 = r1 * R.pick([2, 3]);
      return { q: 'A current reaches a junction where it can go through a $' + ohm(r1) + '$ resistor or a $' + ohm(r2) + '$ resistor in parallel. How does it split?',
        a: mc('More goes through the $' + tg(r1) + '\\,\\Omega$ resistor: ' + (r2 / r1) + ' times as much.', ['It splits equally, half through each.', 'More goes through the $' + tg(r2) + '\\,\\Omega$ resistor: ' + (r2 / r1) + ' times as much.', 'All of it goes through the $' + tg(r1) + '\\,\\Omega$ resistor.']),
        viz: cv('V(12) par(R1:' + r1 + ', R2:' + r2 + ')', { show: ['current'] }),
        steps: ['Parallel branches share the same voltage, so each branch current is $I = V/R$.', 'Current is inversely proportional to resistance: the $' + ohm(r1) + '$ branch carries $' + (r2 / r1) + '$ times the current of the $' + ohm(r2) + '$ branch.',
          'The junction rule still holds: the two branch currents add up to the current arriving.'],
        hint: 'Both branches have the same voltage.', chk: { k: k, ans: 0 } };
    }
    if (k === 'node') {
      var ins = [R.pick([1.0, 1.5, 2.0, 2.5, 3.0]), R.pick([0.5, 1.0, 1.5, 4.0])], outs = [R.pick([0.5, 1.0, 1.2, 2.0])];
      var x = U.fix(ins[0] + ins[1] - outs[0]);
      if (x <= 0) { outs[0] = 0.5; x = U.fix(ins[0] + ins[1] - 0.5); }
      return { q: 'At a junction, currents of $' + qx(ins[0], 'A') + '$ and $' + qx(ins[1], 'A') + '$ flow in, and $' + qx(outs[0], 'A') + '$ flows out along one wire. What current flows out along the fourth wire?', a: ans(x, { rtol: 0.001 }), unit: 'A',
        viz: { name: 'phys2-junction', opts: { wires: [{ ang: 180, dir: 'in', label: tg(ins[0]) + ' A' }, { ang: 270, dir: 'in', label: tg(ins[1]) + ' A' }, { ang: 90, dir: 'out', label: tg(outs[0]) + ' A' }, { ang: 0, dir: 'out', label: 'I = ?' }] } },
        steps: ['Charge is conserved and does not pile up at a junction: current in = current out.', '$' + tg(ins[0]) + ' + ' + tg(ins[1]) + ' = ' + tg(outs[0]) + ' + I$.', '$I = ' + tg(U.fix(ins[0] + ins[1])) + ' - ' + tg(outs[0]) + ' = ' + qt(x, 'A') + '$.'],
        hint: 'Add the currents in; subtract the currents out.', chk: { k: k, i1: ins[0], i2: ins[1], o1: outs[0], ans: x } };
    }
    if (k === 'split') {
      var p = R.pick(PAIRS), I = R.pick([1.5, 2.0, 3.0, 4.5, 6.0]), j = R.coin() ? 0 : 1, Ij = I * p[1 - j] / (p[0] + p[1]);
      return { q: 'A current of $' + qx(I, 'A') + '$ splits between a $' + ohm(p[0]) + '$ resistor and a $' + ohm(p[1]) + '$ resistor in parallel. How much goes through the $' + ohm(p[j]) + '$ resistor?', a: ans(Ij), unit: 'A',
        viz: cv('V(' + tn(I * par2(p[0], p[1]), 3) + ') par(R1:' + p[0] + ', R2:' + p[1] + ')'),
        steps: ['Both branches have the same voltage: $V = IR_{\\text{eq}}$, with $R_{\\text{eq}} = \\dfrac{' + p[0] + ' \\times ' + p[1] + '}{' + p[0] + ' + ' + p[1] + '} = ' + ohm(rd(par2(p[0], p[1]), 3)) + '$, so $V = ' + qt(I * par2(p[0], p[1]), 'V') + '$.',
          'Branch current: $I_' + (j + 1) + ' = \\dfrac{V}{R_' + (j + 1) + '} = \\dfrac{' + tn(I * par2(p[0], p[1]), 3) + '}{' + p[j] + '} = ' + qt(Ij, 'A') + '$.',
          'Check the junction rule: the other branch carries $' + tn(I - Ij, 3) + '\\,\\text{A}$, and the two add to $' + qx(I, 'A') + '$.'],
        hint: 'Find the shared voltage, then each branch current.', chk: { k: k, I: I, a: p[0], b: p[1], R: p[j], ans: Ij } };
    }
    // multi: a current splits into three branches, two known
    var It = R.pick([3.0, 4.0, 5.0, 6.0, 7.5]), a1 = R.pick([0.5, 1.0, 1.5]), a2 = R.pick([1.0, 1.5, 2.0]), a3 = U.fix(It - a1 - a2);
    return { q: 'A $' + qx(It, 'A') + '$ current from a battery reaches a junction and splits into three parallel branches. Two of them carry $' + qx(a1, 'A') + '$ and $' + qx(a2, 'A') + '$. What does the third carry, and what current returns to the battery?', a: ans(a3, { rtol: 0.001 }), unit: 'A',
      viz: { name: 'phys2-junction', opts: { wires: [{ ang: 180, dir: 'in', label: tg(It) + ' A' }, { ang: 45, dir: 'out', label: tg(a1) + ' A' }, { ang: 0, dir: 'out', label: tg(a2) + ' A' }, { ang: -45, dir: 'out', label: '?' }] } },
      steps: ['Junction rule: $' + tg(It) + ' = ' + tg(a1) + ' + ' + tg(a2) + ' + I_3$.', '$I_3 = ' + qt(a3, 'A') + '$.', 'At the far junction the three branches join again, so $' + qx(It, 'A') + '$ returns to the battery: none is used up.'],
      hint: 'The branch currents must add up to the current arriving.', chk: { k: k, I: It, a1: a1, a2: a2, ans: a3 } };
  });

  function loop2(e1, r1, e2, r2, aid) { // a one-loop circuit with two batteries for phys2-loops
    return { name: 'phys2-loops', opts: { branches: [[{ t: 'bat', v: e1, label: 'ε₁', plus: 'top' }, { t: 'res', v: r1, label: 'R₁' }], [{ t: 'res', v: r2, label: 'R₂' }, { t: 'bat', v: e2, label: 'ε₂', plus: aid ? 'bottom' : 'top' }]], interactive: false } };
  }
  G('phys2.kirchhoff-loop', function (R, ctx) {
    var k = kind(R, ctx, ['single', 'sign', 'single'], ['single', 'walk', 'two', 'sign'], ['two', 'walk', 'two', 'single']);
    if (k === 'sign') {
      var I = R.pick([0.5, 1.0, 2.0]), Rr = R.pick([3, 4, 6]), against = R.coin(), dV = against ? I * Rr : -I * Rr;
      return { q: 'Going around a loop, you cross a $' + ohm(Rr) + '$ resistor that carries $' + qx(I, 'A') + '$, moving ' + (against ? 'against' : 'in the same direction as') + ' the current. How does the potential change as you cross it?',
        a: mc((against ? 'It rises by ' : 'It drops by ') + tn(I * Rr, 2) + ' V.', [(against ? 'It drops by ' : 'It rises by ') + tn(I * Rr, 2) + ' V.', 'It does not change, because no battery is crossed.', (against ? 'It rises by ' : 'It drops by ') + tn(I * Rr * 2, 2) + ' V.']),
        steps: ['Current flows from high potential to low potential through a resistor, dropping by $IR = (' + tg(I) + ')(' + Rr + ') = ' + tn(I * Rr, 2) + '\\,\\text{V}$.',
          against ? 'Walking against the current, you go from the low end to the high end: the potential rises, $+IR$.' : 'Walking with the current, you go from the high end to the low end: the potential drops, $-IR$.'],
        hint: 'Which end of a resistor is at the higher potential?', chk: { k: k, ans: 0, dV: dV } };
    }
    if (k === 'single') {
      var e1 = R.pick([9, 12, 18, 24]), e2 = R.pick([3, 6]), r1 = R.pick([1, 2, 3, 4]), r2 = R.pick([2, 3, 5, 6]), aid = R.coin(), Inet = (aid ? e1 + e2 : e1 - e2) / (r1 + r2);
      return { q: 'A single loop contains a $' + qx(e1, 'V') + '$ battery $\\varepsilon_1$, a $' + qx(e2, 'V') + '$ battery $\\varepsilon_2$, and resistors $R_1 = ' + ohm(r1) + '$ and $R_2 = ' + ohm(r2) + '$, as shown. The batteries ' + (aid ? 'push current the same way around the loop' : 'face opposite ways') + '. What current flows?', a: ans(Inet), unit: 'A',
        viz: loop2(e1, r1, e2, r2, aid),
        steps: ['Guess the current flows clockwise (up through $\\varepsilon_1$). Walk around the loop clockwise and add the changes in potential; they must total zero.',
          'Through $\\varepsilon_1$ from $-$ to $+$: $+' + e1 + '\\,\\text{V}$. Through $\\varepsilon_2$: ' + (aid ? 'also from $-$ to $+$: $+' + e2 + '\\,\\text{V}$.' : 'from $+$ to $-$: $-' + e2 + '\\,\\text{V}$.') + ' Through each resistor, with the current: $-IR$.',
          '$' + e1 + (aid ? ' + ' : ' - ') + e2 + ' - I(' + r1 + ') - I(' + r2 + ') = 0$, so $I = \\dfrac{' + (aid ? e1 + e2 : e1 - e2) + '}{' + (r1 + r2) + '} = ' + qt(Inet, 'A') + '$, clockwise.'],
        hint: 'Add the battery voltages with signs, then divide by the total resistance.', chk: { k: k, e1: e1, e2: e2, r1: r1, r2: r2, aid: aid ? 1 : 0, ans: Inet } };
    }
    if (k === 'walk') {
      var E = R.pick([12, 18, 24]), E2 = R.pick([3, 6]), ra = R.pick([2, 3, 4]), rb = R.pick([2, 4, 5]), Iw = (E - E2) / (ra + rb), Vab = E - Iw * ra;
      return { q: 'In the loop shown, $\\varepsilon_1 = ' + qx(E, 'V') + '$, $\\varepsilon_2 = ' + qx(E2, 'V') + '$, $R_1 = ' + ohm(ra) + '$ and $R_2 = ' + ohm(rb) + '$; the current is $' + qt(Iw, 'A') + '$ clockwise. Point a is on the bottom wire and point b on the top wire. What is $V_b - V_a$?', a: ans(Vab), unit: 'V',
        viz: (function () { var z = loop2(E, ra, E2, rb, false); z.opts.points = [{ b: 0, at: 'bottom', label: 'a' }, { b: 0, at: 'top', label: 'b' }]; z.opts.currents = [{ b: 0, dir: 'up', label: 'I' }]; return z; })(),
        steps: ['Walk from a up the left branch to b, adding the changes: first $R_1$ (with the current: $-IR_1$), then $\\varepsilon_1$ (from $-$ to $+$: $+\\varepsilon_1$).',
          '$V_b - V_a = -(' + tn(Iw, 3) + ')(' + ra + ') + ' + E + ' = ' + qt(Vab, 'V') + '$.',
          'Check by the other path, down the right branch backward: $V_b - V_a = +\\varepsilon_2 + IR_2 = ' + E2 + ' + (' + tn(Iw, 3) + ')(' + rb + ') = ' + tn(E2 + Iw * rb, 3) + '\\,\\text{V}$. Same answer: potential has one value at each point.'],
        hint: 'Start at a, walk to b, and add each rise and drop.', chk: { k: k, e1: E, e2: E2, r1: ra, r2: rb, ans: Vab } };
    }
    // two-loop circuit: choose currents, then emfs
    var I1 = R.pick([1, 2, 3]), I2 = R.pick([1, 2]) * (ctx.level >= 3 && R.chance(0.3) ? -1 : 1), I3 = I1 + I2;
    if (I3 <= 0) { I2 = 1; I3 = I1 + 1; }
    var R1 = R.pick([1, 2, 3, 4]), R2 = R.pick([1, 2, 3, 6]), R3 = R.pick([2, 3, 4]), E1 = I1 * R1 + I3 * R3, E2b = I2 * R2 + I3 * R3, ask = R.pick(['I1', 'I2', 'I3']);
    if (E2b <= 0) { I2 = 1; I3 = I1 + 1; E1 = I1 * R1 + I3 * R3; E2b = I2 * R2 + I3 * R3; }
    var a11 = R1 + R3, a22 = R2 + R3, Dt = a11 * a22 - R3 * R3, num2 = a11 * E2b - R3 * E1;
    var val = ask === 'I1' ? I1 : ask === 'I2' ? I2 : I3, lab = ask === 'I1' ? 'I_1' : ask === 'I2' ? 'I_2' : 'I_3';
    return { q: 'In the circuit shown, $\\varepsilon_1 = ' + qx(E1, 'V') + '$, $\\varepsilon_2 = ' + qx(E2b, 'V') + '$, $R_1 = ' + ohm(R1) + '$, $R_2 = ' + ohm(R2) + '$ and $R_3 = ' + ohm(R3) + '$. Take $I_1$ up the left branch, $I_2$ up the right branch and $I_3$ down the middle. Find $' + lab + '$. (A negative answer means it flows the other way.)', a: ans(val, { rtol: 0.01 }), unit: 'A',
      viz: { name: 'phys2-loops', opts: { branches: [[{ t: 'bat', v: E1, label: 'ε₁', plus: 'top' }, { t: 'res', v: R1, label: 'R₁' }], [{ t: 'res', v: R3, label: 'R₃' }], [{ t: 'res', v: R2, label: 'R₂' }, { t: 'bat', v: E2b, label: 'ε₂', plus: 'top' }]], currents: [{ b: 0, dir: 'up', label: 'I₁' }, { b: 1, dir: 'down', label: 'I₃' }, { b: 2, dir: 'up', label: 'I₂' }], interactive: false } },
      steps: ['Junction rule at the top: $I_3 = I_1 + I_2$.',
        'Left loop (up through $\\varepsilon_1$ and $R_1$, down through $R_3$): $' + T.terms([[E1, ''], [-R1, 'I_{1}'], [-R3, 'I_{3}']]) + ' = 0$.',
        'Right loop (up through $\\varepsilon_2$ and $R_2$, down through $R_3$): $' + T.terms([[E2b, ''], [-R2, 'I_{2}'], [-R3, 'I_{3}']]) + ' = 0$.',
        'Substitute $I_3 = I_1 + I_2$: $' + T.terms([[a11, 'I_{1}'], [R3, 'I_{2}']]) + ' = ' + E1 + '$ and $' + T.terms([[R3, 'I_{1}'], [a22, 'I_{2}']]) + ' = ' + E2b + '$.',
        'Eliminate $I_1$: multiply the first equation by ' + R3 + ' and the second by ' + a11 + ', then subtract: $' + T.coef(Dt, 'I_{2}') + ' = ' + num2 + '$, so $I_2 = ' + I2 + '\\,\\text{A}$.',
        'Back-substitute: $I_1 = \\dfrac{' + E1 + T.signed(-R3 * I2) + '}{' + a11 + '} = ' + I1 + '\\,\\text{A}$, and $I_3 = I_1 + I_2 = ' + I3 + '\\,\\text{A}$. So $' + lab + ' = ' + qt(val, 'A') + '$.'],
      hint: 'Write the junction rule and one loop equation for each loop, then solve the system.', chk: { k: k, e1: E1, e2: E2b, r1: R1, r2: R2, r3: R3, ask: ask === 'I1' ? 1 : ask === 'I2' ? 2 : 3, ans: val } };
  });

  G('phys2.internal-resistance', function (R, ctx) {
    var k = kind(R, ctx, ['I', 'Vt', 'concept'], ['I', 'Vt', 'r', 'P', 'concept'], ['r', 'P', 'Vt', 'short']);
    var em = R.pick([1.5, 6.0, 9.0, 12]), r = em === 1.5 ? R.pick([0.10, 0.20, 0.50]) : R.pick([0.20, 0.50, 1.0]), RL = R.pick([2.0, 4.0, 5.5, 10, 11.5]);
    var I = em / (RL + r), Vt = em - I * r, sh = 'V(' + em + ', r=' + r + ') series(A1, R1:' + RL + ')';
    var base = 'A battery has an EMF of $' + qx(em, 'V') + '$ and an internal resistance of $' + ohm(r) + '$. It is connected to a $' + ohm(RL) + '$ load. ';
    if (k === 'concept') {
      return { q: 'A battery labeled $' + qx(em, 'V') + '$ is connected to smaller and smaller load resistances, so it supplies more and more current. What happens to the voltage across its terminals?',
        a: mc('It drops below ' + tg(em) + ' V, more and more as the current grows.', ['It stays at ' + tg(em) + ' V, the value printed on it.', 'It rises above ' + tg(em) + ' V.', 'It drops to zero as soon as any current flows.']),
        viz: cv(sh, { show: ['meters'] }),
        steps: ['A real battery has internal resistance $r$. Current through it causes a drop $Ir$ inside the battery.', 'Terminal voltage: $V = \\varepsilon - Ir$. More current, bigger drop.',
          'Only when no current flows does the terminal voltage equal the EMF.'],
        hint: 'Where does the voltage drop $Ir$ happen?', chk: { k: k, ans: 0 } };
    }
    if (k === 'I') return { q: base + 'What current flows?', a: ans(I), unit: 'A', viz: cv(sh, { show: ['meters'] }),
      steps: ['The internal resistance is in series with the load: $I = \\dfrac{\\varepsilon}{R + r}$.', '$I = \\dfrac{' + tg(em) + '}{' + tg(RL) + ' + ' + tg(r) + '} = ' + qt(I, 'A') + '$.'],
      hint: 'Add the internal resistance to the load.', chk: { k: k, e: em, r: r, R: RL, ans: I } };
    if (k === 'Vt') return { q: base + 'What is the voltage across the battery\'s terminals?', a: ans(Vt), unit: 'V', viz: cv(sh, { show: ['meters'] }),
      steps: ['$I = \\dfrac{\\varepsilon}{R + r} = \\dfrac{' + tg(em) + '}{' + tn(RL + r, 3) + '} = ' + qt(I, 'A') + '$.', 'Terminal voltage: $V = \\varepsilon - Ir = ' + tg(em) + ' - (' + tn(I, 3) + ')(' + tg(r) + ') = ' + qt(Vt, 'V') + '$.', 'Check: $V = IR = (' + tn(I, 3) + ')(' + tg(RL) + ') = ' + tn(I * RL, 3) + '\\,\\text{V}$.'],
      hint: 'Find the current, then subtract the internal drop from the EMF.', chk: { k: k, e: em, r: r, R: RL, ans: Vt } };
    if (k === 'r') {
      var Im = R.pick([0.50, 1.0, 1.5, 2.0]), rr = R.pick([0.20, 0.25, 0.50, 0.80]), E2 = R.pick([6.0, 9.0, 12]), Vm = U.fix(E2 - Im * rr);
      return { q: 'With no current, a battery\'s terminal voltage is $' + qx(E2, 'V') + '$. When it supplies $' + qx(Im, 'A') + '$, the terminal voltage is $' + qx(Vm, 'V') + '$. What is its internal resistance?', a: ans(rr), unit: 'Ω',
        steps: ['With no current, the terminal voltage equals the EMF: $\\varepsilon = ' + qx(E2, 'V') + '$.', '$V = \\varepsilon - Ir$, so $r = \\dfrac{\\varepsilon - V}{I} = \\dfrac{' + tg(E2) + ' - ' + tg(Vm) + '}{' + tg(Im) + '} = ' + qt(rr, 'Ohm') + '$.'],
        hint: 'The missing voltage is the internal drop $Ir$.', chk: { k: k, e: E2, I: Im, V: Vm, ans: rr } };
    }
    if (k === 'P') { var PL = I * I * RL; return { q: base + 'How much power is delivered to the load?', a: ans(PL), unit: 'W', viz: cv(sh),
      steps: ['$I = \\dfrac{\\varepsilon}{R + r} = ' + qt(I, 'A') + '$.', '$P = I^2R = (' + tn(I, 3) + ')^2(' + tg(RL) + ') = ' + qt(PL, 'W') + '$.', 'The battery also heats itself: $I^2r = ' + qt(I * I * r, 'W') + '$ is lost inside.'],
      hint: 'Find the current with $r$ included, then use $I^2R$ for the load.', chk: { k: k, e: em, r: r, R: RL, ans: PL } }; }
    // short: the largest current, when the load is a wire of nearly zero resistance
    var Is = em / r;
    return { q: 'A battery with EMF $' + qx(em, 'V') + '$ and internal resistance $' + ohm(r) + '$ has its terminals joined by a wire of negligible resistance. What current flows? (Only the internal resistance limits it.)', a: ans(Is), unit: 'A',
      steps: ['With $R \\approx 0$: $I = \\dfrac{\\varepsilon}{r} = \\dfrac{' + tg(em) + '}{' + tg(r) + '} = ' + qt(Is, 'A') + '$.', 'The terminal voltage is then $\\varepsilon - Ir = 0$: all of the EMF is used up inside the battery, which heats it.'],
      hint: 'Set the load resistance to zero.', chk: { k: k, e: em, r: r, ans: Is } };
  });

  var CPAIRS = [[3, 6], [4, 12], [6, 12], [2, 2], [10, 15], [20, 30], [6, 3], [5, 20]];
  G('phys2.capacitor-combinations', function (R, ctx) {
    var k = kind(R, ctx, ['par', 'ser', 'concept'], ['ser', 'serQ', 'parQ', 'concept'], ['combo', 'serQ', 'ser', 'parQ']);
    var p = R.pick(CPAIRS), a = p[0], b = p[1], V = R.pick([6, 9, 12, 24]);
    if (k === 'concept') {
      return { q: 'Two capacitors, $' + qx(a, 'uF') + '$ and $' + qx(b, 'uF') + '$, are connected in series. Their equivalent capacitance is',
        a: mc('less than ' + tg(Math.min(a, b)) + ' μF.', [tg(a + b) + ' μF, the sum.', 'between ' + tg(Math.min(a, b)) + ' μF and ' + tg(Math.max(a, b)) + ' μF.', 'more than ' + tg(a + b) + ' μF.']),
        viz: cv('V(' + V + ') series(C1:' + a + ', C2:' + b + ')'),
        steps: ['In series, both capacitors hold the same charge $Q$, and their voltages add: $V = \\dfrac{Q}{C_1} + \\dfrac{Q}{C_2}$.', 'So $\\dfrac{1}{C_{\\text{eq}}} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2}$: reciprocals add, the opposite of resistors.',
          '$C_{\\text{eq}} = \\dfrac{' + a + ' \\times ' + b + '}{' + a + ' + ' + b + '} = ' + tn(par2(a, b), 3) + '\\,\\mu\\text{F}$, smaller than either. (Like making the gap wider.)'],
        hint: 'Series capacitors combine like parallel resistors.', chk: { k: k, ans: 0 } };
    }
    if (k === 'par') { var c3 = R.pick([0, 0, 1, 2, 5]), Ct = a + b + c3;
      return { q: 'Capacitors of $' + qx(a, 'uF') + '$' + (c3 ? ', $' + qx(b, 'uF') + '$ and $' + qx(c3, 'uF') + '$' : ' and $' + qx(b, 'uF') + '$') + ' are connected in parallel. What is the equivalent capacitance?', a: ans(Ct, { rtol: 0.005 }), unit: 'μF',
        viz: cv('V(' + V + ') par(C1:' + a + ', C2:' + b + (c3 ? ', C3:' + c3 : '') + ')'),
        steps: ['In parallel each capacitor has the same voltage, and the charges add: $Q = C_1V + C_2V + \\cdots$.', 'So $C_{\\text{eq}} = ' + a + ' + ' + b + (c3 ? ' + ' + c3 : '') + ' = ' + qt(Ct, 'uF') + '$. Parallel plates side by side act like one bigger plate.'],
        hint: 'Parallel capacitances add.', chk: { k: k, a: a, b: b, c: c3, ans: Ct } }; }
    if (k === 'ser') { var Cs = par2(a, b);
      return { q: 'What is the equivalent capacitance of $' + qx(a, 'uF') + '$ and $' + qx(b, 'uF') + '$ capacitors in series?', a: ans(Cs, { rtol: 0.005 }), unit: 'μF', viz: cv('V(' + V + ') series(C1:' + a + ', C2:' + b + ')'),
        steps: ['Series: the same charge on each, the voltages add, so $\\dfrac{1}{C_{\\text{eq}}} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2}$.', '$C_{\\text{eq}} = \\dfrac{' + a + ' \\times ' + b + '}{' + a + ' + ' + b + '} = ' + qt(Cs, 'uF') + '$, smaller than either one.'],
        hint: 'Reciprocals add for series capacitors.', chk: { k: k, a: a, b: b, ans: Cs } }; }
    if (k === 'serQ') {
      var Cq = par2(a, b), Q = Cq * V, which = R.coin() ? 0 : 1, Vj = Q / p[which], askV = R.coin();
      return { q: 'Capacitors $C_1 = ' + qx(a, 'uF') + '$ and $C_2 = ' + qx(b, 'uF') + '$ are in series across a $' + qx(V, 'V') + '$ battery. ' + (askV ? 'What is the voltage across $C_' + (which + 1) + '$?' : 'What charge is on each capacitor, in microcoulombs?'), a: ans(askV ? Vj : Q), unit: askV ? 'V' : 'μC',
        viz: cv('V(' + V + ') series(C1:' + a + ', C2:' + b + ')'),
        steps: ['$C_{\\text{eq}} = \\dfrac{' + a + ' \\times ' + b + '}{' + a + ' + ' + b + '} = ' + qt(Cq, 'uF') + '$.', 'Charge: $Q = C_{\\text{eq}}V = (' + tn(Cq, 3) + ')(' + V + ') = ' + qt(Q, 'uC') + '$, the same on both capacitors in series.'].concat(askV ? ['$V_' + (which + 1) + ' = \\dfrac{Q}{C_' + (which + 1) + '} = \\dfrac{' + tn(Q, 3) + '}{' + p[which] + '} = ' + qt(Vj, 'V') + '$. The smaller capacitor takes the bigger share of the voltage.'] : []),
        hint: 'Series capacitors carry the same charge.', chk: { k: k, a: a, b: b, V: V, w: which, askV: askV ? 1 : 0, ans: askV ? Vj : Q } };
    }
    if (k === 'parQ') { var Qt = (a + b) * V;
      return { q: 'Capacitors of $' + qx(a, 'uF') + '$ and $' + qx(b, 'uF') + '$ are in parallel across a $' + qx(V, 'V') + '$ battery. What is the total charge they store, in microcoulombs?', a: ans(Qt), unit: 'μC', viz: cv('V(' + V + ') par(C1:' + a + ', C2:' + b + ')'),
        steps: ['Each has the full $' + V + '\\,\\text{V}$: $Q_1 = ' + a + ' \\times ' + V + ' = ' + (a * V) + '\\,\\mu\\text{C}$ and $Q_2 = ' + b + ' \\times ' + V + ' = ' + (b * V) + '\\,\\mu\\text{C}$.', 'Total: $Q = ' + qt(Qt, 'uC') + '$, the same as $C_{\\text{eq}}V = (' + (a + b) + ')(' + V + ')$.'],
        hint: 'Parallel capacitors share the voltage; their charges add.', chk: { k: k, a: a, b: b, V: V, ans: Qt } }; }
    // combo: C1 in series with (C2 || C3)
    var cp = R.pick([[2, 4], [1, 5], [3, 3], [4, 8], [2, 10]]), C1 = R.pick([3, 4, 6, 12]), C23 = cp[0] + cp[1], Cc = par2(C1, C23);
    return { q: 'Capacitor $C_1 = ' + qx(C1, 'uF') + '$ is in series with a parallel pair, $C_2 = ' + qx(cp[0], 'uF') + '$ and $C_3 = ' + qx(cp[1], 'uF') + '$. What is the equivalent capacitance?', a: ans(Cc), unit: 'μF',
      viz: cv('V(12) series(C1:' + C1 + ', par(C2:' + cp[0] + ', C3:' + cp[1] + '))'),
      steps: ['Parallel pair first: $C_{23} = ' + cp[0] + ' + ' + cp[1] + ' = ' + qt(C23, 'uF') + '$.', 'In series with $C_1$: $C_{\\text{eq}} = \\dfrac{' + C1 + ' \\times ' + C23 + '}{' + C1 + ' + ' + C23 + '} = ' + qt(Cc, 'uF') + '$.'],
      hint: 'Combine the parallel pair, then the series pair.', chk: { k: k, c1: C1, c2: cp[0], c3: cp[1], ans: Cc } };
  });

  G('phys2.rc-circuits', function (R, ctx) {
    var k = kind(R, ctx, ['tau', 'I0', 'concept'], ['tau', 'I0', 'Vt', 'Qmax', 'concept'], ['Vt', 'discharge', 'branch', 'tau']);
    var Rk = R.pick([1.0, 2.0, 5.0, 10, 20, 47]), Cu = R.pick([10, 22, 47, 100, 220, 470]), em = R.pick([6.0, 9.0, 12]), tau = Rk * 1e3 * Cu * 1e-6;
    var sh = 'V(' + em + ') series(S1:1, R1:' + Rk * 1000 + ', C1:' + Cu + ')', rtxt = '$R = ' + tg(Rk) + '\\,\\text{k}\\Omega$', ctxt = '$C = ' + qx(Cu, 'uF') + '$';
    if (k === 'concept') {
      var early = R.coin();
      return { q: 'An uncharged capacitor is connected in series with a resistor $R$ and a battery of EMF $\\varepsilon$. ' + (early ? 'Just after the switch closes, what is the current?' : 'A long time after the switch closes, what is the current?'),
        a: mc(early ? '$\\varepsilon/R$: the empty capacitor acts like a plain wire.' : 'Zero: the full capacitor blocks steady current.', early ? ['Zero: the capacitor blocks the current.', '$\\varepsilon/(2R)$: half the full current.', 'It is infinite, because the capacitor has no resistance.'] : ['$\\varepsilon/R$, as at the start.', '$\\varepsilon/(2R)$: half the starting current.', 'It keeps growing as the capacitor fills.']),
        viz: cv(sh, { mode: 'transient', t: early ? 0 : 5 * tau }),
        steps: ['Around the loop: $\\varepsilon = IR + V_C$, with $V_C = Q/C$.', early ? 'At the start $Q = 0$, so $V_C = 0$ and $I = \\varepsilon/R$: the capacitor acts like a wire for that instant.' : 'As charge builds, $V_C$ rises toward $\\varepsilon$, so $IR = \\varepsilon - V_C$ shrinks toward zero.',
          early ? 'Only as charge builds up does $V_C$ grow and the current fall.' : 'After about $5RC$ the capacitor is effectively full: $V_C = \\varepsilon$ and no current flows.'],
        hint: 'Use $\\varepsilon = IR + Q/C$ at that moment.', chk: { k: k, v: early ? 'early' : 'late', ans: 0 } };
    }
    if (k === 'tau') return { q: 'A ' + ctxt + ' capacitor charges through a resistor with ' + rtxt + '. What is the time constant?', a: ans(tau), unit: 's',
      steps: ['$\\tau = RC$ (ohms times farads gives seconds).', '$\\tau = (' + tg(Rk) + ' \\times 10^{3}\\,\\Omega)(' + tg(Cu) + ' \\times 10^{-6}\\,\\text{F}) = ' + qt(tau, 's') + '$.', 'After one $\\tau$ the capacitor is about $63\\%$ charged; after $5\\tau$ it is essentially full.'],
      hint: 'Multiply $R$ in ohms by $C$ in farads.', chk: { k: k, R: Rk, C: Cu, ans: tau } };
    if (k === 'I0') { var I0 = em / (Rk * 1e3) * 1e3;
      return { q: 'An uncharged ' + ctxt + ' capacitor, a resistor with ' + rtxt + ', and a $' + qx(em, 'V') + '$ battery are connected in series. What is the current just after the switch closes, in milliamperes?', a: ans(I0), unit: 'mA', viz: cv(sh, { mode: 'transient', t: 0 }),
        steps: ['Just after closing, the capacitor is empty, so $V_C = 0$: it acts like a plain wire.', '$I_0 = \\dfrac{\\varepsilon}{R} = \\dfrac{' + tg(em) + '}{' + tg(Rk * 1000) + '} = ' + qt(I0 / 1000, 'A') + ' = ' + qt(I0, 'mA') + '$.', 'The capacitance does not matter at that instant; it only sets how fast the current then falls.'],
        hint: 'At $t = 0$ the empty capacitor has no voltage across it.', chk: { k: k, e: em, R: Rk, ans: I0 } }; }
    if (k === 'Qmax') { var Qm = Cu * em;
      return { q: 'A ' + ctxt + ' capacitor charges through a resistor from a $' + qx(em, 'V') + '$ battery. What charge does it hold after a long time, in microcoulombs?', a: ans(Qm), unit: 'μC',
        steps: ['After a long time the current stops, so there is no drop across the resistor and $V_C = \\varepsilon$.', '$Q = C\\varepsilon = (' + tg(Cu) + '\\,\\mu\\text{F})(' + qx(em, 'V') + ') = ' + qt(Qm, 'uC') + '$.'],
        hint: 'When the current stops, what is the voltage across the capacitor?', chk: { k: k, C: Cu, e: em, ans: Qm } }; }
    if (k === 'Vt') {
      var nT = R.pick([1, 2, 3]), f = 1 - Math.exp(-nT), Vt = em * f;
      return { q: 'An uncharged capacitor charges through a resistor from a $' + qx(em, 'V') + '$ battery. What is the voltage across the capacitor after ' + (nT === 1 ? 'one time constant' : U.words(nT) + ' time constants') + ' ($t = ' + (nT === 1 ? '' : nT) + 'RC$)? (Use $e^{-' + nT + '} = ' + tn(Math.exp(-nT), 3) + '$.)', a: ans(Vt), unit: 'V',
        viz: cv(sh, { mode: 'transient', t: nT * tau, tmax: 5 * tau }),
        steps: ['Charging: $V_C = \\varepsilon\\left(1 - e^{-t/RC}\\right)$.', 'At $t = ' + (nT === 1 ? '' : nT) + 'RC$: $V_C = ' + tg(em) + '\\left(1 - e^{-' + nT + '}\\right) = ' + tg(em) + '(1 - ' + tn(Math.exp(-nT), 3) + ') = ' + tg(em) + ' \\times ' + tn(f, 3) + '$.',
          '$V_C = ' + qt(Vt, 'V') + '$, about $' + Math.round(f * 100) + '\\%$ of the battery\'s EMF.'],
        hint: 'Use $V_C = \\varepsilon(1 - e^{-t/RC})$.', chk: { k: k, e: em, n: nT, ans: Vt } };
    }
    if (k === 'discharge') {
      var V0 = R.pick([10, 12, 20, 50]), tt = R.pick([0.5, 1.0, 2.0]) * tau, Vd = V0 * Math.exp(-tt / tau);
      return { q: 'A capacitor charged to $' + qx(V0, 'V') + '$ discharges through a resistor; ' + rtxt + ' and ' + ctxt + '. What is its voltage after $' + qt(tt, 's') + '$?', a: ans(Vd), unit: 'V',
        steps: ['$\\tau = RC = (' + tg(Rk) + ' \\times 10^{3})(' + tg(Cu) + ' \\times 10^{-6}) = ' + qt(tau, 's') + '$.', 'Discharging: $V = V_0 e^{-t/RC}$, and $t/RC = ' + tn(tt / tau, 2) + '$.',
          '$V = ' + V0 + ' e^{-' + tn(tt / tau, 2) + '} = ' + V0 + ' \\times ' + tn(Math.exp(-tt / tau), 3) + ' = ' + qt(Vd, 'V') + '$.'],
        hint: 'Find $RC$, then use $V = V_0e^{-t/RC}$.', chk: { k: k, V0: V0, t: tt, R: Rk, C: Cu, ans: Vd } };
    }
    // branch: R1 in series with (R2 || C)
    var R1 = R.pick([2, 3, 4, 5]), R2 = R.pick([2, 4, 6, 10]), E = R.pick([6, 9, 12, 18]), early2 = R.coin(), Ib = early2 ? E / R1 : E / (R1 + R2);
    return { q: 'A $' + qx(E, 'V') + '$ battery is connected to $R_1 = ' + ohm(R1) + '$, followed by $R_2 = ' + ohm(R2) + '$ in parallel with an uncharged capacitor. What current flows through $R_1$ ' + (early2 ? 'just after the switch closes' : 'a long time after the switch closes') + '?', a: ans(Ib), unit: 'A',
      steps: early2 ? ['Just after closing, the empty capacitor has $V_C = 0$, so it acts like a wire across $R_2$: no current goes through $R_2$.', 'Only $R_1$ limits the current: $I = \\dfrac{' + E + '}{' + R1 + '} = ' + qt(Ib, 'A') + '$.']
        : ['After a long time the capacitor is full and carries no current: it acts like a break in its branch.', 'The current goes through $R_1$ and $R_2$ in series: $I = \\dfrac{' + E + '}{' + R1 + ' + ' + R2 + '} = ' + qt(Ib, 'A') + '$.'],
      hint: early2 ? 'At first an empty capacitor acts like a wire.' : 'After a long time a full capacitor acts like an open switch.', chk: { k: k, e: E, r1: R1, r2: R2, early: early2 ? 1 : 0, ans: Ib } };
  });

})(window.MathLadder);

/* ---- part B ---- */
/* Physics 2, part B generators: magnetism, geometric optics, waves, quantum physics (phys2 units 5–8).
   Constants used in problems (as in the lessons): e = 1.60e-19 C, m_e = 9.11e-31 kg, m_p = 1.67e-27 kg,
   h = 6.63e-34 J·s, c = 3.00e8 m/s, hc = 1240 eV·nm, mu0 = 4π × 10^-7 T·m/A, v_sound = 343 m/s, I0 = 1e-12 W/m².
   Answers with units carry rtol (0.02 unless noted) so learners who use more precise constants are right too. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var U = ML.util, M = Math, PI = M.PI, DEG = PI / 180;
  /* G(id, fn): register a generator; wide inline math in q, steps and hint becomes display math (it can't wrap) */
  function G(id, fn) { ML.gen(id, function (R, ctx) { var p = fn(R, ctx); p.q = widen(p.q); if (p.hint) p.hint = widen(p.hint); p.steps = p.steps.map(widen); return p; }); }
  function tw(t) { // rough rendered width of TeX, in characters
    t = String(t).replace(/\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g, function (m, body) { return 'x'.repeat(M.max.apply(null, body.split('\\\\').map(function (r) { return M.ceil(tw(r)); }))); });
    t = t.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\(left|right)/g, '').replace(/\\[,;!:]|\\quad|\\ /g, ' ');
    var guard = 0; while (/\\[dt]?frac\{/.test(t) && guard++ < 40) t = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/, function (m, a, b) { return 'x'.repeat(M.ceil(M.max(tw(a), tw(b)))); });
    t = t.replace(/\^\{[^{}]*\}|_\{[^{}]*\}/g, function (s) { return 'x'.repeat(M.ceil((s.length - 3) * 0.6)); }).replace(/\\(sin|cos|tan|log|ln)/g, 'xxx').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_&]/g, '');
    var n = 0; for (var k = 0; k < t.length; k++) n += /[=+<>\-]/.test(t[k]) ? 1.8 : t[k] === ' ' ? 0 : t[k] === ',' ? 0.6 : 1; return n;
  }
  /* stack(tex): display math too wide for a phone becomes an aligned block, one "= …" per line */
  function stack(tex) {
    if (tw(tex) <= 38 || /\\begin\{aligned\}/.test(tex)) return tex;
    var parts = [], depth = 0, last = 0;
    for (var k = 0; k < tex.length; k++) { var ch = tex[k]; if (ch === '{') depth++; else if (ch === '}') depth--; else if (depth === 0 && tex.substr(k, 3) === ' = ') { parts.push(tex.slice(last, k)); last = k + 3; k += 2; } }
    parts.push(tex.slice(last));
    if (parts.length < 3) return tex;
    var rows = [parts[0] + ' &= ' + parts[1]];
    for (var j = 2; j < parts.length; j++) { if (tw(rows[rows.length - 1] + ' = ' + parts[j]) <= 36 && j < parts.length - 1) rows[rows.length - 1] += ' = ' + parts[j]; else rows.push('&= ' + parts[j]); }
    return '\\begin{aligned} ' + rows.join(' \\\\ ') + ' \\end{aligned}';
  }
  function widen(s) {
    if (typeof s !== 'string') return s; var out = '', i = 0;
    while (i < s.length) {
      if (s[i] === '$' && s[i + 1] === '$') { var e = s.indexOf('$$', i + 2); if (e < 0) { out += s.slice(i); break; } out += '$$' + stack(s.slice(i + 2, e)) + '$$'; i = e + 2; continue; }
      if (s[i] === '$' && s[i - 1] !== '\\') { var k = i + 1; while (k < s.length && !(s[k] === '$' && s[k - 1] !== '\\')) k++; var tex = s.slice(i + 1, k), m = /^[.,;:]/.exec(s.slice(k + 1)), pn = m ? m[0] : '';
        if (tw(tex) > 30) { out += '$$' + stack(tex + pn) + '$$'; i = k + 1 + pn.length; } else { out += s.slice(i, k + 1); i = k + 1; } continue; }
      out += s[i++];
    }
    return out;
  }
  var QE = 1.60e-19, ME = 9.11e-31, MP = 1.67e-27, HP = 6.63e-34, C = 3.00e8, HC = 1240, MU0 = 4 * PI * 1e-7, VS = 343, I0 = 1e-12;

  // ---------- numbers ----------
  function sig(x, n) { return parseFloat((+x).toPrecision(n || 3)); }
  function commas(s) { var p = String(s).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'); return p.join('.'); }
  /* tx(x, n): x to n significant figures as TeX (trailing zeros kept; scientific notation below 0.001 and from 100,000) */
  function tx(x, n) {
    n = n || 3; x = +x; if (x === 0) return '0';
    var a = M.abs(x), e = M.floor(M.log10(a) + 1e-12);
    if (e >= 5 || e <= -4) {
      var ms = (x / M.pow(10, e)).toFixed(n - 1);
      if (M.abs(+ms) >= 10) { e++; ms = (x / M.pow(10, e)).toFixed(n - 1); }
      return ms + ' \\times 10^{' + e + '}';
    }
    var s = x.toPrecision(n);
    if (/e/.test(s)) s = String(M.round(+s));
    return M.abs(+s) >= 1e4 ? commas(s) : s;
  }
  /* tg(x): a given value, written as it is (no trailing zeros added), scientific notation for big or small values */
  function two(x) { var s = String(sig(x, 8)); if (M.abs(x) < 10 && x !== 0 && s.replace(/^-?0*\.?0*/, '').replace('.', '').length < 2) s = (+x).toPrecision(2); return s; } // at least 2 significant figures: 2 -> 2.0, 0.3 -> 0.30
  function tg(x) { x = +x; var a = M.abs(x); if (a !== 0 && (a >= 1e5 || a < 1e-3)) { var e = M.floor(M.log10(a) + 1e-12), m = sig(x / M.pow(10, e), 6); if (M.abs(m) >= 10) { e++; m = sig(x / M.pow(10, e), 6); } return two(m) + ' \\times 10^{' + e + '}'; } var s = two(x); return a >= 1e4 ? commas(s) : s; }
  function nv(x, n) { return String(sig(x, n || 3)); }
  function ans(x, rtol, n) { return { t: 'num', v: nv(x, n || 3), rtol: rtol || 0.02 }; }
  function exact(x) { return { t: 'num', v: String(x) }; }
  function u(s) { return '\\ \\text{' + s + '}'; }
  function q(x, unit, n) { return tx(x, n) + (unit ? u(unit) : ''); }
  function g(x, unit) { return tg(x) + (unit ? u(unit) : ''); }
  function deg(x, n) { return tx(x, n || 3) + '^\\circ'; }
  function mc(correct, wrongs) { var seen = {}, w = []; seen[correct] = 1; wrongs.forEach(function (s) { if (!seen[s]) { seen[s] = 1; w.push(s); } }); return U.mc(correct, w.slice(0, 3), 4); }
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function shape(R, ctx, l1, l2, l3) { return R.pick(by(ctx, l1, l2 || l1, l3 || l2 || l1)); }
  function sind(a) { return M.sin(a * DEG); } function cosd(a) { return M.cos(a * DEG); }
  function asind(x) { return M.asin(x) / DEG; } function acosd(x) { return M.acos(x) / DEG; }
  // a value with a random mantissa and a power of ten: m × 10^e, m from the list
  function sci(R, mants, e) { return sig(R.pick(mants) * M.pow(10, e), 6); }

  // ---------- directions in the plane of the page (+x right, +y up, out of the page toward you) ----------
  var VEC = { '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], out: [0, 0, 1], 'in': [0, 0, -1] };
  var DW = { '+x': 'to the right', '-x': 'to the left', '+y': 'toward the top of the page', '-y': 'toward the bottom of the page', out: 'out of the page', 'in': 'into the page' };
  var DIRS = ['+x', '-x', '+y', '-y', 'out', 'in'];
  function dkey(v) { for (var k in VEC) { var a = VEC[k]; if (a[0] === v[0] && a[1] === v[1] && a[2] === v[2]) return k; } return null; }
  function dneg(k) { var a = VEC[k]; return dkey([-a[0], -a[1], -a[2]]); }
  function dcross(a, b) { var p = VEC[a], w = VEC[b], c = [p[1] * w[2] - p[2] * w[1], p[2] * w[0] - p[0] * w[2], p[0] * w[1] - p[1] * w[0]]; return c[0] || c[1] || c[2] ? dkey(c) : null; }
  function perp(a, b) { var p = VEC[a], w = VEC[b]; return p[0] * w[0] + p[1] * w[1] + p[2] * w[2] === 0; }
  /* direction choices: the right one plus three wrong ones, drawn from the given misconceptions first */
  function dirChoice(right, likely) { var w = []; (likely || []).forEach(function (k) { if (k && k !== right && w.indexOf(k) < 0) w.push(k); }); DIRS.forEach(function (k) { if (k !== right && w.indexOf(k) < 0) w.push(k); }); return mc(DW[right], w.slice(0, 3).map(function (k) { return DW[k]; })); }

// =========================================================================================== unit 5: magnetism
  var PARTS = [
    { name: 'a proton', q: 1, m: MP, mt: '1.67 \\times 10^{-27}' },
    { name: 'an electron', q: -1, m: ME, mt: '9.11 \\times 10^{-31}' },
    { name: 'an alpha particle (charge $+2e$, mass $6.64 \\times 10^{-27}\\ \\text{kg}$)', q: 2, m: 6.64e-27, mt: '6.64 \\times 10^{-27}' },
    { name: 'a deuteron (charge $+e$, mass $3.34 \\times 10^{-27}\\ \\text{kg}$)', q: 1, m: 3.34e-27, mt: '3.34 \\times 10^{-27}' }
  ];
  function qtex(p) { return p.q === 2 ? '3.20 \\times 10^{-19}' : '1.60 \\times 10^{-19}'; }

  G('phys2.magnetic-fields', function (R, ctx) {
    var s = shape(R, ctx, ['conv', 'conv', 'concept'], ['conv', 'ratio', 'concept', 'concept'], ['ratio', 'concept', 'concept', 'gauss']);
    if (s === 'conv') {
      var k = R.pick(['uT', 'mT', 'toMT', 'toUT']);
      if (k === 'uT') { var b = R.pick([25, 30, 35, 42, 48, 50, 55, 60, 65]); return { q: 'Earth\'s field at one place is $' + b + '\\ \\mu\\text{T}$. Write it in teslas.', a: ans(b * 1e-6, 0.01), unit: 'T', steps: ['The prefix $\\mu$ (micro) means $10^{-6}$.', '$' + b + '\\ \\mu\\text{T} = ' + b + ' \\times 10^{-6}\\ \\text{T} = ' + tx(b * 1e-6, 2) + '\\ \\text{T}$.'], hint: 'Micro means a millionth.' }; }
      if (k === 'mT') { var b2 = R.pick([2, 3.5, 5, 8, 12, 25, 40, 150, 350]); return { q: 'A small magnet makes a field of $' + b2 + '\\ \\text{mT}$ near its face. Write it in teslas.', a: ans(b2 * 1e-3, 0.01), unit: 'T', steps: ['The prefix m (milli) means $10^{-3}$.', '$' + b2 + '\\ \\text{mT} = ' + b2 + ' \\times 10^{-3}\\ \\text{T} = ' + tg(b2 * 1e-3) + '\\ \\text{T}$.'], hint: 'Milli means a thousandth.' }; }
      if (k === 'toMT') { var b3 = R.pick([0.0025, 0.004, 0.012, 0.035, 0.08, 0.15, 0.6]); return { q: 'Write $' + tg(b3) + '\\ \\text{T}$ in millitesla.', a: ans(b3 * 1e3, 0.01), unit: 'mT', steps: ['$1\\ \\text{T} = 1000\\ \\text{mT}$.', '$' + tg(b3) + ' \\times 1000 = ' + tg(sig(b3 * 1e3, 6)) + '\\ \\text{mT}$.'], hint: 'Multiply by 1000.' }; }
      var b4 = R.pick([3.2e-5, 4.5e-5, 5.8e-5, 2.6e-5, 1.5e-4, 6.0e-6]); return { q: 'Write $' + tg(b4) + '\\ \\text{T}$ in microtesla.', a: ans(b4 * 1e6, 0.01), unit: 'μT', steps: ['$1\\ \\text{T} = 10^{6}\\ \\mu\\text{T}$.', '$' + tg(b4) + ' \\times 10^{6} = ' + tg(sig(b4 * 1e6, 6)) + '\\ \\mu\\text{T}$.'], hint: 'There are a million microtesla in a tesla.' };
    }
    if (s === 'ratio') {
      var big = R.pick([[1.5, 'an MRI scanner'], [3.0, 'an MRI scanner'], [0.35, 'a lab electromagnet'], [0.005, 'a refrigerator magnet'], [0.012, 'a small magnet'], [7.0, 'a research MRI scanner']]), e = R.pick([30, 40, 45, 50, 60]), ratio = big[0] / (e * 1e-6);
      return { q: 'The field of ' + big[1] + ' is $' + tg(big[0]) + '\\ \\text{T}$. Earth\'s field there is $' + e + '\\ \\mu\\text{T}$. How many times stronger is the magnet\'s field?', a: ans(ratio, 0.02), steps: ['Same units first: $' + e + '\\ \\mu\\text{T} = ' + tg(e * 1e-6) + '\\ \\text{T}$.', '$$\\frac{' + tg(big[0]) + '}{' + tg(e * 1e-6) + '} = ' + tx(ratio) + '$$', 'The units cancel: about ' + commas(String(sig(ratio, 3))).replace(/\{,\}/g, ',') + ' times.'], hint: 'Put both fields in teslas, then divide.' };
    }
    if (s === 'gauss') {
      var gs = R.pick([0.5, 0.45, 60, 100, 2500, 15000]), T = gs * 1e-4;
      return { q: 'A field is $' + tg(gs) + '\\ \\text{G}$ (gauss). Write it in teslas. ($1\\ \\text{G} = 10^{-4}\\ \\text{T}$.)', a: ans(T, 0.01), unit: 'T', steps: ['Multiply by $10^{-4}$: $' + tg(gs) + ' \\times 10^{-4} = ' + tg(sig(T, 6)) + '\\ \\text{T}$.'], hint: 'One gauss is a ten-thousandth of a tesla.' };
    }
    var items = [
      ['Inside a bar magnet, which way do the magnetic field lines run?', 'From the south pole to the north pole', ['From the north pole to the south pole', 'They stop at the poles; there are none inside', 'Around the outside of the magnet only'], 'Field lines are closed loops: outside they run from N to S, and inside they continue from S back to N.', 'Field lines never start or stop.'],
      ['A bar magnet is cut in half across its middle. What do you get?', 'Two smaller magnets, each with a north and a south pole', ['One piece that is all north pole and one that is all south pole', 'Two pieces that are no longer magnets', 'One magnet and one piece that is not a magnet'], 'No one has ever isolated a single pole. Each piece is a complete magnet, because the field comes from tiny current loops throughout the iron.', 'Could you ever get a piece with just one pole?'],
      ['What produces every magnetic field?', 'Moving electric charge, including the spin and orbits of electrons', ['Magnetic charges sitting at the poles', 'Electric charges at rest', 'The mass of the magnet'], 'Currents make magnetic fields, and in a permanent magnet the electrons\' spins act as tiny currents.', 'Think of an electromagnet.'],
      ['Near a bar magnet, the north end of a compass needle points…', 'along the field: away from the magnet\'s north pole and toward its south pole', ['toward the magnet\'s north pole', 'at right angles to the field lines', 'straight at the middle of the magnet'], 'A compass needle lines up with the field, its north end pointing the way the field points, and the field points away from N and toward S.', 'Opposite poles attract.'],
      ['The north end of a compass points toward Earth\'s geographic North Pole. What kind of magnetic pole lies near the geographic North Pole?', 'A magnetic south pole', ['A magnetic north pole', 'No magnetic pole: the field there is zero', 'A positive electric charge'], 'The needle\'s north end is attracted, and opposite poles attract, so a magnetic south pole lies under the Arctic.', 'Like poles repel, unlike poles attract.'],
      ['Where is the field of a bar magnet strongest?', 'Near the poles, where the field lines crowd together', ['At the middle of its long side', 'Far from the magnet, where the lines spread out', 'It is the same everywhere around the magnet'], 'The density of field lines shows the strength, and the lines bunch up at the poles.', 'Look where the lines are closest together.'],
      ['How do magnetic field lines differ from electric field lines around charges?', 'Magnetic field lines always form closed loops', ['Magnetic field lines start on north poles and end on south poles', 'Magnetic field lines can cross each other', 'Magnetic field lines point at right angles to the field'], 'Electric field lines start and end on charges. There are no magnetic charges, so magnetic field lines close on themselves.', 'Is there a magnetic "charge" for a line to end on?']
    ];
    var it = R.pick(items);
    return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: it[4] };
  });

  G('phys2.force-on-moving-charge', function (R, ctx) {
    var s = shape(R, ctx, ['mag90', 'dir', 'mag90'], ['mag', 'dir', 'dir', 'mag90', 'rest'], ['mag', 'dir', 'solveB', 'solveV', 'rest']);
    var p = R.pick(PARTS.slice(0, ctx.level === 1 ? 2 : 4));
    if (s === 'dir') {
      var v, B; do { v = R.pick(DIRS); B = R.pick(DIRS); } while (!perp(v, B));
      if (ctx.level === 1 && R.chance(0.7)) { B = R.pick(['in', 'out']); v = R.pick(['+x', '-x', '+y', '-y']); }
      var qs = ctx.level === 1 ? 1 : R.pick([1, -1]), Fp = dcross(v, B), F = qs > 0 ? Fp : dneg(Fp);
      var who = qs > 0 ? R.pick(['A proton', 'A positive ion', 'A positron']) : R.pick(['An electron', 'A negative ion']);
      return { q: who + ' moves ' + DW[v] + ' through a magnetic field that points ' + DW[B] + '. Which way is the magnetic force on it?', a: dirChoice(F, [B, v, dneg(F)]),
        viz: { name: 'phys2-rhr', opts: { mode: 'force', v: v, B: B, q: qs, interactive: false, quiet: true } },
        steps: ['Right-hand rule: fingers ' + DW[v] + ' (along $\\vec{v}$), curled toward ' + DW[B] + ' (along $\\vec{B}$).', 'Your thumb points ' + DW[Fp] + '.', qs > 0 ? 'The charge is positive, so the force points ' + DW[F] + '.' : 'The charge is negative, so reverse it: the force points ' + DW[F] + '.', 'Check: $\\vec{F}$ is at right angles to both $\\vec{v}$ and $\\vec{B}$.'],
        hint: qs > 0 ? 'Fingers along v, curl toward B, thumb gives F.' : 'Use the right-hand rule, then flip it for a negative charge.' };
    }
    if (s === 'rest') {
      var Bv = R.pick([0.20, 0.50, 1.2, 2.0]), along = R.coin();
      return { q: along ? 'An electron moves at $2.0 \\times 10^{6}\\ \\text{m/s}$ exactly along the field lines of a $' + tg(Bv) + '\\ \\text{T}$ field. How big is the magnetic force on it?' : 'A proton sits at rest in a $' + tg(Bv) + '\\ \\text{T}$ magnetic field. How big is the magnetic force on it?', a: exact(0), unit: 'N',
        steps: [along ? 'Moving along the field means $\\theta = 0$, and $\\sin 0 = 0$.' : 'At rest, $v = 0$.', '$F = |q|vB\\sin\\theta = 0$: there is no magnetic force.'], hint: 'Look at each factor in F = |q|vB sin θ.' };
    }
    var vm = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0]), ve = R.int(4, 6), vv = vm * M.pow(10, ve), Bm = R.pick([0.050, 0.10, 0.20, 0.25, 0.40, 0.50, 0.80, 1.2, 1.5]);
    var th = s === 'mag90' ? 90 : R.pick([30, 45, 60, 25, 70]), qa = M.abs(p.q) * QE, F = qa * vv * Bm * sind(th);
    var qtx = qtex(p), vtx = g(vv), Btx = tg(Bm);
    if (s === 'solveB') {
      return { q: 'What field strength, at right angles to the motion, pushes ' + p.name.replace(/ \(.*\)/, '') + ' moving at $' + vtx + '\\ \\text{m/s}$ with a force of $' + tx(qa * vv * Bm, 3) + '\\ \\text{N}$?' + (p.q === 2 ? ' (Its charge is $+2e$.)' : ''), a: ans(Bm, 0.02), unit: 'T',
        steps: ['$F = |q|vB$, so $B = \\dfrac{F}{|q|v}$.', '$$B = \\frac{' + tx(qa * vv * Bm, 3) + '}{(' + qtx + ')(' + tg(vv) + ')}$$', '$B = ' + q(Bm, 'T') + '$.'], hint: 'Solve F = |q|vB for B.' };
    }
    if (s === 'solveV') {
      return { q: 'A proton crosses a $' + Btx + '\\ \\text{T}$ field at right angles and feels a force of $' + tx(QE * vv * Bm, 3) + '\\ \\text{N}$. How fast is it moving?', a: ans(vv, 0.02), unit: 'm/s',
        steps: ['$F = qvB$, so $v = \\dfrac{F}{qB}$.', '$$v = \\frac{' + tx(QE * vv * Bm, 3) + '}{(1.60 \\times 10^{-19})(' + Btx + ')}$$', '$v = ' + q(vv, 'm/s') + '$.'], hint: 'Solve F = qvB for v.' };
    }
    return { q: (p.name.charAt(0).toUpperCase() + p.name.slice(1)) + ' moves at $' + vtx + '\\ \\text{m/s}$ ' + (th === 90 ? 'at right angles to' : 'at $' + th + '^\\circ$ to') + ' a $' + Btx + '\\ \\text{T}$ magnetic field. How big is the magnetic force on it?', a: ans(F, 0.02), unit: 'N',
      steps: ['$|q| = ' + qtx + '\\ \\text{C}$' + (th === 90 ? ' and $\\sin 90^\\circ = 1$.' : ' and $\\sin ' + th + '^\\circ = ' + tx(sind(th), 3) + '$.'), '$$\\begin{aligned} F &= |q|vB\\sin\\theta \\\\ &= (' + qtx + ')(' + tg(vv) + ') \\\\ &\\quad \\times (' + Btx + ')' + (th === 90 ? '' : '(' + tx(sind(th), 3) + ')') + ' \\end{aligned}$$', '$F = ' + q(F, 'N') + '$.'],
      hint: 'Use F = |q|vB sin θ, with θ the angle between v and B.' };
  });

  G('phys2.charged-particle-circles', function (R, ctx) {
    var s = shape(R, ctx, ['radius', 'concept', 'sense'], ['radius', 'solveB', 'period', 'sense', 'concept', 'spectro'], ['radius', 'accel', 'solveV', 'period', 'spectro', 'concept']);
    var p = R.pick(ctx.level === 1 ? PARTS.slice(0, 2) : PARTS), qa = M.abs(p.q) * QE;
    var vv = sig(R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0]) * M.pow(10, p.q < 0 ? 6 : R.int(5, 6)), 6), B = R.pick(p.q < 0 ? [0.0010, 0.0020, 0.0050, 0.010, 0.020] : [0.10, 0.20, 0.25, 0.40, 0.50, 0.80, 1.0]);
    var r = p.m * vv / (qa * B), nm = p.name.replace(/ \(.*\)/, ''), info = p.name.indexOf('(') >= 0 ? ' (' + p.name.split('(')[1] : '';
    if (s === 'sense') {
      var Bd = R.pick(['in', 'out']), pos = R.coin(), ccw = (Bd === 'in') === pos;
      return { q: 'Seen from where you are, ' + (pos ? 'a proton' : 'an electron') + ' moves in a circle in the plane of the page, in a uniform field pointing ' + DW[Bd] + '. Which way does it go around?', a: mc(ccw ? 'Counterclockwise' : 'Clockwise', [ccw ? 'Clockwise' : 'Counterclockwise', 'Either way, depending on its speed', 'It does not circle; it moves along the field']),
        viz: { name: 'phys2-rhr', opts: { mode: 'force', v: '+x', B: Bd, q: pos ? 1 : -1, interactive: false, quiet: true } },
        steps: ['Take a moment when it moves to the right. Fingers to the right, curl ' + DW[Bd] + ': the thumb points ' + DW[dcross('+x', Bd)] + '.', pos ? 'Positive charge: the force points ' + DW[dcross('+x', Bd)] + ', so the path bends that way.' : 'Negative charge: reverse it. The force points ' + DW[dneg(dcross('+x', Bd))] + ', so the path bends that way.', 'Moving right and turning ' + (ccw ? 'up' : 'down') + ' is ' + (ccw ? 'counterclockwise' : 'clockwise') + '.'],
        hint: 'Pick one moment, find the force with the right-hand rule, and see which way the path bends.' };
    }
    if (s === 'concept') {
      var it = R.pick([
        ['A charged particle circles in a uniform magnetic field. What happens to its kinetic energy as it goes around?', 'It stays the same', ['It increases', 'It decreases', 'It increases on one half of the circle and decreases on the other'], 'The magnetic force is always at right angles to the velocity, so it does no work. The speed and kinetic energy never change.'],
        ['A proton circles in a uniform magnetic field. If its speed is doubled, what happens to the radius and the time for one lap?', 'The radius doubles; the time for one lap stays the same', ['The radius doubles; the lap time doubles', 'The radius halves; the lap time halves', 'The radius stays the same; the lap time halves'], '$r = mv/(|q|B)$ is proportional to $v$, and $T = 2\\pi m/(|q|B)$ has no $v$ in it.'],
        ['Two ions with the same charge and speed enter the same magnetic field. Ion A has twice the mass of ion B. How do their radii compare?', 'A\'s radius is twice B\'s', ['A\'s radius is half B\'s', 'They are the same', 'A\'s radius is four times B\'s'], '$r = mv/(|q|B)$ is proportional to the mass when $v$, $q$ and $B$ are the same. This is how a mass spectrometer sorts ions.'],
        ['The field is made twice as strong while a charged particle circles at the same speed. What happens to the radius?', 'It is halved', ['It doubles', 'It stays the same', 'It becomes four times smaller'], '$r = mv/(|q|B)$, so $r$ is inversely proportional to $B$.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Use r = mv/(|q|B) and T = 2πm/(|q|B).' };
    }
    if (s === 'spectro') {
      var iso = R.pick([[12, 13, 'carbon-12', 'carbon-13'], [35, 37, 'chlorine-35', 'chlorine-37'], [20, 22, 'neon-20', 'neon-22'], [235, 238, 'uranium-235', 'uranium-238'], [16, 18, 'oxygen-16', 'oxygen-18']]);
      var r1 = R.pick([10.0, 12.0, 15.0, 20.0, 24.0, 30.0]), r2 = r1 * iso[1] / iso[0];
      return { q: 'In a mass spectrometer, ions of ' + iso[2] + ' and ' + iso[3] + ' with the same charge and speed enter the same field. The ' + iso[2] + ' ions follow a circle of radius $' + tg(r1) + '\\ \\text{cm}$. Find the radius for ' + iso[3] + '. (Take the masses in proportion to ' + iso[0] + ' and ' + iso[1] + '.)', a: ans(r2, 0.01), unit: 'cm',
        steps: ['$r = \\dfrac{mv}{|q|B}$, and $v$, $q$, $B$ are the same, so $r \\propto m$.', '$$r_2 = ' + tg(r1) + '\\times\\frac{' + iso[1] + '}{' + iso[0] + '} = ' + tx(r2) + '\\ \\text{cm}$$'], hint: 'With the same q, v and B, the radius is proportional to the mass.' };
    }
    if (s === 'period') {
      var T = 2 * PI * p.m / (qa * B);
      return { q: 'How long does ' + nm + info + ' take to go once around its circle in a $' + tg(B) + '\\ \\text{T}$ field?', a: ans(T, 0.02), unit: 's',
        steps: ['$T = \\dfrac{2\\pi r}{v}$ with $r = \\dfrac{mv}{|q|B}$, so $T = \\dfrac{2\\pi m}{|q|B}$: the speed cancels.', '$$T = \\frac{2\\pi(' + p.mt + ')}{(' + qtex(p) + ')(' + tg(B) + ')}$$', '$T = ' + q(T, 's') + '$.'], hint: 'The period does not depend on the speed: T = 2πm/(|q|B).' };
    }
    if (s === 'solveB') {
      return { q: 'What magnetic field makes ' + nm + info + ' moving at $' + g(vv) + '\\ \\text{m/s}$ travel in a circle of radius $' + tx(r) + '\\ \\text{m}$?', a: ans(B, 0.02), unit: 'T',
        steps: ['$r = \\dfrac{mv}{|q|B}$, so $B = \\dfrac{mv}{|q|r}$.', '$$B = \\frac{(' + p.mt + ')(' + tg(vv) + ')}{(' + qtex(p) + ')(' + tx(r) + ')}$$', '$B = ' + q(B, 'T') + '$.'], hint: 'Solve r = mv/(|q|B) for B.' };
    }
    if (s === 'solveV') {
      return { q: nm.charAt(0).toUpperCase() + nm.slice(1) + info + ' circles with radius $' + tx(r) + '\\ \\text{m}$ in a $' + tg(B) + '\\ \\text{T}$ field. How fast is it moving?', a: ans(vv, 0.02), unit: 'm/s',
        steps: ['$v = \\dfrac{|q|Br}{m}$.', '$$v = \\frac{(' + qtex(p) + ')(' + tg(B) + ')(' + tx(r) + ')}{' + p.mt + '}$$', '$v = ' + q(vv, 'm/s') + '$.'], hint: 'Solve r = mv/(|q|B) for v.' };
    }
    if (s === 'accel') {
      var el = R.coin(), mm = el ? ME : MP, V = R.pick(el ? [50, 100, 200, 250, 500, 1000] : [500, 1000, 2000, 5000]), B2 = R.pick(el ? [0.0010, 0.0020, 0.0050] : [0.10, 0.20, 0.50]);
      var K = QE * V, v2 = M.sqrt(2 * K / mm), r2 = mm * v2 / (QE * B2);
      return { q: (el ? 'An electron' : 'A proton') + ' is accelerated from rest through $' + V + '\\ \\text{V}$, then enters a $' + tg(B2) + '\\ \\text{T}$ field at right angles. Find the radius of its circle.', a: ans(r2, 0.03), unit: 'm',
        steps: ['Energy gained: $K = eV = (1.60 \\times 10^{-19})(' + V + ') = ' + q(K, 'J') + '$.', '$$v = \\sqrt{\\frac{2K}{m}} = ' + q(v2, 'm/s') + '$$', '$$r = \\frac{mv}{eB} = \\frac{(' + (el ? '9.11 \\times 10^{-31}' : '1.67 \\times 10^{-27}') + ')(' + tx(v2) + ')}{(1.60 \\times 10^{-19})(' + tg(B2) + ')}$$', '$r = ' + q(r2, 'm') + '$.'], hint: 'Find the speed from K = eV first, then use r = mv/(eB).' };
    }
    return { q: (nm.charAt(0).toUpperCase() + nm.slice(1)) + info + ' moves at $' + g(vv) + '\\ \\text{m/s}$ at right angles to a $' + tg(B) + '\\ \\text{T}$ field. Find the radius of its circular path.', a: ans(r, 0.02), unit: 'm',
      steps: ['The magnetic force supplies the centripetal force: $|q|vB = \\dfrac{mv^{2}}{r}$, so $r = \\dfrac{mv}{|q|B}$.', '$$r = \\frac{(' + p.mt + ')(' + tg(vv) + ')}{(' + qtex(p) + ')(' + tg(B) + ')}$$', '$r = ' + q(r, 'm') + '$.'], hint: 'Set |q|vB equal to mv²/r.' };
  });

  G('phys2.force-on-wire', function (R, ctx) {
    var s = shape(R, ctx, ['mag90', 'dir', 'mag90'], ['mag', 'dir', 'lift', 'electrons'], ['mag', 'lift', 'solveB', 'electrons', 'dir']);
    if (s === 'dir' || s === 'electrons') {
      var I, B; do { I = R.pick(DIRS); B = R.pick(DIRS); } while (!perp(I, B));
      if (ctx.level === 1 || R.chance(0.5)) { I = R.pick(['+x', '-x', '+y', '-y']); B = R.pick(['in', 'out', '+x', '-x', '+y', '-y']); while (!perp(I, B)) B = R.pick(['in', 'out']); }
      var F = dcross(I, B), e = s === 'electrons', ed = dneg(I);
      var pw = { q: e ? 'In a wire, electrons drift ' + DW[ed] + '. The wire sits in a magnetic field pointing ' + DW[B] + '. Which way is the magnetic force on the wire?' : 'A wire carries a current ' + DW[I] + ' through a magnetic field pointing ' + DW[B] + '. Which way is the magnetic force on the wire?',
        a: dirChoice(F, [dneg(F), B, I]),
        steps: (e ? ['Electrons are negative, so the conventional current runs the other way: ' + DW[I] + '.'] : []).concat(['Fingers along the current (' + DW[I] + '), curled toward $\\vec{B}$ (' + DW[B] + ').', 'Your thumb points ' + DW[F] + ': that is $\\vec{F}$.', 'Check: the force is at right angles to both the wire and the field.']),
        hint: e ? 'First find the direction of the conventional current.' : 'Fingers along I, curl toward B, thumb along F.' };
      if (!e) pw.viz = { name: 'phys2-rhr', opts: { mode: 'wire', v: I, B: B, interactive: false, quiet: true } };
      return pw;
    }
    var I2 = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 8.0, 10, 12, 15]), Ln = R.pick([0.20, 0.25, 0.40, 0.50, 0.75, 1.0, 1.5, 2.0]), B2 = R.pick([0.050, 0.10, 0.15, 0.20, 0.30, 0.40, 0.60, 0.80]);
    if (s === 'lift') {
      var lam = R.pick([0.010, 0.020, 0.025, 0.040, 0.050, 0.080]), Bh = R.pick([0.20, 0.25, 0.40, 0.50, 0.80]), need = lam * 9.8 / Bh;
      return { q: 'A horizontal wire has a mass of $' + tg(lam) + '\\ \\text{kg}$ per meter and sits at right angles to a horizontal $' + tg(Bh) + '\\ \\text{T}$ field. What current makes the magnetic force hold up its weight? ($g = 9.8\\ \\text{m/s}^2$.)', a: ans(need, 0.02), unit: 'A',
        steps: ['For a length $L$: weight $= (' + tg(lam) + 'L)(9.8)$, magnetic force $= ILB$.', 'Set them equal; $L$ cancels: $I(' + tg(Bh) + ') = (' + tg(lam) + ')(9.8)$.', '$I = ' + q(need, 'A') + '$.'], hint: 'Set ILB equal to the weight of the same length L.' };
    }
    var th = s === 'mag90' ? 90 : R.pick([30, 45, 60, 20, 75]), F2 = I2 * Ln * B2 * sind(th);
    if (s === 'solveB') {
      var Fg = sig(I2 * Ln * B2, 3);
      return { q: 'A $' + tg(Ln) + '\\ \\text{m}$ wire carrying $' + tg(I2) + '\\ \\text{A}$ at right angles to a magnetic field feels a force of $' + tx(Fg) + '\\ \\text{N}$. How strong is the field?', a: ans(Fg / (I2 * Ln), 0.02), unit: 'T',
        steps: ['$F = ILB$, so $B = \\dfrac{F}{IL}$.', '$B = \\dfrac{' + tx(Fg) + '}{(' + tg(I2) + ')(' + tg(Ln) + ')} = ' + q(Fg / (I2 * Ln), 'T') + '$.'], hint: 'Solve F = ILB for B.' };
    }
    return { q: 'A straight wire $' + tg(Ln) + '\\ \\text{m}$ long carries $' + tg(I2) + '\\ \\text{A}$ ' + (th === 90 ? 'at right angles to' : 'at $' + th + '^\\circ$ to') + ' a $' + tg(B2) + '\\ \\text{T}$ field. How big is the force on it?', a: ans(F2, 0.02), unit: 'N',
      steps: [th === 90 ? 'At right angles, $\\sin 90^\\circ = 1$.' : '$\\sin ' + th + '^\\circ = ' + tx(sind(th)) + '$.', '$$F = ILB\\sin\\theta = (' + tg(I2) + ')(' + tg(Ln) + ')(' + tg(B2) + ')' + (th === 90 ? '' : '(' + tx(sind(th)) + ')') + '$$', '$F = ' + q(F2, 'N') + '$.'], hint: 'F = ILB sin θ, with θ between the wire and the field.' };
  });

  G('phys2.field-of-wire', function (R, ctx) {
    var s = shape(R, ctx, ['wire', 'dir', 'wire', 'attract'], ['wire', 'dir', 'solenoid', 'force', 'attract', 'solveI'], ['wire', 'solenoid', 'force', 'mid', 'turns', 'dir']);
    if (s === 'dir') {
      var I = R.pick(DIRS), P; do { P = R.pick(['+x', '-x', '+y', '-y']); } while (!perp(I, P));
      var Bd = dcross(I, P), side = { '+x': 'to the right of', '-x': 'to the left of', '+y': 'above', '-y': 'below' }[P];
      return { q: 'A long straight wire carries current ' + DW[I] + '. Point P is ' + side + ' the wire' + (VEC[I][2] ? ' (seen end-on)' : '') + '. Which way does the wire\'s magnetic field point at P?', a: dirChoice(Bd, [dneg(Bd), I, P]),
        viz: { name: 'phys2-rhr', opts: { mode: 'field', v: I, P: P, interactive: false, quiet: true } },
        steps: ['Right-hand rule for a wire: thumb along the current (' + DW[I] + '); your fingers curl the way the field circles.', 'At P, ' + side + ' the wire, the curling fingers point ' + DW[Bd] + '.', 'The field at P is at right angles to both the wire and the line from the wire to P.'], hint: 'Thumb along the current; fingers show the field.' };
    }
    if (s === 'attract') {
      var same = R.coin(), w = R.pick(['Two long parallel wires carry currents', 'Two parallel power cables carry currents']);
      return { q: w + ' in ' + (same ? 'the same direction' : 'opposite directions') + '. What do the wires do to each other?', a: mc(same ? 'They attract each other' : 'They repel each other', [same ? 'They repel each other' : 'They attract each other', 'There is no force between them', 'They twist to point at right angles']),
        steps: ['Wire 1 makes a field at wire 2; wire 2\'s current feels $F = ILB$ in that field.', 'Working the two right-hand rules: ' + (same ? 'same-direction currents pull together.' : 'opposite currents push apart.'), 'This is the reverse of the rule for charges: like currents attract.'], hint: 'Use the wire rule for the field, then the force rule for the other wire.' };
    }
    var I2 = R.pick([2.0, 4.0, 5.0, 6.0, 8.0, 10, 12, 15, 20, 25]), r = R.pick([0.010, 0.020, 0.025, 0.040, 0.050, 0.080, 0.10, 0.20]), B = 2e-7 * I2 / r;
    if (s === 'wire') return { q: 'A long straight wire carries $' + tg(I2) + '\\ \\text{A}$. Find the magnetic field $' + tg(r * 100) + '\\ \\text{cm}$ from it.', a: ans(B, 0.02), unit: 'T',
      steps: ['$r = ' + tg(r) + '\\ \\text{m}$, and $\\dfrac{\\mu_0}{2\\pi} = 2 \\times 10^{-7}\\ \\text{T·m/A}$.', '$$B = \\frac{\\mu_0 I}{2\\pi r} = (2 \\times 10^{-7})\\frac{' + tg(I2) + '}{' + tg(r) + '}$$', '$B = ' + q(B, 'T') + '$.'], hint: 'B = μ₀I/(2πr), with r in meters.' };
    if (s === 'solveI') return { q: 'How much current must a long straight wire carry to make a field of $' + tx(B) + '\\ \\text{T}$ at a distance of $' + tg(r * 100) + '\\ \\text{cm}$?', a: ans(I2, 0.02), unit: 'A',
      steps: ['$B = \\dfrac{\\mu_0 I}{2\\pi r}$, so $I = \\dfrac{2\\pi r B}{\\mu_0} = \\dfrac{rB}{2 \\times 10^{-7}}$.', '$$I = \\frac{(' + tg(r) + ')(' + tx(B) + ')}{2 \\times 10^{-7}} = ' + q(I2, 'A') + '$$'], hint: 'Solve B = μ₀I/(2πr) for I.' };
    if (s === 'solenoid' || s === 'turns') {
      var N = R.pick([200, 300, 400, 500, 600, 800, 1000, 1200]), Ls = R.pick([0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50]), Is = R.pick([0.50, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0]), n = N / Ls, Bs = MU0 * n * Is;
      if (s === 'turns') return { q: 'A solenoid $' + tg(Ls) + '\\ \\text{m}$ long carries $' + tg(Is) + '\\ \\text{A}$ and has a field of $' + tx(Bs) + '\\ \\text{T}$ inside. How many turns does it have?', a: ans(N, 0.02),
        steps: ['$B = \\mu_0 nI$, so $n = \\dfrac{B}{\\mu_0 I} = \\dfrac{' + tx(Bs) + '}{(4\\pi \\times 10^{-7})(' + tg(Is) + ')} = ' + tx(n) + '\\ \\text{m}^{-1}$.', '$N = nL = (' + tx(n) + ')(' + tg(Ls) + ') = ' + tx(N) + '$ turns.'], hint: 'Find the turns per meter first.' };
      return { q: 'A solenoid $' + tg(Ls) + '\\ \\text{m}$ long has $' + N + '$ turns and carries $' + tg(Is) + '\\ \\text{A}$. Find the field inside.', a: ans(Bs, 0.02), unit: 'T',
        steps: ['Turns per meter: $n = \\dfrac{' + N + '}{' + tg(Ls) + '} = ' + tx(n) + '\\ \\text{m}^{-1}$.', '$$B = \\mu_0 nI = (4\\pi \\times 10^{-7})(' + tx(n) + ')(' + tg(Is) + ')$$', '$B = ' + q(Bs, 'T') + '$.'], hint: 'B = μ₀nI, where n is turns per meter.' };
    }
    if (s === 'force') {
      var I1 = R.pick([2.0, 3.0, 5.0, 8.0, 10, 15]), I3 = R.pick([2.0, 4.0, 6.0, 10, 12, 20]), d = R.pick([0.0050, 0.010, 0.020, 0.030, 0.050, 0.10]), f = 2e-7 * I1 * I3 / d, same2 = R.coin();
      return { q: 'Two long parallel wires $' + tg(d * 100) + '\\ \\text{cm}$ apart carry $' + tg(I1) + '\\ \\text{A}$ and $' + tg(I3) + '\\ \\text{A}$ in ' + (same2 ? 'the same direction' : 'opposite directions') + '. Find the force per meter on each wire.', a: ans(f, 0.02), unit: 'N/m',
        steps: ['$$\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d} = (2 \\times 10^{-7})\\frac{(' + tg(I1) + ')(' + tg(I3) + ')}{' + tg(d) + '}$$', '$F/L = ' + q(f, 'N/m') + '$, ' + (same2 ? 'attracting' : 'repelling') + '.', 'Both wires feel the same size force (Newton\'s third law).'], hint: 'F/L = μ₀I₁I₂/(2πd) with d in meters.' };
    }
    // mid: two parallel wires, the field halfway between them
    var Ia = R.pick([4.0, 5.0, 6.0, 10, 12]), Ib = R.pick([2.0, 3.0, 8.0, 15, 20]), dd = R.pick([0.040, 0.060, 0.080, 0.10, 0.20]), opp = R.coin(), Ba = 2e-7 * Ia / (dd / 2), Bb = 2e-7 * Ib / (dd / 2), net = opp ? Ba + Bb : M.abs(Ba - Bb);
    return { q: 'Two long parallel wires $' + tg(dd * 100) + '\\ \\text{cm}$ apart carry $' + tg(Ia) + '\\ \\text{A}$ and $' + tg(Ib) + '\\ \\text{A}$ in ' + (opp ? 'opposite directions' : 'the same direction') + '. How strong is the magnetic field halfway between them?', a: ans(net, 0.02), unit: 'T',
      steps: ['Each wire is $' + tg(dd / 2) + '\\ \\text{m}$ from the midpoint: $B_1 = ' + q(Ba, 'T') + '$ and $B_2 = ' + q(Bb, 'T') + '$.', opp ? 'With opposite currents, the right-hand rule gives both fields the same direction between the wires, so they add.' : 'With currents in the same direction, the two fields point opposite ways between the wires, so they subtract.', '$B = ' + q(net, 'T') + '$.'], hint: 'Find each field, then decide whether they add or subtract between the wires.' };
  });

  G('phys2.magnetic-flux', function (R, ctx) {
    var s = shape(R, ctx, ['normal', 'normal', 'concept'], ['normal', 'plane', 'circle', 'concept'], ['plane', 'circle', 'solveB', 'rect']);
    var B = R.pick([0.10, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.80, 1.2]);
    if (s === 'concept') {
      var it = R.pick([
        ['How should a flat loop be turned to catch the most magnetic flux from a uniform field?', 'With its normal along the field, so the field passes straight through it', ['With its plane along the field lines', 'At $45^\\circ$ to the field', 'It makes no difference'], 'At $\\theta = 0$ (normal along the field), $\\cos\\theta = 1$, the largest value.'],
        ['A flat loop lies in a plane that contains the field lines (the field skims along its surface). What is the flux through it?', 'Zero', ['$BA$, its largest value', '$\\frac{1}{2}BA$', 'It depends on the shape of the loop'], 'The normal is at $90^\\circ$ to the field, and $\\cos 90^\\circ = 0$: no field passes through.'],
        ['A field makes an angle of $25^\\circ$ with the plane of a loop. What angle goes into $\\Phi = BA\\cos\\theta$?', '$65^\\circ$', ['$25^\\circ$', '$155^\\circ$', '$115^\\circ$'], 'The angle in the formula is measured from the normal, which is $90^\\circ$ from the plane: $90^\\circ - 25^\\circ = 65^\\circ$.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'θ is measured from the loop\'s normal.' };
    }
    var A = R.pick([0.010, 0.020, 0.040, 0.050, 0.10, 0.15, 0.20, 0.25]), th = s === 'normal' ? R.pick(ctx.level === 1 ? [0, 0, 60] : [0, 30, 60, 45]) : R.pick([20, 30, 40, 45, 60, 70]);
    if (s === 'normal') { var F = B * A * cosd(th); return { q: 'A loop of area $' + tg(A) + '\\ \\text{m}^2$ sits in a $' + tg(B) + '\\ \\text{T}$ field. ' + (th === 0 ? 'The field passes straight through it (along its normal).' : 'Its normal makes $' + th + '^\\circ$ with the field.') + ' Find the flux.', a: ans(F, 0.02), unit: 'Wb', steps: ['$\\Phi = BA\\cos\\theta$ with $\\theta = ' + th + '^\\circ$ from the normal.', '$\\Phi = (' + tg(B) + ')(' + tg(A) + ')(' + tx(cosd(th)) + ') = ' + q(F, 'Wb') + '$.'], hint: 'Φ = BA cos θ.' }; }
    if (s === 'plane') { var thn = 90 - th, F2 = B * A * cosd(thn); return { q: 'A uniform $' + tg(B) + '\\ \\text{T}$ field makes an angle of $' + th + '^\\circ$ with the <b>plane</b> of a loop of area $' + tg(A) + '\\ \\text{m}^2$. Find the flux through the loop.', a: ans(F2, 0.02), unit: 'Wb', steps: ['Measure from the normal: $\\theta = 90^\\circ - ' + th + '^\\circ = ' + thn + '^\\circ$.', '$$\\Phi = BA\\cos\\theta = (' + tg(B) + ')(' + tg(A) + ')\\cos ' + thn + '^\\circ$$', '$\\Phi = ' + q(F2, 'Wb') + '$.'], hint: 'The angle in the formula is from the normal, not from the plane.' }; }
    if (s === 'circle') { var rc = R.pick([0.050, 0.080, 0.10, 0.12, 0.15, 0.20]), Ac = PI * rc * rc, th2 = R.pick([0, 30, 45, 60]), F3 = B * Ac * cosd(th2); return { q: 'A circular loop of radius $' + tg(rc * 100) + '\\ \\text{cm}$ is in a $' + tg(B) + '\\ \\text{T}$ field. ' + (th2 === 0 ? 'The field passes straight through the loop.' : 'Its normal is $' + th2 + '^\\circ$ from the field.') + ' Find the flux.', a: ans(F3, 0.02), unit: 'Wb', steps: ['Area: $A = \\pi r^{2} = \\pi(' + tg(rc) + ')^{2} = ' + q(Ac, 'm', 3) + '^2$.', '$\\Phi = BA\\cos\\theta = (' + tg(B) + ')(' + tx(Ac) + ')(' + tx(cosd(th2)) + ')$.', '$\\Phi = ' + q(F3, 'Wb') + '$.'], hint: 'Find the area πr² in square meters first.' }; }
    if (s === 'rect') { var a1 = R.pick([10, 15, 20, 25, 30]), b1 = R.pick([8, 10, 12, 20, 40]), Ar = a1 * b1 / 1e4, th3 = R.pick([30, 45, 60]), F4 = B * Ar * cosd(th3); return { q: 'A rectangular loop $' + a1 + '\\ \\text{cm}$ by $' + b1 + '\\ \\text{cm}$ has its normal at $' + th3 + '^\\circ$ to a $' + tg(B) + '\\ \\text{T}$ field. Find the flux.', a: ans(F4, 0.02), unit: 'Wb', steps: ['Area in square meters: $(' + tg(a1 / 100) + ')(' + tg(b1 / 100) + ') = ' + tg(Ar) + '\\ \\text{m}^2$.', '$\\Phi = (' + tg(B) + ')(' + tg(Ar) + ')\\cos ' + th3 + '^\\circ = ' + q(F4, 'Wb') + '$.'], hint: 'Convert centimeters to meters before multiplying.' }; }
    var Fl = sig(B * A * cosd(th), 3);
    return { q: 'The flux through a loop of area $' + tg(A) + '\\ \\text{m}^2$ is $' + tx(Fl) + '\\ \\text{Wb}$ when its normal is $' + th + '^\\circ$ from a uniform field. How strong is the field?', a: ans(Fl / (A * cosd(th)), 0.02), unit: 'T',
      steps: ['$B = \\dfrac{\\Phi}{A\\cos\\theta} = \\dfrac{' + tx(Fl) + '}{(' + tg(A) + ')\\cos ' + th + '^\\circ}$.', '$B = ' + q(Fl / (A * cosd(th)), 'T') + '$.'], hint: 'Solve Φ = BA cos θ for B.' };
  });

  G('phys2.faradays-law', function (R, ctx) {
    var s = shape(R, ctx, ['dB', 'dB', 'steady'], ['dB', 'rotate', 'current', 'steady', 'graph'], ['dB', 'rotate', 'area', 'time', 'graph', 'current']);
    var N = R.pick([1, 10, 20, 50, 100, 200, 250, 500]), A = R.pick([0.0050, 0.010, 0.020, 0.040, 0.050, 0.10]);
    if (s === 'steady') {
      var B = R.pick([0.50, 1.2, 2.0, 1.5]);
      return { q: 'A strong magnet makes a steady $' + tg(B) + '\\ \\text{T}$ field straight through a coil of ' + N + ' turns. Nothing moves or changes. What emf is induced?', a: exact(0), unit: 'V',
        steps: ['Faraday\'s law: $\\varepsilon = -N\\dfrac{\\Delta\\Phi}{\\Delta t}$.', 'The flux is large but not changing, so $\\Delta\\Phi = 0$ and $\\varepsilon = 0$.'], hint: 'Only a change in flux makes an emf.' };
    }
    if (s === 'graph') {
      var p1 = R.pick([0.20, 0.30, 0.40, 0.60]), t1 = R.pick([2, 4]), t2 = R.pick([2, 3]), t3 = R.pick([1, 2]), Nn = R.pick([10, 20, 50]), which = R.pick(['rise', 'flat', 'fall']);
      var e = which === 'rise' ? Nn * p1 / t1 : which === 'flat' ? 0 : Nn * p1 / t3, when = which === 'rise' ? 'from $t = 0$ to $t = ' + t1 + '\\ \\text{s}$' : which === 'flat' ? 'from $t = ' + t1 + '$ to $' + (t1 + t2) + '\\ \\text{s}$' : 'from $t = ' + (t1 + t2) + '$ to $' + (t1 + t2 + t3) + '\\ \\text{s}$';
      return { q: 'The flux through each turn of a ' + Nn + '-turn coil rises steadily from $0$ to $' + tg(p1) + '\\ \\text{Wb}$ in ' + t1 + ' s, stays at $' + tg(p1) + '\\ \\text{Wb}$ for ' + t2 + ' s, then falls steadily to $0$ in ' + t3 + ' s. What is the size of the emf ' + when + '?', a: which === 'flat' ? exact(0) : ans(e, 0.02), unit: 'V',
        viz: { name: 'graph', opts: { fns: [{ f: sig(p1 / t1, 6) + '*x', from: 0, to: t1, color: 'blue', label: ' ' }, { f: String(p1), from: t1, to: t1 + t2, color: 'blue', label: ' ' }, { f: p1 + '-' + sig(p1 / t3, 6) + '*(x-' + (t1 + t2) + ')', from: t1 + t2, to: t1 + t2 + t3, color: 'blue', label: ' ' }], xmin: 0, xmax: t1 + t2 + t3 + 1, ymin: 0, ymax: sig(p1 * 1.3, 2), xlabel: 't (s)', ylabel: 'Φ (Wb)', zoom: false, quiet: true } },
        steps: ['$|\\varepsilon| = N\\dfrac{|\\Delta\\Phi|}{\\Delta t}$: the emf follows the steepness of the flux graph.', which === 'flat' ? 'While the flux stays constant, $\\Delta\\Phi = 0$, so the emf is $0$.' : '$$|\\varepsilon| = ' + Nn + ' \\cdot \\frac{' + tg(p1) + '}{' + (which === 'rise' ? t1 : t3) + '} = ' + q(e, 'V') + '$$'], hint: 'The emf depends on how fast the flux changes, not on how big it is.' };
    }
    if (s === 'dB' || s === 'current' || s === 'time') {
      var B1 = R.pick([0, 0.10, 0.20, 0.30]), B2 = sig(B1 + R.pick([0.20, 0.30, 0.40, 0.50, 0.60, 0.80]), 6), dt = R.pick([0.050, 0.10, 0.20, 0.25, 0.40, 0.50]), down = R.coin();
      var dPhi = (B2 - B1) * A, e = N * dPhi / dt, from = down ? B2 : B1, to = down ? B1 : B2;
      if (s === 'time') return { q: (N === 1 ? 'A single loop' : 'A coil of ' + N + ' turns') + ' with area $' + tg(A) + '\\ \\text{m}^2$ faces a field that changes from $' + tg(from) + '\\ \\text{T}$ to $' + tg(to) + '\\ \\text{T}$. Over what time must the change happen to induce an average emf of $' + tx(e) + '\\ \\text{V}$?', a: ans(dt, 0.02), unit: 's',
        steps: ['Per turn: $|\\Delta\\Phi| = |\\Delta B|A = (' + tg(sig(B2 - B1, 6)) + ')(' + tg(A) + ') = ' + q(dPhi, 'Wb') + '$.', '$\\Delta t = \\dfrac{N|\\Delta\\Phi|}{|\\varepsilon|} = \\dfrac{' + N + '(' + tx(dPhi) + ')}{' + tx(e) + '} = ' + q(dt, 's') + '$.'], hint: 'Solve |ε| = N|ΔΦ|/Δt for Δt.' };
      var Rr = R.pick([0.50, 1.0, 2.0, 4.0, 5.0, 10]), cur = e / Rr;
      var base = (N === 1 ? 'A single loop' : 'A coil of ' + N + ' turns') + ' with area $' + tg(A) + '\\ \\text{m}^2$ faces a field that ' + (down ? 'drops' : 'grows') + ' from $' + tg(from) + '\\ \\text{T}$ to $' + tg(to) + '\\ \\text{T}$ in $' + tg(dt) + '\\ \\text{s}$.';
      var st = ['Per turn: $|\\Delta\\Phi| = |\\Delta B|A = (' + tg(sig(B2 - B1, 6)) + ')(' + tg(A) + ') = ' + q(dPhi, 'Wb') + '$.', '$$|\\varepsilon| = N\\frac{|\\Delta\\Phi|}{\\Delta t} = ' + N + ' \\cdot \\frac{' + tx(dPhi) + '}{' + tg(dt) + '} = ' + q(e, 'V') + '$$'];
      if (s === 'current') return { q: base + ' The coil\'s resistance is $' + tg(Rr) + '\\ \\Omega$. Find the average induced current.', a: ans(cur, 0.02), unit: 'A', steps: st.concat(['$I = \\dfrac{\\varepsilon}{R} = \\dfrac{' + tx(e) + '}{' + tg(Rr) + '} = ' + q(cur, 'A') + '$.']), hint: 'Find the emf with Faraday\'s law, then use I = ε/R.' };
      return { q: base + ' Find the size of the average induced emf.', a: ans(e, 0.02), unit: 'V', steps: st, hint: 'Find the change in flux per turn, multiply by N, divide by the time.' };
    }
    if (s === 'rotate') {
      var B3 = R.pick([0.20, 0.30, 0.40, 0.50, 0.80]), dt2 = R.pick([0.020, 0.050, 0.10, 0.15, 0.20]), e2 = N * B3 * A / dt2;
      return { q: (N === 1 ? 'A single loop' : 'A coil of ' + N + ' turns') + ' of area $' + tg(A) + '\\ \\text{m}^2$ starts with a $' + tg(B3) + '\\ \\text{T}$ field passing straight through it, and is turned edge-on to the field in $' + tg(dt2) + '\\ \\text{s}$. Find the size of the average emf.', a: ans(e2, 0.02), unit: 'V',
        steps: ['Start: $\\Phi_i = BA = (' + tg(B3) + ')(' + tg(A) + ') = ' + q(B3 * A, 'Wb') + '$. Edge-on: $\\Phi_f = 0$.', '$$|\\varepsilon| = N\\frac{|\\Delta\\Phi|}{\\Delta t} = ' + N + ' \\cdot \\frac{' + tx(B3 * A) + '}{' + tg(dt2) + '} = ' + q(e2, 'V') + '$$'], hint: 'Edge-on means zero flux.' };
    }
    // area: a loop squeezed
    var B4 = R.pick([0.20, 0.40, 0.50, 0.80, 1.0]), A1 = R.pick([0.040, 0.050, 0.080, 0.10]), A2 = sig(A1 * R.pick([0.25, 0.5]), 6), dt3 = R.pick([0.10, 0.20, 0.25, 0.50]), e3 = B4 * (A1 - A2) / dt3;
    return { q: 'A flexible single loop in a $' + tg(B4) + '\\ \\text{T}$ field (straight through it) is squeezed from $' + tg(A1) + '\\ \\text{m}^2$ to $' + tg(A2) + '\\ \\text{m}^2$ in $' + tg(dt3) + '\\ \\text{s}$. Find the size of the average emf.', a: ans(e3, 0.02), unit: 'V',
      steps: ['$|\\Delta\\Phi| = B|\\Delta A| = (' + tg(B4) + ')(' + tg(sig(A1 - A2, 6)) + ') = ' + q(B4 * (A1 - A2), 'Wb') + '$.', '$|\\varepsilon| = \\dfrac{' + tx(B4 * (A1 - A2)) + '}{' + tg(dt3) + '} = ' + q(e3, 'V') + '$.'], hint: 'Here the area changes, not the field.' };
  });

  G('phys2.lenzs-law', function (R, ctx) {
    var s = shape(R, ctx, ['loop', 'loop', 'magnet'], ['loop', 'magnet', 'push', 'induced'], ['loop', 'magnet', 'wireloop', 'enter', 'push']);
    if (s === 'loop' || s === 'induced') {
      var B = R.pick(['in', 'out']), grow = R.coin(), Bind = grow ? dneg(B) : B, ccw = Bind === 'out';
      var how = grow ? R.pick(['grows stronger', 'is turned up', 'increases']) : R.pick(['gets weaker', 'is turned down', 'decreases']);
      if (s === 'induced') return { q: 'A loop lies in the plane of the page in a magnetic field pointing ' + DW[B] + '. The field ' + how + '. Which way does the induced current\'s own field point inside the loop?', a: mc(DW[Bind], [DW[dneg(Bind)], 'along the plane of the page', 'there is no induced field']),
        viz: { name: 'phys2-rhr', opts: { mode: 'lenz', B: B, change: grow ? 'grow' : 'shrink', interactive: false, quiet: true } },
        steps: ['The flux ' + DW[B] + ' is ' + (grow ? 'increasing' : 'decreasing') + '.', grow ? 'To oppose the increase, the induced field points the opposite way: ' + DW[Bind] + '.' : 'To oppose the decrease, the induced field points the same way: ' + DW[Bind] + '.'], hint: 'The induced field opposes the change, not the field.' };
      return { q: 'A loop lies in the plane of the page in a magnetic field pointing ' + DW[B] + '. The field ' + how + '. Which way does the induced current flow, as you look at the page?', a: mc(ccw ? 'Counterclockwise' : 'Clockwise', [ccw ? 'Clockwise' : 'Counterclockwise', 'No current flows', 'Back and forth']),
        viz: { name: 'phys2-rhr', opts: { mode: 'lenz', B: B, change: grow ? 'grow' : 'shrink', interactive: false, quiet: true } },
        steps: ['The flux ' + DW[B] + ' is ' + (grow ? 'increasing' : 'decreasing') + '.', 'The induced field opposes the change, so inside the loop it points ' + DW[Bind] + '.', 'Thumb ' + DW[Bind] + ': your fingers curl ' + (ccw ? 'counterclockwise' : 'clockwise') + '.'], hint: 'Growing or shrinking? Then point your thumb along the induced field.' };
    }
    if (s === 'magnet' || s === 'push') {
      var pole = R.pick(['north', 'south']), toward = R.coin();
      // field through the loop from the magnet, as seen from the magnet's side: a north pole's field points away from you
      var away = pole === 'north', grow2 = toward, indAway = grow2 ? !away : away, cw = indAway; // thumb away from you -> clockwise as you see it
      var face = indAway ? 'south' : 'north'; // the near face of the loop: field lines enter it if the induced field points away
      if (s === 'push') return { q: 'The ' + pole + ' pole of a bar magnet is ' + (toward ? 'pushed toward' : 'pulled away from') + ' a closed loop of wire. What does the loop\'s induced current do to the magnet?', a: mc(toward ? 'It pushes the magnet away (it repels it)' : 'It pulls the magnet back (it attracts it)', [toward ? 'It pulls the magnet in (it attracts it)' : 'It pushes the magnet away (it repels it)', 'Nothing: induced currents make no force', 'It speeds the magnet up in the direction it is already moving']),
        steps: ['Lenz\'s law: the induced current opposes the change, so it fights the motion.', toward ? 'An approaching magnet is pushed back: the loop\'s near face becomes a ' + pole + ' pole, and like poles repel.' : 'A receding magnet is pulled back: the loop\'s near face becomes a ' + (pole === 'north' ? 'south' : 'north') + ' pole, and unlike poles attract.', 'You must do work against this force, and that work becomes electrical energy.'], hint: 'The loop always opposes the motion.' };
      return { q: 'The ' + pole + ' pole of a bar magnet faces a loop of wire and is ' + (toward ? 'pushed toward' : 'pulled away from') + ' it. Looking at the loop from the magnet\'s side, which way does the induced current flow?', a: mc(cw ? 'Clockwise' : 'Counterclockwise', [cw ? 'Counterclockwise' : 'Clockwise', 'No current flows', 'It depends on how strong the magnet is']),
        steps: ['Field lines ' + (away ? 'leave a north pole, so the magnet\'s field through the loop points away from you' : 'enter a south pole, so the magnet\'s field through the loop points toward you (back toward the magnet)') + '.', 'The magnet is ' + (toward ? 'approaching, so that flux grows' : 'leaving, so that flux shrinks') + '.', 'The induced field must point ' + (indAway ? 'away from you' : 'toward you') + (grow2 ? ', against the growth.' : ', keeping the flux up.'), 'Thumb ' + (indAway ? 'away from you: fingers curl clockwise' : 'toward you: fingers curl counterclockwise') + ', as you see it. (The loop\'s near face acts as a ' + face + ' pole.)'], hint: 'Find the magnet\'s field through the loop, then ask whether it is growing or shrinking.' };
    }
    if (s === 'wireloop') {
      var inc = R.coin(), above = R.coin(); // wire along the page, current to the right; loop above or below it
      var Bl = above ? 'out' : 'in', Bind2 = inc ? dneg(Bl) : Bl, ccw2 = Bind2 === 'out';
      return { q: 'A long straight wire in the page carries a current to the right. A loop lies in the page ' + (above ? 'above' : 'below') + ' the wire. The current ' + (inc ? 'increases' : 'decreases') + '. Which way does the induced current in the loop flow?', a: mc(ccw2 ? 'Counterclockwise' : 'Clockwise', [ccw2 ? 'Clockwise' : 'Counterclockwise', 'No current flows', 'To the right, like the wire\'s current']),
        steps: ['The wire\'s field ' + (above ? 'above' : 'below') + ' it points ' + DW[Bl] + ' (thumb to the right, fingers curl ' + (above ? 'out of the page above the wire' : 'into the page below it') + ').', 'That flux through the loop is ' + (inc ? 'growing' : 'shrinking') + ', so the induced field points ' + DW[Bind2] + '.', 'Thumb ' + DW[Bind2] + ': the current flows ' + (ccw2 ? 'counterclockwise' : 'clockwise') + '.'], hint: 'First find the wire\'s field at the loop with the right-hand rule.' };
    }
    // enter: a loop moving into or out of a field region
    var Bf = R.pick(['in', 'out']), into = R.coin(), Bind3 = into ? dneg(Bf) : Bf, ccw3 = Bind3 === 'out';
    return { q: 'A square loop in the page moves to the right at constant speed. To its right is a region of uniform field pointing ' + DW[Bf] + '. Which way does the induced current flow ' + (into ? 'while the loop is entering the field region' : 'later, while the loop is moving out through the far (right) edge of the region') + '?', a: mc(ccw3 ? 'Counterclockwise' : 'Clockwise', [ccw3 ? 'Clockwise' : 'Counterclockwise', 'No current flows', 'It depends on the loop\'s speed']),
      steps: [into ? 'Entering: more of the loop is in the field, so the flux ' + DW[Bf] + ' grows.' : 'Leaving: less of the loop is in the field, so the flux ' + DW[Bf] + ' shrinks.', 'The induced field points ' + DW[Bind3] + ' inside the loop.', 'Thumb ' + DW[Bind3] + ': the current flows ' + (ccw3 ? 'counterclockwise' : 'clockwise') + '. (Once fully inside a uniform field, the flux is steady and no current flows.)'], hint: 'Is the flux through the loop growing or shrinking?' };
  });

  G('phys2.motional-emf', function (R, ctx) {
    var s = shape(R, ctx, ['emf', 'emf', 'dir'], ['emf', 'current', 'force', 'dir', 'wing'], ['force', 'power', 'speed', 'dir', 'wing', 'current']);
    var B = R.pick([0.20, 0.25, 0.40, 0.50, 0.60, 0.80, 1.0, 1.2]), Lr = R.pick([0.10, 0.20, 0.25, 0.40, 0.50, 0.80, 1.0]), v = R.pick([1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10]), Rr = R.pick([0.50, 1.0, 2.0, 2.5, 4.0, 5.0]);
    var e = B * Lr * v, I = e / Rr, F = I * Lr * B, P = e * I;
    var setup = 'A metal rod $' + tg(Lr) + '\\ \\text{m}$ long slides at $' + tg(v) + '\\ \\text{m/s}$ along rails in a $' + tg(B) + '\\ \\text{T}$ field at right angles to the rails and the rod.';
    var st1 = '$\\varepsilon = BLv = (' + tg(B) + ')(' + tg(Lr) + ')(' + tg(v) + ') = ' + q(e, 'V') + '$.';
    if (s === 'dir') {
      var Bd = R.pick(['in', 'out']), right = R.coin(), vd = right ? '+x' : '-x', Fq = dcross(vd, Bd); // force on positive charges in the rod: along the rod
      return { q: 'A rod slides ' + (right ? 'to the right' : 'to the left') + ' on two horizontal rails (top and bottom of the page) joined by a resistor, in a field pointing ' + DW[Bd] + '. Which way does the induced current flow in the rod?', a: mc(DW[Fq], [DW[dneg(Fq)], DW[vd], 'no current flows']),
        steps: ['Each positive charge in the rod moves with the rod, ' + (right ? 'to the right' : 'to the left') + ', so it feels $q\\vec{v} \\times \\vec{B}$.', 'Fingers ' + (right ? 'to the right' : 'to the left') + ', curl ' + DW[Bd] + ': the thumb points ' + DW[Fq] + '.', 'So the current in the rod runs ' + DW[Fq] + '. (Lenz\'s law gives the same: the current\'s force on the rod points against its motion.)'], hint: 'Find the force on a positive charge moving with the rod.' };
    }
    if (s === 'wing') {
      var span = R.pick([20, 30, 35, 40, 60]), sp = R.pick([150, 200, 220, 250]), Bv = R.pick([30, 40, 45, 50]), ew = Bv * 1e-6 * span * sp;
      return { q: 'An airplane with a $' + span + '\\ \\text{m}$ wingspan flies level at $' + sp + '\\ \\text{m/s}$ where the vertical part of Earth\'s field is $' + Bv + '\\ \\mu\\text{T}$. What emf appears between its wingtips?', a: ans(ew, 0.02), unit: 'V',
        steps: ['The wing is a rod moving across the vertical field: $\\varepsilon = BLv$.', '$\\varepsilon = (' + tg(Bv * 1e-6) + ')(' + span + ')(' + sp + ') = ' + q(ew, 'V') + '$.', 'No current flows around a closed loop here, so nothing can use it, but the voltage is real.'], hint: 'Use ε = BLv with the vertical part of the field.' };
    }
    if (s === 'emf') return { q: setup + ' Find the induced emf.', a: ans(e, 0.02), unit: 'V', steps: ['The loop\'s area grows by $Lv$ each second, so $\\varepsilon = \\dfrac{\\Delta\\Phi}{\\Delta t} = BLv$.', st1], hint: 'ε = BLv.' };
    if (s === 'current') return { q: setup + ' The circuit\'s resistance is $' + tg(Rr) + '\\ \\Omega$. Find the current.', a: ans(I, 0.02), unit: 'A', steps: [st1, '$I = \\dfrac{\\varepsilon}{R} = \\dfrac{' + tx(e) + '}{' + tg(Rr) + '} = ' + q(I, 'A') + '$.'], hint: 'Find ε = BLv, then I = ε/R.' };
    if (s === 'force') return { q: setup + ' The circuit\'s resistance is $' + tg(Rr) + '\\ \\Omega$. What force must you apply to keep the rod moving at constant speed?', a: ans(F, 0.02), unit: 'N', steps: [st1, '$I = \\dfrac{\\varepsilon}{R} = ' + q(I, 'A') + '$.', 'The field pushes back on the current with $F = ILB = (' + tx(I) + ')(' + tg(Lr) + ')(' + tg(B) + ') = ' + q(F, 'N') + '$.', 'To keep a constant speed you push forward with the same $' + q(F, 'N') + '$.'], hint: 'The magnetic force on the induced current, ILB, opposes the motion.' };
    if (s === 'power') return { q: setup + ' The circuit\'s resistance is $' + tg(Rr) + '\\ \\Omega$. How much power must you supply to keep the rod moving steadily?', a: ans(P, 0.02), unit: 'W', steps: [st1, '$I = \\dfrac{\\varepsilon}{R} = ' + q(I, 'A') + '$, and the force needed is $F = ILB = ' + q(F, 'N') + '$.', '$P = Fv = (' + tx(F) + ')(' + tg(v) + ') = ' + q(P, 'W') + '$.', 'Check: $I^{2}R = ' + q(I * I * Rr, 'W') + '$, the same: your work becomes heat in the resistor.'], hint: 'Power = force × speed, or I²R.' };
    var et = sig(e, 3);
    return { q: 'A rod $' + tg(Lr) + '\\ \\text{m}$ long slides on rails in a $' + tg(B) + '\\ \\text{T}$ field at right angles. How fast must it move to make an emf of $' + tx(et) + '\\ \\text{V}$?', a: ans(et / (B * Lr), 0.02), unit: 'm/s',
      steps: ['$\\varepsilon = BLv$, so $v = \\dfrac{\\varepsilon}{BL}$.', '$v = \\dfrac{' + tx(et) + '}{(' + tg(B) + ')(' + tg(Lr) + ')} = ' + q(et / (B * Lr), 'm/s') + '$.'], hint: 'Solve ε = BLv for v.' };
  });

// =========================================================================================== unit 6: geometric optics
  var MAT = [['water', 1.33], ['glass', 1.50], ['crown glass', 1.52], ['acrylic plastic', 1.49], ['ethanol', 1.36], ['diamond', 2.42], ['ice', 1.31], ['olive oil', 1.47]];
  function Qf(n, d) { return ML.Q(n, d); }
  /* friendly mirror and lens cases: integer focal lengths and object distances with whole-number (or half) image distances */
  var CASES = (function () {
    var out = [];
    [5, 6, 8, 10, 12, 15, 16, 18, 20, 24, 25, 30, 36, 40].forEach(function (f) {
      for (var d = 2; d <= 120; d++) {
        if (d === f) continue;
        var di = Qf(f * d, d - f);
        if (!di.isInt() && !di.mul(2).isInt()) continue;
        var dv = di.toNumber(); if (M.abs(dv) > 150 || M.abs(dv) < 2) continue;
        var m = M.abs(dv / d); if (m > 5 || m < 0.12) continue;
        out.push({ f: f, d: d, di: di });
      }
      for (var d2 = 2; d2 <= 80; d2++) { var di2 = Qf(-f * d2, d2 + f); if (!di2.isInt() && !di2.mul(2).isInt()) continue; if (M.abs(di2.toNumber()) < 2) continue; out.push({ f: -f, d: d2, di: di2 }); }
    });
    return out;
  })();
  function pickCase(R, kind) { // kind: 'real' (f > 0, real image), 'virt' (f > 0, virtual), 'neg' (f < 0)
    var list = CASES.filter(function (c) { var r = c.di.toNumber() > 0; return kind === 'neg' ? c.f < 0 : c.f > 0 && (kind === 'real' ? r : !r); });
    return R.pick(list);
  }
  function lensSteps(c, lens) { // 1/di = 1/f - 1/do, shown with a common denominator
    var inv = Qf(1, c.f).sub(Qf(1, c.d)), di = c.di.toNumber(), m = c.di.neg().div(c.d);
    return { inv: inv, di: di, m: m, steps: [
      '$\\dfrac{1}{d_i} = \\dfrac{1}{f} - \\dfrac{1}{d_o} = ' + (c.f < 0 ? '-\\dfrac{1}{' + (-c.f) + '}' : '\\dfrac{1}{' + c.f + '}') + ' - \\dfrac{1}{' + c.d + '}$.',
      'Common denominator: $\\dfrac{1}{d_i} = ' + inv.toTex() + '$, so $d_i = ' + diTex(c.di) + '\\ \\text{cm}$.',
      di > 0 ? 'Positive: a real image, ' + (lens ? 'on the far side of the lens.' : 'in front of the mirror.') : 'Negative: a virtual image, ' + (lens ? 'on the same side as the object.' : 'behind the mirror.')
    ] };
  }
  function diTex(di) { return di.isInt() ? di.toTex() : di.toTex() + ' = ' + tg(di.toNumber()); }
  function qmTex(m) { return m.isInt() ? m.toTex() : m.toTex() + ' \\approx ' + tx(m.toNumber(), 2); }
  function imageWords(c) {
    if (c.di == null) return 'No image forms (the rays leave parallel)';
    var di = c.di.toNumber(), m = -di / c.d, sz = M.abs(M.abs(m) - 1) < 1e-9 ? 'the same size' : M.abs(m) > 1 ? 'larger' : 'smaller';
    return (di > 0 ? 'Real' : 'Virtual') + ', ' + (m < 0 ? 'inverted' : 'upright') + ', ' + sz;
  }
  var IMG_ALL = ['Real, inverted, smaller', 'Real, inverted, larger', 'Real, inverted, the same size', 'Virtual, upright, larger', 'Virtual, upright, smaller', 'Real, upright, larger', 'Virtual, inverted, smaller'];

  G('phys2.reflection', function (R, ctx) {
    var s = shape(R, ctx, ['surface', 'image', 'concept'], ['surface', 'between', 'walk', 'mirror', 'concept'], ['between', 'walk', 'mirror', 'corner', 'concept']);
    if (s === 'surface') { var a = R.pick([15, 20, 25, 30, 35, 40, 50, 55, 62, 70]); return { q: 'A ray of light strikes a flat mirror at $' + a + '^\\circ$ to the mirror\'s surface. What is the angle of reflection, measured from the normal?', a: ans(90 - a, 0.005), unit: '°', steps: ['Angles are measured from the normal, which is at $90^\\circ$ to the surface.', 'Angle of incidence: $90^\\circ - ' + a + '^\\circ = ' + (90 - a) + '^\\circ$.', 'Law of reflection: the angle of reflection is also $' + (90 - a) + '^\\circ$.'], hint: 'Convert the angle from the surface into an angle from the normal.' }; }
    if (s === 'between') { var th = R.pick([20, 25, 30, 35, 40, 50, 55, 65]); return { q: 'Light hits a mirror at $' + th + '^\\circ$ from the normal. What is the angle between the incoming ray and the reflected ray?', a: ans(2 * th, 0.005), unit: '°', steps: ['The reflected ray is also $' + th + '^\\circ$ from the normal, on the other side.', 'Between them: $' + th + '^\\circ + ' + th + '^\\circ = ' + 2 * th + '^\\circ$.'], hint: 'Both rays make the same angle with the normal.' }; }
    if (s === 'image') { var d = R.pick([0.50, 0.80, 1.2, 1.5, 2.0, 2.5, 3.0]); return { q: 'You stand $' + tg(d) + '\\ \\text{m}$ in front of a flat mirror. How far are you from your image?', a: ans(2 * d, 0.01), unit: 'm', steps: ['A plane mirror\'s image is as far behind the mirror as you are in front: $' + tg(d) + '\\ \\text{m}$.', 'Distance from you: $' + tg(d) + ' + ' + tg(d) + ' = ' + tg(2 * d) + '\\ \\text{m}$.'], hint: 'Where is the image?' }; }
    if (s === 'walk') { var d0 = R.pick([3.0, 4.0, 5.0, 6.0]), v = R.pick([0.50, 1.0, 1.5]), t = R.pick([1, 2]), d1 = d0 - v * t; return { q: 'You stand $' + tg(d0) + '\\ \\text{m}$ from a flat mirror and walk straight toward it at $' + tg(v) + '\\ \\text{m/s}$ for ' + t + ' s. How far are you from your image now?', a: ans(2 * d1, 0.01), unit: 'm', steps: ['After ' + t + ' s you have moved $' + tg(v * t) + '\\ \\text{m}$, so you are $' + tg(d1) + '\\ \\text{m}$ from the mirror.', 'Your image is $' + tg(d1) + '\\ \\text{m}$ behind it.', 'Distance between you: $2 \\times ' + tg(d1) + ' = ' + tg(2 * d1) + '\\ \\text{m}$.'], hint: 'The image moves toward the mirror as you do.' }; }
    if (s === 'mirror') { var H = R.pick([1.50, 1.60, 1.70, 1.76, 1.80, 1.90]), e = sig(H - R.pick([0.08, 0.10, 0.12]), 3), bot = R.coin(); return { q: 'A person $' + tg(H) + '\\ \\text{m}$ tall has eyes $' + tg(e) + '\\ \\text{m}$ above the floor. ' + (bot ? 'How high above the floor should the bottom edge of a wall mirror be so they can just see their feet?' : 'What is the shortest wall mirror in which they can see their whole body?'), a: ans(bot ? e / 2 : H / 2, 0.01), unit: 'm', steps: ['Light from a point reflects halfway between that point and the eye (equal angles).', 'Feet: the ray reflects at $' + tg(e) + '/2 = ' + tx(e / 2) + '\\ \\text{m}$ above the floor.', 'Top of the head: at $' + tg(e) + ' + (' + tg(H) + ' - ' + tg(e) + ')/2 = ' + tx(e + (H - e) / 2) + '\\ \\text{m}$.', bot ? 'So the bottom edge goes at $' + tx(e / 2) + '\\ \\text{m}$.' : 'Mirror height: $' + tx(e + (H - e) / 2) + ' - ' + tx(e / 2) + ' = ' + tx(H / 2) + '\\ \\text{m}$, half the height.'], hint: 'Each ray reflects halfway between the point it comes from and the eye.' }; }
    if (s === 'corner') { var t1 = R.pick([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]); return { q: 'Two flat mirrors meet at a right angle. A ray hits the first mirror at $' + t1 + '^\\circ$ from that mirror\'s normal, reflects, and then hits the second mirror. What is its angle of incidence on the second mirror?', a: ans(90 - t1, 0.005), unit: '°', steps: ['After the first reflection the ray leaves at $' + t1 + '^\\circ$ from the first normal, which is $' + (90 - t1) + '^\\circ$ from the first mirror\'s surface.', 'The second mirror is at right angles to the first, so its normal is parallel to the first mirror\'s surface.', 'The ray meets the second normal at $90^\\circ - ' + t1 + '^\\circ = ' + (90 - t1) + '^\\circ$. It leaves heading straight back the way it came, which is how corner reflectors work.'], hint: 'Draw both normals; they are at right angles to each other.' }; }
    var it = R.pick([
      ['You see only down to your knees in a wall mirror. What happens if you step back from the mirror?', 'You still see down to your knees', ['You see more of yourself', 'You see less of yourself', 'You see your whole body once you are far enough back'], 'The ray from your knees reflects halfway between knees and eyes, at any distance. The part of the mirror you use, and what you see, stays the same.'],
      ['How does the image in a flat mirror compare with the object?', 'Same size, upright, as far behind the mirror as the object is in front', ['Smaller, upright, on the mirror\'s surface', 'Same size, inverted, in front of the mirror', 'Larger, upright, twice as far behind the mirror'], 'Equal angles of reflection make the reflected rays spread as if from a point the same distance behind the mirror.'],
      ['Why is the image in a flat mirror called virtual?', 'Light only seems to come from it; no light actually reaches that point', ['It is too dim to see clearly', 'It is upside down', 'It forms on the surface of the mirror'], 'The reflected rays, traced backward, meet behind the mirror, where no light goes. A screen placed there would show nothing.'],
      ['From what line are the angles of incidence and reflection measured?', 'The normal, the line at right angles to the surface', ['The mirror\'s surface', 'The horizontal floor', 'The line to the viewer\'s eye'], 'Both angles are measured from the normal.']
    ]);
    return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Think about where each ray reflects.' };
  });

  G('phys2.index-of-refraction', function (R, ctx) {
    var s = shape(R, ctx, ['speed', 'nfromv', 'concept'], ['speed', 'nfromv', 'lambda', 'freq', 'concept'], ['lambda', 'freq', 'time', 'nfromv', 'concept']), m = R.pick(MAT);
    if (s === 'speed') { var v = C / m[1]; return { q: 'How fast does light travel in ' + m[0] + ', which has $n = ' + m[1].toFixed(2) + '$?', a: ans(v, 0.01), unit: 'm/s', steps: ['$v = \\dfrac{c}{n} = \\dfrac{3.00 \\times 10^{8}}{' + m[1].toFixed(2) + '}$.', '$v = ' + q(v, 'm/s') + '$.'], hint: 'n = c/v, so v = c/n.' }; }
    if (s === 'nfromv') { var vv = sig(C / m[1], 3); return { q: 'Light travels at $' + tx(vv) + '\\ \\text{m/s}$ in a clear material. What is its index of refraction?', a: ans(C / vv, 0.01), steps: ['$n = \\dfrac{c}{v} = \\dfrac{3.00 \\times 10^{8}}{' + tx(vv) + '}$.', '$n = ' + tx(C / vv) + '$.'], hint: 'n = c/v, a pure number.' }; }
    var lam = R.pick([450, 480, 500, 520, 550, 589, 600, 633, 650, 700]);
    if (s === 'lambda') { var ln = lam / m[1]; return { q: 'Light with a wavelength of $' + lam + '\\ \\text{nm}$ in air enters ' + m[0] + ' ($n = ' + m[1].toFixed(2) + '$). What is its wavelength inside?', a: ans(ln, 0.01), unit: 'nm', steps: ['The frequency stays the same and the speed drops by $n$, so the wavelength drops by $n$.', '$\\lambda_n = \\dfrac{\\lambda}{n} = \\dfrac{' + lam + '}{' + m[1].toFixed(2) + '} = ' + q(ln, 'nm') + '$.'], hint: 'λ_n = λ/n.' }; }
    if (s === 'freq') { var f = C / (lam * 1e-9); return { q: 'Light of wavelength $' + lam + '\\ \\text{nm}$ in air passes into ' + m[0] + ' ($n = ' + m[1].toFixed(2) + '$). What is its frequency inside the ' + m[0] + '?', a: ans(f, 0.01), unit: 'Hz', steps: ['In air: $f = \\dfrac{c}{\\lambda} = \\dfrac{3.00 \\times 10^{8}}{' + lam + ' \\times 10^{-9}} = ' + q(f, 'Hz') + '$.', 'The frequency does not change at a boundary, so inside it is still $' + q(f, 'Hz') + '$.', '(The wavelength inside is $' + tx(lam / m[1]) + '\\ \\text{nm}$.)'], hint: 'What stays the same when light enters a new material?' }; }
    if (s === 'time') { var d = R.pick([1.0, 2.0, 3.0, 5.0, 10]), t = d / 100 * m[1] / C; return { q: 'How long does light take to cross $' + tg(d) + '\\ \\text{cm}$ of ' + m[0] + ' ($n = ' + m[1].toFixed(2) + '$) straight through?', a: ans(t, 0.01), unit: 's', steps: ['Speed inside: $v = \\dfrac{c}{n} = ' + q(C / m[1], 'm/s') + '$.', '$t = \\dfrac{d}{v} = \\dfrac{' + tg(d / 100) + '}{' + tx(C / m[1]) + '} = ' + q(t, 's') + '$.'], hint: 'Find the speed inside first.' }; }
    var it = R.pick([
      ['A red laser beam goes from air into water. What happens to its frequency?', 'It stays the same', ['It decreases, so the light looks orange', 'It increases', 'It drops by the factor n'], 'Crests leave the boundary as fast as they arrive, so the frequency (and the color) never changes. The speed and wavelength drop by $n$.'],
      ['Light goes from air into glass. Which change is correct?', 'Its speed and its wavelength both decrease', ['Its speed and its frequency both decrease', 'Its wavelength increases', 'Its frequency increases and its wavelength decreases'], 'In glass $v = c/n$ and $\\lambda_n = \\lambda/n$; the frequency is fixed by the source.'],
      ['Which index of refraction is impossible for an ordinary material?', '$n = 0.80$', ['$n = 1.00$', '$n = 1.33$', '$n = 2.42$'], 'Since $n = c/v$ and light in matter is never faster than $c$, $n$ is at least 1.']
    ]);
    return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Use v = fλ: which quantity does the source set?' };
  });

  G('phys2.snells-law', function (R, ctx) {
    var s = shape(R, ctx, ['airin', 'airin', 'concept'], ['airin', 'surface', 'n2', 'outof', 'concept'], ['between', 'n2', 'theta1', 'outof', 'surface']), m = R.pick(MAT);
    if (s === 'concept') { var into = R.coin(); return { q: 'Light passes at a slant from ' + (into ? 'air into ' + m[0] : m[0] + ' into air') + '. Which way does it bend?', a: mc(into ? 'Toward the normal' : 'Away from the normal', [into ? 'Away from the normal' : 'Toward the normal', 'It does not bend', 'Along the surface']), steps: [into ? 'Going into a higher index, $\\sin\\theta_2 = \\frac{n_1}{n_2}\\sin\\theta_1$ is smaller, so the ray bends toward the normal.' : 'Going into a lower index, $\\sin\\theta_2 = \\frac{n_1}{n_2}\\sin\\theta_1$ is bigger, so the ray bends away from the normal.'], hint: 'Compare n₁ and n₂ in n₁ sin θ₁ = n₂ sin θ₂.' }; }
    var n1 = 1.00, n2 = m[1], th1 = R.pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 65]), from = 'air', to = m[0];
    if (s === 'outof') { n1 = m[1]; n2 = 1.00; from = m[0]; to = 'air'; th1 = R.pick([10, 15, 20, 25, 30, 35]); if (n1 * sind(th1) > 0.95) th1 = 15; }
    if (s === 'between') { var pair = R.pick([[1.50, 'glass', 1.33, 'water'], [1.33, 'water', 1.50, 'glass'], [2.42, 'diamond', 1.33, 'water'], [1.52, 'crown glass', 1.36, 'ethanol'], [1.31, 'ice', 1.52, 'crown glass']]); n1 = pair[0]; from = pair[1]; n2 = pair[2]; to = pair[3]; th1 = R.pick([15, 20, 25, 30, 35]); if (n1 / n2 * sind(th1) > 0.95) th1 = 15; }
    var s2 = n1 / n2 * sind(th1), th2 = asind(s2);
    var nn = function (x) { return x.toFixed(2); };
    if (s === 'n2') { var t2 = sig(asind(sind(th1) / m[1]), 3), n = sind(th1) / sind(t2); return { q: 'A ray in air strikes a clear material at $' + th1 + '^\\circ$ from the normal and travels at $' + t2 + '^\\circ$ from the normal inside. Find the material\'s index of refraction.', a: ans(n, 0.01), steps: ['$n_1\\sin\\theta_1 = n_2\\sin\\theta_2$ with $n_1 = 1.00$.', '$$n_2 = \\frac{\\sin ' + th1 + '^\\circ}{\\sin ' + t2 + '^\\circ} = \\frac{' + tx(sind(th1)) + '}{' + tx(sind(t2)) + '} = ' + tx(n) + '$$'], hint: 'Solve Snell\'s law for n₂.' }; }
    if (s === 'theta1') { var tt2 = R.pick([18, 20, 22, 25, 28, 30, 32]), ss = m[1] * sind(tt2); if (ss > 0.97) { tt2 = 18; ss = m[1] * sind(18); } var t1 = asind(ss); return { q: 'Light from air enters ' + m[0] + ' ($n = ' + nn(m[1]) + '$) and travels at $' + tt2 + '^\\circ$ from the normal inside. At what angle from the normal did it strike the surface?', a: ans(t1, 0.01), unit: '°', steps: ['$(1.00)\\sin\\theta_1 = ' + nn(m[1]) + '\\sin ' + tt2 + '^\\circ = ' + tx(ss) + '$.', '$\\theta_1 = \\sin^{-1}(' + tx(ss) + ') = ' + deg(t1) + '$.'], hint: 'Use Snell\'s law the other way around.' }; }
    var surf = s === 'surface', given = surf ? 90 - th1 : th1;
    return { q: 'Light in ' + from + ' strikes a boundary with ' + to + ' at $' + given + '^\\circ$ from the ' + (surf ? '<b>surface</b>' : 'normal') + '. Find the angle of refraction, measured from the normal. (' + (from === 'air' ? '' : '$n = ' + nn(n1) + '$ for ' + from + (to === 'air' ? '' : ', ')) + (to === 'air' ? '' : '$n = ' + nn(n2) + '$ for ' + to) + '.)',
      a: ans(th2, 0.01), unit: '°',
      steps: (surf ? ['From the normal: $\\theta_1 = 90^\\circ - ' + given + '^\\circ = ' + th1 + '^\\circ$.'] : []).concat(['$' + nn(n1) + '\\sin ' + th1 + '^\\circ = ' + nn(n2) + '\\sin\\theta_2$.', '$\\sin\\theta_2 = \\dfrac{' + nn(n1) + '(' + tx(sind(th1)) + ')}{' + nn(n2) + '} = ' + tx(s2) + '$.', '$\\theta_2 = \\sin^{-1}(' + tx(s2) + ') = ' + deg(th2) + '$, ' + (n2 > n1 ? 'smaller: bent toward the normal.' : 'larger: bent away from the normal.')]),
      viz: { name: 'ph-refraction', opts: { mode: 'ray', n1: n1, n2: n2, angle: th1, interactive: false, quiet: true } },
      hint: surf ? 'First turn the angle from the surface into an angle from the normal.' : 'n₁ sin θ₁ = n₂ sin θ₂.' };
  });

  G('phys2.total-internal-reflection', function (R, ctx) {
    var s = shape(R, ctx, ['crit', 'crit', 'concept'], ['crit', 'escape', 'nfrom', 'concept'], ['pair', 'escape', 'nfrom', 'fiber']);
    var m = R.pick(MAT.filter(function (x) { return x[1] > 1.32; }));
    if (s === 'crit') { var tc = asind(1 / m[1]); return { q: 'Find the critical angle for light going from ' + m[0] + ' ($n = ' + m[1].toFixed(2) + '$) into air.', a: ans(tc, 0.01), unit: '°', steps: ['$\\sin\\theta_c = \\dfrac{n_2}{n_1} = \\dfrac{1.00}{' + m[1].toFixed(2) + '} = ' + tx(1 / m[1]) + '$.', '$\\theta_c = \\sin^{-1}(' + tx(1 / m[1]) + ') = ' + deg(tc) + '$.'], hint: 'sin θc = n₂/n₁, with n₁ the denser material.' }; }
    if (s === 'pair' || s === 'fiber') {
      var p = s === 'fiber' ? R.pick([[1.50, 1.46], [1.48, 1.46], [1.62, 1.52], [1.55, 1.48]]) : R.pick([[1.50, 1.33, 'glass', 'water'], [2.42, 1.50, 'diamond', 'glass'], [1.52, 1.33, 'crown glass', 'water'], [2.42, 1.33, 'diamond', 'water']]), tc2 = asind(p[1] / p[0]);
      return { q: s === 'fiber' ? 'An optical fiber has a core with $n = ' + p[0].toFixed(2) + '$ and a cladding with $n = ' + p[1].toFixed(2) + '$. What is the critical angle at the core–cladding boundary?' : 'Find the critical angle for light in ' + p[2] + ' ($n = ' + p[0].toFixed(2) + '$) meeting ' + p[3] + ' ($n = ' + p[1].toFixed(2) + '$).', a: ans(tc2, 0.01), unit: '°',
        steps: ['$\\sin\\theta_c = \\dfrac{n_2}{n_1} = \\dfrac{' + p[1].toFixed(2) + '}{' + p[0].toFixed(2) + '} = ' + tx(p[1] / p[0]) + '$.', '$\\theta_c = ' + deg(tc2) + '$.' + (s === 'fiber' ? ' Light that hits the wall at more than this stays trapped in the core.' : '')], hint: 'Use sin θc = n₂/n₁.' };
    }
    if (s === 'nfrom') { var tc3 = R.pick([24.4, 30.0, 35.0, 40.0, 41.8, 45.0, 48.8]), n = 1 / sind(tc3); return { q: 'The critical angle for a clear gem in air is $' + tc3.toFixed(1) + '^\\circ$. What is the gem\'s index of refraction?', a: ans(n, 0.01), steps: ['$\\sin\\theta_c = \\dfrac{1.00}{n}$, so $n = \\dfrac{1}{\\sin\\theta_c}$.', '$n = \\dfrac{1}{\\sin ' + tc3.toFixed(1) + '^\\circ} = \\dfrac{1}{' + tx(sind(tc3)) + '} = ' + tx(n) + '$.'], hint: 'Solve sin θc = 1/n for n.' }; }
    if (s === 'escape') {
      var tc4 = asind(1 / m[1]), off = R.pick([-12, -8, -5, 5, 8, 12]), th = M.round(tc4 + off), tir = th > tc4;
      return { q: 'Light inside ' + m[0] + ' ($n = ' + m[1].toFixed(2) + '$) hits the boundary with air at $' + th + '^\\circ$ from the normal. What happens?', a: mc(tir ? 'It is totally reflected back into the ' + m[0] : 'Part of it refracts out into the air', [tir ? 'Part of it refracts out into the air' : 'It is totally reflected back into the ' + m[0], 'It passes straight through without bending', 'It is all absorbed at the surface']),
        steps: ['Critical angle: $\\sin\\theta_c = \\dfrac{1.00}{' + m[1].toFixed(2) + '}$, so $\\theta_c = ' + deg(tc4) + '$.', th + '° is ' + (tir ? 'more' : 'less') + ' than ' + tx(tc4) + '°, so ' + (tir ? 'no refracted ray exists: total internal reflection.' : 'a refracted ray exists (some light also reflects).')],
        viz: { name: 'ph-refraction', opts: { mode: 'ray', n1: m[1], n2: 1, angle: th, interactive: false, quiet: true, hide: ['critical'] } }, hint: 'Compare the angle with the critical angle.' };
    }
    var it = R.pick([
      ['Can total internal reflection happen when light goes from air into glass?', 'No: it needs light going from a higher index into a lower one', ['Yes, if the angle is larger than $42^\\circ$', 'Yes, at any angle', 'Only for blue light'], 'Into a higher index, $\\sin\\theta_2 = \\frac{n_1}{n_2}\\sin\\theta_1 < 1$ always, so a refracted ray always exists.'],
      ['Why does a diamond sparkle more than glass cut the same way?', 'Its high index gives a small critical angle, so more light is trapped and reflected inside', ['Diamond adds light of its own', 'Its low index lets all the light through', 'Diamond reflects only from its outer surface'], 'With $n = 2.42$, the critical angle is only about $24^\\circ$, so light bounces around inside until it leaves through the top.'],
      ['What happens at exactly the critical angle?', 'The refracted ray skims along the surface, at $90^\\circ$ from the normal', ['The light stops at the surface', 'The refracted ray goes straight on without bending', 'The reflected ray disappears'], 'At $\\theta_c$, Snell\'s law gives $\\sin\\theta_2 = 1$, so $\\theta_2 = 90^\\circ$.']
    ]);
    return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Total internal reflection needs n₁ > n₂ and an angle beyond θc.' };
  });

  function classify(R, ctx, lens) {
    var conv = R.chance(ctx.level === 1 ? 0.85 : 0.75), f = R.pick([10, 12, 15, 20]), where, d;
    if (conv) { where = R.pick(['beyond 2F', 'at 2F', 'between', 'at F', 'inside']); d = where === 'beyond 2F' ? R.pick([2.5, 3, 4]) * f : where === 'at 2F' ? 2 * f : where === 'between' ? R.pick([1.25, 1.5, 1.75]) * f : where === 'at F' ? f : R.pick([0.4, 0.5, 0.6]) * f; }
    else { d = R.pick([0.5, 1, 1.5, 2, 3]) * f; f = -f; }
    d = sig(d, 6);
    return { f: f, d: d, di: d === f ? null : Qf(sig(f * d, 10), sig(d - f, 10)) };
  }
  function placeWords(c, lens) {
    var F = M.abs(c.f), name = lens ? (c.f > 0 ? 'converging lens' : 'diverging lens') : (c.f > 0 ? 'concave mirror' : 'convex mirror');
    var pos = c.f < 0 ? '' : c.d > 2 * F ? 'beyond ' + (lens ? '2F' : 'C') : c.d === 2 * F ? 'at ' + (lens ? '2F' : 'C') : c.d > F ? 'between F and ' + (lens ? '2F' : 'C') : c.d === F ? 'exactly at F' : 'between F and the ' + (lens ? 'lens' : 'mirror');
    return { name: name, pos: pos };
  }
  function diagramProblem(R, ctx, lens) {
    var s = shape(R, ctx, ['classify', 'classify', 'ray'], ['classify', 'ray', 'cover', 'fromR', 'where'], ['classify', 'where', 'ray', 'cover', 'fromR']);
    if (s === 'fromR' && !lens) { var Rr = R.pick([16, 20, 24, 30, 36, 40, 50, 60]), cv = R.coin(); return { q: 'A ' + (cv ? 'concave' : 'convex') + ' mirror has a radius of curvature of $' + Rr + '\\ \\text{cm}$. What is its focal length, with the sign convention of this course?', a: ans(cv ? Rr / 2 : -Rr / 2, 0.005), unit: 'cm', steps: ['For a spherical mirror, $|f| = \\dfrac{R}{2} = ' + Rr / 2 + '\\ \\text{cm}$.', cv ? 'Concave: $f > 0$, so $f = ' + Rr / 2 + '\\ \\text{cm}$.' : 'Convex: $f < 0$, so $f = -' + Rr / 2 + '\\ \\text{cm}$.'], hint: 'f = R/2, with the sign set by the shape.' }; }
    if (s === 'fromR' && lens) s = 'cover';
    if (s === 'cover') return { q: 'An object stands in front of a ' + (lens ? 'converging lens' : 'concave mirror') + ', which forms a sharp real image on a screen. Then the top half of the ' + (lens ? 'lens' : 'mirror') + ' is covered with black paper. What happens to the image?', a: mc('The whole image is still there, only dimmer', ['The top half of the image disappears', 'The bottom half of the image disappears', 'The image disappears completely']),
      viz: { name: 'ph-rays', opts: { element: lens ? 'converging' : 'concave', f: 10, dObj: 25, hObj: 4, block: 'top', interactive: false, quiet: true } },
      steps: ['Every point on the object sends rays to every part of the ' + (lens ? 'lens' : 'mirror') + '.', 'The uncovered half still brings rays from every point of the object together, so the whole image forms, with half the light.'], hint: 'Do the rays from the top of the object only hit the top of the ' + (lens ? 'lens' : 'mirror') + '?' };
    if (s === 'ray') {
      var conv = R.coin(), it = lens ? (conv ? R.pick([['parallel to the axis', 'passes through the focal point on the far side'], ['through the center of the lens', 'goes straight on without bending'], ['through the focal point on the object\'s side', 'leaves parallel to the axis']]) : R.pick([['parallel to the axis', 'bends outward as if it came from the focal point on the object\'s side'], ['toward the center of the lens', 'goes straight on without bending'], ['aimed at the focal point on the far side', 'leaves parallel to the axis']]))
        : (conv ? R.pick([['parallel to the axis', 'reflects through the focal point F'], ['through the focal point F', 'reflects parallel to the axis'], ['through the center of curvature C', 'reflects straight back along itself']]) : R.pick([['parallel to the axis', 'reflects as if it came from the focal point behind the mirror'], ['aimed at the focal point behind the mirror', 'reflects parallel to the axis'], ['aimed at the center of curvature behind the mirror', 'reflects straight back along itself']]));
      var pool = lens ? (conv ? ['passes through the focal point on the far side', 'goes straight on without bending', 'leaves parallel to the axis', 'bends outward as if it came from the focal point on the object\'s side'] : ['bends outward as if it came from the focal point on the object\'s side', 'goes straight on without bending', 'leaves parallel to the axis', 'passes through the focal point on the far side'])
        : (conv ? ['reflects through the focal point F', 'reflects parallel to the axis', 'reflects straight back along itself', 'reflects as if it came from the focal point behind the mirror'] : ['reflects as if it came from the focal point behind the mirror', 'reflects parallel to the axis', 'reflects straight back along itself', 'reflects through the focal point F']);
      var el = lens ? (conv ? 'converging lens' : 'diverging lens') : (conv ? 'concave mirror' : 'convex mirror');
      return { q: 'A ray from the tip of an object travels ' + it[0] + ' toward a ' + el + '. What does it do?', a: mc(it[1], pool.filter(function (x) { return x !== it[1]; })),
        steps: ['This is one of the three principal rays for a ' + el + ': a ray ' + it[0] + ' ' + it[1] + '.', lens ? 'It follows from the way a lens bends rays toward (converging) or away from (diverging) the axis, and light paths can be run backward.' : 'It follows from the law of reflection: light paths can be run backward, and a ray along a radius hits the mirror head-on.'], hint: 'Recall the three principal rays.' };
    }
    var c = classify(R, ctx, lens), pw = placeWords(c, lens), right = imageWords(c);
    var vz = { name: 'ph-rays', opts: { element: lens ? (c.f > 0 ? 'converging' : 'diverging') : (c.f > 0 ? 'concave' : 'convex'), f: c.f, dObj: c.d, hObj: sig(M.abs(c.f) * 0.35, 2), interactive: false, quiet: true, hide: ['rays', 'image', 'virtual'] } };
    if (s === 'where' && c.di) {
      var di = c.di.toNumber(), F = M.abs(c.f), loc;
      if (lens) loc = di > 0 ? 'On the far side of the lens' : 'On the same side as the object';
      else loc = di < 0 ? 'Behind the mirror' : di > 2 * F + 1e-9 ? 'In front of the mirror, beyond C' : M.abs(di - 2 * F) < 1e-9 ? 'In front of the mirror, at C' : 'In front of the mirror, between F and C';
      var opts = lens ? ['On the far side of the lens', 'On the same side as the object', 'Exactly at the lens', 'At the focal point on the object\'s side'] : ['Behind the mirror', 'In front of the mirror, beyond C', 'In front of the mirror, at C', 'In front of the mirror, between F and C'];
      return { q: (c.f < 0 ? 'An object stands in front of a ' + pw.name : 'An object is placed in front of a ' + pw.name + ', ' + pw.pos) + ' (focal length ' + tg(M.abs(c.f)) + ' cm, object ' + tg(c.d) + ' cm away). Where does the image form?', a: mc(loc, opts.filter(function (x) { return x !== loc; })), viz: vz,
        steps: ['Trace two principal rays from the tip of the object.', di > 0 ? 'The ' + (lens ? 'refracted' : 'reflected') + ' rays really meet: a real image, ' + (lens ? 'on the far side.' : 'in front of the mirror.') : 'The rays spread apart; traced backward they meet ' + (lens ? 'on the object\'s side' : 'behind the mirror') + ': a virtual image.', 'Here: ' + loc.toLowerCase() + ' (the ' + (lens ? 'lens' : 'mirror') + ' equation gives $d_i = ' + q(di, 'cm') + '$).'], hint: 'Draw the parallel ray and the ray through the center' + (lens ? ' of the lens.' : ' of curvature.') };
    }
    var wrong = IMG_ALL.concat(['No image forms (the rays leave parallel)']).filter(function (x) { return x !== right; });
    var likely = c.di == null ? ['Real, inverted, larger', 'Virtual, upright, larger', 'Real, inverted, the same size'] : c.f < 0 ? ['Real, inverted, smaller', 'Virtual, upright, larger', 'Real, inverted, larger'] : c.di.toNumber() > 0 ? ['Virtual, upright, larger', 'Virtual, upright, smaller', right === 'Real, inverted, smaller' ? 'Real, inverted, larger' : 'Real, inverted, smaller'] : ['Real, inverted, larger', 'Real, inverted, smaller', 'Virtual, upright, smaller'];
    return { q: (c.f < 0 ? 'An object stands $' + tg(c.d) + '\\ \\text{cm}$ in front of a ' + pw.name + ' with a focal length of $' + c.f + '\\ \\text{cm}$' : 'An object is placed in front of a ' + pw.name + ', ' + pw.pos) + '. Describe the image.', a: mc(right, likely.concat(wrong)), viz: vz,
      steps: c.di == null ? ['From $F$, the ' + (lens ? 'refracted' : 'reflected') + ' rays leave parallel to one another.', 'Parallel rays never meet, so no image forms.'] : ['Trace the parallel ray and the ray through ' + (lens ? 'the center of the lens' : 'C') + ' from the tip of the object.', c.di.toNumber() > 0 ? 'They meet on the ' + (lens ? 'far side' : 'object\'s side') + ': a real image, upside down.' : 'They spread apart; traced backward they meet ' + (lens ? 'on the object\'s side' : 'behind the mirror') + ': a virtual, upright image.', 'Size: $|m| = \\left|\\dfrac{d_i}{d_o}\\right| = ' + tx(M.abs(c.di.toNumber() / c.d), 2) + '$, so ' + (M.abs(M.abs(c.di.toNumber() / c.d) - 1) < 1e-9 ? 'the same size' : M.abs(c.di.toNumber() / c.d) > 1 ? 'larger' : 'smaller') + '.'],
      hint: c.f < 0 ? 'A ' + (lens ? 'diverging lens' : 'convex mirror') + ' always spreads the rays.' : 'Compare the object\'s distance with f and 2f.' };
  }
  G('phys2.mirror-ray-diagrams', function (R, ctx) { return diagramProblem(R, ctx, false); });
  G('phys2.lens-ray-diagrams', function (R, ctx) { return diagramProblem(R, ctx, true); });

  function equationProblem(R, ctx, lens) {
    var s = shape(R, ctx, ['di', 'di', 'm'], ['di', 'virt', 'neg', 'm', 'height', 'both'], ['virt', 'neg', 'f', 'do', 'height', 'both', 'app']);
    var kind = s === 'virt' ? 'virt' : s === 'neg' ? 'neg' : ctx.level === 1 ? 'real' : R.pick(['real', 'real', 'virt', 'neg']);
    var c = pickCase(R, kind), L = lensSteps(c, lens), el = lens ? (c.f > 0 ? 'converging lens' : 'diverging lens') : (c.f > 0 ? 'concave mirror' : 'convex mirror');
    var setup = 'An object is $' + c.d + '\\ \\text{cm}$ from a ' + el + ' with $f = ' + c.f + '\\ \\text{cm}$.';
    var mstep = '$m = -\\dfrac{d_i}{d_o} = -\\dfrac{' + tg(c.di.toNumber()) + '}{' + c.d + '} = ' + qmTex(L.m) + '$: ' + (L.m.toNumber() < 0 ? 'inverted' : 'upright') + ', ' + (M.abs(L.m.toNumber()) > 1 ? 'enlarged.' : M.abs(L.m.toNumber()) < 1 ? 'reduced.' : 'the same size.');
    var vz = { name: 'ph-rays', opts: { element: lens ? (c.f > 0 ? 'converging' : 'diverging') : (c.f > 0 ? 'concave' : 'convex'), f: c.f, dObj: c.d, hObj: sig(M.abs(c.f) * 0.3, 2), interactive: false, quiet: true, hide: ['rays', 'image', 'virtual'] } };
    if (s === 'm') return { q: setup + ' Find the magnification.', a: { t: 'num', v: L.m.toPlain(), rtol: 0.015 }, steps: L.steps.slice(0, 2).concat([mstep]), hint: 'Find d_i first, then m = −d_i/d_o.' };
    if (s === 'height') { var ho = R.pick([2.0, 3.0, 4.0, 5.0, 6.0]), hi = L.m.toNumber() * ho; return { q: setup + ' The object is $' + tg(ho) + '\\ \\text{cm}$ tall. Find the image height (negative if inverted).', a: ans(hi, 0.015), unit: 'cm', steps: L.steps.slice(0, 2).concat([mstep, '$h_i = m h_o = (' + qmTex(L.m) + ')(' + tg(ho) + ') = ' + q(hi, 'cm') + '$.']), hint: 'h_i = m h_o with m = −d_i/d_o.' }; }
    if (s === 'both') return { q: setup + ' Find the image distance and the magnification.', a: { t: 'multi', parts: [{ label: '$d_i =$', a: { t: 'num', v: c.di.toPlain(), rtol: 0.01 }, unit: 'cm' }, { label: '$m =$', a: { t: 'num', v: L.m.toPlain(), rtol: 0.015 } }] }, steps: L.steps.concat([mstep]), hint: 'Solve the equation for 1/d_i, then use m = −d_i/d_o.' };
    if (s === 'f') { var inv2 = Qf(1, c.d).add(Qf(1, 1).div(c.di)); return { q: (lens ? 'A lens' : 'A curved mirror') + ' forms an image of an object $' + c.d + '\\ \\text{cm}$ away. The image is ' + (c.di.toNumber() > 0 ? 'real, $' + tg(c.di.toNumber()) + '\\ \\text{cm}$ ' + (lens ? 'beyond the lens' : 'in front of the mirror') : 'virtual, $' + tg(-c.di.toNumber()) + '\\ \\text{cm}$ ' + (lens ? 'from the lens on the object\'s side' : 'behind the mirror')) + '. Find the focal length (with its sign).', a: { t: 'num', v: String(c.f), rtol: 0.01 }, unit: 'cm', steps: ['With signs: $d_o = ' + c.d + '$ and $d_i = ' + tg(c.di.toNumber()) + '$ (' + (c.di.toNumber() > 0 ? 'real, positive' : 'virtual, negative') + ').', '$\\dfrac{1}{f} = \\dfrac{1}{' + c.d + '} + \\dfrac{1}{' + tg(c.di.toNumber()) + '} = ' + inv2.toTex() + '$.', '$f = ' + c.f + '\\ \\text{cm}$: ' + (c.f > 0 ? (lens ? 'a converging lens.' : 'a concave mirror.') : (lens ? 'a diverging lens.' : 'a convex mirror.'))], hint: 'Put d_i in with its sign.' }; }
    if (s === 'do') { var invd = Qf(1, c.f).sub(Qf(1, 1).div(c.di)); return { q: 'A ' + el + ' with $f = ' + c.f + '\\ \\text{cm}$ forms a ' + (c.di.toNumber() > 0 ? 'real image $' + tg(c.di.toNumber()) + '\\ \\text{cm}$ ' + (lens ? 'beyond the lens' : 'in front of the mirror') : 'virtual image $' + tg(-c.di.toNumber()) + '\\ \\text{cm}$ ' + (lens ? 'from the lens, on the object\'s side' : 'behind the mirror')) + '. How far away is the object?', a: { t: 'num', v: String(c.d), rtol: 0.01 }, unit: 'cm', steps: ['$d_i = ' + tg(c.di.toNumber()) + '$ (' + (c.di.toNumber() > 0 ? 'real' : 'virtual, so negative') + ').', '$\\dfrac{1}{d_o} = \\dfrac{1}{f} - \\dfrac{1}{d_i} = \\dfrac{1}{' + c.f + '} - \\dfrac{1}{' + tg(c.di.toNumber()) + '} = ' + invd.toTex() + '$.', '$d_o = ' + c.d + '\\ \\text{cm}$.'], hint: 'Solve for 1/d_o.' }; }
    if (s === 'app' && lens) { var dO = R.pick([0.10, 0.12, 0.15, 0.20, 0.25]), dI = R.pick([2.0, 2.5, 3.0, 4.0, 5.0]), fp = 1 / (1 / dO + 1 / dI); return { q: 'A projector holds a slide $' + tg(dO * 100) + '\\ \\text{cm}$ from its lens and makes a sharp image on a screen $' + tg(dI) + '\\ \\text{m}$ away. What is the lens\'s focal length, in centimeters?', a: ans(fp * 100, 0.01), unit: 'cm', steps: ['Both distances are real, in meters: $d_o = ' + tg(dO) + '$, $d_i = ' + tg(dI) + '$.', '$\\dfrac{1}{f} = \\dfrac{1}{' + tg(dO) + '} + \\dfrac{1}{' + tg(dI) + '} = ' + tx(1 / dO + 1 / dI) + '\\ \\text{m}^{-1}$.', '$f = ' + tx(fp) + '\\ \\text{m} = ' + q(fp * 100, 'cm') + '$.'], hint: 'Use the thin lens equation with both distances in the same unit.' }; }
    if (s === 'app') { var ho2 = R.pick([1.6, 1.7, 1.8]), dd = R.pick([2.0, 3.0, 4.0, 5.0]), fm2 = -R.pick([0.25, 0.40, 0.50, 0.60]), di3 = 1 / (1 / fm2 - 1 / dd), hi3 = -di3 / dd * ho2; return { q: 'A convex security mirror has $f = ' + tg(fm2) + '\\ \\text{m}$. A person $' + tg(ho2) + '\\ \\text{m}$ tall stands $' + tg(dd) + '\\ \\text{m}$ in front of it. How tall is the person\'s image?', a: ans(hi3, 0.015), unit: 'm', steps: ['$\\dfrac{1}{d_i} = \\dfrac{1}{' + tg(fm2) + '} - \\dfrac{1}{' + tg(dd) + '}$, so $d_i = ' + q(di3, 'm') + '$ (virtual).', '$m = -\\dfrac{d_i}{d_o} = ' + tx(-di3 / dd) + '$.', '$h_i = m h_o = ' + q(hi3, 'm') + '$: small and upright, so the mirror shows a wide view.'], hint: 'A convex mirror has a negative focal length.' }; }
    return { q: setup + ' Where is the image? Give $d_i$ with its sign.', a: { t: 'num', v: c.di.toPlain(), rtol: 0.01 }, unit: 'cm', steps: L.steps, viz: ctx.level === 1 ? vz : undefined, hint: c.f < 0 ? 'Remember: f is negative for a ' + (lens ? 'diverging lens.' : 'convex mirror.') : 'Solve for 1/d_i first.' };
  }
  G('phys2.mirror-equation', function (R, ctx) { var p = equationProblem(R, ctx, false); if (!p.viz) delete p.viz; return p; });
  G('phys2.thin-lens-equation', function (R, ctx) { var p = equationProblem(R, ctx, true); if (!p.viz) delete p.viz; return p; });

// =========================================================================================== unit 7: waves, sound and physical optics
  G('phys2.wave-speed-medium', function (R, ctx) {
    var s = shape(R, ctx, ['speed', 'speed', 'concept'], ['speed', 'mass', 'tension', 'lambda', 'scale', 'concept'], ['mass', 'tension', 'lambda', 'scale', 'concept']);
    var mu = R.pick([0.0010, 0.0020, 0.0025, 0.0040, 0.0050, 0.0080, 0.010, 0.020]), v = R.pick([40, 50, 60, 80, 100, 120, 150, 200, 250]), T = sig(mu * v * v, 3); v = M.sqrt(T / mu);
    if (s === 'concept') {
      var it = R.pick([
        ['You shake one end of a long rope back and forth twice as fast. What happens to the waves?', 'Their wavelength is halved; their speed stays the same', ['Their speed doubles', 'Their wavelength doubles', 'Their speed and wavelength both double'], 'The rope sets the speed. Doubling $f$ in $v = f\\lambda$ with the same $v$ halves $\\lambda$.'],
        ['Two ropes have the same tension. Rope B has four times the mass per meter of rope A. How does the wave speed on B compare?', 'It is half the speed on A', ['It is four times the speed on A', 'It is a quarter of the speed on A', 'It is the same'], '$v = \\sqrt{F_T/\\mu}$: four times $\\mu$ gives $\\frac{1}{\\sqrt{4}} = \\frac{1}{2}$ the speed.'],
        ['What sets the speed of a wave on a stretched string?', 'The tension and the mass per length of the string', ['How fast you shake the end', 'How big the wave is', 'The wavelength you choose'], 'The medium sets the speed: $v = \\sqrt{F_T/\\mu}$. The source sets the frequency.'],
        ['A wave passes from a thin rope into a thick rope tied to it. What stays the same?', 'The frequency', ['The speed', 'The wavelength', 'The speed and the wavelength'], 'Each crest that arrives at the knot goes on, so the frequency is the same. The speed changes with the rope, and so does the wavelength.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'v = √(F_T/μ) depends only on the string.' };
    }
    if (s === 'speed') return { q: 'A string with mass per length $' + tg(mu) + '\\ \\text{kg/m}$ is stretched with a tension of $' + tg(T) + '\\ \\text{N}$. How fast do waves travel on it?', a: ans(v, 0.01), unit: 'm/s', steps: ['$$v = \\sqrt{\\frac{F_T}{\\mu}} = \\sqrt{\\frac{' + tg(T) + '}{' + tg(mu) + '}}$$', '$v = \\sqrt{' + tg(sig(T / mu, 6)) + '} = ' + q(v, 'm/s') + '$.'], hint: 'v = √(F_T/μ).' };
    if (s === 'mass') { var Ls = R.pick([0.50, 0.80, 1.0, 1.2, 2.0, 2.5]), mg = sig(mu * Ls * 1000, 3); var mu2 = mg / 1000 / Ls, v2 = M.sqrt(T / mu2); return { q: 'A string $' + tg(Ls) + '\\ \\text{m}$ long has a mass of $' + tg(mg) + '\\ \\text{g}$ and is under $' + tg(T) + '\\ \\text{N}$ of tension. Find the wave speed.', a: ans(v2, 0.01), unit: 'm/s', steps: ['Mass per length: $\\mu = \\dfrac{' + tg(mg / 1000) + '\\ \\text{kg}}{' + tg(Ls) + '\\ \\text{m}} = ' + q(mu2, 'kg/m') + '$.', '$v = \\sqrt{\\dfrac{' + tg(T) + '}{' + tx(mu2) + '}} = ' + q(v2, 'm/s') + '$.'], hint: 'Mass per length uses kilograms.' }; }
    if (s === 'tension') { var vt = R.pick([60, 80, 100, 150, 200, 300]); return { q: 'What tension makes waves travel at $' + vt + '\\ \\text{m/s}$ on a string with $\\mu = ' + tg(mu) + '\\ \\text{kg/m}$?', a: ans(mu * vt * vt, 0.01), unit: 'N', steps: ['Square $v = \\sqrt{F_T/\\mu}$: $F_T = \\mu v^{2}$.', '$F_T = (' + tg(mu) + ')(' + vt + ')^{2} = ' + q(mu * vt * vt, 'N') + '$.'], hint: 'Solve v = √(F_T/μ) for F_T.' }; }
    if (s === 'lambda') { var f = R.pick([50, 100, 120, 200, 250, 400]); return { q: 'A string with $\\mu = ' + tg(mu) + '\\ \\text{kg/m}$ under $' + tg(T) + '\\ \\text{N}$ of tension is shaken at $' + f + '\\ \\text{Hz}$. Find the wavelength.', a: ans(v / f, 0.01), unit: 'm', steps: ['Speed (set by the string): $v = \\sqrt{\\dfrac{' + tg(T) + '}{' + tg(mu) + '}} = ' + q(v, 'm/s') + '$.', 'Wavelength: $\\lambda = \\dfrac{v}{f} = \\dfrac{' + tx(v) + '}{' + f + '} = ' + q(v / f, 'm') + '$.'], hint: 'Find v from the string first, then λ = v/f.' }; }
    var k = R.pick([4, 9, 2, 0.25]), v0 = R.pick([30, 40, 60, 80, 100]);
    return { q: 'Waves travel at $' + v0 + '\\ \\text{m/s}$ on a guitar string. The tension is ' + (k === 0.25 ? 'reduced to one quarter of its value' : 'multiplied by ' + k) + '. How fast do waves travel now?', a: ans(v0 * M.sqrt(k), 0.01), unit: 'm/s', steps: ['$v = \\sqrt{F_T/\\mu}$, so $v$ is proportional to $\\sqrt{F_T}$.', 'New speed: $' + v0 + ' \\times \\sqrt{' + (k === 0.25 ? '\\frac{1}{4}' : k) + '} = ' + q(v0 * M.sqrt(k), 'm/s') + '$.'], hint: 'Speed goes as the square root of the tension.' };
  });

  G('phys2.wave-graphs', function (R, ctx) {
    var s = shape(R, ctx, ['snapL', 'histT', 'snapA'], ['snapL', 'histT', 'snapV', 'histV', 'which', 'dir'], ['snapV', 'histV', 'dir', 'which', 'histF']);
    var A = R.pick([1, 2, 3, 4]), lam = R.pick([2, 4, 6, 8]), Tp = R.pick([2, 4, 5, 8]);
    function graph(per, xl, yl, pts) { var o = { f: A + '*sin(2*pi*x/' + per + ')', xmin: 0, xmax: M.min(2 * per, 16), ymin: -(A + 1), ymax: A + 1, xlabel: xl, ylabel: yl, zoom: false, quiet: true }; if (pts) o.points = pts; return { name: 'graph', opts: o }; }
    if (s === 'which') {
      var hist = R.coin();
      return { q: 'A ' + (hist ? 'history graph ($y$ against $t$) of one point on a wave' : 'snapshot graph ($y$ against $x$) of a wave') + ' shows crests spaced evenly along the horizontal axis. What does the spacing between neighboring crests tell you?', a: mc(hist ? 'The period T' : 'The wavelength λ', [hist ? 'The wavelength λ' : 'The period T', 'The amplitude A', 'The wave speed v']),
        steps: [hist ? 'The horizontal axis is time, so the crest spacing is a time: the period $T$.' : 'The horizontal axis is position, so the crest spacing is a distance: the wavelength $\\lambda$.', 'Check the units on the axis: meters mean wavelength, seconds mean period.'], hint: 'What is on the horizontal axis?' };
    }
    if (s === 'dir') {
      var right = R.coin(), xP = R.pick([0, lam / 2, lam, 3 * lam / 2].filter(function (x) { return x > 0 && x < M.min(2 * lam, 16); })), slope = M.cos(2 * PI * xP / lam), up = right ? slope < 0 : slope > 0;
      return { q: 'The snapshot graph shows a wave moving to the ' + (right ? 'right' : 'left') + '. Point P is on the string at $x = ' + tg(xP) + '\\ \\text{m}$. Is P moving up or down at this instant?', a: mc(up ? 'Up' : 'Down', [up ? 'Down' : 'Up', 'It is not moving', 'To the ' + (right ? 'right' : 'left') + ', with the wave']),
        viz: graph(lam, 'x (m)', 'y (cm)', [{ x: xP, on: 0, label: 'P', color: 'red' }]),
        steps: ['The wave moves to the ' + (right ? 'right' : 'left') + ', so the part of the wave just to P\'s ' + (right ? 'left' : 'right') + ' arrives at P next.', 'Just to P\'s ' + (right ? 'left' : 'right') + ', the wave is ' + (up ? 'higher' : 'lower') + ' than P.', 'So P is moving ' + (up ? 'up' : 'down') + '. The string itself only moves up and down; the shape moves sideways.'], hint: 'Which part of the wave reaches P next?' };
    }
    if (s === 'snapL' || s === 'snapA' || s === 'snapV') {
      var vz = graph(lam, 'x (m)', 'y (cm)'), f = R.pick([0.5, 1.5, 2, 2.5, 3, 5]);
      if (s === 'snapA') return { q: 'The snapshot graph shows a wave on a string. What is its amplitude?', a: ans(A, 0.01), unit: 'cm', viz: vz, steps: ['The amplitude is the height of a crest above the center line ($y = 0$), not crest to trough.', '$A = ' + A + '\\ \\text{cm}$.'], hint: 'Measure from the center line.' };
      if (s === 'snapL') return { q: 'The snapshot graph shows a wave on a string at one instant. What is its wavelength?', a: ans(lam, 0.01), unit: 'm', viz: vz, steps: ['On a snapshot graph the horizontal axis is position.', 'Crests (or any two matching points) repeat every $' + lam + '\\ \\text{m}$, so $\\lambda = ' + lam + '\\ \\text{m}$.'], hint: 'Find the distance from one crest to the next.' };
      return { q: 'The snapshot graph shows a wave on a string. The source vibrates at $' + tg(f) + '\\ \\text{Hz}$. How fast does the wave travel?', a: ans(f * lam, 0.01), unit: 'm/s', viz: vz, steps: ['Read the wavelength from the snapshot: $\\lambda = ' + lam + '\\ \\text{m}$.', '$v = f\\lambda = (' + tg(f) + ')(' + lam + ') = ' + q(f * lam, 'm/s') + '$.'], hint: 'Read λ from the graph, then use v = fλ.' };
    }
    var vh = graph(Tp, 't (s)', 'y (cm)'), lam2 = R.pick([0.5, 1.5, 2, 3, 4, 6]);
    if (s === 'histT') return { q: 'The history graph shows how one point on a wave moves up and down. What is the period?', a: ans(Tp, 0.01), unit: 's', viz: vh, steps: ['On a history graph the horizontal axis is time.', 'The motion repeats every $' + Tp + '\\ \\text{s}$, so $T = ' + Tp + '\\ \\text{s}$.'], hint: 'Find the time from one crest to the next.' };
    if (s === 'histF') return { q: 'The history graph shows the motion of one point on a wave. What is the wave\'s frequency?', a: ans(1 / Tp, 0.01), unit: 'Hz', viz: vh, steps: ['Read the period: $T = ' + Tp + '\\ \\text{s}$.', '$f = \\dfrac{1}{T} = \\dfrac{1}{' + Tp + '} = ' + q(1 / Tp, 'Hz') + '$.'], hint: 'f = 1/T.' };
    return { q: 'The history graph shows one point on a wave whose wavelength is $' + tg(lam2) + '\\ \\text{m}$. How fast does the wave travel?', a: ans(lam2 / Tp, 0.01), unit: 'm/s', viz: vh, steps: ['Read the period from the history graph: $T = ' + Tp + '\\ \\text{s}$.', '$v = \\dfrac{\\lambda}{T} = \\dfrac{' + tg(lam2) + '}{' + Tp + '} = ' + q(lam2 / Tp, 'm/s') + '$.'], hint: 'The history graph gives the period, not the wavelength.' };
  });

  G('phys2.wave-boundaries', function (R, ctx) {
    var s = shape(R, ctx, ['reflect', 'reflect', 'trip'], ['reflect', 'trans', 'trip', 'width'], ['width', 'trip3', 'reflect', 'width2']);
    if (s === 'reflect' || s === 'trans') {
      var b = R.pick(['fixed', 'free', 'heavier', 'lighter']), inv = b === 'fixed' || b === 'heavier';
      var where = { fixed: 'the end of a string tied firmly to a wall', free: 'the end of a string tied to a light ring that slides freely on a pole', heavier: 'a knot joining the string to a much heavier string', lighter: 'a knot joining the string to a much lighter string' }[b];
      if (s === 'trans') { var jb = R.coin() ? 'heavier' : 'lighter'; return { q: 'An upright pulse reaches a knot joining its string to a ' + jb + ' string. Part of it passes into the ' + jb + ' string. Which way up is the transmitted pulse?', a: mc('Upright', ['Upside down', 'Upright only if the new string is lighter', 'It is flat: no shape passes the knot']), steps: ['The knot moves up as the pulse arrives, and it drags the next string up with it.', 'So the transmitted pulse is always upright. Only the reflected pulse can flip.'], hint: 'Which way does the knot move when the pulse arrives?' }; }
      return { q: 'An upright pulse travels along a string and reaches ' + where + '. Which way up is the reflected pulse?', a: mc(inv ? 'Upside down' : 'Upright', [inv ? 'Upright' : 'Upside down', 'There is no reflected pulse', 'Half upright and half upside down']),
        viz: { name: 'ph-wave', opts: { mode: 'pulse', boundary: b === 'fixed' || b === 'free' ? b : 'junction', mu2: b === 'heavier' ? 4 : 0.25, interactive: false, quiet: true, t: 0.5 } },
        steps: [inv ? (b === 'fixed' ? 'The wall holds the end still; pulled up by the pulse, it pulls down on the string (Newton\'s third law).' : 'A much heavier string barely moves, so the knot acts almost like a fixed end.') : (b === 'free' ? 'The free end swings up even higher and whips back up.' : 'A lighter string moves easily, so the knot acts almost like a free end.'), 'So the reflected pulse comes back ' + (inv ? 'upside down.' : 'upright.')], hint: inv ? 'Can the end move?' : 'The end is free to swing.' };
    }
    if (s === 'trip' || s === 'trip3') {
      var Ls = R.pick([2.0, 3.0, 4.0, 5.0, 6.0, 8.0, 10]), v = R.pick([10, 15, 20, 25, 30, 40, 50]), muT, T;
      if (s === 'trip3') { muT = R.pick([0.010, 0.020, 0.040, 0.050]); T = sig(muT * v * v, 3); v = M.sqrt(T / muT); }
      var t = 2 * Ls / v;
      return { q: s === 'trip3' ? 'A $' + tg(Ls) + '\\ \\text{m}$ rope with $\\mu = ' + tg(muT) + '\\ \\text{kg/m}$ is tied to a wall and pulled to a tension of $' + tg(T) + '\\ \\text{N}$. You send a pulse from your end. How long until the reflected pulse gets back to you?' : 'A pulse travels at $' + v + '\\ \\text{m/s}$ along a $' + tg(Ls) + '\\ \\text{m}$ string tied to a wall. How long until the reflected pulse returns to the starting end?', a: ans(t, 0.01), unit: 's',
        steps: (s === 'trip3' ? ['Wave speed: $v = \\sqrt{\\dfrac{' + tg(T) + '}{' + tg(muT) + '}} = ' + q(v, 'm/s') + '$.'] : []).concat(['It goes to the wall and back: $2 \\times ' + tg(Ls) + ' = ' + tg(2 * Ls) + '\\ \\text{m}$.', '$t = \\dfrac{' + tg(2 * Ls) + '}{' + tx(v) + '} = ' + q(t, 's') + '$. It comes back upside down.']), hint: 'The pulse travels the length twice.' };
    }
    var w1 = R.pick([10, 12, 15, 20, 24, 30]), v1 = R.pick([20, 30, 40, 60]), r = R.pick([0.5, 2, 0.25, 1.5]), v2 = v1 * r, w2 = w1 * r;
    if (s === 'width2') { var k = R.pick([4, 9, 0.25]), rr = 1 / M.sqrt(k); return { q: 'A pulse $' + w1 + '\\ \\text{cm}$ wide passes from one string into a second string under the same tension. The second string has ' + (k === 0.25 ? 'one quarter of' : k + ' times') + ' the mass per meter. How wide is the transmitted pulse?', a: ans(w1 * rr, 0.01), unit: 'cm', steps: ['Same tension: $v \\propto \\dfrac{1}{\\sqrt{\\mu}}$, so $\\dfrac{v_2}{v_1} = \\dfrac{1}{\\sqrt{' + (k === 0.25 ? '1/4' : k) + '}} = ' + tx(rr) + '$.', 'The pulse takes the same time to cross the knot, so its width scales with the speed: $' + w1 + ' \\times ' + tx(rr) + ' = ' + q(w1 * rr, 'cm') + '$.'], hint: 'Find the speed ratio first.' }; }
    return { q: 'A pulse $' + w1 + '\\ \\text{cm}$ wide moves at $' + v1 + '\\ \\text{m/s}$ on one string and passes into a second string where waves travel at $' + tg(v2) + '\\ \\text{m/s}$. How wide is the transmitted pulse?', a: ans(w2, 0.01), unit: 'cm', steps: ['The pulse takes the same time to pass the knot on both sides (the frequency does not change).', 'So its width scales with the speed: $w_2 = w_1\\dfrac{v_2}{v_1} = ' + w1 + ' \\times \\dfrac{' + tg(v2) + '}{' + v1 + '} = ' + q(w2, 'cm') + '$.'], hint: 'Width = speed × the time the pulse takes to pass a point.' };
  });

  G('phys2.em-waves', function (R, ctx) {
    var s = shape(R, ctx, ['lambda', 'freq', 'concept'], ['lambda', 'freq', 'B', 'time', 'band'], ['B', 'E', 'time', 'band', 'lambda']);
    if (s === 'lambda') { var src = R.pick([['an FM station at', 88.5, 1e6, 'MHz'], ['an FM station at', 101.1, 1e6, 'MHz'], ['an AM station at', 880, 1e3, 'kHz'], ['an AM station at', 1200, 1e3, 'kHz'], ['a Wi-Fi router at', 2.4, 1e9, 'GHz'], ['a microwave oven at', 2.45, 1e9, 'GHz'], ['a Wi-Fi router at', 5.0, 1e9, 'GHz']]), f = src[1] * src[2]; return { q: 'Find the wavelength of the radio waves from ' + src[0] + ' $' + tg(src[1]) + '\\ \\text{' + src[3] + '}$.', a: ans(C / f, 0.01), unit: 'm', steps: ['$f = ' + tg(src[1]) + ' \\times 10^{' + M.round(M.log10(src[2])) + '}\\ \\text{Hz}$.', '$\\lambda = \\dfrac{c}{f} = \\dfrac{3.00 \\times 10^{8}}{' + tg(f) + '} = ' + q(C / f, 'm') + '$.'], hint: 'λ = c/f, with f in hertz.' }; }
    if (s === 'freq') { var lam = R.pick([400, 450, 500, 550, 600, 650, 700]); return { q: 'Light has a wavelength of $' + lam + '\\ \\text{nm}$ in a vacuum. What is its frequency?', a: ans(C / (lam * 1e-9), 0.01), unit: 'Hz', steps: ['$\\lambda = ' + lam + ' \\times 10^{-9}\\ \\text{m}$.', '$f = \\dfrac{c}{\\lambda} = \\dfrac{3.00 \\times 10^{8}}{' + lam + ' \\times 10^{-9}} = ' + q(C / (lam * 1e-9), 'Hz') + '$.'], hint: 'f = c/λ, with λ in meters.' }; }
    if (s === 'B' || s === 'E') { var E = R.pick([3.0, 6.0, 15, 30, 45, 60, 90, 150, 300]), B = E / C; if (s === 'B') return { q: 'An electromagnetic wave has an electric field amplitude of $' + tg(E) + '\\ \\text{V/m}$. What is its magnetic field amplitude?', a: ans(B, 0.01), unit: 'T', steps: ['In an EM wave, $E = cB$.', '$B = \\dfrac{E}{c} = \\dfrac{' + tg(E) + '}{3.00 \\times 10^{8}} = ' + q(B, 'T') + '$.'], hint: 'E = cB.' }; return { q: 'The magnetic field amplitude of a light wave is $' + tx(B) + '\\ \\text{T}$. What is its electric field amplitude?', a: ans(E, 0.01), unit: 'V/m', steps: ['$E = cB = (3.00 \\times 10^{8})(' + tx(B) + ')$.', '$E = ' + q(E, 'V/m') + '$.'], hint: 'E = cB.' }; }
    if (s === 'time') { var d = R.pick([['the Sun to Earth', 1.50e11], ['the Moon to Earth', 3.84e8], ['a satellite $3.6 \\times 10^{7}\\ \\text{m}$ up to the ground', 3.6e7], ['Mars to Earth, at a distance of $7.8 \\times 10^{10}\\ \\text{m}$', 7.8e10]]); return { q: 'How long does light take to travel from ' + d[0] + '?' + (d[1] === 1.50e11 ? ' (Distance: $1.50 \\times 10^{11}\\ \\text{m}$.)' : d[1] === 3.84e8 ? ' (Distance: $3.84 \\times 10^{8}\\ \\text{m}$.)' : ''), a: ans(d[1] / C, 0.01), unit: 's', steps: ['$t = \\dfrac{d}{c} = \\dfrac{' + tg(d[1]) + '}{3.00 \\times 10^{8}}$.', '$t = ' + q(d[1] / C, 's') + '$.'], hint: 'Light travels at c = 3.00 × 10⁸ m/s.' }; }
    if (s === 'band') { var bands = [['radio waves', [300, 3, 30], 'm'], ['microwaves', [12, 3, 1], 'cm'], ['infrared', [10, 50], 'μm'], ['visible light', [550, 480, 620], 'nm'], ['ultraviolet', [250, 300, 100], 'nm'], ['X-rays', [0.1, 1], 'nm']], bd = R.pick(bands), val = R.pick(bd[1]); return { q: 'An electromagnetic wave has a wavelength of $' + tg(val) + '\\ \\text{' + bd[2] + '}$. Which part of the spectrum is it in?', a: mc(bd[0].charAt(0).toUpperCase() + bd[0].slice(1), bands.filter(function (x) { return x !== bd; }).map(function (x) { return x[0].charAt(0).toUpperCase() + x[0].slice(1); })), steps: ['From long to short: radio (longer than about 1 m down to tens of cm), microwaves (about 1 mm to 1 m), infrared (about 700 nm to 1 mm), visible (about 400 to 700 nm), ultraviolet (about 10 to 400 nm), X-rays (about 0.01 to 10 nm), gamma rays (shorter).', '$' + tg(val) + '\\ \\text{' + bd[2] + '}$ falls in ' + bd[0] + '.'], hint: 'Visible light runs from about 400 to 700 nm.' }; }
    var it = R.pick([
      ['Can light travel through a region with no air or matter at all?', 'Yes: its electric and magnetic fields keep each other going', ['No: like sound, it needs a medium', 'Only if the region is very small', 'Only radio waves can'], 'A changing magnetic field makes an electric field and vice versa, so the wave carries itself through empty space. Sunlight crosses about 150 million km of nearly empty space.'],
      ['Which statement about radio waves is correct?', 'They are electromagnetic waves that travel at the speed of light', ['They are a kind of very low sound', 'They need air to travel', 'They travel at the speed of sound'], 'Radio waves are light with long wavelengths; a radio turns them into sound with its speaker.'],
      ['In an electromagnetic wave, how are the electric and magnetic fields arranged?', 'At right angles to each other and to the direction of travel, peaking together', ['Parallel to each other and to the direction of travel', 'At right angles to each other, with one peaking when the other is zero', 'Both along the direction of travel'], 'E, B and the direction of travel are all at right angles, and E and B rise and fall in step ($E = cB$ at every point).']
    ]);
    return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Light is a wave of electric and magnetic fields.' };
  });

  G('phys2.polarization', function (R, ctx) {
    var s = shape(R, ctx, ['one', 'two', 'concept'], ['two', 'pol', 'three', 'concept'], ['three', 'angle', 'two', 'pol']);
    var I0 = R.pick([40, 80, 100, 120, 200, 240, 400, 600, 800]), ang = R.pick(ctx.level === 3 ? [20, 30, 37, 45, 53, 60, 70] : [30, 45, 60]);
    if (s === 'concept') {
      var it = R.pick([
        ['Which of these waves cannot be polarized?', 'Sound waves in air', ['Light from the Sun', 'Radio waves', 'Waves on a rope shaken sideways'], 'Polarization picks one sideways direction of wiggle. Sound in air is longitudinal (it wiggles along its travel), so it has no sideways direction to pick.'],
        ['Two polarizers are crossed (axes at $90^\\circ$), so no light gets through. A third polarizer is slipped between them at $45^\\circ$. What happens?', 'Some light gets through', ['Still no light gets through', 'All of the original light gets through', 'Only half of the original light gets through'], 'Each filter passes the part of the field along its axis. Going $0^\\circ \\to 45^\\circ \\to 90^\\circ$, each step passes $\\cos^{2}45^\\circ = \\frac{1}{2}$, so $\\frac{1}{8}$ of the original unpolarized light gets through.'],
        ['Unpolarized light passes through one ideal polarizer. What fraction of the intensity gets through?', 'One half', ['All of it', 'None of it', 'It depends on the angle of the polarizer'], 'Unpolarized light has every direction equally; the average of $\\cos^{2}\\theta$ over all angles is $\\frac{1}{2}$.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'A polarizer passes the part of E along its axis.' };
    }
    var c2 = function (a) { return M.pow(cosd(a), 2); };
    if (s === 'one') return { q: 'Unpolarized light of intensity $' + I0 + '\\ \\text{W/m}^2$ passes through one polarizer. What intensity comes out?', a: ans(I0 / 2, 0.01), unit: 'W/m²', steps: ['An ideal polarizer passes half of unpolarized light.', '$I = \\frac{1}{2}(' + I0 + ') = ' + tg(I0 / 2) + '\\ \\text{W/m}^2$, now polarized along the filter\'s axis.'], hint: 'Unpolarized light loses half.' };
    if (s === 'two') { var I2 = I0 / 2 * c2(ang); return { q: 'Unpolarized light of intensity $' + I0 + '\\ \\text{W/m}^2$ passes through two polarizers whose axes are $' + ang + '^\\circ$ apart. What intensity comes out?', a: ans(I2, 0.01), unit: 'W/m²', steps: ['First polarizer: $I_1 = \\frac{1}{2}(' + I0 + ') = ' + tg(I0 / 2) + '\\ \\text{W/m}^2$.', 'Second: $I_2 = I_1\\cos^{2}' + ang + '^\\circ = ' + tg(I0 / 2) + '(' + tx(c2(ang)) + ') = ' + q(I2, 'W/m²') + '$.'], hint: 'Half through the first, then Malus\'s law.' }; }
    if (s === 'pol') { var Ip = I0 * c2(ang); return { q: 'Polarized light of intensity $' + I0 + '\\ \\text{W/m}^2$ meets a polarizer whose axis is $' + ang + '^\\circ$ from the light\'s polarization. What intensity gets through?', a: ans(Ip, 0.01), unit: 'W/m²', steps: ['Malus\'s law: $I = I_0\\cos^{2}\\theta$.', '$I = ' + I0 + '\\cos^{2}' + ang + '^\\circ = ' + I0 + '(' + tx(c2(ang)) + ') = ' + q(Ip, 'W/m²') + '$.'], hint: 'The light is already polarized, so no factor of one half.' }; }
    if (s === 'three') { var a1 = R.pick([20, 30, 45, 60]), a2 = R.pick([60, 75, 90]); if (a2 <= a1) a2 = 90; var I1 = I0 / 2, Ia = I1 * c2(a1), Ib = Ia * c2(a2 - a1); return { q: 'Unpolarized light of intensity $' + I0 + '\\ \\text{W/m}^2$ passes through three polarizers with axes at $0^\\circ$, $' + a1 + '^\\circ$ and $' + a2 + '^\\circ$. What intensity comes out?', a: ans(Ib, 0.015), unit: 'W/m²', steps: ['After the first: $' + tg(I1) + '\\ \\text{W/m}^2$.', 'The second is $' + a1 + '^\\circ$ from the first: $' + tg(I1) + '\\cos^{2}' + a1 + '^\\circ = ' + q(Ia, 'W/m²') + '$.', 'The third is $' + (a2 - a1) + '^\\circ$ from the second: $' + tx(Ia) + '\\cos^{2}' + (a2 - a1) + '^\\circ = ' + q(Ib, 'W/m²') + '$.'], hint: 'Use the angle between neighboring filters each time.' }; }
    var ratio = R.pick([0.25, 0.50, 0.75, 0.10, 0.90, 0.40]), th = acosd(M.sqrt(ratio));
    return { q: 'Polarized light passes through a polarizer and comes out with $' + M.round(ratio * 100) + '\\%$ of its intensity. What angle is the polarizer\'s axis from the light\'s polarization (between $0^\\circ$ and $90^\\circ$)?', a: ans(th, 0.01), unit: '°', steps: ['$\\cos^{2}\\theta = ' + ratio.toFixed(2) + '$, so $\\cos\\theta = \\sqrt{' + ratio.toFixed(2) + '} = ' + tx(M.sqrt(ratio)) + '$.', '$\\theta = \\cos^{-1}(' + tx(M.sqrt(ratio)) + ') = ' + deg(th) + '$.'], hint: 'Solve I/I₀ = cos²θ for θ.' };
  });

  G('phys2.superposition', function (R, ctx) {
    var s = shape(R, ctx, ['pulses', 'pulses', 'after'], ['pulses', 'speakers', 'after', 'minpath'], ['speakers', 'minpath', 'pulses', 'energy']);
    if (s === 'pulses') { var h1 = R.pick([2, 3, 4, 5, 6]), h2 = R.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4]); var sum = h1 + h2; return { q: 'A pulse $' + h1 + '\\ \\text{cm}$ high meets a pulse that is $' + M.abs(h2) + '\\ \\text{cm}$ ' + (h2 > 0 ? 'high' : 'deep (upside down)') + ', coming the other way. What is the displacement where their peaks overlap exactly?', a: { t: 'num', v: String(sum), rtol: 0.01 }, unit: 'cm', steps: ['Displacements add, with signs (up positive).', '$' + h1 + ' + (' + h2 + ') = ' + sum + '\\ \\text{cm}$.' + (sum === 0 ? ' The string is flat for an instant.' : '')], hint: 'Add the displacements with their signs.' }; }
    if (s === 'after' || s === 'energy') {
      var it = s === 'after' ? ['Two pulses on a string pass through each other. What are they like after they separate?', 'Each has the same shape and size it had before', ['Each is smaller, because they lost energy meeting', 'They have swapped shapes', 'They have merged into one larger pulse']] : ['An upright pulse and an equal upside-down pulse meet, and for an instant the string is flat. Where is their energy at that instant?', 'In the motion of the string: it is moving fastest then', ['It has been destroyed', 'It was turned into heat and is gone for good', 'It is stored at the ends of the string']];
      return { q: it[0], a: mc(it[1], it[2]), steps: s === 'after' ? ['Superposition: where waves overlap, displacements add; each wave travels on unchanged.', 'So after they pass, each pulse looks exactly as before.'] : ['The string is flat but moving fast, so the energy is all kinetic for that instant.', 'A moment later the two pulses re-emerge unchanged.'], hint: 'Waves pass through each other.' };
    }
    var lam = R.pick([0.50, 1.00, 2.00]), f = 343 / lam;
    if (s === 'minpath') return { q: 'Two speakers play the same $' + tg(f) + '\\ \\text{Hz}$ tone in step. What is the smallest difference in distance to the two speakers that puts you at a quiet spot? (Sound travels at $343\\ \\text{m/s}$.)', a: ans(lam / 2, 0.01), unit: 'm', steps: ['$\\lambda = \\dfrac{v}{f} = \\dfrac{343}{' + tg(f) + '} = ' + tg(lam) + '\\ \\text{m}$.', 'Quiet (destructive) needs a path difference of half a wavelength: $\\dfrac{\\lambda}{2} = ' + tg(lam / 2) + '\\ \\text{m}$.'], hint: 'Crest meets trough when one path is half a wavelength longer.' };
    var k = R.int(1, 6), d1 = R.pick([2.0, 2.5, 3.0, 4.0, 5.0]), d2 = sig(d1 + k * lam / 2, 6), loud = k % 2 === 0;
    return { q: 'Two speakers play the same $' + tg(f) + '\\ \\text{Hz}$ tone in step. You stand $' + tg(d1) + '\\ \\text{m}$ from one and $' + tg(d2) + '\\ \\text{m}$ from the other. Is the sound loud or quiet there? (Sound travels at $343\\ \\text{m/s}$.)', a: mc(loud ? 'Loud: constructive interference' : 'Quiet: destructive interference', [loud ? 'Quiet: destructive interference' : 'Loud: constructive interference', 'Neither: the waves do not interfere', 'Loud, because two speakers are always louder']),
      steps: ['$\\lambda = \\dfrac{343}{' + tg(f) + '} = ' + tg(lam) + '\\ \\text{m}$.', 'Path difference: $' + tg(d2) + ' - ' + tg(d1) + ' = ' + tg(sig(d2 - d1, 6)) + '\\ \\text{m} = ' + tg(k / 2) + '\\lambda$.', loud ? 'A whole number of wavelengths: crest meets crest, so it is loud.' : 'A half number of wavelengths: crest meets trough, so it is quiet.'], hint: 'Compare the path difference with the wavelength.' };
  });

  G('phys2.standing-waves-strings', function (R, ctx) {
    var s = shape(R, ctx, ['f1', 'fn', 'nodes'], ['f1', 'fn', 'speed', 'lambda', 'spacing', 'concept'], ['speed', 'tension', 'fn', 'spacing', 'concept']);
    var Ls = R.pick([0.40, 0.50, 0.60, 0.65, 0.75, 0.80, 1.0, 1.2, 1.5, 2.0]), v = R.pick([120, 150, 200, 240, 260, 300, 330, 400]), n = R.int(2, 5), f1 = v / (2 * Ls);
    if (s === 'f1') return { q: 'A string $' + tg(Ls) + '\\ \\text{m}$ long is fixed at both ends, and waves travel on it at $' + v + '\\ \\text{m/s}$. Find its fundamental frequency.', a: ans(f1, 0.01), unit: 'Hz', steps: ['The fundamental fits half a wavelength: $\\lambda_1 = 2L = ' + tg(2 * Ls) + '\\ \\text{m}$.', '$f_1 = \\dfrac{v}{2L} = \\dfrac{' + v + '}{' + tg(2 * Ls) + '} = ' + q(f1, 'Hz') + '$.'], hint: 'f₁ = v/(2L).' };
    if (s === 'fn') return { q: 'A string $' + tg(Ls) + '\\ \\text{m}$ long, fixed at both ends, carries waves at $' + v + '\\ \\text{m/s}$. Find the frequency of its harmonic with $n = ' + n + '$.', a: ans(n * f1, 0.01), unit: 'Hz', steps: ['$f_n = \\dfrac{nv}{2L} = n f_1$.', '$f_1 = \\dfrac{' + v + '}{' + tg(2 * Ls) + '} = ' + q(f1, 'Hz') + '$, so $f_' + n + ' = ' + n + ' \\times ' + tx(f1) + ' = ' + q(n * f1, 'Hz') + '$.'], hint: 'Every harmonic is a whole-number multiple of f₁.' };
    if (s === 'lambda') return { q: 'A string $' + tg(Ls) + '\\ \\text{m}$ long, fixed at both ends, vibrates in its harmonic with $n = ' + n + '$. What is the wavelength?', a: ans(2 * Ls / n, 0.01), unit: 'm', viz: { name: 'ph-wave', opts: { mode: 'standing-string', n: n, interactive: false, quiet: true } }, steps: ['$n$ half-wavelengths fit on the string: $L = n\\dfrac{\\lambda}{2}$.', '$\\lambda = \\dfrac{2L}{n} = \\dfrac{' + tg(2 * Ls) + '}{' + n + '} = ' + q(2 * Ls / n, 'm') + '$.'], hint: 'Count half-wavelengths (loops).' };
    if (s === 'speed') { var fq = sig(n * f1, 3); return { q: 'A string $' + tg(Ls) + '\\ \\text{m}$ long, fixed at both ends, vibrates in ' + n + ' loops at $' + tg(fq) + '\\ \\text{Hz}$. How fast do waves travel on it?', a: ans(2 * Ls * fq / n, 0.01), unit: 'm/s', viz: { name: 'ph-wave', opts: { mode: 'standing-string', n: n, interactive: false, quiet: true } }, steps: [n + ' loops means $n = ' + n + '$: $\\lambda = \\dfrac{2L}{' + n + '} = ' + q(2 * Ls / n, 'm') + '$.', '$v = f\\lambda = (' + tg(fq) + ')(' + tx(2 * Ls / n) + ') = ' + q(2 * Ls * fq / n, 'm/s') + '$.'], hint: 'Each loop is half a wavelength.' }; }
    if (s === 'nodes') { var askA = R.coin(); return { q: 'A string fixed at both ends vibrates in its harmonic with $n = ' + n + '$. How many ' + (askA ? 'antinodes' : 'nodes, counting the two ends,') + ' does it have?', a: exact(askA ? n : n + 1), viz: { name: 'ph-wave', opts: { mode: 'standing-string', n: n, interactive: false, quiet: true } }, steps: ['The $n$th harmonic has $n$ loops.', 'Each loop has one antinode in the middle, and nodes sit between loops and at both ends.', askA ? 'Antinodes: $' + n + '$.' : 'Nodes: $' + n + ' + 1 = ' + (n + 1) + '$.'], hint: 'Draw the loops.' }; }
    if (s === 'spacing') return { q: 'A string $' + tg(Ls) + '\\ \\text{m}$ long, fixed at both ends, vibrates in its harmonic with $n = ' + n + '$. How far apart are neighboring nodes?', a: ans(Ls / n, 0.01), unit: 'm', steps: ['Neighboring nodes are half a wavelength apart, and the $n$ loops share the length equally.', 'Spacing $= \\dfrac{L}{n} = \\dfrac{' + tg(Ls) + '}{' + n + '} = ' + q(Ls / n, 'm') + '$.'], hint: 'Each loop is the same length.' };
    if (s === 'tension') { var mu = R.pick([0.0010, 0.0020, 0.0040, 0.0050]), ft = R.pick([110, 147, 196, 220, 262, 330]), T = mu * M.pow(2 * Ls * ft, 2); return { q: 'A string $' + tg(Ls) + '\\ \\text{m}$ long with $\\mu = ' + tg(mu) + '\\ \\text{kg/m}$ is fixed at both ends. What tension gives it a fundamental of $' + ft + '\\ \\text{Hz}$?', a: ans(T, 0.01), unit: 'N', steps: ['Needed speed: $v = 2Lf_1 = 2(' + tg(Ls) + ')(' + ft + ') = ' + q(2 * Ls * ft, 'm/s') + '$.', '$F_T = \\mu v^{2} = (' + tg(mu) + ')(' + tx(2 * Ls * ft) + ')^{2} = ' + q(T, 'N') + '$.'], hint: 'Find the wave speed from f₁ = v/(2L), then F_T = μv².' }; }
    var it = R.pick([
      ['On a string vibrating in a standing wave, what is a node?', 'A point that does not move at all', ['The point that moves the most', 'The middle of every string', 'A point where the wave is created'], 'Nodes stay still; antinodes swing the most. The fixed ends are always nodes.'],
      ['The tension in a guitar string is made four times as large. What happens to its fundamental frequency?', 'It doubles', ['It becomes four times as large', 'It is halved', 'It stays the same'], '$f_1 = \\dfrac{v}{2L}$ and $v = \\sqrt{F_T/\\mu}$, so $f_1$ goes as $\\sqrt{F_T}$: four times the tension doubles it.'],
      ['A guitarist presses a string against a fret, shortening the part that vibrates. What happens to the pitch?', 'It rises', ['It falls', 'It stays the same', 'The string can no longer vibrate'], 'A shorter string fits shorter wavelengths, and with the same wave speed $f_1 = \\dfrac{v}{2L}$ goes up.']
    ]);
    return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'f_n = nv/(2L).' };
  });

  G('phys2.standing-waves-pipes', function (R, ctx) {
    var s = shape(R, ctx, ['open', 'closed'], ['open', 'closed', 'length', 'next', 'ratio'], ['identify', 'f1from', 'length', 'next', 'closedN']);
    var Ls = R.pick([0.25, 0.30, 0.40, 0.50, 0.60, 0.75, 0.80, 1.0, 1.2, 1.5]), v = 343;
    if (s === 'open') { var n = R.int(1, 3), f = n * v / (2 * Ls); return { q: 'A pipe $' + tg(Ls) + '\\ \\text{m}$ long is open at both ends. Find the frequency of its ' + (n === 1 ? 'fundamental' : 'harmonic with $n = ' + n + '$') + '. (Sound travels at $343\\ \\text{m/s}$.)', a: ans(f, 0.01), unit: 'Hz', viz: { name: 'ph-wave', opts: { mode: 'standing-pipe', pipe: 'open', n: n, interactive: false, quiet: true } }, steps: ['Open at both ends: antinodes at both ends, so $f_n = \\dfrac{nv}{2L}$, any $n$.', '$f_' + n + ' = \\dfrac{' + n + '(343)}{2(' + tg(Ls) + ')} = ' + q(f, 'Hz') + '$.'], hint: 'An open pipe works like a string: f_n = nv/(2L).' }; }
    if (s === 'closed' || s === 'closedN') { var nn = s === 'closedN' ? R.pick([3, 5]) : 1, fc = nn * v / (4 * Ls); return { q: 'A pipe $' + tg(Ls) + '\\ \\text{m}$ long is closed at one end. Find the frequency of its ' + (nn === 1 ? 'fundamental' : (nn === 3 ? 'second' : 'third') + ' resonance (the harmonic with $n = ' + nn + '$)') + '. (Sound travels at $343\\ \\text{m/s}$.)', a: ans(fc, 0.01), unit: 'Hz', viz: { name: 'ph-wave', opts: { mode: 'standing-pipe', pipe: 'closed', n: nn, interactive: false, quiet: true } }, steps: ['Closed at one end: a node at the closed end and an antinode at the open end, so $L = n\\dfrac{\\lambda}{4}$ with $n$ odd.', '$f_' + nn + ' = \\dfrac{' + nn + '(343)}{4(' + tg(Ls) + ')} = ' + q(fc, 'Hz') + '$.'], hint: 'A closed pipe holds an odd number of quarter wavelengths.' }; }
    if (s === 'length') { var closed = R.coin(), f1 = R.pick([131, 196, 220, 262, 294, 330, 440]), L = closed ? v / (4 * f1) : v / (2 * f1); return { q: 'How long must a pipe ' + (closed ? 'closed at one end' : 'open at both ends') + ' be to have a fundamental of $' + f1 + '\\ \\text{Hz}$? (Sound travels at $343\\ \\text{m/s}$.)', a: ans(L, 0.01), unit: 'm', steps: [closed ? 'Closed pipe: $f_1 = \\dfrac{v}{4L}$, so $L = \\dfrac{v}{4f_1}$.' : 'Open pipe: $f_1 = \\dfrac{v}{2L}$, so $L = \\dfrac{v}{2f_1}$.', '$L = \\dfrac{343}{' + (closed ? 4 : 2) + '(' + f1 + ')} = ' + q(L, 'm') + '$.'], hint: 'Solve the fundamental formula for L.' }; }
    if (s === 'next') { var cl = R.coin(), base = cl ? v / (4 * Ls) : v / (2 * Ls); return { q: 'A pipe ' + (cl ? 'closed at one end' : 'open at both ends') + ' has a fundamental of $' + tx(base) + '\\ \\text{Hz}$. What is the next higher frequency at which it resonates?', a: ans(cl ? 3 * base : 2 * base, 0.01), unit: 'Hz', steps: [cl ? 'A closed pipe has only odd harmonics: $f_1, 3f_1, 5f_1, \\dots$' : 'An open pipe has every harmonic: $f_1, 2f_1, 3f_1, \\dots$', 'Next: $' + (cl ? 3 : 2) + ' \\times ' + tx(base) + ' = ' + q(cl ? 3 * base : 2 * base, 'Hz') + '$.'], hint: cl ? 'Closed pipes skip the even harmonics.' : 'Open pipes have all harmonics.' }; }
    if (s === 'ratio') return { q: 'Two pipes have the same length. Pipe A is open at both ends; pipe B is closed at one end. How do their fundamental frequencies compare?', a: mc('A\'s fundamental is twice B\'s', ['They are the same', 'B\'s fundamental is twice A\'s', 'A\'s fundamental is four times B\'s']), steps: ['Open: $f_1 = \\dfrac{v}{2L}$. Closed: $f_1 = \\dfrac{v}{4L}$.', 'So the open pipe\'s fundamental is twice the closed pipe\'s: a closed pipe sounds an octave lower.'], hint: 'Compare v/(2L) with v/(4L).' };
    var cl2 = R.coin(), f0 = R.pick([40, 50, 60, 70, 80, 100, 110]), k0 = cl2 ? R.pick([1, 3, 5]) : R.int(1, 4), list = cl2 ? [k0, k0 + 2, k0 + 4] : [k0, k0 + 1, k0 + 2], fr = list.map(function (k) { return k * f0; });
    if (s === 'identify') return { q: 'A pipe resonates at $' + fr[0] + '$, $' + fr[1] + '$ and $' + fr[2] + '\\ \\text{Hz}$, with no resonances between them. Is it open at both ends or closed at one end?', a: mc(cl2 ? 'Closed at one end' : 'Open at both ends', [cl2 ? 'Open at both ends' : 'Closed at one end', 'It could be either', 'Neither: a pipe cannot resonate at these']),
      steps: ['Neighbors differ by $' + (fr[1] - fr[0]) + '\\ \\text{Hz}$.', cl2 ? 'The frequencies are odd multiples of $' + f0 + '\\ \\text{Hz}$ (' + list.join(', ') + '), half the spacing: only odd harmonics, so the pipe is closed at one end.' : 'The frequencies are whole-number multiples of the spacing, $' + f0 + '\\ \\text{Hz}$ (' + list.join(', ') + '): every harmonic, so the pipe is open at both ends.'], hint: 'Divide each frequency by the spacing between neighbors.' };
    return { q: 'A pipe resonates at $' + fr[0] + '$, $' + fr[1] + '$ and $' + fr[2] + '\\ \\text{Hz}$, with no resonances between them. What is its fundamental frequency?', a: ans(f0, 0.01), unit: 'Hz',
      steps: ['Neighbors differ by $' + (fr[1] - fr[0]) + '\\ \\text{Hz}$.', cl2 ? 'Dividing by $' + (fr[1] - fr[0]) + '$ gives non-whole numbers, so the pipe is closed at one end and its frequencies step by $2f_1$: $f_1 = ' + f0 + '\\ \\text{Hz}$.' : 'They are whole multiples of the spacing, so the pipe is open and $f_1$ equals the spacing: $f_1 = ' + f0 + '\\ \\text{Hz}$.'], hint: 'Open pipes step by f₁; closed pipes step by 2f₁.' };
  });

  G('phys2.sound-intensity', function (R, ctx) {
    var s = shape(R, ctx, ['beta', 'I', 'concept'], ['beta', 'I', 'ratio', 'sources', 'distance', 'concept'], ['beta', 'sources', 'distance', 'power', 'ratio']);
    if (s === 'beta') { var m = ctx.level === 1 ? 1 : R.pick([1, 2, 3, 5]), e = R.int(-10, -3), I = m * M.pow(10, e), b = 10 * M.log10(I / I0); return { q: 'A sound has an intensity of $' + tg(I) + '\\ \\text{W/m}^2$. What is its sound level in decibels?', a: ans(b, 0.005), unit: 'dB', steps: ['$\\dfrac{I}{I_0} = \\dfrac{' + tg(I) + '}{10^{-12}} = ' + tg(sig(I / I0, 6)) + '$.', '$\\beta = 10\\log_{10}(' + tg(sig(I / I0, 6)) + ') = ' + q(b, 'dB') + '$.'], hint: 'β = 10 log(I/I₀) with I₀ = 10⁻¹² W/m².' }; }
    if (s === 'I') { var bb = R.pick([30, 40, 50, 60, 65, 70, 80, 85, 90, 100]), Ii = I0 * M.pow(10, bb / 10); return { q: 'A sound has a level of $' + bb + '\\ \\text{dB}$. What is its intensity?', a: ans(Ii, 0.01), unit: 'W/m²', steps: ['$\\dfrac{I}{I_0} = 10^{\\beta/10} = 10^{' + bb / 10 + '}$.', '$I = (10^{-12})(10^{' + bb / 10 + '}) = ' + q(Ii, 'W/m²') + '$.'], hint: 'Undo the log: I = I₀ × 10^(β/10).' }; }
    if (s === 'ratio') { var F = R.pick([10, 100, 1000, 2, 4, 1 / 10, 1 / 100]), d = 10 * M.log10(F); return { q: 'The intensity of a sound is ' + (F >= 1 ? 'multiplied by ' + F : 'divided by ' + M.round(1 / F)) + '. By how many decibels does its level change? (Give a negative number for a drop.)', a: ans(d, 0.01), unit: 'dB', steps: ['$\\Delta\\beta = 10\\log_{10}\\dfrac{I_2}{I_1} = 10\\log_{10}(' + (F >= 1 ? F : '\\frac{1}{' + M.round(1 / F) + '}') + ')$.', '$\\Delta\\beta = ' + q(d, 'dB') + '$.'], hint: 'Each factor of 10 in intensity is 10 dB.' }; }
    if (s === 'sources') { var N = R.pick([2, 4, 10, 100]), b0 = R.pick([50, 60, 70, 80]), bn = b0 + 10 * M.log10(N); return { q: 'One machine makes a sound level of $' + b0 + '\\ \\text{dB}$ at your spot. What level do ' + N + ' identical machines make there, all running at once?', a: ans(bn, 0.005), unit: 'dB', steps: ['Intensities add: ' + N + ' machines give ' + N + ' times the intensity.', '$\\beta = ' + b0 + ' + 10\\log_{10}' + N + ' = ' + b0 + ' + ' + tx(10 * M.log10(N)) + ' = ' + q(bn, 'dB') + '$.'], hint: 'Add intensities, not decibels.' }; }
    if (s === 'distance') { var r1 = R.pick([1.0, 2.0, 3.0, 5.0]), k = R.pick([2, 3, 4, 10]), b1 = R.pick([70, 80, 90, 100]), b2 = b1 - 20 * M.log10(k); return { q: 'A small source gives $' + b1 + '\\ \\text{dB}$ at $' + tg(r1) + '\\ \\text{m}$ away. Assuming the sound spreads evenly in all directions, what is the level at $' + tg(k * r1) + '\\ \\text{m}$?', a: ans(b2, 0.005), unit: 'dB', steps: [k + ' times as far: the intensity is $\\dfrac{1}{' + k + '^{2}} = \\dfrac{1}{' + k * k + '}$ as large.', '$\\Delta\\beta = 10\\log_{10}\\dfrac{1}{' + k * k + '} = ' + tx(-20 * M.log10(k)) + '\\ \\text{dB}$.', '$\\beta = ' + b1 + ' - ' + tx(20 * M.log10(k)) + ' = ' + q(b2, 'dB') + '$.'], hint: 'Intensity falls as 1/r².' }; }
    if (s === 'power') { var r = R.pick([2.0, 3.0, 5.0, 10]), Ip = R.pick([1.0e-4, 2.0e-4, 5.0e-5, 1.0e-3, 4.0e-3]), P = Ip * 4 * PI * r * r; return { q: 'At $' + tg(r) + '\\ \\text{m}$ from a small speaker the sound intensity is $' + tg(Ip) + '\\ \\text{W/m}^2$. Assuming it spreads evenly in all directions, what sound power does the speaker put out?', a: ans(P, 0.01), unit: 'W', steps: ['The power spreads over a sphere of area $4\\pi r^{2}$.', '$$\\begin{aligned} P &= I(4\\pi r^{2}) = (' + tg(Ip) + ')(4\\pi)(' + tg(r) + ')^{2} \\\\ &= ' + q(P, 'W') + ' \\end{aligned}$$'], hint: 'P = I × 4πr².' }; }
    var it = R.pick([
      ['A second, identical speaker is turned on beside the first, doubling the intensity. The level was $60\\ \\text{dB}$. What is it now?', 'About $63\\ \\text{dB}$', ['$120\\ \\text{dB}$', '$70\\ \\text{dB}$', '$60\\ \\text{dB}$'], 'Doubling $I$ adds $10\\log_{10}2 = 3.0\\ \\text{dB}$.'],
      ['A sound level of $0\\ \\text{dB}$ means…', 'an intensity of $I_0 = 10^{-12}\\ \\text{W/m}^2$, about the faintest sound people can hear', ['no sound at all', 'an intensity of $0\\ \\text{W/m}^2$', 'an intensity of $1\\ \\text{W/m}^2$'], '$\\beta = 10\\log_{10}(I/I_0) = 0$ when $I = I_0$; quieter sounds have negative levels.'],
      ['You move twice as far from a small source of sound. By about how much does the level drop?', 'About $6\\ \\text{dB}$', ['$3\\ \\text{dB}$', 'It halves', '$20\\ \\text{dB}$'], 'Twice as far gives a quarter of the intensity: $10\\log_{10}\\frac{1}{4} = -6.0\\ \\text{dB}$.']
    ]);
    return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Decibels measure ratios: ×10 is +10 dB.' };
  });

  G('phys2.doppler', function (R, ctx) {
    var s = shape(R, ctx, ['source', 'source', 'concept'], ['source', 'observer', 'speed', 'concept', 'lambda'], ['source', 'observer', 'both', 'speed', 'lambda']);
    var f = R.pick([300, 400, 440, 500, 600, 800, 1000]), vs = R.pick([10, 15, 20, 25, 30, 35, 40]);
    if (s === 'concept') {
      var it = R.pick([
        ['A car sounding a steady horn drives past you at constant speed. What do you hear?', 'A steady higher pitch as it approaches, then a steady lower pitch after it passes', ['A pitch that keeps rising as it gets closer', 'The same pitch the whole time, getting louder then softer', 'A lower pitch as it approaches, then a higher one'], 'At constant speed the shifted frequency is constant; it jumps from above to below the true pitch as the car passes. Only the loudness keeps changing with distance.'],
        ['A source of sound moves toward you. Which quantity changes for the sound reaching you?', 'The wavelength (and so the frequency)', ['The speed of sound', 'The frequency the source emits', 'Nothing changes'], 'The air sets the speed of sound. The source\'s motion bunches the crests ahead of it, shortening the wavelength, so you hear a higher frequency.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), viz: { name: 'ph-doppler', opts: { mode: 'sound', vs: 80, interactive: false, quiet: true } }, steps: [it[3]], hint: 'Look at the spacing of the wavefronts ahead of the source.' };
    }
    if (s === 'source') { var tw = R.coin(), fp = f * VS / (VS + (tw ? -vs : vs)); return { q: 'A source of a $' + f + '\\ \\text{Hz}$ tone moves at $' + vs + '\\ \\text{m/s}$ ' + (tw ? 'toward' : 'away from') + ' you. What frequency do you hear? (Sound travels at $343\\ \\text{m/s}$.)', a: ans(fp, 0.005), unit: 'Hz', steps: [tw ? 'Source approaching: the crests bunch up, $f\' = f\\dfrac{v}{v - v_s}$.' : 'Source moving away: the crests spread out, $f\' = f\\dfrac{v}{v + v_s}$.', '$$f\' = ' + f + '\\cdot\\frac{343}{343 ' + (tw ? '-' : '+') + ' ' + vs + '} = ' + q(fp, 'Hz') + '$$', tw ? 'Higher than ' + f + ' Hz, as it should be.' : 'Lower than ' + f + ' Hz, as it should be.'], hint: tw ? 'Approach raises the pitch.' : 'Moving away lowers the pitch.' }; }
    if (s === 'observer') { var tw2 = R.coin(), vo = R.pick([10, 15, 20, 25, 30]), fo = f * (VS + (tw2 ? vo : -vo)) / VS; return { q: 'You drive at $' + vo + '\\ \\text{m/s}$ ' + (tw2 ? 'toward' : 'away from') + ' a siren that stands still and sounds at $' + f + '\\ \\text{Hz}$. What frequency do you hear? (Sound travels at $343\\ \\text{m/s}$.)', a: ans(fo, 0.005), unit: 'Hz', steps: [tw2 ? 'Moving toward the source, you meet crests more often: $f\' = f\\dfrac{v + v_o}{v}$.' : 'Moving away, you meet crests less often: $f\' = f\\dfrac{v - v_o}{v}$.', '$f\' = ' + f + '\\cdot\\dfrac{343 ' + (tw2 ? '+' : '-') + ' ' + vo + '}{343} = ' + q(fo, 'Hz') + '$.'], hint: 'Only the numerator changes when the observer moves.' }; }
    if (s === 'both') { var vo2 = R.pick([10, 15, 20, 25]), fb = f * (VS + vo2) / (VS - vs); return { q: 'A car moving at $' + vs + '\\ \\text{m/s}$ sounds a $' + f + '\\ \\text{Hz}$ horn while driving toward a cyclist riding toward it at $' + vo2 + '\\ \\text{m/s}$. What frequency does the cyclist hear? (Sound travels at $343\\ \\text{m/s}$.)', a: ans(fb, 0.005), unit: 'Hz', steps: ['Both move toward each other: upper signs, $f\' = f\\dfrac{v + v_o}{v - v_s}$.', '$$f\' = ' + f + '\\cdot\\frac{343 + ' + vo2 + '}{343 - ' + vs + '} = ' + q(fb, 'Hz') + '$$'], hint: 'Approach raises the frequency in both places.' }; }
    if (s === 'lambda') { var lp = (VS - vs) / f; return { q: 'A source moving at $' + vs + '\\ \\text{m/s}$ emits a $' + f + '\\ \\text{Hz}$ tone. What is the wavelength of the sound directly ahead of it? (Sound travels at $343\\ \\text{m/s}$.)', a: ans(lp, 0.005), unit: 'm', steps: ['In one period $T = 1/f$ a crest moves $vT$ while the source moves $v_sT$ after it.', '$\\lambda\' = \\dfrac{v - v_s}{f} = \\dfrac{343 - ' + vs + '}{' + f + '} = ' + q(lp, 'm') + '$ (at rest it would be $' + tx(VS / f) + '\\ \\text{m}$).'], hint: 'The crests ahead are squeezed by the source\'s motion.' }; }
    var vt = R.pick([10, 15, 20, 25, 30]), fh = sig(f * VS / (VS - vt), 3), vsol = VS - f * VS / fh;
    return { q: 'A train whistle has a frequency of $' + f + '\\ \\text{Hz}$. As the train approaches, you hear $' + tg(fh) + '\\ \\text{Hz}$. How fast is the train moving? (Sound travels at $343\\ \\text{m/s}$.)', a: ans(vsol, 0.02), unit: 'm/s', steps: ['$' + tg(fh) + ' = ' + f + '\\cdot\\dfrac{343}{343 - v_s}$.', '$343 - v_s = \\dfrac{' + f + '(343)}{' + tg(fh) + '} = ' + tx(f * VS / fh, 4) + '$.', '$v_s = ' + q(vsol, 'm/s') + '$.'], hint: 'Solve the Doppler formula for v_s.' };
  });

  G('phys2.single-slit', function (R, ctx) {
    var s = shape(R, ctx, ['angle', 'width', 'concept'], ['angle', 'width', 'slit', 'lambda', 'concept'], ['angle', 'width', 'slit', 'lambda']);
    var lam = R.pick([450, 480, 500, 550, 589, 600, 633, 650, 700]), a = R.pick([2.0, 3.0, 4.0, 5.0, 6.0, 8.0, 10]); // a in micrometers
    if (s === 'concept') {
      var it = R.pick([
        ['Light passes through a single narrow slit. The slit is made narrower. What happens to the central bright band on the screen?', 'It gets wider', ['It gets narrower', 'It stays the same width', 'It disappears'], 'The first dark fringe is at $\\sin\\theta = \\lambda/a$: a smaller $a$ gives a larger angle, so the pattern spreads.'],
        ['The red light passing through a single slit is replaced with blue light. What happens to the diffraction pattern?', 'It gets narrower', ['It gets wider', 'It stays the same', 'It turns into a double-slit pattern'], 'Blue light has a shorter wavelength, so $\\sin\\theta = \\lambda/a$ is smaller and the pattern shrinks.'],
        ['Why can you hear a person talking around the corner of a doorway but not see them?', 'Sound wavelengths are about the size of the doorway, so sound diffracts a lot; light\'s are far smaller', ['Sound travels faster than light', 'Light cannot pass through doorways', 'Sound waves bounce off walls but light waves never do'], 'Diffraction is strong when the opening is not much bigger than the wavelength. Sound is about a meter long; light is about $500\\ \\text{nm}$.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Diffraction spreads more when λ/a is larger.' };
    }
    if (s === 'angle') { var m = ctx.level === 3 ? R.pick([1, 2]) : 1, sn = m * lam * 1e-9 / (a * 1e-6); if (sn > 0.9) { m = 1; sn = lam * 1e-9 / (a * 1e-6); } var th = asind(sn); return { q: 'Light of $' + lam + '\\ \\text{nm}$ passes through a slit $' + tg(a) + '\\ \\mu\\text{m}$ wide. At what angle is the ' + (m === 1 ? 'first' : 'second') + ' dark fringe?', a: ans(th, 0.01), unit: '°', viz: { name: 'ph-interference', opts: { mode: 'single', lambda: lam, a: a, interactive: false, quiet: true } }, steps: ['Dark fringes: $a\\sin\\theta = m\\lambda$ with $m = ' + m + '$.', '$\\sin\\theta = \\dfrac{' + m + '(' + lam + ' \\times 10^{-9})}{' + tg(a) + ' \\times 10^{-6}} = ' + tx(sn) + '$.', '$\\theta = \\sin^{-1}(' + tx(sn) + ') = ' + deg(th) + '$.'], hint: 'a sin θ = mλ, with both lengths in meters.' }; }
    var amm = R.pick([0.050, 0.080, 0.10, 0.12, 0.15, 0.20]), L = R.pick([1.0, 1.5, 2.0, 2.5, 3.0]), W = 2 * lam * 1e-9 * L / (amm * 1e-3);
    if (s === 'width') return { q: 'Light of $' + lam + '\\ \\text{nm}$ passes through a slit $' + tg(amm) + '\\ \\text{mm}$ wide onto a screen $' + tg(L) + '\\ \\text{m}$ away. How wide is the central bright band, in centimeters?', a: ans(W * 100, 0.01), unit: 'cm', steps: ['Small angles: the first dark fringe is at $y = \\dfrac{\\lambda L}{a}$ on each side.', '$$y = \\frac{(' + lam + ' \\times 10^{-9})(' + tg(L) + ')}{' + tg(amm) + ' \\times 10^{-3}} = ' + q(W / 2, 'm') + '$$', 'Width $= 2y = ' + q(W, 'm') + ' = ' + q(W * 100, 'cm') + '$.'], hint: 'The band runs from one first dark fringe to the other.' };
    var Wg = sig(W * 100, 3);
    if (s === 'slit') { var aa = 2 * lam * 1e-9 * L / (Wg / 100); return { q: 'Light of $' + lam + '\\ \\text{nm}$ through a single slit makes a central bright band $' + tg(Wg) + '\\ \\text{cm}$ wide on a screen $' + tg(L) + '\\ \\text{m}$ away. How wide is the slit, in millimeters?', a: ans(aa * 1000, 0.01), unit: 'mm', steps: ['Width $W = \\dfrac{2\\lambda L}{a}$, so $a = \\dfrac{2\\lambda L}{W}$.', '$$a = \\frac{2(' + lam + ' \\times 10^{-9})(' + tg(L) + ')}{' + tg(Wg / 100) + '} = ' + q(aa, 'm') + '$$', 'That is $' + q(aa * 1000, 'mm') + '$.'], hint: 'Solve W = 2λL/a for a.' }; }
    var th2 = R.pick([5.0, 8.0, 10, 12, 15, 20]), lam2 = a * 1e-6 * sind(th2) * 1e9;
    return { q: 'The first dark fringe from a slit $' + tg(a) + '\\ \\mu\\text{m}$ wide appears at $' + tg(th2) + '^\\circ$. What is the wavelength of the light, in nanometers?', a: ans(lam2, 0.01), unit: 'nm', steps: ['$\\lambda = a\\sin\\theta = (' + tg(a) + ' \\times 10^{-6})\\sin ' + tg(th2) + '^\\circ$.', '$\\lambda = ' + q(lam2 * 1e-9, 'm') + ' = ' + q(lam2, 'nm') + '$.'], hint: 'For the first dark fringe, a sin θ = λ.' };
  });

  G('phys2.double-slit', function (R, ctx) {
    var s = shape(R, ctx, ['spacing', 'spacing', 'concept'], ['spacing', 'lambda', 'angle', 'dark', 'concept'], ['lambda', 'd', 'angle', 'dark', 'spacing']);
    var lam = R.pick([450, 480, 500, 520, 550, 589, 600, 633, 650]), d = R.pick([0.10, 0.12, 0.15, 0.20, 0.25, 0.30, 0.50]), L = R.pick([1.0, 1.2, 1.5, 2.0, 2.5, 3.0]), dy = lam * 1e-9 * L / (d * 1e-3);
    if (s === 'concept') {
      var ch = R.pick([['the slits are moved closer together', 'farther apart'], ['the screen is moved farther away', 'farther apart'], ['red light is replaced with violet light', 'closer together'], ['the slits are moved farther apart', 'closer together']]);
      return { q: 'In a double-slit experiment, ' + ch[0] + '. What happens to the bright fringes on the screen?', a: mc('They spread ' + ch[1], ['They spread ' + (ch[1] === 'farther apart' ? 'closer together' : 'farther apart'), 'Nothing changes', 'They all merge into one bright band']), steps: ['Fringe spacing: $\\Delta y = \\dfrac{\\lambda L}{d}$.', ch[0].indexOf('closer') >= 0 ? 'Smaller $d$ gives a bigger spacing.' : ch[0].indexOf('screen') >= 0 ? 'Bigger $L$ gives a bigger spacing.' : ch[0].indexOf('violet') >= 0 ? 'Violet has a shorter wavelength, so a smaller spacing.' : 'Bigger $d$ gives a smaller spacing.'], hint: 'Δy = λL/d.' };
    }
    if (s === 'spacing') return { q: 'Light of $' + lam + '\\ \\text{nm}$ passes through two slits $' + tg(d) + '\\ \\text{mm}$ apart onto a screen $' + tg(L) + '\\ \\text{m}$ away. How far apart are the bright fringes, in millimeters?', a: ans(dy * 1000, 0.01), unit: 'mm', viz: { name: 'ph-interference', opts: { mode: 'double', lambda: lam, d: d * 1000, a: 20, L: L, interactive: false, quiet: true } }, steps: ['$$\\Delta y = \\frac{\\lambda L}{d} = \\frac{(' + lam + ' \\times 10^{-9})(' + tg(L) + ')}{' + tg(d) + ' \\times 10^{-3}}$$', '$\\Delta y = ' + q(dy, 'm') + ' = ' + q(dy * 1000, 'mm') + '$.'], hint: 'Δy = λL/d with everything in meters.' };
    if (s === 'dark') return { q: 'Light of $' + lam + '\\ \\text{nm}$ passes through two slits $' + tg(d) + '\\ \\text{mm}$ apart onto a screen $' + tg(L) + '\\ \\text{m}$ away. How far from the central bright fringe is the first dark fringe, in millimeters?', a: ans(dy * 500, 0.01), unit: 'mm', steps: ['Dark: $d\\sin\\theta = \\frac{1}{2}\\lambda$, so for small angles $y = \\dfrac{\\lambda L}{2d}$, halfway to the first bright fringe.', '$$y = \\frac{(' + lam + ' \\times 10^{-9})(' + tg(L) + ')}{2(' + tg(d) + ' \\times 10^{-3})} = ' + q(dy * 500, 'mm') + '$$'], hint: 'The first dark fringe is halfway between the central and first bright fringes.' };
    var m = R.int(2, 4), ym = sig(m * dy * 100, 3);
    if (s === 'lambda') { var lr = ym / 100 * d * 1e-3 / (m * L); return { q: 'In a double-slit experiment with slits $' + tg(d) + '\\ \\text{mm}$ apart and a screen $' + tg(L) + '\\ \\text{m}$ away, the bright fringe with $m = ' + m + '$ is $' + tg(ym) + '\\ \\text{cm}$ from the center. What is the wavelength, in nanometers?', a: ans(lr * 1e9, 0.01), unit: 'nm', steps: ['$y_m = \\dfrac{m\\lambda L}{d}$, so $\\lambda = \\dfrac{y_m d}{mL}$.', '$$\\lambda = \\frac{(' + tg(ym / 100) + ')(' + tg(d) + ' \\times 10^{-3})}{' + m + '(' + tg(L) + ')}$$', '$\\lambda = ' + q(lr, 'm') + ' = ' + q(lr * 1e9, 'nm') + '$.'], hint: 'Solve y_m = mλL/d for λ.' }; }
    if (s === 'd') { var dyg = sig(dy * 1000, 3), dd = lam * 1e-9 * L / (dyg / 1000); return { q: 'Light of $' + lam + '\\ \\text{nm}$ makes bright fringes $' + tg(dyg) + '\\ \\text{mm}$ apart on a screen $' + tg(L) + '\\ \\text{m}$ from two slits. How far apart are the slits, in millimeters?', a: ans(dd * 1000, 0.01), unit: 'mm', steps: ['$d = \\dfrac{\\lambda L}{\\Delta y} = \\dfrac{(' + lam + ' \\times 10^{-9})(' + tg(L) + ')}{' + tg(dyg / 1000) + '}$.', '$d = ' + q(dd, 'm') + ' = ' + q(dd * 1000, 'mm') + '$.'], hint: 'Solve Δy = λL/d for d.' }; }
    var dum = R.pick([2.0, 2.5, 3.0, 4.0, 5.0]), mm = R.int(1, 3), sn = mm * lam * 1e-3 / dum; if (sn > 0.95) { mm = 1; sn = lam * 1e-3 / dum; } var th = asind(sn);
    return { q: 'Slits $' + tg(dum) + '\\ \\mu\\text{m}$ apart are lit with $' + lam + '\\ \\text{nm}$ light. At what angle is the bright fringe with $m = ' + mm + '$?', a: ans(th, 0.01), unit: '°', steps: ['The angle may not be small, so use $d\\sin\\theta = m\\lambda$ directly.', '$\\sin\\theta = \\dfrac{' + mm + '(' + lam + ' \\times 10^{-9})}{' + tg(dum) + ' \\times 10^{-6}} = ' + tx(sn) + '$.', '$\\theta = ' + deg(th) + '$.'], hint: 'd sin θ = mλ.' };
  });

  G('phys2.diffraction-grating', function (R, ctx) {
    var s = shape(R, ctx, ['d', 'angle'], ['d', 'angle', 'lambda', 'maxorder', 'concept'], ['angle', 'lambda', 'maxorder', 'sep']);
    var N = R.pick([100, 200, 300, 400, 500, 600, 800, 1000, 1200]), d = 1e-3 / N, lam = R.pick([400, 434, 450, 486, 500, 550, 589, 600, 633, 656, 700]);
    var dtex = '$d = \\dfrac{1}{' + N + '}\\ \\text{mm} = ' + q(d, 'm') + '$.';
    if (s === 'd') return { q: 'A grating has $' + N + '$ lines per millimeter. What is the spacing $d$ between neighboring lines, in micrometers?', a: ans(d * 1e6, 0.01), unit: 'μm', steps: ['$d$ is the reciprocal of the number of lines per length.', dtex, 'That is $' + q(d * 1e6, 'μm') + '$.'], hint: 'd = 1/(lines per mm), in mm.' };
    if (s === 'concept') return { q: 'White light passes through a diffraction grating. In the first-order spectrum, which color is bent through the largest angle?', a: mc('Red', ['Violet', 'Green', 'All colors are bent the same amount']), steps: ['$\\sin\\theta = \\dfrac{m\\lambda}{d}$: the longest wavelength makes the largest angle.', 'Red has the longest visible wavelength, so it is bent the most. (A prism does the reverse, bending violet the most.)'], hint: 'Larger λ, larger angle.' };
    while (M.abs(d / (lam * 1e-9) - M.round(d / (lam * 1e-9))) < 0.02) lam += 25; // keep clear of a line at exactly 90°
    var maxm = M.floor(d / (lam * 1e-9));
    if (s === 'maxorder') { if (maxm < 1) { N = 600; d = 1e-3 / N; maxm = M.floor(d / (lam * 1e-9)); dtex = '$d = \\dfrac{1}{600}\\ \\text{mm} = ' + q(d, 'm') + '$.'; } return { q: 'Light of $' + lam + '\\ \\text{nm}$ falls on a grating with $' + N + '$ lines per millimeter. What is the highest order of bright line you can see?', a: exact(maxm), steps: [dtex, 'Since $\\sin\\theta \\le 1$: $m \\le \\dfrac{d}{\\lambda} = \\dfrac{' + tx(d) + '}{' + lam + ' \\times 10^{-9}} = ' + tx(d / (lam * 1e-9)) + '$.', 'The highest whole number is $m = ' + maxm + '$.'], hint: 'sin θ can be at most 1.' }; }
    var N2 = N; if (maxm < 1 || lam * 1e-9 / d > 0.95) { N2 = R.pick([100, 200, 300, 400, 500, 600]); d = 1e-3 / N2; dtex = '$d = \\dfrac{1}{' + N2 + '}\\ \\text{mm} = ' + q(d, 'm') + '$.'; }
    var mo = 1; if (ctx.level >= 2 && 2 * lam * 1e-9 / d < 0.9 && R.coin()) mo = 2;
    var sn = mo * lam * 1e-9 / d, th = asind(sn);
    if (s === 'angle') return { q: 'Light of $' + lam + '\\ \\text{nm}$ falls on a grating with $' + N2 + '$ lines per millimeter. At what angle is the ' + (mo === 1 ? 'first' : 'second') + '-order bright line?', a: ans(th, 0.01), unit: '°', viz: { name: 'ph-interference', opts: { mode: 'grating', lambda: lam, lpmm: N2, interactive: false, quiet: true } }, steps: [dtex, '$\\sin\\theta = \\dfrac{' + mo + '\\lambda}{d} = \\dfrac{' + mo + '(' + lam + ' \\times 10^{-9})}{' + tx(d) + '} = ' + tx(sn) + '$.', '$\\theta = ' + deg(th) + '$.'], hint: 'Find d from the lines per millimeter first.' };
    if (s === 'lambda') { var thg = sig(th, 3), lr = d * sind(thg) / mo; return { q: 'A grating with $' + N2 + '$ lines per millimeter shows a ' + (mo === 1 ? 'first' : 'second') + '-order bright line at $' + tg(thg) + '^\\circ$. What is the wavelength, in nanometers?', a: ans(lr * 1e9, 0.01), unit: 'nm', steps: [dtex, '$\\lambda = \\dfrac{d\\sin\\theta}{m} = \\dfrac{(' + tx(d) + ')\\sin ' + tg(thg) + '^\\circ}{' + mo + '}$.', '$\\lambda = ' + q(lr, 'm') + ' = ' + q(lr * 1e9, 'nm') + '$.'], hint: 'Solve d sin θ = mλ for λ.' }; }
    var l1 = R.pick([486, 500, 589]), l2 = l1 + R.pick([70, 100, 150]), N3 = R.pick([300, 400, 500, 600]), d3 = 1e-3 / N3, t1 = asind(l1 * 1e-9 / d3), t2 = asind(l2 * 1e-9 / d3);
    return { q: 'Light containing $' + l1 + '\\ \\text{nm}$ and $' + l2 + '\\ \\text{nm}$ falls on a grating with $' + N3 + '$ lines per millimeter. How far apart, in degrees, are the two first-order lines?', a: ans(t2 - t1, 0.02), unit: '°', steps: ['$d = \\dfrac{1}{' + N3 + '}\\ \\text{mm} = ' + q(d3, 'm') + '$.', '$\\theta_1 = \\sin^{-1}\\dfrac{' + l1 + ' \\times 10^{-9}}{' + tx(d3) + '} = ' + deg(t1, 4) + '$ and $\\theta_2 = ' + deg(t2, 4) + '$.', 'Separation: $' + tx(t2, 4) + '^\\circ - ' + tx(t1, 4) + '^\\circ = ' + deg(t2 - t1) + '$.'], hint: 'Find each angle, then subtract.' };
  });

  G('phys2.thin-films', function (R, ctx) {
    var s = shape(R, ctx, ['soap', 'flips', 'coating'], ['soap', 'coating', 'oil', 'flips', 'soapdark'], ['soap', 'coating', 'oil', 'which', 'coatbright', 'soapdark']);
    var lam = R.pick([400, 420, 450, 480, 500, 520, 540, 550, 560, 580, 600, 620, 630, 650, 680, 700]);
    var cfg = s === 'oil' ? R.pick([[1.45, 'oil', 1.33, 'water'], [1.50, 'oil', 1.33, 'water'], [1.40, 'oil', 1.33, 'water'], [1.42, 'oil', 1.33, 'water'], [1.48, 'oil', 1.33, 'water']]) : s === 'coating' || s === 'coatbright' ? R.pick([[1.38, 'magnesium fluoride', 1.50, 'glass'], [1.38, 'magnesium fluoride', 1.52, 'crown glass'], [1.38, 'magnesium fluoride', 1.60, 'flint glass'], [1.38, 'magnesium fluoride', 1.70, 'dense flint glass']]) : [1.33, 'soap', 1.00, 'air'];
    var nf = cfg[0], nb = cfg[2], flips = (nf > 1.00 ? 1 : 0) + (nb > nf ? 1 : 0), one = flips === 1;
    var fl = ['Top surface: air ($1.00$) to ' + cfg[1] + ' ($' + nf.toFixed(2) + '$), low to high: a half-wave flip.', 'Bottom surface: ' + cfg[1] + ' ($' + nf.toFixed(2) + '$) to ' + cfg[3] + ' ($' + nb.toFixed(2) + '$): ' + (nb > nf ? 'low to high, another flip.' : 'high to low, no flip.'), one ? 'One flip in all, so the two reflected waves start half a wave apart.' : 'Two flips cancel, so the two reflected waves start in step.'];
    if (s === 'flips') {
      var c2 = R.pick([[1.33, 'soap film', 1.00, 'air'], [1.45, 'oil film', 1.33, 'water'], [1.38, 'magnesium fluoride coating', 1.50, 'glass'], [1.80, 'coating', 1.50, 'glass'], [1.33, 'water film', 1.50, 'glass']]), f2 = 1 + (c2[2] > c2[0] ? 1 : 0);
      return { q: 'Light in air reflects from a ' + c2[1] + ' ($n = ' + c2[0].toFixed(2) + '$) lying on ' + c2[3] + ' ($n = ' + c2[2].toFixed(2) + '$). How many half-wave flips happen in total for the light reflected from the top surface and the light reflected from the bottom surface?', a: exact(f2),
        steps: ['A reflection flips the wave when the light goes from a lower index to a higher one.', 'Top: air to film ($1.00 \\to ' + c2[0].toFixed(2) + '$), a flip.', 'Bottom: film to ' + c2[3] + ' ($' + c2[0].toFixed(2) + ' \\to ' + c2[2].toFixed(2) + '$): ' + (c2[2] > c2[0] ? 'a flip.' : 'no flip.'), 'Total: $' + f2 + '$.'], hint: 'Low to high index flips; high to low does not.' };
    }
    if (s === 'which') {
      var t, ms, cand;
      for (var tries = 0; tries < 40; tries++) { t = R.pick([200, 250, 300, 350, 380, 420, 450, 500]); cand = []; for (var m0 = 0; m0 < 6; m0++) { var lv = 4 * 1.33 * t / (2 * m0 + 1); if (lv >= 400 && lv <= 700) cand.push([m0, lv]); } if (cand.length === 1) break; }
      if (cand.length !== 1) { t = 300; cand = [[1, 4 * 1.33 * 300 / 3]]; }
      ms = cand[0];
      return { q: 'A soap film ($n = 1.33$) in air is $' + t + '\\ \\text{nm}$ thick. Which visible wavelength (between $400$ and $700\\ \\text{nm}$) does it reflect most strongly, seen straight on?', a: ans(ms[1], 0.01), unit: 'nm', steps: ['One flip (top surface only), so bright reflection needs $2t = (m + \\frac{1}{2})\\dfrac{\\lambda}{n}$, that is $\\lambda = \\dfrac{2nt}{m + \\frac{1}{2}}$.', '$2nt = 2(1.33)(' + t + ') = ' + tx(2 * 1.33 * t, 4) + '\\ \\text{nm}$.', 'Try $m = 0, 1, 2, \\dots$: only $m = ' + ms[0] + '$ lands in the visible: $\\lambda = \\dfrac{' + tx(2 * 1.33 * t, 4) + '}{' + (ms[0] + 0.5) + '} = ' + q(ms[1], 'nm') + '$.'], hint: 'Solve the bright-reflection condition for λ and try m = 0, 1, 2.' };
    }
    var bright = s === 'soap' || s === 'oil' || s === 'coatbright', tmin;
    // thinnest film (not zero) that gives the asked-for reflection
    if (one) tmin = bright ? lam / (4 * nf) : lam / (2 * nf); else tmin = bright ? lam / (2 * nf) : lam / (4 * nf);
    var desc = s === 'coating' ? 'cancel the reflection of' : s === 'soapdark' ? 'reflect no' : 'strongly reflect';
    var what = s === 'soap' || s === 'soapdark' ? 'A soap film ($n = 1.33$) in air' : s === 'oil' ? 'A thin film of oil ($n = ' + nf.toFixed(2) + '$) floating on water ($n = 1.33$)' : 'A coating of ' + cfg[1] + ' ($n = ' + nf.toFixed(2) + '$) on ' + cfg[3] + ' ($n = ' + nb.toFixed(2) + '$)';
    var cond = one ? (bright ? '$2t = (m + \\frac{1}{2})\\dfrac{\\lambda}{n}$' : '$2t = m\\dfrac{\\lambda}{n}$') : (bright ? '$2t = m\\dfrac{\\lambda}{n}$' : '$2t = (m + \\frac{1}{2})\\dfrac{\\lambda}{n}$');
    var mUse = (one ? bright : !bright) ? 0 : 1;
    return { q: what + ' is meant to ' + desc + ' $' + lam + '\\ \\text{nm}$ light seen straight on. What is the thinnest it can be' + (mUse === 1 ? ' (not counting zero)' : '') + '?', a: ans(tmin, 0.01), unit: 'nm',
      viz: { name: 'ph-interference', opts: { mode: 'thin-film', t: sig(tmin, 3), nFilm: nf, nAbove: 1, nBelow: nb, lambda: lam, interactive: false, quiet: true } },
      steps: fl.concat([(bright ? 'Bright' : 'Dark') + ' reflection then needs ' + cond + '.', 'Thinnest: $m = ' + mUse + '$, so $t = \\dfrac{' + (mUse === 0 ? '\\lambda' : '\\lambda') + '}{' + (mUse === 0 ? 4 : 2) + 'n} = \\dfrac{' + lam + '}{' + (mUse === 0 ? 4 : 2) + '(' + nf.toFixed(2) + ')} = ' + q(tmin, 'nm') + '$.']),
      hint: 'Count the half-wave flips first, and use λ/n inside the film.' };
  });

// =========================================================================================== unit 8: quantum physics and the nucleus
  G('phys2.photons', function (R, ctx) {
    var s = shape(R, ctx, ['eV', 'eV', 'concept'], ['eV', 'J', 'lambda', 'freq', 'rate', 'concept'], ['J', 'lambda', 'rate', 'ratio', 'freq']);
    var lam = R.pick([200, 220, 250, 280, 300, 350, 380, 400, 420, 450, 480, 500, 520, 550, 580, 600, 620, 650, 680, 700, 750, 800, 1000, 1500]), E = HC / lam;
    if (s === 'concept') {
      var it = R.pick([
        ['A dim blue lamp and a bright red lamp shine on a surface. Which statement is right?', 'Each blue photon carries more energy, but the red lamp sends more photons each second', ['The red lamp\'s photons each carry more energy, because it is brighter', 'Both lamps\' photons carry the same energy', 'The blue lamp sends more photons, because blue is more energetic'], 'Photon energy depends only on frequency ($E = hf$), and blue has a higher frequency. Brightness counts photons per second.'],
        ['Which photon carries the most energy?', 'An X-ray photon', ['A radio photon', 'A visible-light photon', 'An infrared photon'], 'Energy rises with frequency, $E = hf$; X-rays have the highest frequency of these.'],
        ['A light source is made twice as bright without changing its color. What happens to the energy of each photon?', 'It stays the same', ['It doubles', 'It halves', 'It increases a little'], 'The color (frequency) sets each photon\'s energy. Twice as bright means twice as many photons per second.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'E = hf for each photon.' };
    }
    if (s === 'eV') return { q: 'Find the energy of one photon of $' + lam + '\\ \\text{nm}$ light, in electron volts.', a: ans(E, 0.01), unit: 'eV', steps: ['$E = \\dfrac{hc}{\\lambda}$ with $hc = 1240\\ \\text{eV·nm}$.', '$E = \\dfrac{1240}{' + lam + '} = ' + q(E, 'eV') + '$.'], hint: 'E (eV) = 1240/λ (nm).' };
    if (s === 'J') return { q: 'Find the energy of one photon of $' + lam + '\\ \\text{nm}$ light, in joules.', a: ans(E * QE, 0.015), unit: 'J', steps: ['$$E = \\frac{hc}{\\lambda} = \\frac{(6.63 \\times 10^{-34})(3.00 \\times 10^{8})}{' + lam + ' \\times 10^{-9}}$$', '$E = ' + q(HP * C / (lam * 1e-9), 'J') + '$ (that is $' + tx(E) + '\\ \\text{eV}$).'], hint: 'Use E = hc/λ with λ in meters.' };
    if (s === 'lambda') { var Eg = R.pick([1.2, 1.5, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.0, 3.5, 4.0, 5.0, 6.0, 10, 50]), lr = HC / Eg; return { q: 'A photon carries $' + tg(Eg) + '\\ \\text{eV}$. What is its wavelength, in nanometers?', a: ans(lr, 0.01), unit: 'nm', steps: ['$\\lambda = \\dfrac{hc}{E} = \\dfrac{1240\\ \\text{eV·nm}}{' + tg(Eg) + '\\ \\text{eV}}$.', '$\\lambda = ' + q(lr, 'nm') + '$' + (lr >= 400 && lr <= 700 ? ', visible light.' : lr < 400 ? ', ultraviolet.' : ', infrared.')], hint: 'λ (nm) = 1240/E (eV).' }; }
    if (s === 'freq') { var Eg2 = R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 6.0, 8.0, 10]), f = Eg2 * QE / HP; return { q: 'A photon has an energy of $' + tg(Eg2) + '\\ \\text{eV}$. What is its frequency?', a: ans(f, 0.015), unit: 'Hz', steps: ['In joules: $E = ' + tg(Eg2) + ' \\times 1.60 \\times 10^{-19} = ' + q(Eg2 * QE, 'J') + '$.', '$f = \\dfrac{E}{h} = \\dfrac{' + tx(Eg2 * QE) + '}{6.63 \\times 10^{-34}} = ' + q(f, 'Hz') + '$.'], hint: 'E = hf, with E in joules.' }; }
    if (s === 'rate') { var P = R.pick([1.0, 2.0, 5.0, 0.50]), lr2 = R.pick([532, 650, 450, 405]), Ej = HP * C / (lr2 * 1e-9), N = P * 1e-3 / Ej; return { q: 'A laser pointer puts out $' + tg(P) + '\\ \\text{mW}$ of light at $' + lr2 + '\\ \\text{nm}$. How many photons does it emit each second?', a: ans(N, 0.015), unit: 'photons/s', steps: ['One photon: $$E = \\frac{hc}{\\lambda} = \\frac{(6.63 \\times 10^{-34})(3.00 \\times 10^{8})}{' + lr2 + ' \\times 10^{-9}} = ' + q(Ej, 'J') + '$$', 'Photons per second: $$N = \\frac{P}{E} = \\frac{' + tg(P * 1e-3) + '}{' + tx(Ej) + '} = ' + tx(N) + '$$'], hint: 'Divide the power (J/s) by the energy of one photon.' }; }
    var l1 = R.pick([400, 450, 500]), l2 = R.pick([600, 700, 800, 1000]);
    return { q: 'How many times more energy does a $' + l1 + '\\ \\text{nm}$ photon carry than a $' + l2 + '\\ \\text{nm}$ photon?', a: ans(l2 / l1, 0.01), steps: ['$E = hc/\\lambda$, so energy is inversely proportional to wavelength.', '$\\dfrac{E_1}{E_2} = \\dfrac{\\lambda_2}{\\lambda_1} = \\dfrac{' + l2 + '}{' + l1 + '} = ' + tx(l2 / l1) + '$.'], hint: 'Shorter wavelength, more energy.' };
  });

  var METALS = [['cesium', 2.14], ['potassium', 2.29], ['sodium', 2.36], ['calcium', 2.87], ['zinc', 4.3], ['copper', 4.7]];
  G('phys2.photoelectric-effect', function (R, ctx) {
    var s = shape(R, ctx, ['K', 'K', 'concept'], ['K', 'V', 'thresh', 'none', 'concept'], ['phi', 'speed', 'thresh', 'V', 'none', 'f0']);
    var m = R.pick(METALS), phi = m[1], lam, E;
    do { lam = R.pick(phi > 4 ? [150, 180, 200, 220, 250] : [250, 300, 350, 400, 450]); E = HC / lam; } while (E - phi < 0.2);
    var K = E - phi, mtx = m[0] + ' ($\\phi = ' + tg(phi) + '\\ \\text{eV}$)';
    if (s === 'concept') {
      var it = R.pick([
        ['Light just above the threshold frequency shines on a metal. The light is made twice as bright, with the same color. What happens?', 'Twice as many electrons come out, with the same maximum kinetic energy', ['The same number of electrons come out, with twice the kinetic energy', 'Twice as many electrons come out, each with twice the energy', 'Nothing changes'], 'Brighter light means more photons, so more electrons. Each electron still gets one photon\'s energy $hf$, so $K_{\\max} = hf - \\phi$ is unchanged.'],
        ['Very dim light with a frequency above the threshold shines on a metal. When do electrons start to come out?', 'Right away (just a few of them)', ['Only after enough energy has built up', 'Never: dim light cannot free electrons', 'Only after the metal warms up'], 'Each photon delivers its energy to one electron at once, so there is no waiting; dim light just frees fewer electrons per second.'],
        ['Bright red light frees no electrons from a metal, but dim ultraviolet light does. Why?', 'Each ultraviolet photon has more energy than the work function; each red photon has less', ['Ultraviolet light is brighter than it looks', 'Red light is absorbed before it reaches the metal', 'The red light needs more time'], 'An electron absorbs one photon. Only photons with $hf > \\phi$ can free it, however many photons arrive.'],
        ['A graph of $K_{\\max}$ against the frequency of the light is a straight line. What is its slope?', 'Planck\'s constant $h$, the same for every metal', ['The work function, different for each metal', 'The speed of light', 'The charge of the electron'], '$K_{\\max} = hf - \\phi$ is a line with slope $h$ and intercept $-\\phi$.']
      ]);
      return { q: it[0], a: mc(it[1], it[2]), viz: { name: 'ph-photon', opts: { mode: 'photoelectric', metal: 'sodium', lambda: 400, interactive: false, quiet: true } }, steps: [it[3]], hint: 'One photon, one electron.' };
    }
    if (s === 'K') return { q: 'Light of $' + lam + '\\ \\text{nm}$ falls on ' + mtx + '. What is the maximum kinetic energy of the electrons that come out, in eV?', a: ans(K, 0.02), unit: 'eV', steps: ['Photon energy: $E = \\dfrac{1240}{' + lam + '} = ' + q(E, 'eV') + '$.', '$K_{\\max} = E - \\phi = ' + tx(E) + ' - ' + tg(phi) + ' = ' + q(K, 'eV') + '$.'], hint: 'K_max = hf − φ.' };
    if (s === 'V') return { q: 'Light of $' + lam + '\\ \\text{nm}$ falls on ' + mtx + '. What stopping voltage turns back even the fastest electrons?', a: ans(K, 0.02), unit: 'V', steps: ['$E = \\dfrac{1240}{' + lam + '} = ' + q(E, 'eV') + '$, so $K_{\\max} = ' + tx(E) + ' - ' + tg(phi) + ' = ' + q(K, 'eV') + '$.', 'An electron crossing $V_s$ loses $eV_s$, so $V_s = ' + q(K, 'V') + '$ (the same number as $K_{\\max}$ in eV).'], hint: 'eV_s = K_max.' };
    if (s === 'thresh') return { q: 'What is the longest wavelength of light that can free electrons from ' + mtx + '?', a: ans(HC / phi, 0.01), unit: 'nm', steps: ['At the threshold the photon\'s whole energy just covers the work function: $\\dfrac{hc}{\\lambda_0} = \\phi$.', '$\\lambda_0 = \\dfrac{1240}{' + tg(phi) + '} = ' + q(HC / phi, 'nm') + '$. Longer wavelengths free no electrons, however bright.'], hint: 'Set the photon energy equal to φ.' };
    if (s === 'f0') { var f0 = phi * QE / HP; return { q: 'What is the threshold frequency for ' + mtx + '?', a: ans(f0, 0.015), unit: 'Hz', steps: ['$hf_0 = \\phi$, with $\\phi = ' + tg(phi) + ' \\times 1.60 \\times 10^{-19} = ' + q(phi * QE, 'J') + '$.', '$f_0 = \\dfrac{\\phi}{h} = \\dfrac{' + tx(phi * QE) + '}{6.63 \\times 10^{-34}} = ' + q(f0, 'Hz') + '$.'], hint: 'f₀ = φ/h, with φ in joules.' }; }
    if (s === 'none') { var lamL = M.round(HC / phi * R.pick([1.15, 1.3, 1.5]) / 10) * 10, yes = R.coin(), lamU = yes ? lam : lamL, Eu = HC / lamU; return { q: 'Bright light of $' + lamU + '\\ \\text{nm}$ shines on ' + mtx + '. Are any electrons freed?', a: mc(Eu > phi ? 'Yes: each photon has more energy than the work function' : 'No: each photon has less energy than the work function', [Eu > phi ? 'No: each photon has less energy than the work function' : 'Yes: each photon has more energy than the work function', 'Yes, because the light is bright', 'Only after the light has shone for a while']), steps: ['Photon energy: $E = \\dfrac{1240}{' + lamU + '} = ' + q(Eu, 'eV') + '$.', Eu > phi ? '$' + tx(Eu) + ' > ' + tg(phi) + '$: electrons come out at once.' : '$' + tx(Eu) + ' < ' + tg(phi) + '$: no single photon can free an electron, so none come out, however bright the light.'], hint: 'Compare one photon\'s energy with φ.' }; }
    if (s === 'phi') { var Vs = sig(K, 2), phiR = E - Vs; return { q: 'Light of $' + lam + '\\ \\text{nm}$ frees electrons from a metal, and a stopping voltage of $' + tg(Vs) + '\\ \\text{V}$ stops them all. What is the metal\'s work function, in eV?', a: ans(phiR, 0.02), unit: 'eV', steps: ['$E = \\dfrac{1240}{' + lam + '} = ' + q(E, 'eV') + '$; $K_{\\max} = eV_s = ' + tg(Vs) + '\\ \\text{eV}$.', '$\\phi = E - K_{\\max} = ' + tx(E) + ' - ' + tg(Vs) + ' = ' + q(phiR, 'eV') + '$.'], hint: 'φ = hf − K_max.' }; }
    var v = M.sqrt(2 * K * QE / ME);
    return { q: 'Light of $' + lam + '\\ \\text{nm}$ falls on ' + mtx + '. How fast do the fastest electrons leave the metal?', a: ans(v, 0.02), unit: 'm/s', steps: ['$K_{\\max} = \\dfrac{1240}{' + lam + '} - ' + tg(phi) + ' = ' + q(K, 'eV') + ' = ' + q(K * QE, 'J') + '$.', '$$v = \\sqrt{\\frac{2K}{m}} = \\sqrt{\\frac{2(' + tx(K * QE) + ')}{9.11 \\times 10^{-31}}} = ' + q(v, 'm/s') + '$$'], hint: 'Find K_max in joules, then use K = ½mv².' };
  });

  function En(n) { return -13.6 / (n * n); }
  G('phys2.bohr-model', function (R, ctx) {
    var s = shape(R, ctx, ['level', 'photon', 'lines', 'lambda', 'ion'], ['photon', 'lambda', 'lines', 'ion', 'absorb', 'generic'], ['lambda', 'generic', 'absorb', 'ion', 'series', 'lines']);
    var nu = R.int(2, 6), nl = R.int(1, nu - 1), dE = En(nu) - En(nl);
    if (s === 'level') { var n = R.int(1, 5); return { q: 'What is the energy of hydrogen\'s level $n = ' + n + '$, in eV?', a: ans(En(n), 0.01), unit: 'eV', steps: ['$E_n = -\\dfrac{13.6\\ \\text{eV}}{n^{2}}$.', '$E_' + n + ' = -\\dfrac{13.6}{' + n * n + '} = ' + q(En(n), 'eV') + '$.'], hint: 'E_n = −13.6 eV/n².' }; }
    if (s === 'photon' || s === 'lambda') {
      var st = ['$E_' + nu + ' = -\\dfrac{13.6}{' + nu * nu + '} = ' + q(En(nu), 'eV', 3) + '$ and $E_' + nl + ' = ' + q(En(nl), 'eV', 3) + '$.', '$E_{\\text{photon}} = E_' + nu + ' - E_' + nl + ' = ' + q(dE, 'eV') + '$.'];
      if (s === 'photon') return { q: 'A hydrogen atom jumps from $n = ' + nu + '$ to $n = ' + nl + '$. What energy does the emitted photon carry, in eV?', a: ans(dE, 0.01), unit: 'eV', viz: { name: 'ph-spectrum', opts: { mode: 'levels', transitions: [[nu, nl]], interactive: false, quiet: true } }, steps: st, hint: 'Upper level minus lower level.' };
      var lr = HC / dE;
      return { q: 'A hydrogen atom jumps from $n = ' + nu + '$ to $n = ' + nl + '$. What is the wavelength of the emitted light, in nanometers?', a: ans(lr, 0.01), unit: 'nm', steps: st.concat(['$\\lambda = \\dfrac{1240}{' + tx(dE) + '} = ' + q(lr, 'nm') + '$' + (lr >= 400 && lr <= 700 ? ', visible.' : lr < 400 ? ', ultraviolet.' : ', infrared.')]), hint: 'Find the energy difference, then λ = 1240/E.' };
    }
    if (s === 'lines') { var nn = R.int(3, 6); return { q: 'Hydrogen atoms are excited to the level $n = ' + nn + '$. As they drop back down, by every possible route, how many different wavelengths of light can they emit?', a: exact(nn * (nn - 1) / 2), steps: ['Any jump from a higher level to a lower one makes a line, not only jumps to $n = 1$.', 'Count the pairs of levels among the ' + nn + ' levels: $\\dfrac{' + nn + ' \\times ' + (nn - 1) + '}{2} = ' + nn * (nn - 1) / 2 + '$.'], hint: 'Count every pair of levels from 1 to ' + nn + '.' }; }
    if (s === 'ion') { var ni = R.int(1, 4); return { q: 'How much energy does it take to ionize a hydrogen atom whose electron is in the level $n = ' + ni + '$?', a: ans(13.6 / (ni * ni), 0.01), unit: 'eV', steps: ['Freeing the electron means raising it to $E = 0$.', '$E_' + ni + ' = -\\dfrac{13.6}{' + ni * ni + '} = ' + q(En(ni), 'eV', 3) + '$, so it takes $' + q(13.6 / (ni * ni), 'eV') + '$.'], hint: 'From E_n up to zero.' }; }
    if (s === 'absorb') {
      var fits = R.pick([[2, '10.2'], [3, '12.09'], [4, '12.75']]), wrong = R.pick([5.0, 8.0, 11.0, 11.5, 12.4]), fs = fits[1];
      return { q: 'Hydrogen atoms in their ground state ($n = 1$) are struck by photons of ' + (R.coin() ? '$' + fs + '\\ \\text{eV}$ and $' + tg(wrong) + '\\ \\text{eV}$' : '$' + tg(wrong) + '\\ \\text{eV}$ and $' + fs + '\\ \\text{eV}$') + '. Which photons can be absorbed?', a: mc('Only the $' + fs + '\\ \\text{eV}$ photons', ['Only the $' + tg(wrong) + '\\ \\text{eV}$ photons', 'Both', 'Neither']),
        steps: ['From $n = 1$ the allowed jumps need exactly $E_n - E_1$: $10.2$, $12.1$, $12.75\\ \\text{eV}$, … (or $13.6\\ \\text{eV}$ or more to ionize).', '$' + fs + '\\ \\text{eV}$ matches the jump to $n = ' + fits[0] + '$; $' + tg(wrong) + '\\ \\text{eV}$ matches no jump and is too small to ionize, so it passes by.'], hint: 'An atom takes a whole photon only if it fits a jump exactly.' };
    }
    if (s === 'series') { var to = R.pick([1, 2, 3]); return { q: 'Hydrogen emits a line when its electron drops to $n = ' + to + '$ from a higher level. In which part of the spectrum do these lines fall?', a: mc(to === 1 ? 'Ultraviolet' : to === 2 ? 'Visible (and near ultraviolet)' : 'Infrared', ['Ultraviolet', 'Visible (and near ultraviolet)', 'Infrared', 'Radio'].filter(function (x) { return x !== (to === 1 ? 'Ultraviolet' : to === 2 ? 'Visible (and near ultraviolet)' : 'Infrared'); })),
      steps: ['Smallest jump in this series: from $n = ' + (to + 1) + '$: $' + q(En(to + 1) - En(to), 'eV') + '$, $\\lambda = ' + q(HC / (En(to + 1) - En(to)), 'nm') + '$.', 'Largest: from very high $n$: $' + q(13.6 / (to * to), 'eV') + '$, $\\lambda = ' + q(HC / (13.6 / (to * to)), 'nm') + '$.', to === 1 ? 'All shorter than 400 nm: ultraviolet (the Lyman series).' : to === 2 ? 'From 656 nm down to 365 nm: visible, ending in the near ultraviolet (the Balmer series).' : 'All longer than 700 nm: infrared (the Paschen series).'], hint: 'Find the smallest and largest photon energies in the series.' }; }
    // generic atom
    var lv = R.pick([[-10.0, -6.0, -4.0, -1.0], [-8.0, -5.0, -3.0, -2.0], [-12.0, -7.0, -4.5, -2.0], [-9.0, -4.0, -2.5, -1.5]]), a = R.int(1, 3), b = R.int(0, a - 1), dE2 = lv[a] - lv[b], lr2 = HC / dE2;
    return { q: 'A made-up atom has energy levels at $' + lv.map(tg).join('$, $') + '\\ \\text{eV}$. An electron drops from the $' + tg(lv[a]) + '\\ \\text{eV}$ level to the $' + tg(lv[b]) + '\\ \\text{eV}$ level. What is the wavelength of the emitted photon, in nanometers?', a: ans(lr2, 0.01), unit: 'nm',
      viz: { name: 'ph-spectrum', opts: { mode: 'levels', levels: lv, transitions: [[a + 1, b + 1]], interactive: false, quiet: true } },
      steps: ['$E_{\\text{photon}} = ' + tg(lv[a]) + ' - (' + tg(lv[b]) + ') = ' + tg(sig(dE2, 6)) + '\\ \\text{eV}$.', '$\\lambda = \\dfrac{1240}{' + tg(sig(dE2, 6)) + '} = ' + q(lr2, 'nm') + '$.'], hint: 'Upper minus lower, then λ = 1240/E.' };
  });

  G('phys2.spectra', function (R, ctx) {
    var s = shape(R, ctx, ['type', 'type', 'match'], ['type', 'match', 'count', 'energy'], ['count', 'absorb', 'energy', 'match']);
    if (s === 'type') {
      var sc = R.pick([['the glowing filament of an incandescent bulb', 'Continuous'], ['a tube of hot, thin neon gas', 'Emission lines'], ['sunlight, through the Sun\'s cooler outer layers', 'Absorption lines'], ['a hot, thin cloud of hydrogen in space, seen against dark sky', 'Emission lines'], ['light from a hot lamp after passing through cool sodium vapor', 'Absorption lines'], ['red-hot iron in a forge', 'Continuous']]);
      return { q: 'What kind of spectrum do you see from ' + sc[0] + '?', a: mc(sc[1], ['Continuous', 'Emission lines', 'Absorption lines', 'No spectrum at all'].filter(function (x) { return x !== sc[1]; })), steps: ['Hot, dense matter gives a continuous spectrum; a hot, thin gas gives bright emission lines; a cooler, thin gas in front of a hotter continuous source gives dark absorption lines.', 'Here: ' + sc[1].toLowerCase() + '.'], hint: 'Is it dense or thin? Is there a hotter source behind it?' };
    }
    if (s === 'match') {
      var el = R.pick([['hydrogen', [410, 434, 486, 656]], ['sodium', [589, 590]], ['helium', [447, 502, 588, 668]], ['mercury', [405, 436, 546, 577]]]), lines = el[1].join(', ') + ' nm';
      return { q: 'Hot ' + el[0] + ' gas glows with bright lines at ' + lines + '. A cooler layer of ' + el[0] + ' gas lies in front of a star. Where can dark absorption lines from it appear?', a: mc('At the same wavelengths: ' + lines, ['At different wavelengths, between the bright lines', 'Everywhere except ' + lines, 'Nowhere: a gas cannot absorb light it emits']), steps: ['Absorption and emission use the same pairs of energy levels.', 'So a gas absorbs at exactly the wavelengths it emits (which of them show up depends on which levels its atoms sit in).'], hint: 'The same energy jumps go both ways.' };
    }
    var lv = R.pick([[-10.0, -6.0, -4.0], [-8.0, -5.0, -2.5, -1.5], [-11.0, -6.0, -3.5, -2.0], [-9.0, -4.0, -2.5, -1.5], [-6.0, -3.0, -1.0]]), k = lv.length;
    if (s === 'count') return { q: 'An atom has ' + k + ' energy levels: $' + lv.map(tg).join('$, $') + '\\ \\text{eV}$. How many different photon energies can it emit as its electrons drop between these levels?', a: exact(k * (k - 1) / 2), viz: { name: 'ph-spectrum', opts: { mode: 'levels', levels: lv, transitions: [], interactive: false, quiet: true } }, steps: ['Every downward jump between two of the levels is a different line (these levels have no equal gaps).', 'Pairs of ' + k + ' levels: $\\dfrac{' + k + ' \\times ' + (k - 1) + '}{2} = ' + k * (k - 1) / 2 + '$.'], hint: 'Count every pair of levels.' };
    if (s === 'absorb') return { q: 'A cool gas of atoms with energy levels $' + lv.map(tg).join('$, $') + '\\ \\text{eV}$ has all its atoms in the lowest level. How many dark lines does it make in a continuous spectrum shining through it?', a: exact(k - 1), steps: ['Atoms in the lowest level can only absorb jumps that start there.', 'There is one such jump to each higher level: $' + (k - 1) + '$ lines. Jumps between upper levels need atoms already excited.'], hint: 'Absorption starts from the level the atoms are in.' };
    var pairs = []; for (var i = 1; i < k; i++) for (var j = 0; j < i; j++) pairs.push(lv[i] - lv[j]); var big = R.coin(), pick = big ? M.max.apply(null, pairs) : M.min.apply(null, pairs);
    return { q: 'An atom has energy levels at $' + lv.map(tg).join('$, $') + '\\ \\text{eV}$. What is the ' + (big ? 'shortest' : 'longest') + ' wavelength it can emit, in nanometers?', a: ans(HC / pick, 0.01), unit: 'nm', steps: [big ? 'Shortest wavelength means the largest photon energy: the jump from the top level to the bottom one, $' + tg(sig(pick, 6)) + '\\ \\text{eV}$.' : 'Longest wavelength means the smallest photon energy: the smallest gap between neighboring levels, $' + tg(sig(pick, 6)) + '\\ \\text{eV}$.', '$\\lambda = \\dfrac{1240}{' + tg(sig(pick, 6)) + '} = ' + q(HC / pick, 'nm') + '$.'], hint: big ? 'Largest energy gap, shortest wavelength.' : 'Smallest energy gap, longest wavelength.' };
  });

  G('phys2.matter-waves', function (R, ctx) {
    var s = shape(R, ctx, ['electron', 'electron', 'concept'], ['electron', 'proton', 'speed', 'voltage', 'ball', 'concept'], ['voltage', 'speed', 'ratio', 'ball', 'proton']);
    if (s === 'concept') { var it = R.pick([['Electrons fired one at a time through two slits land as single dots. After many have arrived, what do the dots show?', 'An interference pattern of bright and dark bands', ['Two bright stripes, one behind each slit', 'An even spread with no pattern', 'One bright spot in the middle only'], 'Each electron arrives as a particle, but where it lands follows a wave pattern with $\\lambda = h/p$.'], ['Why does a thrown baseball not show wave behavior?', 'Its wavelength is far too small compared with anything it passes through', ['Only charged particles have wavelengths', 'It is moving too slowly to have a wavelength', 'Large objects have no momentum'], '$\\lambda = h/(mv)$ is about $10^{-34}\\ \\text{m}$ for a baseball, far smaller than any gap.']]); return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'λ = h/p.' }; }
    if (s === 'electron' || s === 'proton') { var pe = s === 'electron', m = pe ? ME : MP, v = sci(R, [1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0, 7.5, 8.0], pe ? R.int(5, 6) : R.int(3, 4)), lam = HP / (m * v); return { q: 'Find the de Broglie wavelength of ' + (pe ? 'an electron' : 'a proton') + ' moving at $' + tg(v) + '\\ \\text{m/s}$.', a: ans(lam, 0.015), unit: 'm', steps: ['$p = mv = (' + (pe ? '9.11 \\times 10^{-31}' : '1.67 \\times 10^{-27}') + ')(' + tg(v) + ') = ' + q(m * v, 'kg·m/s') + '$.', '$\\lambda = \\dfrac{h}{p} = \\dfrac{6.63 \\times 10^{-34}}{' + tx(m * v) + '} = ' + q(lam, 'm') + '$.'], hint: 'λ = h/(mv).' }; }
    if (s === 'speed') { var lt = R.pick([0.050, 0.10, 0.15, 0.20, 0.25, 0.40, 0.50, 0.80, 1.0, 2.0]), vv = HP / (ME * lt * 1e-9); return { q: 'How fast must an electron move to have a wavelength of $' + tg(lt) + '\\ \\text{nm}$?', a: ans(vv, 0.015), unit: 'm/s', steps: ['$\\lambda = \\dfrac{h}{mv}$, so $v = \\dfrac{h}{m\\lambda}$.', '$$v = \\frac{6.63 \\times 10^{-34}}{(9.11 \\times 10^{-31})(' + tg(lt * 1e-9) + ')} = ' + q(vv, 'm/s') + '$$'], hint: 'Solve λ = h/(mv) for v.' }; }
    if (s === 'voltage') { var V = R.pick([10, 20, 25, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 1000]), K = QE * V, p = M.sqrt(2 * ME * K), l2 = HP / p; return { q: 'An electron is accelerated from rest through $' + V + '\\ \\text{V}$. What is its de Broglie wavelength?', a: ans(l2, 0.015), unit: 'm', steps: ['$K = eV = (1.60 \\times 10^{-19})(' + V + ') = ' + q(K, 'J') + '$.', '$$\\begin{aligned} p &= \\sqrt{2mK} \\\\ &= \\sqrt{2(9.11 \\times 10^{-31})(' + tx(K) + ')} \\\\ &= ' + q(p, 'kg·m/s') + ' \\end{aligned}$$', '$\\lambda = \\dfrac{h}{p} = ' + q(l2, 'm') + '$.'], hint: 'Find the momentum from K = p²/(2m).' }; }
    if (s === 'ball') { var b = R.pick([['a $0.145\\ \\text{kg}$ baseball', 0.145, [30, 40]], ['a $0.057\\ \\text{kg}$ tennis ball', 0.057, [20, 50]], ['a $70\\ \\text{kg}$ runner', 70, [5, 8]]]), vb = R.pick(b[2]), lb = HP / (b[1] * vb); return { q: 'Find the de Broglie wavelength of ' + b[0] + ' moving at $' + vb + '\\ \\text{m/s}$.', a: ans(lb, 0.015), unit: 'm', steps: ['$\\lambda = \\dfrac{h}{mv} = \\dfrac{6.63 \\times 10^{-34}}{(' + tg(b[1]) + ')(' + vb + ')} = ' + q(lb, 'm') + '$.', 'Far smaller than a proton, which is why everyday objects never show wave behavior.'], hint: 'λ = h/(mv).' }; }
    var same = R.coin();
    return { q: 'An electron and a proton have the same ' + (same ? 'speed' : 'kinetic energy') + '. How many times longer is the electron\'s de Broglie wavelength? (Masses: $9.11 \\times 10^{-31}$ and $1.67 \\times 10^{-27}\\ \\text{kg}$.)', a: ans(same ? MP / ME : M.sqrt(MP / ME), 0.01), steps: same ? ['$\\lambda = \\dfrac{h}{mv}$: with the same $v$, $\\lambda$ is inversely proportional to $m$.', '$\\dfrac{\\lambda_e}{\\lambda_p} = \\dfrac{m_p}{m_e} = ' + tx(MP / ME) + '$.'] : ['Same $K$: $p = \\sqrt{2mK}$, so $p \\propto \\sqrt{m}$ and $\\lambda \\propto \\dfrac{1}{\\sqrt{m}}$.', '$\\dfrac{\\lambda_e}{\\lambda_p} = \\sqrt{\\dfrac{m_p}{m_e}} = \\sqrt{' + tx(MP / ME) + '} = ' + tx(M.sqrt(MP / ME)) + '$.'], hint: same ? 'λ = h/(mv).' : 'p = √(2mK).' };
  });

  G('phys2.compton-scattering', function (R, ctx) {
    var s = shape(R, ctx, ['shift', 'final', 'concept'], ['shift', 'final', 'p', 'concept', 'angle'], ['final', 'angle', 'K', 'p', 'pE']);
    var th = R.pick([30, 45, 60, 90, 120, 135, 150, 180]), dl = 2.43 * (1 - cosd(th)), l0 = R.pick([10.0, 20.0, 50.0, 71.0, 100]);
    var st = ['$\\Delta\\lambda = \\dfrac{h}{m_e c}(1 - \\cos\\theta) = 2.43(1 - \\cos ' + th + '^\\circ)\\ \\text{pm}$.', '$\\cos ' + th + '^\\circ = ' + tx(cosd(th) + 0, 3).replace(/^-?0\.000$/, '0') + '$, so $\\Delta\\lambda = ' + q(dl, 'pm') + '$.'];
    if (th === 90) st[1] = '$\\cos 90^\\circ = 0$, so $\\Delta\\lambda = 2.43\\ \\text{pm}$.';
    if (s === 'concept') { var it = R.pick([['After an X-ray photon scatters off an electron, how does it differ from before?', 'Its wavelength is longer; its speed is still c', ['It moves more slowly than c', 'Its wavelength is shorter', 'Its frequency is higher'], 'The electron recoils with some energy, so the photon has less: lower frequency, longer wavelength. Every photon moves at $c$.'], ['At what scattering angle is the Compton shift largest?', '$180^\\circ$ (straight back)', ['$0^\\circ$ (straight ahead)', '$90^\\circ$', '$45^\\circ$'], '$1 - \\cos\\theta$ is largest, 2, at $180^\\circ$, giving $\\Delta\\lambda = 4.86\\ \\text{pm}$.'], ['What does Compton scattering show about photons?', 'They carry momentum, $p = h/\\lambda$', ['They have mass', 'They slow down in collisions', 'They carry no energy'], 'The photon and electron share momentum and energy like colliding particles.']]); return { q: it[0], a: mc(it[1], it[2]), steps: [it[3]], hint: 'Energy and momentum are shared in the collision.' }; }
    if (s === 'shift') return { q: 'An X-ray photon scatters off a free electron at $' + th + '^\\circ$. By how much does its wavelength increase, in picometers?', a: ans(dl, 0.01), unit: 'pm', viz: { name: 'ph-photon', opts: { mode: 'compton', lambda0: l0, theta: th, interactive: false, quiet: true } }, steps: st, hint: 'Δλ = 2.43 pm × (1 − cos θ).' };
    if (s === 'final') return { q: 'X-rays of wavelength $' + tg(l0) + '\\ \\text{pm}$ scatter off free electrons at $' + th + '^\\circ$. What is the scattered wavelength, in picometers?', a: ans(l0 + dl, 0.005), unit: 'pm', steps: st.concat(['$\\lambda\' = ' + tg(l0) + ' + ' + tx(dl) + ' = ' + q(l0 + dl, 'pm', 4) + '$.']), hint: 'Add the Compton shift.' };
    if (s === 'angle') { var dlg = R.pick([0.50, 1.00, 1.22, 2.43, 3.00, 3.65, 4.00]), cth = 1 - dlg / 2.43, tha = acosd(cth); return { q: 'X-rays scattered off free electrons come out $' + tg(dlg) + '\\ \\text{pm}$ longer in wavelength. At what angle were they scattered?', a: ans(tha, 0.01), unit: '°', steps: ['$' + tg(dlg) + ' = 2.43(1 - \\cos\\theta)$, so $\\cos\\theta = 1 - \\dfrac{' + tg(dlg) + '}{2.43} = ' + tx(cth) + '$.', '$\\theta = \\cos^{-1}(' + tx(cth) + ') = ' + deg(tha) + '$.'], hint: 'Solve the Compton formula for cos θ.' }; }
    if (s === 'p' || s === 'pE') { var lp = s === 'p' ? R.pick([400, 500, 600, 700]) : null, Ep = s === 'pE' ? R.pick([10, 20, 50, 100]) : null; if (s === 'p') return { q: 'What is the momentum of one photon of $' + lp + '\\ \\text{nm}$ light?', a: ans(HP / (lp * 1e-9), 0.015), unit: 'kg·m/s', steps: ['$p = \\dfrac{h}{\\lambda} = \\dfrac{6.63 \\times 10^{-34}}{' + lp + ' \\times 10^{-9}}$.', '$p = ' + q(HP / (lp * 1e-9), 'kg·m/s') + '$.'], hint: 'p = h/λ.' }; var Ej = Ep * 1e3 * QE; return { q: 'An X-ray photon carries $' + Ep + '\\ \\text{keV}$. What is its momentum?', a: ans(Ej / C, 0.015), unit: 'kg·m/s', steps: ['$E = ' + Ep + ' \\times 10^{3} \\times 1.60 \\times 10^{-19} = ' + q(Ej, 'J') + '$.', '$p = \\dfrac{E}{c} = \\dfrac{' + tx(Ej) + '}{3.00 \\times 10^{8}} = ' + q(Ej / C, 'kg·m/s') + '$.'], hint: 'For a photon, p = E/c.' }; }
    var E0 = 1.24e6 / l0, E1 = 1.24e6 / (l0 + dl), Ke = E0 - E1;
    return { q: 'X-rays of $' + tg(l0) + '\\ \\text{pm}$ scatter off a free electron at rest at $' + th + '^\\circ$. How much kinetic energy does the electron gain, in eV? (Use $hc = 1.24 \\times 10^{6}\\ \\text{eV·pm}$.)', a: ans(Ke, 0.03), unit: 'eV', steps: st.concat(['$\\lambda\' = ' + q(l0 + dl, 'pm', 4) + '$.', 'Before: $E = \\dfrac{1.24 \\times 10^{6}}{' + tg(l0) + '} = ' + q(E0, 'eV', 4) + '$. After: $E\' = ' + q(E1, 'eV', 4) + '$.', 'The electron gets the difference: $' + q(Ke, 'eV') + '$.']), hint: 'Energy lost by the photon = energy gained by the electron.' };
  });

  var NUC = [['deuterium', '^{2}\\text{H}', 1, 1, 2.014102], ['tritium', '^{3}\\text{H}', 1, 2, 3.016049], ['helium-3', '^{3}\\text{He}', 2, 1, 3.016029], ['helium-4', '^{4}\\text{He}', 2, 2, 4.002603], ['lithium-6', '^{6}\\text{Li}', 3, 3, 6.015123], ['lithium-7', '^{7}\\text{Li}', 3, 4, 7.016003], ['carbon-12', '^{12}\\text{C}', 6, 6, 12.000000], ['nitrogen-14', '^{14}\\text{N}', 7, 7, 14.003074], ['oxygen-16', '^{16}\\text{O}', 8, 8, 15.994915], ['iron-56', '^{56}\\text{Fe}', 26, 30, 55.934936]];
  var MH = 1.007825, MNU = 1.008665, UMEV = 931.5;
  G('phys2.mass-energy', function (R, ctx) {
    var s = shape(R, ctx, ['E', 'mev', 'concept'], ['E', 'mev', 'binding', 'Q', 'concept', 'mfromE', 'fuel'], ['binding', 'perNucleon', 'Q', 'sun', 'mfromE', 'fuel']);
    if (s === 'concept') { var it = R.pick([['How does the mass of a helium-4 nucleus compare with the total mass of 2 separate protons and 2 separate neutrons?', 'It is less', ['It is more, because it holds the binding energy', 'It is exactly the same', 'It depends on the temperature'], 'Energy is released when the nucleus forms, so the nucleus has less energy, and so less mass ($E = mc^{2}$), than its separate parts.'], ['Which nuclei are the most tightly bound (largest binding energy per nucleon)?', 'Nuclei near iron and nickel', ['The lightest nuclei, like hydrogen', 'The heaviest nuclei, like uranium', 'All nuclei are bound equally tightly'], 'Binding energy per nucleon peaks near iron-56 (about $8.8\\ \\text{MeV}$). Fusing lighter nuclei or splitting heavier ones moves toward the peak and releases energy.']]); return { q: it[0], a: mc(it[1], it[2]), viz: { name: 'ph-nucleus', opts: { mode: 'binding', interactive: false, quiet: true } }, steps: [it[3]], hint: 'E = mc²: less energy means less mass.' }; }
    if (s === 'E') { var mq = R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 8.0]), mu = R.pick([['mg', 1e-6], ['g', 1e-3], ['kg', 1]]), mm = ['$' + tg(mq) + '\\ \\text{' + mu[0] + '}$', sig(mq * mu[1], 6)]; return { q: 'How much energy is equivalent to ' + mm[0] + ' of mass?', a: ans(mm[1] * C * C, 0.01), unit: 'J', steps: ['$E = mc^{2} = (' + tg(mm[1]) + ')(3.00 \\times 10^{8})^{2}$.', '$E = ' + q(mm[1] * C * C, 'J') + '$.'], hint: 'E = mc² with m in kilograms.' }; }
    if (s === 'mev') { var dm = R.pick([0.00100, 0.00239, 0.00350, 0.00433, 0.00911, 0.0100, 0.0189, 0.0197, 0.0250, 0.0304, 0.0500, 0.100, 0.186, 0.215]); return { q: 'In a nuclear reaction, $' + tg(dm) + '\\ \\text{u}$ of mass disappears. How much energy is released, in MeV? ($1\\ \\text{u} = 931.5\\ \\text{MeV}/c^{2}$.)', a: ans(dm * UMEV, 0.01), unit: 'MeV', steps: ['Each atomic mass unit of mass is $931.5\\ \\text{MeV}$ of energy.', '$E = (' + tg(dm) + ')(931.5) = ' + q(dm * UMEV, 'MeV') + '$.'], hint: 'Multiply by 931.5 MeV per u.' }; }
    if (s === 'mfromE') { var Em = R.pick([2.2, 3.3, 4.0, 5.5, 8.5, 12.9, 17.6, 18.4, 28.3, 92.2, 200]); return { q: 'A nuclear reaction releases $' + tg(Em) + '\\ \\text{MeV}$. How much mass, in atomic mass units, disappears?', a: ans(Em / UMEV, 0.01), unit: 'u', steps: ['$1\\ \\text{u}$ of mass is $931.5\\ \\text{MeV}$ of energy.', '$\\Delta m = \\dfrac{' + tg(Em) + '}{931.5} = ' + q(Em / UMEV, 'u') + '$.'], hint: 'Divide by 931.5 MeV per u.' }; }
    if (s === 'fuel') { var Ef = sig(R.pick([1.0, 2.0, 3.0, 4.5, 6.0, 9.0]) * M.pow(10, R.int(13, 16)), 6); return { q: 'A power plant releases $' + tg(Ef) + '\\ \\text{J}$ of energy. How much mass does that correspond to, in kilograms?', a: ans(Ef / (C * C), 0.01), unit: 'kg', steps: ['$m = \\dfrac{E}{c^{2}} = \\dfrac{' + tg(Ef) + '}{(3.00 \\times 10^{8})^{2}}$.', '$m = ' + q(Ef / (C * C), 'kg') + '$.'], hint: 'm = E/c².' }; }
    if (s === 'sun') { var P = 3.83e26, rate = P / (C * C); return { q: 'The Sun gives off $3.83 \\times 10^{26}\\ \\text{W}$. How much mass does it convert to energy each second?', a: ans(rate, 0.01), unit: 'kg', steps: ['Each second it releases $3.83 \\times 10^{26}\\ \\text{J}$.', '$m = \\dfrac{E}{c^{2}} = \\dfrac{3.83 \\times 10^{26}}{(3.00 \\times 10^{8})^{2}} = ' + q(rate, 'kg') + '$, about 4 million tonnes every second.'], hint: 'm = E/c².' }; }
    if (s === 'Q') { var rx = R.pick([['^{2}\\text{H} + {}^{3}\\text{H} \\to {}^{4}\\text{He} + n', [2.014102, 3.016049], [4.002603, 1.008665]], ['^{2}\\text{H} + {}^{2}\\text{H} \\to {}^{3}\\text{He} + n', [2.014102, 2.014102], [3.016029, 1.008665]], ['^{2}\\text{H} + {}^{2}\\text{H} \\to {}^{3}\\text{H} + {}^{1}\\text{H}', [2.014102, 2.014102], [3.016049, 1.007825]], ['^{2}\\text{H} + {}^{3}\\text{He} \\to {}^{4}\\text{He} + {}^{1}\\text{H}', [2.014102, 3.016029], [4.002603, 1.007825]], ['^{1}\\text{H} + {}^{7}\\text{Li} \\to 2\\,{}^{4}\\text{He}', [1.007825, 7.016003], [4.002603, 4.002603]]]);
      var mb = rx[1][0] + rx[1][1], ma = rx[2][0] + rx[2][1], Qv = (mb - ma) * UMEV;
      return { q: 'Find the energy released in the reaction $' + rx[0] + '$. Masses (u): ' + rx[1].concat(rx[2]).map(function (x) { return '$' + x.toFixed(6) + '$'; }).join(', ') + ' (in the order written).', a: ans(Qv, 0.01), unit: 'MeV', steps: ['Before: $' + rx[1].map(function (x) { return x.toFixed(6); }).join(' + ') + ' = ' + mb.toFixed(6) + '\\ \\text{u}$.', 'After: $' + rx[2].map(function (x) { return x.toFixed(6); }).join(' + ') + ' = ' + ma.toFixed(6) + '\\ \\text{u}$.', 'Mass lost: $' + (mb - ma).toFixed(6) + '\\ \\text{u}$, so $Q = (' + (mb - ma).toFixed(6) + ')(931.5) = ' + q(Qv, 'MeV') + '$.'], hint: 'Mass before minus mass after, times 931.5 MeV/u.' }; }
    var nu = R.pick(ctx.level === 2 ? NUC.slice(0, 7) : NUC), Z = nu[2], N = nu[3], A = Z + N, parts = Z * MH + N * MNU, dm2 = parts - nu[4], EB = dm2 * UMEV;
    var st = ['Parts: $' + Z + '(1.007825) + ' + N + '(1.008665) = ' + parts.toFixed(6) + '\\ \\text{u}$ (hydrogen atoms include the electrons).', 'Mass defect: $' + parts.toFixed(6) + ' - ' + nu[4].toFixed(6) + ' = ' + dm2.toFixed(6) + '\\ \\text{u}$.', '$E_B = (' + dm2.toFixed(6) + ')(931.5) = ' + q(EB, 'MeV') + '$.'];
    var qq = 'The atomic mass of ' + nu[0] + ' ($' + nu[1] + '$, ' + Z + (Z === 1 ? ' proton' : ' protons') + ' and ' + N + (N === 1 ? ' neutron' : ' neutrons') + ') is $' + nu[4].toFixed(6) + '\\ \\text{u}$. Using $1.007825\\ \\text{u}$ for a hydrogen atom and $1.008665\\ \\text{u}$ for a neutron, find ';
    if (s === 'perNucleon') return { q: qq + 'its binding energy per nucleon, in MeV.', a: ans(EB / A, 0.01), unit: 'MeV', steps: st.concat(['Per nucleon: $\\dfrac{' + tx(EB) + '}{' + A + '} = ' + q(EB / A, 'MeV') + '$.']), hint: 'Find the total binding energy, then divide by A.' };
    return { q: qq + 'its total binding energy, in MeV.', a: ans(EB, 0.01), unit: 'MeV', steps: st, hint: 'Mass of the parts minus the mass of the atom, times 931.5 MeV/u.' };
  });

})(typeof window !== 'undefined' ? window.MathLadder : globalThis.MathLadder);
