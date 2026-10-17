// ---- 00_head.js
/* Math Ladder problem generators for Abstract Algebra (course key aa). Built from /tmp/work_aa/gen/*.js by
   /tmp/work_aa/build-gen.js. Every answer is computed from the generated data (brute force over small groups, exact
   integer and polynomial arithmetic mod p) and checked again, independently, by /tmp/work_aa/test/verify.js.
   Conventions: permutations compose right to left (στ = do τ first); Dₙ has 2n elements r^k and r^k s with
   s r = r⁻¹ s; ℤₙ answers are least nonnegative residues; polynomials over ℤₚ use coefficients 0 … p − 1.
   Pictures in problems use the course visuals (static/math/viz/aa.js) with quiet: true.                           */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, T = ML.T, U = ML.util, M = Math;

  // ---------------------------------------------------------------- answers and small helpers
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function lv(ctx) { return (ctx && ctx.level) || 1; }
  function num(v, o) { return Object.assign({ t: 'num', v: String(v) }, o || {}); }
  function tf(v) { return { t: 'tf', v: !!v }; }
  function mc(correct, wrongs) { var ch = [correct], seen = {}; seen[correct] = 1; wrongs.forEach(function (w) { if (!seen[w]) { seen[w] = 1; ch.push(w); } }); return { t: 'mc', choices: ch, v: 0 }; }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function mcAll(choices, rightIdx) { return { t: 'mc', choices: choices, v: rightIdx.slice().sort(function (a, b) { return a - b; }) }; }
  function setA(arr) { return { t: 'set', v: arr.map(String) }; }
  function tup(arr) { return { t: 'tuple', v: arr.map(String) }; }
  function expr(v, vars) { return { t: 'expr', v: v, vars: vars || ['x'] }; }
  function multi(parts) { return { t: 'multi', parts: parts }; }
  function part(label, a) { return { label: label, a: a }; }
  function txt(arr) { return { t: 'text', v: arr }; }
  function seqText(arr) { // a sequence of labels typed many ways: "B, D, A", "BDA", "B D A", "B-D-A", "B → D → A"
    var j = [', ', '', ' ', ',', '-', ' - ', ' → ', '→', ' -> ', '->', '–', ' – ', ' , '], out = [];
    j.forEach(function (s) { var t = arr.join(s); if (out.indexOf(t) < 0) out.push(t); });
    return { t: 'text', v: out };
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function sortN(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function uniqN(a) { var o = []; a.forEach(function (x) { if (o.indexOf(x) < 0) o.push(x); }); return o; }
  function plural(n, w, ws) { return n + ' ' + (n === 1 ? w : (ws || w + 's')); }
  function setTex(arr) { return arr.length ? '\\{' + arr.join(', ') + '\\}' : '\\varnothing'; }
  function sameSet(a, b) { if (a.length !== b.length) return false; var x = sortN(a), y = sortN(b); return x.every(function (v, i) { return v === y[i]; }); }
  var LET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  // a proof's steps shown in shuffled order with letters; answer = the letters in the right order
  function orderProblem(R, intro, steps, extra) {
    var idx = R.shuffle(range(0, steps.length - 1));
    while (idx.every(function (v, i) { return v === i; })) idx = R.shuffle(idx);
    var shown = idx.map(function (k, i) { return '<b>' + LET[i] + '.</b> ' + steps[k]; });
    var ans = range(0, steps.length - 1).map(function (k) { return LET[idx.indexOf(k)]; });
    return Object.assign({ q: intro + '<br>' + shown.join('<br>') + '<br>Type the letters in order (like ' + LET.slice(0, steps.length).join(', ') + ').', a: seqText(ans),
      steps: steps.map(function (s, i) { return ans[i] + ': ' + s; }), hint: 'Which line has to come first: what does the proof assume or name before anything else?' }, extra || {});
  }

  // ---------------------------------------------------------------- integers
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function lcmA(arr) { return arr.reduce(function (s, x) { return lcm(s, x); }, 1); }
  function mod(a, n) { var r = a % n; return r < 0 ? r + n : r; }
  function phi(n) { var c = 0; for (var k = 1; k <= n; k++) if (gcd(k, n) === 1) c++; return c; }
  function units(n) { var r = []; for (var k = 1; k < n; k++) if (gcd(k, n) === 1) r.push(k); if (n === 1) r.push(0); return r; }
  function divisors(n) { var r = []; for (var d = 1; d <= n; d++) if (n % d === 0) r.push(d); return r; }
  function ordAdd(k, n) { return n / gcd(k, n); }
  function ordMul(a, n) { var x = mod(a, n), k = 1; while (x !== 1) { x = x * a % n; k++; if (k > n) return 0; } return k; }
  function invMod(a, n) { a = mod(a, n); for (var x = 1; x < n; x++) if (a * x % n === 1) return x; return null; }
  function powMod(a, e, n) { var r = 1 % n, b = mod(a, n); while (e > 0) { if (e & 1) r = r * b % n; b = b * b % n; e >>= 1; } return r; }
  function isPrime(n) { if (n < 2) return false; for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
  function factorize(n) { var out = [], p = 2; while (p * p <= n) { if (n % p === 0) { var k = 0; while (n % p === 0) { n /= p; k++; } out.push([p, k]); } p++; } if (n > 1) out.push([n, 1]); return out; }
  function partitions(n, max) { max = max === undefined ? n : max; if (n === 0) return [[]]; var out = []; for (var k = M.min(n, max); k >= 1; k--) partitions(n - k, k).forEach(function (p) { out.push([k].concat(p)); }); return out; }
  function nPart(n) { return partitions(n).length; }
  function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }
  function Z(n) { return '\\mathbb{Z}_{' + n + '}'; }
  function Un(n) { return 'U(' + n + ')'; }
  function gen(a) { return '\\langle ' + a + ' \\rangle'; }
  function sub(n) { return String(n).split('').map(function (c) { return '₀₁₂₃₄₅₆₇₈₉'[+c]; }).join(''); }
  function sup(n) { return String(n).split('').map(function (c) { return c === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; }).join(''); }
  function htable(head, rows, cap) { // a small HTML table for a question (first column as row heads)
    var h = '<div class="mlp-table-wrap"><table class="mlp-table">' + (cap ? '<caption>' + cap + '</caption>' : '') + '<thead><tr>' + head.map(function (x) { return '<th scope="col">' + x + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr>' + r.map(function (x, i) { return i ? '<td>' + x + '</td>' : '<th scope="row">' + x + '</th>'; }).join('') + '</tr>'; });
    return h + '</tbody></table></div>';
  }

  // ---------------------------------------------------------------- permutations (0-based arrays inside, 1-based outside)
  function pid(n) { return range(0, n - 1); }
  function pcomp(s, t) { return t.map(function (x) { return s[x]; }); } // s∘t: t first
  function pinv(s) { var r = []; s.forEach(function (x, i) { r[x] = i; }); return r; }
  function peq(s, t) { return s.length === t.length && s.every(function (x, i) { return x === t[i]; }); }
  function pcycles(s) { // disjoint cycles of length >= 2, 1-based, each starting at its smallest entry, ordered by first entry
    var seen = [], out = [];
    for (var i = 0; i < s.length; i++) { if (seen[i]) continue; var c = [], j = i; while (!seen[j]) { seen[j] = 1; c.push(j + 1); j = s[j]; } if (c.length > 1) out.push(c); }
    return out;
  }
  function pfrom(cycles, n) { // product of cycles (1-based), applied right to left
    var s = pid(n);
    for (var k = cycles.length - 1; k >= 0; k--) { var c = cycles[k], t = pid(n); for (var i = 0; i < c.length; i++) t[c[i] - 1] = c[(i + 1) % c.length] - 1; s = pcomp(t, s); }
    return s;
  }
  function pord(s) { return lcmA(pcycles(s).map(function (c) { return c.length; })); }
  function psign(s) { return pcycles(s).reduce(function (g, c) { return g * (c.length % 2 ? 1 : -1); }, 1); }
  function ptype(s) { return pcycles(s).map(function (c) { return c.length; }).sort(function (a, b) { return b - a; }); }
  function cycTex(cyc) { return cyc.length ? cyc.map(function (c) { return '(' + c.join('\\;') + ')'; }).join('') : 'e'; }
  function pTex(s) { return cycTex(pcycles(s)); }
  function twoRow(s) { return '\\begin{pmatrix}' + s.map(function (_, i) { return i + 1; }).join(' & ') + ' \\\\ ' + s.map(function (x) { return x + 1; }).join(' & ') + '\\end{pmatrix}'; }
  function idxPerms(k) { if (k <= 1) return [range(0, k - 1)]; var out = []; idxPerms(k - 1).forEach(function (p) { for (var i = 0; i <= p.length; i++) out.push(p.slice(0, i).concat([k - 1], p.slice(i))); }); return out; }
  var ID_WORDS = ['e', '(1)', '()', 'id', 'identity', '1', 'ε', 'the identity'];
  function permText(s) { // every common spelling of the cycle form of s (any rotation and order of the cycles; spaces or commas)
    var cyc = pcycles(s); if (!cyc.length) return txt(ID_WORDS.slice());
    var small = s.length <= 9, out = [], seen = {}, canon = cyc.map(function (c) { return '(' + c.join(' ') + ')'; }).join('');
    out.push(canon); seen[canon] = 1;
    var rots = [[]];
    cyc.forEach(function (c) { var nx = []; rots.forEach(function (pre) { for (var r = 0; r < c.length; r++) nx.push(pre.concat([c.slice(r).concat(c.slice(0, r))])); }); rots = nx; });
    var seps = small ? [' ', ',', ', ', ''] : [' ', ',', ', '], joins = ['', ' '];
    rots.forEach(function (cs) {
      idxPerms(cs.length).forEach(function (ord) {
        seps.forEach(function (sp) { joins.forEach(function (jn) { var t = ord.map(function (k) { return '(' + cs[k].join(sp) + ')'; }).join(jn); if (!seen[t]) { seen[t] = 1; out.push(t); } }); });
      });
    });
    return txt(out);
  }
  function permShow(s) { return pcycles(s).map(function (c) { return '(' + c.join(' ') + ')'; }).join('') || 'e'; }
  function randPerm(R, n) { return R.shuffle(pid(n)); }
  function randPermNot(R, n, bad) { for (var t = 0; t < 50; t++) { var s = randPerm(R, n); if (!bad(s)) return s; } return pfrom([[1, 2]], n); }
  function oneLine(s) { return '(' + s.map(function (x) { return x + 1; }).join(', ') + ')'; }

  // ---------------------------------------------------------------- dihedral group D_n: [k, f] = r^k s^f
  function dmul(n, a, b) { return a[1] ? [mod(a[0] - b[0], n), 1 - b[1]] : [mod(a[0] + b[0], n), b[1]]; }
  function dinv(n, a) { return a[1] ? a.slice() : [mod(-a[0], n), 0]; }
  function dpow(n, a, k) { var r = [0, 0]; for (var i = 0; i < k; i++) r = dmul(n, r, a); return r; }
  function dord(n, a) { return a[1] ? 2 : ordAdd(a[0], n); }
  function deq(a, b) { return a[0] === b[0] && a[1] === b[1]; }
  function dTex(a) { var k = a[0], f = a[1]; if (!k && !f) return 'e'; return (k === 0 ? '' : k === 1 ? 'r' : 'r^{' + k + '}') + (f ? 's' : ''); }
  function dText(a) {
    var k = a[0], f = a[1], v = [];
    if (!k && !f) return txt(['e', '1', 'id', 'identity', 'r^0', 'the identity']);
    if (!k) return txt(['s', 'r^0s', 'r^0 s']);
    var bases = k === 1 ? ['r', 'r^1', 'r^(1)', 'r1', 'r¹'] : ['r^' + k, 'r^(' + k + ')', 'r' + k, 'r' + sup(k), 'r^{' + k + '}'];
    bases.forEach(function (b) { if (f) ['s', ' s', '*s', '·s', ' * s'].forEach(function (t) { v.push(b + t); }); else v.push(b); });
    return txt(v);
  }
  function dElems(n) { var out = []; for (var f = 0; f < 2; f++) for (var k = 0; k < n; k++) out.push([k, f]); return out; }
  function dPerm(n, a) { // r^k s^f as a permutation of the vertices 1..n (counterclockwise; s fixes vertex 1)
    var p = []; for (var j = 0; j < n; j++) { var x = a[1] ? mod(-j, n) : j; p.push(mod(x + a[0], n)); } return p;
  }

  // ---------------------------------------------------------------- finite groups as multiplication tables
  // mkGroup(elements, mul(a, b), key(a), tex(a), name) -> { n, els, tex(i), mul(i, j), e, inv(i), name, add }
  function mkGroup(els, mul, key, tex, name, add) {
    var idx = {}; els.forEach(function (x, i) { idx[key(x)] = i; });
    var n = els.length, tbl = [];
    for (var i = 0; i < n; i++) { tbl.push([]); for (var j = 0; j < n; j++) { var k = idx[key(mul(els[i], els[j]))]; if (k === undefined) throw new Error('not closed: ' + name); tbl[i].push(k); } }
    var e = -1; for (i = 0; i < n && e < 0; i++) { var ok = true; for (j = 0; j < n; j++) if (tbl[i][j] !== j || tbl[j][i] !== j) { ok = false; break; } if (ok) e = i; }
    var inv = []; for (i = 0; i < n; i++) for (j = 0; j < n; j++) if (tbl[i][j] === e) { inv[i] = j; break; }
    return { n: n, els: els, tbl: tbl, e: e, inv: function (i) { return inv[i]; }, mul: function (i, j) { return tbl[i][j]; }, tex: function (i) { return tex(els[i]); }, name: name, add: !!add, idx: function (x) { return idx[key(x)]; } };
  }
  function gZ(n) { return mkGroup(range(0, n - 1), function (a, b) { return (a + b) % n; }, String, String, Z(n), true); }
  function gU(n) { return mkGroup(units(n), function (a, b) { return a * b % n; }, String, String, Un(n)); }
  function gD(n) { return mkGroup(dElems(n), function (a, b) { return dmul(n, a, b); }, String, dTex, 'D_{' + n + '}'); }
  function gS(n) { var els = []; (function rec(p, rest) { if (!rest.length) { els.push(p); return; } rest.forEach(function (x, i) { rec(p.concat([x]), rest.slice(0, i).concat(rest.slice(i + 1))); }); })([], pid(n)); els.sort(function (a, b) { return pord(a) - pord(b) || (pTex(a) < pTex(b) ? -1 : 1); }); return mkGroup(els, pcomp, String, pTex, 'S_{' + n + '}'); }
  function gA(n) { var S = gS(n); return mkGroup(S.els.filter(function (s) { return psign(s) === 1; }), pcomp, String, pTex, 'A_{' + n + '}'); }
  function gZxZ(m, n) { var els = []; for (var a = 0; a < m; a++) for (var b = 0; b < n; b++) els.push([a, b]); return mkGroup(els, function (x, y) { return [(x[0] + y[0]) % m, (x[1] + y[1]) % n]; }, String, function (x) { return '(' + x[0] + ', ' + x[1] + ')'; }, Z(m) + ' \\times ' + Z(n), true); }
  var QN = ['1', '-1', 'i', '-i', 'j', '-j', 'k', '-k'];
  function qmul(a, b) { // quaternion units as strings
    var sa = a[0] === '-' ? -1 : 1, sb = b[0] === '-' ? -1 : 1, x = a.replace('-', ''), y = b.replace('-', ''), s = sa * sb, r;
    if (x === '1') r = y; else if (y === '1') r = x; else if (x === y) { r = '1'; s = -s; }
    else { var c = { ij: 'k', jk: 'i', ki: 'j', ji: 'k', kj: 'i', ik: 'j' }[x + y]; r = c; if (x + y === 'ji' || x + y === 'kj' || x + y === 'ik') s = -s; }
    return (s < 0 ? '-' : '') + r;
  }
  function gQ8() { return mkGroup(QN, qmul, String, function (x) { return x; }, 'Q_{8}'); }
  function gord(Gr, i) { var x = i, k = 1; while (x !== Gr.e) { x = Gr.mul(x, i); k++; } return k; }
  function gpow(Gr, i, k) { var x = Gr.e; for (var t = 0; t < k; t++) x = Gr.mul(x, i); return x; }
  function gspan(Gr, gens) { // the subgroup generated (finite group: closure under products is enough)
    var H = [Gr.e], frontier = [Gr.e];
    while (frontier.length) { var nx = []; frontier.forEach(function (h) { gens.forEach(function (g) { var x = Gr.mul(h, g); if (H.indexOf(x) < 0) { H.push(x); nx.push(x); } }); }); frontier = nx; }
    return H.sort(function (a, b) { return a - b; });
  }
  function isSubgroup(Gr, H) { if (H.indexOf(Gr.e) < 0) return false; for (var i = 0; i < H.length; i++) for (var j = 0; j < H.length; j++) if (H.indexOf(Gr.mul(H[i], H[j])) < 0) return false; return true; }
  function leftCoset(Gr, g, H) { return H.map(function (h) { return Gr.mul(g, h); }).sort(function (a, b) { return a - b; }); }
  function rightCoset(Gr, g, H) { return H.map(function (h) { return Gr.mul(h, g); }).sort(function (a, b) { return a - b; }); }
  function isNormal(Gr, H) { for (var g = 0; g < Gr.n; g++) for (var i = 0; i < H.length; i++) { var c = Gr.mul(Gr.mul(g, H[i]), Gr.inv(g)); if (H.indexOf(c) < 0) return false; } return true; }
  function conjClass(Gr, x) { var c = []; for (var g = 0; g < Gr.n; g++) { var y = Gr.mul(Gr.mul(g, x), Gr.inv(g)); if (c.indexOf(y) < 0) c.push(y); } return c.sort(function (a, b) { return a - b; }); }
  function center(Gr) { var z = []; for (var x = 0; x < Gr.n; x++) { var ok = true; for (var g = 0; g < Gr.n; g++) if (Gr.mul(g, x) !== Gr.mul(x, g)) { ok = false; break; } if (ok) z.push(x); } return z; }
  function isAbelian(Gr) { for (var i = 0; i < Gr.n; i++) for (var j = 0; j < i; j++) if (Gr.mul(i, j) !== Gr.mul(j, i)) return false; return true; }
  function orderCounts(Gr) { var c = {}; for (var i = 0; i < Gr.n; i++) { var o = gord(Gr, i); c[o] = (c[o] || 0) + 1; } return c; }
  function allSubgroups(Gr) { // by closing every pair of cyclic subgroups repeatedly (fine for |G| <= 24)
    var subs = {}, list = [];
    function add(H) { var k = H.join(','); if (!subs[k]) { subs[k] = 1; list.push(H); return true; } return false; }
    for (var i = 0; i < Gr.n; i++) add(gspan(Gr, [i]));
    var grew = true; while (grew) { grew = false; var L = list.slice(); for (var a = 0; a < L.length; a++) for (var b = a + 1; b < L.length; b++) if (add(gspan(Gr, L[a].concat(L[b])))) grew = true; }
    return list.sort(function (x, y) { return x.length - y.length; });
  }
  function texList(Gr, H) { return H.map(function (i) { return Gr.tex(i); }); }

  // ---------------------------------------------------------------- polynomials over Z_p (arrays low -> high; [] is 0)
  function ptrim(a) { a = a.slice(); while (a.length && !a[a.length - 1]) a.pop(); return a; }
  function pnorm(a, p) { return ptrim(a.map(function (c) { return mod(c, p); })); }
  function pdeg(a) { a = ptrim(a); return a.length - 1; }
  function padd(a, b, p) { var r = []; for (var i = 0; i < M.max(a.length, b.length); i++) r.push((a[i] || 0) + (b[i] || 0)); return pnorm(r, p); }
  function psub(a, b, p) { var r = []; for (var i = 0; i < M.max(a.length, b.length); i++) r.push((a[i] || 0) - (b[i] || 0)); return pnorm(r, p); }
  function pmul(a, b, p) { if (!a.length || !b.length) return []; var r = []; for (var i = 0; i < a.length + b.length - 1; i++) r.push(0); a.forEach(function (x, i) { b.forEach(function (y, j) { r[i + j] += x * y; }); }); return pnorm(r, p); }
  function pscale(a, c, p) { return pnorm(a.map(function (x) { return x * c; }), p); }
  function pdivmod(a, b, p) { // a = q b + r over Z_p (p prime)
    a = pnorm(a, p); b = pnorm(b, p); if (!b.length) throw new Error('divide by 0');
    var q = [], r = a.slice(), db = b.length - 1, li = invMod(b[db], p);
    for (var i = 0; i <= a.length - 1 - db; i++) q.push(0);
    while (r.length - 1 >= db && r.length) { var sh = r.length - 1 - db, c = mod(r[r.length - 1] * li, p); q[sh] = c; for (var j = 0; j <= db; j++) r[sh + j] = mod(r[sh + j] - c * b[j], p); r = ptrim(r); }
    return [ptrim(q), r];
  }
  function pmonic(a, p) { a = pnorm(a, p); if (!a.length) return a; return pscale(a, invMod(a[a.length - 1], p), p); }
  function pgcd(a, b, p) { a = pnorm(a, p); b = pnorm(b, p); while (b.length) { var r = pdivmod(a, b, p)[1]; a = b; b = r; } return pmonic(a, p); }
  function peval(a, x, p) { var v = 0; for (var i = a.length - 1; i >= 0; i--) v = mod(v * x + a[i], p); return v; }
  function proots(a, p) { var r = []; for (var x = 0; x < p; x++) if (!peval(a, x, p)) r.push(x); return r; }
  function peq(a, b) { a = ptrim(a); b = ptrim(b); return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function pTexP(a, v) { a = ptrim(a); return a.length ? T.poly(a.slice().reverse(), v || 'x') : '0'; }
  function pPlain(a, v) { // CAS syntax, highest degree first
    v = v || 'x'; a = ptrim(a); if (!a.length) return '0';
    var out = [];
    for (var i = a.length - 1; i >= 0; i--) { var c = a[i]; if (!c) continue; var ac = M.abs(c), term = i === 0 ? String(ac) : (ac === 1 ? '' : ac + '*') + v + (i > 1 ? '^' + i : ''); out.push((out.length ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '')) + term); }
    return out.join('');
  }
  function monicPolys(d, p) { // all monic polynomials of degree d over Z_p
    var out = [], total = M.pow(p, d);
    for (var t = 0; t < total; t++) { var c = [], x = t; for (var i = 0; i < d; i++) { c.push(x % p); x = M.floor(x / p); } c.push(1); out.push(c); }
    return out;
  }
  function pirred(a, p) { // brute force: no monic factor of degree 1 .. deg/2
    a = pnorm(a, p); var d = a.length - 1; if (d < 1) return false; if (d === 1) return true;
    for (var k = 1; k <= M.floor(d / 2); k++) { var L = monicPolys(k, p); for (var i = 0; i < L.length; i++) if (!pdivmod(a, L[i], p)[1].length) return false; }
    return true;
  }
  function randPoly(R, d, p, monic) { var c = []; for (var i = 0; i < d; i++) c.push(R.int(0, p - 1)); c.push(monic ? 1 : R.int(1, p - 1)); return c; }
  function irreducibles(d, p) { return monicPolys(d, p).filter(function (f) { return pirred(f, p); }); }
  function zpx(p) { return '\\mathbb{Z}_{' + p + '}[x]'; }
  // integer polynomials (over Q): arrays low -> high
  function ipTex(a, v) { return T.poly(ptrim(a).slice().reverse(), v || 'x'); }
  function ipPlain(a, v) { return pPlain(a, v); }
  function ipeval(a, x) { var v = ML.Q(0); for (var i = a.length - 1; i >= 0; i--) v = v.mul(x).add(a[i]); return v; }

  // ---------------------------------------------------------------- GF(p^n) = Z_p[x]/(f)
  function gfmul(a, b, f, p) { return pdivmod(pmul(a, b, p), f, p)[1]; }
  function gfpow(a, k, f, p) { var r = [1]; for (var i = 0; i < k; i++) r = gfmul(r, a, f, p); return r; }
  function gford(a, f, p) { a = pnorm(a, p); if (!a.length) return 0; var x = a.slice(), k = 1; while (!peq(x, [1])) { x = gfmul(x, a, f, p); k++; if (k > 1000) return 0; } return k; }
  function gfinv(a, f, p) { var q = M.pow(p, f.length - 1), o = gford(a, f, p); return gfpow(a, o - 1, f, p); }
  function gfAll(f, p) { var n = f.length - 1, out = []; for (var t = 0; t < M.pow(p, n); t++) { var c = [], x = t; for (var i = 0; i < n; i++) { c.push(x % p); x = M.floor(x / p); } out.push(ptrim(c)); } return out; }


  // ================================================================ unit 1: groups
  var LETTERS = ['e', 'a', 'b', 'c', 'd', 'f', 'g', 'h'];
  // a small group relabeled with letters (identity = e), rows and columns in a shuffled order after e
  function letterGroup(R, which) {
    var Gr = which === 'Z4' ? gZ(4) : which === 'V' ? gZxZ(2, 2) : which === 'Z5' ? gZ(5) : which === 'Z6' ? gZ(6) : which === 'S3' ? gS(3) : gZ(3);
    var others = R.shuffle(range(0, Gr.n - 1).filter(function (i) { return i !== Gr.e; }));
    var lab = []; lab[Gr.e] = 'e'; others.forEach(function (g, i) { lab[g] = LETTERS[i + 1]; });
    var order = [Gr.e].concat(R.shuffle(others));
    return { Gr: Gr, lab: lab, order: order, which: which };
  }
  function letterTableHtml(L, cap) {
    var Gr = L.Gr;
    return htable(['$\\ast$'].concat(L.order.map(function (j) { return '$' + L.lab[j] + '$'; })), L.order.map(function (i) { return ['$' + L.lab[i] + '$'].concat(L.order.map(function (j) { return '$' + L.lab[Gr.mul(i, j)] + '$'; })); }), cap);
  }
  function randTable(R, labs, opts) { // an arbitrary operation on labs: tbl[i][j] index
    var n = labs.length, t = [];
    for (var i = 0; i < n; i++) { t.push([]); for (var j = 0; j < n; j++) t[i].push(R.int(0, n - 1)); }
    return t;
  }
  function tableHtml(labs, t, sym) { return htable(['$' + (sym || '\\ast') + '$'].concat(labs.map(function (x) { return '$' + x + '$'; })), labs.map(function (x, i) { return ['$' + x + '$'].concat(t[i].map(function (k) { return '$' + labs[k] + '$'; })); })); }
  function findIdentity(t) { var n = t.length; for (var i = 0; i < n; i++) { var ok = true; for (var j = 0; j < n; j++) if (t[i][j] !== j || t[j][i] !== j) ok = false; if (ok) return i; } return -1; }
  function isComm(t) { for (var i = 0; i < t.length; i++) for (var j = 0; j < i; j++) if (t[i][j] !== t[j][i]) return false; return true; }
  function isAssoc(t) { var n = t.length; for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) for (var c = 0; c < n; c++) if (t[t[a][b]][c] !== t[a][t[b][c]]) return false; return true; }
  // operations on Z given by formulas: [tex of a*b, function, associative?, commutative?, identity or null]
  var ZOPS = [
    ['a + b + 1', function (a, b) { return a + b + 1; }],
    ['a + b - 3', function (a, b) { return a + b - 3; }],
    ['a - b', function (a, b) { return a - b; }],
    ['2a + b', function (a, b) { return 2 * a + b; }],
    ['ab + 1', function (a, b) { return a * b + 1; }],
    ['a + b + ab', function (a, b) { return a + b + a * b; }],
    ['a + 2b', function (a, b) { return a + 2 * b; }],
    ['ab - a - b + 2', function (a, b) { return a * b - a - b + 2; }],
    ['\\max(a, b)', function (a, b) { return M.max(a, b); }],
    ['|a - b|', function (a, b) { return M.abs(a - b); }],
    ['a', function (a, b) { return a; }]
  ];
  function opProps(f) { // brute-force checks on a window of integers (enough to expose the failures used here)
    var ass = true, com = true;
    for (var a = -4; a <= 4; a++) for (var b = -4; b <= 4; b++) { if (f(a, b) !== f(b, a)) com = false; for (var c = -4; c <= 4; c++) if (f(f(a, b), c) !== f(a, f(b, c))) ass = false; }
    return { assoc: ass, comm: com };
  }

  G('aa.binary-operations', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['read', 'read', 'compute', 'identity']), R.pick(['read', 'comm', 'identity', 'compute', 'closed']), R.pick(['assoc', 'closed', 'comm', 'compute', 'assocTable']));
    var labs = ['a', 'b', 'c', 'd'].slice(0, L === 1 ? 3 : 4);
    if (shape === 'read') {
      var t, x, y, k = 0;
      do { t = randTable(R, labs); x = R.int(0, labs.length - 1); y = R.intNot(0, labs.length - 1, x); k++; } while (t[x][y] === t[y][x] && k < 50);
      if (t[x][y] === t[y][x]) t[y][x] = (t[x][y] + 1) % labs.length;
      return { q: 'The table defines an operation $\\ast$ on $' + setTex(labs) + '$ (row first, then column).' + tableHtml(labs, t) + 'What is $' + labs[x] + ' \\ast ' + labs[y] + '$?', a: txt([labs[t[x][y]]]),
        steps: ['$' + labs[x] + ' \\ast ' + labs[y] + '$ is in row $' + labs[x] + '$ and column $' + labs[y] + '$.', 'That entry is $' + labs[t[x][y]] + '$.', 'Careful: $' + labs[y] + ' \\ast ' + labs[x] + ' = ' + labs[t[y][x]] + '$ (row $' + labs[y] + '$, column $' + labs[x] + '$) is a different entry, so this operation is not commutative.'],
        hint: 'The left element picks the row; the right element picks the column.' };
    }
    if (shape === 'identity') {
      var n = labs.length, idn = R.chance(0.75) ? R.int(0, n - 1) : -1, t2;
      for (var tries = 0; tries < 100; tries++) {
        t2 = randTable(R, labs);
        if (idn >= 0) for (var i = 0; i < n; i++) { t2[idn][i] = i; t2[i][idn] = i; }
        else { var near = R.int(0, n - 1), j0 = R.intNot(0, n - 1, near); for (i = 0; i < n; i++) { t2[near][i] = i; t2[i][near] = i; } t2[j0][near] = (j0 + 1) % n; }
        if (findIdentity(t2) === idn) break;
      }
      var ch = labs.map(function (l) { return '$' + l + '$'; }).concat(['There is no identity.']), right = idn >= 0 ? idn : n;
      return { q: 'The table defines an operation $\\ast$ on $' + setTex(labs) + '$.' + tableHtml(labs, t2) + 'Which element is the identity?', a: mcKeep(ch, right),
        steps: ['An identity $u$ has $u \\ast x = x$ (its row repeats the column headings) and $x \\ast u = x$ (its column repeats the row headings), for every $x$.',
          idn >= 0 ? 'Row $' + labs[idn] + '$ reads ' + labs.map(function (l) { return '$' + l + '$'; }).join(', ') + ', and so does column $' + labs[idn] + '$.' : 'No element has both a matching row and a matching column' + (function () { for (var u = 0; u < n; u++) { var rowOk = t2[u].every(function (v, j) { return v === j; }); if (rowOk) { for (var j = 0; j < n; j++) if (t2[j][u] !== j) return ': row $' + labs[u] + '$ matches, but $' + labs[j] + ' \\ast ' + labs[u] + ' = ' + labs[t2[j][u]] + '$, not $' + labs[j] + '$'; } } return ''; })() + '.',
          idn >= 0 ? 'So $' + labs[idn] + '$ is the identity.' : 'So there is no identity.'],
        hint: 'Look for a row that copies the heading row, then check that element\'s column too.' };
    }
    if (shape === 'comm') {
      var t3 = randTable(R, labs), sym = R.chance(0.5);
      if (sym) for (var a = 0; a < labs.length; a++) for (var b = 0; b < a; b++) t3[a][b] = t3[b][a];
      else { var p = R.int(1, labs.length - 1), q2 = R.int(0, p - 1); for (a = 0; a < labs.length; a++) for (b = 0; b < a; b++) t3[a][b] = t3[b][a]; t3[p][q2] = (t3[q2][p] + R.int(1, labs.length - 1)) % labs.length; }
      var comm = isComm(t3), bad = null; if (!comm) for (a = 0; a < labs.length && !bad; a++) for (b = 0; b < a; b++) if (t3[a][b] !== t3[b][a]) { bad = [a, b]; break; }
      return { q: 'Is the operation in this table commutative?' + tableHtml(labs, t3), a: tf(comm),
        steps: ['Commutative means $x \\ast y = y \\ast x$ for all $x, y$: the table is symmetric across its main diagonal.', comm ? 'Every entry matches its mirror image across the diagonal.' : '$' + labs[bad[0]] + ' \\ast ' + labs[bad[1]] + ' = ' + labs[t3[bad[0]][bad[1]]] + '$ but $' + labs[bad[1]] + ' \\ast ' + labs[bad[0]] + ' = ' + labs[t3[bad[1]][bad[0]]] + '$.', comm ? 'So it is commutative.' : 'So it is not commutative.'],
        hint: 'Compare each entry with the one in the mirror position across the main diagonal.' };
    }
    if (shape === 'compute') {
      var ops = L === 1 ? ZOPS.slice(0, 4).concat([ZOPS[6]]) : ZOPS.slice(0, 8), op = R.pick(ops), x1 = R.int(-4, 6), y1 = R.int(-3, 5), z1 = R.int(-3, 5);
      var left = R.coin(), inner = left ? op[1](x1, y1) : op[1](y1, z1), val = left ? op[1](inner, z1) : op[1](x1, inner);
      var expr1 = left ? '(' + T.p(x1) + ' \\ast ' + T.p(y1) + ') \\ast ' + T.p(z1) : T.p(x1) + ' \\ast (' + T.p(y1) + ' \\ast ' + T.p(z1) + ')';
      return { q: 'On $\\mathbb{Z}$, define $a \\ast b = ' + op[0] + '$. Compute $' + expr1 + '$.', a: num(val),
        steps: ['Work inside the parentheses first: $' + (left ? T.p(x1) + ' \\ast ' + T.p(y1) : T.p(y1) + ' \\ast ' + T.p(z1)) + ' = ' + inner + '$.', 'Then $' + (left ? T.p(inner) + ' \\ast ' + T.p(z1) : T.p(x1) + ' \\ast ' + T.p(inner)) + ' = ' + val + '$.'],
        hint: 'Substitute into the formula for $a \\ast b$ twice, inside first.' };
    }
    if (shape === 'closed') {
      var pool = [
        ['the odd integers', 'addition', false, '$1 + 1 = 2$ is even.'], ['the odd integers', 'multiplication', true, '$(2a + 1)(2b + 1) = 2(2ab + a + b) + 1$ is odd.'],
        ['the even integers', 'multiplication', true, '$(2a)(2b) = 2(2ab)$ is even.'], ['$\\{-1, 0, 1\\}$', 'addition', false, '$1 + 1 = 2$ is not in the set.'],
        ['$\\{-1, 0, 1\\}$', 'multiplication', true, 'Every product of two of $-1, 0, 1$ is again $-1$, $0$ or $1$.'], ['the negative integers', 'multiplication', false, '$(-1)(-1) = 1$ is positive.'],
        ['the irrational numbers', 'addition', false, '$\\sqrt{2} + (-\\sqrt{2}) = 0$ is rational.'], ['the integers of the form $3k + 1$', 'multiplication', true, '$(3a + 1)(3b + 1) = 3(3ab + a + b) + 1$.'],
        ['the integers of the form $3k + 2$', 'multiplication', false, '$2 \\cdot 2 = 4 = 3 \\cdot 1 + 1$ has the form $3k + 1$.'], ['the positive rational numbers', 'division', true, 'A quotient of two positive rationals is a positive rational.'],
        ['the $2 \\times 2$ real matrices with determinant $1$', 'matrix multiplication', true, '$\\det(AB) = \\det A \\det B = 1$.'], ['the $2 \\times 2$ real matrices with determinant $0$', 'matrix addition', false, '$\\begin{pmatrix} 1 & 0 \\\\ 0 & 0 \\end{pmatrix} + \\begin{pmatrix} 0 & 0 \\\\ 0 & 1 \\end{pmatrix} = I$ has determinant $1$.'],
        ['the positive integers', 'subtraction', false, '$1 - 2 = -1$ is not positive.'], ['$\\{1, 2, 4\\}$', 'multiplication mod $7$', true, 'The products mod 7 are $1, 2, 4$ again ($2 \\cdot 4 = 8 \\equiv 1$, $4 \\cdot 4 = 16 \\equiv 2$).'],
        ['$\\{1, 2, 3\\}$', 'multiplication mod $4$', false, '$2 \\cdot 2 = 4 \\equiv 0 \\pmod{4}$, and $0$ is not in the set.'], ['$\\{1, 3, 5, 7\\}$', 'multiplication mod $8$', true, 'Every product is odd and not a multiple of 8, so it reduces to $1, 3, 5$ or $7$.']];
      var it = R.pick(pool);
      return { q: (/^the /.test(it[0]) ? 'Are ' : 'Is ') + it[0] + ' closed under ' + it[1] + '?', a: tf(it[2]), steps: ['Closed means every combination of two elements of the set lands back in the set.', it[3], it[2] ? 'So the set is closed.' : 'One example that leaves the set is enough: it is not closed.'], hint: 'Try a few products, then look for a reason (or a single example that escapes).' };
    }
    if (shape === 'assocTable') {
      var t4, as4, tries2 = 0; do { t4 = randTable(R, ['a', 'b']); as4 = isAssoc(t4); tries2++; } while (tries2 < 30 && R.chance(0.5) !== as4);
      var lab2 = ['a', 'b'], wit = null; if (!as4) for (var u = 0; u < 2 && !wit; u++) for (var v = 0; v < 2 && !wit; v++) for (var w = 0; w < 2; w++) if (t4[t4[u][v]][w] !== t4[u][t4[v][w]]) { wit = [u, v, w]; break; }
      return { q: 'Is the operation in this table associative? (There are $8$ triples to check.)' + tableHtml(lab2, t4), a: tf(as4),
        steps: ['Associative means $(x \\ast y) \\ast z = x \\ast (y \\ast z)$ for all eight choices of $x, y, z$.', as4 ? 'All eight triples agree.' : 'For $x = ' + lab2[wit[0]] + '$, $y = ' + lab2[wit[1]] + '$, $z = ' + lab2[wit[2]] + '$: $(x \\ast y) \\ast z = ' + lab2[t4[wit[0]][wit[1]]] + ' \\ast ' + lab2[wit[2]] + ' = ' + lab2[t4[t4[wit[0]][wit[1]]][wit[2]]] + '$, but $x \\ast (y \\ast z) = ' + lab2[wit[0]] + ' \\ast ' + lab2[t4[wit[1]][wit[2]]] + ' = ' + lab2[t4[wit[0]][t4[wit[1]][wit[2]]]] + '$.', as4 ? 'So it is associative.' : 'One triple that fails is enough: not associative.'],
        hint: 'A symmetric table only shows commutativity. For associativity, test triples.' };
    }
    // assoc: formula operations on Z
    var op2 = R.pick(ZOPS), pr = opProps(op2[1]), w3 = null;
    if (!pr.assoc) for (var a3 = 0; a3 <= 3 && !w3; a3++) for (var b3 = 0; b3 <= 3 && !w3; b3++) for (var c3 = 0; c3 <= 3; c3++) if (op2[1](op2[1](a3, b3), c3) !== op2[1](a3, op2[1](b3, c3))) { w3 = [a3, b3, c3]; break; }
    return { q: 'On $\\mathbb{Z}$, define $a \\ast b = ' + op2[0] + '$. Is $\\ast$ associative?', a: tf(pr.assoc),
      steps: pr.assoc ? ['Compute both groupings in general.', 'For $' + op2[0] + '$, $(a \\ast b) \\ast c$ and $a \\ast (b \\ast c)$ simplify to the same expression' + (op2[0] === 'a + b + ab' ? ': both equal $(1 + a)(1 + b)(1 + c) - 1$.' : op2[0] === 'ab - a - b + 2' ? ': both equal $(a - 1)(b - 1)(c - 1) + 1$.' : op2[0] === '\\max(a, b)' ? ': both are the largest of $a, b, c$.' : op2[0] === 'a' ? ': both equal $a$.' : '.'), 'So it is associative.']
        : ['Test a triple: $a = ' + w3[0] + '$, $b = ' + w3[1] + '$, $c = ' + w3[2] + '$.', '$(a \\ast b) \\ast c = ' + op2[1](w3[0], w3[1]) + ' \\ast ' + w3[2] + ' = ' + op2[1](op2[1](w3[0], w3[1]), w3[2]) + '$.', '$a \\ast (b \\ast c) = ' + w3[0] + ' \\ast ' + T.p(op2[1](w3[1], w3[2])) + ' = ' + op2[1](w3[0], op2[1](w3[1], w3[2])) + '$.', 'They differ, so $\\ast$ is not associative.'],
      hint: 'Try small numbers for $a$, $b$, $c$ in both groupings; if they always agree, simplify both in general.' };
  });

  // finite examples S ⊆ Z_n under + or × mod n, checked by brute force
  function modExample(R, L) {
    var add = L === 1 ? R.coin() : R.chance(0.35), n, S;
    if (add) { n = R.pick([6, 8, 9, 10, 12]); var d = R.pick(divisors(n).filter(function (x) { return x > 1 && x < n; })); S = R.pick([range(0, n / d - 1).map(function (k) { return k * d; }), range(0, n / d).map(function (k) { return k * d; }).filter(function (x) { return x < n; }).concat([1]).slice(0, n / d), range(0, M.min(n - 1, 3))]); S = uniqN(S.filter(function (x) { return x < n; })); }
    else { n = R.pick([5, 7, 8, 9, 10, 12, 15]); S = R.pick([units(n), range(1, n - 1), units(n).slice(0, M.max(2, units(n).length - 1)), [1, n - 1], range(0, n - 1), [1].concat(R.sample(range(2, n - 1), 2))]); S = sortN(uniqN(S)); }
    var opf = add ? function (a, b) { return (a + b) % n; } : function (a, b) { return a * b % n; };
    var closed = true, wit = null; S.forEach(function (a) { S.forEach(function (b) { if (closed && S.indexOf(opf(a, b)) < 0) { closed = false; wit = [a, b]; } }); });
    var idn = null; if (closed) S.forEach(function (u) { if (idn === null && S.every(function (x) { return opf(u, x) === x; })) idn = u; });
    var noInv = null; if (closed && idn !== null) S.forEach(function (a) { if (noInv === null && !S.some(function (b) { return opf(a, b) === idn; })) noInv = a; });
    var fail = !closed ? 'closure' : idn === null ? 'identity' : noInv !== null ? 'inverses' : 'none';
    return { n: n, S: S, add: add, opf: opf, fail: fail, wit: wit, idn: idn, noInv: noInv, opTex: add ? '+' : '\\cdot', opWord: add ? 'addition mod ' + n : 'multiplication mod ' + n };
  }
  function modExampleSteps(E) {
    var s = ['Associativity is automatic: addition and multiplication of integers are associative, and reducing mod $' + E.n + '$ respects both.'];
    if (E.fail === 'closure') s.push('Closure fails: $' + E.wit[0] + ' ' + E.opTex + ' ' + E.wit[1] + ' \\equiv ' + E.opf(E.wit[0], E.wit[1]) + ' \\pmod{' + E.n + '}$, which is not in the set.');
    else { s.push('Closure holds: every ' + (E.add ? 'sum' : 'product') + ' of two elements reduces to an element of the set.'); if (E.fail === 'identity') s.push('No element $u$ of the set has $u ' + E.opTex + ' x \\equiv x$ for every $x$ in the set, so there is no identity.'); else { s.push('The identity is $' + E.idn + '$.'); s.push(E.fail === 'inverses' ? '$' + E.noInv + '$ has no inverse: no element $y$ of the set gives $' + E.noInv + ' ' + E.opTex + ' y \\equiv ' + E.idn + '$.' : 'Every element has an inverse in the set (each row of the table contains the identity).'); } }
    return s;
  }
  var INF = [ // [set, operation, first axiom that fails or 'none', reason]
    ['$\\mathbb{Z}$', 'subtraction', 'associativity', '$(5 - 3) - 1 = 1$ but $5 - (3 - 1) = 3$.'],
    ['the odd integers', 'addition', 'closure', '$1 + 3 = 4$ is not odd.'],
    ['$\\mathbb{N} = \\{0, 1, 2, \\dots\\}$', 'addition', 'inverses', 'The identity is $0$, but $1 + y = 0$ has no solution $y$ in $\\mathbb{N}$.'],
    ['$\\mathbb{Q}$', 'multiplication', 'inverses', 'The identity is $1$, but $0 \\cdot y = 1$ has no solution.'],
    ['$\\mathbb{Q} \\setminus \\{0\\}$', 'division', 'associativity', '$(8 \\div 4) \\div 2 = 1$ but $8 \\div (4 \\div 2) = 4$.'],
    ['the $2 \\times 2$ real matrices', 'multiplication', 'inverses', 'The identity is $I$, but a matrix with determinant $0$ has no inverse.'],
    ['the invertible $2 \\times 2$ real matrices', 'multiplication', 'none', 'Products of invertible matrices are invertible ($\\det AB = \\det A \\det B \\ne 0$), $I$ is the identity, and $A^{-1}$ is invertible.'],
    ['$\\mathbb{Z}$', 'the operation $a \\ast b = a + b + 1$', 'none', 'It is associative (both groupings give $a + b + c + 2$), the identity is $-1$, and the inverse of $a$ is $-a - 2$.'],
    ['$\\mathbb{R}$', 'the operation $a \\ast b = a + b + ab$', 'inverses', 'It is associative and $0$ is the identity, but $(-1) \\ast y = -1$ for every $y$, so $-1$ has no inverse.'],
    ['the positive real numbers', 'multiplication', 'none', 'Products of positive numbers are positive, $1$ is the identity, and $1/a$ is the inverse of $a$.'],
    ['$\\{1, -1, i, -i\\}$', 'multiplication', 'none', 'It is closed (these are the powers of $i$), $1$ is the identity, and $i \\cdot (-i) = 1$, $(-1)(-1) = 1$.'],
    ['the even integers', 'multiplication', 'identity', 'It is closed and associative, but $1$ is not even, and no even $u$ has $u \\cdot 2 = 2$.'],
    ['$\\mathbb{Z}$', 'the operation $a \\ast b = 2a + b$', 'associativity', '$(1 \\ast 0) \\ast 0 = 4$ but $1 \\ast (0 \\ast 0) = 2$.']];
  var AX = { closure: 'Closure fails.', associativity: 'Associativity fails.', identity: 'There is no identity.', inverses: 'Some element has no inverse.', none: 'It is a group.' };

  G('aa.group-axioms', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['isgroup', 'isgroup', 'idinv']), R.pick(['fails', 'idinv', 'inf', 'isgroup']), R.pick(['inf', 'fails', 'idinvR', 'idinv']));
    if (shape === 'isgroup' || shape === 'fails') {
      var E = modExample(R, L), isG = E.fail === 'none';
      var q = 'Is $' + setTex(E.S) + '$ a group under ' + E.opWord + '?';
      if (shape === 'isgroup') return { q: q, a: tf(isG), steps: modExampleSteps(E).concat([isG ? 'All four axioms hold: it is a group.' : 'So it is not a group.']), hint: 'Check closure first, then look for an identity, then an inverse for every element.' };
      return { q: 'Consider $' + setTex(E.S) + '$ under ' + E.opWord + '. Checking the axioms in the order closure, associativity, identity, inverses, which is the first to fail?', a: mcKeep([AX.closure, AX.associativity, AX.identity, AX.inverses, AX.none], ['closure', 'associativity', 'identity', 'inverses', 'none'].indexOf(E.fail)),
        steps: modExampleSteps(E).concat([E.fail === 'none' ? 'Nothing fails: it is a group.' : 'So the first axiom to fail is ' + { closure: 'closure', identity: 'the existence of an identity', inverses: 'the existence of inverses' }[E.fail] + '.']), hint: 'Make the ' + (E.add ? 'addition' : 'multiplication') + ' table in your head: does every entry stay in the set?' };
    }
    if (shape === 'inf') {
      var it = R.pick(INF);
      return { q: 'Is ' + it[0] + ' a group under ' + it[1] + '? Checking the axioms in the order closure, associativity, identity, inverses, pick the first one that fails.', a: mcKeep([AX.closure, AX.associativity, AX.identity, AX.inverses, AX.none], ['closure', 'associativity', 'identity', 'inverses', 'none'].indexOf(it[2])),
        steps: [it[3], it[2] === 'none' ? 'Every axiom holds, so it is a group.' : 'So the first axiom to fail is ' + (it[2] === 'inverses' ? 'the existence of inverses' : it[2] === 'identity' ? 'the existence of an identity' : it[2]) + '.'], hint: 'Try small examples for each axiom in turn; one failing example settles it.' };
    }
    // identity and inverse for a ∗ b = a + b + k on Z (or a + b + ab on R \ {-1})
    if (shape === 'idinv' || L < 3) {
      var k = R.nz(-6, 6), a = R.intNot(-9, 9, [0]), idn = -k, inv = -a - 2 * k, askInv = L > 1 || R.coin();
      return { q: '$\\mathbb{Z}$ is a group under $a \\ast b = a + b' + T.signed(k) + '$. ' + (askInv ? 'Find the inverse of $' + a + '$.' : 'Find the identity.'), a: num(askInv ? inv : idn),
        steps: ['The identity $u$ needs $a \\ast u = a + u ' + (k < 0 ? '- ' + (-k) : '+ ' + k) + ' = a$, so $u = ' + idn + '$.'].concat(askInv ? ['The inverse $y$ of $' + a + '$ needs $' + a + ' \\ast y = ' + idn + '$: $' + a + ' + y ' + (k < 0 ? '- ' + (-k) : '+ ' + k) + ' = ' + idn + '$, so $y = ' + inv + '$.', 'Check: $' + a + ' \\ast ' + T.p(inv) + ' = ' + a + ' + ' + T.p(inv) + (k < 0 ? ' - ' + (-k) : ' + ' + k) + ' = ' + idn + '$.'] : []),
        hint: askInv ? 'Find the identity first; the inverse must combine with $' + a + '$ to give the identity, not $0$.' : 'Solve $a \\ast u = a$ for $u$.' };
    }
    var a2 = R.pick([1, 2, 3, 4, 5, -2, -3, 1 / 2, -1 / 2].filter(function (x) { return x !== -1; })), qa = ML.Q.from(a2), invQ = qa.neg().div(qa.add(1));
    return { q: 'The set $\\mathbb{R} \\setminus \\{-1\\}$ is a group under $a \\ast b = a + b + ab$, with identity $0$. Find the inverse of $' + qa.toTex() + '$.', a: num(invQ.toPlain()),
      steps: ['Solve $' + qa.toTex() + ' \\ast y = 0$: $' + qa.toTex() + ' + y' + T.coef(qa, 'y', false) + ' = 0$.', 'So $' + T.mono(qa.add(1), 'y') + ' = ' + qa.neg().toTex() + '$ and $y = ' + invQ.toTex() + '$.', 'Check with the shortcut $1 + (a \\ast b) = (1 + a)(1 + b)$: $(1 + ' + T.p(qa.toTex()) + ')(1 + ' + T.p(invQ.toTex()) + ') = 1$.'],
      hint: 'Set $a \\ast y$ equal to the identity $0$ and solve for $y$.' };
  });

  G('aa.units-mod-n', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['list', 'inv', 'addinv', 'isunit']), R.pick(['inv', 'list', 'solve', 'order']), R.pick(['inv', 'solve', 'order', 'table']));
    if (shape === 'list') {
      var n = L === 1 ? R.pick([8, 9, 10, 12]) : R.pick([14, 15, 16, 18, 20, 21, 24]), Ul = units(n);
      return { q: 'List the elements of $' + Un(n) + '$.', a: setA(Ul), steps: ['$' + Un(n) + '$ holds the $k$ with $1 \\le k < ' + n + '$ and $\\gcd(k, ' + n + ') = 1$.', 'The prime factors of $' + n + '$ are $' + factorize(n).map(function (f) { return f[0]; }).join(', ') + '$; cross out every multiple of them.', '$' + Un(n) + ' = ' + setTex(Ul) + '$, with $\\varphi(' + n + ') = ' + Ul.length + '$ elements.'], hint: 'Keep the numbers below $' + n + '$ that share no factor with $' + n + '$.' };
    }
    if (shape === 'isunit') {
      var n2 = R.pick([12, 14, 15, 18, 20, 21, 22, 25, 26]), a = R.int(2, n2 - 1), g = gcd(a, n2);
      return { q: 'Is $' + a + '$ an element of $' + Un(n2) + '$?', a: tf(g === 1), steps: ['$' + a + '$ is in $' + Un(n2) + '$ exactly when $\\gcd(' + a + ', ' + n2 + ') = 1$.', '$\\gcd(' + a + ', ' + n2 + ') = ' + g + '$.', g === 1 ? 'So yes: $' + a + '$ has an inverse mod $' + n2 + '$ (it is $' + invMod(a, n2) + '$).' : 'So no: $' + a + '$ has no inverse mod $' + n2 + '$.'], hint: 'Compute $\\gcd(' + a + ', ' + n2 + ')$.' };
    }
    if (shape === 'addinv') {
      var n3 = R.pick([6, 8, 9, 10, 12, 15]), a3 = R.int(1, n3 - 1);
      return { q: 'In the group $' + Z(n3) + '$ (addition mod $' + n3 + '$), find the inverse of $' + a3 + '$.', a: num(mod(-a3, n3)), steps: ['The identity of $' + Z(n3) + '$ is $0$, so the inverse $y$ needs $' + a3 + ' + y \\equiv 0 \\pmod{' + n3 + '}$.', '$y = ' + n3 + ' - ' + a3 + ' = ' + mod(-a3, n3) + '$.'], hint: 'In $' + Z(n3) + '$ the operation is addition, so the inverse undoes adding $' + a3 + '$.' };
    }
    if (shape === 'inv') {
      var n4 = L === 1 ? R.pick([7, 8, 9, 10, 11, 12]) : R.pick([13, 15, 16, 17, 19, 20, 21, 24, 25, 26, 27, 28]), a4 = R.pick(units(n4).filter(function (x) { return x !== 1 && (L === 1 || x !== n4 - 1); })), y = invMod(a4, n4);
      return { q: 'Find the inverse of $' + a4 + '$ in $' + Un(n4) + '$.', a: num(y), steps: ['We need $y$ with $' + a4 + 'y \\equiv 1 \\pmod{' + n4 + '}$.', L === 1 ? 'Try the multiples of $' + a4 + '$: $' + range(1, y).map(function (k) { return a4 + ' \\cdot ' + k + ' \\equiv ' + (a4 * k % n4); }).join(',\\ ') + '$.' : 'Use the Euclidean algorithm (or try multiples): $' + a4 + ' \\cdot ' + y + ' = ' + (a4 * y) + ' = ' + n4 + ' \\cdot ' + M.floor(a4 * y / n4) + ' + 1$.', 'So $' + a4 + '^{-1} = ' + y + '$ in $' + Un(n4) + '$.'], hint: 'Look for a multiple of $' + a4 + '$ that is one more than a multiple of $' + n4 + '$.' };
    }
    if (shape === 'solve') {
      var n5 = R.pick([9, 10, 14, 15, 16, 18, 20, 21]), U5 = units(n5).filter(function (x) { return x > 1; }), a5 = R.pick(U5), x5 = R.pick(units(n5)), b5 = a5 * x5 % n5;
      return { q: 'Solve $' + a5 + 'x = ' + b5 + '$ in $' + Un(n5) + '$.', a: num(x5), steps: ['In a group, multiply both sides by the inverse: $x = ' + a5 + '^{-1} \\cdot ' + b5 + '$.', '$' + a5 + '^{-1} = ' + invMod(a5, n5) + '$ in $' + Un(n5) + '$, since $' + a5 + ' \\cdot ' + invMod(a5, n5) + ' = ' + (a5 * invMod(a5, n5)) + ' \\equiv 1$.', '$x = ' + invMod(a5, n5) + ' \\cdot ' + b5 + ' = ' + (invMod(a5, n5) * b5) + ' \\equiv ' + x5 + ' \\pmod{' + n5 + '}$.', 'Check: $' + a5 + ' \\cdot ' + x5 + ' = ' + (a5 * x5) + ' \\equiv ' + b5 + '$.'], hint: 'Find $' + a5 + '^{-1}$ first.' };
    }
    if (shape === 'order') {
      var n6 = R.pick([36, 40, 45, 48, 50, 60, 63, 72, 84, 90, 100, 105]), f6 = factorize(n6);
      return { q: 'How many elements does $' + Un(n6) + '$ have?', a: num(phi(n6)), steps: ['$|' + Un(n6) + '| = \\varphi(' + n6 + ')$.', '$' + n6 + ' = ' + f6.map(function (f) { return f[1] > 1 ? f[0] + '^{' + f[1] + '}' : f[0]; }).join(' \\cdot ') + '$, so $\\varphi(' + n6 + ') = ' + f6.map(function (f) { return (f[1] > 1 ? f[0] + '^{' + (f[1] - 1) + '}' : '') + (f[1] > 1 ? '(' + f[0] + ' - 1)' : '(' + f[0] + ' - 1)'); }).join(' \\cdot ').replace(/\^\{1\}/g, '') + ' = ' + phi(n6) + '$.'], hint: 'Use the prime factorization and $\\varphi(p^{k}) = p^{k-1}(p - 1)$.' };
    }
    // table: one missing entry of U(n)'s table
    var n7 = R.pick([8, 10, 12, 15]), U7 = units(n7), a7 = R.pick(U7.slice(1)), b7 = R.pick(U7.slice(1));
    return { q: 'In the Cayley table of $' + Un(n7) + '$, what is the entry in row $' + a7 + '$ and column $' + b7 + '$?', a: num(a7 * b7 % n7), steps: ['The operation of $' + Un(n7) + '$ is multiplication mod $' + n7 + '$.', '$' + a7 + ' \\cdot ' + b7 + ' = ' + (a7 * b7) + ' \\equiv ' + (a7 * b7 % n7) + ' \\pmod{' + n7 + '}$.'], hint: 'Multiply, then reduce mod $' + n7 + '$.' };
  });

  // --------------------------------------------------------------- aa.group-properties
  function m2(a, b, c, d) { return [[a, b], [c, d]]; }
  function mmul(A, B) { return [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]]; }
  function minv1(A) { return [[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]]; } // det 1
  function meq(A, B) { return A[0][0] === B[0][0] && A[0][1] === B[0][1] && A[1][0] === B[1][0] && A[1][1] === B[1][1]; }
  function mTex(A) { return T.mat(A, 'pmatrix'); }
  function randSL2(R) { // a product of two elementary matrices with small entries, determinant 1
    for (var t = 0; t < 50; t++) { var k = R.nz(-3, 3), j = R.nz(-2, 2), A = R.coin() ? mmul(m2(1, k, 0, 1), m2(1, 0, j, 1)) : mmul(m2(1, 0, j, 1), m2(1, k, 0, 1)); if (A.every(function (r) { return r.every(function (x) { return M.abs(x) <= 7; }); })) return A; }
    return m2(1, 1, 0, 1);
  }
  var NEXT = [
    ['Claim: a group has only one identity. Proof: Suppose $e$ and $e\'$ are both identities. Then $e = ee\'$, because $e\'$ is an identity.', 'And $ee\' = e\'$, because $e$ is an identity. So $e = e\'$.', ['And $ee\' = e\'e$, because the group is abelian.', 'So $e = e\'$, because both satisfy the identity axiom.', 'And $ee\' = e$, because $e\'$ is an identity.']],
    ['Claim: inverses are unique. Proof: Suppose $b$ and $c$ are both inverses of $a$. Then $b = be = b(ac)$.', 'By associativity, $b(ac) = (ba)c = ec = c$. So $b = c$.', ['Since $ac = ca$, we get $b(ac) = b(ca) = c$.', 'Cancel $a$ from $b(ac)$ to get $bc$, so $b = c$.', 'Since $b$ and $c$ are inverses, $b = a^{-1} = c$ by definition.']],
    ['Claim: if $ab = ac$, then $b = c$. Proof: Multiply both sides on the left by $a^{-1}$: $a^{-1}(ab) = a^{-1}(ac)$.', 'By associativity, $(a^{-1}a)b = (a^{-1}a)c$, so $eb = ec$ and $b = c$.', ['Multiply on the right by $a^{-1}$ as well: $a^{-1}aba^{-1} = a^{-1}aca^{-1}$.', 'Since $a^{-1}$ commutes with $b$ and $c$, $ba^{-1}a = ca^{-1}a$.', 'Divide both sides by $a$ to get $b = c$.']],
    ['Claim: $(ab)^{-1} = b^{-1}a^{-1}$. Proof: By uniqueness of inverses, it is enough to show that $(ab)(b^{-1}a^{-1}) = e$.', 'By associativity, $(ab)(b^{-1}a^{-1}) = a(bb^{-1})a^{-1} = aea^{-1} = aa^{-1} = e$.', ['$(ab)(b^{-1}a^{-1}) = (aa^{-1})(bb^{-1}) = e$, by rearranging the factors.', '$(ab)(b^{-1}a^{-1}) = (ab)(ab)^{-1} = e$, by the definition of inverse.', 'Since $ab = ba$, $(ab)(b^{-1}a^{-1}) = (ba)(b^{-1}a^{-1}) = e$.']],
    ['Claim: $(a^{-1})^{-1} = a$. Proof: We know $a^{-1}a = e$ and $aa^{-1} = e$.', 'So $a$ satisfies the definition of an inverse of $a^{-1}$, and since inverses are unique, $(a^{-1})^{-1} = a$.', ['So $(a^{-1})^{-1} = a^{1} = a$, by the rules of exponents.', 'So $a^{-1} = a$, and taking inverses gives the claim.', 'So $(a^{-1})^{-1} = e$, because inverses multiply to the identity.']],
    ['Claim: if $x^{2} = e$ for every $x$ in $G$, then $G$ is abelian. Proof: Let $a, b \\in G$. Each element is its own inverse, so $ab = (ab)^{-1}$.', 'And $(ab)^{-1} = b^{-1}a^{-1} = ba$. So $ab = ba$.', ['And $(ab)^{-1} = a^{-1}b^{-1} = ab$, which proves nothing new.', 'So $(ab)^{2} = a^{2}b^{2} = e$, and the group is abelian.', 'And $ab = ba$ because both equal $e$.']]];
  var FLAW = [
    ['Claim: $(ab)^{-1} = a^{-1}b^{-1}$ in every group. "Proof": $(ab)(a^{-1}b^{-1}) = aa^{-1}bb^{-1} = e$.', 'The middle step swaps $b$ and $a^{-1}$, which needs $ba^{-1} = a^{-1}b$; that holds only when $a$ and $b$ commute.', ['Nothing is wrong; the claim is true.', 'It should multiply on the other side, $(a^{-1}b^{-1})(ab)$.', 'It uses associativity, which only holds in abelian groups.'], 'In a nonabelian group the claim fails; the correct formula is $(ab)^{-1} = b^{-1}a^{-1}$.'],
    ['Claim: if $ab = ca$, then $b = c$. "Proof": Multiply both sides by $a^{-1}$ to get $b = c$.', 'Multiplying $ab$ on the left by $a^{-1}$ gives $b$, but $ca$ needs $a^{-1}$ on the right to give $c$; the two sides were not multiplied the same way.', ['Nothing is wrong; the claim is true.', 'It should multiply by $a$ instead of $a^{-1}$.', 'It forgot to check that $a^{-1}$ exists.'], 'In a nonabelian group the claim is false: $ab = ca$ only says $c = aba^{-1}$, a conjugate of $b$.'],
    ['Claim: if $x^{2} = e$, then $x = e$. "Proof": $x \\cdot x = e = e \\cdot e$, so cancelling gives $x = e$.', 'Cancellation removes the same element from the same side of both products; here the two sides have different factors ($x$ and $e$), so nothing can be cancelled.', ['Nothing is wrong; the claim is true.', 'It should have used $x^{-1}$ instead of $x$.', 'It needs the group to be finite.'], 'The claim is false: in $U(8)$, $3^{2} = 9 \\equiv 1$ but $3 \\ne 1$.'],
    ['Claim: if $ab = e$, then $ba = e$. "Proof": $ab = e$, and $e = ba$, so $ab = ba$.', 'It writes $e = ba$, which is the very thing to be proved.', ['Nothing is wrong; the proof is complete.', 'It should have assumed the group is abelian.', 'It should have used the identity $e = ab$ twice.'], 'The claim is true, but needs a real argument: from $ab = e$, multiply on the left by $a^{-1}$ to get $b = a^{-1}$, so $ba = a^{-1}a = e$.']];
  var ORDERS = [
    ['Put the steps of this proof that inverses are unique in order.', ['Suppose $b$ and $c$ are both inverses of $a$, so $ab = ba = e$ and $ac = ca = e$.', 'Then $b = be$, because $e$ is the identity.', 'Next $be = b(ac)$, because $ac = e$.', 'By associativity, $b(ac) = (ba)c$.', 'Finally $(ba)c = ec = c$, so $b = c$.']],
    ['Put the steps of this proof that $(ab)^{-1} = b^{-1}a^{-1}$ in order.', ['Let $a$ and $b$ be elements of a group $G$.', 'By associativity, $(ab)(b^{-1}a^{-1}) = a(bb^{-1})a^{-1}$.', 'This is $aea^{-1} = aa^{-1} = e$.', 'So $b^{-1}a^{-1}$ is an inverse of $ab$.', 'Since inverses are unique, $(ab)^{-1} = b^{-1}a^{-1}$.']],
    ['Put the steps of this proof of left cancellation in order.', ['Suppose $ab = ac$ in a group $G$.', 'Multiply both sides on the left by $a^{-1}$: $a^{-1}(ab) = a^{-1}(ac)$.', 'By associativity, $(a^{-1}a)b = (a^{-1}a)c$.', 'So $eb = ec$.', 'Hence $b = c$.']],
    ['Put the steps of this proof that a group with $x^{2} = e$ for all $x$ is abelian in order.', ['Let $a$ and $b$ be any two elements of $G$.', 'Since $x^{2} = e$ means $x^{-1} = x$, every element is its own inverse.', 'In particular $ab = (ab)^{-1}$.', 'And $(ab)^{-1} = b^{-1}a^{-1} = ba$.', 'So $ab = ba$, and $G$ is abelian.']]];

  G('aa.group-properties', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['solve', 'solve', 'next']), R.pick(['solveS3', 'next', 'flaw', 'mat']), R.pick(['order', 'flaw', 'mat', 'solve2']));
    if (shape === 'next') { var it = R.pick(NEXT); return { q: it[0] + '<br>Which line comes next?', a: mc(it[1], it[2]), steps: ['The next line must follow from the axioms (identity, inverses, associativity) and what is already written; it may not assume the group is abelian or assume the conclusion.', 'Correct next line: ' + it[1]], hint: 'Name the axiom each candidate line uses. Is it really available?' }; }
    if (shape === 'flaw') { var fl = R.pick(FLAW); return { q: 'What is wrong with this argument?<br>' + fl[0], a: mc(fl[1], fl[2]), steps: [fl[1], fl[3]], hint: 'Check each equals sign: which axiom justifies it?' }; }
    if (shape === 'order') { var od = R.pick(ORDERS); return orderProblem(R, od[0], od[1]); }
    if (shape === 'mat') {
      var A, B, tries = 0; do { A = randSL2(R); B = randSL2(R); tries++; } while (tries < 50 && meq(mmul(A, B), mmul(B, A)));
      var AB = mmul(A, B), ans = mmul(minv1(B), minv1(A));
      return { q: 'In the group of $2 \\times 2$ integer matrices with determinant $1$, let $A = ' + mTex(A) + '$ and $B = ' + mTex(B) + '$. Find $(AB)^{-1}$.', a: { t: 'matrix', v: ans.map(function (r) { return r.map(String); }) },
        steps: ['$(AB)^{-1} = B^{-1}A^{-1}$: undo the last thing done first.', 'For determinant $1$, $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$: $A^{-1} = ' + mTex(minv1(A)) + '$, $B^{-1} = ' + mTex(minv1(B)) + '$.', '$B^{-1}A^{-1} = ' + mTex(ans) + '$.', 'Check: $AB = ' + mTex(AB) + '$, and its inverse by the formula is $' + mTex(minv1(AB)) + '$. (The other order, $A^{-1}B^{-1} = ' + mTex(mmul(minv1(A), minv1(B))) + '$, is not it.)'],
        hint: 'Socks and shoes: the inverse of a product reverses the order.' };
    }
    var Lg = letterGroup(R, shape === 'solve' ? R.pick(['Z4', 'V', 'Z5', 'Z6']) : 'S3'), Gr = Lg.Gr, lab = Lg.lab;
    var a = R.pick(range(0, Gr.n - 1).filter(function (i) { return i !== Gr.e; })), b = R.intNot(0, Gr.n - 1, [a]);
    if (shape === 'solve2') {
      var c = R.intNot(0, Gr.n - 1, [Gr.e]), d = R.int(0, Gr.n - 1), x = Gr.mul(Gr.mul(Gr.inv(a), d), Gr.inv(c));
      return { q: 'Here is the Cayley table of a group.' + letterTableHtml(Lg) + 'Solve $' + lab[a] + 'x' + lab[c] + ' = ' + lab[d] + '$ for $x$.', a: txt([lab[x]]),
        steps: ['Multiply on the left by $' + lab[a] + '^{-1}$ and on the right by $' + lab[c] + '^{-1}$: $x = ' + lab[a] + '^{-1}\\,' + lab[d] + '\\,' + lab[c] + '^{-1}$.', 'From the table, $' + lab[a] + '^{-1} = ' + lab[Gr.inv(a)] + '$ and $' + lab[c] + '^{-1} = ' + lab[Gr.inv(c)] + '$ (find $e$ in their rows).', '$' + lab[Gr.inv(a)] + lab[d] + ' = ' + lab[Gr.mul(Gr.inv(a), d)] + '$, then $' + lab[Gr.mul(Gr.inv(a), d)] + lab[Gr.inv(c)] + ' = ' + lab[x] + '$.', 'Check: $' + lab[a] + lab[x] + lab[c] + ' = ' + lab[Gr.mul(Gr.mul(a, x), c)] + '$.'], hint: 'Undo $' + lab[a] + '$ on the left and $' + lab[c] + '$ on the right, keeping each on its own side.' };
    }
    var left = R.coin(), x2 = left ? Gr.mul(Gr.inv(a), b) : Gr.mul(b, Gr.inv(a));
    var eqTex = left ? lab[a] + ' \\ast x = ' + lab[b] : 'x \\ast ' + lab[a] + ' = ' + lab[b];
    return { q: 'Here is the Cayley table of a group.' + letterTableHtml(Lg) + 'Solve $' + eqTex + '$.', a: txt([lab[x2]]),
      steps: ['Multiply both sides on the ' + (left ? 'left' : 'right') + ' by $' + lab[a] + '^{-1}$: $x = ' + (left ? lab[a] + '^{-1} \\ast ' + lab[b] : lab[b] + ' \\ast ' + lab[a] + '^{-1}') + '$.', '$' + lab[a] + '^{-1} = ' + lab[Gr.inv(a)] + '$, since $' + lab[a] + ' \\ast ' + lab[Gr.inv(a)] + ' = e$ in the table.', '$x = ' + (left ? lab[Gr.inv(a)] + ' \\ast ' + lab[b] : lab[b] + ' \\ast ' + lab[Gr.inv(a)]) + ' = ' + lab[x2] + '$.', 'Check: $' + (left ? lab[a] + ' \\ast ' + lab[x2] : lab[x2] + ' \\ast ' + lab[a]) + ' = ' + lab[left ? Gr.mul(a, x2) : Gr.mul(x2, a)] + '$.' + (Lg.which === 'S3' && Gr.mul(Gr.inv(a), b) !== Gr.mul(b, Gr.inv(a)) ? ' (Multiplying on the other side would give $' + lab[left ? Gr.mul(b, Gr.inv(a)) : Gr.mul(Gr.inv(a), b)] + '$, which is wrong here: this group is not abelian.)' : '')],
      hint: 'Find $' + lab[a] + '^{-1}$ in the table, then multiply on the side where $' + lab[a] + '$ sits.' };
  });

  // --------------------------------------------------------------- aa.element-order
  var FMATS = [m2(0, -1, 1, 0), m2(0, -1, 1, -1), m2(0, 1, -1, -1), m2(1, -1, 1, 0), m2(0, 1, 1, 0), m2(-1, 0, 0, -1), m2(0, 1, -1, 1), m2(-1, 1, 0, 1), m2(1, 0, 1, -1), m2(-1, -1, 1, 0), m2(0, 1, -1, 0), m2(1, 1, -1, 0)];
  function matOrder(A, p) { var X = A, k = 1, I = m2(1, 0, 0, 1); function red(B) { return p ? B.map(function (r) { return r.map(function (x) { return mod(x, p); }); }) : B; } X = red(X); while (!meq(X, I)) { X = red(mmul(X, A)); k++; if (k > 60) return 0; } return k; }
  G('aa.element-order', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['zn', 'zn', 'un']), R.pick(['un', 'reduce', 'table', 'mat', 'zn']), R.pick(['mat', 'logic', 'un', 'matp', 'table']));
    if (shape === 'zn') {
      var n = L === 1 ? R.pick([6, 8, 9, 10, 12]) : R.pick([14, 15, 16, 18, 20, 24, 30]), k = R.pick(range(2, n - 1).filter(function (x) { return L > 1 || ordAdd(x, n) <= 6; })), o = ordAdd(k, n);
      return { q: 'Find the order of $' + k + '$ in $' + Z(n) + '$.', a: num(o), steps: ['In $' + Z(n) + '$ the operation is addition, so look for the least $m \\ge 1$ with $m \\cdot ' + k + ' \\equiv 0 \\pmod{' + n + '}$.', o <= 8 ? 'Multiples: $' + range(1, o).map(function (m) { return (m * k % n); }).join(', ') + '$.' : '$m \\cdot ' + k + '$ is a multiple of $' + n + '$ first when $m \\cdot ' + k + ' = \\operatorname{lcm}(' + k + ', ' + n + ') = ' + lcm(k, n) + '$, so $m = ' + o + '$.', 'The order of $' + k + '$ is $' + o + '$.'], hint: 'Add $' + k + '$ to itself until you reach a multiple of $' + n + '$.' };
    }
    if (shape === 'un') {
      var n2 = L === 1 ? R.pick([7, 9, 10, 11, 13]) : R.pick([15, 16, 17, 19, 20, 21, 24, 26, 28]), a = R.pick(units(n2).filter(function (x) { return x > 1; })), o2 = ordMul(a, n2), pw = [], x = 1;
      for (var i = 1; i <= o2; i++) { x = x * a % n2; pw.push(x); }
      return { q: 'Find the order of $' + a + '$ in $' + Un(n2) + '$.', a: num(o2), steps: ['The identity of $' + Un(n2) + '$ is $1$. List the powers of $' + a + '$ mod $' + n2 + '$ until you reach $1$.', pw.map(function (v, j) { return '$' + a + '^{' + (j + 1) + '} \\equiv ' + v + '$'; }).join(', ') + '.', 'The first power equal to $1$ is the ' + (o2) + (o2 === 1 ? 'st' : o2 === 2 ? 'nd' : o2 === 3 ? 'rd' : 'th') + ', so the order is $' + o2 + '$.'], hint: 'Multiply by $' + a + '$ each time and reduce mod $' + n2 + '$; stop at $1$.' };
    }
    if (shape === 'reduce') {
      var o3 = R.pick([5, 6, 7, 8, 9, 10, 12]), k3 = R.int(o3 + 3, 6 * o3 + 5), j3 = mod(k3, o3), neg = R.chance(0.3);
      if (neg) k3 = -k3, j3 = mod(k3, o3);
      if (!j3) { k3 += neg ? -1 : 1; j3 = mod(k3, o3); }
      return { q: 'In a group, $|a| = ' + o3 + '$. Write $a^{' + k3 + '}$ as $a^{j}$ with $0 \\le j < ' + o3 + '$. What is $j$?', a: num(j3), steps: ['Since $a^{' + o3 + '} = e$, exponents only matter mod $' + o3 + '$: $a^{k} = a^{j}$ when $k \\equiv j \\pmod{' + o3 + '}$.', '$' + k3 + ' = ' + o3 + ' \\cdot ' + T.p(M.floor(k3 / o3)) + ' + ' + j3 + '$.', 'So $a^{' + k3 + '} = (a^{' + o3 + '})^{' + M.floor(k3 / o3) + '} a^{' + j3 + '} = a^{' + j3 + '}$, and $j = ' + j3 + '$.'], hint: 'Divide the exponent by the order and keep the remainder (a nonnegative one).' };
    }
    if (shape === 'table') {
      var Lg = letterGroup(R, R.pick(['Z4', 'Z6', 'S3', 'Z5', 'V'])), Gr = Lg.Gr, a4 = R.pick(range(0, Gr.n - 1).filter(function (i) { return i !== Gr.e; })), o4 = gord(Gr, a4), seq = [], y = a4;
      for (var t = 1; t <= o4; t++) { seq.push('$' + Lg.lab[a4] + '^{' + t + '} = ' + Lg.lab[y] + '$'); y = Gr.mul(y, a4); }
      return { q: 'Here is the Cayley table of a group.' + letterTableHtml(Lg) + 'What is the order of $' + Lg.lab[a4] + '$?', a: num(o4), steps: ['Multiply $' + Lg.lab[a4] + '$ by itself, reading each product from the table, until you reach $e$.', seq.join(', ') + '.', 'The order is $' + o4 + '$.'], hint: 'Compute $' + Lg.lab[a4] + '^{2}$, $' + Lg.lab[a4] + '^{3}$, … from the table.' };
    }
    if (shape === 'mat' || shape === 'matp') {
      var A, p = null;
      if (shape === 'mat') A = R.pick(FMATS);
      else { p = R.pick([3, 5, 7]); var tries = 0; do { A = m2(R.int(0, p - 1), R.int(0, p - 1), R.int(0, p - 1), R.int(0, p - 1)); tries++; } while (tries < 200 && (mod(A[0][0] * A[1][1] - A[0][1] * A[1][0], p) === 0 || matOrder(A, p) < 2 || matOrder(A, p) > 6)); }
      var o5 = matOrder(A, p), pw5 = [], X = A;
      for (var s = 1; s <= o5; s++) { pw5.push('$' + (p ? 'A^{' + s + '} \\equiv ' : 'A^{' + s + '} = ') + mTex(X) + '$'); X = mmul(X, A); if (p) X = X.map(function (r) { return r.map(function (v) { return mod(v, p); }); }); }
      return { q: 'Find the order of $A = ' + mTex(A) + '$ ' + (p ? 'in the group of invertible $2 \\times 2$ matrices with entries in $' + Z(p) + '$ (arithmetic mod $' + p + '$).' : 'in the group of invertible $2 \\times 2$ real matrices.'), a: num(o5),
        steps: ['Multiply by $A$ again and again' + (p ? ', reducing mod $' + p + '$,' : '') + ' until you reach the identity matrix $I$.'].concat(pw5).concat(['The first power equal to $I$ is $A^{' + o5 + '}$, so $|A| = ' + o5 + '$.']), hint: 'Compute $A^{2}$, then $A^{3} = A^{2}A$, and so on.' };
    }
    // logic: a^m = e but a^(m/q) != e for the listed proper divisors
    var m6 = R.pick([12, 18, 20, 24, 28, 30, 36, 40, 45, 60]), ps = factorize(m6).map(function (f) { return f[0]; }), shown = ps.map(function (q) { return m6 / q; });
    var cand = divisors(m6).filter(function (d) { return shown.every(function (s) { return s % d !== 0; }); });
    return { q: 'An element $a$ satisfies $a^{' + m6 + '} = e$, but ' + shown.map(function (s) { return '$a^{' + s + '} \\ne e$'; }).join(' and ') + '. What is the order of $a$?', a: num(cand[0]),
      steps: ['$a^{' + m6 + '} = e$, so $|a|$ divides $' + m6 + '$.', 'If $|a|$ were a proper divisor of $' + m6 + '$, it would divide one of ' + shown.map(function (s) { return '$' + s + '$'; }).join(', ') + ' (each is $' + m6 + '$ divided by one of its primes ' + ps.map(function (q) { return '$' + q + '$'; }).join(', ') + '), and then that power of $a$ would be $e$.', 'None of them is $e$, so $|a| = ' + cand[0] + '$.'], hint: '$a^{k} = e$ exactly when $|a|$ divides $k$.' };
  });

  // --------------------------------------------------------------- aa.subgroups
  var SUBINF = [
    ['$3\\mathbb{Z} = \\{3k : k \\in \\mathbb{Z}\\}$', '$(\\mathbb{Z}, +)$', true, 'It contains $0$, and $3a - 3b = 3(a - b) \\in 3\\mathbb{Z}$.'],
    ['$\\mathbb{N} = \\{0, 1, 2, \\dots\\}$', '$(\\mathbb{Z}, +)$', false, 'It is closed under addition, but the inverse of $1$ is $-1 \\notin \\mathbb{N}$.'],
    ['the positive real numbers', '$(\\mathbb{R}, +)$', false, 'The identity of $(\\mathbb{R}, +)$ is $0$, which is not positive.'],
    ['the positive real numbers', '$(\\mathbb{R} \\setminus \\{0\\}, \\cdot)$', true, 'Products and reciprocals of positive numbers are positive, and $1 > 0$.'],
    ['$\\{2^{k} : k \\in \\mathbb{Z}\\}$', '$(\\mathbb{Q} \\setminus \\{0\\}, \\cdot)$', true, '$2^{j}(2^{k})^{-1} = 2^{j - k}$ is in the set.'],
    ['$\\{2^{k} : k \\ge 0\\}$', '$(\\mathbb{Q} \\setminus \\{0\\}, \\cdot)$', false, 'The inverse of $2$ is $\\frac{1}{2}$, which is not in the set.'],
    ['$\\{0, 1\\}$', '$(\\mathbb{Z}, +)$', false, '$1 + 1 = 2$ is not in the set.'],
    ['the $2 \\times 2$ real matrices with determinant $1$', 'the invertible $2 \\times 2$ real matrices under multiplication', true, '$\\det(AB^{-1}) = \\det A / \\det B = 1$, and $\\det I = 1$.'],
    ['the $2 \\times 2$ real matrices with determinant $-1$', 'the invertible $2 \\times 2$ real matrices under multiplication', false, 'The identity has determinant $1$, and a product of two of them has determinant $1$.'],
    ['the odd integers', '$(\\mathbb{Z}, +)$', false, '$0$ is not odd (and $1 + 1 = 2$ is not odd).'],
    ['$\\mathbb{Z} \\setminus \\{0\\}$', '$(\\mathbb{Q} \\setminus \\{0\\}, \\cdot)$', false, 'The inverse of $2$ is $\\frac{1}{2} \\notin \\mathbb{Z}$.'],
    ['$\\{a + b\\sqrt{2} : a, b \\in \\mathbb{Z}\\}$', '$(\\mathbb{R}, +)$', true, 'The difference of two such numbers is $(a - c) + (b - d)\\sqrt{2}$, again of that form.'],
    ['$\\{z \\in \\mathbb{C} : |z| = 1\\}$', '$(\\mathbb{C} \\setminus \\{0\\}, \\cdot)$', true, '$|zw^{-1}| = |z|/|w| = 1$.'],
    ['$\\{z \\in \\mathbb{C} : |z| = 2\\}$', '$(\\mathbb{C} \\setminus \\{0\\}, \\cdot)$', false, '$|2 \\cdot 2| = 4$, and the identity $1$ has $|1| = 1$.'],
    ['the multiples of $4$ together with the multiples of $6$', '$(\\mathbb{Z}, +)$', false, '$4 + 6 = 10$ is a multiple of neither.']];
  function candSubsetZn(R, n) {
    var ds = divisors(n).filter(function (d) { return d > 1 && d < n; }), d = R.pick(ds), H = range(0, n / d - 1).map(function (k) { return k * d; });
    var kind = R.int(0, 3);
    if (kind === 1) { var sh = R.int(1, d - 1); H = H.map(function (x) { return (x + sh) % n; }); }
    else if (kind === 2) { H = H.slice(); var extra = R.pick(range(1, n - 1).filter(function (x) { return H.indexOf(x) < 0; })); H.push(extra); }
    else if (kind === 3 && H.length > 2) { H = H.slice(0, H.length - 1); }
    return sortN(H);
  }
  function znSub(n, H) { return isSubgroup(gZ(n), H); }
  G('aa.subgroups', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['zn', 'zn', 'inf']), R.pick(['un', 'inf', 'pick', 'zn']), R.pick(['span', 'order', 'pick', 'inf', 'un']));
    if (shape === 'zn') {
      var n = R.pick(L === 1 ? [6, 8, 9, 10, 12] : [12, 15, 16, 18, 20]), H = candSubsetZn(R, n), Gr = gZ(n), ok = isSubgroup(Gr, H), wit = null, why;
      if (!ok) { if (H.indexOf(0) < 0) why = 'It does not contain the identity $0$.'; else { H.forEach(function (a) { H.forEach(function (b) { if (!wit && H.indexOf((a + b) % n) < 0) wit = [a, b]; }); }); why = 'It is not closed: $' + wit[0] + ' + ' + wit[1] + ' \\equiv ' + ((wit[0] + wit[1]) % n) + ' \\pmod{' + n + '}$ is missing.'; } }
      return { q: 'Is $H = ' + setTex(H) + '$ a subgroup of $' + Z(n) + '$?', a: tf(ok), steps: ['$H$ is finite, so it is a subgroup exactly when it is nonempty and closed under addition mod $' + n + '$ (inverses then come for free).', ok ? 'It contains $0$, and every sum of two elements of $H$ reduces to an element of $H$.' : why, ok ? 'So $H$ is a subgroup.' : 'So $H$ is not a subgroup.'], hint: 'Check for $0$, then add pairs of elements mod $' + n + '$.' };
    }
    if (shape === 'un') {
      var n2 = R.pick([9, 10, 13, 14, 15, 16, 20, 21]), Ul = units(n2), a = R.pick(Ul.slice(1)), pows = [], x = 1;
      do { x = x * a % n2; pows.push(x); } while (x !== 1);
      var H2 = R.coin() ? sortN(pows) : sortN(uniqN([1].concat(R.sample(Ul.slice(1), M.min(3, Ul.length - 1)))));
      var Gr2 = gU(n2), idx = H2.map(function (v) { return Gr2.idx(v); }), ok2 = isSubgroup(Gr2, idx), w2 = null;
      if (!ok2) H2.forEach(function (p) { H2.forEach(function (q) { if (!w2 && H2.indexOf(p * q % n2) < 0) w2 = [p, q]; }); });
      return { q: 'Is $H = ' + setTex(H2) + '$ a subgroup of $' + Un(n2) + '$?', a: tf(ok2), steps: ['$H$ is finite, so check that it is closed under multiplication mod $' + n2 + '$.', ok2 ? 'Every product of two elements of $H$ is again in $H$' + (sameSet(H2, pows) ? ' (it is the set of powers of $' + a + '$)' : '') + '.' : '$' + w2[0] + ' \\cdot ' + w2[1] + ' = ' + (w2[0] * w2[1]) + (w2[0] * w2[1] >= n2 ? ' \\equiv ' + (w2[0] * w2[1] % n2) + ' \\pmod{' + n2 + '}' : '') + '$ is not in $H$.', ok2 ? 'So $H$ is a subgroup.' : 'So $H$ is not closed and is not a subgroup.'], hint: 'Multiply pairs of elements of $H$ and reduce mod $' + n2 + '$.' };
    }
    if (shape === 'inf') {
      var it = R.pick(SUBINF);
      return { q: 'Is ' + it[0] + ' a subgroup of ' + it[1] + '?', a: tf(it[2]), steps: ['Use the subgroup test: nonempty (with the identity), closed under the operation, closed under inverses (or in one step: $ab^{-1}$ stays in the set).', it[3], it[2] ? 'So it is a subgroup.' : 'So it is not a subgroup.'], hint: 'Look for the identity first, then try an inverse and a product.' };
    }
    if (shape === 'pick') {
      var n3 = R.pick([12, 16, 18, 20, 24]), Gr3 = gZ(n3), good = null, bads = [], guard = 0;
      while ((good === null || bads.length < 3) && guard++ < 200) { var Hc = candSubsetZn(R, n3), key = Hc.join(','); if (isSubgroup(Gr3, Hc)) { if (good === null) good = Hc; } else if (bads.every(function (b) { return b.join(',') !== key; })) bads.push(Hc); }
      if (good === null) good = range(0, 1).map(function (k) { return k * n3 / 2; });
      return { q: 'Which of these subsets is a subgroup of $' + Z(n3) + '$?', a: mc('$' + setTex(good) + '$', bads.slice(0, 3).map(function (b) { return '$' + setTex(b) + '$'; })),
        steps: ['A finite subset is a subgroup when it contains $0$ and is closed under addition mod $' + n3 + '$.', bads.slice(0, 3).map(function (b) { if (b.indexOf(0) < 0) return '$' + setTex(b) + '$ misses $0$.'; var w = null; b.forEach(function (p) { b.forEach(function (q) { if (!w && b.indexOf((p + q) % n3) < 0) w = [p, q]; }); }); return '$' + setTex(b) + '$ is not closed: $' + w[0] + ' + ' + w[1] + ' \\equiv ' + ((w[0] + w[1]) % n3) + '$.'; }).join(' '), '$' + setTex(good) + '$ contains $0$ and is closed: it is the subgroup.'], hint: 'Rule out the sets without $0$ first.' };
    }
    if (shape === 'order') return orderProblem(R, 'Put the steps of this proof of the one-step subgroup test in order. (Assume $H \\subseteq G$ is nonempty and $ab^{-1} \\in H$ whenever $a, b \\in H$.)', ['Since $H$ is nonempty, pick some $h \\in H$.', 'Then $e = hh^{-1} \\in H$, so $H$ contains the identity.', 'For any $b \\in H$, $b^{-1} = eb^{-1} \\in H$, so $H$ is closed under inverses.', 'For any $a, b \\in H$, $b^{-1} \\in H$, so $ab = a(b^{-1})^{-1} \\in H$: $H$ is closed.', 'Associativity holds in $H$ because it holds in $G$, so $H$ is a subgroup.']);
    // span: smallest subgroup of Z_n containing two elements
    var n4 = R.pick([12, 18, 20, 24, 30, 36]), a4 = R.int(2, n4 - 1), b4 = R.intNot(2, n4 - 1, [a4]), g4 = gcd(gcd(a4, b4), n4), Hs = range(0, n4 / g4 - 1).map(function (k) { return k * g4; });
    return { q: 'Find the smallest subgroup of $' + Z(n4) + '$ that contains both $' + a4 + '$ and $' + b4 + '$. List its elements.', a: setA(Hs),
      steps: ['A subgroup containing $' + a4 + '$ and $' + b4 + '$ contains every combination $s \\cdot ' + a4 + ' + t \\cdot ' + b4 + '$ mod $' + n4 + '$.', 'Those combinations are exactly the multiples of $\\gcd(' + a4 + ', ' + b4 + ', ' + n4 + ') = ' + g4 + '$ (Bézout).', 'So the subgroup is $' + setTex(Hs) + '$.'], hint: 'Which multiples can you reach by adding and subtracting $' + a4 + '$, $' + b4 + '$ and $' + n4 + '$?' };
  });


  // ================================================================ unit 2: cyclic groups
  function isCyclicU(n) { var f = phi(n); return units(n).some(function (a) { return ordMul(a, n) === f; }); }
  function powersU(a, n) { var out = [], x = 1; do { x = x * a % n; out.push(x); } while (x !== 1); return sortN(out); }
  function multiplesZ(k, n) { var g = gcd(k, n); return range(0, n / g - 1).map(function (j) { return j * g; }); }
  function ordinal(k) { return k + (k % 100 >= 11 && k % 100 <= 13 ? 'th' : k % 10 === 1 ? 'st' : k % 10 === 2 ? 'nd' : k % 10 === 3 ? 'rd' : 'th'); }

  G('aa.cyclic-groups', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['gens', 'span', 'span']), R.pick(['count', 'isgen', 'spanU', 'gens']), R.pick(['iscyc', 'smallest', 'prim', 'isgen']));
    if (shape === 'gens') {
      var n = L === 1 ? R.pick([6, 8, 9, 10, 12]) : R.pick([14, 15, 16, 18, 20]), g = units(n);
      return { q: 'List all generators of $' + Z(n) + '$.', a: setA(g), steps: ['$k$ generates $' + Z(n) + '$ exactly when its order is $' + n + '$, that is, when $\\gcd(k, ' + n + ') = 1$.', 'The numbers from $1$ to $' + (n - 1) + '$ coprime to $' + n + '$: $' + g.join(', ') + '$.', 'There are $\\varphi(' + n + ') = ' + g.length + '$ generators.'], hint: 'Which $k$ share no factor with $' + n + '$?' };
    }
    if (shape === 'span') {
      var n2 = R.pick([8, 9, 10, 12, 15, 16, 18]), k = R.pick(range(2, n2 - 1).filter(function (x) { return gcd(x, n2) > 1; })), H = multiplesZ(k, n2);
      var seq = []; for (var j = 1; j <= ordAdd(k, n2); j++) seq.push(j * k % n2);
      return { q: 'List the elements of the cyclic subgroup $' + gen(k) + '$ of $' + Z(n2) + '$.', a: setA(H), steps: ['$' + gen(k) + '$ holds the multiples of $' + k + '$ mod $' + n2 + '$: $' + seq.join(', ') + '$, and then they repeat.', 'So $' + gen(k) + ' = ' + setTex(H) + '$, a subgroup of order $' + H.length + '$.'], hint: 'Keep adding $' + k + '$ (mod $' + n2 + '$) until you return to $0$.' };
    }
    if (shape === 'count') {
      var n3 = R.pick([24, 30, 36, 40, 42, 45, 48, 50, 60, 72, 100]);
      return { q: 'How many generators does the cyclic group $' + Z(n3) + '$ have?', a: num(phi(n3)), steps: ['The generators of $' + Z(n3) + '$ are the $k$ with $\\gcd(k, ' + n3 + ') = 1$.', 'There are $\\varphi(' + n3 + ') = ' + phi(n3) + '$ of them.'], hint: 'Count the numbers below $' + n3 + '$ that are coprime to it.' };
    }
    if (shape === 'isgen') {
      var n4 = R.pick([7, 9, 10, 11, 13, 14, 17, 18, 19]), a = R.pick(units(n4).filter(function (x) { return x > 1; })), o = ordMul(a, n4), f = phi(n4);
      return { q: '$' + Un(n4) + '$ has order $' + f + '$. Is $' + a + '$ a generator of $' + Un(n4) + '$?', a: tf(o === f), steps: ['$' + a + '$ generates exactly when its order is $|' + Un(n4) + '| = ' + f + '$.', 'Powers of $' + a + '$: $' + (function () { var x = 1, s = []; for (var i = 1; i <= o; i++) { x = x * a % n4; s.push(x); } return s.join(', '); })() + '$, so $|' + a + '| = ' + o + '$.', o === f ? 'So $' + a + '$ is a generator.' : 'So $' + a + '$ generates only a subgroup of order $' + o + '$.'], hint: 'Find the order of $' + a + '$.' };
    }
    if (shape === 'spanU') {
      var n5 = R.pick([9, 10, 13, 14, 15, 16, 20, 21]), a5 = R.pick(units(n5).filter(function (x) { return x > 1; })), H5 = powersU(a5, n5);
      return { q: 'List the elements of $' + gen(a5) + '$ in $' + Un(n5) + '$.', a: setA(H5), steps: ['Take powers of $' + a5 + '$ mod $' + n5 + '$ until you reach $1$: $' + (function () { var x = 1, s = []; do { x = x * a5 % n5; s.push(x); } while (x !== 1); return s.join(', '); })() + '$.', 'So $' + gen(a5) + ' = ' + setTex(H5) + '$.'], hint: 'Multiply by $' + a5 + '$ each time, reducing mod $' + n5 + '$.' };
    }
    if (shape === 'iscyc') {
      var n6 = R.pick([8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 25, 27]), cyc = isCyclicU(n6), f6 = phi(n6), gens6 = units(n6).filter(function (a) { return ordMul(a, n6) === f6; });
      var maxo = M.max.apply(null, units(n6).map(function (a) { return ordMul(a, n6); }));
      return { q: 'Is $' + Un(n6) + '$ cyclic?', a: tf(cyc), steps: ['$|' + Un(n6) + '| = \\varphi(' + n6 + ') = ' + f6 + '$, so $' + Un(n6) + '$ is cyclic exactly when some element has order $' + f6 + '$.', cyc ? '$' + gens6[0] + '$ has order $' + f6 + '$ (powers: $' + (function () { var x = 1, s = []; do { x = x * gens6[0] % n6; s.push(x); } while (x !== 1); return s.join(', '); })() + '$).' : 'Every element has order at most $' + maxo + '$ (for example ' + units(n6).slice(1, 4).map(function (a) { return '$|' + a + '| = ' + ordMul(a, n6) + '$'; }).join(', ') + ').', cyc ? 'So $' + Un(n6) + ' = ' + gen(gens6[0]) + '$ is cyclic.' : 'No element generates, so $' + Un(n6) + '$ is not cyclic.'], hint: 'Look for an element whose order equals $\\varphi(' + n6 + ')$.' };
    }
    if (shape === 'smallest') {
      var m = R.pick([2, 8, 10, 12, 15, 16, 20]), n7 = m + 1; while (isCyclicU(n7)) n7++;
      var skipped = range(m + 1, n7 - 1);
      return { q: 'Type the smallest $n > ' + m + '$ for which $' + Un('n') + '$ is <b>not</b> cyclic.', a: num(n7), steps: [skipped.length ? 'For $n = ' + skipped.join(', ') + '$ the group is cyclic: ' + skipped.slice(0, 4).map(function (k) { var g = units(k).filter(function (a) { return ordMul(a, k) === phi(k); })[0]; return '$' + Un(k) + ' = ' + gen(g) + '$'; }).join(', ') + (skipped.length > 4 ? ', …' : '') + '.' : 'Start testing at $n = ' + n7 + '$.', 'For $n = ' + n7 + '$: $|' + Un(n7) + '| = ' + phi(n7) + '$, but every element has order at most $' + M.max.apply(null, units(n7).map(function (a) { return ordMul(a, n7); })) + '$.', 'So the smallest such $n$ is $' + n7 + '$.'], hint: 'Test $n = ' + (m + 1) + ', ' + (m + 2) + ', \\dots$ in turn: is there an element of order $\\varphi(n)$?' };
    }
    // prim: the smallest generator of U(p)
    var p = R.pick([5, 7, 11, 13, 17, 19, 23]), gs = units(p).filter(function (a) { return ordMul(a, p) === p - 1; });
    return { q: 'Find the smallest generator of $' + Un(p) + '$ (a primitive root mod $' + p + '$).', a: num(gs[0]), steps: ['$|' + Un(p) + '| = ' + (p - 1) + '$, so we need an element of order $' + (p - 1) + '$.', range(2, gs[0]).map(function (a) { return '$|' + a + '| = ' + ordMul(a, p) + '$'; }).join(', ') + '.', 'The first with order $' + (p - 1) + '$ is $' + gs[0] + '$.'], hint: 'Test $2, 3, 4, \\dots$: find each order (it divides $' + (p - 1) + '$).' };
  });

  G('aa.order-of-powers', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['abs', 'zn', 'abs']), R.pick(['abs', 'count', 'same', 'zn']), R.pick(['list', 'flaw', 'count', 'same']));
    if (shape === 'abs' || shape === 'zn') {
      var n = L === 1 ? R.pick([12, 15, 18, 20, 24]) : R.pick([24, 30, 36, 40, 42, 48, 60]), k = R.pick(range(2, n - 1).filter(function (x) { return gcd(x, n) > 1 && gcd(x, n) < x; }).concat(range(2, n - 1).filter(function (x) { return gcd(x, n) > 1; }))), g = gcd(n, k);
      if (shape === 'zn') return { q: 'Find the order of $' + k + '$ in $' + Z(n) + '$.', a: num(n / g), steps: ['$' + k + ' = ' + k + ' \\cdot 1$, and $1$ generates $' + Z(n) + '$ with order $' + n + '$.', 'So $|' + k + '| = \\dfrac{' + n + '}{\\gcd(' + n + ', ' + k + ')} = \\dfrac{' + n + '}{' + g + '} = ' + (n / g) + '$.'], hint: 'Use $|k| = n / \\gcd(n, k)$.' };
      return { q: 'In a group, $|a| = ' + n + '$. Find the order of $a^{' + k + '}$.', a: num(n / g), steps: ['$|a^{k}| = \\dfrac{n}{\\gcd(n, k)}$.', '$\\gcd(' + n + ', ' + k + ') = ' + g + '$.', 'So $|a^{' + k + '}| = ' + n + '/' + g + ' = ' + (n / g) + '$.', 'Check: $(a^{' + k + '})^{' + (n / g) + '} = a^{' + (k * n / g) + '} = (a^{' + n + '})^{' + (k / g) + '} = e$.'], hint: 'Divide $' + n + '$ by $\\gcd(' + n + ', ' + k + ')$, not by $' + k + '$.' };
    }
    if (shape === 'count') {
      var n2 = R.pick([12, 18, 20, 24, 30, 36, 40, 60]), d = R.pick(divisors(n2).filter(function (x) { return x > 2; }));
      return { q: 'How many elements of order $' + d + '$ does the cyclic group $' + Z(n2) + '$ have?', a: num(phi(d)), steps: ['$|k| = ' + n2 + '/\\gcd(' + n2 + ', k) = ' + d + '$ means $\\gcd(' + n2 + ', k) = ' + (n2 / d) + '$.', 'Those $k$ are $' + T.mono(n2 / d, 'j') + '$ with $\\gcd(j, ' + d + ') = 1$ and $1 \\le j < ' + d + '$: the generators of the subgroup of order $' + d + '$.', 'There are $\\varphi(' + d + ') = ' + phi(d) + '$ of them: $' + range(1, n2 - 1).filter(function (x) { return ordAdd(x, n2) === d; }).join(', ') + '$.'], hint: 'Elements of order $' + d + '$ are the generators of the unique subgroup of order $' + d + '$.' };
    }
    if (shape === 'list') {
      var n3 = R.pick([12, 15, 16, 18, 20, 24]), d3 = R.pick(divisors(n3).filter(function (x) { return x > 2 && x < n3; })), ks = range(1, n3 - 1).filter(function (x) { return ordAdd(x, n3) === d3; });
      return { q: 'List the elements of order $' + d3 + '$ in $' + Z(n3) + '$.', a: setA(ks), steps: ['$|k| = ' + d3 + '$ exactly when $\\gcd(' + n3 + ', k) = ' + (n3 / d3) + '$.', 'Those are $' + (n3 / d3) + 'j$ with $\\gcd(j, ' + d3 + ') = 1$: $' + ks.join(', ') + '$.', 'There are $\\varphi(' + d3 + ') = ' + ks.length + '$ of them.'], hint: 'Which $k$ have $\\gcd(' + n3 + ', k) = ' + (n3 / d3) + '$?' };
    }
    if (shape === 'same') {
      var n4 = R.pick([12, 18, 20, 24, 30, 36]), i = R.int(2, n4 - 1), j = R.intNot(2, n4 - 1, [i]);
      if (R.coin()) { var gi = gcd(n4, i), cands = range(2, n4 - 1).filter(function (x) { return x !== i && gcd(n4, x) === gi; }); if (cands.length) j = R.pick(cands); }
      var same = gcd(n4, i) === gcd(n4, j);
      return { q: 'Let $G = ' + gen('a') + '$ be cyclic of order $' + n4 + '$. Is $' + gen('a^{' + i + '}') + ' = ' + gen('a^{' + j + '}') + '$?', a: tf(same), steps: ['In a cyclic group of order $n$, $' + gen('a^{k}') + ' = ' + gen('a^{\\gcd(n, k)}') + '$, so two powers generate the same subgroup exactly when the gcds match.', '$\\gcd(' + n4 + ', ' + i + ') = ' + gcd(n4, i) + '$ and $\\gcd(' + n4 + ', ' + j + ') = ' + gcd(n4, j) + '$.', same ? 'They match: the subgroups are equal.' : 'They differ: the subgroups have orders $' + ordAdd(i, n4) + '$ and $' + ordAdd(j, n4) + '$, so they are different.'], hint: 'Compare $\\gcd(' + n4 + ', ' + i + ')$ with $\\gcd(' + n4 + ', ' + j + ')$.' };
    }
    var n5 = R.pick([12, 18, 20, 24]), k5 = R.pick(range(2, n5 - 1).filter(function (x) { return gcd(x, n5) > 1 && gcd(x, n5) < x && n5 % x !== 0; }));
    return { q: 'A student says: "In $' + Z(n5) + '$, the element $' + k5 + '$ has order $' + n5 + '/' + k5 + '$." What is wrong?', a: mc('The order is $' + n5 + '/\\gcd(' + n5 + ', ' + k5 + ') = ' + (n5 / gcd(n5, k5)) + '$; dividing by $' + k5 + '$ itself only works when $' + k5 + '$ divides $' + n5 + '$.', ['Nothing is wrong.', 'The order is $' + k5 + '$, the element itself.', 'The order is $' + n5 + '$, since $' + Z(n5) + '$ is cyclic.']),
      steps: ['$' + n5 + '/' + k5 + '$ is not even a whole number here.', 'The least $m$ with $m \\cdot ' + k5 + ' \\equiv 0 \\pmod{' + n5 + '}$ is $' + n5 + '/\\gcd(' + n5 + ', ' + k5 + ') = ' + (n5 / gcd(n5, k5)) + '$.'], hint: 'Is $' + n5 + '/' + k5 + '$ an integer?' };
  });

  G('aa.subgroups-of-cyclic', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['bydiv', 'gcdgen', 'bydiv']), R.pick(['countsub', 'gcdgen', 'genset', 'bydiv']), R.pick(['genset', 'order', 'countsub', 'cnt2']));
    if (shape === 'bydiv') {
      var n = L === 1 ? R.pick([12, 15, 16, 18, 20]) : R.pick([24, 30, 36, 40]), d = R.pick(divisors(n).filter(function (x) { return x > 1 && x < n && x <= 8; })), H = range(0, d - 1).map(function (j) { return j * n / d; });
      return { q: 'List the elements of the subgroup of order $' + d + '$ in $' + Z(n) + '$.', a: setA(H), steps: ['$' + Z(n) + '$ has exactly one subgroup of each order $d$ dividing $' + n + '$: $' + gen(n + '/d') + '$.', 'For $d = ' + d + '$ it is $' + gen(n / d) + ' = ' + setTex(H) + '$.'], hint: 'It is generated by $' + n + '/' + d + '$.' };
    }
    if (shape === 'gcdgen') {
      var n2 = R.pick([12, 18, 20, 24, 30]), k = R.pick(range(2, n2 - 1).filter(function (x) { return gcd(x, n2) > 1 && gcd(x, n2) !== x; })), g = gcd(n2, k);
      return { q: 'In $' + Z(n2) + '$, the subgroup $' + gen(k) + '$ equals $' + gen('d') + '$ for exactly one divisor $d$ of $' + n2 + '$. Find $d$.', a: num(g), steps: ['$' + gen(k) + ' = ' + gen('\\gcd(' + n2 + ', ' + k + ')') + '$.', '$\\gcd(' + n2 + ', ' + k + ') = ' + g + '$, so $' + gen(k) + ' = ' + gen(g) + ' = ' + setTex(multiplesZ(k, n2)) + '$.'], hint: 'Compute $\\gcd(' + n2 + ', ' + k + ')$.' };
    }
    if (shape === 'countsub') {
      var n3 = R.pick([12, 18, 20, 24, 30, 36, 48, 60, 72, 100]), ds = divisors(n3);
      return { q: 'How many subgroups does $' + Z(n3) + '$ have (including $\\{0\\}$ and $' + Z(n3) + '$ itself)?', a: num(ds.length), steps: ['One subgroup for each positive divisor of $' + n3 + '$.', 'Divisors: $' + ds.join(', ') + '$.', 'So $' + ds.length + '$ subgroups.'], hint: 'Count the divisors of $' + n3 + '$.' };
    }
    if (shape === 'cnt2') {
      var n6 = R.pick([12, 18, 20, 24, 30, 36]), d6 = R.pick(divisors(n6).filter(function (x) { return x > 2; }));
      return { q: 'How many elements of $' + Z(n6) + '$ have order $' + d6 + '$?', a: num(phi(d6)), steps: ['They are the generators of the unique subgroup of order $' + d6 + '$, a cyclic group $\\cong ' + Z(d6) + '$.', 'A cyclic group of order $' + d6 + '$ has $\\varphi(' + d6 + ') = ' + phi(d6) + '$ generators.'], hint: 'How many generators does a cyclic group of order $' + d6 + '$ have?' };
    }
    if (shape === 'genset') {
      var n4 = R.pick([12, 16, 18, 20, 24, 30]), d4 = R.pick(divisors(n4).filter(function (x) { return x > 2 && x < n4; })), m = n4 / d4, gs = range(1, d4 - 1).filter(function (j) { return gcd(j, d4) === 1; }).map(function (j) { return j * m; });
      return { q: 'List every generator of the subgroup of order $' + d4 + '$ in $' + Z(n4) + '$.', a: setA(gs), steps: ['The subgroup is $' + gen(m) + ' = \\{0, ' + m + ', ' + (2 * m) + ', \\dots\\}$, cyclic of order $' + d4 + '$.', 'Its element $j \\cdot ' + m + '$ generates it exactly when $\\gcd(j, ' + d4 + ') = 1$.', 'So the generators are $' + gs.join(', ') + '$.'], hint: 'Generators of a subgroup of order $' + d4 + '$ are its elements of order $' + d4 + '$.' };
    }
    return orderProblem(R, 'Put the steps of this proof that every subgroup $H \\ne \\{e\\}$ of a cyclic group $G = ' + gen('a') + '$ is cyclic in order.', ['Every element of $H$ is a power of $a$; since $H \\ne \\{e\\}$ and $H$ has inverses, it contains some $a^{k}$ with $k > 0$.', 'Let $m$ be the smallest positive integer with $a^{m} \\in H$.', 'Take any $a^{k} \\in H$ and divide: $k = mq + r$ with $0 \\le r < m$.', 'Then $a^{r} = a^{k}(a^{m})^{-q} \\in H$, so by the choice of $m$, $r = 0$.', 'So every $a^{k}$ in $H$ is a power of $a^{m}$, and $H = ' + gen('a^{m}') + '$ is cyclic.']);
  });

  // lattice problems: Z_n by divisors, and named small groups by brute force
  var NAMED = [['\\mathbb{Z}_{2} \\times \\mathbb{Z}_{2}', function () { return gZxZ(2, 2); }, 'Z2xZ2'], ['S_{3}', function () { return gS(3); }, 'S3'], ['D_{4}', function () { return gD(4); }, 'D4'], ['Q_{8}', gQ8, 'Q8'], ['\\mathbb{Z}_{2} \\times \\mathbb{Z}_{4}', function () { return gZxZ(2, 4); }, 'Z2xZ4'], ['D_{5}', function () { return gD(5); }, 'D5'], ['A_{4}', function () { return gA(4); }, 'A4']];
  G('aa.subgroup-lattice', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['contain', 'below', 'meet']), R.pick(['meet', 'join', 'contain', 'cover']), R.pick(['named', 'named2', 'cover', 'join']));
    var n = R.pick(L === 1 ? [12, 18, 20] : [24, 30, 36, 40, 60]), ds = divisors(n).filter(function (d) { return d < n; });
    var viz = { name: 'aa-lattice', opts: { group: 'Z', n: n, quiet: true } };
    if (shape === 'contain') {
      var a = R.pick(ds.filter(function (d) { return d > 1; })), above = divisors(a);
      return { q: 'In the subgroup lattice of $' + Z(n) + '$, every subgroup is $' + gen('d') + '$ for a divisor $d$ of $' + n + '$. List all $d$ with $' + gen('d') + ' \\supseteq ' + gen(a) + '$.', a: setA(above),
        steps: ['$' + gen('d') + '$ contains $' + a + '$ exactly when $' + a + '$ is a multiple of $d$, that is, when $d$ divides $' + a + '$.', 'The divisors of $' + a + '$: $' + above.join(', ') + '$.', 'So the subgroups above $' + gen(a) + '$ are $' + above.map(function (d) { return gen(d); }).join(', ') + '$ (note $' + gen(1) + ' = ' + Z(n) + '$).'], hint: 'A smaller generator gives a bigger subgroup: $' + gen('d') + '$ is all multiples of $d$.' };
    }
    if (shape === 'below') {
      var a2 = R.pick(ds.filter(function (d) { return d > 1 && d < n / 2; })), below = divisors(n).filter(function (d) { return d % a2 === 0; });
      return { q: 'In $' + Z(n) + '$, list all divisors $d$ of $' + n + '$ with $' + gen('d') + ' \\subseteq ' + gen(a2) + '$ (use $d = ' + n + '$ for $\\{0\\}$).', a: setA(below),
        steps: ['$' + gen('d') + ' \\subseteq ' + gen(a2) + '$ exactly when $d$ is a multiple of $' + a2 + '$.', 'Multiples of $' + a2 + '$ that divide $' + n + '$: $' + below.join(', ') + '$.'], hint: 'Below $' + gen(a2) + '$ in the lattice are the subgroups generated by multiples of $' + a2 + '$.' };
    }
    var a3 = R.pick(ds.filter(function (d) { return d > 1; })), b3 = R.pick(ds.filter(function (d) { return d > 1 && d !== a3 && d % a3 !== 0 && a3 % d !== 0; }).concat([R.pick(ds.filter(function (d) { return d > 1 && d !== a3; }))]));
    if (shape === 'meet') {
      var m = lcm(a3, b3) % n === 0 ? n : lcm(a3, b3);
      return { q: 'In $' + Z(n) + '$, $' + gen(a3) + ' \\cap ' + gen(b3) + ' = ' + gen('d') + '$ for which divisor $d$ of $' + n + '$? (Use $d = ' + n + '$ if the intersection is $\\{0\\}$.)', a: num(m),
        steps: ['An element lies in both when it is a multiple of $' + a3 + '$ and of $' + b3 + '$, that is, a multiple of $\\operatorname{lcm}(' + a3 + ', ' + b3 + ') = ' + lcm(a3, b3) + '$.', m === n ? 'The only such element of $' + Z(n) + '$ is $0$, so $d = ' + n + '$.' : 'So the intersection is $' + gen(m) + '$, of order $' + (n / m) + '$.'], hint: 'The meet in the lattice is the intersection: common multiples.' };
    }
    if (shape === 'join') {
      var j = gcd(a3, b3);
      return { q: 'In $' + Z(n) + '$, the smallest subgroup containing both $' + gen(a3) + '$ and $' + gen(b3) + '$ is $' + gen('d') + '$ for which divisor $d$ of $' + n + '$?', a: num(j),
        steps: ['It holds all sums $s \\cdot ' + a3 + ' + t \\cdot ' + b3 + '$, which are the multiples of $\\gcd(' + a3 + ', ' + b3 + ') = ' + j + '$.', 'So the join is $' + gen(j) + '$, of order $' + (n / j) + '$.'], hint: 'The join in the lattice is generated by the gcd.' };
    }
    if (shape === 'cover') {
      var d5 = R.pick(ds.filter(function (d) { return d > 1 && factorize(d).length >= 1; })), ps = factorize(d5).map(function (f) { return f[0]; }), ups = ps.map(function (p) { return d5 / p; });
      return { q: 'In the subgroup lattice of $' + Z(n) + '$, which subgroups sit directly above $' + gen(d5) + '$ (contain it, with nothing in between)? Give their generators $d$ (divisors of $' + n + '$).', a: setA(ups),
        steps: ['$' + gen('d') + ' \\supsetneq ' + gen(d5) + '$ means $d$ is a proper divisor of $' + d5 + '$.', 'Nothing lies in between exactly when $' + d5 + '/d$ is prime.', (ps.length === 1 ? 'The only prime dividing $' + d5 + '$ is $' + ps[0] + '$, so $d = ' + ups[0] + '$.' : 'The primes dividing $' + d5 + '$ are $' + ps.join(', ') + '$, so $d = ' + ups.join(', ') + '$.')], hint: 'Divide $' + d5 + '$ by one prime at a time.' };
    }
    var it = R.pick(shape === 'named2' ? NAMED.slice(1) : NAMED), Gr = it[1](), subs = allSubgroups(Gr);
    if (shape === 'named') {
      var byOrd = {}; subs.forEach(function (H) { byOrd[H.length] = (byOrd[H.length] || 0) + 1; });
      return { q: 'How many subgroups does $' + it[0] + '$ have, counting $\\{e\\}$ and the whole group?', a: num(subs.length),
        steps: ['By Lagrange\'s theorem a subgroup\'s order divides $' + Gr.n + '$; go through the possible orders.', Object.keys(byOrd).map(function (k) { return 'order $' + k + '$: ' + byOrd[k]; }).join('; ') + '.', 'Total: $' + subs.length + '$ subgroups.'], hint: 'Start with the cyclic subgroups $' + gen('g') + '$, then look for ones needing two generators.' };
    }
    var k2 = R.pick(Object.keys(orderCounts(Gr)).map(Number).filter(function (o) { return o > 1 && o < Gr.n; })), cnt = subs.filter(function (H) { return H.length === k2; }).length;
    return { q: 'How many subgroups of order $' + k2 + '$ does $' + it[0] + '$ have?', a: num(cnt),
      steps: ['List the subgroups of order $' + k2 + '$: ' + subs.filter(function (H) { return H.length === k2; }).map(function (H) { return '$' + setTex(texList(Gr, H)) + '$'; }).join(', ') + '.', 'There are $' + cnt + '$.'], hint: isPrime(k2) ? 'A subgroup of prime order $' + k2 + '$ is cyclic, generated by any of its $' + (k2 - 1) + '$ elements of order $' + k2 + '$.' : 'Consider cyclic subgroups first, then subgroups that are not cyclic.' };
  });


  // ================================================================ unit 3: permutation groups
  function randDerangedish(R, n, minMoved) { for (var t = 0; t < 100; t++) { var s = randPerm(R, n), mv = s.filter(function (x, i) { return x !== i; }).length; if (mv >= (minMoved || 2)) return s; } return pfrom([[1, 2]], n); }
  function randCycles(R, n, lens) { // disjoint cycles with the given lengths, on a random subset of 1..n
    var pts = R.shuffle(range(1, n)), out = [], k = 0;
    lens.forEach(function (l) { out.push(pts.slice(k, k + l)); k += l; });
    return out;
  }
  function randOverlap(R, n, count, maxLen) { // cycles that may share points (count of them)
    var out = []; for (var i = 0; i < count; i++) { var l = R.int(2, maxLen || 3); out.push(R.sample(range(1, n), l)); }
    return out;
  }
  function cycSeqTex(cyc) { return cyc.map(function (c) { return '(' + c.join('\\;') + ')'; }).join(''); }
  function traceSteps(cycles, n) { // how each point moves through a product of cycles (right to left)
    var lines = [];
    for (var i = 1; i <= n; i++) {
      var x = i, path = [i];
      for (var k = cycles.length - 1; k >= 0; k--) { var c = cycles[k], j = c.indexOf(x); if (j >= 0) x = c[(j + 1) % c.length]; path.push(x); }
      lines.push(i + ' \\mapsto ' + x);
    }
    return lines;
  }
  function typeCount(n, type) { // number of permutations of {1..n} with the given cycle lengths (>= 2)
    var m = {}, fixed = n - sum(type); type.forEach(function (l) { m[l] = (m[l] || 0) + 1; }); m[1] = fixed;
    var den = 1; Object.keys(m).forEach(function (l) { den *= M.pow(+l, m[l]) * fact(m[l]); });
    return fact(n) / den;
  }
  function typesOf(n) { return partitions(n).map(function (p) { return p.filter(function (x) { return x > 1; }); }); }
  function typeTex(t) { return t.length ? t.join(', ') : '\\text{identity}'; }
  function typeShape(t) { return t.length ? t.map(function (l, i) { return '(' + range(1, l).map(function (j) { return '\\ast'; }).join('\\,') + ')'; }).join('') : 'e'; }

  G('aa.permutations', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['eval', 'eval', 'product']), R.pick(['product', 'inverse', 'commute', 'eval']), R.pick(['solve', 'count', 'product', 'inverse']));
    var n = L === 1 ? 4 : R.pick([4, 5, 5]), s = randDerangedish(R, n, 3), t = randDerangedish(R, n, 3);
    if (shape === 'eval') {
      var i = R.int(1, n), ti = t[i - 1] + 1, sti = s[ti - 1] + 1, other = t[s[i - 1]] + 1;
      return { q: 'Let $\\sigma = ' + twoRow(s) + '$ and $\\tau = ' + twoRow(t) + '$. Find $(\\sigma\\tau)(' + i + ')$.', a: num(sti),
        steps: ['$\\sigma\\tau$ means: apply $\\tau$ first, then $\\sigma$.', '$\\tau(' + i + ') = ' + ti + '$.', '$\\sigma(' + ti + ') = ' + sti + '$.', 'So $(\\sigma\\tau)(' + i + ') = ' + sti + '$.' + (other !== sti ? ' (Doing $\\sigma$ first would give $' + other + '$, which is $(\\tau\\sigma)(' + i + ')$.)' : '')], hint: 'Read $\\tau$ first: where does $\\tau$ send $' + i + '$?' };
    }
    if (shape === 'product') {
      var st = pcomp(s, t);
      return { q: 'Let $\\sigma = ' + twoRow(s) + '$ and $\\tau = ' + twoRow(t) + '$. Write $\\sigma\\tau$ in one-line notation: $(\\sigma\\tau(1), \\dots, \\sigma\\tau(' + n + '))$.', a: tup(st.map(function (x) { return x + 1; })),
        steps: ['Apply $\\tau$ first, then $\\sigma$, to each of $1, \\dots, ' + n + '$.'].concat(range(0, n - 1).map(function (i) { return '$' + (i + 1) + ' \\xrightarrow{\\tau} ' + (t[i] + 1) + ' \\xrightarrow{\\sigma} ' + (st[i] + 1) + '$'; })).concat(['So $\\sigma\\tau = ' + twoRow(st) + '$, or $' + oneLine(st) + '$ in one line.']), hint: 'For each input, look it up in $\\tau$ (the right factor) first.' };
    }
    if (shape === 'inverse') {
      var si = pinv(s);
      return { q: 'Let $\\sigma = ' + twoRow(s) + '$. Write $\\sigma^{-1}$ in one-line notation: $(\\sigma^{-1}(1), \\dots, \\sigma^{-1}(' + n + '))$.', a: tup(si.map(function (x) { return x + 1; })),
        steps: ['$\\sigma^{-1}$ undoes $\\sigma$: if $\\sigma(a) = b$, then $\\sigma^{-1}(b) = a$.', 'Swap the two rows of $\\sigma$ and sort by the top row: $\\sigma^{-1} = ' + twoRow(si) + '$.', 'In one line: $' + oneLine(si) + '$.', 'Check: $\\sigma\\sigma^{-1}$ sends every number to itself.'], hint: 'Where does $\\sigma$ send each number? Reverse each arrow.' };
    }
    if (shape === 'commute') {
      var a1 = pcomp(s, t), a2 = pcomp(t, s), eq = peq(a1, a2);
      if (R.chance(0.3) && !eq) { t = pcomp(s, s); a1 = pcomp(s, t); a2 = pcomp(t, s); eq = true; }
      return { q: 'Let $\\sigma = ' + twoRow(s) + '$ and $\\tau = ' + twoRow(t) + '$. Is $\\sigma\\tau = \\tau\\sigma$?', a: tf(eq),
        steps: ['$\\sigma\\tau = ' + twoRow(a1) + '$ (apply $\\tau$, then $\\sigma$).', '$\\tau\\sigma = ' + twoRow(a2) + '$ (apply $\\sigma$, then $\\tau$).', eq ? 'They are equal: these two commute.' : 'They differ (for example at $' + (a1.findIndex(function (x, i) { return x !== a2[i]; }) + 1) + '$), so $S_{' + n + '}$ is not abelian.'], hint: 'Compute both products, one input at a time.' };
    }
    if (shape === 'solve') {
      var x = pcomp(pinv(s), t);
      return { q: 'Let $\\sigma = ' + twoRow(s) + '$ and $\\tau = ' + twoRow(t) + '$. Find the permutation $\\rho$ with $\\sigma\\rho = \\tau$, in one-line notation.', a: tup(x.map(function (v) { return v + 1; })),
        steps: ['Multiply on the left by $\\sigma^{-1}$: $\\rho = \\sigma^{-1}\\tau$ (apply $\\tau$, then $\\sigma^{-1}$).', '$\\sigma^{-1} = ' + twoRow(pinv(s)) + '$.', '$\\rho = ' + twoRow(x) + '$, that is, $' + oneLine(x) + '$.', 'Check: $\\sigma\\rho$ sends each $i$ to $\\tau(i)$.'], hint: 'Undo $\\sigma$ on the left: $\\rho = \\sigma^{-1}\\tau$, not $\\tau\\sigma^{-1}$.' };
    }
    var n2 = R.int(5, 8), k = R.int(2, n2 - 2), cnt = fact(k) * fact(n2 - k);
    return { q: 'How many permutations in $S_{' + n2 + '}$ send the set $\\{1, \\dots, ' + k + '\\}$ onto itself?', a: num(cnt),
      steps: ['Such a permutation rearranges $1, \\dots, ' + k + '$ among themselves: $' + k + '! = ' + fact(k) + '$ ways.', 'Then it must also rearrange $' + (k + 1) + ', \\dots, ' + n2 + '$ among themselves: $' + (n2 - k) + '! = ' + fact(n2 - k) + '$ ways.', 'Total: $' + fact(k) + ' \\cdot ' + fact(n2 - k) + ' = ' + cnt + '$.'], hint: 'The two blocks are rearranged independently.' };
  });

  G('aa.cycle-notation', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['tocyc', 'fromcyc', 'tocyc']), R.pick(['prod', 'inv', 'image', 'tocyc']), R.pick(['prod3', 'prod', 'image', 'inv']));
    if (shape === 'tocyc') {
      var n = L === 1 ? R.pick([5, 6]) : R.pick([6, 7, 8]), s = randDerangedish(R, n, 4), cyc = pcycles(s);
      return { q: 'Write $\\sigma = ' + twoRow(s) + '$ in cycle notation (leave out fixed points).', a: permText(s),
        steps: ['Start at $1$ and follow the arrows until you return; then start again at the smallest number not used yet.'].concat(cyc.map(function (c) { return 'Cycle: ' + c.map(function (x) { return '$' + x + '$'; }).join(' → ') + ' → $' + c[0] + '$, giving $(' + c.join('\\;') + ')$.'; })).concat(['So $\\sigma = ' + cycTex(cyc) + '$.']), hint: 'Follow $1 \\to \\sigma(1) \\to \\sigma(\\sigma(1)) \\to \\cdots$ until you get back to $1$.' };
    }
    if (shape === 'fromcyc') {
      var n2 = R.pick([5, 6, 7]), lens = R.pick(n2 >= 6 ? [[3, 2], [2, 2], [4, 2], [3, 3], [5]] : [[3, 2], [2, 2], [4], [3]]), cyc2 = randCycles(R, n2, lens), s2 = pfrom(cyc2, n2);
      return { q: 'Let $\\sigma = ' + cycSeqTex(cyc2) + '$ in $S_{' + n2 + '}$. Write $\\sigma$ in one-line notation $(\\sigma(1), \\dots, \\sigma(' + n2 + '))$.', a: tup(s2.map(function (x) { return x + 1; })),
        steps: ['In a cycle $(a\\;b\\;c)$, each entry goes to the next one and the last goes back to the first; numbers not shown are fixed.'].concat(range(0, n2 - 1).map(function (i) { return '$\\sigma(' + (i + 1) + ') = ' + (s2[i] + 1) + '$'; }).join(', ')).concat(['So $\\sigma = ' + oneLine(s2) + '$.']), hint: 'Find each number in the cycles and read the next entry (wrapping around).' };
    }
    if (shape === 'prod' || shape === 'prod3') {
      var n3 = R.pick([4, 5, 6]), cs = randOverlap(R, n3, shape === 'prod3' ? 3 : 2, L === 3 ? 4 : 3), s3 = pfrom(cs, n3), tries = 0;
      while ((pcycles(s3).length === 0 || cs.every(function (c, i) { return cs.every(function (d, j) { return i === j || !c.some(function (x) { return d.indexOf(x) >= 0; }); }); })) && tries++ < 30) { cs = randOverlap(R, n3, shape === 'prod3' ? 3 : 2, L === 3 ? 4 : 3); s3 = pfrom(cs, n3); }
      return { q: 'Write $' + cycSeqTex(cs) + '$ in $S_{' + n3 + '}$ as a product of disjoint cycles. (Multiply right to left.)', a: permText(s3),
        steps: ['Follow each number through the cycles from right to left.'].concat(['$' + traceSteps(cs, n3).join(',\\ ') + '$']).concat(['Collect the cycles: $' + pTex(s3) + '$.']), hint: 'Start with $1$: where does the rightmost cycle send it, then the next cycle to the left, …?' };
    }
    if (shape === 'inv') {
      var n4 = R.pick([5, 6, 7]), cyc4 = randCycles(R, n4, R.pick([[3, 2], [4], [5], [3, 3], [4, 2]].filter(function (l) { return sum(l) <= n4; }))), s4 = pfrom(cyc4, n4), si = pinv(s4);
      return { q: 'Let $\\sigma = ' + cycSeqTex(cyc4) + '$. Write $\\sigma^{-1}$ in cycle notation.', a: permText(si),
        steps: ['To undo a cycle, run it backward: $(a\\;b\\;c)^{-1} = (c\\;b\\;a)$. Disjoint cycles can be inverted one at a time.', 'So $\\sigma^{-1} = ' + cyc4.map(function (c) { return '(' + c.slice().reverse().join('\\;') + ')'; }).join('') + ' = ' + pTex(si) + '$.'], hint: 'Reverse each cycle.' };
    }
    var n5 = R.pick([5, 6]), cs5 = randOverlap(R, n5, L === 3 ? 3 : 2, 3), s5 = pfrom(cs5, n5), i5 = R.pick(range(1, n5).filter(function (i) { return cs5.some(function (c) { return c.indexOf(i) >= 0; }); })), x = i5, path = [];
    for (var k = cs5.length - 1; k >= 0; k--) { var c = cs5[k], j = c.indexOf(x), y = j >= 0 ? c[(j + 1) % c.length] : x; path.push('$' + cycSeqTex([c]) + '$ sends $' + x + '$ to $' + y + '$'); x = y; }
    return { q: 'Let $\\sigma = ' + cycSeqTex(cs5) + '$ (multiply right to left). Find $\\sigma(' + i5 + ')$.', a: num(s5[i5 - 1] + 1),
      steps: ['Start with the rightmost cycle and move left.'].concat(path).concat(['So $\\sigma(' + i5 + ') = ' + (s5[i5 - 1] + 1) + '$.']), hint: 'Apply the rightmost cycle first.' };
  });

  G('aa.permutation-order', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['disj', 'disj', 'tworow']), R.pick(['nondisj', 'tworow', 'disj', 'type']), R.pick(['max', 'type', 'countord', 'nondisj']));
    if (shape === 'disj') {
      var n = L === 1 ? R.pick([6, 7]) : R.pick([8, 9, 10]), lens = R.pick(n >= 8 ? [[4, 3], [3, 2, 2], [5, 3], [4, 4], [3, 3, 2], [6, 2], [5, 4], [4, 2, 2]] : [[3, 2], [4, 2], [2, 2], [3, 3], [5], [4, 3], [5, 2]]).filter(function (l) { return l <= n; });
      if (sum(lens) > n) lens = [3, 2];
      var cyc = randCycles(R, n, lens), o = lcmA(lens);
      return { q: 'Find the order of $' + cycSeqTex(cyc) + '$ in $S_{' + n + '}$.', a: num(o), steps: ['The cycles are disjoint, so they commute and each returns to the start on its own schedule.', 'Cycle lengths: $' + lens.join(', ') + '$.', 'All of them are back at the start first after $\\operatorname{lcm}(' + lens.join(', ') + ') = ' + o + '$ steps.'], hint: 'Take the lcm of the cycle lengths, not the sum or product.' };
    }
    if (shape === 'tworow') {
      var n2 = R.pick([6, 7, 8]), s = randDerangedish(R, n2, 5), cyc2 = pcycles(s), o2 = pord(s);
      return { q: 'Find the order of $\\sigma = ' + twoRow(s) + '$.', a: num(o2), steps: ['Write $\\sigma$ as disjoint cycles: $' + cycTex(cyc2) + '$.', 'Lengths: $' + cyc2.map(function (c) { return c.length; }).join(', ') + '$.', 'Order: $\\operatorname{lcm} = ' + o2 + '$.'], hint: 'Find the cycles first.' };
    }
    if (shape === 'nondisj') {
      var n3 = R.pick([5, 6]), cs, s3, tries = 0; do { cs = randOverlap(R, n3, 2, 4); s3 = pfrom(cs, n3); tries++; } while (tries < 50 && (pord(s3) === lcmA(cs.map(function (c) { return c.length; })) || pord(s3) === 1));
      return { q: 'Find the order of $' + cycSeqTex(cs) + '$ in $S_{' + n3 + '}$. (The cycles overlap; multiply right to left.)', a: num(pord(s3)), steps: ['The cycles are not disjoint, so first multiply them out: $' + cycSeqTex(cs) + ' = ' + pTex(s3) + '$.', 'Now the cycles are disjoint, with lengths $' + ptype(s3).join(', ') + '$.', 'The order is their lcm: $' + pord(s3) + '$.' + (lcmA(cs.map(function (c) { return c.length; })) !== pord(s3) ? ' (The lcm of the original lengths, $' + lcmA(cs.map(function (c) { return c.length; })) + '$, would be wrong.)' : '')], hint: 'Rewrite as disjoint cycles before taking any lcm.' };
    }
    if (shape === 'type') {
      var n4 = R.pick([5, 6, 7]), types = typesOf(n4).filter(function (t) { return t.length; }), tp = R.pick(types), cnt = typeCount(n4, tp);
      return { q: 'How many permutations in $S_{' + n4 + '}$ have cycle type ' + tp.join(', ') + ' (that is, look like $' + typeShape(tp) + '$)?', a: num(cnt),
        steps: ['Fill the pattern $' + typeShape(tp) + '$ with distinct numbers from $1$ to $' + n4 + '$: $' + n4 + ' \\cdot ' + (n4 - 1) + ' \\cdots ' + (n4 - sum(tp) + 1) + ' = ' + (fact(n4) / fact(n4 - sum(tp))) + '$ ways.', 'Each cycle of length $k$ can start at any of its $k$ entries, and cycles of the same length can be listed in any order; divide by ' + (function () { var m = {}; tp.forEach(function (l) { m[l] = (m[l] || 0) + 1; }); return Object.keys(m).map(function (l) { return '$' + l + '^{' + m[l] + '} \\cdot ' + m[l] + '!$'; }).join(' and '); })() + '.', 'Count: $' + cnt + '$.'], hint: 'Count the fillings of the pattern, then divide out the different ways to write the same permutation.' };
    }
    if (shape === 'max') {
      var n5 = R.pick([5, 6, 7, 8, 9, 10]), best = 0, bt = null; partitions(n5).forEach(function (p) { var o = lcmA(p); if (o > best) { best = o; bt = p; } });
      var bt2 = bt.filter(function (x) { return x > 1; });
      return { q: 'What is the largest order of an element of $S_{' + n5 + '}$?', a: num(best), steps: ['An element\'s order is the lcm of its cycle lengths, and the lengths add up to at most $' + n5 + '$.', 'Try the ways to split $' + n5 + '$: the best is $' + bt2.join(' + ') + (sum(bt2) < n5 ? ' (+ fixed points)' : '') + '$, with lcm $' + best + '$.', 'So the largest order is $' + best + '$, for example $' + pTex(pfrom(randCycles(R, n5, bt2), n5)) + '$.'], hint: 'Choose cycle lengths with sum at most $' + n5 + '$ and the biggest lcm; coprime lengths help.' };
    }
    var n6 = R.pick([4, 5, 6]), ords = {}; typesOf(n6).forEach(function (t) { var o = lcmA(t); ords[o] = (ords[o] || 0) + typeCount(n6, t); });
    var d = R.pick(Object.keys(ords).map(Number).filter(function (o) { return o > 1; })), contrib = typesOf(n6).filter(function (t) { return lcmA(t) === d; });
    return { q: 'How many elements of order $' + d + '$ are in $S_{' + n6 + '}$?', a: num(ords[d]),
      steps: ['The order is the lcm of the cycle lengths, so list the cycle types with lcm $' + d + '$: ' + contrib.map(function (t) { return t.join(', '); }).join('; ') + '.', contrib.map(function (t) { return 'type ' + t.join(', ') + ': $' + typeCount(n6, t) + '$'; }).join('; ') + '.', 'Total: $' + ords[d] + '$.'], hint: 'Which cycle types have lcm $' + d + '$? Count each type.' };
  });

  var SIGNFLAW = [['"$(1\\;2\\;3)$ is odd, because it has three entries."', 'A $k$-cycle is a product of $k - 1$ transpositions, so a 3-cycle is a product of two: it is even.', ['Nothing is wrong.', 'Every cycle is even.', 'Only transpositions have a sign.'], '$(1\\;2\\;3) = (1\\;3)(1\\;2)$.'],
    ['"$(1\\;2) = (1\\;2)(1\\;3)(1\\;3)$ is a product of three transpositions, so $(1\\;2)$ is both odd and even."', 'Three is odd, so this agrees with $(1\\;2)$ being odd; the parity of the number of transpositions never changes, only the number does.', ['Nothing is wrong: some permutations are both even and odd.', 'The product $(1\\;2)(1\\;3)(1\\;3)$ is not $(1\\;2)$.', 'Transpositions are even.'], '$(1\\;3)(1\\;3) = e$, so the right side is $(1\\;2)$, written with $3$ transpositions: still an odd number.'],
    ['"The odd permutations form a subgroup of $S_{n}$, just like the even ones."', 'The identity is even, so the odd permutations do not contain it (and the product of two odd permutations is even).', ['Nothing is wrong.', 'The odd permutations are closed under products, so they form a subgroup.', 'They are a subgroup only when $n$ is odd.'], 'Only $A_{n}$, the even permutations, is a subgroup.'],
    ['"$(1\\;2\\;3\\;4)$ is even because $4$ is even."', 'A 4-cycle is a product of $3$ transpositions, so it is odd.', ['Nothing is wrong.', 'It is even, but because $1 + 2 + 3 + 4 = 10$ is even.', 'A 4-cycle has no sign.'], '$(1\\;2\\;3\\;4) = (1\\;4)(1\\;3)(1\\;2)$.']];
  G('aa.sign-alternating', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['sign', 'sign', 'An']), R.pick(['transp', 'inAn', 'sign', 'An']), R.pick(['flaw', 'countAn', 'inAn', 'transp']));
    if (shape === 'sign') {
      var n = L === 1 ? R.pick([5, 6]) : R.pick([7, 8]), lens = R.pick([[3], [4], [2], [5], [3, 2], [4, 2], [2, 2], [3, 3], [4, 3], [5, 2]].filter(function (l) { return sum(l) <= n; })), cyc = randCycles(R, n, lens), sg = lens.reduce(function (s, l) { return s * (l % 2 ? 1 : -1); }, 1);
      return { q: 'Is $' + cycSeqTex(cyc) + '$ even or odd?', a: mcKeep(['Even', 'Odd'], sg === 1 ? 0 : 1), steps: ['A cycle of length $k$ is a product of $k - 1$ transpositions: $(a_1\\;a_2\\;\\dots\\;a_k) = (a_1\\;a_k)\\cdots(a_1\\;a_3)(a_1\\;a_2)$.', 'Here: ' + lens.map(function (l) { return '$' + (l - 1) + '$'; }).join(' + ') + ' $= ' + sum(lens.map(function (l) { return l - 1; })) + '$ transpositions.', sg === 1 ? 'An even number, so the permutation is even.' : 'An odd number, so the permutation is odd.'], hint: 'Count $k - 1$ for each cycle of length $k$.' };
    }
    if (shape === 'An') { var n2 = R.int(3, 8); return { q: 'How many elements does $A_{' + n2 + '}$ have?', a: num(fact(n2) / 2), steps: ['Multiplying by the transposition $(1\\;2)$ swaps the even and the odd permutations of $S_{' + n2 + '}$ one for one, so half are even.', '$|A_{' + n2 + '}| = ' + n2 + '!/2 = ' + (fact(n2) / 2) + '$.'], hint: 'Exactly half of $S_{n}$ is even (for $n \\ge 2$).' }; }
    if (shape === 'transp') {
      var n3 = R.pick([6, 7, 8]), s = randDerangedish(R, n3, 4), cyc3 = pcycles(s), m = sum(cyc3.map(function (c) { return c.length - 1; }));
      return { q: 'What is the smallest number of transpositions whose product is $\\sigma = ' + twoRow(s) + '$?', a: num(m), steps: ['Cycles: $' + cycTex(cyc3) + '$.', 'A $k$-cycle needs $k - 1$ transpositions, and no fewer: each transposition changes the number of cycles (counting fixed points) by exactly one, and $\\sigma$ has $' + (n3 - m) + '$ cycles against the identity\'s $' + n3 + '$.', 'Minimum: $' + cyc3.map(function (c) { return c.length - 1; }).join(' + ') + ' = ' + m + '$.'], hint: 'Write the cycles first; then count $k - 1$ per cycle.' };
    }
    if (shape === 'inAn') {
      var n4 = R.pick([5, 6]), cs = randOverlap(R, n4, R.pick([2, 3]), 4), s4 = pfrom(cs, n4), sg4 = psign(s4);
      return { q: 'Is $' + cycSeqTex(cs) + '$ in $A_{' + n4 + '}$?', a: tf(sg4 === 1), steps: ['Signs multiply, so add up $k - 1$ over the given cycles (overlapping is fine): ' + cs.map(function (c) { return '$' + (c.length - 1) + '$'; }).join(' + ') + ' $= ' + sum(cs.map(function (c) { return c.length - 1; })) + '$.', sg4 === 1 ? 'Even, so it is in $A_{' + n4 + '}$.' : 'Odd, so it is not in $A_{' + n4 + '}$.', 'Check with disjoint cycles: $' + pTex(s4) + '$.'], hint: 'The sign is a homomorphism: you do not need to multiply the cycles out.' };
    }
    if (shape === 'flaw') { var f = R.pick(SIGNFLAW); return { q: 'What is wrong with this statement?<br>' + f[0], a: mc(f[1], f[2]), steps: [f[1], f[3]], hint: 'Write the cycle as a product of transpositions and count them.' }; }
    var n5 = R.pick([4, 5]), ev = typesOf(n5).filter(function (t) { return t.length && sum(t.map(function (l) { return l - 1; })) % 2 === 0; }), byO = {};
    ev.forEach(function (t) { var o = lcmA(t); byO[o] = (byO[o] || 0) + typeCount(n5, t); });
    var d = R.pick(Object.keys(byO).map(Number));
    return { q: 'How many elements of order $' + d + '$ does $A_{' + n5 + '}$ have?', a: num(byO[d]), steps: ['The even cycle types in $S_{' + n5 + '}$ (other than $e$): ' + ev.map(function (t) { return t.join(', ') + ' (order ' + lcmA(t) + ')'; }).join('; ') + '.', 'Those of order $' + d + '$: ' + ev.filter(function (t) { return lcmA(t) === d; }).map(function (t) { return 'type ' + t.join(', ') + ': $' + typeCount(n5, t) + '$'; }).join('; ') + '.', 'Total: $' + byO[d] + '$.'], hint: 'Keep only the even cycle types, then count each.' };
  });

  G('aa.dihedral-groups', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['prod', 'inv', 'ord', 'prod']), R.pick(['word', 'prod', 'ord', 'count2']), R.pick(['word', 'perm', 'center', 'count2']));
    var n = R.pick(L === 1 ? [4, 5, 6] : [5, 6, 7, 8]), els = dElems(n), viz = { name: 'aa-dihedral', opts: { n: n, quiet: true } };
    var rel = 'Use $r^{' + n + '} = s^{2} = e$ and $sr^{k} = r^{-k}s$.';
    if (shape === 'prod') {
      var a = R.pick(els.slice(1)), b = R.pick(els.slice(1)), tries = 0; while (L > 1 && !a[1] && !b[1] && tries++ < 20) { a = R.pick(els.slice(1)); b = R.pick(els.slice(1)); }
      var ab = dmul(n, a, b);
      return { q: 'In $D_{' + n + '}$ (rotations $r^{k}$, reflections $r^{k}s$, with $sr = r^{-1}s$), write $(' + dTex(a) + ')(' + dTex(b) + ')$ in the form $r^{k}$ or $r^{k}s$ with $0 \\le k < ' + n + '$.', a: dText(ab), viz: viz,
        steps: [rel, a[1] ? (b[0] ? 'Move $s$ past $r^{' + b[0] + '}$: $' + dTex(a) + dTex(b) + ' = ' + (a[0] ? 'r^{' + a[0] + '}' : '') + 'r^{' + (-b[0]) + '}s' + (b[1] ? 's' : '') + '$.' : 'Here $' + dTex(a) + '\\cdot ' + dTex(b) + ' = ' + (a[0] ? 'r^{' + a[0] + '}' : '') + 'ss$.') : (b[0] ? 'Rotations add: $' + dTex(a) + dTex(b) + ' = r^{' + a[0] + ' + ' + b[0] + '}' + (b[1] ? 's' : '') + '$.' : 'Nothing to move: $' + dTex(a) + '\\cdot ' + dTex(b) + ' = ' + dTex(a) + dTex(b) + '$.'), 'Reduce the exponent mod $' + n + '$' + (a[1] && b[1] ? ' and use $s^{2} = e$' : '') + ': $' + dTex(ab) + '$.'], hint: a[1] ? 'Push the $s$ to the right; each time it passes $r$, that $r$ becomes $r^{-1}$.' : 'Rotation exponents add mod $' + n + '$.' };
    }
    if (shape === 'inv') {
      var c = R.pick(els.slice(1)), ci = dinv(n, c);
      return { q: 'In $D_{' + n + '}$, find the inverse of $' + dTex(c) + '$ in the form $r^{k}$ or $r^{k}s$ with $0 \\le k < ' + n + '$.', a: dText(ci), viz: viz,
        steps: c[1] ? ['$' + dTex(c) + '$ is a reflection, and every reflection is its own inverse.', 'Check: $(' + dTex(c) + ')(' + dTex(c) + ') = r^{' + c[0] + '}r^{-' + c[0] + '}ss = e$.', 'So the inverse is $' + dTex(c) + '$.'] : ['The inverse of a rotation by $' + c[0] + '$ steps is a rotation by $' + n + ' - ' + c[0] + ' = ' + ci[0] + '$ steps.', 'So $(' + dTex(c) + ')^{-1} = ' + dTex(ci) + '$.'], hint: c[1] ? 'Flip twice and you are back.' : 'Rotate the rest of the way around.' };
    }
    if (shape === 'ord') {
      var d = R.pick(els.slice(1)), o = dord(n, d);
      return { q: 'Find the order of $' + dTex(d) + '$ in $D_{' + n + '}$.', a: num(o), viz: viz,
        steps: d[1] ? ['$' + dTex(d) + '$ is a reflection: $(r^{k}s)^{2} = r^{k}r^{-k}s^{2} = e$.', 'So its order is $2$.'] : ['$' + dTex(d) + '$ is a rotation by $' + d[0] + '$ steps of $360^\\circ/' + n + '$.', 'Its order is $' + n + '/\\gcd(' + n + ', ' + d[0] + ') = ' + o + '$.'], hint: 'Is it a rotation or a reflection?' };
    }
    if (shape === 'word') {
      var len = L === 3 ? 4 : 3, word = [], val = [0, 0];
      for (var i = 0; i < len; i++) { var g = i % 2 === 0 ? [R.int(1, n - 1), 0] : [0, 1]; if (R.chance(0.3)) g = [R.int(1, n - 1), 1]; word.push(g); }
      word.forEach(function (g) { val = dmul(n, val, g); });
      var partial = [], acc = [0, 0]; word.forEach(function (g) { acc = dmul(n, acc, g); partial.push(dTex(acc)); });
      return { q: 'In $D_{' + n + '}$, simplify $' + word.map(function (g) { return dTex(g); }).join('\\,') + '$ to the form $r^{k}$ or $r^{k}s$ with $0 \\le k < ' + n + '$.', a: dText(val), viz: viz,
        steps: [rel, 'Multiply from the left, one factor at a time: ' + partial.map(function (p, i) { return '$' + (i ? '\\to ' : '') + p + '$'; }).join(' ') + '.', 'Result: $' + dTex(val) + '$.'], hint: 'Each time an $s$ moves to the right past $r^{k}$, the $r^{k}$ becomes $r^{-k}$.' };
    }
    if (shape === 'count2') {
      var c2 = els.filter(function (x) { return x[0] + x[1] > 0 && dord(n, x) === 2; }).length;
      return { q: 'How many elements of order $2$ does $D_{' + n + '}$ have?', a: num(c2), viz: viz,
        steps: ['All $' + n + '$ reflections $r^{k}s$ have order $2$.', n % 2 ? 'A rotation $r^{k}$ has order $' + n + '/\\gcd(' + n + ', k)$, which is never $2$ for odd $' + n + '$.' : 'Among rotations, only $r^{' + (n / 2) + '}$ (the half turn) has order $2$.', 'Total: $' + c2 + '$.'], hint: 'Count the reflections, then ask which rotations are half turns.' };
    }
    if (shape === 'perm') {
      var e2 = [R.int(0, n - 1), 1], p = dPerm(n, e2);
      return { q: 'Number the vertices of a regular ' + n + '-gon $1, \\dots, ' + n + '$ counterclockwise. Let $r$ rotate by $360^\\circ/' + n + '$ counterclockwise (vertex $i \\mapsto i + 1$) and let $s$ be the reflection that fixes vertex $1$. Write $' + dTex(e2) + '$ as a permutation of the vertices in cycle notation.', a: permText(p), viz: { name: 'aa-dihedral', opts: { n: n, quiet: true } },
        steps: ['$s$ fixes vertex $1$ and sends vertex $i$ to vertex $' + (n + 2) + ' - i$ (mod $' + n + '$).', e2[0] ? 'Then $r^{' + e2[0] + '}$ adds $' + e2[0] + '$ to each vertex (mod $' + n + '$). Apply $s$ first.' : 'Here there is no rotation.', 'Vertex by vertex: $' + range(0, n - 1).map(function (j) { return (j + 1) + ' \\mapsto ' + (p[j] + 1); }).join(',\\ ') + '$.', 'Cycles: $' + pTex(p) + '$.'], hint: 'Apply $s$ first, then the rotation.' };
    }
    var z = els.filter(function (x) { return els.every(function (y) { return deq(dmul(n, x, y), dmul(n, y, x)); }); });
    return { q: 'How many elements are in the center of $D_{' + n + '}$ (the elements that commute with everything)?', a: num(z.length), viz: viz,
      steps: ['A reflection $r^{k}s$ does not commute with $r$: $r(r^{k}s) = r^{k+1}s$ but $(r^{k}s)r = r^{k-1}s$ (these differ since $n \\ge 3$).', 'A rotation $r^{k}$ commutes with $s$ only if $r^{k}s = sr^{k} = r^{-k}s$, that is, $2k \\equiv 0 \\pmod{' + n + '}$.', n % 2 ? 'For odd $n$ only $k = 0$ works: the center is $\\{e\\}$.' : 'For even $n$, $k = 0$ or $k = ' + (n / 2) + '$: the center is $\\{e, r^{' + (n / 2) + '}\\}$.', 'So the center has $' + z.length + '$ element' + (z.length > 1 ? 's' : '') + '.'], hint: 'Test reflections against $r$ and rotations against $s$.' };
  });


  // ================================================================ unit 4: cosets and Lagrange
  function setTexG(Gr, H) { return setTex(texList(Gr, H)); }
  function subgroupChoices(Gr, R, H, gen) { return null; }
  // S3 with standard names
  var S3 = null; function gS3() { return S3 || (S3 = gS(3)); }

  G('aa.cosets', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['zn', 'zn', 'count']), R.pick(['same', 'un', 's3', 'zn']), R.pick(['lr', 'dn', 's3', 'same']));
    if (shape === 'zn' || shape === 'count') {
      var n = L === 1 ? R.pick([8, 9, 10, 12]) : R.pick([12, 15, 18, 20]), d = R.pick(divisors(n).filter(function (x) { return x > 1 && x < n; })), H = range(0, n / d - 1).map(function (k) { return k * d; });
      if (shape === 'count') return { q: 'How many different cosets does $H = ' + gen(d) + '$ have in $' + Z(n) + '$?', a: num(d),
        steps: ['$H = ' + gen(d) + ' = ' + setTex(H) + '$ has $' + H.length + '$ elements.', 'The cosets are disjoint and each has $' + H.length + '$ elements, so there are $' + n + '/' + H.length + ' = ' + d + '$ of them: $0 + H, 1 + H, \\dots, ' + (d - 1) + ' + H$.'], hint: 'Cosets split the group into equal pieces of size $|H|$.' };
      var a = R.pick(range(1, n - 1).filter(function (x) { return x % d !== 0; })), C = sortN(H.map(function (h) { return (a + h) % n; }));
      return { q: 'In $' + Z(n) + '$, let $H = ' + gen(d) + '$. List the elements of the coset $' + a + ' + H$.', a: setA(C),
        steps: ['$H = ' + gen(d) + ' = ' + setTex(H) + '$.', 'Add $' + a + '$ to each element (mod $' + n + '$): $' + setTex(C) + '$.', 'Note that $' + a + ' + H$ does not contain $0$, so it is not a subgroup.'], hint: 'Shift every element of $H$ by $' + a + '$.' };
    }
    if (shape === 'same') {
      var n2 = R.pick([12, 15, 18, 20, 24]), d2 = R.pick(divisors(n2).filter(function (x) { return x > 1 && x < n2; })), a2 = R.int(0, n2 - 1), b2 = R.coin() ? (a2 + d2 * R.int(1, 3)) % n2 : R.int(0, n2 - 1), same = mod(a2 - b2, d2) === 0;
      return { q: 'In $' + Z(n2) + '$ with $H = ' + gen(d2) + '$, is $' + a2 + ' + H = ' + b2 + ' + H$?', a: tf(same), steps: ['$a + H = b + H$ exactly when $a - b \\in H$, that is, when $a - b$ is a multiple of $' + d2 + '$ (mod $' + n2 + '$).', '$' + a2 + ' - ' + b2 + ' = ' + (a2 - b2) + '$' + (same ? ', a multiple of $' + d2 + '$.' : ', not a multiple of $' + d2 + '$.'), same ? 'So the cosets are equal.' : 'So the cosets are different (and therefore disjoint).'], hint: 'Is $' + a2 + ' - ' + b2 + '$ in $H$?' };
    }
    if (shape === 'un') {
      var n3 = R.pick([13, 15, 16, 20, 21]), Ul = units(n3), hg = R.pick(Ul.filter(function (x) { var o = ordMul(x, n3); return o > 1 && o < Ul.length; })), H3 = powersU(hg, n3), a3 = R.pick(Ul.filter(function (x) { return H3.indexOf(x) < 0; })), C3 = sortN(H3.map(function (h) { return a3 * h % n3; }));
      return { q: 'In $' + Un(n3) + '$, let $H = ' + gen(hg) + ' = ' + setTex(H3) + '$. List the elements of the coset $' + a3 + 'H$.', a: setA(C3), steps: ['$' + a3 + 'H = \\{' + a3 + 'h : h \\in H\\}$.', 'Multiply each element of $H$ by $' + a3 + '$ mod $' + n3 + '$: ' + H3.map(function (h) { return '$' + a3 + ' \\cdot ' + h + ' \\equiv ' + (a3 * h % n3) + '$'; }).join(', ') + '.', 'So $' + a3 + 'H = ' + setTex(C3) + '$.'], hint: 'Multiply each element of $H$ by $' + a3 + '$ and reduce.' };
    }
    if (shape === 's3' || shape === 'lr') {
      var Gr = gS3(), subs = allSubgroups(Gr).filter(function (H) { return H.length === 2 || H.length === 3; }), H4 = R.pick(subs), g = R.pick(range(0, Gr.n - 1).filter(function (i) { return H4.indexOf(i) < 0; }));
      var Lc = leftCoset(Gr, g, H4), Rc = rightCoset(Gr, g, H4);
      if (shape === 'lr') return { q: 'In $S_{3}$, let $H = ' + setTexG(Gr, H4) + '$ and $\\sigma = ' + Gr.tex(g) + '$. Is $\\sigma H = H\\sigma$?', a: tf(sameSet(Lc, Rc)),
        steps: ['$\\sigma H = ' + setTexG(Gr, Lc) + '$ (multiply each $h$ on the left: $\\sigma h$, so $h$ acts first).', '$H\\sigma = ' + setTexG(Gr, Rc) + '$ (multiply on the right: $h\\sigma$, so $\\sigma$ acts first).', sameSet(Lc, Rc) ? 'They are equal. (This $H$ has index $2$, and then left and right cosets always agree.)' : 'They are different sets: left and right cosets need not agree.'], hint: 'Compute $\\sigma h$ and $h\\sigma$ for each $h \\in H$.' };
      var others = []; for (var x = 0; x < Gr.n; x++) { var Cx = leftCoset(Gr, x, H4), Rx = rightCoset(Gr, x, H4); [Cx, Rx].forEach(function (C) { if (!sameSet(C, Lc) && others.every(function (o) { return !sameSet(o, C); })) others.push(C); }); }
      others = others.concat(allSubgroups(Gr).filter(function (K) { return K.length === H4.length && !sameSet(K, Lc) && others.every(function (o) { return !sameSet(o, K); }); }));
      return { q: 'In $S_{3}$ (compose right to left), let $H = ' + setTexG(Gr, H4) + '$. Which set is the left coset $' + Gr.tex(g) + 'H$?', a: mc('$' + setTexG(Gr, Lc) + '$', others.slice(0, 3).map(function (C) { return '$' + setTexG(Gr, C) + '$'; })),
        steps: ['$' + Gr.tex(g) + 'H$ holds the products $' + Gr.tex(g) + 'h$ for $h \\in H$ (apply $h$ first).'].concat(H4.map(function (h) { return '$' + Gr.tex(g) + '\\,' + Gr.tex(h) + ' = ' + Gr.tex(Gr.mul(g, h)) + '$'; }).join(', ')).concat(['So $' + Gr.tex(g) + 'H = ' + setTexG(Gr, Lc) + '$' + (sameSet(Lc, Rc) ? '.' : ', while the right coset $H' + Gr.tex(g) + ' = ' + setTexG(Gr, Rc) + '$ is different.')]), hint: 'Multiply $' + Gr.tex(g) + '$ on the left of each element of $H$.' };
    }
    var n5 = R.pick([4, 5, 6]), Gd = gD(n5), Hd = gspan(Gd, [Gd.idx([0, 1])]), gd = R.pick(range(0, Gd.n - 1).filter(function (i) { return Hd.indexOf(i) < 0; })), Ld = leftCoset(Gd, gd, Hd);
    return { q: 'In $D_{' + n5 + '}$, let $H = \\{e, s\\}$. List the left coset $' + Gd.tex(gd) + 'H$ (elements in the form $r^{k}$ or $r^{k}s$).', a: mc('$' + setTexG(Gd, Ld) + '$', [rightCoset(Gd, gd, Hd), leftCoset(Gd, Gd.mul(gd, gd), Hd), [gd, Gd.idx([0, 1])]].filter(function (C) { return !sameSet(C, Ld); }).map(function (C) { return '$' + setTexG(Gd, sortN(uniqN(C))) + '$'; })), viz: { name: 'aa-dihedral', opts: { n: n5, quiet: true } },
      steps: ['$' + Gd.tex(gd) + 'H = \\{' + Gd.tex(gd) + ' \\cdot e, ' + Gd.tex(gd) + ' \\cdot s\\}$.', '$' + Gd.tex(gd) + ' \\cdot s = ' + Gd.tex(Gd.mul(gd, Gd.idx([0, 1]))) + '$ (use $s^{2} = e$ if needed).', 'So $' + Gd.tex(gd) + 'H = ' + setTexG(Gd, Ld) + '$.'], hint: 'Multiply $' + Gd.tex(gd) + '$ by $e$ and by $s$, with $' + Gd.tex(gd) + '$ on the left.' };
  });

  G('aa.lagrange', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['possible', 'index', 'index']), R.pick(['notorder', 'tower', 'possible', 'meet']), R.pick(['converse', 'order', 'meet', 'tower']));
    if (shape === 'possible') {
      var n = R.pick([12, 18, 20, 24, 28, 30, 36, 42]);
      return { q: 'A group $G$ has order $' + n + '$. List every number that could be the order of a subgroup of $G$ (as far as Lagrange\'s theorem allows).', a: setA(divisors(n)), steps: ['By Lagrange\'s theorem, $|H|$ divides $|G| = ' + n + '$.', 'The divisors of $' + n + '$: $' + divisors(n).join(', ') + '$.'], hint: 'Subgroup orders divide the group order.' };
    }
    if (shape === 'index') {
      var n2 = R.pick([24, 36, 48, 60, 72, 120]), m = R.pick(divisors(n2).filter(function (x) { return x > 1 && x < n2; }));
      return { q: '$|G| = ' + n2 + '$ and $H$ is a subgroup with $|H| = ' + m + '$. How many left cosets does $H$ have in $G$?', a: num(n2 / m), steps: ['The left cosets of $H$ are disjoint, each has $|H| = ' + m + '$ elements, and together they cover $G$.', 'So $[G : H] = |G|/|H| = ' + n2 + '/' + m + ' = ' + (n2 / m) + '$.'], hint: 'Count the pieces: $|G|$ divided by the size of each piece.' };
    }
    if (shape === 'notorder') {
      var n3 = R.pick([20, 24, 30, 36, 40, 42]), ds = divisors(n3), non = R.pick(range(2, n3 - 1).filter(function (x) { return n3 % x !== 0; }));
      return { q: 'A group has order $' + n3 + '$. Which of these <b>cannot</b> be the order of one of its subgroups?', a: mc('$' + non + '$', R.sample(ds.filter(function (x) { return x > 1 && x < n3; }), 3).map(function (x) { return '$' + x + '$'; })), steps: ['By Lagrange\'s theorem a subgroup\'s order divides $' + n3 + '$.', '$' + non + '$ does not divide $' + n3 + '$, so no subgroup has that order.'], hint: 'Which choice does not divide $' + n3 + '$?' };
    }
    if (shape === 'tower') {
      var a = R.pick([2, 3, 4, 5]), b = R.pick([2, 3, 4, 6]), k = R.pick([2, 3, 5]), nK = k, nH = k * b, nG = k * b * a, ask = R.int(0, 2);
      var q = ask === 0 ? '$K \\subseteq H \\subseteq G$ are groups with $[G : H] = ' + a + '$ and $[H : K] = ' + b + '$. Find $[G : K]$.' : ask === 1 ? '$K \\subseteq H \\subseteq G$ are finite groups with $|G| = ' + nG + '$, $[G : H] = ' + a + '$ and $|K| = ' + nK + '$. Find $[H : K]$.' : '$K \\subseteq H \\subseteq G$ are finite groups with $[G : K] = ' + (a * b) + '$ and $[H : K] = ' + b + '$. Find $[G : H]$.';
      var ans = ask === 0 ? a * b : ask === 1 ? b : a;
      return { q: q, a: num(ans), steps: ['Indices multiply: $[G : K] = [G : H]\\,[H : K]$, because $|G|/|K| = (|G|/|H|)(|H|/|K|)$.', ask === 1 ? '$|H| = |G|/[G : H] = ' + nG + '/' + a + ' = ' + nH + '$, so $[H : K] = ' + nH + '/' + nK + ' = ' + b + '$.' : 'So the missing index is $' + ans + '$.'], hint: 'Write each index as a quotient of orders.' };
    }
    if (shape === 'meet') {
      var p = R.pick([[4, 9], [6, 25], [8, 15], [10, 21], [12, 18], [6, 15], [20, 12], [9, 15]]), g = gcd(p[0], p[1]);
      return { q: '$H$ and $K$ are subgroups of a finite group with $|H| = ' + p[0] + '$ and $|K| = ' + p[1] + '$. List every possible value of $|H \\cap K|$ allowed by Lagrange\'s theorem.', a: setA(divisors(g)), steps: ['$H \\cap K$ is a subgroup of both $H$ and $K$.', 'So $|H \\cap K|$ divides both $' + p[0] + '$ and $' + p[1] + '$, hence divides $\\gcd(' + p[0] + ', ' + p[1] + ') = ' + g + '$.', g === 1 ? 'So $|H \\cap K| = 1$: $H \\cap K = \\{e\\}$.' : 'Possible values: $' + divisors(g).join(', ') + '$.'], hint: 'Apply Lagrange inside $H$ and inside $K$.' };
    }
    if (shape === 'converse') {
      var Gr = gA(4), subs = allSubgroups(Gr), ords = uniqN(subs.map(function (H) { return H.length; })), miss = divisors(12).filter(function (d) { return ords.indexOf(d) < 0; });
      return { q: '$A_{4}$ has order $12$. Type the divisor $d$ of $12$ for which $A_{4}$ has <b>no</b> subgroup of order $d$ (the classic failure of the converse of Lagrange\'s theorem).', a: num(miss[0]),
        steps: ['$A_{4}$ has subgroups of orders ' + ords.map(function (o) { return '$' + o + '$'; }).join(', ') + ': for example $\\{e\\}$, $\\langle(1\\;2)(3\\;4)\\rangle$, $\\langle(1\\;2\\;3)\\rangle$, the four-element group $\\{e, (1\\;2)(3\\;4), (1\\;3)(2\\;4), (1\\;4)(2\\;3)\\}$ and $A_{4}$ itself.', 'A subgroup of order $6$ would have index $2$, so it would contain the square of every element; the squares of the eight 3-cycles are all eight 3-cycles, too many for a group of order $6$.', 'So the missing order is $' + miss[0] + '$.'], hint: 'Try each divisor of 12; the interesting one is in the middle.' };
    }
    return orderProblem(R, 'Put the steps of this proof of Lagrange\'s theorem in order. ($H$ is a subgroup of the finite group $G$.)', ['The relation $a \\sim b \\iff a^{-1}b \\in H$ is an equivalence relation on $G$, and its classes are the left cosets $aH$.', 'So the left cosets of $H$ are disjoint and cover $G$.', 'The map $h \\mapsto ah$ is a bijection from $H$ to $aH$ (it is undone by $x \\mapsto a^{-1}x$), so every coset has $|H|$ elements.', 'If there are $k$ cosets, then $|G| = k\\,|H|$.', 'Therefore $|H|$ divides $|G|$, and $[G : H] = k = |G|/|H|$.']);
  });

  G('aa.lagrange-consequences', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['elorders', 'power', 'power']), R.pick(['euler', 'prime', 'elorders', 'power']), R.pick(['missing', 'flaw', 'euler', 'prime']));
    if (shape === 'elorders') {
      var n = R.pick([10, 12, 15, 16, 18, 21, 25, 27]);
      return { q: 'A group $G$ has order $' + n + '$. List every number that could be the order of an element of $G$ (as far as Lagrange\'s theorem allows).', a: setA(divisors(n)), steps: ['The order of $a$ is the order of the cyclic subgroup $' + gen('a') + '$.', 'By Lagrange\'s theorem it divides $' + n + '$: $' + divisors(n).join(', ') + '$.', '(Whether each one actually occurs depends on the group: in $' + Z(n) + '$ all of them do.)'], hint: 'Element orders are subgroup orders.' };
    }
    if (shape === 'power') {
      var n2 = R.pick([12, 15, 20, 24, 30]), k = R.int(2 * n2 + 1, 9 * n2), j = mod(k, n2); if (!j) { k++; j = 1; }
      return { q: 'In a group of order $' + n2 + '$, $a^{' + k + '} = a^{j}$ for which $j$ with $0 \\le j < ' + n2 + '$? (This works for every element $a$.)', a: num(j), steps: ['By Lagrange, $|a|$ divides $' + n2 + '$, so $a^{' + n2 + '} = e$.', '$' + k + ' = ' + n2 + ' \\cdot ' + M.floor(k / n2) + ' + ' + j + '$, so $a^{' + k + '} = (a^{' + n2 + '})^{' + M.floor(k / n2) + '} a^{' + j + '} = a^{' + j + '}$.'], hint: 'Every element satisfies $a^{|G|} = e$.' };
    }
    if (shape === 'euler') {
      var n3 = R.pick([10, 14, 15, 16, 18, 20, 21, 24]), f = phi(n3), a = R.pick(units(n3).filter(function (x) { return x > 1; })), k3 = R.int(3 * f + 1, 40 * f), j3 = mod(k3, f);
      return { q: 'Use Lagrange\'s theorem in $' + Un(n3) + '$ to find $' + a + '^{' + k3 + '} \\bmod ' + n3 + '$.', a: num(powMod(a, k3, n3)), steps: ['$|' + Un(n3) + '| = \\varphi(' + n3 + ') = ' + f + '$, so $' + a + '^{' + f + '} \\equiv 1 \\pmod{' + n3 + '}$ (Euler\'s theorem is Lagrange in $' + Un(n3) + '$).', '$' + k3 + ' = ' + f + ' \\cdot ' + M.floor(k3 / f) + (j3 ? ' + ' + j3 : '') + '$, so $' + a + '^{' + k3 + '} \\equiv ' + a + '^{' + j3 + '}$.', '$' + a + '^{' + j3 + '} \\equiv ' + powMod(a, j3, n3) + ' \\pmod{' + n3 + '}$.'], hint: 'Reduce the exponent mod $\\varphi(' + n3 + ')$.' };
    }
    if (shape === 'prime') {
      var p = R.pick([5, 7, 11, 13, 17, 19, 23]), ask = R.int(0, 2);
      var q = ask === 0 ? 'A group $G$ has prime order $' + p + '$. How many elements of $G$ have order $' + p + '$?' : ask === 1 ? 'A group $G$ has prime order $' + p + '$. How many subgroups does $G$ have?' : 'A group $G$ has prime order $' + p + '$. How many elements of $G$ generate $G$?';
      var ans = ask === 1 ? 2 : p - 1;
      return { q: q, a: num(ans), steps: ['Any $a \\ne e$ has order dividing $' + p + '$ and bigger than $1$, so its order is $' + p + '$ and $' + gen('a') + ' = G$: $G$ is cyclic.', ask === 1 ? 'The only subgroup orders are $1$ and $' + p + '$: the subgroups are $\\{e\\}$ and $G$, two in all.' : 'So all $' + (p - 1) + '$ elements other than $e$ have order $' + p + '$ and generate $G$.'], hint: 'What can the order of an element $a \\ne e$ be?' };
    }
    if (shape === 'missing') {
      var n4 = R.pick([8, 12, 15, 16, 20, 21, 24]), f4 = phi(n4), os = uniqN(units(n4).map(function (x) { return ordMul(x, n4); })), miss = divisors(f4).filter(function (d) { return os.indexOf(d) < 0; });
      if (!miss.length) { n4 = 8; f4 = 4; os = [1, 2]; miss = [4]; }
      return { q: '$|' + Un(n4) + '| = ' + f4 + '$. Type the smallest divisor $d$ of $' + f4 + '$ such that $' + Un(n4) + '$ has <b>no</b> element of order $d$.', a: num(miss[0]), steps: ['Orders of the elements of $' + Un(n4) + '$: ' + units(n4).map(function (x) { return '$|' + x + '| = ' + ordMul(x, n4) + '$'; }).join(', ') + '.', 'The orders that occur: $' + sortN(os).join(', ') + '$.', 'The smallest divisor of $' + f4 + '$ missing from that list is $' + miss[0] + '$: Lagrange limits element orders, but does not promise every divisor.'], hint: 'Find the order of every element.' };
    }
    var fl = R.pick([['"A group of order $8$ has an element of order $8$, because $8$ divides $8$."', 'Lagrange only says element orders divide $8$; it does not promise an element of every such order ($\\mathbb{Z}_{2} \\times \\mathbb{Z}_{2} \\times \\mathbb{Z}_{2}$, or $U(24)$, has none of order $8$).', ['Nothing is wrong.', 'The order of an element must be smaller than $|G|$.', 'Lagrange\'s theorem only applies to abelian groups.']],
      ['"$|a| = 6$ in a group of order $20$."', 'This cannot happen: $6$ does not divide $20$, and the order of an element divides the order of the group.', ['Nothing is wrong.', 'It can happen if the group is not cyclic.', 'It can happen if $a^{20} \\ne e$.']],
      ['"A group of order $7$ could have a subgroup of order $3$ if it is not abelian."', 'A group of order $7$ has only the subgroups $\\{e\\}$ and itself (orders divide $7$), and it is cyclic, hence abelian.', ['Nothing is wrong.', 'It must have a subgroup of order $3$, since $3 < 7$.', 'Groups of prime order are never abelian.']]]);
    return { q: 'What is wrong with this statement?<br>' + fl[0], a: mc(fl[1], fl[2]), steps: [fl[1]], hint: 'What exactly does Lagrange\'s theorem promise, and what does it not?' };
  });


  // ================================================================ unit 5: normal subgroups and homomorphisms
  var SMALL = { // name -> [tex, factory]
    S3: ['S_{3}', function () { return gS3(); }], D4: ['D_{4}', function () { return gD(4); }], D5: ['D_{5}', function () { return gD(5); }], D6: ['D_{6}', function () { return gD(6); }],
    Q8: ['Q_{8}', gQ8], A4: ['A_{4}', function () { return gA(4); }]
  };
  var gcache = {}; function grp(k) { return gcache[k] || (gcache[k] = SMALL[k][1]()); }
  function hname(Gr, H) { return '$' + setTexG(Gr, H) + '$'; }
  function firstNonNormalWitness(Gr, H) { for (var g = 0; g < Gr.n; g++) for (var i = 0; i < H.length; i++) { var c = Gr.mul(Gr.mul(g, H[i]), Gr.inv(g)); if (H.indexOf(c) < 0) return [g, H[i], c]; } return null; }

  G('aa.normal-subgroups', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['facts', 'index2', 'test']), R.pick(['test', 'conj', 'index2', 'conjS']), R.pick(['count', 'test', 'flaw', 'conjS']));
    if (shape === 'facts') {
      var it = R.pick([['Every subgroup of an abelian group is normal.', true, '$gNg^{-1} = \\{gng^{-1}\\} = \\{n\\} = N$, since $gn = ng$.'], ['A subgroup of index $2$ is always normal.', true, 'There are only two left cosets, $N$ and $G \\setminus N$, and the same two right cosets, so $gN = Ng$ for every $g$.'],
        ['$\\langle s \\rangle = \\{e, s\\}$ is normal in $D_{4}$.', false, '$rsr^{-1} = r^{2}s \\notin \\{e, s\\}$.'], ['$A_{n}$ is normal in $S_{n}$.', true, 'It has index $2$ (or: conjugation keeps the sign).'], ['$\\{e\\}$ and $G$ are always normal subgroups of $G$.', true, '$geg^{-1} = e$ and $gGg^{-1} = G$.'], ['If $N$ is normal in $G$, then $gn = ng$ for all $g \\in G$, $n \\in N$.', false, 'Only the sets $gN$ and $Ng$ must match: in $S_{3}$, $A_{3}$ is normal, but $(1\\;2)(1\\;2\\;3) \\ne (1\\;2\\;3)(1\\;2)$.'], ['The center $Z(G)$ is always a normal subgroup.', true, 'For $z \\in Z(G)$, $gzg^{-1} = zgg^{-1} = z$.']]);
      return { q: 'True or false: ' + it[0], a: tf(it[1]), steps: [it[2], it[1] ? 'True.' : 'False.'], hint: 'Test $gNg^{-1} = N$, or look for one conjugate that escapes.' };
    }
    if (shape === 'index2' || shape === 'test') {
      var key = shape === 'index2' ? R.pick(['D4', 'D5', 'D6', 'S3']) : R.pick(L === 1 ? ['S3', 'D4'] : ['S3', 'D4', 'Q8', 'A4', 'D6']), Gr = grp(key), subs = allSubgroups(Gr).filter(function (H) { return H.length > 1 && H.length < Gr.n; });
      var H = shape === 'index2' ? R.pick(subs.filter(function (K) { return Gr.n / K.length === 2; }).concat(subs.filter(function (K) { return K.length === 2; }))) : R.pick(subs), nor = isNormal(Gr, H), w = nor ? null : firstNonNormalWitness(Gr, H);
      return { q: 'Is $H = ' + setTexG(Gr, H) + '$ a normal subgroup of $' + SMALL[key][0] + '$?', a: tf(nor),
        steps: [Gr.n / H.length === 2 ? '$H$ has index $' + Gr.n + '/' + H.length + ' = 2$, and a subgroup of index $2$ is always normal.' : 'Check whether $gHg^{-1} = H$ for every $g$, or equivalently $gH = Hg$.', nor ? 'Every conjugate $ghg^{-1}$ lands back in $H$.' : 'Take $g = ' + Gr.tex(w[0]) + '$ and $h = ' + Gr.tex(w[1]) + '$: $ghg^{-1} = ' + Gr.tex(w[2]) + '$, which is not in $H$.', nor ? 'So $H$ is normal.' : 'So $H$ is not normal.'].filter(function (s, i) { return i !== 1 || !(Gr.n / H.length === 2); }), hint: 'Index 2? Then yes. Otherwise conjugate an element of $H$ by something outside $H$.' };
    }
    if (shape === 'conj') {
      var n = R.pick([4, 5, 6, 8]), a = [R.int(0, n - 1), 1], b = R.pick([[R.int(1, n - 1), 0], [R.int(0, n - 1), 1]]), c = dmul(n, dmul(n, a, b), dinv(n, a));
      return { q: 'In $D_{' + n + '}$, compute the conjugate $(' + dTex(a) + ')(' + dTex(b) + ')(' + dTex(a) + ')^{-1}$ in the form $r^{k}$ or $r^{k}s$.', a: dText(c),
        steps: ['A reflection is its own inverse: $(' + dTex(a) + ')^{-1} = ' + dTex(a) + '$.', 'Multiply left to right with $sr^{k} = r^{-k}s$: $(' + dTex(a) + ')(' + dTex(b) + ') = ' + dTex(dmul(n, a, b)) + '$.', 'Then $(' + dTex(dmul(n, a, b)) + ')(' + dTex(a) + ') = ' + dTex(c) + '$.', b[1] ? 'Conjugating a reflection gives a reflection.' : 'Conjugating a rotation by a reflection reverses it: $r^{k} \\mapsto r^{-k}$.'], hint: 'Inverse first, then multiply step by step.' };
    }
    if (shape === 'conjS') {
      var n2 = R.pick([5, 6]), s = randDerangedish(R, n2, 4), t = pfrom(randCycles(R, n2, R.pick([[3], [2, 2], [4], [3, 2]])), n2), c2 = pcomp(pcomp(s, t), pinv(s));
      return { q: 'Let $\\sigma = ' + pTex(s) + '$ and $\\tau = ' + pTex(t) + '$ in $S_{' + n2 + '}$. Write $\\sigma\\tau\\sigma^{-1}$ in cycle notation.', a: permText(c2),
        steps: ['Shortcut: $\\sigma\\tau\\sigma^{-1}$ is $\\tau$ with every entry $i$ renamed $\\sigma(i)$. (If $\\tau(i) = j$, then $\\sigma\\tau\\sigma^{-1}$ sends $\\sigma(i)$ to $\\sigma(j)$.)', 'Rename in $' + pTex(t) + '$: ' + pcycles(t).map(function (cy) { return '$(' + cy.join('\\;') + ') \\to (' + cy.map(function (x) { return s[x - 1] + 1; }).join('\\;') + ')$'; }).join(', ') + '.', 'So $\\sigma\\tau\\sigma^{-1} = ' + pTex(c2) + '$, with the same cycle type as $\\tau$.'], hint: 'Apply $\\sigma$ to each number inside the cycles of $\\tau$.' };
    }
    if (shape === 'count') {
      var key2 = R.pick(['S3', 'D4', 'Q8', 'A4', 'D5', 'D6']), Gr2 = grp(key2), subs2 = allSubgroups(Gr2), nrm = subs2.filter(function (H) { return isNormal(Gr2, H); });
      return { q: 'How many normal subgroups does $' + SMALL[key2][0] + '$ have, counting $\\{e\\}$ and the whole group?', a: num(nrm.length),
        steps: ['$' + SMALL[key2][0] + '$ has $' + subs2.length + '$ subgroups in all; test each with $gHg^{-1} = H$ (index-2 subgroups pass at once).', 'The normal ones: ' + nrm.map(function (H) { return H.length === 1 ? '$\\{e\\}$' : H.length === Gr2.n ? 'the whole group' : '$' + setTexG(Gr2, H) + '$'; }).join(', ') + '.', 'Total: $' + nrm.length + '$.'], hint: 'Start with $\\{e\\}$, $G$, the center and any subgroups of index 2.' };
    }
    var fl = R.pick([['"$H = \\{e, (1\\;2)\\}$ is normal in $S_{3}$, because $(1\\;2)H = H(1\\;2)$."', 'Normality needs $gH = Hg$ for <b>every</b> $g$; for $g = (1\\;3)$ the two cosets differ.', ['Nothing is wrong.', 'It should check $(1\\;2)H(1\\;2)^{-1}$ instead.', 'Subgroups of order 2 are always normal.']],
      ['"$N$ is normal in $H$ and $H$ is normal in $G$, so $N$ is normal in $G$."', 'Normality is not transitive: in $D_{4}$, $\\{e, s\\}$ is normal in $\\{e, s, r^{2}, r^{2}s\\}$, which is normal in $D_{4}$, but $\\{e, s\\}$ is not normal in $D_{4}$.', ['Nothing is wrong.', 'It is true only for finite groups.', 'It is true when $N$ is cyclic.']],
      ['"$A_{3}$ is normal in $S_{3}$, so $(1\\;2)(1\\;2\\;3) = (1\\;2\\;3)(1\\;2)$."', 'Normal means $gN = Ng$ as sets, not that each $g$ commutes with each $n$: here $(1\\;2)(1\\;2\\;3) = (2\\;3)$ but $(1\\;2\\;3)(1\\;2) = (1\\;3)$.', ['Nothing is wrong.', '$A_{3}$ is not normal in $S_{3}$.', 'The products are equal because both are transpositions.']]]);
    return { q: 'What is wrong with this reasoning?<br>' + fl[0], a: mc(fl[1], fl[2]), steps: [fl[1]], hint: 'What exactly does the definition of normal require?' };
  });

  function quotOrder(Gr, N, g) { var x = g, k = 1; while (N.indexOf(x) < 0) { x = Gr.mul(x, g); k++; } return k; }
  G('aa.quotient-groups', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['size', 'add', 'cord']), R.pick(['cord', 'add', 'dn', 'size']), R.pick(['prod', 'dn', 'cyc', 'cord']));
    if (shape === 'size') {
      var it = R.pick([['\\mathbb{Z}_{24}/\\langle 6 \\rangle', 24, 4], ['\\mathbb{Z}_{30}/\\langle 10 \\rangle', 30, 3], ['S_{4}/A_{4}', 24, 12], ['D_{6}/\\langle r \\rangle', 12, 6], ['D_{8}/\\langle r^{2} \\rangle', 16, 4], ['\\mathbb{Z}_{4} \\times \\mathbb{Z}_{6}/\\langle (2, 3) \\rangle', 24, 2], ['\\mathbb{Z}_{36}/\\langle 8 \\rangle', 36, 9], ['A_{4}/V', 12, 4]]);
      return { q: 'How many elements does the quotient group $' + it[0] + '$ have?' + (it[0].indexOf('V') >= 0 ? ' (Here $V = \\{e, (1\\;2)(3\\;4), (1\\;3)(2\\;4), (1\\;4)(2\\;3)\\}$.)' : ''), a: num(it[1] / it[2]), steps: ['$|G/N| = |G|/|N|$, the number of cosets.', '$|G| = ' + it[1] + '$ and $|N| = ' + it[2] + '$' + (/langle 8/.test(it[0]) ? ' (in $\\mathbb{Z}_{36}$, $\\langle 8 \\rangle = \\langle \\gcd(8, 36) \\rangle = \\langle 4 \\rangle$ has $9$ elements)' : /\(2, 3\)/.test(it[0]) ? ' ($(2, 3)$ has order $\\operatorname{lcm}(2, 2) = 2$)' : '') + '.', 'So $|G/N| = ' + (it[1] / it[2]) + '$.'], hint: 'Count the cosets: $|G|/|N|$.' };
    }
    var n = R.pick([12, 18, 20, 24, 30]), d = R.pick(divisors(n).filter(function (x) { return x > 2 && x < n; }));
    if (shape === 'add') {
      var a = R.int(1, n - 1), b = R.int(1, n - 1), s = (a + b) % d;
      return { q: 'In $' + Z(n) + '/' + gen(d) + '$, write $(' + a + ' + ' + gen(d) + ') + (' + b + ' + ' + gen(d) + ')$ as $k + ' + gen(d) + '$ with $0 \\le k < ' + d + '$. What is $k$?', a: num(s),
        steps: ['Add representatives: $(a + N) + (b + N) = (a + b) + N$.', '$' + a + ' + ' + b + ' = ' + (a + b) + '$, and representatives that differ by a multiple of $' + d + '$ name the same coset.', '$' + (a + b) + ' \\equiv ' + s + ' \\pmod{' + d + '}$, so the sum is $' + s + ' + ' + gen(d) + '$.'], hint: 'Add, then reduce mod $' + d + '$ (not mod $' + n + '$).' };
    }
    if (shape === 'cord') {
      var a2 = R.pick(range(1, n - 1).filter(function (x) { return x % d !== 0; })), o = d / gcd(a2, d);
      return { q: 'Find the order of the element $' + a2 + ' + ' + gen(d) + '$ in $' + Z(n) + '/' + gen(d) + '$.', a: num(o),
        steps: ['The order of $a + N$ is the least $m \\ge 1$ with $m \\cdot a \\in N$.', '$m \\cdot ' + a2 + '$ lies in $' + gen(d) + '$ when it is a multiple of $' + d + '$: the least such $m$ is $' + d + '/\\gcd(' + a2 + ', ' + d + ') = ' + o + '$.', 'So the order is $' + o + '$ (in $' + Z(n) + '$ itself, $' + a2 + '$ has order $' + ordAdd(a2, n) + '$).'], hint: 'How many copies of $' + a2 + '$ until you land in $' + gen(d) + '$?' };
    }
    if (shape === 'dn') {
      var n2 = R.pick([6, 8, 12]), k = R.pick(divisors(n2).filter(function (x) { return x > 1 && x < n2; })), Gd = gD(n2), N = gspan(Gd, [Gd.idx([k, 0])]), g = R.pick(range(0, Gd.n - 1).filter(function (i) { return N.indexOf(i) < 0; })), o2 = quotOrder(Gd, N, g);
      return { q: 'In $D_{' + n2 + '}$, $N = ' + gen('r^{' + k + '}') + '$ is normal. Find the order of $(' + Gd.tex(g) + ')N$ in $D_{' + n2 + '}/N$.', a: num(o2),
        steps: ['$N = ' + setTexG(Gd, N) + '$.', 'The order of $gN$ is the least $m$ with $g^{m} \\in N$.', range(1, o2).map(function (m) { var x = gpow(Gd, g, m); return '$(' + Gd.tex(g) + ')^{' + m + '} = ' + Gd.tex(x) + (N.indexOf(x) >= 0 ? ' \\in N' : ' \\notin N') + '$'; }).join(', ') + '.', 'So the order is $' + o2 + '$.'], hint: 'Take powers until one lands in $N$.' };
    }
    if (shape === 'prod') {
      var m = R.pick([2, 3, 4, 6]), nn = R.pick([4, 6, 8, 12].filter(function (x) { return x !== m; })), Gp = gZxZ(m, nn), gen0, N2, tr = 0; do { gen0 = Gp.idx([R.int(0, m - 1), R.int(1, nn - 1)]); N2 = gspan(Gp, [gen0]); tr++; } while (N2.length === Gp.n && tr < 40); if (N2.length === Gp.n) { gen0 = Gp.idx([0, 1]); N2 = gspan(Gp, [gen0]); } var g2 = R.pick(range(0, Gp.n - 1).filter(function (i) { return N2.indexOf(i) < 0; }));
      var o3 = quotOrder(Gp, N2, g2);
      return { q: 'In $G = ' + Z(m) + ' \\times ' + Z(nn) + '$, let $N = ' + gen(Gp.tex(gen0)) + '$. Find the order of $' + Gp.tex(g2) + ' + N$ in $G/N$.', a: num(o3),
        steps: ['$N = ' + setTexG(Gp, N2) + '$, with $' + N2.length + '$ elements, so $|G/N| = ' + (Gp.n / N2.length) + '$.', 'Add $' + Gp.tex(g2) + '$ to itself until the result is in $N$: ' + range(1, o3).map(function (k2) { return '$' + Gp.tex(gpow(Gp, g2, k2)) + '$'; }).join(', ') + '.', 'The first multiple in $N$ is the ' + ordinal(o3) + ', so the order is $' + o3 + '$.'], hint: 'Keep adding $' + Gp.tex(g2) + '$ coordinate by coordinate; stop when you hit an element of $N$.' };
    }
    var m4 = R.pick([2, 4, 6]), n4 = R.pick([4, 6, 8]), G4 = gZxZ(m4, n4), g4 = G4.idx([R.int(0, m4 - 1), R.int(0, n4 - 1)]); if (g4 === G4.e) g4 = G4.idx([1, 1]);
    var N4 = gspan(G4, [g4]), qn = G4.n / N4.length, cyc = range(0, G4.n - 1).some(function (i) { return quotOrder(G4, N4, i) === qn; });
    return { q: 'Is the quotient $(' + Z(m4) + ' \\times ' + Z(n4) + ')/' + gen(G4.tex(g4)) + '$ cyclic?', a: tf(cyc),
      steps: ['$N = ' + gen(G4.tex(g4)) + '$ has $' + N4.length + '$ elements, so the quotient has $' + qn + '$.', cyc ? 'Some coset has order $' + qn + '$, for example $' + G4.tex(range(0, G4.n - 1).filter(function (i) { return quotOrder(G4, N4, i) === qn; })[0]) + ' + N$.' : 'Every coset has order at most $' + M.max.apply(null, range(0, G4.n - 1).map(function (i) { return quotOrder(G4, N4, i); })) + '$.', cyc ? 'So the quotient is cyclic.' : 'No coset generates, so the quotient is not cyclic.'], hint: 'Look for a coset whose order equals the size of the quotient.' };
  });

  G('aa.homomorphisms', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['image', 'ishom', 'facts']), R.pick(['ishomZ', 'count', 'image', 'facts']), R.pick(['possible', 'count', 'ishomZ', 'flaw']));
    if (shape === 'image') {
      var m = R.pick([12, 15, 18, 20, 24]), n = R.pick([6, 8, 10, 12, 16, 18, 30]), cand = range(0, n - 1).filter(function (k) { return (m * k) % n === 0 && k > 0; });
      if (!cand.length) { m = 12; n = 18; cand = [3, 6, 9, 12, 15]; }
      var k = R.pick(cand), x = R.int(2, m - 1);
      return { q: '$\\varphi: ' + Z(m) + ' \\to ' + Z(n) + '$ is a homomorphism with $\\varphi(1) = ' + k + '$. Find $\\varphi(' + x + ')$.', a: num(x * k % n),
        steps: ['$' + x + ' = 1 + 1 + \\cdots + 1$ (' + x + ' times), and $\\varphi$ turns sums into sums.', 'So $\\varphi(' + x + ') = ' + x + '\\varphi(1) = ' + x + ' \\cdot ' + k + ' = ' + (x * k) + ' \\equiv ' + (x * k % n) + ' \\pmod{' + n + '}$.'], hint: 'A homomorphism from a cyclic group is fixed by where it sends the generator.' };
    }
    if (shape === 'ishom') {
      var it = R.pick([['$\\varphi: \\mathbb{Z} \\to \\mathbb{Z}$, $\\varphi(x) = 3x$', true, '$3(a + b) = 3a + 3b$.'], ['$\\varphi: \\mathbb{Z} \\to \\mathbb{Z}$, $\\varphi(x) = x + 1$', false, '$\\varphi(0 + 0) = 1$ but $\\varphi(0) + \\varphi(0) = 2$.'], ['$\\varphi: \\mathbb{R}^{*} \\to \\mathbb{R}^{*}$, $\\varphi(x) = x^{2}$', true, '$(ab)^{2} = a^{2}b^{2}$ (multiplication of reals commutes).'],
        ['$\\varphi: \\mathbb{R}^{*} \\to \\mathbb{R}^{*}$, $\\varphi(x) = 2x$', false, '$\\varphi(1 \\cdot 1) = 2$ but $\\varphi(1)\\varphi(1) = 4$.'], ['$\\det: GL_{2}(\\mathbb{R}) \\to \\mathbb{R}^{*}$', true, '$\\det(AB) = \\det A \\det B$.'], ['$\\varphi: \\mathbb{R} \\to \\mathbb{R}^{+}$, $\\varphi(x) = e^{x}$ (addition to multiplication)', true, '$e^{a + b} = e^{a}e^{b}$.'],
        ['$\\operatorname{sgn}: S_{n} \\to \\{1, -1\\}$, the sign of a permutation', true, 'Signs multiply: $\\operatorname{sgn}(\\sigma\\tau) = \\operatorname{sgn}\\sigma \\operatorname{sgn}\\tau$.'], ['$\\varphi: \\mathbb{Z} \\to \\mathbb{Z}$, $\\varphi(x) = x^{2}$ (both under addition)', false, '$\\varphi(1 + 1) = 4$ but $\\varphi(1) + \\varphi(1) = 2$.'], ['$\\varphi: GL_{2}(\\mathbb{R}) \\to GL_{2}(\\mathbb{R})$, $\\varphi(A) = A^{2}$', false, 'For $A = \\begin{pmatrix} 1 & 1 \\\\ 0 & 1 \\end{pmatrix}$, $B = \\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\end{pmatrix}$: $(AB)^{2} \\ne A^{2}B^{2}$, since $AB \\ne BA$.']]);
      return { q: 'Is ' + it[0] + ' a homomorphism?', a: tf(it[1]), steps: ['Check $\\varphi(ab) = \\varphi(a)\\varphi(b)$, using each group\'s own operation on each side.', it[2], it[1] ? 'So it is a homomorphism.' : 'So it is not a homomorphism.'], hint: 'Try the identity: a homomorphism must send identity to identity.' };
    }
    if (shape === 'ishomZ') {
      var m2 = R.pick([4, 6, 8, 9, 10, 12]), n2 = R.pick([4, 6, 8, 12, 15, 18]), k2 = R.int(2, n2 - 1), ok = (m2 * k2) % n2 === 0;
      if (R.coin()) { var good = range(2, n2 - 1).filter(function (k) { return (m2 * k) % n2 === 0; }); if (good.length) { k2 = R.pick(good); ok = true; } }
      return { q: 'Is $\\varphi: ' + Z(m2) + ' \\to ' + Z(n2) + '$, $\\varphi(x) = ' + k2 + 'x \\bmod ' + n2 + '$ a well-defined homomorphism?', a: tf(ok),
        steps: ['$x$ is only known mod $' + m2 + '$: $x$ and $x + ' + m2 + '$ are the same element, so we need $' + k2 + ' \\cdot ' + m2 + ' \\equiv 0 \\pmod{' + n2 + '}$. (Equivalently, the order of $\\varphi(1) = ' + k2 + '$ must divide $' + m2 + '$.)', '$' + k2 + ' \\cdot ' + m2 + ' = ' + (k2 * m2) + (ok ? '$ is a multiple of $' + n2 + '$.' : '$ is not a multiple of $' + n2 + '$: $\\varphi(0) = 0$ but $\\varphi(' + m2 + ') = ' + (k2 * m2 % n2) + '$, and $0 = ' + m2 + '$ in $' + Z(m2) + '$.'), ok ? 'Then $\\varphi(x + y) = ' + k2 + '(x + y) = \\varphi(x) + \\varphi(y)$, so it is a homomorphism.' : 'So the formula does not even define a function on $' + Z(m2) + '$.'], hint: 'Does $\\varphi$ give the same answer for $0$ and for $' + m2 + '$?' };
    }
    if (shape === 'count') {
      var m3 = R.pick([6, 8, 9, 10, 12, 15, 18, 20]), n3 = R.pick([4, 6, 8, 9, 12, 14, 15, 16]), g = gcd(m3, n3);
      return { q: 'How many homomorphisms are there from $' + Z(m3) + '$ to $' + Z(n3) + '$?', a: num(g),
        steps: ['A homomorphism is fixed by $k = \\varphi(1)$, and any $k$ works as long as $' + m3 + 'k \\equiv 0 \\pmod{' + n3 + '}$ (the order of $k$ divides $' + m3 + '$).', 'The solutions are the multiples of $' + n3 + '/\\gcd(' + m3 + ', ' + n3 + ') = ' + (n3 / g) + '$ in $' + Z(n3) + '$: $' + range(0, g - 1).map(function (j) { return j * n3 / g; }).join(', ') + '$.', 'So there are $\\gcd(' + m3 + ', ' + n3 + ') = ' + g + '$ homomorphisms.'], hint: 'Where can $1$ go? Its image must have order dividing $' + m3 + '$.' };
    }
    if (shape === 'possible') {
      var m4 = R.pick([6, 8, 10, 12, 15]), n4 = R.pick([12, 16, 18, 20, 24]), ks = range(0, n4 - 1).filter(function (k) { return (m4 * k) % n4 === 0; });
      return { q: 'List every possible value of $\\varphi(1)$ for a homomorphism $\\varphi: ' + Z(m4) + ' \\to ' + Z(n4) + '$.', a: setA(ks),
        steps: ['$\\varphi(1)$ must have order dividing $' + m4 + '$, that is, $' + m4 + '\\varphi(1) \\equiv 0 \\pmod{' + n4 + '}$.', 'Those are the multiples of $' + n4 + '/\\gcd(' + m4 + ', ' + n4 + ') = ' + (n4 / gcd(m4, n4)) + '$: $' + ks.join(', ') + '$.'], hint: 'The order of $\\varphi(1)$ divides the order of $1$.' };
    }
    if (shape === 'facts') {
      var f = R.pick([['$\\varphi(e_{G}) = e_{H}$ for every homomorphism $\\varphi: G \\to H$.', true, '$\\varphi(e) = \\varphi(ee) = \\varphi(e)\\varphi(e)$; cancel $\\varphi(e)$.'], ['$\\varphi(a^{-1}) = \\varphi(a)^{-1}$ for every homomorphism.', true, '$\\varphi(a)\\varphi(a^{-1}) = \\varphi(aa^{-1}) = \\varphi(e) = e$.'], ['If $|a| = 6$, then $|\\varphi(a)|$ can be $4$.', false, '$\\varphi(a)^{6} = \\varphi(a^{6}) = e$, so $|\\varphi(a)|$ divides $6$.'], ['A homomorphism can send $\\mathbb{Z}_{6}$ onto $\\mathbb{Z}_{3}$.', true, '$x \\mapsto x \\bmod 3$ is well defined, since $3 \\mid 6$, and onto.'], ['A homomorphism can send $\\mathbb{Z}_{3}$ onto $\\mathbb{Z}_{6}$.', false, 'The image of a cyclic group of order $3$ has order dividing $3$.'], ['The image of an abelian group under a homomorphism is abelian.', true, '$\\varphi(a)\\varphi(b) = \\varphi(ab) = \\varphi(ba) = \\varphi(b)\\varphi(a)$.']]);
      return { q: 'True or false: ' + f[0], a: tf(f[1]), steps: [f[2], f[1] ? 'True.' : 'False.'], hint: 'Use $\\varphi(ab) = \\varphi(a)\\varphi(b)$ with a clever choice of $a$ and $b$.' };
    }
    var fl = R.pick([['"$\\varphi: \\mathbb{Z}_{4} \\to \\mathbb{Z}_{6}$, $\\varphi(x) = x \\bmod 6$, is a homomorphism because $(a + b) \\bmod 6 = (a \\bmod 6) + (b \\bmod 6)$."', 'In $\\mathbb{Z}_{4}$, $3 + 1 = 0$, but $\\varphi(3) + \\varphi(1) = 4 \\ne 0 = \\varphi(0)$: the map ignores that sums wrap around at $4$.', ['Nothing is wrong.', 'It fails because $\\mathbb{Z}_{6}$ is bigger than $\\mathbb{Z}_{4}$.', 'It fails because $\\varphi(0) \\ne 0$.']],
      ['"$\\varphi: \\mathbb{Z} \\to \\mathbb{R}^{*}$, $\\varphi(n) = 2^{n}$, is not a homomorphism, since $\\varphi(1 + 1) = 4 \\ne \\varphi(1) + \\varphi(1)$."', 'The target $\\mathbb{R}^{*}$ uses multiplication, so the test is $\\varphi(a + b) = \\varphi(a)\\varphi(b)$, and $2^{a + b} = 2^{a}2^{b}$ holds: it is a homomorphism.', ['Nothing is wrong.', 'It also fails because $\\varphi(0) = 1 \\ne 0$.', 'It is not a function, since $2^{n}$ is not an integer for $n < 0$.']]]);
    return { q: 'What is wrong with this reasoning?<br>' + fl[0], a: mc(fl[1], fl[2]), steps: [fl[1]], hint: 'Which operation does each group use?' };
  });

  G('aa.kernels-images', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['kernel', 'inj', 'sizes']), R.pick(['image', 'kernel', 'sizes', 'named']), R.pick(['possible', 'image', 'named', 'kernel']));
    var m = R.pick([8, 10, 12, 15, 18, 20, 24]), n = R.pick([6, 8, 9, 10, 12, 15, 18]), ks = range(2, n - 1).filter(function (k) { return (m * k) % n === 0; });
    if (!ks.length) { m = 12; n = 18; ks = [3, 6, 9, 12, 15]; }
    var k = R.pick(ks), ker = range(0, m - 1).filter(function (x) { return (k * x) % n === 0; }), im = sortN(uniqN(range(0, m - 1).map(function (x) { return k * x % n; })));
    var phiTex = '$\\varphi: ' + Z(m) + ' \\to ' + Z(n) + '$, $\\varphi(x) = ' + k + 'x \\bmod ' + n + '$';
    if (shape === 'kernel') return { q: 'Find the kernel of ' + phiTex + '.', a: setA(ker), steps: ['$\\ker\\varphi = \\{x : ' + k + 'x \\equiv 0 \\pmod{' + n + '}\\}$.', '$' + k + 'x$ is a multiple of $' + n + '$ exactly when $x$ is a multiple of $' + n + '/\\gcd(' + k + ', ' + n + ') = ' + (n / gcd(k, n)) + '$.', '$\\ker\\varphi = ' + setTex(ker) + '$, a subgroup of order $' + ker.length + '$.'], hint: 'Solve $' + k + 'x \\equiv 0 \\pmod{' + n + '}$ for $x$ in $' + Z(m) + '$.' };
    if (shape === 'image') return { q: 'Find the image of ' + phiTex + '.', a: setA(im), steps: ['The image is generated by $\\varphi(1) = ' + k + '$: it is $' + gen(k) + '$ in $' + Z(n) + '$.', '$' + gen(k) + ' = ' + setTex(im) + '$.', 'Check: $|\\ker\\varphi| \\cdot |\\operatorname{im}\\varphi| = ' + ker.length + ' \\cdot ' + im.length + ' = ' + m + ' = |' + Z(m) + '|$.'], hint: 'The image of a cyclic group is generated by the image of a generator.' };
    if (shape === 'inj') { var inj = ker.length === 1; return { q: 'Is ' + phiTex + ' one-to-one?', a: tf(inj), steps: ['A homomorphism is one-to-one exactly when its kernel is $\\{0\\}$.', '$\\ker\\varphi = ' + setTex(ker) + '$.', inj ? 'Only $0$, so $\\varphi$ is one-to-one.' : 'It contains more than $0$, so $\\varphi$ is not one-to-one: for example $\\varphi(' + ker[1] + ') = \\varphi(0)$.'], hint: 'Find the kernel.' }; }
    if (shape === 'sizes') {
      var a = R.pick([24, 36, 48, 60, 72, 120]), kk = R.pick(divisors(a).filter(function (x) { return x > 1 && x < a; })), ask = R.coin();
      return { q: ask ? '$\\varphi: G \\to H$ is a homomorphism with $|G| = ' + a + '$ and $|\\ker\\varphi| = ' + kk + '$. How many elements are in the image of $\\varphi$?' : '$\\varphi: G \\to H$ is a homomorphism with $|G| = ' + a + '$ and $|\\operatorname{im}\\varphi| = ' + (a / kk) + '$. How many elements are in $\\ker\\varphi$?', a: num(ask ? a / kk : kk),
        steps: ['Each element of the image is hit by exactly one coset of the kernel ($\\varphi(a) = \\varphi(b) \\iff a^{-1}b \\in \\ker\\varphi$).', 'So $|G| = |\\ker\\varphi| \\cdot |\\operatorname{im}\\varphi|$.', ask ? '$|\\operatorname{im}\\varphi| = ' + a + '/' + kk + ' = ' + (a / kk) + '$.' : '$|\\ker\\varphi| = ' + a + '/' + (a / kk) + ' = ' + kk + '$.'], hint: 'Use $|G| = |\\ker\\varphi|\\,|\\operatorname{im}\\varphi|$.' };
    }
    if (shape === 'named') {
      var it = R.pick([['the sign map $\\operatorname{sgn}: S_{5} \\to \\{1, -1\\}$', 60, 'the even permutations, $A_{5}$, with $5!/2 = 60$ elements'], ['the sign map $\\operatorname{sgn}: S_{4} \\to \\{1, -1\\}$', 12, 'the even permutations, $A_{4}$, with $4!/2 = 12$ elements'], ['$\\varphi: \\mathbb{Z}_{20} \\to \\mathbb{Z}_{5}$, $\\varphi(x) = x \\bmod 5$', 4, '$\\{0, 5, 10, 15\\}$'], ['$\\varphi: D_{6} \\to \\{1, -1\\}$, rotations $\\mapsto 1$ and reflections $\\mapsto -1$', 6, 'the six rotations'], ['$\\varphi: \\mathbb{Z}_{6} \\times \\mathbb{Z}_{4} \\to \\mathbb{Z}_{6}$, $(a, b) \\mapsto a$', 4, '$\\{0\\} \\times \\mathbb{Z}_{4}$'], ['$\\varphi: U(16) \\to U(8)$, $x \\mapsto x \\bmod 8$', 2, '$\\{1, 9\\}$']]);
      return { q: 'How many elements are in the kernel of ' + it[0] + '?', a: num(it[1]), steps: ['The kernel is everything sent to the identity.', 'Here it is ' + it[2] + '.', 'So $|\\ker| = ' + it[1] + '$.'], hint: 'What is the identity of the target group?' };
    }
    var m5 = R.pick([12, 18, 20, 24, 30]), n5 = R.pick([8, 9, 12, 15, 16, 18]), g = gcd(m5, n5);
    return { q: 'List every possible size of the image of a homomorphism $\\varphi: ' + Z(m5) + ' \\to ' + Z(n5) + '$.', a: setA(divisors(g)),
      steps: ['$|\\operatorname{im}\\varphi| = |' + Z(m5) + '|/|\\ker\\varphi|$ divides $' + m5 + '$.', 'The image is a subgroup of $' + Z(n5) + '$, so its size also divides $' + n5 + '$.', 'So it divides $\\gcd(' + m5 + ', ' + n5 + ') = ' + g + '$, and each divisor occurs (send $1$ to an element of that order).', 'Possible sizes: $' + divisors(g).join(', ') + '$.'], hint: 'The image size divides both $' + m5 + '$ and $' + n5 + '$.' };
  });

  var ISOLIST = [ // [tex, factory] groups of order <= 12, so (abelian, order counts) decides isomorphism
    ['\\mathbb{Z}_{4}', function () { return gZ(4); }], ['\\mathbb{Z}_{2} \\times \\mathbb{Z}_{2}', function () { return gZxZ(2, 2); }], ['U(8)', function () { return gU(8); }], ['U(10)', function () { return gU(10); }], ['U(5)', function () { return gU(5); }], ['U(12)', function () { return gU(12); }],
    ['\\mathbb{Z}_{6}', function () { return gZ(6); }], ['S_{3}', function () { return gS3(); }], ['U(7)', function () { return gU(7); }], ['U(9)', function () { return gU(9); }], ['D_{3}', function () { return gD(3); }], ['\\mathbb{Z}_{2} \\times \\mathbb{Z}_{3}', function () { return gZxZ(2, 3); }],
    ['\\mathbb{Z}_{8}', function () { return gZ(8); }], ['\\mathbb{Z}_{2} \\times \\mathbb{Z}_{4}', function () { return gZxZ(2, 4); }], ['D_{4}', function () { return gD(4); }], ['Q_{8}', gQ8], ['U(15)', function () { return gU(15); }], ['U(16)', function () { return gU(16); }], ['U(24)', function () { return gU(24); }],
    ['\\mathbb{Z}_{12}', function () { return gZ(12); }], ['\\mathbb{Z}_{2} \\times \\mathbb{Z}_{6}', function () { return gZxZ(2, 6); }], ['D_{6}', function () { return gD(6); }], ['A_{4}', function () { return gA(4); }], ['U(13)', function () { return gU(13); }], ['\\mathbb{Z}_{3} \\times \\mathbb{Z}_{4}', function () { return gZxZ(3, 4); }]];
  var isoCache = {};
  function isoInfo(i) { if (isoCache[i]) return isoCache[i]; var Gr = ISOLIST[i][1](); return (isoCache[i] = { Gr: Gr, n: Gr.n, ab: isAbelian(Gr), oc: orderCounts(Gr) }); }
  function ocText(oc) { return Object.keys(oc).map(Number).sort(function (a, b) { return a - b; }).map(function (o) { return oc[o] + '\\times\\text{order }' + o; }).join(',\\ '); }
  function sameOC(a, b) { var ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(function (k) { return a[k] === b[k]; }); }
  G('aa.isomorphisms', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['iso', 'iso', 'map']), R.pick(['iso', 'map', 'reason', 'auto']), R.pick(['reason', 'auto', 'iso', 'map2']));
    if (shape === 'iso' || shape === 'reason') {
      var i, j, A, B, tries = 0;
      do { i = R.int(0, ISOLIST.length - 1); j = R.int(0, ISOLIST.length - 1); A = isoInfo(i); B = isoInfo(j); tries++; } while ((i === j || A.n !== B.n || (shape === 'reason' && A.ab === B.ab && sameOC(A.oc, B.oc))) && tries < 300);
      var iso = A.ab === B.ab && sameOC(A.oc, B.oc), why = A.ab !== B.ab ? 'one is abelian and the other is not' : 'they have different numbers of elements of some order';
      if (shape === 'reason') {
        var cycA = !!A.oc[A.n], cycB = !!B.oc[B.n], diffAb = A.ab !== B.ab, diffOc = !sameOC(A.oc, B.oc), diffCyc = cycA !== cycB;
        var firstO = Object.keys(Object.assign({}, A.oc, B.oc)).filter(function (o) { return (A.oc[o] || 0) !== (B.oc[o] || 0); })[0];
        var reasons = [[diffCyc, 'One is cyclic and the other is not.'], [diffAb, 'One is abelian and the other is not.'], [diffOc, 'They have different numbers of elements of order $' + firstO + '$.']];
        var trueR = reasons.filter(function (x) { return x[0]; }).map(function (x) { return x[1]; }), falseR = reasons.filter(function (x) { return !x[0]; }).map(function (x) { return x[1]; });
        var right = trueR[0], wrongs = ['They have different orders.', 'Isomorphic groups must use the same symbols for their elements.'].concat(falseR);
        if (!diffAb && !A.ab) wrongs.push('Neither is abelian, so neither can be isomorphic to anything else of the same order.');
        return { q: 'Why is $' + ISOLIST[i][0] + '$ not isomorphic to $' + ISOLIST[j][0] + '$? Pick the reason that is true.', a: mc(right, wrongs.slice(0, 3)), steps: ['Isomorphisms preserve being cyclic, being abelian, and the number of elements of each order.', '$' + ISOLIST[i][0] + '$: ' + (A.ab ? 'abelian' : 'not abelian') + (cycA ? ', cyclic' : '') + '; $' + ocText(A.oc) + '$.', '$' + ISOLIST[j][0] + '$: ' + (B.ab ? 'abelian' : 'not abelian') + (cycB ? ', cyclic' : '') + '; $' + ocText(B.oc) + '$.', 'True reason' + (trueR.length > 1 ? 's: ' + trueR.map(function (t) { return t.replace(/\.$/, ''); }).join('; ') + '.' : ': ' + right)], hint: 'Compare a property that an isomorphism must preserve.' };
      }
      return { q: 'Are $' + ISOLIST[i][0] + '$ and $' + ISOLIST[j][0] + '$ isomorphic? (Both have order $' + A.n + '$.)', a: tf(iso),
        steps: ['Compare properties an isomorphism preserves: being abelian, and how many elements have each order.', '$' + ISOLIST[i][0] + '$: ' + (A.ab ? 'abelian' : 'not abelian') + '; $' + ocText(A.oc) + '$.', '$' + ISOLIST[j][0] + '$: ' + (B.ab ? 'abelian' : 'not abelian') + '; $' + ocText(B.oc) + '$.', iso ? 'They match. ' + (Object.keys(A.oc).map(Number).indexOf(A.n) >= 0 ? 'Both are cyclic of order $' + A.n + '$, so they are isomorphic (send a generator to a generator).' : 'For groups this small that settles it: they are isomorphic.') : 'They differ: ' + why + ', so they are not isomorphic.'], hint: 'Same order is not enough. Count elements of each order.' };
    }
    if (shape === 'map' || shape === 'map2') {
      var p = R.pick([5, 7, 11, 13]), g = R.pick(units(p).filter(function (a) { return ordMul(a, p) === p - 1; })), k = R.int(2, p - 2), y = powMod(g, k, p);
      if (shape === 'map') return { q: '$\\varphi: ' + Z(p - 1) + ' \\to ' + Un(p) + '$, $\\varphi(k) = ' + g + '^{k} \\bmod ' + p + '$, is an isomorphism. Find $\\varphi(' + k + ')$.', a: num(y), steps: ['$' + g + '$ generates $' + Un(p) + '$, so $\\varphi$ matches the generator $1$ of $' + Z(p - 1) + '$ with $' + g + '$.', '$\\varphi(' + k + ') = ' + g + '^{' + k + '} \\bmod ' + p + ' = ' + y + '$.'], hint: 'Addition in $' + Z(p - 1) + '$ becomes multiplication in $' + Un(p) + '$.' };
      return { q: '$\\varphi: ' + Z(p - 1) + ' \\to ' + Un(p) + '$, $\\varphi(k) = ' + g + '^{k} \\bmod ' + p + '$, is an isomorphism. Find $\\varphi^{-1}(' + y + ')$, the $k$ in $' + Z(p - 1) + '$ with $' + g + '^{k} \\equiv ' + y + '$.', a: num(k), steps: ['List powers of $' + g + '$ mod $' + p + '$: ' + range(1, k).map(function (e) { return '$' + g + '^{' + e + '} \\equiv ' + powMod(g, e, p) + '$'; }).join(', ') + '.', 'So $k = ' + k + '$.'], hint: 'Take powers of $' + g + '$ until you reach $' + y + '$.' };
    }
    var n = R.pick([8, 9, 10, 12, 15, 16, 18, 20]), tgt = R.coin();
    return { q: tgt ? 'How many isomorphisms are there from $' + Z(n) + '$ to itself?' : 'How many elements can an isomorphism $\\varphi: ' + Z(n) + ' \\to ' + Z(n) + '$ send $1$ to?', a: num(phi(n)), steps: ['An isomorphism must send the generator $1$ to a generator, and any choice of generator gives one ($x \\mapsto kx$).', 'The generators of $' + Z(n) + '$ are the $k$ with $\\gcd(k, ' + n + ') = 1$: there are $\\varphi(' + n + ') = ' + phi(n) + '$.'], hint: 'Where can a generator go?' };
  });

  G('aa.cayley-theorem', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['permZ', 'permU', 'cycles', 'permZ']), R.pick(['permU', 'cycles', 'permS3', 'permZ', 'which']), R.pick(['sign', 'permS3', 'cycles', 'which']));
    if (shape === 'permZ' || shape === 'permU') {
      var useU = shape === 'permU', n = useU ? R.pick([8, 10, 12, 15]) : R.pick([4, 5, 6, 8]), els = useU ? units(n) : range(0, n - 1), a = R.pick(els.filter(function (x) { return x !== (useU ? 1 : 0); }));
      var f = function (x) { return useU ? a * x % n : (a + x) % n; }, seen = {}, cyc = [];
      els.forEach(function (x) { if (seen[x]) return; var c = [], y = x; while (!seen[y]) { seen[y] = 1; c.push(y); y = f(y); } if (c.length > 1) cyc.push(c); });
      var ans = labelCycText(cyc);
      return { q: 'Cayley\'s theorem lets $' + a + '$ act on $' + (useU ? Un(n) + ' = ' + setTex(els) : Z(n)) + '$ by $\\lambda_{' + a + '}(x) = ' + (useU ? a + 'x' : a + ' + x') + '$. Write $\\lambda_{' + a + '}$ in cycle notation, using the elements themselves as labels.', a: ans,
        steps: ['Follow each element: ' + els.map(function (x) { return '$' + x + ' \\mapsto ' + f(x) + '$'; }).join(', ') + '.', 'Cycles: $' + cyc.map(function (c) { return '(' + c.join('\\;') + ')'; }).join('') + '$.', 'Every cycle has length $|' + a + '| = ' + (useU ? ordMul(a, n) : ordAdd(a, n)) + '$.'], hint: (useU ? 'Multiply' : 'Add') + ' each element by $' + a + '$ and follow the arrows.' };
    }
    if (shape === 'permS3') {
      var Gr = gS3(), g = R.int(1, Gr.n - 1), lab = range(1, 6), seen2 = {}, cyc2 = [];
      lab.forEach(function (x) { if (seen2[x]) return; var c = [], y = x; while (!seen2[y]) { seen2[y] = 1; c.push(y); y = Gr.mul(g, y - 1) + 1; } if (c.length > 1) cyc2.push(c); });
      return { q: 'Number the elements of $S_{3}$ as ' + range(0, 5).map(function (i) { return '$' + (i + 1) + ' = ' + Gr.tex(i) + '$'; }).join(', ') + '. Write the Cayley permutation $\\lambda_{g}(x) = gx$ for $g = ' + Gr.tex(g) + '$ in cycle notation on the labels $1, \\dots, 6$.', a: labelCycText(cyc2),
        steps: ['Compute $gx$ for each $x$ (apply $x$ first, then $g$): ' + range(0, 5).map(function (i) { return '$' + (i + 1) + ' \\mapsto ' + (Gr.mul(g, i) + 1) + '$'; }).join(', ') + '.', 'Cycles: $' + cyc2.map(function (c) { return '(' + c.join('\\;') + ')'; }).join('') + '$, each of length $|g| = ' + gord(Gr, g) + '$.'], hint: 'Row $g$ of the Cayley table, read as a rearrangement of the column labels, is $\\lambda_{g}$.' };
    }
    if (shape === 'cycles') {
      var N = R.pick([6, 8, 10, 12, 14, 15, 16, 18, 20, 21, 24, 27, 28, 30, 36]), d = R.pick(divisors(N).filter(function (x) { return x > 1; }));
      return { q: 'In a group of order $' + N + '$, an element $g$ has order $' + d + '$. In Cayley\'s permutation $\\lambda_{g}(x) = gx$ of the $' + N + '$ elements, how many cycles are there?', a: num(N / d),
        steps: ['$\\lambda_{g}$ has no fixed points when $g \\ne e$ ($gx = x$ forces $g = e$), and following $x \\to gx \\to g^{2}x \\to \\cdots$ returns to $x$ after exactly $|g| = ' + d + '$ steps.', 'So every cycle has length $' + d + '$; the cycles are the right cosets $' + gen('g') + ' x$.', 'There are $' + N + '/' + d + ' = ' + (N / d) + '$ cycles.'], hint: 'How long is the cycle through $x$?' };
    }
    if (shape === 'which') {
      var n2 = R.int(5, 40);
      return { q: 'Cayley\'s theorem shows that every group of order $' + n2 + '$ is isomorphic to a subgroup of $S_{m}$ for which $m$?', a: num(n2), steps: ['The group acts on its own $' + n2 + '$ elements by $x \\mapsto gx$.', 'Each $\\lambda_{g}$ is a permutation of those $' + n2 + '$ elements, and $g \\mapsto \\lambda_{g}$ is a one-to-one homomorphism.', 'So $G$ is isomorphic to a subgroup of $S_{' + n2 + '}$.'], hint: 'What set does $G$ permute?' };
    }
    var N2 = R.pick([6, 8, 12, 16, 18, 20]), d2 = R.pick(divisors(N2).filter(function (x) { return x > 1; })), c = N2 / d2, even = ((d2 - 1) * c) % 2 === 0;
    return { q: 'In a group of order $' + N2 + '$, $g$ has order $' + d2 + '$. Is Cayley\'s permutation $\\lambda_{g}$ even or odd?', a: mcKeep(['Even', 'Odd'], even ? 0 : 1),
      steps: ['$\\lambda_{g}$ is a product of $' + N2 + '/' + d2 + ' = ' + c + '$ disjoint cycles of length $' + d2 + '$.', 'Each contributes $' + (d2 - 1) + '$ transpositions: $' + c + ' \\cdot ' + (d2 - 1) + ' = ' + (c * (d2 - 1)) + '$ in all.', even ? 'Even.' : 'Odd.'], hint: 'Find the cycle type of $\\lambda_{g}$ first.' };
  });
  function labelCycText(cyc) { // cycle notation over arbitrary number labels (any rotation and order; spaces or commas)
    if (!cyc.length) return txt(ID_WORDS.slice());
    var canon = cyc.map(function (c) { return '(' + c.join(' ') + ')'; }).join(''), out = [canon], seen = {}; seen[canon] = 1;
    var rots = [[]]; cyc.forEach(function (c) { var nx = []; rots.forEach(function (pre) { for (var r = 0; r < c.length; r++) nx.push(pre.concat([c.slice(r).concat(c.slice(0, r))])); }); rots = nx; });
    var big = cyc.some(function (c) { return c.some(function (x) { return x > 9; }); }), seps = big ? [' ', ',', ', '] : [' ', ',', ', ', ''];
    rots.forEach(function (cs) { idxPerms(cs.length).forEach(function (ord) { seps.forEach(function (sp) { ['', ' '].forEach(function (jn) { var t = ord.map(function (k) { return '(' + cs[k].join(sp) + ')'; }).join(jn); if (!seen[t]) { seen[t] = 1; out.push(t); } }); }); }); });
    return txt(out);
  }

  G('aa.first-isomorphism', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['kersize', 'zn', 'kersize']), R.pick(['named', 'map', 'zn', 'kersize']), R.pick(['order', 'map', 'named']));
    if (shape === 'kersize') {
      var h = R.pick([2, 3, 4, 5, 6]), k = R.pick([2, 3, 4, 6, 8]), ask = R.coin();
      return { q: ask ? '$\\varphi: G \\to H$ is a homomorphism <b>onto</b> $H$, with $|G| = ' + (h * k) + '$ and $|H| = ' + h + '$. How many elements does $\\ker\\varphi$ have?' : 'A homomorphism $\\varphi$ maps a group $G$ of order $' + (h * k) + '$ onto a group of order $' + h + '$. How many elements does the quotient $G/\\ker\\varphi$ have?', a: num(ask ? k : h),
        steps: ['First isomorphism theorem: $G/\\ker\\varphi \\cong \\operatorname{im}\\varphi = H$ (the map is onto).', 'So $|G|/|\\ker\\varphi| = |H| = ' + h + '$.', ask ? '$|\\ker\\varphi| = ' + (h * k) + '/' + h + ' = ' + k + '$.' : '$|G/\\ker\\varphi| = ' + h + '$.'], hint: 'Match $G/\\ker\\varphi$ with the image.' };
    }
    if (shape === 'zn') {
      var n = R.pick([12, 18, 20, 24, 30]), d = R.pick(divisors(n).filter(function (x) { return x > 1 && x < n; }));
      return { q: '$' + Z(n) + '/' + gen(d) + ' \\cong \\mathbb{Z}_{m}$ for which $m$?', a: num(d),
        steps: ['$\\varphi: ' + Z(n) + ' \\to ' + Z(d) + '$, $x \\mapsto x \\bmod ' + d + '$, is a well-defined homomorphism (since $' + d + ' \\mid ' + n + '$) and onto.', 'Its kernel is the multiples of $' + d + '$: $' + gen(d) + '$.', 'So $' + Z(n) + '/' + gen(d) + ' \\cong ' + Z(d) + '$, and $m = ' + d + '$.'], hint: 'Reduce mod $' + d + '$.' };
    }
    if (shape === 'map') {
      var m = R.pick([12, 18, 20, 24, 30]), n2 = R.pick([8, 9, 10, 12, 15, 16]), ks = range(1, n2 - 1).filter(function (x) { return (m * x) % n2 === 0; });
      if (!ks.length) { m = 12; n2 = 9; ks = [3, 6]; }
      var k = R.pick(ks), im = ordAdd(k, n2);
      return { q: '$\\varphi: ' + Z(m) + ' \\to ' + Z(n2) + '$ is the homomorphism with $\\varphi(1) = ' + k + '$. By the first isomorphism theorem $' + Z(m) + '/\\ker\\varphi \\cong \\mathbb{Z}_{t}$. Find $|\\ker\\varphi|$.', a: num(m / im),
        steps: ['The image is $' + gen(k) + '$ in $' + Z(n2) + '$, of order $|' + k + '| = ' + n2 + '/\\gcd(' + n2 + ', ' + k + ') = ' + im + '$; so $t = ' + im + '$.', '$|' + Z(m) + '|/|\\ker\\varphi| = ' + im + '$.', 'So $|\\ker\\varphi| = ' + m + '/' + im + ' = ' + (m / im) + '$.'], hint: 'First find the size of the image.' };
    }
    if (shape === 'named') {
      var it = R.pick([['$\\det: GL_{2}(\\mathbb{R}) \\to \\mathbb{R}^{*}$', 'SL_{2}(\\mathbb{R})', '$GL_{2}(\\mathbb{R})/SL_{2}(\\mathbb{R}) \\cong \\mathbb{R}^{*}$', ['$GL_{2}(\\mathbb{R})/SL_{2}(\\mathbb{R}) \\cong \\mathbb{R}$', '$GL_{2}(\\mathbb{R})/SL_{2}(\\mathbb{R}) \\cong \\mathbb{Z}_{2}$', '$GL_{2}(\\mathbb{R})/SL_{2}(\\mathbb{R}) \\cong GL_{1}(\\mathbb{Z})$']],
        ['$\\operatorname{sgn}: S_{n} \\to \\{1, -1\\}$', 'A_{n}', '$S_{n}/A_{n} \\cong \\mathbb{Z}_{2}$', ['$S_{n}/A_{n} \\cong S_{n-1}$', '$S_{n}/A_{n} \\cong \\mathbb{Z}_{n}$', '$S_{n}/A_{n} \\cong A_{n}$']],
        ['$\\varphi: \\mathbb{R}^{*} \\to \\mathbb{R}^{+}$, $\\varphi(x) = |x|$', '\\{1, -1\\}', '$\\mathbb{R}^{*}/\\{1, -1\\} \\cong \\mathbb{R}^{+}$', ['$\\mathbb{R}^{*}/\\{1, -1\\} \\cong \\mathbb{Z}_{2}$', '$\\mathbb{R}^{*}/\\{1, -1\\} \\cong \\mathbb{R}$ under multiplication', '$\\mathbb{R}^{*}/\\{1, -1\\} \\cong \\mathbb{R}^{*}$, since the kernel is small']],
        ['$\\varphi: \\mathbb{Z} \\to \\mathbb{Z}_{n}$, reduction mod $n$', 'n\\mathbb{Z}', '$\\mathbb{Z}/n\\mathbb{Z} \\cong \\mathbb{Z}_{n}$', ['$\\mathbb{Z}/n\\mathbb{Z} \\cong \\mathbb{Z}$', '$\\mathbb{Z}/n\\mathbb{Z} \\cong n\\mathbb{Z}$', '$\\mathbb{Z}/n\\mathbb{Z}$ is infinite']],
        ['$\\varphi: \\mathbb{C}^{*} \\to \\mathbb{R}^{+}$, $\\varphi(z) = |z|$', '\\{z : |z| = 1\\}', '$\\mathbb{C}^{*}/\\{z : |z| = 1\\} \\cong \\mathbb{R}^{+}$', ['$\\mathbb{C}^{*}/\\{z : |z| = 1\\} \\cong \\mathbb{C}$', '$\\mathbb{C}^{*}/\\{z : |z| = 1\\} \\cong \\{z : |z| = 1\\}$', '$\\mathbb{C}^{*}/\\{z : |z| = 1\\} \\cong \\mathbb{Z}_{2}$']],
        ['$\\varphi: \\mathbb{Z}_{4} \\times \\mathbb{Z}_{6} \\to \\mathbb{Z}_{6}$, $(a, b) \\mapsto b$', '\\mathbb{Z}_{4} \\times \\{0\\}', '$(\\mathbb{Z}_{4} \\times \\mathbb{Z}_{6})/(\\mathbb{Z}_{4} \\times \\{0\\}) \\cong \\mathbb{Z}_{6}$', ['$(\\mathbb{Z}_{4} \\times \\mathbb{Z}_{6})/(\\mathbb{Z}_{4} \\times \\{0\\}) \\cong \\mathbb{Z}_{4}$', '$(\\mathbb{Z}_{4} \\times \\mathbb{Z}_{6})/(\\mathbb{Z}_{4} \\times \\{0\\}) \\cong \\mathbb{Z}_{2}$', '$(\\mathbb{Z}_{4} \\times \\mathbb{Z}_{6})/(\\mathbb{Z}_{4} \\times \\{0\\}) \\cong \\mathbb{Z}_{24}$']]]);
      return { q: 'The homomorphism ' + it[0] + ' is onto and has kernel $' + it[1] + '$. What does the first isomorphism theorem give?', a: mc(it[2], it[3]), steps: ['$G/\\ker\\varphi \\cong \\operatorname{im}\\varphi$, and here the image is the whole target.', 'So ' + it[2] + '.'], hint: 'The quotient by the kernel looks like the image.' };
    }
    return orderProblem(R, 'Put the steps of this proof of the first isomorphism theorem in order. ($\\varphi: G \\to H$ is a homomorphism with kernel $K$.)', ['Define $\\psi: G/K \\to \\operatorname{im}\\varphi$ by $\\psi(gK) = \\varphi(g)$.', 'It is well defined: if $gK = g\'K$, then $g^{-1}g\' \\in K$, so $\\varphi(g) = \\varphi(g\')$.', 'It is a homomorphism: $\\psi(gK\\,g\'K) = \\psi(gg\'K) = \\varphi(g)\\varphi(g\')$.', 'It is one-to-one: $\\psi(gK) = e$ means $g \\in K$, so $gK = K$.', 'It is onto $\\operatorname{im}\\varphi$ by construction, so $G/K \\cong \\operatorname{im}\\varphi$.']);
  });


  // ================================================================ unit 6: direct products and abelian groups
  function primePowers(ns) { // elementary divisors of Z_{n1} x ... : list of [p, p^k]
    var out = []; ns.forEach(function (n) { factorize(n).forEach(function (f) { out.push([f[0], M.pow(f[0], f[1])]); }); }); return out;
  }
  function invFactors(ns) { // invariant factors d1 | d2 | ... of Z_{n1} x ... x Z_{nk}
    var byP = {}; primePowers(ns).forEach(function (pp) { (byP[pp[0]] = byP[pp[0]] || []).push(pp[1]); });
    var ps = Object.keys(byP), L = M.max.apply(null, ps.map(function (p) { return byP[p].length; }).concat([0])), d = [];
    ps.forEach(function (p) { byP[p].sort(function (a, b) { return b - a; }); });
    for (var i = 0; i < L; i++) { var x = 1; ps.forEach(function (p) { if (byP[p][i]) x *= byP[p][i]; }); d.push(x); }
    return d.sort(function (a, b) { return a - b; });
  }
  function elemDivs(ns) { return primePowers(ns).map(function (pp) { return pp[1]; }).sort(function (a, b) { return a - b; }); }
  function prodTex(ns) { return ns.map(function (n) { return Z(n); }).join(' \\times '); }
  function prodOrderCount(ns, d) { // elements of order d in Z_{n1} x ... (count by brute force)
    var total = ns.reduce(function (s, n) { return s * n; }, 1), c = 0, idx = ns.map(function () { return 0; });
    for (var t = 0; t < total; t++) { var o = lcmA(idx.map(function (x, i) { return ordAdd(x, ns[i]); })); if (o === d) c++; for (var k = 0; k < idx.length; k++) { idx[k]++; if (idx[k] < ns[k]) break; idx[k] = 0; } }
    return c;
  }
  function numAbelian(n) { return factorize(n).reduce(function (s, f) { return s * nPart(f[1]); }, 1); }

  G('aa.direct-products', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['order', 'cyclic', 'order']), R.pick(['order3', 'count', 'cyclic', 'max']), R.pick(['count', 'iso', 'max', 'order3']));
    if (shape === 'order' || shape === 'order3') {
      var ns = shape === 'order' ? [R.pick([4, 6, 8, 9, 10, 12]), R.pick([6, 8, 9, 12, 15, 18])] : [R.pick([4, 6, 8]), R.pick([6, 9, 10, 12]), R.pick([5, 8, 15, 20])];
      var el = ns.map(function (n) { return R.int(1, n - 1); }), os = el.map(function (x, i) { return ordAdd(x, ns[i]); }), o = lcmA(os);
      return { q: 'Find the order of $(' + el.join(', ') + ')$ in $' + prodTex(ns) + '$.', a: num(o),
        steps: ['The operation works coordinate by coordinate, so $m(' + el.join(', ') + ') = 0$ exactly when $m$ is a multiple of every coordinate\'s order.', 'Orders: ' + el.map(function (x, i) { return '$|' + x + '| = ' + ns[i] + '/\\gcd(' + ns[i] + ', ' + x + ') = ' + os[i] + '$ in $' + Z(ns[i]) + '$'; }).join('; ') + '.', 'So the order is $\\operatorname{lcm}(' + os.join(', ') + ') = ' + o + '$.'], hint: 'Take the lcm of the coordinates\' orders, not their product.' };
    }
    if (shape === 'cyclic') {
      var m = R.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]), n = R.pick([3, 4, 5, 6, 7, 9, 10, 14, 15]), g = gcd(m, n);
      return { q: 'Is $' + Z(m) + ' \\times ' + Z(n) + '$ cyclic?', a: tf(g === 1),
        steps: ['The largest order of an element is $\\operatorname{lcm}(' + m + ', ' + n + ') = ' + lcm(m, n) + '$ (the order of $(1, 1)$).', 'The group has $' + (m * n) + '$ elements, so it is cyclic exactly when $\\operatorname{lcm}(' + m + ', ' + n + ') = ' + m + ' \\cdot ' + n + '$, that is, when $\\gcd(' + m + ', ' + n + ') = 1$.', g === 1 ? '$\\gcd = 1$: it is cyclic, $\\cong ' + Z(m * n) + '$.' : '$\\gcd = ' + g + '$: it is not cyclic.'], hint: 'Compare $\\operatorname{lcm}(' + m + ', ' + n + ')$ with $' + (m * n) + '$.' };
    }
    if (shape === 'count') {
      var ns2 = R.pick([[2, 4], [4, 4], [2, 6], [3, 9], [6, 6], [2, 2, 4], [4, 6], [2, 8], [3, 6]]), ords = {}; var tot = ns2.reduce(function (s, x) { return s * x; }, 1);
      divisors(lcmA(ns2)).forEach(function (d) { ords[d] = prodOrderCount(ns2, d); });
      var d2 = R.pick(Object.keys(ords).map(Number).filter(function (d) { return d > 1 && ords[d] > 0; }));
      return { q: 'How many elements of order $' + d2 + '$ does $' + prodTex(ns2) + '$ have?', a: num(ords[d2]),
        steps: ['An element has order $\\operatorname{lcm}$ of its coordinates\' orders. Count the coordinate choices with lcm exactly $' + d2 + '$.', 'One way: count elements with order dividing $' + d2 + '$ (each coordinate $x$ with $' + d2 + 'x = 0$), then subtract those of smaller orders.', 'Element counts by order: ' + Object.keys(ords).map(function (k) { return 'order ' + k + ': ' + ords[k]; }).join(', ') + ' (total ' + tot + ').', 'So $' + ords[d2] + '$ elements have order $' + d2 + '$.'], hint: 'In $\\mathbb{Z}_{n}$, the elements with $dx = 0$ number $\\gcd(d, n)$.' };
    }
    if (shape === 'max') {
      var ns3 = [R.pick([4, 6, 8, 10]), R.pick([6, 9, 12, 15]), R.pick([2, 5, 7, 14])], mx = lcmA(ns3);
      return { q: 'What is the largest order of an element of $' + prodTex(ns3) + '$?', a: num(mx), steps: ['Orders of coordinates divide $' + ns3.join(', ') + '$, and the order of the element is their lcm.', 'The lcm is as large as possible with $(1, 1, 1)$: $\\operatorname{lcm}(' + ns3.join(', ') + ') = ' + mx + '$.'], hint: 'Use a generator in each coordinate.' };
    }
    var pairs = [[[2, 6], [12]], [[2, 6], [3, 4]], [[3, 4], [12]], [[2, 3], [6]], [[4, 6], [2, 12]], [[4, 6], [24]], [[6, 10], [2, 30]], [[6, 10], [60]], [[9, 6], [3, 18]], [[2, 2, 3], [2, 6]], [[4, 4], [2, 8]], [[5, 6], [30]], [[10, 12], [2, 60]], [[10, 12], [4, 30]]];
    var pr = R.pick(pairs), A = invFactors(pr[0]), B = invFactors(pr[1]), iso = A.join(',') === B.join(',');
    return { q: 'Is $' + prodTex(pr[0]) + ' \\cong ' + prodTex(pr[1]) + '$?', a: tf(iso),
      steps: ['Split each factor into prime-power cyclic groups ($\\mathbb{Z}_{mn} \\cong \\mathbb{Z}_{m} \\times \\mathbb{Z}_{n}$ when $\\gcd(m, n) = 1$).', 'Left: $' + elemDivs(pr[0]).map(function (q) { return Z(q); }).join(' \\times ') + '$. Right: $' + elemDivs(pr[1]).map(function (q) { return Z(q); }).join(' \\times ') + '$.', iso ? 'The lists match, so the groups are isomorphic.' : 'The lists differ, so they are not isomorphic.'], hint: 'Break every factor into prime-power pieces and compare the lists.' };
  });

  G('aa.finite-abelian', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['countp', 'count', 'countp']), R.pick(['count', 'elem', 'which', 'countp']), R.pick(['which', 'elem', 'count', 'o2']));
    if (shape === 'countp') {
      var p = R.pick([2, 3, 5]), a = R.int(2, L === 1 ? 4 : 6), parts = partitions(a);
      return { q: 'How many abelian groups of order $' + p + '^{' + a + '} = ' + M.pow(p, a) + '$ are there, up to isomorphism?', a: num(parts.length),
        steps: ['An abelian group of order $' + p + '^{' + a + '}$ is $\\mathbb{Z}_{' + p + '^{a_1}} \\times \\cdots \\times \\mathbb{Z}_{' + p + '^{a_k}}$ with $a_1 \\ge \\cdots \\ge a_k$ and $a_1 + \\cdots + a_k = ' + a + '$: one group for each partition of $' + a + '$.', 'Partitions of $' + a + '$: ' + parts.map(function (q) { return q.join(' + '); }).join(', ') + '.', 'So there are $' + parts.length + '$.'], hint: 'Count the ways to write $' + a + '$ as a sum of positive integers, ignoring order.' };
    }
    if (shape === 'count') {
      var n = R.pick([24, 36, 48, 72, 100, 108, 144, 200, 360, 64, 81, 1000]), f = factorize(n);
      return { q: 'How many abelian groups of order $' + n + '$ are there, up to isomorphism?', a: num(numAbelian(n)),
        steps: ['$' + n + ' = ' + f.map(function (x) { return x[1] > 1 ? x[0] + '^{' + x[1] + '}' : x[0]; }).join(' \\cdot ') + '$.', 'Choose the part for each prime separately: the number of partitions of each exponent: ' + f.map(function (x) { return 'p(' + x[1] + ') = ' + nPart(x[1]); }).map(function (s) { return '$' + s + '$'; }).join(', ') + '.', 'Multiply: $' + f.map(function (x) { return nPart(x[1]); }).join(' \\cdot ') + ' = ' + numAbelian(n) + '$.'], hint: 'Factor $' + n + '$ and count partitions of each exponent.' };
    }
    if (shape === 'elem') {
      var ns = R.pick([[12, 18], [6, 20], [4, 30], [15, 36], [10, 12], [8, 18], [6, 9, 10]]), ed = elemDivs(ns);
      var fmt = function (a) { return '$' + a.map(function (q) { return Z(q); }).join(' \\times ') + '$'; };
      var merged = (function () { var byP = {}; primePowers(ns).forEach(function (pp) { byP[pp[0]] = (byP[pp[0]] || 1) * pp[1]; }); return Object.keys(byP).map(function (k) { return byP[k]; }).sort(function (a, b) { return a - b; }); })();
      var wrongs = [merged, invFactors(ns), ns.slice().sort(function (a, b) { return a - b; })].map(fmt).filter(function (w, i, arr) { return w !== fmt(ed) && arr.indexOf(w) === i; });
      return { q: 'Which is the elementary divisor (prime power) form of $' + prodTex(ns) + '$?', a: mc(fmt(ed), wrongs),
        steps: ['Split each factor: $\\mathbb{Z}_{mn} \\cong \\mathbb{Z}_{m} \\times \\mathbb{Z}_{n}$ for coprime $m, n$.', ns.map(function (x) { return '$' + Z(x) + ' \\cong ' + factorize(x).map(function (f) { return Z(M.pow(f[0], f[1])); }).join(' \\times ') + '$'; }).join(', ') + '.', 'Collect: ' + fmt(ed) + '.'], hint: 'Factor each order into prime powers.' };
    }
    if (shape === 'which') {
      var base = R.pick([[2, 4, 3], [2, 2, 9], [4, 9], [2, 3, 4, 5], [2, 8, 3], [4, 4, 3], [2, 2, 3, 3]]), target = base.reduce(function (s, x) { return s * x; }, 1);
      var cands = [], tries = 0; var key = invFactors(base).join(',');
      var opts = [[target], [2, target / 2], [3, target / 3], [4, target / 4], [6, target / 6], [2, 2, target / 4], [2, 6, target / 12], [3, 3, target / 9]].filter(function (o) { return o.every(function (x) { return Number.isInteger(x) && x > 1; }); });
      var right = opts.filter(function (o) { return invFactors(o).join(',') === key; }), wrong = opts.filter(function (o) { return invFactors(o).join(',') !== key; });
      if (!right.length) right = [invFactors(base)];
      var pick = R.pick(right);
      return { q: 'Which group is isomorphic to $' + prodTex(base) + '$?', a: mc('$' + prodTex(pick) + '$', R.sample(wrong, M.min(3, wrong.length)).map(function (o) { return '$' + prodTex(o) + '$'; })),
        steps: ['Compare elementary divisors (prime-power factors).', '$' + prodTex(base) + '$: $' + elemDivs(base).map(function (q) { return Z(q); }).join(' \\times ') + '$.', '$' + prodTex(pick) + '$: $' + elemDivs(pick).map(function (q) { return Z(q); }).join(' \\times ') + '$, the same list.', 'The other choices give different lists.'], hint: 'Split every factor into prime powers and compare.' };
    }
    var ns4 = R.pick([[2, 4, 6], [4, 8], [2, 12], [6, 10], [2, 2, 8], [4, 6, 9], [12, 18]]), c2 = prodOrderCount(ns4, 2), k = ns4.filter(function (x) { return x % 2 === 0; }).length;
    return { q: 'How many elements of order $2$ does $' + prodTex(ns4) + '$ have?', a: num(c2),
      steps: ['An element of order dividing $2$ has every coordinate $x$ with $2x = 0$.', 'Each $\\mathbb{Z}_{n}$ with $n$ even has two such $x$ ($0$ and $n/2$); with $n$ odd, only $0$. Here $' + k + '$ factors are even.', 'So $2^{' + k + '} = ' + M.pow(2, k) + '$ elements satisfy $2x = 0$; leave out the identity: $' + c2 + '$.'], hint: 'Count solutions of $2x = 0$ coordinate by coordinate.' };
  });

  G('aa.invariant-factors', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['convert', 'convert', 'exp']), R.pick(['convert', 'decide', 'exp', 'fromelem']), R.pick(['decide', 'countord', 'fromelem', 'list']));
    var pool = [[2, 4, 3], [2, 4, 9, 3], [4, 6], [6, 10], [12, 18], [2, 3, 4, 5, 6], [6, 15, 20], [4, 6, 9], [2, 2, 3, 3], [8, 12], [10, 15], [9, 12, 2], [6, 8], [4, 10], [6, 9], [10, 20], [12, 30], [8, 18], [6, 14], [4, 6, 10], [2, 6, 9], [15, 25], [6, 12, 4], [20, 30], [9, 15], [12, 16]];
    if (shape === 'convert' || shape === 'fromelem') {
      var ns = shape === 'convert' ? R.pick(pool) : R.pick([[2, 4, 3, 9], [2, 2, 3, 5], [4, 2, 2, 3, 3], [8, 2, 3, 9, 5], [2, 4, 8, 3], [4, 4, 5, 25], [2, 3, 3, 9]]), d = invFactors(ns);
      return { q: 'Write $' + prodTex(ns) + '$ in invariant factor form $\\mathbb{Z}_{d_1} \\times \\cdots \\times \\mathbb{Z}_{d_k}$ with $d_1 \\mid d_2 \\mid \\cdots \\mid d_k$. Type $(d_1, \\dots, d_k)$.', a: tup(d),
        steps: ['Split into prime powers: $' + elemDivs(ns).map(function (q) { return Z(q); }).join(' \\times ') + '$.', 'Build $d_k$ from the largest power of each prime, $d_{k-1}$ from the next largest, and so on.', 'Result: $' + prodTex(d) + '$, and each $d_i$ divides the next.'], hint: 'Line the prime powers up by size, largest first, one row per prime.' };
    }
    if (shape === 'exp') {
      var ns2 = R.pick(pool), d2 = invFactors(ns2);
      return { q: 'What is the largest order of an element of $' + prodTex(ns2) + '$?', a: num(d2[d2.length - 1]),
        steps: ['In invariant factor form the group is $' + prodTex(d2) + '$.', 'Every $d_i$ divides $d_k = ' + d2[d2.length - 1] + '$, so no element has larger order, and $(0, \\dots, 0, 1)$ has order $' + d2[d2.length - 1] + '$.', 'Equivalently: $\\operatorname{lcm}(' + ns2.join(', ') + ') = ' + lcmA(ns2) + '$.'], hint: 'The largest invariant factor, or the lcm of the orders.' };
    }
    if (shape === 'decide') {
      var A = R.pick(pool), At = A.reduce(function (s, x) { return s * x; }, 1), cands = pool.filter(function (B) { return B.reduce(function (s, x) { return s * x; }, 1) === At && B.join() !== A.join(); });
      var dA = invFactors(A), B = cands.length && R.coin() ? R.pick(cands) : R.coin() || dA.length < 2 ? dA : [dA[0] * dA[1]].concat(dA.slice(2));
      var iso = invFactors(A).join() === invFactors(B).join();
      return { q: 'Is $' + prodTex(A) + ' \\cong ' + prodTex(B) + '$?', a: tf(iso),
        steps: ['Put both in invariant factor form; abelian groups are isomorphic exactly when these match.', 'Left: $' + prodTex(invFactors(A)) + '$. Right: $' + prodTex(invFactors(B)) + '$.', iso ? 'They match: isomorphic.' : 'They differ: not isomorphic.'], hint: 'Compare invariant factors (or elementary divisors).' };
    }
    if (shape === 'countord') {
      var ns3 = R.pick([[2, 4], [4, 4], [2, 8], [3, 9], [2, 2, 4], [6, 6], [3, 3, 3]]), d3 = R.pick(divisors(lcmA(ns3)).filter(function (x) { return x > 1 && prodOrderCount(ns3, x) > 0; }));
      return { q: 'How many elements of order $' + d3 + '$ does $' + prodTex(ns3) + '$ have?', a: num(prodOrderCount(ns3, d3)),
        steps: ['Count elements with $' + d3 + 'x = 0$: in $\\mathbb{Z}_{n}$ there are $\\gcd(' + d3 + ', n)$ of them, so here $' + ns3.map(function (n) { return gcd(d3, n); }).join(' \\cdot ') + ' = ' + ns3.reduce(function (s, n) { return s * gcd(d3, n); }, 1) + '$.', 'Subtract those whose order is a proper divisor of $' + d3 + '$: ' + divisors(d3).filter(function (x) { return x < d3; }).map(function (x) { return 'order ' + x + ': ' + prodOrderCount(ns3, x); }).join(', ') + '.', 'Elements of order exactly $' + d3 + '$: $' + prodOrderCount(ns3, d3) + '$.'], hint: 'First count the $x$ with $' + d3 + 'x = 0$.' };
    }
    var N = R.pick([24, 36, 48, 72, 54, 40, 100]), fN = factorize(N), all = [[]];
    fN.forEach(function (f) { var nx = []; partitions(f[1]).forEach(function (pt) { all.forEach(function (pre) { nx.push(pre.concat(pt.map(function (e) { return M.pow(f[0], e); }))); }); }); all = nx; });
    var goodL = invFactors(R.pick(all.filter(function (x) { return invFactors(x).length > 1; }).concat([all[all.length - 1]]))), fmt2 = function (x) { return '$' + prodTex(x) + '$'; };
    var w1 = goodL.slice().reverse(), w2 = goodL.slice(0, -1).concat([goodL[goodL.length - 1] * fN[0][0]]), w3 = (function () { var q = fN[fN.length - 1][0], x = goodL.slice(); if (x.length > 1 && x[x.length - 1] % q === 0) { x[0] *= q; x[x.length - 1] /= q; } return x; })();
    var bad = function (x) { return x.reduce(function (u, y) { return u * y; }, 1) !== N || x.some(function (y, i) { return i && y % x[i - 1]; }); }, wr = [w1, w2, w3].filter(function (x) { return x.join() !== goodL.join() && bad(x); }).map(fmt2);
    return { q: 'Which of these is an abelian group of order $' + N + '$ written in invariant factor form (each order dividing the next)?', a: mc(fmt2(goodL), wr),
      steps: ['Two things to check: the orders multiply to $' + N + '$, and each $d_i$ divides $d_{i+1}$.', fmt2(goodL) + ': $' + goodL.join(' \\cdot ') + ' = ' + N + '$ and ' + goodL.slice(0, -1).map(function (d, i) { return '$' + d + ' \\mid ' + goodL[i + 1] + '$'; }).join(', ') + '.', 'Each of the others either has the wrong order or has a factor that does not divide the next one.'], hint: 'Multiply the orders, then check divisibility from left to right.' };
  });

  // ================================================================ unit 7: group actions and counting
  var SOLIDS = [['a cube', 24, [['faces', 6, 4], ['vertices', 8, 3], ['edges', 12, 2]]], ['a regular tetrahedron', 12, [['faces', 4, 3], ['vertices', 4, 3], ['edges', 6, 2]]], ['a regular octahedron', 24, [['faces', 8, 3], ['vertices', 6, 4], ['edges', 12, 2]]], ['a regular dodecahedron', 60, [['faces', 12, 5], ['vertices', 20, 3], ['edges', 30, 2]]], ['a regular icosahedron', 60, [['faces', 20, 3], ['vertices', 12, 5], ['edges', 30, 2]]]];
  function orbitOf(gens, n, x) { var O = [x], fr = [x]; while (fr.length) { var nx = []; fr.forEach(function (y) { gens.forEach(function (g) { var z = g[y - 1] + 1; if (O.indexOf(z) < 0) { O.push(z); nx.push(z); } }); }); fr = nx; } return sortN(O); }

  G('aa.group-actions', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['orbit', 'orbit', 'stabD']), R.pick(['orbits', 'fixed', 'stabD', 'orbit']), R.pick(['fixed', 'isact', 'orbits', 'stabS']));
    if (shape === 'orbit') {
      var n = R.pick([6, 7, 8]), gens = [pfrom(randCycles(R, n, R.pick([[3], [2], [2, 2], [3, 2]])), n), pfrom(randCycles(R, n, R.pick([[2], [3]])), n)].slice(0, L === 1 ? 1 : 2), x = R.int(1, n), O = orbitOf(gens, n, x);
      return { q: 'The group $H = ' + gen(gens.map(pTex).join(', ')) + '$ acts on $\\{1, \\dots, ' + n + '\\}$. Find the orbit of $' + x + '$.', a: setA(O),
        steps: ['The orbit is everywhere $' + x + '$ can be sent by applying the generators again and again.', 'Start with $' + x + '$ and apply each generator to everything found so far until nothing new appears.', 'Orbit: $' + setTex(O) + '$.'], hint: 'Follow $' + x + '$ through the cycles of the generators.' };
    }
    if (shape === 'orbits') {
      var n2 = R.pick([6, 7, 8, 9]), s = randDerangedish(R, n2, 3), cyc = pcycles(s), k = n2 - sum(cyc.map(function (c) { return c.length; })) + cyc.length;
      return { q: 'The cyclic group $' + gen('\\sigma') + '$ with $\\sigma = ' + pTex(s) + '$ acts on $\\{1, \\dots, ' + n2 + '\\}$. How many orbits are there?', a: num(k),
        steps: ['The orbit of $x$ under $' + gen('\\sigma') + '$ is the cycle of $\\sigma$ through $x$.', 'Cycles: $' + pTex(s) + '$' + (k > cyc.length ? ', plus $' + (k - cyc.length) + '$ fixed point' + (k - cyc.length > 1 ? 's' : '') + ' (each its own orbit)' : '') + '.', 'Total: $' + k + '$ orbits.'], hint: 'Do not forget the fixed points.' };
    }
    if (shape === 'stabD') {
      var n3 = R.pick([4, 5, 6, 8]), what = R.pick(['vertex', 'edge']);
      return { q: '$D_{' + n3 + '}$ (with $' + (2 * n3) + '$ elements) acts on the ' + (what === 'vertex' ? 'vertices' : 'edges') + ' of a regular ' + n3 + '-gon. How many elements are in the stabilizer of one ' + what + '?', a: num(2), viz: { name: 'aa-dihedral', opts: { n: n3, mode: 'orbit', target: what, quiet: true } },
        steps: ['A rotation other than $e$ moves every ' + what + '.', 'Exactly one reflection fixes the given ' + what + ': the one whose mirror line passes through ' + (what === 'vertex' ? 'that vertex' : 'the midpoint of that edge') + '.', 'So the stabilizer is $\\{e, \\text{that reflection}\\}$, with $2$ elements.'], hint: 'Which symmetries leave that ' + what + ' where it is?' };
    }
    if (shape === 'stabS') {
      var n4 = R.int(4, 7), k4 = R.int(1, n4 - 2), st = fact(k4) * fact(n4 - k4);
      return { q: '$S_{' + n4 + '}$ acts on the ' + k4 + '-element subsets of $\\{1, \\dots, ' + n4 + '\\}$. How many elements are in the stabilizer of $\\{1, \\dots, ' + k4 + '\\}$?', a: num(st),
        steps: ['A permutation fixes the set $\\{1, \\dots, ' + k4 + '\\}$ when it permutes those ' + k4 + ' numbers among themselves and the other ' + (n4 - k4) + ' among themselves.', 'That gives $' + k4 + '! \\cdot ' + (n4 - k4) + '! = ' + st + '$ permutations.'], hint: 'Fixing a set is not fixing each of its points.' };
    }
    if (shape === 'fixed') {
      var n5 = R.pick([4, 5, 6]), s5 = randDerangedish(R, n5, 2), pairs = []; for (var i = 1; i <= n5; i++) for (var j = i + 1; j <= n5; j++) pairs.push([i, j]);
      var fx = pairs.filter(function (pq) { var a = s5[pq[0] - 1] + 1, b = s5[pq[1] - 1] + 1; return (a === pq[0] && b === pq[1]) || (a === pq[1] && b === pq[0]); });
      return { q: '$S_{' + n5 + '}$ acts on the $' + pairs.length + '$ two-element subsets of $\\{1, \\dots, ' + n5 + '\\}$. How many of them does $\\sigma = ' + pTex(s5) + '$ fix?', a: num(fx.length),
        steps: ['$\\sigma$ fixes $\\{a, b\\}$ when it either fixes both $a$ and $b$, or swaps them (a 2-cycle of $\\sigma$).', fx.length ? 'Fixed: ' + fx.map(function (pq) { return '$\\{' + pq[0] + ', ' + pq[1] + '\\}$'; }).join(', ') + '.' : 'No pair qualifies.', 'Count: $' + fx.length + '$.'], hint: 'Pairs of fixed points, plus the 2-cycles of $\\sigma$.' };
    }
    var it = R.pick([['$\\mathbb{Z}$ acting on $\\mathbb{R}$ by $n \\cdot x = x + n$', true, '$0 \\cdot x = x$ and $m \\cdot (n \\cdot x) = x + n + m = (m + n) \\cdot x$.'], ['$G$ acting on itself by $g \\cdot x = xg$', false, '$g \\cdot (h \\cdot x) = xhg$ but $(gh) \\cdot x = xgh$; these differ when $g$ and $h$ do not commute.'],
      ['$G$ acting on itself by $g \\cdot x = gxg^{-1}$', true, '$e \\cdot x = x$, and $g \\cdot (h \\cdot x) = ghxh^{-1}g^{-1} = (gh)x(gh)^{-1}$.'], ['$G$ acting on itself by $g \\cdot x = xg^{-1}$', true, '$g \\cdot (h \\cdot x) = xh^{-1}g^{-1} = x(gh)^{-1} = (gh) \\cdot x$.'],
      ['$\\mathbb{R}^{*}$ acting on $\\mathbb{R}$ by $a \\cdot x = x + a$', false, 'The group operation of $\\mathbb{R}^{*}$ is multiplication, but $a \\cdot (b \\cdot x) = x + a + b$, while $(ab) \\cdot x = x + ab$.'], ['$GL_{2}(\\mathbb{R})$ acting on $\\mathbb{R}^{2}$ by $A \\cdot v = Av$', true, '$Iv = v$ and $A(Bv) = (AB)v$.']]);
    return { q: 'Is this a group action? ' + it[0] + '.', a: tf(it[1]), steps: ['Check $e \\cdot x = x$ and $g \\cdot (h \\cdot x) = (gh) \\cdot x$.', it[2], it[1] ? 'So it is an action.' : 'So it is not an action.'], hint: 'Test the rule $g \\cdot (h \\cdot x) = (gh) \\cdot x$.' };
  });

  G('aa.orbit-stabilizer', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['solid', 'solid', 'dn']), R.pick(['solid', 'subsets', 'centr', 'dn']), R.pick(['fixpt', 'centr', 'subsets', 'solid']));
    if (shape === 'solid') {
      var s = R.pick(SOLIDS), o = R.pick(s[2]), ask = R.int(0, 2);
      var q = ask === 0 ? 'The rotation group of ' + s[0] + ' has $' + s[1] + '$ elements, and its ' + o[0] + ' form one orbit of size $' + o[1] + '$. How many rotations fix a given one of the ' + o[0] + '?' : ask === 1 ? 'The rotations of ' + s[0] + ' that fix a given one of its ' + o[0] + ' form a group of order $' + o[2] + '$, and there are $' + o[1] + '$ ' + o[0] + '. How many rotations does ' + s[0] + ' have?' : 'The rotation group of ' + s[0] + ' has $' + s[1] + '$ elements, and the rotations fixing a given one of its ' + o[0] + ' number $' + o[2] + '$. How many ' + o[0] + ' are there (all in one orbit)?';
      var ans = ask === 0 ? o[2] : ask === 1 ? s[1] : o[1];
      return { q: q, a: num(ans), steps: ['Orbit–stabilizer: $|G| = |\\text{orbit}| \\cdot |\\text{stabilizer}|$.', '$' + s[1] + ' = ' + o[1] + ' \\cdot ' + o[2] + '$.', 'So the missing number is $' + ans + '$.'], hint: 'Two of $|G|$, the orbit size and the stabilizer size are known; the third follows.' };
    }
    if (shape === 'dn') {
      var n = R.int(5, 12);
      return { q: '$D_{' + n + '}$ acts on the vertices of a regular ' + n + '-gon. The stabilizer of a vertex has $2$ elements. Use orbit–stabilizer to find $|D_{' + n + '}|$.', a: num(2 * n), viz: { name: 'aa-dihedral', opts: { n: n, mode: 'orbit', target: 'vertex', quiet: true } },
        steps: ['Rotations carry vertex $1$ to every vertex, so the orbit has $' + n + '$ elements.', 'The stabilizer is $\\{e, s\\}$ ($s$ the reflection through vertex $1$).', '$|D_{' + n + '}| = ' + n + ' \\cdot 2 = ' + (2 * n) + '$.'], hint: 'How big is the orbit of a vertex?' };
    }
    if (shape === 'subsets') {
      var n2 = R.int(5, 8), k = R.int(2, n2 - 2), C = U.nCr(n2, k), st = fact(n2) / C;
      return { q: '$S_{' + n2 + '}$ acts on the $' + k + '$-element subsets of $\\{1, \\dots, ' + n2 + '\\}$, and the stabilizer of one subset has $' + st + '$ elements. How many subsets are in its orbit?', a: num(C),
        steps: ['$|\\text{orbit}| = |S_{' + n2 + '}| / |\\text{stabilizer}| = ' + fact(n2) + '/' + st + ' = ' + C + '$.', 'Check: every ' + k + '-subset can be reached, and there are $\\binom{' + n2 + '}{' + k + '} = ' + C + '$ of them.'], hint: 'Divide $|S_{' + n2 + '}| = ' + n2 + '!$ by the stabilizer\'s size.' };
    }
    if (shape === 'centr') {
      var n3 = R.int(4, 6), tps = typesOf(n3).filter(function (t) { return t.length; }), tp = R.pick(tps), cls = typeCount(n3, tp), cen = fact(n3) / cls;
      return { q: 'In $S_{' + n3 + '}$, a permutation of cycle type ' + tp.join(', ') + ' commutes with exactly $' + cen + '$ permutations. How many permutations are conjugate to it?', a: num(cls),
        steps: ['Conjugation is an action of $S_{' + n3 + '}$ on itself; the stabilizer of $\\sigma$ is its centralizer $C(\\sigma)$, and the orbit is its conjugacy class.', '$|\\text{class}| = ' + n3 + '!/|C(\\sigma)| = ' + fact(n3) + '/' + cen + ' = ' + cls + '$.', 'Check: the permutations of that cycle type number $' + cls + '$.'], hint: 'Orbit size = group size / stabilizer size.' };
    }
    var gO = [R.pick([9, 15, 21, 25, 27, 33, 35, 49, 55]), R.int(5, 23)], divs = divisors(gO[0]), N = gO[1];
    var canNoFixed = (function () { var ok = [true]; for (var s2 = 1; s2 <= N; s2++) { ok[s2] = divs.some(function (d) { return d > 1 && d <= s2 && ok[s2 - d]; }); } return ok[N]; })();
    return { q: 'A group of order $' + gO[0] + '$ acts on a set with $' + N + '$ elements. Must some element be fixed by the whole group?', a: tf(!canNoFixed),
      steps: ['Orbit sizes divide $' + gO[0] + '$: they can be $' + divs.join(', ') + '$, and a fixed point is an orbit of size $1$.', 'The orbits add up to $' + N + '$.', canNoFixed ? '$' + N + '$ can be written as a sum of the sizes larger than 1 (for example ' + (function () { var ok = [[]]; for (var s2 = 1; s2 <= N; s2++) { ok[s2] = null; for (var t = 0; t < divs.length; t++) { var d = divs[t]; if (d > 1 && d <= s2 && ok[s2 - d]) { ok[s2] = ok[s2 - d].concat([d]); break; } } } return '$' + ok[N].join(' + ') + '$'; })() + '), so a fixed point is not forced.' : '$' + N + '$ cannot be written as a sum of sizes larger than $1$, so some orbit has size $1$: a fixed point.'], hint: 'Which orbit sizes are possible, and can they add up to $' + N + '$ without any 1s?' };
  });

  G('aa.class-equation', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['clsize', 'center', 'conj']), R.pick(['numcl', 'clsize', 'center', 'eq']), R.pick(['eq', 'pgroup', 'numcl', 'conj']));
    if (shape === 'clsize') {
      var n = R.int(4, 6), tp = R.pick(typesOf(n).filter(function (t) { return t.length; })), c = typeCount(n, tp);
      return { q: 'How many elements are in the conjugacy class of a permutation of cycle type ' + tp.join(', ') + ' in $S_{' + n + '}$?', a: num(c),
        steps: ['In $S_{n}$, two permutations are conjugate exactly when they have the same cycle type ($\\sigma\\tau\\sigma^{-1}$ just renames the entries of $\\tau$).', 'So the class is all permutations of that type: $' + c + '$ of them.'], hint: 'Count permutations with the same cycle type.' };
    }
    var keys = ['S3', 'D4', 'D5', 'D6', 'Q8', 'A4'], key = R.pick(keys), Gr = grp(key), classes = []; var seen = {};
    for (var x = 0; x < Gr.n; x++) { if (seen[x]) continue; var C = conjClass(Gr, x); C.forEach(function (y) { seen[y] = 1; }); classes.push(C); }
    var sizes = classes.map(function (C) { return C.length; }).sort(function (a, b) { return a - b; }), Zs = center(Gr).length;
    if (shape === 'center') return { q: 'How many elements are in the center $Z(' + SMALL[key][0] + ')$?', a: num(Zs), steps: ['$Z(G)$ is the set of elements that commute with everything; each one is a conjugacy class by itself.', 'Here: $Z = ' + setTexG(Gr, center(Gr)) + '$.', 'So $|Z| = ' + Zs + '$.'], hint: 'Which elements commute with every element?' };
    if (shape === 'numcl') {
      var useS = R.coin(), n2 = R.int(3, 7);
      if (useS) return { q: 'How many conjugacy classes does $S_{' + n2 + '}$ have?', a: num(nPart(n2)), steps: ['Classes of $S_{n}$ are the cycle types, which match the partitions of $n$.', 'Partitions of $' + n2 + '$: ' + partitions(n2).map(function (p) { return p.join('+'); }).join(', ') + '.', 'So there are $' + nPart(n2) + '$ classes.'], hint: 'Count partitions of $' + n2 + '$.' };
      return { q: 'How many conjugacy classes does $' + SMALL[key][0] + '$ have?', a: num(classes.length), steps: ['Group the elements into classes $\\{gxg^{-1}\\}$: ' + classes.map(function (C) { return '$' + setTexG(Gr, C) + '$'; }).join(', ') + '.', 'There are $' + classes.length + '$.'], hint: 'Central elements are classes by themselves; then conjugate the rest.' };
    }
    if (shape === 'eq') return { q: 'Write the class equation of $' + SMALL[key][0] + '$: the sizes of its conjugacy classes, in increasing order (including the $1$s for central elements). Type them as $(1, 1, \\dots)$.', a: tup(sizes),
      steps: ['The classes: ' + classes.map(function (C) { return '$' + setTexG(Gr, C) + '$'; }).join(', ') + '.', '$' + Gr.n + ' = ' + sizes.join(' + ') + '$.', 'Each size divides $|G| = ' + Gr.n + '$, and the $1$s are the $' + Zs + '$ central elements.'], hint: 'Find the center first, then conjugate each remaining element.' };
    if (shape === 'pgroup') {
      var p = R.pick([2, 3, 5]), it = R.pick([['A nonabelian group of order $' + (p * p * p) + '$', [p], 'Its center is nontrivial (class equation), and $G/Z(G)$ cannot be cyclic unless $G$ is abelian; so $|Z| \\ne ' + (p * p) + '$ and $|Z| \\ne ' + (p * p * p) + '$.'], ['A group of order $' + (p * p) + '$', [p * p], 'Its center has order $' + p + '$ or $' + (p * p) + '$; if $' + p + '$, then $G/Z(G)$ is cyclic of order $' + p + '$, forcing $G$ abelian, so $Z = G$.']]);
      return { q: it[0] + ' has a center of what order? List every possible value.', a: setA(it[1]), steps: ['By the class equation, a group of prime-power order has a center with more than one element: every class size outside the center is a power of $' + p + '$ larger than $1$, so $|Z(G)|$ is divisible by $' + p + '$.', it[2], 'So $|Z(G)| = ' + it[1].join(' $ or $ ') + '$.'], hint: 'Use the class equation mod $' + p + '$, and the fact that $G/Z(G)$ cyclic forces $G$ abelian.' };
    }
    var n3 = R.pick([5, 6, 7]), s = randDerangedish(R, n3, 3), t = pfrom(randCycles(R, n3, R.pick([[3], [2, 2], [4], [3, 2]])), n3), c2 = pcomp(pcomp(s, t), pinv(s));
    return { q: 'In $S_{' + n3 + '}$ let $\\sigma = ' + pTex(s) + '$ and $\\tau = ' + pTex(t) + '$. Find the conjugate $\\sigma\\tau\\sigma^{-1}$ in cycle notation.', a: permText(c2),
      steps: ['$\\sigma\\tau\\sigma^{-1}$ is $\\tau$ with each entry $i$ replaced by $\\sigma(i)$.', 'Replace: ' + pcycles(t).map(function (cy) { return '$(' + cy.join('\\;') + ') \\to (' + cy.map(function (x2) { return s[x2 - 1] + 1; }).join('\\;') + ')$'; }).join(', ') + '.', 'So $\\sigma\\tau\\sigma^{-1} = ' + pTex(c2) + '$: the same cycle type, as conjugates must have.'], hint: 'Rename every entry of $\\tau$ by applying $\\sigma$ to it.' };
  });

  // Burnside counts
  function necklaces(n, k) { var s = 0; divisors(n).forEach(function (d) { s += phi(d) * M.pow(k, n / d); }); return s / n; }
  function bracelets(n, k) { var r = necklaces(n, k) * n, f = n % 2 ? n * M.pow(k, (n + 1) / 2) : (n / 2) * (M.pow(k, n / 2 + 1) + M.pow(k, n / 2)); return (r + f) / (2 * n); }
  G('aa.burnside', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['fix', 'neck', 'square']), R.pick(['neck', 'square', 'squareD', 'flaw']), R.pick(['brace', 'cube', 'squareD', 'neck2']));
    if (shape === 'fix') {
      var n = R.pick([4, 6, 8, 9, 10, 12]), k = R.pick([2, 3]), j = R.int(1, n - 1), g = gcd(n, j);
      return { q: 'A necklace has $' + n + '$ beads in a circle, each one of $' + k + '$ colors. How many colorings are fixed by the rotation by $' + j + '$ bead' + (j > 1 ? 's' : '') + '?', a: num(M.pow(k, g)), viz: { name: 'aa-burnside', opts: { shape: 'necklace', n: n, k: k, g: j, quiet: true } },
        steps: ['A coloring is fixed when every bead has the same color as the bead $' + j + '$ steps along.', 'The rotation splits the beads into $\\gcd(' + n + ', ' + j + ') = ' + g + '$ cycles of length $' + (n / g) + '$; each cycle must be one color.', 'So $' + k + '^{' + g + '} = ' + M.pow(k, g) + '$ colorings are fixed.'], hint: 'How many cycles does the rotation have on the beads?' };
    }
    if (shape === 'neck' || shape === 'neck2') {
      var n2 = shape === 'neck' ? R.int(3, 8) : R.int(6, 12), k2 = R.pick([2, 3, 4]), tot = necklaces(n2, k2);
      return { q: 'How many different necklaces of $' + n2 + '$ beads can be made with $' + k2 + '$ colors, if two necklaces are the same when one is a rotation of the other?', a: num(tot), viz: { name: 'aa-burnside', opts: { shape: 'necklace', n: n2, k: k2, quiet: true } },
        steps: ['Burnside: the number of orbits is the average number of fixed colorings over the $' + n2 + '$ rotations.', 'Rotation by $j$ fixes $' + k2 + '^{\\gcd(' + n2 + ', j)}$ colorings: ' + range(0, n2 - 1).map(function (j) { return '$' + M.pow(k2, gcd(n2, j)) + '$'; }).join(', ') + '.', 'Average: $(' + range(0, n2 - 1).map(function (j) { return M.pow(k2, gcd(n2, j)); }).join(' + ') + ')/' + n2 + ' = ' + (tot * n2) + '/' + n2 + ' = ' + tot + '$.'], hint: 'Add up the fixed colorings of all rotations, then divide by $' + n2 + '$.' };
    }
    if (shape === 'brace') {
      var n3 = R.int(4, 8), k3 = R.pick([2, 3]), tot3 = bracelets(n3, k3), refl = n3 % 2 ? n3 + ' reflections each fix $' + k3 + '^{' + ((n3 + 1) / 2) + '}$' : (n3 / 2) + ' reflections through two beads fix $' + k3 + '^{' + (n3 / 2 + 1) + '}$ each and ' + (n3 / 2) + ' through two gaps fix $' + k3 + '^{' + (n3 / 2) + '}$ each';
      return { q: 'How many bracelets of $' + n3 + '$ beads can be made with $' + k3 + '$ colors, if rotations <b>and</b> flips count as the same (the group $D_{' + n3 + '}$)?', a: num(tot3), viz: { name: 'aa-burnside', opts: { shape: 'necklace', n: n3, k: k3, group: 'dihedral', quiet: true } },
        steps: ['Burnside over the $' + (2 * n3) + '$ elements of $D_{' + n3 + '}$.', 'Rotations fix $' + range(0, n3 - 1).map(function (j) { return M.pow(k3, gcd(n3, j)); }).join(' + ') + ' = ' + (necklaces(n3, k3) * n3) + '$ colorings in all.', 'Reflections: ' + refl + ', for $' + (tot3 * 2 * n3 - necklaces(n3, k3) * n3) + '$.', 'Average: $' + (tot3 * 2 * n3) + '/' + (2 * n3) + ' = ' + tot3 + '$.'], hint: 'Do the rotations as for necklaces, then count what each reflection fixes.' };
    }
    if (shape === 'square' || shape === 'squareD') {
      var k4 = R.int(2, 6), dih = shape === 'squareD', rot = M.pow(k4, 4) + 2 * k4 + M.pow(k4, 2), ref = 2 * M.pow(k4, 3) + 2 * M.pow(k4, 2), tot4 = dih ? (rot + ref) / 8 : rot / 4;
      return { q: 'The four corners of a square are each colored with one of $' + k4 + '$ colors. How many colorings are there up to ' + (dih ? 'rotations and reflections (the group $D_{4}$)' : 'rotation') + '?', a: num(tot4), viz: { name: 'aa-burnside', opts: { shape: 'square', k: k4, group: dih ? 'dihedral' : 'rotation', quiet: true } },
        steps: ['Burnside: average the number of fixed colorings over the group.', 'Rotations: $e$ fixes $' + k4 + '^{4} = ' + M.pow(k4, 4) + '$; the quarter turns (one 4-cycle) fix $' + k4 + '$ each; the half turn (two 2-cycles) fixes $' + k4 + '^{2} = ' + (k4 * k4) + '$.'].concat(dih ? ['Reflections: the two diagonal mirrors (two fixed corners and a 2-cycle) fix $' + k4 + '^{3}$ each; the two side mirrors (two 2-cycles) fix $' + k4 + '^{2}$ each.'] : []).concat(['Average: $' + (dih ? rot + ref : rot) + '/' + (dih ? 8 : 4) + ' = ' + tot4 + '$.']), hint: 'For each symmetry, count its cycles on the corners; each cycle gets one color.' };
    }
    if (shape === 'cube') {
      var k5 = R.int(2, 5), c = (M.pow(k5, 6) + 3 * M.pow(k5, 4) + 12 * M.pow(k5, 3) + 8 * M.pow(k5, 2)) / 24;
      return { q: 'The six faces of a cube are each painted one of $' + k5 + '$ colors. How many different cubes are there, up to rotation?', a: num(c),
        steps: ['The rotation group has $24$ elements. Count each kind by its cycles on the faces:', '$e$: $6$ cycles, fixes $' + k5 + '^{6}$. Quarter turns about face axes ($6$): $3$ cycles each. Half turns about face axes ($3$): $4$ cycles. Turns about vertex axes ($8$): $2$ cycles. Half turns about edge axes ($6$): $3$ cycles.', 'Sum: $' + k5 + '^{6} + 3 \\cdot ' + k5 + '^{4} + 12 \\cdot ' + k5 + '^{3} + 8 \\cdot ' + k5 + '^{2} = ' + (c * 24) + '$.', 'Average: $' + (c * 24) + '/24 = ' + c + '$.'], hint: 'Group the 24 rotations by axis type and count face cycles.' };
    }
    var n6 = R.pick([4, 5, 6]), k6 = R.pick([2, 3]);
    return { q: 'To count necklaces of $' + n6 + '$ beads in $' + k6 + '$ colors up to rotation, a student divides the $' + k6 + '^{' + n6 + '} = ' + M.pow(k6, n6) + '$ colorings by the $' + n6 + '$ rotations. What is wrong?', a: mc('Some colorings are fixed by nontrivial rotations (like the one-color necklaces), so orbits have different sizes; Burnside\'s average of fixed points gives $' + necklaces(n6, k6) + '$.', ['Nothing is wrong; the answer is $' + M.pow(k6, n6) + '/' + n6 + '$.', 'It should multiply by $' + n6 + '$ instead of dividing.', 'It should divide by $' + n6 + '!$, the number of ways to arrange the beads.']),
      steps: ['Dividing by $|G|$ assumes every orbit has $|G|$ colorings, which fails when a coloring is fixed by some rotation.', 'Burnside handles this: $\\frac{1}{' + n6 + '}\\sum_{j} ' + k6 + '^{\\gcd(' + n6 + ', j)} = ' + necklaces(n6, k6) + '$.'], hint: 'Is every orbit the same size?' };
  });

  G('aa.sylow', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['sylord', 'np', 'np']), R.pick(['np', 'forced', 'elems', 'sylord']), R.pick(['forced', 'elems', 'np', 'which']));
    var ns = [12, 15, 18, 20, 24, 28, 30, 35, 36, 40, 42, 45, 48, 56, 60, 63, 72, 75, 84, 100, 105, 132, 200], n = R.pick(ns), ps = factorize(n);
    var pf = R.pick(ps), p = pf[0], pa = M.pow(p, pf[1]), m = n / pa, opts = divisors(m).filter(function (d) { return d % p === 1 % p; });
    if (shape === 'sylord') return { q: 'A group has order $' + n + '$. What is the order of its Sylow $' + p + '$-subgroups?', a: num(pa), steps: ['$' + n + ' = ' + p + '^{' + pf[1] + '} \\cdot ' + m + '$ with $' + p + ' \\nmid ' + m + '$.', 'A Sylow $' + p + '$-subgroup has the largest power of $' + p + '$ dividing $|G|$: order $' + pa + '$.'], hint: 'Take the highest power of $' + p + '$ that divides $' + n + '$.' };
    if (shape === 'np') return { q: 'A group has order $' + n + '$. List every value the number $n_{' + p + '}$ of Sylow $' + p + '$-subgroups could have, by the Sylow theorems.', a: setA(opts),
      steps: ['$' + n + ' = ' + p + '^{' + pf[1] + '} \\cdot ' + m + '$.', '$n_{' + p + '}$ divides $' + m + '$: candidates $' + divisors(m).join(', ') + '$.', 'And $n_{' + p + '} \\equiv 1 \\pmod{' + p + '}$: that leaves $' + opts.join(', ') + '$.'], hint: 'Divisors of $' + m + '$ that are $1$ more than a multiple of $' + p + '$.' };
    if (shape === 'forced') { var f = opts.length === 1; return { q: 'Must every group of order $' + n + '$ have a normal Sylow $' + p + '$-subgroup?', a: tf(f), steps: ['A Sylow $' + p + '$-subgroup is normal exactly when $n_{' + p + '} = 1$ (they are all conjugate).', '$n_{' + p + '}$ divides $' + m + '$ and is $\\equiv 1 \\pmod{' + p + '}$: possible values $' + opts.join(', ') + '$.', f ? 'Only $1$ is possible, so yes.' : 'Values other than $1$ are allowed, so the theorems alone do not force it.'], hint: 'List the possible values of $n_{' + p + '}$.' }; }
    if (shape === 'elems') {
      var cand = [[6, 2, 3], [10, 2, 5], [12, 3, 4], [14, 2, 7], [18, 2, 9], [21, 3, 7], [24, 3, 4], [39, 3, 13], [42, 3, 7], [55, 5, 11], [56, 7, 8], [60, 5, 6], [60, 3, 10]];
      var c = R.pick(cand);
      return { q: 'A group of order $' + c[0] + '$ has $n_{' + c[1] + '} = ' + c[2] + '$ Sylow $' + c[1] + '$-subgroups. How many elements of order $' + c[1] + '$ does it have?', a: num(c[2] * (c[1] - 1)),
        steps: ['Each Sylow $' + c[1] + '$-subgroup has prime order $' + c[1] + '$, so it is cyclic and its $' + (c[1] - 1) + '$ non-identity elements have order $' + c[1] + '$.', 'Two different subgroups of prime order meet only in $e$, so these elements are not shared.', 'Count: $' + c[2] + ' \\cdot ' + (c[1] - 1) + ' = ' + (c[2] * (c[1] - 1)) + '$.'], hint: 'Count non-identity elements in each Sylow subgroup; they do not overlap.' };
    }
    var it = R.pick([[15, 'Every group of order $15$ is cyclic.', true, '$n_{3} \\mid 5$ and $n_{3} \\equiv 1 \\pmod 3$ give $n_{3} = 1$; $n_{5} \\mid 3$ and $n_{5} \\equiv 1 \\pmod 5$ give $n_{5} = 1$. Both Sylow subgroups are normal and meet in $e$, so $G \\cong \\mathbb{Z}_{3} \\times \\mathbb{Z}_{5} \\cong \\mathbb{Z}_{15}$.'],
      [20, 'Every group of order $20$ has a normal subgroup of order $5$.', true, '$n_{5} \\mid 4$ and $n_{5} \\equiv 1 \\pmod 5$ force $n_{5} = 1$.'], [12, 'Every group of order $12$ has a normal Sylow $3$-subgroup.', false, '$n_{3} \\in \\{1, 4\\}$; $A_{4}$ has $n_{3} = 4$.'],
      [21, 'Every group of order $21$ is abelian.', false, '$n_{7} = 1$, but $n_{3} \\in \\{1, 7\\}$, and there is a nonabelian group of order $21$ with $n_{3} = 7$.'], [35, 'Every group of order $35$ is cyclic.', true, '$n_{5} \\mid 7$, $n_{5} \\equiv 1 \\pmod 5$ give $1$; $n_{7} \\mid 5$, $n_{7} \\equiv 1 \\pmod 7$ give $1$; so $G \\cong \\mathbb{Z}_{5} \\times \\mathbb{Z}_{7} \\cong \\mathbb{Z}_{35}$.']]);
    return { q: 'True or false: ' + it[1], a: tf(it[2]), steps: [it[3], it[2] ? 'True.' : 'False.'], hint: 'Find the possible values of each $n_{p}$.' };
  });


  // ================================================================ unit 8: rings and ideals
  function zeroDivs(n) { return range(1, n - 1).filter(function (a) { return gcd(a, n) > 1; }); }
  function idempotents(n) { return range(0, n - 1).filter(function (x) { return x * x % n === x; }); }
  function nilpotents(n) { return range(0, n - 1).filter(function (x) { var y = x; for (var k = 0; k < 8; k++) { if (y % n === 0) return true; y = y * x % n; } return y % n === 0; }); }
  function matModMul(A, B, n) { return mmul(A, B).map(function (r) { return r.map(function (x) { return mod(x, n); }); }); }

  G('aa.rings', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['arith', 'facts', 'char']), R.pick(['matrix', 'units', 'char', 'facts']), R.pick(['idem', 'nil', 'units', 'matrix']));
    if (shape === 'arith') {
      var n = R.pick([6, 8, 9, 10, 12]), a = R.int(2, n - 1), b = R.int(2, n - 1), c = R.int(1, n - 1), v = mod(a * b - c, n);
      return { q: 'In the ring $' + Z(n) + '$, compute $' + a + ' \\cdot ' + b + ' - ' + c + '$.', a: num(v), steps: ['Work mod $' + n + '$: $' + a + ' \\cdot ' + b + ' = ' + (a * b) + ' \\equiv ' + (a * b % n) + '$.', '$' + (a * b % n) + ' - ' + c + ' = ' + (a * b % n - c) + ' \\equiv ' + v + ' \\pmod{' + n + '}$.'], hint: 'Multiply, subtract, then reduce mod $' + n + '$.' };
    }
    if (shape === 'facts') {
      var it = R.pick([['$2\\mathbb{Z}$, the even integers, is a ring with a multiplicative identity.', false, 'It is a ring (closed under $+$, $-$, $\\cdot$), but no even $u$ has $u \\cdot 2 = 2$.'], ['The $2 \\times 2$ real matrices form a commutative ring.', false, '$\\begin{pmatrix} 1 & 1 \\\\ 0 & 1 \\end{pmatrix}\\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\end{pmatrix} \\ne \\begin{pmatrix} 1 & 0 \\\\ 1 & 1 \\end{pmatrix}\\begin{pmatrix} 1 & 1 \\\\ 0 & 1 \\end{pmatrix}$.'],
        ['$\\mathbb{Z}_{n}$ is a commutative ring with identity for every $n \\ge 2$.', true, 'Addition and multiplication mod $n$ inherit the ring laws from $\\mathbb{Z}$, and $1$ is the identity.'], ['In any ring, $0 \\cdot a = 0$.', true, '$0a = (0 + 0)a = 0a + 0a$; subtract $0a$ from both sides.'], ['In any ring, $(-a)(-b) = ab$.', true, '$(-a)(-b) + (-a)b = (-a)(-b + b) = 0$, so $(-a)(-b) = -((-a)b) = ab$.'],
        ['The units of $\\mathbb{Z}$ are $1$ and $-1$.', true, 'If $ab = 1$ with integers $a, b$, then $|a| = 1$.'], ['The set of odd integers is a ring.', false, 'It is not closed under addition: $1 + 1 = 2$.'], ['$\\mathbb{Z}[x]$, polynomials with integer coefficients, is a commutative ring with identity.', true, 'Polynomials add and multiply like integers, and the constant $1$ is the identity.']]);
      return { q: 'True or false: ' + it[0], a: tf(it[1]), steps: [it[2], it[1] ? 'True.' : 'False.'], hint: 'Check the ring axioms one at a time, or find a single counterexample.', nolint: ['+ 0'] };
    }
    if (shape === 'char') {
      var m = R.pick([2, 3, 4, 6, 8, 9, 10]), n2 = R.pick([3, 4, 5, 6, 9, 12, 15]), c2 = lcm(m, n2);
      return { q: 'What is the characteristic of the ring $' + Z(m) + ' \\times ' + Z(n2) + '$ (the least $k \\ge 1$ with $k \\cdot (1, 1) = (0, 0)$)?', a: num(c2), steps: ['$k(1, 1) = (k \\bmod ' + m + ', k \\bmod ' + n2 + ')$ is zero when $' + m + ' \\mid k$ and $' + n2 + ' \\mid k$.', 'The least such $k$ is $\\operatorname{lcm}(' + m + ', ' + n2 + ') = ' + c2 + '$.'], hint: 'The additive order of the identity $(1, 1)$.' };
    }
    if (shape === 'matrix') {
      var n3 = R.pick([2, 3, 5]), A, B, tries = 0; do { A = m2(R.int(0, n3 - 1), R.int(0, n3 - 1), R.int(0, n3 - 1), R.int(0, n3 - 1)); B = m2(R.int(0, n3 - 1), R.int(0, n3 - 1), R.int(0, n3 - 1), R.int(0, n3 - 1)); tries++; } while (tries < 50 && meq(matModMul(A, B, n3), matModMul(B, A, n3)));
      var AB = matModMul(A, B, n3), first = R.coin();
      return { q: 'In the ring of $2 \\times 2$ matrices over $' + Z(n3) + '$, let $A = ' + mTex(A) + '$ and $B = ' + mTex(B) + '$. Compute $' + (first ? 'AB' : 'BA') + '$ (entries mod $' + n3 + '$).', a: { t: 'matrix', v: (first ? AB : matModMul(B, A, n3)).map(function (r) { return r.map(String); }) },
        steps: ['Multiply rows by columns, then reduce each entry mod $' + n3 + '$.', '$' + (first ? 'AB' : 'BA') + ' = ' + mTex(first ? AB : matModMul(B, A, n3)) + '$.', 'The other order gives $' + mTex(first ? matModMul(B, A, n3) : AB) + '$: this ring is not commutative.'], hint: 'Row of the left matrix times column of the right one.' };
    }
    if (shape === 'units') {
      var kind = R.pick(['prod', 'prod', 'mat2']);
      if (kind === 'prod') { var a = R.pick([4, 6, 8, 9, 10]), b = R.pick([3, 5, 7, 12]); return { q: 'How many units does the ring $' + Z(a) + ' \\times ' + Z(b) + '$ have?', a: num(phi(a) * phi(b)), steps: ['$(x, y)$ is a unit exactly when $x$ is a unit of $' + Z(a) + '$ and $y$ is a unit of $' + Z(b) + '$ (inverses work coordinate by coordinate).', 'That gives $\\varphi(' + a + ') \\cdot \\varphi(' + b + ') = ' + phi(a) + ' \\cdot ' + phi(b) + ' = ' + (phi(a) * phi(b)) + '$.'], hint: 'A pair is invertible when both coordinates are.' }; }
      var p = R.pick([2, 3]), cnt = (p * p - 1) * (p * p - p);
      return { q: 'How many units does the ring of $2 \\times 2$ matrices over $' + Z(p) + '$ have?', a: num(cnt), steps: ['A matrix over a field is a unit exactly when its columns are independent (determinant $\\ne 0$).', 'First column: any nonzero vector, $' + p + '^{2} - 1 = ' + (p * p - 1) + '$ choices. Second column: not a multiple of the first, $' + p + '^{2} - ' + p + ' = ' + (p * p - p) + '$ choices.', 'Total: $' + (p * p - 1) + ' \\cdot ' + (p * p - p) + ' = ' + cnt + '$.'], hint: 'Count invertible matrices column by column.' };
    }
    if (shape === 'idem') {
      var n4 = R.pick([6, 10, 12, 15, 30, 18, 20]), E = idempotents(n4);
      return { q: 'List all idempotents of $' + Z(n4) + '$ (elements with $x^{2} = x$).', a: setA(E), steps: ['$x^{2} = x$ means $x(x - 1) \\equiv 0 \\pmod{' + n4 + '}$.', 'Test each $x$: ' + E.map(function (x) { return '$' + x + '^{2} = ' + (x * x) + ' \\equiv ' + (x * x % n4) + '$'; }).join(', ') + '.', 'So the idempotents are $' + setTex(E) + '$ (there are $2^{k}$, where $k$ is the number of primes dividing $' + n4 + '$).'], hint: 'Since $x$ and $x - 1$ share no factor, each prime power of $' + n4 + '$ must divide one of them.' };
    }
    var n5 = R.pick([8, 12, 16, 18, 24, 27, 36]), Nl = nilpotents(n5), rad = factorize(n5).reduce(function (s, f) { return s * f[0]; }, 1);
    return { q: 'List all nilpotent elements of $' + Z(n5) + '$ (elements with $x^{k} = 0$ for some $k \\ge 1$).', a: setA(Nl), steps: ['$x^{k} \\equiv 0 \\pmod{' + n5 + '}$ for some $k$ exactly when every prime dividing $' + n5 + '$ divides $x$.', 'The primes dividing $' + n5 + '$ multiply to $' + rad + '$, so the nilpotents are the multiples of $' + rad + '$.', '$' + setTex(Nl) + '$.'], hint: 'A power of $x$ is a multiple of $' + n5 + '$ only if $x$ contains every prime of $' + n5 + '$.' };
  });

  G('aa.integral-domains', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['zd', 'field', 'zd']), R.pick(['solve', 'isid', 'field', 'zd']), R.pick(['solve', 'countzd', 'flaw', 'isid']));
    if (shape === 'zd') {
      var n = R.pick([6, 8, 9, 10, 12, 14, 15]), Z0 = zeroDivs(n);
      return { q: 'List the zero divisors of $' + Z(n) + '$.', a: setA(Z0),
        steps: ['$a \\ne 0$ is a zero divisor when $ab \\equiv 0$ for some $b \\ne 0$; in $' + Z(n) + '$ that happens exactly when $\\gcd(a, ' + n + ') > 1$ (take $b = ' + n + '/\\gcd(a, ' + n + ')$).', 'So the zero divisors are $' + setTex(Z0) + '$.', 'For example, $' + Z0[0] + ' \\cdot ' + (n / gcd(Z0[0], n)) + ' = ' + (Z0[0] * n / gcd(Z0[0], n)) + ' \\equiv 0$.'], hint: 'Which nonzero $a$ share a factor with $' + n + '$?' };
    }
    if (shape === 'field') {
      var n2 = R.int(4, 40);
      return { q: 'Is $' + Z(n2) + '$ a field?', a: tf(isPrime(n2)), steps: ['$' + Z(n2) + '$ is a field exactly when $' + n2 + '$ is prime: then every $a \\ne 0$ has $\\gcd(a, ' + n2 + ') = 1$ and so an inverse.', isPrime(n2) ? '$' + n2 + '$ is prime, so yes.' : '$' + n2 + ' = ' + factorize(n2).map(function (f) { return f[1] > 1 ? f[0] + '^{' + f[1] + '}' : f[0]; }).join(' \\cdot ') + '$ is not prime: $' + factorize(n2)[0][0] + '$ is a zero divisor and has no inverse.'], hint: 'Is $' + n2 + '$ prime?' };
    }
    if (shape === 'solve') {
      var n3 = R.pick([6, 8, 9, 10, 12, 14, 15, 7, 11, 13]), a = R.int(2, n3 - 1), b = R.int(0, n3 - 1), sol = range(0, n3 - 1).filter(function (x) { return (a * x - b) % n3 === 0; }), g = gcd(a, n3);
      return { q: 'Find every solution of $' + a + 'x = ' + b + '$ in $' + Z(n3) + '$.', a: setA(sol),
        steps: ['$\\gcd(' + a + ', ' + n3 + ') = ' + g + '$.', g === 1 ? '$' + a + '$ is a unit, so there is exactly one solution: $x = ' + a + '^{-1} \\cdot ' + b + '$.' : (b % g ? '$' + g + '$ does not divide $' + b + '$, so there is no solution.' : '$' + g + '$ divides $' + b + '$, so there are $' + g + '$ solutions, spaced $' + (n3 / g) + '$ apart: cancelling $' + a + '$ is not allowed here.'), sol.length ? 'Solutions: $' + sol.join(', ') + '$.' : 'No solution.'], hint: 'Is $' + a + '$ a unit in $' + Z(n3) + '$?' };
    }
    if (shape === 'isid') {
      var it = R.pick([['$\\mathbb{Z}_{3} \\times \\mathbb{Z}_{5}$', false, '$(1, 0)(0, 1) = (0, 0)$.'], ['$\\mathbb{Z}[x]$', true, 'The leading coefficient of $fg$ is the product of the leading coefficients, which is nonzero.'], ['$\\mathbb{Z}[\\sqrt{2}] = \\{a + b\\sqrt{2}\\}$', true, 'It sits inside the field $\\mathbb{R}$, which has no zero divisors.'], ['the $2 \\times 2$ real matrices', false, '$\\begin{pmatrix} 1 & 0 \\\\ 0 & 0 \\end{pmatrix}\\begin{pmatrix} 0 & 0 \\\\ 0 & 1 \\end{pmatrix} = 0$.'],
        ['$\\mathbb{Z}_{17}$', true, '$17$ is prime, so $\\mathbb{Z}_{17}$ is a field.'], ['$\\mathbb{Z}_{21}$', false, '$3 \\cdot 7 \\equiv 0$.'], ['$\\mathbb{Z}_{2}[x]$', true, 'Polynomials over a field (or any integral domain) form an integral domain.'], ['$\\mathbb{Z}_{4}[x]$', false, '$2 \\cdot 2 = 0$ already in the constants.'], ['the continuous functions $\\mathbb{R} \\to \\mathbb{R}$', false, 'A function that is $0$ for $x \\le 0$ times one that is $0$ for $x \\ge 0$ is the zero function.']]);
      return { q: 'Is ' + it[0] + ' an integral domain?', a: tf(it[1]), steps: ['An integral domain is a commutative ring with $1 \\ne 0$ and no zero divisors.', it[2], it[1] ? 'So yes.' : 'So no: it has zero divisors.'], hint: 'Look for two nonzero elements with product zero.' };
    }
    if (shape === 'countzd') {
      var m = R.pick([2, 3, 4, 5]), n4 = R.pick([3, 4, 5, 6]), cnt = 0;
      for (var a2 = 0; a2 < m; a2++) for (var b2 = 0; b2 < n4; b2++) { if (!a2 && !b2) continue; var zd = false; for (var c = 0; c < m && !zd; c++) for (var d = 0; d < n4; d++) { if (!c && !d) continue; if ((a2 * c) % m === 0 && (b2 * d) % n4 === 0) { zd = true; break; } } if (zd) cnt++; }
      return { q: 'How many zero divisors does $' + Z(m) + ' \\times ' + Z(n4) + '$ have?', a: num(cnt),
        steps: ['$(a, b) \\ne (0, 0)$ is a zero divisor unless it is a unit: a nonunit coordinate can be killed by a nonzero element, and if one coordinate is $0$, multiply by $(0, 1)$ or $(1, 0)$.', 'Units: $\\varphi(' + m + ')\\varphi(' + n4 + ') = ' + (phi(m) * phi(n4)) + '$; nonzero elements: $' + (m * n4 - 1) + '$.', 'Zero divisors: $' + (m * n4 - 1) + ' - ' + (phi(m) * phi(n4)) + ' = ' + cnt + '$.'], hint: 'In a finite commutative ring, every nonzero element is a unit or a zero divisor.' };
    }
    var fl = R.pick([['"In $\\mathbb{Z}_{12}$, $4x = 4 \\cdot 2$, so $x = 2$."', '$4$ is a zero divisor in $\\mathbb{Z}_{12}$, so it cannot be cancelled: $x = 2, 5, 8, 11$ all work.', ['Nothing is wrong.', 'The answer should be $x = 8$.', 'The equation has no solution.']],
      ['"$\\mathbb{Z}_{6}$ is a field because it is finite."', 'Finite integral domains are fields, but $\\mathbb{Z}_{6}$ is not an integral domain: $2 \\cdot 3 = 0$.', ['Nothing is wrong.', 'Fields must be infinite.', 'It is a field, but only because $6$ is even.']],
      ['"In any ring, $x^{2} = x$ means $x = 0$ or $x = 1$."', 'That needs an integral domain: in $\\mathbb{Z}_{6}$, $3^{2} = 9 \\equiv 3$ and $4^{2} = 16 \\equiv 4$.', ['Nothing is wrong.', 'It only fails for infinite rings.', 'It should say $x = 0$ or $x = -1$.']]]);
    return { q: 'What is wrong with this reasoning?<br>' + fl[0], a: mc(fl[1], fl[2]), steps: [fl[1]], hint: 'Cancellation and "product zero means a factor is zero" need an integral domain.' };
  });

  G('aa.ideals', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['gen', 'zn', 'facts']), R.pick(['sumint', 'zn', 'isideal', 'gen']), R.pick(['prod', 'isideal', 'sumint', 'count']));
    if (shape === 'gen') {
      var a = R.pick([12, 18, 20, 24, 30, 42, 45]), b = R.pick([8, 16, 27, 28, 35, 36, 50]), g = gcd(a, b);
      return { q: 'In $\\mathbb{Z}$, the ideal $(' + a + ', ' + b + ') = \\{' + a + 'x + ' + b + 'y : x, y \\in \\mathbb{Z}\\}$ equals $(d)$ for which $d \\ge 0$?', a: num(g), steps: ['Every ideal of $\\mathbb{Z}$ is $(d)$, with $d$ its least positive element.', 'The combinations $' + a + 'x + ' + b + 'y$ are exactly the multiples of $\\gcd(' + a + ', ' + b + ')$ (Bézout).', 'So $d = ' + g + '$.'], hint: 'Bézout\'s identity.' };
    }
    if (shape === 'zn') {
      var n = R.pick([12, 18, 20, 24, 30]), k = R.pick(range(2, n - 1).filter(function (x) { return gcd(x, n) !== x && gcd(x, n) > 1; }));
      var I = multiplesZ(k, n);
      return { q: 'List the elements of the principal ideal $(' + k + ')$ in $' + Z(n) + '$.', a: setA(I), steps: ['$(' + k + ') = \\{' + k + 'r : r \\in ' + Z(n) + '\\}$.', 'Multiples of $' + k + '$ mod $' + n + '$ are the multiples of $\\gcd(' + k + ', ' + n + ') = ' + gcd(k, n) + '$: $(' + k + ') = (' + gcd(k, n) + ')$.', '$' + setTex(I) + '$.'], hint: 'Multiply $' + k + '$ by everything in $' + Z(n) + '$.' };
    }
    if (shape === 'facts' || shape === 'isideal') {
      var it = R.pick([['$\\mathbb{Z}$ is an ideal of $\\mathbb{Q}$.', false, '$1 \\in \\mathbb{Z}$ but $\\frac{1}{2} \\cdot 1 \\notin \\mathbb{Z}$.'], ['$6\\mathbb{Z}$ is an ideal of $\\mathbb{Z}$.', true, 'It is an additive subgroup, and $r \\cdot 6k = 6(rk)$.'], ['$\\{f \\in \\mathbb{Z}[x] : f(0) \\text{ is even}\\}$ is an ideal of $\\mathbb{Z}[x]$.', true, 'It is closed under subtraction, and $(gf)(0) = g(0)f(0)$ is even when $f(0)$ is.'],
        ['$\\{f \\in \\mathbb{Z}[x] : f(0) = 1\\}$ is an ideal of $\\mathbb{Z}[x]$.', false, 'It does not contain $0$.'], ['$\\{f \\in \\mathbb{R}[x] : f(2) = 0\\}$ is an ideal of $\\mathbb{R}[x]$.', true, 'It is the kernel of the evaluation $f \\mapsto f(2)$; equivalently, it is $(x - 2)$.'], ['$\\{0, 4, 8\\}$ is an ideal of $\\mathbb{Z}_{12}$.', true, 'It is $(4)$: closed under addition, and $r \\cdot 4k$ is again a multiple of $4$ mod $12$.'],
        ['$\\{0, 3, 6\\}$ is an ideal of $\\mathbb{Z}_{12}$.', false, '$3 + 6 = 9$ is not in the set, so it is not even an additive subgroup.'], ['The upper triangular $2 \\times 2$ real matrices form an ideal of all $2 \\times 2$ real matrices.', false, '$\\begin{pmatrix} 0 & 0 \\\\ 1 & 0 \\end{pmatrix}\\begin{pmatrix} 1 & 0 \\\\ 0 & 0 \\end{pmatrix} = \\begin{pmatrix} 0 & 0 \\\\ 1 & 0 \\end{pmatrix}$ is not upper triangular.'], ['A field has exactly two ideals.', true, 'Any ideal containing a nonzero $a$ contains $a^{-1}a = 1$ and then everything; so the ideals are $\\{0\\}$ and the field.']]);
      return { q: 'True or false: ' + it[0], a: tf(it[1]), steps: ['An ideal is an additive subgroup that absorbs multiplication by every ring element.', it[2], it[1] ? 'True.' : 'False.'], hint: 'Check subtraction, then try multiplying by an element from outside the set.' };
    }
    if (shape === 'sumint') {
      var a2 = R.pick([4, 6, 8, 9, 10, 12, 15]), b2 = R.pick([6, 10, 14, 15, 18, 21, 20].filter(function (x) { return x !== a2; })), sum2 = R.coin();
      return { q: 'In $\\mathbb{Z}$, write $(' + a2 + ')' + (sum2 ? ' + ' : ' \\cap ') + '(' + b2 + ')$ as $(d)$ with $d \\ge 0$. What is $d$?', a: num(sum2 ? gcd(a2, b2) : lcm(a2, b2)),
        steps: sum2 ? ['$(' + a2 + ') + (' + b2 + ') = \\{' + a2 + 'x + ' + b2 + 'y\\}$, the multiples of $\\gcd(' + a2 + ', ' + b2 + ')$.', '$d = ' + gcd(a2, b2) + '$.'] : ['$(' + a2 + ') \\cap (' + b2 + ')$ holds the common multiples of $' + a2 + '$ and $' + b2 + '$.', 'Those are the multiples of $\\operatorname{lcm}(' + a2 + ', ' + b2 + ') = ' + lcm(a2, b2) + '$.'], hint: sum2 ? 'Sums of multiples: think gcd.' : 'Common multiples: think lcm.' };
    }
    if (shape === 'prod') {
      var a3 = R.pick([2, 3, 4, 6]), b3 = R.pick([3, 5, 6, 9, 10]);
      return { q: 'In $\\mathbb{Z}$, the product ideal $(' + a3 + ')(' + b3 + ')$ (all finite sums of products $xy$, $x \\in (' + a3 + ')$, $y \\in (' + b3 + ')$) equals $(d)$ for which $d$?', a: num(a3 * b3), steps: ['Each product $(' + a3 + 'm)(' + b3 + 'n) = ' + (a3 * b3) + 'mn$ is a multiple of $' + (a3 * b3) + '$, and $' + a3 + ' \\cdot ' + b3 + ' = ' + (a3 * b3) + '$ itself is one of them.', 'So $(' + a3 + ')(' + b3 + ') = (' + (a3 * b3) + ')$.' + (gcd(a3, b3) > 1 ? ' (Compare $(' + a3 + ') \\cap (' + b3 + ') = (' + lcm(a3, b3) + ')$, which is bigger.)' : '')], hint: 'Multiply the generators.' };
    }
    var n2 = R.pick([12, 18, 20, 24, 30, 36, 60]);
    return { q: 'How many ideals does the ring $' + Z(n2) + '$ have?', a: num(divisors(n2).length),
      steps: ['Every ideal is an additive subgroup, and every additive subgroup $' + gen('d') + '$ of $' + Z(n2) + '$ absorbs multiplication, so ideals and subgroups agree here.', 'There is one for each divisor $d$ of $' + n2 + '$: $' + divisors(n2).join(', ') + '$.', 'So $' + divisors(n2).length + '$ ideals.'], hint: 'Ideals of $\\mathbb{Z}_{n}$ are the subgroups $(d)$ with $d \\mid n$.' };
  });

  G('aa.ring-homomorphisms', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['reduce', 'eval', 'reduce']), R.pick(['isrh', 'kerred', 'eval', 'crt']), R.pick(['count', 'isrh', 'crt', 'facts']));
    if (shape === 'reduce') {
      var n = R.pick([12, 18, 20, 24, 30]), d = R.pick(divisors(n).filter(function (x) { return x > 2 && x < n; })), a = R.pick(range(d + 1, n - 1).filter(function (x) { return x % d; })), b = R.pick(range(2, n - 1).filter(function (x) { return x % d; })), ex = mod(a * b + a, n);
      return { q: 'Reduction $\\varphi: ' + Z(n) + ' \\to ' + Z(d) + '$, $x \\mapsto x \\bmod ' + d + '$, is a ring homomorphism. Find $\\varphi(' + a + ' \\cdot ' + b + ' + ' + a + ')$, computed in $' + Z(n) + '$ first.', a: num(mod(ex, d)),
        steps: ['In $' + Z(n) + '$: $' + a + ' \\cdot ' + b + ' + ' + a + ' \\equiv ' + ex + '$.', '$\\varphi(' + ex + ') = ' + ex + ' \\bmod ' + d + ' = ' + mod(ex, d) + '$.', 'Check with the homomorphism rules: $\\varphi(' + a + ')\\varphi(' + b + ') + \\varphi(' + a + ') = ' + (a % d) + ' \\cdot ' + (b % d) + ' + ' + (a % d) + ' \\equiv ' + mod((a % d) * (b % d) + a % d, d) + ' \\pmod{' + d + '}$.'], hint: 'Either compute first and reduce, or reduce first and compute: a homomorphism gives the same answer.' };
    }
    if (shape === 'eval') {
      var c = R.nz(-3, 3), co = [R.int(-5, 5), R.int(-4, 4), R.nz(-3, 3), R.pick([0, 1, -1, 2])], f = ptrim(co), val = f.reduce(function (s, x, i) { return s + x * M.pow(c, i); }, 0);
      return { q: 'The evaluation map $\\varphi_{' + c + '}: \\mathbb{Z}[x] \\to \\mathbb{Z}$, $f \\mapsto f(' + c + ')$, is a ring homomorphism. Find $\\varphi_{' + c + '}(' + ipTex(f) + ')$.', a: num(val),
        steps: ['Substitute $x = ' + c + '$.', '$' + f.map(function (x, i) { return x ? T.p(x) + (i ? ' \\cdot ' + T.p(c) + (i > 1 ? '^{' + i + '}' : '') : '') : ''; }).filter(Boolean).join(' + ') + ' = ' + val + '$.', 'Its kernel is the ideal $(x ' + (c < 0 ? '+ ' + (-c) : '- ' + c) + ')$: the polynomials with $' + c + '$ as a root.'], hint: 'Plug in $x = ' + c + '$.' };
    }
    if (shape === 'isrh') {
      var n2 = R.pick([6, 10, 12, 15]), m = R.pick([2, 3, 4, 5, 6, n2]), k = R.coin() ? R.pick(idempotents(m).filter(function (x) { return x > 0; })) : R.int(1, m - 1), add = (n2 * k) % m === 0, mul = (k * k) % m === k, ok = add && mul;
      return { q: 'Is $\\varphi: ' + Z(n2) + ' \\to ' + Z(m) + '$, $\\varphi(x) = ' + T.mono(k, 'x') + ' \\bmod ' + m + '$, a ring homomorphism?', a: tf(ok),
        steps: ['Well defined and additive: need $' + m + ' \\mid ' + n2 + ' \\cdot ' + k + '$ ' + (add ? '(true).' : '(false).'), 'Multiplicative: $\\varphi(xy) = ' + k + 'xy$ and $\\varphi(x)\\varphi(y) = ' + (k * k) + 'xy$, so need $' + k + '^{2} \\equiv ' + k + ' \\pmod{' + m + '}$: $' + (k * k) + ' \\equiv ' + (k * k % m) + '$ ' + (mul ? '(true).' : '(false).'), ok ? 'Both hold, so it is a ring homomorphism.' : 'So it is not a ring homomorphism.'], hint: 'Check sums (is it well defined?) and products ($k^{2} = k$?).' };
    }
    if (shape === 'kerred') {
      var n3 = R.pick([12, 18, 24, 30, 36]), d3 = R.pick(divisors(n3).filter(function (x) { return x > 1 && x < n3; })), K = range(0, n3 / d3 - 1).map(function (j) { return j * d3; });
      return { q: 'Find the kernel of the ring homomorphism $\\varphi: ' + Z(n3) + ' \\to ' + Z(d3) + '$, $x \\mapsto x \\bmod ' + d3 + '$.', a: setA(K), steps: ['The kernel holds the $x$ with $x \\equiv 0 \\pmod{' + d3 + '}$.', 'In $' + Z(n3) + '$ those are $' + setTex(K) + '$, the ideal $(' + d3 + ')$.'], hint: 'Which $x$ reduce to $0$?' };
    }
    if (shape === 'crt') {
      var a = R.pick([4, 6, 8, 9, 10, 12]), b = R.pick([6, 9, 10, 14, 15, 21].filter(function (x) { return x !== a; }));
      return { q: 'The ring homomorphism $\\varphi: \\mathbb{Z} \\to ' + Z(a) + ' \\times ' + Z(b) + '$, $x \\mapsto (x \\bmod ' + a + ', x \\bmod ' + b + ')$, has kernel $(d)$. Find $d$.', a: num(lcm(a, b)), steps: ['$\\varphi(x) = (0, 0)$ when $' + a + ' \\mid x$ and $' + b + ' \\mid x$.', 'So the kernel is the common multiples: $(\\operatorname{lcm}(' + a + ', ' + b + ')) = (' + lcm(a, b) + ')$.', gcd(a, b) === 1 ? 'Since $\\gcd = 1$, the image has $' + (a * b) + '$ elements and $\\mathbb{Z}/(' + (a * b) + ') \\cong ' + Z(a) + ' \\times ' + Z(b) + '$ (the Chinese remainder theorem).' : 'Since $\\gcd(' + a + ', ' + b + ') = ' + gcd(a, b) + ' > 1$, the map is not onto.'], hint: 'Which integers go to $(0, 0)$?' };
    }
    if (shape === 'count') {
      var m4 = R.pick([2, 3, 4, 6, 12]), n4 = R.pick([6, 10, 12, 15, 20]), c4 = range(0, n4 - 1).filter(function (e) { return (e * e) % n4 === e && (m4 * e) % n4 === 0; });
      return { q: 'How many ring homomorphisms $\\varphi: ' + Z(m4) + ' \\to ' + Z(n4) + '$ are there? (They need not send $1$ to $1$.)', a: num(c4.length),
        steps: ['$\\varphi$ is fixed by $e = \\varphi(1)$, which must satisfy $e^{2} = \\varphi(1 \\cdot 1) = e$ and $' + m4 + 'e = \\varphi(' + m4 + ') = \\varphi(0) = 0$ in $' + Z(n4) + '$.', 'Idempotents of $' + Z(n4) + '$: $' + setTex(idempotents(n4)) + '$; those with $' + m4 + 'e \\equiv 0$: $' + setTex(c4) + '$.', 'So there are $' + c4.length + '$.'], hint: 'Where can $1$ go?' };
    }
    var it = R.pick([['$\\varphi: \\mathbb{Z} \\to \\mathbb{Z}$, $\\varphi(x) = 2x$, is a ring homomorphism.', false, 'It preserves sums, but $\\varphi(1 \\cdot 1) = 2$ while $\\varphi(1)\\varphi(1) = 4$.'], ['Complex conjugation $\\mathbb{C} \\to \\mathbb{C}$ is a ring homomorphism.', true, '$\\overline{z + w} = \\bar{z} + \\bar{w}$ and $\\overline{zw} = \\bar{z}\\,\\bar{w}$.'], ['The kernel of a ring homomorphism is an ideal.', true, 'If $\\varphi(a) = 0$, then $\\varphi(ra) = \\varphi(r) \\cdot 0 = 0$.'], ['$\\det$, from $2 \\times 2$ real matrices to $\\mathbb{R}$, is a ring homomorphism.', false, 'It preserves products but not sums: $\\det(I + I) = 4 \\ne 2 = \\det I + \\det I$.']]);
    return { q: 'True or false: ' + it[0], a: tf(it[1]), steps: [it[2], it[1] ? 'True.' : 'False.'], hint: 'A ring homomorphism must preserve both $+$ and $\\cdot$.' };
  });

  G('aa.quotient-rings', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['cplx', 'zn', 'size']), R.pick(['zpx', 'cplx', 'reduce', 'size']), R.pick(['zpx', 'reduce', 'isfield', 'sqrt']));
    if (shape === 'cplx' || shape === 'sqrt') {
      var d = shape === 'cplx' ? -1 : R.pick([2, 3, 5, -2]), a = R.nz(-4, 4), b = R.nz(-3, 3), c = R.nz(-4, 4), e = R.nz(-3, 3), A0 = a * c + b * e * d, A1 = a * e + b * c;
      var modTex = d === -1 ? 'x^{2} + 1' : d < 0 ? 'x^{2} + ' + (-d) : 'x^{2} - ' + d;
      return { q: 'In $\\mathbb{R}[x]/(' + modTex + ')$, write $(' + T.lin(b, 'x', a) + ')(' + T.lin(e, 'x', c) + ')$ as $p + qx$.', a: multi([part('$p =$', num(A0)), part('$q =$', num(A1))]),
        steps: ['Expand: $' + T.poly([b * e, a * e + b * c, a * c], 'x') + '$.', 'In the quotient, $x^{2} = ' + d + '$ (since $' + modTex + ' = 0$).', 'So $' + T.mono(b * e, 'x^{2}') + ' = ' + (b * e * d) + '$, and the product is $' + T.lin(A1, 'x', A0) + '$.'].concat(d === -1 ? ['This is complex multiplication with $x$ playing $i$: $\\mathbb{R}[x]/(x^{2} + 1) \\cong \\mathbb{C}$.'] : []), hint: 'Multiply out, then replace $x^{2}$ by $' + d + '$.' };
    }
    if (shape === 'zn') {
      var n = R.pick([12, 18, 20, 24]), k = R.pick(divisors(n).filter(function (x) { return x > 2 && x < n; })), a2 = R.int(2, n - 1), b2 = R.int(2, n - 1), v = (a2 * b2) % k;
      return { q: 'In $' + Z(n) + '/(' + k + ')$, write $(' + a2 + ' + I)(' + b2 + ' + I)$ as $r + I$ with $0 \\le r < ' + k + '$, where $I = (' + k + ')$. What is $r$?', a: num(v), steps: ['Multiply representatives: $' + a2 + ' \\cdot ' + b2 + ' = ' + (a2 * b2) + '$.', 'Cosets of $(' + k + ')$ are classes mod $' + k + '$: $' + (a2 * b2) + ' \\equiv ' + v + ' \\pmod{' + k + '}$.', 'So the product is $' + v + ' + I$ (and $' + Z(n) + '/(' + k + ') \\cong ' + Z(k) + '$).'], hint: 'Reduce mod $' + k + '$.' };
    }
    if (shape === 'size') {
      var p = R.pick([2, 3, 5, 7]), dg = R.int(2, 4), f = randPoly(R, dg, p, true);
      return { q: 'How many elements does the quotient ring $' + zpx(p) + '/(' + pTexP(f) + ')$ have?', a: num(M.pow(p, dg)), steps: ['Every coset has exactly one representative of degree less than $' + dg + '$ (the remainder after dividing by the monic $' + pTexP(f) + '$).', 'Such a remainder $a_0 + a_1x + \\cdots + a_{' + (dg - 1) + '}x^{' + (dg - 1) + '}$ has $' + dg + '$ coefficients, each with $' + p + '$ choices.', 'So $' + p + '^{' + dg + '} = ' + M.pow(p, dg) + '$ elements.'], hint: 'Count the possible remainders.' };
    }
    if (shape === 'zpx' || shape === 'reduce') {
      var p2 = R.pick([2, 3, 5]), dg2 = R.pick([2, 3]), f2 = randPoly(R, dg2, p2, true), A, B, prod;
      if (shape === 'zpx') { A = randPoly(R, dg2 - 1, p2, false); B = randPoly(R, dg2 - 1, p2, false); prod = pmul(A, B, p2); }
      else { var e2 = R.int(dg2 + 1, dg2 + 3); A = [0]; prod = []; for (var i = 0; i < e2; i++) prod.push(0); prod.push(1); }
      var rem = pdivmod(prod, f2, p2)[1];
      return { q: shape === 'zpx' ? 'In $' + zpx(p2) + '/(' + pTexP(f2) + ')$, compute $(' + pTexP(A) + ')(' + pTexP(B) + ')$. Give the remainder of degree less than $' + dg2 + '$, with coefficients from $0$ to $' + (p2 - 1) + '$.' : 'In $' + zpx(p2) + '/(' + pTexP(f2) + ')$, reduce $' + pTexP(prod) + '$ to a polynomial of degree less than $' + dg2 + '$ (coefficients from $0$ to $' + (p2 - 1) + '$).', a: expr(pPlain(rem)),
        steps: (shape === 'zpx' ? ['Multiply and reduce the coefficients mod $' + p2 + '$: $' + pTexP(prod) + '$.'] : []).concat(['Use $' + pTexP(f2) + ' = 0$, that is, $x^{' + dg2 + '} = ' + pTexP(pnorm(f2.slice(0, dg2).map(function (c) { return -c; }), p2)) + '$ (mod $' + p2 + '$).', 'Divide by $' + pTexP(f2) + '$ and keep the remainder: $' + pTexP(rem) + '$.']), hint: 'Replace $x^{' + dg2 + '}$ using the relation, or divide and keep the remainder.' };
    }
    var p3 = R.pick([2, 3, 5]), dg3 = R.pick([2, 3]), f3 = randPoly(R, dg3, p3, true), irr = pirred(f3, p3), rts = proots(f3, p3);
    return { q: 'Is $' + zpx(p3) + '/(' + pTexP(f3) + ')$ a field?', a: tf(irr),
      steps: ['$F[x]/(f)$ is a field exactly when $f$ is irreducible over $F$.', 'A polynomial of degree ' + dg3 + ' is reducible exactly when it has a root. ' + (rts.length ? 'Here $f(' + rts[0] + ') = 0$ in $' + Z(p3) + '$.' : 'Here $' + range(0, p3 - 1).map(function (x) { return 'f(' + x + ') = ' + peval(f3, x, p3); }).join(',\\ ') + '$: no root.'), irr ? 'So $f$ is irreducible and the quotient is a field with $' + M.pow(p3, dg3) + '$ elements.' : 'So $f$ factors, and the quotient has zero divisors (for example $' + (rts[0] ? 'x - ' + rts[0] : 'x') + '$ times the other factor is $0$): not a field.'], hint: 'Does $f$ have a root in $' + Z(p3) + '$?' };
  });

  G('aa.prime-maximal-ideals', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['Z', 'Z', 'maxZn']), R.pick(['Zn', 'maxZn', 'zpx', 'Z']), R.pick(['facts', 'zpx', 'countmax', 'Zn']));
    if (shape === 'Z') {
      var n = R.pick([0, 2, 3, 4, 5, 6, 7, 9, 11, 12, 13, 15]), kind = R.pick(['prime', 'maximal']), ok = kind === 'prime' ? (n === 0 || isPrime(n)) : isPrime(n);
      return { q: 'Is the ideal $' + (n === 0 ? '\\{0\\}' : n + '\\mathbb{Z}') + '$ of $\\mathbb{Z}$ ' + kind + '?', a: tf(ok),
        steps: ['$\\mathbb{Z}/n\\mathbb{Z} \\cong ' + (n === 0 ? '\\mathbb{Z}' : Z(n)) + '$. The ideal is prime when the quotient is an integral domain and maximal when the quotient is a field.', n === 0 ? '$\\mathbb{Z}$ is an integral domain but not a field.' : isPrime(n) ? '$' + Z(n) + '$ is a field ($' + n + '$ is prime).' : '$' + Z(n) + '$ has zero divisors ($' + n + '$ is not prime).', ok ? 'So yes.' : 'So no.'], hint: 'Look at the quotient $\\mathbb{Z}/(n)$.' };
    }
    if (shape === 'maxZn' || shape === 'countmax') {
      var n2 = R.pick([12, 18, 20, 30, 36, 60, 42, 100]), ps = factorize(n2).map(function (f) { return f[0]; });
      if (shape === 'countmax') return { q: 'How many maximal ideals does $' + Z(n2) + '$ have?', a: num(ps.length), steps: ['Ideals of $' + Z(n2) + '$ are $(d)$ with $d \\mid ' + n2 + '$, and $' + Z(n2) + '/(d) \\cong ' + Z('d') + '$.', 'That is a field exactly when $d$ is prime.', 'The primes dividing $' + n2 + '$: $' + ps.join(', ') + '$, so $' + ps.length + '$ maximal ideals.'], hint: 'Which quotients $\\mathbb{Z}_{d}$ are fields?' };
      return { q: 'List the maximal ideals of $' + Z(n2) + '$ by their generators $d$ (each is $(d)$ with $d \\mid ' + n2 + '$).', a: setA(ps), steps: ['$(d)$ is maximal exactly when $' + Z(n2) + '/(d) \\cong ' + Z('d') + '$ is a field, that is, when $d$ is prime.', 'Prime divisors of $' + n2 + '$: $' + ps.join(', ') + '$.'], hint: 'In the lattice, maximal ideals sit just below the whole ring.' };
    }
    if (shape === 'Zn') {
      var n3 = R.pick([12, 18, 20, 24, 30]), d = R.pick(divisors(n3).filter(function (x) { return x > 1 && x < n3; })), pr = isPrime(d), kind2 = R.pick(['prime', 'maximal']);
      return { q: 'Is the ideal $(' + d + ')$ of $' + Z(n3) + '$ ' + kind2 + '?', a: tf(pr), steps: ['$' + Z(n3) + '/(' + d + ') \\cong ' + Z(d) + '$.', 'In a finite ring, prime and maximal agree (a finite integral domain is a field), and $' + Z(d) + '$ is a field exactly when $' + d + '$ is prime.', pr ? '$' + d + '$ is prime: yes.' : '$' + d + '$ is not prime: no.'], hint: 'Is $' + Z(d) + '$ a field?' };
    }
    if (shape === 'zpx') {
      var p = R.pick([2, 3, 5]), dg = R.pick([2, 3]), f = randPoly(R, dg, p, true), irr = pirred(f, p), rts = proots(f, p);
      return { q: 'Is the ideal $(' + pTexP(f) + ')$ maximal in $' + zpx(p) + '$?', a: tf(irr), steps: ['In $F[x]$, $(f)$ is maximal exactly when $f$ is irreducible.', rts.length ? '$f(' + rts[0] + ') = 0$, so $' + (rts[0] ? 'x - ' + rts[0] : 'x') + '$ divides $f$: reducible.' : 'Degree ' + dg + ' with no root in $' + Z(p) + '$: irreducible.', irr ? 'So $(f)$ is maximal, and the quotient is a field with $' + M.pow(p, dg) + '$ elements.' : 'So $(f)$ is not maximal (it is not even prime).'], hint: 'Test the roots $0, 1, \\dots, ' + (p - 1) + '$.' };
    }
    var it = R.pick([['$(x)$ is a prime ideal of $\\mathbb{Z}[x]$.', true, '$\\mathbb{Z}[x]/(x) \\cong \\mathbb{Z}$, an integral domain.'], ['$(x)$ is a maximal ideal of $\\mathbb{Z}[x]$.', false, '$\\mathbb{Z}[x]/(x) \\cong \\mathbb{Z}$ is not a field; $(x) \\subsetneq (2, x) \\subsetneq \\mathbb{Z}[x]$.'], ['$(2, x)$ is a maximal ideal of $\\mathbb{Z}[x]$.', true, '$\\mathbb{Z}[x]/(2, x) \\cong \\mathbb{Z}_{2}$, a field.'],
      ['$(x^{2} + 1)$ is a maximal ideal of $\\mathbb{R}[x]$.', true, '$x^{2} + 1$ is irreducible over $\\mathbb{R}$, and $\\mathbb{R}[x]/(x^{2} + 1) \\cong \\mathbb{C}$.'], ['$(x^{2} + 1)$ is a maximal ideal of $\\mathbb{C}[x]$.', false, '$x^{2} + 1 = (x - i)(x + i)$, so the quotient has zero divisors.'], ['Every maximal ideal is prime.', true, 'If $M$ is maximal, $R/M$ is a field, hence an integral domain, so $M$ is prime.'], ['Every prime ideal is maximal.', false, '$\\{0\\}$ is prime in $\\mathbb{Z}$ but not maximal.'], ['$(x^{2} - 2)$ is a maximal ideal of $\\mathbb{Q}[x]$.', true, '$x^{2} - 2$ has no rational root, so it is irreducible over $\\mathbb{Q}$; the quotient is $\\mathbb{Q}(\\sqrt{2})$.']]);
    return { q: 'True or false: ' + it[0], a: tf(it[1]), steps: ['Prime: $R/P$ is an integral domain. Maximal: $R/M$ is a field.', it[2], it[1] ? 'True.' : 'False.'], hint: 'Identify the quotient ring.' };
  });


  // ================================================================ unit 9: polynomial rings
  function polyStr(a, p) { return pTexP(a); }
  function xMinus(c, p) { return c ? 'x' + (p ? ' + ' + mod(-c, p) : ' - ' + c) : 'x'; }
  var irrCache = {}; function irrList(d, p) { var k = d + ',' + p; return irrCache[k] || (irrCache[k] = irreducibles(d, p)); }

  G('aa.polynomial-rings', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['mul', 'add', 'eval']), R.pick(['mul', 'deg', 'count', 'mulc']), R.pick(['unit', 'deg', 'count', 'mulc']));
    if (shape === 'add' || shape === 'mul' || shape === 'mulc') {
      var n = shape === 'mulc' ? R.pick([4, 6, 8, 9]) : R.pick([2, 3, 5, 7]), f = randPoly(R, R.int(1, 2), n, false), g = randPoly(R, shape === 'add' ? R.int(1, 3) : R.int(1, 2), n, false), r = shape === 'add' ? padd(f, g, n) : pmul(f, g, n);
      var raw = []; if (shape !== 'add') { for (var i = 0; i < f.length + g.length - 1; i++) raw.push(0); f.forEach(function (x, i2) { g.forEach(function (y, j) { raw[i2 + j] += x * y; }); }); }
      return { q: 'In $' + zpx(n) + '$, compute $(' + pTexP(f) + ')' + (shape === 'add' ? ' + ' : '') + '(' + pTexP(g) + ')$. Write coefficients from $0$ to $' + (n - 1) + '$.', a: expr(pPlain(r)),
        steps: shape === 'add' ? ['Add coefficients of like powers, then reduce each mod $' + n + '$.', 'Result: $' + pTexP(r) + '$.'] : ['Multiply as usual: $' + T.poly(raw.slice().reverse(), 'x') + '$.', 'Reduce every coefficient mod $' + n + '$: $' + pTexP(r) + '$.' + (pdeg(r) < pdeg(f) + pdeg(g) ? ' The degree dropped, because the leading coefficients multiply to $0$ in $' + Z(n) + '$.' : '')], hint: 'Compute as over the integers, then reduce the coefficients mod $' + n + '$.' };
    }
    if (shape === 'eval') {
      var p = R.pick([5, 7, 11]), f2 = randPoly(R, R.int(2, 3), p, false), c = R.int(1, p - 1);
      return { q: 'Let $f(x) = ' + pTexP(f2) + '$ in $' + zpx(p) + '$. Find $f(' + c + ')$ in $' + Z(p) + '$.', a: num(peval(f2, c, p)),
        steps: ['Substitute and reduce mod $' + p + '$: $' + f2.map(function (co, i) { return co ? co + (i ? ' \\cdot ' + c + (i > 1 ? '^{' + i + '}' : '') : '') : ''; }).filter(Boolean).reverse().join(' + ') + ' = ' + f2.reduce(function (s, co, i) { return s + co * M.pow(c, i); }, 0) + '$.', '$\\equiv ' + peval(f2, c, p) + ' \\pmod{' + p + '}$.'], hint: 'Reduce mod $' + p + '$ at the end (or along the way).' };
    }
    if (shape === 'deg') {
      var n2 = R.pick([4, 6, 8, 9, 10, 12]), zd = zeroDivs(n2), a = R.pick(zd), b = R.pick(zd.filter(function (x) { return (a * x) % n2 === 0; })), d1 = R.int(1, 3), d2 = R.int(1, 3);
      var f3 = randPoly(R, d1, n2, false); f3[d1] = a; var g3 = randPoly(R, d2, n2, false); g3[d2] = b; var pr = pmul(f3, g3, n2);
      return { q: 'In $' + zpx(n2) + '$, what is the degree of $(' + pTexP(f3) + ')(' + pTexP(g3) + ')$?', a: num(pdeg(pr)),
        steps: ['The $x^{' + (d1 + d2) + '}$ coefficient is $' + a + ' \\cdot ' + b + ' = ' + (a * b) + ' \\equiv 0 \\pmod{' + n2 + '}$: the leading terms cancel, because $' + Z(n2) + '$ has zero divisors.', 'The product is $' + pTexP(pr) + '$.', 'So its degree is $' + pdeg(pr) + '$, less than $' + d1 + ' + ' + d2 + '$.'], hint: 'Multiply the leading coefficients first: are they zero mod $' + n2 + '$?' };
    }
    if (shape === 'count') {
      var p2 = R.pick([2, 3, 5, 7]), d = R.int(2, 4), kind = R.pick(['exact', 'atmost', 'monic']), ans = kind === 'exact' ? (p2 - 1) * M.pow(p2, d) : kind === 'atmost' ? M.pow(p2, d + 1) : M.pow(p2, d);
      return { q: 'How many polynomials in $' + zpx(p2) + '$ have ' + (kind === 'exact' ? 'degree exactly $' + d + '$' : kind === 'atmost' ? 'degree at most $' + d + '$ (counting $0$)' : 'degree $' + d + '$ and are monic') + '?', a: num(ans),
        steps: ['A polynomial of degree at most $' + d + '$ has $' + (d + 1) + '$ coefficients, each one of $' + p2 + '$ values.', kind === 'exact' ? 'Degree exactly $' + d + '$: the leading coefficient is one of the $' + (p2 - 1) + '$ nonzero values, so $' + (p2 - 1) + ' \\cdot ' + p2 + '^{' + d + '} = ' + ans + '$.' : kind === 'atmost' ? 'So $' + p2 + '^{' + (d + 1) + '} = ' + ans + '$.' : 'Monic fixes the leading coefficient at $1$: $' + p2 + '^{' + d + '} = ' + ans + '$.'], hint: 'Count coefficient choices.' };
    }
    var n3 = R.pick([4, 8, 9, 25, 27]), nil = nilpotents(n3).filter(function (x) { return x; }), a3 = R.pick(nil), u = [1, a3], inv = [1], term = [1];
    for (var k = 1; k < 6; k++) { term = pmul(term, [0, mod(-a3, n3)], n3); if (!term.length) break; inv = padd(inv, term, n3); }
    return { q: 'In $' + zpx(n3) + '$, the polynomial $' + pTexP(u) + '$ is a unit. Find its inverse (coefficients from $0$ to $' + (n3 - 1) + '$).', a: expr(pPlain(inv)),
      steps: ['$' + a3 + '$ is nilpotent mod $' + n3 + '$, so try the geometric series $1 - ' + a3 + 'x + (' + a3 + 'x)^{2} - \\cdots$, which stops once a power of $' + a3 + '$ is $0$.', 'That gives $' + pTexP(inv) + '$.', 'Check: $(' + pTexP(u) + ')(' + pTexP(inv) + ') = ' + pTexP(pmul(u, inv, n3)) + '$ in $' + zpx(n3) + '$.'], hint: 'Use $1/(1 + y) = 1 - y + y^{2} - \\cdots$ with $y = ' + a3 + 'x$; the series ends.' };
  });

  G('aa.polynomial-division', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['rem', 'roots', 'divide']), R.pick(['divide', 'roots', 'factor', 'rem']), R.pick(['divide', 'many', 'Q', 'roots']));
    if (shape === 'divide') {
      var p = R.pick([3, 5, 7]), g = randPoly(R, L === 1 ? 1 : R.int(1, 2), p, L === 1), f = randPoly(R, pdeg(g) + R.int(1, 2), p, false), qr = pdivmod(f, g, p);
      return { q: 'Divide $f = ' + pTexP(f) + '$ by $g = ' + pTexP(g) + '$ in $' + zpx(p) + '$: find $q$ and $r$ with $f = qg + r$ and $\\deg r < \\deg g$ (coefficients from $0$ to $' + (p - 1) + '$).', a: multi([part('$q =$', expr(pPlain(qr[0]))), part('$r =$', expr(pPlain(qr[1])))]),
        steps: ['Long division, but every coefficient is worked mod $' + p + '$' + (g[g.length - 1] !== 1 ? '; dividing by the leading coefficient $' + g[g.length - 1] + '$ means multiplying by its inverse $' + invMod(g[g.length - 1], p) + '$ mod $' + p + '$' : '') + '.', '$q = ' + pTexP(qr[0]) + '$, $r = ' + pTexP(qr[1]) + '$.', 'Check: $qg + r = ' + pTexP(padd(pmul(qr[0], g, p), qr[1], p)) + '$.'], hint: 'Match the leading term each time, reducing mod $' + p + '$.' };
    }
    if (shape === 'rem') {
      var p2 = R.pick([5, 7, 11]), f2 = randPoly(R, R.int(3, 5), p2, false), c = R.int(1, p2 - 1);
      return { q: 'Find the remainder when $' + pTexP(f2) + '$ is divided by $' + xMinus(c, p2) + '$ in $' + zpx(p2) + '$.', a: num(peval(f2, c, p2)),
        steps: ['Remainder theorem: dividing by $x - c$ leaves the constant $f(c)$. Here $' + xMinus(c, p2) + ' = x - ' + c + '$.', '$f(' + c + ') \\equiv ' + peval(f2, c, p2) + ' \\pmod{' + p2 + '}$.'], hint: 'Evaluate at the root of the divisor.' };
    }
    if (shape === 'roots' || shape === 'factor') {
      var p3 = R.pick([5, 7, 11]), f3;
      if (R.coin()) { var r1 = R.int(0, p3 - 1), r2 = R.int(0, p3 - 1); f3 = pmul(pmul([mod(-r1, p3), 1], [mod(-r2, p3), 1], p3), R.coin() ? [R.int(1, p3 - 1), 1] : [1], p3); } else f3 = randPoly(R, R.int(2, 3), p3, true);
      var rts = proots(f3, p3);
      if (shape === 'factor') { var c3 = R.coin() && rts.length ? R.pick(rts) : R.int(0, p3 - 1), isF = peval(f3, c3, p3) === 0; return { q: 'Is $' + xMinus(c3, p3) + '$ a factor of $' + pTexP(f3) + '$ in $' + zpx(p3) + '$?', a: tf(isF), steps: ['$x - c$ divides $f$ exactly when $f(c) = 0$ (factor theorem).', '$f(' + c3 + ') \\equiv ' + peval(f3, c3, p3) + '$.', isF ? 'So yes.' : 'So no.'], hint: 'Evaluate $f(' + c3 + ')$ mod $' + p3 + '$.' }; }
      return { q: 'Find all roots of $' + pTexP(f3) + '$ in $' + Z(p3) + '$.', a: setA(rts),
        steps: ['Test each of $0, 1, \\dots, ' + (p3 - 1) + '$.', range(0, p3 - 1).map(function (x) { return 'f(' + x + ') = ' + peval(f3, x, p3); }).map(function (s) { return '$' + s + '$'; }).join(', ') + '.', rts.length ? 'Roots: $' + rts.join(', ') + '$.' : 'No roots.'], hint: 'A finite field lets you test every element.' };
    }
    if (shape === 'many') {
      var n4 = R.pick([8, 12, 15, 16, 21, 24, 35]), a4 = R.pick([1, 1, 4]), rt = range(0, n4 - 1).filter(function (x) { return (x * x - a4) % n4 === 0; });
      if (!rt.length) { a4 = 1; rt = range(0, n4 - 1).filter(function (x) { return (x * x - 1) % n4 === 0; }); }
      return { q: 'How many roots does $x^{2} - ' + a4 + '$ have in $' + Z(n4) + '$?', a: num(rt.length),
        steps: ['Test every element of $' + Z(n4) + '$: the roots are $' + rt.join(', ') + '$.', 'There are $' + rt.length + '$' + (rt.length > 2 ? ', more than the degree $2$: $' + Z(n4) + '$ is not a field (not even an integral domain), so the root bound does not apply.' : '.')], hint: 'Square each element mod $' + n4 + '$.' };
    }
    var g5 = [R.nz(-3, 3), 2], f5 = [R.int(-5, 5), R.int(-4, 4), R.nz(-3, 3), R.pick([1, 2, -1, 3])], qf = (function () { // division over Q (exact)
      var Q = ML.Q, r = f5.map(function (x) { return Q(x); }), q = [Q(0), Q(0), Q(0)];
      for (var k = 3; k >= 1; k--) { var c = r[k].div(2); q[k - 1] = c; r[k] = r[k].sub(c.mul(2)); r[k - 1] = r[k - 1].sub(c.mul(g5[0])); }
      return [q, r[0]];
    })();
    var qPlain = qf[0].map(function (c, i) { return '(' + c.toPlain() + ')' + (i ? '*x' + (i > 1 ? '^' + i : '') : ''); }).reverse().join(' + ');
    return { q: 'Divide $f = ' + ipTex(f5) + '$ by $g = ' + ipTex(g5) + '$ in $\\mathbb{Q}[x]$. Find the quotient $q$ (the remainder is a constant).', a: expr(qPlain),
      steps: ['Over $\\mathbb{Q}$ we may divide by the leading coefficient $2$, so fractions can appear.', 'Long division gives $q = ' + qf[0].map(function (c, i) { return [c, i]; }).reverse().filter(function (t) { return !t[0].isZero(); }).map(function (t, j) { var s = t[0].abs().toTex(), sign = t[0].sign() < 0 ? '-' : j ? '+' : ''; return (j ? ' ' + sign + ' ' : sign) + (t[1] && t[0].abs().eq(1) ? '' : s) + (t[1] ? 'x' + (t[1] > 1 ? '^{' + t[1] + '}' : '') : ''); }).join('') + '$ and remainder $' + qf[1].toTex() + '$.', 'Check: $qg + r = f$.'], hint: 'Divide each leading term by $2x$.' };
  });

  G('aa.polynomial-gcd', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['gcd', 'gcd', 'coprime']), R.pick(['gcd', 'gcdQ', 'coprime']), R.pick(['inverse', 'gcdQ', 'gcd']));
    if (shape === 'gcd' || shape === 'coprime') {
      var p = R.pick([2, 3, 5]), d = shape === 'coprime' && R.coin() ? [1] : randPoly(R, R.int(1, 2), p, true), u, v, tries = 0;
      do { u = randPoly(R, R.int(1, 2), p, false); v = randPoly(R, R.int(1, 2), p, false); tries++; } while (pgcd(u, v, p).length > 1 && tries < 50);
      var f = pmul(d, u, p), g = pmul(d, v, p), gg = pgcd(f, g, p), seq = [], A = f, B = g;
      while (B.length) { var qr = pdivmod(A, B, p); seq.push('$' + pTexP(A) + ' = (' + pTexP(qr[0]) + ')(' + pTexP(B) + ')' + (qr[1].length ? ' + ' + pTexP(qr[1]) : '') + '$'); A = B; B = qr[1]; }
      if (shape === 'coprime') return { q: 'Are $f = ' + pTexP(f) + '$ and $g = ' + pTexP(g) + '$ relatively prime in $' + zpx(p) + '$?', a: tf(gg.length === 1), steps: ['Run the Euclidean algorithm (mod $' + p + '$).'].concat(seq).concat(['The last nonzero remainder, made monic, is $\\gcd = ' + pTexP(gg) + '$.', gg.length === 1 ? 'The gcd is $1$: relatively prime.' : 'The gcd has positive degree: not relatively prime.']), hint: 'Divide repeatedly until the remainder is $0$.' };
      return { q: 'Find $\\gcd(f, g)$ in $' + zpx(p) + '$ for $f = ' + pTexP(f) + '$ and $g = ' + pTexP(g) + '$. Give it monic, with coefficients from $0$ to $' + (p - 1) + '$.', a: expr(pPlain(gg)),
        steps: ['Euclidean algorithm, working mod $' + p + '$:'].concat(seq).concat(['The last nonzero remainder, scaled to be monic: $' + pTexP(gg) + '$.']), hint: 'Divide $f$ by $g$, then $g$ by the remainder, and so on.' };
    }
    if (shape === 'gcdQ') {
      var rs = R.sample([-3, -2, -1, 1, 2, 3, 4], 4), common = R.coin() ? [rs[0]] : [rs[0], rs[1]], fr = common.concat([rs[2]]), gr = common.concat([rs[3]]);
      var ip = function (roots) { var c = [1]; roots.forEach(function (r) { var n = [0].concat(c); for (var i = 0; i < c.length; i++) n[i] -= r * c[i]; c = n; }); return c; };
      var F = ip(fr), Gp = ip(gr), D = ip(common), sc = R.pick([1, 2, 3]);
      return { q: 'Find the monic $\\gcd$ of $f = ' + ipTex(F.map(function (x) { return x * sc; })) + '$ and $g = ' + ipTex(Gp) + '$ in $\\mathbb{Q}[x]$.', a: expr(ipPlain(D)),
        steps: ['Look for common roots (or run the Euclidean algorithm).', '$f = ' + (sc > 1 ? sc : '') + fr.map(function (r) { return '(' + xMinus(r) .replace('- -', '+ ') + ')'; }).join('') + '$ and $g = ' + gr.map(function (r) { return '(' + xMinus(r).replace('- -', '+ ') + ')'; }).join('') + '$.', 'Common factors: $' + common.map(function (r) { return '(' + xMinus(r).replace('- -', '+ ') + ')'; }).join('') + ' = ' + ipTex(D) + '$, already monic' + (sc > 1 ? ' (the constant $' + sc + '$ is a unit in $\\mathbb{Q}$ and does not count)' : '') + '.'], hint: 'Factor both, or divide repeatedly.' };
    }
    var p2 = R.pick([2, 3, 5]), dg = R.pick([2, 3]), f2 = R.pick(irrList(dg, p2)), a = randPoly(R, dg - 1, p2, false), inv = gfinv(a, f2, p2);
    return { q: 'In $' + zpx(p2) + '/(' + pTexP(f2) + ')$, find the inverse of $' + pTexP(a) + '$ (a polynomial of degree less than $' + dg + '$, coefficients from $0$ to $' + (p2 - 1) + '$).', a: expr(pPlain(inv)),
      steps: ['$' + pTexP(f2) + '$ is irreducible, so $\\gcd(' + pTexP(a) + ', ' + pTexP(f2) + ') = 1$, and the extended Euclidean algorithm gives $s \\cdot (' + pTexP(a) + ') + t \\cdot (' + pTexP(f2) + ') = 1$.', 'Then $s$ is the inverse: here $s = ' + pTexP(inv) + '$.', 'Check: $(' + pTexP(a) + ')(' + pTexP(inv) + ') = ' + pTexP(pmul(a, inv, p2)) + ' \\equiv ' + pTexP(gfmul(a, inv, f2, p2)) + '$ after reducing by $' + pTexP(f2) + '$.'], hint: 'Run the Euclidean algorithm backward to write $1$ as a combination.' };
  });

  G('aa.irreducible-low-degree', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['test', 'test', 'real']), R.pick(['count', 'factor', 'test', 'real']), R.pick(['deg4', 'count', 'factor', 'test']));
    if (shape === 'test') {
      var p = R.pick([2, 3, 5, 7]), d = R.pick([2, 3]), f = randPoly(R, d, p, true), rts = proots(f, p), irr = !rts.length;
      return { q: 'Is $' + pTexP(f) + '$ irreducible over $' + Z(p) + '$?', a: tf(irr),
        steps: ['A polynomial of degree ' + d + ' over a field is reducible exactly when it has a factor of degree 1, that is, a root.', 'Values: ' + range(0, p - 1).map(function (x) { return '$f(' + x + ') = ' + peval(f, x, p) + '$'; }).join(', ') + '.', irr ? 'No root, so it is irreducible.' : '$f(' + rts[0] + ') = 0$, so $' + xMinus(rts[0], p) + '$ is a factor: reducible.'], hint: 'Degree 2 or 3: look for a root.' };
    }
    if (shape === 'real') {
      var b = R.int(-6, 6), c = R.int(-5, 12), fld = R.pick(['R', 'Q', 'C']), disc = b * b - 4 * c, sq = disc >= 0 && U.isSquare(disc), irr2 = fld === 'C' ? false : fld === 'R' ? disc < 0 : !sq;
      return { q: 'Is $' + T.poly([1, b, c], 'x') + '$ irreducible over $\\mathbb{' + fld + '}$?', a: tf(irr2),
        steps: ['A quadratic is irreducible over a field exactly when it has no root there.', 'Discriminant: $' + T.p(b) + '^{2} - 4 \\cdot ' + T.p(c) + ' = ' + disc + '$.', fld === 'C' ? 'Over $\\mathbb{C}$ every quadratic has roots: reducible.' : fld === 'R' ? (disc < 0 ? 'Negative: no real roots, so irreducible over $\\mathbb{R}$.' : 'Not negative: real roots, so reducible over $\\mathbb{R}$.') : (sq ? 'A perfect square: rational roots, so reducible over $\\mathbb{Q}$.' : 'Not a perfect square: no rational roots, so irreducible over $\\mathbb{Q}$.')], hint: 'Look at the discriminant, and ask which square roots exist in the field.' };
    }
    if (shape === 'count') {
      var p2 = R.pick([2, 3, 5, 7]), d2 = p2 > 3 ? 2 : R.pick([2, 3]), cnt = irrList(d2, p2).length;
      return { q: 'How many monic irreducible polynomials of degree $' + d2 + '$ are there over $' + Z(p2) + '$?', a: num(cnt),
        steps: d2 === 2 ? ['There are $' + p2 + '^{2} = ' + (p2 * p2) + '$ monic quadratics.', 'The reducible ones are $(x - a)(x - b)$: $' + p2 + '$ with $a = b$ and $\\binom{' + p2 + '}{2} = ' + (p2 * (p2 - 1) / 2) + '$ with $a \\ne b$.', 'Irreducible: $' + (p2 * p2) + ' - ' + p2 + ' - ' + (p2 * (p2 - 1) / 2) + ' = ' + cnt + '$, which is $(p^{2} - p)/2$.'] : ['There are $' + p2 + '^{3} = ' + M.pow(p2, 3) + '$ monic cubics.', 'Reducible ones have a linear factor: three linear factors (with repeats) or a linear times an irreducible quadratic. Counting these and subtracting leaves $(p^{3} - p)/3$.', 'For $p = ' + p2 + '$: $(' + M.pow(p2, 3) + ' - ' + p2 + ')/3 = ' + cnt + '$.'], hint: 'Count all monic ones, then subtract the products of lower-degree factors.' };
    }
    if (shape === 'factor') {
      var p3 = R.pick([5, 7, 11, 13]), r1 = R.int(0, p3 - 1), r2 = R.int(0, p3 - 1), f3 = pmul([mod(-r1, p3), 1], [mod(-r2, p3), 1], p3);
      return { q: 'Find all roots of $' + pTexP(f3) + '$ in $' + Z(p3) + '$ (so you can factor it).', a: setA(uniqN([r1, r2])),
        steps: ['Test values (or use the quadratic formula mod $' + p3 + '$).', 'Roots: $' + uniqN([r1, r2]).join(', ') + '$.', 'So $' + pTexP(f3) + ' = (' + xMinus(r1, p3) + ')(' + xMinus(r2, p3) + ')$ in $' + zpx(p3) + '$.'], hint: 'Try $x = 0, 1, 2, \\dots$' };
    }
    var p4 = R.pick([2, 3]), f4, tries = 0; do { f4 = randPoly(R, 4, p4, true); tries++; } while (proots(f4, p4).length && tries < 200);
    var irr4 = pirred(f4, p4), fac = null; if (!irr4) irrList(2, p4).forEach(function (q) { if (!fac && !pdivmod(f4, q, p4)[1].length) fac = [q, pdivmod(f4, q, p4)[0]]; });
    return { q: 'The polynomial $f = ' + pTexP(f4) + '$ has no root in $' + Z(p4) + '$. Is it irreducible over $' + Z(p4) + '$?', a: tf(irr4),
      steps: ['No root means no linear factor, but a quartic could still be a product of two irreducible quadratics.', 'The monic irreducible quadratics over $' + Z(p4) + '$: ' + irrList(2, p4).map(function (q) { return '$' + pTexP(q) + '$'; }).join(', ') + '.', irr4 ? 'None of them divides $f$, so $f$ is irreducible.' : '$f = (' + pTexP(fac[0]) + ')(' + pTexP(fac[1]) + ')$: reducible, even with no root.'], hint: 'Test division by each irreducible quadratic.' };
  });

  function eisPrime(f) { // smallest prime p with Eisenstein at p (f integer, low -> high), or 0
    var lead = f[f.length - 1];
    for (var p = 2; p < 50; p++) { if (!isPrime(p)) continue; if (lead % p === 0) continue; if (!f.slice(0, -1).every(function (c) { return c % p === 0; })) continue; if (f[0] % (p * p) === 0) continue; return p; }
    return 0;
  }
  function ratRoots(f) { // rational roots of integer polynomial (low -> high), as Q
    var a0 = M.abs(f[0]), an = M.abs(f[f.length - 1]), out = [];
    if (f[0] === 0) out.push(ML.Q(0));
    if (a0) divisors(a0).forEach(function (pn) { divisors(an).forEach(function (q) { [1, -1].forEach(function (s) { var r = ML.Q(s * pn, q); if (ipeval(f, r).isZero() && !out.some(function (x) { return x.eq(r); })) out.push(r); }); }); });
    return out;
  }
  G('aa.irreducibility-tests', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['eis', 'rrt', 'eis']), R.pick(['eisTF', 'cubic', 'rrt', 'eis']), R.pick(['modp', 'cubic', 'eisTF']));
    if (shape === 'eis' || shape === 'eisTF') {
      var p = R.pick([2, 3, 5, 7]), dg = R.int(3, 5), f = [p * R.pick([1, -1, 2, 3, -2].filter(function (x) { return x % p; }))];
      for (var i = 1; i < dg; i++) f.push(p * R.int(-3, 3)); f.push(R.pick([1, 1, 2, 3].filter(function (x) { return x % p; })));
      var ep = eisPrime(f);
      if (shape === 'eis') return { q: 'Find the smallest prime $p$ for which Eisenstein\'s criterion shows that $' + ipTex(f) + '$ is irreducible over $\\mathbb{Q}$.', a: num(ep),
        steps: ['Eisenstein at $p$: $p$ divides every coefficient except the leading one, $p$ does not divide the leading coefficient, and $p^{2}$ does not divide the constant term.', 'Constant term $' + f[0] + '$; its prime factors are the candidates: ' + factorize(M.abs(f[0])).map(function (x) { return '$' + x[0] + '$'; }).join(', ') + '.', 'The smallest that works is $p = ' + ep + '$.'], hint: 'The prime must divide the constant term but its square must not.' };
      var q = R.pick(factorize(M.abs(f[0])).map(function (x) { return x[0]; }).concat([R.pick([2, 3, 5])])), ok = f.slice(0, -1).every(function (c) { return c % q === 0; }) && f[f.length - 1] % q !== 0 && f[0] % (q * q) !== 0;
      return { q: 'Does Eisenstein\'s criterion with $p = ' + q + '$ apply to $' + ipTex(f) + '$?', a: tf(ok),
        steps: ['Check three things for $p = ' + q + '$:', '(1) $' + q + '$ divides ' + f.slice(0, -1).map(function (c) { return '$' + c + '$'; }).join(', ') + '? ' + (f.slice(0, -1).every(function (c) { return c % q === 0; }) ? 'Yes.' : 'No.') + ' (2) $' + q + ' \\nmid ' + f[f.length - 1] + '$? ' + (f[f.length - 1] % q ? 'Yes.' : 'No.') + ' (3) $' + (q * q) + ' \\nmid ' + f[0] + '$? ' + (f[0] % (q * q) ? 'Yes.' : 'No.'), ok ? 'All three hold: it applies, so the polynomial is irreducible over $\\mathbb{Q}$.' : 'Not all hold, so it does not apply with $p = ' + q + '$ (which by itself proves nothing either way).'], hint: 'Check each condition separately.' };
    }
    if (shape === 'rrt' || shape === 'cubic') {
      var withRoot = R.coin(), F;
      if (withRoot) { var r = R.nz(-3, 3), qd = [R.nz(-4, 4), R.int(-3, 3), 1]; F = []; for (var k = 0; k <= 3; k++) F.push((k ? qd[k - 1] : 0) - r * (qd[k] || 0)); }
      else { var tries = 0; do { F = [R.nz(-6, 6), R.int(-5, 5), R.int(-4, 4), 1]; tries++; } while (ratRoots(F).length && tries < 100); }
      var rr = ratRoots(F);
      if (shape === 'rrt') return { q: 'List all rational roots of $' + ipTex(F) + '$.', a: setA(rr.map(function (x) { return x.toPlain(); })),
        steps: ['A rational root $r/s$ in lowest terms has $r \\mid ' + F[0] + '$ and $s \\mid 1$: candidates $\\pm ' + divisors(M.abs(F[0])).join(', \\pm ') + '$.', 'Test them: ' + divisors(M.abs(F[0])).map(function (d) { return '$f(' + d + ') = ' + ipeval(F, d).toTex() + '$, $f(' + (-d) + ') = ' + ipeval(F, -d).toTex() + '$'; }).join('; ') + '.', rr.length ? 'Rational roots: $' + rr.map(function (x) { return x.toTex(); }).join(', ') + '$.' : 'None.'], hint: 'Rational root theorem: test the divisors of the constant term.' };
      return { q: 'Is $' + ipTex(F) + '$ irreducible over $\\mathbb{Q}$?', a: tf(!rr.length),
        steps: ['A cubic over $\\mathbb{Q}$ is reducible exactly when it has a rational root.', 'Candidates (monic): $\\pm ' + divisors(M.abs(F[0])).join(', \\pm ') + '$.', rr.length ? '$f(' + rr[0].toTex() + ') = 0$, so it is reducible.' : 'None is a root, so it is irreducible.'], hint: 'Use the rational root theorem.' };
    }
    var Fm, ps, tries2 = 0; do { Fm = [R.nz(-9, 9), R.int(-9, 9), R.int(-9, 9), 1]; ps = [2, 3, 5, 7].filter(function (p) { return pirred(pnorm(Fm, p), p); }); tries2++; } while ((ps.length < 1 || ps.length > 2 || ratRoots(Fm).length) && tries2 < 400);
    if (!ps.length) { Fm = [1, 1, 0, 1]; ps = [2, 5]; }
    var good = ps[0], bads = [2, 3, 5, 7].filter(function (p) { return ps.indexOf(p) < 0; });
    return { q: 'To show $f = ' + ipTex(Fm) + '$ is irreducible over $\\mathbb{Q}$, reduce it mod a prime $p$. For which $p$ does the reduction prove it?', a: mc('$p = ' + good + '$', bads.slice(0, 3).map(function (p) { return '$p = ' + p + '$'; })),
      steps: ['If $f$ is monic and its reduction mod $p$ is irreducible over $' + Z('p') + '$, then $f$ is irreducible over $\\mathbb{Q}$ (a factorization over $\\mathbb{Z}$ would reduce to one mod $p$).', 'Mod $' + good + '$: $' + pTexP(pnorm(Fm, good)) + '$ has no root in $' + Z(good) + '$, so (being a cubic) it is irreducible.', bads.slice(0, 3).map(function (p) { var rr2 = proots(pnorm(Fm, p), p); return 'Mod $' + p + '$ it has the root $' + rr2[0] + '$, which proves nothing.'; }).join(' ')], hint: 'Reduce mod each prime and look for roots.' };
  });


  // ================================================================ unit 10: fields and extensions
  function sqf(n) { var r = 1; factorize(n).forEach(function (f) { if (f[1] % 2) r *= f[0]; }); return r; } // squarefree part
  function sqrtTex(d) { return '\\sqrt{' + d + '}'; }
  function abTex(a, b, d) { // a + b√d with a, b in Q
    a = ML.Q.from(a); b = ML.Q.from(b);
    var bt = b.isZero() ? '' : (b.abs().eq(1) ? '' : b.abs().toTex()) + sqrtTex(d);
    if (a.isZero()) return b.isZero() ? '0' : (b.sign() < 0 ? '-' : '') + bt;
    return a.toTex() + (b.isZero() ? '' : (b.sign() < 0 ? ' - ' : ' + ') + bt);
  }
  var FPRIMES = [[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [5, 2], [7, 2]]; // (p, n) for GF(p^n)
  function gfPick(R, L) { var c = L === 1 ? R.pick([[2, 2], [2, 3], [3, 2]]) : R.pick(FPRIMES); var f = R.pick(irrList(c[1], c[0])); return { p: c[0], n: c[1], f: f }; }
  function gfName(F) { return zpx(F.p) + '/(' + pTexP(F.f) + ')'; }
  function randEl(R, F, nonzero) { var a; do { a = ptrim(range(0, F.n - 1).map(function () { return R.int(0, F.p - 1); })); } while (nonzero && (!a.length || (a.length === 1 && a[0] === 1))); return a; }

  G('aa.field-extensions', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['mul', 'inv', 'mul']), R.pick(['inv', 'div', 'isfield', 'mul']), R.pick(['cube', 'div', 'inv', 'isfield']));
    var d = R.pick([2, 3, 5, 6, 7]);
    if (shape === 'mul') {
      var a = R.nz(-4, 4), b = R.nz(-3, 3), c = R.nz(-4, 4), e = R.nz(-3, 3), P = a * c + b * e * d, Qv = a * e + b * c;
      return { q: 'In $\\mathbb{Q}(' + sqrtTex(d) + ')$, write $(' + abTex(a, b, d) + ')(' + abTex(c, e, d) + ')$ as $p + q' + sqrtTex(d) + '$.', a: multi([part('$p =$', num(P)), part('$q =$', num(Qv))]),
        steps: ['Expand and use $(' + sqrtTex(d) + ')^{2} = ' + d + '$.', '$' + (a * c) + ' + ' + T.p(a * e) + sqrtTex(d) + ' + ' + T.p(b * c) + sqrtTex(d) + ' + ' + T.p(b * e) + ' \\cdot ' + d + '$.', '$= ' + abTex(P, Qv, d) + '$.'], hint: 'FOIL, then replace $(' + sqrtTex(d) + ')^{2}$ by $' + d + '$.' };
    }
    if (shape === 'inv' || shape === 'div') {
      var a2 = R.nz(-5, 5), b2 = R.nz(-3, 3), N = a2 * a2 - d * b2 * b2, c2 = shape === 'div' ? R.nz(-4, 4) : 1, e2 = shape === 'div' ? R.nz(-3, 3) : 0;
      var P2 = ML.Q(c2 * a2 - e2 * b2 * d, N), Q2 = ML.Q(e2 * a2 - c2 * b2, N);
      return { q: 'In $\\mathbb{Q}(' + sqrtTex(d) + ')$, write $' + (shape === 'div' ? '\\dfrac{' + abTex(c2, e2, d) + '}{' + abTex(a2, b2, d) + '}' : '\\dfrac{1}{' + abTex(a2, b2, d) + '}') + '$ as $p + q' + sqrtTex(d) + '$ with rational $p$, $q$.', a: multi([part('$p =$', num(P2.toPlain())), part('$q =$', num(Q2.toPlain()))]),
        steps: ['Multiply top and bottom by the conjugate $' + abTex(a2, -b2, d) + '$.', 'Bottom: $(' + abTex(a2, b2, d) + ')(' + abTex(a2, -b2, d) + ') = ' + T.p(a2) + '^{2} - ' + d + ' \\cdot ' + T.p(b2) + '^{2} = ' + N + '$, a nonzero rational (since $' + sqrtTex(d) + '$ is irrational).', 'Top: $(' + abTex(c2, e2, d) + ')(' + abTex(a2, -b2, d) + ') = ' + abTex(c2 * a2 - e2 * b2 * d, e2 * a2 - c2 * b2, d) + '$.', 'So the answer is $' + abTex(P2, Q2, d) + '$.'], hint: 'Rationalize with the conjugate.' };
    }
    if (shape === 'isfield') {
      var F, tries = 0, want = R.coin(); do { F = [R.nz(-6, 6), R.int(-4, 4), R.int(-3, 3), 1]; tries++; } while (tries < 100 && (ratRoots(F).length === 0) !== want);
      var rr = ratRoots(F);
      return { q: 'Is $\\mathbb{Q}[x]/(' + ipTex(F) + ')$ a field?', a: tf(!rr.length),
        steps: ['$F[x]/(f)$ is a field exactly when $f$ is irreducible over $F$.', 'A cubic over $\\mathbb{Q}$ is irreducible exactly when it has no rational root; candidates $\\pm ' + divisors(M.abs(F[0])).join(', \\pm ') + '$.', rr.length ? '$f(' + rr[0].toTex() + ') = 0$, so $f$ is reducible and the quotient has zero divisors: not a field.' : 'No candidate is a root, so $f$ is irreducible and the quotient is a field.'], hint: 'Test the rational root candidates.' };
    }
    var t1 = [R.int(-2, 3), R.int(-2, 2), R.nz(-1, 2)], t2 = [R.nz(-2, 3), R.nz(-2, 2)], pr = [0, 0, 0, 0];
    t1.forEach(function (x, i) { t2.forEach(function (y, j) { pr[i + j] += x * y; }); });
    var res = [pr[0] + 2 * pr[3], pr[1], pr[2]];
    var thTex = function (c) { return T.terms([[c[0], ''], [c[1], '\\theta'], [c[2] || 0, '\\theta^{2}']]); };
    return { q: 'Let $\\theta = \\sqrt[3]{2}$, so $\\theta^{3} = 2$. In $\\mathbb{Q}(\\theta)$, write $(' + thTex(t1) + ')(' + thTex(t2) + ')$ as $a + b\\theta + c\\theta^{2}$.', a: multi([part('$a =$', num(res[0])), part('$b =$', num(res[1])), part('$c =$', num(res[2]))]),
      steps: ['Expand: $' + T.terms([[pr[0], ''], [pr[1], '\\theta'], [pr[2], '\\theta^{2}'], [pr[3], '\\theta^{3}']]) + '$.', 'Replace $\\theta^{3}$ by $2$: $' + thTex(res) + '$.', 'Every element of $\\mathbb{Q}(\\theta)$ has this form: $1, \\theta, \\theta^{2}$ is a basis, since $x^{3} - 2$ is irreducible.'], hint: 'Multiply out and use $\\theta^{3} = 2$.' };
  });

  G('aa.minimal-polynomials', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['quad', 'quad', 'degree']), R.pick(['cube', 'quad', 'degree', 'sum']), R.pick(['sum', 'cube', 'flaw', 'degree']));
    if (shape === 'quad') {
      var a = R.nz(-4, 4), b = R.pick([1, 2, 3, -1]), d = R.pick([2, 3, 5, 7]), c1 = -2 * a, c0 = a * a - b * b * d;
      return { q: 'Find the minimal polynomial of $\\alpha = ' + abTex(a, b, d) + '$ over $\\mathbb{Q}$.', a: expr(ipPlain([c0, c1, 1])),
        steps: ['$\\alpha - ' + T.p(a) + ' = ' + abTex(0, b, d) + '$; square: $(\\alpha ' + (a < 0 ? '+ ' + (-a) : '- ' + a) + ')^{2} = ' + (b * b * d) + '$.', 'Expand: $\\alpha^{2} ' + (c1 < 0 ? '- ' + (-c1) : '+ ' + c1) + '\\alpha ' + (c0 < 0 ? '- ' + (-c0) : '+ ' + c0) + ' = 0$.'.replace('+ 0 = 0', '= 0'), 'This quadratic has no rational root ($\\alpha$ is irrational), so it is irreducible: the minimal polynomial is $' + ipTex([c0, c1, 1]) + '$, and $[\\mathbb{Q}(\\alpha) : \\mathbb{Q}] = 2$.'], hint: 'Isolate the square root, then square.' };
    }
    if (shape === 'cube') {
      var c = R.nz(-3, 3), n = R.pick([2, 3, 5, 6, 7]), co = [-(c * c * c) - n, 3 * c * c, -3 * c, 1];
      return { q: 'Find the minimal polynomial of $\\alpha = ' + T.lin(1, '\\sqrt[3]{' + n + '}', c).replace(/^1\\/, '\\') + '$ over $\\mathbb{Q}$.', a: expr(ipPlain(co)),
        steps: ['$\\alpha ' + (c < 0 ? '+ ' + (-c) : '- ' + c) + ' = \\sqrt[3]{' + n + '}$, so $(\\alpha ' + (c < 0 ? '+ ' + (-c) : '- ' + c) + ')^{3} = ' + n + '$.', 'Expand: $' + ipTex(co, '\\alpha') + ' = 0$.', 'It is irreducible: a substitution $x \\mapsto x - ' + T.p(c) + '$ turns it into $x^{3} - ' + n + '$, which has no rational root. So this is the minimal polynomial, and the degree is $3$.'], hint: 'Move the constant over, then cube.' };
    }
    if (shape === 'sum') {
      var pr = R.pick([[2, 3], [2, 5], [3, 5], [2, 7], [3, 7], [5, 7], [2, 11], [3, 11]]), A = pr[0], B = pr[1], co2 = [(A - B) * (A - B), 0, -2 * (A + B), 0, 1];
      return { q: 'Find the minimal polynomial of $\\sqrt{' + A + '} + \\sqrt{' + B + '}$ over $\\mathbb{Q}$.', a: expr(ipPlain(co2)),
        steps: ['$\\alpha^{2} = ' + (A + B) + ' + 2\\sqrt{' + (A * B) + '}$, so $\\alpha^{2} - ' + (A + B) + ' = 2\\sqrt{' + (A * B) + '}$.', 'Square again: $\\alpha^{4} - ' + (2 * (A + B)) + '\\alpha^{2} + ' + ((A + B) * (A + B)) + ' = ' + (4 * A * B) + '$, so $' + ipTex(co2, '\\alpha') + ' = 0$.', 'It is irreducible: $[\\mathbb{Q}(\\sqrt{' + A + '}, \\sqrt{' + B + '}) : \\mathbb{Q}] = 4$ and $\\mathbb{Q}(\\alpha)$ is that whole field (it contains $\\sqrt{' + A + '} = (\\alpha^{2}' + T.signed(A - B) + ')/(2\\alpha)$).', 'Minimal polynomial: $' + ipTex(co2) + '$.'], hint: 'Square, isolate the remaining root, square again.' };
    }
    if (shape === 'degree') {
      var it = R.pick([['\\sqrt{' + R.pick([2, 3, 5, 7, 11]) + '}', 2, 'Minimal polynomial $x^{2} - d$, irreducible since $\\sqrt{d}$ is irrational.'], ['\\sqrt[3]{' + R.pick([2, 3, 5, 7]) + '}', 3, '$x^{3} - n$ has no rational root, so it is irreducible.'], ['\\sqrt[4]{2}', 4, '$x^{4} - 2$ is irreducible by Eisenstein at $2$.'], ['\\sqrt[5]{3}', 5, '$x^{5} - 3$ is irreducible by Eisenstein at $3$.'], ['\\sqrt{2} + \\sqrt{3}', 4, 'Its minimal polynomial is $x^{4} - 10x^{2} + 1$.'], ['i + \\sqrt{2}', 4, '$\\mathbb{Q}(i + \\sqrt{2}) = \\mathbb{Q}(i, \\sqrt{2})$, of degree $4$.'], ['e^{2\\pi i/5}', 4, 'It is a root of $x^{4} + x^{3} + x^{2} + x + 1$, irreducible (Eisenstein after $x \\mapsto x + 1$).'], ['e^{2\\pi i/7}', 6, 'It is a root of $x^{6} + \\cdots + x + 1$, irreducible.'], ['\\sqrt{8}', 2, '$\\sqrt{8} = 2\\sqrt{2}$, a root of $x^{2} - 8$.'], ['\\sqrt[3]{8}', 1, '$\\sqrt[3]{8} = 2$ is rational.'], ['\\sqrt{2}\\,\\sqrt{8}', 1, '$\\sqrt{2}\\,\\sqrt{8} = 4$ is rational.']]);
      return { q: 'What is $[\\mathbb{Q}(\\alpha) : \\mathbb{Q}]$ for $\\alpha = ' + it[0] + '$?', a: num(it[1]), steps: ['The degree is the degree of the minimal polynomial of $\\alpha$.', it[2], 'So the degree is $' + it[1] + '$.'], hint: 'Find a polynomial with root $\\alpha$, then make sure it is irreducible.' };
    }
    var d2 = R.pick([2, 3, 5]), choices = ['$x^{2} - ' + d2 + '$', '$x^{4} - ' + (d2 * d2) + '$', '$x^{3} - ' + d2 + 'x$', '$2x^{2} - ' + (2 * d2) + '$'];
    return { q: 'Which is the minimal polynomial of $\\sqrt{' + d2 + '}$ over $\\mathbb{Q}$?', a: mcKeep(choices, 0),
      steps: ['All four have $\\sqrt{' + d2 + '}$ as a root.', '$x^{4} - ' + (d2 * d2) + ' = (x^{2} - ' + d2 + ')(x^{2} + ' + d2 + ')$ and $x^{3} - ' + d2 + 'x = x(x^{2} - ' + d2 + ')$ factor; $2x^{2} - ' + (2 * d2) + '$ is not monic.', 'The minimal polynomial is monic and irreducible: $x^{2} - ' + d2 + '$.'], hint: 'Monic, irreducible, and with $\\sqrt{' + d2 + '}$ as a root.' };
  });

  G('aa.tower-law', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['twosqrt', 'tower', 'twosqrt']), R.pick(['mixed', 'tower', 'divides', 'twosqrt']), R.pick(['mixed', 'construct', 'divides', 'twosqrt']));
    if (shape === 'twosqrt') {
      var a = R.pick([2, 3, 5, 6, 7, 8, 12, 18, 10, 15]), b = R.pick([2, 3, 5, 8, 12, 18, 20, 27, 45, 50].filter(function (x) { return x !== a; })), sa = sqf(a), sb = sqf(b), deg = sa === 1 && sb === 1 ? 1 : sa === 1 || sb === 1 || sa === sb ? 2 : 4;
      return { q: 'Find $[\\mathbb{Q}(\\sqrt{' + a + '}, \\sqrt{' + b + '}) : \\mathbb{Q}]$.', a: num(deg),
        steps: [a === sa && b === sb ? 'Both $' + a + '$ and $' + b + '$ are square-free, so there is nothing to simplify.' : 'Simplify: ' + [[a, sa], [b, sb]].filter(function (u) { return u[0] !== u[1]; }).map(function (u) { return '$\\sqrt{' + u[0] + '} = ' + M.sqrt(u[0] / u[1]) + '\\sqrt{' + u[1] + '}$'; }).join(' and ') + '.',
 deg === 4 ? '$[\\mathbb{Q}(\\sqrt{' + sa + '}) : \\mathbb{Q}] = 2$, and $\\sqrt{' + sb + '} \\notin \\mathbb{Q}(\\sqrt{' + sa + '})$ (different square-free parts), so adjoining it doubles the degree again.' : 'Both square roots generate the same field (or one is rational), so nothing new is added.', 'Tower law: the degree is $' + deg + '$.'], hint: 'Pull out squares first: $\\sqrt{8} = 2\\sqrt{2}$.' };
    }
    if (shape === 'tower') {
      var x = R.pick([2, 3, 4, 5, 6]), y = R.pick([2, 3, 4, 5]), ask = R.int(0, 2);
      var q = ask === 0 ? '$F \\subseteq K \\subseteq L$ are fields with $[L : K] = ' + x + '$ and $[K : F] = ' + y + '$. Find $[L : F]$.' : ask === 1 ? '$F \\subseteq K \\subseteq L$ are fields with $[L : F] = ' + (x * y) + '$ and $[K : F] = ' + y + '$. Find $[L : K]$.' : '$F \\subseteq K \\subseteq L$ are fields with $[L : F] = ' + (x * y) + '$ and $[L : K] = ' + x + '$. Find $[K : F]$.';
      return { q: q, a: num(ask === 0 ? x * y : ask === 1 ? x : y), steps: ['Tower law: $[L : F] = [L : K]\\,[K : F]$.', 'A basis of $L$ over $F$ is all products $a_i b_j$ of a basis $\\{a_i\\}$ of $L$ over $K$ and a basis $\\{b_j\\}$ of $K$ over $F$.', 'So the missing degree is $' + (ask === 0 ? x * y : ask === 1 ? x : y) + '$.'], hint: 'Degrees multiply.' };
    }
    if (shape === 'mixed') {
      var it = R.pick([['\\mathbb{Q}(\\sqrt[3]{2}, \\sqrt{3})', 6, '$2$ and $3$ both divide the degree, and it is at most $2 \\cdot 3$.'], ['\\mathbb{Q}(\\sqrt[3]{2}, \\omega)', 6, 'with $\\omega = e^{2\\pi i/3}$: $\\omega \\notin \\mathbb{Q}(\\sqrt[3]{2}) \\subset \\mathbb{R}$ and $\\omega$ has degree $2$, so $3 \\cdot 2$.'], ['\\mathbb{Q}(\\sqrt[4]{2}, i)', 8, '$[\\mathbb{Q}(\\sqrt[4]{2}) : \\mathbb{Q}] = 4$, and $i$ is not real, so it adds a factor $2$.'], ['\\mathbb{Q}(\\sqrt{2}, \\sqrt[3]{5}, \\sqrt[5]{7})', 30, 'the degrees $2, 3, 5$ are pairwise coprime, so each divides the total, which is at most $30$.'], ['\\mathbb{Q}(\\sqrt{2}, \\sqrt[4]{2})', 4, '$\\sqrt{2} = (\\sqrt[4]{2})^{2}$ is already in $\\mathbb{Q}(\\sqrt[4]{2})$.'], ['\\mathbb{Q}(\\sqrt[3]{3}, \\sqrt[3]{9})', 3, '$\\sqrt[3]{9} = (\\sqrt[3]{3})^{2}$.'], ['\\mathbb{Q}(\\sqrt{3}, i)', 4, '$i \\notin \\mathbb{Q}(\\sqrt{3}) \\subset \\mathbb{R}$, so $2 \\cdot 2$.'], ['\\mathbb{Q}(\\sqrt[3]{2}, \\sqrt[3]{3})', 9, 'each cube root has degree $3$, and $\\sqrt[3]{3}$ still has degree $3$ over $\\mathbb{Q}(\\sqrt[3]{2})$.']]);
      return { q: 'Find $[' + it[0] + ' : \\mathbb{Q}]$.', a: num(it[1]), steps: ['Use the tower law, one generator at a time.', 'Here ' + it[2], 'So the degree is $' + it[1] + '$.'], hint: 'Adjoin one element at a time and multiply degrees; watch for elements already present.' };
    }
    if (shape === 'divides') {
      var dA = R.pick([2, 3, 4, 5, 6]), n = R.pick([4, 6, 8, 12, 16, 9, 10]), ok = n % dA === 0;
      return { q: '$K$ is an extension of $\\mathbb{Q}$ with $[K : \\mathbb{Q}] = ' + n + '$. Could $K$ contain an element $\\alpha$ whose minimal polynomial over $\\mathbb{Q}$ has degree $' + dA + '$?', a: tf(ok),
        steps: ['If $\\alpha \\in K$, then $\\mathbb{Q} \\subseteq \\mathbb{Q}(\\alpha) \\subseteq K$, so $[\\mathbb{Q}(\\alpha) : \\mathbb{Q}] = ' + dA + '$ divides $[K : \\mathbb{Q}] = ' + n + '$ (tower law).', ok ? '$' + dA + '$ divides $' + n + '$, so it is possible (for example $K$ could be built over $\\mathbb{Q}(\\alpha)$).' : '$' + dA + '$ does not divide $' + n + '$, so no.'], hint: 'The degree of $\\alpha$ must divide the degree of $K$.' };
    }
    var c = R.pick([['\\sqrt[3]{2}', false, 'Its degree is $3$, not a power of $2$ (the problem of doubling the cube).'], ['\\sqrt{5}', true, 'Degree $2$; a square root can be drawn.'], ['\\sqrt[4]{3}', true, 'It is $\\sqrt{\\sqrt{3}}$: two square roots in a row, degree $4$.'], ['\\sqrt[3]{5}', false, 'Degree $3$.'], ['\\cos 20^\\circ', false, '$\\cos 20^\\circ$ is a root of $8x^{3} - 6x - 1$, irreducible over $\\mathbb{Q}$: degree $3$ (trisecting $60^\\circ$ is impossible).'], ['\\sqrt{2} + \\sqrt{3}', true, 'Degree $4$, reached by two square roots.'], ['\\sqrt[3]{27}', true, 'It equals $3$, which is rational.']]);
    return { q: 'A real number is constructible with straightedge and compass only if its degree over $\\mathbb{Q}$ is a power of $2$ (and the numbers reached by square roots one at a time are constructible). Is $' + c[0] + '$ constructible?', a: tf(c[1]), steps: ['Constructible numbers lie in a tower of quadratic extensions, so their degree is a power of $2$.', c[2], c[1] ? 'So it is constructible.' : 'So it is not constructible.'], hint: 'Find the degree of its minimal polynomial.' };
  });

  G('aa.finite-fields', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['size', 'add', 'mul']), R.pick(['mul', 'pow', 'inv', 'size']), R.pick(['inv', 'pow', 'mul', 'gf4']));
    var F = gfPick(R, L), name = gfName(F);
    if (shape === 'size') { var kind = R.coin(); return { q: kind ? 'How many elements does the field $' + name + '$ have?' : 'How many nonzero elements does the field $' + name + '$ have?', a: num(M.pow(F.p, F.n) - (kind ? 0 : 1)), steps: ['$' + pTexP(F.f) + '$ is irreducible of degree $' + F.n + '$, so the quotient is a field.', 'Its elements are the remainders $a_0 + a_1x + \\cdots$ of degree less than $' + F.n + '$: $' + F.p + '^{' + F.n + '} = ' + M.pow(F.p, F.n) + '$ of them.'].concat(kind ? [] : ['Without $0$: $' + (M.pow(F.p, F.n) - 1) + '$.']), hint: 'Count the possible remainders.' }; }
    if (shape === 'gf4') { var it = R.pick([['$\\mathbb{Z}_{4}$ is a field with four elements.', false, '$2 \\cdot 2 = 0$ in $\\mathbb{Z}_{4}$, so $2$ has no inverse.'], ['There is a field with exactly $4$ elements.', true, '$\\mathbb{Z}_{2}[x]/(x^{2} + x + 1)$.'], ['There is a field with exactly $6$ elements.', false, 'A finite field has $p^{n}$ elements, and $6$ is not a prime power.'], ['Any two fields with $9$ elements are isomorphic.', true, 'Finite fields of the same size are isomorphic.'], ['In a field with $8$ elements, $1 + 1 = 0$.', true, 'Its characteristic is $2$ (the prime $p$ with $8 = p^{3}$).']]); return { q: 'True or false: ' + it[0], a: tf(it[1]), steps: [it[2], it[1] ? 'True.' : 'False.'], hint: 'Finite fields have prime-power size and prime characteristic.' }; }
    var a = randEl(R, F, true), b = randEl(R, F, true);
    if (shape === 'add') { var s = padd(a, b, F.p); return { q: 'In $' + name + '$, compute $(' + pTexP(a) + ') + (' + pTexP(b) + ')$ (coefficients from $0$ to $' + (F.p - 1) + '$).', a: expr(pPlain(s)), steps: ['Add like coefficients mod $' + F.p + '$; no reduction by $' + pTexP(F.f) + '$ is needed, since the degree stays below $' + F.n + '$.', 'Result: $' + pTexP(s) + '$.'], hint: 'Coefficientwise, mod $' + F.p + '$.' }; }
    if (shape === 'mul') { var pr = pmul(a, b, F.p), r = gfmul(a, b, F.f, F.p); return { q: 'In $' + name + '$, compute $(' + pTexP(a) + ')(' + pTexP(b) + ')$. Give the remainder of degree less than $' + F.n + '$ (coefficients from $0$ to $' + (F.p - 1) + '$).', a: expr(pPlain(r)),
      steps: ['Multiply, reducing coefficients mod $' + F.p + '$: $' + pTexP(pr) + '$.', 'Reduce by $' + pTexP(F.f) + '$: in this field $x^{' + F.n + '} = ' + pTexP(pnorm(F.f.slice(0, F.n).map(function (c) { return -c; }), F.p)) + '$.', 'Result: $' + pTexP(r) + '$.'], hint: 'Multiply, then replace high powers of $x$ using $' + pTexP(F.f) + ' = 0$.' }; }
    if (shape === 'pow') { var k = R.int(F.n + 1, M.pow(F.p, F.n) + 3), r2 = gfpow([0, 1], k, F.f, F.p), o = gford([0, 1], F.f, F.p);
      return { q: 'In $' + name + '$, reduce $x^{' + k + '}$ to a polynomial of degree less than $' + F.n + '$ (coefficients from $0$ to $' + (F.p - 1) + '$).', a: expr(pPlain(r2)),
        steps: ['Here $x$ has order $' + o + '$ in the multiplicative group (it divides $' + (M.pow(F.p, F.n) - 1) + '$), so $x^{' + k + '} = x^{' + (k % o) + '}$.', 'Compute $x^{' + (k % o) + '}$ by multiplying by $x$ repeatedly and reducing with $' + pTexP(F.f) + ' = 0$: $' + pTexP(r2) + '$.'], hint: 'Find the order of $x$ first, or keep multiplying by $x$ and reducing.' }; }
    var inv = gfinv(a, F.f, F.p);
    return { q: 'In $' + name + '$, find the inverse of $' + pTexP(a) + '$ (degree less than $' + F.n + '$, coefficients from $0$ to $' + (F.p - 1) + '$).', a: expr(pPlain(inv)),
      steps: ['Use the extended Euclidean algorithm on $' + pTexP(a) + '$ and $' + pTexP(F.f) + '$ (or search, since the field is small).', 'The inverse is $' + pTexP(inv) + '$.', 'Check: $(' + pTexP(a) + ')(' + pTexP(inv) + ') = ' + pTexP(pmul(a, inv, F.p)) + ' \\equiv 1$ after reducing by $' + pTexP(F.f) + '$.'], hint: 'Find $s$ with $s \\cdot (' + pTexP(a) + ') \\equiv 1$.' };
  });

  G('aa.finite-field-structure', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['countprim', 'order', 'subfields']), R.pick(['order', 'isprim', 'contains', 'countprim']), R.pick(['log', 'isprim', 'order', 'contains']));
    if (shape === 'countprim') { var c = R.pick([[2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [5, 2], [7, 2], [2, 6], [13, 1], [11, 1]]), q = M.pow(c[0], c[1]);
      return { q: 'How many primitive elements (generators of the multiplicative group) does $\\mathrm{GF}(' + q + ')$ have?', a: num(phi(q - 1)), steps: ['The nonzero elements form a cyclic group of order $' + (q - 1) + '$.', 'A cyclic group of order $' + (q - 1) + '$ has $\\varphi(' + (q - 1) + ') = ' + phi(q - 1) + '$ generators.'], hint: 'Count generators of a cyclic group of order $q - 1$.' }; }
    if (shape === 'subfields' || shape === 'contains') {
      var p = R.pick([2, 3, 5]), n = R.pick([4, 6, 8, 9, 10, 12]), m = R.pick(range(2, n - 1));
      if (shape === 'subfields') return { q: 'How many subfields does $\\mathrm{GF}(' + p + '^{' + n + '})$ have (counting itself and $' + Z(p) + '$)?', a: num(divisors(n).length), steps: ['$\\mathrm{GF}(' + p + '^{' + n + '})$ contains exactly one subfield $\\mathrm{GF}(' + p + '^{m})$ for each divisor $m$ of $' + n + '$.', 'Divisors of $' + n + '$: $' + divisors(n).join(', ') + '$.', 'So $' + divisors(n).length + '$ subfields.'], hint: 'Subfields match divisors of the exponent.' };
      return { q: 'Does $\\mathrm{GF}(' + p + '^{' + n + '})$ contain a subfield with $' + p + '^{' + m + '}$ elements?', a: tf(n % m === 0), steps: ['If $\\mathrm{GF}(' + p + '^{' + m + '}) \\subseteq \\mathrm{GF}(' + p + '^{' + n + '})$, the big field is a vector space over the small one, so $' + p + '^{' + n + '} = (' + p + '^{' + m + '})^{k}$ and $m \\mid n$; conversely each divisor gives a subfield.', n % m === 0 ? '$' + m + '$ divides $' + n + '$: yes.' : '$' + m + '$ does not divide $' + n + '$: no' + (m < n ? ', even though $' + m + ' < ' + n + '$.' : '.')], hint: 'Does $' + m + '$ divide $' + n + '$?' };
    }
    var F = gfPick(R, L === 1 ? 2 : L), name = gfName(F), q2 = M.pow(F.p, F.n);
    if (shape === 'order') { var a = randEl(R, F, true), o = gford(a, F.f, F.p);
      return { q: 'In $' + name + '$ (a field with $' + q2 + '$ elements), find the multiplicative order of $' + pTexP(a) + '$.', a: num(o),
        steps: ['The order divides $' + (q2 - 1) + '$ (Lagrange in the group of $' + (q2 - 1) + '$ nonzero elements): check the divisors $' + divisors(q2 - 1).join(', ') + '$.', divisors(q2 - 1).filter(function (d) { return d <= o; }).map(function (d) { return '$(' + pTexP(a) + ')^{' + d + '} = ' + pTexP(gfpow(a, d, F.f, F.p)) + '$'; }).join(', ') + '.', 'The first power equal to $1$ is the ' + ordinal(o) + ', so the order is $' + o + '$.'], hint: 'Only divisors of $' + (q2 - 1) + '$ can be orders.' }; }
    if (shape === 'isprim') { var o2 = gford([0, 1], F.f, F.p);
      return { q: 'Is $x$ a primitive element (a generator of the nonzero elements) of $' + name + '$?', a: tf(o2 === q2 - 1),
        steps: ['$x$ is primitive exactly when its order is $' + (q2 - 1) + '$.', 'Powers of $x$, reducing with $' + pTexP(F.f) + ' = 0$, first reach $1$ at $x^{' + o2 + '}$.', o2 === q2 - 1 ? 'So $x$ is primitive.' : 'So $x$ has order $' + o2 + '$ and is not primitive (the field is still a field; some other element generates).'], hint: 'Find the order of $x$.' }; }
    var gens = gfAll(F.f, F.p).filter(function (e) { return e.length && gford(e, F.f, F.p) === q2 - 1; }), g = R.coin() && gford([0, 1], F.f, F.p) === q2 - 1 ? [0, 1] : R.pick(gens), k = R.int(2, q2 - 2), h = gfpow(g, k, F.f, F.p);
    return { q: 'In $' + name + '$, $g = ' + pTexP(g) + '$ is a primitive element. Find the exponent $k$ with $0 \\le k < ' + (q2 - 1) + '$ and $g^{k} = ' + pTexP(h) + '$.', a: num(k),
      steps: ['List the powers of $g$, reducing each time with $' + pTexP(F.f) + ' = 0$.', range(1, k).map(function (e) { return '$g^{' + e + '} = ' + pTexP(gfpow(g, e, F.f, F.p)) + '$'; }).join(', ') + '.', 'So $k = ' + k + '$.'], hint: 'Multiply by $g$ repeatedly until you reach the target.' };
  });

})(window.MathLadder);
