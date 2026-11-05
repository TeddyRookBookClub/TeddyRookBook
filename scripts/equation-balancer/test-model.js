#!/usr/bin/env node
/* Tests for the Equation Balancer model (static/science-lab/equation-balancer/model.js).
   Run: node scripts/equation-balancer/test-model.js
   For every reaction: each drawing has exactly the atoms of its formula; the stored coefficients balance every element,
   have no common factor, and match the coefficients worked out independently from the atom counts (exact fractions). */
'use strict';
const path = require('path');
const M = require(path.join(__dirname, '..', '..', 'static', 'science-lab', 'equation-balancer', 'model.js'));
let fails = 0, n = 0;
function yes(name, v) { n++; if (!v) { fails++; console.log('FAIL', name); } }
const used = new Set();
M.REACTIONS.forEach(rx => {
  const sp = rx.r.concat(rx.p);
  sp.forEach(f => { used.add(f); yes(rx.id + ': ' + f + ' is a known substance', !!M.SPECIES[f]); });
  yes(rx.id + ': one coefficient per substance', rx.ans.length === sp.length);
  yes(rx.id + ': answer balances', M.balanced(rx, rx.ans));
  yes(rx.id + ': answer has no common factor', rx.ans.reduce((a, b) => M.gcd(a, b)) === 1);
  const s = M.solveCoefs(rx);
  yes(rx.id + ': solved independently = ' + (s && s.join(',')), s && s.join(',') === rx.ans.join(','));
  yes(rx.id + ': not balanced with all 1s (unless it should be)', !M.balanced(rx, sp.map(() => 1)) || rx.ans.every(c => c === 1));
  yes(rx.id + ': fits the 16-molecule limit', Math.max(...rx.ans) <= M.MAXC);
  console.log((M.balanced(rx, rx.ans) ? 'ok   ' : 'FAIL ') + rx.id.padEnd(10) + M.eqText(rx, rx.ans));
});
Object.keys(M.SPECIES).forEach(f => {
  const a = M.count(f), b = M.structCount(f);
  yes(f + ': drawing has the formula’s atoms', JSON.stringify(Object.keys(a).sort().map(k => [k, a[k]])) === JSON.stringify(Object.keys(b).sort().map(k => [k, b[k]])));
  Object.keys(a).forEach(e => yes(f + ': color for ' + e, !!M.EL[e]));
  const sh = M.shape(f);
  yes(f + ': layout is finite', sh.atoms.every(x => isFinite(x.x) && isFinite(x.y)) && isFinite(sh.ext));
  yes(f + ': used by a reaction', used.has(f));
});
// a few spot checks of the helper functions
const w = M.REACTIONS[0];
yes('H2 + O2 -> H2O with 1,1,1 is off by one O', M.imbalance(w, [1, 1, 1]) === 1);
yes('adding H2O helps oxygen and hurts hydrogen', (() => { const e = M.effect(w, [1, 1, 1], 2, 1); return e.per.O === -1 && e.per.H === 1; })());
yes('4,2,4 balances and reduces to 2,1,2', M.balanced(w, [4, 2, 4]) && M.reduce([4, 2, 4]).join() === '2,1,2');
console.log(`\n${M.REACTIONS.length} reactions, ${Object.keys(M.SPECIES).length} substances; ${n - fails} of ${n} checks passed`);
process.exit(fails ? 1 : 0);
