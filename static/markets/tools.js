/* Finance calculators. Each calculator is a small form that recomputes as you type. */
(function (W, D) {
  'use strict';
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var f = MChart.fmt;
  function money(v, d) { return (v < 0 ? '−$' : '$') + f(Math.abs(v), d == null ? 2 : d); }
  function val(id) { var e = D.getElementById(id); return e ? +e.value : NaN; }
  function N(x) { // standard normal CDF (Abramowitz–Stegun 7.1.26)
    var t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989423 * Math.exp(-x * x / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }
  function npdf(x) { return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); }
  var CALCS = {
    compound: function () {
      var P = val('cp-p'), m = val('cp-m'), r = val('cp-r') / 100, y = val('cp-y'), inf = val('cp-i') / 100, g = val('cp-g') / 100;
      var bal = P, contrib = P, pts = [[0, P]], mo = m;
      for (var k = 1; k <= y * 12; k++) { bal = bal * (1 + r / 12) + mo; contrib += mo; if (k % 12 === 0) { pts.push([k / 12, bal]); mo *= 1 + g; } }
      var real = bal / Math.pow(1 + inf, y);
      $('#cp-out').innerHTML = 'After ' + y + ' years: <b>' + money(bal, 0) + '</b> (' + money(real, 0) + ' in today’s dollars)<br>You put in ' + money(contrib, 0) + '; growth added ' + money(bal - contrib, 0) + '.';
      if (!W._cpChart) W._cpChart = new MChart($('#cp-chart'), { xType: 'num', noZoom: true, xLabel: function (x) { return 'Year ' + Math.round(x); }, fmtLeft: function (v) { return '$' + f(v, 0); } });
      W._cpChart.set([{ name: 'Balance', pts: pts, color: '#1f6fb2', type: 'area', fmt: function (v) { return money(v, 0); } }], { xTicks: pts.filter(function (p, i) { return i % Math.max(1, Math.round(y / 10)) === 0; }).map(function (p) { return [p[0], String(p[0])]; }) });
    },
    loan: function () {
      var P = val('ln-p'), r = val('ln-r') / 100 / 12, n = val('ln-y') * 12, ex = val('ln-x') || 0;
      var pay = r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n, bal = P, interest = 0, months = 0, rows = [], yi = 0, yp = 0;
      while (bal > 0.005 && months < 1200) { var i = bal * r, prin = Math.min(bal, pay + ex - i); interest += i; yi += i; yp += prin; bal -= prin; months++; if (months % 12 === 0 || bal <= 0.005) { rows.push([Math.ceil(months / 12), yp, yi, Math.max(0, bal)]); yi = yp = 0; } }
      var base = pay * n - P;
      $('#ln-out').innerHTML = 'Monthly payment: <b>' + money(pay) + '</b>' + (ex ? ' + ' + money(ex) + ' extra' : '') + '<br>Total interest: <b>' + money(interest, 0) + '</b>' +
        (ex ? ' (saves ' + money(base - interest, 0) + '; paid off in ' + (months / 12).toFixed(1) + ' years instead of ' + (n / 12) + ')' : '') +
        '<details style="margin-top:.4rem"><summary>Yearly schedule</summary><div class="mk-tablewrap"><table class="mk-t"><thead><tr><th>Year</th><th class="num">Principal</th><th class="num">Interest</th><th class="num">Balance</th></tr></thead><tbody>' +
        rows.map(function (q) { return '<tr><td>' + q[0] + '</td><td class="num">' + money(q[1], 0) + '</td><td class="num">' + money(q[2], 0) + '</td><td class="num">' + money(q[3], 0) + '</td></tr>'; }).join('') + '</tbody></table></div></details>';
    },
    bs: function () {
      var S = val('bs-s'), K = val('bs-k'), T = val('bs-t') / 365, v = val('bs-v') / 100, r = val('bs-r') / 100, q = val('bs-q') / 100;
      if (!(S > 0 && K > 0 && T > 0 && v > 0)) { $('#bs-out').textContent = 'Enter positive values.'; return; }
      var d1 = (Math.log(S / K) + (r - q + v * v / 2) * T) / (v * Math.sqrt(T)), d2 = d1 - v * Math.sqrt(T);
      var eq = Math.exp(-q * T), er = Math.exp(-r * T);
      var call = S * eq * N(d1) - K * er * N(d2), put = K * er * N(-d2) - S * eq * N(-d1);
      var gamma = eq * npdf(d1) / (S * v * Math.sqrt(T)), vega = S * eq * npdf(d1) * Math.sqrt(T) / 100;
      var thC = (-S * eq * npdf(d1) * v / (2 * Math.sqrt(T)) - r * K * er * N(d2) + q * S * eq * N(d1)) / 365;
      var thP = (-S * eq * npdf(d1) * v / (2 * Math.sqrt(T)) + r * K * er * N(-d2) - q * S * eq * N(-d1)) / 365;
      var rhoC = K * T * er * N(d2) / 100, rhoP = -K * T * er * N(-d2) / 100;
      function row(n, c, p) { return '<tr><td>' + n + '</td><td class="num">' + c + '</td><td class="num">' + p + '</td></tr>'; }
      $('#bs-out').innerHTML = '<table class="mk-t"><thead><tr><th></th><th class="num">Call</th><th class="num">Put</th></tr></thead><tbody>' +
        row('<b>Price</b>', '<b>' + money(call) + '</b>', '<b>' + money(put) + '</b>') + row('Delta', (eq * N(d1)).toFixed(3), (eq * (N(d1) - 1)).toFixed(3)) +
        row('Gamma', gamma.toFixed(4), gamma.toFixed(4)) + row('Theta (per day)', money(thC), money(thP)) + row('Vega (per 1 vol point)', money(vega), money(vega)) +
        row('Rho (per 1% rate)', money(rhoC), money(rhoP)) + row('Chance of expiring in the money', (N(d2) * 100).toFixed(1) + '%', (N(-d2) * 100).toFixed(1) + '%') + '</tbody></table>' +
        '<p class="mk-note">Black–Scholes–Merton for European options with a continuous dividend yield. U.S. stock options are American-style, so real prices can differ slightly, especially for puts and dividend payers.</p>';
    },
    bond: function () {
      var F = val('bd-f'), c = val('bd-c') / 100, n = val('bd-n'), y = val('bd-y') / 100, m = val('bd-m');
      var periods = Math.round(n * m), cp = F * c / m, yr = y / m, price = 0, mac = 0, conv = 0;
      for (var k = 1; k <= periods; k++) { var cf = cp + (k === periods ? F : 0), df = Math.pow(1 + yr, -k); price += cf * df; mac += k / m * cf * df; conv += cf * df * k * (k + 1) / Math.pow(1 + yr, 2) / (m * m); }
      mac /= price; conv /= price; var mod = mac / (1 + yr);
      $('#bd-out').innerHTML = 'Price: <b>' + money(price) + '</b> (' + (price / F * 100).toFixed(3) + ' per 100) · current yield ' + (cp * m / price * 100).toFixed(3) + '%<br>' +
        'Macaulay duration <b>' + mac.toFixed(2) + '</b> years · modified duration <b>' + mod.toFixed(2) + '</b> · convexity ' + conv.toFixed(1) + '<br>' +
        'If yields rise 1 percentage point, the price falls about <b>' + (mod * 1 - conv * 0.01 / 2).toFixed(2) + '%</b> (duration + convexity estimate).';
      // yield from price
      var pr = val('bd-p');
      if (pr > 0) {
        var lo = -0.99, hi = 1, target = pr / 100 * F;
        for (var it = 0; it < 100; it++) { var mid = (lo + hi) / 2, p = 0; for (var j = 1; j <= periods; j++) p += (cp + (j === periods ? F : 0)) * Math.pow(1 + mid / m, -j); if (p > target) lo = mid; else hi = mid; }
        $('#bd-out').innerHTML += '<br>At a price of ' + pr + ' per 100, the yield to maturity is <b>' + (lo * 100).toFixed(3) + '%</b>.';
      }
    },
    size: function () {
      var A = val('ps-a'), rp = val('ps-r') / 100, e = val('ps-e'), s = val('ps-s'), t = val('ps-t');
      var per = Math.abs(e - s); if (!per) { $('#ps-out').textContent = 'Entry and stop must differ.'; return; }
      var risk = A * rp, sh = Math.floor(risk / per), pos = sh * e;
      var out = 'Risk per share ' + money(per) + ' · money at risk <b>' + money(risk) + '</b><br>Position: <b>' + f(sh, 0) + ' shares</b> (' + money(pos, 0) + ', ' + (pos / A * 100).toFixed(1) + '% of the account)';
      if (t) { var rr = Math.abs(t - e) / per; out += '<br>Reward : risk = <b>' + rr.toFixed(2) + ' : 1</b> · you need to win more than ' + (100 / (1 + rr)).toFixed(0) + '% of such trades to break even.'; }
      $('#ps-out').innerHTML = out;
    },
    cagr: function () {
      var a = val('cg-a'), b = val('cg-b'), y = val('cg-y');
      var cagr = Math.pow(b / a, 1 / y) - 1;
      $('#cg-out').innerHTML = 'Total return <b>' + ((b / a - 1) * 100).toFixed(2) + '%</b> · annualized (CAGR) <b>' + (cagr * 100).toFixed(2) + '%</b> per year<br>At that rate money doubles every <b>' + (Math.log(2) / Math.log(1 + cagr)).toFixed(1) + '</b> years (Rule of 72 says ' + (72 / (cagr * 100)).toFixed(1) + ').';
    },
    tbill: function () {
      var d = val('tb-d') / 100, t = val('tb-t');
      var price = 100 * (1 - d * t / 360), bey = t <= 182 ? 365 * d / (360 - d * t) : null;
      if (bey == null) { var b = -2 * t / 365 + 2 * Math.sqrt(Math.pow(t / 365, 2) - (2 * t / 365 - 1) * (1 - 100 / price)); bey = b / (2 * t / 365 - 1); }
      $('#tb-out').innerHTML = 'Price: <b>' + price.toFixed(6) + '</b> per 100 · investment rate (bond-equivalent yield): <b>' + (bey * 100).toFixed(3) + '%</b><br>Earn ' + money(100 - price, 4) + ' per $100 over ' + t + ' days.';
    },
    real: function () {
      var n = val('rl-n') / 100, i = val('rl-i') / 100;
      $('#rl-out').innerHTML = 'Real return: <b>' + (((1 + n) / (1 + i) - 1) * 100).toFixed(2) + '%</b> (the quick estimate, nominal − inflation, gives ' + ((n - i) * 100).toFixed(2) + '%)';
    }
  };
  // inflation calculator: monthly CPI-U (not seasonally adjusted) from FRED, falling back to the seasonally adjusted series
  var CPI = null, CPIM = {}, MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function ym(t) { var d = new Date(t); return d.getUTCFullYear() * 12 + d.getUTCMonth(); }
  function ymLabel(k) { return MON[k % 12] + ' ' + Math.floor(k / 12); }
  CALCS.infl = function () {
    var out = $('#in-out');
    if (!CPI) { out.textContent = 'Loading CPI…'; return; }
    var amt = val('in-a'), a = val('in-f') * 12 + val('in-fm'), b = val('in-t') * 12 + val('in-tm');
    var first = ym(CPI[0][0]), last = ym(CPI[CPI.length - 1][0]);
    if (!(a >= first && a <= last && b >= first && b <= last)) { out.innerHTML = 'CPI data runs from <b>' + ymLabel(first) + '</b> to <b>' + ymLabel(last) + '</b>. Pick dates in that range.'; if (W._inChart) W._inChart.set([], { emptyText: '' }); return; }
    var ca = CPIM[a], cb = CPIM[b], res = amt * cb / ca, lo0 = Math.min(a, b), hi0 = Math.max(a, b), up = CPIM[hi0] / CPIM[lo0], yrs = (hi0 - lo0) / 12;
    var rate = yrs ? (Math.pow(up, 1 / yrs) - 1) * 100 : 0;
    out.innerHTML = money(amt) + ' in ' + ymLabel(a) + ' had the same buying power as <b>' + money(res) + '</b> in ' + ymLabel(b) + '.<br>' +
      (a === b ? 'Same month, so no change.' : 'From ' + ymLabel(lo0) + ' to ' + ymLabel(hi0) + ', prices ' + (up >= 1 ? 'rose' : 'fell') + ' ' + Math.abs((up - 1) * 100).toFixed(1) + '% (' + (yrs < 2 ? (hi0 - lo0) + ' months' : yrs.toFixed(1) + ' years') + ', about ' + Math.abs(rate).toFixed(2) + '% a year on average). A dollar in ' + ymLabel(hi0) + ' buys what ' + money(1 / up) + ' bought in ' + ymLabel(lo0) + '.');
    // chart: the amount's equivalent value, month by month, between the two dates
    var lo = Math.min(a, b), hi = Math.max(a, b), pts = [];
    if (hi === lo) { lo = Math.max(first, lo - 12); hi = Math.min(last, hi + 12); }
    CPI.forEach(function (p) { var k = ym(p[0]); if (k >= lo && k <= hi) pts.push([p[0], amt * p[1] / ca]); });
    if (!W._inChart) W._inChart = new MChart($('#in-chart'), { fmtLeft: function (v) { return '$' + f(v, v < 10 ? 2 : 0); } });
    W._inChart.set([{ name: money(amt) + ' of ' + ymLabel(a) + ' money', pts: pts, color: '#1f6fb2', type: 'area', fmt: function (v) { return money(v); } }], { logLeft: (pts.length && pts[pts.length - 1][1] / pts[0][1] > 20) });
  };
  function loadCPI(p) { CPI = p; CPIM = {}; p.forEach(function (x) { CPIM[ym(x[0])] = x[1]; }); var l = ym(p[p.length - 1][0]); var t = D.getElementById('in-t'), tm = D.getElementById('in-tm'); if (t) { t.value = Math.floor(l / 12); tm.value = l % 12; t.max = Math.floor(l / 12); D.getElementById('in-f').max = Math.floor(l / 12); } var fy = Math.floor(ym(p[0][0]) / 12); D.getElementById('in-f').min = fy; if (t) t.min = fy; CALCS.infl(); }
  if (D.getElementById('in-out')) {
    MK.fred('CPIAUCNS').catch(function () { return MK.fred('CPIAUCSL'); }).then(loadCPI).catch(function () { var o = D.getElementById('in-out'); if (o) o.textContent = 'CPI data appears after the next site build.'; });
    D.getElementById('in-swap').addEventListener('click', function () {
      var f1 = D.getElementById('in-f'), m1 = D.getElementById('in-fm'), t1 = D.getElementById('in-t'), m2 = D.getElementById('in-tm');
      var y = f1.value, m = m1.value; f1.value = t1.value; m1.value = m2.value; t1.value = y; m2.value = m; CALCS.infl();
    });
  }

  Object.keys(CALCS).forEach(function (k) {
    var box = D.querySelector('[data-calc="' + k + '"]'); if (!box) return;
    box.addEventListener('input', function () { CALCS[k](); });
    CALCS[k]();
  });
})(window, document);
