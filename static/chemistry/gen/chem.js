/* Generators for chem, merged from part files by /tmp/merge_parts.js (edit the parts, not this file). */
/* ---- part A ---- */
/* Chemistry Ladder: generators for Chemistry (chem), part A: units matter, atoms, electrons, periodic, bonding,
   particle-forces and mole (44 topics). One generator per topic, registered with MathLadder.gen(id, fn(R, ctx)).
   Levels: 1 gentlest (learning), 2 (reviews, checkpoints, placement), 3 (later reviews). Atomic masses to two decimals
   (IUPAC values via NIST); N_A = 6.022e23. Built from /tmp/work_chem_A/gen by build.js; checked by /tmp/work_chem_A/verify.js. */
(function (ML) {
  'use strict';
  // Rough rendered width of a TeX math string, measured in "characters" (about 9 px each at body size).
  // Used to turn long inline math into display math (which scrolls sideways on narrow screens instead of widening the page).
  function texWidth(t) {
    function grp(s, k) { var d = 0; for (var q = k; q < s.length; q++) { if (s[q] === '{') d++; else if (s[q] === '}') { d--; if (!d) return [s.slice(k + 1, q), q]; } } return ['', s.length]; }
    t = String(t);
    // matrices, arrays and aligned blocks: as wide as their widest row
    var env = /\\begin\{(bmatrix|pmatrix|vmatrix|matrix|array|aligned|cases)\}(\{[^}]*\})?([\s\S]*?)\\end\{\1\}/;
    var guard = 0, m;
    while ((m = env.exec(t)) && guard++ < 30) {
      var rows = m[3].split('\\\\'), w = 0;
      rows.forEach(function (r) { var cells = r.split('&'), rw = 0; cells.forEach(function (c) { rw += texWidth(c) + 2.2; }); w = Math.max(w, rw); });
      t = t.slice(0, m.index) + 'x'.repeat(Math.ceil(w + 3)) + t.slice(m.index + m[0].length);
    }
    t = t.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\(left|right|displaystyle|bigl|bigr|Big|big)/g, '');
    t = t.replace(/\\[,;!:]|\\quad|\\qquad|\\ /g, ' ');
    guard = 0;
    while (/\\[dt]?frac\{/.test(t) && guard++ < 60) {
      var i = t.search(/\\[dt]?frac\{/), j = t.indexOf('{', i), a = grp(t, j), b = grp(t, a[1] + 1);
      t = t.slice(0, i) + 'x'.repeat(Math.ceil(Math.max(texWidth(a[0]), texWidth(b[0])))) + t.slice(b[1] + 1);
    }
    t = t.replace(/\\sqrt\{/g, 'xx{').replace(/\\pm/g, 'xx');
    t = t.replace(/\^\{[^{}]*\}|_\{[^{}]*\}/g, function (s) { return 'x'.repeat(Math.ceil((s.length - 3) * 0.6)); });
    t = t.replace(/\\(operatorname\{[a-z]+\})/g, 'xxxx');
    t = t.replace(/\\(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|ln|log|det|lim|proj)/g, 'xxx');
    t = t.replace(/\\[a-zA-Z]+/g, 'x');
    t = t.replace(/[{}^_]/g, '');
    var n = 0; for (var k = 0; k < t.length; k++) n += /[=+<>\-]/.test(t[k]) ? 1.8 : t[k] === ' ' ? 0 : t[k] === ',' ? 0.6 : 1;
    return n;
  }
  // Rewrite a text: inline math wider than lim becomes display math.
  function widenText(s, ML, lim) {
    if (typeof s !== 'string' || !ML || !ML.mathSegments) return s;
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
  
  
  // ======================= 00-helpers.js
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  var abs = Math.abs;
  /* fx(x): no float noise (0.30000000000000004 -> 0.3) */
  function fx(x) { return +(+x).toPrecision(12); }
  /* sg(x, n): x rounded to n significant figures, as a number */
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  /* sv(x, n): the answer string for a spec: n significant figures (default 3), e-notation for very large or small values */
  function sv(x, n) {
    var y = sg(x, n || 3); if (y === 0) return '0';
    var e = Math.floor(Math.log10(abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fx(y / Math.pow(10, e)); return String(m) + 'e' + e; }
    return String(fx(y));
  }
  /* tn(x, n): a number for TeX with n significant figures (trailing zeros dropped), x 10^k when large or tiny */
  function tn(x, n) {
    var y = sg(x, n || 3); if (y === 0) return '0';
    var e = Math.floor(Math.log10(abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fx(y / Math.pow(10, e)); return (m < 0 ? '-' : '') + String(abs(m)) + ' \\times 10^{' + e + '}'; }
    if (abs(y) >= 10000) return T.commas(y);
    return String(fx(y));
  }
  /* tk(x, n): like tn but keeps trailing zeros (n significant figures shown): tk(2.5, 3) -> "2.50" */
  function tk(x, n) {
    n = n || 3; if (x === 0) return '0';
    var e = Math.floor(Math.log10(abs(sg(x, n))) + 1e-12);
    if (e >= 6 || e <= -4) { var m = sg(x, n) / Math.pow(10, e); return (m < 0 ? '-' : '') + abs(m).toFixed(n - 1) + ' \\times 10^{' + e + '}'; }
    var d = Math.max(0, n - 1 - e), s = abs(sg(x, n)).toFixed(d);
    if (abs(x) >= 10000) s = T.commas(s);
    return (x < 0 ? '-' : '') + s;
  }
  /* tv(x): a given value exactly as generated, with commas from 10,000 */
  function tv(x) { x = fx(x); if (abs(x) >= 10000 && abs(x) < 1e9) return T.commas(x); return String(x); }
  /* qShow(q): '= 12.5' when the exact rational q is a short decimal, else '\\approx 12.4857' */
  function qShow(q, dp) { var s = q.toDec(dp || 6).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return (ML.Q.from(s).eq(q) ? '= ' : '\\approx ') + s; }
  var UT = { 'g/cm3': '\\text{g/cm}^3', 'cm3': '\\text{cm}^3', 'm3': '\\text{m}^3', 'mm3': '\\text{mm}^3', 'cm2': '\\text{cm}^2', 'm2': '\\text{m}^2', 'kg/m3': '\\text{kg/m}^3',
    '°C': '^\\circ\\text{C}', '°F': '^\\circ\\text{F}', 'μg': '\\mu\\text{g}', 'μm': '\\mu\\text{m}', 'μL': '\\mu\\text{L}', 'μs': '\\mu\\text{s}', '%': '\\%', '': '' };
  /* ut(unit): the unit as TeX */
  function ut(u) { return UT[u] != null ? UT[u] : '\\text{' + u + '}'; }
  /* qu(x, unit, n): a computed quantity, rounded to n significant figures, with its unit (TeX, no $) */
  function qu(x, u, n) { return (u === '°C' ? tn(x, n) + '\\ ' : tn(x, n) + '\\ ') + ut(u); }
  /* gv(x, unit): a given quantity exactly as generated, with its unit */
  function gv(x, u) { return tv(x) + '\\ ' + ut(u); }
  /* gk(x, unit, n): a given quantity shown with n significant figures (trailing zeros kept) */
  function gk(x, u, n) { return tk(x, n) + '\\ ' + ut(u); }
  /* answer specs */
  function A(x, n, rtol) { return { t: 'num', v: sv(x, n || 3), rtol: rtol || 0.01 }; }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }   // an exact value (integers, simple decimals)
  function MC(correct, wrongs) { var seen = {}; seen[correct] = 1; var w = wrongs.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); return U.mc(correct, w, 4); }
  function MCK(choices, i) { return { t: 'mc', choices: choices, v: i, keep: true }; }
  function TF(v) { return { t: 'tf', v: !!v }; }
  /* W(fn): wraps a generator so long inline math in q, steps and hint becomes display math (narrow screens) */
  function W(fn) {
    return function (R, ctx) {
      var p = fn(R, ctx);
      p.q = widenText(p.q, ML, 26);
      p.steps = p.steps.map(function (s) { return widenText(s, ML, 26); });
      if (p.hint) p.hint = widenText(p.hint, ML, 26);
      return p;
    };
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function plural(n, w, ws) { return n === 1 ? w : (ws || w + 's'); }
  function art(w) { return /^[aeiou]/i.test(w) ? 'an' : 'a'; }
  function lvl(ctx) { return (ctx && ctx.level) || 1; }

  /* ---------------- chemical formulas ---------------- */
  /* ft('Ca(NO3)2') -> '\mathrm{Ca}(\mathrm{NO}_{3})_{2}'; ft('SO4^2-') -> '\mathrm{SO}_{4}^{2-}'; ft('CuSO4·5H2O') */
  function ft(s) {
    s = String(s); var out = '', i = 0, m, chg = '';
    var cm = /\^(\d*)([+-])$/.exec(s); if (cm) { chg = '^{' + cm[1] + cm[2] + '}'; s = s.slice(0, cm.index); }
    var run = '';
    function flush() { if (run) { out += '\\mathrm{' + run + '}'; run = ''; } }
    while (i < s.length) {
      var ch = s[i];
      if (/[A-Za-z]/.test(ch)) { run += ch; i++; continue; }
      if (/\d/.test(ch)) {
        m = /^\d+/.exec(s.slice(i)); var prev = i > 0 ? s[i - 1] : '';
        if (prev === '' || prev === '·') { flush(); out += m[0]; }
        else { flush(); out += '_{' + m[0] + '}'; }
        i += m[0].length; continue;
      }
      flush();
      if (ch === '·') out += '\\cdot ';
      else if (ch === '[' || ch === ']' || ch === '(' || ch === ')') out += ch;
      else out += ch;
      i++;
    }
    flush();
    return out + chg;
  }
  function fm(s) { return '$' + ft(s) + '$'; }
  /* atomic masses used in problems: IUPAC standard atomic weights (NIST) rounded to two decimals, as the overview lists */
  var AM = { H: 1.01, He: 4.00, Li: 6.94, Be: 9.01, B: 10.81, C: 12.01, N: 14.01, O: 16.00, F: 19.00, Ne: 20.18, Na: 22.99, Mg: 24.31, Al: 26.98,
    Si: 28.09, P: 30.97, S: 32.07, Cl: 35.45, Ar: 39.95, K: 39.10, Ca: 40.08, Cr: 52.00, Mn: 54.94, Fe: 55.85, Co: 58.93, Ni: 58.69, Cu: 63.55,
    Zn: 65.38, Br: 79.90, Ag: 107.87, Sn: 118.71, I: 126.90, Ba: 137.33, Au: 196.97, Hg: 200.59, Pb: 207.2, U: 238.03 };
  /* atoms('Ca(NO3)2') -> { Ca: 1, N: 2, O: 6 } (groups and a hydrate dot; no charges) */
  function atoms(f) {
    f = String(f).replace(/\^.*$/, '');
    var parts = f.split('·'), tot = {};
    parts.forEach(function (p) {
      var k = 1, m = /^(\d+)(.*)$/.exec(p); if (m) { k = +m[1]; p = m[2]; }
      var stack = [{}], i = 0;
      while (i < p.length) {
        var ch = p[i];
        if (ch === '(' || ch === '[') { stack.push({}); i++; continue; }
        if (ch === ')' || ch === ']') {
          i++; var n = /^\d+/.exec(p.slice(i)), mult = n ? +n[0] : 1; if (n) i += n[0].length;
          var top = stack.pop(), under = stack[stack.length - 1];
          Object.keys(top).forEach(function (e) { under[e] = (under[e] || 0) + top[e] * mult; });
          continue;
        }
        var em = /^([A-Z][a-z]?)(\d*)/.exec(p.slice(i)); if (!em) throw new Error('atoms: cannot read ' + f);
        var cur = stack[stack.length - 1]; cur[em[1]] = (cur[em[1]] || 0) + (em[2] ? +em[2] : 1); i += em[0].length;
      }
      Object.keys(stack[0]).forEach(function (e) { tot[e] = (tot[e] || 0) + stack[0][e] * k; });
    });
    return tot;
  }
  /* mm(f): molar mass from the two-decimal atomic masses, rounded to 0.01 */
  function mm(f) { var a = atoms(f), s = 0; Object.keys(a).forEach(function (e) { if (AM[e] == null) throw new Error('no atomic mass for ' + e); s += a[e] * AM[e]; }); return Math.round(s * 100) / 100; }
  /* massList(f): the atomic masses a formula needs, as text: "C 12.01, H 1.01, O 16.00" */
  function massList(f) { return Object.keys(atoms(f)).map(function (e) { return e + ' ' + AM[e].toFixed(AM[e] === 207.2 ? 1 : 2); }).join(', '); }
  function amT(e) { return AM[e].toFixed(e === 'Pb' ? 1 : 2); }

  /* ---------------- elements: Z, symbol, name, group (1-18), period ---------------- */
  var ELD = ('H Hydrogen;He Helium;Li Lithium;Be Beryllium;B Boron;C Carbon;N Nitrogen;O Oxygen;F Fluorine;Ne Neon;Na Sodium;Mg Magnesium;Al Aluminum;Si Silicon;P Phosphorus;S Sulfur;Cl Chlorine;Ar Argon;' +
    'K Potassium;Ca Calcium;Sc Scandium;Ti Titanium;V Vanadium;Cr Chromium;Mn Manganese;Fe Iron;Co Cobalt;Ni Nickel;Cu Copper;Zn Zinc;Ga Gallium;Ge Germanium;As Arsenic;Se Selenium;Br Bromine;Kr Krypton;' +
    'Rb Rubidium;Sr Strontium;Y Yttrium;Zr Zirconium;Nb Niobium;Mo Molybdenum;Tc Technetium;Ru Ruthenium;Rh Rhodium;Pd Palladium;Ag Silver;Cd Cadmium;In Indium;Sn Tin;Sb Antimony;Te Tellurium;I Iodine;Xe Xenon;Cs Cesium;Ba Barium').split(';');
  var EL = {}, ELZ = [null];
  ELD.forEach(function (s, i) {
    var p = s.split(' '), Z = i + 1, per = Z <= 2 ? 1 : Z <= 10 ? 2 : Z <= 18 ? 3 : Z <= 36 ? 4 : Z <= 54 ? 5 : 6, start = [0, 1, 3, 11, 19, 37, 55][per], k = Z - start, grp;
    if (per === 1) grp = Z === 1 ? 1 : 18;
    else if (per <= 3) grp = k < 2 ? k + 1 : k + 11;
    else grp = k + 1;
    var e = { Z: Z, s: p[0], name: p[1], group: grp, period: per };
    EL[p[0]] = e; ELZ.push(e);
  });
  [[79, 'Au', 'Gold', 11, 6], [80, 'Hg', 'Mercury', 12, 6], [82, 'Pb', 'Lead', 14, 6], [86, 'Rn', 'Radon', 18, 6]].forEach(function (a) { var e = { Z: a[0], s: a[1], name: a[2], group: a[3], period: a[4] }; EL[a[1]] = e; ELZ[a[0]] = e; });
  function isMain(e) { return e.group <= 2 || e.group >= 13; }
  function valE(e) { return e.Z === 2 ? 2 : e.group <= 2 ? e.group : e.group - 10; }
  function lname(e) { return e.name.toLowerCase(); }
  /* shells for Z <= 20: 2, 8, 8, 2 */
  function shells20(Z) { var caps = [2, 8, 8, 2], out = [], left = Z; for (var i = 0; i < 4 && left > 0; i++) { var k = Math.min(caps[i], left); out.push(k); left -= k; } return out; }
  /* electron configurations by the filling order (no exceptions; use for Z <= 38 except 24 and 29) */
  var ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s'], CAP = { s: 2, p: 6, d: 10, f: 14 };
  function cfg(Z) { var out = [], left = Z; for (var i = 0; i < ORDER.length && left > 0; i++) { var c = CAP[ORDER[i][1]], k = Math.min(c, left); out.push([ORDER[i], k]); left -= k; } return out; }
  function cfgTex(list) { return '\\mathrm{' + list.map(function (x) { return x[0] + '^{' + x[1] + '}'; }).join('\\,') + '}'; }
  var NOBLE = [[2, 'He'], [10, 'Ne'], [18, 'Ar'], [36, 'Kr']];
  function cfgShort(Z) { var core = null; NOBLE.forEach(function (n) { if (n[0] < Z) core = n; }); var full = cfg(Z); if (!core) return cfgTex(full); var rest = full.slice(cfg(core[0]).length); return '\\mathrm{[' + core[1] + ']\\,' + rest.map(function (x) { return x[0] + '^{' + x[1] + '}'; }).join('\\,') + '}'; }
  /* ion symbol as a formula string: ion('S', -2) -> 'S^2-' */
  function ionF(sym, q) { return sym + '^' + (abs(q) === 1 ? '' : abs(q)) + (q > 0 ? '+' : '-'); }
  function chgT(q) { return (abs(q) === 1 ? '' : abs(q)) + (q > 0 ? '+' : '-'); }
  function signed(q) { return q > 0 ? '+' + q : String(q); }
  function signedT(q) { return q > 0 ? '+' + q : String(q).replace('-', '−'); }
  /* name variants for text answers: "iron(III) oxide" also as "iron (III) oxide" and "iron III oxide" */
  function nameVars(n) { var v = [n]; if (/\(/.test(n)) { v.push(n.replace('(', ' (')); v.push(n.replace(/\(([IVX]+)\)/, ' $1')); } return v; }
  /* all orders of the elements in a simple formula (for empirical formulas, where only the ratio is the skill) */
  function orders(counts) {
    var els = Object.keys(counts), out = [];
    (function perm(a, rest) { if (!rest.length) { out.push(a.map(function (e) { return e + (counts[e] === 1 ? '' : counts[e]); }).join('')); return; } rest.forEach(function (e, i) { perm(a.concat([e]), rest.slice(0, i).concat(rest.slice(i + 1))); }); })([], els);
    return out;
  }
  /* formula string from counts in the given element order */
  function fstr(counts, els) { return els.map(function (e) { return e + (counts[e] === 1 ? '' : counts[e]); }).join(''); }

  // ======================= 01-matter.js
  // ---------------------------------------------------------------- unit: Matter and Measurement
  var KINDS = ['element', 'compound', 'homogeneous mixture', 'heterogeneous mixture'];
  var KIND_WHY = {
    element: 'It is one pure substance made of only one kind of atom, so it cannot be broken down into simpler substances.',
    compound: 'It is one pure substance made of two or more elements bonded in a fixed ratio; its makeup never changes.',
    'homogeneous mixture': 'It is two or more substances mixed so evenly that every part looks the same, and the amounts can vary.',
    'heterogeneous mixture': 'It is two or more substances that stay in separate visible parts, and the amounts can vary.'
  };
  var SUBST = [
    ['copper wire (pure copper)', 0], ['helium gas in a balloon', 0], ['a diamond (pure carbon)', 0], ['oxygen gas', 0], ['liquid mercury', 0], ['a bar of pure gold', 0], ['neon gas in a sign', 0], ['sulfur powder', 0],
    ['distilled water', 1], ['table salt (sodium chloride)', 1], ['carbon dioxide gas', 1], ['pure table sugar (sucrose)', 1], ['baking soda (sodium hydrogen carbonate)', 1], ['ammonia gas', 1], ['methane gas', 1], ['pure ethanol', 1],
    ['salt water', 2], ['clean, dry air', 2], ['brass (copper and zinc melted together)', 2], ['vinegar (acetic acid in water)', 2], ['tap water', 2], ['sugar fully dissolved in water', 2], ['rubbing alcohol (isopropyl alcohol and water)', 2], ['sterling silver (silver with some copper)', 2],
    ['sand stirred into water', 3], ['granite', 3], ['oil and vinegar salad dressing', 3], ['a chocolate chip cookie', 3], ['iron filings mixed with sulfur powder', 3], ['muddy water', 3], ['trail mix', 3], ['a bowl of cereal in milk', 3]
  ];
  // particle boxes for the picture problems (ch-particles, sort mode)
  var PBOX = {
    element: [[{ f: 'O2', n: 6 }], [{ f: 'N2', n: 6 }], [{ f: 'He', n: 8 }], [{ f: 'H2', n: 7 }], [{ f: 'Cl2', n: 5 }]],
    compound: [[{ f: 'H2O', n: 6 }], [{ f: 'CO2', n: 5 }], [{ f: 'NH3', n: 5 }], [{ f: 'CH4', n: 5 }], [{ f: 'HCl', n: 6 }]],
    'mixture of elements': [[{ f: 'H2', n: 4 }, { f: 'O2', n: 3 }], [{ f: 'N2', n: 4 }, { f: 'O2', n: 3 }], [{ f: 'He', n: 4 }, { f: 'Ar', n: 3 }], [{ f: 'Cl2', n: 3 }, { f: 'H2', n: 4 }]],
    'mixture of compounds': [[{ f: 'H2O', n: 3 }, { f: 'CO2', n: 3 }], [{ f: 'CH4', n: 3 }, { f: 'NH3', n: 3 }], [{ f: 'HCl', n: 3 }, { f: 'H2O', n: 3 }]],
    'mixture of an element and a compound': [[{ f: 'O2', n: 3 }, { f: 'CO2', n: 3 }], [{ f: 'N2', n: 3 }, { f: 'H2O', n: 3 }], [{ f: 'He', n: 4 }, { f: 'CH4', n: 3 }]]
  };
  G('chem.matter-classification', W(function (R, ctx) {
    var L = lvl(ctx), kind = R.int(0, L === 1 ? 2 : 3);
    if (kind <= 1) { // classify a named material
      var s = R.pick(SUBST), k = KINDS[s[1]];
      return {
        q: 'Classify ' + s[0] + '.',
        a: MCK(KINDS.map(cap), s[1]),
        steps: [
          'Ask first: is it one pure substance with a fixed makeup, or a mix whose amounts could change?',
          KIND_WHY[k],
          'So ' + s[0] + ' is ' + art(k) + ' <b>' + k + '</b>.'
        ],
        hint: 'Could you change the amounts of its parts and still call it the same thing? Then it is a mixture.'
      };
    }
    if (kind === 2) { // particle pictures
      var cats = ['element', 'compound', 'mixture of elements', R.pick(['mixture of compounds', 'mixture of an element and a compound'])];
      var order = R.shuffle([0, 1, 2, 3]), boxes = order.map(function (i) { return R.pick(PBOX[cats[i]]); });
      var askI = R.int(0, 3), names = ['A', 'B', 'C', 'D'], ans = order.indexOf(askI);
      var askText = { element: 'an element', compound: 'a compound', 'mixture of elements': 'a mixture of two elements', 'mixture of compounds': 'a mixture of two compounds', 'mixture of an element and a compound': 'a mixture of an element and a compound' }[cats[askI]];
      var desc = order.map(function (ci, b) { var bx = boxes[b]; return 'Box ' + names[b] + ': ' + bx.map(function (p) { return fm(p.f); }).join(' and ') + ' (' + (bx.length === 1 ? 'one kind of particle' : 'two kinds of particles') + ')'; });
      return {
        q: 'Each box shows particles of matter. Which box shows ' + askText + '?',
        viz: { name: 'ch-particles', opts: { mode: 'sort', boxes: boxes, quiet: true, edit: false, motion: false, seed: R.int(1, 50) } },
        a: MCK(names.map(function (n) { return 'Box ' + n; }), ans),
        steps: desc.concat(['One kind of particle means a pure substance: an element if each particle has only one kind of atom, a compound if it has two or more kinds. Two kinds of particles mean a mixture.', 'So the answer is <b>Box ' + names[ans] + '</b>.']),
        hint: 'Count the kinds of particles in each box first, then look at the atoms inside one particle.'
      };
    }
    var tfs = [
      ['Water is a mixture of hydrogen and oxygen.', false, 'Water is a compound: every molecule has exactly 2 H atoms bonded to 1 O atom, so its makeup is fixed. A mixture of hydrogen and oxygen gases would be a different thing (two kinds of molecules, any amounts).'],
      ['Salt water is a pure substance because it looks the same all the way through.', false, 'Looking the same all through makes it homogeneous, not pure. You can dissolve more or less salt, so its makeup varies: it is a homogeneous mixture.'],
      ['A compound always contains its elements in the same ratio.', true, 'The atoms in a compound are bonded in fixed groups (or a fixed ratio of ions), so the ratio of elements never changes.'],
      ['Air is a homogeneous mixture.', true, 'Air is mostly nitrogen and oxygen gases mixed evenly, and the amounts can vary (for example, the amount of water vapor), so it is a homogeneous mixture.'],
      ['A compound can be separated into its elements by filtering or boiling.', false, 'Physical methods such as filtering or boiling only separate mixtures. Breaking a compound into its elements takes a chemical change.'],
      ['An element can be broken down into simpler substances by a chemical reaction.', false, 'An element is made of only one kind of atom, so no chemical reaction breaks it into anything simpler.'],
      ['Brass, an even blend of copper and zinc, is a homogeneous mixture.', true, 'The copper and zinc are spread evenly, and the ratio can vary from one brass to another, so it is a homogeneous mixture (an alloy).']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Pure substances have a fixed makeup; mixtures can vary.' };
  }));

  var MPBP = [ // name, melting point, boiling point (°C, at 1 atm; NIST Chemistry WebBook and CRC Handbook, rounded)
    ['water', 0, 100], ['ethanol', -114, 78], ['mercury', -39, 357], ['nitrogen', -210, -196], ['oxygen', -219, -183], ['bromine', -7, 59],
    ['iron', 1538, 2861], ['copper', 1085, 2562], ['lead', 327, 1749], ['aluminum', 660, 2519], ['sodium chloride', 801, 1465]
  ];
  G('chem.states-of-matter', W(function (R, ctx) {
    var L = lvl(ctx), kind = R.int(0, L === 1 ? 1 : 2);
    if (kind === 0) {
      var s = R.pick(MPBP), st = R.int(0, 2), T0;
      if (st === 0) T0 = s[1] - R.pick([20, 30, 50, 80]);
      else if (st === 1) { var lo = s[1] + 10, hi = s[2] - 10; T0 = lo + Math.round((hi - lo) * R.real(0.15, 0.85, 2)); }
      else T0 = s[2] + R.pick([20, 40, 60, 100]);
      if (st === 0 && T0 < -273) { st = 1; T0 = Math.round((s[1] + s[2]) / 2); }
      if (st === 1 && Math.round(T0 / 5) * 5 > s[1] + 5 && Math.round(T0 / 5) * 5 < s[2] - 5) T0 = Math.round(T0 / 5) * 5;
      var states = ['solid', 'liquid', 'gas'];
      var why = st === 0 ? T0 + ' °C is below the melting point, ' + s[1] + ' °C, so the particles stay locked in place, vibrating.' :
        st === 1 ? T0 + ' °C is above the melting point (' + s[1] + ' °C) but below the boiling point (' + s[2] + ' °C).' :
        T0 + ' °C is above the boiling point, ' + s[2] + ' °C, so the particles move freely and far apart.';
      return {
        q: 'At 1 atm, ' + s[0] + ' melts at $' + s[1] + '\\ ^\\circ\\text{C}$ and boils at $' + s[2] + '\\ ^\\circ\\text{C}$. In what state is ' + s[0] + ' at $' + T0 + '\\ ^\\circ\\text{C}$?',
        a: MCK(['Solid', 'Liquid', 'Gas'], st),
        steps: ['Below the melting point a substance is solid; between the melting and boiling points it is liquid; above the boiling point it is gas.', why, 'So ' + s[0] + ' is a <b>' + states[st] + '</b> at ' + T0 + ' °C.'],
        hint: 'Place the temperature on a line with the melting point and the boiling point marked.'
      };
    }
    var bank = [
      ['In which state are the particles close together but able to slide past one another?', 'Liquid', ['Solid', 'Gas', 'None of them'], 'In a liquid the particles touch, but they are not locked in place, so they slide past each other. That is why a liquid flows and takes the shape of its container.'],
      ['Which state has a fixed volume but takes the shape of its container?', 'Liquid', ['Solid', 'Gas', 'Every state'], 'Liquid particles stay touching, so the volume stays the same, but they can move around each other, so the shape changes.'],
      ['Which state can be squeezed into a much smaller volume?', 'Gas', ['Solid', 'Liquid', 'Solids and liquids equally'], 'Gas particles are far apart with mostly empty space between them, so pushing them closer takes up that space.'],
      ['In which state do the particles vibrate about fixed positions?', 'Solid', ['Liquid', 'Gas', 'No state: particles in a solid do not move'], 'Particles in a solid are held in place by their attractions, but they still move: they vibrate about fixed spots.'],
      ['A solid block of iron is warmed but stays solid. What happens to its atoms?', 'They vibrate faster and a little farther apart', ['Each atom gets bigger', 'They stop moving', 'They begin to melt one by one'], 'Heating gives the atoms more kinetic energy, so they vibrate faster, and the average spacing grows a little. The atoms themselves do not grow.'],
      ['Ice melts into liquid water. What happens to the water molecules?', 'The same molecules move more freely past each other', ['Each molecule melts', 'The molecules break into hydrogen and oxygen atoms', 'The molecules get larger'], 'Melting is a physical change: the H₂O molecules stay whole and only change how they are arranged and how they move.'],
      ['A gas is cooled but stays a gas. What happens to its particles?', 'They move more slowly', ['They shrink', 'They stop moving completely', 'They turn into smaller molecules'], 'Temperature measures the average kinetic energy of the particles. Cooling lowers it, so the particles slow down; they keep their size.']
    ];
    if (kind === 1) {
      var b = R.pick(bank);
      return { q: b[0], a: MC(b[1], b[2]), steps: [b[3], 'Answer: <b>' + b[1] + '</b>.'], hint: 'Think about the particles: how close they are, and how freely they move.' };
    }
    var tfs = [
      ['The particles in a solid do not move at all.', false, 'They vibrate about fixed positions. Only at absolute zero would that motion reach its minimum.'],
      ['When a metal expands on heating, it is because each atom gets bigger.', false, 'The atoms vibrate harder and sit a little farther apart on average. Their size stays the same.'],
      ['A molecule of water vapor is the same size as a molecule of liquid water.', true, 'Boiling changes the spacing and motion of the molecules, not the molecules themselves.'],
      ['Gas particles keep moving even when the gas is at rest in a closed jar.', true, 'Gas particles always move in straight lines between collisions, at hundreds of meters per second at room temperature.'],
      ['Heating a liquid makes its particles move faster on average.', true, 'Temperature is a measure of the average kinetic energy of the particles.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Particles always move; heating changes how fast and how far apart, not their size.' };
  }));

  var CHANGES = [
    ['ice melting into water', 0, 'Only the state changes; the molecules are still H₂O.'], ['water boiling in a pot', 0, 'The bubbles are water vapor, the same substance as the liquid.'],
    ['sugar dissolving in tea', 0, 'The sugar molecules spread out among the water molecules, but they are still sugar; evaporate the water and the sugar is left.'],
    ['a log being split into kindling', 0, 'The wood changes size and shape only.'], ['an aluminum can being crushed', 0, 'Only the shape changes.'],
    ['dry ice (solid carbon dioxide) turning into gas', 0, 'Solid CO₂ becomes CO₂ gas: a change of state.'], ['a copper wire being bent', 0, 'Only the shape changes; it is still copper.'],
    ['steam condensing on a cold mirror', 0, 'Water vapor turns back into liquid water.'], ['salt dissolving in water', 0, 'The ions separate and spread out in the water, but no new substance forms; boil the water off and the salt is left.'],
    ['fruit juice freezing', 0, 'The water in the juice changes state.'],
    ['wood burning in a campfire', 1, 'Wood reacts with oxygen to make new substances: carbon dioxide, water vapor and ash.'],
    ['an iron nail rusting', 1, 'Iron reacts with oxygen and water to make iron oxide, a new substance.'], ['a cake baking', 1, 'The ingredients react to make new substances (and gas that makes it rise); you cannot get the eggs back.'],
    ['milk souring', 1, 'Bacteria change the milk sugar into lactic acid, a new substance.'], ['an egg frying', 1, 'The proteins in the egg change permanently into new structures.'],
    ['gasoline burning in an engine', 1, 'Gasoline reacts with oxygen to make carbon dioxide and water.'], ['a silver spoon tarnishing', 1, 'Silver reacts with sulfur compounds in the air to make black silver sulfide.'],
    ['an antacid tablet fizzing in water', 1, 'Substances in the tablet react to make carbon dioxide, a gas that was not there before.'],
    ['leaves making sugar by photosynthesis', 1, 'Carbon dioxide and water react to make glucose and oxygen.'], ['a match burning', 1, 'The match head and wood react with oxygen to make new substances.']
  ];
  var PROPS = [
    ['the density of a metal', 0], ['the boiling point of ethanol', 0], ['the color of copper', 0], ['how hard a diamond is', 0], ['whether sugar dissolves in water', 0], ['whether gold can be hammered into thin sheets', 0],
    ['whether wood can burn', 1], ['whether iron rusts in moist air', 1], ['whether a metal reacts with acid', 1], ['whether baking soda breaks down when heated', 1], ['whether silver tarnishes in air', 1]
  ];
  G('chem.physical-chemical-changes', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick([0, 0, 1]) : R.int(0, 2 + (L === 3 ? 1 : 0));
    if (kind === 0) {
      var c = R.pick(CHANGES);
      return {
        q: 'Is ' + c[0] + ' a physical change or a chemical change?',
        a: MCK(['Physical change', 'Chemical change'], c[1]),
        steps: ['Ask: is there a new substance at the end, with atoms regrouped into different particles?', c[2], 'So it is a <b>' + (c[1] ? 'chemical' : 'physical') + ' change</b>.'],
        hint: 'A chemical change makes a new substance. A change of state or shape does not.'
      };
    }
    if (kind === 1) {
      var good = R.pick([
        'Two clear liquids are mixed, the mixture gets warm and a gas bubbles out',
        'Two clear solutions are mixed and a yellow solid forms and settles',
        'A white powder is heated and gives off a gas, leaving a different solid behind',
        'A piece of metal dropped into an acid fizzes and slowly disappears'
      ]);
      var bad = R.sample(['Bubbles form as water is heated to 100 °C', 'Sugar seems to disappear when stirred into water', 'Ice turns into liquid water on a warm day', 'A glass bottle breaks into pieces', 'Food coloring spreads through a glass of water and turns it blue', 'Water vapor forms droplets on a cold can'], 3);
      return {
        q: 'Which observation is the best evidence that a new substance has formed?',
        a: MC(good, bad),
        steps: ['Bubbles, a color change or a solid can appear in physical changes too, so look for evidence that something new formed that was not there before, especially several signs together.', 'Boiling makes bubbles of the same substance; dissolving and mixing colors only spread particles out; breaking and melting change shape or state.', 'So the best evidence is: <b>' + good + '</b>.'],
        hint: 'Rule out the changes of state, shape and mixing first.'
      };
    }
    if (kind === 2) {
      var tfs = [
        ['Bubbles appear when water boils, so boiling is a chemical change.', false, 'The bubbles are water vapor, still H₂O. Boiling is a change of state, a physical change.'],
        ['Dissolving salt in water is a physical change.', true, 'The salt’s ions spread out in the water but stay the same ions; boiling the water away gives back the salt.'],
        ['Every color change means a chemical reaction happened.', false, 'Mixing food coloring into water changes the color with no new substance. A color change is a clue, not proof.'],
        ['In a chemical change, atoms are regrouped into new substances, but no atoms are created or destroyed.', true, 'That is what a chemical change is at the particle level.'],
        ['Melting chocolate is a chemical change because it looks very different afterward.', false, 'It is the same substance in a different state, so it is a physical change.']
      ];
      var t = R.pick(tfs);
      return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Ask whether a new substance forms.' };
    }
    var p = R.pick(PROPS);
    return {
      q: 'Is ' + p[0] + ' a physical property or a chemical property?',
      a: MCK(['Physical property', 'Chemical property'], p[1]),
      steps: ['A physical property can be observed or measured without changing the substance into something else. A chemical property describes how a substance changes into new substances.', p[1] ? 'Finding it out means letting the substance react, so it is a chemical property.' : 'You can observe or measure it and still have the same substance, so it is a physical property.', 'Answer: <b>' + (p[1] ? 'chemical' : 'physical') + ' property</b>.'],
      hint: 'Do you have to turn the substance into something new to observe it?'
    };
  }));

  // ---------------- SI prefixes
  var PRE = { G: 9, M: 6, k: 3, '': 0, d: -1, c: -2, m: -3, 'μ': -6, n: -9 };
  var PRENAME = { G: 'giga', M: 'mega', k: 'kilo', '': '', d: 'deci', c: 'centi', m: 'milli', 'μ': 'micro', n: 'nano' };
  /* shift(str, k): the decimal string str times 10^k, exactly, as a plain decimal string */
  function shift(str, k) {
    var neg = str[0] === '-'; if (neg) str = str.slice(1);
    var parts = str.split('.'), ip = parts[0], fp = parts[1] || '', digits = ip + fp, point = ip.length + k;
    if (point <= 0) digits = '0'.repeat(1 - point) + digits, point = 1;
    if (point > digits.length) digits = digits + '0'.repeat(point - digits.length);
    var a = digits.slice(0, point).replace(/^0+(?=\d)/, ''), b = digits.slice(point).replace(/0+$/, '');
    return (neg ? '-' : '') + a + (b ? '.' + b : '');
  }
  /* decTex(str): a plain decimal string for TeX: scientific notation when tiny or huge, commas from 10,000 */
  function decTex(str) {
    var x = +str; if (x === 0) return '0';
    var e = Math.floor(Math.log10(abs(x)) + 1e-12);
    if (e >= 6 || e <= -4) { var digits = str.replace(/[-.]/g, '').replace(/^0+/, '').replace(/0+$/, '') || '0'; var m = digits[0] + (digits.length > 1 ? '.' + digits.slice(1) : ''); return (x < 0 ? '-' : '') + m + ' \\times 10^{' + e + '}'; }
    return x >= 10000 ? T.commas(str) : str;
  }
  /* specNum(str): an exact decimal string for an answer spec, in e-notation when tiny or huge (no long zeros) */
  function specNum(str) {
    var x = +str; if (x === 0) return '0';
    var e = Math.floor(Math.log10(abs(x)) + 1e-12);
    if (e >= 6 || e <= -4) { var digits = str.replace(/[-.]/g, '').replace(/^0+/, '').replace(/0+$/, '') || '0'; return (x < 0 ? '-' : '') + digits[0] + (digits.length > 1 ? '.' + digits.slice(1) : '') + 'e' + e; }
    return str;
  }
  function pw(k) { return k === 0 ? '1' : '10^{' + k + '}'; }
  G('chem.si-prefixes', W(function (R, ctx) {
    var L = lvl(ctx), base = R.pick(['m', 'g', 'L', 's']);
    var avail = { m: ['k', 'c', 'm', 'μ', 'n'], g: ['k', 'm', 'μ'], L: ['m', 'μ', 'd'], s: ['m', 'μ', 'n'] }[base];
    var from, to;
    if (L === 1) {
      var easy = avail.filter(function (p) { return p === 'k' || p === 'c' || p === 'm'; });
      var p = R.pick(easy); if (R.coin()) { from = p; to = ''; } else { from = ''; to = p; }
    } else if (L === 2) {
      var two = R.sample(avail.filter(function (p) { return p !== 'n'; }).concat(['']), 2); from = two[0]; to = two[1];
    } else {
      var all = avail.concat(['']); if (base === 's' || base === 'm') all = all.concat(R.coin() ? [] : []);
      var t3 = R.sample(all, 2); from = t3[0]; to = t3[1];
      if (abs(PRE[from] - PRE[to]) < 3) { from = R.pick(avail.filter(function (p) { return abs(PRE[p]) >= 6; }).concat(['k'])); to = ''; }
    }
    if (from === to) to = '';
    if (from === to) from = avail[0];
    var mant = R.pick(['2.5', '3.6', '4.2', '7.5', '0.35', '12', '45', '250', '0.068', '1.8', '640', '15.2', '0.92']);
    var k = PRE[from] - PRE[to], ans = shift(mant, k);
    var uF = from + base, uT = to + base;
    var bigger = k > 0;
    var steps = [];
    if (to === '') steps.push('The prefix ' + PRENAME[from] + '- means $' + pw(PRE[from]) + '$, so replace it: $' + mant + '\\ \\text{' + uF + '} = ' + mant + ' \\times ' + pw(PRE[from]) + '\\ \\text{' + uT + '}$.');
    else if (from === '') steps.push('One ' + uT + ' is $' + pw(PRE[to]) + '\\ \\text{' + base + '}$, so $1\\ \\text{' + base + '} = ' + pw(-PRE[to]) + '\\ \\text{' + uT + '}$.');
    else steps.push('Go through the base unit: $1\\ \\text{' + uF + '} = ' + pw(PRE[from]) + '\\ \\text{' + base + '}$ and $1\\ \\text{' + uT + '} = ' + pw(PRE[to]) + '\\ \\text{' + base + '}$, so $1\\ \\text{' + uF + '} = 10^{' + PRE[from] + ' - (' + PRE[to] + ')} = ' + pw(k) + '\\ \\text{' + uT + '}$.');
    steps.push('Multiply: $' + mant + ' \\times ' + pw(k) + ' = ' + decTex(ans) + '$. ' + (bigger ? 'The new unit is smaller, so there are more of them: the number gets bigger.' : 'The new unit is bigger, so there are fewer of them: the number gets smaller.'));
    steps.push('$' + mant + '\\ \\text{' + uF + '} = ' + decTex(ans) + '\\ \\text{' + uT + '}$');
    return {
      q: 'Convert $' + mant + '\\ \\text{' + uF + '}$ to ' + (PRENAME[to] ? PRENAME[to] : '') + { m: 'meters', g: 'grams', L: 'liters', s: 'seconds' }[base] + ' (' + uT + ').',
      a: { t: 'num', v: specNum(ans) }, unit: uT,
      steps: steps,
      hint: 'Write each prefix as a power of ten. A smaller unit means a bigger number.'
    };
  }));

  // ---------------- significant figures
  /* a number string with a known count of significant figures */
  function sfNumber(R, L) {
    var type = R.int(0, L === 1 ? 2 : 4), d = function () { return String(R.int(1, 9)); }, z = function (n) { return '0'.repeat(n); };
    var s, n, tex;
    if (type === 0) { var lead = R.int(1, 3); var core = d() + (R.coin() ? '0' : d()) + d(); var tr = R.coin() ? '0' : ''; s = '0.' + z(lead - 1) + core + tr; }
    else if (type === 1) { s = d() + z(R.int(1, 2)) + d() + (R.coin() ? '.' + d() : ''); }
    else if (type === 2) { s = d() + d() + '.' + d() + z(R.int(1, 2)); }
    else if (type === 3) { var m = d() + '.' + d() + (R.coin() ? '0' : d()) + (R.coin() ? '0' : ''); var e = R.pick([-5, -3, 3, 4, 6, 23]); tex = m + ' \\times 10^{' + e + '}'; s = m + 'e' + e; }
    else { s = d() + d() + '0.'; }
    if (!tex) tex = s.replace(/^(\d+)\.$/, '$1.');
    n = sfCount(s);
    return { s: s, tex: tex, n: n, type: type };
  }
  function sfCount(s) {
    var m = s.replace(/e.*$/, ''), hasPoint = m.indexOf('.') >= 0, dg = m.replace('.', '').replace(/^0+/, '');
    if (!hasPoint) dg = dg.replace(/0+$/, '');
    return dg.length;
  }
  /* roundSf(str, n): a decimal string rounded to n significant figures, or null on an exact tie (…5000) */
  function roundSf(str, n) {
    var x = ML.Q.from(str); if (x.isZero()) return '0';
    var neg = x.sign() < 0; x = x.abs();
    var e = Math.floor(Math.log10(x.toNumber()) + 1e-12);
    var scale = n - 1 - e, y = scale >= 0 ? x.mul(ML.Q(10).pow(scale)) : x.div(ML.Q(10).pow(-scale));
    var fl = y.floor(), frac = y.sub(fl);
    if (frac.eq(ML.Q(1, 2))) return null;
    var r = frac.gt(ML.Q(1, 2)) ? fl.add(1) : fl;
    if (String(r.n).length > n) { e += 1; scale -= 1; r = r.div(10).floor(); }
    var digs = String(r.n), out;
    if (scale > 0) { while (digs.length <= scale) digs = '0' + digs; out = digs.slice(0, digs.length - scale) + '.' + digs.slice(digs.length - scale); }
    else out = digs + '0'.repeat(-scale);
    return (neg ? '-' : '') + out;
  }
  var INSTR = [
    { mode: 'ruler', div: 0.1, unit: 'cm', vals: [4.37, 2.84, 6.12, 7.53, 3.26, 5.68], name: 'the length on this ruler (marked every 0.1 cm)' },
    { mode: 'cylinder', div: 1, unit: 'mL', vals: [36.5, 42.3, 27.8, 18.6, 33.4], name: 'the volume in this graduated cylinder (marked every 1 mL)' },
    { mode: 'thermometer', div: 1, unit: '°C', vals: [23.4, 37.6, 18.3, 41.7, 26.2], name: 'the temperature on this thermometer (marked every 1 °C)' }
  ];
  G('chem.significant-figures', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 0 : R.pick(L === 2 ? [0, 0, 1, 2] : [0, 1, 1, 2]);
    if (kind === 0) {
      var x = sfNumber(R, L);
      var rules = [];
      if (/^0\./.test(x.s) || /^0/.test(x.s)) rules.push('Leading zeros only place the decimal point, so they never count.');
      if (/[1-9]0+[1-9]/.test(x.s.replace('.', '').replace(/e.*$/, ''))) rules.push('Zeros between nonzero digits always count.');
      if (/\.\d*0(e|$)/.test(x.s) || /\.$/.test(x.s)) rules.push('Trailing zeros count when the number has a decimal point: someone measured them.');
      if (/e/.test(x.s)) rules.push('In scientific notation, count the digits of the number in front of the power of ten; the power only places the decimal point.');
      return {
        q: 'How many significant figures are in $' + x.tex + '$?',
        a: { t: 'num', v: String(x.n), form: 'int' },
        steps: rules.concat(['Nonzero digits always count.', 'Count: <b>' + x.n + '</b> significant figures.']),
        hint: 'Start counting at the first nonzero digit.'
      };
    }
    if (kind === 1) {
      var str, n, r = null, tries = 0;
      while (r === null && tries++ < 20) {
        var sh = R.pick([-3, -2, -1, 0, 1, 2]);
        var digs = String(R.int(1, 9)) + String(R.int(0, 9)) + String(R.int(0, 9)) + String(R.int(0, 9)) + String(R.int(1, 9));
        str = shift(digs[0] + '.' + digs.slice(1), sh);
        n = R.int(2, 3); r = roundSf(str, n);
        if (r !== null && /^\d{2,}0$/.test(r.replace('-', '')) && r.indexOf('.') < 0) r = null; // whole number ending in 0: ambiguous, skip
      }
      return {
        q: 'Round $' + decTex(str) + '$ to ' + n + ' significant figures.',
        a: { t: 'num', v: r, form: 'sf', sf: n },
        steps: ['Find the first nonzero digit and count ' + n + ' digits from there.', 'Look at the next digit: 5 or more rounds up; less than 5 leaves the last kept digit alone.', 'Keep any zeros needed to hold the place value, and drop the rest: <b>$' + decTex(r) + '$</b>.'],
        hint: 'Leading zeros are not counted, but they stay in place.'
      };
    }
    var ins = R.pick(INSTR), v = R.pick(ins.vals), dp = ins.div === 0.1 ? 2 : 1;
    var good = v.toFixed(dp), few = (Math.floor(v * Math.pow(10, dp - 1) + 1e-9) / Math.pow(10, dp - 1)).toFixed(dp - 1), many = v.toFixed(dp) + R.pick(['2', '5', '8']), far = (ins.div === 0.1 ? Math.round(v) : Math.round(v / 10) * 10).toFixed(0);
    var u = ins.unit === '°C' ? ' °C' : ' ' + ins.unit;
    return {
      q: 'Which is the correct way to record ' + ins.name + '?',
      viz: { name: 'ch-measure', opts: { mode: ins.mode, value: v, div: ins.div, quiet: true, edit: false, zoom: ins.mode === 'ruler' ? 2 : 2 } },
      a: MC(good + u, [few + u, many + u, far + u]),
      steps: ['Read every digit you can be sure of from the markings, then estimate one more digit between the marks.', 'The marks are ' + ins.div + ' ' + ins.unit + ' apart, so the estimated digit is in the ' + (dp === 2 ? 'hundredths' : 'tenths') + ' place.', 'So the reading has ' + dp + ' decimal place' + (dp === 1 ? '' : 's') + ': <b>' + good + u + '</b>. Fewer digits throw away information; more digits claim more than the instrument can tell.'],
      hint: 'Record all the certain digits plus one estimated digit.'
    };
  }));

  var PE = [ // what, accepted value, unit, decimals to show
    ['the density of aluminum', 2.70, 'g/cm3', 2], ['the boiling point of water at 1 atm', 100.0, '°C', 1], ['the density of copper', 8.96, 'g/cm3', 2],
    ['the molar mass of carbon dioxide', 44.01, 'g/mol', 2], ['the specific heat of water', 4.184, 'J/(g·°C)', 3], ['the density of ethanol', 0.789, 'g/mL', 3], ['the melting point of lead', 327.5, '°C', 1]
  ];
  G('chem.accuracy-precision', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick([0, 0, 1]) : R.int(0, 2 + (L === 3 ? 1 : 0));
    if (kind === 0 || kind === 3) {
      var c = R.pick(PE), a = c[1], pct = R.real(2, 9, 1) * R.sign(), meas;
      var dp = c[3]; meas = +(a * (1 + pct / 100)).toFixed(dp);
      var trials = null;
      if (kind === 3) { // average first
        var sp = Math.pow(10, -dp); trials = [meas - 2 * sp, meas + sp, meas + sp, meas].map(function (t) { return +t.toFixed(dp); });
        meas = +((trials[0] + trials[1] + trials[2] + trials[3]) / 4).toFixed(dp + 2);
      }
      var err = abs(meas - a) / a * 100;
      var u = c[2] === '°C' ? '^\\circ\\text{C}' : ut(c[2]);
      var steps = [];
      if (trials) steps.push('Average the four trials: $(' + trials.map(function (t) { return t.toFixed(dp); }).join(' + ') + ') \\div 4 = ' + tv(meas) + '\\ ' + u + '$.');
      steps.push('Percent error compares the error with the <b>accepted</b> value: $\\%\\ \\text{error} = \\dfrac{|\\text{measured} - \\text{accepted}|}{\\text{accepted}} \\times 100\\%$.');
      steps.push('$\\dfrac{|' + tv(meas) + ' - ' + a.toFixed(dp) + '|}{' + a.toFixed(dp) + '} \\times 100\\% = \\dfrac{' + tv(+abs(meas - a).toFixed(dp + 2)) + '}{' + a.toFixed(dp) + '} \\times 100\\% \\approx ' + tk(err, 3) + '\\%$');
      return {
        q: (trials ? 'A student measured ' + c[0] + ' four times and got $' + trials.map(function (t) { return t.toFixed(dp); }).join('$, $') + '\\ ' + u + '$. Using the average,' : 'A student measured ' + c[0] + ' as $' + meas.toFixed(dp) + '\\ ' + u + '$. The accepted value is $' + a.toFixed(dp) + '\\ ' + u + '$.') +
          (trials ? ' find the percent error. The accepted value is $' + a.toFixed(dp) + '\\ ' + u + '$.' : ' Find the percent error.') + ' Give it as a percent, rounded to three significant figures.',
        a: { t: 'num', v: sv(err, 3), pct: true, rtol: 0.005 },
        steps: steps,
        hint: 'Divide the size of the error by the accepted value, not by your measurement.'
      };
    }
    if (kind === 1) {
      var ctxs = [['a 10.00 g brass mass on a balance', 10.00, 'g', 2], ['the volume delivered by a 25.00 mL pipet', 25.00, 'mL', 2], ['the boiling point of water at 1 atm', 100.0, '°C', 1]];
      var cc = R.pick(ctxs), tv0 = cc[1], dps = cc[3], cls = R.int(0, 3);
      var acc = cls === 0 || cls === 2, prec = cls === 0 || cls === 1;
      var mean = acc ? tv0 : tv0 * (1 + R.pick([-1, 1]) * R.real(0.1, 0.15, 2));
      var spread = prec ? tv0 * 0.001 : tv0 * 0.03;
      var offs = prec ? [-1, 1, 0, 1] : [-2, 2, -1, 1];
      offs = R.shuffle(offs);
      var vals = offs.map(function (o) { return +(mean + o * spread).toFixed(dps); });
      var avg = vals.reduce(function (s, x) { return s + x; }, 0) / 4;
      var rng = Math.max.apply(null, vals) - Math.min.apply(null, vals);
      var labels = ['Accurate and precise', 'Precise but not accurate', 'Accurate but not precise', 'Neither accurate nor precise'];
      var uu = cc[2] === '°C' ? ' °C' : ' ' + cc[2];
      return {
        q: 'Four students measured ' + cc[0] + '. The true value is ' + tv0.toFixed(dps) + uu + '. Their results: ' + vals.map(function (x) { return x.toFixed(dps); }).join(', ') + uu + '. How would you describe the results?',
        a: MCK(labels, cls),
        steps: ['Precision: how close the results are to each other. They span ' + (+rng.toFixed(dps)).toFixed(dps) + uu + ', which is ' + (prec ? 'small: precise.' : 'large compared with the value: not precise.'),
          'Accuracy: how close the results are to the true value. Their average is ' + avg.toFixed(dps) + uu + ', which is ' + (acc ? 'close to ' + tv0.toFixed(dps) + uu + ': accurate.' : 'far from ' + tv0.toFixed(dps) + uu + ': not accurate.'),
          'So the results are <b>' + labels[cls].toLowerCase() + '</b>.'],
        hint: 'Judge precision from the spread and accuracy from the average.'
      };
    }
    var tfs = [
      ['If a set of measurements is precise, it must also be accurate.', false, 'Results can agree closely with each other and still all be off, for example when a balance is not zeroed. That is precise but not accurate.'],
      ['To find percent error, divide the error by your measured value.', false, 'Divide by the accepted value: it is the reference you compare against.'],
      ['Repeating a measurement many times can show how precise it is.', true, 'Precision is how well repeated results agree, so repeating is how you see it.'],
      ['A balance that always reads 0.50 g too high gives results that can be precise but not accurate.', true, 'Every reading is off by the same amount, so they agree with each other but miss the true value.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Accuracy compares with the true value; precision compares results with each other.' };
  }));

  // ---------------- significant figures in calculations
  function dpOf(s) { var i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  G('chem.sig-fig-calculations', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 2 : 3);
    for (var guard = 0; guard < 40; guard++) {
      if (kind === 0) { // multiply or divide
        var op = R.pick(['area', 'density', 'speed', 'mass']);
        var a, b, an, bn, res, q, unit, what, opTex;
        var mk = function (lo, hi, n) { var x = R.real(lo, hi, 3); return roundSf(String(x), n) || String(sg(x, n)); };
        an = R.int(2, 4); bn = R.int(2, 4); if (an === bn) bn = an === 4 ? 2 : an + 1;
        if (op === 'area') { a = mk(2, 30, an); b = mk(1, 15, bn); res = ML.Q.from(a).mul(b); unit = 'cm2'; q = 'A rectangle measures $' + a + '\\ \\text{cm}$ by $' + b + '\\ \\text{cm}$. Find its area'; opTex = a + ' \\times ' + b; }
        else if (op === 'density') { a = mk(10, 90, an); b = mk(5, 40, bn); res = ML.Q.from(a).div(b); unit = 'g/mL'; q = 'A sample has a mass of $' + a + '\\ \\text{g}$ and a volume of $' + b + '\\ \\text{mL}$. Find its density'; opTex = a + ' \\div ' + b; }
        else if (op === 'speed') { a = mk(20, 300, an); b = mk(2, 60, bn); res = ML.Q.from(a).div(b); unit = 'm/s'; q = 'A cart rolls $' + a + '\\ \\text{m}$ in $' + b + '\\ \\text{s}$. Find its average speed'; opTex = a + ' \\div ' + b; }
        else { a = mk(1, 9, an); b = mk(10, 80, bn); res = ML.Q.from(a).mul(b); unit = 'g'; q = 'A liquid has a density of $' + a + '\\ \\text{g/mL}$. Find the mass of $' + b + '\\ \\text{mL}$ of it'; opTex = a + ' \\times ' + b; }
        an = sfCount(a); bn = sfCount(b);
        var n = Math.min(an, bn), exact = res.toDec(8), r = roundSf(exact, n);
        if (r === null || (r.indexOf('.') < 0 && /0$/.test(r)) || abs(+r) < 0.1) continue;
        return {
          q: q + ', using the correct number of significant figures.',
          a: { t: 'num', v: r, form: 'sf', sf: n }, unit: unit,
          steps: ['Calculator result: $' + opTex + ' ' + qShow(res) + '$', '$' + a + '$ has ' + an + ' significant figures and $' + b + '$ has ' + bn + '. For multiplying and dividing, the answer keeps the <b>fewest significant figures</b>: ' + n + '.', 'Round once, at the end: <b>$' + r + '\\ ' + ut(unit) + '$</b>.'],
          hint: 'Multiplying or dividing: count significant figures, not decimal places.'
        };
      }
      if (kind === 1) { // add or subtract
        var cnt = R.int(2, 3), nums = [], dps = R.shuffle([R.int(0, 1), R.int(1, 2), R.int(2, 3)]).slice(0, cnt);
        nums = dps.map(function (d) { var x = R.real(1, 60, 3); return x.toFixed(d); });
        var sub = cnt === 2 && R.coin() && +nums[0] > +nums[1];
        var sum = sub ? ML.Q.from(nums[0]).sub(nums[1]) : nums.reduce(function (s, x) { return s.add(x); }, ML.Q(0));
        var mdp = Math.min.apply(null, nums.map(dpOf));
        var ex = sum.toDec(4).replace(/\.?0+$/, '');
        var scaled = sum.mul(ML.Q(10).pow(mdp)), fl = scaled.floor(), fr = scaled.sub(fl);
        if (fr.eq(ML.Q(1, 2))) continue;
        var rr = (fr.gt(ML.Q(1, 2)) ? fl.add(1) : fl).div(ML.Q(10).pow(mdp)).toDec(mdp);
        if (+rr <= 0) continue;
        var nsf = sfCount(rr);
        if (rr.indexOf('.') < 0 && /0$/.test(rr)) continue;
        var expr = sub ? nums[0] + ' - ' + nums[1] : nums.join(' + ');
        return {
          q: (sub ? 'Subtract' : 'Add') + ' these measurements and give the answer with the correct number of significant figures: $' + expr + '\\ \\text{g}$.',
          a: { t: 'num', v: rr, form: 'sf', sf: nsf }, unit: 'g',
          steps: ['Calculator result: $' + expr + ' = ' + ex + '$', 'For adding and subtracting, what matters is <b>decimal places</b>: the answer can be no more exact than the least exact measurement. The fewest decimal places here is ' + mdp + ' (in $' + nums.filter(function (x) { return dpOf(x) === mdp; })[0] + '$).', 'Round to ' + mdp + ' decimal place' + (mdp === 1 ? '' : 's') + ': <b>$' + rr + '\\ \\text{g}$</b> (' + nsf + ' significant figure' + (nsf === 1 ? '' : 's') + ').'],
          hint: 'Adding or subtracting: line up the decimal points and keep the fewest decimal places.'
        };
      }
      if (kind === 2) { // exact numbers
        var item = R.pick([['identical coins', 'g', 'mass'], ['identical beakers', 'g', 'mass'], ['identical test tubes', 'mL', 'volume']]);
        var k = R.int(3, 12), per = R.pick(['2.50', '5.67', '11.3', '4.08', '25.0', '7.42', '3.115']);
        var tot = ML.Q.from(per).mul(k), n2 = sfCount(per), r2 = roundSf(tot.toDec(6), n2);
        if (r2 === null || (r2.indexOf('.') < 0 && /0$/.test(r2))) continue;
        return {
          q: 'Each of ' + k + ' ' + item[0] + ' has a ' + item[2] + ' of $' + per + '\\ \\text{' + item[1] + '}$. What is their total ' + item[2] + '? Use the correct number of significant figures.',
          a: { t: 'num', v: r2, form: 'sf', sf: n2 }, unit: item[1],
          steps: ['$' + k + ' \\times ' + per + ' ' + qShow(tot) + '$', 'The ' + k + ' is a count, an exact number with no uncertainty, so it does not limit the significant figures.', 'Only $' + per + '$ (' + n2 + ' significant figures) limits the answer: <b>$' + r2 + '\\ \\text{' + item[1] + '}$</b>.'],
          hint: 'Counted numbers are exact.'
        };
      }
      // kind 3: density from water displacement (subtract, then divide)
      var m = R.real(15, 80, 2).toFixed(2), v1 = R.real(18, 30, 1).toFixed(1), dv = R.real(2.1, 9.8, 1), v2 = (+v1 + dv).toFixed(1);
      var dV = ML.Q.from(v2).sub(v1), dVs = dV.toDec(1), nd = sfCount(dVs);
      var dens = ML.Q.from(m).div(dV), r3 = roundSf(dens.toDec(8), nd);
      if (r3 === null || (r3.indexOf('.') < 0 && /0$/.test(r3))) continue;
      return {
        q: 'A metal piece with a mass of $' + m + '\\ \\text{g}$ is dropped into a graduated cylinder. The water level rises from $' + v1 + '\\ \\text{mL}$ to $' + v2 + '\\ \\text{mL}$. Find the density of the metal with the correct number of significant figures.',
        a: { t: 'num', v: r3, form: 'sf', sf: nd }, unit: 'g/mL',
        steps: ['Volume of the metal (subtract, so keep decimal places): $' + v2 + ' - ' + v1 + ' = ' + dVs + '\\ \\text{mL}$, which has ' + nd + ' significant figures.', 'Density: $' + m + ' \\div ' + dVs + ' ' + qShow(dens) + '$', 'Dividing keeps the fewest significant figures: ' + m + ' has ' + sfCount(m) + ' and ' + dVs + ' has ' + nd + '. Answer: <b>$' + r3 + '\\ \\text{g/mL}$</b>.'],
        hint: 'Do the subtraction first and count what its answer is worth.'
      };
    }
    return { q: 'How many significant figures are in $2.50\\ \\text{g}$?', a: { t: 'num', v: '3' }, steps: ['Trailing zeros after a decimal point count: 3.'] };
  }));

  // ---------------- dimensional analysis
  var DA1 = [
    { q: 'hours to minutes', fromU: 'h', toU: 'min', f: [[60, 'min', 1, 'h']], gen: function (R) { return R.int(2, 39) / 4; } },
    { q: 'days to hours', fromU: 'days', toU: 'h', f: [[24, 'h', 1, 'day']], gen: function (R) { return R.int(3, 30) / 2; } },
    { q: 'inches to centimeters', fromU: 'in', toU: 'cm', f: [[2.54, 'cm', 1, 'in']], gen: function (R) { return R.int(2, 48) / 2; }, note: '$1\\ \\text{in} = 2.54\\ \\text{cm}$ exactly' },
    { q: 'pounds to grams', fromU: 'lb', toU: 'g', f: [[453.6, 'g', 1, 'lb']], gen: function (R) { return R.int(1, 20) / 4; }, note: '$1\\ \\text{lb} = 453.6\\ \\text{g}$' },
    { q: 'liters to milliliters', fromU: 'L', toU: 'mL', f: [[1000, 'mL', 1, 'L']], gen: function (R) { return R.int(5, 250) / 100; } }
  ];
  var DA2 = [
    { q: 'a speed of', fromU: 'km/h', toU: 'm/s', f: [[1000, 'm', 1, 'km'], [1, 'h', 3600, 's']], gen: function (R) { return R.coin() ? 18 * R.int(1, 8) : R.int(10, 130); } },
    { q: 'a time of', fromU: 'days', toU: 's', f: [[24, 'h', 1, 'day'], [3600, 's', 1, 'h']], gen: function (R) { return R.int(1, 10) / 2; } },
    { q: 'a mass of', fromU: 'mg', toU: 'kg', f: [[1, 'g', 1000, 'mg'], [1, 'kg', 1000, 'g']], gen: function (R) { return R.int(2, 99) * 50; } },
    { q: 'a flow rate of', fromU: 'L/min', toU: 'mL/s', f: [[1000, 'mL', 1, 'L'], [1, 'min', 60, 's']], gen: function (R) { return R.int(3, 24) / 2; } },
    { q: 'a rate of', fromU: 'm/s', toU: 'km/h', f: [[1, 'km', 1000, 'm'], [3600, 's', 1, 'h']], gen: function (R) { return R.int(2, 40); } }
  ];
  var DA3 = [
    { q: 'a volume of', fromU: 'cm3', toU: 'm3', f: [[1, 'm', 100, 'cm', 3]], gen: function (R) { return R.int(2, 250) * 50; } },
    { q: 'an area of', fromU: 'm2', toU: 'cm2', f: [[100, 'cm', 1, 'm', 2]], gen: function (R) { return R.int(1, 60) / 20; } },
    { q: 'a density of', fromU: 'g/cm3', toU: 'kg/m3', f: [[1, 'kg', 1000, 'g'], [100, 'cm', 1, 'm', 3]], gen: function (R) { return R.pick([2.70, 7.87, 1.26, 0.789, 8.96, 4.51, 11.3, 19.3, 7.13, 13.5, 0.92]); } },
    { q: 'a volume of', fromU: 'mm3', toU: 'mL', f: [[1, 'cm', 10, 'mm', 3], [1, 'mL', 1, 'cm3']], gen: function (R) { return R.int(1, 200) * 25; } },
    { q: 'a volume of', fromU: 'm3', toU: 'L', f: [[100, 'cm', 1, 'm', 3], [1, 'mL', 1, 'cm3'], [1, 'L', 1000, 'mL']], gen: function (R) { return R.int(1, 60) / 20; } }
  ];
  function uTex(u) { return ut(u); }
  G('chem.dimensional-analysis', W(function (R, ctx) {
    var L = lvl(ctx), set = R.pick(L === 1 ? DA1 : L === 2 ? DA2.concat(DA1.slice(0, 2)) : DA3.concat(DA2.slice(0, 2)));
    var v = set.gen(R), x = ML.Q.from(v);
    set.f.forEach(function (f) { var p = f[4] || 1; x = x.mul(ML.Q.from(f[0]).pow(p)).div(ML.Q.from(f[2]).pow(p)); });
    var ans = x.toNumber();
    var factT = set.f.map(function (f) { var p = f[4] || 1, n = tv(f[0]) + '\\ ' + uTex(f[1]), d = tv(f[2]) + '\\ ' + uTex(f[3]); return p === 1 ? '\\dfrac{' + n + '}{' + d + '}' : '\\left(\\dfrac{' + n + '}{' + d + '}\\right)^{' + p + '}'; }).join(' \\times ');
    var steps = [];
    if (set.note) steps.push('Use ' + set.note + '.');
    steps.push('Start with what you know and multiply by factors equal to 1, each arranged so the unit you want to get rid of is on the opposite side:');
    steps.push('$$' + tv(v) + '\\ ' + uTex(set.fromU) + ' \\times ' + factT + '$$');
    set.f.forEach(function (f) { if (f[4]) steps.push('A ' + (f[4] === 2 ? 'squared' : 'cubed') + ' unit needs the factor ' + (f[4] === 2 ? 'squared' : 'cubed') + ': $(' + tv(f[0]) + ')^' + f[4] + ' = ' + tv(Math.pow(f[0], f[4])) + '$, not just $' + tv(f[0]) + '$.'); });
    steps.push('The unwanted units cancel, leaving only the units you want: <b>$' + tn(ans, 4) + '\\ ' + uTex(set.toU) + '$</b>.');
    return {
      q: 'Convert ' + (set.q.indexOf(' to ') > 0 ? '' : set.q + ' ') + '$' + tv(v) + '\\ ' + uTex(set.fromU) + '$ to $' + uTex(set.toU) + '$.' + (set.note ? ' Use ' + set.note + '.' : ''),
      a: A(ans, 4, 0.01), unit: set.toU === 'cm3' ? 'cm³' : set.toU === 'm3' ? 'm³' : set.toU === 'cm2' ? 'cm²' : set.toU === 'kg/m3' ? 'kg/m³' : set.toU,
      steps: steps,
      hint: 'Set up each factor so the old unit cancels: if it is on top, put it on the bottom of the factor.'
    };
  }));

  // ---------------- density
  var METALS = [['aluminum', 2.70], ['titanium', 4.51], ['zinc', 7.13], ['iron', 7.87], ['copper', 8.96], ['silver', 10.5], ['lead', 11.3], ['gold', 19.3]];
  G('chem.density', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) { // d = m / V
      var md = R.pick(METALS), V = R.pick([2.5, 4.0, 5.0, 8.0, 10.0, 12.5, 15.0, 20.0]), m = +(md[1] * V).toFixed(2);
      var d = m / V;
      return {
        q: 'A block of metal has a mass of $' + tv(m) + '\\ \\text{g}$ and a volume of $' + tv(V) + '\\ \\text{cm}^3$. What is its density?',
        a: A(d, 3, 0.01), unit: 'g/cm³',
        steps: ['Density is mass per unit volume: $d = \\dfrac{m}{V}$.', '$d = \\dfrac{' + tv(m) + '\\ \\text{g}}{' + tv(V) + '\\ \\text{cm}^3} = ' + tn(d, 3) + '\\ \\text{g/cm}^3$', 'Each cubic centimeter of this metal has a mass of about ' + tn(d, 3) + ' g. (That matches ' + md[0] + '.)'],
        hint: 'Divide the mass by the volume.'
      };
    }
    if (kind === 1) { // find mass or volume
      var liq = R.pick([['ethanol', 0.789, 'g/mL'], ['glycerol', 1.26, 'g/mL'], ['mercury', 13.5, 'g/mL'], ['olive oil', 0.92, 'g/mL']].concat(METALS.slice(0, 5).map(function (x) { return [x[0], x[1], 'g/cm3']; })));
      var vu = liq[2] === 'g/mL' ? 'mL' : 'cm3', findM = R.coin();
      if (findM) {
        var V2 = R.pick([25, 40, 50, 75, 120, 250]), m2 = liq[1] * V2;
        return {
          q: 'The density of ' + liq[0] + ' is $' + tv(liq[1]) + '\\ ' + ut(liq[2]) + '$. What is the mass of $' + V2 + '\\ ' + ut(vu) + '$ of ' + liq[0] + '?',
          a: A(m2, 3, 0.01), unit: 'g',
          steps: ['Rearrange $d = \\dfrac{m}{V}$ to get $m = d \\times V$.', '$m = ' + tv(liq[1]) + '\\ ' + ut(liq[2]) + ' \\times ' + V2 + '\\ ' + ut(vu) + ' = ' + tn(m2, 3) + '\\ \\text{g}$', 'The volume units cancel, leaving grams.'],
          hint: 'Mass = density × volume.'
        };
      }
      var m3 = R.pick([50, 80, 100, 150, 200, 250]), V3 = m3 / liq[1];
      return {
        q: 'The density of ' + liq[0] + ' is $' + tv(liq[1]) + '\\ ' + ut(liq[2]) + '$. What volume does $' + m3 + '\\ \\text{g}$ of ' + liq[0] + ' take up?',
        a: A(V3, 3, 0.01), unit: vu === 'cm3' ? 'cm³' : 'mL',
        steps: ['Rearrange $d = \\dfrac{m}{V}$ to get $V = \\dfrac{m}{d}$.', '$V = \\dfrac{' + m3 + '\\ \\text{g}}{' + tv(liq[1]) + '\\ ' + ut(liq[2]) + '} = ' + tn(V3, 3) + '\\ ' + ut(vu) + '$', 'Grams cancel, leaving a volume.'],
        hint: 'Volume = mass ÷ density.'
      };
    }
    if (kind === 2 || kind === 4) { // identify by water displacement
      var mt = R.pick(METALS), dv = R.pick([2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]), v1 = R.pick([20.0, 25.0, 30.0, 40.0]), mm2 = +(mt[1] * dv).toFixed(1);
      var dd = mm2 / dv, others = METALS.filter(function (x) { return x[0] !== mt[0] && abs(x[1] - dd) / dd > 0.08; });
      var choices = R.sample(others, 3).map(function (x) { return cap(x[0]) + ' (' + x[1].toPrecision(3) + ' g/cm³)'; });
      return {
        q: 'A shiny metal sample has a mass of $' + tv(mm2) + '\\ \\text{g}$. Dropped into a graduated cylinder, it raises the water level from $' + v1.toFixed(1) + '\\ \\text{mL}$ to $' + (v1 + dv).toFixed(1) + '\\ \\text{mL}$. Which metal is it?',
        a: MC(cap(mt[0]) + ' (' + mt[1].toPrecision(3) + ' g/cm³)', choices),
        steps: ['The rise in the water level is the sample’s volume: $' + (v1 + dv).toFixed(1) + ' - ' + v1.toFixed(1) + ' = ' + dv.toFixed(1) + '\\ \\text{mL} = ' + dv.toFixed(1) + '\\ \\text{cm}^3$ (1 mL = 1 cm³).', '$d = \\dfrac{' + tv(mm2) + '\\ \\text{g}}{' + dv.toFixed(1) + '\\ \\text{cm}^3} = ' + tn(dd, 3) + '\\ \\text{g/cm}^3$', 'Density is a property of the substance, so it identifies the metal: <b>' + mt[0] + '</b>.'],
        hint: 'Find the volume from the change in the water level first.'
      };
    }
    var tfs = [
      ['A block of aluminum is cut in half. Each half has half the density of the whole block.', false, 'Cutting halves both the mass and the volume, so mass ÷ volume stays the same. Density does not depend on how much you have.'],
      ['A large log can float on water while a small pebble sinks, because the pebble is denser than water and the log is not.', true, 'Floating depends on density, not size: wood is less dense than water, and rock is denser.'],
      ['A heavier object is always denser than a lighter one.', false, 'A heavy object might also be very large. Density compares mass with volume: a large block of foam is heavier than a paper clip but much less dense.'],
      ['Two samples of pure copper of different sizes have the same density at the same temperature.', true, 'Density is a property of the substance itself.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Density is mass divided by volume; it does not depend on the amount.' };
  }));

  // ---------------- temperature scales
  G('chem.temperature-scales', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) {
      var C = R.coin() ? R.pick([25, 37, 100, -40, -78, -196, 0, 450, 1085, -183]) : R.int(-90, 160), K = C + 273.15;
      return {
        q: 'Convert $' + C + '\\ ^\\circ\\text{C}$ to kelvins.',
        a: { t: 'num', v: String(fx(K)), tol: 0.16 }, unit: 'K',
        steps: ['A kelvin is the same size as a Celsius degree, but the kelvin scale starts at absolute zero, 273.15 below 0 °C.', '$T_K = T_C + 273.15 = ' + C + ' + 273.15 = ' + fx(K) + '\\ \\text{K}$', 'Rounded to whole kelvins, that is ' + Math.round(C + 273) + ' K (many problems use 273).'],
        hint: 'Add 273.15.'
      };
    }
    if (kind === 1) {
      var K2 = R.coin() ? R.pick([300, 350, 77, 195, 400, 250, 500, 1000, 4]) : R.int(60, 700), C2 = K2 - 273.15;
      return {
        q: 'A sample is at $' + K2 + '\\ \\text{K}$. What is its temperature in degrees Celsius?',
        a: { t: 'num', v: String(fx(C2)), tol: 0.16 }, unit: '°C',
        steps: ['Undo the shift: $T_C = T_K - 273.15$.', '$T_C = ' + K2 + ' - 273.15 = ' + fx(C2) + '\\ ^\\circ\\text{C}$', '(With 273, you get ' + (K2 - 273) + ' °C.)'],
        hint: 'Subtract 273.15.'
      };
    }
    if (kind === 2) {
      var t1 = R.int(-10, 30), dt = R.int(12, 60), t2 = t1 + dt;
      return {
        q: 'A sample warms from $' + t1 + '\\ ^\\circ\\text{C}$ to $' + t2 + '\\ ^\\circ\\text{C}$. By how many kelvins did its temperature change?',
        a: { t: 'num', v: String(dt) }, unit: 'K',
        steps: ['The change in Celsius is $' + t2 + ' - (' + t1 + ') = ' + dt + '\\ ^\\circ\\text{C}$.', 'A kelvin and a Celsius degree are the same size step, so a change of ' + dt + ' °C is a change of <b>' + dt + ' K</b>. The 273.15 cancels when you subtract.'],
        hint: 'The two scales have steps of the same size.'
      };
    }
    if (kind === 3) {
      var tfs = [
        ['At $0\\ ^\\circ\\text{C}$, the particles of a substance have no thermal energy.', false, '0 °C is just the freezing point of water, 273.15 K. Particles there still move. Only absolute zero, 0 K, is the bottom of the scale.'],
        ['Water at $20\\ ^\\circ\\text{C}$ has twice the average particle kinetic energy of water at $10\\ ^\\circ\\text{C}$.', false, 'Average kinetic energy is proportional to the kelvin temperature: 293 K is only about 3.5% more than 283 K, not double.'],
        ['A change of $10\\ \\text{K}$ is the same size as a change of $10\\ ^\\circ\\text{C}$.', true, 'The two scales have steps of the same size; they only start at different places.'],
        ['Nothing can be cooled below $0\\ \\text{K}$.', true, 'Absolute zero is the lowest temperature on the scale; real samples can get close but never reach it.']
      ];
      var t = R.pick(tfs);
      return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Ratios of temperatures only make sense in kelvins.' };
    }
    var C3 = R.int(-80, 150), K3 = C3 + 273.15, K4 = 2 * K3, C4 = K4 - 273.15;
    return {
      q: 'A gas at $' + C3 + '\\ ^\\circ\\text{C}$ is heated until the average kinetic energy of its particles doubles. What is its new temperature in degrees Celsius?',
      a: { t: 'num', v: String(fx(C4)), tol: 0.2 }, unit: '°C',
      steps: ['Average kinetic energy is proportional to the <b>kelvin</b> temperature, so the kelvin temperature must double.', 'Start: $' + C3 + ' + 273.15 = ' + fx(K3) + '\\ \\text{K}$. Double it: $' + fx(K4) + '\\ \\text{K}$.', 'Back to Celsius: $' + fx(K4) + ' - 273.15 = ' + fx(C4) + '\\ ^\\circ\\text{C}$ (or ' + (2 * (C3 + 273) - 273) + ' °C using 273). Doubling the Celsius number would be wrong.'],
      hint: 'Convert to kelvins before doubling.'
    };
  }));

  // ======================= 02-atoms.js
  // ---------------------------------------------------------------- unit: Atoms and Isotopes
  EL.U = { Z: 92, s: 'U', name: 'Uranium', group: null, period: 7 }; ELZ[92] = EL.U;
  EL.Cs.name = 'Cesium';
  var MODELQ = [
    ['Which experiment showed that an atom has a tiny, dense, positive nucleus?', 'Rutherford’s gold-foil experiment (alpha particles fired at thin gold foil)', ['Thomson’s cathode-ray experiments', 'Dalton’s measurements of how elements combine by mass', 'Millikan’s oil-drop experiment']],
    ['In the gold-foil experiment, most alpha particles passed straight through the foil. What did that show?', 'Most of an atom is empty space', ['Atoms are solid spheres packed tightly together', 'Gold atoms have no charge at all', 'Alpha particles are smaller than electrons']],
    ['In the gold-foil experiment, a very few alpha particles bounced almost straight back. What did that show?', 'The atom’s positive charge and almost all its mass are packed into a tiny nucleus', ['Electrons are heavy enough to stop alpha particles', 'The positive charge is spread evenly through the whole atom', 'The foil had holes in it']],
    ['What did J. J. Thomson discover with his cathode-ray experiments?', 'Electrons: tiny negative particles that are part of every atom', ['The nucleus', 'The neutron', 'That atoms combine in whole-number ratios']],
    ['Which idea was part of Dalton’s atomic theory (1808)?', 'Atoms combine in simple whole-number ratios to form compounds', ['Atoms contain electrons', 'Atoms have a tiny nucleus', 'Electrons move in fixed energy levels']],
    ['Which model pictured the atom as a ball of positive charge with electrons scattered through it?', 'Thomson’s model', ['Dalton’s model', 'Rutherford’s model', 'Bohr’s model']],
    ['What did Niels Bohr add to the nuclear model of the atom?', 'Electrons can have only certain energies, in levels around the nucleus', ['The atom has a nucleus', 'Atoms cannot be divided', 'Neutrons in the nucleus']],
    ['Which particle did James Chadwick identify in 1932?', 'The neutron', ['The electron', 'The proton', 'The alpha particle']]
  ];
  G('chem.atomic-models', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 0 : R.pick(L === 2 ? [0, 0, 1, 2] : [0, 1, 2, 3]);
    if (kind === 0) {
      var b = R.pick(L === 1 ? MODELQ.slice(0, 5) : MODELQ);
      return { q: b[0], a: MC(b[1], b[2]), steps: [b[1] + '.', MODELW[MODELQ.indexOf(b)]], hint: 'Match each scientist with the experiment or idea that changed the model.' };
    }
    if (kind === 1) {
      var ratio = R.pick([10000, 20000, 50000, 100000]), dot = R.pick([[1, 'mm', 0.001], [2, 'mm', 0.002], [5, 'mm', 0.005], [1, 'cm', 0.01]]), w = ratio * dot[2];
      return {
        q: 'For one kind of atom, the whole atom is about ' + T.commas(ratio) + ' times wider than its nucleus. If you drew the nucleus as a dot $' + dot[0] + '\\ \\text{' + dot[1] + '}$ wide, how wide would the atom be, in meters?',
        a: A(w, 3, 0.01), unit: 'm',
        steps: ['The drawing keeps the same ratio: the atom is ' + T.commas(ratio) + ' times the width of the dot.', '$' + dot[0] + '\\ \\text{' + dot[1] + '} = ' + tv(dot[2]) + '\\ \\text{m}$', '$' + T.commas(ratio) + ' \\times ' + tv(dot[2]) + '\\ \\text{m} = ' + tv(w) + '\\ \\text{m}$. Almost all of that space holds only the electrons.'],
        hint: 'Convert the dot’s size to meters, then multiply by the ratio.'
      };
    }
    if (kind === 2) {
      var right = 'Dalton, Thomson, Rutherford, Bohr';
      return {
        q: 'Which list puts these atomic models in the order they were proposed?',
        a: MC(right, ['Thomson, Dalton, Bohr, Rutherford', 'Dalton, Rutherford, Thomson, Bohr', 'Rutherford, Thomson, Dalton, Bohr', 'Bohr, Rutherford, Thomson, Dalton']),
        steps: ['Dalton (1808): atoms as solid, indivisible spheres.', 'Thomson (1897, 1904): electrons found, so atoms have parts: a positive ball with electrons in it.', 'Rutherford (1911): the gold-foil results need a tiny nucleus.', 'Bohr (1913): electrons in energy levels around that nucleus. Order: <b>' + right + '</b>.'],
        hint: 'Each model was replaced because an experiment found something the old one could not explain.'
      };
    }
    var tfs = [
      ['Rutherford’s experiment showed that an atom is a solid ball of matter.', false, 'Most alpha particles went straight through, so the atom is mostly empty space around a tiny nucleus.'],
      ['Thomson’s model predicted that alpha particles would pass through gold foil with only small deflections.', true, 'In his model the positive charge was spread thinly through the atom, so nothing in it could turn a fast alpha particle back.'],
      ['The nucleus holds almost all of an atom’s mass.', true, 'Protons and neutrons are each about 1836 times as massive as an electron, and both are in the nucleus.'],
      ['Each new atomic model came from a new experiment that the older model could not explain.', true, 'Cathode rays led to Thomson’s model, the gold foil to Rutherford’s and the spectra of atoms to Bohr’s.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Think about what the gold-foil results showed.' };
  }));
  var MODELW = [
    'A few alpha particles bounced back from the foil, which only a tiny, dense, positive center could cause.',
    'If the atoms were solid, nearly every alpha particle would have been stopped or turned aside.',
    'To turn back a fast, heavy alpha particle, something small must hold a lot of positive charge and mass in one place.',
    'Cathode rays bent toward positive plates and were the same from every metal, so they were negative particles inside all atoms.',
    'Dalton explained the fixed mass ratios in compounds with atoms that join in small whole numbers; electrons and the nucleus came later.',
    'Thomson knew atoms held electrons and were neutral overall, so he spread positive charge through the whole atom.',
    'Bohr explained why atoms give off light only of certain colors: electrons jump between fixed energy levels.',
    'Chadwick found a neutral particle in the nucleus with about the mass of a proton.'
  ];

  var COMMON = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Br', 'Ag', 'I', 'Au', 'Pb'];
  G('chem.subatomic-particles', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) {
      var e = EL[R.pick(COMMON)], askE = R.coin();
      return {
        q: 'A neutral atom of ' + lname(e) + ' (' + e.s + ') has atomic number ' + e.Z + '. How many ' + (askE ? 'electrons' : 'protons') + ' does it have?',
        a: { t: 'num', v: String(e.Z) },
        steps: ['The atomic number is the number of protons: ' + e.Z + '.', askE ? 'A neutral atom has no overall charge, so its electrons (−1 each) balance its protons (+1 each): <b>' + e.Z + ' electrons</b>.' : 'So it has <b>' + e.Z + ' protons</b>.'],
        hint: 'Atomic number = number of protons; neutral means equal numbers of protons and electrons.'
      };
    }
    if (kind === 1) {
      var e1 = ELZ[R.int(1, 30)], nn = Math.max(0, Math.round(e1.Z * R.real(1.0, 1.2, 2)) + (e1.Z === 1 ? 0 : 0));
      if (e1.Z === 1) nn = R.int(0, 1);
      return {
        q: 'An atom has ' + e1.Z + ' ' + plural(e1.Z, 'proton') + ', ' + nn + ' ' + plural(nn, 'neutron') + ' and ' + e1.Z + ' ' + plural(e1.Z, 'electron') + '. Which element is it? Type its symbol. (Use the periodic table: each cell shows its atomic number.)',
        viz: { name: 'ch-periodic', opts: { mode: 'category' } },
        a: { t: 'formula', v: [e1.s] },
        steps: ['Only the number of protons decides the element. That number is the atomic number: ' + e1.Z + '.', 'Element ' + e1.Z + ' on the periodic table is ' + lname(e1) + ': <b>' + e1.s + '</b>. The neutrons and electrons do not change which element it is.'],
        hint: 'Which particle count is the atomic number?'
      };
    }
    if (kind === 2) {
      var bank = [
        ['What decides which element an atom is?', 'The number of protons', ['The number of neutrons', 'The number of electrons', 'The total number of particles']],
        ['Which particle has almost no mass compared with the others?', 'The electron', ['The proton', 'The neutron', 'They all have about the same mass']],
        ['Which particles are found in the nucleus?', 'Protons and neutrons', ['Protons and electrons', 'Neutrons and electrons', 'Only electrons']],
        ['What is the charge of a neutron?', 'No charge (neutral)', ['+1', '−1', '+2']],
        ['Why does a neutral atom have no overall charge?', 'It has equal numbers of protons and electrons', ['It has equal numbers of protons and neutrons', 'Its neutrons cancel the charge', 'Its electrons have no charge']]
      ];
      var b = R.pick(bank);
      return { q: b[0], a: MC(b[1], b[2]), steps: ['Protons: charge +1, mass about 1 u, in the nucleus. Neutrons: no charge, mass about 1 u, in the nucleus. Electrons: charge −1, mass about 1/1836 u, outside the nucleus.', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Picture the three particles with their charges, masses and places.' };
    }
    if (kind === 3) {
      var e2 = ELZ[R.int(3, 20)], n2 = e2.Z + R.int(0, 2), elec = e2.Z + R.pick([-2, -1, 1, 2]);
      var other = ELZ[n2] && n2 !== e2.Z ? ELZ[n2] : ELZ[elec];
      return {
        q: 'A particle has ' + e2.Z + ' protons, ' + n2 + ' neutrons and ' + elec + ' electrons. Which element is it?',
        a: MC(cap(lname(e2)), [cap(lname(ELZ[elec])), ELZ[n2] && n2 !== e2.Z ? cap(lname(ELZ[n2])) : cap(lname(ELZ[e2.Z + 3])), cap(lname(ELZ[Math.min(e2.Z + n2, 36)]))]),
        steps: ['Only protons decide the element: ' + e2.Z + ' protons means element ' + e2.Z + ', ' + lname(e2) + '.', 'The extra or missing electrons make it an ion (charge ' + signedT(e2.Z - elec) + '), and the neutrons make it one isotope or another; neither changes the element. Answer: <b>' + lname(e2) + '</b>.'],
        hint: 'Look only at the protons.'
      };
    }
    var ratio = 1.6726e-27 / 9.109e-31;
    return {
      q: 'A proton has a mass of $1.673 \\times 10^{-27}\\ \\text{kg}$ and an electron has a mass of $9.109 \\times 10^{-31}\\ \\text{kg}$. About how many electrons would it take to match the mass of one proton? (Use a calculator.)',
      a: A(1.673e-27 / 9.109e-31, 4, 0.01),
      steps: ['Divide the proton’s mass by the electron’s: $\\dfrac{1.673 \\times 10^{-27}}{9.109 \\times 10^{-31}}$.', '$= \\dfrac{1.673}{9.109} \\times 10^{4} \\approx 0.1837 \\times 10^{4} \\approx ' + T.commas(Math.round(1.673e-27 / 9.109e-31)) + '$', 'About 1840 electrons. That is why almost all of an atom’s mass is in its nucleus.'],
      hint: 'Divide, and handle the powers of ten separately.'
    };
  }));

  var ISO = { H: [1, 2, 3], He: [3, 4], Li: [6, 7], B: [10, 11], C: [12, 13, 14], N: [14, 15], O: [16, 17, 18], Ne: [20, 21, 22], Mg: [24, 25, 26], Si: [28, 29, 30], Cl: [35, 37], K: [39, 40, 41], Ca: [40, 42, 44, 48], Fe: [54, 56, 57, 58], Co: [59, 60], Cu: [63, 65], Br: [79, 81], Sr: [88, 90], Ag: [107, 109], I: [127, 131], Cs: [133, 137], U: [235, 238], Pb: [206, 207, 208] };
  var ISOK = Object.keys(ISO);
  function nuc(A, Z, s) { return '{}^{' + A + '}_{' + Z + '}\\mathrm{' + s + '}'; }
  G('chem.isotopes', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    var s = R.pick(L === 1 ? ['H', 'C', 'N', 'O', 'Cl', 'Mg', 'Ne', 'Li', 'B'] : ISOK), e = EL[s], A = R.pick(ISO[s]), n = A - e.Z;
    if (kind === 0) {
      var form = R.coin() ? '$' + nuc(A, e.Z, s) + '$' : lname(e) + '-' + A + ' (atomic number ' + e.Z + ')';
      return {
        q: 'How many neutrons are in an atom of ' + form + '?',
        a: { t: 'num', v: String(n) },
        steps: ['The mass number counts protons and neutrons together: $A = ' + A + '$.', 'The atomic number counts protons: $Z = ' + e.Z + '$.', 'Neutrons $= A - Z = ' + A + ' - ' + e.Z + ' = ' + n + '$'],
        hint: 'Neutrons = mass number − atomic number.'
      };
    }
    if (kind === 1) {
      return {
        q: 'An atom of ' + lname(e) + ' has ' + e.Z + ' protons and ' + n + ' ' + plural(n, 'neutron') + '. What is its mass number?',
        a: { t: 'num', v: String(A) },
        steps: ['The mass number is the count of particles in the nucleus: protons + neutrons.', '$A = ' + e.Z + ' + ' + n + ' = ' + A + '$, so this is ' + lname(e) + '-' + A + '.'],
        hint: 'Add the particles in the nucleus.'
      };
    }
    if (kind === 2) {
      return {
        q: 'For a neutral atom of $' + nuc(A, e.Z, s) + '$, give the numbers of protons, neutrons and electrons.',
        a: { t: 'multi', parts: [{ label: 'protons', a: { t: 'num', v: String(e.Z) } }, { label: 'neutrons', a: { t: 'num', v: String(n) } }, { label: 'electrons', a: { t: 'num', v: String(e.Z) } }] },
        steps: ['The lower number is the atomic number: ' + e.Z + ' protons.', 'The upper number is the mass number: neutrons $= ' + A + ' - ' + e.Z + ' = ' + n + '$.', 'Neutral, so electrons = protons = ' + e.Z + '.'],
        hint: 'Bottom number: protons. Top number: protons + neutrons.'
      };
    }
    if (kind === 3) {
      var multi = ISOK.filter(function (k) { return ISO[k].length >= 2 && EL[k].Z > 2 && EL[k].Z < 36; }), s2 = R.pick(multi), e2 = EL[s2], As = R.sample(ISO[s2], 2);
      var good = '$' + nuc(As[0], e2.Z, s2) + '$ and $' + nuc(As[1], e2.Z, s2) + '$';
      var nb = ELZ[e2.Z + 1], wrongs = [
        '$' + nuc(As[0], e2.Z, s2) + '$ and $' + nuc(As[0], nb.Z, nb.s) + '$',
        '$' + nuc(14, 6, 'C') + '$ and $' + nuc(14, 7, 'N') + '$',
        '$' + nuc(40, 18, 'Ar') + '$ and $' + nuc(40, 20, 'Ca') + '$'
      ];
      return {
        q: 'Which pair are isotopes of the same element?',
        a: MC(good, wrongs),
        steps: ['Isotopes have the <b>same number of protons</b> (same atomic number, the lower number) but different numbers of neutrons, so different mass numbers.', 'Pairs with the same mass number but different atomic numbers are different elements.', 'Answer: ' + good + ': both have ' + e2.Z + ' protons.'],
        hint: 'Compare the lower numbers first.'
      };
    }
    var tfs = [
      ['Carbon-12 and carbon-14 have different numbers of protons.', false, 'Both are carbon, so both have 6 protons. Carbon-14 has 8 neutrons and carbon-12 has 6.'],
      ['To find the neutrons, add the atomic number to the mass number.', false, 'The mass number already includes the protons, so subtract: neutrons = A − Z.'],
      ['Isotopes of an element have nearly the same chemical behavior.', true, 'Chemistry depends on the electrons, and isotopes have the same number of protons and so the same number of electrons when neutral.'],
      ['Uranium-235 and uranium-238 differ by three neutrons.', true, 'Both have 92 protons: 235 − 92 = 143 neutrons and 238 − 92 = 146 neutrons.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Same element means the same number of protons.' };
  }));

  G('chem.ions', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    var IONS = [['Na', 1], ['K', 1], ['Li', 1], ['Mg', 2], ['Ca', 2], ['Al', 3], ['F', -1], ['Cl', -1], ['Br', -1], ['O', -2], ['S', -2], ['N', -3], ['Fe', 2], ['Fe', 3], ['Cu', 2], ['Zn', 2], ['I', -1], ['Ba', 2]];
    var io = R.pick(IONS), e = EL[io[0]], q = io[1], ne = e.Z - q;
    if (kind === 0) {
      return {
        q: 'A particle has ' + e.Z + ' protons and ' + ne + ' electrons. What is its charge? (Give a signed number, like −2 or +3.)',
        a: { t: 'num', v: String(q) },
        steps: ['Each proton is +1 and each electron is −1.', 'Charge = protons − electrons $= ' + e.Z + ' - ' + ne + ' = ' + signed(q) + '$', q > 0 ? 'It has fewer electrons than protons, so it is a positive ion (a cation).' : 'It has more electrons than protons, so it is a negative ion (an anion).'],
        hint: 'Charge = protons − electrons.'
      };
    }
    if (kind === 1) {
      return {
        q: 'How many electrons does the ion $' + ft(ionF(e.s, q)) + '$ have? (The atomic number of ' + lname(e) + ' is ' + e.Z + '.)',
        a: { t: 'num', v: String(ne) },
        steps: ['A neutral ' + lname(e) + ' atom has ' + e.Z + ' electrons.', q > 0 ? 'A charge of ' + chgT(q) + ' means it lost ' + q + ' ' + plural(q, 'electron') + '.' : 'A charge of ' + chgT(q) + ' means it gained ' + (-q) + ' ' + plural(-q, 'electron') + '.', 'Electrons $= ' + e.Z + (q > 0 ? ' - ' + q : ' + ' + (-q)) + ' = ' + ne + '$'],
        hint: 'A positive charge means electrons were lost; a negative charge means electrons were gained.'
      };
    }
    if (kind === 2) {
      var gain = q < 0;
      return {
        q: 'A ' + lname(e) + ' atom (' + e.s + ') ' + (gain ? 'gains ' + (-q) : 'loses ' + q) + ' ' + plural(abs(q), 'electron') + '. Write the symbol of the ion it forms, with its charge (like Ca2+ or Cl−).',
        a: { t: 'formula', v: [ionF(e.s, q)] },
        steps: [gain ? 'Gaining ' + (-q) + ' ' + plural(-q, 'electron') + ' adds ' + (-q) + ' negative ' + plural(-q, 'charge') + ', and the protons do not change.' : 'Losing ' + q + ' ' + plural(q, 'electron') + ' leaves ' + q + ' more ' + plural(q, 'proton') + ' than electrons.', 'The ion is <b>$' + ft(ionF(e.s, q)) + '$</b>.'],
        hint: 'Electrons are negative: losing them makes the charge more positive.'
      };
    }
    if (kind === 3) {
      var bank = [
        ['How does a sodium atom become a sodium ion, Na⁺?', 'It loses one electron', ['It gains one proton', 'It gains one electron', 'It loses one proton']],
        ['How does a chlorine atom become a chloride ion, Cl⁻?', 'It gains one electron', ['It loses one proton', 'It loses one electron', 'It gains one neutron']],
        ['An atom loses two electrons. What happens to its charge?', 'It becomes +2', ['It becomes −2', 'It stays 0', 'It becomes +1']],
        ['Which change can turn an atom into an ion in a chemical reaction?', 'Gaining or losing electrons', ['Gaining or losing protons', 'Gaining or losing neutrons', 'Splitting the nucleus']]
      ];
      var b = R.pick(bank);
      return { q: b[0], a: MC(b[1], b[2]), steps: ['In chemical changes only electrons move between atoms; the nucleus (protons and neutrons) stays the same.', 'Losing negative electrons leaves a positive charge; gaining them leaves a negative charge.', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Only electrons move in chemistry.' };
    }
    var COMMONA = { Na: [23], K: [39, 41], Li: [6, 7], Mg: [24, 26], Ca: [40, 44], Al: [27], F: [19], Cl: [35, 37], Br: [79, 81], O: [16, 18], S: [32, 34], N: [14, 15], Fe: [54, 56], Cu: [63, 65], Zn: [64, 66], I: [127], Ba: [137, 138] };
    var A2 = R.pick(COMMONA[e.s]);
    return {
      q: 'The ion $' + '{}^{' + A2 + '}_{' + e.Z + '}\\mathrm{' + e.s + '}^{' + chgT(q) + '}' + '$ has how many protons, neutrons and electrons?',
      a: { t: 'multi', parts: [{ label: 'protons', a: { t: 'num', v: String(e.Z) } }, { label: 'neutrons', a: { t: 'num', v: String(A2 - e.Z) } }, { label: 'electrons', a: { t: 'num', v: String(ne) } }] },
      steps: ['Protons = atomic number = ' + e.Z + '.', 'Neutrons $= ' + A2 + ' - ' + e.Z + ' = ' + (A2 - e.Z) + '$', 'Electrons: charge ' + chgT(q) + ' means ' + (q > 0 ? q + ' fewer' : (-q) + ' more') + ' than ' + e.Z + ': $' + ne + '$.'],
      hint: 'The charge only changes the electrons.'
    };
  }));

  var AAM = { // isotopic masses (u) rounded to 3 decimals and abundances (atom %) from NIST
    boron: [['B', 10.013, 19.9], ['B', 11.009, 80.1]], chlorine: [['Cl', 34.969, 75.76], ['Cl', 36.966, 24.24]], copper: [['Cu', 62.930, 69.15], ['Cu', 64.928, 30.85]],
    lithium: [['Li', 6.015, 7.59], ['Li', 7.016, 92.41]], bromine: [['Br', 78.918, 50.69], ['Br', 80.916, 49.31]], gallium: [['Ga', 68.926, 60.11], ['Ga', 70.925, 39.89]],
    silver: [['Ag', 106.905, 51.84], ['Ag', 108.905, 48.16]], rubidium: [['Rb', 84.912, 72.17], ['Rb', 86.909, 27.83]]
  };
  var AAM3 = { magnesium: [['Mg', 23.985, 78.99], ['Mg', 24.986, 10.00], ['Mg', 25.983, 11.01]], silicon: [['Si', 27.977, 92.22], ['Si', 28.976, 4.69], ['Si', 29.974, 3.09]], neon: [['Ne', 19.992, 90.48], ['Ne', 20.994, 0.27], ['Ne', 21.991, 9.25]] };
  function isoName(el, m) { return el + '-' + Math.round(m); }
  G('chem.average-atomic-mass', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick([0, 0, 3]) : L === 2 ? R.pick([0, 1, 1, 3, 4]) : R.pick([0, 1, 2, 2, 3, 4]);
    if (kind <= 2) {
      var iso, name;
      if (kind === 0) { var m1 = R.int(10, 120), d = R.pick([1, 2]), a1 = L === 1 ? R.pick([60, 70, 75, 80, 90]) : R.int(110, 190) / 2; iso = [['X', m1 + 0.0, a1], ['X', m1 + d + 0.0, fx(100 - a1)]]; name = 'element X'; }
      else if (kind === 1) { name = R.pick(Object.keys(AAM)); iso = AAM[name]; }
      else { name = R.pick(Object.keys(AAM3)); iso = AAM3[name]; }
      var avg = iso.reduce(function (s, x) { return s + x[1] * x[2] / 100; }, 0);
      var tbl = iso.map(function (x) { return (kind === 0 ? 'an isotope of mass $' + x[1].toFixed(1) + '\\ \\text{u}$' : isoName(x[0], x[1]) + ' ($' + x[1].toFixed(3) + '\\ \\text{u}$)') + ' with ' + x[2] + '% abundance'; });
      var terms = iso.map(function (x) { return '(' + (kind === 0 ? x[1].toFixed(1) : x[1].toFixed(3)) + ')(' + tv(x[2] / 100) + ')'; });
      return {
        q: (kind === 0 ? 'Element X has two isotopes: ' : cap(name) + ' in nature is a mix of ' + iso.length + ' isotopes: ') + U.list(tbl) + '. What is the average atomic mass? Give it to two decimal places.',
        a: { t: 'num', v: avg.toFixed(2), tol: 0.011 }, unit: 'u',
        steps: ['Change each percent to a decimal fraction, then weight each mass by how common it is.', '$' + terms.join(' + ') + '$', '$= ' + iso.map(function (x) { return tn(x[1] * x[2] / 100, 4); }).join(' + ') + ' = ' + avg.toFixed(2) + '\\ \\text{u}$', kind === 0 ? 'The average lands closer to the mass of the more common isotope, as a weighted average should.' : 'The average lands closest to the mass of ' + isoName(iso[0][0], iso.slice().sort(function (a, b) { return b[2] - a[2]; })[0][1]) + ', the most common isotope, as a weighted average should.'],
        hint: 'Multiply each mass by its abundance as a decimal, then add.'
      };
    }
    if (kind === 3) {
      var nm = R.pick(Object.keys(AAM)), I2 = AAM[nm], av = I2.reduce(function (s, x) { return s + x[1] * x[2] / 100; }, 0);
      var more = I2[0][2] > I2[1][2] ? 0 : 1;
      if (abs(I2[0][2] - I2[1][2]) < 5) { nm = 'chlorine'; I2 = AAM.chlorine; av = 35.45; more = 0; }
      return {
        q: cap(nm) + ' has two stable isotopes, ' + isoName(I2[0][0], I2[0][1]) + ' and ' + isoName(I2[1][0], I2[1][1]) + '. Its average atomic mass is $' + av.toFixed(2) + '\\ \\text{u}$. Which isotope is more common?',
        a: MCK([isoName(I2[0][0], I2[0][1]), isoName(I2[1][0], I2[1][1]), 'They are equally common', 'There is no way to tell'], more),
        steps: ['A weighted average sits closer to the value that counts more.', 'The midpoint of ' + Math.round(I2[0][1]) + ' and ' + Math.round(I2[1][1]) + ' is ' + ((Math.round(I2[0][1]) + Math.round(I2[1][1])) / 2) + '. The average, ' + av.toFixed(2) + ', is on the side of ' + Math.round(I2[more][1]) + '.', 'So <b>' + isoName(I2[more][0], I2[more][1]) + '</b> is more common.'],
        hint: 'Is the average closer to the lighter or the heavier isotope?'
      };
    }
    // kind 4: find the abundance from the average
    var nm4 = R.pick(['copper', 'chlorine', 'boron', 'gallium', 'rubidium']), I4 = AAM[nm4];
    var avg4 = +(I4[0][1] * I4[0][2] / 100 + I4[1][1] * I4[1][2] / 100).toFixed(2), mA = I4[0][1], mB = I4[1][1];
    var x = (avg4 - mB) / (mA - mB) * 100;
    return {
      q: cap(nm4) + ' is a mix of ' + isoName(I4[0][0], mA) + ' ($' + mA.toFixed(3) + '\\ \\text{u}$) and ' + isoName(I4[1][0], mB) + ' ($' + mB.toFixed(3) + '\\ \\text{u}$). Its average atomic mass is $' + avg4.toFixed(2) + '\\ \\text{u}$. What percent of ' + nm4 + ' atoms are ' + isoName(I4[0][0], mA) + '?',
      a: { t: 'num', v: x.toFixed(1), pct: true, tol: 0.3 },
      steps: ['Let $x$ be the fraction that is ' + isoName(I4[0][0], mA) + '; the rest, $1 - x$, is ' + isoName(I4[1][0], mB) + '.', '$' + mA.toFixed(3) + 'x + ' + mB.toFixed(3) + '(1 - x) = ' + avg4.toFixed(2) + '$', '$' + mB.toFixed(3) + ' - ' + tn(mB - mA, 4) + 'x = ' + avg4.toFixed(2) + '$, so $x = \\dfrac{' + mB.toFixed(3) + ' - ' + avg4.toFixed(2) + '}{' + tn(mB - mA, 4) + '} \\approx ' + tn(x / 100, 3) + '$', 'About <b>' + x.toFixed(1) + '%</b> of the atoms are ' + isoName(I4[0][0], mA) + '.'],
      hint: 'Call one fraction x and the other 1 − x.'
    };
  }));

  // ======================= 03-electrons.js
  // ---------------------------------------------------------------- unit: Electrons in Atoms
  function shellsT(arr) { return arr.join(', '); }
  G('chem.electron-shells', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 5);
    var e = ELZ[R.int(L === 1 ? 3 : 3, 20)], sh = shells20(e.Z);
    if (kind === 0) {
      return {
        q: 'Write the electron arrangement of ' + lname(e) + ' (atomic number ' + e.Z + ') by shell, from the inside out, like 2, 8, 1.',
        a: { t: 'tuple', v: sh.map(String) },
        steps: ['A neutral atom has ' + e.Z + ' electrons. For the first 20 elements, shells fill in the order 2, 8, 8, then 2.', sh.map(function (k, i) { return 'Shell ' + (i + 1) + ': ' + k; }).join('; ') + '.', 'Check: $' + sh.join(' + ') + ' = ' + e.Z + '$. The arrangement is <b>' + shellsT(sh) + '</b>.'],
        hint: 'Fill the first shell with 2, the next with up to 8, then up to 8 again.'
      };
    }
    if (kind === 1) {
      var withPic = R.coin();
      return {
        q: withPic ? 'The diagram shows a neutral atom. How many electrons are in its outermost shell?' : 'How many electrons are in the outermost shell of a neutral ' + lname(e) + ' atom (atomic number ' + e.Z + ')?',
        viz: withPic ? { name: 'ch-atom', opts: { p: e.Z, n: Math.round(e.Z * 1.1), e: e.Z, quiet: true, edit: false, motion: false } } : undefined,
        a: { t: 'num', v: String(sh[sh.length - 1]) },
        steps: [withPic ? 'Count the electrons on each ring: ' + shellsT(sh) + '.' : 'Arrange the ' + e.Z + ' electrons by shell: ' + shellsT(sh) + '.', 'The outermost shell holds <b>' + sh[sh.length - 1] + '</b>. These outer electrons decide how the atom bonds.'],
        hint: 'Shells fill 2, then 8, then 8, then 2.'
      };
    }
    if (kind === 2) {
      return {
        q: 'A neutral atom has the electron arrangement ' + shellsT(sh) + '. Which element is it? Type its symbol.',
        a: { t: 'formula', v: [e.s] },
        steps: ['Add the electrons: $' + sh.join(' + ') + ' = ' + e.Z + '$.', 'A neutral atom has as many electrons as protons, so the atomic number is ' + e.Z + ': <b>' + e.s + '</b> (' + lname(e) + ').'],
        hint: 'The total number of electrons equals the atomic number.'
      };
    }
    if (kind === 3) {
      var k = EL[R.pick(['K', 'Ca'])], right = shellsT(shells20(k.Z)), z = k.Z;
      return {
        q: 'Which is the correct electron arrangement for ' + lname(k) + ' (atomic number ' + z + ')?',
        a: MC(right, [z === 19 ? '2, 8, 9' : '2, 8, 10', z === 19 ? '2, 8, 8, 2' : '2, 8, 8, 1', z === 19 ? '2, 7, 8, 2' : '2, 8, 9, 1']),
        steps: ['After 2 and 8, the third shell takes 8 electrons, and then the fourth shell starts. (The third shell can hold more later, from scandium on, but the fourth shell starts first.)', 'For ' + z + ' electrons: 2 + 8 + 8 = 18, leaving ' + (z - 18) + ' for the fourth shell: <b>' + right + '</b>.'],
        hint: 'After 2, 8, 8 a new shell begins.'
      };
    }
    if (kind === 4) {
      var IONS20 = [['Na', 1], ['Mg', 2], ['Al', 3], ['K', 1], ['Ca', 2], ['F', -1], ['Cl', -1], ['O', -2], ['S', -2], ['N', -3], ['Li', 1]], io = R.pick(IONS20), ei = EL[io[0]], ne = ei.Z - io[1], shi = shells20(ne);
      return {
        q: 'Write the electron arrangement of the ion $' + ft(ionF(ei.s, io[1])) + '$ by shell (the atomic number of ' + lname(ei) + ' is ' + ei.Z + ').',
        a: { t: 'tuple', v: shi.map(String) },
        steps: ['The ion has $' + ei.Z + (io[1] > 0 ? ' - ' + io[1] : ' + ' + (-io[1])) + ' = ' + ne + '$ electrons.', 'Arrange them: <b>' + shellsT(shi) + '</b>, the same as the noble gas ' + lname(ELZ[ne]) + '.'],
        hint: 'Find the number of electrons in the ion first.'
      };
    }
    var tfs = [
      ['Electrons travel around the nucleus on fixed circular tracks, like planets around the sun.', false, 'The shell picture shows energy levels, not paths. An electron in a level has a certain energy, but its position is spread out in a cloud.'],
      ['Electrons in the outer shell are, on average, farther from the nucleus than electrons in inner shells.', true, 'Higher shells have more energy and are spread farther from the nucleus.'],
      ['An atom with 11 electrons has the arrangement 2, 9.', false, 'The second shell holds at most 8, so sodium is 2, 8, 1.'],
      ['The number of occupied shells in a neutral atom matches its period (row) in the periodic table.', true, 'Each new period starts a new shell.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Shells are energy levels.' };
  }));

  var HLEV = { 1: -13.6, 2: -3.40, 3: -1.51, 4: -0.85, 5: -0.54, 6: -0.38 };
  G('chem.emission-spectra', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) {
      var lev = [], E = -R.int(10, 14);
      var nlev = 4; for (var i = 0; i < nlev; i++) { lev.push(E); E = fx(E + R.pick([1.5, 2, 2.5, 3, 3.5, 4]) * (i === 0 ? 1.5 : 1) / (i + 1)); }
      lev = lev.map(function (x) { return +x.toFixed(1); });
      var hi = R.int(1, 3), lo = R.int(0, hi - 1), dE = fx(lev[hi] - lev[lo]);
      return {
        q: 'In a model atom, the electron’s energy levels are ' + lev.map(function (x, j) { return 'level ' + (j + 1) + ': $' + x.toFixed(1) + '\\ \\text{eV}$'; }).join(', ') + '. An electron drops from level ' + (hi + 1) + ' to level ' + (lo + 1) + '. What is the energy of the photon it gives off?',
        a: A(dE, 3, 0.01), unit: 'eV',
        steps: ['The photon carries away exactly the energy the electron loses.', '$E_{photon} = E_{' + (hi + 1) + '} - E_{' + (lo + 1) + '} = (' + lev[hi].toFixed(1) + ') - (' + lev[lo].toFixed(1) + ') = ' + tv(dE) + '\\ \\text{eV}$', 'Because the levels have fixed energies, this drop always gives a photon of exactly ' + tv(dE) + ' eV: one sharp line in the spectrum.'],
        hint: 'Subtract the lower level’s energy from the higher level’s.'
      };
    }
    if (kind === 1 || kind === 3) {
      var trans = R.sample([[3, 2], [4, 2], [5, 2], [6, 2], [4, 3], [5, 3], [2, 1], [3, 1]], 3);
      if (kind === 1) trans = R.sample([[3, 2], [4, 2], [5, 2], [6, 2]], 3);
      var dEs = trans.map(function (t) { return fx(HLEV[t[0]] - HLEV[t[1]]); });
      var askLong = R.coin(), idx = 0;
      dEs.forEach(function (d, j) { if (askLong ? d < dEs[idx] : d > dEs[idx]) idx = j; });
      var lab = function (t) { return 'from $n = ' + t[0] + '$ to $n = ' + t[1] + '$'; };
      return {
        q: 'Hydrogen’s energy levels are $E_1 = -13.6$, $E_2 = -3.40$, $E_3 = -1.51$, $E_4 = -0.85$, $E_5 = -0.54$ and $E_6 = -0.38\\ \\text{eV}$. Which electron drop gives light with the ' + (askLong ? 'longest' : 'shortest') + ' wavelength?',
        a: MCK(trans.map(function (t) { return 'The drop ' + lab(t); }), idx),
        steps: trans.map(function (t, j) { return 'Drop ' + lab(t) + ': $\\Delta E = ' + tv(dEs[j]) + '\\ \\text{eV}$'; }).concat([(askLong ? 'The longest wavelength comes with the <b>smallest</b> energy drop' : 'The shortest wavelength comes with the <b>largest</b> energy drop') + ': higher-energy photons have shorter wavelengths.', 'Answer: the drop ' + lab(trans[idx]) + '.']),
        hint: 'Find each energy drop. Bigger drop, shorter wavelength.'
      };
    }
    if (kind === 2) {
      var n = R.int(3, 6), lines = n * (n - 1) / 2;
      return {
        q: 'An electron is lifted to level ' + n + ' of an atom (level 1 is the lowest). As it falls back to level 1, it may stop at any lower levels on the way, giving off one photon per drop. How many different photon energies (spectral lines) are possible?',
        a: { t: 'num', v: String(lines), form: 'int' },
        steps: ['Each line comes from one drop between two levels. Count the pairs of levels from 1 to ' + n + '.', Array.from({ length: n - 1 }, function (_, j) { var top = n - j; return 'from level ' + top + ': ' + (top - 1) + ' ' + plural(top - 1, 'drop'); }).join('; ') + '.', '$' + Array.from({ length: n - 1 }, function (_, j) { return n - 1 - j; }).join(' + ') + ' = ' + lines + '$ lines.'],
        hint: 'List the drops from each level to every lower level.'
      };
    }
    var bank = [
      ['Why does each element give off its own pattern of colors when its atoms are excited?', 'Each element has its own set of energy levels, so its electrons can only give off certain photon energies', ['Each element burns at a different temperature', 'The electrons of each element are a different color', 'Atoms can give off light of any energy, at random']],
      ['Which photon carries more energy?', 'A violet photon', ['A red photon', 'They carry the same energy', 'It depends on how bright the light is']],
      ['What happens when an electron absorbs a photon of exactly the right energy?', 'It jumps up to a higher energy level', ['It drops to a lower level', 'It leaves the atom', 'Nothing: electrons only give off light']],
      ['A neon sign glows red-orange. What is happening in the neon atoms?', 'Electrons fall from higher energy levels to lower ones, giving off photons of certain energies', ['The neon is burning', 'The neon atoms are reflecting red light', 'Electrons are being created inside the atoms']],
      ['How can astronomers tell that the Sun contains helium?', 'Its light shows the spectral lines that only helium produces', ['The Sun is yellow', 'Helium makes the Sun lighter', 'They collected helium from sunlight in balloons']]
    ];
    var b = R.pick(bank);
    return { q: b[0], a: MC(b[1], b[2]), steps: ['Electrons in atoms can only have certain energies. A jump between two levels absorbs or gives off one photon whose energy equals the gap, and a bigger gap means a shorter wavelength (toward violet).', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Think about fixed energy levels and the size of the gaps.' };
  }));

  var SUBL = { s: [1, 2], p: [3, 6], d: [5, 10], f: [7, 14] };
  G('chem.orbitals-sublevels', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 4 : 5);
    var letters = ['s', 'p', 'd', 'f'];
    if (kind === 0 || kind === 1) {
      var lt = R.pick(L === 1 ? ['s', 'p', 'd'] : letters), n = Math.max(letters.indexOf(lt) + 1, R.int(2, 5)), want = kind === 0 ? 'orbitals' : 'electrons';
      var v = kind === 0 ? SUBL[lt][0] : SUBL[lt][1];
      return {
        q: kind === 0 ? 'How many orbitals are in the ' + n + lt + ' sublevel?' : 'What is the greatest number of electrons the ' + n + lt + ' sublevel can hold?',
        a: { t: 'num', v: String(v) },
        steps: ['Every ' + lt + ' sublevel has the same number of orbitals, whatever its level: s has 1, p has 3, d has 5 and f has 7.', kind === 0 ? 'So the ' + n + lt + ' sublevel has <b>' + v + '</b> ' + plural(v, 'orbital') + '.' : 'Each orbital holds at most 2 electrons, so the ' + n + lt + ' sublevel holds $' + SUBL[lt][0] + ' \\times 2 = ' + v + '$ electrons.'],
        hint: 's, p, d, f have 1, 3, 5, 7 orbitals; each orbital holds 2 electrons.'
      };
    }
    if (kind === 2) {
      var n2 = R.int(2, 4), which = R.int(0, 2);
      var val = which === 0 ? n2 : which === 1 ? n2 * n2 : 2 * n2 * n2, names = letters.slice(0, n2).map(function (x) { return n2 + x; });
      var ask = ['How many sublevels are in energy level $n = ' + n2 + '$?', 'How many orbitals are in energy level $n = ' + n2 + '$ altogether?', 'What is the greatest number of electrons that energy level $n = ' + n2 + '$ can hold?'][which];
      var orbs = letters.slice(0, n2).map(function (x) { return SUBL[x][0]; });
      return {
        q: ask,
        a: { t: 'num', v: String(val) },
        steps: ['Level $n$ has $n$ sublevels, so level ' + n2 + ' has ' + names.join(', ') + '.', which >= 1 ? 'Orbitals: $' + orbs.join(' + ') + ' = ' + (n2 * n2) + '$ (that is $n^2$).' : 'That is <b>' + n2 + '</b> sublevels.', which === 2 ? 'Two electrons per orbital: $2 \\times ' + (n2 * n2) + ' = ' + val + '$ electrons (that is $2n^2$).' : 'Answer: <b>' + val + '</b>.'],
        hint: 'Level n has n sublevels, starting with s.'
      };
    }
    if (kind === 3) {
      var bad = R.pick(['1p', '2d', '3f', '1d']), good = R.sample(['2p', '3d', '4f', '1s', '3p', '4d'], 3);
      return {
        q: 'Which of these sublevels does not exist?',
        a: MC(bad, good),
        steps: ['Level $n$ has only $n$ sublevels: level 1 has only s; level 2 has s and p; level 3 has s, p and d; level 4 adds f.', 'So ' + bad + ' cannot exist: level ' + bad[0] + ' has no ' + bad[1] + ' sublevel. Answer: <b>' + bad + '</b>.'],
        hint: 'How many sublevels does level n have?'
      };
    }
    if (kind === 4) {
      var lt2 = R.pick(['p', 'd']), nn = lt2 === 'p' ? R.int(2, 5) : R.int(3, 5), ne = R.int(1, SUBL[lt2][1] - 1);
      return {
        q: 'The ' + nn + lt2 + ' sublevel of an atom holds ' + ne + ' ' + plural(ne, 'electron') + '. How many more electrons could it hold?',
        a: { t: 'num', v: String(SUBL[lt2][1] - ne) },
        steps: ['A ' + lt2 + ' sublevel has ' + SUBL[lt2][0] + ' orbitals, each with room for 2 electrons: ' + SUBL[lt2][1] + ' in all.', '$' + SUBL[lt2][1] + ' - ' + ne + ' = ' + (SUBL[lt2][1] - ne) + '$'],
        hint: 'Find the full capacity first.'
      };
    }
    var tfs = [
      ['An orbital is the path an electron travels around the nucleus.', false, 'An orbital is a region of space where the electron is likely to be found: a cloud of probability, not a track.'],
      ['Every energy level holds exactly 8 electrons.', false, 'Level n holds up to 2n²: 2 in level 1, 8 in level 2, 18 in level 3 and 32 in level 4.'],
      ['Two electrons in the same orbital must have opposite spins.', true, 'That is the Pauli exclusion principle, the reason an orbital holds at most two electrons.'],
      ['A 3d orbital and a 4d orbital can each hold 2 electrons.', true, 'Every orbital, of any kind, holds at most 2 electrons.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Orbitals are regions, and each holds two electrons.' };
  }));

  function cfgOk(Z) { return Z !== 24 && Z !== 29; }
  function cfgStrT(list) { return cfgTex(list); }
  G('chem.electron-configuration', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 2) : R.int(0, 4), Z;
    do { Z = L === 1 ? R.int(3, 18) : L === 2 ? R.int(3, 36) : R.int(11, 38); } while (!cfgOk(Z));
    var e = ELZ[Z], c = cfg(Z), last = c[c.length - 1];
    if (kind === 0) {
      var withE = c.filter(function (x) { return x[1] > 0; }), pick = R.pick(withE.slice(Math.max(0, withE.length - 3)));
      return {
        q: 'How many electrons are in the ' + pick[0] + ' sublevel of a ' + lname(e) + ' atom (atomic number ' + Z + ')?',
        a: { t: 'num', v: String(pick[1]) },
        steps: ['Fill the sublevels in order: 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, 5s, … until all ' + Z + ' electrons are placed.', '$' + cfgTex(c) + '$', 'The ' + pick[0] + ' sublevel holds <b>' + pick[1] + '</b>.'],
        hint: 'Write the whole configuration; the superscripts must add up to ' + Z + '.'
      };
    }
    if (kind === 1) {
      return {
        q: 'In which sublevel does the last electron go, filling in order, for ' + lname(e) + ' (atomic number ' + Z + ')? Write it like 3p.',
        a: { t: 'text', v: [last[0]] },
        steps: ['Fill in order of energy: 1s 2s 2p 3s 3p 4s 3d 4p 5s.', '$' + cfgTex(c) + '$', 'The last sublevel to receive electrons is <b>' + last[0] + '</b>. On the periodic table, ' + lname(e) + ' sits in the ' + last[0][1] + ' block.'],
        hint: 'Find the element’s block and row on the periodic table.'
      };
    }
    if (kind === 2) {
      var short = L >= 2 && Z > 10 && R.coin();
      return {
        q: 'Which element has the electron configuration $' + (short ? cfgShort(Z) : cfgTex(c)) + '$? Type its symbol.',
        a: { t: 'formula', v: [e.s] },
        steps: [short ? 'The noble gas in brackets stands for its own electrons; add the rest.' : 'Add the superscripts.', 'Total electrons: ' + Z + '. A neutral atom has as many electrons as protons, so this is element ' + Z + ': <b>' + e.s + '</b> (' + lname(e) + ').'],
        hint: 'Count the electrons.'
      };
    }
    // kind 3, 4: choose the right configuration
    var right = cfgTex(c), wrongs = [];
    var idx3d = -1; c.forEach(function (x, i) { if (x[0] === '3d') idx3d = i; });
    if (Z >= 19 && Z <= 30) { // 3d filled before 4s
      var w = c.filter(function (x) { return x[0] !== '4s' && x[0] !== '3d'; }); var n3d = Z - 18; w.push(['3d', Math.min(10, n3d)]); if (n3d > 10) w.push(['4s', n3d - 10]); wrongs.push(cfgTex(w));
    }
    var minus = c.map(function (x) { return x.slice(); }); minus[minus.length - 1][1] -= 1; if (minus[minus.length - 1][1] === 0) minus.pop(); wrongs.push(cfgTex(minus));
    var plus = c.map(function (x) { return x.slice(); }); if (plus[plus.length - 1][1] < CAP[plus[plus.length - 1][0][1]]) { plus[plus.length - 1][1] += 1; wrongs.push(cfgTex(plus)); }
    var i2p = -1, i3s = -1; c.forEach(function (x, i) { if (x[0] === '2p') i2p = i; if (x[0] === '3s') i3s = i; });
    if (i2p >= 0 && i3s >= 0) { var w2 = c.map(function (x) { return x.slice(); }); w2[i2p][1] += w2[i3s][1]; w2.splice(i3s, 1); wrongs.push(cfgTex(w2)); }
    if (Z <= 4) { var w4 = c.map(function (x) { return x.slice(); }); w4[0][1] += w4[1][1]; w4.splice(1, 1); wrongs.push(cfgTex(w4)); }
    if (Z <= 10 && Z >= 5) { var w3 = c.map(function (x) { return x.slice(); }); var s2 = w3[1][1]; w3.splice(1, 1); w3[1][1] += s2; wrongs.push(cfgTex(w3)); }
    return {
      q: 'Which is the electron configuration of ' + lname(e) + ' (atomic number ' + Z + ')?',
      a: MC('$' + right + '$', wrongs.map(function (w) { return '$' + w + '$'; })),
      steps: ['Fill in order of energy, reading the periodic table row by row: 1s 2s 2p 3s 3p 4s 3d 4p 5s.', 's holds 2, p holds 6, d holds 10. The superscripts must add up to ' + Z + '.', 'Answer: $' + right + '$'],
      hint: 'Check the total, the capacities and that 4s comes before 3d.'
    };
  }));

  // ======================= 04-periodic.js
  // ---------------------------------------------------------------- unit: The Periodic Table
  var FAMILY = { 1: 'alkali metals', 2: 'alkaline earth metals', 17: 'halogens', 18: 'noble gases' };
  var METALLOIDS = ['B', 'Si', 'Ge', 'As', 'Sb', 'Te'];
  function kindOf(e) { if (METALLOIDS.indexOf(e.s) >= 0) return 'metalloid'; if (e.Z === 1) return 'nonmetal'; if ((e.group >= 13 && e.group <= 18) && !(e.s === 'Al' || e.s === 'Ga' || e.s === 'In' || e.s === 'Sn' || e.s === 'Pb' || e.s === 'Tl' || e.s === 'Bi')) return 'nonmetal'; return 'metal'; }
  G('chem.periodic-table-organization', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 4 : 5);
    var pool = []; for (var z = 1; z <= 56; z++) pool.push(ELZ[z]);
    if (kind === 0) {
      var e = R.pick(pool.filter(function (x) { return x.Z > 2; }));
      return {
        q: 'Use the periodic table to find the group number (1–18) and the period of ' + lname(e) + ' (' + e.s + ').',
        viz: { name: 'ch-periodic', opts: { mode: 'category', quiet: true } },
        a: { t: 'multi', parts: [{ label: 'group', a: { t: 'num', v: String(e.group) } }, { label: 'period', a: { t: 'num', v: String(e.period) } }] },
        steps: ['Groups are the columns, numbered 1 to 18 from left to right. Periods are the rows, numbered from the top.', e.s + ' is in column ' + e.group + ' and row ' + e.period + ': group <b>' + e.group + '</b>, period <b>' + e.period + '</b>.'],
        hint: 'Columns are groups; rows are periods.'
      };
    }
    if (kind === 1) {
      var g = R.pick([1, 2, 17, 18]), fam = pool.filter(function (x) { return x.group === g && x.Z > 2; }), e1 = R.pick(fam);
      var choices = ['Alkali metals', 'Alkaline earth metals', 'Halogens', 'Noble gases', 'Transition metals'];
      return {
        q: cap(lname(e1)) + ' (' + e1.s + ') is in group ' + g + '. Which family does it belong to?',
        a: MCK(choices, [1, 2, 17, 18].indexOf(g)),
        steps: ['Group 1 (below hydrogen): alkali metals. Group 2: alkaline earth metals. Groups 3–12: transition metals. Group 17: halogens. Group 18: noble gases.', 'So ' + lname(e1) + ' is one of the <b>' + FAMILY[g] + '</b>.'],
        hint: 'Families are named by their column.'
      };
    }
    if (kind === 2) {
      var g2 = R.pick([1, 2, 16, 17, 18]), same = R.sample(pool.filter(function (x) { return x.group === g2 && x.Z > 2; }), 2);
      var good = cap(lname(same[0])) + ' and ' + lname(same[1]);
      var wrongs = [];
      while (wrongs.length < 3) {
        var a = R.pick(pool.filter(function (x) { return x.Z > 2; })), b = R.pick(pool.filter(function (x) { return x.Z > 2 && x.group !== a.group; }));
        if (a.period === b.period || R.coin()) wrongs.push(cap(lname(a)) + ' and ' + lname(b));
      }
      return {
        q: 'Which pair of elements would you expect to have the most similar chemical properties?',
        a: MC(good, wrongs),
        steps: ['Elements in the same group (column) have the same number of outer electrons, so they react in similar ways. Elements side by side in a period do not.', cap(lname(same[0])) + ' and ' + lname(same[1]) + ' are both in group ' + g2 + '. Answer: <b>' + good + '</b>.'],
        hint: 'Look for two elements in the same column.'
      };
    }
    if (kind === 3) {
      var cands = pool.filter(function (x) { return x.Z > 2 && x.Z !== 1; }), e3 = R.pick(cands), k = kindOf(e3);
      if (R.chance(0.35)) { e3 = EL[R.pick(METALLOIDS)]; k = 'metalloid'; }
      return {
        q: 'Is ' + lname(e3) + ' (' + e3.s + ') a metal, a nonmetal or a metalloid?',
        viz: { name: 'ch-periodic', opts: { mode: 'category', quiet: true, highlight: [e3.s] } },
        a: MCK(['Metal', 'Nonmetal', 'Metalloid'], ['metal', 'nonmetal', 'metalloid'].indexOf(k)),
        steps: ['Metals fill the left side and the middle of the table. Nonmetals are at the upper right (plus hydrogen). The metalloids (B, Si, Ge, As, Sb, Te) sit along the staircase between them.', cap(lname(e3)) + ' is a <b>' + k + '</b>.'],
        hint: 'Find the staircase line on the right side of the table.'
      };
    }
    if (kind === 4) {
      var pair = R.pick([['Ar', 'K'], ['Te', 'I'], ['Co', 'Ni']]), A = EL[pair[0]], B = EL[pair[1]], mA = { Ar: 39.95, K: 39.10, Te: 127.60, I: 126.90, Co: 58.93, Ni: 58.69 };
      return {
        q: cap(lname(A)) + ' (atomic mass ' + mA[A.s].toFixed(2) + ') comes before ' + lname(B) + ' (atomic mass ' + mA[B.s].toFixed(2) + ') in the periodic table, even though it is heavier. Why?',
        a: MC('The table is ordered by atomic number, and ' + lname(A) + ' has fewer protons', ['The table is ordered by atomic mass, and this is a mistake', 'Elements are ordered alphabetically within each period', cap(lname(A)) + ' has more electrons than ' + lname(B)]),
        steps: ['Since Moseley’s work in 1913, the table has been ordered by atomic number (the number of protons), not by mass.', cap(lname(A)) + ' has ' + A.Z + ' protons and ' + lname(B) + ' has ' + B.Z + '. ' + cap(lname(A)) + ' is heavier only because its common isotopes have more neutrons.', 'Ordering by number of protons also puts each element in the column with others like it.'],
        hint: 'What number increases by exactly one from each element to the next?'
      };
    }
    var tfs = [
      ['The modern periodic table is arranged in order of increasing atomic mass.', false, 'It is arranged by atomic number. A few pairs, such as argon and potassium, are out of mass order.'],
      ['The rows of the periodic table are called groups.', false, 'Rows are periods; columns are groups (or families).'],
      ['Each new period begins as electrons start filling a new outer shell.', true, 'Period 3 starts with sodium, the first element with an electron in the third shell.'],
      ['Elements in the same group have the same number of outer (valence) electrons.', true, 'That is why they behave alike.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Rows are periods, columns are groups, order is by atomic number.' };
  }));

  var MAIN = []; for (var zz = 1; zz <= 56; zz++) if (isMain(ELZ[zz])) MAIN.push(ELZ[zz]);
  G('chem.valence-electrons', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    var pool = MAIN.filter(function (x) { return x.Z > 2 && x.group !== 18 || x.Z === 10 || x.Z === 18; });
    var e = R.pick(pool), v = valE(e);
    if (kind === 0) {
      var giveG = L === 1;
      return {
        q: 'How many valence electrons does a neutral ' + lname(e) + ' atom (' + e.s + ')' + (giveG ? ', in group ' + e.group + ',' : '') + ' have?',
        viz: giveG ? undefined : { name: 'ch-periodic', opts: { mode: 'category', quiet: true, highlight: [e.s] } },
        a: { t: 'num', v: String(v) },
        steps: [(giveG ? '' : cap(lname(e)) + ' is in group ' + e.group + '. ') + (e.group <= 2 ? 'In groups 1 and 2, the number of valence electrons equals the group number.' : 'In groups 13–18, subtract 10 from the group number (the 10 accounts for the d-block columns).'), cap(lname(e)) + ' has <b>' + v + '</b> valence electrons.'],
        hint: e.group <= 2 ? 'Groups 1 and 2: the group number.' : 'Groups 13–18: group number minus 10.'
      };
    }
    if (kind === 1) {
      var d = R.pick(pool.filter(function (x) { return x.Z <= 20; })), dv = valE(d);
      return {
        q: 'How many dots surround the symbol in the Lewis dot symbol of ' + lname(d) + ' (atomic number ' + d.Z + ')?',
        a: { t: 'num', v: String(dv) },
        steps: ['A dot symbol shows only the valence (outer-shell) electrons, one dot each.', 'Shells for ' + d.Z + ' electrons: ' + shells20(d.Z).join(', ') + '. The outer shell has ' + dv + '.', 'So there are <b>' + dv + '</b> dots.'],
        hint: 'Count only the outer-shell electrons.'
      };
    }
    if (kind === 2) {
      var vv = R.int(1, 7), right = R.pick(pool.filter(function (x) { return valE(x) === vv && x.group !== 18; }));
      var wrongs = R.sample(pool.filter(function (x) { return valE(x) !== vv && x.group !== 18; }), 3).map(function (x) { return cap(lname(x)); });
      return {
        q: 'Which element has ' + vv + ' valence ' + plural(vv, 'electron') + '?',
        a: MC(cap(lname(right)), wrongs),
        steps: ['A main-group element with ' + vv + ' valence ' + plural(vv, 'electron') + ' is in group ' + (vv <= 2 ? vv : vv + 10) + '.', cap(lname(right)) + ' is in group ' + right.group + ': <b>' + lname(right) + '</b>.'],
        hint: 'Turn the number of valence electrons into a group number.'
      };
    }
    if (kind === 3) {
      var s = EL[R.pick(['S', 'Cl', 'P', 'Br', 'Se', 'Ar', 'Si'])];
      return {
        q: 'A student says ' + lname(s) + ', in group ' + s.group + ', has ' + s.group + ' valence electrons. How many does it really have?',
        a: { t: 'num', v: String(valE(s)) },
        steps: ['For groups 13–18, subtract 10 from the group number: the 10 columns of the d block do not add outer electrons for these atoms.', '$' + s.group + ' - 10 = ' + valE(s) + '$. ' + cap(lname(s)) + '’s outer shell holds <b>' + valE(s) + '</b>. A neutral atom has at most 8 valence electrons.'],
        hint: 'No main-group atom has more than 8 valence electrons.'
      };
    }
    var tfs = [
      ['You can find the number of valence electrons of iron from its group number, 8.', false, 'The group-number rule works only for main-group elements (groups 1, 2 and 13–18). Transition metals like iron do not follow it.'],
      ['All the elements in group 17 have 7 valence electrons.', true, 'Group 17: 17 − 10 = 7.'],
      ['Sulfur, in group 16, has 16 valence electrons.', false, 'Sulfur has 6: 16 − 10 = 6, and its shells are 2, 8, 6.'],
      ['Helium has 2 valence electrons, even though it sits in group 18.', true, 'Helium has only 2 electrons in all, both in its outer (first) shell, which is then full.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'The group rule works for main-group elements only.' };
  }));

  /* trend data (main-group elements, Z <= 56) to check that each generated comparison agrees with real data:
     covalent radii in pm (Cordero et al. 2008), first ionization energies in kJ/mol (NIST ASD), Pauling electronegativities (Allred 1961) */
  var RAD = { H: 31, Li: 128, Be: 96, B: 84, C: 76, N: 71, O: 66, F: 57, Na: 166, Mg: 141, Al: 121, Si: 111, P: 107, S: 105, Cl: 102, K: 203, Ca: 176, Ga: 122, Ge: 120, As: 119, Se: 120, Br: 120, Rb: 220, Sr: 195, In: 142, Sn: 139, Sb: 139, Te: 138, I: 139, Cs: 244, Ba: 215 };
  var IE1 = { H: 1312, He: 2372, Li: 520, Be: 899, B: 801, C: 1086, N: 1402, O: 1314, F: 1681, Ne: 2081, Na: 496, Mg: 738, Al: 578, Si: 787, P: 1012, S: 1000, Cl: 1251, Ar: 1521, K: 419, Ca: 590, Ga: 579, Ge: 762, As: 947, Se: 941, Br: 1140, Kr: 1351, Rb: 403, Sr: 549, In: 558, Sn: 709, Sb: 834, Te: 869, I: 1008, Xe: 1170, Cs: 376, Ba: 503 };
  var ENV = { H: 2.20, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, Ca: 1.00, Ga: 1.81, Ge: 2.01, As: 2.18, Se: 2.55, Br: 2.96, Rb: 0.82, Sr: 0.95, In: 1.78, Sn: 1.96, Sb: 2.05, Te: 2.10, I: 2.66, Cs: 0.79, Ba: 0.89 };
  /* trendSign(a, b, dir): +1 if the trend says a > b, -1 if a < b, 0 if the trends conflict or don't apply.
     dir = 'size' (bigger down and to the left) or 'pull' (IE and EN: bigger up and to the right) */
  function trendSign(a, b, dir) {
    var dp = a.period - b.period, dg = a.group - b.group, s1 = dp === 0 ? 0 : (dp > 0 ? 1 : -1), s2 = dg === 0 ? 0 : (dg < 0 ? 1 : -1);
    if (s1 && s2 && s1 !== s2) return 0;
    var s = s1 || s2; return dir === 'size' ? s : -s;
  }
  function trendPair(R, tab, dir, minGap, filt) {
    var keys = Object.keys(tab).filter(function (s) { return EL[s].Z > 1 && (!filt || filt(EL[s])); });
    for (var i = 0; i < 400; i++) {
      var ab = R.sample(keys, 2), a = EL[ab[0]], b = EL[ab[1]], ts = trendSign(a, b, dir);
      if (!ts) continue;
      if (a.period !== b.period && a.group !== b.group && R.chance(0.6)) continue; // mostly same row or column
      if ((tab[a.s] - tab[b.s]) * ts <= 0 || abs(tab[a.s] - tab[b.s]) < minGap) continue;
      return [a, b, ts];
    }
    return [EL.Na, EL.Cl, dir === 'size' ? 1 : -1];
  }
  function trendWhy(a, b, dir) {
    var bigFirst = dir === 'size';
    if (a.period === b.period) return 'They are in the same period (row ' + a.period + '), so their outer electrons are in the same shell. ' + cap(lname(a.group > b.group ? a : b)) + ' has more protons (' + Math.max(a.Z, b.Z) + ' against ' + Math.min(a.Z, b.Z) + '), and its inner electrons shield about the same, so it pulls that shell in closer and holds it more tightly.';
    if (a.group === b.group) return 'They are in the same group, but ' + lname(a.period > b.period ? a : b) + ' is ' + abs(a.period - b.period) + ' ' + plural(abs(a.period - b.period), 'row') + ' lower: its outer electrons are in a higher shell, farther from the nucleus and shielded by more inner electrons, so they are held less tightly.';
    return cap(lname(a.period > b.period ? a : b)) + ' is both lower and farther left, so both trends point the same way: its outer electrons are in a higher shell and feel a weaker pull.';
  }
  G('chem.atomic-radius', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 0 : R.int(0, L === 2 ? 2 : 3);
    if (kind === 0) {
      var tp = trendPair(R, RAD, 'size', 5), a = tp[0], b = tp[1], big = tp[2] > 0 ? a : b, askSmall = R.coin();
      var ans = askSmall ? (big === a ? b : a) : big;
      return {
        q: 'Which atom is ' + (askSmall ? 'smaller' : 'larger') + ': ' + lname(a) + ' (' + a.s + ') or ' + lname(b) + ' (' + b.s + ')?',
        viz: L === 1 ? { name: 'ch-periodic', opts: { mode: 'category', quiet: true, highlight: [a.s, b.s] } } : undefined,
        a: MCK([cap(lname(a)), cap(lname(b)), 'They are the same size'], ans === a ? 0 : 1),
        steps: [cap(lname(a)) + ' is in period ' + a.period + ', group ' + a.group + '; ' + lname(b) + ' is in period ' + b.period + ', group ' + b.group + '.', trendWhy(a, b, 'size'), 'So ' + lname(big) + ' is larger, and the answer is <b>' + lname(ans) + '</b>. (Measured covalent radii: ' + a.s + ' ' + RAD[a.s] + ' pm, ' + b.s + ' ' + RAD[b.s] + ' pm.)'],
        hint: 'Radius grows down a group and shrinks across a period.'
      };
    }
    if (kind === 1) {
      var per = R.pick([2, 3]), row = Object.keys(RAD).map(function (s) { return EL[s]; }).filter(function (e) { return e.period === per; });
      var three = R.sample(row, 3).sort(function (x, y) { return RAD[x.s] - RAD[y.s]; });
      var right = three.map(function (e) { return e.s; }).join(' < ');
      var wrong1 = three.slice().reverse().map(function (e) { return e.s; }).join(' < ');
      var wrong2 = [three[1], three[0], three[2]].map(function (e) { return e.s; }).join(' < '), wrong3 = [three[0], three[2], three[1]].map(function (e) { return e.s; }).join(' < ');
      return {
        q: 'Rank these period ' + per + ' atoms from smallest to largest radius: ' + R.shuffle(three).map(function (e) { return lname(e) + ' (' + e.s + ')'; }).join(', ') + '.',
        a: MC(right, [wrong1, wrong2, wrong3]),
        steps: ['All three have their outer electrons in shell ' + per + '. Across the period, each step adds a proton, and the extra electron goes into the same shell, where it shields the others very little.', 'So the atom farthest right (most protons) pulls hardest and is smallest; the one farthest left is largest.', 'Smallest to largest: <b>' + right + '</b>.'],
        hint: 'In one period, more protons means a smaller atom.'
      };
    }
    if (kind === 2) {
      var pr = R.pick([['Na', 'Cl'], ['Li', 'F'], ['Mg', 'S'], ['K', 'Br'], ['Be', 'O']]), A = EL[pr[0]], B = EL[pr[1]];
      return {
        q: 'Why is a ' + lname(B) + ' atom smaller than a ' + lname(A) + ' atom, even though ' + lname(B) + ' has more electrons?',
        a: MC('Its nucleus has more protons, which pull its outer electrons, in the same shell, closer', ['Its extra electrons squeeze the atom smaller', cap(lname(B)) + ' wants to gain electrons to fill its shell', 'Its nucleus has more neutrons, which pull on the electrons']),
        steps: ['Both atoms have their outer electrons in shell ' + A.period + '.', cap(lname(B)) + ' has ' + B.Z + ' protons against ' + lname(A) + '’s ' + A.Z + '. The inner electrons shield the outer ones about equally in both, so the larger positive charge wins and draws the outer shell in.', 'Neutrons have no charge, and atoms do not "want" anything: the size comes from the pull between charges and the distance.'],
        hint: 'Compare the nuclear charges acting on the same shell.'
      };
    }
    var tfs = [
      ['Atoms get larger from left to right across a period because they have more electrons.', false, 'They get smaller: the added protons pull the same outer shell in more tightly.'],
      ['Atoms get larger going down a group because each row adds a shell.', true, 'Outer electrons in a higher shell are farther from the nucleus.'],
      ['Cesium is one of the largest atoms on the periodic table.', true, 'It is near the bottom left, where both trends point to large atoms.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'More shells: bigger. More protons on the same shell: smaller.' };
  }));

  G('chem.ionization-energy', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 0 : R.int(0, L === 2 ? 2 : 3);
    if (kind === 0) {
      var tp = trendPair(R, IE1, 'pull', 40), a = tp[0], b = tp[1], hiE = tp[2] > 0 ? a : b, askLow = R.coin(), ans = askLow ? (hiE === a ? b : a) : hiE;
      return {
        q: 'Which atom has the ' + (askLow ? 'lower' : 'higher') + ' first ionization energy: ' + lname(a) + ' (' + a.s + ') or ' + lname(b) + ' (' + b.s + ')?',
        a: MCK([cap(lname(a)), cap(lname(b)), 'They are equal'], ans === a ? 0 : 1),
        steps: ['Ionization energy is the energy needed to pull the outermost electron off a gaseous atom. An electron held more tightly takes more energy.', trendWhy(a, b, 'pull'), cap(lname(hiE)) + ' holds its outer electron more tightly, so its ionization energy is higher. Answer: <b>' + lname(ans) + '</b>. (Measured: ' + a.s + ' ' + IE1[a.s] + ' kJ/mol, ' + b.s + ' ' + IE1[b.s] + ' kJ/mol.)'],
        hint: 'Closer to more protons means harder to remove.'
      };
    }
    if (kind === 1) {
      var grp = R.pick([1, 2, 17, 18]), col = Object.keys(IE1).map(function (s) { return EL[s]; }).filter(function (e) { return e.group === grp && e.Z > 2; });
      var three = R.sample(col, 3).sort(function (x, y) { return IE1[y.s] - IE1[x.s]; }), right = three.map(function (e) { return e.s; }).join(' > ');
      return {
        q: 'Rank these group ' + grp + ' elements from highest to lowest first ionization energy: ' + R.shuffle(three).map(function (e) { return lname(e) + ' (' + e.s + ')'; }).join(', ') + '.',
        a: MC(right, [three.slice().reverse().map(function (e) { return e.s; }).join(' > '), [three[1], three[0], three[2]].map(function (e) { return e.s; }).join(' > '), [three[0], three[2], three[1]].map(function (e) { return e.s; }).join(' > ')]),
        steps: ['Down a group, the outer electron sits in a higher shell, farther from the nucleus and shielded by more inner electrons.', 'So the top element holds its electron most tightly: <b>' + right + '</b>.'],
        hint: 'Higher in the group: harder to ionize.'
      };
    }
    if (kind === 2) {
      var qs = [
        ['Why does fluorine have a much higher first ionization energy than lithium?', 'Fluorine has more protons pulling on outer electrons in the same shell', ['Fluorine wants to keep its electrons to complete its octet', 'Fluorine’s extra electrons hold each other in place', 'Lithium’s nucleus has more neutrons'],
          'Both have their outer electrons in shell 2, shielded by the same two 1s electrons. Fluorine’s 9 protons pull much harder on that shell than lithium’s 3.'],
        ['Why is it easier to remove the outer electron from potassium than from sodium?', 'Potassium’s outer electron is in a higher shell, farther from the nucleus and shielded by more inner electrons', ['Potassium has fewer protons than sodium', 'Potassium wants to lose its electron more than sodium does', 'Potassium’s outer electron has a positive charge'],
          'Potassium’s outer electron is in shell 4, behind 18 inner electrons; sodium’s is in shell 3, behind 10. Distance and shielding win over potassium’s extra protons.'],
        ['Why is the first ionization energy of magnesium higher than that of sodium?', 'Magnesium has one more proton pulling on outer electrons in the same shell', ['Magnesium has a full octet', 'Magnesium’s outer electrons are in a higher shell', 'Sodium’s outer electron is closer to its nucleus']
          , 'Both outer shells are shell 3, behind the same 10 inner electrons. Magnesium’s 12 protons hold that shell more tightly than sodium’s 11.']
      ];
      var qq = R.pick(qs);
      return { q: qq[0], a: MC(qq[1], qq[2]), steps: [qq[3], 'Answer: <b>' + qq[1] + '</b>.'], hint: 'Reason from the number of protons and the distance of the outer shell.' };
    }
    var tfs = [
      ['Sodium loses an electron easily because it "wants" a full outer shell.', false, 'Atoms do not want anything. Sodium’s outer electron is alone in the third shell, far from the nucleus and shielded by 10 inner electrons, so the attraction holding it is weak.'],
      ['First ionization energy generally increases from left to right across a period.', true, 'More protons pull on the same shell, so the outer electrons are held more tightly (with small dips at groups 13 and 16).'],
      ['Noble gases have the highest first ionization energies in their periods.', true, 'Each has the most protons pulling on its outer shell in that period.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Reason from charge and distance.' };
  }));

  G('chem.electronegativity', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 2 : 3);
    if (kind === 0) {
      var tp = trendPair(R, ENV, 'pull', 0.15), a = tp[0], b = tp[1], hi = tp[2] > 0 ? a : b;
      return {
        q: 'Which atom is more electronegative: ' + lname(a) + ' (' + a.s + ') or ' + lname(b) + ' (' + b.s + ')?',
        viz: L === 1 ? { name: 'ch-periodic', opts: { mode: 'category', quiet: true, highlight: [a.s, b.s] } } : undefined,
        a: MCK([cap(lname(a)), cap(lname(b)), 'They are equal'], hi === a ? 0 : 1),
        steps: ['Electronegativity measures how strongly an atom pulls on the electrons it shares in a bond. It rises toward the upper right of the table (leaving out the noble gases).', trendWhy(a, b, 'pull'), 'So <b>' + lname(hi) + '</b> is more electronegative. (Pauling values: ' + a.s + ' ' + ENV[a.s].toFixed(2) + ', ' + b.s + ' ' + ENV[b.s].toFixed(2) + '.)'],
        hint: 'Up and to the right: more electronegative.'
      };
    }
    if (kind === 1) {
      var four = []; var keys = Object.keys(ENV).filter(function (s) { return s !== 'H'; });
      for (var i = 0; i < 50; i++) { four = R.sample(keys, 4); var vals = four.map(function (s) { return ENV[s]; }).sort(function (x, y) { return y - x; }); if (vals[0] - vals[1] >= 0.3) break; }
      var top = four.slice().sort(function (x, y) { return ENV[y] - ENV[x]; })[0], askMost = true;
      return {
        q: 'Which of these elements is the most electronegative: ' + four.map(function (s) { return lname(EL[s]) + ' (' + s + ')'; }).join(', ') + '?',
        a: MCK(four.map(function (s) { return cap(lname(EL[s])); }), four.indexOf(top)),
        steps: ['Find each one on the table: ' + four.map(function (s) { return s + ' is in period ' + EL[s].period + ', group ' + EL[s].group; }).join('; ') + '.', 'The one closest to fluorine, the top right corner (noble gases aside), pulls hardest on shared electrons: <b>' + lname(EL[top]) + '</b> (' + ENV[top].toFixed(2) + ').'],
        hint: 'Which one is closest to fluorine?'
      };
    }
    if (kind === 2) {
      var bank = [
        ['Which element has the highest electronegativity of all?', 'Fluorine', ['Neon', 'Helium', 'Cesium']],
        ['Which statement about electronegativity is true?', 'It measures how strongly an atom attracts the electrons in a bond', ['It equals the number of valence electrons', 'It is highest for the noble gases', 'It increases down a group']],
        ['Why are most noble gases usually left out of electronegativity tables?', 'They rarely form bonds, so there are no shared electrons to measure a pull on', ['Their electronegativity is infinite', 'They have no electrons', 'They are metals']],
        ['Oxygen has 6 valence electrons and chlorine has 7. Which is more electronegative?', 'Oxygen (3.44 against 3.16)', ['Chlorine, because it has more valence electrons', 'They are equal', 'Chlorine, because it is heavier']]
      ];
      var b2 = R.pick(bank);
      return { q: b2[0], a: MC(b2[1], b2[2]), steps: ['Electronegativity is a measured pull on bonding electrons. It comes from a large nuclear charge acting at a short distance, so it peaks at fluorine and falls toward the lower left. It is not a count of electrons.', 'Answer: <b>' + b2[1] + '</b>.'], hint: 'Think of charge and distance, not the number of electrons.' };
    }
    var tfs = [
      ['Neon has a higher electronegativity than fluorine because it is farther right.', false, 'Neon almost never forms bonds, so it has no electronegativity on the usual (Pauling) scale. Fluorine has the highest value, 3.98.'],
      ['An atom with more valence electrons is always more electronegative.', false, 'Oxygen (6 valence electrons) is more electronegative than chlorine (7). Size and nuclear pull matter, not the count.'],
      ['Electronegativity decreases going down a group.', true, 'Lower atoms hold their outer electrons farther from the nucleus.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Electronegativity peaks at fluorine.' };
  }));

  var IONGRP = { 1: 1, 2: 2, 13: 3, 15: -3, 16: -2, 17: -1 };
  var IONEL = ['Li', 'Na', 'K', 'Rb', 'Cs', 'Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Al', 'N', 'P', 'O', 'S', 'Se', 'F', 'Cl', 'Br', 'I'];
  var NOBLEZ = [2, 10, 18, 36, 54];
  function nobleOf(n) { var m = null; NOBLEZ.forEach(function (z) { if (z === n) m = ELZ[z]; }); return m; }
  G('chem.ion-charges', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    var e = EL[R.pick(IONEL)], q = IONGRP[e.group], ne = e.Z - q, ng = nobleOf(ne);
    var why = q > 0 ? cap(lname(e)) + ' is in group ' + e.group + ' with ' + valE(e) + ' valence ' + plural(valE(e), 'electron') + '. Losing ' + q + ' leaves the electron arrangement of ' + lname(ng) + '; gaining ' + (8 - valE(e)) + ' would take far more energy.' :
      cap(lname(e)) + ' is in group ' + e.group + ' with ' + valE(e) + ' valence electrons. Gaining ' + (-q) + ' ' + plural(-q, 'electron') + ' gives it the arrangement of ' + lname(ng) + '.';
    if (kind === 0) {
      return {
        q: 'What charge does ' + lname(e) + ' (' + e.s + ', group ' + e.group + ') usually have as an ion? (Give a signed number, like −2 or +3.)',
        a: { t: 'num', v: String(q) },
        steps: [why, 'Charge: <b>' + signedT(q) + '</b>.'],
        hint: 'Metals on the left lose electrons; nonmetals on the right gain them.'
      };
    }
    if (kind === 1) {
      return {
        q: 'Write the symbol of the ion that ' + lname(e) + ' (' + e.s + ', group ' + e.group + ') usually forms, with its charge (like Ca2+ or Cl−).',
        a: { t: 'formula', v: [ionF(e.s, q)] },
        steps: [why, 'The ion is <b>$' + ft(ionF(e.s, q)) + '$</b>. The number goes before the sign, and a charge of 1 is written as just + or −.'],
        hint: 'Count how many electrons it gains or loses to match the nearest noble gas.'
      };
    }
    if (kind === 2) {
      return {
        q: 'The ion that ' + lname(e) + ' usually forms has the same number of electrons as which noble gas? Type its symbol.',
        a: { t: 'formula', v: [ng.s] },
        steps: [cap(lname(e)) + ' (atomic number ' + e.Z + ') forms $' + ft(ionF(e.s, q)) + '$, which has $' + e.Z + (q > 0 ? ' - ' + q : ' + ' + (-q)) + ' = ' + ne + '$ electrons.', 'The noble gas with ' + ne + ' electrons is <b>' + lname(ng) + ' (' + ng.s + ')</b>.'],
        hint: 'Find the nearest noble gas on the table.'
      };
    }
    if (kind === 3) {
      var target = R.pick([10, 18]), ions = IONEL.map(function (s) { return [EL[s], IONGRP[EL[s].group]]; });
      var good = ions.filter(function (x) { return x[0].Z - x[1] === target; }), bad = ions.filter(function (x) { return x[0].Z - x[1] !== target && x[0].Z - x[1] <= 36; });
      var g1 = R.pick(good), lab = function (x) { return '$' + ft(ionF(x[0].s, x[1])) + '$'; };
      return {
        q: 'Which ion has the same number of electrons as an atom of ' + lname(ELZ[target]) + '?',
        a: MC(lab(g1), R.sample(bad, 3).map(lab)),
        steps: [cap(lname(ELZ[target])) + ' has ' + target + ' electrons.', lab(g1) + ' has $' + g1[0].Z + (g1[1] > 0 ? ' - ' + g1[1] : ' + ' + (-g1[1])) + ' = ' + target + '$ electrons, so it matches.'],
        hint: 'Electrons in an ion = atomic number − charge.'
      };
    }
    var tfs = [
      ['A sodium atom usually gains 7 electrons to fill its outer shell.', false, 'Losing 1 electron reaches neon’s arrangement at a much smaller energy cost than gaining 7, so sodium forms Na⁺.'],
      ['The sulfide ion is written $\mathrm{S^{2+}}$.', false, 'Sulfur gains 2 electrons, so the ion is negative: $\mathrm{S^{2-}}$.'],
      ['Aluminum usually forms the ion $\mathrm{Al^{3+}}$.', true, 'Aluminum, in group 13, loses its 3 valence electrons to reach neon’s arrangement.'],
      ['Main-group metals form positive ions and nonmetals form negative ions.', true, 'Metals have few valence electrons and lose them; nonmetals are a few short of a noble gas and gain them.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Match the nearest noble gas.' };
  }));

  // ======================= 05-bonding.js
  // ---------------------------------------------------------------- unit: Bonds, Formulas and Names
  /* cations: symbol, charge, name (with a Roman numeral when the metal has more than one common charge) */
  var CATS = [['Li', 1, 'lithium'], ['Na', 1, 'sodium'], ['K', 1, 'potassium'], ['Ag', 1, 'silver'], ['Mg', 2, 'magnesium'], ['Ca', 2, 'calcium'], ['Ba', 2, 'barium'], ['Sr', 2, 'strontium'],
    ['Zn', 2, 'zinc'], ['Al', 3, 'aluminum'], ['Fe', 2, 'iron(II)'], ['Fe', 3, 'iron(III)'], ['Cu', 1, 'copper(I)'], ['Cu', 2, 'copper(II)'], ['Sn', 2, 'tin(II)'], ['Sn', 4, 'tin(IV)'],
    ['Pb', 2, 'lead(II)'], ['Pb', 4, 'lead(IV)'], ['Co', 2, 'cobalt(II)'], ['Cr', 3, 'chromium(III)'], ['Mn', 2, 'manganese(II)']];
  var VARMETAL = { Fe: 1, Cu: 1, Sn: 1, Pb: 1, Co: 1, Cr: 1, Mn: 1 };
  var MONO = { F: [-1, 'fluoride'], Cl: [-1, 'chloride'], Br: [-1, 'bromide'], I: [-1, 'iodide'], O: [-2, 'oxide'], S: [-2, 'sulfide'], N: [-3, 'nitride'], P: [-3, 'phosphide'] };
  /* which anions each variable-charge cation is used with (common, well-known compounds only) */
  var VARPAIR = { 'Fe2': 'Cl Br O S', 'Fe3': 'Cl Br O', 'Cu1': 'Cl I O S', 'Cu2': 'Cl Br O S', 'Sn2': 'Cl F O', 'Sn4': 'Cl O', 'Pb2': 'Cl I O S', 'Pb4': 'Cl O', 'Co2': 'Cl O', 'Cr3': 'Cl O', 'Mn2': 'Cl O' };
  function binPairs(varOnly) {
    var out = [];
    CATS.forEach(function (c) {
      Object.keys(MONO).forEach(function (a) {
        if (VARMETAL[c[0]]) { if (VARPAIR[c[0] + c[1]].split(' ').indexOf(a) < 0) return; }
        else { if (varOnly) return; if ((a === 'N' || a === 'P') && ['Li', 'Na', 'K', 'Mg', 'Ca', 'Ba', 'Al'].indexOf(c[0]) < 0) return; if (c[0] === 'Ag' && a === 'F') return; }
        out.push([c, a]);
      });
    });
    return out;
  }
  function gcd2(a, b) { a = abs(a); b = abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  /* binary ionic formula from the ion charges */
  function binF(c, a) { var qc = c[1], qa = -MONO[a][0], g = gcd2(qc, qa), nc = qa / g, na = qc / g; return { f: c[0] + (nc > 1 ? nc : '') + a + (na > 1 ? na : ''), nc: nc, na: na }; }
  function spellVars(list) { var out = []; list.forEach(function (n) { out.push(n); var b = n.replace(/aluminum/g, 'aluminium').replace(/sulf/g, 'sulph').replace(/cesium/g, 'caesium'); if (b !== n) out.push(b); }); return out; }
  function nameAll(n) { var v = []; nameVars(n).forEach(function (x) { v.push(x); }); return spellVars(v); }

  G('chem.ionic-bonding', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) {
      var ionicP = R.pick([['sodium', 'chlorine'], ['magnesium', 'oxygen'], ['potassium', 'bromine'], ['calcium', 'fluorine'], ['lithium', 'iodine'], ['aluminum', 'oxygen'], ['barium', 'sulfur']]);
      var cov = R.sample([['carbon', 'oxygen'], ['nitrogen', 'hydrogen'], ['sulfur', 'oxygen'], ['chlorine', 'chlorine'], ['carbon', 'chlorine'], ['phosphorus', 'chlorine'], ['hydrogen', 'oxygen']], 3);
      var lab = function (p) { return cap(p[0]) + ' and ' + p[1]; };
      return {
        q: 'Which pair of elements is most likely to form an ionic compound?',
        a: MC(lab(ionicP), cov.map(lab)),
        steps: ['Ionic bonds form between a metal, which loses electrons easily, and a nonmetal, which gains them.', cap(ionicP[0]) + ' is a metal and ' + ionicP[1] + ' is a nonmetal; the other pairs are two nonmetals, which share electrons instead.', 'Answer: <b>' + lab(ionicP) + '</b>.'],
        hint: 'Look for a metal paired with a nonmetal.'
      };
    }
    if (kind === 1 || kind === 2) {
      var pr = R.pick(binPairs(false).filter(function (p) { return !VARMETAL[p[0][0]] && p[0][0] !== 'Ag' && p[0][0] !== 'Zn'; })), c = pr[0], a = pr[1], bf = binF(c, a);
      var metal = EL[c[0]], non = EL[a];
      if (kind === 1) {
        return {
          q: 'When ' + lname(metal) + ' and ' + lname(non) + ' form the ionic compound $' + ft(bf.f) + '$, how many electrons does each ' + lname(metal) + ' atom lose?',
          a: { t: 'num', v: String(c[1]) },
          steps: [cap(lname(metal)) + ' is in group ' + metal.group + ', so it has ' + valE(metal) + ' valence ' + plural(valE(metal), 'electron') + ' and loses ' + plural(c[1], 'it', 'them') + ' to become $' + ft(ionF(c[0], c[1])) + '$.', 'Each ' + lname(metal) + ' atom loses <b>' + c[1] + '</b>.'],
          hint: 'The metal loses its valence electrons.'
        };
      }
      var tot = bf.nc * c[1];
      return {
        q: 'How many electrons move from metal atoms to nonmetal atoms to make one formula unit of $' + ft(bf.f) + '$?',
        a: { t: 'num', v: String(tot) },
        steps: ['The ions are $' + ft(ionF(c[0], c[1])) + '$ and $' + ft(ionF(a, MONO[a][0])) + '$.', 'One formula unit has ' + bf.nc + ' ' + lname(metal) + ' ' + plural(bf.nc, 'ion') + (bf.nc === 1 ? ', which lost ' : ', each having lost ') + c[1] + ': $' + bf.nc + ' \\times ' + c[1] + ' = ' + tot + '$ ' + plural(tot, 'electron') + '.', 'Check: the ' + bf.na + ' ' + lname(non) + ' ' + plural(bf.na, 'atom') + (bf.na === 1 ? ' gains $' : ' gain $') + bf.na + ' \\times ' + (-MONO[a][0]) + ' = ' + tot + '$. Electrons lost = electrons gained.'],
        hint: 'Count the electrons lost by all the metal atoms in one formula unit.'
      };
    }
    if (kind === 3) {
      var bank = [
        ['What does the formula NaCl tell you about solid sodium chloride?', 'There is one Na⁺ ion for every Cl⁻ ion in a large lattice', ['It is made of separate NaCl molecules', 'Each sodium atom shares one electron pair with one chlorine atom', 'It contains sodium metal mixed with chlorine gas']],
        ['In a crystal of sodium chloride, how many chloride ions surround each sodium ion?', '6', ['1', '2', '8']],
        ['What holds the ions in an ionic solid together?', 'The attraction between oppositely charged ions on every side', ['Shared pairs of electrons between two ions', 'Forces between neutral molecules', 'A sea of free electrons']],
        ['Which compound is ionic?', 'KBr', ['CO₂', 'H₂O', 'CH₄']]
      ];
      var b = R.pick(bank);
      return { q: b[0], a: MC(b[1], b[2]), steps: ['In an ionic solid, every positive ion is surrounded by negative ions and every negative ion by positive ones, in a repeating 3-D lattice. In sodium chloride each ion has 6 neighbors of the opposite charge. The formula only gives the ratio of ions; there are no separate molecules.', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Picture the lattice, not a pair.' };
    }
    var tfs = [
      ['Table salt is made of NaCl molecules, each one a sodium atom bonded to one chlorine atom.', false, 'Solid salt is a lattice of Na⁺ and Cl⁻ ions. Each ion is attracted by all of its neighbors of opposite charge; no pair belongs together.'],
      ['In an ionic compound, the total positive charge equals the total negative charge.', true, 'Ionic compounds are neutral overall, which is what fixes their formulas.'],
      ['Sodium gives its electron to chlorine because sodium "wants" an empty outer shell.', false, 'Atoms have no wants. Forming the ions costs some energy, but the strong attraction of the oppositely charged ions in the lattice releases much more, so the solid is lower in energy.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Think of a lattice of ions, not molecules.' };
  }));

  G('chem.ionic-formulas', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 0 : R.int(0, L === 2 ? 2 : 3);
    var pool = binPairs(false).filter(function (p) { return L === 1 ? !VARMETAL[p[0][0]] : true; });
    var pr = R.pick(pool), c = pr[0], a = pr[1], bf = binF(c, a), qa = MONO[a][0];
    var cI = ionF(c[0], c[1]), aI = ionF(a, qa);
    var steps = ['The ions are $' + ft(cI) + '$ and $' + ft(aI) + '$. The compound must have zero total charge.',
      bf.nc === 1 && bf.na === 1 ? 'The charges are equal in size, so one of each: $(' + signed(c[1]) + ') + (' + qa + ') = 0$.' :
        'The smallest total charge both can reach is ' + (bf.nc * c[1]) + ': $' + bf.nc + ' \\times (' + signed(c[1]) + ') + ' + bf.na + ' \\times (' + qa + ') = 0$.',
      'Formula: <b>$' + ft(bf.f) + '$</b>' + (bf.nc > 1 || bf.na > 1 ? ' (subscripts give the number of each ion; a subscript of 1 is not written).' : '.')];
    if (kind === 0) {
      return { q: 'Write the formula of the ionic compound formed from $' + ft(cI) + '$ and $' + ft(aI) + '$ ions.', a: { t: 'formula', v: [bf.f] }, steps: steps, hint: 'Find how many of each ion make the charges add to zero.' };
    }
    if (kind === 1) {
      var pr2 = R.pick(binPairs(false).filter(function (p) { return !VARMETAL[p[0][0]] && p[0][0] !== 'Ag' && p[0][0] !== 'Zn'; })), c2 = pr2[0], a2 = pr2[1], bf2 = binF(c2, a2);
      return {
        q: 'Write the formula of the ionic compound formed by ' + lname(EL[c2[0]]) + ' and ' + lname(EL[a2]) + '.',
        a: { t: 'formula', v: [bf2.f] },
        steps: ['Predict the charges from the groups: ' + lname(EL[c2[0]]) + ' (group ' + EL[c2[0]].group + ') forms $' + ft(ionF(c2[0], c2[1])) + '$ and ' + lname(EL[a2]) + ' (group ' + EL[a2].group + ') forms $' + ft(ionF(a2, MONO[a2][0])) + '$.', 'Balance the charges: $' + bf2.nc + ' \\times (' + signed(c2[1]) + ') + ' + bf2.na + ' \\times (' + MONO[a2][0] + ') = 0$.', 'Formula: <b>$' + ft(bf2.f) + '$</b>'],
        hint: 'Get each ion’s charge from its group first.'
      };
    }
    if (kind === 2) {
      var vp = R.pick(binPairs(true)), vc = vp[0], va = vp[1], vf = binF(vc, va);
      return {
        q: 'In the compound $' + ft(vf.f) + '$, what is the charge on each ' + lname(EL[vc[0]]) + ' ion? (Give a signed number, like +2.)',
        a: { t: 'num', v: String(vc[1]) },
        steps: ['The anion is $' + ft(ionF(va, MONO[va][0])) + '$, so the ' + vf.na + ' ' + plural(vf.na, 'anion') + ' carry $' + vf.na + ' \\times (' + MONO[va][0] + ') = ' + (vf.na * MONO[va][0]) + '$.', 'The ' + vf.nc + ' metal ' + plural(vf.nc, 'ion') + ' must carry $' + (-vf.na * MONO[va][0]) + '$ in total, so each has $' + (-vf.na * MONO[va][0]) + ' \\div ' + vf.nc + ' = ' + signed(vc[1]) + '$.'],
        hint: 'The negative charge of all the anions must be balanced by the metal ions.'
      };
    }
    var c3 = R.pick(pool.filter(function (p) { var f = binF(p[0], p[1]); return f.nc > 1 || f.na > 1; })), f3 = binF(c3[0], c3[1]);
    var swapped = c3[0][0] + (f3.na > 1 ? f3.na : '') + c3[1] + (f3.nc > 1 ? f3.nc : ''), unreduced = c3[0][0] + (MONO[c3[1]][0] * -1 > 1 ? -MONO[c3[1]][0] : '') + c3[1] + (c3[0][1] > 1 ? c3[0][1] : '');
    var wr = [swapped, c3[0][0] + c3[1], unreduced, c3[0][0] + c3[1] + (abs(MONO[c3[1]][0]) + c3[0][1])].filter(function (w) { return w !== f3.f; });
    return {
      q: 'Which is the correct formula for the compound of $' + ft(ionF(c3[0][0], c3[0][1])) + '$ and $' + ft(ionF(c3[1], MONO[c3[1]][0])) + '$?',
      a: MC('$' + ft(f3.f) + '$', wr.map(function (w) { return '$' + ft(w) + '$'; })),
      steps: ['Total charge must be zero: $' + f3.nc + ' \\times (' + signed(c3[0][1]) + ') + ' + f3.na + ' \\times (' + MONO[c3[1]][0] + ') = 0$.', 'Each charge number becomes the other ion’s subscript, then reduce to the smallest whole-number ratio. Check by multiplying back: the charges must cancel.', 'Answer: $' + ft(f3.f) + '$'],
      hint: 'Multiply each subscript by its ion’s charge; the totals must cancel.'
    };
  }));

  G('chem.naming-ionic', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 2 : 3);
    var pool = binPairs(false).filter(function (p) { return L === 1 ? !VARMETAL[p[0][0]] : (R.chance(0.5) ? VARMETAL[p[0][0]] : true); });
    var pr = R.pick(pool), c = pr[0], a = pr[1], f = binF(c, a).f, name = c[2] + ' ' + MONO[a][1], isVar = !!VARMETAL[c[0]];
    var why = isVar ? [cap(lname(EL[c[0]])) + ' can form more than one ion, so the name must show the charge with a Roman numeral.',
      'The anion is $' + ft(ionF(a, MONO[a][0])) + '$; ' + binF(c, a).na + ' of them carry $' + (binF(c, a).na * MONO[a][0]) + '$, so each of the ' + binF(c, a).nc + ' metal ' + plural(binF(c, a).nc, 'ion') + ' is ' + signed(c[1]) + ': ' + c[2] + '.'] :
      [cap(lname(EL[c[0]])) + ' forms only one common ion, so no Roman numeral is needed.'];
    if (kind === 0) {
      return {
        q: 'Name the compound $' + ft(f) + '$.',
        a: { t: 'text', v: nameAll(name) },
        steps: why.concat(['Name the metal, then the nonmetal with its ending changed to -ide (' + lname(EL[a]) + ' → ' + MONO[a][1] + '). No prefixes: the charges already fix the ratio.', 'Name: <b>' + name + '</b>.']),
        hint: isVar ? 'Work out the metal’s charge from the anions, and show it with a Roman numeral.' : 'Metal name, then the nonmetal with -ide.'
      };
    }
    if (kind === 1) {
      return {
        q: 'Write the formula of ' + name + '.',
        a: { t: 'formula', v: [f] },
        steps: ['The ions: $' + ft(ionF(c[0], c[1])) + '$' + (isVar ? ' (the Roman numeral gives the charge)' : '') + ' and $' + ft(ionF(a, MONO[a][0])) + '$.', 'Balance the charges to zero: <b>$' + ft(f) + '$</b>.'],
        hint: 'Get both charges, then balance them.'
      };
    }
    if (kind === 2) {
      var vp = R.pick(binPairs(true)), vc = vp[0], va = vp[1], vf = binF(vc, va), right = vc[2] + ' ' + MONO[va][1];
      var bf2 = binF(vc, va), pre = ['', 'mono', 'di', 'tri', 'tetra'], prefName = (bf2.nc > 1 ? pre[bf2.nc] : '') + lname(EL[vc[0]]) + ' ' + (bf2.na > 1 ? pre[bf2.na] : (bf2.nc > 1 ? 'mono' : '')) + MONO[va][1];
      prefName = prefName.replace('monooxide', 'monoxide').replace('tetraoxide', 'tetroxide');
      var other = CATS.filter(function (x) { return x[0] === vc[0] && x[1] !== vc[1]; })[0];
      var wrongs = [lname(EL[vc[0]]) + ' ' + MONO[va][1], prefName];
      if (other) wrongs.push(other[2] + ' ' + MONO[va][1]);
      return {
        q: 'Which is the correct name for $' + ft(vf.f) + '$?',
        a: MC(cap(right), wrongs.map(cap)),
        steps: ['Ionic compounds are not named with prefixes, but a metal with more than one common charge needs a Roman numeral.', 'Each anion is $' + ft(ionF(va, MONO[va][0])) + '$; ' + bf2.na + ' of them carry $' + (bf2.na * MONO[va][0]) + '$, so each metal ion is $' + signed(vc[1]) + '$.', 'Name: <b>' + right + '</b>.'],
        hint: 'Find the metal’s charge from the anions.'
      };
    }
    var tfs = [
      ['$\\mathrm{CaCl_2}$ is named calcium dichloride.', false, 'Ionic compounds do not use prefixes: it is calcium chloride. The charges (Ca²⁺, Cl⁻) already tell you there are two chlorides.'],
      ['$\\mathrm{FeO}$ and $\\mathrm{Fe_2O_3}$ need Roman numerals in their names.', true, 'Iron forms Fe²⁺ and Fe³⁺, so the names iron(II) oxide and iron(III) oxide tell them apart.'],
      ['The Roman numeral in copper(II) chloride tells how many chloride ions there are.', false, 'It gives the charge on the copper ion, +2. (Here that happens to mean two chlorides, but in copper(II) oxide there is only one oxide.)'],
      ['Zinc and silver compounds are usually named without Roman numerals.', true, 'Zinc forms only Zn²⁺ and silver almost always Ag⁺, so there is nothing to tell apart.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Roman numerals give charges; prefixes are for molecular compounds.' };
  }));

  /* polyatomic ions: formula, charge, name, other accepted names */
  var POLYS = {
    NH4: [1, 'ammonium'], OH: [-1, 'hydroxide'], NO3: [-1, 'nitrate'], NO2: [-1, 'nitrite'], SO4: [-2, 'sulfate'], SO3: [-2, 'sulfite'], PO4: [-3, 'phosphate'],
    CO3: [-2, 'carbonate'], HCO3: [-1, 'hydrogen carbonate', ['bicarbonate']], CH3COO: [-1, 'acetate'], ClO3: [-1, 'chlorate'], ClO4: [-1, 'perchlorate'], ClO: [-1, 'hypochlorite'],
    MnO4: [-1, 'permanganate'], CrO4: [-2, 'chromate'], Cr2O7: [-2, 'dichromate'], CN: [-1, 'cyanide'], HSO4: [-1, 'hydrogen sulfate', ['bisulfate']]
  };
  /* which cations each polyatomic anion is paired with (well-known compounds only) */
  var G1 = 'Li Na K';
  var PCOMBO = {
    OH: G1 + ' Mg Ca Ba Al Zn Cu2 Fe3', NO3: G1 + ' Mg Ca Ba Al Zn Cu2 Fe3 Ag Pb2 NH4', NO2: 'Na K', SO4: G1 + ' Mg Ca Ba Al Zn Cu2 Fe2 Fe3 NH4 Pb2', SO3: 'Na K', PO4: G1 + ' Ca Mg Al NH4 Ag Zn',
    CO3: G1 + ' Mg Ca Ba Zn Cu2 NH4 Pb2', HCO3: 'Na K', CH3COO: G1 + ' Mg Ca NH4 Ag', ClO3: 'Na K', ClO4: 'Na K', ClO: 'Na Ca', MnO4: 'K Na', CrO4: 'K Na Pb2 Ba', Cr2O7: 'K Na NH4', CN: 'Na K', HSO4: 'Na K'
  };
  function catBy(code) { if (code === 'NH4') return ['NH4', 1, 'ammonium']; var m = /^([A-Z][a-z]?)(\d?)$/.exec(code); return CATS.filter(function (c) { return c[0] === m[1] && (m[2] ? c[1] === +m[2] : !VARMETAL[c[0]]); })[0]; }
  function grp(x, n) { return n === 1 ? x : ((x.length > 2 || /[A-Z].*[A-Z]/.test(x)) && !/^[A-Z][a-z]?$/.test(x) ? '(' + x + ')' + n : x + n); }
  /* polyF(cat, anion): { f, alts, nc, na } for a compound with a polyatomic anion (or the ammonium cation with a halide) */
  function polyF(c, an) {
    var qa = POLYS[an] ? -POLYS[an][0] : -MONO[an][0], g = gcd2(c[1], qa), nc = qa / g, na = c[1] / g;
    var f = grp(c[0], nc) + grp(an, na), alts = [f];
    if (an === 'CH3COO') { alts.push(grp(c[0], nc) + grp('C2H3O2', na)); if (na === 1) alts.push('CH3COO' + grp(c[0], nc)); }
    return { f: f, alts: alts, nc: nc, na: na };
  }
  function polyPairs() { var out = []; Object.keys(PCOMBO).forEach(function (an) { PCOMBO[an].split(' ').forEach(function (cc) { var c = catBy(cc); if (c) out.push([c, an]); }); }); out.push([catBy('NH4'), 'Cl']); out.push([catBy('NH4'), 'Br']); return out; }
  function anName(an) { return POLYS[an] ? POLYS[an][1] : MONO[an][1]; }
  function anIon(an) { return POLYS[an] ? ionF(an, POLYS[an][0]) : ionF(an, MONO[an][0]); }
  function polyNames(c, an) { var base = c[2] + ' ' + anName(an), out = nameAll(base); if (POLYS[an] && POLYS[an][2]) POLYS[an][2].forEach(function (alt) { out = out.concat(nameAll(c[2] + ' ' + alt)); }); return out; }
  G('chem.polyatomic-ions', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    var pairs = polyPairs(), fpairs = pairs.filter(function (p) { return polyF(p[0], p[1]).f.indexOf('NaN') < 0; }); // the checker reads 'NaN' in NaNO3 as not-a-number
    var pr = R.pick(kind === 0 ? fpairs : pairs), c = pr[0], an = pr[1], pf = polyF(c, an), name = c[2] + ' ' + anName(an);
    var ionsLine = 'The ions are $' + ft(ionF(c[0], c[1])) + '$ and $' + ft(anIon(an)) + '$.';
    if (kind === 0) {
      return {
        q: 'Write the formula of ' + name + '.',
        a: { t: 'formula', v: pf.alts },
        steps: [ionsLine, 'Balance the charges: $' + pf.nc + ' \\times (' + signed(c[1]) + ') + ' + pf.na + ' \\times (' + (POLYS[an] ? POLYS[an][0] : MONO[an][0]) + ') = 0$.', (pf.na > 1 && POLYS[an]) || (pf.nc > 1 && c[0] === 'NH4') ? 'When you need more than one polyatomic ion, put it in parentheses and write the count outside; never change the subscripts inside the ion.' : 'One of each polyatomic ion needs no parentheses.', 'Formula: <b>$' + ft(pf.f) + '$</b>'],
        hint: 'Treat the polyatomic ion as one unit with one charge.'
      };
    }
    if (kind === 1) {
      return {
        q: 'Name the compound $' + ft(pf.f) + '$.',
        a: { t: 'text', v: polyNames(c, an) },
        steps: [ionsLine, VARMETAL[c[0]] ? cap(lname(EL[c[0]])) + ' forms more than one common ion, so the name gives its charge with a Roman numeral: ' + c[2] + '.' : 'Name the cation, then the anion. A polyatomic ion keeps its own name; no prefixes are used.', 'Name: <b>' + name + '</b>.'],
        hint: 'Recognize the polyatomic ion by its formula.'
      };
    }
    if (kind === 2) {
      var big = R.pick(pairs.filter(function (p) { var x = polyF(p[0], p[1]); return x.nc > 1 || x.na > 1; })), bf = polyF(big[0], big[1]), at = atoms(bf.f), els = Object.keys(at), elx = R.pick(els);
      var parts = [];
      return {
        q: 'How many ' + lname(EL[elx]) + ' atoms are in one formula unit of $' + ft(bf.f) + '$?',
        a: { t: 'num', v: String(at[elx]) },
        steps: ['A subscript after a parenthesis multiplies everything inside it.', 'Count ' + elx + ': ' + countSteps(bf.f, elx) + ' = <b>' + at[elx] + '</b>.'],
        hint: 'Multiply the subscript inside the parentheses by the one outside.'
      };
    }
    if (kind === 3) {
      var an2 = R.pick(Object.keys(POLYS)), ion = ionF(an2, POLYS[an2][0]);
      return {
        q: 'Write the formula of the ' + POLYS[an2][1] + ' ion, with its charge.',
        a: { t: 'formula', v: an2 === 'CH3COO' ? [ion, 'C2H3O2^-'] : [ion] },
        steps: ['The ' + POLYS[an2][1] + ' ion is <b>$' + ft(ion) + '$</b>.', an2 === 'NO3' || an2 === 'NO2' || an2 === 'SO4' || an2 === 'SO3' || an2 === 'ClO3' || an2 === 'ClO4' || an2 === 'ClO' ? 'Pattern: -ate and -ite ions of the same element have the same charge, and the -ite ion has one fewer oxygen (nitrate NO₃⁻, nitrite NO₂⁻; sulfate SO₄²⁻, sulfite SO₃²⁻). Per- adds an oxygen and hypo- takes one away.' : 'Learn the common ions with their charges; they appear in many compounds.'],
        hint: 'Remember the -ate/-ite pattern.'
      };
    }
    var pp = R.pick(fpairs.filter(function (p) { var x = polyF(p[0], p[1]); return x.na > 1 && POLYS[p[1]] && p[1] !== 'CH3COO'; })), ppf = polyF(pp[0], pp[1]);
    var cpart = pp[0][0] + (ppf.nc > 1 ? ppf.nc : ''), noParen = cpart + pp[1] + ppf.na, single = cpart + pp[1];
    var inside = /\d+$/.test(pp[1]) ? cpart + pp[1].replace(/(\d+)$/, function (d) { return String(+d * ppf.na); }) : cpart + pp[1] + ppf.na;
    return {
      q: 'Which is the correct formula for ' + pp[0][2] + ' ' + anName(pp[1]) + '?',
      a: MC('$' + ft(ppf.f) + '$', [noParen, inside, single].filter(function (w) { return w !== ppf.f; }).map(function (w) { return '$' + ft(w) + '$'; })),
      steps: ['The ions are $' + ft(ionF(pp[0][0], pp[0][1])) + '$ and $' + ft(anIon(pp[1])) + '$, so you need ' + ppf.na + ' of the polyatomic ion.', 'Keep the ion whole in parentheses and put the ' + ppf.na + ' outside. Without parentheses the ' + ppf.na + ' would be read as part of the ion, and changing a subscript inside the ion makes a different ion.', 'Answer: $' + ft(ppf.f) + '$'],
      hint: 'More than one polyatomic ion needs parentheses.'
    };
  }));
  /* countSteps('Al2(SO4)3', 'O') -> "4 × 3" style explanation */
  function countSteps(f, e) {
    var parts = [], re = /\(([^)]+)\)(\d+)|([A-Z][a-z]?)(\d*)/g, m;
    while ((m = re.exec(f))) {
      if (m[1]) { var inner = atoms(m[1]); if (inner[e]) parts.push(inner[e] + ' × ' + m[2]); }
      else if (m[3] === e) parts.push(m[4] || '1');
    }
    return parts.join(' + ');
  }

  var BONDS_USUAL = { H: 1, C: 4, N: 3, O: 2, F: 1, Cl: 1, Br: 1, I: 1, S: 2, P: 3, Si: 4 };
  G('chem.covalent-bonding', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) {
      var s = R.pick(Object.keys(BONDS_USUAL)), e = EL[s], nb = BONDS_USUAL[s];
      return {
        q: 'In most of its neutral molecules, how many covalent bonds does ' + (s === 'H' ? 'a hydrogen' : art(lname(e)) + ' ' + lname(e)) + ' atom form?',
        a: { t: 'num', v: String(nb) },
        steps: [s === 'H' ? 'Hydrogen has 1 electron and its shell holds 2, so it shares 1 pair.' : cap(lname(e)) + ' has ' + valE(e) + ' valence electrons. It shares ' + (8 - valE(e)) + ' more pairs to be surrounded by 8 electrons (4 pairs).', 'So it usually forms <b>' + nb + '</b> ' + plural(nb, 'bond') + (s === 'C' ? '. That is why carbon makes four bonds in methane, CH₄, and in the rings and chains of living things.' : '.')],
        hint: 'Count how many electrons the atom is short of a filled shell.'
      };
    }
    if (kind === 1) {
      var m = R.pick([['H2', 1, 0], ['Cl2', 1, 0], ['F2', 1, 0], ['O2', 2, 0], ['N2', 3, 0], ['HCl', 1, 0], ['CO2', 2, 2], ['HCN', 3, 1]]);
      var shared = m[0] === 'CO2' ? 8 : m[0] === 'HCN' ? 8 : 2 * m[1];
      var desc = m[0] === 'CO2' ? 'two double bonds, O=C=O: $2 \\times 4 = 8$ shared electrons' : m[0] === 'HCN' ? 'a single bond H–C (2 electrons) and a triple bond C≡N (6 electrons): 8 shared electrons' : ['', 'a single bond: one shared pair, 2 electrons', 'a double bond: two shared pairs, 4 electrons', 'a triple bond: three shared pairs, 6 electrons'][m[1]];
      if (L >= 2 && R.coin()) {
        var dl = R.pick(LEWD.filter(function (x) { return x[0].indexOf('^') < 0 && x[0] !== 'N2' && x[0] !== 'O2' && x[0] !== 'CO2' && x[0] !== 'HCN'; }));
        m = [dl[0]]; shared = 2 * dl[3];
        desc = dl[3] + ' shared ' + plural(dl[3], 'pair') + (dl[6] ? ' (a double bond counts as 2 pairs)' : dl[7] ? ' (a triple bond counts as 3 pairs)' : '') + ': $' + dl[3] + ' \\times 2 = ' + shared + '$ electrons';
      }
      return {
        q: 'How many electrons are shared between the atoms in one molecule of $' + ft(m[0]) + '$ (count every bond)?',
        a: { t: 'num', v: String(shared) },
        steps: ['Each covalent bond is one shared pair of electrons: single 2, double 4, triple 6.', '$' + ft(m[0]) + '$ has ' + desc + '.', 'Answer: <b>' + shared + '</b>.'],
        hint: 'A single bond is one pair of electrons.'
      };
    }
    if (kind === 2) {
      var ion = R.pick([['Na', 'Cl'], ['K', 'O'], ['Mg', 'F'], ['Ca', 'Br']]), cov = R.pick([['C', 'H'], ['N', 'O'], ['S', 'O'], ['P', 'Cl'], ['C', 'Cl'], ['H', 'O']]), askCov = R.coin();
      var pair = askCov ? cov : ion, others = askCov ? [ion, R.pick([['Li', 'F'], ['Ba', 'S']])] : [cov, R.pick([['N', 'H'], ['C', 'O']])];
      return {
        q: 'Which pair of atoms is most likely to form ' + (askCov ? 'a covalent' : 'an ionic') + ' bond?',
        a: MC(lname(EL[pair[0]]) === 'hydrogen' ? 'Hydrogen and ' + lname(EL[pair[1]]) : cap(lname(EL[pair[0]])) + ' and ' + lname(EL[pair[1]]), others.map(function (p) { return cap(lname(EL[p[0]])) + ' and ' + lname(EL[p[1]]); }).concat(['Two sodium atoms'])),
        steps: ['Two nonmetals, both pulling hard on electrons, share pairs: covalent bonds. A metal and a nonmetal transfer electrons: ionic bonds. (Metal atoms bond to each other with metallic bonding.)', 'Answer: <b>' + cap(lname(EL[pair[0]])) + ' and ' + lname(EL[pair[1]]) + '</b>.'],
        hint: 'Nonmetal + nonmetal: covalent. Metal + nonmetal: ionic.'
      };
    }
    if (kind === 3) {
      var bank = [
        ['Which carbon–carbon bond is the shortest and strongest?', 'The triple bond, C≡C', ['The single bond, C–C', 'The double bond, C=C', 'They are all the same']],
        ['Why does a shared pair of electrons hold two atoms together?', 'The pair is attracted to both nuclei at once, which lowers the energy', ['Each atom wants eight electrons', 'The two nuclei attract each other', 'The electrons repel the nuclei together']],
        ['What happens to the energy of two hydrogen atoms as they come together to form H₂?', 'It drops to a minimum at the bond length, then rises if they are pushed closer', ['It rises steadily', 'It stays the same until they touch', 'It drops forever as they get closer']]
      ];
      var b = R.pick(bank);
      return { q: b[0], a: MC(b[1], b[2]), steps: ['A covalent bond forms because the shared electrons sit between the nuclei and are attracted to both. That lowers the energy until, at very short distances, the nuclei repel each other. The bottom of that energy curve is the bond length. More shared pairs pull the nuclei closer and hold them more strongly.', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Think about attraction between electrons and nuclei.' };
    }
    var tfs = [
      ['Atoms form covalent bonds because they want eight electrons.', false, 'Atoms have no wants. Bonds form because the shared electrons are attracted to two nuclei at once, which lowers the energy. The octet rule is a pattern that results, not the cause.'],
      ['A double bond is made of two shared pairs of electrons.', true, 'Single: one pair. Double: two pairs. Triple: three pairs.'],
      ['Energy is released when two atoms form a covalent bond.', true, 'The bonded atoms are lower in energy than the separate atoms, and the difference is given off.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Bonds come from attraction, not wants.' };
  }));

  var COVN = [ // formula, name, other accepted names
    ['CO', 'carbon monoxide'], ['CO2', 'carbon dioxide'], ['N2O', 'dinitrogen monoxide', ['dinitrogen oxide']], ['NO', 'nitrogen monoxide'], ['NO2', 'nitrogen dioxide'], ['N2O3', 'dinitrogen trioxide'],
    ['N2O4', 'dinitrogen tetroxide', ['dinitrogen tetraoxide']], ['N2O5', 'dinitrogen pentoxide', ['dinitrogen pentaoxide']], ['SO2', 'sulfur dioxide'], ['SO3', 'sulfur trioxide'], ['PCl3', 'phosphorus trichloride'],
    ['PCl5', 'phosphorus pentachloride'], ['CCl4', 'carbon tetrachloride'], ['SF6', 'sulfur hexafluoride'], ['P4O10', 'tetraphosphorus decoxide', ['tetraphosphorus decaoxide']], ['SiO2', 'silicon dioxide'],
    ['ClF3', 'chlorine trifluoride'], ['BF3', 'boron trifluoride'], ['BCl3', 'boron trichloride'], ['IF7', 'iodine heptafluoride'], ['XeF4', 'xenon tetrafluoride'], ['CS2', 'carbon disulfide'],
    ['SiCl4', 'silicon tetrachloride'], ['OF2', 'oxygen difluoride'], ['Cl2O7', 'dichlorine heptoxide', ['dichlorine heptaoxide']], ['PBr3', 'phosphorus tribromide'], ['NCl3', 'nitrogen trichloride'],
    ['S2Cl2', 'disulfur dichloride'], ['P2O5', 'diphosphorus pentoxide', ['diphosphorus pentaoxide']], ['SF4', 'sulfur tetrafluoride'], ['CBr4', 'carbon tetrabromide'], ['XeF2', 'xenon difluoride'], ['NF3', 'nitrogen trifluoride']
  ];
  var PREF = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca'];
  G('chem.naming-covalent', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 2 : 3);
    var c = R.pick(COVN), at = atoms(c[0]), els = c[0].match(/[A-Z][a-z]?/g).filter(function (x, i, a) { return a.indexOf(x) === i; });
    var expl = els.map(function (e, i) { return at[e] + ' ' + lname(EL[e]) + ' ' + plural(at[e], 'atom') + ': ' + (i === 0 && at[e] === 1 ? 'no prefix (mono- is left off the first element)' : PREF[at[e]] + '-'); }).join('; ');
    if (kind === 0) {
      return {
        q: 'Name the molecular compound $' + ft(c[0]) + '$.',
        a: { t: 'text', v: spellVars([c[1]].concat(c[2] || [])) },
        steps: ['Both elements are nonmetals, so use prefixes to give the number of each atom.', expl + '. The second element ends in -ide.', 'When a prefix ending in a or o comes before "oxide", the vowel is usually dropped (monoxide, pentoxide).', 'Name: <b>' + c[1] + '</b>.'],
        hint: 'mono 1, di 2, tri 3, tetra 4, penta 5, hexa 6, hepta 7, octa 8, nona 9, deca 10.'
      };
    }
    if (kind === 1) {
      return {
        q: 'Write the formula of ' + c[1] + '.',
        a: { t: 'formula', v: [c[0]] },
        steps: ['Each prefix gives a subscript: ' + expl + '.', 'Formula: <b>$' + ft(c[0]) + '$</b>'],
        hint: 'Turn each prefix into a number.'
      };
    }
    if (kind === 2) {
      var cc = R.pick(COVN.filter(function (x) { var a1 = atoms(x[0]); return a1[x[0].match(/[A-Z][a-z]?/)[0]] === 1 && x[0] !== 'CO' && x[0] !== 'NO'; }));
      var first = lname(EL[cc[0].match(/[A-Z][a-z]?/)[0]]), rest = cc[1].slice(first.length + 1);
      return {
        q: 'Which is the correct name for $' + ft(cc[0]) + '$?',
        a: MC(cap(cc[1]), [cap('mono' + first + ' ' + rest), cap(first + ' ' + rest.replace(/^(mono|di|tri|tetra|penta|hexa|hepta)/, '')), cap(first + ' ' + rest.replace(/^(di|tri|tetra|penta|hexa|hepta)/, function (p) { return PREF[PREF.indexOf(p) + 1] || 'di'; }))]),
        steps: ['Mono- is never used on the first element: if there is one atom of it, its name has no prefix.', 'The second element always gets its prefix, even mono-.', 'Answer: <b>' + cc[1] + '</b>.'],
        hint: 'Is mono- ever used for the first element?'
      };
    }
    var bank = [
      ['Which compound should be named with prefixes such as di- and tri-?', '$\\mathrm{N_2O_3}$', ['$\\mathrm{Na_2O}$', '$\\mathrm{CaCl_2}$', '$\\mathrm{Al_2O_3}$']],
      ['What number does the prefix hepta- stand for?', '7', ['5', '6', '8']],
      ['What is the common name of $\\mathrm{H_2O}$, used instead of a prefix name?', 'Water', ['Dihydrogen oxide', 'Hydrogen dioxide', 'Hydroxide']],
      ['Which name is written correctly?', 'Diphosphorus pentoxide', ['Monophosphorus trichloride', 'Calcium dichloride', 'Nitrogen trihydride monoxide']]
    ];
    var b = R.pick(bank);
    return { q: b[0], a: MC(b[1], b[2]), steps: ['Prefixes are for compounds of two nonmetals (molecular compounds), where the same two elements can join in several ratios (NO, NO₂, N₂O₄ …). Ionic compounds never use them. Some molecules keep common names: water, ammonia (NH₃), methane (CH₄).', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Prefixes: molecular compounds only.' };
  }));

  /* Lewis structure data: formula, total valence electrons, central atom (or ''), bonding pairs in all, lone pairs on the central atom, lone pairs in all, double bonds, triple bonds */
  var LEWD = [
    ['H2O', 8, 'O', 2, 2, 2, 0, 0], ['NH3', 8, 'N', 3, 1, 1, 0, 0], ['CH4', 8, 'C', 4, 0, 0, 0, 0], ['CO2', 16, 'C', 4, 0, 4, 2, 0], ['HCN', 10, 'C', 4, 0, 1, 0, 1],
    ['N2', 10, '', 3, null, 2, 0, 1], ['O2', 12, '', 2, null, 4, 1, 0], ['CH2O', 12, 'C', 4, 0, 2, 1, 0], ['PCl3', 26, 'P', 3, 1, 10, 0, 0], ['CCl4', 32, 'C', 4, 0, 12, 0, 0],
    ['NH4^+', 8, 'N', 4, 0, 0, 0, 0], ['OH^-', 8, '', 1, null, 3, 0, 0], ['CN^-', 10, '', 3, null, 2, 0, 1], ['H3O^+', 8, 'O', 3, 1, 1, 0, 0], ['HF', 8, '', 1, null, 3, 0, 0],
    ['Cl2', 14, '', 1, null, 6, 0, 0], ['H2S', 8, 'S', 2, 2, 2, 0, 0], ['NF3', 26, 'N', 3, 1, 10, 0, 0], ['SiH4', 8, 'Si', 4, 0, 0, 0, 0], ['NO2^-', 18, 'N', 3, 1, 6, 1, 0],
    ['NO3^-', 24, 'N', 4, 0, 8, 1, 0], ['CO3^2-', 24, 'C', 4, 0, 8, 1, 0], ['C2H4', 12, '', 6, null, 0, 1, 0], ['C2H2', 10, '', 5, null, 0, 0, 1], ['CH3Cl', 14, 'C', 4, 0, 3, 0, 0], ['CH2Cl2', 20, 'C', 4, 0, 6, 0, 0], ['OF2', 20, 'O', 2, 2, 8, 0, 0],
    ['PH3', 8, 'P', 3, 1, 1, 0, 0], ['CHCl3', 26, 'C', 4, 0, 9, 0, 0], ['CF4', 32, 'C', 4, 0, 12, 0, 0], ['SCl2', 20, 'S', 2, 2, 8, 0, 0], ['PF3', 26, 'P', 3, 1, 10, 0, 0], ['HOCl', 14, 'O', 2, 2, 5, 0, 0],
    ['NH2^-', 8, 'N', 2, 2, 2, 0, 0], ['ClO^-', 14, '', 1, null, 6, 0, 0], ['CS2', 16, 'C', 4, 0, 4, 2, 0], ['Br2', 14, '', 1, null, 6, 0, 0], ['HBr', 8, '', 1, null, 3, 0, 0], ['H2Se', 8, 'Se', 2, 2, 2, 0, 0]
  ];
  function veSteps(f) {
    var a = atoms(f), q = /\^(\d*)([+-])$/.exec(f), ch = q ? (q[2] === '+' ? 1 : -1) * (+q[1] || 1) : 0, parts = [], tot = 0;
    Object.keys(a).forEach(function (e) { var v = valE(EL[e]); parts.push(a[e] + ' ' + e + ' × ' + v); tot += a[e] * v; });
    var s = parts.join(' + ') + ' = ' + tot;
    if (ch) s += '; the charge ' + (ch > 0 ? '+' + (ch === 1 ? '' : ch) : (ch === -1 ? '−' : ch + '')) + ' ' + (ch < 0 ? 'adds ' + (-ch) + ' ' + plural(-ch, 'electron') : 'removes ' + ch + ' ' + plural(ch, 'electron')) + ': ' + tot + (ch < 0 ? ' + ' + (-ch) : ' − ' + ch) + ' = ' + (tot - ch);
    return { text: s, tot: tot - ch };
  }
  G('chem.lewis-structures', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick([0, 0, 5]) : R.int(0, L === 2 ? 2 : 5);
    if (kind === 5) {
      var d5 = R.pick(LEWD);
      return {
        q: 'How many bonding pairs (shared pairs) are in the Lewis structure of $' + ft(d5[0]) + '$? Count a double bond as 2 pairs and a triple bond as 3.',
        a: { t: 'num', v: String(d5[3]) },
        steps: ['Total valence electrons: ' + d5[1] + ' (' + (d5[1] / 2) + ' pairs).', 'Connect the atoms with single bonds, then turn lone pairs into multiple bonds wherever an atom other than H is short of an octet.', 'Bonding pairs: <b>' + d5[3] + '</b>' + (d5[6] ? ', including ' + d5[6] + ' double ' + plural(d5[6], 'bond') : d5[7] ? ', including a triple bond' : '') + '. The other ' + d5[5] + ' ' + plural(d5[5], 'pair') + ' are lone pairs.'],
        hint: 'Draw the structure; every line is one shared pair.'
      };
    }
    if (kind === 0) {
      var d = R.pick(L === 1 ? LEWD.filter(function (x) { return x[0].indexOf('^') < 0; }) : LEWD), vs = veSteps(d[0]);
      return {
        q: 'How many valence electrons must the Lewis structure of $' + ft(d[0]) + '$ show in all?',
        a: { t: 'num', v: String(d[1]) },
        steps: ['Add the valence electrons of every atom' + (d[0].indexOf('^') >= 0 ? ', then adjust for the charge: a negative ion has extra electrons, a positive ion is missing some' : '') + '.', vs.text + '.', 'Total: <b>' + d[1] + '</b> electrons, or ' + (d[1] / 2) + ' pairs to place as bonds and lone pairs.'],
        hint: 'Use group numbers for valence electrons' + (d[0].indexOf('^') >= 0 ? ', and don’t forget the charge.' : '.')
      };
    }
    var withC = LEWD.filter(function (x) { return x[2]; }), d2 = R.pick(withC);
    if (kind === 1) {
      return {
        q: 'In the Lewis structure of $' + ft(d2[0]) + '$, how many lone pairs are on the central ' + lname(EL[d2[2]]) + ' atom?',
        a: { t: 'num', v: String(d2[4]) },
        steps: ['Total valence electrons: ' + d2[1] + '. ' + cap(lname(EL[d2[2]])) + ' is the central atom' + (d2[2] === 'C' || d2[2] === 'Si' ? '' : '') + '.', 'Connect each outer atom with a single bond, give the outer atoms (except H) full octets, put leftover electrons on the central atom, and make double or triple bonds if the central atom still lacks an octet.', 'Bonds use ' + d2[3] + ' pairs (' + (d2[6] ? d2[6] + ' double ' + plural(d2[6], 'bond') + ' counted as 2 pairs each' : d2[7] ? 'a triple bond counted as 3 pairs' : 'all single bonds') + '); the central atom keeps <b>' + d2[4] + '</b> lone ' + plural(d2[4], 'pair') + '.'],
        hint: 'Find the total, place the bonds and outer lone pairs, and see what is left for the center.'
      };
    }
    if (kind === 2) {
      var d3 = R.pick(LEWD.filter(function (x) { return x[6] || x[7]; }).concat(LEWD.filter(function (x) { return !x[6] && !x[7]; }).slice(0, 4))), what = d3[7] ? 'triple' : 'double';
      var cnt = d3[7] ? d3[7] : d3[6];
      return {
        q: 'How many ' + what + ' bonds are in the Lewis structure of $' + ft(d3[0]) + '$?' + (d3[0] === 'NO3^-' || d3[0] === 'CO3^2-' || d3[0] === 'NO2^-' ? ' (Count one resonance structure.)' : ''),
        a: { t: 'num', v: String(cnt) },
        steps: ['Total valence electrons: ' + d3[1] + '.', 'With single bonds only, ' + (cnt ? 'the atoms run short of octets, so lone pairs are moved in to make multiple bonds.' : 'every atom already has a full shell, so no multiple bonds are needed.'), 'The structure has <b>' + cnt + '</b> ' + what + ' ' + plural(cnt, 'bond') + '.'],
        hint: 'Start with single bonds and see whether every atom gets an octet.'
      };
    }
    if (kind === 3) {
      var d4 = R.pick(LEWD);
      return {
        q: 'How many lone pairs are in the whole Lewis structure of $' + ft(d4[0]) + '$?' + (d4[0] === 'NO3^-' || d4[0] === 'CO3^2-' || d4[0] === 'NO2^-' ? ' (Use one resonance structure.)' : ''),
        a: { t: 'num', v: String(d4[5]) },
        steps: ['Total valence electrons: ' + d4[1] + ', which is ' + (d4[1] / 2) + ' pairs.', 'Bonding pairs: ' + d4[3] + ' (a double bond is 2 pairs, a triple bond 3).', 'Lone pairs $= ' + (d4[1] / 2) + ' - ' + d4[3] + ' = ' + d4[5] + '$'],
        hint: 'Total pairs minus bonding pairs.'
      };
    }
    var tfs = [
      ['In a Lewis structure of methane, $\\mathrm{CH_4}$, carbon has four bonds and no lone pairs.', true, 'Carbon has 4 valence electrons and shares each with an H: 4 bonds, 8 electrons around carbon.'],
      ['The nitrate ion, $\\mathrm{NO_3^-}$, has 23 valence electrons.', false, 'N 5 + O 3 × 6 = 23, plus 1 for the negative charge: 24.'],
      ['A carbon atom with five bonds is acceptable in a Lewis structure.', false, 'Carbon has only four valence orbitals in its second shell, so it can hold at most four electron pairs: four bonds at most.'],
      ['Hydrogen is never the central atom in a Lewis structure.', true, 'Hydrogen can share only one pair, so it can bond to just one atom.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Count electrons carefully, including charges.' };
  }));

  /* VSEPR data: formula, electron groups on the central atom, lone pairs there, shape, approximate angle (null when it is not a textbook value) */
  var VSD = [
    ['CO2', 2, 0, 'linear', '180°'], ['HCN', 2, 0, 'linear', '180°'], ['BeCl2', 2, 0, 'linear', '180°'], ['BF3', 3, 0, 'trigonal planar', '120°'], ['BCl3', 3, 0, 'trigonal planar', '120°'], ['CH2O', 3, 0, 'trigonal planar', 'about 120°'],
    ['SO3', 3, 0, 'trigonal planar', '120°'], ['NO3^-', 3, 0, 'trigonal planar', '120°'], ['CO3^2-', 3, 0, 'trigonal planar', '120°'], ['SO2', 3, 1, 'bent', 'a little less than 120°'], ['O3', 3, 1, 'bent', 'a little less than 120°'], ['NO2^-', 3, 1, 'bent', 'a little less than 120°'],
    ['CH4', 4, 0, 'tetrahedral', '109.5°'], ['CCl4', 4, 0, 'tetrahedral', '109.5°'], ['SiH4', 4, 0, 'tetrahedral', '109.5°'], ['NH4^+', 4, 0, 'tetrahedral', '109.5°'], ['NH3', 4, 1, 'trigonal pyramidal', 'about 107°'],
    ['PCl3', 4, 1, 'trigonal pyramidal', null], ['NF3', 4, 1, 'trigonal pyramidal', null], ['H3O^+', 4, 1, 'trigonal pyramidal', null], ['H2O', 4, 2, 'bent', 'about 104.5°'], ['H2S', 4, 2, 'bent', null], ['OF2', 4, 2, 'bent', null],
    ['CS2', 2, 0, 'linear', '180°'], ['CF4', 4, 0, 'tetrahedral', '109.5°'], ['CHCl3', 4, 0, 'tetrahedral', null], ['PH3', 4, 1, 'trigonal pyramidal', null], ['PF3', 4, 1, 'trigonal pyramidal', null], ['SCl2', 4, 2, 'bent', null],
    ['NH2^-', 4, 2, 'bent', null], ['CH3Cl', 4, 0, 'tetrahedral', null], ['H2Se', 4, 2, 'bent', null]
  ];
  var SHAPES = ['linear', 'trigonal planar', 'bent', 'tetrahedral', 'trigonal pyramidal'];
  G('chem.vsepr-shapes', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 2 : 4), d = R.pick(VSD);
    var bonded = d[1] - d[2];
    var why = ['Count electron groups around the central atom: each bonded atom is one group (single, double or triple bond alike) and each lone pair is one group. $' + ft(d[0]) + '$ has ' + bonded + ' bonded ' + plural(bonded, 'atom') + ' and ' + d[2] + ' lone ' + plural(d[2], 'pair') + ': ' + d[1] + ' groups.',
      d[1] + ' groups spread out ' + ['', '', 'in a line (180°)', 'in a flat triangle (120°)', 'toward the corners of a tetrahedron (109.5°)'][d[1]] + '.' + (d[2] ? ' The shape names only the atoms, so with ' + d[2] + ' of the groups being lone ' + plural(d[2], 'pair') + ', the shape is ' + d[3] + '.' : '')];
    if (kind === 0) {
      return {
        q: 'What is the shape of $' + ft(d[0]) + '$?',
        a: MCK(SHAPES.map(cap), SHAPES.indexOf(d[3])),
        steps: why.concat(['Shape: <b>' + d[3] + '</b>.']),
        hint: 'Count bonded atoms and lone pairs on the central atom.'
      };
    }
    if (kind === 1) {
      return {
        q: 'How many electron groups (bonded atoms plus lone pairs) surround the central atom in $' + ft(d[0]) + '$?',
        a: { t: 'num', v: String(d[1]) },
        steps: [why[0], 'A double or triple bond counts as just one group, because all its electrons sit in the same region between the two atoms.', 'Answer: <b>' + d[1] + '</b>.'],
        hint: 'A multiple bond counts once.'
      };
    }
    if (kind === 4) {
      return {
        q: 'How many lone pairs are on the central atom of $' + ft(d[0]) + '$?',
        a: { t: 'num', v: String(d[2]) },
        steps: ['$' + ft(d[0]) + '$ has ' + d[1] + ' electron groups on its central atom and ' + bonded + ' bonded ' + plural(bonded, 'atom') + '.', 'The rest are lone pairs: $' + d[1] + ' - ' + bonded + ' = ' + d[2] + '$. That is why it is ' + d[3] + '.'],
        hint: 'Draw the Lewis structure and look at the central atom.'
      };
    }
    if (kind === 2) {
      var dd = R.pick(VSD.filter(function (x) { return x[4] && /^(180|120|109\.5)°$|about (107|104\.5)/.test(x[4]); }));
      var opts = ['180°', '120°', '109.5°', 'about 107°', 'about 104.5°'], ansA = dd[4] === 'about 120°' ? '120°' : dd[4];
      return {
        q: 'Which is closest to the bond angle in $' + ft(dd[0]) + '$?',
        a: MCK(opts, opts.indexOf(ansA)),
        steps: ['$' + ft(dd[0]) + '$ has ' + dd[1] + ' electron groups on the central atom, ' + dd[2] + ' of them lone ' + plural(dd[2], 'pair') + '.', dd[2] ? 'The ideal angle for ' + dd[1] + ' groups is 109.5°, but lone pairs spread out more than bonding pairs and squeeze the bonds closer: ' + dd[4] + '.' : 'With no lone pairs, the angle is the ideal one: ' + dd[4] + '.', 'Answer: <b>' + ansA + '</b>.'],
        hint: 'Start from the ideal angle, then let lone pairs squeeze it.'
      };
    }
    var bank = [
      ['Why is a water molecule bent instead of linear?', 'The two lone pairs on oxygen take up room, so the four electron groups point toward the corners of a tetrahedron', ['Hydrogen atoms repel each other only on one side', 'Oxygen forms a double bond to one hydrogen', 'Water molecules bend when they are liquid']],
      ['Carbon dioxide has two double bonds. How many electron groups does its carbon atom have?', '2', ['4', '3', '6']],
      ['Which molecule has the same shape as ammonia, NH₃?', 'PCl₃', ['BF₃', 'CH₄', 'SO₃']]
    ];
    var b = R.pick(bank);
    return { q: b[0], a: MC(b[1], b[2]), steps: ['Electron groups (bonded atoms and lone pairs, with a multiple bond counting once) push apart as far as they can. The shape names the positions of the atoms only.', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Count groups, then name the shape from the atoms.' };
  }));

  var BPAIRS = [['H', 'Cl'], ['H', 'F'], ['C', 'H'], ['C', 'O'], ['N', 'H'], ['O', 'H'], ['C', 'Cl'], ['Na', 'Cl'], ['K', 'F'], ['Mg', 'O'], ['Cl', 'Cl'], ['C', 'N'], ['H', 'Br'], ['Li', 'F'], ['Ca', 'Cl'], ['C', 'F'], ['Si', 'O'], ['C', 'S'], ['O', 'O'], ['Be', 'Cl'], ['N', 'Cl'], ['P', 'Cl'], ['K', 'Cl'], ['Na', 'O'], ['C', 'C']];
  function dEN(p) { return +abs(ENV[p[0]] - ENV[p[1]]).toFixed(2); }
  function bclass(d) { return d < 0.4 ? 0 : d <= 1.8 ? 1 : 2; }
  var BCL = ['nonpolar covalent', 'polar covalent', 'ionic'];
  G('chem.bond-polarity', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    var good = BPAIRS.filter(function (p) { var d = dEN(p); return abs(d - 0.4) >= 0.1 && abs(d - 1.8) >= 0.1; });
    var p = R.pick(good), d = dEN(p), A = EL[p[0]], B = EL[p[1]];
    var given = '(Electronegativities: ' + p[0] + ' ' + ENV[p[0]].toFixed(2) + (p[0] === p[1] ? '' : ', ' + p[1] + ' ' + ENV[p[1]].toFixed(2)) + '.)';
    if (kind === 0) {
      return {
        q: 'What is the electronegativity difference in the ' + p[0] + '–' + p[1] + ' bond? ' + given,
        a: { t: 'num', v: String(d), tol: 0.005 },
        steps: ['Subtract the smaller electronegativity from the larger.', '$\\Delta EN = ' + Math.max(ENV[p[0]], ENV[p[1]]).toFixed(2) + ' - ' + Math.min(ENV[p[0]], ENV[p[1]]).toFixed(2) + ' = ' + d.toFixed(2) + '$', 'A larger difference means the electrons are shared more unevenly.'],
        hint: 'Larger minus smaller.'
      };
    }
    if (kind === 1) {
      return {
        q: 'Classify the bond between ' + lname(A) + ' and ' + lname(B) + ' using the usual guide (difference below 0.4: nonpolar covalent; 0.4 to 1.8: polar covalent; above 1.8: ionic). ' + given,
        a: MCK(['Nonpolar covalent', 'Polar covalent', 'Ionic'], bclass(d)),
        steps: ['$\\Delta EN = |' + ENV[p[0]].toFixed(2) + ' - ' + ENV[p[1]].toFixed(2) + '| = ' + d.toFixed(2) + '$', 'On the guide, ' + d.toFixed(2) + ' falls in the range for a <b>' + BCL[bclass(d)] + '</b> bond.', 'The guide marks points on a smooth range: real bonds go gradually from even sharing to nearly complete transfer.'],
        hint: 'Find the difference, then place it on the scale.'
      };
    }
    if (kind === 2) {
      var pp = R.pick(good.filter(function (x) { return x[0] !== x[1] && bclass(dEN(x)) === 1; })), neg = ENV[pp[0]] > ENV[pp[1]] ? pp[0] : pp[1];
      return {
        q: 'In the polar ' + pp[0] + '–' + pp[1] + ' bond, which atom carries the partial negative charge, $\\delta^-$? (Electronegativities: ' + pp[0] + ' ' + ENV[pp[0]].toFixed(2) + ', ' + pp[1] + ' ' + ENV[pp[1]].toFixed(2) + '.)',
        a: MCK([cap(lname(EL[pp[0]])), cap(lname(EL[pp[1]])), 'Neither: the charges cancel'], pp.indexOf(neg)),
        steps: ['The more electronegative atom pulls the shared electrons toward itself.', cap(lname(EL[neg])) + ' (' + ENV[neg].toFixed(2) + ') pulls harder, so the electrons spend more time near it: it is $\\delta^-$, and the other atom is $\\delta^+$.'],
        hint: 'Electrons drift toward the higher electronegativity.'
      };
    }
    if (kind === 3) {
      var trio; for (var i = 0; i < 60; i++) { trio = R.sample(good.filter(function (x) { return x[0] !== x[1]; }), 3); var ds = trio.map(dEN).sort(function (a, b) { return a - b; }); if (ds[1] - ds[0] >= 0.2 && ds[2] - ds[1] >= 0.2) break; }
      trio.sort(function (a, b) { return dEN(a) - dEN(b); });
      var lab = function (x) { return x[0] + '–' + x[1]; }, right = trio.map(lab).join(' < ');
      return {
        q: 'Rank these bonds from least polar to most polar: ' + R.shuffle(trio).map(lab).join(', ') + '. (Electronegativities: ' + U.uniq([].concat.apply([], trio)).map(function (s) { return s + ' ' + ENV[s].toFixed(2); }).join(', ') + '.)',
        a: MC(right, [trio.slice().reverse().map(lab).join(' < '), [trio[1], trio[0], trio[2]].map(lab).join(' < '), [trio[0], trio[2], trio[1]].map(lab).join(' < ')]),
        steps: trio.map(function (x) { return lab(x) + ': $\\Delta EN = ' + dEN(x).toFixed(2) + '$'; }).concat(['Bigger difference, more polar: <b>' + right + '</b>.']),
        hint: 'Compute each difference.'
      };
    }
    var tfs = [
      ['A bond with an electronegativity difference of 1.7 is completely covalent, and one with 1.9 is completely ionic.', false, 'Bond character changes smoothly. The cutoffs are a rough guide; bonds near them are partly ionic and partly covalent.'],
      ['In a bond between two identical atoms, such as Cl–Cl, the electrons are shared equally.', true, 'The difference is 0, so neither atom pulls harder.'],
      ['The H–F bond is more polar than the H–Cl bond.', true, 'F (3.98) differs from H (2.20) by 1.78; Cl (3.16) differs by 0.96.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Polarity is a range set by the electronegativity difference.' };
  }));

  /* molecular polarity: formula, polar?, reason; key = the Lewis library key for a picture */
  var MPOL = [
    ['CO2', 0, 'linear: the two C=O dipoles point in opposite directions and cancel', 'CO2'], ['H2O', 1, 'bent: the two O–H dipoles both point partly toward O and add up', 'H2O'],
    ['NH3', 1, 'trigonal pyramidal: the three N–H dipoles all tilt toward N and add up', 'NH3'], ['CH4', 0, 'tetrahedral with four identical C–H bonds, whose small dipoles cancel', 'CH4'],
    ['CCl4', 0, 'tetrahedral with four identical C–Cl bonds: the dipoles cancel', 'CCl4'], ['CH3Cl', 1, 'tetrahedral, but one bond (C–Cl) is much more polar than the others, so the dipoles do not cancel', 'CH3Cl'],
    ['CH2Cl2', 1, 'tetrahedral with two different kinds of bonds, so the dipoles do not cancel', 'CH2Cl2'], ['BF3', 0, 'trigonal planar with three identical B–F bonds: the dipoles cancel', 'BF3'],
    ['BCl3', 0, 'trigonal planar with three identical B–Cl bonds: the dipoles cancel', 'BCl3'], ['HCl', 1, 'a single polar bond with nothing to cancel it', 'HCl'], ['Cl2', 0, 'two identical atoms: the bond itself is nonpolar', 'Cl2'],
    ['N2', 0, 'two identical atoms: the bond itself is nonpolar', 'N2'], ['HCN', 1, 'linear, but the H–C and C≡N dipoles point the same way (toward N) and add up', 'HCN'],
    ['SO2', 1, 'bent (a lone pair on S): the two S=O dipoles do not cancel', 'SO2'], ['SO3', 0, 'trigonal planar with three equal S–O bonds: the dipoles cancel', 'SO3'],
    ['H2S', 1, 'bent: the S–H dipoles do not cancel', 'H2S'], ['PCl3', 1, 'trigonal pyramidal: the P–Cl dipoles do not cancel', 'PCl3'], ['BeCl2', 0, 'linear: the two Be–Cl dipoles cancel', 'BeCl2'],
    ['NF3', 1, 'trigonal pyramidal: the N–F dipoles do not cancel', 'NF3'], ['SiH4', 0, 'tetrahedral with four identical bonds: the dipoles cancel', 'SiH4'], ['CH2O', 1, 'trigonal planar, but the C=O bond is much more polar than the C–H bonds', 'H2CO'], ['HF', 1, 'a single, very polar bond', 'HF']
  ];
  G('chem.molecular-polarity', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 0 : R.int(0, L === 2 ? 2 : 3);
    if (kind === 0) {
      var m = R.pick(MPOL), pic = L === 1 || R.coin();
      return {
        q: 'Is $' + ft(m[0]) + '$ a polar or a nonpolar molecule?' + (pic ? ' The picture shows its shape and bond dipoles.' : ''),
        viz: pic ? { name: 'ch-vsepr', opts: { mol: m[3], mode: 'polarity', quiet: true, dipoles: true } } : undefined,
        a: MCK(['Polar', 'Nonpolar'], m[1] ? 0 : 1),
        steps: ['A molecule is polar when its bond dipoles add up to a net dipole; it is nonpolar when they cancel (or when there are no polar bonds).', '$' + ft(m[0]) + '$ is ' + m[2] + '.', 'So it is <b>' + (m[1] ? 'polar' : 'nonpolar') + '</b>.'],
        hint: 'Look at the shape: do the bond dipoles cancel?'
      };
    }
    if (kind === 1) {
      var pol = R.pick(MPOL.filter(function (x) { return x[1]; })), non = R.sample(MPOL.filter(function (x) { return !x[1]; }), 3), askP = R.coin();
      var right = askP ? pol : non[0], wr = askP ? non : R.sample(MPOL.filter(function (x) { return x[1]; }), 3);
      return {
        q: 'Which of these molecules is ' + (askP ? 'polar' : 'nonpolar') + '?',
        a: MC('$' + ft(right[0]) + '$', wr.map(function (x) { return '$' + ft(x[0]) + '$'; })),
        steps: ['$' + ft(right[0]) + '$ is ' + right[2] + '.', 'The others are ' + (askP ? 'symmetric, so their bond dipoles cancel (or they have no polar bonds).' : 'shaped so that their bond dipoles add up to a net dipole.'), 'Answer: <b>$' + ft(right[0]) + '$</b>.'],
        hint: 'Symmetric shapes with identical outer atoms are nonpolar.'
      };
    }
    if (kind === 2) {
      var tfs = [
        ['$\\mathrm{CO_2}$ is polar because each C=O bond is polar.', false, 'CO₂ is linear, so its two bond dipoles point in opposite directions and cancel. Polar bonds do not always make a polar molecule.'],
        ['A molecule with polar bonds can be nonpolar.', true, 'CO₂, BF₃ and CCl₄ all have polar bonds arranged symmetrically, so the dipoles cancel.'],
        ['Water is polar because its molecule is bent.', true, 'In a bent molecule the two O–H dipoles do not point in opposite directions, so they add to a net dipole.'],
        ['$\\mathrm{CCl_4}$ and $\\mathrm{CH_3Cl}$ have the same shape, so they must both be nonpolar.', false, 'Both are tetrahedral, but CH₃Cl has one C–Cl bond and three C–H bonds, which do not cancel. It is polar.']
      ];
      var t = R.pick(tfs);
      return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Polarity of the molecule depends on shape as well as bonds.' };
    }
    var pairQ = R.pick([
      ['Both $\\mathrm{BF_3}$ and $\\mathrm{NF_3}$ have three polar bonds. Why is $\\mathrm{NF_3}$ polar while $\\mathrm{BF_3}$ is not?', 'NF₃ has a lone pair on N, making it pyramidal so its dipoles add; BF₃ is flat and symmetric, so its dipoles cancel', ['Fluorine is more electronegative when bonded to nitrogen', 'NF₃ has double bonds and BF₃ does not', 'BF₃ is ionic']],
      ['Both $\\mathrm{CO_2}$ and $\\mathrm{SO_2}$ have two polar bonds to oxygen. Why is $\\mathrm{SO_2}$ polar while $\\mathrm{CO_2}$ is not?', 'SO₂ has a lone pair on S that makes it bent, so its dipoles do not cancel; CO₂ is linear', ['Sulfur is more electronegative than oxygen', 'SO₂ is ionic', 'CO₂ has no polar bonds']]
    ]);
    return { q: pairQ[0], a: MC(pairQ[1], pairQ[2]), steps: ['Same kinds of bonds, different shapes: a lone pair on the central atom changes the shape, and the shape decides whether the bond dipoles cancel.', 'Answer: <b>' + pairQ[1] + '</b>.'], hint: 'Draw the Lewis structures and look for lone pairs on the central atom.' };
  }));

  // ======================= 06-forces.js
  // ---------------------------------------------------------------- unit: Forces Between Particles
  var SOLIDS = {
    ionic: ['sodium chloride (table salt)', 'potassium bromide', 'magnesium oxide', 'calcium fluoride'],
    molecular: ['table sugar (sucrose)', 'ice', 'solid iodine', 'dry ice (solid carbon dioxide)', 'paraffin wax'],
    network: ['diamond', 'quartz (silicon dioxide)', 'silicon carbide', 'graphite'],
    metallic: ['copper', 'iron', 'aluminum', 'gold', 'silver']
  };
  var STYPES = ['ionic', 'molecular', 'network covalent', 'metallic'];
  var SKEY = { ionic: 'ionic', molecular: 'molecular', 'network covalent': 'network', metallic: 'metallic' };
  var SPART = {
    ionic: 'positive and negative ions held in a lattice by attractions between opposite charges',
    molecular: 'separate molecules held together only by weak forces between molecules',
    network: 'atoms joined by covalent bonds into one giant network',
    metallic: 'metal cations in a sea of electrons that are free to move'
  };
  var SPROPS = {
    ionic: ['melts at 801 °C, shatters when struck, and conducts electricity only when melted or dissolved in water', 'melts at 2852 °C, is hard but brittle, and does not conduct as a solid but does when melted'],
    molecular: ['melts at 80 °C, is soft and crumbly, and does not conduct electricity as a solid or when melted', 'melts at 44 °C, is soft and waxy, and does not conduct electricity', 'melts at 114 °C, is soft, and does not conduct electricity as a solid or as a liquid'],
    network: ['does not melt below 1600 °C, is extremely hard, does not dissolve in water and does not conduct electricity', 'melts at 1710 °C, is very hard, does not dissolve in water and does not conduct electricity'],
    metallic: ['melts at 1085 °C, is shiny, can be hammered into thin sheets and conducts electricity as a solid', 'melts at 660 °C, bends instead of shattering and conducts electricity as a solid']
  };
  var SWHY = {
    ionic: 'Ions locked in a lattice give a high melting point and brittleness (a hard knock lines up like charges, which repel). Solid ionic compounds do not conduct because the ions cannot move; melted or dissolved, the ions move and carry charge.',
    molecular: 'Only weak forces between molecules have to be overcome to melt it, so the melting point is low. Neutral molecules carry no charge, so it does not conduct.',
    network: 'Melting would mean breaking strong covalent bonds throughout the whole crystal, so the melting point is very high and the solid is very hard. No electrons or ions are free to move.',
    metallic: 'The free-moving electrons carry current and let layers of atoms slide past each other without breaking the bonding, so metals conduct and bend.'
  };
  /* genProp(R, kind): a made-up but realistic property description for an unknown solid of that kind */
  function genProp(R, k) {
    if (k === 'ionic') return 'melts at ' + R.int(62, 280) * 10 + ' °C, ' + R.pick(['is hard but shatters when struck', 'is brittle', 'crumbles into smaller crystals when hammered']) + ', and conducts electricity ' + R.pick(['only when melted or dissolved in water', 'when dissolved in water but not as a solid']);
    if (k === 'molecular') return 'melts at ' + R.int(-40, 180) + ' °C, ' + R.pick(['is soft', 'is soft and crumbly', 'is waxy']) + ', and does not conduct electricity, solid or melted';
    if (k === 'network') return 'melts above ' + R.int(16, 35) * 100 + ' °C, ' + R.pick(['is extremely hard', 'scratches glass', 'is one of the hardest materials known']) + ', does not dissolve in water and does not conduct electricity';
    return 'melts at ' + R.int(30, 160) * 10 + ' °C, ' + R.pick(['is shiny', 'has a metallic shine', 'is gray and shiny']) + ', ' + R.pick(['can be hammered into thin sheets', 'can be drawn into wire', 'bends instead of shattering']) + ' and conducts electricity as a solid';
  }
  G('chem.bond-types-properties', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 2 : 3);
    if (kind === 0) {
      var t = R.pick(STYPES), k = SKEY[t], prop = R.coin() ? R.pick(SPROPS[k]) : genProp(R, k);
      return {
        q: 'An unknown solid ' + prop + '. What kind of solid is it most likely to be?',
        a: MCK(STYPES.map(cap), STYPES.indexOf(t)),
        steps: ['Use the clues: melting point (how strong the forces holding the particles are), hardness or brittleness, and electrical conductivity (whether charged particles can move).', SWHY[k], 'So it is most likely <b>' + t + '</b>: ' + SPART[k] + '.'],
        hint: 'Conductivity is the strongest clue: solid conducts → metal; conducts only when melted → ionic.'
      };
    }
    if (kind === 1) {
      var t1 = R.pick(STYPES), sub = R.pick(SOLIDS[SKEY[t1]]);
      return {
        q: 'What kind of solid is ' + sub + '?',
        a: MCK(STYPES.map(cap), STYPES.indexOf(t1)),
        steps: [cap(sub) + ' is made of ' + SPART[SKEY[t1]] + '.', 'So it is a <b>' + t1 + '</b> solid.'],
        hint: 'What particles is it made of: ions, molecules, a network of atoms, or metal atoms?'
      };
    }
    if (kind === 2) {
      var ask = R.pick([['conducts electricity as a solid', 'metallic'], ['conducts electricity when melted but not as a solid', 'ionic'], ['has the lowest melting point', 'molecular'], ['is the hardest and has the highest melting point', 'network']]);
      var opts = STYPES.map(function (x) { return R.pick(SOLIDS[SKEY[x]]); }), right = opts[STYPES.indexOf(Object.keys(SKEY).filter(function (x) { return SKEY[x] === ask[1]; })[0])];
      if (ask[1] === 'network' && /graphite/.test(right)) right = opts[2] = 'diamond';
      if (ask[1] === 'molecular' && /ice|iodine|sugar/.test(right) === false) right = opts[1] = 'paraffin wax';
      return {
        q: 'Which of these most likely ' + ask[0] + ': ' + opts.join(', ') + '?',
        a: MCK(opts.map(cap), opts.indexOf(right)),
        steps: [opts.map(function (o, i) { return cap(o) + ': ' + STYPES[i]; }).join('; ') + '.', SWHY[ask[1]], 'Answer: <b>' + right + '</b>.'],
        hint: 'Classify each solid first.'
      };
    }
    var tfs = [
      ['A substance with a very high melting point must be ionic.', false, 'Network covalent solids such as diamond and quartz melt even higher than most ionic compounds, and some metals (like tungsten) do too.'],
      ['Solid table salt conducts electricity well.', false, 'In the solid, the ions are locked in place, so nothing carries charge. Melted or dissolved in water, the ions move and it conducts.'],
      ['Metals can be hammered into sheets because their layers of atoms can slide without breaking the metallic bonding.', true, 'The sea of electrons holds the cations together in any position, so layers slide instead of shattering.'],
      ['Ice is a molecular solid.', true, 'Ice is made of H₂O molecules held together by hydrogen bonds between them.']
    ];
    var tf = R.pick(tfs);
    return { q: 'True or false: ' + tf[0], a: TF(tf[1]), steps: [tf[2], 'So the statement is <b>' + (tf[1] ? 'true' : 'false') + '</b>.'], hint: 'Match the property to the particles and forces.' };
  }));

  /* substances: [normal boiling point °C (NIST Chemistry WebBook, as in the kit's ch-imf table), polar, hydrogen bonding, name] */
  var IMFD = {
    H2O: [100.0, 1, 1, 'water'], NH3: [-33.3, 1, 1, 'ammonia'], HF: [19.5, 1, 1, 'hydrogen fluoride'], CH4: [-161.5, 0, 0, 'methane'], C2H6: [-88.6, 0, 0, 'ethane'], C3H8: [-42.1, 0, 0, 'propane'],
    C4H10: [-0.5, 0, 0, 'butane'], C5H12: [36.1, 0, 0, 'pentane'], C6H14: [68.7, 0, 0, 'hexane'], C8H18: [125.6, 0, 0, 'octane'], CH3OH: [64.7, 1, 1, 'methanol'], C2H5OH: [78.3, 1, 1, 'ethanol'],
    CH3OCH3: [-24.8, 1, 0, 'dimethyl ether'], CH3COCH3: [56.1, 1, 0, 'acetone'], CH3F: [-78.4, 1, 0, 'fluoromethane'], CH3Cl: [-24.2, 1, 0, 'chloromethane'], CH2Cl2: [39.6, 1, 0, 'dichloromethane'],
    CHCl3: [61.2, 1, 0, 'chloroform'], CCl4: [76.7, 0, 0, 'carbon tetrachloride'], H2S: [-60.3, 1, 0, 'hydrogen sulfide'], HCl: [-85.0, 1, 0, 'hydrogen chloride'], HBr: [-66.4, 1, 0, 'hydrogen bromide'],
    HI: [-35.4, 1, 0, 'hydrogen iodide'], F2: [-188.1, 0, 0, 'fluorine'], Cl2: [-34.0, 0, 0, 'chlorine'], Br2: [58.8, 0, 0, 'bromine'], I2: [184.4, 0, 0, 'iodine'], N2: [-195.8, 0, 0, 'nitrogen'],
    O2: [-183.0, 0, 0, 'oxygen'], He: [-268.9, 0, 0, 'helium'], Ne: [-246.0, 0, 0, 'neon'], Ar: [-185.8, 0, 0, 'argon'], Kr: [-153.4, 0, 0, 'krypton'], Xe: [-108.1, 0, 0, 'xenon'],
    H2Se: [-41.3, 1, 0, 'hydrogen selenide'], H2Te: [-2.2, 1, 0, 'hydrogen telluride'], SiH4: [-111.9, 0, 0, 'silane'], H2O2: [150.2, 1, 1, 'hydrogen peroxide'], CH3COOH: [117.9, 1, 1, 'acetic acid']
  };
  var IMFK = Object.keys(IMFD);
  function bpT(f) { return String(IMFD[f][0]).replace('-', '−') + ' °C'; }
  var FORCES = ['London dispersion forces', 'Dipole–dipole forces', 'Hydrogen bonds'];
  function nElec(f) { var a = atoms(f), n = 0; Object.keys(a).forEach(function (e) { n += a[e] * EL[e].Z; }); return n; }
  function forcesOf(f) { var d = IMFD[f], v = [0]; if (d[1]) v.push(1); if (d[2]) v.push(2); return v; }
  function strongest(f) { var d = IMFD[f]; return d[2] ? 2 : d[1] ? 1 : 0; }
  function hbWhy(f) {
    var d = IMFD[f]; if (d[2]) return 'It has H atoms bonded directly to ' + (atoms(f).F ? 'F' : atoms(f).O ? 'O' : 'N') + ', and lone pairs on that atom, so its molecules hydrogen-bond to each other.';
    if (atoms(f).H && (atoms(f).O || atoms(f).F || atoms(f).N)) return 'Its H atoms are bonded to carbon, not to N, O or F, so it cannot hydrogen-bond to itself.';
    return 'It has no H atom bonded to N, O or F, so there are no hydrogen bonds.';
  }
  G('chem.intermolecular-forces', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) {
      var f = R.pick(IMFK), d = IMFD[f], v = forcesOf(f);
      return {
        q: 'Which forces act between ' + (/^[A-Z][a-z]?$/.test(f) ? 'atoms' : 'molecules') + ' of ' + d[3] + ', $' + ft(f) + '$? Select all that apply.',
        a: { t: 'mc', choices: FORCES.slice(), v: v, keep: true },
        steps: ['Every molecule (and atom) has London dispersion forces, from brief uneven spreads of its electrons.', d[1] ? cap(d[3]) + ' is polar, so its molecules also attract by dipole–dipole forces.' : cap(d[3]) + ' is nonpolar, so there are no dipole–dipole forces.', hbWhy(f), 'Answer: <b>' + v.map(function (i) { return i ? FORCES[i].toLowerCase() : FORCES[i]; }).join(', ') + '</b>.'],
        hint: 'Check three things: always dispersion; polar → dipole–dipole; H on N, O or F → hydrogen bonds.'
      };
    }
    if (kind === 1) {
      var tricky = R.pick([['CH3F', 0], ['CH3OH', 1], ['CH3OCH3', 0], ['NH3', 1], ['HF', 1], ['HCl', 0], ['H2O', 1], ['CH4', 0], ['C2H5OH', 1], ['CH3COCH3', 0], ['H2S', 0], ['H2O2', 1]]);
      var dd = IMFD[tricky[0]];
      return {
        q: 'Can molecules of ' + dd[3] + ', $' + ft(tricky[0]) + '$, form hydrogen bonds with each other?',
        a: MCK(['Yes', 'No'], tricky[1] ? 0 : 1),
        steps: ['A hydrogen bond needs an H atom bonded directly to N, O or F on one molecule, attracted to a lone pair on N, O or F of another.', hbWhy(tricky[0]), 'Answer: <b>' + (tricky[1] ? 'yes' : 'no') + '</b>.'],
        hint: 'Is any H atom bonded directly to N, O or F?'
      };
    }
    if (kind === 2) {
      var series = R.pick([['F2', 'Cl2', 'Br2', 'I2'], ['He', 'Ne', 'Ar', 'Kr', 'Xe'], ['CH4', 'C2H6', 'C3H8', 'C4H10', 'C5H12', 'C6H14', 'C8H18']]), two = R.sample(series, 2);
      var big = nElec(two[0]) > nElec(two[1]) ? two[0] : two[1];
      return {
        q: 'Which has stronger London dispersion forces between its particles: ' + IMFD[two[0]][3] + ' ($' + ft(two[0]) + '$) or ' + IMFD[two[1]][3] + ' ($' + ft(two[1]) + '$)?',
        a: MCK([cap(IMFD[two[0]][3]), cap(IMFD[two[1]][3])], two.indexOf(big)),
        steps: ['Dispersion forces come from momentary uneven spreads of electrons. More electrons, spread over a larger particle, shift more easily and attract more strongly.', cap(IMFD[two[0]][3]) + ' has ' + nElec(two[0]) + ' electrons per ' + (/^[A-Z][a-z]?$/.test(two[0]) ? 'atom' : 'molecule') + '; ' + IMFD[two[1]][3] + ' has ' + nElec(two[1]) + '.', 'So <b>' + IMFD[big][3] + '</b> has the stronger dispersion forces (and the higher boiling point: ' + bpT(big) + ' against ' + bpT(two[0] === big ? two[1] : two[0]) + ').'],
        hint: 'More electrons, stronger dispersion forces.'
      };
    }
    if (kind === 3) {
      var bank = [
        ['When water boils, what is overcome?', 'The attractions between water molecules', ['The O–H bonds inside each water molecule', 'The bonds between hydrogen and hydrogen', 'The attraction between the nucleus and the electrons'],
          'Boiling separates whole H₂O molecules from each other; each molecule stays H₂O. Vaporizing water takes about 41 kJ/mol, while breaking the two O–H bonds in a mole of water would take over 900 kJ.'],
        ['When iodine, $\\mathrm{I_2}$, turns from a solid into a gas, what is overcome?', 'Dispersion forces between I₂ molecules', ['The covalent bond inside each I₂ molecule', 'Ionic bonds between iodine ions', 'Hydrogen bonds'],
          'The I–I bond stays intact; the molecules just move apart. Iodine vapor is still made of I₂ molecules.'],
        ['Which is stronger: the covalent bonds inside a water molecule, or the hydrogen bonds between water molecules?', 'The covalent bonds inside the molecule', ['The hydrogen bonds between molecules', 'They are equal', 'It depends on the temperature'],
          'Hydrogen bonds are the strongest of the forces between molecules, but they are still much weaker than the covalent bonds inside a molecule.']
      ];
      var b = R.pick(bank);
      return { q: b[0], a: MC(b[1], b[2]), steps: [b[3], 'Answer: <b>' + b[1] + '</b>.'], hint: 'Forces between molecules are much weaker than bonds within them.' };
    }
    var tfs = [
      ['Boiling water breaks the O–H bonds inside the water molecules.', false, 'Boiling only pulls whole H₂O molecules away from each other. The steam is still H₂O.'],
      ['Nonpolar molecules attract each other only by London dispersion forces.', true, 'With no permanent dipole, the only attraction is the dispersion force from momentary dipoles.'],
      ['Fluoromethane, $\\mathrm{CH_3F}$, forms hydrogen bonds because it contains fluorine.', false, 'Its H atoms are bonded to carbon, not to fluorine, so they are not positive enough to hydrogen-bond.'],
      ['A hydrogen bond is a covalent bond between two hydrogen atoms.', false, 'It is an attraction between molecules: an H bonded to N, O or F on one molecule is drawn to a lone pair on N, O or F of another.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Intermolecular forces act between molecules, not inside them.' };
  }));

  /* a pair whose boiling points differ by at least 15 °C, with a reason that agrees with the data */
  var CURATED = [
    ['C8H18', 'H2O', 'Octane is nonpolar, but it is a large molecule with 66 electrons, so its dispersion forces are stronger than water’s hydrogen bonds plus dispersion.'],
    ['I2', 'H2O', 'Iodine molecules have 106 electrons each, so their dispersion forces are very strong, stronger than the hydrogen bonding in water.'],
    ['CCl4', 'CHCl3', 'Carbon tetrachloride is nonpolar, but it has more electrons (74 against 58), so its dispersion forces win over chloroform’s dipole–dipole forces.'],
    ['CCl4', 'CH3Cl', 'Nonpolar CCl₄ has far more electrons (74 against 26) than polar CH₃Cl, so its dispersion forces are much stronger.'],
    ['H2O', 'H2S', 'Water hydrogen-bonds and hydrogen sulfide does not. H₂S has more electrons (18 against 10), but for molecules this small, hydrogen bonding wins.'],
    ['HF', 'HCl', 'HF hydrogen-bonds; HCl does not. HCl has more electrons, but hydrogen bonding wins for such small molecules.'],
    ['NH3', 'CH4', 'Ammonia hydrogen-bonds; methane, with the same number of electrons (10), has only dispersion forces.'],
    ['C2H5OH', 'CH3OCH3', 'Same formula, C₂H₆O, and the same number of electrons, but ethanol has an O–H group and hydrogen-bonds; dimethyl ether cannot.'],
    ['CH3OH', 'C2H6', 'Similar numbers of electrons (18 each), but methanol hydrogen-bonds and ethane has only dispersion forces.'],
    ['Br2', 'Cl2', 'Both nonpolar; bromine has more electrons, so stronger dispersion forces.'],
    ['CH3COCH3', 'C4H10', 'Acetone and butane have similar numbers of electrons (32 and 34), but acetone is polar and adds dipole–dipole forces.']
  ];
  var KINDT = ['London dispersion forces only', 'dipole–dipole and dispersion forces', 'hydrogen bonds as well as dipole–dipole and dispersion forces'];
  function bpPair(R) {
    if (R.chance(0.45)) { var c = R.pick(CURATED); return { hi: c[0], lo: c[1], why: c[2] }; }
    for (var i = 0; i < 200; i++) {
      var ab = R.sample(IMFK, 2), a = ab[0], b = ab[1], A = IMFD[a], B = IMFD[b];
      if (abs(A[0] - B[0]) < 15) continue;
      var hi = A[0] > B[0] ? a : b, lo = hi === a ? b : a, sh = strongest(hi), sl = strongest(lo), eh = nElec(hi), el = nElec(lo);
      if (sh === sl && eh > el) return { hi: hi, lo: lo, why: 'Both have the same kinds of forces (' + KINDT[sh] + '), so compare size: ' + IMFD[hi][3] + ' has more electrons (' + eh + ' against ' + el + '), so its dispersion forces are stronger.' };
      if (sh > sl && abs(eh - el) <= 0.35 * Math.max(eh, el)) return { hi: hi, lo: lo, why: 'They have similar numbers of electrons (' + eh + ' and ' + el + '), but ' + IMFD[hi][3] + (sh === 2 ? ' hydrogen-bonds' : ' is polar and adds dipole–dipole forces') + ', while ' + IMFD[lo][3] + (sl === 1 ? ' has only dipole–dipole and dispersion forces' : ' has only dispersion forces') + '.' };
      if (sh > sl && eh >= el) return { hi: hi, lo: lo, why: cap(IMFD[hi][3]) + ' has both the stronger kind of force (' + (sh === 2 ? 'hydrogen bonding' : 'dipole–dipole') + ') and at least as many electrons (' + eh + ' against ' + el + ').' };
    }
    return { hi: 'H2O', lo: 'H2S', why: CURATED[4][2] };
  }
  G('chem.imf-properties', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? 0 : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0 || kind === 2) {
      var p = bpPair(R), two = R.shuffle([p.hi, p.lo]), askVP = kind === 2;
      var ans = askVP ? p.lo : p.hi;
      return {
        q: askVP ? 'At the same temperature, which liquid has the higher vapor pressure: ' + IMFD[two[0]][3] + ' ($' + ft(two[0]) + '$) or ' + IMFD[two[1]][3] + ' ($' + ft(two[1]) + '$)?' : 'Which has the higher boiling point: ' + IMFD[two[0]][3] + ' ($' + ft(two[0]) + '$) or ' + IMFD[two[1]][3] + ' ($' + ft(two[1]) + '$)?',
        a: MCK([cap(IMFD[two[0]][3]), cap(IMFD[two[1]][3])], two.indexOf(ans)),
        steps: [p.why, 'Stronger forces between molecules mean ' + IMFD[p.hi][3] + ' needs more energy to escape into the gas: a higher boiling point and a lower vapor pressure.', (askVP ? 'So <b>' + IMFD[p.lo][3] + '</b> has the higher vapor pressure.' : 'So <b>' + IMFD[p.hi][3] + '</b> boils higher.') + ' (Measured boiling points: ' + IMFD[p.hi][3] + ' ' + bpT(p.hi) + ', ' + IMFD[p.lo][3] + ' ' + bpT(p.lo) + '.)'],
        hint: 'First compare the kinds of forces, then the sizes (numbers of electrons).'
      };
    }
    if (kind === 1) {
      var series = R.pick([['F2', 'Cl2', 'Br2', 'I2'], ['He', 'Ne', 'Ar', 'Kr', 'Xe'], ['CH4', 'C2H6', 'C3H8', 'C4H10', 'C5H12', 'C6H14', 'C8H18'], ['HCl', 'HBr', 'HI'], ['H2S', 'H2Se', 'H2Te']]);
      var three = R.sample(series, 3).sort(function (a, b) { return IMFD[a][0] - IMFD[b][0]; }), lab = function (arr) { return arr.map(function (x) { return x; }).join(' < '); };
      var right = three.map(function (x) { return '$' + ft(x) + '$'; }).join(' < ');
      var w = [three.slice().reverse(), [three[1], three[0], three[2]], [three[0], three[2], three[1]]].map(function (arr) { return arr.map(function (x) { return '$' + ft(x) + '$'; }).join(' < '); });
      return {
        q: 'Rank from lowest to highest boiling point: ' + R.shuffle(three).map(function (x) { return IMFD[x][3] + ' ($' + ft(x) + '$)'; }).join(', ') + '.',
        a: MC(right, w),
        steps: ['These have the same kinds of forces, so size decides: more electrons, stronger dispersion forces.', three.map(function (x) { return '$' + ft(x) + '$: ' + nElec(x) + ' electrons (boils at ' + bpT(x) + ')'; }).join('; ') + '.', 'Lowest to highest: <b>' + right + '</b>.'],
        hint: 'Same kind of forces: compare numbers of electrons.'
      };
    }
    if (kind === 3) {
      var bank = [
        ['Water boils at 100 °C, but hydrogen sulfide, H₂S, boils at −60 °C. Why?', 'Water molecules hydrogen-bond to each other; H₂S molecules cannot', ['H₂S has fewer electrons than water', 'Water molecules are heavier', 'The O–H bonds must break when water boils']],
        ['Pentane, C₅H₁₂, boils at 36 °C and propane, C₃H₈, at −42 °C. Why?', 'Pentane has more electrons and a larger surface, so stronger dispersion forces', ['Pentane is polar and propane is not', 'Pentane molecules are too heavy to lift into the gas', 'Pentane hydrogen-bonds']],
        ['Which liquid evaporates fastest at room temperature?', 'The one with the weakest forces between its molecules', ['The one with the strongest forces between its molecules', 'The one with the largest molecules', 'The one with the most polar molecules']]
      ];
      var b = R.pick(bank);
      return { q: b[0], a: MC(b[1], b[2]), steps: ['To boil or evaporate, molecules must break free of the attractions of their neighbors. Stronger attractions (hydrogen bonds, or the large dispersion forces of big molecules) mean a higher boiling point and slower evaporation.', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Ask which forces the molecules must overcome.' };
    }
    var tfs = [
      ['The more polar a substance is, the higher its boiling point, whatever the size of its molecules.', false, 'Size matters too. Nonpolar carbon tetrachloride (77 °C) boils higher than polar chloromethane (−24 °C) because its many electrons give strong dispersion forces.'],
      ['A liquid with a high vapor pressure at room temperature has weak forces between its molecules.', true, 'Weak attractions let many molecules escape into the gas.'],
      ['Ethanol boils higher than dimethyl ether, even though both are C₂H₆O.', true, 'Ethanol has an O–H group and hydrogen-bonds; dimethyl ether does not.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Compare kinds of forces and sizes.' };
  }));

  // ======================= 07-mole.js
  // ---------------------------------------------------------------- unit: The Mole
  var NA = 6.022e23;
  function sciT(x, n) { return tn(x, n || 4); }
  function partWord(f) { return /^[A-Z][a-z]?$/.test(f) ? 'atoms' : (/^(NaCl|KCl|CaCl2|MgO|CaCO3|NaOH|KBr)$/.test(f) ? 'formula units' : 'molecules'); }
  var NAMES = { H2O: 'water', CO2: 'carbon dioxide', NH3: 'ammonia', CH4: 'methane', O2: 'oxygen gas', N2: 'nitrogen gas', NaCl: 'sodium chloride', C6H12O6: 'glucose', C12H22O11: 'sucrose',
    H2SO4: 'sulfuric acid', CaCO3: 'calcium carbonate', C2H5OH: 'ethanol', Fe: 'iron', Cu: 'copper', Al: 'aluminum', He: 'helium', C: 'carbon', Ag: 'silver', Au: 'gold', Na: 'sodium', S: 'sulfur',
    NaOH: 'sodium hydroxide', KCl: 'potassium chloride', MgO: 'magnesium oxide', CaCl2: 'calcium chloride', Al2O3: 'aluminum oxide', Fe2O3: 'iron(III) oxide', NaHCO3: 'sodium hydrogen carbonate (baking soda)',
    C3H8: 'propane', CH3COOH: 'acetic acid', HCl: 'hydrogen chloride', SO2: 'sulfur dioxide', NH4NO3: 'ammonium nitrate', KNO3: 'potassium nitrate', CuSO4: 'copper(II) sulfate', '(NH4)2SO4': 'ammonium sulfate',
    'Ca(NO3)2': 'calcium nitrate', 'Al2(SO4)3': 'aluminum sulfate', 'Mg(OH)2': 'magnesium hydroxide', 'Ca3(PO4)2': 'calcium phosphate', 'Fe(OH)3': 'iron(III) hydroxide', '(NH4)3PO4': 'ammonium phosphate',
    'Ba(OH)2': 'barium hydroxide', 'CuSO4·5H2O': 'copper(II) sulfate pentahydrate', 'Pb(NO3)2': 'lead(II) nitrate', KMnO4: 'potassium permanganate', C8H18: 'octane', 'CO(NH2)2': 'urea', H2O2: 'hydrogen peroxide' };
  function nm(f) { return NAMES[f] || ''; }
  function named(f) { return nm(f) ? nm(f) + ', $' + ft(f) + '$' : '$' + ft(f) + '$'; }
  function namedC(f) { return named(f) + (nm(f) ? ',' : ''); }
  function mmSteps(f) {
    var a = atoms(f), terms = Object.keys(a).map(function (e) { return (a[e] === 1 ? '' : a[e] + '(') + amT(e) + (a[e] === 1 ? '' : ')'); });
    return '$' + terms.join(' + ') + ' = ' + mm(f).toFixed(2) + '\\ \\text{g/mol}$';
  }

  G('chem.mole-concept', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0) {
      var f = R.pick(['Fe', 'Cu', 'He', 'C', 'Ag', 'H2O', 'CO2', 'NH3', 'O2', 'CH4']), n = L === 1 ? R.pick([0.500, 2.00, 3.00, 1.50, 0.250, 5.00, 4.00]) : R.real(0.12, 9.5, 2), N = n * NA;
      return {
        q: 'How many ' + partWord(f) + ' are in $' + tk(n, 3) + '\\ \\text{mol}$ of ' + named(f) + '?',
        a: A(N, 3, 0.01),
        steps: ['One mole is $6.022 \\times 10^{23}$ particles, so multiply the moles by that number.', '$' + tk(n, 3) + '\\ \\text{mol} \\times 6.022 \\times 10^{23}\\ \\dfrac{\\text{' + partWord(f) + '}}{\\text{mol}} = ' + sciT(N, 3) + '$ ' + partWord(f) + '.'],
        hint: 'Moles × 6.022 × 10²³.'
      };
    }
    if (kind === 1) {
      var f1 = R.pick(['Fe', 'Al', 'Na', 'H2O', 'CO2', 'C6H12O6', 'S']), n1 = L === 1 ? R.pick([0.500, 2.00, 3.00, 0.250, 1.50, 10.0]) : R.real(0.05, 8, 2), N1 = +(n1 * NA).toPrecision(4);
      return {
        q: 'A sample of ' + namedC(f1) + ' contains $' + sciT(N1, 4) + '$ ' + partWord(f1) + '. How many moles is that?',
        a: A(N1 / NA, 3, 0.01), unit: 'mol',
        steps: ['Divide the number of particles by the number in one mole.', '$\\dfrac{' + sciT(N1, 4) + '}{6.022 \\times 10^{23}\\ \\text{per mol}} = ' + tk(N1 / NA, 3) + '\\ \\text{mol}$'],
        hint: 'Particles ÷ 6.022 × 10²³.'
      };
    }
    if (kind === 2) {
      var e = R.pick(['C', 'O', 'Na', 'Mg', 'Al', 'S', 'Ca', 'Fe', 'Cu', 'Ag', 'Au', 'Pb']), m1 = R.pick([1, 1, 2, 0.5, 3]);
      return {
        q: 'The atomic mass of ' + lname(EL[e]) + ' is $' + amT(e) + '\\ \\text{u}$. What is the mass of $' + tk(m1, 3) + '\\ \\text{mol}$ of ' + lname(EL[e]) + ' atoms?',
        a: A(m1 * AM[e], 4, 0.005), unit: 'g',
        steps: ['The mole was chosen so that one mole of atoms has a mass in grams equal to the atomic mass in u: 1 mol of ' + lname(EL[e]) + ' is ' + amT(e) + ' g.', m1 === 1 ? 'So the mass is <b>' + amT(e) + ' g</b>.' : '$' + tk(m1, 3) + ' \\times ' + amT(e) + '\\ \\text{g} = ' + tn(m1 * AM[e], 4) + '\\ \\text{g}$'],
        hint: 'One mole of atoms weighs its atomic mass, in grams.'
      };
    }
    if (kind === 3) {
      var cmp = R.pick(['CO2', 'H2O', 'C6H12O6', 'NH3', 'H2SO4', 'CH4', 'Al2O3', 'CaCl2', 'C3H8']), at = atoms(cmp), el = R.pick(Object.keys(at)), n3 = L === 2 ? R.pick([2.0, 0.50, 3.0, 1.5, 4.0]) : R.real(0.2, 5, 1);
      var ans = n3 * at[el];
      return {
        q: 'How many moles of ' + lname(EL[el]) + ' atoms are in $' + tv(n3) + '\\ \\text{mol}$ of $' + ft(cmp) + '$?',
        a: A(ans, 3, 0.01), unit: 'mol',
        steps: ['Each ' + (partWord(cmp) === 'formula units' ? 'formula unit' : 'molecule') + ' of $' + ft(cmp) + '$ contains ' + at[el] + ' ' + el + ' ' + plural(at[el], 'atom') + ', so each mole of it contains ' + at[el] + ' mol of ' + el + ' atoms.', '$' + tv(n3) + '\\ \\text{mol} \\times ' + at[el] + ' = ' + tv(fx(ans)) + '\\ \\text{mol}$ of ' + el + ' atoms.'],
        hint: 'Use the subscript as a mole ratio.'
      };
    }
    var tfs = [
      ['One mole of iron and one mole of aluminum have the same mass.', false, 'They contain the same number of atoms, but iron atoms are heavier: 1 mol Fe is 55.85 g and 1 mol Al is 26.98 g.'],
      ['One mole of water and one mole of carbon dioxide contain the same number of molecules.', true, 'A mole is a count: 6.022 × 10²³ of anything.'],
      ['A mole is a very small unit of mass, like a milligram.', false, 'A mole is a count of particles, like a dozen. Its mass depends on what you are counting.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'A mole is a number of particles.' };
  }));

  var MM1 = ['H2O', 'CO2', 'NaCl', 'NH3', 'CH4', 'O2', 'HCl', 'KCl', 'MgO', 'CaO', 'N2', 'SO2', 'CO', 'H2S', 'KBr', 'NaF', 'CaCl2', 'MgCl2', 'Cl2', 'NO2', 'SO3', 'LiCl', 'HF', 'CuO', 'ZnO'];
  var MM2 = ['C6H12O6', 'H2SO4', 'CaCO3', 'Al2O3', 'C2H5OH', 'NaHCO3', 'KMnO4', 'Fe2O3', 'C3H8', 'CH3COOH', 'C12H22O11', 'C8H18', 'NH4NO3', 'KNO3', 'Na2CO3', 'H3PO4', 'HNO3', 'C4H10', 'Na2SO4', 'K2Cr2O7', 'C2H4', 'AgNO3', 'CaSO4', 'Fe3O4', 'NaOH'];
  var MM3 = ['Ca(NO3)2', '(NH4)2SO4', 'Al2(SO4)3', 'Mg(OH)2', 'Ca3(PO4)2', 'Fe(OH)3', '(NH4)3PO4', 'Ba(OH)2', 'CuSO4·5H2O', 'Pb(NO3)2', 'CO(NH2)2', 'Al(OH)3', 'Ca(OH)2', 'Mg3(PO4)2', '(NH4)2CO3', 'Fe2(SO4)3', 'Cu(NO3)2', 'Zn(NO3)2', 'MgSO4·7H2O', 'CaCl2·2H2O', 'Al(NO3)3'];
  G('chem.molar-mass', W(function (R, ctx) {
    var L = lvl(ctx), f = R.pick(L === 1 ? MM1 : L === 2 ? MM2 : MM3.concat(MM2.slice(0, 4))), a = atoms(f), M = mm(f);
    var counts = Object.keys(a).map(function (e) { return e + ': ' + a[e] + ' × ' + amT(e) + ' = ' + tv(fx(a[e] * AM[e])); });
    var paren = /\(/.test(f) ? 'The subscript after the parentheses multiplies every atom inside them. ' : '', hyd = /·/.test(f) ? 'The number in front of H₂O counts whole water molecules per formula unit. ' : '';
    if (L >= 2 && R.chance(0.3) && Object.keys(a).length > 1) { // the mass of one element in a mole of the compound
      var e = R.pick(Object.keys(a).filter(function (x) { return a[x] > 1; }).concat(Object.keys(a)));
      return {
        q: 'How many grams of ' + lname(EL[e]) + ' are in one mole of ' + named(f) + '? (Atomic mass of ' + e + ': ' + amT(e) + '.)',
        a: { t: 'num', v: String(fx(a[e] * AM[e])), rtol: 0.003 }, unit: 'g',
        steps: [paren + hyd + 'One mole of the compound contains ' + a[e] + ' mol of ' + e + ' atoms' + (/×/.test(countSteps(f.replace(/·.*/, ''), e)) || (/·/.test(f) && atoms(f.split('·')[1])[e]) ? ' (' + (countSteps(f.replace(/·.*/, ''), e) || '0') + (/·/.test(f) && atoms(f.split('·')[1])[e] ? ', plus ' + atoms(f.split('·')[1])[e] + ' in the water' : '') + ')' : '') + '.', '$' + a[e] + ' \\times ' + amT(e) + '\\ \\text{g} = ' + tv(fx(a[e] * AM[e])) + '\\ \\text{g}$'],
        hint: 'Count the atoms of that element in the formula, then multiply by its atomic mass.'
      };
    }
    return {
      q: (R.coin() ? 'Find the molar mass of ' + named(f) + '.' : 'What is the mass of one mole of ' + named(f) + '?') + ' (Atomic masses: ' + massList(f) + '.)',
      a: { t: 'num', v: M.toFixed(2), rtol: 0.003 }, unit: 'g/mol',
      steps: [paren + hyd + 'Count the atoms of each element in one formula: ' + Object.keys(a).map(function (e) { return a[e] + ' ' + e; }).join(', ') + '.', counts.join('; ') + '.', 'Add: $' + Object.keys(a).map(function (e) { return tv(fx(a[e] * AM[e])); }).join(' + ') + ' = ' + M.toFixed(2) + '\\ \\text{g/mol}$'],
      hint: 'Multiply each atomic mass by how many of that atom are in the formula, then add.'
    };
  }));

  var MMC = ['H2O', 'CO2', 'NaCl', 'NH3', 'CH4', 'C6H12O6', 'H2SO4', 'CaCO3', 'C2H5OH', 'NaOH', 'O2', 'Fe2O3', 'C3H8', 'NaHCO3', 'Al2O3', 'KCl', 'C12H22O11', 'MgO'];
  G('chem.mass-mole-conversions', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 3 : 5);
    var f = R.pick(MMC), M = mm(f), giveM = L === 1, mtxt = giveM ? ' (Molar mass: $' + M.toFixed(2) + '\\ \\text{g/mol}$.)' : ' (Atomic masses: ' + massList(f) + '.)';
    var mstep = giveM ? 'The molar mass is $' + M.toFixed(2) + '\\ \\text{g/mol}$.' : 'Molar mass: ' + mmSteps(f) + '.';
    if (kind === 0) {
      var n0 = L === 1 ? R.pick([0.5, 2, 3, 0.25, 1.5, 4]) : R.real(0.1, 6, 3), m0 = L === 1 ? +(M * n0).toFixed(2) : R.real(5, 250, 1);
      var ans0 = m0 / M;
      return {
        q: 'How many moles are in $' + tv(m0) + '\\ \\text{g}$ of ' + named(f) + '?' + mtxt,
        a: A(ans0, 3, 0.01), unit: 'mol',
        steps: [mstep, 'Grams to moles: <b>divide</b> by the molar mass, so grams cancel.', '$' + tv(m0) + '\\ \\text{g} \\times \\dfrac{1\\ \\text{mol}}{' + M.toFixed(2) + '\\ \\text{g}} = ' + tk(ans0, 3) + '\\ \\text{mol}$'],
        hint: 'Divide the mass by the molar mass.'
      };
    }
    if (kind === 1) {
      var n1 = L === 1 ? R.pick([0.5, 2, 3, 0.25, 1.5, 0.1]) : R.real(0.05, 5, 3), m1 = n1 * M;
      return {
        q: 'What is the mass of $' + tv(n1) + '\\ \\text{mol}$ of ' + named(f) + '?' + mtxt,
        a: A(m1, 3, 0.01), unit: 'g',
        steps: [mstep, 'Moles to grams: <b>multiply</b> by the molar mass, so moles cancel.', '$' + tv(n1) + '\\ \\text{mol} \\times \\dfrac{' + M.toFixed(2) + '\\ \\text{g}}{1\\ \\text{mol}} = ' + tn(m1, 3) + '\\ \\text{g}$'],
        hint: 'Multiply the moles by the molar mass.'
      };
    }
    if (kind === 2) {
      var m2 = R.real(2, 100, 1), n2 = m2 / M, N2 = n2 * NA;
      return {
        q: 'How many ' + partWord(f) + ' are in $' + tv(m2) + '\\ \\text{g}$ of ' + named(f) + '?' + mtxt,
        a: A(N2, 3, 0.01),
        steps: [mstep, 'Grams to moles: $' + tv(m2) + '\\ \\text{g} \\div ' + M.toFixed(2) + '\\ \\text{g/mol} = ' + tn(n2, 4) + '\\ \\text{mol}$', 'Moles to ' + partWord(f) + ': $' + tn(n2, 4) + '\\ \\text{mol} \\times 6.022 \\times 10^{23} = ' + sciT(N2, 3) + '$'],
        hint: 'Go through moles: grams → moles → particles.'
      };
    }
    if (kind === 3) {
      var N3 = +(R.real(1.1, 9.9, 2) * Math.pow(10, R.int(21, 24))).toPrecision(3), n3 = N3 / NA, m3 = n3 * M;
      return {
        q: 'What is the mass of $' + sciT(N3, 3) + '$ ' + partWord(f) + ' of ' + named(f) + '?' + mtxt,
        a: A(m3, 3, 0.01), unit: 'g',
        steps: [mstep, 'Particles to moles: $' + sciT(N3, 3) + ' \\div 6.022 \\times 10^{23} = ' + tn(n3, 4) + '\\ \\text{mol}$', 'Moles to grams: $' + tn(n3, 4) + '\\ \\text{mol} \\times ' + M.toFixed(2) + '\\ \\text{g/mol} = ' + tn(m3, 3) + '\\ \\text{g}$'],
        hint: 'Particles → moles → grams.'
      };
    }
    if (kind === 4) {
      var f4 = R.pick(['H2O', 'CO2', 'NH3', 'CH4', 'C6H12O6', 'C3H8', 'C2H5OH', 'H2SO4']), M4 = mm(f4), a4 = atoms(f4), e4 = R.pick(Object.keys(a4)), m4 = R.real(5, 90, 1), n4 = m4 / M4, N4 = n4 * a4[e4] * NA;
      return {
        q: 'How many ' + lname(EL[e4]) + ' atoms are in $' + tv(m4) + '\\ \\text{g}$ of ' + named(f4) + '? (Atomic masses: ' + massList(f4) + '.)',
        a: A(N4, 3, 0.01),
        steps: ['Molar mass: ' + mmSteps(f4) + '.', 'Moles of molecules: $' + tv(m4) + ' \\div ' + M4.toFixed(2) + ' = ' + tn(n4, 4) + '\\ \\text{mol}$', 'Each molecule has ' + a4[e4] + ' ' + e4 + ' ' + plural(a4[e4], 'atom') + ': $' + tn(n4, 4) + ' \\times ' + a4[e4] + ' = ' + tn(n4 * a4[e4], 4) + '\\ \\text{mol}$ of ' + e4 + ' atoms.', 'Atoms: $' + tn(n4 * a4[e4], 4) + ' \\times 6.022 \\times 10^{23} = ' + sciT(N4, 3) + '$'],
        hint: 'Find moles of molecules, then use the subscript, then Avogadro’s number.'
      };
    }
    var bank = [
      ['To change a mass in grams into moles, you…', 'divide by the molar mass', ['multiply by the molar mass', 'multiply by 6.022 × 10²³', 'divide by 6.022 × 10²³']],
      ['Which has more molecules: 10 g of hydrogen gas, H₂ (2.02 g/mol), or 10 g of oxygen gas, O₂ (32.00 g/mol)?', '10 g of H₂', ['10 g of O₂', 'They have the same number', 'There is no way to tell']],
      ['One mole of water, H₂O, contains how many moles of hydrogen atoms?', '2', ['1', '3', '6.022 × 10²³']]
    ];
    var b = R.pick(bank);
    return { q: b[0], a: MC(b[1], b[2]), steps: ['Molar mass is grams per mole, so grams ÷ (grams per mole) = moles. The same mass of a lighter substance holds more moles, and so more particles.', 'Answer: <b>' + b[1] + '</b>.'], hint: 'Watch the units: g ÷ (g/mol) = mol.' };
  }));

  var PC = ['H2O', 'CO2', 'NH3', 'CH4', 'NaCl', 'Fe2O3', 'C6H12O6', 'CaCO3', 'H2SO4', 'NaHCO3', 'Al2O3', 'NH4NO3', 'C2H5OH', 'KNO3', 'MgO', 'SO2', 'CuSO4', '(NH4)2SO4', 'C3H8', 'CO(NH2)2'];
  G('chem.percent-composition', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.pick([0, 0, 2]) : R.int(0, L === 2 ? 3 : 4);
    if (kind === 0 || kind === 1) {
      var f = R.pick(L === 1 ? PC.slice(0, 8) : PC), a = atoms(f), e = R.pick(Object.keys(a)), M = mm(f), part = a[e] * AM[e], pct = part / M * 100;
      if (kind === 0) {
        return {
          q: 'What percent of the mass of ' + namedC(f) + ' is ' + lname(EL[e]) + '? (Atomic masses: ' + massList(f) + '.)',
          a: { t: 'num', v: sv(pct, 4), pct: true, rtol: 0.005 },
          steps: ['Molar mass: ' + mmSteps(f) + '.', 'Mass of ' + e + ' in one mole: $' + (a[e] === 1 ? amT(e) + '\\ \\text{g}' : a[e] + ' \\times ' + amT(e) + ' = ' + tv(fx(part)) + '\\ \\text{g}') + '$', '$\\%\\,' + e + ' = \\dfrac{' + tv(fx(part)) + '}{' + M.toFixed(2) + '} \\times 100\\% = ' + tk(pct, 4) + '\\%$'],
          hint: 'Divide the mass of the element in one mole by the molar mass.'
        };
      }
      var ms = R.real(10, 200, 1), me = ms * part / M;
      return {
        q: 'How many grams of ' + lname(EL[e]) + ' are in $' + tv(ms) + '\\ \\text{g}$ of ' + named(f) + '? (Atomic masses: ' + massList(f) + '.)',
        a: A(me, 3, 0.01), unit: 'g',
        steps: ['Fraction of the mass that is ' + e + ': $\\dfrac{' + tv(fx(part)) + '}{' + M.toFixed(2) + '} = ' + tn(part / M, 4) + '$ (that is ' + tk(pct, 3) + '%).', '$' + tv(ms) + '\\ \\text{g} \\times ' + tn(part / M, 4) + ' = ' + tn(me, 3) + '\\ \\text{g}$ of ' + lname(EL[e]) + '.'],
        hint: 'Find the element’s mass fraction, then multiply by the sample mass.'
      };
    }
    if (kind === 2) {
      var tot = R.real(2, 20, 2), frac = R.real(0.15, 0.85, 2), part2 = +(tot * frac).toFixed(2), p2 = part2 / tot * 100, el2 = R.pick(['carbon', 'copper', 'oxygen', 'sulfur', 'iron', 'chlorine']);
      return {
        q: 'Breaking down a $' + tot.toFixed(2) + '\\ \\text{g}$ sample of a compound gives $' + part2.toFixed(2) + '\\ \\text{g}$ of ' + el2 + '. What is the percent ' + el2 + ' by mass?',
        a: { t: 'num', v: sv(p2, 4), pct: true, rtol: 0.005 },
        steps: ['Percent by mass compares the part with the whole.', '$\\dfrac{' + part2.toFixed(2) + '\\ \\text{g}}{' + tot.toFixed(2) + '\\ \\text{g}} \\times 100\\% = ' + tk(p2, 4) + '\\%$'],
        hint: 'Part ÷ whole × 100.'
      };
    }
    if (kind === 3) {
      var f3 = R.pick(['H2O', 'CH4', 'NH3', 'C3H8', 'H2O2']), a3 = atoms(f3), M3 = mm(f3), hp = a3.H * AM.H / M3 * 100, atomp = a3.H / (Object.keys(a3).reduce(function (s, k) { return s + a3[k]; }, 0)) * 100;
      return {
        q: 'In ' + named(f3) + ', ' + a3.H + ' of every ' + Object.keys(a3).reduce(function (s0, k) { return s0 + a3[k]; }, 0) + ' atoms are hydrogen. About what percent of its <b>mass</b> is hydrogen? (H 1.01, ' + Object.keys(a3).filter(function (k) { return k !== 'H'; }).map(function (k) { return k + ' ' + amT(k); }).join(', ') + '.)',
        a: MC(tk(hp, 3) + '%', [tk(atomp, 3) + '%', tk(100 - hp, 3) + '%', tk(a3.H * AM.H, 3) + '%']),
        steps: ['Percent by mass uses masses, not numbers of atoms. Hydrogen atoms are many but very light.', 'Mass of H per mole: $' + a3.H + ' \\times 1.01 = ' + tv(fx(a3.H * AM.H)) + '\\ \\text{g}$ out of $' + M3.toFixed(2) + '\\ \\text{g}$.', '$\\dfrac{' + tv(fx(a3.H * AM.H)) + '}{' + M3.toFixed(2) + '} \\times 100\\% = ' + tk(hp, 3) + '\\%$, not ' + tk(atomp, 3) + '% (the share of atoms).'],
        hint: 'Use the mass of the hydrogen, not the count of its atoms.'
      };
    }
    var ferts = ['NH3', 'NH4NO3', '(NH4)2SO4', 'CO(NH2)2'], pN = ferts.map(function (x) { return atoms(x).N * AM.N / mm(x) * 100; }), best = 0;
    pN.forEach(function (p, i) { if (p > pN[best]) best = i; });
    var lab = function (x) { return cap(nm(x)) + ' ($' + ft(x) + '$)'; };
    return {
      q: 'Farmers compare nitrogen fertilizers by their percent nitrogen. Which of these has the highest percent nitrogen by mass? (H 1.01, C 12.01, N 14.01, O 16.00, S 32.07.)',
      a: MCK(ferts.map(lab), best),
      steps: ferts.map(function (x, i) { return lab(x) + ': $\\dfrac{' + atoms(x).N + ' \\times 14.01}{' + mm(x).toFixed(2) + '} \\times 100\\% = ' + tk(pN[i], 3) + '\\%$'; }).concat(['Highest: <b>' + nm(ferts[best]) + '</b>.']),
      hint: 'Find the percent nitrogen in each.'
    };
  }));

  /* empirical formulas: [formula in standard order] */
  var EF1 = ['CH4', 'NO2', 'SO3', 'Cu2O', 'Na2O', 'CaCl2', 'MgCl2', 'SO2', 'H2S', 'CO2', 'NH3', 'K2O', 'CuO', 'MgO', 'CH2', 'FeS2'];
  var EF2 = ['Fe2O3', 'Al2O3', 'N2O3', 'Fe3O4', 'C3H4', 'P2O5', 'N2O5', 'C3H8', 'Cr2O3', 'C3H5', 'C4H5', 'Mn2O7'];
  var EF3 = ['CH2O', 'C2H6O', 'C3H4O3', 'C2H4O', 'K2Cr2O7', 'Na2SO4', 'C3H6O', 'CaCO3', 'C7H6O2', 'C9H8O4', 'C2H3O2', 'KClO3'];
  function elOrder(f) { return f.match(/[A-Z][a-z]?/g).filter(function (x, i, a) { return a.indexOf(x) === i; }); }
  /* solveEmp(pcts {el: percent}): the whole-number formula and the working */
  function solveEmp(pc) {
    var els = Object.keys(pc), mol = {}, mn = Infinity;
    els.forEach(function (e) { mol[e] = pc[e] / AM[e]; mn = Math.min(mn, mol[e]); });
    var r = {}; els.forEach(function (e) { r[e] = mol[e] / mn; });
    for (var k = 1; k <= 8; k++) {
      var ok = els.every(function (e) { var x = r[e] * k; return abs(x - Math.round(x)) < 0.1; });
      if (ok) { var c = {}; els.forEach(function (e) { c[e] = Math.round(r[e] * k); }); return { mol: mol, r: r, k: k, c: c }; }
    }
    return null;
  }
  function empProblem(R, f, useMass) {
    var a = atoms(f), els = elOrder(f), M = mm(f), pc = {};
    els.forEach(function (e) { pc[e] = +(a[e] * AM[e] / M * 100).toFixed(2); });
    var sum = els.reduce(function (s, e) { return s + pc[e]; }, 0); pc[els[els.length - 1]] = +(pc[els[els.length - 1]] + 100 - sum).toFixed(2);
    var tot = useMass ? R.real(1.5, 9.5, 2) : 100, given = {};
    els.forEach(function (e) { given[e] = useMass ? +(pc[e] / 100 * tot).toFixed(3) : pc[e]; });
    var sol = solveEmp(given); if (!sol) return null;
    var same = els.every(function (e) { return sol.c[e] === a[e]; }); if (!same) return null;
    return { f: f, els: els, given: given, tot: tot, sol: sol };
  }
  G('chem.empirical-formula', W(function (R, ctx) {
    var L = lvl(ctx), P = null, guard = 0, useMass = L >= 2 && R.chance(0.4);
    while (!P && guard++ < 30) P = empProblem(R, R.pick(L === 1 ? EF1 : L === 2 ? EF2.concat(EF1.slice(0, 4)) : EF3.concat(EF2.slice(0, 4))), useMass);
    if (!P) P = empProblem(R, 'Fe2O3', false);
    var els = P.els, s = P.sol;
    var give = useMass ? 'A ' + tk(P.tot, 3) + ' g sample of a compound contains ' + U.list(els.map(function (e) { return '$' + tv(P.given[e]) + '\\ \\text{g}$ of ' + lname(EL[e]); })) : 'A compound is ' + U.list(els.map(function (e) { return P.given[e].toFixed(2) + '% ' + lname(EL[e]); })) + ' by mass';
    var steps = [useMass ? 'Use the masses as they are.' : 'Pretend you have 100 g, so each percent becomes grams: ' + els.map(function (e) { return P.given[e].toFixed(2) + ' g ' + e; }).join(', ') + '.',
      'Grams to moles: ' + els.map(function (e) { return '$\\mathrm{' + e + '}: \\dfrac{' + (useMass ? tv(P.given[e]) : P.given[e].toFixed(2)) + '}{' + amT(e) + '} = ' + tn(s.mol[e], 4) + '\\ \\text{mol}$'; }).join('; '),
      'Divide each by the smallest: ' + els.map(function (e) { return e + ' ' + tn(s.r[e], 3); }).join(', ') + '.'];
    if (s.k > 1) steps.push('These are not all whole numbers, and rounding a value like 1.5 or 1.33 would change the formula. Multiply all of them by ' + s.k + ': ' + els.map(function (e) { return e + ' ' + tn(s.r[e] * s.k, 3) + ' ≈ ' + s.c[e]; }).join(', ') + '.');
    steps.push('Empirical formula: <b>$' + ft(P.f) + '$</b>');
    return {
      q: give + '. Find its empirical formula. (Atomic masses: ' + els.map(function (e) { return e + ' ' + amT(e); }).join(', ') + '.)',
      a: { t: 'formula', v: orders(atoms(P.f)).sort(function (x, y) { return x === P.f ? -1 : y === P.f ? 1 : 0; }) },
      steps: steps,
      hint: 'Convert to moles first, then divide by the smallest number of moles.'
    };
  }));

  /* [empirical formula, molecular formula, name] */
  var MF = [['CH2O', 'C6H12O6', 'glucose'], ['CH2O', 'C2H4O2', 'acetic acid'], ['CH', 'C6H6', 'benzene'], ['CH', 'C2H2', 'acetylene'], ['CH', 'C8H8', 'styrene'], ['CH2', 'C2H4', 'ethylene'],
    ['CH2', 'C3H6', 'propene'], ['CH2', 'C6H12', 'cyclohexane'], ['NO2', 'N2O4', 'dinitrogen tetroxide'], ['P2O5', 'P4O10', 'tetraphosphorus decoxide'], ['C2H5', 'C4H10', 'butane'],
    ['C3H4O3', 'C6H8O6', 'vitamin C (ascorbic acid)'], ['C5H4', 'C10H8', 'naphthalene'], ['HO', 'H2O2', 'hydrogen peroxide'], ['C4H5N2O', 'C8H10N4O2', 'caffeine'], ['CH3O', 'C2H6O2', 'ethylene glycol'],
    ['C2H3', 'C4H6', 'butadiene'], ['C3H8O', 'C3H8O', 'propanol'], ['CH2', 'C5H10', 'cyclopentane'], ['C2H4O', 'C4H8O2', 'ethyl acetate'], ['CH2O', 'C3H6O3', 'lactic acid'],
    ['C3H7', 'C6H14', 'hexane'], ['C4H9', 'C8H18', 'octane'], ['CH3', 'C2H6', 'ethane'], ['NH2', 'N2H4', 'hydrazine'], ['CH2O', 'C5H10O5', 'ribose'], ['BH3', 'B2H6', 'diborane'], ['CH2', 'C4H8', 'butene']];
  G('chem.molecular-formula', W(function (R, ctx) {
    var L = lvl(ctx), kind = L === 1 ? R.int(0, 1) : R.int(0, L === 2 ? 2 : 4), d = R.pick(MF.filter(function (x) { return x[2]; }));
    var Me = mm(d[0]), Mm = mm(d[1]), n = Math.round(Mm / Me), Mshow = Mm.toFixed(2);
    var accept = orders(atoms(d[1])).sort(function (x, y) { return x === d[1] ? -1 : y === d[1] ? 1 : 0; });
    var stepsN = ['Molar mass of the empirical formula $' + ft(d[0]) + '$: ' + mmSteps(d[0]) + '.', '$n = \\dfrac{' + Mshow + '}{' + Me.toFixed(2) + '} = ' + tk(Mm / Me, 3) + '$, so $n = ' + n + '$.'];
    if (kind === 0) {
      return {
        q: 'A compound has the empirical formula $' + ft(d[0]) + '$ and a molar mass of $' + Mshow + '\\ \\text{g/mol}$. By what whole number $n$ must you multiply the empirical formula to get the molecular formula? (Atomic masses: ' + massList(d[0]) + '.)',
        a: { t: 'num', v: String(n), form: 'int' },
        steps: stepsN.concat([n === 1 ? 'Here $n = 1$: the empirical formula is the molecular formula.' : 'The molecule holds ' + n + ' empirical-formula units.']),
        hint: 'Divide the molar mass by the empirical formula’s mass.'
      };
    }
    if (kind === 1 || kind === 2) {
      var pre = '';
      if (kind === 2) { var a = atoms(d[1]), els = elOrder(d[1]); pre = 'A compound is ' + U.list(els.map(function (e) { return tk(a[e] * AM[e] / Mm * 100, 4) + '% ' + lname(EL[e]); })) + ' by mass, and its molar mass is $' + Mshow + '\\ \\text{g/mol}$.'; }
      var steps = kind === 2 ? ['First the empirical formula: from 100 g, convert each percent to moles and divide by the smallest. That gives $' + ft(d[0]) + '$.'].concat(stepsN) : stepsN.slice();
      steps.push('Multiply every subscript in $' + ft(d[0]) + '$ by ' + n + ': <b>$' + ft(d[1]) + '$</b>' + (d[2] ? ' (' + d[2] + ')' : '') + '.');
      return {
        q: (kind === 2 ? pre : 'A compound has the empirical formula $' + ft(d[0]) + '$ and a molar mass of $' + Mshow + '\\ \\text{g/mol}$.') + ' What is its molecular formula? (Atomic masses: ' + massList(d[1]) + '.)',
        a: { t: 'formula', v: accept },
        steps: steps,
        hint: 'Find how many empirical-formula units fit in the molar mass.'
      };
    }
    if (kind === 4) {
      var d4 = R.pick(MF.filter(function (x) { return x[0] !== x[1] && x[2]; })), aa = atoms(d4[1]), g = 0;
      Object.keys(aa).forEach(function (e) { g = gcd2(g, aa[e]); });
      return {
        q: 'The molecular formula of ' + d4[2] + ' is $' + ft(d4[1]) + '$. What is its empirical formula?',
        a: { t: 'formula', v: orders(atoms(d4[0])).sort(function (x, y) { return x === d4[0] ? -1 : y === d4[0] ? 1 : 0; }) },
        steps: ['The empirical formula is the simplest whole-number ratio of atoms.', 'The subscripts ' + Object.keys(aa).map(function (e) { return aa[e]; }).join(', ') + ' share the largest common factor ' + g + '. Divide each by ' + g + ': <b>$' + ft(d4[0]) + '$</b>.'],
        hint: 'Divide every subscript by their greatest common factor.'
      };
    }
    var tfs = [
      ['The empirical formula of a compound is always its real molecular formula.', false, 'The empirical formula is only the simplest ratio. Glucose has the empirical formula CH₂O but the molecular formula C₆H₁₂O₆.'],
      ['Benzene ($\\mathrm{C_6H_6}$) and acetylene ($\\mathrm{C_2H_2}$) have the same empirical formula.', true, 'Both reduce to CH: the same 1 : 1 ratio, different numbers of atoms per molecule.'],
      ['To find a molecular formula you need the molar mass as well as the percent composition.', true, 'Percent composition gives only the ratio; the molar mass tells how many of those units are in one molecule.']
    ];
    var t = R.pick(tfs);
    return { q: 'True or false: ' + t[0], a: TF(t[1]), steps: [t[2], 'So the statement is <b>' + (t[1] ? 'true' : 'false') + '</b>.'], hint: 'Empirical = simplest ratio; molecular = actual numbers.' };
  }));

})(window.MathLadder);

/* ---- part B ---- */
/* Chemistry Ladder generators: Chemistry (course key chem), PART B: units reactions, stoichiometry, gases, solutions,
   acids-bases, energy, rates-equilibrium and nuclear (41 topics). Built from the source parts in /tmp/work_chem_B/gen/
   (concatenated in order) and merged with part A by /tmp/merge_parts.js.

   Conventions (Chemistry Ladder overview): atomic masses to two decimals (IUPAC via NIST), stated in each problem that
   needs them; R = 0.08206 L·atm/(mol·K) or 8.314 L·kPa/(mol·K); 1 atm = 101.325 kPa = 760 mmHg; K = °C + 273.15
   (273 when a problem gives whole degrees); STP = 0 °C and 1 atm, 22.4 L/mol; Kw = 1.0 × 10⁻¹⁴ at 25 °C;
   c(water) = 4.184 J/(g·°C). Numeric answers carry `unit` and `rtol` (0.01 unless a longer chain needs 0.02); the shown
   answer is rounded to 3 significant figures. Every problem also carries `chk`, the setup in machine-readable form, so
   the node test can recompute each answer by an independent route. The runner ignores it. Helpers stay inside this IIFE. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var T = ML.T, U = ML.util, M = Math;

  // ------------------------------------------------------------------ text helpers
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
        var vis = tex.replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\mathrm\{([^}]*)\}/g, '$1').replace(/\\(left|right|displaystyle|dfrac|frac|tfrac|big|Big|text|mathrm|operatorname)\b/g, '').replace(/\\(log|ln)\b/g, 'xxx').replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}\s^_]/g, '').length;
        if (vis > limit) { out += '$$' + tex + '$$'; i = k + 1; if (s[i] === '.' || s[i] === ',') i++; continue; }
        out += '$' + tex + '$'; i = k + 1; continue;
      }
      out += c; i++;
    }
    return out;
  }
  // "a $8.0 g" -> "an $8.0 g" (numbers read aloud starting with a vowel sound)
  function article(s) { return typeof s !== 'string' ? s : s.replace(/(^|[\s(>])(A|a) (\$(?:8|1[18](?![\d.,{])))/g, '$1$2n $3'); }
  function G(id, fn) {
    ML.gen(id, function (R, ctx) {
      var pr = fn(R, ctx);
      if (pr && typeof pr === 'object') {
        pr.q = wideMath(article(pr.q)); if (Array.isArray(pr.steps)) pr.steps = pr.steps.map(function (x) { return wideMath(article(x)); }); if (pr.hint) pr.hint = wideMath(pr.hint);
        if (pr.a && pr.a.t === 'mc') pr.a.choices = pr.a.choices.map(function (x) { return wideMath(x, 44); });
        if (pr.a && pr.a.t === 'multi') pr.a.parts.forEach(function (p) { if (p.a && p.a.t === 'mc') p.a.choices = p.a.choices.map(function (x) { return wideMath(x, 44); }); });
      }
      return pr;
    });
  }
  function lv(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }

  // ------------------------------------------------------------------ numbers
  function fix(x) { return Number(Number(x).toPrecision(12)) + 0; }
  function sgf(x, n) { if (x === 0 || !isFinite(x)) return x; var e = M.floor(M.log10(M.abs(x))); var f = M.pow(10, n - 1 - e); return fix(M.round(x * f) / f); }
  function rnd(x, dp) { return U.round(x, dp); }
  function plainNum(x) { x = fix(x); var s = String(x); if (/e/.test(s)) s = ML.Q.from(s).toDec(30).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return s; }
  // the value for an answer spec: n significant figures; scientific form a*10^k outside 0.001 … 10^6
  function sfStr(x, n) {
    n = n || 3; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(y / M.pow(10, e)); return plainNum(m) + '*10^' + e; }
    return plainNum(y);
  }
  // TeX for a computed number with n significant figures (×10^k outside 0.001 … 10^5), trailing zeros kept to n figures
  function fx(x, n) {
    n = n || 3; if (!isFinite(x)) return '\\infty'; var y = sgf(x, n); if (y === 0) return '0';
    var e = M.floor(M.log10(M.abs(y)) + 1e-12);
    if (e >= 5 || e <= -4) { var m = fix(y / M.pow(10, e)); return m.toFixed(M.max(0, n - 1)) + ' \\times 10^{' + e + '}'; }
    var dp = M.max(0, n - 1 - e), s = y.toFixed(dp);
    return M.abs(y) >= 10000 ? T.commas(Number(s)).replace(/,/g, '{,}') : s;
  }
  // TeX for a given (exact) number: 2.5 -> "2.5", 1.0e-5 -> "1.0 \times 10^{-5}", 12000 -> "12{,}000"; keep: decimals to show
  function gx(x, keep) {
    x = fix(x); if (x === 0) return '0';
    var e = M.floor(M.log10(M.abs(x)) + 1e-12);
    if (e >= 6 || e <= -4) { var m = fix(x / M.pow(10, e)); return (keep != null ? m.toFixed(keep) : T.num(m)) + ' \\times 10^{' + e + '}'; }
    var s = keep != null ? x.toFixed(keep) : T.num(x);
    return M.abs(x) >= 10000 ? s.replace(/^(-?\d+)/, function (w) { return T.commas(Number(w)).replace(/,/g, '{,}'); }) : s;
  }
  function d2(x) { return x.toFixed(2); }

  // ------------------------------------------------------------------ units: [plain (for p.unit), TeX]
  var UN = {
    g: ['g', '\\text{g}'], kg: ['kg', '\\text{kg}'], mg: ['mg', '\\text{mg}'], mol: ['mol', '\\text{mol}'], gmol: ['g/mol', '\\text{g/mol}'],
    L: ['L', '\\text{L}'], mL: ['mL', '\\text{mL}'], M: ['M', '\\text{M}'], molL: ['mol/L', '\\text{mol/L}'],
    atm: ['atm', '\\text{atm}'], kPa: ['kPa', '\\text{kPa}'], mmHg: ['mmHg', '\\text{mmHg}'], K: ['K', '\\text{K}'], C: ['°C', '^\\circ\\text{C}'],
    J: ['J', '\\text{J}'], kJ: ['kJ', '\\text{kJ}'], kJmol: ['kJ/mol', '\\text{kJ/mol}'], Jg: ['J/(g·°C)', '\\text{J/(g·°C)}'],
    pct: ['%', '\\%'], s: ['s', '\\text{s}'], min: ['min', '\\text{min}'], h: ['hours', '\\text{hours}'], d: ['days', '\\text{days}'], y: ['years', '\\text{years}'],
    cm2: ['cm²', '\\text{cm}^2'], cm: ['cm', '\\text{cm}'], none: ['', '']
  };
  function ut(k) { return (UN[k] || [k, '\\text{' + k + '}'])[1]; }
  function up(k) { return (UN[k] || [k])[0]; }
  function sp(k) { return k === 'C' || k === 'pct' || k === 'none' ? '' : '\\ '; }
  function qx(x, k, n) { return fx(x, n) + sp(k) + ut(k); }         // a computed quantity
  function qg(x, k, keep) { return gx(x, keep) + sp(k) + ut(k); }    // a given quantity

  // ------------------------------------------------------------------ answers and problems
  function ans(x, rtol, n) { return { t: 'num', v: sfStr(x, n || 3), rtol: rtol || 0.01 }; }
  function exact(v) { return { t: 'num', v: String(v) }; }
  // an answer that is exact (no rounding in the canonical value), accepted within rtol (default 0.5%) so rounded forms pass
  function ansX(x, rtol) { return { t: 'num', v: plainNum(x), rtol: rtol || 0.005 }; }
  function pctAns(x, rtol) { return { t: 'num', v: sfStr(x, 3), pct: true, rtol: rtol || 0.01 }; }
  function mc(correct, wrongs) { return U.mc(correct, U.uniq(wrongs.filter(function (w) { return w !== correct; })), 4); }
  function mcAll(choices, correct, keep) { var a = { t: 'mc', choices: choices, v: correct }; if (keep) a.keep = true; return a; }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function formula(v) { return { t: 'formula', v: Array.isArray(v) ? v : [v] }; }
  function multi(parts) { return { t: 'multi', parts: parts.map(function (p) { var o = { label: p[0], a: p[1] }; if (p[2]) o.unit = up(p[2]); return o; }) }; }
  // P(q, a, steps, hint, unitKey, chk, viz)
  function nolint(list, p) { p.nolint = list; return p; }
  function P(q, a, steps, hint, unit, chk, viz) {
    var p = { q: q, a: a, steps: steps };
    if (hint) p.hint = hint;
    if (unit && unit !== 'none' && a.t === 'num' && !a.pct) p.unit = up(unit);
    if (chk) p.chk = chk;
    if (viz) p.viz = viz;
    return p;
  }

  // ------------------------------------------------------------------ chemistry: formulas, masses, equations
  // atomic masses to two decimals (IUPAC standard atomic weights as published by NIST, abridged)
  var AM = { H: 1.01, He: 4.00, Li: 6.94, C: 12.01, N: 14.01, O: 16.00, F: 19.00, Ne: 20.18, Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.07, Cl: 35.45,
    Ar: 39.95, K: 39.10, Ca: 40.08, Cr: 52.00, Mn: 54.94, Fe: 55.85, Ni: 58.69, Cu: 63.55, Zn: 65.38, Br: 79.90, Sr: 87.62, Ag: 107.87, Sn: 118.71, I: 126.90,
    Ba: 137.33, Au: 196.97, Hg: 200.59, Pb: 207.2 };
  // parse 'Ca(NO3)2', 'CuSO4·5H2O', 'SO4^2-', 'NaCl(aq)' -> { atoms: { Ca: 1, N: 2, O: 6 }, charge }
  function parseF(f) {
    var s = String(f), charge = 0, m = /\^(\d*)([+-])$/.exec(s);
    if (m) { charge = (m[1] ? +m[1] : 1) * (m[2] === '-' ? -1 : 1); s = s.slice(0, m.index); }
    s = s.replace(/\((s|l|g|aq)\)$/, '');
    var atoms = {};
    s.split(/[·*]/).forEach(function (part) {
      var k = 1, lead = /^(\d+)(.*)$/.exec(part); if (lead) { k = +lead[1]; part = lead[2]; }
      var i = 0;
      function seq() {
        var out = {};
        while (i < part.length && part[i] !== ')' && part[i] !== ']') {
          var piece;
          if (part[i] === '(' || part[i] === '[') { i++; piece = seq(); i++; }
          else { var mm = /^[A-Z][a-z]?/.exec(part.slice(i)); if (!mm) throw new Error('bad formula ' + f); i += mm[0].length; piece = {}; piece[mm[0]] = 1; }
          var d = /^\d+/.exec(part.slice(i)), kk = d ? +d[0] : 1; if (d) i += d[0].length;
          for (var e in piece) out[e] = (out[e] || 0) + kk * piece[e];
        }
        return out;
      }
      var a = seq(); for (var e in a) atoms[e] = (atoms[e] || 0) + k * a[e];
    });
    return { atoms: atoms, charge: charge };
  }
  // molar mass from the two-decimal atomic masses, rounded to 2 decimals (what a learner gets adding the given masses)
  function mm(f) { var a = parseF(f).atoms, s = 0; for (var e in a) { if (!AM[e]) throw new Error('no atomic mass for ' + e); s += AM[e] * a[e]; } return rnd(s, 2); }
  // TeX of a formula: 'Ca(NO3)2' -> '\mathrm{Ca}(\mathrm{NO}_{3})_{2}', 'SO4^2-' -> '\mathrm{SO}_{4}^{2-}'
  function fT(f) {
    var s = String(f), ch = '', st = '', m = /\^(\d*[+-])$/.exec(s);
    if (m) { ch = '^{' + m[1] + '}'; s = s.slice(0, m.index); }
    var ms = /\((s|l|g|aq)\)$/.exec(s); if (ms) { st = '(\\mathrm{' + ms[1] + '})'; s = s.slice(0, ms.index); }
    var out = s.split('·').map(function (p) {
      var lead = /^\d+/.exec(p), body = lead ? p.slice(lead[0].length) : p, t = '';
      // ("NaN" is split so the answer spec never contains the letters NaN, which check-gen reads as a bad number)
      body.replace(/([A-Za-z]+)|(\d+)|([()[\]])/g, function (w, letters, dig, br) { if (letters) t += '\\mathrm{' + letters.replace(/NaN/g, 'Na}\\mathrm{N') + '}'; else if (dig) t += '_{' + dig + '}'; else t += br; return w; });
      return (lead ? lead[0] : '') + t;
    }).join(' \\cdot ');
    return out + ch + st;
  }
  // parse '2H2 + O2 -> 2H2O' (or '<=>') -> { L: [{ c, f }], R: [{ c, f }], rev }
  function parseEq(s) {
    var rev = /<=>/.test(s), sides = s.split(/->|<=>|→/);
    function side(t) { return t.trim().split(/\s+\+\s+/).map(function (x) { var m = /^(\d+)\s*(.+)$/.exec(x.trim()); return m ? { c: +m[1], f: m[2] } : { c: 1, f: x.trim() }; }); }
    return { L: side(sides[0]), R: side(sides[1]), rev: rev };
  }
  function termT(t, showOne) { return (t.c !== 1 || showOne ? t.c : '') + fT(t.f); }
  function eqT(e, opts) {
    opts = opts || {}; if (typeof e === 'string') e = parseEq(e);
    var arrow = e.rev ? ' \\rightleftharpoons ' : ' \\to ';
    function side(list) { return list.map(function (t) { return opts.skeleton ? fT(t.f) : termT(t, opts.ones); }).join(' + '); }
    return side(e.L) + arrow + side(e.R);
  }
  // atoms on one side of an equation with coefficients
  function sideAtoms(list) { var out = {}; list.forEach(function (t) { var a = parseF(t.f).atoms; for (var e in a) out[e] = (out[e] || 0) + t.c * a[e]; }); return out; }
  function coefOf(e, f) { var all = e.L.concat(e.R); for (var i = 0; i < all.length; i++) if (all[i].f === f) return all[i].c; return null; }
  var NAMES = { H2: 'hydrogen', O2: 'oxygen', H2O: 'water', N2: 'nitrogen', NH3: 'ammonia', CH4: 'methane', CO2: 'carbon dioxide', C3H8: 'propane', C4H10: 'butane',
    KClO3: 'potassium chlorate', KCl: 'potassium chloride', CaCO3: 'calcium carbonate', CaO: 'calcium oxide', Fe: 'iron', Fe2O3: 'iron(III) oxide', Al: 'aluminum',
    Cl2: 'chlorine', AlCl3: 'aluminum chloride', Na: 'sodium', NaCl: 'sodium chloride', CO: 'carbon monoxide', H2O2: 'hydrogen peroxide', Zn: 'zinc',
    HCl: 'hydrochloric acid', ZnCl2: 'zinc chloride', C6H12O6: 'glucose', Mg: 'magnesium', MgO: 'magnesium oxide', C2H5OH: 'ethanol', Al2O3: 'aluminum oxide',
    Cu: 'copper', CuO: 'copper(II) oxide', S: 'sulfur', SO2: 'sulfur dioxide', SO3: 'sulfur trioxide', NaOH: 'sodium hydroxide', H2SO4: 'sulfuric acid',
    HNO3: 'nitric acid', KOH: 'potassium hydroxide', 'Ca(OH)2': 'calcium hydroxide', NO: 'nitrogen monoxide', NO2: 'nitrogen dioxide', C2H6: 'ethane',
    C8H18: 'octane', Li: 'lithium', Li2O: 'lithium oxide', Ag: 'silver', AgNO3: 'silver nitrate', AgCl: 'silver chloride', NaHCO3: 'sodium bicarbonate',
    Na2CO3: 'sodium carbonate', 'Mg(OH)2': 'magnesium hydroxide', MgCl2: 'magnesium chloride', K: 'potassium', KBr: 'potassium bromide', Br2: 'bromine',
    I2: 'iodine', HI: 'hydrogen iodide', HBr: 'hydrogen bromide', PCl3: 'phosphorus trichloride', PCl5: 'phosphorus pentachloride', N2O4: 'dinitrogen tetroxide',
    CH3OH: 'methanol', He: 'helium', Ne: 'neon', Ar: 'argon', Xe: 'xenon' };
  function nm(f) { return NAMES[f] || f; }
  function fq(f) { return '$' + fT(f) + '$'; }                      // a formula in text
  function nf(f) { return (NAMES[f] ? NAMES[f] + ' ' : '') + '(' + fq(f) + ')'; } // "water ($H_2O$)"
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function ratioT(a, b) { var g = gcd(a, b); return (a / g) + ' : ' + (b / g); }
  // mole-ratio factor in TeX: (b mol B / a mol A)
  function moleFactor(cb, fb, ca, fa) { return '\\dfrac{' + cb + '\\ \\text{mol}\\ ' + fT(fb) + '}{' + ca + '\\ \\text{mol}\\ ' + fT(fa) + '}'; }
  function massFactor(Mf, f, inv) { return inv ? '\\dfrac{' + d2(Mf) + '\\ \\text{g}\\ ' + fT(f) + '}{1\\ \\text{mol}\\ ' + fT(f) + '}' : '\\dfrac{1\\ \\text{mol}\\ ' + fT(f) + '}{' + d2(Mf) + '\\ \\text{g}\\ ' + fT(f) + '}'; }
  function massList(fs) { var seen = {}, out = []; fs.forEach(function (f) { if (seen[f]) return; seen[f] = 1; out.push('$' + fT(f) + '$ ' + d2(mm(f)) + ' g/mol'); }); return 'Molar masses: ' + out.join(', ') + '.'; }


  // ================================================================== UNIT 8: CHEMICAL REACTIONS
  // ---------------------------------------------------------------- chem.conservation-of-mass
  // mass-balance setups: reactions with real stoichiometry; masses come from moles and the two-decimal molar masses
  var CM_SETUPS = [
    { eq: 'CaCO3 -> CaO + CO2', give: 'CaCO3', known: ['CaO'], ask: 'CO2', open: true,
      text: function (m) { return 'A student heats $' + m.CaCO3 + '\\ \\text{g}$ of calcium carbonate (' + fq('CaCO3') + ') in an open dish until it has all broken down into calcium oxide (' + fq('CaO') + ') and carbon dioxide gas, which escapes. The solid left behind has a mass of $' + m.CaO + '\\ \\text{g}$. What mass of carbon dioxide left the dish?'; } },
    { eq: '2Mg + O2 -> 2MgO', give: 'Mg', known: [], askProduct: 'MgO', ask: 'O2',
      text: function (m) { return 'A $' + m.Mg + '\\ \\text{g}$ strip of magnesium burns completely in air, and all of the white powder that forms, magnesium oxide (' + fq('MgO') + '), is collected. It has a mass of $' + m.MgO + '\\ \\text{g}$. What mass of oxygen from the air combined with the magnesium?'; } },
    { eq: '2H2O2 -> 2H2O + O2', give: 'H2O2', known: ['H2O'], ask: 'O2',
      text: function (m) { return 'In a closed flask, $' + m.H2O2 + '\\ \\text{g}$ of hydrogen peroxide (' + fq('H2O2') + ') breaks down completely into water and oxygen gas. The water has a mass of $' + m.H2O + '\\ \\text{g}$. What mass of oxygen gas formed?'; } },
    { eq: '4Fe + 3O2 -> 2Fe2O3', give: 'Fe', known: [], askProduct: 'Fe2O3', ask: 'O2',
      text: function (m) { return 'A $' + m.Fe + '\\ \\text{g}$ pad of iron wool rusts completely to iron(III) oxide (' + fq('Fe2O3') + '), and all of the rust is kept. The rust has a mass of $' + m.Fe2O3 + '\\ \\text{g}$. What mass of oxygen joined the iron?'; } },
    { eq: '2NaHCO3 -> Na2CO3 + H2O + CO2', give: 'NaHCO3', known: ['Na2CO3', 'H2O'], ask: 'CO2', open: true,
      text: function (m) { return 'Heating $' + m.NaHCO3 + '\\ \\text{g}$ of baking soda (' + fq('NaHCO3') + ') breaks it down completely into $' + m.Na2CO3 + '\\ \\text{g}$ of sodium carbonate, $' + m.H2O + '\\ \\text{g}$ of water vapor and some carbon dioxide gas. What mass of carbon dioxide forms?'; } },
    { eq: 'CH4 + 2O2 -> CO2 + 2H2O', give: 'CH4', known: ['O2', 'CO2'], ask: 'H2O', both: true,
      text: function (m) { return '$' + m.CH4 + '\\ \\text{g}$ of methane (' + fq('CH4') + ') burns completely, using $' + m.O2 + '\\ \\text{g}$ of oxygen and making $' + m.CO2 + '\\ \\text{g}$ of carbon dioxide. The only other product is water. What mass of water forms?'; } }
  ];
  var CM_SCENES = [
    ['A candle burns for an hour on a balance in open air. What happens to the reading on the balance?', 1, 'The wax reacts with oxygen to make carbon dioxide and water vapor, and those gases drift away, so the balance reads less. The atoms still exist; they left the balance.'],
    ['A pad of steel wool (iron) burns on a balance in open air, leaving a crumbly iron oxide. What happens to the reading?', 0, 'Oxygen atoms from the air join the iron to make iron oxide, so the solid gains mass. The gain equals the mass of oxygen that combined.'],
    ['Baking soda and vinegar react inside a sealed plastic bag on a balance. The bag puffs up with gas. What happens to the reading?', 2, 'The bag is closed, so the carbon dioxide stays inside it. No atoms enter or leave, so the total mass stays the same.'],
    ['Baking soda and vinegar react in an open cup on a balance, fizzing as they go. What happens to the reading?', 1, 'The carbon dioxide bubbles out of the open cup and leaves the balance, so the reading drops by the mass of that gas.'],
    ['Silver nitrate solution is poured into sodium chloride solution in a stoppered flask, and a white solid forms. What happens to the total mass?', 2, 'Nothing enters or leaves the closed flask. The ions only regroup into a solid, so the total mass is unchanged.'],
    ['A log burns completely in a fireplace. How does the mass of the ash compare with the mass of the log?', 1, 'Most of the wood\'s atoms leave as carbon dioxide and water vapor. Count those gases (and the oxygen that was used) and mass is conserved, but the ash alone weighs much less than the log.'],
    ['A piece of ice melts inside a sealed jar on a balance. What happens to the reading?', 2, 'Melting is a physical change and the jar is sealed: the same water molecules are all still there, so the mass is the same.'],
    ['Magnesium ribbon burns in an open crucible, and all of the white powder that forms is kept in the crucible. How does the mass of the powder compare with the ribbon?', 0, 'Oxygen from the air combines with the magnesium, so the magnesium oxide weighs more than the magnesium did.']
  ];
  var CM_CHOICES = ['It goes up.', 'It goes down.', 'It stays the same.'];
  G('chem.conservation-of-mass', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mass', 'scene', 'atoms'], ['mass', 'scene', 'mass', 'atoms'], ['mass', 'scene', 'mass']));
    if (shape === 'scene') {
      var sc = R.pick(CM_SCENES);
      return P(sc[0], mcAll(CM_CHOICES.slice(), sc[1], true), [sc[2], 'Atoms are rearranged in a reaction, never created or destroyed. A balance only "sees" the atoms that stay on it.'],
        'Ask whether any gas leaves the balance, or any gas from the air joins the solid.', null, { k: 'scene', v: sc[1] });
    }
    if (shape === 'atoms') {
      var ae = R.pick(['CH4 + 2O2 -> CO2 + 2H2O', '2H2 + O2 -> 2H2O', 'N2 + 3H2 -> 2NH3', '2C2H6 + 7O2 -> 4CO2 + 6H2O', 'C3H8 + 5O2 -> 3CO2 + 4H2O', '4Fe + 3O2 -> 2Fe2O3']);
      var E = parseEq(ae), La = sideAtoms(E.L), els = Object.keys(La), el = R.pick(els), n = La[el];
      var detail = E.R.map(function (t) { var c = parseF(t.f).atoms[el] || 0; return c ? t.c + ' \\times ' + c : null; }).filter(Boolean).join(' + ');
      return P('In the balanced equation $$' + eqT(E) + '$$ how many ' + el + ' atoms are on the product side?',
        exact(n),
        ['Count on the product side: $' + detail + ' = ' + n + '$ atoms of ' + el + '.', 'Check the reactant side: it also has ' + n + ' atoms of ' + el + '. Atoms are only rearranged, so every element has the same count on both sides.'],
        'Multiply each coefficient by the subscript of ' + el + ', then add.', null, { k: 'atoms', eq: ae, el: el, v: n });
    }
    var pool = lv(ctx, CM_SETUPS.slice(0, 4), CM_SETUPS.slice(0, 5), CM_SETUPS.slice(2));
    var S = R.pick(pool), E2 = parseEq(S.eq), cg = coefOf(E2, S.give);
    var m0 = lv(ctx, R.int(4, 24) / 2, R.int(25, 200) / 10, R.int(100, 2000) / 100);
    var n0 = m0 / mm(S.give), mass = {};
    E2.L.concat(E2.R).forEach(function (t) { mass[t.f] = rnd(n0 * t.c / cg * mm(t.f), 2); });
    mass[S.give] = m0;
    var show = {}; Object.keys(mass).forEach(function (f) { show[f] = d2(mass[f]); });
    if (S.give === 'CH4') show.CH4 = d2(m0);
    var steps, answer;
    var reacF = E2.L.map(function (t) { return t.f; }), prodF = E2.R.map(function (t) { return t.f; });
    var totalIn = 0, inParts = [];
    reacF.forEach(function (f) { if (f === S.ask) return; totalIn += +show[f]; inParts.push(show[f]); });
    var outParts = []; var totalOut = 0;
    prodF.forEach(function (f) { if (f === S.ask) return; totalOut += +show[f]; outParts.push(show[f]); });
    if (reacF.indexOf(S.ask) >= 0) { // a reactant (oxygen) is unknown: products minus the other reactants
      answer = rnd(totalOut - totalIn, 2);
      steps = ['Mass of reactants = mass of products: $' + inParts.join(' + ') + ' + m = ' + outParts.join(' + ') + '$ (grams).', '$m = ' + outParts.join(' + ') + ' - ' + inParts.join(' - ') + ' = ' + d2(answer) + '\\ \\text{g}$ of ' + nm(S.ask) + '.'];
    } else {
      answer = rnd(totalIn - totalOut, 2);
      steps = ['Mass of reactants = mass of products: $' + inParts.join(' + ') + ' = ' + outParts.join(' + ') + ' + m$ (grams).', '$m = ' + inParts.join(' + ') + ' - ' + outParts.join(' - ') + ' = ' + d2(answer) + '\\ \\text{g}$ of ' + nm(S.ask) + '.'];
    }
    if (S.open) steps.push('The gas left the dish, so the solid alone weighs less, but no mass was destroyed: it is in the gas.');
    if (S.askProduct) steps.push('The solid gained mass because oxygen atoms from the air joined it.');
    return P(S.text(show), ansX(answer), steps, 'The total mass of the reactants equals the total mass of the products.', 'g', { k: 'mass', eq: S.eq, show: show, ask: S.ask, v: answer });
  });

  // ---------------------------------------------------------------- chem.coefficients-subscripts
  var CS_FORMULAS = [['H2O', 1], ['CO2', 1], ['NH3', 1], ['CH4', 1], ['O2', 1], ['C3H8', 1], ['Ca(OH)2', 2], ['Ca(NO3)2', 2], ['Al2(SO4)3', 3], ['Mg3(PO4)2', 3],
    ['(NH4)2SO4', 3], ['C6H12O6', 2], ['NaHCO3', 2], ['Al(NO3)3', 2], ['Fe2(SO4)3', 3], ['CuSO4·5H2O', 3], ['Ba(OH)2', 2], ['(NH4)3PO4', 3], ['H2SO4', 1], ['Pb(NO3)2', 2]];
  G('chem.coefficients-subscripts', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['count', 'count', 'meaning', 'picture'], ['count', 'count', 'total', 'meaning', 'subscript'], ['count', 'total', 'count', 'subscript']));
    var lvl = ctx.level || 1, list = CS_FORMULAS.filter(function (x) { return x[1] <= lvl; });
    if (shape === 'meaning') {
      var f = R.pick(['H2O', 'CO2', 'NH3', 'O2', 'H2']), k = R.pick([2, 3, 4]), a = parseF(f).atoms, els = Object.keys(a);
      var desc = function (kk, at) { return (kk > 1 ? kk + ' molecules, each made of ' : '1 molecule made of ') + els.map(function (e) { return at[e] + ' ' + e + ' atom' + (at[e] > 1 ? 's' : ''); }).join(' and '); };
      var one = {}; els.forEach(function (e) { one[e] = a[e] * k; });
      var wrong2 = {}; els.forEach(function (e) { wrong2[e] = a[e] * k; });
      var choices = [desc(k, a), '1 molecule made of ' + els.map(function (e) { return one[e] + ' ' + e + ' atoms'; }).join(' and '), desc(k, wrong2), desc(1, a)];
      return P('What does $' + k + fT(f) + '$ stand for?', mc(choices[0], choices.slice(1)),
        ['The coefficient ' + k + ' counts whole molecules: there are ' + k + ' of them.', 'The subscripts describe one molecule: $' + fT(f) + '$ is ' + els.map(function (e) { return a[e] + ' ' + e; }).join(' and ') + '.', 'So $' + k + fT(f) + '$ is ' + desc(k, a) + '.'],
        'The big number in front counts molecules; the small numbers describe one molecule.', null, { k: 'meaning' });
    }
    if (shape === 'subscript') {
      var pairs = [['H2O', 'H2O2', 'hydrogen peroxide'], ['CO', 'CO2', 'carbon dioxide'], ['O2', 'O3', 'ozone'], ['NO', 'NO2', 'nitrogen dioxide'], ['SO2', 'SO3', 'sulfur trioxide']];
      var pr = R.pick(pairs);
      var ch = ['It makes a different substance, ' + pr[2] + ', so the equation no longer describes the same reaction.', 'Nothing important: changing a subscript is just another way to balance.', 'It only changes how many molecules of ' + nm(pr[0]) + ' there are.', 'It is fine as long as the atoms balance in the end.'];
      return P('To balance an equation, a student changes $' + fT(pr[0]) + '$ to $' + fT(pr[1]) + '$. What does changing that subscript do?', mc(ch[0], ch.slice(1)),
        ['A subscript is part of a substance\'s identity: $' + fT(pr[1]) + '$ is ' + pr[2] + ', not ' + nm(pr[0]) + '.', 'To balance, change only coefficients, the numbers in front, which count molecules.'],
        'Is $' + fT(pr[1]) + '$ the same substance as $' + fT(pr[0]) + '$?', null, { k: 'subscript' });
    }
    if (shape === 'picture') {
      var fp = R.pick(['H2O', 'CO2', 'NH3', 'CH4']), kp = R.pick([2, 3, 4]), ap = parseF(fp).atoms;
      var big = ''; Object.keys(ap).forEach(function (e) { big += e + (ap[e] * kp > 1 ? ap[e] * kp : ''); });
      var choices2 = ['$' + kp + fT(fp) + '$', '$' + fT(big) + '$', '$' + fT(fp) + '$', '$' + (kp + 1) + fT(fp) + '$'];
      return P('The box shows some molecules of one substance. Which notation describes everything in the box?', mc(choices2[0], choices2.slice(1)),
        ['Count the separate molecules: there are ' + kp + '.', 'Each one is a $' + fT(fp) + '$ molecule.', 'So the box holds $' + kp + fT(fp) + '$: a coefficient for the count, subscripts for one molecule.'],
        'Count separate molecules first, then look at one of them.', null, { k: 'picture' },
        { name: 'ch-particles', opts: { mode: 'sort', boxes: [[{ f: fp, n: kp }]], names: [''], legend: false, atoms: true, motion: false, seed: kp + 3, quiet: true } });
    }
    var item = R.pick(list), ff = item[0], kc = R.pick(lv(ctx, [2, 3, 4], [2, 3, 4, 5], [2, 3, 4, 5, 6])), at = parseF(ff).atoms, el = R.pick(Object.keys(at));
    if (shape === 'total') {
      var per = 0; Object.keys(at).forEach(function (e) { per += at[e]; });
      return P('How many atoms in all are in $' + kc + fT(ff) + '$?', exact(kc * per),
        ['One $' + fT(ff) + '$ has ' + Object.keys(at).map(function (e) { return at[e] + ' ' + e; }).join(', ') + ': $' + per + '$ atoms' + (/\(/.test(ff) ? ' (the subscript after a parenthesis multiplies everything inside it)' : '') + (/·/.test(ff) ? ' (the 5 in front of $\\mathrm{H}_{2}\\mathrm{O}$ counts five water molecules in each formula unit)' : '') + '.', 'The coefficient multiplies the whole formula: $' + kc + ' \\times ' + per + ' = ' + (kc * per) + '$ atoms.'],
        'Count one formula unit, then multiply by the coefficient.', null, { k: 'total', f: ff, c: kc, v: kc * per });
    }
    var nper = at[el];
    return P('How many ' + el + ' atoms are in $' + kc + fT(ff) + '$?', exact(kc * nper),
      ['In one $' + fT(ff) + '$ there ' + (nper === 1 ? 'is 1 ' + el + ' atom' : 'are ' + nper + ' ' + el + ' atoms') + (/\(/.test(ff) && /\)\d/.test(ff) ? ' (a subscript after parentheses multiplies every atom inside them)' : '') + (/·/.test(ff) ? ' (count the water in the hydrate too)' : '') + '.', 'The coefficient ' + kc + ' means ' + kc + ' of them: $' + kc + ' \\times ' + nper + ' = ' + (kc * nper) + '$ ' + el + ' atoms.'],
      'Find the count in one formula unit, then multiply by the coefficient.', null, { k: 'count', f: ff, c: kc, el: el, v: kc * nper });
  });

  // ---------------------------------------------------------------- chem.balancing-equations
  var BAL = [
    ['H2 + O2 -> H2O', [2, 1, 2], 1], ['N2 + H2 -> NH3', [1, 3, 2], 1], ['Na + Cl2 -> NaCl', [2, 1, 2], 1], ['Mg + O2 -> MgO', [2, 1, 2], 1], ['H2 + Cl2 -> HCl', [1, 1, 2], 1],
    ['K + Br2 -> KBr', [2, 1, 2], 1], ['H2O2 -> H2O + O2', [2, 2, 1], 1], ['Zn + HCl -> ZnCl2 + H2', [1, 2, 1, 1], 1], ['Li + O2 -> Li2O', [4, 1, 2], 1], ['Cu + O2 -> CuO', [2, 1, 2], 1],
    ['CH4 + O2 -> CO2 + H2O', [1, 2, 1, 2], 2], ['Fe + O2 -> Fe2O3', [4, 3, 2], 2], ['Al + O2 -> Al2O3', [4, 3, 2], 2], ['KClO3 -> KCl + O2', [2, 2, 3], 2], ['Al + HCl -> AlCl3 + H2', [2, 6, 2, 3], 2],
    ['C3H8 + O2 -> CO2 + H2O', [1, 5, 3, 4], 2], ['Na + H2O -> NaOH + H2', [2, 2, 2, 1], 2], ['Al + Cl2 -> AlCl3', [2, 3, 2], 2], ['Fe2O3 + CO -> Fe + CO2', [1, 3, 2, 3], 2],
    ['Ca(OH)2 + HCl -> CaCl2 + H2O', [1, 2, 1, 2], 2], ['H2SO4 + NaOH -> Na2SO4 + H2O', [1, 2, 1, 2], 2], ['SO2 + O2 -> SO3', [2, 1, 2], 2], ['AgNO3 + CaCl2 -> AgCl + Ca(NO3)2', [2, 1, 2, 1], 2],
    ['C2H6 + O2 -> CO2 + H2O', [2, 7, 4, 6], 3], ['C4H10 + O2 -> CO2 + H2O', [2, 13, 8, 10], 3], ['C6H12O6 + O2 -> CO2 + H2O', [1, 6, 6, 6], 3], ['NH3 + O2 -> NO + H2O', [4, 5, 4, 6], 3],
    ['Al + CuSO4 -> Al2(SO4)3 + Cu', [2, 3, 1, 3], 3], ['Fe + H2O -> Fe3O4 + H2', [3, 4, 1, 4], 3], ['C2H5OH + O2 -> CO2 + H2O', [1, 3, 2, 3], 3], ['Ca3(PO4)2 + H2SO4 -> CaSO4 + H3PO4', [1, 3, 3, 2], 3],
    ['Al(OH)3 + H2SO4 -> Al2(SO4)3 + H2O', [2, 3, 1, 6], 3], ['C8H18 + O2 -> CO2 + H2O', [2, 25, 16, 18], 3], ['FeS2 + O2 -> Fe2O3 + SO2', [4, 11, 2, 8], 3], ['Pb(NO3)2 + KI -> PbI2 + KNO3', [1, 2, 1, 2], 3],
    ['NO2 + H2O -> HNO3 + NO', [3, 1, 2, 1], 3]
  ];
  function withCoef(sk, co) { var E = parseEq(sk), i = 0; E.L.forEach(function (t) { t.c = co[i++]; }); E.R.forEach(function (t) { t.c = co[i++]; }); return E; }
  function tallyLine(E) { var A = sideAtoms(E.L), B = sideAtoms(E.R); return Object.keys(A).map(function (e) { return e + ': ' + A[e] + ' = ' + B[e]; }).join(', '); }
  function balSteps(sk, co) {
    var E = withCoef(sk, co), all = E.L.concat(E.R), steps = [];
    var hasPoly = /\(/.test(sk);
    steps.push('Leave the subscripts alone and count each element on each side of the skeleton equation.');
    if (/O2/.test(sk) && /H2O/.test(sk) && /C\d*H/.test(sk)) steps.push('For a fuel burning, balance C first (with $' + fT('CO2') + '$), then H (with $' + fT('H2O') + '$), and O last, because $' + fT('O2') + '$ is the only source of oxygen that is an element alone.');
    else if (hasPoly) steps.push('A polyatomic ion that appears unchanged on both sides can be balanced as one unit.');
    else steps.push('Start with an element that appears in only one substance on each side; leave elements that appear alone (like $' + fT('O2') + '$ or a metal) for last.');
    if (co.some(function (c) { return c % 2 === 0; }) && /O2|H2|Cl2|Br2|N2/.test(sk)) steps.push('If an odd number of atoms must come from a two-atom molecule, double every coefficient to clear the fraction.');
    steps.push('Balanced: $$' + eqT(E) + '$$');
    steps.push('Check: ' + tallyLine(E) + '. Coefficients in order: ' + co.join(', ') + '.');
    return steps;
  }
  G('chem.balancing-equations', function (R, ctx) {
    var lvl = ctx.level || 1, pool = BAL.filter(function (b) { return b[2] === lvl || (lvl === 3 && b[2] === 2 && R.chance(0.15)); });
    if (!pool.length) pool = BAL.filter(function (b) { return b[2] === lvl; });
    var b = R.pick(pool), sk = b[0], co = b[1], E = parseEq(sk);
    var shape = R.pick(lv(ctx, ['all', 'all', 'one'], ['all', 'all', 'one', 'error'], ['all', 'all', 'one']));
    if (shape === 'error') {
      var f0 = E.R[0].f, ex = R.pick([['H2 + O2 -> H2O', 'H2O2', 'H2O'], ['Mg + O2 -> MgO', 'MgO2', 'MgO'], ['Na + Cl2 -> NaCl', 'NaCl2', 'NaCl'], ['H2 + Cl2 -> HCl', 'H2Cl2', 'HCl']]);
      var good = BAL.filter(function (x) { return x[0] === ex[0]; })[0];
      var ch = ['Changing the subscript made a different substance ($' + fT(ex[1]) + '$), so the equation describes the wrong product. Balance with coefficients instead.', 'Nothing: the atoms balance, so the equation is correct.', 'The coefficients should all be 1, so the student should not have changed anything.', 'Subscripts may be changed only on the product side.'];
      return P('A student "balances" $' + eqT(ex[0], { skeleton: true }).replace(/ \\to .*/, '') + ' \\to ' + fT(ex[2]) + '$ by writing $$' + eqT(ex[0], { skeleton: true }).replace(/ \\to .*/, '') + ' \\to ' + fT(ex[1]) + '$$ What is wrong?', mc(ch[0], ch.slice(1)),
        ['$' + fT(ex[1]) + '$ is not ' + nm(ex[2]) + '. Subscripts are part of a substance\'s identity.', 'Correct balancing changes only coefficients: $$' + eqT(withCoef(good[0], good[1])) + '$$'],
        'Is the product still the same substance?', null, { k: 'error' });
    }
    if (shape === 'one') {
      var all = E.L.concat(E.R), idx = R.int(0, all.length - 1);
      while (co[idx] === 1 && co.some(function (c) { return c > 1; })) idx = R.int(0, all.length - 1);
      var tgt = all[idx].f;
      return P('Balance the equation $$' + eqT(E, { skeleton: true }) + '$$ using the smallest whole-number coefficients. What coefficient goes in front of $' + fT(tgt) + '$?', exact(co[idx]),
        balSteps(sk, co), 'Count atoms of each element on both sides, and change only the numbers in front.', null, { k: 'balOne', sk: sk, co: co, idx: idx, v: co[idx] },
        lvl === 1 ? { name: 'ch-eqbalance', opts: { eq: sk, quiet: true, pictures: true } } : null);
    }
    return P('Balance the equation $$' + eqT(E, { skeleton: true }) + '$$ Type the coefficients in order, separated by commas, using the smallest whole numbers (write 1 where no number is needed).',
      { t: 'tuple', v: co.map(String) },
      balSteps(sk, co), lvl === 1 ? 'Try the balancer: change the numbers in front until every element matches.' : 'Balance one element at a time, and change only coefficients.', null, { k: 'balAll', sk: sk, co: co },
      lvl === 1 ? { name: 'ch-eqbalance', opts: { eq: sk, quiet: true, pictures: true } } : null);
  });

  // ---------------------------------------------------------------- chem.reaction-types
  var RT_TYPES = ['synthesis', 'decomposition', 'single replacement', 'double replacement', 'combustion'];
  var RT_BANK = [
    ['N2 + 3H2 -> 2NH3', 0, 'Two substances combine into one product.'], ['2Na + Cl2 -> 2NaCl', 0, 'Two elements combine into one compound.'],
    ['CaO + H2O -> Ca(OH)2', 0, 'Two compounds combine into one product.'], ['SO3 + H2O -> H2SO4', 0, 'Two compounds combine into one product.'], ['H2 + Cl2 -> 2HCl', 0, 'Two elements combine into one compound.'],
    ['2H2O2 -> 2H2O + O2', 1, 'One reactant breaks into two products.'], ['CaCO3 -> CaO + CO2', 1, 'One reactant breaks into simpler substances.'], ['2KClO3 -> 2KCl + 3O2', 1, 'One reactant breaks into two products.'],
    ['2H2O -> 2H2 + O2', 1, 'Water is split into its elements.'], ['2HgO -> 2Hg + O2', 1, 'One compound breaks into its elements.'],
    ['Zn + 2HCl -> ZnCl2 + H2', 2, 'An element (zinc) takes the place of hydrogen in a compound.'], ['Fe + CuSO4 -> FeSO4 + Cu', 2, 'Iron takes the place of copper in the compound.'],
    ['Cu + 2AgNO3 -> Cu(NO3)2 + 2Ag', 2, 'Copper takes the place of silver in the compound.'], ['Cl2 + 2NaBr -> 2NaCl + Br2', 2, 'Chlorine takes the place of bromine in the compound.'],
    ['Mg + 2HCl -> MgCl2 + H2', 2, 'Magnesium takes the place of hydrogen in the compound.'],
    ['AgNO3 + NaCl -> AgCl + NaNO3', 3, 'Two compounds swap partners: the cations trade anions.'], ['Pb(NO3)2 + 2KI -> PbI2 + 2KNO3', 3, 'Two compounds swap partners.'],
    ['HCl + NaOH -> NaCl + H2O', 3, 'Two compounds swap partners (an acid and a base, so it is also a neutralization).'], ['BaCl2 + Na2SO4 -> BaSO4 + 2NaCl', 3, 'Two compounds swap partners.'],
    ['Na2CO3 + CaCl2 -> CaCO3 + 2NaCl', 3, 'Two compounds swap partners.'],
    ['CH4 + 2O2 -> CO2 + 2H2O', 4, 'A fuel made of carbon and hydrogen reacts with oxygen to give carbon dioxide and water.'], ['C3H8 + 5O2 -> 3CO2 + 4H2O', 4, 'Propane burns in oxygen, giving carbon dioxide and water.'],
    ['C2H5OH + 3O2 -> 2CO2 + 3H2O', 4, 'Ethanol burns in oxygen to carbon dioxide and water. The fuel contains oxygen, and it is still combustion.'],
    ['C6H12O6 + 6O2 -> 6CO2 + 6H2O', 4, 'Glucose reacts with oxygen to carbon dioxide and water: combustion (in cells, the same overall reaction is respiration).'],
    ['2CH3OH + 3O2 -> 2CO2 + 4H2O', 4, 'Methanol burns to carbon dioxide and water; the oxygen inside the fuel does not change the type.']
  ];
  G('chem.reaction-types', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['classify', 'classify', 'which'], ['classify', 'classify', 'which', 'products'], ['classify', 'which', 'products']));
    if (shape === 'products') {
      var fuel = R.pick([['CH4', 'methane'], ['C3H8', 'propane'], ['C4H10', 'butane'], ['C2H5OH', 'ethanol'], ['C8H18', 'octane'], ['CH3OH', 'methanol']]);
      var ch = ['$' + fT('CO2') + '$ and $' + fT('H2O') + '$', '$' + fT('CO2') + '$ and $' + fT('H2') + '$', '$' + fT('C') + '$ and $' + fT('H2O') + '$', '$' + fT('CO2') + '$ only'];
      return P('When ' + fuel[1] + ' ($' + fT(fuel[0]) + '$) burns completely in plenty of oxygen, what are the products?', mc(ch[0], ch.slice(1)),
        ['Complete combustion of a fuel made of carbon and hydrogen (with or without oxygen in it) turns every carbon atom into $' + fT('CO2') + '$ and every hydrogen atom into $' + fT('H2O') + '$.', 'So the products are carbon dioxide and water.'],
        'Where do the carbon atoms and the hydrogen atoms end up?', null, { k: 'products' });
    }
    if (shape === 'which') {
      var t = R.int(0, 4), right = R.pick(RT_BANK.filter(function (x) { return x[1] === t; })), wrongs = R.sample(RT_BANK.filter(function (x) { return x[1] !== t; }), 3);
      return P('Which equation shows a <b>' + RT_TYPES[t] + '</b> reaction?', mc('$' + eqT(right[0]) + '$', wrongs.map(function (w) { return '$' + eqT(w[0]) + '$'; })),
        [right[2], 'The others: ' + wrongs.map(function (w) { return RT_TYPES[w[1]]; }).join(', ') + '.'],
        'Look at how many reactants and products there are, and whether an element trades places.', null, { k: 'which', t: t });
    }
    var item = R.pick(lv(ctx, RT_BANK.filter(function (x) { return !/C2H5OH|CH3OH|HCl \+ NaOH/.test(x[0]); }), RT_BANK, RT_BANK));
    var others = R.sample([0, 1, 2, 3, 4].filter(function (k) { return k !== item[1]; }), 3);
    return P('What type of reaction is this? $$' + eqT(item[0]) + '$$', mc(RT_TYPES[item[1]], others.map(function (k) { return RT_TYPES[k]; })),
      [item[2], 'Type: ' + RT_TYPES[item[1]] + '.'],
      'Count reactants and products, and look for oxygen burning a fuel or an element trading places.', null, { k: 'classify', t: item[1] });
  });

  // ---------------------------------------------------------------- chem.activity-series
  // most active first (OpenStax Chemistry 2e, 4.2, activity series, abridged); H marks where hydrogen sits
  var ACT = ['K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Au'];
  var METAL = { Mg: ['magnesium', 2], Al: ['aluminum', 3], Zn: ['zinc', 2], Fe: ['iron', 2], Ni: ['nickel', 2], Sn: ['tin', 2], Pb: ['lead', 2], Cu: ['copper', 2], Ag: ['silver', 1], Au: ['gold', 3] };
  var ANION = { NO3: ['NO3', 1, 'nitrate'], SO4: ['SO4', 2, 'sulfate'], Cl: ['Cl', 1, 'chloride'] };
  // salt formula from a cation symbol and charge and an anion
  function saltF(cat, qc, an, qa) { var g = gcd(qc, qa), nc = qa / g, na = qc / g, poly = an.length > 2 || /\d/.test(an); return cat + (nc > 1 ? nc : '') + (na > 1 ? (poly ? '(' + an + ')' + na : an + na) : an); }
  // the salt each metal ion is usually given as in these problems (soluble, no precipitate)
  var SALT_OF = { Mg: 'SO4', Al: 'NO3', Zn: 'SO4', Fe: 'SO4', Ni: 'NO3', Sn: 'Cl', Pb: 'NO3', Cu: 'SO4', Ag: 'NO3' };
  function above(a, b) { return ACT.indexOf(a) < ACT.indexOf(b); }
  // pairs used in problems: leave out marginal or complicated cases (Sn and Pb are too close; Al reacts slowly because of
  // its oxide film; Fe with Ag+ goes on to Fe3+; tin(II) nitrate is unstable; lead(II) sulfate would precipitate)
  function okPair(x, y) {
    if ((x === 'Sn' && y === 'Pb') || (x === 'Pb' && y === 'Sn')) return false;
    if (!above(x, y)) return true;
    if (x === 'Al') return y === 'Cu' || y === 'Ag';
    if (x === 'Sn') return y === 'Cu';
    if (x === 'Pb') return y === 'Ag';
    if (x === 'Fe') return y === 'Ni' || y === 'Sn' || y === 'Pb' || y === 'Cu';
    return true;
  }
  function srEq(x, y) { // metal x + salt of y -> salt of x + y, balanced
    var an = ANION[SALT_OF[y]], qx = METAL[x][1], qy = METAL[y][1];
    var sy = saltF(y, qy, an[0], an[1]), sx = saltF(x, qx, an[0], an[1]);
    var l = qx * qy / gcd(qx, qy); // electrons: each x gives qx, each y takes qy
    var nx = l / qx, ny = l / qy;     // atoms of x used, atoms of y formed
    var catX = parseF(sx).atoms[x], catY = parseF(sy).atoms[y];
    var k = 1; while ((nx * k) % catX || (ny * k) % catY) k++;
    var a = nx * k, d = ny * k, b = d / catY, c = a / catX;
    return { sx: sx, sy: sy, eq: (a > 1 ? a : '') + x + ' + ' + (b > 1 ? b : '') + sy + ' -> ' + (c > 1 ? c : '') + sx + ' + ' + (d > 1 ? d : '') + y };
  }
  G('chem.activity-series', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['react', 'react', 'acid'], ['react', 'product', 'acid', 'notreact'], ['product', 'rank', 'halogen', 'notreact', 'acidProduct']));
    var series = '$' + ['Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Ag', 'Au'].map(function (m) { return '\\mathrm{' + m + '}'; }).join(' > ') + '$';
    var seriesNote = 'Activity series (most active first): ' + series + '.';
    if (shape === 'react' || shape === 'product') {
      var mets = ['Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'Cu', 'Ag'], x, y;
      do { x = R.pick(mets); y = R.pick(mets); } while (x === y || (shape === 'product' && !above(x, y)) || !okPair(x, y));
      var sy = saltF(y, METAL[y][1], ANION[SALT_OF[y]][0], ANION[SALT_OF[y]][1]), yes = above(x, y);
      if (shape === 'product') {
        var r = srEq(x, y);
        return P('A strip of ' + METAL[x][0] + ' is placed in a solution of $' + fT(sy) + '$. ' + seriesNote + ' A reaction occurs. Write the formula of the ionic compound that ends up dissolved in the solution.', formula(r.sx),
          [METAL[x][0][0].toUpperCase() + METAL[x][0].slice(1) + ' is above ' + METAL[y][0] + ', so it replaces ' + METAL[y][0] + ' in the compound.', 'The ' + METAL[x][0] + ' ion is $' + fT(x + '^' + (METAL[x][1] > 1 ? METAL[x][1] : '') + '+') + '$ and the ' + ANION[SALT_OF[y]][2] + ' ion is $' + fT(ANION[SALT_OF[y]][0] + '^' + (ANION[SALT_OF[y]][1] > 1 ? ANION[SALT_OF[y]][1] : '') + '-') + '$; balance the charges: $' + fT(r.sx) + '$.', 'Balanced equation: $$' + eqT(r.eq) + '$$'],
          'The more active metal goes into the compound; balance the ion charges to zero.', null, { k: 'product', x: x, y: y, v: r.sx });
      }
      var chs = ['Yes: ' + METAL[x][0] + ' replaces ' + METAL[y][0] + ', and ' + METAL[y][0] + ' metal forms.', 'No: ' + METAL[x][0] + ' is less active than ' + METAL[y][0] + ', so nothing happens.'];
      return P('Will ' + METAL[x][0] + ' metal react with a solution of $' + fT(sy) + '$? ' + seriesNote, mcAll(chs, yes ? 0 : 1, true),
        [METAL[x][0][0].toUpperCase() + METAL[x][0].slice(1) + ' is ' + (yes ? 'above' : 'below') + ' ' + METAL[y][0] + ' in the series.', yes ? 'A more active metal gives up its electrons to the ions of a less active metal, so it replaces that metal: $$' + eqT(srEq(x, y).eq) + '$$' : 'A less active metal cannot push a more active metal out of its compound, so no reaction occurs.'],
        'Find both metals in the series. Only a metal higher up can replace one lower down.', null, { k: 'react', x: x, y: y, v: yes });
    }
    if (shape === 'notreact') {
      var tgt = R.pick(['Pb', 'Sn', 'Ni', 'Fe']), salt = saltF(tgt, 2, ANION[SALT_OF[tgt]][0], ANION[SALT_OF[tgt]][1]);
      var below = R.pick(['Cu', 'Ag', 'Au']), abovesAll = ACT.slice(3, ACT.indexOf(tgt)).filter(function (m) { return METAL[m] && okPair(m, tgt); }), aboves = R.sample(abovesAll, M.min(3, abovesAll.length));
      return P('A solution contains $' + fT(salt) + '$. ' + seriesNote + ' Which metal will <b>not</b> react with it?', mc(METAL[below][0], aboves.map(function (m) { return METAL[m][0]; })),
        [METAL[below][0][0].toUpperCase() + METAL[below][0].slice(1) + ' is below ' + METAL[tgt][0] + ' in the series, so it cannot replace it.', 'The other metals are above ' + METAL[tgt][0] + ' and would replace it.'],
        'Look for the metal that sits below ' + METAL[tgt][0] + '.', null, { k: 'notreact' });
    }
    if (shape === 'acid' || shape === 'acidProduct') {
      var am = R.pick(['Mg', 'Zn', 'Fe', 'Cu', 'Ag', 'Au', 'Mg', 'Zn', 'Al']), yesA = above(am, 'H');
      if (shape === 'acidProduct') {
        am = R.pick(['Mg', 'Zn', 'Fe', 'Al']); var prod = saltF(am, METAL[am][1], 'Cl', 1);
        var eqA = am === 'Al' ? '2Al + 6HCl -> 2AlCl3 + 3H2' : am + ' + 2HCl -> ' + prod + ' + H2';
        return P(METAL[am][0][0].toUpperCase() + METAL[am][0].slice(1) + ' reacts with hydrochloric acid ($' + fT('HCl') + '$), giving off hydrogen gas. Write the formula of the other product, the ionic compound left in solution.' + (am === 'Fe' ? ' (Iron forms $' + fT('Fe^2+') + '$ here.)' : ''), formula(prod),
          [METAL[am][0][0].toUpperCase() + METAL[am][0].slice(1) + ' is above hydrogen, so it replaces the hydrogen in $' + fT('HCl') + '$.', 'Its ion is $' + fT(am + '^' + (METAL[am][1] > 1 ? METAL[am][1] : '') + '+') + '$, so with $' + fT('Cl^-') + '$ the compound is $' + fT(prod) + '$.', '$$' + eqT(eqA) + '$$'],
          'The metal takes hydrogen\'s place next to the chloride ions.', null, { k: 'acidProduct', m: am, v: prod });
      }
      var chA = ['Yes, it gives off hydrogen gas.', 'No, nothing happens.'];
      return P('Will ' + METAL[am][0] + ' react with hydrochloric acid ($' + fT('HCl') + '$)? ' + seriesNote, mcAll(chA, yesA ? 0 : 1, true),
        [METAL[am][0][0].toUpperCase() + METAL[am][0].slice(1) + ' is ' + (yesA ? 'above' : 'below') + ' hydrogen in the series.', yesA ? 'So it replaces hydrogen in the acid and hydrogen gas bubbles off.' : 'So it cannot replace hydrogen, and no reaction occurs.'],
        'Compare the metal with hydrogen (H) in the series.', null, { k: 'acid', m: am, v: yesA });
    }
    if (shape === 'halogen') {
      var hal = [['F2', 'fluorine'], ['Cl2', 'chlorine'], ['Br2', 'bromine'], ['I2', 'iodine']], i = R.int(1, 3), j;
      do { j = R.int(1, 3); } while (j === i);
      var Xh = hal[i], Yh = hal[j], salt2 = 'Na' + Yh[0].replace('2', ''), yesH = i < j;
      var chH = ['Yes: ' + Xh[1] + ' replaces ' + Yh[1] + ', making $' + fT('Na' + Xh[0].replace('2', '')) + '$ and $' + fT(Yh[0]) + '$.', 'No: ' + Xh[1] + ' is less active than ' + Yh[1] + '.'];
      return P('Halogens have an activity series too: $\\mathrm{F_2} > \\mathrm{Cl_2} > \\mathrm{Br_2} > \\mathrm{I_2}$. Will ' + Xh[1] + ' react with a solution of $' + fT(salt2) + '$?', mcAll(chH, yesH ? 0 : 1, true),
        [Xh[1][0].toUpperCase() + Xh[1].slice(1) + ' is ' + (yesH ? 'above' : 'below') + ' ' + Yh[1] + '.', yesH ? 'A more active halogen takes electrons from the ions of a less active one: $$' + eqT(Xh[0] + ' + 2' + salt2 + ' -> 2Na' + Xh[0].replace('2', '') + ' + ' + Yh[0]) + '$$' : 'A less active halogen cannot replace a more active one, so no reaction occurs.'],
        'Only a halogen higher in the list replaces one lower down.', null, { k: 'halogen', X: Xh[0], Y: Yh[0], v: yesH });
    }
    // rank from experiments
    var trio = R.sample(['Mg', 'Zn', 'Fe', 'Ni', 'Pb', 'Cu', 'Ag'], 3).sort(function (a, b) { return ACT.indexOf(a) - ACT.indexOf(b); });
    var lab = R.shuffle(['X', 'Y', 'Z']), L = {}; trio.forEach(function (m, k) { L[m] = lab[k]; });
    var order = trio.map(function (m) { return L[m]; });
    var perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(function (p) { return p.map(function (k) { return order[k]; }).join(' > '); });
    return P('Three metals X, Y and Z are tested. Metal ' + L[trio[0]] + ' reacts with solutions of the ions of both other metals. Metal ' + L[trio[1]] + ' reacts with a solution of ' + L[trio[2]] + '\'s ions but not with ' + L[trio[0]] + '\'s ions. Metal ' + L[trio[2]] + ' reacts with neither. Which order runs from most active to least active?',
      mc(perms[0], perms.slice(1)),
      ['A metal that replaces another one is more active than it.', L[trio[0]] + ' replaces both, so it is the most active; ' + L[trio[2]] + ' replaces neither, so it is the least active.', 'Order: ' + perms[0] + '.'],
      'Each "reacts with" means the first metal is above the other.', null, { k: 'rank' });
  });


  // ================================================================== UNIT 9: STOICHIOMETRY
  // balanced reactions with a short context; a and b name the two reactants (when there are two)
  var ST = [
    { eq: '2H2 + O2 -> 2H2O', ctx: 'Hydrogen burns in oxygen to make water.' },
    { eq: 'N2 + 3H2 -> 2NH3', ctx: 'Nitrogen and hydrogen combine to make ammonia (the Haber process).' },
    { eq: 'CH4 + 2O2 -> CO2 + 2H2O', ctx: 'Methane, natural gas, burns in oxygen.' },
    { eq: '2KClO3 -> 2KCl + 3O2', ctx: 'Potassium chlorate breaks down when heated, giving off oxygen.' },
    { eq: 'CaCO3 -> CaO + CO2', ctx: 'Limestone (calcium carbonate) breaks down in a kiln into lime and carbon dioxide.' },
    { eq: '4Fe + 3O2 -> 2Fe2O3', ctx: 'Iron rusts to iron(III) oxide.' },
    { eq: '2Al + 3Cl2 -> 2AlCl3', ctx: 'Aluminum reacts with chlorine to make aluminum chloride.' },
    { eq: 'C3H8 + 5O2 -> 3CO2 + 4H2O', ctx: 'Propane burns in a gas grill.' },
    { eq: '2Na + Cl2 -> 2NaCl', ctx: 'Sodium reacts with chlorine to make table salt.' },
    { eq: 'Fe2O3 + 3CO -> 2Fe + 3CO2', ctx: 'In a blast furnace, carbon monoxide turns iron ore into iron.' },
    { eq: '2H2O2 -> 2H2O + O2', ctx: 'Hydrogen peroxide breaks down into water and oxygen.' },
    { eq: 'Zn + 2HCl -> ZnCl2 + H2', ctx: 'Zinc reacts with hydrochloric acid, giving off hydrogen.' },
    { eq: 'C6H12O6 + 6O2 -> 6CO2 + 6H2O', ctx: 'Cells break down glucose with oxygen (cellular respiration).' },
    { eq: '2Mg + O2 -> 2MgO', ctx: 'Magnesium burns with a bright white flame.' },
    { eq: '4Al + 3O2 -> 2Al2O3', ctx: 'Aluminum reacts with oxygen to form aluminum oxide.' },
    { eq: '2C2H6 + 7O2 -> 4CO2 + 6H2O', ctx: 'Ethane burns in oxygen.' },
    { eq: 'Mg + 2HCl -> MgCl2 + H2', ctx: 'Magnesium reacts with hydrochloric acid, giving off hydrogen.' }
  ].map(function (r) { r.E = parseEq(r.eq); return r; });
  var ST2 = ST.filter(function (r) { return r.E.L.length === 2; });
  // pick two different substances of a reaction, a (given) and b (asked), b != a
  function pickPair(R, r, opts) {
    opts = opts || {}; var all = r.E.L.concat(r.E.R), a, b;
    do { a = R.pick(opts.aReact ? r.E.L : all); b = R.pick(opts.bProd ? r.E.R : all); } while (a.f === b.f || (opts.noEqual && a.c === b.c));
    return [a, b];
  }
  function verbFor(r, t) { return r.E.L.indexOf(t) >= 0 ? 'react' : 'form'; }
  // friendly moles: a multiple of the coefficient at level 1
  G('chem.mole-ratios', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['forward', 'forward', 'ratio'], ['forward', 'reverse', 'ratio'], ['forward', 'reverse', 'reverse']));
    var noEq = ctx.level !== 3, r = R.pick(noEq ? ST.filter(function (x) { return U.uniq(x.E.L.concat(x.E.R).map(function (t) { return t.c; })).length > 1; }) : ST);
    var pr = pickPair(R, r, { noEqual: noEq }), a = pr[0], b = pr[1];
    if (shape === 'ratio') {
      var right = ratioT(b.c, a.c), wrongs = [ratioT(a.c, b.c), ratioT(M.round(mm(b.f) * b.c), M.round(mm(a.f) * a.c)), '1 : 1', ratioT(b.c + 1, a.c)].filter(function (w) { return w !== right; });
      return P('In the balanced equation $$' + eqT(r.E) + '$$ what is the mole ratio of $' + fT(b.f) + '$ to $' + fT(a.f) + '$?', mc(right, wrongs),
        ['The coefficients count moles: ' + b.c + ' mol $' + fT(b.f) + '$ go with ' + a.c + ' mol $' + fT(a.f) + '$.', 'Ratio of $' + fT(b.f) + '$ to $' + fT(a.f) + '$: $' + b.c + ' : ' + a.c + '$' + (gcd(a.c, b.c) > 1 ? ', which simplifies to $' + right + '$' : '') + '.', 'Subscripts and masses play no part in this ratio.'],
        'Read the numbers in front of the two formulas.', null, { k: 'ratio', eq: r.eq, a: a.f, b: b.f });
    }
    var nA;
    if (ctx.level === 1 || !ctx.level) nA = a.c * R.int(1, 5) * R.pick([1, 1, 2]);
    else nA = rnd(R.pick([0.250, 0.500, 0.750, 1.20, 1.50, 2.40, 3.60, 0.360, 0.840, 4.50, 0.125, 6.00]) * R.int(1, 3), 3);
    var nB = nA * b.c / a.c;
    var given = shape === 'reverse' ? b : a, asked = shape === 'reverse' ? a : b, nG = shape === 'reverse' ? nB : nA, nAsk = shape === 'reverse' ? nA : nB;
    if (shape === 'reverse') { nG = rnd(nB, 3); nAsk = nG * a.c / b.c; }
    var gT = gx(nG), q;
    if (verbFor(r, asked) === 'react' && verbFor(r, given) === 'form') q = 'To make $' + gT + '\\ \\text{mol}$ of $' + fT(given.f) + '$, how many moles of $' + fT(asked.f) + '$ must react?';
    else if (verbFor(r, asked) === 'react') q = 'How many moles of $' + fT(asked.f) + '$ react with $' + gT + '\\ \\text{mol}$ of $' + fT(given.f) + '$?';
    else if (verbFor(r, given) === 'react') q = 'How many moles of $' + fT(asked.f) + '$ form when $' + gT + '\\ \\text{mol}$ of $' + fT(given.f) + '$ react' + (nG === 1 ? 's' : '') + ' completely?';
    else q = 'When $' + gT + '\\ \\text{mol}$ of $' + fT(given.f) + '$ form, how many moles of $' + fT(asked.f) + '$ form too?';
    return P(r.ctx + ' $$' + eqT(r.E) + '$$ ' + q, ans(nAsk, 0.01),
      ['The coefficients say ' + given.c + ' mol $' + fT(given.f) + '$ go with ' + asked.c + ' mol $' + fT(asked.f) + '$.',
        '$$' + gT + '\\ \\text{mol}\\ ' + fT(given.f) + ' \\times ' + moleFactor(asked.c, asked.f, given.c, given.f) + ' = ' + qx(nAsk, 'mol', 3) + '\\ ' + fT(asked.f) + '$$'],
      'Multiply by a mole ratio from the coefficients, with the given substance on the bottom.', 'mol', { k: 'moles', eq: r.eq, a: given.f, b: asked.f, n: nG, v: nAsk });
  });

  G('chem.mass-stoichiometry', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['g2mol', 'g2g'], ['g2g', 'g2g', 'g2mol'], ['g2g', 'reverse', 'reverse']));
    var r = R.pick(ST), pr = pickPair(R, r, { aReact: true }), a = pr[0], b = pr[1];
    if (shape === 'reverse') { pr = pickPair(R, r, { aReact: true, bProd: true }); a = pr[0]; b = pr[1]; }
    var Ma = mm(a.f), Mb = mm(b.f);
    var mA = rnd(R.int(lv(ctx, 10, 15, 15), lv(ctx, 100, 500, 900)) / 10 * (Ma > 100 ? 2 : 1), 1);
    if (shape === 'reverse') { // grams of product wanted -> grams of reactant needed
      var mB = mA, nB = mB / Mb, nA2 = nB * a.c / b.c, mA2 = nA2 * Ma;
      return P(r.ctx + ' $$' + eqT(r.E) + '$$ How many grams of $' + fT(a.f) + '$ are needed to make $' + gx(mB) + '\\ \\text{g}$ of $' + fT(b.f) + '$? ' + massList([a.f, b.f]), ans(mA2, 0.01),
        ['Grams of $' + fT(b.f) + '$ to moles: $' + gx(mB) + ' \\div ' + d2(Mb) + ' = ' + qx(nB, 'mol', 4) + '$.', 'Mole ratio: $' + fx(nB, 4) + ' \\times ' + moleFactor(a.c, a.f, b.c, b.f) + ' = ' + qx(nA2, 'mol', 4) + '\\ ' + fT(a.f) + '$.', 'Moles to grams: $' + fx(nA2, 4) + ' \\times ' + d2(Ma) + ' = ' + qx(mA2, 'g') + '$ of $' + fT(a.f) + '$.'],
        'Work backward: grams of product → moles → mole ratio → grams of reactant.', 'g', { k: 'mass', eq: r.eq, a: b.f, b: a.f, m: mB, v: mA2 });
    }
    var nA = mA / Ma, nB2 = nA * b.c / a.c, mB2 = nB2 * Mb;
    var verb = verbFor(r, b) === 'form' ? 'form' : 'react with it';
    if (shape === 'g2mol') {
      return P(r.ctx + ' $$' + eqT(r.E) + '$$ How many moles of $' + fT(b.f) + '$ ' + (verb === 'form' ? 'form from' : 'react with') + ' $' + gx(mA) + '\\ \\text{g}$ of $' + fT(a.f) + '$? The molar mass of $' + fT(a.f) + '$ is $' + d2(Ma) + '\\ \\text{g/mol}$.', ans(nB2, 0.01),
        ['Grams to moles: $' + gx(mA) + '\\ \\text{g} \\times ' + massFactor(Ma, a.f) + ' = ' + qx(nA, 'mol', 4) + '\\ ' + fT(a.f) + '$.', 'Mole ratio: $' + fx(nA, 4) + '\\ \\text{mol} \\times ' + moleFactor(b.c, b.f, a.c, a.f) + ' = ' + qx(nB2, 'mol') + '\\ ' + fT(b.f) + '$.'],
        'Change grams to moles first; the coefficients compare moles, not grams.', 'mol', { k: 'g2mol', eq: r.eq, a: a.f, b: b.f, m: mA, v: nB2 });
    }
    return P(r.ctx + ' $$' + eqT(r.E) + '$$ How many grams of $' + fT(b.f) + '$ ' + (verb === 'form' ? 'form from' : 'react with') + ' $' + gx(mA) + '\\ \\text{g}$ of $' + fT(a.f) + '$? ' + massList([a.f, b.f]), ans(mB2, 0.01),
      ['Grams of $' + fT(a.f) + '$ to moles: $' + gx(mA) + ' \\div ' + d2(Ma) + ' = ' + qx(nA, 'mol', 4) + '$.', 'Mole ratio: $' + fx(nA, 4) + ' \\times ' + moleFactor(b.c, b.f, a.c, a.f) + ' = ' + qx(nB2, 'mol', 4) + '\\ ' + fT(b.f) + '$.', 'Moles to grams: $' + fx(nB2, 4) + ' \\times ' + d2(Mb) + ' = ' + qx(mB2, 'g') + '$ of $' + fT(b.f) + '$.'],
      'Grams → moles → mole ratio → grams. Never apply the coefficients to grams.', 'g', { k: 'mass', eq: r.eq, a: a.f, b: b.f, m: mA, v: mB2 });
  });

  // a limiting-reactant setup: two reactants with amounts that are not in the exact ratio
  function limSetup(R, ctx, unit) {
    var r = R.pick(ST2), A = r.E.L[0], B = r.E.L[1], P0 = r.E.R[0];
    var nA, nB, ext;
    do {
      if (unit === 'mol') { nA = R.int(2, 12) / (R.coin() ? 1 : 2); nB = R.int(2, 12) / (R.coin() ? 1 : 2); }
      else { nA = R.int(10, 80) / 20; nB = R.int(10, 80) / 20; }
      ext = M.min(nA / A.c, nB / B.c);
    } while (M.abs(nA / A.c - nB / B.c) < 0.12 * ext);
    var lim = nA / A.c < nB / B.c ? A : B, exc = lim === A ? B : A;
    return { r: r, A: A, B: B, P0: P0, nA: nA, nB: nB, ext: ext, lim: lim, exc: exc };
  }
  G('chem.limiting-reactant', function (R, ctx) {
    var lvl = ctx.level || 1;
    if (lvl === 1) {
      var s = limSetup(R, ctx, 'mol'), r = s.r, nP = s.ext * s.P0.c;
      var how = R.pick(['which', 'product']);
      var steps = ['Divide each amount by its coefficient: $' + fT(s.A.f) + '$: $' + gx(s.nA) + ' \\div ' + s.A.c + ' = ' + fx(s.nA / s.A.c, 3) + '$; $' + fT(s.B.f) + '$: $' + gx(s.nB) + ' \\div ' + s.B.c + ' = ' + fx(s.nB / s.B.c, 3) + '$.',
        'The smaller result runs out first: $' + fT(s.lim.f) + '$ is the limiting reactant.',
        'Product: $' + gx(s.lim === s.A ? s.nA : s.nB) + '\\ \\text{mol}\\ ' + fT(s.lim.f) + ' \\times ' + moleFactor(s.P0.c, s.P0.f, s.lim.c, s.lim.f) + ' = ' + qx(nP, 'mol') + '\\ ' + fT(s.P0.f) + '$.'];
      if (how === 'which') return P(r.ctx + ' $$' + eqT(r.E) + '$$ A mixture holds $' + gx(s.nA) + '\\ \\text{mol}$ of $' + fT(s.A.f) + '$ and $' + gx(s.nB) + '\\ \\text{mol}$ of $' + fT(s.B.f) + '$. Which is the limiting reactant?',
        mcAll(['$' + fT(s.A.f) + '$', '$' + fT(s.B.f) + '$'], s.lim === s.A ? 0 : 1, true), steps.slice(0, 2).concat(['Having fewer moles is not enough to decide: compare each amount with its coefficient.']),
        'Divide each amount of reactant by its coefficient; the smaller result runs out first.', null, { k: 'limWhich', eq: r.eq, nA: s.nA, nB: s.nB, v: s.lim.f });
      return P(r.ctx + ' $$' + eqT(r.E) + '$$ A mixture holds $' + gx(s.nA) + '\\ \\text{mol}$ of $' + fT(s.A.f) + '$ and $' + gx(s.nB) + '\\ \\text{mol}$ of $' + fT(s.B.f) + '$. How many moles of $' + fT(s.P0.f) + '$ can form?', ans(nP, 0.01),
        steps, 'Find which reactant runs out first; only it decides the amount of product.', 'mol', { k: 'limMol', eq: r.eq, nA: s.nA, nB: s.nB, v: nP });
    }
    var s2 = limSetup(R, ctx, 'g'), r2 = s2.r, MA = mm(s2.A.f), MB = mm(s2.B.f), MP = mm(s2.P0.f);
    var mA = rnd(s2.nA * MA, 1), mB = rnd(s2.nB * MB, 1);
    if (mA < 1) mA = rnd(s2.nA * MA, 2); if (mB < 1) mB = rnd(s2.nB * MB, 2);
    var nA = mA / MA, nB = mB / MB, ext = M.min(nA / s2.A.c, nB / s2.B.c), lim = nA / s2.A.c < nB / s2.B.c ? s2.A : s2.B, exc = lim === s2.A ? s2.B : s2.A;
    var mP = ext * s2.P0.c * MP, nExcLeft = (exc === s2.A ? nA : nB) - ext * exc.c, mExcLeft = nExcLeft * mm(exc.f);
    var steps2 = ['Grams to moles: $' + fT(s2.A.f) + '$: $' + gx(mA) + ' \\div ' + d2(MA) + ' = ' + fx(nA, 4) + '\\ \\text{mol}$; $' + fT(s2.B.f) + '$: $' + gx(mB) + ' \\div ' + d2(MB) + ' = ' + fx(nB, 4) + '\\ \\text{mol}$.',
      'Divide by the coefficients: $' + fx(nA, 4) + ' \\div ' + s2.A.c + ' = ' + fx(nA / s2.A.c, 4) + '$ and $' + fx(nB, 4) + ' \\div ' + s2.B.c + ' = ' + fx(nB / s2.B.c, 4) + '$. The smaller one, $' + fT(lim.f) + '$, is limiting.',
      'Product: $' + fx(ext * lim.c, 4) + '\\ \\text{mol}\\ ' + fT(lim.f) + ' \\times ' + moleFactor(s2.P0.c, s2.P0.f, lim.c, lim.f) + ' \\times ' + d2(MP) + '\\ \\text{g/mol} = ' + qx(mP, 'g') + '$ of $' + fT(s2.P0.f) + '$.'];
    var q2 = r2.ctx + ' $$' + eqT(r2.E) + '$$ A mixture holds $' + gx(mA) + '\\ \\text{g}$ of $' + fT(s2.A.f) + '$ and $' + gx(mB) + '\\ \\text{g}$ of $' + fT(s2.B.f) + '$. ' + massList([s2.A.f, s2.B.f, s2.P0.f]);
    var chk = { k: 'limG', eq: r2.eq, mA: mA, mB: mB, lim: lim.f, mP: mP, left: mExcLeft };
    if (lvl === 2) return P(q2 + ' Which reactant is limiting, and how many grams of $' + fT(s2.P0.f) + '$ can form?',
      multi([['Limiting reactant:', mcAll(['$' + fT(s2.A.f) + '$', '$' + fT(s2.B.f) + '$'], lim === s2.A ? 0 : 1, true)], ['Mass of $' + fT(s2.P0.f) + '$:', ans(mP, 0.015), 'g']]),
      steps2, 'Change both masses to moles and compare each with its coefficient.', null, chk);
    steps2.push('Excess $' + fT(exc.f) + '$ used: $' + fx(ext * exc.c, 4) + '\\ \\text{mol}$; left over: $' + fx(exc === s2.A ? nA : nB, 4) + ' - ' + fx(ext * exc.c, 4) + ' = ' + fx(nExcLeft, 3) + '\\ \\text{mol}$, or $' + qx(mExcLeft, 'g') + '$.');
    return P(q2 + ' How many grams of $' + fT(s2.P0.f) + '$ can form, and how many grams of the excess reactant are left over?',
      multi([['Mass of $' + fT(s2.P0.f) + '$:', ans(mP, 0.015), 'g'], ['Excess left over:', ans(mExcLeft, 0.03), 'g']]),
      steps2, 'Find the limiting reactant first; the excess left over is what it did not use.', null, chk);
  });

  G('chem.percent-yield', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['simple', 'simple', 'reverse'], ['fromMass', 'fromMass', 'simple'], ['fromTwo', 'fromTwo', 'fromMass', 'reverse']));
    if (shape === 'simple' || shape === 'reverse') {
      var r = R.pick(ST), prd = R.pick(r.E.R), th = rnd(R.int(lv(ctx, 20, 30, 50), lv(ctx, 200, 600, 900)) / 10, 1), pct = R.int(55, 96);
      if (shape === 'reverse') {
        var act = th * pct / 100;
        return P('A reaction could make at most $' + gx(th) + '\\ \\text{g}$ of ' + nm(prd.f) + ' ($' + fT(prd.f) + '$), its theoretical yield. The percent yield is $' + pct + '\\%$. How many grams were actually collected?', ans(act, 0.01),
          ['$\\text{actual} = \\text{percent yield} \\times \\text{theoretical} = ' + (pct / 100).toFixed(2) + ' \\times ' + gx(th) + '\\ \\text{g}$.', '$\\text{actual} = ' + qx(act, 'g') + '$.'],
          'Turn the percent into a decimal and multiply by the theoretical yield.', 'g', { k: 'actual', th: th, pct: pct, v: act });
      }
      var actual = rnd(th * pct / 100 + R.int(-5, 5) / 10, 1); var pc = actual / th * 100;
      return P('The theoretical yield of ' + nm(prd.f) + ' ($' + fT(prd.f) + '$) in a reaction is $' + gx(th) + '\\ \\text{g}$. A student collects $' + gx(actual) + '\\ \\text{g}$. What is the percent yield?', pctAns(pc),
        ['$\\text{percent yield} = \\dfrac{\\text{actual}}{\\text{theoretical}} \\times 100\\%$.', '$\\dfrac{' + gx(actual) + '}{' + gx(th) + '} \\times 100\\% = ' + fx(pc, 3) + '\\%$.'],
        'Actual on top, theoretical on the bottom.', 'pct', { k: 'pct', actual: actual, th: th, v: pc });
    }
    if (shape === 'fromMass') {
      var r2 = R.pick(ST), pr = pickPair(R, r2, { aReact: true, bProd: true }), a = pr[0], b = pr[1], Ma = mm(a.f), Mb = mm(b.f);
      var mA = rnd(R.int(50, 400) / 10 * (Ma > 100 ? 2 : 1), 1), nA = mA / Ma, mTh = nA * b.c / a.c * Mb, pc2 = R.int(60, 95), act2 = rnd(mTh * pc2 / 100, mTh * pc2 / 100 < 10 ? 2 : 1), pct2 = act2 / mTh * 100;
      return P(r2.ctx + ' $$' + eqT(r2.E) + '$$ A reaction of $' + gx(mA) + '\\ \\text{g}$ of $' + fT(a.f) + '$ (with plenty of everything else) gives $' + gx(act2) + '\\ \\text{g}$ of $' + fT(b.f) + '$. What is the percent yield? ' + massList([a.f, b.f]), pctAns(pct2, 0.015),
        ['Theoretical yield: $' + gx(mA) + ' \\div ' + d2(Ma) + ' = ' + fx(nA, 4) + '\\ \\text{mol}\\ ' + fT(a.f) + '$; $\\times ' + moleFactor(b.c, b.f, a.c, a.f) + ' \\times ' + d2(Mb) + ' = ' + qx(mTh, 'g', 4) + '$.', 'Percent yield: $\\dfrac{' + gx(act2) + '}{' + fx(mTh, 4) + '} \\times 100\\% = ' + fx(pct2, 3) + '\\%$.'],
        'First find the most product the reactant could make; then compare.', 'pct', { k: 'pctMass', eq: r2.eq, a: a.f, b: b.f, m: mA, actual: act2, v: pct2 });
    }
    // two reactants: find the limiting one first
    var s = limSetup(R, ctx, 'g'), MA = mm(s.A.f), MB = mm(s.B.f), MP = mm(s.P0.f);
    var mA3 = rnd(s.nA * MA, 1), mB3 = rnd(s.nB * MB, 1); if (mA3 < 1) mA3 = rnd(s.nA * MA, 2); if (mB3 < 1) mB3 = rnd(s.nB * MB, 2);
    var nA3 = mA3 / MA, nB3 = mB3 / MB, ext = M.min(nA3 / s.A.c, nB3 / s.B.c), lim = nA3 / s.A.c < nB3 / s.B.c ? s.A : s.B, mTh3 = ext * s.P0.c * MP;
    var pc3 = R.int(60, 94), act3 = rnd(mTh3 * pc3 / 100, mTh3 * pc3 / 100 < 10 ? 2 : 1), pct3 = act3 / mTh3 * 100;
    return P(s.r.ctx + ' $$' + eqT(s.r.E) + '$$ $' + gx(mA3) + '\\ \\text{g}$ of $' + fT(s.A.f) + '$ and $' + gx(mB3) + '\\ \\text{g}$ of $' + fT(s.B.f) + '$ react, and $' + gx(act3) + '\\ \\text{g}$ of $' + fT(s.P0.f) + '$ is collected. What is the percent yield? ' + massList([s.A.f, s.B.f, s.P0.f]), pctAns(pct3, 0.02),
      ['Moles: $' + fT(s.A.f) + '$ $' + fx(nA3, 4) + '$, $' + fT(s.B.f) + '$ $' + fx(nB3, 4) + '$. Divided by coefficients: $' + fx(nA3 / s.A.c, 4) + '$ and $' + fx(nB3 / s.B.c, 4) + '$, so $' + fT(lim.f) + '$ is limiting.',
        'Theoretical yield from the limiting reactant: $' + fx(ext * lim.c, 4) + ' \\times ' + moleFactor(s.P0.c, s.P0.f, lim.c, lim.f) + ' \\times ' + d2(MP) + ' = ' + qx(mTh3, 'g', 4) + '$.',
        'Percent yield: $\\dfrac{' + gx(act3) + '}{' + fx(mTh3, 4) + '} \\times 100\\% = ' + fx(pct3, 3) + '\\%$.'],
      'The theoretical yield comes from the limiting reactant, never the one in excess.', 'pct', { k: 'pctTwo', eq: s.r.eq, mA: mA3, mB: mB3, actual: act3, v: pct3 });
  });


  // ================================================================== UNIT 10: GASES
  var KPA = 101.325, MMHG = 760, RA = 0.08206, RK = 8.314, RM = 62.36;
  function toK(c) { return c + 273.15; }
  function kT(c) { return gx(fix(c + 273.15)); }
  var GP_CONCEPT = [
    ['A gas fills a sealed box. Where do the gas particles push on the box?', ['Equally on every wall, in every direction', 'Mostly on the bottom, where the particles settle', 'Mostly on the top, because gases rise', 'Only on the walls the particles happen to rest against'],
      'Gas particles fly in every direction and bounce off every wall, so the push is the same on the top, the bottom and the sides.'],
    ['Why does a gas push on the walls of its container?', ['Its particles keep colliding with the walls', 'Gravity pulls its particles down onto the floor', 'Its particles repel the walls from a distance', 'The gas expands only when it is heated'],
      'Each particle that bounces off a wall gives it a tiny push. Billions of collisions every second add up to a steady pressure.'],
    ['A sealed balloon holds a small amount of helium. Where are the helium atoms?', ['Spread through the whole balloon, moving in all directions', 'Piled at the bottom of the balloon', 'Gathered at the top of the balloon', 'Stuck to the inside of the rubber'],
      'A gas spreads out to fill its whole container. Its particles are far apart and keep moving, so they do not settle.'],
    ['More gas particles are pumped into a rigid tank at the same temperature. What happens to the pressure, and why?', ['It rises, because more particles hit the walls each second', 'It falls, because the particles get in each other\'s way', 'It stays the same, because the tank does not change size', 'It rises, because the particles get bigger'],
      'Pressure comes from collisions with the walls. More particles in the same space means more collisions each second, so the pressure rises.']
  ];
  G('chem.gas-pressure', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['conv', 'conv', 'concept'], ['conv', 'conv', 'concept'], ['conv', 'force', 'concept']));
    if (shape === 'concept') {
      var c = R.pick(GP_CONCEPT);
      return P(c[0], mc(c[1][0], c[1].slice(1)), [c[2]], 'Think about particles moving fast in every direction.', null, { k: 'concept' });
    }
    if (shape === 'force') {
      var F = R.pick([200, 500, 800, 1200, 1500, 2000, 3000]), A = R.pick([0.010, 0.020, 0.025, 0.040, 0.050]), Pa = F / A, atm = Pa / 101325;
      return P('A gas pushes with a total force of $' + gx(F) + '\\ \\text{N}$ on a piston with an area of $' + gx(A) + '\\ \\text{m}^2$. What is the pressure in atmospheres? ($1\\ \\text{atm} = 101{,}325\\ \\text{Pa}$, and $1\\ \\text{Pa} = 1\\ \\text{N/m}^2$.)', ans(atm, 0.01),
        ['Pressure is force per area: $P = \\dfrac{F}{A} = \\dfrac{' + gx(F) + '\\ \\text{N}}{' + gx(A) + '\\ \\text{m}^2} = ' + gx(Pa) + '\\ \\text{Pa}$.', 'Convert: $' + gx(Pa) + '\\ \\text{Pa} \\times \\dfrac{1\\ \\text{atm}}{101{,}325\\ \\text{Pa}} = ' + qx(atm, 'atm') + '$.'],
        'Divide force by area to get pascals, then convert to atm.', 'atm', { k: 'force', F: F, A: A, v: atm });
    }
    var pairs = lv(ctx, [['atm', 'mmHg'], ['mmHg', 'atm'], ['atm', 'kPa']], [['kPa', 'atm'], ['mmHg', 'kPa'], ['kPa', 'mmHg'], ['atm', 'mmHg']], [['mmHg', 'kPa'], ['kPa', 'mmHg'], ['kPa', 'atm']]);
    var pr = R.pick(pairs), from = pr[0], to = pr[1], v;
    if (from === 'atm') v = R.pick([0.50, 0.75, 0.85, 0.95, 1.20, 1.50, 2.00, 2.50, 3.00, 0.25]);
    else if (from === 'mmHg') v = R.pick([380, 456, 608, 722, 745, 752, 770, 1140, 912, 684]);
    else v = R.pick([50.0, 75.0, 85.0, 95.0, 98.6, 101.3, 120, 150, 202.6, 250]);
    var inAtm = from === 'atm' ? v : from === 'mmHg' ? v / MMHG : v / KPA, res = to === 'atm' ? inAtm : to === 'mmHg' ? inAtm * MMHG : inAtm * KPA;
    var fac = { atm: '1\\ \\text{atm}', mmHg: '760\\ \\text{mmHg}', kPa: '101.325\\ \\text{kPa}' };
    var ctxs = { atm: '', mmHg: R.pick(['A barometer reads ', 'A mercury column stands ']), kPa: 'A pressure gauge reads ' };
    var lead = from === 'mmHg' ? ctxs.mmHg + '$' + gx(v) + '\\ \\text{mmHg}$' + (/column/.test(ctxs.mmHg) ? ' tall' : '') + '. ' : 'A gas has a pressure of $' + gx(v) + '\\ ' + ut(from) + '$. ';
    return P(lead + 'What is this pressure in ' + up(to) + '? ($1\\ \\text{atm} = 760\\ \\text{mmHg} = 101.325\\ \\text{kPa}$)', ans(res, 0.01),
      ['Use the equality $' + fac[from] + ' = ' + fac[to] + '$ as a conversion factor, with ' + up(from) + ' on the bottom.', '$' + gx(v) + '\\ ' + ut(from) + ' \\times \\dfrac{' + fac[to] + '}{' + fac[from] + '} = ' + qx(res, to) + '$.'],
      'All three units measure the same push: $1\\ \\text{atm} = 760\\ \\text{mmHg} = 101.325\\ \\text{kPa}$.', to, { k: 'pconv', from: from, to: to, x: v, v: res });
  });

  var KMT_TF = [
    ['At a given temperature, every molecule in a gas moves at the same speed.', false, 'Collisions keep changing each molecule\'s speed, so a gas has a wide spread of speeds. Temperature fixes the average kinetic energy, not every molecule\'s.'],
    ['Gas molecules stop moving at 0 °C.', false, '0 °C is only the freezing point of water, 273 K. Molecules keep moving; their average kinetic energy is proportional to the kelvin temperature, which is far above zero.'],
    ['The average kinetic energy of gas particles is proportional to the kelvin temperature.', true, 'This is the meaning of temperature in kinetic molecular theory: double the kelvin temperature and the average kinetic energy doubles.'],
    ['The particles of a gas take up most of the space in their container.', false, 'The particles are tiny compared with the distances between them; a gas is mostly empty space, which is why it can be squeezed.'],
    ['Collisions between gas particles and the walls are what we measure as pressure.', true, 'Every bounce pushes on the wall; together the collisions make the pressure.'],
    ['At the same temperature, helium atoms and nitrogen molecules have the same average kinetic energy.', true, 'Average kinetic energy depends only on temperature. The lighter helium atoms make up for their smaller mass by moving faster.']
  ];
  G('chem.kinetic-molecular-theory', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['tf', 'tf', 'ratioK'], ['ratioC', 'tf', 'compare'], ['ratioC', 'targetT', 'compare']));
    if (shape === 'tf') { var t = R.pick(KMT_TF); return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Think of particles moving fast and randomly, with temperature measuring their average kinetic energy.', null, { k: 'tf' }); }
    if (shape === 'compare') {
      var gases = [['He', 4.00], ['Ne', 20.18], ['N2', 28.02], ['O2', 32.00], ['Ar', 39.95], ['CO2', 44.01], ['Xe', 131.29]];
      var two = R.sample(gases, 2).sort(function (x, y) { return x[1] - y[1]; }), T = R.pick([250, 300, 350, 400]);
      var ask = R.pick(['speed', 'ke']);
      if (ask === 'ke') return P('Samples of $' + fT(two[0][0]) + '$ and $' + fT(two[1][0]) + '$ are both at $' + T + '\\ \\text{K}$. Which has the greater average kinetic energy per particle?', mc('They are the same.', ['$' + fT(two[0][0]) + '$, because its particles are lighter', '$' + fT(two[1][0]) + '$, because its particles are heavier', 'It depends on how much gas there is.']),
        ['Average kinetic energy depends only on the kelvin temperature.', 'Both are at $' + T + '\\ \\text{K}$, so their particles have the same average kinetic energy (the lighter ones move faster to make up for their smaller mass).'],
        'What does temperature measure?', null, { k: 'ke' });
      return P('Samples of $' + fT(two[0][0]) + '$ (' + d2(two[0][1]) + ' g/mol) and $' + fT(two[1][0]) + '$ (' + d2(two[1][1]) + ' g/mol) are both at $' + T + '\\ \\text{K}$. Whose particles move faster on average?', mc('$' + fT(two[0][0]) + '$', ['$' + fT(two[1][0]) + '$', 'Both move at the same average speed.', 'It depends on the size of the container.']),
        ['At the same temperature both have the same average kinetic energy, $\\tfrac{1}{2}mv^2$.', 'With a smaller mass $m$, the speed $v$ must be larger, so the lighter $' + fT(two[0][0]) + '$ particles move faster on average.'],
        'Same temperature means same average kinetic energy. What must a lighter particle do?', null, { k: 'speed' });
    }
    if (shape === 'targetT') {
      var T1 = R.pick([150, 200, 250, 300, 400]), f = R.pick([2, 3, 1.5, 4, 0.5]), T2 = T1 * f;
      return P('A gas is at $' + T1 + '\\ \\text{K}$. At what kelvin temperature would the average kinetic energy of its particles be ' + (f === 0.5 ? 'half as large' : f === 1.5 ? '1.5 times as large' : f + ' times as large') + '?', ans(T2, 0.01),
        ['Average kinetic energy is proportional to the kelvin temperature.', 'So multiply the kelvin temperature by the same factor: $' + T1 + ' \\times ' + gx(f) + ' = ' + qx(T2, 'K') + '$.'],
        'Kinetic energy and kelvin temperature grow in proportion.', 'K', { k: 'targetT', T1: T1, f: f, v: T2 });
    }
    var c1, c2;
    if (shape === 'ratioK') { c1 = R.pick([100, 150, 200, 250, 300]); c2 = c1 * R.pick([2, 3, 4]); }
    else { do { c1 = R.pick([-73, -23, 0, 10, 20, 27, 50, 77, 100]); c2 = R.pick([27, 50, 77, 100, 127, 227, 327, 527]); } while (c2 <= c1); }
    var K1 = shape === 'ratioK' ? c1 : toK(c1), K2 = shape === 'ratioK' ? c2 : toK(c2), ratio = K2 / K1;
    if (shape === 'ratioK') return P('A gas is warmed from $' + c1 + '\\ \\text{K}$ to $' + c2 + '\\ \\text{K}$. By what factor does the average kinetic energy of its particles change?', ans(ratio, 0.01),
      ['Average kinetic energy is proportional to the kelvin temperature.', 'Factor $= \\dfrac{' + c2 + '}{' + c1 + '} = ' + fx(ratio, 3) + '$.'],
      'Divide the new kelvin temperature by the old one.', null, { k: 'ratioK', K1: K1, K2: K2, v: ratio });
    return P('A gas is warmed from $' + c1 + '^\\circ\\text{C}$ to $' + c2 + '^\\circ\\text{C}$. By what factor does the average kinetic energy of its particles change?', ans(ratio, 0.01),
      ['Kinetic energy is proportional to the <b>kelvin</b> temperature, so convert first: $' + c1 + ' + 273.15 = ' + kT(c1) + '\\ \\text{K}$ and $' + c2 + ' + 273.15 = ' + kT(c2) + '\\ \\text{K}$.', 'Factor $= \\dfrac{' + kT(c2) + '}{' + kT(c1) + '} = ' + fx(ratio, 3) + '$.', c1 > 0 ? 'Dividing the Celsius numbers, $' + c2 + ' \\div ' + c1 + '$, would give the wrong answer: the Celsius scale does not start at zero energy.' : 'The Celsius numbers cannot be divided: that scale does not start at zero energy.'],
      'Change both temperatures to kelvins before dividing.', null, { k: 'ratioC', K1: K1, K2: K2, v: ratio });
  });

  G('chem.boyles-law', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['easy', 'easy', 'concept'], ['P2', 'V2', 'concept'], ['units', 'P2', 'V2']));
    if (shape === 'concept') {
      var k = R.pick([2, 3, 4]), dir = R.pick(['squeeze', 'expand']);
      var right = dir === 'squeeze' ? 'It becomes ' + k + ' times as large.' : 'It becomes 1/' + k + ' as large.';
      var wrong = dir === 'squeeze' ? 'It becomes 1/' + k + ' as large.' : 'It becomes ' + k + ' times as large.';
      return P('At constant temperature, the volume of a gas is ' + (dir === 'squeeze' ? 'squeezed to 1/' + k + ' of what it was' : 'allowed to grow to ' + k + ' times what it was') + '. What happens to its pressure?', mc(right, [wrong, 'It stays the same.', 'It changes by a factor of ' + (k * k) + '.']),
        ['$P_1V_1 = P_2V_2$: pressure and volume are inversely proportional.', dir === 'squeeze' ? 'With the same particles in 1/' + k + ' of the space, each wall is hit ' + k + ' times as often, so the pressure is ' + k + ' times as large.' : 'With the same particles spread through ' + k + ' times the space, each wall is hit 1/' + k + ' as often, so the pressure drops to 1/' + k + '.'],
        'When one goes up, the other goes down by the same factor.', null, { k: 'concept' });
    }
    var P1, V1, P2, V2, ask, unitP = 'atm', unitV = 'L', note = '';
    if (shape === 'easy') { P1 = R.pick([1.0, 2.0, 0.5, 1.5]); V1 = R.pick([6.0, 12.0, 24.0, 3.0]); var f = R.pick([2, 3, 0.5, 4]); V2 = V1 / f; P2 = P1 * f; ask = R.pick(['P2', 'V2']); }
    else if (shape === 'units') {
      unitP = 'mmHg'; unitV = 'mL'; P1 = R.pick([760, 740, 720, 780, 700]); V1 = R.pick([250, 400, 500, 120, 300]); P2 = R.pick([380, 1520, 950, 1140, 600, 2000]); V2 = P1 * V1 / P2; ask = 'V2';
    } else { P1 = R.pick([0.95, 1.00, 1.25, 1.50, 2.40, 3.20]); V1 = R.pick([2.50, 4.00, 5.60, 10.0, 12.5, 3.75]); if (shape === 'P2') { V2 = R.pick([1.00, 1.50, 2.00, 8.00, 6.00, 20.0]); P2 = P1 * V1 / V2; } else { P2 = R.pick([0.50, 0.80, 2.00, 3.00, 4.50, 6.00]); V2 = P1 * V1 / P2; } ask = shape; }
    var ctxT = R.pick(['A gas in a cylinder with a movable piston', 'A sample of air in a sealed syringe', 'A balloon of helium']);
    if (ask === 'P2') return P(ctxT + ' has a volume of $' + gx(V1) + '\\ ' + ut(unitV) + '$ at $' + gx(P1) + '\\ ' + ut(unitP) + '$. At constant temperature, its volume changes to $' + gx(V2) + '\\ ' + ut(unitV) + '$. What is the new pressure?', ans(P2, 0.01),
      ['Constant temperature and amount of gas: $P_1V_1 = P_2V_2$, so $P_2 = \\dfrac{P_1V_1}{V_2}$.', '$P_2 = \\dfrac{' + gx(P1) + '\\ ' + ut(unitP) + ' \\times ' + gx(V1) + '\\ ' + ut(unitV) + '}{' + gx(V2) + '\\ ' + ut(unitV) + '} = ' + qx(P2, unitP) + '$.', V2 < V1 ? 'Check: the gas was squeezed, so the pressure went up.' : 'Check: the gas expanded, so the pressure went down.'],
      'Pressure and volume change in opposite directions: $P_1V_1 = P_2V_2$.', unitP, { k: 'boyleP', P1: P1, V1: V1, V2: V2, v: P2 });
    return P(ctxT + ' has a volume of $' + gx(V1) + '\\ ' + ut(unitV) + '$ at $' + gx(P1) + '\\ ' + ut(unitP) + '$. At constant temperature, the pressure changes to $' + gx(P2) + '\\ ' + ut(unitP) + '$. What is the new volume' + (unitV === 'mL' ? ' in milliliters' : '') + '?', ans(V2, 0.01),
      ['Constant temperature and amount of gas: $P_1V_1 = P_2V_2$, so $V_2 = \\dfrac{P_1V_1}{P_2}$.' + (unitP === 'mmHg' ? ' Both pressures are in mmHg, so the units cancel without converting.' : ''), '$V_2 = \\dfrac{' + gx(P1) + '\\ ' + ut(unitP) + ' \\times ' + gx(V1) + '\\ ' + ut(unitV) + '}{' + gx(P2) + '\\ ' + ut(unitP) + '} = ' + qx(V2, unitV) + '$.', P2 > P1 ? 'Check: more pressure, smaller volume.' : 'Check: less pressure, larger volume.'],
      'Pressure and volume change in opposite directions: $P_1V_1 = P_2V_2$.', unitV, { k: 'boyleV', P1: P1, V1: V1, P2: P2, v: V2 });
  });

  G('chem.charles-law', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['kelvin', 'kelvin', 'concept'], ['celsius', 'celsius', 'concept'], ['celsius', 'findT', 'findT']));
    if (shape === 'concept') {
      var a = R.pick([10, 20, 25, 30]), b = a * 2, ratio = toK(b) / toK(a);
      return P('At constant pressure, a balloon is warmed from $' + a + '^\\circ\\text{C}$ to $' + b + '^\\circ\\text{C}$. What happens to its volume?', mc('It grows by only a few percent (a factor of $' + fx(ratio, 3) + '$).', ['It doubles, because the temperature doubled.', 'It halves.', 'It stays exactly the same.']),
        ['Volume is proportional to the <b>kelvin</b> temperature.', '$' + a + '^\\circ\\text{C} = ' + kT(a) + '\\ \\text{K}$ and $' + b + '^\\circ\\text{C} = ' + kT(b) + '\\ \\text{K}$: the factor is $' + kT(b) + ' \\div ' + kT(a) + ' = ' + fx(ratio, 3) + '$, far from 2.'],
        'Convert both temperatures to kelvins before comparing them.', null, { k: 'concept' });
    }
    var V1 = R.pick([1.50, 2.00, 2.50, 3.00, 4.00, 5.00, 0.750, 12.0]), T1, T2, V2;
    if (shape === 'kelvin') {
      T1 = R.pick([200, 250, 300, 400, 150]); T2 = T1 * R.pick([2, 1.5, 0.5, 3, 1.2]); V2 = V1 * T2 / T1;
      return P('A gas sample at constant pressure has a volume of $' + gx(V1) + '\\ \\text{L}$ at $' + gx(T1) + '\\ \\text{K}$. What is its volume at $' + gx(T2) + '\\ \\text{K}$?', ans(V2, 0.01),
        ['At constant pressure, $\\dfrac{V_1}{T_1} = \\dfrac{V_2}{T_2}$, so $V_2 = V_1 \\times \\dfrac{T_2}{T_1}$.', '$V_2 = ' + gx(V1) + '\\ \\text{L} \\times \\dfrac{' + gx(T2) + '\\ \\text{K}}{' + gx(T1) + '\\ \\text{K}} = ' + qx(V2, 'L') + '$.'],
        'Volume is proportional to kelvin temperature.', 'L', { k: 'charlesV', V1: V1, T1: T1, T2: T2, v: V2 });
    }
    var c1 = R.pick([-20, 0, 10, 20, 25, 27, 37]), c2;
    do { c2 = R.pick([-50, -10, 0, 50, 75, 100, 127, 150, 200]); } while (c2 === c1);
    T1 = toK(c1); T2 = toK(c2);
    if (shape === 'findT') {
      V2 = rnd(V1 * T2 / T1, 2); var Tk = T1 * V2 / V1, Tc = Tk - 273.15;
      return P('At constant pressure, a gas has a volume of $' + gx(V1) + '\\ \\text{L}$ at $' + c1 + '^\\circ\\text{C}$. To what Celsius temperature must it be brought to have a volume of $' + d2(V2) + '\\ \\text{L}$?', { t: 'num', v: sfStr(Tc, 3), tol: 1.5 },
        ['Change to kelvins: $T_1 = ' + c1 + ' + 273.15 = ' + kT(c1) + '\\ \\text{K}$.', '$T_2 = T_1 \\times \\dfrac{V_2}{V_1} = ' + kT(c1) + '\\ \\text{K} \\times \\dfrac{' + d2(V2) + '}{' + gx(V1) + '} = ' + qx(Tk, 'K', 4) + '$.', 'Back to Celsius: $' + fx(Tk, 4) + ' - 273.15 = ' + fx(Tc, 3) + '^\\circ\\text{C}$.'],
        'Work in kelvins, then convert the answer back to °C.', 'C', { k: 'charlesT', V1: V1, c1: c1, V2: V2, v: Tc });
    }
    V2 = V1 * T2 / T1;
    return P('A balloon at constant pressure has a volume of $' + gx(V1) + '\\ \\text{L}$ at $' + c1 + '^\\circ\\text{C}$. What is its volume at $' + c2 + '^\\circ\\text{C}$?', ans(V2, 0.01),
      ['Charles\'s law needs kelvins: $T_1 = ' + c1 + ' + 273.15 = ' + kT(c1) + '\\ \\text{K}$, $T_2 = ' + c2 + ' + 273.15 = ' + kT(c2) + '\\ \\text{K}$.', '$V_2 = V_1 \\times \\dfrac{T_2}{T_1} = ' + gx(V1) + '\\ \\text{L} \\times \\dfrac{' + kT(c2) + '}{' + kT(c1) + '} = ' + qx(V2, 'L') + '$.', c2 > c1 ? 'Check: warmer, so bigger.' : 'Check: colder, so smaller.'],
      'Change both temperatures to kelvins first.', 'L', { k: 'charlesV', V1: V1, T1: T1, T2: T2, v: V2 });
  });

  G('chem.combined-gas-law', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['gayK', 'gayK', 'gayC'], ['gayC', 'gayC', 'combined'], ['combined', 'combined', 'gayT']));
    if (shape === 'gayK') {
      var P1 = R.pick([1.00, 1.50, 2.00, 0.80, 3.00]), T1 = R.pick([200, 250, 300, 400]), T2 = T1 * R.pick([1.5, 2, 0.5, 1.2, 3]), P2 = P1 * T2 / T1;
      return P('A sealed steel tank holds a gas at $' + gx(P1) + '\\ \\text{atm}$ and $' + T1 + '\\ \\text{K}$. The tank is brought to $' + gx(T2) + '\\ \\text{K}$. What is the new pressure?', ans(P2, 0.01),
        ['A rigid tank keeps the volume constant, so $\\dfrac{P_1}{T_1} = \\dfrac{P_2}{T_2}$.', '$P_2 = P_1 \\times \\dfrac{T_2}{T_1} = ' + gx(P1) + '\\ \\text{atm} \\times \\dfrac{' + gx(T2) + '}{' + T1 + '} = ' + qx(P2, 'atm') + '$.'],
        'At constant volume, pressure is proportional to kelvin temperature.', 'atm', { k: 'gay', P1: P1, T1: T1, T2: T2, v: P2 });
    }
    if (shape === 'gayC' || shape === 'gayT') {
      var p1 = R.pick([1.00, 1.20, 2.50, 3.00, 0.950, 150, 200, 101]), un = p1 > 10 ? 'kPa' : 'atm', c1 = R.pick([0, 10, 20, 25, 27]), c2;
      do { c2 = R.pick([-20, 50, 75, 100, 127, 150, 227]); } while (c2 === c1);
      var t1 = toK(c1), t2 = toK(c2), p2 = p1 * t2 / t1;
      if (shape === 'gayT') {
        var p2r = sgf(p2, 3), Tk = t1 * p2r / p1, Tc = Tk - 273.15;
        return P('A rigid container of gas is at $' + gx(p1) + '\\ ' + ut(un) + '$ and $' + c1 + '^\\circ\\text{C}$. At what Celsius temperature will its pressure be $' + gx(p2r) + '\\ ' + ut(un) + '$?', { t: 'num', v: sfStr(Tc, 3), tol: 1.5 },
          ['Constant volume: $\\dfrac{P_1}{T_1} = \\dfrac{P_2}{T_2}$, with $T_1 = ' + c1 + ' + 273.15 = ' + kT(c1) + '\\ \\text{K}$.', '$T_2 = T_1 \\times \\dfrac{P_2}{P_1} = ' + kT(c1) + ' \\times \\dfrac{' + gx(p2r) + '}{' + gx(p1) + '} = ' + qx(Tk, 'K', 4) + '$.', 'In Celsius: $' + fx(Tk, 4) + ' - 273.15 = ' + fx(Tc, 3) + '^\\circ\\text{C}$.'],
          'Work in kelvins, then subtract 273.15.', 'C', { k: 'gayT', P1: p1, c1: c1, P2: p2r, v: Tc });
      }
      return P('A sealed, rigid can of gas is at $' + gx(p1) + '\\ ' + ut(un) + '$ at $' + c1 + '^\\circ\\text{C}$. What is the pressure at $' + c2 + '^\\circ\\text{C}$?', ans(p2, 0.01),
        ['Constant volume (Gay-Lussac\'s law): $\\dfrac{P_1}{T_1} = \\dfrac{P_2}{T_2}$, in kelvins: $T_1 = ' + kT(c1) + '\\ \\text{K}$, $T_2 = ' + kT(c2) + '\\ \\text{K}$.', '$P_2 = ' + gx(p1) + '\\ ' + ut(un) + ' \\times \\dfrac{' + kT(c2) + '}{' + kT(c1) + '} = ' + qx(p2, un) + '$.'],
        'Convert to kelvins, then use $P_1/T_1 = P_2/T_2$.', un, { k: 'gay', P1: p1, T1: t1, T2: t2, v: p2 });
    }
    var P1c = R.pick([1.00, 0.950, 1.20, 2.00, 0.850]), V1c = R.pick([2.00, 5.00, 10.0, 12.0, 3.50, 0.500]), c1c = R.pick([0, 15, 20, 25, 30]), c2c, P2c = R.pick([0.500, 0.750, 1.50, 3.00, 2.50, 0.400]);
    do { c2c = R.pick([-40, -10, 5, 50, 80, 100]); } while (c2c === c1c);
    var T1c = toK(c1c), T2c = toK(c2c), V2c = P1c * V1c * T2c / (T1c * P2c);
    return P('A weather balloon holds $' + gx(V1c) + '\\ \\text{L}$ of helium at $' + gx(P1c) + '\\ \\text{atm}$ and $' + c1c + '^\\circ\\text{C}$. It rises to where the pressure is $' + gx(P2c) + '\\ \\text{atm}$ and the temperature is $' + c2c + '^\\circ\\text{C}$. What is its new volume?', ans(V2c, 0.01),
      ['Combined gas law: $\\dfrac{P_1V_1}{T_1} = \\dfrac{P_2V_2}{T_2}$, so $V_2 = V_1 \\times \\dfrac{P_1}{P_2} \\times \\dfrac{T_2}{T_1}$.', 'Kelvins: $T_1 = ' + kT(c1c) + '\\ \\text{K}$, $T_2 = ' + kT(c2c) + '\\ \\text{K}$.', '$V_2 = ' + gx(V1c) + '\\ \\text{L} \\times \\dfrac{' + gx(P1c) + '}{' + gx(P2c) + '} \\times \\dfrac{' + kT(c2c) + '}{' + kT(c1c) + '} = ' + qx(V2c, 'L') + '$.'],
      'Write the starting values on one side, the final values on the other, and use kelvins.', 'L', { k: 'combined', P1: P1c, V1: V1c, T1: T1c, P2: P2c, T2: T2c, v: V2c });
  });

  var GASM = [['He', 'helium'], ['N2', 'nitrogen'], ['O2', 'oxygen'], ['CO2', 'carbon dioxide'], ['CH4', 'methane'], ['NH3', 'ammonia'], ['Ar', 'argon'], ['H2', 'hydrogen'], ['Cl2', 'chlorine']];
  G('chem.avogadros-law', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['n2V', 'V2n', 'same'], ['g2V', 'ratio', 'same', 'V2n'], ['V2g', 'g2V', 'ratio']));
    var g = R.pick(GASM), Mg = mm(g[0]);
    if (shape === 'same') {
      var two = R.sample(GASM, 2), vol = R.pick([1.0, 2.0, 5.0, 10.0]);
      return P('Two balloons at $0^\\circ\\text{C}$ and $1\\ \\text{atm}$ each hold $' + gx(vol) + '\\ \\text{L}$ of gas: one ' + two[0][1] + ' ($' + fT(two[0][0]) + '$), the other ' + two[1][1] + ' ($' + fT(two[1][0]) + '$). Which holds more molecules?', mc('They hold the same number.', ['The ' + (mm(two[0][0]) > mm(two[1][0]) ? two[0][1] : two[1][1]) + ' balloon, because its particles are heavier', 'The ' + (mm(two[0][0]) > mm(two[1][0]) ? two[1][1] : two[0][1]) + ' balloon, because its particles are lighter', 'It cannot be known without the masses.']),
        ['Avogadro\'s law: equal volumes of gases at the same temperature and pressure hold equal numbers of particles.', 'The particles are so far apart that their own size and mass do not matter: each balloon holds $' + gx(vol) + ' \\div 22.4 = ' + fx(vol / 22.4, 3) + '\\ \\text{mol}$.'],
        'Is a gas\'s volume set by the size of its particles or by how many there are?', null, { k: 'same' });
    }
    if (shape === 'ratio') {
      var V1 = R.pick([2.0, 3.0, 4.5, 5.0, 6.0, 12.0]), n1 = R.pick([0.20, 0.25, 0.40, 0.50, 0.75]), n2 = rnd(n1 + R.pick([0.10, 0.15, 0.25, 0.30, -0.10, 0.50]), 2), V2 = V1 * n2 / n1;
      return P('At constant temperature and pressure, a balloon holds $' + gx(n1) + '\\ \\text{mol}$ of gas in $' + gx(V1) + '\\ \\text{L}$. Gas is ' + (n2 > n1 ? 'added' : 'let out') + ' until it holds $' + gx(n2) + '\\ \\text{mol}$. What is its new volume?', ans(V2, 0.01),
        ['At constant $T$ and $P$, volume is proportional to moles: $\\dfrac{V_1}{n_1} = \\dfrac{V_2}{n_2}$.', '$V_2 = ' + gx(V1) + '\\ \\text{L} \\times \\dfrac{' + gx(n2) + '}{' + gx(n1) + '} = ' + qx(V2, 'L') + '$.'],
        'More particles take more room in proportion.', 'L', { k: 'avoRatio', V1: V1, n1: n1, n2: n2, v: V2 });
    }
    if (shape === 'n2V' || shape === 'V2n') {
      var n = R.pick([0.25, 0.50, 1.5, 2.0, 3.0, 0.10, 0.75, 4.0]), V = n * 22.4;
      if (shape === 'n2V') return P('What volume does $' + gx(n) + '\\ \\text{mol}$ of ' + g[1] + ' gas occupy at STP ($0^\\circ\\text{C}$ and $1\\ \\text{atm}$)?', ans(V, 0.01),
        ['At STP one mole of any gas occupies $22.4\\ \\text{L}$.', '$' + gx(n) + '\\ \\text{mol} \\times \\dfrac{22.4\\ \\text{L}}{1\\ \\text{mol}} = ' + qx(V, 'L') + '$.'],
        'Use the molar volume at STP, 22.4 L/mol.', 'L', { k: 'n2V', n: n, v: V });
      var Vg = R.pick([5.6, 11.2, 33.6, 2.24, 44.8, 67.2, 4.48, 8.96]), nn = Vg / 22.4;
      return P('How many moles of ' + g[1] + ' gas are in $' + gx(Vg) + '\\ \\text{L}$ at STP ($0^\\circ\\text{C}$ and $1\\ \\text{atm}$)?', ans(nn, 0.01),
        ['At STP one mole of any gas occupies $22.4\\ \\text{L}$.', '$' + gx(Vg) + '\\ \\text{L} \\times \\dfrac{1\\ \\text{mol}}{22.4\\ \\text{L}} = ' + qx(nn, 'mol') + '$.'],
        'Divide by the molar volume at STP.', 'mol', { k: 'V2n', V: Vg, v: nn });
    }
    if (shape === 'g2V') {
      var mgv = rnd(R.int(10, 200) / 10 * (Mg > 30 ? 2 : 1), 1), nv = mgv / Mg, Vv = nv * 22.4;
      return P('What volume do $' + gx(mgv) + '\\ \\text{g}$ of ' + g[1] + ' ($' + fT(g[0]) + '$, $' + d2(Mg) + '\\ \\text{g/mol}$) occupy at STP ($0^\\circ\\text{C}$, $1\\ \\text{atm}$)?', ans(Vv, 0.01),
        ['Grams to moles: $' + gx(mgv) + ' \\div ' + d2(Mg) + ' = ' + qx(nv, 'mol', 4) + '$.', 'Moles to liters at STP: $' + fx(nv, 4) + '\\ \\text{mol} \\times 22.4\\ \\text{L/mol} = ' + qx(Vv, 'L') + '$.'],
        'Go through moles: grams → moles → liters.', 'L', { k: 'g2V', f: g[0], m: mgv, v: Vv });
    }
    var Vq = R.pick([1.12, 2.24, 5.60, 11.2, 3.36, 0.560, 15.0, 4.00]), nq = Vq / 22.4, mq = nq * Mg;
    return P('What is the mass of $' + gx(Vq) + '\\ \\text{L}$ of ' + g[1] + ' ($' + fT(g[0]) + '$, $' + d2(Mg) + '\\ \\text{g/mol}$) at STP ($0^\\circ\\text{C}$, $1\\ \\text{atm}$)?', ans(mq, 0.01),
      ['Liters to moles at STP: $' + gx(Vq) + ' \\div 22.4 = ' + qx(nq, 'mol', 4) + '$.', 'Moles to grams: $' + fx(nq, 4) + ' \\times ' + d2(Mg) + ' = ' + qx(mq, 'g') + '$.'],
      'Liters → moles (22.4 L/mol) → grams (molar mass).', 'g', { k: 'V2g', f: g[0], V: Vq, v: mq });
  });

  G('chem.ideal-gas-law', function (R, ctx) {
    var lvl = ctx.level || 1, ask = R.pick(lv(ctx, ['P', 'V'], ['n', 'T', 'P', 'V'], ['P', 'V', 'm', 'Tc']));
    var n = R.pick(lv(ctx, [0.500, 1.00, 2.00, 0.250, 1.50], [0.350, 0.800, 1.25, 2.40, 0.0450, 3.60], [0.150, 0.600, 1.75, 2.20])), V = R.pick(lv(ctx, [5.00, 10.0, 12.3, 24.6, 20.0], [2.50, 4.00, 8.20, 15.0, 30.0, 0.500], [0.750, 1.50, 3.20, 6.50])), Tk = R.pick(lv(ctx, [273, 300, 350, 400], [250, 310, 325, 450, 500], [273, 298, 320, 360]));
    var g = R.pick(GASM), Mg = mm(g[0]);
    var units = lvl === 3 ? R.pick(['atm', 'kPa', 'mmHg']) : 'atm', Rv = units === 'atm' ? RA : units === 'kPa' ? RK : RM, Rt = units === 'atm' ? '0.08206\\ \\text{L·atm/(mol·K)}' : units === 'kPa' ? '8.314\\ \\text{L·kPa/(mol·K)}' : '62.36\\ \\text{L·mmHg/(mol·K)}';
    var Pp = n * Rv * Tk / V;
    var given = 'Use $R = ' + Rt + '$.';
    if (ask === 'P') {
      if (lvl === 3) { var mlV = V * 1000, cC = Tk - 273; return P('A $' + gx(mlV) + '\\ \\text{mL}$ flask holds $' + gx(n) + '\\ \\text{mol}$ of ' + g[1] + ' at $' + cC + '^\\circ\\text{C}$. What is the pressure in ' + up(units) + '? ' + given, ans(n * Rv * (cC + 273.15) / V, 0.01),
        ['Convert: $V = ' + gx(mlV) + '\\ \\text{mL} = ' + gx(V) + '\\ \\text{L}$; $T = ' + cC + ' + 273.15 = ' + kT(cC) + '\\ \\text{K}$.', '$P = \\dfrac{nRT}{V} = \\dfrac{' + gx(n) + ' \\times ' + Rv + ' \\times ' + kT(cC) + '}{' + gx(V) + '} = ' + qx(n * Rv * (cC + 273.15) / V, units) + '$.'],
        'Liters and kelvins first; pick the R that has your pressure unit.', units, { k: 'idealP', n: n, V: V, T: cC + 273.15, R: Rv, v: n * Rv * (cC + 273.15) / V }); }
      return P('What is the pressure of $' + gx(n) + '\\ \\text{mol}$ of gas in a $' + gx(V) + '\\ \\text{L}$ container at $' + Tk + '\\ \\text{K}$? ' + given, ans(Pp, 0.01),
        ['$PV = nRT$, so $P = \\dfrac{nRT}{V}$.', '$P = \\dfrac{' + gx(n) + '\\ \\text{mol} \\times ' + Rv + ' \\times ' + Tk + '\\ \\text{K}}{' + gx(V) + '\\ \\text{L}} = ' + qx(Pp, 'atm') + '$.'],
        'Solve $PV = nRT$ for $P$.', 'atm', { k: 'idealP', n: n, V: V, T: Tk, R: RA, v: Pp });
    }
    var Pg = sgf(Pp, 3);
    if (lvl === 3 && units !== 'atm') Pg = sgf(n * Rv * Tk / V, 3);
    if (ask === 'V') {
      var Vc = n * Rv * Tk / Pg, cc2 = Tk - 273;
      if (lvl === 3) Vc = n * Rv * (cc2 + 273.15) / Pg;
      return P('What volume does $' + gx(n) + '\\ \\text{mol}$ of ' + g[1] + ' occupy at $' + gx(Pg) + '\\ ' + ut(units) + '$ and ' + (lvl === 3 ? '$' + cc2 + '^\\circ\\text{C}$' : '$' + Tk + '\\ \\text{K}$') + '? ' + given, ans(Vc, 0.01),
        [(lvl === 3 ? 'Kelvins: $T = ' + cc2 + ' + 273.15 = ' + kT(cc2) + '\\ \\text{K}$. ' : '') + '$V = \\dfrac{nRT}{P}$.', '$V = \\dfrac{' + gx(n) + ' \\times ' + Rv + ' \\times ' + (lvl === 3 ? kT(cc2) : Tk) + '}{' + gx(Pg) + '} = ' + qx(Vc, 'L') + '$.'],
        'Solve $PV = nRT$ for $V$.', 'L', { k: 'idealV', n: n, P: Pg, T: lvl === 3 ? cc2 + 273.15 : Tk, R: Rv, v: Vc });
    }
    if (ask === 'n') {
      var nc = Pg * V / (RA * Tk);
      return P('How many moles of gas are in a $' + gx(V) + '\\ \\text{L}$ tank at $' + gx(Pg) + '\\ \\text{atm}$ and $' + Tk + '\\ \\text{K}$? ' + given, ans(nc, 0.01),
        ['$n = \\dfrac{PV}{RT}$.', '$n = \\dfrac{' + gx(Pg) + ' \\times ' + gx(V) + '}{0.08206 \\times ' + Tk + '} = ' + qx(nc, 'mol') + '$.'],
        'Solve $PV = nRT$ for $n$.', 'mol', { k: 'idealN', P: Pg, V: V, T: Tk, R: RA, v: nc });
    }
    if (ask === 'T') {
      var Tc2 = Pg * V / (n * RA);
      return P('At what kelvin temperature does $' + gx(n) + '\\ \\text{mol}$ of gas in $' + gx(V) + '\\ \\text{L}$ have a pressure of $' + gx(Pg) + '\\ \\text{atm}$? ' + given, ans(Tc2, 0.01),
        ['$T = \\dfrac{PV}{nR}$.', '$T = \\dfrac{' + gx(Pg) + ' \\times ' + gx(V) + '}{' + gx(n) + ' \\times 0.08206} = ' + qx(Tc2, 'K') + '$.'],
        'Solve $PV = nRT$ for $T$.', 'K', { k: 'idealT', P: Pg, V: V, n: n, R: RA, v: Tc2 });
    }
    if (ask === 'Tc') {
      var Tk3 = Pg * V / (n * Rv), Tc3 = Tk3 - 273.15;
      return P('A $' + gx(V) + '\\ \\text{L}$ tank holds $' + gx(n) + '\\ \\text{mol}$ of ' + g[1] + ' at $' + gx(Pg) + '\\ ' + ut(units) + '$. What is the temperature in degrees Celsius? ' + given, { t: 'num', v: sfStr(Tc3, 3), tol: 1.5 },
        ['$T = \\dfrac{PV}{nR} = \\dfrac{' + gx(Pg) + ' \\times ' + gx(V) + '}{' + gx(n) + ' \\times ' + Rv + '} = ' + qx(Tk3, 'K', 4) + '$.', 'Subtract 273.15: $' + fx(Tc3, 3) + '^\\circ\\text{C}$.'],
        'The gas law gives kelvins; convert at the end.', 'C', { k: 'idealTc', P: Pg, V: V, n: n, R: Rv, v: Tc3 });
    }
    // mass of gas
    var nm3 = Pg * V / (Rv * Tk), m3 = nm3 * Mg, c3 = Tk - 273, nm3c = Pg * V / (Rv * (c3 + 273.15)), m3c = nm3c * Mg;
    return P('What mass of ' + g[1] + ' ($' + fT(g[0]) + '$, $' + d2(Mg) + '\\ \\text{g/mol}$) fills a $' + gx(V) + '\\ \\text{L}$ tank at $' + gx(Pg) + '\\ ' + ut(units) + '$ and $' + c3 + '^\\circ\\text{C}$? ' + given, ans(m3c, 0.01),
      ['Kelvins: $T = ' + c3 + ' + 273.15 = ' + kT(c3) + '\\ \\text{K}$.', '$n = \\dfrac{PV}{RT} = \\dfrac{' + gx(Pg) + ' \\times ' + gx(V) + '}{' + Rv + ' \\times ' + kT(c3) + '} = ' + qx(nm3c, 'mol', 4) + '$.', 'Mass: $' + fx(nm3c, 4) + '\\ \\text{mol} \\times ' + d2(Mg) + '\\ \\text{g/mol} = ' + qx(m3c, 'g') + '$.'],
      'Find moles with $PV = nRT$, then use the molar mass.', 'g', { k: 'idealM', P: Pg, V: V, T: c3 + 273.15, R: Rv, M: Mg, v: m3c });
  });


  // ================================================================== UNIT 11: SOLUTIONS
  // ions per formula unit for soluble ionic compounds
  var IONIC = [['NaCl', 2, 'Na^+', 1, 'Cl^-', 1], ['KBr', 2, 'K^+', 1, 'Br^-', 1], ['CaCl2', 3, 'Ca^2+', 1, 'Cl^-', 2], ['MgCl2', 3, 'Mg^2+', 1, 'Cl^-', 2], ['Na2SO4', 3, 'Na^+', 2, 'SO4^2-', 1],
    ['K2CO3', 3, 'K^+', 2, 'CO3^2-', 1], ['Al(NO3)3', 4, 'Al^3+', 1, 'NO3^-', 3], ['K3PO4', 4, 'K^+', 3, 'PO4^3-', 1], ['NH4NO3', 2, 'NH4^+', 1, 'NO3^-', 1], ['FeCl3', 4, 'Fe^3+', 1, 'Cl^-', 3]];
  var DISS_MC = [
    ['A spoonful of sugar dissolves completely in a glass of water. What happened to the sugar molecules?', ['They spread out among the water molecules, each one still a whole sugar molecule.', 'They were destroyed, which is why you can no longer see them.', 'They turned into water molecules.', 'They melted into a liquid.'],
      'Dissolving is a physical change. The sugar molecules are still there (the water tastes sweet and weighs more); they are just too small and too spread out to see.'],
    ['Which substance dissolves well in water?', ['Table salt, $\\mathrm{NaCl}$, an ionic compound', 'Vegetable oil, made of nonpolar molecules', 'Iodine, $\\mathrm{I}_{2}$, a nonpolar molecule', 'Candle wax, made of long nonpolar molecules'],
      'Water is polar. Its partly charged ends can pull ions and polar molecules away from each other and surround them. Nonpolar substances do not attract water strongly, so they stay out: like dissolves like.'],
    ['Which substance dissolves best in hexane, a nonpolar liquid?', ['Iodine, $\\mathrm{I}_{2}$, a nonpolar molecule', 'Table salt, $\\mathrm{NaCl}$', 'Sugar, a polar molecule with many O–H groups', 'Potassium nitrate, $\\mathrm{KNO}_{3}$'],
      'Like dissolves like: a nonpolar solvent mixes with nonpolar molecules, whose attractions are similar to its own.'],
    ['What is the difference between dissolving and melting?', ['Dissolving mixes a solute into a solvent; melting turns one solid into its own liquid by heating.', 'There is none: both turn a solid into a liquid.', 'Dissolving needs heat, and melting does not.', 'Melting makes a solution; dissolving makes a pure liquid.'],
      'Sugar in water at room temperature dissolves without melting: the water molecules pull the sugar molecules away. Melting needs no second substance; it needs the solid\'s own melting point.'],
    ['When solid sodium chloride dissolves in water, what particles end up in the solution?', ['Separate $\\mathrm{Na}^{+}$ and $\\mathrm{Cl}^{-}$ ions, each surrounded by water molecules', 'Whole $\\mathrm{NaCl}$ molecules', 'Sodium atoms and chlorine atoms', 'Nothing: the salt is destroyed'],
      'An ionic solid is a lattice of ions, not molecules. Water molecules pull the ions apart: the oxygen ends face the $\\mathrm{Na}^{+}$ ions and the hydrogen ends face the $\\mathrm{Cl}^{-}$ ions.']
  ];
  G('chem.dissolving', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mc', 'mc', 'mass'], ['ions', 'mc', 'mass'], ['ions', 'ionsOne', 'mc']));
    if (shape === 'mc') { var d = R.pick(DISS_MC); return P(d[0], mc(d[1][0], d[1].slice(1)), [d[2]], 'Think about what water molecules do to the particles of the solute.', null, { k: 'mc' }); }
    if (shape === 'mass') {
      var ms = R.pick([5.0, 10.0, 12.5, 20.0, 25.0, 3.5]), mw = R.pick([50.0, 100.0, 150.0, 200.0, 250.0]), sol = R.pick(['sugar', 'table salt', 'potassium nitrate']);
      return P('$' + gx(ms) + '\\ \\text{g}$ of ' + sol + ' dissolves completely in $' + gx(mw) + '\\ \\text{g}$ of water. What is the mass of the solution?', ansX(ms + mw),
        ['Dissolving does not destroy anything: every particle of ' + sol + ' is still there, spread among the water molecules.', 'Mass of solution $= ' + gx(ms) + ' + ' + gx(mw) + ' = ' + qg(fix(ms + mw), 'g') + '$.'],
        'Is any matter lost when something dissolves?', 'g', { k: 'mass', v: ms + mw });
    }
    var io = R.pick(lv(ctx, IONIC.slice(0, 4), IONIC, IONIC)), n = R.pick([0.10, 0.20, 0.25, 0.50, 1.5, 0.30, 2.0]);
    if (shape === 'ionsOne') {
      var which = R.coin() ? [io[2], io[3]] : [io[4], io[5]], nOne = n * which[1];
      return P('$' + gx(n) + '\\ \\text{mol}$ of $' + fT(io[0]) + '$ dissolves in water. How many moles of $' + fT(which[0]) + '$ ions are in the solution?', ans(nOne, 0.01),
        ['$' + fT(io[0]) + '$ splits into ions: $$' + fT(io[0]) + ' \\to ' + (io[3] > 1 ? io[3] : '') + fT(io[2]) + ' + ' + (io[5] > 1 ? io[5] : '') + fT(io[4]) + '$$', 'Each formula unit gives ' + which[1] + ' $' + fT(which[0]) + '$, so $' + gx(n) + ' \\times ' + which[1] + ' = ' + qx(nOne, 'mol') + '$.'],
        'Write how one formula unit splits into ions.', 'mol', { k: 'ionsOne', f: io[0], ion: which[0], n: n, v: nOne });
    }
    var tot = n * io[1];
    return P('$' + gx(n) + '\\ \\text{mol}$ of $' + fT(io[0]) + '$ dissolves completely in water. How many moles of ions (of both kinds together) are in the solution?', ans(tot, 0.01),
      ['An ionic compound dissolves as separate ions: $$' + fT(io[0]) + ' \\to ' + (io[3] > 1 ? io[3] : '') + fT(io[2]) + ' + ' + (io[5] > 1 ? io[5] : '') + fT(io[4]) + '$$', 'One formula unit gives ' + io[1] + ' ions, so $' + gx(n) + ' \\times ' + io[1] + ' = ' + qx(tot, 'mol') + '$ of ions.'],
      'Count the ions that one formula unit breaks into.', 'mol', { k: 'ions', f: io[0], n: n, v: tot });
  });

  // solubility in g per 100 g of water at 0, 20, 40, 60, 80, 100 °C (CRC Handbook, as in the visual kit)
  var SOLT = { KNO3: [13.3, 31.6, 63.9, 110, 169, 246], NaCl: [35.7, 36.0, 36.6, 37.3, 38.4, 39.8], KCl: [27.6, 34.0, 40.0, 45.5, 51.1, 56.7], NH4Cl: [29.4, 37.2, 45.8, 55.2, 65.6, 77.3], KClO3: [3.3, 7.3, 13.9, 23.8, 37.6, 56.3] };
  var SOLN = { KNO3: 'potassium nitrate', NaCl: 'sodium chloride', KCl: 'potassium chloride', NH4Cl: 'ammonium chloride', KClO3: 'potassium chlorate' };
  function solTable(f, idx) { return 'Solubility of $' + fT(f) + '$ (g per 100 g of water): ' + idx.map(function (i) { return (i * 20) + ' °C: ' + gx(SOLT[f][i]); }).join('; ') + '.'; }
  G('chem.solubility-curves', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['classify', 'classify', 'gas'], ['scale', 'cool', 'classify', 'gas'], ['cool2', 'scale', 'cool', 'trend']));
    var salts = Object.keys(SOLT);
    if (shape === 'gas') {
      var gas = R.pick([['oxygen', 'O2'], ['carbon dioxide', 'CO2']]);
      return P('A pond warms up on a summer afternoon. What happens to the amount of dissolved ' + gas[0] + ' that the water can hold?', mc('It goes down: gases dissolve less in warmer water.', ['It goes up, like the solubility of most salts.', 'It stays the same, because gases do not dissolve in water.', 'It goes up, because warm water has more room between its molecules.']),
        ['Dissolved gas particles that gain energy escape from the liquid more easily, so warm water holds less gas.', 'Most solid solutes do the opposite, which is why the rule "hotter dissolves more" fails for gases.'],
        'Think of a warm soda going flat.', null, { k: 'gas' }, { name: 'ch-solubilitycurve', opts: { subs: ['KNO3', 'O2', 'CO2'], quiet: true } });
    }
    if (shape === 'trend') {
      return P('Which statement about the solubility curves of sodium chloride and potassium nitrate is true? ' + solTable('NaCl', [0, 2, 5]) + ' ' + solTable('KNO3', [0, 2, 5]), mc('Heating helps potassium nitrate dissolve much more, but barely changes sodium chloride.', ['Both dissolve about twice as well at 100 °C as at 0 °C.', 'Sodium chloride is more soluble than potassium nitrate at every temperature.', 'Every solute dissolves more in hot water by the same amount.']),
        ['From 0 °C to 100 °C, $\\mathrm{KNO}_{3}$ goes from 13.3 g to 246 g per 100 g of water, more than 18 times as much.', '$\\mathrm{NaCl}$ goes only from 35.7 g to 39.8 g. The curves cross near 22 °C: below it salt is more soluble, above it potassium nitrate is.'],
        'Compare how much each number changes.', null, { k: 'trend' }, { name: 'ch-solubilitycurve', opts: { subs: ['KNO3', 'NaCl'], quiet: true } });
    }
    var f = R.pick(salts), i = R.int(lv(ctx, 1, 1, 1), lv(ctx, 4, 4, 4)), S = SOLT[f][i], T = i * 20;
    if (shape === 'classify') {
      var kind = R.int(0, 2), amt = kind === 0 ? rnd(S * R.pick([0.4, 0.6, 0.8]), 0) : kind === 1 ? S : rnd(S * R.pick([1.15, 1.3]), 0);
      if (kind !== 1 && amt === S) amt = kind === 0 ? S - 2 : S + 2;
      var names = ['unsaturated', 'saturated', 'supersaturated'];
      var desc = kind === 2 ? 'A clear solution, with no solid in it, holds' : kind === 1 ? 'A solution in contact with a little undissolved solid holds' : 'A clear solution holds';
      return P(desc + ' $' + gx(amt) + '\\ \\text{g}$ of ' + SOLN[f] + ' in $100\\ \\text{g}$ of water at $' + T + '^\\circ\\text{C}$. ' + solTable(f, [i]) + ' Is the solution unsaturated, saturated or supersaturated?',
        mcAll(names, kind, true),
        ['Compare the amount dissolved, $' + gx(amt) + '\\ \\text{g}$, with the solubility at ' + T + ' °C, $' + gx(S) + '\\ \\text{g}$.', kind === 0 ? 'Less than the limit: more could dissolve, so it is unsaturated.' : kind === 1 ? 'Exactly the limit (and solid sits undissolved): saturated.' : 'More than the limit, yet still all dissolved: supersaturated. It is unstable, and a seed crystal makes the extra come out.'],
        'Is the amount dissolved below, at or above the solubility?', null, { k: 'classify', amt: amt, S: S, v: kind },
        { name: 'ch-solubilitycurve', opts: { subs: [f], point: { T: T, g: amt }, quiet: true } });
    }
    if (shape === 'scale') {
      var w = R.pick([50, 150, 200, 250, 300, 25]), need = S * w / 100;
      return P('How many grams of ' + SOLN[f] + ' can dissolve in $' + w + '\\ \\text{g}$ of water at $' + T + '^\\circ\\text{C}$? ' + solTable(f, [i]), ans(need, 0.01),
        ['The solubility is per 100 g of water, and twice the water dissolves twice the solute.', '$' + gx(S) + '\\ \\text{g} \\times \\dfrac{' + w + '\\ \\text{g}}{100\\ \\text{g}} = ' + qx(need, 'g') + '$.'],
        'Scale the solubility by the mass of water.', 'g', { k: 'scale', S: S, w: w, v: need });
    }
    var hi = R.int(2, 5), lo = R.int(0, hi - 1), Sh = SOLT[f][hi], Sl = SOLT[f][lo], ww = shape === 'cool2' ? R.pick([50, 200, 250, 150]) : 100, crys = (Sh - Sl) * ww / 100;
    if (f === 'NaCl') { f = 'KNO3'; Sh = SOLT[f][hi]; Sl = SOLT[f][lo]; crys = (Sh - Sl) * ww / 100; }
    return P('A saturated solution of ' + SOLN[f] + ' in $' + ww + '\\ \\text{g}$ of water at $' + (hi * 20) + '^\\circ\\text{C}$ is cooled to $' + (lo * 20) + '^\\circ\\text{C}$. How many grams of crystals form? ' + solTable(f, [lo, hi]), ans(crys, 0.01),
      ['At ' + (hi * 20) + ' °C the water holds $' + gx(Sh) + '\\ \\text{g}$ per 100 g; at ' + (lo * 20) + ' °C only $' + gx(Sl) + '\\ \\text{g}$.', 'Per 100 g of water: $' + gx(Sh) + ' - ' + gx(Sl) + ' = ' + gx(fix(Sh - Sl)) + '\\ \\text{g}$ comes out of solution.' + (ww !== 100 ? ' For ' + ww + ' g of water: $' + gx(fix(Sh - Sl)) + ' \\times \\dfrac{' + ww + '}{100} = ' + qx(crys, 'g') + '$.' : '')],
      'The extra solute that the cold water cannot hold comes out as crystals.', 'g', { k: 'cool', Sh: Sh, Sl: Sl, w: ww, v: crys },
      { name: 'ch-solubilitycurve', opts: { subs: [f], point: { T: hi * 20, g: Sh }, cool: lo * 20, quiet: true } });
  });

  var SOLUTES = [['NaCl', 'sodium chloride'], ['KCl', 'potassium chloride'], ['NaOH', 'sodium hydroxide'], ['C6H12O6', 'glucose'], ['CaCl2', 'calcium chloride'], ['KNO3', 'potassium nitrate'], ['CuSO4', 'copper(II) sulfate'], ['C12H22O11', 'sucrose']];
  G('chem.molarity', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['molL', 'molL', 'moles'], ['gmL', 'gmL', 'moles', 'grams'], ['grams', 'volume', 'gmL']));
    var s = R.pick(SOLUTES), Ms = mm(s[0]);
    if (shape === 'molL') {
      var n = R.pick([0.10, 0.20, 0.25, 0.50, 0.75, 1.5, 0.30]), V = R.pick([0.50, 0.25, 2.0, 1.5, 0.10, 0.20]), Mv = n / V;
      return P('$' + gx(n) + '\\ \\text{mol}$ of ' + s[1] + ' is dissolved in enough water to make $' + gx(V) + '\\ \\text{L}$ of solution. What is the molarity?', ans(Mv, 0.01),
        ['Molarity is moles of solute per liter of <b>solution</b>: $M = \\dfrac{n}{V}$.', '$M = \\dfrac{' + gx(n) + '\\ \\text{mol}}{' + gx(V) + '\\ \\text{L}} = ' + qx(Mv, 'M') + '$.'],
        'Divide moles of solute by liters of solution.', 'M', { k: 'M', n: n, V: V, v: Mv }, { name: 'ch-beaker', opts: { sub: s[0], mol: n, V: V, quiet: true } });
    }
    if (shape === 'moles') {
      var Mc = R.pick([0.10, 0.25, 0.50, 1.0, 2.0, 0.15]), mL = R.pick([250, 500, 100, 750, 50, 200]), nn = Mc * mL / 1000;
      return P('How many moles of ' + s[1] + ' are in $' + mL + '\\ \\text{mL}$ of a $' + gx(Mc) + '\\ \\text{M}$ solution?', ans(nn, 0.01),
        ['Change milliliters to liters: $' + mL + '\\ \\text{mL} = ' + gx(mL / 1000) + '\\ \\text{L}$.', '$n = M \\times V = ' + gx(Mc) + '\\ \\text{mol/L} \\times ' + gx(mL / 1000) + '\\ \\text{L} = ' + qx(nn, 'mol') + '$.'],
        'Moles = molarity × liters.', 'mol', { k: 'n', M: Mc, V: mL / 1000, v: nn });
    }
    if (shape === 'gmL') {
      var g = rnd(R.int(20, 400) / 10 * (Ms > 100 ? 2 : 1), 1), mL2 = R.pick([250, 500, 100, 200, 750, 150]), n2 = g / Ms, M2 = n2 / (mL2 / 1000);
      return P('A student dissolves $' + gx(g) + '\\ \\text{g}$ of ' + s[1] + ' ($' + fT(s[0]) + '$, $' + d2(Ms) + '\\ \\text{g/mol}$) and adds water until the solution\'s volume is $' + mL2 + '\\ \\text{mL}$. What is the molarity?', ans(M2, 0.01),
        ['Grams to moles: $' + gx(g) + ' \\div ' + d2(Ms) + ' = ' + qx(n2, 'mol', 4) + '$.', 'Volume in liters: $' + mL2 + '\\ \\text{mL} = ' + gx(mL2 / 1000) + '\\ \\text{L}$.', '$M = \\dfrac{' + fx(n2, 4) + '\\ \\text{mol}}{' + gx(mL2 / 1000) + '\\ \\text{L}} = ' + qx(M2, 'M') + '$.'],
        'Moles of solute over liters of solution (not milliliters).', 'M', { k: 'gM', f: s[0], g: g, V: mL2 / 1000, v: M2 });
    }
    if (shape === 'grams') {
      var M3 = R.pick([0.100, 0.250, 0.500, 1.00, 0.200, 0.150]), mL3 = R.pick([250, 500, 100, 200, 1000, 50]), m3 = M3 * mL3 / 1000 * Ms;
      return P('What mass of ' + s[1] + ' ($' + fT(s[0]) + '$, $' + d2(Ms) + '\\ \\text{g/mol}$) is needed to make $' + mL3 + '\\ \\text{mL}$ of a $' + gx(M3) + '\\ \\text{M}$ solution?', ans(m3, 0.01),
        ['Moles needed: $' + gx(M3) + '\\ \\text{mol/L} \\times ' + gx(mL3 / 1000) + '\\ \\text{L} = ' + qx(M3 * mL3 / 1000, 'mol', 4) + '$.', 'Grams: $' + fx(M3 * mL3 / 1000, 4) + '\\ \\text{mol} \\times ' + d2(Ms) + '\\ \\text{g/mol} = ' + qx(m3, 'g') + '$.', 'To make it, dissolve that mass and add water up to the ' + mL3 + ' mL mark, rather than adding ' + mL3 + ' mL of water.'],
        'Find the moles first, then the grams.', 'g', { k: 'gNeed', f: s[0], M: M3, V: mL3 / 1000, v: m3 });
    }
    var M4 = R.pick([0.200, 0.500, 1.50, 0.250, 2.00]), n4 = R.pick([0.0500, 0.100, 0.300, 0.0250, 0.750]), V4 = n4 / M4 * 1000;
    return P('What volume of a $' + gx(M4) + '\\ \\text{M}$ ' + s[1] + ' solution, in milliliters, contains $' + gx(n4) + '\\ \\text{mol}$ of solute?', ans(V4, 0.01),
      ['$V = \\dfrac{n}{M} = \\dfrac{' + gx(n4) + '\\ \\text{mol}}{' + gx(M4) + '\\ \\text{mol/L}} = ' + qx(n4 / M4, 'L', 4) + '$.', 'In milliliters: $' + fx(n4 / M4, 4) + '\\ \\text{L} \\times 1000 = ' + qx(V4, 'mL') + '$.'],
      'Liters = moles ÷ molarity.', 'mL', { k: 'V', n: n4, M: M4, v: V4 });
  });

  G('chem.dilution', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['M2', 'M2', 'concept'], ['V1', 'M2', 'V2'], ['water', 'V1', 'water']));
    var s = R.pick(SOLUTES);
    if (shape === 'concept') {
      return P('Water is added to a solution of ' + s[1] + ' until its volume doubles. What happens to the number of moles of ' + s[1] + ' in it?', mc('It stays the same; the same moles are spread through more volume.', ['It doubles.', 'It is cut in half.', 'It goes to zero.']),
        ['Adding water adds no solute and removes none.', 'The moles stay the same, so the molarity, moles per liter, is cut in half.'],
        'Does pouring in water add or remove any solute?', null, { k: 'concept' });
    }
    var M1 = R.pick([2.00, 1.00, 6.00, 0.500, 3.00, 12.0]), V1 = R.pick([10.0, 25.0, 50.0, 100, 20.0, 5.00]), V2 = V1 * R.pick([2, 4, 5, 10, 2.5, 8]), M2 = M1 * V1 / V2;
    if (shape === 'M2') return P('$' + gx(V1) + '\\ \\text{mL}$ of $' + gx(M1) + '\\ \\text{M}$ ' + s[1] + ' solution is diluted with water to a total volume of $' + gx(V2) + '\\ \\text{mL}$. What is the new molarity?', ans(M2, 0.01),
      ['The moles of solute do not change: $M_1V_1 = M_2V_2$.', '$M_2 = \\dfrac{M_1V_1}{V_2} = \\dfrac{' + gx(M1) + ' \\times ' + gx(V1) + '}{' + gx(V2) + '} = ' + qx(M2, 'M') + '$. Both volumes are in mL, so the units cancel.'],
      'Same moles, more volume: $M_1V_1 = M_2V_2$.', 'M', { k: 'M2', M1: M1, V1: V1, V2: V2, v: M2 }, ctx.level === 1 ? { name: 'ch-beaker', opts: { mode: 'dilute', sub: s[0], mol: M1 * V1 / 1000, V: V1 / 1000, quiet: true } } : null);
    var Mt = R.pick([0.100, 0.250, 0.500, 0.200, 1.00, 0.0500]), Vt = R.pick([250, 500, 100, 1000, 200]), Ms = R.pick([1.00, 2.00, 6.00, 12.0, 5.00, 3.00]);
    if (Mt >= Ms) Mt = Ms / 10;
    var Vneed = Mt * Vt / Ms;
    if (shape === 'V1' || shape === 'water') {
      if (shape === 'water') { var V1w = sgf(Vneed, 3), V2w = Ms * V1w / Mt;
        return P('How much water must be added to $' + gx(V1w) + '\\ \\text{mL}$ of a $' + gx(Ms) + '\\ \\text{M}$ stock solution to make a $' + gx(Mt) + '\\ \\text{M}$ solution? (Assume the volumes add.)', ans(V2w - V1w, 0.01),
        ['Final volume from $M_1V_1 = M_2V_2$: $V_2 = \\dfrac{' + gx(Ms) + ' \\times ' + gx(V1w) + '}{' + gx(Mt) + '} = ' + qx(V2w, 'mL') + '$.', 'Water to add $= V_2 - V_1 = ' + fx(V2w, 4) + ' - ' + gx(V1w) + ' = ' + qx(V2w - V1w, 'mL') + '$.'],
        'Find the final volume first; the water added is the difference.', 'mL', { k: 'water', M1: Ms, V1: V1w, M2: Mt, v: V2w - V1w }); }
      return P('How many milliliters of a $' + gx(Ms) + '\\ \\text{M}$ stock solution are needed to make $' + gx(Vt) + '\\ \\text{mL}$ of $' + gx(Mt) + '\\ \\text{M}$ solution?', ans(Vneed, 0.01),
        ['The moles needed come from the stock: $M_1V_1 = M_2V_2$.', '$V_1 = \\dfrac{M_2V_2}{M_1} = \\dfrac{' + gx(Mt) + ' \\times ' + gx(Vt) + '}{' + gx(Ms) + '} = ' + qx(Vneed, 'mL') + '$.', 'Measure that much stock, then add water up to ' + gx(Vt) + ' mL.'],
        'Solve $M_1V_1 = M_2V_2$ for the stock volume.', 'mL', { k: 'V1', M1: Ms, M2: Mt, V2: Vt, v: Vneed });
    }
    var M1b = R.pick([2.00, 1.50, 0.800, 3.00]), V1b = R.pick([20.0, 40.0, 50.0, 15.0]), M2b = R.pick([0.100, 0.200, 0.250, 0.500]), V2b = M1b * V1b / M2b;
    return P('To what total volume must $' + gx(V1b) + '\\ \\text{mL}$ of $' + gx(M1b) + '\\ \\text{M}$ ' + s[1] + ' be diluted to make a $' + gx(M2b) + '\\ \\text{M}$ solution?', ans(V2b, 0.01),
      ['$M_1V_1 = M_2V_2$, so $V_2 = \\dfrac{M_1V_1}{M_2}$.', '$V_2 = \\dfrac{' + gx(M1b) + ' \\times ' + gx(V1b) + '}{' + gx(M2b) + '} = ' + qx(V2b, 'mL') + '$.'],
      'The moles stay the same, so a weaker solution needs more volume.', 'mL', { k: 'V2', M1: M1b, V1: V1b, M2: M2b, v: V2b });
  });

  // ------------------------------------------------- precipitation: simplified solubility rules with clear-cut cases only
  var CAT = { 'Na^+': ['Na', 1, 'sodium'], 'K^+': ['K', 1, 'potassium'], 'NH4^+': ['NH4', 1, 'ammonium'], 'Ag^+': ['Ag', 1, 'silver'], 'Pb^2+': ['Pb', 2, 'lead(II)'], 'Ba^2+': ['Ba', 2, 'barium'],
    'Ca^2+': ['Ca', 2, 'calcium'], 'Cu^2+': ['Cu', 2, 'copper(II)'], 'Fe^3+': ['Fe', 3, 'iron(III)'], 'Mg^2+': ['Mg', 2, 'magnesium'], 'Zn^2+': ['Zn', 2, 'zinc'] };
  var AN = { 'NO3^-': ['NO3', 1, 'nitrate'], 'Cl^-': ['Cl', 1, 'chloride'], 'Br^-': ['Br', 1, 'bromide'], 'I^-': ['I', 1, 'iodide'], 'SO4^2-': ['SO4', 2, 'sulfate'], 'CO3^2-': ['CO3', 2, 'carbonate'],
    'PO4^3-': ['PO4', 3, 'phosphate'], 'OH^-': ['OH', 1, 'hydroxide'] };
  // 's' soluble, 'i' insoluble, null = borderline (left out of problems)
  function solRule(c, a) {
    if (c === 'Na^+' || c === 'K^+' || c === 'NH4^+' || a === 'NO3^-') return 's';
    if (a === 'Cl^-' || a === 'Br^-') return c === 'Ag^+' ? 'i' : c === 'Pb^2+' ? null : 's';
    if (a === 'I^-') return c === 'Ag^+' || c === 'Pb^2+' ? 'i' : c === 'Cu^2+' || c === 'Fe^3+' ? null : 's';
    if (a === 'SO4^2-') return c === 'Ba^2+' || c === 'Pb^2+' ? 'i' : c === 'Ca^2+' || c === 'Ag^+' ? null : 's';
    if (a === 'CO3^2-') return c === 'Cu^2+' || c === 'Fe^3+' ? null : 'i';
    if (a === 'PO4^3-') return 'i';
    if (a === 'OH^-') return c === 'Ba^2+' || c === 'Ca^2+' || c === 'Pb^2+' || c === 'Ag^+' ? null : 'i';
    return null;
  }
  function ionSalt(c, a) { var C = CAT[c], A = AN[a], g = gcd(C[1], A[1]), nc = A[1] / g, na = C[1] / g, cp = C[0].length > 2 || /\d/.test(C[0]), ap = A[0].length > 2 || /\d/.test(A[0]) || A[0] === 'OH';
    return (nc > 1 ? (cp ? '(' + C[0] + ')' + nc : C[0] + nc) : C[0]) + (na > 1 ? (ap ? '(' + A[0] + ')' + na : A[0] + na) : A[0]); }
  function saltName(c, a) { return CAT[c][2] + ' ' + AN[a][2]; }
  // solution 1: a nitrate of the metal; solution 2: a sodium or potassium salt of the anion
  function precipPairs() { var out = []; Object.keys(CAT).forEach(function (c) { if (c === 'Na^+' || c === 'K^+' || c === 'NH4^+') return; Object.keys(AN).forEach(function (a) { if (a === 'NO3^-') return; var r = solRule(c, a); if (r) out.push([c, a, r]); }); }); return out; }
  var PP = precipPairs();
  function mixEq(c, a, spect) { // balanced molecular equation: nitrate of c + Na/K salt of a -> precipitate + Na/K nitrate
    var C = CAT[c], A = AN[a], s1 = ionSalt(c, 'NO3^-'), s2 = ionSalt(spect, a), ppt = ionSalt(c, a), s4 = ionSalt(spect, 'NO3^-');
    var g = gcd(C[1], A[1]), nc = A[1] / g, na = C[1] / g;   // the precipitate has nc cations and na anions
    var co = [nc, na, 1, nc * C[1]];                         // each Na/K salt brings one anion; each nitrate ends up with Na/K
    return { eq: (co[0] > 1 ? co[0] : '') + s1 + ' + ' + (co[1] > 1 ? co[1] : '') + s2 + ' -> ' + ppt + ' + ' + (co[3] > 1 ? co[3] : '') + s4, s1: s1, s2: s2, ppt: ppt, s4: s4, co: co };
  }
  G('chem.precipitation-reactions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['ppt', 'soluble', 'ppt'], ['ppt', 'which', 'soluble'], ['ppt', 'which', 'balance']));
    var spect = R.pick(['Na^+', 'K^+']);
    if (shape === 'soluble') {
      var all = Object.keys(CAT).reduce(function (acc, c) { Object.keys(AN).forEach(function (a) { var r = solRule(c, a); if (r) acc.push([c, a, r]); }); return acc; }, []);
      var it = R.pick(all), f = ionSalt(it[0], it[1]);
      var why = it[2] === 's' ? (it[0] === 'Na^+' || it[0] === 'K^+' || it[0] === 'NH4^+' ? 'Compounds of sodium, potassium and ammonium are soluble.' : it[1] === 'NO3^-' ? 'All nitrates are soluble.' : it[1] === 'SO4^2-' ? 'Most sulfates are soluble; the exceptions include barium and lead(II) sulfate.' : 'Most chlorides, bromides and iodides are soluble; silver and lead(II) are the main exceptions.')
        : (it[1] === 'CO3^2-' || it[1] === 'PO4^3-' ? 'Carbonates and phosphates are insoluble unless the cation is sodium, potassium or ammonium.' : it[1] === 'OH^-' ? 'Most hydroxides are insoluble; those of sodium, potassium and barium are the main exceptions.' : it[1] === 'SO4^2-' ? 'Barium sulfate and lead(II) sulfate are exceptions to "sulfates are soluble".' : 'Silver and lead(II) form insoluble chlorides, bromides and iodides.');
      return P('Is ' + saltName(it[0], it[1]) + ', $' + fT(f) + '$, soluble in water?', mcAll(['Yes, it is soluble.', 'No, it is insoluble.'], it[2] === 's' ? 0 : 1, true), [why],
        'Check the solubility rules for the anion, then look for exceptions.', null, { k: 'soluble', v: it[2] });
    }
    if (shape === 'which') {
      var yes = R.pick(PP.filter(function (p) { return p[2] === 'i'; })), nos = R.sample(PP.filter(function (p) { return p[2] === 's'; }), 2);
      var spectNo = { c: R.pick(['Na^+', 'K^+']), a: R.pick(['Cl^-', 'NO3^-', 'Br^-']) };
      var pairTxt = function (c, a) { return '$' + fT(ionSalt(c, 'NO3^-')) + '$ and $' + fT(ionSalt(spect, a)) + '$'; };
      var wr = nos.map(function (p) { return pairTxt(p[0], p[1]); });
      wr.push('$' + fT(ionSalt('K^+', 'Cl^-')) + '$ and $' + fT(ionSalt('Na^+', 'NO3^-')) + '$');
      return P('Which pair of solutions forms a precipitate when mixed?', mc(pairTxt(yes[0], yes[1]), wr),
        ['Swap partners and check the two new combinations.', 'In the right pair, ' + saltName(yes[0], yes[1]) + ', $' + fT(ionSalt(yes[0], yes[1])) + '$, is insoluble, so it falls out as a solid. The sodium or potassium nitrate stays dissolved.', 'In the other pairs every new combination is soluble, so the ions just stay mixed.'],
        'For each pair, imagine the cations trading anions. Is either new compound insoluble?', null, { k: 'which', v: ionSalt(yes[0], yes[1]) });
    }
    var pick = R.pick(PP.filter(function (p) { return p[2] === 'i'; })), c = pick[0], a = pick[1], mx = mixEq(c, a, spect);
    if (shape === 'balance') {
      return P('Solutions of $' + fT(mx.s1) + '$ and $' + fT(mx.s2) + '$ are mixed, and $' + fT(mx.ppt) + '$ precipitates. Balance the equation $$' + eqT(mx.eq, { skeleton: true }) + '$$ Type the coefficients in order, separated by commas (use 1 where no number is needed).',
        { t: 'tuple', v: mx.co.map(String) },
        ['The precipitate $' + fT(mx.ppt) + '$ needs ' + (mx.co[0]) + ' $' + fT(CAT[c][0] + (CAT[c][1] > 1 ? '^' + CAT[c][1] + '+' : '^+')) + '$ and ' + mx.co[1] + ' $' + fT(AN[a][0] + (AN[a][1] > 1 ? '^' + AN[a][1] + '-' : '^-')) + '$ to balance its charges.', 'Balanced: $$' + eqT(mx.eq) + '$$', 'The spectator ions, $' + fT(CAT[spect][0] + '^+') + '$ and $' + fT('NO3^-') + '$, stay dissolved as $' + fT(mx.s4) + '$.'],
        'Balance the precipitate\'s formula first, then the spectator compound.', null, { k: 'balance', eq: mx.eq, co: mx.co });
    }
    return P('Solutions of ' + saltName(c, 'NO3^-') + ' ($' + fT(mx.s1) + '$) and ' + saltName(spect, a) + ' ($' + fT(mx.s2) + '$) are mixed, and a solid forms. Write the formula of the precipitate.', formula(mx.ppt),
      ['The cations swap partners: the possible new compounds are $' + fT(mx.ppt) + '$ and $' + fT(mx.s4) + '$.', 'Sodium, potassium and nitrate compounds are always soluble, so the solid is ' + saltName(c, a) + '.', 'Balance the charges: $' + fT(CAT[c][0] + (CAT[c][1] > 1 ? '^' + CAT[c][1] + '+' : '^+')) + '$ and $' + fT(AN[a][0] + (AN[a][1] > 1 ? '^' + AN[a][1] + '-' : '^-')) + '$ give $' + fT(mx.ppt) + '$.'],
      'Swap partners, then use the solubility rules to see which new compound is insoluble.', null, { k: 'ppt', c: c, a: a, v: mx.ppt },
      ctx.level === 1 && (c === 'Ag^+' || c === 'Pb^2+' || c === 'Ba^2+') && (a === 'Cl^-' || a === 'I^-' || a === 'SO4^2-') ? { name: 'ch-particles', opts: { mode: 'mix', a: { f: mx.s1, n: 3 }, b: { f: mx.s2, n: 3 }, quiet: true } } : null);
  });


  // ================================================================== UNIT 12: ACIDS AND BASES
  var AB = [['HCl', 'acid', 'hydrochloric acid'], ['HNO3', 'acid', 'nitric acid'], ['H2SO4', 'acid', 'sulfuric acid'], ['HBr', 'acid', 'hydrobromic acid'], ['CH3COOH', 'acid', 'acetic acid'], ['HF', 'acid', 'hydrofluoric acid'],
    ['NaOH', 'base', 'sodium hydroxide'], ['KOH', 'base', 'potassium hydroxide'], ['Ca(OH)2', 'base', 'calcium hydroxide'], ['LiOH', 'base', 'lithium hydroxide'], ['NH3', 'base', 'ammonia'], ['Ba(OH)2', 'base', 'barium hydroxide'],
    ['HI', 'acid', 'hydroiodic acid'], ['HClO4', 'acid', 'perchloric acid'], ['HCOOH', 'acid', 'formic acid'], ['Sr(OH)2', 'base', 'strontium hydroxide'], ['KCl', 'neither', 'potassium chloride'], ['C12H22O11', 'neither', 'sucrose (table sugar)'],
    ['CH4', 'neither', 'methane'], ['CH3OH', 'neither', 'methanol'], ['C2H5OH', 'neither', 'ethanol'], ['C6H12O6', 'neither', 'glucose'], ['NaCl', 'neither', 'sodium chloride'], ['KNO3', 'neither', 'potassium nitrate']];
  var AB_WHY = {
    HCl: 'It gives its H⁺ to water: $\\mathrm{HCl} + \\mathrm{H}_{2}\\mathrm{O} \\to \\mathrm{H}_{3}\\mathrm{O}^{+} + \\mathrm{Cl}^{-}$.',
    HNO3: 'It gives its H⁺ to water, making $\\mathrm{H}_{3}\\mathrm{O}^{+}$ and nitrate ions.', H2SO4: 'It gives H⁺ to water, making $\\mathrm{H}_{3}\\mathrm{O}^{+}$.', HBr: 'It gives its H⁺ to water, making $\\mathrm{H}_{3}\\mathrm{O}^{+}$.',
    CH3COOH: 'The H on its COOH group can go to water, making some $\\mathrm{H}_{3}\\mathrm{O}^{+}$ (the H atoms on carbon stay put).', HF: 'It gives some of its H⁺ to water, making $\\mathrm{H}_{3}\\mathrm{O}^{+}$.',
    NaOH: 'It dissolves into $\\mathrm{Na}^{+}$ and $\\mathrm{OH}^{-}$ ions.', KOH: 'It dissolves into $\\mathrm{K}^{+}$ and $\\mathrm{OH}^{-}$ ions.', 'Ca(OH)2': 'It dissolves into $\\mathrm{Ca}^{2+}$ and $\\mathrm{OH}^{-}$ ions.',
    LiOH: 'It dissolves into $\\mathrm{Li}^{+}$ and $\\mathrm{OH}^{-}$ ions.', 'Ba(OH)2': 'It dissolves into $\\mathrm{Ba}^{2+}$ and $\\mathrm{OH}^{-}$ ions.',
    NH3: 'It has no OH, but it takes H⁺ from water: $\\mathrm{NH}_{3} + \\mathrm{H}_{2}\\mathrm{O} \\rightleftharpoons \\mathrm{NH}_{4}^{+} + \\mathrm{OH}^{-}$, so it makes $\\mathrm{OH}^{-}$.',
    CH4: 'Its H atoms are held tightly by carbon in nonpolar bonds; it gives no H⁺ to water. Having H in the formula does not make an acid.',
    CH3OH: 'Its OH group is bonded to carbon by a covalent bond and does not leave as $\\mathrm{OH}^{-}$; methanol dissolves as whole molecules. Having OH in the formula does not make a base.',
    C2H5OH: 'Ethanol dissolves as whole molecules; its OH group stays covalently bonded to carbon, so it is not a base.', C6H12O6: 'Glucose dissolves as whole molecules and makes neither $\\mathrm{H}_{3}\\mathrm{O}^{+}$ nor $\\mathrm{OH}^{-}$.',
    HI: 'It gives its H⁺ to water, making $\\mathrm{H}_{3}\\mathrm{O}^{+}$.', HClO4: 'It gives its H⁺ to water, making $\\mathrm{H}_{3}\\mathrm{O}^{+}$.', HCOOH: 'The H on its COOH group can go to water, making some $\\mathrm{H}_{3}\\mathrm{O}^{+}$.',
    'Sr(OH)2': 'It dissolves into $\\mathrm{Sr}^{2+}$ and $\\mathrm{OH}^{-}$ ions.', KCl: 'It dissolves into $\\mathrm{K}^{+}$ and $\\mathrm{Cl}^{-}$: a neutral salt.', C12H22O11: 'Sugar dissolves as whole molecules; its many OH groups stay bonded to carbon, so it is not a base.',
    NaCl: 'It dissolves into $\\mathrm{Na}^{+}$ and $\\mathrm{Cl}^{-}$, neither of which changes the amount of $\\mathrm{H}_{3}\\mathrm{O}^{+}$ or $\\mathrm{OH}^{-}$: a neutral salt.', KNO3: 'It dissolves into $\\mathrm{K}^{+}$ and $\\mathrm{NO}_{3}^{-}$: a neutral salt.' };
  G('chem.acid-base-definitions', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['classify', 'classify', 'ion', 'litmus', 'pick'], ['classify', 'ion', 'trouble', 'pick'], ['classify', 'trouble', 'countOH', 'pick']));
    if (shape === 'pick') {
      var role = R.pick(['acid', 'base']), right = R.pick(AB.filter(function (x) { return x[1] === role; })), wr = R.sample(AB.filter(function (x) { return x[1] !== role; }), 3);
      return P('Which of these is ' + (role === 'acid' ? 'an acid' : 'a base') + ' in water?', mc(right[2] + ', $' + fT(right[0]) + '$', wr.map(function (w) { return w[2] + ', $' + fT(w[0]) + '$'; })),
        [AB_WHY[right[0]]].concat(wr.filter(function (w) { return /CH4|CH3OH|C2H5OH|C12H22O11|C6H12O6/.test(w[0]); }).slice(0, 1).map(function (w) { return 'Not ' + w[2] + ': ' + AB_WHY[w[0]]; })),
        role === 'acid' ? 'Which one makes H₃O⁺ in water?' : 'Which one makes OH⁻ in water?', null, { k: 'pick', role: role, v: right[0] });
    }
    if (shape === 'litmus') {
      var isAcid = R.coin(), sub = R.pick(AB.filter(function (x) { return x[1] === (isAcid ? 'acid' : 'base') && x[0] !== 'HF'; }));
      return P('A solution of ' + sub[2] + ' is tested with litmus paper. What happens?', mc(isAcid ? 'Blue litmus turns red.' : 'Red litmus turns blue.', [isAcid ? 'Red litmus turns blue.' : 'Blue litmus turns red.', 'Both kinds of litmus turn green.', 'Nothing happens to either kind.']),
        [AB_WHY[sub[0]], isAcid ? 'Acids turn blue litmus red.' : 'Bases turn red litmus blue.'],
        'Is it an acid or a base?', null, { k: 'litmus' });
    }
    if (shape === 'ion') {
      var s = R.pick(AB.filter(function (x) { return x[1] !== 'neither' && x[0] !== 'HF'; }));
      return P('Which ion does ' + s[2] + ' ($' + fT(s[0]) + '$) add to water? Type its formula with the charge, such as $\\mathrm{Na}^{+}$ typed as Na^+.', formula(s[1] === 'acid' ? ['H3O^+', 'H^+'] : ['OH^-']),
        [AB_WHY[s[0]], s[1] === 'acid' ? 'Acids add hydronium ions, $\\mathrm{H}_{3}\\mathrm{O}^{+}$ (often written $\\mathrm{H}^{+}$ for short).' : 'Bases add hydroxide ions, $\\mathrm{OH}^{-}$.'],
        'Is it an acid or a base in water?', null, { k: 'ion', f: s[0] });
    }
    if (shape === 'countOH') {
      var bs = R.pick([['NaOH', 1], ['Ca(OH)2', 2], ['Ba(OH)2', 2], ['KOH', 1], ['LiOH', 1], ['Sr(OH)2', 2]]), n = R.pick([0.10, 0.25, 0.30, 0.50, 1.20, 0.050, 0.15, 0.40, 0.75, 2.0]), nOH = n * bs[1];
      return P('$' + gx(n) + '\\ \\text{mol}$ of $' + fT(bs[0]) + '$ dissolves completely in water. How many moles of hydroxide ions does it release?', ans(nOH, 0.01),
        ['$' + fT(bs[0]) + ' \\to ' + (bs[0] === 'Ca(OH)2' ? '\\mathrm{Ca}^{2+} + 2\\mathrm{OH}^{-}' : bs[0] === 'Ba(OH)2' ? '\\mathrm{Ba}^{2+} + 2\\mathrm{OH}^{-}' : bs[0] === 'Sr(OH)2' ? '\\mathrm{Sr}^{2+} + 2\\mathrm{OH}^{-}' : fT(bs[0].replace('OH', '') + '^+') + ' + \\mathrm{OH}^{-}') + '$: each formula unit releases ' + bs[1] + ' $\\mathrm{OH}^{-}$.', '$' + gx(n) + ' \\times ' + bs[1] + ' = ' + qx(nOH, 'mol') + '$ of $\\mathrm{OH}^{-}$.'],
        'Count the OH groups in one formula unit.', 'mol', { k: 'countOH', n: n, per: bs[1], v: nOH });
    }
    var pool = shape === 'trouble' ? AB.filter(function (x) { return /CH4|CH3OH|C2H5OH|NH3|C6H12O6/.test(x[0]); }) : AB;
    var t = R.pick(pool), idx = ['acid', 'base', 'neither'].indexOf(t[1]);
    return P('In water, is ' + t[2] + ' ($' + fT(t[0]) + '$) an acid, a base or neither?', mcAll(['an acid', 'a base', 'neither'], idx, true),
      [AB_WHY[t[0]], 'An acid makes $\\mathrm{H}_{3}\\mathrm{O}^{+}$ in water; a base makes $\\mathrm{OH}^{-}$. Look at what the substance does in water, not just at the letters in its formula.'],
      'What ion, if any, does it add to water?', null, { k: 'classify', f: t[0], v: idx });
  });

  // conjugate pairs [acid, base]
  var CONJ = [['HCl', 'Cl^-', 1], ['HNO3', 'NO3^-', 1], ['HF', 'F^-', 1], ['H2O', 'OH^-', 1], ['NH4^+', 'NH3', 1], ['H3O^+', 'H2O', 1], ['HBr', 'Br^-', 1],
    ['H2SO4', 'HSO4^-', 2], ['HSO4^-', 'SO4^2-', 2], ['HCO3^-', 'CO3^2-', 2], ['H2PO4^-', 'HPO4^2-', 2], ['H2CO3', 'HCO3^-', 2], ['CH3COOH', 'CH3COO^-', 2], ['HPO4^2-', 'PO4^3-', 2], ['HCN', 'CN^-', 2]];
  var ALT = { 'CH3COO^-': ['CH3COO^-', 'C2H3O2^-'], CH3COOH: ['CH3COOH', 'HC2H3O2'], 'H3O^+': ['H3O^+'] };
  // [equation, acid, base, conjugate base of the acid, conjugate acid of the base]
  var BLR = [
    ['HF + H2O <=> F^- + H3O^+', 'HF', 'H2O', 'F^-', 'H3O^+'], ['NH3 + H2O <=> NH4^+ + OH^-', 'H2O', 'NH3', 'OH^-', 'NH4^+'], ['HCO3^- + OH^- <=> CO3^2- + H2O', 'HCO3^-', 'OH^-', 'CO3^2-', 'H2O'],
    ['CH3COOH + NH3 <=> CH3COO^- + NH4^+', 'CH3COOH', 'NH3', 'CH3COO^-', 'NH4^+'], ['CO3^2- + H2O <=> HCO3^- + OH^-', 'H2O', 'CO3^2-', 'OH^-', 'HCO3^-'], ['HCl + NH3 -> NH4^+ + Cl^-', 'HCl', 'NH3', 'Cl^-', 'NH4^+'],
    ['H2O + HNO3 -> H3O^+ + NO3^-', 'HNO3', 'H2O', 'NO3^-', 'H3O^+'], ['HSO4^- + H2O <=> SO4^2- + H3O^+', 'HSO4^-', 'H2O', 'SO4^2-', 'H3O^+'], ['NH4^+ + OH^- <=> NH3 + H2O', 'NH4^+', 'OH^-', 'NH3', 'H2O']
  ];
  function wrongBase(a) { // plausible wrong conjugate bases: remove OH, forget the charge, remove two H+
    var out = [], p = parseF(a), q = p.charge;
    var stripH = function (f) { return f.replace(/^H(\d?)/, function (w, d) { var n = d ? +d - 1 : 0; return n ? 'H' + (n > 1 ? n : '') : ''; }); };
    var base = a.replace(/\^.*$/, ''), b1 = stripH(base), ch = function (z) { return z === 0 ? '' : z === 1 ? '^+' : z === -1 ? '^-' : '^' + M.abs(z) + (z > 0 ? '+' : '-'); };
    if (/OH/.test(base)) out.push(base.replace('OH', '') + ch(q + 1));
    out.push(b1 + ch(q));
    out.push(stripH(b1) + ch(q - 2));
    out.push('H' + base + ch(q + 1));
    return out.filter(function (f) { return f && !/^\^/.test(f) && f !== a; });
  }
  G('chem.bronsted-lowry', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['cbase', 'cacid', 'which'], ['cbase', 'cacid', 'which', 'pair'], ['cbase', 'cacid', 'which', 'pair']));
    var lvl = ctx.level || 1, pool = CONJ.filter(function (c) { return c[2] <= (lvl === 1 ? 1 : 2); });
    if (shape === 'cbase' || shape === 'cacid') {
      var c = R.pick(pool.filter(function (x) { return shape === 'cbase' ? x[0] !== 'H3O^+' : x[1] !== 'H2O' || R.chance(0.5); }));
      var given = shape === 'cbase' ? c[0] : c[1], want = shape === 'cbase' ? c[1] : c[0];
      return P('What is the conjugate ' + (shape === 'cbase' ? 'base' : 'acid') + ' of $' + fT(given) + '$? Type the formula with its charge (for example, $\\mathrm{NO}_{3}^{-}$ is typed NO3^-).', formula(ALT[want] || [want]),
        [shape === 'cbase' ? 'A conjugate base is what is left after the acid gives away one $\\mathrm{H}^{+}$: remove one H and lower the charge by 1.' : 'A conjugate acid is what forms when the base accepts one $\\mathrm{H}^{+}$: add one H and raise the charge by 1.',
          '$' + fT(given) + (shape === 'cbase' ? ' - \\mathrm{H}^{+} = ' : ' + \\mathrm{H}^{+} = ') + fT(want) + '$.'],
        shape === 'cbase' ? 'Take away one H⁺: one H and one positive charge.' : 'Add one H⁺: one H and one positive charge.', null, { k: shape, given: given, v: want });
    }
    var r = R.pick(lvl === 1 ? BLR.slice(0, 6) : BLR), E = parseEq(r[0]);
    if (shape === 'which') {
      var role = R.pick(['acid', 'base']), right = role === 'acid' ? r[1] : r[2], others = E.L.concat(E.R).map(function (t) { return t.f; }).filter(function (f) { return f !== right; });
      return P('In the reaction $$' + eqT(E) + '$$ which species on the left acts as the Brønsted–Lowry ' + role + ' (the proton ' + (role === 'acid' ? 'donor' : 'acceptor') + ')?', mc('$' + fT(right) + '$', others.map(function (f) { return '$' + fT(f) + '$'; })),
        ['Follow the $\\mathrm{H}^{+}$: $' + fT(r[1]) + '$ loses one H⁺ (becoming $' + fT(r[3]) + '$), and $' + fT(r[2]) + '$ gains it (becoming $' + fT(r[4]) + '$).', 'The donor is the acid, the acceptor is the base: the ' + role + ' is $' + fT(right) + '$.' + (/H2O/.test(right) ? ' Water can play either role, depending on its partner.' : '')],
        'Which species on the left loses an H⁺ on its way to the right?', null, { k: 'which', eq: r[0], role: role, v: right });
    }
    var cp = R.pick(pool.filter(function (x) { return x[0] !== 'H3O^+'; })), wrongs = [];
    var distract = [[cp[0], wrongBase(cp[0])[0] || 'H2O'], ['H3O^+', 'OH^-'], [cp[0], 'H2O'], ['H2SO4', 'SO4^2-'], ['NH4^+', 'NH2^-'], ['HCl', 'H^+']];
    distract.forEach(function (d) { if (d[1] !== cp[1] && d[0] !== d[1]) wrongs.push('$' + fT(d[0]) + '$ and $' + fT(d[1]) + '$'); });
    return P('Which is a conjugate acid–base pair?', mc('$' + fT(cp[0]) + '$ and $' + fT(cp[1]) + '$', wrongs.slice(0, 5)),
      ['A conjugate pair differs by exactly one $\\mathrm{H}^{+}$.', '$' + fT(cp[0]) + '$ minus one $\\mathrm{H}^{+}$ is $' + fT(cp[1]) + '$. In the other pairs the difference is zero, two $\\mathrm{H}^{+}$, or not an $\\mathrm{H}^{+}$ at all.'],
      'Look for two formulas that differ by one H and one unit of charge.', null, { k: 'pair', v: cp });
  });

  G('chem.ph-scale', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['conc2pH', 'pH2conc', 'factor', 'classify'], ['factor', 'conc2pH', 'factor', 'classify'], ['strong', 'dilute', 'factor']));
    if (shape === 'conc2pH') {
      var nexp = R.int(1, 13), Hc = '1 \\times 10^{-' + nexp + '}';
      return P('A solution has $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = ' + Hc + '\\ \\text{M}$. What is its pH?', exact(nexp),
        ['pH is the power of ten with its sign flipped: $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = 1 \\times 10^{-\\text{pH}}$.', 'Here the exponent is $-' + nexp + '$, so the pH is ' + nexp + '. ' + (nexp < 7 ? 'Below 7: acidic.' : nexp > 7 ? 'Above 7: basic.' : 'Exactly 7: neutral.')],
        'Read the power of ten.', null, { k: 'conc2pH', v: nexp }, { name: 'ch-phscale', opts: { H3O: M.pow(10, -nexp), quiet: true, show: ['conc'] } });
    }
    if (shape === 'pH2conc') {
      var ph = R.int(1, 13);
      return P('A solution has a pH of ' + ph + '. What is $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$ in mol/L? (Scientific notation such as 1e-5 is fine.)', { t: 'num', v: '1*10^-' + ph, rtol: 0.01 },
        ['$[\\mathrm{H}_{3}\\mathrm{O}^{+}] = 1 \\times 10^{-\\text{pH}}$.', '$[\\mathrm{H}_{3}\\mathrm{O}^{+}] = 1 \\times 10^{-' + ph + '}\\ \\text{M}$.'],
        'The pH is the power of ten, with a minus sign.', 'M', { k: 'pH2conc', pH: ph, v: M.pow(10, -ph) });
    }
    if (shape === 'classify') {
      var p2 = R.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 7, 6.5, 8.3]), k = p2 < 7 ? 0 : p2 > 7 ? 1 : 2;
      return P('A solution at 25 °C has a pH of ' + gx(p2) + '. Is it acidic, basic or neutral?', mcAll(['acidic', 'basic', 'neutral'], k, true),
        ['At 25 °C, pH 7 is neutral; below 7 is acidic and above 7 is basic.', 'pH ' + gx(p2) + ' is ' + ['acidic', 'basic', 'neutral'][k] + '.'],
        'Compare the pH with 7.', null, { k: 'classify', v: k }, { name: 'ch-phscale', opts: { pH: p2, quiet: true } });
    }
    if (shape === 'strong') {
      var e = R.int(1, 4), cs = '0.' + '0'.repeat(e - 1) + '1';
      return P('Hydrochloric acid ionizes completely in water. What is the pH of $' + cs + '\\ \\text{M}$ HCl?', exact(e),
        ['Every HCl gives one $\\mathrm{H}_{3}\\mathrm{O}^{+}$, so $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = ' + cs + '\\ \\text{M} = 1 \\times 10^{-' + e + '}\\ \\text{M}$.', 'pH $= ' + e + '$.'],
        'Write the concentration as a power of ten.', null, { k: 'strong', v: e });
    }
    if (shape === 'dilute') {
      var p0 = R.int(1, 3), f = R.pick([10, 100, 1000]), d = M.round(M.log10(f));
      return P('A strong acid solution has a pH of ' + p0 + '. It is diluted with water to ' + T.commas(f) + ' times its volume. What is the new pH?', exact(p0 + d),
        ['Diluting ' + T.commas(f) + ' times cuts $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$ to $1/' + T.commas(f).replace(/,/g, '{,}') + '$ of what it was: from $10^{-' + p0 + '}$ to $10^{-' + (p0 + d) + '}\\ \\text{M}$.', 'Each factor of 10 raises the pH by 1, so the pH goes from ' + p0 + ' to ' + (p0 + d) + '.'],
        'How many factors of ten is the dilution?', null, { k: 'dilute', v: p0 + d });
    }
    var a, b;
    do { a = R.int(1, 12); b = R.int(2, 13); } while (b <= a || b - a > lv(ctx, 3, 5, 6));
    var ratio = M.pow(10, b - a);
    var ctxS = 'Solution A has a pH of ' + a + ' and solution B has a pH of ' + b + '.';
    return P(ctxS + ' How many times greater is $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$ in the solution with pH ' + a + '?', exact(ratio),
      ['Each step of 1 on the pH scale is a factor of 10 in $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$.', 'The pH values differ by $' + b + ' - ' + a + ' = ' + (b - a) + '$, so the factor is $10^{' + (b - a) + '} = ' + T.commas(ratio).replace(/,/g, '{,}') + '$.', 'Not ' + (b - a) + ' times: the scale counts powers of ten.'],
      'Each pH step is a factor of ten.', null, { k: 'factor', a: a, b: b, v: ratio }, ctx.level === 1 ? { name: 'ch-phscale', opts: { pH: a, quiet: true } } : null);
  });

  G('chem.ph-poh', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['pOH', 'OHfromH', 'tf'], ['OHcoef', 'OHfromPH', 'pOH', 'tf'], ['base', 'OHcoef', 'HfromOH']));
    if (shape === 'tf') {
      var t = R.pick([['A basic solution contains no $\\mathrm{H}_{3}\\mathrm{O}^{+}$ ions at all.', false, 'Every water solution contains both ions, because $[\\mathrm{H}_{3}\\mathrm{O}^{+}][\\mathrm{OH}^{-}] = 1.0 \\times 10^{-14}$. In a basic solution $\\mathrm{H}_{3}\\mathrm{O}^{+}$ is outnumbered by $\\mathrm{OH}^{-}$, but it is never zero.'],
        ['Pure water contains no ions.', false, 'Water molecules trade $\\mathrm{H}^{+}$ with each other, so pure water at 25 °C holds $1.0 \\times 10^{-7}\\ \\text{M}$ of $\\mathrm{H}_{3}\\mathrm{O}^{+}$ and the same amount of $\\mathrm{OH}^{-}$.'],
        ['In pure water at 25 °C, $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = [\\mathrm{OH}^{-}] = 1.0 \\times 10^{-7}\\ \\text{M}$.', true, 'The two are equal in pure water, and their product is $1.0 \\times 10^{-14}$, so each is $10^{-7}$ M.'],
        ['If $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$ goes up, $[\\mathrm{OH}^{-}]$ goes down.', true, 'Their product stays $1.0 \\times 10^{-14}$ at 25 °C, so when one rises the other falls.'],
        ['At 25 °C, a solution with pH 3 has a pOH of 3.', false, 'pH + pOH = 14, so the pOH is 11.']]);
      return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Remember $[\\mathrm{H}_{3}\\mathrm{O}^{+}][\\mathrm{OH}^{-}] = 1.0 \\times 10^{-14}$ in every water solution at 25 °C.', null, { k: 'tf' });
    }
    if (shape === 'pOH') {
      var ph = rnd(R.int(10, 130) / 10, 1);
      return P('A solution at 25 °C has a pH of ' + ph.toFixed(1) + '. What is its pOH?', { t: 'num', v: String(fix(14 - ph)), tol: 0.02 },
        ['At 25 °C, pH + pOH = 14.', 'pOH $= 14 - ' + ph.toFixed(1) + ' = ' + (14 - ph).toFixed(1) + '$.'],
        'pH and pOH add to 14.', null, { k: 'pOH', pH: ph, v: fix(14 - ph) });
    }
    if (shape === 'OHfromH' || shape === 'OHfromPH') {
      var e = R.int(1, 13), q;
      if (shape === 'OHfromH') q = 'A solution at 25 °C has $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = 1.0 \\times 10^{-' + e + '}\\ \\text{M}$. What is $[\\mathrm{OH}^{-}]$? (Scientific notation such as 1e-9 is fine.)';
      else q = 'A solution at 25 °C has a pH of ' + e + '. What is $[\\mathrm{OH}^{-}]$? (Scientific notation such as 1e-9 is fine.)';
      return P(q, { t: 'num', v: '1*10^-' + (14 - e), rtol: 0.01 },
        [(shape === 'OHfromPH' ? 'pH ' + e + ' means $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = 1.0 \\times 10^{-' + e + '}\\ \\text{M}$. ' : '') + 'Use $[\\mathrm{H}_{3}\\mathrm{O}^{+}][\\mathrm{OH}^{-}] = 1.0 \\times 10^{-14}$.', '$[\\mathrm{OH}^{-}] = \\dfrac{1.0 \\times 10^{-14}}{1.0 \\times 10^{-' + e + '}} = 1.0 \\times 10^{-' + (14 - e) + '}\\ \\text{M}$ (subtract the exponents).'],
        'The exponents of the two concentrations add to −14.', 'M', { k: 'OH', H: M.pow(10, -e), v: M.pow(10, -(14 - e)) });
    }
    if (shape === 'OHcoef' || shape === 'HfromOH') {
      var cf2 = R.pick([2.0, 4.0, 5.0, 2.5, 8.0]), e2 = R.int(3, 11), given = cf2 * M.pow(10, -e2), res = 1e-14 / given;
      var gN = shape === 'OHcoef' ? '[\\mathrm{H}_{3}\\mathrm{O}^{+}]' : '[\\mathrm{OH}^{-}]', aN = shape === 'OHcoef' ? '[\\mathrm{OH}^{-}]' : '[\\mathrm{H}_{3}\\mathrm{O}^{+}]';
      return P('A solution at 25 °C has $' + gN + ' = ' + cf2.toFixed(1) + ' \\times 10^{-' + e2 + '}\\ \\text{M}$. What is $' + aN + '$? (Scientific notation such as 2.5e-9 is fine.)', ans(res, 0.01),
        ['$[\\mathrm{H}_{3}\\mathrm{O}^{+}][\\mathrm{OH}^{-}] = 1.0 \\times 10^{-14}$, so $' + aN + ' = \\dfrac{1.0 \\times 10^{-14}}{' + cf2.toFixed(1) + ' \\times 10^{-' + e2 + '}}$.', 'Divide the numbers and subtract the exponents: $\\dfrac{1.0}{' + cf2.toFixed(1) + '} \\times 10^{-14 + ' + e2 + '} = ' + fx(res, 2) + '\\ \\text{M}$.'],
        'Divide $1.0 \\times 10^{-14}$ by the concentration you know.', 'M', { k: shape, given: given, v: res });
    }
    var bs = R.pick([['NaOH', 1], ['KOH', 1]]), ex = R.int(1, 4), cs = M.pow(10, -ex), phB = 14 - ex;
    return P('$' + fT(bs[0]) + '$ dissolves completely into ions. What is the pH of $' + gx(cs) + '\\ \\text{M}$ $' + fT(bs[0]) + '$ at 25 °C?', exact(phB),
      ['$[\\mathrm{OH}^{-}] = ' + gx(cs) + '\\ \\text{M} = 1 \\times 10^{-' + ex + '}\\ \\text{M}$, so pOH $= ' + ex + '$.', 'pH $= 14 - ' + ex + ' = ' + phB + '$.'],
      'Find the pOH from $[\\mathrm{OH}^{-}]$ first.', null, { k: 'base', OH: cs, v: phB });
  });

  var STRONG = ['HCl', 'HBr', 'HI', 'HNO3', 'H2SO4', 'HClO4'], WEAK = ['CH3COOH', 'HF', 'HCN', 'HCOOH', 'HNO2', 'H2CO3'];
  var ACNAME = { HCl: 'hydrochloric acid', HBr: 'hydrobromic acid', HI: 'hydroiodic acid', HNO3: 'nitric acid', H2SO4: 'sulfuric acid', HClO4: 'perchloric acid', CH3COOH: 'acetic acid', HF: 'hydrofluoric acid', HCN: 'hydrocyanic acid', HCOOH: 'formic acid', HNO2: 'nitrous acid', H2CO3: 'carbonic acid' };
  // percent ionized of acetic acid (Ka = 1.8e-5, OpenStax Appendix H) at a few concentrations, from the exact quadratic
  function pctAcetic(C) { var Ka = 1.8e-5, x = (-Ka + M.sqrt(Ka * Ka + 4 * Ka * C)) / 2; return x / C * 100; }
  G('chem.strong-weak-acids', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['classify', 'strongH', 'compare'], ['classify', 'weakH', 'compare', 'strongH'], ['weakH', 'trap', 'meaning']));
    if (shape === 'classify') {
      var isS = R.coin(), a = R.pick(isS ? STRONG : WEAK);
      return P('Is ' + ACNAME[a] + ' ($' + fT(a) + '$) a strong acid or a weak acid?', mcAll(['strong', 'weak'], isS ? 0 : 1, true),
        [isS ? 'It is one of the few common strong acids ($\\mathrm{HCl}$, $\\mathrm{HBr}$, $\\mathrm{HI}$, $\\mathrm{HNO}_{3}$, $\\mathrm{H}_{2}\\mathrm{SO}_{4}$, $\\mathrm{HClO}_{4}$): essentially every molecule gives its H⁺ to water.' : 'It is not on the short list of strong acids, so only a small fraction of its molecules give their H⁺ to water at any moment.'],
        'Learn the short list of strong acids; most other acids are weak.', null, { k: 'classify', v: isS });
    }
    if (shape === 'strongH') {
      var s = R.pick(['HCl', 'HNO3', 'HBr', 'HI']), C = R.pick([0.10, 0.050, 0.25, 0.0020, 0.015, 1.0]);
      return P('What is $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$ in $' + gx(C) + '\\ \\text{M}$ ' + ACNAME[s] + ' ($' + fT(s) + '$), a strong acid?', ans(C, 0.01),
        ['A strong acid ionizes completely: each $' + fT(s) + '$ gives one $\\mathrm{H}_{3}\\mathrm{O}^{+}$.', 'So $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = ' + qg(C, 'M') + '$.'],
        'How many of the acid molecules give away their H⁺?', 'M', { k: 'strongH', v: C });
    }
    if (shape === 'weakH') {
      var Cw = R.pick([0.10, 0.50, 1.0, 0.20, 0.050]), pc = sgf(pctAcetic(Cw), 2), H = Cw * pc / 100;
      return P('In $' + gx(Cw) + '\\ \\text{M}$ acetic acid, only about $' + gx(pc) + '\\%$ of the molecules are ionized at any moment. What is $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$? (Scientific notation such as 1.3e-3 is fine.)', ans(H, 0.02),
        ['Each ionized molecule makes one $\\mathrm{H}_{3}\\mathrm{O}^{+}$.', '$[\\mathrm{H}_{3}\\mathrm{O}^{+}] = ' + gx(pc) + '\\% \\times ' + gx(Cw) + '\\ \\text{M} = ' + gx(pc / 100) + ' \\times ' + gx(Cw) + ' = ' + qx(H, 'M', 2) + '$.', 'Compare: the same concentration of a strong acid would give $' + qg(Cw, 'M') + '$.'],
        'Take that percent of the concentration.', 'M', { k: 'weakH', C: Cw, pct: pc, v: H });
    }
    if (shape === 'compare') {
      var sA = R.pick(['HCl', 'HNO3', 'HBr']), wA = R.pick(['CH3COOH', 'HF', 'HCOOH', 'HCN']), Cc = R.pick([0.10, 0.50, 1.0, 0.010]);
      return P('Two solutions have the same concentration, $' + gx(Cc) + '\\ \\text{M}$: one of $' + fT(sA) + '$ and one of $' + fT(wA) + '$. Which has the lower pH?', mc('The $' + fT(sA) + '$ solution', ['The $' + fT(wA) + '$ solution', 'Both have the same pH, because the concentrations are equal.', 'It cannot be told without a pH meter.']),
        ['$' + fT(sA) + '$ is strong: every molecule makes $\\mathrm{H}_{3}\\mathrm{O}^{+}$. $' + fT(wA) + '$ is weak: only a small fraction does.', 'More $\\mathrm{H}_{3}\\mathrm{O}^{+}$ means a lower pH, so the strong acid has the lower pH.'],
        'Same concentration, but which one ionizes more?', null, { k: 'compare' }, { name: 'ch-particles', opts: { mode: 'ionize', acids: [sA === 'HBr' ? 'HCl' : sA, wA], C: 8, quiet: true, motion: false } });
    }
    if (shape === 'trap') {
      return P('Which has more $\\mathrm{H}_{3}\\mathrm{O}^{+}$: $0.0010\\ \\text{M}$ hydrochloric acid (strong) or vinegar, about $0.83\\ \\text{M}$ acetic acid (weak), in which about $0.47\\%$ of the molecules are ionized?', mc('The vinegar', ['The hydrochloric acid, because a strong acid always has more H₃O⁺', 'They have the same amount.', 'Neither has any H₃O⁺.']),
        ['HCl: all of it ionizes, so $[\\mathrm{H}_{3}\\mathrm{O}^{+}] = 1.0 \\times 10^{-3}\\ \\text{M}$ (pH 3.0).', 'Vinegar: $0.0047 \\times 0.83 = 3.9 \\times 10^{-3}\\ \\text{M}$ (pH about 2.4).', 'The concentrated weak acid wins here. Strength (how much ionizes) and concentration (how much acid there is) are different ideas.'],
        'Work out $[\\mathrm{H}_{3}\\mathrm{O}^{+}]$ for each.', null, { k: 'trap' });
    }
    return P('What does it mean to call an acid "weak"?', mc('Only a small fraction of its molecules give their H⁺ to water.', ['It is dilute: there is only a little acid in the water.', 'It cannot react with a base.', 'Its pH is always close to 7.']),
      ['"Weak" is about the acid itself: how much of it ionizes. "Dilute" is about how much acid is in the water.', 'A weak acid can be concentrated (like vinegar) and a strong acid can be dilute.'],
      'Strength and concentration are different ideas.', null, { k: 'meaning' });
  });

  // acid, H+ count, base, OH- count, salt
  var NEUT = [['HCl', 1, 'NaOH', 1, 'NaCl'], ['HNO3', 1, 'KOH', 1, 'KNO3'], ['H2SO4', 2, 'NaOH', 1, 'Na2SO4'], ['HCl', 1, 'Ca(OH)2', 2, 'CaCl2'], ['HNO3', 1, 'Mg(OH)2', 2, 'Mg(NO3)2'],
    ['H2SO4', 2, 'KOH', 1, 'K2SO4'], ['HBr', 1, 'LiOH', 1, 'LiBr'], ['HCl', 1, 'Ba(OH)2', 2, 'BaCl2'], ['HNO3', 1, 'Ca(OH)2', 2, 'Ca(NO3)2'], ['HCl', 1, 'KOH', 1, 'KCl'], ['H2SO4', 2, 'Ba(OH)2', 2, 'BaSO4'],
    ['HBr', 1, 'KOH', 1, 'KBr'], ['HI', 1, 'KOH', 1, 'KI'], ['HCl', 1, 'LiOH', 1, 'LiCl'], ['H2SO4', 2, 'LiOH', 1, 'Li2SO4'], ['H3PO4', 3, 'KOH', 1, 'K3PO4'], ['HBr', 1, 'Ca(OH)2', 2, 'CaBr2'],
    ['H2SO4', 2, 'Mg(OH)2', 2, 'MgSO4'], ['HClO4', 1, 'NaOH', 1, 'NaClO4'], ['H3PO4', 3, 'NaOH', 1, 'Na3PO4']];
  function neutEq(n) { var g = gcd(n[1], n[3]), a = n[3] / g, b = n[1] / g, w = a * n[1]; return { eq: (a > 1 ? a : '') + n[0] + ' + ' + (b > 1 ? b : '') + n[2] + ' -> ' + n[4] + ' + ' + (w > 1 ? w : '') + 'H2O', co: [a, b, 1, w] }; }
  G('chem.neutralization', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['salt', 'salt', 'mix'], ['moles', 'salt', 'mix'], ['moles', 'balance', 'mix']));
    var n = R.pick(NEUT.filter(function (x) { return x[4] !== 'BaSO4' || shape === 'balance'; })), ne = neutEq(n);
    if (shape === 'salt') {
      return P('Write the formula of the salt formed when ' + nm(n[0]) + ' ($' + fT(n[0]) + '$) is neutralized by ' + nm(n[2]) + ' ($' + fT(n[2]) + '$).', formula(n[4]),
        ['Acid + hydroxide base → salt + water. The $\\mathrm{H}^{+}$ and $\\mathrm{OH}^{-}$ become water.', 'The salt is the base\'s cation with the acid\'s anion, charges balanced: $' + fT(n[4]) + '$.', '$$' + eqT(ne.eq) + '$$'],
        'Pair the metal ion from the base with the anion from the acid.', null, { k: 'salt', v: n[4] });
    }
    if (shape === 'balance') {
      return P('Balance the neutralization $$' + eqT(ne.eq, { skeleton: true }) + '$$ Type the coefficients in order, separated by commas (write 1 where no number is needed).', { t: 'tuple', v: ne.co.map(String) },
        ['Each $\\mathrm{H}^{+}$ from the acid meets one $\\mathrm{OH}^{-}$ from the base to make one $\\mathrm{H}_{2}\\mathrm{O}$.', '$' + fT(n[0]) + '$ gives ' + n[1] + ' H⁺ and $' + fT(n[2]) + '$ gives ' + n[3] + ' OH⁻, so they react in the ratio $' + ne.co[0] + ' : ' + ne.co[1] + '$, making ' + ne.co[3] + ' water.', '$$' + eqT(ne.eq) + '$$'],
        'Match the number of H⁺ with the number of OH⁻.', null, { k: 'balance', eq: ne.eq, co: ne.co });
    }
    if (shape === 'moles') {
      var na = R.pick([0.10, 0.20, 0.25, 0.30, 0.50, 0.15, 0.050, 0.40, 0.60, 1.2]), nb = na * n[1] / n[3];
      return P('How many moles of $' + fT(n[2]) + '$ exactly neutralize $' + gx(na) + '\\ \\text{mol}$ of $' + fT(n[0]) + '$?', ans(nb, 0.01),
        ['$' + gx(na) + '\\ \\text{mol}\\ ' + fT(n[0]) + '$ gives $' + gx(na) + ' \\times ' + n[1] + ' = ' + gx(na * n[1]) + '\\ \\text{mol}$ of $\\mathrm{H}^{+}$.', 'Each $' + fT(n[2]) + '$ gives ' + n[3] + ' $\\mathrm{OH}^{-}$, so it takes $' + gx(na * n[1]) + ' \\div ' + n[3] + ' = ' + qx(nb, 'mol') + '$ of $' + fT(n[2]) + '$.', 'Equation: $$' + eqT(ne.eq) + '$$'],
        'Match moles of H⁺ with moles of OH⁻.', 'mol', { k: 'moles', na: na, h: n[1], oh: n[3], v: nb });
    }
    var nh = R.pick([0.10, 0.20, 0.30, 0.050, 0.15, 0.25, 0.40, 0.60]), kind = R.int(0, 2), nOH = kind === 2 ? nh : kind === 0 ? nh * R.pick([0.5, 0.25, 0.8]) : nh * R.pick([1.5, 2, 1.25]);
    var acidM = nh, baseM = nOH;
    return P('A solution with $' + gx(acidM) + '\\ \\text{mol}$ of HCl is mixed with a solution of $' + gx(fix(baseM)) + '\\ \\text{mol}$ of NaOH. After the reaction, is the mixture acidic, basic or neutral?', mcAll(['acidic', 'basic', 'neutral'], kind, true),
      ['HCl gives $' + gx(acidM) + '\\ \\text{mol}$ of $\\mathrm{H}^{+}$; NaOH gives $' + gx(fix(baseM)) + '\\ \\text{mol}$ of $\\mathrm{OH}^{-}$. They react one to one.', kind === 2 ? 'They are equal, so both are used up: neutral, pH 7.' : kind === 0 ? 'There is more H⁺ than OH⁻, so $' + gx(fix(acidM - baseM)) + '\\ \\text{mol}$ of acid is left over: acidic.' : 'There is more OH⁻ than H⁺, so $' + gx(fix(baseM - acidM)) + '\\ \\text{mol}$ of base is left over: basic.', 'Mixing an acid and a base gives pH 7 only when the moles match.'],
      'Compare moles of H⁺ and moles of OH⁻.', null, { k: 'mix', v: kind });
  });

  var TIT = [['HCl', 1], ['HNO3', 1], ['CH3COOH', 1], ['H2SO4', 2]];
  G('chem.titration', function (R, ctx) {
    var lvl = ctx.level || 1, acid = R.pick(lvl === 1 ? TIT.slice(0, 3) : lvl === 2 ? TIT.concat([['H2SO4', 2]]) : TIT), shape = lvl === 3 ? R.pick(['conc', 'vol', 'vol']) : 'conc';
    var Mb = R.pick([0.100, 0.200, 0.150, 0.250, 0.0500]), Va = R.pick([10.0, 20.0, 25.0, 50.0]), Vb, Ma;
    if (shape === 'vol') {
      Ma = R.pick([0.0800, 0.120, 0.100, 0.0500, 0.150]); Vb = acid[1] * Ma * Va / Mb;
      return P('What volume of $' + gx(Mb) + '\\ \\text{M}$ NaOH is needed to reach the equivalence point with $' + gx(Va) + '\\ \\text{mL}$ of $' + gx(Ma) + '\\ \\text{M}$ $' + fT(acid[0]) + '$?', ans(Vb, 0.01),
        ['Moles of acid: $' + gx(Ma) + '\\ \\text{M} \\times ' + gx(Va / 1000) + '\\ \\text{L} = ' + qx(Ma * Va / 1000, 'mol', 3) + '$.', acid[1] === 2 ? 'Each $\\mathrm{H}_{2}\\mathrm{SO}_{4}$ gives two H⁺: $\\mathrm{H}_{2}\\mathrm{SO}_{4} + 2\\mathrm{NaOH} \\to \\mathrm{Na}_{2}\\mathrm{SO}_{4} + 2\\mathrm{H}_{2}\\mathrm{O}$, so NaOH needed $= 2 \\times ' + fx(Ma * Va / 1000, 3) + ' = ' + qx(2 * Ma * Va / 1000, 'mol', 3) + '$.' : 'The ratio is 1 : 1, so NaOH needed $= ' + qx(Ma * Va / 1000, 'mol', 3) + '$.', 'Volume: $' + fx(acid[1] * Ma * Va / 1000, 3) + '\\ \\text{mol} \\div ' + gx(Mb) + '\\ \\text{M} = ' + qx(acid[1] * Ma * Va / 1000 / Mb, 'L', 3) + ' = ' + qx(Vb, 'mL') + '$.'],
        'Moles of acid → moles of base (mole ratio) → volume of base.', 'mL', { k: 'titV', acidH: acid[1], Ma: Ma, Va: Va, Mb: Mb, v: Vb });
    }
    Vb = rnd(R.int(80, 450) / 10, 1); if (lvl === 1) Vb = R.pick([10.0, 12.5, 15.0, 20.0, 25.0, 30.0, 40.0]);
    var nb = Mb * Vb / 1000, na = nb / acid[1]; Ma = na / (Va / 1000);
    return P('A $' + gx(Va) + '\\ \\text{mL}$ sample of $' + fT(acid[0]) + '$ solution is titrated with $' + gx(Mb) + '\\ \\text{M}$ NaOH. The indicator changes color after $' + Vb.toFixed(1) + '\\ \\text{mL}$ of base has been added. What is the molarity of the acid?', ans(Ma, 0.01),
      ['Moles of NaOH used: $' + gx(Mb) + '\\ \\text{M} \\times ' + gx(Vb / 1000) + '\\ \\text{L} = ' + qx(nb, 'mol', 3) + '$.', acid[1] === 2 ? 'Each $\\mathrm{H}_{2}\\mathrm{SO}_{4}$ needs two NaOH ($\\mathrm{H}_{2}\\mathrm{SO}_{4} + 2\\mathrm{NaOH} \\to \\mathrm{Na}_{2}\\mathrm{SO}_{4} + 2\\mathrm{H}_{2}\\mathrm{O}$), so moles of acid $= ' + fx(nb, 3) + ' \\div 2 = ' + qx(na, 'mol', 3) + '$.' : 'The acid and NaOH react 1 : 1, so moles of acid $= ' + qx(na, 'mol', 3) + '$.', 'Molarity: $\\dfrac{' + fx(na, 3) + '\\ \\text{mol}}{' + gx(Va / 1000) + '\\ \\text{L}} = ' + qx(Ma, 'M') + '$.'],
      acid[1] === 2 ? 'Sulfuric acid has two H⁺ to give, so it needs twice as much base.' : 'At the equivalence point, moles of base = moles of acid here.', 'M', { k: 'titM', acidH: acid[1], Vb: Vb, Mb: Mb, Va: Va, v: Ma },
      lvl === 1 && acid[0] !== 'CH3COOH' ? { name: 'ch-titration', opts: { acid: { type: 'strong', C: rnd(Ma, 4), V: Va }, base: { C: Mb }, vol: Vb, quiet: true } } : null);
  });


  // ================================================================== UNIT 13: ENERGY AND CHANGE
  // specific heats in J/(g·°C): OpenStax Chemistry 2e, Table 5.1 (water 4.184)
  var SH = [['water', 4.184], ['aluminum', 0.897], ['iron', 0.449], ['copper', 0.385], ['lead', 0.129], ['gold', 0.129]];
  var HT_MC = [
    ['A warm can of juice is placed in a cooler full of ice. Which way does energy flow?', ['Heat flows from the juice into the ice.', 'Cold flows from the ice into the juice.', 'Heat flows from the ice into the juice.', 'No energy flows; the juice just loses its warmth.'],
      'Heat always flows from the hotter object to the colder one. "Cold" is not something that flows: the juice cools because it loses energy to the ice.'],
    ['You hold an ice cube and your hand feels cold. Why?', ['Heat flows out of your hand into the ice.', 'Cold flows out of the ice into your hand.', 'The ice gives off cold particles.', 'Your hand\'s particles stop moving.'],
      'Your hand is warmer, so energy leaves it and goes into the ice. Losing energy is what you feel as cold.'],
    ['What does the temperature of a gas or liquid measure?', ['The average kinetic energy of its particles', 'The total energy of all its particles', 'How much heat it contains', 'How many particles it has'],
      'Temperature measures the average energy of motion per particle. The total thermal energy also depends on how much material there is.'],
    ['A bathtub of warm water (40 °C) and a cup of hot tea (80 °C) are compared. Which statement is true?', ['The tea is at a higher temperature, but the bathtub holds more thermal energy.', 'The tea has more thermal energy because it is hotter.', 'They hold the same thermal energy.', 'The bathtub is at a higher temperature because it is bigger.'],
      'Temperature is an average per particle, so the tea is hotter. Thermal energy is a total, and the bathtub has thousands of times more water, so it holds far more.'],
    ['A hot metal block is dropped into cool water in an insulated cup. When does the heat flow stop?', ['When the block and the water reach the same temperature', 'When the block reaches 0 °C', 'When the water starts to boil', 'It never stops while the block is in the water'],
      'Heat flows only while there is a temperature difference. At the same temperature, called thermal equilibrium, the net flow stops.'],
    ['Two identical cups hold 100 g and 200 g of water, both at 50 °C. Which statement is true?', ['They have the same temperature, but the 200 g cup has twice the thermal energy.', 'The 200 g cup is at a higher temperature.', 'They have the same thermal energy.', 'The 100 g cup has more thermal energy because its particles are closer together.'],
      'Temperature does not depend on the amount; thermal energy does. Twice the water at the same temperature holds twice the thermal energy.']
  ];
  G('chem.heat-temperature', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mc', 'mc', 'mixEq'], ['mc', 'mix', 'mixEq'], ['mix', 'mix', 'mc']));
    if (shape === 'mc') { var m = R.pick(HT_MC); return P(m[0], mc(m[1][0], m[1].slice(1)), [m[2]], 'Heat flows from hotter to colder; temperature is an average per particle.', null, { k: 'mc' }); }
    var m1, m2, T1, T2;
    if (shape === 'mixEq') { m1 = m2 = R.pick([100, 200, 250, 50]); T1 = R.pick([80, 90, 70, 60, 64]); T2 = R.pick([10, 20, 30, 24, 16]); }
    else { m1 = R.pick([100, 200, 300, 150, 50]); do { m2 = R.pick([100, 200, 300, 400, 50, 250]); } while (m2 === m1); T1 = R.pick([80, 90, 70, 60, 75]); T2 = R.pick([10, 20, 15, 25, 5]); }
    var Tf = (m1 * T1 + m2 * T2) / (m1 + m2);
    return P('$' + m1 + '\\ \\text{g}$ of water at $' + T1 + '^\\circ\\text{C}$ is mixed with $' + m2 + '\\ \\text{g}$ of water at $' + T2 + '^\\circ\\text{C}$ in an insulated container. What is the final temperature?', ans(Tf, 0.01),
      ['Heat lost by the hot water = heat gained by the cold water. Both are water, so each degree of change in each gram counts the same.', m1 === m2 ? 'Equal masses change by equal amounts, so the final temperature is halfway: $\\dfrac{' + T1 + ' + ' + T2 + '}{2} = ' + fx(Tf, 3) + '^\\circ\\text{C}$.' : '$' + m1 + '(' + T1 + ' - T_f) = ' + m2 + '(T_f - ' + T2 + ')$, so $T_f = \\dfrac{' + m1 + ' \\times ' + T1 + ' + ' + m2 + ' \\times ' + T2 + '}{' + (m1 + m2) + '} = ' + fx(Tf, 3) + '^\\circ\\text{C}$.', 'Check: it lies between ' + T2 + ' °C and ' + T1 + ' °C, closer to the temperature of the larger mass.'],
      'Heat lost by the hot water equals heat gained by the cold water.', 'C', { k: 'mix', m1: m1, T1: T1, m2: m2, T2: T2, v: Tf });
  });

  G('chem.specific-heat', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['q', 'q', 'concept'], ['dT', 'c', 'q', 'cool'], ['Tf', 'm', 'c', 'concept']));
    if (shape === 'concept') {
      var two = R.sample(SH.slice(1), 2).sort(function (a, b) { return a[1] - b[1]; }), mass = R.pick([50, 100, 200]);
      if (two[0][1] === two[1][1]) two = [SH[3], SH[1]];
      return P('$' + mass + '\\ \\text{g}$ of ' + two[0][0] + ' ($c = ' + two[0][1] + '$) and $' + mass + '\\ \\text{g}$ of ' + two[1][0] + ' ($c = ' + two[1][1] + '$, both in J/(g·°C)) each absorb the same amount of heat. Which warms up more?', mc('The ' + two[0][0] + ', which has the lower specific heat', ['The ' + two[1][0] + ', which has the higher specific heat', 'Both warm by the same amount.', 'Neither warms, because the heat is shared.']),
        ['$\\Delta T = \\dfrac{q}{mc}$: with the same $q$ and $m$, the smaller $c$ gives the bigger $\\Delta T$.', 'A low specific heat means few joules are needed per gram per degree, so the same heat raises the temperature more.'],
        'Specific heat is the joules needed for one gram to warm by one degree.', null, { k: 'concept' });
    }
    var sub = R.pick(SH.slice(0, 5)), c = sub[1], m = R.pick([25.0, 50.0, 100, 150, 200, 250, 12.5, 75.0]), dT = R.pick([5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 12.0, 40.0]);
    var q = m * c * dT;
    if (shape === 'q' || shape === 'cool') {
      var T1 = R.pick([20, 22, 25, 15, 30]), T2 = shape === 'cool' ? T1 - dT : T1 + dT;
      if (shape === 'cool') { T1 = R.pick([80, 95, 70, 60]); T2 = T1 - dT; }
      var qq = m * c * (T2 - T1), kJ = M.abs(qq) >= 10000;
      return P('How much heat ' + (shape === 'cool' ? 'is released when $' + gx(m) + '\\ \\text{g}$ of ' + sub[0] + ' cools' : 'is needed to warm $' + gx(m) + '\\ \\text{g}$ of ' + sub[0]) + ' from $' + T1 + '^\\circ\\text{C}$ to $' + gx(T2) + '^\\circ\\text{C}$? The specific heat of ' + sub[0] + ' is $' + c + '\\ \\text{J/(g·°C)}$. ' + (shape === 'cool' ? 'Give $q$ for the ' + sub[0] + ', with its sign, ' : 'Give the answer ') + (kJ ? 'in kilojoules.' : 'in joules.'),
        ans(kJ ? qq / 1000 : qq, 0.01),
        ['$\\Delta T = T_{\\text{final}} - T_{\\text{initial}} = ' + gx(T2) + ' - ' + T1 + ' = ' + gx(fix(T2 - T1)) + '^\\circ\\text{C}$.', '$q = mc\\Delta T = ' + gx(m) + '\\ \\text{g} \\times ' + c + '\\ \\text{J/(g·°C)} \\times ' + (T2 - T1 < 0 ? '(' + gx(fix(T2 - T1)) + ')' : gx(fix(T2 - T1))) + '^\\circ\\text{C} = ' + qx(qq, 'J') + '$' + (kJ ? ' $= ' + qx(qq / 1000, 'kJ') + '$' : '') + '.', shape === 'cool' ? 'The sign is negative because the ' + sub[0] + ' loses heat.' : 'Positive: heat flows into the ' + sub[0] + '.'],
        'Use $q = mc\\Delta T$ with $\\Delta T$ = final − initial.', kJ ? 'kJ' : 'J', { k: 'q', m: m, c: c, dT: T2 - T1, kJ: kJ, v: kJ ? qq / 1000 : qq });
    }
    if (shape === 'dT' || shape === 'Tf') {
      var qg2 = sgf(q, 3), dT2 = qg2 / (m * c), T0 = R.pick([20.0, 22.0, 25.0, 18.0]);
      if (shape === 'Tf') return P('$' + gx(qg2) + '\\ \\text{J}$ of heat is added to $' + gx(m) + '\\ \\text{g}$ of ' + sub[0] + ' ($c = ' + c + '\\ \\text{J/(g·°C)}$) that starts at $' + gx(T0) + '^\\circ\\text{C}$. What is its final temperature?', ans(T0 + dT2, 0.01),
        ['$\\Delta T = \\dfrac{q}{mc} = \\dfrac{' + gx(qg2) + '}{' + gx(m) + ' \\times ' + c + '} = ' + fx(dT2, 3) + '^\\circ\\text{C}$.', '$T_f = ' + gx(T0) + ' + ' + fx(dT2, 3) + ' = ' + fx(T0 + dT2, 3) + '^\\circ\\text{C}$.'],
        'Find the temperature change, then add it to the start.', 'C', { k: 'Tf', q: qg2, m: m, c: c, T0: T0, v: T0 + dT2 });
      return P('How much does the temperature of $' + gx(m) + '\\ \\text{g}$ of ' + sub[0] + ' ($c = ' + c + '\\ \\text{J/(g·°C)}$) rise when it absorbs $' + gx(qg2) + '\\ \\text{J}$?', ans(dT2, 0.01),
        ['Rearrange $q = mc\\Delta T$: $\\Delta T = \\dfrac{q}{mc}$.', '$\\Delta T = \\dfrac{' + gx(qg2) + '\\ \\text{J}}{' + gx(m) + '\\ \\text{g} \\times ' + c + '\\ \\text{J/(g·°C)}} = ' + fx(dT2, 3) + '^\\circ\\text{C}$.'],
        'Divide the heat by mass times specific heat.', 'C', { k: 'dT', q: qg2, m: m, c: c, v: dT2 });
    }
    if (shape === 'm') {
      var qg3 = sgf(q, 3), m3 = qg3 / (c * dT);
      return P('Heating a sample of ' + sub[0] + ' ($c = ' + c + '\\ \\text{J/(g·°C)}$) by $' + gx(dT) + '^\\circ\\text{C}$ takes $' + gx(qg3) + '\\ \\text{J}$. What is the mass of the sample?', ans(m3, 0.01),
        ['$m = \\dfrac{q}{c\\Delta T}$.', '$m = \\dfrac{' + gx(qg3) + '}{' + c + ' \\times ' + gx(dT) + '} = ' + qx(m3, 'g') + '$.'],
        'Rearrange $q = mc\\Delta T$ for $m$.', 'g', { k: 'm', q: qg3, c: c, dT: dT, v: m3 });
    }
    var met = R.pick(SH.slice(1, 5)), qg4 = sgf(m * met[1] * dT, 3), c4 = qg4 / (m * dT);
    return P('A $' + gx(m) + '\\ \\text{g}$ block of an unknown metal absorbs $' + gx(qg4) + '\\ \\text{J}$ and warms by $' + gx(dT) + '^\\circ\\text{C}$. What is its specific heat?', ans(c4, 0.01),
      ['$c = \\dfrac{q}{m\\Delta T}$.', '$c = \\dfrac{' + gx(qg4) + '\\ \\text{J}}{' + gx(m) + '\\ \\text{g} \\times ' + gx(dT) + '^\\circ\\text{C}} = ' + fx(c4, 3) + '\\ \\text{J/(g·°C)}$, close to the value for ' + met[0] + ' (' + met[1] + ').'],
      'Specific heat is joules per gram per degree.', 'Jg', { k: 'c', q: qg4, m: m, dT: dT, v: c4 });
  });

  var CW = 4.184;
  G('chem.calorimetry', function (R, ctx) {
    var lvl = ctx.level || 1, met, mm1, Tm, mw, Tw, Tf;
    do { // keep the water's temperature change at least 2.5 °C, so a temperature read to 0.1 °C gives a good specific heat
      met = R.pick(SH.slice(1, 5)); mm1 = R.pick(met[1] < 0.2 ? [150.0, 200.0, 250.0, 300.0] : [25.0, 50.0, 75.0, 100.0, 40.0, 60.0]); Tm = R.pick([95.0, 100.0, 90.0, 85.0, 99.0]);
      mw = R.pick(met[1] < 0.2 ? [25.0, 40.0, 50.0] : [50.0, 100.0, 150.0, 75.0]); Tw = R.pick([20.0, 22.0, 25.0, 18.0, 21.0]);
      Tf = (mm1 * met[1] * Tm + mw * CW * Tw) / (mm1 * met[1] + mw * CW);
    } while (Tf - Tw < 2.5);
    var ask = lvl === 1 ? 'qmetal' : lvl === 2 ? R.pick(['c', 'c', 'qmetal']) : R.pick(['Tf', 'Tf', 'c']);
    var setup = 'A $' + gx(mm1) + '\\ \\text{g}$ piece of ' + (ask === 'c' ? 'an unknown metal' : met[0]) + ' at $' + gx(Tm) + '^\\circ\\text{C}$ is dropped into $' + gx(mw) + '\\ \\text{g}$ of water at $' + gx(Tw) + '^\\circ\\text{C}$ in an insulated cup';
    var viz = { name: 'ch-calorimeter', opts: { mode: 'cup', c1: met[1], m1: mm1, T1: Tm, m2: mw, T2: Tw, quiet: true } };
    if (ask === 'qmetal') {
      var Tf1 = rnd(Tf, 1), qw = mw * CW * (Tf1 - Tw);
      return P(setup + '. The water warms to $' + Tf1.toFixed(1) + '^\\circ\\text{C}$. What is $q$ for the metal, in joules? (Water: $c = 4.184\\ \\text{J/(g·°C)}$.)', ans(-qw, 0.01),
        ['Heat gained by the water: $q_{\\text{water}} = mc\\Delta T = ' + gx(mw) + ' \\times 4.184 \\times (' + Tf1.toFixed(1) + ' - ' + gx(Tw) + ') = ' + qx(qw, 'J') + '$.', 'No heat escapes the insulated cup, so the metal lost exactly that much: $q_{\\text{metal}} = -q_{\\text{water}} = ' + qx(-qw, 'J') + '$.', 'The minus sign says heat left the metal.'],
        'Find the heat the water gained; the metal lost the same amount.', 'J', { k: 'qmetal', mw: mw, Tw: Tw, Tf: Tf1, v: -qw }, viz);
    }
    if (ask === 'c') {
      var Tf2 = rnd(Tf, 1), qw2 = mw * CW * (Tf2 - Tw), cm = qw2 / (mm1 * (Tm - Tf2));
      return P(setup + '. The final temperature of both is $' + Tf2.toFixed(1) + '^\\circ\\text{C}$. What is the specific heat of the metal? (Water: $c = 4.184\\ \\text{J/(g·°C)}$.)', ans(cm, 0.02),
        ['Water: $q = ' + gx(mw) + ' \\times 4.184 \\times (' + Tf2.toFixed(1) + ' - ' + gx(Tw) + ') = ' + qx(qw2, 'J') + '$ gained.', 'Metal: $q = -' + fx(qw2, 3) + '\\ \\text{J}$, and its $\\Delta T = ' + Tf2.toFixed(1) + ' - ' + gx(Tm) + ' = ' + fx(Tf2 - Tm, 3) + '^\\circ\\text{C}$.', '$c = \\dfrac{q}{m\\Delta T} = \\dfrac{-' + fx(qw2, 3) + '}{' + gx(mm1) + ' \\times (' + fx(Tf2 - Tm, 3) + ')} = ' + fx(cm, 3) + '\\ \\text{J/(g·°C)}$, close to ' + met[0] + ' (' + met[1] + ').'],
        'Heat lost by the metal = heat gained by the water; use the metal\'s own mass and temperature change.', 'Jg', { k: 'cmetal', mm: mm1, Tm: Tm, mw: mw, Tw: Tw, Tf: Tf2, v: cm }, viz);
    }
    return P(setup + '. What is the final temperature? (' + met[0][0].toUpperCase() + met[0].slice(1) + ': $c = ' + met[1] + '$; water: $c = 4.184$, both in J/(g·°C).)', ans(Tf, 0.008),
      ['Heat lost by the metal = heat gained by the water: $-m_1c_1(T_f - ' + gx(Tm) + ') = m_2c_2(T_f - ' + gx(Tw) + ')$.', 'Collect $T_f$: $T_f = \\dfrac{m_1c_1T_1 + m_2c_2T_2}{m_1c_1 + m_2c_2} = \\dfrac{' + gx(mm1) + '(' + met[1] + ')(' + gx(Tm) + ') + ' + gx(mw) + '(4.184)(' + gx(Tw) + ')}{' + gx(mm1) + '(' + met[1] + ') + ' + gx(mw) + '(4.184)}$.', '$T_f = ' + fx(Tf, 3) + '^\\circ\\text{C}$. Water\'s large specific heat keeps the final temperature close to where the water started.'],
      'Set the heat lost by the metal equal to the heat gained by the water and solve for $T_f$.', 'C', { k: 'Tf', mm: mm1, cm: met[1], Tm: Tm, mw: mw, Tw: Tw, v: Tf }, viz);
  });

  var HFUS = 6.01, HVAP = 40.7, MW = 18.02;
  G('chem.heating-curves', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mc', 'mc', 'plateau'], ['melt', 'boil', 'mc'], ['melt', 'boil', 'ratio', 'condense']));
    if (shape === 'mc') {
      var items = [
        ['A heating curve for water shows a flat segment at 0 °C. What is happening there?', ['Ice is melting; the added heat pulls molecules apart instead of speeding them up.', 'The temperature is rising slowly while ice melts.', 'The water molecules are breaking into hydrogen and oxygen.', 'Nothing: the heater is off during that part.'],
          'While ice melts, the energy goes into loosening the attractions between molecules, not into faster motion, so the temperature stays at 0 °C until all the ice has melted.'],
        ['A pot of water has been boiling for ten minutes at sea level. What is its temperature now, compared with when it started boiling?', ['The same, about 100 °C', 'Higher, because it has been heated longer', 'Lower, because steam carries heat away', 'It keeps rising slowly by a few degrees a minute'],
          'While water boils, the added heat turns liquid into vapor. The temperature stays at the boiling point, about 100 °C at 1 atm, until the liquid is gone.'],
        ['On a heating curve, what does the energy added during the boiling plateau do?', ['It separates molecules from their neighbors so they escape into the gas.', 'It breaks the covalent bonds inside the water molecules.', 'It makes the molecules move faster, raising the temperature.', 'It is lost to the air without any effect.'],
          'Boiling pulls whole molecules away from one another; the O–H bonds inside each molecule stay intact (steam is still $\\mathrm{H}_{2}\\mathrm{O}$).'],
        ['Why is the boiling plateau of water much longer than the melting plateau?', ['Pulling molecules completely apart into a gas takes much more energy than loosening them into a liquid.', 'Boiling happens at a higher temperature, which always takes longer.', 'Water has more mass when it is a liquid.', 'Ice conducts heat better than liquid water.'],
          'Melting only loosens the attractions; boiling separates the molecules entirely. Per mole: 6.01 kJ to melt, 40.7 kJ to boil.']
      ];
      var it = R.pick(items);
      return P(it[0], mc(it[1][0], it[1].slice(1)), [it[2]], 'On a flat part, the energy changes the state, not the temperature.', null, { k: 'mc' }, { name: 'ch-heatingcurve', opts: { mass: 100, T1: -20, T2: 120, quiet: true, edit: false } });
    }
    if (shape === 'plateau') {
      var which = R.pick(['melting', 'boiling']);
      return P('The graph is a heating curve for water at 1 atm. At what temperature, in °C, is the ' + (which === 'melting' ? 'first flat segment, where ice melts' : 'second flat segment, where water boils') + '?', exact(which === 'melting' ? 0 : 100),
        ['Flat segments happen at phase changes, where the temperature holds steady.', which === 'melting' ? 'The first one is melting, at 0 °C.' : 'The second one is boiling, at 100 °C (at 1 atm).'],
        'Read the height of the flat part.', 'C', { k: 'plateau' }, { name: 'ch-heatingcurve', opts: { mass: 100, T1: -20, T2: 120, quiet: true, edit: false } });
    }
    var m = R.pick([9.01, 18.0, 36.0, 27.0, 45.0, 4.50]) * (R.coin() ? 1 : 0) || R.int(10, 250), n = m / MW;
    if (shape === 'melt') { var qm = n * HFUS;
      return P('How much heat, in kilojoules, is needed to melt $' + gx(m) + '\\ \\text{g}$ of ice at $0^\\circ\\text{C}$? (Water: $' + d2(MW) + '\\ \\text{g/mol}$; heat of fusion $6.01\\ \\text{kJ/mol}$.)', ans(qm, 0.01),
        ['The temperature stays at 0 °C, so $q = mc\\Delta T$ does not apply; use the heat of fusion.', 'Moles: $' + gx(m) + ' \\div ' + d2(MW) + ' = ' + qx(n, 'mol', 4) + '$.', '$q = n\\,\\Delta H_{\\text{fus}} = ' + fx(n, 4) + ' \\times 6.01 = ' + qx(qm, 'kJ') + '$.'],
        'Melting happens at one temperature: use moles × heat of fusion.', 'kJ', { k: 'melt', m: m, v: qm }); }
    if (shape === 'boil') { var qb = n * HVAP;
      return P('How much heat, in kilojoules, is needed to boil away $' + gx(m) + '\\ \\text{g}$ of water at $100^\\circ\\text{C}$? (Water: $' + d2(MW) + '\\ \\text{g/mol}$; heat of vaporization $40.7\\ \\text{kJ/mol}$.)', ans(qb, 0.01),
        ['At the boiling point all the heat goes into vaporizing; the temperature stays at 100 °C.', 'Moles: $' + gx(m) + ' \\div ' + d2(MW) + ' = ' + qx(n, 'mol', 4) + '$.', '$q = n\\,\\Delta H_{\\text{vap}} = ' + fx(n, 4) + ' \\times 40.7 = ' + qx(qb, 'kJ') + '$.'],
        'Use moles × heat of vaporization.', 'kJ', { k: 'boil', m: m, v: qb }); }
    if (shape === 'condense') { var qc = -n * HVAP;
      return P('$' + gx(m) + '\\ \\text{g}$ of steam condenses to liquid water at $100^\\circ\\text{C}$. What is $q$ for the water, in kilojoules, with its sign? (Water: $' + d2(MW) + '\\ \\text{g/mol}$; heat of vaporization $40.7\\ \\text{kJ/mol}$.)', ans(qc, 0.01),
        ['Condensing is boiling in reverse: the same energy comes back out.', 'Moles: $' + gx(m) + ' \\div ' + d2(MW) + ' = ' + qx(n, 'mol', 4) + '$; $q = -n\\,\\Delta H_{\\text{vap}} = -' + fx(n, 4) + ' \\times 40.7 = ' + qx(qc, 'kJ') + '$.', 'Negative: the water releases heat, which is why steam can scald worse than boiling water.'],
        'Condensing releases the heat of vaporization.', 'kJ', { k: 'condense', m: m, v: qc }); }
    var ratio = HVAP / HFUS;
    return P('For the same mass of water, how many times more heat does it take to boil it (at 100 °C) than to melt it (at 0 °C)? (Heat of fusion $6.01\\ \\text{kJ/mol}$; heat of vaporization $40.7\\ \\text{kJ/mol}$.)', ans(ratio, 0.01),
      ['Same mass means the same moles, so compare the per-mole values.', '$\\dfrac{40.7}{6.01} = ' + fx(ratio, 3) + '$.', 'Boiling separates molecules completely, so it takes far more energy than loosening them in melting.'],
      'Divide one per-mole value by the other.', null, { k: 'ratio', v: ratio });
  });

  var EXO = [
    ['Methane burns in a gas stove.', 0, 'Burning releases energy as heat and light to the surroundings.'],
    ['A chemical hand warmer heats up as iron in it slowly rusts.', 0, 'The warmer gets hot because the reaction releases energy to its surroundings.'],
    ['An instant cold pack gets cold when ammonium nitrate dissolves in the water inside it.', 1, 'Dissolving takes in heat from the pack and your hand, so they cool. Nothing gives off "cold".'],
    ['Water freezes into ice in a freezer.', 0, 'Freezing releases heat to the freezer\'s air (the freezer pumps that heat away).'],
    ['Ice melts in a glass of lemonade.', 1, 'Melting takes in heat, which comes from the lemonade, so the lemonade cools.'],
    ['Plants make glucose from carbon dioxide and water in photosynthesis.', 1, 'Photosynthesis stores energy taken in from sunlight.'],
    ['Limestone (calcium carbonate) breaks down in a hot kiln.', 1, 'The kiln has to keep supplying heat; the decomposition takes it in ($\\Delta H = +178\\ \\text{kJ}$ per mole).'],
    ['An acid and a base are mixed, and the beaker gets warm.', 0, 'The beaker warms because the reaction releases heat into the water and glass.'],
    ['Water evaporates from your skin.', 1, 'Evaporating takes in heat from your skin, which cools you.'],
    ['A beaker feels colder after two solids react inside it.', 1, 'The reaction took heat from the beaker and the air, so the surroundings cooled.']
  ];
  G('chem.exo-endo', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['classify', 'classify', 'sign'], ['classify', 'dH', 'diagram', 'sign'], ['dH', 'diagram', 'classify', 'surround']));
    if (shape === 'classify') {
      var e = R.pick(EXO);
      return P(e[0] + ' Is this process exothermic or endothermic?', mcAll(['exothermic', 'endothermic'], e[1], true), [e[2], e[1] === 0 ? 'Energy leaves the system: exothermic ($\\Delta H < 0$).' : 'Energy enters the system: endothermic ($\\Delta H > 0$).'],
        'Ask which way the energy flows between the system and its surroundings.', null, { k: 'classify', v: e[1] });
    }
    if (shape === 'sign') {
      var dH = R.pick([-890, -286, -57, -92, 178, 44, 6.01, 131, -1648, 2803]), idx = dH < 0 ? 0 : 1;
      return P('A reaction has $\\Delta H = ' + (dH > 0 ? '+' : '') + gx(dH) + '\\ \\text{kJ}$. Is it exothermic or endothermic?', mcAll(['exothermic', 'endothermic'], idx, true),
        ['$\\Delta H$ is the energy of the products minus that of the reactants.', dH < 0 ? 'Negative: the products have less energy, so energy was released. Exothermic.' : 'Positive: the products have more energy, so energy was absorbed. Endothermic.'],
        'A negative ΔH means energy left the system.', null, { k: 'sign', v: idx });
    }
    if (shape === 'surround') {
      var exo = R.coin();
      return P('A reaction runs in a beaker of water. A thermometer in the water ' + (exo ? 'rises' : 'falls') + '. Which statement is true?', mc(exo ? 'The reaction is exothermic: it released energy into the water.' : 'The reaction is endothermic: it took energy from the water.', [exo ? 'The reaction is endothermic: it absorbed the heat that the thermometer measured.' : 'The reaction is exothermic: it released cold into the water.', 'The temperature change tells nothing about the reaction.', exo ? 'The water released energy into the reaction.' : 'Cold flowed out of the reaction into the water.']),
        ['The thermometer measures the surroundings (the water), not the reacting system.', exo ? 'The water warmed, so it gained energy from the reaction: exothermic.' : 'The water cooled, so it lost energy to the reaction: endothermic.'],
        'The water is the surroundings. Did it gain or lose energy?', null, { k: 'surround', v: exo });
    }
    var Er = R.pick([50, 100, 150, 200, 250, 300]), dE = R.pick([-180, -120, -90, -60, 40, 75, 110, 150, -45]), Ep = Er + dE, Ea = M.max(Er, Ep) + R.pick([40, 60, 80, 100]) - Er;
    if (shape === 'diagram') {
      var idx2 = dE < 0 ? 0 : 1;
      return P('The energy diagram shows a reaction. Is it exothermic or endothermic?', mcAll(['exothermic', 'endothermic'], idx2, true),
        ['Compare the products\' level with the reactants\' level.', dE < 0 ? 'The products end lower: energy was released to the surroundings, so it is exothermic.' : 'The products end higher: energy was taken in from the surroundings, so it is endothermic.'],
        'Is the products\' level above or below the reactants\' level?', null, { k: 'diagram', v: idx2 },
        { name: 'ch-energydiagram', opts: { mode: 'profile', dH: dE, Ea: Ea, quiet: true, catalyst: false, edit: false } });
    }
    return P('On an energy diagram the reactants are at $' + Er + '\\ \\text{kJ}$ and the products are at $' + Ep + '\\ \\text{kJ}$. What is $\\Delta H$ for the reaction, with its sign?', ansX(dE),
      ['$\\Delta H = E_{\\text{products}} - E_{\\text{reactants}}$.', '$\\Delta H = ' + Ep + ' - ' + Er + ' = ' + (dE > 0 ? '+' : '') + dE + '\\ \\text{kJ}$: ' + (dE < 0 ? 'exothermic.' : 'endothermic.')],
      'Products minus reactants.', 'kJ', { k: 'dH', Er: Er, Ep: Ep, v: dE });
  });

  // average bond energies in kJ/mol (diatomics as in the visual kit: CRC Handbook; the others from standard tables)
  var BE = { 'H–H': 436, 'Cl–Cl': 242, 'H–Cl': 432, 'F–F': 159, 'H–F': 570, 'Br–Br': 193, 'H–Br': 366, 'I–I': 151, 'H–I': 299, 'N≡N': 945, 'N–H': 391, 'O=O': 498, 'O–H': 463, 'C–H': 413, 'C=O': 799, 'C–Cl': 328, 'N=O': 630 };
  var BRX = [
    { eq: 'H2 + Cl2 -> 2HCl', br: [['H–H', 1], ['Cl–Cl', 1]], fo: [['H–Cl', 2]], lvl: 1 },
    { eq: 'H2 + F2 -> 2HF', br: [['H–H', 1], ['F–F', 1]], fo: [['H–F', 2]], lvl: 1 },
    { eq: 'H2 + Br2 -> 2HBr', br: [['H–H', 1], ['Br–Br', 1]], fo: [['H–Br', 2]], lvl: 1 },
    { eq: 'H2 + I2 -> 2HI', br: [['H–H', 1], ['I–I', 1]], fo: [['H–I', 2]], lvl: 1 },
    { eq: '2HCl -> H2 + Cl2', br: [['H–Cl', 2]], fo: [['H–H', 1], ['Cl–Cl', 1]], lvl: 2 },
    { eq: '2HI -> H2 + I2', br: [['H–I', 2]], fo: [['H–H', 1], ['I–I', 1]], lvl: 2 },
    { eq: 'N2 + 3H2 -> 2NH3', br: [['N≡N', 1], ['H–H', 3]], fo: [['N–H', 6]], lvl: 2, note: 'Each $\\mathrm{NH}_{3}$ has three N–H bonds.' },
    { eq: '2H2 + O2 -> 2H2O', br: [['H–H', 2], ['O=O', 1]], fo: [['O–H', 4]], lvl: 2, note: 'Each $\\mathrm{H}_{2}\\mathrm{O}$ has two O–H bonds (water as a gas).' },
    { eq: 'N2 + O2 -> 2NO', br: [['N≡N', 1], ['O=O', 1]], fo: [['N=O', 2]], lvl: 3 },
    { eq: 'CH4 + 2O2 -> CO2 + 2H2O', br: [['C–H', 4], ['O=O', 2]], fo: [['C=O', 2], ['O–H', 4]], lvl: 3, note: '$\\mathrm{CH}_{4}$ has four C–H bonds, $\\mathrm{CO}_{2}$ has two C=O bonds and each $\\mathrm{H}_{2}\\mathrm{O}$ has two O–H bonds (water as a gas).' },
    { eq: 'CH4 + Cl2 -> CH3Cl + HCl', br: [['C–H', 1], ['Cl–Cl', 1]], fo: [['C–Cl', 1], ['H–Cl', 1]], lvl: 3, note: 'Only one C–H bond breaks; the other three stay, so leave them out of both sides.' }
  ];
  function bondSum(list) { return list.reduce(function (s, b) { return s + b[1] * BE[b[0]]; }, 0); }
  function bondTex(list) { return list.map(function (b) { return (b[1] > 1 ? b[1] + '(' + BE[b[0]] + ')' : String(BE[b[0]])); }).join(' + '); }
  function bondNames(list) { return list.map(function (b) { return (b[1] > 1 ? b[1] + ' ' : '') + b[0]; }).join(', '); }
  G('chem.bond-energy', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['inout', 'calc', 'concept'], ['calc', 'calc', 'concept'], ['calc', 'calc', 'calc', 'concept']));
    if (shape === 'concept') {
      var c = R.pick([
        ['What happens to energy when a chemical bond breaks?', ['Energy must be added to break it.', 'Energy is released when it breaks.', 'No energy change happens.', 'It depends on whether the reaction is exothermic.'], 'Atoms in a bond attract each other. Pulling them apart takes energy, like pulling two magnets apart. Energy is released only when bonds form.'],
        ['Why is burning methane exothermic, even though bonds must break?', ['The bonds that form in CO₂ and H₂O release more energy than it takes to break the bonds in CH₄ and O₂.', 'Breaking the bonds in methane releases the energy.', 'Oxygen contains stored heat that is let out.', 'No bonds break when methane burns.'], 'Breaking bonds always costs energy; forming bonds always releases it. A reaction is exothermic when forming the products\' bonds releases more than breaking the reactants\' bonds costs.'],
        ['In a reaction, the bonds broken total 1,370 kJ and the bonds formed total 1,852 kJ. Which statement is true?', ['The reaction releases about 482 kJ: it is exothermic.', 'The reaction absorbs about 482 kJ: it is endothermic.', 'The reaction releases 3,222 kJ.', 'No energy change can be found from bond energies.'], 'ΔH ≈ energy in (bonds broken) − energy out (bonds formed) = 1,370 − 1,852 = −482 kJ. Negative means exothermic.']]);
      return P(c[0], mc(c[1][0], c[1].slice(1)), [c[2]], 'Breaking a bond takes energy; forming one releases it.', null, { k: 'concept' });
    }
    if (shape === 'inout') {
      var brk = R.int(40, 280) * 10, frm = R.int(40, 280) * 10; if (brk === frm) frm += 50;
      var dH0 = brk - frm;
      return P('Breaking the bonds in the reactants of a reaction takes $' + T.commas(brk).replace(/,/g, '{,}') + '\\ \\text{kJ}$. Forming the bonds in the products releases $' + T.commas(frm).replace(/,/g, '{,}') + '\\ \\text{kJ}$. What is $\\Delta H$, with its sign?', ansX(dH0),
        ['$\\Delta H = (\\text{energy to break bonds}) - (\\text{energy released forming bonds})$.', '$\\Delta H = ' + brk + ' - ' + frm + ' = ' + (dH0 > 0 ? '+' : '') + dH0 + '\\ \\text{kJ}$: ' + (dH0 < 0 ? 'exothermic, because forming releases more than breaking costs.' : 'endothermic, because breaking costs more than forming releases.')],
        'Energy in (breaking) minus energy out (forming).', 'kJ', { k: 'inout', v: dH0 });
    }
    var lvl = ctx.level || 1, rx = R.pick(BRX.filter(function (b) { return b.lvl <= lvl && (lvl < 3 || b.lvl >= 2); })), Bb = bondSum(rx.br), Bf = bondSum(rx.fo), dH = Bb - Bf;
    var used = {}; rx.br.concat(rx.fo).forEach(function (b) { used[b[0]] = BE[b[0]]; });
    var table = Object.keys(used).map(function (k) { return k + ' ' + used[k]; }).join(', ');
    return P('Use average bond energies to estimate $\\Delta H$ for $$' + eqT(rx.eq) + '$$ Bond energies (kJ/mol): ' + table + '.' + (rx.note ? ' ' + rx.note : ''), ansX(dH),
      ['Bonds broken (energy in): ' + bondNames(rx.br) + ': $' + bondTex(rx.br) + ' = ' + T.commas(Bb).replace(/,/g, '{,}') + '\\ \\text{kJ}$.', 'Bonds formed (energy out): ' + bondNames(rx.fo) + ': $' + bondTex(rx.fo) + ' = ' + T.commas(Bf).replace(/,/g, '{,}') + '\\ \\text{kJ}$.', '$\\Delta H \\approx ' + Bb + ' - ' + Bf + ' = ' + (dH > 0 ? '+' : '') + dH + '\\ \\text{kJ}$: ' + (dH < 0 ? 'exothermic.' : 'endothermic.')],
      'ΔH ≈ (bonds broken) − (bonds formed).', 'kJ', { k: 'bonds', br: rx.br, fo: rx.fo, v: dH },
      lvl === 1 ? { name: 'ch-energydiagram', opts: { mode: 'bonds', breaks: rx.br.reduce(function (a, b) { for (var i = 0; i < b[1]; i++) a.push([b[0], BE[b[0]]]); return a; }, []), forms: rx.fo.reduce(function (a, b) { for (var i = 0; i < b[1]; i++) a.push([b[0], BE[b[0]]]); return a; }, []), eq: rx.eq, quiet: true } } : null);
  });


  // ================================================================== UNIT 14: REACTION RATES AND EQUILIBRIUM
  var CT_MC = [
    ['Why does raising the temperature speed up most reactions?', ['A larger share of collisions have enough energy to react, and collisions also happen more often.', 'Only because the particles collide more often.', 'Because heat lowers the activation energy.', 'Because heat makes the particles bigger, so they hit more often.'],
      'At a higher temperature the particles move faster. They collide a little more often, but the bigger effect is that many more collisions carry at least the activation energy.'],
    ['Does every collision between reactant particles produce a reaction?', ['No: a collision must have enough energy and the right orientation.', 'Yes: any collision makes product.', 'Yes, as long as the temperature is high.', 'No: only collisions with a catalyst count.'],
      'Most collisions are too gentle or hit at the wrong angle, and the particles just bounce apart. Only collisions that are hard enough and lined up properly react.'],
    ['Why does a powdered solid react faster than one big lump of the same mass?', ['The powder has far more surface, so more particles are exposed to collisions.', 'The powder particles move faster.', 'Grinding raises the activation energy.', 'The powder is a different substance.'],
      'Only particles at the surface of a solid can be hit. Breaking it into small pieces exposes much more surface, so there are more collisions each second.'],
    ['Why does a reaction speed up when a reactant solution is made more concentrated?', ['More reactant particles in the same space collide more often.', 'Each collision becomes more energetic.', 'The activation energy gets smaller.', 'The particles change shape.'],
      'Concentration is particles per volume. Packing more of them into the same space makes collisions more frequent; it does not change how hard each one is.'],
    ['Food spoils more slowly in a refrigerator. Which explanation fits collision theory?', ['At a lower temperature fewer collisions have enough energy to react, and collisions are less frequent.', 'Cold destroys the molecules that cause spoiling.', 'Cold particles stop moving entirely.', 'Low temperatures raise the amount of product.'],
      'Cooling slows the particles. Fewer collisions reach the activation energy, so the reactions of spoiling slow down.']
  ];
  G('chem.collision-theory', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mc', 'mc', 'area'], ['mc', 'area', 'freq'], ['freq', 'area', 'mc', 'tf']));
    if (shape === 'mc') { var m = R.pick(CT_MC); return P(m[0], mc(m[1][0], m[1].slice(1)), [m[2]], 'A reaction needs collisions that are both energetic enough and properly lined up.', null, { k: 'mc' }); }
    if (shape === 'tf') {
      var t = R.pick([['Heating a reaction speeds it up only because the particles collide more often.', false, 'Collisions do become more frequent, but the larger effect is that many more of them carry at least the activation energy.'],
        ['Two particles that collide with enough energy but the wrong orientation may not react.', true, 'Orientation matters: the reacting parts of the particles must meet.'],
        ['Doubling the concentration of one reactant doubles the number of collisions it makes per second.', true, 'Twice as many particles in the same space means twice as many collisions with the other reactant.']]);
      return P('True or false: ' + t[0], tf(t[1]), [t[2]], 'Think about how often particles collide and how hard.', null, { k: 'tf' });
    }
    if (shape === 'area') {
      var L = R.pick([2, 3, 4, 6]), s = R.pick([1, 0.5]); if (L / s > 8) s = 1;
      var nCubes = M.pow(L / s, 3), A0 = 6 * L * L, A1 = nCubes * 6 * s * s;
      return P('A cube of zinc measures $' + L + '\\ \\text{cm}$ on each edge. It is cut into small cubes $' + gx(s) + '\\ \\text{cm}$ on each edge. What is the total surface area of all the small cubes? (The big cube had $' + A0 + '\\ \\text{cm}^2$.)', ansX(A1),
        ['Number of small cubes: $\\left(\\dfrac{' + L + '}{' + gx(s) + '}\\right)^3 = ' + gx(nCubes) + '$.', 'Area of each: $6 \\times ' + gx(s) + '^2 = ' + gx(6 * s * s) + '\\ \\text{cm}^2$; total $= ' + gx(nCubes) + ' \\times ' + gx(6 * s * s) + ' = ' + qg(A1, 'cm2') + '$.', 'That is ' + gx(A1 / A0) + ' times the original surface, so ' + gx(A1 / A0) + ' times as many zinc atoms are exposed to an acid: the cut pieces react faster.'],
        'Count the small cubes and add up their faces.', 'cm2', { k: 'area', L: L, s: s, v: A1 });
    }
    var a = R.pick([2, 3, 0.5, 4]), b = R.pick([1, 2, 3, 0.5]), f = a * b;
    return P('In a gas, the number of collisions per second between A and B particles is proportional to $[\\mathrm{A}] \\times [\\mathrm{B}]$. If $[\\mathrm{A}]$ is ' + (a === 0.5 ? 'cut in half' : 'multiplied by ' + a) + (b === 1 ? ' and $[\\mathrm{B}]$ stays the same' : ' and $[\\mathrm{B}]$ is ' + (b === 0.5 ? 'cut in half' : 'multiplied by ' + b)) + ', by what factor does the number of A–B collisions per second change?', ansX(f),
      ['Each A particle can hit any B particle, so the collision count goes as the product of the two concentrations.', 'Factor $= ' + gx(a) + ' \\times ' + gx(b) + ' = ' + gx(f) + '$.'],
      'Multiply the two factors.', null, { k: 'freq', a: a, b: b, v: f });
  });

  function pn(x) { return x < 0 ? '(' + x + ')' : String(x); }
  G('chem.activation-energy-catalysts', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['Ea', 'mc', 'dH'], ['Ea', 'catEa', 'mc', 'dH'], ['revEa', 'catEa', 'mc']));
    if (shape === 'mc') {
      var m = R.pick([
        ['What does a catalyst do to a reaction?', ['It provides a path with a lower activation energy, so the reaction goes faster.', 'It makes the reaction release more energy.', 'It gets used up as the reaction runs.', 'It raises the temperature of the reactants.'], 'A catalyst offers another route with a lower energy barrier. The starting and ending energies, and so ΔH, do not change, and the catalyst comes out unchanged.'],
        ['How does a catalyst change ΔH of a reaction?', ['It does not change ΔH.', 'It makes ΔH more negative.', 'It makes ΔH more positive.', 'It makes ΔH zero.'], 'ΔH depends only on the energies of the reactants and the products. A catalyst lowers the hill between them, not the start or the finish.'],
        ['After a catalyzed reaction is over, what has happened to the catalyst?', ['It is still there, unchanged, and can be used again.', 'It has been used up like a reactant.', 'It has turned into product.', 'It has been destroyed by the heat.'], 'A catalyst takes part in the steps of the reaction but is given back at the end, so a small amount can speed up a lot of reaction.'],
        ['Enzymes in your body are catalysts. What do they change about the reactions they speed up?', ['They lower the activation energy.', 'They change the products that form.', 'They raise the energy released.', 'They make unfavorable reactions favorable.'], 'Enzymes, like all catalysts, provide a lower-energy pathway. They do not change what forms or how much energy is released overall.']]);
      return P(m[0], mc(m[1][0], m[1].slice(1)), [m[2]], 'A catalyst changes the path, not the start or the end.', null, { k: 'mc' }, { name: 'ch-energydiagram', opts: { mode: 'profile', dH: -60, Ea: 110, catalyst: true, quiet: true, edit: false } });
    }
    var Er = R.pick([40, 60, 80, 100, 120, 150]), dH = R.pick([-90, -60, -45, -120, 30, 50, 70, -30]), Ep = Er + dH, top = M.max(Er, Ep) + R.pick([50, 70, 90, 110, 130]), Ea = top - Er, catTop = M.max(Er, Ep) + R.pick([20, 25, 30, 40]), catEa = catTop - Er;
    var desc = 'An energy diagram for a reaction has the reactants at $' + Er + '\\ \\text{kJ}$, the peak (the activated complex) at $' + top + '\\ \\text{kJ}$ and the products at $' + Ep + '\\ \\text{kJ}$.';
    var viz = { name: 'ch-energydiagram', opts: { mode: 'profile', dH: dH, Ea: Ea, catalyst: shape === 'catEa', catEa: catEa, quiet: true, edit: false } };
    if (shape === 'Ea') return P(desc + ' What is the activation energy of the forward reaction?', ansX(Ea),
      ['The activation energy is the climb from the reactants to the top of the hill.', '$E_a = ' + top + ' - ' + pn(Er) + ' = ' + Ea + '\\ \\text{kJ}$.'],
      'Peak minus reactants.', 'kJ', { k: 'Ea', Er: Er, top: top, v: Ea }, viz);
    if (shape === 'dH') return P(desc + ' What is $\\Delta H$ for the reaction, with its sign?', ansX(dH),
      ['$\\Delta H = E_{\\text{products}} - E_{\\text{reactants}}$; the height of the hill does not matter.', '$\\Delta H = ' + Ep + ' - ' + pn(Er) + ' = ' + (dH > 0 ? '+' : '') + dH + '\\ \\text{kJ}$.'],
      'Products minus reactants.', 'kJ', { k: 'dH', Er: Er, Ep: Ep, v: dH }, viz);
    if (shape === 'catEa') return P(desc + ' With a catalyst, the peak drops to $' + catTop + '\\ \\text{kJ}$. By how many kilojoules does the catalyst lower the activation energy?', ansX(Ea - catEa),
      ['Without the catalyst: $E_a = ' + top + ' - ' + Er + ' = ' + Ea + '\\ \\text{kJ}$. With it: $' + catTop + ' - ' + Er + ' = ' + catEa + '\\ \\text{kJ}$.', 'Lowered by $' + Ea + ' - ' + catEa + ' = ' + (Ea - catEa) + '\\ \\text{kJ}$. The reactants, the products and $\\Delta H = ' + (dH > 0 ? '+' : '') + dH + '\\ \\text{kJ}$ are unchanged.'],
      'Compare the two climbs from the reactants.', 'kJ', { k: 'catEa', top: top, catTop: catTop, v: Ea - catEa }, viz);
    return P(desc + ' What is the activation energy of the <b>reverse</b> reaction, from products back to reactants?', ansX(top - Ep),
      ['Going backward, the climb starts at the products.', '$E_{a,\\text{reverse}} = ' + top + ' - ' + pn(Ep) + ' = ' + (top - Ep) + '\\ \\text{kJ}$.', 'Check: $E_{a,\\text{forward}} - E_{a,\\text{reverse}} = ' + Ea + ' - ' + (top - Ep) + ' = ' + dH + ' = \\Delta H$.'],
      'Measure the climb from the products to the peak.', 'kJ', { k: 'revEa', top: top, Ep: Ep, v: top - Ep }, viz);
  });

  G('chem.dynamic-equilibrium', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['mc', 'rate', 'time'], ['mc', 'time', 'conserve'], ['conserve2', 'time', 'mc']));
    if (shape === 'mc') {
      var m = R.pick([
        ['What is true of a reaction at chemical equilibrium?', ['The forward and reverse reactions keep going at equal rates.', 'Both reactions have stopped.', 'The amounts of reactants and products must be equal.', 'Only the forward reaction is still running.'], 'At equilibrium, molecules keep reacting in both directions, but each change is undone as fast as it happens, so the amounts stay constant.'],
        ['At equilibrium, how do the concentrations of reactants and products compare?', ['They stay constant, but they are usually not equal.', 'They are always equal.', 'The products are always greater.', 'They keep rising and falling.'], 'Constant does not mean equal. Depending on the reaction, equilibrium can lie far toward products, far toward reactants, or anywhere between.'],
        ['A sealed bottle of soda has had the same pressure of CO₂ above the liquid for a week. What is happening at the particle level?', ['CO₂ molecules keep dissolving and escaping at the same rate.', 'Nothing: the molecules have stopped moving between gas and liquid.', 'All the CO₂ has dissolved.', 'CO₂ is only escaping, very slowly.'], 'It is a dynamic equilibrium: molecules cross the surface both ways at equal rates, so the pressure stays steady.']]);
      return P(m[0], mc(m[1][0], m[1].slice(1)), [m[2]], 'Equilibrium is a balance of two ongoing processes.', null, { k: 'mc' }, { name: 'ch-equilibrium', opts: { rxn: 'A<=>B', c0: { A: 1.0 }, quiet: true, show: ['rates'] } });
    }
    if (shape === 'rate') {
      var rf = R.pick([0.020, 0.0050, 0.12, 0.30, 0.0080, 1.5]);
      return P('A reaction $\\mathrm{A} \\rightleftharpoons \\mathrm{B}$ has reached equilibrium. The forward reaction is turning A into B at a rate of $' + gx(rf) + '\\ \\text{M/s}$. At what rate is the reverse reaction turning B into A?', ansX(rf),
        ['At equilibrium the two rates are equal, which is why the concentrations stop changing.', 'Reverse rate $= ' + gx(rf) + '\\ \\text{M/s}$. Both reactions are still running.'],
        'What does "equilibrium" say about the two rates?', 'M/s', { k: 'rate', v: rf });
    }
    if (shape === 'time') {
      var kf = R.pick([0.20, 0.15, 0.30, 0.25]), kr = R.pick([0.05, 0.10, 0.08, 0.12]), A0 = 1.00, step = R.pick([5, 10]), times = [], A = [], B = [];
      var Aeq = A0 * kr / (kf + kr);
      for (var i = 0; i <= 8; i++) { var t = i * step, a = Aeq + (A0 - Aeq) * M.exp(-(kf + kr) * t); times.push(t); A.push(rnd(a, 2)); B.push(rnd(A0 - a, 2)); }
      var first = 8; for (var j = 8; j >= 0; j--) { if (A[j] === A[8] && B[j] === B[8]) first = j; else break; }
      if (first === 8) { A.push(A[8]); B.push(B[8]); times.push(9 * step); }
      var rows = times.map(function (t, k) { return t + ' s: [A] = ' + A[k].toFixed(2) + ', [B] = ' + B[k].toFixed(2); }).join('; ');
      return P('For $\\mathrm{A} \\rightleftharpoons \\mathrm{B}$, starting with only A, a student measures (to two decimal places): ' + rows + '. From what time on is the system at equilibrium (the first time after which nothing changes)?', exact(times[first]),
        ['At equilibrium the concentrations stop changing, because the forward and reverse rates are equal.', 'From ' + times[first] + ' s on, [A] stays at ' + A[first].toFixed(2) + ' M and [B] at ' + B[first].toFixed(2) + ' M.', 'Notice that they are not equal: equilibrium means constant, not equal.'],
        'Find the first time after which the values stay the same.', 's', { k: 'time', A: A, B: B, times: times, v: times[first] });
    }
    if (shape === 'conserve') {
      var a0 = R.pick([1.00, 0.80, 2.00, 0.50]), aEq = rnd(a0 * R.pick([0.25, 0.3, 0.4, 0.6, 0.7]), 2), bEq = a0 - aEq;
      return P('A flask starts with $' + d2(a0) + '\\ \\text{M}$ of A and no B. The reaction $\\mathrm{A} \\rightleftharpoons \\mathrm{B}$ reaches equilibrium with $[\\mathrm{A}] = ' + d2(aEq) + '\\ \\text{M}$. What is $[\\mathrm{B}]$ at equilibrium?', ans(bEq, 0.01),
        ['Each A that reacts becomes one B.', '$[\\mathrm{B}] = ' + d2(a0) + ' - ' + d2(aEq) + ' = ' + qx(bEq, 'M') + '$.', 'The two are not equal at equilibrium, and they do not need to be.'],
        'Whatever A is used up appears as B.', 'M', { k: 'conserve', a0: a0, aEq: aEq, v: bEq });
    }
    var n0 = R.pick([1.00, 0.800, 0.600, 2.00]), y = rnd(n0 * R.pick([0.2, 0.3, 0.35, 0.4]), 3), nEq = n0 - 2 * y;
    return P('A sealed flask starts with $' + gx(n0) + '\\ \\text{M}$ of brown $\\mathrm{NO}_{2}$ and no $\\mathrm{N}_{2}\\mathrm{O}_{4}$. The reaction $$2\\mathrm{NO}_{2} \\rightleftharpoons \\mathrm{N}_{2}\\mathrm{O}_{4}$$ reaches equilibrium with $[\\mathrm{N}_{2}\\mathrm{O}_{4}] = ' + gx(y) + '\\ \\text{M}$. What is $[\\mathrm{NO}_{2}]$ at equilibrium?', ans(nEq, 0.01),
      ['Each $\\mathrm{N}_{2}\\mathrm{O}_{4}$ formed used up two $\\mathrm{NO}_{2}$.', '$\\mathrm{NO}_{2}$ used: $2 \\times ' + gx(y) + ' = ' + gx(2 * y) + '\\ \\text{M}$.', '$[\\mathrm{NO}_{2}] = ' + gx(n0) + ' - ' + gx(2 * y) + ' = ' + qx(nEq, 'M') + '$.'],
      'Use the coefficients: two NO₂ for every N₂O₄.', 'M', { k: 'conserve2', n0: n0, y: y, v: nEq });
  });

  // equilibria with well-established ΔH° (kJ, OpenStax Chemistry 2e, Appendix G values) and gas moles left and right
  var LCR = [
    { eq: 'N2 + 3H2 <=> 2NH3', dH: -92, gl: 4, gr: 2, sp: { r: ['N2', 'H2'], p: ['NH3'] } },
    { eq: '2SO2 + O2 <=> 2SO3', dH: -198, gl: 3, gr: 2, sp: { r: ['SO2', 'O2'], p: ['SO3'] } },
    { eq: 'N2O4 <=> 2NO2', dH: 57, gl: 1, gr: 2, sp: { r: ['N2O4'], p: ['NO2'] } },
    { eq: 'PCl5 <=> PCl3 + Cl2', dH: 88, gl: 1, gr: 2, sp: { r: ['PCl5'], p: ['PCl3', 'Cl2'] } },
    { eq: 'CO + H2O <=> CO2 + H2', dH: -41, gl: 2, gr: 2, sp: { r: ['CO', 'H2O'], p: ['CO2', 'H2'] } },
    { eq: 'H2 + I2 <=> 2HI', dH: null, gl: 2, gr: 2, sp: { r: ['H2', 'I2'], p: ['HI'] } },
    { eq: '2NO2 <=> N2O4', dH: -57, gl: 2, gr: 1, sp: { r: ['NO2'], p: ['N2O4'] } },
    { eq: 'CH4 + H2O <=> CO + 3H2', dH: 206, gl: 2, gr: 4, sp: { r: ['CH4', 'H2O'], p: ['CO', 'H2'] } },
    { eq: '2NO + O2 <=> 2NO2', dH: -114, gl: 3, gr: 2, sp: { r: ['NO', 'O2'], p: ['NO2'] } },
    { eq: 'N2 + O2 <=> 2NO', dH: 181, gl: 2, gr: 2, sp: { r: ['N2', 'O2'], p: ['NO'] } },
    { eq: 'CO + 2H2 <=> CH3OH', dH: -91, gl: 3, gr: 1, sp: { r: ['CO', 'H2'], p: ['CH3OH'] } }
  ];
  var LC_CH = ['toward the products (to the right)', 'toward the reactants (to the left)', 'no shift'];
  G('chem.le-chatelier', function (R, ctx) {
    var lvl = ctx.level || 1, shape = R.pick(lv(ctx, ['conc', 'conc', 'catalyst'], ['conc', 'pressure', 'temp', 'catalyst'], ['temp', 'pressure', 'partial', 'conc']));
    var rx = R.pick(LCR.filter(function (r) { return shape !== 'temp' || r.dH !== null; }).filter(function (r) { return shape !== 'pressure' || lvl === 3 || r.gl !== r.gr || R.chance(0.3); }));
    var E = parseEq(rx.eq), eqTex = '$$' + eqT(E) + (rx.dH !== null ? ' \\qquad \\Delta H = ' + (rx.dH > 0 ? '+' : '') + rx.dH + '\\ \\text{kJ}' : '') + '$$', ans3, why, change;
    var viz = rx.eq === 'N2 + 3H2 <=> 2NH3' && shape === 'conc' && lvl === 1 ? { name: 'ch-equilibrium', opts: { rxn: 'N2+3H2<=>2NH3', events: [{ t: 20, type: 'add', sp: 'N2', amt: 0.5 }], quiet: true } } : null;
    if (shape === 'catalyst') {
      change = 'a catalyst is added';
      ans3 = 2; why = ['A catalyst speeds up the forward and reverse reactions by the same factor.', 'The system reaches equilibrium sooner, but the equilibrium amounts do not change: no shift.'];
    } else if (shape === 'conc' || shape === 'partial') {
      var add = R.coin(), isR = R.coin(), sp = R.pick(isR ? rx.sp.r : rx.sp.p);
      change = (add ? 'more $' + fT(sp) + '$ is added' : 'some $' + fT(sp) + '$ is removed');
      ans3 = (add === isR) ? 0 : 1;
      why = [add ? 'Adding $' + fT(sp) + '$ speeds up the reaction that uses it up.' : 'Removing $' + fT(sp) + '$ slows down the reaction that uses it, so the reaction that makes it gets ahead.', 'The system shifts ' + LC_CH[ans3] + ', partly undoing the change.'];
      if (shape === 'partial' && add) {
        return P(eqTex + ' At equilibrium, ' + change + '. After the system settles at a new equilibrium, how does $[' + fT(sp) + ']$ compare with its value before the addition?', mc('It is higher than before, but lower than just after the addition.', ['It returns to exactly its old value.', 'It is lower than before the addition.', 'It stays at the value it had just after the addition.']),
          ['The shift uses up some of the added $' + fT(sp) + '$, but only part of it.', 'Le Chatelier\'s principle says the system partly undoes a change, never completely: $[' + fT(sp) + ']$ ends above its old value.'],
          'The shift reduces the change but does not erase it.', null, { k: 'partial' });
      }
    } else if (shape === 'pressure') {
      var up2 = R.coin();
      change = up2 ? 'the volume is decreased (raising the pressure)' : 'the volume is increased (lowering the pressure)';
      if (rx.gl === rx.gr) { ans3 = 2; why = ['Both sides have ' + rx.gl + ' moles of gas.', 'Neither direction changes the number of gas particles, so a pressure change causes no shift.']; }
      else {
        var fewer = rx.gr < rx.gl ? 0 : 1; ans3 = up2 ? fewer : 1 - fewer;
        why = ['Count moles of gas: ' + rx.gl + ' on the left, ' + rx.gr + ' on the right.', up2 ? 'Higher pressure favors the side with fewer gas particles, which lowers the pressure: the shift is ' + LC_CH[ans3] + '.' : 'Lower pressure favors the side with more gas particles: the shift is ' + LC_CH[ans3] + '.'];
      }
    } else {
      var hot = R.coin();
      change = hot ? 'the temperature is raised' : 'the temperature is lowered';
      var endoDir = rx.dH > 0 ? 0 : 1; // the endothermic direction
      ans3 = hot ? endoDir : 1 - endoDir;
      why = ['Treat heat as a ' + (rx.dH < 0 ? 'product (the forward reaction is exothermic)' : 'reactant (the forward reaction is endothermic)') + '.', hot ? 'Adding heat favors the endothermic direction, which absorbs it: ' + LC_CH[ans3] + '.' : 'Removing heat favors the exothermic direction, which releases heat: ' + LC_CH[ans3] + '.'];
    }
    return P(eqTex + ' The system is at equilibrium. Which way does it shift when ' + change + '?', mcAll(LC_CH.slice(), ans3, true), why,
      'The system shifts to partly undo the change.', null, { k: 'lc', eq: rx.eq, shape: shape, v: ans3 }, viz);
  });


  // ================================================================== UNIT 15: NUCLEAR CHEMISTRY
  var SYM = ['n', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
    'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au',
    'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm'];
  var ELN = { H: 'hydrogen', He: 'helium', C: 'carbon', N: 'nitrogen', O: 'oxygen', F: 'fluorine', Ne: 'neon', Na: 'sodium', P: 'phosphorus', S: 'sulfur', K: 'potassium', Ca: 'calcium', Co: 'cobalt', Ni: 'nickel', Sr: 'strontium',
    Y: 'yttrium', I: 'iodine', Xe: 'xenon', Cs: 'cesium', Ba: 'barium', Pb: 'lead', Bi: 'bismuth', Po: 'polonium', Rn: 'radon', Ra: 'radium', Th: 'thorium', Pa: 'protactinium', U: 'uranium', Np: 'neptunium', Pu: 'plutonium', Am: 'americium',
    B: 'boron', Kr: 'krypton', Tc: 'technetium', Zr: 'zirconium', Te: 'tellurium', Rb: 'rubidium', La: 'lanthanum', Br: 'bromine' };
  function Z(sym) { return SYM.indexOf(sym); }
  function nuc(sym, A) { return '{}^{' + A + '}_{' + Z(sym) + '}\\mathrm{' + sym + '}'; }
  var PART = { alpha: '{}^{4}_{2}\\mathrm{He}', beta: '{}^{0}_{-1}\\mathrm{e}', positron: '{}^{0}_{+1}\\mathrm{e}', gamma: '{}^{0}_{0}\\gamma', n: '{}^{1}_{0}\\mathrm{n}' };
  var PNAME = { alpha: 'an alpha particle', beta: 'a beta particle (an electron)', positron: 'a positron', gamma: 'a gamma ray' };
  // measured decays (National Nuclear Data Center, NuDat): parent, A, mode
  var DEC = [['U', 238, 'alpha'], ['Ra', 226, 'alpha'], ['Po', 210, 'alpha'], ['Rn', 222, 'alpha'], ['Am', 241, 'alpha'], ['Pu', 239, 'alpha'], ['Th', 232, 'alpha'], ['U', 234, 'alpha'], ['U', 235, 'alpha'],
    ['C', 14, 'beta'], ['H', 3, 'beta'], ['Sr', 90, 'beta'], ['Cs', 137, 'beta'], ['I', 131, 'beta'], ['Co', 60, 'beta'], ['P', 32, 'beta'], ['Th', 234, 'beta'], ['Pb', 210, 'beta'], ['K', 40, 'beta'],
    ['F', 18, 'positron'], ['N', 13, 'positron'], ['C', 11, 'positron'], ['O', 15, 'positron'], ['Na', 22, 'positron']];
  function product(d) { var z = Z(d[0]), A = d[1]; if (d[2] === 'alpha') return [SYM[z - 2], A - 4]; if (d[2] === 'beta') return [SYM[z + 1], A]; if (d[2] === 'positron') return [SYM[z - 1], A]; return [d[0], A]; }
  function decayEq(d) { var p = product(d); return nuc(d[0], d[1]) + ' \\to ' + nuc(p[0], p[1]) + ' + ' + PART[d[2]]; }
  function elName(s) { return ELN[s] ? ELN[s] + '-' : s + '-'; }
  G('chem.radioactive-decay', function (R, ctx) {
    var lvl = ctx.level || 1, shape = R.pick(lv(ctx, ['product', 'product', 'which', 'gamma'], ['product', 'which', 'product', 'gamma'], ['chain', 'parent', 'product', 'which']));
    var pool = DEC.filter(function (d) { return lvl > 1 || d[2] !== 'positron'; }), d = R.pick(pool), pr = product(d), z = Z(d[0]);
    if (shape === 'gamma') {
      return P('Technetium-99m, used in medical imaging, gives off a gamma ray: $${}^{99\\text{m}}_{43}\\mathrm{Tc} \\to {}^{99}_{43}\\mathrm{Tc} + {}^{0}_{0}\\gamma$$ Which statement about this decay is true?', mc('The nucleus stays technetium; it only gives off energy.', ['It turns into a different element.', 'The mass number drops by 4.', 'The atomic number goes up by 1.']),
        ['A gamma ray has no mass number and no charge: ${}^{0}_{0}\\gamma$.', 'So the mass number (99) and the atomic number (43) do not change. The nucleus just drops from a higher-energy state (the "m") to a lower one.'],
        'Look at the numbers on the gamma ray.', null, { k: 'gamma' }, { name: 'ch-nuclide', opts: { mode: 'equation', nuc: 'Tc-99m', quiet: true } });
    }
    if (shape === 'which') {
      return P('Which particle is given off in this decay? $$' + nuc(d[0], d[1]) + ' \\to ' + nuc(pr[0], pr[1]) + ' + \\ ?$$', mc(PNAME[d[2]], Object.keys(PNAME).filter(function (k) { return k !== d[2]; }).map(function (k) { return PNAME[k]; })),
        ['Mass numbers: $' + d[1] + ' - ' + pr[1] + ' = ' + (d[1] - pr[1]) + '$. Atomic numbers: $' + z + ' - ' + Z(pr[0]) + ' = ' + (z - Z(pr[0])) + '$.', 'A particle with mass number ' + (d[1] - pr[1]) + ' and charge ' + (z - Z(pr[0])) + ' is $' + PART[d[2]] + '$: ' + PNAME[d[2]] + '.'],
        'Find the missing mass number and atomic number, then match the particle.', null, { k: 'which', d: d }, null);
    }
    if (shape === 'parent') {
      return nolint(['+ 0'], P('A nucleus gives off ' + PNAME[d[2]] + ' and becomes ' + elName(pr[0]) + pr[1] + ', $' + nuc(pr[0], pr[1]) + '$. What was the original nucleus? Give its mass number, atomic number and symbol.',
        multi([['Mass number:', exact(d[1])], ['Atomic number:', exact(z)], ['Symbol:', formula(d[0])]]),
        ['Write $\\ ?\\ \\to ' + nuc(pr[0], pr[1]) + ' + ' + PART[d[2]] + '$ and balance.', 'Mass number: $' + pr[1] + ' + ' + (d[2] === 'alpha' ? 4 : 0) + ' = ' + d[1] + '$; atomic number: $' + Z(pr[0]) + ' + (' + (d[2] === 'alpha' ? 2 : d[2] === 'beta' ? -1 : 1) + ') = ' + z + '$.', 'Atomic number ' + z + ' is ' + (ELN[d[0]] || d[0]) + ': $' + nuc(d[0], d[1]) + '$.'],
        'The numbers on the left equal the totals on the right.', null, { k: 'parent', d: d }));
    }
    if (shape === 'chain') {
      var start = R.pick([['U', 238], ['Th', 232], ['U', 235], ['Ra', 226]]), na = R.pick([1, 2, 3]), nb = R.pick([1, 2]), A2 = start[1] - 4 * na, Z2 = Z(start[0]) - 2 * na + nb;
      return P('A nucleus of $' + nuc(start[0], start[1]) + '$ gives off ' + na + ' alpha particle' + (na > 1 ? 's' : '') + ' and ' + nb + ' beta particle' + (nb > 1 ? 's' : '') + ', one after another. What are the mass number and atomic number of the nucleus at the end?',
        multi([['Mass number:', exact(A2)], ['Atomic number:', exact(Z2)]]),
        ['Each alpha lowers the mass number by 4 and the atomic number by 2; each beta raises the atomic number by 1 and leaves the mass number alone.', 'Mass number: $' + start[1] + ' - ' + na + ' \\times 4 = ' + A2 + '$.', 'Atomic number: $' + Z(start[0]) + ' - ' + na + ' \\times 2 + ' + nb + ' = ' + Z2 + '$, which is ' + (ELN[SYM[Z2]] || SYM[Z2]) + ': $' + nuc(SYM[Z2], A2) + '$.'],
        'Track the two numbers through each step.', null, { k: 'chain', start: start, na: na, nb: nb });
    }
    return nolint(['+ 0'], P(elName(d[0]) + d[1] + ', $' + nuc(d[0], d[1]) + '$, decays by giving off ' + PNAME[d[2]] + '. What nucleus forms? Give its mass number, atomic number and symbol.',
      multi([['Mass number:', exact(pr[1])], ['Atomic number:', exact(Z(pr[0]))], ['Symbol:', formula(pr[0])]]),
      ['Write the equation with the particle: $' + nuc(d[0], d[1]) + ' \\to {}^{A}_{Z}\\mathrm{X} + ' + PART[d[2]] + '$.', 'Mass numbers balance: $' + d[1] + ' = A + ' + (d[2] === 'alpha' ? 4 : 0) + '$, so $A = ' + pr[1] + '$. Charges balance: $' + z + ' = Z + (' + (d[2] === 'alpha' ? 2 : d[2] === 'beta' ? -1 : 1) + ')$, so $Z = ' + Z(pr[0]) + '$.', 'Element number ' + Z(pr[0]) + ' is ' + (ELN[pr[0]] || pr[0]) + ': $$' + decayEq(d) + '$$'],
      'Both the top numbers and the bottom numbers must add up on each side.', null, { k: 'product', d: d },
      lvl === 1 ? { name: 'ch-eqbalance', opts: { mode: 'nuclear', eq: d[0] + '-' + d[1] + ' -> ' + pr[0] + '-' + pr[1] + ' + ' + (d[2] === 'alpha' ? 'He-4' : d[2] === 'beta' ? 'e-' : 'e+'), quiet: true, edit: false } } : null));
  });

  // half-lives, rounded (NNDC NuDat): name, symbol-A, half-life, unit key
  var HL = [['iodine-131', 'I-131', 8.0, 'd'], ['radon-222', 'Rn-222', 3.8, 'd'], ['cobalt-60', 'Co-60', 5.3, 'y'], ['hydrogen-3 (tritium)', 'H-3', 12.3, 'y'], ['carbon-14', 'C-14', 5700, 'y'],
    ['fluorine-18', 'F-18', 110, 'min'], ['phosphorus-32', 'P-32', 14.3, 'd'], ['strontium-90', 'Sr-90', 28.8, 'y'], ['cesium-137', 'Cs-137', 30.1, 'y'], ['technetium-99m', 'Tc-99m', 6.0, 'h']];
  G('chem.half-life', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['left', 'left', 'time', 'tf'], ['left', 'time', 'fraction', 'halfFrom'], ['date', 'halfFrom', 'percent', 'left']));
    var iso = R.pick(HL), th = iso[2], u = iso[3], n = R.int(lv(ctx, 1, 2, 2), lv(ctx, 3, 4, 5));
    if (shape === 'tf') {
      return P('A sample of ' + iso[0] + ' has a half-life of $' + gx(th) + '\\ ' + ut(u) + '$. True or false: after two half-lives ($' + gx(fix(2 * th)) + '\\ ' + ut(u) + '$), all of it has decayed.', tf(false),
        ['In each half-life, half of what is <b>left</b> decays.', 'After one half-life $\\tfrac{1}{2}$ is left; after two, $\\tfrac{1}{2} \\times \\tfrac{1}{2} = \\tfrac{1}{4}$ is left. The sample never runs out in a fixed number of steps.'],
        'Halve what is left, then halve again.', null, { k: 'tf' });
    }
    if (shape === 'left' || shape === 'percent') {
      var N0 = R.pick([80.0, 64.0, 100, 160, 48.0, 200, 32.0, 120]), left = N0 / M.pow(2, n), mass = R.pick(['g', 'mg']);
      if (shape === 'percent') { var pc = 100 / M.pow(2, n);
        return P(iso[0][0].toUpperCase() + iso[0].slice(1) + ' has a half-life of $' + gx(th) + '\\ ' + ut(u) + '$. What percent of a sample is left after $' + gx(fix(n * th)) + '\\ ' + ut(u) + '$?', { t: 'num', v: plainNum(pc), pct: true, rtol: 0.005 },
          ['Number of half-lives: $' + gx(fix(n * th)) + ' \\div ' + gx(th) + ' = ' + n + '$.', 'Fraction left: $\\left(\\tfrac{1}{2}\\right)^{' + n + '} = \\tfrac{1}{' + M.pow(2, n) + '}$, which is $' + gx(pc) + '\\%$.'],
          'Count half-lives, then halve 100% that many times.', 'pct', { k: 'percent', n: n, v: pc }); }
      return P('A ' + gx(N0) + ' ' + mass + ' sample of ' + iso[0] + ' (half-life $' + gx(th) + '\\ ' + ut(u) + '$) decays. How much ' + iso[0].replace(/ \(.*\)/, '') + ' is left after $' + gx(fix(n * th)) + '\\ ' + ut(u) + '$?', ansX(left),
        ['That is $' + gx(fix(n * th)) + ' \\div ' + gx(th) + ' = ' + n + '$ half-lives.', 'Halve the amount ' + n + ' times: $' + [N0].concat([1, 2, 3, 4, 5].slice(0, n).map(function (k) { return N0 / M.pow(2, k); })).map(function (x) { return gx(x); }).join(' \\to ') + '\\ \\text{' + mass + '}$.', 'Each half-life halves what is left; it never removes a fixed amount.'],
        'Find how many half-lives fit in the time, then halve that many times.', mass, { k: 'left', N0: N0, n: n, v: left },
        ctx.level === 1 ? { name: 'ch-kineticsplot', opts: { mode: 'decay', half: th, unit: up(u), N0: 400, quiet: true } } : null);
    }
    if (shape === 'time' || shape === 'fraction') {
      var frac = M.pow(2, n);
      return P('How long does it take for a sample of ' + iso[0] + ' (half-life $' + gx(th) + '\\ ' + ut(u) + '$) to drop to $\\tfrac{1}{' + frac + '}$ of its starting amount?', ansX(n * th),
        ['$\\tfrac{1}{' + frac + '} = \\left(\\tfrac{1}{2}\\right)^{' + n + '}$, so it takes ' + n + ' half-lives.', 'Time $= ' + n + ' \\times ' + gx(th) + ' = ' + qg(fix(n * th), u) + '$.'],
        'How many times must you halve to reach that fraction?', u, { k: 'time', n: n, th: th, v: n * th });
    }
    if (shape === 'halfFrom') {
      var nn = R.pick([2, 3, 4]), th2 = R.pick([3, 4, 5, 6, 8, 10, 12, 15]), t = nn * th2, N1 = R.pick([800, 640, 960, 1600, 480]), N2 = N1 / M.pow(2, nn), uu = R.pick(['h', 'd', 'min']);
      return P('A detector counts ' + N1 + ' decays per minute from a sample. After $' + t + '\\ ' + ut(uu) + '$ it counts ' + N2 + ' decays per minute. What is the half-life?', ansX(th2),
        ['$' + N1 + ' \\to ' + [1, 2, 3, 4].slice(0, nn).map(function (k) { return N1 / M.pow(2, k); }).join(' \\to ') + '$: the count halved ' + nn + ' times.', 'So ' + t + ' ' + up(uu) + ' is ' + nn + ' half-lives: $' + t + ' \\div ' + nn + ' = ' + qg(th2, uu) + '$.'],
        'Count how many halvings take the first count to the second.', uu, { k: 'halfFrom', t: t, n: nn, v: th2 });
    }
    // carbon dating
    var nd = R.pick([1, 2, 3, 4]), age = nd * 5700, fr = M.pow(2, nd);
    return P('A wooden tool has $\\tfrac{1}{' + fr + '}$ as much carbon-14 per gram of carbon as living wood. Carbon-14 has a half-life of about $5{,}700\\ \\text{years}$. About how old is the tool?', ansX(age),
      ['A living tree keeps the same share of carbon-14; after it dies, the carbon-14 decays without being replaced.', '$\\tfrac{1}{' + fr + '} = \\left(\\tfrac{1}{2}\\right)^{' + nd + '}$: ' + nd + ' half-li' + (nd > 1 ? 'ves' : 'fe') + ' have passed.', 'Age $= ' + nd + ' \\times 5{,}700 = ' + T.commas(age).replace(/,/g, '{,}') + '\\ \\text{years}$.'],
      'How many half-lives give that fraction?', 'y', { k: 'date', n: nd, v: age },
      { name: 'ch-kineticsplot', opts: { mode: 'decay', iso: 'C-14', N0: 400, dating: true, quiet: true } });
  });

  // fission of U-235 by a neutron: [product 1, A1, product 2, A2, neutrons]
  var FIS = [['Ba', 141, 'Kr', 92, 3], ['Xe', 140, 'Sr', 94, 2], ['Xe', 139, 'Sr', 95, 2], ['Cs', 137, 'Rb', 96, 3], ['Te', 137, 'Zr', 97, 2], ['La', 147, 'Br', 87, 2]];
  var FUS = [[['H', 2], ['H', 3], ['He', 4], 'n'], [['H', 2], ['H', 2], ['He', 3], 'n'], [['H', 2], ['H', 2], ['H', 3], 'p'], [['H', 1], ['H', 2], ['He', 3], 'g'], [['He', 3], ['He', 3], ['He', 4], '2p']];
  function fisEq(f, hide) { return nuc('U', 235) + ' + ' + PART.n + ' \\to ' + (hide === 1 ? '\\ ?\\ ' : nuc(f[0], f[1])) + ' + ' + (hide === 2 ? '\\ ?\\ ' : nuc(f[2], f[3])) + ' + ' + (hide === 3 ? '\\ ?\\ ' : f[4]) + PART.n; }
  function fusEq(f) { var x = f[3]; return nuc(f[0][0], f[0][1]) + ' + ' + nuc(f[1][0], f[1][1]) + ' \\to ' + nuc(f[2][0], f[2][1]) + ' + ' + (x === 'n' ? PART.n : x === 'p' ? '{}^{1}_{1}\\mathrm{H}' : x === '2p' ? '2\\,{}^{1}_{1}\\mathrm{H}' : '{}^{0}_{0}\\gamma'); }
  G('chem.fission-fusion', function (R, ctx) {
    var shape = R.pick(lv(ctx, ['classify', 'mc', 'neutrons', 'fusmiss'], ['neutrons', 'missing', 'classify', 'mc', 'fusmiss', 'emc2'], ['missing', 'emc2', 'neutrons', 'classify', 'fusmiss', 'mass']));
    if (shape === 'mc') {
      var m = R.pick([
        ['What powers the Sun?', ['Fusion: hydrogen nuclei join to make helium.', 'Fission: uranium nuclei split.', 'Burning: hydrogen reacts with oxygen.', 'Radioactive decay of carbon-14.'], 'In the Sun\'s core, the temperature and pressure are high enough for hydrogen nuclei to fuse into helium, losing a little mass that becomes energy.'],
        ['What happens in the reactor of a nuclear power plant?', ['Fission: uranium-235 nuclei split after absorbing neutrons.', 'Fusion: hydrogen nuclei join into helium.', 'Uranium burns in oxygen.', 'Alpha decay of uranium-238 alone.'], 'Today\'s power plants run on fission. Each split releases neutrons that can split more nuclei, a controlled chain reaction.'],
        ['Where does the energy released in fission and fusion come from?', ['The products have slightly less mass than the reactants; that mass becomes energy ($E = mc^2$).', 'Chemical bonds between the atoms break.', 'The electrons fall to lower energy levels.', 'The neutrons are destroyed.'], 'In both, the nucleons end up more tightly bound. The products weigh a little less, and the missing mass appears as energy.'],
        ['Which statement compares fission and fusion correctly?', ['Fission splits heavy nuclei; fusion joins light nuclei. Both release energy.', 'Fission joins light nuclei; fusion splits heavy ones.', 'Only fission releases energy.', 'Both split nuclei, but fusion uses hydrogen.'], 'The two are opposite processes, at opposite ends of the periodic table, and both move toward the most tightly bound nuclei near iron.']]);
      return P(m[0], mc(m[1][0], m[1].slice(1)), [m[2]], '"Fission" means splitting; "fusion" means joining.', null, { k: 'mc' });
    }
    if (shape === 'classify') {
      var kind = R.int(0, 2), eqx;
      if (kind === 0) eqx = fisEq(R.pick(FIS)); else if (kind === 1) eqx = fusEq(R.pick(FUS)); else { var dd = R.pick(DEC); eqx = decayEq(dd); }
      return P('What kind of nuclear change is this? $$' + eqx + '$$', mcAll(['fission', 'fusion', 'radioactive decay'], kind, true),
        [kind === 0 ? 'A neutron splits a heavy uranium nucleus into two middle-sized nuclei and more neutrons: fission.' : kind === 1 ? 'Two light nuclei join into a heavier one: fusion.' : 'One unstable nucleus gives off a particle on its own, with nothing hitting it: radioactive decay.'],
        'Is a heavy nucleus split, are light nuclei joined, or does one nucleus give off a particle by itself?', null, { k: 'classify', v: kind });
    }
    if (shape === 'fusmiss') {
      var fu = R.pick(FUS), x = fu[3], prod = fu[2];
      return nolint(['+ 0'], P('Find the missing nucleus in this fusion reaction: $$' + nuc(fu[0][0], fu[0][1]) + ' + ' + nuc(fu[1][0], fu[1][1]) + ' \\to \\ ?\\ + ' + (x === 'n' ? PART.n : x === 'p' ? '{}^{1}_{1}\\mathrm{H}' : x === '2p' ? '2\\,{}^{1}_{1}\\mathrm{H}' : '{}^{0}_{0}\\gamma') + '$$ Give its mass number, atomic number and symbol.',
        multi([['Mass number:', exact(prod[1])], ['Atomic number:', exact(Z(prod[0]))], ['Symbol:', formula(prod[0])]]),
        ['Mass numbers: $' + fu[0][1] + ' + ' + fu[1][1] + ' = A + ' + (x === 'n' || x === 'p' ? 1 : x === '2p' ? 2 : 0) + '$, so $A = ' + prod[1] + '$.', 'Atomic numbers: $' + Z(fu[0][0]) + ' + ' + Z(fu[1][0]) + ' = Z + ' + (x === 'p' ? 1 : x === '2p' ? 2 : 0) + '$, so $Z = ' + Z(prod[0]) + '$: ' + ELN[prod[0]] + '-' + prod[1] + '.', 'Light nuclei joining into a heavier one: fusion, the process that powers stars.'],
        'Balance the mass numbers and the atomic numbers.', null, { k: 'fusmiss', f: fu }));
    }
    var f = R.pick(FIS);
    if (shape === 'neutrons') {
      return P('Complete this fission of uranium-235: $$' + fisEq(f, 3) + '$$ How many neutrons are released?', exact(f[4]),
        ['Mass numbers must balance: $235 + 1 = ' + f[1] + ' + ' + f[3] + ' + x$.', '$x = 236 - ' + (f[1] + f[3]) + ' = ' + f[4] + '$ neutrons. (Atomic numbers: $92 = ' + Z(f[0]) + ' + ' + Z(f[2]) + '$, already balanced.)', 'These neutrons can split more uranium nuclei: a chain reaction.'],
        'Add up the mass numbers on each side.', null, { k: 'neutrons', f: f, v: f[4] });
    }
    if (shape === 'missing') {
      var hide = R.pick([1, 2]), hs = hide === 1 ? f[0] : f[2], hA = hide === 1 ? f[1] : f[3], os = hide === 1 ? f[2] : f[0], oA = hide === 1 ? f[3] : f[1];
      return nolint(['+ 0'], P('Find the missing nucleus in this fission: $$' + fisEq(f, hide) + '$$ Give its mass number, atomic number and symbol.', multi([['Mass number:', exact(hA)], ['Atomic number:', exact(Z(hs))], ['Symbol:', formula(hs)]]),
        ['Mass numbers: $235 + 1 = A + ' + oA + ' + ' + f[4] + '$, so $A = ' + hA + '$.', 'Atomic numbers: $92 + 0 = Z + ' + Z(os) + ' + 0$, so $Z = ' + Z(hs) + '$, which is ' + (ELN[hs] || hs) + ' ($' + nuc(hs, hA) + '$).'],
        'Balance the top numbers and the bottom numbers separately.', null, { k: 'missing', f: f, hide: hide }));
    }
    if (shape === 'mass') {
      var Ej = R.pick([9.0, 4.5, 1.8, 2.7, 3.6, 18, 45, 0.90]) * 1e13, kg = Ej / 9.00e16, gm = kg * 1000;
      return P('A nuclear reaction releases $' + gx(Ej, 1) + '\\ \\text{J}$. How many grams of mass disappeared? Use $E = mc^2$ with $c = 3.00 \\times 10^{8}\\ \\text{m/s}$.', ans(gm, 0.01),
        ['$m = \\dfrac{E}{c^2} = \\dfrac{' + gx(Ej, 1) + '}{9.00 \\times 10^{16}} = ' + qx(kg, 'kg') + '$.', 'In grams: $' + fx(kg, 3) + '\\ \\text{kg} \\times 1000 = ' + qx(gm, 'g') + '$.'],
        'Divide the energy by $c^2$; the result is in kilograms.', 'g', { k: 'mass', E: Ej, v: gm });
    }
    var mg = R.pick([0.10, 0.50, 1.0, 2.0, 0.25, 0.020, 0.040, 0.20, 1.5, 0.0050, 3.0, 0.80]), E = mg / 1000 * 9.00e16;
    return P('In a nuclear reaction, $' + gx(mg) + '\\ \\text{g}$ of mass disappears. How much energy, in joules, is released? Use $E = mc^2$ with $c = 3.00 \\times 10^{8}\\ \\text{m/s}$. (Scientific notation such as 9.0e13 is fine.)', ans(E, 0.01),
      ['Mass in kilograms: $' + gx(mg) + '\\ \\text{g} = ' + gx(mg / 1000) + '\\ \\text{kg}$.', '$E = mc^2 = ' + gx(mg / 1000) + ' \\times (3.00 \\times 10^{8})^2 = ' + gx(mg / 1000) + ' \\times 9.00 \\times 10^{16} = ' + qx(E, 'J') + '$.', 'A tiny mass gives an enormous energy, because $c^2$ is so large.'],
      'Change grams to kilograms first.', 'J', { k: 'emc2', m: mg, v: E });
  });

  // exposed for the part's node tests (a unique name, so part A's helpers never collide)
  ML._chemB = { parseF: parseF, mm: mm, fT: fT, parseEq: parseEq, eqT: eqT, sideAtoms: sideAtoms, sfStr: sfStr, fx: fx, gx: gx, AM: AM };
})(window.MathLadder);
