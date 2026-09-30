/* Economic data explorer: chart and compare FRED series with transforms, two axes and recession shading. */
(function (W, D) {
  'use strict';
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var root = $('#ib'); if (!root) return;
  var META = {}, CATS = [], REC = [], chart, state;
  var PRESETS = [
    ['🏭 Factory surveys', [['GACDFSA066MSFRBPHI', 'level'], ['GACDISA066MSFRBNY', 'level']], { ref: 0, range: '20y' }],
    ['👷 Jobs', [['UNRATE', 'level'], ['PAYEMS', 'diff', 'right']], { range: '10y' }],
    ['🛒 Inflation', [['CPIAUCSL', 'yoy'], ['CPILFESL', 'yoy'], ['PCEPILFE', 'yoy']], { ref: 2, range: '20y' }],
    ['📉 Yield-curve spreads', [['T10Y2Y', 'level'], ['T10Y3M', 'level']], { ref: 0, range: 'max' }],
    ['🏦 Fed & Treasury rates', [['DFF', 'level'], ['DGS2', 'level'], ['DGS10', 'level']], { range: '30y' }],
    ['🚨 Recession watch', [['SAHMREALTIME', 'level'], ['T10Y3M', 'level', 'right']], { ref: 0.5, range: 'max' }],
    ['🙂 Consumers', [['UMCSENT', 'level'], ['MICH', 'level', 'right']], { range: 'max' }],
    ['🏠 Housing', [['HOUST', 'level'], ['MORTGAGE30US', 'level', 'right']], { range: '30y' }],
    ['💳 Credit & stress', [['BAMLH0A0HYM2', 'level'], ['NFCI', 'level', 'right']], { range: 'max' }],
    ['💵 Money & the Fed', [['WALCL', 'level'], ['M2SL', 'yoy', 'right']], { range: '20y' }],
    ['🛢️ Oil & the dollar', [['DCOILWTICO', 'level'], ['DTWEXBGS', 'level', 'right']], { range: '10y' }],
    ['₿ Bitcoin (log scale)', [['CBBTCUSD', 'level']], { log: true, range: 'max' }],
    ['🌡️ VIX since 1990', [['VIXCLS', 'level']], { ref: 20, range: 'max' }]
  ];
  var RANGES = [['1y', 1], ['2y', 2], ['5y', 5], ['10y', 10], ['20y', 20], ['30y', 30], ['max', 0]];

  function defaultState() { return { s: [{ id: 'GACDFSA066MSFRBPHI', tf: 'level', axis: 'left' }, { id: 'GACDISA066MSFRBNY', tf: 'level', axis: 'left' }], range: '20y', from: '', to: '', rec: true, logL: false, logR: false, ref: '0' }; }
  function parseHash() {
    var h = location.hash.replace(/^#/, ''); if (!h) return null;
    var q = new URLSearchParams(h), st = defaultState();
    if (q.get('s')) st.s = q.get('s').split(',').map(function (x) { var p = x.split(':'); return { id: p[0], tf: p[1] || 'level', axis: p[2] === 'r' ? 'right' : 'left' }; });
    if (q.get('r')) st.range = q.get('r');
    if (q.get('from')) st.from = q.get('from'); if (q.get('to')) st.to = q.get('to');
    st.rec = q.get('rec') !== '0'; st.logL = q.get('log') === '1'; st.ref = q.get('ref') || '';
    if (!q.get('ref') && q.get('s') && !q.get('r')) st.range = 'max';
    return st;
  }
  function writeHash() {
    var q = 's=' + state.s.map(function (x) { return x.id + ':' + x.tf + (x.axis === 'right' ? ':r' : ''); }).join(',') + '&r=' + state.range +
      (state.from ? '&from=' + state.from : '') + (state.to ? '&to=' + state.to : '') + (state.rec ? '' : '&rec=0') + (state.logL ? '&log=1' : '') + (state.ref !== '' ? '&ref=' + state.ref : '');
    history.replaceState(null, '', '#' + q);
    try { localStorage.setItem('mk-ind', q); } catch (e) { }
  }

  function ui() {
    root.innerHTML =
      '<div class="mk-grid side">' +
      '<section class="mk-box"><div class="mk-row" style="justify-content:space-between;margin-bottom:.4rem"><span class="mk-seg" id="ib-range">' + RANGES.map(function (r) { return '<button type="button" data-r="' + r[0] + '">' + r[0].toUpperCase() + '</button>'; }).join('') + '</span>' +
      '<span class="mk-row"><label>From <input type="date" id="ib-from"></label><label>To <input type="date" id="ib-to"></label></span></div>' +
      '<div id="ib-chart" class="mc" style="height:460px"></div>' +
      '<div class="mk-row" style="margin-top:.5rem"><label><input type="checkbox" id="ib-rec"> Shade recessions</label><label><input type="checkbox" id="ib-log"> Log scale (left)</label>' +
      '<label>Reference line <input type="number" id="ib-ref" step="any" style="width:80px" placeholder="none"></label>' +
      '<button type="button" class="mk-btn" id="ib-csv">⬇ Download CSV</button><button type="button" class="mk-btn" id="ib-link">🔗 Copy link</button></div>' +
      '<p class="mk-note">Hover or tap to read values. Drag across the chart to zoom in; double-click to zoom out. Gray bars are NBER recessions.</p>' +
      '<div class="mk-lat" id="ib-lat"></div></section>' +
      '<aside class="mk-grid" style="align-content:start"><section class="mk-box"><h3>Series on the chart <small>up to 6</small></h3><div class="ib-series" id="ib-series"></div>' +
      '<div class="search-pop"><input type="text" id="ib-q" placeholder="🔍 Add a series: search e.g. CPI, claims, 10-year…" style="width:100%"><div class="search-list" id="ib-list" hidden></div></div>' +
      '<button type="button" class="mk-btn" id="ib-browse" style="margin-top:.5rem;width:100%">Browse all series by category</button></section>' +
      '<section class="mk-box"><h3>Quick views</h3><div class="ib-presets">' + PRESETS.map(function (p, i) { return '<button type="button" class="mk-btn" data-p="' + i + '">' + p[0] + '</button>'; }).join('') + '</div></section>' +
      '<section class="mk-box mk-note" id="ib-pmi" style="margin:0"><b>Looking for the ISM PMI?</b> ISM licenses its PMI data and does not allow free redistribution (it was removed from FRED in 2016), so it can’t be charted here. The Philadelphia and New York Fed factory surveys (“🏭 Factory surveys”) come from the same kind of questionnaire and move closely with it. For the ISM Manufacturing PMI itself, back to 1948, see <a href="https://www.tradingview.com/symbols/ECONOMICS-USBCOI/" target="_blank" rel="noopener">TradingView’s ISM page</a> (open “All time”).</section></aside></div>';
    chart = new MChart($('#ib-chart'), { emptyText: 'Add a series from the list →' });
    $('#ib-range').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; state.range = b.dataset.r; state.from = state.to = ''; draw(); });
    $('#ib-from').addEventListener('change', function () { state.from = this.value; state.range = 'custom'; draw(); });
    $('#ib-to').addEventListener('change', function () { state.to = this.value; state.range = 'custom'; draw(); });
    $('#ib-rec').addEventListener('change', function () { state.rec = this.checked; draw(); });
    $('#ib-log').addEventListener('change', function () { state.logL = this.checked; draw(); });
    $('#ib-ref').addEventListener('change', function () { state.ref = this.value; draw(); });
    $('#ib-csv').addEventListener('click', csv);
    $('#ib-link').addEventListener('click', function () { var b = this; (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(function () { b.textContent = '✓ Copied'; setTimeout(function () { b.textContent = '🔗 Copy link'; }, 1500); }).catch(function () { prompt('Copy this link:', location.href); }); });
    D.querySelector('.ib-presets').addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) return; var p = PRESETS[+b.dataset.p];
      state.s = p[1].filter(function (x) { return META[x[0]]; }).map(function (x) { return { id: x[0], tf: x[1], axis: x[2] || 'left' }; });
      state.range = p[2].range || '20y'; state.from = state.to = ''; state.logL = !!p[2].log; state.ref = p[2].ref != null ? String(p[2].ref) : '';
      draw(); $('#ib-chart').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    var q = $('#ib-q'), list = $('#ib-list'), hl = -1;
    function results(txt) {
      txt = txt.trim().toLowerCase();
      var words = txt.split(/\s+/).filter(Boolean);
      var m = Object.keys(META).map(function (k) { return META[k]; }).filter(function (s) { var hay = (s.title + ' ' + s.id + ' ' + s.cat + ' ' + s.units).toLowerCase(); return words.every(function (w) { return hay.indexOf(w) >= 0; }); });
      var html = '', last = '';
      CATS.forEach(function (c) { m.filter(function (s) { return s.cat === c; }).forEach(function (s) { if (c !== last) { html += '<div class="grp">' + MK.esc(c) + '</div>'; last = c; } html += '<button type="button" data-id="' + s.id + '">' + MK.esc(s.title) + ' <small>' + s.id + ' · ' + yr(s.first) + '–' + yr(s.last) + '</small></button>'; }); });
      list.innerHTML = html || '<div class="grp">No match</div>'; list.hidden = false; hl = -1;
    }
    q.addEventListener('input', function () { results(q.value); });
    q.addEventListener('focus', function () { results(q.value); });
    $('#ib-browse').addEventListener('click', function () { q.focus(); results(''); });
    q.addEventListener('keydown', function (e) {
      var bs = list.querySelectorAll('button'); if (!bs.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length; Array.prototype.forEach.call(bs, function (b, i) { b.classList.toggle('hl', i === hl); }); bs[hl].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') { e.preventDefault(); (bs[hl] || bs[0]).click(); }
      if (e.key === 'Escape') list.hidden = true;
    });
    list.addEventListener('click', function (e) { var b = e.target.closest('[data-id]'); if (!b) return; add(b.dataset.id); list.hidden = true; q.value = ''; });
    D.addEventListener('click', function (e) { if (!e.target.closest('.search-pop') && e.target.id !== 'ib-browse') list.hidden = true; });
    $('#ib-series').addEventListener('change', function (e) {
      var row = e.target.closest('[data-i]'); if (!row) return; var s = state.s[+row.dataset.i];
      if (e.target.dataset.k === 'tf') s.tf = e.target.value; if (e.target.dataset.k === 'axis') s.axis = e.target.value; draw();
    });
    $('#ib-series').addEventListener('click', function (e) { var b = e.target.closest('.ib-x'); if (!b) return; state.s.splice(+b.closest('[data-i]').dataset.i, 1); draw(); });
  }
  function yr(days) { return new Date(days * 864e5).getUTCFullYear(); }
  function add(id) {
    if (state.s.some(function (s) { return s.id === id; })) return;
    if (state.s.length >= 6) state.s.shift();
    var m = META[id], tf = /Index|Millions|Billions|Thousands/.test(m.units) && /Inflation|Money/.test(m.cat) ? 'yoy' : 'level';
    var axis = state.s.length && META[state.s[0].id] && META[state.s[0].id].units !== m.units ? 'right' : 'left';
    state.s.push({ id: id, tf: tf, axis: axis }); if (state.range === '1y' || state.range === '2y') state.range = '20y'; draw();
  }
  function seriesRows() {
    $('#ib-series').innerHTML = state.s.map(function (s, i) {
      var m = META[s.id] || { title: s.id, units: '' };
      return '<div class="ib-s" data-i="' + i + '"><i style="background:' + MK.PALETTE[i % 8] + '"></i><div class="nm">' + MK.esc(m.title) + '<small>' + MK.esc(m.units) + '</small></div>' +
        '<span class="ctl"><select data-k="tf" title="Transform">' + Object.keys(MK.TRANSFORMS).map(function (k) { return '<option value="' + k + '"' + (k === s.tf ? ' selected' : '') + '>' + MK.TRANSFORMS[k].name + '</option>'; }).join('') + '</select>' +
        '<select data-k="axis" class="ax" title="Axis"><option value="left"' + (s.axis !== 'right' ? ' selected' : '') + '>Left axis</option><option value="right"' + (s.axis === 'right' ? ' selected' : '') + '>Right axis</option></select>' +
        '<button type="button" class="ib-x" title="Remove">×</button></div>';
    }).join('') || '<p class="mk-note">No series yet.</p>';
  }
  function bounds() {
    var now = Date.now(), x0 = null, x1 = null;
    if (state.range === 'custom') { if (state.from) x0 = Date.parse(state.from); if (state.to) x1 = Date.parse(state.to); }
    else { var r = RANGES.filter(function (x) { return x[0] === state.range; })[0]; if (r && r[1]) x0 = now - r[1] * MK.YEAR; }
    return [x0, x1];
  }
  var DATA = {}, lastRows = [];
  function draw() {
    state.s = state.s.filter(function (s) { return META[s.id]; });
    writeHash(); seriesRows();
    Array.prototype.forEach.call($('#ib-range').children, function (b) { b.classList.toggle('on', b.dataset.r === state.range); });
    $('#ib-rec').checked = state.rec; $('#ib-log').checked = state.logL; $('#ib-ref').value = state.ref;
    var bd = bounds(); $('#ib-from').value = state.from || (bd[0] ? MK.dstr(bd[0]) : ''); $('#ib-to').value = state.to || '';
    Promise.all(state.s.map(function (s) { return DATA[s.id] ? Promise.resolve(DATA[s.id]) : MK.fred(s.id).then(function (p) { DATA[s.id] = p; return p; }); })).then(function (all) {
      var series = state.s.map(function (s, i) {
        var m = META[s.id], T = MK.TRANSFORMS[s.tf] || MK.TRANSFORMS.level, pts = T.f(all[i], bd[0]);
        var unit = T.unit || (/^Percent/.test(m.units) && s.tf === 'level' ? '%' : '');
        return { name: m.title + (s.tf !== 'level' ? ' (' + T.name + ')' : ''), pts: pts, color: MK.PALETTE[i % 8], axis: s.axis, fmt: function (v) { return MChart.fmt(v) + unit; }, type: pts.length < 80 && m.freq === 'Q' ? 'line' : 'line', dots: pts.length < 40 };
      });
      var refs = state.ref !== '' && isFinite(+state.ref) ? [{ y: +state.ref, label: String(state.ref), include: true }] : [];
      chart.set(series, { x0: bd[0], x1: bd[1], shade: state.rec ? REC : [], logLeft: state.logL, refLines: refs });
      lastRows = series;
      latest(series);
    }).catch(function (e) { $('#ib-lat').innerHTML = '<p class="mk-note">Could not load data (' + MK.esc(e.message) + ').</p>'; });
  }
  function latest(series) {
    $('#ib-lat').innerHTML = state.s.map(function (s, i) {
      var m = META[s.id], p = series[i].pts, a = p[p.length - 1], b = p[p.length - 2]; if (!a) return '';
      var ch = b ? a[1] - b[1] : 0;
      return '<div class="mk-stat" style="border-left:4px solid ' + MK.PALETTE[i % 8] + '"><small>' + MK.esc(series[i].name) + '</small><b>' + series[i].fmt(a[1]) + '</b><span class="ch ' + (ch > 0 ? 'up' : ch < 0 ? 'down' : '') + '">' + (ch ? (ch > 0 ? '▲' : '▼') + MChart.fmt(Math.abs(ch)) : '') + '</span>' +
        '<small>' + MChart.fullDate(a[0]) + ' · ' + MK.esc(m.units) + (m.note ? '<br>' + MK.esc(m.note) : '') + '<br><a href="https://fred.stlouisfed.org/series/' + s.id + '" target="_blank" rel="noopener">' + s.id + ' on FRED ↗</a></small></div>';
    }).join('');
  }
  function csv() {
    if (!lastRows.length) return;
    var dates = {}; lastRows.forEach(function (s) { s.pts.forEach(function (p) { dates[p[0]] = 1; }); });
    var ts = Object.keys(dates).map(Number).sort(function (a, b) { return a - b; }), maps = lastRows.map(function (s) { var m = {}; s.pts.forEach(function (p) { m[p[0]] = p[1]; }); return m; });
    var rows = [['date'].concat(lastRows.map(function (s) { return '"' + s.name.replace(/"/g, "'") + '"'; }))];
    ts.forEach(function (t) { rows.push([MK.dstr(t)].concat(maps.map(function (m) { return m[t] == null ? '' : +m[t].toFixed(4); }))); });
    MK.download('economic-data.csv', rows);
  }

  MK.fredIndex().then(function (ix) {
    ix.series.forEach(function (s) { META[s.id] = s; if (CATS.indexOf(s.cat) < 0) CATS.push(s.cat); });
    $('#ib-upd').textContent = 'Data updated ' + ix.updated;
    ui();
    var st = parseHash();
    if (!st) { try { var saved = localStorage.getItem('mk-ind'); if (saved) { location.hash = saved; st = parseHash(); } } catch (e) { } }
    state = st || defaultState();
    return MK.recessions();
  }).then(function (r) { REC = r; draw(); })
    .catch(function () { root.innerHTML = '<div class="mk-box"><p>Economic data isn’t available yet. It is downloaded from FRED automatically each time the site is built on GitHub, so it will appear after the next build. (When building the site on your own computer, run <code>python3 scripts/fetch_market_data.py</code> first.)</p></div>'; });
  W.addEventListener('hashchange', function () { var st = parseHash(); if (st && META[st.s[0] && st.s[0].id]) { state = st; draw(); } });
})(window, document);
