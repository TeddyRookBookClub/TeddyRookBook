/* Math Ladder generators: Probability and Statistics (course key "stat"), one generator per topic in
   data/math/topics/stat.json. Built from /tmp/work_mlp13/gen/*.js by build_gen.js; edit the sources, not this file.

   Conventions in this course
   - Probabilities are exact fractions where that is natural (dice, cards, counting). Where the exact fraction is
     unfriendly, the spec keeps the exact value and adds tol 0.0005, so a fraction or a decimal to 3 places is right.
   - Normal, t and chi-square table values are computed here (never typed in by hand) and given in the question,
     rounded the way a printed table rounds them (4 places for areas, 2 or 3 for critical values). The answer is
     computed from the values shown, with a tolerance that also accepts a calculator's more precise value.
   - Quartiles use the medians of the lower and upper halves (the middle value left out when n is odd), the method the
     boxplot visual uses. Standard deviations of data are sample standard deviations (divide by n − 1).          */
(function (ML) {
  'use strict';
  var G0 = ML.gen, T = ML.T, Q = ML.Q, U = ML.util;
  var M = Math;

  // ---------------------------------------------------------------- narrow screens
  // Inline math never wraps, so a long formula chain in a step would widen a phone screen. Every generator is
  // registered through G, which turns inline math wider than about 270 px into display math (display math scrolls
  // sideways inside its own box). texWidth estimates the rendered width in units of about 10 px.
  var OPS = { cdot: 2, times: 2, pm: 2, approx: 2, le: 2, ge: 2, ne: 2, mid: 1.5, cup: 2, cap: 2, to: 2, sim: 2, div: 2, ldots: 2, cdots: 2, quad: 2, qquad: 4, infty: 1.5, sum: 1.5 };
  function texWidth(s) {
    var i = 0, n = s.length;
    function group() { // after the opening brace has been seen at s[i]
      if (s[i] !== '{') { var c = s[i++] || ''; if (c === '\\') { var nm = ''; while (i < n && /[a-zA-Z]/.test(s[i])) nm += s[i++]; return nm ? '\\' + nm : '\\' + (s[i++] || ''); } return c; }
      var d = 0, st = ++i; for (; i < n; i++) { if (s[i] === '\\') { i++; continue; } if (s[i] === '{') d++; else if (s[i] === '}') { if (!d) break; d--; } }
      var g = s.slice(st, i); i++; return g;
    }
    var w = 0;
    while (i < n) {
      var c = s[i];
      if (c === '\\') {
        i++; var nm = ''; while (i < n && /[a-zA-Z]/.test(s[i])) nm += s[i++];
        if (!nm) { i++; w += (s[i - 1] === ',' || s[i - 1] === '!' || s[i - 1] === ';') ? 0.3 : 1; continue; }
        if (nm === 'frac' || nm === 'dfrac' || nm === 'tfrac') { var a1 = group(), b1 = group(); w += M.max(texWidth(a1), texWidth(b1)) + 0.6; }
        else if (nm === 'binom') { var a2 = group(), b2 = group(); w += M.max(texWidth(a2), texWidth(b2)) + 1.5; }
        else if (nm === 'sqrt') { if (s[i] === '[') { while (i < n && s[i] !== ']') i++; i++; } w += texWidth(group()) + 1; }
        else if (/^(text|mathrm|textbf|mathbf|operatorname)$/.test(nm)) w += group().length * 0.9;
        else if (/^(hat|bar|overline|vec|widehat|tilde)$/.test(nm)) w += texWidth(group());
        else if (/^(left|right|displaystyle|big|Big)$/.test(nm)) w += 0;
        else w += OPS[nm] || 1;
      } else if (c === '^' || c === '_') { i++; w += 0.7 * texWidth(group()); }
      else if (c === '{') { w += texWidth(group()); }
      else { i++; w += /[=+\-<>]/.test(c) ? 2 : c === ' ' ? 0 : /[(),.]/.test(c) ? (c === '(' || c === ')' ? 0.95 : 0.6) : 1; }
    }
    return w;
  }
  function narrow(s) {
    if (typeof s !== 'string' || s.indexOf('$') < 0) return s;
    var out = '', i = 0, n = s.length;
    while (i < n) {
      if (s[i] === '\\' && s[i + 1] === '$') { out += '\\$'; i += 2; continue; }
      if (s[i] === '$' && s[i + 1] === '$') { var e = s.indexOf('$$', i + 2); if (e < 0) { out += s.slice(i); break; } out += s.slice(i, e + 2); i = e + 2; continue; }
      if (s[i] === '$') {
        var j = i + 1; while (j < n && !(s[j] === '$' && s[j - 1] !== '\\')) j++;
        if (j >= n) { out += s.slice(i); break; }
        var tex = s.slice(i + 1, j);
        if (/^-?[\d.,]+\\%$/.test(tex)) { out += tex.replace('\\%', '%').replace(/^-/, '−'); i = j + 1; continue; } // a plain percent reads better as text
        if (texWidth(tex) > 26) { out = out.replace(/\s+$/, ' '); out += '$$' + tex + '$$'; i = j + 1; if (s[i] === '.' || s[i] === ',') { i++; } }
        else { out += s.slice(i, j + 1); i = j + 1; }
        continue;
      }
      out += s[i++];
    }
    return out;
  }
  function G(id, fn) {
    G0(id, function (R, ctx) {
      var p = fn(R, ctx);
      if (p && Array.isArray(p.steps)) p.steps = p.steps.map(narrow);
      if (p && typeof p.q === 'string') p.q = narrow(p.q);
      if (p && typeof p.hint === 'string') p.hint = narrow(p.hint);
      return p;
    });
  }
  ML.statTexWidth = texWidth;

  // ---------------------------------------------------------------- distributions (accurate to about 1e-12)
  function lgamma(z) { // Lanczos, g = 7
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return M.log(M.PI / M.abs(M.sin(M.PI * z))) - lgamma(1 - z);
    z -= 1; var x = c[0]; for (var i = 1; i < 9; i++) x += c[i] / (z + i);
    var t = z + 7.5; return 0.5 * M.log(2 * M.PI) + (z + 0.5) * M.log(t) - t + M.log(x);
  }
  function igam(a, x) { // regularized incomplete gamma [P, Q]
    if (x <= 0) return [0, 1];
    var pre = M.exp(-x + a * M.log(x) - lgamma(a)), i;
    if (x < a + 1) { var ap = a, s = 1 / a, d = s; for (i = 0; i < 1000; i++) { ap += 1; d *= x / ap; s += d; if (M.abs(d) < M.abs(s) * 1e-16) break; } return [s * pre, 1 - s * pre]; }
    var b = x + 1 - a, c = 1e300, dd = 1 / b, h = dd;
    for (i = 1; i < 1000; i++) { var an = -i * (i - a); b += 2; dd = an * dd + b; if (M.abs(dd) < 1e-300) dd = 1e-300; c = b + an / c; if (M.abs(c) < 1e-300) c = 1e-300; dd = 1 / dd; var dl = dd * c; h *= dl; if (M.abs(dl - 1) < 1e-16) break; }
    return [1 - pre * h, pre * h];
  }
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (M.abs(d) < 1e-300) d = 1e-300; d = 1 / d; var h = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (M.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (M.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (M.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (M.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      var del = d * c; h *= del; if (M.abs(del - 1) < 1e-16) break;
    }
    return h;
  }
  function ibeta(x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = M.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * M.log(x) + b * M.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function Phi(z) { var q = 0.5 * igam(0.5, z * z / 2)[1]; return z < 0 ? q : 1 - q; }
  function PhiInv(p) { // Acklam, then Newton steps on Phi
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
      b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
      c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
      d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00], q, r, x;
    if (p < 0.02425) { q = M.sqrt(-2 * M.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - 0.02425) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = M.sqrt(-2 * M.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    for (var i = 0; i < 3; i++) x -= (Phi(x) - p) * M.sqrt(2 * M.PI) * M.exp(x * x / 2);
    return x;
  }
  function tCdf(t, df) { var x = df / (df + t * t), p = 0.5 * ibeta(x, df / 2, 0.5); return t > 0 ? 1 - p : p; }
  function tInv(p, df) { var lo = -60, hi = 60; for (var i = 0; i < 80; i++) { var mid = (lo + hi) / 2; if (tCdf(mid, df) < p) lo = mid; else hi = mid; } return (lo + hi) / 2; }
  function chi2Cdf(x, k) { return igam(k / 2, x / 2)[0]; }
  function chi2Sf(x, k) { return igam(k / 2, x / 2)[1]; }

  // ---------------------------------------------------------------- numbers and text
  var rd = U.round, fix = U.fix;
  function ns(x) { return U.numStr(fix(x)); }                 // a number as a plain string, no float noise
  function r4(x) { return rd(x, 4); }
  function phi4(z) { return rd(Phi(z), 4); }                  // a table value: P(Z < z) to 4 places
  function d4(x) { return T.dec(x, 4); }                       // "0.0500"
  function zs(z) { return T.dec(z, 2); }                       // a z-score as a table shows it: "1.20", "-0.50"
  function pz(z) { return '$P(Z < ' + zs(z) + ') = ' + d4(phi4(z)) + '$'; }
  function tableNote(list) { return 'From a standard normal table: ' + U.list(list.map(pz)) + '.'; }
  function zstar(level) { return { 80: '1.282', 90: '1.645', 95: '1.960', 98: '2.326', 99: '2.576' }[level]; }
  function tstar(level, df) { return rd(tInv(1 - (1 - level / 100) / 2, df), 3); }
  function q(n, d) { return Q(n, d === undefined ? 1 : d); }
  function frac(n, d) { return T.frac(n, d); }
  function dfr(n, d) { return T.dfrac(n, d); }
  function plainQ(n, d) { return q(n, d).toPlain(); }
  function qv(x) { // an exact Q as a spec string: a decimal when it terminates, else a fraction
    x = Q.from(x); if (!x.isTerminating()) return x.toPlain();
    var s = x.toDec(15); return s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  }
  function pct(x) { return T.pct(ns(x)); }
  function money(x) { return T.money(x); }
  function sum(a) { return fix(a.reduce(function (s, x) { return s + x; }, 0)); }
  function mean(a) { return fix(sum(a) / a.length); }
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length % 2 ? s[m] : fix((s[m - 1] + s[m]) / 2); }
  function sorted(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function five(a) { var s = sorted(a), n = s.length, h = n >> 1, lo = s.slice(0, h), hi = s.slice(n % 2 ? h + 1 : h); return { min: s[0], q1: median(lo), med: median(s), q3: median(hi), max: s[n - 1] }; }
  function ss(a) { var m = mean(a); return fix(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0)); }
  function sdS(a) { return M.sqrt(ss(a) / (a.length - 1)); }
  function list(a) { return a.map(function (x) { return T.num(x); }).join(',\\ '); }
  function dataList(a) { return a.map(function (x) { return '$' + T.num(x) + '$'; }).join(', '); } // each number on its own, so the list can wrap
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function table(head, rows, cap) { // an HTML table for a question (styled by math.css)
    var h = '<div class="mlp-table-wrap"><table class="mlp-table">' + (cap ? '<caption>' + cap + '</caption>' : '');
    if (head) h += '<thead><tr>' + head.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead>';
    h += '<tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 && head ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    return h;
  }
  function mc(correct, wrongs, k) { return U.mc(correct, wrongs, k || 4); }
  function mcKeep(choices, v) { return { t: 'mc', choices: choices, v: v, keep: true }; }
  function num(v, o) { var a = { t: 'num', v: typeof v === 'string' ? v : ns(v) }; if (o) for (var k in o) a[k] = o[k]; return a; }
  function prob(n, d) { // an exact probability; a fraction or a decimal to 3 places
    var f = q(n, d), nice = f.isTerminating() && String(f.toDec(6)).replace(/0+$/, '').split('.')[1].length <= 3;
    return nice || f.isInt() ? { t: 'num', v: f.toPlain() } : { t: 'num', v: f.toPlain(), tol: 0.0005 };
  }
  function lv(ctx) { return ctx && ctx.level || 1; }
  function by(ctx, a, b, c) { return ML.byLevel(ctx, a, b, c); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pick(R, a) { return R.pick(a); }

  var S = { Phi: Phi, PhiInv: PhiInv, tCdf: tCdf, tInv: tInv, chi2Cdf: chi2Cdf, chi2Sf: chi2Sf, lgamma: lgamma };
  ML.statDist = S; // shared with viz/stat.js and the tests


  // ================================================================ unit 1: describing data

  // ---------------------------------------------------------------- variable types
  var VARS = [ // [variable, 'c' | 'q', trouble?, reason]
    ['the eye color of each student', 'c', 0, 'Eye colors are labels, like brown or green.'],
    ['the favorite sport of each person surveyed', 'c', 0, 'A sport is a name, not a measurement.'],
    ['the blood type of each patient', 'c', 0, 'Blood types (A, B, AB, O) are labels.'],
    ['the kind of pet each family owns', 'c', 0, 'A kind of pet is a label.'],
    ['the brand of each phone in a store', 'c', 0, 'A brand is a name.'],
    ['whether each customer paid with cash or a card', 'c', 0, 'Cash or card is a yes-or-no kind of label.'],
    ['the state each student was born in', 'c', 0, 'A state is a place name.'],
    ['the shirt size (S, M, L or XL) of each runner', 'c', 0, 'Sizes are ordered labels; you cannot average S and XL.'],
    ['the ZIP code of each customer', 'c', 1, 'ZIP codes are digits used as labels. The average of two ZIP codes means nothing.'],
    ['the jersey number of each player', 'c', 1, 'A jersey number names a player. Number 30 is not "twice" number 15.'],
    ['the area code of each phone number', 'c', 1, 'An area code is a label for a region, even though it is written with digits.'],
    ['the student ID number of each student', 'c', 1, 'An ID number only tells students apart; arithmetic with it means nothing.'],
    ['the flight number of each airplane leaving an airport', 'c', 1, 'A flight number is a name made of digits.'],
    ['the room number of each class', 'c', 1, 'A room number labels a place; the mean room number is not a useful fact.'],
    ['the height of each student, in centimeters', 'q', 0, 'Height is measured, and averages and differences make sense.'],
    ['the number of siblings each student has', 'q', 0, 'It is a count, so arithmetic makes sense.'],
    ['the time each runner takes to finish a mile', 'q', 0, 'Time is measured in minutes and seconds.'],
    ['the price of each lunch sold, in dollars', 'q', 0, 'Prices are amounts you can add and average.'],
    ['the number of texts each teen sends in a day', 'q', 0, 'It is a count.'],
    ['the weight of each backpack, in pounds', 'q', 0, 'Weight is a measurement.'],
    ['the age of each customer, in years', 'q', 0, 'Age is measured in years.'],
    ['the distance each student lives from school, in miles', 'q', 0, 'Distance is a measurement.'],
    ['the length of each movie, in minutes', 'q', 0, 'Length in minutes is measured.'],
    ['the number of pages in each library book', 'q', 0, 'It is a count.'],
    ['the daily high temperature, in degrees Fahrenheit', 'q', 0, 'Temperature is measured; the difference between two days makes sense.'],
    ['the score of each student on a 100-point test', 'q', 0, 'Scores are numbers you can average.']
  ];
  G('stat.variable-types', function (R, ctx) {
    var L = lv(ctx);
    if (L >= 3 && R.chance(0.6)) { // select all that are quantitative (or categorical)
      var wantQ = R.coin(), pool = R.sample(VARS, 4), tries = 0;
      while ((pool.every(function (v) { return v[1] === 'q'; }) || pool.every(function (v) { return v[1] === 'c'; }) || !pool.some(function (v) { return v[2]; })) && tries++ < 40) pool = R.sample(VARS, 4);
      var right = []; pool.forEach(function (v, i) { if ((v[1] === 'q') === wantQ) right.push(i); });
      return {
        q: 'A school survey records the variables below. Which of them are <b>' + (wantQ ? 'quantitative' : 'categorical') + '</b>?',
        a: { t: 'mc', choices: pool.map(function (v) { return cap(v[0]); }), v: right },
        steps: pool.map(function (v) { return cap(v[0]) + ': ' + (v[1] === 'q' ? 'quantitative' : 'categorical') + '. ' + v[3]; }).concat(['Test each one: would its average mean something? If yes, it is quantitative.']),
        hint: 'Numbers used only as names (like ZIP codes) are categorical.'
      };
    }
    var trouble = by(ctx, 0.15, 0.5, 0.6), v = R.chance(trouble) ? R.pick(VARS.filter(function (x) { return x[2]; })) : R.pick(VARS.filter(function (x) { return !x[2]; }));
    var form = R.pick(['A data set records ' + v[0] + '.', 'A researcher writes down ' + v[0] + '.', 'A class collects ' + v[0] + '.']);
    return {
      q: form + ' Is this variable categorical or quantitative?',
      a: mcKeep(['Categorical', 'Quantitative'], v[1] === 'c' ? 0 : 1),
      steps: [
        'Ask: would it make sense to add these values or find their average?',
        v[3],
        'So the variable is <b>' + (v[1] === 'c' ? 'categorical' : 'quantitative') + '</b>.'
      ],
      hint: 'Imagine finding the average. Would that number tell you anything?'
    };
  });

  // ---------------------------------------------------------------- categorical displays
  var CATS = [
    ['favorite lunch', 'students', ['Pizza', 'Tacos', 'Salad', 'Sandwich', 'Soup']],
    ['favorite season', 'people', ['Spring', 'Summer', 'Fall', 'Winter']],
    ['way of getting to school', 'students', ['Bus', 'Car', 'Walk', 'Bike']],
    ['favorite kind of book', 'readers', ['Mystery', 'Fantasy', 'History', 'Comics', 'Science']],
    ['type of pet', 'families', ['Dog', 'Cat', 'Fish', 'Bird', 'None']],
    ['favorite fruit', 'campers', ['Apple', 'Banana', 'Orange', 'Grapes']]
  ];
  function pctSplit(R, k) { // k percents, multiples of 5, each at least 5, summing to 100
    for (var t = 0; t < 50; t++) {
      var parts = [], left = 20; // units of 5
      for (var i = 0; i < k - 1; i++) { var hi = left - (k - 1 - i); var x = R.int(1, M.max(1, M.min(hi, 8))); parts.push(x); left -= x; }
      if (left >= 1 && left <= 9) { parts.push(left); var u = U.uniq(parts); if (u.length >= k - 1) return R.shuffle(parts).map(function (x) { return 5 * x; }); }
    }
    return k === 4 ? [35, 25, 25, 15] : [30, 25, 20, 15, 10];
  }
  G('stat.categorical-displays', function (R, ctx) {
    var C = R.pick(CATS), k = C[2].length, pcts = pctSplit(R, k), N = R.pick([20, 40, 60, 80, 120, 200, 400]);
    var counts = pcts.map(function (p) { return p * N / 100; }), i = R.int(0, k - 1), cat = C[2][i];
    var tab = table(['Category', 'Count'], C[2].map(function (c, j) { return [c, String(counts[j])]; }).concat([['<b>Total</b>', '<b>' + N + '</b>']]));
    var intro = 'A survey asked ' + N + ' ' + C[1] + ' about their ' + C[0] + '.';
    var L = lv(ctx), shape = by(ctx, R.pick(['pct', 'rel']), R.pick(['pct', 'angle', 'rel']), R.pick(['angle', 'count', 'more', 'display']));
    if (shape === 'pct') return {
      q: intro + tab + 'What percent chose ' + cat + '?',
      a: num(pcts[i], { pct: true }), unit: '%',
      steps: ['Relative frequency = count ÷ total: $\\dfrac{' + counts[i] + '}{' + N + '} = ' + ns(pcts[i] / 100) + '$.', 'As a percent: $' + ns(pcts[i] / 100) + ' \\times 100 = ' + pct(pcts[i]) + '$.'],
      hint: 'Divide the count for ' + cat + ' by the total.'
    };
    if (shape === 'rel') return {
      q: intro + tab + 'What is the relative frequency of ' + cat + ', as a decimal?',
      a: num(pcts[i] / 100),
      steps: ['Relative frequency = count ÷ total.', '$\\dfrac{' + counts[i] + '}{' + N + '} = ' + ns(pcts[i] / 100) + '$.'],
      hint: 'Relative frequency is a part divided by the whole.'
    };
    if (shape === 'angle') return {
      q: intro + tab + 'In a pie chart of these results, how many degrees should the slice for ' + cat + ' take up?',
      a: num(fix(360 * pcts[i] / 100)), unit: '°',
      steps: ['The whole circle, $360^\\circ$, stands for all ' + N + ' ' + C[1] + '.', cat + ' is $\\dfrac{' + counts[i] + '}{' + N + '} = ' + pct(pcts[i]) + '$ of them.', 'Slice: $' + ns(pcts[i] / 100) + ' \\times 360^\\circ = ' + T.deg(fix(3.6 * pcts[i])) + '$.'],
      hint: 'A pie slice is the same fraction of 360° as the category is of the total.'
    };
    if (shape === 'count') {
      var N2 = R.pick([300, 500, 600, 800, 1200]);
      return {
        q: 'A bar graph of relative frequencies shows that $' + pct(pcts[i]) + '$ of ' + N2 + ' ' + C[1] + ' chose ' + cat + ' as their ' + C[0] + '. How many ' + C[1] + ' is that?',
        a: num(pcts[i] * N2 / 100),
        steps: ['A percent of the total gives the count: $' + ns(pcts[i] / 100) + ' \\times ' + N2 + ' = ' + ns(pcts[i] * N2 / 100) + '$.'],
        hint: 'Change the percent to a decimal and multiply by the total.'
      };
    }
    if (shape === 'more') {
      var j = (i + 1 + R.int(0, k - 2)) % k, a1 = counts[i] >= counts[j] ? i : j, b1 = a1 === i ? j : i;
      if (counts[a1] === counts[b1]) { b1 = counts.indexOf(M.min.apply(null, counts)); a1 = counts.indexOf(M.max.apply(null, counts)); }
      return {
        q: intro + 'The relative frequencies were: ' + C[2].map(function (c, t) { return c + ' $' + pct(pcts[t]) + '$'; }).join(', ') + '. How many more ' + C[1] + ' chose ' + C[2][a1] + ' than ' + C[2][b1] + '?',
        a: num(counts[a1] - counts[b1]),
        steps: [C[2][a1] + ': $' + ns(pcts[a1] / 100) + ' \\times ' + N + ' = ' + counts[a1] + '$.', C[2][b1] + ': $' + ns(pcts[b1] / 100) + ' \\times ' + N + ' = ' + counts[b1] + '$.', 'Difference: $' + counts[a1] + ' - ' + counts[b1] + ' = ' + (counts[a1] - counts[b1]) + '$.'],
        hint: 'Turn each percent into a count first.'
      };
    }
    var disp = R.pick([
      ['the ' + C[0] + ' of ' + N + ' ' + C[1], 'A bar graph or a pie chart', ['A histogram', 'A scatterplot', 'A box plot'], 'The variable is categorical, so each category gets its own bar or slice. Histograms and box plots need numbers on a scale.'],
      ['the heights of ' + N + ' ' + C[1] + ', in inches', 'A histogram', ['A pie chart', 'A bar graph of the categories', 'A two-way table'], 'Height is quantitative, so we group the numbers into intervals on a number line: a histogram.'],
      ['the percent of each answer in a survey where every person picked exactly one answer', 'A pie chart or a bar graph', ['A histogram', 'A scatterplot', 'A dot plot of the percents'], 'The parts make up one whole, and the answers are categories, so a pie chart works (a bar graph does too).']
    ]);
    return {
      q: 'Which display fits ' + disp[0] + ' best?',
      a: mc(disp[1], disp[2]),
      steps: [disp[3]],
      hint: 'First decide: are the data categories or numbers?'
    };
  });

  // ---------------------------------------------------------------- histograms and shape
  var SHAPES = {
    right: [2, 6, 8, 7, 5, 3, 2, 1, 1, 0, 1],
    left: [1, 0, 1, 1, 2, 3, 5, 7, 8, 6, 2],
    sym: [1, 2, 4, 6, 8, 6, 4, 2, 1],
    bimodal: [1, 4, 7, 4, 1, 0, 1, 4, 7, 4, 1]
  };
  var SHAPE_NAME = { right: 'Skewed right', left: 'Skewed left', sym: 'Roughly symmetric', bimodal: 'Bimodal' };
  var SHAPE_CTX = [
    ['household incomes in a large city', 'right', 'Most households earn a moderate amount, and a few earn far more, which makes a long tail toward high values.'],
    ['times people take to solve a hard puzzle', 'right', 'Most finish in a typical time, but a few take much longer, so the tail runs to the right.'],
    ['scores on a very easy quiz worth 10 points', 'left', 'Most scores pile up near 10, and a few low scores trail off to the left.'],
    ['ages at retirement', 'left', 'Most people retire in their 60s; a few retire much earlier, so the long tail points to the left.'],
    ['heights of adult women', 'sym', 'Heights cluster around the middle and thin out about equally on both sides.'],
    ['the number of hours of sleep students get on a school night', 'sym', 'Most values sit near the middle, with similar spread above and below.'],
    ['heights of a group that mixes first graders and their parents', 'bimodal', 'Two different groups make two peaks.'],
    ['prices of houses in a town where most homes are modest and a few are mansions', 'right', 'The few very high prices form a long tail on the right.']
  ];
  function shapeData(R, kind) {
    var base = SHAPES[kind].map(function (c) { return M.max(0, c + (c > 2 ? R.int(-1, 1) : 0)); }), lo = R.int(0, 10), data = [];
    base.forEach(function (c, i) { for (var j = 0; j < c; j++) data.push(lo + i); });
    return { data: data, lo: lo, hi: lo + base.length - 1 };
  }
  G('stat.histograms-shape', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'plot', R.pick(['plot', 'plot', 'tail']), R.pick(['plot', 'tail', 'context']));
    var all = ['right', 'left', 'sym', 'bimodal'], choices = all.map(function (k) { return SHAPE_NAME[k]; });
    if (shape === 'plot') {
      var kind = R.pick(all), d = shapeData(R, kind), what = R.pick([['minutes spent on homework', 'students'], ['points scored per game', 'games'], ['customers per hour', 'hours'], ['books read last summer', 'students']]);
      var why = { right: 'Most values are on the left, and a thin tail stretches to the right. Skew is named for the tail, so this is <b>skewed right</b>.', left: 'Most values are on the right, and a thin tail stretches to the left. The tail names the skew: <b>skewed left</b>.', sym: 'The left and right halves look about the same: <b>roughly symmetric</b>.', bimodal: 'There are two separate peaks: <b>bimodal</b>.' }[kind];
      return {
        q: 'The dot plot shows ' + what[0] + ' for ' + d.data.length + ' ' + what[1] + '. Which word best describes its shape?',
        viz: { name: 'stat-chart', opts: { kind: 'dots', data: d.data, min: d.lo - 1, max: d.hi + 1, xlabel: what[0] }, label: 'A dot plot of ' + what[0] },
        a: mcKeep(choices, all.indexOf(kind)),
        steps: ['Find where most of the dots pile up, then look for a long, thin tail or a second peak.', why],
        hint: 'Skew is named for the side with the long, thin tail, not for the side with the most data.'
      };
    }
    if (shape === 'tail') {
      var side = R.pick(['right', 'left']), v = R.pick([[2, 4, 30], [5, 8, 60], [10, 15, 90]]);
      var lowHeavy = side === 'right';
      var desc = lowHeavy ? 'Most values are between ' + v[0] + ' and ' + v[1] + ', but a few values stretch out as high as ' + v[2] + '.' : 'Most values are between ' + (v[2] - v[1]) + ' and ' + (v[2] - v[0]) + ', but a few values stretch down as low as ' + R.int(0, 3) + '.';
      return {
        q: 'A histogram has this shape: ' + desc + ' How is it skewed?',
        a: mcKeep(['Skewed right', 'Skewed left', 'Roughly symmetric'], lowHeavy ? 0 : 1),
        steps: ['The bulk of the data is on the ' + (lowHeavy ? 'low (left)' : 'high (right)') + ' side.', 'The long, thin tail points toward ' + (lowHeavy ? 'high values, on the right' : 'low values, on the left') + '.', 'Skew is named for the tail: <b>skewed ' + side + '</b>.'],
        hint: 'Follow the long tail. The direction it points is the name of the skew.'
      };
    }
    var c = R.pick(SHAPE_CTX);
    return {
      q: 'What shape would you expect for a histogram of ' + c[0] + '?',
      a: mcKeep(choices, all.indexOf(c[1])),
      steps: [c[2], 'So the shape is <b>' + SHAPE_NAME[c[1]].toLowerCase() + '</b>.'],
      hint: 'Picture where most values are, and whether a few unusual values sit far out on one side.'
    };
  });

  // ---------------------------------------------------------------- mean, median and resistance
  function niceData(R, n, lo, hi) { // n integers whose mean is a whole number
    var a = []; for (var i = 0; i < n - 1; i++) a.push(R.int(lo, hi));
    var s = sum(a), need = ((n - (s % n)) % n);
    var last = lo + need; while (last + n <= hi && R.coin()) last += n; if (last > hi) last -= n;
    if (last < lo) last = lo + ((need + n) % n);
    a.push(last);
    if (sum(a) % n !== 0) { a[n - 1] += (n - sum(a) % n) % n; }
    return a;
  }
  G('stat.center-resistance', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'both', R.pick(['typo', 'both']), R.pick(['typo', 'choose', 'skew']));
    var ctxs = [['minutes of reading', 'days'], ['dollars spent at a snack bar', 'visits'], ['goals scored', 'games'], ['inches of rain', 'months']];
    if (shape === 'both') {
      var n = R.pick([5, 7]), d = niceData(R, n, 2, 20), w = R.pick(ctxs);
      var s = sorted(d), mu = mean(d), md = median(d);
      return {
        q: 'Here are ' + w[0] + ' on ' + n + ' ' + w[1] + ': ' + dataList(d) + '. Find the mean and the median.',
        a: { t: 'multi', parts: [{ label: 'mean $=$', a: num(mu) }, { label: 'median $=$', a: num(md) }] },
        steps: ['Mean: add and divide. $' + d.join(' + ') + ' = ' + sum(d) + '$, and $' + sum(d) + ' \\div ' + n + ' = ' + ns(mu) + '$.', 'Median: sort the values: $' + list(s) + '$.', 'The middle (' + U.ordinal((n + 1) / 2) + ') value is $' + ns(md) + '$.'],
        hint: 'For the median, put the values in order first.'
      };
    }
    if (shape === 'typo') {
      var n2 = R.pick([5, 6, 8]), base = niceData(R, n2, 10, 30), s2 = sorted(base), big = s2[n2 - 1];
      var wrong = big + n2 * R.int(8, 20), d2 = base.slice(), at = d2.indexOf(big); d2[at] = wrong;
      var mu1 = mean(d2), mu2 = mean(base), md1 = median(d2), md2 = median(base);
      return {
        q: 'A list of ' + n2 + ' quiz scores is ' + dataList(d2) + '. The score ' + wrong + ' was a typo: it should be ' + big + '. After you fix it, what are the new mean and the new median?',
        a: { t: 'multi', parts: [{ label: 'new mean $=$', a: num(mu2) }, { label: 'new median $=$', a: num(md2) }] },
        steps: ['Old mean: $' + ns(sum(d2)) + ' \\div ' + n2 + ' = ' + ns(mu1) + '$. Fixing the typo lowers the total by $' + (wrong - big) + '$, so the new mean is $' + ns(sum(base)) + ' \\div ' + n2 + ' = ' + ns(mu2) + '$.', 'Sorted, the fixed data are $' + list(s2) + '$. The median is $' + ns(md2) + '$.', 'The old median was also $' + ns(md1) + '$: changing the largest value did not move the middle. The median resists the outlier; the mean does not.'],
        hint: 'The median depends only on the middle of the sorted list.'
      };
    }
    if (shape === 'choose') {
      var d3 = sorted(niceData(R, 6, 20, 40)), out = d3[5] + R.int(60, 120); d3[5] = out; var mu3 = mean(d3), md3 = median(d3);
      return {
        q: 'Six home prices on one street, in thousands of dollars, are ' + dataList(d3) + '. Which number better describes a typical price, and why?',
        a: mc('The median, ' + ns(md3) + ', because the one very high price pulls the mean up', ['The mean, about ' + ns(rd(mu3, 1)) + ', because it uses every value', 'The mean, about ' + ns(rd(mu3, 1)) + ', because the data are symmetric', 'The median, ' + ns(md3) + ', because it is always smaller than the mean']),
        steps: ['Mean $= ' + ns(sum(d3)) + ' \\div 6 \\approx ' + ns(rd(mu3, 1)) + '$, median $= ' + ns(md3) + '$.', 'One price (' + out + ') is far above the rest. It drags the mean upward, past most of the data.', 'The median is resistant: it stays near the bulk of the values, so it better describes a typical price.'],
        hint: 'Which measure is pulled by one extreme value?'
      };
    }
    var sk = R.pick([['skewed right', 'greater than'], ['skewed left', 'less than'], ['roughly symmetric', 'about equal to']]);
    return {
      q: 'A distribution is ' + sk[0] + '. How does its mean most likely compare with its median?',
      a: mcKeep(['The mean is greater than the median', 'The mean is less than the median', 'The mean is about equal to the median'], ['greater than', 'less than', 'about equal to'].indexOf(sk[1])),
      steps: ['The mean is pulled toward the long tail; the median stays with the bulk of the data.', sk[0] === 'roughly symmetric' ? 'With no long tail, the two are close.' : 'The tail is on the ' + sk[0].split(' ')[1] + ', so the mean is pulled that way.', 'So the mean is ' + sk[1] + ' the median.'],
      hint: 'The mean follows the tail.'
    };
  });

  // ---------------------------------------------------------------- standard deviation
  function devSet(R, n, sTarget) { // n integer deviations summing to 0 with sum of squares (n-1) * s^2
    var want = (n - 1) * sTarget * sTarget;
    for (var t = 0; t < 600; t++) {
      var d = [], s = 0; for (var i = 0; i < n - 1; i++) { var x = R.int(-2 * sTarget, 2 * sTarget); d.push(x); s += x; }
      d.push(-s); if (M.abs(s) > 3 * sTarget) continue;
      if (d.reduce(function (a, x) { return a + x * x; }, 0) === want && U.uniq(d).length >= 3) return d;
    }
    return null;
  }
  G('stat.standard-deviation', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'int', R.pick(['int', 'dec']), R.pick(['dec', 'var', 'compare']));
    var w = R.pick([['pounds', 'five puppies weigh'], ['minutes', 'five commutes took'], ['points', 'five games produced'], ['dollars', 'five tips were']]);
    if (shape === 'int') {
      var sT = R.pick([2, 3, 4, 5, 6]), dv = devSet(R, 5, sT); if (!dv) { dv = [-sT, -sT, 0, sT, sT]; dv = R.shuffle(dv); }
      var m = R.int(12, 40), data = dv.map(function (x) { return m + x; }), ssv = sum(dv.map(function (x) { return x * x; }));
      return {
        q: 'The ' + w[1] + ' ' + dataList(data) + ' ' + w[0] + '. Find the sample standard deviation $s$.',
        a: num(sT),
        steps: [
          'Mean: $\\bar{x} = ' + sum(data) + ' \\div 5 = ' + m + '$.',
          'Deviations $x - \\bar{x}$: $' + list(dv) + '$ (they add to 0).',
          'Squares: $' + list(dv.map(function (x) { return x * x; })) + '$, which add to $' + ssv + '$.',
          'Divide by $n - 1 = 4$: $s^2 = ' + ssv + ' \\div 4 = ' + (sT * sT) + '$.',
          'Take the square root: $s = \\sqrt{' + (sT * sT) + '} = ' + sT + '$ ' + w[0] + '.'
        ],
        hint: 'Find the mean, square each distance from it, add, divide by n − 1, then take the square root.'
      };
    }
    if (shape === 'dec' || shape === 'var') {
      var n = R.pick([4, 5, 6]), data2 = niceData(R, n, 2, 18), m2 = mean(data2), dv2 = data2.map(function (x) { return x - m2; }), ss2 = sum(dv2.map(function (x) { return x * x; }));
      if (ss2 === 0) { data2[0] += n; data2[1] -= n; m2 = mean(data2); dv2 = data2.map(function (x) { return x - m2; }); ss2 = sum(dv2.map(function (x) { return x * x; })); }
      var v2 = q(ss2, n - 1), sv = M.sqrt(ss2 / (n - 1)), isVar = shape === 'var' && R.coin();
      var stepsB = ['Mean: $\\bar{x} = ' + sum(data2) + ' \\div ' + n + ' = ' + ns(m2) + '$.', 'Deviations: $' + list(dv2) + '$.', 'Squares: $' + list(dv2.map(function (x) { return x * x; })) + '$; their sum is $' + ss2 + '$.', 'Variance: $s^2 = ' + ss2 + ' \\div ' + (n - 1) + ' = ' + (v2.isTerminating() ? ns(v2.toNumber()) : v2.toTex() + ' \\approx ' + ns(rd(v2.toNumber(), 3))) + '$.'];
      if (isVar) return {
        q: 'Find the sample variance $s^2$ of ' + dataList(data2) + '.',
        a: v2.isTerminating() ? num(qv(v2)) : { t: 'num', v: v2.toPlain(), tol: 0.005 },
        steps: stepsB.concat(['The variance is in squared units. Its square root, $s \\approx ' + ns(rd(sv, 2)) + '$, is the standard deviation.']),
        hint: 'Variance is the sum of squared deviations divided by n − 1.'
      };
      return {
        q: 'Find the sample standard deviation of ' + dataList(data2) + '. Round to two decimal places.',
        a: { t: 'num', v: ns(rd(sv, 2)), tol: 0.01 },
        steps: stepsB.concat(['Standard deviation: $s = \\sqrt{s^2} \\approx ' + ns(rd(sv, 2)) + '$.']),
        hint: 'Do not stop at the variance: take its square root.'
      };
    }
    // compare two data sets with the same mean and range
    var c = R.int(10, 20), A = [c - 4, c - 4, c, c + 4, c + 4], B = [c - 4, c - 1, c, c + 1, c + 4];
    var sA = sdS(A), sB = sdS(B), flip = R.coin(), P = flip ? A : B, Qs = flip ? B : A;
    return {
      q: 'Set P: ' + dataList(P) + '. Set Q: ' + dataList(Qs) + '. Both have mean ' + c + ' and range 8. Which set has the larger standard deviation?',
      a: mcKeep(['Set P', 'Set Q', 'They are equal, since the ranges are equal'], flip ? 0 : 1),
      steps: ['The range only uses the two extreme values; the standard deviation uses every value.', 'In set ' + (flip ? 'P' : 'Q') + ', four of the five values are 4 away from the mean. In the other set, two values are only 1 away.', 'So set ' + (flip ? 'P' : 'Q') + ' has the larger typical distance from the mean: $s \\approx ' + ns(rd(sA, 2)) + '$ versus $s \\approx ' + ns(rd(sB, 2)) + '$.'],
      hint: 'Compare how far a typical value is from the mean, not just the extremes.'
    };
  });

  // ---------------------------------------------------------------- five-number summary and outliers
  G('stat.five-number-outliers', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'quart', R.pick(['fence', 'outliers']), R.pick(['outliers', 'count']));
    var n = R.pick([9, 10, 11, 12]), d = [], start = R.int(10, 40);
    for (var tr = 0; tr < 30; tr++) { d = []; for (var i = 0; i < n; i++) d.push(start + R.int(0, 12)); var f9 = five(d); if (f9.q3 - f9.q1 >= 3) break; }
    if (shape === 'outliers' || shape === 'count' || (shape === 'fence' && R.coin())) { // plant outliers
      var f0 = five(d), iq = f0.q3 - f0.q1 || 2;
      d[d.indexOf(sorted(d)[n - 1])] = f0.q3 + M.ceil(1.5 * iq) + R.int(3, 15);
      if (shape === 'count' && R.coin()) { var f1 = five(d); d[d.indexOf(sorted(d)[0])] = f1.q1 - M.ceil(1.5 * (f1.q3 - f1.q1)) - R.int(2, 9); }
    }
    var s = sorted(d), f = five(d), IQR = fix(f.q3 - f.q1), lo = fix(f.q1 - 1.5 * IQR), hi = fix(f.q3 + 1.5 * IQR);
    var outs = s.filter(function (x) { return x < lo || x > hi; });
    var h = n >> 1, lowH = s.slice(0, h), upH = s.slice(n % 2 ? h + 1 : h);
    var qsteps = ['Sort: $' + list(s) + '$.', 'Median: $' + ns(f.med) + '$' + (n % 2 ? ' (the middle value, left out of both halves).' : ' (the mean of the two middle values).'), 'Lower half $' + list(lowH) + '$ has median $Q_1 = ' + ns(f.q1) + '$.', 'Upper half $' + list(upH) + '$ has median $Q_3 = ' + ns(f.q3) + '$.', '$\\text{IQR} = Q_3 - Q_1 = ' + ns(f.q3) + ' - ' + ns(f.q1) + ' = ' + ns(IQR) + '$.'];
    var fsteps = ['Fences: $Q_1 - 1.5(\\text{IQR}) = ' + ns(f.q1) + ' - ' + ns(fix(1.5 * IQR)) + ' = ' + ns(lo) + '$ and $Q_3 + 1.5(\\text{IQR}) = ' + ns(f.q3) + ' + ' + ns(fix(1.5 * IQR)) + ' = ' + ns(hi) + '$.'];
    var given = shape === 'quart' ? s : (L >= 3 ? d : s);
    if (shape === 'quart') return {
      q: 'Find $Q_1$, $Q_3$ and the interquartile range of: ' + dataList(given) + '.',
      a: { t: 'multi', parts: [{ label: '$Q_1 =$', a: num(f.q1) }, { label: '$Q_3 =$', a: num(f.q3) }, { label: '$\\text{IQR} =$', a: num(IQR) }] },
      steps: qsteps,
      hint: 'Split the sorted data at the median, then find the median of each half.'
    };
    if (shape === 'fence') return {
      q: 'For the data ' + dataList(given) + ', find the upper fence $Q_3 + 1.5 \\cdot \\text{IQR}$, and say whether $' + s[n - 1] + '$ is an outlier.',
      a: { t: 'multi', parts: [{ label: 'upper fence $=$', a: num(hi) }, { label: 'Is $' + s[n - 1] + '$ an outlier?', a: mcKeep(['Yes', 'No'], s[n - 1] > hi ? 0 : 1) }] },
      steps: qsteps.concat(['Upper fence: $' + ns(f.q3) + ' + 1.5 \\times ' + ns(IQR) + ' = ' + ns(hi) + '$.', '$' + s[n - 1] + (s[n - 1] > hi ? ' > ' : ' \\le ') + ns(hi) + '$, so it is ' + (s[n - 1] > hi ? '' : 'not ') + 'an outlier.']),
      hint: 'Find the quartiles first; the fence is 1.5 IQRs beyond Q3.'
    };
    if (shape === 'count') return {
      q: 'How many outliers does this data set have by the $1.5 \\times \\text{IQR}$ rule? ' + dataList(given),
      a: num(outs.length, { form: 'int' }),
      steps: qsteps.concat(fsteps, ['Values outside the fences: ' + (outs.length ? '$' + list(outs) + '$' : 'none') + '. That is ' + outs.length + '.']),
      hint: 'A value is an outlier if it is below the lower fence or above the upper fence.'
    };
    return {
      q: 'Use the $1.5 \\times \\text{IQR}$ rule to list every outlier in: ' + dataList(given) + '.',
      a: { t: 'set', v: U.uniq(outs).map(ns) },
      steps: qsteps.concat(fsteps, ['Outliers (outside the fences): $' + list(outs) + '$.']),
      hint: 'Compute the fences Q1 − 1.5·IQR and Q3 + 1.5·IQR, then check the smallest and largest values.'
    };
  });

  // ---------------------------------------------------------------- comparing distributions
  G('stat.compare-distributions', function (R, ctx) {
    var L = lv(ctx), w = R.pick([['battery life (hours)', 'Brand A', 'Brand B'], ['quiz score', 'Class 1', 'Class 2'], ['commute time (minutes)', 'Route A', 'Route B'], ['plant height (cm)', 'Sunny bed', 'Shady bed']]);
    for (var t = 0; t < 40; t++) {
      var mA = R.int(20, 40), mB = mA + R.pick([-1, 1]) * R.int(3, 8), iA = 2 * R.int(2, 7), iB = 2 * R.int(2, 7);
      if (iA !== iB && M.abs(mA - mB) < (iA + iB) / 2 + 4) break;
    }
    function box(m, iq) { var q1 = m - iq / 2 - R.int(-1, 1), q3 = q1 + iq; if (q1 >= m) q1 = m - 1; if (q3 <= m) q3 = m + 1; return { min: q1 - R.int(2, 8), q1: q1, med: m, q3: q3, max: q3 + R.int(2, 8) }; }
    var A = box(mA, iA), B = box(mB, iB), IA = A.q3 - A.q1, IB = B.q3 - B.q1, hb = mA > mB ? A : B, lb = mA > mB ? B : A;
    if (hb.min >= lb.max) { lb.max = hb.q1 + 1 + R.int(0, 2); hb.min = M.min(hb.q1 - 1, lb.max - 2); }
    var viz = { name: 'stat-chart', opts: { kind: 'box', boxes: [Object.assign({ name: w[1] }, A), Object.assign({ name: w[2] }, B)], xlabel: w[0] }, label: 'Two box plots of ' + w[0] };
    var hiM = mA > mB ? w[1] : w[2], loM = mA > mB ? w[2] : w[1], moreSpread = IA > IB ? w[1] : w[2], lessSpread = IA > IB ? w[2] : w[1];
    var summ = w[1] + ': median ' + A.med + ', IQR ' + IA + '. ' + w[2] + ': median ' + B.med + ', IQR ' + IB + '.';
    var shape = by(ctx, 'nums', R.pick(['nums', 'statement']), R.pick(['statement', 'overlap']));
    if (shape === 'nums') return {
      q: 'The box plots compare ' + w[0] + ' for ' + w[1] + ' and ' + w[2] + '. Find each IQR, and the difference in medians (' + w[2] + ' minus ' + w[1] + ').',
      viz: viz,
      a: { t: 'multi', parts: [{ label: 'IQR of ' + w[1] + ' $=$', a: num(IA) }, { label: 'IQR of ' + w[2] + ' $=$', a: num(IB) }, { label: 'difference in medians $=$', a: num(B.med - A.med) }] },
      steps: ['Read each box: ' + w[1] + ' has $Q_1 = ' + A.q1 + '$, median ' + A.med + ', $Q_3 = ' + A.q3 + '$; ' + w[2] + ' has $Q_1 = ' + B.q1 + '$, median ' + B.med + ', $Q_3 = ' + B.q3 + '$.', 'IQRs: $' + A.q3 + ' - ' + A.q1 + ' = ' + IA + '$ and $' + B.q3 + ' - ' + B.q1 + ' = ' + IB + '$.', 'Difference in medians: $' + B.med + ' - ' + A.med + ' = ' + (B.med - A.med) + '$.', 'In context: ' + hiM + ' is higher in the middle, and ' + moreSpread + ' is more spread out.'],
      hint: 'The IQR is the width of the box; the median is the line inside it.'
    };
    if (shape === 'statement') return {
      q: 'The box plots compare ' + w[0] + ' for ' + w[1] + ' and ' + w[2] + '. Which comparison is complete and correct?',
      viz: viz,
      a: mc('The median of ' + hiM + ' is higher, and ' + moreSpread + ' is more spread out (its IQR is larger).', ['The median of ' + hiM + ' is higher, and ' + lessSpread + ' is more spread out (its IQR is larger).', 'The median of ' + loM + ' is higher, and ' + moreSpread + ' is more spread out (its IQR is larger).', 'The median of ' + hiM + ' is higher. Nothing else can be compared from box plots.']),
      steps: [summ, 'Center: compare the medians. ' + hiM + ' is higher.', 'Spread: compare the IQRs (box widths). ' + moreSpread + ' has the larger IQR.', 'A complete comparison names both center and spread, in context.'],
      hint: 'Compare the middle lines for center and the box widths for spread.'
    };
    var overlap = M.min(A.q3, B.q3) > M.max(A.q1, B.q1);
    return {
      q: 'The box plots compare ' + w[0] + ' for ' + w[1] + ' and ' + w[2] + '. Which statement is supported by the plots?',
      viz: viz,
      a: overlap ? mc('The middle halves overlap, so many individuals in ' + loM + ' beat many in ' + hiM + ', even though ' + hiM + ' has the higher median.', ['Every value in ' + hiM + ' is higher than every value in ' + loM + '.', 'The two groups have the same spread, since their ranges overlap.', hiM + ' has the higher mean, because its box is wider.'])
        : mc('The middle halves do not overlap: at least three quarters of ' + hiM + ' is above the median of ' + loM + '.', ['Every value in ' + hiM + ' is higher than every value in ' + loM + '.', 'The two groups have the same spread, since their ranges overlap.', hiM + ' has the higher mean, because its box is wider.']),
      steps: [summ, 'Boxes show the middle half of each group. ' + (overlap ? 'Here they overlap, so the groups share many values.' : 'Here the boxes do not overlap, so the groups are clearly separated in the middle.'), 'The whiskers show the full range, and they overlap, so "every value is higher" is not true.', 'Box plots do not show the mean, and box width is about spread, not center.'],
      hint: 'Look at where the boxes sit relative to each other, not only at the medians.'
    };
  });

  // ---------------------------------------------------------------- z-scores
  var ZS = [-2.5, -2, -1.5, -1.2, -1, -0.8, -0.5, -0.4, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 1.6, -1.6, 0.6, -0.6];
  G('stat.z-scores', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'z', R.pick(['z', 'x']), R.pick(['x', 'compare']));
    var w = R.pick([['test score', 'points'], ['height', 'cm'], ['reaction time', 'milliseconds'], ['apple weight', 'grams']]);
    var sig = R.pick([5, 8, 10, 12, 15, 20]), mu = R.int(4, 20) * 5, z = R.pick(L === 1 ? ZS.filter(function (x) { return x === M.round(x * 2) / 2; }) : ZS), x = fix(mu + z * sig);
    if (shape === 'z') return {
      q: 'A ' + w[0] + ' distribution has mean $\\mu = ' + mu + '$ and standard deviation $\\sigma = ' + sig + '$ ' + w[1] + '. Find the z-score of a value $x = ' + ns(x) + '$.',
      a: num(z),
      steps: ['$z = \\dfrac{x - \\mu}{\\sigma} = \\dfrac{' + ns(x) + ' - ' + mu + '}{' + sig + '} = \\dfrac{' + ns(fix(x - mu)) + '}{' + sig + '} = ' + ns(z) + '$.', 'The value is ' + ns(M.abs(z)) + ' standard deviations ' + (z > 0 ? 'above' : 'below') + ' the mean' + (z < 0 ? ', so z is negative.' : '.')],
      hint: 'Subtract the mean from the value (value first), then divide by the standard deviation.'
    };
    if (shape === 'x') return {
      q: 'A ' + w[0] + ' distribution has mean ' + mu + ' and standard deviation ' + sig + ' ' + w[1] + '. What value has a z-score of $' + ns(z) + '$?',
      a: num(x),
      steps: ['$z$ counts standard deviations from the mean, so $x = \\mu + z\\sigma$.', '$x = ' + mu + ' + (' + ns(z) + ')(' + sig + ') = ' + mu + T.signed(fix(z * sig)) + ' = ' + ns(x) + '$.'],
      hint: 'Start at the mean and move z standard deviations.'
    };
    var t1 = R.pick([[70, 10], [500, 100], [80, 5], [24, 4], [150, 20], [60, 8]]), t2;
    do { t2 = R.pick([[70, 10], [500, 100], [80, 5], [24, 4], [150, 20], [60, 8]]); } while (t2 === t1);
    var z1 = R.pick([0.5, 1, 1.5, 2, 1.2, 0.8, 1.6]), z2; do { z2 = R.pick([0.5, 1, 1.5, 2, 1.2, 0.8, 1.6]); } while (z2 === z1);
    var x1 = fix(t1[0] + z1 * t1[1]), x2 = fix(t2[0] + z2 * t2[1]);
    return {
      q: 'Maya scored ' + ns(x1) + ' on a history test (mean ' + t1[0] + ', standard deviation ' + t1[1] + '). Leo scored ' + ns(x2) + ' on a science test (mean ' + t2[0] + ', standard deviation ' + t2[1] + '). Find each z-score. Who did better compared with their own class?',
      a: { t: 'multi', parts: [{ label: 'Maya: $z =$', a: num(z1) }, { label: 'Leo: $z =$', a: num(z2) }, { label: 'Better relative score:', a: mcKeep(['Maya', 'Leo'], z1 > z2 ? 0 : 1) }] },
      steps: ['Maya: $z = \\dfrac{' + ns(x1) + ' - ' + t1[0] + '}{' + t1[1] + '} = ' + ns(z1) + '$.', 'Leo: $z = \\dfrac{' + ns(x2) + ' - ' + t2[0] + '}{' + t2[1] + '} = ' + ns(z2) + '$.', 'The larger z-score is farther above its own mean: ' + (z1 > z2 ? 'Maya' : 'Leo') + '.'],
      hint: 'Raw scores on different tests cannot be compared directly; z-scores can.'
    };
  });

  // ---------------------------------------------------------------- shifting and scaling data
  G('stat.transform-data', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'add', R.pick(['mult', 'add']), R.pick(['both', 'tf']));
    if (shape === 'add') {
      var m = R.int(60, 85), s = R.int(4, 12), c = R.int(3, 10), md = m + R.int(-3, 3);
      return {
        q: 'Quiz scores have mean ' + m + ', median ' + md + ' and standard deviation ' + s + '. The teacher adds ' + c + ' bonus points to every score. Find the new mean and the new standard deviation.',
        a: { t: 'multi', parts: [{ label: 'new mean $=$', a: num(m + c) }, { label: 'new standard deviation $=$', a: num(s) }] },
        steps: ['Adding ' + c + ' to every value slides the whole distribution ' + c + ' to the right.', 'Centers move with it: new mean $= ' + m + ' + ' + c + ' = ' + (m + c) + '$ (the median also moves, to ' + (md + c) + ').', 'Distances between values do not change, so the spread stays the same: $s = ' + s + '$.'],
        hint: 'Adding a constant moves every value the same amount. Does that change how far apart they are?'
      };
    }
    if (shape === 'mult') {
      var u = R.pick([['hours', 'minutes', 60, 1.5, 0.5, 'study time'], ['feet', 'inches', 12, 5.5, 0.25, 'board length'], ['meters', 'centimeters', 100, 1.6, 0.08, 'jump distance'], ['pounds', 'ounces', 16, 7.5, 1.25, 'package weight']]);
      var m2 = fix(u[3] + R.int(-2, 2) * u[4]), s2 = u[4];
      return {
        q: 'The ' + u[5] + 's in a data set have mean ' + ns(m2) + ' ' + u[0] + ' and standard deviation ' + ns(s2) + ' ' + u[0] + '. Every value is converted to ' + u[1] + ' (multiply by ' + u[2] + '). Find the new mean and standard deviation.',
        a: { t: 'multi', parts: [{ label: 'new mean $=$', a: num(fix(m2 * u[2])) }, { label: 'new standard deviation $=$', a: num(fix(s2 * u[2])) }] },
        steps: ['Multiplying every value by ' + u[2] + ' multiplies every distance between values by ' + u[2] + ' too.', 'Mean: $' + ns(m2) + ' \\times ' + u[2] + ' = ' + ns(fix(m2 * u[2])) + '$ ' + u[1] + '.', 'Standard deviation: $' + ns(s2) + ' \\times ' + u[2] + ' = ' + ns(fix(s2 * u[2])) + '$ ' + u[1] + '.'],
        hint: 'Multiplying stretches both the center and the spread by the same factor.'
      };
    }
    if (shape === 'both') {
      var mc0 = R.int(10, 30), sc0 = R.pick([2, 3, 4, 5, 2.5, 1.5]), mf = fix(1.8 * mc0 + 32), sf = fix(1.8 * sc0);
      return {
        q: 'Daily high temperatures in a city have mean $' + T.deg(mc0) + '$C and standard deviation $' + T.deg(sc0) + '$C. Converted to Fahrenheit with $F = 1.8C + 32$, what are the mean and the standard deviation?',
        a: { t: 'multi', parts: [{ label: 'mean ($^\\circ$F) $=$', a: num(mf) }, { label: 'standard deviation ($^\\circ$F) $=$', a: num(sf) }] },
        steps: ['The mean follows the formula exactly: $1.8(' + mc0 + ') + 32 = ' + ns(mf) + '$.', 'Multiplying by 1.8 stretches the spread by 1.8. Adding 32 slides everything but does not change spread.', 'Standard deviation: $1.8(' + ns(sc0) + ') = ' + ns(sf) + '$.'],
        hint: 'Apply the whole formula to the mean, but only the multiplier to the standard deviation.'
      };
    }
    var st = R.pick([
      ['Adding 5 to every value increases the standard deviation by 5.', false, 'Adding 5 shifts every value equally; the gaps between values are unchanged, so the standard deviation stays the same.'],
      ['Adding 5 to every value increases the median by 5.', true, 'Every value, including the middle one, moves up 5.'],
      ['Multiplying every value by 3 multiplies the IQR by 3.', true, 'Both quartiles are multiplied by 3, so their difference is too.'],
      ['Multiplying every value by 2 leaves the standard deviation unchanged.', false, 'Every distance from the mean doubles, so the standard deviation doubles.'],
      ['Subtracting 10 from every value lowers the range by 10.', false, 'Both the maximum and the minimum go down 10, so their difference is the same.'],
      ['Multiplying every value by −1 leaves the standard deviation unchanged.', true, 'The data are reflected; distances from the mean keep their sizes, so the standard deviation is the same (spread is never negative).']
    ]);
    return {
      q: 'True or false: ' + st[0],
      a: { t: 'tf', v: st[1] },
      steps: [st[2]],
      hint: 'Ask whether the change moves the data, stretches it, or both.'
    };
  });


  // ================================================================ unit 2: the normal distribution

  // ---------------------------------------------------------------- 68-95-99.7
  var BANDS = ['0.15', '2.35', '13.5', '34', '34', '13.5', '2.35', '0.15']; // percent in (-inf,-3), (-3,-2), ... (3, inf)
  function bandPct(k1, k2) { // percent between k1 and k2 standard deviations (k in -4..4; ±4 means ±infinity)
    var s = Q(0); for (var i = k1 + 4; i < k2 + 4; i++) s = s.add(Q.from(BANDS[i]));
    return s;
  }
  var NORM_CTX = [
    ['IQ-style test scores', 100, 15, 'points'], ['heights of adult men', 70, 3, 'inches'], ['weights of bags of rice', 1000, 10, 'grams'],
    ['times to run a 5K race', 30, 4, 'minutes'], ['lengths of a kind of trout', 40, 5, 'cm'], ['amounts of water used per home in a day', 350, 40, 'liters'],
    ['battery lifetimes', 500, 50, 'hours'], ['cereal box weights', 16, 0.2, 'ounces']
  ];
  G('stat.normal-curve', function (R, ctx) {
    var L = lv(ctx), c = R.pick(NORM_CTX), mu = c[1], sg = c[2], X = function (k) { return ns(fix(mu + k * sg)); };
    var shape = by(ctx, R.pick(['within', 'tail']), R.pick(['between', 'tail', 'within']), R.pick(['between', 'count', 'pctile', 'fit']));
    var head = 'The ' + c[0] + ' follow a normal distribution with mean ' + ns(mu) + ' and standard deviation ' + ns(sg) + ' ' + c[3] + '. ';
    var rule = 'The 68-95-99.7 rule splits the curve into pieces: $34\\%$ between the mean and 1 SD on each side, $13.5\\%$ between 1 and 2 SD, $2.35\\%$ between 2 and 3 SD, and $0.15\\%$ beyond 3 SD.';
    if (shape === 'within') {
      var k = R.pick([1, 2, 3]);
      return {
        q: head + 'About what percent of them are between ' + X(-k) + ' and ' + X(k) + ' ' + c[3] + '?',
        a: num(qv(bandPct(-k, k)), { pct: true }), unit: '%',
        steps: [X(-k) + ' and ' + X(k) + ' are ' + k + ' standard deviation' + (k > 1 ? 's' : '') + ' below and above the mean: $' + ns(mu) + ' \\pm ' + k + '(' + ns(sg) + ')$.', 'Within ' + k + ' SD of the mean lies about $' + pct(bandPct(-k, k).toNumber()) + '$.'],
        hint: 'How many standard deviations from the mean are the two values?'
      };
    }
    if (shape === 'tail') {
      var k2 = R.pick([1, 2, 3]), up = R.coin(), p2 = up ? bandPct(k2, 4) : bandPct(-4, -k2);
      return {
        q: head + 'About what percent are ' + (up ? 'above ' + X(k2) : 'below ' + X(-k2)) + ' ' + c[3] + '?',
        a: num(qv(p2), { pct: true }), unit: '%',
        steps: [(up ? X(k2) : X(-k2)) + ' is ' + k2 + ' SD ' + (up ? 'above' : 'below') + ' the mean.', 'Within ' + k2 + ' SD lies $' + pct(bandPct(-k2, k2).toNumber()) + '$, so $' + ns(Q(100).sub(bandPct(-k2, k2)).toNumber()) + '\\%$ lies outside, split equally between the two tails.', 'One tail: $' + ns(Q(100).sub(bandPct(-k2, k2)).toNumber()) + '\\% \\div 2 = ' + pct(p2.toNumber()) + '$.'],
        hint: 'Find the percent outside the band, then take half of it for one side.'
      };
    }
    var a = R.int(-3, 2), b = R.int(a + 1, 3);
    if (a === -3 && b === 3) b = 2;
    var pb = bandPct(a, b);
    if (shape === 'between') return {
      q: head + 'About what percent are between ' + X(a) + ' and ' + X(b) + ' ' + c[3] + '?',
      a: num(qv(pb), { pct: true }), unit: '%',
      steps: [X(a) + ' is ' + (a === 0 ? 'the mean' : 'at $z = ' + a + '$') + ', and ' + X(b) + ' is ' + (b === 0 ? 'the mean' : 'at $z = ' + b + '$') + '.', rule, 'Add the pieces from $z = ' + a + '$ to $z = ' + b + '$: $' + BANDS.slice(a + 4, b + 4).join(' + ') + ' = ' + ns(pb.toNumber()) + '$, so about $' + pct(pb.toNumber()) + '$.'],
      hint: 'Mark the mean and each standard deviation on a sketch, then add the pieces between the two values.'
    };
    if (shape === 'count') {
      var N = R.pick([1000, 2000, 4000, 5000, 10000]), kk = R.pick([1, 2]), up2 = R.coin(), pp = up2 ? bandPct(kk, 4) : bandPct(-4, -kk);
      return {
        q: head + 'In a group of ' + T.commas(N) + ', about how many are ' + (up2 ? 'above ' + X(kk) : 'below ' + X(-kk)) + ' ' + c[3] + '?',
        a: num(qv(pp.mul(N).div(100))),
        steps: ['That value is ' + kk + ' SD from the mean, so about $' + pct(pp.toNumber()) + '$ lie beyond it.', '$' + ns(pp.div(100).toNumber()) + ' \\times ' + T.commas(N) + ' = ' + ns(pp.mul(N).div(100).toNumber()) + '$.'],
        hint: 'Find the percent first, then take that percent of the group.'
      };
    }
    if (shape === 'pctile') {
      var k3 = R.pick([-2, -1, 1, 2]), pc = bandPct(-4, k3);
      return {
        q: head + 'A value of ' + X(k3) + ' ' + c[3] + ' is at about what percentile? (What percent of values are below it?)',
        a: num(qv(pc), { pct: true }), unit: '%',
        steps: [X(k3) + ' is at $z = ' + k3 + '$.', 'Below it: ' + (k3 < 0 ? 'one tail beyond ' + (-k3) + ' SD, which is $' + pct(pc.toNumber()) + '$.' : 'the whole left half ($50\\%$) plus the pieces from 0 to ' + k3 + ' SD: $50 + ' + BANDS.slice(4, 4 + k3).join(' + ') + ' = ' + ns(pc.toNumber()) + '$, so about $' + pct(pc.toNumber()) + '$.')],
        hint: 'Half of the area is below the mean.'
      };
    }
    var fit = R.pick([
      ['the incomes of all households in a country', 'No: incomes are strongly skewed right, so the normal model and the rule do not apply.', ['Yes: any large data set is normal.', 'Yes, as long as we know the mean and standard deviation.', 'No: the rule only works for test scores.']],
      ['the heights of 2,000 adult women, whose histogram is a single symmetric mound', 'Yes: the histogram is mound-shaped and symmetric, so the normal model is reasonable.', ['No: the rule only works for test scores.', 'No: heights are always skewed.', 'No: you need at least 10,000 values.']],
      ['the waiting times at a doctor\'s office, where most waits are short and a few are very long', 'No: the data are skewed right, so the percents from the rule would be wrong.', ['Yes: waiting times are measured in minutes.', 'Yes, since every distribution has a mean and a standard deviation.', 'Yes, if we round the times to whole minutes.']]
    ]);
    return {
      q: 'Is it reasonable to use the 68-95-99.7 rule for ' + fit[0] + '?',
      a: mc(fit[1], fit[2]),
      steps: ['The rule describes normal (bell-shaped) distributions only.', fit[1]],
      hint: 'The rule comes from the bell curve. Does the data look like one?'
    };
  });

  // ---------------------------------------------------------------- areas under the normal curve
  function nice2(R, sg) { // a z with 2 decimals for which z*sigma has at most 1 decimal
    for (var t = 0; t < 50; t++) { var z = R.int(-250, 250) / 100; if (M.abs(z) < 0.1) continue; var x = z * sg; if (M.abs(x * 10 - M.round(x * 10)) < 1e-9) return rd(z, 2); }
    return R.pick([-1.5, -1, -0.5, 0.5, 1, 1.5]);
  }
  G('stat.normal-probabilities', function (R, ctx) {
    var L = lv(ctx), c = R.pick(NORM_CTX.filter(function (x) { return x[2] >= 2 && x[2] <= 50; })), mu = c[1], sg = c[2];
    var shape = by(ctx, R.pick(['left', 'right']), R.pick(['right', 'between', 'left']), R.pick(['between', 'right', 'pct']));
    var head = 'The ' + c[0] + ' are normally distributed with mean ' + ns(mu) + ' and standard deviation ' + ns(sg) + ' ' + c[3] + '. ';
    var z1 = nice2(R, sg), x1 = fix(mu + z1 * sg), P1 = phi4(z1);
    var zsteps = function (x, z) { return '$z = \\dfrac{' + ns(x) + ' - ' + ns(mu) + '}{' + ns(sg) + '} = ' + zs(z) + '$.'; };
    if (shape === 'left') return {
      q: head + 'What proportion of them are below ' + ns(x1) + ' ' + c[3] + '? ' + tableNote(L === 1 ? [z1] : R.shuffle([z1, -z1 === 0 ? 0.5 : -z1])),
      a: num(d4(P1), { tol: 0.001 }),
      steps: [zsteps(x1, z1), 'The table gives the area to the left: $P(Z < ' + zs(z1) + ') = ' + d4(P1) + '$.', 'So about $' + d4(P1) + '$ of them (about $' + pct(rd(P1 * 100, 2)) + '$) are below ' + ns(x1) + '.'],
      hint: 'Change the value to a z-score. "Below" is the area to the left.'
    };
    if (shape === 'right' || shape === 'pct') {
      var ans = rd(1 - P1, 4), asPct = shape === 'pct';
      return {
        q: head + (asPct ? 'What percent of them are above ' : 'What proportion of them are above ') + ns(x1) + ' ' + c[3] + '? ' + tableNote([z1]),
        a: asPct ? num(ns(rd(ans * 100, 2)), { tol: 0.1, pct: true }) : num(d4(ans), { tol: 0.001 }), unit: asPct ? '%' : undefined,
        steps: [zsteps(x1, z1), 'The table gives the area to the <b>left</b>: $' + d4(P1) + '$.', '"Above" is the area to the right: $1 - ' + d4(P1) + ' = ' + d4(ans) + '$' + (asPct ? ', which is $' + pct(rd(ans * 100, 2)) + '$.' : '.')],
        hint: 'The table gives the area below a z-score. The area above is 1 minus that.'
      };
    }
    var z2; do { z2 = nice2(R, sg); } while (M.abs(z2 - z1) < 0.3);
    var lo = M.min(z1, z2), hi = M.max(z1, z2), xl = fix(mu + lo * sg), xh = fix(mu + hi * sg), Pl = phi4(lo), Ph = phi4(hi), ab = rd(Ph - Pl, 4);
    var extra = L >= 2 ? [lo, hi, rd(-hi, 2) === lo ? rd(-lo + 0.1, 2) : rd(-hi, 2)] : [lo, hi];
    return {
      q: head + 'What proportion of them are between ' + ns(xl) + ' and ' + ns(xh) + ' ' + c[3] + '? ' + tableNote(R.shuffle(U.uniq(extra))),
      a: num(d4(ab), { tol: 0.001 }),
      steps: ['Lower value: ' + zsteps(xl, lo), 'Upper value: ' + zsteps(xh, hi), 'Area between = (area left of the upper z) − (area left of the lower z).', '$' + d4(Ph) + ' - ' + d4(Pl) + ' = ' + d4(ab) + '$.'],
      hint: 'Find both z-scores. Subtract the smaller left area from the larger one.'
    };
  });

  // ---------------------------------------------------------------- finding values from percentiles
  var PCTL = [0.9, 0.95, 0.75, 0.8, 0.85, 0.99, 0.975, 0.1, 0.05, 0.25, 0.2, 0.15, 0.01];
  function zInvStr(p) { return T.dec(rd(PhiInv(p), 2), 2); }
  G('stat.inverse-normal', function (R, ctx) {
    var L = lv(ctx), c = R.pick(NORM_CTX.filter(function (x) { return x[2] >= 3; })), mu = c[1], sg = c[2], tol = M.max(0.05, M.ceil(sg * 0.6) / 100);
    var shape = by(ctx, R.pick(['pctile', 'top']), R.pick(['top', 'bottom', 'pctile']), R.pick(['middle', 'sigma', 'top']));
    var head = 'The ' + c[0] + ' are normally distributed with mean ' + ns(mu) + ' and standard deviation ' + ns(sg) + ' ' + c[3] + '. ';
    function solve(p) { var z = rd(PhiInv(p), 2); return { z: z, x: fix(rd(mu + z * sg, 4)) }; }
    var given = function (p) { return 'The z-score with $' + pct(rd(p * 100, 1)) + '$ of the area to its left is $' + zInvStr(p) + '$.'; };
    if (shape === 'pctile' || shape === 'top' || shape === 'bottom') {
      var p = shape === 'top' ? R.pick([0.95, 0.9, 0.99, 0.975, 0.8]) : shape === 'bottom' ? R.pick([0.05, 0.1, 0.01, 0.025, 0.2]) : R.pick(PCTL), s = solve(p);
      var pp = rd(p * 100, 1), ask = shape === 'top' ? 'What value separates the top $' + pct(rd(100 - pp, 1)) + '$ from the rest?' : shape === 'bottom' ? 'What value marks the bottom $' + pct(pp) + '$?' : 'Find the ' + U.ordinal(pp) + ' percentile.';
      if (shape === 'pctile' && pp !== M.round(pp)) ask = 'Find the value with $' + pct(pp) + '$ of the data below it.';
      return {
        q: head + ask + ' ' + given(p),
        a: num(s.x, { tol: tol }),
        steps: [shape === 'top' ? 'The top $' + pct(rd((1 - p) * 100, 1)) + '$ is above the value, so $' + pct(rd(p * 100, 1)) + '$ is below it.' : 'We need the value with $' + pct(rd(p * 100, 1)) + '$ of the area to its left.', 'That area goes with $z = ' + zs(s.z) + '$.', 'Undo the z-score: $x = \\mu + z\\sigma = ' + ns(mu) + ' + (' + zs(s.z) + ')(' + ns(sg) + ') = ' + ns(s.x) + '$ ' + c[3] + '.'],
        hint: 'Find the area to the LEFT of the value you want, then use x = μ + zσ.'
      };
    }
    if (shape === 'middle') {
      var mid = R.pick([0.8, 0.9, 0.95, 0.5]), tail = rd((1 - mid) / 2, 3), sl = solve(tail), sh = solve(1 - tail);
      return {
        q: head + 'Find the two values that mark off the middle $' + pct(mid * 100) + '$ of the distribution. The z-score with $' + pct(rd(tail * 100, 1)) + '$ of the area to its left is $' + zInvStr(tail) + '$, and the one with $' + pct(rd((1 - tail) * 100, 1)) + '$ to its left is $' + zInvStr(1 - tail) + '$.',
        a: { t: 'multi', parts: [{ label: 'lower value $=$', a: num(sl.x, { tol: tol }) }, { label: 'upper value $=$', a: num(sh.x, { tol: tol }) }] },
        steps: ['The middle $' + pct(mid * 100) + '$ leaves $' + pct(rd(tail * 100, 1)) + '$ in each tail.', 'Lower cutoff: $z = ' + zs(sl.z) + '$, so $x = ' + ns(mu) + ' + (' + zs(sl.z) + ')(' + ns(sg) + ') = ' + ns(sl.x) + '$.', 'Upper cutoff: $z = ' + zs(sh.z) + '$, so $x = ' + ns(mu) + ' + (' + zs(sh.z) + ')(' + ns(sg) + ') = ' + ns(sh.x) + '$.'],
        hint: 'Split what is left over equally between the two tails.'
      };
    }
    var p2 = R.pick([0.9, 0.95, 0.8, 0.1, 0.05]), z2 = rd(PhiInv(p2), 2), sgN = R.pick([4, 5, 8, 10, 12, 20]), x2 = fix(mu + z2 * sgN);
    return {
      q: 'A normal distribution has mean ' + ns(mu) + '. Its ' + U.ordinal(M.round(p2 * 100)) + ' percentile is $' + ns(x2) + '$. Find its standard deviation. The z-score with $' + pct(M.round(p2 * 100)) + '$ of the area to its left is $' + zs(z2) + '$.',
      a: num(sgN, { tol: 0.05 }),
      steps: ['At the ' + U.ordinal(M.round(p2 * 100)) + ' percentile, $z = ' + zs(z2) + '$.', '$x = \\mu + z\\sigma$, so $' + ns(x2) + ' = ' + ns(mu) + ' + ' + T.p(zs(z2)) + '\\sigma$.', '$\\sigma = \\dfrac{' + ns(x2) + ' - ' + ns(mu) + '}{' + zs(z2) + '} = ' + sgN + '$.'],
      hint: 'Write x = μ + zσ with the numbers you know and solve for σ.'
    };
  });


  // ================================================================ unit 3: two-variable data

  function corrData(R, n, r, x0, x1, ym, ys, dpx, dpy) { // points whose correlation is r (before rounding)
    var xs = [], e = [], i;
    for (i = 0; i < n; i++) xs.push(x0 + (x1 - x0) * (i + 0.15 + 0.7 * R.next()) / n);
    for (i = 0; i < n; i++) e.push(R.next() + R.next() + R.next() - 1.5);
    var mx = xs.reduce(function (s, x) { return s + x; }, 0) / n, zx = xs.map(function (x) { return x - mx; });
    var sx = M.sqrt(zx.reduce(function (s, x) { return s + x * x; }, 0) / n); zx = zx.map(function (x) { return x / sx; });
    var me = e.reduce(function (s, x) { return s + x; }, 0) / n; e = e.map(function (x) { return x - me; });
    var pr = e.reduce(function (s, x, j) { return s + x * zx[j]; }, 0) / n; e = e.map(function (x, j) { return x - pr * zx[j]; });
    var se = M.sqrt(e.reduce(function (s, x) { return s + x * x; }, 0) / n) || 1; e = e.map(function (x) { return x / se; });
    return xs.map(function (x, j) { return [rd(x, dpx || 1), rd(ym + ys * (r * zx[j] + M.sqrt(1 - r * r) * e[j]), dpy === undefined ? 1 : dpy)]; });
  }
  function fitLine(pts) {
    var n = pts.length, mx = 0, my = 0; pts.forEach(function (p) { mx += p[0] / n; my += p[1] / n; });
    var sxx = 0, sxy = 0, syy = 0; pts.forEach(function (p) { sxx += (p[0] - mx) * (p[0] - mx); sxy += (p[0] - mx) * (p[1] - my); syy += (p[1] - my) * (p[1] - my); });
    var b = sxy / sxx; return { b: b, a: my - b * mx, r: sxy / M.sqrt(sxx * syy) };
  }
  function corrOf(pts) { return fitLine(pts).r; }

  // ---------------------------------------------------------------- describing scatterplots
  var PAT = {
    sp: ['Strong positive linear', [['hours of practice', 'free throws made'], ['age of a tree (years)', 'trunk width (cm)'], ['height (in)', 'arm span (in)']]],
    wp: ['Weak positive linear', [['hours of sleep', 'quiz score'], ['minutes of exercise', 'mood rating'], ['family size', 'grocery bill']]],
    sn: ['Strong negative linear', [['age of a car (years)', 'price (thousands of dollars)'], ['outdoor temperature (°F)', 'heating cost (dollars)'], ['altitude (thousands of ft)', 'boiling point (°F)']]],
    wn: ['Weak negative linear', [['hours of video games', 'quiz score'], ['distance from a store (mi)', 'visits per month'], ['price of a snack (dollars)', 'number sold']]],
    no: ['No clear association', [['shoe size', 'quiz score'], ['birth day of the month', 'height (in)'], ['last digit of phone number', 'pulse rate']]],
    cv: ['Curved (nonlinear)', [['driving speed (mph)', 'fuel economy (mpg)'], ['hours after a meal', 'blood sugar level'], ['fertilizer amount (g)', 'plant height (cm)']]]
  };
  function patternPts(R, key) {
    var n = R.int(14, 20);
    if (key === 'cv') { var pts = [], c = R.int(4, 6); for (var i = 0; i < n; i++) { var x = 0.5 + 9 * (i + R.next()) / n; pts.push([rd(x, 1), rd(30 - 1.1 * (x - c) * (x - c) + (R.next() - 0.5) * 3, 1)]); } return pts; }
    var r = { sp: 0.95, wp: 0.45, sn: -0.95, wn: -0.45, no: 0.03 }[key] + (key === 'no' ? 0 : (R.next() - 0.5) * 0.06);
    return corrData(R, n, r, 1, 10, 50, 10, 1, 1);
  }
  G('stat.scatterplots', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'describe', R.pick(['describe', 'describe', 'explan']), R.pick(['describe', 'outlier', 'explan']));
    var keys = ['sp', 'wp', 'sn', 'wn', 'no', 'cv'];
    if (shape === 'describe') {
      var key = R.pick(L === 1 ? ['sp', 'sn', 'no', 'cv'] : keys), ctxv = R.pick(PAT[key][1]), pts = patternPts(R, key);
      var near = { sp: ['wp', 'sn', 'cv'], wp: ['sp', 'wn', 'no'], sn: ['wn', 'sp', 'cv'], wn: ['sn', 'wp', 'no'], no: ['wp', 'wn', 'cv'], cv: ['no', 'sp', 'wn'] }[key];
      var why = { sp: 'The points rise from left to right (positive) and hug a straight line closely (strong).', wp: 'The points tend to rise from left to right, but they are widely scattered around any line (weak).', sn: 'The points fall from left to right (negative) and stay close to a straight line (strong).', wn: 'The points tend to fall from left to right, but loosely (weak).', no: 'Knowing x tells you almost nothing about y: the cloud has no direction.', cv: 'The points rise and then fall: the form is a curve, not a line.' }[key];
      return {
        q: 'The scatterplot shows ' + ctxv[1] + ' against ' + ctxv[0] + '. Which description fits best?',
        viz: { name: 'stat-chart', opts: { kind: 'scatter', points: pts, xlabel: ctxv[0], ylabel: ctxv[1] }, label: 'A scatterplot of ' + ctxv[1] + ' against ' + ctxv[0] },
        a: mc(PAT[key][0], near.map(function (k) { return PAT[k][0]; })),
        steps: ['Direction: do the points go up or down from left to right?', 'Form: do they follow a line or a curve?', 'Strength: how tightly do they cluster around that form?', why],
        hint: 'Describe direction, form and strength, in that order.'
      };
    }
    if (shape === 'explan') {
      var st = R.pick([['how the amount of fertilizer affects the height of tomato plants', 'Amount of fertilizer', 'Height of the plants'], ['whether hours of sleep help predict reaction time', 'Hours of sleep', 'Reaction time'], ['how the price of a ticket affects the number of tickets sold', 'Price of a ticket', 'Number of tickets sold'], ['whether a car\'s weight helps explain its gas mileage', 'Weight of the car', 'Gas mileage']]);
      return {
        q: 'A study looks at ' + st[0] + '. Which variable is the explanatory variable (the one that goes on the x-axis)?',
        a: mcKeep([st[1], st[2]], 0),
        steps: ['The explanatory variable is the one we think helps explain or predict the other.', st[1] + ' explains or predicts ' + st[2].toLowerCase() + ', so it goes on the x-axis; ' + st[2].toLowerCase() + ' is the response.'],
        hint: 'Which variable might influence the other?'
      };
    }
    var p2 = corrData(R, 14, 0.96, 1, 10, 50, 10, 1, 1), at = R.int(4, 9), fl = fitLine(p2);
    p2[at] = [p2[at][0], rd(p2[at][1] + (R.coin() ? 1 : -1) * R.int(14, 20), 1)];
    return {
      q: 'In this scatterplot of quiz score against hours studied, what best describes the highlighted point P?',
      viz: { name: 'stat-chart', opts: { kind: 'scatter', points: p2, mark: at, xlabel: 'hours studied', ylabel: 'quiz score' }, label: 'A scatterplot with one highlighted point' },
      a: mc('An outlier: it lies far from the linear pattern of the other points', ['A typical point that follows the overall pattern', 'Evidence that the association is negative', 'Evidence that the form is curved']),
      steps: ['The other points rise along a strong, straight band.', 'P sits far ' + (p2[at][1] > fl.a + fl.b * p2[at][0] ? 'above' : 'below') + ' that band, so it is an outlier. One point cannot change the overall direction or form.'],
      hint: 'Compare P with the band the other points form.'
    };
  });

  // ---------------------------------------------------------------- the correlation coefficient
  var RSTMT = [
    ['If every x value is changed from inches to centimeters, r does not change.', 'r has no units: it is built from z-scores, which are the same in any unit.'],
    ['Switching which variable is x and which is y does not change r.', 'The formula for r treats x and y the same way.'],
    ['A correlation of r = −0.9 shows a stronger linear relationship than r = 0.7.', 'Strength is the size of r, ignoring the sign: 0.9 > 0.7.'],
    ['A strong curved pattern can have r close to 0.', 'r only measures straight-line patterns; a U-shape can have r near 0.'],
    ['One outlier can change r a lot.', 'r uses means and standard deviations, which are not resistant.']
  ];
  var RFALSE = [
    'r = 0 means there is no relationship of any kind between x and y.',
    'r = 0.8 means the slope of the regression line is 0.8.',
    'Changing the units of x from inches to centimeters multiplies r by 2.54.',
    'A correlation of r = 0.7 means 70% of the points lie on a line.',
    'r = −0.9 shows a weaker relationship than r = 0.5, because it is negative.',
    'A strong correlation proves that x causes y.'
  ];
  G('stat.correlation', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'match', R.pick(['zprod', 'match', 'slope']), R.pick(['tf', 'zprod', 'slope']));
    if (shape === 'match') {
      var vals = [-0.95, -0.6, 0, 0.6, 0.95], rv = R.pick(vals), pts = corrData(R, R.int(15, 22), rv === 0 ? 0.02 : rv, 1, 10, 50, 10, 1, 1);
      return {
        q: 'Which value of the correlation $r$ best fits this scatterplot?',
        viz: { name: 'stat-chart', opts: { kind: 'scatter', points: pts }, label: 'A scatterplot' },
        a: mc('$r = ' + ns(rv) + '$', vals.filter(function (v) { return v !== rv; }).map(function (v) { return '$r = ' + ns(v) + '$'; })),
        steps: ['Sign: points that rise left to right give a positive r; falling points give a negative r.', 'Size: points close to a line give r near ±1; a loose cloud gives r near 0.', 'This plot fits $r \\approx ' + ns(rv) + '$ (the actual value is $' + ns(rd(corrOf(pts), 2)) + '$).'],
        hint: 'First decide the sign, then how tightly the points hug a line.'
      };
    }
    if (shape === 'zprod') {
      var n = R.pick([5, 6]), target = R.int(-90, 95) / 100, tot = rd(target * (n - 1), 2), prods;
      for (var t = 0; t < 200; t++) { prods = []; for (var i = 0; i < n - 1; i++) prods.push(R.int(-60, 220) / 100 * (target < 0 ? -1 : 1)); var last = rd(tot - sum(prods), 2); if (last > -1.2 && last < 2.4 && M.abs(last) > 0.05) { prods.push(last); break; } prods = null; }
      if (!prods) { prods = [0.8, 1.2, 0.4, -0.2, tot - 2.2]; n = 5; tot = rd(sum(prods), 2); target = rd(tot / 4, 4); }
      prods = R.shuffle(prods).map(function (x) { return rd(x, 2); }); tot = rd(sum(prods), 2); var r1 = rd(tot / (n - 1), 4);
      return {
        q: 'For ' + n + ' data points, each point\'s z-scores were multiplied, giving these values of $z_x z_y$: ' + dataList(prods) + '. Find the correlation $r$.',
        a: num(r1, { tol: 0.005 }),
        steps: ['$r = \\dfrac{1}{n - 1}\\sum z_x z_y$: the average product of z-scores, dividing by $n - 1$.', 'Sum: $' + ns(tot) + '$.', '$r = \\dfrac{' + ns(tot) + '}{' + (n - 1) + '} = ' + ns(r1) + '$.'],
        hint: 'Add the products, then divide by n − 1.'
      };
    }
    if (shape === 'slope') {
      var opts = [];
      [0.3, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9, -0.4, -0.5, -0.6, -0.8].forEach(function (r) { [2, 3, 4, 5, 10].forEach(function (sx) { [4, 5, 6, 8, 10, 12, 15, 20].forEach(function (sy) { var b = Q.from(r).mul(sy).div(sx); if (b.isTerminating() && String(b.toDec(6)).replace(/0+$/, '').split('.')[1].length <= 2) opts.push([r, sx, sy, b.toNumber()]); }); }); });
      var o = R.pick(opts);
      return {
        q: 'A regression line has slope $b = ' + ns(o[3]) + '$. The standard deviations are $s_x = ' + o[1] + '$ and $s_y = ' + o[2] + '$. Find the correlation $r$.',
        a: num(o[0]),
        steps: ['The slope and the correlation are linked: $b = r\\dfrac{s_y}{s_x}$.', 'Solve for r: $r = b\\dfrac{s_x}{s_y} = ' + ns(o[3]) + ' \\cdot \\dfrac{' + o[1] + '}{' + o[2] + '} = ' + ns(o[0]) + '$.', 'r and b always have the same sign, but they are different numbers unless $s_x = s_y$.'],
        hint: 'Use b = r · s_y / s_x and solve for r.'
      };
    }
    var right = R.pick(RSTMT);
    return {
      q: 'Which statement about the correlation coefficient $r$ is true?',
      a: mc(right[0], R.sample(RFALSE, 3)),
      steps: ['True: ' + right[0] + ' ' + right[1], 'The others confuse r with the slope, with causation, or with "any relationship," or treat its sign as strength.'],
      hint: 'r measures only the direction and strength of a straight-line pattern, and it has no units.'
    };
  });

  // ---------------------------------------------------------------- the least-squares line
  var LSR = [ // x, y, sign, x-bar range, s_x choices, y-bar range [lo, hi, step], s_y choices
    ['hours studied per week', 'exam score', 1, [5, 12], [2, 3, 4], [65, 80, 1], [8, 10, 12, 15]],
    ['daily high temperature (°F)', 'number of iced drinks sold', 1, [65, 85], [5, 8, 10], [120, 200, 5], [20, 25, 30, 40]],
    ['age of a car (years)', 'value (thousands of dollars)', -1, [4, 8], [2, 3, 4], [12, 22, 1], [3, 4, 5, 6]],
    ['distance from downtown (miles)', 'monthly rent (dollars)', -1, [6, 12], [2, 3, 4, 5], [1200, 1800, 50], [100, 150, 200, 250]],
    ['height (inches)', 'shoe length (cm)', 1, [62, 70], [3, 4], [24, 28, 1], [2, 3]],
    ['minutes of exercise per day', 'resting heart rate (beats per minute)', -1, [30, 45], [10, 15], [64, 76, 1], [5, 6, 8, 10]]
  ];
  function lsrPick(R) {
    for (var t = 0; t < 200; t++) {
      var c = R.pick(LSR), r = c[2] * R.pick([0.4, 0.5, 0.6, 0.75, 0.8, 0.9]), sx = R.pick(c[4]), sy = R.pick(c[6]);
      var b = Q.from(r).mul(sy).div(sx); if (!(b.isTerminating() && (String(b.toDec(6)).replace(/0+$/, '').split('.')[1] || '').length <= 2)) continue;
      var xm = R.int(c[3][0], c[3][1]), ym = c[5][0] + c[5][2] * R.int(0, (c[5][1] - c[5][0]) / c[5][2]), a = Q(ym).sub(b.mul(xm));
      return { c: c, r: r, sx: sx, sy: sy, b: b, xm: xm, ym: ym, a: a };
    }
    return { c: LSR[0], r: 0.6, sx: 2, sy: 10, b: Q(3), xm: 8, ym: 70, a: Q(46) };
  }
  G('stat.least-squares-line', function (R, ctx) {
    var L = lv(ctx), o = lsrPick(R), c = o.c, shape = by(ctx, 'slope', 'line', R.pick(['predict', 'extrap']));
    var stats = 'A study recorded $x$ = ' + c[0] + ' and $y$ = ' + c[1] + '. Summary statistics: $\\bar{x} = ' + o.xm + '$, $s_x = ' + o.sx + '$, $\\bar{y} = ' + T.commas(o.ym) + '$, $s_y = ' + o.sy + '$ and $r = ' + ns(o.r) + '$.';
    var bS = ['Slope: $b = r\\dfrac{s_y}{s_x} = ' + ns(o.r) + ' \\cdot \\dfrac{' + o.sy + '}{' + o.sx + '} = ' + ns(o.b.toNumber()) + '$.'];
    var aS = ['The line passes through $(\\bar{x}, \\bar{y})$, so $a = \\bar{y} - b\\bar{x} = ' + o.ym + ' - ' + T.p(ns(o.b.toNumber())) + '(' + o.xm + ') = ' + ns(o.a.toNumber()) + '$.'];
    if (shape === 'slope') return {
      q: stats + ' Find the slope of the least-squares regression line.',
      a: num(ns(o.b.toNumber())),
      steps: bS.concat(['Each extra unit of x goes with a predicted change of ' + ns(o.b.toNumber()) + ' in y.']),
      hint: 'The slope is r times the ratio of the standard deviations, s_y over s_x.'
    };
    if (shape === 'line') return {
      q: stats + ' Find the slope $b$ and the intercept $a$ of the least-squares line $\\hat{y} = a + bx$.',
      a: { t: 'multi', parts: [{ label: '$b =$', a: num(ns(o.b.toNumber())) }, { label: '$a =$', a: num(ns(o.a.toNumber())) }] },
      steps: bS.concat(aS, ['The line: $\\hat{y} = ' + T.num(o.a.toNumber()) + T.coef(o.b.toNumber(), 'x', false) + '$.']),
      hint: 'Find b first; then use the fact that the line goes through the point of means.'
    };
    var lo = M.max(0, o.xm - 2 * o.sx), hi = o.xm + 2 * o.sx, x0 = R.int(lo + 1, hi - 1), yh = o.a.add(o.b.mul(x0)), xf = hi + R.int(3, 6) * o.sx;
    if (shape === 'predict') return {
      q: stats + ' The x-values ran from about ' + lo + ' to ' + hi + '. Use the least-squares line to predict $y$ when $x = ' + x0 + '$.',
      a: num(ns(yh.toNumber())),
      steps: bS.concat(aS, ['Predict: $\\hat{y} = ' + ns(o.a.toNumber()) + T.signed(o.b.toNumber()) + '(' + x0 + ') = ' + ns(yh.toNumber()) + '$.', 'This is a fair prediction because $x = ' + x0 + '$ is inside the range of the data.']),
      hint: 'Build the line from the summary statistics, then substitute x.'
    };
    return {
      q: stats + ' The x-values in the data ran from about ' + lo + ' to ' + hi + '. Someone uses the line to predict $y$ at $x = ' + xf + '$. What is the best response?',
      a: mc('The prediction is risky: x = ' + xf + ' is far outside the data, and the pattern may not continue there', ['The prediction is fine, because the least-squares line is the best possible line', 'The prediction is fine as long as r is close to 1', 'The line cannot be used at all, because r is not exactly 1']),
      steps: ['Predicting outside the range of the x-values is called extrapolation.', 'The data say nothing about how y behaves at x = ' + xf + '; the straight-line pattern may bend or stop.', 'Even a strong r only describes the range we observed.'],
      hint: 'Where did the data actually come from?'
    };
  });

  // ---------------------------------------------------------------- interpreting slope and intercept
  var INTERP = [
    { x: 'hours studied', y: 'exam score', ys: 'exam scores', un: ' (in points)', yu: 'points', yu1: 'point', xu: 'hour', a: [52, 62, 1], b: [2.5, 3, 3.5, 4, 4.5, 5], i0: 'A student who studies 0 hours is predicted to score {a} points.', i0ok: true, who: 'student' },
    { x: 'age of a used car, in years', y: 'price', ys: 'prices', un: ' in dollars', yu: 'dollars', yu1: 'dollar', xu: 'year', a: [22000, 30000, 500], b: [-1200, -1500, -1800, -2000, -2400], money: true, i0: 'A brand-new car (0 years old) of this kind is predicted to cost {a}.', i0ok: true, who: 'car' },
    { x: 'height, in inches', y: 'weight', ys: 'weights', un: ' in pounds', yu: 'pounds', yu1: 'pound', xu: 'inch', a: [-200, -150, 5], b: [4.5, 5, 5.5, 6], i0: 'A person 0 inches tall is predicted to weigh {a} pounds, which makes no sense: x = 0 is far outside the data.', i0ok: false, who: 'person' },
    { x: 'outdoor temperature, in °F', y: 'hot cocoa sales', ys: 'cocoa sales', un: ' in cups', yu: 'cups', art: '', yu1: 'cup', xu: 'degree', a: [180, 240, 5], b: [-2, -2.5, -3, -3.5, -4], i0: 'On a day at 0°F, the stand is predicted to sell {a} cups of cocoa.', i0ok: true, who: 'day' },
    { x: 'minutes of exercise per day', y: 'resting heart rate', ys: 'resting heart rates', un: ' in beats per minute', yu: 'beats per minute', yu1: 'beat per minute', xu: 'minute', a: [74, 82, 1], b: [-0.1, -0.15, -0.2, -0.25, -0.3], i0: 'A person who exercises 0 minutes a day is predicted to have a resting heart rate of {a} beats per minute.', i0ok: true, who: 'person' },
    { x: 'size of an apartment, in hundreds of square feet', y: 'monthly rent', ys: 'rents', un: ' in dollars', yu: 'dollars', yu1: 'dollar', xu: 'hundred square feet', a: [250, 400, 10], b: [80, 85, 90, 95, 100, 110, 120], money: true, i0: 'An apartment with 0 square feet is predicted to rent for {a}, which makes no sense: no apartment is that small.', i0ok: false, who: 'apartment' }
  ];
  G('stat.interpret-regression', function (R, ctx) {
    var L = lv(ctx), I = R.pick(INTERP), shape = by(ctx, 'slope', R.pick(['slope', 'diff']), R.pick(['intercept', 'diff', 'slope']));
    var b = R.pick(I.b), a = fix(I.a[0] + I.a[2] * R.int(0, M.round((I.a[1] - I.a[0]) / I.a[2])));
    var amt = function (v) { return (I.money ? money(v) : ns(v) + ' ' + I.yu).replace(/^-/, '−'); };
    var art = I.art !== undefined ? I.art : /^[aeiou]/.test(I.y) ? 'an ' : 'a ';
    var eq = '\\hat{y} = ' + T.commas(a) + (b < 0 ? ' - ' : ' + ') + T.commas(M.abs(b)) + 'x';
    var intro = 'A study fits the line $' + eq + '$, where $x$ is the ' + I.x + (I.x.indexOf(',') >= 0 ? ',' : '') + ' and $\\hat{y}$ is the predicted ' + I.y + I.un + '.';
    var up = b > 0, mag = amt(M.abs(b));
    if (shape === 'slope') return {
      q: intro + ' What does the slope tell you?',
      a: mc('For each additional ' + I.xu + ', the predicted ' + I.y + ' ' + (up ? 'increases' : 'decreases') + ' by ' + mag + ', on average.', ['Every ' + I.who + ' with one more ' + I.xu + ' has ' + art + I.y + ' exactly ' + mag + ' ' + (up ? 'higher' : 'lower') + '.', 'For each additional ' + I.yu1 + ' of ' + I.y + ', the predicted ' + I.x.replace(/, in .*$/, '') + ' changes by ' + ns(M.abs(b)) + '.', 'When x is 0, the predicted ' + I.y + ' is ' + amt(b) + '.']),
      steps: ['The slope is the change in the <b>predicted</b> y for each one-unit increase in x: here $' + T.commas(b) + '$ ' + I.yu + ' per ' + I.xu + '.', 'It describes the trend, not an exact change for every individual: real data points scatter around the line.'],
      hint: 'Slope = predicted change in y for each one-unit increase in x. Say "predicted" or "on average".'
    };
    if (shape === 'diff') {
      var dx = R.pick([2, 3, 4, 5, 10]), dy = fix(b * dx);
      return {
        q: intro + ' Two ' + I.who + 's differ by ' + dx + ' ' + I.xu + 's in ' + I.x.replace(/, in .*$/, '') + '. By how much do their predicted ' + I.ys + ' differ? (Give the size of the difference' + (I.money ? ', in dollars' : ', in ' + I.yu) + '.)',
        a: num(M.abs(dy)),
        steps: ['Each ' + I.xu + ' changes the prediction by the slope, $' + T.commas(b) + '$.', 'For ' + dx + ' ' + I.xu + 's: $' + dx + ' \\times ' + T.p(T.commas(b)) + ' = ' + T.commas(dy) + '$, a difference of ' + amt(M.abs(dy)) + '.'],
        hint: 'A difference in x times the slope gives the difference in predicted y.'
      };
    }
    var good = I.i0.replace('{a}', I.money ? money(a) : T.commas(a));
    return {
      q: intro + ' Which is the best reading of the intercept?',
      a: I.i0ok ? mc(good, ['For each extra ' + I.xu + ', the predicted ' + I.y + ' changes by ' + amt(a) + '.', 'The intercept never has a meaning in context.', 'The ' + I.y + ' is always at least ' + amt(a) + '.'])
        : mc(good, [(/^[aeiou]/.test(I.who) ? 'An ' : 'A ') + I.who + ' with $x = 0$ really would have ' + art + I.y + ' of ' + amt(a) + '.', 'For each extra ' + I.xu + ', the predicted ' + I.y + ' changes by ' + amt(a) + '.', 'The intercept is the mean ' + I.y + ' of the data.']),
      steps: ['The intercept is the predicted y when $x = 0$: $\\hat{y} = ' + T.commas(a) + '$.', I.i0ok ? 'Here $x = 0$ is a sensible value, so the intercept has a meaning, as a prediction.' : 'Here $x = 0$ is impossible or far outside the data, so the intercept only anchors the line; it has no real meaning.'],
      hint: 'Put x = 0 into the equation, then ask whether x = 0 makes sense in this situation.'
    };
  });

  // ---------------------------------------------------------------- residuals and residual plots
  G('stat.residual-plots', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'resid', R.pick(['resid', 'back']), R.pick(['plot', 'plot', 'back']));
    var a = R.int(20, 60), b = R.pick([1.5, 2, 2.5, 3, 4, -1.5, -2, -2.5, 0.5]), x = R.int(2, 12), yh = fix(a + b * x), e = R.nz(-9, 9) + R.pick([0, 0.5]), y = fix(yh + e);
    var eq = '\\hat{y} = ' + a + T.signed(b) + 'x';
    if (shape === 'resid') return {
      q: 'The least-squares line is $' + eq + '$. One data point is $(' + x + ', ' + ns(y) + ')$. Find its residual.',
      a: num(e),
      steps: ['Predicted value: $\\hat{y} = ' + a + T.signed(b) + '(' + x + ') = ' + ns(yh) + '$.', 'Residual = actual − predicted $= ' + ns(y) + ' - ' + T.p(ns(yh)) + ' = ' + ns(e) + '$.', 'It is ' + (e > 0 ? 'positive: the point lies above the line.' : 'negative: the point lies below the line.')],
      hint: 'Residual = actual y minus predicted ŷ, in that order.'
    };
    if (shape === 'back') return {
      q: 'The least-squares line is $' + eq + '$. A point with $x = ' + x + '$ has a residual of $' + ns(e) + '$. What is its actual $y$-value, and is the point above or below the line?',
      a: { t: 'multi', parts: [{ label: '$y =$', a: num(y) }, { label: 'The point is', a: mcKeep(['above the line', 'below the line'], e > 0 ? 0 : 1) }] },
      steps: ['Predicted: $\\hat{y} = ' + a + T.signed(b) + '(' + x + ') = ' + ns(yh) + '$.', 'Residual $= y - \\hat{y}$, so $y = \\hat{y} + \\text{residual} = ' + ns(yh) + T.signed(e) + ' = ' + ns(y) + '$.', (e > 0 ? 'A positive residual means the point is above the line.' : 'A negative residual means the point is below the line.')],
      hint: 'Actual = predicted + residual.'
    };
    var kind = R.pick(['random', 'curve', 'fan']), pts = [], n = 16;
    for (var i = 0; i < n; i++) { var xx = rd(1 + 9 * (i + R.next()) / n, 1), ee; if (kind === 'random') ee = (R.next() + R.next() - 1) * 6; else if (kind === 'curve') ee = 0.9 * (xx - 5.5) * (xx - 5.5) - 6 + (R.next() - 0.5) * 2; else ee = (R.next() - 0.5) * 2 * (0.5 + 0.9 * xx); pts.push([xx, rd(ee, 1)]); }
    var ans = { random: 'A line is a good model: the residuals are scattered randomly around 0 with no pattern', curve: 'A line is not a good model: the curved pattern in the residuals shows the data bend', fan: 'The line describes the trend, but the residuals spread out as x grows, so predictions are less precise for large x' }[kind];
    var others = ['A line is a good model: the residuals are scattered randomly around 0 with no pattern', 'A line is not a good model: the curved pattern in the residuals shows the data bend', 'The line describes the trend, but the residuals spread out as x grows, so predictions are less precise for large x', 'A line is a good model, because about half the residuals are positive'].filter(function (s) { return s !== ans; });
    return {
      q: 'Here is the residual plot from a least-squares line (residual against x). What does it tell you?',
      viz: { name: 'stat-chart', opts: { kind: 'resid', points: pts }, label: 'A residual plot' },
      a: mc(ans, others),
      steps: ['A good linear fit leaves residuals that look like random scatter around 0, with the same spread everywhere.', { random: 'Here they do: no curve, no fan.', curve: 'Here the residuals form a U-shape: positive at both ends, negative in the middle. The line misses a bend in the data.', fan: 'Here the residuals fan out: the spread grows with x.' }[kind], 'A high r alone cannot tell you this; the residual plot can.'],
      hint: 'Look for any pattern: a curve, or a spread that changes.'
    };
  });

  // ---------------------------------------------------------------- r squared
  G('stat.r-squared', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'r2', R.pick(['r', 'sse', 'r2']), R.pick(['meaning', 'sse', 'r']));
    if (shape === 'r2') {
      var r = R.sign() * R.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.85, 0.75]), r2 = Q.from(r).pow(2);
      return {
        q: 'A scatterplot of ' + R.pick(['crop yield against rainfall', 'sales against advertising spending', 'reaction time against hours awake', 'weight against height']) + ' has correlation $r = ' + ns(r) + '$. What percent of the variation in $y$ is explained by the least-squares line?',
        a: num(qv(r2.mul(100)), { pct: true }), unit: '%',
        steps: ['$r^2 = ' + T.p(ns(r)) + '^2 = ' + ns(r2.toNumber()) + '$.', 'As a percent: $' + pct(r2.mul(100).toNumber()) + '$ of the variation in y is explained by the linear relationship with x.' + (r < 0 ? ' (Squaring removes the sign.)' : '')],
        hint: 'Square r, then change it to a percent.'
      };
    }
    if (shape === 'r') {
      var rr = R.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]), sg = R.sign(), rq = Q.from(rr).pow(2);
      return {
        q: 'A least-squares line has $r^2 = ' + ns(rq.toNumber()) + '$, and its slope is ' + (sg > 0 ? 'positive' : 'negative') + '. What is $r$?',
        a: num(ns(sg * rr)),
        steps: ['$r = \\pm\\sqrt{r^2} = \\pm\\sqrt{' + ns(rq.toNumber()) + '} = \\pm ' + ns(rr) + '$.', 'r has the same sign as the slope, so $r = ' + ns(sg * rr) + '$.'],
        hint: 'Take the square root, then choose the sign that matches the slope.'
      };
    }
    if (shape === 'sse') {
      var sst = R.pick([80, 120, 200, 250, 400, 500]), frac0 = R.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.1]), sse = fix(sst * frac0);
      return {
        q: 'Without using x, the squared distances of the y-values from their mean add up to $' + sst + '$. Using the least-squares line, the squared residuals add up to only $' + ns(sse) + '$. Find $r^2$.',
        a: num(fix(1 - frac0)),
        steps: ['$r^2 = 1 - \\dfrac{\\text{SSE}}{\\text{SST}}$: the fraction of the variation that the line removes.', '$\\dfrac{' + ns(sse) + '}{' + sst + '} = ' + ns(frac0) + '$ is left over.', '$r^2 = 1 - ' + ns(frac0) + ' = ' + ns(fix(1 - frac0)) + '$.'],
        hint: 'Compare what is left over with the line to what there was without it.'
      };
    }
    var v = R.pick([0.64, 0.81, 0.49, 0.72, 0.36]), w = R.pick([['sales', 'advertising spending'], ['crop yield', 'rainfall'], ['test score', 'hours studied']]), pc = pct(fix(v * 100));
    return {
      q: 'A regression of ' + w[0] + ' on ' + w[1] + ' has $r^2 = ' + ns(v) + '$. Which statement is correct?',
      a: mc('About $' + pc + '$ of the variation in ' + w[0] + ' is explained by the linear relationship with ' + w[1] + '.', ['About $' + pc + '$ of the data points lie on the regression line.', 'Predictions from the line are correct $' + pc + '$ of the time.', w[1] + ' causes $' + pc + '$ of ' + w[0] + '.']),
      steps: ['$r^2$ compares the spread of the residuals with the spread of y around its mean.', 'It says how much of the variation in y the line accounts for. It does not count points on the line, measure accuracy of single predictions, or show cause.'],
      hint: 'r² is about variation in y, not about individual points.'
    };
  });

  // ---------------------------------------------------------------- outliers and influential points
  var INFL = [
    ['far to the right of all the other x-values, and well below the line the other points follow', 'Influential: it pulls the line toward itself and changes the slope a lot'],
    ['in the middle of the x-values, but far above the other points', 'An outlier in y with little influence: it shifts the line up a bit but barely changes the slope'],
    ['far to the right of all the other x-values, but right on the line the other points follow', 'High leverage but not influential: it agrees with the pattern, so removing it barely changes the line']
  ];
  G('stat.influential-points', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'classify', 'slopes', R.pick(['slopes', 'rchange']));
    if (shape === 'classify') {
      var c = R.pick(INFL);
      return {
        q: 'A scatterplot shows a clear positive linear pattern. One point is ' + c[0] + '. How should you describe that point?',
        a: mc(c[1], INFL.filter(function (x) { return x !== c; }).map(function (x) { return x[1]; }).concat(['Not unusual: every data set has a point like this'])),
        steps: ['A point far out in x has leverage: it can pull the line.', 'It is influential only if it does not fit the pattern, so including it changes the slope.', 'A point that is unusual only in y (with a middle x-value) mostly changes the intercept.'],
        hint: 'Ask two questions: is it far out in x, and does it follow the pattern?'
      };
    }
    var base = corrData(R, 8, 0.97, 1, 9, 30, 8, 1, 1), f0 = fitLine(base), kind = shape === 'rchange' ? 'far-off' : R.pick(['far-off', 'mid-out', 'far-on']), P;
    if (kind === 'far-off') P = [rd(R.int(17, 20), 1), rd(f0.a + f0.b * 5 - R.int(4, 10), 1)];
    else if (kind === 'mid-out') P = [5, rd(f0.a + f0.b * 5 + R.int(12, 18), 1)];
    else P = [rd(R.int(17, 20), 1), rd(f0.a + f0.b * 18.5 + R.int(-1, 1), 1)];
    var all = base.concat([P]), f1 = fitLine(all), b1 = rd(f1.b, 2), b0 = rd(f0.b, 2), r1 = rd(f1.r, 2), r0 = rd(f0.r, 2), infl = M.abs(b1 - b0) > 0.25 * M.abs(b0);
    var viz = { name: 'stat-chart', opts: { kind: 'scatter', points: all, mark: all.length - 1 }, label: 'A scatterplot with one highlighted point' };
    if (shape === 'slopes') return {
      q: 'With all the points, the least-squares slope is $' + ns(b1) + '$. Without the highlighted point P, the slope is $' + ns(b0) + '$. By how much does removing P change the slope (without P minus with P), and is P influential?',
      viz: viz,
      a: { t: 'multi', parts: [{ label: 'change in slope $=$', a: num(fix(b0 - b1)) }, { label: 'Is P influential?', a: mcKeep(['Yes', 'No'], infl ? 0 : 1) }] },
      steps: ['Change: $' + ns(b0) + ' - ' + T.p(ns(b1)) + ' = ' + ns(fix(b0 - b1)) + '$.', infl ? 'That is a large change compared with the slope itself, so P is influential: it pulls the line toward itself.' : 'That is a small change compared with the slope, so P is not influential' + (kind === 'mid-out' ? ', even though it is an outlier in y.' : ': it lies along the pattern.')],
      hint: 'A point is influential when removing it changes the line a lot.'
    };
    return {
      q: 'With all the points, $r = ' + ns(r1) + '$. Without the highlighted point P, $r = ' + ns(r0) + '$. What does this tell you about P?',
      viz: viz,
      a: mc('P is influential: it weakens the pattern and changes the line a lot', ['P has no effect, since one point cannot change r', 'P proves the relationship is curved', 'P is the most typical point in the data']),
      steps: ['Removing one point moved r from ' + ns(r1) + ' to ' + ns(r0) + '.', 'P sits far out in x and off the pattern, so it drags the line toward itself. Report results with and without such a point.'],
      hint: 'Compare r with and without P.'
    };
  });

  // ---------------------------------------------------------------- exponential and power models
  var LOGS = { 2: '0.3010', 3: '0.4771', 4: '0.6021', 5: '0.6990', 6: '0.7782', 8: '0.9031' };
  G('stat.nonlinear-models', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'which', 'predict', R.pick(['expmodel', 'powmodel']));
    if (shape === 'which') {
      var c = R.pick([
        ['the number of bacteria in a dish, which doubles every hour', 'Plot log(y) against x', 'Exponential growth multiplies y by the same factor for each step in x; taking log(y) turns the factor into a constant added amount, so (x, log y) is linear.'],
        ['the value of a car that loses about 15% of its value each year', 'Plot log(y) against x', 'A constant percent loss is exponential decay; log(y) against x is linear.'],
        ['the weight of a fish compared with its length, where weight is close to a constant times length cubed', 'Plot log(y) against log(x)', 'A power model y = a·x^p becomes log y = log a + p·log x, which is linear in log x.'],
        ['the cost of a taxi ride, which is a fixed fee plus a charge per mile', 'No change: the data are already linear', 'A fixed fee plus a constant rate per mile is a straight line already.']
      ]);
      return {
        q: 'Which transformation would make a scatterplot of ' + c[0] + ' look most linear?',
        a: mc(c[1], ['Plot log(y) against x', 'Plot log(y) against log(x)', 'No change: the data are already linear', 'Plot y against x²'].filter(function (s) { return s !== c[1]; })),
        steps: [c[2]],
        hint: 'Constant factors per step in x: log y. Powers of x: log y and log x.'
      };
    }
    if (shape === 'predict') {
      var k = R.int(1, 4), b = R.pick([0.1, 0.2, 0.25, 0.5]), x0 = R.pick([2, 4, 6, 8]), a = fix(k - b * x0);
      return {
        q: 'Data on ' + R.pick(['the number of users of an app against months since launch', 'a bacteria count against hours', 'the value of a collectible against years']) + ' were straightened by taking logs. The least-squares line is $\\log \\hat{y} = ' + ns(a) + T.signed(b) + 'x$ (base-10 log). Predict $y$ when $x = ' + x0 + '$.',
        a: num(M.pow(10, k)),
        steps: ['Put x into the line: $\\log \\hat{y} = ' + ns(a) + T.signed(b) + '(' + x0 + ') = ' + k + '$.', 'Undo the log: $\\hat{y} = 10^{' + k + '} = ' + T.commas(M.pow(10, k)) + '$.'],
        hint: 'The line predicts log y. Raise 10 to that power to get y.'
      };
    }
    var keys = ['2', '3', '4', '5', '6', '8'], A = +R.pick(keys), table0 = 'Use $\\log 2 \\approx 0.3010$, $\\log 3 \\approx 0.4771$, $\\log 4 \\approx 0.6021$, $\\log 5 \\approx 0.6990$, $\\log 6 \\approx 0.7782$ and $\\log 8 \\approx 0.9031$.';
    if (shape === 'expmodel') {
      var B = +R.pick(['2', '3', '4', '5'].filter(function (x) { return +x !== A; }));
      return {
        q: 'For data that grow exponentially, the line fitted to $(x, \\log y)$ is $\\log \\hat{y} = ' + LOGS[A] + ' + ' + LOGS[B] + 'x$. Write the model in the form $\\hat{y} = a \\cdot b^x$. ' + table0,
        a: { t: 'multi', parts: [{ label: '$a =$', a: num(A) }, { label: '$b =$', a: num(B) }] },
        steps: ['Undo the log on both sides: $\\hat{y} = 10^{' + LOGS[A] + ' + ' + LOGS[B] + 'x} = 10^{' + LOGS[A] + '} \\cdot \\left(10^{' + LOGS[B] + '}\\right)^x$.', '$10^{' + LOGS[A] + '} \\approx ' + A + '$ and $10^{' + LOGS[B] + '} \\approx ' + B + '$.', 'So $\\hat{y} = ' + A + ' \\cdot ' + B + '^x$.'],
        hint: 'log a is the intercept and log b is the slope.'
      };
    }
    var p = R.pick([2, 3, 0.5, 1.5]);
    return {
      q: 'For data that follow a power model, the line fitted to $(\\log x, \\log y)$ is $\\log \\hat{y} = ' + LOGS[A] + T.signed(p) + '\\log x$. Write the model as $\\hat{y} = a \\cdot x^p$. ' + table0,
      a: { t: 'multi', parts: [{ label: '$a =$', a: num(A) }, { label: '$p =$', a: num(p) }] },
      steps: ['Undo the log: $\\hat{y} = 10^{' + LOGS[A] + '} \\cdot 10^{' + ns(p) + '\\log x} = 10^{' + LOGS[A] + '} \\cdot x^{' + ns(p) + '}$.', '$10^{' + LOGS[A] + '} \\approx ' + A + '$, so $\\hat{y} = ' + A + 'x^{' + ns(p) + '}$.'],
      hint: 'In log-log form, the slope is the power p and the intercept is log a.'
    };
  });

  // ---------------------------------------------------------------- correlation and causation
  var CAUSE = [
    ['On summer days at a beach town, ice cream sales and the number of sunburn cases rise and fall together.', 'ice cream sales', 'sunburns', 'how hot and sunny the day is', ['the price of ice cream', 'the number of lifeguards on duty', 'the color of the ice cream trucks']],
    ['Among children ages 5 to 12, those with larger shoe sizes tend to have higher reading scores.', 'shoe size', 'reading score', 'age', ['the brand of shoes', 'the color of their shoes', 'the number of pets they own']],
    ['Towns with more places of worship tend to report more crimes.', 'places of worship', 'crimes', 'population size', ['the age of the buildings', 'the number of rainy days', 'the town\'s elevation']],
    ['Fires with more firefighters at the scene tend to cause more damage.', 'the number of firefighters', 'damage', 'how large the fire is', ['the color of the fire trucks', 'the time of day', 'the firefighters\' ages']],
    ['Countries with more televisions per person tend to have longer life expectancies.', 'televisions', 'life expectancy', 'national wealth (which buys both TVs and health care)', ['the size of TV screens', 'the number of TV channels', 'the climate']],
    ['People who carry a lighter are more likely to develop lung disease.', 'carrying a lighter', 'lung disease', 'smoking', ['the brand of lighter', 'how much people walk', 'the size of their pockets']],
    ['On days when more umbrellas are sold, there are more car accidents.', 'umbrella sales', 'car accidents', 'rainy weather', ['the price of umbrellas', 'the day of the week', 'the color of the umbrellas']],
    ['Students who own more books at home tend to score higher on reading tests.', 'owning books', 'reading scores', 'family resources and time spent reading together', ['the weight of the books', 'the color of the book covers', 'the size of the shelves']]
  ];
  G('stat.correlation-causation-stat', function (R, ctx) {
    var L = lv(ctx), c = R.pick(CAUSE), shape = by(ctx, 'cause', 'lurk', R.pick(['study', 'lurk']));
    if (shape === 'cause') return {
      q: c[0] + ' Does this show a direct cause-and-effect link, with ' + c[1] + ' affecting ' + c[2] + '?',
      a: mc('No. A lurking variable, such as ' + c[3] + ', could drive both.', ['Yes, because the two variables are strongly related.', 'Yes, as long as the data set is large.', 'No, because a correlation can never be useful.']),
      steps: ['Two variables can move together because a third variable affects both.', 'Here ' + c[3] + ' is a likely lurking variable.', 'Association is real and can be useful for prediction, but it does not prove cause and effect.'],
      hint: 'Is there something else that could push both variables up and down?'
    };
    if (shape === 'lurk') return {
      q: c[0] + ' Which is the most likely lurking variable?',
      a: mc(cap(c[3]), c[4].map(cap)),
      steps: ['A lurking variable affects both the explanatory and the response variable.', cap(c[3]) + ' pushes both ' + c[1] + ' and ' + c[2] + ' in the same direction, which creates the association.'],
      hint: 'Look for something that would change both variables at once.'
    };
    return {
      q: c[0] + ' A researcher wants to know whether there is a direct effect of ' + c[1] + ' on ' + c[2] + '. What kind of study could answer that?',
      a: mc('A randomized experiment, if one is possible and ethical, where the explanatory variable is assigned at random', ['A larger observational study with the same variables', 'A survey that asks people what they think causes ' + c[2], 'Computing the correlation again with more decimal places']),
      steps: ['Observational data, however large, can be confounded by a lurking variable such as ' + c[3] + '.', 'Random assignment balances lurking variables between groups, so a difference in the response can be traced to the treatment.'],
      hint: 'Which design breaks the link between the lurking variable and the explanatory variable?'
    };
  });


  // ================================================================ unit 4: collecting data

  // ---------------------------------------------------------------- sampling methods
  var POPS = [
    { pop: 'the 1,200 students at a high school', unit: 'student', strata: 'grade (9, 10, 11 and 12)', clusters: 'homerooms', list: 'an alphabetical list of all students' },
    { pop: 'the 3,000 households in a town', unit: 'household', strata: 'neighborhood type (apartments, houses and farms)', clusters: 'city blocks', list: 'a list of all street addresses' },
    { pop: 'the 800 workers at a factory', unit: 'worker', strata: 'shift (day, evening and night)', clusters: 'work teams', list: 'the payroll list' },
    { pop: 'the 5,000 books in a library', unit: 'book', strata: 'section (fiction, nonfiction and children\'s)', clusters: 'shelves', list: 'the catalog' },
    { pop: 'the 2,400 fans at a concert', unit: 'fan', strata: 'seating level (floor, lower deck and upper deck)', clusters: 'rows of seats', list: 'the list of ticket numbers' }
  ];
  var METHODS = ['Simple random sample', 'Stratified random sample', 'Cluster sample', 'Systematic sample', 'Convenience sample'];
  G('stat.sampling-methods', function (R, ctx) {
    var L = lv(ctx), P = R.pick(POPS), shape = by(ctx, 'name', R.pick(['name', 'name', 'sys']), R.pick(['name', 'strat', 'sys']));
    if (shape === 'name') {
      var k = R.int(0, L === 1 ? 3 : 4), n = R.pick([40, 50, 60, 80, 100]);
      var d = [
        'Number every ' + P.unit + ' on ' + P.list + ', then use a random number generator to choose ' + n + ' different numbers.',
        'Split the population by ' + P.strata + ', then choose a separate random sample from each group.',
        'Number the ' + P.clusters + ', choose 4 of them at random, and include every ' + P.unit + ' in the chosen ' + P.clusters + '.',
        'Using ' + P.list + ', pick a random starting point among the first 20, then take every 20th ' + P.unit + ' after it.',
        'Take the first ' + n + ' ' + P.unit + 's that are easiest to reach, such as the ones nearest the entrance.'
      ][k];
      var why = [
        'Every group of ' + n + ' has the same chance of being chosen: a simple random sample.',
        'The population is first divided into similar groups (strata), and each group is sampled: stratified.',
        'Whole groups (clusters) are chosen at random, and everyone in them is included: cluster.',
        'A random start, then every 20th one: systematic.',
        'Choosing whoever is easy to reach is a convenience sample. It is not random and is often biased.'
      ][k];
      return {
        q: 'A researcher wants a sample from ' + P.pop + '. Plan: ' + d + ' Which kind of sample is this?',
        a: mc(METHODS[k], METHODS.filter(function (m, i) { return i !== k; })),
        steps: [why, k === 1 ? 'Stratified: sample some from <b>every</b> group. Cluster: take <b>all</b> of a few groups.' : k === 2 ? 'Cluster: take all of a few randomly chosen groups. (Stratified would sample some from every group.)' : 'Each method has its own signature; look at how the chance enters the plan.'],
        hint: 'Ask: is chance used, and is it used on individuals or on whole groups?'
      };
    }
    if (shape === 'sys') {
      var N = R.pick([600, 800, 1200, 1500, 2400, 3000]), m = R.pick([20, 25, 30, 40, 50, 60, 75, 100].filter(function (x) { return N % x === 0; }));
      return {
        q: 'A systematic sample of ' + m + ' is taken from a list of ' + T.commas(N) + ' ' + P.unit + 's: choose a random start, then take every $k$th name. What is $k$?',
        a: num(N / m),
        steps: ['To spread ' + m + ' picks evenly over ' + T.commas(N) + ' names, take every $\\dfrac{' + N + '}{' + m + '} = ' + (N / m) + '$th name.', 'The random start is a number from 1 to ' + (N / m) + '.'],
        hint: 'Divide the population size by the sample size.'
      };
    }
    var groups = R.pick([[['freshmen', 'sophomores', 'juniors', 'seniors'], [360, 300, 300, 240]], [['day shift', 'evening shift', 'night shift'], [400, 240, 160]], [['fiction', 'nonfiction', 'children\'s'], [2500, 1500, 1000]]]);
    var tot = sum(groups[1]), n2 = R.pick([20, 40, 50, 60, 100].filter(function (x) { return groups[1].every(function (g) { return g * x % tot === 0; }); })) || 20;
    var i = R.int(0, groups[0].length - 1), share = groups[1][i] * n2 / tot;
    return {
      q: 'A population has ' + groups[0].map(function (g, j) { return T.commas(groups[1][j]) + ' ' + g; }).join(', ') + '. A stratified sample of ' + n2 + ' should match these proportions. How many should come from the ' + groups[0][i] + '?',
      a: num(share),
      steps: ['Total: ' + T.commas(tot) + '. The ' + groups[0][i] + ' are $\\dfrac{' + groups[1][i] + '}{' + tot + '}$ of the population.', 'Sample from them: $\\dfrac{' + groups[1][i] + '}{' + tot + '} \\times ' + n2 + ' = ' + share + '$.'],
      hint: 'Each stratum gets the same share of the sample as it has of the population.'
    };
  });

  // ---------------------------------------------------------------- bias in sampling
  var BIAS = [
    ['A website asks visitors to click a button if they think the town needs a new skate park. 900 people click.', 'Voluntary response bias', 'People choose themselves, and those with strong feelings are much more likely to respond.', 'overestimate'],
    ['A survey about public transit is mailed to 2,000 randomly chosen homes. Only 300 are returned, mostly by retirees.', 'Nonresponse bias', 'The people who answered may differ from the many who did not.', ''],
    ['A phone survey about internet use calls randomly chosen landline numbers.', 'Undercoverage', 'People without landlines, often younger people, have no chance of being chosen.', ''],
    ['A survey asks: "Don\'t you agree that the beautiful old library should be saved from demolition?"', 'Response bias from a leading question', 'The wording pushes people toward "yes".', 'overestimate'],
    ['To learn how much students exercise, a reporter interviews people leaving the school gym.', 'Convenience sampling bias', 'People at the gym exercise more than typical students.', 'overestimate'],
    ['A city surveys residents about a new park by asking people at the park on a Saturday.', 'Convenience sampling bias', 'Park visitors are more likely to like parks than residents in general.', 'overestimate'],
    ['A teacher asks students to raise their hands if they have ever cheated on a test.', 'Response bias', 'Answering in public about a sensitive topic leads people to give the answer they think is expected.', 'underestimate']
  ];
  var BIAS_NAMES = ['Voluntary response bias', 'Nonresponse bias', 'Undercoverage', 'Response bias from a leading question', 'Convenience sampling bias', 'Response bias'];
  G('stat.sampling-bias', function (R, ctx) {
    var L = lv(ctx), b = R.pick(BIAS), shape = by(ctx, 'name', R.pick(['name', 'size']), R.pick(['size', 'dir', 'name']));
    if (shape === 'dir' && !b[3]) shape = 'size';
    if (shape === 'name') return {
      q: b[0] + ' What is the main source of bias?',
      a: mc(b[1], BIAS_NAMES.filter(function (x) { return x !== b[1] && !(b[1].indexOf('Response bias') === 0 && x.indexOf('Response bias') === 0); })),
      steps: [b[2], 'So the main problem is <b>' + b[1].toLowerCase() + '</b>.'],
      hint: 'Ask who was left out, who chose to answer, and whether the question itself pushes an answer.'
    };
    if (shape === 'size') return {
      q: b[0] + ' A friend says, "Just collect 10 times as many responses the same way, and the bias goes away." Is that right?',
      a: mc('No. A bigger sample collected the same way repeats the same bias; it only makes the wrong answer more precise.', ['Yes. Large samples always cancel out bias.', 'Yes, as long as at least 1,000 people respond.', 'No, because samples can never tell us anything about a population.']),
      steps: ['Bias comes from <b>how</b> the sample is chosen or asked, not from how many are asked.', b[2] + ' Asking more people the same way keeps that problem.', 'Random sampling with careful questions fixes bias; size only reduces random variation.'],
      hint: 'Does collecting more data the same way change who is left out?'
    };
    return {
      q: b[0] + ' Will the result most likely overestimate or underestimate the true value for the population?',
      a: mcKeep(['Overestimate', 'Underestimate', 'Neither: the bias cancels out'], b[3] === 'overestimate' ? 0 : 1),
      steps: [b[2], 'So the estimate will probably be too ' + (b[3] === 'overestimate' ? 'high' : 'low') + '.'],
      hint: 'Which answer is more likely from the people this method reaches?'
    };
  });

  // ---------------------------------------------------------------- observational studies and experiments
  var STUDIES = [
    ['Researchers look at the medical records of 5,000 adults and compare heart health for those who drink coffee daily and those who do not.', false, 'coffee drinking', 'heart health', 'They only recorded what people already did.'],
    ['A gardener randomly assigns 40 tomato plants to get either a new fertilizer or the usual one, then measures the harvest.', true, 'type of fertilizer', 'harvest', 'The gardener chose (at random) which plants got which fertilizer.'],
    ['A school surveys students about their sleep and compares the grades of students who sleep more with those who sleep less.', false, 'hours of sleep', 'grades', 'Students chose their own sleep; nothing was assigned.'],
    ['Volunteers are randomly assigned to chew gum or not during a memory test, and their scores are compared.', true, 'chewing gum', 'memory score', 'The researchers assigned the gum at random.'],
    ['A website compares how long people stay on the page with and without a video, showing each visitor one version chosen at random.', true, 'whether the page has a video', 'time on the page', 'The website assigned the version at random.'],
    ['Researchers follow 2,000 children for 10 years and compare the eyesight of those who read a lot with those who read little.', false, 'amount of reading', 'eyesight', 'The children chose how much to read; the researchers only watched.']
  ];
  G('stat.observational-experimental', function (R, ctx) {
    var L = lv(ctx), s = R.pick(STUDIES), shape = by(ctx, 'kind', R.pick(['kind', 'cause']), R.pick(['cause', 'vars']));
    if (shape === 'kind') return {
      q: s[0] + ' Is this an observational study or an experiment?',
      a: mcKeep(['Observational study', 'Experiment'], s[1] ? 1 : 0),
      steps: ['In an experiment, the researchers impose a treatment. In an observational study, they only observe.', s[4], 'So it is ' + (s[1] ? 'an experiment.' : 'an observational study.')],
      hint: 'Did the researchers decide who got which treatment?'
    };
    if (shape === 'cause') return {
      q: s[0] + ' Suppose the groups differ clearly in ' + s[3] + '. Can we conclude that ' + s[2] + ' causes the difference?',
      a: s[1] ? mc('Yes, likely: random assignment makes the groups alike in other ways, so the treatment is the best explanation.', ['No: only observational studies can show cause.', 'No: you can never conclude cause from data.', 'Yes, but only because the sample is large.'])
        : mc('No: this is an observational study, so lurking variables could explain the difference.', ['Yes: a clear difference proves cause.', 'Yes, as long as the sample is large.', 'No: the researchers forgot to compute a correlation.']),
      steps: [s[4], s[1] ? 'Random assignment spreads other influences evenly between the groups, so a clear difference can be traced to the treatment.' : 'People who differ in ' + s[2] + ' may differ in many other ways too. Those lurking variables could cause the difference.'],
      hint: 'Was the explanatory variable assigned at random?'
    };
    return {
      q: s[0] + ' Which is the explanatory variable, and which is the response?',
      a: mc('Explanatory: ' + s[2] + '. Response: ' + s[3] + '.', ['Explanatory: ' + s[3] + '. Response: ' + s[2] + '.', 'Both are response variables.', 'Explanatory: the number of subjects. Response: ' + s[3] + '.']),
      steps: ['The explanatory variable is the one that might explain or influence the other; the response is the outcome measured.', 'Here ' + s[2] + ' might affect ' + s[3] + '.'],
      hint: 'Which variable is the possible cause, and which is the outcome?'
    };
  });

  // ---------------------------------------------------------------- designing experiments
  var PRINC = [
    ['The researchers use a coin flip to decide which subjects get the new treatment.', 'Random assignment', 'Chance decides who gets which treatment, so the groups are alike on average.'],
    ['One group gets a sugar pill that looks exactly like the real medicine.', 'A control group with a placebo', 'The comparison group shows what happens without the active treatment.'],
    ['The study gives each treatment to 60 patients instead of 3.', 'Replication', 'Using many subjects per treatment lets chance differences average out.'],
    ['Subjects are first split into men and women, and then randomly assigned to treatments within each group.', 'Blocking', 'Grouping similar subjects first removes the variation between the groups from the comparison.'],
    ['Neither the patients nor the doctors measuring results know who got which treatment.', 'Double-blinding', 'Expectations cannot affect the results if nobody knows who got what.']
  ];
  G('stat.experimental-design', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'princ', R.pick(['princ', 'count']), R.pick(['scope', 'count', 'scope']));
    if (shape === 'princ') {
      var p = R.pick(PRINC);
      return {
        q: 'In a study of a new allergy medicine: "' + p[0] + '" Which principle of experimental design is this?',
        a: mc(p[1], PRINC.filter(function (x) { return x !== p; }).map(function (x) { return x[1]; })),
        steps: [p[2]],
        hint: 'Think about what problem this step solves.'
      };
    }
    if (shape === 'count') {
      var f1 = R.pick([['temperature', ['low', 'medium', 'high']], ['amount of water', ['light', 'heavy']], ['brand of seed', ['A', 'B', 'C', 'D']]]), f2;
      do { f2 = R.pick([['fertilizer', ['none', 'type 1', 'type 2']], ['light', ['sun', 'shade']], ['soil', ['sand', 'clay', 'loam']]]); } while (f2 === f1);
      var reps = R.pick([4, 5, 6, 8, 10]), tr = f1[1].length * f2[1].length;
      return {
        q: 'An experiment on plant growth uses two factors: ' + f1[0] + ' (' + U.list(f1[1]) + ') and ' + f2[0] + ' (' + U.list(f2[1]) + '). Every combination is a treatment, and each treatment is given to ' + reps + ' plants. How many treatments are there, and how many plants are needed?',
        a: { t: 'multi', parts: [{ label: 'treatments $=$', a: num(tr) }, { label: 'plants $=$', a: num(tr * reps) }] },
        steps: ['Each level of ' + f1[0] + ' pairs with each level of ' + f2[0] + ': $' + f1[1].length + ' \\times ' + f2[1].length + ' = ' + tr + '$ treatments.', 'Replication: ' + reps + ' plants per treatment, so $' + tr + ' \\times ' + reps + ' = ' + (tr * reps) + '$ plants.'],
        hint: 'Multiply the numbers of levels to count the combinations.'
      };
    }
    var sc = R.pick([
      ['A company randomly selects 200 of its customers and randomly assigns half to get a new app design.', 'Both: the results can be generalized to all its customers (random sample), and differences can be blamed on the design (random assignment).', 'Customers were chosen at random from all customers AND assigned at random.'],
      ['200 volunteers sign up. They are randomly assigned to two diets.', 'A cause-and-effect conclusion for these volunteers, but not a general claim about everyone, since volunteers were not randomly sampled.', 'Random assignment supports cause; the volunteers were not a random sample of a larger population.'],
      ['A researcher randomly selects 200 adults and asks whether they drink tea and how well they sleep.', 'Generalizing the association to all adults, but not a cause-and-effect conclusion, since nothing was assigned.', 'A random sample supports generalizing; without random assignment, no cause.']
    ]);
    return {
      q: sc[0] + ' What kind of conclusion does this design support?',
      a: mc(sc[1], ['Both: the results can be generalized to all its customers (random sample), and differences can be blamed on the design (random assignment).', 'A cause-and-effect conclusion for these volunteers, but not a general claim about everyone, since volunteers were not randomly sampled.', 'Generalizing the association to all adults, but not a cause-and-effect conclusion, since nothing was assigned.', 'Neither kind of conclusion, because the sample has only 200 people.'].filter(function (x) { return x !== sc[1]; })),
      steps: ['Random <b>sampling</b> lets you generalize to the population the sample came from.', 'Random <b>assignment</b> lets you conclude cause and effect.', sc[2]],
      hint: 'Random sampling and random assignment answer different questions. Which one happened here?'
    };
  });

  // ---------------------------------------------------------------- evaluating reports
  var REPORTS = [
    ['A headline says: "Students who play chess get better grades." The story is based on comparing chess club members with other students.', 'It is an observational study, so lurking variables (like interest in school) may explain the difference; it does not show chess causes better grades.', ['The sample must be biased because chess is a game.', 'Grades cannot be measured, so the study means nothing.', 'The headline is proven, because chess players had higher grades.']],
    ['An online poll on a sports site finds that 82% of respondents want a new stadium built with tax money.', 'Respondents chose themselves on a sports website, so the result likely overstates support among all residents.', ['82% is a large majority, so the result must hold for everyone.', 'Polls can never be trusted under any design.', 'The only problem is that 82% is not a round number.']],
    ['An ad says: "4 out of 5 dentists surveyed recommend our toothpaste."', 'We need to know how many dentists were surveyed, how they were chosen, and what they were asked; 4 of 5 could come from a tiny or hand-picked group.', ['The claim is proven, since dentists are experts.', 'The claim means 80% of all dentists use this toothpaste.', 'The claim is false, because ads cannot use statistics.']],
    ['A study reports that a new reading program raised scores. Schools volunteered to use the program and were compared with schools that did not.', 'Schools that volunteer may differ (more motivated staff, more funding); without random assignment, the program may not be the cause.', ['The study proves the program works, because scores went up.', 'The study is fine, because every school took the same test.', 'The study is useless, because reading cannot be measured.']],
    ['A magazine surveys 50 people at a fitness center, finds that 90% exercise at least three times a week, and reports that "90% of Americans exercise regularly."', 'People at a fitness center are not representative of all Americans, so the result cannot be generalized to everyone.', ['50 people is too many for a survey.', 'The result is correct for all Americans, since 90% is so high.', 'The only problem is that the survey did not include a graph.']],
    ['A bar graph of a company\'s sales starts its vertical axis at 950 instead of 0, so a 2% increase looks like sales doubled.', 'The axis does not start at 0, which makes a small change look huge; read the actual numbers.', ['Sales really did double, since the bar is twice as tall.', 'Bar graphs can never show sales.', 'The graph is fine because it uses real data.']],
    ['A report says the average household income in a town is \\$150,000, though most households earn about \\$50,000.', 'A few very high incomes pull the mean up; the median would better describe a typical household.', ['The report must have a math error, since an average is always typical.', 'Most households must earn \\$150,000.', 'Incomes cannot be averaged, so the number means nothing.']],
    ['A study of 12 people finds that a new diet led to 3 more pounds of weight loss, on average, than the old diet.', 'With only 12 people, a difference of 3 pounds could easily come from chance; we need to know how the people were assigned and how much results varied.', ['The study proves the new diet is better for everyone.', 'Weight loss cannot be measured in pounds.', 'Small studies are always more accurate than large ones.']],
    ['A news story says a medicine "cut the risk of a side effect in half," from 2 in 10,000 people to 1 in 10,000.', 'The relative change sounds large, but the absolute change is tiny: 1 fewer case per 10,000 people.', ['Half of all people will now avoid the side effect.', 'The risk went from 50% to 25%.', 'Cutting a risk in half always matters a lot.']]
  ];
  G('stat.evaluate-reports', function (R, ctx) {
    var r = R.pick(REPORTS);
    return {
      q: r[0] + ' Which is the most important thing to point out?',
      a: mc(r[1], r[2]),
      steps: ['Ask how the data were produced: who was included, how they were chosen, and whether anything was randomly assigned.', r[1]],
      hint: 'Focus on how the data were collected and what the numbers really compare.'
    };
  });


  // ================================================================ unit 5: probability rules

  // ---------------------------------------------------------------- events, unions, intersections, complements
  function numEvents(N) {
    var ev = [
      ['an even number', function (x) { return x % 2 === 0; }],
      ['an odd number', function (x) { return x % 2 === 1; }],
      ['a multiple of 3', function (x) { return x % 3 === 0; }],
      ['a prime number', function (x) { return U.isPrime(x); }]
    ];
    if (N >= 8) ev.push(['a multiple of 4', function (x) { return x % 4 === 0; }]);
    return ev;
  }
  var SUITS = ['hearts', 'diamonds', 'clubs', 'spades'], RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var DECK = []; SUITS.forEach(function (s) { RANKS.forEach(function (r) { DECK.push({ s: s, r: r }); }); });
  var CARD_EV = {
    suit: [['a heart', function (c) { return c.s === 'hearts'; }], ['a spade', function (c) { return c.s === 'spades'; }], ['a red card', function (c) { return c.s === 'hearts' || c.s === 'diamonds'; }], ['a club', function (c) { return c.s === 'clubs'; }]],
    rank: [['a face card (jack, queen or king)', function (c) { return /[JQK]/.test(c.r); }], ['a king', function (c) { return c.r === 'K'; }], ['an ace', function (c) { return c.r === 'A'; }], ['a number card from 2 to 10', function (c) { return /^\d+$/.test(c.r); }]]
  };
  var DICE_EV = [
    ['the sum is 7', function (a, b) { return a + b === 7; }], ['the sum is at least 10', function (a, b) { return a + b >= 10; }],
    ['the roll is doubles (both dice match)', function (a, b) { return a === b; }], ['the first die shows a 6', function (a) { return a === 6; }],
    ['the sum is even', function (a, b) { return (a + b) % 2 === 0; }], ['at least one die shows a 5', function (a, b) { return a === 5 || b === 5; }],
    ['the sum is 8', function (a, b) { return a + b === 8; }]
  ];
  G('stat.events-sample-spaces', function (R, ctx) {
    var L = lv(ctx), kind = by(ctx, R.pick(['die', 'spin']), R.pick(['spin', 'cards']), R.pick(['cards', 'dice'])), op = R.pick(L === 1 ? ['or', 'or', 'and', 'not'] : ['or', 'and', 'not', 'or']);
    var A, B, total, inA, inB, setup, show = null;
    if (kind === 'die' || kind === 'spin') {
      var N = kind === 'die' ? 6 : R.pick([8, 10, 12]), out = U.range(1, N), evs = numEvents(N);
      var k = R.int(2, N - 2), gt = ['a number greater than ' + k, function (x) { return x > k; }];
      evs.push(gt);
      for (var t = 0; t < 40; t++) { A = R.pick(evs); B = R.pick(evs); var sa = out.filter(A[1]), sb = out.filter(B[1]); if (A !== B && sa.join() !== sb.join() && out.filter(function (x) { return A[1](x) && B[1](x); }).length > 0) break; }
      inA = out.filter(A[1]); inB = out.filter(B[1]); total = N;
      setup = kind === 'die' ? 'Roll a fair six-sided die. ' : 'A spinner has ' + N + ' equal sections numbered 1 to ' + N + '. Spin it once. ';
      show = function (arr) { return '$' + T.set(arr) + '$'; };
      var uni = out.filter(function (x) { return A[1](x) || B[1](x); }), both = out.filter(function (x) { return A[1](x) && B[1](x); }), notA = out.filter(function (x) { return !A[1](x); });
      var Aname = 'A: the result is ' + A[0], Bname = 'B: the result is ' + B[0];
      if (op === 'not') return {
        q: setup + 'Let event ' + Aname + '. Find $P(A^{\\prime})$, the probability that A does <b>not</b> happen.',
        a: prob(notA.length, total),
        steps: ['$A = ' + T.set(inA) + '$.', 'Not A is everything else: $A^{\\prime} = ' + T.set(notA) + '$, which has ' + notA.length + ' outcomes.', '$P(A^{\\prime}) = ' + dfr(notA.length, total) + '$. Check: $1 - P(A) = 1 - ' + dfr(inA.length, total) + ' = ' + dfr(notA.length, total) + '$.'],
        hint: 'List the outcomes that are not in A.'
      };
      return {
        q: setup + 'Let event ' + Aname + ', and event ' + Bname + '. Find $P(A ' + (op === 'or' ? '\\cup' : '\\cap') + ' B)$, the probability of A <b>' + op + '</b> B.',
        a: prob((op === 'or' ? uni : both).length, total),
        steps: ['$A = ' + T.set(inA) + '$ and $B = ' + T.set(inB) + '$.', op === 'or' ? '"A or B" means A, B, or both: $A \\cup B = ' + T.set(uni) + '$, ' + uni.length + ' outcomes. List each outcome once.' : '"A and B" means both at once: $A \\cap B = ' + T.set(both) + '$, ' + both.length + ' outcome' + (both.length > 1 ? 's' : '') + '.', 'Probability: $' + dfr((op === 'or' ? uni : both).length, total) + '$.'],
        hint: op === 'or' ? '"Or" includes outcomes in both events. Count each outcome once.' : '"And" means the outcome must be in both events.'
      };
    }
    if (kind === 'cards') {
      A = R.pick(CARD_EV.suit); B = R.pick(CARD_EV.rank); if (R.coin()) { var tmp = A; A = B; B = tmp; }
      var cA = DECK.filter(A[1]).length, cB = DECK.filter(B[1]).length, cAB = DECK.filter(function (c) { return A[1](c) && B[1](c); }).length, cU = cA + cB - cAB;
      setup = 'Draw one card from a standard 52-card deck (13 cards in each of 4 suits; hearts and diamonds are red). Let A be "the card is ' + A[0] + '" and B be "the card is ' + B[0] + '". ';
      if (op === 'not') return {
        q: setup + 'Find $P(A^{\\prime})$.',
        a: prob(52 - cA, 52),
        steps: ['A has ' + cA + ' cards, so ' + (52 - cA) + ' cards are not in A.', '$P(A^{\\prime}) = ' + dfr(52 - cA, 52) + '$.'],
        hint: 'Count the cards that are not ' + A[0] + '.'
      };
      return {
        q: setup + 'Find $P(A ' + (op === 'or' ? '\\cup' : '\\cap') + ' B)$.',
        a: prob(op === 'or' ? cU : cAB, 52),
        steps: ['A has ' + cA + ' cards; B has ' + cB + ' cards; ' + cAB + ' card' + (cAB > 1 ? 's are' : ' is') + ' in both.', op === 'or' ? 'Count each card once: $' + cA + ' + ' + cB + ' - ' + cAB + ' = ' + cU + '$ cards are in A or B (or both).' : 'Cards in both A and B: ' + cAB + '.', 'Probability: $' + dfr(op === 'or' ? cU : cAB, 52) + '$.'],
        hint: 'Count the cards, and do not count a card twice.'
      };
    }
    for (var t2 = 0; t2 < 40; t2++) { A = R.pick(DICE_EV); B = R.pick(DICE_EV); if (A !== B) { var nb = 0; for (var a1 = 1; a1 <= 6; a1++) for (var b1 = 1; b1 <= 6; b1++) if (A[1](a1, b1) && B[1](a1, b1)) nb++; if (nb > 0 || op !== 'and') break; } }
    var nA = 0, nB = 0, nAB = 0, nU = 0;
    for (var x = 1; x <= 6; x++) for (var y = 1; y <= 6; y++) { var ia = A[1](x, y), ib = B[1](x, y); if (ia) nA++; if (ib) nB++; if (ia && ib) nAB++; if (ia || ib) nU++; }
    setup = 'Roll two fair dice (36 equally likely outcomes, such as (2, 5)). Let A be "' + A[0] + '" and B be "' + B[0] + '". ';
    if (op === 'not') return {
      q: setup + 'Find $P(A^{\\prime})$.',
      a: prob(36 - nA, 36),
      steps: ['A has ' + nA + ' of the 36 outcomes.', 'So $' + (36 - nA) + '$ outcomes are not in A, and $P(A^{\\prime}) = ' + dfr(36 - nA, 36) + '$.'],
      hint: 'Count the outcomes in A, then subtract from 36.'
    };
    return {
      q: setup + 'Find $P(A ' + (op === 'or' ? '\\cup' : '\\cap') + ' B)$.',
      a: prob(op === 'or' ? nU : nAB, 36),
      steps: ['Use the 6 by 6 grid of outcomes. A has ' + nA + ' outcomes, B has ' + nB + ', and ' + nAB + ' are in both.', op === 'or' ? 'A or B: $' + nA + ' + ' + nB + ' - ' + nAB + ' = ' + nU + '$ outcomes (the overlap counted once).' : 'A and B: ' + nAB + ' outcome' + (nAB === 1 ? '' : 's') + '.', 'Probability: $' + dfr(op === 'or' ? nU : nAB, 36) + '$.'],
      hint: 'Sketch the 6 by 6 grid and mark the outcomes in each event.'
    };
  });

  // ---------------------------------------------------------------- the addition rule
  var ADD_CTX = [ // singular A, singular B, population, plural A, plural B
    ['plays a sport', 'is in the band', 'students at a school', 'play a sport', 'are in the band'],
    ['owns a dog', 'owns a cat', 'households in a city', 'own a dog', 'own a cat'],
    ['reads the news online', 'watches the news on TV', 'adults surveyed', 'read the news online', 'watch the news on TV'],
    ['takes Spanish', 'takes art', 'students in a grade', 'take Spanish', 'take art'],
    ['has a library card', 'has a gym membership', 'residents of a town', 'have a library card', 'have a gym membership']
  ];
  G('stat.addition-rule', function (R, ctx) {
    var L = lv(ctx), c = R.pick(ADD_CTX), shape = by(ctx, 'dec', R.pick(['count', 'reverse', 'dec']), R.pick(['neither', 'mutex', 'reverse']));
    var pa = R.int(6, 14) * 5, pb = R.int(4, 12) * 5, pab = R.int(1, M.min(pa, pb) / 5 - 1) * 5;
    if (pa + pb - pab > 95) pab = pa + pb - 95 + 5 * R.int(0, 2);
    var A = Q(pa, 100), B = Q(pb, 100), AB = Q(pab, 100), Un = A.add(B).sub(AB), d = function (x) { return qv(x); };
    var words = 'Of the ' + c[2] + ', ';
    if (shape === 'dec') return {
      q: words + 'the probability that a randomly chosen one ' + c[0] + ' is $' + d(A) + '$, the probability that one ' + c[1] + ' is $' + d(B) + '$, and the probability of both is $' + d(AB) + '$. Find the probability that a randomly chosen one ' + c[0] + ' or ' + c[1] + '.',
      a: num(d(Un)),
      steps: ['$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.', 'Adding $P(A)$ and $P(B)$ counts the overlap twice, so subtract it once: $' + d(A) + ' + ' + d(B) + ' - ' + d(AB) + ' = ' + d(Un) + '$.'],
      hint: 'Add the two probabilities, then subtract the overlap.'
    };
    if (shape === 'count') {
      var N = R.pick([80, 120, 150, 200, 240]), na = R.int(N / 5, N / 2), nb = R.int(N / 6, N / 3), nab = R.int(4, M.min(na, nb) - 3);
      return {
        q: 'Of ' + N + ' ' + c[2] + ', ' + na + ' ' + c[3] + ', ' + nb + ' ' + c[4] + ', and ' + nab + ' do both. What is the probability that a randomly chosen one ' + c[0] + ' or ' + c[1] + '?',
        a: prob(na + nb - nab, N),
        steps: ['Count each one once: $' + na + ' + ' + nb + ' - ' + nab + ' = ' + (na + nb - nab) + '$ have at least one of the traits.', 'Probability: $' + dfr(na + nb - nab, N) + '$.'],
        hint: 'The ' + nab + ' with both traits are inside both counts.'
      };
    }
    if (shape === 'reverse') return {
      q: words + '$P(A) = ' + d(A) + '$ for "' + c[0] + '" and $P(B) = ' + d(B) + '$ for "' + c[1] + '". The probability of A or B is $' + d(Un) + '$. Find $P(A \\cap B)$, the probability of both.',
      a: num(d(AB)),
      steps: ['$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.', '$' + d(Un) + ' = ' + d(A) + ' + ' + d(B) + ' - P(A \\cap B)$.', '$P(A \\cap B) = ' + d(A.add(B)) + ' - ' + d(Un) + ' = ' + d(AB) + '$.'],
      hint: 'Put the numbers into the addition rule and solve for the overlap.'
    };
    if (shape === 'neither') return {
      q: words + '$P(A) = ' + d(A) + '$ for "' + c[0] + '", $P(B) = ' + d(B) + '$ for "' + c[1] + '", and $P(A \\cap B) = ' + d(AB) + '$. What is the probability that a randomly chosen one does <b>neither</b>?',
      a: num(d(Q(1).sub(Un))),
      steps: ['First, A or B: $' + d(A) + ' + ' + d(B) + ' - ' + d(AB) + ' = ' + d(Un) + '$.', '"Neither" is the complement of "A or B": $1 - ' + d(Un) + ' = ' + d(Q(1).sub(Un)) + '$.'],
      hint: 'Find P(A or B) first; neither is everything else.'
    };
    var p1 = R.int(2, 6) / 10, p2 = R.int(1, 3) / 10;
    var e = R.pick([['the next customer pays with cash', 'the next customer pays with a card'], ['a student\'s favorite season is summer', 'a student\'s favorite season is winter'], ['the spinner lands on red', 'the spinner lands on blue']]);
    return {
      q: 'The events "' + e[0] + '" and "' + e[1] + '" cannot happen together (they are mutually exclusive). Their probabilities are $' + ns(p1) + '$ and $' + ns(p2) + '$. Find the probability that one or the other happens.',
      a: num(fix(p1 + p2)),
      steps: ['Mutually exclusive events have no overlap: $P(A \\cap B) = 0$.', 'So $P(A \\cup B) = ' + ns(p1) + ' + ' + ns(p2) + ' - 0 = ' + ns(fix(p1 + p2)) + '$.'],
      hint: 'If they cannot happen together, what is the overlap?'
    };
  });

  // ---------------------------------------------------------------- conditional probability
  G('stat.conditional-probability', function (R, ctx) {
    var L = lv(ctx), c = R.pick(ADD_CTX), shape = by(ctx, 'count', R.pick(['prob', 'count']), 'both');
    var N = R.pick([100, 120, 150, 200, 250]), na = R.int(M.round(N / 5), M.round(N / 2)), nb = R.int(M.round(N / 6), M.round(N / 3)), nab = R.int(5, M.min(na, nb) - 3);
    var intro = 'Of ' + N + ' ' + c[2] + ', ' + na + ' ' + c[3] + ' (event A), ' + nb + ' ' + c[4] + ' (event B), and ' + nab + ' do both.';
    if (shape === 'count') return {
      q: intro + ' One of the ' + nb + ' in group B is chosen at random. What is the probability that this one is also in group A? (Find $P(A \\mid B)$.)',
      a: prob(nab, nb),
      steps: ['"Given B" shrinks the sample space to the ' + nb + ' in B.', 'Of those, ' + nab + ' are also in A.', '$P(A \\mid B) = \\dfrac{' + nab + '}{' + nb + '}' + (q(nab, nb).toTex() !== '\\frac{' + nab + '}{' + nb + '}' ? ' = ' + dfr(nab, nb) : '') + '$.'],
      hint: 'Divide by the number in the condition, not by the total.'
    };
    if (shape === 'prob') {
      var pB = R.int(4, 9) / 10, pAB = R.pick([0.08, 0.12, 0.15, 0.2, 0.24, 0.3, 0.06, 0.1].filter(function (x) { return x < pB; }));
      return {
        q: 'For two events, $P(B) = ' + ns(pB) + '$ and $P(A \\cap B) = ' + ns(pAB) + '$. Find $P(A \\mid B)$.',
        a: prob(M.round(pAB * 100), M.round(pB * 100)),
        steps: ['$P(A \\mid B) = \\dfrac{P(A \\cap B)}{P(B)}$: the part of B where A also happens.', '$\\dfrac{' + ns(pAB) + '}{' + ns(pB) + '} = ' + dfr(M.round(pAB * 100), M.round(pB * 100)) + (q(M.round(pAB * 100), M.round(pB * 100)).isTerminating() ? '' : ' \\approx ' + ns(rd(pAB / pB, 3))) + '$.'],
        hint: 'Divide the probability of both by the probability of the condition.'
      };
    }
    return {
      q: intro + ' Find $P(A \\mid B)$ and $P(B \\mid A)$.',
      a: { t: 'multi', parts: [{ label: '$P(A \\mid B) =$', a: prob(nab, nb) }, { label: '$P(B \\mid A) =$', a: prob(nab, na) }] },
      steps: ['$P(A \\mid B)$: among the ' + nb + ' in B, ' + nab + ' are in A, so $' + dfr(nab, nb) + '$.', '$P(B \\mid A)$: among the ' + na + ' in A, ' + nab + ' are in B, so $' + dfr(nab, na) + '$.', 'Same overlap, different condition, different answer: $P(A \\mid B)$ and $P(B \\mid A)$ are not the same thing.'],
      hint: 'The condition (after the bar) decides what you divide by.'
    };
  });

  // ---------------------------------------------------------------- conditional probability from two-way tables
  var TWOWAY = [
    { rows: ['Plays an instrument', 'Does not'], cols: ['Grade 9', 'Grade 10', 'Grade 11'], unit: 'students', rq: ['plays an instrument', 'does not play an instrument'], cq: ['is in grade 9', 'is in grade 10', 'is in grade 11'] },
    { rows: ['Prefers cats', 'Prefers dogs'], cols: ['Under 30', '30 or older'], unit: 'people surveyed', rq: ['prefers cats', 'prefers dogs'], cq: ['is under 30', 'is 30 or older'] },
    { rows: ['Walks to school', 'Rides', 'Bikes'], cols: ['Lives in town', 'Lives outside town'], unit: 'students', rq: ['walks to school', 'rides to school', 'bikes to school'], cq: ['lives in town', 'lives outside town'] },
    { rows: ['Passed', 'Did not pass'], cols: ['Took the review class', 'Did not take it'], unit: 'test takers', rq: ['passed', 'did not pass'], cq: ['took the review class', 'did not take the review class'] }
  ];
  function twoWay(R, T0, lo, hi) {
    var cells = T0.rows.map(function () { return T0.cols.map(function () { return R.int(lo, hi); }); });
    var rt = cells.map(function (r) { return sum(r); }), ct = T0.cols.map(function (_, j) { return sum(cells.map(function (r) { return r[j]; })); }), N = sum(rt);
    var html = table([''].concat(T0.cols, ['Total']), T0.rows.map(function (r, i) { return [r].concat(cells[i].map(String), ['<b>' + rt[i] + '</b>']); }).concat([['Total'].concat(ct.map(function (x) { return '<b>' + x + '</b>'; }), ['<b>' + N + '</b>'])]));
    return { cells: cells, rt: rt, ct: ct, N: N, html: html };
  }
  G('stat.two-way-conditional', function (R, ctx) {
    var L = lv(ctx), T0 = R.pick(TWOWAY), tw = twoWay(R, T0, 8, 60), i = R.int(0, T0.rows.length - 1), j = R.int(0, T0.cols.length - 1), cell = tw.cells[i][j];
    var shape = by(ctx, 'givenRow', R.pick(['givenCol', 'joint', 'givenRow']), R.pick(['both', 'givenCol']));
    var head = 'The table shows ' + tw.N + ' ' + T0.unit + '.' + tw.html + 'One of them is chosen at random. ';
    if (shape === 'givenRow') return {
      q: head + 'Given that the person ' + T0.rq[i] + ', what is the probability that the person ' + T0.cq[j] + '?',
      a: prob(cell, tw.rt[i]),
      steps: ['The condition is "' + T0.rq[i] + '", so use only that row: ' + tw.rt[i] + ' ' + T0.unit + '.', 'Of those, ' + cell + ' ' + T0.cq[j].replace(/^is /, 'are ').replace(/^lives/, 'live') + '.', 'Probability: $\\dfrac{' + cell + '}{' + tw.rt[i] + '}' + (q(cell, tw.rt[i]).d === BigInt(tw.rt[i]) ? '' : ' = ' + dfr(cell, tw.rt[i])) + '$.'],
      hint: 'Divide by the total of the row that matches the condition.'
    };
    if (shape === 'givenCol') return {
      q: head + 'Given that the person ' + T0.cq[j] + ', what is the probability that the person ' + T0.rq[i] + '?',
      a: prob(cell, tw.ct[j]),
      steps: ['The condition is "' + T0.cq[j] + '", so use only that column: ' + tw.ct[j] + ' ' + T0.unit + '.', 'Of those, ' + cell + ' are in the row "' + T0.rows[i] + '".', 'Probability: $\\dfrac{' + cell + '}{' + tw.ct[j] + '}' + (q(cell, tw.ct[j]).d === BigInt(tw.ct[j]) ? '' : ' = ' + dfr(cell, tw.ct[j])) + '$.'],
      hint: 'Divide by the total of the column that matches the condition, not by the grand total.'
    };
    if (shape === 'joint') return {
      q: head + 'What is the probability that the person ' + T0.rq[i] + ' <b>and</b> ' + T0.cq[j] + '?',
      a: prob(cell, tw.N),
      steps: ['"And" with no condition: the cell in row "' + T0.rows[i] + '" and column "' + T0.cols[j] + '" holds ' + cell + '.', 'There is no condition, so divide by the grand total: $\\dfrac{' + cell + '}{' + tw.N + '}' + (q(cell, tw.N).d === BigInt(tw.N) ? '' : ' = ' + dfr(cell, tw.N)) + '$.'],
      hint: 'With no "given", the denominator is the grand total.'
    };
    return {
      q: head + 'Find $P(\\text{' + T0.rows[i] + '} \\mid \\text{' + T0.cols[j] + '})$ and $P(\\text{' + T0.cols[j] + '} \\mid \\text{' + T0.rows[i] + '})$.',
      a: { t: 'multi', parts: [{ label: 'first $=$', a: prob(cell, tw.ct[j]) }, { label: 'second $=$', a: prob(cell, tw.rt[i]) }] },
      steps: ['First: the condition is the column "' + T0.cols[j] + '" (' + tw.ct[j] + '), so $' + dfr(cell, tw.ct[j]) + '$.', 'Second: the condition is the row "' + T0.rows[i] + '" (' + tw.rt[i] + '), so $' + dfr(cell, tw.rt[i]) + '$.', 'Same cell, different denominators.'],
      hint: 'The event after the bar is the condition: divide by its total.'
    };
  });

  // ---------------------------------------------------------------- independence
  G('stat.independence', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'product', R.pick(['table', 'product']), R.pick(['table', 'mutex', 'check']));
    if (shape === 'product') {
      var e = R.pick([['a fair coin lands heads', 0.5, 'a fair die shows a 6', '1/6'], ['it rains in Denver tomorrow', 0.3, 'a randomly chosen student in Ohio is left-handed', 0.1], ['a light bulb from machine A fails', 0.02, 'a light bulb from machine B fails', 0.05], ['the first free throw goes in', 0.8, 'a coin flip lands tails', 0.5]]);
      var pa = Q.from(e[1]), pb = Q.from(e[3]), pr = pa.mul(pb);
      return {
        q: 'The events "' + e[0] + '" (probability $' + T.num(e[1]) + '$) and "' + e[2] + '" (probability $' + (typeof e[3] === 'string' ? T.frac(1, 6) : ns(e[3])) + '$) are independent. What is the probability that both happen?',
        a: pr.isTerminating() ? num(qv(pr)) : prob(Number(pr.n), Number(pr.d)),
        steps: ['For independent events, one tells you nothing about the other, so $P(A \\cap B) = P(A) \\cdot P(B)$.', '$' + T.num(e[1]) + ' \\times ' + (typeof e[3] === 'string' ? T.frac(1, 6) : ns(e[3])) + ' = ' + (pr.isTerminating() ? qv(pr) : pr.toTex()) + '$.'],
        hint: 'Independent: multiply the probabilities.'
      };
    }
    if (shape === 'table') {
      var indep = R.coin(), f = R.pick([[1, 4], [2, 5], [1, 3], [3, 5], [3, 10], [2, 3]]), r1 = f[1] * R.int(4, 12), r2 = f[1] * R.int(4, 12);
      var a = r1 * f[0] / f[1], b = r2 * f[0] / f[1];
      if (!indep) { var sh = R.pick([-1, 1]) * R.int(2, 4) * (f[1] === 3 ? 1 : 1); a += sh; if (a <= 0 || a >= r1) a -= 2 * sh; }
      var g = R.pick([['Wears glasses', 'No glasses', 'Left-handed', 'Right-handed'], ['Has a pet', 'No pet', 'Lives in a house', 'Lives in an apartment'], ['Likes math', 'Does not', 'Plays sports', 'Does not play sports']]);
      var ct1 = a + b, N = r1 + r2;
      var html = table(['', g[0], g[1], 'Total'], [[g[2], String(a), String(r1 - a), '<b>' + r1 + '</b>'], [g[3], String(b), String(r2 - b), '<b>' + r2 + '</b>'], ['Total', '<b>' + ct1 + '</b>', '<b>' + (N - ct1) + '</b>', '<b>' + N + '</b>']]);
      var isInd = Q(a, r1).eq(Q(ct1, N));
      return {
        q: 'Are the events "' + g[0].toLowerCase() + '" and "' + g[2].toLowerCase() + '" independent for these ' + N + ' people?' + html,
        a: mcKeep(['Independent', 'Not independent'], isInd ? 0 : 1),
        steps: ['Compare $P(\\text{' + g[0].toLowerCase() + '} \\mid \\text{' + g[2].toLowerCase() + '}) = \\dfrac{' + a + '}{' + r1 + '}' + ' = ' + (Q(a, r1).isTerminating() ? qv(Q(a, r1)) : '\\approx ' + ns(rd(a / r1, 3))) + '$', 'with $P(\\text{' + g[0].toLowerCase() + '}) = \\dfrac{' + ct1 + '}{' + N + '} = ' + (Q(ct1, N).isTerminating() ? qv(Q(ct1, N)) : '\\approx ' + ns(rd(ct1 / N, 3))) + '$.', isInd ? 'They are equal: knowing the person is ' + g[2].toLowerCase() + ' does not change the probability. Independent.' : 'They differ: knowing one event changes the chance of the other. Not independent.'],
        hint: 'Check whether P(A | B) equals P(A).'
      };
    }
    if (shape === 'mutex') {
      var p1 = R.int(2, 5) / 10, p2 = R.int(2, 4) / 10;
      return {
        q: 'Events A and B are mutually exclusive (they cannot both happen), with $P(A) = ' + ns(p1) + '$ and $P(B) = ' + ns(p2) + '$. Are A and B independent?',
        a: mc('No: if A happens, B cannot, so $P(B \\mid A) = 0$, not $' + ns(p2) + '$.', ['Yes: mutually exclusive events are always independent.', 'Yes, because $P(A) + P(B) < 1$.', 'There is not enough information to tell.']),
        steps: ['Independent means knowing A does not change the chance of B.', 'Mutually exclusive means knowing A happened makes B impossible: $P(B \\mid A) = 0$.', 'Since $P(B) = ' + ns(p2) + ' \\ne 0$, they are not independent. Also, $P(A \\cap B) = 0$ but $P(A)P(B) = ' + ns(fix(p1 * p2)) + '$.'],
        hint: 'If A happens, what is the chance of B?'
      };
    }
    var pa2 = R.int(2, 8) / 10, pb2 = R.int(2, 8) / 10, prod = fix(pa2 * pb2), ind2 = R.coin(), pab2 = ind2 ? prod : fix(prod + R.pick([-1, 1]) * R.pick([0.04, 0.06, 0.1]));
    if (pab2 <= 0) pab2 = fix(prod + 0.05);
    return {
      q: '$P(A) = ' + ns(pa2) + '$, $P(B) = ' + ns(pb2) + '$ and $P(A \\cap B) = ' + ns(pab2) + '$. Are A and B independent?',
      a: mcKeep(['Independent', 'Not independent'], ind2 ? 0 : 1),
      steps: ['For independent events, $P(A \\cap B) = P(A) \\cdot P(B)$.', '$P(A) \\cdot P(B) = ' + ns(pa2) + ' \\times ' + ns(pb2) + ' = ' + ns(prod) + '$.', ind2 ? 'That matches $P(A \\cap B)$: independent.' : 'That does not match $P(A \\cap B) = ' + ns(pab2) + '$: not independent.'],
      hint: 'Multiply P(A) and P(B) and compare with P(A and B).'
    };
  });

  // ---------------------------------------------------------------- the general multiplication rule
  G('stat.multiplication-rule', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, R.pick(['with', 'diff']), R.pick(['without', 'diff']), R.pick(['three', 'atleast', 'without']));
    var r = R.int(3, 8), b = R.int(3, 8), n = r + b, col = R.pick([['red', 'blue', 'marbles in a bag'], ['green', 'yellow', 'tiles in a box'], ['chocolate', 'vanilla', 'cookies in a jar']]);
    var setup = 'There are ' + r + ' ' + col[0] + ' and ' + b + ' ' + col[1] + ' ' + col[2] + '. ';
    if (shape === 'with') return {
      q: setup + 'You pick one at random, put it back, and pick again. What is the probability that both are ' + col[0] + '?',
      a: prob(r * r, n * n),
      steps: ['With replacement, the second pick starts fresh: the picks are independent.', '$P(\\text{both}) = \\dfrac{' + r + '}{' + n + '} \\cdot \\dfrac{' + r + '}{' + n + '} = ' + dfr(r * r, n * n) + '$.'],
      hint: 'Putting it back means the second pick has the same chances as the first.'
    };
    if (shape === 'without') return {
      q: setup + 'You pick two at random without putting the first back. What is the probability that both are ' + col[0] + '?',
      a: prob(r * (r - 1), n * (n - 1)),
      steps: ['First pick: $P(\\text{' + col[0] + '}) = \\dfrac{' + r + '}{' + n + '}$.', 'Given the first was ' + col[0] + ', ' + (r - 1) + ' ' + col[0] + ' are left out of ' + (n - 1) + ': $P(\\text{2nd ' + col[0] + '} \\mid \\text{1st ' + col[0] + '}) = \\dfrac{' + (r - 1) + '}{' + (n - 1) + '}$.', 'Multiply: $\\dfrac{' + r + '}{' + n + '} \\cdot \\dfrac{' + (r - 1) + '}{' + (n - 1) + '} = ' + dfr(r * (r - 1), n * (n - 1)) + '$.'],
      hint: 'After the first pick, there is one fewer of that color and one fewer in total.'
    };
    if (shape === 'diff') return {
      q: setup + 'You pick two at random without replacement. What is the probability that the first is ' + col[0] + ' and the second is ' + col[1] + '?',
      a: prob(r * b, n * (n - 1)),
      steps: ['$P(\\text{1st ' + col[0] + '}) = \\dfrac{' + r + '}{' + n + '}$.', 'Then all ' + b + ' ' + col[1] + ' remain, out of ' + (n - 1) + ': $\\dfrac{' + b + '}{' + (n - 1) + '}$.', 'Multiply: $\\dfrac{' + r + '}{' + n + '} \\cdot \\dfrac{' + b + '}{' + (n - 1) + '} = ' + dfr(r * b, n * (n - 1)) + '$.'],
      hint: 'Use P(A and B) = P(A) · P(B | A).'
    };
    if (shape === 'three') return {
      q: setup + 'You pick three at random without replacement. What is the probability that all three are ' + col[1] + '?',
      a: prob(b * (b - 1) * (b - 2), n * (n - 1) * (n - 2)),
      steps: ['Chain the multiplication rule: each pick changes what is left.', '$\\dfrac{' + b + '}{' + n + '} \\cdot \\dfrac{' + (b - 1) + '}{' + (n - 1) + '} \\cdot \\dfrac{' + (b - 2) + '}{' + (n - 2) + '} = ' + dfr(b * (b - 1) * (b - 2), n * (n - 1) * (n - 2)) + '$.'],
      hint: 'Multiply three fractions; both the top and bottom go down by one each time.'
    };
    var none = Q(b * (b - 1), n * (n - 1)), at = Q(1).sub(none);
    return {
      q: setup + 'You pick two at random without replacement. What is the probability that at least one is ' + col[0] + '?',
      a: prob(Number(at.n), Number(at.d)),
      steps: ['"At least one" is the complement of "none".', 'No ' + col[0] + ' means both are ' + col[1] + ': $\\dfrac{' + b + '}{' + n + '} \\cdot \\dfrac{' + (b - 1) + '}{' + (n - 1) + '} = ' + none.toTex() + '$.', 'So $P(\\text{at least one ' + col[0] + '}) = 1 - ' + none.toTex() + ' = ' + at.toTex() + '$.'],
      hint: 'Find the chance of none, and subtract from 1.'
    };
  });

  // ---------------------------------------------------------------- Bayes' rule
  G('stat.bayes-rule', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'freq', R.pick(['direct', 'freq']), R.pick(['machines', 'direct', 'negative']));
    var N = 10000, prev = R.pick([1, 2, 4, 5, 10]), sens = R.pick([80, 90, 95, 99]), fpr = R.pick([2, 5, 8, 10]);
    var D = N * prev / 100, H = N - D, TP = D * sens / 100, FP = H * fpr / 100, FN = D - TP, TN = H - FP;
    var cond = R.pick([['a disease', 'have the disease', 'do not have it', 'disease'], ['a food allergy', 'have the allergy', 'do not have it', 'allergy'], ['a rare gene', 'carry the gene', 'do not carry it', 'gene']]);
    var info = 'A screening test for ' + cond[0] + ' is used in a population where $' + pct(prev) + '$ of people ' + cond[1] + '. The test is positive for $' + pct(sens) + '$ of people who ' + cond[1] + ', and (falsely) positive for $' + pct(fpr) + '$ of people who ' + cond[2] + '.';
    var nf = ['Imagine ' + T.commas(N) + ' people. $' + pct(prev) + '$ of them, ' + T.commas(D) + ', ' + cond[1] + '; ' + T.commas(H) + ' ' + cond[2] + '.', 'Of the ' + T.commas(D) + ': $' + pct(sens) + '$ test positive, which is ' + T.commas(TP) + ' true positives.', 'Of the ' + T.commas(H) + ': $' + pct(fpr) + '$ test positive anyway, which is ' + T.commas(FP) + ' false positives.', 'Positive tests in all: $' + T.commas(TP) + ' + ' + T.commas(FP) + ' = ' + T.commas(TP + FP) + '$.'];
    if (shape === 'freq') return {
      q: info + ' Imagine ' + T.commas(N) + ' people are tested. How many true positives and false positives are there, and what fraction of the positive tests belong to people who ' + cond[1] + '?',
      a: { t: 'multi', parts: [{ label: 'true positives $=$', a: num(TP) }, { label: 'false positives $=$', a: num(FP) }, { label: '$P(\\text{' + cond[3] + '} \\mid +) =$', a: prob(TP, TP + FP) }] },
      steps: nf.concat(['$P = \\dfrac{' + TP + '}{' + (TP + FP) + '}' + (q(TP, TP + FP).toTex() === '\\frac{' + TP + '}{' + (TP + FP) + '}' ? '' : ' = ' + dfr(TP, TP + FP)) + ' \\approx ' + ns(rd(TP / (TP + FP), 3)) + '$.', TP < FP ? 'Most positives are false: the condition is rare, so the few false alarms among the many healthy people outnumber the true cases.' : 'Even with an accurate test, the base rate matters.']),
      hint: 'Start with how many people ' + cond[1] + ', not with the test.'
    };
    if (shape === 'direct') return {
      q: info + ' A randomly chosen person tests positive. What is the probability that the person really does ' + cond[1].replace(/^have/, 'have').replace(/^carry/, 'carry') + '? (A fraction, or a decimal to 3 places.)',
      a: prob(TP, TP + FP),
      steps: nf.concat(['$P(\\text{' + cond[3] + '} \\mid +) = \\dfrac{' + TP + '}{' + (TP + FP) + '} \\approx ' + ns(rd(TP / (TP + FP), 3)) + '$.', 'This is Bayes\' rule: $P(D \\mid +) = \\dfrac{P(D)P(+ \\mid D)}{P(D)P(+ \\mid D) + P(D^{\\prime})P(+ \\mid D^{\\prime})}$.']),
      hint: 'Picture 10,000 people. How many positives are true, and how many are false?'
    };
    if (shape === 'negative') return {
      q: info + ' A randomly chosen person tests <b>negative</b>. What is the probability that the person does in fact ' + cond[1] + '? (A fraction, or a decimal to 4 places.)',
      a: { t: 'num', v: q(FN, FN + TN).toPlain(), tol: 0.00005 },
      steps: ['Imagine ' + T.commas(N) + ' people: ' + T.commas(D) + ' ' + cond[1] + ', ' + T.commas(H) + ' ' + cond[2] + '.', 'Missed cases (false negatives): $' + T.commas(D) + ' - ' + T.commas(TP) + ' = ' + FN + '$.', 'True negatives: $' + T.commas(H) + ' - ' + T.commas(FP) + ' = ' + T.commas(TN) + '$.', '$P = \\dfrac{' + FN + '}{' + FN + ' + ' + TN + '} = ' + dfr(FN, FN + TN) + ' \\approx ' + T.dec(rd(FN / (FN + TN), 4), 4) + '$. A negative result is very reassuring here.'],
      hint: 'Count the negative tests: some come from people with the condition (missed), most from people without it.'
    };
    var sa = R.pick([40, 50, 60, 70]), da = R.pick([1, 2, 3]), db = R.pick([4, 5, 6]), M0 = 10000, Ma = M0 * sa / 100, Mb = M0 - Ma, Fa = Ma * da / 100, Fb = Mb * db / 100;
    return {
      q: 'Machine A makes $' + pct(sa) + '$ of a factory\'s parts, and $' + pct(da) + '$ of its parts are defective. Machine B makes the rest, and $' + pct(db) + '$ of its parts are defective. A part is chosen at random and is defective. What is the probability it came from machine A?',
      a: prob(Fa, Fa + Fb),
      steps: ['Imagine 10,000 parts: ' + T.commas(Ma) + ' from A and ' + T.commas(Mb) + ' from B.', 'Defective from A: $' + ns(da / 100) + ' \\times ' + T.commas(Ma) + ' = ' + Fa + '$. Defective from B: $' + ns(db / 100) + ' \\times ' + T.commas(Mb) + ' = ' + Fb + '$.', '$P(A \\mid \\text{defective}) = \\dfrac{' + Fa + '}{' + Fa + ' + ' + Fb + '} = ' + dfr(Fa, Fa + Fb) + (q(Fa, Fa + Fb).isTerminating() ? '' : ' \\approx ' + ns(rd(Fa / (Fa + Fb), 3))) + '$.'],
      hint: 'Count the defective parts from each machine.'
    };
  });

  // ---------------------------------------------------------------- permutations
  var WORDS = [['LEVEL', [2, 2]], ['APPLE', [2]], ['BANANA', [3, 2]], ['TOOTH', [2, 2]], ['COFFEE', [2, 2]], ['GEESE', [3]], ['BOOKKEEPER', [2, 2, 3]], ['PEPPER', [3, 2]], ['LETTER', [2, 2]]];
  G('stat.permutations', function (R, ctx) {
    var L = lv(ctx), F = U.factorial, shape = by(ctx, R.pick(['line', 'podium']), R.pick(['podium', 'fixed', 'line']), R.pick(['word', 'code', 'together']));
    if (shape === 'line') {
      var n = R.int(4, 7), what = R.pick([['books', 'arranged on a shelf'], ['runners', 'lined up at the start'], ['songs', 'put in order on a playlist'], ['photos', 'hung in a row']]);
      return {
        q: 'In how many different orders can ' + n + ' different ' + what[0] + ' be ' + what[1] + '?',
        a: num(F(n), { form: 'int' }),
        steps: ['There are ' + n + ' choices for the first spot, then ' + (n - 1) + ' for the second, and so on.', 'By the multiplication principle: $' + U.range(n, 1, -1).join(' \\cdot ') + ' = ' + n + '! = ' + T.commas(F(n)) + '$.'],
        hint: 'Count the choices for each position and multiply.'
      };
    }
    if (shape === 'podium') {
      var n2 = R.int(6, 12), r = R.int(2, 4), what2 = R.pick([['runners in a race', 'first, second' + (r > 2 ? ', third' : '') + (r > 3 ? ' and fourth place' : ' place'), 'places'], ['club members', 'a president, a vice president' + (r > 2 ? ', a secretary' : '') + (r > 3 ? ' and a treasurer' : ''), 'offices'], ['dogs in a show', 'the top ' + r + ' ribbons, in order', 'ribbons']]);
      if (what2[0] === 'runners in a race' && r === 2) what2[1] = 'first and second place';
      if (what2[0] === 'club members' && r === 2) what2[1] = 'a president and a vice president';
      return {
        q: 'There are ' + n2 + ' ' + what2[0] + '. In how many ways can ' + what2[1] + ' be awarded (no one gets two)?',
        a: num(U.nPr(n2, r), { form: 'int' }),
        steps: ['Order matters: who gets which ' + what2[2].replace(/s$/, '') + ' makes a different outcome.', 'Choices: $' + U.range(n2, n2 - r + 1, -1).join(' \\cdot ') + ' = ' + T.commas(U.nPr(n2, r)) + '$.', 'This is $_{' + n2 + '}P_{' + r + '} = \\dfrac{' + n2 + '!}{' + (n2 - r) + '!}$.'],
        hint: 'Multiply the number of choices for each position, one fewer each time.'
      };
    }
    if (shape === 'fixed') {
      var n3 = R.int(5, 7), nm = R.pick(['Ana', 'Ben', 'Chloe', 'Dev']);
      return {
        q: n3 + ' friends, including ' + nm + ', line up for a photo. In how many orders can they line up if ' + nm + ' must stand at the left end?',
        a: num(F(n3 - 1), { form: 'int' }),
        steps: [nm + '\'s spot is fixed, so only the other ' + (n3 - 1) + ' friends need to be arranged.', '$' + (n3 - 1) + '! = ' + U.range(n3 - 1, 1, -1).join(' \\cdot ') + ' = ' + T.commas(F(n3 - 1)) + '$.'],
        hint: 'Place ' + nm + ' first; then count the arrangements of everyone else.'
      };
    }
    if (shape === 'word') {
      var w = R.pick(WORDS), n4 = w[0].length, den = w[1].reduce(function (s, k) { return s * F(k); }, 1), ans = F(n4) / den;
      var counts = {}; w[0].split('').forEach(function (ch) { counts[ch] = (counts[ch] || 0) + 1; });
      var reps = Object.keys(counts).filter(function (ch) { return counts[ch] > 1; });
      return {
        q: 'How many different arrangements of the letters in the word ' + w[0] + ' are there?',
        a: num(ans, { form: 'int' }),
        steps: ['If all ' + n4 + ' letters were different, there would be $' + n4 + '! = ' + T.commas(F(n4)) + '$ orders.', 'But ' + reps.map(function (ch) { return ch + ' appears ' + counts[ch] + ' times'; }).join(', ') + '. Swapping identical letters gives the same word, so each word was counted ' + reps.map(function (ch) { return counts[ch] + '!'; }).join(' \\cdot ').replace(/^/, '$').replace(/$/, '$') + ' times.', 'Divide: $\\dfrac{' + n4 + '!}{' + reps.map(function (ch) { return counts[ch] + '!'; }).join(' \\cdot ') + '} = \\dfrac{' + T.commas(F(n4)) + '}{' + den + '} = ' + T.commas(ans) + '$.'],
        hint: 'Count as if the letters were all different, then divide out the swaps of repeated letters.'
      };
    }
    if (shape === 'code') {
      var len = R.int(3, 5), pool = R.pick([[10, 'digits'], [26, 'letters']]);
      return {
        q: 'A code uses ' + len + ' ' + pool[1] + ', and no ' + pool[1].replace(/s$/, '') + ' may be repeated. How many codes are possible?',
        a: num(U.nPr(pool[0], len), { form: 'int' }),
        steps: ['Order matters in a code (123 and 321 are different).', 'Choices: $' + U.range(pool[0], pool[0] - len + 1, -1).join(' \\cdot ') + ' = ' + T.commas(U.nPr(pool[0], len)) + '$.'],
        hint: 'Each new position has one fewer choice, since nothing repeats.'
      };
    }
    var n5 = R.int(5, 7);
    return {
      q: n5 + ' people sit in a row of ' + n5 + ' chairs. Two of them, Sam and Kai, insist on sitting next to each other. How many seatings are possible?',
      a: num(2 * F(n5 - 1), { form: 'int' }),
      steps: ['Glue Sam and Kai into one block. Now there are ' + (n5 - 1) + ' units to arrange: $' + (n5 - 1) + '! = ' + F(n5 - 1) + '$ ways.', 'Inside the block, Sam and Kai can sit in 2 orders.', 'Total: $2 \\cdot ' + (n5 - 1) + '! = ' + T.commas(2 * F(n5 - 1)) + '$.'],
      hint: 'Treat the pair as one unit, then remember the pair has two orders.'
    };
  });

  // ---------------------------------------------------------------- combinations
  G('stat.combinations', function (R, ctx) {
    var L = lv(ctx), C = U.nCr, shape = by(ctx, 'basic', R.pick(['two', 'basic']), R.pick(['atleast', 'two', 'which']));
    if (shape === 'basic') {
      var n = R.int(6, 12), r = R.int(2, 4), w = R.pick([['students', 'a committee of'], ['pizza toppings', 'a pizza with'], ['books', 'a stack to take on vacation with'], ['players', 'a team of']]);
      return {
        q: 'In how many ways can you choose ' + w[1] + ' ' + r + ' from ' + n + ' ' + w[0] + '? (Order does not matter.)',
        a: num(C(n, r), { form: 'int' }),
        steps: ['If order mattered, there would be $' + U.range(n, n - r + 1, -1).join(' \\cdot ') + ' = ' + U.nPr(n, r) + '$ ordered choices.', 'Each group of ' + r + ' appears in $' + r + '! = ' + U.factorial(r) + '$ orders, so divide: $\\binom{' + n + '}{' + r + '} = \\dfrac{' + U.nPr(n, r) + '}{' + U.factorial(r) + '} = ' + C(n, r) + '$.'],
        hint: 'Count ordered choices, then divide by the number of orders of each group.'
      };
    }
    if (shape === 'two') {
      var a = R.int(5, 9), b = R.int(4, 8), x = R.int(1, 3), y = R.int(1, 3), g = R.pick([['juniors', 'seniors'], ['fiction books', 'nonfiction books'], ['red flowers', 'white flowers'], ['sopranos', 'altos']]);
      return {
        q: 'A group has ' + a + ' ' + g[0] + ' and ' + b + ' ' + g[1] + '. In how many ways can you choose ' + x + ' ' + (x === 1 ? g[0].replace(/s$/, '').replace(/ie$/, 'y') : g[0]) + ' and ' + y + ' ' + (y === 1 ? g[1].replace(/s$/, '') : g[1]) + '?',
        a: num(C(a, x) * C(b, y), { form: 'int' }),
        steps: ['Choose the ' + g[0] + ': $\\binom{' + a + '}{' + x + '} = ' + C(a, x) + '$.', 'Choose the ' + g[1] + ': $\\binom{' + b + '}{' + y + '} = ' + C(b, y) + '$.', 'Each first choice pairs with each second choice: $' + C(a, x) + ' \\times ' + C(b, y) + ' = ' + (C(a, x) * C(b, y)) + '$.'],
        hint: 'Choose from each group separately, then multiply.'
      };
    }
    if (shape === 'atleast') {
      var n2 = R.int(8, 12), k = R.int(3, 5), r2 = R.int(3, 4);
      return {
        q: 'A class of ' + n2 + ' includes ' + k + ' students who play chess. In how many ways can a team of ' + r2 + ' be chosen that includes <b>at least one</b> chess player?',
        a: num(C(n2, r2) - C(n2 - k, r2), { form: 'int' }),
        steps: ['All teams: $\\binom{' + n2 + '}{' + r2 + '} = ' + C(n2, r2) + '$.', 'Teams with no chess players (choose only from the other ' + (n2 - k) + '): $\\binom{' + (n2 - k) + '}{' + r2 + '} = ' + C(n2 - k, r2) + '$.', 'At least one = all − none: $' + C(n2, r2) + ' - ' + C(n2 - k, r2) + ' = ' + (C(n2, r2) - C(n2 - k, r2)) + '$.'],
        hint: 'Count the teams with none, and subtract from all teams.'
      };
    }
    var sc = R.pick([['choosing 3 students from 10 to receive identical prizes', false, U.nCr(10, 3)], ['choosing a captain and a co-captain from 10 players', true, U.nPr(10, 2)], ['choosing 4 people from 9 for a study group', false, U.nCr(9, 4)], ['awarding gold, silver and bronze among 8 swimmers', true, U.nPr(8, 3)], ['choosing 2 of 7 flavors for a double scoop in a cup', false, U.nCr(7, 2)]]);
    return {
      q: 'Consider ' + sc[0] + '. Does order matter, and how many ways are there?',
      a: { t: 'multi', parts: [{ label: 'Order matters?', a: mcKeep(['Yes (permutation)', 'No (combination)'], sc[1] ? 0 : 1) }, { label: 'number of ways $=$', a: num(sc[2], { form: 'int' }) }] },
      steps: [sc[1] ? 'Swapping two people gives a different outcome (different roles or places), so order matters.' : 'Swapping two chosen items gives the same group, so order does not matter.', 'Count: $' + T.commas(sc[2]) + '$.'],
      hint: 'Ask: if you swap two of the chosen ones, is it a different outcome?'
    };
  });

  // ---------------------------------------------------------------- probability with counting
  G('stat.counting-probability', function (R, ctx) {
    var L = lv(ctx), C = U.nCr, shape = by(ctx, 'all', R.pick(['exact', 'all']), R.pick(['exact', 'cards', 'line']));
    var a = R.int(4, 8), b = R.int(4, 8), n = a + b, r = R.int(2, 4), g = R.pick([['girls', 'boys', 'students', 'committee'], ['red', 'blue', 'marbles', 'handful'], ['juniors', 'seniors', 'club members', 'team']]);
    if (shape === 'all') return {
      q: 'A group of ' + n + ' ' + g[2] + ' has ' + a + ' ' + g[0] + ' and ' + b + ' ' + g[1] + '. A ' + g[3] + ' of ' + r + ' is chosen at random. What is the probability that all ' + r + ' are ' + g[0] + '?',
      a: prob(C(a, r), C(n, r)),
      steps: ['Every group of ' + r + ' is equally likely: there are $\\binom{' + n + '}{' + r + '} = ' + C(n, r) + '$ of them.', 'Groups made only of ' + g[0] + ': $\\binom{' + a + '}{' + r + '} = ' + C(a, r) + '$.', 'Probability: $\\dfrac{' + C(a, r) + '}{' + C(n, r) + '} = ' + dfr(C(a, r), C(n, r)) + '$.'],
      hint: 'Favorable groups over all possible groups.'
    };
    if (shape === 'exact') {
      var x = R.int(1, r - 1);
      return {
        q: 'A group of ' + n + ' ' + g[2] + ' has ' + a + ' ' + g[0] + ' and ' + b + ' ' + g[1] + '. A ' + g[3] + ' of ' + r + ' is chosen at random. What is the probability that exactly ' + x + ' ' + (x === 1 ? 'is' : 'are') + ' ' + g[0] + '?',
        a: prob(C(a, x) * C(b, r - x), C(n, r)),
        steps: ['All groups: $\\binom{' + n + '}{' + r + '} = ' + C(n, r) + '$.', 'Favorable: choose ' + x + ' of the ' + a + ' ' + g[0] + ' and ' + (r - x) + ' of the ' + b + ' ' + g[1] + ': $\\binom{' + a + '}{' + x + '}\\binom{' + b + '}{' + (r - x) + '} = ' + C(a, x) + ' \\cdot ' + C(b, r - x) + ' = ' + (C(a, x) * C(b, r - x)) + '$.', 'Probability: $\\dfrac{' + (C(a, x) * C(b, r - x)) + '}{' + C(n, r) + '} = ' + dfr(C(a, x) * C(b, r - x), C(n, r)) + '$.'],
        hint: 'Count the ways to fill each part of the group, multiply, then divide by all groups.'
      };
    }
    if (shape === 'cards') {
      var c = R.pick([['hearts', 13, 'both are hearts'], ['aces', 4, 'both are aces'], ['face cards', 12, 'both are face cards'], ['red cards', 26, 'both are red']]);
      return {
        q: 'Two cards are dealt from a well-shuffled standard 52-card deck. What is the probability that ' + c[2] + '?',
        a: prob(C(c[1], 2), C(52, 2)),
        steps: ['All two-card hands: $\\binom{52}{2} = ' + T.commas(C(52, 2)) + '$.', 'Hands with two ' + c[0] + ': $\\binom{' + c[1] + '}{2} = ' + C(c[1], 2) + '$.', 'Probability: $\\dfrac{' + C(c[1], 2) + '}{' + T.commas(C(52, 2)) + '} = ' + dfr(C(c[1], 2), C(52, 2)) + '$. (Same as $\\dfrac{' + c[1] + '}{52} \\cdot \\dfrac{' + (c[1] - 1) + '}{51}$.)'],
        hint: 'Count the hands made only of ' + c[0] + ', over all hands.'
      };
    }
    var n2 = R.int(5, 8);
    return {
      q: n2 + ' friends, including Ava and Liam, line up in a random order. What is the probability that Ava and Liam stand next to each other?',
      a: prob(2 * U.factorial(n2 - 1), U.factorial(n2)),
      steps: ['All orders: $' + n2 + '! = ' + T.commas(U.factorial(n2)) + '$.', 'Orders with them together: treat the pair as one unit, $' + (n2 - 1) + '!$ ways, times 2 orders inside the pair: $' + T.commas(2 * U.factorial(n2 - 1)) + '$.', 'Probability: $\\dfrac{' + T.commas(2 * U.factorial(n2 - 1)) + '}{' + T.commas(U.factorial(n2)) + '} = ' + dfr(2, n2) + '$.'],
      hint: 'Count the favorable orders by gluing the two friends together.'
    };
  });


  // ================================================================ unit 6: random variables

  var RV_CTX = [['the number of pets in a household', 'pets'], ['the number of goals a team scores in a game', 'goals'], ['the number of cars a family owns', 'cars'], ['the number of books a student checks out in a week', 'books'], ['the number of customers in line when a store opens', 'customers']];
  function probRow(R, k) { // k probabilities in hundredths (multiples of 0.05), each at least 0.05, summing to 1
    for (var t = 0; t < 100; t++) {
      var w = [], left = 20; for (var i = 0; i < k - 1; i++) { var x = R.int(1, M.max(1, M.min(8, left - (k - 1 - i)))); w.push(x); left -= x; }
      if (left >= 1 && left <= 9) { w.push(left); return R.shuffle(w).map(function (x) { return Q(x, 20); }); }
    }
    return [Q(1, 10), Q(3, 10), Q(2, 5), Q(1, 5)].slice(0, k);
  }
  function rvTable(xs, ps, name, hideIdx) {
    return table(['$x$'].concat(xs.map(function (x) { return '$' + T.num(x) + '$'; })), [['$P(X = x)$'].concat(ps.map(function (p, i) { return i === hideIdx ? '$?$' : '$' + qv(p) + '$'; }))]);
  }
  G('stat.discrete-random-variables', function (R, ctx) {
    var L = lv(ctx), c = R.pick(RV_CTX), k = R.int(4, 5), xs = U.range(0, k - 1), ps = probRow(R, k), shape = by(ctx, 'missing', R.pick(['atleast', 'missing', 'less']), R.pick(['coins', 'atleast', 'valid']));
    var intro = 'Let $X$ be ' + c[0] + '. ';
    if (shape === 'missing') {
      var h = R.int(0, k - 1), rest = ps.filter(function (_, i) { return i !== h; }), s0 = rest.reduce(function (s, p) { return s.add(p); }, Q(0));
      return {
        q: intro + 'Its probability distribution is shown, with one probability missing. Find the missing probability.' + rvTable(xs, ps, c[1], h),
        a: num(qv(ps[h])),
        steps: ['The probabilities of all the possible values must add up to 1.', 'The known ones add to $' + rest.map(qv).join(' + ') + ' = ' + qv(s0) + '$.', 'Missing: $1 - ' + qv(s0) + ' = ' + qv(ps[h]) + '$.'],
        hint: 'Every probability distribution adds up to 1.'
      };
    }
    if (shape === 'atleast' || shape === 'less') {
      var cut = R.int(1, k - 2), ge = shape === 'atleast', idx = xs.filter(function (x) { return ge ? x >= cut : x < cut; }), ans = idx.reduce(function (s, i) { return s.add(ps[i]); }, Q(0));
      return {
        q: intro + 'Use the distribution to find $P(X ' + (ge ? '\\ge' : '<') + ' ' + cut + ')$.' + rvTable(xs, ps, c[1], -1),
        a: num(qv(ans)),
        steps: ['$X ' + (ge ? '\\ge' : '<') + ' ' + cut + '$ means $X = ' + idx.join('$ or $X = ') + '$.', 'These outcomes cannot happen together, so add: $' + idx.map(function (i) { return qv(ps[i]); }).join(' + ') + ' = ' + qv(ans) + '$.'],
        hint: ge ? '"At least" includes ' + cut + ' itself.' : '"Less than" does not include ' + cut + '.'
      };
    }
    if (shape === 'coins') {
      var n = R.pick([3, 4]), kk = R.int(1, n - 1), C = U.nCr(n, kk);
      return {
        q: 'Flip a fair coin ' + n + ' times, and let $X$ be the number of heads. Find $P(X = ' + kk + ')$.',
        a: prob(C, M.pow(2, n)),
        steps: ['There are $2^{' + n + '} = ' + M.pow(2, n) + '$ equally likely sequences of heads and tails.', 'Sequences with exactly ' + kk + ' heads: choose which ' + kk + ' of the ' + n + ' flips are heads, $\\binom{' + n + '}{' + kk + '} = ' + C + '$.', '$P(X = ' + kk + ') = ' + dfr(C, M.pow(2, n)) + '$.'],
        hint: 'List or count the sequences with exactly ' + kk + ' heads.'
      };
    }
    var bad = R.coin(), ps2 = ps.slice(), j = R.int(0, k - 1);
    if (bad) ps2[j] = ps2[j].add(Q(R.pick([1, 2]), 20));
    var tot = ps2.reduce(function (s, p) { return s.add(p); }, Q(0));
    return {
      q: 'Could this table be a probability distribution for ' + c[0] + '?' + rvTable(xs, ps2, c[1], -1),
      a: mcKeep(['Yes', 'No'], bad ? 1 : 0),
      steps: ['A probability distribution needs every probability between 0 and 1, and a total of exactly 1.', 'Total: $' + ps2.map(qv).join(' + ') + ' = ' + qv(tot) + '$.', bad ? 'The total is not 1, so it is not a valid distribution.' : 'Each is between 0 and 1 and the total is 1, so it is valid.'],
      hint: 'Add the probabilities.'
    };
  });

  // ---------------------------------------------------------------- expected value
  G('stat.expected-value', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'table', R.pick(['game', 'table']), R.pick(['game', 'solve']));
    if (shape === 'table') {
      var c = R.pick(RV_CTX), k = R.int(3, 5), xs = U.range(0, k - 1).map(function (x) { return x + R.pick([0, 0, 1]); }), ps = probRow(R, k);
      xs = U.uniq(xs).length === k ? xs : U.range(0, k - 1);
      var E = xs.reduce(function (s, x, i) { return s.add(ps[i].mul(x)); }, Q(0));
      return {
        q: 'Let $X$ be ' + c[0] + '. Find the expected value $E(X)$.' + rvTable(xs, ps, c[1], -1),
        a: num(qv(E)),
        steps: ['$E(X) = \\sum x \\cdot P(x)$: weight each value by how often it happens.', '$' + xs.map(function (x, i) { return x + '(' + qv(ps[i]) + ')'; }).join(' + ') + ' = ' + qv(E) + '$.', 'In the long run, the average is ' + qv(E) + ' ' + c[1] + ' per observation' + (E.isInt() ? '.' : ', even though no single observation can equal ' + qv(E) + '.')],
        hint: 'Multiply each value by its probability, then add.',
        nolint: ['+ 0']
      };
    }
    if (shape === 'game') {
      var cost = R.pick([1, 2, 3, 5]), w1 = R.pick([10, 20, 25, 50]), p1 = R.pick([Q(1, 20), Q(1, 10), Q(1, 25)]), w2 = R.pick([2, 3, 4, 5]), p2 = R.pick([Q(1, 5), Q(1, 4), Q(3, 10)]);
      var Ew = p1.mul(w1).add(p2.mul(w2)), net = Ew.sub(cost);
      return {
        q: 'A game costs ' + money(cost) + ' to play. You win ' + money(w1) + ' with probability $' + qv(p1) + '$, win ' + money(w2) + ' with probability $' + qv(p2) + '$, and otherwise win nothing. What is your expected <b>net gain</b> per game, in dollars? (A loss is negative.)',
        a: num(qv(net)),
        steps: ['Expected winnings (the "win nothing" outcome adds 0): $' + w1 + '(' + qv(p1) + ') + ' + w2 + '(' + qv(p2) + ') = ' + qv(Ew) + '$.', 'Subtract the cost: $' + qv(Ew) + ' - ' + cost + ' = ' + qv(net) + '$.', net.sign() < 0 ? 'On average you lose ' + money(net.neg().toNumber()) + ' per game.' : net.sign() > 0 ? 'On average you gain ' + money(net.toNumber()) + ' per game.' : 'On average you break even: a fair game.'],
        hint: 'Find the expected winnings, then subtract what it costs to play.'
      };
    }
    var xs3 = [R.int(1, 3), R.int(4, 6), null], ps3 = R.pick([[Q(1, 5), Q(3, 10), Q(1, 2)], [Q(2, 5), Q(2, 5), Q(1, 5)], [Q(1, 4), Q(1, 4), Q(1, 2)], [Q(1, 10), Q(1, 2), Q(2, 5)]]);
    var x3 = R.int(8, 12), E3 = ps3[0].mul(xs3[0]).add(ps3[1].mul(xs3[1])).add(ps3[2].mul(x3)); xs3[2] = x3;
    return {
      q: 'A random variable takes the values $' + xs3[0] + '$, $' + xs3[1] + '$ and $k$ with probabilities $' + qv(ps3[0]) + '$, $' + qv(ps3[1]) + '$ and $' + qv(ps3[2]) + '$. Its expected value is $' + qv(E3) + '$. Find $k$.',
      a: num(x3),
      steps: ['$E(X) = ' + xs3[0] + '(' + qv(ps3[0]) + ') + ' + xs3[1] + '(' + qv(ps3[1]) + ') + ' + qv(ps3[2]) + 'k = ' + qv(E3) + '$.', '$' + qv(ps3[0].mul(xs3[0]).add(ps3[1].mul(xs3[1]))) + ' + ' + qv(ps3[2]) + 'k = ' + qv(E3) + '$.', '$' + qv(ps3[2]) + 'k = ' + qv(E3.sub(ps3[0].mul(xs3[0]).add(ps3[1].mul(xs3[1])))) + '$, so $k = ' + x3 + '$.'],
      hint: 'Write the expected value formula with k in it, then solve.'
    };
  });

  // ---------------------------------------------------------------- spread of a random variable
  function rvVar(xs, ps) {
    var mu = xs.reduce(function (s, x, i) { return s.add(ps[i].mul(x)); }, Q(0));
    var v = xs.reduce(function (s, x, i) { return s.add(ps[i].mul(Q(x).sub(mu).pow(2))); }, Q(0));
    return { mu: mu, v: v };
  }
  function niceRv(R) { // 3 or 4 values with probabilities in tenths and a whole-number mean
    for (var t = 0; t < 200; t++) {
      var k = R.int(3, 4), xs = R.ints(k, 0, 8, true).sort(function (a, b) { return a - b; }), ps = probRow(R, k).map(function (p) { return p; });
      if (!ps.every(function (p) { return Q(p).mul(10).isInt(); })) continue;
      var st = rvVar(xs, ps); if (st.mu.isInt() && !st.v.isZero()) return { xs: xs, ps: ps, mu: st.mu, v: st.v };
    }
    return { xs: [0, 2, 4], ps: [Q(1, 4), Q(1, 2), Q(1, 4)], mu: Q(2), v: Q(2) };
  }
  G('stat.random-variable-spread', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'var', R.pick(['sd', 'var']), R.pick(['compare', 'sd']));
    var d = niceRv(R), mu = d.mu.toNumber(), devs = d.xs.map(function (x) { return x - mu; });
    var tab = rvTable(d.xs, d.ps, '', -1);
    var st = ['Mean: $\\mu = ' + d.xs.map(function (x, i) { return x + '(' + qv(d.ps[i]) + ')'; }).join(' + ') + ' = ' + qv(d.mu) + '$.', 'Squared distances from the mean: $' + devs.map(function (e) { return T.p(e) + '^2 = ' + (e * e); }).join(',\\ ') + '$.', 'Weight them by probability: $\\sigma^2 = ' + devs.map(function (e, i) { return (e * e) + '(' + qv(d.ps[i]) + ')'; }).join(' + ') + ' = ' + qv(d.v) + '$.'];
    if (shape === 'var') return {
      q: 'Find the variance $\\sigma^2$ of the random variable $X$.' + tab,
      a: num(qv(d.v)),
      steps: st,
      hint: 'Find the mean, then average the squared distances from it, weighted by probability.',
      nolint: ['+ 0']
    };
    if (shape === 'sd') {
      var sd = M.sqrt(d.v.toNumber());
      return {
        q: 'Find the standard deviation $\\sigma$ of $X$. Round to two decimal places.' + tab,
        a: num(ns(rd(sd, 2)), { tol: 0.01 }),
        steps: st.concat(['$\\sigma = \\sqrt{' + qv(d.v) + '} \\approx ' + ns(rd(sd, 2)) + '$.']),
        hint: 'Find the variance first, then take its square root.',
        nolint: ['+ 0']
      };
    }
    var m0 = R.int(3, 6) * 10, a = R.pick([5, 10]), b = R.pick([20, 25, 30]);
    var A = [[m0 - a, m0 + a], [Q(1, 2), Q(1, 2)]], B = [[m0 - b, m0 + b], [Q(1, 2), Q(1, 2)]], flip = R.coin();
    var P = flip ? B : A, Qx = flip ? A : B;
    return {
      q: 'Game P pays ' + money(P[0][0]) + ' or ' + money(P[0][1]) + ', each with probability $\\frac{1}{2}$. Game Q pays ' + money(Qx[0][0]) + ' or ' + money(Qx[0][1]) + ', each with probability $\\frac{1}{2}$. Find each game\'s standard deviation of payout. Which game is riskier?',
      a: { t: 'multi', parts: [{ label: '$\\sigma_P =$', a: num(flip ? b : a) }, { label: '$\\sigma_Q =$', a: num(flip ? a : b) }, { label: 'Riskier game:', a: mcKeep(['Game P', 'Game Q'], flip ? 0 : 1) }] },
      steps: ['Both games have the same mean: ' + money(m0) + '.', 'Game P: each payout is ' + money(flip ? b : a) + ' from the mean, so $\\sigma^2 = ' + (flip ? b : a) + '^2$ and $\\sigma_P = ' + (flip ? b : a) + '$.', 'Game Q: each payout is ' + money(flip ? a : b) + ' from the mean, so $\\sigma_Q = ' + (flip ? a : b) + '$.', 'The larger standard deviation means outcomes swing farther from the mean: game ' + (flip ? 'P' : 'Q') + ' is riskier.'],
      hint: 'Every payout here is the same distance from the mean.'
    };
  });

  // ---------------------------------------------------------------- sums and differences of random variables
  var TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25], [20, 21, 29]];
  var COMB_CTX = [
    ['the time to drive to the train station', 'the train ride', 'minutes', 'the total commute time'],
    ['the weight of the cereal in a box', 'the weight of the empty box', 'grams', 'the total weight of a filled box'],
    ['a student\'s score on part 1 of a test', 'the score on part 2', 'points', 'the total score'],
    ['the length of a randomly chosen board', 'the length of a second, independent board', 'cm', 'the total length when they are laid end to end']
  ];
  G('stat.combining-random-variables', function (R, ctx) {
    var L = lv(ctx), c = R.pick(COMB_CTX), tr = R.pick(TRIPLES), sw = R.coin(), sx = sw ? tr[1] : tr[0], sy = sw ? tr[0] : tr[1], mx = R.int(20, 90), my = R.int(10, 60);
    var shape = by(ctx, 'means', R.pick(['sum', 'diff']), R.pick(['many', 'linear', 'diff']));
    var intro = 'Let $X$ be ' + c[0] + ' (mean ' + mx + ', standard deviation ' + sx + ' ' + c[2] + ') and $Y$ be ' + c[1] + ' (mean ' + my + ', standard deviation ' + sy + ' ' + c[2] + '). Assume $X$ and $Y$ are independent. ';
    if (shape === 'means') return {
      q: intro + 'Find the mean of $X + Y$ and the mean of $X - Y$.',
      a: { t: 'multi', parts: [{ label: '$E(X + Y) =$', a: num(mx + my) }, { label: '$E(X - Y) =$', a: num(mx - my) }] },
      steps: ['Means add and subtract just like the variables: $E(X + Y) = E(X) + E(Y) = ' + mx + ' + ' + my + ' = ' + (mx + my) + '$.', '$E(X - Y) = E(X) - E(Y) = ' + mx + ' - ' + my + ' = ' + (mx - my) + '$.'],
      hint: 'The mean of a sum is the sum of the means.'
    };
    if (shape === 'sum' || shape === 'diff') {
      var plus = shape === 'sum';
      return {
        q: intro + 'Find the standard deviation of $X ' + (plus ? '+' : '-') + ' Y$' + (plus ? ', ' + c[3] : '') + '.',
        a: num(tr[2]),
        steps: ['For independent variables, <b>variances</b> add, ' + (plus ? 'for a sum' : 'even for a difference') + ': $\\sigma^2_{X ' + (plus ? '+' : '-') + ' Y} = \\sigma_X^2 + \\sigma_Y^2$.', '$' + sx + '^2 + ' + sy + '^2 = ' + (sx * sx) + ' + ' + (sy * sy) + ' = ' + (tr[2] * tr[2]) + '$.', 'Standard deviation: $\\sqrt{' + (tr[2] * tr[2]) + '} = ' + tr[2] + '$ ' + c[2] + '.', plus ? 'Note: not $' + sx + ' + ' + sy + ' = ' + (sx + sy) + '$. Standard deviations do not add.' : 'Subtracting a random amount adds uncertainty, so the variances still add.'],
        hint: 'Square the standard deviations, add, then take the square root.'
      };
    }
    if (shape === 'many') {
      var n = R.pick([4, 9, 16]), s = R.pick([2, 3, 5, 6]), m = R.int(10, 30);
      return {
        q: 'Each bag of apples from an orchard has a weight with mean ' + m + ' pounds and standard deviation ' + s + ' pounds, independently of the other bags. Find the mean and the standard deviation of the total weight of ' + n + ' bags.',
        a: { t: 'multi', parts: [{ label: 'mean $=$', a: num(m * n) }, { label: 'standard deviation $=$', a: num(s * M.sqrt(n)) }] },
        steps: ['Mean of the total: $' + n + ' \\times ' + m + ' = ' + (m * n) + '$ pounds.', 'Variances add: $' + n + ' \\times ' + s + '^2 = ' + (n * s * s) + '$.', 'Standard deviation: $\\sqrt{' + (n * s * s) + '} = ' + (s * M.sqrt(n)) + '$ pounds, which is $' + s + '\\sqrt{' + n + '}$, not $' + n + ' \\times ' + s + '$.'],
        hint: 'Add ' + n + ' equal variances, then take the square root.'
      };
    }
    var bb = R.pick([2, 3, 1.5, 0.5]), aa = R.int(5, 40);
    return {
      q: 'A random variable $X$ has mean ' + mx + ' and standard deviation ' + sx + '. Let $W = ' + aa + ' + ' + ns(bb) + 'X$. Find the mean and the standard deviation of $W$.',
      a: { t: 'multi', parts: [{ label: '$E(W) =$', a: num(fix(aa + bb * mx)) }, { label: '$\\sigma_W =$', a: num(fix(bb * sx)) }] },
      steps: ['The mean follows the formula: $' + aa + ' + ' + ns(bb) + '(' + mx + ') = ' + ns(fix(aa + bb * mx)) + '$.', 'Adding ' + aa + ' shifts but does not spread; multiplying by ' + ns(bb) + ' multiplies the spread.', '$\\sigma_W = ' + ns(bb) + ' \\times ' + sx + ' = ' + ns(fix(bb * sx)) + '$.'],
      hint: 'A shift moves the mean only; a multiplier changes both the mean and the spread.'
    };
  });

  // ---------------------------------------------------------------- the binomial distribution
  var BIN_NICE = [[100, 0.2, 4], [100, 0.5, 5], [36, 0.5, 3], [64, 0.5, 4], [400, 0.1, 6], [225, 0.2, 6], [900, 0.1, 9], [144, 0.5, 6], [16, 0.5, 2], [400, 0.5, 10], [625, 0.2, 10]];
  G('stat.binomial-distribution', function (R, ctx) {
    var L = lv(ctx), C = U.nCr, shape = by(ctx, 'coin', R.pick(['dec', 'meansd']), R.pick(['atleast1', 'atmost1', 'bins']));
    if (shape === 'coin') {
      var kind = R.pick(['coin', 'die']), n = kind === 'coin' ? R.int(4, 6) : R.int(3, 4), p = kind === 'coin' ? Q(1, 2) : Q(1, 6), k = R.int(1, n - 1);
      var pr = Q(C(n, k)).mul(p.pow(k)).mul(Q(1).sub(p).pow(n - k));
      var what = kind === 'coin' ? ['Flip a fair coin ' + n + ' times', 'heads'] : ['Roll a fair die ' + n + ' times', 'sixes'];
      return {
        q: what[0] + '. What is the probability of exactly ' + k + ' ' + what[1] + '?',
        a: prob(Number(pr.n), Number(pr.d)),
        steps: ['Each trial is independent with $p = ' + p.toTex() + '$, and $n = ' + n + '$ is fixed: binomial.', '$P(X = ' + k + ') = \\binom{' + n + '}{' + k + '}p^{' + k + '}(1 - p)^{' + (n - k) + '} = ' + C(n, k) + ' \\cdot ' + T.pow(p, k) + ' \\cdot ' + T.pow(Q(1).sub(p), n - k) + '$.', '$= ' + pr.toTex() + '$.', 'The $\\binom{' + n + '}{' + k + '} = ' + C(n, k) + '$ counts the different orders in which the ' + k + ' ' + what[1] + ' can appear.'],
        hint: 'Use C(n, k) · p^k · (1 − p)^(n − k).'
      };
    }
    if (shape === 'dec' || shape === 'atleast1' || shape === 'atmost1') {
      var n2 = R.int(4, 6), p2 = R.pick([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8]), q2 = fix(1 - p2), pq = Q.from(p2), qq2 = Q.from(q2), w = R.pick([['A basketball player makes each free throw', 'free throws', 'shots'], ['Each seed sprouts', 'seeds', 'seeds planted'], ['Each customer buys a drink', 'customers', 'customers']]);
      var setup = w[0] + ' with probability $' + ns(p2) + '$, independently. Out of ' + n2 + ' ' + w[2] + ', let $X$ count the successes. ';
      if (shape === 'dec') {
        var k2 = R.int(1, n2 - 1), pr2 = Q(C(n2, k2)).mul(pq.pow(k2)).mul(qq2.pow(n2 - k2));
        return {
          q: setup + 'Find $P(X = ' + k2 + ')$. (Give at least 3 decimal places.)',
          a: { t: 'num', v: qv(pr2), tol: 0.0005 },
          steps: ['Binomial with $n = ' + n2 + '$ and $p = ' + ns(p2) + '$.', '$P(X = ' + k2 + ') = \\binom{' + n2 + '}{' + k2 + '}(' + ns(p2) + ')^{' + k2 + '}(' + ns(q2) + ')^{' + (n2 - k2) + '}$.', '$= ' + C(n2, k2) + ' \\times ' + qv(pq.pow(k2)) + ' \\times ' + qv(qq2.pow(n2 - k2)) + ' = ' + qv(pr2) + '$.'],
          hint: 'Count the orders with C(n, k), then multiply the probabilities of one such order.'
        };
      }
      if (shape === 'atleast1') {
        var none = qq2.pow(n2), al = Q(1).sub(none);
        return {
          q: setup + 'Find the probability of at least one success.',
          a: { t: 'num', v: qv(al), tol: 0.0005 },
          steps: ['"At least one" is the complement of "none".', '$P(X = 0) = (' + ns(q2) + ')^{' + n2 + '} = ' + qv(none) + '$.', '$P(X \\ge 1) = 1 - ' + qv(none) + ' = ' + qv(al) + '$.'],
          hint: 'Find P(no successes) and subtract it from 1.'
        };
      }
      var p0 = qq2.pow(n2), p1 = Q(n2).mul(pq).mul(qq2.pow(n2 - 1)), am = p0.add(p1);
      return {
        q: setup + 'Find $P(X \\le 1)$.',
        a: { t: 'num', v: qv(am), tol: 0.0005 },
        steps: ['$P(X \\le 1) = P(X = 0) + P(X = 1)$.', '$P(X = 0) = (' + ns(q2) + ')^{' + n2 + '} = ' + qv(p0) + '$.', '$P(X = 1) = ' + n2 + '(' + ns(p2) + ')(' + ns(q2) + ')^{' + (n2 - 1) + '} = ' + qv(p1) + '$.', 'Sum: $' + qv(am) + '$.'],
        hint: '"At most 1" means 0 or 1 successes.'
      };
    }
    if (shape === 'meansd') {
      var b = R.pick(BIN_NICE), W2 = [['A survey finds that a fraction', 'of voters support a measure', 'voters', 'supporters'], ['A website finds that a fraction', 'of visitors click an ad', 'visitors', 'visitors who click']];
      if (b[1] <= 0.2) W2.push(['A factory knows that a fraction', 'of its bulbs are defective', 'bulbs', 'defective bulbs']);
      var w2 = R.pick(W2);
      return {
        q: w2[0] + ' $p = ' + ns(b[1]) + '$ ' + w2[1] + '. In a random sample of ' + b[0] + ' ' + w2[2] + ', let $X$ be the number of ' + w2[3] + '. Find the mean and the standard deviation of $X$.',
        a: { t: 'multi', parts: [{ label: 'mean $=$', a: num(fix(b[0] * b[1])) }, { label: 'standard deviation $=$', a: num(b[2]) }] },
        steps: ['Mean: $np = ' + b[0] + ' \\times ' + ns(b[1]) + ' = ' + ns(fix(b[0] * b[1])) + '$.', 'Standard deviation: $\\sqrt{np(1 - p)} = \\sqrt{' + b[0] + ' \\times ' + ns(b[1]) + ' \\times ' + ns(fix(1 - b[1])) + '} = \\sqrt{' + ns(b[2] * b[2]) + '} = ' + b[2] + '$.'],
        hint: 'Mean np; variance np(1 − p).'
      };
    }
    var sc = R.pick([
      ['You draw 5 cards from a deck without replacement and count the hearts.', 'No: without replacement the trials are not independent (the chance of a heart changes after each draw).'],
      ['You roll a die until you get a 6, and count the rolls.', 'No: the number of trials is not fixed in advance.'],
      ['You flip a fair coin 10 times and count the heads.', 'Yes: 10 fixed, independent trials, each with the same chance of heads.'],
      ['20 randomly chosen people from a large city are asked whether they own a bike; you count the yes answers.', 'Yes: n = 20 is fixed, and in a large population the answers are close to independent with the same p.']
    ]);
    return {
      q: 'Is a binomial model appropriate? ' + sc[0],
      a: mc(sc[1], ['Yes: 10 fixed, independent trials, each with the same chance of heads.', 'No: the number of trials is not fixed in advance.', 'No: without replacement the trials are not independent (the chance of a heart changes after each draw).', 'Yes: n = 20 is fixed, and in a large population the answers are close to independent with the same p.'].filter(function (x) { return x !== sc[1]; })),
      steps: ['Check the four conditions: two outcomes (success or failure), independent trials, a fixed number n of trials, and the same probability p each time.', sc[1]],
      hint: 'Check: fixed n? independent? same p? two outcomes?'
    };
  });

  // ---------------------------------------------------------------- the geometric distribution
  G('stat.geometric-distribution', function (R, ctx) {
    var L = lv(ctx), pp = R.pick([[Q(1, 6), 'Roll a fair die until it shows a 6', 'roll'], [Q(1, 4), 'Spin a spinner with 4 equal sections until it lands on the red one', 'spin'], [Q(1, 5), 'Guess on 5-choice quiz questions until a guess is right', 'guess'], [Q(1, 2), 'Flip a fair coin until it lands heads', 'flip'], [Q(3, 10), 'A player who makes 30% of free throws shoots until one goes in', 'shot'], [Q(1, 3), 'Roll a fair die until it shows a 5 or a 6', 'roll'], [Q(1, 10), 'Buy cereal boxes until one holds the prize (1 box in 10 does)', 'box'], [Q(2, 5), 'A player who makes 40% of three-point shots shoots until one goes in', 'shot'], [Q(1, 8), 'Call people until one answers a phone survey (1 in 8 do)', 'call']]);
    var p = pp[0], qq0 = Q(1).sub(p), shape = by(ctx, 'first', R.pick(['mean', 'more', 'first']), R.pick(['within', 'more']));
    var setup = pp[1] + '. Each ' + pp[2] + ' succeeds with probability $p = ' + p.toTex() + '$, independently. Let $X$ be the number of the ' + pp[2] + ' on which the first success happens. ';
    if (shape === 'first') {
      var k = R.int(2, 5), pr = qq0.pow(k - 1).mul(p);
      return {
        q: setup + 'Find $P(X = ' + k + ')$.',
        a: prob(Number(pr.n), Number(pr.d)),
        steps: ['The first success on ' + pp[2] + ' ' + k + ' means ' + (k - 1) + ' failure' + (k > 2 ? 's' : '') + ', then a success.', '$P(X = ' + k + ') = (1 - p)^{' + (k - 1) + '}p = ' + T.pow(qq0, k - 1) + ' \\cdot ' + p.toTex() + ' = ' + pr.toTex() + '$.'],
        hint: 'Fail, fail, …, then succeed: multiply.'
      };
    }
    if (shape === 'mean') return {
      q: setup + 'On average, on which ' + pp[2] + ' does the first success happen? (Find $E(X)$.)',
      a: num(qv(p.inv())),
      steps: ['For a geometric variable, $E(X) = \\dfrac{1}{p}$.', '$\\dfrac{1}{' + p.toTex() + '} = ' + qv(p.inv()) + '$.', 'This makes sense: if a success happens $' + p.toTex() + '$ of the time, you wait about ' + qv(p.inv()) + ' tries on average.'],
      hint: 'The rarer the success, the longer the wait: E(X) = 1/p.'
    };
    var k2 = R.int(2, 4);
    if (shape === 'more') {
      var pm = qq0.pow(k2);
      return {
        q: setup + 'Find $P(X > ' + k2 + ')$, the probability that the first ' + k2 + ' ' + pp[2] + 's are all failures.',
        a: prob(Number(pm.n), Number(pm.d)),
        steps: ['$X > ' + k2 + '$ means the first ' + k2 + ' ' + pp[2] + 's all fail.', '$P(X > ' + k2 + ') = (1 - p)^{' + k2 + '} = ' + T.pow(qq0, k2) + ' = ' + pm.toTex() + '$.'],
        hint: 'More than ' + k2 + ' tries are needed exactly when the first ' + k2 + ' all fail.'
      };
    }
    var pw = Q(1).sub(qq0.pow(k2));
    return {
      q: setup + 'Find $P(X \\le ' + k2 + ')$, the probability of a success within the first ' + k2 + ' ' + pp[2] + 's.',
      a: prob(Number(pw.n), Number(pw.d)),
      steps: ['The complement of "a success within ' + k2 + '" is "the first ' + k2 + ' all fail": $' + T.pow(qq0, k2) + ' = ' + qq0.pow(k2).toTex() + '$.', '$P(X \\le ' + k2 + ') = 1 - ' + qq0.pow(k2).toTex() + ' = ' + pw.toTex() + '$.'],
      hint: 'Use the complement: 1 − P(all of the first ' + k2 + ' fail).'
    };
  });

  // ---------------------------------------------------------------- continuous random variables
  G('stat.continuous-distributions', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'uniform', R.pick(['point', 'uniform', 'height']), R.pick(['triangle', 'point']));
    var w = R.pick([['A bus arrives at a random time', 'minutes from now', 'the waiting time'], ['A spinner\'s pointer stops at a random angle', 'degrees', 'the angle'], ['A random number generator picks a real number', '', 'the number']]);
    var a = 0, b = R.pick([10, 20, 30, 40, 60]), unit = w[1];
    if (w[1] === 'degrees') b = 360;
    if (shape === 'uniform') {
      var c = R.int(1, b / 5 - 1) * 5, d = R.int(c / 5 + 1, b / 5) * 5;
      if (d === c) d = c + 5;
      return {
        q: w[0] + ' between ' + a + ' and ' + b + (unit ? ' ' + unit : '') + ', with all values equally likely (a uniform distribution). Find the probability that ' + w[2] + ' is between ' + c + ' and ' + d + '.',
        a: prob(d - c, b - a),
        steps: ['The density is a flat line at height $\\dfrac{1}{' + (b - a) + '}$, so the total area is 1.', 'Probability = area of the rectangle from ' + c + ' to ' + d + ': width $' + (d - c) + '$ times height $\\dfrac{1}{' + (b - a) + '}$.', '$P = \\dfrac{' + (d - c) + '}{' + (b - a) + '} = ' + dfr(d - c, b - a) + '$.'],
        hint: 'For a uniform distribution, probability is the fraction of the interval covered.'
      };
    }
    if (shape === 'height') return {
      q: w[0] + ' between 0 and ' + b + (unit ? ' ' + unit : '') + ', all values equally likely. What is the height of the density curve?',
      a: prob(1, b),
      steps: ['The total area under a density curve must be 1.', 'A rectangle of width ' + b + ' has area 1 when its height is $\\dfrac{1}{' + b + '}$.'],
      hint: 'Width times height must equal 1.'
    };
    if (shape === 'point') {
      var c2 = R.int(1, b / 5 - 1) * 5;
      return {
        q: w[0] + ' between 0 and ' + b + (unit ? ' ' + unit : '') + ', all values equally likely. Find $P(X = ' + c2 + ')$ and $P(X \\le ' + c2 + ')$, where $X$ is ' + w[2] + '.',
        a: { t: 'multi', parts: [{ label: '$P(X = ' + c2 + ') =$', a: num(0) }, { label: '$P(X \\le ' + c2 + ') =$', a: prob(c2, b) }] },
        steps: ['For a continuous variable, probability is area. A single point is a line with width 0, so its area is 0: $P(X = ' + c2 + ') = 0$.', 'So including the endpoint changes nothing: $P(X \\le ' + c2 + ') = P(X < ' + c2 + ') = \\dfrac{' + c2 + '}{' + b + '}' + (q(c2, b).d === BigInt(b) ? '' : ' = ' + dfr(c2, b)) + '$.'],
        hint: 'What is the area above a single point?'
      };
    }
    var cc = R.pick([2, 4, 5, 10]), a2 = R.int(1, cc - 1) * (cc === 2 ? 0.5 : 1);
    if (cc === 2) a2 = R.pick([0.5, 1, 1.5]);
    var ans = Q.from(a2).pow(2).div(cc * cc);
    return {
      q: 'A random variable $X$ has density $f(x) = \\dfrac{2x}{' + (cc * cc) + '}$ for $0 \\le x \\le ' + cc + '$ (a triangle). Find $P(X < ' + ns(a2) + ')$.',
      a: prob(Number(ans.n), Number(ans.d)),
      steps: ['Check: the triangle has base ' + cc + ' and height $f(' + cc + ') = \\dfrac{' + (2 * cc) + '}{' + (cc * cc) + '}$, so its area is $\\frac{1}{2} \\cdot ' + cc + ' \\cdot \\dfrac{' + (2 * cc) + '}{' + (cc * cc) + '} = 1$.', 'The area to the left of ' + ns(a2) + ' is a smaller triangle: base ' + ns(a2) + ', height $f(' + ns(a2) + ') = \\dfrac{' + ns(fix(2 * a2)) + '}{' + (cc * cc) + '}$.', 'Area: $\\frac{1}{2} \\cdot ' + ns(a2) + ' \\cdot \\dfrac{' + ns(fix(2 * a2)) + '}{' + (cc * cc) + '} = ' + ans.toTex() + '$.'],
      hint: 'Probability is the area of the triangle to the left of the value.'
    };
  });

  // ---------------------------------------------------------------- decisions with expected value
  G('stat.expected-value-decisions', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'insure', R.pick(['compare', 'insure']), R.pick(['fair', 'warranty', 'compare']));
    if (shape === 'insure') {
      var it = R.pick([[1000, 'phone', 'is lost or broken'], [2000, 'laptop', 'is stolen'], [5000, 'motorcycle', 'is stolen'], [20000, 'car', 'is totaled in an accident']]), loss = it[0], p = R.pick([Q(1, 100), Q(1, 50), Q(1, 200), Q(1, 20)]), el = p.mul(loss), prem = el.toNumber() + R.pick([10, 15, 20, 25, 40, 50]);
      return {
        q: 'An insurance company sells a one-year policy for ' + money(prem) + '. It pays ' + money(loss) + ' if the insured ' + it[1] + ' ' + it[2] + ', which happens with probability $' + p.toTex() + '$. What is the company\'s expected profit per policy?',
        a: num(qv(Q(prem).sub(el))),
        steps: ['Expected payout: $' + p.toTex() + ' \\times ' + T.commas(loss) + ' = ' + qv(el) + '$ dollars.', 'Expected profit: $' + prem + ' - ' + qv(el) + ' = ' + qv(Q(prem).sub(el)) + '$ dollars per policy.', 'Over many policies, the company earns about ' + money(Q(prem).sub(el).toNumber()) + ' each. A single customer pays more than their expected loss in exchange for protection from a large, rare loss.'],
        hint: 'Expected payout = probability × payout. Profit = premium − expected payout.'
      };
    }
    if (shape === 'compare') {
      var A = [R.pick([100, 200, 500]), R.pick([Q(1, 20), Q(1, 10), Q(1, 50)])], B = [R.pick([10, 20, 30]), R.pick([Q(1, 2), Q(1, 4), Q(2, 5)])];
      var eA = A[1].mul(A[0]), eB = B[1].mul(B[0]);
      if (eA.eq(eB)) B[0] += 10, eB = B[1].mul(B[0]);
      return {
        q: 'Both games cost the same to play. Game A pays ' + money(A[0]) + ' with probability $' + A[1].toTex() + '$ (otherwise nothing). Game B pays ' + money(B[0]) + ' with probability $' + B[1].toTex() + '$ (otherwise nothing). Find each game\'s expected payout. Which is better in the long run?',
        a: { t: 'multi', parts: [{ label: 'Game A $=$', a: num(qv(eA)) }, { label: 'Game B $=$', a: num(qv(eB)) }, { label: 'Better in the long run:', a: mcKeep(['Game A', 'Game B'], eA.gt(eB) ? 0 : 1) }] },
        steps: ['Game A: $' + A[1].toTex() + ' \\times ' + A[0] + ' = ' + qv(eA) + '$.', 'Game B: $' + B[1].toTex() + ' \\times ' + B[0] + ' = ' + qv(eB) + '$.', 'Over many plays, game ' + (eA.gt(eB) ? 'A' : 'B') + ' pays more on average' + (eA.gt(eB) ? ', even though it rarely wins.' : ', even though its prize is smaller.')],
        hint: 'Expected payout = prize × probability of winning.'
      };
    }
    if (shape === 'fair') {
      var pr = [[Q(1, 10), R.pick([20, 30, 50])], [Q(3, 10), R.pick([2, 4, 5])]], fair = pr[0][0].mul(pr[0][1]).add(pr[1][0].mul(pr[1][1]));
      return {
        q: 'A carnival game pays ' + money(pr[0][1]) + ' with probability $' + qv(pr[0][0]) + '$, pays ' + money(pr[1][1]) + ' with probability $' + qv(pr[1][0]) + '$, and otherwise pays nothing. What price to play would make the game fair (expected net gain of 0)?',
        a: num(qv(fair)),
        steps: ['A fair price equals the expected payout.', '$' + pr[0][1] + '(' + qv(pr[0][0]) + ') + ' + pr[1][1] + '(' + qv(pr[1][0]) + ') = ' + qv(fair) + '$.', 'So a price of ' + money(fair.toNumber()) + ' makes the expected net gain 0.'],
        hint: 'Find the expected payout.'
      };
    }
    var W = R.pick([60, 80, 100, 120]), cst = R.pick([300, 400, 500, 600]), pp = R.pick([Q(1, 10), Q(3, 20), Q(1, 5), Q(1, 4)]), ec = pp.mul(cst);
    return {
      q: 'An extended warranty on a laptop costs ' + money(W) + '. Without it, a repair costing ' + money(cst) + ' is needed with probability $' + qv(pp) + '$. What is the expected repair cost without the warranty, and is the warranty worth it on average?',
      a: { t: 'multi', parts: [{ label: 'expected cost $=$', a: num(qv(ec)) }, { label: 'Worth it on average?', a: mcKeep(['Yes', 'No'], ec.gt(W) ? 0 : 1) }] },
      steps: ['Expected repair cost: $' + qv(pp) + ' \\times ' + cst + ' = ' + qv(ec) + '$ dollars.', ec.gt(W) ? 'That is more than the ' + money(W) + ' warranty, so on average the warranty saves money.' : 'That is less than the ' + money(W) + ' warranty, so on average the warranty costs more than it saves (though it does remove the risk of a big bill).'],
      hint: 'Compare the warranty price with the expected repair cost.'
    };
  });


  // ================================================================ unit 7: sampling distributions

  // ---------------------------------------------------------------- simulation
  var SIMS = [
    { claim: 'A coin is supposed to be fair. In 20 flips it landed heads {obs} times.', n: 20, p: 0.5, what: 'heads in 20 flips of a fair coin', model: 'the coin is fair' },
    { claim: 'A basketball player says she makes 70% of her free throws. In her next 20 shots she makes {obs}.', n: 20, p: 0.7, what: 'shots made out of 20 by a 70% shooter', model: 'she is a 70% shooter' },
    { claim: 'A die is supposed to be fair. In 30 rolls it showed a 1 on {obs} rolls.', n: 30, p: 1 / 6, what: 'ones in 30 rolls of a fair die', model: 'the die is fair' },
    { claim: 'A company says 40% of shoppers prefer its brand. In a random sample of 25 shoppers, {obs} prefer it.', n: 25, p: 0.4, what: 'shoppers out of 25 who prefer the brand when the true rate is 40%', model: 'the 40% claim is right' }
  ];
  G('stat.simulation-models', function (R, ctx) {
    var L = lv(ctx), S0 = R.pick(SIMS), runs = 100, counts = [], i, j;
    for (i = 0; i < runs; i++) { var c = 0; for (j = 0; j < S0.n; j++) if (R.next() < S0.p) c++; counts.push(c); }
    var lo = M.min.apply(null, counts), hi = M.max.apply(null, counts), freq = {}; counts.forEach(function (c) { freq[c] = (freq[c] || 0) + 1; });
    var ex = S0.n * S0.p, obs, tail, up, tries = 0;
    do {
      up = R.coin(); var d = R.int(2, 7); obs = M.round(up ? ex + d : ex - d); if (obs < 0 || obs > S0.n) continue;
      tail = counts.filter(function (c) { return up ? c >= obs : c <= obs; }).length;
    } while ((tail === undefined || (tail > 3 && tail < 12) || obs < 0 || obs > S0.n) && tries++ < 40);
    if (tail === undefined) { up = true; obs = M.ceil(ex) + 3; tail = counts.filter(function (c) { return c >= obs; }).length; }
    var vals = U.range(lo, hi), tab = table(['Count'].concat(vals.map(String)), [['Runs'].concat(vals.map(function (v) { return String(freq[v] || 0); }))], 'Results of ' + runs + ' simulated runs');
    var claim = S0.claim.replace('{obs}', obs), rare = tail <= 3, cmp = up ? 'at least' : 'at most';
    var intro = claim + ' To see what happens if ' + S0.model + ', a computer simulated the number of ' + S0.what + ', 100 times.' + tab;
    var tailSteps = ['Results at least as extreme as ' + obs + ' (' + cmp + ' ' + obs + '): ' + (vals.filter(function (v) { return up ? v >= obs : v <= obs; }).map(function (v) { return freq[v] || 0; }).join(' + ') || '0') + ' = ' + tail + ' runs.'];
    var concl = rare ? 'A result like ' + obs + ' almost never happens when ' + S0.model + ', so the data give convincing evidence against the model.' : 'A result like ' + obs + ' happens fairly often when ' + S0.model + ', so the data are consistent with the model. (That does not prove the model is right.)';
    var cMc = rare ? mc('The result would be unusual if ' + S0.model + ', so it is evidence against that claim.', ['The result proves the claim is false.', 'The result is consistent with the claim, which proves it is true.', 'The simulation cannot be compared with real data.'])
      : mc('The result is not unusual if ' + S0.model + ', so it gives no real evidence against the claim.', ['The result proves the claim is true.', 'The result is unusual, so the claim must be false.', 'The simulation cannot be compared with real data.']);
    var shape = by(ctx, 'count', 'prob', 'both');
    if (shape === 'count') return {
      q: intro + 'In how many of the 100 runs was the count ' + cmp + ' ' + obs + '?',
      a: num(tail, { form: 'int' }),
      steps: ['"At least as extreme" as the observed ' + obs + ' means ' + cmp + ' ' + obs + ', on the same side as the observed result.'].concat(tailSteps),
      hint: 'Add the runs in the table from ' + obs + ' ' + (up ? 'upward' : 'downward') + '.'
    };
    if (shape === 'prob') return {
      q: intro + 'Use the simulation to estimate the probability of getting ' + cmp + ' ' + obs + ' if ' + S0.model + '. (Give a decimal.)',
      a: num(ns(tail / 100)),
      steps: tailSteps.concat(['Estimated probability: $\\dfrac{' + tail + '}{100} = ' + ns(tail / 100) + '$.', concl]),
      hint: 'Count the runs at least as extreme as the observed result, then divide by 100.'
    };
    return {
      q: intro + 'Estimate the probability of a count of ' + cmp + ' ' + obs + ' if ' + S0.model + ', and decide what the data say.',
      a: { t: 'multi', parts: [{ label: 'estimated probability $=$', a: num(ns(tail / 100)) }, { label: 'Conclusion:', a: cMc }] },
      steps: tailSteps.concat(['Estimate: $' + ns(tail / 100) + '$.', concl]),
      hint: 'Is the observed result in the middle of the simulated results or far out in a tail?'
    };
  });

  // ---------------------------------------------------------------- sampling distribution of a proportion
  var PPAIRS = (function () { // [p, n, sd] with sd = sqrt(p(1-p)/n) a decimal of at most 3 places, np >= 10, n(1-p) >= 10
    var out = [], ps = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9], ns0 = [25, 36, 50, 64, 75, 100, 144, 150, 196, 200, 225, 256, 300, 400, 500, 600, 625, 900, 1000, 1200, 1600, 2500];
    ps.forEach(function (p) { ns0.forEach(function (n) {
      if (n * p < 10 || n * (1 - p) < 10) return;
      var v = Q.from(p).mul(Q(1).sub(Q.from(p))).div(n), rn = M.round(M.sqrt(Number(v.n))), rd0 = M.round(M.sqrt(Number(v.d)));
      if (rn * rn !== Number(v.n) || rd0 * rd0 !== Number(v.d)) return;
      var sd = Q(rn, rd0); if (!sd.isTerminating() || (String(sd.toDec(8)).replace(/0+$/, '').split('.')[1] || '').length > 3) return;
      out.push([p, n, sd.toNumber()]);
    }); });
    return out;
  })();
  var PROP_CTX = ['of adults in a large city have a library card', 'of a factory\'s chips pass inspection', 'of voters support a school bond', 'of households own a dog', 'of students walk to school'];
  G('stat.sampling-distribution-proportion', function (R, ctx) {
    var L = lv(ctx), P = R.pick(PPAIRS), p = P[0], n = P[1], sd = P[2], c = R.pick(PROP_CTX), shape = by(ctx, 'msd', 'z', R.pick(['prob', 'prob', 'concept']));
    var intro = 'Suppose $p = ' + ns(p) + '$ (that is, $' + pct(fix(p * 100)) + '$) ' + c + '. Take many random samples of $n = ' + n + '$ and find the sample proportion $\\hat{p}$ in each. ';
    var cond = 'Check: $np = ' + ns(fix(n * p)) + '$ and $n(1 - p) = ' + ns(fix(n * (1 - p))) + '$ are both at least 10, so the sampling distribution is close to normal.';
    var sdSteps = ['Center: the mean of $\\hat{p}$ is $p = ' + ns(p) + '$.', 'Spread: $\\sigma_{\\hat{p}} = \\sqrt{\\dfrac{p(1 - p)}{n}} = \\sqrt{\\dfrac{' + ns(p) + ' \\cdot ' + ns(fix(1 - p)) + '}{' + n + '}} = \\sqrt{' + qv(Q.from(p).mul(Q(1).sub(Q.from(p))).div(n)) + '} = ' + ns(sd) + '$.'];
    if (shape === 'msd') return {
      q: intro + 'Find the mean and the standard deviation of the sampling distribution of $\\hat{p}$.',
      a: { t: 'multi', parts: [{ label: 'mean $=$', a: num(p) }, { label: 'standard deviation $=$', a: num(sd) }] },
      steps: sdSteps.concat([cond]),
      hint: 'The mean is p; the standard deviation is the square root of p(1 − p)/n.'
    };
    var zc = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5], ph = null, z = 0;
    for (var t = 0; t < 80 && ph === null; t++) {
      if (t % 8 === 7) { P = R.pick(PPAIRS); p = P[0]; n = P[1]; sd = P[2]; }
      z = R.pick(zc) * R.sign(); var cand = fix(p + z * sd); if (cand > 0 && cand < 1 && M.abs(cand * n - M.round(cand * n)) < 1e-9) ph = cand;
    }
    if (ph === null) { p = 0.5; n = 100; sd = 0.05; z = 1; ph = 0.55; }
    intro = 'Suppose $p = ' + ns(p) + '$ (that is, $' + pct(fix(p * 100)) + '$) ' + c + '. Take many random samples of $n = ' + n + '$ and find the sample proportion $\\hat{p}$ in each. ';
    cond = 'Check: $np = ' + ns(fix(n * p)) + '$ and $n(1 - p) = ' + ns(fix(n * (1 - p))) + '$ are both at least 10, so the sampling distribution is close to normal.';
    sdSteps = ['Center: the mean of $\\hat{p}$ is $p = ' + ns(p) + '$.', 'Spread: $\\sigma_{\\hat{p}} = \\sqrt{\\dfrac{p(1 - p)}{n}} = \\sqrt{\\dfrac{' + ns(p) + ' \\cdot ' + ns(fix(1 - p)) + '}{' + n + '}} = \\sqrt{' + qv(Q.from(p).mul(Q(1).sub(Q.from(p))).div(n)) + '} = ' + ns(sd) + '$.'];
    var count = M.round(ph * n);
    if (shape === 'z') return {
      q: intro + 'One sample has $' + count + '$ successes out of $' + n + '$. Find the z-score of its $\\hat{p}$ in the sampling distribution.',
      a: num(z),
      steps: ['$\\hat{p} = \\dfrac{' + count + '}{' + n + '} = ' + ns(ph) + '$.'].concat(sdSteps, ['$z = \\dfrac{\\hat{p} - p}{\\sigma_{\\hat{p}}} = \\dfrac{' + ns(ph) + ' - ' + ns(p) + '}{' + ns(sd) + '} = ' + ns(z) + '$.']),
      hint: 'Use the standard deviation of p̂, not of the individual yes/no answers.'
    };
    if (shape === 'prob') {
      var above = z > 0, Pz = phi4(z), ans = above ? rd(1 - Pz, 4) : Pz;
      return {
        q: intro + 'What is the probability that a sample gives $\\hat{p} ' + (above ? '\\ge' : '\\le') + ' ' + ns(ph) + '$? ' + tableNote([z]),
        a: num(d4(ans), { tol: 0.001 }),
        steps: sdSteps.concat([cond, '$z = \\dfrac{' + ns(ph) + ' - ' + ns(p) + '}{' + ns(sd) + '} = ' + zs(z) + '$.', above ? '$P(Z \\ge ' + zs(z) + ') = 1 - ' + d4(Pz) + ' = ' + d4(ans) + '$.' : '$P(Z \\le ' + zs(z) + ') = ' + d4(Pz) + '$.']),
        hint: 'Standardize p̂ with the mean p and standard deviation √(p(1 − p)/n).'
      };
    }
    return {
      q: intro + 'What does the number $\\sqrt{p(1 - p)/n} = ' + ns(sd) + '$ describe?',
      a: mc('How much $\\hat{p}$ typically varies from one random sample of ' + n + ' to the next', ['How much the individual yes-or-no answers vary within one sample', 'The probability that a single sample proportion is correct', 'The proportion of the population that was sampled']),
      steps: ['It is the standard deviation of the <b>statistic</b> $\\hat{p}$ across many samples (its sampling distribution), not the spread of the data inside one sample.', 'Larger samples make it smaller: $\\hat{p}$ varies less when n is larger.'],
      hint: 'Picture many samples, each giving its own p̂.'
    };
  });

  // ---------------------------------------------------------------- sampling distribution of a mean (CLT)
  var MPAIRS = (function () { var out = []; [6, 8, 10, 12, 15, 18, 20, 24, 30, 40].forEach(function (s) { [4, 9, 16, 25, 36, 64, 100].forEach(function (n) { var se = s / M.sqrt(n); if (M.abs(se * 100 - M.round(se * 100)) < 1e-9 && se >= 1) out.push([s, n, rd(se, 2)]); }); }); return out; })();
  var MEAN_CTX = [['the time customers spend in a store', 'minutes', 20, 60], ['the length of a phone call', 'seconds', 120, 400], ['the amount customers spend at a cafe', 'dollars', 15, 40], ['the commute time of workers in a city', 'minutes', 20, 45], ['the time patients wait at a clinic', 'minutes', 20, 60]];
  var CLT_TF = [
    ['If n is large, the sample mean $\\bar{x}$ has a distribution close to normal, even when the population is skewed.', true, 'That is what the central limit theorem says, about the distribution of $\\bar{x}$.'],
    ['If n is large, the values in one sample will have a distribution close to normal.', false, 'The data in a sample look like the population, skewed or not. The theorem is about the distribution of sample means.'],
    ['The standard deviation of $\\bar{x}$ gets smaller as the sample size grows.', true, 'It is $\\sigma/\\sqrt{n}$, which shrinks as n grows.'],
    ['Taking a larger sample makes the population itself more normal.', false, 'The population does not change when you sample from it.'],
    ['The mean of the sampling distribution of $\\bar{x}$ equals the population mean $\\mu$.', true, 'Sample means center on μ for any sample size.']
  ];
  G('stat.sampling-distribution-mean', function (R, ctx) {
    var L = lv(ctx), P = R.pick(MPAIRS), s = P[0], n = P[1], se = P[2], c = R.pick(MEAN_CTX), mu = 5 * R.int(c[2] / 5, c[3] / 5), shape = by(ctx, 'msd', 'prob', R.pick(['compare', 'tf', 'prob']));
    var intro = 'Suppose ' + c[0] + ' has mean $\\mu = ' + mu + '$ and standard deviation $\\sigma = ' + s + '$ ' + c[1] + ' (the distribution is skewed). Random samples of $n = ' + n + '$ are taken, and $\\bar{x}$ is the mean of each sample. ';
    var sdS = ['Center: the mean of $\\bar{x}$ is $\\mu = ' + mu + '$.', 'Spread: $\\sigma_{\\bar{x}} = \\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{' + s + '}{\\sqrt{' + n + '}} = \\dfrac{' + s + '}{' + M.sqrt(n) + '} = ' + ns(se) + '$.'];
    if (shape === 'msd') return {
      q: intro + 'Find the mean and the standard deviation of the sampling distribution of $\\bar{x}$.',
      a: { t: 'multi', parts: [{ label: 'mean $=$', a: num(mu) }, { label: 'standard deviation $=$', a: num(se) }] },
      steps: sdS.concat([n >= 30 ? 'With $n = ' + n + '$, the central limit theorem says $\\bar{x}$ is close to normal even though the population is skewed.' : 'With a sample this small from a skewed population, $\\bar{x}$ is not yet close to normal, but its mean and standard deviation are still these.']),
      hint: 'Same center as the population; spread σ/√n.'
    };
    if (n < 30) { var big = MPAIRS.filter(function (x) { return x[1] >= 36; }); P = R.pick(big); s = P[0]; n = P[1]; se = P[2]; intro = 'Suppose ' + c[0] + ' has mean $\\mu = ' + mu + '$ and standard deviation $\\sigma = ' + s + '$ ' + c[1] + ' (the distribution is skewed). Random samples of $n = ' + n + '$ are taken, and $\\bar{x}$ is the mean of each sample. '; sdS = ['Center: $\\mu = ' + mu + '$.', 'Spread: $\\sigma_{\\bar{x}} = \\dfrac{' + s + '}{\\sqrt{' + n + '}} = ' + ns(se) + '$.']; }
    if (shape === 'prob') {
      var z = R.pick([0.5, 0.8, 1, 1.2, 1.5, 1.6, 2, 2.4, 2.5]) * R.sign(), xb = fix(mu + z * se), above = R.coin(), Pz = phi4(z), ans = above ? rd(1 - Pz, 4) : Pz;
      return {
        q: intro + 'Find the probability that $\\bar{x} ' + (above ? '>' : '<') + ' ' + ns(xb) + '$. ' + tableNote([z]),
        a: num(d4(ans), { tol: 0.001 }),
        steps: sdS.concat(['$n = ' + n + '$ is large, so by the central limit theorem $\\bar{x}$ is approximately normal.', '$z = \\dfrac{' + ns(xb) + ' - ' + mu + '}{' + ns(se) + '} = ' + zs(z) + '$.', above ? '$P(Z > ' + zs(z) + ') = 1 - ' + d4(Pz) + ' = ' + d4(ans) + '$.' : '$P(Z < ' + zs(z) + ') = ' + d4(Pz) + '$.']),
        hint: 'Divide σ by √n before computing z.'
      };
    }
    if (shape === 'compare') {
      var combos = []; MPAIRS.forEach(function (x) { if (x[1] >= 16) [1, 1.5, 2, 2.5, 3].forEach(function (zz) { var zi0 = zz / M.sqrt(x[1]); if (M.abs(zi0 * 100 - M.round(zi0 * 100)) < 1e-9) combos.push([x, zz]); }); });
      var cb = R.pick(combos), sp = cb[0], s2 = sp[0], n2 = sp[1], se2 = sp[2];
      var zb = cb[1], xc = fix(mu + zb * se2), zi = rd((xc - mu) / s2, 2), Pi = phi4(zi), Pb = phi4(zb);
      return {
        q: 'Suppose ' + c[0] + ' is approximately normal with mean ' + mu + ' and standard deviation ' + s2 + ' ' + c[1] + '. Find the probability that one randomly chosen value is above ' + ns(xc) + ', and the probability that the mean of a random sample of ' + n2 + ' is above ' + ns(xc) + '. ' + tableNote([zi, zb]),
        a: { t: 'multi', parts: [{ label: 'one value $=$', a: num(d4(rd(1 - Pi, 4)), { tol: 0.001 }) }, { label: 'sample mean $=$', a: num(d4(rd(1 - Pb, 4)), { tol: 0.001 }) }] },
        steps: ['One value: $z = \\dfrac{' + ns(xc) + ' - ' + mu + '}{' + s2 + '} = ' + zs(zi) + '$, so $P = 1 - ' + d4(Pi) + ' = ' + d4(rd(1 - Pi, 4)) + '$.', 'Mean of ' + n2 + ': $\\sigma_{\\bar{x}} = \\dfrac{' + s2 + '}{\\sqrt{' + n2 + '}} = ' + ns(se2) + '$, so $z = \\dfrac{' + ns(xc) + ' - ' + mu + '}{' + ns(se2) + '} = ' + zs(zb) + '$ and $P = 1 - ' + d4(Pb) + ' = ' + d4(rd(1 - Pb, 4)) + '$.', 'Averages vary much less than single values, so the same cutoff is far less likely for the mean.'],
        hint: 'Use σ for one value and σ/√n for a sample mean.'
      };
    }
    var st = R.pick(CLT_TF);
    return {
      q: 'True or false: ' + st[0],
      a: { t: 'tf', v: st[1] },
      steps: [st[2]],
      hint: 'Keep three distributions apart: the population, one sample\'s data, and the sample means.'
    };
  });


  // ================================================================ unit 8: inference

  function t4(x) { return T.dec(rd(x, 4), 4); }
  var LEVELS = [90, 95, 99];
  // (p-hat, n) pairs with a friendly standard error: reuse PPAIRS (p there plays the role of p-hat here)
  var CI_CTX = [['adults', 'say they read a book last month'], ['students', 'say they get at least 8 hours of sleep'], ['customers', 'say they would recommend the store'], ['voters', 'support a new park'], ['drivers', 'say they wear a seat belt every time']];

  // ---------------------------------------------------------------- confidence interval for a proportion
  G('stat.confidence-interval-proportion', function (R, ctx) {
    var L = lv(ctx), P = R.pick(PPAIRS.filter(function (x) { return M.abs(x[0] * x[1] - M.round(x[0] * x[1])) < 1e-9; })), ph = P[0], n = P[1], se = P[2], c = R.pick(CI_CTX), lev = R.pick(LEVELS), zst = zstar(lev), z = Number(zst);
    var me = rd(z * se, 5), lo = rd(ph - me, 5), hi = rd(ph + me, 5), x = M.round(ph * n);
    var intro = 'In a random sample of ' + n + ' ' + c[0] + ', ' + x + ' ' + c[1] + '. ';
    var shape = by(ctx, 'seme', 'interval', R.pick(['interpret', 'plausible', 'interval']));
    var base = ['$\\hat{p} = \\dfrac{' + x + '}{' + n + '} = ' + ns(ph) + '$.', 'Standard error: $SE = \\sqrt{\\dfrac{\\hat{p}(1 - \\hat{p})}{n}} = \\sqrt{\\dfrac{' + ns(ph) + ' \\cdot ' + ns(fix(1 - ph)) + '}{' + n + '}} = ' + ns(se) + '$.', 'Margin of error: $z^* \\cdot SE = ' + zst + ' \\times ' + ns(se) + ' = ' + ns(me) + '$.'];
    if (shape === 'seme') return {
      q: intro + 'Find the standard error of $\\hat{p}$ and the margin of error for a ' + lev + '% confidence interval. (For ' + lev + '% confidence, $z^* = ' + zst + '$.)',
      a: { t: 'multi', parts: [{ label: '$SE =$', a: num(se) }, { label: 'margin of error $=$', a: num(ns(me), { tol: 0.0005 }) }] },
      steps: base,
      hint: 'SE = √(p̂(1 − p̂)/n), then multiply by z*.'
    };
    if (shape === 'interval') return {
      q: intro + 'Construct a ' + lev + '% confidence interval for the proportion of all ' + c[0] + ' who ' + c[1].replace(/^say they /, 'would say they ') + '. (For ' + lev + '% confidence, $z^* = ' + zst + '$.)',
      a: { t: 'multi', parts: [{ label: 'lower end $=$', a: num(ns(lo), { tol: 0.001 }) }, { label: 'upper end $=$', a: num(ns(hi), { tol: 0.001 }) }] },
      steps: base.concat(['Interval: $' + ns(ph) + ' \\pm ' + ns(me) + '$, from $' + ns(lo) + '$ to $' + ns(hi) + '$.', 'We are ' + lev + '% confident that the true proportion is between ' + ns(rd(lo, 3)) + ' and ' + ns(rd(hi, 3)) + '.']),
      hint: 'Estimate ± margin of error.'
    };
    if (shape === 'plausible') {
      var inside = R.coin(), claim = inside ? rd(ph + (R.next() - 0.5) * me, 2) : rd(R.coin() ? hi + 0.02 + 0.01 * R.int(0, 3) : lo - 0.02 - 0.01 * R.int(0, 3), 2);
      if (claim <= 0 || claim >= 1) { inside = true; claim = rd(ph, 2); }
      var isIn = claim >= lo && claim <= hi;
      return {
        q: intro + 'A ' + lev + '% confidence interval for the true proportion is $' + ns(rd(lo, 3)) + '$ to $' + ns(rd(hi, 3)) + '$. Someone claims the true proportion is $' + ns(claim) + '$. What does the interval say about this claim?',
        a: isIn ? mc('The claim is plausible: ' + ns(claim) + ' is inside the interval.', ['The claim is proven true, since it is inside the interval.', 'The claim is not plausible: it is outside the interval.', 'The interval says nothing about any claim.'])
          : mc('The claim is not plausible: ' + ns(claim) + ' is outside the interval.', ['The claim is plausible: it is inside the interval.', 'The claim is proven false with certainty.', 'The interval says nothing about any claim.']),
        steps: ['An interval gives the plausible values of the parameter, based on this sample.', isIn ? ns(claim) + ' is between the endpoints, so it is plausible (though other values are too: being inside does not prove it).' : ns(claim) + ' is outside, so it is not a plausible value at ' + lev + '% confidence (strong evidence, not certainty).'],
        hint: 'Is the claimed value between the two endpoints?'
      };
    }
    return {
      q: intro + 'A ' + lev + '% confidence interval for the true proportion is $' + ns(rd(lo, 3)) + '$ to $' + ns(rd(hi, 3)) + '$. Which statement interprets "' + lev + '% confident" correctly?',
      a: mc('If we took many random samples and built an interval from each one, about ' + lev + '% of those intervals would capture the true proportion.', ['There is a ' + lev + '% chance that the true proportion is between ' + ns(rd(lo, 3)) + ' and ' + ns(rd(hi, 3)) + '.', lev + '% of all ' + c[0] + ' have answers between ' + ns(rd(lo, 3)) + ' and ' + ns(rd(hi, 3)) + '.', 'There is a ' + lev + '% chance that the next sample proportion will be between ' + ns(rd(lo, 3)) + ' and ' + ns(rd(hi, 3)) + '.']),
      steps: ['The true proportion is a fixed number. This particular interval either contains it or it does not.', 'The ' + lev + '% describes the method: it produces intervals that capture the truth ' + lev + '% of the time in the long run.'],
      hint: 'The confidence level is about the method, not about this one interval.'
    };
  });

  // ---------------------------------------------------------------- margin of error and sample size
  G('stat.margin-of-error', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'scale', R.pick(['size', 'scale']), R.pick(['double', 'size', 'level']));
    if (shape === 'scale') {
      var k = R.pick([4, 9, 16, 4, 25]), E = M.sqrt(k) * R.pick([1, 1.5, 2, 2.5, 3]), n = R.pick([100, 200, 250, 400, 500]), dir = R.coin();
      if (dir) return {
        q: 'A poll of ' + n + ' people has a margin of error of $' + E + '$ percentage points. If the poll is repeated with ' + T.commas(k * n) + ' people (' + k + ' times as many), about what will the margin of error be?',
        a: num(fix(E / M.sqrt(k))), unit: 'points',
        steps: ['The margin of error is proportional to $\\dfrac{1}{\\sqrt{n}}$.', 'Multiplying n by ' + k + ' divides the margin of error by $\\sqrt{' + k + '} = ' + M.sqrt(k) + '$.', '$' + E + ' \\div ' + M.sqrt(k) + ' = ' + ns(fix(E / M.sqrt(k))) + '$ points.'],
        hint: 'n sits under a square root.'
      };
      var f = R.pick([2, 3, 4]);
      return {
        q: 'To make the margin of error ' + ['', '', 'half', 'one third', 'one fourth'][f] + ' as large, by what factor must the sample size be multiplied?',
        a: num(f * f),
        steps: ['Margin of error $\\propto \\dfrac{1}{\\sqrt{n}}$.', 'To divide it by ' + f + ', $\\sqrt{n}$ must be multiplied by ' + f + ', so n must be multiplied by $' + f + '^2 = ' + (f * f) + '$.'],
        hint: 'Undo the square root: square the factor.'
      };
    }
    if (shape === 'size') {
      var lev = R.pick(LEVELS), zst = zstar(lev), E2 = R.pick(['0.02', '0.03', '0.04', '0.05']), guess = R.coin() ? '0.5' : R.pick(['0.2', '0.3', '0.1']);
      var raw = Q.from(zst).div(Q.from(E2)).pow(2).mul(Q.from(guess)).mul(Q(1).sub(Q.from(guess))), need = raw.isInt() ? raw : raw.floor().add(1);
      return {
        q: 'How large a sample is needed to estimate a proportion within $\\pm' + E2 + '$ with ' + lev + '% confidence ($z^* = ' + zst + '$)? ' + (guess === '0.5' ? 'With no prior estimate, use $p^* = 0.5$.' : 'An earlier study suggests $p^* = ' + guess + '$.'),
        a: num(qv(need), { form: 'int' }),
        steps: ['Solve $z^*\\sqrt{\\dfrac{p^*(1 - p^*)}{n}} \\le E$ for n: $n \\ge \\left(\\dfrac{z^*}{E}\\right)^2 p^*(1 - p^*)$.', '$n \\ge \\left(\\dfrac{' + zst + '}{' + E2 + '}\\right)^2(' + guess + ')(' + ns(fix(1 - Number(guess))) + ') = ' + ns(rd(raw.toNumber(), 2)) + '$.', raw.isInt() ? 'So $n = ' + qv(need) + '$.' : 'Always round <b>up</b> (rounding down would make the margin a bit too big): $n = ' + qv(need) + '$.'],
        hint: 'Use n ≥ (z*/E)² p*(1 − p*), and round up.'
      };
    }
    if (shape === 'double') {
      var E3 = R.pick([0.04, 0.05, 0.06, 0.03]), n3 = R.pick([300, 400, 500, 600]);
      return {
        q: 'A survey of ' + n3 + ' people gives a margin of error of $' + ns(E3) + '$. If the sample size is doubled to ' + (2 * n3) + ', about what is the new margin of error?',
        a: mc('About $' + ns(rd(E3 / M.SQRT2, 3)) + '$ (divided by $\\sqrt{2}$)', ['$' + ns(E3 / 2) + '$ (cut in half)', '$' + ns(E3 * 2) + '$ (doubled)', '$' + ns(E3) + '$ (unchanged)']),
        steps: ['Margin of error $\\propto 1/\\sqrt{n}$. Doubling n multiplies $\\sqrt{n}$ by $\\sqrt{2} \\approx 1.414$.', 'New margin: $' + ns(E3) + ' \\div 1.414 \\approx ' + ns(rd(E3 / M.SQRT2, 3)) + '$.', 'To cut the margin in half you would need 4 times the sample, not 2 times.'],
        hint: 'n is under a square root.'
      };
    }
    var ch = R.pick([['raising the confidence level from 95% to 99%', 'It gets larger: more confidence needs a wider net ($z^*$ grows from 1.960 to 2.576).'], ['lowering the confidence level from 95% to 90%', 'It gets smaller: less confidence lets the interval be narrower ($z^*$ drops from 1.960 to 1.645).'], ['taking a larger random sample, at the same confidence level', 'It gets smaller: the standard error shrinks as n grows.']]);
    return {
      q: 'For a confidence interval for a proportion, what happens to the margin of error when ' + ch[0] + ' (everything else the same)?',
      a: mc(ch[1], ['It gets larger: more confidence needs a wider net ($z^*$ grows from 1.960 to 2.576).', 'It gets smaller: less confidence lets the interval be narrower ($z^*$ drops from 1.960 to 1.645).', 'It gets smaller: the standard error shrinks as n grows.', 'It stays the same: the margin of error depends only on the sample proportion.'].filter(function (x) { return x !== ch[1]; })),
      steps: ['Margin of error $= z^* \\sqrt{\\hat{p}(1 - \\hat{p})/n}$.', ch[1]],
      hint: 'Look at the formula: which part changes?'
    };
  });

  // ---------------------------------------------------------------- confidence interval for a mean
  var TM_CTX = [['bags of trail mix', 'weight', 'grams', 250, 400], ['commuters', 'commute time', 'minutes', 30, 70], ['batteries', 'lifetime', 'hours', 300, 600], ['students', 'time spent on homework', 'minutes', 40, 90], ['apples', 'weight', 'grams', 150, 250]];
  G('stat.confidence-interval-mean', function (R, ctx) {
    var L = lv(ctx), P = R.pick(MPAIRS.filter(function (x) { return x[1] <= 64; })), s = P[0], n = P[1], se = P[2], c = R.pick(TM_CTX), lev = R.pick([90, 95, 99]), df = n - 1, ts = tstar(lev, df);
    var xb = rd(R.int(c[3] * 10, c[4] * 10) / 10, 1), me = rd(ts * se, 4), lo = rd(xb - me, 4), hi = rd(xb + me, 4);
    var intro = 'A random sample of ' + n + ' ' + c[0] + ' has mean ' + c[1] + ' $\\bar{x} = ' + ns(xb) + '$ ' + c[2] + ' and standard deviation $s = ' + s + '$ ' + c[2] + '. ';
    var shape = by(ctx, 'dfse', 'interval', R.pick(['why', 'interval', 'width']));
    var base = ['Degrees of freedom: $n - 1 = ' + df + '$.', 'Standard error: $\\dfrac{s}{\\sqrt{n}} = \\dfrac{' + s + '}{\\sqrt{' + n + '}} = ' + ns(se) + '$.'];
    if (shape === 'dfse') return {
      q: intro + 'To build a t interval for the population mean, find the degrees of freedom and the standard error of $\\bar{x}$.',
      a: { t: 'multi', parts: [{ label: 'df $=$', a: num(df) }, { label: '$SE =$', a: num(se) }] },
      steps: base,
      hint: 'df = n − 1; SE = s/√n.'
    };
    if (shape === 'interval') return {
      q: intro + 'Construct a ' + lev + '% confidence interval for the population mean. (For ' + df + ' degrees of freedom, $t^* = ' + T.dec(ts, 3) + '$.)',
      a: { t: 'multi', parts: [{ label: 'lower end $=$', a: num(ns(lo), { tol: 0.01 }) }, { label: 'upper end $=$', a: num(ns(hi), { tol: 0.01 }) }] },
      steps: base.concat(['Margin of error: $t^* \\cdot SE = ' + T.dec(ts, 3) + ' \\times ' + ns(se) + ' = ' + ns(me) + '$.', 'Interval: $' + ns(xb) + ' \\pm ' + ns(me) + '$, from $' + ns(lo) + '$ to $' + ns(hi) + '$ ' + c[2] + '.']),
      hint: 'x̄ ± t* · s/√n.'
    };
    if (shape === 'width') {
      var lv2 = lev === 99 ? 90 : 99, t2 = tstar(lv2, df), wider = lv2 > lev;
      return {
        q: intro + 'For ' + df + ' degrees of freedom, $t^* = ' + T.dec(ts, 3) + '$ for ' + lev + '% confidence and $t^* = ' + T.dec(t2, 3) + '$ for ' + lv2 + '% confidence. How wide is each interval (upper end minus lower end)?',
        a: { t: 'multi', parts: [{ label: lev + '% width $=$', a: num(ns(rd(2 * ts * se, 4)), { tol: 0.02 }) }, { label: lv2 + '% width $=$', a: num(ns(rd(2 * t2 * se, 4)), { tol: 0.02 }) }] },
        steps: base.concat(['Width $= 2 t^* \\cdot SE$.', lev + '%: $2 \\times ' + T.dec(ts, 3) + ' \\times ' + ns(se) + ' = ' + ns(rd(2 * ts * se, 4)) + '$.', lv2 + '%: $2 \\times ' + T.dec(t2, 3) + ' \\times ' + ns(se) + ' = ' + ns(rd(2 * t2 * se, 4)) + '$.', 'Higher confidence costs a wider interval.']),
        hint: 'The interval runs one margin of error on each side of x̄.'
      };
    }
    return {
      q: intro + 'Why does the interval use $t^*$ instead of $z^*$?',
      a: mc('Because σ is unknown and s is used in its place; the extra uncertainty in s makes the t distribution wider than the normal', ['Because the sample mean is always skewed', 'Because the sample size is larger than 30', 'Because t intervals are always narrower than z intervals']),
      steps: ['We estimate σ with s, which also varies from sample to sample.', 'The t distribution has heavier tails to allow for that, so $t^* > z^*$, most of all for small n. As n grows, t gets close to z.'],
      hint: 'What do we not know about the population?'
    };
  });

  // ---------------------------------------------------------------- the logic of significance tests
  var HYP = [
    { claim: 'A company claims 60% of its customers are satisfied. A consumer group suspects the true rate is lower.', p: '0.6', dir: '<', ph: '0.52' },
    { claim: 'Last year 30% of students walked to school. The principal thinks the rate has gone up.', p: '0.3', dir: '>', ph: '0.36' },
    { claim: 'A coin is supposed to land heads half the time. A student thinks it is unfair (in either direction).', p: '0.5', dir: '\\ne', ph: '0.56' },
    { claim: 'A seed company says 85% of its seeds sprout. A gardener suspects fewer do.', p: '0.85', dir: '<', ph: '0.8' },
    { claim: 'A website says 12% of visitors click its ad. A designer thinks a new layout changed that rate.', p: '0.12', dir: '\\ne', ph: '0.15' }
  ];
  var PVAL_RIGHT = 'Assuming $H_0$ is true, the probability of getting a sample result at least as extreme as the one observed';
  var PVAL_WRONG = ['The probability that $H_0$ is true', 'The probability that $H_a$ is true', 'The probability that the sample result is wrong', 'The probability of making a mistake by rejecting $H_0$, whatever the truth is'];
  G('stat.significance-tests', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'hyp', R.pick(['pmean', 'decide']), R.pick(['pval', 'pval', 'decide']));
    if (shape === 'hyp') {
      var h = R.pick(HYP), alt = { '<': '>', '>': '<', '\\ne': '<' }[h.dir];
      return {
        q: h.claim + ' In a sample, $\\hat{p} = ' + h.ph + '$. Which hypotheses fit this question?',
        a: mc('$H_0: p = ' + h.p + '$, $H_a: p ' + h.dir + ' ' + h.p + '$', ['$H_0: \\hat{p} = ' + h.p + '$, $H_a: \\hat{p} ' + h.dir + ' ' + h.p + '$', '$H_0: p = ' + h.p + '$, $H_a: p ' + alt + ' ' + h.p + '$', '$H_0: p = ' + h.ph + '$, $H_a: p ' + h.dir + ' ' + h.ph + '$']),
        steps: ['Hypotheses are about the population parameter $p$, never about the sample statistic $\\hat{p}$ (we already know $\\hat{p}$).', 'The null hypothesis is the claim of "no change": $p = ' + h.p + '$.', 'The alternative is what we suspect: $p ' + h.dir + ' ' + h.p + '$.'],
        hint: 'Write hypotheses about the population, using the claimed value.'
      };
    }
    if (shape === 'pmean') return {
      q: 'A study reports a p-value of $' + R.pick(['0.03', '0.004', '0.12', '0.045']) + '$. What is a p-value?',
      a: mc(PVAL_RIGHT, PVAL_WRONG),
      steps: ['The p-value assumes the null hypothesis is true and asks how surprising the data would be.', 'It is <b>not</b> the probability that the null hypothesis is true: it is computed by assuming the null hypothesis is true.'],
      hint: 'A p-value starts by assuming H₀ is true.'
    };
    if (shape === 'decide') {
      var alpha = R.pick(['0.05', '0.01', '0.10']), pv = R.pick(['0.002', '0.018', '0.031', '0.047', '0.062', '0.083', '0.21', '0.0007']), rej = Number(pv) < Number(alpha);
      return {
        q: 'A test of $H_0: p = 0.4$ against $H_a: p > 0.4$ gives a p-value of $' + pv + '$. At significance level $\\alpha = ' + alpha + '$, what is the conclusion?',
        a: rej ? mc('Reject $H_0$: there is convincing evidence that $p > 0.4$.', ['Fail to reject $H_0$: there is not convincing evidence that $p > 0.4$.', 'Accept $H_0$: this proves $p = 0.4$.', 'Reject $H_a$: this proves $p = 0.4$.'])
          : mc('Fail to reject $H_0$: there is not convincing evidence that $p > 0.4$.', ['Reject $H_0$: there is convincing evidence that $p > 0.4$.', 'Accept $H_0$: this proves $p = 0.4$.', 'Reject $H_a$: this proves $p = 0.4$.']),
        steps: ['Compare the p-value with α: $' + pv + (rej ? ' < ' : ' \\ge ') + alpha + '$.', rej ? 'The data would be rare if $H_0$ were true, so we reject $H_0$.' : 'The data are not rare enough under $H_0$, so we fail to reject it. That is not proof that $H_0$ is true.'],
        hint: 'Small p-value (below α): reject H₀. Otherwise: fail to reject. Never "accept".'
      };
    }
    var z = rd(R.int(120, 300) / 100 * R.sign(), 2), sides = R.pick(['right', 'left', 'two']);
    if (sides === 'right') z = M.abs(z); if (sides === 'left') z = -M.abs(z);
    var Pz = phi4(-M.abs(z)), pv2 = sides === 'two' ? rd(2 * Pz, 4) : Pz, a2 = 0.05, rej2 = pv2 < a2;
    var Ha = sides === 'right' ? '>' : sides === 'left' ? '<' : '\\ne';
    return {
      q: 'A test of $H_0: p = p_0$ against $H_a: p ' + Ha + ' p_0$ gives the test statistic $z = ' + zs(z) + '$. Find the p-value, and decide at $\\alpha = 0.05$. ' + tableNote([-M.abs(z)]),
      a: { t: 'multi', parts: [{ label: 'p-value $=$', a: num(d4(pv2), { tol: 0.001 }) }, { label: 'Decision:', a: mcKeep(['Reject $H_0$', 'Fail to reject $H_0$'], rej2 ? 0 : 1) }] },
      steps: [sides === 'two' ? 'Two-sided: values at least as extreme on <b>either</b> side count, so double one tail.' : 'One-sided: only the tail in the direction of $H_a$ counts.', 'One tail beyond $|z| = ' + zs(M.abs(z)) + '$: $' + d4(Pz) + '$ (by symmetry, the area above ' + zs(M.abs(z)) + ' equals the area below ' + zs(-M.abs(z)) + ').', 'p-value $= ' + (sides === 'two' ? '2 \\times ' + d4(Pz) + ' = ' : '') + d4(pv2) + '$.', '$' + d4(pv2) + (rej2 ? ' < ' : ' \\ge ') + '0.05$: ' + (rej2 ? 'reject $H_0$.' : 'fail to reject $H_0$.')],
      hint: 'Shade the tail(s) in the direction of Hₐ.'
    };
  });

  // ---------------------------------------------------------------- one-proportion z test
  G('stat.test-proportion', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'hyp', 'z', 'full');
    if (shape === 'hyp') {
      var h = R.pick(HYP), n0 = R.pick([100, 150, 200, 400]);
      return {
        q: h.claim + ' A random sample of ' + n0 + ' gives $\\hat{p} = ' + h.ph + '$. Which are the correct hypotheses?',
        a: mc('$H_0: p = ' + h.p + '$ and $H_a: p ' + h.dir + ' ' + h.p + '$', ['$H_0: \\hat{p} = ' + h.p + '$ and $H_a: \\hat{p} ' + h.dir + ' ' + h.p + '$', '$H_0: p = ' + h.ph + '$ and $H_a: p ' + h.dir + ' ' + h.ph + '$', '$H_0: p ' + h.dir + ' ' + h.p + '$ and $H_a: p = ' + h.p + '$']),
        steps: ['Hypotheses describe the population proportion $p$, not the sample proportion $\\hat{p} = ' + h.ph + '$.', '$H_0$ holds the equals sign and the claimed value ' + h.p + '; $H_a$ says what we suspect.'],
        hint: 'Which letter stands for the population, p or p̂?'
      };
    }
    var PP = PPAIRS.filter(function (x) { return x[1] <= 1000; }), P = R.pick(PP), p0 = P[0], n = P[1], se = P[2], z = 0, ph = null;
    for (var t = 0; t < 80 && ph === null; t++) {
      if (t % 8 === 7) { P = R.pick(PP); p0 = P[0]; n = P[1]; se = P[2]; }
      z = R.pick([1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 0.75]) * R.sign(); var cand = fix(p0 + z * se); if (cand > 0 && cand < 1 && M.abs(cand * n - M.round(cand * n)) < 1e-9) ph = cand;
    }
    if (ph === null) { p0 = 0.5; n = 100; se = 0.05; z = 2; ph = 0.6; }
    var x = M.round(ph * n), dir = z > 0 ? '>' : '<', c = R.pick(['of customers buy a warranty', 'of patients improve without treatment', 'of emails are spam', 'of residents recycle', 'of new customers return for a second visit']);
    var intro = 'Past records say $' + pct(fix(p0 * 100)) + '$ ' + c + '. A researcher suspects the rate is now ' + (z > 0 ? 'higher' : 'lower') + '. In a random sample of ' + n + ', ' + x + ' did. ';
    var zs1 = ['Hypotheses: $H_0: p = ' + ns(p0) + '$, $H_a: p ' + dir + ' ' + ns(p0) + '$.', 'Sample: $\\hat{p} = \\dfrac{' + x + '}{' + n + '} = ' + ns(ph) + '$.', 'Under $H_0$, the standard deviation of $\\hat{p}$ uses $p_0$: $\\sqrt{\\dfrac{p_0(1 - p_0)}{n}} = \\sqrt{\\dfrac{' + ns(p0) + ' \\cdot ' + ns(fix(1 - p0)) + '}{' + n + '}} = ' + ns(se) + '$.', '$z = \\dfrac{\\hat{p} - p_0}{' + ns(se) + '} = \\dfrac{' + ns(ph) + ' - ' + ns(p0) + '}{' + ns(se) + '} = ' + ns(z) + '$.'];
    if (shape === 'z') return {
      q: intro + 'Find the test statistic $z$.',
      a: num(z, { tol: 0.01 }),
      steps: zs1,
      hint: 'Use p₀ (the null value), not p̂, in the standard deviation.'
    };
    var Pz = phi4(z), pv = z > 0 ? rd(1 - Pz, 4) : Pz, rej = pv < 0.05;
    return {
      q: intro + 'Carry out the test at $\\alpha = 0.05$: find $z$, the p-value and the conclusion. ' + tableNote([z]),
      a: { t: 'multi', parts: [{ label: '$z =$', a: num(z, { tol: 0.01 }) }, { label: 'p-value $=$', a: num(d4(pv), { tol: 0.001 }) }, { label: 'Conclusion:', a: mcKeep(['Convincing evidence that the rate is ' + (z > 0 ? 'higher' : 'lower'), 'Not convincing evidence that the rate is ' + (z > 0 ? 'higher' : 'lower')], rej ? 0 : 1) }] },
      steps: zs1.concat(['Conditions: $np_0 = ' + ns(fix(n * p0)) + '$ and $n(1 - p_0) = ' + ns(fix(n * (1 - p0))) + '$ are at least 10.', 'p-value (one tail, toward $H_a$): ' + (z > 0 ? '$1 - ' + d4(Pz) + ' = ' + d4(pv) + '$.' : '$' + d4(Pz) + '$.'), rej ? '$' + d4(pv) + ' < 0.05$: reject $H_0$. The data give convincing evidence that the rate is ' + (z > 0 ? 'higher' : 'lower') + '.' : '$' + d4(pv) + ' \\ge 0.05$: fail to reject $H_0$. The data do not give convincing evidence of a change.']),
      hint: 'z uses p₀ in its standard deviation; the p-value is the tail area in the direction of Hₐ.'
    };
  });

  // ---------------------------------------------------------------- one-sample t test
  G('stat.test-mean', function (R, ctx) {
    var L = lv(ctx), P = R.pick(MPAIRS.filter(function (x) { return x[1] >= 9 && x[1] <= 64; })), s = P[0], n = P[1], se = P[2], df = n - 1;
    var mu0 = R.int(10, 80) * 5, t = R.pick([1.2, 1.5, 1.8, 2, 2.2, 2.5, 3, 0.8]) * R.sign(), xb = fix(mu0 + t * se), sides = R.pick(['one', 'one', 'two']);
    var c = R.pick([['the mean weight of cereal boxes labeled ' + mu0 + ' grams', 'grams', 'boxes'], ['the mean time to assemble a desk, which the company says is ' + mu0 + ' minutes', 'minutes', 'desks'], ['the mean battery life, claimed to be ' + mu0 + ' hours', 'hours', 'batteries']]);
    var Ha = sides === 'two' ? '\\ne' : t > 0 ? '>' : '<';
    var intro = 'A test is run on ' + c[0] + ': $H_0: \\mu = ' + mu0 + '$, $H_a: \\mu ' + Ha + ' ' + mu0 + '$. A random sample of ' + n + ' ' + c[2] + ' gives $\\bar{x} = ' + ns(xb) + '$ and $s = ' + s + '$. ';
    var tsteps = ['Standard error: $\\dfrac{s}{\\sqrt{n}} = \\dfrac{' + s + '}{\\sqrt{' + n + '}} = ' + ns(se) + '$.', '$t = \\dfrac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} = \\dfrac{' + ns(xb) + ' - ' + mu0 + '}{' + ns(se) + '} = ' + ns(t) + '$, with $df = ' + df + '$.'];
    var shape = by(ctx, 'tdf', 'crit', 'pval');
    if (shape === 'tdf') return {
      q: intro + 'Find the test statistic $t$ and its degrees of freedom.',
      a: { t: 'multi', parts: [{ label: '$t =$', a: num(t, { tol: 0.01 }) }, { label: 'df $=$', a: num(df) }] },
      steps: tsteps,
      hint: 't = (x̄ − μ₀)/(s/√n), with n − 1 degrees of freedom.'
    };
    var oneTail = 1 - tCdf(M.abs(t), df), pv = sides === 'two' ? 2 * oneTail : oneTail, rej = pv < 0.05;
    if (shape === 'crit') {
      var cr = sides === 'two' ? tstar(95, df) : rd(tInv(0.95, df), 3), rejC = M.abs(t) > cr && (sides === 'two' || true);
      return {
        q: intro + 'At $\\alpha = 0.05$, the critical value is $t^* = ' + T.dec(cr, 3) + '$ (' + (sides === 'two' ? 'two-sided' : 'one-sided') + ', df $= ' + df + '$). Find $t$ and decide.',
        a: { t: 'multi', parts: [{ label: '$t =$', a: num(t, { tol: 0.01 }) }, { label: 'Decision:', a: mcKeep(['Reject $H_0$', 'Fail to reject $H_0$'], rejC ? 0 : 1) }] },
        steps: tsteps.concat(['Compare: $|t| = ' + ns(M.abs(t)) + (rejC ? ' > ' : ' \\le ') + T.dec(cr, 3) + '$, ' + (sides === 'two' ? 'in either tail.' : 'in the direction of $H_a$.'), rejC ? 'The sample mean is too far from ' + mu0 + ' to blame on chance: reject $H_0$.' : 'The difference could easily be chance: fail to reject $H_0$.']),
        hint: 'Reject when the t statistic is beyond the critical value, in the direction of Hₐ.'
      };
    }
    return {
      q: intro + 'Find $t$. Software gives a p-value of $' + t4(pv) + '$. What do you conclude at $\\alpha = 0.05$?',
      a: { t: 'multi', parts: [{ label: '$t =$', a: num(t, { tol: 0.01 }) }, { label: 'Conclusion:', a: mcKeep(['Convincing evidence that $\\mu ' + Ha + ' ' + mu0 + '$', 'Not convincing evidence that $\\mu ' + Ha + ' ' + mu0 + '$'], rej ? 0 : 1) }] },
      steps: tsteps.concat(['p-value $= ' + t4(pv) + (rej ? ' < ' : ' \\ge ') + '0.05$.', rej ? 'Reject $H_0$: the data give convincing evidence that $\\mu ' + Ha + ' ' + mu0 + '$.' : 'Fail to reject $H_0$: the data do not give convincing evidence that $\\mu ' + Ha + ' ' + mu0 + '$.']),
      hint: 'Small p-value → evidence for Hₐ.'
    };
  });

  // ---------------------------------------------------------------- type I and type II errors and power
  var ERR = [
    ['A factory tests $H_0$: the machine is working properly, against $H_a$: it needs repair.', 'Deciding the machine needs repair when it is actually working properly', 'Deciding the machine is fine when it actually needs repair'],
    ['A doctor tests $H_0$: the patient does not have the infection, against $H_a$: the patient has it.', 'Concluding the patient has the infection when the patient does not', 'Missing the infection: concluding the patient does not have it when the patient does'],
    ['A school tests $H_0$: the new reading program works no better than the old one, against $H_a$: it works better.', 'Concluding the new program is better when it is not', 'Failing to notice that the new program really is better'],
    ['A court case can be framed as $H_0$: the defendant is innocent, against $H_a$: the defendant is guilty.', 'Convicting an innocent person', 'Letting a guilty person go free']
  ];
  G('stat.errors-power', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'name', R.pick(['nums', 'power-up', 'name']), R.pick(['power', 'power', 'power-up']));
    if (shape === 'name') {
      var e = R.pick(ERR), which = R.coin() ? 1 : 2;
      return {
        q: e[0] + ' Which describes a Type ' + (which === 1 ? 'I' : 'II') + ' error?',
        a: mc(e[which], [e[3 - which], 'Correctly rejecting a false $H_0$', 'Getting a p-value larger than 1']),
        steps: ['Type I error: rejecting $H_0$ when $H_0$ is true (a false alarm).', 'Type II error: failing to reject $H_0$ when $H_a$ is true (a miss).', 'Here, a Type ' + (which === 1 ? 'I' : 'II') + ' error is: ' + e[which].charAt(0).toLowerCase() + e[which].slice(1) + '.'],
        hint: 'Type I: rejecting a true H₀. Type II: keeping a false H₀.'
      };
    }
    if (shape === 'nums') {
      var a = R.pick(['0.05', '0.01', '0.10']), pw = R.pick(['0.80', '0.90', '0.75', '0.65']);
      return {
        q: 'A test uses $\\alpha = ' + a + '$. For a particular true alternative, its power is $' + pw + '$. Find the probability of a Type I error (when $H_0$ is true) and of a Type II error (for that alternative).',
        a: { t: 'multi', parts: [{ label: '$P(\\text{Type I}) =$', a: num(a) }, { label: '$P(\\text{Type II}) =$', a: num(ns(fix(1 - Number(pw)))) }] },
        steps: ['When $H_0$ is true, we reject it with probability α: $P(\\text{Type I}) = ' + a + '$.', 'Power is the probability of rejecting $H_0$ when this alternative is true. A Type II error is the opposite: $1 - ' + pw + ' = ' + ns(fix(1 - Number(pw))) + '$.'],
        hint: 'α is the Type I error rate; power + P(Type II) = 1.'
      };
    }
    if (shape === 'power-up') {
      var ch = R.pick([['increasing the sample size', 'Power increases'], ['using α = 0.01 instead of α = 0.05', 'Power decreases'], ['the true value being farther from the null value', 'Power increases'], ['using α = 0.10 instead of α = 0.05', 'Power increases']]);
      return {
        q: 'Everything else the same, what is the effect on the power of a test of ' + ch[0] + '?',
        a: mcKeep(['Power increases', 'Power decreases', 'Power does not change'], ch[1] === 'Power increases' ? 0 : 1),
        steps: [{ 'increasing the sample size': 'A larger n makes the sampling distribution narrower, so a real difference is easier to detect.', 'using α = 0.01 instead of α = 0.05': 'A smaller α demands stronger evidence, so the test rejects less often, including when $H_a$ is true. Fewer Type I errors, more Type II errors.', 'the true value being farther from the null value': 'A bigger real effect is easier to tell apart from the null.', 'using α = 0.10 instead of α = 0.05': 'A larger α rejects more easily, so power goes up (at the cost of more Type I errors).' }[ch[0]]],
        hint: 'Power is the chance of detecting a real effect.'
      };
    }
    var P = R.pick(MPAIRS.filter(function (x) { return x[1] >= 16 && x[2] <= 5; })), sg = P[0], n = P[1], se = P[2], mu0 = R.int(20, 60) * 5;
    var cut = rd(mu0 + 1.645 * se, 2), mua = rd(mu0 + R.pick([1.5, 2, 2.5, 3]) * se, 1), z = rd((cut - mua) / se, 2), Pz = phi4(z), pow = rd(1 - Pz, 4);
    return {
      q: 'A test of $H_0: \\mu = ' + mu0 + '$ against $H_a: \\mu > ' + mu0 + '$ uses $n = ' + n + '$ and known $\\sigma = ' + sg + '$, so $\\sigma_{\\bar{x}} = ' + ns(se) + '$. At $\\alpha = 0.05$ it rejects $H_0$ when $\\bar{x} > ' + ns(cut) + '$. Find the power of the test if the true mean is $' + ns(mua) + '$. ' + tableNote([z]),
      a: num(d4(pow), { tol: 0.002 }),
      steps: ['Power = P(reject $H_0$) when $\\mu = ' + ns(mua) + '$ = $P(\\bar{x} > ' + ns(cut) + ')$ for a sampling distribution centered at ' + ns(mua) + '.', '$z = \\dfrac{' + ns(cut) + ' - ' + ns(mua) + '}{' + ns(se) + '} = ' + zs(z) + '$.', 'Power $= 1 - ' + d4(Pz) + ' = ' + d4(pow) + '$.', 'So $P(\\text{Type II}) = ' + d4(rd(Pz, 4)) + '$ for this alternative.'],
      hint: 'Keep the cutoff from H₀, but center the distribution at the true mean.'
    };
  });

  // ---------------------------------------------------------------- randomization tests
  function shuffleDiffs(R, a, b, reps) {
    var all = a.concat(b), na = a.length, out = [];
    for (var r = 0; r < reps; r++) { var s = R.shuffle(all), m1 = 0, m2 = 0; for (var i = 0; i < all.length; i++) { if (i < na) m1 += s[i]; else m2 += s[i]; } out.push(m1 / na - m2 / (all.length - na)); }
    return out;
  }
  G('stat.randomization-tests', function (R, ctx) {
    var L = lv(ctx), n = R.pick([5, 6]), shift = R.int(2, 6), A = [], B = [], base = R.int(10, 30), i;
    for (var t = 0; t < 30; t++) {
      A = []; B = []; for (i = 0; i < n; i++) { A.push(base + shift + R.int(-4, 4)); B.push(base + R.int(-4, 4)); }
      if (sum(A) % n === 0 && sum(B) % n === 0 && sum(A) > sum(B)) break;
    }
    A[0] += (n - sum(A) % n) % n; B[0] -= sum(B) % n; if (sum(A) <= sum(B)) A[1] += n * (1 + (sum(B) - sum(A)) / n);
    var mA = sum(A) / n, mB = sum(B) / n, d = fix(mA - mB);
    var c = R.pick([['fertilizer', 'plants', 'growth (cm)', 'new fertilizer', 'old fertilizer'], ['study method', 'students', 'quiz score', 'new method', 'usual method'], ['sleep plan', 'volunteers', 'reaction score', 'extra sleep', 'normal sleep']]);
    var intro = 'In an experiment, ' + (2 * n) + ' ' + c[1] + ' were randomly assigned to two groups, and each one\'s ' + c[2] + ' was measured. The ' + c[3] + ' group: ' + dataList(A) + '. The ' + c[4] + ' group: ' + dataList(B) + '. ';
    var shape = by(ctx, 'diff', 'pval', R.pick(['assume', 'pval']));
    if (shape === 'diff') return {
      q: intro + 'Find the observed difference in means (' + c[3] + ' minus ' + c[4] + ').',
      a: num(d),
      steps: ['Mean of the ' + c[3] + ' group: $' + sum(A) + ' \\div ' + n + ' = ' + ns(mA) + '$.', 'Mean of the ' + c[4] + ' group: $' + sum(B) + ' \\div ' + n + ' = ' + ns(mB) + '$.', 'Difference: $' + ns(mA) + ' - ' + ns(mB) + ' = ' + ns(d) + '$.'],
      hint: 'Find each group\'s mean, then subtract.'
    };
    var reps = 200, diffs = shuffleDiffs(R, A, B, reps), k = diffs.filter(function (x) { return x >= d - 1e-9; }).length, pv = fix(k / reps), rej = pv < 0.05;
    if (shape === 'pval') return {
      q: intro + 'The observed difference is $' + ns(d) + '$. A computer shuffled the ' + (2 * n) + ' results into two new groups ' + reps + ' times, as if the treatment did nothing. In ' + k + ' of the ' + reps + ' shuffles, the difference was at least $' + ns(d) + '$. Estimate the p-value, and decide at $\\alpha = 0.05$.',
      a: { t: 'multi', parts: [{ label: 'p-value $\\approx$', a: num(ns(pv)) }, { label: 'Conclusion:', a: mcKeep(['The ' + c[3] + ' really seems to help (the difference is hard to explain by chance)', 'The difference could easily be due to chance alone'], rej ? 0 : 1) }] },
      steps: ['Each shuffle shows a difference that chance alone produces when the treatment has no effect.', 'p-value $\\approx \\dfrac{' + k + '}{' + reps + '} = ' + ns(pv) + '$.', rej ? '$' + ns(pv) + ' < 0.05$: a difference this big rarely happens by chance, so there is convincing evidence the treatment works (random assignment lets us say "causes").' : '$' + ns(pv) + ' \\ge 0.05$: chance alone often gives a difference this big, so the evidence is not convincing.'],
      hint: 'The p-value is the fraction of shuffles at least as extreme as what really happened.'
    };
    return {
      q: intro + 'A randomization test shuffles all ' + (2 * n) + ' results into two new groups many times. What does this shuffling assume?',
      a: mc('That the treatment has no effect, so each result would have been the same in either group', ['That the treatment works, so the shuffled groups show its effect', 'That the ' + c[1] + ' were a random sample from a larger population', 'That the results follow a normal distribution']),
      steps: ['The shuffles act out the null hypothesis: if the treatment does nothing, the group labels are arbitrary.', 'So the shuffled differences show how big a difference chance alone can make. No normal model is needed.'],
      hint: 'Which hypothesis makes the group labels meaningless?'
    };
  });

  // ---------------------------------------------------------------- two-sample inference
  var DESIGNS = [
    ['Each of 20 students takes a reading test before and after a summer program. We compare the two scores for each student.', true],
    ['20 randomly chosen students from one school and 20 from another school take the same test. We compare the two schools.', false],
    ['Twins are split up: one twin of each pair tries diet A and the other tries diet B. We compare weight loss.', true],
    ['50 volunteers are randomly assigned to two groups of 25; one group gets a new cream and the other a placebo.', false],
    ['For each of 15 cars, gas mileage is measured once with regular fuel and once with a premium fuel.', true],
    ['Battery lifetimes are measured for 30 batteries of brand A and 30 different batteries of brand B.', false]
  ];
  G('stat.two-sample-inference', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'design', 'twot', R.pick(['paired', 'twot', 'design']));
    if (shape === 'design') {
      var dsg = R.pick(DESIGNS);
      return {
        q: dsg[0] + ' Which analysis fits?',
        a: mcKeep(['A paired analysis: work with the differences within each pair', 'A two-sample analysis: compare two independent groups'], dsg[1] ? 0 : 1),
        steps: [dsg[1] ? 'Each value in one set is linked to a specific value in the other (the same subject, or a matched partner). Use the differences: a one-sample analysis of d.' : 'The two groups are separate individuals with no natural pairing, so they are independent samples.', 'Treating paired data as independent wastes the pairing and usually overstates the uncertainty.'],
        hint: 'Is each value in one group linked to one specific value in the other?'
      };
    }
    if (shape === 'twot') {
      var tr = R.pick(TRIPLES.slice(0, 3)), n1 = R.pick([9, 16, 25]), n2 = R.pick([9, 16, 25]), s1 = tr[0] * M.sqrt(n1), s2 = tr[1] * M.sqrt(n2), se = tr[2];
      var t = R.pick([0.8, 1.2, 1.6, 2, 2.4, 2.8, 3.2]), dm = fix(t * se), x2 = R.int(200, 400), x1 = fix(x2 + dm);
      var g2 = R.pick([['Battery lifetimes (minutes) for two brands', 'Brand 1', 'Brand 2'], ['Weekly screen times (minutes) at two schools', 'School 1', 'School 2'], ['Delivery times (minutes) for two routes', 'Route 1', 'Route 2']]);
      return {
        q: g2[0] + ' are compared using independent random samples. ' + g2[1] + ': $n_1 = ' + n1 + '$, $\\bar{x}_1 = ' + ns(x1) + '$, $s_1 = ' + s1 + '$. ' + g2[2] + ': $n_2 = ' + n2 + '$, $\\bar{x}_2 = ' + x2 + '$, $s_2 = ' + s2 + '$. Find the standard error of $\\bar{x}_1 - \\bar{x}_2$ and the two-sample t statistic.',
        a: { t: 'multi', parts: [{ label: '$SE =$', a: num(se) }, { label: '$t =$', a: num(t, { tol: 0.01 }) }] },
        steps: ['Variances of independent estimates add: $SE = \\sqrt{\\dfrac{s_1^2}{n_1} + \\dfrac{s_2^2}{n_2}} = \\sqrt{\\dfrac{' + (s1 * s1) + '}{' + n1 + '} + \\dfrac{' + (s2 * s2) + '}{' + n2 + '}} = \\sqrt{' + (tr[0] * tr[0]) + ' + ' + (tr[1] * tr[1]) + '} = ' + se + '$.', '$t = \\dfrac{\\bar{x}_1 - \\bar{x}_2}{SE} = \\dfrac{' + ns(x1) + ' - ' + x2 + '}{' + se + '} = ' + ns(t) + '$.'],
        hint: 'Add s²/n for the two groups, then take the square root.'
      };
    }
    var np = R.pick([9, 16, 25, 36]), sd = M.sqrt(np) * R.pick([0.5, 1, 1.5, 2]), sed = rd(sd / M.sqrt(np), 2), t2 = R.pick([1.5, 2, 2.5, 3, 1.2]), db = fix(t2 * sed);
    return {
      q: 'In a paired study of ' + np + ' people, each person\'s score was measured before and after a training session. The differences (after minus before) have mean $\\bar{d} = ' + ns(db) + '$ and standard deviation $s_d = ' + sd + '$. Find the standard error of $\\bar{d}$ and the paired t statistic.',
      a: { t: 'multi', parts: [{ label: '$SE =$', a: num(sed) }, { label: '$t =$', a: num(t2, { tol: 0.01 }) }] },
      steps: ['Paired data: analyze the ' + np + ' differences as one sample.', '$SE = \\dfrac{s_d}{\\sqrt{n}} = \\dfrac{' + sd + '}{\\sqrt{' + np + '}} = ' + ns(sed) + '$.', 'Under $H_0$ the mean difference is 0, so $t = \\dfrac{\\bar{d}}{SE} = \\dfrac{' + ns(db) + '}{' + ns(sed) + '} = ' + ns(t2) + '$, with $df = ' + (np - 1) + '$.'],
      hint: 'Treat the differences as a single sample.'
    };
  });

  // ---------------------------------------------------------------- chi-square tests
  G('stat.chi-square-tests', function (R, ctx) {
    var L = lv(ctx), shape = by(ctx, 'gofE', R.pick(['stat', 'gofE']), R.pick(['twoway', 'stat', 'counts']));
    if (shape === 'gofE') {
      var g = R.pick([[['red', 'blue', 'green', 'yellow'], [40, 30, 20, 10]], [['A', 'B', 'C'], [50, 30, 20]], [['rock', 'paper', 'scissors'], [Q(1, 3), Q(1, 3), Q(1, 3)]], [['spring', 'summer', 'fall', 'winter'], [25, 25, 25, 25]]]);
      var props = g[1].map(function (p) { return p instanceof Q ? p : Q(p, 100); }), n = R.pick([60, 120, 150, 300, 600].filter(function (x) { return props.every(function (p) { return p.mul(x).isInt(); }); })) || 300;
      var i = R.int(0, g[0].length - 1), E = props[i].mul(n);
      return {
        q: 'A model says the categories ' + U.list(g[0]) + ' occur with proportions ' + U.list(props.map(function (p) { return '$' + (p.isTerminating() ? qv(p) : p.toTex()) + '$'; })) + '. In a sample of ' + n + ', what is the expected count for ' + g[0][i] + ', and how many degrees of freedom does the goodness-of-fit test have?',
        a: { t: 'multi', parts: [{ label: 'expected count $=$', a: num(qv(E)) }, { label: 'df $=$', a: num(g[0].length - 1) }] },
        steps: ['Expected count = sample size × model proportion: $' + n + ' \\times ' + (props[i].isTerminating() ? qv(props[i]) : props[i].toTex()) + ' = ' + qv(E) + '$.', 'df = number of categories − 1 = $' + g[0].length + ' - 1 = ' + (g[0].length - 1) + '$.'],
        hint: 'Expected = n × proportion; df = categories − 1.'
      };
    }
    if (shape === 'stat' || shape === 'counts') {
      var E2 = R.pick([[20, 20, 20, 20], [25, 25, 50], [30, 30, 40], [40, 40, 20], [50, 25, 25], [10, 20, 30, 40]]), O2, tries = 0;
      do { O2 = E2.map(function (e) { return e + R.int(-8, 8); }); var dsum = sum(O2) - sum(E2); O2[O2.length - 1] -= dsum; tries++; } while (O2.some(function (o) { return o < 1; }) && tries < 20);
      var parts = O2.map(function (o, j) { return Q((o - E2[j]) * (o - E2[j]), E2[j]); }), X2 = parts.reduce(function (s, p) { return s.add(p); }, Q(0)), df = E2.length - 1;
      var tab = table(['Category'].concat(E2.map(function (_, j) { return String.fromCharCode(65 + j); })), [['Observed'].concat(O2.map(String)), ['Expected'].concat(E2.map(String))]);
      if (shape === 'stat') return {
        q: 'Compute the chi-square statistic for this goodness-of-fit test.' + tab,
        a: { t: 'num', v: qv(X2), tol: 0.01 },
        steps: ['$\\chi^2 = \\sum \\dfrac{(O - E)^2}{E}$, using counts.', O2.map(function (o, j) { return '\\dfrac{(' + o + ' - ' + E2[j] + ')^2}{' + E2[j] + '}'; }).join(' + ').replace(/^/, '$').replace(/$/, '$'), '$= ' + parts.map(function (p) { return qv(p); }).join(' + ') + ' = ' + qv(X2) + '$.', 'df $= ' + df + '$. Larger values mean the counts are farther from what the model predicts.'],
        hint: 'For each category, square (observed − expected) and divide by expected. Then add.'
      };
      var N2 = sum(O2), pc = O2.map(function (o) { return Q(o * 100, N2); });
      return {
        q: 'A student wants a chi-square test for these results, but writes the observed values as percents of the total (' + pc.map(function (p) { return '$' + ns(rd(p.toNumber(), 1)) + '\\%$'; }).join(', ') + ') instead of counts. Why is that a mistake?' + tab,
        a: mc('$\\chi^2$ must use counts: percents hide the sample size, and the same percents from a bigger sample are stronger evidence', ['Percents are fine, as long as they add to 100%', 'Percents always give a smaller $\\chi^2$, so the test is too strict', 'Chi-square tests only work for two categories']),
        steps: ['$\\chi^2 = \\sum (O - E)^2/E$ grows with the sample size: the same pattern in 1,000 observations is much stronger evidence than in 100.', 'Converting to percents throws that information away, so the statistic and the p-value would be wrong. Always use the counts.'],
        hint: 'What does the sample size do to the evidence?'
      };
    }
    var T0 = R.pick(TWOWAY.filter(function (x) { return x.rows.length * x.cols.length <= 6; })), tw = twoWay(R, T0, 12, 60), i2 = R.int(0, T0.rows.length - 1), j2 = R.int(0, T0.cols.length - 1), Ex = Q(tw.rt[i2] * tw.ct[j2], tw.N);
    return {
      q: 'For a chi-square test of independence on this table, find the expected count for the cell in row "' + T0.rows[i2] + '" and column "' + T0.cols[j2] + '", and the degrees of freedom.' + tw.html,
      a: { t: 'multi', parts: [{ label: 'expected count $=$', a: { t: 'num', v: ns(rd(Ex.toNumber(), 2)), tol: 0.01 } }, { label: 'df $=$', a: num((T0.rows.length - 1) * (T0.cols.length - 1)) }] },
      steps: ['If the variables are independent, each row has the same column percents as the whole table.', 'Expected count $= \\dfrac{\\text{row total} \\times \\text{column total}}{\\text{grand total}} = \\dfrac{' + tw.rt[i2] + ' \\times ' + tw.ct[j2] + '}{' + tw.N + '} \\approx ' + ns(rd(Ex.toNumber(), 2)) + '$.', 'df $= (r - 1)(c - 1) = (' + T0.rows.length + ' - 1)(' + T0.cols.length + ' - 1) = ' + ((T0.rows.length - 1) * (T0.cols.length - 1)) + '$.'],
      hint: 'Row total times column total, divided by the grand total.'
    };
  });

  // ---------------------------------------------------------------- inference for the slope
  G('stat.regression-inference', function (R, ctx) {
    var c = R.pick([['hours of practice', 'score', 1], ['temperature (°F)', 'hot cocoa sales', -1], ['age (years)', 'reaction time (ms)', 1], ['advertising (thousands)', 'revenue (thousands)', 1], ['temperature (°F)', 'iced tea sales', 1]]);
    var L = lv(ctx), se = R.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1.2, 1.5, 2]), t = R.pick([1.5, 2, 2.5, 3, 4, 1.2, 0.8, 5]) * c[2], b = fix(t * se), n = R.pick([12, 15, 18, 20, 22, 25, 27, 30]), df = n - 2, a = R.int(5, 60);
    var out = table(['Predictor', 'Coefficient', 'SE'], [['Constant', ns(a), ns(R.pick([1.5, 2.1, 3.4, 4.8]))], [c[0], ns(b), ns(se)]], 'Regression output for ' + n + ' observations');
    var intro = 'A least-squares regression of ' + c[1] + ' on ' + c[0] + ' gives this output. ' + out;
    var shape = by(ctx, 'tdf', 'ci', 'pval');
    if (shape === 'tdf') return {
      q: intro + 'Find the t statistic for testing $H_0: \\beta = 0$ (no linear relationship), and its degrees of freedom.',
      a: { t: 'multi', parts: [{ label: '$t =$', a: num(t, { tol: 0.01 }) }, { label: 'df $=$', a: num(df) }] },
      steps: ['Under $H_0$ the slope is 0, so $t = \\dfrac{b}{SE_b} = \\dfrac{' + ns(b) + '}{' + ns(se) + '} = ' + ns(t) + '$.', 'For the slope, df $= n - 2 = ' + df + '$ (two numbers, a and b, were estimated).'],
      hint: 't = slope ÷ its standard error; df = n − 2.'
    };
    var ts = tstar(95, df), lo = rd(b - ts * se, 4), hi = rd(b + ts * se, 4);
    if (shape === 'ci') return {
      q: intro + 'Construct a 95% confidence interval for the true slope $\\beta$. (For ' + df + ' degrees of freedom, $t^* = ' + T.dec(ts, 3) + '$.)',
      a: { t: 'multi', parts: [{ label: 'lower end $=$', a: num(ns(lo), { tol: 0.01 }) }, { label: 'upper end $=$', a: num(ns(hi), { tol: 0.01 }) }] },
      steps: ['$b \\pm t^* \\cdot SE_b = ' + ns(b) + ' \\pm ' + T.dec(ts, 3) + ' \\times ' + ns(se) + ' = ' + ns(b) + ' \\pm ' + ns(rd(ts * se, 4)) + '$.', 'From $' + ns(lo) + '$ to $' + ns(hi) + '$.', (lo > 0 || hi < 0) ? 'The interval does not include 0, so the data give convincing evidence of a linear relationship.' : 'The interval includes 0, so "no linear relationship" is still plausible.'],
      hint: 'Slope ± t* times its standard error.'
    };
    var pv = 2 * (1 - tCdf(M.abs(t), df)), rej = pv < 0.05;
    return {
      q: intro + 'For $H_0: \\beta = 0$ against $H_a: \\beta \\ne 0$, software gives a p-value of $' + t4(pv) + '$. What do you conclude at $\\alpha = 0.05$?',
      a: rej ? mc('There is convincing evidence of a linear relationship between ' + c[0] + ' and ' + c[1] + ' in the population.', ['There is no relationship at all between the variables.', 'The slope of the sample line is exactly ' + ns(b) + ' in the population.', c[0].replace(/ \(.*\)/, '') + ' causes changes in ' + c[1].replace(/ \(.*\)/, '') + '.'])
        : mc('There is not convincing evidence of a linear relationship in the population; the sample slope could be due to chance.', ['There is convincing evidence of a linear relationship.', 'This proves the true slope is exactly 0.', 'The p-value shows the slope is ' + ns(b) + ' with 95% probability.']),
      steps: ['$t = ' + ns(b) + ' / ' + ns(se) + ' = ' + ns(t) + '$ with df $= ' + df + '$, p-value $= ' + t4(pv) + '$.', rej ? 'Since $' + t4(pv) + ' < 0.05$, reject $H_0$. (An observational study still does not show cause.)' : 'Since $' + t4(pv) + ' \\ge 0.05$, fail to reject $H_0$; that does not prove the slope is 0.'],
      hint: 'Compare the p-value with α, and state the conclusion about the population slope.'
    };
  });


})(typeof window !== 'undefined' ? window.MathLadder : globalThis.MathLadder);
