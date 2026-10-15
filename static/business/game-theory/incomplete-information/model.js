/* Game Theory, Chapter 8 (Incomplete Information and Bayesian Games): the models behind the market for lemons,
   the Bayes'-rule tool and the Bayesian Cournot game. window.GT8M in the browser, module.exports in node
   (tested in /tmp/work_gt2/test/gt8.test.js). Money in dollars. */
(function (root) {
  'use strict';

  /* ---------- the market for lemons (after Akerlof 1970) ----------
     N cars, qualities spread evenly over [lo, hi] (the midpoints of N equal slices of the uniform distribution).
     A car of quality q is worth q to its owner and b·q to a buyer (b ≥ 1, so every sale would create value).
     Buyers can't see q. They pay, for an uncertified car, the average value to a buyer of the uncertified cars
     offered the day before (on day 0, the average of all cars: buyers start out thinking the lot is a fair sample).
     A warranty with coverage w (0..1) pays the buyer w·(hi − q) in cash, so it is worth that to the buyer and costs
     the seller the same (a transfer, not new value). With inspection on, an owner can pay a fee f to have the
     quality certified; a certified car sells for its full value to a buyer, b·q + w·(hi − q).
     Each day every owner picks the best of: keep the car (q), sell uncertified (p − w·(hi − q)),
     or certify and sell (b·q − f). */
  function cars(n, lo, hi) { var a = []; for (var i = 0; i < n; i++) a.push(lo + (hi - lo) * (i + 0.5) / n); return a; }
  function buyerValue(q, o) { return o.b * q + o.w * (o.hi - q); }
  function choose(q, p, o) {
    var keep = q, sell = p - o.w * (o.hi - q), cert = o.inspect ? o.b * q - o.f : -Infinity;
    // ties go to trading (an owner who is exactly indifferent sells), then to certifying
    if (cert >= sell && cert >= keep && o.inspect) return 'cert';
    if (sell >= keep - 1e-9) return 'sell';
    return 'keep';
  }
  function Lemons(o) {
    this.o = { n: o.n || 40, lo: o.lo || 0, hi: o.hi || 10000, b: o.b, w: o.w || 0, inspect: !!o.inspect, f: o.f || 0 };
    this.q = cars(this.o.n, this.o.lo, this.o.hi);
    var s = 0, self = this; this.q.forEach(function (q) { s += buyerValue(q, self.o); });
    this.p = s / this.q.length; this.day = 0; this.hist = []; this.stable = false; this.calm = 0;
    this.decide();
  }
  Lemons.prototype.decide = function () {
    var self = this, o = this.o, sv = 0, sn = 0, gains = 0, max = 0, nSell = 0, nCert = 0, nKeep = 0;
    this.st = this.q.map(function (q) {
      var c = choose(q, self.p, o); max += (o.b - 1) * q;
      if (c === 'sell') { nSell++; sv += buyerValue(q, o); sn++; gains += (o.b - 1) * q; }
      else if (c === 'cert') { nCert++; gains += (o.b - 1) * q - o.f; } else nKeep++;
      return c;
    });
    this.nSell = nSell; this.nCert = nCert; this.nKeep = nKeep; this.gains = gains; this.maxGains = max;
    this.avgOffered = sn ? sv / sn : NaN;
    var lowest = buyerValue(this.q[0], o);
    this.next = sn ? sv / sn : lowest; // if nobody offers an uncertified car, buyers expect the worst car
    this.hist.push({ day: this.day, p: this.p, nSell: nSell, nCert: nCert, nKeep: nKeep, avg: this.avgOffered, eff: max > 0 ? gains / max : 1 });
  };
  Lemons.prototype.step = function () {
    var prev = this.st.join(',');
    this.p = this.next; this.day++; this.decide();
    if (this.st.join(',') === prev && Math.abs(this.next - this.p) < 0.5) this.calm++; else this.calm = 0;
    this.stable = this.calm >= 1;
    return this;
  };
  Lemons.prototype.run = function (max) { for (var i = 0; i < (max || 500) && !this.stable; i++) this.step(); return this; };
  Lemons.prototype.eff = function () { return this.maxGains > 0 ? this.gains / this.maxGains : 1; };
  /* the continuum version: cutoff fixed point for q ~ U[lo, hi] without inspection. Returns the share that trades. */
  function contShare(b, lo, hi, w) {
    var k = (b - w) / (2 * (1 - w)); if (w >= 1) return 1;
    var s = hi; // start: buyers pay the average, sellers below the cutoff s sell
    for (var i = 0; i < 20000; i++) { var s2 = Math.min(hi, Math.max(lo, k * (lo + s))); if (Math.abs(s2 - s) < 1e-9) { s = s2; break; } s = s2; }
    return (s - lo) / (hi - lo);
  }
  /* the smallest warranty coverage (to 0.001) that keeps every one of the N cars trading, without inspection */
  function minWarranty(o) {
    function ok(w) { var m = new Lemons({ n: o.n, lo: o.lo, hi: o.hi, b: o.b, w: w }).run(2000); return m.nSell === m.q.length; }
    if (ok(0)) return 0; var a = 0, z = 1; if (!ok(1)) return NaN;
    while (z - a > 0.0005) { var m = (a + z) / 2; if (ok(m)) z = m; else a = m; }
    return z;
  }

  /* ---------- Bayes' rule ----------
     prior = P(lemon); sens = P(test flags it | lemon); fa = P(test flags it | good car). */
  function bayes(prior, sens, fa) {
    var pf = prior * sens + (1 - prior) * fa, pp = 1 - pf;
    return { pFlag: pf, postFlag: pf > 0 ? prior * sens / pf : NaN, postPass: pp > 0 ? prior * (1 - sens) / pp : NaN,
      tp: prior * sens, fn: prior * (1 - sens), fp: (1 - prior) * fa, tn: (1 - prior) * (1 - fa) };
  }
  /* whole numbers for a population of n, rounded so they add up to n */
  function counts(n, prior, sens, fa) {
    var lem = Math.round(n * prior), good = n - lem, tp = Math.round(lem * sens), fp = Math.round(good * fa);
    return { lem: lem, good: good, tp: tp, fn: lem - tp, fp: fp, tn: good - fp };
  }

  /* ---------- Bayesian Cournot (Gibbons 1992, section 3.1.A) ----------
     Inverse demand P = a − q1 − q2. Firm 1's unit cost c1 is known to both. Firm 2's cost is cH with
     probability th and cL with probability 1 − th; firm 2 knows it, firm 1 doesn't.
     Bayesian Nash equilibrium: each type of firm 2 best-responds to q1; firm 1 best-responds to E[q2].
     Found by iterating best responses (a contraction here), with quantities kept ≥ 0. */
  function br2(q1, a, c) { return Math.max(0, (a - c - q1) / 2); }
  function br1(eq2, a, c) { return Math.max(0, (a - c - eq2) / 2); }
  function cournotBNE(a, c1, cH, cL, th) {
    var q1 = 0, qH = 0, qL = 0;
    for (var i = 0; i < 200; i++) { qH = br2(q1, a, cH); qL = br2(q1, a, cL); q1 = br1(th * qH + (1 - th) * qL, a, c1); }
    return { q1: q1, qH: qH, qL: qL, eq2: th * qH + (1 - th) * qL };
  }
  function cournotClosed(a, c1, cH, cL, th) { // Gibbons' closed form, valid when all three are positive
    return { q1: (a - 2 * c1 + th * cH + (1 - th) * cL) / 3, qH: (a - 2 * cH + c1) / 3 + (1 - th) * (cH - cL) / 6, qL: (a - 2 * cL + c1) / 3 - th * (cH - cL) / 6 };
  }
  function cournotFull(a, c1, c2) { // complete information: firm 1 knows c2
    var q1 = 0, q2 = 0; for (var i = 0; i < 200; i++) { q2 = br2(q1, a, c2); q1 = br1(q2, a, c1); } return { q1: q1, q2: q2 };
  }
  function profit1(q1, a, c1, qH, qL, th) {
    return th * q1 * Math.max(0, a - q1 - qH) - th * c1 * q1 + (1 - th) * q1 * Math.max(0, a - q1 - qL) - (1 - th) * c1 * q1;
  }
  function profit2(q2, q1, a, c) { return q2 * (Math.max(0, a - q1 - q2) - c); }

  var api = { cars: cars, buyerValue: buyerValue, choose: choose, Lemons: Lemons, contShare: contShare, minWarranty: minWarranty,
    bayes: bayes, counts: counts, br1: br1, br2: br2, cournotBNE: cournotBNE, cournotClosed: cournotClosed, cournotFull: cournotFull, profit1: profit1, profit2: profit2 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.GT8M = api;
})(this);
