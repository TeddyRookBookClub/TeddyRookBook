/* The Gulag page (/history/gulag/): the map of camps by year and the chart of prisoners and recorded deaths.
   Data: static/history/gulag-data.js (window.GULAG). Our own drawing in SVG; no libraries.
   The map's year slider and the chart share one selected year. */
(function () {
  'use strict';
  var G = window.GULAG;
  var mapBox = document.getElementById('gl-map');
  var chartBox = document.getElementById('gl-chart');
  if (!G || !mapBox || !chartBox) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function fmt(n) { return n == null ? '—' : n.toLocaleString('en-US'); }
  function round(n) {
    if (n >= 1e6) return (Math.round(n / 1e4) / 100) + ' million';
    return Math.round(n / 1000).toLocaleString('en-US') + ',000';
  }

  // ---- periods for the year readout
  var ERAS = [
    [1923, 1928, 'The first camps: Solovki and the early 1920s'],
    [1929, 1933, 'Collectivization, deportations of peasants, and the first great building projects'],
    [1934, 1936, 'The NKVD takes over the camps, and the system grows'],
    [1937, 1938, 'The Great Terror'],
    [1939, 1940, 'After the Terror: the camps keep growing'],
    [1941, 1945, 'War with Germany: the deadliest years in the camps were 1942 and 1943'],
    [1946, 1952, 'After the war: the camps grow to their largest size'],
    [1953, 1953, 'Stalin dies in March; a large amnesty follows, and strikes break out in the camps'],
    [1954, 1956, 'Releases, reviews of cases, the Kengir uprising and Khrushchev’s speech'],
    [1957, 1960, 'The camps are closed or reorganized; the GULAG administration is abolished in 1960']
  ];
  function eraOf(y) { for (var i = 0; i < ERAS.length; i++) if (y >= ERAS[i][0] && y <= ERAS[i][1]) return ERAS[i][2]; return ''; }
  var POP = {}; G.pop.forEach(function (r) { POP[r[0]] = r; });
  var DEATH = {}; G.deaths.forEach(function (r) { DEATH[r[0]] = r[1]; });

  // ---- the map
  var M = G.map, P = M.proj;
  function proj(lon, lat) {
    if (lon < -30) lon += 360;
    var rad = Math.PI / 180;
    var rho = Math.sqrt(P.C - 2 * P.n * Math.sin(lat * rad)) / P.n;
    var th = P.n * (lon - P.L0) * rad;
    var x = rho * Math.sin(th), y = P.rho0 - rho * Math.cos(th);
    return [(x + P.ox) * P.k, M.H - (y + P.oy) * P.k];
  }
  var svg = el('svg', { viewBox: '0 0 ' + M.W + ' ' + M.H, 'class': 'gl-map', role: 'group', 'aria-labelledby': 'gl-map-title' });
  el('title', { id: 'gl-map-title' }, svg).textContent = 'Map of the Soviet Union with major Gulag camp complexes for the chosen year';
  el('rect', { x: 0, y: 0, width: M.W, height: M.H, 'class': 'sea' }, svg);
  el('path', { d: M.other, 'class': 'land' }, svg);
  el('path', { d: M.ussr, 'class': 'ussr' }, svg);
  el('path', { d: M.internal, 'class': 'inner' }, svg);
  el('path', { d: M.lakes, 'class': 'lake' }, svg);
  var ref = el('g', { 'class': 'ref', 'aria-hidden': 'true' }, svg);
  var refs = [['Moscow', 37.62, 55.75, 1], ['Leningrad', 30.32, 59.94, -1]];
  var refEls = [];
  refs.forEach(function (r) {
    var p = proj(r[1], r[2]);
    var g = el('g', {}, ref);
    var c = el('circle', { cx: p[0], cy: p[1], r: 3 }, g);
    var t = el('text', { x: p[0] + 6 * r[3], y: p[1] + (r[3] > 0 ? 14 : -6), 'text-anchor': r[3] > 0 ? 'start' : 'start' }, g);
    t.textContent = r[0];
    refEls.push([c, t]);
  });
  var LABEL = { 'Solovki (SLON)': 'Solovki', 'Sevvostlag': 'Kolyma', 'Vorkutlag': 'Vorkuta', 'Norillag': 'Norilsk', 'Karlag': 'Karaganda', 'Steplag': 'Kengir', 'Dmitlag': 'Moscow–Volga Canal', 'Belbaltlag': 'White Sea Canal', 'Bamlag': 'BAM railway', 'Construction 501': 'Salekhard', 'Ozerlag': 'Taishet' };
  var campG = el('g', {}, svg);
  var lblG = el('g', { 'aria-hidden': 'true' }, svg);
  var camps = G.camps.map(function (c, i) {
    var p = proj(c.lon, c.lat);
    var g = el('g', { 'class': 'camp', tabindex: '0', role: 'button', 'data-i': i }, campG);
    var hit = el('circle', { cx: p[0], cy: p[1], r: 14, 'class': 'hit' }, g);
    var dot = el('circle', { cx: p[0], cy: p[1], r: 6 }, g);
    var lbl = null;
    if (LABEL[c.n]) { lbl = el('text', { x: p[0], y: p[1], 'class': 'lbl' }, lblG); lbl.textContent = LABEL[c.n]; }
    return { c: c, g: g, dot: dot, hit: hit, lbl: lbl, x: p[0], y: p[1] };
  });
  mapBox.appendChild(svg);

  // sizes that stay readable on a phone: dots and labels keep about the same size on screen
  function resize() {
    var w = svg.getBoundingClientRect().width || M.W;
    var s = M.W / w;
    var r = Math.max(5, 4.5 * s), fs = Math.max(13, 11 * s);
    camps.forEach(function (o) {
      o.dot.setAttribute('r', r); o.hit.setAttribute('r', Math.max(r * 2, 11 * s));
      if (o.lbl) { o.lbl.setAttribute('font-size', fs); o.lbl.setAttribute('x', o.x + r + 3); o.lbl.setAttribute('y', o.y + fs * 0.35); o.lbl.style.strokeWidth = (3 * s) + 'px'; }
    });
    refEls.forEach(function (e) { e[0].setAttribute('r', Math.max(3, 2.5 * s)); e[1].setAttribute('font-size', fs * 0.95); e[1].style.strokeWidth = (3 * s) + 'px'; });
    lblG.style.display = w < 480 ? 'none' : '';
    ref.style.display = w < 480 ? 'none' : '';
  }

  var yearEl = document.getElementById('gl-year');
  var eraEl = document.getElementById('gl-era');
  var statsEl = document.getElementById('gl-stats');
  var slider = document.getElementById('gl-slider');
  var card = document.getElementById('gl-card');
  var playBtn = document.getElementById('gl-play');
  var year = 1937, sel = -1;

  function campYears(c) { return c.a + (c.b !== c.a ? '–' + c.b : ''); }
  function showCamp(i, focusIt) {
    sel = i;
    camps.forEach(function (o, j) { o.g.classList.toggle('sel', j === i); });
    if (i < 0) { card.innerHTML = '<p class="gl-dim">Choose a dot on the map to read about that camp.</p>'; return; }
    var c = camps[i].c, live = year >= c.a && year <= c.b;
    var h = '<h3>' + esc(c.n) + (c.o && c.o !== c.n ? ' <span class="gl-dim">(' + esc(c.o) + ')</span>' : '') + '</h3>' +
      '<p>' + esc(c.r) + ' · <b>' + campYears(c) + '</b>' + (live ? '' : ' <span class="gl-dim">(not open in ' + year + ')</span>') + '</p>' +
      '<p>Work: ' + esc(c.w) + '</p>' +
      (c.p ? '<p>Prisoners at its largest: ' + esc(c.p) + '</p>' : '') +
      (c.note ? '<p>' + esc(c.note) + '</p>' : '');
    card.innerHTML = h;
    if (focusIt) camps[i].g.focus();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  function setYear(y, from) {
    year = Math.max(1923, Math.min(1960, y));
    yearEl.textContent = year;
    eraEl.textContent = eraOf(year);
    if (from !== 'slider') slider.value = year;
    slider.setAttribute('aria-valuetext', year + ': ' + eraOf(year));
    var open = 0;
    camps.forEach(function (o) {
      var c = o.c, live = year >= c.a && year <= c.b, fut = year < c.a;
      if (live) open++;
      o.g.classList.toggle('closed', !live && !fut);
      o.g.classList.toggle('future', fut);
      o.g.setAttribute('tabindex', fut ? '-1' : '0');
      o.g.setAttribute('aria-hidden', fut ? 'true' : 'false');
      o.g.setAttribute('aria-label', c.n + ', ' + c.r + ', ' + campYears(c) + (live ? ', open in ' + year : ', closed by ' + year));
      if (o.lbl) o.lbl.style.display = live ? '' : 'none';
    });
    var pr = POP[year], s = '<b>' + open + '</b> of the ' + camps.length + ' camp complexes on this map were open.';
    if (pr) {
      var tot = pr[1] + (pr[2] || 0);
      s += ' Prisoners on January 1: about <b>' + round(tot) + '</b>' + (pr[2] ? ' in camps and colonies' : ' in camps') + '.';
    } else if (year < 1930) {
      s += ' Yearly totals for the whole system begin in 1930.';
    } else if (year > 1953) {
      s += ' After 1953 the number of prisoners fell quickly.';
    }
    statsEl.innerHTML = s;
    if (sel >= 0) showCamp(sel, false);
    if (from !== 'chart') chartSelect(year, true);
  }

  camps.forEach(function (o, i) {
    o.g.addEventListener('click', function () { showCamp(i, false); });
    o.g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showCamp(i, false); }
    });
  });
  var ticks = document.getElementById('gl-ticks');
  if (ticks) {
    ticks.innerHTML = '';
    [1923, 1930, 1937, 1945, 1953, 1960].forEach(function (t) {
      var sp = document.createElement('span');
      sp.textContent = t;
      if (t === 1930 || t === 1945) sp.className = 'minor';
      sp.style.left = ((t - 1923) / 37 * 100) + '%';
      ticks.appendChild(sp);
    });
  }
  slider.addEventListener('input', function () { stop(); setYear(+slider.value, 'slider'); });
  document.getElementById('gl-prev').addEventListener('click', function () { stop(); setYear(year - 1); });
  document.getElementById('gl-next').addEventListener('click', function () { stop(); setYear(year + 1); });
  var timer = null;
  function stop() { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = 'Play'; playBtn.setAttribute('aria-pressed', 'false'); } }
  playBtn.addEventListener('click', function () {
    if (timer) { stop(); return; }
    if (year >= 1960) setYear(1923);
    playBtn.textContent = 'Pause'; playBtn.setAttribute('aria-pressed', 'true');
    timer = setInterval(function () { if (year >= 1960) { stop(); return; } setYear(year + 1); }, 700);
  });

  // ---- the chart
  var Y0 = 1930, Y1 = 1956, NY = Y1 - Y0 + 1;
  // a narrower drawing on phones, so the text stays readable
  var narrow = (chartBox.clientWidth || 1000) < 600;
  var CW = narrow ? 520 : 1000, L = narrow ? 48 : 62, R = 8, T = 26, H1 = narrow ? 190 : 210, GAP = 52, H2 = 110, B = 26;
  var CH = T + H1 + GAP + H2 + B;
  var bw = (CW - L - R) / NY;
  var csvg = el('svg', { viewBox: '0 0 ' + CW + ' ' + CH, 'class': 'gl-chart', tabindex: '0', role: 'img', 'aria-labelledby': 'gl-chart-title', 'aria-describedby': 'gl-readout' });
  el('title', { id: 'gl-chart-title' }, csvg).textContent = 'Prisoners in Gulag camps and colonies on January 1 of each year, 1930 to 1953, and deaths recorded in them, 1930 to 1956. Use the left and right arrow keys to move between years.';
  var hl = el('rect', { 'class': 'hl', y: T - 6, height: H1 + GAP + H2 + 6, width: bw }, csvg);
  var PMAX = 2800000, DMAX = 400000;
  function yP(v) { return T + H1 - v / PMAX * H1; }
  function yD(v) { return T + H1 + GAP + H2 - v / DMAX * H2; }
  [0, 500000, 1000000, 1500000, 2000000, 2500000].forEach(function (v) {
    el('line', { x1: L, x2: CW - R, y1: yP(v), y2: yP(v), 'class': 'gridl' }, csvg);
    el('text', { x: L - 6, y: yP(v) + 4, 'text-anchor': 'end', 'font-size': 13 }, csvg).textContent = v === 0 ? '0' : (v / 1e6) + 'M';
  });
  [0, 200000, 400000].forEach(function (v) {
    el('line', { x1: L, x2: CW - R, y1: yD(v), y2: yD(v), 'class': 'gridl' }, csvg);
    el('text', { x: L - 6, y: yD(v) + 4, 'text-anchor': 'end', 'font-size': 13 }, csvg).textContent = v === 0 ? '0' : (v / 1000) + 'k';
  });
  el('text', { x: L, y: T - 10, 'font-size': 15, 'class': 'ttl' }, csvg).textContent = 'Prisoners on January 1 (camps and colonies)';
  el('text', { x: L, y: T + H1 + GAP - 12, 'font-size': 15, 'class': 'ttl' }, csvg).textContent = 'Deaths recorded during the year';
  for (var y = Y0; y <= Y1; y++) {
    var x = L + (y - Y0) * bw + bw * 0.14, w = bw * 0.72;
    var pr = POP[y];
    if (pr) {
      el('rect', { x: x, y: yP(pr[1]), width: w, height: H1 + T - yP(pr[1]), 'class': 'b1' }, csvg);
      if (pr[2]) el('rect', { x: x, y: yP(pr[1] + pr[2]), width: w, height: yP(pr[1]) - yP(pr[1] + pr[2]), 'class': 'b2' }, csvg);
    }
    var d = DEATH[y];
    if (d != null) el('rect', { x: x, y: yD(d), width: w, height: yD(0) - yD(d), 'class': 'b3' }, csvg);
    if ((y - Y0) % (narrow ? 10 : 5) === 0) {
      el('text', { x: L + (y - Y0 + 0.5) * bw, y: CH - 6, 'text-anchor': 'middle', 'font-size': 14 }, csvg).textContent = y;
    }
  }
  el('text', { x: CW - R, y: yP(420000), 'text-anchor': 'end', 'font-size': narrow ? 10 : 12 }, csvg).textContent = 'no totals';
  chartBox.appendChild(csvg);
  var readout = document.getElementById('gl-readout');
  var cyear = 1937;
  function chartSelect(y, quiet) {
    cyear = Math.max(Y0, Math.min(Y1, y));
    hl.setAttribute('x', L + (cyear - Y0) * bw);
    if (y < Y0 || y > Y1) {
      hl.style.display = 'none';
      readout.innerHTML = '<b>' + y + '</b>. The chart covers 1930 to 1956, the years with archival totals. Move the slider or press a bar to choose a year.';
      return;
    }
    hl.style.display = '';
    var pr = POP[cyear], d = DEATH[cyear], s = '<b>' + cyear + '</b>. ';
    if (pr) {
      s += 'Prisoners on January 1: ' + fmt(pr[1]) + ' in camps' + (pr[2] ? ' and ' + fmt(pr[2]) + ' in colonies, ' + fmt(pr[1] + pr[2]) + ' in all' : ' (colony figures begin in 1935)') + '. ';
    } else {
      s += 'Year-start totals for this year are not in the 1993 table; the number of prisoners was falling fast. ';
    }
    s += 'Deaths recorded that year: ' + fmt(d) + '.';
    readout.innerHTML = s;
  }
  function pick(ev) {
    var r = csvg.getBoundingClientRect();
    var px = (ev.clientX - r.left) / r.width * CW;
    var y = Y0 + Math.floor((px - L) / bw);
    if (y < Y0 || y > Y1) return;
    stop();
    chartSelect(y); setYear(y, 'chart');
  }
  csvg.addEventListener('click', pick);
  csvg.addEventListener('pointermove', function (ev) { if (ev.pointerType === 'mouse') pick(ev); });
  csvg.addEventListener('keydown', function (e) {
    var k = e.key, y = cyear;
    if (k === 'ArrowLeft' || k === 'ArrowDown') y--; else if (k === 'ArrowRight' || k === 'ArrowUp') y++;
    else if (k === 'Home') y = Y0; else if (k === 'End') y = Y1; else return;
    e.preventDefault(); stop(); chartSelect(y); setYear(cyear, 'chart');
  });

  window.addEventListener('resize', resize);
  resize();
  showCamp(-1);
  setYear(1937);
})();
