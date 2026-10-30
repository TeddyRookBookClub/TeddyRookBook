/* Chemistry Ladder generators: General Chemistry 2 (course key gchem2).
   One generator per topic in data/chemistry/topics/gchem2.json, registered with MathLadder.gen.
   Built from source parts in the course builder's work dir (gen/*.js, concatenated in order).

   Conventions (the ladder's overview): constants as problems use them (R = 8.314 J/(mol·K) = 0.08206 L·atm/(mol·K),
   F = 96 485 C/mol, N_A = 6.022 × 10²³, h = 6.626 × 10⁻³⁴ J·s, c = 3.00 × 10⁸ m/s, Kw = 1.0 × 10⁻¹⁴ at 25 °C);
   25 °C = 298 K; E°cell = E°cathode − E°anode with standard reduction potentials; ΔG° = −nFE°; Nernst at 25 °C with
   0.0592 V. Every value a problem needs is stated in the problem. Numbers with units carry `unit` and `rtol`
   (usually 0.02); pH, pOH and pKa use an absolute tol of 0.02. Every problem also carries `chk`, the setup in
   machine-readable form, so the course's node test can recompute each answer by another route (charge balances,
   numeric integration, substitution back into K, symmetry counting). The runner ignores it. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, U = ML.util, M = Math;
  var C = { NA: 6.022e23, h: 6.626e-34, c: 3.00e8, R: 8.314, RL: 0.08206, F: 96485, Kw: 1.0e-14, amu: 931.5 };

  // promote long inline math to display math: inline math never wraps, so long pieces would widen phone pages
  function wideMath(s, limit) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    limit = limit || 34;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      var c = s[i];
      if (c === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (c === '$' && s[i + 1] === '$') { var j = s.indexOf('$$', i + 2); if (j < 0) { out += s.slice(i); break; } out += s.slice(i, j + 2); i = j + 2; continue; }
      if (c === '$') {
        var k = i + 1; while (k < n && !(s[k] === '$' && s[k - 1] !== '\\')) k++;
        if (k >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, k);
        if (visLen(tex) > limit) { out += '$$' + tex + '$$'; i = k + 1; if (s[i] === '.' || s[i] === ',') i++; continue; }
        out += '$' + tex + '$'; i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  function visLen(tex) {
    return tex.replace(/\\(text|mathrm)\{([^}]*)\}/g, '$2').replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|bigl|bigr|operatorname)\b/g, '')
      .replace(/\\(ln|log|exp)\b/g, 'xx').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length;
  }
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var p = fn(R, ctx);
      if (p && typeof p === 'object') {
        p.q = wideMath(p.q); if (Array.isArray(p.steps)) p.steps = p.steps.map(function (x) { return wideMath(x); }); if (p.hint) p.hint = wideMath(p.hint);
        if (p.a && p.a.t === 'mc') p.a.choices = p.a.choices.map(function (x) { return wideMath(x, 40); });
      }
      return p;
    });
  }
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  /* variety helpers: "which one is …" and "choose all that are …" from one bank, so distractors combine */
  function vOne(R, pool, ok, n) { var g = pool.filter(ok), b = pool.filter(function (x) { return !ok(x); }), r = R.pick(g), it = R.shuffle([r].concat(R.sample(b, n - 1))); return { items: it, v: it.indexOf(r), right: r }; }
  function vAll(R, pool, ok, n) {
    var g = pool.filter(ok), b = pool.filter(function (x) { return !ok(x); }), k = R.int(1, M.min(n - 1, g.length)); if (b.length < n - k) k = n - b.length;
    var it = R.shuffle(R.sample(g, k).concat(R.sample(b, n - k)));
    return { items: it, v: it.map(function (x, i) { return ok(x) ? i : -1; }).filter(function (i) { return i >= 0; }) };
  }
  function MCA(items, v) { return { t: 'mc', choices: items, v: v }; }

  // ------------------------------------------------------------------ numbers
  function cm(x) { return T.commas(x).replace(/,/g, '{,}'); }   // thousands separators that TeX does not space
  function fix(x) { return Number(Number(x).toPrecision(12)) + 0; }
  function ex10(x) { return M.floor(M.log10(M.abs(x)) + 1e-12); }
  function sgf(x, n) { if (x === 0 || !isFinite(x)) return x; var e = ex10(x), f = M.pow(10, n - 1 - e); return fix(M.round(x * f) / f); }
  function plainNum(x) { x = fix(x); var s = String(x); if (/e/.test(s)) s = ML.Q.from(s).toDec(30).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s; }
  // the value for an answer spec: n significant figures; scientific form a*10^k outside 0.001 … 10^6
  function sfStr(x, n) { // trailing zeros kept, so the shown answer has n significant figures (1.80 × 10^-5, 0.0400)
    n = n || 3; var y = sgf(x, n); if (y === 0) return '0';
    var e = ex10(y), neg = y < 0 ? '-' : '';
    if (e >= 6 || e <= -4) return neg + (M.abs(y) / M.pow(10, e)).toFixed(M.max(0, n - 1)) + '*10^' + e;
    return neg + M.abs(y).toFixed(M.max(0, n - 1 - e));
  }
  // TeX for a computed number, n significant figures kept (trailing zeros too); × 10^k below 0.001 and from 10^5
  function fx(x, n) {
    n = n || 3; if (!isFinite(x)) return '\\infty'; if (x === 0) return '0';
    var y = sgf(x, n), e = ex10(y), neg = y < 0 ? '-' : '';
    if (e >= 5 || e <= -4) { var m = M.abs(y) / M.pow(10, e); return neg + m.toFixed(M.max(0, n - 1)) + ' \\times 10^{' + e + '}'; }
    var d = M.max(0, n - 1 - e), s = M.abs(y).toFixed(d);
    if (M.abs(y) >= 10000) s = cm(+s);
    return neg + s;
  }
  // TeX for a given value, written with n significant figures (trailing zeros kept) or as it is when n is left out
  function sfNeed(x) { for (var n = 1; n < 10; n++) if (M.abs(sgf(x, n) - x) <= 1e-9 * M.abs(x)) return n; return 10; }
  function gv(x, n) {
    if (n) return fx(x, n);
    if (x !== 0 && isFinite(x) && ((M.abs(x) < 100 && !Number.isInteger(x)) || M.abs(x) < 10 || M.abs(x) >= 1e5 || M.abs(x) < 1e-3)) return fx(x, M.max(2, sfNeed(x)));
    x = fix(x); if (x === 0) return '0';
    var e = ex10(x);
    if (e >= 5 || e <= -4) { var m = fix(x / M.pow(10, e)); return T.num(m) + ' \\times 10^{' + e + '}'; }
    return M.abs(x) >= 10000 ? cm(x) : T.num(x);
  }
  function d2(x) { return (M.round(x * 100) / 100).toFixed(2); }          // pH-style: two decimals
  function dN(x, n) { return (M.round(x * M.pow(10, n)) / M.pow(10, n)).toFixed(n); }
  function pf(x, n) { return x < 0 ? '(' + fx(x, n) + ')' : fx(x, n); }      // a computed number ready to subtract or multiply
  function sgn(x) { return x > 0 ? '+' : ''; }                                // for signed quantities shown with their sign
  function pm(x, n) { return (x > 0 ? '+' : '') + fx(x, n); }
  function log10(x) { return M.log(x) / M.LN10; }

  // ------------------------------------------------------------------ units
  var UT = { 'M/s': '\\text{M/s}', 's⁻¹': '\\text{s}^{-1}', 'min⁻¹': '\\text{min}^{-1}', 'M⁻¹·s⁻¹': '\\text{M}^{-1}\\,\\text{s}^{-1}', 'M⁻²·s⁻¹': '\\text{M}^{-2}\\,\\text{s}^{-1}',
    'kJ/mol': '\\text{kJ/mol}', 'J/mol': '\\text{J/mol}', 'J/K': '\\text{J/K}', 'J/(mol·K)': '\\text{J/(mol·K)}', '°C': '^\\circ\\text{C}', '%': '\\%' };
  function ut(u) { return UT[u] || '\\text{' + u + '}'; }
  function q(x, u, n) { return fx(x, n) + (u === '°C' || u === '%' ? '' : '\\ ') + ut(u); }      // computed quantity
  function qv(x, u, n) { return gv(x, n) + (u === '°C' || u === '%' ? '' : '\\ ') + ut(u); }     // given quantity

  // ------------------------------------------------------------------ formulas and equations as TeX
  // 'Ca(NO3)2' -> \mathrm{Ca(NO_3)_2}; 'SO4^2-' -> \mathrm{SO_4^{2-}}; '[Cu(NH3)4]^2+'; 'H2O(l)' keeps the state
  function F(s) {
    s = String(s); var st = '', m = s.match(/\((s|l|g|aq)\)$/);
    if (m) { st = '(' + m[1] + ')'; s = s.slice(0, -m[0].length); }
    var ch = '', k = s.indexOf('^'); if (k >= 0) { ch = s.slice(k + 1); s = s.slice(0, k); }
    var body = s.replace(/([A-Za-z)\]])(\d+)/g, '$1_{$2}').replace(/·/g, '\\cdot ');
    if (ch) body += '^{' + ch.replace(/^1([+-])$/, '$1') + '}';
    return '\\mathrm{' + body + '}' + (st ? '\\,\\mathrm{' + st + '}' : '');
  }
  // '2NO2(g) <=> N2O4(g)' -> TeX with real arrows (coefficients split from formulas)
  function EQ(s) {
    return String(s).split(/\s+(\+|->|<=>)\s+/).map(function (tok) {
      if (tok === '+') return ' + '; if (tok === '->') return ' \\to '; if (tok === '<=>') return ' \\rightleftharpoons ';
      var m = tok.match(/^(\d+(?:\/\d+)?)\s*(.*)$/);
      if (m && /^[A-Z[(]/.test(m[2])) return (m[1].indexOf('/') > 0 ? '\\tfrac{' + m[1].split('/')[0] + '}{' + m[1].split('/')[1] + '}' : m[1]) + '\\,' + F(m[2]);
      if (/^e\^?-$/.test(tok)) return '\\text{e}^{-}';
      if (/^\d*e\^?-$/.test(tok)) return tok.replace(/e\^?-$/, '') + '\\,\\text{e}^{-}';
      return F(tok);
    }).join('');
  }
  function cc(s) { return '[' + F(String(s).replace(/^\[(.*)\](\^.*)?$/, '$1$2')) + ']'; }   // a concentration [X]; a complex keeps no inner brackets
  function pw(base, e) { return e === 1 ? base : base + '^{' + e + '}'; }

  // ------------------------------------------------------------------ answers and problems
  function num(x, n, rtol) { return { t: 'num', v: sfStr(x, n || 3), rtol: rtol || 0.02 }; }
  function numT(x, n, tol, rtol) { var a = { t: 'num', v: sfStr(x, n || 3), tol: tol }; if (rtol) a.rtol = rtol; return a; }
  function phA(x) { return { t: 'num', v: d2(x), tol: 0.02 }; }
  function int(n) { return { t: 'num', v: String(n), form: 'int' }; }
  function exact(v) { return { t: 'num', v: String(v) }; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function fml(v) { return { t: 'formula', v: Array.isArray(v) ? v : [v] }; }
  function txt(v) { return { t: 'text', v: Array.isArray(v) ? v : [v] }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function P(q, a, steps, hint, unit, chk, viz) {
    var p = { q: q, a: a, steps: steps };
    if (hint) p.hint = hint;
    if (unit && a.t === 'num' && !(a.pct && unit === '%')) p.unit = unit;
    if (chk) p.chk = chk;
    if (viz) p.viz = viz;
    return p;
  }
  // a pick that depends on the level: from list[0] at level 1, list[1] at level 2, …
  function pickL(R, ctx, lists) { return R.pick(lv(ctx, lists[0], lists[1], lists[2])); }
  function ord(n) { return ['zero', 'first', 'second', 'third'][n] || n + 'th'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // round half-up decimal string for a value with d decimals (given data)
  function rd(x, d) { return M.round(x * M.pow(10, d)) / M.pow(10, d); }

  // ------------------------------------------------------------------ equations as data
  // parseEq('2NO2(g) <=> N2O4(g)') -> { eq, r: [{f, n, ph}], p: [...], rev: true when '<=>' }
  function parseEq(s) {
    var arrow = s.indexOf(' <=> ') >= 0 ? ' <=> ' : ' -> ', sides = s.split(arrow);
    function side(t) {
      return t.split(' + ').map(function (tok) {
        var m = tok.match(/^(\d+(?:\/\d+)?)?\s*(.*?)(?:\((s|l|g|aq)\))?$/), n = m[1] ? (m[1].indexOf('/') > 0 ? +m[1].split('/')[0] / +m[1].split('/')[1] : +m[1]) : 1;
        return { f: m[2], n: n, ph: m[3] || '' };
      });
    }
    return { eq: s, r: side(sides[0]), p: side(sides[1]), rev: arrow === ' <=> ' };
  }
  function inK(sp) { return sp.ph !== 's' && sp.ph !== 'l'; }          // pure solids and liquids are left out of K and Q
  // the K (or Q) expression as TeX: \dfrac{[C]^2}{[A][B]^3}; P: true writes partial pressures
  function kExpr(E, P) {
    function term(sp) { var b = P ? 'P_{' + F(sp.f) + '}' : cc(sp.f); return sp.n === 1 ? b : (P ? '(' + b + ')' : b) + '^{' + T.num(sp.n) + '}'; }
    var top = E.p.filter(inK).map(term).join(''), bot = E.r.filter(inK).map(term).join('');
    if (!bot) return top || '1'; if (!top) return '\\dfrac{1}{' + bot + '}';
    return '\\dfrac{' + top + '}{' + bot + '}';
  }
  // K (or Q) from a map of concentrations {formula: value}
  function kVal(E, c) { var v = 1; E.p.filter(inK).forEach(function (sp) { v *= M.pow(c[sp.f], sp.n); }); E.r.filter(inK).forEach(function (sp) { v /= M.pow(c[sp.f], sp.n); }); return v; }
  // the same with numbers filled in, as TeX
  function kSub(E, c, n) {
    function term(sp) { var b = '(' + gv(c[sp.f], n) + ')'; return sp.n === 1 ? b : b + '^{' + T.num(sp.n) + '}'; }
    var top = E.p.filter(inK).map(term).join(''), bot = E.r.filter(inK).map(term).join('');
    if (!bot) return top; if (!top) return '\\dfrac{1}{' + bot + '}';
    return '\\dfrac{' + top + '}{' + bot + '}';
  }
  function dnGas(E) { var d = 0; E.p.forEach(function (sp) { if (sp.ph === 'g') d += sp.n; }); E.r.forEach(function (sp) { if (sp.ph === 'g') d -= sp.n; }); return d; }
  function species(E) { return E.r.concat(E.p); }
  function coefOf(E, f) { var v = 0; E.r.forEach(function (sp) { if (sp.f === f) v -= sp.n; }); E.p.forEach(function (sp) { if (sp.f === f) v += sp.n; }); return v; }
  // an equation string with its arrow, reversed or scaled (coefficients may become fractions)
  function eqStr(r, p, arrow) {
    function side(a) { return a.map(function (sp) { var n = sp.n; var cs = n === 1 ? '' : (Number.isInteger(n) ? String(n) : ML.Q.from(n).toPlain()); return cs + sp.f + (sp.ph ? '(' + sp.ph + ')' : ''); }).join(' + '); }
    return side(r) + (arrow || ' <=> ') + side(p);
  }
  function scaleEq(E, k) { function s(a) { return a.map(function (sp) { return { f: sp.f, n: fix(sp.n * k), ph: sp.ph }; }); } return k < 0 ? { r: s(E.p).map(neg), p: s(E.r).map(neg), rev: E.rev } : { r: s(E.r), p: s(E.p), rev: E.rev }; function neg(sp) { return { f: sp.f, n: -sp.n, ph: sp.ph }; } }
  // a small data table inside a problem (scrolls sideways on its own on narrow screens)
  function tbl(head, rows) {
    return '<div class="mlp-table-wrap"><table class="mlp-table">' + (head ? '<thead><tr>' + head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead>' : '') +
      '<tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (x, i) { return !head && i === 0 ? '<th scope="row">' + x + '</th>' : '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }


  // ================================================================== Unit 1: Kinetics
  var RATE_RX = [
    '2N2O5(g) -> 4NO2(g) + O2(g)', '2NO(g) + O2(g) -> 2NO2(g)', 'N2(g) + 3H2(g) -> 2NH3(g)', '4NH3(g) + 5O2(g) -> 4NO(g) + 6H2O(g)',
    '2HI(g) -> H2(g) + I2(g)', '2SO2(g) + O2(g) -> 2SO3(g)', 'CH4(g) + 2O2(g) -> CO2(g) + 2H2O(g)', '5Br^-(aq) + BrO3^-(aq) + 6H^+(aq) -> 3Br2(aq) + 3H2O(l)',
    '2NOCl(g) -> 2NO(g) + Cl2(g)', 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)'
  ];
  function rateSpecies(E) { return species(E).filter(function (sp) { return sp.ph !== 'l' && sp.ph !== 's'; }); }

  G('gchem2.reaction-rates', function (R, ctx) {
    var E = parseEq(R.pick(lv(ctx, RATE_RX.slice(0, 7), RATE_RX, RATE_RX))), sps = rateSpecies(E);
    var kind = lv(ctx, R.pick(['conv', 'conv', 'avg']), R.pick(['conv', 'avg', 'avg']), R.pick(['conv', 'avg', 'prod']));
    var eqT = EQ(E.eq);
    function isR(f) { return coefOf(E, f) < 0; }
    function word(f) { return isR(f) ? 'is used up' : 'forms'; }
    if (kind === 'conv') {
      var pair = R.sample(sps, 2), A = pair[0], B = pair[1], rA = R.pick([0.012, 0.024, 0.030, 0.045, 0.060, 0.018, 0.036, 0.0080, 0.0050, 0.15, 0.20]);
      var rate = rA / A.n, rB = rate * B.n;
      return P('In the reaction $' + eqT + '$, $' + F(A.f) + '$ ' + word(A.f) + ' at a rate of $' + qv(rA, 'M/s') + '$. At what rate ' + (isR(B.f) ? 'is $' + F(B.f) + '$ used up' : 'does $' + F(B.f) + '$ form') + '?',
        num(rB), [
          'Divide by the coefficient to get the rate of the reaction itself: rate $= \\dfrac{' + gv(rA) + '}{' + A.n + '} = ' + q(rate, 'M/s') + '$.',
          'Multiply by the coefficient of $' + F(B.f) + '$, which is ' + B.n + ': $' + B.n + ' \\times ' + fx(rate) + ' = ' + q(rB, 'M/s') + '$.',
          'Check: the coefficients are in the ratio ' + A.n + ' : ' + B.n + ', and so are the two rates. Rates are reported as positive numbers.'
        ], 'Every substance gives the same rate once you divide its rate of change by its coefficient.', 'M/s', { k: 'conv', eq: E.eq, a: A.f, rA: rA, b: B.f });
    }
    if (kind === 'avg') {
      var Rs = E.r.filter(inK), X = R.pick(Rs), c1 = R.pick([0.800, 0.500, 1.20, 0.250, 0.640, 1.00, 0.400]), frac = R.pick([0.25, 0.4, 0.5, 0.6, 0.3]);
      var c2 = sgf(c1 * (1 - frac), 3), t1 = R.pick([0, 0, 10, 20]), dt = R.pick([20, 25, 40, 50, 100]), t2 = t1 + dt;
      var rateX = (c1 - c2) / dt, rate = rateX / X.n;
      return P('For $' + eqT + '$, the concentration of $' + F(X.f) + '$ falls from $' + qv(c1, 'M', 3) + '$ at $t = ' + t1 + '\\ \\text{s}$ to $' + qv(c2, 'M', 3) + '$ at $t = ' + t2 + '\\ \\text{s}$. What is the average rate of the reaction over this interval?',
        num(rate), [
          'Change in concentration: $\\Delta' + cc(X.f) + ' = ' + gv(c2, 3) + ' - ' + gv(c1, 3) + ' = ' + fx(c2 - c1, 3) + '\\ \\text{M}$ over $\\Delta t = ' + dt + '\\ \\text{s}$.',
          'For a reactant, put a minus sign in front so the rate comes out positive, and divide by its coefficient (' + X.n + '):',
          '$$\\text{rate} = -\\dfrac{1}{' + X.n + '}\\dfrac{\\Delta' + cc(X.f) + '}{\\Delta t} = -\\dfrac{1}{' + X.n + '} \\times \\dfrac{' + fx(c2 - c1, 3) + '\\ \\text{M}}{' + dt + '\\ \\text{s}} = ' + q(rate, 'M/s') + '$$'
        ], 'Use −(1/coefficient) × Δ[reactant]/Δt.', 'M/s', { k: 'avg', eq: E.eq, x: X.f, c1: c1, c2: c2, dt: dt });
    }
    // prod: a product's concentration rises; find a reactant's rate of disappearance
    var Ps = E.p.filter(inK), Y = R.pick(Ps), Z = R.pick(E.r.filter(inK)), dc = R.pick([0.060, 0.090, 0.120, 0.150, 0.240, 0.0450]), dt2 = R.pick([15, 30, 60, 120]);
    var rY = dc / dt2, rr = rY / Y.n, rZ = rr * Z.n;
    return P('In $' + eqT + '$, $' + cc(Y.f) + '$ rises by $' + qv(dc, 'M', 2) + '$ in $' + dt2 + '\\ \\text{s}$. What is the average rate at which $' + F(Z.f) + '$ is used up over that time?',
      num(rZ), [
        'Rate of formation of $' + F(Y.f) + '$: $\\dfrac{' + gv(dc, 2) + '\\ \\text{M}}{' + dt2 + '\\ \\text{s}} = ' + q(rY, 'M/s') + '$.',
        'Rate of reaction: divide by its coefficient ' + Y.n + ': $' + q(rr, 'M/s') + '$.',
        'Rate of disappearance of $' + F(Z.f) + '$: multiply by its coefficient ' + Z.n + ': $' + q(rZ, 'M/s') + '$.'
      ], 'Go through the rate of the reaction: divide by one coefficient, multiply by the other.', 'M/s', { k: 'conv', eq: E.eq, a: Y.f, rA: rY, b: Z.f });
  });

  // known rate laws (measured), each with its overall equation
  var LAWS = [
    { eq: '2NO(g) + O2(g) -> 2NO2(g)', law: [['NO', 2], ['O2', 1]] },
    { eq: 'NO2(g) + CO(g) -> NO(g) + CO2(g)', law: [['NO2', 2]], zero: 'CO', note: 'below about 225 °C' },
    { eq: '2N2O5(g) -> 4NO2(g) + O2(g)', law: [['N2O5', 1]] },
    { eq: '2NO(g) + 2H2(g) -> N2(g) + 2H2O(g)', law: [['NO', 2], ['H2', 1]] },
    { eq: '2NO2(g) -> 2NO(g) + O2(g)', law: [['NO2', 2]] },
    { eq: 'CHCl3(g) + Cl2(g) -> CCl4(g) + HCl(g)', law: [['CHCl3', 1], ['Cl2', 0.5]] },
    { eq: 'BrO3^-(aq) + 5Br^-(aq) + 6H^+(aq) -> 3Br2(aq) + 3H2O(l)', law: [['BrO3^-', 1], ['Br^-', 1], ['H^+', 2]] },
    { eq: '(CH3)3CBr(aq) + OH^-(aq) -> (CH3)3COH(aq) + Br^-(aq)', law: [['(CH3)3CBr', 1]], zero: 'OH^-' },
    { eq: 'CH3CHO(g) -> CH4(g) + CO(g)', law: [['CH3CHO', 1.5]] }
  ];
  function lawTex(L, kname) { return 'rate $= ' + (kname || 'k') + L.law.map(function (x) { return x[1] === 1 ? cc(x[0]) : cc(x[0]) + '^{' + (x[1] === 0.5 ? '1/2' : x[1] === 1.5 ? '3/2' : x[1]) + '}'; }).join('') + '$'; }
  function kUnitPlain(n) { return { 0: 'M/s', 1: 's⁻¹', 2: 'M⁻¹·s⁻¹', 3: 'M⁻²·s⁻¹' }[n]; }
  function kUnitTex(n) { if (n === 0) return '\\text{M/s}'; if (n === 1) return '\\text{s}^{-1}'; return '\\text{M}^{' + (1 - n) + '}\\,\\text{s}^{-1}'; }
  function ordT(o) { return o === 0.5 ? '\\tfrac{1}{2}' : o === 1.5 ? '\\tfrac{3}{2}' : String(o); }

  G('gchem2.rate-laws', function (R, ctx) {
    var kind = lv(ctx, R.pick(['overall', 'factor']), R.pick(['factor', 'rate', 'units', 'coef']), R.pick(['factor', 'rate', 'units', 'coef']));
    var L = R.pick(kind === 'rate' || kind === 'units' ? LAWS.filter(function (x) { return x.law.every(function (y) { return Number.isInteger(y[1]); }); }) : LAWS), E = parseEq(L.eq);
    var tot = U.sum(L.law.map(function (x) { return x[1]; })), intro = 'The reaction $' + EQ(L.eq) + '$ has the measured rate law ' + lawTex(L) + (L.note ? ' (' + L.note + ')' : '') + '.';
    if (kind === 'overall') {
      return P(intro + ' What is the overall order of the reaction?', exact(ML.Q.from(tot).toPlain()), [
        'The overall order is the sum of the exponents in the rate law: $' + L.law.map(function (x) { return ordT(x[1]); }).join(' + ') + ' = ' + ordT(tot) + '$.',
        'The coefficients of the balanced equation play no part: the orders were measured.' + (L.zero ? ' $' + F(L.zero) + '$ does not appear at all, so the reaction is zero order in it.' : '')
      ], 'Add the exponents in the rate law.', null, { k: 'overall', law: L.law, ans: tot });
    }
    if (kind === 'factor') {
      var sps = L.law.slice(), ch = [];
      sps.forEach(function (x) { var f = x[1] === 0.5 || x[1] === 1.5 ? R.pick([4, 1]) : R.pick([2, 3, 1, 0.5]); ch.push([x[0], x[1], f]); });
      if (ch.every(function (c) { return c[2] === 1; })) ch[0][2] = ch[0][1] === 0.5 || ch[0][1] === 1.5 ? 4 : 2;
      if (L.zero && R.coin()) ch.push([L.zero, 0, R.pick([2, 3])]);
      var fac = ML.Q(1); ch.forEach(function (c) { var f = ML.Q.from(c[2]); if (c[1] === 0.5) fac = fac.mul(c[2] === 4 ? 2 : 1); else if (c[1] === 1.5) fac = fac.mul(c[2] === 4 ? 8 : 1); else fac = fac.mul(f.pow(c[1])); });
      var moved = ch.filter(function (c) { return c[2] !== 1; });
      function how(f) { return f === 0.5 ? 'halved' : f === 2 ? 'doubled' : f === 3 ? 'tripled' : f === 4 ? 'made 4 times as large' : ''; }
      return P(intro + ' If ' + U.list(moved.map(function (c) { return '$' + cc(c[0]) + '$ is ' + how(c[2]); })) + ', with everything else the same, by what factor does the rate change?', exact(fac.toPlain()), moved.map(function (c) {
        var e = c[1], f = c[2], tex = c[1] === 0.5 ? '4^{1/2} = 2' : c[1] === 1.5 ? '4^{3/2} = 8' : (f === 0.5 ? '\\left(\\tfrac{1}{2}\\right)' : f) + '^{' + e + '} = ' + ML.Q.from(f).pow(e).toTex();
        return 'The reaction is ' + (e === 0.5 ? 'one-half' : e === 1.5 ? 'three-halves' : ord(e)) + ' order in $' + F(c[0]) + '$, so this change multiplies the rate by $' + tex + '$.';
      }).concat(['Multiply the contributions: the rate changes by a factor of $' + fac.toTex() + '$.']), 'Raise each concentration factor to that species\u2019 order, then multiply.', null, { k: 'factor', law: L.law, ch: ch, ans: fac.toNumber() });
    }
    if (kind === 'rate') {
      var kexp = R.pick([-3, -2, -1, 0, 1]), kv = R.pick([1.2, 2.5, 3.0, 4.4, 6.0, 7.5]) * M.pow(10, kexp), conc = {};
      L.law.forEach(function (x) { conc[x[0]] = R.pick([0.010, 0.020, 0.050, 0.10, 0.15, 0.20, 0.25, 0.30]); });
      var rate = kv; L.law.forEach(function (x) { rate *= M.pow(conc[x[0]], x[1]); });
      return P(intro + ' At this temperature $k = ' + gv(kv) + '\\ ' + kUnitTex(tot) + '$. Find the rate when ' + U.list(L.law.map(function (x) { return '$' + cc(x[0]) + ' = ' + qv(conc[x[0]], 'M') + '$'; })) + '.',
        num(rate), [
          'Substitute into the rate law: $\\text{rate} = (' + gv(kv) + ')' + L.law.map(function (x) { return '(' + gv(conc[x[0]]) + ')' + (x[1] === 1 ? '' : '^{' + x[1] + '}'); }).join('') + '$.',
          'Rate $= ' + q(rate, 'M/s') + '$. The units work out: $' + kUnitTex(tot) + ' \\times \\text{M}^{' + tot + '} = \\text{M/s}$.'
        ], 'Raise each concentration to its order, then multiply by k.', 'M/s', { k: 'rate', law: L.law, kv: kv, conc: conc });
    }
    if (kind === 'units') {
      var right = '$' + kUnitTex(tot) + '$', all = [0, 1, 2, 3].filter(function (n) { return n !== tot; }).map(function (n) { return '$' + kUnitTex(n) + '$'; });
      return P(intro + ' What are the units of $k$ when concentrations are in M and time in s?', mc(right, all), [
        'The overall order is ' + tot + ', so the rate law has $\\text{M}^{' + tot + '}$ on its right side besides $k$.',
        'The rate is in M/s, so $k$ must be in $\\dfrac{\\text{M/s}}{\\text{M}^{' + tot + '}} = ' + kUnitTex(tot) + '$.'
      ], 'Rate (M/s) divided by concentration raised to the overall order.', null, { k: 'units', tot: tot, ans: right });
    }
    // coef: the trouble spot — orders from coefficients
    var Lc = R.pick(LAWS.filter(function (x) { var E2 = parseEq(x.eq); return E2.r.some(function (sp) { var o = x.law.filter(function (y) { return y[0] === sp.f; })[0]; return (o ? o[1] : 0) !== sp.n; }); }));
    var E3 = parseEq(Lc.eq), sp = R.pick(E3.r.filter(function (s2) { var o = Lc.law.filter(function (y) { return y[0] === s2.f; })[0]; return (o ? o[1] : 0) !== s2.n; }));
    var o2 = (Lc.law.filter(function (y) { return y[0] === sp.f; })[0] || [0, 0])[1];
    return P('The reaction $' + EQ(Lc.eq) + '$ has the measured rate law ' + lawTex(Lc) + (Lc.note ? ' (' + Lc.note + ')' : '') + '. What is the order of the reaction in $' + F(sp.f) + '$?',
      exact(ML.Q.from(o2).toPlain()), [
        'Read the order from the rate law, not from the equation: ' + (o2 === 0 ? '$' + cc(sp.f) + '$ does not appear in it, so the order is 0.' : 'the exponent on $' + cc(sp.f) + '$ is $' + ordT(o2) + '$.'),
        'Its coefficient in the balanced equation is ' + sp.n + ', which has nothing to do with the order. Orders are found by experiment.'
      ], 'Look at the exponent in the rate law, not the coefficient.', null, { k: 'coef', law: Lc.law, sp: sp.f, ans: o2 });
  });

  G('gchem2.initial-rates', function (R, ctx) {
    var L = ctx.level || 1, two = L >= 2, m, n;
    do { m = R.int(0, 2); n = two ? R.int(0, 2) : 0; } while (m + n < 1 || m + n > 3 || (L === 1 && m === 0));
    var a = R.pick([0.010, 0.020, 0.050, 0.10, 0.15, 0.20]), b = R.pick([0.010, 0.020, 0.030, 0.10, 0.20, 0.25]);
    var fa = R.pick([2, 3]), fb = R.pick([2, 3]), r1 = R.pick([1.2, 1.5, 2.0, 2.4, 3.0, 3.6, 4.0, 5.0, 6.0, 8.0]) * M.pow(10, R.int(-6, -3));
    var rows = [[a, b, r1], [fix(a * fa), b, fix(r1 * M.pow(fa, m))]];
    if (two) rows.push([a, fix(b * fb), fix(r1 * M.pow(fb, n))]);
    if (L >= 3) rows.push([fix(a * fa), fix(b * fb), fix(r1 * M.pow(fa, m) * M.pow(fb, n))]);
    var order = rows.map(function (_, i) { return i; }); if (L >= 3) order = R.shuffle(order);
    var tab = order.map(function (i) { return rows[i]; }), kv = r1 / (M.pow(a, m) * M.pow(b, n));
    var html = tbl(two ? ['Experiment', '$[\\mathrm{A}]_0$ (M)', '$[\\mathrm{B}]_0$ (M)', 'Initial rate (M/s)'] : ['Experiment', '$[\\mathrm{A}]_0$ (M)', 'Initial rate (M/s)'],
      tab.map(function (r, i) { return [String(i + 1), gv(r[0])].concat(two ? [gv(r[1])] : []).concat(['$' + gv(r[2]) + '$']); }));
    function idx(row) { return tab.indexOf(row) + 1; }
    var eA = 'Compare experiments ' + idx(rows[0]) + ' and ' + idx(rows[1]) + (two ? ', where only $[\\mathrm{A}]$ changes' : '') + ': $[\\mathrm{A}]$ is multiplied by ' + fa + ' and the rate by $' + T.num(fix(M.pow(fa, m))) + '$. Since $' + fa + '^m = ' + T.num(M.pow(fa, m)) + '$, $m = ' + m + '$.';
    var eB = two ? 'Compare experiments ' + idx(rows[0]) + ' and ' + idx(rows[2]) + ', where only $[\\mathrm{B}]$ changes: $[\\mathrm{B}]$ is multiplied by ' + fb + ' and the rate by $' + T.num(fix(M.pow(fb, n))) + '$. Since $' + fb + '^n = ' + T.num(M.pow(fb, n)) + '$, $n = ' + n + '$.' : '';
    var tot = m + n, lawT = 'k' + (m ? '[\\mathrm{A}]' + (m > 1 ? '^{' + m + '}' : '') : '') + (n ? '[\\mathrm{B}]' + (n > 1 ? '^{' + n + '}' : '') : '');
    var qtext = (two ? 'Initial rates were measured for $\\mathrm{A} + \\mathrm{B} \\to \\text{products}$ at one temperature:' : 'Initial rates were measured for a reaction of A at one temperature:') + html;
    if (L === 1) return P(qtext + 'What is the order of the reaction in A?', int(m), [eA, 'So the rate law is rate $= ' + lawT + '$.'], 'Find the factor by which the rate changed when [A] changed, and solve factor = (change in [A])^m.', null, { k: 'init', rows: rows, m: m, n: n, kv: kv, ask: 'm' });
    if (L === 2) return P(qtext + 'Find the order in A and the order in B.', { t: 'multi', parts: [{ label: 'order in A:', a: int(m) }, { label: 'order in B:', a: int(n) }] }, [eA, eB, 'Rate law: rate $= ' + lawT + '$ (overall order ' + tot + ').'], 'Use two experiments in which only one concentration changes.', null, { k: 'init', rows: rows, m: m, n: n, kv: kv, ask: 'mn' });
    var r0 = rows[0];
    return P(qtext + 'Find the rate constant $k$. Give the number only; its units follow from the overall order. (Be careful which experiments you compare.)', num(kv), [eA, eB, 'Rate law: rate $= ' + lawT + '$, overall order ' + tot + '.',
      'Solve for $k$ with experiment ' + idx(r0) + ': $k = \\dfrac{' + gv(r0[2]) + '}{' + [m ? '(' + gv(r0[0]) + ')' + (m > 1 ? '^{' + m + '}' : '') : '', n ? '(' + gv(r0[1]) + ')' + (n > 1 ? '^{' + n + '}' : '') : ''].join('') + '} = ' + fx(kv) + '\\ ' + kUnitTex(tot) + '$.',
      'Units: M/s divided by $\\text{M}^{' + tot + '}$ gives $' + kUnitTex(tot) + '$. Any experiment gives the same $k$.'],
      'Find both orders first, from experiments where only one concentration changes; then put one experiment into the rate law.', null, { k: 'init', rows: rows, m: m, n: n, kv: kv, ask: 'k' });
  });

  var FIRST = [
    { name: '$\\mathrm{SO_2Cl_2}$ decomposes into $\\mathrm{SO_2}$ and $\\mathrm{Cl_2}$', sp: 'SO2Cl2' },
    { name: 'Cyclopropane turns into propene', sp: 'C3H6', tag: 'cyclopropane' },
    { name: 'Methyl isocyanide, $\\mathrm{CH_3NC}$, rearranges to $\\mathrm{CH_3CN}$', sp: 'CH3NC' },
    { name: 'Hydrogen peroxide decomposes in a dilute solution', sp: 'H2O2' },
    { name: 'Chloroethane, $\\mathrm{C_2H_5Cl}$, breaks down into ethene and $\\mathrm{HCl}$', sp: 'C2H5Cl' },
    { name: 'Sucrose is hydrolyzed in dilute acid', sp: 'sucrose' }
  ];
  function spT(o) { return o.sp === 'sucrose' ? '\\text{sucrose}' : o.tag === 'cyclopropane' ? '\\text{cyclopropane}' : F(o.sp); }

  G('gchem2.first-order', function (R, ctx) {
    var o = R.pick(FIRST), kind = lv(ctx, R.pick(['half', 'kfromhalf', 'quarter']), R.pick(['conc', 'frac', 'half']), R.pick(['time', 'pct', 'conc']));
    var tu = R.pick(['s', 'min']), k = R.pick([1.2, 2.0, 2.5, 3.5, 4.6, 5.0, 6.9, 8.0]) * (tu === 's' ? M.pow(10, R.int(-4, -2)) : M.pow(10, R.int(-3, -1)));
    var kU = tu === 's' ? 's⁻¹' : 'min⁻¹', kT = qv(k, kU), th = M.LN2 / k, X = spT(o), intro = o.name + ' by a first-order process. ';
    if (kind === 'half') return P(intro + 'The rate constant for the loss of $' + X + '$ is $k = ' + kT + '$. What is the half-life?', num(th), [
      'For first order, $t_{1/2} = \\dfrac{\\ln 2}{k} = \\dfrac{0.693}{k}$, and it does not depend on the concentration.',
      '$t_{1/2} = \\dfrac{0.693}{' + gv(k) + '\\ ' + ut(kU) + '} = ' + q(th, tu) + '$.'
    ], 't½ = 0.693/k for a first-order reaction.', tu, { k: 'fo', kv: k, ask: 'half' });
    if (kind === 'kfromhalf') { var th2 = R.pick([12, 15, 20, 25, 30, 40, 45, 60, 90, 120]), k2 = M.LN2 / th2;
      return P(intro + 'Its half-life is $' + th2 + '\\ \\text{' + tu + '}$. What is the rate constant $k$?', num(k2), ['Rearrange $t_{1/2} = \\dfrac{0.693}{k}$: $k = \\dfrac{0.693}{t_{1/2}}$.', '$k = \\dfrac{0.693}{' + th2 + '\\ \\text{' + tu + '}} = ' + q(k2, kU) + '$.'], 'k = 0.693/t½.', kU, { k: 'fo', kv: k2, ask: 'kfromhalf', th: th2 });
    }
    if (kind === 'quarter') { var th3 = R.pick([10, 12, 15, 20, 25, 30, 40]), fr = R.pick([[75, 2], [87.5, 3], [50, 1], [93.75, 4]]);
      return P(intro + 'The first half-life is $' + th3 + '\\ \\text{' + tu + '}$. How long after the start has $' + T.num(fr[0]) + '\\%$ of the $' + X + '$ reacted?', exact(th3 * fr[1]), [
        T.num(fr[0]) + '% reacted means $' + T.num(100 - fr[0]) + '\\%$ is left: that is $\\left(\\tfrac{1}{2}\\right)^{' + fr[1] + '}$ of the start, ' + fr[1] + ' half-lives.',
        'A first-order half-life never changes as the reactant runs down, so each half-life is $' + th3 + '\\ \\text{' + tu + '}$.',
        'Time $= ' + fr[1] + ' \\times ' + th3 + ' = ' + (th3 * fr[1]) + '\\ \\text{' + tu + '}$.'
      ], 'Count half-lives; for first order each one is the same length.', tu, { k: 'fo', kv: M.LN2 / th3, ask: 'pcttime', pct: fr[0], ans: th3 * fr[1] });
    }
    var A0 = R.pick([0.100, 0.250, 0.500, 0.800, 1.00, 1.20, 0.0500]);
    if (kind === 'conc' || kind === 'frac') {
      var t = sgf(R.pick([0.4, 0.7, 1.3, 1.6, 2.2, 2.7, 3.1]) / k, 2), At = A0 * M.exp(-k * t), fr2 = M.exp(-k * t);
      if (kind === 'frac') return P(intro + 'With $k = ' + kT + '$, what percent of the $' + X + '$ is left after $' + gv(t) + '\\ \\text{' + tu + '}$? (Use a calculator.)', { t: 'num', v: sfStr(fr2 * 100, 3), rtol: 0.02, pct: true }, [
        'Fraction left: $\\dfrac{[\\mathrm{A}]_t}{[\\mathrm{A}]_0} = e^{-kt}$.',
        '$kt = (' + gv(k) + ')(' + gv(t) + ') = ' + fx(k * t, 3) + '$, so $e^{-' + fx(k * t, 3) + '} = ' + fx(fr2, 3) + '$.',
        'That is $' + fx(fr2 * 100, 3) + '\\%$ left. It does not depend on how much you started with.'
      ], 'The fraction left is e^(−kt).', '%', { k: 'fo', kv: k, ask: 'frac', t: t });
      return P(intro + 'With $k = ' + kT + '$ and $[\\mathrm{A}]_0 = ' + qv(A0, 'M', 3) + '$ (A stands for $' + X + '$), what is the concentration after $' + gv(t) + '\\ \\text{' + tu + '}$? (Use a calculator.)', num(At), [
        'Integrated first-order law: $\\ln[\\mathrm{A}]_t = \\ln[\\mathrm{A}]_0 - kt$, or $[\\mathrm{A}]_t = [\\mathrm{A}]_0 e^{-kt}$.',
        '$kt = (' + gv(k) + '\\ ' + ut(kU) + ')(' + gv(t) + '\\ \\text{' + tu + '}) = ' + fx(k * t, 3) + '$ (no units).',
        '$[\\mathrm{A}]_t = ' + gv(A0, 3) + ' \\times e^{-' + fx(k * t, 3) + '} = ' + q(At, 'M') + '$.'
      ], 'Use [A] = [A]₀e^(−kt); check that kt has no units.', 'M', { k: 'fo', kv: k, ask: 'conc', A0: A0, t: t });
    }
    if (kind === 'pct') { var pc = R.pick([20, 30, 40, 60, 70, 80, 90]), tt = M.log(100 / (100 - pc)) / k;
      return P(intro + 'With $k = ' + kT + '$, how long does it take for $' + pc + '\\%$ of the $' + X + '$ to react? (Use a calculator.)', num(tt), [
        pc + '% reacted leaves ' + (100 - pc) + '%: $[\\mathrm{A}]_t/[\\mathrm{A}]_0 = ' + T.num((100 - pc) / 100) + '$.',
        'From $\\ln\\dfrac{[\\mathrm{A}]_0}{[\\mathrm{A}]_t} = kt$: $t = \\dfrac{\\ln(1/' + T.num((100 - pc) / 100) + ')}{k} = \\dfrac{' + fx(M.log(100 / (100 - pc)), 3) + '}{' + gv(k) + '\\ ' + ut(kU) + '} = ' + q(tt, tu) + '$.'
      ], 'Take ln of [A]₀/[A]ₜ and divide by k.', tu, { k: 'fo', kv: k, ask: 'pct', pct: pc });
    }
    var Af = sgf(A0 * R.pick([0.15, 0.22, 0.35, 0.45, 0.6, 0.72]), 2), t3 = M.log(A0 / Af) / k;
    return P(intro + 'The rate constant is $k = ' + kT + '$. Starting from $' + qv(A0, 'M', 3) + '$, how long does it take for the concentration to fall to $' + qv(Af, 'M', 2) + '$? (Use a calculator.)', num(t3), [
      'Rearrange $\\ln\\dfrac{[\\mathrm{A}]_0}{[\\mathrm{A}]_t} = kt$ for $t$: $t = \\dfrac{1}{k}\\ln\\dfrac{[\\mathrm{A}]_0}{[\\mathrm{A}]_t}$.',
      '$\\ln\\dfrac{' + gv(A0, 3) + '}{' + gv(Af, 2) + '} = ' + fx(M.log(A0 / Af), 3) + '$.',
      '$t = \\dfrac{' + fx(M.log(A0 / Af), 3) + '}{' + gv(k) + '\\ ' + ut(kU) + '} = ' + q(t3, tu) + '$.'
    ], 'Solve ln([A]₀/[A]) = kt for t.', tu, { k: 'fo', kv: k, ask: 'time', A0: A0, Af: Af });
  });

  G('gchem2.zero-second-order', function (R, ctx) {
    var kind = lv(ctx, R.pick(['nexthalf', 'half2', 'half0']), R.pick(['conc2', 'conc0', 'half2']), R.pick(['time2', 'conc2', 'time0', 'nexthalf']));
    if (kind === 'nexthalf') { var o = R.pick([0, 2]), h1 = R.pick([20, 30, 40, 50, 60, 80]), tu = R.pick(['s', 'min']), h2 = o === 2 ? 2 * h1 : h1 / 2;
      return P('A reaction is ' + ord(o) + ' order in its only reactant. Its first half-life is $' + h1 + '\\ \\text{' + tu + '}$. How long is the second half-life (the time to go from half of the starting amount to a quarter)?', exact(h2), [
        o === 2 ? 'For second order, $t_{1/2} = \\dfrac{1}{k[\\mathrm{A}]_0}$: the half-life is inversely proportional to the concentration at its start.' : 'For zero order, $t_{1/2} = \\dfrac{[\\mathrm{A}]_0}{2k}$: the half-life is proportional to the concentration at its start.',
        'The second half-life starts at half the concentration, so it is ' + (o === 2 ? 'twice' : 'half') + ' as long: $' + h2 + '\\ \\text{' + tu + '}$.',
        'Only a first-order half-life stays the same; that is why $0.693/k$ works only for first order.'
      ], 'Look at how each half-life formula depends on the starting concentration.', tu, { k: 'nexthalf', o: o, h1: h1, ans: h2 });
    }
    var A0 = R.pick([0.100, 0.200, 0.250, 0.400, 0.500, 0.800, 1.00]);
    if (kind === 'half2' || kind === 'time2' || kind === 'conc2') {
      var k2 = R.pick([0.020, 0.050, 0.080, 0.12, 0.25, 0.40, 0.54, 1.5, 3.0]), u2 = 'M⁻¹·s⁻¹', intro = 'The loss of A in $2\\mathrm{A} \\to \\text{products}$... ';
      intro = 'A reactant A disappears by a second-order process: $-\\dfrac{\\Delta[\\mathrm{A}]}{\\Delta t} = k[\\mathrm{A}]^2$ with $k = ' + gv(k2) + '\\ \\text{M}^{-1}\\,\\text{s}^{-1}$. ';
      if (kind === 'half2') { var h = 1 / (k2 * A0); return P(intro + 'What is the half-life when $[\\mathrm{A}]_0 = ' + qv(A0, 'M', 3) + '$?', num(h), [
        'For second order, $t_{1/2} = \\dfrac{1}{k[\\mathrm{A}]_0}$ (not $0.693/k$, which is only for first order).',
        '$t_{1/2} = \\dfrac{1}{(' + gv(k2) + ')(' + gv(A0, 3) + ')} = ' + q(h, 's') + '$.'
      ], 'Second-order half-life: 1/(k[A]₀).', 's', { k: 'so', o: 2, kv: k2, A0: A0, ask: 'half' }); }
      var tq = sgf(R.pick([0.5, 1, 1.5, 2, 3, 4]) / (k2 * A0), 2), At = 1 / (1 / A0 + k2 * tq);
      if (kind === 'conc2') return P(intro + 'If $[\\mathrm{A}]_0 = ' + qv(A0, 'M', 3) + '$, what is $[\\mathrm{A}]$ after $' + gv(tq) + '\\ \\text{s}$?', num(At), [
        'Integrated second-order law: $\\dfrac{1}{[\\mathrm{A}]_t} = \\dfrac{1}{[\\mathrm{A}]_0} + kt$.',
        '$\\dfrac{1}{[\\mathrm{A}]_t} = \\dfrac{1}{' + gv(A0, 3) + '} + (' + gv(k2) + ')(' + gv(tq) + ') = ' + fx(1 / A0, 3) + ' + ' + fx(k2 * tq, 3) + ' = ' + fx(1 / At, 3) + '\\ \\text{M}^{-1}$.',
        'Take the reciprocal: $[\\mathrm{A}]_t = ' + q(At, 'M') + '$.'
      ], 'Use 1/[A] = 1/[A]₀ + kt, then flip.', 'M', { k: 'so', o: 2, kv: k2, A0: A0, t: tq, ask: 'conc' });
      var Af = sgf(A0 * R.pick([0.2, 0.3, 0.4, 0.6, 0.75]), 2), tt = (1 / Af - 1 / A0) / k2;
      return P(intro + 'Starting at $' + qv(A0, 'M', 3) + '$, how long does it take for $[\\mathrm{A}]$ to fall to $' + qv(Af, 'M', 2) + '$?', num(tt), [
        'Rearrange $\\dfrac{1}{[\\mathrm{A}]_t} = \\dfrac{1}{[\\mathrm{A}]_0} + kt$: $t = \\dfrac{1}{k}\\left(\\dfrac{1}{[\\mathrm{A}]_t} - \\dfrac{1}{[\\mathrm{A}]_0}\\right)$.',
        '$\\dfrac{1}{' + gv(Af, 2) + '} - \\dfrac{1}{' + gv(A0, 3) + '} = ' + fx(1 / Af, 3) + ' - ' + fx(1 / A0, 3) + ' = ' + fx(1 / Af - 1 / A0, 3) + '\\ \\text{M}^{-1}$.',
        '$t = \\dfrac{' + fx(1 / Af - 1 / A0, 3) + '}{' + gv(k2) + '} = ' + q(tt, 's') + '$.'
      ], 'Subtract the reciprocals, then divide by k.', 's', { k: 'so', o: 2, kv: k2, A0: A0, Af: Af, ask: 'time' });
    }
    // zero order
    var ctxt = R.pick([
      { t: 'Ammonia decomposes on a hot tungsten surface, $2\\mathrm{NH_3} \\to \\mathrm{N_2} + 3\\mathrm{H_2}$, at a rate that does not depend on $[\\mathrm{NH_3}]$ because the surface is covered.', sp: 'NH3' },
      { t: 'Dinitrogen monoxide decomposes on a hot gold surface at a rate that does not depend on $[\\mathrm{N_2O}]$ because the surface is covered.', sp: 'N2O' },
      { t: 'A reactant A is used up on a catalyst surface by a zero-order process.', sp: 'A' }]);
    var k0 = R.pick([1.0, 1.5, 2.0, 2.5, 4.0, 5.0]) * 1e-3, sp = ctxt.sp === 'A' ? '\\mathrm{A}' : F(ctxt.sp), intro0 = ctxt.t + ' The concentration of $' + sp + '$ falls at $k = ' + qv(k0, 'M/s') + '$ (zero order). ';
    if (kind === 'half0') { var h0 = A0 / (2 * k0); return P(intro0 + 'What is the half-life when the starting concentration is $' + qv(A0, 'M', 3) + '$?', num(h0), [
      'For zero order, the concentration drops by the same amount each second: $[\\mathrm{A}]_t = [\\mathrm{A}]_0 - kt$.',
      'Half is gone when $kt = [\\mathrm{A}]_0/2$, so $t_{1/2} = \\dfrac{[\\mathrm{A}]_0}{2k} = \\dfrac{' + gv(A0, 3) + '}{2(' + gv(k0) + ')} = ' + q(h0, 's') + '$.'
    ], 'Zero-order half-life: [A]₀/(2k).', 's', { k: 'so', o: 0, kv: k0, A0: A0, ask: 'half' }); }
    var t0 = R.pick([20, 40, 50, 60, 80, 100]), Ab = A0 - k0 * t0;
    if (Ab <= 0.05 * A0) { t0 = sgf(0.6 * A0 / k0, 2); Ab = A0 - k0 * t0; }
    if (kind === 'conc0') return P(intro0 + 'Starting from $' + qv(A0, 'M', 3) + '$, what is the concentration after $' + gv(t0) + '\\ \\text{s}$?', num(Ab), [
      'Zero order: $[\\mathrm{A}]_t = [\\mathrm{A}]_0 - kt$, a straight line down.',
      '$[\\mathrm{A}]_t = ' + gv(A0, 3) + ' - (' + gv(k0) + ')(' + gv(t0) + ') = ' + gv(A0, 3) + ' - ' + fx(k0 * t0, 3) + ' = ' + q(Ab, 'M') + '$.'
    ], 'Subtract k × t from the starting concentration.', 'M', { k: 'so', o: 0, kv: k0, A0: A0, t: t0, ask: 'conc' });
    var Af0 = sgf(A0 * R.pick([0.25, 0.4, 0.6, 0.7]), 2), tt0 = (A0 - Af0) / k0;
    return P(intro0 + 'How long does it take to go from $' + qv(A0, 'M', 3) + '$ to $' + qv(Af0, 'M', 2) + '$?', num(tt0), [
      'Zero order: $[\\mathrm{A}]_0 - [\\mathrm{A}]_t = kt$.',
      '$t = \\dfrac{' + gv(A0, 3) + ' - ' + gv(Af0, 2) + '}{' + gv(k0) + '} = ' + q(tt0, 's') + '$.'
    ], 'The drop in concentration equals k × t.', 's', { k: 'so', o: 0, kv: k0, A0: A0, Af: Af0, ask: 'time' });
  });

  G('gchem2.graphical-order', function (R, ctx) {
    var L = ctx.level || 1;
    if (L === 1) {
      var o = R.int(0, 2), kv = R.chance(0.3) ? R.pick([0.0125, 0.0230, 0.0350, 0.0462, 0.115, 0.250, 0.0080]) : R.int(11, 99) * M.pow(10, R.int(-4, -2)), names = ['[\\mathrm{A}]', '\\ln[\\mathrm{A}]', '1/[\\mathrm{A}]'];
      var slope = o === 2 ? kv : -kv, su = ['\\text{M/s}', '\\text{s}^{-1}', '\\text{M}^{-1}\\,\\text{s}^{-1}'][o];
      if (R.coin()) return P('A plot of $' + names[o] + '$ against time is a straight line with slope $' + gv(slope) + '\\ ' + su + '$. What is the order of the reaction?', int(o), [
        'Each order has its own straight-line plot: $[\\mathrm{A}]$ vs $t$ for zero order, $\\ln[\\mathrm{A}]$ vs $t$ for first order, $1/[\\mathrm{A}]$ vs $t$ for second order.',
        'The straight plot here is $' + names[o] + '$, so the reaction is ' + ord(o) + ' order.'
      ], 'Which integrated rate law is a straight line in this quantity?', null, { k: 'gord', o: o, ans: o });
      return P('A plot of $' + names[o] + '$ against time (in seconds) is a straight line with slope $' + gv(slope) + '\\ ' + su + '$. What is the rate constant $k$?', num(kv), [
        'The straight plot tells the order: here ' + ord(o) + ' order.',
        o === 2 ? 'For second order, $1/[\\mathrm{A}] = kt + 1/[\\mathrm{A}]_0$: the slope is $+k$.' : 'For ' + ord(o) + ' order the line is $' + names[o] + ' = -kt + ' + names[o] + '_0$: the slope is $-k$.',
        'So $k = ' + gv(kv) + '\\ ' + su + '$.'
      ], o === 2 ? 'For the 1/[A] plot, k is the slope itself.' : 'For this plot, k is minus the slope.', ['M/s', 's⁻¹', 'M⁻¹·s⁻¹'][o], { k: 'gk', o: o, slope: slope, ans: kv });
    }
    var o2 = R.int(0, 2), A0 = R.pick([1.00, 0.800, 0.500, 0.250, 1.20]), dt = R.pick([10, 20, 25, 50, 100]);
    var endFrac = R.pick([0.2, 0.25, 0.3]), tEnd = 4 * dt, k2;
    if (o2 === 0) k2 = A0 * (1 - endFrac) / tEnd; else if (o2 === 1) k2 = M.log(1 / endFrac) / tEnd; else k2 = (1 / (endFrac * A0) - 1 / A0) / tEnd;
    k2 = sgf(k2, 2);
    var data = [0, 1, 2, 3, 4].map(function (i) { var t = i * dt, c = o2 === 0 ? A0 - k2 * t : o2 === 1 ? A0 * M.exp(-k2 * t) : 1 / (1 / A0 + k2 * t); return [t, sgf(c, 3)]; });
    var html = tbl(null, [['$t$ (s)'].concat(data.map(function (d) { return String(d[0]); })), ['$[\\mathrm{A}]$ (M)'].concat(data.map(function (d) { return fx(d[1], 3); }))]);
    var viz = { name: 'ch-kineticsplot', opts: { data: data, plot: 'all', quiet: true, edit: false } };
    var tr = [function (c) { return c; }, M.log, function (c) { return 1 / c; }], nm = ['[\\mathrm{A}]', '\\ln[\\mathrm{A}]', '1/[\\mathrm{A}]'];
    var s0 = (tr[o2](data[4][1]) - tr[o2](data[0][1])) / (data[4][0] - data[0][0]);
    var why = 'The three plots of these data are drawn below. Only the $' + nm[o2] + '$ plot is straight, so the reaction is ' + ord(o2) + ' order.';
    if (L === 2) return P('These data were collected for $\\mathrm{A} \\to \\text{products}$:' + html + 'What is the order of the reaction in A?', mc(cap(ord(o2)) + ' order', ['Zero order', 'First order', 'Second order'].filter(function (s) { return s !== cap(ord(o2)) + ' order'; })), [
      'Make three plots against $t$: $[\\mathrm{A}]$, $\\ln[\\mathrm{A}]$ and $1/[\\mathrm{A}]$. The one that comes out straight tells the order (zero, first, second).',
      'For example, compare the changes over equal times: ' + (o2 === 0 ? '$[\\mathrm{A}]$ drops by the same amount each interval.' : o2 === 1 ? '$[\\mathrm{A}]$ drops by the same <i>fraction</i> each interval, so $\\ln[\\mathrm{A}]$ drops by the same amount.' : '$1/[\\mathrm{A}]$ rises by the same amount each interval.'),
      why
    ], 'Which of [A], ln[A] or 1/[A] changes by equal steps in equal times?', null, { k: 'gdata', data: data, o: o2, ans: cap(ord(o2)) + ' order' }, viz);
    return P('These data were collected for $\\mathrm{A} \\to \\text{products}$:' + html + 'Find the order from the plots below, then find the rate constant $k$ from the slope of the straight one. (Use a calculator.)', num(k2, 3, 0.03), [
      why,
      'Slope from the first and last points: $\\dfrac{' + fx(tr[o2](data[4][1]), 3) + ' - ' + pf(tr[o2](data[0][1]), 3) + '}{' + data[4][0] + ' - 0} = ' + fx(s0, 3) + '$.',
      o2 === 2 ? 'For second order, $k$ is the slope: $k = ' + q(k2, 'M⁻¹·s⁻¹') + '$.' : 'For ' + ord(o2) + ' order, $k$ is minus the slope: $k = ' + q(k2, ['M/s', 's⁻¹'][o2]) + '$.'
    ], 'Pick the straight plot, find its slope, and remember the sign.', ['M/s', 's⁻¹', 'M⁻¹·s⁻¹'][o2], { k: 'gdata', data: data, o: o2, ans: k2 }, viz);
  });

  G('gchem2.arrhenius', function (R, ctx) {
    var kind = lv(ctx, R.pick(['slope', 'convert']), R.pick(['Ea', 'Ea', 'k2']), R.pick(['k2', 'factor', 'Ea']));
    if (kind === 'slope') { var s = R.int(30, 140) / 10 * 1000, Ea = s * C.R / 1000;
      return P('A plot of $\\ln k$ against $1/T$ for a reaction is a straight line with slope $-' + cm(s) + '\\ \\text{K}$. What is the activation energy in kJ/mol?', num(Ea), [
        'Take the log of $k = Ae^{-E_a/RT}$: $\\ln k = -\\dfrac{E_a}{R}\\cdot\\dfrac{1}{T} + \\ln A$. That is a line in $1/T$ with slope $-E_a/R$.',
        '$E_a = -R \\times \\text{slope} = (8.314\\ \\text{J/(mol·K)})(' + cm(s) + '\\ \\text{K}) = ' + fx(s * C.R, 4) + '\\ \\text{J/mol}$.',
        'In kJ/mol: $E_a = ' + q(Ea, 'kJ/mol') + '$.'
      ], 'The slope is −Ea/R.', 'kJ/mol', { k: 'arrslope', s: s, ans: Ea }); }
    if (kind === 'convert') { var Tc = 5 * R.int(3, 40), Tk = Tc + 273, Ea2 = 5 * R.int(8, 30), x = Ea2 * 1000 / (C.R * Tk);
      return P('A reaction has $E_a = ' + Ea2 + '\\ \\text{kJ/mol}$. At $' + Tc + '^\\circ\\text{C}$, what is the exponent $E_a/RT$ in $k = Ae^{-E_a/RT}$? (Use $R = 8.314\\ \\text{J/(mol·K)}$.)', num(x), [
        'Change the temperature to kelvins: $T = ' + Tc + ' + 273 = ' + Tk + '\\ \\text{K}$.',
        'Change $E_a$ to J/mol so its units match $R$: $' + Ea2 + '\\ \\text{kJ/mol} = ' + cm(Ea2 * 1000) + '\\ \\text{J/mol}$.',
        '$\\dfrac{E_a}{RT} = \\dfrac{' + cm(Ea2 * 1000) + '}{(8.314)(' + Tk + ')} = ' + fx(x, 3) + '$ (no units).'
      ], 'Kelvins for T, and J/mol for Ea, before you divide.', null, { k: 'arrexp', Ea: Ea2, T: Tk, ans: x }); }
    var Ea3 = R.pick([45, 52, 60, 68, 75, 84, 90, 105]), T1c = R.pick([20, 25, 30, 35]), T2c = T1c + R.pick([10, 15, 20, 25, 40]), T1 = T1c + 273, T2 = T2c + 273;
    var k1 = R.pick([1.2, 2.5, 3.8, 4.5, 6.2, 8.0]) * M.pow(10, R.int(-5, -2)), k2 = sgf(k1 * M.exp(-Ea3 * 1000 / C.R * (1 / T2 - 1 / T1)), 3);
    var inv = 1 / T2 - 1 / T1, kU = 's⁻¹';
    if (kind === 'Ea') { var EaC = -C.R * M.log(k2 / k1) / inv / 1000;
      return P('A first-order reaction has $k = ' + qv(k1, kU) + '$ at $' + T1c + '^\\circ\\text{C}$ and $k = ' + qv(k2, kU, 3) + '$ at $' + T2c + '^\\circ\\text{C}$. Find the activation energy in kJ/mol. (Use a calculator.)', num(EaC), [
        'Temperatures in kelvins: $T_1 = ' + T1 + '\\ \\text{K}$, $T_2 = ' + T2 + '\\ \\text{K}$.',
        'Two-point Arrhenius equation: $\\ln\\dfrac{k_2}{k_1} = -\\dfrac{E_a}{R}\\left(\\dfrac{1}{T_2} - \\dfrac{1}{T_1}\\right)$.',
        '$\\ln\\dfrac{' + gv(k2, 3) + '}{' + gv(k1) + '} = ' + fx(M.log(k2 / k1), 3) + '$ and $\\dfrac{1}{' + T2 + '} - \\dfrac{1}{' + T1 + '} = ' + fx(inv, 3) + '\\ \\text{K}^{-1}$.',
        '$E_a = -\\dfrac{R \\ln(k_2/k_1)}{1/T_2 - 1/T_1} = -\\dfrac{(8.314)(' + fx(M.log(k2 / k1), 3) + ')}{' + fx(inv, 3) + '} = ' + fx(EaC * 1000, 3) + '\\ \\text{J/mol} = ' + q(EaC, 'kJ/mol') + '$.'
      ], 'Use kelvins, and ln(k₂/k₁) = −(Ea/R)(1/T₂ − 1/T₁).', 'kJ/mol', { k: 'arr2', k1: k1, k2: k2, T1: T1, T2: T2, ans: EaC }); }
    var k2c = k1 * M.exp(-Ea3 * 1000 / C.R * inv), fac = k2c / k1;
    if (kind === 'factor') return P('A reaction has $E_a = ' + Ea3 + '\\ \\text{kJ/mol}$. By what factor does its rate constant grow when the temperature rises from $' + T1c + '^\\circ\\text{C}$ to $' + T2c + '^\\circ\\text{C}$? (Use a calculator.)', num(fac, 3, 0.03), [
      'Kelvins: $T_1 = ' + T1 + '\\ \\text{K}$, $T_2 = ' + T2 + '\\ \\text{K}$; $E_a = ' + cm(Ea3 * 1000) + '\\ \\text{J/mol}$.',
      '$\\ln\\dfrac{k_2}{k_1} = -\\dfrac{' + cm(Ea3 * 1000) + '}{8.314}\\left(\\dfrac{1}{' + T2 + '} - \\dfrac{1}{' + T1 + '}\\right) = ' + fx(M.log(fac), 3) + '$.',
      '$\\dfrac{k_2}{k_1} = e^{' + fx(M.log(fac), 3) + '} = ' + fx(fac, 3) + '$.'
    ], 'Find ln(k₂/k₁) from the Arrhenius equation, then undo the ln.', null, { k: 'arrk', k1: 1, Ea: Ea3, T1: T1, T2: T2, ans: fac });
    return P('A reaction has $E_a = ' + Ea3 + '\\ \\text{kJ/mol}$ and $k = ' + qv(k1, kU) + '$ at $' + T1c + '^\\circ\\text{C}$. What is $k$ at $' + T2c + '^\\circ\\text{C}$? (Use a calculator.)', num(k2c, 3, 0.03), [
      'Kelvins: $T_1 = ' + T1 + '\\ \\text{K}$, $T_2 = ' + T2 + '\\ \\text{K}$; $E_a = ' + cm(Ea3 * 1000) + '\\ \\text{J/mol}$ to match $R$.',
      '$\\ln\\dfrac{k_2}{k_1} = -\\dfrac{E_a}{R}\\left(\\dfrac{1}{T_2} - \\dfrac{1}{T_1}\\right) = -\\dfrac{' + cm(Ea3 * 1000) + '}{8.314}(' + fx(inv, 3) + ') = ' + fx(M.log(fac), 3) + '$.',
      '$k_2 = k_1 e^{' + fx(M.log(fac), 3) + '} = (' + gv(k1) + ')(' + fx(fac, 3) + ') = ' + q(k2c, kU) + '$.'
    ], 'Solve the two-point Arrhenius equation for k₂.', kU, { k: 'arrk', k1: k1, Ea: Ea3, T1: T1, T2: T2, ans: k2c });
  });

  var ELEM = [
    { eq: 'O3(g) -> O2(g) + O(g)', law: [['O3', 1]] }, { eq: 'N2O5(g) -> NO2(g) + NO3(g)', law: [['N2O5', 1]] }, { eq: 'CH3NC(g) -> CH3CN(g)', law: [['CH3NC', 1]] },
    { eq: 'Cl2(g) -> 2Cl(g)', law: [['Cl2', 1]] }, { eq: 'NO2(g) + NO2(g) -> NO3(g) + NO(g)', law: [['NO2', 2]] }, { eq: 'NO(g) + O3(g) -> NO2(g) + O2(g)', law: [['NO', 1], ['O3', 1]] },
    { eq: 'Cl(g) + O3(g) -> ClO(g) + O2(g)', law: [['Cl', 1], ['O3', 1]] }, { eq: 'H(g) + Br2(g) -> HBr(g) + Br(g)', law: [['H', 1], ['Br2', 1]] },
    { eq: '2NO(g) -> N2O2(g)', law: [['NO', 2]] }, { eq: 'NO(g) + Br2(g) -> NOBr2(g)', law: [['NO', 1], ['Br2', 1]] },
    { eq: 'H2(g) + 2I(g) -> 2HI(g)', law: [['H2', 1], ['I', 2]] }, { eq: 'O(g) + O2(g) + N2(g) -> O3(g) + N2(g)', law: [['O', 1], ['O2', 1], ['N2', 1]] },
    { eq: 'NO2(g) + F2(g) -> NO2F(g) + F(g)', law: [['NO2', 1], ['F2', 1]] }, { eq: '2NO2(g) -> 2NO(g) + O2(g)', law: [['NO2', 2]] }
  ];
  var MOLW = ['unimolecular', 'bimolecular', 'termolecular'];
  function lawStr(law) { return 'k' + law.map(function (x) { return cc(x[0]) + (x[1] > 1 ? '^{' + x[1] + '}' : ''); }).join(''); }

  G('gchem2.elementary-steps', function (R, ctx) {
    var kind = lv(ctx, R.pick(['mol', 'order']), R.pick(['law', 'order', 'mol', 'factor']), R.pick(['law', 'overall', 'factor']));
    var S = R.pick(ELEM), E = parseEq(S.eq), mol = U.sum(S.law.map(function (x) { return x[1]; })), intro = 'This is an elementary step: $' + EQ(S.eq) + '$.';
    if (kind === 'mol') return P(intro + ' What is its molecularity?', mc(cap(MOLW[mol - 1]), MOLW.filter(function (w, i) { return i !== mol - 1; }).map(cap)), [
      'Molecularity counts the particles that come together in the step: here ' + mol + ' (' + S.law.map(function (x) { return x[1] + ' $' + F(x[0]) + '$'; }).join(' and ') + ').',
      'So the step is ' + MOLW[mol - 1] + '.' + (mol === 3 ? ' Three-body collisions are rare, which is why termolecular steps are uncommon.' : '')
    ], 'Count the reactant particles in the step.', null, { k: 'emol', law: S.law, ans: cap(MOLW[mol - 1]) });
    if (kind === 'order') { var x = R.pick(S.law); return P(intro + ' What is the order of this step in $' + F(x[0]) + '$?', int(x[1]), [
      'For an elementary step, and only for one, the rate law comes from the reactants as written: rate $= ' + lawStr(S.law) + '$.',
      'The exponent on $' + cc(x[0]) + '$ is ' + x[1] + '.'
    ], 'In an elementary step, each reactant particle that must collide adds one to the order.', null, { k: 'eord', law: S.law, sp: x[0], ans: x[1] }); }
    if (kind === 'overall') return P(intro + ' What is the overall order of its rate law?', int(mol), ['Rate law of an elementary step: rate $= ' + lawStr(S.law) + '$.', 'Overall order $=$ the sum of the exponents $= ' + mol + '$, the same as the molecularity.'], 'For an elementary step, order = molecularity.', null, { k: 'emol', law: S.law, ans: mol });
    if (kind === 'factor') { var y = R.pick(S.law), f = R.pick([2, 3]); return P(intro + ' If $' + cc(y[0]) + '$ is ' + (f === 2 ? 'doubled' : 'tripled') + ' and nothing else changes, by what factor does the rate of this step change?', exact(M.pow(f, y[1])), [
      'Rate law of the step: rate $= ' + lawStr(S.law) + '$, so the rate is ' + ord(y[1]) + ' order in $' + F(y[0]) + '$.',
      'The rate changes by $' + f + '^{' + y[1] + '} = ' + M.pow(f, y[1]) + '$.'
    ], 'Write the rate law from the step, then raise the factor to the order.', null, { k: 'efac', law: S.law, sp: y[0], f: f, ans: M.pow(f, y[1]) }); }
    var right = '$\\text{rate} = ' + lawStr(S.law) + '$', wr = [];
    var prods = E.p.map(function (sp) { return [sp.f, sp.n]; });
    wr.push('$\\text{rate} = k' + prods.map(function (x) { return cc(x[0]) + (x[1] > 1 ? '^{' + x[1] + '}' : ''); }).join('') + '$');
    if (S.law.some(function (x) { return x[1] > 1; })) wr.push('$\\text{rate} = k' + S.law.map(function (x) { return cc(x[0]); }).join('') + '$');
    else wr.push('$\\text{rate} = k' + S.law.map(function (x, i) { return cc(x[0]) + (i === 0 ? '^{2}' : ''); }).join('') + '$');
    wr.push('$\\text{rate} = k' + S.law.map(function (x) { return cc(x[0]) + '^{' + (x[1] + 1) + '}'; }).join('') + '$');
    wr.push('It cannot be known without an experiment');
    return P(intro + ' Which is its rate law?', mc(right, wr), [
      'Because the step is elementary, it happens exactly as written: ' + S.law.map(function (x) { return x[1] + ' $' + F(x[0]) + '$'; }).join(' and ') + ' must collide.',
      'So the rate is proportional to each reactant\u2019s concentration raised to its coefficient: ' + right + '.',
      'This shortcut works only for elementary steps. For an overall reaction the rate law must be measured.'
    ], 'An elementary step happens exactly as written.', null, { k: 'elaw', law: S.law, ans: right });
  });

  var MECH = [
    { steps: ['NO2(g) + NO2(g) -> NO3(g) + NO(g)', 'NO3(g) + CO(g) -> NO2(g) + CO2(g)'], all: 'NO2(g) + CO(g) -> NO(g) + CO2(g)', inter: ['NO3'], cat: [] },
    { steps: ['Cl(g) + O3(g) -> ClO(g) + O2(g)', 'ClO(g) + O(g) -> Cl(g) + O2(g)'], all: 'O3(g) + O(g) -> 2O2(g)', inter: ['ClO'], cat: ['Cl'] },
    { steps: ['H2O2(aq) + I^-(aq) -> H2O(l) + IO^-(aq)', 'H2O2(aq) + IO^-(aq) -> H2O(l) + O2(g) + I^-(aq)'], all: '2H2O2(aq) -> 2H2O(l) + O2(g)', inter: ['IO^-'], cat: ['I^-'] },
    { steps: ['2NO(g) -> N2O2(g)', 'N2O2(g) + O2(g) -> 2NO2(g)'], all: '2NO(g) + O2(g) -> 2NO2(g)', inter: ['N2O2'], cat: [] },
    { steps: ['NO(g) + Br2(g) -> NOBr2(g)', 'NOBr2(g) + NO(g) -> 2NOBr(g)'], all: '2NO(g) + Br2(g) -> 2NOBr(g)', inter: ['NOBr2'], cat: [] },
    { steps: ['H2(g) + ICl(g) -> HI(g) + HCl(g)', 'HI(g) + ICl(g) -> I2(g) + HCl(g)'], all: 'H2(g) + 2ICl(g) -> I2(g) + 2HCl(g)', inter: ['HI'], cat: [] },
    { steps: ['NO2(g) + F2(g) -> NO2F(g) + F(g)', 'NO2(g) + F(g) -> NO2F(g)'], all: '2NO2(g) + F2(g) -> 2NO2F(g)', inter: ['F'], cat: [] },
    { steps: ['O3(g) -> O2(g) + O(g)', 'O(g) + O3(g) -> 2O2(g)'], all: '2O3(g) -> 3O2(g)', inter: ['O'], cat: [] },
    { steps: ['NO(g) + O3(g) -> NO2(g) + O2(g)', 'NO2(g) + O(g) -> NO(g) + O2(g)'], all: 'O3(g) + O(g) -> 2O2(g)', inter: ['NO2'], cat: ['NO'] },
    { steps: ['2NO(g) -> N2O2(g)', 'N2O2(g) + H2(g) -> N2O(g) + H2O(g)', 'N2O(g) + H2(g) -> N2(g) + H2O(g)'], all: '2NO(g) + 2H2(g) -> N2(g) + 2H2O(g)', inter: ['N2O2', 'N2O'], cat: [] },
    { steps: ['Ce^4+(aq) + Mn^2+(aq) -> Ce^3+(aq) + Mn^3+(aq)', 'Ce^4+(aq) + Mn^3+(aq) -> Ce^3+(aq) + Mn^4+(aq)', 'Mn^4+(aq) + Tl^+(aq) -> Tl^3+(aq) + Mn^2+(aq)'], all: '2Ce^4+(aq) + Tl^+(aq) -> 2Ce^3+(aq) + Tl^3+(aq)', inter: ['Mn^3+', 'Mn^4+'], cat: ['Mn^2+'] }
  ];
  function mechHtml(Mc, marks) { return '<ol class="mlp-steps">' + Mc.steps.map(function (s, i) { return '<li>$' + EQ(s) + '$' + (marks && marks[i] ? ' (' + marks[i] + ')' : '') + '</li>'; }).join('') + '</ol>'; }

  G('gchem2.mechanisms', function (R, ctx) {
    var kind = lv(ctx, R.pick(['inter', 'overall']), R.pick(['inter', 'cat', 'overall', 'count']), R.pick(['cat', 'overall', 'role']));
    var pool = kind === 'cat' || kind === 'role' ? MECH.filter(function (m) { return m.cat.length; }) : MECH, Mc = R.pick(pool);
    var intro = 'A proposed mechanism:' + mechHtml(Mc);
    var sumStep = 'Add the steps and cancel anything that appears on both sides: the overall reaction is $' + EQ(Mc.all) + '$.';
    var interS = Mc.inter.map(function (f) { return '$' + F(f) + '$'; }), catS = Mc.cat.map(function (f) { return '$' + F(f) + '$'; });
    if (kind === 'inter') return P(intro + (Mc.inter.length > 1 ? 'Type the formula of one intermediate.' : 'Type the formula of the intermediate.'), fml(Mc.inter), [
      'An intermediate is made in one step and used up in a later step, so it cancels out of the overall equation.',
      U.list(interS) + (Mc.inter.length > 1 ? ' are' : ' is') + ' made and then used.' + (Mc.cat.length ? ' (' + U.list(catS) + ' is used first and made again later: that is a catalyst, not an intermediate.)' : ''),
      sumStep
    ], 'Look for a species that first appears as a product.', null, { k: 'mech', steps: Mc.steps, all: Mc.all, m: MECH.indexOf(Mc), ask: 'inter' });
    if (kind === 'cat') return P(intro + 'Type the formula of the catalyst.', fml(Mc.cat), [
      'A catalyst is used up in an early step and made again in a later one, so it is present at the start and at the end.',
      catS[0] + ' is used in step 1 and made again later. ' + U.list(interS) + (Mc.inter.length > 1 ? ' are intermediates' : ' is an intermediate') + ': made first, then used.',
      sumStep
    ], 'Look for a species that first appears as a reactant and comes back as a product.', null, { k: 'mech', steps: Mc.steps, all: Mc.all, m: MECH.indexOf(Mc), ask: 'cat' });
    if (kind === 'count') return P(intro + 'How many intermediates does this mechanism have?', int(Mc.inter.length), [
      'Intermediates are made in one step and used in a later step.',
      'Here: ' + U.list(interS) + '. That is ' + Mc.inter.length + '.' + (Mc.cat.length ? ' ' + catS[0] + ' is a catalyst, not an intermediate.' : ''),
      sumStep
    ], 'Cross out what appears on both sides when you add the steps; which of those were made first?', null, { k: 'mech', steps: Mc.steps, all: Mc.all, m: MECH.indexOf(Mc), ask: 'count' });
    if (kind === 'role') { var f = R.coin() ? Mc.cat[0] : Mc.inter[0], isC = Mc.cat.indexOf(f) >= 0;
      return P(intro + 'What role does $' + F(f) + '$ play?', mc(isC ? 'A catalyst' : 'An intermediate', [isC ? 'An intermediate' : 'A catalyst', 'A reactant in the overall equation', 'A product in the overall equation']), [
        isC ? '$' + F(f) + '$ is used in the first step it appears in and made again later: a catalyst.' : '$' + F(f) + '$ is made in one step and used in a later one: an intermediate.',
        'Neither appears in the overall equation. ' + sumStep
      ], 'Which comes first for this species: being used, or being made?', null, { k: 'mech', steps: Mc.steps, all: Mc.all, m: MECH.indexOf(Mc), ask: 'role', f: f, ans: isC ? 'A catalyst' : 'An intermediate' }); }
    // overall
    var right = '$' + EQ(Mc.all) + '$', wr = [];
    var allSp = {}; Mc.steps.forEach(function (s) { var E = parseEq(s); E.r.forEach(function (sp) { allSp[sp.f + '|' + sp.ph] = (allSp[sp.f + '|' + sp.ph] || 0) - sp.n; }); E.p.forEach(function (sp) { allSp[sp.f + '|' + sp.ph] = (allSp[sp.f + '|' + sp.ph] || 0) + sp.n; }); });
    // a distractor that keeps the intermediates: the plain sum of all steps, nothing cancelled
    var rr = [], pp = []; Mc.steps.forEach(function (s) { var E = parseEq(s); rr = rr.concat(E.r); pp = pp.concat(E.p); });
    function merge(a) { var o = {}, order = []; a.forEach(function (sp) { var k = sp.f + '|' + sp.ph; if (!(k in o)) { o[k] = { f: sp.f, n: 0, ph: sp.ph }; order.push(k); } o[k].n += sp.n; }); return order.map(function (k) { return o[k]; }); }
    wr.push('$' + EQ(eqStr(merge(rr), merge(pp), ' -> ')) + '$');
    var E1 = parseEq(Mc.steps[0]); wr.push('$' + EQ(eqStr(E1.r, E1.p, ' -> ')) + '$');
    var Eall = parseEq(Mc.all); wr.push('$' + EQ(eqStr(Eall.r.concat(Mc.inter.slice(0, 1).map(function (f) { return { f: f, n: 1, ph: Eall.r[0].ph }; })), Eall.p, ' -> ')) + '$');
    return P(intro + 'What is the overall reaction?', mc(right, wr), [
      'Add all the steps, reactants with reactants and products with products.',
      'Cancel species that appear on both sides: ' + U.list(interS.concat(catS)) + '.',
      sumStep
    ], 'Add the steps and cancel what appears on both sides.', null, { k: 'mech', steps: Mc.steps, all: Mc.all, m: MECH.indexOf(Mc), ask: 'overall', ans: right });
  });

  // mechanisms with a slow first step (its rate law is the overall rate law)
  var SLOW1 = [
    { steps: ['NO2(g) + NO2(g) -> NO3(g) + NO(g)', 'NO3(g) + CO(g) -> NO2(g) + CO2(g)'], all: 'NO2(g) + CO(g) -> NO(g) + CO2(g)', law: [['NO2', 2]], absent: 'CO' },
    { steps: ['H2(g) + ICl(g) -> HI(g) + HCl(g)', 'HI(g) + ICl(g) -> I2(g) + HCl(g)'], all: 'H2(g) + 2ICl(g) -> I2(g) + 2HCl(g)', law: [['H2', 1], ['ICl', 1]] },
    { steps: ['NO2(g) + F2(g) -> NO2F(g) + F(g)', 'NO2(g) + F(g) -> NO2F(g)'], all: '2NO2(g) + F2(g) -> 2NO2F(g)', law: [['NO2', 1], ['F2', 1]] },
    { steps: ['(CH3)3CBr(aq) -> (CH3)3C^+(aq) + Br^-(aq)', '(CH3)3C^+(aq) + OH^-(aq) -> (CH3)3COH(aq)'], all: '(CH3)3CBr(aq) + OH^-(aq) -> (CH3)3COH(aq) + Br^-(aq)', law: [['(CH3)3CBr', 1]], absent: 'OH^-' },
    { steps: ['NO2Cl(g) -> NO2(g) + Cl(g)', 'NO2Cl(g) + Cl(g) -> NO2(g) + Cl2(g)'], all: '2NO2Cl(g) -> 2NO2(g) + Cl2(g)', law: [['NO2Cl', 1]] }
  ];
  function genericSlow(R) { // A + B -> I (slow); I + C -> D (fast), with random coefficients
    var a = R.int(1, 2), b = R.int(0, 1), useC = R.coin();
    var s1 = (a > 1 ? a : '') + 'A' + (b ? ' + B' : '') + ' -> I', s2 = 'I' + (useC ? ' + C' : ' + A') + ' -> D';
    var law = [['A', a]]; if (b) law.push(['B', 1]);
    var all = useC ? ((a > 1 ? a : '') + 'A' + (b ? ' + B' : '') + ' + C -> D') : ((a + 1) + 'A' + (b ? ' + B' : '') + ' -> D');
    return { steps: [s1, s2], all: all, law: law, absent: useC ? 'C' : null, generic: true };
  }

  G('gchem2.rate-determining-step', function (R, ctx) {
    var Mc = R.coin() ? R.pick(SLOW1) : genericSlow(R), kind = lv(ctx, R.pick(['order', 'law']), R.pick(['law', 'orders', 'absent']), R.pick(['orders', 'absent', 'which']));
    if (kind === 'absent' && !Mc.absent) kind = 'orders';
    var intro = 'A reaction, $' + EQ(Mc.all) + '$, is thought to follow this mechanism:' + mechHtml(Mc, ['slow', 'fast']);
    var first = 'The slow first step limits the rate; whatever happens after it cannot go faster than it supplies material. So the rate law is the rate law of step 1, written from its reactants (it is elementary): rate $= ' + lawStr(Mc.law) + '$.';
    var R0 = parseEq(Mc.all).r;
    if (kind === 'order') { var x = R.pick(R0); var o = (Mc.law.filter(function (y) { return y[0] === x.f; })[0] || [0, 0])[1];
      return P(intro + 'What order in $' + F(x.f) + '$ does this mechanism predict?', int(o), [first, o ? 'The exponent on $' + cc(x.f) + '$ is ' + o + '.' : '$' + F(x.f) + '$ reacts only in the fast step after the slow one, so it does not appear: zero order.'], 'Only the slow step and what comes before it set the rate law.', null, { k: 'rds', mech: Mc, sp: x.f, ans: o }); }
    if (kind === 'orders') return P(intro + 'Give the order in each reactant that this mechanism predicts.', { t: 'multi', parts: R0.map(function (x) { var o = (Mc.law.filter(function (y) { return y[0] === x.f; })[0] || [0, 0])[1]; return { label: 'order in $' + F(x.f) + '$:', a: int(o) }; }) },
      [first, R0.map(function (x) { var o = (Mc.law.filter(function (y) { return y[0] === x.f; })[0] || [0, 0])[1]; return '$' + F(x.f) + '$: ' + o; }).join('; ') + '.'], 'Write the rate law of the slow step.', null, { k: 'rds', mech: Mc });
    if (kind === 'absent') return P(intro + 'Which reactant of the overall reaction does not appear in the predicted rate law? Type its formula.', fml(Mc.absent), [first, '$' + F(Mc.absent) + '$ reacts only after the slow step, so changing its concentration does not change the rate: zero order.'], 'Which reactant first shows up after the slow step?', null, { k: 'rds', mech: Mc, ans: Mc.absent });
    if (kind === 'which') {
      var right = '$\\text{rate} = ' + lawStr(Mc.law) + '$', E2 = parseEq(Mc.steps[1]), wr = [];
      wr.push('$\\text{rate} = k' + E2.r.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + '$');
      wr.push('$\\text{rate} = k' + R0.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + '$');
      wr.push('$\\text{rate} = k' + Mc.law.map(function (y) { return cc(y[0]) + '^{' + (y[1] + 1) + '}'; }).join('') + '$');
      return P(intro + 'Which rate law does this mechanism predict?', mc(right, wr), [first, 'The rate law of the fast step, and the coefficients of the overall equation, do not set the rate.'], 'The slow step is the bottleneck.', null, { k: 'rds', mech: Mc, ans: right });
    }
    var right2 = '$\\text{rate} = ' + lawStr(Mc.law) + '$', E3 = parseEq(Mc.steps[1]), wr2 = [];
    wr2.push('$\\text{rate} = k' + E3.r.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + '$');
    wr2.push('$\\text{rate} = k' + R0.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + '$');
    return P(intro + 'Which rate law does this mechanism predict?', mc(right2, wr2.concat(['$\\text{rate} = k[\\mathrm{D}]$'].filter(function () { return Mc.generic; }), ['$\\text{rate} = k' + Mc.law.map(function (y) { return cc(y[0]); }).join('') + '^{2}$'])), [first], 'The slow step is the bottleneck.', null, { k: 'rds', mech: Mc, ans: right2 });
  });

  // fast pre-equilibrium, then a slow step. law: the predicted orders after the intermediate is replaced
  var PRE = [
    { steps: ['2NO(g) <=> N2O2(g)', 'N2O2(g) + O2(g) -> 2NO2(g)'], all: '2NO(g) + O2(g) -> 2NO2(g)', inter: 'N2O2', interExpr: 'K[\\mathrm{NO}]^2', law: [['NO', 2], ['O2', 1]], kobs: 'k_2K', root: false },
    { steps: ['NO(g) + Br2(g) <=> NOBr2(g)', 'NOBr2(g) + NO(g) -> 2NOBr(g)'], all: '2NO(g) + Br2(g) -> 2NOBr(g)', inter: 'NOBr2', interExpr: 'K[\\mathrm{NO}][\\mathrm{Br_2}]', law: [['NO', 2], ['Br2', 1]], kobs: 'k_2K' },
    { steps: ['O3(g) <=> O2(g) + O(g)', 'O(g) + O3(g) -> 2O2(g)'], all: '2O3(g) -> 3O2(g)', inter: 'O', interExpr: 'K\\dfrac{[\\mathrm{O_3}]}{[\\mathrm{O_2}]}', law: [['O3', 2], ['O2', -1]], kobs: 'k_2K' },
    { steps: ['2NO(g) <=> N2O2(g)', 'N2O2(g) + H2(g) -> N2O(g) + H2O(g)', 'N2O(g) + H2(g) -> N2(g) + H2O(g)'], all: '2NO(g) + 2H2(g) -> N2(g) + 2H2O(g)', inter: 'N2O2', interExpr: 'K[\\mathrm{NO}]^2', law: [['NO', 2], ['H2', 1]], kobs: 'k_2K' },
    { steps: ['Cl2(g) <=> 2Cl(g)', 'Cl(g) + CHCl3(g) -> HCl(g) + CCl3(g)', 'CCl3(g) + Cl(g) -> CCl4(g)'], all: 'Cl2(g) + CHCl3(g) -> HCl(g) + CCl4(g)', inter: 'Cl', interExpr: 'K^{1/2}[\\mathrm{Cl_2}]^{1/2}', law: [['CHCl3', 1], ['Cl2', 0.5]], kobs: 'k_2K^{1/2}', root: true },
    { steps: ['I2(g) <=> 2I(g)', 'H2(g) + 2I(g) -> 2HI(g)'], all: 'H2(g) + I2(g) -> 2HI(g)', inter: 'I', interExpr: 'K[\\mathrm{I_2}]', interPow: 2, law: [['H2', 1], ['I2', 1]], kobs: 'k_2K' }
  ];
  function preLawTex(Pq) { return 'k_{\\text{obs}}' + Pq.law.map(function (x) { return cc(x[0]) + (x[1] === 1 ? '' : '^{' + (x[1] === 0.5 ? '1/2' : x[1]) + '}'); }).join(''); }

  G('gchem2.pre-equilibrium', function (R, ctx) {
    var Pq = R.pick(PRE), kind = lv(ctx, R.pick(['order', 'order', 'kobs']), R.pick(['orders', 'kobs', 'order']), R.pick(['orders', 'kobs', 'law']));
    var E1 = parseEq(Pq.steps[0]), E2 = parseEq(Pq.steps[1]);
    var intro = 'A proposed mechanism for $' + EQ(Pq.all) + '$:' + mechHtml(Pq, ['fast, reversible'].concat(Pq.steps.slice(1).map(function (_, i) { return i === 0 ? 'slow' : 'fast'; })));
    var slowLaw = 'k_2' + E2.r.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('');
    var interSq = Pq.interPow ? cc(Pq.inter) + '^2 = ' + Pq.interExpr : cc(Pq.inter) + ' = ' + Pq.interExpr;
    var steps = [
      'The slow step sets the rate: rate $= ' + slowLaw + '$. But $' + F(Pq.inter) + '$ is an intermediate, so its concentration must be replaced.',
      'Step 1 is a fast equilibrium: forward rate = reverse rate, $k_1' + E1.r.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + ' = k_{-1}' + E1.p.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + '$. With $K = k_1/k_{-1}$: $' + interSq + '$.',
      'Substitute: rate $= ' + preLawTex(Pq) + '$ with $k_{\\text{obs}} = ' + Pq.kobs + '$.'
    ];
    if (kind === 'order' || kind === 'orders') {
      var R0 = parseEq(Pq.all).r.map(function (sp) { return sp.f; }); Pq.law.forEach(function (x) { if (R0.indexOf(x[0]) < 0) R0.push(x[0]); });
      if (kind === 'order') { var f = R.pick(R0), o = (Pq.law.filter(function (y) { return y[0] === f; })[0] || [0, 0])[1];
        return P(intro + 'What order in $' + F(f) + '$ does this mechanism predict?', exact(ML.Q.from(o).toPlain()), steps.concat(['The exponent on $' + cc(f) + '$ is $' + (o === 0.5 ? '\\tfrac{1}{2}' : o) + '$.' + (o < 0 ? ' A negative order means adding that species slows the reaction: it pushes the fast equilibrium back.' : '')]),
          'Write the slow step\u2019s rate law, then use the fast equilibrium to replace the intermediate.', null, { k: 'pre', steps: Pq.steps, law: Pq.law, p: PRE.indexOf(Pq), sp: f, ans: o }); }
      return P(intro + 'Give the order in each species that this mechanism predicts.', { t: 'multi', parts: R0.map(function (f2) { var o2 = (Pq.law.filter(function (y) { return y[0] === f2; })[0] || [0, 0])[1]; return { label: 'order in $' + F(f2) + '$:', a: exact(ML.Q.from(o2).toPlain()) }; }) }, steps,
        'Replace the intermediate using the fast equilibrium.', null, { k: 'pre', steps: Pq.steps, law: Pq.law, p: PRE.indexOf(Pq) });
    }
    if (kind === 'kobs') {
      var k1 = R.pick([2.0, 4.0, 5.0, 8.0, 1.2e1]) * M.pow(10, R.int(1, 3)), km1 = R.pick([1.0, 2.5, 4.0, 5.0]) * M.pow(10, R.int(2, 4)), k2 = R.pick([1.5, 2.0, 3.0, 6.0]) * M.pow(10, R.int(-2, 1));
      var Kq = k1 / km1, kobs = Pq.root ? k2 * M.sqrt(Kq) : k2 * Kq;
      return P(intro + 'Step 1 has $k_1 = ' + gv(k1) + '$ and $k_{-1} = ' + gv(km1) + '$ (in the matching units), and the slow step has $k_2 = ' + gv(k2) + '$. What is the observed rate constant $k_{\\text{obs}}$ in rate $= ' + preLawTex(Pq) + '$? (Leave out units.)',
        num(kobs), steps.concat(['$K = \\dfrac{k_1}{k_{-1}} = \\dfrac{' + gv(k1) + '}{' + gv(km1) + '} = ' + fx(Kq, 3) + '$.', '$k_{\\text{obs}} = ' + Pq.kobs + ' = ' + (Pq.root ? '(' + gv(k2) + ')\\sqrt{' + fx(Kq, 3) + '}' : '(' + gv(k2) + ')(' + fx(Kq, 3) + ')') + ' = ' + fx(kobs, 3) + '$.']),
        'k_obs combines k₂ with the equilibrium constant of the fast step.', null, { k: 'prek', steps: Pq.steps, law: Pq.law, p: PRE.indexOf(Pq), k1: k1, km1: km1, k2: k2, ans: kobs });
    }
    var right = '$\\text{rate} = ' + preLawTex(Pq) + '$', wr = ['$\\text{rate} = ' + slowLaw + '$', '$\\text{rate} = k' + E1.r.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + '$'];
    var allR = parseEq(Pq.all).r; wr.push('$\\text{rate} = k' + allR.map(function (sp) { return cc(sp.f) + (sp.n > 1 ? '^{' + sp.n + '}' : ''); }).join('') + '$');
    return P(intro + 'Which rate law does this mechanism predict, written without the intermediate?', mc(right, wr), steps, 'The final rate law may contain only species of the overall reaction.', null, { k: 'pre', steps: Pq.steps, law: Pq.law, p: PRE.indexOf(Pq), ans: right });
  });

  G('gchem2.multistep-energy-profiles', function (R, ctx) {
    var n = lv(ctx, 2, R.pick([2, 3]), 3), st, tries = 0;
    do { // each step: dE (to the next valley) and Ea (from the valley before it); the slow step must also hold the highest peak
      st = []; for (var i = 0; i < n; i++) st.push({ dE: R.pick([-90, -70, -55, -40, -25, 15, 20, 30, 45]), Ea: R.pick([30, 40, 50, 60, 75, 90, 105, 120]) });
      st.forEach(function (s) { if (s.Ea <= s.dE + 10) s.Ea = s.dE + R.pick([20, 30, 40]); });
      var lev = [0], peaks = [], e = 0; st.forEach(function (s) { peaks.push(e + s.Ea); e += s.dE; lev.push(e); });
      var big = 0; st.forEach(function (s, j) { if (s.Ea > st[big].Ea) big = j; });
      var hi = 0; peaks.forEach(function (p, j) { if (p > peaks[hi]) hi = j; });
      var uniq = st.filter(function (s) { return s.Ea === st[big].Ea; }).length === 1 && peaks.filter(function (p) { return p === peaks[hi]; }).length === 1;
      var drop = 0; st.forEach(function (s, j) { if (s.dE < st[drop].dE) drop = j; });
      tries++;
    } while (!(uniq && big === hi && (n === 2 || drop !== big || tries > 200)) && tries < 400);
    var levels = [0], pk = [], e2 = 0; st.forEach(function (s) { pk.push(e2 + s.Ea); e2 += s.dE; levels.push(e2); });
    var slow = 0; st.forEach(function (s, j) { if (s.Ea > st[slow].Ea) slow = j; });
    var names = []; levels.forEach(function (v, j) { names.push([j === 0 ? 'reactants' : j === n ? 'products' : 'intermediate ' + (n > 2 ? j : ''), v]); if (j < n) names.push(['transition state ' + (j + 1), pk[j]]); });
    var html = tbl(['Point on the path', 'Energy (kJ/mol)'], names.map(function (x) { return [x[0].trim(), (x[1] > 0 ? '+' : '') + String(x[1]).replace('-', '−')]; }));
    var viz = { name: 'ch-energydiagram', opts: { mode: 'steps', steps: st.map(function (s, j) { return { dE: s.dE, Ea: s.Ea, label: 'step ' + (j + 1) }; }), quiet: true, edit: false } };
    var kind = lv(ctx, R.pick(['inter', 'dH', 'Ea']), R.pick(['slow', 'Ea', 'dH', 'ts']), R.pick(['slow', 'Ear', 'Ea']));
    var intro = 'The energy profile of a ' + n + '-step reaction is shown below, with these energies measured from the reactants:' + html;
    if (kind === 'inter') return P(intro + 'How many intermediates are there?', int(n - 1), ['Each valley between two peaks is an intermediate; each peak is a transition state.', 'With ' + n + ' steps there are ' + n + ' peaks and ' + (n - 1) + ' valley' + (n > 2 ? 's' : '') + ' between them: ' + (n - 1) + ' intermediate' + (n > 2 ? 's' : '') + '.'], 'Count the valleys between the peaks.', null, { k: 'prof', st: st, ask: 'inter', ans: n - 1 }, viz);
    if (kind === 'ts') return P(intro + 'How many transition states are there?', int(n), ['Each step passes over one peak, a transition state.', n + ' steps, so ' + n + ' transition states.'], 'One peak per step.', null, { k: 'prof', st: st, ask: 'ts', ans: n }, viz);
    if (kind === 'dH') return P(intro + 'What is $\\Delta H$ for the overall reaction?', exact(e2), ['$\\Delta H$ depends only on where the path starts and ends: products minus reactants.', '$\\Delta H = ' + T.num(e2) + ' - 0 = ' + T.num(e2) + '\\ \\text{kJ/mol}$, ' + (e2 < 0 ? 'exothermic' : 'endothermic') + '. The humps along the way do not change it.'], 'Products minus reactants.', 'kJ/mol', { k: 'prof', st: st, ask: 'dH', ans: e2 }, viz);
    if (kind === 'Ea' || kind === 'Ear') { var j = R.int(n > 2 ? 1 : 0, n - 1), fw = kind === 'Ea', v = fw ? st[j].Ea : st[j].Ea - st[j].dE;
      return P(intro + 'What is the activation energy of ' + (fw ? '' : 'the reverse of ') + 'step ' + (j + 1) + '?', exact(v), [
        fw ? 'An activation energy is measured from the valley just before the peak, not from the reactants.' : 'The reverse of step ' + (j + 1) + ' starts in the valley after its peak and climbs back over the same peak.',
        fw ? 'Step ' + (j + 1) + ' starts at ' + T.num(levels[j]).replace('-', '−') + ' kJ/mol and its peak is at ' + T.num(pk[j]).replace('-', '−') + ' kJ/mol: $E_a = ' + T.num(pk[j]) + ' - (' + T.num(levels[j]) + ') = ' + v + '\\ \\text{kJ/mol}$.' : 'Peak ' + T.num(pk[j]).replace('-', '−') + ' kJ/mol, valley after it ' + T.num(levels[j + 1]).replace('-', '−') + ' kJ/mol: $E_{a,\\text{rev}} = ' + T.num(pk[j]) + ' - (' + T.num(levels[j + 1]) + ') = ' + v + '\\ \\text{kJ/mol}$.'
      ], 'Measure from the valley the step starts in.', 'kJ/mol', { k: 'prof', st: st, ask: fw ? 'Ea' : 'Ear', j: j, ans: v }, viz); }
    var drop2 = 0; st.forEach(function (s, j2) { if (s.dE < st[drop2].dE) drop2 = j2; });
    return P(intro + 'Which step is rate-determining?', mc('Step ' + (slow + 1), st.map(function (_, j2) { return 'Step ' + (j2 + 1); }).filter(function (s) { return s !== 'Step ' + (slow + 1); })), [
      'The slow step is the one with the largest activation energy, measured from the valley before its peak: ' + st.map(function (s, j2) { return 'step ' + (j2 + 1) + ': ' + s.Ea + ' kJ/mol'; }).join(', ') + '.',
      'Step ' + (slow + 1) + ' has the largest barrier' + (pk[slow] === M.max.apply(null, pk) ? ' and the highest peak' : '') + ', so it is the slow, rate-determining step.' + (drop2 !== slow ? ' (Step ' + (drop2 + 1) + ' has the biggest drop in energy, but a drop says nothing about speed.)' : '')
    ], 'Compare the heights of the humps, each measured from its own starting valley.', null, { k: 'prof', st: st, ask: 'slow', ans: 'Step ' + (slow + 1) }, viz);
  });

  var CATS = [
    ['Platinum, palladium and rhodium metal in a car\u2019s catalytic converter', 'Heterogeneous'], ['Iron in the Haber process, which makes ammonia from nitrogen and hydrogen gas', 'Heterogeneous'],
    ['Vanadium(V) oxide, a solid, in the oxidation of sulfur dioxide gas', 'Heterogeneous'], ['Nickel metal in the hydrogenation of liquid vegetable oils', 'Heterogeneous'],
    ['Chlorine atoms in the destruction of ozone gas in the stratosphere', 'Homogeneous'], ['Iodide ions in the decomposition of aqueous hydrogen peroxide', 'Homogeneous'],
    ['Dissolved acid ($\\mathrm{H_3O^+}$) in the hydrolysis of sucrose in water', 'Homogeneous'], ['Nitrogen monoxide gas in the decomposition of ozone gas', 'Homogeneous'],
    ['Catalase in the decomposition of hydrogen peroxide in cells', 'Enzyme'], ['Carbonic anhydrase speeding up $\\mathrm{CO_2 + H_2O \\rightleftharpoons H_2CO_3}$ in red blood cells', 'Enzyme']
  ];
  var CAT_TF = [
    ['A catalyst lowers the activation energy of the forward and reverse reactions by the same amount.', true],
    ['A catalyst increases the amount of product present at equilibrium.', false],
    ['A catalyst speeds up only the forward reaction.', false],
    ['A catalyst changes ΔH for the reaction.', false],
    ['A catalyst does not change the equilibrium constant K.', true],
    ['A catalyst helps a system reach equilibrium sooner.', true],
    ['A catalyst is used up by the reaction it speeds up.', false]
  ];

  G('gchem2.catalysis', function (R, ctx) {
    var kind = lv(ctx, R.pick(['type', 'tf', 'rev']), R.pick(['rev', 'type', 'tf', 'dH']), R.pick(['factor', 'rev', 'tf']));
    if (kind === 'type') { var c = R.pick(CATS); return P(c[0] + '. What kind of catalysis is this?', mc(c[1] + ' catalysis', ['Heterogeneous catalysis', 'Homogeneous catalysis', 'Enzyme catalysis'].filter(function (s) { return s !== c[1] + ' catalysis'; })), [
      c[1] === 'Heterogeneous' ? 'The catalyst is in a different phase from the reacting substances (a solid with gases or liquids): heterogeneous. The reaction happens on its surface.' : c[1] === 'Homogeneous' ? 'The catalyst is in the same phase as the reacting substances (all gases, or all dissolved): homogeneous.' : 'The catalyst is a protein made by a living thing: an enzyme. The reactant binds at its active site.',
      'In every case the catalyst opens a different mechanism with a lower barrier and is regenerated.'
    ], 'Compare the phase of the catalyst with the phase of the reactants.', null, { k: 'cattype', ans: c[1] + ' catalysis' }); }
    if (kind === 'tf') { var t = R.pick(CAT_TF); return P('True or false: ' + t[0], tf(t[1]), [
      'A catalyst gives the reaction a new path with a lower peak. The starting and ending energies are unchanged, so $\\Delta H$ and $K$ are unchanged.',
      'The new path is lower for the reverse direction by exactly the same amount, so both directions speed up by the same factor: equilibrium comes sooner, but it is the same equilibrium.',
      'So the statement is ' + (t[1] ? 'true' : 'false') + '.'
    ], 'Think about what the catalyst changes on the energy diagram, and what it leaves alone.', null, { k: 'cattf', ans: t[1] }); }
    var Ea = R.pick([80, 95, 110, 125, 140, 160, 185]), dH = R.pick([-90, -60, -45, -30, 20, 35, 50]), d = R.pick([20, 30, 35, 40, 45, 50]);
    if (Ea - d <= M.max(0, dH) + 5) Ea = M.max(0, dH) + d + 40;
    var viz = { name: 'ch-energydiagram', opts: { mode: 'profile', dH: dH, Ea: Ea, catalyst: true, catEa: Ea - d, quiet: true, edit: false } };
    if (kind === 'rev') { var v = Ea - d - dH; return P('A reaction has $E_a = ' + Ea + '\\ \\text{kJ/mol}$ and $\\Delta H = ' + dH + '\\ \\text{kJ/mol}$. A catalyst lowers the forward activation energy by $' + d + '\\ \\text{kJ/mol}$. What is the activation energy of the reverse reaction with the catalyst?', exact(v), [
      'With the catalyst the forward barrier is $' + Ea + ' - ' + d + ' = ' + (Ea - d) + '\\ \\text{kJ/mol}$. The reactants and products stay at the same energies, so $\\Delta H$ is still $' + dH + '\\ \\text{kJ/mol}$.',
      'The reverse reaction climbs the same peak from the products: $E_{a,\\text{rev}} = E_{a,\\text{fwd}} - \\Delta H = ' + (Ea - d) + ' - (' + dH + ') = ' + v + '\\ \\text{kJ/mol}$.',
      'Check: without the catalyst it was $' + (Ea - dH) + '\\ \\text{kJ/mol}$, also ' + d + ' kJ/mol higher. Both directions are lowered equally.'
    ], 'The reverse barrier is the forward barrier minus ΔH.', 'kJ/mol', { k: 'catrev', Ea: Ea, dH: dH, d: d, ans: v }, viz); }
    if (kind === 'dH') return P('A reaction has $E_a = ' + Ea + '\\ \\text{kJ/mol}$ and $\\Delta H = ' + dH + '\\ \\text{kJ/mol}$. A catalyst lowers the activation energy to $' + (Ea - d) + '\\ \\text{kJ/mol}$. What is $\\Delta H$ for the catalyzed reaction?', exact(dH), [
      'A catalyst changes the path, not the start or the end. $\\Delta H$ is the energy of the products minus that of the reactants.',
      'So $\\Delta H$ is unchanged: $' + dH + '\\ \\text{kJ/mol}$.'
    ], 'Does the catalyst move the reactants or the products on the diagram?', 'kJ/mol', { k: 'catdh', ans: dH }, viz);
    var Tk = R.pick([298, 310, 350, 400]), fac = M.exp(d * 1000 / (C.R * Tk));
    return P('A catalyst lowers the activation energy of a reaction by $' + d + '\\ \\text{kJ/mol}$ and leaves $A$ in $k = Ae^{-E_a/RT}$ the same. By what factor does it multiply the rate constant at $' + Tk + '\\ \\text{K}$? (Use a calculator.)', num(fac, 3, 0.04), [
      'Divide the two Arrhenius expressions: $\\dfrac{k_{\\text{cat}}}{k} = e^{(E_a - E_{a,\\text{cat}})/RT} = e^{\\Delta E_a/RT}$.',
      '$\\dfrac{\\Delta E_a}{RT} = \\dfrac{' + cm(d * 1000) + '}{(8.314)(' + Tk + ')} = ' + fx(d * 1000 / (C.R * Tk), 3) + '$.',
      '$e^{' + fx(d * 1000 / (C.R * Tk), 3) + '} = ' + fx(fac, 3) + '$. A modest drop in the barrier makes a huge difference, because it sits in an exponent.'
    ], 'The factor is e^(ΔEa/RT), with ΔEa in J/mol.', null, { k: 'catfac', d: d, T: Tk, ans: fac });
  });


  // ================================================================== Unit 2: Chemical Equilibrium
  var HOMO = ['N2(g) + 3H2(g) <=> 2NH3(g)', '2SO2(g) + O2(g) <=> 2SO3(g)', 'H2(g) + I2(g) <=> 2HI(g)', 'N2O4(g) <=> 2NO2(g)', 'PCl5(g) <=> PCl3(g) + Cl2(g)',
    'CO(g) + 2H2(g) <=> CH3OH(g)', '2NO(g) + O2(g) <=> 2NO2(g)', 'CO(g) + H2O(g) <=> CO2(g) + H2(g)', '2NOCl(g) <=> 2NO(g) + Cl2(g)', 'H2(g) + Br2(g) <=> 2HBr(g)',
    'Fe^3+(aq) + SCN^-(aq) <=> FeSCN^2+(aq)', 'CH4(g) + H2O(g) <=> CO(g) + 3H2(g)'];
  var HETERO = ['CaCO3(s) <=> CaO(s) + CO2(g)', 'C(s) + H2O(g) <=> CO(g) + H2(g)', 'NH4HS(s) <=> NH3(g) + H2S(g)', 'CH3COOH(aq) + H2O(l) <=> H3O^+(aq) + CH3COO^-(aq)',
    'AgCl(s) <=> Ag^+(aq) + Cl^-(aq)', 'Fe2O3(s) + 3CO(g) <=> 2Fe(s) + 3CO2(g)', '3Fe(s) + 4H2O(g) <=> Fe3O4(s) + 4H2(g)', 'NH3(aq) + H2O(l) <=> NH4^+(aq) + OH^-(aq)', 'C(s) + CO2(g) <=> 2CO(g)'];
  var HOMOG = HOMO.filter(function (e) { return e.indexOf('(aq)') < 0; });
  function kName(E) { return E.r.concat(E.p).some(function (sp) { return sp.ph === 'aq'; }) ? 'K' : 'K_c'; }
  function kDef(E, P) { return (P ? 'K_p' : kName(E)) + ' = ' + kExpr(E, P); }
  function randConc(R, E, lo) { var c = {}; species(E).filter(inK).forEach(function (sp) { c[sp.f] = R.pick(lo ? [0.0020, 0.0050, 0.012, 0.025, 0.040, 0.080] : [0.10, 0.15, 0.20, 0.25, 0.32, 0.40, 0.50, 0.65, 0.80, 1.2, 1.5, 2.0]); }); return c; }
  function concList(E, c, n) { return U.list(species(E).filter(inK).map(function (sp) { return '$' + cc(sp.f) + ' = ' + qv(c[sp.f], 'M', n) + '$'; })); }

  G('gchem2.equilibrium-expressions', function (R, ctx) {
    var kind = lv(ctx, R.pick(['calc', 'exp']), R.pick(['calc', 'pick', 'calc']), R.pick(['pick', 'calc']));
    var E = parseEq(R.pick(kind === 'pick' || kind === 'exp' ? (R.coin() ? HETERO : HOMO) : (ctx.level || 1) >= 2 && R.coin() ? HETERO.filter(function (e) { return e.indexOf('(aq)') < 0; }) : HOMOG)), K0 = kName(E);
    var left = species(E).filter(function (sp) { return !inK(sp); });
    if (kind === 'exp') { var sp = R.pick(species(E).filter(inK)), side = coefOf(E, sp.f) > 0;
      return P('Write the equilibrium constant expression for $' + EQ(E.eq) + '$. To what power is $' + cc(sp.f) + '$ raised, and is it in the numerator or the denominator? Give the power.', int(sp.n), [
        '$' + kDef(E) + '$: products over reactants, each raised to its coefficient.',
        '$' + cc(sp.f) + '$ is a ' + (side ? 'product, so it is in the numerator' : 'reactant, so it is in the denominator') + ', raised to the power ' + sp.n + '.'
      ], 'The coefficient in the balanced equation becomes the exponent.', null, { k: 'kexp', eq: E.eq, sp: sp.f, ans: sp.n }); }
    if (kind === 'calc') { var c = randConc(R, E, E.eq.indexOf('aq') >= 0), K = kVal(E, c);
      return P('At equilibrium at a certain temperature, $' + EQ(E.eq) + '$ has ' + concList(E, c) + (left.length ? ', with ' + U.list(left.map(function (s2) { return 'some $' + F(s2.f) + '$'; })) + ' also present' : '') + '. What is $' + K0 + '$?', num(K), [
        'Write the expression: products over reactants, each raised to its coefficient' + (left.length ? '; pure solids and liquids (' + U.list(left.map(function (s2) { return '$' + F(s2.f) + '$'; })) + ') are left out' : '') + ': $' + kDef(E) + '$.',
        'Substitute: $' + K0 + ' = ' + kSub(E, c) + ' = ' + fx(K, 3) + '$.',
        'By convention $K$ is written without units.'
      ], 'Products over reactants, each to the power of its coefficient; leave out solids and liquids.', null, { k: 'kcalc', eq: E.eq, c: c, ans: K }); }
    // pick the right expression
    var right = '$' + K0 + ' = ' + kExpr(E) + '$', wr = [];
    var all = { r: E.r.map(function (s2) { return { f: s2.f, n: s2.n, ph: 'g' }; }), p: E.p.map(function (s2) { return { f: s2.f, n: s2.n, ph: 'g' }; }) };
    if (left.length) wr.push('$' + K0 + ' = ' + kExpr(all) + '$');
    var flat = { r: E.r.map(function (s2) { return { f: s2.f, n: 1, ph: s2.ph }; }), p: E.p.map(function (s2) { return { f: s2.f, n: 1, ph: s2.ph }; }) };
    wr.push('$' + K0 + ' = ' + kExpr(flat) + '$');
    wr.push('$' + K0 + ' = ' + kExpr({ r: E.p, p: E.r }) + '$');
    if (!left.length || R.coin()) wr.push('$' + K0 + ' = ' + kExpr({ r: all.p, p: all.r }) + '$');
    return P('Which is the equilibrium constant expression for $' + EQ(E.eq) + '$?', mc(right, wr), [
      'Products go on top and reactants on the bottom, each raised to its coefficient.',
      left.length ? 'Pure solids and liquids (' + U.list(left.map(function (s2) { return '$' + F(s2.f) + '$'; })) + ') are left out: their concentration does not change as long as some is present.' : 'All the species here are gases or dissolved, so all of them appear.',
      'So ' + right + '.'
    ], 'Products over reactants, with coefficients as exponents; leave out pure solids and liquids.', null, { k: 'kpick', eq: E.eq, ans: right });
  });

  G('gchem2.k-magnitude', function (R, ctx) {
    var kind = lv(ctx, R.pick(['what', 'tf', 'calc']), R.pick(['what', 'compare', 'calc', 'tf']));
    if (kind === 'what' || kind === 'tf') {
      var c = R.pick([['big', R.pick([3.5e12, 1.2e8, 6.0e25, 4.5e5, 2.0e15])], ['small', R.pick([2.0e-9, 4.6e-15, 1.1e-6, 3.0e-31, 5.0e-12])], ['mid', R.pick([1.5, 0.80, 4.2, 0.35, 2.6])]]);
      var ansT = { big: 'Mostly products', small: 'Mostly reactants', mid: 'Large amounts of both reactants and products' }[c[0]];
      var E = parseEq(R.pick(HOMO));
      var why = c[0] === 'big' ? 'A large $K$ means the products term on top is much larger than the reactants term below: the mixture at equilibrium is mostly products.' : c[0] === 'small' ? 'A small $K$ means the reactants term below dominates: at equilibrium the mixture is mostly reactants, with only a little product.' : 'A $K$ near 1 means neither side dominates: there are large amounts of both at equilibrium.';
      if (kind === 'tf') { var stmt = R.pick([['Because $K$ is ' + (c[0] === 'small' ? 'so small' : 'so large') + ', this reaction must reach equilibrium ' + (c[0] === 'small' ? 'slowly' : 'quickly') + '.', false], ['At equilibrium the mixture is ' + ansT.toLowerCase() + '.', true]]);
        if (c[0] === 'mid') stmt = ['At equilibrium the mixture is large amounts of both reactants and products.', true];
        stmt[0] = stmt[0].replace('the mixture is large amounts', 'the mixture holds large amounts');
        return P('For $' + EQ(E.eq) + '$, $' + kName(E) + ' = ' + gv(c[1]) + '$ at a certain temperature. True or false: ' + stmt[0], tf(stmt[1]), [why, '$K$ says how far a reaction goes, not how fast. Speed depends on the activation energy and the mechanism, which $K$ knows nothing about.', 'So the statement is ' + (stmt[1] ? 'true' : 'false') + '.'], 'K is about where the reaction ends up, not how fast it gets there.', null, { k: 'kmagtf', K: c[1], ans: stmt[1] }); }
      return P('For $' + EQ(E.eq) + '$, $' + kName(E) + ' = ' + gv(c[1]) + '$ at a certain temperature. What does this tell you about the mixture at equilibrium?', mc(ansT, ['Mostly products', 'Mostly reactants', 'Large amounts of both reactants and products', c[0] === 'small' ? 'The reaction is slow' : 'The reaction is fast'].filter(function (s) { return s !== ansT; })), [why, '$K$ describes the equilibrium mixture only. It says nothing about how fast the reaction gets there.'], 'Is K much bigger than 1, much smaller, or near 1?', null, { k: 'kmag', K: c[1], ans: ansT });
    }
    if (kind === 'compare') { var K1 = R.pick([2.5e-3, 4.0e2, 6.1, 1.3e-8, 8.8e4]), K2; do { K2 = R.pick([3.2e-5, 7.5, 2.0e6, 0.45, 1.1e-2]); } while (M.abs(log10(K1 / K2)) < 1);
      var big = K1 > K2 ? 'Reaction 1' : 'Reaction 2';
      return P('Two reactions of the same form, $\\mathrm{A} \\rightleftharpoons \\mathrm{B}$, start with only A. Reaction 1 has $K = ' + gv(K1) + '$ and reaction 2 has $K = ' + gv(K2) + '$. Which ends with the larger fraction of A turned into B?', mc(big, [big === 'Reaction 1' ? 'Reaction 2' : 'Reaction 1', 'They end the same', 'It depends on which is faster']), [
        'For $\\mathrm{A} \\rightleftharpoons \\mathrm{B}$, $K = [\\mathrm{B}]/[\\mathrm{A}]$ at equilibrium: the larger $K$, the more B for each A.',
        big + ' has the larger $K$ (' + gv(M.max(K1, K2)) + '), so it goes further toward B. Speed has nothing to do with it.'
      ], 'Which one has the larger K?', null, { k: 'kcomp', K1: K1, K2: K2, ans: big }); }
    var Kc = R.pick([2.0, 4.0, 5.0, 0.25, 0.50, 8.0, 12, 0.10]), a = R.pick([0.10, 0.20, 0.25, 0.40, 0.50, 0.80]), b = Kc * a;
    return P('For $\\mathrm{A} \\rightleftharpoons \\mathrm{B}$, $K = ' + gv(Kc) + '$. At equilibrium $[\\mathrm{A}] = ' + qv(a, 'M') + '$. What is $[\\mathrm{B}]$?', num(b), [
      '$K = \\dfrac{[\\mathrm{B}]}{[\\mathrm{A}]}$, so $[\\mathrm{B}] = K[\\mathrm{A}]$.',
      '$[\\mathrm{B}] = ' + gv(Kc) + ' \\times ' + gv(a) + ' = ' + q(b, 'M') + '$. ' + (Kc > 1 ? 'K is above 1, so there is more B than A.' : 'K is below 1, so there is less B than A.')
    ], 'Rearrange K = [B]/[A].', 'M', { k: 'kAB', K: Kc, a: a, ans: b });
  });

  var KBASE = [['N2(g) + 3H2(g) <=> 2NH3(g)', [0.50, 6.0e5, 1.5e-5]], ['H2(g) + I2(g) <=> 2HI(g)', [50, 54, 64]], ['2SO2(g) + O2(g) <=> 2SO3(g)', [2.8e2, 4.0e24, 85]],
    ['N2O4(g) <=> 2NO2(g)', [4.6e-3, 0.21, 0.15]], ['PCl5(g) <=> PCl3(g) + Cl2(g)', [0.040, 1.8, 0.050]], ['2NO(g) + O2(g) <=> 2NO2(g)', [6.4e9, 2.5e10]], ['CO(g) + H2O(g) <=> CO2(g) + H2(g)', [5.0, 0.64, 1.6]]];
  var KSUM = [
    { a: 'N2(g) + O2(g) <=> 2NO(g)', Ka: [4.1e-4, 1.0e-5], b: '2NO(g) + O2(g) <=> 2NO2(g)', Kb: [6.4e2, 3.0e3], t: [['N2(g) + 2O2(g) <=> 2NO2(g)', 1, 1], ['2NO2(g) <=> N2(g) + 2O2(g)', -1, -1]] },
    { a: 'C(s) + CO2(g) <=> 2CO(g)', Ka: [0.020, 2.5], b: 'CO(g) + Cl2(g) <=> COCl2(g)', Kb: [6.0e-3, 4.5e2], t: [['C(s) + CO2(g) + 2Cl2(g) <=> 2COCl2(g)', 1, 2]] },
    { a: 'AgCl(s) <=> Ag^+(aq) + Cl^-(aq)', Ka: [1.8e-10], b: 'Ag^+(aq) + 2NH3(aq) <=> [Ag(NH3)2]^+(aq)', Kb: [1.7e7], t: [['AgCl(s) + 2NH3(aq) <=> [Ag(NH3)2]^+(aq) + Cl^-(aq)', 1, 1]] },
    { a: 'HF(aq) <=> H^+(aq) + F^-(aq)', Ka: [6.8e-4], b: 'HNO2(aq) <=> H^+(aq) + NO2^-(aq)', Kb: [5.6e-4], t: [['HF(aq) + NO2^-(aq) <=> F^-(aq) + HNO2(aq)', 1, -1]] },
    { a: 'H2(g) + F2(g) <=> 2HF(g)', Ka: [3.0e96], b: 'H2(g) + Cl2(g) <=> 2HCl(g)', Kb: [2.5e33], t: [['2HCl(g) + F2(g) <=> 2HF(g) + Cl2(g)', 1, -1]] }
  ];
  function opText(k) { return k === -1 ? 'reverse it' : k === 2 ? 'double it' : k === 3 ? 'triple it' : k === 0.5 ? 'halve it' : k === -2 ? 'reverse it and double it' : k === -0.5 ? 'reverse it and halve it' : ''; }
  function powTex(k) { return k === 0.5 ? '1/2' : k === -0.5 ? '-1/2' : String(k); }

  G('gchem2.manipulating-k', function (R, ctx) {
    var kind = lv(ctx, 'one', R.pick(['one', 'sum']), R.pick(['sum', 'one']));
    if (kind === 'one') {
      var B = R.pick(KBASE), E = parseEq(B[0]), K = R.pick(B[1]), k = lv(ctx, R.pick([-1, 2]), R.pick([-1, 2, 3, 0.5]), R.pick([-2, -0.5, 0.5, 3]));
      var E2 = scaleEq(E, k), s2 = eqStr(E2.r, E2.p), K2 = M.pow(K, k);
      var rule = k === -1 ? 'Reversing an equation turns $K$ upside down: $K\' = 1/K$.' : k > 0 ? 'Multiplying every coefficient by ' + T.num(k) + ' raises $K$ to that power: $K\' = K^{' + powTex(k) + '}$' + (k === 0.5 ? ' (the square root).' : '.') : 'Reversing gives $1/K$; scaling by ' + T.num(-k) + ' raises it to the power ' + T.num(-k) + ': $K\' = K^{' + powTex(k) + '}$.';
      return P('At a certain temperature, $' + EQ(E.eq) + '$ has $K = ' + gv(K) + '$. What is $K$ for $' + EQ(s2) + '$ at the same temperature?', num(K2), [
        'Compare the two equations: the new one is the first one with every coefficient multiplied by $' + T.num(k) + '$' + (k < 0 ? ' (the minus sign means reversed).' : '.'),
        rule + ' The exponents in the expression are the coefficients, so scaling them scales the powers.',
        '$K\' = (' + gv(K) + ')^{' + powTex(k) + '} = ' + fx(K2, 3) + '$.'
      ], 'Reverse → 1/K; multiply the equation by n → Kⁿ.', null, { k: 'kman', eq: E.eq, K: K, n: k, ans: K2 });
    }
    var S = R.pick(KSUM), Ka = R.pick(S.Ka), Kb = R.pick(S.Kb), t = R.pick(S.t), Kt = M.pow(Ka, t[1]) * M.pow(Kb, t[2]);
    function how(n, name) { return n === 1 ? 'reaction ' + name + ' as written' : n === -1 ? 'reaction ' + name + ' reversed' : 'reaction ' + name + (n < 0 ? ' reversed and' : '') + ' multiplied by ' + M.abs(n); }
    function term(Kx, n) { return n === 1 ? '(' + gv(Kx) + ')' : '(' + gv(Kx) + ')^{' + n + '}'; }
    return P('At a certain temperature:<br>(1) $' + EQ(S.a) + '$, $K_1 = ' + gv(Ka) + '$<br>(2) $' + EQ(S.b) + '$, $K_2 = ' + gv(Kb) + '$<br>What is $K$ for $' + EQ(t[0]) + '$?', num(Kt), [
      'Build the target from the two: ' + how(t[1], '1') + ', plus ' + how(t[2], '2') + '. Check that the species you do not want cancel.',
      'Adding reactions multiplies their constants (it never adds them); reversing gives $1/K$, and multiplying an equation by $n$ gives $K^n$.',
      '$K = K_1^{' + t[1] + '} \\times K_2^{' + t[2] + '} = ' + term(Ka, t[1]) + ' \\times ' + term(Kb, t[2]) + ' = ' + fx(Kt, 3) + '$.'
    ], 'Find how each given equation must be flipped or scaled so that they add up to the target.', null, { k: 'ksum', a: S.a, b: S.b, Ka: Ka, Kb: Kb, t: t[0], na: t[1], nb: t[2], ans: Kt });
  });

  var KPC = ['N2(g) + 3H2(g) <=> 2NH3(g)', '2SO2(g) + O2(g) <=> 2SO3(g)', 'N2O4(g) <=> 2NO2(g)', 'PCl5(g) <=> PCl3(g) + Cl2(g)', 'CO(g) + 2H2(g) <=> CH3OH(g)', '2NOCl(g) <=> 2NO(g) + Cl2(g)',
    'CaCO3(s) <=> CaO(s) + CO2(g)', 'C(s) + H2O(g) <=> CO(g) + H2(g)', 'H2(g) + I2(g) <=> 2HI(g)', 'NH4HS(s) <=> NH3(g) + H2S(g)', 'CH4(g) + H2O(g) <=> CO(g) + 3H2(g)', '3Fe(s) + 4H2O(g) <=> Fe3O4(s) + 4H2(g)'];
  // textbook values: [equation, 'c' or 'p', K, T in kelvins]
  var KPCV = [['N2(g) + 3H2(g) <=> 2NH3(g)', 'c', 0.50, 673], ['2SO2(g) + O2(g) <=> 2SO3(g)', 'c', 2.8e2, 1000], ['2SO2(g) + O2(g) <=> 2SO3(g)', 'p', 3.4, 1000],
    ['N2O4(g) <=> 2NO2(g)', 'c', 4.6e-3, 298], ['PCl5(g) <=> PCl3(g) + Cl2(g)', 'p', 1.80, 523], ['PCl5(g) <=> PCl3(g) + Cl2(g)', 'c', 0.042, 523],
    ['CO(g) + 2H2(g) <=> CH3OH(g)', 'c', 14.5, 500], ['2NOCl(g) <=> 2NO(g) + Cl2(g)', 'c', 1.6e-5, 308], ['NH4HS(s) <=> NH3(g) + H2S(g)', 'p', 0.108, 298],
    ['H2(g) + I2(g) <=> 2HI(g)', 'c', 54.3, 703], ['N2(g) + 3H2(g) <=> 2NH3(g)', 'p', 1.6e-4, 673]];

  G('gchem2.kp-kc', function (R, ctx) {
    var kind = lv(ctx, R.pick(['dn', 'dn', 'conv', 'gen']), R.pick(['conv', 'gen', 'dn']), R.pick(['conv', 'gen']));
    if (kind === 'gen') { var a = R.int(1, 3), b = R.int(0, 2), c = R.int(1, 3); if (a + b === c) c++; var sp = [['A', a], ['B', b]].filter(function (x) { return x[1] > 0; });
      var Eg = parseEq(sp.map(function (x) { return (x[1] > 1 ? x[1] : '') + x[0] + '(g)'; }).join(' + ') + ' <=> ' + (c > 1 ? c : '') + 'C(g)'), dng = dnGas(Eg), Tg = R.pick([300, 350, 400, 450, 500, 600, 700, 800, 1000]), Kg = R.pick([1.5, 2.4, 3.6, 4.0, 0.25, 0.60, 12, 45, 0.080]) * M.pow(10, R.int(-2, 2)), RTg = C.RL * Tg, toP = R.coin(), ans = toP ? Kg * M.pow(RTg, dng) : Kg / M.pow(RTg, dng);
      return P('For the gas reaction $' + EQ(Eg.eq) + '$, $K_' + (toP ? 'c' : 'p') + ' = ' + gv(Kg) + '$ at $' + Tg + '\\ \\text{K}$' + (toP ? '' : ' (pressures in atm)') + '. What is $K_' + (toP ? 'p' : 'c') + '$? (Use $R = 0.08206\\ \\text{L·atm/(mol·K)}$.)', num(ans), [dnText(Eg), '$RT = (0.08206)(' + Tg + ') = ' + fx(RTg, 4) + '$.',
        toP ? '$K_p = K_c(RT)^{\\Delta n} = ' + gv(Kg) + ' \\times (' + fx(RTg, 4) + ')^{' + dng + '} = ' + fx(ans, 3) + '$.' : '$K_c = \\dfrac{K_p}{(RT)^{\\Delta n}} = \\dfrac{' + gv(Kg) + '}{(' + fx(RTg, 4) + ')^{' + dng + '}} = ' + fx(ans, 3) + '$.'],
        'Kp = Kc(RT)^Δn, with Δn counting moles of gas.', null, toP ? { k: 'kpkc', eq: Eg.eq, T: Tg, Kc: Kg, ans: ans } : { k: 'kpkc', eq: Eg.eq, T: Tg, Kp: Kg, ans: ans }); }
    if (kind === 'dn') { var E0 = parseEq(R.pick(KPC)), dn0 = dnGas(E0); return P('For $' + EQ(E0.eq) + '$, what is $\\Delta n$ in $K_p = K_c(RT)^{\\Delta n}$?', int(dn0), [dnText(E0), 'Only gases have partial pressures, so only gases enter the conversion.'], 'Count only the moles of gas on each side.', null, { k: 'dn', eq: E0.eq, ans: dn0 }); }
    var B = R.pick(KPCV), E = parseEq(B[0]), dn = dnGas(E), Tk = B[3], Tc = Tk - 273, K = B[2], RT = C.RL * Tk, useC = (ctx.level || 1) >= 3;
    var Tline = useC ? 'at $' + Tc + '^\\circ\\text{C}$' : 'at $' + Tk + '\\ \\text{K}$';
    var Tstep = (useC ? 'Kelvins: $T = ' + Tc + ' + 273 = ' + Tk + '\\ \\text{K}$. ' : '') + '$RT = (0.08206)(' + Tk + ') = ' + fx(RT, 4) + '$.';
    if (B[1] === 'c') { var Kp = K * M.pow(RT, dn);
      return P('For $' + EQ(E.eq) + '$, $K_c = ' + gv(K) + '$ ' + Tline + '. What is $K_p$ at the same temperature (pressures in atm)? (Use $R = 0.08206\\ \\text{L·atm/(mol·K)}$.)', num(Kp), [dnText(E), Tstep,
        '$K_p = K_c(RT)^{\\Delta n} = ' + gv(K) + ' \\times (' + fx(RT, 4) + ')^{' + dn + '} = ' + fx(Kp, 3) + '$.' + (dn === 0 ? ' With $\\Delta n = 0$, $K_p = K_c$.' : '')
      ], 'Kp = Kc(RT)^Δn with R in L·atm/(mol·K) and T in kelvins.', null, { k: 'kpkc', eq: E.eq, Kc: K, T: Tk, ans: Kp }); }
    var Kc = K / M.pow(RT, dn);
    return P('For $' + EQ(E.eq) + '$, $K_p = ' + gv(K) + '$ ' + Tline + ' (pressures in atm). What is $K_c$? (Use $R = 0.08206\\ \\text{L·atm/(mol·K)}$.)', num(Kc), [dnText(E), Tstep,
      '$K_c = \\dfrac{K_p}{(RT)^{\\Delta n}} = \\dfrac{' + gv(K) + '}{(' + fx(RT, 4) + ')^{' + dn + '}} = ' + fx(Kc, 3) + '$.'
    ], 'Rearrange Kp = Kc(RT)^Δn; use kelvins and 0.08206.', null, { k: 'kpkc', eq: E.eq, Kp: K, T: Tk, ans: Kc });
  });
  function dnText(E) {
    var gasP = U.sum(E.p.filter(function (s) { return s.ph === 'g'; }).map(function (s) { return s.n; })), gasR = U.sum(E.r.filter(function (s) { return s.ph === 'g'; }).map(function (s) { return s.n; }));
    return 'Moles of gas: ' + gasP + ' in the products and ' + gasR + ' in the reactants' + (species(E).some(function (s) { return s.ph === 's' || s.ph === 'l'; }) ? ' (solids and liquids do not count)' : '') + ', so $\\Delta n = ' + gasP + ' - ' + gasR + ' = ' + (gasP - gasR) + '$.';
  }

  var DIRS = ['Toward the products (forward)', 'Toward the reactants (reverse)', 'No net change: it is already at equilibrium'];
  G('gchem2.reaction-quotient', function (R, ctx) {
    var kind = lv(ctx, R.pick(['Q', 'dir']), R.pick(['dir', 'dir', 'Q']), R.pick(['dirMol', 'dir']));
    var E = parseEq(R.pick(R.chance(0.3) ? HETERO.filter(function (e) { return e.indexOf('(aq)') < 0; }) : HOMOG)), c, Qv, K, tries = 0;
    do { c = randConc(R, E, E.eq.indexOf('aq') >= 0); Qv = kVal(E, c); tries++; } while ((Qv > 1e6 || Qv < 1e-6) && tries < 30);
    var up = R.coin(); K = sgf(Qv * (up ? R.pick([3, 5, 8, 20, 100]) : R.pick([1 / 3, 1 / 5, 1 / 10, 1 / 50])), 2);
    var dir = Qv < K ? DIRS[0] : DIRS[1];
    var left = species(E).filter(function (sp) { return !inK(sp); });
    var qStep = '$Q = ' + kExpr(E) + ' = ' + kSub(E, c) + ' = ' + fx(Qv, 3) + '$' + (left.length ? ' (solids and liquids are left out).' : '.');
    var dirStep = Qv < K ? '$Q < K$: there is too little product compared with equilibrium, so the reaction runs forward, toward the products, until $Q$ rises to $K$.' : '$Q > K$: there is too much product compared with equilibrium, so the reaction runs in reverse, toward the reactants, until $Q$ falls to $K$.';
    if (kind === 'Q') return P('A mixture for $' + EQ(E.eq) + '$ has ' + concList(E, c) + '. What is the reaction quotient $Q$?', num(Qv), ['$Q$ has the same form as $K$ but uses the concentrations right now, at equilibrium or not.', qStep], 'Same expression as K, filled in with the current concentrations.', null, { k: 'Q', eq: E.eq, c: c, ans: Qv });
    if (kind === 'dir') return P('For $' + EQ(E.eq) + '$, $' + kName(E) + ' = ' + gv(K) + '$ at a certain temperature. A mixture at that temperature has ' + concList(E, c) + '. Which way will the reaction go to reach equilibrium?', mc(dir, DIRS.filter(function (d) { return d !== dir; })), [qStep, 'Compare: $Q = ' + fx(Qv, 3) + '$ and $K = ' + gv(K) + '$.', dirStep], 'Compute Q and compare it with K.', null, { k: 'Qdir', eq: E.eq, c: c, K: K, ans: dir });
    var V = R.pick([2.0, 5.0, 0.50, 10.0, 4.0]), n = {}; species(E).filter(inK).forEach(function (sp) { n[sp.f] = fix(c[sp.f] * V); });
    return P('For $' + EQ(E.eq) + '$, $' + kName(E) + ' = ' + gv(K) + '$ at a certain temperature. A ' + gv(V) + '-liter flask at that temperature holds ' + U.list(species(E).filter(inK).map(function (sp) { return '$' + qv(n[sp.f], 'mol') + '$ of $' + F(sp.f) + '$'; })) + (left.length ? ' (and some $' + F(left[0].f) + '$)' : '') + '. Which way will the reaction go?', mc(dir, DIRS.filter(function (d) { return d !== dir; })), [
      'Change moles to molarities first (divide by $' + gv(V) + '\\ \\text{L}$): ' + concList(E, c) + '.', qStep, 'Compare with $K = ' + gv(K) + '$: ' + dirStep], 'Molarity = moles ÷ liters; then compute Q and compare with K.', null, { k: 'Qdir', eq: E.eq, c: c, K: K, ans: dir });
  });

  // ICE tables: initial concentrations, a change x times each coefficient
  function ice(E, c0, x) { var c = {}; species(E).filter(inK).forEach(function (sp) { c[sp.f] = fix((c0[sp.f] || 0) + coefOf(E, sp.f) * x); }); return c; }
  function iceTable(E, c0, xTex, ceq, n) {
    var sps = species(E).filter(inK);
    function chg(sp) { var v = coefOf(E, sp.f); var m = M.abs(v) === 1 ? '' : M.abs(v); return (v > 0 ? '+' : '−') + m + xTex; }
    return tbl([''].concat(sps.map(function (sp) { return '$' + cc(sp.f) + '$'; })), [
      ['Initial (M)'].concat(sps.map(function (sp) { return gv(c0[sp.f] || 0, 2); })),
      ['Change (M)'].concat(sps.map(chg)),
      ['Equilibrium (M)'].concat(sps.map(function (sp) { return ceq ? fx(ceq[sp.f], n || 3) : c0[sp.f] ? gv(c0[sp.f], 2) + ' ' + chg(sp).replace('−', '− ').replace('+', '+ ') : chg(sp).replace('+', ''); }))]);
  }
  var CALCK = ['N2(g) + 3H2(g) <=> 2NH3(g)', '2SO2(g) + O2(g) <=> 2SO3(g)', 'H2(g) + I2(g) <=> 2HI(g)', 'N2O4(g) <=> 2NO2(g)', 'PCl5(g) <=> PCl3(g) + Cl2(g)', 'CO(g) + 2H2(g) <=> CH3OH(g)',
    'CO(g) + H2O(g) <=> CO2(g) + H2(g)', '2NOCl(g) <=> 2NO(g) + Cl2(g)', 'H2(g) + Br2(g) <=> 2HBr(g)', 'Fe^3+(aq) + SCN^-(aq) <=> FeSCN^2+(aq)'];

  G('gchem2.calculating-k', function (R, ctx) {
    var L = ctx.level || 1, pool = L === 1 ? CALCK.filter(function (e) { var E0 = parseEq(e); return species(E0).every(function (s) { return s.n === 1; }); }) : CALCK;
    var E = parseEq(R.pick(pool)), c0 = {}, fromR = true;
    var startSide = fromR ? E.r : E.p;
    startSide.forEach(function (sp) { c0[sp.f] = R.pick(E.eq.indexOf('aq') >= 0 ? [0.0020, 0.0030, 0.0050, 0.0040] : [0.40, 0.50, 0.60, 0.80, 1.00, 1.20, 2.00]); });
    var lim = M.min.apply(null, startSide.map(function (sp) { return c0[sp.f] / sp.n; })), x = sgf(lim * R.pick([0.2, 0.3, 0.4, 0.5, 0.6]), 2) * (fromR ? 1 : -1);
    var meas = R.pick(E.p.filter(inK)), ceq = ice(E, c0, x), given = sgf(ceq[meas.f], 3);
    var xv = given / coefOf(E, meas.f), ceq2 = ice(E, c0, xv), K = kVal(E, ceq2);
    var V = L >= 3 ? R.pick([2.00, 5.00, 0.500]) : 1;
    var startTxt = L >= 3 ? 'A ' + gv(V) + '-liter flask is filled with ' + U.list(startSide.map(function (sp) { return '$' + qv(fix(c0[sp.f] * V), 'mol', 2) + '$ of $' + F(sp.f) + '$'; })) + ' and nothing else. At equilibrium it holds $' + qv(fix(given * V), 'mol', 3) + '$ of $' + F(meas.f) + '$.'
      : 'A mixture starts with ' + U.list(startSide.map(function (sp) { return '$' + cc(sp.f) + ' = ' + qv(c0[sp.f], 'M', 2) + '$'; })) + ' and none of the other species. At equilibrium $' + cc(meas.f) + ' = ' + qv(given, 'M', 3) + '$.';
    var steps = [];
    if (L >= 3) steps.push('Work in molarity: divide every amount by $' + gv(V) + '\\ \\text{L}$. Start: ' + U.list(startSide.map(function (sp) { return '$' + cc(sp.f) + ' = ' + gv(c0[sp.f], 2) + '\\ \\text{M}$'; })) + '; at equilibrium $' + cc(meas.f) + ' = ' + fx(given, 3) + '\\ \\text{M}$.');
    steps.push('ICE table, with the change written as $x$ times each coefficient:' + iceTable(E, c0, 'x'));
    steps.push('$' + cc(meas.f) + '$ rose from 0 to $' + fx(given, 3) + '\\ \\text{M}$. That change is $' + (coefOf(E, meas.f) === 1 ? '' : coefOf(E, meas.f)) + 'x$, so $x = ' + (coefOf(E, meas.f) === 1 ? '' : '\\dfrac{' + fx(given, 3) + '}{' + coefOf(E, meas.f) + '} = ') + fx(xv, 3) + '\\ \\text{M}$.');
    steps.push('Equilibrium concentrations: ' + U.list(species(E).filter(inK).map(function (sp) { return '$' + cc(sp.f) + ' = ' + fx(ceq2[sp.f], 3) + '$'; })) + '.');
    steps.push('$' + kName(E) + ' = ' + kExpr(E) + ' = ' + kSub(E, ceq2, 3) + ' = ' + fx(K, 3) + '$.');
    return P(startTxt + ' Find $' + kName(E) + '$ for $' + EQ(E.eq) + '$.', num(K), steps, 'Use the one known change to find x, scale it by each coefficient, and put the equilibrium values (not the starting ones) into K.', null, { k: 'calcK', eq: E.eq, c0: c0, meas: meas.f, given: given, ans: K });
  });

  function quad(a, b, c) { var d = b * b - 4 * a * c; return [(-b + M.sqrt(d)) / (2 * a), (-b - M.sqrt(d)) / (2 * a)]; }
  G('gchem2.equilibrium-concentrations', function (R, ctx) {
    var L = ctx.level || 1, E, c0 = {}, K, x, s, ask, steps = [], hint, Ktex = null;
    if (L === 1) {
      var form = R.pick(['HI', 'WGS', 'HIrev']); s = R.pick([4, 5, 6, 7, 8, 9, 10]);
      var c = R.pick([0.10, 0.20, 0.50, 1.00, 0.40, 0.30]);
      if (form === 'HI') { E = parseEq('H2(g) + I2(g) <=> 2HI(g)'); c0 = { H2: c, I2: c }; K = s * s; x = s * c / (2 + s);
        steps = ['ICE: $[\\mathrm{H_2}] = [\\mathrm{I_2}] = ' + gv(c, 2) + ' - x$ and $[\\mathrm{HI}] = 2x$.', '$K = \\dfrac{(2x)^2}{(' + gv(c, 2) + ' - x)^2} = ' + K + '$. Both sides are perfect squares, so take square roots: $\\dfrac{2x}{' + gv(c, 2) + ' - x} = ' + s + '$.', 'Solve: $2x = ' + s + '(' + gv(c, 2) + ' - x)$, so $' + (s + 2) + 'x = ' + fx(s * c, 3) + '$ and $x = ' + fx(x, 3) + '\\ \\text{M}$.'];
      } else if (form === 'WGS') { E = parseEq('CO(g) + H2O(g) <=> CO2(g) + H2(g)'); c0 = { CO: c, H2O: c }; K = s * s; x = s * c / (1 + s);
        steps = ['ICE: $[\\mathrm{CO}] = [\\mathrm{H_2O}] = ' + gv(c, 2) + ' - x$ and $[\\mathrm{CO_2}] = [\\mathrm{H_2}] = x$.', '$K = \\dfrac{x^2}{(' + gv(c, 2) + ' - x)^2} = ' + K + '$. Take square roots: $\\dfrac{x}{' + gv(c, 2) + ' - x} = ' + s + '$.', 'Solve: $x = ' + s + '(' + gv(c, 2) + ' - x)$, so $' + (s + 1) + 'x = ' + fx(s * c, 3) + '$ and $x = ' + fx(x, 3) + '\\ \\text{M}$.'];
      } else { E = parseEq('2HI(g) <=> H2(g) + I2(g)'); c0 = { HI: c }; K = 1 / (s * s); Ktex = '\\tfrac{1}{' + (s * s) + '}'; x = c / (s + 2);
        steps = ['ICE: $[\\mathrm{HI}] = ' + gv(c, 2) + ' - 2x$ and $[\\mathrm{H_2}] = [\\mathrm{I_2}] = x$.', '$K = \\dfrac{x^2}{(' + gv(c, 2) + ' - 2x)^2} = \\dfrac{1}{' + (s * s) + '}$. Take square roots: $\\dfrac{x}{' + gv(c, 2) + ' - 2x} = \\dfrac{1}{' + s + '}$.', 'Solve: $' + s + 'x = ' + gv(c, 2) + ' - 2x$, so $x = \\dfrac{' + gv(c, 2) + '}{' + (s + 2) + '} = ' + fx(x, 3) + '\\ \\text{M}$.'];
      }
      hint = 'Both sides are perfect squares: take the square root first.';
    } else if (L === 2) {
      var f2 = R.pick(['PCl5', 'N2O4', 'NOCl1']), cA = R.pick([0.10, 0.20, 0.25, 0.40, 0.50, 1.00]);
      K = R.pick([0.040, 0.050, 0.10, 0.25, 0.50, 0.80, 1.2]);
      if (f2 === 'PCl5') { E = parseEq('PCl5(g) <=> PCl3(g) + Cl2(g)'); c0 = { PCl5: cA }; x = quad(1, K, -K * cA)[0];
        steps = ['ICE: $[\\mathrm{PCl_5}] = ' + gv(cA, 2) + ' - x$, $[\\mathrm{PCl_3}] = [\\mathrm{Cl_2}] = x$.', '$K = \\dfrac{x^2}{' + gv(cA, 2) + ' - x} = ' + gv(K) + '$, so $x^2 + ' + gv(K) + 'x - ' + fx(K * cA, 3) + ' = 0$.',
          'Quadratic formula: $x = \\dfrac{-' + gv(K) + ' \\pm \\sqrt{' + gv(K) + '^2 + 4(' + fx(K * cA, 3) + ')}}{2}$, giving $x = ' + fx(x, 3) + '$ or $x = ' + fx(quad(1, K, -K * cA)[1], 3) + '$.', 'A negative $x$ would make $[\\mathrm{PCl_3}]$ negative, so keep $x = ' + fx(x, 3) + '\\ \\text{M}$.'];
      } else if (f2 === 'N2O4') { E = parseEq('N2O4(g) <=> 2NO2(g)'); c0 = { N2O4: cA }; x = quad(4, K, -K * cA)[0];
        steps = ['ICE: $[\\mathrm{N_2O_4}] = ' + gv(cA, 2) + ' - x$, $[\\mathrm{NO_2}] = 2x$.', '$K = \\dfrac{(2x)^2}{' + gv(cA, 2) + ' - x} = ' + gv(K) + '$, so $4x^2 + ' + gv(K) + 'x - ' + fx(K * cA, 3) + ' = 0$.',
          'Quadratic formula: $x = \\dfrac{-' + gv(K) + ' \\pm \\sqrt{' + gv(K) + '^2 + 16(' + fx(K * cA, 3) + ')}}{8}$, giving $x = ' + fx(x, 3) + '$ or $x = ' + fx(quad(4, K, -K * cA)[1], 3) + '$.', 'Only the positive root keeps every concentration positive: $x = ' + fx(x, 3) + '\\ \\text{M}$.'];
      } else { E = parseEq('NOCl(g) <=> NO(g) + 1/2Cl2(g)'); E = parseEq('A(g) <=> B(g) + C(g)'); c0 = { A: cA }; x = quad(1, K, -K * cA)[0];
        steps = ['ICE: $[\\mathrm{A}] = ' + gv(cA, 2) + ' - x$, $[\\mathrm{B}] = [\\mathrm{C}] = x$.', '$K = \\dfrac{x^2}{' + gv(cA, 2) + ' - x} = ' + gv(K) + '$, so $x^2 + ' + gv(K) + 'x - ' + fx(K * cA, 3) + ' = 0$.',
          'Quadratic formula: $x = ' + fx(x, 3) + '$ or $x = ' + fx(quad(1, K, -K * cA)[1], 3) + '$; keep the positive root, $x = ' + fx(x, 3) + '\\ \\text{M}$.'];
      }
      hint = 'Set up the ICE table, write K in terms of x, and solve the quadratic; keep the root that makes sense.';
    } else {
      var f3 = R.pick(['WGS', 'HI']), a = R.pick([0.20, 0.40, 0.50, 1.00]), b = R.pick([0.30, 0.60, 0.80, 1.50]);
      if (a === b) b = a * 2;
      if (f3 === 'WGS') { E = parseEq('CO(g) + H2O(g) <=> CO2(g) + H2(g)'); c0 = { CO: a, H2O: b }; K = R.pick([0.64, 1.6, 2.5, 4.0, 5.0]);
        var A2 = 1 - K, B2 = K * (a + b), C2 = -K * a * b, rr = M.abs(A2) < 1e-12 ? [-C2 / B2, NaN] : quad(A2, B2, C2); x = rr.filter(function (r) { return r > 0 && r < M.min(a, b); })[0];
        steps = ['ICE: $[\\mathrm{CO}] = ' + gv(a, 2) + ' - x$, $[\\mathrm{H_2O}] = ' + gv(b, 2) + ' - x$, $[\\mathrm{CO_2}] = [\\mathrm{H_2}] = x$.',
          '$K = \\dfrac{x^2}{(' + gv(a, 2) + ' - x)(' + gv(b, 2) + ' - x)} = ' + gv(K) + '$. Multiply out: $' + fx(A2, 3) + 'x^2 + ' + fx(B2, 3) + 'x ' + (C2 < 0 ? '- ' : '+ ') + fx(M.abs(C2), 3) + ' = 0$.',
          'The two roots are $' + fx(rr[0], 3) + '$ and $' + fx(rr[1], 3) + '$. Only one lies between 0 and ' + gv(M.min(a, b), 2) + ' (a larger $x$ would use up more CO or water than there is): $x = ' + fx(x, 3) + '\\ \\text{M}$.'];
      } else { E = parseEq('H2(g) + I2(g) <=> 2HI(g)'); c0 = { H2: a, I2: b }; K = R.pick([50, 54, 64, 25]);
        var A3 = 4 - K, B3 = K * (a + b), C3 = -K * a * b, r3 = quad(A3, B3, C3); x = r3.filter(function (r) { return r > 0 && r < M.min(a, b); })[0];
        steps = ['ICE: $[\\mathrm{H_2}] = ' + gv(a, 2) + ' - x$, $[\\mathrm{I_2}] = ' + gv(b, 2) + ' - x$, $[\\mathrm{HI}] = 2x$.',
          '$K = \\dfrac{4x^2}{(' + gv(a, 2) + ' - x)(' + gv(b, 2) + ' - x)} = ' + K + '$. Multiply out: $' + fx(A3, 3) + 'x^2 + ' + fx(B3, 3) + 'x - ' + fx(-C3, 3) + ' = 0$.',
          'The two roots are $' + fx(r3[0], 3) + '$ and $' + fx(r3[1], 3) + '$. Only one lies between 0 and ' + gv(M.min(a, b), 2) + ': $x = ' + fx(x, 3) + '\\ \\text{M}$. The other would make a concentration negative.'];
      }
      hint = 'Expand into a quadratic, solve, and keep only the root between 0 and the smaller starting concentration.';
    }
    var ceq = ice(E, c0, x), sps = species(E).filter(inK); ask = R.pick(sps);
    steps.push('So ' + U.list(sps.map(function (sp) { return '$' + cc(sp.f) + ' = ' + fx(ceq[sp.f], 3) + '\\ \\text{M}$'; })) + '. Check: $' + kSub(E, ceq, 3) + ' \\approx ' + fx(kVal(E, ceq), 3) + '$, which matches $K$.');
    var startT = U.list(Object.keys(c0).map(function (f) { return '$' + cc(f) + ' = ' + qv(c0[f], 'M', 2) + '$'; }));
    return P('For $' + EQ(E.eq) + '$, $K = ' + (Ktex || gv(K)) + '$ at a certain temperature. A mixture starts with ' + startT + ' and none of the other species. What is $' + cc(ask.f) + '$ at equilibrium?' + (L >= 2 ? ' (Use a calculator.)' : ''), num(ceq[ask.f]), steps, hint, 'M', { k: 'eqc', eq: E.eq, c0: c0, K: K, ask: ask.f, ans: ceq[ask.f] });
  });

  G('gchem2.small-x', function (R, ctx) {
    var kind = lv(ctx, R.pick(['pcl5', 'no']), R.pick(['nocl', 'pcl5', 'no', 'pct']), R.pick(['valid', 'nocl', 'h2o']));
    var c = R.pick([0.10, 0.20, 0.25, 0.50, 0.80, 1.0, 1.5]);
    if (kind === 'pcl5' || kind === 'pct' || kind === 'valid') {
      var K = kind === 'valid' ? R.pick([R.pick([1.0e-6, 4.0e-5, 2.5e-6, 1.0e-5]), R.pick([0.020, 0.045, 0.10, 0.0080])]) : R.pick([1.0e-6, 2.5e-6, 4.0e-6, 1.6e-5, 3.6e-5, 9.0e-6]);
      var xa = M.sqrt(K * c), pct = xa / c * 100, sp = R.pick(['PCl3', 'Cl2']);
      var E = parseEq('PCl5(g) <=> PCl3(g) + Cl2(g)'), steps = ['ICE: $[\\mathrm{PCl_5}] = ' + gv(c, 2) + ' - x$, $[\\mathrm{PCl_3}] = [\\mathrm{Cl_2}] = x$, so $K = \\dfrac{x^2}{' + gv(c, 2) + ' - x}$.',
        '$K$ is tiny, so assume $x \\ll ' + gv(c, 2) + '$ and write $' + gv(c, 2) + ' - x \\approx ' + gv(c, 2) + '$: $\\dfrac{x^2}{' + gv(c, 2) + '} = ' + gv(K) + '$.',
        '$x = \\sqrt{(' + gv(K) + ')(' + gv(c, 2) + ')} = ' + fx(xa, 3) + '\\ \\text{M}$.',
        'Check: $\\dfrac{x}{' + gv(c, 2) + '} \\times 100\\% = ' + fx(pct, 2) + '\\%$, ' + (pct < 5 ? 'under 5%, so dropping $x$ was fine.' : 'more than 5%, so the approximation fails: solve the quadratic instead.')];
      if (kind === 'valid') { if (M.abs(pct - 5) < 1.5) { K = 1.0e-6; xa = M.sqrt(K * c); pct = xa / c * 100; }
        steps = ['ICE: $[\\mathrm{PCl_5}] = ' + gv(c, 2) + ' - x$, $[\\mathrm{PCl_3}] = [\\mathrm{Cl_2}] = x$, so $K = \\dfrac{x^2}{' + gv(c, 2) + ' - x}$.',
          'Try the approximation: $x \\approx \\sqrt{K \\times ' + gv(c, 2) + '} = \\sqrt{(' + gv(K) + ')(' + gv(c, 2) + ')} = ' + fx(xa, 3) + '\\ \\text{M}$.',
          'Check: $' + fx(xa, 3) + '/' + gv(c, 2) + ' = ' + fx(pct, 2) + '\\%$ of the starting amount. ' + (pct < 5 ? 'That is under 5%, so the approximation holds.' : 'That is more than 5%, so the approximation does not hold; use the quadratic formula.')];
        return P('For $' + EQ(E.eq) + '$, $K = ' + gv(K) + '$ at a certain temperature, and $[\\mathrm{PCl_5}]_0 = ' + qv(c, 'M', 2) + '$. True or false: you may solve for $x$ by treating $' + gv(c, 2) + ' - x$ as $' + gv(c, 2) + '$ (the 5% rule holds).', tf(pct < 5), steps, 'Make the approximation, then check x as a percent of the starting concentration.', null, { k: 'sxvalid', K: K, c: c, ans: pct < 5 }); }
      if (kind === 'pct') return P('For $' + EQ(E.eq) + '$, $K = ' + gv(K) + '$ at a certain temperature. Starting with $[\\mathrm{PCl_5}] = ' + qv(c, 'M', 2) + '$ and nothing else, use the small-$x$ approximation to find what percent of the $\\mathrm{PCl_5}$ decomposes.', { t: 'num', v: sfStr(pct, 2), rtol: 0.04, pct: true }, steps, 'x/[A]₀ × 100%, with x from the approximation.', '%', { k: 'sxpct', K: K, c: c, ans: pct });
      return P('For $' + EQ(E.eq) + '$, $K = ' + gv(K) + '$ at a certain temperature. A flask starts with $[\\mathrm{PCl_5}] = ' + qv(c, 'M', 2) + '$ and nothing else. Use the small-$x$ approximation to find $' + cc(sp) + '$ at equilibrium.', num(xa, 3, 0.03), steps, 'K is tiny: drop x where it is subtracted from the starting concentration, then check the 5% rule.', 'M', { k: 'sx', eq: E.eq, c0: { PCl5: c }, K: K, ask: sp, ans: xa });
    }
    if (kind === 'no') {
      var K2 = R.pick([1.0e-10, 4.0e-8, 2.5e-9, 1.6e-7, 9.0e-6, 3.6e-9]), E2 = parseEq('N2(g) + O2(g) <=> 2NO(g)'), NO = c * M.sqrt(K2);
      return P('For $' + EQ(E2.eq) + '$, $K = ' + gv(K2) + '$ at a certain high temperature. A mixture starts with $[\\mathrm{N_2}] = [\\mathrm{O_2}] = ' + qv(c, 'M', 2) + '$ and no NO. Use the small-$x$ approximation to find $[\\mathrm{NO}]$ at equilibrium.', num(NO, 3, 0.03), [
        'ICE: $[\\mathrm{N_2}] = [\\mathrm{O_2}] = ' + gv(c, 2) + ' - x$, $[\\mathrm{NO}] = 2x$. So $K = \\dfrac{(2x)^2}{(' + gv(c, 2) + ' - x)^2}$.',
        '$K$ is tiny, so $' + gv(c, 2) + ' - x \\approx ' + gv(c, 2) + '$: $\\dfrac{4x^2}{' + fx(c * c, 3) + '} = ' + gv(K2) + '$.',
        'Then $2x = ' + gv(c, 2) + '\\sqrt{K} = ' + gv(c, 2) + '\\sqrt{' + gv(K2) + '} = ' + fx(NO, 3) + '\\ \\text{M}$, so $[\\mathrm{NO}] = ' + q(NO, 'M') + '$.',
        'Check: $x = ' + fx(NO / 2, 3) + '$ is far below 5% of ' + gv(c, 2) + ', so the approximation holds.'
      ], 'Drop x next to the starting concentrations; then [NO] = 2x.', 'M', { k: 'sx', eq: E2.eq, c0: { N2: c, O2: c }, K: K2, ask: 'NO', ans: NO });
    }
    var hw = kind === 'h2o', E3 = parseEq(hw ? '2H2O(g) <=> 2H2(g) + O2(g)' : '2NOCl(g) <=> 2NO(g) + Cl2(g)'), K3 = R.pick([1.0e-9, 4.0e-10, 2.0e-8, 5.0e-11, 3.2e-12]);
    var xx = M.cbrt(K3 * c * c / 4), A = hw ? 'H2O' : 'NOCl', B = hw ? 'H2' : 'NO', Cc = hw ? 'O2' : 'Cl2', askB = R.coin(), ansV = askB ? 2 * xx : xx;
    return P('For $' + EQ(E3.eq) + '$, $K = ' + gv(K3) + '$ at a certain temperature. A flask starts with $' + cc(A) + ' = ' + qv(c, 'M', 2) + '$ and nothing else. Use the small-$x$ approximation to find $' + cc(askB ? B : Cc) + '$ at equilibrium. (Use a calculator.)', num(ansV, 3, 0.03), [
      'ICE: $' + cc(A) + ' = ' + gv(c, 2) + ' - 2x$, $' + cc(B) + ' = 2x$, $' + cc(Cc) + ' = x$. So $K = \\dfrac{(2x)^2 x}{(' + gv(c, 2) + ' - 2x)^2}$, a cubic.',
      '$K$ is tiny, so $' + gv(c, 2) + ' - 2x \\approx ' + gv(c, 2) + '$: $\\dfrac{4x^3}{' + fx(c * c, 3) + '} = ' + gv(K3) + '$, and $x^3 = \\dfrac{(' + gv(K3) + ')(' + fx(c * c, 3) + ')}{4} = ' + fx(xx * xx * xx, 3) + '$.',
      '$x = ' + fx(xx, 3) + '\\ \\text{M}$' + (askB ? ', so $' + cc(B) + ' = 2x = ' + q(2 * xx, 'M') + '$.' : ' $= ' + cc(Cc) + '$.'),
      'Check: $2x$ is ' + fx(200 * xx / c, 2) + '% of ' + gv(c, 2) + ' M, well under 5%. Without the approximation you would face a cubic equation.'
    ], 'Drop 2x next to the starting concentration; that turns a cubic into x³ = (something).', 'M', { k: 'sx', eq: E3.eq, c0: (function () { var o = {}; o[A] = c; return o; })(), K: K3, ask: askB ? B : Cc, ans: ansV });
  });

  var LCQ = [['N2(g) + 3H2(g) <=> 2NH3(g)', -92], ['2SO2(g) + O2(g) <=> 2SO3(g)', -198], ['N2O4(g) <=> 2NO2(g)', 57], ['PCl5(g) <=> PCl3(g) + Cl2(g)', 88], ['CO(g) + 2H2(g) <=> CH3OH(g)', -91],
    ['2NO(g) + O2(g) <=> 2NO2(g)', -114], ['CO(g) + H2O(g) <=> CO2(g) + H2(g)', -41], ['CaCO3(s) <=> CaO(s) + CO2(g)', 178], ['H2(g) + I2(g) <=> 2HI(g)', -9.4], ['2NOCl(g) <=> 2NO(g) + Cl2(g)', 77]];
  G('gchem2.le-chatelier-quantitative', function (R, ctx) {
    var kind = lv(ctx, R.pick(['temp', 'inert', 'add', 'kconst']), R.pick(['add', 'vol', 'temp', 'addQ']), R.pick(['volQ', 'vol', 'addQ', 'inertP']));
    var B = R.pick(kind === 'vol' || kind === 'volQ' || kind === 'inertP' ? LCQ.filter(function (x) { return dnGas(parseEq(x[0])) !== 0; }) : LCQ), E = parseEq(B[0]), dH = B[1], dn = dnGas(E);
    if (kind === 'temp') { var up = R.coin(), Kup = (dH > 0) === up, dir = Kup ? DIRS[0] : DIRS[1];
      var opts = ['$K$ ' + (Kup ? 'increases' : 'decreases') + ', and the reaction shifts ' + (Kup ? 'toward the products' : 'toward the reactants'), '$K$ stays the same, and the reaction shifts ' + (Kup ? 'toward the products' : 'toward the reactants'), '$K$ ' + (Kup ? 'decreases' : 'increases') + ', and the reaction shifts ' + (Kup ? 'toward the reactants' : 'toward the products'), '$K$ stays the same, and nothing shifts'];
      return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(dH) + '\\ \\text{kJ/mol}$. The equilibrium mixture is ' + (up ? 'heated' : 'cooled') + ' at constant volume. What happens?', mc(opts[0], opts.slice(1)), [
        'A temperature change is the only change that alters $K$ itself.',
        (dH < 0 ? 'The forward reaction is exothermic: think of heat as a product.' : 'The forward reaction is endothermic: think of heat as a reactant.') + ' ' + (up ? 'Adding heat' : 'Removing heat') + ' favors the ' + (Kup ? 'forward' : 'reverse') + ' reaction, so $K$ ' + (Kup ? 'grows' : 'shrinks') + '.',
        'Right after the change $Q$ still has its old value, so now $Q ' + (Kup ? '<' : '>') + ' K$ and the mixture shifts ' + (Kup ? 'toward the products' : 'toward the reactants') + '.'
      ], 'Treat heat as a product of an exothermic reaction (or a reactant of an endothermic one).', null, { k: 'lctemp', dH: dH, up: up, ans: opts[0] }); }
    if (kind === 'inert' || kind === 'kconst') {
      if (kind === 'kconst') { if (!E.r.filter(inK).length) E = parseEq(LCQ[0][0]); var addF = R.pick(E.r.filter(inK)).f; return P('For $' + EQ(E.eq) + '$ at equilibrium, more $' + F(addF) + '$ is added at constant temperature. True or false: the value of $K$ changes.', tf(false), [
        'Adding a reactant raises the denominator of $Q$, so $Q$ drops below $K$ and the reaction shifts forward until $Q = K$ again.',
        'The equilibrium amounts change, but $K$ is the same number before and after. Only a temperature change alters $K$.'], 'Which quantity moves away from K when a concentration changes: Q or K?', null, { k: 'lck', ans: false }); }
      var which = R.pick(['inert', 'cat']), opt0 = 'No shift: $Q$ still equals $K$';
      return P('For $' + EQ(E.eq) + '$ at equilibrium in a rigid container, ' + (which === 'inert' ? 'argon gas is added at constant volume and temperature' : 'a catalyst is added') + '. Which way does the equilibrium shift?', mc(opt0, ['Toward the products', 'Toward the reactants', 'Toward the side with more moles of gas']), [
        which === 'inert' ? 'Argon does not react. At constant volume it raises the total pressure but leaves every reacting gas\u2019s concentration and partial pressure unchanged.' : 'A catalyst speeds up the forward and reverse reactions by the same factor; it does not change any concentration or $K$.',
        'So $Q$ is unchanged and still equals $K$: nothing shifts.'
      ], 'Did any concentration in Q change?', null, { k: 'lcinert', ans: opt0 }); }
    if (kind === 'inertP') { var more = dn > 0 ? DIRS[0] : DIRS[1];
      return P('For $' + EQ(E.eq) + '$ at equilibrium, argon is added while the <i>total pressure</i> is held constant, so the container expands. Which way does the equilibrium shift?', mc(more, DIRS.filter(function (d) { return d !== more; })), [
        'To keep the pressure constant, the volume must grow. That dilutes every reacting gas by the same factor $f < 1$.',
        'Then $Q$ is multiplied by $f^{\\Delta n}$ with $\\Delta n = ' + dn + '$, so $Q ' + (dn > 0 ? '<' : '>') + ' K$.',
        'The mixture shifts ' + (dn > 0 ? 'forward, toward the side with more moles of gas.' : 'in reverse, toward the side with more moles of gas.') + ' (At constant volume, by contrast, adding argon shifts nothing.)'
      ], 'At constant pressure, adding argon is like expanding the container.', null, { k: 'lcinertP', dn: dn, ans: more }); }
    var K = R.pick([0.25, 0.50, 2.0, 4.0, 1.6, 0.80]);
    if (kind === 'vol' || kind === 'volQ') { var halve = R.coin(), f = halve ? 2 : 0.5, Qn = K * M.pow(f, dn), dir2 = Qn < K ? DIRS[0] : DIRS[1];
      var st = ['Every gas concentration is multiplied by ' + (halve ? '2' : '½') + ' when the volume is ' + (halve ? 'halved' : 'doubled') + ' (solids are unaffected).',
        '$Q$ is multiplied by $' + (halve ? '2' : '(\\tfrac{1}{2})') + '^{\\Delta n}$, with $\\Delta n = ' + dn + '$ (moles of gas in products minus reactants): $Q = ' + gv(K) + ' \\times ' + (halve ? '2' : '(\\tfrac{1}{2})') + '^{' + dn + '} = ' + fx(Qn, 3) + '$.',
        '$Q ' + (Qn < K ? '<' : '>') + ' K$, so the reaction shifts ' + (Qn < K ? 'toward the products' : 'toward the reactants') + ': ' + (halve ? 'toward fewer moles of gas, as Le Chatelier predicts for a squeeze.' : 'toward more moles of gas, as Le Chatelier predicts for an expansion.')];
      if (kind === 'volQ') return P('For $' + EQ(E.eq) + '$, $K_c = ' + gv(K) + '$ at a certain temperature. A mixture at equilibrium is suddenly ' + (halve ? 'squeezed to half its volume' : 'expanded to twice its volume') + ' at constant temperature. What is $Q_c$ right after the change?', num(Qn), st, 'Every gas concentration changes by the same factor; raise it to Δn.', null, { k: 'lcvol', eq: E.eq, K: K, f: f, ans: Qn });
      return P('For $' + EQ(E.eq) + '$, $K_c = ' + gv(K) + '$ at a certain temperature. A mixture at equilibrium is suddenly ' + (halve ? 'squeezed to half its volume' : 'expanded to twice its volume') + ' at constant temperature. Which way does it shift?', mc(dir2, DIRS.filter(function (d) { return d !== dir2; })), st, 'Find what the volume change does to Q.', null, { k: 'lcvoldir', eq: E.eq, K: K, f: f, ans: dir2 }); }
    // add or remove a species: concentrations consistent with K first
    var Eh = parseEq(R.pick(HOMO.filter(function (e) { return e.indexOf('aq') < 0; }))), c = {}, sps = species(Eh).filter(inK), last = sps[sps.length - 1], tries = 0;
    do { sps.forEach(function (sp) { c[sp.f] = R.pick([0.20, 0.25, 0.40, 0.50, 0.80, 1.0]); }); var rest = kVal(Eh, c) / M.pow(c[last.f], last.n); c[last.f] = sgf(M.pow(K / rest, 1 / last.n), 3); tries++; } while ((c[last.f] > 5 || c[last.f] < 0.02) && tries < 50);
    var Ktrue = kVal(Eh, c), spx = R.pick(sps), addAmt = R.pick([0.20, 0.30, 0.50]), add = R.coin() || c[spx.f] <= addAmt, c2 = {}; sps.forEach(function (sp) { c2[sp.f] = c[sp.f]; });
    c2[spx.f] = fix(c[spx.f] + (add ? addAmt : -addAmt)); var Q2 = kVal(Eh, c2), dir3 = Q2 < Ktrue ? DIRS[0] : DIRS[1];
    var stp = ['Before the change the mixture is at equilibrium: $' + kSub(Eh, c, 3) + ' = ' + fx(Ktrue, 3) + ' = K$.',
      'Right after ' + (add ? 'adding' : 'removing') + ' $' + gv(addAmt) + '\\ \\text{M}$ of $' + F(spx.f) + '$, $' + cc(spx.f) + ' = ' + fx(c2[spx.f], 3) + '\\ \\text{M}$ and $Q = ' + kSub(Eh, c2, 3) + ' = ' + fx(Q2, 3) + '$.',
      '$Q ' + (Q2 < Ktrue ? '<' : '>') + ' K$, so the reaction shifts ' + (Q2 < Ktrue ? 'forward, toward the products' : 'in reverse, toward the reactants') + '. $K$ itself has not changed.'];
    var qtxt = 'For $' + EQ(Eh.eq) + '$ at a certain temperature, an equilibrium mixture has ' + concList(Eh, c, 3) + '. Then $' + F(spx.f) + '$ is suddenly ' + (add ? 'added' : 'removed') + ' so that its concentration ' + (add ? 'rises' : 'falls') + ' by $' + qv(addAmt, 'M') + '$. ';
    if (kind === 'addQ') return P(qtxt + 'What is $Q$ right after the change?', num(Q2), stp, 'Find K from the equilibrium values, then recompute Q with the new concentration.', null, { k: 'lcadd', eq: Eh.eq, c: c, sp: spx.f, d: add ? addAmt : -addAmt, ans: Q2 });
    return P(qtxt + 'Which way does the reaction shift?', mc(dir3, DIRS.filter(function (d) { return d !== dir3; })), stp, 'Compare the new Q with K.', null, { k: 'lcadddir', eq: Eh.eq, c: c, sp: spx.f, d: add ? addAmt : -addAmt, ans: dir3 });
  });


  // ================================================================== Unit 3: Acids and Bases
  var ACID = {
    CH3COOH: { name: 'acetic acid', Ka: 1.8e-5, base: 'CH3COO^-', alt: ['CH3COO^-', 'C2H3O2^-', 'CH3CO2^-'], aAlt: ['CH3COOH', 'HC2H3O2', 'CH3CO2H'], salt: 'NaCH3COO', saltName: 'sodium acetate', Ms: 82.04 },
    HCOOH: { name: 'formic acid', Ka: 1.8e-4, base: 'HCOO^-', alt: ['HCOO^-', 'HCO2^-', 'CHO2^-'], aAlt: ['HCOOH', 'HCO2H', 'HCHO2'], salt: 'NaHCOO', saltName: 'sodium formate', Ms: 68.01 },
    C6H5COOH: { name: 'benzoic acid', Ka: 6.3e-5, base: 'C6H5COO^-', alt: ['C6H5COO^-', 'C6H5CO2^-', 'C7H5O2^-'], aAlt: ['C6H5COOH', 'C6H5CO2H', 'HC7H5O2'], salt: 'NaC6H5COO', saltName: 'sodium benzoate', Ms: 144.11 },
    HF: { name: 'hydrofluoric acid', Ka: 6.8e-4, base: 'F^-', alt: ['F^-'], aAlt: ['HF'], salt: 'NaF', saltName: 'sodium fluoride', Ms: 41.99 },
    HNO2: { name: 'nitrous acid', Ka: 5.6e-4, base: 'NO2^-', alt: ['NO2^-'], aAlt: ['HNO2'], salt: 'NaNO2', saltName: 'sodium nitrite', Ms: 69.00 },
    HOCl: { name: 'hypochlorous acid', Ka: 2.9e-8, base: 'OCl^-', alt: ['OCl^-', 'ClO^-'], aAlt: ['HOCl', 'HClO'], salt: 'NaOCl', saltName: 'sodium hypochlorite', Ms: 74.44 },
    HCN: { name: 'hydrocyanic acid', Ka: 4.9e-10, base: 'CN^-', alt: ['CN^-'], aAlt: ['HCN'], salt: 'NaCN', saltName: 'sodium cyanide', Ms: 49.01 },
    CH3CH2COOH: { name: 'propanoic acid', Ka: 1.3e-5, base: 'CH3CH2COO^-', alt: ['CH3CH2COO^-', 'C2H5COO^-', 'C3H5O2^-'], aAlt: ['CH3CH2COOH', 'C2H5COOH', 'HC3H5O2'], salt: 'NaCH3CH2COO', saltName: 'sodium propanoate' }
  };
  var BASE = {
    NH3: { name: 'ammonia', Kb: 1.8e-5, acid: 'NH4^+', alt: ['NH4^+'], salt: 'NH4Cl', saltName: 'ammonium chloride', Ms: 53.50 },
    CH3NH2: { name: 'methylamine', Kb: 4.4e-4, acid: 'CH3NH3^+', alt: ['CH3NH3^+'], salt: 'CH3NH3Cl', saltName: 'methylammonium chloride' },
    N2H4: { name: 'hydrazine', Kb: 1.3e-6, acid: 'N2H5^+', alt: ['N2H5^+'], salt: 'N2H5Cl', saltName: 'hydrazinium chloride' },
    '(CH3)2NH': { name: 'dimethylamine', Kb: 5.4e-4, acid: '(CH3)2NH2^+', alt: ['(CH3)2NH2^+'], salt: '(CH3)2NH2Cl', saltName: 'dimethylammonium chloride' },
    C5H5N: { name: 'pyridine', Kb: 1.7e-9, acid: 'C5H5NH^+', alt: ['C5H5NH^+'], salt: 'C5H5NHCl', saltName: 'pyridinium chloride' },
    '(CH3)3N': { name: 'trimethylamine', Kb: 6.3e-5, acid: '(CH3)3NH^+', alt: ['(CH3)3NH^+'], salt: '(CH3)3NHCl', saltName: 'trimethylammonium chloride' }
  };
  var STRONG_A = ['HCl', 'HBr', 'HI', 'HNO3', 'HClO4'], STRONG_B = [['NaOH', 1], ['KOH', 1], ['LiOH', 1], ['Ba(OH)2', 2], ['Sr(OH)2', 2]];
  function pHq(x) { return '\\text{pH} = -\\log(' + fx(x, 3) + ') = ' + d2(-log10(x)); }
  function acidKey(R, filt) { var ks = Object.keys(ACID).filter(filt || function () { return true; }); return R.pick(ks); }
  function concPick(R, list) { return R.pick(list || [0.050, 0.10, 0.20, 0.25, 0.15, 0.010, 0.020]); }
  function mantissa(R) { return R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0]); }

  G('gchem2.strong-acid-ph', function (R, ctx) {
    var kind = lv(ctx, R.pick(['acid', 'base', 'conc']), R.pick(['acid', 'base2', 'base', 'conc', 'oh']), R.pick(['base2', 'warm', 'oh', 'acid']));
    if (kind === 'acid') { var a = R.pick(STRONG_A), C1 = mantissa(R) * M.pow(10, -R.int(1, 4)), pH = -log10(C1);
      return P('What is the pH of $' + qv(C1, 'M') + '$ $' + F(a) + '$? (Use a calculator.)', phA(pH), [
        '$' + F(a) + '$ is a strong acid: it gives up all its protons, so $[\\mathrm{H_3O^+}] = ' + qv(C1, 'M') + '$.',
        '$' + pHq(C1) + '$. (Two significant figures in the concentration give two decimal places in the pH.)'
      ], 'pH = −log[H₃O⁺], and a strong acid ionizes completely.', null, { k: 'sa', C: C1, ans: pH }); }
    if (kind === 'base' || kind === 'base2') { var b = kind === 'base2' ? R.pick(STRONG_B.filter(function (x) { return x[1] === 2; })) : R.pick(STRONG_B.filter(function (x) { return x[1] === 1; }));
      var C2 = mantissa(R) * M.pow(10, -R.int(2, 4)), OH = b[1] * C2, pOH = -log10(OH), pH2 = 14 - pOH;
      return P('What is the pH of $' + qv(C2, 'M') + '$ $' + F(b[0]) + '$ at 25 °C? (Use a calculator.)', phA(pH2), [
        '$' + F(b[0]) + '$ is a strong base' + (b[1] === 2 ? ' that releases two $\\mathrm{OH^-}$ per formula unit: $[\\mathrm{OH^-}] = 2 \\times ' + gv(C2) + ' = ' + q(OH, 'M') + '$.' : ': $[\\mathrm{OH^-}] = ' + qv(C2, 'M') + '$.'),
        '$\\text{pOH} = -\\log(' + fx(OH, 3) + ') = ' + d2(pOH) + '$.',
        '$\\text{pH} = 14.00 - \\text{pOH} = ' + d2(pH2) + '$ (at 25 °C, where $K_w = 1.0 \\times 10^{-14}$).'
      ], b[1] === 2 ? 'Count the hydroxide ions per formula unit; then pOH, then pH.' : 'Find pOH from [OH⁻], then pH = 14.00 − pOH.', null, { k: 'sb', C: C2, n: b[1], ans: pH2 }); }
    if (kind === 'conc' || kind === 'oh') { var pH3 = R.pick([2.35, 3.70, 4.12, 5.55, 9.25, 10.80, 11.60, 12.40, 1.85, 8.30]), H = M.pow(10, -pH3), OH2 = 1e-14 / H;
      if (kind === 'conc') return P('A solution has $\\text{pH} = ' + pH3.toFixed(2) + '$. What is $[\\mathrm{H_3O^+}]$? (Use a calculator.)', num(H, 2, 0.03), [
        'Undo the log: $[\\mathrm{H_3O^+}] = 10^{-\\text{pH}} = 10^{-' + pH3.toFixed(2) + '}$.', '$[\\mathrm{H_3O^+}] = ' + q(H, 'M', 2) + '$ (two decimal places in the pH give two significant figures).'
      ], 'Raise 10 to the power −pH.', 'M', { k: 'h', pH: pH3, ans: H });
      return P('A solution at 25 °C has $\\text{pH} = ' + pH3.toFixed(2) + '$. What is $[\\mathrm{OH^-}]$? (Use a calculator.)', num(OH2, 2, 0.03), [
        '$\\text{pOH} = 14.00 - ' + pH3.toFixed(2) + ' = ' + (14 - pH3).toFixed(2) + '$.', '$[\\mathrm{OH^-}] = 10^{-' + (14 - pH3).toFixed(2) + '} = ' + q(OH2, 'M', 2) + '$. (Or divide $K_w$ by $[\\mathrm{H_3O^+}]$.)'
      ], 'Find pOH first, then undo the log.', 'M', { k: 'oh', pH: pH3, ans: OH2 }); }
    var W = R.pick([[0, 1.1e-15], [37, 2.4e-14], [50, 5.5e-14], [100, 5.1e-13]]), pHn = -0.5 * log10(W[1]);
    return P('At $' + W[0] + '^\\circ\\text{C}$, $K_w$ is about $' + gv(W[1]) + '$. What is the pH of pure, neutral water at this temperature?', phA(pHn), [
      'In pure water every $\\mathrm{H_3O^+}$ comes with one $\\mathrm{OH^-}$, so $[\\mathrm{H_3O^+}] = [\\mathrm{OH^-}] = \\sqrt{K_w}$.',
      '$[\\mathrm{H_3O^+}] = \\sqrt{' + gv(W[1]) + '} = ' + fx(M.sqrt(W[1]), 3) + '\\ \\text{M}$, so $\\text{pH} = ' + d2(pHn) + '$.',
      W[0] > 25 ? 'The water is still neutral, because $[\\mathrm{H_3O^+}] = [\\mathrm{OH^-}]$; neutral just is not pH 7 at this temperature. Water ionizes more when warm (the ionization is endothermic), so $K_w$ grows.' : 'It is still neutral; in cold water $K_w$ is smaller, so the neutral pH is above 7.'
    ], 'Neutral means [H₃O⁺] = [OH⁻], so [H₃O⁺] = √Kw.', null, { k: 'kw', Kw: W[1], ans: pHn });
  });

  G('gchem2.ka-kb', function (R, ctx) {
    var kind = lv(ctx, R.pick(['pKa', 'Ka']), R.pick(['Kb', 'rank', 'pKa', 'KaOfBH']), R.pick(['rank', 'Kb', 'KaOfBH', 'pKb']));
    var k = acidKey(R), A = ACID[k], pKa = -log10(A.Ka);
    if (kind === 'pKa' && R.coin()) { var Kx = R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.3, 7.5, 8.0]) * M.pow(10, -R.int(2, 11)), px = -log10(Kx);
      return P('A weak acid has $K_a = ' + gv(Kx) + '$. What is its $\\text{p}K_a$? (Use a calculator.)', phA(px), ['$\\text{p}K_a = -\\log K_a = -\\log(' + gv(Kx) + ') = ' + d2(px) + '$.', 'The smaller $K_a$, the larger $\\text{p}K_a$, and the weaker the acid.'], 'pKa = −log Ka.', null, { k: 'pka', Ka: Kx, ans: px }); }
    if (kind === 'pKa') return P('The $K_a$ of ' + A.name + ', $' + F(k) + '$, is $' + gv(A.Ka) + '$. What is its $\\text{p}K_a$?', phA(pKa), ['$\\text{p}K_a = -\\log K_a = -\\log(' + gv(A.Ka) + ') = ' + d2(pKa) + '$.', 'A smaller $K_a$ would give a larger $\\text{p}K_a$: the p means "minus the log".'], 'pKa = −log Ka.', null, { k: 'pka', Ka: A.Ka, ans: pKa });
    if (kind === 'Ka') { var p = rd(R.int(200, 1100) / 100, 2), Ka = M.pow(10, -p);
      return P('A weak acid has $\\text{p}K_a = ' + p.toFixed(2) + '$. What is its $K_a$? (Use a calculator.)', num(Ka, 2, 0.03), ['$K_a = 10^{-\\text{p}K_a} = 10^{-' + p.toFixed(2) + '} = ' + fx(Ka, 2) + '$.'], 'Undo the log: Ka = 10^(−pKa).', null, { k: 'ka', pKa: p, ans: Ka }); }
    if (kind === 'Kb') { var Kb = 1e-14 / A.Ka;
      return P('The $K_a$ of ' + A.name + ' is $' + gv(A.Ka) + '$. What is $K_b$ for its conjugate base, $' + F(A.base) + '$, at 25 °C?', num(Kb), [
        'For a conjugate pair, $K_a \\times K_b = K_w$: adding the acid\u2019s ionization to the base\u2019s reaction with water gives $2\\mathrm{H_2O} \\rightleftharpoons \\mathrm{H_3O^+} + \\mathrm{OH^-}$.',
        '$K_b = \\dfrac{K_w}{K_a} = \\dfrac{1.0 \\times 10^{-14}}{' + gv(A.Ka) + '} = ' + fx(Kb, 3) + '$.',
        'The weaker the acid, the stronger its conjugate base.'
      ], 'Ka × Kb = Kw for a conjugate pair.', null, { k: 'kb', Ka: A.Ka, ans: Kb }); }
    if (kind === 'KaOfBH' || kind === 'pKb') { var bk = R.pick(Object.keys(BASE)), B = BASE[bk];
      if (kind === 'pKb') { var pKb = -log10(B.Kb), pKaBH = 14 - pKb; return P('The $K_b$ of ' + B.name + ', $' + F(bk) + '$, is $' + gv(B.Kb) + '$. What is the $\\text{p}K_a$ of its conjugate acid, $' + F(B.acid) + '$, at 25 °C?', phA(pKaBH), ['$\\text{p}K_b = -\\log(' + gv(B.Kb) + ') = ' + d2(pKb) + '$.', 'For a conjugate pair at 25 °C, $\\text{p}K_a + \\text{p}K_b = 14.00$, so $\\text{p}K_a = 14.00 - ' + d2(pKb) + ' = ' + d2(pKaBH) + '$.'], 'pKa + pKb = 14.00 for a conjugate pair at 25 °C.', null, { k: 'pkb', Kb: B.Kb, ans: pKaBH }); }
      var KaBH = 1e-14 / B.Kb;
      return P('The $K_b$ of ' + B.name + ', $' + F(bk) + '$, is $' + gv(B.Kb) + '$. What is $K_a$ for its conjugate acid, $' + F(B.acid) + '$, at 25 °C?', num(KaBH), ['$K_a \\times K_b = K_w$ for a conjugate pair.', '$K_a = \\dfrac{1.0 \\times 10^{-14}}{' + gv(B.Kb) + '} = ' + fx(KaBH, 3) + '$.'], 'Ka = Kw/Kb.', null, { k: 'kabh', Kb: B.Kb, ans: KaBH }); }
    var ks = R.sample(Object.keys(ACID), 3), withP = ks.map(function (x) { return [x, -log10(ACID[x].Ka)]; }), best = withP.slice().sort(function (a, b) { return a[1] - b[1]; })[0];
    var bigP = withP.slice().sort(function (a, b) { return b[1] - a[1]; })[0];
    return P('Three weak acids have these $\\text{p}K_a$ values: ' + U.list(withP.map(function (x) { return ACID[x[0]].name + ', $' + F(x[0]) + '$, ' + d2(x[1]); })) + '. Type the formula of the strongest acid.', fml(ACID[best[0]].aAlt), [
      '$\\text{p}K_a = -\\log K_a$, so the smaller the $\\text{p}K_a$, the larger $K_a$ and the stronger the acid.',
      'The smallest $\\text{p}K_a$ is ' + d2(best[1]) + ', for $' + F(best[0]) + '$. (' + ACID[bigP[0]].name + ', with the largest $\\text{p}K_a$, is the weakest.)',
      'Each step of 1 in $\\text{p}K_a$ is a factor of 10 in $K_a$.'
    ], 'Smaller pKa means larger Ka.', null, { k: 'rank', p: withP, ans: best[0] });
  });

  function waApprox(Ka, C) { return M.sqrt(Ka * C); }
  function waExact(Ka, C) { return (-Ka + M.sqrt(Ka * Ka + 4 * Ka * C)) / 2; }
  function weakSteps(Ka, C, HA, Ab, xName, x, exact) {
    var st = ['Set up the ionization: $' + EQ(HA + '(aq) + H2O(l) <=> H3O^+(aq) + ' + Ab + '(aq)') + '$. At equilibrium $[\\mathrm{H_3O^+}] = [' + F(Ab) + '] = x$ and $[' + F(HA) + '] = ' + gv(C) + ' - x$.',
      '$' + xName + ' = \\dfrac{x^2}{' + gv(C) + ' - x} = ' + gv(Ka) + '$.'];
    if (!exact) st.push('$K$ is small, so $' + gv(C) + ' - x \\approx ' + gv(C) + '$: $x = \\sqrt{(' + gv(Ka) + ')(' + gv(C) + ')} = ' + fx(x, 3) + '\\ \\text{M}$. Check: $x$ is ' + fx(x / C * 100, 2) + '% of ' + gv(C) + ', under 5%.');
    else st.push('Try the shortcut: $\\sqrt{(' + gv(Ka) + ')(' + gv(C) + ')} = ' + fx(waApprox(Ka, C), 3) + '$, which is ' + fx(waApprox(Ka, C) / C * 100, 2) + '% of ' + gv(C) + ': over 5%, so solve the quadratic $x^2 + ' + gv(Ka) + 'x - ' + fx(Ka * C, 3) + ' = 0$: $x = ' + fx(x, 3) + '\\ \\text{M}$.');
    return st;
  }

  G('gchem2.weak-acid-ph', function (R, ctx) {
    var L = ctx.level || 1, k, A, C, x, exact = false, Ka, name;
    if (L === 1) { var xs = R.pick([1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]) * M.pow(10, -R.int(3, 4)); C = R.pick([0.050, 0.10, 0.20, 0.25, 0.40, 0.50]); Ka = sgf(xs * xs / C, 2); x = waApprox(Ka, C); k = 'HA'; name = 'a weak acid, HA,'; A = { base: 'A^-' }; }
    else { k = acidKey(R, function (kk) { return kk !== 'CH3CH2COOH'; }); A = ACID[k]; Ka = A.Ka; name = A.name + ', $' + F(k) + '$,';
      if (L === 2) { var tries = 0; do { C = concPick(R, [0.050, 0.10, 0.20, 0.25, 0.50, 0.15, 0.30, 0.40, 0.75, 0.080]); tries++; } while (waApprox(Ka, C) / C > 0.05 && tries < 20); if (waApprox(Ka, C) / C > 0.05) { k = 'CH3COOH'; A = ACID[k]; Ka = A.Ka; name = A.name + ', $' + F(k) + '$,'; C = 0.10; } x = waApprox(Ka, C); }
      else { var pick = R.pick([['HF', 0.010], ['HF', 0.0050], ['HNO2', 0.010], ['HCOOH', 0.0020], ['HF', 0.020], ['HNO2', 0.0040], ['CH3COOH', 0.10], ['HOCl', 0.050], ['C6H5COOH', 0.020], ['HF', 0.030], ['HNO2', 0.025], ['HCOOH', 0.0050], ['HCOOH', 0.010], ['C6H5COOH', 0.0050], ['CH3COOH', 0.0010], ['HF', 0.050], ['HNO2', 0.050], ['CH3COOH', 0.020], ['HOCl', 0.20], ['HCN', 0.10]]); k = pick[0]; A = ACID[k]; Ka = A.Ka; C = pick[1]; name = A.name + ', $' + F(k) + '$,';
        exact = waApprox(Ka, C) / C > 0.05; x = exact ? waExact(Ka, C) : waApprox(Ka, C); } }
    var pH = -log10(x);
    var st = weakSteps(Ka, C, k === 'HA' ? 'HA' : k, A.base, 'K_a', x, exact).concat(['$' + pHq(x) + '$.']);
    if (L >= 3 && R.coin()) return P('What is $[' + F(A.base) + ']$ in a $' + qv(C, 'M') + '$ solution of ' + name + ' with $K_a = ' + gv(Ka) + '$? (Use a calculator, and check whether the small-$x$ shortcut holds.)', num(x, 3, exact ? 0.02 : 0.03), st.slice(0, 3).concat(['$[' + F(A.base) + '] = x = ' + q(x, 'M') + '$.']), 'x = [A⁻] = [H₃O⁺]; test the 5% rule before trusting the shortcut.', 'M', { k: 'wa', Ka: Ka, C: C, ask: 'A', ans: x });
    return P('What is the pH of a $' + qv(C, 'M') + '$ solution of ' + name + ' with $K_a = ' + gv(Ka) + '$?' + (L >= 2 ? ' (Use a calculator.)' : '') + (L >= 3 ? ' Check whether the small-$x$ shortcut holds.' : ''), phA(pH), st,
      'Only a small fraction ionizes: solve Ka = x²/(C − x) for x = [H₃O⁺].', null, { k: 'wa', Ka: Ka, C: C, ask: 'pH', ans: pH });
  });

  G('gchem2.percent-ionization', function (R, ctx) {
    var kind = lv(ctx, R.pick(['pct', 'which']), R.pick(['pct', 'dilute', 'which']), R.pick(['KaFromPct', 'dilute', 'pctExact']));
    var k = acidKey(R, function (kk) { return ACID[kk].Ka < 2e-4; }), A = ACID[k];
    if (kind === 'pct') { var C = concPick(R, [0.10, 0.20, 0.50, 0.25, 0.050]), xa = waApprox(A.Ka, C), okx = xa / C < 0.05, x = okx ? xa : waExact(A.Ka, C), pc = x / C * 100;
      return P('What percent of the ' + A.name + ' molecules are ionized in $' + qv(C, 'M') + '$ $' + F(k) + '$ ($K_a = ' + gv(A.Ka) + '$)? (Use a calculator.)', { t: 'num', v: sfStr(pc, 3), rtol: 0.03, pct: true }, [
        okx ? 'Find $x = [\\mathrm{H_3O^+}] = [' + F(A.base) + ']$: $x \\approx \\sqrt{K_a C} = \\sqrt{(' + gv(A.Ka) + ')(' + gv(C) + ')} = ' + fx(x, 3) + '\\ \\text{M}$ (under 5% of $C$, so the shortcut holds).' : 'The shortcut $\\sqrt{K_a C} = ' + fx(xa, 3) + '$ is over 5% of $C$, so solve $\\dfrac{x^2}{' + gv(C) + ' - x} = ' + gv(A.Ka) + '$ exactly: $x = ' + fx(x, 3) + '\\ \\text{M}$.',
        'Percent ionization $= \\dfrac{x}{C} \\times 100\\% = \\dfrac{' + fx(x, 3) + '}{' + gv(C) + '} \\times 100\\% = ' + fx(pc, 3) + '\\%$.'
      ], 'Percent ionization = [A⁻]/C × 100%.', '%', { k: 'pi', Ka: A.Ka, C: C, ans: pc }); }
    if (kind === 'pctExact') { var pk = R.pick([['HF', 0.010], ['HNO2', 0.0050], ['HCOOH', 0.0010], ['HF', 0.0040], ['HF', 0.0050], ['HF', 0.0020], ['HF', 0.0080], ['HNO2', 0.0020], ['HNO2', 0.0040], ['HNO2', 0.0010], ['HCOOH', 0.0020]]), A2 = ACID[pk[0]], C2 = pk[1], x2 = waExact(A2.Ka, C2), pc2 = x2 / C2 * 100;
      return P('What percent of the molecules are ionized in $' + qv(C2, 'M') + '$ ' + A2.name + ' ($K_a = ' + gv(A2.Ka) + '$)? The small-$x$ shortcut fails here, so solve exactly. (Use a calculator.)', { t: 'num', v: sfStr(pc2, 3), rtol: 0.02, pct: true }, [
        'Solve $\\dfrac{x^2}{' + gv(C2) + ' - x} = ' + gv(A2.Ka) + '$, i.e. $x^2 + ' + gv(A2.Ka) + 'x - ' + fx(A2.Ka * C2, 3) + ' = 0$: $x = ' + fx(x2, 3) + '\\ \\text{M}$.',
        'Percent ionization $= \\dfrac{' + fx(x2, 3) + '}{' + gv(C2) + '} \\times 100\\% = ' + fx(pc2, 3) + '\\%$: a dilute weak acid can be far from "barely ionized".'
      ], 'Solve the quadratic for x, then x/C × 100%.', '%', { k: 'pi', Ka: A2.Ka, C: C2, exact: true, ans: pc2 }); }
    if (kind === 'which') { var c1 = R.pick([1.0, 0.50, 0.10]), c2 = c1 / R.pick([10, 100]), hi = '$' + qv(c2, 'M') + '$ ' + A.name;
      return P('Which has the higher percent ionization: $' + qv(c1, 'M') + '$ ' + A.name + ' or $' + qv(c2, 'M') + '$ ' + A.name + '?', mc(hi, ['$' + qv(c1, 'M') + '$ ' + A.name, 'They are the same, because $K_a$ is the same', 'Neither ionizes at all']), [
        'With the small-$x$ shortcut, $x \\approx \\sqrt{K_a C}$, so percent ionization $\\approx \\dfrac{\\sqrt{K_a C}}{C} \\times 100\\% = \\sqrt{\\dfrac{K_a}{C}} \\times 100\\%$.',
        'A smaller $C$ gives a larger percent: the more dilute solution ionizes a larger share, even though its $[\\mathrm{H_3O^+}]$ is lower.',
        'Why: dilution spreads out the ions, so they meet and recombine less often (Le Chatelier: the side with more particles is favored).'
      ], 'Percent ionization ≈ √(Ka/C). What happens as C shrinks?', null, { k: 'piw', Ka: A.Ka, c1: c1, c2: c2, ans: hi }); }
    if (kind === 'dilute') { var f = R.pick([10, 100, 4, 25, 9, 16, 36, 49, 64, 1000]), r = M.sqrt(f);
      return P('A solution of ' + A.name + ' is diluted to $\\tfrac{1}{' + f + '}$ of its concentration (it stays dilute enough that the small-$x$ shortcut holds both before and after). By what factor does its percent ionization change?', num(r, 3, 0.02), [
        'Percent ionization $\\approx \\sqrt{K_a/C} \\times 100\\%$.',
        'Dividing $C$ by ' + f + ' multiplies $\\sqrt{K_a/C}$ by $\\sqrt{' + f + '} = ' + fx(r, 3) + '$: the percent ionization grows.'
      ], 'Use percent ≈ √(Ka/C).', null, { k: 'pidil', f: f, ans: r }); }
    var C3 = concPick(R, [0.10, 0.050, 0.20]), pp = R.int(6, 48) / 10, alpha = pp / 100, KaC = C3 * alpha * alpha / (1 - alpha);
    return P('A $' + qv(C3, 'M') + '$ solution of a weak acid HA is $' + T.num(pp) + '\\%$ ionized. What is $K_a$? (Use a calculator.)', num(KaC, 2, 0.03), [
      '$[\\mathrm{H_3O^+}] = [\\mathrm{A^-}] = ' + T.num(pp / 100) + ' \\times ' + gv(C3) + ' = ' + fx(alpha * C3, 3) + '\\ \\text{M}$; $[\\mathrm{HA}] = ' + gv(C3) + ' - ' + fx(alpha * C3, 3) + ' = ' + fx(C3 * (1 - alpha), 3) + '\\ \\text{M}$.',
      '$K_a = \\dfrac{(' + fx(alpha * C3, 3) + ')^2}{' + fx(C3 * (1 - alpha), 3) + '} = ' + fx(KaC, 2) + '$.'
    ], 'Turn the percent into [H₃O⁺] and [HA], then use the Ka expression.', null, { k: 'kapi', C: C3, pct: pp, ans: KaC });
  });

  G('gchem2.weak-base-ph', function (R, ctx) {
    var L = ctx.level || 1, bk = R.pick(L === 1 ? ['NH3', 'CH3NH2', '(CH3)2NH', 'N2H4'] : Object.keys(BASE)), B = BASE[bk], C = concPick(R, [0.10, 0.20, 0.050, 0.25, 0.50, 0.15, 0.30, 0.40, 0.020, 0.075, 0.12, 0.35, 0.45, 0.60, 0.080, 0.18, 0.040, 0.030, 0.70, 0.065]);
    var viaKa = L >= 3 && R.coin(), Kb = viaKa ? 1e-14 / sgf(1e-14 / B.Kb, 2) : B.Kb, tries = 0;
    while (M.sqrt(Kb * C) / C > 0.05 && tries++ < 10) C = concPick(R, [0.20, 0.25, 0.50]);
    var x = M.sqrt(Kb * C) / C > 0.05 ? (-Kb + M.sqrt(Kb * Kb + 4 * Kb * C)) / 2 : M.sqrt(Kb * C), ex = M.sqrt(Kb * C) / C > 0.05, pOH = -log10(x), pH = 14 - pOH;
    var st = [];
    if (viaKa) st.push('First get $K_b$ from the conjugate acid\u2019s $K_a$: $K_b = \\dfrac{K_w}{K_a} = \\dfrac{1.0 \\times 10^{-14}}{' + gv(1e-14 / Kb, 2) + '} = ' + fx(Kb, 2) + '$.');
    st.push('The base takes a proton from water: $' + EQ(bk + '(aq) + H2O(l) <=> ' + B.acid + '(aq) + OH^-(aq)') + '$. With $x = [\\mathrm{OH^-}] = [' + F(B.acid) + ']$: $K_b = \\dfrac{x^2}{' + gv(C) + ' - x}$.');
    st.push(ex ? 'Solve the quadratic (the shortcut fails): $x = ' + fx(x, 3) + '\\ \\text{M}$.' : 'Shortcut: $x = \\sqrt{K_b C} = \\sqrt{(' + fx(Kb, 2) + ')(' + gv(C) + ')} = ' + fx(x, 3) + '\\ \\text{M}$ (' + fx(x / C * 100, 2) + '% of ' + gv(C) + ', under 5%).');
    st.push('$x$ is $[\\mathrm{OH^-}]$, not $[\\mathrm{H_3O^+}]$: $\\text{pOH} = -\\log(' + fx(x, 3) + ') = ' + d2(pOH) + '$.');
    st.push('$\\text{pH} = 14.00 - ' + d2(pOH) + ' = ' + d2(pH) + '$.');
    var q0 = viaKa ? 'The conjugate acid of ' + B.name + ', $' + F(B.acid) + '$, has $K_a = ' + gv(1e-14 / Kb, 2) + '$. What is the pH of $' + qv(C, 'M') + '$ ' + B.name + ' at 25 °C?' : 'What is the pH of $' + qv(C, 'M') + '$ ' + B.name + ', $' + F(bk) + '$ ($K_b = ' + gv(Kb) + '$), at 25 °C?';
    if (L >= 2 && !viaKa && R.chance(0.3)) return P(q0.replace('What is the pH of', 'What is the pOH of'), phA(pOH), st.slice(0, -1), 'x from Kb is [OH⁻]; pOH = −log x.', null, { k: 'wb', Kb: Kb, C: C, ask: 'pOH', ans: pOH });
    return P(q0 + ' (Use a calculator.)', phA(pH), st, 'Solve Kb = x²/(C − x) for x = [OH⁻]; then pOH, then pH.', null, { k: 'wb', Kb: Kb, C: C, ask: 'pH', ans: pH });
  });

  var SALTS = [
    ['NaCl', 'sodium chloride', 'neutral'], ['KNO3', 'potassium nitrate', 'neutral'], ['NaClO4', 'sodium perchlorate', 'neutral'], ['KBr', 'potassium bromide', 'neutral'], ['CaCl2', 'calcium chloride', 'neutral'], ['LiNO3', 'lithium nitrate', 'neutral'],
    ['NH4Cl', 'ammonium chloride', 'acidic'], ['NH4NO3', 'ammonium nitrate', 'acidic'], ['CH3NH3Cl', 'methylammonium chloride', 'acidic'], ['C5H5NHCl', 'pyridinium chloride', 'acidic'], ['Al(NO3)3', 'aluminum nitrate', 'acidic'], ['Fe(NO3)3', 'iron(III) nitrate', 'acidic'],
    ['NaF', 'sodium fluoride', 'basic'], ['NaCH3COO', 'sodium acetate', 'basic'], ['NaCN', 'sodium cyanide', 'basic'], ['NaOCl', 'sodium hypochlorite', 'basic'], ['Na2CO3', 'sodium carbonate', 'basic'], ['KNO2', 'potassium nitrite', 'basic'], ['NaHCOO', 'sodium formate', 'basic']
  ];
  var SALT_WHY = {
    NaCl: 'Na⁺ comes from a strong base and Cl⁻ from a strong acid; neither reacts with water.', KNO3: 'K⁺ and NO₃⁻ come from a strong base and a strong acid; neither reacts with water.', NaClO4: 'Na⁺ and ClO₄⁻ come from a strong base and a strong acid; neither reacts with water.',
    KBr: 'K⁺ and Br⁻ come from a strong base and a strong acid; neither reacts with water.', CaCl2: 'Ca²⁺ and Cl⁻ do not change the pH of water noticeably.', LiNO3: 'Li⁺ and NO₃⁻ do not react with water.',
    NH4Cl: 'NH₄⁺ is the conjugate acid of the weak base NH₃, so it gives protons to water; Cl⁻ does nothing.', NH4NO3: 'NH₄⁺ is a weak acid; NO₃⁻ does nothing.', CH3NH3Cl: 'CH₃NH₃⁺ is the conjugate acid of the weak base methylamine.',
    C5H5NHCl: 'C₅H₅NH⁺ is the conjugate acid of the weak base pyridine.', 'Al(NO3)3': 'The small, highly charged Al³⁺ ion pulls on the water molecules bound to it, and [Al(H₂O)₆]³⁺ gives up a proton.', 'Fe(NO3)3': 'The small, highly charged Fe³⁺ ion makes its bound water molecules give up protons.',
    NaF: 'F⁻ is the conjugate base of the weak acid HF, so it takes protons from water.', NaCH3COO: 'CH₃COO⁻ is the conjugate base of the weak acid acetic acid.', NaCN: 'CN⁻ is the conjugate base of the weak acid HCN.',
    NaOCl: 'OCl⁻ is the conjugate base of the weak acid HOCl.', Na2CO3: 'CO₃²⁻ is the conjugate base of the weak acid HCO₃⁻.', KNO2: 'NO₂⁻ is the conjugate base of the weak acid HNO₂.', NaHCOO: 'HCOO⁻ is the conjugate base of the weak acid formic acid.'
  };
  G('gchem2.salt-solutions', function (R, ctx) {
    var kind = lv(ctx, 'classify', R.pick(['classify', 'pHb', 'pHa']), R.pick(['pHb', 'pHa', 'both']));
    if (kind === 'classify') { var s = R.pick(SALTS), ans = cap(s[2]);
      return P('Is a solution of ' + s[1] + ', $' + F(s[0]) + '$, in water acidic, basic or neutral?', mc(ans, ['Acidic', 'Basic', 'Neutral'].filter(function (w) { return w !== ans; })), [
        'Split the salt into its ions and ask whether each one reacts with water.',
        SALT_WHY[s[0]],
        'So the solution is ' + s[2] + '. A salt is not automatically neutral just because it can be made by neutralization.'
      ], 'Ions from strong acids and strong bases are spectators; ions from weak ones react with water.', null, { k: 'saltc', s: s[0], ans: ans }); }
    if (kind === 'pHb') { var ak = acidKey(R, function (kk) { return ACID[kk].Ms && kk !== 'C6H5COOH'; }), A = ACID[ak], C = concPick(R, [0.10, 0.20, 0.50, 0.25, 0.15]), Kb = 1e-14 / A.Ka, x = M.sqrt(Kb * C), pOH = -log10(x), pH = 14 - pOH;
      return P('What is the pH of $' + qv(C, 'M') + '$ ' + A.saltName + ', $' + F(A.salt) + '$, at 25 °C? For ' + A.name + ', $K_a = ' + gv(A.Ka) + '$. (Use a calculator.)', phA(pH), [
        'Na⁺ does nothing; $' + F(A.base) + '$ is a weak base: $' + EQ(A.base + '(aq) + H2O(l) <=> ' + ak + '(aq) + OH^-(aq)') + '$.',
        '$K_b = \\dfrac{K_w}{K_a} = \\dfrac{1.0 \\times 10^{-14}}{' + gv(A.Ka) + '} = ' + fx(Kb, 3) + '$.',
        '$[\\mathrm{OH^-}] = \\sqrt{K_b C} = \\sqrt{(' + fx(Kb, 3) + ')(' + gv(C) + ')} = ' + fx(x, 3) + '\\ \\text{M}$.',
        '$\\text{pOH} = ' + d2(pOH) + '$, so $\\text{pH} = 14.00 - ' + d2(pOH) + ' = ' + d2(pH) + '$: basic, as expected.'
      ], 'The anion is a weak base: get Kb from Kw/Ka.', null, { k: 'saltb', Ka: A.Ka, C: C, ans: pH }); }
    if (kind === 'pHa') { var bk = R.pick(['NH3', 'CH3NH2', 'C5H5N']), B = BASE[bk], C2 = concPick(R, [0.10, 0.20, 0.50, 0.25, 0.050]), Ka = 1e-14 / B.Kb, x2 = M.sqrt(Ka * C2), pH2 = -log10(x2);
      return P('What is the pH of $' + qv(C2, 'M') + '$ ' + B.saltName + ', $' + F(B.salt) + '$, at 25 °C? For ' + B.name + ', $K_b = ' + gv(B.Kb) + '$. (Use a calculator.)', phA(pH2), [
        'Cl⁻ does nothing; $' + F(B.acid) + '$ is a weak acid: $' + EQ(B.acid + '(aq) + H2O(l) <=> ' + bk + '(aq) + H3O^+(aq)') + '$.',
        '$K_a = \\dfrac{K_w}{K_b} = \\dfrac{1.0 \\times 10^{-14}}{' + gv(B.Kb) + '} = ' + fx(Ka, 3) + '$.',
        '$[\\mathrm{H_3O^+}] = \\sqrt{K_a C} = \\sqrt{(' + fx(Ka, 3) + ')(' + gv(C2) + ')} = ' + fx(x2, 3) + '\\ \\text{M}$, so $\\text{pH} = ' + d2(pH2) + '$: acidic.'
      ], 'The cation is a weak acid: get Ka from Kw/Kb.', null, { k: 'salta', Kb: B.Kb, C: C2, ans: pH2 }); }
    var ak2 = R.pick(['HCN', 'HF', 'CH3COOH', 'HNO2', 'HOCl']), A2 = ACID[ak2], KaN = 1e-14 / 1.8e-5, KbX = 1e-14 / A2.Ka, kind2 = M.abs(log10(KaN / KbX)) < 0.05 ? 'Neutral' : KaN > KbX ? 'Acidic' : 'Basic';
    var saltF = 'NH4' + A2.base.replace('^-', '');
    return P('Is a solution of $' + F(saltF) + '$ acidic, basic or neutral? Use $K_b(\\mathrm{NH_3}) = 1.8 \\times 10^{-5}$ and $K_a(' + F(ak2) + ') = ' + gv(A2.Ka) + '$.', mc(kind2, ['Acidic', 'Basic', 'Neutral'].filter(function (w) { return w !== kind2; })), [
      'Both ions react with water: $\\mathrm{NH_4^+}$ as a weak acid and $' + F(A2.base) + '$ as a weak base.',
      '$K_a(\\mathrm{NH_4^+}) = \\dfrac{1.0 \\times 10^{-14}}{1.8 \\times 10^{-5}} = ' + fx(KaN, 2) + '$ and $K_b(' + F(A2.base) + ') = \\dfrac{1.0 \\times 10^{-14}}{' + gv(A2.Ka) + '} = ' + fx(KbX, 2) + '$.',
      kind2 === 'Neutral' ? 'They are equal, so the two effects cancel: about neutral.' : 'The larger constant wins: ' + (kind2 === 'Acidic' ? '$K_a > K_b$, so the solution is acidic.' : '$K_b > K_a$, so the solution is basic.')
    ], 'Compare Ka of the cation with Kb of the anion.', null, { k: 'saltboth', Ka: A2.Ka, ans: kind2 });
  });

  var POLY = [
    { f: 'H2CO3', name: 'carbonic acid', Ka: [4.3e-7, 4.7e-11], mid: 'HCO3^-', end: 'CO3^2-' },
    { f: 'H2C6H6O6', name: 'ascorbic acid (vitamin C)', Ka: [8.0e-5, 1.6e-12], mid: 'HC6H6O6^-', end: 'C6H6O6^2-' },
    { f: 'H2SO3', name: 'sulfurous acid', Ka: [1.4e-2, 6.3e-8], mid: 'HSO3^-', end: 'SO3^2-', big: true },
    { f: 'H3PO4', name: 'phosphoric acid', Ka: [7.5e-3, 6.2e-8, 4.2e-13], mid: 'H2PO4^-', end: 'HPO4^2-', big: true }
  ];
  G('gchem2.polyprotic-acids', function (R, ctx) {
    var kind = lv(ctx, R.pick(['pH', 'tf', 'mid']), R.pick(['pH', 'A2', 'mid']), R.pick(['pHbig', 'A2', 'pH', 'mid']));
    var Pq = R.pick(kind === 'pHbig' ? POLY.filter(function (p) { return p.big; }) : kind === 'A2' || kind === 'tf' || kind === 'mid' ? POLY : POLY.filter(function (p) { return !p.big; })), C = concPick(R, kind === 'pHbig' ? [0.10, 0.20, 0.050, 0.15, 0.25, 0.30] : [0.10, 0.050, 0.20, 0.025, 0.010, 0.030, 0.040, 0.075, 0.15, 0.25]);
    var K1 = Pq.Ka[0], K2 = Pq.Ka[1], exq = Pq.big || waApprox(K1, C) / C > 0.05, x = exq ? waExact(K1, C) : waApprox(K1, C), pH = -log10(x);
    var kl = 'For ' + Pq.name + ', $' + F(Pq.f) + '$: ' + Pq.Ka.map(function (k, i) { return '$K_{a' + (i + 1) + '} = ' + gv(k) + '$'; }).join(', ') + '.';
    var first = 'The first ionization, $' + EQ(Pq.f + '(aq) + H2O(l) <=> H3O^+(aq) + ' + Pq.mid + '(aq)') + '$, makes almost all the $\\mathrm{H_3O^+}$: $K_{a2}$ is about $' + fx(K1 / K2, 1) + '$ times smaller, and the second step is held back further by the $\\mathrm{H_3O^+}$ the first one made.';
    if (kind === 'tf') return P(kl + ' True or false: in a solution of ' + Pq.name + ', the second ionization adds about as much $\\mathrm{H_3O^+}$ as the first.', tf(false), [first, 'Removing a second proton from a negative ion is much harder than removing the first from a neutral molecule, so $K_{a2} \\ll K_{a1}$.', 'False: the pH comes from the first step alone.'], 'Compare Ka1 with Ka2.', null, { k: 'polytf', ans: false });
    var st = [first, exq ? 'The shortcut fails here (x would be over 5% of the starting concentration), so solve the quadratic: $\\dfrac{x^2}{' + gv(C) + ' - x} = ' + gv(K1) + '$ gives $x = ' + fx(x, 3) + '\\ \\text{M}$.' : 'Treat it as a monoprotic weak acid: $x = \\sqrt{K_{a1}C} = \\sqrt{(' + gv(K1) + ')(' + gv(C) + ')} = ' + fx(x, 3) + '\\ \\text{M}$.'];
    if (kind === 'pH' || kind === 'pHbig') return P(kl + ' What is the pH of $' + qv(C, 'M') + '$ $' + F(Pq.f) + '$? (Use a calculator.)', phA(pH), st.concat(['$' + pHq(x) + '$.']), 'Only the first ionization matters for the pH.', null, { k: 'poly', Ka: Pq.Ka, p: POLY.indexOf(Pq), C: C, ask: 'pH', ans: pH });
    if (kind === 'mid') return P(kl + ' What is $[' + F(Pq.mid) + ']$ in $' + qv(C, 'M') + '$ $' + F(Pq.f) + '$? (Use a calculator.)', num(x, 3, 0.03), st.concat(['The first step makes $\\mathrm{H_3O^+}$ and $' + F(Pq.mid) + '$ one for one, and the second step uses up very little: $[' + F(Pq.mid) + '] \\approx [\\mathrm{H_3O^+}] = ' + q(x, 'M') + '$.']), 'The first step makes equal amounts of H₃O⁺ and the singly charged ion.', 'M', { k: 'poly', Ka: Pq.Ka, p: POLY.indexOf(Pq), C: C, ask: 'mid', ans: x });
    return P(kl + ' What is $[' + F(Pq.end) + ']$ in $' + qv(C, 'M') + '$ $' + F(Pq.f) + '$?', num(K2, 2, 0.03), st.concat([
      'Second step: $K_{a2} = \\dfrac{[\\mathrm{H_3O^+}][' + F(Pq.end) + ']}{[' + F(Pq.mid) + ']}$.',
      'Since $[\\mathrm{H_3O^+}] \\approx [' + F(Pq.mid) + ']$, they cancel: $[' + F(Pq.end) + '] \\approx K_{a2} = ' + q(K2, 'M', 2) + '$, whatever the concentration of the acid.'
    ]), 'Write Ka2 and notice what cancels.', 'M', { k: 'poly', Ka: Pq.Ka, p: POLY.indexOf(Pq), C: C, ask: 'end', ans: K2 });
  });

  var STRUCT = [
    { set: ['HF', 'HCl', 'HBr', 'HI'], strong: 'HI', weak: 'HF', why: 'Down a group the H–X bond gets longer and weaker, so the proton comes off more easily. HF has by far the strongest bond.' },
    { set: ['CH4', 'NH3', 'H2O', 'HF'], strong: 'HF', weak: 'CH4', why: 'Across a period the atom bonded to H grows more electronegative, the bond grows more polar, and the anion left behind holds its charge better.' },
    { set: ['H2O', 'H2S', 'H2Se', 'H2Te'], strong: 'H2Te', weak: 'H2O', why: 'Down a group the bond to H gets longer and weaker; bond strength wins over electronegativity for atoms in the same group.' },
    { set: ['HClO', 'HClO2', 'HClO3', 'HClO4'], strong: 'HClO4', weak: 'HClO', short: 'More O atoms on chlorine pull electron density from the O–H bond and spread the anion\u2019s charge', why: 'Each extra O atom pulls electron density away from the O–H bond, and spreads the negative charge of the conjugate base over more atoms (resonance).' },
    { set: ['HOCl', 'HOBr', 'HOI'], strong: 'HOCl', weak: 'HOI', short: 'Chlorine is more electronegative, so it pulls harder on the O–H bond and steadies the anion', why: 'The more electronegative the halogen, the more it pulls on the O–H bond and steadies the negative charge left on the anion.' },
    { set: ['HNO2', 'HNO3'], strong: 'HNO3', weak: 'HNO2', short: 'The extra O atom pulls electron density and lets the anion spread its charge over more atoms', why: 'HNO₃ has one more O atom on nitrogen: its anion spreads the charge over three O atoms by resonance.' },
    { set: ['H2SO3', 'H2SO4'], strong: 'H2SO4', weak: 'H2SO3', short: 'The extra O atom pulls electron density and lets the anion spread its charge over more atoms', why: 'H₂SO₄ has one more O atom on sulfur, which pulls electron density and spreads the anion\u2019s charge.' }
  ];
  var CHLORO = [['CH3COOH', 1.8e-5], ['ClCH2COOH', 1.4e-3], ['Cl2CHCOOH', 5.5e-2], ['Cl3CCOOH', 3.0e-1]];
  G('gchem2.acid-strength-structure', function (R, ctx) {
    var kind = lv(ctx, R.pick(['strong', 'strong', 'weak']), R.pick(['strong', 'why', 'weak', 'chloro']), R.pick(['why', 'chloro', 'hf', 'resonance']));
    if (kind === 'strong' || kind === 'weak') { var S = R.pick(STRUCT), ans = kind === 'strong' ? S.strong : S.weak;
      return P('Of $' + S.set.map(F).join('$, $') + '$, which is the ' + (kind === 'strong' ? 'strongest' : 'weakest') + ' acid? Type its formula.', fml(ans), [S.why, 'So the ' + (kind === 'strong' ? 'strongest' : 'weakest') + ' acid is $' + F(ans) + '$.'], 'Compare the bonds to the acidic H, and how well the conjugate base holds its negative charge.', null, { k: 'struct', set: S.set, ans: ans }); }
    if (kind === 'why') { var S2 = R.pick(STRUCT.slice(3)), wrong = ['The stronger acid has more hydrogen atoms to give away', 'The stronger acid has the larger molar mass', 'The stronger acid is more concentrated'];
      return P('Why is $' + F(S2.strong) + '$ a stronger acid than $' + F(S2.weak) + '$?', mc(S2.short, wrong), [S2.why, 'Concentration and the number of H atoms do not decide strength; strength is how easily the O–H bond gives up its proton in water.'], 'Think about the conjugate base: how well can it hold the negative charge?', null, { k: 'structwhy', ans: S2.strong }); }
    if (kind === 'hf') { var right = 'The H–F bond is much stronger than the other H–halogen bonds', wr = ['Fluorine is the most electronegative element, so HF holds its proton less tightly', 'HF molecules are too small to ionize', 'F⁻ is a very weak base'];
      return P('Fluorine is the most electronegative element, yet HF is a weak acid while HCl, HBr and HI are strong. Why?', mc(right, wr), [
        'High electronegativity makes the H–F bond very polar, which on its own would favor ionization.',
        'But the H–F bond is also very short and strong, and that matters more: breaking it costs too much, so only a small fraction of HF molecules give up their protons in water.',
        'Down group 17 the bonds get weaker (H–F > H–Cl > H–Br > H–I), so acid strength rises: HF ≪ HCl < HBr < HI.'
      ], 'What has to break when an acid gives up its proton?', null, { k: 'hf', ans: right }); }
    if (kind === 'resonance') { var right2 = 'Acetate spreads its negative charge over two O atoms by resonance', wr2 = ['Acetic acid has more H atoms', 'Ethanol\u2019s O–H bond is weaker', 'Acetic acid has a larger molar mass'];
      return P('Acetic acid, $\\mathrm{CH_3COOH}$ ($K_a = 1.8 \\times 10^{-5}$), is about $10^{11}$ times stronger as an acid than ethanol, $\\mathrm{CH_3CH_2OH}$. What is the main reason?', mc(right2, wr2), [
        'Compare the conjugate bases. In acetate, $\\mathrm{CH_3COO^-}$, the negative charge is shared equally by two oxygen atoms (two resonance structures).',
        'In ethoxide, $\\mathrm{CH_3CH_2O^-}$, the charge sits on one oxygen. A spread-out charge is more stable, so acetic acid gives up its proton far more readily.'
      ], 'Look at where the negative charge sits in each conjugate base.', null, { k: 'res', ans: right2 }); }
    var two = R.sample(CHLORO, 2), st = two[0][1] > two[1][1] ? two[0] : two[1];
    var nm = { CH3COOH: 'acetic acid', ClCH2COOH: 'chloroacetic acid', Cl2CHCOOH: 'dichloroacetic acid', Cl3CCOOH: 'trichloroacetic acid' };
    return P('Which is the stronger acid: ' + nm[two[0][0]] + ', $' + F(two[0][0]) + '$, or ' + nm[two[1][0]] + ', $' + F(two[1][0]) + '$?', mc(cap(nm[st[0]]), [cap(nm[(st === two[0] ? two[1] : two[0])[0]]), 'They are equally strong, since both are carboxylic acids', 'The one with more H atoms']), [
      'Chlorine atoms are electronegative. Each one pulls electron density through the bonds toward itself, away from the $\\mathrm{-COO^-}$ group of the conjugate base.',
      'That spreads and steadies the negative charge, so the acid gives up its proton more easily. More chlorine atoms, stronger acid: $K_a$ ' + CHLORO.map(function (c) { return gv(c[1]); }).join(' < ') + '.',
      'So ' + nm[st[0]] + ' is stronger.'
    ], 'Electron-withdrawing atoms near the acidic group steady the conjugate base.', null, { k: 'chloro', ans: cap(nm[st[0]]) });
  });

  var BUFS = [
    { a: 'CH3COOH', b: 'CH3COO^-', salt: 'NaCH3COO', name: 'acetic acid and sodium acetate', pKa: 4.74, aAlt: ACID.CH3COOH.aAlt, bAlt: ACID.CH3COOH.alt },
    { a: 'NH4^+', b: 'NH3', salt: 'NH4Cl', name: 'ammonia and ammonium chloride', pKa: 9.25, aAlt: ['NH4^+'], bAlt: ['NH3'] },
    { a: 'HF', b: 'F^-', salt: 'NaF', name: 'hydrofluoric acid and sodium fluoride', pKa: 3.17, aAlt: ['HF'], bAlt: ['F^-'] },
    { a: 'H2PO4^-', b: 'HPO4^2-', salt: 'Na2HPO4', name: 'sodium dihydrogen phosphate and sodium hydrogen phosphate', pKa: 7.21, aAlt: ['H2PO4^-'], bAlt: ['HPO4^2-'] },
    { a: 'HCOOH', b: 'HCOO^-', salt: 'NaHCOO', name: 'formic acid and sodium formate', pKa: 3.74, aAlt: ACID.HCOOH.aAlt, bAlt: ACID.HCOOH.alt },
    { a: 'HCO3^-', b: 'CO3^2-', salt: 'Na2CO3', name: 'sodium hydrogen carbonate and sodium carbonate', pKa: 10.33, aAlt: ['HCO3^-'], bAlt: ['CO3^2-'] }
  ];
  G('gchem2.buffers', function (R, ctx) {
    var kind = lv(ctx, R.pick(['is', 'reacts']), R.pick(['is', 'reacts', 'moles', 'tf']), R.pick(['moles', 'is', 'partial']));
    if (kind === 'is' || kind === 'partial') {
      var good = kind === 'partial' ? ['$0.20\\ \\text{mol}$ $\\mathrm{CH_3COOH}$ and $0.10\\ \\text{mol}$ $\\mathrm{NaOH}$ in 1.0 L', '$0.30\\ \\text{mol}$ $\\mathrm{NH_3}$ and $0.15\\ \\text{mol}$ $\\mathrm{HCl}$ in 1.0 L'] : ['$\\mathrm{CH_3COOH}$ and $\\mathrm{NaCH_3COO}$', '$\\mathrm{NH_3}$ and $\\mathrm{NH_4Cl}$', '$\\mathrm{HF}$ and $\\mathrm{NaF}$', '$\\mathrm{NaH_2PO_4}$ and $\\mathrm{Na_2HPO_4}$', '$\\mathrm{HCOOH}$ and $\\mathrm{NaHCOO}$'];
      var bad = ['$\\mathrm{HCl}$ and $\\mathrm{NaCl}$', '$\\mathrm{HNO_3}$ and $\\mathrm{KNO_3}$', '$\\mathrm{NaOH}$ and $\\mathrm{NaCl}$', '$\\mathrm{CH_3COOH}$ and $\\mathrm{HCl}$', '$0.10\\ \\text{mol}$ $\\mathrm{CH_3COOH}$ and $0.10\\ \\text{mol}$ $\\mathrm{NaOH}$ in 1.0 L', '$\\mathrm{NH_3}$ and $\\mathrm{NaOH}$'];
      var g = R.pick(good);
      return P('Which mixture, dissolved in water, makes a buffer?', mc(g, R.sample(bad, 3)), [
        'A buffer needs a weak acid and its conjugate base together, in similar amounts: the acid uses up added $\\mathrm{OH^-}$ and the base uses up added $\\mathrm{H_3O^+}$.',
        kind === 'partial' ? 'Here the strong ' + (g.indexOf('NaOH') >= 0 ? 'base turns half of the weak acid into its conjugate base' : 'acid turns half of the weak base into its conjugate acid') + ', leaving both partners in equal amounts.' : g + ' is a weak acid–conjugate base pair.',
        'A strong acid with its salt (like HCl with NaCl) is not a buffer: $\\mathrm{Cl^-}$ is too weak a base to take up added $\\mathrm{H_3O^+}$. Equal moles of a weak acid and NaOH leave no acid behind.'
      ], 'Look for a weak acid and its conjugate base, both present.', null, { k: 'bufis', ans: g }); }
    var B = R.pick(BUFS);
    if (kind === 'reacts') { var oh = R.coin();
      return P('A buffer is made from ' + B.name + '. Which species in it reacts with ' + (oh ? 'added $\\mathrm{OH^-}$' : 'added $\\mathrm{H_3O^+}$') + '? Type its formula.', fml(oh ? B.aAlt : B.bAlt), [
        'The buffer pair is $' + F(B.a) + '$ (the acid) and $' + F(B.b) + '$ (its conjugate base).',
        oh ? 'Added hydroxide is a base, so the acid of the pair takes it: $' + EQ(B.a + '(aq) + OH^-(aq) -> ' + B.b + '(aq) + H2O(l)') + '$.' : 'Added hydronium is an acid, so the base of the pair takes it: $' + EQ(B.b + '(aq) + H3O^+(aq) -> ' + B.a + '(aq) + H2O(l)') + '$.',
        'The strong acid or base is replaced by a weak one, which is why the pH barely moves.'
      ], oh ? 'Hydroxide reacts with an acid.' : 'Hydronium reacts with a base.', null, { k: 'bufreact', ans: oh ? B.a : B.b }); }
    if (kind === 'tf') { var stmt = R.pick([['A buffer keeps the pH from changing at all when acid is added.', false], ['A buffer\u2019s pH changes a little when acid is added, much less than the pH of water would.', true], ['Once the conjugate base of a buffer is used up, added acid lowers the pH sharply.', true]]);
      return P('True or false: ' + stmt[0], tf(stmt[1]), ['Added acid turns some of the base into the acid of the pair, so the ratio of base to acid shifts a little and the pH falls a little.', 'The buffer resists change only while both partners are present in useful amounts. So the statement is ' + (stmt[1] ? 'true' : 'false') + '.'], 'What does added acid do to the ratio of the two partners?', null, { k: 'buftf', ans: stmt[1] }); }
    var nA = R.pick([0.10, 0.20, 0.25, 0.15]), nHA = R.pick([0.10, 0.20, 0.25, 0.15]), add = R.pick([0.010, 0.020, 0.030, 0.050]), acid = R.coin();
    var newHA = acid ? nHA + add : nHA - add, newA = acid ? nA - add : nA + add, askA = R.coin();
    return P('A buffer holds $' + qv(nHA, 'mol') + '$ of $' + F(B.a) + '$ and $' + qv(nA, 'mol') + '$ of $' + F(B.b) + '$. Then $' + qv(add, 'mol') + '$ of ' + (acid ? 'HCl' : 'NaOH') + ' is added. How many moles of $' + F(askA ? B.b : B.a) + '$ are present afterward?', num(askA ? newA : newHA), [
      acid ? 'The added $\\mathrm{H_3O^+}$ reacts completely with the base: $' + EQ(B.b + ' + H3O^+ -> ' + B.a + ' + H2O') + '$.' : 'The added $\\mathrm{OH^-}$ reacts completely with the acid: $' + EQ(B.a + ' + OH^- -> ' + B.b + ' + H2O') + '$.',
      acid ? '$' + F(B.b) + '$: $' + gv(nA) + ' - ' + gv(add) + ' = ' + fx(newA, 3) + '\\ \\text{mol}$; $' + F(B.a) + '$: $' + gv(nHA) + ' + ' + gv(add) + ' = ' + fx(newHA, 3) + '\\ \\text{mol}$.' : '$' + F(B.a) + '$: $' + gv(nHA) + ' - ' + gv(add) + ' = ' + fx(newHA, 3) + '\\ \\text{mol}$; $' + F(B.b) + '$: $' + gv(nA) + ' + ' + gv(add) + ' = ' + fx(newA, 3) + '\\ \\text{mol}$.',
      'The strong ' + (acid ? 'acid' : 'base') + ' is gone, traded for the weak partner. The total of the two stays $' + fx(nA + nHA, 3) + '\\ \\text{mol}$.'
    ], 'Strong acid or base reacts completely with the buffer partner that can take it.', 'mol', { k: 'bufmol', nHA: nHA, nA: nA, add: acid ? add : -add, ask: askA ? 'A' : 'HA', ans: askA ? newA : newHA });
  });

  G('gchem2.henderson-hasselbalch', function (R, ctx) {
    var kind = lv(ctx, R.pick(['pH', 'pHmol']), R.pick(['pH', 'ratio', 'pHKa']), R.pick(['mass', 'ratio', 'pHKa']));
    var B = R.pick(BUFS.slice(0, 5)), pKa = B.pKa;
    if (kind === 'pH' || kind === 'pHmol' || kind === 'pHKa') { var ca = R.pick([0.10, 0.20, 0.25, 0.30, 0.15]), cb = R.pick([0.10, 0.20, 0.25, 0.30, 0.15, 0.40]); if (ca === cb) cb = ca * 2; var ratio = cb / ca, pH = pKa + log10(ratio);
      var useKa = kind === 'pHKa', Ka = M.pow(10, -pKa), KaG = sgf(Ka, 2); if (useKa) { pKa = -log10(KaG); pH = pKa + log10(ratio); }
      var mol = kind === 'pHmol', V = R.pick([0.500, 1.00, 2.00]);
      var given = mol ? '$' + qv(fix(ca * V), 'mol') + '$ of $' + F(B.a) + '$ and $' + qv(fix(cb * V), 'mol') + '$ of $' + F(B.b) + '$ in $' + qv(V, 'L', 3) + '$ of solution' : '$' + cc(B.a) + ' = ' + qv(ca, 'M') + '$ and $' + cc(B.b) + ' = ' + qv(cb, 'M') + '$';
      return P('A buffer has ' + given + '. ' + (useKa ? 'The acid has $K_a = ' + gv(KaG) + '$.' : 'The $\\text{p}K_a$ of $' + F(B.a) + '$ is ' + pKa.toFixed(2) + '.') + ' What is the pH? (Use a calculator.)', phA(pH), [
        useKa ? '$\\text{p}K_a = -\\log(' + gv(KaG) + ') = ' + d2(pKa) + '$.' : 'Henderson–Hasselbalch: $\\text{pH} = \\text{p}K_a + \\log\\dfrac{[\\text{base}]}{[\\text{acid}]}$.',
        mol ? 'Both are in the same volume, so the ratio of moles equals the ratio of concentrations: $\\dfrac{' + gv(fix(cb * V)) + '}{' + gv(fix(ca * V)) + '} = ' + fx(ratio, 3) + '$.' : 'Ratio, base over acid: $\\dfrac{' + gv(cb) + '}{' + gv(ca) + '} = ' + fx(ratio, 3) + '$.',
        '$\\text{pH} = ' + d2(pKa) + ' + \\log(' + fx(ratio, 3) + ') = ' + d2(pKa) + (log10(ratio) < 0 ? ' - ' : ' + ') + d2(M.abs(log10(ratio))) + ' = ' + d2(pH) + '$. ' + (ratio > 1 ? 'More base than acid, so the pH is above the $\\text{p}K_a$.' : 'More acid than base, so the pH is below the $\\text{p}K_a$.')
      ], 'pH = pKa + log(base/acid): base on top.', null, { k: 'hh', pKa: pKa, ca: ca, cb: cb, ans: pH }); }
    var target = rd(pKa + R.pick([-0.6, -0.4, -0.3, 0.2, 0.3, 0.5, 0.7]), 2), r = M.pow(10, target - pKa);
    if (kind === 'ratio') return P('What ratio $' + cc(B.b) + '/' + cc(B.a) + '$ gives a buffer of pH ' + target.toFixed(2) + '? The $\\text{p}K_a$ of $' + F(B.a) + '$ is ' + pKa.toFixed(2) + '. (Use a calculator.)', num(r, 3, 0.03), [
      '$\\text{pH} = \\text{p}K_a + \\log\\dfrac{[\\text{base}]}{[\\text{acid}]}$, so $\\log\\dfrac{[\\text{base}]}{[\\text{acid}]} = ' + target.toFixed(2) + ' - ' + pKa.toFixed(2) + ' = ' + dN(target - pKa, 2) + '$.',
      'Undo the log: $\\dfrac{[\\text{base}]}{[\\text{acid}]} = 10^{' + dN(target - pKa, 2) + '} = ' + fx(r, 3) + '$. ' + (r > 1 ? 'A pH above the pKa needs more base than acid.' : 'A pH below the pKa needs more acid than base.')
    ], 'Solve the Henderson–Hasselbalch equation for the ratio.', null, { k: 'hhr', pKa: pKa, pH: target, ans: r });
    var Bm = R.pick([BUFS[0], BUFS[1], BUFS[4]]), V2 = R.pick([0.500, 1.00, 0.250]), Ca = R.pick([0.100, 0.200, 0.150]), tgt = rd(Bm.pKa + R.pick([-0.3, -0.2, 0.2, 0.3, 0.4]), 2), r2 = M.pow(10, tgt - Bm.pKa);
    var nAc = Ca * V2, nB = r2 * nAc, Ms = Bm.salt === 'NH4Cl' ? 53.50 : Bm.salt === 'NaCH3COO' ? 82.04 : Bm.salt === 'NaF' ? 41.99 : 68.01, mass = nB * Ms;
    var acidSide = Bm.salt === 'NH4Cl';
    if (acidSide) { // ammonia buffer: NH4Cl is the acid partner
      var nNH3 = Ca * V2, nNH4 = nNH3 / r2, mass2 = nNH4 * Ms;
      return P('How many grams of ammonium chloride ($\\mathrm{NH_4Cl}$, $53.50\\ \\text{g/mol}$) must be dissolved in $' + qv(V2, 'L', 3) + '$ of $' + qv(Ca, 'M', 3) + '$ $\\mathrm{NH_3}$ to make a buffer of pH ' + tgt.toFixed(2) + '? The $\\text{p}K_a$ of $\\mathrm{NH_4^+}$ is 9.25. (Assume the volume does not change. Use a calculator.)', num(mass2, 3, 0.03), [
        'Ratio needed: $\\dfrac{[\\mathrm{NH_3}]}{[\\mathrm{NH_4^+}]} = 10^{' + tgt.toFixed(2) + ' - 9.25} = ' + fx(r2, 3) + '$.',
        'Moles of $\\mathrm{NH_3}$: $' + gv(Ca, 3) + ' \\times ' + gv(V2, 3) + ' = ' + fx(nNH3, 3) + '\\ \\text{mol}$, so moles of $\\mathrm{NH_4^+} = \\dfrac{' + fx(nNH3, 3) + '}{' + fx(r2, 3) + '} = ' + fx(nNH4, 3) + '\\ \\text{mol}$.',
        'Mass: $' + fx(nNH4, 3) + ' \\times 53.50 = ' + q(mass2, 'g') + '$.'
      ], 'Find the ratio from the pH, then the moles of the salt, then grams.', 'g', { k: 'hhm', pKa: 9.25, pH: tgt, nOther: nNH3, saltIsAcid: true, M: Ms, ans: mass2 }); }
    return P('How many grams of ' + (Bm.salt === 'NaCH3COO' ? 'sodium acetate' : Bm.salt === 'NaF' ? 'sodium fluoride' : 'sodium formate') + ' ($' + F(Bm.salt) + '$, $' + Ms.toFixed(2) + '\\ \\text{g/mol}$) must be dissolved in $' + qv(V2, 'L', 3) + '$ of $' + qv(Ca, 'M', 3) + '$ $' + F(Bm.a) + '$ to make a buffer of pH ' + tgt.toFixed(2) + '? The $\\text{p}K_a$ is ' + Bm.pKa.toFixed(2) + '. (Assume the volume does not change. Use a calculator.)', num(mass, 3, 0.03), [
      'Ratio needed: $\\dfrac{[\\text{base}]}{[\\text{acid}]} = 10^{' + tgt.toFixed(2) + ' - ' + Bm.pKa.toFixed(2) + '} = ' + fx(r2, 3) + '$.',
      'Moles of acid: $' + gv(Ca, 3) + ' \\times ' + gv(V2, 3) + ' = ' + fx(nAc, 3) + '\\ \\text{mol}$, so moles of base $= ' + fx(r2, 3) + ' \\times ' + fx(nAc, 3) + ' = ' + fx(nB, 3) + '\\ \\text{mol}$.',
      'Mass: $' + fx(nB, 3) + ' \\times ' + Ms.toFixed(2) + ' = ' + q(mass, 'g') + '$.'
    ], 'Ratio from the pH, then moles of the base, then grams.', 'g', { k: 'hhm', pKa: Bm.pKa, pH: tgt, nOther: nAc, saltIsAcid: false, M: Ms, ans: mass });
  });

  var SPEC = [['acetic acid', 'CH3COOH', 'CH3COO^-', 4.74], ['lactic acid', 'HC3H5O3', 'C3H5O3^-', 3.86], ['the ammonium ion', 'NH4^+', 'NH3', 9.25], ['dihydrogen phosphate', 'H2PO4^-', 'HPO4^2-', 7.21],
    ['hypochlorous acid', 'HOCl', 'OCl^-', 7.54], ['phenol', 'C6H5OH', 'C6H5O^-', 9.89], ['benzoic acid', 'C6H5COOH', 'C6H5COO^-', 4.20], ['hydrocyanic acid', 'HCN', 'CN^-', 9.31]];
  G('gchem2.ph-pka-species', function (R, ctx) {
    var kind = lv(ctx, R.pick(['dom', 'dom', 'equal']), R.pick(['dom', 'ratio', 'frac']), R.pick(['frac', 'ratio', 'fracBase']));
    var S = R.pick(SPEC), pKa = S[3], pH = rd(pKa + R.pick([-2.3, -1.6, -1.2, -0.7, 0.6, 1.1, 1.5, 2.2]), 2), r = M.pow(10, pH - pKa);
    var intro = 'For ' + S[0] + ', $' + F(S[1]) + '$ ($\\text{p}K_a = ' + pKa.toFixed(2) + '$), with its conjugate base $' + F(S[2]) + '$: ';
    if (kind === 'dom') { var ans = pH > pKa ? 'The base form, $' + F(S[2]) + '$' : 'The acid form, $' + F(S[1]) + '$';
      return P(intro + 'which form is the main one in a solution at pH ' + pH.toFixed(2) + '?', mc(ans, [pH > pKa ? 'The acid form, $' + F(S[1]) + '$' : 'The base form, $' + F(S[2]) + '$', 'Equal amounts of both']), [
        'From Henderson–Hasselbalch, $\\dfrac{[' + F(S[2]) + ']}{[' + F(S[1]) + ']} = 10^{\\text{pH} - \\text{p}K_a} = 10^{' + dN(pH - pKa, 2) + '} = ' + fx(r, 2) + '$.',
        pH > pKa ? 'The pH is above the $\\text{p}K_a$: the solution is poorer in $\\mathrm{H_3O^+}$ than at the halfway point, so the acid has lost its proton. The base form dominates.' : 'The pH is below the $\\text{p}K_a$: there is plenty of $\\mathrm{H_3O^+}$, so the proton stays on. The acid (protonated) form dominates.'
      ], 'Below the pKa: protonated form. Above: deprotonated form.', null, { k: 'spdom', pKa: pKa, pH: pH, ans: pH > pKa ? 'base' : 'acid' }); }
    if (kind === 'equal') return P(intro + 'at what pH are the two forms present in equal amounts?', phA(pKa), ['Henderson–Hasselbalch: $\\text{pH} = \\text{p}K_a + \\log\\dfrac{[\\text{base}]}{[\\text{acid}]}$.', 'Equal amounts make the ratio 1 and $\\log 1 = 0$, so $\\text{pH} = \\text{p}K_a = ' + pKa.toFixed(2) + '$.'], 'When is the log term zero?', null, { k: 'speq', ans: pKa });
    if (kind === 'ratio') return P(intro + 'what is the ratio $[' + F(S[2]) + ']/[' + F(S[1]) + ']$ at pH ' + pH.toFixed(2) + '? (Use a calculator.)', num(r, 2, 0.03), ['$\\log\\dfrac{[\\text{base}]}{[\\text{acid}]} = \\text{pH} - \\text{p}K_a = ' + pH.toFixed(2) + ' - ' + pKa.toFixed(2) + ' = ' + dN(pH - pKa, 2) + '$.', 'Ratio $= 10^{' + dN(pH - pKa, 2) + '} = ' + fx(r, 2) + '$.'], 'Ratio = 10^(pH − pKa).', null, { k: 'spr', pKa: pKa, pH: pH, ans: r });
    var fa = 100 / (1 + r), base = kind === 'fracBase', val = base ? 100 - fa : fa;
    return P(intro + 'what percent of the total is in the ' + (base ? 'base' : 'acid') + ' form, $' + F(base ? S[2] : S[1]) + '$, at pH ' + pH.toFixed(2) + '? (Use a calculator.)', { t: 'num', v: sfStr(val, 3), rtol: 0.03, pct: true }, [
      'Ratio $\\dfrac{[\\text{base}]}{[\\text{acid}]} = 10^{' + dN(pH - pKa, 2) + '} = ' + fx(r, 3) + '$.',
      'Fraction in the acid form $= \\dfrac{1}{1 + ' + fx(r, 3) + '} = ' + fx(fa / 100, 3) + '$, i.e. $' + fx(fa, 3) + '\\%$; the base form has the other $' + fx(100 - fa, 3) + '\\%$.'
    ], 'Turn the ratio into a fraction: acid share = 1/(1 + ratio).', '%', { k: 'spf', pKa: pKa, pH: pH, base: base, ans: val });
  });

  G('gchem2.buffer-additions', function (R, ctx) {
    var L = ctx.level || 1, B = R.pick([BUFS[0], BUFS[1], BUFS[3], BUFS[4]]), pKa = B.pKa, acid = R.coin();
    var nHA, nA, add, V, tot, Vt = 1.00, steps = [];
    if (L <= 2) { nHA = R.pick([0.20, 0.25, 0.30, 0.50]); nA = L === 1 ? nHA : R.pick([0.15, 0.20, 0.30, 0.40]); add = R.pick([0.020, 0.030, 0.050, 0.010, 0.040]); V = 1.00;
      var q0 = 'A $1.00\\text{-L}$ buffer holds $' + qv(nHA, 'mol') + '$ of $' + F(B.a) + '$ and $' + qv(nA, 'mol') + '$ of $' + F(B.b) + '$ ($\\text{p}K_a = ' + pKa.toFixed(2) + '$). What is the pH after $' + qv(add, 'mol') + '$ of ' + (acid ? 'HCl gas' : 'solid NaOH') + ' is added (no volume change)? (Use a calculator.)';
    } else { V = R.pick([100.0, 50.0, 200.0]); var cHA = R.pick([0.100, 0.200, 0.150]), cA = R.pick([0.100, 0.150, 0.200]), vAdd = R.pick([10.0, 5.0, 20.0, 15.0]), cAdd = R.pick([0.100, 0.200]);
      nHA = cHA * V / 1000; nA = cA * V / 1000; add = cAdd * vAdd / 1000; Vt = (V + vAdd) / 1000;
      var q0 = '$' + qv(V, 'mL', 4) + '$ of a buffer that is $' + qv(cHA, 'M', 3) + '$ in $' + F(B.a) + '$ and $' + qv(cA, 'M', 3) + '$ in $' + F(B.b) + '$ ($\\text{p}K_a = ' + pKa.toFixed(2) + '$) is mixed with $' + qv(vAdd, 'mL', 3) + '$ of $' + qv(cAdd, 'M', 3) + '$ ' + (acid ? 'HCl' : 'NaOH') + '. What is the pH afterward? (Use a calculator.)';
      steps.push('Moles first (molarity × liters): $' + F(B.a) + '$: $' + fx(nHA * 1000, 3) + '\\ \\text{mmol}$; $' + F(B.b) + '$: $' + fx(nA * 1000, 3) + '\\ \\text{mmol}$; added ' + (acid ? '$\\mathrm{H_3O^+}$' : '$\\mathrm{OH^-}$') + ': $' + fx(add * 1000, 3) + '\\ \\text{mmol}$.'); }
    if (add >= (acid ? nA : nHA) * 0.8) add = sgf((acid ? nA : nHA) * 0.3, 2);
    var nHA2 = acid ? nHA + add : nHA - add, nA2 = acid ? nA - add : nA + add, pH0 = pKa + log10(nA / nHA), pH = pKa + log10(nA2 / nHA2), u = L <= 2 ? '\\text{mol}' : '\\text{mmol}', k = L <= 2 ? 1 : 1000;
    steps.push('Stoichiometry first: the added ' + (acid ? 'acid reacts completely with the base, $' + EQ(B.b + ' + H3O^+ -> ' + B.a + ' + H2O') + '$' : 'base reacts completely with the acid, $' + EQ(B.a + ' + OH^- -> ' + B.b + ' + H2O') + '$') + '.');
    steps.push('After the reaction: $' + F(B.a) + '$: $' + fx(nHA2 * k, 3) + '\\ ' + u + '$; $' + F(B.b) + '$: $' + fx(nA2 * k, 3) + '\\ ' + u + '$.');
    steps.push('Then Henderson–Hasselbalch (the volume cancels in the ratio): $\\text{pH} = ' + pKa.toFixed(2) + ' + \\log\\dfrac{' + fx(nA2 * k, 3) + '}{' + fx(nHA2 * k, 3) + '} = ' + d2(pH) + '$.');
    steps.push('Before the addition the pH was ' + d2(pH0) + ', so it ' + (acid ? 'fell' : 'rose') + ' by only ' + d2(M.abs(pH - pH0)) + '.');
    return P(q0, phA(pH), steps, 'Do the neutralization with moles first; only then use the new ratio in Henderson–Hasselbalch.', null, { k: 'bufadd', pKa: pKa, nHA: nHA, nA: nA, add: acid ? add : -add, Vt: Vt, ans: pH });
  });

  var BUFCHOICE = [['formic acid / formate', 3.74], ['acetic acid / acetate', 4.74], ['dihydrogen phosphate / hydrogen phosphate', 7.21], ['hypochlorous acid / hypochlorite', 7.54], ['ammonium / ammonia', 9.25], ['hydrogen carbonate / carbonate', 10.33]];
  G('gchem2.buffer-capacity', function (R, ctx) {
    var kind = lv(ctx, R.pick(['choose', 'compare']), R.pick(['choose', 'moles', 'compare']), R.pick(['moles', 'range', 'choose']));
    if (kind === 'choose') { var opts = R.sample(BUFCHOICE, 4).sort(function (a, b) { return a[1] - b[1]; }), best = R.pick(opts), tgt = rd(best[1] + R.pick([-0.3, -0.2, 0.2, 0.3]), 1);
      var near = opts.slice().sort(function (a, b) { return M.abs(a[1] - tgt) - M.abs(b[1] - tgt); })[0];
      return P('You need a buffer at pH ' + tgt.toFixed(1) + '. Which conjugate pair is the best choice? ' + opts.map(function (o) { return o[0] + ' ($\\text{p}K_a$ ' + o[1].toFixed(2) + ')'; }).join('; ') + '.', mc(cap(near[0]), opts.filter(function (o) { return o !== near; }).map(function (o) { return cap(o[0]); })), [
        'A buffer works best when its pH is close to the $\\text{p}K_a$: then the acid and base are present in similar amounts, and the pair can absorb added acid or base equally well.',
        'The $\\text{p}K_a$ nearest ' + tgt.toFixed(1) + ' is ' + near[1].toFixed(2) + ': ' + near[0] + '. A useful buffer range is about $\\text{p}K_a \\pm 1$.'
      ], 'Pick the pKa closest to the target pH.', null, { k: 'bufch', tgt: tgt, ans: cap(near[0]) }); }
    if (kind === 'compare') { var c1 = R.pick([0.10, 0.050, 0.20]), f = R.pick([2, 5, 10]), c2 = c1 * f;
      return P('Buffer X is $' + qv(c1, 'M') + '$ acetic acid and $' + qv(c1, 'M') + '$ sodium acetate. Buffer Y is $' + qv(c2, 'M') + '$ acetic acid and $' + qv(c2, 'M') + '$ sodium acetate. Which statement is right?', mc('They have the same pH, but Y can absorb more added acid or base', ['X has the higher capacity because it is more dilute', 'Y has a lower pH because it holds more acid', 'They have the same pH and the same capacity']), [
        'Both have base/acid ratio 1, so both have $\\text{pH} = \\text{p}K_a = 4.74$: the pH depends on the ratio only.',
        'Capacity depends on the amounts: Y holds ' + f + ' times as much of each partner, so it can take ' + f + ' times as much acid or base before one partner runs out.'
      ], 'pH depends on the ratio; capacity depends on how much of each is there.', null, { k: 'bufcomp', ans: 'same pH' }); }
    if (kind === 'range') { var Bq = R.pick(BUFCHOICE), lo = Bq[1] - 1, hi = Bq[1] + 1, test = rd(Bq[1] + R.pick([-2.2, -1.6, 1.7, 2.3, 0.4, -0.5]), 1), ok = test >= lo && test <= hi;
      return P('A ' + Bq[0] + ' buffer has $\\text{p}K_a = ' + Bq[1].toFixed(2) + '$. True or false: it is a good choice for holding a solution at pH ' + test.toFixed(1) + '.', tf(ok), [
        'A buffer is useful within about one pH unit of its $\\text{p}K_a$: from ' + lo.toFixed(2) + ' to ' + hi.toFixed(2) + '. Outside that range one partner is less than a tenth of the other.',
        'pH ' + test.toFixed(1) + ' is ' + (ok ? 'inside' : 'outside') + ' that range, so the statement is ' + (ok ? 'true' : 'false') + '.'
      ], 'Useful range: pKa ± 1.', null, { k: 'bufrange', pKa: Bq[1], pH: test, ans: ok }); }
    var nA = R.pick([0.10, 0.20, 0.30, 0.25]), nHA = R.pick([0.10, 0.20, 0.30, 0.25]), base = R.coin(), r0 = nA / nHA;
    var x = base ? (10 * r0 * nHA - nA) / (1 + 10 * r0) : (nA - (r0 / 10) * nHA) / (1 + r0 / 10);
    return P('A buffer holds $' + qv(nHA, 'mol') + '$ of acetic acid and $' + qv(nA, 'mol') + '$ of acetate ion. How many moles of ' + (base ? 'NaOH' : 'HCl') + ' can it absorb before its pH ' + (base ? 'rises' : 'falls') + ' by 1.00 unit? (Use a calculator.)', num(x), [
      'A change of 1 pH unit means the ratio base/acid changes by a factor of 10: from ' + fx(r0, 3) + ' to ' + fx(base ? 10 * r0 : r0 / 10, 3) + '.',
      base ? 'Adding $x$ mol of OH⁻: $\\dfrac{' + gv(nA) + ' + x}{' + gv(nHA) + ' - x} = ' + fx(10 * r0, 3) + '$.' : 'Adding $x$ mol of H₃O⁺: $\\dfrac{' + gv(nA) + ' - x}{' + gv(nHA) + ' + x} = ' + fx(r0 / 10, 3) + '$.',
      'Solve for $x$: $x = ' + q(x, 'mol') + '$. A buffer with more of each partner could absorb more.'
    ], 'Set the new ratio equal to 10 times (or 1/10 of) the old one and solve for x.', 'mol', { k: 'bufcap', nA: nA, nHA: nHA, base: base, ans: x });
  });

  function saPH(H) { return -log10(H); }
  G('gchem2.strong-titration-curves', function (R, ctx) {
    var kind = lv(ctx, R.pick(['Veq', 'initial', 'eq']), R.pick(['before', 'after', 'Veq']), R.pick(['before', 'after', 'baseFirst']));
    var Va = R.pick([25.0, 20.0, 50.0, 40.0]), Ca = R.pick([0.100, 0.200, 0.150, 0.120]), Cb = R.pick([0.100, 0.200, 0.150, 0.250]), Veq = Ca * Va / Cb;
    var intro = '$' + qv(Va, 'mL', 3) + '$ of $' + qv(Ca, 'M', 3) + '$ HCl is titrated with $' + qv(Cb, 'M', 3) + '$ NaOH. ';
    var na = Ca * Va;
    if (kind === 'Veq') return P(intro + 'What volume of NaOH reaches the equivalence point?', num(Veq), ['At equivalence, moles of $\\mathrm{OH^-}$ added = moles of $\\mathrm{H_3O^+}$ at the start.', 'Moles of HCl: $' + gv(Ca, 3) + '\\ \\text{M} \\times ' + gv(Va, 3) + '\\ \\text{mL} = ' + fx(na, 3) + '\\ \\text{mmol}$.', 'Volume of NaOH: $\\dfrac{' + fx(na, 3) + '\\ \\text{mmol}}{' + gv(Cb, 3) + '\\ \\text{M}} = ' + q(Veq, 'mL') + '$.'], 'Moles of base needed = moles of acid present.', 'mL', { k: 'stveq', Ca: Ca, Va: Va, Cb: Cb, ans: Veq });
    if (kind === 'initial') return P(intro + 'What is the pH before any NaOH is added?', phA(saPH(Ca)), ['HCl is a strong acid, so $[\\mathrm{H_3O^+}] = ' + qv(Ca, 'M', 3) + '$.', '$' + pHq(Ca) + '$.'], 'Strong acid: [H₃O⁺] equals its concentration.', null, { k: 'st', Ca: Ca, Va: Va, Cb: Cb, Vb: 0, ans: saPH(Ca) });
    if (kind === 'eq') return P(intro + 'What is the pH at the equivalence point (25 °C)?', phA(7), ['At equivalence all the $\\mathrm{H_3O^+}$ and $\\mathrm{OH^-}$ have reacted, leaving NaCl in water.', 'Neither $\\mathrm{Na^+}$ nor $\\mathrm{Cl^-}$ reacts with water, so the solution is neutral: pH 7.00 at 25 °C. (This is true only for a strong acid with a strong base.)'], 'What is left at equivalence, and does it react with water?', null, { k: 'st', Ca: Ca, Va: Va, Cb: Cb, Vb: Veq, ans: 7 });
    if (kind === 'baseFirst') { var Vb0 = R.pick([20.0, 25.0, 40.0]), Cb0 = R.pick([0.100, 0.200, 0.150]), Ca0 = R.pick([0.100, 0.200, 0.250]), Veq0 = Cb0 * Vb0 / Ca0, Vx = rd(Veq0 * R.pick([0.4, 0.6, 0.8, 1.2, 1.4]), 1);
      var nb = Cb0 * Vb0, nax = Ca0 * Vx, tot = Vb0 + Vx, pHx, st2;
      if (Vx < Veq0) { var OH = (nb - nax) / tot; pHx = 14 + log10(OH); st2 = 'Base is in excess: $' + fx(nb, 3) + ' - ' + fx(nax, 3) + ' = ' + fx(nb - nax, 3) + '\\ \\text{mmol}$ of $\\mathrm{OH^-}$ in $' + gv(Vb0) + ' + ' + gv(Vx) + ' = ' + fx(tot, 3) + '\\ \\text{mL}$: $[\\mathrm{OH^-}] = ' + fx(OH, 3) + '\\ \\text{M}$, $\\text{pOH} = ' + d2(-log10(OH)) + '$, $\\text{pH} = ' + d2(pHx) + '$.'; }
      else { var H = (nax - nb) / tot; pHx = -log10(H); st2 = 'Acid is in excess: $' + fx(nax, 3) + ' - ' + fx(nb, 3) + ' = ' + fx(nax - nb, 3) + '\\ \\text{mmol}$ of $\\mathrm{H_3O^+}$ in $' + fx(tot, 3) + '\\ \\text{mL}$: $[\\mathrm{H_3O^+}] = ' + fx(H, 3) + '\\ \\text{M}$, $\\text{pH} = ' + d2(pHx) + '$.'; }
      return P('$' + qv(Vb0, 'mL', 3) + '$ of $' + qv(Cb0, 'M', 3) + '$ NaOH is titrated with $' + qv(Ca0, 'M', 3) + '$ HCl. What is the pH after $' + qv(Vx, 'mL', 3) + '$ of HCl has been added?', phA(pHx), [
        'Moles: $\\mathrm{OH^-}$: $' + gv(Cb0, 3) + ' \\times ' + gv(Vb0, 3) + ' = ' + fx(nb, 3) + '\\ \\text{mmol}$; $\\mathrm{H_3O^+}$ added: $' + gv(Ca0, 3) + ' \\times ' + gv(Vx, 3) + ' = ' + fx(nax, 3) + '\\ \\text{mmol}$. They react one to one.', st2,
        'Divide by the total volume of both solutions, not just the starting one.'
      ], 'Moles react first; then divide the excess by the combined volume.', null, { k: 'stb', Cb: Cb0, Vb: Vb0, Ca: Ca0, Va: Vx, ans: pHx }); }
    var Vb = rd(Veq * (kind === 'before' ? R.pick([0.2, 0.4, 0.5, 0.6, 0.8, 0.9]) : R.pick([1.1, 1.2, 1.4, 1.6])), 1), nb2 = Cb * Vb, tot2 = Va + Vb, pH, st;
    if (kind === 'before') { var H2 = (na - nb2) / tot2; pH = -log10(H2); st = ['Moles: HCl $' + gv(Ca, 3) + ' \\times ' + gv(Va, 3) + ' = ' + fx(na, 3) + '\\ \\text{mmol}$; NaOH added $' + gv(Cb, 3) + ' \\times ' + gv(Vb, 3) + ' = ' + fx(nb2, 3) + '\\ \\text{mmol}$.', 'Before equivalence some acid is left: $' + fx(na, 3) + ' - ' + fx(nb2, 3) + ' = ' + fx(na - nb2, 3) + '\\ \\text{mmol}$ of $\\mathrm{H_3O^+}$.', 'Total volume: $' + gv(Va, 3) + ' + ' + gv(Vb, 3) + ' = ' + fx(tot2, 3) + '\\ \\text{mL}$, so $[\\mathrm{H_3O^+}] = \\dfrac{' + fx(na - nb2, 3) + '}{' + fx(tot2, 3) + '} = ' + fx(H2, 3) + '\\ \\text{M}$.', '$\\text{pH} = ' + d2(pH) + '$.']; }
    else { var OH2 = (nb2 - na) / tot2; pH = 14 + log10(OH2); st = ['Moles: HCl $' + fx(na, 3) + '\\ \\text{mmol}$; NaOH added $' + gv(Cb, 3) + ' \\times ' + gv(Vb, 3) + ' = ' + fx(nb2, 3) + '\\ \\text{mmol}$.', 'Past equivalence, base is in excess: $' + fx(nb2 - na, 3) + '\\ \\text{mmol}$ of $\\mathrm{OH^-}$.', 'Total volume $' + fx(tot2, 3) + '\\ \\text{mL}$: $[\\mathrm{OH^-}] = ' + fx(OH2, 3) + '\\ \\text{M}$, $\\text{pOH} = ' + d2(-log10(OH2)) + '$.', '$\\text{pH} = 14.00 - ' + d2(-log10(OH2)) + ' = ' + d2(pH) + '$.']; }
    return P(intro + 'What is the pH after $' + qv(Vb, 'mL', 3) + '$ of NaOH has been added? (Use a calculator.)', phA(pH), st, 'Moles react first; then divide what is left over by the combined volume.', null, { k: 'st', Ca: Ca, Va: Va, Cb: Cb, Vb: Vb, ans: pH }, { name: 'ch-titration', opts: { acid: { type: 'strong', C: Ca, V: Va }, base: { C: Cb }, vol: Vb, quiet: true, show: ['landmarks'], edit: false } });
  });

  G('gchem2.weak-titration-curves', function (R, ctx) {
    var kind = lv(ctx, R.pick(['half', 'Veq', 'pKa']), R.pick(['eq', 'buffer', 'half', 'initial']), R.pick(['eq', 'after', 'baseEq', 'buffer']));
    var k = acidKey(R, function (kk) { return ['CH3COOH', 'HCOOH', 'C6H5COOH', 'HOCl', 'CH3CH2COOH', 'HNO2'].indexOf(kk) >= 0; }), A = ACID[k], Ka = A.Ka, pKa = -log10(Ka);
    var Va = R.pick([25.0, 50.0, 20.0, 40.0]), Ca = R.pick([0.100, 0.200, 0.150]), Cb = R.pick([0.100, 0.200, 0.250]), Veq = Ca * Va / Cb, na = Ca * Va;
    var intro = '$' + qv(Va, 'mL', 3) + '$ of $' + qv(Ca, 'M', 3) + '$ ' + A.name + ' ($K_a = ' + gv(Ka) + '$) is titrated with $' + qv(Cb, 'M', 3) + '$ NaOH. ';
    var viz = { name: 'ch-titration', opts: { acid: { type: 'weak', Ka: Ka, C: Ca, V: Va }, base: { C: Cb }, vol: rd(Veq / 2, 2), quiet: true, show: ['landmarks'], edit: false } };
    if (kind === 'half') return P(intro + 'What is the pH after half of the NaOH needed for equivalence has been added? (Use a calculator.)', phA(pKa), ['Halfway to equivalence, half of the acid has become its conjugate base, so $[' + F(A.base) + '] = [' + F(k) + ']$.', 'Henderson–Hasselbalch: $\\text{pH} = \\text{p}K_a + \\log 1 = \\text{p}K_a = -\\log(' + gv(Ka) + ') = ' + d2(pKa) + '$.', 'This is how the $\\text{p}K_a$ of a weak acid is read off a titration curve.'], 'At half-equivalence, acid and conjugate base are equal.', null, { k: 'wt', Ka: Ka, Ca: Ca, Va: Va, Cb: Cb, Vb: Veq / 2, ans: pKa }, viz);
    if (kind === 'Veq') return P(intro + 'What volume of NaOH reaches the equivalence point?', num(Veq), ['Equivalence depends only on moles, not on how strong the acid is.', 'Moles of acid: $' + gv(Ca, 3) + ' \\times ' + gv(Va, 3) + ' = ' + fx(na, 3) + '\\ \\text{mmol}$; NaOH needed: $\\dfrac{' + fx(na, 3) + '}{' + gv(Cb, 3) + '} = ' + q(Veq, 'mL') + '$.'], 'Moles of base = moles of acid.', 'mL', { k: 'wtveq', Ca: Ca, Va: Va, Cb: Cb, ans: Veq });
    if (kind === 'pKa') { var pHh = rd(pKa, 2); return P('In the titration of a weak acid with NaOH, the equivalence point comes at $' + qv(rd(Veq, 1), 'mL', 3) + '$. After $' + gv(rd(Veq / 2, 2)) + '\\ \\text{mL}$ the pH is ' + pHh.toFixed(2) + '. What is $K_a$ of the acid? (Use a calculator.)', num(M.pow(10, -pHh), 2, 0.03), [gv(rd(Veq / 2, 2)) + ' mL is half the equivalence volume, where $[\\text{HA}] = [\\text{A}^-]$ and $\\text{pH} = \\text{p}K_a$.', 'So $\\text{p}K_a = ' + pHh.toFixed(2) + '$ and $K_a = 10^{-' + pHh.toFixed(2) + '} = ' + fx(M.pow(10, -pHh), 2) + '$.'], 'Where on the curve does pH equal pKa?', null, { k: 'wtka', pH: pHh, ans: M.pow(10, -pHh) }); }
    if (kind === 'initial') { var x0 = waApprox(Ka, Ca), ex0 = x0 / Ca > 0.05; if (ex0) x0 = waExact(Ka, Ca);
      return P(intro + 'What is the pH before any NaOH is added? (Use a calculator.)', phA(-log10(x0)), weakSteps(Ka, Ca, k, A.base, 'K_a', x0, ex0).concat(['$' + pHq(x0) + '$. Higher than a strong acid of the same concentration would give.']), 'It is just a weak acid solution.', null, { k: 'wt', Ka: Ka, Ca: Ca, Va: Va, Cb: Cb, Vb: 0, ans: -log10(x0) }); }
    if (kind === 'buffer') { if (k === 'HNO2') { k = 'CH3COOH'; A = ACID[k]; Ka = A.Ka; pKa = -log10(Ka); intro = '$' + qv(Va, 'mL', 3) + '$ of $' + qv(Ca, 'M', 3) + '$ ' + A.name + ' ($K_a = ' + gv(Ka) + '$) is titrated with $' + qv(Cb, 'M', 3) + '$ NaOH. '; viz.opts.acid.Ka = Ka; }
      var Vb = rd(Veq * R.pick([0.3, 0.4, 0.6, 0.75, 0.8]), 1), nb = Cb * Vb, pH = pKa + log10(nb / (na - nb));
      return P(intro + 'What is the pH after $' + qv(Vb, 'mL', 3) + '$ of NaOH has been added? (Use a calculator.)', phA(pH), [
        'Moles: acid $' + fx(na, 3) + '\\ \\text{mmol}$; $\\mathrm{OH^-}$ added $' + gv(Cb, 3) + ' \\times ' + gv(Vb, 3) + ' = ' + fx(nb, 3) + '\\ \\text{mmol}$.',
        'The $\\mathrm{OH^-}$ turns that much acid into its conjugate base: $' + F(k) + '$ left $' + fx(na - nb, 3) + '\\ \\text{mmol}$, $' + F(A.base) + '$ formed $' + fx(nb, 3) + '\\ \\text{mmol}$. This is a buffer.',
        '$\\text{pH} = \\text{p}K_a + \\log\\dfrac{' + fx(nb, 3) + '}{' + fx(na - nb, 3) + '} = ' + d2(pKa) + (log10(nb / (na - nb)) < 0 ? ' - ' : ' + ') + d2(M.abs(log10(nb / (na - nb)))) + ' = ' + d2(pH) + '$.'
      ], 'Before equivalence the flask holds a buffer: stoichiometry, then Henderson–Hasselbalch.', null, { k: 'wt', Ka: Ka, Ca: Ca, Va: Va, Cb: Cb, Vb: Vb, ans: pH }, viz); }
    if (kind === 'eq') { var tot = Va + Veq, CA = na / tot, Kb = 1e-14 / Ka, OH = M.sqrt(Kb * CA), pOH = -log10(OH), pHe = 14 - pOH;
      return P(intro + 'What is the pH at the equivalence point? (Use a calculator.)', phA(pHe), [
        'At equivalence all ' + fx(na, 3) + ' mmol of acid has become $' + F(A.base) + '$, now in $' + gv(Va, 3) + ' + ' + fx(Veq, 3) + ' = ' + fx(tot, 3) + '\\ \\text{mL}$: $[' + F(A.base) + '] = ' + fx(CA, 3) + '\\ \\text{M}$.',
        '$' + F(A.base) + '$ is a weak base: $K_b = \\dfrac{K_w}{K_a} = ' + fx(Kb, 3) + '$, so $[\\mathrm{OH^-}] = \\sqrt{K_b \\times ' + fx(CA, 3) + '} = ' + fx(OH, 3) + '\\ \\text{M}$.',
        '$\\text{pOH} = ' + d2(pOH) + '$, so $\\text{pH} = ' + d2(pHe) + '$: above 7, because the conjugate base of a weak acid makes the solution basic.'
      ], 'At equivalence only the conjugate base is left (in the combined volume), and it is a weak base.', null, { k: 'wt', Ka: Ka, Ca: Ca, Va: Va, Cb: Cb, Vb: Veq, ans: pHe }, viz); }
    if (kind === 'after') { var Vb2 = rd(Veq * R.pick([1.1, 1.2, 1.3, 1.5]), 1), tot2 = Va + Vb2, OH2 = (Cb * Vb2 - na) / tot2, pH2 = 14 + log10(OH2);
      return P(intro + 'What is the pH after $' + qv(Vb2, 'mL', 3) + '$ of NaOH has been added? (Use a calculator.)', phA(pH2), [
        'Past equivalence: excess $\\mathrm{OH^-}$ $= ' + fx(Cb * Vb2, 3) + ' - ' + fx(na, 3) + ' = ' + fx(Cb * Vb2 - na, 3) + '\\ \\text{mmol}$ in $' + fx(tot2, 3) + '\\ \\text{mL}$.',
        'The excess strong base swamps the weak base $' + F(A.base) + '$, so $[\\mathrm{OH^-}] = ' + fx(OH2, 3) + '\\ \\text{M}$, $\\text{pOH} = ' + d2(-log10(OH2)) + '$, $\\text{pH} = ' + d2(pH2) + '$.'
      ], 'After equivalence, the excess NaOH sets the pH.', null, { k: 'wt', Ka: Ka, Ca: Ca, Va: Va, Cb: Cb, Vb: Vb2, ans: pH2 }); }
    // weak base titrated with strong acid, at equivalence
    var Vb3 = R.pick([25.0, 50.0, 20.0]), Cb3 = R.pick([0.100, 0.200]), Ca3 = R.pick([0.100, 0.200, 0.250]), Veq3 = Cb3 * Vb3 / Ca3, tot3 = Vb3 + Veq3, CBH = Cb3 * Vb3 / tot3, KaBH = 1e-14 / 1.8e-5, H3 = M.sqrt(KaBH * CBH), pH3 = -log10(H3);
    return P('$' + qv(Vb3, 'mL', 3) + '$ of $' + qv(Cb3, 'M', 3) + '$ ammonia ($K_b = 1.8 \\times 10^{-5}$) is titrated with $' + qv(Ca3, 'M', 3) + '$ HCl. What is the pH at the equivalence point? (Use a calculator.)', phA(pH3), [
      'Equivalence at $' + fx(Veq3, 3) + '\\ \\text{mL}$ of HCl. All the $\\mathrm{NH_3}$ is now $\\mathrm{NH_4^+}$: $\\dfrac{' + fx(Cb3 * Vb3, 3) + '\\ \\text{mmol}}{' + fx(tot3, 3) + '\\ \\text{mL}} = ' + fx(CBH, 3) + '\\ \\text{M}$.',
      '$\\mathrm{NH_4^+}$ is a weak acid: $K_a = \\dfrac{1.0 \\times 10^{-14}}{1.8 \\times 10^{-5}} = ' + fx(KaBH, 3) + '$, so $[\\mathrm{H_3O^+}] = \\sqrt{K_a \\times ' + fx(CBH, 3) + '} = ' + fx(H3, 3) + '\\ \\text{M}$.',
      '$\\text{pH} = ' + d2(pH3) + '$: below 7. A weak base titrated with a strong acid has an acidic equivalence point.'
    ], 'At equivalence only NH₄⁺ is left, a weak acid, in the combined volume.', null, { k: 'wtb', Kb: 1.8e-5, Cb: Cb3, Vb: Vb3, Ca: Ca3, Va: Veq3, ans: pH3 });
  });

  var INDIC = [['methyl orange', 3.1, 4.4], ['bromocresol green', 3.8, 5.4], ['methyl red', 4.4, 6.2], ['bromothymol blue', 6.0, 7.6], ['phenol red', 6.8, 8.4], ['phenolphthalein', 8.2, 10.0], ['thymolphthalein', 9.4, 10.6], ['alizarin yellow R', 10.1, 12.0]];
  G('gchem2.indicators', function (R, ctx) {
    var kind = lv(ctx, R.pick(['choose', 'pKa', 'tf']), R.pick(['choose', 'chooseB', 'pKa']), R.pick(['choose', 'chooseB', 'calc']));
    if (kind === 'pKa') { var Ki = R.int(10, 99) / 10 * M.pow(10, R.int(-10, -3)), p = -log10(Ki);
      return P('An indicator HIn has $K_a = ' + gv(Ki) + '$. Around what pH does it change color? (Give the pH where $[\\mathrm{HIn}] = [\\mathrm{In^-}]$.)', phA(p), ['An indicator is a weak acid whose two forms have different colors: $\\mathrm{HIn \\rightleftharpoons H^+ + In^-}$.', 'Its color is halfway between the two when $[\\mathrm{HIn}] = [\\mathrm{In^-}]$, i.e. at $\\text{pH} = \\text{p}K_a = ' + d2(p) + '$. The eye sees the change over about $\\text{p}K_a \\pm 1$.'], 'An indicator is a weak acid; the color change is centered on its pKa.', null, { k: 'indpka', Ka: Ki, ans: p }); }
    if (kind === 'tf') { var s = R.pick([['Every acid–base titration should use an indicator that changes color at pH 7.', false], ['For a weak acid titrated with NaOH, the indicator should change color above pH 7.', true], ['An indicator should change color on the steep part of the titration curve.', true]]);
      return P('True or false: ' + s[0], tf(s[1]), ['The indicator must change color where the pH jumps, right at the equivalence point.', 'That is at pH 7 only for a strong acid with a strong base. A weak acid with NaOH has its equivalence point above 7; a weak base with HCl, below 7.', 'So the statement is ' + (s[1] ? 'true' : 'false') + '.'], 'Where is the equivalence point for each kind of titration?', null, { k: 'indtf', ans: s[1] }); }
    var eqPH, desc, st0, vz;
    var indK = {};
    if (kind === 'choose' || kind === 'calc') { var ak = R.pick(['CH3COOH', 'HCOOH', 'C6H5COOH', 'CH3CH2COOH']), A = ACID[ak], C = 0.100, tot = 2 * 25.0, CA = C * 25 / tot, OH = M.sqrt(1e-14 / A.Ka * CA); eqPH = 14 + log10(OH);
      desc = '$25.0\\ \\text{mL}$ of $0.100\\ \\text{M}$ ' + A.name + ' ($K_a = ' + gv(A.Ka) + '$) titrated with $0.100\\ \\text{M}$ NaOH';
      indK = { Ka: A.Ka }; vz = { name: 'ch-titration', opts: { acid: { type: 'weak', Ka: A.Ka, C: 0.1, V: 25 }, base: { C: 0.1 }, vol: 25, quiet: true, show: ['landmarks'], edit: false } };
      st0 = 'At equivalence the flask holds $' + F(A.base) + '$ at $0.0500\\ \\text{M}$ (50.0 mL total). It is a weak base: $[\\mathrm{OH^-}] = \\sqrt{(K_w/K_a)(0.0500)} = ' + fx(OH, 3) + '\\ \\text{M}$, so the equivalence pH is ' + d2(eqPH) + '.';
      if (kind === 'calc') return P('What is the pH at the equivalence point of ' + desc + '? (This tells you which indicator to use. Use a calculator.)', phA(eqPH), [st0, 'Choose an indicator whose color change brackets this pH.'], 'Only the conjugate base is left at equivalence, in 50.0 mL.', null, { k: 'indeq', Ka: A.Ka, ans: eqPH });
    } else { var Kb = 1.8e-5, CB = 0.0500, H = M.sqrt(1e-14 / Kb * CB); eqPH = -log10(H);
      desc = '$25.0\\ \\text{mL}$ of $0.100\\ \\text{M}$ ammonia ($K_b = 1.8 \\times 10^{-5}$) titrated with $0.100\\ \\text{M}$ HCl';
      indK = { Kb: Kb }; vz = { name: 'ch-titration', opts: { acid: { type: 'weakbase', Kb: Kb, C: 0.1, V: 25 }, base: { C: 0.1 }, vol: 25, quiet: true, show: ['landmarks'], edit: false } };
      st0 = 'At equivalence the flask holds $\\mathrm{NH_4^+}$ at $0.0500\\ \\text{M}$. It is a weak acid: $[\\mathrm{H_3O^+}] = \\sqrt{(K_w/K_b)(0.0500)} = ' + fx(H, 3) + '\\ \\text{M}$, so the equivalence pH is ' + d2(eqPH) + '.'; }
    var fits = INDIC.filter(function (i) { return i[1] <= eqPH && eqPH <= i[2]; }), bad = INDIC.filter(function (i) { return i[2] < eqPH - 2.0 || i[1] > eqPH + 2.0; });
    var good = R.pick(fits), wr = R.sample(bad, 3);
    var tab = tbl(['Indicator', 'Color change range (pH)'], [good].concat(wr).sort(function (a, b) { return a[1] - b[1]; }).map(function (i) { return [i[0], i[1].toFixed(1) + '–' + i[2].toFixed(1)]; }));
    return P('Which indicator is best for ' + desc + '?' + tab, mc(cap(good[0]), wr.map(function (i) { return cap(i[0]); })), [st0, cap(good[0]) + ' changes color between pH ' + good[1].toFixed(1) + ' and ' + good[2].toFixed(1) + ', right on the steep part of the curve at the equivalence point.', 'The others would change color well before or after the equivalence point.'],
      'First find the pH at the equivalence point.', null, { k: 'indch', Ka: indK.Ka, Kb: indK.Kb, eqPH: eqPH, ans: good[0] }, vz);
  });


  // ================================================================== Unit 4: Solubility and Complex Ions
  // salt: [formula, cation, a (cations per formula), anion, b (anions per formula), Ksp at 25 °C (CRC values), molar mass]
  var SALT = [
    ['AgCl', 'Ag^+', 1, 'Cl^-', 1, 1.8e-10, 143.32], ['AgBr', 'Ag^+', 1, 'Br^-', 1, 5.0e-13, 187.77], ['AgI', 'Ag^+', 1, 'I^-', 1, 8.3e-17, 234.77], ['BaSO4', 'Ba^2+', 1, 'SO4^2-', 1, 1.1e-10, 233.40],
    ['CaCO3', 'Ca^2+', 1, 'CO3^2-', 1, 3.4e-9, 100.09], ['SrSO4', 'Sr^2+', 1, 'SO4^2-', 1, 3.4e-7, 183.69], ['BaCO3', 'Ba^2+', 1, 'CO3^2-', 1, 2.6e-9, 197.34],
    ['PbI2', 'Pb^2+', 1, 'I^-', 2, 9.8e-9, 461.0], ['PbCl2', 'Pb^2+', 1, 'Cl^-', 2, 1.7e-5, 278.1], ['CaF2', 'Ca^2+', 1, 'F^-', 2, 3.5e-11, 78.08], ['Mg(OH)2', 'Mg^2+', 1, 'OH^-', 2, 5.6e-12, 58.33],
    ['BaF2', 'Ba^2+', 1, 'F^-', 2, 1.8e-7, 175.33], ['Fe(OH)2', 'Fe^2+', 1, 'OH^-', 2, 4.9e-17, 89.87],
    ['Ag2CrO4', 'Ag^+', 2, 'CrO4^2-', 1, 1.1e-12, 331.74], ['Ag2CO3', 'Ag^+', 2, 'CO3^2-', 1, 8.5e-12, 275.75], ['Ag2SO4', 'Ag^+', 2, 'SO4^2-', 1, 1.2e-5, 311.81],
    ['Fe(OH)3', 'Fe^3+', 1, 'OH^-', 3, 2.8e-39, 106.88], ['Ca3(PO4)2', 'Ca^2+', 3, 'PO4^3-', 2, 2.1e-33, 310.18]
  ];
  function saltOf(f) { for (var i = 0; i < SALT.length; i++) if (SALT[i][0] === f) return SALT[i]; return null; }
  function kspExpr(S) { return pw(cc(S[1]), S[2]) + pw(cc(S[3]), S[4]); }
  function kspFactor(S) { return M.pow(S[2], S[2]) * M.pow(S[4], S[4]); }       // Ksp = factor × s^(a+b)
  function molarS(S, Ksp) { return M.pow((Ksp || S[5]) / kspFactor(S), 1 / (S[2] + S[4])); }
  function sForm(S) { var f = kspFactor(S), n = S[2] + S[4]; return (f === 1 ? '' : f) + 's^{' + n + '}'; }
  function sRoot(S, K) { var n = S[2] + S[4], f = kspFactor(S), inner = f > 1 ? '\\dfrac{' + gv(K || S[5]) + '}{' + f + '}' : gv(K || S[5]); return n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}'; }
  function dissEq(S) { return S[0] + '(s) <=> ' + (S[2] > 1 ? S[2] : '') + S[1] + '(aq) + ' + (S[4] > 1 ? S[4] : '') + S[3] + '(aq)'; }
  function kspSetup(S) { return '$' + EQ(dissEq(S)) + '$. If $s$ mol/L dissolves, $' + cc(S[1]) + ' = ' + (S[2] > 1 ? S[2] : '') + 's$ and $' + cc(S[3]) + ' = ' + (S[4] > 1 ? S[4] : '') + 's$.'; }
  function kspSub(S) { return 'K_{sp} = ' + kspExpr(S) + ' = ' + (S[2] > 1 ? '(' + S[2] + 's)^{' + S[2] + '}' : 's') + (S[4] > 1 ? '(' + S[4] + 's)^{' + S[4] + '}' : '(s)') + ' = ' + sForm(S); }

  G('gchem2.ksp', function (R, ctx) {
    var kind = lv(ctx, R.pick(['expr', 's', 'ion']), R.pick(['s', 'Ksp', 'ion']), R.pick(['s', 'grams', 'Ksp']));
    var pool = lv(ctx, SALT.filter(function (S) { return S[2] + S[4] <= 3; }), SALT.filter(function (S) { return S[2] + S[4] <= 3; }), SALT), S = R.pick(kind === 'expr' ? SALT.filter(function (S2) { return S2[2] + S2[4] > 2; }) : pool);
    var s = molarS(S), n = S[2] + S[4];
    if (kind === 'expr') { var right = '$K_{sp} = ' + sForm(S) + '$', wr = ['$K_{sp} = s^{' + n + '}$', '$K_{sp} = s^{2}$', '$K_{sp} = ' + (S[2] + S[4]) + 's^{' + n + '}$', '$K_{sp} = 2s^{2}$'];
      return P('A saturated solution of $' + F(S[0]) + '$ has molar solubility $s$. Which expression gives $K_{sp}$ in terms of $s$?', mc(right, wr), [kspSetup(S), '$' + kspSub(S) + '$: each ion\u2019s concentration is raised to the power of its coefficient, and the coefficient also multiplies $s$.'], 'Write each ion concentration in terms of s first, then raise it to its coefficient.', null, { k: 'kspexpr', f: S[0], ans: right }); }
    if (kind === 'ion') { var big = S[2] > S[4] ? 1 : 3, ion = S[2] > 1 ? S[1] : S[4] > 1 ? S[3] : R.pick([S[1], S[3]]), cf2 = ion === S[1] ? S[2] : S[4], v = cf2 * s;
      return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$ at 25 °C. What is $' + cc(ion) + '$ in a saturated solution? (Use a calculator.)', num(v), [kspSetup(S), '$' + kspSub(S) + ' = ' + gv(S[5]) + '$, so $s = ' + sRoot(S) + ' = ' + fx(s, 3) + '\\ \\text{M}$.',
        '$' + cc(ion) + ' = ' + (cf2 > 1 ? cf2 + 's = ' : 's = ') + q(v, 'M') + '$.'], 'Find s first; then each ion concentration is its coefficient times s.', 'M', { k: 'kspion', f: S[0], ion: ion, ans: v }); }
    if (kind === 's') return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$ at 25 °C. What is its molar solubility? (Use a calculator.)', num(s), [kspSetup(S), '$' + kspSub(S) + ' = ' + gv(S[5]) + '$.',
      '$s = ' + sRoot(S) + ' = ' + q(s, 'M') + '$.' + (kspFactor(S) > 1 ? ' (Forgetting the ' + kspFactor(S) + ' would give $' + fx(M.pow(S[5], 1 / n), 3) + '$, too big.)' : '')], 'Ksp = ' + (kspFactor(S) === 1 ? '' : kspFactor(S)) + 's^' + n + ' for this salt; solve for s.', 'M', { k: 'ksps', f: S[0], Ksp: S[5], ans: s });
    if (kind === 'Ksp') { var sg = sgf(s, 2), K = kspFactor(S) * M.pow(sg, n);
      return P('The molar solubility of $' + F(S[0]) + '$ at 25 °C is $' + qv(sg, 'M') + '$. What is its $K_{sp}$? (Use a calculator.)', num(K), [kspSetup(S), '$' + kspSub(S) + '$.', '$K_{sp} = ' + (kspFactor(S) === 1 ? '' : kspFactor(S)) + '(' + gv(sg) + ')^{' + n + '} = ' + fx(K, 3) + '$.'], 'Write the ion concentrations in terms of s, then multiply them out.', null, { k: 'kspfroms', f: S[0], s: sg, ans: K }); }
    var gL = sgf(s * S[6], 2), sm = gL / S[6], K2 = kspFactor(S) * M.pow(sm, n);
    return P('At 25 °C, $' + qv(gL, 'g') + '$ of $' + F(S[0]) + '$ ($' + S[6].toFixed(2) + '\\ \\text{g/mol}$) dissolves in 1.00 L of water. What is $K_{sp}$? (Use a calculator.)', num(K2), [
      'Molar solubility: $s = \\dfrac{' + gv(gL) + '\\ \\text{g/L}}{' + S[6].toFixed(2) + '\\ \\text{g/mol}} = ' + fx(sm, 3) + '\\ \\text{M}$.', kspSetup(S), '$K_{sp} = ' + sForm(S) + ' = ' + (kspFactor(S) === 1 ? '' : kspFactor(S)) + '(' + fx(sm, 3) + ')^{' + n + '} = ' + fx(K2, 3) + '$.'
    ], 'Change grams per liter to moles per liter first.', null, { k: 'kspg', f: S[0], gL: gL, ans: K2 });
  });

  G('gchem2.comparing-solubility', function (R, ctx) {
    var kind = lv(ctx, R.pick(['same', 'diff']), R.pick(['diff', 'diff', 'same']), R.pick(['diff', 'tf', 'ratio']));
    if (kind === 'same') { var grp = R.pick([SALT.filter(function (S) { return S[2] + S[4] === 2; }), SALT.filter(function (S) { return S[2] + S[4] === 3; })]), two = R.sample(grp, 2), more = molarS(two[0]) > molarS(two[1]) ? two[0] : two[1];
      return P('$K_{sp}$ values at 25 °C: $' + F(two[0][0]) + '$, $' + gv(two[0][5]) + '$; $' + F(two[1][0]) + '$, $' + gv(two[1][5]) + '$. Which has the larger molar solubility? Type its formula.', fml(more[0]), [
        'Both salts release ' + (two[0][2] + two[0][4]) + ' ions per formula unit, so both have $K_{sp} = ' + sForm(two[0]) + '$ with the same form' + (sForm(two[0]) === sForm(two[1]) ? '' : ' (different multipliers)') + '.',
        'For the same form, a larger $K_{sp}$ means a larger $s$. So $' + F(more[0]) + '$ is more soluble: $s = ' + fx(molarS(more), 2) + '\\ \\text{M}$ against $' + fx(molarS(more === two[0] ? two[1] : two[0]), 2) + '\\ \\text{M}$.'
      ], 'Same number of ions: compare Ksp directly.', null, { k: 'compsame', a: two[0][0], b: two[1][0], ans: more[0] }); }
    var pairs = [['AgCl', 'Ag2CrO4'], ['AgCl', 'Ag2CO3'], ['BaSO4', 'CaF2'], ['AgBr', 'Ag2CrO4'], ['CaCO3', 'PbI2'], ['BaCO3', 'Mg(OH)2'], ['AgCl', 'Mg(OH)2'], ['CaCO3', 'CaF2'], ['AgBr', 'Ag2CO3'], ['AgI', 'PbI2'], ['BaSO4', 'Ag2CrO4'],
      ['SrSO4', 'PbI2'], ['CaCO3', 'Ag2CrO4'], ['AgCl', 'CaF2'], ['BaSO4', 'Mg(OH)2'], ['AgCl', 'PbCl2'], ['BaCO3', 'CaF2'], ['AgBr', 'CaF2'], ['AgI', 'Fe(OH)2'], ['SrSO4', 'BaF2'], ['AgCl', 'Ca3(PO4)2'], ['BaSO4', 'Fe(OH)3']];
    var pr = R.pick(pairs), A = saltOf(pr[0]), B = saltOf(pr[1]), sA = molarS(A), sB = molarS(B), more2 = sA > sB ? A : B, biggerK = A[5] > B[5] ? A : B;
    if (kind === 'tf') return P('True or false: since $K_{sp}$ for $' + F(biggerK[0]) + '$ (' + '$' + gv(biggerK[5]) + '$) is larger than for $' + F((biggerK === A ? B : A)[0]) + '$ ($' + gv((biggerK === A ? B : A)[5]) + '$), $' + F(biggerK[0]) + '$ must be the more soluble of the two (in mol/L).', tf(more2 === biggerK), [
      '$' + F(A[0]) + '$: $K_{sp} = ' + sForm(A) + '$, so $s = ' + fx(sA, 3) + '\\ \\text{M}$. $' + F(B[0]) + '$: $K_{sp} = ' + sForm(B) + '$, so $s = ' + fx(sB, 3) + '\\ \\text{M}$.',
      'They release different numbers of ions, so the $K_{sp}$ values cannot be compared directly. ' + (more2 === biggerK ? 'Here the one with the larger $K_{sp}$ does turn out more soluble, but only the calculation shows it: true.' : 'The one with the smaller $K_{sp}$ is actually more soluble: false.')
    ], 'Compute s for each; different formulas mean different Ksp-to-s relations.', null, { k: 'comptf', a: A[0], b: B[0], ans: more2 === biggerK });
    if (kind === 'ratio') { var r = M.max(sA, sB) / M.min(sA, sB);
      return P('$K_{sp}$ at 25 °C: $' + F(A[0]) + '$, $' + gv(A[5]) + '$; $' + F(B[0]) + '$, $' + gv(B[5]) + '$. How many times larger is the molar solubility of the more soluble one? (Use a calculator.)', num(r, 3, 0.03), [
        '$' + F(A[0]) + '$: $s = ' + fx(sA, 3) + '\\ \\text{M}$ (from $K_{sp} = ' + sForm(A) + '$).', '$' + F(B[0]) + '$: $s = ' + fx(sB, 3) + '\\ \\text{M}$ (from $K_{sp} = ' + sForm(B) + '$).', 'Ratio: $' + fx(r, 3) + '$, in favor of $' + F(more2[0]) + '$.'
      ], 'Find s for each salt from its own Ksp expression.', null, { k: 'compratio', a: A[0], b: B[0], ans: r }); }
    return P('$K_{sp}$ at 25 °C: $' + F(A[0]) + '$, $' + gv(A[5]) + '$; $' + F(B[0]) + '$, $' + gv(B[5]) + '$. Which has the larger molar solubility? Type its formula. (Use a calculator.)', fml(more2[0]), [
      '$' + F(A[0]) + '$ gives ' + (A[2] + A[4]) + ' ions and $' + F(B[0]) + '$ gives ' + (B[2] + B[4]) + ', so their $K_{sp}$ values cannot be compared directly.',
      '$' + F(A[0]) + '$: $' + sForm(A) + ' = ' + gv(A[5]) + '$, $s = ' + fx(sA, 3) + '\\ \\text{M}$. $' + F(B[0]) + '$: $' + sForm(B) + ' = ' + gv(B[5]) + '$, $s = ' + fx(sB, 3) + '\\ \\text{M}$.',
      '$' + F(more2[0]) + '$ is more soluble' + (more2 !== biggerK ? ', even though its $K_{sp}$ is smaller.' : '.')
    ], 'Different numbers of ions: compute s for each.', null, { k: 'compdiff', a: A[0], b: B[0], ans: more2[0] });
  });

  G('gchem2.common-ion', function (R, ctx) {
    var kind = lv(ctx, R.pick(['ab', 'ab']), R.pick(['ab2anion', 'ab', 'ratio']), R.pick(['ab2cation', 'a2bcation', 'ratio', 'ab2anion']));
    var S, c, s, ion, src, st;
    if (kind === 'ab' || kind === 'ratio') { S = R.pick(SALT.filter(function (x) { return x[2] + x[4] === 2; })); c = R.pick([0.10, 0.050, 0.020, 0.25, 0.010]); var useAn = R.coin(); ion = useAn ? S[3] : S[1];
      src = useAn ? { 'Cl^-': 'NaCl', 'Br^-': 'NaBr', 'I^-': 'NaI', 'SO4^2-': 'Na2SO4', 'CO3^2-': 'Na2CO3' }[S[3]] : { 'Ag^+': 'AgNO3', 'Ba^2+': 'Ba(NO3)2', 'Ca^2+': 'Ca(NO3)2', 'Sr^2+': 'Sr(NO3)2' }[S[1]];
      s = S[5] / c;
      st = ['$' + EQ(dissEq(S)) + '$. The solution already has $' + cc(ion) + ' = ' + gv(c) + '\\ \\text{M}$ from the $' + F(src) + '$.', 'If $s$ mol/L dissolves: $' + cc(ion) + ' = ' + gv(c) + ' + s \\approx ' + gv(c) + '$ (s is tiny), and the other ion is $s$.', '$K_{sp} = (' + gv(c) + ')s = ' + gv(S[5]) + '$, so $s = ' + q(s, 'M') + '$.'];
      if (kind === 'ratio') { var s0 = M.sqrt(S[5]), r = s0 / s;
        return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$. How many times less soluble is it in $' + qv(c, 'M') + '$ $' + F(src) + '$ than in pure water? (Use a calculator.)', num(r, 3, 0.03), ['In pure water: $s_0 = \\sqrt{' + gv(S[5]) + '} = ' + fx(s0, 3) + '\\ \\text{M}$.'].concat(st).concat(['Ratio: $\\dfrac{' + fx(s0, 3) + '}{' + fx(s, 3) + '} = ' + fx(r, 3) + '$. The common ion pushes the equilibrium back toward the solid (Le Chatelier).']), 'Compute s both ways and divide.', null, { k: 'ciratio', f: S[0], c: c, ion: ion, ans: r }); }
      return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$ at 25 °C. What is its molar solubility in $' + qv(c, 'M') + '$ $' + F(src) + '$?', num(s, 3, 0.03), st.concat(['Compare pure water: $\\sqrt{' + gv(S[5]) + '} = ' + fx(M.sqrt(S[5]), 3) + '\\ \\text{M}$, far more.']), 'Put the common ion\u2019s concentration into Ksp and solve for s.', 'M', { k: 'ci', f: S[0], c: c, ion: ion, ans: s }); }
    if (kind === 'ab2anion' || kind === 'ab2cation') { var tries = 0;
      do { S = R.pick(SALT.filter(function (x) { return x[2] === 1 && x[4] === 2 && x[3] !== 'OH^-'; })); c = R.pick([0.10, 0.050, 0.020, 0.25]); s = kind === 'ab2anion' ? S[5] / (c * c) : M.sqrt(S[5] / (4 * c)); tries++; }
      while ((kind === 'ab2anion' ? 2 * s / c > 0.01 : s / c > 0.01) && tries < 50);
      if (kind === 'ab2anion') { src = { 'I^-': 'NaI', 'Cl^-': 'NaCl', 'F^-': 'NaF' }[S[3]];
        return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$. What is its molar solubility in $' + qv(c, 'M') + '$ $' + F(src) + '$? (Use a calculator.)', num(s, 3, 0.03), [
          '$' + EQ(dissEq(S)) + '$. Already present: $' + cc(S[3]) + ' = ' + gv(c) + '\\ \\text{M}$.', 'If $s$ dissolves: $' + cc(S[1]) + ' = s$ and $' + cc(S[3]) + ' = ' + gv(c) + ' + 2s \\approx ' + gv(c) + '$.',
          '$K_{sp} = s(' + gv(c) + ')^2 = ' + gv(S[5]) + '$, so $s = \\dfrac{' + gv(S[5]) + '}{' + fx(c * c, 3) + '} = ' + q(s, 'M') + '$. The common ion is squared, so it suppresses the solubility strongly.'
        ], 'The common anion appears squared in Ksp.', 'M', { k: 'ci', f: S[0], c: c, ion: S[3], ans: s }); }
      src = { 'Pb^2+': 'Pb(NO3)2', 'Ca^2+': 'Ca(NO3)2', 'Ba^2+': 'Ba(NO3)2', 'Mg^2+': 'Mg(NO3)2', 'Fe^2+': 'Fe(NO3)2' }[S[1]]; s = M.sqrt(S[5] / (4 * c));
      return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$. What is its molar solubility in $' + qv(c, 'M') + '$ $' + F(src) + '$? (Use a calculator.)', num(s, 3, 0.03), [
        '$' + EQ(dissEq(S)) + '$. Already present: $' + cc(S[1]) + ' = ' + gv(c) + '\\ \\text{M}$.', 'If $s$ dissolves: $' + cc(S[1]) + ' = ' + gv(c) + ' + s \\approx ' + gv(c) + '$ and $' + cc(S[3]) + ' = 2s$.',
        '$K_{sp} = (' + gv(c) + ')(2s)^2 = ' + (fix(4 * c) === 1 ? '' : T.num(fix(4 * c))) + 's^2 = ' + gv(S[5]) + '$, so $s = \\sqrt{' + (fix(4 * c) === 1 ? gv(S[5]) : '\\dfrac{' + gv(S[5]) + '}{' + T.num(fix(4 * c)) + '}') + '} = ' + q(s, 'M') + '$.'
      ], 'Keep the 2 in [anion] = 2s; the common cation is just its concentration.', 'M', { k: 'ci', f: S[0], c: c, ion: S[1], ans: s }); }
    S = saltOf(R.pick(['Ag2CrO4', 'Ag2CO3'])); c = R.pick([0.10, 0.050, 0.010, 0.020]); s = S[5] / (c * c);
    return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$. What is its molar solubility in $' + qv(c, 'M') + '$ $\\mathrm{AgNO_3}$? (Use a calculator.)', num(s, 3, 0.03), [
      '$' + EQ(dissEq(S)) + '$. Already present: $[\\mathrm{Ag^+}] = ' + gv(c) + '\\ \\text{M}$.', 'If $s$ dissolves: $[\\mathrm{Ag^+}] = ' + gv(c) + ' + 2s \\approx ' + gv(c) + '$ and $' + cc(S[3]) + ' = s$.',
      '$K_{sp} = (' + gv(c) + ')^2 s = ' + gv(S[5]) + '$, so $s = ' + q(s, 'M') + '$.'
    ], 'Ag⁺ is squared in this Ksp; put in the Ag⁺ already there.', 'M', { k: 'ci', f: S[0], c: c, ion: 'Ag^+', ans: s });
  });

  var MIX = [['AgNO3', 'NaCl', 'AgCl'], ['Pb(NO3)2', 'KI', 'PbI2'], ['BaCl2', 'Na2SO4', 'BaSO4'], ['CaCl2', 'NaF', 'CaF2'], ['MgCl2', 'NaOH', 'Mg(OH)2'], ['AgNO3', 'K2CrO4', 'Ag2CrO4'], ['Pb(NO3)2', 'NaCl', 'PbCl2'], ['Ca(NO3)2', 'Na2CO3', 'CaCO3'], ['SrCl2', 'Na2SO4', 'SrSO4']];
  G('gchem2.precipitation-q', function (R, ctx) {
    var kind = lv(ctx, R.pick(['dir', 'Q']), R.pick(['dir', 'Q', 'dir']), R.pick(['min', 'first', 'dir']));
    if (kind === 'first') { var cCl = R.pick([0.010, 0.020, 0.10]), cCr = R.pick([0.010, 0.020, 0.10]), agCl = 1.8e-10 / cCl, agCr = M.sqrt(1.1e-12 / cCr), first = agCl < agCr ? 'AgCl' : 'Ag2CrO4';
      return P('A solution is $' + qv(cCl, 'M') + '$ in $\\mathrm{Cl^-}$ and $' + qv(cCr, 'M') + '$ in $\\mathrm{CrO_4^{2-}}$. $\\mathrm{AgNO_3}$ is added slowly. Which solid forms first? ($K_{sp}$: AgCl $1.8 \\times 10^{-10}$; $\\mathrm{Ag_2CrO_4}$ $1.1 \\times 10^{-12}$.) Type its formula.', fml(first), [
        'Each solid starts to form when $Q$ reaches $K_{sp}$. Find the $[\\mathrm{Ag^+}]$ each one needs.',
        'AgCl: $[\\mathrm{Ag^+}] = \\dfrac{1.8 \\times 10^{-10}}{' + gv(cCl) + '} = ' + fx(agCl, 2) + '\\ \\text{M}$.',
        '$\\mathrm{Ag_2CrO_4}$: $[\\mathrm{Ag^+}] = \\sqrt{\\dfrac{1.1 \\times 10^{-12}}{' + gv(cCr) + '}} = ' + fx(agCr, 2) + '\\ \\text{M}$.',
        'The smaller requirement is reached first: $' + F(first) + '$ forms first. (This is how chromate signals the end of a chloride titration.)'
      ], 'Which salt reaches its Ksp at the lower [Ag⁺]?', null, { k: 'first', cCl: cCl, cCr: cCr, ans: first }); }
    var m = R.pick(MIX), S = saltOf(m[2]), V1 = R.pick([10.0, 25.0, 50.0, 100.0]), V2 = R.pick([10.0, 25.0, 50.0, 100.0]), tot = V1 + V2;
    if (kind === 'min') { var cM = R.pick([0.010, 0.0050, 0.020, 0.10]), need = M.pow(S[5] / M.pow(cM, S[2]), 1 / S[4]);
      return P('A solution has $' + cc(S[1]) + ' = ' + qv(cM, 'M') + '$. What concentration of $' + F(S[3]) + '$ is needed for $' + F(S[0]) + '$ ($K_{sp} = ' + gv(S[5]) + '$) to just begin to precipitate? (Use a calculator.)', num(need, 3, 0.03), [
        'Precipitation begins when $Q = K_{sp}$: $' + kspExpr(S) + ' = ' + gv(S[5]) + '$.',
        '$' + pw(cc(S[3]), S[4]) + ' = \\dfrac{' + gv(S[5]) + '}{' + pw('(' + gv(cM) + ')', S[2]) + '}$, so $' + cc(S[3]) + ' = ' + q(need, 'M') + '$. Any more and solid forms.'
      ], 'Set Q equal to Ksp and solve for the missing ion.', 'M', { k: 'pmin', f: S[0], cM: cM, ans: need }); }
    // two solutions mixed: choose concentrations so that Q is clearly above or below Ksp
    var want = R.coin(), c1, c2, cat, an, Qv, tries = 0;
    do { c1 = R.pick([1.0e-4, 2.0e-4, 5.0e-4, 1.0e-3, 2.0e-3, 5.0e-3, 0.010, 0.020, 0.050, 0.10, 1.0e-5, 1.0e-6]); c2 = R.pick([1.0e-4, 2.0e-4, 5.0e-4, 1.0e-3, 2.0e-3, 5.0e-3, 0.010, 0.020, 0.050, 0.10, 1.0e-5, 1.0e-6]);
      cat = c1 * V1 / tot; an = c2 * V2 / tot; Qv = M.pow(cat, S[2]) * M.pow(an, S[4]); tries++;
    } while (((want && Qv < 5 * S[5]) || (!want && Qv > S[5] / 5)) && tries < 300);
    var forms = Qv > S[5], ansT = forms ? 'Yes: $Q > K_{sp}$, so a precipitate forms' : 'No: $Q < K_{sp}$, so no precipitate forms';
    var st = ['Mixing dilutes both solutions: the total volume is $' + gv(V1, 3) + ' + ' + gv(V2, 3) + ' = ' + fx(tot, 3) + '\\ \\text{mL}$.',
      '$' + cc(S[1]) + ' = \\dfrac{(' + gv(c1) + ')(' + gv(V1, 3) + ')}{' + fx(tot, 3) + '} = ' + fx(cat, 3) + '\\ \\text{M}$ and $' + cc(S[3]) + ' = \\dfrac{(' + gv(c2) + ')(' + gv(V2, 3) + ')}{' + fx(tot, 3) + '} = ' + fx(an, 3) + '\\ \\text{M}$.',
      '$Q = ' + kspExpr(S) + ' = ' + pw('(' + fx(cat, 3) + ')', S[2]) + pw('(' + fx(an, 3) + ')', S[4]) + ' = ' + fx(Qv, 3) + '$.'];
    var qtext = '$' + qv(V1, 'mL', 3) + '$ of $' + qv(c1, 'M') + '$ $' + F(m[0]) + '$ is mixed with $' + qv(V2, 'mL', 3) + '$ of $' + qv(c2, 'M') + '$ $' + F(m[1]) + '$. ';
    if (kind === 'Q') return P(qtext + 'What is the ion product $Q$ for $' + F(S[0]) + '$ right after mixing? (Use a calculator.)', num(Qv, 3, 0.03), st, 'Find each ion\u2019s concentration in the mixed volume, then form Q like Ksp.', null, { k: 'pq', S: S[0], c1: c1, V1: V1, c2: c2, V2: V2, ans: Qv });
    return P(qtext + 'Does $' + F(S[0]) + '$ ($K_{sp} = ' + gv(S[5]) + '$) precipitate? (Use a calculator.)', mc(ansT, [forms ? 'No: $Q < K_{sp}$, so no precipitate forms' : 'Yes: $Q > K_{sp}$, so a precipitate forms', 'It depends only on whether $' + F(S[0]) + '$ is on the list of insoluble salts']), st.concat(['Compare with $K_{sp} = ' + gv(S[5]) + '$: ' + (forms ? '$Q > K_{sp}$, so the solution is supersaturated and solid forms until $Q = K_{sp}$.' : '$Q < K_{sp}$: the solution is unsaturated, so nothing precipitates.')]), 'Dilute both concentrations for the mixed volume, then compare Q with Ksp.', null, { k: 'pdir', S: S[0], c1: c1, V1: V1, c2: c2, V2: V2, ans: forms });
  });

  G('gchem2.ph-solubility', function (R, ctx) {
    var kind = lv(ctx, R.pick(['which', 'tf']), R.pick(['which', 'hyd', 'unaffected']), R.pick(['hyd', 'factor', 'which']));
    var basic = ['CaCO3', 'Mg(OH)2', 'CaF2', 'BaCO3', 'Ca3(PO4)2', 'Ag2CO3', 'Fe(OH)3', 'BaF2'], neutral = ['AgCl', 'AgBr', 'AgI', 'PbCl2', 'PbI2'];
    function anionName(f) { var S = saltOf(f); return '$' + F(S[3]) + '$'; }
    if (kind === 'which') { var right = R.pick(basic), wr = R.sample(neutral, 3);
      return P('Which salt becomes more soluble when nitric acid is added to its saturated solution?', mc('$' + F(right) + '$', wr.map(function (f) { return '$' + F(f) + '$'; })), [
        'Acid helps only when the salt\u2019s anion is a base that can take a proton. ' + anionName(right) + ' is the conjugate base of a weak acid' + (right.indexOf('OH') >= 0 ? ' (OH⁻ reacts with H₃O⁺ to make water)' : '') + ', so $\\mathrm{H_3O^+}$ removes it.',
        'Removing the anion lowers $Q$ below $K_{sp}$, so more solid dissolves (Le Chatelier).',
        'The halides $\\mathrm{Cl^-}$, $\\mathrm{Br^-}$ and $\\mathrm{I^-}$ come from strong acids and take no protons, so acid does not change those salts\u2019 solubility.'
      ], 'Is the anion a base?', null, { k: 'phwhich', ans: right }); }
    if (kind === 'unaffected' || kind === 'tf') { var f2 = R.pick(neutral); if (kind === 'tf') return P('True or false: adding nitric acid makes $' + F(f2) + '$ noticeably more soluble.', tf(false), ['The anion here, ' + anionName(f2) + ', is the conjugate base of a strong acid: it does not take protons from $\\mathrm{H_3O^+}$.', 'So acid does not remove it, and the solubility is unchanged. False. (Salts like $\\mathrm{CaCO_3}$ or $\\mathrm{Mg(OH)_2}$, with basic anions, do dissolve better in acid.)'], 'Can the anion take a proton?', null, { k: 'phtf', ans: false });
      var right2 = R.pick(neutral), wr2 = R.sample(basic, 3);
      return P('Which salt\u2019s solubility is NOT increased by adding acid?', mc('$' + F(right2) + '$', wr2.map(function (f) { return '$' + F(f) + '$'; })), ['The others have basic anions (carbonate, hydroxide, fluoride, phosphate) that acid removes, so they dissolve better in acid.', '$' + F(right2) + '$ has ' + anionName(right2) + ', the conjugate base of a strong acid; it takes no protons, so acid leaves its solubility alone.'], 'Look for the anion that is not a base.', null, { k: 'phun', ans: right2 }); }
    var S = saltOf(R.pick(['Mg(OH)2', 'Fe(OH)2', 'Fe(OH)3'])), n = S[4];
    var pHs = { 'Mg(OH)2': [9.0, 9.5, 10.0, 10.5], 'Fe(OH)2': [7.0, 7.5, 8.0, 8.5], 'Fe(OH)3': [2.5, 3.0, 3.5, 4.0] }[S[0]];
    if (kind === 'hyd') { var pH = R.pick(pHs), OH = M.pow(10, pH - 14), s = S[5] / M.pow(OH, n);
      return P('$K_{sp}$ for $' + F(S[0]) + '$ is $' + gv(S[5]) + '$. What is its molar solubility in a solution buffered at pH ' + pH.toFixed(1) + '? (Use a calculator.)', num(s, 3, 0.03), [
        'The buffer fixes $[\\mathrm{OH^-}]$: $\\text{pOH} = 14.0 - ' + pH.toFixed(1) + ' = ' + (14 - pH).toFixed(1) + '$, so $[\\mathrm{OH^-}] = ' + fx(OH, 2) + '\\ \\text{M}$.',
        '$K_{sp} = ' + cc(S[1]) + '[\\mathrm{OH^-}]^{' + n + '}$ and $' + cc(S[1]) + ' = s$, so $s = \\dfrac{' + gv(S[5]) + '}{(' + fx(OH, 2) + ')^{' + n + '}} = ' + q(s, 'M') + '$.'
      ], 'With [OH⁻] fixed by the buffer, solve Ksp for the metal ion.', 'M', { k: 'phhyd', f: S[0], pH: pH, ans: s }); }
    var p1 = pHs[0], p2 = pHs[pHs.length - 1], fac = M.pow(10, n * (p2 - p1));
    return P('By what factor is $' + F(S[0]) + '$ more soluble at pH ' + p1.toFixed(1) + ' than at pH ' + p2.toFixed(1) + ' (both buffered)?', num(fac), [
      '$s = \\dfrac{K_{sp}}{[\\mathrm{OH^-}]^{' + n + '}}$, so $s$ is proportional to $[\\mathrm{OH^-}]^{-' + n + '}$.',
      'Going from pH ' + p2.toFixed(1) + ' down to ' + p1.toFixed(1) + ' lowers $[\\mathrm{OH^-}]$ by $10^{' + T.num(p2 - p1) + '}$, which raises $s$ by $(10^{' + T.num(p2 - p1) + '})^{' + n + '} = ' + fx(fac, 3) + '$.'
    ], 's goes as 1/[OH⁻]ⁿ.', null, { k: 'phfac', n: n, d: p2 - p1, ans: fac });
  });

  var LEWIS = [['BF3(g) + NH3(g) -> BF3NH3(s)', 'BF3', 'NH3'], ['Ag^+(aq) + 2NH3(aq) -> [Ag(NH3)2]^+(aq)', 'Ag^+', 'NH3'], ['Cu^2+(aq) + 4NH3(aq) -> [Cu(NH3)4]^2+(aq)', 'Cu^2+', 'NH3'],
    ['AlCl3(s) + Cl^-(aq) -> AlCl4^-(aq)', 'AlCl3', 'Cl^-'], ['CO2(g) + OH^-(aq) -> HCO3^-(aq)', 'CO2', 'OH^-'], ['Fe^3+(aq) + 6H2O(l) -> [Fe(H2O)6]^3+(aq)', 'Fe^3+', 'H2O'], ['Zn^2+(aq) + 4OH^-(aq) -> [Zn(OH)4]^2-(aq)', 'Zn^2+', 'OH^-'], ['Ni^2+(aq) + 6NH3(aq) -> [Ni(NH3)6]^2+(aq)', 'Ni^2+', 'NH3']];
  var KF = [['Ag^+', 'NH3', 2, '[Ag(NH3)2]^+', 1.7e7], ['Cu^2+', 'NH3', 4, '[Cu(NH3)4]^2+', 1.1e13], ['Zn^2+', 'NH3', 4, '[Zn(NH3)4]^2+', 2.9e9], ['Ni^2+', 'NH3', 6, '[Ni(NH3)6]^2+', 5.5e8], ['Ag^+', 'CN^-', 2, '[Ag(CN)2]^-', 1.0e21], ['Ag^+', 'S2O3^2-', 2, '[Ag(S2O3)2]^3-', 4.7e13]];
  G('gchem2.complex-ions', function (R, ctx) {
    var kind = lv(ctx, R.pick(['lewis', 'tf', 'free']), R.pick(['lewis', 'K', 'free']), R.pick(['sol', 'free', 'K']));
    if (kind === 'lewis') { var L = R.pick(LEWIS), base = R.coin();
      return P('In $' + EQ(L[0]) + '$, which species is the Lewis ' + (base ? 'base' : 'acid') + '? Type its formula.', fml(base ? L[2] : L[1]), [
        'A Lewis acid accepts an electron pair; a Lewis base donates one, forming a new bond.',
        '$' + F(L[2]) + '$ has a lone pair to give, so it is the Lewis base; $' + F(L[1]) + '$ has room for the pair (an empty orbital), so it is the Lewis acid.' + (L[1] === 'BF3' || L[1] === 'AlCl3' || L[1] === 'CO2' ? ' No proton is involved: a Lewis acid need not contain hydrogen.' : ' Metal ions are Lewis acids.')
      ], 'Who gives the electron pair, and who takes it?', null, { k: 'lewis', ans: base ? L[2] : L[1] }); }
    if (kind === 'tf') { var t = R.pick([['A Lewis acid must contain a hydrogen atom.', false], ['Adding ammonia makes silver chloride more soluble, because Ag⁺ forms [Ag(NH₃)₂]⁺.', true], ['Forming a complex ion with the metal ion makes a slightly soluble salt less soluble.', false], ['A metal ion in water acts as a Lewis acid toward the water molecules around it.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['Lewis acids accept electron pairs: metal ions, $\\mathrm{BF_3}$ and $\\mathrm{CO_2}$ are examples with no H at all.', 'Turning the free metal ion into a complex lowers its concentration, so $Q$ for the salt drops below $K_{sp}$ and more solid dissolves.', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Lewis acid: pair acceptor. Complexing the metal ion removes it from the solubility equilibrium.', null, { k: 'cxtf', ans: t[1] }); }
    var Kf = R.pick(KF);
    if (kind === 'K') { var KK = R.pick([['AgCl', 'Cl^-', 1.8e-10, 'NH3', 2, '[Ag(NH3)2]^+', 1.7e7, 'ammonia'], ['AgBr', 'Br^-', 5.0e-13, 'S2O3^2-', 2, '[Ag(S2O3)2]^3-', 4.7e13, 'thiosulfate (photographic fixer)'], ['AgI', 'I^-', 8.3e-17, 'CN^-', 2, '[Ag(CN)2]^-', 1.0e21, 'cyanide'], ['AgCl', 'Cl^-', 1.8e-10, 'S2O3^2-', 2, '[Ag(S2O3)2]^3-', 4.7e13, 'thiosulfate'], ['AgBr', 'Br^-', 5.0e-13, 'NH3', 2, '[Ag(NH3)2]^+', 1.7e7, 'ammonia']]), Kc = KK[2] * KK[6];
      return P('$K_{sp}$ for $' + F(KK[0]) + '$ is $' + gv(KK[2]) + '$ and $K_f$ for $' + F(KK[5]) + '$ is $' + gv(KK[6]) + '$. What is $K$ for $' + EQ(KK[0] + '(s) + 2' + KK[3] + '(aq) <=> ' + KK[5] + '(aq) + ' + KK[1] + '(aq)') + '$?', num(Kc), [
        'This reaction is the sum of $' + EQ(KK[0] + '(s) <=> Ag^+(aq) + ' + KK[1] + '(aq)') + '$ ($K_{sp}$) and $' + EQ('Ag^+(aq) + 2' + KK[3] + '(aq) <=> ' + KK[5] + '(aq)') + '$ ($K_f$).',
        'Adding reactions multiplies their constants: $K = K_{sp}K_f = (' + gv(KK[2]) + ')(' + gv(KK[6]) + ') = ' + fx(Kc, 3) + '$.',
        'That is far larger than $K_{sp}$ alone: ' + KK[7] + ' pulls the silver salt into solution.'
      ], 'Add the dissolving and the complex formation; multiply the K values.', null, { k: 'cxK', Ksp: KK[2], Kf: KK[6], ans: Kc }); }
    if (kind === 'free') { var cm = R.pick([0.010, 0.0050, 0.020, 0.0010, 0.015, 0.0025, 0.0040, 0.0080, 0.030, 0.0020]), cl = R.pick([1.0, 0.50, 2.0, 0.80, 1.5, 0.60, 1.2, 0.40, 2.5, 0.90]), n = Kf[2], lig = cl - n * cm, free = cm / (Kf[4] * M.pow(lig, n));
      return P('A solution is made with $' + qv(cm, 'M') + '$ $' + F(Kf[0]) + '$ (total) and $' + qv(cl, 'M') + '$ $' + F(Kf[1]) + '$ (total, a large excess). $K_f$ for $' + F(Kf[3]) + '$ is $' + gv(Kf[4]) + '$. What is the concentration of free $' + F(Kf[0]) + '$ left? (Use a calculator.)', num(free, 3, 0.03), [
        '$K_f$ is huge, so almost all the metal ion becomes the complex: $' + cc(Kf[3]) + ' \\approx ' + gv(cm) + '\\ \\text{M}$.',
        'That uses $' + n + ' \\times ' + gv(cm) + ' = ' + fx(n * cm, 3) + '\\ \\text{M}$ of $' + F(Kf[1]) + '$, leaving $' + gv(cl) + ' - ' + fx(n * cm, 3) + ' = ' + fx(lig, 3) + '\\ \\text{M}$.',
        '$K_f = \\dfrac{' + cc(Kf[3]) + '}{' + cc(Kf[0]) + pw(cc(Kf[1]), n) + '}$, so $' + cc(Kf[0]) + ' = \\dfrac{' + gv(cm) + '}{(' + gv(Kf[4]) + ')(' + fx(lig, 3) + ')^{' + n + '}} = ' + q(free, 'M') + '$.'
      ], 'Assume the complex forms completely, then use Kf to find the tiny amount of free metal ion.', 'M', { k: 'cxfree', Kf: Kf[4], n: n, cm: cm, cl: cl, ans: free }); }
    var cN = R.int(3, 30) / 10, K2 = 1.8e-10 * 1.7e7, rt = M.sqrt(K2), sol = cN * rt / (1 + 2 * rt);
    return P('What is the molar solubility of AgCl in $' + qv(cN, 'M') + '$ $\\mathrm{NH_3}$? Use $K_{sp} = 1.8 \\times 10^{-10}$ and $K_f = 1.7 \\times 10^7$ for $[\\mathrm{Ag(NH_3)_2}]^+$. (Use a calculator.)', num(sol, 3, 0.03), [
      'Overall: $' + EQ('AgCl(s) + 2NH3(aq) <=> [Ag(NH3)2]^+(aq) + Cl^-(aq)') + '$, with $K = K_{sp}K_f = ' + fx(K2, 3) + '$.',
      'If $s$ dissolves: $[\\mathrm{Ag(NH_3)_2^+}] = [\\mathrm{Cl^-}] = s$ and $[\\mathrm{NH_3}] = ' + gv(cN) + ' - 2s$. So $\\dfrac{s^2}{(' + gv(cN) + ' - 2s)^2} = ' + fx(K2, 3) + '$.',
      'Take square roots: $\\dfrac{s}{' + gv(cN) + ' - 2s} = ' + fx(rt, 3) + '$, so $s = \\dfrac{' + gv(cN) + ' \\times ' + fx(rt, 3) + '}{1 + 2 \\times ' + fx(rt, 3) + '} = ' + q(sol, 'M') + '$.',
      'In pure water $s = \\sqrt{1.8 \\times 10^{-10}} = 1.3 \\times 10^{-5}\\ \\text{M}$: the ammonia raises the solubility by thousands of times.'
    ], 'Combine Ksp and Kf, set up the ICE in s, and take square roots.', 'M', { k: 'cxsol', cN: cN, ans: sol });
  });


  // ================================================================== Unit 5: Entropy and Free Energy
  // standard data at 298.15 K (OpenStax Chemistry 2e Appendix G; NIST): [S° J/(mol·K), ΔH°f kJ/mol, ΔG°f kJ/mol]
  var TD = {
    'H2(g)': [130.7, 0, 0], 'O2(g)': [205.2, 0, 0], 'N2(g)': [191.6, 0, 0], 'C(s)': [5.74, 0, 0], 'Cl2(g)': [223.1, 0, 0], 'Fe(s)': [27.3, 0, 0], 'Mg(s)': [32.7, 0, 0], 'Al(s)': [28.3, 0, 0], 'I2(s)': [116.1, 0, 0],
    'H2O(l)': [70.0, -285.8, -237.1], 'H2O(g)': [188.8, -241.8, -228.6], 'CO2(g)': [213.8, -393.5, -394.4], 'CO(g)': [197.7, -110.5, -137.2], 'CH4(g)': [186.3, -74.6, -50.5],
    'NH3(g)': [192.8, -45.9, -16.4], 'NO(g)': [210.8, 91.3, 87.6], 'NO2(g)': [240.1, 33.2, 51.3], 'N2O4(g)': [304.4, 11.1, 99.8], 'SO2(g)': [248.2, -296.8, -300.1], 'SO3(g)': [256.8, -395.7, -371.1],
    'HCl(g)': [186.9, -92.3, -95.3], 'CaCO3(s)': [92.9, -1207.6, -1129.1], 'CaO(s)': [38.1, -634.9, -603.3], 'Fe2O3(s)': [87.4, -824.2, -742.2], 'MgO(s)': [26.9, -601.6, -569.3],
    'C2H6(g)': [229.2, -84.0, -32.0], 'C2H4(g)': [219.3, 52.4, 68.4], 'C3H8(g)': [270.3, -103.8, -23.4], 'CH3OH(l)': [126.8, -239.2, -166.6], 'H2O2(l)': [109.6, -187.8, -120.4],
    'PCl3(g)': [311.8, -287.0, -267.8], 'PCl5(g)': [364.6, -374.9, -305.0], 'HI(g)': [206.6, 26.5, 1.7], 'KClO3(s)': [143.1, -397.7, -296.3], 'KCl(s)': [82.6, -436.5, -408.5], 'NH4Cl(s)': [94.6, -314.4, -202.9]
  };
  var TRX = ['N2(g) + 3H2(g) -> 2NH3(g)', 'CaCO3(s) -> CaO(s) + CO2(g)', '2H2(g) + O2(g) -> 2H2O(l)', 'CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', '2SO2(g) + O2(g) -> 2SO3(g)',
    'N2O4(g) -> 2NO2(g)', '2NO(g) + O2(g) -> 2NO2(g)', 'H2(g) + Cl2(g) -> 2HCl(g)', '4Fe(s) + 3O2(g) -> 2Fe2O3(s)', '2KClO3(s) -> 2KCl(s) + 3O2(g)', 'NH4Cl(s) -> NH3(g) + HCl(g)',
    'C2H4(g) + H2(g) -> C2H6(g)', 'PCl5(g) -> PCl3(g) + Cl2(g)', 'H2O(l) -> H2O(g)', '2H2O2(l) -> 2H2O(l) + O2(g)', 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)', '2Mg(s) + O2(g) -> 2MgO(s)',
    'CO(g) + 2H2(g) -> CH3OH(l)', 'N2(g) + O2(g) -> 2NO(g)', 'H2(g) + I2(s) -> 2HI(g)', 'C(s) + O2(g) -> CO2(g)', 'C(s) + 2H2(g) -> CH4(g)', 'CH4(g) + H2O(g) -> CO(g) + 3H2(g)', '2CO(g) + O2(g) -> 2CO2(g)',
    'CaO(s) + CO2(g) -> CaCO3(s)', '2NO2(g) -> N2O4(g)', 'PCl3(g) + Cl2(g) -> PCl5(g)', '2NH3(g) -> N2(g) + 3H2(g)', 'CO(g) + H2O(g) -> CO2(g) + H2(g)', '4NH3(g) + 5O2(g) -> 4NO(g) + 6H2O(g)', '2SO3(g) -> 2SO2(g) + O2(g)',
    'Fe2O3(s) + 3CO(g) -> 2Fe(s) + 3CO2(g)', 'H2O(g) -> H2O(l)', '2HI(g) -> H2(g) + I2(s)'];
  function key(sp) { return sp.f + '(' + sp.ph + ')'; }
  function tdSum(E, i) { var v = 0; E.p.forEach(function (sp) { v += sp.n * TD[key(sp)][i]; }); E.r.forEach(function (sp) { v -= sp.n * TD[key(sp)][i]; }); return fix(v); }
  function dS(E) { return tdSum(E, 0); } function dH(E) { return tdSum(E, 1); } function dG(E) { return tdSum(E, 2); }
  function tdTable(E, i, unit) { var seen = {}, rows = []; species(E).forEach(function (sp) { var k = key(sp); if (seen[k]) return; seen[k] = 1; rows.push(['$' + F(k) + '$', String(TD[k][i]).replace('-', '−')]); }); return tbl(['Substance', unit], rows); }
  function sumTex(E, i) {
    function side(a) { return a.map(function (sp) { var v = TD[key(sp)][i]; return sp.n === 1 ? (v < 0 ? '(' + T.num(v) + ')' : T.num(v)) : sp.n + '(' + T.num(v) + ')'; }).join(' + '); }
    return '[' + side(E.p) + '] - [' + side(E.r) + ']';
  }

  G('gchem2.entropy-microstates', function (R, ctx) {
    var kind = lv(ctx, R.pick(['ways', 'prob', 'mix']), R.pick(['ways', 'dS', 'einstein', 'prob']), R.pick(['dS', 'S', 'einstein']));
    if (kind === 'ways') { var N = lv(ctx, R.int(3, 8), R.int(6, 12)), k = R.int(1, N - 1), W = U.nCr(N, k);
      return P('$' + N + '$ identical gas molecules move freely in a box with a left half and a right half. In how many ways (microstates) can exactly $' + k + '$ of them be in the left half?', int(W), [
        'Choose which ' + k + ' of the ' + N + ' molecules are on the left; the rest are on the right. The number of choices is $\\binom{' + N + '}{' + k + '} = \\dfrac{' + N + '!}{' + k + '!\\,' + (N - k) + '!}$.',
        '$\\binom{' + N + '}{' + k + '} = ' + W + '$.',
        'The most even split, $' + M.floor(N / 2) + '$ on the left, has the most microstates (' + U.nCr(N, M.floor(N / 2)) + '), so it is the state you are most likely to find.'
      ], 'Count the ways to choose which molecules are on the left.', null, { k: 'ways', N: N, kk: k, ans: W }, { name: 'ch-microstates', opts: { mode: 'gas', N: N, quiet: true } }); }
    if (kind === 'prob') { var N2 = R.int(3, 12), tot = M.pow(2, N2);
      return P('$' + N2 + '$ gas molecules move at random in a box. What is the probability that, at a given instant, all of them are in the left half?', { t: 'num', v: '1/' + tot, rtol: 0.02 }, [
        'Each molecule is in either half with probability $\\tfrac{1}{2}$, independently of the others.',
        'All ' + N2 + ' on the left: $\\left(\\tfrac{1}{2}\\right)^{' + N2 + '} = \\dfrac{1}{' + tot + '}$. Only one of the $2^{' + N2 + '} = ' + tot + '$ equally likely arrangements has them all on one side.',
        'For a mole of gas the chance is $\\left(\\tfrac{1}{2}\\right)^{6 \\times 10^{23}}$: never in the life of the universe. That is why gases spread out and stay spread out.'
      ], 'Each molecule has two choices; multiply.', null, { k: 'prob', N: N2, ans: 1 / tot }); }
    if (kind === 'mix') { var right = 'Increases: each gas spreads into twice the volume, so there are more ways to arrange the molecules', wr = ['Decreases: the mixture is messier, which lowers its order', 'Stays the same: no heat flows and no reaction occurs', 'Decreases: the gases are no longer neatly separated, which costs entropy'];
      return P('Two different ideal gases, each at the same temperature and pressure, fill the two halves of a box separated by a wall. The wall is removed and they mix. What happens to the entropy?', mc(right, wr), [
        'Entropy counts microstates: $S = k\\ln W$. After the wall is gone, each molecule can be anywhere in twice the volume, so the number of arrangements, $W$, grows enormously.',
        'Nothing about "messiness" is needed: the entropy rises because the molecules (and their energy) have more places to be. No heat or reaction is involved.'
      ], 'Count the positions each molecule can reach.', null, { k: 'mix', ans: right }); }
    if (kind === 'einstein') { var qn = R.int(2, 5), Nn = R.int(2, 4), W2 = U.nCr(qn + Nn - 1, qn);
      return P('In a simple model of a solid, energy comes in identical packets (quanta) shared among atoms, and any atom can hold any number of them. How many ways can $' + qn + '$ quanta be shared among $' + Nn + '$ atoms?', int(W2), [
        'This is "stars and bars": arrange $' + qn + '$ quanta and $' + (Nn - 1) + '$ dividers in a row. Each arrangement is one way to share the energy.',
        '$W = \\binom{' + qn + ' + ' + Nn + ' - 1}{' + qn + '} = \\binom{' + (qn + Nn - 1) + '}{' + qn + '} = ' + W2 + '$.',
        'Spreading energy over more atoms gives more microstates: energy, like matter, spreads out because spread-out arrangements are more numerous.'
      ], 'Count arrangements of quanta and dividers.', null, { k: 'ein', q: qn, N: Nn, ans: W2 }); }
    if (kind === 'S') { var W3 = R.pick([1.0, 2.0, 5.0, 3.0, 6.0]) * M.pow(10, R.int(10, 40)), Sv = 1.381e-23 * M.log(W3);
      return P('A system has $W = ' + gv(W3) + '$ microstates. What is its entropy, $S = k\\ln W$, with $k = 1.381 \\times 10^{-23}\\ \\text{J/K}$? (Use a calculator.)', num(Sv), ['$\\ln(' + gv(W3) + ') = ' + fx(M.log(W3), 4) + '$.', '$S = (1.381 \\times 10^{-23})(' + fx(M.log(W3), 4) + ') = ' + q(Sv, 'J/K') + '$.', 'Even a huge $W$ gives a tiny $S$ for a few particles; molar entropies are large because a mole has $6 \\times 10^{23}$ particles.'], 'S = k ln W.', 'J/K', { k: 'S', W: W3, ans: Sv }); }
    var n = R.pick([0.50, 1.00, 2.00, 0.250, 1.50, 3.00, 0.750]), f = R.pick([2, 3, 4, 5, 10, 0.5, 0.25]), dSv = n * C.R * M.log(f);
    return P('$' + qv(n, 'mol', 3) + '$ of an ideal gas ' + (f > 1 ? 'expands at constant temperature to ' + (f === 2 ? 'twice' : f + ' times') + ' its volume' : 'is squeezed at constant temperature to ' + (f === 0.5 ? 'half' : 'a quarter of') + ' its volume') + '. What is $\\Delta S$ of the gas? (Use $\\Delta S = nR\\ln\\dfrac{V_2}{V_1}$ and a calculator.)', num(dSv), [
      'Each molecule now has ' + (f > 1 ? f + ' times' : 'half') + ' as many places to be, so $W$ is multiplied by $' + T.num(f) + '^{N}$ and $\\Delta S = k\\ln(' + T.num(f) + '^{N}) = Nk\\ln ' + T.num(f) + ' = nR\\ln ' + T.num(f) + '$.',
      '$\\Delta S = (' + gv(n, 3) + ')(8.314)\\ln(' + T.num(f) + ') = ' + q(dSv, 'J/K') + '$.' + (f < 1 ? ' Negative: fewer arrangements.' : '')
    ], 'ΔS = nR ln(V₂/V₁).', 'J/K', { k: 'dSexp', n: n, f: f, ans: dSv });
  });

  var SIGNRX = ['N2(g) + 3H2(g) -> 2NH3(g)', 'CaCO3(s) -> CaO(s) + CO2(g)', '2H2(g) + O2(g) -> 2H2O(l)', 'CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', '2SO2(g) + O2(g) -> 2SO3(g)', 'N2O4(g) -> 2NO2(g)',
    '2NO(g) + O2(g) -> 2NO2(g)', '4Fe(s) + 3O2(g) -> 2Fe2O3(s)', '2KClO3(s) -> 2KCl(s) + 3O2(g)', 'NH4Cl(s) -> NH3(g) + HCl(g)', 'C2H4(g) + H2(g) -> C2H6(g)', 'PCl5(g) -> PCl3(g) + Cl2(g)',
    '2H2O2(l) -> 2H2O(l) + O2(g)', 'C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)', '2Mg(s) + O2(g) -> 2MgO(s)', 'CO(g) + 2H2(g) -> CH3OH(l)', 'H2(g) + I2(s) -> 2HI(g)'];
  var PROC = [['Ice melts at 5 °C', '+'], ['Liquid water freezes', '−'], ['Steam condenses to liquid water', '−'], ['Dry ice, $\\mathrm{CO_2(s)}$, sublimes', '+'], ['A sample of gas is heated at constant volume', '+'], ['A gas is compressed to a smaller volume at constant temperature', '−'], ['$\\mathrm{CO_2}$ gas dissolves in cold water', '−'], ['Liquid ethanol evaporates', '+'], ['Molten iron solidifies', '−']];
  var SGN = { '+': 'Positive (entropy increases)', '−': 'Negative (entropy decreases)' };
  G('gchem2.entropy-change-sign', function (R, ctx) {
    var kind = lv(ctx, R.pick(['proc', 'rx']), R.pick(['rx', 'dn', 'rank']), R.pick(['rx', 'dn', 'rank']));
    if (kind === 'proc') { var p = R.pick(PROC); return P(p[0] + '. What is the sign of $\\Delta S$ for the substance?', mc(SGN[p[1]], [SGN[p[1] === '+' ? '−' : '+'], 'Zero (no change)']), [
      'Ask whether the particles (and their energy) end up with more or fewer ways to be arranged.',
      p[1] === '+' ? 'Here they gain freedom: more room to move, or more energy spread among more ways. $\\Delta S > 0$.' : 'Here they lose freedom: they are held in a more confined arrangement. $\\Delta S < 0$.'
    ], 'Solid < liquid < gas; more volume and higher temperature mean more microstates.', null, { k: 'proc', ans: p[1] }); }
    var E = parseEq(R.pick(SIGNRX)), dn = dnGas(E), sg = dS(E) > 0 ? '+' : '−';
    var tot = U.sum(E.p.map(function (s) { return s.n; })) - U.sum(E.r.map(function (s) { return s.n; }));
    if (kind === 'dn') return P('For $' + EQ(E.eq) + '$, by how many moles does the amount of gas change (moles of gas in the products minus moles of gas in the reactants)?', int(dn), [
      'Count only the gases: products ' + U.sum(E.p.filter(function (s) { return s.ph === 'g'; }).map(function (s) { return s.n; })) + ', reactants ' + U.sum(E.r.filter(function (s) { return s.ph === 'g'; }).map(function (s) { return s.n; })) + '.',
      '$\\Delta n_{\\text{gas}} = ' + dn + '$. ' + (dn > 0 ? 'More gas, so $\\Delta S$ is positive.' : dn < 0 ? 'Less gas, so $\\Delta S$ is negative.' : 'No change in gas, so the sign is hard to call without data.') + (tot !== dn ? ' (Counting every species would give ' + tot + ', which is not what matters.)' : '')
    ], 'Solids and liquids barely count; gases dominate entropy.', null, { k: 'dngas', eq: E.eq, ans: dn });
    if (kind === 'rx') return P('Predict the sign of $\\Delta S^\\circ$ for $' + EQ(E.eq) + '$.', mc(SGN[sg], [SGN[sg === '+' ? '−' : '+'], 'Zero (no change)']), [
      'Gases have far more entropy than solids or liquids, so the change in moles of gas usually decides the sign.',
      'Moles of gas: $\\Delta n_{\\text{gas}} = ' + dn + '$' + (tot !== dn ? ' (do not count the solids and liquids: all species together change by ' + tot + ')' : '') + '.',
      'So $\\Delta S^\\circ$ is ' + (sg === '+' ? 'positive' : 'negative') + '. (From standard entropies: $\\Delta S^\\circ = ' + T.num(rd(dS(E), 1)) + '\\ \\text{J/K}$.)'
    ], 'Count the change in moles of gas only.', null, { k: 'sign', eq: E.eq, ans: sg });
    var pairs = [['$\\mathrm{H_2O(g)}$', '$\\mathrm{H_2O(l)}$', 'Gas molecules have far more positions and motions available than those in a liquid.'], ['$\\mathrm{I_2(g)}$', '$\\mathrm{I_2(s)}$', 'A gas has far more microstates than a solid.'],
      ['$\\mathrm{C_2H_6(g)}$', '$\\mathrm{CH_4(g)}$', 'More atoms per molecule means more ways to vibrate and rotate.'], ['$\\mathrm{Kr(g)}$', '$\\mathrm{Ar(g)}$', 'Heavier atoms have more closely spaced translational energy levels, so more microstates at the same temperature (164 vs 155 J/(mol·K)).'],
      ['Graphite', 'Diamond', 'Diamond\u2019s rigid 3-D network allows fewer vibrations than graphite\u2019s layers (5.7 vs 2.4 J/(mol·K)).'], ['1 mol $\\mathrm{O_2}$ at 0.1 atm', '1 mol $\\mathrm{O_2}$ at 10 atm', 'At lower pressure the gas fills a larger volume: more positions.'], ['$\\mathrm{Br_2(g)}$', '$\\mathrm{Br_2(l)}$', 'Gas beats liquid.']];
    var pr = R.pick(pairs);
    return P('Which has the higher standard molar entropy (at the same temperature)?', mc(pr[0], [pr[1]]), [pr[2]], 'Gas > liquid > solid; then bigger, heavier or floppier molecules win.', null, { k: 'srank', ans: pr[0] });
  });

  G('gchem2.standard-entropy', function (R, ctx) {
    var kind = lv(ctx, 'dS', R.pick(['dS', 'dS', 'elem']), R.pick(['dS', 'unknown']));
    var E = parseEq(R.pick(TRX)), v = dS(E);
    if (kind === 'elem') { var els = species(E).filter(function (sp) { return TD[key(sp)][1] === 0; }); if (!els.length) { E = parseEq('N2(g) + 3H2(g) -> 2NH3(g)'); els = E.r; v = dS(E); }
      var el = els[0];
      return P('What is the standard molar entropy $S^\\circ$ of $' + F(key(el)) + '$ at 298 K? Use the table.' + tdTable(E, 0, '$S^\\circ$ (J/(mol·K))'), numT(TD[key(el)][0], 4, 0.05), [
        'Read it from the table: $S^\\circ = ' + T.num(TD[key(el)][0]) + '\\ \\text{J/(mol·K)}$.',
        'Unlike $\\Delta H^\\circ_f$, which is zero for an element in its standard state, $S^\\circ$ of an element is not zero: its atoms or molecules still move and vibrate at 298 K. Only a perfect crystal at 0 K has $S = 0$ (the third law).'
      ], 'Entropies are absolute values, not "formation" values.', 'J/(mol·K)', { k: 'Sel', ans: TD[key(el)][0] }); }
    if (kind === 'unknown') { var tgt = R.pick(species(E)), tv = TD[key(tgt)][0], nu = coefOf(E, tgt.f), restSum = v - nu * tv;
      return P('For $' + EQ(E.eq) + '$, $\\Delta S^\\circ = ' + T.num(rd(v, 1)) + '\\ \\text{J/K}$. Using the other standard entropies below, find $S^\\circ$ for $' + F(key(tgt)) + '$.' + tbl(['Substance', '$S^\\circ$ (J/(mol·K))'], species(E).filter(function (sp) { return sp !== tgt; }).map(function (sp) { return ['$' + F(key(sp)) + '$', String(TD[key(sp)][0])]; })), numT(tv, 4, 0.6, 0.01), [
        '$\\Delta S^\\circ = \\sum nS^\\circ(\\text{products}) - \\sum nS^\\circ(\\text{reactants})$.',
        'Everything except $' + F(key(tgt)) + '$ contributes $' + T.num(rd(restSum, 2)) + '\\ \\text{J/K}$, so $' + (nu === 1 ? '' : nu === -1 ? '-' : T.num(nu)) + 'S^\\circ = ' + T.num(rd(v, 1)) + ' - (' + T.num(rd(restSum, 2)) + ') = ' + T.num(rd(nu * tv, 2)) + '$.',
        '$S^\\circ(' + F(key(tgt)) + ') = ' + T.num(tv) + '\\ \\text{J/(mol·K)}$.'
      ], 'Write the products-minus-reactants sum with one unknown and solve.', 'J/(mol·K)', { k: 'Sun', eq: E.eq, ans: tv }); }
    return P('Find $\\Delta S^\\circ$ for $' + EQ(E.eq) + '$ at 298 K.' + tdTable(E, 0, '$S^\\circ$ (J/(mol·K))'), numT(v, 4, 0.6, 0.01), [
      '$\\Delta S^\\circ = \\sum nS^\\circ(\\text{products}) - \\sum nS^\\circ(\\text{reactants})$, with every substance included: elements have nonzero $S^\\circ$.',
      '$\\Delta S^\\circ = ' + sumTex(E, 0) + '$.',
      '$\\Delta S^\\circ = ' + T.num(rd(v, 1)) + '\\ \\text{J/K}$. ' + (v > 0 ? 'Positive' : 'Negative') + ', as the change in moles of gas (' + dnGas(E) + ') suggests.'
    ], 'Products minus reactants, each times its coefficient, elements included.', 'J/K', { k: 'dS', eq: E.eq, ans: v });
  });

  G('gchem2.second-law', function (R, ctx) {
    var kind = lv(ctx, R.pick(['surr', 'phase']), R.pick(['univ', 'phase', 'surr']), R.pick(['univ', 'phaseT', 'phase']));
    if (kind === 'phase' || kind === 'phaseT') { var fr = R.coin(), Tc = fr ? R.pick([-10, -5, 5, 10, -20, 15]) : R.pick([90, 95, 105, 110, 80, 120]), Tk = Tc + 273;
      var dHs = fr ? -6010 : 40700, dSs = fr ? -22.0 : 109.1, sur = -dHs / Tk, uni = dSs + sur, fav = uni > 0;
      var proc = fr ? 'water freezing' : 'liquid water boiling (at 1 atm)';
      if (kind === 'phaseT') return P('For ' + proc + ', $\\Delta H = ' + (dHs / 1000).toFixed(dHs < 0 ? 2 : 1) + '\\ \\text{kJ/mol}$ and $\\Delta S_{\\text{sys}} = ' + dSs.toFixed(1) + '\\ \\text{J/(mol·K)}$ (take both as constant). What is $\\Delta S_{\\text{univ}}$ per mole at $' + Tc + '^\\circ\\text{C}$?', numT(uni, 2, 0.05, 0.05), [
        '$T = ' + Tc + ' + 273 = ' + Tk + '\\ \\text{K}$. $\\Delta S_{\\text{surr}} = -\\dfrac{\\Delta H}{T} = -\\dfrac{' + T.num(dHs) + '\\ \\text{J/mol}}{' + Tk + '\\ \\text{K}} = ' + pm(sur, 3) + '\\ \\text{J/(mol·K)}$.',
        '$\\Delta S_{\\text{univ}} = ' + dSs.toFixed(1) + ' + (' + pm(sur, 3) + ') = ' + pm(uni, 2) + '\\ \\text{J/(mol·K)}$: ' + (fav ? 'positive, so it happens on its own.' : 'negative, so it does not happen on its own.')
      ], 'ΔS_surr = −ΔH/T in J; add it to ΔS_sys.', 'J/(mol·K)', { k: 'univ', dH: dHs, dSs: dSs, T: Tk, ans: uni });
      var yes = 'Yes: $\\Delta S_{\\text{univ}} > 0$', no = 'No: $\\Delta S_{\\text{univ}} < 0$';
      return P('Is ' + proc + ' thermodynamically favored at $' + Tc + '^\\circ\\text{C}$? For this change, $\\Delta H = ' + (dHs / 1000).toFixed(dHs < 0 ? 2 : 1) + '\\ \\text{kJ/mol}$ and $\\Delta S_{\\text{sys}} = ' + dSs.toFixed(1) + '\\ \\text{J/(mol·K)}$.', mc(fav ? yes : no, [fav ? no : yes, fr ? 'No: $\\Delta S_{\\text{sys}}$ is negative, so it can never happen' : 'Yes: $\\Delta S_{\\text{sys}}$ is positive, so it always happens']), [
        'The second law looks at the universe: $\\Delta S_{\\text{univ}} = \\Delta S_{\\text{sys}} + \\Delta S_{\\text{surr}}$, with $\\Delta S_{\\text{surr}} = -\\Delta H/T$.',
        '$T = ' + Tk + '\\ \\text{K}$: $\\Delta S_{\\text{surr}} = ' + pm(sur, 3) + '\\ \\text{J/(mol·K)}$, so $\\Delta S_{\\text{univ}} = ' + pm(uni, 2) + '\\ \\text{J/(mol·K)}$.',
        fav ? 'Positive: favored. ' + (fr ? 'Freezing lowers the water\u2019s own entropy, but the heat it releases raises the entropy of the colder surroundings by more.' : '') : 'Negative: not favored at this temperature.'
      ], 'Include the surroundings: ΔS_surr = −ΔH/T.', null, { k: 'phase', dH: dHs, dSs: dSs, T: Tk, ans: fav }); }
    var E = parseEq(R.pick(TRX)), H = dH(E), S = dS(E), Tk2 = R.pick([298, 298].concat(tChoices(E))), sur2 = -H * 1000 / Tk2, uni2 = S + sur2;
    if (kind === 'surr') return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(rd(H, 1)) + '\\ \\text{kJ}$. What is $\\Delta S_{\\text{surr}}$ at $' + Tk2 + '\\ \\text{K}$?', num(sur2), [
      'Heat released by the system flows into the surroundings: $q_{\\text{surr}} = -\\Delta H$. At constant $T$, $\\Delta S_{\\text{surr}} = \\dfrac{q_{\\text{surr}}}{T} = -\\dfrac{\\Delta H}{T}$.',
      'Use joules: $\\Delta S_{\\text{surr}} = -\\dfrac{' + T.num(rd(H * 1000, 0)) + '\\ \\text{J}}{' + Tk2 + '\\ \\text{K}} = ' + q(sur2, 'J/K') + '$.',
      H < 0 ? 'Exothermic, so the surroundings gain entropy.' : 'Endothermic, so the surroundings lose entropy.'
    ], 'ΔS_surr = −ΔH/T, with ΔH in joules.', 'J/K', { k: 'surr', eq: E.eq, T: Tk2, ans: sur2 });
    return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(rd(H, 1)) + '\\ \\text{kJ}$ and $\\Delta S^\\circ = ' + T.num(rd(S, 1)) + '\\ \\text{J/K}$. What is $\\Delta S_{\\text{univ}}$ at $' + Tk2 + '\\ \\text{K}$ (taking both as constant)?', numT(uni2, 3, 0.5, 0.02), [
      '$\\Delta S_{\\text{surr}} = -\\dfrac{\\Delta H}{T} = -\\dfrac{' + T.num(rd(H * 1000, 0)) + '}{' + Tk2 + '} = ' + fx(sur2, 4) + '\\ \\text{J/K}$.',
      '$\\Delta S_{\\text{univ}} = ' + T.num(rd(S, 1)) + ' + (' + fx(sur2, 4) + ') = ' + fx(uni2, 3) + '\\ \\text{J/K}$: ' + (uni2 > 0 ? 'positive, so the reaction is favored at this temperature.' : 'negative, so it is not favored at this temperature.')
    ], 'Add ΔS_sys and ΔS_surr = −ΔH/T (in J/K).', 'J/K', { k: 'univ2', eq: E.eq, T: Tk2, ans: uni2 });
  });

  function tChoices(E) { var sp = species(E); if (sp.some(function (x) { return x.ph === 'l'; })) return [273, 310, 330]; if (sp.some(function (x) { return ['I2', 'KClO3', 'KCl', 'NH4Cl', 'Mg', 'MgO'].indexOf(x.f) >= 0; })) return [310, 350, 400]; return [400, 500, 800, 1000, 1200]; }
  function gText(H, S, Tk, G0) { return '$\\Delta G^\\circ = \\Delta H^\\circ - T\\Delta S^\\circ = ' + T.num(rd(H, 1)) + '\\ \\text{kJ} - (' + Tk + '\\ \\text{K})(' + T.num(rd(S / 1000, 4)) + '\\ \\text{kJ/K}) = ' + fx(G0, 3) + '\\ \\text{kJ}$'; }
  G('gchem2.gibbs-energy', function (R, ctx) {
    var kind = lv(ctx, R.pick(['G298', 'fav']), R.pick(['G298', 'GT', 'Gf']), R.pick(['GT', 'Gf', 'fav']));
    var E = parseEq(R.pick(TRX)), H = rd(dH(E), 1), S = rd(dS(E), 1);
    if (kind === 'Gf') { var Gv = dG(E);
      var pp = P('Find $\\Delta G^\\circ$ at 298 K for $' + EQ(E.eq) + '$ from standard free energies of formation.' + tdTable(E, 2, '$\\Delta G^\\circ_f$ (kJ/mol)'), numT(Gv, 4, 0.6, 0.01), [
        '$\\Delta G^\\circ = \\sum n\\Delta G^\\circ_f(\\text{products}) - \\sum n\\Delta G^\\circ_f(\\text{reactants})$; elements in their standard states have $\\Delta G^\\circ_f = 0$.',
        '$\\Delta G^\\circ = ' + sumTex(E, 2) + ' = ' + T.num(rd(Gv, 1)) + '\\ \\text{kJ}$.', Gv < 0 ? 'Negative: thermodynamically favored at 298 K.' : 'Positive: not favored at 298 K (the reverse is).'
      ], 'Products minus reactants, like Hess\u2019s law.', 'kJ', { k: 'Gf', eq: E.eq, ans: Gv }); pp.nolint = ['+ 0']; return pp; }
    var Tk = kind === 'GT' ? R.pick(tChoices(E)) : 298, G0 = H - Tk * S / 1000;
    var st = ['Make the units match: $\\Delta S^\\circ = ' + T.num(S) + '\\ \\text{J/K} = ' + T.num(rd(S / 1000, 4)) + '\\ \\text{kJ/K}$.', gText(H, S, Tk, G0) + '.'];
    if (kind === 'fav') { var yes = 'Yes: $\\Delta G^\\circ < 0$', no = 'No: $\\Delta G^\\circ > 0$';
      return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(H) + '\\ \\text{kJ}$ and $\\Delta S^\\circ = ' + T.num(S) + '\\ \\text{J/K}$. Is it thermodynamically favored under standard conditions at 298 K?', mc(G0 < 0 ? yes : no, [G0 < 0 ? no : yes, H < 0 ? 'Yes, because every exothermic reaction is favored' : 'No, because endothermic reactions are never favored']), st.concat([G0 < 0 ? 'Negative, so it is favored (it can proceed without outside help; that says nothing about how fast).' : 'Positive, so it is not favored at 298 K; the reverse reaction is.']), 'Compute ΔG° = ΔH° − TΔS° with matching units.', null, { k: 'Gfav', eq: E.eq, H: H, S: S, T: Tk, ans: G0 < 0 }); }
    return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(H) + '\\ \\text{kJ}$ and $\\Delta S^\\circ = ' + T.num(S) + '\\ \\text{J/K}$. What is $\\Delta G^\\circ$ at $' + Tk + '\\ \\text{K}$' + (Tk !== 298 ? ' (assume $\\Delta H^\\circ$ and $\\Delta S^\\circ$ do not change with temperature)' : '') + '?', numT(G0, 3, 0.5, 0.02), st.concat([G0 < 0 ? 'Negative: favored at this temperature.' : 'Positive: not favored at this temperature.']), 'ΔG = ΔH − TΔS; change ΔS to kJ/K first.', 'kJ', { k: 'G', eq: E.eq, H: H, S: S, T: Tk, ans: G0 });
  });

  var FAVS = ['Favored at all temperatures', 'Favored only at high temperatures', 'Favored only at low temperatures', 'Not favored at any temperature'];
  G('gchem2.temperature-favorability', function (R, ctx) {
    var kind = lv(ctx, R.pick(['signs', 'signs', 'Tx']), R.pick(['Tx', 'signsRx', 'TxC']), R.pick(['TxC', 'Tx', 'signsRx']));
    if (kind === 'signs') { var hs = R.pick([['−', '+', 0], ['+', '+', 1], ['−', '−', 2], ['+', '−', 3]]);
      return P('A process has $\\Delta H ' + (hs[0] === '−' ? '< 0' : '> 0') + '$ and $\\Delta S ' + (hs[1] === '−' ? '< 0' : '> 0') + '$. When is it thermodynamically favored?', mc(FAVS[hs[2]], FAVS.filter(function (f, i) { return i !== hs[2]; })), [
        '$\\Delta G = \\Delta H - T\\Delta S$. The $-T\\Delta S$ term grows with temperature.',
        ['Both terms are negative ($\\Delta H < 0$ and $-T\\Delta S < 0$), so $\\Delta G < 0$ at every temperature.', '$\\Delta H > 0$ works against it, but $-T\\Delta S$ is negative and grows with $T$: above $T = \\Delta H/\\Delta S$ it wins. Endothermic processes can be favored.', '$\\Delta H < 0$ helps, but $-T\\Delta S$ is positive and grows with $T$: favored only below $T = \\Delta H/\\Delta S$.', 'Both terms are positive, so $\\Delta G > 0$ at every temperature; the reverse process is always favored.'][hs[2]]
      ], 'Look at the sign of each term in ΔG = ΔH − TΔS as T grows.', null, { k: 'signs', ans: hs[2] }); }
    var cands = TRX.filter(function (e) { var E0 = parseEq(e), tx = dH(E0) * 1000 / dS(E0); return dH(E0) * dS(E0) > 0 && tx < 2000 && (e === 'H2O(l) -> H2O(g)' || !species(E0).some(function (x) { return x.ph === 'l'; })); }), E = parseEq(R.pick(kind === 'signsRx' ? TRX : cands)), H = rd(dH(E), 1), S = rd(dS(E), 1);
    if (kind === 'signsRx') { var idx = H < 0 && S > 0 ? 0 : H > 0 && S > 0 ? 1 : H < 0 && S < 0 ? 2 : 3;
      return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(H) + '\\ \\text{kJ}$ and $\\Delta S^\\circ = ' + T.num(S) + '\\ \\text{J/K}$. Assuming these do not change with temperature, when is the reaction favored?', mc(FAVS[idx], FAVS.filter(function (f, i) { return i !== idx; })), [
        'Signs: $\\Delta H ' + (H < 0 ? '< 0' : '> 0') + '$, $\\Delta S ' + (S < 0 ? '< 0' : '> 0') + '$.',
        idx === 0 ? 'Both help: favored at all temperatures.' : idx === 3 ? 'Both hurt: never favored.' : 'They pull opposite ways, so the crossover is at $T = \\dfrac{\\Delta H}{\\Delta S} = \\dfrac{' + T.num(rd(H * 1000, 0)) + '}{' + T.num(S) + '} = ' + fx(H * 1000 / S, 3) + '\\ \\text{K}$; it is favored ' + (idx === 1 ? 'above' : 'below') + ' that temperature.'
      ], 'Decide from the signs of ΔH and ΔS.', null, { k: 'signsRx', eq: E.eq, ans: idx }); }
    var Tx = H * 1000 / S, above = S > 0;
    if (kind === 'TxC') return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(H) + '\\ \\text{kJ}$ and $\\Delta S^\\circ = ' + T.num(S) + '\\ \\text{J/K}$. Assuming these stay constant, ' + (above ? 'above' : 'below') + ' what temperature, in °C, is the reaction favored?', numT(Tx - 273, 3, 3, 0.02), [
      'At the crossover, $\\Delta G = 0$: $T = \\dfrac{\\Delta H}{\\Delta S} = \\dfrac{' + T.num(rd(H * 1000, 0)) + '\\ \\text{J}}{' + T.num(S) + '\\ \\text{J/K}} = ' + fx(Tx, 3) + '\\ \\text{K}$.',
      'In Celsius: $' + fx(Tx, 3) + ' - 273 = ' + fx(Tx - 273, 3) + '^\\circ\\text{C}$. ' + (above ? 'Above this, $-T\\Delta S$ outweighs the positive $\\Delta H$.' : 'Below this, the negative $\\Delta H$ outweighs $-T\\Delta S$.')
    ], 'Set ΔG = 0, solve T = ΔH/ΔS in kelvins, then convert.', '°C', { k: 'TxC', eq: E.eq, ans: Tx - 273 });
    return P('For $' + EQ(E.eq) + '$, $\\Delta H^\\circ = ' + T.num(H) + '\\ \\text{kJ}$ and $\\Delta S^\\circ = ' + T.num(S) + '\\ \\text{J/K}$. Assuming these stay constant, at what temperature does $\\Delta G^\\circ$ change sign?', num(Tx), [
      'At the crossover $\\Delta G = 0$, so $\\Delta H = T\\Delta S$ and $T = \\dfrac{\\Delta H}{\\Delta S}$.',
      'With matching units: $T = \\dfrac{' + T.num(rd(H * 1000, 0)) + '\\ \\text{J}}{' + T.num(S) + '\\ \\text{J/K}} = ' + q(Tx, 'K') + '$.',
      'It is favored ' + (above ? 'above' : 'below') + ' this temperature.'
    ], 'Set ΔG = 0 and solve for T; keep ΔH in J.', 'K', { k: 'Tx', eq: E.eq, ans: Tx });
  });

  var KC = [
    ['Diamond turning into graphite has $\\Delta G^\\circ = -2.9\\ \\text{kJ/mol}$ at 25 °C, yet diamonds last for millions of years.', 'The activation energy for rearranging the carbon network is enormous, so the rate is immeasurably slow'],
    ['A mixture of hydrogen and oxygen gas can sit for years without reacting, even though forming water has $\\Delta G^\\circ = -237\\ \\text{kJ/mol}$.', 'The reaction has a high activation energy; a spark supplies enough energy to start it'],
    ['Paper burning in air is strongly favored, yet a book on a shelf does not burst into flame.', 'Combustion of paper has a high activation energy at room temperature']
  ];
  G('gchem2.kinetic-control', function (R, ctx) {
    var kind = lv(ctx, R.pick(['why', 'tf']), R.pick(['why', 'ratio', 'which']), R.pick(['ratio', 'which', 'tf']));
    if (kind === 'why') { var c = R.pick(KC); return P(c[0] + ' Why?', mc(c[1], ['$\\Delta G^\\circ$ is too small for the reaction to be favored', 'The reaction is at equilibrium already', 'A negative $\\Delta G$ means the reaction must be fast, so the data must be wrong']), [
      '$\\Delta G$ tells whether a reaction is favored: whether the products are lower in free energy. It says nothing about the path or how fast the reaction goes.',
      'Speed is set by the activation energy (kinetics). A favored reaction with a high barrier is said to be under kinetic control: it stays stuck until something supplies energy or a catalyst opens a lower path.'
    ], 'Favored is about where the reaction ends up; fast is about the barrier in the way.', null, { k: 'kcwhy', ans: c[1] }); }
    if (kind === 'tf') { var t = R.pick([['A reaction with a very negative ΔG° must happen quickly.', false], ['A catalyst can make a thermodynamically favored reaction fast, but cannot make an unfavored one go to products.', true], ['ΔG° tells you nothing about the activation energy of a reaction.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['Thermodynamics (ΔG) and kinetics (Ea, rate) answer different questions: "Where does it end up?" and "How fast does it get there?"', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Keep favored and fast apart.', null, { k: 'kctf', ans: t[1] }); }
    var Ea1 = R.pick([60, 70, 80, 90]), Ea2 = Ea1 + R.pick([10, 15, 20, 25]), Tk = R.pick([298, 300, 350]), r = M.exp((Ea2 - Ea1) * 1000 / (C.R * Tk));
    if (kind === 'which') { var G1 = R.pick([-20, -30, -40]), G2 = G1 - R.pick([30, 50, 70]);
      return P('A reactant can form product B ($E_a = ' + Ea1 + '\\ \\text{kJ/mol}$, $\\Delta G^\\circ = ' + G1 + '\\ \\text{kJ/mol}$) or product C ($E_a = ' + Ea2 + '\\ \\text{kJ/mol}$, $\\Delta G^\\circ = ' + G2 + '\\ \\text{kJ/mol}$). Early on, at a modest temperature, which product forms faster?', mc('B, because its activation energy is lower', ['C, because its ΔG° is more negative', 'C, because it is the more stable product', 'Both form at the same rate, because both are favored']), [
        'The rate depends on the barrier, not on how far downhill the product lies. B has the lower $E_a$, so B forms faster: it is the kinetic product.',
        'C is more stable (more negative $\\Delta G^\\circ$): the thermodynamic product. Given enough time and energy to get over its barrier (or to let B convert), the mixture would end up as mostly C.'
      ], 'Which barrier is lower?', null, { k: 'kcwhich', ans: 'B' }); }
    return P('Two paths for a reaction have the same $A$ in $k = Ae^{-E_a/RT}$, with $E_a = ' + Ea1 + '$ and $' + Ea2 + '\\ \\text{kJ/mol}$. At $' + Tk + '\\ \\text{K}$, how many times faster is the lower-barrier path? (Use a calculator.)', num(r, 3, 0.04), [
      '$\\dfrac{k_1}{k_2} = e^{(E_{a2} - E_{a1})/RT}$.', '$\\dfrac{(' + Ea2 + ' - ' + Ea1 + ')(1000)}{(8.314)(' + Tk + ')} = ' + fx((Ea2 - Ea1) * 1000 / (C.R * Tk), 3) + '$, so the ratio is $e^{' + fx((Ea2 - Ea1) * 1000 / (C.R * Tk), 3) + '} = ' + fx(r, 3) + '$.',
      'A barrier just ' + (Ea2 - Ea1) + ' kJ/mol higher slows a path by that factor, whatever the $\\Delta G^\\circ$ of the product.'
    ], 'Divide the two Arrhenius expressions.', null, { k: 'kcratio', Ea1: Ea1, Ea2: Ea2, T: Tk, ans: r });
  });

  G('gchem2.free-energy-k', function (R, ctx) {
    var kind = lv(ctx, R.pick(['K', 'G0']), R.pick(['K', 'G0', 'G']), R.pick(['G', 'dir', 'tf', 'K']));
    var Tk = 298;
    if (kind === 'K') { var G0 = R.chance(0.3) ? R.pick([-5.7, -11.4, -17.1, -8.0, 4.0, 10.0, -20.0, 15.0, -25.0]) : R.pick([-1, 1, -1]) * R.int(10, 300) / 10, K = M.exp(-G0 * 1000 / (C.R * Tk));
      return P('A reaction has $\\Delta G^\\circ = ' + T.num(G0) + '\\ \\text{kJ/mol}$ at 298 K. What is $K$? (Use $R = 8.314\\ \\text{J/(mol·K)}$ and a calculator.)', num(K, 3, 0.04), [
        'Rearrange $\\Delta G^\\circ = -RT\\ln K$: $\\ln K = -\\dfrac{\\Delta G^\\circ}{RT}$.',
        '$\\ln K = -\\dfrac{' + T.num(rd(G0 * 1000, 0)) + '}{(8.314)(298)} = ' + fx(-G0 * 1000 / (C.R * Tk), 3) + '$, so $K = e^{' + fx(-G0 * 1000 / (C.R * Tk), 3) + '} = ' + fx(K, 3) + '$.',
        G0 < 0 ? 'Negative $\\Delta G^\\circ$ gives $K > 1$: products are favored at equilibrium.' : 'Positive $\\Delta G^\\circ$ gives $K < 1$: reactants are favored at equilibrium.'
      ], 'K = e^(−ΔG°/RT), with ΔG° in J/mol.', null, { k: 'GK', G0: G0, ans: K }); }
    if (kind === 'G0') { var K2 = R.chance(0.3) ? R.pick([1.8e-5, 4.5e3, 0.25, 7.0e10, 2.0e-9, 55]) : R.int(11, 99) / 10 * M.pow(10, R.pick([-9, -7, -5, -3, -2, -1, 1, 2, 3, 5, 8, 10])), G2 = -C.R * Tk * M.log(K2) / 1000;
      return P('At 298 K, $K = ' + gv(K2) + '$ for a reaction. What is $\\Delta G^\\circ$ in kJ/mol? (Use a calculator.)', num(G2), ['$\\Delta G^\\circ = -RT\\ln K = -(8.314)(298)\\ln(' + gv(K2) + ')$.', '$\\ln(' + gv(K2) + ') = ' + fx(M.log(K2), 3) + '$, so $\\Delta G^\\circ = ' + fx(G2 * 1000, 3) + '\\ \\text{J/mol} = ' + q(G2, 'kJ/mol') + '$.'], 'ΔG° = −RT ln K; convert J to kJ at the end.', 'kJ/mol', { k: 'KG', K: K2, ans: G2 }); }
    if (kind === 'tf') { var t = R.pick([['At equilibrium, ΔG° = 0.', false], ['At equilibrium, ΔG = 0 and Q = K.', true], ['ΔG° is fixed for a reaction at a given temperature, while ΔG changes as the reaction proceeds.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['$\\Delta G^\\circ$ belongs to the standard state (all 1 M or 1 bar): it is a fixed number for the reaction at that temperature, $-RT\\ln K$.', '$\\Delta G = \\Delta G^\\circ + RT\\ln Q$ describes the mixture right now. It shrinks toward zero as $Q$ approaches $K$; at equilibrium $\\Delta G = 0$, not $\\Delta G^\\circ$.', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Which one depends on the current mixture?', null, { k: 'GKtf', ans: t[1] }); }
    var E = parseEq(R.pick(['N2(g) + 3H2(g) <=> 2NH3(g)', '2SO2(g) + O2(g) <=> 2SO3(g)', 'N2O4(g) <=> 2NO2(g)', 'H2(g) + I2(s) <=> 2HI(g)', 'PCl5(g) <=> PCl3(g) + Cl2(g)']));
    var Gd = dG({ r: E.r, p: E.p }), Pp = {}; species(E).filter(inK).forEach(function (sp) { Pp[sp.f] = R.pick([0.10, 0.50, 2.0, 5.0, 10, 0.20, 1.5]); });
    var Qv = kVal(E, Pp), Gv = Gd + C.R * Tk * M.log(Qv) / 1000;
    var stp = ['$\\Delta G^\\circ = ' + T.num(rd(Gd, 1)) + '\\ \\text{kJ}$ (from the problem). $Q = ' + kExpr(E, true) + ' = ' + kSub(E, Pp) + ' = ' + fx(Qv, 3) + '$ (pressures in bar).',
      '$\\Delta G = \\Delta G^\\circ + RT\\ln Q = ' + T.num(rd(Gd, 1)) + ' + (8.314 \\times 10^{-3})(298)\\ln(' + fx(Qv, 3) + ') = ' + fx(Gv, 3) + '\\ \\text{kJ}$.'];
    var qtext = 'For $' + EQ(E.eq) + '$, $\\Delta G^\\circ = ' + T.num(rd(Gd, 1)) + '\\ \\text{kJ}$ at 298 K. A mixture has ' + U.list(species(E).filter(inK).map(function (sp) { return '$P_{' + F(sp.f) + '} = ' + gv(Pp[sp.f]) + '\\ \\text{bar}$'; })) + '. ';
    if (kind === 'G') return P(qtext + 'What is $\\Delta G$ for the reaction in this mixture? (Use a calculator.)', numT(Gv, 3, 0.3, 0.02), stp, 'ΔG = ΔG° + RT ln Q, with R in kJ/(mol·K).', 'kJ', { k: 'GQ', eq: E.eq, P: Pp, ans: Gv });
    var d = Gv < 0 ? DIRS[0] : DIRS[1];
    return P(qtext + 'Which way does the reaction go from this mixture? (Use a calculator.)', mc(d, DIRS.filter(function (x) { return x !== d; })), stp.concat([Gv < 0 ? '$\\Delta G < 0$: the forward reaction is favored from here, toward the products.' : '$\\Delta G > 0$: the reverse reaction is favored from here, toward the reactants.']), 'The sign of ΔG (not ΔG°) for this mixture gives the direction.', null, { k: 'GQdir', eq: E.eq, P: Pp, ans: d });
  });

  var COUP = [
    ['glucose + phosphate → glucose 6-phosphate + water', 13.8], ['glutamate + ammonium ion → glutamine + water', 14.2], ['fructose 6-phosphate + phosphate → fructose 1,6-bisphosphate + water', 16.3], ['glycerol + phosphate → glycerol 3-phosphate + water', 9.2]
  ];
  var DRIVE = [['phosphoenolpyruvate', -61.9], ['phosphocreatine', -43.0], ['1,3-bisphosphoglycerate', -49.3]];
  G('gchem2.coupled-reactions', function (R, ctx) {
    var kind = lv(ctx, R.pick(['sum', 'tf', 'drive', 'atp', 'multi']), R.pick(['sum', 'atp', 'smelt', 'drive', 'multi']), R.pick(['K', 'atp', 'smelt', 'drive', 'multi']));
    if (kind === 'multi') { var X = R.int(10, 90), nA = R.int(1, 3), totM = rd(X - 30.5 * nA, 1);
      return P('An uphill reaction in a cell has $\\Delta G^{\\circ\\prime} = +' + X + '\\ \\text{kJ/mol}$. An enzyme couples it to the hydrolysis of ' + nA + ' ATP ($-30.5\\ \\text{kJ/mol}$ each). What is $\\Delta G^{\\circ\\prime}$ for the coupled process?', numT(totM, 3, 0.15), [
        'Coupled reactions add, so their free energies add: $\\Delta G^{\\circ\\prime} = ' + X + ' + ' + nA + '(-30.5) = ' + T.num(totM) + '\\ \\text{kJ/mol}$.',
        totM < 0 ? 'Negative: the coupled process is favored.' : 'Still positive: more ATP (or another driving reaction) would be needed.'
      ], 'Add +X and n × (−30.5).', 'kJ/mol', { k: 'cmulti', X: X, n: nA, ans: totM }); }
    if (kind === 'drive') { var d = R.pick(DRIVE), tot0 = rd(d[1] + 30.5, 1);
      return P('In cells, the phosphate group of ' + d[0] + ' is handed to ADP to make ATP. Hydrolysis of ' + d[0] + ' has $\\Delta G^{\\circ\\prime} = ' + T.num(d[1]) + '\\ \\text{kJ/mol}$, and making ATP from ADP and phosphate has $\\Delta G^{\\circ\\prime} = +30.5\\ \\text{kJ/mol}$. What is $\\Delta G^{\\circ\\prime}$ for the coupled transfer?', numT(tot0, 3, 0.15), [
        'The coupled reaction is the sum of the two: phosphate and water cancel.', '$\\Delta G^{\\circ\\prime} = ' + T.num(d[1]) + ' + 30.5 = ' + T.num(tot0) + '\\ \\text{kJ/mol}$: negative, so the downhill hydrolysis drives the uphill ATP synthesis.'
      ], 'Add the two ΔG°′ values.', 'kJ/mol', { k: 'cdrive', a: d[1], ans: tot0 }); }
    var c = R.pick(COUP), atp = -30.5;
    if (kind === 'sum') { var tot = rd(c[1] + atp, 1);
      return P('At pH 7 (biochemists write $\\Delta G^{\\circ\\prime}$), ' + c[0] + ' has $\\Delta G^{\\circ\\prime} = +' + c[1] + '\\ \\text{kJ/mol}$, and ATP + water → ADP + phosphate has $\\Delta G^{\\circ\\prime} = -30.5\\ \\text{kJ/mol}$. What is $\\Delta G^{\\circ\\prime}$ for the coupled reaction, in which ATP\u2019s phosphate goes onto the first reactant?', numT(tot, 3, 0.15), [
        'Add the two equations: the phosphate and water cancel, leaving the first reactant + ATP → its phosphate + ADP.',
        'Free energies add like enthalpies (Hess\u2019s law): $\\Delta G^{\\circ\\prime} = ' + c[1] + ' + (-30.5) = ' + T.num(tot) + '\\ \\text{kJ/mol}$.',
        'Negative, so the coupled reaction is favored. The uphill step itself still has $+' + c[1] + '$; coupling makes the total negative.'
      ], 'Add the ΔG values of the reactions you add.', 'kJ/mol', { k: 'csum', a: c[1], ans: tot }); }
    if (kind === 'tf') return P('True or false: when an unfavored reaction is coupled to ATP hydrolysis, the coupling lowers the ΔG of the unfavored reaction itself.', tf(false), ['The unfavored step keeps its own $\\Delta G$. Coupling writes a new overall reaction (the sum of the two), and it is that total $\\Delta G$ that is negative.', 'In cells the coupling is real chemistry: an enzyme passes the phosphate group through a shared intermediate, so the two reactions cannot run separately.'], 'Coupling adds reactions; it does not change either one.', null, { k: 'ctf', ans: false });
    if (kind === 'atp') { var need = R.int(35, 140), n = M.ceil(need / 30.5); if (M.abs(need - 30.5 * M.round(need / 30.5)) < 2) need += 5; n = M.ceil(need / 30.5);
      return P('A reaction in a cell has $\\Delta G^{\\circ\\prime} = +' + need + '\\ \\text{kJ/mol}$. What is the smallest whole number of ATP hydrolyses ($-30.5\\ \\text{kJ/mol}$ each) that, coupled to it, make the total $\\Delta G^{\\circ\\prime}$ negative?', int(n), [
        'Each ATP adds $-30.5\\ \\text{kJ/mol}$ to the total.',
        (n - 1) + ' ATP: $' + need + ' - ' + T.num(rd(30.5 * (n - 1), 1)) + ' = ' + T.num(rd(need - 30.5 * (n - 1), 1)) + '$ (' + (need - 30.5 * (n - 1) > 0 ? 'still positive' : 'negative') + '); ' + n + ' ATP: $' + need + ' - ' + T.num(rd(30.5 * n, 1)) + ' = ' + T.num(rd(need - 30.5 * n, 1)) + '$, negative.',
        'So ' + n + ' ATP are needed.'
      ], 'Divide the uphill ΔG by 30.5 and round up.', null, { k: 'catp', need: need, ans: n }); }
    if (kind === 'smelt') { var tot2 = rd(86.2 - 300.1, 1);
      return P('At 25 °C, $' + EQ('Cu2S(s) -> 2Cu(s) + S(s)') + '$ has $\\Delta G^\\circ = +86.2\\ \\text{kJ}$ and $' + EQ('S(s) + O2(g) -> SO2(g)') + '$ has $\\Delta G^\\circ = -300.1\\ \\text{kJ}$. What is $\\Delta G^\\circ$ for the coupled reaction $' + EQ('Cu2S(s) + O2(g) -> 2Cu(s) + SO2(g)') + '$?', numT(tot2, 4, 0.15), [
        'The target is the sum of the two reactions: the sulfur made in the first is used in the second.', '$\\Delta G^\\circ = 86.2 + (-300.1) = ' + T.num(tot2) + '\\ \\text{kJ}$.',
        'Roasting copper(I) sulfide in air works because burning the sulfur pays for freeing the copper.'
      ], 'Add the two ΔG° values.', 'kJ', { k: 'csmelt', ans: tot2 }); }
    var tot3 = c[1] + atp, Kc = M.exp(-tot3 * 1000 / (C.R * 310));
    return P('Coupled to ATP hydrolysis ($-30.5\\ \\text{kJ/mol}$), ' + c[0] + ' ($+' + c[1] + '\\ \\text{kJ/mol}$) has a total $\\Delta G^{\\circ\\prime}$ of $' + T.num(rd(tot3, 1)) + '\\ \\text{kJ/mol}$. What is $K$ for the coupled reaction at 310 K (body temperature)? (Use a calculator.)', num(Kc, 3, 0.05), [
      '$K = e^{-\\Delta G^{\\circ\\prime}/RT} = e^{' + T.num(rd(-tot3 * 1000, 0)) + '/(8.314 \\times 310)} = e^{' + fx(-tot3 * 1000 / (C.R * 310), 3) + '}$.', '$K = ' + fx(Kc, 3) + '$. Alone, the uphill step has $K = ' + fx(M.exp(-c[1] * 1000 / (C.R * 310)), 2) + '$; coupling multiplies the constants.'
    ], 'K = e^(−ΔG/RT) with ΔG in J/mol and T = 310 K.', null, { k: 'cpK', a: c[1], ans: Kc });
  });


  // ================================================================== Unit 6: Electrochemistry
  // standard reduction potentials at 25 °C (OpenStax Chemistry 2e Appendix L), rounded to 0.01 V
  // couple: [E°, electrons, oxidized form, reduced form, metal symbol or null, molar mass of the metal]
  var EC = {
    'Li': [-3.04, 1, 'Li^+', 'Li', 'Li', 6.94], 'K': [-2.93, 1, 'K^+', 'K', 'K', 39.10], 'Ca': [-2.87, 2, 'Ca^2+', 'Ca', 'Ca', 40.08], 'Na': [-2.71, 1, 'Na^+', 'Na', 'Na', 22.99], 'Mg': [-2.37, 2, 'Mg^2+', 'Mg', 'Mg', 24.31],
    'Al': [-1.66, 3, 'Al^3+', 'Al', 'Al', 26.98], 'Zn': [-0.76, 2, 'Zn^2+', 'Zn', 'Zn', 65.38], 'Cr': [-0.74, 3, 'Cr^3+', 'Cr', 'Cr', 52.00], 'Fe': [-0.45, 2, 'Fe^2+', 'Fe', 'Fe', 55.85], 'Cd': [-0.40, 2, 'Cd^2+', 'Cd', 'Cd', 112.41],
    'Ni': [-0.26, 2, 'Ni^2+', 'Ni', 'Ni', 58.69], 'Sn': [-0.14, 2, 'Sn^2+', 'Sn', 'Sn', 118.71], 'Pb': [-0.13, 2, 'Pb^2+', 'Pb', 'Pb', 207.2], 'H2': [0.00, 2, 'H^+', 'H2', null], 'Cu': [0.34, 2, 'Cu^2+', 'Cu', 'Cu', 63.55],
    'I2': [0.54, 2, 'I2', 'I^-', null], 'Fe3': [0.77, 1, 'Fe^3+', 'Fe^2+', null], 'Ag': [0.80, 1, 'Ag^+', 'Ag', 'Ag', 107.87], 'Br2': [1.07, 2, 'Br2', 'Br^-', null], 'Cl2': [1.36, 2, 'Cl2', 'Cl^-', null], 'Au': [1.50, 3, 'Au^3+', 'Au', 'Au', 196.97], 'F2': [2.87, 2, 'F2', 'F^-', null]
  };
  var METALS = ['Mg', 'Al', 'Zn', 'Cr', 'Fe', 'Cd', 'Ni', 'Sn', 'Pb', 'Cu', 'Ag', 'Au'];
  function halfTex(k) { var c = EC[k], red = c[3] === 'I^-' || c[3] === 'Br^-' || c[3] === 'Cl^-' || c[3] === 'F^-' ? '2' + c[3] : c[3] === 'H2' ? 'H2' : c[3]; var ox = c[2] === 'H^+' ? '2H^+' : c[2];
    return EQ(ox + '(aq) + ' + (c[1] > 1 ? c[1] : '') + 'e^- -> ' + red + (c[4] ? '(s)' : c[3] === 'H2' ? '(g)' : '(aq)')).replace('(aq)(aq)', '(aq)'); }
  function ePot(k) { var v = EC[k][0]; return (v > 0 ? '+' : '') + v.toFixed(2); }
  function cellPair(R, keys) { var ks = R.sample(keys || METALS, 2); while (M.abs(EC[ks[0]][0] - EC[ks[1]][0]) < 0.05) ks = R.sample(keys || METALS, 2); return EC[ks[0]][0] < EC[ks[1]][0] ? [ks[0], ks[1]] : [ks[1], ks[0]]; }   // [anode, cathode]
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function overall(an, ca) { // balanced overall equation for metal anode / metal-ion cathode
    var A = EC[an], Cc = EC[ca], n = A[1] * Cc[1] / gcd(A[1], Cc[1]), mA = n / A[1], mC = n / Cc[1];
    return { n: n, mA: mA, mC: mC, eq: (mA > 1 ? mA : '') + A[3] + '(s) + ' + (mC > 1 ? mC : '') + Cc[2] + '(aq) -> ' + (mA > 1 ? mA : '') + A[2] + '(aq) + ' + (mC > 1 ? mC : '') + Cc[3] + '(s)' };
  }
  function potTable(keys) { return tbl(['Half-reaction', '$E^\\circ$ (V)'], keys.map(function (k) { return ['$' + halfTex(k) + '$', ePot(k).replace('-', '−')]; })); }

  G('gchem2.galvanic-cells', function (R, ctx) {
    var kind = lv(ctx, R.pick(['anode', 'electrons', 'tf']), R.pick(['anode', 'bridge', 'mass', 'electrons']), R.pick(['notation', 'bridge', 'cathode', 'coef']));
    var pr = cellPair(R), an = pr[0], ca = pr[1], A = EC[an], Cc = EC[ca];
    var intro = 'A galvanic cell is built from a $' + F(an) + '$ electrode in $1\\ \\text{M}$ $' + F(A[2]) + '$ and a $' + F(ca) + '$ electrode in $1\\ \\text{M}$ $' + F(Cc[2]) + '$, joined by a wire and a salt bridge of $\\mathrm{KNO_3}$.' + potTable([an, ca]);
    var who = 'The half-reaction with the higher (more positive) reduction potential runs as a reduction: $' + F(ca) + '$ ($' + ePot(ca) + '\\ \\text{V}$) is the cathode, and $' + F(an) + '$ ($' + ePot(an) + '\\ \\text{V}$) is oxidized at the anode.';
    if (kind === 'anode' || kind === 'cathode') { var isA = kind === 'anode';
      return P(intro + 'Which metal is the ' + (isA ? 'anode' : 'cathode') + '? Type its symbol.', fml(isA ? an : ca), [who, 'Anode: oxidation, $' + EQ(A[3] + '(s) -> ' + A[2] + '(aq) + ' + (A[1] > 1 ? A[1] : '') + 'e^-') + '$. Cathode: reduction, $' + halfTex(ca) + '$.'], 'The more positive E° is reduced (cathode).', null, { k: 'gan', an: an, ca: ca, ans: isA ? an : ca }); }
    if (kind === 'electrons') { var right = 'From the $' + F(an) + '$ electrode to the $' + F(ca) + '$ electrode, through the wire';
      return P(intro + 'Which way do electrons flow?', mc(right, ['From the $' + F(ca) + '$ electrode to the $' + F(an) + '$ electrode, through the wire', 'From the $' + F(an) + '$ electrode to the $' + F(ca) + '$ electrode, through the salt bridge', 'Back and forth, so there is no net flow']), [who, 'Electrons are released at the anode (oxidation) and used at the cathode (reduction), so they travel through the external wire from anode to cathode. Electrons never travel through the solution or the salt bridge.'], 'Electrons leave where oxidation happens.', null, { k: 'gel', an: an, ca: ca, ans: right }); }
    if (kind === 'tf') { var t = R.pick([['Electrons travel through the salt bridge to complete the circuit.', false], ['In the salt bridge, ions carry the charge: anions drift toward the anode and cations toward the cathode.', true], ['The anode of a galvanic cell is where oxidation happens.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['Electrons move only through the metal wire, from anode to cathode. In the solutions and the salt bridge, the current is carried by moving ions.', 'As the anode makes positive ions and the cathode uses them up, anions from the bridge flow toward the anode and cations toward the cathode, keeping both solutions neutral.', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Which particles can move through a solution?', null, { k: 'gtf', ans: t[1] }); }
    if (kind === 'bridge') { var right2 = 'Toward the $' + F(an) + '$ half-cell (the anode)';
      return P(intro + 'Which way do the nitrate ions, $\\mathrm{NO_3^-}$, in the salt bridge move?', mc(right2, ['Toward the $' + F(ca) + '$ half-cell (the cathode)', 'They carry electrons through the bridge', 'They stay still; only electrons move']), [who, 'At the anode, metal atoms become cations, so that solution would build up positive charge; at the cathode, cations are used up. Anions drift toward the anode and cations toward the cathode to keep each solution neutral.'], 'Which solution is gaining positive ions?', null, { k: 'gbr', an: an, ca: ca, ans: right2 }); }
    if (kind === 'mass') { var right3 = 'The $' + F(ca) + '$ electrode (the cathode)';
      return P(intro + 'Which electrode gains mass as the cell runs?', mc(right3, ['The $' + F(an) + '$ electrode (the anode)', 'Neither: the electrodes are unchanged', 'Both, equally']), [who, 'At the cathode, $' + F(Cc[2]) + '$ ions gain electrons and plate out as solid metal, so the cathode grows; the anode dissolves and loses mass.'], 'Where do metal ions turn into metal?', null, { k: 'gmass', an: an, ca: ca, ans: right3 }); }
    if (kind === 'coef') { var o = overall(an, ca);
      return P(intro + 'Balance the overall cell reaction, $a\\,' + F(an + '(s)') + ' + b\\,' + F(Cc[2] + '(aq)') + ' \\to c\\,' + F(A[2] + '(aq)') + ' + d\\,' + F(ca + '(s)') + '$. Give $a$, $b$, $c$ and $d$ in order.', { t: 'tuple', v: [String(o.mA), String(o.mC), String(o.mA), String(o.mC)] }, [
        'Anode: $' + EQ(A[3] + '(s) -> ' + A[2] + '(aq) + ' + (A[1] > 1 ? A[1] : '') + 'e^-') + '$; cathode: $' + halfTex(ca) + '$.',
        'Make the electrons match: the least common multiple of ' + A[1] + ' and ' + Cc[1] + ' is ' + o.n + ', so multiply the anode by ' + o.mA + ' and the cathode by ' + o.mC + '.',
        'Overall: $' + EQ(o.eq) + '$, with $n = ' + o.n + '$ electrons transferred.'
      ], 'Balance the electrons lost and gained.', null, { k: 'gcoef', an: an, ca: ca, ans: [o.mA, o.mC] }); }
    var right4 = '$' + F(an) + '(s)\\,|\\,' + F(A[2]) + '(aq)\\,\\|\\,' + F(Cc[2]) + '(aq)\\,|\\,' + F(ca) + '(s)$';
    return P(intro + 'Which is the correct cell notation?', mc(right4, ['$' + F(ca) + '(s)\\,|\\,' + F(Cc[2]) + '(aq)\\,\\|\\,' + F(A[2]) + '(aq)\\,|\\,' + F(an) + '(s)$', '$' + F(A[2]) + '(aq)\\,|\\,' + F(an) + '(s)\\,\\|\\,' + F(ca) + '(s)\\,|\\,' + F(Cc[2]) + '(aq)$', '$' + F(an) + '(s)\\,|\\,' + F(Cc[2]) + '(aq)\\,\\|\\,' + F(A[2]) + '(aq)\\,|\\,' + F(ca) + '(s)$']), [who, 'Cell notation writes the anode on the left and the cathode on the right: anode metal | anode solution || cathode solution | cathode metal. Each | is a phase boundary; || is the salt bridge.'], 'Anode on the left, cathode on the right.', null, { k: 'gnot', an: an, ca: ca, ans: right4 });
  });

  G('gchem2.standard-potentials', function (R, ctx) {
    var kind = lv(ctx, R.pick(['E', 'E']), R.pick(['E', 'oxid', 'best']), R.pick(['Ecoef', 'unknown', 'best', 'red']));
    if (kind === 'oxid' || kind === 'red') { var ks = R.sample(Object.keys(EC).filter(function (k) { return k !== 'H2'; }), 4), sorted = ks.slice().sort(function (a, b) { return EC[b][0] - EC[a][0]; });
      var ox = kind === 'oxid', ans = ox ? EC[sorted[0]][2] : EC[sorted[3]][3];
      return P('Using the table, which species is the strongest ' + (ox ? 'oxidizing' : 'reducing') + ' agent? Type its formula.' + potTable(ks), fml(ans), [
        ox ? 'An oxidizing agent gets reduced. The more positive $E^\\circ$, the more eagerly the species on the left of the half-reaction takes electrons.' : 'A reducing agent gets oxidized. The more negative $E^\\circ$, the more eagerly the species on the right gives electrons back.',
        'The ' + (ox ? 'most positive' : 'most negative') + ' value is ' + ePot(ox ? sorted[0] : sorted[3]).replace('-', '−') + ' V, so the strongest ' + (ox ? 'oxidizing' : 'reducing') + ' agent is $' + F(ans) + '$.'
      ], ox ? 'Top of the table (most positive E°), left side.' : 'Bottom of the table (most negative E°), right side.', null, { k: 'spox', keys: ks, ox: ox, ans: ans }); }
    if (kind === 'best') { var opts = R.sample(METALS, 4), best = null, bestE = -9;
      for (var i = 0; i < opts.length; i++) for (var j = 0; j < opts.length; j++) if (i !== j) { var e = EC[opts[j]][0] - EC[opts[i]][0]; if (e > bestE) { bestE = e; best = [opts[i], opts[j]]; } }
      var right = '$' + F(best[0]) + '$ anode with $' + F(best[1]) + '$ cathode', wr = []; var used = {}; used[right] = 1;
      while (wr.length < 3) { var p2 = R.sample(opts, 2), lo = EC[p2[0]][0] < EC[p2[1]][0] ? p2 : [p2[1], p2[0]], t = '$' + F(lo[0]) + '$ anode with $' + F(lo[1]) + '$ cathode'; if (!used[t]) { used[t] = 1; wr.push(t); } }
      return P('Which pair of these half-cells gives the largest standard cell potential?' + potTable(opts), mc(right, wr), [
        '$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$ is largest when the cathode has the most positive potential and the anode the most negative.',
        'So: $' + F(best[1]) + '$ (' + ePot(best[1]).replace('-', '−') + ' V) as the cathode and $' + F(best[0]) + '$ (' + ePot(best[0]).replace('-', '−') + ' V) as the anode: $E^\\circ_{\\text{cell}} = ' + bestE.toFixed(2) + '\\ \\text{V}$.'
      ], 'Pick the two that are farthest apart in the table.', null, { k: 'spbest', ans: right }); }
    var pr = kind === 'Ecoef' ? R.pick([['Al', 'Cu'], ['Al', 'Ag'], ['Zn', 'Ag'], ['Mg', 'Ag'], ['Cr', 'Cu'], ['Al', 'Ni'], ['Cu', 'Ag'], ['Mg', 'Au']]) : cellPair(R), an = pr[0], ca = pr[1], E0 = rd(EC[ca][0] - EC[an][0], 2);
    if (kind === 'unknown') { return P('A cell uses a $' + F(an) + '$ anode ($E^\\circ = ' + ePot(an) + '\\ \\text{V}$) and a cathode whose half-reaction has an unknown $E^\\circ$. The measured standard cell potential is $' + E0.toFixed(2) + '\\ \\text{V}$. What is $E^\\circ$ for the cathode half-reaction?', numT(EC[ca][0], 3, 0.005), [
      '$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$, so $E^\\circ_{\\text{cathode}} = E^\\circ_{\\text{cell}} + E^\\circ_{\\text{anode}}$.', '$E^\\circ_{\\text{cathode}} = ' + E0.toFixed(2) + ' + (' + ePot(an) + ') = ' + ePot(ca) + '\\ \\text{V}$ (that of $' + F(ca) + '$).'
    ], 'Rearrange E°cell = E°cathode − E°anode.', 'V', { k: 'spun', an: an, ca: ca, ans: EC[ca][0] }); }
    var o = overall(an, ca);
    return P('What is the standard cell potential for $' + EQ(o.eq) + '$?' + potTable([an, ca]), numT(E0, 3, 0.005), [
      '$' + F(ca) + '$ is reduced (cathode); $' + F(an) + '$ is oxidized (anode).',
      '$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = ' + ePot(ca) + ' - (' + ePot(an) + ') = ' + E0.toFixed(2) + '\\ \\text{V}$.',
      (o.mA > 1 || o.mC > 1 ? 'The coefficients ' + o.mA + ' and ' + o.mC + ' do not change $E^\\circ$: a potential is energy per unit of charge, and doubling the reaction doubles both the energy and the charge.' : 'Positive, so the reaction is favored as written.')
    ], 'Cathode minus anode; never multiply E° by a coefficient.', 'V', { k: 'spE', an: an, ca: ca, ans: E0 });
  });

  G('gchem2.cell-potential-free-energy', function (R, ctx) {
    var kind = lv(ctx, R.pick(['dG', 'n']), R.pick(['dG', 'n', 'K', 'Efrom']), R.pick(['K', 'dGn', 'Efrom']));
    var pr = R.pick([['Zn', 'Cu'], ['Al', 'Cu'], ['Mg', 'Ag'], ['Zn', 'Ag'], ['Al', 'Ni'], ['Cr', 'Cu'], ['Fe', 'Cu'], ['Ni', 'Ag'], ['Al', 'Ag'], ['Cd', 'Cu'], ['Pb', 'Ag'], ['Sn', 'Cu'], ['Mg', 'Cu'], ['Cr', 'Ag'], ['Al', 'Pb'], ['Mg', 'Ni'], ['Zn', 'Pb'], ['Fe', 'Ag'], ['Cr', 'Ni'], ['Mg', 'Au'], ['Al', 'Au'], ['Ni', 'Cu'], ['Pb', 'Cu'], ['Sn', 'Ag'], ['Cd', 'Ag'], ['Zn', 'Ni'], ['Zn', 'Sn'], ['Mg', 'Zn'], ['Al', 'Zn'], ['Al', 'Fe'], ['Mg', 'Fe'], ['Cr', 'Sn']]), an = pr[0], ca = pr[1], o = overall(an, ca), E0 = rd(EC[ca][0] - EC[an][0], 2), n = o.n;
    var dG0 = -n * C.F * E0 / 1000, intro = 'For $' + EQ(o.eq) + '$, $E^\\circ_{\\text{cell}} = ' + E0.toFixed(2) + '\\ \\text{V}$.';
    var nStep = 'Half-reactions: $' + EQ(EC[an][3] + '(s) -> ' + EC[an][2] + '(aq) + ' + (EC[an][1] > 1 ? EC[an][1] : '') + 'e^-') + '$ (×' + o.mA + ') and $' + halfTex(ca) + '$ (×' + o.mC + '): $n = ' + n + '$ electrons transferred in the balanced equation.';
    if (kind === 'n') return P(intro + ' How many moles of electrons, $n$, are transferred in the reaction as written?', int(n), [nStep, 'Use this $n$, not the electrons in one half-reaction before balancing, in $\\Delta G^\\circ = -nFE^\\circ$.'], 'Count electrons after the two half-reactions are balanced against each other.', null, { k: 'cn', an: an, ca: ca, ans: n });
    if (kind === 'dG' || kind === 'dGn') return P(intro + ' What is $\\Delta G^\\circ$ in kJ? (Use $F = 96{,}485\\ \\text{C/mol}$.)', num(dG0, 3, 0.01), [nStep, '$\\Delta G^\\circ = -nFE^\\circ = -(' + n + ')(96{,}485)(' + E0.toFixed(2) + ') = ' + fx(dG0 * 1000, 3) + '\\ \\text{J} = ' + q(dG0, 'kJ') + '$.', 'A positive $E^\\circ$ gives a negative $\\Delta G^\\circ$: the reaction is favored.'], 'ΔG° = −nFE°, with n from the balanced equation.', 'kJ', { k: 'cdG', n: n, E0: E0, ans: dG0 });
    if (kind === 'Efrom') { var Gq = -R.int(4, 60) * 5, nn = R.pick([1, 2, 3, 4, 6]), Ev = -Gq * 1000 / (nn * C.F);
      return P('A redox reaction with $n = ' + nn + '$ has $\\Delta G^\\circ = ' + Gq + '\\ \\text{kJ}$. What is $E^\\circ_{\\text{cell}}$?', numT(Ev, 3, 0.005), ['$E^\\circ = -\\dfrac{\\Delta G^\\circ}{nF} = -\\dfrac{' + T.num(Gq * 1000) + '}{(' + nn + ')(96{,}485)} = ' + q(Ev, 'V') + '$.'], 'Rearrange ΔG° = −nFE°; keep ΔG° in joules.', 'V', { k: 'cE', n: nn, G: Gq, ans: Ev }); }
    var pk = R.pick([['Fe3', 'Ag'], ['Sn', 'Pb'], ['Ni', 'Sn'], ['Cd', 'Fe'], ['Pb', 'H2']]), e1 = rd(EC[pk[1]][0] - EC[pk[0]][0], 2), nK = pk[0] === 'Fe3' ? 1 : 2, Kv = M.exp(nK * C.F * e1 / (C.R * 298));
    return P('A redox reaction with $n = ' + nK + '$ has $E^\\circ_{\\text{cell}} = ' + ePot2(e1) + '\\ \\text{V}$ at 298 K. What is its equilibrium constant $K$? (Use a calculator.)', num(Kv, 3, 0.1), [
      'Combine $\\Delta G^\\circ = -nFE^\\circ$ with $\\Delta G^\\circ = -RT\\ln K$: $\\ln K = \\dfrac{nFE^\\circ}{RT}$.',
      '$\\ln K = \\dfrac{(' + nK + ')(96{,}485)(' + e1.toFixed(2) + ')}{(8.314)(298)} = ' + fx(M.log(Kv), 3) + '$, so $K = ' + fx(Kv, 3) + '$.',
      'Equivalently $\\log K = \\dfrac{nE^\\circ}{0.0592}$. ' + (e1 > 0 ? 'A positive $E^\\circ$ means $K > 1$.' : 'A negative $E^\\circ$ means $K < 1$.') + ' (Small differences in rounding change $K$ by a few percent.)'
    ], 'ln K = nFE°/RT.', null, { k: 'cK', n: nK, E0: e1, ans: Kv });
  });
  function ePot2(v) { return (v > 0 ? '+' : '') + v.toFixed(2); }

  G('gchem2.nernst', function (R, ctx) {
    var kind = lv(ctx, R.pick(['E', 'Q']), R.pick(['E', 'conc', 'Q']), R.pick(['E', 'unknown', 'conc']));
    if (kind === 'conc') { var n = R.pick([1, 2]), mtl = n === 1 ? 'Ag' : R.pick(['Cu', 'Zn', 'Ni']), ion = EC[mtl][2], c1 = R.pick([1.0, 0.50, 0.10]), c2 = c1 / R.pick([10, 100, 20, 1000]), E = 0.0592 / n * log10(c1 / c2);
      return P('A concentration cell has two $' + F(mtl) + '$ electrodes, one in $' + qv(c1, 'M') + '$ $' + F(ion) + '$ and one in $' + qv(c2, 'M') + '$ $' + F(ion) + '$. What is its voltage at 25 °C?', numT(E, 3, 0.002), [
        'Both half-cells have the same $E^\\circ$, so $E^\\circ_{\\text{cell}} = 0$. The voltage comes only from the concentration difference.',
        'Electrons flow so as to even out the concentrations: the dilute side is the anode (metal dissolves, making more ions) and the concentrated side is the cathode. $Q = \\dfrac{[\\text{dilute}]}{[\\text{concentrated}]}$.',
        '$E = 0 - \\dfrac{0.0592}{' + n + '}\\log\\dfrac{' + gv(c2) + '}{' + gv(c1) + '} = ' + q(E, 'V', 3) + '$.'
      ], 'E° = 0; Q = dilute/concentrated.', 'V', { k: 'ncc', n: n, c1: c1, c2: c2, ans: E }); }
    var pr = R.pick([['Zn', 'Cu'], ['Zn', 'Ag'], ['Ni', 'Cu'], ['Fe', 'Cu'], ['Zn', 'Ni'], ['Cd', 'Cu'], ['Mg', 'Cu'], ['Pb', 'Cu']]), an = pr[0], ca = pr[1], o = overall(an, ca), E0 = rd(EC[ca][0] - EC[an][0], 2), nn = o.n;
    var ca2 = R.pick([1.0, 0.50, 0.10, 0.010, 2.0, 0.0010]), cc2 = R.pick([1.0, 0.50, 0.10, 0.010, 2.0, 0.0010]);
    var Qv = M.pow(ca2, o.mA) / M.pow(cc2, o.mC), Ecell = E0 - 0.0592 / nn * log10(Qv);
    var Qtex = 'Q = \\dfrac{' + pw(cc(EC[an][2]), o.mA) + '}{' + pw(cc(EC[ca][2]), o.mC) + '} = \\dfrac{' + pw('(' + gv(ca2) + ')', o.mA) + '}{' + pw('(' + gv(cc2) + ')', o.mC) + '} = ' + fx(Qv, 3);
    var intro = 'For $' + EQ(o.eq) + '$ ($E^\\circ = ' + E0.toFixed(2) + '\\ \\text{V}$, $n = ' + nn + '$) at 25 °C, with $' + cc(EC[an][2]) + ' = ' + qv(ca2, 'M') + '$ and $' + cc(EC[ca][2]) + ' = ' + qv(cc2, 'M') + '$: ';
    if (kind === 'Q') return P(intro + 'what is $Q$?', num(Qv), ['Products over reactants, each to its coefficient; the solid metals are left out.', '$' + Qtex + '$.'], 'Write Q like K: products on top, solids left out.', null, { k: 'nQ', an: an, ca: ca, ca2: ca2, cc2: cc2, ans: Qv });
    if (kind === 'E') return P(intro + 'what is the cell voltage?', numT(Ecell, 3, 0.003), [
      '$' + Qtex + '$ (products on top; solids left out).',
      'Nernst: $E = E^\\circ - \\dfrac{0.0592}{n}\\log Q = ' + E0.toFixed(2) + ' - \\dfrac{0.0592}{' + nn + '}\\log(' + fx(Qv, 3) + ') = ' + fx(Ecell, 3) + '\\ \\text{V}$.',
      Qv < 1 ? '$Q < 1$ (more reactant ion), so the voltage is above $E^\\circ$.' : Qv > 1 ? '$Q > 1$, so the voltage is below $E^\\circ$; as the cell runs down, $Q$ grows and $E$ falls toward 0.' : '$Q = 1$, so $E = E^\\circ$.'
    ], 'E = E° − (0.0592/n) log Q, with Q = [product ion]/[reactant ion].', 'V', { k: 'nE', an: an, ca: ca, ca2: ca2, cc2: cc2, ans: Ecell });
    var EU = rd(Ecell, 3), Qu = M.pow(10, (E0 - EU) * nn / 0.0592), cu = M.pow(M.pow(ca2, o.mA) / Qu, 1 / o.mC);
    return P('For $' + EQ(o.eq) + '$ ($E^\\circ = ' + E0.toFixed(2) + '\\ \\text{V}$, $n = ' + nn + '$) at 25 °C, $' + cc(EC[an][2]) + ' = ' + qv(ca2, 'M') + '$ and the measured voltage is $' + EU.toFixed(3) + '\\ \\text{V}$. What is $' + cc(EC[ca][2]) + '$? (Use a calculator.)', num(cu, 3, 0.06), [
      'Solve the Nernst equation for $\\log Q$: $\\log Q = \\dfrac{n(E^\\circ - E)}{0.0592} = \\dfrac{' + nn + '(' + E0.toFixed(2) + ' - ' + EU.toFixed(3) + ')}{0.0592} = ' + fx(log10(Qu), 3) + '$, so $Q = ' + fx(Qu, 3) + '$.',
      '$Q = \\dfrac{' + pw(cc(EC[an][2]), o.mA) + '}{' + pw(cc(EC[ca][2]), o.mC) + '}$, so $' + pw(cc(EC[ca][2]), o.mC) + ' = \\dfrac{' + pw('(' + gv(ca2) + ')', o.mA) + '}{' + fx(Qu, 3) + '}$ and $' + cc(EC[ca][2]) + ' = ' + q(cu, 'M') + '$.',
      'This is how electrodes measure concentrations, such as a pH meter measuring $[\\mathrm{H_3O^+}]$.'
    ], 'Solve for Q first, then for the unknown concentration.', 'M', { k: 'nun', an: an, ca: ca, ca2: ca2, E: EU, ans: cu });
  });

  G('gchem2.electrolytic-cells', function (R, ctx) {
    var kind = lv(ctx, R.pick(['sign', 'molten', 'Vmin', 'tf', 'moving']), R.pick(['molten', 'Vmin', 'sign', 'tf', 'moving']), R.pick(['Vmin', 'water', 'molten', 'moving']));
    if (kind === 'moving') { var sm = R.pick([['NaCl', 'Na^+', 'Cl^-'], ['MgCl2', 'Mg^2+', 'Cl^-'], ['KBr', 'K^+', 'Br^-'], ['CaCl2', 'Ca^2+', 'Cl^-'], ['LiI', 'Li^+', 'I^-'], ['NaBr', 'Na^+', 'Br^-'], ['LiCl', 'Li^+', 'Cl^-'], ['KCl', 'K^+', 'Cl^-'], ['MgBr2', 'Mg^2+', 'Br^-'], ['BaCl2', 'Ba^2+', 'Cl^-'], ['KI', 'K^+', 'I^-'], ['CaBr2', 'Ca^2+', 'Br^-']]), toA = R.coin();
      return P('During electrolysis of molten $' + F(sm[0]) + '$, which ion moves toward the ' + (toA ? 'anode' : 'cathode') + '? Type its formula with its charge.', fml(toA ? sm[2] : sm[1]), ['In an electrolytic cell the anode is positive and the cathode negative, so anions drift to the anode and cations to the cathode.', 'The ' + (toA ? 'anion' : 'cation') + ' here is $' + F(toA ? sm[2] : sm[1]) + '$: it moves to the ' + (toA ? 'anode, where it is oxidized.' : 'cathode, where it is reduced.')], 'Opposite charges attract: which electrode is positive here?', null, { k: 'emove', ans: toA ? sm[2] : sm[1] }); }
    if (kind === 'tf') { var t = R.pick([['The anode is the negative electrode in every kind of cell.', false], ['Oxidation happens at the anode in both galvanic and electrolytic cells.', true], ['In an electrolytic cell, the cathode is connected to the negative terminal of the power supply.', true], ['An electrolytic cell turns chemical energy into electrical energy.', false], ['An electrolytic cell drives a reaction that is not thermodynamically favored.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['Anode = oxidation and cathode = reduction in every cell. What changes is the sign: in a galvanic cell the anode is negative (it pushes out electrons); in an electrolytic cell the power supply makes the anode positive.', 'An electrolytic cell uses electrical energy to force an unfavored reaction ($E^\\circ_{\\text{cell}} < 0$, $\\Delta G > 0$); a galvanic cell does the reverse.', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Separate the job of each electrode from its sign.', null, { k: 'etf', ans: t[1] }); }
    if (kind === 'sign') { var right = 'Positive: it is connected to the + terminal, and oxidation happens there';
      return P('In an electrolytic cell, what is the sign of the anode, and what happens there?', mc(right, ['Negative: oxidation happens there', 'Positive: reduction happens there', 'Negative: reduction happens there']), [
        'In every cell, oxidation happens at the anode and reduction at the cathode.',
        'In an electrolytic cell an outside power source pulls electrons out of the anode (it is wired to the + terminal) and pushes them into the cathode (the − terminal). So the anode is positive.',
        'In a galvanic cell the anode is negative instead, because there the oxidation itself pushes electrons out. The sign depends on the kind of cell; the job (oxidation) does not.'
      ], 'Oxidation is always at the anode; the power supply decides the sign.', null, { k: 'esign', ans: right }); }
    if (kind === 'molten') { var s = R.pick([['NaCl', 'Na', 'Cl2'], ['MgCl2', 'Mg', 'Cl2'], ['KBr', 'K', 'Br2'], ['CaCl2', 'Ca', 'Cl2'], ['LiI', 'Li', 'I2'], ['NaBr', 'Na', 'Br2'], ['LiCl', 'Li', 'Cl2'], ['KCl', 'K', 'Cl2'], ['NaI', 'Na', 'I2'], ['MgBr2', 'Mg', 'Br2'], ['CaBr2', 'Ca', 'Br2'], ['BaCl2', 'Ba', 'Cl2'], ['KI', 'K', 'I2'], ['LiBr', 'Li', 'Br2']]), cath = R.coin();
      return P('Molten $' + F(s[0]) + '$ is electrolyzed with inert electrodes. What forms at the ' + (cath ? 'cathode' : 'anode') + '? Type its formula.', fml(cath ? s[1] : s[2]), [
        'The melt holds only the metal cations and the halide anions. Cations move to the cathode and are reduced; anions move to the anode and are oxidized.',
        'Cathode: the metal, $' + F(s[1]) + '$. Anode: the halogen, $' + F(s[2]) + '$.'
      ], 'Cathode: reduction of the cation. Anode: oxidation of the anion.', null, { k: 'elmol', ans: cath ? s[1] : s[2] }); }
    if (kind === 'water') return P('What is the minimum voltage, under standard conditions, needed to split water into $\\mathrm{H_2}$ and $\\mathrm{O_2}$? Use $' + EQ('O2(g) + 4H^+(aq) + 4e^- -> 2H2O(l)') + '$, $E^\\circ = +1.23\\ \\text{V}$, and $' + EQ('2H^+(aq) + 2e^- -> H2(g)') + '$, $E^\\circ = 0.00\\ \\text{V}$.', numT(1.23, 3, 0.01), [
      'The reverse reaction, hydrogen and oxygen making water (as in a fuel cell), has $E^\\circ = 1.23 - 0.00 = 1.23\\ \\text{V}$.',
      'Splitting water is that reaction run backward, with $E^\\circ = -1.23\\ \\text{V}$, so the power source must supply at least 1.23 V. (In practice a bit more is needed to make it go at a useful rate.)'
    ], 'Find E° for the reverse (galvanic) reaction.', 'V', { k: 'ewater', ans: 1.23 });
    var pr = cellPair(R, ['Zn', 'Fe', 'Cd', 'Ni', 'Sn', 'Pb', 'Cu', 'Ag']), an = pr[0], ca = pr[1], E0 = rd(EC[ca][0] - EC[an][0], 2), ov = overall(an, ca);
    var rev = (ov.mC > 1 ? ov.mC : '') + EC[ca][3] + '(s) + ' + (ov.mA > 1 ? ov.mA : '') + EC[an][2] + '(aq) -> ' + (ov.mC > 1 ? ov.mC : '') + EC[ca][2] + '(aq) + ' + (ov.mA > 1 ? ov.mA : '') + EC[an][3] + '(s)';
    return P('To plate $' + F(an) + '$ metal by running $' + EQ(rev) + '$, what minimum voltage must an outside source supply under standard conditions?' + potTable([an, ca]), numT(E0, 3, 0.01), [
      'This is the reverse of the favored galvanic reaction, whose $E^\\circ = ' + ePot(ca) + ' - (' + ePot(an) + ') = ' + E0.toFixed(2) + '\\ \\text{V}$.',
      'Run backward, it has $E^\\circ = -' + E0.toFixed(2) + '\\ \\text{V}$: not favored. An outside source must push with more than $' + E0.toFixed(2) + '\\ \\text{V}$ to drive it.'
    ], 'The minimum voltage equals E° of the favored reverse reaction.', 'V', { k: 'evmin', an: an, ca: ca, ans: E0 });
  });

  G('gchem2.faraday', function (R, ctx) {
    var kind = lv(ctx, R.pick(['mass', 'mole']), R.pick(['mass', 'time', 'current']), R.pick(['time', 'gas', 'mass']));
    var mt = R.pick(['Cu', 'Ag', 'Ni', 'Zn', 'Cr', 'Au', 'Al']), Mm = EC[mt][5], n = EC[mt][1], I = R.pick([0.50, 1.50, 2.00, 2.50, 5.00, 10.0, 0.750]), tmin = R.pick([10, 15, 20, 30, 45, 60, 90]);
    var tS = tmin * 60, Q = I * tS, ne = Q / C.F, nm = ne / n, m = nm * Mm;
    var plate = '$' + EQ(EC[mt][2] + '(aq) + ' + (n > 1 ? n : '') + 'e^- -> ' + mt + '(s)') + '$: ' + n + ' mol of electrons per mol of $' + F(mt) + '$.';
    if (kind === 'mole') return P('A current of $' + qv(I, 'A', 3) + '$ flows for $' + tmin + '\\ \\text{min}$. How many moles of electrons pass through the circuit?', num(ne), ['Charge: $q = It = (' + gv(I, 3) + '\\ \\text{A})(' + cm(tS) + '\\ \\text{s}) = ' + cm(rd(Q, 1)) + '\\ \\text{C}$ (minutes changed to seconds).', 'Moles of electrons: $\\dfrac{' + cm(rd(Q, 1)) + '\\ \\text{C}}{96{,}485\\ \\text{C/mol}} = ' + q(ne, 'mol') + '$.'], 'q = It in seconds, then divide by F.', 'mol', { k: 'fmol', I: I, t: tS, ans: ne });
    if (kind === 'mass') return P('How many grams of $' + F(mt) + '$ ($' + Mm.toFixed(2) + '\\ \\text{g/mol}$) plate out from a solution of $' + F(EC[mt][2]) + '$ when $' + qv(I, 'A', 3) + '$ flows for $' + tmin + '\\ \\text{min}$?', num(m), [
      'Charge: $q = It = (' + gv(I, 3) + ')(' + cm(tS) + '\\ \\text{s}) = ' + cm(rd(Q, 1)) + '\\ \\text{C}$.', 'Moles of electrons: $' + cm(rd(Q, 1)) + ' / 96{,}485 = ' + fx(ne, 3) + '\\ \\text{mol}$.',
      plate + ' So $' + fx(ne, 3) + ' / ' + n + ' = ' + fx(nm, 3) + '\\ \\text{mol}$ of metal.', 'Mass: $' + fx(nm, 3) + ' \\times ' + Mm.toFixed(2) + ' = ' + q(m, 'g') + '$.'
    ], 'Charge → moles of electrons → moles of metal (divide by the ion\u2019s charge) → grams.', 'g', { k: 'fmass', mt: mt, I: I, t: tS, ans: m });
    var mg = sgf(m, 2);
    if (kind === 'time') { var tt = mg / Mm * n * C.F / I;
      return P('How long, in seconds, must a current of $' + qv(I, 'A', 3) + '$ run to plate $' + qv(mg, 'g') + '$ of $' + F(mt) + '$ ($' + Mm.toFixed(2) + '\\ \\text{g/mol}$) from a solution of $' + F(EC[mt][2]) + '$?', num(tt), [
        'Moles of metal: $' + gv(mg) + ' / ' + Mm.toFixed(2) + ' = ' + fx(mg / Mm, 3) + '\\ \\text{mol}$. ' + plate, 'Moles of electrons: $' + n + ' \\times ' + fx(mg / Mm, 3) + ' = ' + fx(mg / Mm * n, 3) + '\\ \\text{mol}$; charge $= ' + fx(mg / Mm * n, 3) + ' \\times 96{,}485 = ' + fx(mg / Mm * n * C.F, 4) + '\\ \\text{C}$.',
        '$t = \\dfrac{q}{I} = \\dfrac{' + fx(mg / Mm * n * C.F, 4) + '}{' + gv(I, 3) + '} = ' + q(tt, 's') + '$ (about ' + fx(tt / 60, 3) + ' min).'
      ], 'Grams → moles of metal → moles of electrons → coulombs → seconds.', 's', { k: 'ftime', mt: mt, m: mg, I: I, ans: tt }); }
    if (kind === 'current') { var II = mg / Mm * n * C.F / tS;
      return P('What current is needed to plate $' + qv(mg, 'g') + '$ of $' + F(mt) + '$ ($' + Mm.toFixed(2) + '\\ \\text{g/mol}$) from $' + F(EC[mt][2]) + '$ in $' + tmin + '\\ \\text{min}$?', num(II), [
        'Moles of electrons: $\\dfrac{' + gv(mg) + '}{' + Mm.toFixed(2) + '} \\times ' + n + ' = ' + fx(mg / Mm * n, 3) + '\\ \\text{mol}$; charge $= ' + fx(mg / Mm * n * C.F, 4) + '\\ \\text{C}$.', '$I = \\dfrac{q}{t} = \\dfrac{' + fx(mg / Mm * n * C.F, 4) + '\\ \\text{C}}{' + cm(tS) + '\\ \\text{s}} = ' + q(II, 'A') + '$.'
      ], 'Find the charge needed, then divide by the time in seconds.', 'A', { k: 'fcur', mt: mt, m: mg, t: tS, ans: II }); }
    var hh = R.pick([1.00, 2.00, 0.500, 1.50]), I2 = R.pick([5.00, 10.0, 2.00, 20.0]), q2 = I2 * hh * 3600, ne2 = q2 / C.F, nCl = ne2 / 2, V = nCl * 22.4;
    return P('Molten NaCl is electrolyzed with a current of $' + qv(I2, 'A', 3) + '$ for $' + qv(hh, 'h', 3) + '$. What volume of $\\mathrm{Cl_2}$ gas forms at the anode, measured at STP (0 °C, 1 atm, 22.4 L/mol)?', num(V), [
      'Charge: $(' + gv(I2, 3) + ')(' + gv(hh, 3) + ' \\times 3600\\ \\text{s}) = ' + cm(rd(q2, 0)) + '\\ \\text{C}$, or $' + fx(ne2, 3) + '\\ \\text{mol}$ of electrons.',
      'Anode: $' + EQ('2Cl^-(l) -> Cl2(g) + 2e^-') + '$, so $\\mathrm{Cl_2} = ' + fx(ne2, 3) + ' / 2 = ' + fx(nCl, 3) + '\\ \\text{mol}$.', 'Volume: $' + fx(nCl, 3) + ' \\times 22.4 = ' + q(V, 'L') + '$.'
    ], 'Two electrons for each Cl₂ molecule.', 'L', { k: 'fgas', I: I2, h: hh, ans: V });
  });

  G('gchem2.batteries-corrosion', function (R, ctx) {
    var kind = R.pick(['protect', 'cells', 'fuel', 'tf', 'rust', 'fuelE', 'series', 'protect']);
    if (kind === 'series') { var cell = R.pick([['an alkaline cell', 1.5, [3, 4.5, 6, 7.5, 9, 12]], ['a nickel–metal hydride cell', 1.2, [2.4, 3.6, 4.8, 7.2, 9.6]], ['a lithium-ion cell', 3.7, [7.4, 11.1, 14.8]]]), Vt = R.pick(cell[2]), nc = M.round(Vt / cell[1]);
      return P('One ' + cell[0].replace(/^an? /, '') + ' gives about ' + cell[1] + ' V. How many must be connected in series to make about ' + Vt + ' V?', int(nc), ['Cells in series add their voltages, because each one lifts the energy of every coulomb of charge by its own amount.', '$' + Vt + ' \\div ' + cell[1] + ' = ' + nc + '$ cells. (The voltage of one cell is set by its chemistry, not its size; a bigger cell lasts longer but gives the same voltage.)'], 'Voltages in series add.', null, { k: 'bser', ans: nc }); }
    if (kind === 'protect') { var good = R.pick(['Zn', 'Mg', 'Al']), bad = R.sample(['Cu', 'Sn', 'Pb', 'Ag', 'Ni', 'Au'], 3);
      return P('A buried steel pipe can be protected by wiring it to a block of another metal that corrodes instead (a sacrificial anode). Which metal works?' + potTable(['Fe'].concat([good]).concat(bad)), mc('$' + F(good) + '$', bad.map(function (b) { return '$' + F(b) + '$'; })), [
        'The protecting metal must be oxidized more easily than iron: its reduction potential must be more negative than iron\u2019s (' + ePot('Fe').replace('-', '−') + ' V).',
        '$' + F(good) + '$ (' + ePot(good).replace('-', '−') + ' V) qualifies, so it becomes the anode and dissolves while the iron is held as the cathode. The others would make iron the anode and speed up its corrosion.'
      ], 'Which metal is a stronger reducing agent than iron?', null, { k: 'bprot', ans: good }); }
    if (kind === 'cells') { var V = R.pick([6, 12, 24]);
      return P('One lead–acid cell makes about 2 V. How many cells are joined in series in a ' + V + '-V ' + (V === 6 ? 'lead–acid' : V === 12 ? 'car' : 'truck') + ' battery?', int(V / 2), ['Cells in series add their voltages.', '$' + V + '\\ \\text{V} \\div 2\\ \\text{V per cell} = ' + (V / 2) + '$ cells.'], 'Voltages in series add.', null, { k: 'bcells', ans: V / 2 }); }
    if (kind === 'fuel') return P('A hydrogen fuel cell combines $\\mathrm{H_2}$ and $\\mathrm{O_2}$. What is the only chemical product? Type its formula.', fml('H2O'), ['At the anode $' + EQ('H2(g) -> 2H^+(aq) + 2e^-') + '$; at the cathode $' + EQ('O2(g) + 4H^+(aq) + 4e^- -> 2H2O(l)') + '$.', 'Overall: $' + EQ('2H2(g) + O2(g) -> 2H2O(l)') + '$. Unlike a battery, a fuel cell is fed its reactants continuously.'], 'What do hydrogen and oxygen make?', null, { k: 'bfuel', ans: 'H2O' });
    if (kind === 'fuelE') return P('In a hydrogen–oxygen fuel cell, $' + EQ('O2(g) + 4H^+(aq) + 4e^- -> 2H2O(l)') + '$ has $E^\\circ = +1.23\\ \\text{V}$ and $' + EQ('2H^+(aq) + 2e^- -> H2(g)') + '$ has $E^\\circ = 0.00\\ \\text{V}$. What is the standard cell potential?', numT(1.23, 3, 0.01), ['Oxygen is reduced (cathode); hydrogen is oxidized (anode).', '$E^\\circ_{\\text{cell}} = 1.23 - 0.00 = 1.23\\ \\text{V}$. Real fuel cells deliver less, about 0.7 V, while current flows.'], 'Cathode minus anode.', 'V', { k: 'bfuelE', ans: 1.23 });
    if (kind === 'rust') { var right = 'Iron is oxidized, $\\mathrm{Fe \\to Fe^{2+} + 2e^-}$, while oxygen is reduced elsewhere on the surface';
      return P('When iron rusts in moist air, what happens?', mc(right, ['Oxygen is oxidized and iron is reduced', 'Iron simply dissolves in water with no electron transfer', 'Water is oxidized to oxygen at the iron surface']), ['Rusting is a galvanic cell on one piece of metal: one region acts as the anode, where $\\mathrm{Fe \\to Fe^{2+} + 2e^-}$, and another as the cathode, where oxygen takes the electrons: $' + EQ('O2(g) + 4H^+(aq) + 4e^- -> 2H2O(l)') + '$.', 'The $\\mathrm{Fe^{2+}}$ is later oxidized further to the iron(III) oxide we call rust. Water (with dissolved ions) carries the charge between the regions, which is why salt speeds rusting.'], 'Which element loses electrons?', null, { k: 'brust', ans: right }); }
    var t = R.pick([['A battery stores electrons, which flow out when it is connected.', false], ['A battery stores chemical reactants; connecting it lets them react and push electrons through the circuit.', true], ['A rechargeable battery is recharged by running its reaction backward as an electrolytic cell.', true], ['A zinc coating (galvanizing) protects iron only where the coating is unbroken.', false]]);
    return P('True or false: ' + t[0], tf(t[1]), ['A battery holds chemicals that would react spontaneously if they could; the cell design forces the electrons to go the long way, through your circuit. Nothing is "full of electrons": the battery stays electrically neutral.', 'Recharging runs the reaction backward with an outside voltage. Zinc on iron keeps protecting even when scratched, because zinc is more easily oxidized and serves as the anode.', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'What is actually stored in a battery?', null, { k: 'btf', ans: t[1] });
  });


  // ================================================================== Unit 7: Nuclear Chemistry in Depth
  var ELSYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am'];
  function zOf(sym) { return ELSYM.indexOf(sym); }
  // measured main decay modes (NNDC NuDat): b- beta minus; b+ positron emission or electron capture; a alpha
  var NUCL = [['H-3', 'b-'], ['C-14', 'b-'], ['P-32', 'b-'], ['Co-60', 'b-'], ['Sr-90', 'b-'], ['I-131', 'b-'], ['Cs-137', 'b-'], ['Na-24', 'b-'], ['Fe-59', 'b-'], ['Y-90', 'b-'], ['Au-198', 'b-'], ['Si-31', 'b-'],
    ['C-11', 'b+'], ['N-13', 'b+'], ['O-15', 'b+'], ['F-18', 'b+'], ['Na-22', 'b+'], ['Al-26', 'b+'], ['Mn-54', 'b+'], ['Co-57', 'b+'], ['Be-7', 'b+'], ['I-123', 'b+'], ['Tl-201', 'b+'],
    ['Po-210', 'a'], ['Rn-222', 'a'], ['Ra-226', 'a'], ['Th-232', 'a'], ['U-235', 'a'], ['U-238', 'a'], ['Pu-239', 'a'], ['Am-241', 'a'], ['Th-230', 'a'], ['Pu-238', 'a']];
  var MODE = { 'b-': 'Beta decay ($\\beta^-$): a neutron turns into a proton', 'b+': 'Positron emission or electron capture: a proton turns into a neutron', a: 'Alpha decay: the nucleus emits a helium-4 nucleus' };
  function nucParse(s) { var m = s.split('-'), Z = zOf(m[0]), A = +m[1]; return { s: m[0], Z: Z, A: A, N: A - Z }; }
  function nucTex(n) { return '{}^{' + n.A + '}_{' + n.Z + '}\\mathrm{' + n.s + '}'; }
  var BAND = { 1: [0, 1], 4: [5, 5], 6: [6, 7], 7: [7, 8], 8: [8, 10], 9: [10, 10], 11: [12, 12], 12: [12, 14], 13: [14, 14], 14: [14, 16], 15: [16, 16], 16: [16, 20], 24: [26, 30], 25: [30, 30], 26: [28, 32], 27: [32, 32], 30: [34, 40], 36: [42, 50], 38: [46, 50], 39: [50, 50], 53: [74, 74], 55: [78, 78], 79: [118, 118], 81: [122, 124] };

  G('gchem2.nuclear-stability', function (R, ctx) {
    var kind = lv(ctx, R.pick(['mode', 'n', 'nz']), R.pick(['mode', 'product', 'mode', 'nz']), R.pick(['mode', 'product', 'tf']));
    var e = R.pick(NUCL), n = nucParse(e[0]), md = e[1], ratio = n.N / n.Z;
    var band = BAND[n.Z], why;
    if (md === 'a') why = 'With $Z = ' + n.Z + '$, the nucleus is beyond bismuth ($Z = 83$): every such nucleus is unstable, and heavy ones usually shed protons and neutrons together by alpha decay.';
    else if (md === 'b-') why = 'Its $N/Z$ ratio, ' + fx(ratio, 3) + ', is above the band of stability for $Z = ' + n.Z + '$' + (band ? ' (the stable isotopes have $N$ from ' + band[0] + ' to ' + band[1] + ')' : '') + ': too many neutrons. Beta decay turns a neutron into a proton, lowering $N/Z$.';
    else why = 'Its $N/Z$ ratio, ' + fx(ratio, 3) + ', is below the band of stability for $Z = ' + n.Z + '$' + (band ? ' (the stable isotopes have $N$ from ' + band[0] + ' to ' + band[1] + ')' : '') + ': too few neutrons. Positron emission or electron capture turns a proton into a neutron, raising $N/Z$.';
    if (kind === 'n') return P('How many neutrons are in $' + nucTex(n) + '$?', int(n.N), ['Neutrons = mass number − atomic number: $N = A - Z = ' + n.A + ' - ' + n.Z + ' = ' + n.N + '$.'], 'N = A − Z.', null, { k: 'nn', nuc: e[0], ans: n.N });
    if (kind === 'nz') return P('What is the neutron-to-proton ratio, $N/Z$, of $' + nucTex(n) + '$?', num(ratio, 3, 0.01), ['$N = ' + n.A + ' - ' + n.Z + ' = ' + n.N + '$, so $N/Z = ' + n.N + '/' + n.Z + ' = ' + fx(ratio, 3) + '$.', 'Stable light nuclei have $N/Z \\approx 1$; the ratio of stable nuclei climbs to about 1.5 for the heaviest, because extra neutrons dilute the repulsion between protons.'], 'Count neutrons as A − Z.', null, { k: 'nz', nuc: e[0], ans: ratio });
    if (kind === 'tf') { var t = R.pick([['A nucleus with too few neutrons for its number of protons usually undergoes beta decay ($\\beta^-$).', false], ['A nucleus with too many neutrons for its number of protons usually undergoes beta decay ($\\beta^-$).', true], ['Every nucleus with more than 83 protons is radioactive.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['Beta decay turns a neutron into a proton, so it fixes a neutron excess. A neutron shortage is fixed the other way, by positron emission or electron capture, which turn a proton into a neutron.', 'Beyond bismuth ($Z = 83$) no nucleus is stable; most of the heavy ones alpha decay.', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Which change in N/Z does each decay make?', null, { k: 'nstf', ans: t[1] }); }
    if (kind === 'product') { var dz = md === 'b-' ? 1 : md === 'b+' ? -1 : -2, dA = md === 'a' ? -4 : 0, pZ = n.Z + dz, pA = n.A + dA, ps = ELSYM[pZ];
      return P('$' + nucTex(n) + '$ decays by ' + (md === 'b-' ? 'beta emission ($\\beta^-$)' : md === 'b+' ? 'positron emission or electron capture (both give the same product)' : 'alpha emission') + '. What element does it become? Type its symbol.', fml(ps), [
        md === 'b-' ? 'In $\\beta^-$ decay a neutron becomes a proton: $Z$ goes up by 1 and $A$ stays the same.' : md === 'b+' ? 'In positron emission or electron capture a proton becomes a neutron: $Z$ goes down by 1 and $A$ stays the same.' : 'An alpha particle carries away 2 protons and 2 neutrons: $Z$ goes down by 2 and $A$ by 4.',
        'Product: $Z = ' + pZ + '$, $A = ' + pA + '$: $' + nucTex({ s: ps, Z: pZ, A: pA }) + '$, an isotope of ' + ps + '.'
      ], 'Track how Z changes in this kind of decay.', null, { k: 'nprod', nuc: e[0], md: md, ans: ps }); }
    return P('Predict how $' + nucTex(n) + '$ decays.', mc(MODE[md], ['b-', 'b+', 'a'].filter(function (x) { return x !== md; }).map(function (x) { return MODE[x]; }).concat(['It does not decay: it is stable'])), [
      '$N = ' + n.A + ' - ' + n.Z + ' = ' + n.N + '$ neutrons and $Z = ' + n.Z + '$ protons.', why
    ], 'Compare N/Z with that of the stable isotopes of the same element; check whether Z is above 83.', null, { k: 'nmode', nuc: e[0], ans: md }, { name: 'ch-nuclide', opts: { mode: 'chart', nuc: e[0], quiet: true, edit: false } });
  });

  // atomic masses (u), 2020 Atomic Mass Evaluation (via NNDC)
  var MASS = { 'H-2': 2.014102, 'He-3': 3.016029, 'He-4': 4.002603, 'Li-7': 7.016003, 'Be-9': 9.012183, 'B-11': 11.009305, 'C-12': 12.000000, 'N-14': 14.003074, 'O-16': 15.994915, 'F-19': 18.998403, 'Ne-20': 19.992440,
    'Na-23': 22.989770, 'Mg-24': 23.985042, 'Al-27': 26.981538, 'Si-28': 27.976927, 'S-32': 31.972071, 'Cl-35': 34.968853, 'Ca-40': 39.962591, 'Fe-56': 55.934936, 'Ni-62': 61.928345, 'Cu-63': 62.929598, 'Ag-107': 106.905092, 'Au-197': 196.966570, 'Pb-208': 207.976652, 'U-235': 235.043928, 'U-238': 238.050788 };
  var mH = 1.007825, mN = 1.008665;
  G('gchem2.binding-energy', function (R, ctx) {
    var kind = lv(ctx, R.pick(['defect', 'BE']), R.pick(['BE', 'BEn', 'J']), R.pick(['BEn', 'kJ', 'compare', 'tf']));
    var keys = Object.keys(MASS), nk = R.pick(lv(ctx, keys.filter(function (k) { return nucParse(k).A <= 40; }), keys, keys)), n = nucParse(nk), m = MASS[nk];
    var parts = n.Z * mH + n.N * mN, dm = parts - m, BE = dm * 931.5, BEn = BE / n.A;
    var st = ['Separate parts: $' + n.Z + '$ hydrogen-1 atom' + (n.Z > 1 ? 's' : '') + ' (each a proton plus an electron, $1.007825\\ \\text{u}$) and $' + n.N + '$ neutron' + (n.N > 1 ? 's' : '') + ' ($1.008665\\ \\text{u}$). Using H atoms keeps the electrons counted on both sides.',
      'Parts: $' + n.Z + '(1.007825) + ' + n.N + '(1.008665) = ' + parts.toFixed(6) + '\\ \\text{u}$. The atom: $' + m.toFixed(6) + '\\ \\text{u}$.',
      'Mass defect: $\\Delta m = ' + parts.toFixed(6) + ' - ' + m.toFixed(6) + ' = ' + dm.toFixed(6) + '\\ \\text{u}$. The nucleus weighs less than its parts.'];
    var intro = 'The atomic mass of $' + nucTex(n) + '$ is $' + m.toFixed(6) + '\\ \\text{u}$. (Use $m(^1\\mathrm{H}) = 1.007825\\ \\text{u}$, $m_n = 1.008665\\ \\text{u}$, and $1\\ \\text{u} = 931.5\\ \\text{MeV}$.) ';
    if (kind === 'tf') { var t = R.pick([['A nucleus has more mass than the separate protons and neutrons it is made of.', false], ['Energy must be added to split a nucleus into its separate protons and neutrons.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['When nucleons come together, the strong force pulls them into a lower-energy arrangement and energy is released. By $E = mc^2$, the bound nucleus has less mass than the free parts: the mass defect.', 'To pull the nucleus apart again you must put that binding energy back in. So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Bound systems have less energy, and so less mass, than their free parts.', null, { k: 'betf', ans: t[1] }); }
    if (kind === 'compare') { var two = R.sample(keys.filter(function (k) { return nucParse(k).A >= 12; }), 2), be = two.map(function (k) { var x = nucParse(k); return ((x.Z * mH + x.N * mN - MASS[k]) * 931.5) / x.A; }), w = be[0] > be[1] ? two[0] : two[1];
      return P('Using binding energy per nucleon, which nucleus is more tightly bound: $' + nucTex(nucParse(two[0])) + '$ (' + MASS[two[0]].toFixed(6) + ' u) or $' + nucTex(nucParse(two[1])) + '$ (' + MASS[two[1]].toFixed(6) + ' u)? (Use a calculator.)', mc('$' + nucTex(nucParse(w)) + '$', ['$' + nucTex(nucParse(w === two[0] ? two[1] : two[0])) + '$']), [
        'Binding energy per nucleon: $' + nucTex(nucParse(two[0])) + '$: ' + fx(be[0], 3) + ' MeV; $' + nucTex(nucParse(two[1])) + '$: ' + fx(be[1], 3) + ' MeV.',
        'The larger value is more tightly bound. The curve peaks near iron and nickel ($A \\approx 56$–62), which is why fusing light nuclei and splitting heavy ones both release energy.'
      ], 'Divide each binding energy by its mass number.', null, { k: 'becomp', a: two[0], b: two[1], ans: w }); }
    if (kind === 'defect') return P(intro + 'What is its mass defect?', num(dm, 3, 0.01), st, 'Add up the masses of the parts, then subtract the atom\u2019s mass.', 'u', { k: 'bedm', nuc: nk, ans: dm });
    if (kind === 'BE') return P(intro + 'What is its total binding energy in MeV?', num(BE, 3, 0.02), st.concat(['$E = (' + dm.toFixed(6) + '\\ \\text{u})(931.5\\ \\text{MeV/u}) = ' + q(BE, 'MeV') + '$.']), 'Mass defect × 931.5 MeV per u.', 'MeV', { k: 'be', nuc: nk, ans: BE });
    if (kind === 'BEn') return P(intro + 'What is its binding energy per nucleon, in MeV?', num(BEn, 3, 0.02), st.concat(['Binding energy: $' + dm.toFixed(6) + ' \\times 931.5 = ' + fx(BE, 4) + '\\ \\text{MeV}$.', 'Per nucleon: $\\dfrac{' + fx(BE, 4) + '}{' + n.A + '} = ' + q(BEn, 'MeV') + '$ per nucleon.']), 'Total binding energy divided by the mass number A.', 'MeV', { k: 'ben', nuc: nk, ans: BEn });
    var kg = dm * 1.6605e-27, J = kg * 9.00e16;
    if (kind === 'J') return P(intro + 'Using $E = mc^2$ with $c = 3.00 \\times 10^8\\ \\text{m/s}$ and $1\\ \\text{u} = 1.6605 \\times 10^{-27}\\ \\text{kg}$, what is its binding energy in joules per nucleus?', num(J, 3, 0.02), st.concat(['In kilograms: $' + dm.toFixed(6) + ' \\times 1.6605 \\times 10^{-27} = ' + fx(kg, 4) + '\\ \\text{kg}$.', '$E = mc^2 = (' + fx(kg, 4) + ')(3.00 \\times 10^8)^2 = ' + q(J, 'J') + '$.']), 'Change u to kg before using E = mc².', 'J', { k: 'beJ', nuc: nk, ans: J });
    var kJ = J * C.NA / 1000;
    return P(intro + 'Using $E = mc^2$ ($c = 3.00 \\times 10^8\\ \\text{m/s}$, $1\\ \\text{u} = 1.6605 \\times 10^{-27}\\ \\text{kg}$), what is the binding energy for one mole of these nuclei, in kJ/mol? (Use a calculator.)', num(kJ, 3, 0.02), st.concat(['Per nucleus: $E = (' + fx(kg, 4) + '\\ \\text{kg})(3.00 \\times 10^8)^2 = ' + fx(J, 4) + '\\ \\text{J}$.', 'Per mole: $' + fx(J, 4) + ' \\times 6.022 \\times 10^{23} = ' + fx(J * C.NA, 3) + '\\ \\text{J/mol} = ' + q(kJ, 'kJ/mol') + '$, about a million times a typical bond energy.']), 'Per nucleus in J, then times Avogadro\u2019s number.', 'kJ/mol', { k: 'bekJ', nuc: nk, ans: kJ });
  });

  var ISO = [['carbon-14', 5700, 'years'], ['tritium (hydrogen-3)', 12.32, 'years'], ['iodine-131', 8.02, 'days'], ['cobalt-60', 5.27, 'years'], ['strontium-90', 28.8, 'years'], ['cesium-137', 30.1, 'years'], ['phosphorus-32', 14.3, 'days'], ['technetium-99m', 6.01, 'h'], ['fluorine-18', 110, 'min'], ['radon-222', 3.82, 'days']];
  G('gchem2.decay-kinetics', function (R, ctx) {
    var kind = lv(ctx, R.pick(['k', 'frac']), R.pick(['frac', 'time', 'k', 'tf']), R.pick(['time', 'date', 'activity', 'frac']));
    var I = R.pick(ISO), th = I[1], u = I[2], k = M.LN2 / th, uk = u === 'years' ? 'yr⁻¹' : u === 'days' ? 'd⁻¹' : u === 'h' ? 'h⁻¹' : 'min⁻¹', ukT = { years: '\\text{yr}^{-1}', days: '\\text{d}^{-1}', h: '\\text{h}^{-1}', min: '\\text{min}^{-1}' }[u], uT = '\\text{' + u + '}';
    var intro = 'The half-life of ' + I[0] + ' is $' + gv(th) + '\\ ' + uT + '$. ';
    if (kind === 'k') return P(intro + 'What is its decay constant $k$?', num(k), ['Radioactive decay is first order, so $t_{1/2} = \\dfrac{\\ln 2}{k}$.', '$k = \\dfrac{0.693}{' + gv(th) + '\\ ' + uT + '} = ' + fx(k, 3) + '\\ ' + ukT + '$.'], 'k = 0.693/t½.', uk, { k: 'dk', th: th, ans: k });
    if (kind === 'tf') { var t = R.pick([['As a radioactive sample shrinks, its half-life gets shorter.', false], ['Each nucleus has the same chance of decaying in the next second, whatever happened before.', true], ['After two half-lives, a quarter of the original nuclei remain.', true]]);
      return P('True or false: ' + t[0], tf(t[1]), ['A nucleus carries no timer: every nucleus has the same fixed chance per unit time of decaying. So the rate is proportional to how many nuclei are left: rate $= kN$, first order.', 'That makes the half-life a constant. The amount left after each half-life is half of what was there before: $\\tfrac{1}{2}$, $\\tfrac{1}{4}$, $\\tfrac{1}{8}$, …', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'What does first order imply about the half-life?', null, { k: 'dtf', ans: t[1] }); }
    if (kind === 'frac') { var t1 = sgf(th * R.pick([0.4, 0.7, 1.3, 1.6, 2.4, 3.3, 0.25]), 2), fr = M.exp(-k * t1);
      return P(intro + 'What percent of a sample is left after $' + gv(t1) + '\\ ' + uT + '$? (Use a calculator.)', { t: 'num', v: sfStr(fr * 100, 3), rtol: 0.02, pct: true }, [
        '$\\dfrac{N}{N_0} = e^{-kt}$ with $k = \\dfrac{0.693}{' + gv(th) + '} = ' + fx(k, 3) + '\\ ' + ukT + '$. (Or use $\\left(\\tfrac{1}{2}\\right)^{t/t_{1/2}}$; it is the same thing.)',
        '$kt = ' + fx(k * t1, 3) + '$, so $e^{-' + fx(k * t1, 3) + '} = ' + fx(fr, 3) + '$: $' + fx(fr * 100, 3) + '\\%$ is left.', 'This works for any time, not just whole numbers of half-lives.'
      ], 'N/N₀ = e^(−kt), with k = 0.693/t½.', '%', { k: 'dfrac', th: th, t: t1, ans: fr * 100 }); }
    if (kind === 'time') { var pct = R.pick([90, 75, 60, 40, 30, 20, 10, 5]), tt = M.log(100 / pct) / k;
      return P(intro + 'How long does it take for a sample to fall to $' + pct + '\\%$ of its starting activity? (Use a calculator.)', num(tt), ['Activity is proportional to the number of nuclei, so $\\dfrac{N}{N_0} = ' + T.num(pct / 100) + '$.', '$t = \\dfrac{1}{k}\\ln\\dfrac{N_0}{N} = \\dfrac{t_{1/2}}{0.693}\\ln\\dfrac{100}{' + pct + '} = \\dfrac{' + gv(th) + '}{0.693}(' + fx(M.log(100 / pct), 3) + ') = ' + fx(tt, 3) + '\\ ' + uT + '$.'], 'Solve ln(N₀/N) = kt for t.', u, { k: 'dtime', th: th, pct: pct, ans: tt }); }
    if (kind === 'date') { var r = R.pick([0.82, 0.65, 0.50, 0.40, 0.31, 0.22, 0.12]), age = M.log(1 / r) / (M.LN2 / 5700);
      return P('A piece of wood from an ancient site has $' + T.num(r * 100) + '\\%$ of the carbon-14 per gram found in living wood. Using a half-life of $5{,}700$ years, about how old is it? (Use a calculator.)', num(age, 3, 0.02), [
        'Living things keep their carbon-14 level steady by exchanging carbon with the air; after death the carbon-14 decays without being replaced.',
        '$k = \\dfrac{0.693}{5700\\ \\text{yr}} = ' + fx(M.LN2 / 5700, 3) + '\\ \\text{yr}^{-1}$; $t = \\dfrac{\\ln(1/' + T.num(r) + ')}{k} = \\dfrac{' + fx(M.log(1 / r), 3) + '}{' + fx(M.LN2 / 5700, 3) + '} = ' + fx(age, 3) + '\\ \\text{years}$.',
        '(Older books use 5,730 years; the measured value is about 5,700. Real radiocarbon dates are also corrected with calibration curves.)'
      ], 'Find k from the half-life, then t = ln(N₀/N)/k.', 'years', { k: 'ddate', r: r, ans: age }); }
    var I2 = R.pick([['iodine-131', 8.02 * 86400, '8.02 days'], ['phosphorus-32', 14.3 * 86400, '14.3 days'], ['fluorine-18', 110 * 60, '110 min'], ['technetium-99m', 6.01 * 3600, '6.01 h']]), N = R.pick([1.0e15, 5.0e14, 2.0e16, 3.0e13]), ks = M.LN2 / I2[1], A = ks * N;
    return P('A sample holds $' + gv(N) + '$ atoms of ' + I2[0] + ' (half-life ' + I2[2] + '). What is its activity, in decays per second (becquerels)? (Use a calculator.)', num(A, 3, 0.02), [
      'Activity $= kN$, with $k$ in $\\text{s}^{-1}$ to get decays per second.',
      'Half-life in seconds: $' + cm(I2[1]) + '\\ \\text{s}$, so $k = \\dfrac{0.693}{' + cm(I2[1]) + '} = ' + fx(ks, 3) + '\\ \\text{s}^{-1}$.',
      'Activity $= (' + fx(ks, 3) + ')(' + gv(N) + ') = ' + fx(A, 3) + '\\ \\text{Bq}$.'
    ], 'Activity = kN, with k in s⁻¹.', 'Bq', { k: 'dact', th: I2[1], N: N, ans: A });
  });


  // ================================================================== Unit 8: Coordination Compounds
  // ligands: formula as written inside the bracket, charge, donor atoms (denticity), name (current IUPAC), older name
  var LIG = {
    NH3: ['NH3', 0, 1, 'ammine', 'ammine'], H2O: ['H2O', 0, 1, 'aqua', 'aqua'], CO: ['CO', 0, 1, 'carbonyl', 'carbonyl'], en: ['en', 0, 2, 'ethylenediamine', 'ethylenediamine'],
    Cl: ['Cl', -1, 1, 'chlorido', 'chloro'], Br: ['Br', -1, 1, 'bromido', 'bromo'], F: ['F', -1, 1, 'fluorido', 'fluoro'], CN: ['CN', -1, 1, 'cyanido', 'cyano'], OH: ['OH', -1, 1, 'hydroxido', 'hydroxo'], ox: ['C2O4', -2, 2, 'oxalato', 'oxalato']
  };
  var METAL = { Co: ['cobalt', 'cobaltate', 9], Fe: ['iron', 'ferrate', 8], Cu: ['copper', 'cuprate', 11], Pt: ['platinum', 'platinate', 10], Cr: ['chromium', 'chromate', 6], Ni: ['nickel', 'nickelate', 10], Ag: ['silver', 'argentate', 11], Zn: ['zinc', 'zincate', 12], Al: ['aluminum', 'aluminate', 3], Mn: ['manganese', 'manganate', 7] };
  var COUNTER = { Cl: ['Cl', -1, 'chloride'], NO3: ['NO3', -1, 'nitrate'], SO4: ['SO4', -2, 'sulfate'], Br: ['Br', -1, 'bromide'], K: ['K', 1, 'potassium'], Na: ['Na', 1, 'sodium'] };
  // compounds: metal, ligands [[key, count]], counter ion key (or null)
  var CPX = [['Co', [['NH3', 6]], 'Cl'], ['Co', [['NH3', 5], ['Cl', 1]], 'Cl'], ['Co', [['NH3', 4], ['Cl', 2]], 'Cl'], ['Fe', [['CN', 6]], 'K'], ['Fe', [['CN', 6]], 'K', 3], ['Cu', [['NH3', 4]], 'SO4'],
    ['Pt', [['NH3', 2], ['Cl', 2]], null], ['Cr', [['H2O', 6]], 'Cl'], ['Ni', [['en', 3]], 'Cl'], ['Pt', [['Cl', 4]], 'K'], ['Fe', [['ox', 3]], 'K'], ['Ag', [['NH3', 2]], 'NO3'], ['Al', [['OH', 4]], 'Na'],
    ['Fe', [['H2O', 6]], 'NO3'], ['Co', [['en', 2], ['Cl', 2]], 'Cl'], ['Ni', [['CN', 4]], 'K'], ['Zn', [['NH3', 4]], 'Cl'], ['Cr', [['H2O', 4], ['Cl', 2]], 'Cl'], ['Co', [['NH3', 5], ['H2O', 1]], 'Cl'], ['Co', [['CN', 6]], 'K'],
    ['Cr', [['NH3', 3], ['Cl', 3]], null], ['Fe', [['CO', 5]], null], ['Cu', [['Cl', 4]], 'K'], ['Pt', [['NH3', 4]], 'Cl'], ['Mn', [['CN', 6]], 'K']];
  // the metal's oxidation state follows from charge balance; for K4[Fe(CN)6] vs K3[Fe(CN)6] an explicit charge is given as cpx[3]
  function cpxInfo(c) {
    var ligQ = 0, cn = 0; c[1].forEach(function (l) { ligQ += LIG[l[0]][1] * l[1]; cn += LIG[l[0]][2] * l[1]; });
    var ctr = c[2] ? COUNTER[c[2]] : null, ox, charge, nCtr = 0;
    if (c[0] === 'Fe' && c[2] === 'K' && c[1][0][0] === 'CN') { ox = c[3] === 3 ? 3 : 2; }
    else if (!ctr) ox = -ligQ;
    else ox = { Co: 3, Cu: 2, Pt: 2, Cr: 3, Ni: 2, Fe: c[1][0][0] === 'CO' ? 0 : 3, Ag: 1, Al: 3, Zn: 2, Mn: 3 }[c[0]];
    charge = ox + ligQ;
    if (ctr) nCtr = M.abs(charge / ctr[1]);
    return { ox: ox, cn: cn, charge: charge, ctr: ctr, nCtr: nCtr, ions: ctr ? nCtr + 1 : 0 };
  }
  function ligStr(c, alt) { // formula inside the brackets: neutral ligands first (as most textbooks write), or anionic first
    var ls = c[1].slice(); if (alt) ls.reverse();
    return ls.map(function (l) { var L = LIG[l[0]], f = L[0]; var multi = !/^[A-Z][a-z]?$/.test(f); return (multi ? '(' + f + ')' : f) + (l[1] > 1 ? l[1] : ''); }).join('');
  }
  function cpxFormula(c, alt) { var I = cpxInfo(c), core = '[' + c[0] + ligStr(c, alt) + ']'; if (!I.ctr) return core; var cf = I.ctr[0], k = I.nCtr, cs = (cf.length > 2 || cf === 'SO4' || cf === 'NO3' ? (k > 1 ? '(' + cf + ')' + k : cf) : cf + (k > 1 ? k : ''));
    if (cf === 'SO4' && k === 1) cs = 'SO4';
    return I.ctr[1] > 0 ? cs + core : core + cs; }
  function cpxTex(c) { return F(cpxFormula(c)); }
  var ROM = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'], GPRE = ['', '', 'di', 'tri', 'tetra', 'penta', 'hexa'], GPRE2 = ['', '', 'bis', 'tris', 'tetrakis'];
  function cpxNames(c) { // every acceptable name (current and older ligand names; with or without a space before the numeral)
    var I = cpxInfo(c), ls = c[1].slice().sort(function (a, b) { return LIG[a[0]][3] < LIG[b[0]][3] ? -1 : 1; }), out = [];
    [3, 4].forEach(function (col) {
      var lig = ls.map(function (l) { var nm = LIG[l[0]][col]; return l[0] === 'en' ? (l[1] > 1 ? GPRE2[l[1]] + '(' + nm + ')' : nm) : GPRE[l[1]] + nm; }).join('');
      var metal = I.charge < 0 ? METAL[c[0]][1] : METAL[c[0]][0], core = lig + metal;
      [core + '(' + ROM[I.ox] + ')', core + ' (' + ROM[I.ox] + ')'].forEach(function (cx) { var full = !I.ctr ? cx : I.ctr[1] > 0 ? I.ctr[2] + ' ' + cx : cx + ' ' + I.ctr[2]; if (out.indexOf(full) < 0) out.push(full); });
    });
    return out;
  }

  G('gchem2.coordination-compounds', function (R, ctx) {
    var kind = lv(ctx, R.pick(['cn', 'ox']), R.pick(['ox', 'cn', 'charge', 'ions']), R.pick(['ox', 'ions', 'charge', 'cnden']));
    var c = R.pick(kind === 'cnden' ? CPX.filter(function (x) { return x[1].some(function (l) { return LIG[l[0]][2] > 1; }); }) : CPX), I = cpxInfo(c), f = cpxTex(c);
    var ligList = c[1].map(function (l) { var L = LIG[l[0]]; return l[1] + ' $' + (l[0] === 'en' ? '\\text{en}' : F(L[0] + (L[1] ? '^' + (L[1] === -1 ? '-' : '2-') : ''))) + '$ (' + (L[1] ? 'charge ' + L[1] : 'neutral') + (L[2] > 1 ? ', ' + L[2] + ' donor atoms each' : '') + ')'; });
    var enNote = c[1].some(function (l) { return l[0] === 'en'; }) ? ' (en is ethylenediamine, $\\mathrm{H_2NCH_2CH_2NH_2}$, a neutral ligand that binds through both N atoms.)' : c[1].some(function (l) { return l[0] === 'ox'; }) ? ' (Oxalate, $\\mathrm{C_2O_4^{2-}}$, binds through two O atoms.)' : '';
    var ctrStep = I.ctr ? 'The counter ions, ' + I.nCtr + ' $' + F(I.ctr[0] + (I.ctr[1] > 0 ? '^+' : I.ctr[1] === -1 ? '^-' : '^2-')) + '$, carry a total charge of $' + (I.ctr[1] * I.nCtr > 0 ? '+' : '') + (I.ctr[1] * I.nCtr) + '$, so the complex ion inside the brackets has charge $' + (I.charge > 0 ? '+' : '') + I.charge + '$.' : 'There are no counter ions, so the complex is neutral: charge 0.';
    var oxStep = 'Ligands: ' + U.list(ligList) + ', total ligand charge $' + c[1].reduce(function (s2, l) { return s2 + LIG[l[0]][1] * l[1]; }, 0) + '$. Metal + ligands = complex: $x + (' + c[1].reduce(function (s2, l) { return s2 + LIG[l[0]][1] * l[1]; }, 0) + ') = ' + I.charge + '$, so $x = ' + (I.ox > 0 ? '+' : '') + I.ox + '$.';
    if (kind === 'cn' || kind === 'cnden') return P('What is the coordination number of the metal in $' + f + '$?' + enNote, int(I.cn), ['The coordination number counts the donor atoms bonded to the metal, not the ligands and not every atom in them.', 'Here: ' + c[1].map(function (l) { return l[1] + ' × ' + LIG[l[0]][2]; }).join(' + ') + ' = ' + I.cn + '.'], 'Count bonds to the metal: one per donor atom.', null, { k: 'ccn', f: cpxFormula(c), c: CPX.indexOf(c), ans: I.cn });
    if (kind === 'charge') return P('What is the charge of the complex ion (the part in square brackets) in $' + f + '$?' + enNote, exact(I.charge), [ctrStep], 'The whole compound is neutral; the counter ions balance the complex.', null, { k: 'cch', f: cpxFormula(c), c: CPX.indexOf(c), ans: I.charge });
    if (kind === 'ions') return P('When $' + f + '$ dissolves, how many ions does each formula unit release?' + enNote, int(I.ions), [I.ctr ? 'The ligands stay bound to the metal; only the counter ions outside the brackets separate. ' + ctrStep : 'There are no counter ions: the neutral complex dissolves as one molecule and gives no ions.', (I.ctr ? 'Ions per formula unit: 1 complex ion + ' + I.nCtr + ' counter ion' + (I.nCtr > 1 ? 's' : '') + ' = ' + I.ions + '.' : 'Ions per formula unit: 0. The complex stays together as one neutral molecule.'), 'Werner used exactly this kind of count, from electrical conductivity, to show which groups were bound to cobalt.'], 'Only what is outside the brackets comes apart.', null, { k: 'cions', f: cpxFormula(c), c: CPX.indexOf(c), ans: I.ions });
    return P('What is the oxidation state of the metal in $' + f + '$?' + enNote, exact(I.ox), [ctrStep, oxStep], 'Ligand charges plus the metal\u2019s charge must equal the charge of the complex ion.', null, { k: 'cox', f: cpxFormula(c), c: CPX.indexOf(c), ans: I.ox });
  });

  G('gchem2.naming-coordination', function (R, ctx) {
    var kind = lv(ctx, R.pick(['pick', 'name']), R.pick(['name', 'formula', 'pick']), R.pick(['name', 'formula', 'pick']));
    var pool = CPX.filter(function (c) { return ['Zn', 'Ag', 'Al'].indexOf(c[0]) < 0; }), c = R.pick(pool), I = cpxInfo(c), names = cpxNames(c), f = cpxTex(c);
    var sorted = c[1].slice().sort(function (a, b) { return LIG[a[0]][3] < LIG[b[0]][3] ? -1 : 1; });
    var st = ['Name the ' + (I.charge > 0 ? 'cation first (the complex), then the anion' : I.charge < 0 ? 'cation first, then the complex anion' : 'neutral complex as one word') + '.',
      'Ligands in alphabetical order of their names, ignoring number prefixes: ' + sorted.map(function (l) { return (l[0] === 'en' && l[1] > 1 ? GPRE2[l[1]] + '(' + LIG[l[0]][3] + ')' : GPRE[l[1]] + LIG[l[0]][3]); }).join(', ') + '.',
      'Metal: ' + (I.charge < 0 ? 'the complex is an anion, so the metal takes the -ate ending: ' + METAL[c[0]][1] : METAL[c[0]][0]) + ', with its oxidation state in Roman numerals: (' + ROM[I.ox] + ').',
      'Name: ' + names[0] + ' (older books write "' + names[names.length > 2 ? 2 : 0] + '").'];
    if (kind === 'name') return P('Name $' + f + '$.' + (c[1].some(function (l) { return l[0] === 'en'; }) ? ' (en = ethylenediamine)' : ''), txt(names), st, 'Ligands alphabetically (ignore di-, tri-), then the metal and its oxidation state; -ate for an anion.', null, { k: 'cname', f: cpxFormula(c), c: CPX.indexOf(c), ans: names[0] });
    if (kind === 'formula') { var vs = [cpxFormula(c), cpxFormula(c, true)].filter(function (x, i, a) { return a.indexOf(x) === i; });
      if (c[1].some(function (l) { return l[0] === 'en'; })) { c = pool.filter(function (x) { return !x[1].some(function (l) { return l[0] === 'en'; }); })[R.int(0, 10)]; I = cpxInfo(c); names = cpxNames(c); vs = [cpxFormula(c), cpxFormula(c, true)].filter(function (x, i, a) { return a.indexOf(x) === i; }); }
      return P('Write the formula of ' + names[0] + '.', fml(vs), ['Decode the name: ' + c[1].map(function (l) { return GPRE[l[1]] + LIG[l[0]][3] + ' = ' + l[1] + ' $' + F(LIG[l[0]][0]) + '$'; }).join('; ') + '; metal ' + c[0] + ' in the +' + I.ox + ' state' + (I.ox === 0 ? ' (0)' : '') + '.', 'Charge of the complex: $' + I.ox + ' + (' + c[1].reduce(function (s2, l) { return s2 + LIG[l[0]][1] * l[1]; }, 0) + ') = ' + I.charge + '$' + (I.ctr ? ', balanced by ' + I.nCtr + ' ' + I.ctr[2] + ' ion' + (I.nCtr > 1 ? 's' : '') : '') + '.', 'Formula: $' + cpxTex(c) + '$, with the complex in square brackets.'], 'Work out the complex\u2019s charge, then add counter ions to balance it.', null, { k: 'cform', f: cpxFormula(c), c: CPX.indexOf(c), ans: vs[0] }); }
    var wrong = [], core = names[0];
    var unsorted = c[1].slice().sort(function (a, b) { return (GPRE[a[1]] + LIG[a[0]][3]) < (GPRE[b[1]] + LIG[b[0]][3]) ? -1 : 1; });
    function build(ls, ateOff, oxv) { var lig = ls.map(function (l) { var nm = LIG[l[0]][3]; return l[0] === 'en' ? (l[1] > 1 ? GPRE2[l[1]] + '(' + nm + ')' : nm) : GPRE[l[1]] + nm; }).join(''); var metal = I.charge < 0 && !ateOff ? METAL[c[0]][1] : METAL[c[0]][0], cx = lig + metal + '(' + ROM[oxv] + ')'; return !I.ctr ? cx : I.ctr[1] > 0 ? I.ctr[2] + ' ' + cx : cx + ' ' + I.ctr[2]; }
    if (c[1].length > 1) wrong.push(build(unsorted.join() === sorted.join() ? sorted.slice().reverse() : unsorted, false, I.ox));
    if (I.charge < 0) wrong.push(build(sorted, true, I.ox));
    wrong.push(build(sorted, false, M.max(0, I.ox + (I.ox >= 2 ? -1 : 1))));
    wrong.push(build(sorted, false, I.ox === 3 ? 2 : 3));
    if (I.charge >= 0) wrong.push(build(sorted, false, I.ox).replace(METAL[c[0]][0] + '(', METAL[c[0]][1] + '('));
    return P('Which is the correct name of $' + f + '$?', mc(core, wrong.filter(function (w) { return names.indexOf(w) < 0; })), st, 'Check the ligand order, the -ate ending and the oxidation state.', null, { k: 'cpick', f: cpxFormula(c), c: CPX.indexOf(c), ans: core });
  });

  // isomer counts: [description TeX, geometry, ligand pattern, geometric isomers, total stereoisomers, chiral?]
  var ISOM = [
    ['[Pt(NH3)2Cl2]', 'square planar', 'MA2B2', 2, 2, false], ['[Co(NH3)4Cl2]^+', 'octahedral', 'MA4B2', 2, 2, false], ['[Co(NH3)3Cl3]', 'octahedral', 'MA3B3', 2, 2, false], ['[Co(NH3)5Cl]^2+', 'octahedral', 'MA5B', 1, 1, false],
    ['[Zn(NH3)2Cl2]', 'tetrahedral', 'MA2B2', 1, 1, false], ['[Pt(NH3)3Cl]^+', 'square planar', 'MA3B', 1, 1, false], ['[Co(en)3]^3+', 'octahedral', 'M(AA)3', 1, 2, true], ['[Co(en)2Cl2]^+', 'octahedral', 'M(AA)2B2', 2, 3, true],
    ['[Cr(H2O)4Cl2]^+', 'octahedral', 'MA4B2', 2, 2, false], ['[Pt(NH3)2ClBr]', 'square planar', 'MA2BC', 2, 2, false], ['[Ni(CN)4]^2-', 'square planar', 'MA4', 1, 1, false], ['[Co(NH3)2(H2O)2Cl2]^+', 'octahedral', 'MA2B2C2', 5, 6, true],
    ['[Pd(NH3)2Cl2]', 'square planar', 'MA2B2', 2, 2, false], ['[Rh(NH3)4Cl2]^+', 'octahedral', 'MA4B2', 2, 2, false], ['[Ir(NH3)3Cl3]', 'octahedral', 'MA3B3', 2, 2, false], ['[Cr(en)3]^3+', 'octahedral', 'M(AA)3', 1, 2, true],
    ['[Cr(en)2Cl2]^+', 'octahedral', 'M(AA)2B2', 2, 3, true], ['[Co(NH3)5Br]^2+', 'octahedral', 'MA5B', 1, 1, false], ['[Zn(NH3)2Br2]', 'tetrahedral', 'MA2B2', 1, 1, false], ['[Pt(NH3)2Br2]', 'square planar', 'MA2B2', 2, 2, false], ['[Co(NH3)4Br2]^+', 'octahedral', 'MA4B2', 2, 2, false]
  ];
  function isoTex(s) { return F(s); }
  G('gchem2.coordination-isomers', function (R, ctx) {
    var kind = lv(ctx, R.pick(['geo', 'geo', 'tf', 'which']), R.pick(['geo', 'chiral', 'total', 'which']), R.pick(['total', 'chiral', 'geo']));
    if (kind === 'which') { var W = R.pick([['[Pt(NH3)2Cl2]', 'square planar', 'the two chloride ligands are 90° apart', 'Cis'], ['[Pt(NH3)2Cl2]', 'square planar', 'the two chloride ligands are 180° apart', 'Trans'], ['[Pd(NH3)2Cl2]', 'square planar', 'the two ammonia ligands are 180° apart', 'Trans'],
        ['[Co(NH3)4Cl2]^+', 'octahedral', 'the two chloride ligands are 90° apart', 'Cis'], ['[Co(NH3)4Cl2]^+', 'octahedral', 'the two chloride ligands are 180° apart', 'Trans'], ['[Cr(H2O)4Cl2]^+', 'octahedral', 'the two chloride ligands are on opposite sides of the metal', 'Trans'], ['[Rh(NH3)4Cl2]^+', 'octahedral', 'the two chloride ligands are next to each other', 'Cis'],
        ['[Co(NH3)3Cl3]', 'octahedral', 'the three chloride ligands all lie on one face of the octahedron', 'Fac'], ['[Co(NH3)3Cl3]', 'octahedral', 'two of the chloride ligands are 180° apart, with the third between them', 'Mer'], ['[Ir(NH3)3Cl3]', 'octahedral', 'the three chloride ligands lie in one plane with the metal', 'Mer'], ['[Ir(NH3)3Cl3]', 'octahedral', 'each chloride ligand is 90° from the other two', 'Fac']]);
      var opts = W[3] === 'Fac' || W[3] === 'Mer' ? ['Fac', 'Mer', 'Cis', 'Trans'] : ['Cis', 'Trans', 'Fac', 'Mer'];
      return P('In one isomer of the ' + W[1] + ' complex $' + F(W[0]) + '$, ' + W[2] + '. What is this isomer called?', mc(W[3], opts.filter(function (o) { return o !== W[3]; })), ['Cis: the two like ligands are next to each other (90°). Trans: across from each other (180°). For three like ligands in an octahedron: fac means they cover one triangular face (all 90° apart); mer means they run along a meridian, so two are 180° apart.', 'Here ' + W[2] + ': ' + W[3].toLowerCase() + '.'], 'Look at the angle between the like ligands.', null, { k: 'iwhich', ans: W[3] }); }
    var pool = lv(ctx, ISOM.filter(function (x) { return x[2] !== 'MA2B2C2' && x[2].indexOf('AA') < 0; }), ISOM.filter(function (x) { return x[2] !== 'MA2B2C2'; }), ISOM), I = R.pick(pool);
    var intro = '$' + isoTex(I[0]) + '$ is ' + I[1] + '.' + (I[0].indexOf('en') >= 0 ? ' (en, ethylenediamine, spans two neighboring positions.)' : '') + ' ';
    var expl = {
      'MA2B2|square planar': 'The two ligands of each kind can sit next to each other (cis, 90° apart) or across from each other (trans, 180°). Those are the only two.',
      'MA4B2|octahedral': 'The two halide ligands are either adjacent (cis) or opposite (trans). Every other placement is one of these turned around.',
      'MA3B3|octahedral': 'The three chloride ligands either cover one face of the octahedron (fac) or run around a meridian (mer).',
      'MA5B|octahedral': 'All six positions of an octahedron are equivalent, so there is only one place for the odd ligand.',
      'MA2B2|tetrahedral': 'In a tetrahedron every pair of positions is adjacent, so all arrangements are the same.',
      'MA3B|square planar': 'All four corners are equivalent, so there is only one place for the odd ligand.',
      'M(AA)3|octahedral': 'There is one way to place three en, but the complex is a propeller: it comes as a left-handed and a right-handed form, mirror images that cannot be superimposed.',
      'M(AA)2B2|octahedral': 'The two chloride ligands can be trans (opposite) or cis (adjacent). The cis form has no mirror plane, so it exists as a pair of mirror images: 3 stereoisomers in all.',
      'MA2BC|square planar': 'The two NH₃ can be cis or trans to each other: two isomers.',
      'MA4|square planar': 'Only one kind of ligand: one arrangement.',
      'MA2B2C2|octahedral': 'Five geometric arrangements exist (all three pairs trans; one pair trans and two cis, three ways; all cis). The all-cis one is chiral, so there are 6 stereoisomers.'
    }[I[2] + '|' + I[1]];
    if (kind === 'geo') return P(intro + 'How many geometric isomers (counting a pair of mirror images as one) does it have?', int(I[3]), [expl, 'Turning a model in space never makes a new isomer: check whether one arrangement can be rotated into another.'], 'Ask whether two like ligands can be adjacent or opposite.', null, { k: 'igeo', pat: I[2], geom: I[1], i: ISOM.indexOf(I), ans: I[3] });
    if (kind === 'total') return P(intro + 'How many stereoisomers does it have in all (counting mirror-image forms separately)?', int(I[4]), [expl], 'Count geometric isomers, then check each for a non-superimposable mirror image.', null, { k: 'itot', pat: I[2], geom: I[1], i: ISOM.indexOf(I), ans: I[4] });
    if (kind === 'chiral') { var pc = I[2] === 'M(AA)2B2' ? R.pick(['cis', 'trans']) : null, isCh = pc ? pc === 'cis' : I[5] && I[2] !== 'MA2B2C2';
      if (I[2] === 'MA2B2C2') { isCh = false; pc = 'with each pair of like ligands trans'; }
      return P(intro.replace(' is ', pc ? ' (the ' + pc + ' isomer) is ' : ' is ') + 'True or false: it is chiral (its mirror image cannot be superimposed on it).', tf(isCh), [expl, isCh ? 'So it is chiral: true.' : 'It has a mirror plane, so its mirror image is the same complex: not chiral, false.'], 'Look for a mirror plane through the complex.', null, { k: 'ich', pat: I[2], geom: I[1], i: ISOM.indexOf(I), pc: pc, ans: isCh }); }
    var t = R.pick([['Rotating a model of $[\\mathrm{Co(NH_3)_4Cl_2}]^+$ can turn the cis isomer into the trans isomer.', false], ['cis- and trans-$[\\mathrm{Pt(NH_3)_2Cl_2}]$ have the same formula but different properties.', true]]);
    return P('True or false: ' + t[0], tf(t[1]), ['Isomers differ in which positions the ligands occupy; changing between them means breaking and remaking bonds. Rotation only shows the same complex from another side.', 'cisplatin, cis-$[\\mathrm{Pt(NH_3)_2Cl_2}]$, is a cancer drug; the trans isomer is not, which shows how much geometry matters.', 'So the statement is ' + (t[1] ? 'true' : 'false') + '.'], 'Rotation moves the whole complex; isomers differ in bonding positions.', null, { k: 'itf', ans: t[1] });
  });

  // crystal field: [formula, metal, ox, geometry, field ('strong'|'weak'), unpaired]
  var CF = [['[Fe(CN)6]^4-', 'Fe', 2, 'oct', 'strong'], ['[Fe(H2O)6]^2+', 'Fe', 2, 'oct', 'weak'], ['[Co(NH3)6]^3+', 'Co', 3, 'oct', 'strong'], ['[CoF6]^3-', 'Co', 3, 'oct', 'weak'], ['[Fe(H2O)6]^3+', 'Fe', 3, 'oct', 'weak'],
    ['[Fe(CN)6]^3-', 'Fe', 3, 'oct', 'strong'], ['[Mn(H2O)6]^2+', 'Mn', 2, 'oct', 'weak'], ['[Cr(H2O)6]^3+', 'Cr', 3, 'oct', 'weak'], ['[Ni(H2O)6]^2+', 'Ni', 2, 'oct', 'weak'], ['[Cu(H2O)6]^2+', 'Cu', 2, 'oct', 'weak'],
    ['[Ti(H2O)6]^3+', 'Ti', 3, 'oct', 'weak'], ['[Zn(H2O)6]^2+', 'Zn', 2, 'oct', 'weak'], ['[Co(H2O)6]^2+', 'Co', 2, 'oct', 'weak'], ['[Mn(CN)6]^3-', 'Mn', 3, 'oct', 'strong'], ['[NiCl4]^2-', 'Ni', 2, 'tet', 'weak'], ['[CoCl4]^2-', 'Co', 2, 'tet', 'weak']];
  var GROUP = { Ti: 4, V: 5, Cr: 6, Mn: 7, Fe: 8, Co: 9, Ni: 10, Cu: 11, Zn: 12 };
  function dCount(m, ox) { return GROUP[m] - ox; }
  function unpaired(d, geo, field) { // fill orbitals by the rule for that geometry and spin
    // octahedral: t2g (3) below eg (2); tetrahedral: e (2) below t2 (3), always high spin
    var lo = geo === 'tet' ? 2 : 3, hi = geo === 'tet' ? 3 : 2, low = new Array(lo).fill(0), high = new Array(hi).fill(0), left = d;
    function place(arr, cap) { for (var i = 0; i < arr.length && left > 0; i++) if (arr[i] < cap) { arr[i]++; left--; } }
    if (geo === 'oct' && field === 'strong') { place(low, 1); place(low, 2); place(high, 1); place(high, 2); }
    else { place(low, 1); place(high, 1); place(low, 2); place(high, 2); }
    return low.concat(high).filter(function (x) { return x === 1; }).length;
  }
  var COLORS = [['red', 680, 'green'], ['orange', 605, 'blue'], ['yellow', 580, 'violet'], ['green', 530, 'red'], ['blue', 470, 'orange'], ['violet', 420, 'yellow']];
  G('gchem2.crystal-field', function (R, ctx) {
    var kind = lv(ctx, R.pick(['d', 'color']), R.pick(['unp', 'color', 'delta', 'series']), R.pick(['unp', 'delta', 'mag', 'unp']));
    var c = R.pick(CF), d = dCount(c[1], c[2]), u = unpaired(d, c[3], c[4]);
    var cfTex = F(c[0]), dStep = c[1] + ' is in group ' + GROUP[c[1]] + ', so the neutral atom has ' + GROUP[c[1]] + ' valence electrons; the ' + c[1] + '$^{' + c[2] + '+}$ ion has lost ' + c[2] + ' (from 4s first), leaving $d^{' + d + '}$.';
    if (kind === 'd') return P('How many d electrons does the metal ion in $' + cfTex + '$ have?', int(d), [dStep], 'Group number minus the oxidation state (for the 3d metals).', null, { k: 'cfd', c: c[0], geom: c[3], ans: d });
    if (kind === 'unp' || kind === 'mag') {
      var why = c[3] === 'tet' ? 'In a tetrahedral complex the splitting is small (about 4/9 of the octahedral one), so electrons always spread out first: high spin.' : c[4] === 'strong' ? '$\\mathrm{' + (c[0].indexOf('CN') >= 0 ? 'CN^-' : 'NH_3') + '}$ is a strong-field ligand: the gap $\\Delta_o$ is larger than the pairing energy, so electrons pair in the lower $t_{2g}$ set before entering $e_g$ (low spin).' : 'The ligands are weak-field: $\\Delta_o$ is smaller than the pairing energy, so electrons spread over all five d orbitals before pairing (high spin).';
      if (kind === 'mag') return P('Is $' + cfTex + '$ paramagnetic (attracted into a magnetic field)?', tf(u > 0), [dStep, why, u > 0 ? 'It has ' + u + ' unpaired electron' + (u > 1 ? 's' : '') + ', so it is paramagnetic: true.' : 'All electrons are paired, so it is diamagnetic: false.'], 'Find the d count and the spin state, then count unpaired electrons.', null, { k: 'cfmag', c: c[0], geom: c[3], ans: u > 0 });
      return P('How many unpaired electrons does $' + cfTex + '$ have?', int(u), [dStep, why, 'Filling $d^{' + d + '}$ that way leaves ' + u + ' unpaired electron' + (u === 1 ? '' : 's') + '.'], 'd count first; then decide high or low spin from the ligand.', null, { k: 'cfu', c: c[0], geom: c[3], ans: u }); }
    if (kind === 'color') { var col = R.pick(COLORS);
      return P('A solution of a complex absorbs mostly ' + col[0] + ' light (around ' + col[1] + ' nm). What color does it appear?', mc(cap(col[2]), COLORS.map(function (x) { return cap(x[2]); }).filter(function (x) { return x !== cap(col[2]); }).slice(0, 2).concat([cap(col[0])])), [
        'White light minus the absorbed color reaches your eye. What you see is the complementary color, across the color wheel from the one absorbed.',
        'Opposite pairs: red–green, orange–blue, yellow–violet. Absorbing ' + col[0] + ' leaves the solution looking ' + col[2] + '.'
      ], 'Not the absorbed color: its complement.', null, { k: 'cfcol', ans: cap(col[2]) }); }
    if (kind === 'series') { var sets = [['CN^-', 'NH3', 'H2O', 'Cl^-'], ['CO', 'en', 'F^-', 'I^-'], ['NH3', 'OH^-', 'Br^-', 'I^-'], ['CN^-', 'H2O', 'F^-', 'Br^-']], s = R.pick(sets);
      return P('Which ligand produces the largest crystal-field splitting $\\Delta_o$ with the same metal ion?', mc('$' + F(s[0]) + '$', s.slice(1).map(function (x) { return '$' + F(x) + '$'; })), ['The spectrochemical series, measured from absorption spectra: $\\mathrm{I^- < Br^- < Cl^- < F^- < OH^- < H_2O < NH_3 < en < CN^- < CO}$.', 'The farther right, the larger $\\Delta_o$. Here $' + F(s[0]) + '$ is farthest right. Note that a ligand\u2019s charge does not decide it: neutral $\\mathrm{NH_3}$ splits more than $\\mathrm{F^-}$.'], 'Recall the spectrochemical series.', null, { k: 'cfser', ans: s[0] }); }
    var lam = R.int(40, 70) * 10, dl = C.h * C.c * C.NA / (lam * 1e-9) / 1000;
    return P('An octahedral complex absorbs light most strongly at $' + lam + '\\ \\text{nm}$, which promotes an electron across the gap $\\Delta_o$. What is $\\Delta_o$ in kJ/mol? (Use $h = 6.626 \\times 10^{-34}\\ \\text{J·s}$, $c = 3.00 \\times 10^8\\ \\text{m/s}$ and $N_A = 6.022 \\times 10^{23}$.)', num(dl), [
      'Energy of one photon: $E = \\dfrac{hc}{\\lambda} = \\dfrac{(6.626 \\times 10^{-34})(3.00 \\times 10^8)}{' + lam + ' \\times 10^{-9}\\ \\text{m}} = ' + fx(C.h * C.c / (lam * 1e-9), 3) + '\\ \\text{J}$.',
      'Per mole: $' + fx(C.h * C.c / (lam * 1e-9), 3) + ' \\times 6.022 \\times 10^{23} = ' + fx(dl * 1000, 3) + '\\ \\text{J/mol} = ' + q(dl, 'kJ/mol') + '$.',
      'Shorter absorbed wavelengths mean a bigger gap, which strong-field ligands produce.'
    ], 'E = hc/λ per photon, then multiply by Avogadro\u2019s number.', 'kJ/mol', { k: 'cfdel', lam: lam, ans: dl });
  });


  // exposed for the course's node tests
  ML.gchem2Helpers = { sfStr: sfStr, fx: fx, gv: gv, F: F, EQ: EQ, sgf: sgf, TD: TD };
})(window.MathLadder);

/* ---- More of the same skills (round 7, "widen"): larger fact banks ----
   Topics whose levels had few different problems also draw from the banks below, built from the topic's own facts:
   true or false; which statement is true (or false); sorting (which one is …, which is not, choose all, which group);
   a term and its meaning, both ways; and the order of steps (what comes next, what comes first, put in order).
   Every answer comes from the bank itself, so the right choice and the others can never disagree. Shares are per level:
   the topic's own generator still makes the rest. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen) return;
  var BK = {};
  function T(id, o) { var b = BK[id] || (BK[id] = {}); Object.keys(o).forEach(function (k) { b[k] = k === 'share' || k === 'forms' ? Object.assign(b[k] || {}, o[k]) : o[k]; }); }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  function capI(s) { s = String(s); return /\s/.test(s) || s.length > 3 ? cap(s) : s; } // genotypes like tt stay as written
  function low(s) { s = String(s); return /^[A-Z][a-z]/.test(s) && !/^(DNA|RNA|ATP|I )/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function dot(s) { s = String(s).replace(/\s+$/, ''); return /[.!?)]$/.test(s) ? s : s + '.'; }
  function nodot(s) { return String(s).replace(/\.$/, ''); }
  function fill(t, o) { return t.replace(/\{(\w)\}/g, function (_, k) { return o[k]; }); }
  function MC(right, wrong) { return { t: 'mc', choices: [right].concat(wrong), v: 0 }; }
  function TF(v) { return { t: 'mc', choices: ['True', 'False'], v: v ? 0 : 1, keep: true }; }
  function LT(i) { return String.fromCharCode(65 + i); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  var FORMS = { 1: ['tf', 'tf1', 'one', 'cat', 'fwd', 'back', 'next'], 2: ['tf', 'tf1', 'one', 'not', 'cat', 'fwd', 'back', 'next', 'first'], 3: ['tf1', 'not', 'all', 'back', 'fwd', 'order', 'first', 'cat'] };
  function can(o, f) {
    var tf = o.tf || [], s = o.sort, pr = o.pair, sq = o.seq;
    if (f === 'custom') return !!o.make;
    if (f === 'tf') return tf.length > 0;
    if (f === 'tf1') return tf.filter(function (x) { return x[1]; }).length >= 3 && tf.filter(function (x) { return !x[1]; }).length >= 3;
    if (f === 'one' || f === 'not' || f === 'all' || f === 'cat') return !!s;
    if (f === 'fwd' || f === 'back') return !!pr;
    return !!sq;
  }
  function make(R, o, L) {
    var forms = (o.forms && o.forms[L]) || FORMS[L];
    forms = forms.filter(function (f) { return can(o, f); });
    if (!forms.length) return null;
    var f = R.pick(forms), p = null;
    if (f === 'custom') p = o.make(R, L);
    else if (f === 'tf' || f === 'tf1') p = mkTf(R, o, f);
    else if (o.sort && (f === 'one' || f === 'not' || f === 'all' || f === 'cat')) p = mkSort(R, o.sort, f, L);
    else if (f === 'fwd' || f === 'back') p = mkPair(R, o.pair, f);
    else p = mkSeq(R, o.seq, f, L);
    if (p && !p.hint) p.hint = o.hint || 'Think back to the lesson, then check each choice.';
    return p;
  }
  function mkTf(R, o, f) {
    var tf = o.tf;
    if (f === 'tf') {
      var t = R.pick(tf);
      return { q: 'True or false: ' + dot(t[0]), a: TF(t[1]), steps: [t[2] ? dot(t[2]) : 'The statement is ' + (t[1] ? 'true.' : 'false.'), 'So the answer is <b>' + (t[1] ? 'true' : 'false') + '</b>.'] };
    }
    var wantTrue = R.coin(), good = tf.filter(function (x) { return x[1] === wantTrue; }), bad = tf.filter(function (x) { return x[1] !== wantTrue; });
    var r = R.pick(good), ws = R.sample(bad, 3);
    return { q: 'Which statement is <b>' + (wantTrue ? 'true' : 'false') + '</b>?', a: MC(dot(r[0]), ws.map(function (x) { return dot(x[0]); })),
      steps: [(wantTrue ? 'True: ' : 'False: ') + dot(r[0]) + (r[2] ? ' ' + dot(r[2]) : '')].concat(ws.map(function (x) { return (wantTrue ? 'False: ' : 'True: ') + dot(x[0]) + (x[2] ? ' ' + dot(x[2]) : ''); })) };
  }
  function why(s, it) {
    if (it[2]) return dot(cap(it[2]));
    if (it[0].length <= 3) return it[0] + ': ' + low(s.cats[it[1]][2]) + '.';
    if (/[.?!]$/.test(it[0])) return '“' + cap(it[0]) + '” ' + cap(s.cats[it[1]][2]) + '.';
    return cap(dot(it[0] + ' ' + (s.be || 'is') + ' ' + s.cats[it[1]][0]));
  }
  function mkSort(R, s, f, L) {
    var keys = Object.keys(s.cats), k = R.pick(keys.filter(function (c) { return s.items.some(function (x) { return x[1] === c; }); })), C = s.cats[k];
    // names ("a frog") and descriptions ("It has no tubes for water.") are not mixed in one list of choices
    var isD = function (x) { return /[.?!]$/.test(x[0]); }, names = s.items.filter(function (x) { return !isD(x); }), descs = s.items.filter(isD);
    var useD = f !== 'cat' && (names.length < 6 || (descs.length >= 6 && R.coin())), pool = useD ? descs : names;
    var inC = pool.filter(function (x) { return x[1] === k; }), outC = pool.filter(function (x) { return x[1] !== k; });
    var verb1 = useD ? 'describes ' : (s.be === 'are' ? 'are ' : 'is '), verbN = useD ? 'describe ' : 'are ';
    var lead = s.lead ? s.lead + ' ' : '';
    if (f === 'cat') {
      var it = R.pick(s.items), opts = keys.length > 4 ? [it[1]].concat(R.sample(keys.filter(function (c) { return c !== it[1]; }), 3)) : [it[1]].concat(keys.filter(function (c) { return c !== it[1]; }));
      var a = { t: 'mc', choices: opts.map(function (c) { return cap(s.cats[c][2]); }), v: 0 };
      if (keys.length <= 3) { a.choices = keys.map(function (c) { return cap(s.cats[c][2]); }); a.v = keys.indexOf(it[1]); a.keep = true; }
      return { q: lead + fill(s.catq || 'Which group does this belong to? {x}', { x: dot(capI(it[0])) }), a: a, steps: [why(s, it), 'So the answer is <b>' + low(s.cats[it[1]][2]) + '</b>.'] };
    }
    if (f === 'one' && inC.length && outC.length >= 3) {
      var r = R.pick(inC), w = R.sample(outC, 3);
      return { q: lead + 'Which of these ' + verb1 + C[0] + '?', a: MC(capI(r[0]), w.map(function (x) { return capI(x[0]); })),
        steps: [why(s, r)].concat(w.map(function (x) { return why(s, x); })) };
    }
    if (f === 'not' && inC.length >= 3 && outC.length) {
      var r2 = R.pick(outC), w2 = R.sample(inC, 3);
      return { q: lead + 'Three of these ' + verbN + C[1] + '. Which one ' + (useD ? 'does' : 'is') + ' <b>not</b>?', a: MC(capI(r2[0]), w2.map(function (x) { return capI(x[0]); })),
        steps: [why(s, r2)].concat(w2.map(function (x) { return why(s, x); })) };
    }
    if (f === 'all' && inC.length >= 1 && outC.length >= 1) {
      var n = M5(R, inC.length + outC.length), kk = R.int(Math.max(1, n - outC.length), Math.min(inC.length, n - 1)), items = R.shuffle(R.sample(inC, kk).concat(R.sample(outC, n - kk)));
      return { q: lead + 'Choose <b>all</b> of these that ' + verbN + C[1] + '.', a: { t: 'mc', choices: items.map(function (x) { return capI(x[0]); }), v: items.map(function (x, i) { return x[1] === k ? i : -1; }).filter(function (i) { return i >= 0; }) },
        steps: items.map(function (x) { return why(s, x); }) };
    }
    return mkSort(R, s, 'cat', L);
  }
  function M5(R, total) { return Math.min(total, R.pick([4, 5])); }
  function mkPair(R, pr, f) {
    var it = R.pick(pr.items), kx = f === 'fwd' ? 1 : 0, seen = {}, pool = pr.items.filter(function (x) { if (x === it || x[0] === it[0] || x[1] === it[1] || seen[x[kx]]) return false; seen[x[kx]] = 1; return true; }), others = R.sample(pool, Math.min(3, pool.length));
    if (f === 'fwd') return { q: fill(pr.fwd, { t: it[0] }), a: MC(cap(it[1]), others.map(function (x) { return cap(x[1]); })), steps: [cap(it[0]) + ': ' + low(dot(it[1]))].concat(others.length ? ['The others: ' + others.map(function (x) { return low(nodot(x[1])) + ' (' + x[0] + ')'; }).join('; ') + '.'] : []) };
    return { q: fill(pr.back, { d: low(nodot(it[1])) }), a: MC(cap(it[0]), others.map(function (x) { return cap(x[0]); })), steps: [cap(it[0]) + ': ' + low(dot(it[1]))].concat(others.length ? ['The others: ' + others.map(function (x) { return x[0] + ', ' + low(nodot(x[1])); }).join('; ') + '.'] : []) };
  }
  function mkSeq(R, sq, f, L) {
    var lists = sq.lists || [sq], s = R.pick(lists), it = s.items, name = s.name;
    if (f === 'next') {
      var i = R.int(0, it.length - 2), w = R.sample(it.filter(function (x, j) { return j !== i + 1 && j !== i; }), Math.min(3, it.length - 2));
      return { q: 'In ' + name + ', what comes right after this: ' + low(nodot(it[i])) + '?', a: MC(cap(it[i + 1]), w.map(cap)), steps: ['The order: ' + it.map(nodot).join(' → ') + '.', 'Right after ' + low(nodot(it[i])) + ' comes <b>' + low(nodot(it[i + 1])) + '</b>.'] };
    }
    var n = Math.min(it.length, L === 3 ? 4 : 3), idx = R.sample(it.map(function (_, j) { return j; }), n).sort(function (a, b) { return a - b; });
    if (f === 'first') {
      var last = R.coin() && L > 1, pickI = last ? idx[idx.length - 1] : idx[0];
      return { q: 'In ' + name + ', which of these comes <b>' + (last ? 'last' : 'first') + '</b>?', a: MC(cap(it[pickI]), idx.filter(function (j) { return j !== pickI; }).map(function (j) { return cap(it[j]); })),
        steps: ['The order: ' + idx.map(function (j) { return nodot(it[j]); }).join(' → ') + '.', 'So <b>' + low(nodot(it[pickI])) + '</b> comes ' + (last ? 'last' : 'first') + '.'] };
    }
    var shown = R.shuffle(idx.slice()), right = idx.map(function (j) { return LT(shown.indexOf(j)); }).join(''), wr = [], g = 0;
    while (wr.length < 3 && g++ < 100) { var c = R.shuffle(right.split('')).join(''); if (c !== right && wr.indexOf(c) < 0) wr.push(c); }
    return { q: 'Put these in order for ' + name + ':<br>' + shown.map(function (j, i) { return '<b>' + LT(i) + '</b>: ' + low(nodot(it[j])); }).join('<br>'), a: MC(right.split('').join(', '), wr.map(function (x) { return x.split('').join(', '); })),
      steps: ['The order: ' + idx.map(function (j) { return LT(shown.indexOf(j)) + ' (' + low(nodot(it[j])) + ')'; }).join(' → ') + '.', 'So the answer is <b>' + right.split('').join(', ') + '</b>.'] };
  }

  /* ===== gchem2 ===== */
  function cf(s) { // "H2SO4" -> $\mathrm{H_{2}SO_{4}}$; "NO3^-" -> $\mathrm{NO_{3}^{-}}$
    var p = String(s).split('^'), b = p[0].replace(/([A-Za-z)\]])(\d+)/g, '$1_{$2}');
    return '$\\mathrm{' + b + (p[1] ? '^{' + p[1] + '}' : '') + '}$';
  }
  function cmp(R, pairs, what, why) { // pairs: [stronger, weaker, reason]; ask for the stronger or the weaker
    var pr = R.pick(pairs), hi = R.coin(), sw = R.coin(), a = sw ? pr[1] : pr[0], b = sw ? pr[0] : pr[1], right = hi ? pr[0] : pr[1];
    return { q: 'Which is the ' + (hi ? what[0] : what[1]) + ': ' + cf(a) + ' or ' + cf(b) + '?', a: { t: 'mc', choices: [cf(a), cf(b)], v: right === a ? 0 : 1, keep: true },
      hint: why, steps: [dot(cap(pr[2])), 'So the ' + (hi ? what[0] : what[1]) + ' is <b>' + cf(right) + '</b>.'] };
  }

  T('gchem2.acid-strength-structure', { share: { 1: 0.8, 2: 0.4 }, forms: { 1: ['custom', 'custom', 'tf'], 2: ['custom', 'tf', 'tf1'] },
    make: function (R) {
      return cmp(R, [['HClO4', 'HClO3', 'more oxygens pull electron density away from the O–H bond and spread out the anion\'s charge'], ['HClO3', 'HClO2', 'more oxygens on the same central atom make the acid stronger'], ['HClO2', 'HClO', 'more oxygens on the same central atom make the acid stronger'],
        ['HNO3', 'HNO2', 'the extra oxygen pulls electron density away from the O–H bond'], ['H2SO4', 'H2SO3', 'the extra oxygen pulls electron density away from the O–H bond'], ['HI', 'HBr', 'down a group the H–X bond gets longer and weaker'], ['HBr', 'HCl', 'down a group the H–X bond gets longer and weaker'],
        ['HCl', 'HF', 'the H–F bond is short and very strong, so HF is a weak acid'], ['H2Te', 'H2Se', 'down a group the bond to H gets longer and weaker'], ['H2Se', 'H2S', 'down a group the bond to H gets longer and weaker'], ['H2S', 'H2O', 'down a group the bond to H gets longer and weaker'],
        ['HF', 'H2O', 'across a period, a more electronegative atom holds the negative charge better'], ['H2O', 'NH3', 'across a period, a more electronegative atom holds the negative charge better'], ['NH3', 'CH4', 'across a period, a more electronegative atom holds the negative charge better'],
        ['HClO', 'HBrO', 'with the same structure, a more electronegative central atom pulls more electron density from the O–H bond'], ['HBrO', 'HIO', 'with the same structure, a more electronegative central atom pulls more electron density from the O–H bond'],
        ['CCl3COOH', 'CH3COOH', 'electronegative chlorines pull electron density away and stabilize the anion'], ['CH2ClCOOH', 'CH3COOH', 'an electronegative chlorine pulls electron density away and stabilizes the anion'], ['CF3COOH', 'CH3COOH', 'electronegative fluorines pull electron density away and stabilize the anion']],
        ['stronger acid', 'weaker acid'], 'Compare bond strength (down a group), electronegativity (across a period or of the central atom), and the number of oxygens.');
    },
    tf: [['Down a group, binary acids get stronger because the H–X bond gets weaker', true], ['HF is a strong acid because fluorine is the most electronegative element', false, 'HF is weak: its H–F bond is very strong'],
      ['For oxoacids of the same element, more oxygens means a stronger acid', true], ['A more stable conjugate base means a stronger acid', true], ['Across a period, binary acids get stronger as the atom bonded to H becomes more electronegative', true],
      ['HClO is a stronger acid than HClO4', false, 'HClO4 has more oxygens and is far stronger'], ['Resonance that spreads out the negative charge of the conjugate base makes an acid stronger', true], ['Acetic acid is a stronger acid than trichloroacetic acid', false]] });

  T('gchem2.mechanisms', { share: { 1: 0.4, 2: 0.55 },
    tf: [['An intermediate is made in one step and used up in a later step', true], ['A catalyst is used up in an early step and made again in a later step', true], ['An intermediate appears in the overall balanced equation', false, 'Intermediates cancel when the steps are added'],
      ['The steps of a mechanism must add up to the overall equation', true], ['A catalyst appears in the overall balanced equation', false, 'It is regenerated, so it cancels'], ['A mechanism must agree with the measured rate law', true],
      ['A mechanism that fits the rate law is proved to be correct', false, 'It is only consistent with the data; another mechanism might fit too'], ['Each step of a mechanism is an elementary step', true],
      ['Intermediates can sometimes be detected while the reaction runs', true], ['A catalyst changes the overall ΔH of the reaction', false]] });

  T('gchem2.rate-determining-step', { share: { 2: 0.6, 3: 0.55 }, forms: { 2: ['tf', 'tf1'], 3: ['tf1', 'tf'] },
    tf: [['The slowest step limits the rate of the whole reaction', true], ['The rate law of the overall reaction comes from the slow step', true], ['A reactant that enters only after the slow step does not appear in the rate law (when the first step is slow)', true],
      ['The rate-determining step is always the first step', false, 'It can be any step'], ['The overall rate law can be read from the overall balanced equation', false, 'It must be found by experiment or from the mechanism'],
      ['Speeding up a fast step does not change the overall rate much', true], ['If the first step is slow, the rate law matches that step\'s reactants', true], ['The rate-determining step has the highest activation energy along the path', true],
      ['Every step of a mechanism goes at the same speed', false], ['Intermediates must not appear in the final rate law', true]] });

  T('gchem2.pre-equilibrium', { share: { 2: 0.55 }, forms: { 2: ['tf', 'tf1'] },
    tf: [['In a pre-equilibrium, a fast reversible step comes before the slow step', true], ['An intermediate\'s concentration can be found from the fast equilibrium', true], ['The final rate law may not contain any intermediates', true],
      ['A fast equilibrium step means its forward and reverse rates are nearly equal', true], ['The observed rate constant can combine constants from several steps', true], ['In a pre-equilibrium mechanism the first step is the slow step', false, 'The first step is fast and reversible'], ['The pre-equilibrium approach replaces the intermediate with reactant concentrations', true]] });

  T('gchem2.elementary-steps', { share: { 1: 0.5 },
    sort: { cats: { u: ['unimolecular', 'unimolecular steps', 'Unimolecular'], b: ['bimolecular', 'bimolecular steps', 'Bimolecular'], t: ['termolecular', 'termolecular steps', 'Termolecular'] }, be: 'is', catq: 'This is an elementary step. What is its molecularity? {x}', items: [
      ['O₃ → O₂ + O', 'u'], ['N₂O₄ → 2 NO₂', 'u'], ['Cl₂ → 2 Cl', 'u'], ['N₂O₅ → NO₂ + NO₃', 'u'], ['C₄H₈ → 2 C₂H₄', 'u'], ['Br₂ → 2 Br', 'u'],
      ['NO + O₃ → NO₂ + O₂', 'b'], ['2 NO₂ → NO₃ + NO', 'b'], ['H + Cl₂ → HCl + Cl', 'b'], ['NO₂ + CO → NO + CO₂', 'b'], ['O + O₃ → 2 O₂', 'b'], ['2 HI → H₂ + I₂', 'b'],
      ['2 NO + O₂ → 2 NO₂', 't'], ['2 NO + Cl₂ → 2 NOCl', 't']] },
    tf: [['For an elementary step, the rate law follows from its coefficients', true], ['Termolecular steps are rare, because three particles seldom collide at once', true], ['A unimolecular step involves one particle', true], ['The rate law of any overall reaction comes from its coefficients', false, 'Only for elementary steps']] });

  T('gchem2.kp-kc', { share: { 1: 0.45 }, forms: { 1: ['custom', 'custom', 'tf'] },
    make: function (R) { // Δn from a made-up gas reaction (some species may be solids or liquids)
      var names = ['A', 'B', 'C', 'D'], co = names.map(function () { return R.int(1, 3); }), ph = names.map(function (n, i) { return R.chance(0.2) ? R.pick(['s', 'l']) : 'g'; });
      if (ph.every(function (x) { return x !== 'g'; })) ph[0] = 'g';
      function sd(i) { return (co[i] > 1 ? co[i] + '\\,' : '') + '\\mathrm{' + names[i] + '}(\\mathrm{' + ph[i] + '})'; }
      var gr = (ph[0] === 'g' ? co[0] : 0) + (ph[1] === 'g' ? co[1] : 0), gp = (ph[2] === 'g' ? co[2] : 0) + (ph[3] === 'g' ? co[3] : 0), dn = gp - gr;
      return { q: 'For $' + sd(0) + ' + ' + sd(1) + ' \\rightleftharpoons ' + sd(2) + ' + ' + sd(3) + '$, what is $\\Delta n$ in $K_p = K_c(RT)^{\\Delta n}$?', a: { t: 'num', v: String(dn) },
        hint: 'Count moles of gas only: products minus reactants.', steps: ['Moles of gas on the product side: ' + gp + '. On the reactant side: ' + gr + '.', 'Solids and liquids do not count.', '$\\Delta n = ' + gp + ' - ' + gr + ' = ' + dn + '$.'] };
    },
    tf: [['K_p equals K_c when the moles of gas are the same on both sides', true], ['Solids and liquids count in Δn', false, 'Only gases count'], ['Δn is moles of gaseous products minus moles of gaseous reactants', true]] });

  T('gchem2.indicators', { share: { 1: 0.35 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['An indicator changes color over a range of about pH = pKₐ ± 1', true], ['Every acid–base titration should use an indicator that changes color at pH 7', false, 'Choose one that changes near the equivalence point'],
      ['For a weak acid titrated with a strong base, the equivalence point is above pH 7', true], ['For a weak base titrated with a strong acid, the equivalence point is below pH 7', true], ['Phenolphthalein is colorless in acid and pink in base', true],
      ['An indicator is itself a weak acid or a weak base', true], ['Methyl orange changes color in the acidic range, around pH 3 to 4', true], ['A good indicator changes color near the equivalence point of the titration', true],
      ['The end point and the equivalence point are always exactly the same', false, 'The end point is where the color changes; a good indicator makes it close'], ['At pH = pKₐ of the indicator, the acid and base forms are present in equal amounts', true]] });

  T('gchem2.comparing-solubility', { share: { 2: 0.45 }, forms: { 2: ['tf', 'tf1'] },
    tf: [['Ksp values can be compared directly only for salts that make the same number of ions', true], ['A smaller Ksp always means a smaller molar solubility', false, 'Only when the salts make the same number of ions'],
      ['Molar solubility is the number of moles of salt that dissolve per liter of saturated solution', true], ['For a 1 : 1 salt, the molar solubility is the square root of Ksp', true], ['For a salt like CaF₂, Ksp = 4s³', true],
      ['Adding a common ion lowers a salt\'s solubility', true], ['Ksp has the same value at every temperature', false], ['For a 1 : 2 salt, the molar solubility is the square root of Ksp', false, 'It is the cube root of Ksp / 4']] });

  T('gchem2.complex-ions', { share: { 1: 0.4, 3: 0.45 }, forms: { 3: ['tf1', 'tf'] },
    tf: [['A Lewis acid must contain a hydrogen atom', false, 'A Lewis acid accepts an electron pair; metal ions like Ag⁺ are Lewis acids'], ['Adding ammonia makes silver chloride more soluble, because Ag⁺ forms [Ag(NH₃)₂]⁺', true],
      ['A large formation constant Kf means the complex ion is very stable', true], ['In a complex ion, ligands donate electron pairs to the metal ion', true], ['Forming a complex ion lowers the free metal ion concentration', true],
      ['Ammonia is a Lewis base because it has a lone pair', true], ['A metal ion in a complex acts as a Lewis base', false, 'It accepts electron pairs: a Lewis acid'], ['Thiosulfate dissolves silver bromide by forming a complex ion', true],
      ['Adding excess ligand pushes more metal into the complex', true], ['A complex ion always has a positive charge', false, 'It can be positive, negative or neutral']] });

  T('gchem2.entropy-microstates', { share: { 1: 0.45, 2: 0.4 }, forms: { 1: ['tf', 'tf1'], 2: ['tf', 'tf1'] },
    tf: [['Entropy is related to the number of microstates: S = k ln W', true], ['A system with more microstates has higher entropy', true], ['Gas molecules spreading into a larger volume increases entropy', true],
      ['A perfect crystal at 0 K has one microstate and zero entropy', true], ['Doubling the volume of a gas halves its number of microstates', false, 'It greatly increases them'], ['Mixing two gases increases entropy', true],
      ['Entropy is a measure of how many ways energy and matter can be arranged', true], ['Heating a substance usually increases its entropy', true], ['A system always moves toward fewer microstates on its own', false],
      ['Spreading energy over more particles increases the number of microstates', true]] });

  T('gchem2.standard-entropy', { share: { 2: 0.4 }, forms: { 2: ['custom', 'custom', 'tf'] },
    make: function (R) {
      return cmp(R, [['H2O(g)', 'H2O(l)', 'a gas has far more freedom of motion than a liquid'], ['H2O(l)', 'H2O(s)', 'a liquid has more freedom of motion than a solid'], ['Br2(g)', 'Br2(l)', 'a gas has far more freedom of motion than a liquid'],
        ['C2H6(g)', 'CH4(g)', 'a larger, more complex molecule has more ways to move and vibrate'], ['C3H8(g)', 'C2H6(g)', 'a larger, more complex molecule has more ways to move and vibrate'], ['Cl2(g)', 'F2(g)', 'a heavier molecule has more closely spaced energy levels'],
        ['O3(g)', 'O2(g)', 'more atoms per molecule means more ways to vibrate and rotate'], ['NO2(g)', 'NO(g)', 'more atoms per molecule means more ways to vibrate and rotate'], ['I2(g)', 'I2(s)', 'a gas has far more freedom of motion than a solid'],
        ['C(graphite)', 'C(diamond)', 'graphite\'s layers allow more motion than diamond\'s rigid network'], ['CO2(g)', 'CO2(s)', 'a gas has far more freedom of motion than a solid'], ['N2O4(g)', 'NO2(g)', 'a larger molecule has more ways to vibrate and rotate']],
        ['one with the higher standard entropy', 'one with the lower standard entropy'], 'Gases beat liquids beat solids; then bigger and more complex molecules win.');
    },
    tf: [['A gas has a higher standard entropy than the same substance as a liquid', true], ['Elements in their standard states have S° = 0', false, 'That is true of ΔHf°, not of S°'], ['Larger, more complex molecules usually have higher S°', true]] });

  T('gchem2.free-energy-k', { share: { 1: 0.35 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['A negative ΔG° means K is greater than 1', true], ['A positive ΔG° means K is less than 1', true], ['If ΔG° = 0, then K = 1', true], ['At equilibrium, ΔG° = 0', false, 'At equilibrium ΔG = 0 and Q = K; ΔG° is fixed'],
      ['ΔG° = −RT ln K', true], ['A reaction with a very large K has a very negative ΔG°', true], ['A positive ΔG° means no products ever form', false, 'Some products form; K is simply less than 1'], ['ΔG depends on the current mixture, while ΔG° does not', true]] });

  T('gchem2.coupled-reactions', { share: { 1: 0.4, 2: 0.4, 3: 0.4 }, forms: { 1: ['tf', 'tf1'], 2: ['tf', 'tf1'], 3: ['tf1', 'tf'] },
    tf: [['Coupling a nonspontaneous reaction to a spontaneous one can make the total ΔG negative', true], ['When reactions are added, their ΔG° values add', true], ['Cells use ATP hydrolysis to drive reactions that would not go on their own', true],
      ['Coupled reactions must share an intermediate or be linked in some way', true], ['Coupling changes the ΔG° of each separate reaction', false, 'Each keeps its own ΔG°; the totals add'], ['Smelting iron ore with carbon is a coupled process in which carbon\'s oxidation drives the reduction of the ore', true],
      ['A coupled process with a total ΔG° of +5 kJ/mol is strongly favored', false], ['When reactions are added, their K values multiply', true], ['Hydrolysis of ATP has a ΔG° of about −30.5 kJ/mol', true]] });

  T('gchem2.electrolytic-cells', { share: { 3: 0.4 }, forms: { 3: ['tf1', 'tf1', 'cat'] },
    sort: { cats: { g: ['true of a galvanic cell', 'true of galvanic cells', 'Galvanic cell'], e: ['true of an electrolytic cell', 'true of electrolytic cells', 'Electrolytic cell'], b: ['true of both', 'true of both', 'Both'] }, catq: 'Which kind of cell does this describe? {x}', items: [
      ['A spontaneous reaction pushes electrons through the wire.', 'g'], ['Its cell potential is positive.', 'g'], ['The anode is the negative electrode.', 'g'], ['It turns chemical energy into electrical energy.', 'g'],
      ['An outside power supply forces a nonspontaneous reaction.', 'e'], ['The anode is the positive electrode.', 'e'], ['It turns electrical energy into chemical energy.', 'e'], ['It is used to plate silver onto a spoon.', 'e'],
      ['Oxidation happens at the anode.', 'b'], ['Reduction happens at the cathode.', 'b'], ['Electrons flow from the anode to the cathode in the outer circuit.', 'b']] },
    tf: [['Oxidation happens at the anode in both galvanic and electrolytic cells', true], ['The anode is the negative electrode in every kind of cell', false, 'In an electrolytic cell the anode is positive'], ['Electrolysis of molten NaCl makes sodium metal and chlorine gas', true],
      ['In the electrolysis of water, hydrogen forms at the cathode', true], ['Electrolysis needs a voltage at least as large as the cell\'s reverse potential', true], ['Electrolysis of water makes twice as much hydrogen as oxygen, by volume', true]] });

  T('gchem2.batteries-corrosion', { share: { 1: 0.4, 2: 0.4, 3: 0.4 },
    sort: { cats: { p: ['a way to slow corrosion', 'ways to slow corrosion', 'Slows corrosion'], s: ['something that speeds up corrosion', 'things that speed up corrosion', 'Speeds up corrosion'] }, catq: 'Does this slow down or speed up the rusting of iron? {x}', items: [
      ['painting the iron', 'p'], ['coating it with zinc (galvanizing)', 'p'], ['bolting a block of magnesium to it', 'p'], ['keeping it dry', 'p'], ['coating it with oil or grease', 'p'], ['mixing in chromium to make stainless steel', 'p'],
      ['salt water on the surface', 's'], ['damp air', 's'], ['touching a piece of copper', 's'], ['acid rain', 's'], ['scratches through the paint', 's']] },
    tf: [['A battery stores electrons, which flow out when it is connected', false, 'It stores reactants that push electrons around a circuit when they react'], ['Rusting of iron needs both oxygen and water', true], ['Zinc protects iron because zinc is oxidized more easily than iron', true],
      ['A rechargeable battery runs its reaction backward when it is charged', true], ['A fuel cell needs a steady supply of fuel and oxygen', true], ['Cells in series add their voltages', true], ['A dead battery has run out of electrons', false, 'Its reactants are used up'],
      ['Connecting iron to copper protects the iron from rusting', false, 'Iron is oxidized more easily than copper, so it rusts faster'], ['A hydrogen fuel cell gives water as its product', true]] });

  T('gchem2.binding-energy', { share: { 1: 0.35 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['A nucleus has less mass than the separate protons and neutrons it is made of', true], ['A nucleus has more mass than the separate protons and neutrons it is made of', false], ['Energy must be added to split a nucleus into its separate protons and neutrons', true],
      ['The mass defect is converted to energy by E = mc²', true], ['Iron-56 is among the most tightly bound nuclei per nucleon', true], ['Fusion of light nuclei can release energy', true], ['Fission of heavy nuclei can release energy', true],
      ['Binding energy per nucleon is highest for the heaviest nuclei', false, 'It peaks near iron'], ['One atomic mass unit is equivalent to about 931.5 MeV', true]] });

  T('gchem2.coordination-compounds', { share: { 1: 0.4, 3: 0.4 }, forms: { 1: ['tf', 'tf1'], 3: ['tf1', 'tf'] },
    tf: [['The coordination number is the number of donor atoms bonded to the metal', true], ['Ethylenediamine (en) is a bidentate ligand', true], ['In [Co(NH₃)₆]Cl₃, the chloride ions are counter ions outside the brackets', true],
      ['A complex with coordination number 6 is usually octahedral', true], ['A coordination number of 4 can be tetrahedral or square planar', true], ['The coordination number always equals the number of ligands', false, 'A bidentate ligand gives two donor atoms'],
      ['The oxidation state of the metal plus the ligand charges equals the charge of the complex ion', true], ['Water and ammonia are neutral ligands', true], ['Chloride is a neutral ligand', false, 'Chloride carries a −1 charge'], ['EDTA can bind a metal ion at six points', true]] });

  T('gchem2.coordination-isomers', { share: { 1: 0.45 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['Rotating a model of [Co(NH₃)₄Cl₂]⁺ can turn the cis isomer into the trans isomer', false, 'Cis and trans are different compounds'], ['cis- and trans-[Pt(NH₃)₂Cl₂] have the same formula but different properties', true],
      ['A tetrahedral complex MA₂B₂ has no cis and trans isomers', true], ['A square planar complex MA₂B₂ has cis and trans isomers', true], ['Optical isomers are mirror images that cannot be superimposed', true],
      ['Cisplatin, a cancer drug, is the cis isomer', true], ['An octahedral MA₄B₂ complex has two geometric isomers', true], ['An octahedral MA₆ complex has geometric isomers', false, 'All six positions hold the same ligand'],
      ['In a trans isomer, two like ligands are across from each other', true], ['Every complex has an optical isomer', false]] });

  T('gchem2.graphical-order', { share: { 1: 0.3 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['For a zero-order reaction, [A] against time is a straight line', true], ['For a first-order reaction, ln[A] against time is a straight line', true], ['For a second-order reaction, 1/[A] against time is a straight line', true],
      ['For a first-order reaction, the slope of ln[A] against time is −k', true], ['For a second-order reaction, the slope of 1/[A] against time is +k', true], ['For a first-order reaction, [A] against time is a straight line', false, 'It curves; ln[A] is straight'],
      ['The half-life of a first-order reaction does not depend on the starting concentration', true], ['For a zero-order reaction, the slope of [A] against time is +k', false, 'It is −k']] });

  T('gchem2.arrhenius', { share: { 1: 0.3 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['A plot of ln k against 1/T is a straight line with slope −Eₐ/R', true], ['Raising the temperature increases the rate constant', true], ['A larger activation energy makes the rate more sensitive to temperature', true],
      ['A catalyst raises the activation energy', false, 'It lowers it'], ['Temperature must be in kelvins in the Arrhenius equation', true], ['The rate constant does not depend on temperature', false]] });

  T('gchem2.weak-base-ph', { share: { 1: 0.3 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['For a weak base, x from the equilibrium is [OH⁻], so you find pOH first', true], ['pH + pOH = 14.00 at 25 °C', true], ['A solution of a weak base has a pH above 7', true], ['Ammonia is a strong base', false, 'It is a weak base'],
      ['K_b × K_a of the conjugate acid = K_w', true], ['A larger K_b means a stronger base', true], ['For a weak base, x is [H₃O⁺]', false, 'x is [OH⁻]']] });

  T('gchem2.percent-ionization', { share: { 3: 0.3 }, forms: { 3: ['tf1', 'tf'] },
    tf: [['Diluting a weak acid raises its percent ionization', true], ['A stronger weak acid (larger Kₐ) has a higher percent ionization at the same concentration', true], ['Percent ionization = [H₃O⁺] at equilibrium ÷ starting acid concentration × 100', true],
      ['Diluting a weak acid lowers its percent ionization', false], ['The small-x shortcut works when the percent ionization is under about 5%', true], ['Diluting by 100 times raises the percent ionization about 10 times', true]] });
  T('gchem2.pre-equilibrium', { share: { 2: 0.65 } });
  T('gchem2.coupled-reactions', { share: { 2: 0.5 } });
  T('gchem2.coordination-compounds', { share: { 3: 0.5 } });
  T('gchem2.pre-equilibrium', { tf: [['In a pre-equilibrium, a fast reversible step comes before the slow step', true], ['An intermediate\'s concentration can be found from the fast equilibrium', true], ['The final rate law may not contain any intermediates', true],
      ['A fast equilibrium step means its forward and reverse rates are nearly equal', true], ['The observed rate constant can combine constants from several steps', true], ['In a pre-equilibrium mechanism the first step is the slow step', false, 'The first step is fast and reversible'],
      ['The pre-equilibrium approach replaces the intermediate with reactant concentrations', true], ['The rate law of a pre-equilibrium mechanism always has an intermediate in it', false, 'The intermediate is replaced using the equilibrium'],
      ['In a pre-equilibrium, the fast step\'s equilibrium constant is k₁ ÷ k₋₁', true], ['The slow step in a pre-equilibrium mechanism is reversible and fast', false, 'The slow step is the bottleneck that follows the fast equilibrium'],
      ['The observed rate constant for a pre-equilibrium mechanism is often k₂k₁ ÷ k₋₁', true], ['A pre-equilibrium means the whole reaction is at equilibrium', false, 'Only the fast first step is near equilibrium']] });
  T('gchem2.coupled-reactions', { tf: [['Coupling a nonspontaneous reaction to a spontaneous one can make the total ΔG negative', true], ['When reactions are added, their ΔG° values add', true], ['Cells use ATP hydrolysis to drive reactions that would not go on their own', true],
      ['Coupled reactions must share an intermediate or be linked in some way', true], ['Coupling changes the ΔG° of each separate reaction', false, 'Each keeps its own ΔG°; the totals add'], ['Smelting iron ore with carbon is a coupled process in which carbon\'s oxidation drives the reduction of the ore', true],
      ['A coupled process with a total ΔG° of +5 kJ/mol is strongly favored', false], ['When reactions are added, their K values multiply', true], ['Hydrolysis of ATP has a ΔG° of about −30.5 kJ/mol', true],
      ['When reactions are added, their K values add', false, 'K values multiply'], ['Any two reactions in the same flask are automatically coupled', false, 'They must be linked, for example by a shared intermediate'],
      ['Reversing a reaction changes the sign of its ΔG°', true], ['Multiplying a reaction by 2 doubles its ΔG°', true]] });

  /* ---- more topics, so variety does not lean on the extra forms ---- */
  T('gchem2.standard-entropy', { share: { 1: 0.55 }, forms: { 1: ['custom', 'custom', 'tf'] } });
  T('gchem2.manipulating-k', { share: { 1: 0.4, 2: 0.4, 3: 0.3 }, forms: { 1: ['tf', 'tf1'], 2: ['tf', 'tf1'], 3: ['tf1'] },
    tf: [['Reversing a reaction gives a new K equal to 1/K', true], ['Multiplying a reaction by 2 squares K', true], ['Halving a reaction gives the square root of K', true], ['Adding two reactions multiplies their K values', true],
      ['Multiplying a reaction by 2 doubles K', false, 'K is squared'], ['Reversing a reaction gives −K', false, 'It gives 1/K'], ['Adding two reactions adds their K values', false, 'The K values multiply'], ['K changes when the temperature changes', true],
      ['Multiplying a reaction by 3 raises K to the third power', true], ['Reversing a reaction leaves K the same', false]] });
  T('gchem2.weak-acid-ph', { share: { 2: 0.3, 3: 0.4 }, forms: { 2: ['tf', 'tf1'], 3: ['tf1'] },
    tf: [['For a weak acid, the small-x shortcut works when x is under about 5% of the starting concentration', true], ['A weak acid ionizes only partly in water', true], ['At the same concentration, a weak acid has a higher pH than a strong acid', true],
      ['For a weak acid, [H₃O⁺] equals the starting acid concentration', false, 'Only a small share ionizes'], ['A larger Kₐ means a stronger acid', true], ['pH = −log[H₃O⁺]', true], ['Diluting a weak acid lowers its pH', false, 'It raises the pH'],
      ['When the shortcut fails, you solve the quadratic equation', true], ['For a weak acid HA, [A⁻] = [H₃O⁺] at equilibrium (ignoring water)', true], ['A weak acid has a pH of exactly 7', false]] });
  T('gchem2.kinetic-control', { share: { 1: 0.65 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['ΔG° tells you nothing about the activation energy of a reaction', true], ['A reaction with a negative ΔG° may still be too slow to notice', true], ['Diamond turns into graphite at room temperature so slowly that it is not seen', true], ['A large negative ΔG° means a reaction is fast', false, 'ΔG° says nothing about speed'],
      ['A spark can start a hydrogen–oxygen reaction by getting molecules over the activation barrier', true], ['A catalyst changes ΔG° for a reaction', false, 'It only lowers the activation energy'], ['Wood does not burn at room temperature without ignition, though burning is favored', true],
      ['Thermodynamics tells whether a reaction is favored; kinetics tells how fast it goes', true], ['Every favored reaction happens quickly', false], ['Raising the temperature speeds up most reactions', true]] });

  /* ---- auto shares: every level still under 60% on its own also draws from the bank (never lowers a share set above) ---- */
  (function () { var up = function (id, s) { var b = BK[id], tf = (b && b.tf) || []; if (!b) return; if (!(b.sort || b.pair || b.yn || (tf.filter(function (x) { return x[1]; }).length >= 3 && tf.filter(function (x) { return !x[1]; }).length >= 3))) return; b.share = b.share || {}; Object.keys(s).forEach(function (L) { b.share[L] = Math.max(b.share[L] || 0, s[L]); }); };
    up('gchem2.mechanisms', { 1: 0.35 });
    up('gchem2.pre-equilibrium', { 1: 0.35 });
    up('gchem2.manipulating-k', { 1: 0.35 });
    up('gchem2.kp-kc', { 2: 0.35, 3: 0.35 });
    up('gchem2.percent-ionization', { 3: 0.35 });
    up('gchem2.weak-base-ph', { 1: 0.35 });
    up('gchem2.acid-strength-structure', { 1: 0.35 });
    up('gchem2.indicators', { 1: 0.35, 3: 0.35 });
    up('gchem2.comparing-solubility', { 3: 0.35 });
    up('gchem2.complex-ions', { 1: 0.5, 2: 0.35 });
    up('gchem2.entropy-microstates', { 1: 0.35, 2: 0.35 });
    up('gchem2.standard-entropy', { 1: 0.35, 2: 0.35 });
    up('gchem2.kinetic-control', { 3: 0.35 });
    up('gchem2.free-energy-k', { 1: 0.35 });
    up('gchem2.coupled-reactions', { 1: 0.35, 3: 0.35 });
    up('gchem2.electrolytic-cells', { 1: 0.35, 2: 0.35, 3: 0.35 });
    up('gchem2.binding-energy', { 1: 0.5, 3: 0.35 });
    up('gchem2.coordination-compounds', { 1: 0.35, 3: 0.5 });
    up('gchem2.coordination-isomers', { 3: 0.35 });
  })();

  Object.keys(BK).forEach(function (id) {
    var base = ML.getGen(id); if (!base) return;
    ML.gen(id, function (R, ctx) {
      var o = BK[id], L = (ctx && ctx.level) || 1, sh = o.share && o.share[L];
      if (sh && R.chance(sh)) { var p = make(R, o, L); if (p) return p; }
      return base(R, ctx);
    });
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);


/* ---- More forms of the same questions (round 7, "widen"): every topic of this course keeps its own generator above and
   sometimes asks the same skill in another form, built only from problems that generator made, so every answer is the
   generator's own:
   - check an answer: the question, one of its choices as a classmate's answer, and "Is that right?" (Yes / No; not in
     placement, where a guess is too easy; only for single-answer questions with three or more choices);
   - two at once: two different questions of the topic, answered together (short questions only, at most one of them with
     a picture, which then comes first; not in the courses for young children, whose answer box for two parts would
     also show a keypad button they don't need).
   - check a number: a numeric question with a classmate's number, either the right one or a slip learners often make
     (a power of ten, a factor of two, a lost minus sign, off by one), and "Is that right?" (Yes / No; not in placement).
   Placed after the generators and registered with the same ids, so lessons, ids and the engine are unchanged. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var COURSE = 'gchem2', YOUNG = false, VAR = {};
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
  function pairable(p, vizOk) {
    if ((p.viz && !vizOk) || p.unit || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf')) return false;
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
  function numVal(a) { var s = String(a.v).replace(/\s/g, ''), m = /^(-?[\d.]+)\*10\^(-?\d+)$/.exec(s); return m ? +m[1] * Math.pow(10, +m[2]) : (/^-?\d*\.?\d+$/.test(s) ? +s : NaN); }
  function sigOf(a) { var s = String(a.v).split('*')[0].replace(/^-/, '').replace('.', '').replace(/^0+/, ''); return Math.max(2, Math.min(4, s.length || 1)); }
  function numTex(x, n) {
    var y = Number(x.toPrecision(n)), e = y === 0 ? 0 : Math.floor(Math.log10(Math.abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = Number((y / Math.pow(10, e)).toPrecision(n)); return m.toFixed(Math.max(0, n - 1)) + ' \\times 10^{' + e + '}'; }
    return y.toFixed(Math.max(0, n - 1 - e));
  }
  function numCheckable(p) {
    var a = p.a; if (YOUNG || !a || a.t !== 'num' || a.form || a.frac) return false;
    var v = numVal(a); return isFinite(v) && v !== 0 && txt(p.q).length <= 700;
  }
  function numCheckForm(R, p) {
    var a = p.a, v = numVal(a), exact = !a.rtol && Math.round(v) === v, n = sigOf(a), right = R.coin(), w;
    var cands = exact ? [v + 1, v - 1, 2 * v, v + 2].filter(function (x) { return x !== v && (v < 0 || x >= 0); })
      : [10, 0.1, 2, 0.5, 1000, 0.001].concat(v < 0 || /\bsign\b/i.test(txt(p.q)) ? [-1, -1, -1] : []).map(function (k) { return v * k; });
    // a wrong value must really be wrong: it has to fail the problem's own answer check
    cands = cands.filter(function (x) { try { return !ML.check(a, exact ? String(x) : numTex(x, n).replace(' \\times 10^{', 'e').replace('}', ''), { q: p.q, unit: p.unit }).ok; } catch (e) { return false; } });
    if (!cands.length) return null;
    w = R.pick(cands);
    var unit = p.unit ? '&nbsp;' + p.unit : '', pc = a.pct && !p.unit ? '\\%' : '';
    function vTex() { var s = String(a.v).replace(/\s/g, ''), m = /^(-?[\d.]+)\*10\^(-?\d+)$/.exec(s); return m ? m[1] + ' \\times 10^{' + m[2] + '}' : s; } // the answer exactly as the problem gives it
    function tex(x) { return '$' + (x === v ? vTex() : exact ? String(x) : numTex(x, n)) + pc + '$' + unit; }
    var shown = right ? v : w;
    var out = { q: p.q + '<p>A classmate answered: <b>' + tex(shown) + '</b></p><p>Is that right?</p>', a: { t: 'mc', choices: ['Yes', 'No'], v: right ? 0 : 1, keep: true },
      hint: p.hint || 'Work it out yourself first, then compare.',
      steps: (p.steps || []).concat([right ? 'So <b>yes</b>, the classmate is right.' : 'So <b>no</b>: the answer is ' + tex(v) + ', not ' + tex(shown) + '.']) };
    if (p.viz) out.viz = p.viz;
    if (p.nolint) out.nolint = p.nolint;
    return out;
  }
  function pairForm(R, id, ctx, p, base) {
    for (var t = 0; t < 6; t++) {
      var R2 = ML.rand(id + '#pair#' + R.int(0, 999999999)), p2;
      try { p2 = base(R2, ctx); } catch (e) { return null; }
      if (p2 && p2.a && p2.a.t === 'mc' && !p2.a.choices && Array.isArray(p2.choices)) p2.a.choices = p2.choices;
      if (!p2 || !pairable(p2, !p.viz) || sameQ(p, p2)) continue;
      if (p2.viz) { var t2 = p; p = p2; p2 = t2; } // the question with the picture comes first
      var RM = /<p class="(?:ar|wr|gg)-readme">[^]*?<\/p>/, rm = (p.q.match(RM) || p2.q.match(RM) || [''])[0];
      var out = { q: rm + '<p>Answer both questions.</p><ol class="ml-two"><li>' + p.q.replace(RM, '') + '</li><li>' + p2.q.replace(RM, '') + '</li></ol>',
        a: { t: 'multi', parts: [{ label: '1.', a: p.a }, { label: '2.', a: p2.a }] },
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
      if (pairable(p, true) && !YOUNG) forms.push('pair');
      if (mode !== 'place' && numCheckable(p)) forms.push('num');
      if (!forms.length) return p;
      var f = R.pick(forms), out = f === 'check' ? checkForm(R, p) : f === 'num' ? numCheckForm(R, p) : pairForm(R, id, ctx, p, base);
      return out || p;
    };
    fn._forms = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : null);
