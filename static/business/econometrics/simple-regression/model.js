/* Econometrics, Chapter 4: the models behind the interactives (window.EC4Model in the browser, module.exports in Node,
   where it is unit-tested). Needs EconStats (../stats.js).
   1. Ordinary least squares for a handful of points, from the formulas β̂₁ = Σ(x − x̄)(y − ȳ)/Σ(x − x̄)², β̂₀ = ȳ − β̂₁x̄.
   2. Simulated heights of parents and children, for Galton's regression to the mean.                            */
(function (root) {
  'use strict';
  var ES = root.EconStats || (typeof require === 'function' ? require('../stats.js') : null);
  var M = Math;

  function fit(P) { // P = [[x, y], ...]
    var n = P.length, out = { n: n };
    if (n < 2) return out;
    var mx = 0, my = 0, i; for (i = 0; i < n; i++) { mx += P[i][0]; my += P[i][1]; } mx /= n; my /= n;
    var sxx = 0, sxy = 0, sst = 0; for (i = 0; i < n; i++) { var dx = P[i][0] - mx, dy = P[i][1] - my; sxx += dx * dx; sxy += dx * dy; sst += dy * dy; }
    out.xbar = mx; out.ybar = my; out.sxx = sxx; out.sxy = sxy; out.sst = sst;
    out.cov = sxy / (n - 1); out.varx = sxx / (n - 1);
    if (!(sxx > 1e-12)) return out;                       // no variation in x: the slope is not defined
    out.b1 = sxy / sxx; out.b0 = my - out.b1 * mx;
    out.ssr = ssr(P, out.b0, out.b1); out.sse = sst - out.ssr; out.r2 = sst > 0 ? 1 - out.ssr / sst : NaN;
    out.r = sst > 0 ? sxy / M.sqrt(sxx * sst) : NaN;
    return out;
  }
  function ssr(P, a, b) { var s = 0; for (var i = 0; i < P.length; i++) { var e = P[i][1] - a - b * P[i][0]; s += e * e; } return s; }
  // the best intercept for a given slope (the line through the means) and the SSR bowl: SSR(b) = SST − 2b·Sxy + b²·Sxx
  function bowl(F, b) { return F.sst - 2 * b * F.sxy + b * b * F.sxx; }

  var PRESETS = {
    study: { name: 'Study time', xl: 'hours studied', yl: 'exam score', x: [0, 10], y: [40, 100], unitX: 'hour', unitY: 'points',
      pts: [[1, 52], [2, 60], [3, 58], [4, 70], [5, 75], [6, 71], [7, 82], [8, 79], [9, 90], [2.5, 64], [6.5, 80], [8.5, 84]] },
    ads: { name: 'Ads and sales', xl: 'ad spending ($1,000s a month)', yl: 'sales ($1,000s a month)', x: [0, 20], y: [0, 200], unitX: '$1,000 of ads', unitY: '$1,000 of sales',
      pts: [[2, 48], [4, 70], [5, 61], [7, 95], [8, 88], [10, 118], [11, 104], [13, 131], [14, 150], [16, 142], [18, 170], [19, 160]] },
    outlier: { name: 'An outlier', xl: 'hours studied', yl: 'exam score', x: [0, 10], y: [40, 100], unitX: 'hour', unitY: 'points',
      pts: [[1, 52], [2, 60], [3, 58], [4, 70], [5, 75], [6, 71], [7, 82], [8, 79], [2.5, 64], [6.5, 80], [9.5, 45]] },
    none: { name: 'No link', xl: 'shoe size', yl: 'exam score', x: [5, 13], y: [40, 100], unitX: 'size', unitY: 'points',
      pts: [[6, 72], [7, 55], [7.5, 88], [8, 64], [8.5, 79], [9, 60], [9.5, 92], [10, 70], [10.5, 58], [11, 83], [11.5, 66], [12, 75]] },
    line: { name: 'Perfect line', xl: 'hours worked', yl: 'pay ($)', x: [0, 10], y: [0, 300], unitX: 'hour', unitY: 'dollars',
      pts: [[1, 25], [2, 50], [3, 75], [4, 100], [5, 125], [6, 150], [7, 175], [8, 200], [9, 225]] }
  };

  // ---------- heights of parents and children (inches) ----------
  // 'fs': a parent and a grown child of the same sex, both N(68.9, 3²), correlation 0.5 (simulated).
  // 'galton': mid-parents N(68.3, 1.8²) and children = 68.3 + (2/3)(mid-parent − 68.3) + N(0, 2.19²), Galton's 2/3.
  var HSETS = {
    fs: { name: 'Parent and child', mx: 68.9, sx: 3, my: 68.9, beta: 0.5, se: 3 * M.sqrt(0.75), xl: 'parent’s height (inches)', yl: 'grown child’s height (inches)' },
    galton: { name: 'Galton’s mid-parents', mx: 68.3, sx: 1.8, my: 68.3, beta: 2 / 3, se: 2.19, xl: 'mid-parent height (inches)', yl: 'grown child’s height (inches)' }
  };
  function heights(key, n, seed) {
    var H = HSETS[key], r = ES.rng(seed), P = [];
    for (var i = 0; i < n; i++) { var x = H.mx + H.sx * r.n(); P.push([x, H.my + H.beta * (x - H.mx) + H.se * r.n()]); }
    return P;
  }
  function band(P, lo, hi, axis) { // average of the other coordinate for points whose `axis` coordinate is in [lo, hi]
    var a = 0, b = 0, k = 0; for (var i = 0; i < P.length; i++) { var v = P[i][axis]; if (v >= lo && v <= hi) { a += P[i][axis]; b += P[i][1 - axis]; k++; } }
    return k ? { k: k, own: a / k, other: b / k } : { k: 0 };
  }

  var API = { fit: fit, ssr: ssr, bowl: bowl, PRESETS: PRESETS, HSETS: HSETS, heights: heights, band: band };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.EC4Model = API;
})(typeof window !== 'undefined' ? window : this);
