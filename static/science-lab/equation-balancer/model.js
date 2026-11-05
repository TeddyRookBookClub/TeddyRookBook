/* Equation Balancer model (/science-lab/equation-balancer/), written for this site with no outside code.
   window.EBModel, or require() in Node for scripts/equation-balancer/test-model.js.

   SPECIES: each substance's formula (the subscripts never change) and a little structure string that says how its
   atoms join, used only to draw it as a cluster of balls: an element symbol is one atom, bonded to the atom before it;
   (…) is a branch; a digit opens or closes a ring bond. The tests check that every drawing has exactly the atoms its
   formula says. line: true lays a molecule out straight (carbon dioxide is linear). REACTIONS: well-known reactions with their smallest whole-number coefficients. */
(function (g) {
  'use strict';
  // CPK-style colors (after the Jmol defaults) and relative ball sizes, drawn by this site's own code
  var EL = {
    H: { c: '#ffffff', r: 0.62, n: 'hydrogen' }, C: { c: '#909090', r: 1, n: 'carbon' }, N: { c: '#3050f8', r: 0.96, n: 'nitrogen' },
    O: { c: '#ff0d0d', r: 0.92, n: 'oxygen' }, Na: { c: '#ab5cf2', r: 1.3, n: 'sodium' }, Mg: { c: '#8aff00', r: 1.2, n: 'magnesium' },
    Al: { c: '#bfa6a6', r: 1.2, n: 'aluminum' }, S: { c: '#ffff30', r: 1.12, n: 'sulfur' }, Cl: { c: '#1ff01f', r: 1.15, n: 'chlorine' },
    Ca: { c: '#3dff00', r: 1.36, n: 'calcium' }, Fe: { c: '#e06633', r: 1.2, n: 'iron' }, Cu: { c: '#c88033', r: 1.16, n: 'copper' },
    Zn: { c: '#7d80b0', r: 1.16, n: 'zinc' }, Ag: { c: '#c0c0c0', r: 1.26, n: 'silver' }
  };
  var SPECIES = {
    H2: { s: 'HH', n: 'hydrogen' }, O2: { s: 'OO', n: 'oxygen' }, H2O: { s: 'HOH', n: 'water' }, N2: { s: 'NN', n: 'nitrogen' },
    NH3: { s: 'N(H)(H)H', n: 'ammonia' }, Na: { s: 'Na', n: 'sodium' }, Cl2: { s: 'ClCl', n: 'chlorine' }, NaCl: { s: 'NaCl', n: 'sodium chloride (table salt)' },
    Mg: { s: 'Mg', n: 'magnesium' }, MgO: { s: 'MgO', n: 'magnesium oxide' }, HCl: { s: 'HCl', n: 'hydrogen chloride' },
    NO: { s: 'NO', n: 'nitrogen monoxide' }, H2O2: { s: 'HOOH', n: 'hydrogen peroxide' }, Zn: { s: 'Zn', n: 'zinc' },
    ZnCl2: { s: 'ClZnCl', n: 'zinc chloride' }, CH4: { s: 'C(H)(H)(H)H', n: 'methane (natural gas)' }, CO2: { s: 'OCO', n: 'carbon dioxide', line: true },
    Fe: { s: 'Fe', n: 'iron' }, Fe2O3: { s: 'OFeOFeO', n: 'iron(III) oxide (rust)' }, Al: { s: 'Al', n: 'aluminum' },
    Al2O3: { s: 'OAlOAlO', n: 'aluminum oxide' }, Ca: { s: 'Ca', n: 'calcium' }, 'Ca(OH)2': { s: 'HOCaOH', n: 'calcium hydroxide' },
    CaCO3: { s: 'CaOC(O)O', n: 'calcium carbonate (chalk, limestone)' }, CaCl2: { s: 'ClCaCl', n: 'calcium chloride' },
    Cu: { s: 'Cu', n: 'copper' }, AgNO3: { s: 'AgON(O)O', n: 'silver nitrate' }, 'Cu(NO3)2': { s: 'ON(O)OCuON(O)O', n: 'copper(II) nitrate' },
    Ag: { s: 'Ag', n: 'silver' }, SO2: { s: 'OSO', n: 'sulfur dioxide' }, SO3: { s: 'OS(O)O', n: 'sulfur trioxide' },
    NaOH: { s: 'NaOH', n: 'sodium hydroxide' }, H2SO4: { s: 'HOS(O)(O)OH', n: 'sulfuric acid' }, Na2SO4: { s: 'NaOS(O)(O)ONa', n: 'sodium sulfate' },
    FeCl3: { s: 'ClFe(Cl)Cl', n: 'iron(III) chloride' }, C3H8: { s: 'C(H)(H)(H)C(H)(H)C(H)(H)H', n: 'propane' },
    C2H5OH: { s: 'C(H)(H)(H)C(H)(H)OH', n: 'ethanol' }, CO: { s: 'CO', n: 'carbon monoxide' }, CuSO4: { s: 'CuOS(O)(O)O', n: 'copper(II) sulfate' },
    'Al2(SO4)3': { s: 'OS(O)(O)OAlOS(O)(O)OAlOS(O)(O)O', n: 'aluminum sulfate' }, AlCl3: { s: 'ClAl(Cl)Cl', n: 'aluminum chloride' },
    C6H12O6: { s: 'HOC(H)(H)C(H)(OH)C(H)(OH)C(H)(OH)C(H)(OH)C(H)O', n: 'glucose (a sugar)' }, C2H6: { s: 'C(H)(H)(H)C(H)(H)H', n: 'ethane' },
    C4H10: { s: 'C(H)(H)(H)C(H)(H)C(H)(H)C(H)(H)H', n: 'butane' }
  };
  function R(id, level, title, r, p, ans, note) { return { id: id, level: level, title: title, r: r, p: p, ans: ans, note: note }; }
  var REACTIONS = [
    R('water', 1, 'Hydrogen burns to make water', ['H2', 'O2'], ['H2O'], [2, 1, 2], 'Hydrogen burns in air with a pale flame, and the only product is water.'),
    R('ammonia', 1, 'Making ammonia', ['N2', 'H2'], ['NH3'], [1, 3, 2], 'The Haber process makes ammonia from the nitrogen in air; most of it becomes fertilizer.'),
    R('salt', 1, 'Table salt from its elements', ['Na', 'Cl2'], ['NaCl'], [2, 1, 2], 'A soft metal and a green gas combine into the salt on your table.'),
    R('magnesium', 1, 'Magnesium burns', ['Mg', 'O2'], ['MgO'], [2, 1, 2], 'Magnesium burns with a dazzling white light and leaves a white powder.'),
    R('hcl', 1, 'Hydrogen and chlorine', ['H2', 'Cl2'], ['HCl'], [1, 1, 2], 'Each molecule of hydrogen chloride takes one atom from each side.'),
    R('lightning', 1, 'Lightning splits nitrogen', ['N2', 'O2'], ['NO'], [1, 1, 2], 'The heat of a lightning bolt is enough to join the nitrogen and oxygen in air.'),
    R('peroxide', 1, 'Hydrogen peroxide breaks down', ['H2O2'], ['H2O', 'O2'], [2, 2, 1], 'The fizz when peroxide meets a slice of raw potato is this oxygen; an enzyme in the potato speeds it up.'),
    R('zinc', 1, 'Zinc in acid', ['Zn', 'HCl'], ['ZnCl2', 'H2'], [1, 2, 1, 1], 'A metal that is more reactive than hydrogen pushes hydrogen out of an acid.'),
    R('methane', 2, 'Natural gas burns', ['CH4', 'O2'], ['CO2', 'H2O'], [1, 2, 1, 2], 'A gas stove’s flame: carbon goes to carbon dioxide, hydrogen to water.'),
    R('rust', 2, 'Iron rusts', ['Fe', 'O2'], ['Fe2O3'], [4, 3, 2], 'Rust needs water too, but its overall result is iron(III) oxide.'),
    R('alumina', 2, 'Aluminum and oxygen', ['Al', 'O2'], ['Al2O3'], [4, 3, 2], 'A thin skin of aluminum oxide protects aluminum foil from going further.'),
    R('calcium', 2, 'Calcium in water', ['Ca', 'H2O'], ['Ca(OH)2', 'H2'], [1, 2, 1, 1], 'Calcium fizzes gently in water and leaves the solution called limewater.'),
    R('chalk', 2, 'Chalk and acid', ['CaCO3', 'HCl'], ['CaCl2', 'H2O', 'CO2'], [1, 2, 1, 1, 1], 'Acid fizzing on limestone is the test geologists use for it.'),
    R('silver', 2, 'A silver tree', ['Cu', 'AgNO3'], ['Cu(NO3)2', 'Ag'], [1, 2, 1, 2], 'A copper wire in silver nitrate solution grows shiny silver crystals and the liquid turns blue.'),
    R('so3', 2, 'Sulfur trioxide', ['SO2', 'O2'], ['SO3'], [2, 1, 2], 'A step on the way to sulfuric acid, made in industry with a catalyst.'),
    R('neutral', 2, 'An acid meets a base', ['NaOH', 'H2SO4'], ['Na2SO4', 'H2O'], [2, 1, 1, 2], 'Neutralization: an acid and a base make a salt and water.'),
    R('fecl3', 2, 'Iron and chlorine', ['Fe', 'Cl2'], ['FeCl3'], [2, 3, 2], 'Chlorine has 2 atoms per molecule and iron chloride needs 3, so the least they share is 6.'),
    R('propane', 3, 'Propane burns', ['C3H8', 'O2'], ['CO2', 'H2O'], [1, 5, 3, 4], 'The fuel in a gas grill. Balance carbon, then hydrogen, then oxygen last.'),
    R('ethanol', 3, 'Ethanol burns', ['C2H5OH', 'O2'], ['CO2', 'H2O'], [1, 3, 2, 3], 'Ethanol already carries one oxygen atom, so it needs a little less from the air.'),
    R('furnace', 3, 'The blast furnace', ['Fe2O3', 'CO'], ['Fe', 'CO2'], [1, 3, 2, 3], 'Carbon monoxide takes the oxygen away from iron ore, leaving iron.'),
    R('alcu', 3, 'Aluminum and copper sulfate', ['Al', 'CuSO4'], ['Al2(SO4)3', 'Cu'], [2, 3, 1, 3], 'Aluminum is more reactive than copper and takes its place. Count the SO₄ groups as units.'),
    R('alhcl', 3, 'Aluminum in acid', ['Al', 'HCl'], ['AlCl3', 'H2'], [2, 6, 2, 3], 'Three chlorines on one side, two hydrogens on the other: the least they share is 6.'),
    R('photo', 3, 'Photosynthesis', ['CO2', 'H2O'], ['C6H12O6', 'O2'], [6, 6, 1, 6], 'Plants use the energy of light to turn carbon dioxide and water into sugar, giving off oxygen.'),
    R('resp', 3, 'Respiration', ['C6H12O6', 'O2'], ['CO2', 'H2O'], [1, 6, 6, 6], 'Your cells run photosynthesis backward: sugar and oxygen give carbon dioxide, water and energy.'),
    R('ethane', 3, 'Ethane burns', ['C2H6', 'O2'], ['CO2', 'H2O'], [2, 7, 4, 6], 'You will want 3½ O₂ for one ethane; double everything to get whole numbers.'),
    R('ostwald', 3, 'Ammonia burns on a catalyst', ['NH3', 'O2'], ['NO', 'H2O'], [4, 5, 4, 6], 'The first step of making nitric acid from ammonia, on a hot platinum gauze.'),
    R('butane', 3, 'Butane burns', ['C4H10', 'O2'], ['CO2', 'H2O'], [2, 13, 8, 10], 'The fuel in a lighter. Halves again: double everything.')
  ];
  var MAXC = 16;

  // ---------- formulas ----------
  function parseFormula(f) {
    var i = 0;
    function group() {
      var out = {};
      while (i < f.length && f[i] !== ')') {
        var sub;
        if (f[i] === '(') { i++; sub = group(); i++; }
        else { var m = /^[A-Z][a-z]?/.exec(f.slice(i)); if (!m) throw new Error('bad formula ' + f); i += m[0].length; sub = {}; sub[m[0]] = 1; }
        var d = /^\d+/.exec(f.slice(i)), k = d ? +d[0] : 1; if (d) i += d[0].length;
        for (var e in sub) out[e] = (out[e] || 0) + sub[e] * k;
      }
      return out;
    }
    return group();
  }
  // ---------- structures -> atoms and bonds ----------
  function parseStruct(s) {
    var atoms = [], bonds = [], stack = [], prev = -1, rings = {}, i = 0;
    while (i < s.length) {
      var ch = s[i];
      if (ch === '(') { stack.push(prev); i++; continue; }
      if (ch === ')') { prev = stack.pop(); i++; continue; }
      if (ch === '=') { i++; continue; }
      if (/\d/.test(ch)) { if (rings[ch] !== undefined) { bonds.push([rings[ch], prev]); delete rings[ch]; } else rings[ch] = prev; i++; continue; }
      var m = /^[A-Z][a-z]?/.exec(s.slice(i)); if (!m) throw new Error('bad structure ' + s);
      atoms.push(m[0]); if (prev >= 0) bonds.push([prev, atoms.length - 1]);
      prev = atoms.length - 1; i += m[0].length;
    }
    return { atoms: atoms, bonds: bonds };
  }
  // a deterministic layout: balls joined by springs, pushed apart when they overlap, then turned to lie flat
  function layout(sp) {
    var st = parseStruct(sp.s), n = st.atoms.length, P = [], i, j, it;
    var rad = st.atoms.map(function (e) { return EL[e].r; });
    for (i = 0; i < n; i++) { var a = i * 2.39996; P.push({ x: Math.cos(a) * (1 + i * 0.35), y: Math.sin(a) * (1 + i * 0.35) }); }
    var nb = {}; st.bonds.forEach(function (b) { nb[b[0] + ',' + b[1]] = nb[b[1] + ',' + b[0]] = 1; });
    if (sp.line) { var x0 = 0; P = rad.map(function (r, k) { x0 += k ? 0.8 * (rad[k - 1] + r) : 0; return { x: x0, y: 0 }; }); }
    for (it = 0; it < (sp.line ? 0 : 600); it++) {
      var F = P.map(function () { return { x: 0, y: 0 }; }), cool = 0.12 * (1 - it / 700);
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
        var dx = P[j].x - P[i].x, dy = P[j].y - P[i].y, d = Math.hypot(dx, dy) || 0.01, ux = dx / d, uy = dy / d, f = 0;
        if (nb[i + ',' + j]) f = (d - 0.8 * (rad[i] + rad[j])) * 0.5;
        else { var want = (rad[i] + rad[j]) * 1.05; if (d < want * 1.35) f = -(want * 1.35 - d) * 0.3; }
        F[i].x += f * ux; F[i].y += f * uy; F[j].x -= f * ux; F[j].y -= f * uy;
      }
      for (i = 0; i < n; i++) { P[i].x += F[i].x * cool * 4; P[i].y += F[i].y * cool * 4; }
    }
    var cx = 0, cy = 0; P.forEach(function (p) { cx += p.x; cy += p.y; }); cx /= n; cy /= n;
    var sxx = 0, sxy = 0, syy = 0; P.forEach(function (p) { p.x -= cx; p.y -= cy; sxx += p.x * p.x; sxy += p.x * p.y; syy += p.y * p.y; });
    var ang = 0.5 * Math.atan2(2 * sxy, sxx - syy), c = Math.cos(-ang), s2 = Math.sin(-ang);
    var ext = 0, w = 0, h = 0;
    var atoms = P.map(function (p, k) { var x = p.x * c - p.y * s2, y = p.x * s2 + p.y * c; return { e: st.atoms[k], x: x, y: y, r: rad[k] }; });
    atoms.forEach(function (a) { ext = Math.max(ext, Math.hypot(a.x, a.y) + a.r); w = Math.max(w, Math.abs(a.x) + a.r); h = Math.max(h, Math.abs(a.y) + a.r); });
    atoms.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    return { atoms: atoms, bonds: st.bonds, ext: ext, w: w, h: h };
  }
  var cache = {};
  function shape(f) { return cache[f] || (cache[f] = layout(SPECIES[f])); }
  function count(f) { return parseFormula(f); }
  function structCount(f) { var c = {}; parseStruct(SPECIES[f].s).atoms.forEach(function (e) { c[e] = (c[e] || 0) + 1; }); return c; }

  // ---------- tallies ----------
  // coef: numbers in the order r..., p...
  function elements(rx) { var seen = {}, out = []; rx.r.concat(rx.p).forEach(function (f) { Object.keys(count(f)).forEach(function (e) { if (!seen[e]) { seen[e] = 1; out.push(e); } }); }); return out; }
  function tally(rx, coef) {
    var L = {}, Rr = {}, nr = rx.r.length;
    elements(rx).forEach(function (e) { L[e] = 0; Rr[e] = 0; });
    rx.r.concat(rx.p).forEach(function (f, k) { var c = count(f), side = k < nr ? L : Rr; for (var e in c) side[e] += c[e] * coef[k]; });
    return { L: L, R: Rr };
  }
  function balanced(rx, coef) {
    if (coef.some(function (c) { return c < 1; })) return false;
    var t = tally(rx, coef); return elements(rx).every(function (e) { return t.L[e] === t.R[e]; });
  }
  function imbalance(rx, coef) { var t = tally(rx, coef), s = 0; elements(rx).forEach(function (e) { s += Math.abs(t.L[e] - t.R[e]); }); return s; }
  // What one more (d = +1) or one fewer (d = −1) molecule of substance k does to each element: −1 closer, +1 further, 0 no change
  function effect(rx, coef, k, d) {
    var t0 = tally(rx, coef), c2 = coef.slice(); c2[k] += d; var t1 = tally(rx, c2), out = {}, f = rx.r.concat(rx.p)[k];
    Object.keys(count(f)).forEach(function (e) { var a = Math.abs(t0.L[e] - t0.R[e]), b = Math.abs(t1.L[e] - t1.R[e]); out[e] = b < a ? -1 : b > a ? 1 : 0; });
    return { per: out, total: imbalance(rx, c2) - imbalance(rx, coef) };
  }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function reduce(coef) { var g0 = coef.reduce(function (a, b) { return gcd(a, b); }); return coef.map(function (c) { return c / g0; }); }
  // the smallest whole-number coefficients, worked out from the atom counts (exact fractions; one free coefficient)
  function solveCoefs(rx) {
    var sp = rx.r.concat(rx.p), nr = rx.r.length, els = elements(rx), m = sp.length;
    var A = els.map(function (e) { return sp.map(function (f, k) { return (count(f)[e] || 0) * (k < nr ? 1 : -1); }); });
    // fractions as [num, den]
    function fr(n, d) { var g0 = gcd(Math.abs(n), Math.abs(d)) || 1; if (d < 0) { n = -n; d = -d; } return [n / g0, d / g0]; }
    function sub(a, b) { return fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]); }
    function mul(a, b) { return fr(a[0] * b[0], a[1] * b[1]); }
    function div(a, b) { return fr(a[0] * b[1], a[1] * b[0]); }
    var M2 = A.map(function (row) { return row.map(function (v) { return fr(v, 1); }); }), piv = [], r = 0, c, i, j;
    for (c = 0; c < m && r < M2.length; c++) {
      var p = -1; for (i = r; i < M2.length; i++) if (M2[i][c][0] !== 0) { p = i; break; }
      if (p < 0) continue;
      var t = M2[r]; M2[r] = M2[p]; M2[p] = t;
      var pv = M2[r][c]; M2[r] = M2[r].map(function (v) { return div(v, pv); });
      for (i = 0; i < M2.length; i++) if (i !== r && M2[i][c][0] !== 0) { var f = M2[i][c]; for (j = 0; j < m; j++) M2[i][j] = sub(M2[i][j], mul(f, M2[r][j])); }
      piv.push(c); r++;
    }
    var free = []; for (c = 0; c < m; c++) if (piv.indexOf(c) < 0) free.push(c);
    if (free.length !== 1) return null;
    var x = new Array(m); x[free[0]] = [1, 1];
    piv.forEach(function (pc, k) { x[pc] = fr(-M2[k][free[0]][0], M2[k][free[0]][1]); });
    var L = x.reduce(function (a, v) { return a * v[1] / gcd(a, v[1]); }, 1), ints = x.map(function (v) { return v[0] * L / v[1]; });
    if (ints[0] < 0) ints = ints.map(function (v) { return -v; });
    return reduce(ints);
  }
  function pretty(f) { return f.replace(/(\d+)/g, function (d) { return d.split('').map(function (c) { return '₀₁₂₃₄₅₆₇₈₉'[+c]; }).join(''); }); }
  function eqText(rx, coef) {
    var sp = rx.r.concat(rx.p), nr = rx.r.length;
    function side(a, off) { return a.map(function (f, k) { var c = coef ? coef[k + off] : 1; return (c === 1 ? '' : c + ' ') + pretty(f); }).join(' + '); }
    return side(rx.r, 0) + ' → ' + side(rx.p, nr);
  }

  var api = { EL: EL, SPECIES: SPECIES, REACTIONS: REACTIONS, MAXC: MAXC, parseFormula: parseFormula, parseStruct: parseStruct, shape: shape, count: count, structCount: structCount,
    elements: elements, tally: tally, balanced: balanced, imbalance: imbalance, effect: effect, reduce: reduce, gcd: gcd, solveCoefs: solveCoefs, pretty: pretty, eqText: eqText };
  if (typeof module === 'object' && module.exports) module.exports = api; else g.EBModel = api;
})(typeof window !== 'undefined' ? window : this);
