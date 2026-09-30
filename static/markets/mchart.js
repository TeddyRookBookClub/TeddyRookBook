/* MChart: a small dependency-free canvas line chart for time series (and numeric x, e.g. yield curves).
   Features: two y-axes, log scale, shaded bands (recessions), reference lines, crosshair tooltip,
   drag to zoom (double-click / "Reset" to undo), touch support, dark mode. */
(function (W, D) {
  'use strict';
  var DPR = Math.max(1, W.devicePixelRatio || 1);
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function isDark() { return D.documentElement.dataset.theme === 'dark'; }
  function fmtNum(v, dec) {
    if (v == null || !isFinite(v)) return '–';
    var a = Math.abs(v);
    if (dec == null) dec = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 2 : 3;
    if (a >= 1e12) return (v / 1e12).toFixed(2) + 'T';
    if (a >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtDate(t, span) {
    var d = new Date(t);
    if (span != null && span < 200 * 864e5) return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }
  function fullDate(t) { var d = new Date(t); return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); }
  function niceStep(range, n) {
    var raw = range / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }
  function lin(min, max, n) {
    if (min === max) { min -= 1; max += 1; }
    var s = niceStep(max - min, n), a = Math.floor(min / s) * s, out = [];
    for (var v = a; v <= max + s * 0.5; v += s) out.push(+v.toPrecision(12));
    return out;
  }
  function logTicks(min, max) {
    var out = [], lo = Math.floor(Math.log10(min)), hi = Math.ceil(Math.log10(max));
    for (var e = lo; e <= hi; e++) [1, 2, 5].forEach(function (m) { var v = m * Math.pow(10, e); if (v >= min * 0.999 && v <= max * 1.001) out.push(v); });
    if (out.length < 3) return lin(min, max, 5).filter(function (v) { return v > 0; });
    return out;
  }
  function timeTicks(t0, t1, n) {
    var span = t1 - t0, yr = 365.25 * 864e5, out = [];
    var d0 = new Date(t0);
    if (span > 3 * yr) {
      var years = span / yr, step = [1, 2, 5, 10, 20, 25, 50].find(function (s) { return years / s <= n; }) || 50;
      for (var y = Math.ceil(d0.getUTCFullYear() / step) * step; ; y += step) { var t = Date.UTC(y, 0, 1); if (t > t1) break; if (t >= t0) out.push([t, String(y)]); }
    } else {
      var months = span / (yr / 12), ms = [1, 2, 3, 6, 12].find(function (s) { return months / s <= n; }) || 12;
      var m = d0.getUTCFullYear() * 12 + d0.getUTCMonth() + 1;
      m = Math.ceil(m / ms) * ms;
      for (; ; m += ms) {
        var tt = Date.UTC(Math.floor(m / 12), m % 12, 1); if (tt > t1) break;
        if (tt >= t0) out.push([tt, (m % 12 === 0 ? String(Math.floor(m / 12)) : MONTHS[m % 12] + (ms >= 12 ? '' : ''))]);
      }
      if (out.length < 2 && span < 70 * 864e5) { out = []; var day = 864e5 * Math.max(1, Math.round(span / 864e5 / n)); for (var q = Math.ceil(t0 / day) * day; q <= t1; q += day) out.push([q, MONTHS[new Date(q).getUTCMonth()] + ' ' + new Date(q).getUTCDate()]); }
    }
    return out;
  }
  function bsearch(pts, t) { // index of nearest point by x
    var lo = 0, hi = pts.length - 1;
    if (hi < 0) return -1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (pts[mid][0] < t) lo = mid; else hi = mid; }
    return Math.abs(pts[lo][0] - t) <= Math.abs(pts[hi][0] - t) ? lo : hi;
  }

  function MChart(el, opts) {
    if (!(this instanceof MChart)) return new MChart(el, opts);
    this.el = el; this.o = opts || {}; this.series = []; this.view = null;
    el.classList.add('mc');
    el.innerHTML = '<canvas></canvas><div class="mc-tip" hidden></div><button type="button" class="mc-reset" hidden>Reset zoom</button><div class="mc-empty" hidden></div>';
    this.cv = el.querySelector('canvas'); this.ctx = this.cv.getContext('2d'); this.tip = el.querySelector('.mc-tip');
    var self = this;
    el.querySelector('.mc-reset').onclick = function () { self.view = null; self.draw(); };
    this._bind();
    if (W.ResizeObserver) new ResizeObserver(function () { self.draw(); }).observe(el);
    else W.addEventListener('resize', function () { self.draw(); });
    // redraw when the site theme is toggled
    new MutationObserver(function () { self.draw(); }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  MChart.fmt = fmtNum; MChart.fullDate = fullDate; MChart.isDark = isDark;
  MChart.prototype.set = function (series, opts) {
    this.series = (series || []).filter(function (s) { return s && s.pts && s.pts.length; });
    if (opts) for (var k in opts) this.o[k] = opts[k];
    this.view = null; this.draw();
  };
  MChart.prototype._layout = function () {
    var w = this.el.clientWidth, h = this.o.height || this.el.clientHeight || 360;
    var hasR = this.series.some(function (s) { return s.axis === 'right'; });
    return { w: w, h: h, l: 58, r: hasR ? 58 : 14, t: 12, b: 28 };
  };
  MChart.prototype._domain = function () {
    var xs = [], self = this;
    this.series.forEach(function (s) { xs.push(s.pts[0][0], s.pts[s.pts.length - 1][0]); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    if (this.o.x0 != null) x0 = Math.max(x0, this.o.x0);
    if (this.o.x1 != null) x1 = Math.min(x1, this.o.x1);
    if (this.view) { x0 = this.view[0]; x1 = this.view[1]; }
    var ax = { left: [Infinity, -Infinity], right: [Infinity, -Infinity] };
    this.series.forEach(function (s) {
      var a = ax[s.axis === 'right' ? 'right' : 'left'];
      s.pts.forEach(function (p) { if (p[0] >= x0 && p[0] <= x1 && p[1] != null && isFinite(p[1])) { if (p[1] < a[0]) a[0] = p[1]; if (p[1] > a[1]) a[1] = p[1]; } });
      if (s.type === 'bar' && a[0] > 0) a[0] = 0;
      if (s.type === 'bar' && a[1] < 0) a[1] = 0;
    });
    (this.o.refLines || []).forEach(function (r) { var a = ax[r.axis === 'right' ? 'right' : 'left']; if (r.include) { a[0] = Math.min(a[0], r.y); a[1] = Math.max(a[1], r.y); } });
    ['left', 'right'].forEach(function (k) {
      var a = ax[k]; if (!isFinite(a[0])) return;
      var log = self.o[k === 'left' ? 'logLeft' : 'logRight'] && a[0] > 0;
      if (log) { a.log = true; a.ticks = logTicks(a[0], a[1]); a[0] = Math.min(a[0], a.ticks[0]); a[1] = Math.max(a[1], a.ticks[a.ticks.length - 1]); }
      else { var pad = (a[1] - a[0]) * 0.06 || Math.abs(a[0]) * 0.1 || 1; a[0] -= pad; a[1] += pad; a.ticks = lin(a[0], a[1], 6).filter(function (v) { return v >= a[0] && v <= a[1]; }); }
    });
    return { x0: x0, x1: x1, ax: ax };
  };
  MChart.prototype.draw = function () {
    var L = this._layout(), cv = this.cv, ctx = this.ctx, o = this.o, dark = isDark();
    cv.width = Math.max(1, L.w * DPR); cv.height = L.h * DPR; cv.style.width = L.w + 'px'; cv.style.height = L.h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, L.w, L.h);
    var empty = this.el.querySelector('.mc-empty');
    this.el.querySelector('.mc-reset').hidden = !this.view;
    if (!this.series.length) { empty.hidden = false; empty.textContent = o.emptyText || 'No data'; this.geom = null; return; }
    empty.hidden = true;
    var dm = this._domain(), x0 = dm.x0, x1 = dm.x1; if (x1 <= x0) x1 = x0 + 1;
    var pw = L.w - L.l - L.r, ph = L.h - L.t - L.b;
    var X = function (t) { return L.l + (t - x0) / (x1 - x0) * pw; };
    var Ys = {};
    ['left', 'right'].forEach(function (k) {
      var a = dm.ax[k]; if (!isFinite(a[0])) return;
      Ys[k] = a.log ? function (v) { return v > 0 ? L.t + ph - (Math.log(v) - Math.log(a[0])) / (Math.log(a[1]) - Math.log(a[0])) * ph : NaN; }
        : function (v) { return L.t + ph - (v - a[0]) / (a[1] - a[0]) * ph; };
    });
    var grid = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)', txt = dark ? '#aab4ae' : '#5d6862';
    ctx.font = '11px system-ui,-apple-system,sans-serif'; ctx.textBaseline = 'middle';
    // shaded bands (e.g. recessions)
    (o.shade || []).forEach(function (b) {
      var a = Math.max(b[0], x0), z = Math.min(b[1], x1); if (z <= a) return;
      ctx.fillStyle = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; ctx.fillRect(X(a), L.t, Math.max(1, X(z) - X(a)), ph);
    });
    // y grid + labels
    var fmtL = o.fmtLeft || function (v) { return fmtNum(v); }, fmtR = o.fmtRight || function (v) { return fmtNum(v); };
    if (Ys.left) dm.ax.left.ticks.forEach(function (v) { var y = Ys.left(v); ctx.strokeStyle = grid; ctx.beginPath(); ctx.moveTo(L.l, y); ctx.lineTo(L.l + pw, y); ctx.stroke(); ctx.fillStyle = txt; ctx.textAlign = 'right'; ctx.fillText(fmtL(v), L.l - 6, y); });
    if (Ys.right) dm.ax.right.ticks.forEach(function (v) { var y = Ys.right(v); ctx.fillStyle = txt; ctx.textAlign = 'left'; ctx.fillText(fmtR(v), L.l + pw + 6, y); });
    // x ticks
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var xt = o.xType === 'num' ? (o.xTicks || lin(x0, x1, 8).map(function (v) { return [v, String(v)]; })) : timeTicks(x0, x1, Math.max(3, Math.floor(pw / 80)));
    xt.forEach(function (tk) { if (tk[0] < x0 || tk[0] > x1) return; var x = X(tk[0]); ctx.strokeStyle = grid; ctx.beginPath(); ctx.moveTo(x, L.t); ctx.lineTo(x, L.t + ph); ctx.stroke(); ctx.fillStyle = txt; ctx.fillText(tk[1], x, L.t + ph + 6); });
    // reference lines
    (o.refLines || []).forEach(function (r) {
      var Y = Ys[r.axis === 'right' ? 'right' : 'left']; if (!Y) return; var y = Y(r.y); if (!(y >= L.t && y <= L.t + ph)) return;
      ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = r.color || (dark ? '#c9a24a' : '#b8963e'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L.l, y); ctx.lineTo(L.l + pw, y); ctx.stroke(); ctx.restore();
      if (r.label) { ctx.fillStyle = r.color || '#b8963e'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText(r.label, L.l + 4, y - 2); }
    });
    // vertical markers
    (o.vlines || []).forEach(function (v) {
      if (v.x < x0 || v.x > x1) return; var x = X(v.x);
      ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = v.color || (dark ? '#c9a24a' : '#b8963e'); ctx.beginPath(); ctx.moveTo(x, L.t); ctx.lineTo(x, L.t + ph); ctx.stroke(); ctx.restore();
      if (v.label) { ctx.save(); ctx.fillStyle = v.color || '#b8963e'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(v.label, x + 3, L.t + 2); ctx.restore(); }
    });
    // series
    ctx.save(); ctx.beginPath(); ctx.rect(L.l, L.t, pw, ph); ctx.clip();
    this.series.forEach(function (s) {
      var Y = Ys[s.axis === 'right' ? 'right' : 'left']; if (!Y) return;
      var pts = s.pts, i0 = Math.max(0, bsearch(pts, x0) - 1), i1 = Math.min(pts.length - 1, bsearch(pts, x1) + 1);
      ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = s.width || 1.8; ctx.lineJoin = 'round';
      if (s.type === 'bar') {
        var n = i1 - i0 + 1, bw = Math.max(1, pw / Math.max(1, n) * 0.7), yz = Y(0);
        for (var i = i0; i <= i1; i++) { var v = pts[i][1]; if (v == null) continue; var y = Y(v); ctx.fillStyle = s.color2 && v < 0 ? s.color2 : s.color; ctx.fillRect(X(pts[i][0]) - bw / 2, Math.min(y, yz), bw, Math.abs(yz - y) || 1); }
        return;
      }
      // decimate: at most ~2 points per pixel (keep min/max per bucket)
      ctx.beginPath(); var started = false;
      for (var j = i0; j <= i1; j++) {
        var p = pts[j]; if (p[1] == null || !isFinite(p[1])) { started = false; continue; }
        var px = X(p[0]), py = Y(p[1]); if (!isFinite(py)) continue;
        if (!started) { ctx.moveTo(px, py); started = true; continue; }
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      if (s.type === 'area') {
        ctx.lineTo(X(pts[i1][0]), L.t + ph); ctx.lineTo(X(pts[i0][0]), L.t + ph); ctx.closePath();
        ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1;
      }
      if (s.dots) for (var k = i0; k <= i1; k++) { if (pts[k][1] == null) continue; ctx.beginPath(); ctx.arc(X(pts[k][0]), Y(pts[k][1]), 3, 0, 7); ctx.fill(); }
    });
    ctx.restore();
    // axes border
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.moveTo(L.l, L.t); ctx.lineTo(L.l, L.t + ph); ctx.lineTo(L.l + pw, L.t + ph); ctx.stroke();
    this.geom = { L: L, pw: pw, ph: ph, x0: x0, x1: x1, X: X, Ys: Ys };
    if (this._sel) { ctx.fillStyle = 'rgba(0,76,42,.15)'; ctx.fillRect(Math.min(this._sel[0], this._sel[1]), L.t, Math.abs(this._sel[1] - this._sel[0]), ph); }
    if (this._hx != null) this._hover(this._hx, true);
  };
  MChart.prototype._hover = function (mx, noRedraw) {
    var g = this.geom; if (!g) return;
    if (mx < g.L.l || mx > g.L.l + g.pw) { this.tip.hidden = true; this._hx = null; if (!noRedraw) this.draw(); return; }
    if (!noRedraw) { this._hx = mx; this.draw(); return; }
    var t = g.x0 + (mx - g.L.l) / g.pw * (g.x1 - g.x0), ctx = this.ctx, o = this.o, dark = isDark();
    ctx.strokeStyle = dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.3)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(mx, g.L.t); ctx.lineTo(mx, g.L.t + g.ph); ctx.stroke(); ctx.setLineDash([]);
    var rows = [], tt = null;
    this.series.forEach(function (s) {
      var i = bsearch(s.pts, t); if (i < 0) return; var p = s.pts[i];
      var Y = g.Ys[s.axis === 'right' ? 'right' : 'left']; if (!Y || p[1] == null) return;
      if (tt == null || Math.abs(p[0] - t) < Math.abs(tt - t)) tt = p[0];
      ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(g.X(p[0]), Y(p[1]), 3.5, 0, 7); ctx.fill();
      rows.push('<div><i style="background:' + s.color + '"></i>' + s.name + ': <b>' + (s.fmt ? s.fmt(p[1]) : fmtNum(p[1])) + '</b>' + (o.xType === 'num' ? '' : ' <small>' + (s.freqLabel ? s.freqLabel(p[0]) : fullDate(p[0])) + '</small>') + '</div>');
    });
    var head = o.xType === 'num' ? (o.xLabel ? o.xLabel(tt) : fmtNum(tt)) : (o.dateLabel ? o.dateLabel(tt) : fullDate(tt));
    this.tip.innerHTML = '<div class="mc-th">' + head + '</div>' + rows.join('');
    this.tip.hidden = false;
    var tw = this.tip.offsetWidth, left = mx + 14; if (left + tw > g.L.w - 4) left = mx - tw - 14;
    this.tip.style.left = Math.max(4, left) + 'px'; this.tip.style.top = (g.L.t + 6) + 'px';
  };
  MChart.prototype._bind = function () {
    var self = this, cv = this.cv, down = null;
    function pos(e) { var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; return p.clientX - r.left; }
    cv.addEventListener('mousemove', function (e) { var x = pos(e); if (down != null) { self._sel = [down, x]; self._hx = null; self.draw(); } else self._hover(x); });
    cv.addEventListener('mouseleave', function () { self._hx = null; self.tip.hidden = true; if (down == null) self.draw(); });
    cv.addEventListener('mousedown', function (e) { if (self.o.noZoom) return; down = pos(e); });
    W.addEventListener('mouseup', function (e) {
      if (down == null) return; var g = self.geom, sel = self._sel; down = null; self._sel = null;
      if (g && sel && Math.abs(sel[1] - sel[0]) > 8) {
        var a = Math.max(g.L.l, Math.min(sel[0], sel[1])), b = Math.min(g.L.l + g.pw, Math.max(sel[0], sel[1]));
        self.view = [g.x0 + (a - g.L.l) / g.pw * (g.x1 - g.x0), g.x0 + (b - g.L.l) / g.pw * (g.x1 - g.x0)];
      }
      self.draw();
    });
    cv.addEventListener('dblclick', function () { self.view = null; self.draw(); });
    cv.addEventListener('touchstart', function (e) { self._hover(pos(e)); }, { passive: true });
    cv.addEventListener('touchmove', function (e) { self._hover(pos(e)); }, { passive: true });
  };
  W.MChart = MChart;
})(window, document);
