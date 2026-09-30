/* Shared helpers for the Markets pages: TradingView widgets that follow the site theme, FRED data, transforms. */
(function (W, D) {
  'use strict';
  var BASE = (D.querySelector('meta[name="mk-base"]') || {}).content || '/markets/';
  function theme() { return D.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- TradingView ----------
  var widgets = [];
  var ATTR = '<div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Market data by TradingView</span></a></div>';
  // Script-based widgets: name is the part after "embed-widget-", e.g. "advanced-chart", "screener", "events".
  function tv(el, name, cfg, opts) {
    if (typeof el === 'string') el = D.querySelector(el);
    if (!el) return;
    var rec = { el: el, name: name, cfg: cfg, opts: opts || {} };
    widgets.push(rec); renderTV(rec);
    return rec;
  }
  function renderTV(rec) {
    var c = {}; for (var k in rec.cfg) c[k] = rec.cfg[k];
    var th = theme();
    if (rec.opts.themeKey !== false) c[rec.opts.themeKey || 'colorTheme'] = th;
    if (rec.name === 'advanced-chart') { c.theme = th; delete c.colorTheme; c.backgroundColor = th === 'dark' ? '#1d1e20' : '#ffffff'; c.gridColor = th === 'dark' ? 'rgba(242,242,242,0.06)' : 'rgba(46,46,46,0.06)'; }
    if (c.locale == null) c.locale = 'en';
    // The embed script resizes its parent to 100% x 100%, so it gets an inner box; the outer element (.mk-tv, with a fixed
    // height class for full-size widgets) sets the real size.
    rec.el.innerHTML = '<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div></div>' + ATTR;
    var inner = rec.el.firstChild;
    var s = D.createElement('script');
    s.type = 'text/javascript'; s.async = true;
    s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-' + rec.name + '.js';
    s.text = JSON.stringify(c);
    inner.appendChild(s);
  }
  // Web-component widgets (tv-mini-chart, tv-forex-table, ...): they follow the page's color-scheme.
  var loaded = {};
  function wc(el, tag, attrs) {
    if (typeof el === 'string') el = D.querySelector(el);
    if (!el) return;
    if (!loaded[tag]) {
      loaded[tag] = true;
      var s = D.createElement('script'); s.type = 'module'; s.src = 'https://widgets.tradingview-widget.com/w/en/' + tag + '.js'; D.head.appendChild(s);
    }
    var rec = { el: el, tag: tag, attrs: attrs || {}, wc: true };
    widgets.push(rec); renderWC(rec);
    return rec;
  }
  function renderWC(rec) {
    var e = D.createElement(rec.tag);
    for (var k in rec.attrs) { var v = rec.attrs[k]; if (v === true) e.setAttribute(k, ''); else if (v !== false && v != null) e.setAttribute(k, typeof v === 'string' ? v : JSON.stringify(v)); }
    e.setAttribute('theme', theme());
    rec.el.innerHTML = ''; rec.el.appendChild(e);
  }
  function refresh(rec) { if (rec.wc) renderWC(rec); else renderTV(rec); }
  function update(rec, cfg) { if (!rec) return; if (rec.wc) { for (var k in cfg) rec.attrs[k] = cfg[k]; } else { for (var j in cfg) rec.cfg[j] = cfg[j]; } refresh(rec); }
  // Re-draw widgets when the site's light/dark toggle changes.
  var lastTheme = theme();
  new MutationObserver(function () {
    var t = theme(); if (t === lastTheme) return; lastTheme = t;
    D.documentElement.style.colorScheme = t;
    widgets.forEach(function (w) { if (w.el.isConnected) refresh(w); });
  }).observe(D.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  D.documentElement.style.colorScheme = theme();

  // URL of our single-stock page, for widgets that link symbols to it
  function chartUrl() { return new URL(BASE + 'chart/', location.href).href; }

  // ---------- FRED data (downloaded by scripts/fetch_market_data.py) ----------
  var cache = {};
  function getJSON(path) {
    if (!cache[path]) cache[path] = fetch(BASE + 'data/' + path).then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + path); return r.json(); });
    return cache[path];
  }
  function fredIndex() { return getJSON('fred/index.json'); }
  function fred(id) {
    return getJSON('fred/' + id + '.json').then(function (d) { return d.t.map(function (t, i) { return [t * 864e5, d.v[i]]; }); });
  }
  // ---------- transforms ----------
  var YEAR = 365.25 * 864e5;
  function lookback(pts, i, span, tol) { // index of the point closest to pts[i].t - span
    var target = pts[i][0] - span, lo = 0, hi = i;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (pts[m][0] < target) lo = m; else hi = m; }
    var j = Math.abs(pts[lo][0] - target) <= Math.abs(pts[hi][0] - target) ? lo : hi;
    return Math.abs(pts[j][0] - target) <= tol ? j : -1;
  }
  var TRANSFORMS = {
    level: { name: 'Level', f: function (p) { return p; } },
    yoy: { name: 'YoY %', unit: '%', f: function (p) { var o = []; for (var i = 0; i < p.length; i++) { var j = lookback(p, i, YEAR, 20 * 864e5); if (j >= 0 && p[j][1]) o.push([p[i][0], (p[i][1] / p[j][1] - 1) * 100]); } return o; } },
    mom: { name: 'Change % (vs prior)', unit: '%', f: function (p) { var o = []; for (var i = 1; i < p.length; i++) if (p[i - 1][1]) o.push([p[i][0], (p[i][1] / p[i - 1][1] - 1) * 100]); return o; } },
    diff: { name: 'Change (vs prior)', f: function (p) { var o = []; for (var i = 1; i < p.length; i++) o.push([p[i][0], p[i][1] - p[i - 1][1]]); return o; } },
    yoydiff: { name: 'Change vs year ago', f: function (p) { var o = []; for (var i = 0; i < p.length; i++) { var j = lookback(p, i, YEAR, 20 * 864e5); if (j >= 0) o.push([p[i][0], p[i][1] - p[j][1]]); } return o; } },
    ann3: { name: '3-month annualized %', unit: '%', f: function (p) { var o = []; for (var i = 0; i < p.length; i++) { var j = lookback(p, i, YEAR / 4, 20 * 864e5); if (j >= 0 && p[j][1]) o.push([p[i][0], (Math.pow(p[i][1] / p[j][1], 4) - 1) * 100]); } return o; } },
    ma: { name: '12-month moving average', f: function (p) { var o = [], sum = 0, q = []; for (var i = 0; i < p.length; i++) { q.push(p[i]); sum += p[i][1]; while (q.length && q[0][0] < p[i][0] - YEAR + 864e5 * 5) { sum -= q.shift()[1]; } o.push([p[i][0], sum / q.length]); } return o; } },
    index100: { name: 'Rebased to 100 at start', f: function (p, x0) { var b = null; for (var i = 0; i < p.length; i++) if (p[i][0] >= (x0 || 0) && p[i][1]) { b = p[i][1]; break; } return b ? p.map(function (q) { return [q[0], q[1] / b * 100]; }) : p; } }
  };
  function recessions() {
    return fred('USREC').then(function (p) {
      var out = [], s = null;
      p.forEach(function (q, i) { if (q[1] === 1 && s == null) s = q[0]; if (q[1] !== 1 && s != null) { out.push([s, q[0]]); s = null; } });
      if (s != null) out.push([s, p[p.length - 1][0] + 30 * 864e5]);
      return out;
    }).catch(function () { return []; });
  }
  function dstr(t) { var d = new Date(t); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
  function download(name, rows) {
    var blob = new Blob([rows.map(function (r) { return r.join(','); }).join('\n')], { type: 'text/csv' });
    var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  var PALETTE = ['#1f6fb2', '#c0392b', '#2e8b57', '#b8862a', '#7b4fa0', '#e67e22', '#16a085', '#8a5a44'];

  W.MK = { BASE: BASE, theme: theme, esc: esc, tv: tv, wc: wc, update: update, chartUrl: chartUrl, getJSON: getJSON, fredIndex: fredIndex, fred: fred,
    TRANSFORMS: TRANSFORMS, recessions: recessions, dstr: dstr, download: download, PALETTE: PALETTE, YEAR: YEAR };
})(window, document);
