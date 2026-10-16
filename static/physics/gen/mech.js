/* Physics Ladder generators: Mechanics with Calculus (course key mech).
   One generator per topic in data/physics/topics/mech.json, registered with MathLadder.gen.
   Built from the source parts in the course builder's work dir (gen/*.js, concatenated in order).

   Conventions: SI units; g = 9.8 m/s² unless a problem says otherwise; G = 6.674 × 10⁻¹¹ N·m²/kg²; numeric answers
   carry `unit` (shown beside the box) and `rtol` (usually 0.02; the shown answer is rounded to 3 significant figures).
   Every problem also carries `chk`: the physical setup in machine-readable form, so the course's node test can
   recompute each answer by an independent route (numeric integration, simulation, conservation laws). The runner
   ignores it. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util, M = Math, PI = M.PI;
  var g0 = 9.8, GN = 6.674e-11;
  // promote long inline math ($...$) to display math ($$...$$): inline math never wraps, so long pieces widen phone pages
  function wideMath(s, limit) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    limit = limit || 30;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (c === '$' && s[i + 1] === '$') { var j = s.indexOf('$$', i + 2); if (j < 0) { out += s.slice(i); break; } out += s.slice(i, j + 2); i = j + 2; continue; }
      if (c === '$') {
        var k = i + 1; while (k < n && !(s[k] === '$' && s[k - 1] !== '\\')) k++;
        if (k >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, k);
        var vis = tex.replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|bigg|Bigg|bigl|bigr|text|mathrm|operatorname|lvert|rvert|vec|hat)\b/g, '').replace(/\\(arcsin|arccos|arctan|sin|cos|tan|sec|csc|cot|ln|log|lim|exp)\b/g, 'xxx').replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length;
        if (vis > limit) { out += '$$' + tex + '$$'; i = k + 1; if (s[i] === '.' || s[i] === ',') i++; continue; }
        out += '$' + tex + '$';
        i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  // "A $800 kg" -> "An $800 kg" (numbers read aloud starting with a vowel sound: 8…, 11, 18, 11 000, 18 000)
  function article(s) { return typeof s !== 'string' ? s : s.replace(/(^|[\s(>])(A|a) (\$(?:8|1[18](?![\d.,{])|1[18](?:,|\{,\})?\d{3}(?![\d.])))/g, '$1$2n $3'); }
  // register a generator; long inline math in the question, steps and hint becomes display math (it scrolls on phones)
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var pr = fn(R, ctx);
      if (pr && typeof pr === 'object') {
        pr.q = wideMath(article(pr.q)); if (Array.isArray(pr.steps)) pr.steps = pr.steps.map(function (x) { return wideMath(article(x)); }); if (pr.hint) pr.hint = wideMath(pr.hint);
        if (pr.a && pr.a.t === 'mc') pr.a.choices = pr.a.choices.map(function (x) { return wideMath(x, 40); });
      }
      return pr;
    });
  }

  // ------------------------------------------------------------------ numbers
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function fix(x) { return Number(Number(x).toPrecision(12)) + 0; }
  function sgf(x, n) { // x rounded to n significant figures (a number)
    if (x === 0 || !isFinite(x)) return x; var e = M.floor(M.log10(M.abs(x))); var f = M.pow(10, n - 1 - e); return fix(M.round(x * f) / f);
  }
  // a simple fraction n/d (d <= 60) equal to x, or null
  function rat(x) { if (!isFinite(x)) return null; for (var d = 1; d <= 60; d++) { var n = M.round(x * d); if (M.abs(n / d - x) < 1e-9 * M.max(1, M.abs(x))) return Q(n, d); } return null; }
  function longDec(x) { var s = String(fix(x)); return /\.\d{5,}/.test(s); }
  function plainNum(x) { // a plain string for a number without float noise ("0.000123", "12500", "1/3")
    x = fix(x); if (longDec(x)) { var r = rat(x); if (r) return r.toPlain(); }
    var s = String(x); if (/e/.test(s)) s = Q.from(s).toDec(30).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s;
  }
  function cf(x) { x = fix(x); return x === 1 ? '' : x === -1 ? '-' : gx(x); }   // a coefficient in front of a letter or function
  function kt(k, v) { return cf(k) + (v || 't'); }                                   // "3t", "t", "-t", "0.5t"
  // the value for an answer spec: n significant figures; scientific form a*10^k outside 0.001 … 10^6
  function sfStr(x, n) {
    n = n || 3; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(y / M.pow(10, e)); return plainNum(m) + '*10^' + e; }
    return plainNum(y);
  }
  // TeX for a computed number with n significant figures (×10^k outside 0.001 … 10^5); trailing zeros dropped
  function fx(x, n) {
    n = n || 3; if (!isFinite(x)) return '\\infty'; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 5 || e <= -4) { var m = fix(y / M.pow(10, e)); return T.num(m) + ' \\times 10^{' + e + '}'; }
    return T.num(y);
  }
  // TeX for a given (exact) number: 2.5 -> "2.5", 6.674e-11 -> "6.674 \times 10^{-11}", 12000 -> "12{,}000"
  function gx(x) {
    x = fix(x); if (x === 0) return '0';
    if (longDec(x)) { var r = rat(x); if (r) return r.toTex(); } var e = M.floor(M.log10(M.abs(x)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(x / M.pow(10, e)); return T.num(m) + ' \\times 10^{' + e + '}'; }
    return M.abs(x) >= 10000 ? T.commas(x) : T.num(x);
  }
  // ------------------------------------------------------------------ units: [plain (for p.unit), TeX]
  var UN = {
    m: ['m', '\\text{m}'], km: ['km', '\\text{km}'], cm: ['cm', '\\text{cm}'], s: ['s', '\\text{s}'], min: ['min', '\\text{min}'], h: ['h', '\\text{h}'], yr: ['yr', '\\text{yr}'], d: ['days', '\\text{days}'],
    ms: ['m/s', '\\text{m/s}'], kms: ['km/s', '\\text{km/s}'], ms2: ['m/s²', '\\text{m/s}^2'], ms3: ['m/s³', '\\text{m/s}^3'],
    kg: ['kg', '\\text{kg}'], g: ['g', '\\text{g}'], N: ['N', '\\text{N}'], kN: ['kN', '\\text{kN}'], J: ['J', '\\text{J}'], kJ: ['kJ', '\\text{kJ}'], MJ: ['MJ', '\\text{MJ}'], GJ: ['GJ', '\\text{GJ}'],
    W: ['W', '\\text{W}'], kW: ['kW', '\\text{kW}'], Ns: ['N·s', '\\text{N·s}'], kgms: ['kg·m/s', '\\text{kg·m/s}'], Nm: ['N·m', '\\text{N·m}'], Nperm: ['N/m', '\\text{N/m}'],
    kgm: ['kg/m', '\\text{kg/m}'], kgm2: ['kg·m²', '\\text{kg·m}^2'], kgm2s: ['kg·m²/s', '\\text{kg·m}^2\\text{/s}'], kgs: ['kg/s', '\\text{kg/s}'], Nsm: ['N·s/m', '\\text{N·s/m}'],
    rad: ['rad', '\\text{rad}'], rads: ['rad/s', '\\text{rad/s}'], rads2: ['rad/s²', '\\text{rad/s}^2'], Hz: ['Hz', '\\text{Hz}'], rpm: ['rpm', '\\text{rpm}'],
    deg: ['°', '^\\circ'], AU: ['AU', '\\text{AU}'], kgm3: ['kg/m³', '\\text{kg/m}^3'], m2: ['m²', '\\text{m}^2'], m2s: ['m²/s', '\\text{m}^2\\text{/s}'], Nm2kg2: ['N·m²/kg²', '\\text{N·m}^2\\text{/kg}^2'], Nkg: ['N/kg', '\\text{N/kg}'], none: ['', '']
  };
  function ut(k) { return (UN[k] || [k, '\\text{' + k + '}'])[1]; }
  function up(k) { return (UN[k] || [k])[0]; }
  function sp(k) { return k === 'deg' || k === 'none' ? '' : '\\ '; }
  function qx(x, k, n) { return fx(x, n) + sp(k) + ut(k); }       // a computed quantity: "12.5\ \text{m/s}"
  function qg(x, k) { return gx(x) + sp(k) + ut(k); }               // a given quantity, exact
  // ------------------------------------------------------------------ answers and problems
  function ans(x, rtol, n) { return { t: 'num', v: sfStr(x, n || 3), rtol: rtol || 0.02 }; }
  function exact(v) { return { t: 'num', v: String(v) }; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function multi(parts) { return { t: 'multi', parts: parts.map(function (p) { var o = { label: p[0], a: p[1] }; if (p[2]) o.unit = up(p[2]); return o; }) }; }
  function expr(v, vars) { return { t: 'expr', v: v, vars: vars || ['t'] }; }
  // P(q, a, steps, hint, unitKey, chk, viz)
  function P(q, a, steps, hint, unit, chk, viz) {
    var p = { q: q, a: a, steps: steps };
    if (hint) p.hint = hint;
    if (unit && unit !== 'none' && a.t === 'num') p.unit = up(unit);
    if (chk) p.chk = chk;
    if (viz) p.viz = viz;
    return p;
  }
  function nolint(list, p) { p.nolint = list; return p; }
  // ------------------------------------------------------------------ TeX helpers
  function fr(a, b) { return '\\frac{' + a + '}{' + b + '}'; }
  function dfr(a, b) { return '\\dfrac{' + a + '}{' + b + '}'; }
  function sq(a) { return '\\sqrt{' + a + '}'; }
  function par(a) { return '\\left(' + a + '\\right)'; }
  function pn(x) { return x < 0 ? '(' + T.num(x) + ')' : T.num(x); }   // a number ready to multiply into
  function pf(x, n) { return x < 0 ? '(' + fx(x, n) + ')' : fx(x, n); }
  function vec(a, n) { return '\\langle ' + a.map(function (x) { return typeof x === 'string' ? x : (n ? fx(x, n) : gx(x)); }).join(', ') + ' \\rangle'; }
  // polynomial in t from coefficients high -> low (integers or simple decimals)
  function poly(c, v) { return T.poly(c.map(function (x) { x = fix(x); var r = longDec(x) ? rat(x) : null; return r || x; }), v || 't'); }
  function polyPlain(c, v) { // plain CAS string, high -> low
    v = v || 't'; var n = c.length - 1, s = '';
    c.forEach(function (a, i) { a = fix(a); if (!a) return; var p = n - i, mag = M.abs(a), term = p === 0 ? plainNum(mag) : (mag === 1 ? '' : plainNum(mag) + '*') + v + (p > 1 ? '^' + p : '');
      s += (s ? (a < 0 ? '-' : '+') : (a < 0 ? '-' : '')) + term; });
    return s || '0';
  }
  function polyAt(c, x) { var s = 0; c.forEach(function (a) { s = s * x + a; }); return s; }
  function polyD(c) { var n = c.length - 1, r = []; for (var i = 0; i < n; i++) r.push(fix(c[i] * (n - i))); return r.length ? r : [0]; }
  function polyI(c) { var n = c.length - 1, r = []; for (var i = 0; i <= n; i++) r.push(fix(c[i] / (n - i + 1))); r.push(0); return r; } // antiderivative with C = 0
  function deg(r) { return r * 180 / PI; }
  function rad(d) { return d * PI / 180; }
  function signWord(x, pos, neg) { return x >= 0 ? pos : neg; }
  function nz(x) { return M.abs(x) < 1e-12 ? 0 : x; }


  // ================================================================== UNIT 1: KINEMATICS WITH CALCULUS
  // substitute x into a polynomial (high -> low): "3(2)^{2} - 4(2) + 1"
  function subst(c, x) {
    var n = c.length - 1, xs = x < 0 ? '(' + T.num(x) + ')' : '(' + T.num(x) + ')', terms = [];
    c.forEach(function (a, i) { var p = n - i; if (!a) return; a = fix(a); terms.push([longDec(a) && rat(a) ? rat(a).toTex() : a, p === 0 ? '' : xs + (p > 1 ? '^{' + p + '}' : '')]); });
    return terms.length ? T.terms(terms) : '0';
  }
  function xdef(name, c, unitWord) { return '$' + name + '(t) = ' + poly(c) + '$'; }
  var UNITS_XT = ' ($x$ in meters, $t$ in seconds)';

  G('mech.velocity-derivative', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['val', 'val', 'expr', 'avg'], ['val', 'expr', 'avg', 'rest'], ['val3', 'val3', 'avg', 'rest', 'expr3']));
    var L = ctx.level;
    if (shape === 'val' || shape === 'expr' || shape === 'avg') {
      var c = L === 1 ? [R.nz(-5, 5), R.int(-9, 9), R.int(-10, 10)] : [R.nz(-3, 3), R.int(-6, 6), R.int(-9, 9), R.int(-10, 10)];
      if (c[0] === 0) c[0] = 2;
      var dc = polyD(c), t1 = R.int(1, 4), v1 = polyAt(dc, t1);
      if (shape === 'expr') {
        return P('A particle moves along the $x$-axis with position ' + xdef('x', c) + UNITS_XT + '. Find its velocity $v(t)$.',
          expr(polyPlain(dc)),
          ['The velocity is the derivative of position: $v(t) = \\dfrac{dx}{dt}$.',
            'Differentiate term by term with the power rule, $\\dfrac{d}{dt}t^n = nt^{n-1}$; the constant ' + T.num(c[c.length - 1]) + ' has derivative 0.',
            '$v(t) = ' + poly(dc) + '$ (in m/s).'],
          'Use the power rule on each term.', null, { k: 'dexpr', f: polyPlain(c), n: 1 });
      }
      if (shape === 'avg') {
        var T1 = R.int(2, 5), xa = polyAt(c, T1), x0 = polyAt(c, 0), vavg = (xa - x0) / T1, vT = polyAt(dc, T1);
        if (M.abs(vavg - vT) < 1e-9) { c[1] += 1; xa = polyAt(c, T1); x0 = polyAt(c, 0); vavg = (xa - x0) / T1; dc = polyD(c); vT = polyAt(dc, T1); }
        return P('A particle has position ' + xdef('x', c) + UNITS_XT + '. Find (a) its average velocity from $t = 0$ to $t = ' + T1 + '\\ \\text{s}$ and (b) its velocity at the instant $t = ' + T1 + '\\ \\text{s}$.',
          multi([['(a) $v_{\\text{avg}} =$', ans(vavg, 0.01), 'ms'], ['(b) $v(' + T1 + ') =$', ans(vT, 0.01), 'ms']]),
          ['Average velocity is displacement over time: $x(0) = ' + gx(x0) + '\\ \\text{m}$ and $x(' + T1 + ') = ' + subst(c, T1) + ' = ' + gx(xa) + '\\ \\text{m}$.',
            '$v_{\\text{avg}} = \\dfrac{' + gx(xa) + ' - ' + pn(x0) + '}{' + T1 + '} = ' + qx(vavg, 'ms', 4) + '$.',
            'The velocity at an instant is the derivative: $v(t) = ' + poly(dc) + '$.',
            '$v(' + T1 + ') = ' + subst(dc, T1) + ' = ' + qg(vT, 'ms') + '$. The two differ because the velocity changes during the trip.'],
          'The average uses two positions; the instantaneous velocity uses the derivative at one time.', null, { k: 'avg', f: polyPlain(c), T: T1 });
      }
      return P('A particle moves along the $x$-axis with position ' + xdef('x', c) + UNITS_XT + '. Find its velocity at $t = ' + t1 + '\\ \\text{s}$.',
        ans(v1, 0.01),
        ['Velocity is the derivative of position: $v(t) = \\dfrac{dx}{dt} = ' + poly(dc) + '$.',
          'Substitute $t = ' + t1 + '$: $v(' + t1 + ') = ' + subst(dc, t1) + ' = ' + qg(v1, 'ms') + '$.',
          v1 < 0 ? 'The negative sign means the particle is moving in the $-x$ direction at that instant.' : 'The sign is positive, so the particle is moving in the $+x$ direction at that instant.'],
        'Differentiate $x(t)$ first, then substitute the time. Dividing $x$ by $t$ would give an average, not the velocity at that instant.', 'ms', { k: 'd', f: polyPlain(c), n: 1, t: t1 });
    }
    if (shape === 'rest') {
      var r1 = R.int(1, 3), r2 = r1 + R.int(1, 4), k = R.pick([1, 2]), s = r1 + r2, pr = r1 * r2;
      var cc = [2 * k, -3 * k * s, 6 * k * pr, R.int(0, 8)], d1 = polyD(cc), later = L >= 3 && R.coin();
      var tt = later ? r2 : r1;
      return P('A particle moves with position ' + xdef('x', cc) + UNITS_XT + '. At what time $t > 0$ is it ' + (later ? '<b>at rest for the second time</b>' : '<b>first</b> at rest') + '?',
        ans(tt, 0.01),
        ['At rest means $v = 0$. Differentiate: $v(t) = ' + poly(d1) + '$.',
          'Factor: $v(t) = ' + T.num(6 * k) + '(t^2 - ' + s + 't + ' + pr + ') = ' + T.num(6 * k) + '(t - ' + r1 + ')(t - ' + r2 + ')$.',
          'So $v = 0$ at $t = ' + r1 + '\\ \\text{s}$ and $t = ' + r2 + '\\ \\text{s}$. ' + (later ? 'The second time is $t = ' + r2 + '\\ \\text{s}$.' : 'The first time is $t = ' + r1 + '\\ \\text{s}$.')],
        'Set the derivative equal to zero and factor.', 's', { k: 'rest', f: polyPlain(cc), which: later ? 2 : 1 });
    }
    // level 3: functions beyond polynomials
    var kind = R.pick(['sin', 'exp']);
    if (kind === 'sin') {
      var A = R.pick([0.2, 0.3, 0.5, 2, 3, 4]), b = R.pick([2, 3, 4, 5]), t2 = R.pick([0.2, 0.3, 0.4, 0.5, 0.7, 1.2]), off = R.int(0, 2), vv = A * b * M.cos(b * t2) + off;
      var xt = gx(A) + '\\sin(' + b + 't)' + (off ? ' + ' + (off === 1 ? '' : off) + 't' : '');
      if (shape === 'expr3') return P('A vibrating part has position $x(t) = ' + xt + '$' + UNITS_XT + '. Find its velocity $v(t)$.',
        expr(plainNum(A * b) + '*cos(' + b + 't)' + (off ? '+' + off : '')),
        ['$v(t) = \\dfrac{dx}{dt}$. By the chain rule, $\\dfrac{d}{dt}\\sin(' + b + 't) = ' + b + '\\cos(' + b + 't)$.', (off ? 'The term $' + (off === 1 ? '' : off) + 't$ has derivative ' + off + '. ' : '') + '$v(t) = ' + cf(A * b) + '\\cos(' + b + 't)' + (off ? ' + ' + off : '') + '$ (in m/s).'],
        'Chain rule: the inside $' + b + 't$ contributes a factor ' + b + '.', null, { k: 'dexpr', f: plainNum(A) + '*sin(' + b + 't)' + (off ? '+' + off + 't' : ''), n: 1 });
      return P('A vibrating part has position $x(t) = ' + xt + '$' + UNITS_XT + '. Find its velocity at $t = ' + gx(t2) + '\\ \\text{s}$. (Angles in radians.)',
        ans(vv, 0.02),
        ['$v(t) = \\dfrac{dx}{dt} = ' + cf(A * b) + '\\cos(' + b + 't)' + (off ? ' + ' + off : '') + '$ by the chain rule.',
          'At $t = ' + gx(t2) + '$: $\\cos(' + gx(fix(b * t2)) + ') = ' + fx(M.cos(b * t2), 4) + '$ (radians).',
          '$v = ' + gx(A * b) + '(' + fx(M.cos(b * t2), 4) + ')' + (off ? ' + ' + off : '') + ' = ' + qx(vv, 'ms') + '$.'],
        'Use the chain rule, and keep your calculator in radians.', 'ms', { k: 'd', f: plainNum(A) + '*sin(' + b + 't)' + (off ? '+' + off + 't' : ''), n: 1, t: t2 });
    }
    var D = R.pick([2, 4, 5, 6, 8, 10]), tau = R.pick([2, 4, 5]), t3 = R.pick([1, 2, 3, 4]), ve = D / tau * M.exp(-t3 / tau);
    var xe = gx(D) + '\\left(1 - e^{-t/' + tau + '}\\right)';
    if (shape === 'expr3') return P('A cart coasting to a stop has position $x(t) = ' + xe + '$' + UNITS_XT + '. Find its velocity $v(t)$.',
      expr(plainNum(D / tau) + '*e^(-t/' + tau + ')'),
      ['Differentiate: the constant ' + gx(D) + ' gives 0, and $\\dfrac{d}{dt}\\left(-' + gx(D) + 'e^{-t/' + tau + '}\\right) = -' + gx(D) + '\\cdot\\left(-\\dfrac{1}{' + tau + '}\\right)e^{-t/' + tau + '}$.',
        '$v(t) = ' + cf(fix(D / tau)) + 'e^{-t/' + tau + '}$ (in m/s).'],
      'The derivative of $e^{kt}$ is $ke^{kt}$.', null, { k: 'dexpr', f: plainNum(D) + '*(1-e^(-t/' + tau + '))', n: 1 });
    return P('A cart coasting to a stop has position $x(t) = ' + xe + '$' + UNITS_XT + '. Find its velocity at $t = ' + t3 + '\\ \\text{s}$.',
      ans(ve, 0.02),
      ['$v(t) = \\dfrac{dx}{dt} = \\dfrac{' + gx(D) + '}{' + tau + '}e^{-t/' + tau + '}$, since $\\dfrac{d}{dt}e^{-t/' + tau + '} = -\\dfrac{1}{' + tau + '}e^{-t/' + tau + '}$.',
        '$v(' + t3 + ') = ' + cf(fix(D / tau)) + 'e^{-' + gx(fix(t3 / tau)) + '} = ' + qx(ve, 'ms') + '$.'],
      'Differentiate the exponential with the chain rule.', 'ms', { k: 'd', f: plainNum(D) + '*(1-e^(-t/' + tau + '))', n: 1, t: t3 });
  });

  G('mech.acceleration-derivative', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['val', 'fromv', 'throw'], ['val', 'fromv', 'rest', 'throw'], ['rest', 'sho', 'fromv3', 'val']));
    if (shape === 'val') {
      var c = [R.nz(-3, 3), R.int(-6, 6), R.int(-9, 9), R.int(-5, 5)], d1 = polyD(c), d2 = polyD(d1), t1 = R.int(1, 4), a1 = polyAt(d2, t1);
      return P('A particle has position ' + xdef('x', c) + UNITS_XT + '. Find its acceleration at $t = ' + t1 + '\\ \\text{s}$.',
        ans(a1, 0.01),
        ['First derivative: $v(t) = ' + poly(d1) + '$.', 'Second derivative: $a(t) = \\dfrac{dv}{dt} = ' + poly(d2) + '$.', '$a(' + t1 + ') = ' + subst(d2, t1) + ' = ' + qg(a1, 'ms2') + '$.'],
        'Differentiate twice.', 'ms2', { k: 'd', f: polyPlain(c), n: 2, t: t1 });
    }
    if (shape === 'fromv') {
      var cv = [R.nz(-4, 4), R.int(-8, 8), R.int(-6, 6)], dv = polyD(cv), t2 = R.int(1, 5), a2 = polyAt(dv, t2);
      return P('A cyclist\'s velocity is $v(t) = ' + poly(cv) + '$ ($v$ in m/s, $t$ in seconds). Find the acceleration at $t = ' + t2 + '\\ \\text{s}$.',
        ans(a2, 0.01),
        ['$a(t) = \\dfrac{dv}{dt} = ' + poly(dv) + '$.', '$a(' + t2 + ') = ' + subst(dv, t2) + ' = ' + qg(a2, 'ms2') + '$.'],
        'Acceleration is the rate of change of velocity.', 'ms2', { k: 'd', f: polyPlain(cv), n: 1, t: t2 });
    }
    if (shape === 'fromv3') {
      var V = R.pick([4, 6, 8, 12]), tau = R.pick([2, 3, 4, 5]), t3 = R.pick([1, 2, 3]), a3 = V / tau * M.exp(-t3 / tau);
      return P('A runner starting from rest has velocity $v(t) = ' + V + '\\left(1 - e^{-t/' + tau + '}\\right)$ ($v$ in m/s, $t$ in seconds). Find her acceleration at $t = ' + t3 + '\\ \\text{s}$.',
        ans(a3, 0.02),
        ['$a(t) = \\dfrac{dv}{dt} = ' + V + '\\cdot\\dfrac{1}{' + tau + '}e^{-t/' + tau + '}$.', '$a(' + t3 + ') = ' + cf(fix(V / tau)) + 'e^{-' + gx(fix(t3 / tau)) + '} = ' + qx(a3, 'ms2') + '$.', 'The acceleration shrinks as she nears her top speed of ' + V + ' m/s.'],
        'Differentiate the exponential with the chain rule.', 'ms2', { k: 'd', f: V + '*(1-e^(-t/' + tau + '))', n: 1, t: t3 });
    }
    if (shape === 'rest') {
      var r1 = R.int(1, 3), r2 = r1 + R.int(1, 3), s = r1 + r2, pr = r1 * r2, cc = [2, -3 * s, 6 * pr, 0], d1r = polyD(cc), d2r = polyD(d1r), ar = polyAt(d2r, r1);
      return P('A particle moves with position ' + xdef('x', cc) + UNITS_XT + '. It is momentarily at rest at $t = ' + r1 + '\\ \\text{s}$. What is its acceleration at that instant?',
        ans(ar, 0.01),
        ['$v(t) = ' + poly(d1r) + ' = 6(t - ' + r1 + ')(t - ' + r2 + ')$, which is zero at $t = ' + r1 + '$: at rest, as stated.',
          '$a(t) = ' + poly(d2r) + '$.', '$a(' + r1 + ') = ' + subst(d2r, r1) + ' = ' + qg(ar, 'ms2') + '$.',
          'The velocity is zero but the acceleration is not: the particle is turning around, so its velocity is changing.'],
        'Zero velocity does not mean zero acceleration. Differentiate twice and substitute.', 'ms2', { k: 'd', f: polyPlain(cc), n: 2, t: r1 });
    }
    if (shape === 'throw') {
      var y0 = R.int(1, 3), v0 = R.pick([9.8, 14.7, 19.6, 24.5]), tt = v0 / 9.8;
      return P('A ball is thrown straight up. Its height is $y(t) = ' + y0 + ' + ' + gx(v0) + 't - 4.9t^2$ ($y$ in meters, $t$ in seconds, up positive). What is its acceleration at the instant it reaches its highest point?',
        ans(-9.8, 0.01),
        ['$v(t) = \\dfrac{dy}{dt} = ' + gx(v0) + ' - 9.8t$, which is zero at $t = ' + gx(tt) + '\\ \\text{s}$: the top of the flight.',
          '$a(t) = \\dfrac{dv}{dt} = -9.8\\ \\text{m/s}^2$ at every instant, including the top.',
          'At the top the velocity is zero for an instant, but it is still changing from upward to downward, so the acceleration is $-9.8\\ \\text{m/s}^2$ (downward).'],
        'Is the velocity still changing at the top?', 'ms2', { k: 'd', f: y0 + '+' + v0 + '*t-4.9t^2', n: 2, t: tt });
    }
    // sho: x = A cos(w t)
    var A = R.pick([0.05, 0.1, 0.2, 0.3]), w = R.pick([2, 4, 5, 10]), t4 = R.pick([0.1, 0.2, 0.3, 0.5]), a4 = -A * w * w * M.cos(w * t4);
    return P('A mass on a spring has position $x(t) = ' + gx(A) + '\\cos(' + w + 't)$' + UNITS_XT + '. Find its acceleration at $t = ' + gx(t4) + '\\ \\text{s}$ (radians).',
      ans(a4, 0.02),
      ['$v(t) = -' + cf(fix(A * w)) + '\\sin(' + w + 't)$ and $a(t) = -' + cf(fix(A * w * w)) + '\\cos(' + w + 't)$.',
        'Notice $a = -' + (w * w) + 'x$: the acceleration always points back toward $x = 0$.',
        '$a(' + gx(t4) + ') = -' + cf(fix(A * w * w)) + '\\cos(' + gx(fix(w * t4)) + ') = ' + qx(a4, 'ms2') + '$.'],
      'Differentiate twice, with the chain rule each time.', 'ms2', { k: 'd', f: plainNum(A) + '*cos(' + w + 't)', n: 2, t: t4 });
  });

  G('mech.motion-from-acceleration', function (R, ctx) {
    var L = ctx.level, shape = R.pick(lv(ctx, ['v', 'v', 'x'], ['v', 'x', 'x', 'vexpr'], ['x', 'exp', 'cos', 'xexpr']));
    if (shape === 'exp' || shape === 'cos') {
      if (shape === 'exp') {
        var A = R.pick([2, 3, 4, 5, 6]), tau = R.pick([2, 4, 5]), v0 = R.int(0, 5), T1 = R.pick([2, 4, 6, 10]), want = R.pick(['v', 'x']);
        var vT = v0 + A * tau * (1 - M.exp(-T1 / tau)), xT = v0 * T1 + A * tau * T1 - A * tau * tau * (1 - M.exp(-T1 / tau));
        var steps = ['$v(t) = v_0 + \\int_0^t a\\,dt\' = ' + v0 + ' + ' + A + '\\int_0^t e^{-t\'/' + tau + '}\\,dt\' = ' + v0 + ' + ' + (A * tau) + '\\left(1 - e^{-t/' + tau + '}\\right)$.'];
        if (want === 'v') steps.push('$v(' + T1 + ') = ' + v0 + ' + ' + (A * tau) + '\\left(1 - e^{-' + gx(fix(T1 / tau)) + '}\\right) = ' + qx(vT, 'ms') + '$.');
        else steps.push('Integrate again from $x(0) = 0$: $x(t) = ' + (v0 ? kt(v0) + ' + ' : '') + (A * tau) + 't - ' + (A * tau * tau) + '\\left(1 - e^{-t/' + tau + '}\\right)$.', '$x(' + T1 + ') = ' + qx(xT, 'm') + '$.');
        return P('A car starts at $x = 0$ with velocity $' + v0 + '\\ \\text{m/s}$, and its acceleration fades as $a(t) = ' + A + 'e^{-t/' + tau + '}$ ($a$ in m/s², $t$ in seconds). Find its ' + (want === 'v' ? 'velocity' : 'position') + ' at $t = ' + T1 + '\\ \\text{s}$.',
          ans(want === 'v' ? vT : xT, 0.02), steps, 'Integrate $a(t)$ and use the starting velocity to fix the constant.', want === 'v' ? 'ms' : 'm',
          { k: 'ivp', a: A + '*e^(-t/' + tau + ')', v0: v0, x0: 0, T: T1, want: want });
      }
      var Ac = R.pick([2, 3, 4, 6]), w = R.pick([1, 2, 3]), Tc = R.pick([0.5, 1, 1.5, 2]), vc = Ac / w * M.sin(w * Tc);
      return P('A shaker table starts from rest at $x = 0$ with acceleration $a(t) = ' + Ac + '\\cos(' + kt(w) + ')$ ($a$ in m/s², $t$ in seconds, radians). Find its velocity at $t = ' + gx(Tc) + '\\ \\text{s}$.',
        ans(vc, 0.02),
        ['$v(t) = v_0 + \\int_0^t ' + Ac + '\\cos(' + kt(w) + '\')\\,dt\' = 0 + \\dfrac{' + Ac + '}{' + w + '}\\sin(' + kt(w) + ')$.',
          '$v(' + gx(Tc) + ') = ' + cf(fix(Ac / w)) + '\\sin(' + gx(fix(w * Tc)) + ') = ' + qx(vc, 'ms') + '$.'],
        'An antiderivative of $\\cos(kt)$ is $\\frac{1}{k}\\sin(kt)$.', 'ms', { k: 'ivp', a: Ac + '*cos(' + w + 't)', v0: 0, x0: 0, T: Tc, want: 'v' });
    }
    // polynomial acceleration
    var ca = L === 1 ? [R.nz(-3, 6) * 2, R.int(-4, 6)] : R.pick([[R.nz(-3, 4) * 3, R.int(-4, 4) * 2, R.int(-6, 6)], [R.nz(-4, 6) * 2, R.int(-4, 6)]]);
    var v0p = R.int(-5, 8), x0p = R.int(-10, 10), Tp = R.int(1, 4), vc_ = polyI(ca); vc_[vc_.length - 1] = v0p; var xc = polyI(vc_); xc[xc.length - 1] = x0p;
    var vTp = polyAt(vc_, Tp), xTp = polyAt(xc, Tp);
    var adef = '$a(t) = ' + poly(ca) + '$ ($a$ in m/s², $t$ in seconds)';
    if (shape === 'vexpr' || shape === 'xexpr') {
      var isX = shape === 'xexpr';
      return P('An object has acceleration ' + adef + '. At $t = 0$ its velocity is $' + v0p + '\\ \\text{m/s}$' + (isX ? ' and its position is $' + x0p + '\\ \\text{m}$' : '') + '. Find ' + (isX ? 'its position $x(t)$' : 'its velocity $v(t)$') + '.',
        expr(polyPlain(isX ? xc : vc_)),
        ['Antidifferentiate $a(t)$: $v(t) = ' + poly(polyI(ca).slice(0, -1).concat([0])) + ' + C_1$.', 'At $t = 0$: $C_1 = v(0) = ' + v0p + '$, so $v(t) = ' + poly(vc_) + '$.'].concat(isX ? ['Antidifferentiate again: $x(t) = ' + poly(polyI(vc_)) + ' + C_2$, and $C_2 = x(0) = ' + x0p + '$.', '$x(t) = ' + poly(xc) + '$.'] : []),
        'Every antiderivative brings a constant; the starting values fix them.', null, { k: isX ? 'ivpx' : 'ivpv', a: polyPlain(ca), v0: v0p, x0: x0p });
    }
    var isV = shape === 'v';
    var st = ['$v(t) = v_0 + \\int_0^t a\\,dt\'$: antidifferentiate and use $v(0) = ' + v0p + '$ to get $v(t) = ' + poly(vc_) + '$.'];
    if (isV) st.push('$v(' + Tp + ') = ' + subst(vc_, Tp) + ' = ' + qg(vTp, 'ms') + '$.');
    else st.push('Integrate again and use $x(0) = ' + x0p + '$: $x(t) = ' + poly(xc) + '$.', '$x(' + Tp + ') = ' + subst(xc, Tp) + ' = ' + qx(xTp, 'm', 4) + '$.');
    return P('An object has acceleration ' + adef + '. At $t = 0$ it is at $x = ' + x0p + '\\ \\text{m}$ with velocity $' + v0p + '\\ \\text{m/s}$. Find its ' + (isV ? 'velocity' : 'position') + ' at $t = ' + Tp + '\\ \\text{s}$.',
      ans(isV ? vTp : xTp, 0.01), st, 'Integrate, then use the starting value to find the constant of integration.', isV ? 'ms' : 'm',
      { k: 'ivp', a: polyPlain(ca), v0: v0p, x0: x0p, T: Tp, want: isV ? 'v' : 'x' });
  });

  G('mech.derive-kinematics', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['which', 'v2', 'tx'], ['which', 'v2', 'varying', 'tx'], ['varying', 'v2', 'varying2', 'which']));
    if (shape === 'which') {
      var good = ['a ball tossed straight up, with no air resistance', 'a block sliding down a frictionless ramp', 'a cart rolling down a straight ramp, ignoring friction', 'a dropped stone in a vacuum chamber'];
      var bad = ['a mass bouncing on a spring', 'a skydiver falling through the air before reaching terminal speed', 'a car whose acceleration is $a(t) = 2t$', 'a satellite moving around a circular orbit', 'a pendulum bob swinging back and forth', 'a ball rolling up and over a curved hill'];
      return P('For which motion can you use $x = x_0 + v_0t + \\tfrac{1}{2}at^2$ along the direction of motion?',
        mc(R.pick(good), R.sample(bad, 3)),
        ['The equation comes from integrating $a\\,dt$ twice with $a$ <b>constant</b>, so it only holds when the acceleration never changes.',
          'Free fall without air resistance and sliding down a straight frictionless ramp have constant acceleration ($g$ or $g\\sin\\theta$).',
          'A spring force, air drag, a changing push and circular motion all give an acceleration that changes, so you must integrate the actual $a(t)$ or $a(x)$.'],
        'Where did the equation come from, and what did that assume?', null, { k: 'mc' });
    }
    if (shape === 'v2') {
      var v0 = R.int(2, 12) * 2, a = R.pick([-4, -3, -2, 2, 3, 4, 5]), dx = R.int(2, 12) * 2, v2 = v0 * v0 + 2 * a * dx;
      if (v2 <= 4) { a = M.abs(a); v2 = v0 * v0 + 2 * a * dx; }
      var vf = M.sqrt(v2);
      return P('A cart moving at $' + v0 + '\\ \\text{m/s}$ has a constant acceleration of $' + a + '\\ \\text{m/s}^2$ along its motion. How fast is it moving after it travels $' + dx + '\\ \\text{m}$ (still in the same direction)?',
        ans(vf, 0.01),
        ['With $a$ constant, $v\\,\\dfrac{dv}{dx} = a$ integrates to $\\tfrac{1}{2}v^2 - \\tfrac{1}{2}v_0^2 = a\\,\\Delta x$, so $v^2 = v_0^2 + 2a\\,\\Delta x$.',
          '$v^2 = ' + v0 + '^2 + 2(' + a + ')(' + dx + ') = ' + gx(v2) + '\\ \\text{m}^2/\\text{s}^2$.',
          '$v = \\sqrt{' + gx(v2) + '} = ' + qx(vf, 'ms') + '$.'],
        'Use the equation without time: $v^2 = v_0^2 + 2a\\,\\Delta x$.', 'ms', { k: 'cv2', v0: v0, a: a, dx: dx });
    }
    if (shape === 'tx') {
      var v0t = R.int(3, 15), at = -R.int(1, 4) * 2, tback = -2 * v0t / at;
      return P('A puck slides up a straight icy ramp at $' + v0t + '\\ \\text{m/s}$ with a constant acceleration of $' + at + '\\ \\text{m/s}^2$ (up the ramp positive). Using $x(t) = v_0t + \\tfrac{1}{2}at^2$, when does it return to its starting point?',
        ans(tback, 0.01),
        ['Set $x(t) = 0$: $t\\left(v_0 + \\tfrac{1}{2}at\\right) = 0$.', 'One solution is $t = 0$ (the start). The other is $t = -\\dfrac{2v_0}{a} = -\\dfrac{2(' + v0t + ')}{' + at + '} = ' + qx(tback, 's') + '$.',
          'This works because the acceleration stays constant on the way up and on the way down.'],
        'Factor out $t$.', 's', { k: 'ret', v0: v0t, a: at });
    }
    // varying: a(t) = k t from rest
    var k = R.pick([1, 2, 3, 4, 6]), T1 = R.int(2, 5), xtrue = k * T1 * T1 * T1 / 6, xwrong = 0.5 * k * T1 * T1 * T1;
    if (shape === 'varying2') {
      var vtrue = k * T1 * T1 / 2;
      return P('A rocket sled starts from rest with acceleration $a(t) = ' + cf(k) + 't$ ($a$ in m/s², $t$ in seconds). Find its velocity at $t = ' + T1 + '\\ \\text{s}$. (A shortcut using $v = at$ with the final acceleration would give $' + gx(k * T1 * T1) + '\\ \\text{m/s}$; is that right?)',
        ans(vtrue, 0.01),
        ['The acceleration changes, so $v = v_0 + at$ does not apply. Integrate instead.', '$v(t) = \\int_0^t ' + cf(k) + 't\'\\,dt\' = ' + cf(fix(k / 2)) + 't^2$.', '$v(' + T1 + ') = ' + cf(fix(k / 2)) + '(' + T1 + ')^2 = ' + qg(vtrue, 'ms') + '$, half of the shortcut, because the acceleration was smaller earlier on.'],
        'Is the acceleration constant?', 'ms', { k: 'ivp', a: k + '*t', v0: 0, x0: 0, T: T1, want: 'v' });
    }
    return P('A rocket sled starts from rest at $x = 0$ with acceleration $a(t) = ' + cf(k) + 't$ ($a$ in m/s², $t$ in seconds). How far has it gone at $t = ' + T1 + '\\ \\text{s}$?',
      ans(xtrue, 0.01),
      ['The acceleration changes with time, so $x = \\tfrac{1}{2}at^2$ does not apply. Integrate twice instead.',
        '$v(t) = \\int_0^t ' + cf(k) + 't\'\\,dt\' = ' + cf(fix(k / 2)) + 't^2$, and $x(t) = \\int_0^t ' + cf(fix(k / 2)) + 't\'^2\\,dt\' = ' + cf(fix(k / 6)) + 't^3$.',
        '$x(' + T1 + ') = ' + gx(fix(k / 6)) + '(' + T1 + ')^3 = ' + qx(xtrue, 'm', 4) + '$.',
        'Using $\\tfrac{1}{2}at^2$ with the final acceleration $a = ' + (k * T1) + '\\ \\text{m/s}^2$ would give $' + gx(xwrong) + '\\ \\text{m}$, three times too far.'],
      'Integrate $a(t)$ twice, starting from rest.', 'm', { k: 'ivp', a: k + '*t', v0: 0, x0: 0, T: T1, want: 'x' });
  });

  G('mech.acceleration-of-position', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['lin', 'spring'], ['spring', 'lin', 'inv', 'drag'], ['drag', 'inv', 'cube', 'spring']));
    if (shape === 'lin') {
      var c = R.pick([2, 4, 6, 8]), x0 = R.int(1, 3), x1 = x0 + R.int(1, 3), v0 = R.int(1, 6), v2 = v0 * v0 + c * (x1 * x1 - x0 * x0), v1 = M.sqrt(v2);
      return P('A bead on a spinning rod slides outward with acceleration $a = ' + c + 'x$ ($a$ in m/s², $x$ in meters). It passes $x = ' + x0 + '\\ \\text{m}$ moving outward at $' + v0 + '\\ \\text{m/s}$. How fast is it moving at $x = ' + x1 + '\\ \\text{m}$?',
        ans(v1, 0.01),
        ['$a$ depends on $x$, so write $a = \\dfrac{dv}{dt} = \\dfrac{dv}{dx}\\dfrac{dx}{dt} = v\\dfrac{dv}{dx}$.',
          'Separate and integrate: $\\int_{' + v0 + '}^{v} v\\,dv = \\int_{' + x0 + '}^{' + x1 + '} ' + c + 'x\\,dx$, so $\\tfrac{1}{2}v^2 - \\tfrac{1}{2}(' + v0 + ')^2 = ' + cf(c / 2) + '\\left(' + x1 + '^2 - ' + x0 + '^2\\right)$.',
          '$v^2 = ' + (v0 * v0) + ' + ' + gx(c * (x1 * x1 - x0 * x0)) + ' = ' + gx(v2) + '$, so $v = ' + qx(v1, 'ms') + '$.'],
        'Use $a = v\\,dv/dx$ and integrate over $x$.', 'ms', { k: 'ax', a: c + '*x', x0: x0, v0: v0, x1: x1, want: 'v' });
    }
    if (shape === 'spring') {
      var w2 = R.pick([4, 9, 16, 25, 36]), w = M.sqrt(w2), v0s = R.int(2, 10) * (ctx.level === 1 ? 1 : 1), xmax = v0s / w, ask = ctx.level === 1 ? 'max' : R.pick(['max', 'v']);
      if (ask === 'max') return P('A glider on an air track is attached to a spring, so its acceleration is $a = -' + w2 + 'x$ ($a$ in m/s², $x$ in meters from equilibrium). It passes $x = 0$ at $' + v0s + '\\ \\text{m/s}$. How far from equilibrium does it get before it stops?',
        ans(xmax, 0.01),
        ['Write $a = v\\,\\dfrac{dv}{dx}$: $v\\,dv = -' + w2 + 'x\\,dx$.', 'Integrate from the start ($x = 0$, $v = ' + v0s + '$) to the turning point ($v = 0$): $\\tfrac{1}{2}(0 - ' + v0s + '^2) = -\\tfrac{' + w2 + '}{2}x_{\\max}^2$.',
          '$x_{\\max} = \\dfrac{' + v0s + '}{\\sqrt{' + w2 + '}} = ' + qx(xmax, 'm') + '$.'],
        'Integrate $v\\,dv = a\\,dx$ until the speed reaches zero.', 'm', { k: 'ax', a: '-' + w2 + '*x', x0: 0, v0: v0s, want: 'xstop' });
      var x1s = sgf(xmax * R.pick([0.4, 0.5, 0.6, 0.8]), 2), v1s = M.sqrt(v0s * v0s - w2 * x1s * x1s);
      return P('A glider on an air track has acceleration $a = -' + w2 + 'x$ ($a$ in m/s², $x$ in meters). It passes $x = 0$ at $' + v0s + '\\ \\text{m/s}$. How fast is it moving at $x = ' + gx(x1s) + '\\ \\text{m}$?',
        ans(v1s, 0.02),
        ['$v\\,dv = -' + w2 + 'x\\,dx$; integrate from $(x, v) = (0, ' + v0s + ')$: $\\tfrac{1}{2}v^2 - \\tfrac{1}{2}(' + v0s + ')^2 = -\\tfrac{' + w2 + '}{2}x^2$.',
          '$v^2 = ' + (v0s * v0s) + ' - ' + w2 + '(' + gx(x1s) + ')^2 = ' + fx(v1s * v1s, 4) + '$, so $v = ' + qx(v1s, 'ms') + '$.'],
        'Use $a = v\\,dv/dx$.', 'ms', { k: 'ax', a: '-' + w2 + '*x', x0: 0, v0: v0s, x1: x1s, want: 'v' });
    }
    if (shape === 'inv') {
      var C = R.pick([4, 8, 12, 16]), xa = R.pick([1, 2]), xb = xa * 2, vneed = M.sqrt(2 * C * (1 / xa - 1 / xb)), va = sgf(vneed + R.int(1, 4), 2), vb = M.sqrt(va * va - 2 * C * (1 / xa - 1 / xb));
      return P('A small probe moves straight away from a heavy mass. Gravity gives it acceleration $a = -\\dfrac{' + C + '}{x^2}$ ($a$ in m/s², $x$ in meters from the mass). At $x = ' + xa + '\\ \\text{m}$ it moves outward at $' + gx(va) + '\\ \\text{m/s}$. How fast is it moving at $x = ' + xb + '\\ \\text{m}$?',
        ans(vb, 0.02),
        ['$v\\,dv = -\\dfrac{' + C + '}{x^2}\\,dx$. Integrate: $\\tfrac{1}{2}v^2 - \\tfrac{1}{2}v_0^2 = ' + C + '\\left(\\dfrac{1}{x} - \\dfrac{1}{x_0}\\right)$.',
          '$v^2 = ' + gx(va) + '^2 + 2(' + C + ')\\left(\\dfrac{1}{' + xb + '} - \\dfrac{1}{' + xa + '}\\right) = ' + fx(va * va, 4) + ' - ' + gx(2 * C * (1 / xa - 1 / xb)) + ' = ' + fx(vb * vb, 4) + '$.',
          '$v = ' + qx(vb, 'ms') + '$.'],
        'An antiderivative of $-C/x^2$ is $C/x$.', 'ms', { k: 'ax', a: '-' + C + '/x^2', x0: xa, v0: va, x1: xb, want: 'v' });
    }
    if (shape === 'cube') {
      var x0c = R.int(0, 1), x1c = x0c + R.int(1, 2), v0c = R.int(1, 5), kc = R.pick([3, 6]), v2c = v0c * v0c + 2 * (kc / 3) * (M.pow(x1c, 3) - M.pow(x0c, 3)), v1c = M.sqrt(v2c);
      return P('A magnet pulls a steel ball along a groove so that $a = ' + kc + 'x^2$ ($a$ in m/s², $x$ in meters). The ball passes $x = ' + x0c + '\\ \\text{m}$ at $' + v0c + '\\ \\text{m/s}$, moving in $+x$. Find its speed at $x = ' + x1c + '\\ \\text{m}$.',
        ans(v1c, 0.01),
        ['$v\\,dv = ' + kc + 'x^2\\,dx$, so $\\tfrac{1}{2}v^2 - \\tfrac{1}{2}v_0^2 = ' + cf(kc / 3) + '\\left(x^3 - x_0^3\\right)$.',
          '$v^2 = ' + (v0c * v0c) + ' + ' + cf(2 * kc / 3) + '\\left(' + x1c + '^3 - ' + x0c + '^3\\right) = ' + gx(v2c) + '$.', '$v = ' + qx(v1c, 'ms') + '$.'],
        'Write $a = v\\,dv/dx$ and integrate both sides.', 'ms', { k: 'ax', a: kc + '*x^2', x0: x0c, v0: v0c, x1: x1c, want: 'v' });
    }
    // drag: a = -b v
    var b = R.pick([0.5, 1, 2, 4]), v0d = R.int(4, 20), frac = R.pick([0.5, 0.25]), xd = v0d * (1 - frac) / b, full = ctx.level >= 3 && R.coin();
    if (full) return P('A boat cuts its engine while moving at $' + v0d + '\\ \\text{m/s}$. Water drag gives it acceleration $a = -' + kt(b, 'v') + '$ ($a$ in m/s², $v$ in m/s). How far does it glide in total before it (in the limit) stops?',
      ans(v0d / b, 0.01),
      ['$a = v\\,\\dfrac{dv}{dx} = -' + kt(b, 'v') + '$. Divide by $v$: $\\dfrac{dv}{dx} = -' + gx(b) + '$.', 'So the speed drops linearly with distance: $v = ' + v0d + ' - ' + kt(b, 'x') + '$.',
        'It reaches $v = 0$ at $x = \\dfrac{' + v0d + '}{' + gx(b) + '} = ' + qx(v0d / b, 'm') + '$. (In time it never quite stops, but the distance is finite.)'],
      'Use $a = v\\,dv/dx$: the $v$ cancels.', 'm', { k: 'drag', b: b, v0: v0d, want: 'xstop' });
    return P('A boat cuts its engine while moving at $' + v0d + '\\ \\text{m/s}$. Water drag gives it acceleration $a = -' + kt(b, 'v') + '$ ($a$ in m/s², $v$ in m/s). How far does it glide while slowing to $' + gx(v0d * frac) + '\\ \\text{m/s}$?',
      ans(xd, 0.01),
      ['$a = v\\,\\dfrac{dv}{dx} = -' + kt(b, 'v') + '$, so $\\dfrac{dv}{dx} = -' + gx(b) + '$: the speed falls by ' + gx(b) + ' m/s for every meter.',
        '$\\Delta x = \\dfrac{' + v0d + ' - ' + gx(v0d * frac) + '}{' + gx(b) + '} = ' + qx(xd, 'm') + '$.'],
      'Use $a = v\\,dv/dx$: the $v$ cancels.', 'm', { k: 'drag', b: b, v0: v0d, v1: v0d * frac, want: 'x' });
  });

  G('mech.motion-vectors', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['vvec', 'speed', 'avec'], ['speed', 'avec', 'speed', 'circle'], ['angle', 'circle', 'speed', 'angle']));
    if (shape === 'circle') {
      var Rr = R.pick([0.5, 2, 3, 4, 5]), w = R.pick([2, 3, 4, 0.5]), want = R.pick(['v', 'a']), val = want === 'v' ? Rr * w : Rr * w * w;
      return P('A particle moves on the path $\\vec{r}(t) = ' + gx(Rr) + '\\langle \\cos(' + gx(w) + 't), \\sin(' + gx(w) + 't) \\rangle$ (meters, seconds). Find the magnitude of its ' + (want === 'v' ? 'velocity' : 'acceleration') + '.',
        ans(val, 0.01),
        ['$\\vec{v} = \\dfrac{d\\vec{r}}{dt} = ' + gx(fix(Rr * w)) + '\\langle -\\sin(' + gx(w) + 't), \\cos(' + gx(w) + 't) \\rangle$, with magnitude $' + gx(fix(Rr * w)) + '\\ \\text{m/s}$ (since $\\sin^2 + \\cos^2 = 1$).'].concat(want === 'a' ? [
          '$\\vec{a} = \\dfrac{d\\vec{v}}{dt} = -' + gx(fix(Rr * w * w)) + '\\langle \\cos(' + gx(w) + 't), \\sin(' + gx(w) + 't) \\rangle = -' + gx(fix(w * w)) + '\\vec{r}$: it points to the center.',
          '$|\\vec{a}| = ' + qg(fix(Rr * w * w), 'ms2') + '$, which equals $v^2/r = ' + gx(fix(Rr * w)) + '^2/' + gx(Rr) + '$.'] : ['The speed is constant, but the direction keeps turning.']),
        'Differentiate each component.', want === 'v' ? 'ms' : 'ms2', { k: 'vec', x: plainNum(Rr) + '*cos(' + w + 't)', y: plainNum(Rr) + '*sin(' + w + 't)', t: 0.7, want: want === 'v' ? 'speed' : 'amag' });
    }
    var cx = [R.nz(-3, 3), R.int(-5, 5), R.int(-5, 5)], cy = R.pick([[R.nz(-2, 2), R.int(-4, 4), R.int(-6, 6), R.int(-3, 3)], [R.nz(-4, 4), R.int(-6, 6), R.int(0, 5)]]);
    var t1 = R.int(1, 3), vx = polyAt(polyD(cx), t1), vy = polyAt(polyD(cy), t1), ax = polyAt(polyD(polyD(cx)), t1), ay = polyAt(polyD(polyD(cy)), t1);
    if (vx === 0 && vy === 0) { cx[1] += 1; vx = polyAt(polyD(cx), t1); }
    var rdef = '$\\vec{r}(t) = \\left\\langle ' + poly(cx) + ',\\ ' + poly(cy) + ' \\right\\rangle$ (meters, seconds)';
    var vline = '$\\vec{v}(t) = \\left\\langle ' + poly(polyD(cx)) + ',\\ ' + poly(polyD(cy)) + ' \\right\\rangle$';
    var chk = { k: 'vec', x: polyPlain(cx), y: polyPlain(cy), t: t1 };
    if (shape === 'vvec') return P('A drone flies with position ' + rdef + '. Find its velocity vector at $t = ' + t1 + '\\ \\text{s}$, in m/s.',
      { t: 'tuple', v: [String(vx), String(vy)] },
      ['Differentiate each component: ' + vline + '.', 'At $t = ' + t1 + '$: $\\vec{v} = \\langle ' + subst(polyD(cx), t1) + ',\\ ' + subst(polyD(cy), t1) + ' \\rangle = \\langle ' + vx + ', ' + vy + ' \\rangle\\ \\text{m/s}$.'],
      'Take the derivative of the $x$-part and of the $y$-part separately.', null, Object.assign(chk, { want: 'v' }));
    if (shape === 'avec') return P('A drone flies with position ' + rdef + '. Find its acceleration vector at $t = ' + t1 + '\\ \\text{s}$, in m/s².',
      { t: 'tuple', v: [String(ax), String(ay)] },
      ['Velocity: ' + vline + '.', 'Acceleration: $\\vec{a}(t) = \\left\\langle ' + poly(polyD(polyD(cx))) + ',\\ ' + poly(polyD(polyD(cy))) + ' \\right\\rangle$.', 'At $t = ' + t1 + '$: $\\vec{a} = \\langle ' + ax + ', ' + ay + ' \\rangle\\ \\text{m/s}^2$.'],
      'Differentiate each component twice.', null, Object.assign(chk, { want: 'a' }));
    var sp = M.hypot(vx, vy);
    if (shape === 'speed') return P('A drone flies with position ' + rdef + '. Find its speed at $t = ' + t1 + '\\ \\text{s}$.',
      ans(sp, 0.01),
      ['Velocity: ' + vline + '.', 'At $t = ' + t1 + '$: $\\vec{v} = \\langle ' + vx + ', ' + vy + ' \\rangle\\ \\text{m/s}$.', 'Speed $= |\\vec{v}| = \\sqrt{' + pn(vx) + '^2 + ' + pn(vy) + '^2} = ' + qx(sp, 'ms') + '$.'],
      'Speed is the length of the velocity vector.', 'ms', Object.assign(chk, { want: 'speed' }));
    // angle between v and a (falls back to the speed question when they are nearly parallel)
    var cosang = (vx * ax + vy * ay) / (M.hypot(vx, vy) * M.hypot(ax, ay)), ang = deg(M.acos(M.max(-1, M.min(1, cosang))));
    if (!(ang > 3 && ang < 177)) return P('A drone flies with position ' + rdef + '. Find its speed at $t = ' + t1 + '\\ \\text{s}$.',
      ans(sp, 0.01),
      ['Velocity: ' + vline + '.', 'At $t = ' + t1 + '$: $\\vec{v} = \\langle ' + vx + ', ' + vy + ' \\rangle\\ \\text{m/s}$.', 'Speed $= |\\vec{v}| = \\sqrt{' + pn(vx) + '^2 + ' + pn(vy) + '^2} = ' + qx(sp, 'ms') + '$.'],
      'Speed is the length of the velocity vector.', 'ms', Object.assign(chk, { want: 'speed' }));
    return P('A drone flies with position ' + rdef + '. Find the angle between its velocity and its acceleration at $t = ' + t1 + '\\ \\text{s}$.',
      ans(ang, 0.01),
      ['$\\vec{v}(' + t1 + ') = \\langle ' + vx + ', ' + vy + ' \\rangle$ and $\\vec{a}(' + t1 + ') = \\langle ' + ax + ', ' + ay + ' \\rangle$.',
        '$\\cos\\theta = \\dfrac{\\vec{v}\\cdot\\vec{a}}{|\\vec{v}||\\vec{a}|} = \\dfrac{' + (vx * ax + vy * ay) + '}{' + fx(M.hypot(vx, vy), 4) + '\\cdot ' + fx(M.hypot(ax, ay), 4) + '} = ' + fx(cosang, 4) + '$.',
        '$\\theta = ' + qx(ang, 'deg') + '$. ' + (ang < 90 ? 'Under 90°: the drone is speeding up while its path bends.' : 'Over 90°: the drone is slowing down while its path bends.')],
      'Use the dot product of $\\vec{v}$ and $\\vec{a}$.', 'deg', Object.assign(chk, { want: 'angle' }));
  });

  G('mech.projectile-optimization', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['top', 'range'], ['top', 'range', 'rmax', 'vtop'], ['cliff', 'cliffang', 'top', 'range']));
    var v0 = R.pick([10, 12, 14, 15, 18, 20, 24, 25, 30]), th = R.pick([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]), s = M.sin(rad(th)), c = M.cos(rad(th));
    if (shape === 'top' || shape === 'vtop') {
      var vy = v0 * s, ttop = vy / g0, H = vy * vy / (2 * g0), vx = v0 * c;
      if (shape === 'vtop') return P('A ball is launched at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground. What is its speed at the highest point of its path? (No air resistance.)',
        ans(vx, 0.01),
        ['At the top, $\\dfrac{dy}{dt} = v_y = 0$; only the <b>vertical</b> part of the velocity is zero.', 'The horizontal part never changes: $v_x = v_0\\cos\\theta = ' + v0 + '\\cos ' + th + '^\\circ = ' + qx(vx, 'ms') + '$.', 'So the speed at the top is $' + qx(vx, 'ms') + '$, not zero.'],
        'Which part of the velocity is zero at the top?', 'ms', { k: 'proj', v0: v0, th: th, h: 0, want: 'vtop' });
      return P('A ball is launched at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground, with $y(t) = (v_0\\sin\\theta)t - 4.9t^2$. Use $dy/dt = 0$ to find its maximum height.',
        ans(H, 0.01),
        ['$\\dfrac{dy}{dt} = v_0\\sin\\theta - 9.8t = 0$ at $t_{\\text{top}} = \\dfrac{' + v0 + '\\sin ' + th + '^\\circ}{9.8} = ' + qx(ttop, 's') + '$.',
          '$H = y(t_{\\text{top}}) = \\dfrac{(v_0\\sin\\theta)^2}{2g} = \\dfrac{(' + fx(vy, 4) + ')^2}{2(9.8)} = ' + qx(H, 'm') + '$.'],
        'The height is greatest when its derivative, $v_y$, is zero.', 'm', { k: 'proj', v0: v0, th: th, h: 0, want: 'H' });
    }
    if (shape === 'range') {
      var Rg = v0 * v0 * M.sin(rad(2 * th)) / g0;
      return P('A ball is launched at $' + v0 + '\\ \\text{m/s}$ at $' + th + '^\\circ$ above level ground. How far away does it land? (No air resistance.)',
        ans(Rg, 0.01),
        ['$y(t) = (v_0\\sin\\theta)t - \\tfrac{1}{2}gt^2 = 0$ again at $t = \\dfrac{2v_0\\sin\\theta}{g}$.', 'Range $R = (v_0\\cos\\theta)\\cdot\\dfrac{2v_0\\sin\\theta}{g} = \\dfrac{v_0^2\\sin 2\\theta}{g}$.',
          '$R = \\dfrac{' + v0 + '^2\\sin ' + (2 * th) + '^\\circ}{9.8} = ' + qx(Rg, 'm') + '$.'],
        'Find the flight time from $y = 0$, then multiply by $v_x$.', 'm', { k: 'proj', v0: v0, th: th, h: 0, want: 'R' });
    }
    if (shape === 'rmax') {
      var Rm = v0 * v0 / g0;
      return P('What is the greatest distance a ball launched at $' + v0 + '\\ \\text{m/s}$ from level ground can travel before landing? (No air resistance.)',
        ans(Rm, 0.01),
        ['$R(\\theta) = \\dfrac{v_0^2\\sin 2\\theta}{g}$. Set $\\dfrac{dR}{d\\theta} = \\dfrac{2v_0^2\\cos 2\\theta}{g} = 0$: $2\\theta = 90^\\circ$, so $\\theta = 45^\\circ$.',
          '$R_{\\max} = \\dfrac{v_0^2}{g} = \\dfrac{' + v0 + '^2}{9.8} = ' + qx(Rm, 'm') + '$.'],
        'Maximize $R(\\theta)$ by setting its derivative to zero.', 'm', { k: 'proj', v0: v0, h: 0, want: 'Rmax' });
    }
    // from a height h
    var h = R.pick([5, 10, 15, 20, 30, 40]), v1 = R.pick([10, 12, 15, 20]), root = M.sqrt(v1 * v1 + 2 * g0 * h), ths = deg(M.atan(v1 / root)), Rmx = v1 / g0 * root;
    if (shape === 'cliffang') return P('A ball is thrown at $' + v1 + '\\ \\text{m/s}$ from the top of a cliff $' + h + '\\ \\text{m}$ above level ground. Optimizing the range gives $\\tan\\theta^* = \\dfrac{v_0}{\\sqrt{v_0^2 + 2gh}}$. At what angle above horizontal should it be thrown to land as far away as possible?',
      ans(ths, 0.01),
      ['$\\sqrt{v_0^2 + 2gh} = \\sqrt{' + v1 + '^2 + 2(9.8)(' + h + ')} = ' + fx(root, 4) + '\\ \\text{m/s}$, the speed on landing.',
        '$\\tan\\theta^* = \\dfrac{' + v1 + '}{' + fx(root, 4) + '} = ' + fx(v1 / root, 4) + '$, so $\\theta^* = ' + qx(ths, 'deg') + '$.',
        'This is less than $45^\\circ$: launching from a height, a flatter throw gains more from the extra fall time.'],
      'Substitute into the formula, then take the inverse tangent.', 'deg', { k: 'proj', v0: v1, h: h, want: 'thstar' });
    return P('A ball is thrown at $' + v1 + '\\ \\text{m/s}$ from the top of a cliff $' + h + '\\ \\text{m}$ above level ground. Its greatest possible range is $R_{\\max} = \\dfrac{v_0}{g}\\sqrt{v_0^2 + 2gh}$. Find it.',
      ans(Rmx, 0.01),
      ['$\\sqrt{v_0^2 + 2gh} = \\sqrt{' + (v1 * v1) + ' + ' + gx(2 * g0 * h) + '} = ' + fx(root, 4) + '\\ \\text{m/s}$.', '$R_{\\max} = \\dfrac{' + v1 + '}{9.8}(' + fx(root, 4) + ') = ' + qx(Rmx, 'm') + '$, reached at $\\theta^* = ' + fx(ths, 3) + '^\\circ$, less than $45^\\circ$.'],
      'Substitute $v_0$, $g$ and $h$.', 'm', { k: 'proj', v0: v1, h: h, want: 'Rmax' });
  });

  G('mech.galilean-frames', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['walk', 'accel', 'walk'], ['walk', 'rain', 'accel', 'vec'], ['rain', 'vec', 'wind', 'accel']));
    if (shape === 'walk') {
      var u = R.pick([12, 15, 20, 25, 30]), w = R.pick([-3, -2, -1.5, 1.5, 2, 3]), what = R.pick(['ground', 'train']);
      if (what === 'ground') return P('A train moves east at $' + u + '\\ \\text{m/s}$ relative to the ground. A passenger walks ' + (w > 0 ? 'toward the front' : 'toward the back') + ' at $' + gx(M.abs(w)) + '\\ \\text{m/s}$ relative to the train. What is her velocity relative to the ground? (East positive.)',
        ans(u + w, 0.01),
        ['Galilean addition: $v_{\\text{ground}} = v_{\\text{train frame}} + u$.', '$v = ' + pn(w) + ' + ' + u + ' = ' + qg(fix(u + w), 'ms') + '$ (east).'],
        'Add the frame\'s velocity to the velocity measured in the frame.', 'ms', { k: 'gal1', v: w, u: u, dir: 'toGround' });
      var vb = R.pick([5, 10, 30, 40]) * R.pick([1, -1]);
      return P('A train moves east at $' + u + '\\ \\text{m/s}$. A car on the road beside it moves ' + (vb > 0 ? 'east' : 'west') + ' at $' + M.abs(vb) + '\\ \\text{m/s}$ relative to the ground. What is the car\'s velocity measured by a passenger in the train? (East positive.)',
        ans(vb - u, 0.01),
        ['In the train\'s frame, $v\' = v - u$.', '$v\' = ' + pn(vb) + ' - ' + u + ' = ' + qg(vb - u, 'ms') + '$' + (vb - u < 0 ? ': the car moves west relative to the train.' : '.')],
        'Subtract the frame\'s velocity.', 'ms', { k: 'gal1', v: vb, u: u, dir: 'toFrame' });
    }
    if (shape === 'accel') {
      var uu = R.pick([20, 25, 30, 40]);
      return P('A train moves along a straight, level track at a steady $' + uu + '\\ \\text{m/s}$. A passenger drops a ball. What is the size of the ball\'s acceleration as measured by the passenger? (No air resistance; $g = 9.8\\ \\text{m/s}^2$.)',
        ans(9.8, 0.01),
        ['In the train\'s frame, $\\vec{r}\\,\' = \\vec{r} - \\vec{u}t$, so $\\vec{v}\\,\' = \\vec{v} - \\vec{u}$.', 'Differentiate again: $\\vec{a}\\,\' = \\vec{a} - \\dfrac{d\\vec{u}}{dt} = \\vec{a}$, because $\\vec{u}$ is constant.',
          'So the passenger measures the same $9.8\\ \\text{m/s}^2$ downward as someone on the ground; the ball falls straight down at her feet.'],
        'Differentiate $\\vec{v}\\,\' = \\vec{v} - \\vec{u}$ when $\\vec{u}$ is constant.', 'ms2', { k: 'galA', u: uu });
    }
    if (shape === 'rain') {
      var vr = R.pick([4, 5, 6, 8, 10]), vc = R.pick([5, 8, 10, 12, 15, 20]), ang = deg(M.atan(vc / vr)), ask = R.pick(['ang', 'speed']), spd = M.hypot(vr, vc);
      if (ask === 'ang') return P('Rain falls straight down at $' + vr + '\\ \\text{m/s}$. A car drives through it at $' + vc + '\\ \\text{m/s}$. At what angle from vertical do the raindrops streak across the car\'s side window?',
        ans(ang, 0.01),
        ['In the car\'s frame, $\\vec{v}_{\\text{rain}}\' = \\vec{v}_{\\text{rain}} - \\vec{v}_{\\text{car}} = \\langle -' + vc + ', -' + vr + ' \\rangle\\ \\text{m/s}$ (forward and up positive).',
          'The angle from vertical has $\\tan\\phi = \\dfrac{' + vc + '}{' + vr + '}$, so $\\phi = ' + qx(ang, 'deg') + '$, slanting backward.'],
        'Subtract the car\'s velocity from the rain\'s.', 'deg', { k: 'rain', vr: vr, vc: vc, want: 'ang' });
      return P('Rain falls straight down at $' + vr + '\\ \\text{m/s}$. A car drives through it at $' + vc + '\\ \\text{m/s}$. How fast do the raindrops move as seen from inside the car?',
        ans(spd, 0.01),
        ['$\\vec{v}_{\\text{rain}}\' = \\vec{v}_{\\text{rain}} - \\vec{v}_{\\text{car}} = \\langle -' + vc + ', -' + vr + ' \\rangle\\ \\text{m/s}$.', '$|\\vec{v}\\,\'| = \\sqrt{' + vc + '^2 + ' + vr + '^2} = ' + qx(spd, 'ms') + '$.'],
        'Subtract the car\'s velocity from the rain\'s, then find the length.', 'ms', { k: 'rain', vr: vr, vc: vc, want: 'speed' });
    }
    if (shape === 'vec') {
      var ux = R.int(-4, 4), uy = R.int(-4, 4), cx = [R.nz(-2, 3), R.int(-4, 4), 0], cy = [R.int(-3, 3), R.int(-5, 5)], t1 = R.int(1, 3);
      if (!ux && !uy) ux = 3;
      var vx = polyAt(polyD(cx), t1) - ux, vy = polyAt(polyD(cy), t1) - uy;
      return P('In the ground frame a puck has position $\\vec{r}(t) = \\left\\langle ' + poly(cx) + ',\\ ' + poly(cy) + ' \\right\\rangle$ (meters, seconds). A second frame moves at constant velocity $\\vec{u} = \\langle ' + ux + ', ' + uy + ' \\rangle\\ \\text{m/s}$. Find the puck\'s velocity at $t = ' + t1 + '\\ \\text{s}$ in the moving frame, in m/s.',
        { t: 'tuple', v: [String(vx), String(vy)] },
        ['Ground-frame velocity: $\\vec{v} = \\left\\langle ' + poly(polyD(cx)) + ',\\ ' + poly(polyD(cy)) + ' \\right\\rangle$, which at $t = ' + t1 + '$ is $\\langle ' + polyAt(polyD(cx), t1) + ', ' + polyAt(polyD(cy), t1) + ' \\rangle$.',
          'In the moving frame $\\vec{r}\\,\' = \\vec{r} - \\vec{u}t$, so $\\vec{v}\\,\' = \\vec{v} - \\vec{u} = \\langle ' + vx + ', ' + vy + ' \\rangle\\ \\text{m/s}$.'],
        'Differentiate, then subtract the frame velocity.', null, { k: 'galvec', x: polyPlain(cx), y: polyPlain(cy), ux: ux, uy: uy, t: t1 });
    }
    // wind: plane heading north at airspeed va, wind from west (blowing east) at vw
    var va = R.pick([60, 80, 100, 120, 150]), vw = R.pick([15, 20, 25, 30, 40]), gs = M.hypot(va, vw), want = R.pick(['speed', 'ang']), drift = deg(M.atan(vw / va));
    return P('A small plane points due north with an airspeed of $' + va + '\\ \\text{m/s}$. The air moves east at $' + vw + '\\ \\text{m/s}$ relative to the ground. ' + (want === 'speed' ? 'Find the plane\'s speed relative to the ground.' : 'By what angle east of north does its path over the ground drift?'),
      ans(want === 'speed' ? gs : drift, 0.01),
      ['The air is a frame moving at $\\vec{u} = \\langle ' + vw + ', 0 \\rangle$; the plane\'s velocity in that frame is $\\langle 0, ' + va + ' \\rangle$.', 'Ground velocity: $\\vec{v} = \\vec{v}\\,\' + \\vec{u} = \\langle ' + vw + ', ' + va + ' \\rangle\\ \\text{m/s}$.',
        want === 'speed' ? '$|\\vec{v}| = \\sqrt{' + vw + '^2 + ' + va + '^2} = ' + qx(gs, 'ms') + '$.' : '$\\tan\\phi = \\dfrac{' + vw + '}{' + va + '}$, so $\\phi = ' + qx(drift, 'deg') + '$ east of north.'],
      'Add the air\'s velocity to the plane\'s velocity through the air.', want === 'speed' ? 'ms' : 'deg', { k: 'wind', va: va, vw: vw, want: want });
  });

  G('mech.tangential-normal-acceleration', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mag', 'mag', 'arc'], ['mag', 'arc', 'mag', 'angle'], ['arc', 'angle', 'when', 'arc']));
    if (shape === 'mag' || shape === 'angle') {
      var r = R.pick([20, 25, 40, 50, 80, 100]), v0 = R.pick([5, 8, 10, 12, 15]), b = R.pick([1, 1.5, 2, 2.5, 3]) * R.pick([1, -1]), t1 = R.int(1, 3), v = v0 + b * t1;
      if (v <= 1) { b = M.abs(b); v = v0 + b * t1; }
      var ac = v * v / r, a = M.hypot(ac, b), ang = deg(M.atan2(ac, b));
      var base = 'A car on a curve of radius $' + r + '\\ \\text{m}$ has speed $v(t) = ' + v0 + (b > 0 ? ' + ' : ' - ') + cf(M.abs(b)) + 't$ ($v$ in m/s, $t$ in seconds). ';
      var st = ['Tangential part: $a_t = \\dfrac{dv}{dt} = ' + gx(b) + '\\ \\text{m/s}^2$ (along the path, ' + (b > 0 ? 'forward: speeding up' : 'backward: slowing down') + ').',
        'At $t = ' + t1 + '$: $v = ' + gx(v) + '\\ \\text{m/s}$, so the centripetal part is $a_c = \\dfrac{v^2}{r} = \\dfrac{' + gx(v) + '^2}{' + r + '} = ' + qx(ac, 'ms2', 4) + '$ (toward the center).'];
      if (shape === 'angle') return P(base + 'At $t = ' + t1 + '\\ \\text{s}$, what angle does the acceleration make with the velocity?',
        ans(ang, 0.01), st.concat(['The two parts are perpendicular. The angle from the velocity direction is $\\theta = \\arctan\\dfrac{a_c}{a_t}$, measured from the forward direction: $\\theta = ' + qx(ang, 'deg') + '$.', ang > 90 ? 'More than $90^\\circ$, because the car is slowing down.' : 'Less than $90^\\circ$, because the car is speeding up.']),
        'Find both parts; the angle is set by their ratio and signs.', 'deg', { k: 'circ', r: r, s: polyPlain([b / 2, v0, 0]), t: t1, want: 'ang' });
      return P(base + 'Find the magnitude of its acceleration at $t = ' + t1 + '\\ \\text{s}$.',
        ans(a, 0.01), st.concat(['They are perpendicular, so $|\\vec{a}| = \\sqrt{a_t^2 + a_c^2} = \\sqrt{' + pf(b) + '^2 + ' + fx(ac, 4) + '^2} = ' + qx(a, 'ms2') + '$.']),
        'Add the tangential and centripetal parts as perpendicular vectors.', 'ms2', { k: 'circ', r: r, s: polyPlain([b / 2, v0, 0]), t: t1, want: 'a' });
    }
    if (shape === 'arc') {
      var rr = R.pick([4, 5, 8, 10, 12, 16]), cc = R.pick([0.5, 1, 1.5, 2]), p = R.pick([2, 3]), t2 = p === 3 ? R.int(1, 2) : R.int(1, 3), want = R.pick(['a', 'ac']);
      var vv = p * cc * M.pow(t2, p - 1), at = p * (p - 1) * cc * M.pow(t2, p - 2), acc = vv * vv / rr, amag = M.hypot(at, acc);
      return P('A bead slides along a circular wire of radius $' + rr + '\\ \\text{m}$. The distance it has traveled along the wire is $s(t) = ' + cf(cc) + 't^' + p + '$ (meters, seconds). Find ' + (want === 'a' ? 'the magnitude of its total acceleration' : 'its centripetal acceleration') + ' at $t = ' + t2 + '\\ \\text{s}$.',
        ans(want === 'a' ? amag : acc, 0.01),
        ['Speed: $v = \\dfrac{ds}{dt} = ' + cf(fix(p * cc)) + (p === 3 ? 't^2' : 't') + '$, so $v(' + t2 + ') = ' + gx(vv) + '\\ \\text{m/s}$.',
          'Tangential: $a_t = \\dfrac{dv}{dt} = ' + (p === 3 ? cf(fix(6 * cc)) + 't' : gx(fix(2 * cc))) + ' = ' + gx(at) + '\\ \\text{m/s}^2$ at $t = ' + t2 + '$.',
          'Centripetal: $a_c = \\dfrac{v^2}{r} = \\dfrac{' + gx(vv) + '^2}{' + rr + '} = ' + qx(acc, 'ms2', 4) + '$.'].concat(want === 'a' ? ['$|\\vec{a}| = \\sqrt{' + gx(at) + '^2 + ' + fx(acc, 4) + '^2} = ' + qx(amag, 'ms2') + '$.'] : []),
        'Differentiate $s(t)$ for the speed; $v^2/r$ gives the centripetal part.', 'ms2', { k: 'circ', r: rr, s: plainNum(cc) + '*t^' + p, t: t2, want: want });
    }
    // when: from rest, a_t = b constant; when does a_c equal a_t?
    var rw = R.pick([4, 9, 16, 25, 36, 50, 100]), bw = R.pick([1, 2, 4]), tw = M.sqrt(rw / bw);
    return P('A racing car starts from rest on a circular track of radius $' + rw + '\\ \\text{m}$ and speeds up with a constant tangential acceleration of $' + bw + '\\ \\text{m/s}^2$. After how long is its centripetal acceleration equal to its tangential acceleration?',
      ans(tw, 0.01),
      ['Its speed is $v = ' + kt(bw) + '$, so $a_c = \\dfrac{v^2}{r} = \\dfrac{' + kt(bw * bw) + '^2}{' + rw + '}$.', 'Set $a_c = a_t$: $\\dfrac{' + kt(bw * bw) + '^2}{' + rw + '} = ' + bw + '$, so $t^2 = \\dfrac{' + rw + '}{' + bw + '}$.', '$t = ' + qx(tw, 's') + '$. After that the centripetal part is the larger one.'],
      'Write $a_c$ as a function of time.', 's', { k: 'circ', r: rw, s: plainNum(bw / 2) + '*t^2', want: 'tEqual', b: bw });
  });


  // ================================================================== UNIT 2: FORCES WITH CALCULUS
  G('mech.time-varying-force', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['lin', 'lin', 'down'], ['lin', 'down', 'x', 'down'], ['sin', 'exp', 'x', 'down']));
    var m = R.pick([2, 4, 5, 8, 10]);
    if (shape === 'lin' || shape === 'x') {
      var b = R.pick([2, 3, 4, 6, 8, 10]), T1 = R.int(2, 6), v0 = shape === 'x' ? 0 : R.pick([0, 0, 1, 2, 3]), vT = v0 + b * T1 * T1 / (2 * m), xT = b * T1 * T1 * T1 / (6 * m);
      if (shape === 'x') return P('A $' + m + '\\ \\text{kg}$ cart starts from rest on a frictionless track. A motor pushes it with a force $F(t) = ' + kt(b) + '$ ($F$ in newtons, $t$ in seconds). How far has it moved at $t = ' + T1 + '\\ \\text{s}$?',
        ans(xT, 0.01),
        ['$a(t) = \\dfrac{F}{m} = \\dfrac{' + kt(b) + '}{' + m + '} = ' + kt(fix(b / m)) + '\\ \\text{m/s}^2$.', 'Integrate from rest: $v(t) = ' + cf(fix(b / (2 * m))) + 't^2$.', 'Integrate again from $x = 0$: $x(t) = ' + cf(fix(b / (6 * m))) + 't^3$.', '$x(' + T1 + ') = ' + gx(fix(b / (6 * m))) + '(' + T1 + ')^3 = ' + qx(xT, 'm') + '$.'],
        'Find $a(t) = F(t)/m$, then integrate twice.', 'm', { k: 'ivp', a: b + '*t/' + m, v0: 0, x0: 0, T: T1, want: 'x' });
      return P('A $' + m + '\\ \\text{kg}$ cart on a frictionless track moves at $' + v0 + '\\ \\text{m/s}$ at $t = 0$. A motor then pushes it forward with a force $F(t) = ' + kt(b) + '$ ($F$ in newtons, $t$ in seconds). How fast is it moving at $t = ' + T1 + '\\ \\text{s}$?',
        ans(vT, 0.01),
        ['Newton\'s second law: $a(t) = \\dfrac{F(t)}{m} = ' + kt(fix(b / m)) + '\\ \\text{m/s}^2$.', '$v(' + T1 + ') = v_0 + \\int_0^{' + T1 + '} ' + kt(fix(b / m)) + '\\,dt = ' + v0 + ' + ' + gx(fix(b / (2 * m))) + '(' + T1 + ')^2 = ' + qx(vT, 'ms') + '$.',
          'Using the final force $' + (b * T1) + '\\ \\text{N}$ for the whole time would give $' + gx(fix(v0 + b * T1 * T1 / m)) + '\\ \\text{m/s}$, twice the gain, because the push was smaller early on.'],
        'The force changes, so integrate $F(t)/m$; don\'t use the final force for the whole time.', 'ms', { k: 'ivp', a: b + '*t/' + m, v0: v0, x0: 0, T: T1, want: 'v' });
    }
    if (shape === 'down') {
      var F0 = R.pick([20, 30, 40, 60, 80]), k = R.pick([5, 10, 20]), Te = F0 / k, v0d = R.pick([0, 1, 2]), vend = v0d + F0 * F0 / (2 * k * m);
      return P('A $' + m + '\\ \\text{kg}$ block on frictionless ice moves at $' + v0d + '\\ \\text{m/s}$. Starting at $t = 0$, a push $F(t) = ' + F0 + ' - ' + kt(k) + '$ (newtons, seconds) acts along its motion until the force reaches zero. How fast is the block moving then?',
        ans(vend, 0.01),
        ['The force reaches zero at $t = \\dfrac{' + F0 + '}{' + k + '} = ' + gx(Te) + '\\ \\text{s}$.', '$\\Delta v = \\dfrac{1}{m}\\int_0^{' + gx(Te) + '} (' + F0 + ' - ' + kt(k) + ')\\,dt = \\dfrac{1}{' + m + '}\\left[' + F0 + 't - ' + cf(fix(k / 2)) + 't^2\\right]_0^{' + gx(Te) + '} = \\dfrac{' + gx(F0 * F0 / (2 * k)) + '}{' + m + '} = ' + qx(vend - v0d, 'ms', 4) + '$.',
          '$v = ' + v0d + ' + ' + fx(vend - v0d, 4) + ' = ' + qx(vend, 'ms') + '$.'],
        'Find when the force stops, then integrate $F/m$ over that time.', 'ms', { k: 'ivp', a: '(' + F0 + '-' + k + '*t)/' + m, v0: v0d, x0: 0, T: Te, want: 'v' });
    }
    if (shape === 'sin') {
      var Fs = R.pick([100, 200, 300, 500]), tau = R.pick([0.05, 0.1, 0.2]), ms = R.pick([0.5, 1, 2]), dv = 2 * Fs * tau / (PI * ms);
      return P('A bat pushes a $' + gx(ms) + '\\ \\text{kg}$ ball, initially at rest, with a force $F(t) = ' + Fs + '\\sin\\left(\\dfrac{\\pi t}{' + gx(tau) + '}\\right)$ newtons for $0 \\le t \\le ' + gx(tau) + '\\ \\text{s}$. What is the ball\'s speed when the push ends? (Ignore gravity during the push.)',
        ans(dv, 0.02),
        ['$\\Delta v = \\dfrac{1}{m}\\int_0^{' + gx(tau) + '} ' + Fs + '\\sin\\left(\\dfrac{\\pi t}{' + gx(tau) + '}\\right)dt = \\dfrac{1}{m}\\cdot ' + Fs + '\\cdot\\dfrac{' + gx(tau) + '}{\\pi}\\left[-\\cos\\left(\\dfrac{\\pi t}{' + gx(tau) + '}\\right)\\right]_0^{' + gx(tau) + '}$.',
          'The bracket is $-(-1) - (-1) = 2$, so $\\Delta v = \\dfrac{2(' + Fs + ')(' + gx(tau) + ')}{\\pi(' + gx(ms) + ')} = ' + qx(dv, 'ms') + '$.'],
        'Integrate the force over the push, then divide by the mass.', 'ms', { k: 'ivp', a: Fs + '*sin(pi*t/' + tau + ')/' + ms, v0: 0, x0: 0, T: tau, want: 'v' });
    }
    var Fe = R.pick([10, 20, 40, 60]), te = R.pick([2, 3, 4, 5]), me = R.pick([2, 4, 5, 10]), T2 = R.pick([2, 4, 6, 10]), ve = Fe * te / me * (1 - M.exp(-T2 / te));
    return P('A $' + me + '\\ \\text{kg}$ sled starts from rest on frictionless ice. A fading gust of wind pushes it with $F(t) = ' + Fe + 'e^{-t/' + te + '}$ (newtons, seconds). How fast is it moving at $t = ' + T2 + '\\ \\text{s}$?',
      ans(ve, 0.02),
      ['$v(t) = \\dfrac{1}{m}\\int_0^t ' + Fe + 'e^{-t\'/' + te + '}\\,dt\' = \\dfrac{' + Fe + '(' + te + ')}{' + me + '}\\left(1 - e^{-t/' + te + '}\\right)$.', '$v(' + T2 + ') = ' + gx(fix(Fe * te / me)) + '\\left(1 - e^{-' + gx(fix(T2 / te)) + '}\\right) = ' + qx(ve, 'ms') + '$.'],
      'An antiderivative of $e^{-t/\\tau}$ is $-\\tau e^{-t/\\tau}$.', 'ms', { k: 'ivp', a: Fe + '*e^(-t/' + te + ')/' + me, v0: 0, x0: 0, T: T2, want: 'v' });
  });

  G('mech.linear-drag', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['vT', 'tau', 'vT'], ['vt', 'tfrac', 'vT', 'coastx'], ['tfrac', 'vt', 'coastv', 'coastx']));
    var m = R.pick([0.02, 0.05, 0.1, 0.2]), b = R.pick([0.05, 0.1, 0.2, 0.4, 0.5]), vT = m * g0 / b, tau = m / b;
    var intro = 'A small sphere of mass $' + qg(m, 'kg') + '$ sinks through thick oil, which pushes back with a drag force $F = -bv$, where $b = ' + qg(b, 'Nsm') + '$. Ignore buoyancy. ';
    if (shape === 'vT') return P(intro + 'What is its terminal speed?',
      ans(vT, 0.01),
      ['Newton\'s second law (down positive): $m\\dfrac{dv}{dt} = mg - bv$.', 'At terminal speed the velocity stops changing, so $mg - bv_T = 0$.', '$v_T = \\dfrac{mg}{b} = \\dfrac{(' + gx(m) + ')(9.8)}{' + gx(b) + '} = ' + qx(vT, 'ms') + '$.'],
      'At terminal speed, the net force is zero.', 'ms', { k: 'ldrag', m: m, b: b, want: 'vT' });
    if (shape === 'tau') return P(intro + 'Its speed approaches terminal speed as $v(t) = v_T\\left(1 - e^{-t/\\tau}\\right)$. Find the time constant $\\tau$.',
      ans(tau, 0.01),
      ['Rewrite the equation of motion: $\\dfrac{dv}{dt} = g - \\dfrac{b}{m}v = \\dfrac{b}{m}(v_T - v)$.', 'The gap $v_T - v$ shrinks by a factor of $e$ every $\\tau = \\dfrac{m}{b}$ seconds.', '$\\tau = \\dfrac{' + gx(m) + '}{' + gx(b) + '} = ' + qx(tau, 's') + '$.'],
      'Compare $dv/dt = (b/m)(v_T - v)$ with exponential decay.', 's', { k: 'ldrag', m: m, b: b, want: 'tau' });
    if (shape === 'vt') {
      var t1 = sgf(tau * R.pick([0.5, 1, 1.5, 2, 3]), 2), v1 = vT * (1 - M.exp(-t1 / tau));
      return P(intro + 'Dropped from rest, how fast is it moving after $' + qg(t1, 's') + '$?',
        ans(v1, 0.02),
        ['Separate $\\dfrac{dv}{v_T - v} = \\dfrac{dt}{\\tau}$ and integrate from $v = 0$: $v(t) = v_T\\left(1 - e^{-t/\\tau}\\right)$.', '$v_T = \\dfrac{mg}{b} = ' + qx(vT, 'ms', 4) + '$ and $\\tau = \\dfrac{m}{b} = ' + qx(tau, 's', 4) + '$.',
          '$v(' + gx(t1) + ') = ' + fx(vT, 4) + '\\left(1 - e^{-' + fx(t1 / tau, 4) + '}\\right) = ' + qx(v1, 'ms') + '$.'],
        'Find $v_T$ and $\\tau$ first.', 'ms', { k: 'ldrag', m: m, b: b, t: t1, want: 'v' });
    }
    if (shape === 'tfrac') {
      var f = R.pick([0.5, 0.9, 0.95, 0.99]), tf = -tau * M.log(1 - f);
      return P(intro + 'Dropped from rest, how long does it take to reach $' + (f * 100) + '\\%$ of its terminal speed?',
        ans(tf, 0.02),
        ['$v(t) = v_T\\left(1 - e^{-t/\\tau}\\right)$ with $\\tau = \\dfrac{m}{b} = ' + qx(tau, 's', 4) + '$.', 'Set $v = ' + gx(f) + 'v_T$: $e^{-t/\\tau} = ' + gx(fix(1 - f)) + '$, so $t = -\\tau\\ln(' + gx(fix(1 - f)) + ') = ' + fx(-M.log(1 - f), 4) + '\\tau$.',
          '$t = ' + qx(tf, 's') + '$. It never reaches $100\\%$ exactly; it only gets closer and closer.'],
        'Set $1 - e^{-t/\\tau}$ equal to the fraction and solve for $t$.', 's', { k: 'ldrag', m: m, b: b, f: f, want: 'tfrac' });
    }
    // coasting horizontally: m dv/dt = -bv
    var mc_ = R.pick([0.5, 1, 2, 5]), bc = R.pick([0.5, 1, 2]), v0 = R.int(2, 8), tc = mc_ / bc;
    var introC = 'A $' + qg(mc_, 'kg') + '$ puck glides across a layer of thick grease at $' + qg(v0, 'ms') + '$. The only horizontal force is drag $F = -bv$ with $b = ' + qg(bc, 'Nsm') + '$. ';
    if (shape === 'coastv') { var t2 = R.pick([1, 2, 3]), v2 = v0 * M.exp(-t2 / tc);
      return P(introC + 'How fast is it moving after $' + qg(t2, 's') + '$?',
        ans(v2, 0.02),
        ['$m\\dfrac{dv}{dt} = -bv$, so $\\dfrac{dv}{v} = -\\dfrac{b}{m}dt$ and $v(t) = v_0e^{-t/\\tau}$ with $\\tau = \\dfrac{m}{b} = ' + qx(tc, 's', 4) + '$.', '$v(' + t2 + ') = ' + v0 + 'e^{-' + fx(t2 / tc, 4) + '} = ' + qx(v2, 'ms') + '$.'],
        'Separate variables: the speed decays exponentially.', 'ms', { k: 'ldrag', m: mc_, b: bc, v0: v0, g: 0, t: t2, want: 'v' }); }
    return P(introC + 'How far does it glide in total?',
      ans(v0 * tc, 0.02),
      ['$v(t) = v_0e^{-t/\\tau}$ with $\\tau = \\dfrac{m}{b} = ' + qx(tc, 's', 4) + '$. It never quite stops, but its distance adds up to a finite total.', '$x_{\\text{total}} = \\int_0^{\\infty} v_0e^{-t/\\tau}\\,dt = v_0\\tau = ' + v0 + '(' + fx(tc, 4) + ') = ' + qx(v0 * tc, 'm') + '$.'],
      'Integrate $v(t)$ from 0 to infinity.', 'm', { k: 'ldrag', m: mc_, b: bc, v0: v0, g: 0, want: 'xtot' });
  });

  G('mech.quadratic-drag', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['vT', 'vacuum', 'drag'], ['vT', 'ratio', 'drag', 'half'], ['vT', 'ratio', 'half', 'C']));
    var who = R.pick([{ n: 'skydiver', m: [60, 70, 80, 90], C: [1.0], A: [0.6, 0.7, 0.8] }, { n: 'skydiver diving head-first', m: [60, 70, 80], C: [0.7], A: [0.18, 0.2, 0.25] }, { n: 'baseball', m: [0.145], C: [0.3, 0.35], A: [0.0042] }, { n: 'soccer ball', m: [0.43], C: [0.25, 0.3], A: [0.038] }]);
    var m = R.pick(who.m), C = R.pick(who.C), A = R.pick(who.A), rho = 1.2, vT = M.sqrt(2 * m * g0 / (C * rho * A));
    var intro = 'A ' + who.n + ' (mass $' + qg(m, 'kg') + '$, drag coefficient $C = ' + gx(C) + '$, area $A = ' + qg(A, 'm2') + '$) falls through air of density $\\rho = 1.2\\ \\text{kg/m}^3$. ';
    if (shape === 'vT') return P(intro + 'What is its terminal speed?',
      ans(vT, 0.02),
      ['At terminal speed the drag balances the weight: $\\tfrac{1}{2}C\\rho Av_T^2 = mg$.', '$v_T = \\sqrt{\\dfrac{2mg}{C\\rho A}} = \\sqrt{\\dfrac{2(' + gx(m) + ')(9.8)}{(' + gx(C) + ')(1.2)(' + gx(A) + ')}} = ' + qx(vT, 'ms') + '$.'],
      'Set the drag force equal to the weight.', 'ms', { k: 'qdrag', m: m, C: C, A: A, rho: rho, want: 'vT' });
    if (shape === 'drag') { var v = sgf(vT * R.pick([0.3, 0.5, 0.6, 0.8]), 2), Fd = 0.5 * C * rho * A * v * v;
      return P(intro + 'What drag force acts on it when it falls at $' + qg(v, 'ms') + '$?',
        ans(Fd, 0.02),
        ['$F_D = \\tfrac{1}{2}C\\rho Av^2 = \\tfrac{1}{2}(' + gx(C) + ')(1.2)(' + gx(A) + ')(' + gx(v) + ')^2 = ' + qx(Fd, 'N') + '$.', 'Compare with its weight, $mg = ' + qx(m * g0, 'N') + '$: the drag is still smaller, so it is still speeding up.'],
        'Drag grows with the square of the speed.', 'N', { k: 'qdrag', m: m, C: C, A: A, rho: rho, v: v, want: 'F' }); }
    if (shape === 'half') return P(intro + 'At what speed is the drag force equal to half its weight?',
      ans(vT / M.SQRT2, 0.02),
      ['Terminal speed: $v_T = \\sqrt{\\dfrac{2mg}{C\\rho A}} = ' + qx(vT, 'ms', 4) + '$, where drag equals the full weight.', 'Drag is proportional to $v^2$, so half the drag needs $v^2 = \\tfrac{1}{2}v_T^2$.', '$v = \\dfrac{v_T}{\\sqrt{2}} = ' + qx(vT / M.SQRT2, 'ms') + '$.'],
      'Drag $\\propto v^2$.', 'ms', { k: 'qdrag', m: m, C: C, A: A, rho: rho, frac: 0.5, want: 'vfrac' });
    if (shape === 'C') { var vTm = sgf(vT, 2), Cm = 2 * m * g0 / (rho * A * vTm * vTm);
      return P('A ' + who.n + ' of mass $' + qg(m, 'kg') + '$ and cross-sectional area $' + qg(A, 'm2') + '$ reaches a terminal speed of $' + qg(vTm, 'ms') + '$ in air of density $1.2\\ \\text{kg/m}^3$. What is its drag coefficient $C$?',
        ans(Cm, 0.02),
        ['At terminal speed, $\\tfrac{1}{2}C\\rho Av_T^2 = mg$.', '$C = \\dfrac{2mg}{\\rho Av_T^2} = \\dfrac{2(' + gx(m) + ')(9.8)}{(1.2)(' + gx(A) + ')(' + gx(vTm) + ')^2} = ' + fx(Cm, 3) + '$.'],
        'Solve the terminal-speed balance for $C$.', null, { k: 'qdrag', m: m, A: A, rho: rho, vT: vTm, want: 'C' }); }
    if (shape === 'ratio') { var k = R.pick([4, 9, 2]);
      return P('Two balls have the same size and shape, so the same $C$ and $A$, but one is ' + k + ' times as massive as the other. In air (quadratic drag), what is the ratio of the heavy ball\'s terminal speed to the light ball\'s?',
        ans(M.sqrt(k), 0.01),
        ['$v_T = \\sqrt{\\dfrac{2mg}{C\\rho A}}$, so with $C$, $\\rho$ and $A$ the same, $v_T \\propto \\sqrt{m}$.', 'Ratio $= \\sqrt{' + k + '} = ' + fx(M.sqrt(k), 3) + '$.', 'In air the heavier ball does fall faster. In a vacuum both would fall together, with the same acceleration $g$.'],
        'How does $v_T$ depend on $m$?', null, { k: 'qdrag', ratio: k, want: 'ratio' }); }
    var heavy = R.pick(['a bowling ball', 'a steel ball', 'a hammer']), light = R.pick(['a ping-pong ball', 'a feather', 'a crumpled sheet of paper']);
    return P('In a vacuum chamber, ' + heavy + ' and ' + light + ' are released from rest at the same height at the same moment. Which statement is true?',
      mc('They land at the same time, because each accelerates at $g$.', [heavy.charAt(0).toUpperCase() + heavy.slice(1) + ' lands first, because gravity pulls harder on it.', light.charAt(0).toUpperCase() + light.slice(1) + ' lands first, because it has less inertia to overcome.', heavy.charAt(0).toUpperCase() + heavy.slice(1) + ' lands first, because heavier objects reach a higher terminal speed.']),
      ['With no air there is no drag. The only force is gravity: $F = mg$.', 'So $a = F/m = g$ for both: the larger pull on the heavier object is exactly matched by its larger inertia.', 'They fall side by side. In air, drag ($\\tfrac{1}{2}C\\rho Av^2$) matters more for the light object, which is why it falls behind there.'],
      'Without air, what forces act?', null, { k: 'mc' });
  });

  G('mech.banked-curves', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['design', 'flat', 'angle'], ['design', 'angle', 'vmax', 'N'], ['vmax', 'vmin', 'design', 'vmax']));
    var r = R.pick([40, 50, 60, 80, 100, 120, 150, 200]), th = R.pick([10, 12, 15, 18, 20, 25, 30]), s = M.sin(rad(th)), c = M.cos(rad(th)), tn = M.tan(rad(th));
    if (shape === 'flat') { var mu = R.pick([0.4, 0.5, 0.6, 0.7, 0.8]), vf = M.sqrt(mu * g0 * r);
      return P('A car rounds a flat (unbanked) curve of radius $' + qg(r, 'm') + '$. The coefficient of static friction between tires and road is $' + gx(mu) + '$. What is the fastest it can go without skidding?',
        ans(vf, 0.01),
        ['On a flat road, static friction alone supplies the centripetal force: $f_s = \\dfrac{mv^2}{r}$.', 'The most it can give is $\\mu_sN = \\mu_smg$, so $\\dfrac{mv_{\\max}^2}{r} = \\mu_smg$.', '$v_{\\max} = \\sqrt{\\mu_sgr} = \\sqrt{' + gx(mu) + '(9.8)(' + r + ')} = ' + qx(vf, 'ms') + '$.'],
        'Friction is the only inward force.', 'ms', { k: 'bank', r: r, th: 0, mu: mu, want: 'vmax' }); }
    if (shape === 'design') { var vd = M.sqrt(r * g0 * tn);
      return P('A highway curve of radius $' + qg(r, 'm') + '$ is banked at $' + th + '^\\circ$. At what speed can a car take it with no friction needed at all?',
        ans(vd, 0.01),
        ['With no friction, only the normal force and gravity act. Split $\\vec{N}$ into horizontal and vertical parts (the acceleration is horizontal, toward the center).', 'Vertical: $N\\cos\\theta = mg$. Horizontal: $N\\sin\\theta = \\dfrac{mv^2}{r}$.', 'Divide: $\\tan\\theta = \\dfrac{v^2}{rg}$, so $v = \\sqrt{rg\\tan\\theta} = \\sqrt{' + r + '(9.8)\\tan ' + th + '^\\circ} = ' + qx(vd, 'ms') + '$.'],
        'Balance the vertical forces; the horizontal part of $N$ supplies $mv^2/r$.', 'ms', { k: 'bank', r: r, th: th, mu: 0, want: 'design' }); }
    if (shape === 'angle') { var v = R.pick([15, 18, 20, 22, 25, 30]), ang = deg(M.atan(v * v / (r * g0)));
      return P('Engineers want cars to take a curve of radius $' + qg(r, 'm') + '$ at $' + qg(v, 'ms') + '$ with no friction needed. At what angle should they bank it?',
        ans(ang, 0.01),
        ['With no friction: $N\\cos\\theta = mg$ and $N\\sin\\theta = \\dfrac{mv^2}{r}$, so $\\tan\\theta = \\dfrac{v^2}{rg}$.', '$\\tan\\theta = \\dfrac{' + v + '^2}{' + r + '(9.8)} = ' + fx(v * v / (r * g0), 4) + '$, so $\\theta = ' + qx(ang, 'deg') + '$.'],
        'Find $\\tan\\theta = v^2/(rg)$.', 'deg', { k: 'bank', r: r, v: v, want: 'angle' }); }
    if (shape === 'N') { var mN = R.pick([900, 1000, 1200, 1500]), N = mN * g0 / c;
      return P('A $' + gx(mN) + '\\ \\text{kg}$ car takes a curve banked at $' + th + '^\\circ$ at exactly the design speed (no friction needed). How large is the normal force on the car?',
        ans(N, 0.01),
        ['At the design speed, friction is zero and the acceleration is horizontal, so the vertical forces balance: $N\\cos\\theta = mg$.', '$N = \\dfrac{mg}{\\cos\\theta} = \\dfrac{' + gx(mN) + '(9.8)}{\\cos ' + th + '^\\circ} = ' + qx(N, 'N') + '$, more than the weight.'],
        'Balance the vertical forces, not the forces along the slope.', 'N', { k: 'bank', r: 100, th: th, m: mN, want: 'N' }); }
    var mu2 = R.pick([0.2, 0.3, 0.4, 0.5]);
    if (shape === 'vmin') { if (mu2 >= tn) mu2 = sgf(tn * 0.5, 1); var vmn = M.sqrt(r * g0 * (s - mu2 * c) / (c + mu2 * s));
      return P('A curve of radius $' + qg(r, 'm') + '$ is banked at $' + th + '^\\circ$, and $\\mu_s = ' + gx(mu2) + '$. What is the slowest a car can take it without sliding down the bank?',
        ans(vmn, 0.02),
        ['Going slowly, the car tends to slide down, so static friction points <b>up</b> the slope, at its maximum $\\mu_sN$.', 'Vertical: $N\\cos\\theta + \\mu_sN\\sin\\theta = mg$. Horizontal: $N\\sin\\theta - \\mu_sN\\cos\\theta = \\dfrac{mv^2}{r}$.',
          'Divide: $v_{\\min}^2 = rg\\,\\dfrac{\\sin\\theta - \\mu_s\\cos\\theta}{\\cos\\theta + \\mu_s\\sin\\theta} = ' + r + '(9.8)\\dfrac{' + fx(s, 4) + ' - ' + gx(mu2) + '(' + fx(c, 4) + ')}{' + fx(c, 4) + ' + ' + gx(mu2) + '(' + fx(s, 4) + ')}$.', '$v_{\\min} = ' + qx(vmn, 'ms') + '$.'],
        'At the slowest speed, friction holds the car up the slope.', 'ms', { k: 'bank', r: r, th: th, mu: mu2, want: 'vmin' }); }
    var vmx = M.sqrt(r * g0 * (s + mu2 * c) / (c - mu2 * s));
    return P('A curve of radius $' + qg(r, 'm') + '$ is banked at $' + th + '^\\circ$, and $\\mu_s = ' + gx(mu2) + '$. What is the fastest a car can take it without sliding up the bank?',
      ans(vmx, 0.02),
      ['Going fast, the car tends to slide up and out, so static friction points <b>down</b> the slope, at its maximum $\\mu_sN$.', 'Vertical: $N\\cos\\theta - \\mu_sN\\sin\\theta = mg$. Horizontal: $N\\sin\\theta + \\mu_sN\\cos\\theta = \\dfrac{mv^2}{r}$.',
        'Divide: $v_{\\max}^2 = rg\\,\\dfrac{\\sin\\theta + \\mu_s\\cos\\theta}{\\cos\\theta - \\mu_s\\sin\\theta} = ' + r + '(9.8)\\dfrac{' + fx(s, 4) + ' + ' + gx(mu2) + '(' + fx(c, 4) + ')}{' + fx(c, 4) + ' - ' + gx(mu2) + '(' + fx(s, 4) + ')}$.', '$v_{\\max} = ' + qx(vmx, 'ms') + '$.'],
      'At top speed, friction points down the slope.', 'ms', { k: 'bank', r: r, th: th, mu: mu2, want: 'vmax' });
  });

  G('mech.pulley-constraints', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['rate', 'table', 'table'], ['table', 'hang', 'tableT', 'rate'], ['hang', 'hangT', 'tableT', 'hang']));
    if (shape === 'rate') { var u = R.pick([0.4, 0.6, 0.8, 1.2, 1.5, 2]), up_ = R.coin();
      return P('A load hangs from a movable pulley. One end of the rope is tied to the ceiling; the rope runs down around the movable pulley and back up over a fixed pulley, and you pull its free end down at ' + (up_ ? '$' + qg(u, 'ms') + '$. How fast does the load rise?' : 'a steady speed. The load rises at $' + qg(u, 'ms') + '$. How fast must you pull the rope?'),
        ans(up_ ? u / 2 : 2 * u, 0.01),
        ['Let $y$ be the load\'s height and $s$ the length of rope you have pulled through. The rope\'s length is fixed, and two strands hold the movable pulley.', 'When the load rises by $\\Delta y$, both strands shorten by $\\Delta y$, so $2\\Delta y$ of rope comes out at your hand: $s = 2y + \\text{constant}$.',
          'Differentiate: $\\dfrac{ds}{dt} = 2\\dfrac{dy}{dt}$, so ' + (up_ ? 'the load rises at $\\dfrac{' + gx(u) + '}{2} = ' + qg(fix(u / 2), 'ms') + '$.' : 'you must pull at $2(' + gx(u) + ') = ' + qg(fix(2 * u), 'ms') + '$.')],
        'Write the rope length in terms of the positions, then differentiate.', 'ms', { k: 'rope', u: u, want: up_ ? 'load' : 'pull' }); }
    if (shape === 'table' || shape === 'tableT') {
      var m1 = R.pick([1, 2, 3, 4, 5]), m2 = R.pick([2, 4, 6, 8, 10]), a2 = m2 * g0 / (m2 + 4 * m1), a1 = 2 * a2, T = m1 * a1, askT = shape === 'tableT';
      var q = 'A $' + m1 + '\\ \\text{kg}$ block on a frictionless table is tied to a rope that runs over a light pulley at the table\'s edge, down around a light movable pulley, and up to a hook on the underside of the table. A $' + m2 + '\\ \\text{kg}$ block hangs from the movable pulley. ';
      var st = ['Constraint: when the hanging block drops by $d$, both strands around the movable pulley lengthen by $d$, so the table block slides $2d$. Thus $a_1 = 2a_2$.',
        'Table block: $T = m_1a_1 = 2m_1a_2$. Hanging block (two strands pull up): $m_2g - 2T = m_2a_2$.',
        'Substitute: $m_2g - 4m_1a_2 = m_2a_2$, so $a_2 = \\dfrac{m_2g}{m_2 + 4m_1} = \\dfrac{' + m2 + '(9.8)}{' + m2 + ' + ' + (4 * m1) + '} = ' + qx(a2, 'ms2') + '$.'];
      if (askT) return P(q + 'Find the tension in the rope.', ans(T, 0.01), st.concat(['$a_1 = 2a_2 = ' + qx(a1, 'ms2') + '$, and $T = m_1a_1 = ' + m1 + '(' + fx(a1, 4) + ') = ' + qx(T, 'N') + '$.']),
        'The rope length gives $a_1 = 2a_2$; write Newton\'s second law for each block.', 'N', { k: 'pulley', cfg: 'table', m1: m1, m2: m2, want: 'T' });
      var which = R.pick(['a2', 'a1']);
      return P(q + 'Find the acceleration of the ' + (which === 'a2' ? 'hanging' : 'table') + ' block.', ans(which === 'a2' ? a2 : a1, 0.01), which === 'a2' ? st : st.concat(['The table block moves twice as fast: $a_1 = 2a_2 = ' + qx(a1, 'ms2') + '$.']),
        'The rope length gives $a_1 = 2a_2$; write Newton\'s second law for each block.', 'ms2', { k: 'pulley', cfg: 'table', m1: m1, m2: m2, want: which });
    }
    // hang: load m1 on movable pulley, counterweight m2 on the free end over a fixed pulley (the kit's movable-pulley scene)
    var M1 = R.pick([4, 6, 8, 10, 12]), M2 = R.pick([3, 4, 5, 6, 7, 8]);
    if (2 * M2 === M1) M2 += 1;
    var aL = (2 * M2 - M1) * g0 / (M1 + 4 * M2), aC = 2 * aL, Th = M2 * (g0 - aC), askT2 = shape === 'hangT';
    var q2 = 'A $' + M1 + '\\ \\text{kg}$ load hangs from a light movable pulley. One end of the rope is tied to the ceiling; the rope runs down around the movable pulley, up over a fixed pulley, and down to a $' + M2 + '\\ \\text{kg}$ counterweight. ';
    var st2 = ['Take the load\'s upward acceleration as $a$. The rope length fixes the counterweight\'s downward acceleration at $2a$.',
      'Counterweight: $m_2g - T = m_2(2a)$. Load (two strands pull up): $2T - m_1g = m_1a$.',
      'From the first, $T = m_2g - 2m_2a$. Substitute: $2m_2g - 4m_2a - m_1g = m_1a$, so $a = \\dfrac{(2m_2 - m_1)g}{m_1 + 4m_2} = \\dfrac{(' + (2 * M2) + ' - ' + M1 + ')(9.8)}{' + M1 + ' + ' + (4 * M2) + '} = ' + qx(aL, 'ms2') + '$.'];
    if (askT2) return P(q2 + 'Find the tension in the rope.', ans(Th, 0.01), st2.concat(['$T = m_2(g - 2a) = ' + M2 + '(9.8 - ' + pf(aC, 4) + ') = ' + qx(Th, 'N') + '$.']),
      'Use the rope length to relate the accelerations, then Newton\'s second law for each object.', 'N', { k: 'pulley', cfg: 'hang', m1: M1, m2: M2, want: 'T' });
    return P(q2 + 'Find the load\'s acceleration (upward positive).', ans(aL, 0.01), st2.concat([aL > 0 ? 'Positive: the load rises, since two strands of tension beat its weight.' : 'Negative: the load sinks, because $2m_2 < m_1$.']),
      'Use the rope length to relate the accelerations, then Newton\'s second law for each object.', 'ms2', { k: 'pulley', cfg: 'hang', m1: M1, m2: M2, want: 'aload' },
      { name: 'ph-dynamics', opts: { scene: 'movable-pulley', m1: M1, m2: M2, interactive: false, quiet: true } });
  });

  G('mech.center-of-mass-integral', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['pow', 'linM', 'lin'], ['lin', 'linM', 'pow', 'lin'], ['quad', 'lin', 'sqrt', 'quad']));
    var L = R.pick([1, 2, 3, 4, 0.5, 1.5]);
    if (shape === 'pow') { var n = R.pick([1, 2]), k = R.pick([2, 3, 4, 6]), xc = (n + 1) / (n + 2) * L;
      return P('A rod of length $' + qg(L, 'm') + '$ lies along the $x$-axis from $x = 0$. Its linear density is $\\lambda(x) = ' + cf(k) + 'x' + (n === 2 ? '^2' : '') + '$ (kg/m, with $x$ in meters). Where is its center of mass?',
        ans(xc, 0.01),
        ['$M = \\int_0^{L} \\lambda\\,dx = \\int_0^{' + gx(L) + '} ' + cf(k) + 'x' + (n === 2 ? '^2' : '') + '\\,dx = ' + fr(k, n + 1) + 'L^{' + (n + 1) + '}$.',
          '$\\int_0^{L} x\\lambda\\,dx = \\int_0^{' + gx(L) + '} ' + cf(k) + 'x^{' + (n + 1) + '}\\,dx = ' + fr(k, n + 2) + 'L^{' + (n + 2) + '}$.',
          '$x_{\\text{cm}} = \\dfrac{\\int x\\,dm}{M} = \\dfrac{' + (n + 1) + '}{' + (n + 2) + '}L = ' + qx(xc, 'm') + '$, toward the denser end.'],
        'Divide $\\int x\\lambda\\,dx$ by $\\int \\lambda\\,dx$.', 'm', { k: 'cm', lam: k + '*x^' + n, L: L, want: 'xcm' }); }
    var a = R.pick([1, 2, 3, 4]), b = R.pick([1, 2, 3, 4, 6]);
    if (shape === 'linM' || shape === 'lin') {
      var Mtot = a * L + b * L * L / 2, mom = a * L * L / 2 + b * L * L * L / 3, xcm = mom / Mtot;
      if (shape === 'linM') return P('A tapered rod of length $' + qg(L, 'm') + '$ has linear density $\\lambda(x) = ' + a + ' + ' + kt(b, 'x') + '$ (kg/m, $x$ in meters from the thin end). What is its total mass?',
        ans(Mtot, 0.01),
        ['Each slice $dx$ has mass $dm = \\lambda\\,dx$, so $M = \\int_0^{' + gx(L) + '} (' + a + ' + ' + kt(b, 'x') + ')\\,dx$.', '$M = \\left[' + kt(a, 'x') + ' + ' + cf(fix(b / 2)) + 'x^2\\right]_0^{' + gx(L) + '} = ' + qx(Mtot, 'kg', 4) + '$.'],
        'Add up the slices: integrate $\\lambda$ over the length.', 'kg', { k: 'cm', lam: a + '+' + b + '*x', L: L, want: 'M' });
      return P('A tapered rod of length $' + qg(L, 'm') + '$ has linear density $\\lambda(x) = ' + a + ' + ' + kt(b, 'x') + '$ (kg/m, $x$ in meters from the thin end). How far from the thin end is its center of mass?',
        ans(xcm, 0.01),
        ['$M = \\int_0^{' + gx(L) + '} (' + a + ' + ' + kt(b, 'x') + ')\\,dx = ' + gx(a * L) + ' + ' + gx(fix(b * L * L / 2)) + ' = ' + qx(Mtot, 'kg', 4) + '$.',
          '$\\int_0^{' + gx(L) + '} x\\lambda\\,dx = \\left[' + cf(fix(a / 2)) + 'x^2 + ' + cf(fix(b / 3)) + 'x^3\\right]_0^{' + gx(L) + '} = ' + fx(mom, 4) + '\\ \\text{kg·m}$.',
          '$x_{\\text{cm}} = \\dfrac{' + fx(mom, 4) + '}{' + fx(Mtot, 4) + '} = ' + qx(xcm, 'm') + '$, past the middle ($' + gx(L / 2) + '\\ \\text{m}$) because the far end is denser.'],
        'Find $M$ first, then divide $\\int x\\,dm$ by it.', 'm', { k: 'cm', lam: a + '+' + b + '*x', L: L, want: 'xcm' });
    }
    if (shape === 'quad') { var Mq = a * L + b * L * L * L / 3, mq = a * L * L / 2 + b * L * L * L * L / 4, xq = mq / Mq;
      return P('A rod of length $' + qg(L, 'm') + '$ has linear density $\\lambda(x) = ' + a + ' + ' + kt(b, 'x') + '^2$ (kg/m, $x$ in meters from one end). How far from that end is its center of mass?',
        ans(xq, 0.01),
        ['$M = \\int_0^{' + gx(L) + '} (' + a + ' + ' + kt(b, 'x') + '^2)\\,dx = \\left[' + kt(a, 'x') + ' + ' + cf(fix(b / 3)) + 'x^3\\right]_0^{' + gx(L) + '} = ' + qx(Mq, 'kg', 4) + '$.',
          '$\\int_0^{' + gx(L) + '} x\\lambda\\,dx = \\left[' + cf(fix(a / 2)) + 'x^2 + ' + cf(fix(b / 4)) + 'x^4\\right]_0^{' + gx(L) + '} = ' + fx(mq, 4) + '\\ \\text{kg·m}$.',
          '$x_{\\text{cm}} = \\dfrac{' + fx(mq, 4) + '}{' + fx(Mq, 4) + '} = ' + qx(xq, 'm') + '$.'],
        'Find $M = \\int \\lambda\\,dx$ and $\\int x\\lambda\\,dx$, then divide.', 'm', { k: 'cm', lam: a + '+' + b + '*x^2', L: L, want: 'xcm' }); }
    var Ls = R.pick([1, 4, 9]), ks = R.pick([2, 3, 6]), xs = 0.6 * Ls;
    return P('A rod of length $' + qg(Ls, 'm') + '$ has linear density $\\lambda(x) = ' + cf(ks) + '\\sqrt{x}$ (kg/m, $x$ in meters from one end). How far from that end is its center of mass?',
      ans(xs, 0.01),
      ['$M = \\int_0^{L} ' + cf(ks) + 'x^{1/2}\\,dx = ' + cf(ks) + '\\cdot\\tfrac{2}{3}L^{3/2}$.', '$\\int_0^{L} x\\lambda\\,dx = \\int_0^{L} ' + cf(ks) + 'x^{3/2}\\,dx = ' + cf(ks) + '\\cdot\\tfrac{2}{5}L^{5/2}$.', '$x_{\\text{cm}} = \\dfrac{2/5}{2/3}L = \\dfrac{3}{5}L = \\dfrac{3}{5}(' + Ls + ') = ' + qx(xs, 'm') + '$.'],
      'Integrate the powers of $x$; the constant ' + ks + ' cancels.', 'm', { k: 'cm', lam: ks + '*sqrt(x)', L: Ls, want: 'xcm' });
  });


  // ================================================================== UNIT 3: WORK AND ENERGY WITH CALCULUS
  // NASA planetary fact sheets (mass in kg, mean radius in m)
  var BODIES = [{ n: 'Earth', M: 5.972e24, R: 6.371e6 }, { n: 'the Moon', M: 7.346e22, R: 1.7374e6 }, { n: 'Mars', M: 6.417e23, R: 3.3895e6 }];
  function Mtex(b) { return qg(b.M, 'kg'); }

  G('mech.work-integral', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['spring0', 'spring', 'poly'], ['spring', 'poly', 'inv', 'spring'], ['poly', 'inv', 'sqrt', 'spring']));
    if (shape === 'spring0' || shape === 'spring') {
      var k = R.pick([50, 80, 100, 120, 200, 250, 400]), x1 = shape === 'spring0' ? 0 : R.pick([0.05, 0.1, 0.15, 0.2]), x2 = fix(x1 + R.pick([0.1, 0.15, 0.2, 0.25, 0.3])), W = 0.5 * k * (x2 * x2 - x1 * x1);
      return P('A spring with $k = ' + qg(k, 'Nperm') + '$ is stretched ' + (x1 ? 'from $' + qg(x1, 'm') + '$ to $' + qg(x2, 'm') + '$ past its natural length' : 'from its natural length to $' + qg(x2, 'm') + '$') + '. How much work does the person stretching it do? (The force needed is $F = kx$.)',
        ans(W, 0.01),
        ['The force changes as the spring stretches, so integrate: $W = \\int_{' + gx(x1) + '}^{' + gx(x2) + '} kx\\,dx = \\tfrac{1}{2}k\\left(x_2^2 - x_1^2\\right)$.', '$W = \\tfrac{1}{2}(' + k + ')\\left(' + gx(x2) + '^2 - ' + gx(x1) + '^2\\right) = ' + qx(W, 'J') + '$.',
          'The area under the $F$–$x$ line is a ' + (x1 ? 'trapezoid' : 'triangle') + ', not the rectangle $F_{\\text{final}}\\times\\Delta x = ' + gx(fix(k * x2 * (x2 - x1))) + '\\ \\text{J}$.'],
        'Integrate $kx$ between the two stretches.', 'J', { k: 'wint', F: k + '*x', x1: x1, x2: x2 });
    }
    if (shape === 'poly') { var a = R.pick([2, 3, 4, 6]), b = R.int(0, 5), x1p = R.int(0, 2), x2p = x1p + R.int(1, 3), Wp = a * (M.pow(x2p, 3) - M.pow(x1p, 3)) / 3 + b * (x2p - x1p);
      return P('A force $F(x) = ' + cf(a) + 'x^2' + (b ? ' + ' + b : '') + '$ (newtons, with $x$ in meters) pushes a crate along the $x$-axis from $x = ' + x1p + '\\ \\text{m}$ to $x = ' + x2p + '\\ \\text{m}$. How much work does it do?',
        ans(Wp, 0.01),
        ['$W = \\int_{' + x1p + '}^{' + x2p + '} F\\,dx = \\left[' + fr(a, 3) + 'x^3' + (b ? ' + ' + kt(b, 'x') : '') + '\\right]_{' + x1p + '}^{' + x2p + '}$.', '$W = ' + fr(a, 3) + '\\left(' + x2p + '^3 - ' + x1p + '^3\\right)' + (b ? ' + ' + b + '(' + x2p + ' - ' + x1p + ')' : '') + ' = ' + qx(Wp, 'J', 4) + '$.'],
        'Work is the integral of force over position.', 'J', { k: 'wint', F: a + '*x^2+' + b, x1: x1p, x2: x2p }); }
    if (shape === 'inv') { var C = R.pick([2, 4, 6, 8, 12]), xa = R.pick([1, 2]), xb = xa * R.pick([2, 3, 4]), Wi = C * (1 / xa - 1 / xb);
      return P('Two magnets repel with a force $F(x) = \\dfrac{' + C + '}{x^2}$ (newtons, $x$ in meters apart). One magnet is held fixed while the other slides away from $x = ' + xa + '\\ \\text{m}$ to $x = ' + xb + '\\ \\text{m}$. How much work does the repulsion do on the moving magnet?',
        ans(Wi, 0.01),
        ['$W = \\int_{' + xa + '}^{' + xb + '} \\dfrac{' + C + '}{x^2}\\,dx = ' + C + '\\left[-\\dfrac{1}{x}\\right]_{' + xa + '}^{' + xb + '} = ' + C + '\\left(\\dfrac{1}{' + xa + '} - \\dfrac{1}{' + xb + '}\\right)$.', '$W = ' + qx(Wi, 'J') + '$, positive because the force points the way the magnet moves.'],
        'An antiderivative of $1/x^2$ is $-1/x$.', 'J', { k: 'wint', F: C + '/x^2', x1: xa, x2: xb }); }
    var cs = R.pick([2, 3, 6, 9]), Xs = R.pick([1, 4, 9]), Ws = cs * 2 / 3 * M.pow(Xs, 1.5);
    return P('A stiffening bungee cord pulls with $F(x) = ' + cf(cs) + '\\sqrt{x}$ (newtons, $x$ = stretch in meters). How much work does it take to stretch it from $0$ to $' + qg(Xs, 'm') + '$?',
      ans(Ws, 0.01),
      ['$W = \\int_0^{' + Xs + '} ' + cf(cs) + 'x^{1/2}\\,dx = ' + cf(cs) + '\\cdot\\tfrac{2}{3}x^{3/2}\\Big|_0^{' + Xs + '}$.', '$' + Xs + '^{3/2} = ' + gx(M.pow(Xs, 1.5)) + '$, so $W = ' + qx(Ws, 'J') + '$.'],
      'Use the power rule for integrals with $n = 1/2$.', 'J', { k: 'wint', F: cs + '*sqrt(x)', x1: 0, x2: Xs });
  });

  G('mech.work-along-path', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['angle', 'const', 'const'], ['const', 'field', 'angle', 'field'], ['field', 'circle', 'field', 'const']));
    if (shape === 'angle') { var F = R.pick([20, 30, 40, 50, 60, 80]), th = R.pick([20, 25, 30, 35, 40, 50, 60]), d = R.pick([3, 4, 5, 8, 10, 12]), W = F * d * M.cos(rad(th));
      return P('You pull a sled $' + qg(d, 'm') + '$ along level snow with a rope that makes $' + th + '^\\circ$ with the ground. The rope\'s tension is $' + qg(F, 'N') + '$. How much work does the rope do?',
        ans(W, 0.01),
        ['$W = \\vec{F}\\cdot\\Delta\\vec{r} = Fd\\cos\\theta$: only the part of the force along the motion does work.', '$W = ' + F + '(' + d + ')\\cos ' + th + '^\\circ = ' + qx(W, 'J') + '$.', 'The vertical part of the pull, $F\\sin\\theta$, is perpendicular to the motion and does no work.'],
        'Use the dot product: force times displacement times the cosine of the angle between them.', 'J', { k: 'line', P: plainNum(F * M.cos(rad(th))), Q: plainNum(F * M.sin(rad(th))), x: d + '*t', y: '0', t0: 0, t1: 1 }); }
    if (shape === 'const') { var Fx = R.int(-6, 8), Fy = R.int(-6, 8), ax = R.int(-3, 3), ay = R.int(-3, 3), bx = R.int(-3, 5), by = R.int(-3, 5);
      if (!Fx && !Fy) Fx = 5; if (ax === bx && ay === by) bx += 2;
      var dx = bx - ax, dy = by - ay, Wc = Fx * dx + Fy * dy;
      return P('A constant force $\\vec{F} = \\langle ' + Fx + ', ' + Fy + ' \\rangle\\ \\text{N}$ acts on a puck as it slides along a winding path from $(' + ax + ', ' + ay + ')$ to $(' + bx + ', ' + by + ')$ (meters). How much work does $\\vec{F}$ do?',
        ans(Wc, 0.01),
        ['For a constant force, $W = \\int \\vec{F}\\cdot d\\vec{r} = \\vec{F}\\cdot\\int d\\vec{r} = \\vec{F}\\cdot\\Delta\\vec{r}$: the winding doesn\'t matter.', '$\\Delta\\vec{r} = \\vec{r}_{\\text{end}} - \\vec{r}_{\\text{start}} = \\langle ' + dx + ', ' + dy + ' \\rangle\\ \\text{m}$.', '$W = (' + Fx + ')(' + dx + ') + (' + Fy + ')(' + dy + ') = ' + qg(Wc, 'J') + '$.'],
        'A constant force can come out of the integral.', 'J', { k: 'line', P: String(Fx), Q: String(Fy), x: ax + '+(' + dx + ')*t+0.3*sin(pi*t)', y: ay + '+(' + dy + ')*t+0.5*sin(2*pi*t)', t0: 0, t1: 1 }); }
    if (shape === 'circle') { var k = R.pick([2, 3, 4, 5]), Rr = R.pick([1, 2, 3]), frac = R.pick([0.25, 0.5, 1]), Wq = k * Rr * Rr * 2 * PI * frac;
      return P('A swirling force $\\vec{F} = ' + k + '\\langle -y, x \\rangle$ (newtons, with $x$ and $y$ in meters) acts on a bead moving counterclockwise ' + (frac === 1 ? 'once around' : frac === 0.5 ? 'halfway around' : 'a quarter of the way around') + ' the circle $x^2 + y^2 = ' + (Rr * Rr) + '$, starting at $(' + Rr + ', 0)$. How much work does $\\vec{F}$ do?',
        ans(Wq, 0.01),
        ['Parametrize: $\\vec{r} = \\langle ' + cf(Rr) + '\\cos t, ' + cf(Rr) + '\\sin t \\rangle$, so $d\\vec{r} = ' + cf(Rr) + '\\langle -\\sin t, \\cos t \\rangle\\,dt$.', 'On the circle $\\vec{F} = ' + cf(k * Rr) + '\\langle -\\sin t, \\cos t \\rangle$, which points along the path: $\\vec{F}\\cdot d\\vec{r} = ' + (k * Rr * Rr) + '\\,dt$.',
          '$W = \\int_0^{' + (frac === 1 ? '2\\pi' : frac === 0.5 ? '\\pi' : '\\pi/2') + '} ' + (k * Rr * Rr) + '\\,dt = ' + qx(Wq, 'J') + '$. ' + (frac === 1 ? 'A closed loop with nonzero work: this force is not conservative.' : '')],
        'Parametrize the circle and compute $\\vec{F}\\cdot d\\vec{r}$.', 'J', { k: 'line', P: '-' + k + '*y', Q: k + '*x', x: Rr + '*cos(t)', y: Rr + '*sin(t)', t0: 0, t1: plainNum(2 * PI * frac) }); }
    // field along y = x^n from x = 0 to X
    var n = R.pick([1, 2, 2, 3]), X = R.pick([1, 2]), a = R.nz(-3, 4), b = R.nz(-3, 4), Pk = R.pick(['y', 'x', 'xy']), Qk = R.pick(['x', 'y', 'x2']);
    var pe = { y: [0, 1], x: [1, 0], xy: [1, 1] }[Pk], qe = { x: [1, 0], y: [0, 1], x2: [2, 0] }[Qk];
    var e1 = pe[0] + n * pe[1], e2 = qe[0] + n * qe[1] + n - 1, Wf = a * M.pow(X, e1 + 1) / (e1 + 1) + b * n * M.pow(X, e2 + 1) / (e2 + 1);
    var Ptex = { y: kt(a, 'y'), x: kt(a, 'x'), xy: cf(a) + 'xy' }[Pk], Qtex = { x: kt(b, 'x'), y: kt(b, 'y'), x2: cf(b) + 'x^2' }[Qk], path = n === 1 ? 'y = x' : 'y = x^' + n;
    var xpw = function (e) { return e === 0 ? '' : 'x' + (e === 1 ? '' : '^{' + e + '}'); };
    return P('A force field $\\vec{F} = \\langle ' + Ptex + ',\\ ' + Qtex + ' \\rangle$ (newtons, $x$ and $y$ in meters) acts on a particle moving along the curve $' + path + '$ from $(0, 0)$ to $(' + X + ', ' + M.pow(X, n) + ')$. How much work does it do?',
      ans(Wf, 0.01),
      ['$W = \\int \\left(F_x\\,dx + F_y\\,dy\\right)$. On the path, $y = x^{' + n + '}$ and $dy = ' + (n === 1 ? '' : n + 'x^{' + (n - 1) + '}') + (n === 1 ? 'dx' : '\\,dx') + '$.',
        'Substitute: $W = \\int_0^{' + X + '} \\left(' + T.terms([[a, xpw(e1)], [b * n, xpw(e2)]]) + '\\right)dx$.',
        '$W = ' + T.terms([[Q(a, e1 + 1), '(' + X + ')^{' + (e1 + 1) + '}'], [Q(b * n, e2 + 1), '(' + X + ')^{' + (e2 + 1) + '}']]) + ' = ' + qx(Wf, 'J') + '$.'],
      'Write everything in terms of $x$ along the path, including $dy$.', 'J', { k: 'line', P: { y: a + '*y', x: a + '*x', xy: a + '*x*y' }[Pk], Q: { x: b + '*x', y: b + '*y', x2: b + '*x^2' }[Qk], x: 't', y: 't^' + n, t0: 0, t1: X });
  });

  G('mech.work-energy-derivation', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['net', 'var', 'net'], ['var', 'net', 'spring', 'var'], ['varfric', 'spring', 'var', 'varfric']));
    if (shape === 'net') { var m = R.pick([2, 4, 5, 10]), F = R.pick([20, 30, 40, 50]), mu = R.pick([0.1, 0.2, 0.25, 0.3]), d = R.pick([2, 3, 4, 5, 6]), v0 = R.int(1, 3);
      var f = mu * m * g0; if (f >= F) { mu = 0.1; f = mu * m * g0; }
      var Wn = (F - f) * d, v = M.sqrt(v0 * v0 + 2 * Wn / m);
      return P('A $' + m + '\\ \\text{kg}$ box moving at $' + v0 + '\\ \\text{m/s}$ is pushed $' + qg(d, 'm') + '$ across a floor by a horizontal $' + qg(F, 'N') + '$ force. The coefficient of kinetic friction is $' + gx(mu) + '$. Use the work-energy theorem to find its final speed.',
        ans(v, 0.01),
        ['Friction: $f_k = \\mu_kmg = ' + gx(mu) + '(' + m + ')(9.8) = ' + qx(f, 'N', 4) + '$.', 'Net work: $W_{\\text{net}} = (F - f_k)d = (' + F + ' - ' + fx(f, 4) + ')(' + d + ') = ' + qx(Wn, 'J', 4) + '$. (Gravity and the normal force do no work: they are perpendicular to the motion.)',
          '$W_{\\text{net}} = \\tfrac{1}{2}mv^2 - \\tfrac{1}{2}mv_0^2$, so $v = \\sqrt{v_0^2 + \\dfrac{2W_{\\text{net}}}{m}} = \\sqrt{' + (v0 * v0) + ' + \\dfrac{2(' + fx(Wn, 4) + ')}{' + m + '}} = ' + qx(v, 'ms') + '$.'],
        'Use the work done by ALL the forces together.', 'ms', { k: 'ax', a: '(' + F + '-' + plainNum(f) + ')/' + m, x0: 0, v0: v0, x1: d, want: 'v' }); }
    if (shape === 'var') { var mv = R.pick([1, 2, 4, 5]), kv = R.pick([2, 4, 6, 10, 12]), X = R.int(1, 4), Wv = kv * X * X * X / 3, vv = M.sqrt(2 * Wv / mv);
      return P('A $' + mv + '\\ \\text{kg}$ cart starts from rest at $x = 0$ on a frictionless track. The only horizontal force on it is $F(x) = ' + cf(kv) + 'x^2$ (newtons, $x$ in meters). How fast is it moving at $x = ' + X + '\\ \\text{m}$?',
        ans(vv, 0.01),
        ['Net work: $W = \\int_0^{' + X + '} ' + cf(kv) + 'x^2\\,dx = ' + fr(kv, 3) + '(' + X + ')^3 = ' + qx(Wv, 'J', 4) + '$.', 'Work-energy theorem from rest: $\\tfrac{1}{2}mv^2 = W$, so $v = \\sqrt{\\dfrac{2(' + fx(Wv, 4) + ')}{' + mv + '}} = ' + qx(vv, 'ms') + '$.'],
        'Integrate the force over the distance, then set the work equal to $\\Delta K$.', 'ms', { k: 'ax', a: kv + '*x^2/' + mv, x0: 0, v0: 0, x1: X, want: 'v' }); }
    if (shape === 'spring') { var ks = R.pick([200, 400, 500, 800]), ms = R.pick([0.1, 0.2, 0.25, 0.5]), xs = R.pick([0.05, 0.1, 0.15, 0.2]), vs = xs * M.sqrt(ks / ms);
      return P('A spring ($k = ' + qg(ks, 'Nperm') + '$) is compressed $' + qg(xs, 'm') + '$ and released, launching a $' + qg(ms, 'kg') + '$ puck along frictionless ice. How fast is the puck moving when it leaves the spring (at the spring\'s natural length)?',
        ans(vs, 0.01),
        ['While the spring pushes, $F = -kx$ (with $x$ the displacement from natural length, starting at $-' + gx(xs) + '$).', 'Work by the spring: $W = \\int_{-' + gx(xs) + '}^{0} (-kx)\\,dx = \\tfrac{1}{2}k(' + gx(xs) + ')^2 = ' + qx(0.5 * ks * xs * xs, 'J', 4) + '$.',
          '$\\tfrac{1}{2}mv^2 = W$, so $v = ' + gx(xs) + '\\sqrt{\\dfrac{' + ks + '}{' + gx(ms) + '}} = ' + qx(vs, 'ms') + '$.'],
        'The spring\'s work is $\\int F\\,dx$; set it equal to the kinetic energy gained.', 'ms', { k: 'ax', a: '-' + ks + '*x/' + ms, x0: -xs, v0: 0, x1: 0, want: 'v' }); }
    var mf = R.pick([2, 4, 5]), kf = R.pick([10, 20, 30, 40]), muf = R.pick([0.2, 0.3, 0.5]), Xf = R.pick([2, 3, 4]), ff = muf * mf * g0, F0 = M.ceil((ff + 5) / 10) * 10;
    var Wpull = F0 * Xf + kf * Xf * Xf / 2, Wf = Wpull - ff * Xf, vf = M.sqrt(2 * Wf / mf);
    return P('A $' + mf + '\\ \\text{kg}$ crate starts from rest at $x = 0$. A winch pulls it horizontally with $F(x) = ' + F0 + ' + ' + kt(kf, 'x') + '$ (newtons, $x$ in meters) while kinetic friction ($\\mu_k = ' + gx(muf) + '$) acts. How fast is it moving at $x = ' + Xf + '\\ \\text{m}$?',
      ans(vf, 0.02),
      ['Work by the winch: $\\int_0^{' + Xf + '} (' + F0 + ' + ' + kt(kf, 'x') + ')\\,dx = ' + F0 + '(' + Xf + ') + ' + gx(kf / 2) + '(' + Xf + ')^2 = ' + gx(Wpull) + '\\ \\text{J}$.', 'Work by friction: $-\\mu_kmg\\,d = -' + gx(muf) + '(' + mf + ')(9.8)(' + Xf + ') = ' + qx(-ff * Xf, 'J', 4) + '$.',
        'Net work $= ' + qx(Wf, 'J', 4) + ' = \\tfrac{1}{2}mv^2$, so $v = ' + qx(vf, 'ms') + '$.'],
      'Add the work of every force, then use $W_{\\text{net}} = \\Delta K$.', 'ms', { k: 'ax', a: '(' + F0 + '+' + kf + '*x-' + plainNum(ff) + ')/' + mf, x0: 0, v0: 0, x1: Xf, want: 'v' });
  });

  G('mech.conservative-forces', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['gravity', 'friction', 'which'], ['friction', 'gravity', 'loop', 'friction'], ['potential', 'friction', 'loop', 'potential']));
    if (shape === 'gravity') { var m = R.pick([0.5, 1, 2, 3, 5]), h1 = R.int(1, 6), h2 = R.int(0, 8); if (h1 === h2) h2 = h1 + 3;
      var W = -m * g0 * (h2 - h1);
      return P('A $' + qg(m, 'kg') + '$ ball rolls along a twisting track that climbs and dips, starting at a height of $' + qg(h1, 'm') + '$ and ending at $' + qg(h2, 'm') + '$. How much work does gravity do on the ball over the whole trip?',
        ans(W, 0.01),
        ['Gravity is conservative: its work depends only on the start and end heights, not on the twists. With $\\vec{F} = \\langle 0, -mg \\rangle$, $W = \\int \\vec{F}\\cdot d\\vec{r} = -mg\\int dy = -mg(y_2 - y_1)$.', '$W = -' + gx(m) + '(9.8)(' + h2 + ' - ' + h1 + ') = ' + qx(W, 'J') + '$.'],
        'Only the change in height matters.', 'J', { k: 'line', P: '0', Q: '-' + plainNum(m * g0), x: '3*t+sin(5*t)', y: h1 + '+(' + (h2 - h1) + ')*t+0.8*sin(3*pi*t)', t0: 0, t1: 1 }); }
    if (shape === 'friction') { var mf = R.pick([2, 4, 5, 10]), mu = R.pick([0.2, 0.25, 0.3, 0.4]), a = R.pick([3, 4, 5, 6, 8]), b = R.pick([4, 6, 8, 12]), path = R.pick(['L', 'straight']);
      var len = path === 'L' ? a + b : M.hypot(a, b), Wf = -mu * mf * g0 * len;
      return P('A $' + mf + '\\ \\text{kg}$ box is slid across a floor ($\\mu_k = ' + gx(mu) + '$) from one corner of a $' + a + '\\ \\text{m}$ by $' + b + '\\ \\text{m}$ rectangle to the opposite corner, ' + (path === 'L' ? 'going along two sides' : 'in a straight line along the diagonal') + '. How much work does friction do on the box?',
        ans(Wf, 0.01),
        ['Kinetic friction has size $\\mu_kmg = ' + gx(mu) + '(' + mf + ')(9.8) = ' + qx(mu * mf * g0, 'N', 4) + '$ and always points against the motion, so $W = -\\mu_kmg \\times (\\text{path length})$.',
          'Path length: ' + (path === 'L' ? '$' + a + ' + ' + b + ' = ' + (a + b) + '\\ \\text{m}$' : '$\\sqrt{' + a + '^2 + ' + b + '^2} = ' + fx(len, 4) + '\\ \\text{m}$') + '.', '$W = -' + fx(mu * mf * g0, 4) + '(' + fx(len, 4) + ') = ' + qx(Wf, 'J') + '$. A longer path means more negative work: friction is not conservative.'],
        'Friction\'s work depends on the length of the path, not just the endpoints.', 'J', { k: 'fricpath', mu: mu, m: mf, a: a, b: b, path: path }); }
    if (shape === 'loop') { var which = R.pick(['grav', 'fric']), ml = R.pick([2, 5, 10]), Lp = R.pick([20, 30, 40, 50]), mul = R.pick([0.1, 0.2, 0.3]);
      if (which === 'grav') return P('A $' + ml + '\\ \\text{kg}$ cart goes once around a closed roller-coaster track with hills and a loop, $' + Lp + '\\ \\text{m}$ long, and ends where it started. How much work does gravity do on it for the whole trip?',
        exact(0),
        ['Gravity is conservative: $W = -mg(y_{\\text{end}} - y_{\\text{start}})$.', 'The cart ends at the height where it started, so $W = 0$: gravity\'s negative work on the climbs exactly cancels its positive work on the drops.'],
        'What is the change in height around a closed loop?', 'J', { k: 'line', P: '0', Q: '-' + plainNum(ml * g0), x: '10*cos(t)', y: '5*sin(t)+2*sin(3*t)', t0: 0, t1: plainNum(2 * PI) });
      var Wl = -mul * ml * g0 * Lp;
      return P('A $' + ml + '\\ \\text{kg}$ box is dragged once around a closed loop $' + Lp + '\\ \\text{m}$ long on a level floor with $\\mu_k = ' + gx(mul) + '$, ending where it started. How much work does friction do on it?',
        ans(Wl, 0.01),
        ['Friction always opposes the motion, so every piece of the path adds negative work: $W = -\\mu_kmg \\times ' + Lp + '\\ \\text{m}$.', '$W = -' + gx(mul) + '(' + ml + ')(9.8)(' + Lp + ') = ' + qx(Wl, 'J') + '$.', 'Nonzero work around a closed loop is the signature of a non-conservative force.'],
        'Does friction ever do positive work on the box?', 'J', { k: 'fricloop', mu: mul, m: ml, L: Lp }); }
    if (shape === 'which') return P('Which of these forces is <b>not</b> conservative?',
      mc(R.pick(['kinetic friction on a sliding box', 'air drag on a falling raindrop', 'the drag of water on a moving boat']), R.sample(['gravity near Earth\'s surface', 'the force of an ideal spring', 'the gravitational pull of the Sun on a planet', 'the electric force between two fixed charges'], 3)),
      ['A force is conservative when its work around every closed path is zero, so its work between two points doesn\'t depend on the path.', 'Gravity, ideal springs and electric forces between charges pass this test: what they take on the way out they give back on the way home.', 'Friction and drag always point against the motion, so they do negative work on every piece of every path. Around a loop their work is negative, not zero.'],
      'Does the force do negative work on every piece of a round trip?', null, { k: 'mc' });
    // potential: F = <2a x y, a x^2 + b> is conservative with phi = a x^2 y + b y; or <a y, a x> with phi = a x y
    var A = R.nz(-3, 3), B = R.int(-4, 4), X = R.int(1, 3), Y = R.int(-2, 3), kind = R.pick(['xy', 'x2y']);
    var phi = kind === 'xy' ? A * X * Y + B * Y : A * X * X * Y + B * Y, Ptex = kind === 'xy' ? kt(A, 'y') : cf(2 * A) + 'xy', Qtex = (kind === 'xy' ? kt(A, 'x') : cf(A) + 'x^2') + (B ? (B > 0 ? ' + ' : ' - ') + M.abs(B) : '');
    if (Y === 0 && phi === 0) Y = 1;
    phi = kind === 'xy' ? A * X * Y + B * Y : A * X * X * Y + B * Y;
    return P('The force $\\vec{F} = \\langle ' + Ptex + ',\\ ' + Qtex + ' \\rangle$ (newtons, $x$ and $y$ in meters) is conservative, since $\\dfrac{\\partial F_x}{\\partial y} = \\dfrac{\\partial F_y}{\\partial x}$. Find the work it does on a particle that moves along any path from $(0, 0)$ to $(' + X + ', ' + Y + ')$.',
      ans(phi, 0.01),
      ['Check: $\\dfrac{\\partial F_x}{\\partial y} = ' + (kind === 'xy' ? A : cf(2 * A) + 'x') + '$ and $\\dfrac{\\partial F_y}{\\partial x} = ' + (kind === 'xy' ? A : cf(2 * A) + 'x') + '$. Equal, so the work is path-independent.',
        'Find a function $\\phi$ with $\\nabla\\phi = \\vec{F}$: $\\phi = ' + (kind === 'xy' ? cf(A) + 'xy' : cf(A) + 'x^2y') + (B ? (B > 0 ? ' + ' : ' - ') + kt(M.abs(B), 'y') : '') + '$ (so $U = -\\phi$).',
        '$W = \\phi(' + X + ', ' + Y + ') - \\phi(0, 0) = ' + qg(phi, 'J') + '$. (Any path, for example straight along the $x$-axis and then up, gives the same.)'],
      'For a conservative force, find a function whose gradient is $\\vec{F}$.', 'J', { k: 'line', P: kind === 'xy' ? A + '*y' : 2 * A + '*x*y', Q: (kind === 'xy' ? A + '*x' : A + '*x^2') + (B < 0 ? '-' + (-B) : '+' + B), x: X + '*t^2', y: Y + '*t', t0: 0, t1: 1 });
  });

  G('mech.potential-from-force', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['spring', 'const', 'dU'], ['spring', 'cubic', 'dU', 'grav'], ['cubic', 'grav', 'dU', 'cubic']));
    if (shape === 'spring') { var k = R.pick([10, 20, 30, 40, 50, 60, 80, 100, 150, 200, 300, 500]);
      return P('A spring exerts $F(x) = -' + kt(k, 'x') + '$ (newtons, $x$ in meters from its natural length). Find its potential energy $U(x)$ in joules, with $U = 0$ at $x = 0$.',
        expr(plainNum(k / 2) + '*x^2', ['x']),
        ['$U(x) = -\\int_0^x F(x\')\\,dx\' = -\\int_0^x (-' + kt(k, "x'") + ')\\,dx\' = ' + cf(k) + '\\cdot\\dfrac{x^2}{2}$.', '$U(x) = ' + cf(fix(k / 2)) + 'x^2$, which is $\\tfrac{1}{2}kx^2$: zero at natural length and positive on both sides.'],
        'Use $U(x) = -\\int F\\,dx$ starting from the reference point.', null, { k: 'Uexpr', F: '-' + k + '*x', ref: 0 }); }
    if (shape === 'const') { var m = R.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]);
      return P('A $' + m + '\\ \\text{kg}$ box near Earth\'s surface feels gravity $F_y = -' + gx(m * g0) + '\\ \\text{N}$ ($y$ up, in meters). Find the gravitational potential energy $U(y)$ in joules, with $U = 0$ at $y = 0$.',
        expr(plainNum(m * g0) + '*y', ['y']),
        ['$U(y) = -\\int_0^y F_y\\,dy\' = -\\int_0^y (-' + gx(m * g0) + ')\\,dy\'$.', '$U(y) = ' + gx(m * g0) + 'y$, which is $mgy$: it grows as the box rises, because gravity points down.'],
        'Mind the minus sign in $U = -\\int F\\,dy$.', null, { k: 'Uexpr', F: '-' + plainNum(m * g0), ref: 0, v: 'y' }); }
    if (shape === 'cubic') { var k2 = R.pick([2, 4, 6, 8, 10, 20]), b = R.pick([2, 4, 8, 12, 16, 20]);
      return P('A stiffening spring pulls back with $F(x) = -' + kt(k2, 'x') + ' - ' + cf(b) + 'x^3$ (newtons, $x$ in meters). Find $U(x)$ in joules, with $U(0) = 0$.',
        expr(plainNum(k2 / 2) + '*x^2+' + plainNum(b / 4) + '*x^4', ['x']),
        ['$U(x) = -\\int_0^x F\\,dx\' = \\int_0^x \\left(' + kt(k2, "x'") + ' + ' + cf(b) + "x'^3" + '\\right)dx\'$.', '$U(x) = ' + cf(fix(k2 / 2)) + 'x^2 + ' + cf(fix(b / 4)) + 'x^4$.', 'Check: $-\\dfrac{dU}{dx} = -' + kt(k2, 'x') + ' - ' + cf(b) + 'x^3 = F$.'],
        'Integrate each term, and keep the minus sign.', null, { k: 'Uexpr', F: '-' + k2 + '*x-' + b + '*x^3', ref: 0 }); }
    if (shape === 'dU') { var a = R.pick([3, 6, 9, 12]), x1 = R.int(0, 2), x2 = x1 + R.int(1, 2), up = R.coin(), dU = up ? a * (M.pow(x2, 3) - M.pow(x1, 3)) / 3 : -a * (M.pow(x2, 3) - M.pow(x1, 3)) / 3;
      var Ftex = (up ? '-' : '') + cf(a) + 'x^2';
      return P('A conservative force $F(x) = ' + Ftex + '$ (newtons, $x$ in meters) acts on a particle. By how much does the potential energy change, $\\Delta U = U(' + x2 + ') - U(' + x1 + ')$, as the particle moves from $x = ' + x1 + '\\ \\text{m}$ to $x = ' + x2 + '\\ \\text{m}$?',
        ans(dU, 0.01),
        ['$\\Delta U = -\\int_{' + x1 + '}^{' + x2 + '} F\\,dx = -\\left[' + (up ? '-' : '') + fr(a, 3) + 'x^3\\right]_{' + x1 + '}^{' + x2 + '}$.', '$\\Delta U = ' + (up ? '' : '-') + fr(a, 3) + '\\left(' + x2 + '^3 - ' + x1 + '^3\\right) = ' + qg(dU, 'J') + '$.',
          up ? 'The force points in $-x$ while the particle moves in $+x$: the force does negative work, so $U$ rises.' : 'The force points along the motion and does positive work, so $U$ falls.'],
        '$\\Delta U$ is minus the work done by the force.', 'J', { k: 'dU', F: (up ? '-' : '') + a + '*x^2', x1: x1, x2: x2 }); }
    var C = R.pick([2, 4, 6, 8, 12]), X = R.pick([1, 2, 3, 4]), Ug = -C / X;
    return P('An attractive force $F(r) = -\\dfrac{' + C + '}{r^2}$ (newtons, $r$ in meters) pulls a particle toward the origin. Taking $U = 0$ at $r \\to \\infty$, find $U$ at $r = ' + X + '\\ \\text{m}$.',
      ans(Ug, 0.01),
      ['$U(r) = -\\int_{\\infty}^{r} F\\,dr\' = \\int_{\\infty}^{r} \\dfrac{' + C + '}{r\'^2}\\,dr\' = \\left[-\\dfrac{' + C + '}{r\'}\\right]_{\\infty}^{r} = -\\dfrac{' + C + '}{r}$.', '$U(' + X + ') = -\\dfrac{' + C + '}{' + X + '} = ' + qx(Ug, 'J') + '$: negative, because work would have to be done to pull the particle away to where $U = 0$.'],
      'Integrate from infinity, where $U = 0$.', 'J', { k: 'Uinf', F: '-' + C + '/x^2', x: X });
  });

  G('mech.force-from-potential', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['val', 'val', 'expr'], ['val', 'expr', 'val', 'dir'], ['inv', 'exp', 'val', 'dir']));
    if (shape === 'val' || shape === 'expr' || shape === 'dir') {
      var c = [R.nz(-2, 3), R.int(-6, 6), R.int(-8, 8), R.int(-5, 5)], x0 = R.int(-2, 3), dc = polyD(c), F0 = -polyAt(dc, x0);
      if (F0 === 0) { c[2] += 3; dc = polyD(c); F0 = -polyAt(dc, x0); }
      var Ut = '$U(x) = ' + poly(c, 'x') + '$ (joules, $x$ in meters)';
      if (shape === 'expr') return P('A particle moves in a potential energy ' + Ut + '. Find the force $F(x)$ on it, in newtons.',
        expr(polyPlain(dc.map(function (v) { return -v; }), 'x'), ['x']),
        ['$F(x) = -\\dfrac{dU}{dx}$.', '$\\dfrac{dU}{dx} = ' + poly(dc, 'x') + '$, so $F(x) = ' + poly(dc.map(function (v) { return -v; }), 'x') + '$.'],
        'Differentiate $U$, then change the sign.', null, { k: 'Fexpr', U: polyPlain(c, 'x') });
      return P('A particle moves in a potential energy ' + Ut + '. Find the force on it at $x = ' + x0 + '\\ \\text{m}$' + (shape === 'dir' ? ' (positive means it pushes toward $+x$).' : '.'),
        ans(F0, 0.01),
        ['$F(x) = -\\dfrac{dU}{dx} = -\\left(' + poly(dc, 'x') + '\\right)$.', '$\\left.\\dfrac{dU}{dx}\\right|_{x = ' + x0 + '} = ' + polyAt(dc, x0) + '\\ \\text{J/m}$, so $F = ' + qg(F0, 'N') + '$.',
          F0 > 0 ? 'Positive: $U$ slopes down toward $+x$, and the force pushes downhill on the $U$ curve.' : 'Negative: $U$ slopes down toward $-x$, and the force pushes downhill on the $U$ curve.'],
        'The force is minus the slope of $U(x)$.', 'N', { k: 'Fval', U: polyPlain(c, 'x'), x: x0 });
    }
    if (shape === 'inv') { var a = R.pick([2, 4, 6, 8]), b = R.pick([2, 4, 6]), x1 = R.pick([1, 2, 3]), Fi = 2 * a / M.pow(x1, 3) - b / (x1 * x1);
      if (M.abs(Fi) < 1e-9) x1 += 1, Fi = 2 * a / M.pow(x1, 3) - b / (x1 * x1);
      return P('A simple model of the bond between two atoms has $U(x) = \\dfrac{' + a + '}{x^2} - \\dfrac{' + b + '}{x}$ (energy and distance in convenient units, with force in the matching units). Find the force at $x = ' + x1 + '$; positive means the atoms are pushed apart.',
        ans(Fi, 0.01),
        ['$\\dfrac{dU}{dx} = -\\dfrac{' + (2 * a) + '}{x^3} + \\dfrac{' + b + '}{x^2}$, so $F = -\\dfrac{dU}{dx} = \\dfrac{' + (2 * a) + '}{x^3} - \\dfrac{' + b + '}{x^2}$.', 'At $x = ' + x1 + '$: $F = \\dfrac{' + (2 * a) + '}{' + M.pow(x1, 3) + '} - \\dfrac{' + b + '}{' + (x1 * x1) + '} = ' + fx(Fi, 3) + '$.',
          Fi > 0 ? 'Positive: the atoms are closer than the bond length ($x = ' + gx(fix(2 * a / b)) + '$), so they push apart.' : 'Negative: the atoms are farther apart than the bond length ($x = ' + gx(fix(2 * a / b)) + '$), so they pull together.'],
        'Differentiate each power of $x$; then $F = -dU/dx$.', null, { k: 'Fval', U: a + '/x^2-' + b + '/x', x: x1 }); }
    var U0 = R.pick([10, 20, 30, 50]), Ls = R.pick([0.5, 1, 2]), xe = R.pick([0.5, 1, 2]), Fe = U0 / Ls * M.exp(-xe / Ls);
    return P('A particle near a charged wall has $U(x) = ' + U0 + 'e^{-x/' + gx(Ls) + '}$ (joules, $x$ in meters from the wall). Find the force on it at $x = ' + qg(xe, 'm') + '$.',
      ans(Fe, 0.02),
      ['$\\dfrac{dU}{dx} = -\\dfrac{' + U0 + '}{' + gx(Ls) + '}e^{-x/' + gx(Ls) + '}$, so $F = -\\dfrac{dU}{dx} = ' + gx(fix(U0 / Ls)) + 'e^{-x/' + gx(Ls) + '}$.', '$F(' + gx(xe) + ') = ' + gx(fix(U0 / Ls)) + 'e^{-' + gx(fix(xe / Ls)) + '} = ' + qx(Fe, 'N') + '$, positive: the wall pushes the particle away, toward lower $U$.'],
      'Use the chain rule on the exponential, then change the sign.', 'N', { k: 'Fval', U: U0 + '*e^(-x/' + Ls + ')', x: xe });
  });

  G('mech.energy-diagrams', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['turn', 'stable', 'vmax'], ['stable', 'turn', 'classify', 'vmax'], ['turn3', 'classify', 'vmax3', 'stable']));
    if (shape === 'turn') { var k = R.pick([2, 4, 8, 18, 50]), E = R.pick([1, 2, 4, 9, 16, 25]), xt = M.sqrt(2 * E / k);
      return P('A particle moves in the potential $U(x) = ' + cf(fix(k / 2)) + 'x^2$ (joules, meters) with total energy $' + qg(E, 'J') + '$. What is the largest $x$ it reaches (its turning point)?',
        ans(xt, 0.01),
        ['At a turning point the particle stops for an instant: $K = 0$, so $U(x) = E$.', '$' + cf(fix(k / 2)) + 'x^2 = ' + E + '$ gives $x^2 = ' + gx(fix(2 * E / k)) + '$.', '$x = ' + qx(xt, 'm') + '$. The particle is confined to $-' + fx(xt, 3) + ' \\le x \\le ' + fx(xt, 3) + '$.'],
        'Where is $K = 0$?', 'm', { k: 'Uturn', U: plainNum(k / 2) + '*x^2', E: E, side: 1, from: 0 }, { name: 'ph-energy', opts: { mode: 'ucurve', U: plainNum(k / 2) + '*x^2', E: E, domain: [-2 * xt, 2 * xt], x0: 0, interactive: false, quiet: true, hide: ['force', 'turning', 'equilibria', 'kgap'] } }); }
    if (shape === 'stable') { var p = R.pick([1, 4, 9]), s = M.sqrt(p), sgn = R.pick([1, -1]), Utex = (sgn > 0 ? '' : '-') + 'x^3 ' + (sgn > 0 ? '-' : '+') + ' ' + (3 * p) + 'x';
      return P('A particle moves in the potential $U(x) = ' + Utex + '$ (joules, meters). At what position is it in <b>stable</b> equilibrium?',
        ans(sgn * s, 0.01),
        ['Equilibrium: $F = -\\dfrac{dU}{dx} = 0$. Here $\\dfrac{dU}{dx} = ' + (sgn > 0 ? '' : '-') + '3x^2 ' + (sgn > 0 ? '-' : '+') + ' ' + (3 * p) + '$, which is zero at $x = \\pm' + s + '$.',
          'Stable means a minimum of $U$: $\\dfrac{d^2U}{dx^2} = ' + (sgn > 0 ? '' : '-') + '6x > 0$, which holds at $x = ' + (sgn * s) + '$.', 'So the stable equilibrium is at $x = ' + (sgn * s) + '\\ \\text{m}$; the other one, at $x = ' + (-sgn * s) + '$, is a maximum of $U$ and unstable.'],
        'Find where $dU/dx = 0$, then check the sign of $d^2U/dx^2$.', 'm', { k: 'Ustable', U: (sgn > 0 ? '' : '-') + 'x^3' + (sgn > 0 ? '-' : '+') + (3 * p) + '*x' }); }
    if (shape === 'classify') { var ab = R.pick([[1, 2], [1, 8], [2, 4], [2, 16], [1, 18]]), a = ab[0], b = ab[1], at = R.pick(['zero', 'well']), xw = M.sqrt(b / (2 * a));
      var Us = (a === 1 ? '' : a) + 'x^4 - ' + b + 'x^2';
      return P('A particle moves in the potential $U(x) = ' + Us + '$ (joules, meters). Which describes the point $x = ' + (at === 'zero' ? '0' : gx(fix(xw))) + '$?',
        mc(at === 'zero' ? 'An unstable equilibrium: $U$ has a maximum there.' : 'A stable equilibrium: $U$ has a minimum there.', [at === 'zero' ? 'A stable equilibrium: $U$ has a minimum there.' : 'An unstable equilibrium: $U$ has a maximum there.', 'Not an equilibrium: the force there is not zero.', 'A turning point: the force there is zero because the particle stops.']),
        ['$\\dfrac{dU}{dx} = ' + (4 * a) + 'x^3 - ' + (2 * b) + 'x = ' + (2 * a * 2) + 'x\\left(x^2 - ' + gx(fix(b / (2 * a))) + '\\right)$, which is zero at $x = 0$ and $x = \\pm' + gx(fix(xw)) + '$: all three are equilibria.',
          '$\\dfrac{d^2U}{dx^2} = ' + (12 * a) + 'x^2 - ' + (2 * b) + '$: at $x = 0$ it is $-' + (2 * b) + ' < 0$ (a hilltop, unstable); at $x = \\pm' + gx(fix(xw)) + '$ it is $' + gx(12 * a * xw * xw - 2 * b) + ' > 0$ (a valley, stable).',
          'A turning point depends on the energy, not only on $U$: it is where $U = E$, and there the force is generally not zero.'],
        'Find $dU/dx$ and $d^2U/dx^2$ at that point.', null, { k: 'mc' }, { name: 'ph-energy', opts: { mode: 'ucurve', U: (a === 1 ? '' : a + '*') + 'x^4-' + b + '*x^2', E: -b * b / (8 * a), domain: [-2.2 * xw, 2.2 * xw], range: [-1.25 * b * b / (4 * a), 0.6 * b * b / (4 * a)], x0: xw, interactive: false, quiet: true, hide: ['force', 'turning', 'equilibria', 'kgap'] } }); }
    if (shape === 'vmax' || shape === 'vmax3') { var m = R.pick([0.5, 1, 2, 4]), Umin = shape === 'vmax' ? 0 : -R.pick([2, 4, 8]), kk = R.pick([2, 4, 6]), E2 = R.pick([2, 4, 8, 9, 16]), vmax = M.sqrt(2 * (E2 - Umin) / m);
      var Ux = shape === 'vmax' ? kt(kk, 'x') + '^2' : cf(kk) + '(x - 1)^2 - ' + M.abs(Umin), Up = shape === 'vmax' ? kk + '*x^2' : kk + '*(x-1)^2-' + M.abs(Umin);
      return P('A $' + qg(m, 'kg') + '$ particle moves in the potential $U(x) = ' + Ux + '$ (joules, meters) with total energy $E = ' + qg(E2, 'J') + '$. What is its greatest speed?',
        ans(vmax, 0.01),
        ['$K = E - U(x)$ is largest where $U$ is smallest. The minimum is $U = ' + Umin + '\\ \\text{J}$ at $x = ' + (shape === 'vmax' ? 0 : 1) + '$.', '$K_{\\max} = ' + E2 + ' - ' + pn(Umin) + ' = ' + (E2 - Umin) + '\\ \\text{J}$.', '$v_{\\max} = \\sqrt{\\dfrac{2K_{\\max}}{m}} = \\sqrt{\\dfrac{2(' + (E2 - Umin) + ')}{' + gx(m) + '}} = ' + qx(vmax, 'ms') + '$.'],
        'Kinetic energy is the gap between the energy line and the $U$ curve.', 'ms', { k: 'Uvmax', U: Up, E: E2, m: m }); }
    // turn3: double well U = x^4 - 2c x^2, E = -s1 s2, turning points at sqrt(s1), sqrt(s2)
    var pairs = [[1, 4], [1, 7], [2, 8], [1, 9], [4, 9], [2, 6]], pr = R.pick(pairs), s1 = pr[0], s2 = pr[1], c2 = s1 + s2, E3 = -s1 * s2, outer = R.coin(), xa = M.sqrt(outer ? s2 : s1);
    return P('A particle moves in the double well $U(x) = x^4 - ' + c2 + 'x^2$ (joules, meters) with total energy $E = ' + E3 + '\\ \\text{J}$, trapped in the right-hand well. Find its ' + (outer ? 'outer' : 'inner') + ' turning point.',
      ans(xa, 0.01),
      ['Turning points: $U(x) = E$, so $x^4 - ' + c2 + 'x^2 + ' + (-E3) + ' = 0$.', 'This is a quadratic in $x^2$: $(x^2 - ' + s1 + ')(x^2 - ' + s2 + ') = 0$, so $x^2 = ' + s1 + '$ or $' + s2 + '$.',
        'In the right-hand well the particle moves between $x = \\sqrt{' + s1 + '}$ and $x = \\sqrt{' + s2 + '}$. The ' + (outer ? 'outer' : 'inner') + ' one is $x = ' + qx(xa, 'm') + '$.', 'With $E$ below the hump at $x = 0$ (where $U = 0$), it can never cross to the left well.'],
      'Set $U(x) = E$ and treat it as a quadratic in $x^2$.', 'm', { k: 'Uturn', U: 'x^4-' + c2 + '*x^2', E: E3, side: outer ? 1 : -1, from: M.sqrt(c2 / 2) },
      { name: 'ph-energy', opts: { mode: 'ucurve', U: 'x^4-' + c2 + '*x^2', E: E3, domain: [-1.25 * M.sqrt(s2), 1.25 * M.sqrt(s2)], range: [-1.25 * c2 * c2 / 4, 0.6 * c2 * c2 / 4], interactive: false, quiet: true, x0: M.sqrt(c2 / 2), hide: ['force', 'turning', 'equilibria', 'kgap'] } });
  });

  G('mech.instantaneous-power', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['Fv', 'vec', 'Fv'], ['xt', 'vec', 'Fv', 'constP'], ['constP', 'xt', 'drag', 'vec']));
    if (shape === 'Fv') { var F = R.pick([300, 400, 500, 600, 800]), v = R.pick([15, 20, 25, 30]);
      return P('A car cruises at a steady $' + qg(v, 'ms') + '$ on a level road. Air drag and rolling friction add up to $' + qg(F, 'N') + '$ against it. What power must the engine deliver to the wheels?',
        ans(F * v, 0.01),
        ['At steady speed the driving force from the road equals the resistance, $' + F + '\\ \\text{N}$.', 'Power: $P = \\dfrac{dW}{dt} = \\vec{F}\\cdot\\vec{v} = Fv = ' + F + '(' + v + ') = ' + qg(F * v, 'W') + '$ (' + gx(F * v / 1000) + ' kW).'],
        '$P = Fv$ when the force is along the velocity.', 'W', { k: 'power', F: F, v: v, kind: 'Fv' }); }
    if (shape === 'vec') { var Fx = R.int(-8, 10), Fy = R.int(-8, 10), vx = R.int(-5, 6), vy = R.int(-5, 6); if (!Fx && !Fy) Fx = 6; if (!vx && !vy) vy = 3;
      var Pv = Fx * vx + Fy * vy;
      return P('At one instant, a force $\\vec{F} = \\langle ' + Fx + ', ' + Fy + ' \\rangle\\ \\text{N}$ acts on a drone moving with $\\vec{v} = \\langle ' + vx + ', ' + vy + ' \\rangle\\ \\text{m/s}$. At what rate is the force doing work on the drone?',
        ans(Pv, 0.01),
        ['$P = \\vec{F}\\cdot\\vec{v} = F_xv_x + F_yv_y$.', '$P = (' + Fx + ')(' + vx + ') + (' + Fy + ')(' + vy + ') = ' + qg(Pv, 'W') + '$' + (Pv < 0 ? ': negative, so the force is taking energy away.' : '.')],
        'Use the dot product of force and velocity.', 'W', { k: 'power', F: [Fx, Fy], v: [vx, vy], kind: 'vec' }); }
    if (shape === 'xt') { var m = R.pick([2, 3, 4, 5]), c = [R.nz(-2, 2), R.int(-4, 5), R.int(-6, 6), 0], t1 = R.int(1, 3), dc = polyD(c), d2 = polyD(dc), vv = polyAt(dc, t1), aa = polyAt(d2, t1), Pn = m * aa * vv;
      if (Pn === 0) { c[1] += 1; dc = polyD(c); d2 = polyD(dc); vv = polyAt(dc, t1); aa = polyAt(d2, t1); Pn = m * aa * vv; }
      return P('A $' + m + '\\ \\text{kg}$ object moves along a line with $x(t) = ' + poly(c) + '$ (meters, seconds). At what rate is the net force doing work on it at $t = ' + t1 + '\\ \\text{s}$?',
        ans(Pn, 0.01),
        ['$v(t) = ' + poly(dc) + '$ and $a(t) = ' + poly(d2) + '$, so at $t = ' + t1 + '$: $v = ' + vv + '\\ \\text{m/s}$, $a = ' + aa + '\\ \\text{m/s}^2$.', 'Net force: $F = ma = ' + (m * aa) + '\\ \\text{N}$.', '$P = Fv = (' + (m * aa) + ')(' + vv + ') = ' + qg(Pn, 'W') + '$. This equals $\\dfrac{dK}{dt}$, the rate the kinetic energy changes.'],
        'Find $F = ma$ and $v$ at that instant, then multiply.', 'W', { k: 'power', m: m, x: polyPlain(c), t: t1, kind: 'dKdt' }); }
    if (shape === 'constP') { var Pw = R.pick([20, 40, 60, 80, 100]) * 1000, mc_ = R.pick([1000, 1200, 1500, 2000]), vT = R.pick([10, 15, 20, 25]), tT = mc_ * vT * vT / (2 * Pw);
      return P('A $' + gx(mc_) + '\\ \\text{kg}$ car starts from rest and its engine delivers a constant $' + gx(Pw / 1000) + '\\ \\text{kW}$ to the wheels. Ignoring friction and drag, how long does it take to reach $' + qg(vT, 'ms') + '$?',
        ans(tT, 0.01),
        ['Constant power means $\\dfrac{dK}{dt} = P$, so $K = Pt$ starting from rest.', '$\\tfrac{1}{2}mv^2 = Pt$, so $t = \\dfrac{mv^2}{2P} = \\dfrac{' + gx(mc_) + '(' + vT + ')^2}{2(' + gx(Pw) + ')} = ' + qx(tT, 's') + '$.', 'The force $P/v$ is huge at low speed and fades as the car speeds up, so the constant-acceleration equations do not apply.'],
        'With constant power, the kinetic energy grows linearly in time.', 's', { k: 'power', P: Pw, m: mc_, v: vT, kind: 'constP' }); }
    var C = 0.3, A = R.pick([2, 2.2, 2.5]), v1 = R.pick([20, 25, 30, 35]), Pd = 0.5 * C * 1.2 * A * v1 * v1 * v1;
    return P('A car has drag coefficient $C = 0.3$ and frontal area $' + qg(A, 'm2') + '$. Air density is $1.2\\ \\text{kg/m}^3$. What power does the engine need just to push through the air at $' + qg(v1, 'ms') + '$?',
      ans(Pd, 0.02),
      ['Drag force: $F_D = \\tfrac{1}{2}C\\rho Av^2 = \\tfrac{1}{2}(0.3)(1.2)(' + gx(A) + ')(' + v1 + ')^2 = ' + qx(0.5 * C * 1.2 * A * v1 * v1, 'N') + '$.', 'Power: $P = F_Dv = \\tfrac{1}{2}C\\rho Av^3 = ' + qx(Pd, 'W') + '$.', 'Because $P \\propto v^3$, driving 10% faster takes about 33% more power against drag.'],
      'Power is drag force times speed.', 'W', { k: 'power', C: C, A: A, v: v1, kind: 'drag' });
  });

  G('mech.escape-speed', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['esc', 'esc', 'mass'], ['esc', 'alt', 'hmax', 'mass'], ['vinf', 'hmax', 'alt', 'vinf']));
    var B = R.chance(0.45) ? R.pick(BODIES) : (function () { var f = R.pick([0.5, 2, 3, 4, 5, 6, 8, 10]), hh = R.pick([0.8, 1.1, 1.2, 1.5, 1.8, 2]); return { n: 'a rocky exoplanet', M: sgf(f * 5.972e24, 3), R: sgf(hh * 6.371e6, 3) }; })(), GM = GN * B.M;
    if (shape === 'mass') { var m1 = R.pick([5, 20, 50, 200, 500]), m2 = m1 * R.pick([10, 100, 1000]), ve = M.sqrt(2 * GM / B.R);
      return P('A $' + gx(m1) + '\\ \\text{kg}$ probe and a $' + gx(m2) + '\\ \\text{kg}$ probe are launched from the surface of ' + B.n + ' ($M = ' + Mtex(B) + '$, $R = ' + qg(B.R, 'm') + '$). What escape speed does the heavier probe need, in km/s? (Ignore the air.)',
        ans(ve / 1000, 0.02),
        ['To escape, $\\tfrac{1}{2}mv^2 - \\dfrac{GMm}{R} \\ge 0$. The probe\'s mass $m$ is in every term, so it cancels: $v_{\\text{esc}} = \\sqrt{\\dfrac{2GM}{R}}$, the same for both probes.',
          '$v_{\\text{esc}} = \\sqrt{\\dfrac{2(6.674 \\times 10^{-11})(' + gx(B.M) + ')}{' + gx(B.R) + '}} = ' + qx(ve, 'ms') + ' = ' + qx(ve / 1000, 'kms') + '$.', 'The heavier probe needs more energy to escape, but not more speed.'],
        'Does the probe\'s mass appear in the answer?', 'kms', { k: 'esc', GM: GM, R: B.R, want: 'vesc', scale: 1000 }); }
    if (shape === 'esc') { var ve2 = M.sqrt(2 * GM / B.R);
      return P('Find the escape speed from the surface of ' + B.n + ' ($M = ' + Mtex(B) + '$, $R = ' + qg(B.R, 'm') + '$), in km/s. ($G = 6.674 \\times 10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$; ignore the air.)',
        ans(ve2 / 1000, 0.02),
        ['Escape means reaching $r \\to \\infty$ with $v \\ge 0$, where $U = 0$ and $K \\ge 0$. So the total energy must be at least zero: $\\tfrac{1}{2}mv^2 - \\dfrac{GMm}{R} = 0$.',
          '$v_{\\text{esc}} = \\sqrt{\\dfrac{2GM}{R}} = \\sqrt{\\dfrac{2(6.674 \\times 10^{-11})(' + gx(B.M) + ')}{' + gx(B.R) + '}} = ' + qx(ve2, 'ms') + '$.', 'That is $' + qx(ve2 / 1000, 'kms') + '$.'],
        'Set the total energy $K + U$ equal to zero.', 'kms', { k: 'esc', GM: GM, R: B.R, want: 'vesc', scale: 1000 }); }
    var E = BODIES[0], GME = GN * E.M;
    if (shape === 'alt') { var h = R.pick([300, 400, 1000, 2000, 5000, 20000]) * 1000, va = M.sqrt(2 * GME / (E.R + h));
      return P('A spacecraft coasts at an altitude of $' + gx(h / 1000) + '\\ \\text{km}$ above Earth ($M = ' + Mtex(E) + '$, $R = ' + qg(E.R, 'm') + '$). What is the escape speed from that height, in km/s?',
        ans(va / 1000, 0.02),
        ['Use the distance from Earth\'s <b>center</b>: $r = R + h = ' + gx(E.R) + ' + ' + gx(h) + ' = ' + fx(E.R + h, 4) + '\\ \\text{m}$.', '$v_{\\text{esc}} = \\sqrt{\\dfrac{2GM}{r}} = ' + qx(va, 'ms') + ' = ' + qx(va / 1000, 'kms') + '$, a little less than from the surface.'],
        'The $r$ in $U = -GMm/r$ is measured from the center.', 'kms', { k: 'esc', GM: GME, R: E.R + h, want: 'vesc', scale: 1000 }); }
    if (shape === 'vinf') { var v0 = R.pick([12, 13, 14, 15, 16, 18]) * 1000, vesc = M.sqrt(2 * GME / E.R), vi = M.sqrt(v0 * v0 - vesc * vesc);
      return P('A probe leaves Earth\'s surface (ignore the air) at $' + gx(v0 / 1000) + '\\ \\text{km/s}$, faster than the escape speed. How fast is it moving when it is very far from Earth, in km/s? (Earth: $M = ' + Mtex(E) + '$, $R = ' + qg(E.R, 'm') + '$; ignore the Sun.)',
        ans(vi / 1000, 0.02),
        ['Energy is conserved: $\\tfrac{1}{2}mv_0^2 - \\dfrac{GMm}{R} = \\tfrac{1}{2}mv_{\\infty}^2 + 0$.', 'So $v_{\\infty}^2 = v_0^2 - \\dfrac{2GM}{R} = v_0^2 - v_{\\text{esc}}^2$, with $v_{\\text{esc}} = ' + qx(vesc, 'ms', 4) + '$.', '$v_{\\infty} = \\sqrt{(' + gx(v0) + ')^2 - (' + fx(vesc, 4) + ')^2} = ' + qx(vi, 'ms') + ' = ' + qx(vi / 1000, 'kms') + '$.'],
        'Far away, $U \\to 0$; set the energies equal.', 'kms', { k: 'esc', GM: GME, R: E.R, v0: v0, want: 'vinf', scale: 1000 }); }
    var vu = R.pick([3, 4, 5, 6, 7, 8]) * 1000, rmax = 1 / (1 / E.R - vu * vu / (2 * GME)), hm = rmax - E.R;
    return P('A projectile is fired straight up from Earth\'s surface at $' + gx(vu / 1000) + '\\ \\text{km/s}$ (ignore the air). How high above the surface does it rise, in km? (Earth: $M = ' + Mtex(E) + '$, $R = ' + qg(E.R, 'm') + '$.)',
      ans(hm / 1000, 0.02),
      ['At this speed $g$ is not constant over the climb, so use $U = -GMm/r$: $\\tfrac{1}{2}mv_0^2 - \\dfrac{GMm}{R} = -\\dfrac{GMm}{r_{\\max}}$.', '$\\dfrac{1}{r_{\\max}} = \\dfrac{1}{R} - \\dfrac{v_0^2}{2GM} = ' + fx(1 / E.R, 4) + ' - ' + fx(vu * vu / (2 * GME), 4) + ' = ' + fx(1 / rmax, 4) + '\\ \\text{m}^{-1}$.',
        '$r_{\\max} = ' + fx(rmax, 4) + '\\ \\text{m}$, so the height is $r_{\\max} - R = ' + qx(hm, 'm') + ' = ' + qx(hm / 1000, 'km') + '$.', '(Using $mgh$ would give $' + gx(sgf(vu * vu / (2 * g0) / 1000, 3)) + '\\ \\text{km}$, too low, because gravity weakens with height.)'],
      'Use energy conservation with $U = -GMm/r$, and measure $r$ from Earth\'s center.', 'km', { k: 'esc', GM: GME, R: E.R, v0: vu, want: 'hmax', scale: 1000 });
  });


  // ================================================================== UNIT 4: MOMENTUM AND SYSTEMS OF PARTICLES
  G('mech.impulse-integral', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['tri', 'para', 'sin'], ['sin', 'para', 'avg', 'tri'], ['bounce', 'sin', 'para', 'bounce']));
    if (shape === 'tri') { var Fm = R.pick([200, 300, 400, 600, 800, 1000]), T = R.pick([0.01, 0.02, 0.04, 0.05]), m = R.pick([0.05, 0.1, 0.15, 0.2, 0.4]), J = 0.5 * Fm * T, v = J / m;
      return P('A ' + gx(m) + ' kg puck at rest is struck. The force rises steadily from 0 to a peak of $' + qg(Fm, 'N') + '$ at the middle of a $' + qg(T, 's') + '$ contact, then falls steadily back to 0 (the graph). How fast does the puck move afterward?',
        ans(v, 0.01),
        ['The impulse is the area under the $F$–$t$ graph: a triangle, $J = \\tfrac{1}{2}F_{\\max}\\Delta t = \\tfrac{1}{2}(' + Fm + ')(' + gx(T) + ') = ' + qx(J, 'Ns') + '$.', '$J = \\Delta p = mv$ (it starts at rest), so $v = \\dfrac{' + fx(J, 4) + '}{' + gx(m) + '} = ' + qx(v, 'ms') + '$.', 'Peak force times contact time would give $' + gx(Fm * T) + '\\ \\text{N·s}$, twice the true impulse.'],
        'Find the area under the force graph, then use $J = \\Delta p$.', 'ms', { k: 'J', pts: [[0, 0], [T / 2, Fm], [T, 0]], T: T, m: m, want: 'v' },
        { name: 'ph-graph', opts: { pts: [[0, 0], [T / 2, Fm], [T, 0]], xlab: 't', ylab: 'F', xunit: 's', yunit: 'N', tool: 'none', interactive: false, quiet: true } }); }
    if (shape === 'para') { var a = R.pick([2, 3, 4, 6, 12]) * 1e5, T2 = R.pick([0.01, 0.02, 0.03]), J2 = a * T2 * T2 * T2 / 6, Jsh = sgf(J2, 3);
      return P('During a kick, the force on a ball is modeled as $F(t) = at(T - t)$ for $0 \\le t \\le T$, with $a = ' + gx(a) + '\\ \\text{N/s}^2$ and $T = ' + qg(T2, 's') + '$. Find the impulse.',
        ans(J2, 0.01),
        ['$J = \\int_0^T at(T - t)\\,dt = a\\left[\\dfrac{Tt^2}{2} - \\dfrac{t^3}{3}\\right]_0^T = \\dfrac{aT^3}{6}$.', '$J = \\dfrac{(' + gx(a) + ')(' + gx(T2) + ')^3}{6} = ' + qx(J2, 'Ns') + '$.'],
        'Integrate the force over the contact time.', 'Ns', { k: 'J', F: a + '*x*(' + T2 + '-x)', T: T2, want: 'J' }); }
    var F0 = R.pick([500, 800, 1000, 1200, 1500, 2000]), Ts = R.pick([0.005, 0.008, 0.01, 0.02]), Js = 2 * F0 * Ts / PI;
    if (shape === 'sin') { var ms = R.pick([0.045, 0.057, 0.145, 0.43]), vs = Js / ms;
      return P('A bat pushes a $' + qg(ms, 'kg') + '$ ball, initially at rest, with $F(t) = ' + F0 + '\\sin\\left(\\dfrac{\\pi t}{' + gx(Ts) + '}\\right)$ newtons for $0 \\le t \\le ' + gx(Ts) + '\\ \\text{s}$. Find the ball\'s speed afterward. (Ignore gravity during contact.)',
        ans(vs, 0.02),
        ['$J = \\int_0^{T} F_0\\sin\\left(\\dfrac{\\pi t}{T}\\right)dt = F_0\\dfrac{T}{\\pi}\\left[-\\cos\\dfrac{\\pi t}{T}\\right]_0^{T} = \\dfrac{2F_0T}{\\pi}$.', '$J = \\dfrac{2(' + F0 + ')(' + gx(Ts) + ')}{\\pi} = ' + qx(Js, 'Ns') + '$.', '$v = \\dfrac{J}{m} = \\dfrac{' + fx(Js, 4) + '}{' + gx(ms) + '} = ' + qx(vs, 'ms') + '$.'],
        'Integrate the force over the contact time, then divide by the mass.', 'ms', { k: 'J', F: F0 + '*sin(pi*x/' + Ts + ')', T: Ts, m: ms, want: 'v' }); }
    if (shape === 'avg') return P('A force $F(t) = ' + F0 + '\\sin\\left(\\dfrac{\\pi t}{' + gx(Ts) + '}\\right)$ newtons acts for $0 \\le t \\le ' + gx(Ts) + '\\ \\text{s}$. What constant force would give the same impulse over the same time (the average force)?',
      ans(2 * F0 / PI, 0.01),
      ['$J = \\int_0^T F\\,dt = \\dfrac{2F_0T}{\\pi} = ' + qx(Js, 'Ns') + '$.', '$F_{\\text{avg}} = \\dfrac{J}{T} = \\dfrac{2F_0}{\\pi} = ' + qx(2 * F0 / PI, 'N') + '$, about 64% of the peak.'],
      'The average force is the impulse divided by the time.', 'N', { k: 'J', F: F0 + '*sin(pi*x/' + Ts + ')', T: Ts, want: 'Favg' });
    var mb = R.pick([0.06, 0.1, 0.15, 0.2]), vin = R.pick([10, 12, 15, 20]), vout = R.pick([6, 8, 10, 12]), Tb = R.pick([0.004, 0.005, 0.008, 0.01]), Fmax = PI * mb * (vin + vout) / (2 * Tb);
    return P('A $' + qg(mb, 'kg') + '$ ball hits a wall at $' + qg(vin, 'ms') + '$ and bounces straight back at $' + qg(vout, 'ms') + '$. The contact lasts $' + qg(Tb, 's') + '$, and the wall\'s force follows $F_{\\max}\\sin(\\pi t/T)$. Find the peak force $F_{\\max}$.',
      ans(Fmax, 0.02),
      ['Take the bounce direction as positive: $\\Delta p = m(v_{\\text{out}} - (-v_{\\text{in}})) = ' + gx(mb) + '(' + vout + ' + ' + vin + ') = ' + qx(mb * (vin + vout), 'Ns', 4) + '$. The speeds add, because the direction reverses.',
        'The impulse of a half-sine pulse is $\\dfrac{2F_{\\max}T}{\\pi}$. Set it equal to $\\Delta p$: $F_{\\max} = \\dfrac{\\pi\\,\\Delta p}{2T} = \\dfrac{\\pi(' + fx(mb * (vin + vout), 4) + ')}{2(' + gx(Tb) + ')} = ' + qx(Fmax, 'N') + '$.'],
      'A bounce reverses the velocity, so the change in momentum uses the sum of the speeds.', 'N', { k: 'J', F: 'sin(pi*x/' + Tb + ')', T: Tb, m: mb, vin: vin, vout: vout, want: 'Fmax' });
  });

  G('mech.elastic-collisions-1d', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['target2', 'target1', 'target2'], ['target1', 'target2', 'both', 'both'], ['both', 'frac', 'both', 'target1']));
    var m1 = R.int(1, 6), m2 = R.int(1, 6); if (m1 === m2 && shape !== 'both') m2 = m1 + R.int(1, 3);
    var v1 = R.int(2, 8), v2 = shape === 'both' ? -R.int(1, 6) : 0, S = m1 + m2;
    var u1 = ((m1 - m2) * v1 + 2 * m2 * v2) / S, u2 = ((m2 - m1) * v2 + 2 * m1 * v1) / S;
    var setup = 'A $' + m1 + '\\ \\text{kg}$ glider moving at $' + v1 + '\\ \\text{m/s}$ collides elastically with a $' + m2 + '\\ \\text{kg}$ glider ' + (v2 ? 'moving toward it at $' + (-v2) + '\\ \\text{m/s}$' : 'at rest') + ' on a frictionless air track. ';
    var st = ['Momentum: $' + T.terms(v2 ? [[m1, '(' + v1 + ')'], [m2, '(' + v2 + ')']] : [[m1, '(' + v1 + ')']]) + ' = ' + cf(m1) + 'v_1\' + ' + cf(m2) + 'v_2\'$, so $' + cf(m1) + 'v_1\' + ' + cf(m2) + 'v_2\' = ' + (m1 * v1 + m2 * v2) + '$.',
      'Elastic: kinetic energy is conserved too. Together the two equations give $v_1 - v_2 = -(v_1\' - v_2\')$: the relative velocity reverses, so $v_2\' - v_1\' = ' + v1 + ' - ' + pn(v2) + ' = ' + (v1 - v2) + '$.',
      'Solve the two linear equations: $v_1\' = ' + qx(u1, 'ms') + '$ and $v_2\' = ' + qx(u2, 'ms') + '$.'];
    var chk = { k: 'el', m1: m1, m2: m2, v1: v1, v2: v2 };
    if (shape === 'frac') { var f = 4 * m1 * m2 / (S * S);
      return P('A $' + m1 + '\\ \\text{kg}$ ball moving at $' + v1 + '\\ \\text{m/s}$ hits a $' + m2 + '\\ \\text{kg}$ ball at rest, head-on and elastically. What fraction of its kinetic energy is passed to the second ball?',
        ans(f, 0.01),
        ['After the collision, $v_2\' = \\dfrac{2m_1}{m_1 + m_2}v_1 = \\dfrac{' + (2 * m1) + '}{' + S + '}(' + v1 + ') = ' + fx(2 * m1 * v1 / S, 4) + '\\ \\text{m/s}$.', 'Fraction $= \\dfrac{\\tfrac{1}{2}m_2v_2\'^2}{\\tfrac{1}{2}m_1v_1^2} = \\dfrac{4m_1m_2}{(m_1 + m_2)^2} = \\dfrac{' + (4 * m1 * m2) + '}{' + (S * S) + '} = ' + fx(f, 3) + '$.', 'Equal masses would pass on all of it; very unequal masses pass on little.'],
        'Find $v_2\'$, then compare kinetic energies.', null, Object.assign(chk, { want: 'frac' })); }
    var want = shape === 'target1' ? 'u1' : shape === 'target2' ? 'u2' : R.pick(['u1', 'u2']);
    return P(setup + 'Find the velocity of the ' + (want === 'u1' ? 'first (' + m1 + ' kg)' : 'second (' + m2 + ' kg)') + ' glider after the collision, taking the first glider\'s original direction as positive.',
      ans(want === 'u1' ? u1 : u2, 0.01), st.concat([want === 'u1' && u1 < 0 ? 'The negative sign means the ' + m1 + ' kg glider bounces back.' : 'Check: kinetic energy before and after is ' + fx(0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2, 4) + ' J both times.']),
      'Use conservation of momentum AND the reversal of relative velocity.', 'ms', Object.assign(chk, { want: want }), { name: 'ph-collision', opts: { mode: '1d', m1: m1, m2: m2, v1: v1, v2: v2, e: 1, interactive: false, quiet: true, t: 0, hide: ['p', 'K', 'cm'], height: 150 } });
  });

  G('mech.collisions-2d', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['stick', 'stick', 'equal'], ['stick', 'glance', 'equal', 'stickang'], ['glance', 'glanceang', 'stickang', 'equal']));
    if (shape === 'stick' || shape === 'stickang') { var m1 = R.pick([800, 1000, 1200, 1500]), m2 = R.pick([1000, 1500, 2000, 2500]), v1 = R.pick([10, 12, 15, 20]), v2 = R.pick([8, 10, 12, 15]);
      var px = m1 * v1, py = m2 * v2, Mt = m1 + m2, V = M.hypot(px, py) / Mt, ang = deg(M.atan2(py, px));
      var q = 'A $' + gx(m1) + '\\ \\text{kg}$ car heading east at $' + qg(v1, 'ms') + '$ collides at an icy intersection with a $' + gx(m2) + '\\ \\text{kg}$ truck heading north at $' + qg(v2, 'ms') + '$. They lock together. ';
      var st = ['Momentum is conserved in each direction separately. East: $p_x = ' + gx(m1) + '(' + v1 + ') = ' + gx(px) + '\\ \\text{kg·m/s}$. North: $p_y = ' + gx(m2) + '(' + v2 + ') = ' + gx(py) + '\\ \\text{kg·m/s}$.'];
      if (shape === 'stick') return P(q + 'How fast is the wreck moving just after the collision?', ans(V, 0.01),
        st.concat(['After: $(' + gx(Mt) + ')\\vec{V} = \\langle ' + gx(px) + ', ' + gx(py) + ' \\rangle$, so $V = \\dfrac{\\sqrt{' + gx(px) + '^2 + ' + gx(py) + '^2}}{' + gx(Mt) + '} = ' + qx(V, 'ms') + '$.']),
        'Conserve the east and north parts of momentum separately.', 'ms', { k: 'c2d', kind: 'stick', m1: m1, m2: m2, v1: [v1, 0], v2: [0, v2], want: 'speed' }, { name: 'ph-vectors', opts: { mode: 'add', vecs: [{ x: px / 10000, y: 0, label: 'p₁' }, { x: 0, y: py / 10000, label: 'p₂' }], interactive: false, quiet: true, units: '×10⁴ kg·m/s' } });
      return P(q + 'In what direction does the wreck move? Give the angle north of east.', ans(ang, 0.01),
        st.concat(['The wreck moves along the total momentum: $\\tan\\theta = \\dfrac{p_y}{p_x} = \\dfrac{' + gx(py) + '}{' + gx(px) + '}$, so $\\theta = ' + qx(ang, 'deg') + '$ north of east.']),
        'The direction of the total momentum is the direction of motion afterward.', 'deg', { k: 'c2d', kind: 'stick', m1: m1, m2: m2, v1: [v1, 0], v2: [0, v2], want: 'angle' });
    }
    if (shape === 'equal') { var th = R.pick([20, 25, 30, 35, 40, 50, 55, 60]), v0 = R.pick([2, 3, 4, 5, 6]);
      return P('A curling stone moving at $' + qg(v0, 'ms') + '$ strikes an identical stone at rest, off center. The collision is elastic, and the first stone moves off at $' + th + '^\\circ$ to its original direction. At what angle, on the other side of the original direction, does the second stone move?',
        ans(90 - th, 0.01),
        ['Equal masses, one at rest: momentum gives $\\vec{v}_0 = \\vec{v}_1 + \\vec{v}_2$ (the masses cancel).', 'Elastic: $v_0^2 = v_1^2 + v_2^2$. Squaring the first equation gives $v_0^2 = v_1^2 + v_2^2 + 2\\vec{v}_1\\cdot\\vec{v}_2$, so $\\vec{v}_1\\cdot\\vec{v}_2 = 0$: the stones leave at right angles.',
          'So the second stone moves at $90^\\circ - ' + th + '^\\circ = ' + (90 - th) + '^\\circ$ on the other side.'],
        'Combine the vector momentum equation with energy conservation.', 'deg', { k: 'c2d', kind: 'equal', th: th, v0: v0, want: 'angle2' }); }
    // glancing: A (mA) at v0 along +x hits B (mB) at rest; A leaves at speed vA, angle thA above x; find B's speed or angle (below x)
    var mA, mB, v0g, thA, vA, pBx, pBy, vB, thB;
    for (var tries = 0; tries < 30; tries++) { // keep it physical: the kinetic energy afterward must not exceed the kinetic energy before
      mA = R.pick([0.2, 0.3, 0.4]); mB = R.pick([0.2, 0.3, 0.5, 0.6]); v0g = R.pick([3, 4, 5, 6]); thA = R.pick([25, 30, 40, 45, 50]); vA = sgf(v0g * R.pick([0.4, 0.5, 0.6]), 2);
      pBx = mA * v0g - mA * vA * M.cos(rad(thA)); pBy = -mA * vA * M.sin(rad(thA)); vB = M.hypot(pBx, pBy) / mB; thB = deg(M.atan2(-pBy, pBx));
      if (0.5 * mA * vA * vA + 0.5 * mB * vB * vB <= 0.98 * 0.5 * mA * v0g * v0g) break;
      if (tries === 29) { mA = 0.2; mB = 0.3; v0g = 4; thA = 30; vA = 2; pBx = mA * v0g - mA * vA * M.cos(rad(thA)); pBy = -mA * vA * M.sin(rad(thA)); vB = M.hypot(pBx, pBy) / mB; thB = deg(M.atan2(-pBy, pBx)); }
    }
    var qg_ = 'A $' + qg(mA, 'kg') + '$ puck moving along $+x$ at $' + qg(v0g, 'ms') + '$ hits a $' + qg(mB, 'kg') + '$ puck at rest. Afterward the first puck moves at $' + qg(vA, 'ms') + '$, $' + thA + '^\\circ$ above the $+x$ axis. ';
    var stg = ['$x$: $' + gx(mA) + '(' + v0g + ') = ' + gx(mA) + '(' + gx(vA) + ')\\cos ' + thA + '^\\circ + p_{Bx}$, so $p_{Bx} = ' + fx(pBx, 4) + '\\ \\text{kg·m/s}$.', '$y$: $0 = ' + gx(mA) + '(' + gx(vA) + ')\\sin ' + thA + '^\\circ + p_{By}$, so $p_{By} = ' + fx(pBy, 4) + '\\ \\text{kg·m/s}$.'];
    if (shape === 'glance') return P(qg_ + 'Find the speed of the second puck.', ans(vB, 0.02),
      stg.concat(['$v_B = \\dfrac{\\sqrt{p_{Bx}^2 + p_{By}^2}}{m_B} = \\dfrac{' + fx(M.hypot(pBx, pBy), 4) + '}{' + gx(mB) + '} = ' + qx(vB, 'ms') + '$.']),
      'Write momentum conservation for $x$ and for $y$ separately.', 'ms', { k: 'c2d', kind: 'glance', mA: mA, mB: mB, v0: v0g, vA: vA, thA: thA, want: 'vB' });
    return P(qg_ + 'At what angle below the $+x$ axis does the second puck move?', ans(thB, 0.02),
      stg.concat(['$\\tan\\phi = \\dfrac{|p_{By}|}{p_{Bx}} = \\dfrac{' + fx(-pBy, 4) + '}{' + fx(pBx, 4) + '}$, so $\\phi = ' + qx(thB, 'deg') + '$ below the axis.']),
      'Find the second puck\'s momentum components first.', 'deg', { k: 'c2d', kind: 'glance', mA: mA, mB: mB, v0: v0g, vA: vA, thA: thA, want: 'thB' });
  });

  G('mech.system-of-particles', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['acm', 'boat', 'acm'], ['acm', 'explode', 'boat', 'vec'], ['explode', 'vec', 'explode2', 'boat']));
    if (shape === 'acm') { var m1 = R.pick([2, 3, 4, 5]), m2 = R.pick([1, 2, 3, 6]), F = R.pick([12, 18, 24, 30, 36]), k = R.pick([50, 100, 200]);
      return P('Two blocks, $' + m1 + '\\ \\text{kg}$ and $' + m2 + '\\ \\text{kg}$, sit on frictionless ice joined by a spring ($k = ' + qg(k, 'Nperm') + '$). You pull the ' + m1 + ' kg block with a steady horizontal $' + qg(F, 'N') + '$ force, and the blocks jostle back and forth as the spring stretches and squeezes. What is the acceleration of the system\'s center of mass?',
        ans(F / (m1 + m2), 0.01),
        ['For the whole system, $\\Sigma\\vec{F}_{\\text{ext}} = M\\vec{a}_{\\text{cm}}$. The spring forces are internal: they come in equal and opposite pairs and cancel.', 'The only external horizontal force is your pull (gravity and the normal forces cancel vertically).', '$a_{\\text{cm}} = \\dfrac{' + F + '}{' + m1 + ' + ' + m2 + '} = ' + qx(F / (m1 + m2), 'ms2') + '$, steady, even while each block\'s acceleration changes.'],
        'Which forces are internal to the system?', 'ms2', { k: 'sys', kind: 'acm', m1: m1, m2: m2, F: F, kk: k }); }
    if (shape === 'vec') { var ms = [R.int(1, 4), R.int(1, 4), R.int(1, 4)], Fx = R.int(-6, 8), Fy = R.int(-6, 8), Gx = R.int(-6, 6), Gy = R.int(-6, 6); if (!(Fx + Gx) && !(Fy + Gy)) Fx += 4;
      var Mt = ms[0] + ms[1] + ms[2], ac = M.hypot(Fx + Gx, Fy + Gy) / Mt;
      return P('Three pucks ($' + ms.join('$, $') + '\\ \\text{kg}$) are linked by strings and slide on frictionless ice. Outside forces $\\vec{F}_1 = \\langle ' + Fx + ', ' + Fy + ' \\rangle\\ \\text{N}$ and $\\vec{F}_2 = \\langle ' + Gx + ', ' + Gy + ' \\rangle\\ \\text{N}$ act on two of them, and the strings pull the pucks on each other. Find the size of the acceleration of their center of mass.',
        ans(ac, 0.01),
        ['String tensions are internal and cancel in pairs. Net external force: $\\langle ' + (Fx + Gx) + ', ' + (Fy + Gy) + ' \\rangle\\ \\text{N}$.', 'Total mass: $M = ' + Mt + '\\ \\text{kg}$.', '$a_{\\text{cm}} = \\dfrac{|\\Sigma\\vec{F}_{\\text{ext}}|}{M} = \\dfrac{\\sqrt{' + pn(Fx + Gx) + '^2 + ' + pn(Fy + Gy) + '^2}}{' + Mt + '} = ' + qx(ac, 'ms2') + '$.'],
        'Only external forces change the motion of the center of mass.', 'ms2', { k: 'sys', kind: 'vec', ms: ms, F: [Fx + Gx, Fy + Gy] }); }
    if (shape === 'boat') { var mp = R.pick([50, 60, 70, 80]), mb = R.pick([100, 120, 150, 200, 300]), L = R.pick([2, 3, 4, 5]), db = mp * L / (mp + mb);
      return P('A $' + mp + '\\ \\text{kg}$ person stands at one end of a $' + mb + '\\ \\text{kg}$ boat floating at rest on still water. She walks $' + qg(L, 'm') + '$ to the other end. How far does the boat move? (Ignore water drag.)',
        ans(db, 0.01),
        ['No external horizontal force acts on the person-plus-boat system, and it starts at rest, so its center of mass stays put.', 'If the boat moves back by $d$, the person moves forward by $' + L + ' - d$ relative to the water. Center of mass fixed: $' + mp + '(' + L + ' - d) - ' + mb + 'd = 0$.', '$d = \\dfrac{' + mp + '(' + L + ')}{' + mp + ' + ' + mb + '} = ' + qx(db, 'm') + '$, in the direction opposite her walk.'],
        'With no external force, the center of mass doesn\'t move.', 'm', { k: 'sys', kind: 'boat', mp: mp, mb: mb, L: L }); }
    // explode: projectile launched v0 at th; at the top it splits; piece 1 (fraction f) stops dead and falls straight down
    var v0 = R.pick([20, 25, 30]), th = R.pick([30, 45, 60]), Rg = v0 * v0 * M.sin(rad(2 * th)) / g0, f = shape === 'explode' ? 0.5 : R.pick([0.25, 0.4, 0.6]), x2 = (Rg - f * Rg / 2) / (1 - f);
    return P('A shell is fired at $' + qg(v0, 'ms') + '$ at $' + th + '^\\circ$ over level ground. At the top of its path it breaks into two pieces: ' + (f === 0.5 ? 'two equal halves. One half' : 'a piece with ' + (f * 100) + '% of the mass, which') + ' stops dead and falls straight down. Where does the other piece land, measured from the launch point? (Ignore the air.)',
      ans(x2, 0.01),
      ['The explosion\'s forces are internal, so the center of mass keeps following the original parabola and lands where the unbroken shell would have: $R = \\dfrac{v_0^2\\sin 2\\theta}{g} = ' + qx(Rg, 'm', 4) + '$.', 'The first piece falls straight down from the top, landing at $R/2 = ' + qx(Rg / 2, 'm', 4) + '$. Both pieces start the fall with zero vertical velocity, so they land at the same time.',
        'Center of mass at landing: $' + gx(f) + '(' + fx(Rg / 2, 4) + ') + ' + gx(fix(1 - f)) + 'x_2 = ' + fx(Rg, 4) + '$, so $x_2 = ' + qx(x2, 'm') + '$.'],
      'The center of mass ignores the explosion.', 'm', { k: 'sys', kind: 'explode', v0: v0, th: th, f: f });
  });

  G('mech.rocket-equation', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['dv', 'dv', 'thrust'], ['dv', 'ratio', 'thrust', 'fuel'], ['ratio', 'accel', 'fuel', 'dv']));
    var ve = R.pick([2000, 2500, 3000, 3500, 4000, 4500]);
    if (shape === 'dv') { var m0 = R.pick([1000, 2000, 5000, 10000]), frac = R.pick([0.5, 0.6, 0.7, 0.8, 0.9]), mf = m0 * (1 - frac), dv = ve * M.log(m0 / mf);
      return P('A rocket in deep space (no gravity, no air) starts with a mass of $' + gx(m0) + '\\ \\text{kg}$, of which ' + (frac * 100) + '% is fuel. Its exhaust leaves at $' + gx(ve) + '\\ \\text{m/s}$ relative to the rocket. How much does its speed increase when all the fuel is burned?',
        ans(dv, 0.01),
        ['The rocket equation: $\\Delta v = v_e\\ln\\dfrac{m_0}{m_f}$.', 'Final mass: $m_f = ' + gx(m0) + ' - ' + gx(m0 * frac) + ' = ' + gx(mf) + '\\ \\text{kg}$, so $\\dfrac{m_0}{m_f} = ' + fx(m0 / mf, 4) + '$.', '$\\Delta v = ' + gx(ve) + '\\ln(' + fx(m0 / mf, 4) + ') = ' + qx(dv, 'ms') + '$.'],
        'Use $\\Delta v = v_e\\ln(m_0/m_f)$.', 'ms', { k: 'rocket', ve: ve, m0: m0, mf: mf, want: 'dv' }); }
    if (shape === 'ratio' || shape === 'fuel') { var dvr = R.pick([3000, 4000, 5000, 6000, 8000, 9000]), ratio = M.exp(dvr / ve), ff = 1 - 1 / ratio;
      if (shape === 'ratio') return P('A rocket with exhaust speed $' + gx(ve) + '\\ \\text{m/s}$ must gain $' + gx(dvr) + '\\ \\text{m/s}$ in empty space. What mass ratio $m_0/m_f$ does it need?',
        ans(ratio, 0.02),
        ['$\\Delta v = v_e\\ln\\dfrac{m_0}{m_f}$, so $\\dfrac{m_0}{m_f} = e^{\\Delta v/v_e}$.', '$\\dfrac{m_0}{m_f} = e^{' + gx(dvr) + '/' + gx(ve) + '} = e^{' + fx(dvr / ve, 4) + '} = ' + fx(ratio, 3) + '$.', 'The ratio grows exponentially with $\\Delta v$: that is why big rockets are mostly fuel.'],
        'Solve the rocket equation for $m_0/m_f$.', null, { k: 'rocket', ve: ve, dv: dvr, want: 'ratio' });
      return P('A rocket with exhaust speed $' + gx(ve) + '\\ \\text{m/s}$ must gain $' + gx(dvr) + '\\ \\text{m/s}$ in empty space. What percent of its starting mass must be fuel?',
        { t: 'num', v: sfStr(ff * 100, 3), rtol: 0.02, pct: true },
        ['$\\dfrac{m_0}{m_f} = e^{\\Delta v/v_e} = e^{' + fx(dvr / ve, 4) + '} = ' + fx(ratio, 4) + '$.', 'Fuel fraction: $1 - \\dfrac{m_f}{m_0} = 1 - \\dfrac{1}{' + fx(ratio, 4) + '} = ' + fx(ff, 3) + '$, or $' + fx(ff * 100, 3) + '\\%$.'],
        'Find $m_0/m_f$ first; the fuel is everything except $m_f$.', null, { k: 'rocket', ve: ve, dv: dvr, want: 'fuelpct' }); }
    var mdot = R.pick([10, 20, 50, 100, 200]), m0t = R.pick([2000, 5000, 8000, 10000]), thrust = ve * mdot;
    if (shape === 'thrust') return P('A rocket engine burns $' + mdot + '\\ \\text{kg}$ of fuel per second, and the exhaust leaves at $' + gx(ve) + '\\ \\text{m/s}$ relative to the rocket. What is the thrust?',
      ans(thrust, 0.01),
      ['Each second, $' + mdot + '\\ \\text{kg}$ of gas is pushed from the rocket\'s speed to $' + gx(ve) + '\\ \\text{m/s}$ backward relative to it: the rocket gives the gas momentum $' + gx(ve) + '(' + mdot + ')$ each second.', 'By Newton\'s third law the gas pushes the rocket forward with $F = v_e\\left|\\dfrac{dm}{dt}\\right| = ' + gx(ve) + '(' + mdot + ') = ' + qg(thrust, 'N') + '$.'],
      'Thrust is the momentum given to the exhaust each second.', 'N', { k: 'rocket', ve: ve, mdot: mdot, want: 'thrust' });
    if (thrust <= m0t * g0) m0t = M.floor(thrust / (2 * g0) / 100) * 100;
    var a0 = thrust / m0t - g0;
    return P('A $' + gx(m0t) + '\\ \\text{kg}$ rocket stands on the launch pad. Its engine burns $' + mdot + '\\ \\text{kg/s}$ with an exhaust speed of $' + gx(ve) + '\\ \\text{m/s}$. What is its upward acceleration just after liftoff?',
      ans(a0, 0.02),
      ['Thrust: $v_e\\left|\\dfrac{dm}{dt}\\right| = ' + gx(ve) + '(' + mdot + ') = ' + gx(thrust) + '\\ \\text{N}$.', 'Weight: $mg = ' + gx(m0t) + '(9.8) = ' + gx(m0t * g0) + '\\ \\text{N}$.', '$a = \\dfrac{' + gx(thrust) + ' - ' + gx(m0t * g0) + '}{' + gx(m0t) + '} = ' + qx(a0, 'ms2') + '$. It grows as fuel burns and the rocket gets lighter.'],
      'Net force is thrust minus weight.', 'ms2', { k: 'rocket', ve: ve, mdot: mdot, m0: m0t, want: 'a0' });
  });


  // ================================================================== UNIT 5: ROTATION OF RIGID BODIES
  var SHP = { hoop: { c: 1, n: 'thin hoop', t: '1', I: 'MR^2' }, disk: { c: 0.5, n: 'solid disk', t: '\\tfrac{1}{2}', I: '\\tfrac{1}{2}MR^2' }, sphere: { c: 0.4, n: 'solid ball', t: '\\tfrac{2}{5}', I: '\\tfrac{2}{5}MR^2' }, shell: { c: 2 / 3, n: 'hollow ball (thin shell)', t: '\\tfrac{2}{3}', I: '\\tfrac{2}{3}MR^2' } };

  G('mech.angular-calculus', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['omega', 'alpha', 'omega'], ['omega', 'int', 'deg', 'alpha'], ['deg', 'int', 'intth', 'omega']));
    if (shape === 'omega' || shape === 'alpha') { var c = [R.nz(-2, 3), R.int(-4, 6), R.int(-5, 8), 0], t1 = R.int(1, 4), d1 = polyD(c), d2 = polyD(d1), w = polyAt(d1, t1), al = polyAt(d2, t1), isW = shape === 'omega';
      return P('A turntable\'s angle is $\\theta(t) = ' + poly(c) + '$ ($\\theta$ in radians, $t$ in seconds). Find its ' + (isW ? 'angular velocity' : 'angular acceleration') + ' at $t = ' + t1 + '\\ \\text{s}$.',
        ans(isW ? w : al, 0.01),
        ['$\\omega(t) = \\dfrac{d\\theta}{dt} = ' + poly(d1) + '$.'].concat(isW ? ['$\\omega(' + t1 + ') = ' + subst(d1, t1) + ' = ' + qg(w, 'rads') + '$.'] : ['$\\alpha(t) = \\dfrac{d\\omega}{dt} = ' + poly(d2) + '$.', '$\\alpha(' + t1 + ') = ' + subst(d2, t1) + ' = ' + qg(al, 'rads2') + '$.']),
        isW ? 'Differentiate the angle.' : 'Differentiate the angle twice.', isW ? 'rads' : 'rads2', { k: 'd', f: polyPlain(c), n: isW ? 1 : 2, t: t1 }); }
    if (shape === 'deg') { var k = R.pick([10, 15, 20, 30, 45, 60, 90]), t2 = R.int(1, 4), wd = 2 * k * t2, wr = wd * PI / 180;
      return P('A camera mount turns through an angle $\\theta(t) = ' + kt(k) + '^2$ <b>degrees</b> ($t$ in seconds). Find its angular velocity at $t = ' + t2 + '\\ \\text{s}$ in rad/s.',
        ans(wr, 0.01),
        ['$\\dfrac{d\\theta}{dt} = ' + kt(2 * k) + '$ degrees per second, so at $t = ' + t2 + '$ it is $' + wd + '^\\circ/\\text{s}$.', 'Convert: $' + wd + '^\\circ/\\text{s} \\times \\dfrac{\\pi\\ \\text{rad}}{180^\\circ} = ' + qx(wr, 'rads') + '$.', 'Formulas like $v = r\\omega$ and $K = \\tfrac{1}{2}I\\omega^2$ need $\\omega$ in rad/s, so convert before using them.'],
        'Differentiate, then convert degrees to radians.', 'rads', { k: 'd', f: '(' + k + '*t^2)*pi/180', n: 1, t: t2 }); }
    var ca = R.pick([[R.nz(-3, 4) * 2, R.int(-4, 6)], [R.nz(-2, 3) * 3, R.int(-4, 4) * 2, R.int(-5, 5)]]), w0 = R.int(0, 6), t3 = R.int(1, 4), wc = polyI(ca); wc[wc.length - 1] = w0; var thc = polyI(wc), wT = polyAt(wc, t3), thT = polyAt(thc, t3), asTh = shape === 'intth';
    return P('A wheel turning at $' + w0 + '\\ \\text{rad/s}$ at $t = 0$ has angular acceleration $\\alpha(t) = ' + poly(ca) + '$ (rad/s², seconds). Find ' + (asTh ? 'the angle it turns through in the first $' + t3 + '\\ \\text{s}$' : 'its angular velocity at $t = ' + t3 + '\\ \\text{s}$') + '.',
      ans(asTh ? thT : wT, 0.01),
      ['$\\omega(t) = \\omega_0 + \\int_0^t \\alpha\\,dt\' = ' + poly(wc) + '$.'].concat(asTh ? ['$\\theta(t) = \\int_0^t \\omega\\,dt\' = ' + poly(thc) + '$ (starting from $\\theta = 0$).', '$\\theta(' + t3 + ') = ' + subst(thc, t3) + ' = ' + qx(thT, 'rad', 4) + '$.'] : ['$\\omega(' + t3 + ') = ' + subst(wc, t3) + ' = ' + qg(wT, 'rads') + '$.']),
      'Integrate $\\alpha(t)$ and use $\\omega_0$ for the constant.', asTh ? 'rad' : 'rads', { k: 'ivp', a: polyPlain(ca), v0: w0, x0: 0, T: t3, want: asTh ? 'x' : 'v' });
  });

  G('mech.moment-of-inertia-integral', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['rodend', 'rodcenter', 'lin'], ['lin', 'rodend', 'disk', 'linfar'], ['linear2', 'sigma', 'linfar', 'disk']));
    var Mr = R.pick([0.5, 1, 1.5, 2, 3, 4]), L = R.pick([0.5, 1, 1.2, 1.5, 2]);
    if (shape === 'rodend' || shape === 'rodcenter') { var end = shape === 'rodend', I = end ? Mr * L * L / 3 : Mr * L * L / 12;
      return P('A uniform rod of mass $' + qg(Mr, 'kg') + '$ and length $' + qg(L, 'm') + '$ spins about an axis perpendicular to it through ' + (end ? 'one end' : 'its center') + '. Find its moment of inertia by integration.',
        ans(I, 0.01),
        ['Slice the rod: a piece of length $dx$ has mass $dm = \\dfrac{M}{L}dx$ and sits a distance $|x|$ from the axis, so $I = \\int x^2\\,dm$.', end ? '$I = \\dfrac{M}{L}\\int_0^{L} x^2\\,dx = \\dfrac{M}{L}\\cdot\\dfrac{L^3}{3} = \\dfrac{1}{3}ML^2$.' : '$I = \\dfrac{M}{L}\\int_{-L/2}^{L/2} x^2\\,dx = \\dfrac{M}{L}\\cdot\\dfrac{L^3}{12} = \\dfrac{1}{12}ML^2$.',
          '$I = \\dfrac{1}{' + (end ? 3 : 12) + '}(' + gx(Mr) + ')(' + gx(L) + ')^2 = ' + qx(I, 'kgm2') + '$.'],
        'Integrate $x^2\\,dm$ with $dm = (M/L)\\,dx$, measuring $x$ from the axis.', 'kgm2', { k: 'Irod', lam: plainNum(Mr / L), L: L, axis: end ? 0 : L / 2 }); }
    if (shape === 'lin' || shape === 'linfar') { var k = R.pick([2, 3, 4, 6, 8]), far = shape === 'linfar', Il = far ? k * M.pow(L, 4) / 12 : k * M.pow(L, 4) / 4;
      return P('A rod of length $' + qg(L, 'm') + '$ has linear density $\\lambda(x) = ' + kt(k, 'x') + '$ (kg/m, $x$ in meters from end A). Find its moment of inertia about an axis through end ' + (far ? 'B (at $x = L$)' : 'A') + ', perpendicular to the rod.',
        ans(Il, 0.01),
        [far ? 'The distance from the axis at B is $L - x$, so $I = \\int_0^{L} (L - x)^2\\,' + kt(k, 'x') + '\\,dx$.' : 'The distance from the axis is $x$, so $I = \\int_0^{L} x^2 \\cdot ' + kt(k, 'x') + '\\,dx = ' + cf(k) + '\\dfrac{L^4}{4}$.',
          far ? 'Expand: $' + cf(k) + '\\int_0^{L}\\left(L^2x - 2Lx^2 + x^3\\right)dx = ' + cf(k) + 'L^4\\left(\\tfrac{1}{2} - \\tfrac{2}{3} + \\tfrac{1}{4}\\right) = ' + cf(k) + '\\dfrac{L^4}{12}$.' : 'The heavy end is far from the axis, so it counts a lot.',
          '$I = ' + gx(k) + '\\dfrac{(' + gx(L) + ')^4}{' + (far ? 12 : 4) + '} = ' + qx(Il, 'kgm2') + '$.' + (far ? ' Smaller than about A, because now the dense end is near the axis.' : '')],
        'Write $dm = \\lambda\\,dx$ and the distance from the chosen axis, then integrate.', 'kgm2', { k: 'Irod', lam: k + '*x', L: L, axis: far ? L : 0 }); }
    if (shape === 'linear2') { var a = R.pick([1, 2, 3]), b = R.pick([1, 2, 4, 6]), I2 = a * M.pow(L, 3) / 3 + b * M.pow(L, 4) / 4;
      return P('A tapered bat-like rod of length $' + qg(L, 'm') + '$ has $\\lambda(x) = ' + a + ' + ' + kt(b, 'x') + '$ (kg/m, $x$ in meters from the handle). Find its moment of inertia about an axis through the handle end, perpendicular to the rod.',
        ans(I2, 0.01),
        ['$I = \\int_0^{L} x^2(' + a + ' + ' + kt(b, 'x') + ')\\,dx = \\left[' + fr(a, 3) + 'x^3 + ' + fr(b, 4) + 'x^4\\right]_0^{' + gx(L) + '}$.', '$I = ' + fx(a * M.pow(L, 3) / 3, 4) + ' + ' + fx(b * M.pow(L, 4) / 4, 4) + ' = ' + qx(I2, 'kgm2') + '$.'],
        'Multiply $x^2$ by $\\lambda(x)$ and integrate over the length.', 'kgm2', { k: 'Irod', lam: a + '+' + b + '*x', L: L, axis: 0 }); }
    var Md = R.pick([1, 2, 4, 5, 10]), Rd = R.pick([0.1, 0.2, 0.25, 0.3, 0.5]);
    if (shape === 'disk') { var Id = 0.5 * Md * Rd * Rd;
      return P('A uniform solid disk of mass $' + qg(Md, 'kg') + '$ and radius $' + qg(Rd, 'm') + '$ spins about its axle. Find its moment of inertia by adding up thin rings.',
        ans(Id, 0.01),
        ['A ring of radius $r$ and width $dr$ has area $2\\pi r\\,dr$ and mass $dm = \\sigma\\,2\\pi r\\,dr$, with $\\sigma = \\dfrac{M}{\\pi R^2}$. All of it is a distance $r$ from the axle.', '$I = \\int_0^R r^2\\,\\sigma\\,2\\pi r\\,dr = 2\\pi\\sigma\\dfrac{R^4}{4} = \\dfrac{M}{\\pi R^2}\\cdot\\dfrac{\\pi R^4}{2} = \\dfrac{1}{2}MR^2$.', '$I = \\tfrac{1}{2}(' + gx(Md) + ')(' + gx(Rd) + ')^2 = ' + qx(Id, 'kgm2') + '$.'],
        'Use rings: every bit of a thin ring is the same distance from the axle.', 'kgm2', { k: 'Idisk', sigma: plainNum(Md / (PI * Rd * Rd)), R: Rd }); }
    // sigma = k r: density grows outward
    var Is = 0.6 * Md * Rd * Rd;
    return P('A disk of mass $' + qg(Md, 'kg') + '$ and radius $' + qg(Rd, 'm') + '$ is made thicker toward the rim, so its surface density grows in proportion to the distance from the center, $\\sigma(r) = kr$. Find its moment of inertia about its axle.',
      ans(Is, 0.01),
      ['Mass: $M = \\int_0^R kr\\cdot 2\\pi r\\,dr = \\dfrac{2\\pi kR^3}{3}$, so $k = \\dfrac{3M}{2\\pi R^3}$.', '$I = \\int_0^R r^2\\cdot kr\\cdot 2\\pi r\\,dr = \\dfrac{2\\pi kR^5}{5} = \\dfrac{2\\pi R^5}{5}\\cdot\\dfrac{3M}{2\\pi R^3} = \\dfrac{3}{5}MR^2$.', '$I = 0.6(' + gx(Md) + ')(' + gx(Rd) + ')^2 = ' + qx(Is, 'kgm2') + '$, more than a uniform disk\'s $0.5MR^2$ because the mass sits farther out.'],
      'Find $k$ from the total mass first, then integrate $r^2\\,dm$ over rings.', 'kgm2', { k: 'Idisk', sigma: plainNum(3 * Md / (2 * PI * M.pow(Rd, 3))) + '*x', R: Rd });
  });

  G('mech.parallel-axis', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['rod', 'disk', 'rod'], ['rod', 'disk', 'sphere', 'fromend'], ['fromend', 'combo', 'sphere', 'fromend']));
    var Mm = R.pick([0.5, 1, 2, 3, 4, 5]), L = R.pick([0.6, 0.8, 1, 1.2, 1.5, 2]), Rr = R.pick([0.1, 0.15, 0.2, 0.3, 0.4]);
    if (shape === 'rod') { var d = sgf(L * R.pick([0.1, 0.2, 0.25, 0.3, 0.4]), 2), I = Mm * L * L / 12 + Mm * d * d;
      return P('A uniform meter-stick-like rod of mass $' + qg(Mm, 'kg') + '$ and length $' + qg(L, 'm') + '$ swings about a nail through it, $' + qg(d, 'm') + '$ from its center. Find its moment of inertia about the nail (perpendicular to the rod).',
        ans(I, 0.01),
        ['About the center of mass: $I_{\\text{cm}} = \\tfrac{1}{12}ML^2 = \\tfrac{1}{12}(' + gx(Mm) + ')(' + gx(L) + ')^2 = ' + qx(Mm * L * L / 12, 'kgm2', 4) + '$.', 'Parallel-axis theorem: $I = I_{\\text{cm}} + Md^2 = ' + fx(Mm * L * L / 12, 4) + ' + ' + gx(Mm) + '(' + gx(d) + ')^2 = ' + qx(I, 'kgm2') + '$.'],
        'Start from the axis through the center of mass, then add $Md^2$.', 'kgm2', { k: 'Irod', lam: plainNum(Mm / L), L: L, axis: L / 2 + d }); }
    if (shape === 'disk') { var Id = 1.5 * Mm * Rr * Rr;
      return P('A uniform disk of mass $' + qg(Mm, 'kg') + '$ and radius $' + qg(Rr, 'm') + '$ hangs from a pin through a point on its rim and swings in its own plane. Find its moment of inertia about the pin.',
        ans(Id, 0.01),
        ['About its center (perpendicular to the disk): $I_{\\text{cm}} = \\tfrac{1}{2}MR^2$.', 'The pin is a distance $R$ from the center: $I = \\tfrac{1}{2}MR^2 + MR^2 = \\tfrac{3}{2}MR^2$.', '$I = 1.5(' + gx(Mm) + ')(' + gx(Rr) + ')^2 = ' + qx(Id, 'kgm2') + '$.'],
        'Use $I = I_{\\text{cm}} + Md^2$ with $d = R$.', 'kgm2', { k: 'Ipa', body: 'disk', M: Mm, R: Rr, d: Rr }); }
    if (shape === 'sphere') { var Isp = 1.4 * Mm * Rr * Rr;
      return P('A solid ball of mass $' + qg(Mm, 'kg') + '$ and radius $' + qg(Rr, 'm') + '$ rotates about an axis tangent to its surface. Find its moment of inertia about that axis.',
        ans(Isp, 0.01),
        ['About a diameter: $I_{\\text{cm}} = \\tfrac{2}{5}MR^2$.', 'A tangent line is parallel to a diameter at distance $R$: $I = \\tfrac{2}{5}MR^2 + MR^2 = \\tfrac{7}{5}MR^2$.', '$I = 1.4(' + gx(Mm) + ')(' + gx(Rr) + ')^2 = ' + qx(Isp, 'kgm2') + '$.'],
        'Add $MR^2$ to the center-of-mass value.', 'kgm2', { k: 'Ipa', body: 'sphere', M: Mm, R: Rr, d: Rr }); }
    if (shape === 'fromend') { var xa = sgf(L * R.pick([0.2, 0.3, 0.4, 0.75, 0.8]), 2), Ie = Mm * L * L / 3, Ic = Mm * L * L / 12, If = Ic + Mm * M.pow(xa - L / 2, 2);
      return P('A uniform rod of mass $' + qg(Mm, 'kg') + '$ and length $' + qg(L, 'm') + '$ has $I_{\\text{end}} = \\tfrac{1}{3}ML^2 = ' + qx(Ie, 'kgm2', 4) + '$ about one end. Find its moment of inertia about a parallel axis $' + qg(xa, 'm') + '$ from that same end.',
        ans(If, 0.01),
        ['The theorem only works from the center-of-mass axis. Step back to it first: $I_{\\text{cm}} = I_{\\text{end}} - M\\left(\\tfrac{L}{2}\\right)^2 = ' + fx(Ie, 4) + ' - ' + gx(Mm) + '(' + gx(L / 2) + ')^2 = ' + qx(Ic, 'kgm2', 4) + '$.',
          'The new axis is $|' + gx(xa) + ' - ' + gx(L / 2) + '| = ' + gx(fix(M.abs(xa - L / 2))) + '\\ \\text{m}$ from the center.', '$I = I_{\\text{cm}} + Md^2 = ' + fx(Ic, 4) + ' + ' + gx(Mm) + '(' + gx(fix(M.abs(xa - L / 2))) + ')^2 = ' + qx(If, 'kgm2') + '$.'],
        'Go through the center of mass: subtract, then add.', 'kgm2', { k: 'Irod', lam: plainNum(Mm / L), L: L, axis: xa }); }
    var mb = R.pick([0.2, 0.5, 1, 2]), Ib = Mm * L * L / 3 + mb * L * L;
    return P('A pendulum is a uniform rod (mass $' + qg(Mm, 'kg') + '$, length $' + qg(L, 'm') + '$) pivoted at its top end, with a small $' + qg(mb, 'kg') + '$ weight fixed at the bottom end. Find the moment of inertia of the whole thing about the pivot.',
      ans(Ib, 0.01),
      ['Rod about its end: $I_{\\text{cm}} + M(L/2)^2 = \\tfrac{1}{12}ML^2 + \\tfrac{1}{4}ML^2 = \\tfrac{1}{3}ML^2 = ' + qx(Mm * L * L / 3, 'kgm2', 4) + '$.', 'Small weight (a point mass) at distance $L$: $mL^2 = ' + qx(mb * L * L, 'kgm2', 4) + '$.', 'Moments of inertia about the same axis add: $I = ' + qx(Ib, 'kgm2') + '$.'],
      'Find each part\'s $I$ about the pivot, then add.', 'kgm2', { k: 'Irod', lam: plainNum(Mm / L), L: L, axis: 0, point: [mb, L] });
  });

  G('mech.torque-cross-product', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['z', 'z', 'mag'], ['3d', 'point', 'z', 'mag'], ['3d', 'point', 'point3', '3d']));
    if (shape === 'z' || shape === 'point') { var px = R.int(-4, 5), py = R.int(-4, 5), Fx = R.int(-6, 8), Fy = R.int(-6, 8), qx_ = shape === 'point' ? R.int(-3, 3) : 0, qy_ = shape === 'point' ? R.int(-3, 3) : 0;
      var rx = px - qx_, ry = py - qy_; if (!rx && !ry) { px += 2; rx += 2; } if (rx * Fy - ry * Fx === 0) { Fy += 3; } var tz = rx * Fy - ry * Fx;
      var where = shape === 'point' ? 'about the point $(' + qx_ + ', ' + qy_ + ')$' : 'about the origin';
      return P('A force $\\vec{F} = \\langle ' + Fx + ', ' + Fy + ', 0 \\rangle\\ \\text{N}$ acts at the point $(' + px + ', ' + py + ', 0)$ (meters). Find the $z$-component of its torque ' + where + '.',
        ans(tz, 0.01),
        [shape === 'point' ? 'Measure $\\vec{r}$ from the point the torque is about: $\\vec{r} = (' + px + ', ' + py + ') - (' + qx_ + ', ' + qy_ + ') = \\langle ' + rx + ', ' + ry + ', 0 \\rangle\\ \\text{m}$.' : '$\\vec{r} = \\langle ' + rx + ', ' + ry + ', 0 \\rangle\\ \\text{m}$ from the origin.',
          '$\\vec{\\tau} = \\vec{r}\\times\\vec{F}$ has $z$-component $\\tau_z = r_xF_y - r_yF_x = (' + rx + ')(' + Fy + ') - (' + ry + ')(' + Fx + ') = ' + qg(tz, 'Nm') + '$.', tz > 0 ? 'Positive: counterclockwise seen from $+z$.' : 'Negative: clockwise seen from $+z$.'],
        'Find $\\vec{r}$ from the pivot to where the force acts, then $r_xF_y - r_yF_x$.', 'Nm', { k: 'cross', r: [rx, ry, 0], F: [Fx, Fy, 0], want: 'z', P: [px, py, 0], Q: [qx_, qy_, 0] }); }
    if (shape === 'mag') { var r = R.pick([0.2, 0.25, 0.3, 0.4, 0.5]), F = R.pick([20, 40, 50, 60, 80, 100]), th = R.pick([30, 45, 60, 75, 90, 120, 150]), tm = r * F * M.sin(rad(th));
      return P('A wrench handle is $' + qg(r, 'm') + '$ long, measured from the bolt to where your hand pushes. You push with $' + qg(F, 'N') + '$ at $' + th + '^\\circ$ to the handle. Find the size of the torque on the bolt.',
        ans(tm, 0.01),
        ['$|\\vec{\\tau}| = |\\vec{r}\\times\\vec{F}| = rF\\sin\\theta$, with $\\theta$ the angle between $\\vec{r}$ and $\\vec{F}$.', '$\\tau = ' + gx(r) + '(' + F + ')\\sin ' + th + '^\\circ = ' + qx(tm, 'Nm') + '$.'],
        'Only the part of the force perpendicular to the handle turns the bolt.', 'Nm', { k: 'cross', r: [r, 0, 0], F: [F * M.cos(rad(th)), F * M.sin(rad(th)), 0], want: 'mag' }); }
    var rr = [R.int(-3, 3), R.int(-3, 3), R.int(-2, 3)], FF = [R.int(-4, 4), R.int(-4, 4), R.int(-4, 4)], off = shape === 'point3' ? [R.int(-2, 2), R.int(-2, 2), R.int(-2, 2)] : [0, 0, 0];
    var rv = [rr[0] - off[0], rr[1] - off[1], rr[2] - off[2]]; if (!rv[0] && !rv[1] && !rv[2]) { rr[0] += 2; rv[0] += 2; }
    var tau = [rv[1] * FF[2] - rv[2] * FF[1], rv[2] * FF[0] - rv[0] * FF[2], rv[0] * FF[1] - rv[1] * FF[0]];
    if (!tau[0] && !tau[1] && !tau[2]) { FF[2] += 1; tau = [rv[1] * FF[2] - rv[2] * FF[1], rv[2] * FF[0] - rv[0] * FF[2], rv[0] * FF[1] - rv[1] * FF[0]]; }
    return nolint(['+ 0', '1x'], P('A force $\\vec{F} = ' + vec(FF) + '\\ \\text{N}$ acts at the point $(' + rr.join(', ') + ')$ (meters). Find the torque vector about ' + (shape === 'point3' ? 'the point $(' + off.join(', ') + ')$' : 'the origin') + ', in N·m.',
      { t: 'tuple', v: tau.map(String) },
      [(shape === 'point3' ? '$\\vec{r}$ runs from the pivot to the point of application: $\\vec{r} = ' + vec(rv) + '\\ \\text{m}$.' : '$\\vec{r} = ' + vec(rv) + '\\ \\text{m}$.'),
        '$\\vec{\\tau} = \\vec{r}\\times\\vec{F} = \\langle r_yF_z - r_zF_y,\\ r_zF_x - r_xF_z,\\ r_xF_y - r_yF_x \\rangle$.',
        '$\\vec{\\tau} = \\langle ' + pn(rv[1]) + '(' + FF[2] + ') - ' + pn(rv[2]) + '(' + FF[1] + '),\\ ' + pn(rv[2]) + '(' + FF[0] + ') - ' + pn(rv[0]) + '(' + FF[2] + '),\\ ' + pn(rv[0]) + '(' + FF[1] + ') - ' + pn(rv[1]) + '(' + FF[0] + ') \\rangle = ' + vec(tau) + '\\ \\text{N·m}$.'],
      'Order matters: $\\vec{r}\\times\\vec{F}$, with $\\vec{r}$ from the pivot.', null, { k: 'cross', r: rv, F: FF, want: 'vec', P: rr, Q: off }));
  });

  G('mech.rolling-dynamics', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['accel', 'speed', 'accel'], ['accel', 'friction', 'speed', 'mu'], ['mu', 'friction', 'speed', 'accel']));
    var key = R.pick(['hoop', 'disk', 'sphere', 'shell']), S = SHP[key], c = S.c, th = R.pick([10, 15, 20, 25, 30, 35]), sn = M.sin(rad(th)), a = g0 * sn / (1 + c);
    var who = 'A ' + S.n + ' ($I = ' + S.I + '$)';
    if (shape === 'accel') return P(who + ' rolls without slipping down a ramp tilted at $' + th + '^\\circ$. Find its acceleration.',
      ans(a, 0.01),
      ['Along the ramp: $Mg\\sin\\theta - f = Ma$. About the center: $fR = I\\alpha = ' + S.t + 'MR^2\\cdot\\dfrac{a}{R}$, using the rolling condition $a = R\\alpha$.', 'So $f = ' + S.t + 'Ma$, and $Mg\\sin\\theta = Ma(1 + ' + S.t + ')$.', '$a = \\dfrac{g\\sin\\theta}{1 + ' + S.t + '} = \\dfrac{9.8\\sin ' + th + '^\\circ}{' + gx(fix(1 + c)) + '} = ' + qx(a, 'ms2') + '$.'],
      'Write the force equation and the torque equation, linked by $a = R\\alpha$.', 'ms2', { k: 'roll', c: c, th: th, want: 'a' }, { name: 'ph-rotation', opts: { mode: 'race', shapes: [key], angle: th, interactive: false, quiet: true, t: 0 } });
    if (shape === 'speed') { var hh = R.pick([0.5, 1, 1.5, 2, 3]), v = M.sqrt(2 * g0 * hh / (1 + c));
      return P(who + ' starts from rest and rolls without slipping down a ramp, dropping a height of $' + qg(hh, 'm') + '$. How fast is it moving at the bottom?',
        ans(v, 0.01),
        ['Static friction does no work on a rolling object (the contact point is momentarily at rest), so mechanical energy is conserved.', '$Mgh = \\tfrac{1}{2}Mv^2 + \\tfrac{1}{2}I\\omega^2 = \\tfrac{1}{2}Mv^2\\left(1 + ' + S.t + '\\right)$, using $\\omega = v/R$.', '$v = \\sqrt{\\dfrac{2gh}{1 + ' + S.t + '}} = \\sqrt{\\dfrac{2(9.8)(' + gx(hh) + ')}{' + gx(fix(1 + c)) + '}} = ' + qx(v, 'ms') + '$.'],
        'Share the energy between moving and spinning.', 'ms', { k: 'roll', c: c, th: 30, h: hh, want: 'v' }); }
    var m = R.pick([0.5, 1, 2, 4, 5]), f = c * m * a, mu = c * M.tan(rad(th)) / (1 + c);
    if (shape === 'friction') return P('A $' + qg(m, 'kg') + '$ ' + S.n + ' ($I = ' + S.I + '$) rolls without slipping down a $' + th + '^\\circ$ ramp. How large is the static friction force on it?',
      ans(f, 0.01),
      ['Acceleration: $a = \\dfrac{g\\sin\\theta}{1 + ' + S.t + '} = ' + qx(a, 'ms2', 4) + '$.', 'Torque equation: $fR = I\\dfrac{a}{R}$, so $f = ' + S.t + 'Ma = ' + gx(fix(c)) + '(' + gx(m) + ')(' + fx(a, 4) + ') = ' + qx(f, 'N') + '$, pointing up the ramp.'],
      'Friction supplies the torque that spins the object up.', 'N', { k: 'roll', c: c, th: th, m: m, want: 'f' });
    return P('A ' + S.n + ' ($I = ' + S.I + '$) is placed on a $' + th + '^\\circ$ ramp. What is the smallest coefficient of static friction that lets it roll without slipping?',
      ans(mu, 0.01),
      ['Needed friction: $f = ' + S.t + 'Ma$ with $a = \\dfrac{g\\sin\\theta}{1 + ' + S.t + '}$, so $f = \\dfrac{' + S.t + '}{1 + ' + S.t + '}Mg\\sin\\theta$.', 'Available: $f \\le \\mu_sN = \\mu_sMg\\cos\\theta$.', '$\\mu_s \\ge \\dfrac{' + S.t + '}{1 + ' + S.t + '}\\tan\\theta = ' + gx(fix(c / (1 + c))) + '\\tan ' + th + '^\\circ = ' + fx(mu, 3) + '$.'],
      'Compare the friction rolling needs with the most static friction can give.', null, { k: 'roll', c: c, th: th, want: 'mu' });
  });

  G('mech.skidding-to-rolling', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['vf', 'time', 'vf'], ['vf', 'time', 'dist', 'loss'], ['dist', 'other', 'time', 'loss']));
    var v0 = R.pick([4, 5, 6, 7, 8, 9]), mu = R.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
    if (shape === 'other') { var key = R.pick(['hoop', 'disk', 'shell']), S = SHP[key], vf2 = v0 / (1 + S.c);
      return P('A ' + S.n + ' ($I = ' + S.I + '$) is launched sliding along a floor at $' + qg(v0, 'ms') + '$ with no spin. Kinetic friction slows it and spins it up until it rolls without slipping. What is its speed then?',
        ans(vf2, 0.01),
        ['Friction $f = \\mu_kMg$ acts backward at the contact point. It slows the center, $v = v_0 - \\mu_kgt$, and spins the object up: $fR = I\\alpha$ gives $R\\omega = \\dfrac{\\mu_kg}{' + S.t + '}t$.',
          'Angular momentum about the contact point is conserved (friction acts there and gravity balances the normal force): $Mv_0R = MvR + I\\omega = MvR(1 + ' + S.t + ')$ once $v = R\\omega$.', '$v = \\dfrac{v_0}{1 + ' + S.t + '} = \\dfrac{' + v0 + '}{' + gx(fix(1 + S.c)) + '} = ' + qx(vf2, 'ms') + '$.'],
        'Angular momentum about the contact point doesn\'t change.', 'ms', { k: 'skid', c: S.c, v0: v0, mu: mu, want: 'vf' }); }
    var t = 2 * v0 / (7 * mu * g0), vf = 5 * v0 / 7, d = 12 * v0 * v0 / (49 * mu * g0);
    var intro = 'A bowling ball (a solid sphere, $I = \\tfrac{2}{5}MR^2$) lands on the lane sliding at $' + qg(v0, 'ms') + '$ with no spin. The coefficient of kinetic friction is $' + gx(mu) + '$. ';
    var st = ['Friction $\\mu_kMg$ slows the center: $v = v_0 - \\mu_kgt$. Its torque spins the ball up: $\\mu_kMgR = \\tfrac{2}{5}MR^2\\alpha$, so $R\\omega = \\tfrac{5}{2}\\mu_kgt$.', 'It skids until $v = R\\omega$: $v_0 - \\mu_kgt = \\tfrac{5}{2}\\mu_kgt$, so $t = \\dfrac{2v_0}{7\\mu_kg} = ' + qx(t, 's', 4) + '$.'];
    if (shape === 'time') return P(intro + 'How long does it skid before it rolls without slipping?', ans(t, 0.01), st.concat(['$t = \\dfrac{2(' + v0 + ')}{7(' + gx(mu) + ')(9.8)} = ' + qx(t, 's') + '$.']),
      'Set the slowing speed equal to the growing $R\\omega$.', 's', { k: 'skid', c: 0.4, v0: v0, mu: mu, want: 't' });
    if (shape === 'vf') return P(intro + 'How fast is it moving once it rolls without slipping?', ans(vf, 0.01), st.concat(['$v = v_0 - \\mu_kgt = v_0 - \\dfrac{2}{7}v_0 = \\dfrac{5}{7}v_0 = ' + qx(vf, 'ms') + '$. The friction coefficient cancels.']),
      'Find when $v = R\\omega$, then the speed at that moment.', 'ms', { k: 'skid', c: 0.4, v0: v0, mu: mu, want: 'vf' });
    if (shape === 'dist') return P(intro + 'How far does it slide before it starts rolling without slipping?', ans(d, 0.01), st.concat(['Distance with constant deceleration $\\mu_kg$: $d = v_0t - \\tfrac{1}{2}\\mu_kgt^2 = \\dfrac{12v_0^2}{49\\mu_kg} = ' + qx(d, 'm') + '$.']),
      'Find the skid time, then use the constant-deceleration equations.', 'm', { k: 'skid', c: 0.4, v0: v0, mu: mu, want: 'd' });
    var mb = R.pick([5, 6, 7]), Kl = mb * v0 * v0 / 7;
    return P(intro + 'The ball\'s mass is $' + mb + '\\ \\text{kg}$. How much kinetic energy is turned into thermal energy while it skids?', ans(Kl, 0.01),
      st.concat(['Final speed $\\tfrac{5}{7}v_0 = ' + fx(vf, 4) + '\\ \\text{m/s}$, and final $K = \\tfrac{1}{2}Mv^2(1 + \\tfrac{2}{5}) = \\tfrac{7}{10}M\\left(\\tfrac{5}{7}v_0\\right)^2 = \\tfrac{5}{14}Mv_0^2$.', 'Lost: $\\tfrac{1}{2}Mv_0^2 - \\tfrac{5}{14}Mv_0^2 = \\tfrac{1}{7}Mv_0^2 = \\tfrac{1}{7}(' + mb + ')(' + v0 + ')^2 = ' + qx(Kl, 'J') + '$, two-sevenths of the start.']),
      'Compare the kinetic energy (moving plus spinning) before and after.', 'J', { k: 'skid', c: 0.4, v0: v0, mu: mu, m: mb, want: 'loss' });
  });

  G('mech.angular-momentum-particle', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['line', 'circle', 'line'], ['line', 'zvec', 'later', 'circle'], ['vec', 'later', 'zvec', 'vec']));
    var m = R.pick([0.5, 1, 2, 3, 4, 5]);
    if (shape === 'line') { var v = R.pick([2, 3, 4, 5, 6, 8, 10]), d = R.pick([0.5, 1, 1.5, 2, 3, 4]), L = m * v * d;
      return P('A $' + qg(m, 'kg') + '$ puck slides in a straight line at $' + qg(v, 'ms') + '$. The line passes $' + qg(d, 'm') + '$ from a post (its closest distance). What is the size of the puck\'s angular momentum about the post?',
        ans(L, 0.01),
        ['$|\\vec{L}| = |\\vec{r}\\times\\vec{p}| = rp\\sin\\phi$. The product $r\\sin\\phi$ is the perpendicular distance from the post to the line of motion, $d$.', '$L = mvd = ' + gx(m) + '(' + v + ')(' + gx(d) + ') = ' + qx(L, 'kgm2s') + '$.', 'It moves in a straight line, yet it has angular momentum about the post, and the same amount at every point of its path.'],
        'Use the perpendicular distance from the post to the line of motion.', 'kgm2s', { k: 'Lpart', m: m, r0: [-3, d, 0], v: [v, 0, 0], want: 'mag' }); }
    if (shape === 'circle') { var r = R.pick([0.5, 0.8, 1, 1.5, 2]), v2 = R.pick([2, 3, 4, 5, 6]), L2 = m * v2 * r;
      return P('A $' + qg(m, 'kg') + '$ ball on a string moves in a circle of radius $' + qg(r, 'm') + '$ at $' + qg(v2, 'ms') + '$. Find the size of its angular momentum about the center.',
        ans(L2, 0.01),
        ['On a circle, $\\vec{r}$ (from the center) is perpendicular to $\\vec{v}$, so $|\\vec{r}\\times m\\vec{v}| = mvr$.', '$L = ' + gx(m) + '(' + v2 + ')(' + gx(r) + ') = ' + qx(L2, 'kgm2s') + '$.'],
        'For circular motion the angle between $\\vec{r}$ and $\\vec{v}$ is $90^\\circ$.', 'kgm2s', { k: 'Lpart', m: m, r0: [r, 0, 0], v: [0, v2, 0], want: 'mag' }); }
    var x0 = R.int(-4, 4), y0 = R.nz(-3, 3), vx = R.nz(-4, 5), vy = R.int(-3, 3), Lz = m * (x0 * vy - y0 * vx);
    if (Lz === 0) { vx += 1; Lz = m * (x0 * vy - y0 * vx); if (Lz === 0) { y0 = y0 > 0 ? y0 + 1 : y0 - 1; Lz = m * (x0 * vy - y0 * vx); } }
    if (shape === 'zvec' || shape === 'later') { var T1 = R.int(2, 5), late = shape === 'later', X = x0 + vx * T1, Y = y0 + vy * T1;
      return P('A $' + qg(m, 'kg') + '$ particle moves with constant velocity $\\vec{v} = \\langle ' + vx + ', ' + vy + ', 0 \\rangle\\ \\text{m/s}$; at $t = 0$ it is at $(' + x0 + ', ' + y0 + ', 0)$ (meters). Find the $z$-component of its angular momentum about the origin' + (late ? ' at $t = ' + T1 + '\\ \\text{s}$' : '') + '.',
        ans(Lz, 0.01),
        (late ? ['At $t = ' + T1+ '$ it is at $(' + X + ', ' + Y + ', 0)$.', '$L_z = m(xv_y - yv_x) = ' + gx(m) + '\\left[(' + X + ')(' + vy + ') - (' + Y + ')(' + vx + ')\\right] = ' + qg(Lz, 'kgm2s') + '$.', 'Same as at $t = 0$: with no force, there is no torque, so $\\vec{L}$ stays constant even for straight-line motion.']
          : ['$\\vec{L} = \\vec{r}\\times m\\vec{v}$, whose $z$-component is $m(xv_y - yv_x)$.', '$L_z = ' + gx(m) + '\\left[(' + x0 + ')(' + vy + ') - (' + y0 + ')(' + vx + ')\\right] = ' + qg(Lz, 'kgm2s') + '$.']),
        'Use $L_z = m(xv_y - yv_x)$.', 'kgm2s', { k: 'Lpart', m: m, r0: [x0, y0, 0], v: [vx, vy, 0], t: late ? T1 : 0, want: 'z' }); }
    var r3 = [R.int(-3, 3), R.int(-3, 3), R.int(-2, 2)], v3 = [R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)], mi = R.pick([1, 2, 3]);
    var Lv = [mi * (r3[1] * v3[2] - r3[2] * v3[1]), mi * (r3[2] * v3[0] - r3[0] * v3[2]), mi * (r3[0] * v3[1] - r3[1] * v3[0])];
    if (!Lv[0] && !Lv[1] && !Lv[2]) { v3[2] += 1; Lv = [mi * (r3[1] * v3[2] - r3[2] * v3[1]), mi * (r3[2] * v3[0] - r3[0] * v3[2]), mi * (r3[0] * v3[1] - r3[1] * v3[0])]; }
    if (!Lv[0] && !Lv[1] && !Lv[2]) { r3 = [1, 2, 0]; v3 = [0, 1, 2]; Lv = [mi * 4, mi * -2, mi * 1]; }
    return P('A $' + mi + '\\ \\text{kg}$ particle is at $' + vec(r3) + '\\ \\text{m}$ with velocity $' + vec(v3) + '\\ \\text{m/s}$. Find its angular momentum vector about the origin, in kg·m²/s.',
      { t: 'tuple', v: Lv.map(String) },
      ['$\\vec{p} = m\\vec{v} = ' + vec(v3.map(function (x) { return mi * x; })) + '\\ \\text{kg·m/s}$.', '$\\vec{L} = \\vec{r}\\times\\vec{p} = ' + vec(Lv) + '\\ \\text{kg·m}^2\\text{/s}$, using $\\langle r_yp_z - r_zp_y,\\ r_zp_x - r_xp_z,\\ r_xp_y - r_yp_x \\rangle$.'],
      'Compute $\\vec{r}\\times m\\vec{v}$ component by component.', null, { k: 'Lpart', m: mi, r0: r3, v: v3, want: 'vec' });
  });

  G('mech.rotational-collisions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['omega', 'omega', 'which'], ['omega', 'loss', 'which', 'omega'], ['swing', 'loss', 'omega', 'swing']));
    if (shape === 'which') return P('A lump of clay flies horizontally into the lower end of a rod that hangs from a frictionless pivot at its top, and sticks. Which quantity is the same just before and just after the impact?',
      mc('The angular momentum of the clay and rod about the pivot', ['The linear momentum of the clay and rod', 'The kinetic energy of the clay and rod', 'The angular velocity of the clay']),
      ['During the brief impact, the pivot pushes on the rod (it would otherwise swing its top end too). That outside force changes the system\'s linear momentum.', 'But the pivot force acts <b>at</b> the pivot, so its torque about the pivot is zero, and gravity\'s torque is negligible over the short impact: angular momentum about the pivot is conserved.', 'Kinetic energy is not conserved: the clay sticks, an inelastic collision.'],
      'Which outside force acts during the impact, and where?', null, { k: 'mc' });
    var m = R.pick([0.05, 0.1, 0.2, 0.25, 0.5]), v = R.pick([5, 8, 10, 12, 15, 20]), Mr = R.pick([1, 1.5, 2, 3]), L = R.pick([0.8, 1, 1.2, 1.5]), dfrac = R.pick([1, 1, 0.75, 0.5]), d = fix(L * dfrac);
    var Irod = Mr * L * L / 3, Itot = Irod + m * d * d, w = m * v * d / Itot;
    var intro = 'A uniform rod (mass $' + qg(Mr, 'kg') + '$, length $' + qg(L, 'm') + '$) hangs at rest from a frictionless pivot at its top end. A $' + qg(m, 'kg') + '$ lump of clay moving horizontally at $' + qg(v, 'ms') + '$ hits the rod ' + (dfrac === 1 ? 'at its bottom end' : '$' + qg(d, 'm') + '$ below the pivot') + ' and sticks. ';
    var st = ['Angular momentum about the pivot is conserved (the pivot\'s force has no torque about it). Before: $L = mvd = ' + gx(m) + '(' + v + ')(' + gx(d) + ') = ' + qx(m * v * d, 'kgm2s', 4) + '$.', 'After: $I = \\tfrac{1}{3}ML^2 + md^2 = ' + fx(Irod, 4) + ' + ' + fx(m * d * d, 4) + ' = ' + qx(Itot, 'kgm2', 4) + '$.', '$\\omega = \\dfrac{mvd}{I} = \\dfrac{' + fx(m * v * d, 4) + '}{' + fx(Itot, 4) + '} = ' + qx(w, 'rads') + '$.'];
    var chk = { k: 'rotcol', m: m, v: v, M: Mr, L: L, d: d };
    if (shape === 'omega') return P(intro + 'Find the angular velocity just after the impact.', ans(w, 0.01), st, 'Conserve angular momentum about the pivot.', 'rads', Object.assign(chk, { want: 'w' }));
    if (shape === 'loss') { var K0 = 0.5 * m * v * v, K1 = 0.5 * Itot * w * w, fl = 1 - K1 / K0;
      return P(intro + 'What fraction of the clay\'s kinetic energy is lost in the impact?', ans(fl, 0.01),
        st.concat(['$K_{\\text{before}} = \\tfrac{1}{2}mv^2 = ' + qx(K0, 'J', 4) + '$; $K_{\\text{after}} = \\tfrac{1}{2}I\\omega^2 = ' + qx(K1, 'J', 4) + '$.', 'Fraction lost: $1 - \\dfrac{' + fx(K1, 4) + '}{' + fx(K0, 4) + '} = ' + fx(fl, 3) + '$.']),
        'Find $\\omega$ from angular momentum, then compare kinetic energies.', null, Object.assign(chk, { want: 'loss' })); }
    var K1s = 0.5 * Itot * w * w, ycm = (Mr * L / 2 + m * d), cosT = 1 - K1s / (g0 * ycm), ang = deg(M.acos(cosT));
    if (!(cosT > -0.99)) return P(intro + 'Find the angular velocity just after the impact.', ans(w, 0.01), st, 'Conserve angular momentum about the pivot.', 'rads', Object.assign(chk, { want: 'w' }));
    return P(intro + 'How far does the rod swing up (its angle from vertical) before it stops?', ans(ang, 0.01),
      st.concat(['After the impact, energy is conserved: $\\tfrac{1}{2}I\\omega^2 = \\left(M\\tfrac{L}{2} + md\\right)g(1 - \\cos\\theta)$, since the rod\'s center rises $\\tfrac{L}{2}(1 - \\cos\\theta)$ and the clay rises $d(1 - \\cos\\theta)$.',
        '$1 - \\cos\\theta = \\dfrac{' + fx(K1s, 4) + '}{(' + fx(ycm, 4) + ')(9.8)} = ' + fx(1 - cosT, 4) + '$, so $\\theta = ' + qx(ang, 'deg') + '$.']),
      'Two stages: angular momentum through the impact, then energy for the swing.', 'deg', Object.assign(chk, { want: 'swing' }));
  });

  G('mech.rotational-work-power', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['P', 'omega', 'P'], ['P', 'W', 'omega', 'Prpm'], ['W', 'Wvar', 'Prpm', 'omega']));
    if (shape === 'P') { var tau = R.pick([20, 50, 80, 100, 150, 200]), w = R.pick([10, 20, 30, 50, 100]);
      return P('A motor applies a steady torque of $' + qg(tau, 'Nm') + '$ to a shaft spinning at $' + qg(w, 'rads') + '$. What power does it deliver?',
        ans(tau * w, 0.01),
        ['In a small turn $d\\theta$ the torque does work $dW = \\tau\\,d\\theta$, so $P = \\dfrac{dW}{dt} = \\tau\\dfrac{d\\theta}{dt} = \\tau\\omega$.', '$P = ' + tau + '(' + w + ') = ' + qg(tau * w, 'W') + '$.'],
        '$P = \\tau\\omega$, with $\\omega$ in rad/s.', 'W', { k: 'rwork', tau: tau, w: w, want: 'P' }); }
    if (shape === 'Prpm') { var t2 = R.pick([100, 150, 200, 250, 300, 400]), rpm = R.pick([1500, 2000, 2500, 3000, 4000, 6000]), wr = rpm * 2 * PI / 60, P2 = t2 * wr;
      return P('A car engine produces a torque of $' + qg(t2, 'Nm') + '$ at $' + gx(rpm) + '\\ \\text{rpm}$ (revolutions per minute). What power is that, in kilowatts?',
        ans(P2 / 1000, 0.01),
        ['Convert to rad/s: $\\omega = ' + gx(rpm) + '\\ \\dfrac{\\text{rev}}{\\text{min}}\\times\\dfrac{2\\pi\\ \\text{rad}}{1\\ \\text{rev}}\\times\\dfrac{1\\ \\text{min}}{60\\ \\text{s}} = ' + qx(wr, 'rads', 4) + '$.', '$P = \\tau\\omega = ' + t2 + '(' + fx(wr, 4) + ') = ' + qx(P2, 'W', 4) + ' = ' + qx(P2 / 1000, 'kW') + '$.'],
        'Convert rpm to rad/s first.', 'kW', { k: 'rwork', tau: t2, w: wr, want: 'P', scale: 1000 }); }
    if (shape === 'omega') { var I = R.pick([0.5, 1, 2, 4, 5]), tq = R.pick([2, 4, 5, 8, 10]), n = R.pick([2, 5, 10, 20]), th = 2 * PI * n, wf = M.sqrt(2 * tq * th / I);
      return P('A flywheel ($I = ' + qg(I, 'kgm2') + '$) starts from rest. A steady torque of $' + qg(tq, 'Nm') + '$ turns it through ' + n + ' revolutions. How fast is it spinning then?',
        ans(wf, 0.01),
        ['Work by the torque: $W = \\tau\\Delta\\theta$, with the angle in <b>radians</b>: $\\Delta\\theta = ' + n + '(2\\pi) = ' + fx(th, 4) + '\\ \\text{rad}$, so $W = ' + qx(tq * th, 'J', 4) + '$.', 'Work-energy for rotation: $W = \\tfrac{1}{2}I\\omega^2$, so $\\omega = \\sqrt{\\dfrac{2W}{I}} = \\sqrt{\\dfrac{2(' + fx(tq * th, 4) + ')}{' + gx(I) + '}} = ' + qx(wf, 'rads') + '$.'],
        'Convert revolutions to radians, then set the work equal to $\\tfrac{1}{2}I\\omega^2$.', 'rads', { k: 'rwork', I: I, tau: tq, th: th, want: 'w' }); }
    if (shape === 'W') { var t3 = R.pick([10, 20, 30, 40]), ang = R.pick([30, 45, 60, 90, 120, 180]), W3 = t3 * ang * PI / 180;
      return P('A steady torque of $' + qg(t3, 'Nm') + '$ turns a valve wheel through $' + ang + '^\\circ$. How much work does it do?',
        ans(W3, 0.01),
        ['$W = \\int\\tau\\,d\\theta = \\tau\\Delta\\theta$ with $\\Delta\\theta$ in radians: $' + ang + '^\\circ = ' + fx(ang * PI / 180, 4) + '\\ \\text{rad}$.', '$W = ' + t3 + '(' + fx(ang * PI / 180, 4) + ') = ' + qx(W3, 'J') + '$. (Using ' + ang + ' would give ' + (t3 * ang) + ' J, far too much.)'],
        'Radians, not degrees.', 'J', { k: 'rwork', tau: t3, th: ang * PI / 180, want: 'W' }); }
    var t0 = R.pick([20, 30, 40, 60]), k = R.pick([2, 4, 5, 10]), thmax = R.pick([2, 3, 4]); if (t0 - k * thmax < 0) k = t0 / (2 * thmax);
    var W4 = t0 * thmax - k * thmax * thmax / 2;
    return P('A wind-up spring motor\'s torque fades as it unwinds: $\\tau(\\theta) = ' + t0 + ' - ' + kt(k, '\\theta') + '$ (N·m, $\\theta$ in radians). How much work does it do while turning from $\\theta = 0$ to $\\theta = ' + thmax + '\\ \\text{rad}$?',
      ans(W4, 0.01),
      ['The torque changes, so integrate: $W = \\int_0^{' + thmax + '} (' + t0 + ' - ' + kt(k, '\\theta') + ')\\,d\\theta = \\left[' + t0 + '\\theta - ' + cf(fix(k / 2)) + '\\theta^2\\right]_0^{' + thmax + '}$.', '$W = ' + (t0 * thmax) + ' - ' + gx(fix(k * thmax * thmax / 2)) + ' = ' + qx(W4, 'J') + '$.'],
      'Integrate the torque over the angle.', 'J', { k: 'rwork', tauf: t0 + '-' + k + '*x', th: thmax, want: 'Wvar' });
  });

  G('mech.precession', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['Omega', 'ratio', 'Omega'], ['Omega', 'period', 'ratio', 'Omega'], ['period', 'Omegarpm', 'Omega', 'period']));
    var Md = R.pick([0.2, 0.3, 0.5, 1, 2]), Rd = R.pick([0.03, 0.04, 0.05, 0.08, 0.1]), r = R.pick([0.04, 0.05, 0.08, 0.1, 0.15]), ws = R.pick([400, 500, 600, 800, 1000, 1200]);
    var I = 0.5 * Md * Rd * Rd, Lspin = I * ws, tau = Md * g0 * r, Om = tau / Lspin;
    if (shape === 'ratio') { var k = R.pick([2, 3, 4]), faster = R.coin();
      return P('A spinning gyroscope precesses slowly, supported at one end of its axle. If its spin rate is made ' + k + ' times ' + (faster ? 'faster' : 'slower') + ' (nothing else changes), by what factor does its precession rate change? (Give the new rate divided by the old one.)',
        ans(faster ? 1 / k : k, 0.01),
        ['$\\Omega = \\dfrac{\\tau}{L} = \\dfrac{Mgr}{I\\omega_s}$: the torque is unchanged, and $L$ is proportional to the spin rate.', faster ? 'Spinning ' + k + ' times faster makes $L$ ' + k + ' times bigger, so $\\Omega$ becomes $\\dfrac{1}{' + k + '}$ as large: ' + fx(1 / k, 3) + '.' : 'Spinning ' + k + ' times slower makes $L$ ' + k + ' times smaller, so $\\Omega$ becomes ' + k + ' times as large.'],
        'How does $\\Omega = \\tau/L$ depend on the spin?', null, { k: 'prec', ratio: faster ? k : 1 / k, want: 'ratio' }); }
    var intro = 'A gyroscope\'s wheel is a uniform disk of mass $' + qg(Md, 'kg') + '$ and radius $' + qg(Rd, 'm') + '$, ' + (shape === 'Omegarpm' ? 'spinning at $' + gx(sgf(ws * 60 / (2 * PI), 3)) + '\\ \\text{rpm}$' : 'spinning at $' + qg(ws, 'rads') + '$') + '. Its axle is horizontal, supported at a point $' + qg(r, 'm') + '$ from the wheel\'s center. ';
    if (shape === 'Omegarpm') { ws = sgf(ws * 60 / (2 * PI), 3) * 2 * PI / 60; Lspin = I * ws; Om = tau / Lspin; }
    var st = ['Spin angular momentum: $L = I\\omega_s = \\tfrac{1}{2}MR^2\\omega_s = \\tfrac{1}{2}(' + gx(Md) + ')(' + gx(Rd) + ')^2(' + fx(ws, 4) + ') = ' + qx(Lspin, 'kgm2s', 4) + '$.' + (shape === 'Omegarpm' ? ' (Converted: $\\omega_s = ' + fx(ws, 4) + '\\ \\text{rad/s}$.)' : ''),
      'Gravity\'s torque about the support: $\\tau = Mgr = ' + gx(Md) + '(9.8)(' + gx(r) + ') = ' + qx(tau, 'Nm', 4) + '$, horizontal and perpendicular to $\\vec{L}$.',
      'The torque turns $\\vec{L}$ without changing its size: $\\Omega = \\dfrac{\\tau}{L} = \\dfrac{' + fx(tau, 4) + '}{' + fx(Lspin, 4) + '} = ' + qx(Om, 'rads') + '$.'];
    var chk = { k: 'prec', tau: tau, L: Lspin };
    if (shape === 'period') return P(intro + 'How long does it take to precess once around?', ans(2 * PI / Om, 0.02), st.concat(['Period of precession: $T = \\dfrac{2\\pi}{\\Omega} = ' + qx(2 * PI / Om, 's') + '$.']),
      'Find $\\Omega = \\tau/L$, then one full turn takes $2\\pi/\\Omega$.', 's', Object.assign(chk, { want: 'T' }));
    return P(intro + 'Find its precession rate.', ans(Om, 0.02), st, 'Precession rate is torque divided by spin angular momentum.', 'rads', Object.assign(chk, { want: 'Om' }));
  });

  G('mech.statics-problems', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['ladder', 'beamT', 'hinge'], ['ladder', 'beamT', 'beamH', 'ladderP'], ['ladderP', 'beamH', 'beamT', 'ladderP']));
    if (shape === 'hinge') return P('A horizontal beam is attached to a wall by a hinge at one end and held up by a slanted cable from its other end to the wall. A sign hangs from the beam. Which statement about the hinge\'s force on the beam is true?',
      mc('It generally has both a horizontal part and a vertical part, set by the force and torque balance; it need not point along the beam.', ['It always points along the beam, because a hinge can only push or pull along the beam.', 'It is always zero, because the cable holds everything up.', 'It always points straight up, because it must hold up the weight.']),
      ['The cable pulls the beam toward the wall (and up), so the hinge must push the beam outward: a horizontal part.', 'The cable\'s upward pull usually doesn\'t carry the whole weight, so the hinge also pushes up (or sometimes down): a vertical part.', 'Only a light rod with forces at its two ends alone (a "two-force member") has its end forces along its length. A beam loaded in the middle is not one.'],
      'Write the force balance in $x$ and $y$ and the torque balance; see what the hinge must supply.', null, { k: 'mc' });
    if (shape === 'ladder' || shape === 'ladderP') { var m = R.pick([10, 12, 15, 20]), L = R.pick([3, 4, 5, 6]), th = R.pick([50, 55, 60, 65, 70, 75]), mp = shape === 'ladderP' ? R.pick([50, 60, 70, 80]) : 0, dp = shape === 'ladderP' ? sgf(L * R.pick([0.5, 0.6, 0.75, 0.8]), 2) : 0;
      var ct = M.cos(rad(th)), stt = M.sin(rad(th)), f = (m * g0 * L / 2 + mp * g0 * dp) * ct / (L * stt), N = (m + mp) * g0, mu = f / N, want = R.pick(['f', 'mu']);
      var q = 'A uniform $' + qg(m, 'kg') + '$ ladder, $' + qg(L, 'm') + '$ long, leans against a frictionless wall at $' + th + '^\\circ$ above the floor' + (mp ? ', with a $' + mp + '\\ \\text{kg}$ painter standing $' + qg(dp, 'm') + '$ up the ladder (measured along it)' : '') + '. ';
      var st = ['Forces: the wall\'s normal force $N_w$ (horizontal, since the wall is frictionless), the floor\'s normal force $N_f$ (up), floor friction $f$ (toward the wall), and the weights.',
        'Vertical: $N_f = ' + (mp ? '(m + m_p)g = ' : 'mg = ') + qx(N, 'N', 4) + '$. Horizontal: $f = N_w$.',
        'Torques about the foot of the ladder (this removes $N_f$ and $f$): $N_wL\\sin\\theta = mg\\dfrac{L}{2}\\cos\\theta' + (mp ? ' + m_pgd\\cos\\theta' : '') + '$.',
        '$f = N_w = \\dfrac{' + (mp ? '\\left(mg\\tfrac{L}{2} + m_pgd\\right)' : 'mg\\tfrac{L}{2}') + '\\cos\\theta}{L\\sin\\theta} = ' + qx(f, 'N', 4) + '$.'];
      if (want === 'f') return P(q + 'How large must the friction force at the floor be to keep it from slipping?', ans(f, 0.01), st,
        'Take torques about the foot of the ladder.', 'N', { k: 'ladder', m: m, L: L, th: th, mp: mp, dp: dp, want: 'f' }, { name: 'ph-torque', opts: { scene: 'ladder', angle: th, beamMass: m, m: mp, d: mp ? dp : L / 2, mu: 1, interactive: false, quiet: true } });
      return P(q + 'What is the smallest coefficient of static friction at the floor that keeps it from slipping?', ans(mu, 0.01), st.concat(['$\\mu_s \\ge \\dfrac{f}{N_f} = \\dfrac{' + fx(f, 4) + '}{' + fx(N, 4) + '} = ' + fx(mu, 3) + '$.']),
        'Find the friction needed, then divide by the floor\'s normal force.', null, { k: 'ladder', m: m, L: L, th: th, mp: mp, dp: dp, want: 'mu' });
    }
    // beam with hinge and cable
    var mb = R.pick([10, 15, 20, 25]), Lb = R.pick([2, 3, 4]), phi = R.pick([30, 35, 40, 45, 50, 60]), ms = R.pick([20, 30, 40, 50]), ds = sgf(Lb * R.pick([0.5, 0.75, 1]), 2);
    var T = (mb * g0 * Lb / 2 + ms * g0 * ds) / (Lb * M.sin(rad(phi))), Hx = T * M.cos(rad(phi)), Hy = (mb + ms) * g0 - T * M.sin(rad(phi));
    var qb = 'A uniform $' + qg(mb, 'kg') + '$ beam, $' + qg(Lb, 'm') + '$ long, sticks straight out from a wall on a hinge. A cable from the beam\'s far end to the wall makes $' + phi + '^\\circ$ with the beam. A $' + qg(ms, 'kg') + '$ sign hangs $' + qg(ds, 'm') + '$ from the hinge. ';
    var stb = ['Torques about the hinge (this removes the unknown hinge force): $TL\\sin ' + phi + '^\\circ = m_bg\\tfrac{L}{2} + m_sgd$.', '$T = \\dfrac{' + gx(mb) + '(9.8)(' + gx(Lb / 2) + ') + ' + gx(ms) + '(9.8)(' + gx(ds) + ')}{' + gx(Lb) + '\\sin ' + phi + '^\\circ} = ' + qx(T, 'N', 4) + '$.'];
    if (shape === 'beamT') return P(qb + 'Find the tension in the cable.', ans(T, 0.01), stb, 'Choose the hinge as the pivot.', 'N', { k: 'beam', mb: mb, L: Lb, phi: phi, ms: ms, d: ds, want: 'T' });
    var Hmag = M.hypot(Hx, Hy);
    return P(qb + 'Find the size of the force the hinge exerts on the beam.', ans(Hmag, 0.02),
      stb.concat(['Horizontal: the hinge pushes out with $H_x = T\\cos ' + phi + '^\\circ = ' + qx(Hx, 'N', 4) + '$.', 'Vertical: $H_y = (m_b + m_s)g - T\\sin ' + phi + '^\\circ = ' + qx(Hy, 'N', 4) + '$' + (Hy < 0 ? ' (downward)' : '') + '.', '$|\\vec{H}| = \\sqrt{H_x^2 + H_y^2} = ' + qx(Hmag, 'N') + '$, not along the beam unless $H_y = 0$.']),
      'Find $T$ from torques about the hinge, then balance forces in $x$ and $y$.', 'N', { k: 'beam', mb: mb, L: Lb, phi: phi, ms: ms, d: ds, want: 'H' });
  });


  // ================================================================== UNIT 6: GRAVITATION AND ORBITS
  var GM_E = GN * 5.972e24, R_E = 6.371e6, GM_S = 1.327e20, AU = 1.495978707e11;
  // NASA planetary and satellite fact sheets: orbital radius (m) and sidereal period (days) of a moon, and the planet
  var MOONS = [{ moon: 'Io', planet: 'Jupiter', r: 4.217e8, T: 1.769 }, { moon: 'Titan', planet: 'Saturn', r: 1.2219e9, T: 15.945 }, { moon: 'Phobos', planet: 'Mars', r: 9.376e6, T: 0.3189 }, { moon: 'Triton', planet: 'Neptune', r: 3.548e8, T: 5.877 }, { moon: 'Titania', planet: 'Uranus', r: 4.363e8, T: 8.706 }];

  G('mech.shell-theorem', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['outside', 'inside', 'center'], ['inside', 'outside', 'tunnel', 'center'], ['inside', 'tunnel', 'ratio', 'shell']));
    var planet = R.pick([{ n: 'a rocky planet', g: 9.8, R: 6.4e6 }, { n: 'a small moon', g: 1.6, R: 1.7e6 }, { n: 'a planet', g: 3.7, R: 3.4e6 }, { n: 'an exoplanet', g: 12, R: 8e6 }, { n: 'a dwarf planet', g: 0.6, R: 1.2e6 }]);
    if (shape === 'center') return P('Model a planet as a uniform solid sphere. Where inside or on the planet is its gravitational field strength the greatest?',
      mc('At its surface', ['At its center', 'Halfway between the center and the surface', 'It is the same everywhere inside']),
      ['Inside a uniform sphere, only the mass closer to the center than you pulls on you overall (the shell theorem): $M(r) = M\\dfrac{r^3}{R^3}$.', 'So $g(r) = \\dfrac{GM(r)}{r^2} = \\dfrac{GM}{R^3}r$: it grows in proportion to $r$, from zero at the center to its largest value at the surface.', 'Outside, $g = GM/r^2$ falls off again. At the very center the pulls from all sides cancel: $g = 0$.'],
      'How much of the planet\'s mass is closer to the center than you are?', null, { k: 'mc' });
    if (shape === 'shell') { var Ms = R.pick([2, 5, 8]) * 1e20, Rs = R.pick([2, 3, 5]) * 1e5, rr = R.pick([0.5, 0.8, 1.5, 2]) * Rs, gs = rr < Rs ? 0 : GN * Ms / (rr * rr);
      return P('A thin, uniform spherical shell has mass $' + qg(Ms, 'kg') + '$ and radius $' + qg(Rs, 'm') + '$. What is the gravitational field strength it produces at a distance $' + qg(rr, 'm') + '$ from its center?',
        rr < Rs ? exact(0) : ans(gs, 0.02),
        rr < Rs ? ['The point is inside the shell ($' + gx(rr) + ' < ' + gx(Rs) + '$).', 'Shell theorem: the pulls of the near and far parts of a uniform shell cancel exactly at every inside point. The nearer patch is closer but smaller in the cone it fills; both scale as the area grows like distance squared.', '$g = 0$.']
          : ['The point is outside, so the shell acts as if all its mass were at its center.', '$g = \\dfrac{GM}{r^2} = \\dfrac{(6.674 \\times 10^{-11})(' + gx(Ms) + ')}{(' + gx(rr) + ')^2} = ' + qx(gs, 'Nkg') + '$.'],
        'Inside or outside the shell?', 'Nkg', { k: 'shell', kind: 'shell', M: Ms, R: Rs, r: rr }); }
    if (shape === 'outside') { var h = R.pick([0.25, 0.5, 1, 2]) * planet.R, go = planet.g * M.pow(planet.R / (planet.R + h), 2);
      return P(planet.n.charAt(0).toUpperCase() + planet.n.slice(1) + ' has radius $' + qg(planet.R, 'm') + '$ and surface gravity $' + qg(planet.g, 'ms2') + '$. Treating it as a sphere, find $g$ at an altitude of $' + qg(h, 'm') + '$ above its surface.',
        ans(go, 0.01),
        ['Outside a spherical body, $g = \\dfrac{GM}{r^2}$ with $r$ from the center, so $g \\propto \\dfrac{1}{r^2}$.', '$r = R + h = ' + gx(planet.R + h) + '\\ \\text{m}$, so $g = g_s\\left(\\dfrac{R}{R + h}\\right)^2 = ' + gx(planet.g) + '\\left(\\dfrac{' + gx(planet.R) + '}{' + gx(planet.R + h) + '}\\right)^2 = ' + qx(go, 'ms2') + '$.'],
        'Measure $r$ from the center and use the inverse square.', 'ms2', { k: 'shell', kind: 'solid', gs: planet.g, R: planet.R, r: planet.R + h }); }
    if (shape === 'inside') { var f = R.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]), depth = (1 - f) * planet.R, gi = planet.g * f;
      return P('Model ' + planet.n + ' (radius $' + qg(planet.R, 'm') + '$, surface gravity $' + qg(planet.g, 'ms2') + '$) as a uniform solid sphere. What is $g$ at the bottom of a shaft $' + qg(depth, 'm') + '$ deep?',
        ans(gi, 0.01),
        ['At distance $r$ from the center, only the mass inside radius $r$ pulls: $M(r) = M\\dfrac{r^3}{R^3}$, so $g(r) = \\dfrac{GM(r)}{r^2} = g_s\\dfrac{r}{R}$.', '$r = R - d = ' + gx(planet.R) + ' - ' + gx(depth) + ' = ' + gx(f * planet.R) + '\\ \\text{m}$, which is ' + gx(f) + ' of the radius.', '$g = ' + gx(planet.g) + '(' + gx(f) + ') = ' + qx(gi, 'ms2') + '$, <i>less</i> than at the surface.'],
        'Only the mass closer to the center than you counts.', 'ms2', { k: 'shell', kind: 'solid', gs: planet.g, R: planet.R, r: f * planet.R }); }
    if (shape === 'ratio') { var f2 = R.pick([0.5, 0.25, 0.1]), k = R.pick([2, 3, 4]);
      return P('In a uniform planet of radius $R$, compare $g$ at a depth of ' + (f2 === 0.5 ? 'half the radius' : f2 === 0.25 ? 'a quarter of the radius' : 'a tenth of the radius') + ' below the surface with $g$ at an altitude of the same distance above the surface. What is $g_{\\text{below}}/g_{\\text{above}}$?',
        ans((1 - f2) * M.pow(1 + f2, 2), 0.01),
        ['Below: $g = g_s\\dfrac{r}{R} = g_s(1 - ' + gx(f2) + ') = ' + gx(fix(1 - f2)) + 'g_s$.', 'Above: $g = g_s\\left(\\dfrac{R}{R + ' + gx(f2) + 'R}\\right)^2 = \\dfrac{g_s}{' + gx(fix((1 + f2) * (1 + f2))) + '}$.', 'Ratio: $' + gx(fix(1 - f2)) + '\\times' + gx(fix((1 + f2) * (1 + f2))) + ' = ' + fx((1 - f2) * M.pow(1 + f2, 2), 3) + '$.'],
        'Use $g \\propto r$ inside and $g \\propto 1/r^2$ outside.', null, { k: 'shell', kind: 'ratio', f: f2 }); }
    var Tt = 2 * PI * M.sqrt(planet.R / planet.g), half = R.coin();
    return P('Imagine a straight tunnel through the center of ' + planet.n + ' (radius $' + qg(planet.R, 'm') + '$, surface gravity $' + qg(planet.g, 'ms2') + '$), modeled as a uniform sphere, with no air or friction. A ball dropped in falls through and back. ' + (half ? 'How long does it take to reach the other side, in minutes?' : 'What is the period of its back-and-forth motion, in minutes?'),
      ans((half ? Tt / 2 : Tt) / 60, 0.02),
      ['Inside, $g(r) = g_s\\dfrac{r}{R}$, pointing to the center, so along the tunnel $\\ddot{x} = -\\dfrac{g_s}{R}x$: simple harmonic motion.', '$\\omega = \\sqrt{\\dfrac{g_s}{R}}$ and $T = 2\\pi\\sqrt{\\dfrac{R}{g_s}} = 2\\pi\\sqrt{\\dfrac{' + gx(planet.R) + '}{' + gx(planet.g) + '}} = ' + qx(Tt, 's', 4) + ' = ' + qx(Tt / 60, 'min') + '$.'].concat(half ? ['Reaching the far side takes half a period: $' + qx(Tt / 120, 'min') + '$.'] : []),
      'Inside a uniform sphere the pull is proportional to the distance from the center, like a spring.', 'min', { k: 'shell', kind: 'tunnel', gs: planet.g, R: planet.R, half: half });
  });

  G('mech.orbital-energy', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['E', 'which', 'K'], ['E', 'dE', 'speed', 'which'], ['dE', 'speed', 'dE', 'E']));
    var m = R.pick([500, 800, 1000, 1500, 2000, 3000]), h1 = R.pick([300, 400, 500, 800, 1000, 2000]) * 1000, r1 = R_E + h1, Eorb = -GM_E * m / (2 * r1);
    var Edat = 'Earth: $GM = ' + qg(sgf(GM_E, 4), 'none') + '\\ \\text{m}^3/\\text{s}^2$, $R = ' + qg(R_E, 'm') + '$.';
    if (shape === 'which') return P('A satellite moves from a lower circular orbit to a higher circular orbit around Earth. Compared with before, in its new orbit it has',
      mc('more total energy but a lower speed', ['more total energy and a higher speed', 'less total energy and a lower speed', 'the same total energy and the same speed']),
      ['In a circular orbit, gravity supplies the centripetal force: $\\dfrac{mv^2}{r} = \\dfrac{GMm}{r^2}$, so $v = \\sqrt{GM/r}$: farther out is <b>slower</b>.', 'Total energy: $E = \\tfrac{1}{2}mv^2 - \\dfrac{GMm}{r} = -\\dfrac{GMm}{2r}$, which is less negative for larger $r$: farther out is <b>more</b> energy.', 'So the climb costs energy, yet the satellite ends up moving more slowly: its potential energy rises by twice as much as its kinetic energy falls.'],
      'Find $v$ and $E$ as functions of $r$ for a circular orbit.', null, { k: 'mc' });
    if (shape === 'E' || shape === 'K') { var isK = shape === 'K';
      return P('A $' + gx(m) + '\\ \\text{kg}$ satellite is in a circular orbit $' + gx(h1 / 1000) + '\\ \\text{km}$ above Earth\'s surface. ' + Edat + ' Find its ' + (isK ? 'kinetic' : 'total mechanical') + ' energy, in GJ ($10^9\\ \\text{J}$).',
        ans((isK ? -Eorb : Eorb) / 1e9, 0.01),
        ['$r = R + h = ' + qx(r1, 'm', 5) + '$.', 'Circular orbit: $\\dfrac{mv^2}{r} = \\dfrac{GMm}{r^2}$, so $K = \\tfrac{1}{2}mv^2 = \\dfrac{GMm}{2r}$ and $U = -\\dfrac{GMm}{r} = -2K$.',
          (isK ? '$K = \\dfrac{GMm}{2r} = ' + qx(-Eorb, 'J') + ' = ' + qx(-Eorb / 1e9, 'GJ') + '$.' : '$E = K + U = -\\dfrac{GMm}{2r} = ' + qx(Eorb, 'J') + ' = ' + qx(Eorb / 1e9, 'GJ') + '$, negative because the satellite is bound.')],
        'In a circular orbit, $K = -\\tfrac{1}{2}U$.', 'GJ', { k: 'orbE', GM: GM_E, m: m, r: r1, want: isK ? 'K' : 'E', scale: 1e9 }); }
    var h2 = h1 + R.pick([500, 1000, 2000, 5000, 10000]) * 1000, r2 = R_E + h2;
    if (shape === 'dE') { var dE = GM_E * m / 2 * (1 / r1 - 1 / r2);
      return P('How much energy must be added to move a $' + gx(m) + '\\ \\text{kg}$ satellite from a circular orbit $' + gx(h1 / 1000) + '\\ \\text{km}$ up to a circular orbit $' + gx(h2 / 1000) + '\\ \\text{km}$ up? Answer in GJ. ' + Edat,
        ans(dE / 1e9, 0.02),
        ['$E = -\\dfrac{GMm}{2r}$ for a circular orbit, with $r_1 = ' + fx(r1, 4) + '\\ \\text{m}$ and $r_2 = ' + fx(r2, 4) + '\\ \\text{m}$.', '$\\Delta E = \\dfrac{GMm}{2}\\left(\\dfrac{1}{r_1} - \\dfrac{1}{r_2}\\right) = ' + qx(dE, 'J') + ' = ' + qx(dE / 1e9, 'GJ') + '$.', 'Positive: going higher takes energy, even though the satellite ends up slower.'],
        'Subtract the two orbital energies.', 'GJ', { k: 'orbE', GM: GM_E, m: m, r: r1, r2: r2, want: 'dE', scale: 1e9 }); }
    var v1 = M.sqrt(GM_E / r1), v2 = M.sqrt(GM_E / r2);
    return P('A satellite moves from a circular orbit $' + gx(h1 / 1000) + '\\ \\text{km}$ above Earth to one $' + gx(h2 / 1000) + '\\ \\text{km}$ above it. What is its speed in the higher orbit, in km/s? ' + Edat,
      ans(v2 / 1000, 0.01),
      ['Circular orbit: $v = \\sqrt{\\dfrac{GM}{r}}$.', 'Before: $v_1 = \\sqrt{\\dfrac{' + fx(GM_E, 4) + '}{' + fx(r1, 4) + '}} = ' + qx(v1 / 1000, 'kms') + '$. After: $v_2 = \\sqrt{\\dfrac{' + fx(GM_E, 4) + '}{' + fx(r2, 4) + '}} = ' + qx(v2 / 1000, 'kms') + '$.', 'Slower, yet the total energy $-GMm/2r$ went up.'],
      'Circular speed is $\\sqrt{GM/r}$, with $r$ from Earth\'s center.', 'kms', { k: 'orbE', GM: GM_E, r: r2, want: 'v', scale: 1000 });
  });

  G('mech.kepler-second-from-newton', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['ratio', 'va', 'va'], ['va', 'vp', 'areal', 'ratio'], ['va', 'areal', 'vp', 'va']));
    if (shape === 'ratio') { var rp = R.pick([1, 2, 3]), ra = rp * R.pick([2, 3, 4, 5, 8]);
      return P('A comet\'s closest distance to the Sun is $' + rp + '\\ \\text{AU}$ and its farthest is $' + ra + '\\ \\text{AU}$. How many times faster does it move at its closest point than at its farthest?',
        ans(ra / rp, 0.01),
        ['Gravity points straight at the Sun, so its torque about the Sun is zero and the comet\'s angular momentum $L = m|\\vec{r}\\times\\vec{v}|$ is constant.', 'At the closest and farthest points the velocity is perpendicular to $\\vec{r}$, so $mr_pv_p = mr_av_a$.', '$\\dfrac{v_p}{v_a} = \\dfrac{r_a}{r_p} = \\dfrac{' + ra + '}{' + rp + '} = ' + gx(ra / rp) + '$.'],
        'Angular momentum about the Sun is conserved.', null, { k: 'kep2', kind: 'ratio', rp: rp, ra: ra }); }
    // physically consistent orbits around the Sun: rp, ra in AU; vp from energy and angular momentum
    var rpA = R.pick([0.3, 0.5, 0.6, 0.8, 1, 1.2]), raA = sgf(rpA * R.pick([1.5, 2, 3, 5, 10, 20]), 2), aA = (rpA + raA) / 2, rp_ = rpA * AU, ra_ = raA * AU;
    var vp = M.sqrt(GM_S * (2 / rp_ - 1 / (aA * AU))), vpS = sgf(vp / 1000, 3), va = vpS * rpA / raA;
    if (shape === 'va') return P('An asteroid passes its closest point to the Sun, $' + gx(rpA) + '\\ \\text{AU}$, at $' + gx(vpS) + '\\ \\text{km/s}$. Its farthest distance from the Sun is $' + gx(raA) + '\\ \\text{AU}$. How fast is it moving there, in km/s?',
      ans(va, 0.01),
      ['Gravity from the Sun exerts no torque about the Sun, so $L = mrv\\sin\\phi$ stays constant.', 'At the nearest and farthest points $\\vec{v} \\perp \\vec{r}$: $r_pv_p = r_av_a$.', '$v_a = v_p\\dfrac{r_p}{r_a} = ' + gx(vpS) + '\\cdot\\dfrac{' + gx(rpA) + '}{' + gx(raA) + '} = ' + qx(va, 'kms') + '$.'],
      'Conserve angular momentum between the two ends of the orbit.', 'kms', { k: 'kep2', kind: 'va', rp: rpA, ra: raA, vp: vpS });
    if (shape === 'vp') { var vaS = sgf(vp * rpA / raA / 1000, 3), vpp = vaS * raA / rpA;
      return P('A comet at its farthest point from the Sun, $' + gx(raA) + '\\ \\text{AU}$, moves at $' + gx(vaS) + '\\ \\text{km/s}$. Its closest approach is $' + gx(rpA) + '\\ \\text{AU}$. How fast will it be moving there, in km/s?',
        ans(vpp, 0.01),
        ['No torque about the Sun, so $r_av_a = r_pv_p$ (velocity perpendicular to $\\vec{r}$ at both ends).', '$v_p = v_a\\dfrac{r_a}{r_p} = ' + gx(vaS) + '\\cdot\\dfrac{' + gx(raA) + '}{' + gx(rpA) + '} = ' + qx(vpp, 'kms') + '$.'],
        'Conserve angular momentum.', 'kms', { k: 'kep2', kind: 'vp', rp: rpA, ra: raA, va: vaS }); }
    var dA = rp_ * vpS * 1000 / 2;
    return P('An asteroid passes its closest point to the Sun, $' + gx(rpA) + '\\ \\text{AU} = ' + qx(rp_, 'm', 4) + '$, at $' + gx(vpS) + '\\ \\text{km/s}$. At what rate does the line from the Sun to the asteroid sweep out area, in m²/s?',
      ans(dA, 0.01),
      ['In a short time $dt$ the line sweeps a thin triangle of area $dA = \\tfrac{1}{2}|\\vec{r}\\times\\vec{v}\\,dt|$, so $\\dfrac{dA}{dt} = \\dfrac{|\\vec{r}\\times\\vec{v}|}{2} = \\dfrac{L}{2m}$, the same all around the orbit.', 'At the closest point $\\vec{v} \\perp \\vec{r}$: $\\dfrac{dA}{dt} = \\tfrac{1}{2}r_pv_p = \\tfrac{1}{2}(' + fx(rp_, 4) + ')(' + gx(vpS * 1000) + ') = ' + qx(dA, 'm2s') + '$.'],
      'The swept area per time is half of $|\\vec{r}\\times\\vec{v}|$.', 'm2s', { k: 'kep2', kind: 'areal', rp: rpA, vp: vpS });
  });

  G('mech.kepler-third-from-newton', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['T', 'mass', 'T'], ['mass', 'T', 'geo', 'r'], ['geo', 'mass', 'r', 'T']));
    if (shape === 'T') { var body = R.pick([{ n: 'Earth', GM: GM_E, R: R_E }, { n: 'Earth', GM: GM_E, R: R_E }, { n: 'Mars', GM: GN * 6.417e23, R: 3.3895e6 }, { n: 'the Moon', GM: GN * 7.346e22, R: 1.7374e6 }]);
      var h = R.int(2, 40) * 100000, r = body.R + h, T = 2 * PI * M.sqrt(r * r * r / body.GM), GMb = body.GM, Rb = body.R;
      return P('A satellite circles ' + body.n + ' $' + gx(h / 1000) + '\\ \\text{km}$ above the surface. Find its period in minutes. (' + body.n.charAt(0).toUpperCase() + body.n.slice(1) + ': $GM = ' + fx(GMb, 4) + '\\ \\text{m}^3/\\text{s}^2$, $R = ' + qg(Rb, 'm') + '$.)',
        ans(T / 60, 0.01),
        ['Gravity supplies the centripetal force: $\\dfrac{GMm}{r^2} = m\\omega^2r = m\\dfrac{4\\pi^2}{T^2}r$, so $T^2 = \\dfrac{4\\pi^2r^3}{GM}$. The satellite\'s mass cancels.', 'Use the distance from the <b>center</b>: $r = ' + gx(Rb) + ' + ' + gx(h) + ' = ' + fx(r, 4) + '\\ \\text{m}$.', '$T = 2\\pi\\sqrt{\\dfrac{(' + fx(r, 4) + ')^3}{' + fx(GMb, 4) + '}} = ' + qx(T, 's', 4) + ' = ' + qx(T / 60, 'min') + '$.'],
        'Set gravity equal to $m\\omega^2r$; measure $r$ from the center.', 'min', { k: 'kep3', GM: GMb, r: r, want: 'T', scale: 60 }); }
    if (shape === 'mass') { var mo = R.pick(MOONS), Ts = mo.T * 86400, Mp = 4 * PI * PI * M.pow(mo.r, 3) / (GN * Ts * Ts);
      return P(mo.planet + '\'s moon ' + mo.moon + ' orbits at an average distance of $' + qg(mo.r, 'm') + '$ with a period of $' + gx(mo.T) + '$ days. Use Newton\'s form of Kepler\'s third law to find ' + mo.planet + '\'s mass. ($G = 6.674 \\times 10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$; the moon\'s own mass is negligible.)',
        ans(Mp, 0.02),
        ['$T = ' + gx(mo.T) + '\\times 86\\,400\\ \\text{s} = ' + qx(Ts, 's', 4) + '$.', 'From $\\dfrac{GMm}{r^2} = m\\dfrac{4\\pi^2r}{T^2}$: $M = \\dfrac{4\\pi^2r^3}{GT^2}$.', '$M = \\dfrac{4\\pi^2(' + gx(mo.r) + ')^3}{(6.674 \\times 10^{-11})(' + fx(Ts, 4) + ')^2} = ' + qx(Mp, 'kg') + '$.'],
        'Solve $T^2 = 4\\pi^2r^3/(GM)$ for $M$, with $T$ in seconds.', 'kg', { k: 'kep3', r: mo.r, T: Ts, want: 'M' }); }
    if (shape === 'geo') { var Tsid = 86164, rg = M.pow(GM_E * Tsid * Tsid / (4 * PI * PI), 1 / 3), hg = rg - R_E;
      return P('A geostationary satellite circles above the equator once per sidereal day ($86\\,164\\ \\text{s}$), so it stays over one spot. How high above Earth\'s surface is it, in km? (Earth: $GM = ' + fx(GM_E, 4) + '\\ \\text{m}^3/\\text{s}^2$, $R = ' + qg(R_E, 'm') + '$.)',
        ans(hg / 1000, 0.01),
        ['$r^3 = \\dfrac{GMT^2}{4\\pi^2} = \\dfrac{(' + fx(GM_E, 4) + ')(86\\,164)^2}{4\\pi^2}$, so $r = ' + qx(rg, 'm', 4) + '$.', 'Altitude: $h = r - R = ' + qx(hg, 'm', 4) + ' \\approx ' + qx(hg / 1000, 'km') + '$.'],
        'Solve Kepler\'s third law for $r$, then subtract Earth\'s radius.', 'km', { k: 'kep3', GM: GM_E, T: Tsid, want: 'r', sub: R_E, scale: 1000 }); }
    var Mx = R.pick([2, 4, 6, 8]) * 1e23, Tx = R.pick([2, 4, 6, 10, 12]) * 3600, rx = M.pow(GN * Mx * Tx * Tx / (4 * PI * PI), 1 / 3);
    return P('A probe will orbit a moon of mass $' + qg(Mx, 'kg') + '$ with a period of $' + gx(Tx / 3600) + '$ hours. What orbital radius (from the moon\'s center) does that need, in km?',
      ans(rx / 1000, 0.01),
      ['$T = ' + gx(Tx / 3600) + '\\ \\text{h} = ' + gx(Tx) + '\\ \\text{s}$.', '$r^3 = \\dfrac{GMT^2}{4\\pi^2} = \\dfrac{(6.674 \\times 10^{-11})(' + gx(Mx) + ')(' + gx(Tx) + ')^2}{4\\pi^2}$, so $r = ' + qx(rx, 'm', 4) + ' = ' + qx(rx / 1000, 'km') + '$.'],
      'Solve $T^2 = 4\\pi^2r^3/(GM)$ for $r$.', 'km', { k: 'kep3', GM: GN * Mx, T: Tx, want: 'r', sub: 0, scale: 1000 });
  });

  G('mech.vis-viva', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['vsun', 'which', 'vsun'], ['vsun', 'a', 'hoh', 'which'], ['hoh', 'hoh2', 'a', 'vsun']));
    if (shape === 'which') return P('A spacecraft is in a circular orbit. It fires its engine briefly forward along its motion, speeding up. What happens to its orbit?',
      mc('The orbit becomes an ellipse whose far point, on the opposite side of the planet, is higher; the height at the burn point stays the same.', ['The spacecraft rises right away at the point of the burn and stays in a higher circle.', 'The orbit stays circular but the spacecraft moves faster around it.', 'The far side of the orbit drops lower, because the faster craft cuts inside the old circle.']),
      ['Right after the burn the craft is at the same place, so the burn point stays on the orbit: it becomes the closest point (perigee).', 'With more speed at the same $r$, the energy $\\tfrac{1}{2}v^2 - GM/r$ is higher, so the semi-major axis $a$ grows: $v^2 = GM\\left(\\dfrac{2}{r} - \\dfrac{1}{a}\\right)$.', 'Bigger $a$ with the same perigee means a higher apogee, half an orbit later on the far side. That is how transfer orbits work.'],
      'Where on the new orbit is the burn point?', null, { k: 'mc' });
    if (shape === 'vsun' || shape === 'a') {
      var aA = R.pick([1.5, 2, 2.5, 3, 4, 5.2]), e = R.pick([0.2, 0.3, 0.4, 0.5, 0.6]), rA = sgf(aA * (1 + e * R.pick([-1, -0.5, 0.5, 1]) * 0.9), 2), a = aA * AU, r = rA * AU, v = M.sqrt(GM_S * (2 / r - 1 / a));
      if (shape === 'vsun') return P('An asteroid\'s orbit around the Sun has a semi-major axis of $' + gx(aA) + '\\ \\text{AU}$. How fast is it moving when it is $' + gx(rA) + '\\ \\text{AU}$ from the Sun, in km/s? (Sun: $GM = 1.327 \\times 10^{20}\\ \\text{m}^3/\\text{s}^2$; $1\\ \\text{AU} = 1.496 \\times 10^{11}\\ \\text{m}$.)',
        ans(v / 1000, 0.01),
        ['On an ellipse the total energy per kilogram is $-\\dfrac{GM}{2a}$, so $\\tfrac{1}{2}v^2 - \\dfrac{GM}{r} = -\\dfrac{GM}{2a}$, which is the vis-viva equation $v^2 = GM\\left(\\dfrac{2}{r} - \\dfrac{1}{a}\\right)$.',
          '$v^2 = 1.327 \\times 10^{20}\\left(\\dfrac{2}{' + fx(r, 4) + '} - \\dfrac{1}{' + fx(a, 4) + '}\\right) = ' + fx(v * v, 4) + '\\ \\text{m}^2/\\text{s}^2$.', '$v = ' + qx(v, 'ms', 4) + ' = ' + qx(v / 1000, 'kms') + '$.'],
        'Use $v^2 = GM(2/r - 1/a)$ with everything in SI units.', 'kms', { k: 'visviva', GM: GM_S, a: a, r: r, want: 'v', scale: 1000 });
      var vS = sgf(v / 1000, 3), aSol = 1 / (2 / r - vS * vS * 1e6 / GM_S);
      return P('A comet $' + gx(rA) + '\\ \\text{AU}$ from the Sun moves at $' + gx(vS) + '\\ \\text{km/s}$. Find the semi-major axis of its orbit, in AU. (Sun: $GM = 1.327 \\times 10^{20}\\ \\text{m}^3/\\text{s}^2$; $1\\ \\text{AU} = 1.496 \\times 10^{11}\\ \\text{m}$.)',
        ans(aSol / AU, 0.02),
        ['Vis-viva solved for $a$: $\\dfrac{1}{a} = \\dfrac{2}{r} - \\dfrac{v^2}{GM}$.', '$\\dfrac{1}{a} = \\dfrac{2}{' + fx(r, 4) + '} - \\dfrac{(' + gx(vS * 1000) + ')^2}{1.327 \\times 10^{20}} = ' + fx(1 / aSol, 4) + '\\ \\text{m}^{-1}$.', '$a = ' + qx(aSol, 'm', 4) + ' = ' + qx(aSol / AU, 'AU') + '$.'],
        'Solve the vis-viva equation for $a$.', 'AU', { k: 'visviva', GM: GM_S, r: r, v: vS * 1000, want: 'a', scale: AU });
    }
    // Hohmann transfer around Earth
    var h1 = R.pick([200, 300, 400, 500]) * 1000, h2 = R.pick([2000, 5000, 10000, 20000, 35786]) * 1000, r1 = R_E + h1, r2 = R_E + h2, at = (r1 + r2) / 2;
    var vc1 = M.sqrt(GM_E / r1), vp = M.sqrt(GM_E * (2 / r1 - 1 / at)), dv1 = vp - vc1, vc2 = M.sqrt(GM_E / r2), va = M.sqrt(GM_E * (2 / r2 - 1 / at)), dv2 = vc2 - va, second = shape === 'hoh2';
    return P('A satellite in a circular orbit $' + gx(h1 / 1000) + '\\ \\text{km}$ up moves to a circular orbit $' + gx(h2 / 1000) + '\\ \\text{km}$ up using a transfer ellipse that touches both circles (a Hohmann transfer). How big is the ' + (second ? 'second burn, at the top of the transfer ellipse' : 'first burn, at the bottom of the transfer ellipse') + ', in km/s? (Earth: $GM = ' + fx(GM_E, 4) + '\\ \\text{m}^3/\\text{s}^2$, $R = ' + qg(R_E, 'm') + '$.)',
      ans((second ? dv2 : dv1) / 1000, 0.02),
      ['Radii from Earth\'s center: $r_1 = ' + fx(r1, 4) + '\\ \\text{m}$, $r_2 = ' + fx(r2, 4) + '\\ \\text{m}$. The transfer ellipse has $a = \\dfrac{r_1 + r_2}{2} = ' + fx(at, 4) + '\\ \\text{m}$.',
        second ? 'Speed on the transfer ellipse at $r_2$: $v = \\sqrt{GM\\left(\\dfrac{2}{r_2} - \\dfrac{1}{a}\\right)} = ' + qx(va, 'ms', 4) + '$. Circular speed there: $\\sqrt{GM/r_2} = ' + qx(vc2, 'ms', 4) + '$.' : 'Circular speed at $r_1$: $\\sqrt{GM/r_1} = ' + qx(vc1, 'ms', 4) + '$. Speed needed on the transfer ellipse at $r_1$: $\\sqrt{GM\\left(\\dfrac{2}{r_1} - \\dfrac{1}{a}\\right)} = ' + qx(vp, 'ms', 4) + '$.',
        '$\\Delta v = ' + (second ? fx(vc2, 4) + ' - ' + fx(va, 4) : fx(vp, 4) + ' - ' + fx(vc1, 4)) + ' = ' + qx(second ? dv2 : dv1, 'ms') + ' = ' + qx((second ? dv2 : dv1) / 1000, 'kms') + '$.', second ? 'Without this second push, the satellite would fall back along the ellipse to the low orbit\'s height.' : 'This burn raises the far side of the orbit; the height at the burn point doesn\'t change.'],
      'Compare the circular speed with the transfer ellipse\'s speed at the same radius, using vis-viva.', 'kms', { k: 'visviva', GM: GM_E, r1: r1, r2: r2, want: second ? 'dv2' : 'dv1', scale: 1000 });
  });


  // ================================================================== UNIT 7: OSCILLATIONS WITH CALCULUS
  G('mech.shm-equation', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['omega', 'T', 'f'], ['T', 'fromeq', 'vmax', 'amax'], ['fromeq', 'findk', 'vmax', 'amax']));
    var m = R.pick([0.1, 0.2, 0.25, 0.5, 1, 2]), k = R.pick([10, 16, 20, 40, 50, 80, 100, 200]), w = M.sqrt(k / m);
    var intro = 'A $' + qg(m, 'kg') + '$ block on a frictionless surface is attached to a spring with $k = ' + qg(k, 'Nperm') + '$. ';
    var base = ['Newton\'s second law: $m\\ddot{x} = -kx$, so $\\ddot{x} = -\\dfrac{k}{m}x$. The solution is $x = A\\cos(\\omega t + \\phi)$ with $\\omega = \\sqrt{\\dfrac{k}{m}}$.', '$\\omega = \\sqrt{\\dfrac{' + k + '}{' + gx(m) + '}} = ' + qx(w, 'rads', 4) + '$.'];
    if (shape === 'omega') return P(intro + 'Find the angular frequency $\\omega$ of its oscillation.', ans(w, 0.01), base, '$\\omega = \\sqrt{k/m}$.', 'rads', { k: 'shm', m: m, kk: k, want: 'w' });
    if (shape === 'T') return P(intro + 'Find the period of its oscillation.', ans(2 * PI / w, 0.01), base.concat(['$T = \\dfrac{2\\pi}{\\omega} = 2\\pi\\sqrt{\\dfrac{m}{k}} = ' + qx(2 * PI / w, 's') + '$.']), 'One cycle takes $2\\pi$ radians of phase.', 's', { k: 'shm', m: m, kk: k, want: 'T' });
    if (shape === 'f') return P(intro + 'Find the frequency of its oscillation in hertz (cycles per second).', ans(w / (2 * PI), 0.01), base.concat(['$f = \\dfrac{\\omega}{2\\pi} = ' + qx(w / (2 * PI), 'Hz') + '$. (Not $' + fx(w, 3) + '$: that is $\\omega$, in radians per second.)']), 'Divide $\\omega$ by $2\\pi$.', 'Hz', { k: 'shm', m: m, kk: k, want: 'f' });
    if (shape === 'fromeq') { var c = R.pick([4, 9, 16, 25, 36, 49, 64, 100]), wc = M.sqrt(c), askT = R.coin();
      return P('A quantity obeys $\\dfrac{d^2x}{dt^2} = -' + c + 'x$ ($t$ in seconds). What is ' + (askT ? 'the period of its oscillation?' : 'its frequency in hertz?'),
        ans(askT ? 2 * PI / wc : wc / (2 * PI), 0.01),
        ['Compare with $\\ddot{x} = -\\omega^2x$, solved by $x = A\\cos(\\omega t + \\phi)$: substituting gives $-\\omega^2A\\cos(\\omega t + \\phi) = -' + c + 'A\\cos(\\omega t + \\phi)$, so $\\omega^2 = ' + c + '$ and $\\omega = ' + wc + '\\ \\text{rad/s}$.', askT ? '$T = \\dfrac{2\\pi}{' + wc + '} = ' + qx(2 * PI / wc, 's') + '$.' : '$f = \\dfrac{' + wc + '}{2\\pi} = ' + qx(wc / (2 * PI), 'Hz') + '$.'],
        'Match the equation to $\\ddot{x} = -\\omega^2x$.', askT ? 's' : 'Hz', { k: 'shm', m: 1, kk: c, want: askT ? 'T' : 'f' }); }
    var A = R.pick([0.02, 0.05, 0.1, 0.15, 0.2]);
    if (shape === 'vmax' || shape === 'amax') { var isV = shape === 'vmax', val = isV ? A * w : A * w * w;
      return P(intro + 'It is pulled $' + qg(A, 'm') + '$ from equilibrium and released. Find its ' + (isV ? 'greatest speed' : 'greatest acceleration') + '.',
        ans(val, 0.01),
        base.concat(['Released from rest at $x = A$: $x = A\\cos\\omega t$, so $v = -A\\omega\\sin\\omega t$ and $a = -A\\omega^2\\cos\\omega t$.', isV ? '$v_{\\max} = A\\omega = ' + gx(A) + '(' + fx(w, 4) + ') = ' + qx(val, 'ms') + '$, passing through equilibrium.' : '$a_{\\max} = A\\omega^2 = ' + gx(A) + '(' + fx(w * w, 4) + ') = ' + qx(val, 'ms2') + '$, at the turning points.']),
        'Differentiate $x = A\\cos\\omega t$.', isV ? 'ms' : 'ms2', { k: 'shm', m: m, kk: k, A: A, want: isV ? 'vmax' : 'amax' }); }
    var mf = R.pick([0.2, 0.5, 1, 2]), ff = R.pick([0.5, 1, 1.5, 2, 2.5]), kf = mf * M.pow(2 * PI * ff, 2);
    return P('A $' + qg(mf, 'kg') + '$ mass on a spring oscillates at $' + qg(ff, 'Hz') + '$. What is the spring constant?',
      ans(kf, 0.01),
      ['$\\omega = 2\\pi f = 2\\pi(' + gx(ff) + ') = ' + qx(2 * PI * ff, 'rads', 4) + '$.', '$\\omega^2 = \\dfrac{k}{m}$, so $k = m\\omega^2 = ' + gx(mf) + '(' + fx(2 * PI * ff, 4) + ')^2 = ' + qx(kf, 'Nperm') + '$.'],
      'Convert $f$ to $\\omega$ first.', 'Nperm', { k: 'shm', m: mf, f: ff, want: 'k' });
  });

  G('mech.shm-initial-conditions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['A', 'A', 'vmax'], ['A', 'phi', 'xt', 'vmax'], ['phi', 'xt', 'phi', 'A']));
    var w = R.pick([2, 4, 5, 10]), m = R.pick([0.5, 1, 2]), k = m * w * w, x0 = R.pick([-0.1, -0.05, 0.03, 0.05, 0.08, 0.1, 0.12]), v0 = R.pick([-0.8, -0.5, -0.3, 0.2, 0.4, 0.6, 1]);
    if (shape === 'phi' && x0 === 0) x0 = 0.05;
    var A = M.sqrt(x0 * x0 + M.pow(v0 / w, 2)), phi = M.atan2(-v0 / w, x0);
    var intro = 'A $' + qg(m, 'kg') + '$ block on a spring ($k = ' + qg(k, 'Nperm') + '$) starts at $x_0 = ' + qg(x0, 'm') + '$ with velocity $v_0 = ' + qg(v0, 'ms') + '$. ';
    var st = ['$\\omega = \\sqrt{k/m} = ' + w + '\\ \\text{rad/s}$. With $x = A\\cos(\\omega t + \\phi)$: $x_0 = A\\cos\\phi$ and $v_0 = -A\\omega\\sin\\phi$.', 'Square and add: $A^2 = x_0^2 + \\left(\\dfrac{v_0}{\\omega}\\right)^2 = (' + gx(x0) + ')^2 + \\left(\\dfrac{' + gx(v0) + '}{' + w + '}\\right)^2$, so $A = ' + qx(A, 'm', 4) + '$.'];
    var chk = { k: 'shmic', w: w, x0: x0, v0: v0 };
    if (shape === 'A') return P(intro + 'Find the amplitude of its motion.', ans(A, 0.01), st, 'Combine $x_0$ and $v_0/\\omega$ like the sides of a right triangle.', 'm', Object.assign(chk, { want: 'A' }));
    if (shape === 'vmax') return P(intro + 'What is its greatest speed?', ans(A * w, 0.01), st.concat(['$v_{\\max} = A\\omega = ' + fx(A, 4) + '(' + w + ') = ' + qx(A * w, 'ms') + '$, more than $|v_0|$ unless it starts at equilibrium.']),
      'Find the amplitude first.', 'ms', Object.assign(chk, { want: 'vmax' }));
    if (shape === 'phi') return P(intro + 'Writing $x = A\\cos(\\omega t + \\phi)$ with $-\\pi < \\phi \\le \\pi$, find the phase $\\phi$ in radians.',
      { t: 'num', v: sfStr(phi, 3), tol: 0.02 },
      st.concat(['$\\cos\\phi = \\dfrac{x_0}{A} = ' + fx(x0 / A, 4) + '$ and $\\sin\\phi = -\\dfrac{v_0}{A\\omega} = ' + fx(-v0 / (A * w), 4) + '$.', 'Both signs together fix the quadrant: $\\phi$ is in quadrant ' + (phi >= 0 ? (phi <= PI / 2 ? 'I' : 'II') : (phi >= -PI / 2 ? 'IV' : 'III')) + ', so $\\phi = ' + fx(phi, 3) + '\\ \\text{rad}$.', 'Check: $' + (v0 > 0 ? 'v_0 > 0' : 'v_0 < 0') + '$ requires $\\sin\\phi ' + (v0 > 0 ? '< 0' : '> 0') + '$. Using $\\arctan$ alone can land in the wrong quadrant.']),
      'Use both $\\cos\\phi = x_0/A$ and the sign of $\\sin\\phi = -v_0/(A\\omega)$.', 'rad', Object.assign(chk, { want: 'phi' }));
    var t1 = R.pick([0.1, 0.2, 0.3, 0.5]), xt = A * M.cos(w * t1 + phi);
    return P(intro + 'Where is it at $t = ' + qg(t1, 's') + '$?', ans(xt, 0.02, 3),
      st.concat(['Phase: $\\phi = ' + fx(phi, 4) + '\\ \\text{rad}$ (from $\\cos\\phi = x_0/A$ and the sign of $\\sin\\phi = -v_0/(A\\omega)$).', '$x = ' + fx(A, 4) + '\\cos(' + w + '(' + gx(t1) + ') ' + (phi < 0 ? '- ' + fx(-phi, 4) : '+ ' + fx(phi, 4)) + ') = ' + qx(xt, 'm') + '$.', 'Equivalent: $x = x_0\\cos\\omega t + \\dfrac{v_0}{\\omega}\\sin\\omega t$.']),
      'Find $A$ and $\\phi$, or use $x = x_0\\cos\\omega t + (v_0/\\omega)\\sin\\omega t$.', 'm', Object.assign(chk, { want: 'x', t: t1 }));
  });

  G('mech.vertical-spring', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['stretch', 'T', 'Tstretch'], ['T', 'Tstretch', 'release', 'stretch'], ['release', 'Fmax', 'Tstretch', 'release']));
    var m = R.pick([0.1, 0.2, 0.25, 0.5, 1, 2]), k = R.pick([10, 20, 25, 40, 50, 100, 200]), d = m * g0 / k;
    var intro = 'A $' + qg(m, 'kg') + '$ mass hangs from a spring with $k = ' + qg(k, 'Nperm') + '$. ';
    if (shape === 'stretch') return P(intro + 'How far below the spring\'s natural length is its equilibrium position?', ans(d, 0.01),
      ['At equilibrium the spring holds up the weight: $kd = mg$.', '$d = \\dfrac{mg}{k} = \\dfrac{' + gx(m) + '(9.8)}{' + k + '} = ' + qx(d, 'm') + '$.'], 'Balance the spring force and the weight.', 'm', { k: 'vspring', m: m, kk: k, want: 'd' });
    if (shape === 'T') return P(intro + 'It is pulled down a little and released. Find the period.', ans(2 * PI * M.sqrt(m / k), 0.01),
      ['Measure $y$ from the new equilibrium (stretch $d = mg/k$), down positive. The net force is $mg - k(d + y) = -ky$, since $kd = mg$.', 'So $m\\ddot{y} = -ky$: the same equation as a horizontal spring. Gravity only moved the equilibrium point.', '$T = 2\\pi\\sqrt{\\dfrac{m}{k}} = 2\\pi\\sqrt{\\dfrac{' + gx(m) + '}{' + k + '}} = ' + qx(2 * PI * M.sqrt(m / k), 's') + '$.'],
      'Does gravity change the restoring force about the new equilibrium?', 's', { k: 'vspring', m: m, kk: k, want: 'T' });
    if (shape === 'Tstretch') { var ds = R.pick([0.02, 0.05, 0.1, 0.2, 0.25, 0.4]), Ts = 2 * PI * M.sqrt(ds / g0);
      return P('Hanging a mass on a spring stretches it $' + qg(ds, 'm') + '$ at equilibrium. If the mass is pulled down slightly and released, what is the period? (You aren\'t told the mass or $k$.)', ans(Ts, 0.01),
        ['At equilibrium $kd = mg$, so $\\dfrac{m}{k} = \\dfrac{d}{g}$.', '$T = 2\\pi\\sqrt{\\dfrac{m}{k}} = 2\\pi\\sqrt{\\dfrac{d}{g}} = 2\\pi\\sqrt{\\dfrac{' + gx(ds) + '}{9.8}} = ' + qx(Ts, 's') + '$.'],
        'Use the equilibrium stretch to find $m/k$.', 's', { k: 'vspring', m: 1, kk: g0 / ds, want: 'T' }); }
    if (shape === 'release') return P(intro + 'It is attached to the spring at its natural length and released from rest. How far does it drop before turning back?', ans(2 * d, 0.01),
      ['Equilibrium is $d = mg/k = ' + qx(d, 'm', 4) + '$ below the natural length. The mass starts at rest $d$ above equilibrium, so the amplitude is $A = d$.', 'It oscillates symmetrically about equilibrium, turning back $d$ below it: a total drop of $2d = \\dfrac{2mg}{k} = ' + qx(2 * d, 'm') + '$.', 'Check with energy: $mg(2d) = \\tfrac{1}{2}k(2d)^2$ gives $2d = 2mg/k$.'],
      'Where is the equilibrium, and how far from it does the mass start?', 'm', { k: 'vspring', m: m, kk: k, want: 'drop' });
    return P(intro + 'It is attached at the spring\'s natural length and released from rest. What is the largest force the spring exerts during the motion?', ans(2 * m * g0, 0.01),
      ['Amplitude $A = d = mg/k$ (it starts at rest a distance $d$ above equilibrium).', 'Lowest point: stretch $d + A = 2d$, where the spring force is $k(2d) = 2mg = ' + qx(2 * m * g0, 'N') + '$, twice the weight.'],
      'Find the lowest point first.', 'N', { k: 'vspring', m: m, kk: k, want: 'Fmax' });
  });

  G('mech.physical-pendulum', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['simple', 'rod', 'rod'], ['rod', 'disk', 'rodd', 'Leq'], ['rodd', 'disk', 'Leq', 'hoop']));
    if (shape === 'simple') { var Ls = R.int(2, 30) / 10, Ts = 2 * PI * M.sqrt(Ls / g0);
      return P('A small bob hangs on a light string $' + qg(Ls, 'm') + '$ long and swings through small angles. Find its period.', ans(Ts, 0.01),
        ['Torque about the pivot: $\\tau = -mgL\\sin\\theta \\approx -mgL\\theta$ for small $\\theta$ (in radians). With $I = mL^2$: $mL^2\\ddot{\\theta} = -mgL\\theta$.', 'So $\\ddot{\\theta} = -\\dfrac{g}{L}\\theta$: simple harmonic with $\\omega = \\sqrt{g/L}$.', '$T = 2\\pi\\sqrt{\\dfrac{L}{g}} = 2\\pi\\sqrt{\\dfrac{' + gx(Ls) + '}{9.8}} = ' + qx(Ts, 's') + '$.'],
        'Linearize $\\sin\\theta \\approx \\theta$.', 's', { k: 'ppend', I: 1 * Ls * Ls, m: 1, d: Ls, want: 'T' }); }
    var L = R.int(3, 20) / 10, Mr = R.pick([0.5, 1, 2]);
    if (shape === 'rod' || shape === 'Leq') { var I = Mr * L * L / 3, T = 2 * PI * M.sqrt(I / (Mr * g0 * L / 2));
      if (shape === 'Leq') return P('A uniform rod $' + qg(L, 'm') + '$ long swings from one end. How long would a simple pendulum (a small bob on a string) have to be to have the same period?', ans(2 * L / 3, 0.01),
        ['Physical pendulum: $T = 2\\pi\\sqrt{\\dfrac{I}{mgd}}$ with $I = \\tfrac{1}{3}mL^2$ and $d = \\tfrac{L}{2}$ (pivot to center of mass).', 'So $T = 2\\pi\\sqrt{\\dfrac{2L}{3g}}$. A simple pendulum has $T = 2\\pi\\sqrt{\\ell/g}$.', 'Equal periods: $\\ell = \\dfrac{2L}{3} = ' + qx(2 * L / 3, 'm') + '$.'],
        'Compare $I/(md)$ with the simple pendulum\'s length.', 'm', { k: 'ppend', I: I, m: Mr, d: L / 2, want: 'Leq' });
      return P('A uniform rod (mass $' + qg(Mr, 'kg') + '$, length $' + qg(L, 'm') + '$) swings through small angles about a pivot at one end. Find its period.', ans(T, 0.01),
        ['Gravity acts at the center of mass, $d = L/2$ from the pivot: $\\tau = -mgd\\sin\\theta \\approx -mgd\\,\\theta$.', '$I\\ddot{\\theta} = -mgd\\,\\theta$ gives $\\omega = \\sqrt{\\dfrac{mgd}{I}}$ and $T = 2\\pi\\sqrt{\\dfrac{I}{mgd}}$.', 'With $I = \\tfrac{1}{3}mL^2$ and $d = \\tfrac{L}{2}$: $T = 2\\pi\\sqrt{\\dfrac{2L}{3g}} = 2\\pi\\sqrt{\\dfrac{2(' + gx(L) + ')}{3(9.8)}} = ' + qx(T, 's') + '$.'],
        'Use $T = 2\\pi\\sqrt{I/(mgd)}$ with $d$ from the pivot to the center of mass.', 's', { k: 'ppend', I: I, m: Mr, d: L / 2, want: 'T' }, { name: 'ph-oscillator', opts: { type: 'physical', L: L, theta0: 10, interactive: false, quiet: true, t: 0, traces: [], hide: ['energy', 'period'] } }); }
    if (shape === 'rodd') { var dd = sgf(L * R.pick([0.1, 0.2, 0.25, 0.3, 0.4]), 2), Id = Mr * L * L / 12 + Mr * dd * dd, Td = 2 * PI * M.sqrt(Id / (Mr * g0 * dd));
      return P('A uniform meter-stick-like rod (mass $' + qg(Mr, 'kg') + '$, length $' + qg(L, 'm') + '$) swings through small angles about a nail through a hole $' + qg(dd, 'm') + '$ from its center. Find its period.', ans(Td, 0.01),
        ['Parallel axis: $I = \\tfrac{1}{12}mL^2 + md^2 = ' + fx(Mr * L * L / 12, 4) + ' + ' + fx(Mr * dd * dd, 4) + ' = ' + qx(Id, 'kgm2', 4) + '$.', '$T = 2\\pi\\sqrt{\\dfrac{I}{mgd}} = 2\\pi\\sqrt{\\dfrac{' + fx(Id, 4) + '}{' + gx(Mr) + '(9.8)(' + gx(dd) + ')}} = ' + qx(Td, 's') + '$.'],
        'Find $I$ about the nail, with $d$ from the nail to the center.', 's', { k: 'ppend', I: Id, m: Mr, d: dd, want: 'T' }); }
    var Rd = R.int(5, 50) / 100, hoop = shape === 'hoop', Ih = hoop ? 2 * Rd * Rd : 1.5 * Rd * Rd, Th = 2 * PI * M.sqrt(Ih / (g0 * Rd));
    return P('A ' + (hoop ? 'thin ring' : 'uniform disk') + ' of radius $' + qg(Rd, 'm') + '$ hangs on a nail through a point on its rim and swings through small angles in its own plane. Find its period.', ans(Th, 0.01),
      ['Parallel axis: $I = ' + (hoop ? 'MR^2 + MR^2 = 2MR^2' : '\\tfrac{1}{2}MR^2 + MR^2 = \\tfrac{3}{2}MR^2') + '$, and $d = R$.', '$T = 2\\pi\\sqrt{\\dfrac{I}{MgR}} = 2\\pi\\sqrt{\\dfrac{' + (hoop ? '2R' : '3R') + '}{' + (hoop ? 'g' : '2g') + '}} = ' + qx(Th, 's') + '$. The mass cancels.'],
      'Find $I$ about the nail with the parallel-axis theorem.', 's', { k: 'ppend', I: Ih, m: 1, d: Rd, want: 'T' });
  });

  G('mech.damped-oscillations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['amp', 'crit', 'class'], ['amp', 'half', 'crit', 'class'], ['wd', 'half', 'energy', 'amp']));
    var m = R.pick([0.5, 1, 2, 4]), k = R.pick([50, 100, 200, 400]), w0 = M.sqrt(k / m), bc = 2 * M.sqrt(k * m), b = sgf(bc * R.pick([0.02, 0.05, 0.1, 0.2]), 2), gam = b / (2 * m);
    var intro = 'A $' + qg(m, 'kg') + '$ mass on a spring ($k = ' + qg(k, 'Nperm') + '$) moves through a fluid that adds a drag force $-bv$ with $b = ' + qg(b, 'Nsm') + '$. ';
    var eq = '$m\\ddot{x} + b\\dot{x} + kx = 0$ has the underdamped solution $x = A_0e^{-bt/2m}\\cos(\\omega_dt + \\phi)$.';
    if (shape === 'class') { var which = R.pick(['under', 'crit', 'over']), bb = which === 'crit' ? sgf(bc, 3) : which === 'under' ? sgf(bc * 0.3, 2) : sgf(bc * 2.5, 2);
      var bcT = 2 * M.sqrt(k * m), exactCrit = which === 'crit' && M.abs(bb - bcT) < 1e-9;
      if (which === 'crit' && !exactCrit) { which = 'under'; bb = sgf(bc * 0.3, 2); }
      return P('A $' + qg(m, 'kg') + '$ mass on a spring ($k = ' + qg(k, 'Nperm') + '$) has damping constant $b = ' + qg(bb, 'Nsm') + '$. Displaced and released, what does it do?',
        mc(which === 'under' ? 'It oscillates with an amplitude that shrinks exponentially.' : which === 'crit' ? 'It returns to equilibrium as fast as possible without swinging past it.' : 'It creeps back to equilibrium slowly without swinging past it.', which === 'under' ? ['It returns to equilibrium as fast as possible without swinging past it.', 'It creeps back to equilibrium slowly without swinging past it.', 'It swings past equilibrium exactly once, then stops.'] : ['It oscillates with an amplitude that shrinks exponentially.', 'It swings past equilibrium exactly once, then stops.', which === 'crit' ? 'It creeps back to equilibrium slowly without swinging past it.' : 'It returns to equilibrium as fast as possible without swinging past it.']),
        ['Critical damping is $b_c = 2\\sqrt{km} = 2\\sqrt{' + k + '(' + gx(m) + ')} = ' + qx(bcT, 'Nsm', 4) + '$.', which === 'under' ? '$b < b_c$: underdamped. It oscillates at $\\omega_d = \\sqrt{\\omega_0^2 - (b/2m)^2}$ inside a shrinking envelope.' : which === 'crit' ? '$b = b_c$: critically damped. It returns fastest without overshooting.' : '$b > b_c$: overdamped. It returns without overshooting, but more slowly than at critical damping.',
          'A critically damped system does not swing once before stopping; it doesn\'t cross equilibrium at all when released from rest.'],
        'Compare $b$ with $2\\sqrt{km}$.', null, { k: 'mc' }); }
    if (shape === 'crit') { var bcr = 2 * M.sqrt(k * m);
      return P('A $' + qg(m, 'kg') + '$ mass on a spring ($k = ' + qg(k, 'Nperm') + '$) is to be critically damped, like a door closer. What damping constant $b$ is needed?', ans(bcr, 0.01),
        ['Try $x = e^{rt}$ in $m\\ddot{x} + b\\dot{x} + kx = 0$: $mr^2 + br + k = 0$, so $r = \\dfrac{-b \\pm \\sqrt{b^2 - 4mk}}{2m}$.', 'Critical damping is the boundary where the square root is zero: $b^2 = 4mk$.', '$b_c = 2\\sqrt{mk} = 2\\sqrt{' + gx(m) + '(' + k + ')} = ' + qx(bcr, 'Nsm') + '$.'],
        'Set the discriminant of the characteristic equation to zero.', 'Nsm', { k: 'damp', m: m, kk: k, want: 'bc' }); }
    if (shape === 'amp') { var A0 = R.pick([0.05, 0.1, 0.2]), t1 = sgf(R.pick([1, 2, 3, 5]) / gam, 2), At = A0 * M.exp(-gam * t1);
      return P(intro + 'It starts with amplitude $' + qg(A0, 'm') + '$. What is the amplitude after $' + qg(t1, 's') + '$?', ans(At, 0.02),
        [eq, 'The envelope decays as $e^{-bt/2m}$: $\\dfrac{b}{2m} = \\dfrac{' + gx(b) + '}{2(' + gx(m) + ')} = ' + fx(gam, 4) + '\\ \\text{s}^{-1}$.', '$A = ' + gx(A0) + 'e^{-(' + fx(gam, 4) + ')(' + gx(t1) + ')} = ' + qx(At, 'm') + '$.'],
        'The amplitude falls as $e^{-bt/2m}$.', 'm', { k: 'damp', m: m, kk: k, b: b, A0: A0, t: t1, want: 'A' }); }
    if (shape === 'half') { var th = 2 * m * M.LN2 / b;
      return P(intro + 'How long does it take for the amplitude to fall to half?', ans(th, 0.02),
        [eq, 'Half amplitude: $e^{-bt/2m} = \\tfrac{1}{2}$, so $t = \\dfrac{2m\\ln 2}{b} = \\dfrac{2(' + gx(m) + ')(0.693)}{' + gx(b) + '} = ' + qx(th, 's') + '$.'],
        'Solve $e^{-bt/2m} = 1/2$.', 's', { k: 'damp', m: m, kk: k, b: b, want: 'half' }); }
    if (shape === 'energy') { var t2 = sgf(R.pick([0.5, 1, 2]) / gam, 2), frac = M.exp(-b * t2 / m);
      return P(intro + 'What fraction of its starting energy is left after $' + qg(t2, 's') + '$? (Light damping: count energy at the turning points.)', ans(frac, 0.02),
        ['Energy is proportional to amplitude squared, $E \\propto A^2 = A_0^2e^{-bt/m}$.', '$\\dfrac{E}{E_0} = e^{-bt/m} = e^{-' + gx(b) + '(' + gx(t2) + ')/' + gx(m) + '} = ' + fx(frac, 3) + '$.'],
        'Square the amplitude factor.', null, { k: 'damp', m: m, kk: k, b: b, t: t2, want: 'E' }); }
    var bw = sgf(bc * R.pick([0.3, 0.5, 0.6, 0.8]), 2), wd = M.sqrt(k / m - M.pow(bw / (2 * m), 2));
    return P('A $' + qg(m, 'kg') + '$ mass on a spring ($k = ' + qg(k, 'Nperm') + '$) has fairly strong damping, $b = ' + qg(bw, 'Nsm') + '$. Find the angular frequency of its damped oscillation.', ans(wd, 0.01),
      ['Undamped: $\\omega_0^2 = \\dfrac{k}{m} = ' + gx(fix(k / m)) + '\\ \\text{s}^{-2}$. Damping rate: $\\dfrac{b}{2m} = ' + fx(bw / (2 * m), 4) + '\\ \\text{s}^{-1}$.', '$\\omega_d = \\sqrt{\\omega_0^2 - \\left(\\dfrac{b}{2m}\\right)^2} = \\sqrt{' + gx(fix(k / m)) + ' - ' + fx(M.pow(bw / (2 * m), 2), 4) + '} = ' + qx(wd, 'rads') + '$, a bit slower than $\\omega_0 = ' + fx(w0, 4) + '$.'],
      'Damping lowers the oscillation frequency.', 'rads', { k: 'damp', m: m, kk: k, b: bw, want: 'wd' });
  });

  G('mech.driven-resonance', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['f0', 'which', 'res'], ['res', 'amp', 'f0', 'which'], ['amp', 'res', 'ratio', 'amp']));
    var m = R.pick([0.5, 1, 2]), k = R.pick([50, 100, 200, 800]), w0 = M.sqrt(k / m), b = R.pick([0.5, 1, 2, 4]), F0 = R.pick([1, 2, 4, 5]);
    var intro = 'A $' + qg(m, 'kg') + '$ mass on a spring ($k = ' + qg(k, 'Nperm') + '$) with damping $b = ' + qg(b, 'Nsm') + '$ is pushed by a force $F_0\\cos\\omega t$ with $F_0 = ' + qg(F0, 'N') + '$. ';
    if (shape === 'which') return P('A child on a swing gets a small push at the same point of every swing, matching the swing\'s natural rhythm. What happens to the size of the swing over many pushes?',
      mc('It grows at first, then levels off at a steady size where the energy lost to friction and air each cycle equals the energy each push adds.', ['It grows without limit, as long as the pushes continue.', 'It stays the same, because each push is small.', 'It grows and then shrinks back to zero.']),
      ['Pushing in rhythm with the natural frequency (resonance) adds energy every cycle, so the amplitude grows.', 'But the losses (friction, air drag) grow with the amplitude, too: a faster swing loses more energy per cycle.', 'The amplitude levels off when the loss per cycle equals the energy added per cycle. With less damping that level is higher, but it is always finite in a real system.'],
      'What limits the amplitude?', null, { k: 'mc' });
    if (shape === 'f0') return P('A $' + qg(m, 'kg') + '$ mass on a spring with $k = ' + qg(k, 'Nperm') + '$ is driven by a small motor with light damping. At what driving frequency, in hertz, will the response be largest?', ans(w0 / (2 * PI), 0.01),
      ['With light damping, the amplitude peaks when the driving frequency matches the natural frequency: $\\omega_0 = \\sqrt{k/m} = ' + qx(w0, 'rads', 4) + '$.', 'In hertz: $f_0 = \\dfrac{\\omega_0}{2\\pi} = ' + qx(w0 / (2 * PI), 'Hz') + '$.'],
      'Find the natural frequency.', 'Hz', { k: 'drive', m: m, kk: k, want: 'f0' });
    if (shape === 'res') { var Ar = F0 / (b * w0);
      return P(intro + 'Driven at its natural frequency, what is the steady amplitude?', ans(Ar, 0.02),
        ['Steady state: $x = A\\cos(\\omega t - \\delta)$ with $A = \\dfrac{F_0/m}{\\sqrt{(\\omega_0^2 - \\omega^2)^2 + (b\\omega/m)^2}}$.', 'At $\\omega = \\omega_0 = \\sqrt{k/m} = ' + qx(w0, 'rads', 4) + '$ the first term vanishes, so $A = \\dfrac{F_0/m}{b\\omega_0/m} = \\dfrac{F_0}{b\\omega_0}$.', '$A = \\dfrac{' + F0 + '}{' + gx(b) + '(' + fx(w0, 4) + ')} = ' + qx(Ar, 'm') + '$: only damping limits it.'],
        'At resonance only the damping term is left in the denominator.', 'm', { k: 'drive', m: m, kk: k, b: b, F0: F0, w: w0, want: 'A' }); }
    if (shape === 'ratio') { var Ar2 = F0 / (b * w0), As = F0 / k;
      return P(intro + 'How many times larger is the steady amplitude when it is driven at resonance than when it is driven very slowly ($\\omega \\to 0$)?', ans(Ar2 / As, 0.02),
        ['Very slow driving: $A \\to \\dfrac{F_0/m}{\\omega_0^2} = \\dfrac{F_0}{k} = ' + qx(As, 'm', 4) + '$, just the static stretch.', 'At resonance: $A = \\dfrac{F_0}{b\\omega_0} = ' + qx(Ar2, 'm', 4) + '$.', 'Ratio $= \\dfrac{k}{b\\omega_0} = \\dfrac{m\\omega_0}{b} = ' + fx(Ar2 / As, 3) + '$ (this is the quality factor $Q$).'],
        'Compare $F_0/(b\\omega_0)$ with $F_0/k$.', null, { k: 'drive', m: m, kk: k, b: b, F0: F0, want: 'Q' }); }
    var wd = sgf(w0 * R.pick([0.5, 0.7, 0.8, 0.9, 1.1, 1.2, 1.5]), 2), Ad = (F0 / m) / M.sqrt(M.pow(w0 * w0 - wd * wd, 2) + M.pow(b * wd / m, 2));
    return P(intro + 'It is driven at $\\omega = ' + qg(wd, 'rads') + '$. Find the steady-state amplitude.', ans(Ad, 0.02),
      ['$\\omega_0^2 = k/m = ' + gx(fix(k / m)) + '\\ \\text{s}^{-2}$ and $\\omega^2 = ' + fx(wd * wd, 4) + '\\ \\text{s}^{-2}$.', '$A = \\dfrac{F_0/m}{\\sqrt{(\\omega_0^2 - \\omega^2)^2 + (b\\omega/m)^2}} = \\dfrac{' + gx(fix(F0 / m)) + '}{\\sqrt{(' + fx(w0 * w0 - wd * wd, 4) + ')^2 + (' + fx(b * wd / m, 4) + ')^2}} = ' + qx(Ad, 'm') + '$.'],
      'Substitute into the steady-state amplitude formula.', 'm', { k: 'drive', m: m, kk: k, b: b, F0: F0, w: wd, want: 'A' });
  });


  // exposed for the course's node tests
  ML.mechHelpers = { sfStr: sfStr, fx: fx, gx: gx, polyPlain: polyPlain, polyAt: polyAt, polyD: polyD, polyI: polyI, wideMath: wideMath };
})(window.MathLadder);
