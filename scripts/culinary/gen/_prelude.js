(function (ML) {
  'use strict';
  if (!ML) return;
  var G = ML.gen, T = ML.T, U = ML.util, by = ML.byLevel;
  /* shared helpers (every Culinary course file starts with these) */
  function fx(x) { return +(+x).toPrecision(12); }
  function sg(x, n) { if (!x || !isFinite(x)) return x; return +(+x).toPrecision(n || 3); }
  function r2(x) { return Math.round(x * 100) / 100; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function tv(x) { x = fx(x); return Math.abs(x) >= 1000 ? T.commas(x) : String(x); }
  function AX(x) { return { t: 'num', v: String(fx(x)) }; }
  function A(x, n, rtol) { return { t: 'num', v: String(sg(x, n || 3)), rtol: rtol || 0.02 }; }
  function AT(x, tol) { return { t: 'num', v: String(fx(x)), tol: tol }; }
  function PC(x, rtol) { var o = { t: 'num', v: String(fx(x)), pct: true }; if (rtol) o.rtol = rtol; return o; }
  function MC(c, w) { return U.mc(c, w.filter(function (x) { return x !== c; }), 4); }
  function money(x) { return T.money(r2(x).toFixed(2).replace(/\.00$/, '')); }
  function m2(x) { return '\\$' + r2(x).toFixed(2); }
  /* a recall item: [question, correct answer, [wrong answers], why (shown after answering)] */
  function bank(R, items) { var it = R.pick(items); return { q: it[0], a: MC(it[1], it[2]), steps: [it[3] || (it[1] + '.')] }; }
  /* a true-or-false style pick between two lists: "Which of these is X?" */
  function which(R, q, yes, no, why) { var c = R.pick(yes); return { q: q, a: MC(c, R.sample(no, 3)), steps: [why ? why(c) : c + '.'] }; }
/*BODY*/
})(typeof window !== 'undefined' ? window.MathLadder : (typeof global !== 'undefined' ? global.MathLadder : null));
