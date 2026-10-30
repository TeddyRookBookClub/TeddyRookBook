/* Chemistry Ladder generators: General Chemistry 1 (course key gchem1).
   One generator per topic in data/chemistry/topics/gchem1.json, registered with MathLadder.gen.
   Built from the source parts in the course builder's work dir (gen/*.js, concatenated in order).

   Conventions (the Chemistry Ladder overview): atomic masses to two decimals (IUPAC values as published by NIST);
   N_A = 6.022e23 /mol, h = 6.626e-34 J·s, c = 3.00e8 m/s, R = 8.314 J/(mol·K) = 0.08206 L·atm/(mol·K),
   E_n(H) = −2.18e-18 J / n², 1 L·atm = 101.3 J, K = °C + 273.15, STP = 0 °C and 1 atm (22.4 L/mol);
   q > 0 into the system, w > 0 done on the system, ΔU = q + w, w = −P_ext ΔV.
   Numeric answers carry `unit` (shown beside the box) and `rtol` (0.01 to 0.02; the shown answer has 3 significant
   figures). Every problem also carries `chk`: its setup in machine-readable form, so the course's node tests can
   recompute each answer by an independent route. The runner ignores it. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, Q = ML.Q, U = ML.util, M = Math;
  // ------------------------------------------------------------------ constants (overview)
  var NA = 6.022e23, HP = 6.626e-34, CL = 3.00e8, RJ = 8.314, RL = 0.08206, RH = 2.18e-18, LATM = 101.3;
  // atomic masses, two decimals (IUPAC standard atomic weights as published by NIST)
  var AM = { H: 1.01, He: 4.00, Li: 6.94, Be: 9.01, B: 10.81, C: 12.01, N: 14.01, O: 16.00, F: 19.00, Ne: 20.18, Na: 22.99,
    Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.07, Cl: 35.45, Ar: 39.95, K: 39.10, Ca: 40.08, Cr: 52.00, Mn: 54.94,
    Fe: 55.85, Co: 58.93, Ni: 58.69, Cu: 63.55, Zn: 65.38, Br: 79.90, Kr: 83.80, Sr: 87.62, Ag: 107.87, Sn: 118.71, I: 126.90,
    Xe: 131.29, Ba: 137.33, Au: 196.97, Hg: 200.59, Pb: 207.2 };

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
        var vis = tex.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\mathrm\{([^}]*)\}/g, '$1').replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|bigg|Bigg|bigl|bigr|operatorname|lvert|rvert|vec|hat|bar)\b/g, '').replace(/\\(ln|log|exp)\b/g, 'xx').replace(/\\[a-zA-Z]+/g, 'x').replace(/\\[,;: ]/g, ' ').replace(/[{}^_]/g, '').replace(/\s+/g, ' ').length;
        if (vis > limit) { out += '$$' + tex + '$$'; i = k + 1; if (s[i] === '.' || s[i] === ',') i++; continue; }
        out += '$' + tex + '$';
        i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  // "A $8.0 g" -> "An $8.0 g" (numbers read aloud starting with a vowel sound: 8…, 11, 18)
  function article(s) { return typeof s !== 'string' ? s : s.replace(/(^|[\s(>])(A|a) (\$(?:8|1[18](?![\d.,{])))/g, '$1$2n $3'); }
  // register a generator; long inline math in the question, steps and hint becomes display math
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
  /* variety helpers: "which one is …" and "choose all that are …" from one bank, so distractors combine */
  function vOne(R, pool, ok, n) { var g = pool.filter(ok), b = pool.filter(function (x) { return !ok(x); }), r = R.pick(g), it = R.shuffle([r].concat(R.sample(b, n - 1))); return { items: it, v: it.indexOf(r), right: r }; }
  function vAll(R, pool, ok, n) {
    var g = pool.filter(ok), b = pool.filter(function (x) { return !ok(x); }), k = R.int(1, M.min(n - 1, g.length)); if (b.length < n - k) k = n - b.length;
    var it = R.shuffle(R.sample(g, k).concat(R.sample(b, n - k)));
    return { items: it, v: it.map(function (x, i) { return ok(x) ? i : -1; }).filter(function (i) { return i >= 0; }) };
  }
  function MCA(items, v) { return { t: 'mc', choices: items, v: v }; }
  function fix(x) { return Number(Number(x).toPrecision(12)) + 0; }
  function sgf(x, n) { // x rounded to n significant figures (a number)
    if (x === 0 || !isFinite(x)) return x; var sgn = x < 0 ? -1 : 1, a = M.abs(x), e = M.floor(M.log10(a)); var f = M.pow(10, n - 1 - e);
    return sgn * (e > n ? fix(M.round(fix(a / M.pow(10, e - n + 1))) * M.pow(10, e - n + 1)) : fix(M.round(fix(a * f)) / f));
  }
  function rd(x, dp) { var f = M.pow(10, dp), sgn = x < 0 ? -1 : 1; return sgn * fix(M.round(fix(M.abs(x) * f)) / f); }
  function rat(x) { if (!isFinite(x)) return null; for (var d = 1; d <= 60; d++) { var n = M.round(x * d); if (M.abs(n / d - x) < 1e-9 * M.max(1, M.abs(x))) return Q(n, d); } return null; }
  function longDec(x) { var s = String(fix(x)); return /\.\d{7,}/.test(s); }
  function plainNum(x) { // a plain string for a number without float noise ("0.000123", "12500")
    x = fix(x); var s = String(x); if (/e/.test(s)) s = Q.from(s).toDec(30).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s;
  }
  // the value for an answer spec: n significant figures; scientific form a*10^k outside 0.001 … 10^6
  function sfStr(x, n) { // trailing zeros kept, so the shown answer has n significant figures (2.50, 0.05000)
    n = n || 3; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(y / M.pow(10, e)); return m.toFixed(M.max(0, n - 1)) + '*10^' + e; }
    return y.toFixed(M.max(0, n - 1 - e));
  }
  // TeX for a computed number shown with n significant figures, trailing zeros kept (2.50, 1.00 × 10^{-3})
  function fx(x, n) {
    n = n || 3; if (!isFinite(x)) return '\\infty'; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 5 || e <= -4) { var m = fix(y / M.pow(10, e)); return T.num(m.toFixed(M.max(0, n - 1))) + ' \\times 10^{' + e + '}'; }
    var dp = M.max(0, n - 1 - e), s = M.abs(y) >= 10000 ? T.commas(y) : y.toFixed(dp);
    return s.replace(/^-/, '-');
  }
  // the same with trailing zeros dropped (for intermediate values)
  function fz(x, n) { return fx(x, n).replace(/(\.\d*?)0+(?=$|\s)/, '$1').replace(/\.(?=$|\s)/, ''); }
  // TeX for a given (exact) number: 2.5 -> "2.5", 6.626e-34 -> "6.626 \times 10^{-34}", 12000 -> "12{,}000"
  function gx(x) {
    x = fix(x); if (x === 0) return '0';
    var e = M.floor(M.log10(M.abs(x)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(x / M.pow(10, e)); return T.num(m) + ' \\times 10^{' + e + '}'; }
    return M.abs(x) >= 10000 ? T.commas(x) : T.num(x);
  }
  // a given number with a fixed number of decimals (25.0, 0.100)
  function gd(x, dp) { return T.dec(x, dp); }
  // ------------------------------------------------------------------ units: [plain (for p.unit), TeX]
  var UN = {
    g: ['g', '\\text{g}'], kg: ['kg', '\\text{kg}'], mg: ['mg', '\\text{mg}'], mol: ['mol', '\\text{mol}'], mmol: ['mmol', '\\text{mmol}'],
    L: ['L', '\\text{L}'], mL: ['mL', '\\text{mL}'], M: ['M', '\\text{M}'], molkg: ['mol/kg', '\\text{mol/kg}'], gmol: ['g/mol', '\\text{g/mol}'],
    gL: ['g/L', '\\text{g/L}'], gcm3: ['g/cm³', '\\text{g/cm}^3'], gmL: ['g/mL', '\\text{g/mL}'], atm: ['atm', '\\text{atm}'], kPa: ['kPa', '\\text{kPa}'],
    mmHg: ['mmHg', '\\text{mmHg}'], torr: ['torr', '\\text{torr}'], K: ['K', '\\text{K}'], C: ['°C', '^\\circ\\text{C}'], J: ['J', '\\text{J}'], kJ: ['kJ', '\\text{kJ}'],
    kJmol: ['kJ/mol', '\\text{kJ/mol}'], Jmol: ['J/mol', '\\text{J/mol}'], JgC: ['J/(g·°C)', '\\text{J/(g·°C)}'], JC: ['J/°C', '\\text{J/°C}'], kJC: ['kJ/°C', '\\text{kJ/°C}'],
    nm: ['nm', '\\text{nm}'], m: ['m', '\\text{m}'], pm: ['pm', '\\text{pm}'], cm: ['cm', '\\text{cm}'], Hz: ['Hz', '\\text{Hz}'], s: ['s', '\\text{s}'], ms: ['m/s', '\\text{m/s}'],
    ppm: ['ppm', '\\text{ppm}'], Latm: ['L·atm', '\\text{L·atm}'], JmolK: ['J/(mol·K)', '\\text{J/(mol·K)}'], MJmol: ['MJ/mol', '\\text{MJ/mol}'],
    Matm: ['mol/(L·atm)', '\\text{mol/(L·atm)}'], none: ['', '']
  };
  function ut(k) { return (UN[k] || [k, '\\text{' + k + '}'])[1]; }
  function up(k) { return (UN[k] || [k])[0]; }
  function sp(k) { return k === 'C' || k === 'none' ? '' : '\\ '; }
  function qx(x, k, n) { return fx(x, n) + sp(k) + ut(k); }       // a computed quantity: "12.5\ \text{g}"
  function qz(x, k, n) { return fz(x, n) + sp(k) + ut(k); }       // the same without trailing zeros
  function qg(x, k) { return gx(x) + sp(k) + ut(k); }               // a given quantity, exact
  function mmx(x) { x = fix(x); var d = (String(x).split('.')[1] || '').length; return d > 2 ? gx(x) : T.dec(x, 2); } // molar masses to 2 decimals (32.00)
  function qm(x) { return mmx(x) + '\\ \\text{g/mol}'; }
  function qd(x, dp, k) { return gd(x, dp) + sp(k) + ut(k); }       // a given quantity with fixed decimals
  // ------------------------------------------------------------------ formulas
  // parse "Ca(NO3)2", "CuSO4·5H2O", "SO4^2-", "Fe^3+", "NH4+" -> { atoms: {Ca:1, N:2, O:6}, charge }
  function parseF(f) {
    var s = String(f).replace(/\((s|l|g|aq)\)$/, ''), charge = 0, m = /\^?(\d*)([+-])$/.exec(s);
    if (m && /\^/.test(s)) { charge = (m[1] ? +m[1] : 1) * (m[2] === '-' ? -1 : 1); s = s.slice(0, s.lastIndexOf('^')); }
    else if (/[+-]$/.test(s)) { charge = s.slice(-1) === '-' ? -1 : 1; s = s.slice(0, -1); }
    var parts = s.split(/[·*]/), atoms = {};
    parts.forEach(function (p) {
      var mult = 1, mm = /^(\d+)(.*)$/.exec(p); if (mm) { mult = +mm[1]; p = mm[2]; }
      var stack = [{}], i = 0;
      while (i < p.length) {
        var ch = p[i];
        if (ch === '(' || ch === '[') { stack.push({}); i++; continue; }
        if (ch === ')' || ch === ']') { i++; var nd = /^\d+/.exec(p.slice(i)), k = nd ? +nd[0] : 1; if (nd) i += nd[0].length; var top = stack.pop(), dst = stack[stack.length - 1]; Object.keys(top).forEach(function (e) { dst[e] = (dst[e] || 0) + top[e] * k; }); continue; }
        var em = /^([A-Z][a-z]?)(\d*)/.exec(p.slice(i)); if (!em) throw new Error('bad formula ' + f);
        var cur = stack[stack.length - 1]; cur[em[1]] = (cur[em[1]] || 0) + (em[2] ? +em[2] : 1); i += em[0].length;
      }
      Object.keys(stack[0]).forEach(function (e) { atoms[e] = (atoms[e] || 0) + stack[0][e] * mult; });
    });
    return { atoms: atoms, charge: charge };
  }
  // molar mass from the two-decimal table, rounded to 2 decimals (what a learner gets by adding)
  function mm(f) { var a = parseF(f).atoms, s = 0; Object.keys(a).forEach(function (e) { if (!(e in AM)) throw new Error('no mass for ' + e); s += AM[e] * a[e]; }); return rd(s, 2); }
  // TeX for a formula: "Ca(NO3)2" -> \mathrm{Ca(NO_3)_2}; "SO4^2-" -> \mathrm{SO_4^{2-}}; "CuSO4·5H2O"; "NaCl(aq)"
  function ft(f) {
    var s = String(f), st = '', m = /\((s|l|g|aq)\)$/.exec(s); if (m) { st = '(' + m[1] + ')'; s = s.slice(0, m.index); }
    var ch = '', cm = /\^(\d*[+-])$/.exec(s);
    if (cm) { ch = cm[1]; s = s.slice(0, cm.index); } else if (/[A-Za-z\d)][+-]$/.test(s)) { ch = s.slice(-1); s = s.slice(0, -1); }
    var body = s.replace(/·|\*/g, '\\cdot ').replace(/([A-Za-z)\]])(\d+)/g, '$1_{$2}').replace(/_\{(\d)\}/g, '_$1');
    if (ch) body += '^{' + ch + '}';
    return '\\mathrm{' + body + st + '}';
  }
  function F(f) { return '$' + ft(f) + '$'; }  // a formula in text
  // TeX for an equation: "2H2(g) + O2(g) -> 2H2O(l)", "<=>" for equilibrium; leading digits are coefficients
  function eqT(s) {
    var arrow = /<=>/.test(s) ? ' \\rightleftharpoons ' : ' \\to ', sides = s.split(/\s*(?:<=>|->|→)\s*/);
    return sides.map(function (side) {
      return side.split(/\s+\+\s+/).map(function (t) { var m = /^(\d+(?:\/\d+)?)\s*(.*)$/.exec(t.trim()); if (m && /^[A-Z(\[]/.test(m[2])) { var c = m[1].indexOf('/') > 0 ? '\\tfrac{' + m[1].split('/')[0] + '}{' + m[1].split('/')[1] + '}' : m[1]; return c + '\\,' + ft(m[2]); } return t.trim() === 'e-' ? 'e^-' : ft(t.trim()); }).join(' + ');
    }).join(arrow);
  }
  // ------------------------------------------------------------------ answers and problems
  function ans(x, rtol, n) { return { t: 'num', v: sfStr(x, n || 3), rtol: rtol || 0.01 }; }
  function exact(v) { return { t: 'num', v: String(v) }; }
  function pctAns(x, rtol, n) { return { t: 'num', v: sfStr(x, n || 3), rtol: rtol || 0.01, pct: true }; }
  function mc(correct, wrongs) { return U.mc(correct, wrongs, 4); }
  function mcK(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function fAns(v) { return { t: 'formula', v: (Array.isArray(v) ? v : [v]).map(function (s) { return /\^/.test(s) || !/[A-Za-z\d)][+-]$/.test(s) ? s : s.slice(0, -1) + '^' + s.slice(-1); }) }; }
  function multi(parts) { return { t: 'multi', parts: parts.map(function (p) { var o = { label: p[0], a: p[1] }; if (p[2] && p[2] !== 'none') o.unit = up(p[2]); return o; }) }; }
  // P(q, a, steps, hint, unitKey, chk, viz)
  function P(q, a, steps, hint, unit, chk, viz) {
    var p = { q: q, a: a, steps: steps };
    if (hint) p.hint = hint;
    if (unit && unit !== 'none' && a.t === 'num') p.unit = up(unit);
    if (chk) p.chk = chk;
    if (viz) p.viz = viz;
    // electron configurations (1s^2) are not a coefficient of 1
    if (/(^|[^\d.])1s\^/.test(q + steps.join(' ') + (a.choices ? a.choices.join(' ') : ''))) p.nolint = ['1x'];
    return p;
  }
  // ------------------------------------------------------------------ TeX helpers
  function fr(a, b) { return '\\frac{' + a + '}{' + b + '}'; }
  function dfr(a, b) { return '\\dfrac{' + a + '}{' + b + '}'; }
  function pn(x) { return x < 0 ? '(' + gx(x) + ')' : gx(x); }
  function pf(x, n) { return x < 0 ? '(' + fx(x, n) + ')' : fx(x, n); }
  function sg(x) { return x > 0 ? '+' + gx(x) : gx(x); }           // a signed given number: "+52.3", "-110.5"
  function sgx(x, n) { return x > 0 ? '+' + fx(x, n) : fx(x, n); } // a signed computed number
  function ord(n) { return U.ordinal(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function lst(a) { return U.list(a); }
  function nk(T0) { return fix(T0 + 273.15); }                         // °C -> K


  // ================================================================== UNIT 1: COMPOSITION AND MASS SPECTRA
  var ENAME = { H: 'hydrogen', C: 'carbon', N: 'nitrogen', O: 'oxygen', S: 'sulfur', Fe: 'iron', Cu: 'copper', P: 'phosphorus', Cl: 'chlorine', Mn: 'manganese', Cr: 'chromium',
    Na: 'sodium', K: 'potassium', Br: 'bromine', Ca: 'calcium', Mg: 'magnesium', Ag: 'silver', Li: 'lithium', B: 'boron', Ga: 'gallium', Rb: 'rubidium', Sb: 'antimony', Si: 'silicon', Ne: 'neon', Ir: 'iridium', Tl: 'thallium' , Al: 'aluminum' , Sn: 'tin', Au: 'gold', Zn: 'zinc', Ni: 'nickel', Pb: 'lead', Ti: 'titanium', Co: 'cobalt', Hg: 'mercury', Pt: 'platinum', W: 'tungsten', V: 'vanadium', Mo: 'molybdenum' };
  // element pairs with several compounds: [X, Y, [[formula, atoms of X, atoms of Y], …]]
  var MP = [
    ['C', 'O', [['CO', 1, 1], ['CO2', 1, 2]]],
    ['N', 'O', [['N2O', 2, 1], ['NO', 1, 1], ['N2O3', 2, 3], ['NO2', 1, 2], ['N2O5', 2, 5]]],
    ['S', 'O', [['SO2', 1, 2], ['SO3', 1, 3]]],
    ['Fe', 'O', [['FeO', 1, 1], ['Fe2O3', 2, 3]]],
    ['Cu', 'O', [['Cu2O', 2, 1], ['CuO', 1, 1]]],
    ['P', 'Cl', [['PCl3', 1, 3], ['PCl5', 1, 5]]],
    ['H', 'O', [['H2O', 2, 1], ['H2O2', 2, 2]]],
    ['C', 'H', [['C2H2', 2, 2], ['C2H4', 2, 4], ['C2H6', 2, 6], ['CH4', 1, 4]]],
    ['Mn', 'O', [['MnO', 1, 1], ['Mn2O3', 2, 3], ['MnO2', 1, 2]]],
    ['Cr', 'O', [['CrO', 1, 1], ['Cr2O3', 2, 3], ['CrO3', 1, 3]]]
  ];
  function ratioTex(q) { return q.isInt() ? q.toTex() : q.n + ' : ' + q.d; }

  G('gchem1.mass-laws', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['multi1', 'multi1', 'definite'], ['multi2', 'multi2', 'definite', 'same'], ['multi2', 'same', 'which', 'multi2']));
    if (shape === 'definite') {
      var cmp = R.pick([['MgO', 'Mg'], ['CaO', 'Ca'], ['Al2O3', 'Al'], ['NaCl', 'Na'], ['CO2', 'C'], ['SO3', 'S'], ['H2O', 'H'], ['Fe2O3', 'Fe'], ['CuO', 'Cu'], ['CaCl2', 'Cl']]);
      var fr0 = AM[cmp[1]] * parseF(cmp[0]).atoms[cmp[1]] / mm(cmp[0]);
      var m1 = R.int(4, 50) / 2, e1 = sgf(m1 * fr0, 3), m2 = R.int(5, 150) / 2;
      var e2 = m2 * e1 / m1;
      return P('A $' + qx(m1, 'g') + '$ sample of pure ' + F(cmp[0]) + ' contains $' + qx(e1, 'g') + '$ of ' + ENAME[cmp[1]] + '. How many grams of ' + ENAME[cmp[1]] + ' are in $' + qx(m2, 'g') + '$ of the same compound?',
        ans(e2, 0.01),
        ['A pure compound has a fixed mass fraction of each element (the law of definite proportions).', 'Fraction of ' + ENAME[cmp[1]] + ': $' + dfr(fx(e1), fx(m1)) + ' = ' + fx(e1 / m1, 4) + '$.', '$' + qx(m2, 'g') + ' \\times ' + fx(e1 / m1, 4) + ' = ' + qx(e2, 'g') + '$ of ' + ENAME[cmp[1]] + '.'],
        'The mass fraction of each element is the same in every sample.', 'g', { k: 'definite', m1: m1, e1: e1, m2: m2 });
    }
    var pr = R.pick(shape === 'which' ? MP.filter(function (q) { return q[2].length >= 3; }) : MP), X = pr[0], Y = pr[1], two = R.sample(pr[2], 2).sort(function (a, b) { return a[2] / a[1] - b[2] / b[1]; }), A = two[0], B = two[1];
    var rA = Q(A[2], A[1]), rB = Q(B[2], B[1]), ratio = rB.div(rA);           // Y atoms per X atom, B over A
    var yPerX = function (c) { return c[2] * AM[Y] / (c[1] * AM[X]); };
    if (shape === 'multi1') { // the same mass of X in both
      var mX = R.pick([1.00, 2.00, 3.00, 5.00, 10.0]), yA = sgf(mX * yPerX(A), 4), yB = sgf(mX * yPerX(B), 4);
      return P('Two compounds contain only ' + ENAME[X] + ' and ' + ENAME[Y] + '. In compound A, $' + qx(mX, 'g') + '$ of ' + ENAME[X] + ' is combined with $' + qx(yA, 'g', 4) + '$ of ' + ENAME[Y] + '. In compound B, the same $' + qx(mX, 'g') + '$ of ' + ENAME[X] + ' is combined with $' + qx(yB, 'g', 4) + '$ of ' + ENAME[Y] + '. What is the ratio of the mass of ' + ENAME[Y] + ' in B to the mass in A? (A fraction or a decimal is fine.)',
        { t: 'num', v: ratio.toPlain(), rtol: 0.01 },
        ['The mass of ' + ENAME[X] + ' is the same in both, so compare the ' + ENAME[Y] + ' directly.', '$' + dfr(fx(yB, 4), fx(yA, 4)) + ' = ' + fx(yB / yA, 3) + '$' + (ratio.isInt() ? '' : ', which is $' + ratio.toTex() + '$, a ratio of $' + ratio.n + ' : ' + ratio.d + '$') + '.',
          'A small whole-number ratio, as the law of multiple proportions says. (The compounds are ' + F(A[0]) + ' and ' + F(B[0]) + '.)'],
        'Divide the larger mass of ' + ENAME[Y] + ' by the smaller.', null, { k: 'multi', X: X, Y: Y, A: A[0], B: B[0], mXA: mX, mYA: yA, mXB: mX, mYB: yB });
    }
    if (shape === 'multi2' || shape === 'which') {
      var xa = R.pick([1.25, 1.50, 2.40, 3.20, 4.50, 6.00]), xb = R.pick([0.80, 1.75, 2.00, 2.80, 3.60, 5.00].filter(function (v) { return v !== xa; }));
      var ya = sgf(xa * yPerX(A), 3), yb = sgf(xb * yPerX(B), 3), qa = ya / xa, qb = yb / xb;
      var intro = 'Two compounds contain only ' + ENAME[X] + ' and ' + ENAME[Y] + '. A sample of compound A holds $' + qx(xa, 'g') + '$ of ' + ENAME[X] + ' and $' + qx(ya, 'g') + '$ of ' + ENAME[Y] + '. A sample of compound B holds $' + qx(xb, 'g') + '$ of ' + ENAME[X] + ' and $' + qx(yb, 'g') + '$ of ' + ENAME[Y] + '. ';
      var st = ['The samples hold different masses of ' + ENAME[X] + ', so first find the ' + ENAME[Y] + ' per gram of ' + ENAME[X] + '.',
        'A: $' + dfr(fx(ya), fx(xa)) + ' = ' + fx(qa, 4) + '\\ \\text{g}$; B: $' + dfr(fx(yb), fx(xb)) + ' = ' + fx(qb, 4) + '\\ \\text{g}$.',
        'Ratio B to A: $' + dfr(fx(qb, 4), fx(qa, 4)) + ' = ' + fx(qb / qa, 3) + '$' + (ratio.isInt() ? '' : ' $= ' + ratio.toTex() + '$') + '.'];
      if (shape === 'multi2') {
        return P(intro + 'For a fixed mass of ' + ENAME[X] + ', what is the ratio of the mass of ' + ENAME[Y] + ' in B to that in A? (A fraction or a decimal is fine.)',
          { t: 'num', v: ratio.toPlain(), rtol: 0.015 },
          st.concat(['That is a ratio of small whole numbers ($' + ratio.n + ' : ' + ratio.d + '$), as the law of multiple proportions predicts.']),
          'Divide each mass of ' + ENAME[Y] + ' by its mass of ' + ENAME[X] + ' first.', null, { k: 'multi', X: X, Y: Y, A: A[0], B: B[0], mXA: xa, mYA: ya, mXB: xb, mYB: yb });
      }
      // which pair of formulas fits?
      var others = [];
      pr[2].forEach(function (c1) { pr[2].forEach(function (c2) { var r12 = Q(c2[2], c2[1]).div(Q(c1[2], c1[1])); if (c1 !== c2 && !r12.eq(ratio)) others.push(F(c1[0]) + ' and ' + F(c2[0])); }); });
      var wrong = others.filter(function (s, i, a) { return a.indexOf(s) === i; });
      return P(intro + 'Which pair of formulas could compounds A and B have, in that order?',
        mc(F(A[0]) + ' and ' + F(B[0]), R.sample(wrong, M.min(3, wrong.length))),
        st.concat(['Compound B has $' + ratio.toTex() + '$ times as many ' + ENAME[Y] + ' atoms per ' + ENAME[X] + ' atom as A: ' + F(A[0]) + ' has $' + rA.toTex() + '$ and ' + F(B[0]) + ' has $' + rB.toTex() + '$.']),
        'Find the ratio first, then compare atoms of ' + ENAME[Y] + ' per atom of ' + ENAME[X] + ' in each choice.', null, { k: 'which' });
    }
    // same compound or not?
    var same = R.coin(), C2 = same ? A : B, x1 = R.pick([1.20, 2.00, 2.50, 4.00]), x2 = R.pick([0.60, 1.50, 3.00, 5.00]);
    var y1 = sgf(x1 * yPerX(A), 3), y2 = sgf(x2 * yPerX(C2), 3);
    return P('Sample 1 of a compound holds $' + qx(x1, 'g') + '$ of ' + ENAME[X] + ' and $' + qx(y1, 'g') + '$ of ' + ENAME[Y] + '. Sample 2 holds $' + qx(x2, 'g') + '$ of ' + ENAME[X] + ' and $' + qx(y2, 'g') + '$ of ' + ENAME[Y] + '. True or false: the two samples could be the same compound.',
      tf(same),
      ['Compare ' + ENAME[Y] + ' per gram of ' + ENAME[X] + '. Sample 1: $' + dfr(fx(y1), fx(x1)) + ' = ' + fx(y1 / x1, 3) + '$. Sample 2: $' + dfr(fx(y2), fx(x2)) + ' = ' + fx(y2 / x2, 3) + '$.',
        same ? 'The ratios match, so they can be the same compound (' + F(A[0]) + ').' : 'The ratios differ, so they are different compounds (' + F(A[0]) + ' and ' + F(C2[0]) + '). A pure compound has one fixed mass ratio.'],
      'A pure compound has one fixed mass ratio of its elements.', null, { k: 'same', same: same, r1: y1 / x1, r2: y2 / x2 });
  });

  // isotopes (masses in u to 2 decimals and abundances in atom %, from NIST "Atomic Weights and Isotopic Compositions")
  var ISO = {
    B: [[10.01, 19.9], [11.01, 80.1]], Cl: [[34.97, 75.76], [36.97, 24.24]], Cu: [[62.93, 69.15], [64.93, 30.85]], Br: [[78.92, 50.69], [80.92, 49.31]],
    Ga: [[68.93, 60.11], [70.92, 39.89]], Li: [[6.02, 7.59], [7.02, 92.41]], Ag: [[106.91, 51.84], [108.90, 48.16]], Rb: [[84.91, 72.17], [86.91, 27.83]],
    Sb: [[120.90, 57.21], [122.90, 42.79]], Ir: [[190.96, 37.3], [192.96, 62.7]], Tl: [[202.97, 29.52], [204.97, 70.48]],
    Mg: [[23.99, 78.99], [24.99, 10.00], [25.98, 11.01]], Si: [[27.98, 92.22], [28.98, 4.69], [29.97, 3.09]], Ne: [[19.99, 90.48], [20.99, 0.27], [21.99, 9.25]]
  };
  function isoViz(list) { return { name: 'ch-massspec', opts: { isotopes: list.map(function (i) { return { m: i[0], ab: i[1] }; }), quiet: true, edit: true } }; } // the beam starts at the tallest peak; the learner can drag it, with no readout
  function wavg(list) { var s = 0, t = 0; list.forEach(function (i) { s += i[0] * i[1]; t += i[1]; }); return s / t; }

  G('gchem1.mass-spectra', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['pct', 'pct', 'concept'], ['pct', 'heights', 'reverse', 'concept'], ['heights', 'reverse', 'reverse', 'concept']));
    var el = R.pick(shape === 'reverse' ? ['B', 'Cl', 'Cu', 'Br', 'Ga', 'Li', 'Ag', 'Rb', 'Sb', 'Ir', 'Tl'] : Object.keys(ISO)), iso = ISO[el], name = ENAME[el];
    if (shape !== 'reverse' && R.chance(0.5)) { // a made-up element: two or three isotopes, masses to 2 decimals, abundances that add to 100
      var mA = R.int(20, 140) + R.int(-9, 9) / 100, three = shape === 'heights' && R.coin(), p1 = three ? R.int(40, 80) : R.int(12, 88) + R.int(0, 9) / 10, p2 = three ? R.int(5, 95 - p1) : rd(100 - p1, 1);
      iso = [[rd(mA, 2), p1], [rd(mA + R.pick([1, 2]) + R.int(-4, 4) / 100, 2), p2]]; if (three) iso.push([rd(iso[1][0] + 1 + R.int(-3, 3) / 100, 2), 100 - p1 - p2]);
      name = 'element X';
    }
    if (shape === 'pct') {
      var avg = wavg(iso);
      return P(cap(name) + '\'s mass spectrum shows ' + iso.length + ' peaks: ' + lst(iso.map(function (i) { return '$' + gd(i[0], 2) + '\\ \\text{u}$ (' + gx(i[1]) + '% of the atoms)'; })) + '. Find the average atomic mass of ' + name + '.',
        ans(avg, 0.0015, 4),
        ['Change each percent to a fraction and multiply it by the isotope\'s mass.', '$\\bar{m} = ' + iso.map(function (i) { return gd(i[0], 2) + '(' + gx(i[1] / 100) + ')'; }).join(' + ') + '$', '$\\bar{m} = ' + iso.map(function (i) { return fx(i[0] * i[1] / 100, 4); }).join(' + ') + ' = ' + fx(avg, 4) + '\\ \\text{u}$. It lies between the peaks, nearest the tallest.'],
        'Weight each mass by its fraction of the atoms, then add.', 'u', { k: 'avg', iso: iso }, isoViz(iso));
    }
    if (shape === 'heights') {
      var top = M.max.apply(null, iso.map(function (i) { return i[1]; })), hts = iso.map(function (i) { return sgf(100 * i[1] / top, 4); }), tot = hts.reduce(function (a, b) { return a + b; }, 0);
      var list = iso.map(function (i, k) { return [i[0], hts[k]]; }), avg2 = wavg(list);
      return P(cap(name) + '\'s mass spectrum shows peaks at ' + lst(iso.map(function (i) { return '$' + gd(i[0], 2) + '\\ \\text{u}$'; })) + ' with heights ' + lst(hts.map(function (x) { return '$' + gx(x) + '$'; })) + ' (the tallest peak set to 100). Find the average atomic mass.',
        ans(avg2, 0.0015, 4),
        ['Heights are proportional to numbers of atoms. Total: $' + hts.map(gx).join(' + ') + ' = ' + gx(rd(tot, 2)) + '$.', 'Fractions: ' + hts.map(function (x) { return '$' + fx(x / tot, 4) + '$'; }).join(', ') + '.', '$\\bar{m} = ' + list.map(function (i) { return gd(i[0], 2) + '(' + fx(i[1] / tot, 4) + ')'; }).join(' + ') + ' = ' + fx(avg2, 4) + '\\ \\text{u}$.'],
        'Divide each height by the total of the heights to get fractions.', 'u', { k: 'avg', iso: list }, isoViz(list));
    }
    if (shape === 'reverse') {
      var m1 = iso[0][0], m2 = iso[1][0], av = rd(wavg(iso), 2), x = (m2 - av) / (m2 - m1), askLight = R.coin(), want = askLight ? x : 1 - x;
      var A1 = M.round(m1), A2 = M.round(m2);
      return P('The average atomic mass of ' + name + ' is $' + gd(av, 2) + '\\ \\text{u}$. Its two isotopes, ' + name + '-' + A1 + ' and ' + name + '-' + A2 + ', have masses $' + gd(m1, 2) + '\\ \\text{u}$ and $' + gd(m2, 2) + '\\ \\text{u}$. What percent of ' + name + ' atoms are ' + name + '-' + (askLight ? A1 : A2) + '?',
        pctAns(want * 100, 0.01),
        ['Let $x$ be the fraction of ' + name + '-' + A1 + '; the fraction of ' + name + '-' + A2 + ' is $1 - x$.', '$' + gd(m1, 2) + 'x + ' + gd(m2, 2) + '(1 - x) = ' + gd(av, 2) + '$, so $' + gd(m2, 2) + ' - ' + gd(rd(m2 - m1, 2), 2) + 'x = ' + gd(av, 2) + '$.',
          '$x = ' + dfr(gd(m2, 2) + ' - ' + gd(av, 2), gd(rd(m2 - m1, 2), 2)) + ' = ' + fx(x, 3) + '$, so ' + name + '-' + A1 + ' is $' + fx(100 * x, 3) + '\\%$ and ' + name + '-' + A2 + ' is $' + fx(100 * (1 - x), 3) + '\\%$.',
          'Check: the average is nearer to $' + gd(x > 0.5 ? m1 : m2, 2) + '$, so that isotope should be the more common one.'],
        'Write the average as $m_1x + m_2(1 - x)$ and solve for $x$.', null, { k: 'rev', m1: m1, m2: m2, av: av, light: askLight });
    }
    // concept: which value is the average? distractors from the trouble note
    var iso2 = iso, av2 = wavg(iso2), tall = iso2.slice().sort(function (a, b) { return b[1] - a[1]; })[0][0], plain = iso2.reduce(function (s, i) { return s + i[0]; }, 0) / iso2.length, heavy = iso2[iso2.length - 1][0], light = iso2[0][0];
    var wrongs = [gd(tall, 2) + ' u, the mass of the tallest peak'];
    if (M.abs(plain - av2) >= 0.1) wrongs.push(fx(plain, 4) + ' u, the plain average of the peak masses');
    if (heavy !== tall) wrongs.push(gd(heavy, 2) + ' u, the mass of the heaviest isotope');
    if (light !== tall) wrongs.push(gd(light, 2) + ' u, the mass of the lightest isotope');
    wrongs = R.sample(wrongs, M.min(3, wrongs.length));
    return P('The mass spectrum of ' + name + ' is shown: peaks at ' + lst(iso2.map(function (i) { return '$' + gd(i[0], 2) + '\\ \\text{u}$'; })) + ', with heights showing the abundances ' + lst(iso2.map(function (i) { return gx(i[1]) + '%'; })) + '. Which is the average atomic mass of ' + name + '?',
      mc(fx(av2, 4) + ' u, the abundance-weighted average', wrongs),
      ['The average atomic mass weights each peak\'s mass by its share of the atoms: $' + iso2.map(function (i) { return gd(i[0], 2) + '(' + gx(i[1] / 100) + ')'; }).join(' + ') + ' = ' + fx(av2, 4) + '\\ \\text{u}$.', 'The tallest peak is only the most common isotope, and a plain average ignores how common each one is.'],
      'Each peak counts in proportion to its height.', null, { k: 'avgmc', iso: iso2 });
  });

  // compounds for combustion analysis: [formula, name]
  var CHX = [['CH4', 'methane'], ['C2H6', 'ethane'], ['C3H8', 'propane'], ['C4H10', 'butane'], ['C2H4', 'ethylene'], ['C2H2', 'acetylene'], ['C6H6', 'benzene'], ['C8H18', 'octane'], ['C6H12', 'cyclohexane'], ['C6H14', 'hexane'], ['C3H6', 'propene']];  // (pentane left out: its 1 : 2.4 ratio needs a factor of 5)
  var CHO = [['CH4O', 'methanol'], ['C2H6O', 'ethanol'], ['C3H8O', 'propanol'], ['C3H6O', 'acetone'], ['C2H4O2', 'acetic acid'], ['C6H12O6', 'glucose'], ['C4H8O2', 'ethyl acetate'], ['C4H10O', 'diethyl ether'], ['C3H6O2', 'methyl acetate'], ['C7H6O2', 'benzoic acid'], ['C6H6O', 'phenol'], ['C2H6O2', 'ethylene glycol'], ['C3H8O3', 'glycerol'], ['C9H8O4', 'aspirin'], ['C8H8O3', 'vanillin']];
  function empirical(f) { var a = parseF(f).atoms, g = U.gcd.apply(null, Object.keys(a).map(function (e) { return a[e]; })), s = ''; ['C', 'H', 'O'].forEach(function (e) { if (a[e]) s += e + (a[e] / g > 1 ? a[e] / g : ''); }); return s; }
  // the smallest multiplier that makes every ratio whole (ratios to the smallest)
  function multiplierTex(r) { for (var k = 1; k <= 6; k++) { if (r.every(function (x) { return M.abs(x * k - M.round(x * k)) < 0.03 * k; })) return k; } return 1; }

  G('gchem1.combustion-analysis', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['massC', 'massH', 'hydro'], ['hydro', 'hydro', 'cho', 'massO'], ['cho', 'cho', 'molecular', 'hydro']));
    var useO = shape === 'cho' || shape === 'massO' || ((shape === 'massC' || shape === 'massH' || shape === 'molecular') && R.coin());
    var pool = useO ? CHO : CHX; if (shape === 'molecular') pool = pool.filter(function (c) { return empirical(c[0]) !== c[0]; });
    var cp = R.pick(pool), f = cp[0], at = parseF(f).atoms, Mf = mm(f);
    var ms = R.pick([0.1500, 0.2000, 0.2500, 0.3000, 0.4000, 0.5000]), n = ms / Mf;
    var mCO2 = sgf(n * at.C * mm('CO2'), 4), mH2O = sgf(n * at.H / 2 * mm('H2O'), 4);
    var mC = mCO2 * 12.01 / mm('CO2'), mH = mH2O * 2.02 / mm('H2O'), mO = ms - mC - mH, nC = mC / 12.01, nH = mH / 1.01, nO = mO / 16.00;
    var intro = 'A $' + qd(ms, 4, 'g') + '$ sample of a compound containing ' + (useO ? 'only C, H and O' : 'only C and H') + ' burns completely in oxygen, giving $' + qx(mCO2, 'g', 4) + '$ of $\\mathrm{CO_2}$ and $' + qx(mH2O, 'g', 4) + '$ of $\\mathrm{H_2O}$. ';
    var stC = 'C: $' + fx(mCO2, 4) + ' \\times ' + dfr('12.01', '44.01') + ' = ' + qx(mC, 'g', 4) + '$, which is $' + fx(mC, 4) + '/12.01 = ' + qx(nC, 'mol', 4) + '$.';
    var stH = 'H: $' + fx(mH2O, 4) + ' \\times ' + dfr('2(1.01)', '18.02') + ' = ' + qx(mH, 'g', 4) + '$, which is $' + fx(mH, 4) + '/1.01 = ' + qx(nH, 'mol', 4) + '$.';
    var stO = 'O, by difference: $' + fx(ms, 4) + ' - ' + fx(mC, 4) + ' - ' + fx(mH, 4) + ' = ' + qx(mO, 'g', 4) + '$, which is $' + fx(mO, 4) + '/16.00 = ' + qx(nO, 'mol', 4) + '$.';
    var chk = { k: 'comb', ms: ms, mCO2: mCO2, mH2O: mH2O, f: f };
    if (shape === 'massC') return P(intro + 'What mass of carbon did the sample contain?', ans(mC, 0.01),
      ['All the carbon ends up in the $\\mathrm{CO_2}$, and carbon is $12.01/44.01$ of its mass.', stC.replace(/, which is.*$/, '.')], 'What fraction of the mass of $\\mathrm{CO_2}$ is carbon?', 'g', chk);
    if (shape === 'massH') return P(intro + 'What mass of hydrogen did the sample contain?', ans(mH, 0.01),
      ['All the hydrogen ends up in the water, and each $\\mathrm{H_2O}$ has 2 H atoms: hydrogen is $2(1.01)/18.02$ of its mass.', stH.replace(/, which is.*$/, '.')], 'What fraction of the mass of water is hydrogen?', 'g', chk);
    if (shape === 'massO') return P(intro + 'What mass of oxygen did the sample contain?', ans(mO, 0.02),
      [stC.replace(/, which is.*$/, '.'), stH.replace(/, which is.*$/, '.'), 'The oxygen in the products came partly from the $\\mathrm{O_2}$, so find the sample\'s oxygen by subtraction: $' + fx(ms, 4) + ' - ' + fx(mC, 4) + ' - ' + fx(mH, 4) + ' = ' + qx(mO, 'g', 3) + '$.'],
      'Find C and H from the products, then subtract from the sample\'s mass.', 'g', chk);
    var emp = empirical(f), ea = parseF(emp).atoms, small = useO ? nO : M.min(nC, nH), rs = useO ? [nC / small, nH / small, 1] : [nC / small, nH / small], k = multiplierTex(rs);
    var ratioSt = 'Divide by the smallest (' + fx(small, 4) + '): ' + (useO ? 'C $' + fx(rs[0], 3) + '$, H $' + fx(rs[1], 3) + '$, O $1$' : 'C $' + fx(rs[0], 3) + '$, H $' + fx(rs[1], 3) + '$') + '.' + (k > 1 ? ' Multiply by ' + k + ' to clear the decimals.' : '');
    var steps = [stC, stH].concat(useO ? [stO] : ['Check: $' + fx(mC, 4) + ' + ' + fx(mH, 4) + ' = ' + fx(mC + mH, 4) + '\\ \\text{g}$, the whole sample, so there is no oxygen.']).concat([ratioSt, 'Empirical formula: $' + ft(emp) + '$.']);
    if (shape === 'molecular') {
      var mult = M.round(Mf / mm(emp)), Mg = sgf(Mf, 3);
      return P(intro + 'The compound\'s molar mass is about $' + qm(Mg) + '$. Find its molecular formula (write it as C, then H, then O).', fAns(f),
        steps.concat(['Empirical formula mass: $' + qm(mm(emp)) + '$. $' + gx(Mg) + '/' + mmx(mm(emp)) + ' = ' + mult + '$, so the molecular formula is $' + ft(f) + '$.']),
        'Find the empirical formula first, then compare its mass with the molar mass.', null, chk);
    }
    return P(intro + 'Find the empirical formula' + (useO ? ' (write it as C, then H, then O)' : ' (write it as C, then H)') + '.', fAns(emp), steps,
      useO ? 'Find C and H from the products, and O by subtraction, then the mole ratio.' : 'Find moles of C and of H, then their smallest whole-number ratio.', null, chk);
  });

  // mixtures: [A, B, element]; impure samples: [compound, element, description]
  var MIX2 = [['NaCl', 'KCl', 'Cl'], ['NaCl', 'NaBr', 'Na'], ['KCl', 'KBr', 'K'], ['FeO', 'Fe2O3', 'Fe'], ['CuO', 'Cu2O', 'Cu'], ['Na2CO3', 'NaHCO3', 'Na'], ['MgO', 'CaO', 'O']];
  var IMP = [['CaCO3', 'Ca', 'limestone'], ['Fe2O3', 'Fe', 'iron ore'], ['KCl', 'K', 'potash'], ['NaCl', 'Cl', 'rock salt'], ['MgSO4', 'Mg', 'Epsom salt'], ['Cu2S', 'Cu', 'copper ore']];
  function massFrac(f, e) { return AM[e] * parseF(f).atoms[e] / mm(f); }

  G('gchem1.mixture-composition', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['impure', 'impure', 'impureMass'], ['impure', 'two', 'two'], ['two', 'twoPct', 'two']));
    if (shape === 'impure' || shape === 'impureMass') {
      var im = R.pick(IMP), fc = massFrac(im[0], im[1]), m = R.pick([2.00, 4.00, 5.00, 8.00, 10.0, 12.5]), pur = R.int(55, 95) / 100, E = sgf(m * pur * fc, 3);
      var mc0 = E / sgf(fc, 4), pc = 100 * mc0 / m;
      var st = [cap(ENAME[im[1]]) + '\'s mass fraction in ' + F(im[0]) + ': $' + dfr(gx(rd(AM[im[1]] * parseF(im[0]).atoms[im[1]], 2)), mmx(mm(im[0]))) + ' = ' + fx(fc, 4) + '$.',
        'All the ' + ENAME[im[1]] + ' is in the ' + F(im[0]) + ', so its mass is $' + dfr(fx(E), fx(fc, 4)) + ' = ' + qx(mc0, 'g') + '$.'];
      var q0 = 'A $' + qx(m, 'g') + '$ sample of ' + im[2] + ' (impure ' + F(im[0]) + ', molar mass $' + qm(mm(im[0])) + '$) contains $' + qx(E, 'g') + '$ of ' + ENAME[im[1]] + ' (' + im[1] + ' $' + gd(AM[im[1]], 2) + '$). The impurities contain no ' + ENAME[im[1]] + '. ';
      if (shape === 'impureMass') return P(q0 + 'How many grams of ' + F(im[0]) + ' does the sample contain?', ans(mc0, 0.01), st, 'Divide the mass of ' + ENAME[im[1]] + ' by its mass fraction in the compound.', 'g', { k: 'imp', f: im[0], e: im[1], m: m, E: E });
      return P(q0 + 'What percent of the sample, by mass, is ' + F(im[0]) + '?', pctAns(pc, 0.01),
        st.concat(['Percent: $' + dfr(fx(mc0), fx(m)) + ' \\times 100 = ' + fx(pc, 3) + '\\%$.']), 'First find the mass of ' + F(im[0]) + ' that holds that much ' + ENAME[im[1]] + '.', null, { k: 'imp', f: im[0], e: im[1], m: m, E: E, pct: true });
    }
    var mx = R.pick(MIX2), A = mx[0], B = mx[1], e = mx[2], fA = rd(massFrac(A, e), 4), fB = rd(massFrac(B, e), 4);
    var tot = R.pick([2.000, 5.000, 8.000, 10.00, 12.00, 20.00]), xa = R.int(20, 80) / 100, E2 = sgf(tot * (xa * fA + (1 - xa) * fB), 4);
    var x = (E2 - fB * tot) / (fA - fB), askPct = shape === 'twoPct';
    return P('A $' + qx(tot, 'g', 4) + '$ mixture of ' + F(A) + ' and ' + F(B) + ' contains $' + qx(E2, 'g', 4) + '$ of ' + ENAME[e] + '. The mass fraction of ' + ENAME[e] + ' is $' + gd(fA, 4) + '$ in ' + F(A) + ' and $' + gd(fB, 4) + '$ in ' + F(B) + '. ' + (askPct ? 'What percent of the mixture, by mass, is ' + F(A) + '?' : 'How many grams of ' + F(A) + ' does the mixture contain?'),
      askPct ? pctAns(100 * x / tot, 0.02) : ans(x, 0.02),
      ['Let $x$ = grams of ' + F(A) + ' and $y$ = grams of ' + F(B) + '. Total: $x + y = ' + fx(tot, 4) + '$.', cap(ENAME[e]) + ': $' + gd(fA, 4) + 'x + ' + gd(fB, 4) + 'y = ' + fx(E2, 4) + '$.',
        'Substitute $y = ' + fx(tot, 4) + ' - x$: $' + gd(rd(fA - fB, 4), 4) + 'x = ' + fx(E2, 4) + ' - ' + fx(fB * tot, 4) + ' = ' + fx(E2 - fB * tot, 3) + '$.',
        '$x = ' + qx(x, 'g') + '$ of ' + F(A) + (askPct ? ', which is $' + dfr(fx(x), fx(tot, 4)) + ' \\times 100 = ' + fx(100 * x / tot, 3) + '\\%$ of the mixture.' : ' (and $' + qx(tot - x, 'g') + '$ of ' + F(B) + ').')],
      'Write one equation for the total mass and one for the mass of ' + ENAME[e] + '.', askPct ? null : 'g', { k: 'mix2', fA: fA, fB: fB, tot: tot, E: E2, pct: askPct });
  });


  // ================================================================== UNIT 2: LIGHT AND THE QUANTUM ATOM
  var SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'];
  var ELN = ['', 'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 'fluorine', 'neon', 'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 'chlorine', 'argon', 'potassium', 'calcium', 'scandium', 'titanium', 'vanadium', 'chromium', 'manganese', 'iron', 'cobalt', 'nickel', 'copper', 'zinc', 'gallium', 'germanium', 'arsenic', 'selenium', 'bromine', 'krypton'];
  var SUBS = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6]];
  // ground-state configuration as [[subshell, electrons], …] in filling order (Cr and Cu are the exceptions)
  function config(Z) {
    var left = Z, out = [];
    SUBS.forEach(function (s) { if (left <= 0) return; var k = M.min(s[1], left); out.push([s[0], k]); left -= k; });
    if (Z === 24 || Z === 29) { out.forEach(function (s) { if (s[0] === '4s') s[1] = 1; if (s[0] === '3d') s[1] += 1; }); }
    return out;
  }
  function cap2(s) { return s[1] === '2' ? 2 : s[1] === 's' ? 2 : 0; }
  function subCap(name) { return { s: 2, p: 6, d: 10, f: 14 }[name.slice(-1)]; }
  function unpairedIn(name, k) { var orb = subCap(name) / 2; return k <= orb ? k : 2 * orb - k; }
  function unpaired(cfg) { return cfg.reduce(function (s, x) { return s + unpairedIn(x[0], x[1]); }, 0); }
  var CORE = { 2: 'He', 10: 'Ne', 18: 'Ar' };
  function cfgTex(cfg, short, whole) {
    var core = 0, parts = cfg.slice();
    if (short) { var tot = 0, best = 0, idx = 0; parts.forEach(function (s, i) { tot += s[1]; if (CORE[tot] && (i < parts.length - 1 || whole) && /p$|1s/.test(s[0])) { best = tot; idx = i + 1; } }); if (best) { core = best; parts = parts.slice(idx); } }
    var body = parts.filter(function (s) { return s[1] > 0; }).map(function (s) { return s[0] + '^{' + s[1] + '}'; }).join('\\,');
    return (core ? '[\\text{' + CORE[core] + '}]' + (body ? '\\,' : '') : '') + (body || '');
  }
  // an ion of a first-row transition metal (or a main-group ion): remove 4p, then 4s, then 3d; add to the next open p
  function ionConfig(Z, q) {
    var cfg = config(Z).map(function (s) { return s.slice(); }), n = q;
    ['4p', '4s', '3d', '3p', '3s'].forEach(function (name) { cfg.forEach(function (s) { if (s[0] === name && n > 0) { var k = M.min(s[1], n); s[1] -= k; n -= k; } }); });
    if (q < 0) { var last = cfg[cfg.length - 1]; last[1] += -q; }
    return cfg.filter(function (s) { return s[1] > 0 || s[0] === '3d' && false; });
  }
  function boxes(name, k) { // TeX orbital boxes for k electrons in a subshell, filled by Hund's rule
    var orb = subCap(name) / 2, arr = [];
    for (var i = 0; i < orb; i++) arr.push(i < k ? (i + orb < k ? 2 : 1) : 0);
    return boxTex(arr);
  }
  function boxTex(arr) { return arr.map(function (v) { return '\\boxed{' + (v === 2 ? '\\uparrow\\downarrow' : v === 1 ? '\\uparrow\\phantom{\\downarrow}' : v === -1 ? '\\downarrow\\phantom{\\uparrow}' : '\\phantom{\\uparrow\\downarrow}') + '}'; }).join('\\,'); }

  // light sources: [description, wavelength in m]
  var LIGHTS = [['a red helium–neon laser', 633e-9], ['a green laser pointer', 532e-9], ['a blue LED', 450e-9], ['a violet Blu-ray laser', 405e-9], ['a yellow sodium street lamp', 589e-9], ['an infrared TV remote', 940e-9], ['an ultraviolet germicidal lamp', 254e-9], ['a red LED', 660e-9]];
  var WAVES = [['an FM radio station at 98.1 MHz', 98.1e6, 'm'], ['an FM radio station at 101.5 MHz', 101.5e6, 'm'], ['an AM radio station at 880 kHz', 880e3, 'm'], ['a microwave oven at 2.45 GHz', 2.45e9, 'cm'], ['a Wi-Fi router at 5.00 GHz', 5.00e9, 'cm'], ['a GPS satellite at 1.575 GHz', 1.575e9, 'cm']];
  function randLight(R) { if (R.coin()) return R.pick(LIGHTS); var nm = R.int(25, 95) * 10; return ['light with a wavelength of ' + nm + ' nm', nm * 1e-9]; }
  function randWave(R) { if (R.coin()) return R.pick(WAVES); if (R.coin()) { var f = R.int(881, 1079) / 10; return ['an FM radio station at ' + f + ' MHz', f * 1e6, 'm']; } var k = R.int(54, 170) * 10; return ['an AM radio station at ' + k + ' kHz', k * 1e3, 'm']; }
  function region(lam) { return lam < 1e-8 ? 'X-ray' : lam < 4e-7 ? 'ultraviolet' : lam <= 7e-7 ? 'visible' : lam < 1e-3 ? 'infrared' : lam < 0.3 ? 'microwave' : 'radio'; }

  G('gchem1.light-waves', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['nu', 'nu', 'lam', 'which'], ['nu', 'lam', 'radio', 'which'], ['lam', 'radio', 'region', 'nu']));
    if (shape === 'nu') {
      var L = randLight(R), lam = L[1], nu = CL / lam;
      return P('Light from ' + L[0] + ' has a wavelength of $' + qg(lam * 1e9, 'nm') + '$. What is its frequency?', ans(nu, 0.01),
        ['Change to meters: $' + gx(lam * 1e9) + '\\ \\text{nm} = ' + qg(lam, 'm') + '$.', '$\\nu = \\dfrac{c}{\\lambda} = ' + dfr('3.00 \\times 10^{8}\\ \\text{m/s}', qg(lam, 'm')) + ' = ' + qx(nu, 'Hz') + '$.'],
        'Use $c = \\lambda\\nu$, with the wavelength in meters.', 'Hz', { k: 'nu', lam: lam });
    }
    if (shape === 'lam') {
      var lam2 = R.int(25, 80) * 10 * 1e-9, nu2 = sgf(CL / lam2, 3), lamA = CL / nu2;
      return P('A beam of light has a frequency of $' + qx(nu2, 'Hz') + '$. What is its wavelength in nanometers?', ans(lamA * 1e9, 0.01),
        ['$\\lambda = \\dfrac{c}{\\nu} = ' + dfr('3.00 \\times 10^{8}\\ \\text{m/s}', fx(nu2) + '\\ \\text{s}^{-1}') + ' = ' + qx(lamA, 'm') + '$.', 'In nanometers: $' + qx(lamA, 'm') + ' \\times ' + dfr('10^{9}\\ \\text{nm}', '1\\ \\text{m}') + ' = ' + qx(lamA * 1e9, 'nm') + '$ (' + region(lamA) + ').'],
        'Solve $c = \\lambda\\nu$ for $\\lambda$, then change meters to nanometers.', 'nm', { k: 'lam', nu: nu2 });
    }
    if (shape === 'radio') {
      var W = randWave(R), lamR = CL / W[1], inCm = W[2] === 'cm';
      return P('Find the wavelength of the waves from ' + W[0] + ', in ' + (inCm ? 'centimeters' : 'meters') + '.', ans(inCm ? lamR * 100 : lamR, 0.01),
        ['Write the frequency in hertz: $' + gx(W[1]) + '\\ \\text{s}^{-1}$.', '$\\lambda = \\dfrac{c}{\\nu} = ' + dfr('3.00 \\times 10^{8}\\ \\text{m/s}', gx(W[1]) + '\\ \\text{s}^{-1}') + ' = ' + qx(lamR, 'm') + '$' + (inCm ? ' $= ' + qx(lamR * 100, 'cm') + '$.' : '.')],
        'Use $c = \\lambda\\nu$. Mega means $10^{6}$, giga $10^{9}$, kilo $10^{3}$.', inCm ? 'cm' : 'm', { k: 'lam', nu: W[1], scale: inCm ? 100 : 1 });
    }
    if (shape === 'which') {
      var two = R.sample(LIGHTS, 2), hi = two[0][1] < two[1][1] ? two[0] : two[1], lo = hi === two[0] ? two[1] : two[0], askF = R.coin();
      var ch = askF ? hi : lo;
      return P('Light from ' + two[0][0] + ' has $\\lambda = ' + qg(two[0][1] * 1e9, 'nm') + '$; light from ' + two[1][0] + ' has $\\lambda = ' + qg(two[1][1] * 1e9, 'nm') + '$. Which light has the ' + (askF ? 'higher' : 'lower') + ' frequency?',
        mcK([cap(two[0][0].replace(/^an? /, 'the ')), cap(two[1][0].replace(/^an? /, 'the ')), 'Both have the same frequency'], ch === two[0] ? 0 : 1),
        ['$\\lambda\\nu = c$ is the same for all light, so wavelength and frequency are inversely related.', 'The shorter wavelength (' + gx(hi[1] * 1e9) + ' nm) has the higher frequency; the longer one (' + gx(lo[1] * 1e9) + ' nm) has the lower frequency.'],
        'Longer wavelength means lower frequency.', null, { k: 'which' });
    }
    var nuR = R.int(11, 99) / 10 * M.pow(10, R.pick([6, 9, 11, 13, 14, 15, 17, 19])), lamQ = CL / nuR, reg = region(lamQ);
    var regs = ['X-ray', 'ultraviolet', 'visible', 'infrared', 'microwave', 'radio'];
    return P('Electromagnetic radiation has a frequency of $' + qg(nuR, 'Hz') + '$. Find its wavelength. In which region of the spectrum is it?',
      mc(reg, R.sample(regs.filter(function (r) { return r !== reg; }), 3)),
      ['$\\lambda = \\dfrac{c}{\\nu} = ' + dfr('3.00 \\times 10^{8}', gx(nuR)) + ' = ' + qx(lamQ, 'm') + '$.', 'Compare: visible light is $4$–$7 \\times 10^{-7}\\ \\text{m}$; shorter is ultraviolet, then X-rays; longer is infrared (to about 1 mm), then microwaves (to about 30 cm), then radio.', 'So this is ' + reg + ' radiation.'],
      'Find the wavelength first, then compare with 400–700 nm.', null, { k: 'region' });
  });

  // work functions in eV (OpenStax University Physics Volume 3, Table 6.1), given in J in problems
  var WFN = [['sodium', 2.46], ['aluminum', 4.08], ['zinc', 4.31], ['iron', 4.50], ['copper', 4.70], ['silver', 4.73]];
  function Eph(lam) { return HP * CL / lam; }

  G('gchem1.photons', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['E', 'E', 'Emol', 'concept'], ['Emol', 'lamE', 'threshold', 'KE', 'count', 'concept'], ['KE', 'count', 'threshold', 'lamE', 'concept']));
    if (shape === 'E' || shape === 'Emol') {
      var L = randLight(R), lam = L[1], E = Eph(lam), mol = shape === 'Emol';
      return P('Find the energy of ' + (mol ? 'one mole of photons' : 'one photon') + ' of the light from ' + L[0] + ' ($\\lambda = ' + qg(lam * 1e9, 'nm') + '$)' + (mol ? ', in kJ/mol' : '') + '.', ans(mol ? E * NA / 1000 : E, 0.01),
        ['$E = \\dfrac{hc}{\\lambda} = ' + dfr('(6.626 \\times 10^{-34}\\ \\text{J·s})(3.00 \\times 10^{8}\\ \\text{m/s})', qg(lam, 'm')) + ' = ' + qx(E, 'J') + '$ per photon.'].concat(mol ? ['Per mole: $' + fx(E) + '\\ \\text{J} \\times 6.022 \\times 10^{23}\\ \\text{mol}^{-1} = ' + qx(E * NA, 'Jmol') + ' = ' + qx(E * NA / 1000, 'kJmol') + '$.'] : []),
        'Use $E = hc/\\lambda$ with $\\lambda$ in meters.', mol ? 'kJmol' : 'J', { k: 'E', lam: lam, mol: mol });
    }
    if (shape === 'lamE') {
      var lamT = R.int(25, 80) * 10 * 1e-9, E2 = sgf(Eph(lamT), 3), lamA = HP * CL / E2;
      return P('A photon has an energy of $' + qx(E2, 'J') + '$. What is its wavelength in nanometers?', ans(lamA * 1e9, 0.01),
        ['$\\lambda = \\dfrac{hc}{E} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})', fx(E2)) + ' = ' + qx(lamA, 'm') + ' = ' + qx(lamA * 1e9, 'nm') + '$ (' + region(lamA) + ').'],
        'Solve $E = hc/\\lambda$ for $\\lambda$.', 'nm', { k: 'lamE', E: E2 });
    }
    var W = R.pick(WFN), phi = sgf(W[1] * 1.602e-19, 3);
    if (shape === 'threshold') {
      var lt = HP * CL / phi;
      return P('The work function of ' + W[0] + ' is $' + qx(phi, 'J') + '$. What is the longest wavelength of light, in nanometers, that can free electrons from it?', ans(lt * 1e9, 0.01),
        ['At the threshold, one photon has just enough energy: $hc/\\lambda = \\Phi$.', '$\\lambda = \\dfrac{hc}{\\Phi} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})', fx(phi)) + ' = ' + qx(lt, 'm') + ' = ' + qx(lt * 1e9, 'nm') + '$.', 'Longer wavelengths carry less energy per photon, so they free no electrons, however bright.'],
        'Set the photon energy equal to the work function.', 'nm', { k: 'thr', phi: phi });
    }
    if (shape === 'KE') {
      var lt2 = HP * CL / phi, lamK = R.pick([150, 180, 200, 220, 250, 300, 350, 400].filter(function (x) { return x * 1e-9 < 0.85 * lt2; })) * 1e-9, Ek = Eph(lamK), KE = Ek - phi;
      return P('Light of wavelength $' + qg(lamK * 1e9, 'nm') + '$ shines on ' + W[0] + ', whose work function is $' + qx(phi, 'J') + '$. What is the maximum kinetic energy of the electrons it frees?', ans(KE, 0.02),
        ['Photon energy: $E = \\dfrac{hc}{\\lambda} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})', qg(lamK, 'm')) + ' = ' + qx(Ek, 'J') + '$.', 'That is more than $\\Phi$, so electrons leave. $KE_\\text{max} = h\\nu - \\Phi = ' + fx(Ek) + ' - ' + fx(phi) + ' = ' + qx(KE, 'J') + '$.'],
        'Kinetic energy = photon energy − work function.', 'J', { k: 'KE', lam: lamK, phi: phi });
    }
    if (shape === 'count') {
      var L2 = randLight(R), Ep = R.pick([1.00, 2.50, 5.00, 10.0, 2.00, 4.00, 7.50, 1.50]), unitE = R.pick([['mJ', 1e-3], ['J', 1]]), n = Ep * unitE[1] / Eph(L2[1]);
      return P('A pulse of light from ' + L2[0] + ' ($\\lambda = ' + qg(L2[1] * 1e9, 'nm') + '$) delivers $' + qx(Ep, unitE[0] === 'mJ' ? 'mJ' : 'J') + '$ of energy. How many photons does it contain?', ans(n, 0.01),
        ['One photon: $E = \\dfrac{hc}{\\lambda} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})', qg(L2[1], 'm')) + ' = ' + qx(Eph(L2[1]), 'J') + '$.', 'Number $= ' + dfr(qg(Ep * unitE[1], 'J'), qx(Eph(L2[1]), 'J')) + ' = ' + fx(n) + '$ photons.'],
        'Divide the total energy by the energy of one photon.', 'none', { k: 'count', lam: L2[1], Etot: Ep * unitE[1] });
    }
    // concept: brightness against color
    var thr = M.round(HP * CL / phi * 1e9), lamLong = M.round(thr * R.pick([1.2, 1.3, 1.4]) / 10) * 10, lamShort = M.round(thr * R.pick([0.6, 0.7, 0.8]) / 10) * 10;
    var form = R.int(0, 2);
    if (form === 0) return P('The threshold wavelength for ' + W[0] + ' is about $' + qg(thr, 'nm') + '$. Which beam frees electrons from it?',
      mc('A dim beam of $' + qg(lamShort, 'nm') + '$ light', ['A very bright beam of $' + qg(lamLong, 'nm') + '$ light', 'Both beams, since both carry energy', 'Neither beam: dim light cannot free electrons']),
      ['Each electron is freed by one photon, so what matters is the energy of a single photon, $hc/\\lambda$.', 'A $' + gx(lamShort) + '$ nm photon is shorter than the threshold, so it has enough energy; dim light just frees fewer electrons.', 'A $' + gx(lamLong) + '$ nm photon has too little energy, and making the beam brighter adds more such photons, not bigger ones.'],
      'Compare one photon\'s energy with the work function.', null, { k: 'concept' });
    var stmts = [['Doubling the brightness of light above the threshold doubles the maximum kinetic energy of the freed electrons.', false, 'Brighter light frees more electrons; the maximum kinetic energy, $h\\nu - \\Phi$, depends only on the frequency.'],
      ['Doubling the brightness of light above the threshold doubles the number of electrons freed each second.', true, 'Twice as many photons free twice as many electrons, each with the same maximum kinetic energy.'],
      ['A photon of violet light carries more energy than a photon of red light.', true, 'Violet light has the shorter wavelength, so $E = hc/\\lambda$ is larger.'],
      ['A bright red beam carries photons with more energy than a dim violet beam.', false, 'Brightness counts photons. Each red photon still has less energy than each violet photon.'],
      ['Raising the frequency of light above the threshold makes the freed electrons faster.', true, '$KE_\\text{max} = h\\nu - \\Phi$ grows as $\\nu$ grows.']];
    var st = R.pick(stmts);
    return P('True or false: ' + st[0], tf(st[1]), [st[2], 'Light behaves as photons: one photon gives its energy to one electron.'], 'Brightness is the number of photons; color sets each photon\'s energy.', null, { k: 'tf' });
  });

  function Hlam(ni, nf) { return HP * CL / M.abs(RH * (1 / (nf * nf) - 1 / (ni * ni))); }
  function hdE(ni, nf) { return -RH * (1 / (nf * nf) - 1 / (ni * ni)); }
  var SERIES = { 1: 'Lyman (ultraviolet)', 2: 'Balmer (visible)', 3: 'Paschen (infrared)', 4: 'Brackett (infrared)', 5: 'Pfund (infrared)' };

  G('gchem1.hydrogen-spectrum', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['emit', 'emit', 'dE', 'freq', 'region', 'absorb'], ['emit', 'absorb', 'dE', 'ionize', 'region', 'freq'], ['absorb', 'findn', 'emit', 'region', 'ionize', 'freq']));
    var nf = R.pick(shape === 'findn' ? [2] : [1, 2, 2, 3, 4, 5]), ni = nf + R.int(1, shape === 'findn' ? 4 : 6);
    if (shape === 'freq') { var dEf = M.abs(hdE(ni, nf)), nuF = dEf / HP, perMolF = ctx.level > 1 && R.coin();
      return P('A hydrogen atom\'s electron falls from $n = ' + ni + '$ to $n = ' + nf + '$. ' + (perMolF ? 'How much energy, in kJ, does one mole of such atoms release as light?' : 'What is the frequency of the emitted light?'), ans(perMolF ? dEf * NA / 1000 : nuF, 0.01),
        ['$|\\Delta E| = 2.18 \\times 10^{-18}\\left(\\dfrac{1}{' + nf + '^2} - \\dfrac{1}{' + ni + '^2}\\right) = ' + qx(dEf, 'J') + '$ per atom.', perMolF ? 'Per mole: $' + fx(dEf) + ' \\times 6.022 \\times 10^{23} = ' + qx(dEf * NA, 'Jmol') + ' = ' + qx(dEf * NA / 1000, 'kJ') + '$.' : '$\\nu = \\dfrac{E}{h} = ' + dfr(fx(dEf), '6.626 \\times 10^{-34}') + ' = ' + qx(nuF, 'Hz') + '$.'],
        'Find the energy gap first.', perMolF ? 'kJ' : 'Hz', { k: perMolF ? 'hmol' : 'hfreq', a: ni, b: nf }); }
    if (shape === 'emit' || shape === 'absorb') {
      var em = shape === 'emit', a = em ? ni : nf, b = em ? nf : ni, dE = hdE(a, b), lam = HP * CL / M.abs(dE);
      return P('What wavelength of light, in nanometers, does a hydrogen atom ' + (em ? 'emit' : 'absorb') + ' when its electron goes from $n = ' + a + '$ to $n = ' + b + '$?', ans(lam * 1e9, 0.01),
        ['$\\Delta E = E_{' + b + '} - E_{' + a + '} = -2.18 \\times 10^{-18}\\left(\\dfrac{1}{' + b + '^2} - \\dfrac{1}{' + a + '^2}\\right) = ' + qx(dE, 'J') + '$.', (em ? 'Negative: the atom loses energy, which leaves as a photon of $' : 'Positive: the atom must absorb a photon of $') + qx(M.abs(dE), 'J') + '$.',
          '$\\lambda = \\dfrac{hc}{|\\Delta E|} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})', fx(M.abs(dE))) + ' = ' + qx(lam, 'm') + ' = ' + qx(lam * 1e9, 'nm') + '$ (' + region(lam) + ').'],
        'Find $\\Delta E$ from $E_n = -2.18 \\times 10^{-18}/n^2$, then $\\lambda = hc/|\\Delta E|$.', 'nm', { k: 'hlam', a: a, b: b });
    }
    if (shape === 'dE') {
      var up = R.coin(), a2 = up ? nf : ni, b2 = up ? ni : nf, d2 = hdE(a2, b2);
      return P('Find $\\Delta E$ for a hydrogen atom whose electron goes from $n = ' + a2 + '$ to $n = ' + b2 + '$. Include the sign.', ans(d2, 0.01),
        ['$E_{' + a2 + '} = -\\dfrac{2.18 \\times 10^{-18}}{' + a2 * a2 + '} = ' + qx(-RH / (a2 * a2), 'J') + '$ and $E_{' + b2 + '} = ' + qx(-RH / (b2 * b2), 'J') + '$.', '$\\Delta E = E_\\text{final} - E_\\text{initial} = ' + qx(d2, 'J') + '$, ' + (up ? 'positive: energy must be absorbed.' : 'negative: energy is given off as light.')],
        '$\\Delta E = E_\\text{final} - E_\\text{initial}$.', 'J', { k: 'hdE', a: a2, b: b2 });
    }
    if (shape === 'ionize') {
      var n0 = R.int(1, 4), Ei = RH / (n0 * n0), perMol = R.coin() && n0 === 1;
      return P('How much energy does it take to remove the electron from a hydrogen atom in the $n = ' + n0 + '$ level' + (perMol ? ', in kJ per mole of atoms' : '') + '?', ans(perMol ? Ei * NA / 1000 : Ei, 0.01),
        ['Removing the electron means going to $n = \\infty$, where $E = 0$.', '$\\Delta E = 0 - E_{' + n0 + '} = \\dfrac{2.18 \\times 10^{-18}}{' + n0 * n0 + '} = ' + qx(Ei, 'J') + '$ per atom.'].concat(perMol ? ['Per mole: $' + fx(Ei) + ' \\times 6.022 \\times 10^{23} = ' + qx(Ei * NA, 'Jmol') + ' = ' + qx(Ei * NA / 1000, 'kJmol') + '$, hydrogen\'s ionization energy.'] : []),
        'The free electron has $E = 0$.', perMol ? 'kJmol' : 'J', { k: 'hion', n: n0, mol: perMol });
    }
    if (shape === 'region') {
      var lamR = Hlam(ni, nf), reg = region(lamR);
      return P('A hydrogen atom\'s electron drops from $n = ' + ni + '$ to $n = ' + nf + '$. In which region of the spectrum is the emitted light?',
        mc(reg, ['ultraviolet', 'visible', 'infrared', 'X-ray'].filter(function (r) { return r !== reg; })),
        ['$|\\Delta E| = 2.18 \\times 10^{-18}\\left(\\dfrac{1}{' + nf + '^2} - \\dfrac{1}{' + ni + '^2}\\right) = ' + qx(M.abs(hdE(ni, nf)), 'J') + '$.', '$\\lambda = hc/|\\Delta E| = ' + qx(lamR * 1e9, 'nm') + '$: ' + reg + '. Drops to $n = ' + nf + '$ form the ' + SERIES[nf] + ' series.'],
        'Drops to $n = 1$ are the biggest; drops to $n = 3$ are small.', null, { k: 'hreg' });
    }
    // findn: a Balmer line's upper level
    var lamB = Hlam(ni, 2), lamGiven = sgf(lamB * 1e9, 3), Eg = HP * CL / (lamGiven * 1e-9), inv = 0.25 - Eg / RH;
    return P('A line in hydrogen\'s emission spectrum has $\\lambda = ' + qg(lamGiven, 'nm') + '$, from an electron falling to $n = 2$. From which level did it fall?', exact(ni),
      ['Photon energy: $E = \\dfrac{hc}{\\lambda} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})', qg(lamGiven * 1e-9, 'm')) + ' = ' + qx(Eg, 'J') + '$.', 'This equals $2.18 \\times 10^{-18}\\left(\\dfrac{1}{4} - \\dfrac{1}{n^2}\\right)$, so $\\dfrac{1}{n^2} = 0.25 - ' + dfr(fx(Eg), '2.18 \\times 10^{-18}') + ' = ' + fx(inv, 3) + '$.', '$n^2 = ' + fx(1 / inv, 3) + '$, so $n = ' + ni + '$.'],
      'Set $hc/\\lambda$ equal to the energy gap and solve for $n$.', null, { k: 'findn', lam: lamGiven, ans: ni });
  });

  // bonds for comparison (kJ/mol): average bond enthalpies as in general chemistry tables
  var BOND = [['H–H', 436], ['Cl–Cl', 242], ['Br–Br', 193], ['I–I', 151], ['O=O', 498], ['C–H', 413], ['C–C', 347], ['O–H', 467], ['N≡N', 945], ['F–F', 159], ['C–Cl', 339]];
  var MOTION = [['microwave', 'microwaves (wavelength about 1 cm)', 'faster rotation of the molecule'], ['infrared', 'infrared light (wavelength about 10 μm)', 'vibration: bonds stretch and bend'], ['visible', 'visible light (wavelength about 500 nm)', 'an electron moving to a higher energy level'], ['ultraviolet', 'ultraviolet light (wavelength about 250 nm)', 'an electron moving to a higher energy level, sometimes breaking a bond']];

  G('gchem1.spectroscopy-regions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['what', 'what', 'Emol'], ['what', 'Emol', 'enough'], ['enough', 'lmax', 'Emol', 'what']));
    if (shape === 'what') {
      var mv = R.pick(MOTION.slice(0, 3)), opts = ['faster rotation of the molecule', 'vibration: bonds stretch and bend', 'an electron moving to a higher energy level', 'breaking the molecule\'s bonds'];
      return P('Gas molecules absorb ' + mv[1] + '. What does a single photon of it mainly cause in a molecule?', mc(mv[2], opts.filter(function (o) { return o !== mv[2]; })),
        ['Match the photon\'s energy to the size of the step: rotation needs a tiny fraction of a kJ/mol, vibration a few to tens of kJ/mol, electronic jumps hundreds.', cap(mv[0]) + ' photons are the right size for ' + mv[2] + '.'],
        'Compare the photon\'s energy per mole with rotation, vibration and electronic steps.', null, { k: 'what' });
    }
    var lam = R.coin() ? R.pick([0.5e-2, 1.0e-2, 3.0e-6, 5.0e-6, 10e-6, 15e-6, 650e-9, 500e-9, 400e-9, 300e-9, 254e-9, 200e-9, 121.6e-9]) : R.int(15, 90) * 10 * 1e-9, Em = HP * CL * NA / lam / 1000;
    var lamTex = lam >= 1e-3 ? qg(lam * 100, 'cm') : lam >= 1e-6 ? gx(lam * 1e6) + '\\ \\text{μm}' : qg(rd(lam * 1e9, 1), 'nm');
    var stE = '$E = \\dfrac{hcN_\\text{A}}{\\lambda} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})(6.022 \\times 10^{23})', qg(lam, 'm')) + ' = ' + qx(Em * 1000, 'Jmol') + ' = ' + qx(Em, 'kJmol') + '$.';
    if (shape === 'Emol') return P('Find the energy of one mole of photons of wavelength $' + lamTex + '$ (' + region(lam) + '), in kJ/mol.', ans(Em, 0.01),
      [stE, Em < 1 ? 'Tiny: enough only to change how fast molecules rotate.' : Em < 100 ? 'Enough to make bonds vibrate, but far below bond energies.' : 'Hundreds of kJ/mol: the size of electronic jumps and of bond energies.'],
      'Use $E = hcN_\\text{A}/\\lambda$ with $\\lambda$ in meters, then divide by 1000.', 'kJmol', { k: 'Emol', lam: lam });
    var bd = R.pick(BOND);
    if (shape === 'enough') {
      var lam3 = R.int(15, 200) * 10 * 1e-9, E3 = HP * CL * NA / lam3 / 1000;
      if (M.abs(E3 - bd[1]) / bd[1] < 0.04) lam3 = 200e-9, E3 = HP * CL * NA / lam3 / 1000;
      return P('The ' + bd[0] + ' bond energy is $' + qg(bd[1], 'kJmol') + '$. True or false: a photon of $' + qg(lam3 * 1e9, 'nm') + '$ light carries enough energy to break one ' + bd[0] + ' bond.', tf(E3 >= bd[1]),
        ['Per mole of photons: $E = \\dfrac{hcN_\\text{A}}{\\lambda} = ' + qx(E3, 'kJmol') + '$.', 'Compare with $' + qg(bd[1], 'kJmol') + '$: the photon carries ' + (E3 >= bd[1] ? 'more than enough' : 'too little') + ' energy.'],
        'Find the energy of a mole of photons and compare it with the bond energy.', null, { k: 'enough', lam: lam3, D: bd[1] });
    }
    var lmax = HP * CL * NA / (bd[1] * 1000);
    return P('What is the longest wavelength of light, in nanometers, whose photons carry enough energy to break an ' + bd[0] + ' bond ($' + qg(bd[1], 'kJmol') + '$)?', ans(lmax * 1e9, 0.01),
      ['Energy per bond: $' + dfr(gx(bd[1] * 1000) + '\\ \\text{J/mol}', '6.022 \\times 10^{23}\\ \\text{mol}^{-1}') + ' = ' + qx(bd[1] * 1000 / NA, 'J') + '$.', '$\\lambda = \\dfrac{hc}{E} = ' + dfr('(6.626 \\times 10^{-34})(3.00 \\times 10^{8})', fx(bd[1] * 1000 / NA)) + ' = ' + qx(lmax, 'm') + ' = ' + qx(lmax * 1e9, 'nm') + '$.', 'Shorter wavelengths have more energy, so they can break it too; longer ones cannot.'],
      'Divide the bond energy by Avogadro\'s number, then $\\lambda = hc/E$.', 'nm', { k: 'lmax', D: bd[1] });
  });

  var LL = ['s', 'p', 'd', 'f'];
  G('gchem1.quantum-numbers', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['orbs', 'label', 'ml', 'nl', 'elec', 'shellorbs', 'lvals', 'claim'], ['orbs', 'elec', 'allowed', 'label', 'nl', 'claim'], ['elec', 'allowed', 'elec2', 'shell', 'claim']));
    var n = R.int(2, 7), l = R.int(0, M.min(3, n - 1));
    if (shape === 'shellorbs') { var ns = R.int(1, 5); return P('How many orbitals are in the $n = ' + ns + '$ shell (counting every subshell it has)?', exact(ns * ns),
      ['Shell ' + ns + ' has $l = 0$ to $' + (ns - 1) + '$: ' + U.range(0, ns - 1).map(function (x) { return ns + 'spdfghi'[x]; }).join(', ') + '.', 'Orbitals: $' + U.range(0, ns - 1).map(function (x) { return 2 * x + 1; }).join(' + ') + ' = ' + ns * ns + '$, which is $n^2$.'],
      'Each subshell has $2l + 1$ orbitals; add them up.', null, { k: 'shellorbs' }); }
    if (shape === 'lvals') { var nv = R.int(1, 7); return P('How many different values can $l$ have when $n = ' + nv + '$?', exact(nv),
      ['$l$ runs from $0$ to $n - 1 = ' + (nv - 1) + '$: ' + U.range(0, nv - 1).join(', ') + '.', 'That is $' + nv + '$ value' + (nv > 1 ? 's' : '') + ', one for each subshell of the shell.'],
      '$l$ goes from 0 up to $n - 1$.', null, { k: 'lvals' }); }
    if (shape === 'claim') { // check a classmate's count
      var what = R.pick(ctx.level === 1 ? ['orbitals', 'electrons'] : ['orbitals', 'electrons', 'shell']), right, wrongs;
      if (what === 'orbitals') { right = 2 * l + 1; wrongs = [2 * l, 2 * (2 * l + 1), l + 1].filter(function (x) { return x > 0 && x !== right; }); }
      else if (what === 'electrons') { right = 2 * (2 * l + 1); wrongs = [2 * l + 1, 2 * l, 4 * l].filter(function (x) { return x > 0 && x !== right; }); }
      else { n = R.int(1, 5); right = 2 * n * n; wrongs = [n * n, 2 * n, 8].filter(function (x) { return x !== right; }); }
      var says = R.coin() ? right : R.pick(wrongs), lab = what === 'shell' ? 'the $n = ' + n + '$ shell' : 'the $' + n + LL[l] + '$ subshell', thing = what === 'orbitals' ? 'orbitals' : 'electrons';
      return P('A classmate says ' + lab + (what === 'orbitals' ? ' has ' + says + ' orbitals' : ' can hold at most ' + says + ' electrons') + '. Is that right?', mcK(['Yes', 'No'], says === right ? 0 : 1),
        [what === 'shell' ? 'Shell ' + n + ' has $n^2 = ' + n * n + '$ orbitals, two electrons each: $2n^2 = ' + right + '$.' : 'A ' + LL[l] + ' subshell has $l = ' + l + '$, so $2l + 1 = ' + (2 * l + 1) + '$ orbitals' + (what === 'electrons' ? ', two electrons each: $' + right + '$.' : '.'),
          says === right ? 'So <b>yes</b>, ' + says + ' is right.' : 'So <b>no</b>: the answer is ' + right + ', not ' + says + '.'],
        'Count the orbitals first: $2l + 1$ in a subshell, $n^2$ in a shell.', null, { k: 'claim' });
    }
    if (shape === 'nl') { // read n and l from a subshell label
      return P('Give the values of $n$ and $l$ for the $' + n + LL[l] + '$ subshell.', { t: 'multi', parts: [{ label: '$n$', a: exact(n) }, { label: '$l$', a: exact(l) }] },
        ['The number is $n$: ' + n + '.', 'The letter gives $l$: s, p, d, f mean $l = 0, 1, 2, 3$, so ' + LL[l] + ' means $l = ' + l + '$.'], 's, p, d, f are $l = 0, 1, 2, 3$.', null, { k: 'nl', n: n, l: l });
    }
    if (shape === 'orbs') return P('How many orbitals are in the $' + n + LL[l] + '$ subshell?', exact(2 * l + 1),
      ['A ' + LL[l] + ' subshell has $l = ' + l + '$.', '$m_l$ runs from $-' + l + '$ to $+' + l + '$' + (l ? ': ' + U.range(-l, l).map(function (x) { return x; }).join(', ') : ': only 0') + '. That is $2l + 1 = ' + (2 * l + 1) + '$ values, one per orbital.'],
      'Count the values of $m_l$ from $-l$ to $+l$.', null, { k: 'orbs', l: l });
    if (shape === 'label') return P('Which subshell has $n = ' + n + '$ and $l = ' + l + '$? (Write it like 2p.)', { t: 'text', v: [n + LL[l]] },
      ['The letter comes from $l$: $l = 0, 1, 2, 3$ are s, p, d, f.', '$n = ' + n + '$, $l = ' + l + '$ is the $' + n + LL[l] + '$ subshell.'], '$l = 0, 1, 2, 3$ means s, p, d, f.', null, { k: 'label' });
    if (shape === 'ml') { var l2 = R.int(1, 3); return P('What is the smallest value $m_l$ can have when $l = ' + l2 + '$?', exact(-l2),
      ['$m_l$ runs through every whole number from $-l$ to $+l$, zero included.', 'For $l = ' + l2 + '$: ' + U.range(-l2, l2).join(', ') + '. The smallest is $' + (-l2) + '$.'], '$m_l$ can be negative.', null, { k: 'ml' }); }
    if (shape === 'shell') { n = R.int(2, 4); } if (shape === 'shell') return P('What is the greatest number of electrons that can have $n = ' + n + '$?', exact(2 * n * n),
      ['Shell ' + n + ' has subshells ' + U.range(0, n - 1).map(function (x) { return n + LL[x]; }).join(', ') + ', with $' + U.range(0, n - 1).map(function (x) { return 2 * x + 1; }).join(' + ') + ' = ' + n * n + '$ orbitals ($n^2$).', 'Two electrons per orbital: $2n^2 = ' + 2 * n * n + '$.'],
      'Count the orbitals in the shell ($n^2$), then two electrons each.', null, { k: 'shell' });
    if (shape === 'elec') return P('How many electrons in one atom can have $n = ' + n + '$ and $l = ' + l + '$?', exact(2 * (2 * l + 1)),
      ['$n = ' + n + '$, $l = ' + l + '$ is the $' + n + LL[l] + '$ subshell, with $2l + 1 = ' + (2 * l + 1) + '$ orbitals.', 'Each orbital holds two electrons (spins $+\\tfrac{1}{2}$ and $-\\tfrac{1}{2}$): $' + 2 * (2 * l + 1) + '$.'],
      'Count the orbitals, then two electrons each.', null, { k: 'elec' });
    if (shape === 'elec2') { var ml = R.int(-l, l), withS = R.coin();
      if (l === 0) ml = 0;
      return P('How many electrons in one atom can have $n = ' + n + '$, $l = ' + l + '$ and $m_l = ' + ml + '$' + (withS ? ', $m_s = +\\tfrac{1}{2}$' : '') + '?', exact(withS ? 1 : 2),
        ['$n$, $l$ and $m_l$ together pick one orbital (a ' + n + LL[l] + ' orbital).', withS ? 'Fixing $m_s$ too picks one electron: no two electrons share all four quantum numbers.' : 'One orbital holds two electrons, of opposite spin.'],
        'Three quantum numbers name one orbital.', null, { k: 'elec2' }); }
    // allowed: one set breaks a rule
    function setTex(a) { return '$(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + (a[3] > 0 ? '+' : '-') + '\\tfrac{1}{2})$'; }
    function okSet(R2) { var nn = R2.int(1, 5), ll = R2.int(0, nn - 1); return [nn, ll, R2.int(-ll, ll), R2.pick([1, -1])]; }
    var badKind = R.pick(['l=n', 'ml>l', 'l>n']), bad;
    if (badKind === 'l=n') { var nb = R.int(1, 3); bad = [nb, nb, 0, R.pick([1, -1])]; }
    else if (badKind === 'ml>l') { var nb2 = R.int(2, 4), lb = R.int(0, M.min(2, nb2 - 1)); bad = [nb2, lb, lb + R.int(1, 2), R.pick([1, -1])]; }
    else { var nb3 = R.int(1, 3); bad = [nb3, nb3 + 1, 1, R.pick([1, -1])]; }
    var goods = []; while (goods.length < 3) { var g = okSet(R); if (!goods.some(function (x) { return x.join() === g.join(); })) goods.push(g); }
    var why2 = badKind === 'ml>l' ? '$m_l$ must lie between $-l$ and $+l$, but here $l = ' + bad[1] + '$ and $m_l = ' + bad[2] + '$.' : '$l$ can be at most $n - 1 = ' + (bad[0] - 1) + '$, but here $l = ' + bad[1] + '$.';
    return P('Which set of quantum numbers $(n, l, m_l, m_s)$ is <b>not</b> allowed?', mc(setTex(bad), goods.map(setTex)),
      ['Rules: $l = 0$ to $n - 1$; $m_l = -l$ to $+l$; $m_s = \\pm\\tfrac{1}{2}$.', why2, 'The other sets follow all the rules.'],
      'Check that $l < n$ and $|m_l| \\le l$.', null, { k: 'allowed' });
  });

  G('gchem1.orbital-diagrams', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['unp', 'unp', 'rule', 'magnet'], ['unp', 'magnet', 'rule', 'unp'], ['unpTM', 'rule', 'magnet', 'unpTM']));
    if (shape === 'unp' || shape === 'unpTM' || shape === 'magnet') {
      var Z = shape === 'unpTM' ? R.pick([21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]) : R.chance(0.75) ? R.int(1, 20) : R.int(31, 36);
      var cfg = config(Z), u = unpaired(cfg), last = cfg[cfg.length - 1], open = cfg.filter(function (s) { return s[1] % subCap(s[0]) !== 0 || false; });
      var lastOpen = cfg.filter(function (s) { return s[1] < subCap(s[0]); });
      var st = ['Configuration of ' + ELN[Z] + ': $' + cfgTex(cfg, true) + '$.', lastOpen.length ? lastOpen.map(function (s) { return 'The ' + s[0] + ' subshell holds ' + s[1] + ' electron' + (s[1] > 1 ? 's' : '') + ' in ' + subCap(s[0]) / 2 + ' orbitals. By Hund\'s rule: $' + boxes(s[0], s[1]) + '$, so ' + unpairedIn(s[0], s[1]) + ' unpaired.'; }).join(' ') : 'Every subshell is full, so every electron is paired.'];
      if (shape === 'magnet') return P('Is an atom of ' + ELN[Z] + ' ($Z = ' + Z + '$) paramagnetic or diamagnetic?', mcK(['paramagnetic', 'diamagnetic'], u ? 0 : 1),
        st.concat([u + ' unpaired electron' + (u === 1 ? '' : 's') + ': ' + (u ? 'paramagnetic (drawn into a magnetic field).' : 'diamagnetic.')]), 'Unpaired electrons make an atom paramagnetic.', null, { k: 'mag', Z: Z });
      return P('How many unpaired electrons does a ground-state ' + ELN[Z] + ' atom ($Z = ' + Z + '$) have?', exact(u), st.concat(['Total: ' + u + ' unpaired.']),
        'Fill the last subshell one electron per orbital before pairing.', null, { k: 'unp', Z: Z });
    }
    // which rule does a drawn diagram break?
    var cases = [
      { el: 'N', sub: '2p', arr: [2, 1, 0], rule: 'Hund\'s rule', why: 'The 2p electrons paired up while an orbital of the same energy was still empty.' },
      { el: 'O', sub: '2p', arr: [2, 2, 0], rule: 'Hund\'s rule', why: 'Two pairs formed while one 2p orbital was empty; it should be ↑↓ ↑ ↑.' },
      { el: 'C', sub: '2p', arr: [1, -1, 0], rule: 'Hund\'s rule', why: 'Unpaired electrons in equal orbitals should have the same spin.' },
      { el: 'N', sub: '2p', arr: [1, 1, 1], rule: 'none: it is correct', why: 'One electron in each 2p orbital, spins parallel: correct.' },
      { el: 'F', sub: '2p', arr: [2, 2, 1], rule: 'none: it is correct', why: 'Five 2p electrons: two pairs and one single, correct.' },
      { el: 'O', sub: '2p', arr: [3, 1, 0], rule: 'Pauli\'s principle', why: 'An orbital holds at most two electrons, and they must have opposite spins.' },
      { el: 'C', sub: '2p', arr: [4, 0, 0], rule: 'Pauli\'s principle', why: 'Two electrons in one orbital with the same spin share all four quantum numbers.' },
      { el: 'C', sub: '2p', arr: [2, 0, 0], rule: 'Hund\'s rule', why: 'Both 2p electrons share one orbital while two orbitals of the same energy are empty.' },
      { el: 'C', sub: '2p', arr: [1, 1, 0], rule: 'none: it is correct', why: 'Two 2p electrons in separate orbitals with parallel spins: correct.' },
      { el: 'O', sub: '2p', arr: [2, 1, 1], rule: 'none: it is correct', why: 'Four 2p electrons: one pair and two singles with parallel spins, correct.' },
      { el: 'Ne', sub: '2p', arr: [2, 2, 2], rule: 'none: it is correct', why: 'Six 2p electrons fill all three orbitals in pairs: correct.' },
      { el: 'N', sub: '2p', arr: [1, 1, -1], rule: 'Hund\'s rule', why: 'Unpaired electrons in orbitals of equal energy should have parallel spins.' },
      { el: 'O', sub: '2p', arr: [2, 1, -1], rule: 'Hund\'s rule', why: 'The two unpaired 2p electrons should have parallel spins.' },
      { el: 'F', sub: '2p', arr: [3, 2, 0], rule: 'Pauli\'s principle', why: 'An orbital holds at most two electrons, and they must have opposite spins.' },
      { el: 'N', sub: '2p', arr: [4, 1, 0], rule: 'Pauli\'s principle', why: 'Two electrons in one orbital with the same spin share all four quantum numbers.' },
      { el: 'O', sub: '2p', arr: [4, 1, 1], rule: 'Pauli\'s principle', why: 'Two electrons in one orbital with the same spin share all four quantum numbers.' }
    ];
    var cs = R.pick(cases), Zc = SYM.indexOf(cs.el), core = config(Zc).slice(0, -1);
    var tex = cs.arr.map(function (v) { return '\\boxed{' + (v === 2 ? '\\uparrow\\downarrow' : v === 1 ? '\\uparrow\\phantom{\\downarrow}' : v === -1 ? '\\downarrow\\phantom{\\uparrow}' : v === 3 ? '\\uparrow\\downarrow\\uparrow' : v === 4 ? '\\uparrow\\uparrow' : '\\phantom{\\uparrow\\downarrow}') + '}'; }).join('\\,');
    return P('A student draws the 2p orbitals of ' + ELN[Zc] + ' ($' + cfgTex(config(Zc), false) + '$) like this: $$2p:\\ ' + tex + '$$ Which rule, if any, does the drawing break?',
      mc(cs.rule, ['Hund\'s rule', 'Pauli\'s principle', 'the Aufbau principle', 'none: it is correct'].filter(function (r) { return r !== cs.rule; })),
      [cs.why, 'Correct: $2p:\\ ' + boxes('2p', parseInt(cfgTex(config(Zc), false).split('2p^{')[1], 10)) + '$.'],
      'Pauli: two per orbital, opposite spins. Hund: one per orbital, same spin, before pairing.', null, { k: 'rule' });
  });

  // first-row transition-metal ions (and a few main-group ions): [symbol, Z, charge]
  var TMION = [['Sc', 21, 3], ['Ti', 22, 2], ['Ti', 22, 4], ['V', 23, 2], ['V', 23, 3], ['Cr', 24, 2], ['Cr', 24, 3], ['Mn', 25, 2], ['Mn', 25, 3], ['Fe', 26, 2], ['Fe', 26, 3], ['Co', 27, 2], ['Co', 27, 3], ['Ni', 28, 2], ['Cu', 29, 1], ['Cu', 29, 2], ['Zn', 30, 2]];
  function ionName(sym, q) { return sym + '^' + (q > 1 || q < -1 ? M.abs(q) : '') + (q > 0 ? '+' : '-'); }
  function dCount(Z, q) { var c = ionConfig(Z, q), d = c.filter(function (s) { return s[0] === '3d'; })[0]; return d ? d[1] : 0; }

  G('gchem1.ion-configurations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['dcount', 'dcount', 'iso'], ['dcount', 'config', 'unp', 'iso'], ['config', 'unp', 'config', 'tf']));
    if (shape === 'iso') {
      var IS = [['Na+', 'Ne'], ['Mg^2+', 'Ne'], ['Al^3+', 'Ne'], ['F-', 'Ne'], ['O^2-', 'Ne'], ['N^3-', 'Ne'], ['K+', 'Ar'], ['Ca^2+', 'Ar'], ['Cl-', 'Ar'], ['S^2-', 'Ar'], ['P^3-', 'Ar'], ['Li+', 'He'], ['Be^2+', 'He'], ['Br-', 'Kr'], ['Se^2-', 'Kr'], ['Sr^2+', 'Kr'], ['Rb+', 'Kr']];
      var it = R.pick(IS), elSym = it[0].replace(/\^?\d*[+-]$/, ''), q = parseF(it[0]).charge, Zi = { Li: 3, Be: 4, N: 7, O: 8, F: 9, Na: 11, Mg: 12, Al: 13, P: 15, S: 16, Cl: 17, K: 19, Ca: 20, Se: 34, Br: 35, Rb: 37, Sr: 38 }[elSym];
      return P('Which noble gas has the same electron configuration as ' + F(it[0]) + '?', mc(it[1], ['He', 'Ne', 'Ar', 'Kr'].filter(function (x) { return x !== it[1]; })),
        [elSym + ' has $' + Zi + '$ electrons; ' + F(it[0]) + ' has $' + Zi + (q > 0 ? ' - ' + q : ' + ' + (-q)) + ' = ' + (Zi - q) + '$.', 'The noble gas with ' + (Zi - q) + ' electrons is ' + it[1] + ', so they are isoelectronic.'],
        'Count the ion\'s electrons: protons minus the charge.', null, { k: 'iso' });
    }
    var io = R.pick(shape === 'unp' ? TMION.filter(function (x) { return dCount(x[1], x[2]) > 0; }) : TMION), sym = io[0], Z = io[1], qq = io[2], ic = ionConfig(Z, qq), nd = dCount(Z, qq), name = ionName(sym, qq), nc = config(Z);
    var st0 = ['Neutral ' + ELN[Z] + ': $' + cfgTex(nc, true) + '$' + (Z === 24 || Z === 29 ? ' (one of the two exceptions).' : '.'), 'Remove ' + qq + ' electron' + (qq > 1 ? 's' : '') + ', the 4s ones first, then 3d: ' + F(name) + ' is $' + cfgTex(ic, true, true) + '$.'];
    if (shape === 'dcount') return P('How many 3d electrons does the ' + F(name) + ' ion have?', exact(nd), st0.concat(['That is ' + nd + ' d electron' + (nd === 1 ? '' : 's') + '.']),
      'Transition metals lose their 4s electrons before their 3d electrons.', null, { k: 'dcount', Z: Z, q: qq });
    if (shape === 'unp') { var u = unpairedIn('3d', nd); return P('How many unpaired electrons does a free ' + F(name) + ' ion have?', exact(u),
      st0.concat(['By Hund\'s rule the ' + nd + ' d electrons fill five orbitals: $' + boxes('3d', nd) + '$, so ' + u + ' unpaired.']), 'Find the d count first (4s electrons leave first).', null, { k: 'unpI', Z: Z, q: qq }); }
    if (shape === 'tf') { var claim = R.int(0, 2);
      if (claim === 0) return P('True or false: the ' + F(name) + ' ion still has electrons in its 4s orbital.', tf(false), st0.concat(['No 4s electrons remain: they are the first to go.']), 'Which electrons does a transition metal lose first?', null, { k: 'tf' });
      if (claim === 1) return P('True or false: ' + F(name) + ' has ' + nd + ' electrons in its 3d orbitals.', tf(true), st0, 'Remove the 4s electrons first.', null, { k: 'tf' });
      var wrongN = M.max(0, nd - 2) === nd ? nd + 1 : M.max(0, nd - 2);
      return P('True or false: ' + F(name) + ' has ' + wrongN + ' electrons in its 3d orbitals.', tf(false), st0.concat(['It has ' + nd + ', not ' + wrongN + '.']), 'Remove the 4s electrons first.', null, { k: 'tf' }); }
    // config mc with misconception distractors
    var right = '$' + cfgTex(ic, true, true) + '$';
    var dFirst = (function () { var c = nc.map(function (s) { return s.slice(); }), n = qq; ['3d', '4s'].forEach(function (nm) { c.forEach(function (s) { if (s[0] === nm && n > 0) { var k = M.min(s[1], n); s[1] -= k; n -= k; } }); }); return '$' + cfgTex(c.filter(function (s) { return s[1] > 0; }), true, true) + '$'; })();
    var neutral = '$' + cfgTex(nc, true) + '$';
    var noExc = (function () { if (Z !== 24 && Z !== 29) return null; var c = []; var left = Z; SUBS.forEach(function (s) { if (left <= 0) return; var k = M.min(s[1], left); c.push([s[0], k]); left -= k; }); var n = qq; ['4s', '3d'].forEach(function (nm) { c.forEach(function (s) { if (s[0] === nm && n > 0) { var k = M.min(s[1], n); s[1] -= k; n -= k; } }); }); return '$' + cfgTex(c.filter(function (s) { return s[1] > 0; }), true, true) + '$'; })();
    var extra = '$[\\text{Ar}]\\,3d^{' + (nd + qq <= 10 ? nd + qq : nd - 1) + '}$';
    var wr = [dFirst, neutral, noExc, extra].filter(function (w, i, a) { return w && w !== right && a.indexOf(w) === i; });
    return P('Which is the ground-state electron configuration of ' + F(name) + '?', mc(right, wr.slice(0, 3)), st0,
      'The 4s electrons are removed before the 3d electrons.', null, { k: 'cfg', Z: Z, q: qq });
  });

  // photoelectron spectra: approximate binding energies (MJ/mol) by subshell, Z = 1 to 20, as in the visual kit's table
  var PESD = { 1: [1.31], 2: [2.37], 3: [6.26, 0.52], 4: [11.5, 0.9], 5: [19.3, 1.36, 0.8], 6: [28.6, 1.72, 1.09], 7: [39.6, 2.45, 1.4], 8: [52.6, 3.12, 1.31], 9: [67.2, 3.88, 1.68], 10: [84, 4.68, 2.08],
    11: [104, 6.84, 3.67, 0.5], 12: [126, 9.07, 5.31, 0.74], 13: [151, 12.1, 7.79, 1.09, 0.58], 14: [178, 15.1, 10.3, 1.46, 0.79], 15: [208, 18.7, 13.5, 1.95, 1.01], 16: [239, 22.7, 16.5, 2.05, 1], 17: [273, 26.8, 20.2, 2.44, 1.25], 18: [309, 31.5, 24.1, 2.82, 1.52], 19: [347, 37.1, 29.1, 3.93, 2.38, 0.42], 20: [390, 42.7, 34, 4.65, 2.9, 0.59] };
  function pesPeaks(Z) { var c = config(Z); return c.map(function (s, i) { return { sub: s[0], e: s[1], be: PESD[Z][i] }; }); }
  function pesViz(Z) { return { name: 'ch-pes', opts: { el: SYM[Z], quiet: true, edit: false } }; }

  G('gchem1.photoelectron-spectroscopy', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['count', 'identify', 'tf'], ['identify', 'count', 'BE', 'compare'], ['identify', 'compare', 'BE', 'valence', 'tf']));
    var Z = R.int(shape === 'compare' ? 3 : 5, 20), pk = pesPeaks(Z);
    var desc = 'peaks at ' + lst(pk.map(function (x) { return '$' + gx(x.be) + '$'; })) + ' MJ/mol with relative heights ' + pk.map(function (x) { return x.e; }).join(' : ');
    if (shape === 'identify') return P('A photoelectron spectrum shows ' + desc + '. Which element is it? (Give its symbol.)', fAns(SYM[Z]),
      ['From the highest binding energy down, the peaks are ' + lst(pk.map(function (x) { return x.sub; })) + '.', 'Heights count electrons: $' + cfgTex(config(Z), false) + '$.', 'Total: ' + pk.map(function (x) { return x.e; }).join(' + ') + ' = ' + Z + ' electrons, so the element is ' + ELN[Z] + ' (' + SYM[Z] + ').'],
      'Each peak is a subshell; its height is its number of electrons. Add them up.', null, { k: 'pesId', Z: Z }, pesViz(Z));
    if (shape === 'count') { var i = R.int(0, pk.length - 1);
      return P('In the photoelectron spectrum of ' + ELN[Z] + ' ($Z = ' + Z + '$), how many electrons does the peak at $' + qg(pk[i].be, 'MJmol') + '$ represent?', exact(pk[i].e),
        ['Configuration: $' + cfgTex(config(Z), false) + '$. In order of falling binding energy the peaks are ' + lst(pk.map(function (x) { return x.sub + ' (' + gx(x.be) + ')'; })) + '.', 'The peak at ' + gx(pk[i].be) + ' MJ/mol is ' + pk[i].sub + ', which holds ' + pk[i].e + ' electron' + (pk[i].e > 1 ? 's' : '') + '.'],
        'Match peaks to subshells from the left (highest binding energy is 1s).', null, { k: 'pesCount', Z: Z }, pesViz(Z)); }
    if (shape === 'BE') { var j = R.int(0, pk.length - 1), hv = R.pick([159, 400, 500, 1000].filter(function (v) { return v > pk[0].be + 20; })), KE = rd(hv - pk[j].be, 2);
      return P('In a PES experiment on ' + ELN[Z] + ', photons with energy $' + qg(hv, 'MJmol') + '$ eject electrons from one subshell with a kinetic energy of $' + qg(KE, 'MJmol') + '$. What is the binding energy of those electrons?', ans(hv - KE, 0.01),
        ['Energy is conserved: $\\text{BE} = h\\nu - KE = ' + gx(hv) + ' - ' + gx(KE) + ' = ' + qg(rd(hv - KE, 2), 'MJmol') + '$.', 'For ' + ELN[Z] + ', that is the ' + pk[j].sub + ' subshell.'],
        'The photon\'s energy goes into freeing the electron and into its motion.', 'MJmol', { k: 'BE', hv: hv, KE: KE }); }
    if (shape === 'compare') { var Z2 = Z + R.pick([1, 2, 8]); if (Z2 > 20) Z2 = Z - 1; var sub = R.pick(['1s', pk.length > 1 ? '2s' : '1s']);
      var hiZ = M.max(Z, Z2);
      return P('Compare the photoelectron spectra of ' + ELN[Z] + ' and ' + ELN[Z2] + '. Whose ' + sub + ' peak is at the higher binding energy (farther left)?', mcK([cap(ELN[Z]), cap(ELN[Z2]), 'They are at the same binding energy'], hiZ === Z ? 0 : 1),
        [cap(ELN[hiZ]) + ' has more protons (' + hiZ + ' against ' + M.min(Z, Z2) + ').', 'More nuclear charge pulls every subshell in harder, so each of its peaks, ' + sub + ' included, sits at a higher binding energy.'],
        'Which nucleus has more protons?', null, { k: 'pesCmp' }); }
    if (shape === 'valence') { var last = pk[pk.length - 1];
      return P('The photoelectron spectrum of ' + ELN[Z] + ' has ' + desc + '. Which peak comes from the subshell that loses an electron when the atom is ionized for the first time?', mc('the peak at $' + gx(last.be) + '$ MJ/mol', pk.slice(0, -1).map(function (x) { return 'the peak at $' + gx(x.be) + '$ MJ/mol'; }).slice(-3)),
        ['The first ionization removes the easiest electron to remove: an outermost electron, farthest from the nucleus and most shielded.', 'It comes from the peak with the lowest binding energy: $' + gx(last.be) + '$ MJ/mol (' + last.sub + '), close to ' + ELN[Z] + '\'s first ionization energy.'],
        'The outermost electrons are held least tightly.', null, { k: 'val' }, pesViz(Z)); }
    var tfs = [['In a photoelectron spectrum, the tallest peak belongs to the electrons with the highest binding energy.', false, 'Height counts electrons, not energy. In sodium the tallest peak is 2p (6 electrons), far below 1s in binding energy.'],
      ['The peak with the highest binding energy comes from the electrons closest to the nucleus.', true, 'The 1s electrons are nearest the nucleus and feel almost all of its charge, so they are the hardest to remove.'],
      ['The valence electrons give the peak farthest to the left on a PES graph (binding energy increasing to the left).', false, 'Valence electrons are the easiest to remove: their peak is farthest to the right.'],
      ['Two peaks of equal height in one spectrum come from subshells with the same number of electrons.', true, 'Peak height is proportional to the number of electrons in the subshell.']];
    var t = R.pick(tfs);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Position is energy; height is the number of electrons.', null, { k: 'tf' });
  });


  // ================================================================== UNIT 3: EXPLAINING PERIODIC TRENDS
  // first ionization energies, kJ/mol (NIST Atomic Spectra Database, as in the visual kit)
  var IE1 = { 1: 1312, 2: 2372, 3: 520.2, 4: 899.5, 5: 800.6, 6: 1086.5, 7: 1402.3, 8: 1313.9, 9: 1681, 10: 2080.7, 11: 495.8, 12: 737.7, 13: 577.5, 14: 786.5, 15: 1011.8, 16: 999.6, 17: 1251.2, 18: 1520.6, 19: 418.8, 20: 589.8 };
  // successive ionization energies, kJ/mol (NIST ASD), first few for Z = 3 to 20
  var SIE = { 3: [520.2, 7298.1, 11815], 4: [899.5, 1757.1, 14848.7, 21006.6], 5: [800.6, 2427.1, 3659.7, 25025.8, 32826.7], 6: [1086.5, 2352.6, 4620.5, 6222.7, 37831, 47277],
    7: [1402.3, 2856, 4578.1, 7475, 9444.9, 53266.6, 64360], 8: [1313.9, 3388.3, 5300.5, 7469.2, 10989.5, 13326.5, 71330, 84078], 17: [1251.2, 2298, 3822, 5158.6, 6542, 9362, 11018, 33604, 38600],
    11: [495.8, 4562, 6910.3, 9543], 12: [737.7, 1450.7, 7732.7, 10542.5, 13630], 13: [577.5, 1816.7, 2744.8, 11577, 14842], 14: [786.5, 1577.1, 3231.6, 4355.5, 16091, 19805],
    15: [1011.8, 1907, 2914.1, 4963.6, 6273.9, 21267], 16: [999.6, 2252, 3357, 4556, 7004.3, 8495.8, 27107], 19: [418.8, 3052, 4420, 5877], 20: [589.8, 1145.4, 4912.4, 6491, 8153] };
  var VAL = { 1: 1, 2: 2, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 16: 6, 17: 7, 18: 8, 19: 1, 20: 2, 31: 3, 32: 4, 33: 5, 34: 6, 35: 7, 36: 8 };
  var GROUPOF = { 1: 1, 2: 2, 3: 13, 4: 14, 5: 15, 6: 16, 7: 17, 8: 18 };
  function shellOf(Z) { return Z <= 2 ? 1 : Z <= 10 ? 2 : Z <= 18 ? 3 : 4; }

  G('gchem1.coulombs-law-atoms', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['scale', 'scale', 'compare', 'scale'], ['scale', 'compare', 'explain', 'scale'], ['energy', 'scale', 'explain', 'compare']));
    if (shape === 'scale') {
      var a = R.pick([1, 2, 3, 4]), b = R.pick([1, 2, 3]), c = R.pick([2, 3, 0.5, 4, 1.5]), en = ctx.level > 1 && R.coin();
      if (a === 1 && b === 1) a = 2;
      var cq = Q.from(c), ratio = Q(a * b).div(en ? cq : cq.mul(cq));
      var what = []; if (a > 1) what.push('one charge is multiplied by ' + a); if (b > 1) what.push('the other charge is multiplied by ' + b); what.push(c < 1 ? 'the distance is halved' : 'the distance is multiplied by ' + c);
      return P('Two opposite charges attract each other. If ' + lst(what) + ', by what factor does the ' + (en ? 'energy needed to pull them apart (proportional to $q_1q_2/r$)' : 'force between them') + ' change? (A fraction or decimal is fine.)',
        { t: 'num', v: ratio.toPlain(), rtol: 0.01 },
        [(en ? '$E \\propto \\dfrac{q_1 q_2}{r}$' : '$F \\propto \\dfrac{q_1 q_2}{r^2}$') + '.', 'The charges multiply the top by $' + a * b + '$; the distance multiplies the bottom by $' + (en ? cq.toTex() : cq.mul(cq).toTex()) + '$' + (en ? '' : ' (squared)') + '.', 'Factor: $' + dfr(a * b, en ? cq.toTex() : cq.mul(cq).toTex()) + ' = ' + ratio.toTex() + '$.'],
        en ? 'Energy goes as $q_1q_2/r$: no square on the distance.' : 'Force goes as $q_1q_2/r^2$: square the distance factor.', null, { k: 'scale', a: a, b: b, c: c, en: en });
    }
    var PAIRS = [[3, 11, 'g'], [11, 19, 'g'], [4, 12, 'g'], [12, 20, 'g'], [9, 17, 'g'], [8, 16, 'g'], [3, 6, 'p'], [11, 17, 'p'], [6, 9, 'p'], [12, 14, 'p'], [11, 12, 'p'], [14, 17, 'p'], [6, 7, 'p']];
    var pr = R.pick(PAIRS), A = pr[0], B = pr[1], hi = IE1[A] > IE1[B] ? A : B, lo = hi === A ? B : A;
    var reason = pr[2] === 'g' ? cap(ELN[lo]) + '\'s outer electron is in shell ' + shellOf(lo) + ', farther from the nucleus than ' + ELN[hi] + '\'s (shell ' + shellOf(hi) + '), while the core hides about the same share of the nuclear charge.' : 'Both outer electrons are in shell ' + shellOf(A) + ', but ' + ELN[hi] + ' has more protons (' + hi + ' against ' + lo + ') and same-shell electrons hide little of the extra charge.';
    if (shape === 'compare') return P('Which atom holds its outermost electron more tightly (has the higher first ionization energy): ' + ELN[A] + ' or ' + ELN[B] + '?', mcK([cap(ELN[A]), cap(ELN[B])], hi === A ? 0 : 1),
      [reason, 'So ' + ELN[hi] + ' holds its electron more tightly (' + gx(M.round(IE1[hi])) + ' against ' + gx(M.round(IE1[lo])) + ' kJ/mol).'],
      pr[2] === 'g' ? 'Same group: compare distances.' : 'Same period: compare nuclear charges.', null, { k: 'cmp', hi: hi });
    if (shape === 'explain') {
      var right = pr[2] === 'g' ? 'Its outermost electron is farther from the nucleus, and the inner electrons hide about the same share of the nuclear charge.' : 'It has more protons pulling on electrons in the same shell, so its outer electrons are held more tightly.';
      var q = pr[2] === 'g' ? 'Why is the first ionization energy of ' + ELN[lo] + ' lower than that of ' + ELN[hi] + '?' : 'Why is the first ionization energy of ' + ELN[hi] + ' higher than that of ' + ELN[lo] + '?';
      var wrongs = pr[2] === 'g' ? [cap(ELN[lo]) + ' wants to lose its electron more, to reach an octet.', 'It has more protons, so it attracts its electrons less.', 'Its outermost electron is closer to the nucleus.'] : [cap(ELN[hi]) + ' is closer to having a full octet, so it wants to keep its electrons.', 'Its outermost electrons are in a higher shell, farther from the nucleus.', 'It has fewer protons, so its electrons repel each other less.'];
      return P(q, mc(right, wrongs), [reason, 'Explanations should name a charge and a distance (Coulomb\'s law), not what an atom "wants".'], 'Think about charge and distance.', null, { k: 'expl' });
    }
    // energy of an ion pair
    var IP = [['Na+', 'Cl-', 283], ['K+', 'Cl-', 319], ['Na+', 'F-', 235], ['Li+', 'F-', 209], ['Mg^2+', 'O^2-', 212], ['Ca^2+', 'O^2-', 240], ['K+', 'Br-', 334], ['Mg^2+', 'F-', 205]];
    var ip = R.pick(IP), q1 = parseF(ip[0]).charge, q2 = parseF(ip[1]).charge, e = 1.602e-19, kC = 8.99e9, Ec = kC * q1 * q2 * e * e / (ip[2] * 1e-12);
    return P('Two ions, ' + F(ip[0]) + ' and ' + F(ip[1]) + ', touch, with their centers $' + qg(ip[2], 'pm') + '$ apart. Find their Coulomb energy $E = kq_1q_2/r$ in joules ($k = 8.99 \\times 10^{9}\\ \\text{N·m}^2/\\text{C}^2$, $e = 1.602 \\times 10^{-19}\\ \\text{C}$). Include the sign.',
      ans(Ec, 0.01),
      ['$q_1 q_2 = (' + (q1 === 1 ? '+' : '+' + q1) + 'e)(' + (q2 === -1 ? '-' : q2) + 'e) = ' + (q1 * q2 === -1 ? '-' : q1 * q2) + '(1.602 \\times 10^{-19})^2 = ' + qx(q1 * q2 * e * e, 'none') + '\\ \\text{C}^2$.', '$r = ' + gx(ip[2]) + ' \\times 10^{-12}\\ \\text{m}$.', '$E = ' + dfr('(8.99 \\times 10^{9})(' + fx(q1 * q2 * e * e) + ')', gx(ip[2]) + ' \\times 10^{-12}') + ' = ' + qx(Ec, 'J') + '$. Negative: energy is needed to separate them.'],
      'Charges in coulombs, distance in meters.', 'J', { k: 'coul', q1: q1, q2: q2, r: ip[2] });
  });

  var MAINZ = [3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20, 31, 32, 33, 34, 35];
  function zeff(Z) { return VAL[Z]; } // simple model: Z minus core electrons = valence electrons for main-group atoms
  function coreN(Z) { return Z - VAL[Z]; }

  G('gchem1.effective-nuclear-charge', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['zeff', 'zeff', 'core'], ['zeff', 'compare', 'why', 'tf'], ['compare', 'zeff', 'why', 'tf']));
    var Z = R.pick(MAINZ);
    if (shape === 'zeff' || shape === 'core') {
      var cfg = config(Z), core = coreN(Z);
      if (shape === 'core') return P('How many core (inner-shell) electrons does a ' + ELN[Z] + ' atom ($Z = ' + Z + '$) have?', exact(core),
        ['Configuration: $' + cfgTex(cfg, true) + '$.', 'Core electrons are all those below the valence shell' + (Z > 30 ? ', including the filled 3d subshell' : '') + ': $' + core + '$.'], 'Everything except the outermost shell.', null, { k: 'core', Z: Z });
      return P('Estimate $Z_\\text{eff}$ for a valence electron of ' + ELN[Z] + ' ($Z = ' + Z + '$), using $Z_\\text{eff} \\approx Z - (\\text{core electrons})$.', exact(zeff(Z)),
        ['Configuration: $' + cfgTex(cfg, true) + '$; the valence shell is $n = ' + shellOf(Z) + '$.', 'Core electrons: $' + core + '$' + (Z > 30 ? ' (the argon core plus the filled 3d subshell)' : '') + '.', '$Z_\\text{eff} \\approx ' + Z + ' - ' + core + ' = ' + zeff(Z) + '$.'],
        'Subtract only the inner-shell electrons.', null, { k: 'zeff', Z: Z });
    }
    if (shape === 'compare') {
      var per = R.pick([[3, 4, 5, 6, 7, 8, 9], [11, 12, 13, 14, 15, 16, 17], [31, 32, 33, 34, 35]]), two = R.sample(per, 2), hi = two[0] > two[1] ? two[0] : two[1];
      return P('Which has the larger effective nuclear charge on its valence electrons: ' + ELN[two[0]] + ' or ' + ELN[two[1]] + '?', mcK([cap(ELN[two[0]]), cap(ELN[two[1]]), 'They are the same'], hi === two[0] ? 0 : 1),
        ['Both are in period ' + shellOf(hi) + ', with the same core of ' + coreN(hi) + ' electrons.', cap(ELN[two[0]]) + ': $' + two[0] + ' - ' + coreN(two[0]) + ' = ' + zeff(two[0]) + '$. ' + cap(ELN[two[1]]) + ': $' + two[1] + ' - ' + coreN(two[1]) + ' = ' + zeff(two[1]) + '$.', 'More protons, same core: ' + ELN[hi] + ' has the larger $Z_\\text{eff}$, so its atom is smaller.'],
        'Same core, so the one with more protons wins.', null, { k: 'zcmp' });
    }
    if (shape === 'why') {
      var w = R.pick([
        ['Atomic radius decreases from sodium to chlorine. Why?', 'The nuclear charge grows while the added electrons go into the same shell and shield each other poorly, so $Z_\\text{eff}$ rises and pulls the shell in.', ['Chlorine has more electrons, and more electrons take up less room.', 'Each added electron fills a new, smaller shell.', 'Chlorine wants to gain an electron, so it pulls its electrons closer.']],
        ['Atomic radius increases from lithium to potassium. Why?', 'Each step down adds a new shell farther from the nucleus, while the core hides about the same share of the charge ($Z_\\text{eff} \\approx 1$).', ['Potassium has more protons, and protons push electrons outward.', 'Potassium\'s valence electron feels a much larger effective nuclear charge.', 'Potassium has fewer core electrons to hold the outer electron in.']]
      ]);
      return P(w[0], mc(w[1], w[2]), ['Use $Z_\\text{eff}$ and the shell number: the two things Coulomb\'s law cares about.', w[1]], 'Think about which shell the valence electron is in and what charge it feels.', null, { k: 'why' });
    }
    var t = R.pick([['Electrons in the same shell shield each other about as well as core electrons do.', false, 'Same-shell electrons are as often farther out as closer in, so they hide little charge. Core electrons, much closer to the nucleus, hide nearly one proton each.'],
      ['Across a period, $Z_\\text{eff}$ on the valence electrons increases.', true, 'Each step adds a proton and an electron in the same shell, which shields poorly: $Z_\\text{eff}$ rises by about one.'],
      ['Down a group, the simple $Z_\\text{eff}$ on the valence electrons stays about the same.', true, 'Lithium, sodium and potassium all have $Z_\\text{eff} \\approx 1$; what changes is the distance.'],
      ['A potassium atom\'s valence electron feels the full charge of 19 protons.', false, 'Its 18 core electrons hide nearly all of it: $Z_\\text{eff} \\approx 19 - 18 = 1$.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Core electrons shield well; same-shell electrons shield poorly.', null, { k: 'tf' });
  });

  G('gchem1.successive-ionization', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['nval', 'nval', 'ion'], ['nval', 'group', 'ion', 'which'], ['which', 'group', 'ion', 'tf']));
    var Z = R.pick(Object.keys(SIE).map(Number)), ie = SIE[Z], v = VAL[Z], shown = ie.slice(0, M.min(ie.length, v + 1 + R.int(0, 1)));
    if (shown.length < v + 1) shown = ie.slice(0, v + 1);
    var tbl = shown.map(function (x, i) { return '$IE_{' + (i + 1) + '} = ' + gx(M.round(x)) + '$'; }).join(', ');
    var gaps = shown.slice(1).map(function (x, i) { return M.round(x - shown[i]); });
    var stJump = ['Gaps between neighbors: ' + gaps.map(function (g) { return gx(g); }).join(', ') + ' kJ/mol.', 'The huge jump is between $IE_{' + v + '}$ and $IE_{' + (v + 1) + '}$: the ' + ord(v + 1) + ' electron would come from the core.', 'So the atom has ' + v + ' valence electron' + (v > 1 ? 's' : '') + '.'];
    var period = Z <= 10 ? 2 : Z <= 18 ? 3 : 4, grp = Z >= 19 ? v : GROUPOF[v];
    var intro = 'An element has these successive ionization energies (kJ/mol): ' + tbl + '. ';
    if (shape === 'nval' && R.coin()) return P(intro + 'Between which two ionization energies is the largest jump?', mc('$IE_{' + v + '}$ and $IE_{' + (v + 1) + '}$', shown.slice(1).map(function (x, i) { return i + 1; }).filter(function (i) { return i !== v; }).map(function (i) { return '$IE_{' + i + '}$ and $IE_{' + (i + 1) + '}$'; }).slice(0, 3).concat(v === 1 ? ['there is no jump'] : [])), stJump, 'Compare the gaps between neighbors.', null, { k: 'jump', Z: Z });
    if (shape === 'nval') return P(intro + 'How many valence electrons does it have?', exact(v), stJump, 'Look for the one step that is far bigger than the others.', null, { k: 'nval', Z: Z });
    if (shape === 'group') return P(intro + 'In which group of the periodic table is it?', mc('Group ' + grp, R.sample([1, 2, 13, 14, 15, 16].filter(function (g) { return g !== grp; }), 3).map(function (g) { return 'Group ' + g; })),
      stJump.concat(['Main-group elements with ' + v + ' valence electron' + (v > 1 ? 's are' : ' are') + ' in group ' + grp + '.']), 'The number before the jump is the number of valence electrons.', null, { k: 'grp', Z: Z });
    if (shape === 'ion') {
      if ([3, 4, 11, 12, 13, 19, 20].indexOf(Z) < 0) return P(intro + 'How many electrons can it lose before it would have to give up a core electron?', exact(v), stJump, 'Count the electrons removed before the big jump.', null, { k: 'nval', Z: Z });
      return P(intro + 'This element is a metal. What charge does its usual ion have? (Write it like +2.)', exact(v),
        stJump.concat(['Removing the ' + v + ' valence electron' + (v > 1 ? 's' : '') + ' is affordable; the next one is not. Its ion is ' + v + '+.']), 'Count the electrons removed before the big jump.', null, { k: 'ion', Z: Z });
    }
    if (shape === 'which') { var Zp = [11, 12, 13, 14, 15, 16].indexOf(Z) >= 0 ? Z : R.pick([11, 12, 13, 14, 15, 16]); var ie2 = SIE[Zp], v2 = VAL[Zp], sh2 = ie2.slice(0, v2 + 2);
      var gaps2 = sh2.slice(1).map(function (x, i) { return M.round(x - sh2[i]); });
      return P('A period 3 element has these successive ionization energies (kJ/mol): ' + sh2.map(function (x, i) { return '$IE_{' + (i + 1) + '} = ' + gx(M.round(x)) + '$'; }).join(', ') + '. Which element is it? (Give its symbol.)', fAns(SYM[Zp]),
        ['Gaps between neighbors: ' + gaps2.map(function (g) { return gx(g); }).join(', ') + ' kJ/mol.', 'The huge jump comes after electron ' + v2 + ', so it has ' + v2 + ' valence electrons.', 'In period 3 that is ' + ELN[Zp] + ' (' + SYM[Zp] + ').'], 'Find the number of valence electrons, then count across period 3.', null, { k: 'which', Z: Zp }); }
    var t = R.pick([['For any atom, $IE_2$ is larger than $IE_1$.', true, 'After one electron leaves, the same protons pull on fewer electrons, so the next one is held more tightly.'],
      ['Magnesium\'s third ionization energy is only a little larger than its second.', false, 'It is over five times larger (7733 against 1451 kJ/mol): the third electron comes from the neon core.'],
      ['Sodium\'s second ionization energy is smaller than its first, because $\\mathrm{Na^+}$ has a full octet.', false, 'It is about nine times larger (4562 against 496 kJ/mol): the second electron comes from the core.'],
      ['A big jump between $IE_3$ and $IE_4$ means the element has three valence electrons.', true, 'Three electrons come off at modest cost; the fourth would come from the core.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Each electron removed costs more; core electrons cost far more.', null, { k: 'tf' });
  });

  var EXC = [[4, 5, 'sub'], [7, 8, 'pair'], [12, 13, 'sub'], [15, 16, 'pair']], NORMAL = [[5, 6], [6, 7], [8, 9], [11, 12], [13, 14], [14, 15], [16, 17], [3, 4], [9, 10]];
  function excReason(kind, a, b) {
    return kind === 'sub' ? cap(ELN[b]) + '\'s outermost electron is the first one in a ' + (b < 10 ? '2p' : '3p') + ' subshell, which is higher in energy and partly shielded by the filled ' + (b < 10 ? '2s' : '3s') + ' subshell, so it is easier to remove than ' + ELN[a] + '\'s ' + (b < 10 ? '2s' : '3s') + ' electron.'
      : cap(ELN[b]) + '\'s outermost electron is the first paired one in its ' + (b < 10 ? '2p' : '3p') + ' subshell; repulsion from its partner makes it easier to remove than one of ' + ELN[a] + '\'s three unpaired ' + (b < 10 ? '2p' : '3p') + ' electrons.';
  }

  G('gchem1.trend-exceptions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['pair', 'pair', 'tf'], ['pair', 'explain', 'rank'], ['explain', 'rank', 'pair', 'tf']));
    if (shape === 'pair') {
      var useExc = R.chance(0.6), pr = useExc ? R.pick(EXC) : R.pick(NORMAL), A = pr[0], B = pr[1], hi = IE1[A] > IE1[B] ? A : B, sw = R.coin();
      var names = sw ? [B, A] : [A, B];
      return P('Which has the higher first ionization energy: ' + ELN[names[0]] + ' or ' + ELN[names[1]] + '?', mcK([cap(ELN[names[0]]), cap(ELN[names[1]])], hi === names[0] ? 0 : 1),
        useExc ? ['These two break the usual rise across a period.', excReason(pr[2], A, B), 'Data: ' + ELN[A] + ' ' + gx(M.round(IE1[A])) + ', ' + ELN[B] + ' ' + gx(M.round(IE1[B])) + ' kJ/mol.']
          : ['Same period, so the usual trend holds: ' + ELN[B] + ' has one more proton and its new electron goes into a subshell that is already started' + (pr[1] === 10 ? '' : '') + '.', 'Data: ' + ELN[A] + ' ' + gx(M.round(IE1[A])) + ', ' + ELN[B] + ' ' + gx(M.round(IE1[B])) + ' kJ/mol.'],
        'Watch for the steps from group 2 to 13 and from group 15 to 16.', null, { k: 'pair', hi: hi });
    }
    if (shape === 'explain') {
      var ex0 = R.pick(EXC), a = ex0[0], b = ex0[1];
      var right = ex0[2] === 'sub' ? 'The electron removed from ' + ELN[b] + ' is in a higher-energy p subshell, partly shielded by the filled s subshell.' : 'The electron removed from ' + ELN[b] + ' is paired in a p orbital, and repulsion from its partner makes it easier to remove.';
      var other = ex0[2] === 'sub' ? 'The electron removed from ' + ELN[b] + ' is paired in a p orbital, and repulsion from its partner makes it easier to remove.' : 'The electron removed from ' + ELN[b] + ' is in a higher-energy p subshell, partly shielded by the filled s subshell.';
      return P('The first ionization energy of ' + ELN[b] + ' (' + gx(M.round(IE1[b])) + ' kJ/mol) is lower than that of ' + ELN[a] + ' (' + gx(M.round(IE1[a])) + ' kJ/mol), although ' + ELN[b] + ' has more protons. Which explanation is best?',
        mc(right, [other, cap(ELN[b]) + ' has a smaller nuclear charge than ' + ELN[a] + '.', cap(ELN[a]) + ' has a full octet, so it holds its electrons tightly.']),
        [cap(ELN[a]) + ': $' + cfgTex(config(a), true) + '$; ' + ELN[b] + ': $' + cfgTex(config(b), true) + '$.', excReason(ex0[2], a, b)],
        'Draw both orbital diagrams and look at the electron that leaves.', null, { k: 'expl' });
    }
    if (shape === 'rank') {
      var start = R.pick([4, 6, 7, 12, 14, 15]), trio = [start, start + 1, start + 2].filter(function (z) { return IE1[z]; }), sorted = trio.slice().sort(function (x, y) { return IE1[x] - IE1[y]; });
      function ordTxt(arr) { return arr.map(function (z) { return SYM[z]; }).join(' < '); }
      var right2 = ordTxt(sorted), wrong = [ordTxt(trio), ordTxt(trio.slice().reverse()), ordTxt([trio[1], trio[0], trio[2]]), ordTxt([trio[0], trio[2], trio[1]])].filter(function (x, i, arr) { return x !== right2 && arr.indexOf(x) === i; });
      var exc = EXC.filter(function (e) { return trio.indexOf(e[0]) >= 0 && trio.indexOf(e[1]) >= 0; });
      return P('Rank ' + lst(trio.map(function (z) { return ELN[z]; })) + ' from lowest to highest first ionization energy.', mc(right2, wrong.slice(0, 3)),
        (exc.length ? [excReason(exc[0][2], exc[0][0], exc[0][1])] : ['No group 2→13 or 15→16 step here, so the usual rise across the period holds.']).concat(['Data: ' + trio.map(function (z) { return SYM[z] + ' ' + gx(M.round(IE1[z])); }).join(', ') + ' kJ/mol.']),
        'The general rise has dips after groups 2 and 15.', null, { k: 'rank' });
    }
    var t = R.pick([['Oxygen has a higher first ionization energy than nitrogen, because it has more protons.', false, excReason('pair', 7, 8)],
      ['Boron has a lower first ionization energy than beryllium.', true, excReason('sub', 4, 5)],
      ['Aluminum has a higher first ionization energy than magnesium.', false, excReason('sub', 12, 13)],
      ['Sulfur has a lower first ionization energy than phosphorus.', true, excReason('pair', 15, 16)],
      ['Carbon has a higher first ionization energy than boron.', true, 'The usual rise: one more proton, and the new electron joins a p subshell that is already started.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Watch the steps from group 2 to 13 and from 15 to 16.', null, { k: 'tf' });
  });

  // ionic radii, pm (Shannon 1976, six-coordinate; Fe and Mn high spin), and covalent radii of atoms (Cordero 2008)
  var IR = { 'O^2-': 140, 'F-': 133, 'Na+': 102, 'Mg^2+': 72, 'Al^3+': 53.5, 'S^2-': 184, 'Cl-': 181, 'K+': 138, 'Ca^2+': 100, 'Se^2-': 198, 'Br-': 196, 'Rb+': 152, 'Sr^2+': 118,
    'Li+': 76, 'Be^2+': 45, 'I-': 220, 'Fe^2+': 78, 'Fe^3+': 64.5, 'Mn^2+': 83, 'Mn^3+': 64.5, 'Cu+': 77, 'Cu^2+': 73 };
  var ISOSETS = [['O^2-', 'F-', 'Na+', 'Mg^2+', 'Al^3+'], ['S^2-', 'Cl-', 'K+', 'Ca^2+'], ['Se^2-', 'Br-', 'Rb+', 'Sr^2+']];
  var ATOMR = { Na: 166, Cl: 102, K: 203, Br: 120, Mg: 141, O: 66, F: 57, S: 105, Ca: 176, Li: 128, I: 139, Al: 121 };
  var ZOF = { O: 8, F: 9, Na: 11, Mg: 12, Al: 13, S: 16, Cl: 17, K: 19, Ca: 20, Se: 34, Br: 35, Rb: 37, Sr: 38, Li: 3, Be: 4, I: 53, Fe: 26, Mn: 25, Cu: 29 };
  function ionEl(s) { return s.replace(/\^?\d*[+-]$/, ''); }

  G('gchem1.ionic-radii', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['atomion', 'iso', 'group'], ['iso', 'atomion', 'charges', 'iso'], ['iso', 'rank', 'charges', 'tf']));
    if (shape === 'iso' || shape === 'rank') {
      var set = R.pick(ISOSETS), pick = shape === 'rank' ? set.slice() : R.sample(set, 3), big = R.coin();
      var byZ = pick.slice().sort(function (a, b) { return ZOF[ionEl(a)] - ZOF[ionEl(b)]; }), ans0 = big ? byZ[0] : byZ[byZ.length - 1];
      var ne = ZOF[ionEl(set[0])] - parseF(set[0]).charge;
      var st = ['Count electrons: each ion has ' + ne + ' (isoelectronic with ' + SYM[ne] + ').', 'Protons: ' + byZ.map(function (s) { return F(s) + ' ' + ZOF[ionEl(s)]; }).join(', ') + '. With the electrons fixed, more protons pull them in tighter.', 'Radii: ' + byZ.map(function (s) { return F(s) + ' ' + gx(IR[s]) + ' pm'; }).join(', ') + '.'];
      if (shape === 'rank') { var rt = byZ.map(function (s) { return ft(s); }).join(' > '), wr = [byZ.slice().reverse().map(ft).join(' > '), [byZ[1], byZ[0]].concat(byZ.slice(2)).map(ft).join(' > '), byZ.slice(0, -2).concat([byZ[byZ.length - 1], byZ[byZ.length - 2]]).map(ft).join(' > ')];
        return P('Rank these ions from largest to smallest: ' + lst(R.shuffle(byZ).map(F)) + '.', mc('$' + rt + '$', wr.map(function (x) { return '$' + x + '$'; })), st, 'Same electrons: more protons, smaller ion.', null, { k: 'rank' }); }
      return P('Which of these ions is the ' + (big ? 'largest' : 'smallest') + ': ' + lst(pick.map(F)) + '?', mc(F(ans0), pick.filter(function (s) { return s !== ans0; }).map(F)), st,
        'Same number of electrons: compare the numbers of protons.', null, { k: 'iso', ans: ans0 });
    }
    if (shape === 'atomion') {
      var io = R.pick(['Na+', 'Cl-', 'K+', 'Br-', 'Mg^2+', 'O^2-', 'F-', 'S^2-', 'Ca^2+', 'Li+', 'Al^3+']), el = ionEl(io), cat = parseF(io).charge > 0;
      return P('Which is larger: a ' + ELN[ZOF[el]] + ' atom or the ' + F(io) + ' ion?', mcK(['The ' + ELN[ZOF[el]] + ' atom', 'The ' + F(io) + ' ion', 'They are the same size'], cat ? 0 : 1),
        [cat ? 'The cation has lost its whole outer shell; the remaining electrons are held by the same protons, so it is much smaller.' : 'The anion has extra electrons repelling each other, held by the same protons, so its cloud spreads out.', 'Radii: ' + el + ' atom ' + ATOMR[el] + ' pm; ' + F(io) + ' ' + gx(IR[io]) + ' pm.'],
        cat ? 'What does losing the outer electrons do?' : 'What do extra electrons do to the cloud?', null, { k: 'ai', cat: cat });
    }
    if (shape === 'charges') {
      var pair = R.pick([['Fe^2+', 'Fe^3+'], ['Mn^2+', 'Mn^3+'], ['Cu+', 'Cu^2+']]), small = R.coin(), ansI = small ? pair[1] : pair[0];
      return P('Which is ' + (small ? 'smaller' : 'larger') + ': ' + F(pair[0]) + ' or ' + F(pair[1]) + '?', mcK([F(pair[0]), F(pair[1])], ansI === pair[0] ? 0 : 1),
        ['Same nucleus. ' + F(pair[1]) + ' has one electron fewer, so less repulsion and the same pull: it is smaller.', 'Radii: ' + F(pair[0]) + ' ' + gx(IR[pair[0]]) + ' pm, ' + F(pair[1]) + ' ' + gx(IR[pair[1]]) + ' pm.'],
        'Same protons, fewer electrons.', null, { k: 'ch' });
    }
    if (shape === 'group') {
      var gs = R.pick([['Li+', 'Na+', 'K+'], ['F-', 'Cl-', 'Br-'], ['Mg^2+', 'Ca^2+', 'Sr^2+']]), lg = R.coin(), ansG = lg ? gs[2] : gs[0];
      return P('Which ion is ' + (lg ? 'largest' : 'smallest') + ': ' + lst(R.shuffle(gs).map(F)) + '?', mc(F(ansG), gs.filter(function (s) { return s !== ansG; }).map(F)),
        ['They are in the same group. Each one down has one more filled shell, so its electrons sit farther out.', 'Radii: ' + gs.map(function (s) { return F(s) + ' ' + gx(IR[s]) + ' pm'; }).join(', ') + '.'],
        'More shells, larger ion.', null, { k: 'grp' });
    }
    var t = R.pick([['In the series $\\mathrm{O^{2-}}$, $\\mathrm{F^-}$, $\\mathrm{Na^+}$, $\\mathrm{Mg^{2+}}$, the ion with the most protons is the largest.', false, 'All four have 10 electrons; more protons pull them in tighter, so $\\mathrm{Mg^{2+}}$ is the smallest.'],
      ['An anion is larger than the neutral atom it came from.', true, 'Extra electrons repel each other, and the same nuclear charge holds the larger cloud.'],
      ['$\\mathrm{K^+}$ is larger than a potassium atom.', false, 'Potassium loses its whole 4s shell: $\\mathrm{K^+}$ is 138 pm, the atom 203 pm.'],
      ['$\\mathrm{S^{2-}}$ is larger than $\\mathrm{Cl^-}$.', true, 'Both have 18 electrons; sulfur has one proton fewer, so its ion is a little larger (184 against 181 pm).']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'For isoelectronic ions, count protons.', null, { k: 'tf' });
  });


  // ================================================================== UNIT 4: BONDING AND MOLECULAR STRUCTURE
  // bond lengths (pm, NIST) and bond energies (kJ/mol, standard bond enthalpy tables), as in the visual kit
  var BD = { H2: [74, 436, 'H–H'], HF: [92, 570, 'H–F'], HCl: [128, 432, 'H–Cl'], HBr: [141, 366, 'H–Br'], HI: [161, 298, 'H–I'], F2: [141, 159, 'F–F'], Cl2: [199, 242, 'Cl–Cl'], Br2: [228, 193, 'Br–Br'], I2: [267, 151, 'I–I'], O2: [121, 498, 'O=O'], N2: [110, 945, 'N≡N'] };
  var KITPAIR = { H2: 1, HF: 1, HCl: 1, Cl2: 1, N2: 1, O2: 1, F2: 1, Br2: 1, I2: 1 };

  G('gchem1.bond-potential-energy', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['break', 'break', 'compare', 'tf'], ['break', 'grams', 'compare', 'tf'], ['atoms', 'grams', 'compare', 'tf']));
    var key = R.pick(Object.keys(BD)), b = BD[key];
    var vz = KITPAIR[key] ? { name: 'ch-bondcurve', opts: { pair: key, quiet: true, edit: false } } : null;
    if (shape === 'break') { var n = R.pick([0.250, 0.500, 1.50, 2.00, 0.750, 3.00]);
      return P('The potential-energy curve for ' + F(key) + ' has its minimum at $' + qg(b[0], 'pm') + '$ and $' + qg(-b[1], 'kJmol') + '$. How much energy is needed to break the bonds in $' + qx(n, 'mol') + '$ of ' + F(key) + '?', ans(n * b[1], 0.01),
        ['The depth of the well is the bond energy: $' + qg(b[1], 'kJmol') + '$ must be put in per mole of bonds.', 'Each ' + F(key) + ' molecule has one bond, so $' + fx(n) + '\\ \\text{mol} \\times ' + gx(b[1]) + '\\ \\text{kJ/mol} = ' + qx(n * b[1], 'kJ') + '$ absorbed.'],
        'The bond energy is the depth of the well.', 'kJ', { k: 'brk', n: n, D: b[1] }, vz); }
    if (shape === 'grams') { var Mx = mm(key), g = R.pick([5.00, 10.0, 25.0, 50.0, 2.00]), nm = g / Mx;
      return P('The bond energy of ' + F(key) + ' is $' + qg(b[1], 'kJmol') + '$. How much energy, in kJ, is needed to split $' + qx(g, 'g') + '$ of ' + F(key) + ' ($M = ' + qm(Mx) + '$) into separate atoms?', ans(nm * b[1], 0.01),
        ['Moles: $' + dfr(qx(g, 'g'), qm(Mx)) + ' = ' + qx(nm, 'mol') + '$.', 'Energy: $' + fx(nm) + ' \\times ' + gx(b[1]) + ' = ' + qx(nm * b[1], 'kJ') + '$ absorbed.'],
        'Change grams to moles first; bond energy is per mole of bonds.', 'kJ', { k: 'brk', n: nm, D: b[1] }); }
    if (shape === 'atoms') { var h = R.pick(['H2', 'Cl2', 'N2', 'O2', 'Br2']), na = R.pick([0.500, 1.00, 2.00, 3.00, 0.200]), b2 = BD[h], nmol = na / 2, sym = h.replace('2', '');
      return P('How much energy is released when $' + qx(na, 'mol') + '$ of separate ' + sym + ' atoms combine to form ' + F(h) + ' molecules? (Bond energy of ' + F(h) + ': $' + qg(b2[1], 'kJmol') + '$.)', ans(nmol * b2[1], 0.01),
        ['Two atoms make one molecule (one bond): $' + fx(na) + '\\ \\text{mol of atoms} \\div 2 = ' + qx(nmol, 'mol') + '$ of ' + F(h) + '.', 'Forming bonds releases the bond energy: $' + fx(nmol) + ' \\times ' + gx(b2[1]) + ' = ' + qx(nmol * b2[1], 'kJ') + '$ released.'],
        'How many bonds form from that many atoms?', 'kJ', { k: 'brk', n: nmol, D: b2[1] }); }
    if (shape === 'compare') {
      var sets = [['HF', 'HCl', 'HBr', 'HI'], ['F2', 'Cl2', 'Br2', 'I2'], ['N2', 'O2', 'F2']], set = R.pick(sets), two = R.sample(set, 2), long = R.coin();
      var ansK = long ? (BD[two[0]][0] > BD[two[1]][0] ? two[0] : two[1]) : (BD[two[0]][1] > BD[two[1]][1] ? two[0] : two[1]);
      var reason = set[0] === 'N2' ? 'Bond order: N≡N is triple, O=O double, F–F single. More shared pairs pull the atoms closer and hold them more strongly.' : 'Going down the group the atoms get larger, so the bond gets longer' + (set[0] === 'F2' ? '; F–F is an exception in strength (crowded lone pairs repel), the weakest of the four except I–I.' : ' and weaker.');
      return P('Which has the ' + (long ? 'longer bond (minimum farther right on its potential-energy curve)' : 'deeper potential-energy well (stronger bond)') + ': ' + F(two[0]) + ' or ' + F(two[1]) + '?', mcK([F(two[0]), F(two[1])], ansK === two[0] ? 0 : 1),
        [reason, F(two[0]) + ': $' + qg(BD[two[0]][0], 'pm') + '$, $' + qg(BD[two[0]][1], 'kJmol') + '$. ' + F(two[1]) + ': $' + qg(BD[two[1]][0], 'pm') + '$, $' + qg(BD[two[1]][1], 'kJmol') + '$.'],
        long ? 'Bigger atoms make longer bonds; more shared pairs make shorter ones.' : 'Compare bond orders, then atom sizes.', null, { k: 'cmp' });
    }
    var t = R.pick([['Two bonded atoms are most stable when their nuclei are pushed as close together as possible.', false, 'Closer than the bond length, the nuclei repel and the energy rises steeply. The most stable distance is the bottom of the well.'],
      ['Breaking a chemical bond releases energy.', false, 'Separating the atoms means climbing out of the potential-energy well, so breaking a bond always absorbs energy.'],
      ['The bond length is the distance at the lowest point of the potential-energy curve.', true, 'At that distance attraction and repulsion balance, and the energy is lowest.'],
      ['Forming a bond between two separate atoms releases energy equal to the bond energy.', true, 'The atoms drop into the well; the depth of the well comes out as energy.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Picture the potential-energy well.', null, { k: 'tf' });
  });

  // salts with six-coordinate radii (pm, Shannon 1976) and lattice energies (kJ/mol, CRC Handbook, thermochemical cycle)
  var SALT = { LiF: ['Li+', 'F-', 1037], LiCl: ['Li+', 'Cl-', 853], NaF: ['Na+', 'F-', 923], NaCl: ['Na+', 'Cl-', 786], NaBr: ['Na+', 'Br-', 747], NaI: ['Na+', 'I-', 704], KF: ['K+', 'F-', 821],
    KCl: ['K+', 'Cl-', 715], KBr: ['K+', 'Br-', 682], KI: ['K+', 'I-', 649], MgO: ['Mg^2+', 'O^2-', 3795], CaO: ['Ca^2+', 'O^2-', 3414], SrO: ['Sr^2+', 'O^2-', 3217], BaO: ['Ba^2+', 'O^2-', 3029] };
  IR['Ba^2+'] = 135;
  function cou(s) { var a = SALT[s]; return M.abs(parseF(a[0]).charge * parseF(a[1]).charge) / (IR[a[0]] + IR[a[1]]); }
  function couTex(s) { var a = SALT[s], q = M.abs(parseF(a[0]).charge * parseF(a[1]).charge); return dfr(q, gx(IR[a[0]]) + ' + ' + gx(IR[a[1]])) + ' = ' + fx(cou(s), 3); }
  function safePair(R) { var ks = Object.keys(SALT), a, b, k = 0; do { var two = R.sample(ks, 2); a = two[0]; b = two[1]; k++; } while ((M.abs(cou(a) / cou(b) - 1) < 0.05 || (cou(a) > cou(b)) !== (SALT[a][2] > SALT[b][2])) && k < 50); return [a, b]; }

  G('gchem1.lattice-energy', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['pair', 'pair', 'tf'], ['pair', 'rank', 'ratio'], ['rank', 'ratio', 'pair', 'tf']));
    if (shape === 'pair') { var pr = safePair(R), hi = cou(pr[0]) > cou(pr[1]) ? pr[0] : pr[1];
      return P('Which has the larger lattice energy: ' + F(pr[0]) + ' or ' + F(pr[1]) + '? (Ion radii, pm: ' + lst([SALT[pr[0]][0], SALT[pr[0]][1], SALT[pr[1]][0], SALT[pr[1]][1]].filter(function (x, i, a) { return a.indexOf(x) === i; }).map(function (x) { return F(x) + ' ' + gx(IR[x]); })) + '.)', mcK([F(pr[0]), F(pr[1])], hi === pr[0] ? 0 : 1),
        ['Compare $|q_1q_2|/(r_1 + r_2)$. ' + F(pr[0]) + ': $' + couTex(pr[0]) + '$. ' + F(pr[1]) + ': $' + couTex(pr[1]) + '$.', SALT[pr[0]][0].indexOf('^2') >= 0 !== SALT[pr[1]][0].indexOf('^2') >= 0 ? 'The charges decide it: a 2+/2− pair has four times the charge product of a 1+/1− pair.' : 'Same charges, so the smaller ions, closer together, win.', 'Measured: ' + F(pr[0]) + ' about ' + gx(SALT[pr[0]][2]) + ', ' + F(pr[1]) + ' about ' + gx(SALT[pr[1]][2]) + ' kJ/mol.'],
        'Check charges first, then sizes.', null, { k: 'lpair', a: pr[0], b: pr[1], ans: hi }); }
    if (shape === 'rank') { var ks = Object.keys(SALT), trio, k = 0;
      do { trio = R.sample(ks, 3); k++; var srt = trio.slice().sort(function (a, b) { return cou(a) - cou(b); }); var ok = cou(srt[1]) / cou(srt[0]) > 1.05 && cou(srt[2]) / cou(srt[1]) > 1.05 && SALT[srt[0]][2] < SALT[srt[1]][2] && SALT[srt[1]][2] < SALT[srt[2]][2]; } while (!ok && k < 80);
      var s3 = trio.slice().sort(function (a, b) { return cou(a) - cou(b); }), right = '$' + s3.map(ft).join(' < ') + '$';
      var wr = [[s3[2], s3[1], s3[0]], [s3[1], s3[0], s3[2]], [s3[0], s3[2], s3[1]]].map(function (x) { return '$' + x.map(ft).join(' < ') + '$'; });
      return P('Rank ' + lst(trio.map(F)) + ' from smallest to largest lattice energy. (Radii, pm: ' + lst(trio.map(function (s) { return SALT[s][0]; }).concat(trio.map(function (s) { return SALT[s][1]; })).filter(function (x, i, a) { return a.indexOf(x) === i; }).map(function (x) { return F(x) + ' ' + gx(IR[x]); })) + '.)', mc(right, wr),
        [s3.map(function (s) { return F(s) + ': $' + couTex(s) + '$'; }).join('; ') + '.', 'Larger $|q_1q_2|/(r_1 + r_2)$, larger lattice energy. Measured: ' + s3.map(function (s) { return gx(SALT[s][2]); }).join(', ') + ' kJ/mol.'],
        'Charges first, then sizes.', null, { k: 'lrank', order: s3 }); }
    if (shape === 'ratio') { var p2 = safePair(R), big = cou(p2[0]) > cou(p2[1]) ? p2[0] : p2[1], sm = big === p2[0] ? p2[1] : p2[0], rt = cou(big) / cou(sm);
      return P('Using lattice energy $\\propto |q_1q_2|/(r_1 + r_2)$, estimate how many times larger the lattice energy of ' + F(big) + ' is than that of ' + F(sm) + '. Radii (pm): ' + lst([SALT[big][0], SALT[big][1], SALT[sm][0], SALT[sm][1]].filter(function (x, i, a) { return a.indexOf(x) === i; }).map(function (x) { return F(x) + ' ' + gx(IR[x]); })) + '.', ans(rt, 0.02),
        [F(big) + ': $' + couTex(big) + '$.', F(sm) + ': $' + couTex(sm) + '$.', 'Ratio: $' + fx(cou(big), 3) + ' / ' + fx(cou(sm), 3) + ' = ' + fx(rt, 3) + '$. (Measured lattice energies, ' + gx(SALT[big][2]) + ' and ' + gx(SALT[sm][2]) + ' kJ/mol, give ' + fx(SALT[big][2] / SALT[sm][2], 3) + '; the simple model gets close.)'],
        'Work out $|q_1q_2|/(r_1+r_2)$ for each and divide.', 'none', { k: 'lratio', a: big, b: sm }); }
    var t = R.pick([['LiF has a larger lattice energy than MgO, because its ions are smaller.', false, 'MgO\'s ions have charges 2+ and 2−, a charge product of 4, which outweighs any size difference: about 3800 against 1040 kJ/mol.'],
      ['NaCl has a larger lattice energy than KCl.', true, 'Same charges; $\\mathrm{Na^+}$ is smaller than $\\mathrm{K^+}$, so the ions are closer.'],
      ['Lattice energy depends only on the sizes of the ions.', false, 'It depends on the charges too, and the charges matter most.'],
      ['CaO has a larger lattice energy than NaF.', true, 'Charge product 4 against 1, at similar distances.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Lattice energy goes as charge product over distance.', null, { k: 'tf' });
  });

  var ALLOY = [['brass', 'Cu', 'Zn', 0.70, 'substitutional'], ['bronze', 'Cu', 'Sn', 0.88, 'substitutional'], ['sterling silver', 'Ag', 'Cu', 0.925, 'substitutional'], ['14-karat gold', 'Au', 'Ag', 0.583, 'substitutional'], ['a plain carbon steel', 'Fe', 'C', 0.990, 'interstitial']];
  var MRAD = [['carbon', 'iron', 77, 126, 'interstitial'], ['zinc', 'copper', 134, 128, 'substitutional'], ['nickel', 'copper', 124, 128, 'substitutional'], ['chromium', 'iron', 128, 126, 'substitutional'], ['nitrogen', 'iron', 71, 126, 'interstitial'], ['tin', 'copper', 140, 128, 'substitutional'], ['hydrogen', 'palladium', 32, 137, 'interstitial'], ['boron', 'iron', 85, 126, 'interstitial']];

  G('gchem1.metals-alloys', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['type', 'prop', 'tf'], ['type', 'comp', 'prop', 'tf'], ['comp', 'type', 'prop']));
    if (shape === 'type') { var m = R.pick(MRAD);
      return P('Atoms of ' + m[0] + ' (radius about ' + m[2] + ' pm) dissolve in solid ' + m[1] + ' (radius about ' + m[3] + ' pm). What kind of alloy forms?', mcK(['substitutional', 'interstitial', 'a compound with a fixed formula'], m[4] === 'substitutional' ? 0 : 1),
        ['Compare sizes: ' + m[2] + '/' + m[3] + ' = ' + fx(m[2] / m[3], 2) + '.', m[4] === 'interstitial' ? 'The added atoms are much smaller, small enough to fit into the gaps between host atoms: interstitial.' : 'The sizes are similar (within about 15%), so the added atoms take the places of host atoms: substitutional.'],
        'Similar sizes swap places; much smaller atoms fit in the gaps.', null, { k: 'type' }); }
    if (shape === 'comp') { var a = R.pick(ALLOY.slice(0, 4)), mass = R.pick([25.0, 40.0, 60.0, 100, 150, 250]), minor = mass * (1 - a[3]), major = mass * a[3], askMol = ctx.level > 2 && R.coin();
      if (askMol) return P('A ' + qx(mass, 'g').replace(/\\ /, ' ') + ' sample of ' + a[0] + ' is ' + gx(rd(a[3] * 100, 1)) + '% ' + ENAME[a[1]] + ' by mass; the rest is ' + ENAME[a[2]] + '. How many moles of ' + ENAME[a[2]] + ' does it contain? (' + a[2] + ' $' + gd(AM[a[2]], 2) + '$)', ans(minor / AM[a[2]], 0.01),
        ['Mass of ' + ENAME[a[2]] + ': $' + fx(mass) + ' \\times ' + gx(rd(1 - a[3], 4)) + ' = ' + qx(minor, 'g') + '$.', 'Moles: $' + dfr(fx(minor), gd(AM[a[2]], 2)) + ' = ' + qx(minor / AM[a[2]], 'mol') + '$.'], 'Find the mass first, then divide by the molar mass.', 'mol', { k: 'alloyMol', m: mass, f: 1 - a[3], M: AM[a[2]] });
      return P('A $' + qx(mass, 'g') + '$ piece of ' + a[0] + ' is ' + gx(rd(a[3] * 100, 1)) + '% ' + ENAME[a[1]] + ' by mass; the rest is ' + ENAME[a[2]] + '. How many grams of ' + ENAME[a[2]] + ' does it contain?', ans(minor, 0.01),
        ['The rest is $100 - ' + gx(rd(a[3] * 100, 1)) + ' = ' + gx(rd(100 - a[3] * 100, 1)) + '\\%$ ' + ENAME[a[2]] + '.', '$' + fx(mass) + ' \\times ' + gx(rd(1 - a[3], 4)) + ' = ' + qx(minor, 'g') + '$.'], 'What percent is the other metal?', 'g', { k: 'alloy', m: mass, f: 1 - a[3] }); }
    if (shape === 'prop') { var pq = R.pick([
        ['Why does a copper wire conduct electricity?', 'Its valence electrons are delocalized over the whole crystal and move freely when a voltage is applied.', ['Its copper cations move through the wire toward the positive end.', 'Copper atoms pass electrons along fixed bonds between neighbors.', 'Its ions are free to move because the metal is partly melted.']],
        ['Why can gold be hammered into thin sheets without shattering?', 'Layers of cations can slide past each other while the shared electron sea keeps holding them together.', ['Gold atoms are held by strong directional covalent bonds that bend.', 'Gold is soft because its atoms are not bonded to one another.', 'Like charges in gold line up and repel, pushing layers apart smoothly.']],
        ['Why is steel harder than pure iron?', 'Small carbon atoms in the gaps between iron atoms make it harder for layers of iron atoms to slide.', ['Carbon forms a compound with a fixed formula, FeC, that is harder.', 'Carbon atoms replace iron atoms, and carbon is a harder element.', 'Carbon removes the delocalized electrons that make iron soft.']]]);
      return P(pq[0], mc(pq[1], pq[2]), ['Metallic bonding: cations in a sea of delocalized electrons.', pq[1]], 'Think of cations in a sea of shared electrons.', null, { k: 'prop' }); }
    var t = R.pick([['An alloy is a compound with a fixed formula.', false, 'An alloy is a mixture (a solid solution); its composition can vary, as with 10-karat, 14-karat and 18-karat gold.'],
      ['In a metal, the electrons carry the current while the cations stay in their places.', true, 'The delocalized valence electrons move; the cations stay at their lattice sites.'],
      ['Brass, in which zinc atoms take the places of some copper atoms, is a substitutional alloy.', true, 'Zinc and copper atoms are similar in size, so they swap places.'],
      ['Steel is a substitutional alloy, because carbon atoms replace iron atoms.', false, 'Carbon atoms are much smaller than iron atoms and sit in the gaps: steel is interstitial.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Think about the electron sea and the sizes of the atoms.', null, { k: 'tf' });
  });

  // Lewis structures for formal charge: [species, text description, [[atom label, valence, lone-pair electrons, bonds]], charge]
  var FCS = [
    ['NO3-', 'one N=O double bond and two N–O single bonds; N has no lone pairs, the double-bonded O has 2 lone pairs and each single-bonded O has 3', [['N', 5, 0, 4], ['the double-bonded O', 6, 4, 2], ['a single-bonded O', 6, 6, 1]], -1],
    ['CO3^2-', 'one C=O and two C–O bonds; C has no lone pairs, the double-bonded O has 2 lone pairs and each single-bonded O has 3', [['C', 4, 0, 4], ['the double-bonded O', 6, 4, 2], ['a single-bonded O', 6, 6, 1]], -2],
    ['NH4+', 'four N–H bonds and no lone pairs', [['N', 5, 0, 4], ['an H', 1, 0, 1]], 1],
    ['H3O+', 'three O–H bonds and one lone pair on O', [['O', 6, 2, 3], ['an H', 1, 0, 1]], 1],
    ['O3', 'O=O–O: the central O has 1 lone pair, the double-bonded end O has 2 and the single-bonded end O has 3', [['the central O', 6, 2, 3], ['the double-bonded end O', 6, 4, 2], ['the single-bonded end O', 6, 6, 1]], 0],
    ['CO', 'a C≡O triple bond with one lone pair on each atom', [['C', 4, 2, 3], ['O', 6, 2, 3]], 0],
    ['CN-', 'a C≡N triple bond with one lone pair on each atom', [['C', 4, 2, 3], ['N', 5, 2, 3]], -1],
    ['NO2-', 'one N=O and one N–O bond; N has 1 lone pair, the double-bonded O has 2 and the single-bonded O has 3', [['N', 5, 2, 3], ['the double-bonded O', 6, 4, 2], ['the single-bonded O', 6, 6, 1]], -1],
    ['BF4-', 'four B–F single bonds; each F has 3 lone pairs and B has none', [['B', 3, 0, 4], ['an F', 7, 6, 1]], -1],
    ['OH-', 'one O–H bond and 3 lone pairs on O', [['O', 6, 6, 1], ['H', 1, 0, 1]], -1],
    ['HNC', 'H–N≡C, with no lone pair on N and one on C', [['N', 5, 0, 4], ['C', 4, 2, 3]], 0],
    ['SCN-', '[S=C=N]⁻ with 2 lone pairs on S and 2 on N', [['S', 6, 4, 2], ['C', 4, 0, 4], ['N', 5, 4, 2]], -1],
    ['N3-', '[N=N=N]⁻ with 2 lone pairs on each end N and none on the central N', [['the central N', 5, 0, 4], ['an end N', 5, 4, 2]], -1],
    ['NO2+', '[O=N=O]⁺ with 2 lone pairs on each O and none on N', [['N', 5, 0, 4], ['an O', 6, 4, 2]], 1],
    ['BH4-', 'four B–H single bonds and no lone pairs', [['B', 3, 0, 4], ['an H', 1, 0, 1]], -1],
    ['NH2-', 'two N–H bonds and 2 lone pairs on N', [['N', 5, 4, 2], ['an H', 1, 0, 1]], -1],
    ['O2^2-', 'an O–O single bond with 3 lone pairs on each O', [['an O', 6, 6, 1]], -2],
    ['ClO-', 'a Cl–O single bond with 3 lone pairs on each atom', [['Cl', 7, 6, 1], ['O', 6, 6, 1]], -1],
    ['PH4+', 'four P–H bonds and no lone pairs', [['P', 5, 0, 4], ['an H', 1, 0, 1]], 1],
    ['HCO3-', 'one C=O, one C–OH and one C–O⁻ bond; the C=O oxygen has 2 lone pairs, the OH oxygen 2 and the O⁻ oxygen 3', [['C', 4, 0, 4], ['the double-bonded O', 6, 4, 2], ['the OH oxygen', 6, 4, 2], ['the singly bonded O (no H)', 6, 6, 1]], -1]
  ];
  // choose-the-best-structure sets: [species, [[structure TeX, formal charges text, score]], index of best, reason]
  var BEST = [
    ['OCN-', [['[\\mathrm{O{-}C{\\equiv}N}]^-', 'O −1, C 0, N 0'], ['[\\mathrm{O{=}C{=}N}]^-', 'O 0, C 0, N −1'], ['[\\mathrm{O{\\equiv}C{-}N}]^-', 'O +1, C 0, N −2']], 0, 'Two structures have just one −1; the best puts it on oxygen, the most electronegative atom.'],
    ['CO2', [['\\mathrm{O{=}C{=}O}', 'all 0'], ['\\mathrm{O{\\equiv}C{-}O}', 'O +1, C 0, O −1'], ['\\mathrm{O{-}C{\\equiv}O}', 'O −1, C 0, O +1']], 0, 'All formal charges zero beats any separation of charge.'],
    ['N3-', [['[\\mathrm{N{=}N{=}N}]^-', 'N −1, N +1, N −1'], ['[\\mathrm{N{\\equiv}N{-}N}]^-', 'N 0, N +1, N −2'], ['[\\mathrm{N{-}N{\\equiv}N}]^-', 'N −2, N +1, N 0']], 0, 'The symmetric structure avoids a −2 charge; the other two put −2 on one atom.'],
    ['HCN', [['\\mathrm{H{-}C{\\equiv}N}', 'all 0'], ['\\mathrm{H{-}N{\\equiv}C}', 'N +1, C −1']], 0, 'Zero formal charges: H–C≡N is the stable molecule (HNC is a much less stable isomer).'],
    ['SCN-', [['[\\mathrm{S{=}C{=}N}]^-', 'S 0, C 0, N −1'], ['[\\mathrm{S{-}C{\\equiv}N}]^-', 'S −1, C 0, N 0'], ['[\\mathrm{S{\\equiv}C{-}N}]^-', 'S +1, C 0, N −2']], 0, 'Both of the first two have a single −1; nitrogen is more electronegative than sulfur, so the −1 belongs on N.'],
    ['OCS', [['\\mathrm{O{=}C{=}S}', 'all 0'], ['\\mathrm{O{\\equiv}C{-}S}', 'O +1, C 0, S −1'], ['\\mathrm{O{-}C{\\equiv}S}', 'O −1, C 0, S +1']], 0, 'All zero formal charges is best.'],
    ['CS2', [['\\mathrm{S{=}C{=}S}', 'all 0'], ['\\mathrm{S{\\equiv}C{-}S}', 'S +1, C 0, S −1']], 0, 'All zero formal charges is best.']
  ];

  G('gchem1.formal-charge', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['fc', 'fc', 'sum'], ['fc', 'best', 'tf'], ['best', 'fc', 'tf', 'best']));
    if (shape === 'fc' || shape === 'sum') {
      var s = R.pick(FCS), at = R.pick(s[2]), fc = at[1] - at[2] - at[3];
      if (shape === 'sum') return P('In the Lewis structure of ' + F(s[0]) + ' (' + s[1] + '), what is the sum of the formal charges on all the atoms?', exact(s[3]),
        ['Formal charges always add up to the overall charge of the species.', 'Check: ' + s[2].map(function (a) { var v = a[1] - a[2] - a[3]; return a[0] + ': $' + a[1] + ' - ' + a[2] + ' - ' + a[3] + ' = ' + (v > 0 ? '+' : '') + v + '$'; }).join('; ') + '.', 'The total is $' + (s[3] > 0 ? '+' : '') + s[3] + '$.'],
        'What is the charge of the whole species?', null, { k: 'fcsum' });
      return P('In the Lewis structure of ' + F(s[0]) + ' (' + s[1] + '), what is the formal charge on ' + at[0] + '?', exact(fc),
        ['$\\text{FC} = (\\text{valence}) - (\\text{lone-pair electrons}) - (\\text{bonds})$.', 'For ' + at[0] + ': $' + at[1] + ' - ' + at[2] + ' - ' + at[3] + ' = ' + (fc > 0 ? '+' : '') + fc + '$.'],
        'Valence electrons minus lone-pair electrons minus bonds.', null, { k: 'fc', v: at[1], lp: at[2], b: at[3] });
    }
    if (shape === 'best') { var b0 = R.pick(BEST);
      return P('Which Lewis structure of ' + F(b0[0]) + ' is best, according to formal charges?', mc('$' + b0[1][b0[2]][0] + '$', b0[1].filter(function (x, i) { return i !== b0[2]; }).map(function (x) { return '$' + x[0] + '$'; })),
        ['Formal charges: ' + b0[1].map(function (x) { return '$' + x[0] + '$: ' + x[1]; }).join('; ') + '.', b0[3]],
        'Smallest formal charges, with any negative charge on the most electronegative atom.', null, { k: 'best' }); }
    var t = R.pick([['The formal charge on an atom is the real electric charge it carries.', false, 'Formal charge splits every bond evenly; it is a bookkeeping number for comparing structures, not a measured charge.'],
      ['Formal charge and oxidation number are the same thing.', false, 'Oxidation numbers give all the bonding electrons to the more electronegative atom; formal charge splits them evenly. In $\\mathrm{NH_4^+}$, N has formal charge $+1$ but oxidation number $-3$.'],
      ['The formal charges in a Lewis structure always add up to the charge of the molecule or ion.', true, 'Each atom\'s count is a share of the same electrons, so the totals match.'],
      ['Among possible Lewis structures, the best one usually puts any negative formal charge on the most electronegative atom.', true, 'That atom holds extra electron density best.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Formal charge is bookkeeping with evenly shared bonds.', null, { k: 'tf' });
  });

  // resonance: [species, equivalent structures, bonds over positions (bond order), average formal charge on the shared atoms, atom name]
  var RES = [['NO3-', 3, Q(4, 3), Q(-2, 3), 'N–O', 'O'], ['CO3^2-', 3, Q(4, 3), Q(-2, 3), 'C–O', 'O'], ['O3', 2, Q(3, 2), null, 'O–O', 'O'], ['NO2-', 2, Q(3, 2), Q(-1, 2), 'N–O', 'O'], ['HCOO-', 2, Q(3, 2), Q(-1, 2), 'C–O', 'O'], ['SO3', 3, Q(4, 3), null, 'S–O', 'O'], ['C6H6', 2, Q(3, 2), null, 'C–C', 'C'], ['SO2', 2, Q(3, 2), null, 'S–O', 'O'], ['CH3COO-', 2, Q(3, 2), Q(-1, 2), 'C–O', 'O'], ['HCO3-', 2, Q(3, 2), Q(-1, 2), 'C–O (the two without H)', 'O (not bonded to H)'], ['HNO3', 2, Q(3, 2), null, 'N–O (the two without H)', 'O'], ['CH3NO2', 2, Q(3, 2), null, 'N–O', 'O']];
  var NORES = ['NH3', 'CH4', 'H2O', 'CCl4', 'C2H6', 'HF', 'PCl3', 'CH3OH', 'NH4+', 'H2S', 'SiH4', 'CH3Cl'];

  G('gchem1.resonance', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['count', 'bo', 'which'], ['bo', 'fc', 'which', 'tf'], ['bo', 'fc', 'length', 'tf']));
    var r = R.pick(shape === 'fc' ? RES.filter(function (x) { return x[3]; }) : RES), nm = r[0] === 'C6H6' ? 'benzene, ' + F('C6H6') : r[0] === 'SO3' || r[0] === 'SO2' ? F(r[0]) + ' (drawn with octets)' : r[0] === 'CH3COO-' ? 'the acetate ion, ' + F('CH3COO-') : F(r[0]);
    if (shape === 'count') return P('How many equivalent resonance structures does ' + nm + ' have?', exact(r[1]),
      [r[1] === 3 ? 'The double bond can sit on any of the three ' + r[4] + ' links.' : 'The ' + (r[0] === 'C6H6' ? 'three double bonds can alternate in two ways around the ring' : 'double bond can sit on either of the two ' + r[4] + ' links') + '.', 'So there are ' + r[1] + ' equivalent structures, and the real species is their blend.'],
      'In how many places can the double bond go?', null, { k: 'rcount' });
    if (shape === 'bo') return P('What is the average ' + r[4] + ' bond order in ' + nm + '? (A fraction or decimal is fine.)', { t: 'num', v: r[2].toPlain(), rtol: 0.01 },
      [r[0] === 'C6H6' ? 'Each Kekulé structure has 3 double and 3 single C–C bonds: 9 bonds over 6 positions.' : 'Each structure has one double bond and ' + (r[1] - 1) + ' single bond' + (r[1] > 2 ? 's' : '') + ': ' + (r[1] + 1) + ' bonds shared over ' + r[1] + ' positions.', 'Bond order $= ' + r[2].toTex() + (r[2].isInt() ? '' : ' \\approx ' + fx(r[2].toNumber(), 3)) + '$, between a single and a double bond.'],
      'Total bonds divided by the number of positions.', null, { k: 'rbo' });
    if (shape === 'fc') return P('In the resonance hybrid of ' + F(r[0]) + ', what is the average formal charge on each ' + r[5] + ' atom? (A fraction or decimal is fine.)', { t: 'num', v: r[3].toPlain(), rtol: 0.02 },
      ['In each resonance structure, ' + (r[1] === 3 ? 'the two singly bonded O atoms carry $-1$ each' : 'the singly bonded O' + (r[0] === 'HCO3-' ? ' without an H' : '') + ' carries $-1$') + ' and the double-bonded O carries $0$: a total of $' + r[3].mul(r[1]).toTex() + '$ on the ' + r[1] + ' oxygens.', 'In the hybrid that is shared evenly: $' + r[3].mul(r[1]).toTex() + ' / ' + r[1] + ' = ' + r[3].toTex() + '$ each.'],
      'Add the formal charges on the oxygens and share them evenly.', null, { k: 'rfc' });
    if (shape === 'which') { var yes = R.coin(), sp = yes ? r[0] : null, others = R.sample(NORES, 3);
      if (yes) return P('Which of these species is described by resonance structures?', mc(F(r[0]), others.map(F)), ['Resonance needs two or more valid Lewis structures that differ only in where a double bond (or lone pair) goes.', F(r[0]) + ' has ' + r[1] + ' equivalent structures; the others have only single bonds and one structure each.'], 'Look for a double bond that could be drawn in more than one place.', null, { k: 'rwhich' });
      var tf0 = R.pick(NORES); return P('True or false: ' + F(tf0) + ' needs resonance structures to describe its bonding.', tf(false), [F(tf0) + ' has only single bonds and one Lewis structure; there is nowhere else to put the electrons.'], 'Is there a double bond that could move?', null, { k: 'rwhich' }); }
    if (shape === 'length') { var fam = R.pick([[['CO', '3', 113], ['CO2', '2', 116], ['CO3^2-', '\\tfrac{4}{3}', 129], 'C–O'], [['O2', '2', 121], ['O3', '\\tfrac{3}{2}', 128], ['H2O2', '1', 148], 'O–O'], [['NO+', '3', 106], ['NO2-', '\\tfrac{3}{2}', 124], ['NO3-', '\\tfrac{4}{3}', 124], 'N–O']]);
      if (fam[3] === 'N–O') fam = [['NO+', '3', 106], ['NO2', '\\tfrac{3}{2}', 120], ['NH2OH', '1', 146], 'N–O'];
      var opts = fam.slice(0, 3), long = R.coin(), a0 = long ? opts[2] : opts[0];
      return P('In which species is the ' + fam[3] + ' bond ' + (long ? 'longest' : 'shortest') + ': ' + lst(opts.map(function (o) { return F(o[0]); })) + '?', mc(F(a0[0]), opts.filter(function (o) { return o !== a0; }).map(function (o) { return F(o[0]); })),
        ['Bond orders: ' + opts.map(function (o) { return F(o[0]) + ' $' + o[1] + '$'; }).join(', ') + ' (fractions come from resonance).', 'Higher bond order, shorter bond: ' + opts.map(function (o) { return o[2]; }).join(', ') + ' pm.'], 'Find each ' + fam[3] + ' bond order.', null, { k: 'rlen' }); }
    var t = R.pick([['The nitrate ion flips rapidly between its three resonance structures.', false, 'There is one real structure, the hybrid, at every instant; all three N–O bonds are always equal.'],
      ['In ozone, both O–O bonds have the same length.', true, 'Resonance makes them equal: both are 128 pm, between a single and a double bond.'],
      ['In the carbonate ion, one C–O bond is shorter than the other two.', false, 'Resonance makes all three equal, each with bond order 4/3.'],
      ['A resonance hybrid is lower in energy than any single one of its resonance structures.', true, 'Spreading the electrons over more atoms lowers their energy.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Resonance structures are partial pictures of one real structure.', null, { k: 'tf' });
  });

  // octet exceptions: [species, central atom, total valence electrons, electrons around the central atom, kind]
  var OCT = [['NO', 'N', 11, 7, 'odd'], ['NO2', 'N', 17, 7, 'odd'], ['BF3', 'B', 24, 6, 'poor'], ['BCl3', 'B', 24, 6, 'poor'], ['BeCl2', 'Be', 16, 4, 'poor'], ['BeH2', 'Be', 4, 4, 'poor'],
    ['PCl5', 'P', 40, 10, 'exp'], ['PF5', 'P', 40, 10, 'exp'], ['SF6', 'S', 48, 12, 'exp'], ['SF4', 'S', 34, 10, 'exp'], ['ClF3', 'Cl', 28, 10, 'exp'], ['XeF2', 'Xe', 22, 10, 'exp'], ['XeF4', 'Xe', 36, 12, 'exp'], ['I3-', 'I', 22, 10, 'exp'], ['ICl4-', 'I', 36, 12, 'exp'], ['BrF5', 'Br', 42, 12, 'exp'],
    ['NH3', 'N', 8, 8, 'oct'], ['CCl4', 'C', 32, 8, 'oct'], ['PCl3', 'P', 26, 8, 'oct'], ['NF3', 'N', 26, 8, 'oct'], ['CO2', 'C', 16, 8, 'oct'], ['H2O', 'O', 8, 8, 'oct']];
  var KIND = { odd: 'odd number of electrons (a free radical)', poor: 'fewer than eight electrons on the central atom', exp: 'more than eight electrons on the central atom (an expanded octet)', oct: 'follows the octet rule' };
  var VE = { H: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, P: 5, S: 6, Cl: 7, Br: 7, I: 7, Xe: 8 };
  function veTex(f) { var p0 = parseF(f), parts = Object.keys(p0.atoms).map(function (e) { return (p0.atoms[e] > 1 ? p0.atoms[e] + '(' + VE[e] + ')' : VE[e]); }); return parts.join(' + ') + (p0.charge ? (p0.charge < 0 ? ' + ' + (-p0.charge) : ' - ' + p0.charge) : ''); }

  G('gchem1.octet-exceptions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['total', 'kind', 'kind'], ['around', 'kind', 'total', 'can'], ['around', 'kind', 'can', 'around']));
    var o = R.pick(shape === 'around' ? OCT.filter(function (x) { return x[4] !== 'oct'; }) : OCT), tot = o[2];
    if (shape === 'total') return P('How many valence electrons are in the Lewis structure of ' + F(o[0]) + '?', exact(tot),
      ['Add the valence electrons of each atom' + (parseF(o[0]).charge ? ', then adjust for the charge (add one per negative charge)' : '') + ': $' + veTex(o[0]) + ' = ' + tot + '$.', tot % 2 ? 'An odd total: one electron must be left unpaired.' : 'An even total, so every electron can be paired.'],
      'Group number gives each main-group atom\'s valence electrons.', null, { k: 've', f: o[0], ans: tot });
    if (shape === 'around') return P('In the Lewis structure of ' + F(o[0]) + ', how many electrons surround the central ' + o[1] + ' atom (in bonds and lone pairs)?', exact(o[3]),
      ['Total valence electrons: $' + veTex(o[0]) + ' = ' + tot + '$.', o[4] === 'odd' ? 'With an odd total, the best structure leaves the unpaired electron on ' + o[1] + ', which ends up with 7.' : o[4] === 'poor' ? 'Each outer atom gets its octet (or duet for H) with single bonds; ' + o[1] + ' is left with ' + o[3] + ' electrons, and a double bond to a halogen would put a positive formal charge on it.' : 'Give each outer atom an octet with single bonds; the electrons left over go on ' + o[1] + ' as lone pairs.',
        o[1] + ' ends up with $' + o[3] + '$ electrons: ' + KIND[o[4]] + '.'],
      'Count total valence electrons, give the outer atoms their octets, then put what is left on the center.', null, { k: 'around', f: o[0], ans: o[3] });
    if (shape === 'kind') { var right = KIND[o[4]];
      return P('Which describes the Lewis structure of ' + F(o[0]) + '?', mc(right, Object.keys(KIND).filter(function (k) { return k !== o[4]; }).map(function (k) { return KIND[k]; })),
        ['Total valence electrons: $' + veTex(o[0]) + ' = ' + tot + '$' + (tot % 2 ? ', an odd number.' : '.'), 'Around ' + o[1] + ': ' + o[3] + ' electrons. So: ' + right + '.'],
        'Count the electrons, then look at the central atom.', null, { k: 'kind', f: o[0] }); }
    var cp = R.pick([['N', 'P', 'NCl5', 'PCl5'], ['O', 'S', 'OF6', 'SF6'], ['F', 'Cl', 'FF3', 'ClF3'], ['C', 'Si', null, null]]);
    if (!cp[2]) cp = ['N', 'P', 'NCl5', 'PCl5'];
    return P(F(cp[3]) + ' exists, but ' + F(cp[2]) + ' does not. Why?', mc('A period 2 atom such as ' + cp[0] + ' has only four valence orbitals (2s and 2p), room for eight electrons; larger period 3 atoms can hold more neighbors.', ['A period 2 atom has too few valence electrons to make any bonds.', cp[0] + ' is more electronegative, so it refuses to share electrons.', cp[3].replace(/\d/g, '') + ' is a compound, but ' + cp[2].replace(/\d/g, '') + ' would be an alloy.']),
      ['Period 2 atoms never exceed eight electrons: they have only four valence orbitals.', cp[1] + ' is in period 3: a larger atom with room for more neighbors, so it can have an expanded octet.'],
      'Compare the periods of the two central atoms.', null, { k: 'can' });
  });

  // five and six electron groups: [species, central valence e, ligand symbol, number of ligands, charge]
  var V56 = [['PCl5', 5, 'Cl', 5, 0], ['PF5', 5, 'F', 5, 0], ['AsF5', 5, 'F', 5, 0], ['SF4', 6, 'F', 4, 0], ['SeF4', 6, 'F', 4, 0], ['ClF3', 7, 'F', 3, 0], ['BrF3', 7, 'F', 3, 0], ['XeF2', 8, 'F', 2, 0], ['KrF2', 8, 'F', 2, 0], ['I3-', 7, 'I', 2, -1], ['ICl2-', 7, 'Cl', 2, -1],
    ['SF6', 6, 'F', 6, 0], ['SeF6', 6, 'F', 6, 0], ['BrF5', 7, 'F', 5, 0], ['IF5', 7, 'F', 5, 0], ['ClF5', 7, 'F', 5, 0], ['XeF4', 8, 'F', 4, 0], ['ICl4-', 7, 'Cl', 4, -1], ['BrF4-', 7, 'F', 4, -1]];
  var SHAPE56 = { '5,0': 'trigonal bipyramidal', '5,1': 'seesaw', '5,2': 'T-shaped', '5,3': 'linear', '6,0': 'octahedral', '6,1': 'square pyramidal', '6,2': 'square planar' };
  var POLAR56 = { 'trigonal bipyramidal': false, seesaw: true, 'T-shaped': true, linear: false, octahedral: false, 'square pyramidal': true, 'square planar': false };
  function v56(s) { var tot = s[1] + 7 * s[3] - s[4], lp = (tot - 8 * s[3]) / 2; return { tot: tot, lp: lp, groups: s[3] + lp, shape: SHAPE56[(s[3] + lp) + ',' + lp] }; }

  G('gchem1.vsepr-five-six', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['shape', 'lp', 'shape'], ['shape', 'lp', 'angle', 'polar'], ['shape', 'polar', 'where', 'angle']));
    var s = R.pick(shape === 'polar' ? V56.filter(function (x) { return !x[4]; }) : V56), v = v56(s), cen = s[0].match(/^[A-Z][a-z]?/)[0];
    var st = ['Valence electrons: $' + s[1] + ' + ' + s[3] + '(7)' + (s[4] ? ' + ' + (-s[4]) : '') + ' = ' + v.tot + '$.', s[3] + ' bonds use ' + 2 * s[3] + '; the ' + s[3] + ' outer atoms take ' + 6 * s[3] + ' as lone pairs; the remaining ' + 2 * v.lp + ' go on ' + cen + ' as ' + v.lp + ' lone pair' + (v.lp === 1 ? '' : 's') + '.', v.groups + ' electron groups (' + s[3] + ' bonds, ' + v.lp + ' lone pair' + (v.lp === 1 ? '' : 's') + '): ' + (v.groups === 5 ? 'trigonal bipyramidal arrangement' + (v.lp ? ', lone pairs equatorial' : '') : 'octahedral arrangement' + (v.lp === 2 ? ', lone pairs opposite each other' : '')) + '.'];
    var vz = { name: 'ch-vsepr', opts: { mol: { bonds: s[3], lone: v.lp, ligands: U.range(1, s[3]).map(function () { return s[2]; }), center: cen }, quiet: true } };
    if (shape === 'shape') { var others = Object.keys(POLAR56).filter(function (x) { return x !== v.shape; });
      var near = v.groups === 5 ? ['trigonal pyramidal', 'tetrahedral', 'bent', 'trigonal planar'] : ['tetrahedral', 'trigonal bipyramidal', 'seesaw'];
      return P('What is the molecular shape of ' + F(s[0]) + '?', mc(v.shape, R.sample(others.concat(near).filter(function (x) { return x !== v.shape; }), 3)), st.concat(['Molecular shape (atoms only): ' + v.shape + '.']),
        'Count electron groups on the central atom, then place lone pairs (equatorial first).', null, { k: 'shape', s: s[0], ans: v.shape }); }
    if (shape === 'lp') return P('How many lone pairs are on the central ' + cen + ' atom in ' + F(s[0]) + '?', exact(v.lp), st.slice(0, 2), 'Total valence electrons minus 8 for each outer halogen, divided by 2.', null, { k: 'lp', s: s[0], ans: v.lp });
    if (shape === 'polar') return P('Is ' + F(s[0]) + ' polar or nonpolar?', mcK(['polar', 'nonpolar'], POLAR56[v.shape] ? 0 : 1),
      st.concat(['Shape: ' + v.shape + '. ' + (POLAR56[v.shape] ? 'The lone pair' + (v.lp > 1 ? 's leave' : ' leaves') + ' the bond dipoles unbalanced: polar.' : 'The bond dipoles point in symmetric, opposite directions and cancel: nonpolar.')]),
      'Find the shape, then ask whether the bond dipoles cancel.', null, { k: 'polar', s: s[0] }, vz);
    if (shape === 'angle') { var ang = v.groups === 6 ? '90°' : v.shape === 'linear' ? '180°' : v.shape === 'trigonal bipyramidal' ? '90° and 120°' : '90° (and close to it)';
      var right2 = v.groups === 6 ? '$90^\\circ$' : v.shape === 'linear' ? '$180^\\circ$' : v.shape === 'trigonal bipyramidal' ? '$90^\\circ$ and $120^\\circ$' : v.shape === 'seesaw' ? 'about $90^\\circ$ and about $120^\\circ$' : 'about $90^\\circ$';
      var pool = ['$109.5^\\circ$', '$90^\\circ$ and $120^\\circ$', '$120^\\circ$ only', '$180^\\circ$', 'about $90^\\circ$', '$90^\\circ$', 'about $90^\\circ$ and about $120^\\circ$'].filter(function (x) { return x !== right2; });
      if (right2 === 'about $90^\\circ$') pool = pool.filter(function (x) { return x !== '$90^\\circ$'; }); if (right2 === '$90^\\circ$') pool = pool.filter(function (x) { return x !== 'about $90^\\circ$'; });
      return P('What are the ideal angles between the ' + cen + '–' + s[2] + ' bonds in ' + F(s[0]) + '?', mc(right2, R.sample(pool, 3)),
        st.concat(['Shape: ' + v.shape + '. ' + (v.groups === 6 ? 'Octahedral positions are $90^\\circ$ apart' + (v.lp ? ' (lone pairs squeeze them slightly)' : '') + '.' : v.shape === 'linear' ? 'The two bonded atoms are axial, $180^\\circ$ apart.' : v.shape === 'trigonal bipyramidal' ? 'Axial to equatorial $90^\\circ$, equatorial to equatorial $120^\\circ$.' : v.shape === 'seesaw' ? 'Axial–equatorial near $90^\\circ$ and equatorial–equatorial near $120^\\circ$ (the lone pair squeezes both a little).' : 'Axial–equatorial near $90^\\circ$.')]),
        'Place the atoms on the trigonal bipyramid or octahedron first.', null, { k: 'angle', ang: ang }); }
    var s5 = R.pick(V56.filter(function (x) { var w = v56(x); return w.groups === 5 && w.lp > 0; })), w5 = v56(s5);
    return P('In ' + F(s5[0]) + ', which has ' + w5.lp + ' lone pair' + (w5.lp > 1 ? 's' : '') + ' among five electron groups, where do the lone pairs sit?', mc('in equatorial positions', ['in axial positions', 'one axial and one equatorial', 'anywhere: all five positions are the same']),
      ['An axial position has three neighbors at $90^\\circ$; an equatorial position has only two.', 'Lone pairs repel most, so they take the equatorial positions, giving ' + F(s5[0]) + ' a ' + w5.shape + ' shape.'],
      'Count the $90^\\circ$ neighbors of each kind of position.', null, { k: 'where' });
  });

  // hybridization: [species, central atom, groups, bond angle]
  var HYB = [['CH4', 'C', 4], ['NH3', 'N', 4], ['H2O', 'O', 4], ['NH4+', 'N', 4], ['H3O+', 'O', 4], ['CCl4', 'C', 4], ['PCl3', 'P', 4], ['BF3', 'B', 3], ['SO3', 'S', 3], ['NO3-', 'N', 3], ['CO3^2-', 'C', 3], ['H2CO', 'C', 3], ['O3', 'O', 3], ['CO2', 'C', 2], ['HCN', 'C', 2], ['BeCl2', 'Be', 2], ['C2H2', 'C', 2], ['C2H4', 'C', 3]];
  var HNAME = { 2: 'sp', 3: 'sp²', 4: 'sp³' }, HANG = { 2: '180°', 3: '120°', 4: '109.5°' };
  // sigma and pi counts: [name, formula or text, sigma, pi]
  var SP = [['carbon dioxide', 'O=C=O', 2, 2], ['hydrogen cyanide', 'H–C≡N', 2, 2], ['acetylene', 'H–C≡C–H', 3, 2], ['ethylene', 'H₂C=CH₂', 5, 1], ['formaldehyde', 'H₂C=O', 3, 1], ['acetic acid', 'CH₃COOH (CH₃–C(=O)–O–H)', 7, 1], ['nitrogen', 'N≡N', 1, 2], ['ethane', 'H₃C–CH₃', 7, 0],
    ['acetonitrile', 'CH₃–C≡N', 5, 2], ['propene', 'CH₂=CH–CH₃', 8, 1], ['formic acid', 'HCOOH (H–C(=O)–O–H)', 4, 1], ['benzene', 'C₆H₆ (a ring of alternating single and double bonds)', 12, 3], ['acrylonitrile', 'H₂C=CH–C≡N', 6, 3], ['methanol', 'CH₃OH', 5, 0], ['carbon monoxide', 'C≡O', 1, 2]];

  G('gchem1.hybridization', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['hyb', 'sigma', 'hyb'], ['hyb', 'sigma', 'pi', 'angle'], ['sigma', 'pi', 'organic', 'hyb']));
    if (shape === 'hyb' || shape === 'angle') { var hb = R.pick(HYB), nm = hb[0] === 'C2H4' || hb[0] === 'C2H2' ? 'each carbon atom in ' + F(hb[0]) : 'the central ' + hb[1] + ' atom in ' + F(hb[0]);
      var st = ['Count electron groups on ' + (hb[0] === 'C2H4' || hb[0] === 'C2H2' ? 'each carbon' : hb[1]) + ' (a multiple bond counts as one group; lone pairs count): ' + hb[2] + '.', hb[2] + ' groups: ' + HNAME[hb[2]] + ', with ideal angles of ' + HANG[hb[2]] + '.'];
      if (shape === 'angle') return P('What is the ideal bond angle around ' + nm + '?', mc(HANG[hb[2]], ['180°', '120°', '109.5°', '90°'].filter(function (x) { return x !== HANG[hb[2]]; })),
        st.concat(hb[0] === 'NH3' || hb[0] === 'H2O' || hb[0] === 'H3O+' ? ['(Lone pairs squeeze the real angle a little below 109.5°.)'] : []), 'Count electron groups, not attached atoms.', null, { k: 'ang', g: hb[2] });
      return P('What is the hybridization of ' + nm + '?', mc(HNAME[hb[2]], ['sp', 'sp²', 'sp³', 'none: s and p orbitals stay unmixed'].filter(function (x) { return x !== HNAME[hb[2]]; }).slice(0, 3)), st,
        'Count electron groups: 2 sp, 3 sp², 4 sp³.', null, { k: 'hyb', g: hb[2] }); }
    if (shape === 'sigma' || shape === 'pi') { var sp = R.pick(SP), sig = shape === 'sigma';
      return P('How many ' + (sig ? 'σ (sigma)' : 'π (pi)') + ' bonds are in a molecule of ' + sp[0] + ', ' + sp[1] + '?', exact(sig ? sp[2] : sp[3]),
        ['Every bond between two atoms has exactly one σ bond; a double bond adds one π bond and a triple bond adds two.', 'Total: ' + sp[2] + ' σ and ' + sp[3] + ' π.'],
        sig ? 'Count every bond once, single, double or triple.' : 'Count one π per double bond and two per triple bond.', null, { k: sig ? 'sigma' : 'pi', s: sp[0], ans: sig ? sp[2] : sp[3] }); }
    var org = R.pick([['acetic acid, CH₃–C(=O)–O–H', 'the carbon of the CH₃ group', 4], ['acetic acid, CH₃–C(=O)–O–H', 'the carbon bonded to both oxygens', 3], ['acetonitrile, CH₃–C≡N', 'the carbon bonded to nitrogen', 2], ['acetonitrile, CH₃–C≡N', 'the nitrogen atom', 2], ['propene, CH₂=CH–CH₃', 'the CH₃ carbon', 4], ['propene, CH₂=CH–CH₃', 'the middle carbon', 3], ['acetone, CH₃–C(=O)–CH₃', 'the middle carbon', 3], ['methanol, CH₃–O–H', 'the oxygen atom', 4], ['acrylonitrile, H₂C=CH–C≡N', 'the carbon bonded to nitrogen', 2]]);
    return P('In ' + org[0] + ', what is the hybridization of ' + org[1] + '?', mc(HNAME[org[2]], ['sp', 'sp²', 'sp³'].filter(function (x) { return x !== HNAME[org[2]]; })),
      ['Count electron groups around that atom (bonded atoms plus lone pairs; a multiple bond counts once): ' + org[2] + '.', org[2] + ' groups: ' + HNAME[org[2]] + '.'],
      'A double bond is one group; so is a triple bond.', null, { k: 'org', g: org[2] });
  });

  // molecular orbitals for homonuclear diatomics (valence electrons; H and He use 1s)
  var MOSP = { H2: ['H', 1], He2: ['He', 2], Li2: ['Li', 1], Be2: ['Be', 2], B2: ['B', 3], C2: ['C', 4], N2: ['N', 5], O2: ['O', 6], F2: ['F', 7], Ne2: ['Ne', 8] };
  function moFill(mol, q) {
    var el = MOSP[mol], ne = 2 * el[1] - q, row1 = el[0] === 'H' || el[0] === 'He', mix = ['Li', 'Be', 'B', 'C', 'N'].indexOf(el[0]) >= 0;
    var lv0 = row1 ? [['σ1s', 0, 1], ['σ*1s', 1, 1]] : mix ? [['σ2s', 0, 1], ['σ*2s', 1, 1], ['π2p', 0, 2], ['σ2p', 0, 1], ['π*2p', 1, 2], ['σ*2p', 1, 1]] : [['σ2s', 0, 1], ['σ*2s', 1, 1], ['σ2p', 0, 1], ['π2p', 0, 2], ['π*2p', 1, 2], ['σ*2p', 1, 1]];
    var left = ne, b = 0, a = 0, unp = 0, fill = [];
    lv0.forEach(function (L) { var k = M.min(left, 2 * L[2]); left -= k; if (L[1]) a += k; else b += k; unp += k <= L[2] ? k : 2 * L[2] - k; fill.push([L[0], k]); });
    return { ne: ne, bo: Q(b - a, 2), unp: unp, fill: fill, b: b, a: a };
  }
  function moName(mol, q) { return ft(mol + (q ? '^' + (M.abs(q) > 1 ? M.abs(q) : '') + (q > 0 ? '+' : '-') : '')); }
  var MOLIST = [['H2', 0], ['H2', 1], ['He2', 0], ['He2', 1], ['Li2', 0], ['Be2', 0], ['B2', 0], ['C2', 0], ['N2', 0], ['N2', 1], ['O2', 0], ['O2', 1], ['O2', -1], ['O2', -2], ['F2', 0], ['F2', 1], ['Ne2', 0], ['C2', -2],
    ['H2', -1], ['Li2', 1], ['Be2', 1], ['B2', 1], ['B2', -1], ['C2', 1], ['C2', -1], ['N2', -1], ['N2', -2], ['O2', 2], ['F2', -1], ['Ne2', 1]];
  function moSteps(mol, q, f) { return [(MOSP[mol][0] === 'H' || MOSP[mol][0] === 'He' ? 'Electrons' : 'Valence electrons') + ': $' + f.ne + '$. Filling order' + (['B2', 'C2', 'N2', 'Li2', 'Be2'].indexOf(mol) >= 0 ? ' (with s–p mixing)' : '') + ': ' + f.fill.filter(function (x) { return x[1]; }).map(function (x) { return x[0] + (x[1] > 1 ? '<sup>' + x[1] + '</sup>' : '<sup>1</sup>'); }).join(' ') + '.', 'Bonding: ' + f.b + '; antibonding: ' + f.a + '. Bond order $= \\tfrac{1}{2}(' + f.b + ' - ' + f.a + ') = ' + f.bo.toTex() + '$.']; }

  G('gchem1.molecular-orbitals', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['bo', 'unp', 'exist'], ['bo', 'unp', 'mag', 'compare'], ['bo', 'compare', 'mag', 'unp']));
    var m = R.pick(shape === 'exist' ? MOLIST : MOLIST.filter(function (x) { return moFill(x[0], x[1]).bo.gt(0); })), f = moFill(m[0], m[1]), nm = moName(m[0], m[1]);
    var vz = !m[1] ? { name: 'ch-modiagram', opts: { mol: m[0], quiet: true, edit: true, step: 0 } } : null; // starts empty: the learner fills it
    if (shape === 'bo') return P('Use a molecular orbital diagram to find the bond order of $' + nm + '$. (A fraction or decimal is fine.)', { t: 'num', v: f.bo.toPlain(), rtol: 0.01 }, moSteps(m[0], m[1], f), 'Bond order = ½(bonding − antibonding electrons).', null, { k: 'bo', mol: m[0], q: m[1] }, vz);
    if (shape === 'unp') return P('How many unpaired electrons does $' + nm + '$ have, according to its molecular orbital diagram?', exact(f.unp), moSteps(m[0], m[1], f).slice(0, 1).concat(['Within a set of equal-energy orbitals (the two π or two π*), electrons spread out one per orbital before pairing: ' + f.unp + ' unpaired.']), 'Watch the half-filled π or π* pair.', null, { k: 'unp', mol: m[0], q: m[1] }, vz);
    if (shape === 'mag') return P('Is $' + nm + '$ paramagnetic or diamagnetic?', mcK(['paramagnetic', 'diamagnetic'], f.unp ? 0 : 1), moSteps(m[0], m[1], f).slice(0, 1).concat([f.unp + ' unpaired electron' + (f.unp === 1 ? '' : 's') + ': ' + (f.unp ? 'paramagnetic.' : 'diamagnetic.')]), 'Count unpaired electrons in the MO diagram.', null, { k: 'mag', mol: m[0], q: m[1] }, vz);
    if (shape === 'exist') return P('True or false: the MO diagram predicts that $' + nm + '$ can exist as a bonded species.', tf(f.bo.gt(0)), moSteps(m[0], m[1], f).concat([f.bo.gt(0) ? 'Bond order above zero: a bond, though it may be weak.' : 'Bond order zero: the antibonding electrons cancel the bonding ones, so no bond.']), 'Is the bond order greater than zero?', null, { k: 'exist', mol: m[0], q: m[1] });
    var grp = R.pick([[['O2', 1], ['O2', 0], ['O2', -1], ['O2', -2]], [['N2', 0], ['N2', 1]], [['H2', 0], ['H2', 1], ['He2', 1]], [['F2', 0], ['F2', 1]], [['C2', 0], ['C2', -2]]]), two = R.sample(grp, 2), strong = R.coin();
    var f0 = moFill(two[0][0], two[0][1]), f1 = moFill(two[1][0], two[1][1]);
    if (f0.bo.eq(f1.bo)) { two = [grp[0], grp[grp.length - 1]]; f0 = moFill(two[0][0], two[0][1]); f1 = moFill(two[1][0], two[1][1]); }
    var hi = f0.bo.gt(f1.bo) ? 0 : 1, pickI = strong ? hi : 1 - hi;
    return P('Which has the ' + (strong ? 'stronger, shorter' : 'weaker, longer') + ' bond: $' + moName(two[0][0], two[0][1]) + '$ or $' + moName(two[1][0], two[1][1]) + '$?', mcK(['$' + moName(two[0][0], two[0][1]) + '$', '$' + moName(two[1][0], two[1][1]) + '$'], pickI),
      ['Bond orders: $' + moName(two[0][0], two[0][1]) + '$: $' + f0.bo.toTex() + '$; $' + moName(two[1][0], two[1][1]) + '$: $' + f1.bo.toTex() + '$.', 'A higher bond order means a stronger, shorter bond.'],
      'Find each bond order.', null, { k: 'mocmp' });
  });


  // ================================================================== UNIT 5: LIQUIDS, SOLIDS AND PHASE CHANGES
  // normal boiling points (°C, NIST Chemistry WebBook, as in the visual kit), polar?, hydrogen bonding?, name
  var BPD = { H2O: [100, 1, 1, 'water'], NH3: [-33.3, 1, 1, 'ammonia'], HF: [19.5, 1, 1, 'hydrogen fluoride'], CH4: [-161.5, 0, 0, 'methane'], C2H6: [-88.6, 0, 0, 'ethane'], C3H8: [-42.1, 0, 0, 'propane'], C4H10: [-0.5, 0, 0, 'butane'],
    C8H18: [125.6, 0, 0, 'octane'], CH3OH: [64.7, 1, 1, 'methanol'], C2H5OH: [78.3, 1, 1, 'ethanol'], CH3OCH3: [-24.8, 1, 0, 'dimethyl ether'], CH3COCH3: [56.1, 1, 0, 'acetone'], CH3F: [-78.4, 1, 0, 'fluoromethane'], CH3Cl: [-24.2, 1, 0, 'chloromethane'],
    CH2Cl2: [39.6, 1, 0, 'dichloromethane'], CHCl3: [61.2, 1, 0, 'chloroform'], CCl4: [76.7, 0, 0, 'carbon tetrachloride'], H2S: [-60.3, 1, 0, 'hydrogen sulfide'], HCl: [-85, 1, 0, 'hydrogen chloride'], HBr: [-66.4, 1, 0, 'hydrogen bromide'], HI: [-35.4, 1, 0, 'hydrogen iodide'],
    F2: [-188.1, 0, 0, 'fluorine'], Cl2: [-34, 0, 0, 'chlorine'], Br2: [58.8, 0, 0, 'bromine'], I2: [184.4, 0, 0, 'iodine'], Ne: [-246, 0, 0, 'neon'], Ar: [-185.8, 0, 0, 'argon'], Kr: [-153.4, 0, 0, 'krypton'], Xe: [-108.1, 0, 0, 'xenon'],
    H2Se: [-41.3, 1, 0, 'hydrogen selenide'], H2Te: [-2.2, 1, 0, 'hydrogen telluride'], PH3: [-87.7, 1, 0, 'phosphine'], SiH4: [-111.9, 0, 0, 'silane'], GeH4: [-88.5, 0, 0, 'germane'], SnH4: [-51.8, 0, 0, 'stannane'] };
  var ZN = { H: 1, C: 6, N: 7, O: 8, F: 9, Ne: 10, Si: 14, P: 15, S: 16, Cl: 17, Ar: 18, Ge: 32, Se: 34, Br: 35, Kr: 36, Sn: 50, Te: 52, I: 53, Xe: 54 };
  function electrons(f) { var a = parseF(f).atoms; return Object.keys(a).reduce(function (s, e) { return s + ZN[e] * a[e]; }, 0); }
  function forcesOf(f) { var d = BPD[f]; return d[2] ? 'dispersion, dipole–dipole and hydrogen bonding' : d[1] ? 'dispersion and dipole–dipole' : 'dispersion only'; }
  // curated pairs (higher boiling first) with the reason that decides them
  var BPPAIRS = [['CCl4', 'CH3F', 'size'], ['HI', 'HCl', 'size'], ['HBr', 'HCl', 'size'], ['HF', 'HCl', 'hb'], ['H2O', 'H2S', 'hb'], ['NH3', 'PH3', 'hb'], ['C8H18', 'C3H8', 'size'], ['I2', 'Br2', 'size'], ['Br2', 'Cl2', 'size'], ['Xe', 'Ar', 'size'],
    ['C2H5OH', 'CH3OCH3', 'hb'], ['CH3COCH3', 'C4H10', 'dip'], ['H2Te', 'H2Se', 'size'], ['CH3OH', 'C2H6', 'hb'], ['SiH4', 'CH4', 'size'], ['Br2', 'HBr', 'size'], ['CCl4', 'CHCl3', 'size'], ['I2', 'H2O', 'size'], ['HF', 'F2', 'hb']];
  function bpReason(a, b, why) {
    var ea = electrons(a), eb = electrons(b);
    if (why === 'hb') return F(a) + ' forms hydrogen bonds (H bonded to ' + (a === 'HF' ? 'F' : a === 'NH3' ? 'N' : 'O') + '), which ' + F(b) + ' cannot' + (eb > ea ? ', and that outweighs ' + F(b) + '\'s larger electron cloud (' + eb + ' against ' + ea + ' electrons)' : '') + '.';
    if (why === 'dip') return 'They have similar numbers of electrons (' + ea + ' and ' + eb + '), but ' + F(a) + ' is polar and adds dipole–dipole attractions.';
    return F(a) + ' has more electrons (' + ea + ' against ' + eb + '), a larger, more polarizable cloud, so its dispersion forces are stronger' + (BPD[b][1] && !BPD[a][1] ? ', enough to beat ' + F(b) + '\'s dipole–dipole forces' : BPD[b][2] ? ', enough to beat even ' + F(b) + '\'s hydrogen bonds' : '') + '.';
  }
  var RANKS = [['CH4', 'C2H6', 'C3H8', 'C4H10'], ['F2', 'Cl2', 'Br2', 'I2'], ['Ne', 'Ar', 'Kr', 'Xe'], ['HCl', 'HBr', 'HI'], ['CH4', 'SiH4', 'GeH4', 'SnH4'], ['H2S', 'H2Se', 'H2Te']];
  function bpTxt(f) { return gx(rd(BPD[f][0], 0)) + '^\\circ\\text{C}'; }

  G('gchem1.comparing-forces', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['higher', 'forces', 'rank'], ['higher', 'higher', 'rank', 'forces', 'tf'], ['higher', 'rank', 'tf', 'pentane']));
    if (shape === 'higher') { var pr = R.pick(BPPAIRS), sw = R.coin(), names = sw ? [pr[1], pr[0]] : [pr[0], pr[1]];
      return P('Which has the higher normal boiling point: ' + F(names[0]) + ' (' + BPD[names[0]][3] + ') or ' + F(names[1]) + ' (' + BPD[names[1]][3] + ')?', mcK([F(names[0]), F(names[1])], names[0] === pr[0] ? 0 : 1),
        [cap(BPD[pr[0]][3]) + ': ' + forcesOf(pr[0]) + '; ' + BPD[pr[1]][3] + ': ' + forcesOf(pr[1]) + '.', bpReason(pr[0], pr[1], pr[2]), 'Boiling points: $' + bpTxt(pr[0]) + '$ against $' + bpTxt(pr[1]) + '$.'],
        'Compare electron counts first, then polarity and hydrogen bonding.', null, { k: 'bp', hi: pr[0], lo: pr[1] }); }
    if (shape === 'rank') { var set = R.pick(RANKS).slice(), pick = set.length > 3 ? R.sample(set, 3) : set, srt = pick.slice().sort(function (a, b) { return BPD[a][0] - BPD[b][0]; });
      var right = '$' + srt.map(ft).join(' < ') + '$', wr = [[srt[2], srt[1], srt[0]], [srt[1], srt[0], srt[2]], [srt[0], srt[2], srt[1]]].map(function (x) { return '$' + x.map(ft).join(' < ') + '$'; });
      return P('Rank ' + lst(R.shuffle(pick).map(F)) + ' from lowest to highest boiling point.', mc(right, wr),
        ['Same kind of molecule' + (BPD[srt[0]][1] ? ' (all weakly polar, no hydrogen bonds)' : ' (all nonpolar)') + ', so dispersion forces decide: more electrons, stronger forces.', 'Electrons: ' + srt.map(function (f) { return F(f) + ' ' + electrons(f); }).join(', ') + '. Boiling points: ' + srt.map(function (f) { return '$' + bpTxt(f) + '$'; }).join(', ') + '.'],
        'More electrons, stronger dispersion forces.', null, { k: 'rank', order: srt }); }
    if (shape === 'forces') { var f0 = R.pick(Object.keys(BPD)), right2 = forcesOf(f0);
      return P('Which intermolecular forces act between molecules of ' + BPD[f0][3] + ', ' + F(f0) + '?', mc(right2, ['dispersion only', 'dispersion and dipole–dipole', 'dispersion, dipole–dipole and hydrogen bonding', 'dipole–dipole only'].filter(function (x) { return x !== right2; })),
        ['Every molecule has dispersion forces.', BPD[f0][1] ? F(f0) + ' is polar, so dipole–dipole forces act too.' : F(f0) + ' is nonpolar (no net dipole), so there are no dipole–dipole forces.', BPD[f0][2] ? 'It has H bonded to N, O or F, so it also forms hydrogen bonds.' : (BPD[f0][1] ? 'It has no H bonded to N, O or F, so no hydrogen bonds.' : '')].filter(Boolean),
        'Dispersion always; dipole–dipole if polar; hydrogen bonds if H is on N, O or F.', null, { k: 'forces', f: f0 }); }
    if (shape === 'pentane') { var hiP = R.coin();
      return P('n-Pentane (a five-carbon chain) and neopentane (a compact, nearly spherical molecule) are both $\\mathrm{C_5H_{12}}$. Which has the ' + (hiP ? 'higher' : 'lower') + ' boiling point?', mcK(['n-pentane', 'neopentane', 'they boil at the same temperature'], hiP ? 0 : 1),
        ['Same formula, same 42 electrons, both nonpolar: only dispersion forces, and the difference comes from shape.', 'The long chain touches its neighbors along its whole length; the ball touches them only at a few points. More contact, stronger total attraction.', 'Boiling points: n-pentane $36^\\circ\\text{C}$, neopentane $10^\\circ\\text{C}$.'],
        'Which shape has more surface in contact with its neighbors?', null, { k: 'shape' }); }
    var t = R.pick([['Dispersion forces are always weaker than dipole–dipole forces.', false, 'Not when the nonpolar molecule is much larger: $\\mathrm{CCl_4}$ (nonpolar) boils at $77^\\circ\\text{C}$, polar $\\mathrm{CH_3F}$ at $-78^\\circ\\text{C}$.'],
      ['Every molecule, polar or not, has dispersion forces.', true, 'Every molecule has electrons whose cloud can be momentarily lopsided.'],
      ['Iodine, $\\mathrm{I_2}$, is a solid at room temperature even though its molecules are nonpolar.', true, 'With 106 electrons per molecule its dispersion forces are strong enough to hold a solid together.'],
      ['$\\mathrm{HCl}$ boils higher than $\\mathrm{HI}$ because $\\mathrm{HCl}$ is more polar.', false, 'HI boils higher ($-35$ against $-85^\\circ\\text{C}$): its much larger electron cloud gives stronger dispersion forces, which outweigh the polarity difference.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Size and polarizability can beat polarity.', null, { k: 'tf' });
  });

  // water's vapor pressure (mmHg) from the Antoine equation fit to NIST data
  var VPW = { 20: 17.5, 30: 31.7, 40: 55.2, 50: 92.3, 60: 149, 70: 233, 80: 355, 90: 525, 100: 760 };

  G('gchem1.vapor-pressure', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['effect', 'boilAt', 'compare'], ['boilAt', 'compare', 'boils', 'effect'], ['boils', 'boilAt', 'compare', 'tf']));
    var tblT = [40, 50, 60, 70, 80, 90, 100], tbl = 'Water\'s vapor pressure: ' + tblT.map(function (t) { return t + ' °C, ' + gx(VPW[t]) + ' mmHg'; }).join('; ') + '.';
    if (shape === 'boilAt') { var T0 = R.pick([50, 60, 70, 80, 90]), Pext = VPW[T0], atm = R.coin() && T0 >= 80;
      return P(tbl + ' At what temperature does water boil when the pressure above it is ' + (atm ? '$' + qx(Pext / 760, 'atm') + '$' : '$' + qg(Pext, 'mmHg') + '$') + '?', { t: 'num', v: String(T0), tol: 2 },
        ['Water boils when its vapor pressure equals the pressure above it.'].concat(atm ? ['In mmHg: $' + fx(Pext / 760) + ' \\times 760 = ' + fx(Pext) + '\\ \\text{mmHg}$.'] : []).concat(['From the table, the vapor pressure is $' + gx(Pext) + '$ mmHg at $' + T0 + '^\\circ\\text{C}$: that is the boiling point.']),
        'Find where the vapor pressure equals the outside pressure.', 'C', { k: 'boilAt', T: T0 }); }
    if (shape === 'boils') { var T1 = R.pick([40, 50, 60, 70, 80, 90]), P1 = sgf(VPW[T1] * R.pick([0.6, 0.8, 1.25, 1.5]), 2), yes = VPW[T1] >= P1;
      return P(tbl + ' Water at $' + T1 + '^\\circ\\text{C}$ is in a container where the pressure above it is held at $' + qg(P1, 'mmHg') + '$. True or false: it boils.', tf(yes),
        ['At $' + T1 + '^\\circ\\text{C}$ water\'s vapor pressure is $' + gx(VPW[T1]) + '$ mmHg.', yes ? 'That is more than the ' + gx(P1) + ' mmHg pushing on it, so bubbles of vapor can form and grow: it boils.' : 'That is less than the ' + gx(P1) + ' mmHg pushing on it, so vapor bubbles collapse: it does not boil (though it still evaporates from the surface).'],
        'Compare the vapor pressure with the pressure above the liquid.', null, { k: 'boils' }); }
    if (shape === 'compare') { var liq = ['H2O', 'C2H5OH', 'CH3OH', 'CH3COCH3', 'CHCl3', 'CCl4', 'C8H18', 'CH2Cl2', 'Br2'], two = R.sample(liq, 2), hi = BPD[two[0]][0] < BPD[two[1]][0] ? two[0] : two[1];
      if (M.abs(BPD[two[0]][0] - BPD[two[1]][0]) < 5) two = ['H2O', 'CH3COCH3'], hi = 'CH3COCH3';
      return P('Which has the higher vapor pressure at $20^\\circ\\text{C}$: ' + BPD[two[0]][3] + ' (normal boiling point $' + bpTxt(two[0]) + '$) or ' + BPD[two[1]][3] + ' (normal boiling point $' + bpTxt(two[1]) + '$)?', mcK([cap(BPD[two[0]][3]), cap(BPD[two[1]][3])], hi === two[0] ? 0 : 1),
        ['A lower normal boiling point means the liquid reaches 1 atm of vapor pressure at a lower temperature: its molecules escape more easily.', 'So at any one temperature, ' + BPD[hi][3] + ' has the higher vapor pressure.'],
        'Weaker forces, lower boiling point, higher vapor pressure.', null, { k: 'vpcmp', hi: hi }); }
    if (shape === 'effect') { var e = R.pick([['More water is poured into a closed flask of water at constant temperature, and equilibrium returns.', 'It stays the same.'], ['The water in a closed flask is moved to a flask twice as large at the same temperature, and equilibrium returns (some liquid remains).', 'It stays the same.'], ['The closed flask of water is warmed from $25^\\circ\\text{C}$ to $40^\\circ\\text{C}$.', 'It increases.'], ['The closed flask of water is cooled from $40^\\circ\\text{C}$ to $25^\\circ\\text{C}$.', 'It decreases.']]);
      return P(e[0] + ' What happens to the vapor pressure of the water?', mc(e[1], ['It increases.', 'It decreases.', 'It stays the same.'].filter(function (x) { return x !== e[1]; })),
        ['Vapor pressure depends only on the substance and the temperature.', e[1] === 'It stays the same.' ? 'The amount of liquid and the size of the container don\'t change how fast molecules leave or return per unit of surface, so the equilibrium pressure is unchanged.' : 'Temperature changes how many molecules have enough energy to escape, so the vapor pressure ' + (e[1] === 'It increases.' ? 'rises.' : 'falls.')],
        'What does vapor pressure depend on?', null, { k: 'effect' }); }
    var t = R.pick([['Water always boils at $100^\\circ\\text{C}$.', false, 'Only at 1 atm. At lower pressure (high altitude) it boils below $100^\\circ\\text{C}$; in a pressure cooker, above.'],
      ['At equilibrium in a closed flask, molecules stop evaporating.', false, 'Evaporation continues; condensation happens at the same rate, so the vapor pressure stays constant (dynamic equilibrium).'],
      ['A liquid with weaker intermolecular forces has a higher vapor pressure at a given temperature.', true, 'Its molecules escape more easily.'],
      ['Doubling the amount of liquid in a closed container doubles its vapor pressure.', false, 'Vapor pressure does not depend on the amount of liquid.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Vapor pressure depends on the substance and the temperature only.', null, { k: 'tf' });
  });

  // enthalpies of vaporization at the normal boiling point (kJ/mol, NIST Chemistry WebBook)
  var VAPD = [['water', 40.7, 100.0], ['ethanol', 38.6, 78.3], ['methanol', 35.2, 64.7], ['acetone', 29.1, 56.1], ['benzene', 30.7, 80.1], ['hexane', 28.9, 68.7], ['diethyl ether', 26.5, 34.6]];

  G('gchem1.clausius-clapeyron', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['P2', 'P2', 'Tb'], ['P2', 'dH', 'Tb'], ['dH', 'Tb', 'P2']));
    var s = R.pick(VAPD), dH = s[1] * 1000, Tb = nk(s[2]);
    var cc = '$\\ln\\dfrac{P_2}{P_1} = -\\dfrac{\\Delta H_\\text{vap}}{R}\\left(\\dfrac{1}{T_2} - \\dfrac{1}{T_1}\\right)$';
    if (shape === 'P2') { var T2c = rd(s[2] - R.pick([10, 15, 20, 25, 30]), 1), T2 = nk(T2c), x = 1 / T2 - 1 / Tb, P2 = 760 * M.exp(-dH / RJ * x);
      return P('The normal boiling point of ' + s[0] + ' is $' + gd(s[2], 1) + '^\\circ\\text{C}$ (where its vapor pressure is 760 mmHg), and its $\\Delta H_\\text{vap} = ' + qg(s[1], 'kJmol') + '$. Estimate its vapor pressure at $' + gd(T2c, 1) + '^\\circ\\text{C}$. Use a calculator.', ans(P2, 0.02),
        [cc + '.', 'Kelvins: $T_1 = ' + gx(Tb) + '\\ \\text{K}$, $T_2 = ' + gx(T2) + '\\ \\text{K}$. $\\dfrac{1}{T_2} - \\dfrac{1}{T_1} = ' + fx(x, 4) + '\\ \\text{K}^{-1}$.', '$\\ln\\dfrac{P_2}{760} = -\\dfrac{' + gx(dH) + '}{8.314}(' + fx(x, 4) + ') = ' + fx(-dH / RJ * x, 4) + '$.', '$P_2 = 760\\,e^{' + fx(-dH / RJ * x, 4) + '} = ' + qx(P2, 'mmHg') + '$, lower than 760, as it should be at a lower temperature.'],
        'Kelvins for T, joules for ΔH.', 'mmHg', { k: 'P2', dH: dH, T1: Tb, P1: 760, T2: T2 }); }
    if (shape === 'dH') { var t1 = R.pick([20.0, 25.0, 30.0]), t2 = t1 + R.pick([20, 25, 30, 35]), P1 = R.pick([50.0, 80.0, 100.0, 150.0, 200.0]), dHq = R.pick([28, 30, 32, 35, 38, 41, 44]) * 1000, P2r = sgf(P1 * M.exp(-dHq / RJ * (1 / nk(t2) - 1 / nk(t1))), 4), xx = 1 / nk(t2) - 1 / nk(t1), lnr = M.log(P2r / P1), dHa = -lnr * RJ / xx;
      return P('A liquid\'s vapor pressure is $' + qd(P1, 1, 'mmHg') + '$ at $' + gd(t1, 1) + '^\\circ\\text{C}$ and $' + qx(P2r, 'mmHg', 4) + '$ at $' + gd(t2, 1) + '^\\circ\\text{C}$. Find its $\\Delta H_\\text{vap}$ in kJ/mol. Use a calculator.', ans(dHa / 1000, 0.02),
        [cc + '.', '$\\ln\\dfrac{' + fx(P2r, 4) + '}{' + gd(P1, 1) + '} = ' + fx(lnr, 4) + '$.', '$\\dfrac{1}{' + gx(nk(t2)) + '} - \\dfrac{1}{' + gx(nk(t1)) + '} = ' + fx(xx, 4) + '\\ \\text{K}^{-1}$.', '$\\Delta H_\\text{vap} = -\\dfrac{R\\ln(P_2/P_1)}{1/T_2 - 1/T_1} = -\\dfrac{8.314(' + fx(lnr, 4) + ')}{' + fx(xx, 4) + '} = ' + qx(dHa, 'Jmol') + ' = ' + qx(dHa / 1000, 'kJmol') + '$.'],
        'Solve the equation for ΔH; temperatures in kelvins.', 'kJmol', { k: 'dH', T1: nk(t1), P1: P1, T2: nk(t2), P2: P2r }); }
    var Pq = R.pick([0.500, 0.600, 0.700, 0.800, 1.50, 2.00]), inv = 1 / Tb - M.log(Pq) * RJ / dH, Tn = 1 / inv;
    return P('At what temperature, in °C, does ' + s[0] + ' boil when the pressure is $' + qx(Pq, 'atm') + '$? Its normal boiling point is $' + gd(s[2], 1) + '^\\circ\\text{C}$ and $\\Delta H_\\text{vap} = ' + qg(s[1], 'kJmol') + '$. Use a calculator.', { t: 'num', v: plainNum(rd(Tn - 273.15, 1)), tol: 0.6 },
      [cc + ', with $P_1 = 1.000\\ \\text{atm}$ at $T_1 = ' + gx(Tb) + '\\ \\text{K}$ and $P_2 = ' + fx(Pq) + '\\ \\text{atm}$ at the new boiling point.', '$\\dfrac{1}{T_2} = \\dfrac{1}{T_1} - \\dfrac{R\\ln(P_2/P_1)}{\\Delta H_\\text{vap}} = \\dfrac{1}{' + gx(Tb) + '} - \\dfrac{8.314(' + fx(M.log(Pq), 4) + ')}{' + gx(dH) + '} = ' + fx(inv, 5) + '\\ \\text{K}^{-1}$.', '$T_2 = ' + fx(Tn, 4) + '\\ \\text{K} = ' + fx(Tn - 273.15, 3) + '^\\circ\\text{C}$, ' + (Pq < 1 ? 'lower' : 'higher') + ' than the normal boiling point.'],
      'Set $P_2$ to the new pressure and solve for $T_2$.', 'C', { k: 'Tb', dH: dH, T1: Tb, P2: Pq });
  });

  // phase diagram points well inside one region: [substance, °C, atm, phase]
  var PHPTS = [['H2O', 25, 1, 'liquid'], ['H2O', -10, 1, 'solid'], ['H2O', 120, 1, 'gas'], ['H2O', 50, 0.05, 'gas'], ['H2O', 50, 0.5, 'liquid'], ['H2O', -10, 0.001, 'gas'], ['H2O', 400, 250, 'supercritical fluid'], ['H2O', 150, 10, 'liquid'], ['H2O', 150, 2, 'gas'], ['H2O', -20, 100, 'solid'], ['H2O', 20, 0.01, 'gas'],
    ['CO2', 25, 1, 'gas'], ['CO2', -100, 1, 'solid'], ['CO2', -40, 20, 'liquid'], ['CO2', 0, 50, 'liquid'], ['CO2', 0, 20, 'gas'], ['CO2', -60, 1, 'gas'], ['CO2', 50, 100, 'supercritical fluid'], ['CO2', -80, 10, 'solid'], ['CO2', 20, 70, 'liquid']];
  var PHHINT = { H2O: 'Water: triple point $0.01^\\circ\\text{C}$, 0.00604 atm; critical point $374^\\circ\\text{C}$, 218 atm; vapor pressure 0.0231 atm at $20^\\circ\\text{C}$, 0.121 atm at $50^\\circ\\text{C}$, 4.7 atm at $150^\\circ\\text{C}$; ice\'s vapor pressure 0.0026 atm at $-10^\\circ\\text{C}$.',
    CO2: 'Carbon dioxide: triple point $-56.6^\\circ\\text{C}$, 5.11 atm; critical point $31.0^\\circ\\text{C}$, 72.8 atm; sublimes at $-78.5^\\circ\\text{C}$ at 1 atm; vapor pressure of the liquid 10 atm at $-40^\\circ\\text{C}$, 34 atm at $0^\\circ\\text{C}$, 56.5 atm at $20^\\circ\\text{C}$.' };
  function phaseWhy(pt) {
    if (pt[3] === 'supercritical fluid') return 'Both the temperature and the pressure are above the critical point, so it is a supercritical fluid.';
    if (pt[0] === 'H2O') {
      if (pt[3] === 'solid') return 'Below $0^\\circ\\text{C}$ and above the solid–gas line: solid.';
      if (pt[3] === 'gas') return 'The pressure is below water\'s vapor pressure at that temperature, so the point lies below the line: gas.';
      return 'Above $0^\\circ\\text{C}$, below the critical point, and the pressure is above the vapor pressure: liquid.';
    }
    if (pt[3] === 'solid') return 'Below the solid–gas (or solid–liquid) line at that temperature: solid.';
    if (pt[3] === 'gas') return 'The pressure is below the line separating gas from the condensed phases at that temperature: gas.';
    return 'Above the triple-point pressure, below the critical temperature and above the liquid\'s vapor pressure: liquid.';
  }

  G('gchem1.phase-diagrams', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['phase', 'phase', 'def'], ['phase', 'path', 'def'], ['phase', 'path', 'tf']));
    if (shape === 'phase') { var pt = R.pick(PHPTS), nm = pt[0] === 'H2O' ? 'water' : 'carbon dioxide';
      return P('Use these facts about ' + nm + '\'s phase diagram. ' + PHHINT[pt[0]] + ' What is the phase of ' + nm + ' at $' + pt[1] + '^\\circ\\text{C}$ and ' + gx(pt[2]) + ' atm?', mc(pt[3], ['solid', 'liquid', 'gas', 'supercritical fluid'].filter(function (x) { return x !== pt[3]; })),
        ['Locate the point and find which region it is in, not which line it is near.', phaseWhy(pt)],
        'Compare the pressure with the boundary at that temperature.', null, { k: 'phase', pt: pt }, { name: 'ch-phasediagram', opts: { sub: pt[0], quiet: true, edit: false } }); }
    if (shape === 'path') { var pa = R.pick([['Dry ice (solid $\\mathrm{CO_2}$) at $-100^\\circ\\text{C}$ is warmed to $20^\\circ\\text{C}$ at a constant 1 atm.', 'It sublimes: solid turns directly to gas.', 'At 1 atm, below the 5.11 atm triple point, the path crosses only the solid–gas line (at $-78.5^\\circ\\text{C}$).'],
        ['Ice at $-10^\\circ\\text{C}$ is warmed to $50^\\circ\\text{C}$ at a constant 0.001 atm.', 'It sublimes: solid turns directly to gas.', '0.001 atm is below water\'s triple-point pressure (0.00604 atm), so the path never enters the liquid region.'],
        ['Water vapor at $25^\\circ\\text{C}$ and 0.01 atm is slowly compressed to 1 atm at constant temperature.', 'It condenses to a liquid.', 'At $25^\\circ\\text{C}$ the path crosses the liquid–gas line (water\'s vapor pressure, 0.031 atm) into the liquid region.'],
        ['Carbon dioxide at $40^\\circ\\text{C}$ is compressed from 1 atm to 100 atm.', 'It becomes a supercritical fluid without ever condensing.', '$40^\\circ\\text{C}$ is above the critical temperature ($31.0^\\circ\\text{C}$), so there is no liquid–gas line to cross.'],
        ['Ice at $-5^\\circ\\text{C}$ and 1 atm is warmed to $50^\\circ\\text{C}$ at 1 atm.', 'It melts to a liquid.', '1 atm is above the triple-point pressure, so the path crosses the solid–liquid line near $0^\\circ\\text{C}$ and stops in the liquid region (water boils only at $100^\\circ\\text{C}$).']]);
      return P(pa[0] + ' What happens?', mc(pa[1], ['It melts to a liquid.', 'It condenses to a liquid.', 'It sublimes: solid turns directly to gas.', 'It becomes a supercritical fluid without ever condensing.', 'Nothing: it stays in the same phase.'].filter(function (x) { return x !== pa[1]; }).slice(0, 3)),
        [pa[2]], 'Trace the path across the diagram and count the lines it crosses.', null, { k: 'path' }); }
    if (shape === 'def') { var d = R.pick([['the triple point', 'the one temperature and pressure where solid, liquid and gas coexist'], ['the critical point', 'where the liquid–gas line ends; above it liquid and gas can no longer be told apart'], ['the normal boiling point', 'where the liquid–gas line crosses 1 atm'], ['a point on the solid–liquid line', 'conditions where solid and liquid coexist (melting or freezing)']]);
      var defs = ['the one temperature and pressure where solid, liquid and gas coexist', 'where the liquid–gas line ends; above it liquid and gas can no longer be told apart', 'where the liquid–gas line crosses 1 atm', 'conditions where solid and liquid coexist (melting or freezing)'];
      return P('On a phase diagram, what is ' + d[0] + '?', mc(d[1], defs.filter(function (x) { return x !== d[1]; })), ['Lines are two-phase coexistence; the triple point is where all three lines meet; the critical point is where the liquid–gas line stops.', cap(d[0]) + ': ' + d[1] + '.'], 'Lines mean coexistence.', null, { k: 'def' }); }
    var t = R.pick([['At 1 atm, solid carbon dioxide melts into a liquid when warmed.', false, '1 atm is below CO₂\'s triple-point pressure (5.11 atm), so dry ice sublimes straight to gas.'],
      ['Water\'s solid–liquid line slopes slightly to the left, so pressing on ice can lower its melting point.', true, 'Ice is less dense than liquid water, so higher pressure favors the liquid.'],
      ['The triple point and the critical point are two names for the same point.', false, 'The triple point is where three phases coexist; the critical point is where the liquid–gas line ends.'],
      ['Above its critical temperature, a gas cannot be liquefied by pressure alone.', true, 'There is no liquid–gas line to cross; the fluid just gets denser.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Read regions, lines and the two special points.', null, { k: 'tf' });
  });

  // cubic metals: [name, symbol, cell, metallic radius in pm, molar mass]
  // (last entry: measured density at room temperature, g/cm³, CRC Handbook)
  var METALS = [['copper', 'Cu', 'fcc', 128, 63.55, 8.96], ['aluminum', 'Al', 'fcc', 143, 26.98, 2.70], ['silver', 'Ag', 'fcc', 144, 107.87, 10.5], ['gold', 'Au', 'fcc', 144, 196.97, 19.3], ['nickel', 'Ni', 'fcc', 124, 58.69, 8.91], ['lead', 'Pb', 'fcc', 175, 207.2, 11.3],
    ['iron', 'Fe', 'bcc', 124, 55.85, 7.87], ['chromium', 'Cr', 'bcc', 125, 52.00, 7.19], ['sodium', 'Na', 'bcc', 186, 22.99, 0.968], ['potassium', 'K', 'bcc', 227, 39.10, 0.862],
    ['platinum', 'Pt', 'fcc', 139, 195.08, 21.4], ['palladium', 'Pd', 'fcc', 137, 106.42, 12.0], ['calcium', 'Ca', 'fcc', 197, 40.08, 1.55], ['strontium', 'Sr', 'fcc', 215, 87.62, 2.64], ['lithium', 'Li', 'bcc', 152, 6.94, 0.534]];
  var CELL = { sc: ['simple cubic', 1, 2, 'a = 2r', '8 \\times \\tfrac{1}{8} = 1'], bcc: ['body-centered cubic', 2, 4 / M.sqrt(3), 'a = \\dfrac{4r}{\\sqrt{3}}', '8 \\times \\tfrac{1}{8} + 1 = 2'], fcc: ['face-centered cubic', 4, 4 / M.sqrt(2), 'a = \\dfrac{4r}{\\sqrt{2}}', '8 \\times \\tfrac{1}{8} + 6 \\times \\tfrac{1}{2} = 4'] };

  G('gchem1.unit-cells', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['count', 'edge', 'cellmass', 'coord'], ['edge', 'density', 'count', 'cellmass', 'coord'], ['density', 'radius', 'which', 'volume']));
    if (shape === 'coord') { var cc = R.pick(['sc', 'bcc', 'fcc']), cn = { sc: 6, bcc: 8, fcc: 12 }[cc], pk = { sc: 52, bcc: 68, fcc: 74 }[cc], askPack = R.coin();
      if (askPack) return P('About what percent of the space in a ' + CELL[cc][0] + ' crystal is filled by atoms (spheres touching as in that structure)?', mc(pk + '%', [52, 68, 74, 100].filter(function (x) { return x !== pk; }).map(function (x) { return x + '%'; })),
        ['Fraction filled = (atoms per cell × volume of one sphere) ÷ volume of the cell, using the edge–radius relation.', 'Simple cubic: 52%; body-centered: 68%; face-centered (closest packing): 74%.'], 'More neighbors, tighter packing.', null, { k: 'pack', cell: cc });
      return P('How many nearest neighbors does each atom have in a ' + CELL[cc][0] + ' metal (its coordination number)?', exact(cn),
        [cc === 'sc' ? 'Each atom touches one neighbor along each direction of each axis: 6.' : cc === 'bcc' ? 'The body-center atom touches the 8 corner atoms: 8.' : 'Each atom touches 4 neighbors in its own layer plane and 4 above and 4 below: 12, the most possible for equal spheres.'], 'Count the atoms that touch one atom.', null, { k: 'coord', cell: cc }); }
    if (shape === 'volume') { var mv = R.pick(METALS), cv = CELL[mv[2]], av = cv[2] * mv[3], acmv = av * 1e-10;
      return P(cap(mv[0]) + ' is ' + cv[0] + ' with atomic radius $' + qg(mv[3], 'pm') + '$. What is the volume of its unit cell, in cm³?', ans(acmv * acmv * acmv, 0.02),
        ['Edge: $' + cv[3] + ' = ' + qx(av, 'pm', 4) + ' = ' + qx(acmv, 'cm', 4) + '$ (1 pm $= 10^{-10}$ cm).', 'Volume: $a^3 = (' + fx(acmv, 4) + ')^3 = ' + qx(acmv * acmv * acmv, 'none') + '\\ \\text{cm}^3$.'], 'Find the edge from the radius, then cube it.', 'cm³', { k: 'volume', cell: mv[2], r: mv[3] }); }
    if (shape === 'cellmass') { var mm0 = R.pick(METALS), c0 = CELL[mm0[2]], ms0 = c0[1] * mm0[4] / NA;
      return P(cap(mm0[0]) + ' ($' + qm(mm0[4]) + '$) crystallizes in a ' + c0[0] + ' lattice. What is the mass, in grams, of the atoms inside one unit cell?', ans(ms0, 0.01),
        ['A ' + c0[0] + ' cell holds $' + c0[4] + '$ atoms.', 'One atom has mass $' + dfr(gd(mm0[4], 2), '6.022 \\times 10^{23}') + ' = ' + qx(mm0[4] / NA, 'g', 4) + '$.', 'Cell: $' + c0[1] + ' \\times ' + fx(mm0[4] / NA, 4) + ' = ' + qx(ms0, 'g') + '$.'],
        'Atoms per cell times the mass of one atom.', 'g', { k: 'cellmass', cell: mm0[2], M: mm0[4] }); }
    if (shape === 'count') { var c = R.pick(['sc', 'bcc', 'fcc', 'nacl']);
      if (c === 'nacl') return P('In the rock-salt (NaCl) unit cell, chloride ions sit at the 8 corners and 6 face centers, and sodium ions at the 12 edge centers and the body center. How many $\\mathrm{Na^+}$ ions does one cell contain?', exact(4),
        ['Edge sites are shared by 4 cells: $12 \\times \\tfrac{1}{4} = 3$.', 'The body center belongs to this cell: $+1$. Total: 4 sodium ions.', 'Chloride: $8 \\times \\tfrac{1}{8} + 6 \\times \\tfrac{1}{2} = 4$. Four of each: the 1 : 1 formula NaCl.'], 'Edge atoms count $\\tfrac{1}{4}$.', null, { k: 'count', ans: 4 }, { name: 'ch-crystal', opts: { mode: 'cell', cell: 'nacl', quiet: true } });
      return P('How many atoms does one ' + CELL[c][0] + ' unit cell contain?', exact(CELL[c][1]), ['Corner atoms are shared by 8 cells, face atoms by 2; a body-center atom belongs to one cell.', '$' + CELL[c][4] + '$.'],
        'Count fractions, not whole atoms.', null, { k: 'count', ans: CELL[c][1] }, { name: 'ch-crystal', opts: { mode: 'cell', cell: c, quiet: true, fractions: false } }); }
    var m = R.pick(METALS), cl = CELL[m[2]], a = cl[2] * m[3], acm = a * 1e-10, V = acm * acm * acm, mass = cl[1] * m[4] / NA, d = mass / V;
    if (shape === 'edge') return P(cap(m[0]) + ' crystallizes in a ' + cl[0] + ' lattice, and its atomic radius is $' + qg(m[3], 'pm') + '$. What is the edge length of its unit cell, in pm?', ans(a, 0.01),
      ['In ' + cl[0] + ', atoms touch along the ' + (m[2] === 'fcc' ? 'face diagonal: $\\sqrt{2}\\,a = 4r$' : 'body diagonal: $\\sqrt{3}\\,a = 4r$') + '.', '$' + cl[3] + ' = ' + dfr('4(' + m[3] + ')', m[2] === 'fcc' ? '1.414' : '1.732') + ' = ' + qx(a, 'pm', 4) + '$.'],
      'Find the line along which atoms touch.', 'pm', { k: 'edge', cell: m[2], r: m[3] });
    var st = ['Edge: $' + cl[3] + ' = ' + qx(a, 'pm', 4) + ' = ' + qx(acm, 'cm', 4) + '$; volume $a^3 = ' + qx(V, 'none', 4) + '\\ \\text{cm}^3$.', 'Mass in the cell: $' + dfr(cl[1] + ' \\times ' + gd(m[4], 2), '6.022 \\times 10^{23}') + ' = ' + qx(mass, 'g', 4) + '$.', 'Density: $' + dfr(fx(mass, 4), fx(V, 4)) + ' = ' + qx(d, 'gcm3') + '$.'];
    if (shape === 'density') return P(cap(m[0]) + ' (' + m[1] + ', $' + qm(m[4]) + '$) crystallizes in a ' + cl[0] + ' lattice with atomic radius $' + qg(m[3], 'pm') + '$. Calculate its density in g/cm³. Use a calculator.', ans(d, 0.02), st,
      'Atoms per cell × mass of one atom ÷ volume of the cell.', 'gcm3', { k: 'density', cell: m[2], r: m[3], M: m[4] });
    if (shape === 'radius') { var dg = sgf(d, 3), Vr = mass / dg, ar = M.pow(Vr, 1 / 3) * 1e10, rr = ar / cl[2];
      return P(cap(m[0]) + ' ($' + qm(m[4]) + '$) is ' + cl[0] + ' with a density of $' + qx(dg, 'gcm3') + '$. Find its atomic radius in pm. Use a calculator.', ans(rr, 0.02),
        ['Mass in one cell: $' + dfr(cl[1] + ' \\times ' + gd(m[4], 2), '6.022 \\times 10^{23}') + ' = ' + qx(mass, 'g', 4) + '$.', 'Volume: $a^3 = \\dfrac{\\text{mass}}{\\text{density}} = ' + qx(Vr, 'none', 4) + '\\ \\text{cm}^3$, so $a = ' + qx(ar * 1e-10, 'cm', 4) + ' = ' + qx(ar, 'pm', 4) + '$.', 'From $' + cl[3] + '$: $r = ' + (m[2] === 'fcc' ? '\\dfrac{\\sqrt{2}\\,a}{4}' : '\\dfrac{\\sqrt{3}\\,a}{4}') + ' = ' + qx(rr, 'pm') + '$.'],
        'Work backward: mass per cell, then volume, then edge, then radius.', 'pm', { k: 'radius', cell: m[2], d: dg, M: m[4] }); }
    // which structure fits the measured density?
    var dm = m[5], alt = m[2] === 'fcc' ? 'bcc' : 'fcc', ca = CELL[alt], aa = ca[2] * m[3] * 1e-10, dAlt = ca[1] * m[4] / NA / (aa * aa * aa);
    return P(cap(m[0]) + ' ($' + qm(m[4]) + '$, atomic radius $' + qg(m[3], 'pm') + '$) has a measured density of $' + qg(dm, 'gcm3') + '$. Is it face-centered cubic or body-centered cubic?', mcK(['face-centered cubic', 'body-centered cubic'], m[2] === 'fcc' ? 0 : 1),
      ['Face-centered: 4 atoms, $a = 4r/\\sqrt{2}$, density $' + qx(m[2] === 'fcc' ? d : dAlt, 'gcm3') + '$.', 'Body-centered: 2 atoms, $a = 4r/\\sqrt{3}$, density $' + qx(m[2] === 'bcc' ? d : dAlt, 'gcm3') + '$.', 'The measured $' + gx(dm) + '$ is close to the ' + cl[0] + ' value' + ' (the small difference comes from the radius being an average value).'],
      'Compute the density both ways and compare.', null, { k: 'which', cell: m[2] });
  });

  G('gchem1.separations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['rf', 'rf', 'which'], ['rf', 'dist', 'which', 'distill'], ['dist', 'which', 'distill', 'tf']));
    if (shape === 'rf') { var front = R.pick([6.0, 7.5, 8.0, 9.0, 10.0, 12.0]), spot = rd(front * R.int(15, 85) / 100, 1);
      return P('A solvent front travels $' + qd(front, 1, 'cm') + '$ up a chromatography plate, and a spot travels $' + qd(spot, 1, 'cm') + '$ from the starting line. What is its $R_f$?', ans(spot / front, 0.02),
        ['$R_f = \\dfrac{\\text{spot distance}}{\\text{solvent front distance}} = ' + dfr(gd(spot, 1), gd(front, 1)) + ' = ' + fx(spot / front, 2) + '$.', 'No units; always between 0 and 1.'], 'Divide the spot\'s distance by the solvent front\'s.', null, { k: 'rf', s: spot, f: front }); }
    if (shape === 'dist') { var rf = R.pick([0.20, 0.25, 0.35, 0.40, 0.55, 0.60, 0.75, 0.80]), fr0 = R.pick([5.0, 8.0, 10.0, 12.0, 15.0]);
      return P('A compound has $R_f = ' + gd(rf, 2) + '$ in a certain solvent. If the solvent front moves $' + qd(fr0, 1, 'cm') + '$, how far does the compound\'s spot move?', ans(rf * fr0, 0.02),
        ['$\\text{spot distance} = R_f \\times \\text{front distance} = ' + gd(rf, 2) + ' \\times ' + gd(fr0, 1) + ' = ' + qx(rf * fr0, 'cm', 2) + '$.'], '$R_f$ is the fraction of the front\'s distance the spot covers.', 'cm', { k: 'dist', rf: rf, f: fr0 }); }
    if (shape === 'which') { var setup = R.pick([['a polar silica plate developed with a nonpolar solvent (hexane)', 'nonpolar'], ['polar chromatography paper developed with a nonpolar solvent', 'nonpolar'], ['a nonpolar (C18-coated) plate developed with a polar solvent (water and methanol)', 'polar']]);
      var cmp = [['a nonpolar hydrocarbon', 'nonpolar'], ['a compound with two –OH groups', 'polar']], far = setup[1];
      return P('A mixture of ' + cmp[0][0] + ' and ' + cmp[1][0] + ' is separated on ' + setup[0] + '. Which travels farther (has the larger $R_f$)?', mcK([cap(cmp[0][0]), cap(cmp[1][0]), 'They travel the same distance'], far === 'nonpolar' ? 0 : 1),
        ['A component travels farther the less it is attracted to the stationary phase and the more it is attracted to the solvent.', far === 'nonpolar' ? 'The stationary phase is polar: the –OH compound hydrogen-bonds to it and lags; the hydrocarbon rides the nonpolar solvent.' : 'The stationary phase is nonpolar: the hydrocarbon clings to it by dispersion forces, while the polar compound moves with the polar solvent.'],
        'Like attracts like: which component matches the stationary phase?', null, { k: 'which', far: far }); }
    if (shape === 'distill') { var pairs = [['hexane', 69, 'octane', 126], ['ethanol', 78, 'water', 100], ['acetone', 56, 'water', 100], ['methanol', 65, 'ethanol', 78], ['pentane', 36, 'hexane', 69], ['dichloromethane', 40, 'chloroform', 61]], pp = R.pick(pairs), sw = R.coin(), names = sw ? [pp[2], pp[0]] : [pp[0], pp[2]];
      return P('A mixture of ' + names[0] + ' and ' + names[1] + ' is fractionally distilled. Which component is concentrated in the first liquid collected? (Normal boiling points: ' + pp[0] + ' $' + pp[1] + '^\\circ\\text{C}$, ' + pp[2] + ' $' + pp[3] + '^\\circ\\text{C}$.)', mcK([cap(names[0]), cap(names[1])], names[0] === pp[0] ? 0 : 1),
        ['The vapor above a boiling mixture is richer in the more volatile component, the one with the lower boiling point (weaker intermolecular forces).', 'So ' + pp[0] + ' comes over first.'], 'Lower boiling point, more volatile.', null, { k: 'distill' }); }
    var t = R.pick([['In chromatography, the spot that travels farthest is the heaviest component.', false, 'Distance depends on attraction to the stationary phase and the solvent, not on mass.'],
      ['A component strongly attracted to the stationary phase has a small $R_f$.', true, 'It spends more time stuck, so it moves little.'],
      ['$R_f$ can be greater than 1.', false, 'A spot can never move farther than the solvent that carries it.'],
      ['In fractional distillation, the first vapor is richer in the component with the lower boiling point.', true, 'That component escapes the liquid more easily.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Attraction, not mass, sorts the spots.', null, { k: 'tf' });
  });


  // ================================================================== UNIT 6: SOLUTIONS AND COLLIGATIVE PROPERTIES
  // ionic compounds: [formula, cation, cations per unit, anion, anions per unit]
  var SALTS = [['NaCl', 'Na+', 1, 'Cl-', 1], ['KNO3', 'K+', 1, 'NO3-', 1], ['CaCl2', 'Ca^2+', 1, 'Cl-', 2], ['Na2SO4', 'Na+', 2, 'SO4^2-', 1], ['MgCl2', 'Mg^2+', 1, 'Cl-', 2], ['K2CO3', 'K+', 2, 'CO3^2-', 1],
    ['NH4Cl', 'NH4+', 1, 'Cl-', 1], ['Al(NO3)3', 'Al^3+', 1, 'NO3-', 3], ['K3PO4', 'K+', 3, 'PO4^3-', 1], ['Al2(SO4)3', 'Al^3+', 2, 'SO4^2-', 3], ['Fe(NO3)3', 'Fe^3+', 1, 'NO3-', 3], ['(NH4)2SO4', 'NH4+', 2, 'SO4^2-', 1],
    ['AlCl3', 'Al^3+', 1, 'Cl-', 3], ['Na2CO3', 'Na+', 2, 'CO3^2-', 1], ['Ca(NO3)2', 'Ca^2+', 1, 'NO3-', 2], ['KBr', 'K+', 1, 'Br-', 1], ['Na3PO4', 'Na+', 3, 'PO4^3-', 1], ['BaCl2', 'Ba^2+', 1, 'Cl-', 2]];
  var STRONGX = [['HCl', 'a strong acid'], ['HNO3', 'a strong acid'], ['HBr', 'a strong acid'], ['NaOH', 'a strong base'], ['KOH', 'a strong base']];
  var WEAKX = [['CH3COOH', 'acetic acid, a weak acid'], ['HF', 'a weak acid'], ['NH3', 'ammonia, a weak base'], ['HCOOH', 'formic acid, a weak acid'], ['HNO2', 'nitrous acid, a weak acid']];
  var NONX = [['C12H22O11', 'sucrose (table sugar)'], ['C6H12O6', 'glucose'], ['C2H5OH', 'ethanol'], ['CH3OH', 'methanol'], ['CO(NH2)2', 'urea'], ['C3H8O3', 'glycerol']];
  function dissoc(s) { return ft(s[0]) + '(s) \\to ' + (s[2] > 1 ? s[2] + '\\,' : '') + ft(s[1]) + '(aq) + ' + (s[4] > 1 ? s[4] + '\\,' : '') + ft(s[3]) + '(aq)'; }

  G('gchem1.electrolytes', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['classify', 'classify', 'nions'], ['classify', 'nions', 'anion', 'conduct'], ['nions', 'anion', 'conduct', 'tf']));
    if (shape === 'classify') { var kind = R.pick(['strong', 'strong', 'weak', 'non']), item, why;
      if (kind === 'strong') { if (R.coin()) { var s = R.pick(SALTS); item = s[0]; why = 'a soluble ionic compound: it is all ions in water.'; } else { var sx = R.pick(STRONGX); item = sx[0]; why = sx[1] + ': it ionizes completely.'; } }
      else if (kind === 'weak') { var w = R.pick(WEAKX); item = w[0]; why = w[1] + ': only a small fraction ionizes.'; }
      else { var nx = R.pick(NONX); item = nx[0]; why = nx[1] + ', a molecular compound that is not an acid: it dissolves as whole molecules.'; }
      var names = { strong: 'strong electrolyte', weak: 'weak electrolyte', non: 'nonelectrolyte' };
      return P('In water, ' + F(item) + ' is a…', mcK(['strong electrolyte', 'weak electrolyte', 'nonelectrolyte'], ['strong', 'weak', 'non'].indexOf(kind)),
        [F(item) + ' is ' + why, 'So it is a ' + names[kind] + '.'], 'Ionic or molecular? If molecular, is it an acid or base, strong or weak?', null, { k: 'class', kind: kind }); }
    var sl = R.pick(SALTS), per = sl[2] + sl[4];
    if (shape === 'nions') { var n = R.pick([0.10, 0.20, 0.25, 0.50, 1.5, 2.0]);
      return P('How many moles of ions form when $' + qx(n, 'mol', 2) + '$ of ' + F(sl[0]) + ' dissolves completely in water?', ans(n * per, 0.01),
        ['$' + dissoc(sl) + '$: ' + per + ' ions per formula unit' + (/\(|SO4|PO4|CO3|NO3|NH4/.test(sl[0]) ? ' (polyatomic ions stay together)' : '') + '.', '$' + fx(n, 2) + ' \\times ' + per + ' = ' + qx(n * per, 'mol', 2) + '$ of ions.'],
        'Write the dissociation equation and count ions.', 'mol', { k: 'nions', f: sl[0], n: n }); }
    if (shape === 'anion') return P('Which anion is present when ' + F(sl[0]) + ' dissolves in water? (Write its formula with its charge, for example NO3-.)', fAns(sl[3]),
      ['$' + dissoc(sl) + '$.', 'The anion is $' + ft(sl[3]) + '$' + (sl[4] > 1 ? ', ' + sl[4] + ' of them per formula unit, each a separate ion' : '') + '.'], 'Split the formula into its cation and anion, keeping polyatomic ions whole.', null, { k: 'anion', f: sl[0] });
    if (shape === 'conduct') { var opts = [[sl[0], per], [R.pick(WEAKX)[0], 0.1], [R.pick(NONX)[0], 0]], M0 = R.pick([0.050, 0.10, 0.20]);
      return P('Which of these solutions, each $' + qx(M0, 'M', 2) + '$, conducts electricity best: ' + lst(opts.map(function (o) { return F(o[0]); })) + '?', mc(F(opts[0][0]), opts.slice(1).map(function (o) { return F(o[0]); })),
        [F(opts[0][0]) + ' is a strong electrolyte: ' + per + ' ions per formula unit, all dissolved as ions.', F(opts[1][0]) + ' is weak (few ions); ' + F(opts[2][0]) + ' makes none.', 'More ions, better conduction.'], 'Which one makes the most ions?', null, { k: 'cond' }); }
    var t = R.pick([['Every substance that dissolves well in water is a strong electrolyte.', false, 'Sugar and ethanol dissolve very well but make no ions: they are nonelectrolytes.'],
      ['When $\\mathrm{CaCl_2}$ dissolves, it forms $\\mathrm{Ca^{2+}}$ and $\\mathrm{Cl_2^{2-}}$ ions.', false, 'The subscript 2 means two separate $\\mathrm{Cl^-}$ ions: $\\mathrm{CaCl_2} \\to \\mathrm{Ca^{2+}} + 2\\,\\mathrm{Cl^-}$.'],
      ['When $\\mathrm{Na_2SO_4}$ dissolves, the sulfate ion stays together as $\\mathrm{SO_4^{2-}}$.', true, 'Polyatomic ions are held together by covalent bonds; water separates them from the $\\mathrm{Na^+}$ ions but does not break them apart.'],
      ['Acetic acid is a weak electrolyte: in water only a small fraction of its molecules ionize.', true, 'Its solution conducts, but much less than a strong acid at the same concentration.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Ionic compounds give ions; molecular compounds don\'t, unless they are acids or bases.', null, { k: 'tf' });
  });

  G('gchem1.ion-concentrations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['ion', 'ion', 'total'], ['ion', 'mass', 'mix', 'total'], ['mass', 'mix', 'reverse', 'mix']));
    var s = R.pick(SALTS), M0 = R.pick([0.050, 0.100, 0.150, 0.200, 0.250, 0.300, 0.400]), useAn = s[4] > 1 || (s[2] === 1 && R.coin()) ? true : false, ion = useAn ? s[3] : s[1], k = useAn ? s[4] : s[2];
    var st0 = '$' + dissoc(s) + '$.';
    if (shape === 'ion') return P('What is $[' + ft(ion) + ']$ in a $' + qx(M0, 'M') + '$ solution of ' + F(s[0]) + '?', ans(M0 * k, 0.01),
      [st0, 'Each formula unit gives ' + k + ' ' + F(ion) + ': $[' + ft(ion) + '] = ' + k + ' \\times ' + fx(M0) + ' = ' + qx(M0 * k, 'M') + '$.'], 'Multiply by the number of those ions per formula unit.', 'M', { k: 'ion', M: M0, n: k });
    if (shape === 'total') return P('What is the total concentration of ions in a $' + qx(M0, 'M') + '$ solution of ' + F(s[0]) + '?', ans(M0 * (s[2] + s[4]), 0.01),
      [st0, (s[2] + s[4]) + ' ions per formula unit: $' + (s[2] + s[4]) + ' \\times ' + fx(M0) + ' = ' + qx(M0 * (s[2] + s[4]), 'M') + '$.'], 'Count all the ions per formula unit.', 'M', { k: 'ion', M: M0, n: s[2] + s[4] });
    if (shape === 'mass') { var Ms = mm(s[0]), V = R.pick([100.0, 250.0, 500.0, 200.0]), g = sgf(M0 * V / 1000 * Ms, 3), mol = g / Ms, Mx = mol / (V / 1000);
      return P('$' + qx(g, 'g') + '$ of ' + F(s[0]) + ' ($' + qm(Ms) + '$) is dissolved in water to make $' + qd(V, 1, 'mL') + '$ of solution. What is $[' + ft(ion) + ']$?', ans(Mx * k, 0.01),
        ['Moles: $' + dfr(fx(g), mmx(Ms)) + ' = ' + qx(mol, 'mol') + '$; molarity $' + dfr(fx(mol), gd(V / 1000, 4)) + ' = ' + qx(Mx, 'M') + '$.', st0, '$[' + ft(ion) + '] = ' + k + ' \\times ' + fx(Mx) + ' = ' + qx(Mx * k, 'M') + '$.'],
        'Find the salt\'s molarity first.', 'M', { k: 'ionmass', g: g, M: Ms, V: V, n: k }); }
    if (shape === 'mix') { var shared = R.pick([['NaCl', 'CaCl2', 'Cl-', 1, 2], ['KNO3', 'Ca(NO3)2', 'NO3-', 1, 2], ['Na2SO4', 'NaCl', 'Na+', 2, 1], ['MgCl2', 'AlCl3', 'Cl-', 2, 3], ['K2CO3', 'KBr', 'K+', 2, 1]]);
      var V1 = R.pick([50.0, 100.0, 150.0, 200.0]), V2 = R.pick([25.0, 50.0, 100.0]), C1 = R.pick([0.100, 0.200, 0.300]), C2 = R.pick([0.100, 0.150, 0.250]), n1 = V1 / 1000 * C1 * shared[3], n2 = V2 / 1000 * C2 * shared[4], tot = n1 + n2, Vt = (V1 + V2) / 1000;
      return P('$' + qd(V1, 1, 'mL') + '$ of $' + qx(C1, 'M') + '$ ' + F(shared[0]) + ' is mixed with $' + qd(V2, 1, 'mL') + '$ of $' + qx(C2, 'M') + '$ ' + F(shared[1]) + '. What is $[' + ft(shared[2]) + ']$ in the mixture?', ans(tot / Vt, 0.01),
        ['Moles of ' + F(shared[2]) + ': from ' + F(shared[0]) + ', $' + gd(V1 / 1000, 4) + ' \\times ' + fx(C1) + (shared[3] > 1 ? ' \\times ' + shared[3] : '') + ' = ' + fx(n1) + '$; from ' + F(shared[1]) + ', $' + gd(V2 / 1000, 4) + ' \\times ' + fx(C2) + (shared[4] > 1 ? ' \\times ' + shared[4] : '') + ' = ' + fx(n2) + '$.', 'Total: $' + qx(tot, 'mol') + '$ in $' + gd(Vt, 4) + '\\ \\text{L}$.', '$[' + ft(shared[2]) + '] = ' + dfr(fx(tot), gd(Vt, 4)) + ' = ' + qx(tot / Vt, 'M') + '$.'],
        'Add moles of the ion, then divide by the total volume.', 'M', { k: 'mix', n1: n1, n2: n2, V: Vt }); }
    var ionC = M0 * k;
    return P('A solution of ' + F(s[0]) + ' has $[' + ft(ion) + '] = ' + qx(ionC, 'M') + '$. What is the molarity of ' + F(s[0]) + '?', ans(M0, 0.01),
      [st0, 'Each formula unit gives ' + k + ' ' + F(ion) + ', so the salt\'s molarity is $' + dfr(fx(ionC), k) + ' = ' + qx(M0, 'M') + '$.'], 'Divide by the number of those ions per formula unit.', 'M', { k: 'rev', c: ionC, n: k });
  });

  // enthalpies of solution at 25 °C, kJ/mol (CRC Handbook)
  var DHSOL = [['NH4NO3', 25.7], ['KNO3', 34.9], ['NaCl', 3.9], ['KCl', 17.2], ['NH4Cl', 14.8], ['NaOH', -44.5], ['CaCl2', -81.3], ['LiCl', -37.0], ['MgSO4', -91.2]];
  var LATT = [['NaCl', 787, 3.9], ['KCl', 715, 17.2], ['LiCl', 853, -37.0], ['NaF', 923, 0.9], ['KBr', 682, 19.9]];

  G('gchem1.dissolution-energy', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['steps', 'sign', 'steps'], ['steps', 'lattice', 'sign', 'tf'], ['lattice', 'dT', 'steps', 'tf']));
    if (shape === 'steps') { var d1 = R.int(3, 18) * 5, d2 = R.int(2, 10) * 5, d3 = -R.int(4, 30) * 5, tot = d1 + d2 + d3;
      if (tot === 0) d3 -= 5, tot -= 5;
      return P('For dissolving a solute, separating the solute particles takes $' + qg(d1, 'kJmol') + '$, separating the solvent molecules takes $' + qg(d2, 'kJmol') + '$, and the attractions that form between solute and solvent release $' + qg(-d3, 'kJmol') + '$. Find $\\Delta H_\\text{soln}$ (with its sign).', exact(tot),
        ['Energy taken in counts positive; energy released counts negative: $\\Delta H_\\text{soln} = (+' + d1 + ') + (+' + d2 + ') + (' + d3 + ')$.', '$\\Delta H_\\text{soln} = ' + sg(tot) + '\\ \\text{kJ/mol}$: ' + (tot > 0 ? 'endothermic; the solution cools.' : 'exothermic; the solution warms.')],
        'Add the three steps with their signs.', 'kJmol', { k: 'steps', ans: tot }, { name: 'ch-energydiagram', opts: { mode: 'dissolve', dH: [d1, d2, d3], quiet: true, edit: false } }); }
    if (shape === 'lattice') { var L = R.pick(LATT), hyd = rd(L[2] - L[1], 1);
      return P('The lattice energy of ' + F(L[0]) + ' is $' + qg(L[1], 'kJmol') + '$ (energy needed to separate the solid into gaseous ions), and hydrating those gaseous ions releases $' + qg(-hyd, 'kJmol') + '$. Find $\\Delta H_\\text{soln}$.', { t: 'num', v: plainNum(L[2]), tol: 0.15 },
        ['Step 1, break the lattice: $+' + gx(L[1]) + '$. Hydration (steps 2 and 3 together): $' + gx(hyd) + '$.', '$\\Delta H_\\text{soln} = ' + gx(L[1]) + ' + (' + gx(hyd) + ') = ' + sg(L[2]) + '\\ \\text{kJ/mol}$, a small difference between two large numbers.'],
        'Lattice energy in, hydration energy out.', 'kJmol', { k: 'latt', L: L[1], h: hyd }); }
    if (shape === 'sign') { var d = R.pick(DHSOL);
      return P('$\\Delta H_\\text{soln}$ of ' + F(d[0]) + ' is $' + sg(d[1]) + '\\ \\text{kJ/mol}$. When it dissolves in water in an insulated cup, what happens to the temperature?', mc(d[1] > 0 ? 'It falls.' : 'It rises.', [d[1] > 0 ? 'It rises.' : 'It falls.', 'It stays the same.']),
        [d[1] > 0 ? 'Positive: dissolving absorbs energy. It takes that energy from the water, which cools.' : 'Negative: dissolving releases energy into the water, which warms.'], 'Where does the energy go, or come from?', null, { k: 'sign' }); }
    if (shape === 'dT') { var d2x = R.pick(DHSOL.filter(function (x) { return M.abs(x[1]) > 10; })), Mx = mm(d2x[0]), g = R.pick([2.00, 5.00, 8.00, 10.0]), w = R.pick([50.0, 100.0, 150.0]), n = g / Mx, q = -n * d2x[1] * 1000, dT = q / ((w + g) * 4.18);
      return P('$' + qx(g, 'g') + '$ of ' + F(d2x[0]) + ' ($' + qm(Mx) + '$, $\\Delta H_\\text{soln} = ' + sg(d2x[1]) + '\\ \\text{kJ/mol}$) dissolves in $' + qx(w, 'g') + '$ of water in an insulated cup. Find the temperature change of the solution, with its sign. Take the solution\'s specific heat as $4.18\\ \\text{J/(g·°C)}$ and its mass as water plus salt.', ans(dT, 0.02),
        ['Moles: $' + dfr(fx(g), mmx(Mx)) + ' = ' + qx(n, 'mol') + '$.', 'Heat released to the solution: $q = -n\\Delta H_\\text{soln} = -(' + fx(n) + ')(' + sg(d2x[1] * 1000) + '\\ \\text{J/mol}) = ' + qx(q, 'J') + '$.', '$\\Delta T = \\dfrac{q}{mc} = ' + dfr(fx(q), '(' + gx(rd(w + g, 2)) + ')(4.18)') + ' = ' + qx(dT, 'C') + '$ (' + (dT > 0 ? 'it warms' : 'it cools') + ').'],
        'Heat to the solution is $-n\\Delta H$; then $q = mc\\Delta T$.', 'C', { k: 'dT', n: n, dH: d2x[1], m: w + g }); }
    var t = R.pick([['Dissolving a solid in water always absorbs heat.', false, 'Some solids release heat as they dissolve: $\\mathrm{CaCl_2}$ ($-81.3$ kJ/mol) and $\\mathrm{NaOH}$ ($-44.5$) warm the water.'],
      ['A solid can dissolve only if dissolving releases heat.', false, '$\\mathrm{NH_4NO_3}$ dissolves readily while absorbing heat ($+25.7$ kJ/mol); spreading the particles out also drives dissolving.'],
      ['Separating the ions of a crystal takes energy in.', true, 'Pulling apart particles that attract each other always costs energy.'],
      ['The attraction between ions and water molecules releases energy.', true, 'Forming attractions releases energy: this is the hydration energy.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Separating costs energy; attracting releases it.', null, { k: 'tf' });
  });

  // Henry's law constants at 25 °C, mol/(L·atm) (Sander 2015, as in the visual kit)
  var KHD = [['O2', 1.3e-3, 32.00], ['N2', 6.4e-4, 28.02], ['CO2', 3.3e-2, 44.01]];

  G('gchem1.gas-solubility', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['C', 'C', 'temp'], ['C', 'ratio', 'mg', 'temp'], ['mg', 'ratio', 'P', 'tf']));
    var g = R.pick(KHD), P0 = g[0] === 'CO2' ? R.pick([1.0, 2.0, 2.5, 3.0, 4.0]) : R.pick([0.21, 0.50, 0.78, 1.00, 2.00, 3.00]);
    if (g[0] === 'N2' && P0 === 0.21) P0 = 0.78;
    var C = g[1] * P0;
    if (shape === 'C') return P('Henry\'s law constant for ' + F(g[0]) + ' in water at $25^\\circ\\text{C}$ is $' + qg(g[1], 'Matm') + '$. What concentration of ' + F(g[0]) + ' dissolves when its partial pressure above the water is $' + qx(P0, 'atm') + '$?', ans(C, 0.01),
      ['$C = k_\\text{H}P = (' + gx(g[1]) + ')(' + fx(P0) + ') = ' + qx(C, 'M') + '$.'].concat([P0 < 1 ? 'Only the gas\'s own partial pressure counts.' : 'More pressure pushes more gas into solution.']), '$C = k_\\text{H}P$.', 'M', { k: 'C', kH: g[1], P: P0 });
    if (shape === 'mg') return P('Using $k_\\text{H} = ' + qg(g[1], 'Matm') + '$ for ' + F(g[0]) + ' at $25^\\circ\\text{C}$, how many milligrams of ' + F(g[0]) + ' ($' + qm(g[2]) + '$) dissolve in $1.00\\ \\text{L}$ of water when its partial pressure is $' + qx(P0, 'atm') + '$?', ans(C * g[2] * 1000, 0.02),
      ['$C = k_\\text{H}P = (' + gx(g[1]) + ')(' + fx(P0) + ') = ' + qx(C, 'M') + '$.', 'Mass in 1.00 L: $' + fx(C) + ' \\times ' + gd(g[2], 2) + ' = ' + qx(C * g[2], 'g') + ' = ' + qx(C * g[2] * 1000, 'mg') + '$.'], 'Find mol/L first, then change to mg.', 'mg', { k: 'mg', kH: g[1], P: P0, M: g[2] });
    if (shape === 'ratio') { var C1 = sgf(C, 2), P2 = rd(P0 * R.pick([0.5, 1.5, 2, 3, 0.25, 4, 2.5, 0.75, 5]), 3), C2 = C1 * P2 / P0;
      return P('At a certain temperature, $' + qx(C1, 'M', 2) + '$ of a gas dissolves in water when its pressure is $' + qx(P0, 'atm') + '$. What concentration dissolves at the same temperature when its pressure is $' + qx(P2, 'atm') + '$?', ans(C2, 0.01),
        ['Henry\'s law: $C$ is proportional to $P$, so $C_2 = C_1 \\times \\dfrac{P_2}{P_1}$.', '$C_2 = ' + fx(C1, 2) + ' \\times ' + dfr(fx(P2), fx(P0)) + ' = ' + qx(C2, 'M') + '$.'], 'Concentration scales with pressure.', 'M', { k: 'ratio', C1: C1, P1: P0, P2: P2 }); }
    if (shape === 'P') { var Ct = sgf(g[1] * R.pick([0.5, 1, 2, 3, 1.5, 2.5, 4, 0.25, 5]), 2), Pn = Ct / g[1];
      return P('What partial pressure of ' + F(g[0]) + ' is needed to dissolve $' + qx(Ct, 'M', 2) + '$ of it in water at $25^\\circ\\text{C}$? ($k_\\text{H} = ' + qg(g[1], 'Matm') + '$)', ans(Pn, 0.01),
        ['$P = \\dfrac{C}{k_\\text{H}} = ' + dfr(fx(Ct, 2), gx(g[1])) + ' = ' + qx(Pn, 'atm') + '$.'], 'Solve $C = k_\\text{H}P$ for $P$.', 'atm', { k: 'P', kH: g[1], C: Ct }); }
    if (shape === 'temp') { var tq = R.pick([['A bottle of soda is warmed from $5^\\circ\\text{C}$ to $30^\\circ\\text{C}$ (still sealed). What happens to the amount of $\\mathrm{CO_2}$ the liquid can hold?', 'It decreases.'], ['Water in a pond warms in summer. What happens to the amount of dissolved oxygen it can hold?', 'It decreases.'], ['Water from a warm tap is cooled in a refrigerator. What happens to the amount of air it can hold dissolved?', 'It increases.']]);
      return P(tq[0], mc(tq[1], ['It increases.', 'It decreases.', 'It stays the same.'].filter(function (x) { return x !== tq[1]; })),
        ['Gases dissolve less in warmer water: their dissolved molecules have more energy to escape, and dissolving a gas releases heat, so warming favors the gas.', tq[1]], 'Do gases follow the solid-solubility rule?', null, { k: 'temp' }); }
    var t = R.pick([['Like most solids, gases dissolve better in hot water than in cold water.', false, 'Gases dissolve less as water warms; that is why warm soda goes flat faster.'],
      ['Doubling the partial pressure of a gas above water doubles the amount that dissolves (at constant temperature).', true, 'Henry\'s law: $C = k_\\text{H}P$, a direct proportion.'],
      ['Opening a soda lowers the pressure of $\\mathrm{CO_2}$ above it, so dissolved $\\mathrm{CO_2}$ comes out as bubbles.', true, 'The equilibrium amount drops with the pressure, and the extra gas leaves.'],
      ['Henry\'s law uses the total pressure of the air, not the partial pressure of the gas.', false, 'Each gas dissolves according to its own partial pressure.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Pressure up, more gas; temperature up, less gas.', null, { k: 'tf' });
  });

  var SOLUTES = [['NaCl', 'sodium chloride'], ['KCl', 'potassium chloride'], ['C6H12O6', 'glucose'], ['C12H22O11', 'sucrose'], ['CO(NH2)2', 'urea'], ['C2H6O2', 'ethylene glycol'], ['CaCl2', 'calcium chloride'], ['KNO3', 'potassium nitrate']];

  G('gchem1.concentration-units', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['molality', 'pct', 'molality'], ['molality', 'chi', 'massfor', 'ppm'], ['chi', 'massfor', 'molality', 'ppm', 'pct']));
    var so = R.pick(SOLUTES), Ms = mm(so[0]), g = R.pick([5.00, 10.0, 12.5, 20.0, 25.0, 30.0]), w = R.pick([100.0, 150.0, 200.0, 250.0, 500.0]);
    if (shape === 'molality') { var n = g / Ms;
      return P('$' + qx(g, 'g') + '$ of ' + so[1] + ' (' + F(so[0]) + ', $' + qm(Ms) + '$) is dissolved in $' + qd(w, 1, 'g') + '$ of water. What is the molality?', ans(n / (w / 1000), 0.01),
        ['Moles of solute: $' + dfr(fx(g), mmx(Ms)) + ' = ' + qx(n, 'mol', 4) + '$.', 'Mass of solvent (water only): $' + gd(w / 1000, 4) + '\\ \\text{kg}$.', '$m = ' + dfr(fx(n, 4), gd(w / 1000, 4)) + ' = ' + qx(n / (w / 1000), 'molkg') + '$.'],
        'Moles of solute per kilogram of solvent.', 'molkg', { k: 'molal', g: g, M: Ms, w: w }); }
    if (shape === 'massfor') { var mt = R.pick([0.100, 0.250, 0.500, 0.750, 1.20]), gneed = mt * (w / 1000) * Ms;
      return P('How many grams of ' + so[1] + ' (' + F(so[0]) + ', $' + qm(Ms) + '$) must be dissolved in $' + qd(w, 1, 'g') + '$ of water to make a $' + qx(mt, 'molkg') + '$ solution?', ans(gneed, 0.01),
        ['Moles needed: $' + fx(mt) + '\\ \\text{mol/kg} \\times ' + gd(w / 1000, 4) + '\\ \\text{kg} = ' + qx(mt * w / 1000, 'mol') + '$.', 'Mass: $' + fx(mt * w / 1000) + ' \\times ' + mmx(Ms) + ' = ' + qx(gneed, 'g') + '$.'],
        'Molality times kilograms of water gives moles.', 'g', { k: 'massfor', m: mt, w: w, M: Ms }); }
    if (shape === 'chi') { var ns = g / Ms, nw = w / 18.02, chi = ns / (ns + nw), askW = R.coin();
      return P('A solution contains $' + qx(g, 'g') + '$ of ' + so[1] + ' (' + F(so[0]) + ', $' + qm(Ms) + '$) in $' + qd(w, 1, 'g') + '$ of water ($18.02\\ \\text{g/mol}$). What is the mole fraction of ' + (askW ? 'water' : so[1]) + '? (Count formula units; ignore any splitting into ions.)', ans(askW ? 1 - chi : chi, 0.01, 4),
        ['Moles: ' + so[1] + ' $' + fx(ns, 4) + '$; water $' + dfr(gd(w, 1), '18.02') + ' = ' + fx(nw, 4) + '$.', '$\\chi_\\text{' + (askW ? 'water' : 'solute') + '} = ' + dfr(fx(askW ? nw : ns, 4), fx(ns, 4) + ' + ' + fx(nw, 4)) + ' = ' + fx(askW ? 1 - chi : chi, 4) + '$.'],
        'Moles of one part over total moles.', null, { k: 'chi', g: g, M: Ms, w: w, water: askW }); }
    if (shape === 'pct') return P('$' + qx(g, 'g') + '$ of ' + so[1] + ' is dissolved in $' + qd(w, 1, 'g') + '$ of water. What is the mass percent of ' + so[1] + '?', pctAns(100 * g / (g + w), 0.01),
      ['Mass of solution: $' + fx(g) + ' + ' + gd(w, 1) + ' = ' + gx(rd(g + w, 2)) + '\\ \\text{g}$.', 'Mass percent: $' + dfr(fx(g), gx(rd(g + w, 2))) + ' \\times 100 = ' + fx(100 * g / (g + w), 3) + '\\%$.'],
      'Divide by the mass of the whole solution, solute included.', null, { k: 'pct', g: g, w: w });
    var mgx = R.pick([0.5, 1.2, 2.4, 3.0, 4.5, 12]), ws = R.pick([250.0, 500.0, 1000, 2000]), ion = R.pick(['iron', 'fluoride', 'calcium', 'nitrate', 'magnesium']);
    return P('A $' + fx(ws, 4) + '\\ \\text{g}$ water sample contains $' + fx(mgx, 2) + '\\ \\text{mg}$ of dissolved ' + ion + '. What is the ' + ion + ' concentration in parts per million?', ans(mgx * 1e-3 / ws * 1e6, 0.01),
      ['Same units on top and bottom: $' + gx(mgx) + '\\ \\text{mg} = ' + gx(mgx * 1e-3) + '\\ \\text{g}$.', 'ppm $= ' + dfr(gx(mgx * 1e-3), gx(ws)) + ' \\times 10^{6} = ' + qx(mgx * 1e-3 / ws * 1e6, 'ppm') + '$.'], 'Grams of solute per gram of solution, times a million.', 'ppm', { k: 'ppm', mg: mgx, w: ws });
  });

  // solutions with mass percent and density (g/mL, approximate CRC values at 20 °C)
  var SOLD = [['HCl', 'hydrochloric acid', 37.0, 1.18], ['HCl', 'hydrochloric acid', 10.0, 1.048], ['HCl', 'hydrochloric acid', 20.0, 1.098], ['HNO3', 'nitric acid', 70.0, 1.42], ['HNO3', 'nitric acid', 20.0, 1.115],
    ['H2SO4', 'sulfuric acid', 96.0, 1.84], ['H2SO4', 'sulfuric acid', 20.0, 1.139], ['H2SO4', 'sulfuric acid', 50.0, 1.395], ['NaOH', 'sodium hydroxide', 10.0, 1.109], ['NaOH', 'sodium hydroxide', 5.00, 1.054], ['NaOH', 'sodium hydroxide', 20.0, 1.219],
    ['NaCl', 'sodium chloride', 10.0, 1.071], ['NaCl', 'sodium chloride', 5.00, 1.034], ['NaCl', 'sodium chloride', 20.0, 1.148], ['C12H22O11', 'sucrose', 20.0, 1.081], ['C12H22O11', 'sucrose', 40.0, 1.176], ['C12H22O11', 'sucrose', 10.0, 1.038],
    ['KCl', 'potassium chloride', 10.0, 1.063], ['NH3', 'ammonia', 28.0, 0.898], ['NH3', 'ammonia', 10.0, 0.958], ['C6H12O6', 'glucose', 10.0, 1.038],
    ['C2H5OH', 'ethanol', 10.0, 0.982], ['KNO3', 'potassium nitrate', 10.0, 1.063], ['CaCl2', 'calcium chloride', 10.0, 1.084], ['MgSO4', 'magnesium sulfate', 10.0, 1.103]];

  G('gchem1.converting-concentrations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['pctToMolal', 'pctToM'], ['pctToM', 'pctToMolal', 'MtoMolal'], ['MtoMolal', 'molalToPct', 'pctToM', 'molalToM']));
    var s = R.pick(shape === 'pctToM' || shape === 'MtoMolal' ? SOLD : SOLD.filter(function (x) { return x[2] <= 50; })), Ms = mm(s[0]), w = s[2] / 100, d = s[3], intro = 'A ' + s[1] + ' solution';
    if (shape === 'pctToMolal' && R.chance(0.6)) { s = [s[0], s[1], R.int(2, 40)]; w = s[2] / 100; } // molality needs no density, so any percent works
    if (shape === 'pctToM') { var mSol = 1000 * d, mSo = w * mSol, n = mSo / Ms;
      return P(intro + ' is ' + fx(s[2], 3) + '% ' + F(s[0]) + ' by mass and has a density of $' + qg(d, 'gmL') + '$. Find its molarity (' + F(s[0]) + ' $' + qm(Ms) + '$).', ans(n, 0.01),
        ['Take $1.000\\ \\text{L}$: mass $= 1000\\ \\text{mL} \\times ' + gx(d) + '\\ \\text{g/mL} = ' + qx(mSol, 'g', 4) + '$ of solution.', 'Solute: $' + fx(w, 3) + ' \\times ' + fx(mSol, 4) + ' = ' + qx(mSo, 'g', 4) + '$, which is $' + dfr(fx(mSo, 4), mmx(Ms)) + ' = ' + qx(n, 'mol') + '$.', 'Molarity: $' + qx(n, 'M') + '$.'],
        'Imagine exactly 1 L of the solution.', 'M', { k: 'pctToM', w: w, d: d, M: Ms }); }
    if (shape === 'pctToMolal') { var n2 = s[2] / Ms, kg = (100 - s[2]) / 1000;
      return P(intro + ' is ' + fx(s[2], 3) + '% ' + F(s[0]) + ' by mass. Find its molality (' + F(s[0]) + ' $' + qm(Ms) + '$).', ans(n2 / kg, 0.01),
        ['Take $100.0\\ \\text{g}$ of solution: $' + fx(s[2], 3) + '\\ \\text{g}$ of solute and $' + fx(100 - s[2], 3) + '\\ \\text{g}$ of water.', 'Solute: $' + dfr(fx(s[2], 3), mmx(Ms)) + ' = ' + qx(n2, 'mol', 4) + '$.', 'Molality: $' + dfr(fx(n2, 4), fx(kg, 3) + '\\ \\text{kg}') + ' = ' + qx(n2 / kg, 'molkg') + '$.'],
        'Imagine 100 g of solution and split it into solute and water.', 'molkg', { k: 'pctToMolal', w: w, M: Ms }); }
    // a molarity that matches the listed solution, rounded
    var Mm = sgf(1000 * d * w / Ms, 3);
    if (shape === 'MtoMolal') { var mS = 1000 * d, mSo2 = Mm * Ms, water = mS - mSo2, mo = Mm / (water / 1000);
      return P(intro + ' is $' + qx(Mm, 'M') + '$ in ' + F(s[0]) + ' and has a density of $' + qg(d, 'gmL') + '$. Find its molality (' + F(s[0]) + ' $' + qm(Ms) + '$).', ans(mo, 0.02),
        ['Take $1.000\\ \\text{L}$: $' + qx(mS, 'g', 4) + '$ of solution, holding $' + fx(Mm) + '\\ \\text{mol} \\times ' + mmx(Ms) + ' = ' + qx(mSo2, 'g', 4) + '$ of solute.', 'Water: $' + fx(mS, 4) + ' - ' + fx(mSo2, 4) + ' = ' + qx(water, 'g', 4) + ' = ' + qx(water / 1000, 'kg', 4) + '$.', 'Molality: $' + dfr(fx(Mm), fx(water / 1000, 4)) + ' = ' + qx(mo, 'molkg') + '$.'],
        'Subtract the solute\'s mass to get the solvent\'s.', 'molkg', { k: 'MtoMolal', M: Mm, d: d, Ms: Ms }); }
    var mo2 = sgf(w / Ms / ((1 - w) / 1000), 3);
    if (shape === 'molalToPct') { var gSo = mo2 * Ms, pct = 100 * gSo / (gSo + 1000);
      return P(intro + ' is $' + qx(mo2, 'molkg') + '$ in ' + F(s[0]) + ' ($' + qm(Ms) + '$). What is its mass percent of solute?', pctAns(pct, 0.01),
        ['Take $1.000\\ \\text{kg}$ of water: it holds $' + fx(mo2) + '\\ \\text{mol} \\times ' + mmx(Ms) + ' = ' + qx(gSo, 'g', 4) + '$ of solute.', 'Mass percent: $' + dfr(fx(gSo, 4), fx(gSo, 4) + ' + 1000') + ' \\times 100 = ' + fx(pct, 3) + '\\%$.'],
        'Imagine 1 kg of water.', null, { k: 'molalToPct', m: mo2, Ms: Ms }); }
    var gSo3 = mo2 * Ms, mSol3 = 1000 + gSo3, VL = mSol3 / d / 1000, MM3 = mo2 / VL;
    return P(intro + ' is $' + qx(mo2, 'molkg') + '$ in ' + F(s[0]) + ' ($' + qm(Ms) + '$) and has a density of $' + qg(d, 'gmL') + '$. Find its molarity.', ans(MM3, 0.02),
      ['Take $1.000\\ \\text{kg}$ of water with $' + fx(mo2) + '\\ \\text{mol}$ of solute ($' + qx(gSo3, 'g', 4) + '$): solution mass $' + qx(mSol3, 'g', 4) + '$.', 'Volume: $' + dfr(fx(mSol3, 4) + '\\ \\text{g}', gx(d) + '\\ \\text{g/mL}') + ' = ' + qx(VL * 1000, 'mL', 4) + ' = ' + qx(VL, 'L', 4) + '$.', 'Molarity: $' + dfr(fx(mo2), fx(VL, 4)) + ' = ' + qx(MM3, 'M') + '$.'],
      'Imagine 1 kg of water; use the density to get the volume.', 'M', { k: 'molalToM', m: mo2, d: d, Ms: Ms });
  });

  G('gchem1.beer-lambert', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['A', 'c', 'T2A'], ['c', 'cal', 'T2A', 'A'], ['cal', 'A2T', 'c', 'mc']));
    var eps = R.pick([1.5e3, 2.0e3, 4.5e3, 5.0e3, 8.0e3, 1.2e4, 2.5e4]), b = R.pick([1.00, 1.00, 0.500, 2.00]), A0 = R.pick([0.15, 0.24, 0.36, 0.45, 0.60, 0.72, 0.85]), c0 = sgf(A0 / (eps * b), 2);
    if (shape === 'A') { var A = eps * b * c0;
      return P('A dye has $\\varepsilon = ' + qg(eps, 'none') + '\\ \\text{L/(mol·cm)}$ at its $\\lambda_\\text{max}$. What is the absorbance of a $' + qx(c0, 'M', 2) + '$ solution in a $' + qd(b, 2, 'cm') + '$ cell?', ans(A, 0.01),
        ['$A = \\varepsilon bc = (' + gx(eps) + ')(' + gd(b, 2) + ')(' + fx(c0, 2) + ')$.', '$A = ' + fx(A, 3) + '$ (absorbance has no units).'], 'Multiply ε, path length and concentration.', null, { k: 'A', e: eps, b: b, c: c0 }); }
    if (shape === 'c') { var Ag = rd(A0, 3);
      return P('A solution in a $' + qd(b, 2, 'cm') + '$ cell has an absorbance of $' + gd(Ag, 3) + '$ at a wavelength where $\\varepsilon = ' + qg(eps, 'none') + '\\ \\text{L/(mol·cm)}$. Find its concentration.', ans(Ag / (eps * b), 0.01),
        ['$c = \\dfrac{A}{\\varepsilon b} = ' + dfr(gd(Ag, 3), '(' + gx(eps) + ')(' + gd(b, 2) + ')') + ' = ' + qx(Ag / (eps * b), 'M') + '$.'], 'Solve $A = \\varepsilon bc$ for $c$.', 'M', { k: 'c', A: Ag, e: eps, b: b }); }
    if (shape === 'cal') { var slope = R.pick([1.25e3, 2.50e3, 4.00e3, 5.00e3]), stds = [1, 2, 3, 4].map(function (k) { return [sgf(k * 0.5e-4 * 2500 / slope * 2, 2), 0]; });
      var cs = [1, 2, 3, 4].map(function (k) { return sgf(k * 0.15 / slope, 2); }), As = cs.map(function (c) { return rd(slope * c, 3); }), Au = rd(R.pick([0.20, 0.33, 0.41, 0.52]), 3);
      return P('Standards measured in a 1.00 cm cell give these absorbances: ' + cs.map(function (c, i) { return '$' + fx(c, 2) + '\\ \\text{M}$: ' + gd(As[i], 3); }).join('; ') + '. The points lie on a line through the origin. An unknown gives $A = ' + gd(Au, 3) + '$. What is its concentration?', ans(Au / slope, 0.02),
        ['Slope of the line: $' + dfr(gd(As[3], 3), fx(cs[3], 2)) + ' = ' + qx(slope, 'none') + '\\ \\text{L/mol}$ (the same from any standard).', '$c = \\dfrac{A}{\\text{slope}} = ' + dfr(gd(Au, 3), fx(slope)) + ' = ' + qx(Au / slope, 'M') + '$, inside the range of the standards.'],
        'Find the slope A/c from the standards, then divide.', 'M', { k: 'cal', slope: slope, A: Au }); }
    if (shape === 'T2A') { var Tp = R.pick([10.0, 20.0, 25.0, 40.0, 50.0, 63.0, 80.0, 1.00]);
      return P('A sample transmits $' + fx(Tp, 3) + '\\%$ of the light that enters it. What is its absorbance?', ans(-M.log10(Tp / 100), 0.01),
        ['$T = ' + fx(Tp / 100, 3) + '$.', '$A = -\\log_{10} T = -\\log_{10}(' + fx(Tp / 100, 3) + ') = ' + fx(-M.log10(Tp / 100), 3) + '$.'], '$A = -\\log_{10}(T)$ with $T$ as a fraction.', null, { k: 'T2A', T: Tp / 100 }); }
    if (shape === 'A2T') { var Ax = R.pick([0.100, 0.301, 0.500, 0.699, 1.00, 1.50, 2.00]);
      return P('A solution has an absorbance of $' + gd(Ax, Ax >= 1 ? 2 : 3) + '$. What percent of the light does it transmit?', pctAns(100 * M.pow(10, -Ax), 0.02),
        ['$T = 10^{-A} = 10^{-' + gx(Ax) + '} = ' + fx(M.pow(10, -Ax), 3) + '$.', 'That is $' + fx(100 * M.pow(10, -Ax), 3) + '\\%$.'], 'Undo the logarithm: $T = 10^{-A}$.', null, { k: 'A2T', A: Ax }); }
    var mq = R.pick([['A solution\'s concentration is doubled (same cell, same wavelength). What happens to its absorbance?', 'It doubles.', ['It halves.', 'It stays the same.', 'It increases by 0.301 no matter what it was.']],
      ['The same solution is moved from a 1.00 cm cell to a 2.00 cm cell. What happens to its absorbance?', 'It doubles.', ['It halves.', 'It stays the same.', 'It drops to zero.']],
      ['A solution looks blue because it…', 'absorbs orange light and transmits the rest.', ['absorbs blue light.', 'gives off blue light.', 'absorbs every color equally.']],
      ['Why are absorbance measurements made at the wavelength of maximum absorption?', 'The absorbance changes most with concentration there, so readings are most sensitive.', ['Only at that wavelength does the Beer–Lambert law hold at all.', 'The solution transmits the most light there.', 'The molar absorptivity is zero there.']]]);
    return P(mq[0], mc(mq[1], mq[2]), ['$A = \\varepsilon bc$: absorbance is proportional to concentration and to path length, and ε depends on the wavelength.', mq[1]], 'Think of $A = \\varepsilon bc$.', null, { k: 'mc' });
  });

  // pure-solvent vapor pressures (mmHg): water at 20, 25, 30 °C; benzene at 25 °C (CRC)
  var VP0 = [['water', 20, 17.5, 18.02], ['water', 25, 23.8, 18.02], ['water', 30, 31.8, 18.02], ['benzene', 25, 95.1, 78.12]];
  var NVOL = [['C6H12O6', 'glucose', 1], ['C12H22O11', 'sucrose', 1], ['CO(NH2)2', 'urea', 1], ['C3H8O3', 'glycerol', 1], ['NaCl', 'sodium chloride', 2], ['CaCl2', 'calcium chloride', 3]];

  G('gchem1.raoults-law', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['moles', 'moles', 'dP'], ['moles', 'mass', 'dP', 'ionic'], ['mass', 'ionic', 'chi', 'dP']));
    var v = R.pick(VP0.slice(0, 3));
    if (shape === 'moles' || shape === 'dP') { var ns = R.pick([0.50, 1.00, 1.50, 2.00]), nw = R.pick([8.00, 10.0, 12.0, 15.0, 20.0, 25.0]), xw = nw / (nw + ns), Pn = xw * v[2];
      var q = 'A solution contains $' + qx(ns, 'mol') + '$ of glucose (nonvolatile) in $' + qx(nw, 'mol') + '$ of water at $' + v[1] + '^\\circ\\text{C}$, where pure water\'s vapor pressure is $' + qg(v[2], 'mmHg') + '$. ';
      if (shape === 'dP') return P(q + 'By how much is the vapor pressure lowered?', ans(v[2] - Pn, 0.01),
        ['$\\chi_\\text{glucose} = ' + dfr(fx(ns), fx(ns) + ' + ' + fx(nw)) + ' = ' + fx(1 - xw, 4) + '$.', '$\\Delta P = \\chi_\\text{solute}P^\\circ = ' + fx(1 - xw, 4) + ' \\times ' + gx(v[2]) + ' = ' + qx(v[2] - Pn, 'mmHg') + '$.'], 'The lowering uses the solute\'s mole fraction.', 'mmHg', { k: 'dP', ns: ns, nw: nw, P0: v[2] });
      return P(q + 'What is the vapor pressure of the solution?', ans(Pn, 0.01),
        ['$\\chi_\\text{water} = ' + dfr(fx(nw), fx(nw) + ' + ' + fx(ns)) + ' = ' + fx(xw, 4) + '$.', '$P = \\chi_\\text{water}P^\\circ = ' + fx(xw, 4) + ' \\times ' + gx(v[2]) + ' = ' + qx(Pn, 'mmHg') + '$, a little below the pure water\'s.'], 'Use the solvent\'s mole fraction.', 'mmHg', { k: 'P', ns: ns, nw: nw, P0: v[2] }); }
    if (shape === 'mass' || shape === 'ionic') { var so = shape === 'ionic' ? R.pick(NVOL.slice(4)) : R.pick(NVOL.slice(0, 4)), Ms = mm(so[0]), g = R.pick([20.0, 25.0, 40.0, 50.0, 75.0]), w = R.pick([100.0, 150.0, 200.0, 250.0]), n = g / Ms, npart = n * so[2], nw2 = w / 18.02, x2 = nw2 / (nw2 + npart), P2 = x2 * v[2];
      return P('$' + qx(g, 'g') + '$ of ' + so[1] + ' (' + F(so[0]) + ', $' + qm(Ms) + '$) is dissolved in $' + qd(w, 1, 'g') + '$ of water at $' + v[1] + '^\\circ\\text{C}$ ($P^\\circ = ' + qg(v[2], 'mmHg') + '$). ' + (so[2] > 1 ? 'Treating the salt as fully split into ions, estimate' : 'Find') + ' the vapor pressure of the solution.', ans(P2, 0.01),
        ['Moles: ' + so[1] + ' $' + dfr(fx(g), mmx(Ms)) + ' = ' + fx(n, 4) + '$' + (so[2] > 1 ? ', which gives $' + so[2] + ' \\times ' + fx(n, 4) + ' = ' + fx(npart, 4) + '$ mol of ions' : '') + '; water $' + dfr(gd(w, 1), '18.02') + ' = ' + fx(nw2, 4) + '$.', '$\\chi_\\text{water} = ' + dfr(fx(nw2, 4), fx(nw2, 4) + ' + ' + fx(npart, 4)) + ' = ' + fx(x2, 4) + '$.', '$P = ' + fx(x2, 4) + ' \\times ' + gx(v[2]) + ' = ' + qx(P2, 'mmHg') + '$.'],
        so[2] > 1 ? 'Count every ion as a solute particle.' : 'Find moles of each, then the solvent\'s mole fraction.', 'mmHg', { k: 'Pmass', n: npart, nw: nw2, P0: v[2] }); }
    var Pm = sgf(v[2] * R.pick([0.90, 0.95, 0.97, 0.98]), 3), xs = 1 - Pm / v[2];
    return P('A solution of a nonvolatile solute in water at $' + v[1] + '^\\circ\\text{C}$ has a vapor pressure of $' + qx(Pm, 'mmHg') + '$; pure water\'s is $' + qg(v[2], 'mmHg') + '$. What is the mole fraction of the solute?', ans(xs, 0.02),
      ['$\\chi_\\text{water} = \\dfrac{P}{P^\\circ} = ' + dfr(fx(Pm), gx(v[2])) + ' = ' + fx(Pm / v[2], 4) + '$.', '$\\chi_\\text{solute} = 1 - ' + fx(Pm / v[2], 4) + ' = ' + fx(xs, 3) + '$.'], 'Find the water\'s mole fraction first.', null, { k: 'chi', P: Pm, P0: v[2] });
  });

  // solutes for colligative problems: [formula, name, van 't Hoff factor (ideal)]
  var COLL = [['C6H12O6', 'glucose', 1], ['C12H22O11', 'sucrose', 1], ['CO(NH2)2', 'urea', 1], ['C2H6O2', 'ethylene glycol', 1], ['NaCl', 'sodium chloride', 2], ['KBr', 'potassium bromide', 2], ['CaCl2', 'calcium chloride', 3], ['MgCl2', 'magnesium chloride', 3], ['Na2SO4', 'sodium sulfate', 3], ['AlCl3', 'aluminum chloride', 4], ['K3PO4', 'potassium phosphate', 4]];

  G('gchem1.freezing-boiling-points', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['fp', 'fp', 'bp'], ['fp', 'bp', 'mass', 'rank'], ['mass', 'rank', 'molal', 'bp']));
    var so = R.pick(ctx.level === 1 ? COLL.slice(0, 6) : COLL), m = R.pick([0.100, 0.150, 0.200, 0.250, 0.300, 0.500, 0.750, 1.00]);
    var iTxt = so[2] === 1 ? so[1] + ' is a nonelectrolyte: $i = 1$.' : F(so[0]) + ' gives ' + so[2] + ' ions: $i = ' + so[2] + '$.';
    if (shape === 'fp' || shape === 'bp') { var fp = shape === 'fp', K = fp ? 1.86 : 0.512, dT = so[2] * K * m;
      return P('Find the ' + (fp ? 'freezing' : 'boiling') + ' point of a $' + qx(m, 'molkg') + '$ solution of ' + so[1] + ' (' + F(so[0]) + ') in water' + (so[2] > 1 ? ', treating it as fully split into ions' : '') + '. ($K_' + (fp ? 'f' : 'b') + ' = ' + gx(K) + '\\ ^\\circ\\text{C·kg/mol}$)', ans(fp ? -dT : 100 + dT, fp ? 0.01 : 0.0005, fp ? 3 : 5),
        [iTxt, '$\\Delta T_' + (fp ? 'f' : 'b') + ' = iK' + (fp ? '_f' : '_b') + 'm = (' + so[2] + ')(' + gx(K) + ')(' + fx(m) + ') = ' + fx(dT, 3) + '^\\circ\\text{C}$.', (fp ? 'Freezing point: $0.00 - ' + fx(dT, 3) + ' = ' + fx(-dT, 3) : 'Boiling point: $100.00 + ' + fx(dT, 3) + ' = ' + fx(100 + dT, 5)) + '^\\circ\\text{C}$.'],
        fp ? 'Dissolved particles lower the freezing point.' : 'Dissolved particles raise the boiling point.', 'C', { k: fp ? 'fp' : 'bp', i: so[2], m: m }); }
    if (shape === 'mass') { var Ms = mm(so[0]), g = R.pick([5.00, 10.0, 15.0, 25.0, 40.0]), w = R.pick([100.0, 200.0, 250.0, 500.0]), mol = g / Ms, mm2 = mol / (w / 1000), dT2 = so[2] * 1.86 * mm2;
      return P('$' + qx(g, 'g') + '$ of ' + so[1] + ' (' + F(so[0]) + ', $' + qm(Ms) + '$) is dissolved in $' + qd(w, 1, 'g') + '$ of water. Estimate the freezing point of the solution' + (so[2] > 1 ? ', treating the salt as fully split into ions' : '') + '. ($K_f = 1.86\\ ^\\circ\\text{C·kg/mol}$)', ans(-dT2, 0.02),
        ['Moles: $' + dfr(fx(g), mmx(Ms)) + ' = ' + qx(mol, 'mol', 4) + '$; molality $' + dfr(fx(mol, 4), gd(w / 1000, 4)) + ' = ' + qx(mm2, 'molkg', 4) + '$.', iTxt, '$\\Delta T_f = (' + so[2] + ')(1.86)(' + fx(mm2, 4) + ') = ' + fx(dT2, 3) + '^\\circ\\text{C}$, so it freezes at $' + fx(-dT2, 3) + '^\\circ\\text{C}$.'],
        'Molality first (kilograms of water), then $\\Delta T_f = iK_fm$.', 'C', { k: 'fpmass', i: so[2], m: mm2 }); }
    if (shape === 'rank') { var three = R.sample(COLL, 3).map(function (c) { return [c, R.pick([0.10, 0.15, 0.20, 0.30])]; }), k0 = 0;
      while (k0 < 30 && (function () { var ps = three.map(function (x) { return M.round(1000 * x[0][2] * x[1]); }).sort(function (a, b) { return a - b; }); return ps[0] === ps[1] || ps[1] === ps[2]; })()) { three = R.sample(COLL, 3).map(function (c) { return [c, R.pick([0.10, 0.15, 0.20, 0.30])]; }); k0++; }
      var best = three.slice().sort(function (a, b) { return b[0][2] * b[1] - a[0][2] * a[1]; })[0], txt = function (x) { return '$' + gd(x[1], 2) + '\\ \\text{mol/kg}$ ' + x[0][1]; };
      return P('Which aqueous solution has the lowest freezing point: ' + lst(three.map(txt)) + '?', mc(cap(txt(best)), three.filter(function (x) { return x !== best; }).map(function (x) { return cap(txt(x)); })),
        ['The freezing-point drop is proportional to $i \\times m$, the molality of dissolved particles.', three.map(function (x) { return x[0][1] + ': $' + x[0][2] + ' \\times ' + gd(x[1], 2) + ' = ' + gd(x[0][2] * x[1], 2) + '$'; }).join('; ') + '.', 'The largest, ' + gd(best[0][2] * best[1], 2) + ' mol/kg of particles, freezes lowest.'],
        'Compare $i \\times m$.', null, { k: 'rank' }); }
    var dTq = sgf(so[2] * 1.86 * m, 3), mfound = dTq / (so[2] * 1.86);
    return P('An aqueous solution of ' + so[1] + ' (' + F(so[0]) + ') freezes at $' + gx(-dTq) + '^\\circ\\text{C}$. What is its molality' + (so[2] > 1 ? ', treating the salt as fully split into ions' : '') + '? ($K_f = 1.86\\ ^\\circ\\text{C·kg/mol}$)', ans(mfound, 0.01),
      [iTxt, '$m = \\dfrac{\\Delta T_f}{iK_f} = ' + dfr(gx(dTq), '(' + so[2] + ')(1.86)') + ' = ' + qx(mfound, 'molkg') + '$.'], 'Solve $\\Delta T_f = iK_fm$ for $m$.', 'molkg', { k: 'molal', dT: dTq, i: so[2] });
  });

  G('gchem1.osmotic-pressure', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['Pi', 'Pi', 'dir'], ['Pi', 'M', 'dir', 'cmp'], ['M', 'mmHg', 'cmp', 'Pi']));
    var so = R.pick(ctx.level === 1 ? COLL.slice(0, 7) : COLL), Mc = R.pick([0.0100, 0.0500, 0.100, 0.150, 0.200, 0.250]), tC = R.pick([20.0, 25.0, 37.0]), Tk = nk(tC);
    var iTxt = so[2] === 1 ? so[1] + ': $i = 1$.' : F(so[0]) + ' gives ' + so[2] + ' ions: $i = ' + so[2] + '$.';
    if (shape === 'Pi' || shape === 'mmHg') { var Pi = so[2] * Mc * RL * Tk, inMm = shape === 'mmHg';
      return P('Find the osmotic pressure' + (inMm ? ', in mmHg,' : '') + ' of a $' + qx(Mc, 'M') + '$ solution of ' + so[1] + ' (' + F(so[0]) + ') at $' + gd(tC, 1) + '^\\circ\\text{C}$' + (so[2] > 1 ? ', treating it as fully split into ions' : '') + '.', ans(inMm ? Pi * 760 : Pi, 0.01),
        [iTxt + ' $T = ' + gx(Tk) + '\\ \\text{K}$.', '$\\Pi = iMRT = (' + so[2] + ')(' + fx(Mc) + ')(0.08206)(' + gx(Tk) + ') = ' + qx(Pi, 'atm') + '$' + (inMm ? ' $= ' + fx(Pi) + ' \\times 760 = ' + qx(Pi * 760, 'mmHg') + '$.' : '.')],
        '$\\Pi = iMRT$ with $T$ in kelvins.', inMm ? 'mmHg' : 'atm', { k: 'Pi', i: so[2], M: Mc, T: Tk, mm: inMm }); }
    if (shape === 'M') { var Pg = sgf(so[2] * Mc * RL * Tk, 3), Mf = Pg / (so[2] * RL * Tk);
      return P('A solution of ' + so[1] + ' (' + F(so[0]) + ') has an osmotic pressure of $' + qx(Pg, 'atm') + '$ at $' + gd(tC, 1) + '^\\circ\\text{C}$. What is its molarity' + (so[2] > 1 ? ', treating the solute as fully split into ions' : '') + '?', ans(Mf, 0.01),
        [iTxt, '$M = \\dfrac{\\Pi}{iRT} = ' + dfr(fx(Pg), '(' + so[2] + ')(0.08206)(' + gx(Tk) + ')') + ' = ' + qx(Mf, 'M') + '$.'], 'Solve $\\Pi = iMRT$ for $M$.', 'M', { k: 'M', Pi: Pg, i: so[2], T: Tk }); }
    if (shape === 'dir') { var a = R.pick(COLL), b = R.pick(COLL), ca = R.pick([0.10, 0.20]), cb = R.pick([0.10, 0.20, 0.30]); var pa = a[2] * ca, pb = b[2] * cb; if (M.abs(pa - pb) < 1e-9) { cb = cb === 0.30 ? 0.10 : cb + 0.10; pb = b[2] * cb; }
      var toB = pb > pa;
      return P('A membrane that lets only water through separates $' + gd(ca, 2) + '\\ \\text{M}$ ' + a[1] + ' (side A) from $' + gd(cb, 2) + '\\ \\text{M}$ ' + b[1] + ' (side B). Which way does water flow overall?', mcK(['from A into B', 'from B into A', 'no net flow'], toB ? 0 : 1),
        ['Count solute particles: A has $' + a[2] + ' \\times ' + gd(ca, 2) + ' = ' + gd(pa, 2) + '\\ \\text{M}$; B has $' + b[2] + ' \\times ' + gd(cb, 2) + ' = ' + gd(pb, 2) + '\\ \\text{M}$ of particles.', 'Water moves toward more solute particles: ' + (toB ? 'from A into B.' : 'from B into A.')],
        'Water moves toward the side with more dissolved particles.', null, { k: 'dir' }); }
    var two = R.sample(COLL, 2), c1 = R.pick([0.10, 0.20]), c2 = R.pick([0.10, 0.20, 0.30]), p1 = two[0][2] * c1, p2 = two[1][2] * c2; if (M.abs(p1 - p2) < 1e-9) c2 = c2 === 0.30 ? 0.10 : c2 + 0.10, p2 = two[1][2] * c2;
    return P('At the same temperature, which has the higher osmotic pressure: $' + gd(c1, 2) + '\\ \\text{M}$ ' + two[0][1] + ' or $' + gd(c2, 2) + '\\ \\text{M}$ ' + two[1][1] + '?', mcK([cap(two[0][1]), cap(two[1][1])], p1 > p2 ? 0 : 1),
      ['$\\Pi = iMRT$: at one temperature, compare $iM$.', two[0][1] + ': $' + two[0][2] + ' \\times ' + gd(c1, 2) + ' = ' + gd(p1, 2) + '$; ' + two[1][1] + ': $' + two[1][2] + ' \\times ' + gd(c2, 2) + ' = ' + gd(p2, 2) + '$.'],
      'Compare particles per liter.', null, { k: 'cmp' });
  });

  // unknowns for molar mass problems (real compounds); solvents (OpenStax Chemistry 2e, Table 11.2)
  var UNK = [['C10H8', 'naphthalene'], ['C14H10', 'anthracene'], ['C12H10', 'biphenyl'], ['C8H10N4O2', 'caffeine'], ['C6H12O6', 'glucose'], ['C12H22O11', 'sucrose'], ['C9H8O4', 'aspirin'], ['C10H16O', 'camphor']];
  var SOLV = [['water', 0.00, 1.86, 100.00, 0.512], ['benzene', 5.50, 5.12, 80.1, 2.53], ['chloroform', -63.5, 4.68, 61.2, 3.63], ['acetic acid', 16.6, 3.9, 118.1, 3.07]];

  G('gchem1.molar-mass-colligative', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['fp', 'fp', 'osm'], ['fp', 'osm', 'bp'], ['fp', 'osm', 'bp', 'formula']));
    var u = R.pick(UNK), Mt = mm(u[0]);
    if (shape === 'fp' || shape === 'bp') { var sv = shape === 'fp' ? R.pick(SOLV.slice(1)) : R.pick(SOLV.slice(1)), fp = shape === 'fp', K = fp ? sv[2] : sv[4], g = R.pick([0.500, 1.00, 1.50, 2.00, 2.50]), w = R.pick([20.0, 25.0, 40.0, 50.0]), dT = sgf(K * (g / Mt) / (w / 1000), 3);
      var T0 = fp ? sv[1] : sv[3], Tn = fp ? rd(T0 - dT, 2) : rd(T0 + dT, 2), dTg = rd(M.abs(T0 - Tn), 2), m = dTg / K, mol = m * w / 1000, Mf = g / mol;
      return P('$' + qx(g, 'g') + '$ of an unknown nonelectrolyte is dissolved in $' + qx(w, 'g') + '$ of ' + sv[0] + ' (' + (fp ? 'freezing point $' + gx(T0) + '^\\circ\\text{C}$, $K_f' : 'boiling point $' + gx(T0) + '^\\circ\\text{C}$, $K_b') + ' = ' + gx(K) + '\\ ^\\circ\\text{C·kg/mol}$). The solution ' + (fp ? 'freezes' : 'boils') + ' at $' + gd(Tn, 2) + '^\\circ\\text{C}$. Find the molar mass of the unknown.', ans(Mf, 0.02),
        ['$\\Delta T = |' + gd(Tn, 2) + ' - (' + gx(T0) + ')| = ' + gd(dTg, 2) + '^\\circ\\text{C}$.', '$m = \\dfrac{\\Delta T}{K} = ' + dfr(gd(dTg, 2), gx(K)) + ' = ' + qx(m, 'molkg', 4) + '$.', 'Moles: $' + fx(m, 4) + ' \\times ' + gd(w / 1000, 4) + '\\ \\text{kg} = ' + qx(mol, 'mol', 4) + '$.', 'Molar mass $= ' + dfr(fx(g) + '\\ \\text{g}', fx(mol, 4) + '\\ \\text{mol}') + ' = ' + qx(Mf, 'gmol') + '$.'],
        'ΔT gives molality; molality times kg of solvent gives moles.', 'gmol', { k: 'mmfp', g: g, w: w, dT: dTg, K: K }); }
    if (shape === 'osm') { var big = R.coin(), Mp = big ? R.pick([12000, 17800, 25000, 45000, 66000]) : Mt, gp = big ? R.pick([0.100, 0.250, 0.500, 1.00]) : R.pick([0.0500, 0.100, 0.200]), V = R.pick([50.0, 100.0, 250.0]), tC = 25.0, Tk = 298.15;
      var Pi = gp / Mp / (V / 1000) * RL * Tk, PiMm = big ? sgf(Pi * 760, 3) : null, Pig = big ? PiMm / 760 : sgf(Pi, 3), Mc = Pig / (RL * Tk), mol = Mc * V / 1000, Mf = gp / mol;
      return P('$' + qx(gp, 'g') + '$ of ' + (big ? 'a protein' : 'an unknown nonelectrolyte') + ' is dissolved in water to make $' + qd(V, 1, 'mL') + '$ of solution. Its osmotic pressure at $25.0^\\circ\\text{C}$ is $' + (big ? qx(PiMm, 'mmHg') : qx(Pig, 'atm')) + '$. Find its molar mass.', ans(Mf, 0.02),
        (big ? ['$\\Pi = ' + dfr(fx(PiMm), '760') + ' = ' + qx(Pig, 'atm', 4) + '$.'] : []).concat(['$M = \\dfrac{\\Pi}{RT} = ' + dfr(fx(Pig, 4), '(0.08206)(298.15)') + ' = ' + qx(Mc, 'M', 4) + '$.', 'Moles: $' + fx(Mc, 4) + ' \\times ' + gd(V / 1000, 4) + '\\ \\text{L} = ' + qx(mol, 'mol', 4) + '$.', 'Molar mass $= ' + dfr(fx(gp) + '\\ \\text{g}', fx(mol, 4) + '\\ \\text{mol}') + ' = ' + qx(Mf, 'gmol') + '$.']),
        'Π gives molarity; molarity times liters gives moles.', 'gmol', { k: 'mmosm', g: gp, V: V, Pi: Pig }); }
    // molecular formula from an empirical formula and a freezing-point molar mass
    var cases = [['C10H8', 'C5H4'], ['C14H10', 'C7H5'], ['C12H10', 'C6H5'], ['C6H12O6', 'CH2O'], ['C8H10N4O2', 'C4H5N2O']], cs = R.pick(cases), Mm = mm(cs[0]), g2 = 1.00, w2 = 25.0, dT2 = sgf(5.12 * (g2 / Mm) / (w2 / 1000), 3), mol2 = dT2 / 5.12 * w2 / 1000, Mf2 = g2 / mol2, nE = M.round(Mf2 / mm(cs[1]));
    return P('A compound has the empirical formula ' + F(cs[1]) + '. A solution of $1.00\\ \\text{g}$ of it in $25.0\\ \\text{g}$ of benzene ($K_f = 5.12\\ ^\\circ\\text{C·kg/mol}$) freezes $' + gx(dT2) + '^\\circ\\text{C}$ below pure benzene. Find its molecular formula (in the same element order).', fAns(cs[0]),
      ['$m = ' + dfr(gx(dT2), '5.12') + ' = ' + qx(dT2 / 5.12, 'molkg', 4) + '$; moles $= ' + fx(dT2 / 5.12, 4) + ' \\times 0.0250 = ' + qx(mol2, 'mol', 4) + '$.', 'Molar mass $= ' + dfr('1.00', fx(mol2, 4)) + ' = ' + qx(Mf2, 'gmol') + '$.', 'Empirical formula mass: $' + mmx(mm(cs[1])) + '$; $' + fx(Mf2) + '/' + mmx(mm(cs[1])) + ' \\approx ' + nE + '$, so the formula is $' + ft(cs[0]) + '$.'],
      'Find the molar mass, then compare it with the empirical formula mass.', null, { k: 'mmform', f: cs[0] });
  });


  // ================================================================== UNIT 7: GASES IN DEPTH
  var GASES = [['He', 'helium'], ['Ne', 'neon'], ['Ar', 'argon'], ['N2', 'nitrogen'], ['O2', 'oxygen'], ['CO2', 'carbon dioxide'], ['CH4', 'methane'], ['Cl2', 'chlorine'], ['SO2', 'sulfur dioxide'], ['NH3', 'ammonia'], ['C3H8', 'propane'], ['H2', 'hydrogen'], ['Kr', 'krypton'], ['NO2', 'nitrogen dioxide']];
  function gm(f) { return f === 'He' ? 4.00 : f === 'Ne' ? 20.18 : f === 'Ar' ? 39.95 : f === 'Kr' ? 83.80 : mm(f); }
  function tTxt(tC) { return gd(tC, tC % 1 ? 1 : 0) + '^\\circ\\text{C}'; }

  G('gchem1.gas-density', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['d', 'd', 'cmp'], ['d', 'M', 'which', 'cmp'], ['M', 'which', 'd', 'tf']));
    var g = R.pick(GASES), Mg = gm(g[0]), tC = R.pick([0, 20, 25, 37, 50, 100, -10]), Tk = nk(tC), P0 = R.pick([0.500, 0.950, 1.00, 1.50, 2.00, 3.00]);
    if (shape === 'd') { var d = P0 * Mg / (RL * Tk);
      return P('Find the density of ' + g[1] + ' gas (' + F(g[0]) + ', $' + qm(Mg) + '$) at $' + tTxt(tC) + '$ and $' + qx(P0, 'atm') + '$.', ans(d, 0.01),
        ['$T = ' + gx(Tk) + '\\ \\text{K}$.', '$d = \\dfrac{P\\mathcal{M}}{RT} = ' + dfr('(' + fx(P0) + ')(' + mmx(Mg) + ')', '(0.08206)(' + gx(Tk) + ')') + ' = ' + qx(d, 'gL') + '$.'],
        'Combine $PV = nRT$ with $n = m/\\mathcal{M}$.', 'gL', { k: 'd', P: P0, M: Mg, T: Tk }); }
    if (shape === 'M' || shape === 'which') { var dg = sgf(P0 * Mg / (RL * Tk), 3), Mf = dg * RL * Tk / P0;
      if (shape === 'M') return P('A gas has a density of $' + qx(dg, 'gL') + '$ at $' + tTxt(tC) + '$ and $' + qx(P0, 'atm') + '$. Find its molar mass.', ans(Mf, 0.01),
        ['$\\mathcal{M} = \\dfrac{dRT}{P} = ' + dfr('(' + fx(dg) + ')(0.08206)(' + gx(Tk) + ')', fx(P0)) + ' = ' + qx(Mf, 'gmol') + '$.'], 'Solve $d = P\\mathcal{M}/RT$ for $\\mathcal{M}$.', 'gmol', { k: 'M', d: dg, P: P0, T: Tk });
      var others = R.sample(GASES.filter(function (x) { return M.abs(gm(x[0]) - Mg) > 5; }), 3);
      return P('A gas has a density of $' + qx(dg, 'gL') + '$ at $' + tTxt(tC) + '$ and $' + qx(P0, 'atm') + '$. Which gas could it be?', mc(F(g[0]) + ' (' + mmx(Mg) + ' g/mol)', others.map(function (o) { return F(o[0]) + ' (' + mmx(gm(o[0])) + ' g/mol)'; })),
        ['$\\mathcal{M} = \\dfrac{dRT}{P} = ' + dfr('(' + fx(dg) + ')(0.08206)(' + gx(Tk) + ')', fx(P0)) + ' = ' + qx(Mf, 'gmol') + '$.', 'That matches ' + F(g[0]) + '.'], 'Find the molar mass first.', null, { k: 'which', d: dg, P: P0, T: Tk, M: Mg }); }
    if (shape === 'cmp') { var two = R.sample(GASES, 2), hi = gm(two[0][0]) > gm(two[1][0]) ? two[0] : two[1];
      return P('At the same temperature and pressure, which gas is denser: ' + g2n(two[0]) + ' or ' + g2n(two[1]) + '?', mcK([cap(two[0][1]), cap(two[1][1])], hi === two[0] ? 0 : 1),
        ['At the same $T$ and $P$, equal volumes hold equal numbers of molecules, so $d = P\\mathcal{M}/RT$ is proportional to the molar mass.', cap(hi[1]) + ' has the larger molar mass (' + mmx(gm(hi[0])) + ' against ' + mmx(gm((hi === two[0] ? two[1] : two[0])[0])) + ' g/mol).'], 'Same $T$ and $P$: compare molar masses.', null, { k: 'cmp' }); }
    var t = R.pick([['A gas has one fixed density, like a solid.', false, 'A gas\'s density changes with pressure and temperature: $d = P\\mathcal{M}/RT$.'],
      ['Heating a gas at constant pressure lowers its density.', true, 'The gas expands, so the same mass fills more volume.'],
      ['Doubling the pressure of a gas at constant temperature doubles its density.', true, '$d$ is proportional to $P$.'],
      ['At the same temperature and pressure, helium and argon have the same density.', false, 'Equal numbers of atoms per liter, but each argon atom is 10 times heavier, so argon is 10 times denser.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], '$d = P\\mathcal{M}/RT$.', null, { k: 'tf' });
  });
  function g2n(g) { return g[1] + ' (' + F(g[0]) + ')'; }

  // gas-forming reactions: [equation, given substance, gas, mole ratio gas/given, given is gas?]
  var GRX = [['CH4 + 2O2 -> CO2 + 2H2O', 'CH4', 'O2', 2], ['CH4 + 2O2 -> CO2 + 2H2O', 'CH4', 'CO2', 1], ['C3H8 + 5O2 -> 3CO2 + 4H2O', 'C3H8', 'CO2', 3], ['C3H8 + 5O2 -> 3CO2 + 4H2O', 'C3H8', 'O2', 5],
    ['CaCO3 -> CaO + CO2', 'CaCO3', 'CO2', 1], ['Zn + 2HCl -> ZnCl2 + H2', 'Zn', 'H2', 1], ['Mg + 2HCl -> MgCl2 + H2', 'Mg', 'H2', 1], ['2H2O2 -> 2H2O + O2', 'H2O2', 'O2', 0.5], ['2NaHCO3 -> Na2CO3 + H2O + CO2', 'NaHCO3', 'CO2', 0.5], ['C6H12O6 + 6O2 -> 6CO2 + 6H2O', 'C6H12O6', 'CO2', 6]];
  var VVRX = [['N2 + 3H2 -> 2NH3', 'H2', 'NH3', Q(2, 3)], ['N2 + 3H2 -> 2NH3', 'N2', 'NH3', Q(2)], ['2H2 + O2 -> 2H2O', 'O2', 'H2O', Q(2)], ['2CO + O2 -> 2CO2', 'CO', 'CO2', Q(1)], ['CH4 + 2O2 -> CO2 + 2H2O', 'CH4', 'O2', Q(2)], ['C3H8 + 5O2 -> 3CO2 + 4H2O', 'C3H8', 'O2', Q(5)], ['2SO2 + O2 -> 2SO3', 'SO2', 'O2', Q(1, 2)], ['H2 + Cl2 -> 2HCl', 'Cl2', 'HCl', Q(2)]];

  G('gchem1.gas-stoichiometry', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['stp', 'vv', 'gV'], ['gV', 'vv', 'Vg', 'stpmc'], ['gV', 'Vg', 'gV', 'stpmc']));
    if (shape === 'vv') { var r = R.pick(VVRX), V1 = R.pick([2.0, 3.0, 4.5, 6.0, 9.0, 12.0]), V2 = r[3].mul(Q.from(V1)).toNumber();
      var isProd = r[0].split('->')[1].indexOf(r[2]) >= 0;
      return P('All gases at the same temperature and pressure: $' + eqT(r[0]) + '$. ' + (isProd ? 'How many liters of ' + F(r[2]) + ' can $' + qx(V1, 'L', 2) + '$ of ' + F(r[1]) + ' form (the other reactant in excess)?' : 'How many liters of ' + F(r[2]) + ' are needed to react completely with $' + qx(V1, 'L', 2) + '$ of ' + F(r[1]) + '?'), ans(V2, 0.01),
        ['At the same $T$ and $P$, volumes of gases are in the same ratio as moles.', '$' + fx(V1, 2) + '\\ \\text{L}\\ ' + ft(r[1]) + ' \\times ' + r[3].toTex() + ' = ' + qx(V2, 'L', 2) + '$ of ' + F(r[2]) + '.'], 'The coefficients compare gas volumes directly.', 'L', { k: 'vv', V: V1, r: r[3].toNumber() }); }
    var rx = R.pick(GRX), Mgv = mm(rx[1]), g = R.pick([2.50, 5.00, 10.0, 12.5, 20.0, 25.0]), n1 = g / Mgv, n2 = n1 * rx[3];
    if (shape === 'stp') { var V = n2 * 22.4;
      return P('$' + eqT(rx[0]) + '$. What volume of ' + F(rx[2]) + ' at STP (0 °C and 1 atm, 22.4 L/mol) ' + (rx[2] === 'O2' && rx[1] !== 'H2O2' ? 'is needed to react with' : 'forms from') + ' $' + qx(g, 'g') + '$ of ' + F(rx[1]) + ' ($' + qm(Mgv) + '$)?', ans(V, 0.01),
        ['Moles of ' + F(rx[1]) + ': $' + dfr(fx(g), mmx(Mgv)) + ' = ' + qx(n1, 'mol', 4) + '$.', 'Mole ratio: $' + fx(n1, 4) + ' \\times ' + gx(rx[3]) + ' = ' + qx(n2, 'mol', 4) + '$ of ' + F(rx[2]) + '.', 'At STP: $' + fx(n2, 4) + ' \\times 22.4 = ' + qx(V, 'L') + '$.'], 'Grams to moles, mole ratio, then 22.4 L/mol at STP.', 'L', { k: 'gV', n: n2, T: 273.15, P: 1, stp: true }); }
    var tC = R.pick([20, 25, 30, 37, 50]), Tk = nk(tC), P0 = R.pick([0.950, 1.00, 1.20, 0.850, 2.00]);
    if (shape === 'gV') { var V2 = n2 * RL * Tk / P0;
      return P('$' + eqT(rx[0]) + '$. What volume of ' + F(rx[2]) + ', measured at $' + tTxt(tC) + '$ and $' + qx(P0, 'atm') + '$, ' + (rx[2] === 'O2' && rx[1] !== 'H2O2' ? 'is needed to react with' : 'forms from') + ' $' + qx(g, 'g') + '$ of ' + F(rx[1]) + ' ($' + qm(Mgv) + '$)?', ans(V2, 0.01),
        ['Moles of ' + F(rx[1]) + ': $' + dfr(fx(g), mmx(Mgv)) + ' = ' + qx(n1, 'mol', 4) + '$.', 'Mole ratio: $' + fx(n1, 4) + ' \\times ' + gx(rx[3]) + ' = ' + qx(n2, 'mol', 4) + '$ of ' + F(rx[2]) + '.', '$V = \\dfrac{nRT}{P} = ' + dfr('(' + fx(n2, 4) + ')(0.08206)(' + gx(Tk) + ')', fx(P0)) + ' = ' + qx(V2, 'L') + '$.'], 'Grams to moles, mole ratio, then $V = nRT/P$.', 'L', { k: 'gV', n: n2, T: Tk, P: P0 }); }
    if (shape === 'Vg') { var Vg = R.pick([0.500, 1.00, 2.50, 5.00, 10.0]), ng = P0 * Vg / (RL * Tk), nGiven = ng / rx[3], mass = nGiven * Mgv;
      return P('$' + eqT(rx[0]) + '$. What mass of ' + F(rx[1]) + ' ($' + qm(Mgv) + '$) is needed to ' + (rx[2] === 'O2' && rx[1] !== 'H2O2' ? 'use up' : 'make') + ' $' + qx(Vg, 'L') + '$ of ' + F(rx[2]) + ' at $' + tTxt(tC) + '$ and $' + qx(P0, 'atm') + '$?', ans(mass, 0.01),
        ['Moles of ' + F(rx[2]) + ': $n = \\dfrac{PV}{RT} = ' + dfr('(' + fx(P0) + ')(' + fx(Vg) + ')', '(0.08206)(' + gx(Tk) + ')') + ' = ' + qx(ng, 'mol', 4) + '$.', 'Mole ratio: $' + fx(ng, 4) + ' \\div ' + gx(rx[3]) + ' = ' + qx(nGiven, 'mol', 4) + '$ of ' + F(rx[1]) + '.', 'Mass: $' + fx(nGiven, 4) + ' \\times ' + mmx(Mgv) + ' = ' + qx(mass, 'g') + '$.'], 'Gas volume to moles with $PV = nRT$, then the mole ratio.', 'g', { k: 'Vg', V: Vg, P: P0, T: Tk, r: rx[3], M: Mgv }); }
    return P('A student uses 22.4 L/mol to find the volume of 1.00 mol of a gas at $' + tTxt(tC) + '$ and $' + qx(P0, 'atm') + '$. What is the right volume?', ans(RL * Tk / P0, 0.01),
      ['22.4 L/mol is $RT/P$ only at 273.15 K and 1 atm.', '$V = \\dfrac{nRT}{P} = ' + dfr('(1.00)(0.08206)(' + gx(Tk) + ')', fx(P0)) + ' = ' + qx(RL * Tk / P0, 'L') + '$.'], 'Use $PV = nRT$ at the actual conditions.', 'L', { k: 'gV', n: 1, T: Tk, P: P0 });
  });

  G('gchem1.partial-pressures', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['Pi', 'Pi', 'tot'], ['Pi', 'water', 'chi', 'tot'], ['water', 'waterg', 'chi', 'tf']));
    var two = R.sample([['He', 'helium'], ['Ar', 'argon'], ['N2', 'nitrogen'], ['O2', 'oxygen'], ['CO2', 'carbon dioxide'], ['Ne', 'neon'], ['H2', 'hydrogen']], 2), na = R.pick([0.50, 1.00, 1.50, 2.00, 3.00]), nb = R.pick([0.50, 1.00, 2.00, 2.50]);
    if (shape === 'Pi') { var Pt = R.pick([1.00, 2.00, 3.00, 5.00, 6.00, 10.0]), xa = na / (na + nb);
      return P('A tank holds $' + qx(na, 'mol') + '$ of ' + F(two[0][0]) + ' and $' + qx(nb, 'mol') + '$ of ' + F(two[1][0]) + ' at a total pressure of $' + qx(Pt, 'atm') + '$. What is the partial pressure of ' + F(two[0][0]) + '?', ans(xa * Pt, 0.01),
        ['$\\chi_{' + ft(two[0][0]) + '} = ' + dfr(fx(na), fx(na) + ' + ' + fx(nb)) + ' = ' + fx(xa, 4) + '$.', '$P = \\chi P_\\text{total} = ' + fx(xa, 4) + ' \\times ' + fx(Pt) + ' = ' + qx(xa * Pt, 'atm') + '$. (Mass doesn\'t matter, only moles.)'], 'Partial pressure = mole fraction × total pressure.', 'atm', { k: 'Pi', na: na, nb: nb, Pt: Pt }); }
    if (shape === 'tot') { var V = R.pick([5.00, 10.0, 20.0]), tC = R.pick([0, 25, 27]), Tk = nk(tC), Pa = na * RL * Tk / V, Pb = nb * RL * Tk / V;
      return P('$' + qx(na, 'mol') + '$ of ' + F(two[0][0]) + ' and $' + qx(nb, 'mol') + '$ of ' + F(two[1][0]) + ' are put in a $' + qx(V, 'L') + '$ container at $' + tTxt(tC) + '$. What is the total pressure?', ans(Pa + Pb, 0.01),
        ['Each gas acts as if alone: $P_A = \\dfrac{n_ART}{V} = ' + qx(Pa, 'atm') + '$, $P_B = ' + qx(Pb, 'atm') + '$.', 'Dalton\'s law: $P_\\text{total} = ' + fx(Pa) + ' + ' + fx(Pb) + ' = ' + qx(Pa + Pb, 'atm') + '$ (the same as using the total moles, ' + fx(na + nb) + ' mol).'], 'Use the total moles in $PV = nRT$.', 'atm', { k: 'tot', n: na + nb, T: Tk, V: V }); }
    if (shape === 'chi') { var Pt2 = R.pick([1.00, 2.00, 750, 760]), mmHgU = Pt2 > 100, Pa2 = sgf(Pt2 * R.pick([0.21, 0.35, 0.40, 0.60, 0.78]), 3);
      return P('In a gas mixture with a total pressure of $' + (mmHgU ? qg(Pt2, 'mmHg') : qx(Pt2, 'atm')) + '$, the partial pressure of ' + F(two[0][0]) + ' is $' + (mmHgU ? qx(Pa2, 'mmHg') : qx(Pa2, 'atm')) + '$. What is its mole fraction?', ans(Pa2 / Pt2, 0.01),
        ['$\\chi = \\dfrac{P_i}{P_\\text{total}} = ' + dfr(fx(Pa2), gx(Pt2)) + ' = ' + fx(Pa2 / Pt2, 3) + '$.'], 'Mole fraction = partial pressure / total pressure.', null, { k: 'chi', Pa: Pa2, Pt: Pt2 }); }
    var VPWT = { 20: 17.5, 22: 19.8, 24: 22.4, 25: 23.8, 26: 25.2, 27: 26.7 }, tw = R.pick([20, 22, 24, 25, 26, 27]), Ptw = R.pick([740, 745, 750, 755, 760, 765]), Pgas = Ptw - VPWT[tw];
    if (shape === 'water') return P('Oxygen gas is collected over water at $' + tw + '^\\circ\\text{C}$, where water\'s vapor pressure is $' + qg(VPWT[tw], 'mmHg') + '$. The total pressure in the collecting tube is $' + qg(Ptw, 'mmHg') + '$. What is the partial pressure of the oxygen?', ans(Pgas, 0.005),
      ['The tube holds oxygen and water vapor: $P_\\text{total} = P_{\\mathrm{O_2}} + P_{\\mathrm{H_2O}}$.', '$P_{\\mathrm{O_2}} = ' + gx(Ptw) + ' - ' + gx(VPWT[tw]) + ' = ' + qg(rd(Pgas, 1), 'mmHg') + '$.'], 'Subtract water\'s vapor pressure.', 'mmHg', { k: 'water', Pt: Ptw, Pw: VPWT[tw] });
    if (shape === 'waterg') { var Vt = R.pick([0.150, 0.200, 0.250, 0.350, 0.500]), nH = Pgas / 760 * Vt / (RL * nk(tw)), gas = R.pick([['H2', 2.02], ['O2', 32.00], ['N2', 28.02]]);
      return P(cap(ENAME[gas[0].replace('2', '')] || gas[0]) + ' gas, ' + F(gas[0]) + ', is collected over water at $' + tw + '^\\circ\\text{C}$ (water\'s vapor pressure $' + qg(VPWT[tw], 'mmHg') + '$) in a $' + qx(Vt, 'L') + '$ tube at a total pressure of $' + qg(Ptw, 'mmHg') + '$. What mass of ' + F(gas[0]) + ' ($' + qm(gas[1]) + '$) was collected?', ans(nH * gas[1], 0.02),
        ['$P = ' + gx(Ptw) + ' - ' + gx(VPWT[tw]) + ' = ' + gx(rd(Pgas, 1)) + '\\ \\text{mmHg} = ' + qx(Pgas / 760, 'atm', 4) + '$.', '$n = \\dfrac{PV}{RT} = ' + dfr('(' + fx(Pgas / 760, 4) + ')(' + fx(Vt) + ')', '(0.08206)(' + gx(nk(tw)) + ')') + ' = ' + qx(nH, 'mol') + '$.', 'Mass: $' + fx(nH) + ' \\times ' + gx(gas[1]) + ' = ' + qx(nH * gas[1], 'g') + '$.'], 'Subtract the water vapor first, then use $PV = nRT$.', 'g', { k: 'waterg', P: Pgas / 760, V: Vt, T: nk(tw), M: gas[1] }); }
    var t = R.pick([['In a mixture of equal moles of helium and argon, the argon supplies most of the pressure because its atoms are heavier.', false, 'Each supplies half: partial pressure depends on the number of molecules, not their mass.'],
      ['The partial pressures of the gases in a mixture add up to the total pressure.', true, 'That is Dalton\'s law.'],
      ['A gas collected over water is pure, so its pressure equals the total pressure in the tube.', false, 'The tube also holds water vapor; subtract its vapor pressure.'],
      ['In dry air at 1.00 atm, nitrogen\'s partial pressure is about 0.78 atm.', true, 'Nitrogen is about 78% of the molecules in dry air.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Pressure counts molecules.', null, { k: 'tf' });
  });

  G('gchem1.molecular-speeds', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['rate', 'rate', 'which'], ['urms', 'rate', 'Mx', 'KE'], ['urms', 'Mx', 'time', 'KE']));
    var two = R.sample(GASES, 2), Ma = gm(two[0][0]), Mb = gm(two[1][0]);
    if (shape === 'rate') { var fast = Ma < Mb ? two[0] : two[1], slow = fast === two[0] ? two[1] : two[0], rt = M.sqrt(gm(slow[0]) / gm(fast[0]));
      return P('Under the same conditions, how many times faster does ' + g2n(fast) + ' effuse than ' + g2n(slow) + '? (Molar masses: ' + mmx(gm(fast[0])) + ' and ' + mmx(gm(slow[0])) + ' g/mol.)', ans(rt, 0.01),
        ['Graham\'s law: $\\dfrac{\\text{rate}_1}{\\text{rate}_2} = \\sqrt{\\dfrac{\\mathcal{M}_2}{\\mathcal{M}_1}}$.', '$\\sqrt{' + dfr(mmx(gm(slow[0])), mmx(gm(fast[0]))) + '} = \\sqrt{' + fx(gm(slow[0]) / gm(fast[0]), 4) + '} = ' + fx(rt, 3) + '$.'], 'Rates go as one over the square root of molar mass.', 'none', { k: 'graham', Mf: gm(fast[0]), Ms: gm(slow[0]) }); }
    if (shape === 'which') { var f2 = Ma < Mb ? two[0] : two[1];
      return P('At the same temperature, whose molecules have the higher average speed: ' + g2n(two[0]) + ' or ' + g2n(two[1]) + '?', mcK([cap(two[0][1]), cap(two[1][1]), 'They have the same average speed'], f2 === two[0] ? 0 : 1),
        ['Same temperature, same average kinetic energy $\\tfrac{1}{2}mv^2$.', 'The lighter molecule (' + F(f2[0]) + ', ' + mmx(gm(f2[0])) + ' g/mol) must move faster.'], 'Same kinetic energy, so the lighter one is faster.', null, { k: 'which' }); }
    if (shape === 'urms') { var tC = R.pick([0, 25, 100, 200, -50]), Tk = nk(tC), u = M.sqrt(3 * RJ * Tk / (Ma / 1000));
      return P('Find the root-mean-square speed of ' + g2n(two[0]) + ' molecules ($' + qm(Ma) + '$) at $' + tTxt(tC) + '$. Use a calculator.', ans(u, 0.01),
        ['$\\mathcal{M} = ' + fx(Ma / 1000, 4) + '\\ \\text{kg/mol}$; $T = ' + gx(Tk) + '\\ \\text{K}$.', '$u_\\text{rms} = \\sqrt{\\dfrac{3RT}{\\mathcal{M}}} = \\sqrt{' + dfr('3(8.314)(' + gx(Tk) + ')', fx(Ma / 1000, 4)) + '} = ' + qx(u, 'ms') + '$.'], 'Molar mass in kg/mol.', 'ms', { k: 'urms', M: Ma, T: Tk }); }
    if (shape === 'Mx') { var ref = R.pick([['O2', 32.00], ['He', 4.00], ['N2', 28.02], ['H2', 2.02]]), unk = R.pick(GASES.filter(function (x) { return x[0] !== ref[0]; })), Mu = gm(unk[0]), ratio = sgf(M.sqrt(ref[1] / Mu), 3), Mf = ref[1] / (ratio * ratio);
      return P('An unknown gas effuses $' + fx(ratio, 3) + '$ times as fast as ' + F(ref[0]) + ' ($' + qm(ref[1]) + '$) under the same conditions. What is its molar mass?', ans(Mf, 0.02),
        ['$\\dfrac{\\text{rate}_x}{\\text{rate}_{' + ft(ref[0]) + '}} = \\sqrt{\\dfrac{' + gx(ref[1]) + '}{\\mathcal{M}_x}} = ' + fx(ratio, 3) + '$.', 'Square: $\\dfrac{' + gx(ref[1]) + '}{\\mathcal{M}_x} = ' + fx(ratio * ratio, 4) + '$, so $\\mathcal{M}_x = ' + qx(Mf, 'gmol') + '$' + (M.abs(Mf - Mu) < 1.5 ? ' (consistent with ' + F(unk[0]) + ').' : '.')], 'Square both sides of Graham\'s law.', 'gmol', { k: 'Mx', ref: ref[1], ratio: ratio }); }
    if (shape === 'time') { var tA = R.pick([30.0, 45.0, 60.0, 90.0, 120]), tB = tA * M.sqrt(Mb / Ma);
      return P('A sample of ' + g2n(two[0]) + ' takes $' + qx(tA, 's') + '$ to effuse through a pinhole. How long does the same number of molecules of ' + g2n(two[1]) + ' take under the same conditions? (Molar masses ' + mmx(Ma) + ' and ' + mmx(Mb) + ' g/mol.)', ans(tB, 0.01),
        ['Time is inversely proportional to rate, so $\\dfrac{t_B}{t_A} = \\sqrt{\\dfrac{\\mathcal{M}_B}{\\mathcal{M}_A}} = \\sqrt{' + dfr(mmx(Mb), mmx(Ma)) + '} = ' + fx(M.sqrt(Mb / Ma), 4) + '$.', '$t_B = ' + fx(tA) + ' \\times ' + fx(M.sqrt(Mb / Ma), 4) + ' = ' + qx(tB, 's') + '$ (' + (Mb > Ma ? 'longer, since it is heavier' : 'shorter, since it is lighter') + ').'], 'Heavier gas, slower effusion, longer time.', 's', { k: 'time', tA: tA, Ma: Ma, Mb: Mb }); }
    var tK = R.pick([200, 298, 300, 350, 500, 1000]), KE = 1.5 * RJ * tK;
    return P('What is the average kinetic energy, in J/mol, of ' + g2n(two[0]) + ' molecules at $' + qg(tK, 'K') + '$?', ans(KE, 0.01),
      ['$KE_\\text{avg} = \\tfrac{3}{2}RT = \\tfrac{3}{2}(8.314)(' + gx(tK) + ') = ' + qx(KE, 'Jmol') + '$.', 'It depends only on temperature, so ' + two[1][1] + ' has the same, though it moves at a different speed.'], 'Kinetic energy depends only on $T$.', 'Jmol', { k: 'KE', T: tK });
  });

  G('gchem1.speed-distributions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['curve', 'ump', 'curve'], ['ump', 'curve', 'ratio', 'heavy'], ['which3', 'ratio', 'Tfor', 'curve']));
    var g = R.pick(GASES), Mg = gm(g[0]) / 1000, tK = R.pick([200, 250, 300, 350, 400, 500, 600, 800]);
    if (shape === 'ump' || shape === 'which3') { var kind = shape === 'ump' ? R.pick(['mp', 'avg']) : R.pick(['mp', 'avg', 'rms']), f = { mp: 2, avg: 8 / M.PI, rms: 3 }[kind], u = M.sqrt(f * RJ * tK / Mg), nm = { mp: 'most probable speed $u_\\text{mp} = \\sqrt{2RT/\\mathcal{M}}$', avg: 'average speed $u_\\text{avg} = \\sqrt{8RT/\\pi\\mathcal{M}}$', rms: 'root-mean-square speed $u_\\text{rms} = \\sqrt{3RT/\\mathcal{M}}$' }[kind];
      return P('Find the ' + nm + ' of ' + g2n(g) + ' molecules ($' + qm(gm(g[0])) + '$) at $' + qg(tK, 'K') + '$. Use a calculator.', ans(u, 0.01),
        ['$\\mathcal{M} = ' + fx(Mg, 4) + '\\ \\text{kg/mol}$.', '$u = \\sqrt{' + dfr((kind === 'avg' ? '8' : f) + '(8.314)(' + tK + ')', (kind === 'avg' ? '\\pi(' + fx(Mg, 4) + ')' : fx(Mg, 4))) + '} = ' + qx(u, 'ms') + '$.'], 'Molar mass in kg/mol.', 'ms', { k: 'u', f: f, M: Mg, T: tK }, { name: 'ch-maxwell', opts: { curves: [{ f: g[0], T: tK }], quiet: true, marks: false, edit: false } }); }
    if (shape === 'ratio') { var t2 = tK * R.pick([2, 4, 1.5, 0.5]), rr = M.sqrt(t2 / tK);
      return P('A gas is ' + (t2 > tK ? 'heated' : 'cooled') + ' from $' + qg(tK, 'K') + '$ to $' + qg(t2, 'K') + '$. By what factor does its most probable speed change?', ans(rr, 0.01),
        ['Every characteristic speed is proportional to $\\sqrt{T}$.', 'Factor: $\\sqrt{' + dfr(gx(t2), gx(tK)) + '} = ' + fx(rr, 3) + '$.'], 'Speeds go as the square root of the kelvin temperature.', 'none', { k: 'ratio', T1: tK, T2: t2 }); }
    if (shape === 'Tfor') { var uT = R.pick([300, 400, 500, 600, 800, 1000]), Tn = uT * uT * Mg / (3 * RJ);
      return P('At what temperature, in kelvins, would ' + g2n(g) + ' molecules ($' + qm(gm(g[0])) + '$) have a root-mean-square speed of $' + qg(uT, 'ms') + '$?', ans(Tn, 0.01),
        ['$u_\\text{rms}^2 = \\dfrac{3RT}{\\mathcal{M}}$, so $T = \\dfrac{\\mathcal{M}u^2}{3R}$.', '$T = ' + dfr('(' + fx(Mg, 4) + ')(' + gx(uT) + ')^2', '3(8.314)') + ' = ' + qx(Tn, 'K') + '$.'], 'Solve the $u_\\text{rms}$ formula for $T$.', 'K', { k: 'Tfor', M: Mg, u: uT }); }
    if (shape === 'heavy') { var two = R.sample(GASES, 2), lt = gm(two[0][0]) < gm(two[1][0]) ? two[0] : two[1];
      return P('At the same temperature, which gas has the narrower speed distribution with its peak at lower speed: ' + g2n(two[0]) + ' or ' + g2n(two[1]) + '?', mcK([cap(two[0][1]), cap(two[1][1])], lt === two[0] ? 1 : 0),
        ['All speeds scale as $1/\\sqrt{\\mathcal{M}}$ at a given temperature.', 'The heavier gas, ' + (lt === two[0] ? two[1][1] : two[0][1]) + ', has its peak at lower speed and a narrower, taller curve.'], 'Heavier molecules move slower.', null, { k: 'heavy' }, { name: 'ch-maxwell', opts: { curves: [{ f: two[0][0], T: 300 }, { f: two[1][0], T: 300 }], quiet: true, edit: false } }); }
    var cq = R.pick([['As the temperature of a gas rises, what happens to the peak of its Maxwell–Boltzmann curve?', 'It moves to higher speed and gets lower.', ['It moves to higher speed and gets taller.', 'It stays at the same speed and gets taller.', 'It moves to lower speed and gets lower.']],
      ['What happens to the area under a gas\'s Maxwell–Boltzmann curve when the gas is heated?', 'It stays the same: it always counts all the molecules.', ['It grows, because the molecules have more energy.', 'It shrinks, because the curve flattens.', 'It doubles when the kelvin temperature doubles.']],
      ['Which is largest for a gas at a given temperature?', 'the root-mean-square speed', ['the most probable speed', 'the average speed', 'all three are equal']],
      ['Heating a gas from 300 K to 310 K mostly increases…', 'the fraction of molecules in the fast tail of the curve, by a large factor', ['the number of molecules, by about 3%', 'the speed of every molecule by exactly the same amount', 'the height of the peak']]]);
    return P(cq[0], mc(cq[1], cq[2]), ['A hotter gas has its distribution shifted to higher speeds and spread wider; the area (all the molecules) is fixed, so the peak drops. $u_\\text{mp} < u_\\text{avg} < u_\\text{rms}$ (ratio $1 : 1.13 : 1.22$).', 'Answer: ' + cq[1].replace(/\.$/, '') + '.'], 'The area under the curve is the total number of molecules.', null, { k: 'curve' }, { name: 'ch-maxwell', opts: { curves: [{ f: 'N2', T: 300 }, { f: 'N2', T: 600 }], quiet: true, edit: false } });
  });

  // van der Waals constants (OpenStax Chemistry 2e, Table 9.3): a in L²·atm/mol², b in L/mol
  var VDWD = { He: [0.0341, 0.0237], Ne: [0.211, 0.0171], Ar: [1.34, 0.0322], H2: [0.244, 0.0266], N2: [1.39, 0.0391], O2: [1.36, 0.0318], CO2: [3.59, 0.0427], CH4: [2.25, 0.0428], NH3: [4.17, 0.0371], H2O: [5.46, 0.0305] };

  G('gchem1.real-gases', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['cond', 'which', 'cond'], ['vdw', 'which', 'cond', 'ideal'], ['vdw', 'pct', 'which', 'tf']));
    var gs = R.pick(Object.keys(VDWD).filter(function (x) { return x !== 'H2O'; })), ab = VDWD[gs], n = R.pick([1.00, 2.00, 0.500]), V = R.pick([0.500, 1.00, 2.00, 5.00]), Tk = R.pick([250, 273, 300, 350, 400]);
    var Pid = n * RL * Tk / V, Pv = n * RL * Tk / (V - n * ab[1]) - ab[0] * n * n / (V * V), tries = 0;
    while (shape === 'pct' && M.abs(Pv - Pid) / Pid < 0.03 && tries++ < 60) { // a percent difference big enough to survive rounded pressures
      gs = R.pick(['Ar', 'N2', 'O2', 'CO2', 'CH4', 'NH3']); ab = VDWD[gs]; n = R.pick([1.00, 2.00]); V = R.pick([0.500, 1.00, 2.00]); Tk = R.pick([250, 273, 300, 350]);
      Pid = n * RL * Tk / V; Pv = n * RL * Tk / (V - n * ab[1]) - ab[0] * n * n / (V * V); }
    if (shape === 'vdw' || shape === 'ideal' || shape === 'pct') {
      var st = ['Ideal: $P = \\dfrac{nRT}{V} = ' + dfr('(' + fx(n) + ')(0.08206)(' + gx(Tk) + ')', fx(V)) + ' = ' + qx(Pid, 'atm') + '$.', 'Van der Waals: $P = \\dfrac{nRT}{V - nb} - \\dfrac{an^2}{V^2} = ' + dfr(fx(n * RL * Tk, 4), fx(V) + ' - ' + fx(n * ab[1], 3)) + ' - ' + dfr('(' + gx(ab[0]) + ')(' + fx(n) + ')^2', '(' + fx(V) + ')^2') + ' = ' + fx(n * RL * Tk / (V - n * ab[1]), 4) + ' - ' + fx(ab[0] * n * n / (V * V), 3) + ' = ' + qx(Pv, 'atm') + '$.'];
      var q = 'For $' + qx(n, 'mol') + '$ of ' + F(gs) + ' in $' + qx(V, 'L') + '$ at $' + qg(Tk, 'K') + '$ ($a = ' + gx(ab[0]) + '\\ \\text{L}^2\\text{·atm/mol}^2$, $b = ' + gx(ab[1]) + '\\ \\text{L/mol}$), ';
      if (shape === 'ideal') return P(q + 'what pressure does the ideal gas law predict?', ans(Pid, 0.01), st.slice(0, 1), '$P = nRT/V$.', 'atm', { k: 'ideal', n: n, V: V, T: Tk });
      if (shape === 'pct') return P(q + 'by what percent does the van der Waals pressure differ from the ideal pressure? (Give the size of the difference as a percent of the ideal pressure, and keep four significant figures in the pressures along the way.)', pctAns(100 * M.abs(Pv - Pid) / Pid, 0.02, 3), st.concat(['Difference: $\\dfrac{|' + fx(Pv, 4) + ' - ' + fx(Pid, 4) + '|}{' + fx(Pid, 4) + '} \\times 100 = ' + fx(100 * M.abs(Pv - Pid) / Pid, 2) + '\\%$ (' + (Pv < Pid ? 'lower: attractions win' : 'higher: the molecules\' volume wins') + ').']), 'Find both pressures, then the relative difference.', null, { k: 'pct', n: n, V: V, T: Tk, a: ab[0], b: ab[1] });
      return P(q + 'find the pressure with the van der Waals equation. Use a calculator.', ans(Pv, 0.01), st, 'Correct the volume by $nb$ and the pressure by $an^2/V^2$.', 'atm', { k: 'vdw', n: n, V: V, T: Tk, a: ab[0], b: ab[1] }); }
    if (shape === 'which') { var three = R.sample(Object.keys(VDWD), 3), hi = three.slice().sort(function (x, y) { return VDWD[y][0] - VDWD[x][0]; })[0];
      if (VDWD[hi][0] / VDWD[three.filter(function (x) { return x !== hi; }).sort(function (x, y) { return VDWD[y][0] - VDWD[x][0]; })[0]][0] < 1.15) three = ['He', 'N2', 'NH3'], hi = 'NH3';
      return P('At the same moderate temperature and pressure, which gas deviates most from ideal behavior: ' + lst(three.map(F)) + '?', mc(F(hi), three.filter(function (x) { return x !== hi; }).map(F)),
        ['At moderate conditions the deviation comes mostly from attractions between molecules, measured by the van der Waals constant $a$.', 'Values of $a$: ' + three.map(function (x) { return F(x) + ' ' + gx(VDWD[x][0]); }).join(', ') + ' L²·atm/mol².', F(hi) + ' has the strongest intermolecular forces and the largest $a$.'], 'Strongest intermolecular forces, biggest deviation.', null, { k: 'which', ans: hi }); }
    if (shape === 'cond') { var cq = R.pick([['Under which conditions does a real gas behave most like an ideal gas?', 'high temperature and low pressure', ['low temperature and high pressure', 'low temperature and low pressure', 'high temperature and high pressure']],
        ['Under which conditions does a real gas deviate most from ideal behavior?', 'low temperature and high pressure', ['high temperature and low pressure', 'high temperature and high pressure', 'room temperature and 1 atm']]]);
      return P(cq[0], mc(cq[1], cq[2]), ['At high temperature molecules move too fast for attractions to matter; at low pressure they are far apart, so their own volume is a tiny share of the container.', 'Low temperature and high pressure do the opposite: they bring a gas close to condensing.'], 'Think of what makes a gas condense.', null, { k: 'cond' }); }
    var t = R.pick([['At very high pressure, the volume of the gas molecules themselves makes the measured $PV$ larger than $nRT$.', true, 'The molecules fill part of the space, so the gas resists further squeezing.'],
      ['Attractions between molecules make a real gas push on the walls harder than an ideal gas would.', false, 'Attractions tug molecules back as they approach a wall, so they hit more softly: the pressure is lower.'],
      ['Helium is close to an ideal gas at room temperature and 1 atm.', true, 'Its atoms are tiny and attract each other very weakly ($a = 0.0341$).'],
      ['Real gases deviate most from ideal behavior at high temperature and low pressure.', false, 'Those are the conditions where gases are most ideal.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Size matters when crowded; attractions matter when slow.', null, { k: 'tf' });
  });


  // ================================================================== UNIT 8: REACTIONS IN SOLUTION
  // precipitation pairs: [cation salt, anion salt, precipitate, cation, anion, cations per precipitate, anions per precipitate, salt names]
  var PRECIP = [['AgNO3', 'NaCl', 'AgCl', 'Ag+', 'Cl-', 1, 1], ['AgNO3', 'KBr', 'AgBr', 'Ag+', 'Br-', 1, 1], ['AgNO3', 'NaI', 'AgI', 'Ag+', 'I-', 1, 1], ['Pb(NO3)2', 'KI', 'PbI2', 'Pb^2+', 'I-', 1, 2],
    ['BaCl2', 'Na2SO4', 'BaSO4', 'Ba^2+', 'SO4^2-', 1, 1], ['Ba(NO3)2', 'K2SO4', 'BaSO4', 'Ba^2+', 'SO4^2-', 1, 1], ['CaCl2', 'Na2CO3', 'CaCO3', 'Ca^2+', 'CO3^2-', 1, 1], ['Fe(NO3)3', 'NaOH', 'Fe(OH)3', 'Fe^3+', 'OH-', 1, 3],
    ['Cu(NO3)2', 'NaOH', 'Cu(OH)2', 'Cu^2+', 'OH-', 1, 2], ['MgCl2', 'KOH', 'Mg(OH)2', 'Mg^2+', 'OH-', 1, 2], ['Pb(NO3)2', 'Na2SO4', 'PbSO4', 'Pb^2+', 'SO4^2-', 1, 1], ['BaCl2', 'K2CO3', 'BaCO3', 'Ba^2+', 'CO3^2-', 1, 1]];
  function saltIons(f) { // [[ion, count]] for the salts above
    var T0 = { AgNO3: [['Ag+', 1], ['NO3-', 1]], NaCl: [['Na+', 1], ['Cl-', 1]], KBr: [['K+', 1], ['Br-', 1]], NaI: [['Na+', 1], ['I-', 1]], 'Pb(NO3)2': [['Pb^2+', 1], ['NO3-', 2]], KI: [['K+', 1], ['I-', 1]], BaCl2: [['Ba^2+', 1], ['Cl-', 2]],
      Na2SO4: [['Na+', 2], ['SO4^2-', 1]], 'Ba(NO3)2': [['Ba^2+', 1], ['NO3-', 2]], K2SO4: [['K+', 2], ['SO4^2-', 1]], CaCl2: [['Ca^2+', 1], ['Cl-', 2]], Na2CO3: [['Na+', 2], ['CO3^2-', 1]], 'Fe(NO3)3': [['Fe^3+', 1], ['NO3-', 3]],
      NaOH: [['Na+', 1], ['OH-', 1]], 'Cu(NO3)2': [['Cu^2+', 1], ['NO3-', 2]], MgCl2: [['Mg^2+', 1], ['Cl-', 2]], KOH: [['K+', 1], ['OH-', 1]], K2CO3: [['K+', 2], ['CO3^2-', 1]] };
    return T0[f];
  }
  function ionSide(list) { return list.map(function (x) { return (x[1] > 1 ? x[1] + '\\,' : '') + ft(x[0]); }).join(' + '); }
  function netTex(pr) { return (pr[5] > 1 ? pr[5] + '\\,' : '') + ft(pr[3]) + '(aq) + ' + (pr[6] > 1 ? pr[6] + '\\,' : '') + ft(pr[4]) + '(aq) \\to ' + ft(pr[2]) + '(s)'; }
  function spectators(pr) { var a = saltIons(pr[0]), b = saltIons(pr[1]); return [a.filter(function (x) { return x[0] !== pr[3]; })[0][0], b.filter(function (x) { return x[0] !== pr[4]; })[0][0]]; }
  var ACIDBASE = [['HCl', 'NaOH', '\\mathrm{H^+(aq)} + \\mathrm{OH^-(aq)} \\to \\mathrm{H_2O(l)}', ['\\mathrm{HCl(aq)} + \\mathrm{OH^-(aq)} \\to \\mathrm{Cl^-(aq)} + \\mathrm{H_2O(l)}', '\\mathrm{H^+(aq)} + \\mathrm{Cl^-(aq)} + \\mathrm{Na^+(aq)} + \\mathrm{OH^-(aq)} \\to \\mathrm{NaCl(aq)} + \\mathrm{H_2O(l)}', '\\mathrm{HCl(aq)} + \\mathrm{NaOH(aq)} \\to \\mathrm{NaCl(aq)} + \\mathrm{H_2O(l)}'], 'Both are strong: they are all ions, and $\\mathrm{Na^+}$ and $\\mathrm{Cl^-}$ are spectators.'],
    ['CH3COOH', 'NaOH', '\\mathrm{CH_3COOH(aq)} + \\mathrm{OH^-(aq)} \\to \\mathrm{CH_3COO^-(aq)} + \\mathrm{H_2O(l)}', ['\\mathrm{H^+(aq)} + \\mathrm{OH^-(aq)} \\to \\mathrm{H_2O(l)}', '\\mathrm{CH_3COO^-(aq)} + \\mathrm{Na^+(aq)} \\to \\mathrm{CH_3COONa(s)}', '\\mathrm{CH_3COOH(aq)} + \\mathrm{NaOH(aq)} \\to \\mathrm{CH_3COONa(aq)} + \\mathrm{H_2O(l)}'], 'Acetic acid is weak, so it is written as molecules; only $\\mathrm{Na^+}$ is a spectator.'],
    ['HCl', 'NH3', '\\mathrm{H^+(aq)} + \\mathrm{NH_3(aq)} \\to \\mathrm{NH_4^+(aq)}', ['\\mathrm{H^+(aq)} + \\mathrm{OH^-(aq)} \\to \\mathrm{H_2O(l)}', '\\mathrm{HCl(aq)} + \\mathrm{NH_3(aq)} \\to \\mathrm{NH_4Cl(s)}', '\\mathrm{H^+(aq)} + \\mathrm{Cl^-(aq)} + \\mathrm{NH_3(aq)} \\to \\mathrm{NH_4^+(aq)} + \\mathrm{Cl^-(aq)}'], 'Ammonia is a weak base, written as molecules; $\\mathrm{Cl^-}$ is a spectator.'],
    ['HCl', 'Na2CO3', '2\\,\\mathrm{H^+(aq)} + \\mathrm{CO_3^{2-}(aq)} \\to \\mathrm{CO_2(g)} + \\mathrm{H_2O(l)}', ['\\mathrm{H^+(aq)} + \\mathrm{OH^-(aq)} \\to \\mathrm{H_2O(l)}', '\\mathrm{Na_2CO_3(aq)} + 2\\,\\mathrm{HCl(aq)} \\to 2\\,\\mathrm{NaCl(aq)} + \\mathrm{CO_2(g)} + \\mathrm{H_2O(l)}', '2\\,\\mathrm{Na^+(aq)} + 2\\,\\mathrm{Cl^-(aq)} \\to 2\\,\\mathrm{NaCl(s)}'], 'The carbonic acid formed breaks down to $\\mathrm{CO_2}$ gas and water, both kept whole; $\\mathrm{Na^+}$ and $\\mathrm{Cl^-}$ are spectators.']];

  G('gchem1.net-ionic-equations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['precip', 'spect', 'net'], ['net', 'spect', 'precip', 'acid'], ['net', 'acid', 'tf', 'net']));
    if (shape === 'acid') { var ab = R.pick(ACIDBASE);
      return P('Which is the net ionic equation for the reaction of ' + F(ab[0]) + '(aq) with ' + F(ab[1]) + '(aq)?', mc('$' + ab[2] + '$', ab[3].map(function (x) { return '$' + x + '$'; })),
        [ab[4], 'Net ionic equation: $' + ab[2] + '$.'], 'Split only soluble strong electrolytes; keep weak acids, weak bases, water and gases whole.', null, { k: 'acid' }); }
    var pr = R.pick(PRECIP), sp = spectators(pr), A = saltIons(pr[0]), B = saltIons(pr[1]);
    var mol = ft(pr[0]) + '(aq) + ' + ft(pr[1]) + '(aq)';
    var full = ionSide(A) + ' + ' + ionSide(B);
    if (shape === 'precip') return P('Solutions of ' + F(pr[0]) + ' and ' + F(pr[1]) + ' are mixed and a precipitate forms. What is its formula?', fAns(pr[2]),
      ['Ions present: ' + lst(A.concat(B).map(function (x) { return F(x[0]); })) + '.', 'The insoluble combination is ' + F(pr[3]) + ' with ' + F(pr[4]) + ': ' + F(pr[2]) + '(s). The others (' + lst(sp.map(F)) + ') stay dissolved.'],
      'Swap partners; which new pair is insoluble?', null, { k: 'precip', f: pr[2] });
    if (shape === 'spect') { var right = lst(sp.map(F)), wrongs = [lst([pr[3], pr[4]].map(F)), lst([sp[0], pr[4]].map(F)), lst([pr[3], sp[1]].map(F))];
      return P('When ' + F(pr[0]) + '(aq) and ' + F(pr[1]) + '(aq) are mixed, ' + F(pr[2]) + ' precipitates. Which ions are spectators?', mc(right, wrongs),
        ['Complete ionic: $' + full + ' \\to ' + ft(pr[2]) + '(s) + \\ldots$', F(pr[3]) + ' and ' + F(pr[4]) + ' leave the solution in the solid; ' + right + ' are unchanged on both sides.'],
        'Spectators appear unchanged on both sides.', null, { k: 'spect' }); }
    if (shape === 'net') { var right3 = '$' + netTex(pr) + '$';
      var w1 = '$' + ionSide(A) + ' + ' + ionSide(B) + ' \\to ' + ft(pr[2]) + '(s) + ' + ionSide([[sp[0], A.filter(function (x) { return x[0] === sp[0]; })[0][1]], [sp[1], B.filter(function (x) { return x[0] === sp[1]; })[0][1]]]) + '$';
      var w2 = '$' + mol + ' \\to ' + ft(pr[2]) + '(s) + \\text{spectators}$';
      var w3 = '$' + ft(pr[3]) + '(aq) + ' + ft(pr[4]) + '(aq) \\to ' + ft(pr[3]) + '(aq) + ' + ft(pr[4]) + '(aq)$';
      var w4 = pr[6] > 1 ? '$' + ft(pr[3]) + '(aq) + ' + ft(pr[4]) + '(aq) \\to ' + ft(pr[2]) + '(s)$' : null;
      return P('Which is the net ionic equation for mixing ' + F(pr[0]) + '(aq) and ' + F(pr[1]) + '(aq)?', mc(right3, [w1, w4 || w3, w2].filter(Boolean)),
        ['Complete ionic: $' + full + ' \\to ' + ft(pr[2]) + '(s) + \\ldots$', 'Cancel the spectators (' + lst(sp.map(F)) + ').', 'Net: $' + netTex(pr) + '$, balanced in atoms and charge.'],
        'Keep only the ions that change.', null, { k: 'net' }); }
    var t = R.pick([['In a net ionic equation, a precipitate such as AgCl(s) is written as separate ions.', false, 'A solid is not dissolved, so it is written as a whole formula.'],
      ['The net ionic equation for any strong acid with any strong base is $\\mathrm{H^+} + \\mathrm{OH^-} \\to \\mathrm{H_2O}$.', true, 'All other ions are spectators.'],
      ['Acetic acid, a weak acid, is written as $\\mathrm{H^+} + \\mathrm{CH_3COO^-}$ in a complete ionic equation.', false, 'It is mostly un-ionized, so it is written as $\\mathrm{CH_3COOH}$.'],
      ['Spectator ions appear unchanged on both sides of the complete ionic equation.', true, 'That is why they cancel.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Only dissolved strong electrolytes are split into ions.', null, { k: 'tf' });
  });

  G('gchem1.solution-stoichiometry', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mass', 'vol', 'mass'], ['vol', 'mass', 'limit'], ['limit', 'left', 'vol']));
    var pr = R.pick(PRECIP), A = saltIons(pr[0]), B = saltIons(pr[1]), cA = A[0][1], aB = B.filter(function (x) { return x[0] === pr[4]; })[0][1];
    var Va = R.pick([20.0, 25.0, 30.0, 40.0, 50.0]), Ca = R.pick([0.100, 0.150, 0.200, 0.250]), Cb = R.pick([0.100, 0.150, 0.200, 0.300]), Mp = mm(pr[2]);
    var nCat = Va / 1000 * Ca * cA, eq = 'The net reaction is $' + netTex(pr) + '$.';
    if (shape === 'vol') { var nAn = nCat * pr[6] / pr[5], nSalt = nAn / aB, Vb = nSalt / Cb * 1000;
      return P('What volume of $' + qx(Cb, 'M') + '$ ' + F(pr[1]) + ' is needed to precipitate all the ' + F(pr[3]) + ' in $' + qx(Va, 'mL') + '$ of $' + qx(Ca, 'M') + '$ ' + F(pr[0]) + '? ' + eq, ans(Vb, 0.01),
        ['Moles of ' + F(pr[3]) + ': $' + gd(Va / 1000, 4) + '\\ \\text{L} \\times ' + fx(Ca) + '\\ \\text{M} = ' + qx(nCat, 'mol') + '$.', 'Moles of ' + F(pr[4]) + ' needed: $' + fx(nCat) + (pr[6] / pr[5] !== 1 ? ' \\times ' + pr[6] : '') + ' = ' + qx(nAn, 'mol') + '$' + (aB > 1 ? ', which is $' + fx(nAn) + '/' + aB + ' = ' + qx(nSalt, 'mol') + '$ of ' + F(pr[1]) : '') + '.', 'Volume: $' + dfr(fx(nSalt), fx(Cb)) + ' = ' + qx(nSalt / Cb, 'L') + ' = ' + qx(Vb, 'mL') + '$.'],
        'Moles from M × V (in liters), the ratio, then V = n/M.', 'mL', { k: 'vol', nCat: nCat, r: pr[6] / pr[5] / aB, Cb: Cb }); }
    if (shape === 'mass') { var np = nCat / pr[5], mp = np * Mp;
      return P('Excess ' + F(pr[1]) + ' solution is added to $' + qx(Va, 'mL') + '$ of $' + qx(Ca, 'M') + '$ ' + F(pr[0]) + '. What mass of ' + F(pr[2]) + ' ($' + qm(Mp) + '$) precipitates? ' + eq, ans(mp, 0.01),
        ['Moles of ' + F(pr[3]) + ': $' + gd(Va / 1000, 4) + ' \\times ' + fx(Ca) + ' = ' + qx(nCat, 'mol') + '$.', 'Each ' + F(pr[2]) + ' takes one ' + F(pr[3]) + ': $' + qx(np, 'mol') + '$ of ' + F(pr[2]) + '.', 'Mass: $' + fx(np) + ' \\times ' + mmx(Mp) + ' = ' + qx(mp, 'g') + '$.'],
        'M × V (L) gives moles; the other reactant is in excess.', 'g', { k: 'mass', n: np, M: Mp }); }
    var Vb2 = R.pick([20.0, 25.0, 30.0, 40.0, 50.0]), nAnion = Vb2 / 1000 * Cb * aB, needAn = nCat * pr[6] / pr[5], catLim = nAnion >= needAn, np2 = catLim ? nCat / pr[5] : nAnion / pr[6], mp2 = np2 * Mp;
    if (M.abs(nAnion - needAn) / needAn < 0.05) { Vb2 = Vb2 * 1.5; nAnion = Vb2 / 1000 * Cb * aB; catLim = nAnion >= needAn; np2 = catLim ? nCat / pr[5] : nAnion / pr[6]; mp2 = np2 * Mp; }
    var stL = ['Moles of ' + F(pr[3]) + ': $' + gd(Va / 1000, 4) + ' \\times ' + fx(Ca) + ' = ' + qx(nCat, 'mol') + '$. Moles of ' + F(pr[4]) + ': $' + gd(Vb2 / 1000, 4) + ' \\times ' + fx(Cb) + (aB > 1 ? ' \\times ' + aB : '') + ' = ' + qx(nAnion, 'mol') + '$.',
      'The ' + F(pr[3]) + ' needs $' + qx(needAn, 'mol') + '$ of ' + F(pr[4]) + '; there is ' + (catLim ? 'enough, so ' + F(pr[3]) + ' is limiting' : 'not enough, so ' + F(pr[4]) + ' is limiting') + '.'];
    if (shape === 'limit') return P('$' + qx(Va, 'mL') + '$ of $' + qx(Ca, 'M') + '$ ' + F(pr[0]) + ' is mixed with $' + qx(Vb2, 'mL') + '$ of $' + qx(Cb, 'M') + '$ ' + F(pr[1]) + '. What mass of ' + F(pr[2]) + ' ($' + qm(Mp) + '$) forms? ' + eq, ans(mp2, 0.01),
      stL.concat(['$' + qx(np2, 'mol') + '$ of ' + F(pr[2]) + ' $\\times ' + mmx(Mp) + ' = ' + qx(mp2, 'g') + '$.']), 'Find moles of each ion, then which runs out first.', 'g', { k: 'limit', nCat: nCat, nAn: nAnion, c: pr[5], a: pr[6], M: Mp });
    var leftIon = catLim ? pr[4] : pr[3], leftN = catLim ? nAnion - needAn : nCat - nAnion * pr[5] / pr[6], Vt = (Va + Vb2) / 1000;
    return P('$' + qx(Va, 'mL') + '$ of $' + qx(Ca, 'M') + '$ ' + F(pr[0]) + ' is mixed with $' + qx(Vb2, 'mL') + '$ of $' + qx(Cb, 'M') + '$ ' + F(pr[1]) + ', and ' + F(pr[2]) + ' precipitates. ' + eq + ' What is the concentration of the excess ion, ' + F(leftIon) + ', left in solution?', ans(leftN / Vt, 0.02),
      stL.concat(['Left over: $' + qx(leftN, 'mol') + '$ of ' + F(leftIon) + ' in $' + gd(Vt, 4) + '\\ \\text{L}$ of mixture.', '$[' + ft(leftIon) + '] = ' + dfr(fx(leftN), gd(Vt, 4)) + ' = ' + qx(leftN / Vt, 'M') + '$.']), 'Subtract the moles used, then divide by the total volume.', 'M', { k: 'left', n: leftN, V: Vt });
  });

  // gravimetric: [ion or element sought, precipitate, mass of sought part in one formula unit, label]
  var GRAV = [['Cl', 'AgCl', 35.45, 'chloride'], ['S', 'BaSO4', 32.07, 'sulfur'], ['Ba', 'BaSO4', 137.33, 'barium'], ['Ag', 'AgCl', 107.87, 'silver'], ['SO4', 'BaSO4', 96.07, 'sulfate'], ['Br', 'AgBr', 79.90, 'bromide']];
  var GRAVC = [['NaCl', 'Cl', 'AgCl'], ['KCl', 'Cl', 'AgCl'], ['CaCl2', 'Cl', 'AgCl'], ['Na2SO4', 'S', 'BaSO4'], ['K2SO4', 'S', 'BaSO4'], ['MgSO4', 'S', 'BaSO4'], ['BaCl2', 'Ba', 'BaSO4'], ['KBr', 'Br', 'AgBr']];

  G('gchem1.gravimetric-analysis', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['pct', 'pct', 'massIon'], ['pct', 'compound', 'expect'], ['compound', 'expect', 'pct']));
    if (shape === 'pct' || shape === 'massIon') { var g = R.pick(GRAV), Mp = mm(g[1]), frac = g[2] / Mp, ms = R.pick([0.2500, 0.4000, 0.5000, 0.7500, 1.0000]), pctT = R.int(15, 65) / 100, mp = sgf(ms * pctT / frac, 4), mI = mp * frac;
      if (shape === 'massIon') return P('A sample is treated with excess reagent and gives $' + qx(mp, 'g', 4) + '$ of dry ' + F(g[1]) + ' ($' + qm(Mp) + '$). What mass of ' + g[3] + ' did the sample contain?', ans(mI, 0.01),
        [cap(g[3]) + '\'s share of ' + F(g[1]) + ': $' + dfr(gd(g[2], 2), mmx(Mp)) + ' = ' + fx(frac, 4) + '$.', 'Mass: $' + fx(mp, 4) + ' \\times ' + fx(frac, 4) + ' = ' + qx(mI, 'g', 4) + '$.'], 'Multiply by the fraction of the precipitate that is ' + g[3] + '.', 'g', { k: 'gm', mp: mp, f: frac });
      return P('A $' + qd(ms, 4, 'g') + '$ sample is dissolved, and all its ' + g[3] + ' is precipitated as ' + F(g[1]) + ' ($' + qm(Mp) + '$). The dried precipitate weighs $' + qx(mp, 'g', 4) + '$. What percent of the sample is ' + g[3] + '?', pctAns(100 * mI / ms, 0.01),
        [cap(g[3]) + '\'s share of ' + F(g[1]) + ': $' + dfr(gd(g[2], 2), mmx(Mp)) + ' = ' + fx(frac, 4) + '$.', 'Mass of ' + g[3] + ': $' + fx(mp, 4) + ' \\times ' + fx(frac, 4) + ' = ' + qx(mI, 'g', 4) + '$.', 'Percent: $' + dfr(fx(mI, 4), gd(ms, 4)) + ' \\times 100 = ' + fx(100 * mI / ms, 3) + '\\%$.'],
        'The precipitate is not all ' + g[3] + ': find its share first.', null, { k: 'gpct', mp: mp, f: frac, ms: ms }); }
    var c = R.pick(GRAVC), Mc = mm(c[0]), Mp2 = mm(c[2]), k = parseF(c[0]).atoms[c[1]], ms2 = R.pick([0.5000, 0.8000, 1.0000, 1.5000]), wf = R.int(20, 90) / 100;
    if (shape === 'compound') { var mp3 = sgf(ms2 * wf / Mc * k * Mp2, 4), nPre = mp3 / Mp2, nCmp = nPre / k, mC = nCmp * Mc;
      return P('A $' + qd(ms2, 4, 'g') + '$ mixture contains ' + F(c[0]) + ' ($' + qm(Mc) + '$) and substances with no ' + (c[1] === 'S' ? 'sulfate' : c[1] === 'Cl' ? 'chloride' : c[1] === 'Br' ? 'bromide' : 'barium') + '. Precipitating it gives $' + qx(mp3, 'g', 4) + '$ of ' + F(c[2]) + ' ($' + qm(Mp2) + '$). What percent of the mixture is ' + F(c[0]) + '?', pctAns(100 * mC / ms2, 0.01),
        ['Moles of ' + F(c[2]) + ': $' + dfr(fx(mp3, 4), mmx(Mp2)) + ' = ' + qx(nPre, 'mol', 4) + '$.', 'Each ' + F(c[0]) + ' gives ' + k + ' ' + F(c[2]) + ': $' + qx(nCmp, 'mol', 4) + '$ of ' + F(c[0]) + ', which is $' + fx(nCmp, 4) + ' \\times ' + mmx(Mc) + ' = ' + qx(mC, 'g', 4) + '$.', 'Percent: $' + dfr(fx(mC, 4), gd(ms2, 4)) + ' \\times 100 = ' + fx(100 * mC / ms2, 3) + '\\%$.'],
        'Moles of precipitate, then the ratio to the compound, then grams.', null, { k: 'gcmp', mp: mp3, Mp: Mp2, kk: k, Mc: Mc, ms: ms2 }); }
    var mCe = ms2 * wf, mpE = mCe / Mc * k * Mp2;
    return P('A $' + qd(ms2, 4, 'g') + '$ sample is ' + gd(wf * 100, 1) + '% ' + F(c[0]) + ' ($' + qm(Mc) + '$) by mass. What mass of ' + F(c[2]) + ' ($' + qm(Mp2) + '$) should precipitate when it is treated with excess reagent?', ans(mpE, 0.01),
      ['Mass of ' + F(c[0]) + ': $' + gd(ms2, 4) + ' \\times ' + gd(wf, 3) + ' = ' + qx(mCe, 'g', 4) + '$, which is $' + qx(mCe / Mc, 'mol', 4) + '$.', 'It gives ' + k + ' ' + F(c[2]) + ' per formula unit: $' + qx(mCe / Mc * k, 'mol', 4) + '$, which is $' + qx(mpE, 'g') + '$.'],
      'Grams to moles of the compound, the ratio, then grams of precipitate.', 'g', { k: 'gexp', m: mCe, Mc: Mc, kk: k, Mp: Mp2 });
  });

  // acids for titration: [formula, name, acidic H per molecule, molar mass]
  var TACID = [['HCl', 'hydrochloric acid', 1], ['HNO3', 'nitric acid', 1], ['CH3COOH', 'acetic acid', 1], ['H2SO4', 'sulfuric acid', 2], ['H2C2O4', 'oxalic acid', 2], ['H3PO4', 'phosphoric acid (titrated to its second equivalence point)', 2]];
  function v2(x) { return gd(x, 2); }

  G('gchem1.titration-calculations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['acidM', 'acidM', 'vol'], ['acidM', 'diprotic', 'baseM', 'vol'], ['diprotic', 'molar', 'khp', 'baseM']));
    var Cb = R.pick([0.1000, 0.1250, 0.1500, 0.2000, 0.0950]), Va = R.pick([10.00, 20.00, 25.00, 50.00]);
    if (shape === 'acidM' || shape === 'diprotic' || shape === 'vol') { var a = R.pick(shape === 'diprotic' ? TACID.slice(3, 5) : TACID.slice(0, 3)), Ca, na, nb, Vb, tries = 0;
      do { Ca = R.pick([0.0800, 0.1000, 0.1200, 0.1500, 0.2000]); Va = R.pick([10.00, 20.00, 25.00]); na = Va / 1000 * Ca; nb = na * a[2]; Vb = rd(nb / Cb * 1000, 2); tries++; } while ((Vb < 10 || Vb > 48) && tries < 40);
      var nbg = Vb / 1000 * Cb, naf = nbg / a[2], Cf = naf / (Va / 1000);
      var eqA = a[2] === 2 ? eqT(a[0] + ' + 2NaOH -> ' + (a[0] === 'H2SO4' ? 'Na2SO4' : 'Na2C2O4') + ' + 2H2O') : eqT(a[0] + ' + NaOH -> ' + (a[0] === 'CH3COOH' ? 'CH3COONa' : a[0] === 'HCl' ? 'NaCl' : 'NaNO3') + ' + H2O');
      if (shape === 'vol') return P('What volume of $' + qx(Cb, 'M', 4) + '$ NaOH is needed to reach the equivalence point with $' + qd(Va, 2, 'mL') + '$ of $' + qx(Ca, 'M') + '$ ' + F(a[0]) + '?', ans(nb / Cb * 1000, 0.01),
        ['Moles of acid: $' + gd(Va / 1000, 5) + ' \\times ' + fx(Ca) + ' = ' + qx(na, 'mol', 4) + '$.', '$' + eqA + '$: ' + (a[2] === 2 ? '2 mol NaOH per mol acid, so $' + qx(nb, 'mol', 4) + '$.' : '1 : 1.'), 'Volume: $' + dfr(fx(nb, 4), fx(Cb, 4)) + ' = ' + qx(nb / Cb * 1000, 'mL', 4) + '$.'],
        'Moles of acid, the ratio, then V = n/M.', 'mL', { k: 'tvol', na: na, r: a[2], Cb: Cb });
      return P('$' + qd(Va, 2, 'mL') + '$ of ' + a[1] + ' (' + F(a[0]) + ') needs $' + qd(Vb, 2, 'mL') + '$ of $' + qx(Cb, 'M', 4) + '$ NaOH to reach the equivalence point. Find the concentration of the acid.', ans(Cf, 0.01),
        ['Moles of NaOH: $' + gd(Vb / 1000, 5) + '\\ \\text{L} \\times ' + fx(Cb, 4) + '\\ \\text{M} = ' + qx(nbg, 'mol', 4) + '$.', '$' + eqA + '$' + (a[2] === 2 ? ': moles of acid $= ' + fx(nbg, 4) + '/2 = ' + qx(naf, 'mol', 4) + '$.' : ': 1 : 1, so $' + qx(naf, 'mol', 4) + '$ of acid.'), 'Divide by the acid sample\'s volume: $' + dfr(fx(naf, 4), gd(Va / 1000, 5)) + ' = ' + qx(Cf, 'M', 4) + '$.'],
        'Moles of base, the ratio, then divide by the volume of acid.', 'M', { k: 'tacid', Vb: Vb, Cb: Cb, r: a[2], Va: Va }); }
    if (shape === 'baseM') { var Ch = R.pick([0.1000, 0.1200, 0.0800]), Cx = R.pick([0.0900, 0.1100, 0.1500, 0.2000]), base = R.pick([['NaOH', 1], ['KOH', 1], ['Ba(OH)2', 2]]), nB = Va / 1000 * Cx, Vh = rd(nB * base[1] / Ch * 1000, 2), nH = Vh / 1000 * Ch, Cfx = nH / base[1] / (Va / 1000);
      return P('$' + qd(Va, 2, 'mL') + '$ of ' + F(base[0]) + ' solution needs $' + qd(Vh, 2, 'mL') + '$ of $' + qx(Ch, 'M', 4) + '$ HCl to reach the equivalence point. Find the concentration of ' + F(base[0]) + '.', ans(Cfx, 0.01),
        ['Moles of HCl: $' + gd(Vh / 1000, 5) + ' \\times ' + fx(Ch, 4) + ' = ' + qx(nH, 'mol', 4) + '$.', base[1] === 2 ? '$\\mathrm{Ba(OH)_2} + 2\\,\\mathrm{HCl} \\to \\mathrm{BaCl_2} + 2\\,\\mathrm{H_2O}$: moles of base $= ' + fx(nH, 4) + '/2 = ' + qx(nH / 2, 'mol', 4) + '$.' : '1 : 1, so $' + qx(nH, 'mol', 4) + '$ of base.', 'Concentration: $' + dfr(fx(nH / base[1], 4), gd(Va / 1000, 5)) + ' = ' + qx(Cfx, 'M', 4) + '$.'],
        'Moles of acid, the ratio, then divide by the base sample\'s volume.', 'M', { k: 'tbase', Vh: Vh, Ch: Ch, r: base[1], Va: Va }); }
    if (shape === 'khp') { var g = R.pick([0.4085, 0.5106, 0.6127, 0.7148]), nK = g / 204.23, Vx = rd(nK / Cb * 1000, 2), Cfk = nK / (Vx / 1000);
      return P('$' + qd(g, 4, 'g') + '$ of potassium hydrogen phthalate (KHP, $204.23\\ \\text{g/mol}$, one acidic hydrogen) is neutralized by $' + qd(Vx, 2, 'mL') + '$ of NaOH. Find the concentration of the NaOH.', ans(Cfk, 0.01),
        ['Moles of KHP: $' + dfr(gd(g, 4), '204.23') + ' = ' + qx(nK, 'mol', 4) + '$.', '1 : 1, so the same moles of NaOH in $' + gd(Vx / 1000, 5) + '\\ \\text{L}$.', '$M = ' + dfr(fx(nK, 4), gd(Vx / 1000, 5)) + ' = ' + qx(Cfk, 'M', 4) + '$.'],
        'Grams of KHP to moles; 1 : 1 with NaOH.', 'M', { k: 'khp', g: g, V: Vx }); }
    var trueM = R.pick([60.05, 122.12, 88.11, 150.09, 176.12, 74.08]), gu = R.pick([0.2500, 0.3000, 0.4000, 0.5000]), nU = gu / trueM, Vu = rd(nU / Cb * 1000, 2), nUf = Vu / 1000 * Cb, Mfu = gu / nUf;
    return P('A $' + qd(gu, 4, 'g') + '$ sample of an unknown acid with one acidic hydrogen needs $' + qd(Vu, 2, 'mL') + '$ of $' + qx(Cb, 'M', 4) + '$ NaOH for complete neutralization. Find the acid\'s molar mass.', ans(Mfu, 0.01),
      ['Moles of NaOH: $' + gd(Vu / 1000, 5) + ' \\times ' + fx(Cb, 4) + ' = ' + qx(nUf, 'mol', 4) + '$.', 'One acidic H: the same moles of acid.', 'Molar mass: $' + dfr(gd(gu, 4) + '\\ \\text{g}', fx(nUf, 4) + '\\ \\text{mol}') + ' = ' + qx(Mfu, 'gmol', 4) + '$.'],
      'Moles from the titration, then grams per mole.', 'gmol', { k: 'tmolar', g: gu, V: Vu, Cb: Cb });
  });

  // oxidation numbers: [species, element, value]
  var OXN = [['H2SO4', 'S', 6], ['SO3^2-', 'S', 4], ['SO2', 'S', 4], ['H2S', 'S', -2], ['S8', 'S', 0], ['Na2S2O3', 'S', 2], ['Cr2O7^2-', 'Cr', 6], ['CrO4^2-', 'Cr', 6], ['Cr2O3', 'Cr', 3], ['MnO4-', 'Mn', 7], ['MnO2', 'Mn', 4], ['KMnO4', 'Mn', 7],
    ['NH4+', 'N', -3], ['NO3-', 'N', 5], ['NO2', 'N', 4], ['N2O', 'N', 1], ['HNO2', 'N', 3], ['N2H4', 'N', -2], ['NH3', 'N', -3], ['CH4', 'C', -4], ['CO2', 'C', 4], ['CO', 'C', 2], ['CH3OH', 'C', -2], ['C2O4^2-', 'C', 3],
    ['ClO4-', 'Cl', 7], ['ClO3-', 'Cl', 5], ['ClO-', 'Cl', 1], ['HClO2', 'Cl', 3], ['H2O2', 'O', -1], ['OF2', 'O', 2], ['NaH', 'H', -1], ['PO4^3-', 'P', 5], ['H3PO3', 'P', 3], ['Fe2O3', 'Fe', 3], ['IO3-', 'I', 5], ['CaH2', 'H', -1], ['Na2O2', 'O', -1], ['K2Cr2O7', 'Cr', 6],
    ['HSO4-', 'S', 6], ['H2SO3', 'S', 4], ['NO2-', 'N', 3], ['N2O5', 'N', 5], ['NO', 'N', 2], ['MnO4^2-', 'Mn', 6], ['Mn2O7', 'Mn', 7], ['CrO3', 'Cr', 6], ['H3PO4', 'P', 5], ['P4O10', 'P', 5], ['HClO4', 'Cl', 7], ['IO4-', 'I', 7], ['C2H6', 'C', -3], ['C2H4', 'C', -2], ['C2H2', 'C', -1], ['CH2O', 'C', 0], ['HCOOH', 'C', 2]];
  var KNOWN = { O: -2, H: 1, F: -1, Na: 1, K: 1, Ca: 2 };
  function oxSteps(sp, el, v) {
    var p0 = parseF(sp), parts = [], sum = 0;
    Object.keys(p0.atoms).forEach(function (e) { if (e === el) return; var o = e === 'O' && /O2(\^|$)|H2O2|Na2O2/.test(sp) && el !== 'O' ? -2 : KNOWN[e]; if (sp === 'OF2' && e === 'F') o = -1; if ((sp === 'NaH' || sp === 'CaH2') && e === 'H') o = -1; parts.push(p0.atoms[e] + ' ' + e + ' at $' + (o > 0 ? '+' : '') + o + '$'); sum += p0.atoms[e] * o; });
    var n = p0.atoms[el];
    return [parts.length ? 'Known: ' + lst(parts) + ': total $' + (sum > 0 ? '+' : '') + sum + '$.' : 'The only element is ' + el + '.', 'The sum must equal the charge, $' + p0.charge + '$: $' + (n > 1 ? n : '') + 'x' + (sum === 0 ? '' : sum > 0 ? ' + ' + sum : ' - ' + (-sum)) + ' = ' + p0.charge + '$, so $x = ' + (v > 0 ? '+' : '') + v + '$.'];
  }

  G('gchem1.oxidation-numbers', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['ox', 'ox', 'tf'], ['ox', 'ox', 'highest', 'tf'], ['ox', 'highest', 'change']));
    var pool = OXN.filter(function (o) { return ['NaH', 'CaH2', 'OF2', 'H2O2', 'Na2O2'].indexOf(o[0]) < 0 || ctx.level > 1; }), o = R.pick(pool);
    if (shape === 'ox') { var st = ['NaH', 'CaH2'].indexOf(o[0]) >= 0 ? ['In a metal hydride, the metal has its usual positive number (' + (o[0] === 'NaH' ? 'Na $+1$' : 'Ca $+2$') + '), so H must be negative.', 'Sum: ' + (o[0] === 'NaH' ? '$+1 + x = 0$' : '$+2 + 2x = 0$') + ', so $x = -1$.'] : o[0] === 'OF2' ? ['F is always $-1$: two of them, $-2$.', '$x - 2 = 0$, so $x = +2$ (one of the rare cases where O is positive).'] : ['H2O2', 'Na2O2'].indexOf(o[0]) >= 0 ? ['A peroxide: ' + (o[0] === 'H2O2' ? 'H is $+1$ (two of them, $+2$)' : 'Na is $+1$ (two of them, $+2$)') + '.', '$2x + 2 = 0$, so $x = -1$ for each O.'] : o[0] === 'S8' ? ['A pure element: every atom is 0.'] : oxSteps(o[0], o[1], o[2]);
      return P('What is the oxidation number of ' + o[1] + ' in ' + F(o[0]) + '?', exact(o[2]), st, 'Use the known values (O $-2$, H $+1$, group 1 $+1$…) and make the total equal the charge.', null, { k: 'ox', f: o[0], el: o[1], v: o[2] }); }
    if (shape === 'highest') { var el = R.pick(['N', 'S', 'Cl', 'C', 'Cr', 'Mn']), cands = OXN.filter(function (x) { return x[1] === el && ['NaH', 'CaH2'].indexOf(x[0]) < 0; }), three = R.sample(cands, M.min(3, cands.length));
      var vals = three.map(function (x) { return x[2]; }); if (new Set(vals).size < vals.length) { three = cands.filter(function (x, i, a) { return a.findIndex(function (y) { return y[2] === x[2]; }) === i; }).slice(0, 3); }
      var hi = three.slice().sort(function (a, b) { return b[2] - a[2]; })[0];
      return P('In which species does ' + el + ' have the highest oxidation number: ' + lst(three.map(function (x) { return F(x[0]); })) + '?', mc(F(hi[0]), three.filter(function (x) { return x !== hi; }).map(function (x) { return F(x[0]); })),
        three.map(function (x) { return F(x[0]) + ': ' + el + ' is $' + (x[2] > 0 ? '+' : '') + x[2] + '$'; }).concat(['Highest: ' + F(hi[0]) + '.']), 'Work out each one.', null, { k: 'hi', el: el }); }
    if (shape === 'change') { var ch = R.pick([['NO3-', 'NO', 'N', 5, 2], ['MnO4-', 'Mn^2+', 'Mn', 7, 2], ['Cr2O7^2-', 'Cr^3+', 'Cr', 6, 3], ['SO2', 'SO4^2-', 'S', 4, 6], ['H2S', 'S8', 'S', -2, 0], ['NH3', 'NO2', 'N', -3, 4], ['ClO3-', 'Cl-', 'Cl', 5, -1], ['C2O4^2-', 'CO2', 'C', 3, 4]]), d = ch[4] - ch[3];
      return P('When ' + F(ch[0]) + ' becomes ' + F(ch[1]) + ', by how much does the oxidation number of ' + ch[2] + ' change? (Include the sign: positive for an increase.)', exact(d),
        ['In ' + F(ch[0]) + ': ' + ch[2] + ' is $' + (ch[3] > 0 ? '+' : '') + ch[3] + '$. In ' + F(ch[1]) + ': $' + (ch[4] > 0 ? '+' : '') + ch[4] + '$.', 'Change: $' + (d > 0 ? '+' : '') + d + '$: ' + (d > 0 ? 'an increase, so ' + ch[2] + ' is oxidized (loses ' + d + ' electrons per atom).' : 'a decrease, so ' + ch[2] + ' is reduced (gains ' + (-d) + ' electrons per atom).')],
        'Find the oxidation number before and after.', null, { k: 'chg', d: d }); }
    var t = R.pick([['In $\\mathrm{SO_4^{2-}}$, every atom has an oxidation number of $-2$.', false, 'Only the oxygens are $-2$; sulfur is $+6$, so the total is $+6 - 8 = -2$.'],
      ['The oxidation numbers of the atoms in a neutral compound add up to zero.', true, 'Every electron is assigned to some atom, so the totals match the charge.'],
      ['The oxidation number of an atom in a pure element, such as $\\mathrm{O_2}$ or $\\mathrm{Fe}$, is zero.', true, 'Identical atoms share bonding electrons equally.'],
      ['Oxygen is $-2$ in every compound.', false, 'In peroxides such as $\\mathrm{H_2O_2}$ it is $-1$, and in $\\mathrm{OF_2}$ it is $+2$.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'The numbers must add up to the overall charge.', null, { k: 'tf' });
  });

  // redox reactions: [equation, oxidized, reduced, electrons transferred as written]
  var RDX = [['Zn + Cu^2+ -> Zn^2+ + Cu', 'Zn', 'Cu^2+', 2], ['2Mg + O2 -> 2MgO', 'Mg', 'O2', 4], ['Cl2 + 2Br- -> 2Cl- + Br2', 'Br-', 'Cl2', 2], ['Fe + 2Ag+ -> Fe^2+ + 2Ag', 'Fe', 'Ag+', 2], ['2Na + Cl2 -> 2NaCl', 'Na', 'Cl2', 2],
    ['Cu + 2Ag+ -> Cu^2+ + 2Ag', 'Cu', 'Ag+', 2], ['2Al + 3Cu^2+ -> 2Al^3+ + 3Cu', 'Al', 'Cu^2+', 6], ['2Fe^3+ + Sn^2+ -> 2Fe^2+ + Sn^4+', 'Sn^2+', 'Fe^3+', 2], ['CH4 + 2O2 -> CO2 + 2H2O', 'CH4', 'O2', 8], ['2H2 + O2 -> 2H2O', 'H2', 'O2', 4], ['Mg + 2H+ -> Mg^2+ + H2', 'Mg', 'H+', 2], ['2Al + Fe2O3 -> Al2O3 + 2Fe', 'Al', 'Fe2O3', 6],
    ['Zn + 2H+ -> Zn^2+ + H2', 'Zn', 'H+', 2], ['Cu + Cl2 -> CuCl2', 'Cu', 'Cl2', 2], ['2Fe + 3Cl2 -> 2FeCl3', 'Fe', 'Cl2', 6], ['4Fe + 3O2 -> 2Fe2O3', 'Fe', 'O2', 12], ['Ni + Cu^2+ -> Ni^2+ + Cu', 'Ni', 'Cu^2+', 2],
    ['Cl2 + 2I- -> 2Cl- + I2', 'I-', 'Cl2', 2], ['Br2 + 2I- -> 2Br- + I2', 'I-', 'Br2', 2], ['C + O2 -> CO2', 'C', 'O2', 4], ['S + O2 -> SO2', 'S', 'O2', 4]];
  var NONRDX = ['AgNO3 + NaCl -> AgCl + NaNO3', 'HCl + NaOH -> NaCl + H2O', 'CaCO3 -> CaO + CO2', 'BaCl2 + Na2SO4 -> BaSO4 + 2NaCl', 'NaOH + HNO3 -> NaNO3 + H2O', 'Pb(NO3)2 + 2KI -> PbI2 + 2KNO3', 'CaO + H2O -> Ca(OH)2', 'NH3 + HCl -> NH4Cl'];

  G('gchem1.redox-reactions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['oxd', 'oxd', 'isredox'], ['agent', 'oxd', 'e', 'isredox'], ['agent', 'e', 'redagent', 'isredox']));
    var r = R.pick(RDX), sp = r[0].split(/\s*->\s*/)[0].split(/\s+\+\s+/).map(function (x) { return x.replace(/^\d+/, ''); }), q = 'In the reaction $' + eqT(r[0]) + '$, ';
    var st = [F(r[1]) + ' loses electrons (its oxidation number rises): it is oxidized, so it is the reducing agent.', F(r[2]) + ' gains electrons (its oxidation number falls): it is reduced, so it is the oxidizing agent.'];
    if (shape === 'oxd') return P(q + 'which reactant is oxidized?', mcK(sp.map(F).concat(['neither']), sp.indexOf(r[1])), st, 'Oxidation is loss of electrons: whose oxidation number goes up?', null, { k: 'oxd' });
    if (shape === 'agent') return P(q + 'which reactant is the oxidizing agent?', mcK(sp.map(F).concat(['neither']), sp.indexOf(r[2])), st, 'The oxidizing agent is the one that gets reduced.', null, { k: 'agent' });
    if (shape === 'redagent') return P(q + 'which reactant is the reducing agent?', mcK(sp.map(F).concat(['neither']), sp.indexOf(r[1])), st, 'The reducing agent is the one that gets oxidized.', null, { k: 'redagent' });
    if (shape === 'e') return P(q + 'how many electrons are transferred as the equation is written?', exact(r[3]), st.concat(['Count the change in oxidation number times the number of atoms that change: ' + r[3] + ' electrons lost and ' + r[3] + ' gained.']), 'Electrons lost must equal electrons gained.', null, { k: 'e', n: r[3] });
    var yes = R.coin(), eq = yes ? r[0] : R.pick(NONRDX);
    return P('True or false: $' + eqT(eq) + '$ is an oxidation–reduction reaction.', tf(yes),
      yes ? st : ['No element changes its oxidation number: ions just change partners (or a compound breaks apart), with no electrons transferred.'], 'Does any oxidation number change?', null, { k: 'isredox' });
  });

  // balanced redox equations: [medium, species (reactants then products), coefficients, electrons transferred, skeleton]
  var BRX = [
    ['acidic', ['MnO4-', 'Fe^2+', 'H+', 'Mn^2+', 'Fe^3+', 'H2O'], [1, 5, 8, 1, 5, 4], 5, 'MnO4- + Fe^2+ -> Mn^2+ + Fe^3+'],
    ['acidic', ['Cr2O7^2-', 'Fe^2+', 'H+', 'Cr^3+', 'Fe^3+', 'H2O'], [1, 6, 14, 2, 6, 7], 6, 'Cr2O7^2- + Fe^2+ -> Cr^3+ + Fe^3+'],
    ['acidic', ['Cr2O7^2-', 'I-', 'H+', 'Cr^3+', 'I2', 'H2O'], [1, 6, 14, 2, 3, 7], 6, 'Cr2O7^2- + I- -> Cr^3+ + I2'],
    ['acidic', ['MnO4-', 'C2O4^2-', 'H+', 'Mn^2+', 'CO2', 'H2O'], [2, 5, 16, 2, 10, 8], 10, 'MnO4- + C2O4^2- -> Mn^2+ + CO2'],
    ['acidic', ['Cu', 'NO3-', 'H+', 'Cu^2+', 'NO', 'H2O'], [3, 2, 8, 3, 2, 4], 6, 'Cu + NO3- -> Cu^2+ + NO'],
    ['acidic', ['MnO4-', 'H2O2', 'H+', 'Mn^2+', 'O2', 'H2O'], [2, 5, 6, 2, 5, 8], 10, 'MnO4- + H2O2 -> Mn^2+ + O2'],
    ['acidic', ['Zn', 'NO3-', 'H+', 'Zn^2+', 'NH4+', 'H2O'], [4, 1, 10, 4, 1, 3], 8, 'Zn + NO3- -> Zn^2+ + NH4+'],
    ['acidic', ['IO3-', 'I-', 'H+', 'I2', 'H2O'], [1, 5, 6, 3, 3], 5, 'IO3- + I- -> I2'],
    ['acidic', ['H2O2', 'Fe^2+', 'H+', 'Fe^3+', 'H2O'], [1, 2, 2, 2, 2], 2, 'H2O2 + Fe^2+ -> Fe^3+ + H2O'],
    ['basic', ['MnO4-', 'I-', 'H2O', 'MnO2', 'I2', 'OH-'], [2, 6, 4, 2, 3, 8], 6, 'MnO4- + I- -> MnO2 + I2'],
    ['basic', ['Cr(OH)3', 'ClO3-', 'OH-', 'CrO4^2-', 'Cl-', 'H2O'], [2, 1, 4, 2, 1, 5], 6, 'Cr(OH)3 + ClO3- -> CrO4^2- + Cl-'],
    ['basic', ['MnO4-', 'SO3^2-', 'H2O', 'MnO2', 'SO4^2-', 'OH-'], [2, 3, 1, 2, 3, 2], 6, 'MnO4- + SO3^2- -> MnO2 + SO4^2-'],
    ['acidic', ['Sn^2+', 'Fe^3+', 'Sn^4+', 'Fe^2+'], [1, 2, 1, 2], 2, 'Sn^2+ + Fe^3+ -> Sn^4+ + Fe^2+'],
    ['acidic', ['Al', 'Cu^2+', 'Al^3+', 'Cu'], [2, 3, 2, 3], 6, 'Al + Cu^2+ -> Al^3+ + Cu'],
    ['acidic', ['MnO4-', 'Sn^2+', 'H+', 'Mn^2+', 'Sn^4+', 'H2O'], [2, 5, 16, 2, 5, 8], 10, 'MnO4- + Sn^2+ -> Mn^2+ + Sn^4+'],
    ['acidic', ['Cr2O7^2-', 'H2O2', 'H+', 'Cr^3+', 'O2', 'H2O'], [1, 3, 8, 2, 3, 7], 6, 'Cr2O7^2- + H2O2 -> Cr^3+ + O2'],
    ['acidic', ['ClO-', 'I-', 'H+', 'Cl-', 'I2', 'H2O'], [1, 2, 2, 1, 1, 1], 2, 'ClO- + I- -> Cl- + I2'],
    ['acidic', ['Ag', 'NO3-', 'H+', 'Ag+', 'NO', 'H2O'], [3, 1, 4, 3, 1, 2], 3, 'Ag + NO3- -> Ag+ + NO'],
    ['basic', ['Cl2', 'OH-', 'Cl-', 'ClO-', 'H2O'], [1, 2, 1, 1, 1], 1, 'Cl2 -> Cl- + ClO-']
  ];
  function brxTex(b) { var nr = b[1].length - (b[1].indexOf(b[4].split(' -> ')[1].split(' + ')[0])); var prodStart = b[1].indexOf(b[4].split(' -> ')[1].split(' + ')[0]); return b[1].map(function (s, i) { return (b[2][i] > 1 ? b[2][i] + '\\,' : '') + ft(s); }).reduce(function (acc, t, i) { return acc + (i === 0 ? '' : i === prodStart ? ' \\to ' : ' + ') + t; }, ''); }

  G('gchem1.balancing-redox', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['e', 'coef', 'e'], ['coef', 'e', 'coefHO'], ['tuple', 'coefHO', 'coef']));
    var b = R.pick(shape === 'coefHO' ? BRX.filter(function (x) { return x[1].some(function (s) { return /^(H\+|H2O|OH-)$/.test(s); }); }) : BRX), full = brxTex(b), skel = eqT(b[4]), med = b[0];
    var st = ['Split into half-reactions, balance each (atoms, then O with $\\mathrm{H_2O}$, H with $\\mathrm{H^+}$, then charge with electrons)' + (med === 'basic' ? ', and finally add $\\mathrm{OH^-}$ to both sides to remove $\\mathrm{H^+}$' : '') + '.', 'Match the electrons (' + b[3] + ' each way) and add the halves.', 'Balanced: $' + full + '$.'];
    if (shape === 'e') return P('When $' + skel + '$ is balanced in ' + med + ' solution with the smallest whole-number coefficients, how many electrons are transferred?', exact(b[3]), st, 'Find each half-reaction\'s electrons, then their least common multiple.', null, { k: 'e', i: BRX.indexOf(b) });
    if (shape === 'coef' || shape === 'coefHO') { var pickI = shape === 'coefHO' ? b[1].reduce(function (acc, s, i) { return /^(H\+|H2O|OH-)$/.test(s) ? i : acc; }, 0) : R.pick(b[1].map(function (s, i) { return i; }).filter(function (i) { return !/^(H\+|H2O|OH-)$/.test(b[1][i]); }));
      if (shape === 'coefHO') { var hs = b[1].map(function (s, i) { return i; }).filter(function (i) { return /^(H\+|H2O|OH-)$/.test(b[1][i]); }); pickI = R.pick(hs); }
      return P('Balance $' + skel + '$ in ' + med + ' solution with the smallest whole-number coefficients. What is the coefficient of ' + F(b[1][pickI]) + '?', exact(b[2][pickI]), st, 'Use the half-reaction method.', null, { k: 'coef', i: BRX.indexOf(b), sp: b[1][pickI] }); }
    return P('Balance $' + skel + '$ in ' + med + ' solution with the smallest whole-number coefficients. Give the coefficients of ' + lst(b[1].map(F)) + ', in that order (for example 1, 2, 3, …).', { t: 'tuple', v: b[2].map(String) }, st, 'Use the half-reaction method; ' + (med === 'basic' ? 'water and hydroxide' : 'water and hydrogen ions') + ' join the equation.', null, { k: 'tuple', i: BRX.indexOf(b) });
  });

  G('gchem1.redox-titrations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['feM', 'feM', 'vol'], ['feM', 'vol', 'pct', 'cr'], ['pct', 'ox', 'cr', 'h2o2']));
    var Cm = R.pick([0.01000, 0.01500, 0.02000, 0.02500]), Va = R.pick([10.00, 20.00, 25.00]), eqMn = '$' + eqT('MnO4- + 5Fe^2+ + 8H+ -> Mn^2+ + 5Fe^3+ + 4H2O') + '$';
    if (shape === 'feM' || shape === 'vol') { var Cfe = R.pick([0.0500, 0.0600, 0.0750, 0.0800, 0.1000]), nFe = Va / 1000 * Cfe, nMn = nFe / 5, Vm = rd(nMn / Cm * 1000, 2);
      if (shape === 'vol') return P('What volume of $' + qx(Cm, 'M', 4) + '$ ' + F('KMnO4') + ' is needed to titrate $' + qd(Va, 2, 'mL') + '$ of $' + qx(Cfe, 'M') + '$ ' + F('Fe^2+') + ' in acid? ' + eqMn, ans(nMn / Cm * 1000, 0.01),
        ['Moles of ' + F('Fe^2+') + ': $' + gd(Va / 1000, 5) + ' \\times ' + fx(Cfe) + ' = ' + qx(nFe, 'mol', 4) + '$.', 'Ratio 5 Fe : 1 Mn: $' + fx(nFe, 4) + '/5 = ' + qx(nMn, 'mol', 4) + '$ of ' + F('MnO4-') + '.', 'Volume: $' + dfr(fx(nMn, 4), fx(Cm, 4)) + ' = ' + qx(nMn / Cm * 1000, 'mL', 4) + '$.'], 'One permanganate takes five iron(II).', 'mL', { k: 'rvol', nFe: nFe, Cm: Cm });
      var nMg = Vm / 1000 * Cm, nFg = 5 * nMg, Cff = nFg / (Va / 1000);
      return P('$' + qd(Va, 2, 'mL') + '$ of an ' + F('Fe^2+') + ' solution needs $' + qd(Vm, 2, 'mL') + '$ of $' + qx(Cm, 'M', 4) + '$ ' + F('KMnO4') + ' to reach the endpoint. ' + eqMn + ' Find $[\\mathrm{Fe^{2+}}]$.', ans(Cff, 0.01),
        ['Moles of ' + F('MnO4-') + ': $' + gd(Vm / 1000, 5) + ' \\times ' + fx(Cm, 4) + ' = ' + qx(nMg, 'mol', 4) + '$.', 'Moles of ' + F('Fe^2+') + ': $5 \\times ' + fx(nMg, 4) + ' = ' + qx(nFg, 'mol', 4) + '$.', '$[\\mathrm{Fe^{2+}}] = ' + dfr(fx(nFg, 4), gd(Va / 1000, 5)) + ' = ' + qx(Cff, 'M', 4) + '$.'], 'Use the 5 : 1 ratio from the balanced equation.', 'M', { k: 'rfe', Vm: Vm, Cm: Cm, Va: Va, r: 5 }); }
    if (shape === 'pct') { var ms = R.pick([0.3000, 0.4500, 0.5000, 0.6000]), pf = R.int(20, 70) / 100, nF = ms * pf / 55.85, Vm2 = rd(nF / 5 / Cm * 1000, 2), nMg2 = Vm2 / 1000 * Cm, nFg2 = 5 * nMg2, pctF = 100 * nFg2 * 55.85 / ms;
      return P('A $' + qd(ms, 4, 'g') + '$ ore sample is dissolved and all its iron converted to ' + F('Fe^2+') + ', which needs $' + qd(Vm2, 2, 'mL') + '$ of $' + qx(Cm, 'M', 4) + '$ ' + F('KMnO4') + '. ' + eqMn + ' What percent of the ore is iron (Fe $55.85$)?', pctAns(pctF, 0.01),
        ['Moles of ' + F('MnO4-') + ': $' + gd(Vm2 / 1000, 5) + ' \\times ' + fx(Cm, 4) + ' = ' + qx(nMg2, 'mol', 4) + '$; iron: $5 \\times$ that $= ' + qx(nFg2, 'mol', 4) + '$.', 'Mass of Fe: $' + fx(nFg2, 4) + ' \\times 55.85 = ' + qx(nFg2 * 55.85, 'g', 4) + '$.', 'Percent: $' + dfr(fx(nFg2 * 55.85, 4), gd(ms, 4)) + ' \\times 100 = ' + fx(pctF, 3) + '\\%$.'], 'Moles of permanganate, times 5, times 55.85.', null, { k: 'rpct', Vm: Vm2, Cm: Cm, ms: ms }); }
    if (shape === 'cr') { var Cc = R.pick([0.01000, 0.01667, 0.02000]), Cfe2 = R.pick([0.0600, 0.0800, 0.1000, 0.1200]), nFe2 = Va / 1000 * Cfe2, Vc = rd(nFe2 / 6 / Cc * 1000, 2), nC = Vc / 1000 * Cc, Cfd = 6 * nC / (Va / 1000);
      return P('$' + qd(Va, 2, 'mL') + '$ of an ' + F('Fe^2+') + ' solution needs $' + qd(Vc, 2, 'mL') + '$ of $' + qx(Cc, 'M', 4) + '$ ' + F('K2Cr2O7') + ' in acid: $' + eqT('Cr2O7^2- + 6Fe^2+ + 14H+ -> 2Cr^3+ + 6Fe^3+ + 7H2O') + '$. Find $[\\mathrm{Fe^{2+}}]$.', ans(Cfd, 0.01),
        ['Moles of ' + F('Cr2O7^2-') + ': $' + gd(Vc / 1000, 5) + ' \\times ' + fx(Cc, 4) + ' = ' + qx(nC, 'mol', 4) + '$.', 'Each dichromate takes 6 iron(II) (2 Cr each gain 3 electrons): $6 \\times ' + fx(nC, 4) + ' = ' + qx(6 * nC, 'mol', 4) + '$.', '$[\\mathrm{Fe^{2+}}] = ' + dfr(fx(6 * nC, 4), gd(Va / 1000, 5)) + ' = ' + qx(Cfd, 'M', 4) + '$.'], 'Count electrons: 6 per dichromate, 1 per iron.', 'M', { k: 'rfe', Vm: Vc, Cm: Cc, Va: Va, r: 6 }); }
    if (shape === 'ox') { var gx0 = R.pick([0.1340, 0.2010, 0.2680, 0.3350]), nOx = gx0 / 134.00, nMo = nOx * 2 / 5, Vo = rd(nMo / Cm * 1000, 2), Cmo = nMo / (Vo / 1000);
      return P('$' + qd(gx0, 4, 'g') + '$ of sodium oxalate, ' + F('Na2C2O4') + ' ($134.00\\ \\text{g/mol}$), needs $' + qd(Vo, 2, 'mL') + '$ of ' + F('KMnO4') + ' solution: $' + eqT('2MnO4- + 5C2O4^2- + 16H+ -> 2Mn^2+ + 10CO2 + 8H2O') + '$. Find the concentration of the ' + F('KMnO4') + '.', ans(Cmo, 0.01),
        ['Moles of oxalate: $' + dfr(gd(gx0, 4), '134.00') + ' = ' + qx(nOx, 'mol', 4) + '$.', 'Ratio 2 : 5: $' + fx(nOx, 4) + ' \\times \\tfrac{2}{5} = ' + qx(nMo, 'mol', 4) + '$ of ' + F('MnO4-') + '.', '$M = ' + dfr(fx(nMo, 4), gd(Vo / 1000, 5)) + ' = ' + qx(Cmo, 'M', 4) + '$.'], 'Use the 2 : 5 ratio.', 'M', { k: 'rox', g: gx0, V: Vo }); }
    var Ch2 = R.pick([0.0500, 0.0800, 0.1000]), nH2 = Va / 1000 * Ch2, nMh = nH2 * 2 / 5, Vh = rd(nMh / Cm * 1000, 2), nMhg = Vh / 1000 * Cm, Chf = nMhg * 5 / 2 / (Va / 1000);
    return P('$' + qd(Va, 2, 'mL') + '$ of hydrogen peroxide solution needs $' + qd(Vh, 2, 'mL') + '$ of $' + qx(Cm, 'M', 4) + '$ ' + F('KMnO4') + ': $' + eqT('2MnO4- + 5H2O2 + 6H+ -> 2Mn^2+ + 5O2 + 8H2O') + '$. Find $[\\mathrm{H_2O_2}]$.', ans(Chf, 0.01),
      ['Moles of ' + F('MnO4-') + ': $' + gd(Vh / 1000, 5) + ' \\times ' + fx(Cm, 4) + ' = ' + qx(nMhg, 'mol', 4) + '$.', 'Ratio 5 : 2: $' + fx(nMhg, 4) + ' \\times \\tfrac{5}{2} = ' + qx(nMhg * 2.5, 'mol', 4) + '$ of ' + F('H2O2') + '.', '$[\\mathrm{H_2O_2}] = ' + dfr(fx(nMhg * 2.5, 4), gd(Va / 1000, 5)) + ' = ' + qx(Chf, 'M', 4) + '$.'], 'Use the 5 : 2 ratio.', 'M', { k: 'rh2o2', Vm: Vh, Cm: Cm, Va: Va });
  });


  // ================================================================== UNIT 9: THERMOCHEMISTRY
  function sgnE(x, u) { return (x > 0 ? '+' : '') + gx(x) + '\\ \\text{' + u + '}'; }

  G('gchem1.first-law', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['dU', 'dU', 'sign'], ['dU', 'findq', 'sign', 'findw'], ['dU', 'phys', 'findw', 'findq']));
    var u = R.pick(['J', 'kJ']), qm0 = u === 'J' ? R.pick([50, 75, 120, 150, 200, 250, 300, 450]) : R.pick([1.5, 2.4, 3.0, 4.2, 5.5, 8.0]), wm = u === 'J' ? R.pick([25, 40, 60, 80, 100, 175, 220]) : R.pick([0.8, 1.2, 2.0, 2.5, 3.6, 6.0]);
    var qIn = R.coin(), wOn = R.coin(), q = qIn ? qm0 : -qm0, w = wOn ? wm : -wm, dU = fix(q + w);
    var qTxt = qIn ? 'absorbs $' + gx(qm0) + '\\ \\text{' + u + '}$ of heat' : 'releases $' + gx(qm0) + '\\ \\text{' + u + '}$ of heat', wTxt = wOn ? 'has $' + gx(wm) + '\\ \\text{' + u + '}$ of work done on it' : 'does $' + gx(wm) + '\\ \\text{' + u + '}$ of work on its surroundings';
    var st = ['Heat ' + (qIn ? 'into' : 'out of') + ' the system: $q = ' + sgnE(q, u) + '$.', 'Work ' + (wOn ? 'done on' : 'done by') + ' the system: $w = ' + sgnE(w, u) + '$.'];
    if (shape === 'dU') return P('A system ' + qTxt + ' and ' + wTxt + '. Find $\\Delta U$ for the system (with its sign).', { t: 'num', v: plainNum(dU) },
      st.concat(['$\\Delta U = q + w = ' + pn(q) + ' + ' + pn(w) + ' = ' + sgnE(dU, u) + '$.']), 'Decide each sign from the system\'s point of view: in is positive.', u, { k: 'dU', q: q, w: w });
    if (shape === 'findq') return P('A system ' + wTxt + ', and its internal energy changes by $\\Delta U = ' + sgnE(dU, u) + '$. Find $q$ (with its sign).', { t: 'num', v: plainNum(q) },
      [st[1], '$q = \\Delta U - w = ' + pn(dU) + ' - ' + pn(w) + ' = ' + sgnE(q, u) + '$: heat flowed ' + (q > 0 ? 'into' : 'out of') + ' the system.'], 'Solve $\\Delta U = q + w$ for $q$.', u, { k: 'findq', dU: dU, w: w });
    if (shape === 'findw') return P('A system ' + qTxt + ', and its internal energy changes by $\\Delta U = ' + sgnE(dU, u) + '$. Find $w$ (with its sign).', { t: 'num', v: plainNum(w) },
      [st[0], '$w = \\Delta U - q = ' + pn(dU) + ' - ' + pn(q) + ' = ' + sgnE(w, u) + '$: work was done ' + (w > 0 ? 'on' : 'by') + ' the system.'], 'Solve $\\Delta U = q + w$ for $w$.', u, { k: 'findw', dU: dU, q: q });
    if (shape === 'phys') return P('A physics book describes a gas with $Q = ' + sgnE(q, u) + '$ (heat added) and $W = ' + sgnE(-w, u) + '$ (work done <i>by</i> the gas), using $\\Delta U = Q - W$. In chemistry\'s convention, what is $w$, and what is $\\Delta U$? Give $\\Delta U$.', { t: 'num', v: plainNum(dU) },
      ['Work done on the gas is minus the work done by it: $w = -W = ' + sgnE(w, u) + '$.', 'Chemistry: $\\Delta U = q + w = ' + pn(q) + ' + ' + pn(w) + ' = ' + sgnE(dU, u) + '$. Physics: $Q - W = ' + pn(q) + ' - ' + pn(-w) + ' = ' + sgnE(dU, u) + '$. Same answer: the conventions differ, the energy doesn\'t.'],
      'Work by the gas is the negative of work on it.', u, { k: 'phys', q: q, w: w });
    var sc = R.pick([['A gas is heated and expands, pushing a piston out.', '$q > 0$ and $w < 0$'], ['A gas is compressed by a piston while it gives off heat.', '$q < 0$ and $w > 0$'], ['An exothermic reaction in a rigid sealed container warms the water around it.', '$q < 0$ and $w = 0$'], ['A gas is cooled and contracts as the outside air pushes the piston in.', '$q < 0$ and $w > 0$'], ['A gas absorbs heat in a rigid container that cannot expand.', '$q > 0$ and $w = 0$']]);
    return P('For the system described, which signs are right (chemistry convention)? ' + sc[0], mc(sc[1], ['$q > 0$ and $w < 0$', '$q < 0$ and $w > 0$', '$q > 0$ and $w > 0$', '$q < 0$ and $w < 0$', '$q < 0$ and $w = 0$', '$q > 0$ and $w = 0$'].filter(function (x) { return x !== sc[1]; }).slice(0, 3)),
      ['Heat into the system is positive; heat out is negative.', 'Work done on the system (compression) is positive; work done by it (expansion) is negative; no volume change, no PV work.', 'So: ' + sc[1] + '.'], 'Think from the system\'s point of view.', null, { k: 'sign' });
  });

  var DNRX = [['CaCO3(s) -> CaO(s) + CO2(g)', 1], ['2H2(g) + O2(g) -> 2H2O(l)', -3], ['N2(g) + 3H2(g) -> 2NH3(g)', -2], ['CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', -2], ['C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(g)', 1], ['2H2O2(l) -> 2H2O(l) + O2(g)', 1], ['Zn(s) + 2HCl(aq) -> ZnCl2(aq) + H2(g)', 1], ['N2O4(g) -> 2NO2(g)', 1]];

  G('gchem1.pv-work', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['w', 'w', 'vac'], ['w', 'dU', 'dn'], ['dU', 'dn', 'w']));
    var P0 = R.pick([0.500, 1.00, 1.50, 2.00, 3.00]), V1 = R.pick([1.00, 2.00, 2.50, 4.00, 5.00]), dV = R.pick([1.00, 1.50, 2.00, 3.00, 4.00]) * (R.chance(0.7) ? 1 : -1), V2 = rd(V1 + dV, 2);
    if (V2 <= 0) { V2 = rd(V1 + M.abs(dV), 2); dV = M.abs(dV); }
    var wLA = -P0 * dV, wJ = wLA * LATM;
    var stw = ['$\\Delta V = ' + fx(V2) + ' - ' + fx(V1) + ' = ' + (dV > 0 ? '+' : '') + fx(dV) + '\\ \\text{L}$ (' + (dV > 0 ? 'expansion' : 'compression') + ').', '$w = -P_\\text{ext}\\Delta V = -(' + fx(P0) + ')(' + fx(dV) + ') = ' + fx(wLA) + '\\ \\text{L·atm}$.', '$' + fx(wLA) + ' \\times 101.3 = ' + qx(wJ, 'J') + '$.'];
    if (shape === 'w') return P('A gas ' + (dV > 0 ? 'expands' : 'is compressed') + ' from $' + qx(V1, 'L') + '$ to $' + qx(V2, 'L') + '$ against a constant external pressure of $' + qx(P0, 'atm') + '$. Find $w$ in joules (with its sign).', ans(wJ, 0.01),
      stw, '$w = -P\\Delta V$, then 1 L·atm = 101.3 J.', 'J', { k: 'w', P: P0, dV: dV });
    if (shape === 'dU') { var qq = R.pick([200, 350, 500, 750, 1000]) * (R.coin() ? 1 : -1), dU = qq + wJ;
      return P('A gas ' + (qq > 0 ? 'absorbs' : 'releases') + ' $' + qg(M.abs(qq), 'J') + '$ of heat while it ' + (dV > 0 ? 'expands' : 'is compressed') + ' from $' + qx(V1, 'L') + '$ to $' + qx(V2, 'L') + '$ against a constant $' + qx(P0, 'atm') + '$. Find $\\Delta U$ in joules.', ans(dU, 0.02),
        stw.concat(['$q = ' + sg(qq) + '\\ \\text{J}$, so $\\Delta U = q + w = ' + gx(qq) + ' + (' + fx(wJ) + ') = ' + qx(dU, 'J') + '$.']), 'Find $w$ in joules first, then add $q$.', 'J', { k: 'dU', q: qq, P: P0, dV: dV }); }
    if (shape === 'dn') { var rx = R.pick(DNRX), wk = -rx[1] * RJ * 298.15 / 1000;
      return P('For the reaction $' + eqT(rx[0]) + '$ at $25^\\circ\\text{C}$ and constant pressure, find $w$ per mole of reaction, in kJ (with its sign). Treat the gases as ideal and ignore the volumes of solids and liquids.', ans(wk, 0.01),
        ['Moles of gas change by $\\Delta n_\\text{gas} = ' + (rx[1] > 0 ? '+' : '') + rx[1] + '$.', '$w = -P\\Delta V = -\\Delta n_\\text{gas}RT = -(' + rx[1] + ')(8.314)(298.15) = ' + qx(wk * 1000, 'J') + ' = ' + qx(wk, 'kJ') + '$.', rx[1] > 0 ? 'The reaction makes gas, which pushes back the atmosphere: $w < 0$.' : 'Gas is used up, so the atmosphere pushes in: $w > 0$.'],
        'Count moles of gas on each side.', 'kJ', { k: 'dn', dn: rx[1] }); }
    var t = R.pick([['A gas that expands into a vacuum does no work.', true, 'There is nothing to push against: $P_\\text{ext} = 0$, so $w = 0$.'],
      ['When a gas expands against a constant pressure, $w$ is positive.', false, 'The gas does work on the surroundings, so $w = -P\\Delta V$ is negative.'],
      ['$1\\ \\text{L·atm}$ is about $101.3\\ \\text{J}$.', true, 'That is the conversion between the two units of energy.'],
      ['Compressing a gas does work on it, so $w > 0$.', true, '$\\Delta V < 0$ makes $-P\\Delta V$ positive.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], '$w = -P_\\text{ext}\\Delta V$.', null, { k: 'tf' });
  });

  // thermochemical equations: [equation, ΔH in kJ for the equation as written]
  var TCE = [['N2(g) + 3H2(g) -> 2NH3(g)', -92.2], ['2H2(g) + O2(g) -> 2H2O(l)', -571.6], ['CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', -890.3], ['C(s) + O2(g) -> CO2(g)', -393.5], ['2CO(g) + O2(g) -> 2CO2(g)', -566.0],
    ['N2(g) + O2(g) -> 2NO(g)', 180.5], ['CaCO3(s) -> CaO(s) + CO2(g)', 179.2], ['H2(g) + Cl2(g) -> 2HCl(g)', -184.6], ['2SO2(g) + O2(g) -> 2SO3(g)', -197.8], ['2NO2(g) -> N2O4(g)', -57.2], ['C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)', -2219.9]];
  function scaleEq(eq, f) { // multiply every coefficient of an equation string by the rational f
    var sides = eq.split(' -> ').map(function (side) { return side.split(' + ').map(function (t) { var m = /^(\d+)?(.*)$/.exec(t); var c = Q(m[1] ? +m[1] : 1).mul(f); return (c.isInt() ? (c.eq(1) ? '' : c.toPlain()) : c.toPlain()) + m[2]; }).join(' + '); });
    return sides.join(' -> ');
  }
  function revEq(eq) { return eq.split(' -> ').reverse().join(' -> '); }

  G('gchem1.enthalpy-equations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['reverse', 'scale', 'exo'], ['reverse', 'scale', 'both', 'exo'], ['both', 'scale', 'state', 'both']));
    var r = R.pick(TCE), base = 'Given $' + eqT(r[0]) + '$, $\\Delta H = ' + sgnE(r[1], 'kJ') + '$. ';
    if (shape === 'reverse') return P(base + 'Find $\\Delta H$ for $' + eqT(revEq(r[0])) + '$.', { t: 'num', v: plainNum(-r[1]), rtol: 0.001 },
      ['The new equation is the given one run backward.', 'Reversing a reaction changes the sign of $\\Delta H$: $' + sgnE(-r[1], 'kJ') + '$.'], 'What happens to $\\Delta H$ when a reaction is reversed?', 'kJ', { k: 'rev', dH: r[1] });
    var f = R.pick([Q(2), Q(3), Q(1, 2)]);
    if (shape === 'scale') { var dHs = Q.from(r[1]).mul(f).toNumber();
      return P(base + 'Find $\\Delta H$ for $' + eqT(scaleEq(r[0], f)) + '$.', { t: 'num', v: plainNum(dHs), rtol: 0.001 },
        ['Every coefficient was multiplied by $' + f.toTex() + '$.', '$\\Delta H$ scales the same way: $' + f.toTex() + ' \\times (' + gx(r[1]) + ') = ' + sgnE(dHs, 'kJ') + '$.'], 'Multiply $\\Delta H$ by the same factor as the coefficients.', 'kJ', { k: 'scale', dH: r[1], f: f.toNumber() }); }
    if (shape === 'both') { var dHb = -Q.from(r[1]).mul(f).toNumber();
      return P(base + 'Find $\\Delta H$ for $' + eqT(scaleEq(revEq(r[0]), f)) + '$.', { t: 'num', v: plainNum(dHb), rtol: 0.001 },
        ['This is the given reaction reversed (sign changes) and multiplied by $' + f.toTex() + '$.', '$\\Delta H = -' + f.toTex() + ' \\times (' + gx(r[1]) + ') = ' + sgnE(dHb, 'kJ') + '$.'], 'Reverse: change the sign. Scale: multiply.', 'kJ', { k: 'both', dH: r[1], f: f.toNumber() }); }
    if (shape === 'exo') { var exo = r[1] < 0, rv = R.coin(), eqS = rv ? revEq(r[0]) : r[0], dHx = rv ? -r[1] : r[1], ex2 = dHx < 0;
      return P('For $' + eqT(eqS) + '$, $\\Delta H = ' + sgnE(dHx, 'kJ') + '$. Which is true?', mc(ex2 ? 'It is exothermic: it releases heat, and the surroundings warm.' : 'It is endothermic: it absorbs heat, and the surroundings cool.', [ex2 ? 'It is endothermic: it absorbs heat, and the surroundings cool.' : 'It is exothermic: it releases heat, and the surroundings warm.', ex2 ? 'It is exothermic: it releases heat, and the surroundings cool.' : 'It is endothermic: it absorbs heat, and the surroundings warm.']),
        ['$\\Delta H ' + (ex2 ? '< 0' : '> 0') + '$: the system ' + (ex2 ? 'loses' : 'gains') + ' enthalpy.', ex2 ? 'That energy goes into the surroundings, which warm.' : 'That energy comes from the surroundings, which cool.'], 'Negative $\\Delta H$ means heat leaves the system.', null, { k: 'exo' }); }
    var w = R.pick([['2H2(g) + O2(g) -> 2H2O(l)', -571.6, 2], ['CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', -890.3, 2], ['C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)', -2219.9, 4]]), dHg = rd(w[1] + 44.0 * w[2], 1);
    return P('$' + eqT(w[0]) + '$ has $\\Delta H = ' + sgnE(w[1], 'kJ') + '$. Condensing water vapor releases $44.0\\ \\text{kJ/mol}$. Find $\\Delta H$ when the water is produced as vapor, ' + F('H2O(g)') + ', instead.', { t: 'num', v: plainNum(dHg), rtol: 0.002 },
      ['Producing vapor skips the condensation of ' + w[2] + ' mol of water, which would have released $' + w[2] + ' \\times 44.0 = ' + gx(rd(44 * w[2], 1)) + '\\ \\text{kJ}$.', '$\\Delta H = ' + gx(w[1]) + ' + ' + gx(rd(44 * w[2], 1)) + ' = ' + sgnE(dHg, 'kJ') + '$: less heat released.'], 'Liquid water is lower in enthalpy than vapor.', 'kJ', { k: 'state', dH: w[1], n: w[2] });
  });

  // reactions with heat: [equation, ΔH kJ, substance, its coefficient, molar mass]
  var HRX = [['CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', -890.3, 'CH4', 1], ['C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)', -2219.9, 'C3H8', 1], ['2H2(g) + O2(g) -> 2H2O(l)', -571.6, 'H2', 2], ['C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(l)', -1366.8, 'C2H5OH', 1],
    ['C6H12O6(s) + 6O2(g) -> 6CO2(g) + 6H2O(l)', -2803, 'C6H12O6', 1], ['N2(g) + 3H2(g) -> 2NH3(g)', -92.2, 'NH3', 2], ['CaCO3(s) -> CaO(s) + CO2(g)', 179.2, 'CaCO3', 1], ['2SO2(g) + O2(g) -> 2SO3(g)', -197.8, 'SO2', 2], ['2C8H18(l) + 25O2(g) -> 16CO2(g) + 18H2O(l)', -10940, 'C8H18', 2], ['N2(g) + O2(g) -> 2NO(g)', 180.5, 'NO', 2]];

  G('gchem1.enthalpy-stoichiometry', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['heat', 'heat', 'perg'], ['heat', 'mass', 'heat', 'perg'], ['mass', 'heat', 'perg', 'heat']));
    var r = R.pick(HRX), Ms = mm(r[2]), exo = r[1] < 0, word = exo ? 'released' : 'absorbed', base = 'For $' + eqT(r[0]) + '$, $\\Delta H = ' + sgnE(r[1], 'kJ') + '$. ';
    if (shape === 'heat') { var g = R.pick([5.00, 10.0, 25.0, 50.0, 100]), n = g / Ms, nr = n / r[3], qk = nr * M.abs(r[1]);
      return P(base + 'How much heat is ' + word + ' when $' + qx(g, 'g') + '$ of ' + F(r[2]) + ' ($' + qm(Ms) + '$) ' + (r[2] === 'NH3' || r[2] === 'NO' ? 'is formed' : 'reacts') + '? Give the amount in kJ.', ans(qk, 0.01),
        ['Moles of ' + F(r[2]) + ': $' + dfr(fx(g), mmx(Ms)) + ' = ' + qx(n, 'mol', 4) + '$.', r[3] > 1 ? 'Moles of reaction: $' + fx(n, 4) + '/' + r[3] + ' = ' + fx(nr, 4) + '$ (its coefficient is ' + r[3] + ').' : 'Its coefficient is 1, so that is ' + fx(nr, 4) + ' mol of reaction.', '$q = ' + fx(nr, 4) + ' \\times (' + gx(r[1]) + ') = ' + sgnE(rd(nr * r[1], 1), 'kJ') + '$: $' + qx(qk, 'kJ') + '$ ' + word + '.'],
        'Grams → moles → moles of reaction (÷ coefficient) → × ΔH.', 'kJ', { k: 'heat', g: g, M: Ms, c: r[3], dH: r[1] }); }
    if (shape === 'mass') { var Qk = R.pick([100, 250, 500, 1000, 1500, 2500]), nr2 = Qk / M.abs(r[1]), n2 = nr2 * r[3], g2 = n2 * Ms;
      return P(base + 'What mass of ' + F(r[2]) + ' ($' + qm(Ms) + '$) must ' + (r[2] === 'NH3' || r[2] === 'NO' ? 'form' : 'react') + ' for $' + qg(Qk, 'kJ') + '$ of heat to be ' + word + '?', ans(g2, 0.01),
        ['Moles of reaction: $' + dfr(gx(Qk), gx(M.abs(r[1]))) + ' = ' + fx(nr2, 4) + '$.', 'Moles of ' + F(r[2]) + ': $' + fx(nr2, 4) + (r[3] > 1 ? ' \\times ' + r[3] : '') + ' = ' + qx(n2, 'mol', 4) + '$.', 'Mass: $' + fx(n2, 4) + ' \\times ' + mmx(Ms) + ' = ' + qx(g2, 'g') + '$.'],
        'Heat ÷ |ΔH| gives moles of reaction; then use the coefficient.', 'g', { k: 'mass', Q: Qk, dH: r[1], c: r[3], M: Ms }); }
    var perg = M.abs(r[1]) / r[3] / Ms;
    return P(base + 'How much heat, in kJ, is ' + word + ' per gram of ' + F(r[2]) + ' ($' + qm(Ms) + '$)?', ans(perg, 0.01),
      ['Per mole of ' + F(r[2]) + ': $' + dfr(gx(M.abs(r[1])), r[3]) + ' = ' + qx(M.abs(r[1]) / r[3], 'kJ', 4) + '$' + (r[3] > 1 ? ' (its coefficient is ' + r[3] + ')' : '') + '.', 'Per gram: $' + dfr(fx(M.abs(r[1]) / r[3], 4), mmx(Ms)) + ' = ' + qx(perg, 'none') + '\\ \\text{kJ/g}$.'],
      'Divide ΔH by the coefficient, then by the molar mass.', 'kJ/g', { k: 'perg', dH: r[1], c: r[3], M: Ms });
  });

  // water: c(ice) 2.09, c(liquid) 4.184, c(steam) 2.01 J/(g·°C); ΔHfus 6.01, ΔHvap 40.7 kJ/mol; 18.02 g/mol
  function heatPath(m, T1, T2) {
    var segs = [], n = m / 18.02;
    function add(name, q, tex) { segs.push([name, q, tex]); }
    if (T1 < 0) add('warm the ice', m * 2.09 * (M.min(T2, 0) - T1), '(' + gx(m) + ')(2.09)(' + gx(fix(M.min(T2, 0) - T1)) + ')');
    if (T1 <= 0 && T2 > 0) add('melt the ice', n * 6010, '(' + fx(n, 4) + '\\ \\text{mol})(6010\\ \\text{J/mol})');
    if (T2 > 0 && T1 < 100) add('warm the water', m * 4.184 * (M.min(T2, 100) - M.max(T1, 0)), '(' + gx(m) + ')(4.184)(' + gx(fix(M.min(T2, 100) - M.max(T1, 0))) + ')');
    if (T1 <= 100 && T2 > 100) add('boil the water', n * 40700, '(' + fx(n, 4) + '\\ \\text{mol})(40{,}700\\ \\text{J/mol})');
    if (T2 > 100) add('warm the steam', m * 2.01 * (T2 - M.max(T1, 100)), '(' + gx(m) + ')(2.01)(' + gx(fix(T2 - M.max(T1, 100))) + ')');
    return segs;
  }

  G('gchem1.heating-curve-calculations', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['melt', 'total', 'boil'], ['total', 'total', 'largest'], ['total', 'total', 'largest']));
    var m = R.chance(0.4) ? R.pick([10.0, 18.0, 25.0, 36.0, 50.0, 100]) : R.int(5, 150);
    if (shape === 'melt' || shape === 'boil') { var melt = shape === 'melt', n = m / 18.02, qk = n * (melt ? 6.01 : 40.7);
      return P('How much heat, in kJ, is needed to ' + (melt ? 'melt $' + qx(m, 'g') + '$ of ice at $0^\\circ\\text{C}$' : 'boil away $' + qx(m, 'g') + '$ of water at $100^\\circ\\text{C}$') + '? ($\\Delta H_\\text{' + (melt ? 'fus' : 'vap') + '} = ' + (melt ? '6.01' : '40.7') + '\\ \\text{kJ/mol}$, $18.02\\ \\text{g/mol}$)', ans(qk, 0.01),
        ['Moles: $' + dfr(fx(m), '18.02') + ' = ' + qx(n, 'mol', 4) + '$.', 'The temperature stays at $' + (melt ? 0 : 100) + '^\\circ\\text{C}$: $q = n\\Delta H = ' + fx(n, 4) + ' \\times ' + (melt ? '6.01' : '40.7') + ' = ' + qx(qk, 'kJ') + '$.'],
        'A phase change uses $q = n\\Delta H$, not $mc\\Delta T$.', 'kJ', { k: melt ? 'melt' : 'boil', m: m }); }
    var T1 = R.pick([-30, -20, -15, -10, -5, 0, 20, 25, 40, 60, 80, 90]), T2;
    if (T1 < 0) T2 = R.pick([10, 25, 40, 50, 80, 110, 120, 130]); else if (T1 === 0) T2 = R.pick([25, 50, 110, 120]); else T2 = R.pick([105, 110, 120, 125, 130, 150]);
    var segs = heatPath(m, T1, T2), tot = segs.reduce(function (s, x) { return s + x[1]; }, 0);
    var desc = (T1 < 0 ? 'ice at $' + T1 + '^\\circ\\text{C}$' : T1 === 0 ? 'ice at $0^\\circ\\text{C}$' : 'water at $' + T1 + '^\\circ\\text{C}$') + ' into ' + (T2 > 100 ? 'steam at $' + T2 + '^\\circ\\text{C}$' : 'water at $' + T2 + '^\\circ\\text{C}$');
    var data = '(Water: $c_\\text{ice} = 2.09$, $c_\\text{liquid} = 4.184$, $c_\\text{steam} = 2.01\\ \\text{J/(g·°C)}$; $\\Delta H_\\text{fus} = 6.01$, $\\Delta H_\\text{vap} = 40.7\\ \\text{kJ/mol}$; $18.02\\ \\text{g/mol}$.)';
    var stS = segs.map(function (s) { return cap(s[0]) + ': $' + s[2] + ' = ' + qx(s[1], 'J') + '$.'; });
    if (shape === 'largest' && segs.length > 1) { var big = segs.slice().sort(function (a, b) { return b[1] - a[1]; })[0];
      return P('When $' + qx(m, 'g') + '$ of ' + desc + ' is heated, which step takes the most heat? ' + data, mc(big[0], segs.filter(function (s) { return s !== big; }).map(function (s) { return s[0]; }).concat(segs.length < 3 ? ['all steps take the same heat'] : []).slice(0, 3)),
        stS.concat(['Largest: ' + big[0] + '.']), 'Work out each step.', null, { k: 'largest' }); }
    return P('How much heat, in kJ, turns $' + qx(m, 'g') + '$ of ' + desc + '? ' + data, ans(tot / 1000, 0.01),
      stS.concat(['Total: $' + qx(tot, 'J') + ' = ' + qx(tot / 1000, 'kJ') + '$.']), 'One term for each warming segment and each phase change.', 'kJ', { k: 'path', m: m, T1: T1, T2: T2 }, { name: 'ch-heatingcurve', opts: { sub: 'H2O', mass: m, T1: T1, T2: T2, quiet: true, edit: false } });
  });

  // solution calorimetry: neutralization −55.8 kJ/mol; dissolving salts (CRC)
  var DSALT = [['NH4NO3', 25.7], ['KNO3', 34.9], ['NH4Cl', 14.8], ['NaOH', -44.5], ['CaCl2', -81.3], ['LiCl', -37.0]];

  G('gchem1.reaction-calorimetry', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['neut', 'neut', 'salt'], ['neut', 'salt', 'dT'], ['limit', 'salt', 'dT', 'neut']));
    var Ti = R.pick([20.0, 21.5, 22.0, 23.0, 24.5, 25.0]);
    if (shape === 'neut' || shape === 'limit') { var C = R.pick([0.500, 1.00, 1.50, 2.00]), V1 = R.pick([25.0, 50.0, 75.0, 100.0]), V2 = shape === 'limit' ? V1 * R.pick([1.5, 2]) : V1, nH = V1 / 1000 * C, nOH = V2 / 1000 * C, nr = M.min(nH, nOH), mtot = V1 + V2;
      var dT = rd(55.8e3 * nr / (mtot * 4.184), 2), Tf = rd(Ti + dT, 2), qs = mtot * 4.184 * (Tf - Ti), dH = -qs / nr / 1000;
      return P('$' + qx(V1, 'mL') + '$ of $' + qx(C, 'M') + '$ HCl and $' + qx(V2, 'mL') + '$ of $' + qx(C, 'M') + '$ NaOH, both at $' + gd(Ti, 2) + '^\\circ\\text{C}$, are mixed in a coffee-cup calorimeter, and the temperature rises to $' + gd(Tf, 2) + '^\\circ\\text{C}$. Find $\\Delta H$ for $\\mathrm{H^+} + \\mathrm{OH^-} \\to \\mathrm{H_2O}$ in kJ/mol. (Treat the solution as water: $1.00\\ \\text{g/mL}$, $4.184\\ \\text{J/(g·°C)}$.)', ans(dH, 0.02),
        ['Mass: $' + gx(mtot) + '\\ \\text{g}$; $\\Delta T = ' + gd(Tf - Ti, 2) + '^\\circ\\text{C}$. $q_\\text{soln} = (' + gx(mtot) + ')(4.184)(' + gd(Tf - Ti, 2) + ') = ' + qx(qs, 'J') + '$.', '$q_\\text{rxn} = -q_\\text{soln} = ' + qx(-qs, 'J') + '$.', 'Moles: HCl $' + fx(nH) + '$, NaOH $' + fx(nOH) + '$' + (nH !== nOH ? '; HCl is limiting, so $' + fx(nr) + '$ mol react' : '') + '.', '$\\Delta H = ' + dfr(fx(-qs), fx(nr)) + ' = ' + qx(dH * 1000, 'Jmol') + ' = ' + qx(dH, 'kJmol') + '$.'],
        'q of the reaction is minus q of the solution; divide by moles of the limiting reactant.', 'kJmol', { k: 'neut', m: mtot, dT: Tf - Ti, n: nr }, { name: 'ch-calorimeter', opts: { mode: 'reaction', rxn: 'neutralization', quiet: true, edit: false } }); }
    var s = R.pick(DSALT), Ms = mm(s[0]), g = R.pick([2.00, 4.00, 5.00, 8.00, 10.0]), w = R.pick([50.0, 75.0, 100.0]), n = g / Ms, mt = g + w;
    if (shape === 'salt') { var dT2 = rd(-s[1] * 1e3 * n / (mt * 4.184), 2), qs2 = mt * 4.184 * dT2, dH2 = -qs2 / n / 1000;
      return P('$' + qx(g, 'g') + '$ of ' + F(s[0]) + ' ($' + qm(Ms) + '$) dissolves in $' + qx(w, 'g') + '$ of water in a coffee-cup calorimeter. The temperature ' + (dT2 < 0 ? 'falls' : 'rises') + ' by $' + gd(M.abs(dT2), 2) + '^\\circ\\text{C}$. Find $\\Delta H_\\text{soln}$ in kJ/mol (solution mass $' + gx(rd(mt, 2)) + '\\ \\text{g}$, $c = 4.184\\ \\text{J/(g·°C)}$).', ans(dH2, 0.02),
        ['$q_\\text{soln} = (' + gx(rd(mt, 2)) + ')(4.184)(' + gd(dT2, 2) + ') = ' + qx(qs2, 'J') + '$: the solution ' + (qs2 < 0 ? 'lost' : 'gained') + ' heat.', '$q_\\text{rxn} = ' + qx(-qs2, 'J') + '$; moles: $' + dfr(fx(g), mmx(Ms)) + ' = ' + qx(n, 'mol', 4) + '$.', '$\\Delta H = ' + dfr(fx(-qs2), fx(n, 4)) + ' = ' + qx(dH2, 'kJmol') + '$: ' + (dH2 > 0 ? 'endothermic.' : 'exothermic.')],
        'A temperature drop means the dissolving absorbed heat.', 'kJmol', { k: 'salt', m: mt, dT: dT2, n: n }); }
    var dT3 = -s[1] * 1e3 * n / (mt * 4.184);
    return P('$\\Delta H_\\text{soln}$ of ' + F(s[0]) + ' is $' + sgnE(s[1], 'kJ/mol') + '$. Predict the temperature change (with its sign) when $' + qx(g, 'g') + '$ of it ($' + qm(Ms) + '$) dissolves in $' + qx(w, 'g') + '$ of water in an insulated cup. (Solution mass $' + gx(rd(mt, 2)) + '\\ \\text{g}$, $c = 4.184\\ \\text{J/(g·°C)}$.)', ans(dT3, 0.02),
      ['Moles: $' + qx(n, 'mol', 4) + '$. $q_\\text{rxn} = n\\Delta H = ' + fx(n, 4) + ' \\times ' + sgnE(s[1] * 1000, 'J/mol') + ' = ' + qx(n * s[1] * 1000, 'J') + '$.', '$q_\\text{soln} = -q_\\text{rxn} = ' + qx(-n * s[1] * 1000, 'J') + '$.', '$\\Delta T = \\dfrac{q_\\text{soln}}{mc} = ' + dfr(fx(-n * s[1] * 1000), '(' + gx(rd(mt, 2)) + ')(4.184)') + ' = ' + qx(dT3, 'C') + '$.'],
      'The solution takes the opposite of the reaction\'s heat.', 'C', { k: 'dT', n: n, dH: s[1], m: mt });
  });

  // bomb calorimetry: [fuel, formula, energy released per gram (kJ/g, ΔcU)]
  var FUEL = [['benzoic acid', 'C7H6O2', 26.38], ['sucrose', 'C12H22O11', 16.49], ['glucose', 'C6H12O6', 15.56], ['naphthalene', 'C10H8', 40.18], ['octane', 'C8H18', 47.89], ['ethanol', 'C2H5OH', 29.67]];

  G('gchem1.bomb-calorimetry', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['q', 'q', 'perg'], ['perg', 'Ccal', 'dT', 'q'], ['permol', 'Ccal', 'cal', 'perg']));
    var Cc = R.pick([8.50, 9.25, 10.00, 10.50, 12.00]), fu = R.pick(FUEL), g = R.pick([0.5000, 0.7500, 1.0000, 1.2500]), dT = rd(fu[2] * g / Cc, 3), qk = Cc * dT;
    var base = 'A bomb calorimeter has $C_\\text{cal} = ' + qd(Cc, 2, 'kJC') + '$. ';
    if (shape === 'q') return P(base + 'Burning a sample raises its temperature by $' + gd(dT, 3) + '^\\circ\\text{C}$. How much heat did the sample release, in kJ?', ans(qk, 0.01),
      ['$q_\\text{cal} = C_\\text{cal}\\Delta T = (' + gd(Cc, 2) + ')(' + gd(dT, 3) + ') = ' + qx(qk, 'kJ') + '$.', 'The sample released that much: $q_\\text{rxn} = ' + qx(-qk, 'kJ') + '$.'], 'Heat capacity times temperature change.', 'kJ', { k: 'bq', C: Cc, dT: dT }, { name: 'ch-calorimeter', opts: { mode: 'bomb', q: -rd(qk, 2), Ccal: Cc, T1: 25.0, quiet: true, edit: false } });
    if (shape === 'perg' || shape === 'permol' || shape === 'cal') { var pg = qk / g, Mf = mm(fu[1]);
      if (shape === 'permol') return P(base + 'Burning $' + qd(g, 4, 'g') + '$ of ' + fu[0] + ' (' + F(fu[1]) + ', $' + qm(Mf) + '$) raises its temperature by $' + gd(dT, 3) + '^\\circ\\text{C}$. Find the energy released per mole, in kJ/mol.', ans(pg * Mf, 0.01),
        ['$q = (' + gd(Cc, 2) + ')(' + gd(dT, 3) + ') = ' + qx(qk, 'kJ', 4) + '$ released.', 'Moles burned: $' + dfr(gd(g, 4), mmx(Mf)) + ' = ' + qx(g / Mf, 'mol', 4) + '$.', 'Per mole: $' + dfr(fx(qk, 4), fx(g / Mf, 4)) + ' = ' + qx(pg * Mf, 'kJmol') + '$.'], 'Heat released ÷ moles burned.', 'kJmol', { k: 'bmol', C: Cc, dT: dT, g: g, M: Mf });
      if (shape === 'cal') return P(base + 'Burning $' + qd(g, 4, 'g') + '$ of ' + fu[0] + ' raises its temperature by $' + gd(dT, 3) + '^\\circ\\text{C}$. How many food Calories (kilocalories, 1 Cal = 4.184 kJ) does one gram of ' + fu[0] + ' release?', ans(pg / 4.184, 0.01),
        ['$q = (' + gd(Cc, 2) + ')(' + gd(dT, 3) + ') = ' + qx(qk, 'kJ', 4) + '$; per gram $' + qx(pg, 'none', 4) + '\\ \\text{kJ/g}$.', 'In Calories: $' + fx(pg, 4) + '/4.184 = ' + fx(pg / 4.184, 3) + '\\ \\text{Cal/g}$.'], 'Find kJ per gram, then divide by 4.184.', 'Cal/g', { k: 'bcal', C: Cc, dT: dT, g: g });
      return P(base + 'Burning $' + qd(g, 4, 'g') + '$ of ' + fu[0] + ' raises its temperature by $' + gd(dT, 3) + '^\\circ\\text{C}$. How much energy does ' + fu[0] + ' release per gram, in kJ/g?', ans(pg, 0.01),
        ['$q = (' + gd(Cc, 2) + ')(' + gd(dT, 3) + ') = ' + qx(qk, 'kJ', 4) + '$ released.', 'Per gram: $' + dfr(fx(qk, 4), gd(g, 4)) + ' = ' + qx(pg, 'none') + '\\ \\text{kJ/g}$.'], 'Total heat ÷ grams burned.', 'kJ/g', { k: 'bperg', C: Cc, dT: dT, g: g }); }
    if (shape === 'Ccal') { var gb = R.pick([0.8000, 1.0000, 1.2000, 1.5000]), dTb = rd(26.38 * gb / Cc, 3);
      return P('Burning $' + qd(gb, 4, 'g') + '$ of benzoic acid (it releases $26.38\\ \\text{kJ/g}$) raises a bomb calorimeter\'s temperature by $' + gd(dTb, 3) + '^\\circ\\text{C}$. Find the calorimeter\'s heat capacity.', ans(26.38 * gb / dTb, 0.01),
        ['Heat released: $' + gd(gb, 4) + ' \\times 26.38 = ' + qx(26.38 * gb, 'kJ', 4) + '$, all absorbed by the calorimeter.', '$C_\\text{cal} = ' + dfr(fx(26.38 * gb, 4), gd(dTb, 3)) + ' = ' + qx(26.38 * gb / dTb, 'kJC', 4) + '$.'], 'Heat ÷ temperature change.', 'kJC', { k: 'Ccal', g: gb, dT: dTb }); }
    var gp = R.pick([0.5000, 0.8000, 1.0000]), dTp = fu[2] * gp / Cc;
    return P(base + 'By how much will its temperature rise when $' + qd(gp, 4, 'g') + '$ of ' + fu[0] + ' (which releases $' + gd(fu[2], 2) + '\\ \\text{kJ/g}$) burns in it?', ans(dTp, 0.01),
      ['Heat released: $' + gd(gp, 4) + ' \\times ' + gd(fu[2], 2) + ' = ' + qx(fu[2] * gp, 'kJ', 4) + '$.', '$\\Delta T = \\dfrac{q}{C_\\text{cal}} = ' + dfr(fx(fu[2] * gp, 4), gd(Cc, 2)) + ' = ' + qx(dTp, 'C') + '$.'], 'Heat ÷ heat capacity.', 'C', { k: 'bdT', g: gp, e: fu[2], C: Cc });
  });

  // Hess's law problems: target, steps [[equation, ΔH]], multipliers (negative = reversed)
  var HESS = [
    ['C(s) + 1/2O2(g) -> CO(g)', [['C(s) + O2(g) -> CO2(g)', -393.5], ['CO(g) + 1/2O2(g) -> CO2(g)', -283.0]], [1, -1]],
    ['N2(g) + 2O2(g) -> 2NO2(g)', [['N2(g) + O2(g) -> 2NO(g)', 180.5], ['2NO(g) + O2(g) -> 2NO2(g)', -114.1]], [1, 1]],
    ['2C(s) + H2(g) -> C2H2(g)', [['C(s) + O2(g) -> CO2(g)', -393.5], ['H2(g) + 1/2O2(g) -> H2O(l)', -285.8], ['C2H2(g) + 5/2O2(g) -> 2CO2(g) + H2O(l)', -1299.6]], [2, 1, -1]],
    ['C(graphite) -> C(diamond)', [['C(graphite) + O2(g) -> CO2(g)', -393.5], ['C(diamond) + O2(g) -> CO2(g)', -395.4]], [1, -1]],
    ['S(s) + 3/2O2(g) -> SO3(g)', [['S(s) + O2(g) -> SO2(g)', -296.8], ['2SO2(g) + O2(g) -> 2SO3(g)', -197.8]], [1, 0.5]],
    ['CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)', [['C(s) + 2H2(g) -> CH4(g)', -74.6], ['C(s) + O2(g) -> CO2(g)', -393.5], ['H2(g) + 1/2O2(g) -> H2O(l)', -285.8]], [-1, 1, 2]],
    ['3C(s) + 4H2(g) -> C3H8(g)', [['C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)', -2219.9], ['C(s) + O2(g) -> CO2(g)', -393.5], ['H2(g) + 1/2O2(g) -> H2O(l)', -285.8]], [-1, 3, 4]],
    ['2H2O2(l) -> 2H2O(l) + O2(g)', [['H2(g) + O2(g) -> H2O2(l)', -187.8], ['H2(g) + 1/2O2(g) -> H2O(l)', -285.8]], [-2, 2]],
    ['CO(g) + 2H2(g) -> CH3OH(l)', [['CO(g) + 1/2O2(g) -> CO2(g)', -283.0], ['H2(g) + 1/2O2(g) -> H2O(l)', -285.8], ['CH3OH(l) + 3/2O2(g) -> CO2(g) + 2H2O(l)', -726.1]], [1, 2, -1]]
  ];
  function eqHT(s) { return s.replace(/C\(graphite\)/g, 'C@G').replace(/C\(diamond\)/g, 'C@D').split(' -> ').map(function (side) { return side.split(' + ').map(function (t) { var m = /^(\d+\/\d+|\d+)?(.*)$/.exec(t); var c = m[1] ? (m[1].indexOf('/') > 0 ? '\\tfrac{' + m[1].split('/')[0] + '}{' + m[1].split('/')[1] + '}' : m[1]) + '\\,' : ''; var f = m[2] === 'C@G' ? '\\mathrm{C(graphite)}' : m[2] === 'C@D' ? '\\mathrm{C(diamond)}' : ft(m[2]); return c + f; }).join(' + '); }).join(' \\to '); }
  function multTxt(k) { var a = M.abs(k); return (k < 0 ? 'reversed' : 'as written') + (a !== 1 ? ' and ' + (a === 0.5 ? 'halved' : 'multiplied by ' + a) : ''); }

  G('gchem1.hess-law', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['calc', 'step', 'calc'], ['calc', 'calc', 'step'], ['calc', 'calc', 'step', 'tf']));
    var h = R.pick(ctx.level === 1 ? HESS.filter(function (x) { return x[1].length === 2; }) : HESS), tot = h[1].reduce(function (s, st, i) { return s + st[1] * h[2][i]; }, 0); tot = rd(tot, 1);
    var given = h[1].map(function (st, i) { return '(' + (i + 1) + ') $' + eqHT(st[0]) + '$, $\\Delta H = ' + sgnE(st[1], 'kJ') + '$'; }).join('; ');
    var steps = h[1].map(function (st, i) { return 'Equation (' + (i + 1) + ') ' + multTxt(h[2][i]) + ': $\\Delta H = ' + (h[2][i] === 1 ? '' : (h[2][i] === -1 ? '-' : h[2][i] + ' \\times ')) + '(' + gx(st[1]) + ') = ' + sgnE(rd(st[1] * h[2][i], 1), 'kJ') + '$.'; });
    if (shape === 'calc') return P('Use Hess\'s law to find $\\Delta H$ for $' + eqHT(h[0]) + '$, given ' + given + '.', { t: 'num', v: plainNum(tot), rtol: 0.003, tol: 0.15 },
      steps.concat(['The adjusted equations add up to the target (everything else cancels). $\\Delta H = ' + h[1].map(function (st, i) { return pn(rd(st[1] * h[2][i], 1)); }).join(' + ') + ' = ' + sgnE(tot, 'kJ') + '$.']),
      'Arrange each equation so the target\'s reactants are on the left and its products on the right.', 'kJ', { k: 'hess', i: HESS.indexOf(h) });
    if (shape === 'step') { var j = R.int(0, h[1].length - 1), right = multTxt(h[2][j]), opts = ['as written', 'reversed', 'multiplied by 2', 'reversed and multiplied by 2', 'halved', 'reversed and halved', 'multiplied by 3', 'multiplied by 4'].map(function (o) { return o === 'multiplied by 2' ? 'as written and multiplied by 2' : o === 'halved' ? 'as written and halved' : o === 'multiplied by 3' ? 'as written and multiplied by 3' : o === 'multiplied by 4' ? 'as written and multiplied by 4' : o; });
      return P('To find $\\Delta H$ for $' + eqHT(h[0]) + '$ from ' + given + ', how must equation (' + (j + 1) + ') be used?', mc(right, R.sample(opts.filter(function (o) { return o !== right; }), 3)),
        steps, 'Find where the target\'s species appear in each given equation.', null, { k: 'hstep' }); }
    var t = R.pick([['If an equation is reversed in a Hess\'s law calculation, its $\\Delta H$ changes sign.', true, 'The reverse reaction undoes the forward one, so its enthalpy change is the negative.'],
      ['$\\Delta H$ for a reaction depends on the route taken from reactants to products.', false, 'Enthalpy is a state function: any route between the same start and end gives the same $\\Delta H$.'],
      ['If an equation is doubled, its $\\Delta H$ stays the same.', false, 'Twice as much reaction exchanges twice as much heat: $\\Delta H$ doubles.'],
      ['Hess\'s law lets us find $\\Delta H$ for reactions that are hard to carry out directly.', true, 'For example, C + ½O₂ → CO, which can\'t be run cleanly.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Enthalpy is a state function.', null, { k: 'tf' });
  });

  // standard enthalpies of formation, kJ/mol (OpenStax Chemistry 2e Appendix G / NIST)
  var HF = { 'CO2(g)': -393.5, 'H2O(l)': -285.8, 'H2O(g)': -241.8, 'CH4(g)': -74.6, 'C2H6(g)': -84.0, 'C3H8(g)': -103.8, 'C2H5OH(l)': -277.6, 'CH3OH(l)': -239.2, 'NH3(g)': -45.9, 'NO(g)': 90.3, 'NO2(g)': 33.2,
    'SO2(g)': -296.8, 'SO3(g)': -395.7, 'CaCO3(s)': -1207.6, 'CaO(s)': -634.9, 'Fe2O3(s)': -824.2, 'Al2O3(s)': -1675.7, 'HCl(g)': -92.3, 'CO(g)': -110.5, 'C2H4(g)': 52.4, 'C6H12O6(s)': -1273.3, 'O2(g)': 0, 'H2(g)': 0, 'Fe(s)': 0, 'Al(s)': 0, 'N2(g)': 0, 'Cl2(g)': 0 };
  var FRX = [[[[1, 'CH4(g)'], [2, 'O2(g)']], [[1, 'CO2(g)'], [2, 'H2O(l)']]], [[[1, 'C3H8(g)'], [5, 'O2(g)']], [[3, 'CO2(g)'], [4, 'H2O(l)']]], [[[1, 'C2H5OH(l)'], [3, 'O2(g)']], [[2, 'CO2(g)'], [3, 'H2O(l)']]], [[[1, 'CaCO3(s)']], [[1, 'CaO(s)'], [1, 'CO2(g)']]],
    [[[2, 'SO2(g)'], [1, 'O2(g)']], [[2, 'SO3(g)']]], [[[4, 'NH3(g)'], [5, 'O2(g)']], [[4, 'NO(g)'], [6, 'H2O(g)']]], [[[1, 'Fe2O3(s)'], [3, 'CO(g)']], [[2, 'Fe(s)'], [3, 'CO2(g)']]], [[[1, 'C2H4(g)'], [1, 'H2(g)']], [[1, 'C2H6(g)']]],
    [[[2, 'NO(g)'], [1, 'O2(g)']], [[2, 'NO2(g)']]], [[[1, 'C6H12O6(s)'], [6, 'O2(g)']], [[6, 'CO2(g)'], [6, 'H2O(l)']]], [[[2, 'CH3OH(l)'], [3, 'O2(g)']], [[2, 'CO2(g)'], [4, 'H2O(l)']]], [[[1, 'Fe2O3(s)'], [2, 'Al(s)']], [[1, 'Al2O3(s)'], [2, 'Fe(s)']]], [[[1, 'H2(g)'], [1, 'Cl2(g)']], [[2, 'HCl(g)']]]];
  function sideTex(side) { return side.map(function (x) { return (x[0] > 1 ? x[0] + '\\,' : '') + ft(x[1]); }).join(' + '); }
  function sideSum(side) { return side.reduce(function (s, x) { return s + x[0] * HF[x[1]]; }, 0); }
  function sideSumTex(side) { return side.map(function (x) { return (x[0] > 1 ? x[0] : '') + '(' + gx(HF[x[1]]) + ')'; }).join(' + '); }

  G('gchem1.enthalpy-of-formation', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['rxn', 'rxn', 'zero'], ['rxn', 'back', 'zero'], ['rxn', 'back', 'tf', 'rxn']));
    var r = R.pick(FRX), sp = rd(sideSum(r[1]), 1), sr = rd(sideSum(r[0]), 1), dH = rd(sp - sr, 1), eqTx = sideTex(r[0]) + ' \\to ' + sideTex(r[1]);
    var used = r[0].concat(r[1]).map(function (x) { return x[1]; }).filter(function (x, i, a) { return a.indexOf(x) === i; });
    var data = used.map(function (s) { return '$' + ft(s) + '$: ' + gx(HF[s]); }).join('; ');
    if (shape === 'rxn') return P('Use standard enthalpies of formation (kJ/mol) to find $\\Delta H^\\circ$ for $' + eqTx + '$. Data: ' + data + '.', { t: 'num', v: plainNum(dH), rtol: 0.003, tol: 0.15 },
      ['Products: $' + sideSumTex(r[1]) + ' = ' + gx(sp) + '\\ \\text{kJ}$.', 'Reactants: $' + sideSumTex(r[0]) + ' = ' + gx(sr) + '\\ \\text{kJ}$ (elements in their standard states count 0).', '$\\Delta H^\\circ = ' + gx(sp) + ' - (' + gx(sr) + ') = ' + sgnE(dH, 'kJ') + '$.'],
      'Products minus reactants, each times its coefficient.', 'kJ', { k: 'hf', i: FRX.indexOf(r) });
    if (shape === 'back') { var cands = used.filter(function (s) { return HF[s] !== 0 && r[0].some(function (x) { return x[1] === s; }); }), unk = cands.length ? R.pick(cands) : used.filter(function (s) { return HF[s] !== 0; })[0], inR = r[0].some(function (x) { return x[1] === unk; }), coef = (inR ? r[0] : r[1]).filter(function (x) { return x[1] === unk; })[0][0];
      var data2 = used.filter(function (s) { return s !== unk; }).map(function (s) { return '$' + ft(s) + '$: ' + gx(HF[s]); }).join('; ');
      var known = rd((inR ? sp : sp - coef * HF[unk]) - (inR ? sr - coef * HF[unk] : sr), 1);
      return P('For $' + eqTx + '$, $\\Delta H^\\circ = ' + sgnE(dH, 'kJ') + '$. Using ' + data2 + ' (kJ/mol), find $\\Delta H^\\circ_\\text{f}$ of $' + ft(unk) + '$.', { t: 'num', v: plainNum(HF[unk]), rtol: 0.005, tol: 0.15 },
        ['$\\Delta H^\\circ = \\sum n\\Delta H^\\circ_\\text{f}(\\text{products}) - \\sum n\\Delta H^\\circ_\\text{f}(\\text{reactants})$, with the unknown $x$ for $' + ft(unk) + '$.', 'Everything known: ' + (inR ? 'products $' + gx(sp) + '$, other reactants $' + gx(rd(sr - coef * HF[unk], 1)) + '$' : 'other products $' + gx(rd(sp - coef * HF[unk], 1)) + '$, reactants $' + gx(sr) + '$') + '.',
          (inR ? '$' + gx(dH) + ' = ' + gx(sp) + ' - (' + gx(rd(sr - coef * HF[unk], 1)) + ' + ' + (coef > 1 ? coef : '') + 'x)$' : '$' + gx(dH) + ' = (' + gx(rd(sp - coef * HF[unk], 1)) + ' + ' + (coef > 1 ? coef : '') + 'x) - (' + gx(sr) + ')$') + ', so $x = ' + gx(HF[unk]) + '\\ \\text{kJ/mol}$.'],
        'Write the products-minus-reactants equation with one unknown and solve.', 'kJmol', { k: 'hfback', i: FRX.indexOf(r), unk: unk }); }
    if (shape === 'zero') { var z = R.pick(['O2(g)', 'H2(g)', 'N2(g)', 'Fe(s)', 'Cl2(g)']), nz = R.sample(['H2O(l)', 'CO2(g)', 'O3(g)', 'C(diamond)', 'Br2(g)', 'CH4(g)', 'NO(g)'], 3);
      return P('Which substance has a standard enthalpy of formation of exactly zero?', mc('$' + ft(z) + '$', nz.map(function (x) { return x === 'C(diamond)' ? '$\\mathrm{C(diamond)}$' : '$' + ft(x) + '$'; })),
        ['$\\Delta H^\\circ_\\text{f} = 0$ only for an element in its standard state (its most stable form at 1 bar and 25 °C).', '$' + ft(z) + '$ is such an element. Compounds are not zero, and neither are less stable forms of elements: ozone, diamond and gaseous bromine (bromine is a liquid at 25 °C).'],
        'Elements in their standard states are the reference: zero.', null, { k: 'zero' }); }
    var t = R.pick([['$\\Delta H^\\circ_\\text{f}$ of $\\mathrm{O_2(g)}$ is zero.', true, 'It is an element in its standard state.'],
      ['$\\Delta H^\\circ_\\text{rxn} = \\sum \\Delta H^\\circ_\\text{f}(\\text{reactants}) - \\sum \\Delta H^\\circ_\\text{f}(\\text{products})$.', false, 'It is products minus reactants.'],
      ['$\\Delta H^\\circ_\\text{f}$ of $\\mathrm{H_2O(l)}$ and of $\\mathrm{H_2O(g)}$ are equal.', false, 'They differ by the enthalpy of vaporization: $-285.8$ and $-241.8$ kJ/mol.'],
      ['Each $\\Delta H^\\circ_\\text{f}$ must be multiplied by the coefficient of that substance in the balanced equation.', true, 'The table gives values per mole.']]);
    return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Products minus reactants; elements are zero.', null, { k: 'tf' });
  });

  // Born–Haber data (kJ/mol): [salt, metal, ΔH sublimation, [ionization energies], halogen, ΔH to make one gaseous halogen atom, electron affinity per atom (ΔH), ΔHf of salt, halogen atoms per formula unit]
  var BH = [['NaCl', 'Na', 107.5, [495.8], 'Cl', 121.3, -348.6, -411.2, 1], ['KCl', 'K', 89.0, [418.8], 'Cl', 121.3, -348.6, -436.5, 1], ['LiF', 'Li', 159.3, [520.2], 'F', 79.4, -328.2, -616.0, 1], ['NaF', 'Na', 107.5, [495.8], 'F', 79.4, -328.2, -576.6, 1],
    ['NaBr', 'Na', 107.5, [495.8], 'Br', 111.9, -324.6, -361.1, 1], ['KBr', 'K', 89.0, [418.8], 'Br', 111.9, -324.6, -393.8, 1], ['MgCl2', 'Mg', 147.1, [737.7, 1450.7], 'Cl', 121.3, -348.6, -641.3, 2], ['CaCl2', 'Ca', 177.8, [589.8, 1145.4], 'Cl', 121.3, -348.6, -795.4, 2],
    ['LiCl', 'Li', 159.3, [520.2], 'Cl', 121.3, -348.6, -408.6, 1], ['KF', 'K', 89.0, [418.8], 'F', 79.4, -328.2, -567.3, 1], ['NaI', 'Na', 107.5, [495.8], 'I', 106.8, -295.2, -287.8, 1], ['KI', 'K', 89.0, [418.8], 'I', 106.8, -295.2, -327.9, 1],
    ['SrCl2', 'Sr', 164.4, [549.5, 1064.2], 'Cl', 121.3, -348.6, -828.9, 2], ['BaCl2', 'Ba', 180.0, [502.9, 965.2], 'Cl', 121.3, -348.6, -855.0, 2]];
  function bhSum(b) { return b[2] + b[3].reduce(function (s, x) { return s + x; }, 0) + b[8] * (b[5] + b[6]); }
  function bhData(b, omit) {
    var X = { Cl: 'Cl_2(g)', F: 'F_2(g)', Br: 'Br_2(l)', I: 'I_2(s)' }[b[4]], items = [];
    if (omit !== 'sub') items.push('$\\Delta H_\\text{sub}(\\mathrm{' + b[1] + '}) = ' + gx(b[2]) + '$');
    if (omit !== 'ie') b[3].forEach(function (x, i) { items.push('$IE_' + (i + 1) + '(\\mathrm{' + b[1] + '}) = ' + gx(x) + '$'); });
    items.push((b[8] === 1 ? '$\\tfrac{1}{2}\\mathrm{' + X + '} \\to \\mathrm{' + b[4] + '(g)}$: $' + gx(b[5]) + '$' : '$\\mathrm{' + X + '} \\to 2\\,\\mathrm{' + b[4] + '(g)}$: $' + gx(rd(2 * b[5], 1)) + '$'));
    if (omit !== 'ea') items.push('$EA(\\mathrm{' + b[4] + '}) = ' + gx(b[6]) + '$ per atom');
    if (omit !== 'hf') items.push('$\\Delta H^\\circ_\\text{f}(\\mathrm{' + ft(b[0]).replace(/\\mathrm\{|\}$/g, '') + '}) = ' + gx(b[7]) + '$');
    return items.join(', ') + ' (all kJ/mol)';
  }

  G('gchem1.born-haber', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['U', 'U', 'step'], ['U', 'hf', 'step', 'ie'], ['U', 'ea', 'hf', 'ie']));
    var b = R.pick(ctx.level === 1 ? BH.filter(function (x) { return x[8] === 1; }) : BH), pre = rd(bhSum(b), 1), U = rd(pre - b[7], 1);
    var preTx = gx(b[2]) + ' + ' + b[3].map(gx).join(' + ') + ' + ' + (b[8] === 1 ? gx(b[5]) + ' + (' + gx(b[6]) + ')' : '2(' + gx(b[5]) + ') + 2(' + gx(b[6]) + ')') + ' = ' + gx(pre);
    var cyc = '$\\Delta H^\\circ_\\text{f} = \\Delta H_\\text{sub} + \\sum IE + ' + (b[8] === 1 ? '\\Delta H(\\mathrm{X(g)})' : '2\\Delta H(\\mathrm{X(g)})') + ' + ' + (b[8] === 1 ? 'EA' : '2EA') + ' - U$.';
    if (shape === 'U') return P('Use a Born–Haber cycle to find the lattice energy $U$ of ' + F(b[0]) + ' (the energy needed to separate it into gaseous ions, a positive number). Data: ' + bhData(b) + '.', { t: 'num', v: plainNum(U), rtol: 0.003 },
      [cyc, 'Steps before the lattice forms: $' + preTx + '\\ \\text{kJ}$' + (b[3].length > 1 ? ' (both ionization energies are needed for a 2+ ion)' : '') + '.', '$' + gx(b[7]) + ' = ' + gx(pre) + ' - U$, so $U = ' + gx(pre) + ' - (' + gx(b[7]) + ') = ' + qg(U, 'kJmol') + '$.'],
      'Add up the steps that make the gaseous ions; the lattice step closes the cycle.', 'kJmol', { k: 'U', i: BH.indexOf(b) }, ['NaCl', 'KCl', 'LiF'].indexOf(b[0]) >= 0 ? { name: 'ch-energydiagram', opts: { mode: 'bornhaber', salt: b[0], quiet: true, edit: false } } : null);
    if (shape === 'hf') { var Ug = rd(U, 0), hf = rd(pre - Ug, 1);
      return P('The lattice energy of ' + F(b[0]) + ' is $' + qg(Ug, 'kJmol') + '$. Use a Born–Haber cycle to find $\\Delta H^\\circ_\\text{f}$ of ' + F(b[0]) + '. Data: ' + bhData(b, 'hf') + '.', { t: 'num', v: plainNum(hf), rtol: 0.005, tol: 0.15 },
        [cyc, 'Steps to the gaseous ions: $' + preTx + '\\ \\text{kJ}$.', '$\\Delta H^\\circ_\\text{f} = ' + gx(pre) + ' - ' + gx(Ug) + ' = ' + sgnE(hf, 'kJ/mol') + '$.'], 'The cycle sums to the formation enthalpy.', 'kJmol', { k: 'hfBH', i: BH.indexOf(b), U: Ug }); }
    if (shape === 'ie') { var Ug3 = rd(U, 0), ieT = b[3].reduce(function (s, x) { return s + x; }, 0), restI = rd(b[2] + b[8] * (b[5] + b[6]), 1), ieF = rd(b[7] + Ug3 - restI, 1), lastIE = rd(ieF - (b[3].length > 1 ? b[3][0] : 0), 1);
      var dataI = bhData(b, 'ie') + (b[3].length > 1 ? ', $IE_1(\\mathrm{' + b[1] + '}) = ' + gx(b[3][0]) + '$' : '');
      return P('Use a Born–Haber cycle to find ' + (b[3].length > 1 ? 'the second ionization energy' : 'the first ionization energy') + ' of ' + b[1] + ', given that the lattice energy of ' + F(b[0]) + ' is $' + qg(Ug3, 'kJmol') + '$ and ' + dataI + '.', { t: 'num', v: plainNum(lastIE), rtol: 0.01 },
        [cyc, 'Known steps besides ionization: $' + gx(b[2]) + ' + ' + (b[8] > 1 ? '2(' + gx(b[5]) + ') + 2(' + gx(b[6]) + ')' : gx(b[5]) + ' + (' + gx(b[6]) + ')') + ' = ' + gx(restI) + '$.', '$' + gx(b[7]) + ' = ' + gx(restI) + ' + \\sum IE - ' + gx(Ug3) + '$, so $\\sum IE = ' + gx(ieF) + '$' + (b[3].length > 1 ? ' and $IE_2 = ' + gx(ieF) + ' - ' + gx(b[3][0]) + ' = ' + gx(lastIE) + '$' : '') + ' kJ/mol.'],
        'Solve the cycle for the one unknown step.', 'kJmol', { k: 'ie', i: BH.indexOf(b), U: Ug3 }); }
    if (shape === 'ea') { var Ug2 = rd(U, 0), rest = rd(b[2] + b[3].reduce(function (s, x) { return s + x; }, 0) + b[8] * b[5], 1), ea = rd((b[7] + Ug2 - rest) / b[8], 1);
      return P('Use a Born–Haber cycle to find the electron affinity of ' + b[4] + ' (ΔH for ' + b[4] + '(g) + e⁻ → ' + b[4] + '⁻(g)), given that the lattice energy of ' + F(b[0]) + ' is $' + qg(Ug2, 'kJmol') + '$ and ' + bhData(b, 'ea') + '.', { t: 'num', v: plainNum(ea), rtol: 0.01 },
        [cyc, 'Known steps: $' + gx(b[2]) + ' + ' + b[3].map(gx).join(' + ') + ' + ' + (b[8] > 1 ? '2(' + gx(b[5]) + ')' : gx(b[5])) + ' = ' + gx(rest) + '$.', '$' + gx(b[7]) + ' = ' + gx(rest) + (b[8] > 1 ? ' + 2EA' : ' + EA') + ' - ' + gx(Ug2) + '$, so ' + (b[8] > 1 ? '$2EA = ' + gx(rd(b[7] + Ug2 - rest, 1)) + '$ and ' : '') + '$EA = ' + gx(ea) + '\\ \\text{kJ/mol}$ (negative: energy is released).'],
        'Solve the cycle for the one unknown step.', 'kJmol', { k: 'ea', i: BH.indexOf(b), U: Ug2 }); }
    var sq = R.pick([[F('NaCl') + ' needs how much of the Cl–Cl bond energy in its Born–Haber cycle?', 'half the bond energy, since one Cl atom comes from ½ mol of Cl₂', ['the whole bond energy', 'twice the bond energy', 'none: the bond is not broken']], [F('MgCl2') + ' needs which ionization energies of magnesium in its Born–Haber cycle?', 'the first and the second', ['only the first', 'only the second', 'the first, second and third']], ['In a Born–Haber cycle, which step releases the most energy?', 'the gaseous ions coming together to form the solid lattice', ['ionizing the metal atom', 'turning the solid metal into a gas', 'breaking the halogen–halogen bond']]]);
    return P(sq[0], mc(sq[1], sq[2]), ['Build the salt from its elements one step at a time: atomize the metal, make the halogen atoms (half a mole of X₂ per X atom), ionize the metal (as many ionization energies as its charge), add electrons to the halogen atoms, then let the ions form the lattice.', 'Answer: ' + sq[1] + '.'], 'Write the cycle with the formula\'s coefficients.', null, { k: 'bhstep' });
  });


  // exposed for the course's node tests
  ML.gchem1Helpers = { sfStr: sfStr, fx: fx, gx: gx, ft: ft, eqT: eqT, mm: mm, parseF: parseF, AM: AM, wideMath: wideMath,
    data: { HESS: HESS, HF: HF, FRX: FRX, BH: BH, BRX: BRX, RDX: RDX, NONRDX: NONRDX, PRECIP: PRECIP, OXN: OXN, FCS: FCS, OCT: OCT, V56: V56, HYB: HYB, SP: SP, BPD: BPD, BPPAIRS: BPPAIRS, IR: IR, SALT: SALT, BD: BD, COLL: COLL, VDWD: VDWD, HRX: HRX, TCE: TCE, RES: RES } };
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

  /* ===== gchem1 ===== */
  function cf(s) { var p = String(s).split('^'), b = p[0].replace(/([A-Za-z)\]])(\d+)/g, '$1_{$2}'); return '$\\mathrm{' + b + (p[1] ? '^{' + p[1] + '}' : '') + '}$'; }

  T('gchem1.photoelectron-spectroscopy', { share: { 1: 0.35 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['In a photoelectron spectrum, the tallest peak belongs to the electrons with the highest binding energy', false, 'Height counts electrons, not energy'], ['The peak with the highest binding energy comes from the electrons closest to the nucleus', true],
      ['The valence electrons give the peak with the lowest binding energy', true], ['Two peaks of equal height in one spectrum come from subshells with the same number of electrons', true], ['Each peak in a photoelectron spectrum stands for one subshell', true],
      ['The 1s peak of sodium is at a higher binding energy than the 1s peak of lithium', true, 'Sodium has more protons pulling on its 1s electrons'], ['A 2p peak is three times as tall as a 2s peak in neon', true, 'Six 2p electrons against two 2s electrons'],
      ['All the electrons of an atom have the same binding energy', false], ['Binding energy = photon energy − kinetic energy of the ejected electron', true], ['The 3s electrons of magnesium are held more tightly than its 2p electrons', false, 'The 3s electrons are farther out and easier to remove']] });

  T('gchem1.resonance', { share: { 1: 0.45, 2: 0.45, 3: 0.45 },
    sort: { cats: { r: ['drawn with resonance structures', 'species that need resonance structures', 'Has resonance'], n: ['described well by one Lewis structure', 'species with one Lewis structure', 'No resonance'] }, catq: 'Does this species need resonance structures to describe it? {x}', items: [
      [cf('NO3^-'), 'r'], [cf('CO3^2-'), 'r'], [cf('O3'), 'r'], [cf('NO2^-'), 'r'], [cf('SO2'), 'r'], [cf('HCOO^-'), 'r'], [cf('CH3COO^-'), 'r'], [cf('C6H6') + ' (benzene)', 'r'], [cf('SO3'), 'r'], [cf('HCO3^-'), 'r'],
      [cf('NH3'), 'n'], [cf('CH4'), 'n'], [cf('H2O'), 'n'], [cf('CCl4'), 'n'], [cf('HF'), 'n'], [cf('PCl3'), 'n'], [cf('CH3OH'), 'n'], [cf('NH4^+'), 'n'], [cf('H2S'), 'n'], [cf('C2H6'), 'n']] },
    tf: [['A molecule flips rapidly between its resonance structures', false, 'The real molecule is one blend (hybrid) all the time'], ['In nitrate, all three N–O bonds have the same length', true], ['Resonance structures differ only in where electrons are placed, not atoms', true],
      ['The average N–O bond order in nitrate is 4/3', true], ['In ozone, one O–O bond is single and the other is double at any moment', false, 'Both bonds are the same, with bond order 3/2'], ['Benzene\'s C–C bonds are all the same length', true],
      ['Resonance spreads charge and makes an ion more stable', true], ['Resonance structures may move atoms to new positions', false, 'Only electrons move'], ['The average C–O bond order in carbonate is 4/3', true]] });

  T('gchem1.gas-solubility', { share: { 3: 0.3 }, forms: { 3: ['tf1', 'tf'] },
    tf: [['Gases dissolve less in warm water than in cold water', true], ['Henry\'s law says gas solubility is proportional to its partial pressure', true], ['Opening a soda lowers the CO₂ pressure, so CO₂ comes out of solution', true],
      ['Like most solids, gases dissolve better in hot water than in cold water', false], ['Doubling the partial pressure of a gas doubles its solubility', true], ['Warm lakes hold less dissolved oxygen than cold lakes', true], ['Henry\'s law constant is the same for every gas', false]] });

  T('gchem1.oxidation-numbers', { share: { 1: 0.45 }, forms: { 1: ['custom', 'custom', 'tf'] },
    make: function (R) {
      var X = R.pick([['ClO4^-', 'Cl', 7], ['ClO3^-', 'Cl', 5], ['ClO2^-', 'Cl', 3], ['ClO^-', 'Cl', 1], ['SO4^2-', 'S', 6], ['SO3^2-', 'S', 4], ['H2S', 'S', -2], ['NO3^-', 'N', 5], ['NO2^-', 'N', 3], ['NH4^+', 'N', -3], ['NH3', 'N', -3], ['N2O', 'N', 1], ['NO', 'N', 2], ['NO2', 'N', 4],
        ['MnO4^-', 'Mn', 7], ['MnO2', 'Mn', 4], ['Cr2O7^2-', 'Cr', 6], ['CrO4^2-', 'Cr', 6], ['Fe2O3', 'Fe', 3], ['FeO', 'Fe', 2], ['CO2', 'C', 4], ['CO', 'C', 2], ['CH4', 'C', -4], ['H2O2', 'O', -1], ['PO4^3-', 'P', 5], ['HNO3', 'N', 5], ['H2SO4', 'S', 6], ['KMnO4', 'Mn', 7], ['Na2O2', 'O', -1], ['NaH', 'H', -1], ['OF2', 'O', 2], ['Cu2O', 'Cu', 1], ['SnCl4', 'Sn', 4], ['V2O5', 'V', 5]]);
      return { q: 'What is the oxidation number of ' + X[1] + ' in ' + cf(X[0]) + '?', a: { t: 'num', v: String(X[2]) }, hint: 'The oxidation numbers add up to the charge of the species. O is usually −2, H usually +1.',
        steps: ['The oxidation numbers must add up to the overall charge of ' + cf(X[0]) + '.', 'So ' + X[1] + ' is <b>' + (X[2] > 0 ? '+' : '') + X[2] + '</b>.'] };
    },
    tf: [['The oxidation number of an atom in a pure element is zero', true], ['In compounds, fluorine is always −1', true], ['Oxygen is −2 in almost all compounds, but −1 in peroxides', true], ['The oxidation numbers in a neutral compound add up to zero', true],
      ['Hydrogen is −1 in metal hydrides such as NaH', true], ['In SO₄²⁻, every atom has an oxidation number of −2', false, 'Sulfur is +6']] });

  T('gchem1.heating-curve-calculations', { share: { 1: 0.25 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['While ice melts at 0 °C, its temperature stays the same as heat is added', true], ['Boiling water takes more energy per gram than melting ice', true], ['On a heating curve, the flat parts are phase changes', true],
      ['Heating liquid water from 0 °C to 100 °C takes more energy than boiling it all away', false, 'Boiling takes about five times as much'], ['q = mcΔT is used for the sloped parts of a heating curve', true], ['The temperature rises while a substance boils', false, 'It stays at the boiling point']] });

  T('gchem1.hess-law', { share: { 3: 0.35 }, forms: { 3: ['tf1', 'tf'] },
    tf: [['If an equation is reversed in a Hess\'s law calculation, its ΔH changes sign', true], ['If an equation is doubled, its ΔH stays the same', false, 'ΔH doubles too'], ['Hess\'s law works because enthalpy is a state function', true],
      ['ΔH for a reaction depends on the path taken', false, 'It depends only on the start and end'], ['Halving an equation halves its ΔH', true], ['Equations can be added, and their ΔH values add too', true],
      ['Intermediates that appear on both sides cancel when equations are added', true], ['Reversing an equation keeps the same ΔH', false]] });

  T('gchem1.enthalpy-of-formation', { share: { 3: 0.4 }, forms: { 3: ['tf1', 'tf', 'one', 'not'] },
    sort: { cats: { z: ['an element in its standard state (ΔH°f = 0)', 'elements in their standard states', 'Zero'], n: ['a substance whose ΔH°f is not zero', 'substances whose ΔH°f is not zero', 'Not zero'] }, items: [
      [cf('O2(g)'), 'z'], [cf('H2(g)'), 'z'], [cf('N2(g)'), 'z'], [cf('Fe(s)'), 'z'], [cf('Cl2(g)'), 'z'], [cf('Br2(l)'), 'z'], [cf('C(graphite)'), 'z'], [cf('Na(s)'), 'z'], [cf('Hg(l)'), 'z'],
      [cf('O3(g)'), 'n'], [cf('C(diamond)'), 'n'], [cf('Br2(g)'), 'n'], [cf('H2O(l)'), 'n'], [cf('CO2(g)'), 'n'], [cf('Na(g)'), 'n'], [cf('CH4(g)'), 'n'], [cf('O(g)'), 'n']] },
    tf: [['ΔH°f of O₂(g) is zero', true], ['ΔH°f of O₃(g) is zero', false, 'Ozone is not the standard state of oxygen'], ['ΔH°rxn = Σ n ΔH°f(products) − Σ n ΔH°f(reactants)', true],
      ['ΔH°f of H₂O(l) and of H₂O(g) are the same', false, 'They differ by the enthalpy of vaporization'], ['A negative ΔH°f means the compound is lower in enthalpy than its elements', true], ['ΔH°f of C(diamond) is zero', false, 'Graphite is the standard state of carbon']] });

  T('gchem1.born-haber', { share: { 1: 0.3 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['Forming the solid lattice from gaseous ions releases a large amount of energy', true], ['Ionizing a metal atom releases energy', false, 'Ionization always takes energy'], ['Turning a solid metal into a gas takes energy (sublimation)', true],
      ['Breaking the Cl–Cl bond takes energy', true], ['For NaCl, only half a mole of Cl₂ bonds must be broken per mole of NaCl', true], ['A Born–Haber cycle uses Hess\'s law', true],
      ['Lattice energy is larger for ions with bigger charges', true], ['Adding an electron to a chlorine atom takes in energy', false, 'For chlorine it releases energy']] });

  /* ---- more topics, so variety does not lean on the extra forms ---- */
  T('gchem1.gas-solubility', { share: { 1: 0.45 }, forms: { 1: ['tf', 'tf1'] } });
  T('gchem1.born-haber', { share: { 3: 0.35 }, forms: { 3: ['tf1', 'tf'] } });
  T('gchem1.effective-nuclear-charge', { share: { 1: 0.45 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['Electrons in the same shell shield each other about as well as core electrons do', false, 'Same-shell electrons shield poorly'], ['Across a period, Zeff on the valence electrons increases', true], ['Down a group, the simple Zeff on the valence electrons stays about the same', true],
      ['A potassium atom\'s valence electron feels the full charge of 19 protons', false, 'Its 18 core electrons hide nearly all of it'], ['Core electrons shield valence electrons well', true], ['Zeff ≈ Z − (core electrons) in the simple model', true],
      ['Chlorine\'s valence electrons feel a larger Zeff than sodium\'s', true], ['A larger Zeff pulls valence electrons closer, making the atom smaller', true], ['Fluorine and chlorine have the same simple Zeff', true, 'Both are about 7'], ['Zeff decreases across a period', false]] });
  T('gchem1.trend-exceptions', { share: { 1: 0.5 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['Oxygen has a lower first ionization energy than nitrogen', true], ['Boron has a lower first ionization energy than beryllium', true], ['Aluminum has a higher first ionization energy than magnesium', false], ['Sulfur has a lower first ionization energy than phosphorus', true],
      ['Carbon has a higher first ionization energy than boron', true], ['Neon has the highest first ionization energy in period 2', true], ['Nitrogen\'s half-filled 2p subshell makes its electrons a little harder to remove', true], ['First ionization energy rises perfectly smoothly across every period', false, 'There are dips after groups 2 and 15'],
      ['Magnesium has a higher first ionization energy than aluminum', true], ['Phosphorus has a lower first ionization energy than sulfur', false]] });
  T('gchem1.metals-alloys', { share: { 1: 0.6 },
    sort: { cats: { s: ['a substitutional alloy', 'substitutional alloys', 'Substitutional'], i: ['an interstitial alloy', 'interstitial alloys', 'Interstitial'] }, catq: 'Is this a substitutional or an interstitial alloy? {x}', items: [['brass (copper and zinc)', 's'], ['bronze (copper and tin)', 's'], ['sterling silver (silver and copper)', 's'], ['white gold (gold and nickel or palladium)', 's'], ['steel (iron with a little carbon)', 'i']] },
    tf: [['In a metal, the electrons carry the current while the cations stay in their places', true], ['Metals are malleable because layers of cations can slide while the electron sea holds them together', true], ['Metals conduct electricity because their valence electrons are delocalized', true],
      ['Alloys are always weaker than the pure metal', false, 'Many alloys are harder and stronger'], ['Adding small carbon atoms into the gaps of iron makes steel harder', true], ['In a substitutional alloy, atoms of similar size replace each other', true],
      ['Metals are good conductors of heat', true], ['Metallic bonds are between pairs of atoms that share two electrons', false, 'The electrons are shared by the whole crystal'], ['Pure gold is soft, so jewelers often alloy it with other metals', true]] });
  T('gchem1.separations', { share: { 3: 0.5 }, forms: { 3: ['tf1', 'tf', 'cat'] },
    sort: { cats: { f: ['filtration', 'filtration', 'Filtration'], d: ['distillation', 'distillation', 'Distillation'], c: ['chromatography', 'chromatography', 'Chromatography'], e: ['evaporation', 'evaporation', 'Evaporation'] }, catq: 'Which method best separates this mixture? {x}', items: [
      ['sand from water', 'f'], ['coffee grounds from brewed coffee', 'f'], ['chalk dust from water', 'f'], ['ethanol from water', 'd'], ['fresh water from seawater, collecting the water', 'd'], ['the dyes in a black marker', 'c'], ['the pigments in a spinach leaf', 'c'], ['salt from seawater, keeping the salt', 'e'], ['sugar from sugar water, keeping the sugar', 'e']] },
    tf: [['In fractional distillation, the first vapor is richer in the component with the lower boiling point', true], ['Filtration separates dissolved salt from water', false, 'Dissolved particles pass through the filter'], ['In paper chromatography, a substance that sticks less to the paper travels farther', true],
      ['Rf = distance moved by the substance ÷ distance moved by the solvent', true], ['Distillation separates liquids by differences in boiling point', true], ['An Rf value can be greater than 1', false]] });
  T('gchem1.redox-reactions', { share: { 1: 0.5 }, forms: { 1: ['tf', 'tf1'] },
    tf: [['Oxidation is loss of electrons', true], ['Reduction is gain of electrons', true], ['The substance that is oxidized is the reducing agent', true], ['The oxidizing agent is itself oxidized', false, 'It is reduced'], ['A neutralization reaction such as HCl + NaOH is a redox reaction', false, 'No oxidation numbers change'],
      ['Combustion of methane is a redox reaction', true], ['In Zn + Cu²⁺ → Zn²⁺ + Cu, zinc is oxidized', true], ['In a redox reaction, electrons lost equal electrons gained', true], ['Precipitation reactions are always redox reactions', false], ['A metal reacting with an acid to give hydrogen gas is a redox reaction', true]] });

  /* ---- auto shares: every level still under 60% on its own also draws from the bank (never lowers a share set above) ---- */
  (function () { var up = function (id, s) { var b = BK[id], tf = (b && b.tf) || []; if (!b) return; if (!(b.sort || b.pair || b.yn || (tf.filter(function (x) { return x[1]; }).length >= 3 && tf.filter(function (x) { return !x[1]; }).length >= 3))) return; b.share = b.share || {}; Object.keys(s).forEach(function (L) { b.share[L] = Math.max(b.share[L] || 0, s[L]); }); };
    up('gchem1.photoelectron-spectroscopy', { 1: 0.35 });
    up('gchem1.effective-nuclear-charge', { 1: 0.35, 2: 0.35, 3: 0.35 });
    up('gchem1.trend-exceptions', { 1: 0.35 });
    up('gchem1.metals-alloys', { 1: 0.5, 2: 0.35, 3: 0.35 });
    up('gchem1.separations', { 1: 0.35, 3: 0.35 });
    up('gchem1.gas-solubility', { 1: 0.5, 3: 0.35 });
    up('gchem1.oxidation-numbers', { 1: 0.35, 2: 0.35 });
    up('gchem1.redox-reactions', { 2: 0.35 });
    up('gchem1.hess-law', { 1: 0.35, 2: 0.5, 3: 0.35 });
    up('gchem1.enthalpy-of-formation', { 1: 0.35, 3: 0.35 });
    up('gchem1.born-haber', { 1: 0.5, 2: 0.35, 3: 0.5 });
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
  var COURSE = 'gchem1', YOUNG = false, VAR = {};
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
