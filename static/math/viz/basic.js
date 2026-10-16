/* Math Ladder visuals, set A: the pictures for Kindergarten to Grade 8 and Geometry (static/math/viz/basic.js).
   Built on the toolkit in static/math/viz/core.js (window.MathLadder.viz); styles in basic.css.

   Use:  <div class="ml-viz" data-viz="NAME" data-opts='{"n": 7}'></div>

   Visuals in this file (each one's options are documented right above its code):
     tenframe counters numberbond hundredchart coins clock                        (counting, place, time, money)
     numberline base10 placevalue arraygrid areamodel                              (number sense, operations)
     fractionbar fractioncircle fractionline decimalgrid percentbar ratiotable tapediagram
     balance integerline                                                           (equations, signed numbers)
     shapes geoboard angle transform pythagoras circlepi areaformulas volume nets  (geometry)
     dotplot boxplot                                                               (data)

   Options every visual understands:
     label     words for screen readers (the aria-label); each visual has a good default
     title     a short heading shown above the picture
     task      a small goal for the learner (see each visual). The visual checks it as they work, says so
               kindly when it's done, and gives a gentle hint when they press "Check". Any task also takes
               text (your own wording for the goal) and yes (your own words for success).
               When solved, the element gets the class "mlb-done" and fires a bubbling "ml-task" event.
     controls  false hides the buttons and sliders (a still picture inside a problem); default true
     quiet     true (or readout: false) hides the live readout line under the picture, so a picture inside a problem
               doesn't state the answer (counts, totals, products, measures). volume keeps a readout without numbers.
               The picture also leaves off numbers it works out: clock's digital time, base10's column counts,
               decimalgrid's value, percentbar's amounts (all but the whole), geoboard's lengths, angles and area (unless
               show asks), angle's degree labels, nets' face areas (unless labels: true), boxplot's and dotplot's
               statistics (names only), areamodel's products (hidden until pressed, unless hide: false).
               Default false: everything shows as before.
   Numbers may be written as strings: "3/4", "2 1/2", "0.75" and "-3" all work where a number is expected.
   Keyboard: every draggable thing is also a focusable handle (Tab to it, arrow keys move it, Shift moves farther);
   every other action is a real button.                                                                                */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {};
  var M = Math, PI = M.PI, TAU = 2 * PI;
  var V = null;   // the toolkit, set when this file boots
  var defs = [];
  function def(name, fn) { defs.push([name, fn]); }

  /* ---------------------------------------------------------------- numbers */
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a && b ? M.abs(a / gcd(a, b) * b) : 0; }
  function rat(n, d) { d = d === undefined ? 1 : d; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; return { n: n / g, d: d / g, v: n / d }; }
  function parseQ(s) {
    if (s == null || s === '') return null;
    if (typeof s === 'number') {
      if (!isFinite(s)) return null; if (s === M.round(s)) return rat(s, 1);
      var k = 0, p = 1; while (k < 9 && M.abs(s * p - M.round(s * p)) > 1e-9 * p) { k++; p *= 10; }
      return rat(M.round(s * p), p);
    }
    s = String(s).trim().replace(/[−–]/g, '-').replace(/,/g, '');
    var m = s.match(/^([+-]?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (m) { var d = +m[4]; if (!d) return null; var r = rat(+m[2] * d + +m[3], d); return m[1] === '-' ? rat(-r.n, r.d) : r; }
    m = s.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/); if (m) return +m[2] ? rat(+m[1], +m[2]) : null;
    m = s.match(/^([+-]?)(\d*)\.?(\d*)$/);
    if (m && (m[2] || m[3])) { var dd = M.pow(10, m[3].length), nn = +(m[2] || 0) * dd + +(m[3] || 0); return rat(m[1] === '-' ? -nn : nn, dd); }
    return null;
  }
  /* "n/d" kept as written (2/4 stays 2/4); anything else goes through parseQ */
  function rawQ(s) { var m = String(s == null ? '' : s).match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/); if (m && +m[2]) return { n: +m[1], d: +m[2], v: +m[1] / +m[2] }; return parseQ(s); }
  function num(s, dflt) { var q = parseQ(s); return q ? q.v : dflt; }
  function int(s, dflt, lo, hi) { var v = num(s, dflt); v = M.round(v); if (lo !== undefined) v = M.max(lo, v); if (hi !== undefined) v = M.min(hi, v); return v; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function near(a, b, e) { return M.abs(a - b) <= (e || 1e-9); }
  function minus(s) { return String(s).replace(/-/g, '−'); }
  function f(v, d) { // like the toolkit's fmt: up to d decimals (default 2), no trailing zeros, real minus sign
    if (!isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : '—';
    var s = (+v).toFixed(d === undefined ? 2 : d); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0'; return s.replace('-', '−');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function qadd(a, b) { return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
  function qmul(a, b) { return rat(a.n * b.n, a.d * b.d); }
  /* a rational as plain text: "3/4", "1 1/4" (form "mixed") or "0.75" (form "dec") */
  function qText(q, form) {
    if (q.d === 1) return minus(q.n);
    if (form === 'dec') return f(q.v, 4);
    if (form === 'mixed' && M.abs(q.n) > q.d) return minus(M.trunc(q.n / q.d)) + ' ' + (M.abs(q.n) % q.d) + '/' + q.d;
    return minus(q.n) + '/' + q.d;
  }
  /* a fraction as HTML: stacked for the eye, "3/4" for screen readers */
  function fr(n, d, w) {
    var sr = (w ? w + ' and ' : '') + n + '/' + d;
    return '<span class="mlb-q"><span class="mlb-qv" aria-hidden="true">' + (w ? '<span class="mlb-qw">' + w + '</span>' : '') +
      '<span class="mlb-fr"><span>' + n + '</span><span>' + d + '</span></span></span><span class="mlb-sr">' + sr + '</span></span>';
  }
  function qH(q, form) {
    if (q.d === 1) return minus(q.n);
    if (form === 'dec') return f(q.v, 4);
    var s = q.n < 0 ? '−' : '', a = M.abs(q.n);
    if (form === 'mixed' && a > q.d) return s + fr(a % q.d, q.d, M.floor(a / q.d));
    return s + fr(a, q.d);
  }
  function sq(n) { // exact square root of a non-negative integer as {k, m}: k√m
    var k = 1, m = n; for (var i = 2; i * i <= m; i++) while (m % (i * i) === 0) { m /= i * i; k *= i; }
    return { k: k, m: m };
  }
  function rootText(n2) { // n2 = a squared length (a number). "5", "2√3 ≈ 3.46" or "3.61"
    var r = M.sqrt(n2);
    if (near(r, M.round(r), 1e-9)) return f(M.round(r));
    if (near(n2, M.round(n2), 1e-9) && n2 < 1e6) { var s = sq(M.round(n2)); return (s.k > 1 ? s.k : '') + '√' + s.m + ' ≈ ' + f(r); }
    return f(r);
  }
  var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function words(n) { // whole numbers below one trillion, in words
    n = M.floor(M.abs(n)); if (n < 20) return ONES[n];
    if (n < 100) return TENS[M.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) return ONES[M.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + words(n % 100) : '');
    var big = [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
    for (var i = 0; i < big.length; i++) if (n >= big[i][0]) { var h = M.floor(n / big[i][0]), r = n % big[i][0]; return words(h) + ' ' + big[i][1] + (r ? ' ' + words(r) : ''); }
    return String(n);
  }
  var DEN = { 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 7: 'sevenths', 8: 'eighths', 9: 'ninths', 10: 'tenths', 11: 'elevenths', 12: 'twelfths', 100: 'hundredths' };
  function dName(d) { return DEN[d] || d + 'ths'; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function seeded(seed) { var s = (seed >>> 0) || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  /* ---------------------------------------------------------------- statistics (used by dotplot and boxplot) */
  function sorted(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function mean(a) { if (!a.length) return NaN; var s = 0; a.forEach(function (v) { s += v; }); return s / a.length; }
  function median(a) { var s = sorted(a), n = s.length; if (!n) return NaN; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  /* five-number summary; quartiles are the medians of the lower and upper halves, leaving out the middle value when n is odd */
  function five(a) {
    var s = sorted(a), n = s.length; if (!n) return null;
    var h = M.floor(n / 2), lo = s.slice(0, h), hi = s.slice(n % 2 ? h + 1 : h);
    if (n === 1) { lo = s; hi = s; }
    return { min: s[0], q1: median(lo), med: median(s), q3: median(hi), max: s[n - 1], n: n };
  }
  function modes(a) {
    var c = {}, best = 0, out = []; a.forEach(function (v) { var k = String(+v.toFixed(9)); c[k] = (c[k] || 0) + 1; best = M.max(best, c[k]); });
    if (best < 2) return [];
    Object.keys(c).forEach(function (k) { if (c[k] === best) out.push(+k); }); return out.sort(function (x, y) { return x - y; });
  }
  function mad(a) { var m = mean(a); return mean(a.map(function (v) { return M.abs(v - m); })); }

  /* ---------------------------------------------------------------- look */
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }
  function soft(hex, a) { var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  /* the toolkit palette plus a few warm, friendly tones for the young-learner visuals */
  function C() {
    var c = V.colors(), dk = isDark();
    c.dark = dk;
    c.yellow = dk ? '#f2c94c' : '#ffcf3f'; c.yellowEdge = dk ? '#b8912a' : '#d9a300';
    c.redC = dk ? '#f08080' : '#ee5d6c'; c.redEdge = dk ? '#c25560' : '#c93a4b';
    c.blueC = dk ? '#7cb8f2' : '#4f93e0'; c.blueEdge = dk ? '#4f88c2' : '#2f6fb8';
    c.greenC = dk ? '#74d0a0' : '#38b27a'; c.greenEdge = dk ? '#4a9c72' : '#1f8a58';
    c.empty = dk ? '#223529' : '#f4f1e8'; c.line = dk ? '#3b5a48' : '#cfd9d2'; c.frame = dk ? '#4f7a62' : '#1d5c3c';
    c.shade = dk ? 'rgba(108,199,154,.55)' : 'rgba(0,112,60,.55)';
    return c;
  }
  var FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', KFONT = 'ui-rounded,"SF Pro Rounded","Arial Rounded MT Bold",system-ui,sans-serif';
  function font(sz, wt, kid) { return (wt || 400) + ' ' + sz + 'px ' + (kid ? KFONT : FONT); }
  function tx(ctx, s, x, y, o) {
    o = o || {}; ctx.save(); ctx.font = o.font || font(o.size || 14, o.wt, o.kid); ctx.fillStyle = o.col || C().ink;
    ctx.textAlign = o.al || 'center'; ctx.textBaseline = o.bl || 'middle';
    if (o.halo) { ctx.lineWidth = o.haloW || 4; ctx.strokeStyle = o.halo; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillText(s, x, y); ctx.restore();
  }
  function tw(ctx, s, fnt) { ctx.save(); ctx.font = fnt; var w = ctx.measureText(s).width; ctx.restore(); return w; }
  /* a stacked fraction centered at (x, y); returns its width. o: {size, col, wt, kid, whole, halo} */
  function fracDraw(ctx, n, d, x, y, o) {
    o = o || {}; var sz = o.size || 15, fn = font(sz, o.wt || 600, o.kid), col = o.col || C().ink;
    var ns = minus(n), ds = String(d), ws = o.whole != null ? minus(o.whole) : '';
    var w1 = M.max(tw(ctx, ns, fn), tw(ctx, ds, fn)) + 4, ww = ws ? tw(ctx, ws, font(sz * 1.15, o.wt || 600, o.kid)) + 3 : 0, W2 = w1 + ww;
    var x0 = x - W2 / 2;
    if (ws) tx(ctx, ws, x0 + ww / 2 - 1, y, { font: font(sz * 1.15, o.wt || 600, o.kid), col: col, halo: o.halo });
    var cx = x0 + ww + w1 / 2;
    tx(ctx, ns, cx, y - sz * 0.62, { font: fn, col: col, halo: o.halo });
    tx(ctx, ds, cx, y + sz * 0.66, { font: fn, col: col, halo: o.halo });
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = M.max(1.2, sz / 11); ctx.beginPath(); ctx.moveTo(cx - w1 / 2 + 1, y); ctx.lineTo(cx + w1 / 2 - 1, y); ctx.stroke(); ctx.restore();
    return W2;
  }
  /* draws a rational q as a stacked fraction (or a whole number) centered at x, y */
  function qDraw(ctx, q, x, y, o) {
    o = o || {};
    if (q.d === 1) { tx(ctx, minus(q.n), x, y, { size: (o.size || 15) * 1.15, wt: o.wt || 600, kid: o.kid, col: o.col, halo: o.halo }); return; }
    var neg = q.n < 0, a = M.abs(q.n), oo = Object.assign({}, o);
    if (o.form === 'dec') { tx(ctx, f(q.v, 4), x, y, { size: (o.size || 15), wt: o.wt || 600, kid: o.kid, col: o.col, halo: o.halo }); return; }
    if (o.form === 'mixed' && a > q.d) { oo.whole = (neg ? '-' : '') + M.floor(a / q.d); fracDraw(ctx, a % q.d, q.d, x, y, oo); return; }
    fracDraw(ctx, (neg ? '-' : '') + a, q.d, x, y, oo);
  }
  function rr(ctx, x, y, w, h, r) {
    if (w < 0) { x += w; w = -w; } if (h < 0) { y += h; h = -h; }
    r = M.max(0, M.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function fillRR(ctx, x, y, w, h, r, fill, stroke, lw) { rr(ctx, x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } }
  function disc(ctx, x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, M.max(0, r), 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } }
  function ln(ctx, x1, y1, x2, y2, col, lw, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw || 1.5; ctx.lineCap = 'round'; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore(); }
  function poly(ctx, pts, fill, stroke, lw, dash) {
    if (!pts.length) return; ctx.save(); ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []); ctx.stroke(); } ctx.restore();
  }
  function arw(ctx, x1, y1, x2, y2, col, lw, head, dash) {
    var a = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(head || 9, L * 0.6);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = lw || 2; ctx.lineCap = 'round'; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.7 * M.cos(a), y2 - hs * 0.7 * M.sin(a)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(a - 0.42), y2 - hs * M.sin(a - 0.42)); ctx.lineTo(x2 - hs * M.cos(a + 0.42), y2 - hs * M.sin(a + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  /* a curly brace from (x1, y) to (x2, y) opening down (up = true opens up), with a label */
  function brace(ctx, x1, x2, y, up, col, lw) {
    var s = up ? -1 : 1, h = 8 * s, m = (x1 + x2) / 2, q = M.min(12, (x2 - x1) / 4);
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw || 1.6; ctx.beginPath();
    ctx.moveTo(x1, y + h); ctx.quadraticCurveTo(x1, y, x1 + q, y); ctx.lineTo(m - q, y); ctx.quadraticCurveTo(m, y, m, y - h);
    ctx.quadraticCurveTo(m, y, m + q, y); ctx.lineTo(x2 - q, y); ctx.quadraticCurveTo(x2, y, x2, y + h); ctx.stroke(); ctx.restore();
  }
  /* a counter with a soft highlight */
  function counter(ctx, x, y, r, fill, edge, mark) {
    disc(ctx, x, y, r, fill, edge, M.max(1.5, r / 9));
    ctx.save(); ctx.globalAlpha = 0.35; disc(ctx, x - r * 0.32, y - r * 0.32, r * 0.28, '#ffffff'); ctx.restore();
    if (mark) tx(ctx, mark, x, y + 0.5, { size: M.round(r * 1.2), wt: 800, col: edge });
  }

  /* ---------------------------------------------------------------- motion */
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - M.pow(-2 * t + 2, 2) / 2; }
  /* tween(ms, fn(p), done): calls fn with eased progress 0…1; jumps to the end when the visitor prefers less motion */
  function tween(ms, fn, done) {
    var stop = false, t0 = null;
    if (V.reduced || ms <= 0) { fn(1); if (done) done(); return { stop: function () { } }; }
    function step(t) { if (stop) return; if (t0 === null) t0 = t; var p = M.min(1, (t - t0) / ms); fn(ease(p), p); if (p < 1) W.requestAnimationFrame(step); else if (done) done(); }
    W.requestAnimationFrame(step); return { stop: function () { stop = true; } };
  }

  /* ---------------------------------------------------------------- pointer: drag a handle, or tap */
  /* o: {hit(x, y) -> handle or null, start(h, x, y), move(h, x, y, e), end(h), tap(x, y, h), over(x, y) -> cursor} */
  function ptr(cv, o) {
    var act = null, id = null, x0 = 0, y0 = 0, moved = false, down = false;
    function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return; var p = pos(e); x0 = p[0]; y0 = p[1]; moved = false; down = true; id = e.pointerId;
      act = o.hit ? o.hit(p[0], p[1], e) : null;
      if (act != null) { try { cv.setPointerCapture(id); } catch (er) { } if (o.start) o.start(act, p[0], p[1], e); e.preventDefault(); cv.style.cursor = 'grabbing'; }
    });
    cv.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (!down) { var cur = o.hit && o.hit(p[0], p[1], e) != null ? 'grab' : (o.over ? o.over(p[0], p[1]) || '' : ''); if (cv.style.cursor !== cur) cv.style.cursor = cur; return; }
      if (e.pointerId !== id) return;
      if (M.hypot(p[0] - x0, p[1] - y0) > 5) moved = true;
      if (act != null && o.move) { o.move(act, p[0], p[1], e); e.preventDefault(); }
    });
    function up(e) {
      if (!down || e.pointerId !== id) return; down = false; var p = pos(e), h = act; act = null; cv.style.cursor = '';
      if (!moved && o.tap && e.type === 'pointerup') o.tap(p[0], p[1], h);
      if (h != null && o.end) o.end(h, moved);
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('lostpointercapture', function (e) { if (down && act != null && e.pointerId === id) { down = false; var h = act; act = null; if (o.end) o.end(h, moved); } });
  }

  /* ---------------------------------------------------------------- keyboard handles over the canvas */
  /* pads(stage, o): real <button>s placed over the drawing so every draggable thing can be reached with Tab.
     o.list() -> [{x, y, label, w?, h?, hide?}] (center x, y; or top-left x, y with w, h for a box)
     o.key(i, dx, dy, e)  arrow keys (dy = +1 for up); o.act(i, e) Enter or Space (or a click when o.click is true)
     o.del(i) Delete or Backspace; o.roving: one tab stop for the whole set, arrows move focus with o.nav(i, dx, dy) -> j */
  function pads(stage, o) {
    var bs = [], cur = 0;
    function mk() {
      var b = D.createElement('button'), i = bs.length; b.type = 'button'; b.className = 'mlb-h' + (o.click ? ' mlb-hit' : '') + (o.cls ? ' ' + o.cls : '');
      b.addEventListener('keydown', function (e) {
        var k = e.key, dx = 0, dy = 0, j = bs.indexOf(b);
        if (k === 'ArrowLeft') dx = -1; else if (k === 'ArrowRight') dx = 1; else if (k === 'ArrowUp') dy = 1; else if (k === 'ArrowDown') dy = -1;
        else if ((k === 'Enter' || k === ' ') && o.act && !o.click) { e.preventDefault(); o.act(j, e); return; }
        else if ((k === 'Delete' || k === 'Backspace') && o.del) { e.preventDefault(); o.del(j, e); return; }
        else if (k === 'PageUp' && o.key) { e.preventDefault(); o.key(j, 0, 1, e, true); return; }
        else if (k === 'PageDown' && o.key) { e.preventDefault(); o.key(j, 0, -1, e, true); return; }
        else return;
        e.preventDefault();
        if (o.roving && o.nav) { var n = o.nav(j, dx, dy); if (n != null && bs[n]) { setCur(n); bs[n].focus(); } return; }
        if (o.key) o.key(j, dx, dy, e);
      });
      if (o.click && o.act) b.addEventListener('click', function (e) { o.act(bs.indexOf(b), e); });
      b.addEventListener('focus', function () { if (o.roving) setCur(bs.indexOf(b)); if (o.focus) o.focus(bs.indexOf(b)); });
      b.addEventListener('blur', function () { if (o.focus) o.focus(-1); });
      stage.appendChild(b); bs.push(b);
    }
    function setCur(n) { cur = n; if (o.roving) bs.forEach(function (b, i) { b.tabIndex = i === cur ? 0 : -1; }); }
    function sync() {
      var L = o.list(); while (bs.length < L.length) mk();
      while (bs.length > L.length) { var b = bs.pop(); stage.removeChild(b); }
      L.forEach(function (h, i) {
        var b = bs[i], s = b.style;
        if (h.w) { s.left = h.x + 'px'; s.top = h.y + 'px'; s.width = h.w + 'px'; s.height = h.h + 'px'; s.margin = '0'; s.borderRadius = '6px'; }
        else { var z = h.size || 40; s.left = h.x + 'px'; s.top = h.y + 'px'; s.width = s.height = z + 'px'; s.margin = (-z / 2) + 'px 0 0 ' + (-z / 2) + 'px'; }
        if (b._l !== h.label) { b.setAttribute('aria-label', h.label); b._l = h.label; }
        if (h.pressed !== undefined) b.setAttribute('aria-pressed', String(!!h.pressed));
        b.hidden = !!h.hide;
      });
      if (o.roving) { if (cur >= bs.length) cur = 0; setCur(cur); }
    }
    return { sync: sync, btn: function (i) { return bs[i]; }, all: function () { return bs; }, focus: function (i) { if (bs[i]) { setCur(i); bs[i].focus(); } } };
  }

  /* ---------------------------------------------------------------- the frame every visual sits in */
  /* shell(el, o, d): d = {name, label, kid, aspect, height, max, min, touch, noCanvas}
     returns S with S.c (toolkit canvas), S.ctx, S.stage, S.ctl (controls row), S.say(html), S.task(def), S.height(px) */
  function shell(el, o, d) {
    el.classList.add('mlb', 'mlb-' + d.name, 'ml-notex'); // ml-notex: the page's TeX typesetter leaves our text (and its $ signs) alone
    if (o.kid !== undefined ? o.kid : d.kid) el.classList.add('mlb-kid');
    el.setAttribute('role', 'group');
    var al = el.getAttribute('aria-label'); if (!al || al === el.getAttribute('data-viz')) al = null;
    el.setAttribute('aria-label', o.label || al || d.label);
    var S = { el: el, o: o, name: d.name, kid: o.kid !== undefined ? !!o.kid : !!d.kid };
    if (o.title) { S.title = V.el('p', 'mlb-title'); S.title.textContent = o.title; el.appendChild(S.title); }
    S.stage = V.el('div', 'mlb-stage'); el.appendChild(S.stage);
    if (!d.noCanvas) {
      S.co = { aspect: o.aspect || d.aspect || 1.6, height: o.height || d.height, max: d.max, min: d.min };
      S.c = V.canvas(S.stage, S.co); S.ctx = S.c.ctx;
      S.c.cv.setAttribute('role', 'img'); S.c.cv.setAttribute('aria-label', d.pic || o.label || d.label);
      if (d.touch) S.c.cv.style.touchAction = d.touch;
    }
    S.ro = V.el('p', 'ml-readout mlb-ro'); S.ro.setAttribute('aria-live', 'polite'); el.appendChild(S.ro);
    // quiet: true (or readout: false): no live readout that could give a problem's answer away. A visual that passes
    // d.quietSay keeps its readout and words it without the numbers.
    S.quiet = !!(o.quiet || o.readout === false);
    if (S.quiet && !d.quietSay) S.ro.hidden = true;
    S.ctl = V.el('div', 'ml-ctl mlb-ctl'); el.appendChild(S.ctl);
    if (o.controls === false) S.ctl.hidden = true;
    S.say = function (h) { if (S._said !== h) { S.ro.innerHTML = h; S._said = h; } };
    S.height = function (h) { h = M.round(h); if (S.c && (S.co.height !== h || S.c.h !== h)) { S.co.height = h; S.c.fit(); } };
    S.row = function (cls) { var r = V.el('div', 'mlb-row' + (cls ? ' ' + cls : '')); S.ctl.appendChild(r); return r; };
    S.task = function (td) { return mkTask(S, td); };
    S.redraw = function () { };
    S.live = function (fn) { S.redraw = fn; if (S.c) S.c.onResize(fn); V.onTheme(fn); };
    return S;
  }

  /* td: {text, ok() -> bool, hint() -> html, yes() -> html}. Returns {update(), check(), solved()} */
  function mkTask(S, td) {
    var t = S.o.task; if (t == null || t === false) return null;
    if (typeof t !== 'object') t = { target: t };
    var box = V.el('div', 'mlb-task'), q = V.el('p', 'mlb-task-q'), row = V.el('div', 'mlb-task-row'), msg = V.el('p', 'mlb-task-msg');
    q.innerHTML = '<span class="mlb-task-ic" aria-hidden="true"></span><span>' + (t.text || td.text) + '</span>';
    msg.setAttribute('aria-live', 'polite'); box.appendChild(q); box.appendChild(row);
    var checked = false, solved = false;
    V.button(row, 'Check', function () { checked = true; run(true); }, 'pri');
    row.appendChild(msg); S.el.insertBefore(box, S.stage);
    function run(fromBtn) {
      var ok = false; try { ok = td.ok(); } catch (e) { }
      if (ok) {
        msg.className = 'mlb-task-msg mlb-yes'; msg.innerHTML = '<span aria-hidden="true">✓ </span>' + (t.yes || (td.yes && td.yes()) || 'You did it!');
        if (!solved) { solved = true; S.el.classList.add('mlb-done'); try { S.el.dispatchEvent(new CustomEvent('ml-task', { bubbles: true, detail: { ok: true, name: S.name } })); } catch (e) { } }
        return;
      }
      if (solved) { solved = false; S.el.classList.remove('mlb-done'); }
      if (checked || fromBtn) { msg.className = 'mlb-task-msg mlb-try'; msg.innerHTML = (td.hint && td.hint()) || 'Not yet. Keep going!'; }
      else { msg.className = 'mlb-task-msg'; msg.innerHTML = ''; }
    }
    return { update: function () { run(false); }, check: function () { checked = true; run(true); }, solved: function () { return solved; }, t: t };
  }
  function taskOf(o) { var t = o.task; if (t == null || t === false) return null; return typeof t === 'object' ? t : { target: t }; }
  /* a toggle button (aria-pressed) */
  function toggle(parent, text, on, fn) {
    var b = V.button(parent, text, function () { on = !on; b.setAttribute('aria-pressed', String(on)); fn(on); });
    b.classList.add('mlb-tog'); b.setAttribute('aria-pressed', String(!!on)); return b;
  }
  /* a −/+ stepper: [−] label value [+] */
  function stepper(parent, o) {
    var w = V.el('div', 'mlb-step'), lab = V.el('span', 'mlb-step-lab'); lab.textContent = o.label;
    var val = o.value;
    var mi = V.button(w, '−', function () { set(val - (o.step || 1), true); }); mi.setAttribute('aria-label', (o.less || 'Less') + ': ' + o.label);
    var out = V.el('output', 'mlb-step-val'); w.appendChild(lab); w.appendChild(out);
    w.insertBefore(lab, mi);
    var pl = V.button(w, '+', function () { set(val + (o.step || 1), true); }); pl.setAttribute('aria-label', (o.more || 'More') + ': ' + o.label);
    function set(v, user) { v = clamp(v, o.min, o.max); val = v; out.textContent = o.fmt ? o.fmt(v) : f(v); mi.disabled = v <= o.min; pl.disabled = v >= o.max; if (user && o.change) o.change(v); }
    set(val); parent.appendChild(w); return { el: w, set: function (v) { set(v); }, get: function () { return val; } };
  }

  /* ---------------------------------------------------------------- tiny 3D (volume, nets, shapes) */
  function rotYX(yaw, pitch) { // rotation: yaw about the vertical (z) axis, then tilt by pitch about x; returns fn(p) -> [x, y, depth]
    var cy = M.cos(yaw), sy = M.sin(yaw), cp = M.cos(pitch), sp = M.sin(pitch);
    return function (p) { var x = p[0] * cy - p[1] * sy, y = p[0] * sy + p[1] * cy, z = p[2]; return [x, y * sp + z * cp, -y * cp + z * sp]; };
  }
  /* rotation of point p about the axis through a with unit direction u by angle t */
  function rotAxis(p, a, u, t) {
    var v = [p[0] - a[0], p[1] - a[1], p[2] - a[2]], c = M.cos(t), s = M.sin(t), d = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    var cx = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    return [a[0] + v[0] * c + cx[0] * s + u[0] * d * (1 - c), a[1] + v[1] * c + cx[1] * s + u[1] * d * (1 - c), a[2] + v[2] * c + cx[2] * s + u[2] * d * (1 - c)];
  }
  function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm3(a) { var l = M.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function shadeHex(hex, k) { // k < 1 darker, > 1 lighter
    var v = parseInt(hex.slice(1), 16), r = v >> 16 & 255, g = v >> 8 & 255, b = v & 255;
    function c(x) { return M.round(clamp(k <= 1 ? x * k : x + (255 - x) * (k - 1), 0, 255)); }
    return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
  }
  /* view drag: dragging on the canvas turns the 3D view; returns nothing, calls set(yaw, pitch) */
  function orbit(S, view, redraw, lim) {
    lim = lim || {};
    var last = null;
    ptr(S.c.cv, {
      hit: function (x, y) { return { x: x, y: y }; },
      start: function (h, x, y) { last = [x, y]; },
      move: function (h, x, y) {
        view.yaw += (x - last[0]) * 0.012; view.pitch = clamp(view.pitch + (y - last[1]) * 0.01, lim.pmin !== undefined ? lim.pmin : 0.15, lim.pmax !== undefined ? lim.pmax : 1.45);
        if (lim.ymin !== undefined) view.yaw = clamp(view.yaw, lim.ymin, lim.ymax);
        last = [x, y]; redraw();
      }
    });
  }

  /* ================================================================ tenframe
     A ten frame (two of them for numbers to 20) with counters. Teaches 5 and 10 as landmarks and "make a ten".
     opts:
       n: 0           counters to start with (0 to 20)
       frames: 1      1 or 2 frames (2 is picked for you when n, a + b or max is more than 10)
       max            the biggest number you plan to show (picks the number of frames)
       a, b           an addition in two colors: a red counters and b yellow ones (each 0 to 10), e.g. {"a": 8, "b": 5}.
                      With two frames, "Make a ten" slides yellow counters up to fill the first frame: 8 + 5 = 10 + 3.
       fill: "order"  counters fill left to right, top row first (tapping adds or removes one);
             "free"   tap any square to put a counter there or take it away
       hide: false    true keeps the number out of the readout (count it yourself), with a "Show the number" button
       flash: 0       milliseconds to show the counters before covering them (a quick look), with a "Look again" button
       task: 7  or  {target: 7}       "Show 7 on the ten frame."                                                        */
  def('tenframe', function (el, o) {
    var S = shell(el, o, { name: 'tenframe', kid: true, label: 'A ten frame with counters', touch: 'manipulation', height: 150 });
    var a = o.a != null ? int(o.a, 0, 0, 10) : null, b = o.b != null ? int(o.b, 0, 0, 10) : null, two = a != null && b != null;
    var n0 = int(o.n, 0, 0, 20), free = o.fill === 'free';
    var frames = clamp(int(o.frames, 0), 0, 2) || ((two ? a + b > 10 : (n0 > 10 || int(o.max, 10) > 10)) ? 2 : 1);
    if (two && frames === 1) b = M.min(b, 10 - a);
    var N = frames * 10, cells = [], made = false, showNum = !o.hide, covered = false, fly = [], flyP = 0, L = {}, timer = 0;
    function reset() {
      cells = []; for (var i = 0; i < N; i++) cells.push(0); made = false; fly = [];
      if (two) { if (frames === 2) { for (i = 0; i < a; i++) cells[i] = 1; for (i = 0; i < b; i++) cells[10 + i] = 2; } else for (i = 0; i < a + b; i++) cells[i] = i < a ? 1 : 2; }
      else for (i = 0; i < M.min(N, n0); i++) cells[i] = 1;
    }
    function count() { var k = 0; cells.forEach(function (v) { if (v) k++; }); return k + fly.length; }
    function layout() {
      var w = S.c.w, pad = 10, side = frames === 2 && w >= 560, gap = 18;
      var s = side ? M.min(56, (w - 2 * pad - gap) / 10) : M.min(60, (w - 2 * pad - 8) / 5);
      var fw = 5 * s, fh = 2 * s, all = side ? 2 * fw + gap : fw, th = side || frames === 1 ? fh : 2 * fh + gap;
      L = { s: s, side: side, x0: (w - all) / 2, y0: pad + 4, fw: fw, fh: fh, gap: gap };
      S.height(th + 2 * pad + 8);
    }
    function cellXY(i) {
      var fi = M.floor(i / 10), k = i % 10, r = M.floor(k / 5), c = k % 5;
      return [L.x0 + (L.side ? fi * (L.fw + L.gap) : 0) + c * L.s, L.y0 + (L.side ? 0 : fi * (L.fh + L.gap)) + r * L.s];
    }
    function add() { for (var i = 0; i < N; i++) if (!cells[i]) { cells[i] = 1; return true; } return false; }
    function take() { for (var i = N - 1; i >= 0; i--) if (cells[i]) { cells[i] = 0; return true; } return false; }
    function tapCell(i) {
      if (two || covered) return;
      if (free) cells[i] = cells[i] ? 0 : 1; else if (cells[i]) take(); else add();
      changed();
    }
    function draw() {
      layout(); var ctx = S.ctx, k = C(), s = L.s;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      for (var fi = 0; fi < frames; fi++) {
        var p = cellXY(fi * 10); fillRR(ctx, p[0] - 5, p[1] - 5, L.fw + 10, L.fh + 10, 14, k.bg, k.frame, 3);
        for (var j = 0; j < 10; j++) { var q = cellXY(fi * 10 + j); fillRR(ctx, q[0] + 3, q[1] + 3, s - 6, s - 6, 9, k.empty); }
        ln(ctx, p[0], p[1] + s, p[0] + L.fw, p[1] + s, k.line, 1);
      }
      if (covered) {
        for (fi = 0; fi < frames; fi++) { p = cellXY(fi * 10); fillRR(ctx, p[0] - 5, p[1] - 5, L.fw + 10, L.fh + 10, 14, k.panel, k.frame, 3); tx(ctx, '?', p[0] + L.fw / 2, p[1] + L.fh / 2, { size: s * 0.8, wt: 800, kid: true, col: k.muted }); }
      } else {
        cells.forEach(function (v, i) { if (!v) return; var q = cellXY(i); counter(ctx, q[0] + s / 2, q[1] + s / 2, s * 0.36, v === 1 ? k.redC : k.yellow, v === 1 ? k.redEdge : k.yellowEdge); });
        fly.forEach(function (m) { var A = cellXY(m.from), B = cellXY(m.to); counter(ctx, lerp(A[0], B[0], flyP) + s / 2, lerp(A[1], B[1], flyP) + s / 2, s * 0.36, k.yellow, k.yellowEdge); });
      }
      P.sync(); say();
    }
    function say() {
      var n = count(), h;
      if (covered) h = 'How many counters did you see?';
      else if (two) {
        var tot = a + b;
        if (frames === 2 && !made) h = a + ' + ' + b + '. ' + (a < 10 && b ? 'The first frame needs ' + (10 - a) + ' more to make a ten.' : '');
        else if (tot > 10) h = a + ' + ' + b + ' = 10 + ' + (tot - 10) + ' = <b>' + tot + '</b>. ' + a + ' and ' + (10 - a) + ' make 10, and ' + (tot - 10) + ' more is ' + tot + '.';
        else h = a + ' + ' + b + ' = <b>' + tot + '</b>.' + (tot < 10 ? ' ' + (10 - tot) + ' more would make 10.' : ' That fills the frame: 10!');
      } else if (!showNum) h = 'Count the counters. Then press "Show the number" to check.';
      else if (!n) h = 'No counters yet. Tap a square to add one.';
      else if (n < 10) h = '<b>' + plural(n, 'counter') + '</b>. ' + (n === 5 ? 'One full row is 5. ' : n > 5 ? '5 and ' + (n - 5) + ' more. ' : '') + (10 - n) + ' more make 10.';
      else if (n === 10) h = '<b>10 counters</b>. A full ten frame!';
      else h = '<b>' + n + ' counters</b>: 10 and ' + (n - 10) + ' more.' + (n < 20 ? ' ' + (20 - n) + ' more make 20.' : ' Two full frames make 20.');
      S.say(h);
    }
    var P = pads(S.stage, {
      click: true, roving: true,
      list: function () { if (two) return []; var out = []; for (var i = 0; i < N; i++) { var q = cellXY(i); out.push({ x: q[0] + 2, y: q[1] + 2, w: L.s - 4, h: L.s - 4, label: 'Square ' + (i + 1) + (cells[i] ? ', has a counter' : ', empty') }); } return out; },
      act: function (i) { tapCell(i); },
      nav: function (i, dx, dy) { var j = i + dx - dy * 5; return j >= 0 && j < N ? j : null; }
    });
    var row = S.row(), bAdd, bTake, bTen, bShow;
    if (two) {
      if (frames === 2) bTen = V.button(row, 'Make a ten', function () {
        if (made || fly.length) { reset(); bTen.textContent = 'Make a ten'; draw(); return; }
        var empty = [], src = []; for (var i = 0; i < 10; i++) if (!cells[i]) empty.push(i); for (i = 10; i < 20; i++) if (cells[i]) src.push(i);
        var k2 = M.min(empty.length, src.length), mv = src.slice(src.length - k2);
        mv.forEach(function (j) { cells[j] = 0; }); fly = mv.map(function (j, t) { return { from: j, to: empty[t] }; });
        bTen.textContent = 'Start over';
        tween(900, function (p) { flyP = p; draw(); }, function () { fly.forEach(function (m) { cells[m.to] = 2; }); fly = []; made = true; draw(); });
      }, 'pri');
    } else {
      bAdd = V.button(row, 'Add one', function () { if (add()) changed(); });
      bTake = V.button(row, 'Take one away', function () { if (take()) changed(); });
      V.button(row, 'Clear', function () { cells = cells.map(function () { return 0; }); changed(); });
      if (o.hide) bShow = V.button(row, 'Show the number', function () { showNum = true; bShow.hidden = true; draw(); });
    }
    if (o.flash) {
      var again = V.button(row, 'Look again', function () { look(); });
      again.hidden = true;
      var look = function () { covered = false; draw(); W.clearTimeout(timer); timer = W.setTimeout(function () { covered = true; again.hidden = false; draw(); }, M.max(300, +o.flash)); };
      W.setTimeout(look, 30);
    }
    var tk = S.task({
      text: 'Show ' + (taskOf(o) || {}).target + ' on the ten frame.',
      ok: function () { return count() === int(tk.t.target, 0); },
      hint: function () { var n = count(), t = int(tk.t.target, 0); return n < t ? 'You have ' + n + '. Add ' + plural(t - n, 'more counter') + '.' : 'You have ' + n + '. That is ' + (n - t) + ' too many.'; },
      yes: function () { var t = int(tk.t.target, 0); return 'That shows ' + t + (t > 5 && t < 10 ? ': 5 and ' + (t - 5) + ' more.' : '.'); }
    });
    function changed() { draw(); if (tk) tk.update(); }
    reset(); S.live(draw); draw();
    return { destroy: function () { W.clearTimeout(timer); } };
  });

  /* ================================================================ counters
     Counters to count, to compare two groups, or (mode "zero") positive and negative counters that cancel in zero pairs.
     opts:
       mode: "count" | "compare" | "zero"      (default "count")
       shape: "dot" | "star" | "square" | "heart"   (count and compare)
       count mode:    n: 8 (up to 30), layout: "scatter" | "row" (default "scatter"), edit: false (add and remove buttons)
                      Tap each one to count it. Each gets its number, and the last number tells how many.
       compare mode:  a: 7, b: 4 (top and bottom rows, up to 15). The shorter group starts spread out so it looks longer;
                      "Match them up" pairs them one to one and shows the extras.
       zero mode:     pos: 5, neg: 3 (up to 20 each). Yellow + counters and red − counters. A + and a − make a zero pair.
                      Buttons add or take away a counter, add a zero pair, or clear the zero pairs. Taking away a counter
                      that isn't there asks you to add a zero pair first (this is how 2 − 5 works).
       task (count):   {target: 6}      "Make a group of 6." (turns on the add and remove buttons)
       task (compare): {equal: true}    "Make the two rows equal."
       task (zero):    {target: -2, counters: 6}   "Show −2" (counters, if given, is how many counters to use in all)    */
  def('counters', function (el, o) {
    var mode = o.mode === 'compare' || o.mode === 'zero' ? o.mode : 'count';
    var S = shell(el, o, { name: 'counters', kid: true, label: mode === 'zero' ? 'Positive and negative counters' : mode === 'compare' ? 'Two rows of counters to compare' : 'Counters to count', touch: 'manipulation', height: 200 });
    var k0 = C(), shape = o.shape || 'dot', TT = taskOf(o);
    var n = int(o.n, 8, 0, 30), counted = [], pts = [];
    var A = int(o.a, 7, 0, 15), B = int(o.b, 4, 0, 15), matched = false, mP = 0;
    var pos = int(o.pos, 5, 0, 20), neg = int(o.neg, 3, 0, 20), note = '', fade = 0, fading = 0;
    function makePts() {
      var rnd = seeded(int(o.seed, 7) * 131 + n * 17 + 3), out = [], tries = 0;
      if (o.layout === 'row') { for (var i = 0; i < n; i++) out.push([(i + 0.5) / n, 0.5]); return out; }
      var md = M.min(0.2, 0.62 / M.sqrt(n + 1));
      while (out.length < n && tries < 6000) {
        tries++; var p = [0.07 + rnd() * 0.86, 0.12 + rnd() * 0.76], ok = true;
        for (var j = 0; j < out.length; j++) if (M.hypot((p[0] - out[j][0]) * 1.6, p[1] - out[j][1]) < md * (tries > 4000 ? 0.7 : 1)) { ok = false; break; }
        if (ok) out.push(p);
      }
      return out;
    }
    function shapeAt(ctx, x, y, r, fill, edge, mark) {
      if (shape === 'dot' || mode === 'zero') { counter(ctx, x, y, r, fill, edge, mark); return; }
      ctx.save(); ctx.beginPath();
      if (shape === 'square') rr(ctx, x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, r * 0.35);
      else if (shape === 'star') { for (var i = 0; i < 10; i++) { var t = -PI / 2 + i * PI / 5, q = i % 2 ? r * 0.48 : r * 1.08; ctx[i ? 'lineTo' : 'moveTo'](x + q * M.cos(t), y + q * M.sin(t) + r * 0.08); } ctx.closePath(); }
      else { ctx.moveTo(x, y + r * 0.95); ctx.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.75, y - r * 1.2, x, y - r * 0.45); ctx.bezierCurveTo(x + r * 0.75, y - r * 1.2, x + r * 1.5, y - r * 0.1, x, y + r * 0.95); }
      ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = edge; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore();
      if (mark) tx(ctx, mark, x, y + 1, { size: M.round(r * 1.1), wt: 800, col: edge });
    }
    /* ---------- geometry for each mode */
    var G = {};
    function geo() {
      var w = S.c.w;
      if (mode === 'count') { S.height(clamp(w * 0.5, 190, 300)); G.r = clamp(M.min(w, S.c.h * 1.7) / (M.sqrt(n + 1) * 5.2), 11, 24); }
      else if (mode === 'compare') { var mx = M.max(A, B, 1); G.pitch = M.min(54, (w - 40) / mx); G.r = M.min(20, G.pitch * 0.38); S.height(G.r * 2 * 2 + 92); }
      else {
        G.pitch = clamp(w / 9, 36, 54); G.r = G.pitch * 0.4; G.per = M.max(4, M.floor((w - 20) / G.pitch)); var cols = M.max(pos, neg, 1);
        G.bands = M.ceil(cols / G.per); G.bandH = G.pitch * 2 + 22; S.height(G.bands * G.bandH + 20);
      }
    }
    function cmpXY(row, i, t) { // row 0 top, 1 bottom; t = matching progress
      var w = S.c.w, cnt = row ? B : A, other = row ? A : B, x0 = 20 + G.r;
      var spread = o.spread !== false && cnt < other && cnt > 1 ? (w - 40 - 2 * G.r) / (cnt - 1) : G.pitch;
      var loose = cnt < other ? spread : G.pitch;
      var xs = x0 + i * lerp(loose, G.pitch, t);
      return [xs, row ? S.c.h - 26 - G.r : 26 + G.r];
    }
    function zXY(row, i) { var band = M.floor(i / G.per), c = i % G.per, x0 = (S.c.w - M.min(G.per, M.max(pos, neg)) * G.pitch) / 2 + G.pitch / 2; return [x0 + c * G.pitch, 18 + band * G.bandH + G.pitch * 0.5 + row * (G.pitch + 4)]; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), i, p;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      if (mode === 'count') {
        pts.forEach(function (q, j) {
          var x = q[0] * S.c.w, y = q[1] * S.c.h, ci = counted.indexOf(j);
          shapeAt(ctx, x, y, G.r, ci >= 0 ? k.greenC : k.redC, ci >= 0 ? k.greenEdge : k.redEdge);
          if (ci >= 0) tx(ctx, String(ci + 1), x, y + 1, { size: M.round(G.r * 0.95), wt: 800, kid: true, col: '#fff' });
        });
      } else if (mode === 'compare') {
        if (matched || mP > 0) for (i = 0; i < M.min(A, B); i++) { var t1 = cmpXY(0, i, mP), t2 = cmpXY(1, i, mP); ln(ctx, t1[0], t1[1] + G.r + 3, t2[0], t2[1] - G.r - 3, k.muted, 1.5, [4, 4]); }
        for (i = 0; i < A; i++) { p = cmpXY(0, i, mP); if (matched && i >= B) disc(ctx, p[0], p[1], G.r + 6, soft(k.gold, 0.3)); shapeAt(ctx, p[0], p[1], G.r, k.redC, k.redEdge); }
        for (i = 0; i < B; i++) { p = cmpXY(1, i, mP); if (matched && i >= A) disc(ctx, p[0], p[1], G.r + 6, soft(k.gold, 0.3)); shapeAt(ctx, p[0], p[1], G.r, k.blueC, k.blueEdge); }
      } else {
        var pairs = M.min(pos, neg);
        for (i = 0; i < pairs; i++) { var u = zXY(0, i); ctx.save(); ctx.globalAlpha = i >= pairs - fading ? 1 - fade : 1; fillRR(ctx, u[0] - G.pitch * 0.46, u[1] - G.pitch * 0.48, G.pitch * 0.92, G.pitch * 1.96 + 4, G.pitch * 0.46, soft(k.green, 0.10), soft(k.green, 0.45), 1.5); ctx.restore(); }
        for (i = 0; i < M.max(pos, neg); i++) {
          var al = i < pairs && i >= pairs - fading ? 1 - fade : 1, sc = i < pairs && i >= pairs - fading ? 1 - fade * 0.5 : 1;
          ctx.save(); ctx.globalAlpha = al;
          if (i < pos) { p = zXY(0, i); counter(ctx, p[0], p[1], G.r * sc, k.yellow, k.yellowEdge, '+'); }
          if (i < neg) { p = zXY(1, i); counter(ctx, p[0], p[1], G.r * sc, k.redC, k.redEdge, '−'); }
          ctx.restore();
        }
        if (!pos && !neg) tx(ctx, 'No counters. The value is 0.', S.c.w / 2, S.c.h / 2, { size: 15, col: k.muted, kid: true });
      }
      P.sync(); say();
    }
    function say() {
      var h;
      if (mode === 'count') {
        var c = counted.length;
        if (!n) h = 'No counters yet.';
        else if (!c) h = 'Tap each one as you count it: 1, 2, 3 …';
        else if (c < n) h = 'Counted so far: <b>' + counted.map(function (_, i) { return i + 1; }).join(', ') + '</b>. Keep going!';
        else h = 'That\'s all of them. The last number you said, <b>' + n + '</b>, tells how many there are.';
      } else if (mode === 'compare') {
        if (!matched) h = 'Which row has more? A longer row doesn\'t always have more. Match them up to see.';
        else if (A === B) h = 'Every counter has a partner. Both rows have <b>' + A + '</b>: they are equal.';
        else { var big = M.max(A, B), sm = M.min(A, B); h = (A > B ? 'The top row' : 'The bottom row') + ' has ' + (big - sm) + ' extra. <b>' + big + ' is ' + (big - sm) + ' more than ' + sm + '</b>, and ' + sm + ' is ' + (big - sm) + ' less than ' + big + '.'; }
      } else {
        var pr = M.min(pos, neg), v = pos - neg;
        h = plural(pos, 'positive counter') + ' and ' + plural(neg, 'negative counter') + '. ' + (pr ? plural(pr, 'zero pair') + ' cancel out, so the value is ' : 'The value is ') + '<b>' + (v > 0 ? '+' + v : minus(v)) + '</b>.';
        if (note) h += '<br>' + note;
      }
      S.say(h);
    }
    var P = pads(S.stage, {
      click: true, roving: true,
      list: function () {
        if (mode === 'count') return pts.map(function (q, j) { return { x: q[0] * S.c.w, y: q[1] * S.c.h, size: G.r * 2 + 8, label: counted.indexOf(j) >= 0 ? 'Counted: number ' + (counted.indexOf(j) + 1) : 'Not counted yet' }; });
        return [];
      },
      act: function (j) { tapCount(j); },
      nav: function (i, dx, dy) { var j = i + (dx || -dy); return j >= 0 && j < pts.length ? j : null; }
    });
    function tapCount(j) { if (counted.indexOf(j) < 0) { counted.push(j); changed(); } }
    var tk, row = S.row();
    if (mode === 'count') {
      pts = makePts();
      V.button(row, 'Count the next one', function () {
        var left = pts.map(function (q, j) { return j; }).filter(function (j) { return counted.indexOf(j) < 0; });
        if (!left.length) return; left.sort(function (x, y) { return (pts[x][1] - pts[y][1]) * 3 + (pts[x][0] - pts[y][0]); });
        tapCount(left[0]);
      }, 'pri');
      V.button(row, 'Start over', function () { counted = []; changed(); });
      if (o.edit || (TT && TT.target != null)) {
        V.button(row, 'Add one', function () { if (n < 30) { n++; pts = makePts(); counted = []; changed(); } });
        V.button(row, 'Take one away', function () { if (n > 0) { n--; pts = makePts(); counted = []; changed(); } });
      }
      tk = S.task({ text: 'Make a group of ' + (TT && TT.target) + '. Count to check.', ok: function () { return n === int(TT.target, 0); },
        hint: function () { var t = int(TT.target, 0); return n < t ? 'There are ' + n + '. Add ' + (t - n) + ' more.' : 'There are ' + n + '. Take ' + (n - t) + ' away.'; } });
    } else if (mode === 'compare') {
      var bm = V.button(row, 'Match them up', function () {
        if (matched) { matched = false; mP = 0; bm.textContent = 'Match them up'; changed(); return; }
        tween(800, function (p) { mP = p; draw(); }, function () { matched = true; mP = 1; bm.textContent = 'Spread them out'; changed(); });
      }, 'pri');
      stepper(row, { label: 'Top row', value: A, min: 0, max: 15, less: 'Take one away', more: 'Add one', change: function (v) { A = v; changed(); } });
      stepper(row, { label: 'Bottom row', value: B, min: 0, max: 15, less: 'Take one away', more: 'Add one', change: function (v) { B = v; changed(); } });
      tk = S.task({ text: 'Make the two rows equal.', ok: function () { return A === B; }, hint: function () { return 'Match them up. Which row has extras?'; }, yes: function () { return 'Both rows have ' + A + '.'; } });
    } else {
      var put = function (dp, dn) {
        note = '';
        if (dp < 0 && !pos) { note = 'There is no + counter to take away. Add a zero pair first: it adds 0, so the value stays the same.'; say(); return; }
        if (dn < 0 && !neg) { note = 'There is no − counter to take away. Add a zero pair first: it adds 0, so the value stays the same.'; say(); return; }
        pos = clamp(pos + dp, 0, 20); neg = clamp(neg + dn, 0, 20); changed();
      };
      V.button(row, 'Add +1', function () { put(1, 0); });
      V.button(row, 'Add −1', function () { put(0, 1); });
      V.button(row, 'Take away +1', function () { put(-1, 0); });
      V.button(row, 'Take away −1', function () { put(0, -1); });
      var row2 = S.row();
      V.button(row2, 'Add a zero pair', function () { if (pos < 20 && neg < 20) { put(1, 1); note = 'A zero pair is +1 and −1. Together they are 0, so the value did not change.'; say(); } });
      V.button(row2, 'Clear the zero pairs', function () {
        var pr = M.min(pos, neg); if (!pr) return; fading = pr;
        tween(700, function (p) { fade = p; draw(); }, function () { pos -= pr; neg -= pr; fading = 0; fade = 0; note = 'Taking away zero pairs doesn\'t change the value.'; changed(); });
      }, 'pri');
      tk = S.task({
        text: 'Show ' + (TT && minus(TT.target)) + (TT && TT.counters ? ' using ' + TT.counters + ' counters.' : ' with the counters.'),
        ok: function () { return pos - neg === int(TT.target, 0) && (!TT.counters || pos + neg === int(TT.counters, 0)); },
        hint: function () { var v = pos - neg, t = int(TT.target, 0); if (v !== t) return 'Right now the value is ' + minus(v) + '. ' + (v < t ? 'Add a + counter or take away a − counter.' : 'Add a − counter or take away a + counter.'); return 'The value is right. Now use ' + TT.counters + ' counters in all: zero pairs don\'t change the value.'; },
        yes: function () { return 'That shows ' + minus(TT.target) + '. Can you find another way?'; }
      });
    }
    function changed() { draw(); if (tk) tk.update(); }
    S.live(draw); draw();
  });

  /* ================================================================ numberbond
     A number bond: the whole in the top circle, its parts below, and a row of beads that shows them.
     opts:
       whole: 10          the whole (1 to 20)
       a: 6               the first part; the second part is the rest (b: … may be given instead)
       c: null            a third part (three-part bond: whole = a + b + c)
       hide: null         "whole", "a", "b" or "c": shows "?" in that circle, with a "Show" button
       move: true         drag the divider in the beads (or tap a bead) to move beads from one part to the other
       task: {a: 7}       "Split 10 into 7 and 3."  The readout gives the fact family: 6 + 4 = 10, 4 + 6 = 10, 10 − 6 = 4, 10 − 4 = 6. */
  def('numberbond', function (el, o) {
    var S = shell(el, o, { name: 'numberbond', kid: true, label: 'A number bond with a whole and its parts', touch: 'pan-y', height: 230 });
    var Wh = int(o.whole, 10, 1, 20), parts = [];
    var a = o.a != null ? int(o.a, 0, 0, Wh) : (o.b != null ? Wh - int(o.b, 0, 0, Wh) : M.ceil(Wh / 2));
    if (o.c != null) { var c3 = int(o.c, 0, 0, Wh); a = M.min(a, Wh - c3); parts = [a, Wh - a - c3, c3]; } else parts = [a, Wh - a];
    var hide = o.hide, names = ['a', 'b', 'c'], G = {}, TT = taskOf(o);
    function cuts() { var out = [], s = 0; for (var i = 0; i < parts.length - 1; i++) { s += parts[i]; out.push(s); } return out; }
    function geo() {
      var w = S.c.w, R = clamp(w / 8, 30, 46), gap = M.max(4, w / 120);
      var br = M.min(15, (w - 30 - gap * M.floor((Wh - 1) / 5)) / (2 * Wh + 0.01) - 1);
      G = { R: R, br: br, gap: gap, cx: w / 2, y1: R + 10, y2: R * 3 + 10, by: R * 4 + 34 };
      var spread = M.min(w / 2 - R - 10, R * 2.6);
      G.px = parts.length === 3 ? [G.cx - spread * 1.1, G.cx, G.cx + spread * 1.1] : [G.cx - spread, G.cx + spread];
      var tot = Wh * (2 * br + 2) + gap * M.floor((Wh - 1) / 5); G.bx0 = (w - tot) / 2;
      S.height(G.by + br + 16);
    }
    function beadX(i) { return G.bx0 + i * (2 * G.br + 2) + G.gap * M.floor(i / 5) + G.br + 1; }
    function cutX(c) { if (c <= 0) return beadX(0) - G.br - 3; if (c >= Wh) return beadX(Wh - 1) + G.br + 3; return (beadX(c - 1) + beadX(c)) / 2; }
    var cols = function (k) { return [[k.redC, k.redEdge], [k.yellow, k.yellowEdge], [k.blueC, k.blueEdge]]; };
    function draw() {
      geo(); var ctx = S.ctx, k = C(), cs = cols(k), i;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      G.px.forEach(function (x) { ln(ctx, G.cx, G.y1, x, G.y2, k.frame, 3); });
      function bubble(x, y, val, key, colr) {
        disc(ctx, x, y, G.R, k.bg, colr || k.frame, 3.5);
        tx(ctx, hide === key ? '?' : String(val), x, y + 1, { size: G.R * 0.9, wt: 800, kid: true, col: hide === key ? k.muted : k.ink });
      }
      bubble(G.cx, G.y1, Wh, 'whole');
      parts.forEach(function (p, j) { bubble(G.px[j], G.y2, p, names[j], cs[j][1]); });
      var cu = cuts(), part = 0;
      fillRR(ctx, beadX(0) - G.br - 6, G.by - G.br - 6, beadX(Wh - 1) - beadX(0) + 2 * G.br + 12, 2 * G.br + 12, G.br + 6, k.empty);
      for (i = 0; i < Wh; i++) { while (part < cu.length && i >= cu[part]) part++; counter(ctx, beadX(i), G.by, G.br, cs[part][0], cs[part][1]); }
      if (o.move !== false) cu.forEach(function (c) { var x = cutX(c); ln(ctx, x, G.by - G.br - 10, x, G.by + G.br + 10, k.ink, 3); disc(ctx, x, G.by - G.br - 12, 5, k.ink); disc(ctx, x, G.by + G.br + 12, 5, k.ink); });
      P.sync(); say();
    }
    function say() {
      var h;
      if (parts.length === 3) h = Wh + ' = ' + parts.join(' + ') + '. The parts add up to the whole.';
      else {
        var p = parts[0], q = parts[1];
        if (hide) { var eq = hide === 'whole' ? p + ' + ' + q + ' = ?' : hide === 'a' ? '? + ' + q + ' = ' + Wh : p + ' + ? = ' + Wh; h = '<b>' + eq + '</b> &nbsp; Use the beads to find the missing number.'; }
        else h = '<b>' + p + ' + ' + q + ' = ' + Wh + '</b>, &nbsp;' + q + ' + ' + p + ' = ' + Wh + ', &nbsp;' + Wh + ' − ' + p + ' = ' + q + ', &nbsp;' + Wh + ' − ' + q + ' = ' + p;
      }
      S.say(h);
    }
    var drag = -1;
    if (o.move !== false) ptr(S.c.cv, {
      hit: function (x, y) { if (M.abs(y - G.by) > G.br + 20) return null; var cu = cuts(), best = null, bd = 20; cu.forEach(function (c, j) { var d = M.abs(cutX(c) - x); if (d < bd) { bd = d; best = j; } }); return best; },
      move: function (j, x) { setCut(j, nearestCut(x)); },
      end: function () { if (tk) tk.update(); },
      tap: function (x, y, h) {
        if (h != null || M.abs(y - G.by) > G.br + 8) return;
        for (var i = 0; i < Wh; i++) if (M.abs(beadX(i) - x) <= G.br + 1) { var cu = cuts(); if (cu.length === 1) setCut(0, i < cu[0] ? i : i + 1); if (tk) tk.update(); return; }
      },
      over: function (x, y) { return M.abs(y - G.by) < G.br + 4 && o.move !== false ? 'pointer' : ''; }
    });
    function nearestCut(x) { var best = 0, bd = 1e9; for (var c = 0; c <= Wh; c++) { var d = M.abs(cutX(c) - x); if (d < bd) { bd = d; best = c; } } return best; }
    function setCut(j, c) {
      var cu = cuts(), lo = j ? cu[j - 1] : 0, hi = j < cu.length - 1 ? cu[j + 1] : Wh; c = clamp(c, lo, hi); cu[j] = c;
      var prev = 0; parts = cu.map(function (v) { var p = v - prev; prev = v; return p; }); parts.push(Wh - prev); draw();
    }
    var P = pads(S.stage, {
      list: function () { return o.move === false ? [] : cuts().map(function (c, j) { return { x: cutX(c), y: G.by, size: 38, label: 'Divider ' + (j + 1) + ': ' + parts[j] + ' and ' + parts[j + 1] + '. Left and right arrows move a bead.' }; }); },
      key: function (j, dx, dy) { setCut(j, cuts()[j] + (dx || dy)); if (tk) tk.update(); }
    });
    var row = S.row();
    if (hide) var bs = V.button(row, 'Show', function () { hide = null; bs.hidden = true; draw(); }, 'pri');
    if (parts.length === 2 && o.move !== false) V.button(row, 'Switch the parts', function () { parts = [parts[1], parts[0]]; draw(); if (tk) tk.update(); });
    var tk = S.task({
      text: TT && 'Split ' + Wh + ' into ' + int(TT.a, 0) + ' and ' + (Wh - int(TT.a, 0)) + '.',
      ok: function () { return parts[0] === int(TT.a, 0); },
      hint: function () { var t = int(TT.a, 0); return parts[0] < t ? 'The first part has ' + parts[0] + '. Move ' + (t - parts[0]) + ' more beads into it.' : 'The first part has ' + parts[0] + '. Move ' + (parts[0] - t) + ' beads out of it.'; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ hundredchart
     A hundred chart (or any block of numbers in rows of 10). One step right is 1 more; one row down is 10 more.
     opts:
       start: 1         the first number (0 for 0–99, 101 for 101–200, …)
       rows: 10, cols: 10
       skip: 0          shade every skip-th number (2, 3, 5, 10 …) to see skip-counting patterns
       skipPick: false  true adds buttons to change the skip count
       mark: []         numbers shaded at the start; tapping a square shades it or clears it
       hide: []         numbers covered with "?" ("all" covers every square); tap one to peek
       token: null      a starting number for a marker you move: → is +1, ← is −1, ↓ is +10, ↑ is −10;
                        the readout writes the jump as an addition (47 + 11 = 58)
       sieve: false     the sieve of Eratosthenes: buttons cross out the multiples of 2, 3, 5 and 7 to leave the primes
       task: {target: 57, from: 47}   "Start at 47. Move to 57." (puts a marker on 47)
             {find: 63}               "Find 63 and tap it." (works well with hide: "all")                        */
  def('hundredchart', function (el, o) {
    var S = shell(el, o, { name: 'hundredchart', kid: true, label: 'A hundred chart', touch: 'manipulation', height: 400 });
    var st = int(o.start, 1), R = int(o.rows, 10, 1, 20), Cc = int(o.cols, 10, 2, 12), TT = taskOf(o), N = R * Cc;
    var skip = int(o.skip, 0, 0, 50), marks = {}, hid = {}, peek = {}, crossed = {}, sieveOn = !!o.sieve, cur = 0, G = {};
    (o.mark || []).forEach(function (v) { marks[int(v, 0)] = 1; });
    if (o.hide === 'all') for (var i = 0; i < N; i++) hid[st + i] = 1; else (o.hide || []).forEach(function (v) { hid[int(v, 0)] = 1; });
    var tokenStart = TT && TT.from != null ? int(TT.from, st) : o.token != null ? int(o.token, st) : null, token = tokenStart, path = token != null ? [token] : [];
    if (token != null) cur = token - st;
    function geo() { var w = S.c.w, s = M.min(50, (w - 12) / Cc); G = { s: s, x0: (w - s * Cc) / 2, y0: 6 }; S.height(s * R + 12); }
    function xy(i) { return [G.x0 + (i % Cc) * G.s, G.y0 + M.floor(i / Cc) * G.s]; }
    var PCOL = ['#e8590c', '#1c6fd6', '#7048e8', '#0c8599'];
    function draw() {
      geo(); var ctx = S.ctx, k = C(), s = G.s, fs = M.max(10, M.min(17, s * 0.4 - (st + N > 100 ? 1 : 0)));
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      for (var i = 0; i < N; i++) {
        var v = st + i, p = xy(i), bg = k.bg, col = k.ink, wt = 500;
        var sk = skip && v > 0 && v % skip === 0;
        if (sk) { bg = soft(k.gold, k.dark ? 0.35 : 0.28); wt = 700; }
        if (marks[v]) { bg = soft(k.green, k.dark ? 0.45 : 0.3); wt = 800; }
        if (sieveOn && v === 1) { bg = k.empty; col = k.muted; }
        if (sieveOn && crossed[v]) { col = k.muted; }
        if (sieveOn && isPrime(v) && doneSieve()) { bg = soft(k.green, k.dark ? 0.45 : 0.28); wt = 800; }
        fillRR(ctx, p[0] + 1.5, p[1] + 1.5, s - 3, s - 3, M.min(8, s / 5), bg, k.line, 1);
        if (sk && marks[v]) fillRR(ctx, p[0] + 3, p[1] + 3, s - 6, s - 6, M.min(7, s / 5), null, k.gold, 2.5); // marked and in the skip pattern: keep a gold ring
        if (hid[v] && !peek[v]) { fillRR(ctx, p[0] + 1.5, p[1] + 1.5, s - 3, s - 3, M.min(8, s / 5), k.empty, k.line, 1); tx(ctx, '?', p[0] + s / 2, p[1] + s / 2 + 1, { size: fs, wt: 700, kid: true, col: k.muted }); }
        else tx(ctx, String(v), p[0] + s / 2, p[1] + s / 2 + 1, { size: fs, wt: wt, kid: true, col: col });
        if (sieveOn && crossed[v]) { ctx.save(); ctx.strokeStyle = soft(PCOL[[2, 3, 5, 7].indexOf(crossed[v])] || k.muted, 0.8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p[0] + s * 0.2, p[1] + s * 0.8); ctx.lineTo(p[0] + s * 0.8, p[1] + s * 0.2); ctx.stroke(); ctx.restore(); }
      }
      if (path.length > 1) for (i = 1; i < path.length; i++) { var A = xy(path[i - 1] - st), B = xy(path[i] - st); arw(ctx, A[0] + s / 2, A[1] + s / 2, B[0] + s / 2, B[1] + s / 2, soft(k.blue, 0.75), 2.5, 9); }
      if (token != null && token >= st && token < st + N) { var t = xy(token - st); ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 4; rr(ctx, t[0] + 2, t[1] + 2, s - 4, s - 4, M.min(10, s / 4)); ctx.stroke(); ctx.restore(); }
      P.sync(); say();
    }
    function isPrime(v) { if (v < 2) return false; for (var d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; }
    function doneSieve() { return crossed._all; }
    function say() {
      var h = '';
      if (token != null) {
        var d = token - tokenStart, tens = M.trunc(d / 10), ones = d - tens * 10;
        h = 'Start at ' + tokenStart + '. You are on <b>' + token + '</b>' + (d ? ': ' + tokenStart + (d > 0 ? ' + ' : ' − ') + M.abs(d) + ' = ' + token + (M.abs(d) >= 10 ? ' (' + plural(M.abs(tens), 'ten') + (ones ? ' and ' + plural(M.abs(ones), 'one') : '') + ')' : '') + '.' : '. Use the arrow keys or tap a square: → is 1 more, ↓ is 10 more.');
      } else if (sieveOn) {
        var used = [2, 3, 5, 7].filter(function (p) { return crossed['p' + p]; });
        if (!used.length) h = 'Cross out the multiples of 2, then 3, 5 and 7. The numbers left (other than 1) are prime.';
        else { var left = []; for (var v = st; v < st + N; v++) if (v > 1 && !crossed[v]) left.push(v); h = 'Crossed out multiples of ' + used.join(', ') + '. Not crossed out: ' + left.slice(0, 26).join(', ') + (left.length > 26 ? ' …' : '') + (crossed._all ? '. <b>These ' + left.length + ' numbers are the primes up to ' + (st + N - 1) + '.</b>' : '.'); }
      } else if (skip) {
        var list = []; for (v = st; v < st + N; v++) if (v > 0 && v % skip === 0) list.push(v);
        var mk2 = Object.keys(marks).map(Number).sort(function (x, y) { return x - y; });
        h = 'Counting by ' + skip + 's: ' + list.slice(0, 12).join(', ') + (list.length > 12 ? ', and so on' : '') + '. Look at the pattern the gold squares make.' +
          (mk2.length ? ' You shaded ' + mk2.slice(0, 16).join(', ') + (mk2.length > 16 ? ' …' : '') + (mk2.every(function (x) { return x % skip === 0; }) ? ': all in the pattern.' : '.') : ' Tap squares to shade them too.');
      } else {
        var m = Object.keys(marks).map(Number).sort(function (x, y) { return x - y; });
        h = o.hide ? 'Tap a ? to peek under it. One step right is 1 more. One row down is 10 more.' : m.length ? 'Shaded: ' + m.slice(0, 20).join(', ') + (m.length > 20 ? ' …' : '') : 'Tap a square to shade it. One step right is 1 more. One row down is 10 more.';
      }
      S.say(h);
    }
    function moveTo(v) { if (v < st || v >= st + N) return; if (token != null) { token = v; path.push(v); if (path.length > 40) path.shift(); } cur = v - st; }
    function act(i) {
      var v = st + i; cur = i;
      if (hid[v] && !peek[v]) { peek[v] = 1; if (TT && TT.find != null) marks[v] = 1; }
      else if (token != null) moveTo(v);
      else if (!sieveOn) { if (marks[v]) delete marks[v]; else marks[v] = 1; }
      changed();
    }
    ptr(S.c.cv, { tap: function (x, y) { var c = M.floor((x - G.x0) / G.s), r = M.floor((y - G.y0) / G.s); if (c >= 0 && c < Cc && r >= 0 && r < R) act(r * Cc + c); }, over: function () { return 'pointer'; } });
    var P = pads(S.stage, {
      list: function () { var p = xy(cur), v = st + cur; return [{ x: p[0], y: p[1], w: G.s, h: G.s, label: (token != null ? 'Marker on ' + token + '. Arrow keys move it.' : 'Square ' + (hid[v] && !peek[v] ? 'hidden' : v) + (marks[v] ? ', shaded' : '') + '. Arrow keys move, Enter ' + (hid[v] && !peek[v] ? 'peeks.' : 'shades.')) }]; },
      key: function (i, dx, dy) {
        var j = cur + dx - dy * Cc; if (j < 0 || j >= N) return;
        if (token != null) { moveTo(st + j); changed(); } else { cur = j; draw(); }
      },
      act: function () { act(cur); }
    });
    var row = S.row();
    if (o.skipPick) V.seg(row, { label: 'Count by', items: [['0', 'Off'], ['2', '2s'], ['3', '3s'], ['4', '4s'], ['5', '5s'], ['10', '10s']], value: String(skip), change: function (v) { skip = +v; draw(); } });
    if (sieveOn) [2, 3, 5, 7].forEach(function (p) {
      var b = V.button(row, 'Cross out ' + p + 's', function () {
        for (var v = 2 * p; v < st + N; v += p) if (v >= st && !crossed[v]) crossed[v] = p;
        crossed['p' + p] = 1; b.disabled = true; crossed._all = crossed.p2 && crossed.p3 && crossed.p5 && crossed.p7 && st + N - 1 <= 120; draw();
      });
    });
    if (token != null) V.button(row, 'Back to ' + tokenStart, function () { token = tokenStart; path = [token]; cur = token - st; changed(); });
    else if (!sieveOn && !o.hide) V.button(row, 'Clear', function () { marks = {}; draw(); });
    if (o.hide) V.button(row, 'Cover them again', function () { peek = {}; if (TT && TT.find != null) marks = {}; changed(); });
    var tk = S.task({
      text: TT && (TT.find != null ? 'Find ' + TT.find + ' and tap it.' : 'Start at ' + tokenStart + '. Move to ' + TT.target + '.'),
      ok: function () { return TT.find != null ? !!marks[int(TT.find, 0)] : token === int(TT.target, 0); },
      hint: function () {
        if (TT.find != null) return 'Find the row that starts with the right tens. Then count across.';
        var d = int(TT.target, 0) - token; if (!d) return '';
        var tn = M.trunc(d / 10), on = d - tn * 10;
        return 'You are on ' + token + '. ' + (tn ? 'Move ' + plural(M.abs(tn), 'row') + (tn > 0 ? ' down' : ' up') : '') + (tn && on ? ' and ' : '') + (on ? plural(M.abs(on), 'square') + (on > 0 ? ' right' : ' left') : '') + '.';
      },
      yes: function () { return TT.find != null ? 'There it is: ' + TT.find + '.' : tokenStart + (TT.target >= tokenStart ? ' + ' : ' − ') + M.abs(TT.target - tokenStart) + ' = ' + TT.target + '.'; }
    });
    function changed() { draw(); if (tk) tk.update(); }
    S.live(draw); draw();
  });

  /* ================================================================ coins
     U.S. coins (and dollar bills) to count and to make amounts. Coins are drawn at their real sizes compared with
     each other: a dime is the smallest coin but is worth more than a penny or a nickel.
     opts:
       have: ["penny", "nickel", "dime", "quarter"]   coins the buttons offer; also "half" (50¢) and "dollar" ($1 bill)
       start: {"quarter": 2, "dime": 1}               coins already on the mat
       price: 0, pay: 0     making change: e.g. {"price": 63, "pay": 100}: add coins to count up from the price to what was paid
       task: 63  or  {target: 63, fewest: true}      "Make 63¢" (fewest: with as few coins as you can).
             With price and pay, the task is to make the change.
     Tap a coin on the mat to take it off. "Line them up" sorts the coins from greatest to least value to count on.  */
  var COIN = { penny: { v: 1, d: 19.05, n: 'penny', p: 'pennies', cu: 1 }, nickel: { v: 5, d: 21.21, n: 'nickel', p: 'nickels' }, dime: { v: 10, d: 17.91, n: 'dime', p: 'dimes' }, quarter: { v: 25, d: 24.26, n: 'quarter', p: 'quarters' }, half: { v: 50, d: 30.61, n: 'half dollar', p: 'half dollars' }, dollar: { v: 100, d: 0, n: 'dollar bill', p: 'dollar bills', bill: 1 } };
  function cents(v) { return v < 100 ? v + '¢' : '$' + M.floor(v / 100) + '.' + ('0' + v % 100).slice(-2); }
  function fewestCoins(t, kinds) { var best = [0]; for (var v = 1; v <= t; v++) { best[v] = Infinity; kinds.forEach(function (k) { var c = COIN[k].v; if (c <= v && best[v - c] + 1 < best[v]) best[v] = best[v - c] + 1; }); } return best[t]; }
  def('coins', function (el, o) {
    var S = shell(el, o, { name: 'coins', kid: true, label: 'Coins to count', touch: 'manipulation', height: 200 });
    var have = (o.have || ['penny', 'nickel', 'dime', 'quarter']).filter(function (k) { return COIN[k]; }), TT = taskOf(o);
    var price = int(o.price, 0, 0), pay = int(o.pay, 0, 0), change = price > 0 && pay > price, mat = [], L = [];
    Object.keys(o.start || {}).forEach(function (k) { if (COIN[k]) for (var i = 0; i < int(o.start[k], 0, 0, 30); i++) mat.push(k); });
    function total() { var s = 0; mat.forEach(function (k) { s += COIN[k].v; }); return s; }
    function layout() {
      var w = S.c.w, sc = M.min(2.6, (w - 20) / 6.2 / 24.26), x = 12, y = 12, rowH = 0, out = [];
      mat.forEach(function (k) {
        var c = COIN[k], cw = c.bill ? 24.26 * sc * 2.5 : c.d * sc, ch = c.bill ? 24.26 * sc * 1.1 : c.d * sc;
        if (x + cw > w - 10) { x = 12; y += rowH + 10; rowH = 0; }
        out.push({ k: k, x: x, y: y, w: cw, h: ch }); x += cw + 9; rowH = M.max(rowH, ch);
      });
      L = out; S.height(M.max(24.26 * sc + 24, y + rowH + 14) + (change ? 0 : 0));
    }
    function coinDraw(ctx, it, k) {
      var c = COIN[it.k];
      if (c.bill) {
        fillRR(ctx, it.x, it.y, it.w, it.h, 5, k.dark ? '#3c5a46' : '#d6e8d2', k.dark ? '#7fb08f' : '#5b8a5f', 2);
        ctx.save(); ctx.strokeStyle = k.dark ? '#7fb08f' : '#7aa77d'; ctx.lineWidth = 1; rr(ctx, it.x + 4, it.y + 4, it.w - 8, it.h - 8, 3); ctx.stroke(); ctx.restore();
        disc(ctx, it.x + it.w / 2, it.y + it.h / 2, it.h * 0.3, k.dark ? '#4c6e57' : '#eef6ea', k.dark ? '#7fb08f' : '#7aa77d', 1);
        tx(ctx, '$1', it.x + it.w / 2, it.y + it.h / 2 + 1, { size: it.h * 0.3, wt: 800, kid: true, col: k.dark ? '#d9f0de' : '#2f5a35' });
        tx(ctx, '1', it.x + 10, it.y + 11, { size: 10, wt: 700, col: k.dark ? '#d9f0de' : '#2f5a35' }); tx(ctx, '1', it.x + it.w - 10, it.y + it.h - 10, { size: 10, wt: 700, col: k.dark ? '#d9f0de' : '#2f5a35' });
        return;
      }
      var r = it.w / 2, cx = it.x + r, cy = it.y + r, g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
      if (c.cu) { g.addColorStop(0, '#f1b38a'); g.addColorStop(1, '#b8693a'); } else { g.addColorStop(0, '#f7f9fa'); g.addColorStop(1, '#a9b1b8'); }
      disc(ctx, cx, cy, r, g, c.cu ? '#8a4a24' : '#7d868e', 1.5);
      disc(ctx, cx, cy, r * 0.84, null, c.cu ? 'rgba(120,60,25,.45)' : 'rgba(90,100,110,.4)', 1);
      tx(ctx, c.v + '¢', cx, cy - r * 0.08, { size: M.max(10, r * (c.v >= 10 ? 0.62 : 0.72)), wt: 800, kid: true, col: c.cu ? '#5a2c10' : '#39424a' });
      tx(ctx, c.n === 'half dollar' ? 'half' : c.n, cx, cy + r * 0.48, { size: M.max(7, r * 0.27), wt: 600, col: c.cu ? '#5a2c10' : '#47515a' });
    }
    function draw() {
      layout(); var ctx = S.ctx, k = C(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      if (!mat.length) tx(ctx, change ? 'Add coins for the change.' : 'Tap a coin button to put a coin here.', S.c.w / 2, S.c.h / 2, { size: 15, kid: true, col: k.muted });
      L.forEach(function (it) { coinDraw(ctx, it, k); });
      P.sync(); say();
    }
    function countOn() { var s = mat.slice().sort(function (a, b) { return change ? COIN[a].v - COIN[b].v : COIN[b].v - COIN[a].v; }), t = change ? price : 0; return s.map(function (k) { t += COIN[k].v; return cents(t); }); }
    function summary() {
      var by = {}; mat.forEach(function (k) { by[k] = (by[k] || 0) + 1; });
      return Object.keys(COIN).filter(function (k) { return by[k]; }).sort(function (a, b) { return COIN[b].v - COIN[a].v; }).map(function (k) { return by[k] + ' ' + (by[k] === 1 ? COIN[k].n : COIN[k].p); }).join(', ');
    }
    function say() {
      var t = total(), seq = countOn(), h;
      if (change) h = 'The price is <b>' + cents(price) + '</b>. You pay <b>' + cents(pay) + '</b>. Count up from ' + cents(price) + ': ' + (seq.length ? seq.join(', ') : '…') + '.' + (t ? ' Change so far: <b>' + cents(t) + '</b>.' : '');
      else if (!mat.length) h = 'No coins yet.';
      else h = summary() + '. Count on from the biggest: ' + seq.join(', ') + '. <b>Total: ' + cents(t) + (t >= 100 ? ' (' + t + '¢)' : '') + '</b>';
      S.say(h);
    }
    function removeAt(i) { if (i >= 0 && i < mat.length) { mat.splice(i, 1); changed(); } }
    ptr(S.c.cv, {
      tap: function (x, y) { for (var i = L.length - 1; i >= 0; i--) { var it = L[i]; if (x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h) { removeAt(i); return; } } },
      over: function (x, y) { return L.some(function (it) { return x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h; }) ? 'pointer' : ''; }
    });
    var P = pads(S.stage, {
      click: true, roving: true,
      list: function () { return L.map(function (it) { return { x: it.x, y: it.y, w: it.w, h: it.h, label: COIN[it.k].n + ', ' + COIN[it.k].v + ' cents. Press to take it off.' }; }); },
      act: function (i) { removeAt(i); var b = P.btn(M.min(i, mat.length - 1)); if (b) b.focus(); },
      nav: function (i, dx, dy) { var j = i + (dx || -dy); return j >= 0 && j < mat.length ? j : null; }
    });
    var row = S.row();
    have.forEach(function (key) { var b = V.button(row, '+ ' + (COIN[key].bill ? '$1 bill' : COIN[key].n + ' ' + COIN[key].v + '¢'), function () { if (mat.length < 40) { mat.push(key); changed(); } }); b.setAttribute('aria-label', 'Add a ' + COIN[key].n); });
    var row2 = S.row();
    V.button(row2, 'Line them up', function () { mat.sort(function (a, b) { return COIN[b].v - COIN[a].v; }); changed(); }, 'pri');
    V.button(row2, 'Clear', function () { mat = []; changed(); });
    var target = change ? pay - price : TT ? int(TT.target, 0) : 0;
    if (change && !TT) { TT = {}; S.o.task = TT; }
    var tk = S.task({
      text: change ? 'Make the change from ' + cents(pay) + ' for something that costs ' + cents(price) + '.' : 'Make ' + cents(target) + (TT && TT.fewest ? ' with as few coins as you can.' : '.'),
      ok: function () { return total() === target && (!TT.fewest || mat.length === fewestCoins(target, have)); },
      hint: function () {
        var t = total();
        if (t < target) return 'You have ' + cents(t) + '. You need ' + cents(target - t) + ' more.';
        if (t > target) return 'You have ' + cents(t) + '. That is ' + cents(t - target) + ' too much. Take a coin off.';
        return 'That makes ' + cents(target) + ' with ' + mat.length + ' coins. You can do it with ' + fewestCoins(target, have) + '. Try trading small coins for bigger ones.';
      },
      yes: function () { return change ? 'The change is ' + cents(target) + '. ' + cents(price) + ' + ' + cents(target) + ' = ' + cents(pay) + '.' : 'That makes ' + cents(target) + (TT.fewest ? ' with the fewest coins.' : '.'); }
    });
    function changed() { draw(); if (tk) tk.update(); }
    S.live(draw); draw();
  });

  /* ================================================================ clock
     An analog clock with hands you can drag. The hour hand moves as the minutes pass, so at 2:45 it is almost at 3.
     opts:
       time: "3:00"     the starting time (h:mm)
       step: 5          minutes per step when dragging or using the keys (1, 5, 15, 30 or 60)
       digital: true    show the digital time; false hides it behind a "Show the time" button (reading practice)
       words: true      also say the time in words ("quarter past 3", "25 minutes to 4")
       ring: false      show the minutes (5, 10, 15 …) around the outside
       ampm: false      keep track of a.m. and p.m. as the hands go around (start time like "9:30 pm")
       from: null       elapsed time: {"from": "2:15"} shades the time from 2:15 to the clock's time and says how long it is
       task: "7:30"  or  {target: "7:30"}   "Show 7:30 on the clock."                                                   */
  function parseTime(s, dflt) {
    var m = String(s || '').trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/); if (!m) return dflt;
    var h = +m[1] % 12, mm = +(m[2] || 0); if (m[3] && m[3][0] === 'p') h += 12; return h * 60 + mm;
  }
  def('clock', function (el, o) {
    var S = shell(el, o, { name: 'clock', kid: true, label: 'A clock with hands you can move', touch: 'none', height: 300 });
    var ampm = !!o.ampm, DAY = ampm ? 1440 : 720, step = [1, 5, 15, 30, 60].indexOf(int(o.step, 5)) >= 0 ? int(o.step, 5) : 5;
    var t = ((parseTime(o.time, 180) % DAY) + DAY) % DAY, showDig = o.digital === true || (o.digital !== false && !S.quiet), fromT = o.from ? parseTime(o.from.from || o.from, null) : null, elapsed = 0, G = {}, TT = taskOf(o);
    var target = TT ? parseTime(TT.target, 0) : 0;
    function hm(v) { v = ((v % DAY) + DAY) % DAY; var h = M.floor(v / 60) % 12 || 12, m = v % 60; return h + ':' + ('0' + m).slice(-2) + (ampm ? (v < 720 ? ' a.m.' : ' p.m.') : ''); }
    function inWords(v) {
      v = ((v % 720) + 720) % 720; var h = M.floor(v / 60) % 12 || 12, m = v % 60, nx = h % 12 + 1;
      if (!m) return h + " o'clock"; if (m === 15) return 'quarter past ' + h; if (m === 30) return 'half past ' + h; if (m === 45) return 'quarter to ' + nx;
      return m < 30 ? plural(m, 'minute') + ' past ' + h : plural(60 - m, 'minute') + ' to ' + nx;
    }
    function geo() { var w = S.c.w, side = w >= 520, R = M.min(side ? 135 : (w - (o.ring ? 52 : 24)) / 2, 150); if (o.ring) R -= side ? 14 : 0; S.height(side ? 2 * R + (o.ring ? 56 : 24) : 2 * R + (o.ring ? 50 : 24) + 64); G = { R: R, cx: side ? w / 2 - 70 : w / 2, cy: R + (o.ring ? 26 : 12), side: side }; G.dx = side ? G.cx + R + 40 : w / 2 - 70; G.dy = side ? G.cy - 30 : G.cy + R + (o.ring ? 22 : 12); }
    function ang(frac) { return frac * TAU - PI / 2; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), R = G.R, cx = G.cx, cy = G.cy, i;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      disc(ctx, cx, cy, R + 4, k.frame); disc(ctx, cx, cy, R - 2, k.dark ? '#18261e' : '#fffdf6');
      if (fromT !== null) {
        var e = ((t - fromT) % DAY + DAY) % DAY, a0 = ang((fromT % 60) / 60);
        ctx.save(); ctx.fillStyle = soft(k.gold, 0.28); ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R * 0.9, a0, a0 + (e % 60) / 60 * TAU); ctx.closePath(); ctx.fill(); ctx.restore();
        if (e >= 60) { ctx.save(); ctx.strokeStyle = soft(k.gold, 0.75); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, 0, TAU); ctx.stroke(); ctx.restore(); tx(ctx, '+ ' + plural(M.floor(e / 60), 'hour'), cx, cy + R * 0.38, { size: M.max(11, R * 0.1), wt: 700, col: k.gold, halo: k.dark ? '#18261e' : '#fffdf6' }); }
        var a1 = ang((fromT % 60) / 60); ln(ctx, cx, cy, cx + R * 0.9 * M.cos(a1), cy + R * 0.9 * M.sin(a1), k.gold, 2, [4, 4]);
      }
      for (i = 0; i < 60; i++) { var a = ang(i / 60), big = i % 5 === 0, r1 = R - 6, r2 = R - (big ? 16 : 10); ln(ctx, cx + r1 * M.cos(a), cy + r1 * M.sin(a), cx + r2 * M.cos(a), cy + r2 * M.sin(a), big ? k.ink : k.muted, big ? 2.5 : 1); }
      for (i = 1; i <= 12; i++) { a = ang(i / 12); tx(ctx, String(i), cx + R * 0.72 * M.cos(a), cy + R * 0.72 * M.sin(a) + 1, { size: M.max(13, R * 0.17), wt: 700, kid: true }); }
      if (o.ring) for (i = 0; i < 12; i++) { a = ang(i / 12); tx(ctx, i ? String(i * 5) : '0', cx + (R + 17) * M.cos(a), cy + (R + 17) * M.sin(a), { size: 11, wt: 700, col: k.redEdge }); }
      var mA = ang((t % 60) / 60), hA = ang((t % 720) / 720);
      hand(ctx, cx, cy, hA, R * 0.5, 9, k.blueC, k.blueEdge); hand(ctx, cx, cy, mA, R * 0.8, 5.5, k.redC, k.redEdge);
      disc(ctx, cx, cy, 7, k.ink); disc(ctx, cx, cy, 3, k.bg);
      // digital
      var dw = 140, dh = 54; fillRR(ctx, G.dx, G.dy, dw, dh, 12, k.dark ? '#0f1913' : '#1d2a22', k.frame, 2);
      tx(ctx, showDig ? hm(t).replace(/ [ap]\.m\./, '') : '?:??', G.dx + dw / 2, G.dy + dh / 2 + 1, { font: '700 30px ui-monospace,Menlo,Consolas,monospace', col: '#7ef0b0' });
      if (ampm && showDig) tx(ctx, t < 720 ? 'a.m.' : 'p.m.', G.dx + dw + 8, G.dy + dh / 2, { size: 14, wt: 700, al: 'left', col: k.muted });
      P.sync(); say();
    }
    function hand(ctx, cx, cy, a, len, wd, col, edge) {
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = edge; ctx.lineWidth = wd + 2.5; ctx.beginPath(); ctx.moveTo(cx - 12 * M.cos(a), cy - 12 * M.sin(a)); ctx.lineTo(cx + len * M.cos(a), cy + len * M.sin(a)); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.stroke(); ctx.restore();
    }
    function say() {
      var m = t % 60, h = M.floor((t % 720) / 60) || 12, s;
      if (!showDig) s = 'What time does the clock show? The short blue hand points to the hour; the long red hand shows the minutes.';
      else {
        s = '<b>' + hm(t) + '</b>' + (o.words !== false ? ' — ' + inWords(t) : '') + '. ';
        s += m === 0 ? 'The minute hand points straight up at 12.' : 'The minute hand points to ' + (m % 5 ? 'between ' + (M.floor(m / 5) || 12) + ' and ' + (M.floor(m / 5) + 1) : (m / 5)) + ' (' + m + ' minutes). The hour hand is ' + (m < 20 ? 'just past ' + h : m < 40 ? 'about halfway from ' + h + ' to ' + (h % 12 + 1) : 'most of the way from ' + h + ' to ' + (h % 12 + 1)) + '.';
      }
      if (fromT !== null) { var e = ((t - fromT) % DAY + DAY) % DAY; s += '<br>From ' + hm(fromT) + ' to ' + hm(t) + ' is <b>' + (M.floor(e / 60) ? plural(M.floor(e / 60), 'hour') + (e % 60 ? ' ' : '') : '') + (e % 60 || !M.floor(e / 60) ? plural(e % 60, 'minute') : '') + '</b>.'; }
      S.say(s);
    }
    function setT(v) { t = ((M.round(v / step) * step) % DAY + DAY) % DAY; draw(); }
    var grab = null;
    ptr(S.c.cv, {
      hit: function (x, y) { var d = M.hypot(x - G.cx, y - G.cy); if (d > G.R + 10 || d < 6) return null; var a = M.atan2(y - G.cy, x - G.cx), mA = ang((t % 60) / 60), hA = ang((t % 720) / 720); function df(p) { var q = M.abs(((a - p) % TAU + TAU) % TAU); return M.min(q, TAU - q); } if (df(mA) < 0.35 && d > G.R * 0.25) return 'm'; if (df(hA) < 0.4 && d < G.R * 0.62) return 'h'; return d > G.R * 0.55 ? 'm' : 'h'; },
      move: function (h, x, y) {
        var frac = ((M.atan2(y - G.cy, x - G.cx) + PI / 2) / TAU % 1 + 1) % 1;
        if (h === 'm') { var nm = frac * 60, d = nm - t % 60; if (d > 30) d -= 60; if (d < -30) d += 60; var nt = t + d, r = M.round(nt / step) * step; if (r !== t) setT(r); }
        else { var nh = frac * 720, d2 = nh - t % 720; if (d2 > 360) d2 -= 720; if (d2 < -360) d2 += 720; var r2 = M.round((t + d2) / step) * step; if (r2 !== t) setT(r2); }
      },
      end: function () { if (tk) tk.update(); }
    });
    var P = pads(S.stage, {
      list: function () { var mA = ang((t % 60) / 60), hA = ang((t % 720) / 720); return [{ x: G.cx + G.R * 0.7 * M.cos(mA), y: G.cy + G.R * 0.7 * M.sin(mA), size: 36, label: 'Minute hand. Arrow keys move it ' + step + ' minutes. ' + hm(t) }, { x: G.cx + G.R * 0.4 * M.cos(hA), y: G.cy + G.R * 0.4 * M.sin(hA), size: 36, label: 'Hour hand. Arrow keys move it one hour. ' + hm(t) }]; },
      key: function (i, dx, dy, e) { var s = dx || dy; setT(t + s * (i ? 60 : (e.shiftKey ? 15 : step))); if (tk) tk.update(); }
    });
    var row = S.row();
    V.button(row, '− ' + (step === 60 ? '1 hour' : step + ' min'), function () { setT(t - step); if (tk) tk.update(); });
    V.button(row, '+ ' + (step === 60 ? '1 hour' : step + ' min'), function () { setT(t + step); if (tk) tk.update(); });
    if (step < 60) V.button(row, '+ 1 hour', function () { setT(t + 60); if (tk) tk.update(); });
    if (!showDig) var bShow = V.button(row, 'Show the time', function () { showDig = true; bShow.hidden = true; draw(); }, 'pri');
    var tk = S.task({
      text: 'Show ' + (TT && hm(target)) + ' on the clock.',
      ok: function () { return ampm ? t === target : t % 720 === target % 720; },
      hint: function () { var m = target % 60; return t % 60 !== m ? 'Move the long minute hand to ' + (m ? m + ' minutes (the ' + (m % 5 ? 'mark near ' + (M.round(m / 5) || 12) : (m / 5)) + ')' : 'the 12') + '.' : 'The minutes are right. Now check the short hour hand.'; },
      yes: function () { return 'The clock shows ' + hm(target) + ' — ' + inWords(target) + '.'; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ numberline
     A number line for whole numbers, fractions and decimals. Drag points onto it; zoom in between two tick marks
     to see the smaller steps hiding there (0.3 to 0.4 holds 0.31, 0.32 …).
     opts:
       min: 0, max: 10     the ends (fractions and decimals are fine: "-2", "5/2")
       step: 1             distance between the big, labeled ticks
       sub: 0              small parts between big ticks (4 for quarters, 10 for tenths); 0 or 1 for none
       labels: "auto"      "whole", "frac" (5/4), "mixed" (1 1/4), "dec" (1.25) or "none"; auto picks from sub
       reduce: false       label 2/4 as 1/2 (false keeps the parts visible: 2/4)
       points: [{v: "3/4", label: "A", color: "red", drag: true}]   points to show. Default: one draggable point.
                           colors: red, blue, green, gold, purple, orange, teal
       snap                the smallest step a dragged point moves (default: the smallest tick)
       hops: [{from: 2, by: 3, n: 1}]   jumps drawn as arcs (addition, skip counting: {from: 0, by: 3, n: 4}); from and by
                           may be fractions ("1/2"), labeled the way the line is. A hop set that starts where the one
                           before ended continues the sum; one that starts somewhere else is a separate sum (own color)
       zoom: false         "Zoom in" and "Zoom out" buttons (each zoom shows ten times smaller steps)
       value: true         show the dragged point's value above it
       task: "3/4"  or  {target: "3/4", point: 0}   "Put point A at 3/4."  Any equal value counts (6/8 = 3/4).   */
  var PCOLS = ['red', 'blue', 'green', 'purple', 'orange', 'teal', 'gold'];
  def('numberline', function (el, o) {
    var S = shell(el, o, { name: 'numberline', label: 'A number line', touch: 'pan-y', height: 130 });
    var minQ = parseQ(o.min != null ? o.min : 0) || rat(0), maxQ = parseQ(o.max != null ? o.max : 10) || rat(10);
    if (maxQ.v <= minQ.v) maxQ = qadd(minQ, rat(10));
    var stepQ = parseQ(o.step || 1) || rat(1), sub = M.max(1, int(o.sub, 1, 1, 100)), TT = taskOf(o);
    var lab = o.labels || 'auto'; if (lab === 'auto') lab = sub === 1 || sub === 10 ? (stepQ.d === 1 && minQ.d === 1 && sub === 1 ? 'whole' : 'dec') : 'frac';
    var unit0 = rat(stepQ.n, stepQ.d * sub), snapQ = o.snap ? parseQ(o.snap) || unit0 : unit0;
    var level = 0, view = { lo: minQ.v, hi: maxQ.v }, units = [unit0], anim = null, focusIx = 0;
    var pts = (o.points || [{ v: minQ, drag: true }]).map(function (p, i) {
      var q = typeof p === 'object' && p.v !== undefined ? (p.v.n !== undefined ? p.v : parseQ(p.v)) : parseQ(p);
      return { q: q || minQ, label: p.label || (o.points ? String.fromCharCode(65 + i) : 'A'), color: p.color || PCOLS[i % PCOLS.length], drag: o.points ? p.drag === true : true };
    });
    if (TT && !pts.some(function (p) { return p.drag; })) pts[0].drag = true;
    var hops = (o.hops || []).map(function (h) { var fq = parseQ(h.from != null ? h.from : 0) || rat(0), bq2 = parseQ(h.by != null ? h.by : 1) || rat(1); return { from: fq.v, by: bq2.v, fq: fq, bq: bq2, n: int(h.n, 1, 1, 30) }; });
    // hop sets that start where the previous set ended are one sum ("chain"); each chain gets its own color
    var HOPC = ['purple', 'orange', 'teal', 'pink'];
    (function () { var c = -1, end = null; hops.forEach(function (h) { if (!(end && near(end.v, h.fq.v))) c++; h.chain = c; end = qadd(h.fq, rat(h.bq.n * h.n, h.bq.d)); }); })();
    function hopFrac(q) { return (lab === 'frac' || lab === 'mixed') && q.d !== 1; }
    function hopHtml(q) { return hopFrac(q) ? qH(q, lab === 'mixed' ? 'mixed' : 'frac') : f(q.v); }
    var G = {};
    function curUnit() { return level ? rat(unit0.n, unit0.d * M.pow(10, level)) : (o.snap ? snapQ : unit0); }
    function X(v) { return G.x0 + (v - view.lo) / (view.hi - view.lo) * (G.x1 - G.x0); }
    function V2(px) { return view.lo + (px - G.x0) / (G.x1 - G.x0) * (view.hi - view.lo); }
    function snapV(v) { var u = curUnit(), k = M.round((v - minQ.v) / u.v); var q = qadd(minQ, rat(k * u.n, u.d)); return q; }
    function qLabel(q, small) {
      if (lab === 'dec' || lab === 'whole') return { t: f(q.v, 6) };
      var u = level ? null : unit0, raw = q;
      if (!o.reduce && u && q.d !== 1) { var nn = M.round(q.v * u.d); if (near(nn / u.d, q.v)) raw = { n: nn, d: u.d, v: q.v }; }
      if (q.d === 1 && !small) return { t: minus(q.n) };
      return { q: raw };
    }
    var nChains = hops.length ? hops[hops.length - 1].chain + 1 : 0;
    function geo() { var w = S.c.w, top = (hops.length ? (hops.some(function (h) { return hopFrac(h.bq); }) ? 50 : 36) + (nChains - 1) * 18 : 0) + (o.value !== false && pts.some(function (p) { return p.drag; }) ? 72 : 30); G = { x0: 26, x1: w - 26, y: top }; S.height(G.y + (lab === 'frac' || lab === 'mixed' ? 62 : 44)); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), span = view.hi - view.lo, ppu = (G.x1 - G.x0) / span, y = G.y;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      arw(ctx, G.x0 - 18, y, G.x0 - 22, y, k.ink, 2, 9); arw(ctx, G.x1 + 18, y, G.x1 + 22, y, k.ink, 2, 9);
      ln(ctx, G.x0 - 16, y, G.x1 + 16, y, k.ink, 2);
      // tick families from coarse to fine
      var fams = [{ q: stepQ, big: 1 }].concat(units.map(function (u) { return { q: u }; }));
      if (!level && sub === 1) fams = [{ q: stepQ, big: 1 }].concat(units.slice(1).map(function (u) { return { q: u }; }));
      var labeled = false, drawn = {};
      fams.forEach(function (fm, fi) {
        var sp = fm.q.v, px = sp * ppu; if (px < 3) return;
        var al = clamp((px - 3) / 8, 0, 1), h = fi === 0 ? 11 : M.max(5, 9 - fi * 1.5);
        var j0 = M.ceil((view.lo - minQ.v) / sp - 1e-9), j1 = M.floor((view.hi - minQ.v) / sp + 1e-9);
        if (j1 - j0 > 1200) return;
        var thr = (lab === 'frac' || lab === 'mixed') ? 34 : 40, lbl = px >= thr, stride = 1;
        if (fi === 0 && !lbl) { stride = [2, 5, 10, 20, 50, 100].filter(function (z) { return px * z >= 30; })[0] || 0; lbl = stride > 0; }
        for (var j = j0; j <= j1; j++) {
          var q = qadd(minQ, rat(j * fm.q.n, fm.q.d)), key = q.n + '/' + q.d; if (drawn[key]) continue; drawn[key] = 1;
          if (q.v < minQ.v - 1e-9 || q.v > maxQ.v + 1e-9) continue;
          var x = X(q.v); ctx.save(); ctx.globalAlpha = al; ln(ctx, x, y - h, x, y + h, fi === 0 ? k.ink : k.muted, fi === 0 ? 2 : 1.4);
          if (lbl && (stride <= 1 || M.abs(M.round(q.v / fm.q.v)) % stride === 0)) { var L = qLabel(q, fi > 0); if (L.t !== undefined) tx(ctx, L.t, x, y + 24, { size: fi === 0 ? 14 : 12, wt: fi === 0 ? 600 : 400, col: fi === 0 ? k.ink : k.muted }); else qDraw(ctx, L.q, x, y + 32, { size: fi === 0 ? 13 : 12, form: lab === 'mixed' ? 'mixed' : 'frac', col: fi === 0 ? k.ink : k.muted, wt: fi === 0 ? 600 : 500 }); }
          ctx.restore();
        }
      });
      // hops
      hops.forEach(function (hp) {
        var hc = k[HOPC[hp.chain % HOPC.length]], aq = rat(M.abs(hp.bq.n), hp.bq.d), sg = hp.by < 0 ? '−' : '+';
        for (var i = 0; i < hp.n; i++) {
          var a = hp.from + i * hp.by, b2 = a + hp.by, xa = X(a), xb = X(b2), mid = (xa + xb) / 2, hh = M.min(26, M.abs(xb - xa) / 2 + 6) + hp.chain * 18; // each separate sum arcs higher, so labels don't collide
          ctx.save(); ctx.strokeStyle = hc; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xa, y - 3); ctx.quadraticCurveTo(mid, y - 3 - hh * 2, xb, y - 3); ctx.stroke(); ctx.restore();
          arw(ctx, lerp(xa, xb, 0.9), y - 3 - hh * 0.35, xb, y - 3, hc, 2, 8);
          if (hopFrac(hp.bq)) { // +½ as a stacked fraction (or +1¼ on a mixed-number line), like the line's own labels
            var mx = lab === 'mixed' && aq.n > aq.d;
            fracDraw(ctx, mx ? aq.n % aq.d : aq.n, aq.d, mid, y - 16 - hh, { size: 11, wt: 700, col: hc, halo: k.bg, whole: sg + (mx ? M.floor(aq.n / aq.d) : '') });
          } else tx(ctx, sg + f(M.abs(hp.by)), mid, y - 8 - hh, { size: 12, wt: 700, col: hc, halo: k.bg });
        }
      });
      // points
      pts.forEach(function (p, i) {
        var x = X(p.q.v), col = k[p.color] || p.color; if (x < G.x0 - 20 || x > G.x1 + 20) return;
        disc(ctx, x, y, p.drag ? 9 : 7, col, k.bg, 2.5);
        // with hops on the line, the value bubble sits above the hop labels (geo() leaves room for both)
        var lift = hops.length && o.value !== false ? (hops.some(function (h) { return hopFrac(h.bq); }) ? 50 : 36) + (nChains - 1) * 18 : 0;
        if (p.drag) { ln(ctx, x, y - 12, x, y - 30 - lift, soft(col, 0.6), 2); }
        if (p.drag && o.value !== false) {
          var L = lab === 'dec' || lab === 'whole' ? null : p.q;
          fillRR(ctx, x - 24, y - 64 - lift, 48, 34, 8, k.bg, col, 1.5);
          if (!L || L.d === 1) tx(ctx, f(p.q.v, 6), x, y - 47 - lift, { size: 14, wt: 700, col: k.ink }); else qDraw(ctx, L, x, y - 47 - lift, { size: 11, form: lab === 'mixed' ? 'mixed' : 'frac', wt: 700 });
          tx(ctx, p.label, x - 32, y - 47 - lift, { size: 13, wt: 700, col: col, al: 'right' });
        } else tx(ctx, p.label, x, y - 18, { size: 13, wt: 700, col: col });
      });
      P.sync(); say();
    }
    function valText(q) {
      if (lab === 'dec' || lab === 'whole' || q.d === 1) { var d = f(q.v, 6), dec = d.split('.')[1]; return '<b>' + d + '</b>' + (dec && dec.length <= 3 && M.abs(q.v) < 1 ? ' (' + M.round(M.abs(q.v) * M.pow(10, dec.length)) + ' ' + ['', 'tenths', 'hundredths', 'thousandths'][dec.length] + ')' : ''); }
      var raw = qLabel(q, true).q || q; return '<b>' + qH(raw, lab === 'mixed' ? 'mixed' : 'frac') + '</b>' + (raw.n !== q.n ? ' = ' + qH(q) : '') + (M.abs(q.v) > 1 && lab !== 'mixed' && q.d > 1 ? ' = ' + qH(q, 'mixed') : '') + ' = ' + f(q.v, 4);
    }
    function say() {
      var s = pts.map(function (p) { return p.label + ' is at ' + valText(p.q); }).join('. &nbsp;') + '.';
      if (level) s += '<br>Zoomed in ' + (level > 1 ? level + ' times' : '') + ': each small step is ' + f(curUnit().v, 8) + '.';
      if (hops.length) { // one line per chain of hops: start + hop + hop … = end
        var chains = []; hops.forEach(function (h) { (chains[h.chain] = chains[h.chain] || []).push(h); });
        chains.forEach(function (ch) {
          var tot = ch[0].fq, t = hopHtml(ch[0].fq);
          ch.forEach(function (h) { for (var i = 0; i < h.n; i++) t += (h.by < 0 ? ' − ' : ' + ') + hopHtml(rat(M.abs(h.bq.n), h.bq.d)); tot = qadd(tot, rat(h.bq.n * h.n, h.bq.d)); });
          s += '<br>' + t + ' = ' + hopHtml(tot);
        });
      }
      S.say(s);
    }
    var dragging = -1;
    ptr(S.c.cv, {
      hit: function (x) { var best = -1, bd = 26; pts.forEach(function (p, i) { if (!p.drag) return; var d = M.abs(X(p.q.v) - x); if (d < bd) { bd = d; best = i; } }); return best >= 0 ? best : null; },
      move: function (i, x) { var v = clamp(V2(x), M.max(view.lo, minQ.v), M.min(view.hi, maxQ.v)), q = snapV(v); if (q.v > maxQ.v + 1e-9) q = snapV(v - curUnit().v); if (q.v < minQ.v - 1e-9) q = snapV(v + curUnit().v); pts[i].q = q; focusIx = i; draw(); },
      end: function () { if (tk) tk.update(); },
      tap: function (x, y, h) { if (h != null) return; var d = pts.findIndex(function (p) { return p.drag; }); if (d < 0) return; var v = clamp(V2(x), M.max(view.lo, minQ.v), M.min(view.hi, maxQ.v)); pts[d].q = snapV(v); draw(); if (tk) tk.update(); }
    });
    var P = pads(S.stage, {
      list: function () { return pts.map(function (p) { return { x: X(p.q.v), y: G.y, size: 36, hide: !p.drag, label: 'Point ' + p.label + ' at ' + qText(p.q, lab === 'dec' ? 'dec' : lab === 'mixed' ? 'mixed' : 'frac') + '. Left and right arrows move it.' }; }); },
      key: function (i, dx, dy, e) {
        var u = curUnit(), s = (dx || dy) * (e.shiftKey ? M.max(1, M.round(stepQ.v / u.v)) : 1), q = qadd(pts[i].q, rat(s * u.n, u.d));
        if (q.v < minQ.v - 1e-9 || q.v > maxQ.v + 1e-9) return; pts[i].q = q; focusIx = i;
        if (q.v < view.lo || q.v > view.hi) { var w = view.hi - view.lo; view.lo = clamp(q.v - w / 2, minQ.v, maxQ.v - w); view.hi = view.lo + w; }
        draw(); if (tk) tk.update();
      }
    });
    var row = S.row(), bIn, bOut;
    function zoomTo(lo, hi) {
      var a = { lo: view.lo, hi: view.hi }, w0 = a.hi - a.lo, w1 = hi - lo; if (anim) anim.stop();
      anim = tween(900, function (p) { var w = w0 * M.pow(w1 / w0, p), s = near(w0, w1) ? p : (w0 - w) / (w0 - w1); view.lo = lerp(a.lo, lo, s); view.hi = lerp(a.hi, hi, s); draw(); }, function () { view.lo = lo; view.hi = hi; draw(); });
    }
    if (o.zoom) {
      bIn = V.button(row, 'Zoom in', function () {
        if (level >= 4) return; var u = curUnit(), p = pts[focusIx] || pts[0], v = p ? p.q.v : (view.lo + view.hi) / 2;
        var j = M.floor((v - minQ.v) / u.v + 1e-9); if (j * u.v + minQ.v >= maxQ.v - 1e-9) j--; var lo = minQ.v + j * u.v;
        level++; units.push(rat(u.n, u.d * 10)); zoomTo(lo, lo + u.v); bOut.disabled = false; bIn.disabled = level >= 4;
      }, 'pri');
      bOut = V.button(row, 'Zoom out', function () {
        if (!level) return; level--; units.pop(); pts.forEach(function (p) { p.q = snapV(p.q.v); });
        var lo = minQ.v, hi = maxQ.v; if (level) { var u = rat(unit0.n, unit0.d * M.pow(10, level - 1)), v = (view.lo + view.hi) / 2, j = M.floor((v - minQ.v) / u.v); lo = minQ.v + j * u.v; hi = lo + u.v; }
        zoomTo(lo, hi); bOut.disabled = !level; bIn.disabled = false;
      });
      bOut.disabled = true;
    }
    var tq = TT ? parseQ(TT.target) : null, tpi = TT ? int(TT.point, 0, 0, pts.length - 1) : 0;
    var tk = S.task({
      text: 'Put point ' + (pts[tpi] || {}).label + ' at ' + (tq ? qH(tq, lab === 'mixed' ? 'mixed' : lab === 'dec' ? 'dec' : 'frac') : '') + '.',
      ok: function () { return tq && near(pts[tpi].q.v, tq.v, 1e-9); },
      hint: function () {
        var v = pts[tpi].q.v; if (!tq) return '';
        var fine = M.abs(M.round((tq.v - minQ.v) / curUnit().v) * curUnit().v + minQ.v - tq.v) > 1e-9;
        return 'You are at ' + valText(pts[tpi].q).replace(/<\/?b>/g, '') + '. ' + qH(tq, lab === 'dec' ? 'dec' : 'frac') + ' is a little to the ' + (tq.v > v ? 'right' : 'left') + '.' + (fine ? (o.zoom ? ' Zoom in to see smaller steps.' : ' It sits between two ticks.') : '');
      }
    });
    S.live(draw); draw();
  });

  /* ================================================================ base10
     Base-ten blocks on a place-value mat: ones (small cubes), tens (rods), hundreds (flats) and thousands (big cubes).
     Trade 10 ones for a ten and back again, which is what "carrying" and "borrowing" really are.
     opts:
       n: 47                the number to show (or blocks: {"h": 1, "t": 12, "o": 5} for any mix, even 12 tens)
       cols: auto           2, 3 or 4 places on the mat (ones, tens, hundreds, thousands)
       add: null            e.g. {"n": 47, "add": 38}: an "Add 38" button puts the new blocks in (another color); trade to finish
       take: null           e.g. {"n": 52, "take": 27}: a "Take away 27" button; it asks you to break a ten when there
                            aren't enough ones (this is regrouping in subtraction)
       edit: true           −/+ buttons for each place
       task: 425  or  {target: 425, regroup: true, t: 12}   "Show 425." regroup: with no more than 9 in any place;
                            h/t/o: a required count in that place ("Show 425 using 12 tens").
     Tap a rod or flat to break it into 10 smaller pieces; tap a place holding 10 or more to trade 10 of them up.  */
  var PLACE = ['ones', 'tens', 'hundreds', 'thousands'], PLACE1 = ['one', 'ten', 'hundred', 'thousand'];
  def('base10', function (el, o) {
    var S = shell(el, o, { name: 'base10', kid: true, label: 'Base-ten blocks on a place-value mat', touch: 'manipulation', height: 260 });
    var TT = taskOf(o), n0 = int(o.n, 0, 0, 9999), bl = o.blocks || null, addN = o.add != null ? int(o.add, 0, 0, 9999) : null, takeN = o.take != null ? int(o.take, 0, 0, 9999) : null;
    var big = M.max(n0, addN != null ? n0 + addN : 0, TT ? int(TT.target, 0) : 0, bl ? int(bl.th, 0) * 1000 + int(bl.h, 0) * 100 : 0);
    var cols = clamp(int(o.cols, 0), 0, 4) || (big >= 1000 || (bl && bl.th) ? 4 : big >= 100 || (bl && bl.h) ? 3 : 2);
    var cnt = [], fly = [], flyP = 0, busy = false, note = '', added = false, taken = false, G = {};
    function setN(v, tag) { cnt = [[], [], [], []]; var p = 0; while (v > 0 && p < 4) { var d = p === cols - 1 ? v : v % 10; for (var i = 0; i < d && i < 40; i++) cnt[p].push(tag || 0); v = p === cols - 1 ? 0 : M.floor(v / 10); p++; } }
    if (bl) { cnt = [[], [], [], []]; [['o', 0], ['t', 1], ['h', 2], ['th', 3]].forEach(function (z) { for (var i = 0; i < int(bl[z[0]], 0, 0, 40); i++) cnt[z[1]].push(0); }); } else setN(n0);
    function value() { var s = 0; for (var p = 0; p < 4; p++) s += cnt[p].length * M.pow(10, p); return s; }
    function geo() {
      var w = S.c.w, gap = 8, cw = (w - gap * (cols - 1)) / cols, u = clamp(M.floor(M.min((cw - 14) / 10.6, 15)), 4, 15);
      G = { w: w, cw: cw, gap: gap, u: u, top: 44 };
      var hs = [0, 0, 0, 0];
      hs[0] = M.ceil(M.max(cnt[0].length, 10) / 10) * (2 * (u + 3) + 6);
      var perT = M.max(1, M.floor((cw - 10) / (u + 5))); hs[1] = M.ceil(M.max(cnt[1].length, 1) / perT) * (10 * u + 10);
      var perH = M.max(1, M.floor((cw - 10) / (10 * u + 8))); hs[2] = cnt[2].length > perH * 2 ? 10 * u + 12 + (cnt[2].length - 1) * 6 : M.ceil(M.max(cnt[2].length, 1) / perH) * (10 * u + 10);
      hs[3] = 10 * u * 1.35 + 10 + M.max(0, cnt[3].length - 1) * 8;
      var hmax = 0; for (var p = 0; p < cols; p++) hmax = M.max(hmax, hs[p]);
      G.perT = perT; G.perH = perH; S.height(G.top + hmax + 16);
    }
    function colX(p) { return (cols - 1 - p) * (G.cw + G.gap); }
    function posO(i) { var u = G.u, grp = M.floor(i / 10), r = M.floor((i % 10) / 5), c = i % 5, x0 = colX(0) + (G.cw - 5 * (u + 3)) / 2; return [x0 + c * (u + 3), G.top + 6 + grp * (2 * (u + 3) + 6) + r * (u + 3)]; }
    function posT(i) { var u = G.u, r = M.floor(i / G.perT), c = i % G.perT, n = M.min(G.perT, M.max(1, cnt[1].length)), x0 = colX(1) + (G.cw - n * (u + 5) + 5) / 2; return [x0 + c * (u + 5), G.top + 6 + r * (10 * u + 10)]; }
    function posH(i) {
      var u = G.u, s = 10 * u, tot = cnt[2].length;
      if (tot > G.perH * 2) return [colX(2) + (G.cw - s) / 2 - M.min(20, (tot - 1) * 2) + i * 4, G.top + 6 + i * 6];
      var r = M.floor(i / G.perH), c = i % G.perH, n = M.min(G.perH, M.max(1, tot)); return [colX(2) + (G.cw - n * (s + 8) + 8) / 2 + c * (s + 8), G.top + 6 + r * (s + 10)];
    }
    function posTh(i) { var u = G.u, s = 10 * u; return [colX(3) + (G.cw - s * 1.35) / 2 + i * 8, G.top + 6 + i * 8]; }
    function cols3(k, tag) { return tag ? [k.dark ? '#7cb8f2' : '#8fc0f0', k.dark ? '#3f78b3' : '#2f6fb8'] : [k.dark ? '#74d0a0' : '#7fd3a8', k.dark ? '#3e8f66' : '#1f8a58']; }
    function cube(ctx, x, y, u, tag, k) { var c = cols3(k, tag); fillRR(ctx, x, y, u, u, M.min(3, u / 4), c[0], c[1], 1); }
    function rod(ctx, x, y, u, tag, k) { var c = cols3(k, tag); fillRR(ctx, x, y, u, 10 * u, M.min(3, u / 4), c[0], c[1], 1.2); ctx.save(); ctx.strokeStyle = c[1]; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; for (var j = 1; j < 10; j++) { ctx.beginPath(); ctx.moveTo(x + 1, y + j * u + 0.5); ctx.lineTo(x + u - 1, y + j * u + 0.5); ctx.stroke(); } ctx.restore(); }
    function flat(ctx, x, y, u, tag, k) { var c = cols3(k, tag); fillRR(ctx, x, y, 10 * u, 10 * u, 4, c[0], c[1], 1.4); ctx.save(); ctx.strokeStyle = c[1]; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.beginPath(); for (var j = 1; j < 10; j++) { ctx.moveTo(x + j * u + 0.5, y + 1); ctx.lineTo(x + j * u + 0.5, y + 10 * u - 1); ctx.moveTo(x + 1, y + j * u + 0.5); ctx.lineTo(x + 10 * u - 1, y + j * u + 0.5); } ctx.stroke(); ctx.restore(); }
    function bigCube(ctx, x, y, u, tag, k) {
      var s = 10 * u, d = s * 0.35, c = cols3(k, tag);
      poly(ctx, [[x, y + d], [x + s, y + d], [x + s, y + d + s], [x, y + d + s]], c[0], c[1], 1.4);
      poly(ctx, [[x, y + d], [x + d, y], [x + s + d, y], [x + s, y + d]], shadeHex(k.dark ? '#74d0a0' : '#7fd3a8', 1.25), c[1], 1.4);
      poly(ctx, [[x + s, y + d], [x + s + d, y], [x + s + d, y + s], [x + s, y + d + s]], shadeHex(k.dark ? '#74d0a0' : '#7fd3a8', 0.8), c[1], 1.4);
      ctx.save(); ctx.strokeStyle = c[1]; ctx.globalAlpha = 0.35; ctx.beginPath(); for (var j = 1; j < 10; j++) { ctx.moveTo(x + j * u, y + d); ctx.lineTo(x + j * u, y + d + s); ctx.moveTo(x, y + d + j * u); ctx.lineTo(x + s, y + d + j * u); } ctx.stroke(); ctx.restore();
    }
    var DRAW = [cube, rod, flat, bigCube], POS = [posO, posT, posH, posTh];
    function draw() {
      geo(); var ctx = S.ctx, k = C(), u = G.u, p, i;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      for (p = 0; p < cols; p++) {
        var x = colX(p), many = cnt[p].length >= 10;
        fillRR(ctx, x, 0, G.cw, S.c.h, 10, many ? soft(k.gold, 0.16) : (p % 2 ? k.panel : k.bg), many ? k.gold : k.line, many ? 2 : 1);
        tx(ctx, G.cw > 92 ? PLACE[p][0].toUpperCase() + PLACE[p].slice(1) : ['Ones', 'Tens', 'Hund.', 'Thous.'][p], x + G.cw / 2, 14, { size: 13, wt: 700, kid: true, col: k.muted });
        if (!S.quiet) tx(ctx, String(cnt[p].length), x + G.cw / 2, 32, { size: 18, wt: 800, kid: true, col: many ? k.gold : k.ink });
      }
      for (p = cols - 1; p >= 0; p--) for (i = 0; i < cnt[p].length; i++) { var q = POS[p](i); DRAW[p](ctx, q[0], q[1], u, cnt[p][i], k); }
      fly.forEach(function (m) { DRAW[m.kind](ctx, lerp(m.a[0], m.b[0], flyP), lerp(m.a[1], m.b[1], flyP), u, m.tag, k); });
      P.sync(); say();
    }
    function say() {
      var parts = [], sum = [], v = value(), over = -1;
      for (var p = cols - 1; p >= 0; p--) { var c = cnt[p].length; parts.push(c + ' ' + (c === 1 ? PLACE1[p] : PLACE[p])); sum.push(c * M.pow(10, p)); if (c >= 10 && over < 0) over = p; }
      var s = parts.join(', ') + ' = ' + sum.join(' + ') + ' = <b>' + v + '</b>.';
      if (over >= 0 && over < cols - 1) s += ' There are ' + cnt[over].length + ' ' + PLACE[over] + ': trade 10 ' + PLACE[over] + ' for 1 ' + PLACE1[over + 1] + ' to write the number with digits.';
      if (addN != null) s = (added ? n0 + ' + ' + addN + ' = ' + (value() === n0 + addN ? '<b>' + v + '</b>' : '?') + '. ' : 'Start with ' + n0 + '. ') + s;
      if (takeN != null && taken) s = n0 + ' − ' + takeN + ' = <b>' + v + '</b>. ' + s;
      if (note) s += '<br>' + note;
      S.say(s);
    }
    function trade(p) { // 10 of place p become 1 of place p + 1
      if (busy || p >= cols - 1 || cnt[p].length < 10) return false; busy = true; note = '';
      var from = [], tag = 0; for (var i = cnt[p].length - 10; i < cnt[p].length; i++) { from.push(POS[p](i)); tag = M.max(tag, cnt[p][i]); }
      cnt[p].splice(cnt[p].length - 10, 10); geo();
      var dest = POS[p + 1](cnt[p + 1].length), u = G.u;
      fly = from.map(function (a, j) { var b = p === 0 ? [dest[0], dest[1] + j * u] : p === 1 ? [dest[0] + j * u, dest[1]] : [dest[0] + j * 3, dest[1] + j * 3]; return { kind: p, a: a, b: b, tag: 0 }; });
      tween(950, function (t) { flyP = t; draw(); }, function () { fly = []; cnt[p + 1].push(0); busy = false; changed(); });
      return true;
    }
    function brk(p, done) { // 1 of place p becomes 10 of place p - 1
      if (busy || p < 1 || !cnt[p].length) return false; busy = true; note = '';
      var a = POS[p](cnt[p].length - 1), tag = cnt[p].pop(), u = G.u, base = cnt[p - 1].length; geo();
      fly = []; for (var j = 0; j < 10; j++) { var s = p === 1 ? [a[0], a[1] + j * u] : p === 2 ? [a[0] + j * u, a[1]] : [a[0] + j * 3, a[1] + j * 3]; fly.push({ kind: p - 1, a: s, b: null, tag: tag, j: base + j }); }
      for (j = 0; j < 10; j++) cnt[p - 1].push(tag); geo(); fly.forEach(function (m) { m.b = POS[p - 1](m.j); }); for (j = 0; j < 10; j++) cnt[p - 1].pop();
      tween(950, function (t) { flyP = t; draw(); }, function () { fly = []; for (var j = 0; j < 10; j++) cnt[p - 1].push(tag); busy = false; changed(); if (done) done(); });
      return true;
    }
    ptr(S.c.cv, {
      tap: function (x) { var p = cols - 1 - M.floor(x / (G.cw + G.gap)); if (p < 0 || p >= cols) return; if (cnt[p].length >= 10 && p < cols - 1) trade(p); else if (p > 0 && cnt[p].length) brk(p); },
      over: function () { return 'pointer'; }
    });
    var P = pads(S.stage, {
      click: true, roving: true,
      list: function () { var out = []; for (var p = cols - 1; p >= 0; p--) out.push({ x: colX(p) + 2, y: 2, w: G.cw - 4, h: 40, label: cnt[p].length + ' ' + PLACE[p] + '. ' + (cnt[p].length >= 10 && p < cols - 1 ? 'Press to trade 10 ' + PLACE[p] + ' for 1 ' + PLACE1[p + 1] + '.' : p > 0 && cnt[p].length ? 'Press to break 1 ' + PLACE1[p] + ' into 10 ' + PLACE[p - 1] + '.' : '') }); return out; },
      act: function (i) { var p = cols - 1 - i; if (cnt[p].length >= 10 && p < cols - 1) trade(p); else if (p > 0 && cnt[p].length) brk(p); },
      nav: function (i, dx) { var j = i + dx; return j >= 0 && j < cols ? j : null; }
    });
    var row = S.row();
    if (o.edit !== false && addN == null && takeN == null) for (var p = cols - 1; p >= 0; p--) (function (p) { stepper(row, { label: PLACE[p][0].toUpperCase() + PLACE[p].slice(1), value: cnt[p].length, min: 0, max: 30, fmt: function () { return String(cnt[p].length); }, less: 'Take one away from the', more: 'Add one to the', change: function (v) { while (cnt[p].length < v) cnt[p].push(0); while (cnt[p].length > v) cnt[p].pop(); note = ''; changed(); } }); })(p);
    var row2 = S.row();
    if (addN != null) var bAdd = V.button(row2, 'Add ' + addN, function () { if (added) return; added = true; bAdd.disabled = true; var v = addN; for (var p = 0; p < cols; p++) { var d = p === cols - 1 ? v : v % 10; for (var i = 0; i < d; i++) cnt[p].push(1); v = M.floor(v / 10); } note = 'Now put them together. Any place with 10 or more? Trade 10 for 1 of the next place.'; changed(); }, 'pri');
    if (takeN != null) var bTake = V.button(row2, 'Take away ' + takeN, function () {
      if (taken) return; var need = [], v = takeN; for (var p = 0; p < cols; p++) { need.push(p === cols - 1 ? v : v % 10); v = M.floor(v / 10); }
      for (p = 0; p < cols; p++) if (cnt[p].length < need[p]) { note = 'You need to take away ' + plural(need[p], PLACE1[p]) + ', but there ' + (cnt[p].length === 1 ? 'is only 1' : 'are only ' + cnt[p].length) + '. Break a ' + PLACE1[p + 1] + ' into 10 ' + PLACE[p] + ' first (tap the ' + PLACE[p + 1] + ').'; say(); return; }
      for (p = 0; p < cols; p++) cnt[p].splice(cnt[p].length - need[p], need[p]); taken = true; bTake.disabled = true; note = ''; changed();
    }, 'pri');
    var tb = [];
    for (var q = 0; q < cols - 1; q++) (function (q) {
      tb.push([V.button(row2, 'Trade 10 ' + PLACE[q] + ' → 1 ' + PLACE1[q + 1], function () { trade(q); }), q, 'up']);
      tb.push([V.button(row2, 'Break 1 ' + PLACE1[q + 1] + ' → 10 ' + PLACE[q], function () { brk(q + 1); }), q, 'down']);
    })(q);
    if (addN != null || takeN != null) V.button(row2, 'Start over', function () { setN(n0); added = taken = false; note = ''; if (bAdd) bAdd.disabled = false; if (bTake) bTake.disabled = false; changed(); });
    function syncBtns() { tb.forEach(function (b) { b[0].hidden = b[2] === 'up' ? cnt[b[1]].length < 10 : !cnt[b[1] + 1].length || (o.edit !== false && addN == null && takeN == null && cnt[b[1]].length >= 10); }); }
    var tk = S.task({
      text: TT && ('Show ' + TT.target + (TT.h != null ? ' using ' + TT.h + ' hundreds' : TT.t != null ? ' using ' + TT.t + ' tens' : TT.o != null ? ' using ' + TT.o + ' ones' : '') + (TT.regroup ? ' with no more than 9 in any place' : '') + '.'),
      ok: function () { if (value() !== int(TT.target, 0)) return false; if (TT.regroup && cnt.some(function (c, p) { return p < cols - 1 && c.length > 9; })) return false; var m = { o: 0, t: 1, h: 2 }; for (var key in m) if (TT[key] != null && cnt[m[key]].length !== int(TT[key], 0)) return false; return true; },
      hint: function () { var v = value(), t = int(TT.target, 0); if (v !== t) return 'Right now the blocks show ' + v + '. ' + (v < t ? 'You need ' + (t - v) + ' more.' : 'That is ' + (v - t) + ' too many.'); return 'The value is right. Trade or break blocks to match the goal.'; }
    });
    function changed() { syncBtns(); draw(); if (tk) tk.update(); }
    syncBtns(); S.live(draw); draw();
  });

  /* ================================================================ placevalue
     A place-value chart. Each digit's value depends on its place; multiplying by 10 moves every digit one place
     left (the decimal point stays put), and dividing by 10 moves them right.
     opts:
       n: "3482"           the number (decimals welcome: "0.375", "26.4")
       hi, lo              highest and lowest place shown as powers of ten (3 = thousands, −2 = hundredths); auto from n
       edit: true          ▲ ▼ change each digit (arrow keys too)
       shift: false        "× 10" and "÷ 10" buttons that slide the digits
       expanded: "add"     the expanded form style: "add" (3,000 + 400 + 80 + 2), "mult" (3 × 1,000 + 4 × 100 …),
                           or "frac" for decimals (5 × 1/10 + 2 × 1/100)
       words: true         the number in words (three thousand four hundred eighty-two)
       task: "4,307"  or  {target: "4307"}    "Make 4,307."                                                           */
  var PVN = { 6: ['millions', 'M'], 5: ['hundred thousands', 'HTh'], 4: ['ten thousands', 'TTh'], 3: ['thousands', 'Th'], 2: ['hundreds', 'H'], 1: ['tens', 'T'], 0: ['ones', 'O'], '-1': ['tenths', 't'], '-2': ['hundredths', 'h'], '-3': ['thousandths', 'th'], '-4': ['ten-thousandths', 'tth'] };
  function commas(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  def('placevalue', function (el, o) {
    var S = shell(el, o, { name: 'placevalue', label: 'A place-value chart', touch: 'manipulation', height: 170 });
    var TT = taskOf(o), str = String(o.n != null ? o.n : '0').replace(/,/g, '').trim(), m = str.match(/^(\d*)\.?(\d*)$/) || ['', '0', ''];
    var ip = m[1].replace(/^0+(?=\d)/, '') || '0', dp = m[2] || '', tq = TT ? String(TT.target).replace(/,/g, '') : '';
    var tm = tq.match(/^(\d*)\.?(\d*)$/) || ['', '', ''];
    var hi = o.hi != null ? int(o.hi, 0, 0, 6) : clamp(M.max(ip.length - 1, (tm[1] || '').length - 1, o.shift ? ip.length : 0, 1), 0, 6);
    var lo = o.lo != null ? int(o.lo, 0, -4, 0) : clamp(-M.max(dp.length, (tm[2] || '').length, o.shift && dp.length ? dp.length + 1 : 0), -4, 0);
    var dg = {}, sel = null, slide = 0, sdir = 0, G = {}, note = '';
    for (var p = lo; p <= hi; p++) dg[p] = 0;
    ip.split('').reverse().forEach(function (c, i) { if (i <= hi) dg[i] = +c; }); dp.split('').forEach(function (c, i) { if (-(i + 1) >= lo) dg[-(i + 1)] = +c; });
    function places() { var a = []; for (var p = hi; p >= lo; p--) a.push(p); return a; }
    function valStr() { var s = '', p; for (p = hi; p >= 0; p--) s += dg[p]; s = s.replace(/^0+(?=\d)/, ''); var d = ''; for (p = -1; p >= lo; p--) d += dg[p]; d = d.replace(/0+$/, ''); return commas(s) + (d ? '.' + d : ''); }
    function valQ() { return parseQ(valStr().replace(/,/g, '')); }
    function geo() { var w = S.c.w, n = hi - lo + 1, dot = lo < 0 ? 14 : 0, cw = M.min(86, (w - 8 - dot) / n); G = { cw: cw, dot: dot, x0: (w - cw * n - dot) / 2, edit: o.edit !== false }; S.height(cw < 60 ? 186 : 176); }
    function colX(p) { return G.x0 + (hi - p) * G.cw + (p < 0 ? G.dot : 0); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), cw = G.cw, ps = places(), lead = true, topY = 8, hH = cw < 60 ? 40 : 30, dY = topY + hH + (G.edit ? 30 : 8), dH = 58;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      var lastNZ = lo; for (var q = lo; q < 0; q++) if (dg[q]) { lastNZ = q; break; } if (!ps.some(function (p) { return p < 0 && dg[p]; })) lastNZ = 0;
      ps.forEach(function (p, i) {
        var x = colX(p), nm = PVN[p], isSel = sel === p, grp = p >= 0 ? M.floor(p / 3) % 2 : 2;
        fillRR(ctx, x + 2, topY, cw - 4, hH, 7, grp === 1 ? soft(k.blue, 0.14) : grp === 2 ? soft(k.purple, 0.12) : soft(k.green, 0.13));
        var full = nm[0], fs = tw(ctx, nm[0], font(12, 600)) <= cw - 8 ? 12 : 10.5; if (tw(ctx, full, font(fs, 600)) > cw - 6) { var parts = full.split(/[ -]/); if (parts.length > 1 && M.max.apply(null, parts.map(function (s) { return tw(ctx, s, font(11, 600)); })) <= cw - 6) { tx(ctx, parts[0], x + cw / 2, topY + hH / 2 - 7, { size: 11, wt: 600, col: k.muted }); tx(ctx, parts.slice(1).join(' '), x + cw / 2, topY + hH / 2 + 7, { size: 11, wt: 600, col: k.muted }); full = null; } else full = nm[1]; }
        if (full) tx(ctx, full, x + cw / 2, topY + hH / 2, { size: full.length < 4 ? 14 : fs, wt: 600, col: k.muted });
        fillRR(ctx, x + 2, dY, cw - 4, dH, 9, isSel ? soft(k.gold, 0.22) : k.bg, isSel ? k.gold : k.line, isSel ? 2.5 : 1);
        var hz = p > 0; for (var r = p; r <= hi && hz; r++) if (dg[r]) hz = false;
        var faded = hz || (p < 0 && p < lastNZ);
        var off = sdir ? sdir * slide * cw : 0;
        ctx.save(); ctx.beginPath(); ctx.rect(G.x0 - 2, dY, S.c.w - 2 * G.x0 + 4, dH); ctx.clip();
        tx(ctx, String(dg[p]), x + cw / 2 - off, dY + dH / 2 + 2, { font: '700 ' + M.min(40, cw * 0.62) + 'px ui-monospace,Menlo,Consolas,monospace', col: faded ? k.grid : k.ink });
        ctx.restore();
        if (G.edit) { tri(ctx, x + cw / 2, dY - 15, 1, k); tri(ctx, x + cw / 2, dY + dH + 15, -1, k); }
      });
      if (lo < 0) { var dx = G.x0 + (hi + 1) * cw + G.dot / 2; disc(ctx, dx, dY + dH - 12, 5, k.red); }
      P.sync(); say();
    }
    function tri(ctx, x, y, up, k) { poly(ctx, [[x - 9, y + 5 * up], [x + 9, y + 5 * up], [x, y - 6 * up]], soft(k.green, 0.6)); }
    function placeVal(p) { return p >= 0 ? commas(String(M.pow(10, p))) : '1/' + commas(String(M.pow(10, -p))); }
    function say() {
      var v = valStr(), terms = [], st = o.expanded || 'add';
      places().forEach(function (p) {
        if (!dg[p]) return;
        if (st === 'mult') terms.push(dg[p] + ' × ' + (p >= 0 ? commas(String(M.pow(10, p))) : f(M.pow(10, p), 6)));
        else if (st === 'frac' && p < 0) terms.push(dg[p] + ' × ' + fr(1, commas(String(M.pow(10, -p)))));
        else terms.push(p >= 0 ? commas(String(dg[p] * M.pow(10, p))) : f(dg[p] * M.pow(10, p), 6));
      });
      var s = '<b>' + v + '</b> = ' + (terms.join(' + ') || '0');
      if (o.words !== false) { var q = valQ(), whole = M.floor(q.v), dec = v.split('.')[1]; s += '<br>' + words(whole) + (dec ? ' and ' + words(+dec) + ' ' + PVN[-dec.length][0].replace(/s$/, +dec === 1 ? '' : 's') : ''); if (!whole && dec) s = s.replace('<br>zero and ', '<br>'); }
      if (sel !== null) s += '<br>The ' + dg[sel] + ' is in the <b>' + PVN[sel][0] + '</b> place. It is worth ' + dg[sel] + ' × ' + placeVal(sel) + ' = ' + (sel >= 0 ? commas(String(dg[sel] * M.pow(10, sel))) : f(dg[sel] * M.pow(10, sel), 6)) + '.';
      if (note) s += '<br>' + note;
      S.say(s);
    }
    function bump(p, d) { dg[p] = (dg[p] + d + 10) % 10; sel = p; note = ''; draw(); if (tk) tk.update(); }
    ptr(S.c.cv, {
      tap: function (x, y) { var ps = places(); for (var i = 0; i < ps.length; i++) { var p = ps[i], cx = colX(p); if (x >= cx && x <= cx + G.cw) { var hH = G.cw < 60 ? 40 : 30, dY = 8 + hH + (G.edit ? 30 : 8); if (G.edit && y < dY) bump(p, 1); else if (G.edit && y > dY + 58) bump(p, -1); else { sel = p; draw(); } return; } } },
      over: function () { return 'pointer'; }
    });
    var P = pads(S.stage, {
      roving: true,
      list: function () { var hH = G.cw < 60 ? 40 : 30, dY = 8 + hH + (G.edit ? 30 : 8); return places().map(function (p) { return { x: colX(p) + 2, y: dY, w: G.cw - 4, h: 58, label: PVN[p][0] + ' place: ' + dg[p] + (G.edit ? '. Up and down arrows change it.' : '') }; }); },
      nav: function (i, dx, dy) { var p = hi - i; if (dy && G.edit) { bump(p, dy); return i; } var j = i + dx; return j >= 0 && j <= hi - lo ? j : null; },
      focus: function (i) { if (i >= 0) { sel = hi - i; draw(); } }
    });
    var row = S.row();
    function shift(dir) { // dir 1: × 10 (digits move left), −1: ÷ 10
      if (slide) return; var top = dir > 0 ? hi : lo;
      if (dg[top]) { note = 'There is no room on the chart for that: the ' + PVN[top][0] + ' digit would fall off.'; say(); return; }
      note = dir > 0 ? 'Times 10: every digit moves one place to the left, so each is worth 10 times as much. The decimal point stays still.' : 'Divided by 10: every digit moves one place to the right, so each is worth a tenth as much.';
      sdir = dir; tween(650, function (t) { slide = t; draw(); }, function () {
        var nd = {}; for (var p = lo; p <= hi; p++) nd[p] = 0; for (p = lo; p <= hi; p++) { var q = p + dir; if (q >= lo && q <= hi) nd[q] = dg[p]; } dg = nd; slide = 0; sdir = 0; if (sel !== null) sel = clamp(sel + dir, lo, hi); draw(); if (tk) tk.update();
      });
    }
    if (o.shift) { V.button(row, '× 10', function () { shift(1); }, 'pri'); V.button(row, '÷ 10', function () { shift(-1); }, 'pri'); }
    var tk = S.task({
      text: 'Make ' + commas(tq.split('.')[0] || '0') + (tq.split('.')[1] ? '.' + tq.split('.')[1] : '') + '.',
      ok: function () { var a = valQ(), b = parseQ(tq); return a && b && a.n === b.n && a.d === b.d; },
      hint: function () { var t = {}, mm = tq.match(/^(\d*)\.?(\d*)$/) || ['', '', '']; (mm[1] || '').split('').reverse().forEach(function (c, i) { t[i] = +c; }); (mm[2] || '').split('').forEach(function (c, i) { t[-(i + 1)] = +c; }); for (var p = hi; p >= lo; p--) if ((t[p] || 0) !== dg[p]) return 'Check the ' + PVN[p][0] + ' place.'; return ''; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ arraygrid
     An array: rows and columns of dots or squares. Multiplication as equal rows, turning it to see 3 × 4 = 4 × 3,
     splitting it to see the distributive property, and factor pairs as all the rectangles for one number.
     opts:
       rows: 3, cols: 4     the array
       max: 10              the biggest number of rows or columns you can drag to (up to 12)
       style: "dots"        "dots" or "squares" (squares = area in square units)
       resize: true         drag the corner (or use arrow keys) to change rows and columns
       split: false         "cols" or "rows": a line you drag to split the array in two: 3 × 7 = 3 × 5 + 3 × 2
       at: 0                where the split starts (columns or rows before the line)
       groups: false        draw a loop around each row: "3 equal groups of 4"
       rotate: true         a "Turn it" button (3 rows of 4 becomes 4 rows of 3; the total stays the same)
       task: 12  or  {target: 12, all: true}   "Make an array with 12." all: find every rectangle (factor pairs).   */
  def('arraygrid', function (el, o) {
    var S = shell(el, o, { name: 'arraygrid', kid: true, label: 'An array of rows and columns', touch: 'none', height: 300 });
    var TT0 = taskOf(o), mx = int(o.max, TT0 && TT0.all ? clamp(int(TT0.target, 10), 6, 12) : clamp(M.max(int(o.rows, 3), int(o.cols, 4)) + 3, 6, 10), 2, 12), R = int(o.rows, 3, 1, mx), Cn = int(o.cols, 4, 1, mx), sq_ = o.style === 'squares', split = o.split === 'rows' || o.split === 'cols' ? o.split : null;
    var at = int(o.at, 0, 0, mx), rot = 0, TT = taskOf(o), found = {}, G = {};
    if (split && !at) at = M.max(1, M.floor((split === 'cols' ? Cn : R) / 2));
    function geo() { var w = S.c.w, u = M.min(46, (w - 64) / mx); G = { u: u, x0: 44, y0: 40 }; S.height(40 + u * mx + 22); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), u = G.u, x0 = G.x0, y0 = G.y0, i, j;
      ctx.clearRect(0, 0, S.c.w, S.c.h);
      if (o.resize !== false) for (i = 0; i < mx; i++) for (j = 0; j < mx; j++) disc(ctx, x0 + j * u + u / 2, y0 + i * u + u / 2, 2, k.grid);
      ctx.save();
      if (rot) { var cx = x0 + Cn * u / 2, cy = y0 + R * u / 2; ctx.translate(cx, cy); ctx.rotate(rot * PI / 2); ctx.translate(-cx, -cy); }
      var ca = [k.redC, k.redEdge], cb = [k.blueC, k.blueEdge];
      function part(i, j) { if (!split) return ca; return (split === 'cols' ? j < at : i < at) ? ca : cb; }
      if (o.groups) for (i = 0; i < R; i++) fillRR(ctx, x0 + 2, y0 + i * u + 3, Cn * u - 4, u - 6, (u - 6) / 2, null, k.gold, 2);
      for (i = 0; i < R; i++) for (j = 0; j < Cn; j++) {
        var c = part(i, j);
        if (sq_) fillRR(ctx, x0 + j * u + 1, y0 + i * u + 1, u - 2, u - 2, M.min(5, u / 6), soft(c[0], 0.75), c[1], 1.2);
        else counter(ctx, x0 + j * u + u / 2, y0 + i * u + u / 2, u * 0.34, c[0], c[1]);
      }
      if (split) { var sx = split === 'cols' ? x0 + at * u : x0 - 6, sy = split === 'cols' ? y0 - 6 : y0 + at * u; if (split === 'cols') { ln(ctx, sx, y0 - 8, sx, y0 + R * u + 8, k.ink, 3); disc(ctx, sx, y0 - 12, 8, k.gold, k.ink, 2); } else { ln(ctx, x0 - 8, sy, x0 + Cn * u + 8, sy, k.ink, 3); disc(ctx, x0 - 12, sy, 8, k.gold, k.ink, 2); } }
      ctx.restore();
      if (!rot) {
        tx(ctx, String(Cn), x0 + Cn * u / 2, 16, { size: 16, wt: 800, kid: true, col: k.blueEdge }); ln(ctx, x0 + 2, 28, x0 + Cn * u - 2, 28, k.blueEdge, 2);
        tx(ctx, String(R), 16, y0 + R * u / 2, { size: 16, wt: 800, kid: true, col: k.redEdge }); ln(ctx, 28, y0 + 2, 28, y0 + R * u - 2, k.redEdge, 2);
        if (o.resize !== false) { var hx = x0 + Cn * u, hy = y0 + R * u; disc(ctx, hx, hy, 11, k.gold, k.ink, 2); arw(ctx, hx + 4, hy + 4, hx + 9, hy + 9, k.ink, 2, 6); }
      }
      P.sync(); say();
    }
    function say() {
      var t = R * Cn, s = R + (R === 1 ? ' row' : ' rows') + ' of ' + Cn + ' = <b>' + t + '</b>. &nbsp;' + R + ' × ' + Cn + ' = ' + t;
      if (o.groups) s = R + ' equal groups of ' + Cn + ' = <b>' + t + '</b>. &nbsp;' + R + ' × ' + Cn + ' = ' + t;
      if (split === 'cols' && at > 0 && at < Cn) s += '<br>' + R + ' × ' + Cn + ' = ' + R + ' × ' + at + ' + ' + R + ' × ' + (Cn - at) + ' = ' + R * at + ' + ' + R * (Cn - at) + ' = ' + t;
      if (split === 'rows' && at > 0 && at < R) s += '<br>' + R + ' × ' + Cn + ' = ' + at + ' × ' + Cn + ' + ' + (R - at) + ' × ' + Cn + ' = ' + at * Cn + ' + ' + (R - at) * Cn + ' = ' + t;
      if (sq_) s += ' square units';
      S.say(s);
    }
    function setRC(r, c) { r = clamp(r, 1, mx); c = clamp(c, 1, mx); if (r === R && c === Cn) return false; R = r; Cn = c; if (split) at = clamp(at, 1, M.max(1, (split === 'cols' ? Cn : R) - 1)); if (TT) found[M.min(R, Cn) + 'x' + M.max(R, Cn)] = R * Cn === int(TT.target, 0); draw(); return true; }
    ptr(S.c.cv, {
      hit: function (x, y) {
        if (rot) return null; var u = G.u;
        if (o.resize !== false && M.hypot(x - (G.x0 + Cn * u), y - (G.y0 + R * u)) < 24) return 'c';
        if (split === 'cols' && M.abs(x - (G.x0 + at * u)) < 14 && y > G.y0 - 24 && y < G.y0 + R * u + 10) return 's';
        if (split === 'rows' && M.abs(y - (G.y0 + at * u)) < 14 && x > G.x0 - 24 && x < G.x0 + Cn * u + 10) return 's';
        return null;
      },
      move: function (h, x, y) { var u = G.u; if (h === 'c') setRC(M.round((y - G.y0) / u), M.round((x - G.x0) / u)); else { var v = split === 'cols' ? M.round((x - G.x0) / u) : M.round((y - G.y0) / u), mxs = (split === 'cols' ? Cn : R) - 1; v = clamp(v, 1, M.max(1, mxs)); if (v !== at) { at = v; draw(); } } },
      end: function () { if (tk) tk.update(); }
    });
    var P = pads(S.stage, {
      list: function () { var u = G.u, out = []; if (o.resize !== false) out.push({ x: G.x0 + Cn * u, y: G.y0 + R * u, size: 34, hide: !!rot, label: R + ' rows, ' + Cn + ' columns. Arrow keys add or take away rows and columns.' }); if (split) out.push({ x: split === 'cols' ? G.x0 + at * u : G.x0 - 12, y: split === 'cols' ? G.y0 - 12 : G.y0 + at * u, size: 30, label: 'Split line after ' + at + (split === 'cols' ? ' columns' : ' rows') + '. Arrow keys move it.' }); return out; },
      key: function (i, dx, dy) { if (o.resize !== false && i === 0) { setRC(R - dy, Cn + dx); } else { var mxs = (split === 'cols' ? Cn : R) - 1; at = clamp(at + (split === 'cols' ? dx : -dy), 1, M.max(1, mxs)); draw(); } if (tk) tk.update(); }
    });
    var row = S.row();
    if (o.rotate !== false) V.button(row, 'Turn it', function () {
      tween(800, function (p) { rot = p; draw(); }, function () { rot = 0; var t = R; R = Cn; Cn = t; if (split) { split = split === 'cols' ? 'rows' : 'cols'; } draw(); if (tk) tk.update(); });
    });
    if (o.resize !== false) { V.button(row, 'Add a row', function () { setRC(R + 1, Cn); if (tk) tk.update(); }); V.button(row, 'Add a column', function () { setRC(R, Cn + 1); if (tk) tk.update(); }); }
    function pairs(t) { var out = []; for (var a = 1; a * a <= t; a++) if (t % a === 0 && t / a <= mx && a <= mx) out.push(a + 'x' + t / a); return out; }
    var tk = S.task({
      text: TT && (TT.all ? 'Find every rectangle you can make with ' + TT.target + (sq_ ? ' squares.' : ' dots.') : 'Make an array with ' + TT.target + (sq_ ? ' squares.' : ' dots.')),
      ok: function () { var t = int(TT.target, 0); if (!TT.all) return R * Cn === t; return pairs(t).every(function (p) { return found[p]; }); },
      hint: function () { var t = int(TT.target, 0), all = pairs(t), got = all.filter(function (p) { return found[p]; }); if (TT.all) return 'You have found ' + got.length + ' of ' + all.length + ': ' + (got.map(function (p) { return p.replace('x', ' × '); }).join(', ') || 'none yet') + '. Which other number of rows divides ' + t + ' evenly?'; return R * Cn < t ? 'This array has ' + R * Cn + '. You need ' + (t - R * Cn) + ' more.' : 'This array has ' + R * Cn + '. That is ' + (R * Cn - t) + ' too many.'; },
      yes: function () { var t = int(TT.target, 0); return TT.all ? 'You found them all: ' + pairs(t).map(function (p) { return p.replace('x', ' × '); }).join(', ') + '. These are the factor pairs of ' + t + '.' : R + ' × ' + Cn + ' = ' + t + '. Is there another way?'; }
    });
    if (TT) found[M.min(R, Cn) + 'x' + M.max(R, Cn)] = R * Cn === int(TT.target, 0);
    S.live(draw); draw();
  });

  /* ================================================================ areamodel
     An area model: a rectangle cut into parts. 23 × 14 = (20 + 3)(10 + 4) as four rectangles, and
     (x + 3)(x + 2) the same way. Sizes are to scale, so you can see which parts are big.
     opts:
       a: 23, b: 14        the two factors. Numbers split by place value (decimals too: 2.5 → 2 + 0.5).
                           Write algebra as a string: "x+3", "2x-1", "x^2+2x+1". Or give the parts: [20, 3] or ["x", "3"].
       split: true         false keeps numbers whole (one rectangle, or use arrays to split your own way: [10, 10, 3])
       x: 4                for algebra, the value of x used to draw lengths; a slider lets learners change it
       hide: false         true shows "?" in each part until it is tapped (find each partial product first)
       grid: false         draw unit squares (for small whole numbers)
       task: {reveal: true}   with hide: "Find the area of each part."                                            */
  function monoParse(s) {
    s = String(s).replace(/\s+/g, '').replace(/[−–]/g, '-'); var m = s.match(/^([+-]?)(\d+(?:\.\d+)?(?:\/\d+)?)?\*?([a-z])?(?:\^(\d+))?$/i); if (!m) return null;
    var c = m[2] ? parseQ(m[2]) : rat(1); if (m[1] === '-') c = rat(-c.n, c.d); return { c: c, v: m[3] || '', p: m[3] ? int(m[4], 1) : 0 };
  }
  function monoText(t, vr) { var c = t.c, cs = c.d === 1 ? String(M.abs(c.n)) : !t.p && !vr ? f(M.abs(c.v), 6) : qText(rat(M.abs(c.n), c.d)), sign = c.n < 0 ? '−' : ''; if (!t.p) return sign + cs; var vv = vr + (t.p === 2 ? '²' : t.p === 3 ? '³' : t.p > 1 ? '^' + t.p : ''); return sign + (cs === '1' ? '' : cs) + vv; }
  function factorParts(x, split) {
    if (Array.isArray(x)) return x.map(function (s) { return monoParse(s) || { c: rat(0), v: '', p: 0 }; });
    var s = String(x).trim();
    if (/[a-z]/i.test(s)) return s.replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/(.)-/g, '$1+-').split('+').filter(Boolean).map(monoParse).filter(Boolean);
    var q = parseQ(s); if (!q) return [{ c: rat(0), v: '', p: 0 }];
    if (split === false) return [{ c: q, v: '', p: 0 }];
    var str = s.replace(/^[+-]/, ''), neg = s[0] === '-', mm = str.match(/^(\d*)\.?(\d*)$/); if (!mm) return [{ c: q, v: '', p: 0 }];
    var out = [], ip2 = mm[1] || '', dp2 = mm[2] || '';
    ip2.split('').forEach(function (d, i) { if (+d) out.push({ c: rat((neg ? -1 : 1) * +d * M.pow(10, ip2.length - 1 - i)), v: '', p: 0 }); });
    dp2.split('').forEach(function (d, i) { if (+d) out.push({ c: rat((neg ? -1 : 1) * +d, M.pow(10, i + 1)), v: '', p: 0 }); });
    return out.length ? out : [{ c: rat(0), v: '', p: 0 }];
  }
  def('areamodel', function (el, o) {
    var S = shell(el, o, { name: 'areamodel', label: 'An area model for multiplication', touch: 'manipulation', height: 300 });
    var A = factorParts(o.a != null ? o.a : 23, o.split), B = factorParts(o.b != null ? o.b : 14, o.split), TT = taskOf(o);
    var alg = A.concat(B).some(function (t) { return t.p > 0; }), vr = (A.concat(B).filter(function (t) { return t.v; })[0] || { v: 'x' }).v;
    var xv = num(o.x, 4), shown = {}, G = {};
    var hideOn = !!(o.hide || (S.quiet && o.hide !== false)); // quiet: the products stay hidden until pressed
    if (!hideOn) A.forEach(function (a, i) { B.forEach(function (b, j) { shown[i + ',' + j] = 1; }); });
    function len(t) { return M.abs(t.c.v) * M.pow(xv, t.p); }
    function alloc(ts, avail) { var tot = ts.reduce(function (s, t) { return s + len(t); }, 0) || 1, mn = 30, px = ts.map(function (t) { return M.max(mn, len(t) / tot * avail); }); for (var it = 0; it < 6; it++) { var s = px.reduce(function (a, b) { return a + b; }, 0); if (s <= avail + 0.5) break; var ex = s - avail, big = px.filter(function (v) { return v > mn + 0.5; }).reduce(function (a, b) { return a + b - mn; }, 0) || 1; px = px.map(function (v) { return v > mn + 0.5 ? v - ex * (v - mn) / big : v; }); } return px; }
    function prod(a, b) { return { c: qmul(a.c, b.c), v: a.v || b.v, p: a.p + b.p }; }
    function geo() {
      var w = S.c.w, left = 54, top = 34, totA = A.reduce(function (s, t) { return s + len(t); }, 0) || 1, totB = B.reduce(function (s, t) { return s + len(t); }, 0) || 1, maxH = 340;
      var W2 = M.min(w - left - 16, 520, maxH * totB / totA), H = M.max(W2 * totA / totB, 30 * A.length + 10);
      G = { left: left + M.max(0, (w - left - 16 - W2) / 2), top: top, W: W2, H: H, wx: alloc(B, W2), hy: alloc(A, H) }; S.height(top + H + 14);
    }
    function kindCol(t, k) { if (t.c.n < 0) return [soft(k.red, 0.22), k.red]; if (alg) return t.p >= 2 ? [soft(k.blue, 0.3), k.blue] : t.p === 1 ? [soft(k.green, 0.3), k.green] : [soft(k.gold, 0.35), k.gold]; var v = M.abs(t.c.v); return v >= 100 ? [soft(k.blue, 0.28), k.blue] : v >= 10 ? [soft(k.green, 0.28), k.green] : v >= 1 ? [soft(k.gold, 0.32), k.gold] : [soft(k.purple, 0.25), k.purple]; }
    function cellRect(i, j) { var x = G.left, y = G.top, a; for (a = 0; a < j; a++) x += G.wx[a]; for (a = 0; a < i; a++) y += G.hy[a]; return [x, y, G.wx[j], G.hy[i]]; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      A.forEach(function (a, i) {
        B.forEach(function (b, j) {
          var r = cellRect(i, j), p = prod(a, b), c = kindCol(p, k);
          fillRR(ctx, r[0] + 1, r[1] + 1, r[2] - 2, r[3] - 2, 4, c[0], c[1], 1.5);
          if (o.grid && !alg && Number.isInteger(a.c.v) && Number.isInteger(b.c.v) && M.abs(a.c.v * b.c.v) <= 400) { ctx.save(); ctx.strokeStyle = c[1]; ctx.globalAlpha = 0.25; ctx.beginPath(); var ux = r[2] / M.abs(b.c.v), uy = r[3] / M.abs(a.c.v); for (var q = 1; q < M.abs(b.c.v); q++) { ctx.moveTo(r[0] + q * ux, r[1]); ctx.lineTo(r[0] + q * ux, r[1] + r[3]); } for (q = 1; q < M.abs(a.c.v); q++) { ctx.moveTo(r[0], r[1] + q * uy); ctx.lineTo(r[0] + r[2], r[1] + q * uy); } ctx.stroke(); ctx.restore(); }
          var lbl = shown[i + ',' + j] ? monoText(p, alg ? vr : '') : '?', fs = clamp(M.min(r[2] / (lbl.length * 0.62 + 0.6), r[3] * 0.45), 10, 22);
          tx(ctx, lbl, r[0] + r[2] / 2, r[1] + r[3] / 2 + 1, { size: fs, wt: 700, col: shown[i + ',' + j] ? k.ink : k.muted, halo: soft(k.bg, 0.6) });
        });
      });
      var x = G.left; B.forEach(function (b, j) { tx(ctx, monoText(b, alg ? vr : ''), x + G.wx[j] / 2, G.top - 15, { size: 15, wt: 700, col: k.ink }); ln(ctx, x + 3, G.top - 5, x + G.wx[j] - 3, G.top - 5, k.muted, 1.5); x += G.wx[j]; });
      var y = G.top; A.forEach(function (a, i) { tx(ctx, monoText(a, alg ? vr : ''), G.left - 10, y + G.hy[i] / 2, { size: 15, wt: 700, al: 'right', col: k.ink }); ln(ctx, G.left - 5, y + 3, G.left - 5, y + G.hy[i] - 3, k.muted, 1.5); y += G.hy[i]; });
      P.sync(); say();
    }
    function polyText(ts) { var s = ''; ts.forEach(function (t, i) { var m = monoText(t, alg ? vr : ''); s += i ? (t.c.n < 0 ? ' − ' + m.slice(1) : ' + ' + m) : m; }); return s; }
    function combine(ts) { var by = {}; ts.forEach(function (t) { var key = t.p; by[key] = by[key] ? { c: qadd(by[key].c, t.c), v: t.v || by[key].v, p: t.p } : { c: t.c, v: t.v, p: t.p }; }); return Object.keys(by).map(Number).sort(function (a, b) { return b - a; }).map(function (p) { return by[p]; }).filter(function (t) { return t.c.n !== 0; }); }
    function say() {
      var ps = [], all = true; A.forEach(function (a, i) { B.forEach(function (b, j) { ps.push(prod(a, b)); if (!shown[i + ',' + j]) all = false; }); });
      var fa = polyText(A), fb = polyText(B), s;
      var tot = combine(ps), lhs = (A.length > 1 ? '(' + fa + ')' : fa) + (alg ? '' : ' × ') + (B.length > 1 ? '(' + fb + ')' : fb);
      if (!alg) { var va = A.reduce(function (q, t) { return qadd(q, t.c); }, rat(0)), vb = B.reduce(function (q, t) { return qadd(q, t.c); }, rat(0)); lhs = qText(va, 'dec') + ' × ' + qText(vb, 'dec') + (A.length > 1 || B.length > 1 ? ' = ' + lhs : ''); }
      if (!all) s = lhs + ' = ' + ps.map(function (p, i) { var ii = M.floor(i / B.length), jj = i % B.length; return shown[ii + ',' + jj] ? monoText(p, vr) : '?'; }).join(' + ') + '. Tap each ? to find that part.';
      else s = lhs + ' = ' + polyText(ps) + ' = <b>' + (alg ? polyText(tot) : tot.length ? qText(tot[0].c, 'dec') : '0') + '</b>';
      if (alg && all) { var ev = function (ts) { return ts.reduce(function (q, t) { return q + t.c.v * M.pow(xv, t.p); }, 0); }; s += '<br>Check with ' + vr + ' = ' + f(xv) + ': ' + f(ev(A)) + ' × ' + f(ev(B)) + ' = ' + f(ev(A) * ev(B)) + ', and ' + polyText(tot) + ' = ' + f(ev(tot)) + '.'; }
      S.say(s);
    }
    function reveal(i, j) { shown[i + ',' + j] = 1; draw(); if (tk) tk.update(); }
    ptr(S.c.cv, { tap: function (x, y) { A.forEach(function (a, i) { B.forEach(function (b, j) { var r = cellRect(i, j); if (x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3]) reveal(i, j); }); }); }, over: function () { return hideOn ? 'pointer' : ''; } });
    var P = pads(S.stage, {
      click: true, roving: true,
      list: function () { var out = []; if (!hideOn) return out; A.forEach(function (a, i) { B.forEach(function (b, j) { var r = cellRect(i, j); out.push({ x: r[0], y: r[1], w: r[2], h: r[3], label: monoText(a, vr) + ' times ' + monoText(b, vr) + (shown[i + ',' + j] ? ' = ' + monoText(prod(a, b), vr) : ': press to show') }); }); }); return out; },
      act: function (n) { reveal(M.floor(n / B.length), n % B.length); },
      nav: function (n, dx, dy) { var j = n + dx - dy * B.length; return j >= 0 && j < A.length * B.length ? j : null; }
    });
    var row = S.row();
    if (alg) V.slider(row, { label: vr + ' =', min: 1, max: 10, step: 0.5, value: xv, input: function (v) { xv = v; draw(); } });
    if (hideOn) V.button(row, 'Hide them again', function () { shown = {}; draw(); });
    var tk = S.task({ text: 'Find the area of each part, then add them.', ok: function () { var all = true; A.forEach(function (a, i) { B.forEach(function (b, j) { if (!shown[i + ',' + j]) all = false; }); }); return all; }, hint: function () { return 'Tap each part with a ?.'; }, yes: function () { return 'The parts add up to the whole rectangle.'; } });
    S.live(draw); draw();
  });

  /* ================================================================ fractionbar
     Fraction bars (strips). Split a bar into equal parts and shade some. Stack bars to compare 2/3 with 3/4, cut parts
     into smaller pieces to see 2/3 = 4/6, or walk through why 1/3 + 1/4 is not 2/7.
     opts:
       bars: ["2/3", "3/4"]     the bars (default one bar, 1/2). Each may also be {n: 2, d: 3, len: 1, label: "Ann", lock: true}
                                len: how many wholes the bar shows (for fractions bigger than 1: 5/4 needs len 2)
       maxd: 12                 most parts a bar can be split into
       equiv: false             a "Cut each part into" stepper: 2/3 → 4/6 → 6/9 (same amount, more pieces)
       guide: false             a vertical line you drag to line up the ends of the shading
       add: ["1/3", "1/4"]      the addition story in four steps: two pieces, put them together, "is it 2/7?", same-size parts
       task: "3/4"  or  {target: "3/4", bar: 0}   "Shade 3/4 of the bar." (6/8 also counts, with a note)
     Tap a part to shade it or clear it. On a bar's keyboard handle: ←/→ shade fewer or more parts, ↑/↓ more or fewer parts. */
  var BARC = ['green', 'blue', 'purple', 'orange', 'teal', 'pink'];
  def('fractionbar', function (el, o) {
    var S = shell(el, o, { name: 'fractionbar', kid: true, label: 'Fraction bars', touch: 'manipulation', height: 200 });
    var maxd = int(o.maxd, 12, 2, 24), TT = taskOf(o), addQ = o.add ? o.add.map(parseQ) : null, stepI = 0, sel = 0, guideX = null, G = {};
    function mk(spec, i) {
      var q = typeof spec === 'object' && spec !== null && spec.d ? { n: int(spec.n, 0, 0), d: int(spec.d, 1, 1, maxd) } : (rawQ(spec) || rat(1, 2));
      var d = clamp(q.d, 1, maxd), n = M.max(0, q.n), len = int(spec && spec.len, M.max(1, M.ceil(n / d)), 1, 4), sh = {};
      for (var j = 0; j < M.min(n, d * len); j++) sh[j] = 1;
      return { d: d, sh: sh, len: len, label: spec && spec.label, lock: !!(spec && spec.lock) || !!addQ, col: (spec && spec.color) || BARC[i % BARC.length], base: null };
    }
    var bars = (o.bars || ['1/2']).map(mk);
    function cnt(b) { return Object.keys(b.sh).length; }
    function bq(b) { return rat(cnt(b), b.d); }
    function addBars() {
      var a = addQ[0], b = addQ[1], s = qadd(a, b), L = lcm(a.d, b.d), wrong = rat(a.n + b.n, a.d + b.d), len = M.max(1, M.ceil(s.v - 1e-9));
      var out = [];
      function bar(n, d, label, col, ln) { var x = { d: d, sh: {}, len: ln || len, label: label, lock: true, col: col }; for (var j = 0; j < n; j++) x.sh[j] = 1; return x; }
      var fine = stepI >= 3;
      out.push(bar(fine ? a.n * L / a.d : a.n, fine ? L : a.d, null, 'green'));
      out.push(bar(fine ? b.n * L / b.d : b.n, fine ? L : b.d, null, 'blue'));
      if (stepI >= 1) { var j = { d: fine ? L : 1, sh: {}, len: len, lock: true, col: 'gold', join: !fine, label: 'sum' }; if (fine) for (var k = 0; k < a.n * L / a.d + b.n * L / b.d; k++) j.sh[k] = 1; out.push(j); }
      if (stepI === 2) out.push(bar(a.n + b.n, a.d + b.d, null, 'red'));
      return out;
    }
    function list() { return addQ ? addBars() : bars; }
    function hasLabels() { return list().some(function (b) { return b.label && b.label !== 'sum'; }); }
    function geo() {
      // a bar's name goes in the space above the bar (not in the narrow column with its fraction), so they never overlap
      var w = S.c.w, B = list(), maxLen = B.reduce(function (m, b) { return M.max(m, b.len); }, 1), rowH = S.kid ? 48 : 42, hl = hasLabels();
      G = { lab: 64, x0: 72, x1: w - 12, rowH: rowH, gap: hl ? 28 : 14, top: hl ? 26 : 12, maxLen: maxLen }; G.U = (G.x1 - G.x0) / maxLen;
      S.height(G.top + B.length * (rowH + G.gap) + 4 - (hl ? 14 : 0));
    }
    function rowY(i) { return G.top + i * (G.rowH + G.gap); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), B = list(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      B.forEach(function (b, i) {
        var y = rowY(i), h = G.rowH, col = k[b.col] || b.col, pw = G.U / b.d;
        if (b.join) { // the two pieces end to end on one whole
          var a = addQ[0], c = addQ[1];
          for (var w2 = 0; w2 < b.len; w2++) fillRR(ctx, G.x0 + w2 * G.U, y, G.U, h, 8, k.bg, k.line, 1.5);
          fillRR(ctx, G.x0 + 1, y + 1, a.v * G.U - 2, h - 2, 7, soft(k.green, 0.55), k.green, 2);
          fillRR(ctx, G.x0 + a.v * G.U + 1, y + 1, c.v * G.U - 2, h - 2, 7, soft(k.blue, 0.55), k.blue, 2);
          tx(ctx, '?', G.lab / 2 + 2, y + h / 2, { size: 22, wt: 800, kid: true, col: k.gold });
          return;
        }
        for (var j = 0; j < b.d * b.len; j++) {
          var x = G.x0 + M.floor(j / b.d) * G.U + (j % b.d) * pw, on = !!b.sh[j];
          fillRR(ctx, x + 1, y + 1, pw - 2, h - 2, M.min(7, pw / 3), on ? soft(col, k.dark ? 0.7 : 0.6) : k.empty, on ? col : k.line, on ? 2 : 1.2);
        }
        for (w2 = 0; w2 < b.len; w2++) { ctx.save(); ctx.strokeStyle = k.frame; ctx.lineWidth = 2.5; rr(ctx, G.x0 + w2 * G.U, y, G.U, h, 8); ctx.stroke(); ctx.restore(); }
        if (!addQ && bars.length > 1 && i === sel) { ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); rr(ctx, G.x0 - 5, y - 5, b.len * G.U + 10, h + 10, 11); ctx.stroke(); ctx.restore(); }
        var q = { n: cnt(b), d: b.d, v: cnt(b) / b.d };
        if (b.label && b.label !== 'sum') tx(ctx, String(b.label), G.x0 + 2, y - 11, { size: 13, wt: 700, col: k.muted, al: 'left' });
        qDraw(ctx, q, G.lab / 2 + 2, y + h / 2, { size: 16, kid: true, wt: 800, col: b.col === 'red' ? k.red : k.ink, form: 'frac' });
      });
      if (guideX !== null) { var gx = G.x0 + guideX * G.U; ln(ctx, gx, 4, gx, S.c.h - 4, k.red, 2, [6, 4]); disc(ctx, gx, 6, 6, k.red); }
      P.sync(); say();
    }
    function say() {
      var B = list(), s;
      if (addQ) {
        var a = addQ[0], b = addQ[1], sum = qadd(a, b), L = lcm(a.d, b.d), wr = rat(a.n + b.n, a.d + b.d);
        var same = a.d === b.d, unit = same ? qH(rat(1, a.d)) : '';
        s = [qH(a) + ' and ' + qH(b) + (same ? ': the pieces are the same size, ' + unit + ' each.' : ': the pieces are different sizes.'),
          'Together they make ' + qH(a) + ' + ' + qH(b) + '. ' + (same ? 'How many ' + unit + ' pieces is that?' : 'But what do we call that amount?'),
          'Adding tops and bottoms gives ' + fr(a.n + b.n, a.d + b.d) + '. The red bar shows ' + fr(a.n + b.n, a.d + b.d) + '. It is ' + (wr.v < sum.v ? 'shorter than the two pieces together' : 'not the same as the two pieces together') + (wr.v < M.max(a.v, b.v) ? ', even shorter than ' + qH(a.v > b.v ? a : b) + ' alone' : '') + '. So ' + qH(a) + ' + ' + qH(b) + ' is not ' + fr(a.n + b.n, a.d + b.d) + '.',
          (same ? 'The parts are already the same size: ' + L + ' in each whole. ' : 'Cut every bar into ' + L + ' equal parts. ' + qH(a) + ' = ' + fr(a.n * L / a.d, L) + ' and ' + qH(b) + ' = ' + fr(b.n * L / b.d, L) + '. ') + 'Same-size parts can be counted: ' + (a.n * L / a.d) + ' + ' + (b.n * L / b.d) + ' = ' + (a.n * L / a.d + b.n * L / b.d) + ' parts. <b>' + qH(a) + ' + ' + qH(b) + ' = ' + fr(a.n * L / a.d + b.n * L / b.d, L) + (sum.d !== L ? ' = ' + qH(sum) : '') + '</b>'][stepI];
      } else {
        s = B.map(function (b) { var q = bq(b), raw = fr(cnt(b), b.d); return raw + (q.d !== b.d && cnt(b) ? ' = ' + qH(q) : '') + (q.v > 1 && q.d !== 1 ? ' = ' + qH(q, 'mixed') : ''); }).join(', &nbsp;');
        if (B.length === 1) { var b0 = B[0]; s = cnt(b0) + ' of ' + b0.d + ' equal parts shaded: ' + s + '.'; }
        if (B.length === 2) {
          s = '';
          var p = bq(B[0]), q = bq(B[1]), df = qadd(p, rat(-q.n, q.d));
          s += (df.n === 0 ? '<b>' + fr(cnt(B[0]), B[0].d) + ' = ' + fr(cnt(B[1]), B[1].d) + '</b>. They are equal: the shading ends at the same place.' : '<b>' + fr(cnt(B[0]), B[0].d) + (df.n > 0 ? ' &gt; ' : ' &lt; ') + fr(cnt(B[1]), B[1].d) + '</b>. The difference is ' + qH(rat(M.abs(df.n), df.d)) + '.');
        }
      }
      S.say(s);
    }
    function setD(b, d) { d = clamp(d, 1, maxd); var n = M.min(cnt(b), d * b.len); b.d = d; b.sh = {}; for (var j = 0; j < n; j++) b.sh[j] = 1; b.base = null; }
    function setN(b, n) { n = clamp(n, 0, b.d * b.len); b.sh = {}; for (var j = 0; j < n; j++) b.sh[j] = 1; }
    ptr(S.c.cv, {
      hit: function (x, y) { if (guideX === null) return null; return M.abs(x - (G.x0 + guideX * G.U)) < 14 ? 'g' : null; },
      move: function (h, x) { guideX = clamp((x - G.x0) / G.U, 0, G.maxLen); draw(); },
      tap: function (x, y, h) {
        if (h || addQ) return; var B = list();
        for (var i = 0; i < B.length; i++) { var y0 = rowY(i); if (y < y0 || y > y0 + G.rowH) continue; sel = i; var b = B[i]; if (b.lock) { draw(); return; } var j = M.floor((x - G.x0) / (G.U / b.d)); if (j >= 0 && j < b.d * b.len) { if (b.sh[j]) delete b.sh[j]; else b.sh[j] = 1; b.base = null; } changed(); syncCtl(); return; }
      },
      over: function (x, y) { return addQ ? '' : 'pointer'; }
    });
    var P = pads(S.stage, {
      list: function () { var out = list().map(function (b, i) { return { x: G.x0, y: rowY(i), w: b.len * G.U, h: G.rowH, label: 'Bar ' + (i + 1) + ': ' + cnt(b) + ' of ' + b.d + ' parts shaded.' + (b.lock ? '' : ' Left and right arrows shade parts, up and down change the number of parts.') }; }); if (guideX !== null) out.push({ x: G.x0 + guideX * G.U, y: 8, size: 30, label: 'Guide line. Left and right arrows move it.' }); return out; },
      key: function (i, dx, dy) {
        var B = list(); if (i >= B.length) { guideX = clamp(guideX + dx * 0.01 * G.maxLen, 0, G.maxLen); draw(); return; }
        var b = B[i]; sel = i; if (b.lock) return; if (dx) setN(b, cnt(b) + dx); else setD(b, b.d + dy); changed(); syncCtl();
      },
      focus: function (i) { if (i >= 0 && i < list().length && i !== sel) { sel = i; draw(); syncCtl(); } }
    });
    var row = S.row(), eqS, dS;
    if (addQ) V.seg(row, { label: 'Steps', items: [['0', '1. Two pieces'], ['1', '2. Put together'], ['2', '3. Is it ' + (addQ[0].n + addQ[1].n) + '/' + (addQ[0].d + addQ[1].d) + '?'], ['3', addQ[0].d === addQ[1].d ? '4. Count the parts' : '4. Same-size parts']], value: '0', change: function (v) { stepI = +v; draw(); } });
    else {
      if (bars.some(function (b) { return !b.lock; })) {
        dS = stepper(row, { label: 'Parts', value: bars[0].d, min: 1, max: maxd, less: 'Fewer', more: 'More', change: function (v) { var b = bars[sel]; if (b.lock) return; setD(b, v); changed(); syncCtl(); } });
        V.button(row, 'Clear', function () { var b = bars[sel]; if (!b.lock) { b.sh = {}; changed(); } });
      }
      if (o.equiv) eqS = stepper(row, { label: 'Cut each part into', value: 1, min: 1, max: 6, change: function (v) {
        var b = bars[sel]; if (b.lock) return; if (!b.base) b.base = { d: b.d, sh: Object.assign({}, b.sh) };
        if (b.base.d * v > maxd * 2) return; b.d = b.base.d * v; b.sh = {}; Object.keys(b.base.sh).forEach(function (j) { for (var t = 0; t < v; t++) b.sh[+j * v + t] = 1; }); var keep = b.base; changed(); b.base = keep;
      } });
    }
    if (o.guide) { guideX = 0.5; }
    function syncCtl() { var b = bars[sel]; if (dS && b) dS.set(b.d); if (eqS && b && !b.base) eqS.set(1); }
    var tq = TT ? parseQ(TT.target) : null, tb = TT ? int(TT.bar, 0, 0, bars.length - 1) : 0;
    var tk = S.task({
      text: 'Shade ' + (tq ? qH(tq) : '') + ' of ' + (bars.length > 1 ? 'bar ' + (tb + 1) : 'the bar') + '.',
      ok: function () { var q = bq(bars[tb]); return tq && q.n === tq.n && q.d === tq.d; },
      hint: function () { var b = bars[tb], q = bq(b); if ((tq.v * b.d) % 1 > 1e-9) return 'With ' + b.d + ' parts you can\'t make exactly ' + qH(tq) + '. Try a number of parts that ' + tq.d + ' goes into.'; var need = M.round(tq.v * b.d); return 'You have ' + fr(cnt(b), b.d) + '. ' + qH(tq) + ' is ' + fr(need, b.d) + ' with these parts: ' + (need > cnt(b) ? 'shade ' + (need - cnt(b)) + ' more.' : 'clear ' + (cnt(b) - need) + '.'); },
      yes: function () { var b = bars[tb]; return b.d !== tq.d ? fr(cnt(b), b.d) + ' is the same amount as ' + qH(tq) + '.' : 'That is ' + qH(tq) + '.'; }
    });
    function changed() { draw(); if (tk) tk.update(); }
    S.live(draw); draw();
  });

  /* ================================================================ fractioncircle
     Fraction circles (pie pieces). More parts means smaller pieces: 1/8 is less than 1/3.
     opts:
       fracs: ["3/4"]          one or more fractions, each drawn as its own set of circles (default ["1/4"])
                               improper fractions use more circles: "5/4" shows 1 whole and 1/4
       wholes: 0               circles per fraction (default: as many as needed)
       maxd: 12                most parts per circle
       edit: true              tap slices to shade them; −/+ change the number of parts
       equiv: false            "Cut each piece into" stepper: 1/2 = 2/4 = 3/6
       task: "5/4"  or  {target: "5/4", frac: 0}   "Shade 5/4."                                                        */
  def('fractioncircle', function (el, o) {
    var S = shell(el, o, { name: 'fractioncircle', kid: true, label: 'Fraction circles', touch: 'manipulation', height: 220 });
    var maxd = int(o.maxd, 12, 2, 24), TT = taskOf(o), tq = TT ? parseQ(TT.target) : null, sel = 0, G = {};
    var sets = (o.fracs || [TT ? '0/' + (tq ? tq.d : 4) : '1/4']).map(function (s, i) {
      var q0 = rawQ(s) || rat(1, 4), n = M.max(0, q0.n), d = clamp(q0.d, 1, maxd);
      var wh = int(o.wholes, M.max(1, M.ceil(n / d), tq && i === 0 ? M.ceil(tq.v - 1e-9) : 1), 1, 4), sh = {}; for (var j = 0; j < M.min(n, d * wh); j++) sh[j] = 1;
      return { d: d, sh: sh, wh: wh, col: BARC[i % BARC.length], base: null };
    });
    function cnt(s) { return Object.keys(s.sh).length; }
    function geo() {
      var w = S.c.w, tot = sets.reduce(function (a, s) { return a + s.wh; }, 0), gapS = 28;
      var R = M.min(78, (w - 20 - (sets.length - 1) * gapS - tot * 12) / (2 * tot)), side = R >= 44;
      if (!side) R = M.min(78, (w - 20 - 12 * M.max.apply(null, sets.map(function (s) { return s.wh; }))) / (2 * M.max.apply(null, sets.map(function (s) { return s.wh; }))));
      G = { R: R, side: side, gapS: gapS, rowH: 2 * R + 58 };
      S.height(side ? 2 * R + 60 : sets.length * G.rowH + 12);
    }
    function center(si, c) {
      var R = G.R;
      if (G.side) { var x = 10, i; for (i = 0; i < si; i++) x += sets[i].wh * (2 * R + 12) + G.gapS; var tot = sets.reduce(function (a, s) { return a + s.wh * (2 * R + 12); }, 0) + G.gapS * (sets.length - 1); x += (S.c.w - 20 - tot) / 2; return [x + c * (2 * R + 12) + R + 6, R + 8]; }
      var wtot = sets[si].wh * (2 * R + 12); return [(S.c.w - wtot) / 2 + c * (2 * R + 12) + R + 6, si * G.rowH + R + 8];
    }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), R = G.R; ctx.clearRect(0, 0, S.c.w, S.c.h);
      sets.forEach(function (s, si) {
        var col = k[s.col];
        for (var c = 0; c < s.wh; c++) {
          var ce = center(si, c);
          disc(ctx, ce[0], ce[1], R + 3, k.frame); disc(ctx, ce[0], ce[1], R, k.bg);
          for (var j = 0; j < s.d; j++) {
            var a0 = -PI / 2 + j * TAU / s.d, a1 = a0 + TAU / s.d, on = !!s.sh[c * s.d + j];
            ctx.beginPath(); ctx.moveTo(ce[0], ce[1]); ctx.arc(ce[0], ce[1], R, a0, a1); ctx.closePath();
            ctx.fillStyle = on ? soft(col, k.dark ? 0.7 : 0.48) : k.empty; ctx.fill();
            ctx.strokeStyle = k.bg; ctx.lineWidth = s.d > 1 ? 2.5 : 0; if (s.d > 1) ctx.stroke();
          }
          if (s.d > 1) for (j = 0; j < s.d; j++) { var a = -PI / 2 + j * TAU / s.d; ln(ctx, ce[0], ce[1], ce[0] + R * M.cos(a), ce[1] + R * M.sin(a), k.frame, 1.5); }
        }
        var q = { n: cnt(s), d: s.d, v: cnt(s) / s.d }, c0 = center(si, 0), c1 = center(si, s.wh - 1);
        qDraw(ctx, q, (c0[0] + c1[0]) / 2, c0[1] + R + 26, { size: 15, wt: 800, kid: true, form: q.n > q.d && o.mixed ? 'mixed' : 'frac' });
        if (sets.length > 1 && si === sel && o.edit !== false) { ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); rr(ctx, c0[0] - R - 9, c0[1] - R - 7, c1[0] - c0[0] + 2 * R + 18, 2 * R + 56, 14); ctx.stroke(); ctx.restore(); }
      });
      P.sync(); say();
    }
    function say() {
      var s = sets.map(function (st) { var n = cnt(st), q = rat(n, st.d); return fr(n, st.d) + (q.v > 1 && q.d !== 1 ? ' = ' + qH(q, 'mixed') : q.d !== st.d && n ? ' = ' + qH(q) : ''); }).join(', &nbsp;');
      if (sets.length === 1) { var st = sets[0]; s = cnt(st) + ' of the ' + st.d + ' equal parts ' + (st.wh > 1 ? 'in each circle ' : '') + 'are shaded: ' + s + '.' + (cnt(st) > st.d ? ' That is more than one whole.' : ''); }
      if (sets.length === 2) {
        var p = rat(cnt(sets[0]), sets[0].d), q = rat(cnt(sets[1]), sets[1].d), df = qadd(p, rat(-q.n, q.d));
        s =  (df.n === 0 ? '<b>Equal amounts</b>.' : '<b>' + fr(cnt(sets[0]), sets[0].d) + (df.n > 0 ? ' &gt; ' : ' &lt; ') + fr(cnt(sets[1]), sets[1].d) + '</b>.') + (sets[0].d !== sets[1].d && cnt(sets[0]) === cnt(sets[1]) ? ' Same number of pieces, but ' + dName(M.min(sets[0].d, sets[1].d)) + ' are bigger pieces.' : '');
      }
      S.say(s);
    }
    function hitSlice(x, y) { for (var si = 0; si < sets.length; si++) for (var c = 0; c < sets[si].wh; c++) { var ce = center(si, c), dx = x - ce[0], dy = y - ce[1]; if (M.hypot(dx, dy) <= G.R) { var a = (M.atan2(dy, dx) + PI / 2 + TAU) % TAU; return [si, c * sets[si].d + M.floor(a / (TAU / sets[si].d))]; } } return null; }
    ptr(S.c.cv, { tap: function (x, y) { if (o.edit === false) return; var h = hitSlice(x, y); if (!h) return; sel = h[0]; var s = sets[h[0]]; if (s.sh[h[1]]) delete s.sh[h[1]]; else s.sh[h[1]] = 1; s.base = null; changed(); syncCtl(); }, over: function (x, y) { return o.edit !== false && hitSlice(x, y) ? 'pointer' : ''; } });
    var P = pads(S.stage, {
      list: function () { return o.edit === false ? [] : sets.map(function (s, si) { var c = center(si, 0); return { x: c[0], y: c[1], size: G.R * 1.6, label: 'Fraction ' + (si + 1) + ': ' + cnt(s) + ' of ' + s.d + ' parts. Left and right arrows shade, up and down change the parts.' }; }); },
      key: function (i, dx, dy) { var s = sets[i]; sel = i; if (dx) setN(s, cnt(s) + dx); else setD(s, s.d + dy); changed(); syncCtl(); },
      focus: function (i) { if (i >= 0 && i !== sel) { sel = i; draw(); syncCtl(); } }
    });
    function setN(s, n) { n = clamp(n, 0, s.d * s.wh); s.sh = {}; for (var j = 0; j < n; j++) s.sh[j] = 1; s.base = null; }
    function setD(s, d) { d = clamp(d, 1, maxd); var n = M.min(cnt(s), d * s.wh); s.d = d; s.sh = {}; for (var j = 0; j < n; j++) s.sh[j] = 1; s.base = null; }
    var row = S.row(), dS, eqS;
    if (o.edit !== false) { dS = stepper(row, { label: 'Parts', value: sets[0].d, min: 1, max: maxd, less: 'Fewer', more: 'More', change: function (v) { setD(sets[sel], v); changed(); syncCtl(); } }); V.button(row, 'Clear', function () { sets[sel].sh = {}; changed(); }); }
    if (o.equiv) eqS = stepper(row, { label: 'Cut each piece into', value: 1, min: 1, max: 4, change: function (v) { var s = sets[sel]; if (!s.base) s.base = { d: s.d, sh: Object.assign({}, s.sh) }; if (s.base.d * v > 24) return; var b = s.base; s.d = b.d * v; s.sh = {}; Object.keys(b.sh).forEach(function (j) { var c = M.floor(+j / b.d), r = +j % b.d; for (var t = 0; t < v; t++) s.sh[c * s.d + r * v + t] = 1; }); changed(); s.base = b; } });
    function syncCtl() { if (dS) dS.set(sets[sel].d); if (eqS && !sets[sel].base) eqS.set(1); }
    var tf = TT ? int(TT.frac, 0, 0, sets.length - 1) : 0;
    var tk = S.task({
      text: 'Shade ' + (tq ? qH(tq) : '') + '.',
      ok: function () { var s = sets[tf], q = rat(cnt(s), s.d); return q.n === tq.n && q.d === tq.d; },
      hint: function () { var s = sets[tf]; if ((tq.v * s.d) % 1 > 1e-9) return 'Each circle has ' + s.d + ' parts. Change the number of parts so ' + qH(tq) + ' can be made.'; var need = M.round(tq.v * s.d); return 'Shade ' + need + ' parts in all' + (need > s.d ? ' (that fills one circle and more)' : '') + '. You have ' + cnt(s) + '.'; }
    });
    function changed() { draw(); if (tk) tk.update(); }
    S.live(draw); draw();
  });

  /* ================================================================ fractionline
     Fractions on a number line: cut each whole into d equal parts, and a fraction is a number of those parts
     counted from 0. Extra lines below show equal fractions lining up (1/2 = 2/4 = 4/8).
     opts:
       d: 4                  parts in each whole on the main line (1 to 12; a stepper changes it)
       max: 1                wholes shown (1 to 5)
       point: "3/4"          where the point starts (it snaps to the parts)
       lines: []             denominators of extra lines underneath, e.g. [2, 8]
       hops: true            draw the jumps of 1/d from 0 to the point
       labels: "frac"        "frac" (5/4) or "mixed" (1 1/4)
       task: "5/4"  or  {target: "5/4"}   "Put the point at 5/4."                                                    */
  def('fractionline', function (el, o) {
    var S = shell(el, o, { name: 'fractionline', label: 'Fractions on a number line', touch: 'pan-y', height: 150 });
    var TT = taskOf(o), tq = TT ? parseQ(TT.target) : null, d = int(o.d, tq ? tq.d : 4, 1, 12), mx = int(o.max, tq ? M.max(1, M.ceil(tq.v)) : 1, 1, 5);
    var pq = parseQ(o.point) || rat(tq ? 0 : 1, d), j = M.round(pq.v * d), lines = (o.lines || []).map(function (x) { return int(x, 2, 1, 24); }), hops = o.hops !== false, G = {};
    function geo() { var w = S.c.w; G = { x0: 22, x1: w - 22, y0: 74, gap: 58 }; S.height(G.y0 + 50 + lines.length * G.gap); }
    function X(v) { return G.x0 + v / mx * (G.x1 - G.x0); }
    function labelQ(n, dd) { return { n: n, d: dd, v: n / dd }; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), v = j / d; ctx.clearRect(0, 0, S.c.w, S.c.h);
      function line(y, dd, main) {
        ln(ctx, G.x0 - 8, y, G.x1 + 8, y, k.ink, 2);
        var pxs = (G.x1 - G.x0) / (mx * dd), show = pxs >= 30;
        for (var i = 0; i <= mx * dd; i++) {
          var x = X(i / dd), whole = i % dd === 0, hit = !main && near(i / dd, v);
          ln(ctx, x, y - (whole ? 10 : 7), x, y + (whole ? 10 : 7), hit ? k.green : whole ? k.ink : k.muted, whole ? 2 : 1.5);
          if (whole) tx(ctx, String(i / dd), x, y + 22, { size: 14, wt: 700 });
          else if (show || hit) qDraw(ctx, o.labels === 'mixed' && i > dd ? rat(i, dd) : labelQ(i, dd), x, y + 28, { size: 11.5, wt: hit ? 800 : 500, col: hit ? k.green : k.muted, form: o.labels === 'mixed' ? 'mixed' : 'frac' });
          if (hit) disc(ctx, x, y, 6, k.green, k.bg, 2);
        }
      }
      line(G.y0, d, true);
      lines.forEach(function (dd, i) { line(G.y0 + (i + 1) * G.gap, dd, false); });
      var px = X(v);
      if (lines.length) ln(ctx, px, G.y0, px, G.y0 + lines.length * G.gap + 12, k.red, 1.5, [5, 4]);
      if (hops && j > 0) for (var i = 0; i < j; i++) { var a = X(i / d), b = X((i + 1) / d), h = M.min(22, (b - a) / 2 + 4); ctx.save(); ctx.strokeStyle = soft(k.purple, 0.85); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a, G.y0 - 3); ctx.quadraticCurveTo((a + b) / 2, G.y0 - 3 - 2 * h, b, G.y0 - 3); ctx.stroke(); ctx.restore(); }
      if (hops && j > 0 && (X(1 / d) - X(0)) > 26) qDraw(ctx, rat(1, d), (X(0) + X(1 / d)) / 2, G.y0 - 36, { size: 10.5, col: k.purple, wt: 700 });
      disc(ctx, px, G.y0, 10, k.red, k.bg, 2.5);
      fillRR(ctx, px - 22, G.y0 - 72 + (hops ? 0 : 16), 44, 34, 8, k.bg, k.red, 1.5);
      qDraw(ctx, o.labels === 'mixed' && j > d ? rat(j, d) : labelQ(j, d), px, G.y0 - 55 + (hops ? 0 : 16), { size: 11, wt: 800, form: o.labels === 'mixed' ? 'mixed' : 'frac' });
      P.sync(); say();
    }
    function say() {
      var q = rat(j, d), s = 'The point is at <b>' + fr(j, d) + '</b>' + (j ? ': ' + plural(j, 'jump') + ' of ' + fr(1, d) + ' from 0' : '') + '.';
      if (j > d && j % d) s += ' ' + fr(j, d) + ' = ' + qH(q, 'mixed') + '.';
      if (j && j % d === 0) s += ' ' + fr(j, d) + ' = ' + (j / d) + '.';
      var eq = lines.filter(function (dd) { return near(j / d * dd, M.round(j / d * dd)); }).map(function (dd) { return fr(M.round(j / d * dd), dd); });
      if (eq.length) s += ' It lines up with ' + eq.join(' and ') + ': <b>' + [fr(j, d)].concat(eq).join(' = ') + '</b>.';
      var miss = lines.filter(function (dd) { return !near(j / d * dd, M.round(j / d * dd)); });
      if (miss.length) s += ' On the ' + miss.map(function (dd) { return dd + '-part'; }).join(' and ') + ' line it falls between two marks.';
      S.say(s);
    }
    ptr(S.c.cv, {
      hit: function (x, y) { return M.abs(x - X(j / d)) < 26 && y < G.y0 + 26 ? 'p' : null; },
      move: function (h, x) { var nj = clamp(M.round((x - G.x0) / (G.x1 - G.x0) * mx * d), 0, mx * d); if (nj !== j) { j = nj; draw(); } },
      end: function () { if (tk) tk.update(); },
      tap: function (x, y, h) { if (h || y > G.y0 + 26) return; j = clamp(M.round((x - G.x0) / (G.x1 - G.x0) * mx * d), 0, mx * d); draw(); if (tk) tk.update(); }
    });
    var P = pads(S.stage, {
      list: function () { return [{ x: X(j / d), y: G.y0, size: 36, label: 'Point at ' + j + '/' + d + '. Left and right arrows move it one part.' }]; },
      key: function (i, dx, dy) { j = clamp(j + (dx || dy), 0, mx * d); draw(); if (tk) tk.update(); }
    });
    var row = S.row();
    stepper(row, { label: 'Parts in each whole', value: d, min: 1, max: 12, less: 'Fewer', more: 'More', change: function (nd) { j = M.round(j / d * nd); d = nd; draw(); if (tk) tk.update(); } });
    toggle(row, 'Show jumps', hops, function (on) { hops = on; draw(); });
    var tk = S.task({
      text: 'Put the point at ' + (tq ? qH(tq, o.labels === 'mixed' ? 'mixed' : 'frac') : '') + '.',
      ok: function () { return near(j / d, tq.v); },
      hint: function () { if ((tq.v * d) % 1 > 1e-9) return 'With ' + d + ' parts in each whole, ' + qH(tq) + ' falls between marks. Change the number of parts.'; var need = M.round(tq.v * d); return 'Each jump is ' + fr(1, d) + '. You are at ' + plural(j, 'jump') + '; ' + qH(tq) + ' is ' + plural(need, 'jump') + '.'; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ decimalgrid
     A hundred grid for decimals: each column is one tenth, each small square one hundredth. 0.3 and 0.30 shade the
     same amount, and 0.5 is more than 0.25 even though 25 is more than 5.
     opts:
       v: "0.37"            the shaded amount (up to the number of grids)
       grids: 1             grids for this value (2 lets you show numbers up to 2)
       compare: null        a second value with its own grid, e.g. "0.25", for comparing
       tenths: false        tenths only (ten strips, no hundredths)
       percent: false       also say the amount as a percent
       task: "0.45"  or  {target: "0.45"}   "Shade 0.45."
     Tap or drag across the grid to shade up to that square. Keyboard: ←/→ change by a tenth, ↑/↓ by a hundredth.  */
  def('decimalgrid', function (el, o) {
    var S = shell(el, o, { name: 'decimalgrid', label: 'A hundred grid showing a decimal', touch: 'none', height: 260 });
    var TT = taskOf(o), ten = !!o.tenths, gr = int(o.grids, M.max(1, M.ceil(num(o.v, 0) - 1e-9), TT ? M.ceil(num(TT.target, 0) - 1e-9) : 1), 1, 3);
    var vals = [M.round(num(o.v, 0) * 100)], G = {};
    if (o.compare != null) vals.push(M.round(num(o.compare, 0) * 100));
    vals = vals.map(function (v) { v = clamp(v, 0, gr * 100); return ten ? M.round(v / 10) * 10 : v; });
    function geo() {
      var w = S.c.w, n = vals.length * gr, gap = 18, sz = M.min(240, (w - 16 - gap * (n - 1)) / n);
      G = { sz: sz, gap: gap, x0: (w - n * sz - gap * (n - 1)) / 2, y0: 8 }; S.height(sz + 44);
    }
    function gx(g, i) { return G.x0 + (g * gr + i) * (G.sz + G.gap); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), sz = G.sz, c = sz / 10; ctx.clearRect(0, 0, S.c.w, S.c.h);
      vals.forEach(function (v, g) {
        var col = g ? k.blue : k.green;
        for (var i = 0; i < gr; i++) {
          var x0 = gx(g, i), y0 = G.y0, here = clamp(v - i * 100, 0, 100);
          fillRR(ctx, x0, y0, sz, sz, 4, k.bg);
          for (var cc = 0; cc < 10; cc++) for (var r = 0; r < 10; r++) { var idx = cc * 10 + r; if (idx < here) { ctx.fillStyle = soft(col, k.dark ? 0.7 : 0.55); ctx.fillRect(x0 + cc * c, y0 + r * c, c, c); } }
          ctx.save(); ctx.strokeStyle = k.line; ctx.lineWidth = 1; ctx.beginPath();
          for (var q = 1; q < 10; q++) { ctx.moveTo(x0 + q * c + 0.5, y0); ctx.lineTo(x0 + q * c + 0.5, y0 + sz); if (!ten) { ctx.moveTo(x0, y0 + q * c + 0.5); ctx.lineTo(x0 + sz, y0 + q * c + 0.5); } }
          ctx.stroke(); ctx.restore();
          ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); for (q = 1; q <= M.floor(here / 10); q++) { ctx.moveTo(x0 + q * c, y0); ctx.lineTo(x0 + q * c, y0 + sz); } ctx.stroke(); ctx.restore();
          ctx.save(); ctx.strokeStyle = k.frame; ctx.lineWidth = 2; rr(ctx, x0, y0, sz, sz, 4); ctx.stroke(); ctx.restore();
        }
        var mid = (gx(g, 0) + gx(g, gr - 1) + sz) / 2;
        if (!S.quiet) tx(ctx, f(v / 100, 2).indexOf('.') < 0 && v % 100 === 0 ? String(v / 100) : (v / 100).toFixed(ten ? 1 : 2), mid, G.y0 + sz + 22, { size: 18, wt: 800, col: g ? k.blue : k.green });
      });
      P.sync(); say();
    }
    function dtext(v) { return ten ? (v / 100).toFixed(1) : f(v / 100, 2); }
    function say() {
      var s = vals.map(function (v) {
        if (!v) return '<b>0</b>: nothing is shaded yet. Each column is one tenth; each small square is one hundredth.';
        var t = M.floor((v % 100) / 10), h = v % 10, w = M.floor(v / 100), q = rat(v, 100);
        if (ten) return '<b>' + dtext(v) + '</b> = ' + (w ? plural(w, 'whole') + ' and ' : '') + plural(t, 'tenth') + ' = ' + fr(v / 10, 10);
        return '<b>' + dtext(v) + '</b> = ' + (w ? plural(w, 'whole') + ' and ' : '') + plural(v % 100, 'hundredth') + (t && h ? ' = ' + plural(t, 'tenth') + ' and ' + plural(h, 'hundredth') : '') + ' = ' + fr(v, 100) + (q.d !== 100 && v ? ' = ' + qH(q) : '') + (o.percent ? ' = ' + v + '%' : '');
      }).join('<br>');
      if (vals.length === 2) { var a = vals[0], b = vals[1]; s += '<br>' + (a === b ? '<b>Equal</b>: ' + dtext(a) + ' = ' + dtext(b) + '.' : '<b>' + dtext(a) + (a > b ? ' &gt; ' : ' &lt; ') + dtext(b) + '</b>: ' + a + ' hundredths ' + (a > b ? 'is more than ' : 'is less than ') + b + ' hundredths.'); }
      S.say(s);
    }
    function at(x, y) { for (var g = 0; g < vals.length; g++) for (var i = 0; i < gr; i++) { var x0 = gx(g, i); if (x >= x0 && x <= x0 + G.sz && y >= G.y0 - 4 && y <= G.y0 + G.sz + 4) { var cc = clamp(M.floor((x - x0) / (G.sz / 10)), 0, 9), r = clamp(M.floor((y - G.y0) / (G.sz / 10)), 0, 9); return [g, i * 100 + (ten ? (cc + 1) * 10 : cc * 10 + r + 1)]; } } return null; }
    var dragG = -1;
    ptr(S.c.cv, {
      hit: function (x, y) { var h = at(x, y); return h ? h : null; },
      start: function (h) { var cur = vals[h[0]]; vals[h[0]] = cur === h[1] ? h[1] - (ten ? 10 : 1) : h[1]; dragG = h[0]; draw(); },
      move: function (h, x, y) { var a = at(x, y); if (a && a[0] === dragG && vals[dragG] !== a[1]) { vals[dragG] = a[1]; draw(); } },
      end: function () { if (tk) tk.update(); }
    });
    var P = pads(S.stage, {
      list: function () { return vals.map(function (v, g) { return { x: gx(g, 0), y: G.y0, w: G.sz, h: G.sz, label: 'Grid ' + (g + 1) + ': ' + dtext(v) + '. Left and right arrows change tenths' + (ten ? '.' : ', up and down change hundredths.') }; }); },
      key: function (g, dx, dy) { vals[g] = clamp(vals[g] + dx * 10 + (ten ? dy * 10 : dy), 0, gr * 100); draw(); if (tk) tk.update(); }
    });
    var row = S.row(); V.button(row, 'Clear', function () { vals = vals.map(function () { return 0; }); draw(); if (tk) tk.update(); });
    var tv = TT ? M.round(num(TT.target, 0) * 100) : 0;
    var tk = S.task({ text: 'Shade ' + (TT ? dtext(tv) : '') + '.', ok: function () { return vals[0] === tv; },
      hint: function () { var v = vals[0]; return 'You have ' + dtext(v) + '. ' + dtext(tv) + ' is ' + plural(M.floor(tv / 10), 'full column') + (tv % 10 ? ' and ' + plural(tv % 10, 'more square') : '') + '.'; } });
    S.live(draw); draw();
  });

  /* ================================================================ percentbar
     A percent bar: a quantity on top, percents below, matched up (a double number line). 10% of 80 is 8, so 25% is
     8 + 8 + 4 = 20. Drag the marker to any percent.
     opts:
       whole: 80          the amount that is 100%
       pct: 25            where the marker starts
       step: 10           percent between labeled ticks (10, 20, 25 or 5)
       snap: 5            percent the marker moves by (1 for exact work)
       max: 100           go past 100% (up to 300) to show percents bigger than the whole
       pre: "", unit: ""  text before and after the amounts, e.g. pre "$" or unit " students"
       find: "part"       "whole": the whole is unknown; part and pct are known ({find: "whole", part: 24, pct: 30}),
                          and "Next step" works out 10% and then 100%
       task: {pct: 30}    "Find 30% of 80." (move the marker to 30%), or {part: 24} "What percent of 80 is 24?"     */
  def('percentbar', function (el, o) {
    var S = shell(el, o, { name: 'percentbar', label: 'A percent bar', touch: 'pan-y', height: 150 });
    var TT = taskOf(o), whole = num(o.whole, 80), pct = num(o.pct, 25), step = num(o.step, 10), snap = num(o.snap, 5), mxp = clamp(num(o.max, 100), 100, 300);
    var pre = o.pre || '', unit = o.unit || '', findW = o.find === 'whole', partK = num(o.part, 24), stepW = 0, G = {};
    if (findW) { pct = num(o.pct, 30); whole = partK * 100 / pct; }
    function amt(p) { return pre + f(whole * p / 100, 2) + unit; }
    function geo() { var w = S.c.w; G = { x0: 18, x1: w - 18, y: 58, h: 40 }; S.height(G.y + G.h + 40); }
    function X(p) { return G.x0 + p / mxp * (G.x1 - G.x0); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), y = G.y, h = G.h; ctx.clearRect(0, 0, S.c.w, S.c.h);
      fillRR(ctx, X(0), y, X(100) - X(0), h, 8, k.empty, k.frame, 2);
      if (mxp > 100) fillRR(ctx, X(100), y, X(mxp) - X(100), h, 8, null, k.line, 1.5);
      var p2 = findW ? pct : pct; fillRR(ctx, X(0), y, X(p2) - X(0), h, 8, soft(k.green, k.dark ? 0.6 : 0.45), k.green, 2);
      var px = (X(step) - X(0)), lblEvery = px < 34 ? M.ceil(34 / px) : 1;
      for (var p = 0, i = 0; p <= mxp + 1e-9; p += step, i++) {
        var x = X(p), big = near(p % 100, 0) || near(p % 50, 0);
        ln(ctx, x, y - 6, x, y + h + 6, p === 100 ? k.frame : k.muted, p === 100 ? 2.5 : 1.2);
        if (i % lblEvery === 0 || p === 100) {
          tx(ctx, f(p) + '%', x, y + h + 18, { size: 12, wt: big ? 700 : 500, col: k.ink });
          var top = findW ? (p === 100 ? (stepW >= 2 ? amt(100) : '?') : near(p, pct) ? pre + f(partK) + unit : stepW >= 1 ? amt(p) : '') : S.quiet && p !== 100 ? '' : amt(p); // quiet: only the whole
          if (top) tx(ctx, top, x, y - 16, { size: 12, wt: big || near(p, pct) ? 700 : 500, col: top === '?' ? k.gold : k.muted });
        }
      }
      if (!findW) { var mx = X(pct); ln(ctx, mx, y - 26, mx, y + h + 6, k.red, 3); disc(ctx, mx, y + h / 2, 9, k.red, k.bg, 2.5); fillRR(ctx, mx - 44, 2, 88, 22, 6, k.bg, k.red, 1.5); tx(ctx, f(pct) + '%' + (S.quiet ? '' : ' → ' + amt(pct)), mx, 13.5, { size: 12, wt: 700, col: k.ink }); }
      else { tx(ctx, pre + f(partK) + unit + ' is ' + f(pct) + '%', X(pct) / 2 + X(0) / 2, y + h / 2, { size: 12, wt: 700, col: k.ink, halo: k.bg }); }
      P.sync(); say();
    }
    function say() {
      var s;
      if (findW) {
        var ten = partK / (pct / 10);
        s = [pre + f(partK) + unit + ' is ' + f(pct) + '% of what? The whole bar is 100%, and it is unknown.', f(pct) + '% is ' + f(pct / 10) + ' tens of percent, so 10% is ' + pre + f(partK) + unit + ' ÷ ' + f(pct / 10) + ' = ' + pre + f(ten) + unit + '.', '100% is 10 × 10%: 10 × ' + f(ten) + ' = <b>' + pre + f(ten * 10) + unit + '</b>. So ' + pre + f(partK) + unit + ' is ' + f(pct) + '% of ' + pre + f(ten * 10) + unit + '.'][stepW];
      } else {
        var tenth = whole / 10;
        s = '<b>' + f(pct) + '% of ' + pre + f(whole) + unit + ' is ' + amt(pct) + '</b>. ';
        if (pct % 10 === 0 && pct) s += '10% is ' + pre + f(tenth) + unit + ', so ' + f(pct) + '% is ' + f(pct / 10) + ' × ' + f(tenth) + ' = ' + f(whole * pct / 100) + '.';
        else if (pct % 5 === 0) s += '10% is ' + pre + f(tenth) + unit + ' and 5% is half of that, ' + f(tenth / 2) + '. So ' + f(pct) + '% is ' + (M.floor(pct / 10) ? M.floor(pct / 10) + ' × ' + f(tenth) + ' + ' : '') + f(tenth / 2) + ' = ' + f(whole * pct / 100) + '.';
        else if (pct) s += '1% is ' + pre + f(whole / 100, 4) + unit + ', so ' + f(pct) + '% is ' + f(pct) + ' × ' + f(whole / 100, 4) + ' = ' + f(whole * pct / 100) + '.';
        if (pct > 100) s += ' More than 100% means more than the whole.';
      }
      S.say(s);
    }
    function setP(x) { var p = clamp(M.round(((x - G.x0) / (G.x1 - G.x0) * mxp) / snap) * snap, 0, mxp); if (p !== pct) { pct = p; draw(); } }
    if (!findW) ptr(S.c.cv, { hit: function (x) { return M.abs(x - X(pct)) < 26 ? 'm' : null; }, move: function (h, x) { setP(x); }, end: function () { if (tk) tk.update(); }, tap: function (x, y, h) { if (!h) { setP(x); if (tk) tk.update(); } } });
    var P = pads(S.stage, { list: function () { return findW ? [] : [{ x: X(pct), y: G.y + G.h / 2, size: 36, label: f(pct) + ' percent: ' + amt(pct) + '. Left and right arrows move the marker.' }]; }, key: function (i, dx, dy, e) { pct = clamp(pct + (dx || dy) * (e.shiftKey ? 10 : snap), 0, mxp); draw(); if (tk) tk.update(); } });
    var row = S.row();
    if (findW) { var bN = V.button(row, 'Next step', function () { stepW = M.min(2, stepW + 1); bN.disabled = stepW >= 2; draw(); }, 'pri'); V.button(row, 'Start over', function () { stepW = 0; bN.disabled = false; draw(); }); }
    var tk = S.task({
      text: TT && (TT.part != null ? 'What percent of ' + pre + f(whole) + unit + ' is ' + pre + f(num(TT.part, 0)) + unit + '? Move the marker to it.' : 'Find ' + f(num(TT.pct, num(TT.target, 0))) + '% of ' + pre + f(whole) + unit + '.'),
      ok: function () { return TT.part != null ? near(whole * pct / 100, num(TT.part, 0), 1e-9) : near(pct, num(TT.pct, num(TT.target, 0))); },
      hint: function () { var cur = whole * pct / 100; if (TT.part != null) return 'The marker is at ' + amt(pct) + '. ' + (cur < num(TT.part, 0) ? 'Move right.' : 'Move left.'); return 'Move the marker to ' + f(num(TT.pct, num(TT.target, 0))) + '%.'; },
      yes: function () { return f(pct) + '% of ' + pre + f(whole) + unit + ' is ' + amt(pct) + '.'; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ ratiotable
     A ratio on a double number line, with a table. Scaling both amounts by the same number keeps the ratio the same;
     adding the same amount to both does not.
     opts:
       a: 3, b: 5               the ratio a : b
       names: ["flour", "sugar"]   what a and b count (default "A", "B"); units: ["cups", "cups"] optional
       max: 6                   batches shown on the lines
       snap: "batch"            how the marker moves: "batch" (whole batches), "half" (half batches) or "unit" (a = 1, 2, 3 …)
       pins: [1, 2]             batches already in the table
       task: {a: 12}  or  {b: 20}   "How much sugar goes with 12 cups of flour?" (move the marker there)          */
  def('ratiotable', function (el, o) {
    var S = shell(el, o, { name: 'ratiotable', label: 'A ratio on a double number line', touch: 'pan-y', height: 170 });
    var a = int(o.a, 3, 1, 1000), b = int(o.b, 5, 1, 1000), TT = taskOf(o), names = o.names || ['A', 'B'], units = o.units || ['', ''];
    var mx = int(o.max, TT ? M.max(6, M.ceil(num(TT.a != null ? TT.a : 0, 0) / a), M.ceil(num(TT.b != null ? TT.b : 0, 0) / b)) : 6, 2, 20);
    var stepK = o.snap === 'unit' ? rat(1, a) : o.snap === 'half' ? rat(1, 2) : rat(1), jj = M.round(1 / stepK.v), pins = (o.pins || [1, 2]).map(function (x) { return parseQ(x) || rat(1); }), wrong = false, G = {};
    function K() { return qmul(rat(jj), stepK); }
    function geo() { var w = S.c.w; G = { x0: 18 + M.min(80, w * 0.16), x1: w - 22, y1: 44, y2: 116 }; S.height(150); }
    function X(k) { return G.x0 + k / mx * (G.x1 - G.x0); }
    function qs(q) { return q.d === 1 ? String(q.n) : qText(q, 'mixed'); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), kk = K(), x = X(kk.v); ctx.clearRect(0, 0, S.c.w, S.c.h);
      tx(ctx, names[0], G.x0 - 14, G.y1, { size: 13, wt: 700, al: 'right', col: k.green }); tx(ctx, names[1], G.x0 - 14, G.y2, { size: 13, wt: 700, al: 'right', col: k.blue });
      ln(ctx, G.x0, G.y1, G.x1 + 8, G.y1, k.ink, 2); ln(ctx, G.x0, G.y2, G.x1 + 8, G.y2, k.ink, 2);
      var every = (X(1) - X(0)) < 30 ? M.ceil(30 / (X(1) - X(0))) : 1;
      for (var i = 0; i <= mx; i++) { var xi = X(i); ln(ctx, xi, G.y1 - 7, xi, G.y1 + 7, k.ink, 1.5); ln(ctx, xi, G.y2 - 7, xi, G.y2 + 7, k.ink, 1.5); if (i % every === 0) { tx(ctx, String(a * i), xi, G.y1 - 17, { size: 12, col: k.muted }); tx(ctx, String(b * i), xi, G.y2 + 19, { size: 12, col: k.muted }); } }
      if (stepK.v < 1 && (X(stepK.v) - X(0)) > 5) for (var q = 0; q <= mx / stepK.v; q++) { var xq = X(q * stepK.v); ln(ctx, xq, G.y1 - 3, xq, G.y1 + 3, k.muted, 1); ln(ctx, xq, G.y2 - 3, xq, G.y2 + 3, k.muted, 1); }
      ln(ctx, x, G.y1, x, G.y2, k.gold, 3);
      disc(ctx, x, G.y1, 8, k.green, k.bg, 2); disc(ctx, x, G.y2, 8, k.blue, k.bg, 2);
      tx(ctx, qs(qmul(kk, rat(a))), x, G.y1 - 17, { size: 13, wt: 800, col: k.green, halo: k.bg }); tx(ctx, qs(qmul(kk, rat(b))), x, G.y2 + 19, { size: 13, wt: 800, col: k.blue, halo: k.bg });
      if (wrong) { var xa = X(2), xb = X((b + a) / b); ln(ctx, xa, G.y1, xb, G.y2, k.red, 2.5, [6, 4]); disc(ctx, xb, G.y2, 6, k.red); tx(ctx, String(b + a) + '?', xb + 4, G.y2 - 12, { size: 12, wt: 800, col: k.red, al: 'left', halo: k.bg }); }
      P.sync(); say(); table();
    }
    function say() {
      var kk = K(), av = qmul(kk, rat(a)), bv = qmul(kk, rat(b)), ur = rat(b, a), s;
      s = '<b>' + qs(av) + ' ' + (units[0] ? units[0] + ' of ' : '') + names[0] + ' : ' + qs(bv) + ' ' + (units[1] ? units[1] + ' of ' : '') + names[1] + '</b>' + (kk.v === 1 ? ' — one batch.' : kk.v ? ' — that is ' + a + ' : ' + b + ', both times ' + qs(kk) + '.' : '.');
      s += '<br>For every 1 ' + (units[0] ? units[0].replace(/s$/, '') + ' of ' : '') + names[0] + ' there ' + (ur.v === 1 ? 'is ' : 'are ') + qH(ur, 'mixed') + (ur.d > 1 ? ' (≈ ' + f(ur.v) + ')' : '') + ' ' + (units[1] || '') + (units[1] ? ' of ' : '') + names[1] + '.';
      if (wrong) s += '<br><span style="color:var(--mb-try)">Adding ' + a + ' to both gives ' + 2 * a + ' : ' + (b + a) + ', but the same mix needs ' + 2 * a + ' : ' + 2 * b + '. ' + 2 * a + ' : ' + (b + a) + ' is the ratio ' + qText(rat(2 * a, b + a)).replace('/', ' : ') + ', a different mix. Ratios scale by multiplying.</span>';
      S.say(s);
    }
    var tw2 = V.el('div', 'mlb-tablewrap'); S.ctl.parentNode.insertBefore(tw2, S.ctl);
    function table() {
      var kk = K(), cols = pins.slice(); if (!cols.some(function (p) { return near(p.v, kk.v); })) cols.push(kk); cols.sort(function (x, y) { return x.v - y.v; });
      var h = '<table class="mlb-tab"><tbody><tr><th scope="row">' + esc(names[0]) + '</th>' + cols.map(function (c) { return '<td' + (near(c.v, kk.v) ? ' class="mlb-now"' : '') + '>' + qs(qmul(c, rat(a))) + '</td>'; }).join('') + '</tr><tr><th scope="row">' + esc(names[1]) + '</th>' + cols.map(function (c) { return '<td' + (near(c.v, kk.v) ? ' class="mlb-now"' : '') + '>' + qs(qmul(c, rat(b))) + '</td>'; }).join('') + '</tr></tbody></table>';
      if (tw2._h !== h) { tw2.innerHTML = h; tw2._h = h; }
    }
    function setX(x) { var nj = clamp(M.round(((x - G.x0) / (G.x1 - G.x0) * mx) / stepK.v), 0, M.round(mx / stepK.v)); if (nj !== jj) { jj = nj; draw(); } }
    ptr(S.c.cv, { hit: function (x) { return M.abs(x - X(K().v)) < 24 ? 'm' : null; }, move: function (h, x) { setX(x); }, end: function () { if (tk) tk.update(); }, tap: function (x, y, h) { if (!h) { setX(x); if (tk) tk.update(); } } });
    var P = pads(S.stage, { list: function () { var kk = K(); return [{ x: X(kk.v), y: (G.y1 + G.y2) / 2, size: 40, label: qs(qmul(kk, rat(a))) + ' ' + names[0] + ' to ' + qs(qmul(kk, rat(b))) + ' ' + names[1] + '. Left and right arrows move.' }]; }, key: function (i, dx, dy) { jj = clamp(jj + (dx || dy), 0, M.round(mx / stepK.v)); draw(); if (tk) tk.update(); } });
    var row = S.row();
    V.button(row, 'Put in the table', function () { var kk = K(); if (!pins.some(function (p) { return near(p.v, kk.v); })) pins.push(kk); draw(); }, 'pri');
    V.button(row, 'Unit rate (1 ' + names[0] + ')', function () { if (stepK.v > 1 / a + 1e-9) { stepK = rat(1, a); } jj = M.round((1 / a) / stepK.v); draw(); });
    toggle(row, 'What if we add instead?', false, function (on) { wrong = on; draw(); });
    var tk = S.task({
      text: TT && (TT.a != null ? 'How much ' + names[1] + ' goes with ' + TT.a + ' ' + (units[0] ? units[0] + ' of ' : '') + names[0] + '?' : 'How much ' + names[0] + ' goes with ' + TT.b + ' ' + (units[1] ? units[1] + ' of ' : '') + names[1] + '?') + ' Move the marker there.',
      ok: function () { var kk = K(); return TT.a != null ? near(kk.v * a, num(TT.a, 0)) : near(kk.v * b, num(TT.b, 0)); },
      hint: function () { var kk = K(), cur = TT.a != null ? kk.v * a : kk.v * b, t = num(TT.a != null ? TT.a : TT.b, 0); return 'The marker shows ' + f(cur) + ' ' + (TT.a != null ? names[0] : names[1]) + '. ' + (cur < t ? 'Move right.' : 'Move left.') + (t % (TT.a != null ? a : b) ? ' It isn\'t a whole number of batches: try the unit rate.' : ''); },
      yes: function () { var kk = K(); return qs(qmul(kk, rat(a))) + ' : ' + qs(qmul(kk, rat(b))) + '. Both amounts are ' + a + ' : ' + b + ' times ' + qs(kk) + '.'; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ tapediagram
     Tape (bar) diagrams for word problems, with the solving steps shown one at a time.
     opts:
       model: "partwhole"  {whole: 12, a: 5}                   one tape in two parts. Give any two of whole, a and b;
                                                               the third is worked out (a + b = whole always holds)
              "compare"    {a: 12, b: 5}                       two tapes; how many more is the unknown
              "times"      {unit: 8, times: 3, names: ["Ann", "Ben"], ask: "total" | "unit"}   "3 times as many"
              "equation"   {units: 4, extra: 3, total: 23, x: "x"}   4x + 3 = 23
              "fraction"   {of: 24, n: 3, d: 4}                3/4 of 24
       unknown: "b"        for partwhole: "a", "b" or "whole"; for compare: "a", "b" or "diff"
       names: ["Ann","Ben"]  labels for the tapes (compare and times)
       tapes / braces      your own diagram: tapes: [{parts: [5, 7], labels: ["5", "?"], name: "Ann"}],
                           braces: [{tape: 0, from: 0, to: 2, label: "12"}]  (from/to are part numbers; up: false puts it below)
     "Next step" reveals the solution one step at a time.                                                             */
  def('tapediagram', function (el, o) {
    var S = shell(el, o, { name: 'tapediagram', label: 'A tape diagram', touch: 'manipulation', height: 180 });
    var md = o.model || (o.tapes ? 'custom' : 'partwhole'), names = o.names || [], stp = 0, D2 = { tapes: [], braces: [], steps: [] };
    function N(v, d) { return num(v, d); }
    function build() {
      var T = [], B = [], steps = [], s = stp;
      if (md === 'partwhole') {
        // any two of whole, a, b decide the third; with fewer, the missing ones fall back to 12 = 5 + 7
        var hw = o.whole != null, ha = o.a != null, hb = o.b != null, wh, a, b, unk = o.unknown || 'b';
        if (ha && hb) { a = N(o.a, 5); b = N(o.b, 7); wh = a + b; }
        else if (hw && ha) { wh = N(o.whole, 12); a = N(o.a, 5); b = wh - a; }
        else if (hw && hb) { wh = N(o.whole, 12); b = N(o.b, 7); a = wh - b; }
        else if (hw) { wh = N(o.whole, 12); a = wh > 1 ? M.max(1, M.round(wh * 5 / 12)) : wh / 2; b = wh - a; }
        else { a = N(o.a, 5); b = N(o.b, 7); wh = a + b; }
        T.push({ parts: [a, b], labels: [unk === 'a' && !s ? '?' : f(a), unk === 'b' && !s ? '?' : f(b)], cols: ['green', 'blue'], q: [unk === 'a' && !s, unk === 'b' && !s] });
        B.push({ tape: 0, from: 0, to: 2, label: unk === 'whole' && !s ? '?' : f(wh), up: true });
        steps = [unk === 'whole' ? 'The parts are ' + f(a) + ' and ' + f(b) + '. The whole is unknown.' : 'The whole is ' + f(wh) + '. One part is ' + f(unk === 'a' ? b : a) + '. The other part is unknown.',
          unk === 'whole' ? 'Put the parts together: ' + f(a) + ' + ' + f(b) + ' = <b>' + f(wh) + '</b>.' : 'The missing part is the whole minus the known part: ' + f(wh) + ' − ' + f(unk === 'a' ? b : a) + ' = <b>' + f(unk === 'a' ? a : b) + '</b>.'];
      } else if (md === 'compare') {
        var A = N(o.a, 12), Bv = N(o.b, 5), u2 = o.unknown || 'diff', big = M.max(A, Bv), sm = M.min(A, Bv);
        T.push({ parts: [A], labels: [u2 === 'a' && !s ? '?' : f(A)], cols: ['green'], name: names[0] || 'A', q: [u2 === 'a' && !s] });
        T.push({ parts: A >= Bv ? [Bv] : [A, Bv - A], labels: A >= Bv ? [u2 === 'b' && !s ? '?' : f(Bv)] : [f(A), u2 === 'diff' && !s ? '?' : f(Bv - A)], cols: A >= Bv ? ['blue'] : ['blue', 'gold'], name: names[1] || 'B', dash: A >= Bv ? null : 1, q: [u2 === 'b' && !s] });
        if (A > Bv) { T[0].parts = [Bv, A - Bv]; T[0].labels = [u2 === 'a' && !s ? '?' : f(Bv), u2 === 'diff' && !s ? '?' : f(A - Bv)]; T[0].cols = ['green', 'gold']; T[0].q = [false, u2 === 'diff' && !s]; B.push({ tape: 0, from: 0, to: 2, label: u2 === 'a' && !s ? '?' : f(A), up: true }); }
        steps = ['Line the tapes up at the left. ' + (A === Bv ? 'They are the same length.' : 'The longer one has an extra piece.'), 'The difference is the extra piece: ' + f(big) + ' − ' + f(sm) + ' = <b>' + f(big - sm) + '</b>.'];
      } else if (md === 'times') {
        var un = N(o.unit, 8), tm = int(o.times, 3, 1, 12), ask = o.ask || 'total', p1 = [], l1 = [];
        for (var i = 0; i < tm; i++) { p1.push(un); l1.push(ask === 'unit' && !s ? '?' : f(un)); }
        T.push({ parts: [un], labels: [ask === 'unit' && !s ? '?' : f(un)], cols: ['green'], name: names[0] || 'A' });
        T.push({ parts: p1, labels: l1, cols: p1.map(function () { return 'blue'; }), name: names[1] || 'B' });
        B.push({ tape: 1, from: 0, to: tm, label: ask === 'total' && !s ? '?' : f(un * tm), up: false });
        steps = [(names[1] || 'B') + ' has ' + tm + ' times as much as ' + (names[0] || 'A') + ': ' + tm + ' boxes the same size.', ask === 'total' ? tm + ' boxes of ' + f(un) + ': ' + tm + ' × ' + f(un) + ' = <b>' + f(un * tm) + '</b>.' : 'Split ' + f(un * tm) + ' into ' + tm + ' equal boxes: ' + f(un * tm) + ' ÷ ' + tm + ' = <b>' + f(un) + '</b>.'];
      } else if (md === 'equation') {
        var nu = int(o.units, 4, 1, 12), ex = N(o.extra, 3), tot = N(o.total, 23), xv = (tot - ex) / nu, xn = o.x || 'x', pp = [], ll = [], cc = [];
        for (i = 0; i < nu; i++) { pp.push(xv); ll.push(s >= 2 ? f(xv) : xn); cc.push('blue'); }
        if (ex) { pp.push(M.abs(ex)); ll.push(f(ex)); cc.push(s >= 1 ? 'faded' : 'gold'); }
        T.push({ parts: pp, labels: ll, cols: cc });
        B.push({ tape: 0, from: 0, to: pp.length, label: f(tot), up: true });
        if (s >= 1) B.push({ tape: 0, from: 0, to: nu, label: f(tot - ex), up: false });
        steps = [nu + xn + (ex ? ' + ' + f(ex) : '') + ' = ' + f(tot) + ': ' + nu + ' equal boxes and ' + f(ex) + ' more make ' + f(tot) + '.', 'Take away the ' + f(ex) + ': ' + f(tot) + ' − ' + f(ex) + ' = ' + f(tot - ex) + '. The ' + nu + ' boxes alone make ' + f(tot - ex) + '.', 'Split ' + f(tot - ex) + ' into ' + nu + ' equal boxes: ' + f(tot - ex) + ' ÷ ' + nu + ' = ' + f(xv) + '.', '<b>' + xn + ' = ' + f(xv) + '</b>. Check: ' + nu + ' × ' + f(xv) + ' + ' + f(ex) + ' = ' + f(tot) + ' ✓'];
      } else if (md === 'fraction') {
        var of = N(o.of, 24), d = int(o.d, 4, 1, 12), n = int(o.n, 3, 0, d), ps = [], ls = [], cs = [];
        for (i = 0; i < d; i++) { ps.push(of / d); ls.push(s >= 1 ? f(of / d) : ''); cs.push(i < n ? 'green' : 'empty'); }
        T.push({ parts: ps, labels: ls, cols: cs });
        B.push({ tape: 0, from: 0, to: d, label: f(of), up: true });
        B.push({ tape: 0, from: 0, to: n, label: s >= 2 ? f(of / d * n) : '?', up: false });
        steps = ['Find ' + n + '/' + d + ' of ' + f(of) + ': cut the whole into ' + d + ' equal parts and take ' + n + '.', 'Each part is ' + f(of) + ' ÷ ' + d + ' = ' + f(of / d) + '.', n + ' parts: ' + n + ' × ' + f(of / d) + ' = <b>' + f(of / d * n) + '</b>. So ' + n + '/' + d + ' of ' + f(of) + ' is ' + f(of / d * n) + '.'];
      } else {
        T = (o.tapes || []).map(function (t) { return { parts: (t.parts || []).map(function (p) { return N(p, 1); }), labels: t.labels || (t.parts || []).map(function (p) { return String(p); }), cols: t.colors || (t.parts || []).map(function (p, i) { return BARC[i % BARC.length]; }), name: t.name }; });
        B = (o.braces || []).map(function (b) { return { tape: int(b.tape, 0), from: int(b.from, 0), to: int(b.to, 1), label: String(b.label || ''), up: b.up !== false }; });
        steps = o.steps || [];
      }
      D2 = { tapes: T, braces: B, steps: steps };
    }
    var G = {};
    function geo() {
      var w = S.c.w, named = D2.tapes.some(function (t) { return t.name; }), mxl = D2.tapes.reduce(function (m, t) { return M.max(m, t.parts.reduce(function (a, b) { return a + b; }, 0)); }, 0) || 1;
      var rowsUp = D2.braces.filter(function (b) { return b.up; }).length ? 32 : 6;
      G = { x0: named ? 64 : 12, x1: w - 14, th: 42, gap: 18, top: rowsUp + 6 }; G.u = (G.x1 - G.x0) / mxl;
      var downs = D2.braces.filter(function (b) { return !b.up; }).length;
      S.height(G.top + D2.tapes.length * (G.th + G.gap) + (downs ? 30 : 0) + 4);
    }
    function ty(i) { return G.top + i * (G.th + G.gap); }
    function px(t, j) { var x = G.x0; for (var i = 0; i < j; i++) x += t.parts[i] * G.u; return x; }
    function draw() {
      build(); geo(); var ctx = S.ctx, k = C(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      D2.tapes.forEach(function (t, i) {
        var y = ty(i);
        if (t.name) tx(ctx, t.name, G.x0 - 10, y + G.th / 2, { size: 13, wt: 700, al: 'right', col: k.muted });
        t.parts.forEach(function (p, j) {
          var x = px(t, j), w2 = p * G.u, cn = t.cols[j], col = cn === 'empty' ? null : cn === 'faded' ? k.muted : (k[cn] || cn);
          fillRR(ctx, x + 1, y, w2 - 2, G.th, 6, col ? soft(col, cn === 'faded' ? 0.15 : k.dark ? 0.5 : 0.35) : k.empty, col || k.line, 2);
          if (cn === 'faded') ln(ctx, x + 6, y + G.th - 6, x + w2 - 6, y + 6, k.muted, 2);
          var L = t.labels[j]; if (L) tx(ctx, L, x + w2 / 2, y + G.th / 2 + 1, { size: L === '?' ? 20 : 15, wt: 800, col: L === '?' ? k.gold : k.ink, halo: soft(k.bg, 0.5) });
        });
      });
      D2.braces.forEach(function (b) {
        var t = D2.tapes[b.tape]; if (!t) return; var x1 = px(t, b.from) + 2, x2 = px(t, M.min(b.to, t.parts.length)) - 2, y = b.up ? ty(b.tape) - 8 : ty(b.tape) + G.th + 8;
        brace(ctx, x1, x2, y, !b.up, k.ink, 1.6);
        tx(ctx, b.label, (x1 + x2) / 2, b.up ? y - 18 : y + 18, { size: b.label === '?' ? 17 : 14, wt: 800, col: b.label === '?' ? k.gold : k.ink, halo: k.bg });
      });
      say();
    }
    function say() { var st = D2.steps; if (!st.length) { S.say(''); return; } S.say(st.slice(0, stp + 1).map(function (x, i) { return (st.length > 1 ? (i + 1) + '. ' : '') + x; }).join('<br>')); bN.disabled = stp >= st.length - 1; bB.disabled = stp <= 0; }
    var row = S.row(), bN = V.button(row, 'Next step', function () { stp++; draw(); }, 'pri'), bB = V.button(row, 'Back', function () { stp = M.max(0, stp - 1); draw(); });
    build(); if (D2.steps.length < 2) row.hidden = true;
    S.live(draw); draw();
  });

  /* ================================================================ balance
     An equation as a balance scale. Each x is a bag with the same hidden weight; each 1 is a unit cube; a −1 is a
     balloon that pulls up. Do the same thing to both sides and the scale stays level. Do it to one side only and it tips.
     opts:
       eq: "3x + 2 = 11"     the equation (one letter; whole-number counts of x on each side; constants may be negative,
                             shown as balloons). "2x + 1 = x + 5" works too.
       x: auto               the hidden weight of one x (the solution is used when there is one)
       oneSide: true         also offer buttons that change one side only (to see the scale tip)
       showx: false          write the weight of x on each bag
       task: true            "Get x by itself on one side." (done when the scale is level and one side is a single x)
     Tap a bag, cube or balloon to take it off that side only.                                                       */
  function sideParse(s) {
    var out = { x: 0, n: 0, v: '' }, t = String(s).replace(/\s+/g, '').replace(/[−–]/g, '-'); if (!t) return out;
    var ok = true; t.replace(/(.)-/g, '$1+-').split('+').forEach(function (term) {
      if (!term) return; var m = term.match(/^(-?)(\d*)([a-z]?)$/i); if (!m || (!m[2] && !m[3])) { ok = false; return; }
      var c = (m[2] ? +m[2] : 1) * (m[1] ? -1 : 1); if (m[3]) { out.x += c; out.v = m[3]; } else out.n += c;
    });
    return ok ? out : null;
  }
  function sideText(sd, v) {
    var s = ''; if (sd.x) s = (sd.x === 1 ? '' : sd.x === -1 ? '−' : minus(sd.x)) + v;
    if (sd.n) s += s ? (sd.n > 0 ? ' + ' + sd.n : ' − ' + (-sd.n)) : minus(sd.n);
    return s || '0';
  }
  def('balance', function (el, o) {
    var S = shell(el, o, { name: 'balance', label: 'An equation shown as a balance scale', touch: 'manipulation', height: 270 });
    var parts = String(o.eq || '3x + 2 = 11').split('='), L0 = sideParse(parts[0]), R0 = sideParse(parts[1] || '0'), TT = taskOf(o);
    if (!L0 || !R0 || L0.x < 0 || R0.x < 0) { L0 = { x: 3, n: 2 }; R0 = { x: 0, n: 11 }; }
    var vr = L0.v || R0.v || 'x', xs = L0.x !== R0.x ? (R0.n - L0.n) / (L0.x - R0.x) : null, xw = o.x != null ? num(o.x, 1) : (xs !== null && isFinite(xs) ? xs : 3);
    var Ls = { x: L0.x, n: L0.n }, Rs = { x: R0.x, n: R0.n }, hist = [], ang = 0, angT = 0, anim = null, note = '', G = {};
    function w(sd) { return sd.x * xw + sd.n; }
    function eqText() { return sideText(Ls, vr) + ' = ' + sideText(Rs, vr); }
    function level() { return near(w(Ls), w(Rs), 1e-9); }
    function target() { var d = w(Rs) - w(Ls); var mx = M.min(0.3, 52 / (G.L / 2 || 200)); return clamp(d / (M.abs(w(Ls)) + M.abs(w(Rs)) + 1) * 0.7, -mx, mx); }
    function settle() { var a0 = ang, a1 = target(); if (anim) anim.stop(); anim = tween(near(a0, a1) ? 0 : 900, function (p) { ang = a0 + (a1 - a0) * (1 - M.cos(p * PI * 2.5) * M.exp(-p * 4)); draw(); }, function () { ang = a1; draw(); }); }
    function geo() { var W2 = S.c.w, pw = M.min(230, (W2 - 12) * 0.42), L = M.min(620, W2 - 12 - pw); G = { cx: W2 / 2, by: 70, L: L, pw: pw, hang: 52 }; S.height(222); }
    function ends() { var c = M.cos(ang), s = M.sin(ang), h = G.L / 2; return [[G.cx - h * c, G.by - h * s], [G.cx + h * c, G.by + h * s]]; }
    function items(sd, side) { // positions of bags, cubes and balloons on one pan
      var e = ends()[side], px = e[0], py = e[1] + G.hang, pw = G.pw, s = clamp(pw / 8, 14, 26), out = [], left = px - pw / 2 + 10, right = px + pw / 2 - 10, x = left, y = py - 3, rowH = 0;
      function put(kind, wd, ht) { if (x + wd > right) { x = left + (rowH ? 4 : 0); y -= rowH + 3; rowH = 0; } out.push({ k: kind, x: x, y: y - ht, w: wd, h: ht }); x += wd + 3; rowH = M.max(rowH, ht); }
      for (var i = 0; i < M.min(sd.x, 24); i++) put('x', s * 1.25, s * 1.25);
      for (i = 0; i < M.min(M.max(sd.n, 0), 40); i++) put('1', s * 0.8, s * 0.8);
      var top = y - rowH, nb = M.min(M.max(-sd.n, 0), 16), per = M.max(1, M.floor((pw - 20) / 24));
      for (i = 0; i < nb; i++) { var bx = left + (i % per) * 24, by = M.max(34, top - 40 - M.floor(i / per) * 28) + (i % 2) * 4; out.push({ k: 'b', x: bx, y: by, w: 21, h: 26, ax: bx + 10, ay: py - 2 }); }
      return out;
    }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), E = ends(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      var base = S.c.h - 14; poly(ctx, [[G.cx, G.by + 6], [G.cx - 40, base], [G.cx + 40, base]], k.dark ? '#2c4436' : '#e4ddc8', k.frame, 2);
      fillRR(ctx, G.cx - 70, base - 2, 140, 10, 5, k.frame);
      ctx.save(); ctx.strokeStyle = k.frame; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(E[0][0], E[0][1]); ctx.lineTo(E[1][0], E[1][1]); ctx.stroke(); ctx.restore();
      disc(ctx, G.cx, G.by, 7, k.gold, k.frame, 2);
      var lv = level(); ln(ctx, G.cx, G.by - 8, G.cx + 24 * M.sin(ang * 3), G.by - 30 * M.cos(ang * 3), lv ? k.green : k.red, 3);
      [Ls, Rs].forEach(function (sd, side) {
        var e = E[side], py = e[1] + G.hang, pw = G.pw;
        ln(ctx, e[0], e[1], e[0] - pw / 2 + 6, py, k.muted, 1.5); ln(ctx, e[0], e[1], e[0] + pw / 2 - 6, py, k.muted, 1.5);
        items(sd, side).forEach(function (it) {
          if (it.k === 'b') { ln(ctx, it.x + it.w / 2, it.y + it.h, it.ax, it.ay, k.muted, 1); ctx.save(); ctx.beginPath(); ctx.ellipse(it.x + it.w / 2, it.y + it.h / 2, it.w / 2, it.h / 2, 0, 0, TAU); ctx.fillStyle = k.redC; ctx.fill(); ctx.strokeStyle = k.redEdge; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); tx(ctx, '−1', it.x + it.w / 2, it.y + it.h / 2, { size: 10, wt: 800, col: '#fff' }); return; }
          if (it.k === 'x') { fillRR(ctx, it.x, it.y, it.w, it.h, it.w * 0.3, k.blueC, k.blueEdge, 1.5); tx(ctx, o.showx ? f(xw) : vr, it.x + it.w / 2, it.y + it.h / 2 + 1, { size: it.h * 0.55, wt: 800, col: '#fff', font: (o.showx ? '800 ' : 'italic 800 ') + M.round(it.h * 0.55) + 'px Georgia,serif' }); return; }
          fillRR(ctx, it.x, it.y, it.w, it.h, 3, k.yellow, k.yellowEdge, 1.2); tx(ctx, '1', it.x + it.w / 2, it.y + it.h / 2 + 1, { size: it.h * 0.6, wt: 800, col: k.dark ? '#3a2f08' : '#6b5200' });
        });
        ctx.save(); ctx.beginPath(); ctx.moveTo(e[0] - pw / 2, py - 2); ctx.quadraticCurveTo(e[0], py + 18, e[0] + pw / 2, py - 2); ctx.closePath(); ctx.fillStyle = k.dark ? '#5d7a68' : '#9fb3a6'; ctx.fill(); ctx.strokeStyle = k.frame; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
        if (sd.x > 24 || sd.n > 40 || -sd.n > 20) tx(ctx, '(' + sideText(sd, vr) + ')', e[0], py + 22, { size: 12, col: k.muted });
      });
      tx(ctx, eqText(), G.cx, 18, { font: 'italic 600 20px Georgia,serif', col: lv ? k.ink : k.red, halo: k.bg });
      P.sync(); say();
    }
    function solved() { return level() && ((Ls.x === 1 && !Ls.n && !Rs.x) || (Rs.x === 1 && !Rs.n && !Ls.x)); }
    function say() {
      var s = hist.concat([eqText()]).join(' &nbsp;→&nbsp; ');
      if (!level()) s += '<br><b>The scale tipped.</b> The two sides are no longer equal. Undo, then do the same thing to both sides.';
      else if (solved()) { var val = Ls.x ? Rs.n : Ls.n; s += '<br><b>' + vr + ' = ' + minus(val) + '</b>. Check: ' + sideText(L0, vr).replace(new RegExp('(\\d*)' + vr, 'g'), function (m0, c) { return (c ? c + ' · ' : '') + '(' + minus(val) + ')'; }) + ' = ' + minus(L0.x * val + L0.n) + ' and ' + sideText(R0, vr).replace(new RegExp('(\\d*)' + vr, 'g'), function (m0, c) { return (c ? c + ' · ' : '') + '(' + minus(val) + ')'; }) + ' = ' + minus(R0.x * val + R0.n) + ' ✓'; }
      else if (Ls.x === Rs.x && Ls.n === Rs.n) s += '<br>Both sides are the same, so the scale balances for <b>any</b> value of ' + vr + '.';
      else s += '<br>The scale is level. ' + (Ls.x && Rs.x ? 'Try taking ' + vr + ' away from both sides.' : 'Get ' + vr + ' by itself: undo the adding first, then split into equal groups.');
      if (note) s += '<br>' + note;
      S.say(s);
    }
    function apply(fnL, fnR, label) { hist.push(eqText()); if (hist.length > 6) hist.shift(); undo.push([{ x: Ls.x, n: Ls.n }, { x: Rs.x, n: Rs.n }, hist.slice()]); if (fnL) fnL(Ls); if (fnR) fnR(Rs); note = label || ''; settle(); if (tk) tk.update(); }
    var undo = [];
    function addN(v) { return function (sd) { sd.n += v; }; }
    function subX(sd) { sd.x -= 1; }
    ptr(S.c.cv, {
      tap: function (x, y) {
        for (var side = 0; side < 2; side++) { var sd = side ? Rs : Ls, its = items(sd, side); for (var i = its.length - 1; i >= 0; i--) { var it = its[i]; if (x >= it.x - 2 && x <= it.x + it.w + 2 && y >= it.y - 2 && y <= it.y + it.h + 2) {
          var fn = it.k === 'x' ? subX : it.k === '1' ? addN(-1) : addN(1); apply(side ? null : fn, side ? fn : null, 'You changed only the ' + (side ? 'right' : 'left') + ' side.'); return; } } }
      },
      over: function (x, y) { for (var side = 0; side < 2; side++) { var its = items(side ? Rs : Ls, side); for (var i = 0; i < its.length; i++) { var it = its[i]; if (x >= it.x && x <= it.x + it.w && y >= it.y && y <= it.y + it.h) return 'pointer'; } } return ''; }
    });
    var P = { sync: function () { } };
    var r1 = S.row(); var lab1 = V.el('span', 'mlb-lab', 'Both sides:'); r1.appendChild(lab1);
    V.button(r1, '+ 1', function () { apply(addN(1), addN(1)); }).setAttribute('aria-label', 'Add 1 to both sides');
    V.button(r1, '− 1', function () { apply(addN(-1), addN(-1)); }).setAttribute('aria-label', 'Take 1 from both sides');
    V.button(r1, '− ' + vr, function () { if (!Ls.x || !Rs.x) { note = 'Both sides need an ' + vr + ' bag to take one from each.'; say(); return; } apply(subX, subX); }).setAttribute('aria-label', 'Take ' + vr + ' from both sides');
    V.button(r1, '÷ both', function () {
      var k = Ls.x && !Rs.x ? Ls.x : Rs.x && !Ls.x ? Rs.x : gcd(gcd(Ls.x, Rs.x), gcd(Ls.n, Rs.n));
      if (k < 2 || [Ls.x, Ls.n, Rs.x, Rs.n].some(function (v) { return v % k; })) { note = Ls.x && Rs.x ? 'First get the ' + vr + ' bags onto one side.' : (Ls.n && Ls.x) || (Rs.n && Rs.x) ? 'First take the loose cubes or balloons away from the ' + vr + ' side.' : 'These can\'t be split into equal groups.'; say(); return; }
      apply(function (sd) { sd.x /= k; sd.n /= k; }, function (sd) { sd.x /= k; sd.n /= k; }, 'Both sides were split into ' + k + ' equal groups, keeping one group.');
    }, 'pri').setAttribute('aria-label', 'Divide both sides into equal groups');
    if (o.oneSide !== false) {
      var r2 = S.row(); r2.appendChild(V.el('span', 'mlb-lab', 'One side only:'));
      V.button(r2, 'Left − 1', function () { apply(addN(-1), null, 'You changed only the left side.'); });
      V.button(r2, 'Right − 1', function () { apply(null, addN(-1), 'You changed only the right side.'); });
    }
    var r3 = S.row();
    V.button(r3, 'Undo', function () { var u = undo.pop(); if (!u) return; Ls = u[0]; Rs = u[1]; hist = u[2]; hist.pop(); note = ''; settle(); if (tk) tk.update(); });
    V.button(r3, 'Start over', function () { Ls = { x: L0.x, n: L0.n }; Rs = { x: R0.x, n: R0.n }; hist = []; undo = []; note = ''; settle(); if (tk) tk.update(); });
    var tk = S.task({ text: 'Get ' + vr + ' by itself on one side, keeping the scale level.', ok: solved, hint: function () { return !level() ? 'The scale is tipped. Undo the last step.' : (Ls.x && Rs.x) ? 'There are ' + vr + ' bags on both sides. Take one from each side.' : 'Take away the loose cubes from the ' + vr + ' side (from both sides!), then split into equal groups.'; }, yes: function () { return vr + ' = ' + minus(Ls.x ? Rs.n : Ls.n) + '.'; } });
    geo(); ang = target(); S.live(draw); draw();
  });

  /* ================================================================ integerline
     Adding and subtracting signed numbers as moves on a number line. Adding a positive number moves right; adding a
     negative number moves left. Subtracting moves the opposite way, so −3 − (−5) is the same move as −3 + 5.
     opts:
       a: -3, b: -5, op: "-"     the problem a op b ("+" or "-")
       min, max                  the ends of the line (default: fits the problem, at least −10 to 10)
       edit: false               sliders for a and b and a +/− switch
       guess: false              drag a marker to where you think the answer is, then "Show the move" checks it
       task: true                with guess: "Where do you land?" (same as guess: true)                          */
  def('integerline', function (el, o) {
    var S = shell(el, o, { name: 'integerline', label: 'Adding and subtracting on a number line', touch: 'pan-y', height: 170 });
    var a = int(o.a, -3, -50, 50), b = int(o.b, -5, -50, 50), op = o.op === '+' ? '+' : '-', TT = taskOf(o), guessOn = !!(o.guess || TT), guess = M.max(int(o.min, -10), M.min(0, int(o.max, 10))), shown = !guessOn, prog = shown ? 1 : 0, anim = null, G = {};
    function res() { return op === '+' ? a + b : a - b; }
    function mv() { return op === '+' ? b : -b; }
    function range() {
      if (o.min != null || o.max != null) return [int(o.min, -10), int(o.max, 10)];
      if (o.edit) return [-20, 20];
      var lo = M.min(a, res(), 0, -10), hi = M.max(a, res(), 0, 10); return [lo - 1, hi + 1];
    }
    function geo() { var w = S.c.w, r = range(); G = { x0: 18, x1: w - 18, y: 104, lo: r[0], hi: r[1] }; S.height(150); }
    function X(v) { return G.x0 + (v - G.lo) / (G.hi - G.lo) * (G.x1 - G.x0); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), y = G.y, ppu = (G.x1 - G.x0) / (G.hi - G.lo); ctx.clearRect(0, 0, S.c.w, S.c.h);
      ctx.save(); ctx.fillStyle = soft(k.red, 0.06); ctx.fillRect(G.x0, y - 70, X(0) - G.x0, 90); ctx.fillStyle = soft(k.blue, 0.06); ctx.fillRect(X(0), y - 70, G.x1 - X(0), 90); ctx.restore();
      arw(ctx, G.x1 - 4, y, G.x1 + 12, y, k.ink, 2, 9); arw(ctx, G.x0 + 4, y, G.x0 - 12, y, k.ink, 2, 9); ln(ctx, G.x0, y, G.x1, y, k.ink, 2);
      var every = ppu >= 22 ? 1 : ppu >= 10 ? 2 : 5;
      for (var v = M.ceil(G.lo); v <= G.hi; v++) { var x = X(v); ln(ctx, x, y - (v ? 6 : 10), x, y + (v ? 6 : 10), v ? k.muted : k.ink, v ? 1.3 : 2.5); if (v % every === 0 || !v) tx(ctx, minus(v), x, y + 20, { size: 12, wt: v ? 500 : 800, col: v < 0 ? k.red : v > 0 ? k.blue : k.ink }); }
      // the move
      var m = mv(), xa = X(a), xe = X(a + m * prog), dir = m >= 0 ? 1 : -1;
      if (op === '-' && b !== 0) { var xg = X(a + b); ctx.save(); ctx.globalAlpha = 0.45; arw(ctx, xa, y - 52, xg, y - 52, k.muted, 2, 8, [5, 5]); ctx.restore(); tx(ctx, '+ (' + minus(b) + ') would go this way', (xa + xg) / 2, y - 63, { size: 11, col: k.muted, halo: k.bg }); }
      if (prog > 0 && m) {
        var steps = M.abs(m), done = M.abs(m) * prog;
        for (var i = 0; i < M.ceil(done - 1e-9); i++) { var u1 = X(a + dir * i), u2 = X(a + dir * M.min(i + 1, done)), hh = M.min(16, M.abs(u2 - u1) * 0.7 + 4); ctx.save(); ctx.strokeStyle = m > 0 ? k.blue : k.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(u1, y - 4); ctx.quadraticCurveTo((u1 + u2) / 2, y - 4 - hh * 2, u2, y - 4); ctx.stroke(); ctx.restore(); }
        arw(ctx, xa, y - 32, xe, y - 32, m > 0 ? k.blue : k.red, 3, 10);
        tx(ctx, (m > 0 ? '+' : '−') + M.abs(m), (xa + xe) / 2, y - 42, { size: 13, wt: 800, col: m > 0 ? k.blue : k.red, halo: k.bg });
      }
      disc(ctx, xa, y, 8, k.ink, k.bg, 2); tx(ctx, 'start', xa, y + 34, { size: 11, col: k.muted });
      if (prog >= 1) { disc(ctx, X(res()), y, 9, k.green, k.bg, 2.5); }
      if (guessOn) { var xg2 = X(guess); poly(ctx, [[xg2, y + 8], [xg2 - 9, y + 26], [xg2 + 9, y + 26]], k.gold, k.ink, 1.5); tx(ctx, 'guess', xg2, y + 36, { size: 11, wt: 700, col: k.gold }); }
      P.sync(); say();
    }
    function say() {
      var r = res(), pb = b < 0 ? '(' + minus(b) + ')' : String(b), s = '<b>' + minus(a) + ' ' + (op === '+' ? '+' : '−') + ' ' + pb + '</b>: start at ' + minus(a) + '. ';
      if (op === '+') s += b > 0 ? 'Adding ' + b + ' moves ' + b + ' to the right.' : b < 0 ? 'Adding ' + minus(b) + ' moves ' + (-b) + ' to the left.' : 'Adding 0 doesn\'t move.';
      else s += b > 0 ? 'Subtracting ' + b + ' moves ' + b + ' to the left (the same as adding ' + minus(-b) + ').' : b < 0 ? 'Subtracting ' + minus(b) + ' is the same as adding ' + (-b) + ': move ' + (-b) + ' to the right.' : 'Subtracting 0 doesn\'t move.';
      if (shown && prog >= 1) s += ' You land on <b>' + minus(r) + '</b>. &nbsp;' + minus(a) + ' ' + (op === '+' ? '+' : '−') + ' ' + pb + (op === '-' ? ' = ' + minus(a) + ' + ' + (-b < 0 ? '(' + minus(-b) + ')' : -b) : '') + ' = ' + minus(r);
      else if (guessOn) s += ' Drag the gold marker to where you think you land, then press "Show the move".';
      S.say(s);
    }
    function play() { shown = true; if (anim) anim.stop(); prog = 0; anim = tween(M.min(2400, 350 + 240 * M.abs(mv())), function (p) { prog = p; draw(); }, function () { prog = 1; draw(); if (tk) tk.update(); }); }
    if (guessOn) ptr(S.c.cv, { hit: function (x, y) { return M.abs(x - X(guess)) < 22 && y > G.y - 10 ? 'g' : null; }, move: function (h, x) { var v = clamp(M.round(G.lo + (x - G.x0) / (G.x1 - G.x0) * (G.hi - G.lo)), M.ceil(G.lo), M.floor(G.hi)); if (v !== guess) { guess = v; draw(); } }, tap: function (x, y, h) { if (h) return; guess = clamp(M.round(G.lo + (x - G.x0) / (G.x1 - G.x0) * (G.hi - G.lo)), M.ceil(G.lo), M.floor(G.hi)); draw(); } });
    var P = pads(S.stage, { list: function () { return guessOn ? [{ x: X(guess), y: G.y + 18, size: 34, label: 'Your guess: ' + minus(guess) + '. Left and right arrows move it.' }] : []; }, key: function (i, dx, dy) { guess = clamp(guess + (dx || dy), M.ceil(G.lo), M.floor(G.hi)); draw(); } });
    var row = S.row();
    V.button(row, 'Show the move', play, 'pri');
    if (o.edit) {
      var row2 = S.row();
      V.slider(row2, { label: 'a', min: -10, max: 10, step: 1, value: a, fmt: function (v) { return minus(v); }, input: function (v) { a = v; prog = 1; shown = true; draw(); } });
      V.seg(row2, { label: 'Add or subtract', items: [['+', '+'], ['-', '−']], value: op, change: function (v) { op = v; prog = 1; draw(); } });
      V.slider(row2, { label: 'b', min: -10, max: 10, step: 1, value: b, fmt: function (v) { return minus(v); }, input: function (v) { b = v; prog = 1; shown = true; draw(); } });
    }
    if (guessOn && !TT) S.o.task = true;
    var tk = guessOn ? S.task({ text: 'Where do you land? Drag the gold marker, then show the move.', ok: function () { return shown && prog >= 1 && guess === res(); }, hint: function () { return shown ? 'The move lands on ' + minus(res()) + '. Your guess was ' + minus(guess) + '.' : 'Press "Show the move" to check.'; }, yes: function () { return 'Your guess was right: ' + minus(res()) + '.'; } }) : null;
    S.live(draw); draw();
  });

  /* ---------------------------------------------------------------- polygon facts (shapes, geoboard) */
  function pdist2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
  function areaOf(P) { var s = 0; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  function angAt(P, i) { // interior angle at vertex i in degrees (polygon in either orientation)
    var n = P.length, a = P[(i + n - 1) % n], b = P[i], c = P[(i + 1) % n], v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
    var ang = M.atan2(v1[0] * v2[1] - v1[1] * v2[0], v1[0] * v2[0] + v1[1] * v2[1]) * 180 / PI, orient = areaOf(P) > 0 ? -1 : 1;
    var t = ang * orient; if (t < 0) t += 360; return t;
  }
  function polyFacts(P) {
    var n = P.length, L2 = [], i, j, eps = 1e-6;
    for (i = 0; i < n; i++) L2.push(pdist2(P[i], P[(i + 1) % n]));
    var angs = []; for (i = 0; i < n; i++) angs.push(angAt(P, i));
    var groups = [], gi = []; for (i = 0; i < n; i++) { var g = -1; for (j = 0; j < groups.length; j++) if (M.abs(L2[groups[j][0]] - L2[i]) <= eps * M.max(1, L2[i])) { g = j; break; } if (g < 0) { groups.push([i]); g = groups.length - 1; } else groups[g].push(i); gi.push(g); }
    var eqGroups = groups.filter(function (g) { return g.length > 1; });
    var par = []; for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) { if (n === 3) continue; var a = P[i], b = P[(i + 1) % n], c = P[j], d = P[(j + 1) % n], u = [b[0] - a[0], b[1] - a[1]], v = [d[0] - c[0], d[1] - c[1]]; if (M.abs(u[0] * v[1] - u[1] * v[0]) <= 1e-6 * M.sqrt((u[0] * u[0] + u[1] * u[1]) * (v[0] * v[0] + v[1] * v[1]))) par.push([i, j]); }
    var right = angs.map(function (x, k) { return M.abs(x - 90) < 0.01 ? k : -1; }).filter(function (k) { return k >= 0; });
    var concave = angs.some(function (x) { return x > 180.01; });
    // lines of symmetry: try lines through pairs of vertices and edge midpoints
    var cand = P.slice(), sym = []; for (i = 0; i < n; i++) cand.push([(P[i][0] + P[(i + 1) % n][0]) / 2, (P[i][1] + P[(i + 1) % n][1]) / 2]);
    var cx = 0, cy = 0; P.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= n; cy /= n;
    for (i = 0; i < cand.length; i++) for (j = i + 1; j < cand.length; j++) {
      var A = cand[i], B = cand[j], dx = B[0] - A[0], dy = B[1] - A[1], l = M.hypot(dx, dy); if (l < 1e-6) continue; dx /= l; dy /= l;
      if (M.abs((cx - A[0]) * dy - (cy - A[1]) * dx) > 1e-6) continue;
      var ok = P.every(function (p) { var t = (p[0] - A[0]) * dx + (p[1] - A[1]) * dy, fx = A[0] + t * dx, fy = A[1] + t * dy, r = [2 * fx - p[0], 2 * fy - p[1]]; return P.some(function (q) { return pdist2(q, r) < 1e-8; }); });
      if (ok && !sym.some(function (s) { return M.abs(s.dx * dy - s.dy * dx) < 1e-6; })) sym.push({ x: A[0], y: A[1], dx: dx, dy: dy });
    }
    var allEq = groups.length === 1, allAng = angs.every(function (x) { return M.abs(x - angs[0]) < 0.01; });
    return { n: n, L2: L2, angs: angs, gi: gi, eqGroups: eqGroups, par: par, right: right, concave: concave, sym: sym, allEq: allEq, regular: allEq && allAng && !concave };
  }
  var PNAMES = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon' };
  /* the most specific name first, then the other names that also fit */
  function classify(F, trap) {
    var n = F.n, out = [];
    if (n === 3) {
      var eq = F.allEq, iso = F.eqGroups.length > 0, mx = M.max.apply(null, F.angs);
      out.push((eq ? 'equilateral' : iso ? 'isosceles' : 'scalene') + ' triangle');
      out.push(M.abs(mx - 90) < 0.01 ? 'right triangle' : mx > 90 ? 'obtuse triangle' : 'acute triangle');
      if (eq) out.push('isosceles triangle');
      return out;
    }
    if (n === 4 && !F.concave) {
      var four = F.right.length === 4, allS = F.allEq, p2 = F.par.length >= 2, p1 = F.par.length >= 1;
      var kite = (M.abs(F.L2[0] - F.L2[1]) < 1e-6 && M.abs(F.L2[2] - F.L2[3]) < 1e-6) || (M.abs(F.L2[1] - F.L2[2]) < 1e-6 && M.abs(F.L2[3] - F.L2[0]) < 1e-6);
      if (four && allS) out.push('square'); if (four) out.push('rectangle'); if (allS) out.push('rhombus');
      if (p2) out.push('parallelogram');
      // a trapezoid has exactly one pair of parallel sides unless trap is 'inclusive' (then every parallelogram is one too);
      // a kite has two pairs of equal sides next to each other and is not a parallelogram (so a rhombus or square is not called a kite)
      if (p1 && (trap === 'inclusive' || !p2)) out.push('trapezoid');
      if (kite && !p2) out.push('kite');
      out.push('quadrilateral'); return out;
    }
    out.push((F.regular ? 'regular ' : '') + (PNAMES[n] || n + '-sided polygon'));
    if (F.concave) out.unshift('concave ' + (PNAMES[n] || 'polygon'));
    return out;
  }
  var SHAPES = {
    square: [[0, 0], [4, 0], [4, 4], [0, 4]], rectangle: [[0, 0], [6, 0], [6, 3], [0, 3]], rhombus: [[0, 0], [5, 0], [8, 4], [3, 4]],
    parallelogram: [[0, 0], [5, 0], [7, 3], [2, 3]], trapezoid: [[0, 0], [7, 0], [5, 3], [2, 3]], kite: [[3, 0], [5, 3], [3, 7], [1, 3]],
    quadrilateral: [[0, 0], [6, 1], [5, 4], [1, 3]], triangle: [[0, 0], [6, 0], [2, 4]], isosceles: [[0, 0], [6, 0], [3, 5]], scalene: [[0, 0], [7, 0], [2, 4]],
    right: [[0, 0], [6, 0], [0, 4]], obtuse: [[2, 0], [9, 0], [0, 3]], acute: [[0, 0], [6, 0], [4, 5]], equilateral: [[0, 0], [6, 0], [3, 3 * M.sqrt(3)]]
  };
  function regularPts(n, r) { var out = []; for (var i = 0; i < n; i++) { var a = PI / 2 + PI / n + i * TAU / n; out.push([r * M.cos(a), r * M.sin(a)]); } return out; }
  function shapePts(name) {
    if (Array.isArray(name)) return name.map(function (p) { return [num(p[0], 0), num(p[1], 0)]; });
    if (SHAPES[name]) return SHAPES[name].map(function (p) { return p.slice(); });
    var nn = { pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8 }[name]; if (nn) return regularPts(nn, 3.5);
    return null;
  }

  /* ---------------------------------------------------------------- simple 3D solids (shapes, nets) */
  function solidMesh(kind, d) {
    d = d || {}; var F = [], i, N = 36;
    function box(l, w, h) { var v = [[0, 0, 0], [l, 0, 0], [l, w, 0], [0, w, 0], [0, 0, h], [l, 0, h], [l, w, h], [0, w, h]]; return [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].map(function (f) { return { p: f.map(function (j) { return v[j]; }) }; }); }
    if (kind === 'cube') F = box(2, 2, 2);
    else if (kind === 'prism' || kind === 'rectangular prism') F = box(3, 1.6, 2);
    else if (kind === 'triprism' || kind === 'triangular prism') { var t = [[0, 0], [2.2, 0], [1.1, 1.9]], L = 3; F.push({ p: t.map(function (q) { return [q[0], 0, q[1]]; }) }); F.push({ p: t.slice().reverse().map(function (q) { return [q[0], L, q[1]]; }) }); for (i = 0; i < 3; i++) { var a = t[i], b = t[(i + 1) % 3]; F.push({ p: [[a[0], 0, a[1]], [a[0], L, a[1]], [b[0], L, b[1]], [b[0], 0, b[1]]] }); } }
    else if (kind === 'pyramid' || kind === 'square pyramid') { var ap = [1, 1, 2.2]; F.push({ p: [[0, 0, 0], [0, 2, 0], [2, 2, 0], [2, 0, 0]] }); [[0, 0], [2, 0], [2, 2], [0, 2]].forEach(function (q, j, arr) { var r = arr[(j + 1) % 4]; F.push({ p: [[q[0], q[1], 0], [r[0], r[1], 0], ap] }); }); }
    else if (kind === 'cylinder' || kind === 'cone') {
      var bot = [], top = []; for (i = 0; i < N; i++) { var aa = i * TAU / N; bot.push([1.1 * M.cos(aa), 1.1 * M.sin(aa), 0]); top.push([1.1 * M.cos(aa), 1.1 * M.sin(aa), 2.2]); }
      F.push({ p: bot.slice().reverse(), flat: 1 });
      if (kind === 'cylinder') { F.push({ p: top, flat: 1 }); for (i = 0; i < N; i++) F.push({ p: [bot[i], bot[(i + 1) % N], top[(i + 1) % N], top[i]], smooth: 1 }); }
      else for (i = 0; i < N; i++) F.push({ p: [bot[i], bot[(i + 1) % N], [0, 0, 2.4]], smooth: 1 });
    }
    return F;
  }
  var SOLID_FACTS = {
    cube: 'A cube has 6 square faces, 12 edges and 8 vertices. Every face is the same size.',
    prism: 'A rectangular prism has 6 rectangle faces, 12 edges and 8 vertices. Opposite faces match.',
    triprism: 'A triangular prism has 5 faces (2 triangles and 3 rectangles), 9 edges and 6 vertices.',
    pyramid: 'A square pyramid has 5 faces (1 square and 4 triangles), 8 edges and 5 vertices.',
    cylinder: 'A cylinder has 2 flat faces (circles) and 1 curved surface. It can roll, and it can stack.',
    cone: 'A cone has 1 flat face (a circle), 1 curved surface and 1 point at the top (its apex). It can roll.',
    sphere: 'A sphere is round all over: no flat faces, no edges, no vertices. It rolls every way.'
  };
  function draw3D(ctx, faces, view, o) { // faces: [{p: [[x,y,z]], col, smooth, flat}] in world units
    var R = rotYX(view.yaw, view.pitch), k = C(), light = norm3([-0.4, -0.6, 0.9]), list = [];
    faces.forEach(function (fc) {
      var pr = fc.p.map(function (p) { var q = R([p[0] - view.c[0], p[1] - view.c[1], p[2] - view.c[2]]); return [view.cx + q[0] * view.s, view.cy - q[1] * view.s, q[2]]; });
      var n3 = norm3(cross3(sub3(fc.p[1], fc.p[0]), sub3(fc.p[2], fc.p[0]))), dz = 0; pr.forEach(function (p) { dz += p[2]; });
      var a2 = 0; for (var i = 0; i < pr.length; i++) { var p = pr[i], q = pr[(i + 1) % pr.length]; a2 += p[0] * q[1] - q[0] * p[1]; }
      list.push({ pr: pr, z: dz / pr.length, n: n3, fc: fc, front: a2 < 0 });
    });
    list.sort(function (a, b) { return a.z - b.z; });
    list.forEach(function (it) {
      var lam = M.abs(it.n[0] * light[0] + it.n[1] * light[1] + it.n[2] * light[2]), base = it.fc.col || (k.dark ? '#5aa982' : '#7fd3a8');
      var fill = shadeHex(base.charAt(0) === '#' ? base : '#7fd3a8', 0.72 + 0.4 * lam);
      poly(ctx, it.pr.map(function (p) { return [p[0], p[1]]; }), fill, it.fc.smooth ? null : (o && o.edge) || (k.dark ? '#1b2b22' : '#24553c'), 1.6);
      if (it.fc.smooth) poly(ctx, it.pr.map(function (p) { return [p[0], p[1]]; }), null, fill, 1.2);
      if (it.fc.label && it.front !== undefined) { var cx = 0, cy = 0; it.pr.forEach(function (p) { cx += p[0]; cy += p[1]; }); tx(ctx, it.fc.label, cx / it.pr.length, cy / it.pr.length, { size: 12, wt: 700, col: '#14301f', halo: 'rgba(255,255,255,.55)' }); }
    });
    return list;
  }

  /* ================================================================ shapes
     Shapes and their attributes: sides, corners (vertices), right angles, equal sides, parallel sides and lines of
     symmetry, with the shape's names. Drag the corners and watch the name change. Also 3D solids that you can turn.
     opts:
       shape: "rectangle"   square, rectangle, rhombus, parallelogram, trapezoid, kite, quadrilateral, triangle,
                            equilateral, isosceles, scalene, right, acute, obtuse, pentagon, hexagon, heptagon, octagon,
                            circle, or your own corners: [[0,0],[5,0],[3,4]]
       gallery: []          several shapes to step through with Next and Back, e.g. ["triangle", "square", "circle"]
       solid: null          a 3D solid instead: cube, prism, triprism, pyramid, cylinder, cone, sphere (drag to turn it)
       show: ["equal", "right", "parallel"]   marks to start with; also "sides" (numbered), "corners", "symmetry",
                            "lengths", "angles". Learners can turn each on and off.
       drag: true           drag corners (they snap to the grid)
       turn: true           a "Turn it" button: a turned square is still a square
       trapezoid: "exclusive"   "exclusive" (default): exactly one pair of parallel sides; "inclusive": at least one pair
                            (then a parallelogram, rectangle, rhombus or square is listed as a trapezoid too). The readout
                            gives the most specific name first ("Square (also a rectangle, a rhombus, a parallelogram and a
                            quadrilateral)"); a kite is never a parallelogram, so a rhombus or square is not called a kite
       task: {target: "rectangle", not: "square"}   "Make a rectangle that is not a square." (drag the corners)      */
  def('shapes', function (el, o) {
    var S = shell(el, o, { name: 'shapes', kid: !o.solid && !o.task, label: o.solid ? 'A 3D solid' : 'A shape and its attributes', touch: 'none', height: 300 });
    var TT = taskOf(o), gal = o.gallery || null, gi = 0, name = gal ? gal[0] : (o.solid ? null : o.shape || 'rectangle'), solid = o.solid || null;
    var show = {}; (o.show || ['equal', 'right', 'parallel']).forEach(function (k) { show[k] = 1; });
    var pts, isCircle, rot = 0, view = { yaw: -0.6, pitch: 0.5 }, G = {}, drag = o.drag !== false;
    function load(nm) {
      solid = null; isCircle = false;
      if (['cube', 'prism', 'triprism', 'pyramid', 'cylinder', 'cone', 'sphere'].indexOf(nm) >= 0) { solid = nm; return; }
      if (nm === 'circle') { isCircle = true; pts = []; return; }
      pts = shapePts(nm) || shapePts('rectangle');
      var mnx = M.min.apply(null, pts.map(function (p) { return p[0]; })), mny = M.min.apply(null, pts.map(function (p) { return p[1]; }));
      var mxx = M.max.apply(null, pts.map(function (p) { return p[0]; })), mxy = M.max.apply(null, pts.map(function (p) { return p[1]; }));
      var ox = M.round(5 - (mnx + mxx) / 2), oy = M.round(4 - (mny + mxy) / 2); pts = pts.map(function (p) { return [p[0] + ox, p[1] + oy]; });
    }
    load(solid || name);
    function geo() { var w = S.c.w, h = clamp(w * 0.62, 240, 340); S.height(h); var u = M.min((w - 30) / 11, (h - 24) / 8.6); G = { u: u, ox: (w - 10 * u) / 2, oy: h / 2 + 4 * u }; }
    function P2(p) { return [G.ox + p[0] * G.u, G.oy - p[1] * G.u]; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      if (solid) {
        if (solid === 'sphere') { var r = M.min(S.c.w, S.c.h) * 0.33, cx = S.c.w / 2, cy = S.c.h / 2, g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r); g.addColorStop(0, k.dark ? '#a8e6c4' : '#d4f2e2'); g.addColorStop(1, k.dark ? '#2e6b4c' : '#4fae80'); disc(ctx, cx, cy, r, g, k.frame, 2); ctx.save(); ctx.strokeStyle = soft(k.frame, 0.5); ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.28 * M.cos(view.pitch) + 2, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
        else { var F = solidMesh(solid), all = []; F.forEach(function (fc) { all = all.concat(fc.p); }); var c = [0, 0, 0]; all.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); c = c.map(function (v) { return v / all.length; }); draw3D(ctx, F, { yaw: view.yaw, pitch: view.pitch, c: c, s: M.min(S.c.w, S.c.h) / 4.6, cx: S.c.w / 2, cy: S.c.h / 2 }); }
        tx(ctx, 'drag to turn', S.c.w - 8, S.c.h - 10, { size: 11, al: 'right', col: k.muted });
        say(); P.sync(); return;
      }
      for (var i = 0; i <= 10; i++) for (var j = 0; j <= 8; j++) { var q = P2([i, j]); disc(ctx, q[0], q[1], 1.8, k.grid); }
      if (isCircle) { var c0 = P2([5, 4]); disc(ctx, c0[0], c0[1], 3 * G.u, soft(k.green, 0.25), k.green, 3); if (show.symmetry) for (i = 0; i < 4; i++) { var a = i * PI / 4; ln(ctx, c0[0] - 3.4 * G.u * M.cos(a), c0[1] - 3.4 * G.u * M.sin(a), c0[0] + 3.4 * G.u * M.cos(a), c0[1] + 3.4 * G.u * M.sin(a), k.purple, 1.5, [6, 5]); } say(); P.sync(); return; }
      var cc = [0, 0]; pts.forEach(function (p) { cc[0] += p[0] / pts.length; cc[1] += p[1] / pts.length; });
      var R2 = pts.map(function (p) { var dx = p[0] - cc[0], dy = p[1] - cc[1], c = M.cos(rot), s = M.sin(rot); return [cc[0] + dx * c - dy * s, cc[1] + dx * s + dy * c]; });
      var F2 = polyFacts(R2), SP = R2.map(P2), n = SP.length;
      poly(ctx, SP, soft(k.green, k.dark ? 0.3 : 0.2), k.green, 3);
      if (show.symmetry) F2.sym.forEach(function (s) { var A = P2([s.x - s.dx * 20, s.y - s.dy * 20]), B = P2([s.x + s.dx * 20, s.y + s.dy * 20]); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, S.c.w, S.c.h); ctx.clip(); ln(ctx, A[0], A[1], B[0], B[1], k.purple, 1.6, [7, 5]); ctx.restore(); });
      for (i = 0; i < n; i++) {
        var A2 = SP[i], B2 = SP[(i + 1) % n], mx = (A2[0] + B2[0]) / 2, my = (A2[1] + B2[1]) / 2, dx = B2[0] - A2[0], dy = B2[1] - A2[1], L = M.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        if (show.sides) { tx(ctx, String(i + 1), mx - nx * 16 * (areaOf(R2) > 0 ? -1 : 1), my - ny * 16 * (areaOf(R2) > 0 ? -1 : 1), { size: 13, wt: 800, col: k.blue, halo: k.bg }); }
        if (show.equal && F2.eqGroups.length) { var gidx = F2.eqGroups.indexOf(F2.eqGroups.filter(function (g) { return g.indexOf(i) >= 0; })[0]); if (gidx >= 0) for (var t = 0; t <= gidx; t++) { var off = (t - gidx / 2) * 5; ln(ctx, mx + ux * off - nx * 7, my + uy * off - ny * 7, mx + ux * off + nx * 7, my + uy * off + ny * 7, k.ink, 2); } }
        if (show.parallel) F2.par.forEach(function (pp, pi) { if (pp.indexOf(i) < 0) return; for (var t = 0; t <= pi; t++) { var bx = mx + ux * (12 + t * 7), by = my + uy * (12 + t * 7); ln(ctx, bx - ux * 6 + nx * 5, by - uy * 6 + ny * 5, bx, by, k.orange, 2); ln(ctx, bx - ux * 6 - nx * 5, by - uy * 6 - ny * 5, bx, by, k.orange, 2); } });
        if (show.lengths) tx(ctx, rootText(F2.L2[i]).replace(/ ≈.*/, ''), mx - nx * 18 * (areaOf(R2) > 0 ? -1 : 1), my - ny * 18 * (areaOf(R2) > 0 ? -1 : 1), { size: 12, wt: 600, col: k.muted, halo: k.bg });
      }
      for (i = 0; i < n; i++) {
        var V0 = SP[i], Pv = SP[(i + n - 1) % n], Nx = SP[(i + 1) % n], a1 = M.atan2(Pv[1] - V0[1], Pv[0] - V0[0]), a2 = M.atan2(Nx[1] - V0[1], Nx[0] - V0[0]);
        if (show.right && F2.right.indexOf(i) >= 0) { var s1 = 12, p1 = [V0[0] + s1 * M.cos(a1), V0[1] + s1 * M.sin(a1)], p2 = [V0[0] + s1 * M.cos(a2), V0[1] + s1 * M.sin(a2)]; ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p1[0] + p2[0] - V0[0], p1[1] + p2[1] - V0[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke(); ctx.restore(); }
        if (show.angles) { var bis = M.atan2(M.sin(a1) + M.sin(a2), M.cos(a1) + M.cos(a2)), inside = F2.angs[i] > 180 ? -1 : 1; tx(ctx, f(F2.angs[i], 1) + '°', V0[0] + inside * 26 * M.cos(bis), V0[1] + inside * 26 * M.sin(bis), { size: 11, wt: 600, col: k.red, halo: k.bg }); }
        disc(ctx, V0[0], V0[1], show.corners ? 7 : drag ? 6 : 4, show.corners ? k.gold : k.green, k.bg, 2);
      }
      say(F2); P.sync();
    }
    function say(F2) {
      var s;
      if (solid) { s = SOLID_FACTS[solid] || ''; var nm = solid.replace('triprism', 'triangular prism').replace(/^prism$/, 'rectangular prism').replace('pyramid', 'square pyramid'); S.say('<b>' + nm[0].toUpperCase() + nm.slice(1) + '</b>. ' + s); return; }
      if (isCircle) { S.say('<b>Circle</b>. It has no straight sides and no corners: it is one curved line, the same distance from the center all the way around.' + (show.symmetry ? ' Every line through the center is a line of symmetry.' : '')); return; }
      var names = classify(F2, o.trapezoid), n = F2.n;
      var also = names.slice(1).map(function (x) { return (/^[aeiou]/.test(x) ? 'an ' : 'a ') + x; });
      s = '<b>' + names[0][0].toUpperCase() + names[0].slice(1) + '</b>' + (also.length ? ' (also ' + (also.length > 1 ? also.slice(0, -1).join(', ') + ' and ' + also[also.length - 1] : also[0]) + ')' : '') + '.<br>';
      var bits = [n + ' sides', n + ' corners (vertices)'];
      if (F2.right.length) bits.push(plural(F2.right.length, 'right angle'));
      if (F2.par.length) bits.push(plural(F2.par.length, 'pair') + ' of parallel sides');
      if (F2.allEq) bits.push('all sides equal'); else if (F2.eqGroups.length) bits.push(F2.eqGroups.length === 1 ? F2.eqGroups[0].length + ' equal sides' : F2.eqGroups.length + ' pairs of equal sides');
      if (show.symmetry) bits.push(plural(F2.sym.length, 'line') + ' of symmetry');
      S.say(s + bits.join(', ') + '.');
    }
    var dragI = -1;
    if (o.solid || (gal && gal.some(function (g) { return ['cube', 'prism', 'triprism', 'pyramid', 'cylinder', 'cone', 'sphere'].indexOf(g) >= 0; }))) {
      var last = null;
      ptr(S.c.cv, { hit: function (x, y) { if (solid) return 'v'; if (!drag || isCircle) return null; for (var i = 0; i < pts.length; i++) { var q = P2(pts[i]); if (M.hypot(q[0] - x, q[1] - y) < 22) return i; } return null; },
        start: function (h, x, y) { last = [x, y]; },
        move: function (h, x, y) { if (h === 'v') { view.yaw += (x - last[0]) * 0.012; view.pitch = clamp(view.pitch + (y - last[1]) * 0.01, -0.2, 1.45); last = [x, y]; draw(); } else movePt(h, x, y); },
        end: function () { if (tk) tk.update(); } });
    } else ptr(S.c.cv, {
      hit: function (x, y) { if (!drag || isCircle) return null; var best = null, bd = 24; pts.forEach(function (p, i) { var q = P2(rotP(p)); var d = M.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = i; } }); return best; },
      move: function (h, x, y) { movePt(h, x, y); },
      end: function () { if (tk) tk.update(); }
    });
    function rotP(p) { if (!rot) return p; var cc = [0, 0]; pts.forEach(function (q) { cc[0] += q[0] / pts.length; cc[1] += q[1] / pts.length; }); var dx = p[0] - cc[0], dy = p[1] - cc[1], c = M.cos(rot), s = M.sin(rot); return [cc[0] + dx * c - dy * s, cc[1] + dx * s + dy * c]; }
    function bake() { if (!rot) return; pts = pts.map(rotP); rot = 0; }
    function movePt(i, x, y) { bake(); var nx = clamp(M.round((x - G.ox) / G.u), 0, 10), ny = clamp(M.round((G.oy - y) / G.u), 0, 8); if (pts.some(function (p, j) { return j !== i && p[0] === nx && p[1] === ny; })) return; if (pts[i][0] !== nx || pts[i][1] !== ny) { pts[i] = [nx, ny]; draw(); } }
    var P = pads(S.stage, {
      list: function () { if (solid) return [{ x: S.c.w / 2, y: S.c.h / 2, size: 60, label: 'Solid. Arrow keys turn it.' }]; if (!drag || isCircle) return []; return pts.map(function (p, i) { var q = P2(rotP(p)); return { x: q[0], y: q[1], size: 34, label: 'Corner ' + (i + 1) + ' at ' + f(p[0], 1) + ', ' + f(p[1], 1) + '. Arrow keys move it.' }; }); },
      key: function (i, dx, dy) { if (solid) { view.yaw += dx * 0.15; view.pitch = clamp(view.pitch + dy * 0.1, -0.2, 1.45); draw(); return; } bake(); var p = pts[i], nx = clamp(M.round(p[0]) + dx, 0, 10), ny = clamp(M.round(p[1]) + dy, 0, 8); if (!pts.some(function (q, j) { return j !== i && q[0] === nx && q[1] === ny; })) { pts[i] = [nx, ny]; draw(); if (tk) tk.update(); } }
    });
    var row = S.row();
    if (gal) {
      V.button(row, 'Back', function () { gi = (gi + gal.length - 1) % gal.length; rot = 0; load(gal[gi]); draw(); });
      V.button(row, 'Next shape', function () { gi = (gi + 1) % gal.length; rot = 0; load(gal[gi]); draw(); }, 'pri');
    }
    if (!o.solid) {
      if (o.turn !== false) V.button(row, 'Turn it', function () { if (solid || isCircle) { view.yaw += 0.5; draw(); return; } var r0 = rot; tween(600, function (p) { rot = r0 + p * PI / 6; draw(); }); });
      var row2 = S.row();
      [['sides', 'Sides'], ['corners', 'Corners'], ['right', 'Right angles'], ['equal', 'Equal sides'], ['parallel', 'Parallel sides'], ['symmetry', 'Symmetry'], ['lengths', 'Lengths'], ['angles', 'Angles']].forEach(function (z) {
        if ((z[0] === 'lengths' || z[0] === 'angles') && S.kid && !show[z[0]]) return;
        toggle(row2, z[1], !!show[z[0]], function (on) { if (on) show[z[0]] = 1; else delete show[z[0]]; draw(); });
      });
    }
    var tk = S.task({
      text: TT && ('Drag the corners to make a ' + TT.target + (TT.not ? ' that is not a ' + TT.not : '') + '.'),
      ok: function () { if (solid || isCircle) return false; var nm = classify(polyFacts(pts.map(rotP)), o.trapezoid); return nm.some(function (x) { return x.indexOf(TT.target) >= 0; }) && !(TT.not && nm.some(function (x) { return x.indexOf(TT.not) >= 0; })); },
      hint: function () { var nm = classify(polyFacts(pts.map(rotP)), o.trapezoid); return 'Right now it is a ' + nm[0] + '. ' + (nm.some(function (x) { return x.indexOf(TT.target) >= 0; }) ? 'It is a ' + TT.target + ', but it is also a ' + TT.not + '.' : 'Look at the marks: which sides should be equal or parallel?'); }
    });
    S.live(draw); draw();
  });

  /* ================================================================ geoboard
     A small dynamic-geometry board: points you drag (they snap to the grid), with segments, rays, lines, circles,
     polygons and angles that follow them, and live lengths, angles and areas.
     opts:
       points: {"A": [1, 1], "B": [6, 1], "C": [2, 5]}   named points (draggable unless listed in fixed)
       objects: [["poly", "A", "B", "C"], ["seg", "A", "B"], ["ray", "A", "B"], ["line", "A", "B"],
                 ["circle", "A", "B"] (center A, through B), ["angle", "B", "A", "C"] (the angle at A), ["mid", "M", "A", "B"]]
       fixed: []            points that can't be dragged (true, or drag: false, fixes them all: a still figure)
       xmin: 0, xmax: 10, ymin: 0, ymax: 8   the board (with axes: true, use negatives too)
       snap: 1              grid step for dragging (0.5 for half units, 0 for no snapping)
       grid: "dots"         "dots", "lines" or "none"
       axes: false          show x and y axes with numbers
       coords: false        show each point's coordinates
       show: {len: true, ang: true, area: true, per: false}   which measurements to show
       tools: false         true (or a list like ["point", "seg", "circle", "poly"]) adds tools to build new figures:
                            tap points to make segments, rays, lines, circles, polygons and angles; "move" drags
       task: {type: "area", target: 12}   types: "area" and "perimeter" (of polygon number obj, default the first),
             "length" (of a segment), "angle" (degrees, tol 0.5), "right" (a right angle in the first polygon);
             e.g. {type: "length", target: 5, text: "Make a segment of length 5 that is not flat."}                    */
  def('geoboard', function (el, o) {
    var allFixed = o.fixed === true || o.drag === false;
    var S = shell(el, o, { name: 'geoboard', label: allFixed ? 'A figure on a geometry board' : 'A geometry board with points you can drag', touch: allFixed && !o.tools ? 'pan-y' : 'none', height: 320 });
    var ax = !!o.axes, xmin = num(o.xmin, ax ? -6 : 0), xmax = num(o.xmax, ax ? 6 : 10), ymin = num(o.ymin, ax ? -5 : 0), ymax = num(o.ymax, ax ? 5 : 8), snap = o.snap != null ? num(o.snap, 1) : 1;
    var TT = taskOf(o), show = Object.assign(S.quiet ? { len: false, ang: false, area: false, per: false } : { len: true, ang: true, area: true, per: false }, o.show || {}), fixed = Array.isArray(o.fixed) ? o.fixed.slice() : []; // quiet: measures only when show asks
    var pts = {}, order = [], objs = [], mids = {};
    var src = o.points || (o.objects ? {} : { A: [2, 1], B: [8, 2], C: [4, 6] });
    Object.keys(src).forEach(function (nm) { pts[nm] = [num(src[nm][0], 0), num(src[nm][1], 0)]; order.push(nm); if (allFixed) fixed.push(nm); });
    (o.objects || (o.points ? [] : [['poly', 'A', 'B', 'C']])).forEach(function (ob) { if (ob[0] === 'mid') { mids[ob[1]] = [ob[2], ob[3]]; order.push(ob[1]); } else objs.push({ t: ob[0], p: ob.slice(1) }); });
    var tools = o.tools ? (Array.isArray(o.tools) ? o.tools : ['point', 'seg', 'ray', 'line', 'circle', 'poly', 'angle', 'delete']) : null, tool = 'move', pend = [], G = {};
    function P(nm) { if (mids[nm]) { var a = P(mids[nm][0]), b = P(mids[nm][1]); return a && b ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] : null; } return pts[nm]; }
    var c, pl;
    function geo() { var w = S.c.w, ar = (xmax - xmin) / (ymax - ymin), h = clamp(w / ar, 220, 520); if (h > 520) h = 520; S.height(M.min(h, w * 1.05)); pl.set({ xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, equal: true, pad: 16 }); }
    function len2(a, b) { var p = P(a), q = P(b); return pdist2(p, q); }
    function lenText(a, b) { var d2 = len2(a, b), isGrid = [P(a), P(b)].every(function (p) { return near(p[0] * 2, M.round(p[0] * 2)) && near(p[1] * 2, M.round(p[1] * 2)); }); return isGrid ? rootText(M.round(d2 * 4) / 4) : f(M.sqrt(d2)); }
    function angDeg(a, v, b) { var p = P(a), q = P(v), r = P(b), u = [p[0] - q[0], p[1] - q[1]], w2 = [r[0] - q[0], r[1] - q[1]]; return M.abs(M.atan2(u[0] * w2[1] - u[1] * w2[0], u[0] * w2[0] + u[1] * w2[1])) * 180 / PI; }
    function polyPts(ob) { return ob.p.map(P); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(); pl.clear();
      if (o.grid === 'lines') pl.grid({ step: snap >= 1 ? 1 : 1, minor: false });
      else if (o.grid !== 'none') for (var x = M.ceil(xmin); x <= xmax; x++) for (var y = M.ceil(ymin); y <= ymax; y++) disc(ctx, pl.X(x), pl.Y(y), 2.2, k.dark ? '#3e5a4a' : '#c4cfc8');
      if (ax) pl.axes({ step: 1 });
      var labels = [];
      objs.forEach(function (ob, oi) {
        var col = [k.blue, k.green, k.purple, k.orange, k.teal][oi % 5];
        if (ob.p.some(function (nm) { return !P(nm); })) return;
        if (ob.t === 'poly') { var pp = polyPts(ob); pl.poly(pp, { fill: soft(col, 0.16), color: col, width: 2.5 }); }
        else if (ob.t === 'seg') pl.seg(P(ob.p[0])[0], P(ob.p[0])[1], P(ob.p[1])[0], P(ob.p[1])[1], { color: col, width: 3 });
        else if (ob.t === 'ray' || ob.t === 'line') { var A = P(ob.p[0]), B = P(ob.p[1]), dx = B[0] - A[0], dy = B[1] - A[1], L = M.hypot(dx, dy) || 1, far = (xmax - xmin + ymax - ymin) * 2; pl.seg(ob.t === 'line' ? A[0] - dx / L * far : A[0], ob.t === 'line' ? A[1] - dy / L * far : A[1], A[0] + dx / L * far, A[1] + dy / L * far, { color: col, width: 2.5 }); }
        else if (ob.t === 'circle') pl.circle(P(ob.p[0])[0], P(ob.p[0])[1], M.sqrt(len2(ob.p[0], ob.p[1])), { color: col, width: 2.5, fill: soft(col, 0.08) });
        else if (ob.t === 'angle') {
          var Q = P(ob.p[1]), a1 = M.atan2(P(ob.p[0])[1] - Q[1], P(ob.p[0])[0] - Q[0]), a2 = M.atan2(P(ob.p[2])[1] - Q[1], P(ob.p[2])[0] - Q[0]), dd = a2 - a1; while (dd > PI) dd -= TAU; while (dd < -PI) dd += TAU;
          var deg = angDeg(ob.p[0], ob.p[1], ob.p[2]), r = 26, cx = pl.X(Q[0]), cy = pl.Y(Q[1]);
          pl.seg(Q[0], Q[1], P(ob.p[0])[0], P(ob.p[0])[1], { color: col, width: 2 }); pl.seg(Q[0], Q[1], P(ob.p[2])[0], P(ob.p[2])[1], { color: col, width: 2 });
          if (M.abs(deg - 90) < 0.05) { var e1 = [M.cos(a1), -M.sin(a1)], e2 = [M.cos(a2), -M.sin(a2)], s = 13; ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + e1[0] * s, cy + e1[1] * s); ctx.lineTo(cx + (e1[0] + e2[0]) * s, cy + (e1[1] + e2[1]) * s); ctx.lineTo(cx + e2[0] * s, cy + e2[1] * s); ctx.stroke(); ctx.restore(); }
          else { ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, -a1, -(a1 + dd), dd > 0); ctx.stroke(); ctx.restore(); }
          if (show.ang) { var bis = a1 + dd / 2; tx(ctx, f(deg, 1) + '°', cx + (r + 18) * M.cos(bis), cy - (r + 18) * M.sin(bis), { size: 12, wt: 700, col: k.red, halo: k.bg }); }
        }
        if (show.len && (ob.t === 'seg' || ob.t === 'poly')) { var edges = ob.t === 'seg' ? [[ob.p[0], ob.p[1]]] : ob.p.map(function (nm, i) { return [nm, ob.p[(i + 1) % ob.p.length]]; }); edges.forEach(function (e) { var a = P(e[0]), b = P(e[1]); labels.push([lenText(e[0], e[1]).replace(/ ≈ /, '≈'), pl.X((a[0] + b[0]) / 2), pl.Y((a[1] + b[1]) / 2), col]); }); }
        if (show.area && ob.t === 'poly' && ob.p.length >= 3) { var pp2 = polyPts(ob), cxp = 0, cyp = 0; pp2.forEach(function (p) { cxp += p[0] / pp2.length; cyp += p[1] / pp2.length; }); tx(ctx, 'Area ' + f(M.abs(areaOf(pp2))), pl.X(cxp), pl.Y(cyp), { size: 13, wt: 700, col: col, halo: k.bg }); }
      });
      labels.forEach(function (L) { tx(ctx, L[0], L[1], L[2] - 11, { size: 11.5, wt: 600, col: k.ink, halo: k.bg, haloW: 5 }); });
      order.forEach(function (nm) {
        var p = P(nm); if (!p) return; var free = !mids[nm] && fixed.indexOf(nm) < 0, sel = pend.indexOf(nm) >= 0, X = pl.X(p[0]), Y = pl.Y(p[1]);
        if (sel) disc(ctx, X, Y, 13, soft(k.gold, 0.4));
        disc(ctx, X, Y, free ? 7.5 : 5, free ? k.red : k.ink, k.bg, 2);
        tx(ctx, nm + (o.coords ? ' (' + f(p[0]) + ', ' + f(p[1]) + ')' : ''), X + 10, Y - 12, { size: 13, wt: 700, al: 'left', col: k.ink, halo: k.bg });
      });
      Pd.sync(); say();
    }
    function measures() {
      var out = [];
      objs.forEach(function (ob) {
        if (ob.p.some(function (nm) { return !P(nm); })) return;
        if (ob.t === 'seg') out.push(ob.p.join('') + ' = ' + lenText(ob.p[0], ob.p[1]));
        if (ob.t === 'circle') out.push('circle at ' + ob.p[0] + ', radius ' + ob.p.join('') + ' = ' + lenText(ob.p[0], ob.p[1]));
        if (ob.t === 'angle') out.push('∠' + ob.p.join('') + ' = ' + f(angDeg(ob.p[0], ob.p[1], ob.p[2]), 1) + '°');
        if (ob.t === 'poly') { var pp = polyPts(ob), per = 0; ob.p.forEach(function (nm, i) { per += M.sqrt(len2(nm, ob.p[(i + 1) % ob.p.length])); }); var bits = []; if (show.area) bits.push('area ' + f(M.abs(areaOf(pp)))); if (show.per) bits.push('perimeter ' + f(per)); if (show.ang && pp.length >= 3) bits.push('angles ' + pp.map(function (q, i) { return f(angAt(pp, i), 1) + '°'; }).join(', ')); out.push(ob.p.join('') + (pp.length >= 3 ? ' (' + classify(polyFacts(pp))[0] + ')' : '') + (bits.length ? ': ' + bits.join(', ') : '')); }
      });
      return out;
    }
    function movable() { return order.some(function (nm) { return pts[nm] && !mids[nm] && fixed.indexOf(nm) < 0; }); }
    function say() { var m = measures(), s = m.join('<br>'); if (tool !== 'move') s = '<span class="mlb-lab">' + toolHelp() + '</span>' + (s ? '<br>' + s : ''); S.say(s || (movable() ? 'Drag the points.' : tools ? 'Pick a tool to build on the figure.' : '')); }
    function toolHelp() { var need = { seg: 2, ray: 2, line: 2, circle: 2, angle: 3, poly: 0 }[tool]; if (tool === 'point') return 'Tap the board to add a point.'; if (tool === 'delete') return 'Tap a point to remove it (and anything built on it).'; if (tool === 'poly') return 'Tap corners in order; tap the first corner again to finish.' + (pend.length ? ' (' + pend.join('') + ' so far)' : ''); return 'Tap ' + need + ' points' + (tool === 'circle' ? ' (center first)' : tool === 'angle' ? ' (the corner second)' : '') + '.' + (pend.length ? ' Picked: ' + pend.join(', ') : ''); }
    function snapV(v, lo, hi) { if (snap > 0) v = M.round(v / snap) * snap; return clamp(+v.toFixed(6), lo, hi); }
    function nextName() { for (var i = 0; i < 26; i++) { var nm = String.fromCharCode(65 + i); if (!pts[nm] && !mids[nm]) return nm; } return 'P' + order.length; }
    function hitPt(x, y, freeOnly) { var best = null, bd = 22; order.forEach(function (nm) { var p = P(nm); if (!p) return; if (freeOnly && (mids[nm] || fixed.indexOf(nm) >= 0)) return; var d = M.hypot(pl.X(p[0]) - x, pl.Y(p[1]) - y); if (d < bd) { bd = d; best = nm; } }); return best; }
    function pick(nm) {
      if (tool === 'delete') { if (mids[nm]) delete mids[nm]; else delete pts[nm]; order = order.filter(function (q) { return q !== nm; }); objs = objs.filter(function (ob) { return ob.p.indexOf(nm) < 0; }); Object.keys(mids).forEach(function (m) { if (mids[m].indexOf(nm) >= 0) { delete mids[m]; order = order.filter(function (q) { return q !== m; }); } }); draw(); return; }
      if (tool === 'poly') { if (pend.length >= 3 && nm === pend[0]) { objs.push({ t: 'poly', p: pend.slice() }); pend = []; } else if (pend.indexOf(nm) < 0) pend.push(nm); draw(); return; }
      var need = { seg: 2, ray: 2, line: 2, circle: 2, angle: 3 }[tool]; if (!need) return;
      if (pend[pend.length - 1] !== nm) pend.push(nm);
      if (pend.length === need) { objs.push({ t: tool, p: pend.slice() }); pend = []; }
      draw(); if (tk) tk.update();
    }
    function addPoint(px, py) { var nm = nextName(); pts[nm] = [snapV(pl.x(px), xmin, xmax), snapV(pl.y(py), ymin, ymax)]; order.push(nm); return nm; }
    ptr(S.c.cv, {
      hit: function (x, y) { if (tool !== 'move') return null; return hitPt(x, y, true); },
      move: function (nm, x, y) { var nx = snapV(pl.x(x), xmin, xmax), ny = snapV(pl.y(y), ymin, ymax); if (pts[nm][0] !== nx || pts[nm][1] !== ny) { pts[nm] = [nx, ny]; draw(); } },
      end: function () { if (tk) tk.update(); },
      tap: function (x, y, h) {
        if (tool === 'move') return; var nm = hitPt(x, y, false);
        if (tool === 'point') { if (!nm) { addPoint(x, y); draw(); } return; }
        if (!nm && tool !== 'delete') nm = addPoint(x, y);
        if (nm) pick(nm); else draw();
      },
      over: function (x, y) { return tool !== 'move' ? 'crosshair' : ''; }
    });
    var Pd = pads(S.stage, {
      list: function () { return order.filter(function (nm) { return P(nm) && !mids[nm] && fixed.indexOf(nm) < 0; }).map(function (nm) { var p = P(nm); return { x: pl.X(p[0]), y: pl.Y(p[1]), size: 32, label: 'Point ' + nm + ' at ' + f(p[0]) + ', ' + f(p[1]) + '. Arrow keys move it' + (tools ? '; Enter picks it for the current tool.' : '.') }; }); },
      key: function (i, dx, dy, e) { var nm = order.filter(function (q) { return P(q) && !mids[q] && fixed.indexOf(q) < 0; })[i], st = snap > 0 ? snap : 0.1; if (e.shiftKey) st *= 5; pts[nm] = [clamp(+(pts[nm][0] + dx * st).toFixed(6), xmin, xmax), clamp(+(pts[nm][1] + dy * st).toFixed(6), ymin, ymax)]; draw(); if (tk) tk.update(); },
      act: function (i) { var nm = order.filter(function (q) { return P(q) && !mids[q] && fixed.indexOf(q) < 0; })[i]; if (tool !== 'move' && tool !== 'point') pick(nm); }
    });
    c = S.c; pl = V.plane(c, { xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax, equal: true, pad: 16 });
    var row = S.row();
    if (tools) {
      var TN = { move: 'Move', point: 'Point', seg: 'Segment', ray: 'Ray', line: 'Line', circle: 'Circle', poly: 'Polygon', angle: 'Angle', delete: 'Delete' };
      V.seg(row, { label: 'Tool', items: ['move'].concat(tools).map(function (t) { return [t, TN[t] || t]; }), value: 'move', change: function (v) { tool = v; pend = []; draw(); } });
      var row2 = S.row(); V.button(row2, 'Add a point', function () { var nm = nextName(), x = M.round((xmin + xmax) / 2), y = M.round((ymin + ymax) / 2), tries = 0; while (order.some(function (q) { var p = P(q); return p && p[0] === x && p[1] === y; }) && tries++ < 50) { x = clamp(x + 1, xmin, xmax); if (x === xmax) { x = M.ceil(xmin); y = clamp(y + 1, ymin, ymax); } } pts[nm] = [x, y]; order.push(nm); draw(); });
      V.button(row2, 'Clear the board', function () { pts = {}; order = []; objs = []; mids = {}; pend = []; draw(); if (tk) tk.update(); });
    }
    toggle(row, 'Lengths', show.len, function (on) { show.len = on; draw(); });
    toggle(row, 'Angles', show.ang, function (on) { show.ang = on; draw(); });
    toggle(row, 'Area', show.area, function (on) { show.area = on; draw(); });
    function objOf(t, idx) { var list = objs.filter(function (ob) { return ob.t === t && ob.p.every(function (nm) { return P(nm); }); }); return list[idx || 0]; }
    var tk = S.task({
      text: TT && ({ area: 'Make a shape with an area of ' + TT.target + '.', perimeter: 'Make a shape with a perimeter of ' + TT.target + '.', length: 'Make a segment of length ' + TT.target + '.', angle: 'Make an angle of ' + TT.target + '°.', right: 'Make a triangle with a right angle.' }[TT.type] || ''),
      ok: function () {
        var t = TT.type, ob;
        if (t === 'area' || t === 'perimeter' || t === 'right') { ob = objOf('poly', TT.obj); if (!ob) return false; var pp = polyPts(ob); if (t === 'area') return near(M.abs(areaOf(pp)), num(TT.target, 0), 1e-6); if (t === 'right') return polyFacts(pp).right.length > 0; var per = 0; ob.p.forEach(function (nm, i) { per += M.sqrt(len2(nm, ob.p[(i + 1) % ob.p.length])); }); return near(per, num(TT.target, 0), num(TT.tol, 1e-6)); }
        if (t === 'length') { ob = objOf('seg', TT.obj); return !!ob && near(M.sqrt(len2(ob.p[0], ob.p[1])), num(TT.target, 0), num(TT.tol, 1e-6)) && (!TT.slanted || (P(ob.p[0])[0] !== P(ob.p[1])[0] && P(ob.p[0])[1] !== P(ob.p[1])[1])); }
        if (t === 'angle') { ob = objOf('angle', TT.obj); return !!ob && near(angDeg(ob.p[0], ob.p[1], ob.p[2]), num(TT.target, 0), num(TT.tol, 0.5)); }
        return false;
      },
      hint: function () { var m = measures(); return 'Right now: ' + (m.join('; ') || 'nothing measured yet') + '.'; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ angle
     Angles: measure one with a protractor (and read the right scale), or explore angle pairs and the triangle sum.
     opts:
       mode: "measure"      "measure", "supp" (two angles on a line), "comp" (two angles in a right angle),
                            "vertical" (two crossing lines), "triangle" (angle sum, with "Tear off the corners"),
                            "transversal" (parallel lines cut by a transversal: corresponding, alternate … angles)
       deg: 50              the starting angle in degrees
       base: 0              (measure) direction of the fixed ray, in degrees (try 30 to practice lining up the protractor)
       protractor: true     (measure) show the protractor
       snap: 1              degrees per step when dragging
       reflex: false        (measure) allow angles past 180°
       turn: false          (measure) also give the angle as a fraction of a full turn (360°)
       pts: [[0,0],[6,0],[2,4]]   (triangle) the corners
       task: 135  or  {target: 135, tol: 1}  "Make a 135° angle."   or  {kind: "obtuse"}  "Make an obtuse angle."   */
  def('angle', function (el, o) {
    var mode = ['supp', 'comp', 'vertical', 'triangle', 'transversal'].indexOf(o.mode) >= 0 ? o.mode : 'measure';
    var S = shell(el, o, { name: 'angle', label: mode === 'triangle' ? 'The angles of a triangle' : 'Angles you can change', touch: 'none', height: 280 });
    var TT = taskOf(o), deg = num(o.deg, mode === 'triangle' ? 0 : mode === 'transversal' ? 60 : 50), base = num(o.base, 0), snp = num(o.snap, 1), G = {};
    var tri = (o.pts || [[0, 0], [6, 0], [2, 4]]).map(function (p) { return [num(p[0], 0), num(p[1], 0)]; }), tear = 0, pairSel = 'corr';
    function kindOf(d) { d = M.round(d * 1000) / 1000; return d === 0 ? 'zero' : d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : d === 180 ? 'straight' : 'reflex'; }
    function geo() { var w = S.c.w, h = mode === 'measure' ? clamp(w * 0.56, 230, 330) : clamp(w * 0.55, 240, 320); S.height(h); G = { w: w, h: h }; }
    function rayEnd(cx, cy, a, r) { return [cx + r * M.cos(a * PI / 180), cy - r * M.sin(a * PI / 180)]; }
    function arcDeg(ctx, cx, cy, r, a0, a1, col, fill) { ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -a0 * PI / 180, -a1 * PI / 180, a1 > a0); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.beginPath(); ctx.arc(cx, cy, r, -a0 * PI / 180, -a1 * PI / 180, a1 > a0); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), w = G.w, h = G.h; ctx.clearRect(0, 0, w, h);
      if (mode === 'measure') {
        var refl = !!o.reflex, ex = [0, 0, 0, 0]; // fit the half-turn (or full turn) the angle can sweep, starting at the base ray
        for (var sa = 0; sa <= (refl ? 360 : 180); sa += 5) { var ra = (base + sa) * PI / 180; ex[0] = M.min(ex[0], M.cos(ra)); ex[1] = M.max(ex[1], M.cos(ra)); ex[2] = M.min(ex[2], -M.sin(ra)); ex[3] = M.max(ex[3], -M.sin(ra)); }
        var R = M.min((w - 36) / (ex[1] - ex[0]), (h - 40) / (ex[3] - ex[2])), cx = 18 + (w - 36 - (ex[1] - ex[0]) * R) / 2 - ex[0] * R, cy = 14 + (h - 40 - (ex[3] - ex[2]) * R) / 2 - ex[2] * R;
        G.cx = cx; G.cy = cy; G.R = R;
        if (o.protractor !== false && deg <= 180.0001) {
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(-base * PI / 180);
          ctx.beginPath(); ctx.arc(0, 0, R * 0.98, PI, TAU); ctx.closePath(); ctx.fillStyle = k.dark ? 'rgba(116,192,252,.10)' : 'rgba(28,111,214,.07)'; ctx.fill(); ctx.strokeStyle = soft(k.blue, 0.6); ctx.lineWidth = 1.5; ctx.stroke();
          for (var d = 0; d <= 180; d++) { var a = -d * PI / 180, L = d % 10 === 0 ? 14 : d % 5 === 0 ? 9 : 5; if (R < 120 && d % 5) continue; ctx.strokeStyle = soft(k.blue, 0.75); ctx.lineWidth = d % 10 ? 1 : 1.5; ctx.beginPath(); ctx.moveTo(R * 0.98 * M.cos(a), R * 0.98 * M.sin(a)); ctx.lineTo((R * 0.98 - L) * M.cos(a), (R * 0.98 - L) * M.sin(a)); ctx.stroke(); }
          var every = R < 150 ? 30 : R < 220 ? 20 : 10;
          for (d = 0; d <= 180; d += every) { a = -(d + (d === 0 ? 5 : d === 180 ? -5 : 0)) * PI / 180; tx(ctx, String(d), (R * 0.98 - 26) * M.cos(a), (R * 0.98 - 26) * M.sin(a), { size: 11, wt: 700, col: k.blue }); tx(ctx, String(180 - d), (R * 0.98 - 44) * M.cos(a), (R * 0.98 - 44) * M.sin(a), { size: 10, col: k.muted }); }
          disc(ctx, 0, 0, 3, k.blue); ctx.restore();
        }
        var e1 = rayEnd(cx, cy, base, R), e2 = rayEnd(cx, cy, base + deg, R);
        arcDeg(ctx, cx, cy, 34, base, base + deg, k.red, soft(k.red, 0.15));
        if (kindOf(deg) === 'right') { var p1 = rayEnd(cx, cy, base, 16), p2 = rayEnd(cx, cy, base + 90, 16); ctx.save(); ctx.fillStyle = k.bg; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p1[0] + p2[0] - cx, p1[1] + p2[1] - cy); ctx.lineTo(p2[0], p2[1]); ctx.closePath(); ctx.fill(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
        arw(ctx, cx, cy, e1[0], e1[1], k.ink, 3, 11); arw(ctx, cx, cy, e2[0], e2[1], k.green, 3, 11);
        disc(ctx, e2[0], e2[1], 9, k.green, k.bg, 2.5); disc(ctx, cx, cy, 4.5, k.ink);
        var lb = rayEnd(cx, cy, base + deg / 2, 56); if (!S.quiet) tx(ctx, f(deg, 1) + '°', lb[0], lb[1], { size: 15, wt: 800, col: k.red, halo: k.bg });
      } else if (mode === 'supp' || mode === 'comp') {
        var cx2 = mode === 'supp' ? w / 2 : w * 0.3, cy2 = h - 40, R2 = M.min(mode === 'supp' ? w / 2 - 20 : w * 0.62, h - 70), top = mode === 'supp' ? 180 : 90;
        G.cx = cx2; G.cy = cy2; G.R = R2;
        var eA = rayEnd(cx2, cy2, 0, R2), eB = rayEnd(cx2, cy2, top, R2), eM = rayEnd(cx2, cy2, deg, R2);
        arcDeg(ctx, cx2, cy2, 40, 0, deg, k.red, soft(k.red, 0.15)); arcDeg(ctx, cx2, cy2, 52, deg, top, k.blue, soft(k.blue, 0.13));
        ln(ctx, cx2, cy2, eA[0], eA[1], k.ink, 3); ln(ctx, cx2, cy2, eB[0], eB[1], k.ink, 3); ln(ctx, cx2, cy2, eM[0], eM[1], k.green, 3); disc(ctx, eM[0], eM[1], 9, k.green, k.bg, 2.5);
        if (mode === 'comp') { var q1 = rayEnd(cx2, cy2, 0, 14), q2 = rayEnd(cx2, cy2, 90, 14); ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(q1[0], q1[1]); ctx.lineTo(q1[0] + q2[0] - cx2, q1[1] + q2[1] - cy2); ctx.lineTo(q2[0], q2[1]); ctx.stroke(); ctx.restore(); }
        var l1 = rayEnd(cx2, cy2, deg / 2, 72), l2 = rayEnd(cx2, cy2, (deg + top) / 2, 84);
        tx(ctx, '∠1' + (S.quiet ? '' : ' = ' + f(deg) + '°'), l1[0], l1[1], { size: 13, wt: 800, col: k.red, halo: k.bg }); tx(ctx, '∠2' + (S.quiet ? '' : ' = ' + f(top - deg) + '°'), l2[0], l2[1], { size: 13, wt: 800, col: k.blue, halo: k.bg });
      } else if (mode === 'vertical') {
        var cx3 = w / 2, cy3 = h / 2, R3 = M.min(w / 2 - 20, h / 2 - 12); G.cx = cx3; G.cy = cy3; G.R = R3;
        var cols = [k.red, k.blue, k.red, k.blue], angs = [0, deg, 180, 180 + deg];
        for (var i = 0; i < 4; i++) { var a0 = angs[i], a1 = i < 3 ? angs[i + 1] : 360; arcDeg(ctx, cx3, cy3, 30 + (i % 2) * 8, a0, a1, cols[i], soft(cols[i], 0.13)); var lp = rayEnd(cx3, cy3, (a0 + a1) / 2, 62 + (i % 2) * 8); tx(ctx, '∠' + (i + 1) + (S.quiet ? '' : ' = ' + f(a1 - a0) + '°'), lp[0], lp[1], { size: 12.5, wt: 800, col: cols[i], halo: k.bg }); }
        var f1 = rayEnd(cx3, cy3, 0, R3), f2 = rayEnd(cx3, cy3, 180, R3), g1 = rayEnd(cx3, cy3, deg, R3), g2 = rayEnd(cx3, cy3, deg + 180, R3);
        ln(ctx, f1[0], f1[1], f2[0], f2[1], k.ink, 3); ln(ctx, g1[0], g1[1], g2[0], g2[1], k.green, 3); disc(ctx, g1[0], g1[1], 9, k.green, k.bg, 2.5);
      } else if (mode === 'triangle') {
        var xs = tri.map(function (p) { return p[0]; }), ys = tri.map(function (p) { return p[1]; }), mnx = M.min.apply(null, xs), mxx = M.max.apply(null, xs), mny = M.min.apply(null, ys), mxy = M.max.apply(null, ys);
        var u = M.min((w - 60) / M.max(6, mxx - mnx), (h - 130) / M.max(4, mxy - mny)); G.u = u; G.ox = (w - (mxx - mnx) * u) / 2 - mnx * u; G.oy = 30 + mxy * u;
        var SP = tri.map(function (p) { return [G.ox + p[0] * u, G.oy - p[1] * u]; }), cl = [k.red, k.blue, k.gold], Q = [w / 2, h - 26], acc = 0;
        poly(ctx, SP, soft(k.green, 0.12), k.green, 2.5);
        ln(ctx, 20, Q[1], w - 20, Q[1], k.muted, 1.5, [5, 5]);
        var AA = tri.map(function (p, i) { return angAt(tri, i); }), orient = areaOf(tri) > 0 ? 1 : -1;
        SP.forEach(function (V0, i) {
          var nx = SP[(i + 1) % 3], pv = SP[(i + 2) % 3], dn = M.atan2(-(nx[1] - V0[1]), nx[0] - V0[0]) * 180 / PI, dp = M.atan2(-(pv[1] - V0[1]), pv[0] - V0[0]) * 180 / PI;
          var start = orient > 0 ? dn : dp, ang = AA[i], tgt = acc, rotd = tgt - start; while (rotd > 180) rotd -= 360; while (rotd < -180) rotd += 360; acc += ang;
          var px = lerp(V0[0], Q[0], tear), py = lerp(V0[1], Q[1], tear), st = start + rotd * tear;
          arcDeg(ctx, px, py, M.min(30, u * 1.2) * (1 + tear * 0.6), st, st + ang, cl[i], soft(cl[i], 0.35));
          if (tear < 0.05 && !S.quiet) { var lp2 = rayEnd(V0[0], V0[1], start + ang / 2, M.min(30, u * 1.2) + 18); tx(ctx, f(ang, 1) + '°', lp2[0], lp2[1], { size: 12, wt: 800, col: cl[i], halo: k.bg }); }
          disc(ctx, V0[0], V0[1], 7, k.green, k.bg, 2);
        });
      } else if (mode === 'transversal') {
        var y1 = h * 0.32, y2 = h * 0.7, mid = w / 2, t = deg * PI / 180, dx = (y2 - y1) / M.tan(t), x1 = mid + dx / 2, x2 = mid - dx / 2; G.x1 = x1; G.x2 = x2; G.y1 = y1; G.y2 = y2;
        ln(ctx, 10, y1, w - 10, y1, k.ink, 2.5); ln(ctx, 10, y2, w - 10, y2, k.ink, 2.5);
        arw(ctx, w * 0.12, y1, w * 0.12 + 12, y1, k.orange, 2, 8); arw(ctx, w * 0.12, y2, w * 0.12 + 12, y2, k.orange, 2, 8);
        var ext = 400, ux = M.cos(t), uy = M.sin(t);
        ln(ctx, x2 - ux * ext, y2 + uy * ext, x1 + ux * ext, y1 - uy * ext, k.green, 3);
        var aT = deg, angsT = [aT, 180 - aT, aT, 180 - aT], dirs = [[0, aT], [aT, 180], [180, 180 + aT], [180 + aT, 360]], pairs = { corr: [[0, 4], [1, 5], [2, 6], [3, 7]], altint: [[3, 5], [2, 4]], altext: [[0, 6], [1, 7]], same: [[3, 4], [2, 5]] }, hl = {};
        (pairs[pairSel] || []).forEach(function (pp, pi) { hl[pp[0]] = pi + 1; hl[pp[1]] = pi + 1; });
        [[x1, y1], [x2, y2]].forEach(function (P0, j) {
          dirs.forEach(function (dd, i) { var n = j * 4 + i, on = hl[n], col = on ? [k.red, k.blue, k.purple, k.orange][(on - 1) % 4] : k.muted; arcDeg(ctx, P0[0], P0[1], 22, dd[0], dd[1], col, on ? soft(col, 0.25) : null); var lp3 = rayEnd(P0[0], P0[1], (dd[0] + dd[1]) / 2, 38); tx(ctx, String(n + 1), lp3[0], lp3[1], { size: 12, wt: 800, col: on ? col : k.muted, halo: k.bg }); });
        });
        var hd = M.min(90, (y1 - 14) / M.max(0.2, uy)); disc(ctx, x1 + ux * hd, y1 - uy * hd, 9, k.green, k.bg, 2.5); G.hx = x1 + ux * hd; G.hy = y1 - uy * hd;
      }
      P.sync(); say();
    }
    function say() {
      var s;
      if (mode === 'measure') {
        var kd = kindOf(deg); s = 'The angle is <b>' + f(deg, 1) + '°</b>: ' + (kd === 'right' ? 'a right angle (a square corner)' : kd === 'straight' ? 'a straight angle (a straight line)' : kd === 'zero' ? 'a zero angle' : 'an ' + (kd === 'obtuse' || kd === 'acute' ? '' : '') + kd + ' angle').replace('an reflex', 'a reflex') + '.';
        if (o.protractor !== false && deg <= 180 && deg > 0 && deg < 180) s += ' Read the scale that starts at 0 on the fixed ray (blue numbers). The other scale would say ' + f(180 - deg, 1) + '°.';
        if (o.turn) s += ' That is ' + qH(rat(M.round(deg), 360)) + ' of a full turn.';
      } else if (mode === 'supp') s = '∠1 + ∠2 = ' + f(deg) + '° + ' + f(180 - deg) + '° = <b>180°</b>. Two angles that make a straight line are <b>supplementary</b>.';
      else if (mode === 'comp') s = '∠1 + ∠2 = ' + f(deg) + '° + ' + f(90 - deg) + '° = <b>90°</b>. Two angles that make a right angle are <b>complementary</b>.';
      else if (mode === 'vertical') s = 'Vertical angles are equal: <b>∠1 = ∠3 = ' + f(deg) + '°</b> and <b>∠2 = ∠4 = ' + f(180 - deg) + '°</b>. Angles side by side add to 180°: ' + f(deg) + '° + ' + f(180 - deg) + '° = 180°.';
      else if (mode === 'triangle') { var A = tri.map(function (p, i) { return angAt(tri, i); }); s = f(A[0], 1) + '° + ' + f(A[1], 1) + '° + ' + f(A[2], 1) + '° = <b>' + f(A[0] + A[1] + A[2], 1) + '°</b>. ' + (tear > 0.95 ? 'Torn off and put together, the three corners make a straight line: 180°.' : 'Drag the corners: the sum stays 180°.'); }
      else { var names = { corr: 'Corresponding angles are equal (same position at each crossing): ∠1 = ∠5 = ' + f(deg) + '°, ∠2 = ∠6 = ' + f(180 - deg) + '°.', altint: 'Alternate interior angles are equal: ∠4 = ∠6 = ' + f(180 - deg) + '°, ∠3 = ∠5 = ' + f(deg) + '°.', altext: 'Alternate exterior angles are equal: ∠1 = ∠7 = ' + f(deg) + '°, ∠2 = ∠8 = ' + f(180 - deg) + '°.', same: 'Same-side interior angles add to 180°: ∠4 + ∠5 = ' + f(180 - deg) + '° + ' + f(deg) + '° = 180°.' }; s = names[pairSel] + ' This works because the two lines are parallel.'; }
      S.say(s);
    }
    function setDeg(v) { var lo = mode === 'measure' ? 0 : 1, hi = mode === 'measure' ? (o.reflex ? 360 : 180) : mode === 'supp' ? 179 : mode === 'comp' ? 89 : mode === 'transversal' ? 165 : 179; if (mode === 'transversal') lo = 15; v = clamp(M.round(v / snp) * snp, lo, hi); if (v !== deg) { deg = v; draw(); } }
    var dragTri = -1;
    ptr(S.c.cv, {
      hit: function (x, y) {
        if (mode === 'triangle') { if (tear > 0.02) return null; for (var i = 0; i < 3; i++) { var q = [G.ox + tri[i][0] * G.u, G.oy - tri[i][1] * G.u]; if (M.hypot(q[0] - x, q[1] - y) < 24) return i; } return null; }
        if (mode === 'transversal') return M.hypot(x - G.hx, y - G.hy) < 26 || M.abs(y - (G.y1 + G.y2) / 2) < 40 ? 'r' : null;
        return M.hypot(x - G.cx, y - G.cy) > 24 ? 'r' : null;
      },
      move: function (h, x, y) {
        if (mode === 'triangle') { var nx = M.round((x - G.ox) / G.u), ny = M.round((G.oy - y) / G.u), cand = tri.slice(); cand[h] = [nx, ny]; if (M.abs(areaOf(cand)) > 0.5 && (nx !== tri[h][0] || ny !== tri[h][1])) { tri = cand; draw(); } return; }
        if (mode === 'transversal') { var a = M.atan2((G.y1 + G.y2) / 2 - y, x - S.c.w / 2) * 180 / PI; if (a < 0) a += 180; setDeg(a); return; }
        var ang = M.atan2(G.cy - y, x - G.cx) * 180 / PI - (mode === 'measure' ? base : 0); if (mode === 'vertical') { if (ang < 0) ang += 180; } else { ang = ((ang % 360) + 360) % 360; if (mode !== 'measure' || !o.reflex) { if (ang > 270) ang = 0; else if (ang > 180) ang = 180; } }
        setDeg(ang);
      },
      end: function () { if (tk) tk.update(); }
    });
    var P = pads(S.stage, {
      list: function () {
        if (mode === 'triangle') return tri.map(function (p, i) { return { x: G.ox + p[0] * G.u, y: G.oy - p[1] * G.u, size: 32, hide: tear > 0.02, label: 'Corner ' + 'ABC'[i] + '. Arrow keys move it.' }; });
        if (mode === 'transversal') return [{ x: G.hx, y: G.hy, size: 34, label: 'Transversal at ' + f(deg) + ' degrees. Arrow keys turn it.' }];
        var e = rayEnd(G.cx, G.cy, (mode === 'measure' ? base : 0) + deg, G.R); return [{ x: e[0], y: e[1], size: 34, label: 'Angle ' + f(deg) + ' degrees. Arrow keys change it; Shift for 15 degrees.' }];
      },
      key: function (i, dx, dy, e) {
        if (mode === 'triangle') { var cand = tri.slice(); cand[i] = [tri[i][0] + dx, tri[i][1] + dy]; if (M.abs(areaOf(cand)) > 0.5) { tri = cand; draw(); } return; }
        setDeg(deg + (dx || dy) * (e.shiftKey ? 15 : M.max(1, snp))); if (tk) tk.update();
      }
    });
    var row = S.row();
    if (mode === 'triangle') { var bt = V.button(row, 'Tear off the corners', function () { var t0 = tear, t1 = tear > 0.5 ? 0 : 1; bt.textContent = t1 ? 'Put them back' : 'Tear off the corners'; tween(1300, function (p) { tear = lerp(t0, t1, p); draw(); }); }, 'pri'); }
    if (mode === 'transversal') V.seg(row, { label: 'Angle pairs', items: [['corr', 'Corresponding'], ['altint', 'Alternate interior'], ['altext', 'Alternate exterior'], ['same', 'Same-side interior']], value: pairSel, change: function (v) { pairSel = v; draw(); } });
    if (mode === 'measure') { V.button(row, '− 1°', function () { setDeg(deg - 1); if (tk) tk.update(); }); V.button(row, '+ 1°', function () { setDeg(deg + 1); if (tk) tk.update(); }); }
    var tk = S.task({
      text: TT && (TT.kind ? 'Make ' + (TT.kind === 'obtuse' || TT.kind === 'acute' ? 'an ' : 'a ') + TT.kind + ' angle.' : 'Make a ' + TT.target + '° angle.'),
      ok: function () { return TT.kind ? kindOf(deg) === TT.kind : near(deg, num(TT.target, 0), num(TT.tol, 0.5)); },
      hint: function () { if (TT.kind) return 'This one is ' + kindOf(deg) + '. ' + ({ acute: 'Acute angles are less than 90°.', right: 'A right angle is exactly 90°.', obtuse: 'Obtuse angles are between 90° and 180°.', straight: 'A straight angle is 180°.', reflex: 'Reflex angles are more than 180°.' }[TT.kind] || ''); var t = num(TT.target, 0); return 'You are at ' + f(deg) + '°. ' + (deg < t ? 'Open it ' + f(t - deg) + '° more.' : 'Close it ' + f(deg - t) + '°.'); }
    });
    S.live(draw); draw();
  });

  /* ================================================================ transform
     A shape and its image under a translation, reflection, rotation or dilation, with the coordinate rule.
     opts:
       shape: [[1,1],[4,1],[1,3]]   the corners of the figure (labeled A, B, C …)
       t: "translate"               "translate", "reflect", "rotate" or "dilate"
       dx: 3, dy: -2                translate by (dx, dy)
       line: "y-axis"               reflect over "x-axis", "y-axis", "y=x", "y=-x", "x=2", "y=-1" …
       angle: 90, center: [0, 0]    rotate counterclockwise by 90, 180 or 270 degrees about center
       k: 2, center: [0, 0]         dilate by scale factor k about center
       pick: true                   let learners choose the transformation and change its numbers
       range: 10                    the grid runs from −range to range
       drag: true                   drag the corners of the original figure
       task: {target: [[-1,1],[-4,1],[-1,3]]}   "Move the figure onto the dashed outline." (any matching rule counts) */
  def('transform', function (el, o) {
    var S = shell(el, o, { name: 'transform', label: 'A transformation on the coordinate plane', touch: 'none', height: 360 });
    var rg = int(o.range, 10, 4, 20), pts = (o.shape || [[1, 1], [4, 1], [1, 3]]).map(function (p) { return [num(p[0], 0), num(p[1], 0)]; }), TT = taskOf(o);
    var st = { t: ['translate', 'reflect', 'rotate', 'dilate'].indexOf(o.t) >= 0 ? o.t : 'translate', dx: int(o.dx, 3), dy: int(o.dy, -2), line: o.line || 'y-axis', angle: int(o.angle, 90), k: num(o.k, 2), cx: o.center ? num(o.center[0], 0) : 0, cy: o.center ? num(o.center[1], 0) : 0 };
    var tP = 1, anim = null, G = {}, pl, tgt = TT && TT.target ? TT.target.map(function (p) { return [num(p[0], 0), num(p[1], 0)]; }) : null;
    function lineOf() { var L = String(st.line).replace(/\s+/g, ''), m; if (L === 'x-axis' || L === 'y=0') return { a: 0, b: 1, c: 0 }; if (L === 'y-axis' || L === 'x=0') return { a: 1, b: 0, c: 0 }; if (L === 'y=x') return { a: 1, b: -1, c: 0 }; if (L === 'y=-x') return { a: 1, b: 1, c: 0 }; if ((m = L.match(/^x=(-?[\d.]+)$/))) return { a: 1, b: 0, c: -num(m[1], 0) }; if ((m = L.match(/^y=(-?[\d.]+)$/))) return { a: 0, b: 1, c: -num(m[1], 0) }; return { a: 1, b: 0, c: 0 }; }
    function img(p, t) {
      t = t === undefined ? 1 : t; var x = p[0], y = p[1];
      if (st.t === 'translate') return [x + st.dx * t, y + st.dy * t];
      if (st.t === 'reflect') { var L = lineOf(), d = (L.a * x + L.b * y + L.c) / (L.a * L.a + L.b * L.b); return [x - 2 * t * d * L.a, y - 2 * t * d * L.b]; }
      if (st.t === 'rotate') { var a = st.angle * t * PI / 180, c = M.cos(a), s = M.sin(a), X = x - st.cx, Y = y - st.cy, r = [st.cx + X * c - Y * s, st.cy + X * s + Y * c]; return t === 1 ? [M.round(r[0] * 1e9) / 1e9, M.round(r[1] * 1e9) / 1e9] : r; }
      var kk = 1 + (st.k - 1) * t; return [st.cx + kk * (x - st.cx), st.cy + kk * (y - st.cy)];
    }
    function sgn(v) { return v < 0 ? ' − ' + f(-v) : ' + ' + f(v); }
    function rule() {
      if (st.t === 'translate') return '(x, y) → (x' + (st.dx ? sgn(st.dx) : '') + ', y' + (st.dy ? sgn(st.dy) : '') + ')';
      if (st.t === 'reflect') { var L = String(st.line).replace(/\s+/g, ''), m; if (L === 'x-axis') return '(x, y) → (x, −y)'; if (L === 'y-axis') return '(x, y) → (−x, y)'; if (L === 'y=x') return '(x, y) → (y, x)'; if (L === 'y=-x') return '(x, y) → (−y, −x)'; if ((m = L.match(/^x=(-?[\d.]+)$/))) return '(x, y) → (' + f(2 * num(m[1], 0)) + ' − x, y)'; if ((m = L.match(/^y=(-?[\d.]+)$/))) return '(x, y) → (x, ' + f(2 * num(m[1], 0)) + ' − y)'; }
      if (st.t === 'rotate') { var a = ((st.angle % 360) + 360) % 360, o0 = !st.cx && !st.cy; if (o0) return a === 90 ? '(x, y) → (−y, x)' : a === 180 ? '(x, y) → (−x, −y)' : a === 270 ? '(x, y) → (y, −x)' : '(x, y) → (x, y)'; return 'turn ' + a + '° counterclockwise about (' + f(st.cx) + ', ' + f(st.cy) + ')'; }
      if (st.t === 'dilate') return !st.cx && !st.cy ? '(x, y) → (' + f(st.k) + 'x, ' + f(st.k) + 'y)' : 'scale by ' + f(st.k) + ' from (' + f(st.cx) + ', ' + f(st.cy) + ')';
      return '';
    }
    function geo() { var w = S.c.w; S.height(M.min(w, 520)); pl.set({ xmin: -rg, xmax: rg, ymin: -rg, ymax: rg, equal: true, pad: 10 }); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(); pl.clear(); pl.grid({ step: 1, minor: false }); pl.axes({ step: rg > 10 ? 5 : 2 });
      var im = pts.map(function (p) { return img(p); }), mv = pts.map(function (p) { return img(p, tP); });
      if (tgt) pl.poly(tgt, { color: k.gold, width: 2.5, dash: [7, 5], fill: soft(k.gold, 0.12) });
      if (st.t === 'reflect') { var L = lineOf(); if (L.b === 0) pl.seg(-L.c / L.a, -rg, -L.c / L.a, rg, { color: k.purple, width: 2.5, dash: [8, 5] }); else pl.seg(-rg, (-L.c - L.a * -rg) / L.b, rg, (-L.c - L.a * rg) / L.b, { color: k.purple, width: 2.5, dash: [8, 5] }); }
      if (st.t === 'rotate' || st.t === 'dilate') pl.point(st.cx, st.cy, { color: k.purple, r: 6 });
      pts.forEach(function (p, i) {
        var q = im[i];
        if (st.t === 'translate') pl.arrow(p[0], p[1], q[0], q[1], { color: soft(k.purple, 0.55), width: 1.6, head: 8 });
        else if (st.t === 'reflect') pl.seg(p[0], p[1], q[0], q[1], { color: soft(k.purple, 0.5), width: 1.4, dash: [3, 4] });
        else if (st.t === 'dilate') { var far = 1.3; pl.seg(st.cx, st.cy, st.cx + (q[0] - st.cx) * far, st.cy + (q[1] - st.cy) * far, { color: soft(k.purple, 0.4), width: 1.2, dash: [3, 4] }); }
        else if (st.t === 'rotate') { var r = M.hypot(p[0] - st.cx, p[1] - st.cy), a0 = M.atan2(p[1] - st.cy, p[0] - st.cx); ctx.save(); ctx.strokeStyle = soft(k.purple, 0.45); ctx.setLineDash([3, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(pl.X(st.cx), pl.Y(st.cy), r * pl.unit, -a0, -(a0 + st.angle * PI / 180), true); ctx.stroke(); ctx.restore(); }
      });
      pl.poly(pts, { color: k.blue, width: 2.5, fill: soft(k.blue, 0.18) });
      pl.poly(im, { color: k.green, width: 2.5, fill: soft(k.green, 0.12), dash: tP < 1 ? [6, 5] : [] });
      if (tP < 1) pl.poly(mv, { color: k.green, width: 2.5, fill: soft(k.green, 0.25) });
      pts.forEach(function (p, i) { pl.point(p[0], p[1], { color: k.blue, r: o.drag === false ? 4 : 6.5 }); pl.text(String.fromCharCode(65 + i), p[0], p[1], { dx: 8, dy: -10, bold: true, color: k.blue, size: 13 }); var q = im[i]; pl.point(q[0], q[1], { color: k.green, r: 4 }); pl.text(String.fromCharCode(65 + i) + '′', q[0], q[1], { dx: 8, dy: -10, bold: true, color: k.green, size: 13 }); });
      P.sync(); say();
    }
    function pt(p) { return '(' + f(p[0]) + ', ' + f(p[1]) + ')'; }
    function say() {
      var im = pts.map(function (p) { return img(p); }), s = '<b>' + rule() + '</b><br>' + pts.map(function (p, i) { var L = String.fromCharCode(65 + i); return L + pt(p) + ' → ' + L + '′' + pt(im[i]); }).join(', &nbsp;');
      s += '<br>' + (st.t === 'dilate' ? (near(st.k, 1) ? 'A scale factor of 1 changes nothing.' : 'Every length is multiplied by ' + f(st.k) + '; the angles stay the same, so the image is similar (same shape, ' + (st.k > 1 ? 'bigger' : 'smaller') + ').') : 'The image is congruent: same size and shape' + (st.t === 'reflect' ? ', but flipped (the corners go around the other way).' : '.'));
      S.say(s);
    }
    function snapP(v) { return clamp(M.round(v), -rg, rg); }
    ptr(S.c.cv, {
      hit: function (x, y) { if (o.drag === false) return null; var best = null, bd = 22; pts.forEach(function (p, i) { var d = M.hypot(pl.X(p[0]) - x, pl.Y(p[1]) - y); if (d < bd) { bd = d; best = i; } }); return best; },
      move: function (i, x, y) { var nx = snapP(pl.x(x)), ny = snapP(pl.y(y)); if (nx !== pts[i][0] || ny !== pts[i][1]) { pts[i] = [nx, ny]; draw(); } },
      end: function () { if (tk) tk.update(); }
    });
    var P = pads(S.stage, { list: function () { return o.drag === false ? [] : pts.map(function (p, i) { return { x: pl.X(p[0]), y: pl.Y(p[1]), size: 30, label: 'Corner ' + String.fromCharCode(65 + i) + ' at ' + f(p[0]) + ', ' + f(p[1]) + '. Arrow keys move it.' }; }); }, key: function (i, dx, dy) { pts[i] = [snapP(pts[i][0] + dx), snapP(pts[i][1] + dy)]; draw(); if (tk) tk.update(); } });
    pl = V.plane(S.c, { xmin: -rg, xmax: rg, ymin: -rg, ymax: rg, equal: true, pad: 10 });
    var row = S.row(), row2 = S.row(), ctl = {};
    function play() { if (anim) anim.stop(); tP = 0; anim = tween(1400, function (p) { tP = p; draw(); }, function () { tP = 1; draw(); }); }
    V.button(row, 'Show the motion', play, 'pri');
    function build() {
      row2.innerHTML = '';
      if (o.pick === false) return;
      if (st.t === 'translate') { V.slider(row2, { label: 'Right/left (x)', min: -10, max: 10, step: 1, value: st.dx, fmt: function (v) { return minus(v); }, input: function (v) { st.dx = v; tP = 1; draw(); if (tk) tk.update(); } }); V.slider(row2, { label: 'Up/down (y)', min: -10, max: 10, step: 1, value: st.dy, fmt: function (v) { return minus(v); }, input: function (v) { st.dy = v; tP = 1; draw(); if (tk) tk.update(); } }); }
      if (st.t === 'reflect') V.seg(row2, { label: 'Mirror line', items: [['x-axis', 'x-axis'], ['y-axis', 'y-axis'], ['y=x', 'y = x'], ['y=-x', 'y = −x']].concat(['x-axis', 'y-axis', 'y=x', 'y=-x'].indexOf(st.line) < 0 ? [[st.line, st.line]] : []), value: st.line, change: function (v) { st.line = v; tP = 1; draw(); if (tk) tk.update(); } });
      if (st.t === 'rotate') V.seg(row2, { label: 'Turn', items: [['90', '90°'], ['180', '180°'], ['270', '270°']], value: String(st.angle), change: function (v) { st.angle = +v; tP = 1; draw(); if (tk) tk.update(); } });
      if (st.t === 'dilate') V.slider(row2, { label: 'Scale factor k', min: 0.25, max: 3, step: 0.25, value: st.k, input: function (v) { st.k = v; tP = 1; draw(); if (tk) tk.update(); } });
    }
    if (o.pick !== false) V.seg(row, { label: 'Transformation', items: [['translate', 'Slide'], ['reflect', 'Flip'], ['rotate', 'Turn'], ['dilate', 'Resize']], value: st.t, change: function (v) { st.t = v; tP = 1; build(); draw(); if (tk) tk.update(); } });
    build();
    var tk = S.task({
      text: 'Move the figure onto the dashed outline.',
      ok: function () { if (!tgt) return false; var im = pts.map(function (p) { return img(p); }); return tgt.length === im.length && tgt.every(function (q) { return im.some(function (p) { return near(p[0], q[0], 1e-6) && near(p[1], q[1], 1e-6); }); }); },
      hint: function () { return 'Not yet. Is the outline the same size? Is it flipped or turned? Compare A′ with the corner where it should land.'; },
      yes: function () { return rule() + ' does it.'; }
    });
    S.live(draw); draw();
  });

  /* ================================================================ pythagoras
     The Pythagorean theorem as areas: the squares on the two legs together have the same area as the square on the
     hypotenuse. "Rearrange" slides four copies of the triangle inside a big square to prove it.
     opts:
       a: 3, b: 4          the legs (whole or half units, up to 12)
       view: "squares"     "squares" (squares on the sides, with unit squares to count) or "proof" (the rearranging proof)
       angle: false        (squares) a slider for the angle between the legs: the rule only works at 90°
       task: {target: 13}  "Make the hypotenuse exactly 13." (whole-number legs)                                    */
  def('pythagoras', function (el, o) {
    var S = shell(el, o, { name: 'pythagoras', label: 'Squares on the sides of a right triangle', touch: 'none', height: 330 });
    var a = num(o.a, 3), b = num(o.b, 4), view = o.view === 'proof' ? 'proof' : 'squares', th = 90, tp = 0, anim = null, TT = taskOf(o), G = {};
    function c2() { return a * a + b * b - 2 * a * b * M.cos(th * PI / 180); }
    function draw() {
      var w = S.c.w, h = clamp(w * 0.75, 280, 440); S.height(h); var ctx = S.ctx, k = C(); ctx.clearRect(0, 0, w, h);
      if (view === 'squares') {
        var t = th * PI / 180, Cc = [0, 0], A = [a, 0], B = [b * M.cos(t), b * M.sin(t)], tri = [Cc, A, B], cen = [(A[0] + B[0]) / 3, (A[1] + B[1]) / 3];
        function sqOn(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1], n1 = [-dy, dx], mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; if ((mid[0] - cen[0]) * n1[0] + (mid[1] - cen[1]) * n1[1] < 0) n1 = [dy, -dx]; return [p, q, [q[0] + n1[0], q[1] + n1[1]], [p[0] + n1[0], p[1] + n1[1]]]; }
        var sqs = [sqOn(Cc, A), sqOn(Cc, B), sqOn(A, B)], all = []; sqs.forEach(function (s) { all = all.concat(s); });
        var xs = all.map(function (p) { return p[0]; }), ys = all.map(function (p) { return p[1]; }), mnx = M.min.apply(null, xs), mxx = M.max.apply(null, xs), mny = M.min.apply(null, ys), mxy = M.max.apply(null, ys);
        var u = M.min((w - 20) / (mxx - mnx), (h - 20) / (mxy - mny)); G.u = u; G.ox = (w - (mxx - mnx) * u) / 2 - mnx * u; G.oy = (h + (mxy - mny) * u) / 2 + mny * u;
        function T(p) { return [G.ox + p[0] * u, G.oy - p[1] * u]; }
        var cols = [k.blue, k.red, k.green], labs = ['a² = ' + f(a * a), 'b² = ' + f(b * b), 'c² = ' + f(c2())];
        sqs.forEach(function (s, i) {
          var sp = s.map(T); poly(ctx, sp, soft(cols[i], 0.2), cols[i], 2);
          var side = i === 0 ? a : i === 1 ? b : M.sqrt(c2());
          if (Number.isInteger(side) && side <= 15 && (i < 2 || near(th, 90))) { ctx.save(); ctx.strokeStyle = soft(cols[i], 0.45); ctx.lineWidth = 1; ctx.beginPath(); for (var j = 1; j < side; j++) { var p1 = [lerp(s[0][0], s[1][0], j / side), lerp(s[0][1], s[1][1], j / side)], p2 = [lerp(s[3][0], s[2][0], j / side), lerp(s[3][1], s[2][1], j / side)], q1 = [lerp(s[0][0], s[3][0], j / side), lerp(s[0][1], s[3][1], j / side)], q2 = [lerp(s[1][0], s[2][0], j / side), lerp(s[1][1], s[2][1], j / side)]; [[p1, p2], [q1, q2]].forEach(function (L) { var A1 = T(L[0]), B1 = T(L[1]); ctx.moveTo(A1[0], A1[1]); ctx.lineTo(B1[0], B1[1]); }); } ctx.stroke(); ctx.restore(); }
          var cx = 0, cy = 0; sp.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; }); tx(ctx, labs[i], cx, cy, { size: 14, wt: 800, col: cols[i], halo: k.bg });
        });
        var tp2 = tri.map(T); poly(ctx, tp2, soft(k.gold, 0.45), k.ink, 2.5);
        if (near(th, 90)) { var r0 = T(Cc), e1 = [r0[0] + 12, r0[1]], e2 = [r0[0], r0[1] - 12]; ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(e1[0], e1[1]); ctx.lineTo(e1[0], e2[1]); ctx.lineTo(e2[0], e2[1]); ctx.stroke(); ctx.restore(); }
        var ma = T([a / 2, 0]), mb = T([B[0] / 2, B[1] / 2]); tx(ctx, 'a', ma[0], ma[1] - 12, { font: 'italic 700 15px Georgia,serif', col: k.ink, halo: k.bg }); tx(ctx, 'b', mb[0] + 12, mb[1], { font: 'italic 700 15px Georgia,serif', col: k.ink, halo: k.bg });
        G.hA = T(A); G.hB = T(B);
      } else {
        var s = a + b, u2 = M.min(w - 30, h - 30, 380) / s; G.u = u2; G.ox = (w - s * u2) / 2; G.oy = (h + s * u2) / 2;
        function T2(p) { return [G.ox + p[0] * u2, G.oy - p[1] * u2]; }
        var T1 = [[0, 0], [a, 0], [0, b]], T2p = [[s, 0], [s, a], [a, 0]], T3 = [[s, s], [b, s], [s, a]], T4 = [[0, s], [0, b], [b, s]];
        var moves = [[0, a], [0, 0], [-b, 0], [a, -b]], tris = [T1, T2p, T3, T4];
        poly(ctx, [[0, 0], [s, 0], [s, s], [0, s]].map(T2), soft(k.gold, 0.3), k.ink, 2.5);
        tris.forEach(function (tr, i) { var seg = i === 1 ? 1 : clamp((tp - [0, 0, 0.34, 0.67][i]) / 0.33, 0, 1), e = ease(seg), d = moves[i]; poly(ctx, tr.map(function (p) { return T2([p[0] + d[0] * e, p[1] + d[1] * e]); }), soft(k.blue, k.dark ? 0.55 : 0.4), k.blue, 2); });
        if (tp < 0.02) { var c0 = T2([s / 2, s / 2]); tx(ctx, 'c²', c0[0], c0[1], { font: 'italic 800 ' + M.round(clamp(u2 * 1.2, 16, 30)) + 'px Georgia,serif', col: k.gold }); }
        if (tp > 0.98) { var pa = T2([a / 2, a / 2]), pb = T2([a + b / 2, a + b / 2]); tx(ctx, 'a²', pa[0], pa[1], { font: 'italic 800 ' + M.round(clamp(u2 * a * 0.4, 13, 28)) + 'px Georgia,serif', col: k.gold }); tx(ctx, 'b²', pb[0], pb[1], { font: 'italic 800 ' + M.round(clamp(u2 * b * 0.4, 13, 28)) + 'px Georgia,serif', col: k.gold }); }
      }
      P.sync(); say();
    }
    function say() {
      var c = M.sqrt(c2()), s;
      if (view === 'squares') {
        if (near(th, 90)) s = 'a² + b² = ' + f(a * a) + ' + ' + f(b * b) + ' = <b>' + f(a * a + b * b) + ' = c²</b>, so c = ' + rootText(a * a + b * b) + '. The two smaller squares together cover exactly as much as the big one.';
        else s = 'The angle is ' + f(th) + '°, not 90°. a² + b² = ' + f(a * a + b * b) + ', but c² = ' + f(c2(), 1) + ': ' + (th > 90 ? 'c² is bigger. The rule a² + b² = c² is only for right triangles.' : 'c² is smaller. The rule a² + b² = c² is only for right triangles.');
      } else s = tp < 0.02 ? 'A big square, ' + f(a) + ' + ' + f(b) + ' on each side, holds four copies of the triangle. The gold space left over is a square on the hypotenuse: c².' : tp > 0.98 ? 'Same big square, same four triangles, moved around. Now the gold space left over is a² and b². Since the leftover space didn\'t change, <b>a² + b² = c²</b>: ' + f(a * a) + ' + ' + f(b * b) + ' = ' + f(a * a + b * b) + '.' : 'Sliding the triangles…';
      S.say(s);
    }
    var row = S.row(), row2 = S.row(), bP;
    V.seg(row, { label: 'View', items: [['squares', 'Squares on the sides'], ['proof', 'Proof by moving']], value: view, change: function (v) { view = v; sync(); draw(); } });
    bP = V.button(row, 'Slide the triangles', function () { if (anim) anim.stop(); var t0 = tp, t1 = tp > 0.5 ? 0 : 1; anim = tween(2400, function (p) { tp = lerp(t0, t1, p); draw(); }, function () { tp = t1; bP.textContent = t1 ? 'Put them back' : 'Slide the triangles'; draw(); }); }, 'pri');
    var sa = V.slider(row2, { label: 'a', min: 1, max: 12, step: 0.5, value: a, input: function (v) { a = v; draw(); if (tk) tk.update(); } });
    var sb = V.slider(row2, { label: 'b', min: 1, max: 12, step: 0.5, value: b, input: function (v) { b = v; draw(); if (tk) tk.update(); } });
    var sth = o.angle ? V.slider(row2, { label: 'Angle between a and b', min: 40, max: 140, step: 1, value: 90, fmt: function (v) { return v + '°'; }, input: function (v) { th = v; draw(); } }) : null;
    function sync() { bP.hidden = view !== 'proof'; if (sth) sth.el.hidden = view !== 'squares'; }
    var P = { sync: function () { } };
    var tk = S.task({ text: TT && 'Make the hypotenuse exactly ' + TT.target + ' with whole-number legs.', ok: function () { return near(th, 90) && Number.isInteger(a) && Number.isInteger(b) && near(a * a + b * b, num(TT.target, 0) * num(TT.target, 0)); }, hint: function () { return 'Now c = ' + rootText(a * a + b * b) + '. You need a² + b² = ' + f(num(TT.target, 0) * num(TT.target, 0)) + '.'; } });
    sync(); S.live(draw); draw();
  });

  /* ================================================================ circlepi
     Why the circumference is π times the diameter: roll a circle along a line for one full turn, or wrap diameters
     around it. It always takes a bit more than 3 diameters.
     opts:
       d: 1            the diameter (units); a slider lets learners change it
       mode: "roll"    "roll" (unroll the circle onto a line) or "wrap" (lay diameters around the circle)
       r: false        talk about the radius too (C = 2πr)                                                          */
  def('circlepi', function (el, o) {
    var S = shell(el, o, { name: 'circlepi', label: 'Rolling a circle to measure its circumference', touch: 'pan-y', height: 220 });
    var d = num(o.d, 1), mode = o.mode === 'wrap' ? 'wrap' : 'roll', t = 0, anim = null, G = {};
    function draw() {
      var w = S.c.w, ctx = S.ctx, k = C();
      if (mode === 'roll') {
        var unit = (w - 40) / (PI + 1) / M.max(d, 0.0001) * d, r = unit * 0.5 * 1, scale = (w - 40) / (PI * d + d); r = d / 2 * scale; S.height(M.max(170, 2 * r + 90)); ctx.clearRect(0, 0, w, S.c.h);
        var x0 = 20 + r, gy = S.c.h - 54, dist = t * PI * d * scale, cx = 20 + r + dist, rot = dist / r; G.x0 = x0; G.cx = cx; G.gy = gy; G.r = r; G.scale = scale;
        ln(ctx, 10, gy, w - 10, gy, k.ink, 2);
        for (var i = 0; i <= 3; i++) { var xa = 20 + r + i * d * scale; ln(ctx, xa, gy + 8, xa, gy + 22, k.muted, 1.5); if (i) tx(ctx, i + 'd', xa - d * scale / 2, gy + 34, { size: 12, wt: 700, col: k.blue }); }
        for (i = 0; i < 3; i++) { fillRR(ctx, 20 + r + i * d * scale + 2, gy + 12, d * scale - 4, 6, 3, soft(k.blue, 0.5)); }
        fillRR(ctx, 20 + r + 3 * d * scale + 2, gy + 12, (PI - 3) * d * scale - 2, 6, 3, soft(k.gold, 0.9));
        ln(ctx, x0, gy, x0 + dist, gy, k.red, 5);
        ctx.save(); ctx.translate(cx, gy - r); disc(ctx, 0, 0, r, soft(k.green, 0.15), k.green, 2.5);
        ctx.strokeStyle = k.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r, PI / 2 + rot, PI / 2 + TAU, false); ctx.stroke();
        ctx.rotate(rot); ln(ctx, -r, 0, r, 0, k.blue, 2); disc(ctx, 0, r, 5, k.red); ctx.restore(); disc(ctx, cx, gy - r, 3, k.ink);
        if (t > 0.999) tx(ctx, 'π × d ≈ ' + f(PI * d, 3), x0 + dist / 2, gy - 12, { size: 13, wt: 800, col: k.red, halo: k.bg });
      } else {
        var R = M.min(w * 0.3, 110); S.height(2 * R + 70); ctx.clearRect(0, 0, w, S.c.h); var cx2 = w / 2, cy2 = R + 20, cols = [k.blue, k.purple, k.orange];
        disc(ctx, cx2, cy2, R, soft(k.green, 0.12), k.green, 2); ln(ctx, cx2 - R, cy2, cx2 + R, cy2, k.ink, 2); tx(ctx, 'd', cx2, cy2 - 10, { font: 'italic 700 14px Georgia,serif' });
        for (i = 0; i < 3; i++) {
          var p = clamp(t * 3 - i, 0, 1), a0 = PI / 2 + i * 2, L = 2 * R, sx = cx2 - R + 0, sy = S.c.h - 26 - 0;
          ctx.save(); ctx.strokeStyle = cols[i]; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
          for (var j = 0; j <= 40; j++) { var s = j / 40 * L, ax = cx2 + R * M.cos(a0 + s / R), ay = cy2 + R * M.sin(a0 + s / R), bx = sx + s, by = sy + i * 0; var X = lerp(bx, ax, p), Y = lerp(by + (i - 1) * 9, ay, p); if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
          ctx.stroke(); ctx.restore();
        }
        if (t > 0.999) { var g0 = PI / 2 + 6; ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx2, cy2, R, g0, PI / 2 + TAU); ctx.stroke(); ctx.restore(); }
      }
      say();
    }
    function say() {
      var s;
      if (mode === 'roll') s = t < 0.001 ? 'Roll the circle along the line. The red rim paints the ground as it rolls.' : t < 0.999 ? 'Rolled ' + f(t * 100, 0) + '% of a turn: ' + f(t * PI * d, 3) + ' units so far.' : 'One full turn rolls out the whole circumference: <b>C = π × d = ' + f(PI, 5) + ' × ' + f(d) + ' ≈ ' + f(PI * d, 3) + '</b>. That is 3 diameters and a little more (about 0.14 of a diameter), for every circle.';
      else s = t < 0.999 ? 'Bend diameter-length strings around the circle.' : 'Three diameters fit around the circle, with a small gap left (gold). The circumference is about 3.14 diameters: <b>C = πd</b>.';
      if (o.r && t > 0.999) s += ' Since d = 2r, C = 2πr.';
      S.say(s);
    }
    if (mode === 'roll') ptr(S.c.cv, { hit: function (x, y) { return M.hypot(x - G.cx, y - (G.gy - G.r)) < G.r + 10 ? 'w' : null; }, move: function (h, x) { if (anim) anim.stop(); t = clamp((x - G.x0) / (PI * d * G.scale), 0, 1); draw(); } });
    var P = pads(S.stage, { list: function () { return mode === 'roll' ? [{ x: G.cx, y: G.gy - G.r, size: 40, label: 'The circle. Left and right arrows roll it.' }] : []; }, key: function (i, dx, dy) { t = clamp(t + (dx || dy) * 0.05, 0, 1); draw(); } });
    var row = S.row();
    var bR = V.button(row, mode === 'roll' ? 'Roll one turn' : 'Wrap the diameters', function () { if (anim) anim.stop(); var t0 = t >= 0.999 ? 0 : t; anim = tween(mode === 'roll' ? 2600 : 2400, function (p) { t = lerp(t0, 1, p); draw(); P.sync(); }); }, 'pri');
    V.button(row, 'Start over', function () { if (anim) anim.stop(); t = 0; draw(); P.sync(); });
    V.slider(row, { label: 'Diameter', min: 0.5, max: 3, step: 0.25, value: d, input: function (v) { d = v; draw(); P.sync(); } });
    S.live(function () { draw(); P.sync(); }); draw(); P.sync();
  });

  /* ================================================================ areaformulas
     Where the area formulas come from: cut and rearrange. A parallelogram becomes a rectangle; two triangles make a
     parallelogram; two trapezoids make a parallelogram; a circle cut into thin slices becomes nearly a rectangle π r by r.
     opts:
       shape: "parallelogram"   "parallelogram", "triangle", "trapezoid" or "circle"
       b: 6, h: 4, s: 2        base, height and how far the top is shifted (parallelogram, triangle)
       b2: 3                   the top base (trapezoid)
       n: 12                   slices of the circle (4 to 48, even)
       pick: false             let learners switch shapes
       grid: true              unit squares in the background                                                     */
  def('areaformulas', function (el, o) {
    var S = shell(el, o, { name: 'areaformulas', label: 'Cutting and rearranging a shape to find its area', touch: 'pan-y', height: 300 });
    var sh = ['parallelogram', 'triangle', 'trapezoid', 'circle'].indexOf(o.shape) >= 0 ? o.shape : 'parallelogram', b = num(o.b, 6), h = num(o.h, 4), s = num(o.s, 2), b2 = num(o.b2, 3), n = int(o.n, 12, 4, 48), t = 0, anim = null, G = {};
    if (n % 2) n++;
    function draw() {
      var w = S.c.w, ctx = S.ctx, k = C(), hh = clamp(w * 0.55, 230, 340); S.height(hh); ctx.clearRect(0, 0, w, hh);
      if (sh === 'circle') {
        var stack = w < 520; if (stack) { hh = M.min(w * 1.05, 420); S.height(hh); ctx.clearRect(0, 0, w, hh); }
        var r = stack ? M.min((w - 40) / (PI + 0.4), (hh - 70) / 3.3) : M.min((w - 40) / (PI + 0.6 + 2.3), (hh - 40) / 2.3), al = TAU / n, W2 = (n / 2 + 0.5) * r * al;
        var cx = stack ? w / 2 : 20 + r, cy = stack ? r + 12 : hh / 2, ax0 = stack ? (w - W2) / 2 : w - 36 - W2, ay0 = stack ? hh - 14 - r * 0.1 : cy + r / 2;
        for (var i = 0; i < n; i++) {
          var top = i < n / 2, b0 = (i + 0.5) * al, j = top ? n / 2 - 1 - i : i - n / 2, tb = top ? PI / 2 : -PI / 2;
          var tax = top ? ax0 + (j + 1) * r * al : ax0 + (j + 0.5) * r * al, tay = top ? ay0 : ay0 - r;
          var dr = tb - b0; while (dr > PI) dr -= TAU; while (dr < -PI) dr += TAU; var e = ease(clamp(t * 1.25 - i / n * 0.25, 0, 1));
          var px = lerp(cx, tax, e), py = lerp(cy, tay, e), bb = b0 + dr * e;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, r, -(bb - al / 2), -(bb + al / 2), true); ctx.closePath();
          ctx.fillStyle = top ? soft(k.blue, k.dark ? 0.55 : 0.4) : soft(k.gold, k.dark ? 0.6 : 0.5); ctx.fill(); ctx.strokeStyle = k.bg; ctx.lineWidth = 1; ctx.stroke();
        }
        if (t > 0.98) { brace(ctx, ax0, ax0 + n / 2 * r * al, ay0 - r - 10, false, k.ink); tx(ctx, 'half the circumference = πr', ax0 + n / 4 * r * al, ay0 - r - 28, { size: 12, wt: 700, col: k.ink, halo: k.bg }); ln(ctx, ax0 + W2 + 10, ay0 - r, ax0 + W2 + 10, ay0, k.ink, 1.5); tx(ctx, 'r', ax0 + W2 + 18, ay0 - r / 2, { font: 'italic 700 15px Georgia,serif', al: 'left' }); }
      } else {
        var bb2 = sh === 'trapezoid' ? b + b2 : b, spanX = sh === 'triangle' || sh === 'trapezoid' ? bb2 + M.abs(s) : b + M.max(s, 0), u = M.min((w - 40) / (spanX + 0.5), (hh - 50) / (h + 0.5)), ox = (w - spanX * u) / 2, oy = hh - 28;
        function T(p) { return [ox + p[0] * u, oy - p[1] * u]; }
        if (o.grid !== false) { ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath(); for (var gx = 0; gx <= spanX + 0.01; gx++) { ctx.moveTo(ox + gx * u, oy); ctx.lineTo(ox + gx * u, oy - h * u); } for (var gy = 0; gy <= h + 0.01; gy++) { ctx.moveTo(ox, oy - gy * u); ctx.lineTo(ox + spanX * u, oy - gy * u); } ctx.stroke(); ctx.restore(); }
        var c1 = soft(k.blue, k.dark ? 0.5 : 0.35), c2 = soft(k.gold, k.dark ? 0.6 : 0.5), e2 = ease(t);
        if (sh === 'parallelogram') {
          poly(ctx, [[s, 0], [b, 0], [b + s, h], [s, h]].map(T), c1, k.blue, 2);
          poly(ctx, [[0 + b * e2, 0], [s + b * e2, 0], [s + b * e2, h]].map(T), c2, k.gold, 2);
          ln(ctx, T([s, 0])[0], T([s, 0])[1], T([s, h])[0], T([s, h])[1], k.red, 2, [6, 4]);
          poly(ctx, [[0, 0], [b, 0], [b + s, h], [s, h]].map(T), null, k.ink, 1.2, [3, 4]);
        } else {
          var top = sh === 'triangle' ? [[s, h]] : [[s + b2, h], [s, h]], shape = [[0, 0], [b, 0]].concat(top), mid = [(b + (sh === 'triangle' ? s : s + b2)) / 2, h / 2];
          poly(ctx, shape.map(T), c1, k.blue, 2.5);
          var ang = PI * e2, cp = shape.map(function (p) { var dx = p[0] - mid[0], dy = p[1] - mid[1]; return [mid[0] + dx * M.cos(ang) - dy * M.sin(ang), mid[1] + dx * M.sin(ang) + dy * M.cos(ang)]; });
          if (t > 0.001) poly(ctx, cp.map(T), c2, k.gold, 2);
          disc(ctx, T(mid)[0], T(mid)[1], 4, k.red);
        }
        var hx = sh === 'parallelogram' ? s : s; ln(ctx, T([hx, 0])[0] + (sh === 'parallelogram' ? 0 : 0), T([hx, 0])[1], T([hx, h])[0], T([hx, h])[1], k.red, 1.5, [2, 3]);
        tx(ctx, 'h = ' + f(h), T([hx, h / 2])[0] - 6, T([hx, h / 2])[1], { size: 12, wt: 700, al: 'right', col: k.red, halo: k.bg });
        tx(ctx, 'b = ' + f(b), T([b / 2, 0])[0], oy + 15, { size: 12, wt: 700, col: k.blue });
        if (sh === 'trapezoid') tx(ctx, 'b₂ = ' + f(b2), T([s + b2 / 2, h])[0], T([s + b2 / 2, h])[1] - 12, { size: 12, wt: 700, col: k.blue, halo: k.bg });
      }
      say();
    }
    function say() {
      var x;
      if (sh === 'parallelogram') x = t < 0.98 ? 'Cut off the triangle on the left and slide it to the right end.' : 'Now it is a rectangle, ' + f(b) + ' by ' + f(h) + '. Nothing was added or lost, so the parallelogram\'s <b>area = b × h = ' + f(b) + ' × ' + f(h) + ' = ' + f(b * h) + '</b>. The slanted side doesn\'t matter: the height does.';
      else if (sh === 'triangle') x = t < 0.98 ? 'Make a copy of the triangle and turn it halfway around the red point.' : 'Two copies make a parallelogram with area b × h = ' + f(b * h) + '. One triangle is half of that: <b>area = ½ × b × h = ' + f(b * h / 2) + '</b>.';
      else if (sh === 'trapezoid') x = t < 0.98 ? 'Make a copy of the trapezoid and turn it halfway around the red point.' : 'Two copies make a parallelogram with base b + b₂ = ' + f(b + b2) + ' and height ' + f(h) + '. One trapezoid is half: <b>area = ½ × (b + b₂) × h = ' + f((b + b2) * h / 2) + '</b>.';
      else x = t < 0.98 ? 'Cut the circle into ' + n + ' slices and lay them head to tail.' : 'The slices make a shape close to a rectangle: as wide as half the circumference (πr) and as tall as the radius (r). <b>Area = πr × r = πr²</b>. More slices make it even closer to a rectangle.';
      S.say(x);
    }
    var row = S.row(), row2 = S.row(), bt;
    if (o.pick) V.seg(row, { label: 'Shape', items: [['parallelogram', 'Parallelogram'], ['triangle', 'Triangle'], ['trapezoid', 'Trapezoid'], ['circle', 'Circle']], value: sh, change: function (v) { sh = v; t = 0; bt.textContent = 'Rearrange'; build(); draw(); } });
    bt = V.button(row, 'Rearrange', function () { if (anim) anim.stop(); var t0 = t, t1 = t > 0.5 ? 0 : 1; anim = tween(sh === 'circle' ? 2600 : 1600, function (p) { t = lerp(t0, t1, p); draw(); }, function () { bt.textContent = t1 ? 'Put it back' : 'Rearrange'; }); }, 'pri');
    var sl = V.slider(row, { label: 'Step', min: 0, max: 1, step: 0.01, value: 0, fmt: function (v) { return f(v * 100, 0) + '%'; }, input: function (v) { if (anim) anim.stop(); t = v; draw(); } });
    function build() {
      row2.innerHTML = '';
      if (sh === 'circle') V.slider(row2, { label: 'Slices', min: 4, max: 48, step: 2, value: n, input: function (v) { n = v; draw(); } });
      else { V.slider(row2, { label: 'Base b', min: 2, max: 10, step: 1, value: b, input: function (v) { b = v; if (sh === 'parallelogram') s = M.min(s, b); draw(); } }); V.slider(row2, { label: 'Height h', min: 1, max: 8, step: 1, value: h, input: function (v) { h = v; draw(); } }); if (sh !== 'trapezoid') V.slider(row2, { label: 'Slant', min: 0, max: 8, step: 1, value: s, input: function (v) { s = sh === 'parallelogram' ? M.min(v, b) : v; draw(); } }); else V.slider(row2, { label: 'Top base b₂', min: 1, max: 10, step: 1, value: b2, input: function (v) { b2 = v; draw(); } }); }
    }
    var origDraw = draw; draw = function () { origDraw(); sl.set(t); };
    build(); S.live(draw); draw();
  });

  /* ================================================================ volume
     Volume as unit cubes: fill a box layer by layer. Each layer holds length × width cubes; height counts the layers.
     opts:
       l: 4, w: 3, h: 2     the box, in cubes (1 to max)
       max: 6               the largest size the sliders allow (up to 8)
       unit: 1              the edge of each cube: 1, or "1/2", "1/3", "1/4" for fractional edges (Grade 6)
       fill: "all"          how many cubes are in at the start: "all", or a number (0 for an empty box)
       layers: true         color the layers differently
       task: 24  or  {target: 24}   "Build a box with a volume of 24 cubic units." (any l × w × h that works, then another)
       quiet: false         true: the readout says how to count (layers, rows) but never how many cubes there are
     Drag the picture to turn it.                                                                               */
  def('volume', function (el, o) {
    var S = shell(el, o, { name: 'volume', label: 'A box filled with unit cubes', touch: 'none', height: 300, quietSay: true });
    var mx = int(o.max, 6, 2, 8), l = int(o.l, 4, 1, mx), w = int(o.w, 3, 1, mx), h = int(o.h, 2, 1, mx), uq = parseQ(o.unit || 1) || rat(1), TT = taskOf(o);
    var full = function () { return l * w * h; }, placed = o.fill === undefined || o.fill === 'all' ? full() : int(o.fill, 0, 0, full()), view = { yaw: -0.62, pitch: 0.52 }, anim = null, found = {};
    function geo() { var W2 = S.c.w; S.height(clamp(W2 * 0.62, 240, 380)); }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), W2 = S.c.w, H2 = S.c.h, R = rotYX(view.yaw, view.pitch); ctx.clearRect(0, 0, W2, H2);
      var c = [l / 2, w / 2, h / 2], corners = []; [0, l].forEach(function (x) { [0, w].forEach(function (y) { [0, h].forEach(function (z) { corners.push(R([x - c[0], y - c[1], z - c[2]])); }); }); });
      var minx = M.min.apply(null, corners.map(function (p) { return p[0]; })), maxx = M.max.apply(null, corners.map(function (p) { return p[0]; })), miny = M.min.apply(null, corners.map(function (p) { return p[1]; })), maxy = M.max.apply(null, corners.map(function (p) { return p[1]; }));
      var s = M.min((W2 - 70) / (maxx - minx), (H2 - 60) / (maxy - miny), 60), cx = W2 / 2 - (minx + maxx) / 2 * s, cy = H2 / 2 + (miny + maxy) / 2 * s;
      function Pj(p) { var q = R([p[0] - c[0], p[1] - c[1], p[2] - c[2]]); return [cx + q[0] * s, cy - q[1] * s, q[2]]; }
      // the empty box: back faces and floor
      var floor = [[0, 0, 0], [l, 0, 0], [l, w, 0], [0, w, 0]].map(Pj); poly(ctx, floor, soft(k.ink, 0.05), soft(k.ink, 0.35), 1);
      ctx.save(); ctx.globalAlpha = 0.35; for (var i = 0; i <= l; i++) { var a = Pj([i, 0, 0]), b = Pj([i, w, 0]); ln(ctx, a[0], a[1], b[0], b[1], k.muted, 0.8); } for (i = 0; i <= w; i++) { a = Pj([0, i, 0]); b = Pj([l, i, 0]); ln(ctx, a[0], a[1], b[0], b[1], k.muted, 0.8); } ctx.restore();
      // outline of the whole box
      var E = [[[0, 0, 0], [l, 0, 0]], [[l, 0, 0], [l, w, 0]], [[l, w, 0], [0, w, 0]], [[0, w, 0], [0, 0, 0]], [[0, 0, h], [l, 0, h]], [[l, 0, h], [l, w, h]], [[l, w, h], [0, w, h]], [[0, w, h], [0, 0, h]], [[0, 0, 0], [0, 0, h]], [[l, 0, 0], [l, 0, h]], [[l, w, 0], [l, w, h]], [[0, w, 0], [0, w, h]]];
      E.forEach(function (e) { var a2 = Pj(e[0]), b2 = Pj(e[1]); ln(ctx, a2[0], a2[1], b2[0], b2[1], soft(k.ink, placed < full() ? 0.55 : 0.8), 1.4, placed < full() ? [5, 4] : []); });
      var cubes = []; for (i = 0; i < placed; i++) { var z = M.floor(i / (l * w)), r = i % (l * w), y = M.floor(r / l), x = r % l; cubes.push([x, y, z, i]); }
      var has = {}; cubes.forEach(function (q) { has[q[0] + ',' + q[1] + ',' + q[2]] = 1; });
      cubes.forEach(function (q) { q.d = Pj([q[0] + 0.5, q[1] + 0.5, q[2] + 0.5])[2]; }); cubes.sort(function (a, b) { return a.d - b.d; });
      var lc = [k.dark ? '#5aa982' : '#86d6ae', k.dark ? '#5b8fc4' : '#9cc6f2', k.dark ? '#b49a4c' : '#f2d27c', k.dark ? '#9a83d6' : '#c3b3f2'];
      var FACES = [[[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]], [[-1, 0, 0], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]], [[0, 1, 0], [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]]], [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]], [[0, 0, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]], [[0, 0, -1], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]]];
      var shadeK = [0.86, 0.86, 0.74, 1.0, 1.12, 0.7];
      cubes.forEach(function (q) {
        var base = q[3] === placed - 1 && placed < full() ? (k.dark ? '#e0b84a' : '#f5c542') : o.layers === false ? lc[0] : lc[q[2] % 2 ? 1 : 0];
        FACES.forEach(function (fc, fi) {
          var nb = (q[0] + fc[0][0]) + ',' + (q[1] + fc[0][1]) + ',' + (q[2] + fc[0][2]); if (has[nb]) return;
          var pp = fc[1].map(function (v) { return Pj([q[0] + v[0], q[1] + v[1], q[2] + v[2]]); }), ar = 0; for (var j = 0; j < 4; j++) { var p1 = pp[j], p2 = pp[(j + 1) % 4]; ar += p1[0] * p2[1] - p2[0] * p1[1]; }
          if (ar >= 0) return;
          poly(ctx, pp, shadeHex(base, shadeK[fi]), k.dark ? '#0f1913' : '#2b5a42', 1);
        });
      });
      var u = uq.d === 1 ? '' : ' × ' + qText(uq);
      var bc = Pj([l / 2, w / 2, h / 2]);
      function lab(edges, s2) { // label the outermost of four parallel edges, just outside the box
        var best = null, bs = -1e9; edges.forEach(function (e) { var a3 = Pj(e[0]), b3 = Pj(e[1]), mx2 = (a3[0] + b3[0]) / 2, my2 = (a3[1] + b3[1]) / 2, sc2 = M.hypot(mx2 - bc[0], my2 - bc[1]) + 0.35 * (my2 - bc[1]); if (sc2 > bs) { bs = sc2; best = [mx2, my2]; } });
        var dx = best[0] - bc[0], dy = best[1] - bc[1], L = M.hypot(dx, dy) || 1; tx(ctx, s2, best[0] + dx / L * 18, best[1] + dy / L * 18, { size: 13, wt: 700, col: k.ink, halo: k.bg });
      }
      lab([[[0, 0, 0], [l, 0, 0]], [[0, w, 0], [l, w, 0]], [[0, 0, h], [l, 0, h]], [[0, w, h], [l, w, h]]], String(l));
      lab([[[0, 0, 0], [0, w, 0]], [[l, 0, 0], [l, w, 0]], [[0, 0, h], [0, w, h]], [[l, 0, h], [l, w, h]]], String(w));
      lab([[[0, 0, 0], [0, 0, h]], [[l, 0, 0], [l, 0, h]], [[0, w, 0], [0, w, h]], [[l, w, 0], [l, w, h]]], String(h));
      P.sync(); say();
    }
    function say() {
      var base = l * w, layersFull = M.floor(placed / base), extra = placed % base, s;
      if (S.quiet) { S.say(placed < full() ? 'Fill the box a row and a layer at a time. How many cubes fit in one layer? How many layers fit?' : 'Count the cubes in one layer (length × width), then count the layers (the height).' + (uq.d === 1 && uq.n === 1 ? '' : ' Each little cube is a fraction of a cubic unit.')); return; }
      var vu = qmul(rat(full()), qmul(uq, qmul(uq, uq)));
      if (placed < full()) s = plural(placed, 'cube') + ' so far' + (placed ? ': ' + (layersFull ? plural(layersFull, 'full layer') + ' of ' + base + (extra ? ' and ' + extra + ' more' : '') : extra + ' in the first layer') : '') + '. The box holds ' + l + ' × ' + w + ' = ' + base + ' cubes in each layer.';
      else s = 'Each layer is ' + l + ' × ' + w + ' = ' + base + ' cubes. ' + plural(h, 'layer') + ': ' + base + ' × ' + h + ' = <b>' + full() + ' cubes</b>.' + (uq.d === 1 && uq.n === 1 ? ' Volume = l × w × h = ' + l + ' × ' + w + ' × ' + h + ' = <b>' + full() + ' cubic units</b>.' : '');
      if (!(uq.d === 1 && uq.n === 1) && placed === full()) { var cv = qmul(uq, qmul(uq, uq)); s += ' Each little cube has edges of ' + qH(uq) + ' unit, so it is ' + qH(cv) + ' of a cubic unit. ' + full() + ' × ' + qH(cv) + ' = <b>' + qH(vu, 'mixed') + ' cubic units</b>, the same as ' + qH(qmul(rat(l), uq), 'mixed') + ' × ' + qH(qmul(rat(w), uq), 'mixed') + ' × ' + qH(qmul(rat(h), uq), 'mixed') + '.'; }
      S.say(s);
    }
    orbit(S, view, draw, { pmin: 0.1, pmax: 1.35 });
    var P = pads(S.stage, { list: function () { return [{ x: S.c.w / 2, y: S.c.h / 2, size: 54, label: 'The box. Arrow keys turn it.' }]; }, key: function (i, dx, dy) { view.yaw += dx * 0.15; view.pitch = clamp(view.pitch + dy * 0.08, 0.1, 1.35); draw(); } });
    var row = S.row(), row2 = S.row();
    function play(to) { if (anim) anim.stop(); var from = placed > to ? 0 : placed; var n0 = from; anim = tween(M.min(5000, 300 + (to - n0) * 90), function (p) { placed = M.round(lerp(n0, to, p)); draw(); }, function () { placed = to; draw(); if (tk) tk.update(); }); }
    V.button(row, 'Fill it', function () { play(full()); }, 'pri');
    V.button(row, 'Add a layer', function () { if (anim) anim.stop(); placed = M.min(full(), (M.floor(placed / (l * w)) + 1) * l * w); draw(); });
    V.button(row, 'Add a row', function () { if (anim) anim.stop(); placed = M.min(full(), (M.floor(placed / l) + 1) * l); draw(); });
    V.button(row, 'Empty', function () { if (anim) anim.stop(); placed = 0; draw(); });
    function resize() { if (anim) anim.stop(); placed = full(); draw(); if (TT) { if (full() === int(TT.target, 0)) found[[l, w, h].sort().join('x')] = 1; } if (tk) tk.update(); }
    V.slider(row2, { label: 'Length', min: 1, max: mx, step: 1, value: l, input: function (v) { l = v; resize(); } });
    V.slider(row2, { label: 'Width', min: 1, max: mx, step: 1, value: w, input: function (v) { w = v; resize(); } });
    V.slider(row2, { label: 'Height', min: 1, max: mx, step: 1, value: h, input: function (v) { h = v; resize(); } });
    var tk = S.task({
      text: TT && 'Build a box with a volume of ' + TT.target + ' cubic units.',
      ok: function () { return full() === int(TT.target, 0) && placed === full(); },
      hint: function () { return 'This box holds ' + l + ' × ' + w + ' × ' + h + ' = ' + full() + '. ' + (full() < int(TT.target, 0) ? 'Make it bigger.' : 'Make it smaller.') + ' Which three numbers multiply to ' + TT.target + '?'; },
      yes: function () { var n = Object.keys(found).length; return l + ' × ' + w + ' × ' + h + ' = ' + full() + '.' + (n > 1 ? ' You have found ' + n + ' different boxes.' : ' Can you find a different box with the same volume?'); }
    });
    S.live(draw); draw();
  });

  /* ================================================================ nets
     Nets: fold a flat pattern up into a solid, and unfold it again. The faces of the net are the faces of the solid,
     so the surface area is the sum of the areas of the net's pieces.
     opts:
       solid: "cube"       "cube", "prism" (rectangular), "triprism" (triangular), "pyramid" (square), "tetra", "cylinder"
       l: 4, w: 3, h: 2    prism sizes; s: 2 the cube's edge (also the base of triprism, pyramid, tetra); L: 4 the
                           triprism's length; slant: 3 the pyramid's slant height; r: 1, h: 3 the cylinder
       net: 1              cube only: which of the 11 cube nets (1–11), "bad1"–"bad3" (patterns that don't fold into
                           a cube), or your own squares as [[col, row], …]
       fold: 0             how folded it starts (0 flat … 1 closed)
       labels: true        show each face's area on the flat net
       task: {ask: true}   cube only: "Will this fold into a cube?" with two answer buttons, then folding to check  */
  var CUBE_NETS = [
    [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
    [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]]];
  var BAD_NETS = { bad1: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], bad2: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], bad3: [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1]] };
  function buildNet(solid, o) {
    var F = [], s = num(o.s, 2), i;
    function rect(x0, y0, x1, y1) { return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; }
    function add(p, parent, hinge, ang, label, area) { F.push({ p: p, parent: parent, hinge: hinge, ang: ang, label: label, area: area }); return F.length - 1; }
    if (solid === 'cube' && (o.net || Array.isArray(o.net))) {
      var cells = Array.isArray(o.net) ? o.net : BAD_NETS[o.net] || CUBE_NETS[clamp(int(o.net, 1), 1, 11) - 1];
      var key = function (c) { return c[0] + ',' + c[1]; }, idx = {}; cells.forEach(function (c, j) { idx[key(c)] = j; });
      var deg = cells.map(function (c) { return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(function (d) { return idx[(c[0] + d[0]) + ',' + (c[1] + d[1])] !== undefined; }).length; });
      var root = deg.indexOf(M.max.apply(null, deg)), seen = {}, q = [root], fi = {}; seen[root] = 1;
      fi[root] = add(rect(cells[root][0] * s, -cells[root][1] * s, cells[root][0] * s + s, -cells[root][1] * s - s).map(function (p) { return [p[0], p[1]]; }), -1, null, 0, null, s * s);
      while (q.length) {
        var cur = q.shift(), c0 = cells[cur];
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          var j = idx[(c0[0] + d[0]) + ',' + (c0[1] + d[1])]; if (j === undefined || seen[j]) return; seen[j] = 1; q.push(j);
          var c1 = cells[j], x0 = c1[0] * s, y0 = -c1[1] * s, hx = d[0] === 1 ? [[x0, y0], [x0, y0 - s]] : d[0] === -1 ? [[x0 + s, y0], [x0 + s, y0 - s]] : d[1] === 1 ? [[x0, y0], [x0 + s, y0]] : [[x0, y0 - s], [x0 + s, y0 - s]];
          fi[j] = add(rect(x0, y0, x0 + s, y0 - s), fi[cur], hx, PI / 2, null, s * s);
        });
      }
      return F;
    }
    if (solid === 'cube' || solid === 'prism') {
      var l = solid === 'cube' ? s : num(o.l, 4), w = solid === 'cube' ? s : num(o.w, 3), h = solid === 'cube' ? s : num(o.h, 2);
      var b = add(rect(0, 0, l, w), -1, null, 0, 'bottom', l * w);
      add(rect(0, -h, l, 0), b, [[0, 0], [l, 0]], PI / 2, 'front', l * h);
      var bk = add(rect(0, w, l, w + h), b, [[0, w], [l, w]], PI / 2, 'back', l * h);
      add(rect(-h, 0, 0, w), b, [[0, 0], [0, w]], PI / 2, 'left', w * h);
      add(rect(l, 0, l + h, w), b, [[l, 0], [l, w]], PI / 2, 'right', w * h);
      add(rect(0, w + h, l, w + h + w), bk, [[0, w + h], [l, w + h]], PI / 2, 'top', l * w);
      return F;
    }
    if (solid === 'triprism') {
      var L = num(o.L, 4), t3 = s * M.sqrt(3) / 2;
      var r0 = add(rect(0, 0, s, L), -1, null, 0, null, s * L);
      add(rect(s, 0, 2 * s, L), r0, [[s, 0], [s, L]], 2 * PI / 3, null, s * L);
      add(rect(-s, 0, 0, L), r0, [[0, 0], [0, L]], 2 * PI / 3, null, s * L);
      add([[0, 0], [s, 0], [s / 2, -t3]], r0, [[0, 0], [s, 0]], PI / 2, null, s * t3 / 2);
      add([[0, L], [s / 2, L + t3], [s, L]], r0, [[0, L], [s, L]], PI / 2, null, s * t3 / 2);
      return F;
    }
    if (solid === 'pyramid' || solid === 'tetra') {
      if (solid === 'tetra') {
        var t = s * M.sqrt(3) / 2, A = [0, 0], B = [s, 0], Cn = [s / 2, t], fa = PI - M.acos(1 / 3), cen = add([A, B, Cn], -1, null, 0, null, s * t / 2);
        add([A, [A[0] + B[0] - Cn[0], A[1] + B[1] - Cn[1]], B], cen, [A, B], fa, null, s * t / 2);
        add([B, [B[0] + Cn[0] - A[0], B[1] + Cn[1] - A[1]], Cn], cen, [B, Cn], fa, null, s * t / 2);
        add([Cn, [Cn[0] + A[0] - B[0], Cn[1] + A[1] - B[1]], A], cen, [Cn, A], fa, null, s * t / 2);
        return F;
      }
      var sl = num(o.slant, 3), H = M.sqrt(M.max(0.01, sl * sl - s * s / 4)), fp = PI - M.atan2(H, s / 2), bs = add(rect(0, 0, s, s), -1, null, 0, null, s * s);
      add([[0, 0], [s / 2, -sl], [s, 0]], bs, [[0, 0], [s, 0]], fp, null, s * sl / 2);
      add([[s, 0], [s + sl, s / 2], [s, s]], bs, [[s, 0], [s, s]], fp, null, s * sl / 2);
      add([[s, s], [s / 2, s + sl], [0, s]], bs, [[s, s], [0, s]], fp, null, s * sl / 2);
      add([[0, s], [-sl, s / 2], [0, 0]], bs, [[0, s], [0, 0]], fp, null, s * sl / 2);
      return F;
    }
    if (solid === 'cylinder') {
      var rr2 = num(o.r, 1), hh = num(o.h, 3), N = 24, sw = TAU * rr2 / N, mid = N / 2, ids = [];
      ids[mid] = add(rect(mid * sw, 0, (mid + 1) * sw, hh), -1, null, 0, null, sw * hh);
      for (i = mid + 1; i < N; i++) ids[i] = add(rect(i * sw, 0, (i + 1) * sw, hh), ids[i - 1], [[i * sw, 0], [i * sw, hh]], TAU / N, null, sw * hh);
      for (i = mid - 1; i >= 0; i--) ids[i] = add(rect(i * sw, 0, (i + 1) * sw, hh), ids[i + 1], [[(i + 1) * sw, 0], [(i + 1) * sw, hh]], TAU / N, null, sw * hh);
      var Rp = sw / (2 * M.sin(PI / N)), ap = Rp * M.cos(PI / N), cxm = (mid + 0.5) * sw;
      [[0, -1], [hh, 1]].forEach(function (e) { var cy2 = e[0] + e[1] * ap, pts = []; for (var j = 0; j < N; j++) { var a = -e[1] * PI / 2 + PI / N + j * TAU / N; pts.push([cxm + Rp * M.cos(a), cy2 + Rp * M.sin(a)]); } add(pts, ids[mid], [[mid * sw, e[0]], [(mid + 1) * sw, e[0]]], PI / 2, null, PI * rr2 * rr2); });
      F.forEach(function (fc, j) { if (j > 0 && fc.p.length === 4) fc.smooth = 1; }); F[0].smooth = 1;
      return F;
    }
    return buildNet('cube', o);
  }
  function foldNet(F, t) { // world points of each face at fold amount t
    var memo = {};
    F.forEach(function (fc) { if (fc.parent >= 0 && fc.sgn === undefined) { var P0 = fc.hinge[0], Q0 = fc.hinge[1], cx = 0, cy = 0; fc.p.forEach(function (p) { cx += p[0] / fc.p.length; cy += p[1] / fc.p.length; }); fc.sgn = (Q0[0] - P0[0]) * (cy - P0[1]) - (Q0[1] - P0[1]) * (cx - P0[0]) > 0 ? 1 : -1; } });
    function place(fi, X) { var fc = F[fi]; if (fc.parent < 0) return X; var P0 = [fc.hinge[0][0], fc.hinge[0][1], 0], u = norm3([fc.hinge[1][0] - fc.hinge[0][0], fc.hinge[1][1] - fc.hinge[0][1], 0]); return place(fc.parent, rotAxis(X, P0, u, fc.sgn * fc.ang * t)); }
    return F.map(function (fc, fi) { return fc.p.map(function (p) { return place(fi, [p[0], p[1], 0]); }); });
  }
  function netOverlaps(F) { var W3 = foldNet(F, 1), cs = W3.map(function (pp) { var c = [0, 0, 0]; pp.forEach(function (p) { c[0] += p[0] / pp.length; c[1] += p[1] / pp.length; c[2] += p[2] / pp.length; }); return c; }); for (var i = 0; i < cs.length; i++) for (var j = i + 1; j < cs.length; j++) if (M.hypot(cs[i][0] - cs[j][0], cs[i][1] - cs[j][1], cs[i][2] - cs[j][2]) < 1e-3) return true; return false; }
  def('nets', function (el, o) {
    var solid = ['cube', 'prism', 'triprism', 'pyramid', 'tetra', 'cylinder'].indexOf(o.solid) >= 0 ? o.solid : 'cube';
    var S = shell(el, o, { name: 'nets', label: 'A net that folds into a solid', touch: 'none', height: 320 });
    var F = buildNet(solid, o), t = clamp(num(o.fold, 0), 0, 1), view = { yaw: -0.3, pitch: 0.95 }, anim = null, TT = taskOf(o), answered = null, bad = solid === 'cube' && (o.net || Array.isArray(o.net)) ? netOverlaps(F) : false;
    var COLS = ['#86d6ae', '#9cc6f2', '#f2d27c', '#f2a6a6', '#c3b3f2', '#8fd9e3'], COLD = ['#4f9c78', '#5b8fc4', '#b49a4c', '#c27272', '#8a74c9', '#4fa6b3'];
    function draw() {
      var W2 = S.c.w; S.height(clamp(W2 * 0.68, 260, 420)); var ctx = S.ctx, k = C(), H2 = S.c.h; ctx.clearRect(0, 0, W2, H2);
      var flat = foldNet(F, 0), now = foldNet(F, t), all0 = [], all1 = []; flat.forEach(function (pp) { all0 = all0.concat(pp); }); foldNet(F, 1).forEach(function (pp) { all1 = all1.concat(pp); });
      function ctr(A) { var mn = [1e9, 1e9, 1e9], mxv = [-1e9, -1e9, -1e9]; A.forEach(function (p) { for (var j = 0; j < 3; j++) { mn[j] = M.min(mn[j], p[j]); mxv[j] = M.max(mxv[j], p[j]); } }); return [(mn[0] + mxv[0]) / 2, (mn[1] + mxv[1]) / 2, (mn[2] + mxv[2]) / 2, M.max(mxv[0] - mn[0], mxv[1] - mn[1], mxv[2] - mn[2])]; }
      var c0 = ctr(all0), c1 = ctr(all1), e = ease(t), c = [lerp(c0[0], c1[0], e), lerp(c0[1], c1[1], e), lerp(c0[2], c1[2], e)], span = lerp(c0[3], c1[3] * 1.9, e);
      var sc = M.min(W2, H2 * 1.25) / (span * 1.15 + 0.5), pitch = turned ? view.pitch : lerp(view.pitch, 0.5, e);
      var faces = now.map(function (pp, i) { var fc = F[i], col = solid === 'cylinder' ? (fc.p.length > 4 ? (k.dark ? COLD[2] : COLS[2]) : (k.dark ? COLD[1] : COLS[1])) : (k.dark ? COLD : COLS)[i % 6]; return { p: pp, col: col, smooth: fc.smooth, label: t < 0.25 && (S.quiet ? o.labels === true : o.labels !== false) && !fc.smooth && fc.area ? f(fc.area) : null }; });
      draw3D(ctx, faces, { yaw: view.yaw, pitch: pitch, c: c, s: sc, cx: W2 / 2, cy: H2 / 2 });
      tx(ctx, 'drag to turn', W2 - 8, H2 - 10, { size: 11, al: 'right', col: k.muted });
      P.sync(); say();
    }
    function sa() { var s = 0; F.forEach(function (fc) { s += fc.area || 0; }); return s; }
    function say() {
      var s2 = num(o.s, 2), x;
      if (bad && t > 0.98) x = '<b>This pattern does not fold into a cube</b>: two squares land on the same face, and one face is left open.';
      else if (solid === 'cube') x = 'A cube has 6 square faces. Surface area = 6 × ' + f(s2) + '² = 6 × ' + f(s2 * s2) + ' = <b>' + f(6 * s2 * s2) + '</b> square units.';
      else if (solid === 'prism') { var l = num(o.l, 4), w = num(o.w, 3), h = num(o.h, 2); x = 'Three pairs of matching rectangles: 2 × (' + f(l) + ' × ' + f(w) + ') + 2 × (' + f(l) + ' × ' + f(h) + ') + 2 × (' + f(w) + ' × ' + f(h) + ') = 2 × ' + f(l * w) + ' + 2 × ' + f(l * h) + ' + 2 × ' + f(w * h) + ' = <b>' + f(2 * (l * w + l * h + w * h)) + '</b> square units.'; }
      else if (solid === 'triprism') x = '3 rectangles and 2 triangles. Surface area = 3 × (' + f(s2) + ' × ' + f(num(o.L, 4)) + ') + 2 × (½ × ' + f(s2) + ' × ' + f(s2 * M.sqrt(3) / 2) + ') ≈ <b>' + f(sa()) + '</b> square units.';
      else if (solid === 'pyramid') x = 'A square base and 4 triangles. Surface area = ' + f(s2) + '² + 4 × (½ × ' + f(s2) + ' × ' + f(num(o.slant, 3)) + ') = ' + f(s2 * s2) + ' + ' + f(2 * s2 * num(o.slant, 3)) + ' = <b>' + f(sa()) + '</b> square units.';
      else if (solid === 'tetra') x = '4 equilateral triangles. Surface area = 4 × (½ × ' + f(s2) + ' × ' + f(s2 * M.sqrt(3) / 2) + ') ≈ <b>' + f(sa()) + '</b> square units.';
      else { var r = num(o.r, 1), hc = num(o.h, 3); x = 'Two circles and a rectangle. The rectangle is as long as the circle\'s circumference, 2πr. Surface area = 2πr² + 2πrh = 2π(' + f(r) + ')² + 2π(' + f(r) + ')(' + f(hc) + ') ≈ <b>' + f(2 * PI * r * r + 2 * PI * r * hc) + '</b> square units.'; }
      S.say(x);
    }
    var turned = false; orbit(S, view, function () { if (!turned) { view.pitch = lerp(view.pitch, 0.5, ease(t)); turned = true; } draw(); }, { pmin: -0.2, pmax: 1.5 });
    var P = pads(S.stage, { list: function () { return [{ x: S.c.w / 2, y: S.c.h / 2, size: 54, label: 'The net. Arrow keys turn the view; Page Up and Page Down fold it.' }]; }, key: function (i, dx, dy, e, page) { if (page) { t = clamp(t + dy * 0.1, 0, 1); sl.set(t); } else { view.yaw += dx * 0.15; view.pitch = clamp(view.pitch + dy * 0.08, -0.2, 1.5); } draw(); } });
    var row = S.row();
    var bF = V.button(row, t > 0.5 ? 'Unfold' : 'Fold it up', function () { go(t > 0.5 ? 0 : 1); }, 'pri');
    function go(to) { if (anim) anim.stop(); var t0 = t; anim = tween(1800, function (p) { t = lerp(t0, to, p); sl.set(t); draw(); }, function () { bF.textContent = to ? 'Unfold' : 'Fold it up'; if (tk) tk.update(); }); }
    var sl = V.slider(row, { label: 'Fold', min: 0, max: 1, step: 0.01, value: t, fmt: function (v) { return f(v * 100, 0) + '%'; }, input: function (v) { if (anim) anim.stop(); t = v; draw(); } });
    var tk = null;
    if (TT && solid === 'cube') {
      var box = V.el('div', 'mlb-task'), q = V.el('p', 'mlb-task-q'), r2 = V.el('div', 'mlb-task-row'), msg = V.el('p', 'mlb-task-msg'); msg.setAttribute('aria-live', 'polite');
      q.innerHTML = '<span class="mlb-task-ic" aria-hidden="true"></span><span>' + (TT.text || 'Will this net fold into a cube?') + '</span>'; box.appendChild(q); box.appendChild(r2); S.el.insertBefore(box, S.stage);
      function ans(yes) { answered = yes; var right = yes === !bad; msg.className = 'mlb-task-msg ' + (right ? 'mlb-yes' : 'mlb-try'); msg.innerHTML = (right ? '✓ Right! ' : 'Let\'s check. ') + (bad ? 'Watch it fold: two squares meet on the same side.' : 'Watch it fold: every square finds its own side.'); go(1); if (right) { S.el.classList.add('mlb-done'); try { S.el.dispatchEvent(new CustomEvent('ml-task', { bubbles: true, detail: { ok: true, name: 'nets' } })); } catch (er) { } } }
      V.button(r2, 'Yes, it folds into a cube', function () { ans(true); }, 'pri'); V.button(r2, 'No, it doesn\'t', function () { ans(false); }); r2.appendChild(msg);
    }
    S.live(draw); draw();
  });

  /* ---------------------------------------------------------------- data helpers shared by dotplot and boxplot */
  function niceRange(vals, o, step) {
    var lo = vals.length ? M.min.apply(null, vals) : 0, hi = vals.length ? M.max.apply(null, vals) : 10;
    var mn = o.min != null ? num(o.min, 0) : M.floor((lo - step) / step) * step, mxv = o.max != null ? num(o.max, 10) : M.ceil((hi + step) / step) * step;
    if (mxv - mn < 10 * step && o.min == null && o.max == null) { var extra = 10 * step - (mxv - mn); mn -= M.floor(extra / 2 / step) * step; mxv = mn + 10 * step; if (lo >= 0 && mn < 0) { mxv -= mn; mn = 0; } }
    return [mn, mxv];
  }
  function stackOf(vals, step) { var cnt = {}, lv = []; vals.forEach(function (v) { var key = String(M.round(v / step)); cnt[key] = (cnt[key] || 0) + 1; lv.push(cnt[key] - 1); }); return { lv: lv, max: M.max.apply(null, [1].concat(Object.keys(cnt).map(function (k2) { return cnt[k2]; }))) }; }
  function statsLine(d, fm) { fm = fm || f; if (!d.length) return 'No data yet.'; var fv = five(d), md = modes(d); function eq(v) { var t = String(fm(v)); return /^≈/.test(t) ? ' ' + t : ' = ' + t; } return 'n = ' + d.length + ', mean' + eq(mean(d)) + ', median' + eq(fv.med) + ', mode = ' + (md.length ? md.map(function (v) { return fm(v); }).join(' and ') : 'none') + ', range' + eq(fv.max - fv.min); }
  /* number formats for data: whole numbers and short decimals as they are, a long decimal (a mean like 7/3) as ≈ 2.33;
     with fractions (a step or data value written like "1/4"), mixed numbers on a common denominator D. kind: 'html' or 'text' */
  function dataFmt(o, data0) {
    var D = 1, frac = false;
    [o.step].concat(data0 || []).forEach(function (v) { if (typeof v === 'string' && /\//.test(v)) { var q = parseQ(v); if (q) { frac = true; D = lcm(D, q.d); } } });
    function toQ(v) { // the simplest fraction within 1e-9 of v (continued fractions), so a mean of 9 values in eighths stays exact
      var sg = v < 0 ? -1 : 1, x = M.abs(v), h0 = 1, h1 = 0, k0 = 0, k1 = 1, b = x;
      for (var i = 0; i < 30; i++) { var a = M.floor(b), h2 = a * h0 + h1, k2 = a * k0 + k1; h1 = h0; h0 = h2; k1 = k0; k0 = k2; if (M.abs(x - h0 / k0) < 1e-9 || k0 > 1e6) break; b = 1 / (b - a); if (!isFinite(b)) break; }
      return rat(sg * h0, k0);
    }
    function short(v) { return near(v, M.round(v * 100) / 100, 1e-9) ? f(v) : '≈ ' + f(v, 2); }
    return {
      frac: frac,
      q: toQ,
      text: function (v) { if (!isFinite(v)) return '—'; return frac ? qText(toQ(v), 'mixed') : short(v); },
      html: function (v) { if (!isFinite(v)) return '—'; return frac ? qH(toQ(v), 'mixed') : short(v); }
    };
  }
  /* a draggable row of stacked dots: used inside dotplot and boxplot. sets: [{vals, y0 (axis y), col}] */
  function dotsUI(S, st) {
    // st: {sets: [[values]], X(v), V(px), step, lo, hi, r, base(i) -> y of the stack bottom, changed(), add: bool, onMove()}
    var drag = null;
    ptr(S.c.cv, {
      hit: function (x, y) { var best = null, bd = 1e9; st.sets.forEach(function (vals, si) { var sk = stackOf(vals, st.step).lv; vals.forEach(function (v, i) { var px = st.X(v), py = st.base(si) - st.r() - sk[i] * (2 * st.r() + 1), d = M.hypot(px - x, py - y); if (d < st.r() + 8 && d < bd) { bd = d; best = [si, i]; } }); }); return best; },
      start: function (h) { drag = h; },
      move: function (h, x, y) { var v = clamp(M.round(st.V(x) / st.step) * st.step, st.lo, st.hi); v = +v.toFixed(6); var arr = st.sets[h[0]]; st.off = st.add && y > st.base(h[0]) + 34; if (arr[h[1]] !== v) { arr[h[1]] = v; st.changed(true); } else st.changed(true); },
      end: function (h) { if (st.off && st.sets[h[0]].length > 1) { st.sets[h[0]].splice(h[1], 1); } st.off = false; drag = null; st.changed(false); },
      tap: function (x, y, h) { if (h || !st.add) return; var si = st.pickSet ? st.pickSet(y) : 0; if (si < 0) return; var v = clamp(M.round(st.V(x) / st.step) * st.step, st.lo, st.hi); if (st.sets[si].length < 60) { st.sets[si].push(+v.toFixed(6)); st.changed(false); } },
      over: function () { return st.add ? 'copy' : ''; }
    });
    var flat = function () { var out = []; st.sets.forEach(function (vals, si) { vals.forEach(function (v, i) { out.push([si, i]); }); }); return out; };
    var P = pads(S.stage, {
      roving: true,
      list: function () { return flat().map(function (h) { var vals = st.sets[h[0]], sk = stackOf(vals, st.step).lv; return { x: st.X(vals[h[1]]), y: st.base(h[0]) - st.r() - sk[h[1]] * (2 * st.r() + 1), size: M.max(24, 2 * st.r() + 8), label: (st.sets.length > 1 ? (st.names[h[0]] || 'Set ' + (h[0] + 1)) + ', ' : '') + 'value ' + (st.fmt || f)(vals[h[1]]) + '. Left and right arrows change it, up and down move to another dot' + (st.add ? ', Delete removes it.' : '.') }; }); },
      nav: function (i, dx, dy) { var fl = flat(); if (dx) { var h = fl[i], arr = st.sets[h[0]]; arr[h[1]] = clamp(+(arr[h[1]] + dx * st.step).toFixed(6), st.lo, st.hi); st.changed(false); return i; } var j = i - dy; return j >= 0 && j < fl.length ? j : null; },
      del: function (i) { var h = flat()[i]; if (!st.add || st.sets[h[0]].length <= 1) return; st.sets[h[0]].splice(h[1], 1); st.changed(false); var b = P.btn(M.max(0, i - 1)); if (b) b.focus(); }
    });
    return P;
  }
  function axisDraw(ctx, k, X, lo, hi, step, y, x0, x1, fmt) { // fmt: dataFmt(…) for fraction labels (stacked mixed numbers)
    ln(ctx, x0 - 6, y, x1 + 6, y, k.ink, 1.8);
    var fr2 = fmt && fmt.frac, px = (X(lo + step) - X(lo)), every = 1; while (px * every < (fr2 ? 34 : 26)) every = every === 1 ? 2 : every === 2 ? 4 : every * 2;
    for (var v = lo, i = 0; v <= hi + 1e-9; v = +(v + step).toFixed(9), i++) {
      var x = X(v); ln(ctx, x, y, x, y + (i % every ? 4 : 7), k.muted, 1.2);
      if (i % every) continue;
      if (fr2) qDraw(ctx, fmt.q(v), x, y + 24, { size: 11, form: 'mixed', col: k.muted, wt: 500 }); else tx(ctx, f(v), x, y + 18, { size: 12, col: k.muted });
    }
  }

  /* ================================================================ dotplot
     A dot plot. Drag a dot to change its value and watch the mean and median move; the mean moves toward an
     outlier, the median hardly moves. The mean is the balance point (the red triangle).
     opts:
       data: [2, 3, 3, 4, 5, 5, 5, 6, 8]   the values
       min, max            the ends of the number line (default: fits the data)
       step: 1             spacing of the values (0.5, 0.1 …); dragged dots snap to it. A fraction ("1/4", "1/8") gives a
                           line plot in fractions: the axis, mean, median and readout use mixed numbers (1 3/8)
                           Whole-number and decimal data show a mean that doesn't end as ≈ 2.33.
       show: ["mean", "median"]   what to mark: "mean", "median", "mode", "range", "mad" (learners can toggle each)
       add: true           tap above the line to add a value; drag a dot below the line to remove it
       label: ""           what the numbers measure, shown under the axis (e.g. "hours of sleep")
       task: {stat: "mean", target: 6}   "Make the mean 6." stat: mean, median, mode, range                       */
  def('dotplot', function (el, o) {
    var S = shell(el, o, { name: 'dotplot', label: 'A dot plot of data', touch: 'none', height: 220 });
    var step = num(o.step, 1), data = (o.data || [2, 3, 3, 4, 5, 5, 5, 6, 8]).map(function (v) { return num(v, 0); }), TT = taskOf(o), rg = niceRange(data, o, step), lo = rg[0], hi = rg[1];
    var show = {}; (o.show || ['mean', 'median']).forEach(function (s2) { show[s2] = 1; });
    var FM = dataFmt(o, o.data), ft = FM.text, fh = FM.html;
    var G = {}, prev = null, note = '';
    function X(v) { return G.x0 + (v - lo) / (hi - lo) * (G.x1 - G.x0); }
    function geo() { var w = S.c.w; G.x0 = 22; G.x1 = w - 22; var sk = stackOf(data, step).max, px = (G.x1 - G.x0) / ((hi - lo) / step); G.r = clamp(M.min(px / 2 - 1, 11), 3, 11); var hh = M.max(200, M.min(380, sk * (2 * G.r + 1) + 110)); G.r = M.min(G.r, (hh - 110) / (2 * sk) - 0.5); S.height(hh); G.ay = hh - 60; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(), y = G.ay; ctx.clearRect(0, 0, S.c.w, S.c.h);
      var fv = five(data), mu = mean(data), md = modes(data), sk = stackOf(data, step).lv;
      if (show.range && data.length) { ctx.save(); ctx.fillStyle = soft(k.teal, 0.12); ctx.fillRect(X(fv.min), 6, X(fv.max) - X(fv.min), y - 6); ctx.restore(); }
      data.forEach(function (v, i) { var isMode = show.mode && md.some(function (m) { return near(m, v); }); var py = y - G.r - 1 - sk[i] * (2 * G.r + 1); disc(ctx, X(v), py, G.r, isMode ? k.gold : k.blue, k.bg, 1.5); });
      if (show.mad && data.length) { ctx.save(); ctx.globalAlpha = 0.6; data.forEach(function (v, i) { var py = y - G.r - 1 - sk[i] * (2 * G.r + 1); ln(ctx, X(v), py, X(mu), py, k.orange, 1.5); }); ctx.restore(); }
      axisDraw(ctx, k, X, lo, hi, step, y, G.x0, G.x1, FM);
      var lx = FM.frac ? 12 : 0; // stacked fraction labels on the axis need a little more room below it
      if (o.label) tx(ctx, o.label, (G.x0 + G.x1) / 2, y + 36 + lx, { size: 12, col: k.muted });
      if (show.median && data.length) { var xm = X(fv.med); ln(ctx, xm, 16, xm, y, k.purple, 2, [6, 4]); tx(ctx, 'median' + (S.quiet ? '' : ' ' + ft(fv.med)), clamp(xm, 50, S.c.w - 50), 8, { size: 12, wt: 700, col: k.purple, halo: k.bg }); }
      if (show.mean && data.length) { var xu = X(mu); poly(ctx, [[xu, y + 2], [xu - 9, y + 16], [xu + 9, y + 16]], k.red); tx(ctx, 'mean' + (S.quiet ? '' : ' ' + ft(mu)), clamp(xu, 46, S.c.w - 46), y + (o.label ? 50 : 30) + lx, { size: 12, wt: 700, col: k.red, halo: k.bg }); }
      if (show.range && data.length) tx(ctx, 'range' + (S.quiet ? '' : ' ' + ft(fv.max - fv.min)), (X(fv.min) + X(fv.max)) / 2, 22, { size: 11, wt: 700, col: k.teal, halo: k.bg });
      P.sync(); say();
    }
    function say() {
      var s = statsLine(data, fh) + '.';
      if (show.mad && data.length) s += ' Mean absolute deviation = ' + fh(mad(data)) + ' (the average length of the orange lines).';
      if (note) s += '<br>' + note;
      S.say(s);
    }
    var st = { fmt: ft, sets: [data], X: function (v) { return X(v); }, V: function (px) { return lo + (px - G.x0) / (G.x1 - G.x0) * (hi - lo); }, step: step, lo: lo, hi: hi, r: function () { return G.r; }, base: function () { return G.ay; }, add: o.add !== false, names: [],
      changed: function (live) {
        if (!prev) prev = { mu: mean(data), med: median(data) };
        if (!live) { var mu = mean(data), me = median(data), dm = mu - prev.mu, dd = me - prev.med; note = near(dm, 0) && near(dd, 0) ? '' : 'The mean ' + (near(dm, 0) ? 'stayed at ' + fh(mu) : 'moved ' + (dm > 0 ? 'up ' : 'down ') + fh(M.abs(dm)) + ' to ' + fh(mu)) + '; the median ' + (near(dd, 0) ? 'stayed at ' + fh(me) : 'moved to ' + fh(me)) + '.'; prev = null; if (tk) tk.update(); }
        draw();
      } };
    var P = dotsUI(S, st);
    var row = S.row();
    [['mean', 'Mean'], ['median', 'Median'], ['mode', 'Mode'], ['range', 'Range'], ['mad', 'MAD']].forEach(function (z) { toggle(row, z[1], !!show[z[0]], function (on) { if (on) show[z[0]] = 1; else delete show[z[0]]; draw(); }); });
    var orig = data.slice(); V.button(row, 'Reset', function () { data.length = 0; orig.forEach(function (v) { data.push(v); }); note = ''; draw(); if (tk) tk.update(); });
    var statF = { mean: function () { return mean(data); }, median: function () { return median(data); }, range: function () { var fv = five(data); return fv.max - fv.min; }, mode: function () { var m = modes(data); return m.length === 1 ? m[0] : NaN; } };
    var tk = S.task({
      text: TT && ('Move, add or remove dots to make the ' + TT.stat + ' ' + TT.target + '.'),
      ok: function () { var fn = statF[TT.stat]; return fn && near(fn(), num(TT.target, 0), 1e-9); },
      hint: function () { var fn = statF[TT.stat]; return 'The ' + TT.stat + ' is ' + (fn ? fh(fn()) : '?') + ' now. ' + (TT.stat === 'mean' ? 'The total must be ' + TT.target + ' × ' + data.length + ' = ' + fh(num(TT.target, 0) * data.length) + '; it is ' + fh(mean(data) * data.length) + '.' : TT.stat === 'median' ? 'Put the values in order: the middle one (or the middle two) decide it.' : ''); }
    });
    S.live(draw); draw();
  });

  /* ================================================================ boxplot
     A box plot built from data shown as dots underneath. The box holds the middle half of the data; each whisker and
     each half of the box holds about a quarter of the data, even when it looks longer.
     opts:
       data: [ … ]          the values (default: 15 sample values)
       data2: null          a second data set to compare (drawn above the first, on the same scale)
       names: ["A", "B"]    names for the sets
       min, max, step       the scale (step is the snap for dragging dots; default 1)
       dots: true           show the data as dots under each box (drag them to see the box change)
       fences: false        mark outliers (more than 1.5 × IQR beyond the box) and stop the whiskers at the last value inside
       quarters: false      shade the four parts and label each "about 25%"
       add: true            tap to add a value; drag a dot below its line to remove it
       task: {stat: "iqr", target: 6}   stat: median, q1, q3, iqr, range
     Quartiles are the medians of the lower and upper halves (the middle value is left out when there are an odd
     number of values), the method most U.S. school courses use.                                                     */
  def('boxplot', function (el, o) {
    var S = shell(el, o, { name: 'boxplot', label: 'A box plot of data', touch: 'none', height: 220 });
    var step = num(o.step, 1), A = (o.data || [3, 5, 6, 7, 7, 8, 9, 9, 10, 11, 12, 12, 13, 15, 19]).map(function (v) { return num(v, 0); }), sets = [A], TT = taskOf(o), names = o.names || ['A', 'B'];
    if (o.data2) sets = [o.data2.map(function (v) { return num(v, 0); }), A];
    if (o.data2) names = [names[1] || 'B', names[0] || 'A'];
    var all = []; sets.forEach(function (s2) { all = all.concat(s2); }); var rg = niceRange(all, o, step), lo = rg[0], hi = rg[1], G = {}, dotsOn = o.dots !== false;
    function X(v) { return G.x0 + (v - lo) / (hi - lo) * (G.x1 - G.x0); }
    function geo() {
      var w = S.c.w; G.x0 = 22; G.x1 = w - 22; var px = (G.x1 - G.x0) / ((hi - lo) / step); G.r = clamp(px / 2 - 0.5, 2.5, 7);
      var mxs = M.max.apply(null, sets.map(function (s2) { return stackOf(s2, step).max; })); G.dotH = dotsOn ? M.min(mxs * (2 * G.r + 1), 90) : 0; if (dotsOn && mxs * (2 * G.r + 1) > 90) G.r = M.max(2, 90 / mxs / 2 - 0.5);
      G.rowH = 74 + G.dotH; S.height(sets.length * G.rowH + 44);
    }
    function base(si) { return 8 + si * G.rowH + 64 + G.dotH; }
    function draw() {
      geo(); var ctx = S.ctx, k = C(); ctx.clearRect(0, 0, S.c.w, S.c.h);
      sets.forEach(function (d, si) {
        if (!d.length) return; var fv = five(d), iqr = fv.q3 - fv.q1, top = 8 + si * G.rowH + 22, bh = 30, by = top, col = si === sets.length - 1 ? k.blue : k.purple;
        var lw = fv.min, hw = fv.max, out = [];
        if (o.fences) { var f1 = fv.q1 - 1.5 * iqr, f2 = fv.q3 + 1.5 * iqr; var inside = d.filter(function (v) { return v >= f1 - 1e-9 && v <= f2 + 1e-9; }); lw = M.min.apply(null, inside); hw = M.max.apply(null, inside); out = d.filter(function (v) { return v < f1 - 1e-9 || v > f2 + 1e-9; }); }
        if (o.quarters) { var qs2 = [lw, fv.q1, fv.med, fv.q3, hw], qc = [k.teal, k.gold, k.gold, k.teal]; for (var q = 0; q < 4; q++) { ctx.save(); ctx.fillStyle = soft(qc[q], 0.16); ctx.fillRect(X(qs2[q]), by - 4, X(qs2[q + 1]) - X(qs2[q]), bh + 8); ctx.restore(); if (X(qs2[q + 1]) - X(qs2[q]) > 30) tx(ctx, '25%', (X(qs2[q]) + X(qs2[q + 1])) / 2, by + 7, { size: 10, wt: 700, col: k.muted, halo: soft(k.bg, 0.7) }); } }
        ln(ctx, X(lw), by + bh / 2, X(fv.q1), by + bh / 2, col, 2); ln(ctx, X(fv.q3), by + bh / 2, X(hw), by + bh / 2, col, 2);
        ln(ctx, X(lw), by + 6, X(lw), by + bh - 6, col, 2); ln(ctx, X(hw), by + 6, X(hw), by + bh - 6, col, 2);
        fillRR(ctx, X(fv.q1), by, M.max(1, X(fv.q3) - X(fv.q1)), bh, 3, soft(col, 0.22), col, 2); ln(ctx, X(fv.med), by - 2, X(fv.med), by + bh + 2, k.red, 3);
        out.forEach(function (v) { disc(ctx, X(v), by + bh / 2, 5, k.bg, col, 2); });
        var labs = S.quiet ? [[fv.q1, 'Q1'], [fv.med, 'M'], [fv.q3, 'Q3']] : [[lw, f(lw)], [fv.q1, 'Q1 ' + f(fv.q1)], [fv.med, 'M ' + f(fv.med)], [fv.q3, 'Q3 ' + f(fv.q3)], [hw, f(hw)]], lastX = -1e9, lastY = 0; // quiet: names, no values
        labs.forEach(function (L) { var x = X(L[0]), wdt = tw(ctx, L[1], font(11, 600)) + 6, yy = by - 9; if (x - wdt / 2 < lastX + 2 && lastY === yy) yy = by - 21; tx(ctx, L[1], x, yy, { size: 11, wt: L[1][0] === 'M' ? 800 : 600, col: L[1][0] === 'M' ? k.red : k.ink, halo: k.bg }); lastX = x + wdt / 2; lastY = yy; });
        if (sets.length > 1) tx(ctx, names[si], 4, top - 12, { size: 12, wt: 700, al: 'left', col: col });
        if (dotsOn) { var sk = stackOf(d, step).lv, yb = base(si); ln(ctx, G.x0 - 4, yb + 1, G.x1 + 4, yb + 1, k.line, 1); d.forEach(function (v, i) { disc(ctx, X(v), yb - G.r - sk[i] * (2 * G.r + 1), G.r, soft(col, 0.85), k.bg, 1); }); }
      });
      axisDraw(ctx, k, X, lo, hi, step, S.c.h - 34, G.x0, G.x1);
      if (P) P.sync(); say();
    }
    function line(d) { var fv = five(d); return 'min ' + f(fv.min) + ', Q1 ' + f(fv.q1) + ', median ' + f(fv.med) + ', Q3 ' + f(fv.q3) + ', max ' + f(fv.max) + '. IQR = ' + f(fv.q3) + ' − ' + f(fv.q1) + ' = <b>' + f(fv.q3 - fv.q1) + '</b>, range = ' + f(fv.max - fv.min) + '.'; }
    function say() {
      var s = sets.map(function (d, si) { return (sets.length > 1 ? '<b>' + esc(names[si]) + '</b>: ' : '') + (d.length ? line(d) + ' n = ' + d.length + '.' : 'no data'); }).slice().reverse().join('<br>');
      if (o.fences) sets.forEach(function (d, si) { var fv = five(d), iqr = fv.q3 - fv.q1, out = d.filter(function (v) { return v < fv.q1 - 1.5 * iqr - 1e-9 || v > fv.q3 + 1.5 * iqr + 1e-9; }); if (out.length) s += '<br>' + (sets.length > 1 ? esc(names[si]) + ' outliers' : 'Outliers') + ' (beyond ' + f(fv.q1 - 1.5 * iqr) + ' or ' + f(fv.q3 + 1.5 * iqr) + '): ' + out.map(function (v) { return f(v); }).join(', ') + '.'; });
      if (sets.length === 1) s += '<br>Each whisker and each half of the box holds about a quarter of the values, even the parts that look longer.';
      S.say(s);
    }
    var P = null;
    if (dotsOn) P = dotsUI(S, { sets: sets, X: function (v) { return X(v); }, V: function (px) { return lo + (px - G.x0) / (G.x1 - G.x0) * (hi - lo); }, step: step, lo: lo, hi: hi, r: function () { return G.r; }, base: base, add: o.add !== false, names: names,
      pickSet: function (y) { for (var si = 0; si < sets.length; si++) if (y <= base(si) + 10 && y >= base(si) - G.dotH - 30) return si; return -1; },
      changed: function (live) { draw(); if (!live && tk) tk.update(); } });
    var row = S.row(), origS = sets.map(function (s2) { return s2.slice(); });
    if (dotsOn) V.button(row, 'Reset', function () { sets.forEach(function (s2, i) { s2.length = 0; origS[i].forEach(function (v) { s2.push(v); }); }); draw(); if (tk) tk.update(); });
    toggle(row, 'Quarters', !!o.quarters, function (on) { o.quarters = on; draw(); });
    toggle(row, 'Outliers', !!o.fences, function (on) { o.fences = on; draw(); });
    var sf = { median: function (fv) { return fv.med; }, q1: function (fv) { return fv.q1; }, q3: function (fv) { return fv.q3; }, iqr: function (fv) { return fv.q3 - fv.q1; }, range: function (fv) { return fv.max - fv.min; } };
    var tk = S.task({
      text: TT && ('Drag the dots to make the ' + ({ iqr: 'interquartile range', q1: 'first quartile', q3: 'third quartile' }[TT.stat] || TT.stat) + ' ' + TT.target + '.'),
      ok: function () { var d = sets[sets.length - 1], fv = five(d); return !!fv && sf[TT.stat] && near(sf[TT.stat](fv), num(TT.target, 0), 1e-9); },
      hint: function () { var fv = five(sets[sets.length - 1]); return 'It is ' + f(sf[TT.stat] ? sf[TT.stat](fv) : NaN) + ' now. ' + (TT.stat === 'iqr' ? 'Spread out or squeeze the middle half of the dots.' : 'Watch which dots decide it.'); }
    });
    S.live(draw); draw();
  });

  /* ---------------------------------------------------------------- boot */
  /* pure helpers, exposed for tests and for course files that want the same math */
  ML.vizBasic = { parseQ: parseQ, rat: rat, gcd: gcd, lcm: lcm, qText: qText, five: five, mean: mean, median: median, modes: modes, mad: mad, words: words, rootText: rootText, sq: sq,
    _nets: { build: buildNet, fold: foldNet, overlaps: netOverlaps }, _poly: { facts: polyFacts, classify: classify, area: areaOf }, _fewest: fewestCoins, _parts: factorParts, _side: sideParse };
  function boot() { if (!ML.viz || boot.done) return; boot.done = true; V = ML.viz; defs.forEach(function (d) { V.register(d[0], d[1]); }); }
  if (ML.viz) boot(); else if (D.addEventListener) D.addEventListener('DOMContentLoaded', boot);
})(window, document);
