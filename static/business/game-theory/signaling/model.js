/* Game Theory, Chapter 10 (Signaling and Screening): Spence's job-market signaling, Crawford–Sobel cheap talk
   (uniform-quadratic case) and a two-type screening menu. window.GT10M in the browser, module.exports in node
   (tested in /tmp/work_gt2/test/gt10.test.js). */
(function (root) {
  'use strict';

  /* ---------- Spence (1973), the two-type textbook version ----------
     Productivity thL (low type) or thH (high), share lam of high types. Education e is useless for productivity
     and costs cL·e to a low type and cH·e to a high type (cL > cH: school is harder for low types).
     Competitive employers pay the expected productivity given their beliefs. The candidate equilibria use a step
     belief: anyone with e ≥ es is paid wHi, anyone below is believed to be a low type and paid thL, so the only
     sensible choices are e = 0 and e = es.
       sep:  wHi = thH; highs choose es, lows choose 0.
       pool: wHi = lam·thH + (1 − lam)·thL; everyone chooses es.
       semi: highs choose es; lows choose es with probability pi, chosen so that lows are indifferent
             (wHi = thL + cL·es) and wHi equals the expected productivity at es by Bayes' rule. */
  function spence(p, mode, es) {
    var D = p.thH - p.thL, Eth = p.lam * p.thH + (1 - p.lam) * p.thL, r = { mode: mode, es: es, D: D, Eth: Eth }, tol = 1e-9;
    if (mode === 'sep') r.wHi = p.thH; else if (mode === 'pool') r.wHi = Eth; else r.wHi = p.thL + p.cL * es;
    r.uL0 = p.thL; r.uLs = r.wHi - p.cL * es; r.uH0 = p.thL; r.uHs = r.wHi - p.cH * es; // payoff of each type at e = 0 and at e = es
    if (mode === 'sep') { r.icL = r.uL0 >= r.uLs - tol; r.icH = r.uHs >= r.uH0 - tol; r.consistent = true; r.pi = 0; r.eq = r.icL && r.icH && p.lam > 0 && p.lam < 1; r.pay = { L: r.uL0, H: r.uHs }; }
    else if (mode === 'pool') { r.icL = r.uLs >= r.uL0 - tol; r.icH = r.uHs >= r.uH0 - tol; r.consistent = true; r.pi = 1; r.eq = r.icL && r.icH; r.pay = { L: r.uLs, H: r.uHs }; }
    else {
      var mu = D > 0 ? p.cL * es / D : NaN; r.mu = mu; r.pi = mu > 0 && mu <= 1 + tol ? Math.max(0, p.lam * (1 - mu) / ((1 - p.lam) * mu)) : NaN;
      r.icL = true; r.icH = r.uHs >= r.uH0 - tol; r.consistent = isFinite(r.pi) && r.pi <= 1 + tol && mu >= p.lam - tol && mu <= 1 + tol;
      r.eq = r.consistent && r.icH; r.pay = { L: r.uL0, H: r.uHs };
    }
    r.ic = intuitive(p, r);
    return r;
  }
  /* the separating range: es from D/cL (lows just stop imitating) to D/cH (highs just willing) */
  function sepRange(p) { var D = p.thH - p.thL; return [D / p.cL, D / p.cH]; }
  function poolMax(p) { var D = p.thH - p.thL; return p.lam * D / p.cL; }
  /* Cho and Kreps's intuitive criterion: an off-path education level e' breaks the equilibrium if a low type would
     lose by choosing it even when paid thH (e' > (thH − payL)/cL) while a high type would gain if paid thH
     (e' < (thH − payH)/cH). Passes when that interval is empty, or (the Riley outcome) when es = D/cL exactly. */
  function intuitive(p, r) {
    if (!r.eq) return { applies: false, passes: false };
    var lo = (p.thH - r.pay.L) / p.cL, hi = (p.thH - r.pay.H) / p.cH;
    return { applies: true, lo: lo, hi: hi, passes: !(hi > lo + 1e-9) };
  }

  /* ---------- Crawford and Sobel (1982), uniform-quadratic ----------
     State th ~ U[0,1]; the receiver wants action = th, the sender wants th + b (b > 0).
     Equilibria are partitions with boundaries a_i = i/N + 2b·i(i − N); the most intervals possible is the largest N
     with 2b·N(N − 1) < 1. The receiver picks the midpoint of the interval it hears. */
  function csMaxN(b) { if (b <= 0) return Infinity; var N = 1; while (2 * b * (N + 1) * N < 1) N++; return N; }
  function csPartition(b, N) { var a = []; for (var i = 0; i <= N; i++) a.push(i / N + 2 * b * i * (i - N)); return a; }
  function csLoss(a, b) { // expected quadratic losses: receiver E[(y − th)^2] = sum len^3/12; sender adds b^2
    var s = 0; for (var i = 1; i < a.length; i++) { var l = a[i] - a[i - 1]; s += l * l * l / 12; } return { R: s, S: s + b * b };
  }
  function csValid(a) { for (var i = 1; i < a.length; i++) if (!(a[i] > a[i - 1])) return false; return Math.abs(a[a.length - 1] - 1) < 1e-12; }

  /* ---------- screening with a menu (two types, as in Mussa–Rosen and Maskin–Riley) ----------
     A buyer of type th values quality q at th·q and pays t: utility th·q − t (0 if she buys nothing).
     Making quality q costs q²/2. A share mu of buyers are high types (thH), the rest low (thL). */
  function choose(th, menu) { // menu: [{q,t}], returns index of the best package or −1 for nothing (ties go to the higher-quality package)
    var best = 0, bi = -1; menu.forEach(function (m, i) { var u = th * m.q - m.t; if (u > best + 1e-9 || (Math.abs(u - best) <= 1e-9 && u >= 0 && (bi < 0 || m.q > menu[bi].q))) { best = u; bi = i; } }); return bi;
  }
  function menuProfit(menu, thL, thH, mu) {
    var iL = choose(thL, menu), iH = choose(thH, menu), pr = 0;
    if (iL >= 0) pr += (1 - mu) * (menu[iL].t - menu[iL].q * menu[iL].q / 2);
    if (iH >= 0) pr += mu * (menu[iH].t - menu[iH].q * menu[iH].q / 2);
    return { iL: iL, iH: iH, profit: pr };
  }
  function bestMenu(thL, thH, mu) { // no distortion at the top; the low type's quality is cut to its virtual value
    var qH = thH, qL = Math.max(0, thL - mu / (1 - mu) * (thH - thL)), tL = thL * qL, tH = thH * qH - (thH - thL) * qL;
    return { L: { q: qL, t: tL }, H: { q: qH, t: tH }, profit: (1 - mu) * (tL - qL * qL / 2) + mu * (tH - qH * qH / 2), rent: (thH - thL) * qL };
  }
  function firstBest(thL, thH, mu) { return (1 - mu) * thL * thL / 2 + mu * thH * thH / 2; }

  var api = { spence: spence, sepRange: sepRange, poolMax: poolMax, csMaxN: csMaxN, csPartition: csPartition, csLoss: csLoss, csValid: csValid,
    choose: choose, menuProfit: menuProfit, bestMenu: bestMenu, firstBest: firstBest };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GT10M = api;
})(this);
