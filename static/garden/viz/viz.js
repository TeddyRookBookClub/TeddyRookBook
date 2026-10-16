/* Food Garden Planner pictures: a to-scale map of the plan, a planting calendar from the gardener's own frost dates,
   the harvest week by week, sun and shade over the beds, and daylight for laying hens. They follow the plan
   (garden.js sends "trb-garden-plan") and are drawn only when they scroll into view. Math lives in model.js. */
(function (W, D) {
  'use strict';
  var M = W.GardenModel; if (!M) return;
  var DATA = {}; try { DATA = JSON.parse(D.getElementById('gd-data').textContent); } catch (e) { }
  var G = W.TRBGarden || standalone(), st = G.st, VZ = DATA.viz || {}, VC = VZ.crops || {}, SRC = VZ.sources || {};
  var KEYS = ['lat', 'lsf', 'fff', 'gv'];
  function standalone() { // the guides page: read and write only the picture settings in the planner's storage key
    var KEY = 'trb-garden-v1', s = {};
    try { s = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
    return { st: s, standalone: true, plan: null, save: function () {
      try { var cur = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; KEYS.forEach(function (k) { if (s[k] === undefined) delete cur[k]; else cur[k] = s[k]; }); W.localStorage.setItem(KEY, JSON.stringify(cur)); } catch (e) { }
    } };
  }
  var RMQ = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var now = new Date(); M.setYear(now.getFullYear());
  var TODAY = M.doy(now.getMonth() + 1, Math.min(now.getDate(), now.getMonth() === 1 ? 28 : 31));
  var gv = st.gv = Object.assign({ dir: 'ns', path: 1.25, heat: true, crops: true, light: false, day: null, t: 10.5,
    ob: { kind: 'fence', side: 180, dist: 2, h: 6, w: 16 } }, st.gv || {});
  gv.ob = Object.assign({ kind: 'fence', side: 180, dist: 2, h: 6, w: 16 }, gv.ob || {});
  function save() { G.save(); }

  // ---------- small helpers ----------
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nm(c) { return c.n.replace(/ \(.*\)$/, ''); }
  function lc(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function listTxt(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function umode() { return W.TRBUnits ? W.TRBUnits.mode() : 'both'; }
  function fx(v, d) { var p = Math.pow(10, d || 0); return (Math.round(v * p) / p).toLocaleString('en-US'); }
  function both(us, me) { var u = umode(); return u === 'us' ? us : u === 'metric' ? me : us + ' (' + me + ')'; }
  function lenTxt(ft, short) {
    var us = ft < 2 ? fx(ft * 12, 0) + ' in' : fx(ft, ft < 10 ? 1 : 0) + ' ft', m = ft * 0.3048;
    var me = m < 1 ? fx(m * 100, 0) + ' cm' : fx(m, m < 10 ? 1 : 0) + ' m';
    return short ? (umode() === 'metric' ? me : us) : both(us, me);
  }
  function areaTxt(sf) {
    var us = fx(sf, sf < 10 ? 1 : 0) + ' sq ft', m = sf * 0.092903, me = fx(m, m < 1 ? 2 : m < 10 ? 1 : 0) + ' m²';
    if (sf >= 4356 && G.plan && G.plan.where === 'farm') { us = fx(sf / 43560, 2) + ' acre' + (sf > 43560 * 1.005 ? 's' : ''); me = fx(sf * 0.0000092903, 2) + ' ha'; }
    return both(us, me);
  }
  function lbTxt(lb, short) {
    var us = fx(lb, lb < 10 ? 1 : 0) + ' lb', kg = lb * 0.453592, me = kg < 1 ? fx(kg * 1000, 0) + ' g' : fx(kg, kg < 10 ? 1 : 0) + ' kg';
    return short ? (umode() === 'metric' ? me : us) : both(us, me);
  }
  function src(keys) {
    return 'Sources: ' + keys.map(function (k) { var s = typeof k === 'string' ? SRC[k] : k; return s ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>' : ''; }).filter(Boolean).join(' · ');
  }
  function nice(v) { // a round axis maximum
    if (!(v > 0)) return 1; var e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
  }
  function seg(btns) { return btns.map(function (b) { return '<button type="button" data-v="' + b[0] + '" aria-pressed="false">' + b[1] + '</button>'; }).join(''); }
  function setSeg(box, v) { $$('button', box).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === String(v))); }); }
  function fitCanvas(cv, w, h) {
    var r = Math.min(2, W.devicePixelRatio || 1); cv.style.height = h + 'px';
    if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
    var x = cv.getContext('2d'); x.setTransform(r, 0, 0, r, 0, 0); return x;
  }
  function rr(x, X, Y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function rand(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  function hashStr(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h; }

  // the dark picture panels (same in light and dark site themes, like the Science Lab)
  var C = { bg: '#0c1912', bg2: '#122219', ink: '#e2ebe5', muted: '#9db3a6', line: 'rgba(157,190,170,.17)', acc: '#6cc79a', gold: '#e5c46a', ice: '#8cc8f0',
    lawn: '#10261a', soil: '#3b2a1e', soil2: '#33241a', wood: '#7a5a3e', path: '#2a2c26' };
  // crop groups: the planner's rotation groups plus permanent crops. Colors checked for color-blind separation on the
  // dark panel in harvest stack order (roots, leafy, legumes, fruiting); every group also carries a text label.
  var GROUPS = [{ n: 'Beans and peas', c: '#c98500' }, { n: 'Roots and onions', c: '#d95926' }, { n: 'Tomato family, squash and corn', c: '#d55181' },
    { n: 'Cabbage family and leafy greens', c: '#199e70' }, { n: 'Berries, perennials and trees', c: '#9085e9' }];
  var STACK = [1, 3, 0, 2];
  var ROT = G.rot || [['legume'], ['root', 'allium'], ['nightshade', 'cucurbit', 'grass'], ['brassica', 'leafy-other']];
  function grp(c) { if (c.t !== 'annual') return 4; for (var i = 0; i < ROT.length; i++) if (ROT[i].indexOf(c.g) >= 0) return i; return 3; }

  // ---------- place: frost dates and latitude (the gardener's own; examples until set) ----------
  function lat() { var v = parseFloat(st.lat); return isFinite(v) ? Math.max(-60, Math.min(70, v)) : 40; }
  function frost() {
    var s = lat() < 0, L = M.parseMD(st.lsf), F = M.parseMD(st.fff), ex = !L || !F;
    if (!L) L = s ? M.doy(10, 15) : M.doy(4, 15);
    if (!F) F = s ? M.doy(4, 15) : M.doy(10, 15);
    if (F <= L) F += 365;
    return { L: L, F: F, ex: ex, len: F - L };
  }
  function latTxt(v) { v = v == null ? lat() : v; return fx(Math.abs(v), 1) + '°' + (v < 0 ? 'S' : 'N'); }
  var CITIES = [['Fairbanks, AK', 64.8], ['Anchorage, AK', 61.2], ['Seattle, WA', 47.6], ['Bismarck, ND', 46.8], ['Billings, MT', 45.8], ['Portland, OR', 45.5],
    ['Minneapolis, MN', 45.0], ['Burlington, VT', 44.5], ['Portland, ME', 43.7], ['Boise, ID', 43.6], ['Boston, MA', 42.4], ['Detroit, MI', 42.3], ['Chicago, IL', 41.9],
    ['Salt Lake City, UT', 40.8], ['New York, NY', 40.7], ['Pittsburgh, PA', 40.4], ['Philadelphia, PA', 40.0], ['Denver, CO', 39.7], ['Kansas City, MO', 39.1],
    ['Washington, DC', 38.9], ['St. Louis, MO', 38.6], ['San Francisco, CA', 37.8], ['Nashville, TN', 36.2], ['Charlotte, NC', 35.2], ['Albuquerque, NM', 35.1],
    ['Los Angeles, CA', 34.1], ['Atlanta, GA', 33.7], ['Phoenix, AZ', 33.4], ['Dallas, TX', 32.8], ['New Orleans, LA', 30.0], ['Houston, TX', 29.8], ['Miami, FL', 25.8], ['Honolulu, HI', 21.3]];
  function citySelect(id) {
    return '<select id="' + id + '" aria-label="Or pick a city near you"><option value="">or pick a city near you…</option>' + CITIES.map(function (c) { return '<option value="' + c[1] + '">' + c[0] + ' (' + c[1] + '°N)</option>'; }).join('') + '</select>';
  }
  function bindLat(inp, sel, after) {
    inp.value = st.lat != null && st.lat !== '' ? st.lat : '';
    inp.placeholder = '40 (example)';
    inp.addEventListener('input', function () { var v = parseFloat(inp.value); if (inp.value === '') delete st.lat; else if (isFinite(v) && v >= -60 && v <= 70) st.lat = v; else return; sel.value = ''; save(); after(); });
    sel.addEventListener('change', function () { if (!sel.value) return; st.lat = +sel.value; inp.value = st.lat; save(); after(); });
  }
  var YR = now.getFullYear();
  function dateVal(md) { return md ? YR + '-' + md : ''; }
  function placeBar(box) {
    box.insertAdjacentHTML('beforeend', '<div class="gv-place" role="group" aria-labelledby="gv-place-h"><h3 id="gv-place-h">Your frost dates and latitude</h3>' +
      '<div class="gv-pfs"><label class="gv-pf"><span>Average last spring frost</span><input type="date" id="gv-lsf"></label>' +
      '<label class="gv-pf"><span>Average first fall frost</span><input type="date" id="gv-fff"></label>' +
      '<label class="gv-pf"><span>Latitude (south is negative)</span><input type="number" id="gv-lat" min="-60" max="70" step="0.1" inputmode="decimal"></label>' +
      '<label class="gv-pf gv-pfc"><span>Don’t know it?</span>' + citySelect('gv-city') + '</label></div><p class="gv-note" id="gv-pnote"></p></div>');
    var lsf = $('#gv-lsf'), fff = $('#gv-fff');
    function showDates() {
      var fr = frost(); lsf.value = dateVal(st.lsf || M.mdStr(fr.L)); fff.value = dateVal(st.fff || M.mdStr(fr.F));
      lsf.classList.toggle('is-ex', !st.lsf); fff.classList.toggle('is-ex', !st.fff); $('#gv-lat').classList.toggle('is-ex', st.lat == null || st.lat === '');
      var ex = [!st.lsf || !st.fff ? 'frost dates' : '', st.lat == null || st.lat === '' ? 'latitude' : ''].filter(Boolean);
      $('#gv-pnote').innerHTML = (ex.length ? '<b>The ' + listTxt(ex) + ' shown ' + (ex.length > 1 || ex[0] === 'frost dates' ? 'are examples' : 'is an example') + ', a starting point only.</b> Put in your own. ' : '') +
        'Your county extension office lists local frost dates, and <a href="' + esc((SRC.climate || {}).url || '') + '" target="_blank" rel="noopener">NOAA maps average freeze dates</a>. Hardiness zones measure winter cold, not frost dates, so they can’t tell you these. ' +
        '<span class="gv-season">Frost-free season: <b>' + fr.len + ' days</b>, ' + M.fmtDay(fr.L) + ' to ' + M.fmtDay(fr.F) + '.</span>';
    }
    function setD(inp, key) {
      inp.addEventListener('change', function () { var m = /^\d{4}-(\d\d)-(\d\d)$/.exec(inp.value); if (m && M.parseMD(m[1] + '-' + m[2])) st[key] = m[1] + '-' + m[2]; else delete st[key]; save(); showDates(); if (G.sync) G.sync(); else refresh(); });
    }
    setD(lsf, 'lsf'); setD(fff, 'fff');
    bindLat($('#gv-lat'), $('#gv-city'), function () { showDates(); refresh(); });
    showDates();
    return showDates;
  }

  // ---------- cards: built now, drawn when on screen ----------
  var cards = [];
  function addCard(el, draw) {
    var cd = { el: el, draw: draw, dirty: true, vis: false, raf: 0 };
    cards.push(cd);
    if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { es.forEach(function (e) { cd.vis = e.isIntersecting; if (cd.vis) sched(cd); }); }, { rootMargin: '200px 0px' }).observe(el);
    else { cd.vis = true; sched(cd); }
    if ('ResizeObserver' in W) { var lw = 0; new ResizeObserver(function () { var w = el.clientWidth; if (w && Math.abs(w - lw) > 2) { lw = w; cd.dirty = true; sched(cd); } }).observe(el); }
    return cd;
  }
  function sched(cd) { if (!cd.vis || !cd.dirty || cd.raf || cd.el.hidden) return; cd.raf = requestAnimationFrame(function () { cd.raf = 0; if (cd.dirty && !cd.el.hidden) { cd.dirty = false; cd.draw(); } }); }
  function refresh() { cards.forEach(function (cd) { cd.dirty = true; sched(cd); }); }
  function shell(id, title, what) {
    return '<article class="gv-card" id="' + id + '" aria-labelledby="' + id + '-h"><h3 id="' + id + '-h">' + title + '</h3><p class="gv-what">' + what + '</p>';
  }
  function tipAt(tip, view, x, y, html) {
    tip.innerHTML = html; tip.hidden = false;
    var vw = view.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight, X = x + 14, Y = y + 14;
    if (X + tw > vw - 6) X = Math.max(6, x - tw - 14); if (Y + th > view.clientHeight - 6) Y = Math.max(6, y - th - 14);
    tip.style.left = X + 'px'; tip.style.top = Y + 'px';
  }

  // =====================================================================================================
  // 1. The garden from above
  // =====================================================================================================
  var ICON = {
    leafy: /^(kale|collards|swiss_chard|spinach|lettuce|cabbage|broccoli|culinary_herbs|microgreens)$/, rosette: /^(beets|radishes|turnips_rutabaga)$/,
    feather: /^(carrots|parsnips)$/, bulb: /^(onions|garlic)$/, bush: /^(tomatoes|cherry_tomatoes|peppers|eggplant|potatoes)$/,
    vine: /^(winter_squash|pumpkins|summer_squash|cucumbers|cantaloupe|watermelon|sweet_potatoes)$/, grass: /^(sweet_corn|flint_dent_corn)$/,
    bean: /^(dry_beans|snap_beans|peas|fava_beans|cowpeas|peanuts)$/, flower: /^(sunflowers|jerusalem_artichokes)$/,
    berry: /^(strawberries|blueberries|raspberries_blackberries|grapes)$/, fern: /^(asparagus)$/, bigleaf: /^(rhubarb)$/
  };
  var FRUIT = { tomatoes: '#e5534b', cherry_tomatoes: '#ef6b5b', peppers: '#e9893a', eggplant: '#9a6ad0', potatoes: '#e8e1f2', strawberries: '#e5534b', blueberries: '#6f8fe0',
    raspberries_blackberries: '#c0436b', grapes: '#8d5fc8', summer_squash: '#f0c23c', winter_squash: '#f0a43c', pumpkins: '#ef8a2c', cucumbers: '#f2d24a', cantaloupe: '#f0c23c', watermelon: '#f0c23c',
    apple: '#e5534b', peach: '#f29a55', pear: '#cfd36a', plum_cherry: '#b2405f', citrus: '#f2b134', fig: '#8a5aa0', avocado: '#4f7d35', pecan: '#a9784f', hazelnut: '#a9784f' };
  function iconOf(c) { if (c.t === 'tree') return 'tree'; for (var k in ICON) if (ICON[k].test(c.k)) return k; return 'leafy'; }
  var LEAF = ['#4f9a5f', '#5fae6e', '#3f8650', '#76bf7c'];
  function drawPlant(x, kind, X, Y, r, c, rnd) {
    var i, a, fr = FRUIT[c.k];
    x.save(); x.translate(X, Y); x.rotate(rnd() * Math.PI * 2);
    if (r < 2.6) { x.fillStyle = LEAF[1]; x.beginPath(); x.arc(0, 0, Math.max(1.1, r), 0, 7); x.fill(); x.restore(); return; }
    function blob(px, py, rx, ry, rot, col) { x.fillStyle = col; x.beginPath(); x.ellipse(px, py, rx, ry, rot, 0, 7); x.fill(); }
    switch (kind) {
      case 'tree':
        x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(r * 0.12, r * 0.16, r, 0, 7); x.fill();
        var g = x.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, '#7cc47f'); g.addColorStop(1, '#2f6e40');
        x.fillStyle = g; x.beginPath(); for (i = 0; i < 9; i++) { a = i / 9 * Math.PI * 2; x.arc(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72, r * 0.36, 0, 7); } x.arc(0, 0, r * 0.75, 0, 7); x.fill();
        if (fr) { x.fillStyle = fr; for (i = 0; i < 7; i++) { a = rnd() * 7; var d = rnd() * r * 0.75; x.beginPath(); x.arc(Math.cos(a) * d, Math.sin(a) * d, Math.max(1.2, r * 0.07), 0, 7); x.fill(); } }
        break;
      case 'leafy':
        for (i = 0; i < 7; i++) { a = i / 7 * Math.PI * 2; blob(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.55, r * 0.32, a, LEAF[i % 3]); }
        blob(0, 0, r * 0.38, r * 0.38, 0, c.k === 'cabbage' ? '#9fd8a4' : '#86c98b');
        break;
      case 'rosette':
        for (i = 0; i < 5; i++) { a = i / 5 * Math.PI * 2; blob(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.5, r * 0.26, a, c.k === 'beets' ? (i % 2 ? '#7a3b4f' : '#4f8f5a') : LEAF[i % 3]); }
        break;
      case 'feather':
        x.strokeStyle = '#78c27a'; x.lineWidth = Math.max(0.8, r * 0.12); x.lineCap = 'round';
        for (i = 0; i < 6; i++) { a = i / 6 * Math.PI * 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke(); }
        x.fillStyle = '#e9893a'; x.beginPath(); x.arc(0, 0, r * 0.2, 0, 7); x.fill();
        break;
      case 'bulb':
        x.strokeStyle = '#8fc7a0'; x.lineWidth = Math.max(0.9, r * 0.14); x.lineCap = 'round';
        for (i = 0; i < 5; i++) { a = i / 5 * Math.PI * 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); x.stroke(); }
        x.fillStyle = c.k === 'garlic' ? '#efe9dc' : '#d9a86a'; x.beginPath(); x.arc(0, 0, r * 0.3, 0, 7); x.fill();
        break;
      case 'bush':
        for (i = 0; i < 6; i++) { a = i / 6 * Math.PI * 2; blob(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, r * 0.5, r * 0.42, a, LEAF[(i + 2) % 3]); }
        blob(0, 0, r * 0.45, r * 0.45, 0, LEAF[0]);
        if (fr) { x.fillStyle = fr; for (i = 0; i < 4; i++) { a = i * 1.7 + rnd(); x.beginPath(); x.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, Math.max(1.3, r * 0.15), 0, 7); x.fill(); } }
        break;
      case 'vine':
        for (i = 0; i < 4; i++) { a = i / 4 * Math.PI * 2 + 0.4; var px = Math.cos(a) * r * 0.48, py = Math.sin(a) * r * 0.48; blob(px, py, r * 0.42, r * 0.42, 0, LEAF[i % 4]); x.strokeStyle = 'rgba(20,50,30,.5)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * r * 0.3, py + Math.sin(a) * r * 0.3); x.stroke(); }
        if (fr) { x.fillStyle = fr; x.beginPath(); x.arc(r * 0.1, -r * 0.05, Math.max(1.5, r * 0.18), 0, 7); x.fill(); }
        break;
      case 'grass':
        x.strokeStyle = '#7fbf6a'; x.lineCap = 'round';
        for (i = 0; i < 6; i++) { a = i / 6 * Math.PI * 2; x.lineWidth = Math.max(1, r * 0.2); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(Math.cos(a + 0.4) * r * 0.6, Math.sin(a + 0.4) * r * 0.6, Math.cos(a) * r, Math.sin(a) * r); x.stroke(); }
        x.fillStyle = '#e5c46a'; x.beginPath(); x.arc(0, 0, r * 0.18, 0, 7); x.fill();
        break;
      case 'bean':
        for (i = 0; i < 3; i++) { a = i / 3 * Math.PI * 2; blob(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, r * 0.42, r * 0.36, a, LEAF[i % 4]); }
        blob(0, 0, r * 0.2, r * 0.2, 0, '#a8dca0');
        break;
      case 'flower':
        x.fillStyle = '#4f9a5f'; x.beginPath(); x.arc(0, 0, r * 0.95, 0, 7); x.fill();
        x.fillStyle = '#f2c94c'; for (i = 0; i < 12; i++) { a = i / 12 * Math.PI * 2; x.beginPath(); x.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.25, r * 0.1, a, 0, 7); x.fill(); }
        x.fillStyle = '#6b4a2b'; x.beginPath(); x.arc(0, 0, r * 0.35, 0, 7); x.fill();
        break;
      case 'berry':
        for (i = 0; i < 5; i++) { a = i / 5 * Math.PI * 2; blob(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.45, r * 0.38, a, LEAF[i % 3]); }
        if (fr) { x.fillStyle = fr; for (i = 0; i < 3; i++) { a = i * 2.1 + rnd(); x.beginPath(); x.arc(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, Math.max(1.3, r * 0.16), 0, 7); x.fill(); } }
        break;
      case 'fern':
        x.strokeStyle = '#8fd08a'; x.lineWidth = Math.max(0.6, r * 0.07);
        for (i = 0; i < 8; i++) { a = i / 8 * Math.PI * 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); x.stroke(); }
        break;
      case 'bigleaf':
        for (i = 0; i < 5; i++) { a = i / 5 * Math.PI * 2; blob(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.5, r * 0.42, a, LEAF[i % 4]); }
        x.fillStyle = '#c0436b'; x.beginPath(); x.arc(0, 0, r * 0.18, 0, 7); x.fill();
        break;
    }
    x.restore();
  }

  function mapCard(box) {
    box.insertAdjacentHTML('beforeend', shell('gv-map', 'Your garden from above', '<span id="gv-map-what"></span>') +
      '<div class="gv-stage"><div class="gv-view gv-mapview"><canvas id="gv-map-cv" tabindex="0" role="img" aria-describedby="gv-map-sum"></canvas><div class="gv-hud" id="gv-map-hud" aria-hidden="true"></div><div class="gv-tip" id="gv-map-tip" hidden></div></div>' +
      '<div class="gv-panel"><div id="gv-map-dirbox"><h4 id="gv-dir-h">Beds run</h4><div class="gv-seg" id="gv-dir" role="group" aria-labelledby="gv-dir-h">' + seg([['ns', 'North–south'], ['ew', 'East–west']]) + '</div></div>' +
      '<label class="gv-field" id="gv-pathbox"><span><span>Paths between beds</span> <output id="gv-path-o"></output></span><input type="range" id="gv-path" min="1" max="4" step="0.25" aria-describedby="gv-path-note"></label>' +
      '<p class="gv-small" id="gv-path-note"></p>' +
      '<h4>Selected</h4><div class="gv-pick" id="gv-pick" aria-live="polite"></div><h4>Crop groups</h4><ul class="gv-legend" id="gv-legend"></ul></div></div>' +
      '<p class="gv-sum" id="gv-map-sum"></p><p class="gv-src" id="gv-map-src"></p></article>');
    var el = $('#gv-map'), cv = $('#gv-map-cv'), tip = $('#gv-map-tip'), view = $('.gv-mapview', el), hits = [], sel = -1, lay = null, items = [];
    setSeg($('#gv-dir'), gv.dir);
    $('#gv-dir').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; gv.dir = b.dataset.v; setSeg($('#gv-dir'), gv.dir); save(); refresh(); });
    var path = $('#gv-path'); path.value = gv.path;
    path.addEventListener('input', function () { gv.path = +path.value; save(); refresh(); });
    function layout() {
      var P = G.plan; if (!P || !P.picks.length) return null;
      items = P.picks.map(function (p) { var c = p.c, v = VC[c.k] || {}; return { k: c.k, a: p.a, ht: v.ht || 1, g: grp(c), c: c, n: p.trees || p.plants || 0, trees: p.trees || 0, p: p }; });
      var south = lat() < 0;
      if (P.where === 'garden') return M.layoutBeds({ w: +st.w || 1, l: +st.l || 1, dir: gv.dir, path: gv.path, south: south, items: items });
      if (P.where === 'farm') return M.layoutFarm({ land: P.area, items: items, south: south });
      if (P.byCont) {
        var pots = [];
        items.forEach(function (it) { (it.p.cont || []).forEach(function (u) { pots.push({ sh: u.sh, d: u.d, l: u.l, w: u.w, k: it.k, it: it, n: u.n, gal: u.gal }); }); });
        (P.pots || []).forEach(function (u) { pots.push({ sh: u.sh, d: u.d, l: u.l, w: u.w, k: null, n: u.n, gal: u.gal }); });
        return pots.length ? M.layoutPots(pots, 4) : null;
      }
      return M.layoutArea({ area: P.area, items: items });
    }
    function draw() {
      var P = G.plan, cw = view.clientWidth || 600; lay = layout(); hits = [];
      if (lay && lay.items) items = lay.items; // north to south: the order the arrow keys follow; pieces index this list
      $('#gv-map-dirbox').hidden = !P || P.where !== 'garden';
      $('#gv-pathbox').hidden = !lay || lay.kind !== 'beds' || lay.nb < 2; $('#gv-path-note').hidden = $('#gv-pathbox').hidden;
      $('#gv-path-o').textContent = lenTxt(gv.path);
      $('#gv-path-note').textContent = 'Walkways 14 to 16 inches wide work between raised beds; 3 to 4 feet fits a wheelbarrow or a wheelchair. Paths are extra room on top of your growing space.';
      if (!lay) { fitCanvas(cv, cw, 200).clearRect(0, 0, cw, 200); $('#gv-map-sum').textContent = P && P.byCont ? 'Add containers above to see them here.' : 'Pick some crops above to see the plan drawn here.'; $('#gv-map-hud').textContent = ''; return; }
      var mob = cw < 520, mt = 58, mb = 46, mx = mob ? 30 : 40;
      var ideal = (cw - 2 * mx) * lay.H / lay.W + mt + mb, ch = Math.round(Math.max(mob ? 240 : 280, Math.min(ideal, Math.min(560, (W.innerHeight || 800) * 0.8))));
      var x = fitCanvas(cv, cw, ch), sc = Math.min((cw - 2 * mx) / lay.W, (ch - mt - mb) / lay.H), ox = (cw - lay.W * sc) / 2, oy = mt + (ch - mt - mb - lay.H * sc) / 2;
      function X(v) { return ox + v * sc; } function Y(v) { return oy + v * sc; }
      var rnd = rand(hashStr(JSON.stringify([lay.W, lay.H, items.length])));
      // ground
      x.fillStyle = C.bg; x.fillRect(0, 0, cw, ch);
      x.fillStyle = C.lawn; rr(x, X(0) - 10, Y(0) - 10, lay.W * sc + 20, lay.H * sc + 20, 10); x.fill();
      x.fillStyle = 'rgba(120,180,120,.05)'; for (var i = 0; i < 260; i++) { x.fillRect(X(0) - 10 + rnd() * (lay.W * sc + 20), Y(0) - 10 + rnd() * (lay.H * sc + 20), 1.2, 1.2); }
      if (lay.kind === 'pots') drawPots(x, X, Y, sc, rnd); else drawBeds(x, X, Y, sc, rnd);
      // dimensions, compass, scale, where the midday sun comes from
      x.strokeStyle = 'rgba(226,235,229,.35)'; x.fillStyle = C.muted; x.lineWidth = 1; x.font = '11.5px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'bottom';
      var ty = Y(0) - 16; x.beginPath(); x.moveTo(X(0), ty); x.lineTo(X(lay.W), ty); x.moveTo(X(0), ty - 4); x.lineTo(X(0), ty + 4); x.moveTo(X(lay.W), ty - 4); x.lineTo(X(lay.W), ty + 4); x.stroke();
      x.fillText(lenTxt(lay.W, true), (X(0) + X(lay.W)) / 2, ty - 3);
      var lx = X(0) - 16; x.beginPath(); x.moveTo(lx, Y(0)); x.lineTo(lx, Y(lay.H)); x.moveTo(lx - 4, Y(0)); x.lineTo(lx + 4, Y(0)); x.moveTo(lx - 4, Y(lay.H)); x.lineTo(lx + 4, Y(lay.H)); x.stroke();
      x.save(); x.translate(lx - 3, (Y(0) + Y(lay.H)) / 2); x.rotate(-Math.PI / 2); x.fillText(lenTxt(lay.H, true), 0, 0); x.restore();
      scaleBar(x, 14, ch - 16, sc, cw * 0.28);
      var south = lat() < 0, outdoor = lay.kind === 'beds' || lay.kind === 'farm';
      if (outdoor) compass(x, cw - 22, 26);
      if (outdoor) { x.fillStyle = C.gold; x.textAlign = 'left'; x.textBaseline = 'top'; x.font = '11.5px system-ui,sans-serif'; x.fillText((south ? '☀ midday sun from the north (top)' : '☀ midday sun from the south (bottom)'), 12, 10); }
      $('#gv-map-hud').hidden = true;
      legend(); summary(); pick(sel);
      if (sel >= 0) highlight(x, sel);
    }
    function drawBeds(x, X, Y, sc, rnd) {
      lay.paths.forEach(function (p) {
        x.fillStyle = C.path; x.fillRect(X(p.x), Y(p.y), p.w * sc, p.h * sc);
        x.fillStyle = 'rgba(200,200,180,.07)'; var n = Math.min(400, p.w * p.h * sc * sc / 30); for (var i = 0; i < n; i++) x.fillRect(X(p.x) + rnd() * p.w * sc, Y(p.y) + rnd() * p.h * sc, 1.3, 1.3);
      });
      lay.beds.forEach(function (b) {
        var g = x.createLinearGradient(X(b.x), Y(b.y), X(b.x + b.w), Y(b.y + b.h)); g.addColorStop(0, C.soil); g.addColorStop(1, C.soil2);
        x.fillStyle = g; x.fillRect(X(b.x), Y(b.y), b.w * sc, b.h * sc);
        if (lay.kind !== 'farm') { x.strokeStyle = C.wood; x.lineWidth = lay.kind === 'area' ? 4 : 3; x.strokeRect(X(b.x) - 1.5, Y(b.y) - 1.5, b.w * sc + 3, b.h * sc + 3); }
      });
      lay.open.forEach(function (o) {
        x.save(); x.beginPath(); x.rect(X(o.x), Y(o.y), o.w * sc, o.h * sc); x.clip();
        x.strokeStyle = 'rgba(226,235,229,.12)'; x.lineWidth = 1; for (var d = -o.h * sc; d < o.w * sc; d += 9) { x.beginPath(); x.moveTo(X(o.x) + d, Y(o.y) + o.h * sc); x.lineTo(X(o.x) + d + o.h * sc, Y(o.y)); x.stroke(); }
        x.restore();
        if (o.w * sc > 46 && o.h * sc > 18) { x.fillStyle = C.muted; x.font = '11px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('open', X(o.x + o.w / 2), Y(o.y + o.h / 2)); }
      });
      var biggest = {}; lay.pieces.forEach(function (p) { if (!biggest[p.k] || p.a > biggest[p.k].a) biggest[p.k] = p; });
      var marks = 0; lay.pieces.forEach(function (p) { var it = lay.items[p.i]; marks += Math.round(it.n * p.share); });
      lay.pieces.forEach(function (p, pi) {
        var it = lay.items[p.i], col = GROUPS[it.g].c, rx = X(p.x), ry = Y(p.y), w = p.w * sc, h = p.h * sc;
        x.fillStyle = rgba(col, 0.16); x.fillRect(rx, ry, w, h);
        x.strokeStyle = rgba(col, 0.85); x.lineWidth = 1.5; x.strokeRect(rx + 1, ry + 1, Math.max(0, w - 2), Math.max(0, h - 2));
        var n = Math.round(it.n * p.share); if (n < 1 && biggest[p.k] === p && it.n >= 1) n = 1;
        var kind = iconOf(it.c), farm = lay.kind === 'farm' && !it.trees;
        if (farm || marks > 3000) { // rows, not single plants
          x.save(); x.beginPath(); x.rect(rx + 2, ry + 2, w - 4, h - 4); x.clip(); x.strokeStyle = rgba('#7cc47f', 0.55); x.lineWidth = 1.2;
          for (var yy = ry + 4; yy < ry + h - 2; yy += 6) { x.beginPath(); x.moveTo(rx + 3, yy); x.lineTo(rx + w - 3, yy); x.stroke(); }
          x.restore(); p.rows = true;
        } else {
          var gr = M.plantGrid(p, n), r = Math.min(gr.s * sc / 2 * 0.9, 60);
          gr.pts.forEach(function (q) { drawPlant(x, kind, X(q[0]), Y(q[1]), r, it.c, rnd); });
          p.nPl = gr.pts.length; p.sp = gr.s;
        }
        hits.push({ x: rx, y: ry, w: w, h: h, i: p.i, pi: pi });
      });
      // labels on each crop's largest block, when they fit
      x.textAlign = 'center'; x.textBaseline = 'middle';
      Object.keys(biggest).forEach(function (k) { // a label chip: across the block, smaller, or turned along a tall narrow block
        var p = biggest[k], it = lay.items[p.i], t = nm(it.c), w = p.w * sc, h = p.h * sc, cx = X(p.x + p.w / 2), cy = Y(p.y + p.h / 2), fs, tw, rot = false;
        for (fs = 12; fs >= 10.5; fs -= 1.5) { x.font = '600 ' + fs + 'px system-ui,sans-serif'; tw = x.measureText(t).width + 12; if (tw <= w - 4 && h >= fs + 8) break; }
        if (fs < 10.5) { x.font = '600 11px system-ui,sans-serif'; tw = x.measureText(t).width + 12; fs = 11; if (tw <= h - 4 && w >= 19) rot = true; else return; }
        x.save(); x.translate(cx, cy); if (rot) x.rotate(-Math.PI / 2);
        x.fillStyle = 'rgba(8,18,12,.8)'; rr(x, -tw / 2, -(fs + 8) / 2, tw, fs + 8, (fs + 8) / 2); x.fill();
        x.fillStyle = C.ink; x.fillText(t, 0, 0.5); x.restore();
      });
      if (lay.kind === 'beds' && lay.nb > 1) {
        x.fillStyle = C.muted; x.font = '11px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'bottom';
        lay.beds.forEach(function (b) { if (lay.dir === 'ns') x.fillText('Bed ' + b.n, X(b.x + b.w / 2), Y(lay.H) + 15); });
        if (lay.dir === 'ew') { x.textAlign = 'left'; x.textBaseline = 'middle'; lay.beds.forEach(function (b) { x.fillText(String(b.n), X(lay.W) + 6, Y(b.y + b.h / 2)); }); }
      }
    }
    function drawPots(x, X, Y, sc, rnd) {
      lay.pots.forEach(function (p, pi) {
        var cx = X(p.x + p.w / 2), cy = Y(p.y + p.h / 2), it = p.p.it, col = it ? GROUPS[it.g].c : null;
        x.fillStyle = 'rgba(0,0,0,.3)';
        if (p.sh === 'rect') { rr(x, X(p.x) + 2, Y(p.y) + 3, p.w * sc, p.h * sc, 4); x.fill(); x.fillStyle = '#5a4434'; rr(x, X(p.x), Y(p.y), p.w * sc, p.h * sc, 4); x.fill(); x.fillStyle = C.soil; rr(x, X(p.x) + 3, Y(p.y) + 3, p.w * sc - 6, p.h * sc - 6, 3); x.fill(); }
        else { x.beginPath(); x.arc(cx + 2, cy + 3, p.w * sc / 2, 0, 7); x.fill(); x.fillStyle = '#5a4434'; x.beginPath(); x.arc(cx, cy, p.w * sc / 2, 0, 7); x.fill(); x.fillStyle = C.soil; x.beginPath(); x.arc(cx, cy, p.w * sc / 2 - 3, 0, 7); x.fill(); }
        if (col) { x.strokeStyle = rgba(col, 0.9); x.lineWidth = 2; if (p.sh === 'rect') { rr(x, X(p.x) + 1, Y(p.y) + 1, p.w * sc - 2, p.h * sc - 2, 4); x.stroke(); } else { x.beginPath(); x.arc(cx, cy, p.w * sc / 2 - 1, 0, 7); x.stroke(); } }
        else { x.setLineDash([4, 4]); x.strokeStyle = 'rgba(226,235,229,.35)'; x.lineWidth = 1; x.beginPath(); if (p.sh === 'rect') x.rect(X(p.x) + 1, Y(p.y) + 1, p.w * sc - 2, p.h * sc - 2); else x.arc(cx, cy, p.w * sc / 2 - 1, 0, 7); x.stroke(); x.setLineDash([]); }
        if (it) {
          var per = Math.max(1, it.c.cper || Math.round(it.n / Math.max(1, (it.p.cont || []).length))), inner = p.sh === 'rect' ? { x: p.x + 0.12, y: p.y + 0.12, w: p.w - 0.24, h: p.h - 0.24 } : { x: p.x + p.w * 0.18, y: p.y + p.h * 0.18, w: p.w * 0.64, h: p.h * 0.64 };
          var gr = M.plantGrid(inner, per), r = Math.min(gr.s * sc / 2 * 0.95, p.w * sc / 2 * 0.8);
          gr.pts.forEach(function (q) { drawPlant(x, iconOf(it.c), X(q[0]), Y(q[1]), r, it.c, rnd); });
        }
        hits.push({ x: X(p.x), y: Y(p.y), w: p.w * sc, h: p.h * sc, i: it ? items.indexOf(it) : -1, pot: p });
      });
      x.font = '600 11.5px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'top';
      var seen = {};
      lay.pots.forEach(function (p) {
        var it = p.p.it, t = it ? nm(it.c) : 'empty', tw = x.measureText(t).width;
        if (it && seen[it.k]) return;
        if (tw > p.w * sc + 24) return; if (it) seen[it.k] = 1;
        var cx = X(p.x + p.w / 2), cy = Y(p.y + p.h) + 3; x.fillStyle = 'rgba(8,18,12,.8)'; rr(x, cx - tw / 2 - 5, cy - 1, tw + 10, 17, 8); x.fill(); x.fillStyle = it ? C.ink : C.muted; x.fillText(t, cx, cy + 1);
      });
    }
    function compass(x, cx, cy) {
      x.save(); x.translate(cx, cy); x.fillStyle = 'rgba(226,235,229,.08)'; x.beginPath(); x.arc(0, 0, 14, 0, 7); x.fill();
      x.fillStyle = C.ink; x.beginPath(); x.moveTo(0, -11); x.lineTo(5, 4); x.lineTo(0, 1); x.lineTo(-5, 4); x.closePath(); x.fill();
      x.font = '700 10px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'top'; x.fillStyle = C.ink; x.fillText('N', 0, 14); x.restore();
    }
    function highlight(x, i) {
      x.save(); x.strokeStyle = C.gold; x.lineWidth = 2.5; x.shadowColor = 'rgba(229,196,106,.7)'; x.shadowBlur = 8;
      hits.forEach(function (h) { if (h.i === i) x.strokeRect(h.x + 1, h.y + 1, h.w - 2, h.h - 2); }); x.restore();
    }
    function itemInfo(i) {
      var it = items[i]; if (!it) return '';
      var c = it.c, v = VC[c.k] || {}, n = it.trees ? it.trees + ' tree' + (it.trees > 1 ? 's' : '') : it.n ? '≈ ' + fx(it.n, 0) + ' plant' + (it.n >= 1.5 ? 's' : '') : '';
      var sp = c.sq ? Math.sqrt(c.sq) : null;
      return '<b>' + esc(c.n) + '</b><br>' + GROUPS[it.g].n + '<br>' + areaTxt(it.a) + (n ? ' · ' + n : '') +
        (sp && !it.trees && G.plan.where !== 'farm' ? '<br>About ' + lenTxt(sp) + ' apart (' + areaTxt(c.sq) + ' each)' : '') +
        (it.p.cont && it.p.cont.length ? '<br>In ' + it.p.cont.length + ' container' + (it.p.cont.length > 1 ? 's' : '') : '') +
        '<br>' + ['', 'Low', 'Medium height', 'Tall or trellised', 'Tree'][v.ht || 1] + (c.sun ? ' · needs ' + c.sun + '+ hours of sun' : '');
    }
    function pick(i) {
      sel = i; var box = $('#gv-pick');
      box.innerHTML = i >= 0 && items[i] ? itemInfo(i) : '<span class="gv-small">Tap a crop on the map, or focus the map and use the arrow keys.</span>';
    }
    function legend() {
      var by = {}; items.forEach(function (it) { (by[it.g] = by[it.g] || []).push(nm(it.c)); });
      $('#gv-legend').innerHTML = GROUPS.map(function (g, i) { return by[i] ? '<li><i style="background:' + g.c + '"></i><span><b>' + g.n + '</b><br>' + esc(by[i].join(', ')) + '</span></li>' : ''; }).join('');
    }
    function summary() {
      var P = G.plan, s = '', south = lat() < 0, tall = items.filter(function (it) { return (VC[it.k] || {}).ht >= 3; }).map(function (it) { return lc(nm(it.c)); });
      var seq = [];
      if (lay.kind === 'pots') {
        var used = lay.pots.filter(function (p) { return p.p.it; }).length;
        s = 'Your ' + lay.pots.length + ' container' + (lay.pots.length > 1 ? 's' : '') + ' drawn to scale from above' + (used < lay.pots.length ? ', ' + (lay.pots.length - used) + ' still empty' : '') + '. ';
        items.forEach(function (it) { var n = (it.p.cont || []).length; if (n) seq.push(lc(nm(it.c)) + ' in ' + n); });
        s += seq.length ? 'Crops: ' + listTxt(seq) + '.' : '';
        $('#gv-map-what').textContent = 'Each container drawn to scale from above, with the crop the planner matched to it; the arrangement is only an example. Dashed ones are still free.';
      } else {
        var order = []; lay.pieces.forEach(function (p) { var k = lay.items[p.i]; if (order.indexOf(k) < 0) order.push(k); });
        if (lay.kind === 'beds') s = (lay.nb > 1 ? lay.nb + ' beds, each ' + lenTxt(lay.bw) + ' wide and ' + lenTxt(lay.len) + ' long, with ' + lenTxt(lay.pw) + ' paths between them (' + lenTxt(lay.W) + ' by ' + lenTxt(lay.H) + ' in all)' : 'One bed, ' + lenTxt(lay.bw) + ' by ' + lenTxt(lay.len)) + ', beds running ' + (lay.dir === 'ns' ? 'north to south' : 'east to west') + '. ';
        else if (lay.kind === 'farm') s = 'Your land as a square about ' + lenTxt(lay.W) + ' on a side: four strips of crops with lanes ' + lenTxt(lay.pw) + ' wide between them and at the ends, so about 80% is planted. Rows aren’t drawn to scale here. ';
        else s = 'Your ' + areaTxt(lay.W * lay.H) + ' of growing space, drawn as one planter ' + lenTxt(lay.H) + ' by ' + lenTxt(lay.W) + '; the shape is only an example. ';
        s += (lay.kind === 'area' ? 'Crops: ' : 'Crops from ' + (south ? 'south to north' : 'north to south') + (lay.nb > 1 ? ', bed by bed: ' : ': ')) + listTxt(order.map(function (it) { return lc(nm(it.c)) + ' ' + areaTxt(it.a); })) + '. ';
        if (tall.length && lay.kind !== 'area') s += 'The tall ' + (tall.length > 1 ? 'crops (' + listTxt(tall) + ') are' : 'crop (' + tall[0] + ') is') + ' on the ' + (south ? 'south' : 'north') + ' side so ' + (tall.length > 1 ? 'they don’t' : 'it doesn’t') + ' shade the shorter ones. ';
        var openA = lay.open.reduce(function (a, o) { return a + o.w * o.h; }, 0); if (openA > 0.5) s += areaTxt(openA) + ' is left open. ';
        var bedW = lay.kind === 'beds' ? lay.bw : 0;
        if (bedW > 4.05) s += 'This bed is wider than 4 feet, the most you can reach across from both sides; consider splitting it with a path. ';
        $('#gv-map-what').textContent = lay.kind === 'area' ? 'Your growing space drawn to scale, with each crop’s share and one mark per plant at its spacing. The shape is only an example; arrange it to fit your space.' : lay.kind === 'farm' ? 'The plan drawn to scale, north at the top: each block is the land the planner gives a crop. Tall crops are on the ' + (south ? 'south' : 'north') + ' side so they don’t shade shorter ones.' :
          'Drawn to scale from the plan, north at the top. Each block is the space the planner gives a crop, with one mark per plant at its spacing. Tall crops sit on the ' + (south ? 'south' : 'north') + ' side so they don’t shade the rest.';
      }
      $('#gv-map-sum').textContent = s;
      cv.setAttribute('aria-label', 'Map of your garden from above. ' + (lay.kind === 'pots' ? 'Containers' : 'Beds') + ' drawn to scale with north at the top. Use the arrow keys to step through the crops.');
      $('#gv-map-src').innerHTML = src(['tamu', 'vce', 'osu']) + '. Spacing and area per crop come from the planner (see the crop reference below).';
    }
    function at(e) { var r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; for (var i = hits.length - 1; i >= 0; i--) { var h = hits[i]; if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) return { h: h, px: px, py: py }; } return { px: px, py: py }; }
    cv.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; var a = at(e); if (a.h && (a.h.i >= 0)) { tipAt(tip, view, a.px, a.py, itemInfo(a.h.i)); cv.style.cursor = 'pointer'; } else if (a.h && a.h.pot) { tipAt(tip, view, a.px, a.py, '<b>Empty</b><br>' + esc(a.h.pot.p.n)); } else { tip.hidden = true; cv.style.cursor = ''; } });
    cv.addEventListener('pointerleave', function () { tip.hidden = true; });
    cv.addEventListener('click', function (e) { var a = at(e); pick(a.h && a.h.i >= 0 ? a.h.i : -1); cd.dirty = true; sched(cd); if (e.pointerType !== 'mouse' && a.h && a.h.i >= 0) tipAt(tip, view, a.px, a.py, itemInfo(a.h.i)); else if (e.pointerType !== 'mouse') tip.hidden = true; });
    cv.addEventListener('keydown', function (e) {
      if (!items.length) return;
      if (/^Arrow(Right|Down)$/.test(e.key)) sel = (sel + 1) % items.length; else if (/^Arrow(Left|Up)$/.test(e.key)) sel = (sel - 1 + items.length) % items.length; else if (e.key === 'Escape') { sel = -1; tip.hidden = true; } else return;
      e.preventDefault(); cd.dirty = true; sched(cd);
    });
    var cd = addCard(el, draw);
  }

  // =====================================================================================================
  // 2. Planting calendar, from the gardener's own frost dates
  // =====================================================================================================
  function svg(w, h, body, label, role) { return '<svg class="gv-svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="' + (role || 'img') + '" aria-label="' + esc(label) + '">' + body + '</svg>'; }
  function calRows() {
    var P = G.plan, fr = frost(), rows = [], notes = [];
    if (!P) return { rows: rows, notes: notes, fr: fr };
    P.picks.forEach(function (p) {
      var c = p.c, v = VC[c.k]; if (!v) return;
      var cc = M.cropCal(v, c.dh, c.fr === 'tender', fr.L, fr.F);
      if (cc) rows.push({ p: p, c: c, v: v, cal: cc, g: grp(c) }); else if (v.note) notes.push({ c: c, t: v.note, g: grp(c) });
    });
    rows.sort(function (a, b) { return (a.cal.si ? a.cal.si[0] : a.cal.p[0]) - (b.cal.si ? b.cal.si[0] : b.cal.p[0]) || (a.cal.p[0] - b.cal.p[0]); });
    return { rows: rows, notes: notes, fr: fr };
  }
  function range(a, b) { return M.fmtDay(a) === M.fmtDay(b) ? M.fmtDay(a) : M.fmtDay(a) + ' to ' + M.fmtDay(b); }
  function calText(r, fr) {
    var k = r.cal, v = r.v, out = [], w = v.pw.join(',');
    var rel = { '-4,-2': '2 to 4 weeks before your last frost', '-2,0': 'up to 2 weeks before your last frost', '-1,1': 'around your last frost', '0,2': 'up to 2 weeks after your last frost', '2,4': '2 or more weeks after your last frost' }[w] || '';
    if (k.si) out.push('Start seeds indoors ' + range(k.si[0], k.si[1]) + ' (' + v.si[0] + ' to ' + v.si[1] + ' weeks before setting them out).');
    out.push((k.si ? 'Set out transplants ' : 'Plant or sow ') + range(k.p[0], k.p[1]) + (k.later ? ' or a little later' : '') + (rel ? ' (' + rel + ')' : '') + '.');
    if (k.warn === 'none') out.push('⚠ Even early varieties need more frost-free days than your season has.');
    else if (k.h) out.push('Harvest ' + (r.v.hv === 'pick' ? 'from about ' + M.fmtDay(k.h[0]) + ', picking until ' + (k.h[1] >= fr.F - 0.5 ? 'your first fall frost (' + M.fmtDay(k.h[1]) + ')' + (r.c.fr !== 'tender' ? ' and often past it, since cold-hardy greens take light frosts' : '') : M.fmtDay(k.h[1])) : 'about ' + range(k.h[0], k.h[1]) + ', early to late varieties') + '.');
    if (k.warn === 'late') out.push('⚠ Late varieties may not ripen before your first fall frost; choose early ones.');
    if (k.fall) out.push((v.fd ? 'Last planting for a crop before frost: ' : 'For a fall crop, ' + (k.si ? 'set out transplants ' : 'sow ') + 'about ') + range(k.fall[0], k.fall[1]) + '.');
    return out.join(' ');
  }
  function calCard(box) {
    box.insertAdjacentHTML('beforeend', shell('gv-cal', 'When to plant and pick', 'Your crops on your own calendar. Every bar counts from your average last spring frost and first fall frost, set above.') +
      '<div class="gv-view gv-chart" id="gv-cal-view"><div id="gv-cal-svg"></div><div class="gv-tip" id="gv-cal-tip" hidden></div></div>' +
      '<div class="gv-keys" aria-hidden="true"><span><i class="k-si"></i>Start seeds indoors</span><span><i class="k-p"></i>Plant or sow</span><span><i class="k-h"></i>Harvest</span><span><i class="k-f"></i>Sow again for fall</span><span><i class="k-fr"></i>Average frost dates</span></div>' +
      '<p class="gv-sum" id="gv-cal-sum"></p><details class="gv-details"><summary>The calendar as text</summary><div id="gv-cal-table"></div></details>' +
      '<p class="gv-small" id="gv-cal-note"></p><p class="gv-src" id="gv-cal-src"></p></article>');
    var el = $('#gv-cal'), view = $('#gv-cal-view'), tip = $('#gv-cal-tip');
    function draw() {
      var d = calRows(), rows = d.rows, fr = d.fr, cw = view.clientWidth || 600, mob = cw < 560;
      if (!rows.length) { $('#gv-cal-svg').innerHTML = ''; $('#gv-cal-sum').textContent = !G.plan || !G.plan.picks.length ? 'Pick some crops above to see them on your calendar.' : 'None of the crops in this plan has a frost-date planting window' + (d.notes.length ? ': ' + listTxt(d.notes.map(function (n) { return lc(nm(n.c)); })) + ' are planted once or by season.' : '.'); $('#gv-cal-table').innerHTML = ''; noteTxt(d); return; }
      var x0 = fr.L - 21, x1 = fr.F + 21;
      rows.forEach(function (r) { var k = r.cal; x0 = Math.min(x0, k.si ? k.si[0] : k.p[0]); x1 = Math.max(x1, k.h ? k.h[1] : k.p[1], k.fall ? k.fall[1] : 0); });
      x0 -= 7; x1 += 10;
      var lw = mob ? 92 : 150, top = 46, rh = 32, H = top + rows.length * rh + 26, pw = cw - lw - 14;
      function X(dd) { return lw + (dd - x0) / (x1 - x0) * pw; }
      var b = '<defs><pattern id="gv-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="rgba(226,235,229,.06)"/><line x1="0" y1="0" x2="0" y2="6" stroke="rgba(226,235,229,.75)" stroke-width="2"/></pattern>' +
        rows.map(function (r, i) { return '<linearGradient id="gv-fade' + i + '"><stop offset="0" stop-color="' + GROUPS[r.g].c + '"/><stop offset="1" stop-color="' + GROUPS[r.g].c + '" stop-opacity="0"/></linearGradient>'; }).join('') + '</defs>';
      b += '<rect x="' + X(fr.L) + '" y="' + (top - 6) + '" width="' + (X(fr.F) - X(fr.L)) + '" height="' + (rows.length * rh + 6) + '" fill="rgba(108,199,154,.06)"/>';
      M.monthStarts(x0, x1).forEach(function (m) {
        var xx = X(m.n); b += '<line x1="' + xx + '" y1="' + (top - 8) + '" x2="' + xx + '" y2="' + (H - 22) + '" stroke="' + C.line + '"/>';
        var nx = X(m.n + (m.m === 2 ? 14 : 15)); if (nx < cw - 8 && nx > lw + 6) b += '<text x="' + nx + '" y="' + (top - 14) + '" fill="' + C.muted + '" font-size="11" text-anchor="middle">' + M.MON[m.m - 1].slice(0, mob ? 1 : 3) + '</text>';
      });
      [[fr.L, 'last frost'], [fr.F, 'first frost']].forEach(function (f, i) {
        var xx = X(f[0]); b += '<line x1="' + xx + '" y1="' + (top - 6) + '" x2="' + xx + '" y2="' + (H - 20) + '" stroke="' + C.ice + '" stroke-width="1.5"/>';
        b += '<text x="' + xx + '" y="' + (H - 6) + '" fill="' + C.ice + '" font-size="11" text-anchor="' + (i ? 'end' : 'start') + '">❄ ' + (mob ? '' : f[1] + ' ') + M.fmtDay(f[0]) + '</text>';
      });
      [TODAY, TODAY + 365, TODAY - 365].forEach(function (t) { if (t > x0 && t < x1) { var xx = X(t); b += '<line x1="' + xx + '" y1="' + (top - 6) + '" x2="' + xx + '" y2="' + (H - 22) + '" stroke="' + C.gold + '" stroke-width="1.5"/><text x="' + (xx + 3) + '" y="' + (top - 26) + '" fill="' + C.gold + '" font-size="10.5">today</text>'; } });
      rows.forEach(function (r, i) {
        var y = top + i * rh, col = GROUPS[r.g].c, k = r.cal, bh = 12, by = y + 6;
        b += '<g class="gv-row" tabindex="0" data-i="' + i + '" role="img" aria-label="' + esc(r.c.n + ': ' + calText(r, fr)) + '"><rect x="0" y="' + y + '" width="' + cw + '" height="' + rh + '" fill="transparent"/>';
        b += '<circle cx="9" cy="' + (by + bh / 2) + '" r="4" fill="' + col + '"/><text x="18" y="' + (by + bh / 2 + 4) + '" fill="' + C.ink + '" font-size="' + (mob ? 11.5 : 12.5) + '">' + esc(trunc(nm(r.c), mob ? 12 : 21)) + '</text>';
        if (k.si) b += '<rect x="' + X(k.si[0]) + '" y="' + (by + 1) + '" width="' + Math.max(3, X(k.si[1]) - X(k.si[0])) + '" height="' + (bh - 2) + '" rx="3" fill="url(#gv-hatch)" stroke="' + rgba('#e2ebe5', 0.5) + '" stroke-width="1"/>';
        if (k.h) {
          var hx = X(k.h[0]), fx1 = X(Math.min(k.h[1], k.first[1]));
          b += '<rect x="' + hx + '" y="' + by + '" width="' + Math.max(3, X(k.h[1]) - hx) + '" height="' + bh + '" rx="4" fill="' + rgba(col, 0.32) + '"/>';
          if (r.v.hv === 'pick' && fx1 > hx) b += '<rect x="' + hx + '" y="' + by + '" width="' + Math.max(3, fx1 - hx) + '" height="' + bh + '" rx="4" fill="' + rgba(col, 0.5) + '"/>';
        }
        var pxa = X(k.p[0]), pxb = X(k.p[1]);
        b += '<rect x="' + pxa + '" y="' + by + '" width="' + Math.max(4, pxb - pxa) + '" height="' + bh + '" rx="4" fill="' + col + '"/>';
        if (k.later) b += '<rect x="' + (pxb - 2) + '" y="' + by + '" width="' + (X(k.p[1] + 10) - pxb + 2) + '" height="' + bh + '" fill="url(#gv-fade' + i + ')"/>';
        if (k.fall) b += '<rect x="' + X(k.fall[0]) + '" y="' + (by + bh + 3) + '" width="' + Math.max(4, X(k.fall[1]) - X(k.fall[0])) + '" height="6" rx="3" fill="none" stroke="' + col + '" stroke-width="1.5"/>';
        if (k.warn) b += '<text x="' + Math.min(cw - 10, X(k.h ? k.h[1] : k.p[1] + 10) + 6) + '" y="' + (by + bh - 1) + '" fill="' + C.gold + '" font-size="12">⚠</text>';
        b += '</g>';
      });
      $('#gv-cal-svg').innerHTML = svg(cw, H, b, 'Planting calendar for ' + rows.length + ' crops from ' + M.fmtDay(x0) + ' to ' + M.fmtDay(x1) + '. Each row can be focused to read its dates; they are also in the text below.', 'group');
      $$('.gv-row', view).forEach(function (g) {
        function show(e) { var r = rows[+g.dataset.i], vr = view.getBoundingClientRect(), gr = g.getBoundingClientRect(); var px = e && e.clientX ? e.clientX - vr.left : lw + 10, py = gr.top - vr.top + rh; tipAt(tip, view, px, py, '<b>' + esc(r.c.n) + '</b><br>' + esc(calText(r, fr))); }
        g.addEventListener('pointermove', show); g.addEventListener('focus', function () { show(null); }); g.addEventListener('click', show);
        g.addEventListener('pointerleave', function () { tip.hidden = true; }); g.addEventListener('blur', function () { tip.hidden = true; });
      });
      var warn = rows.filter(function (r) { return r.cal.warn; }), first = rows[0];
      $('#gv-cal-sum').textContent = (fr.ex ? 'With the example frost dates, ' : 'With your frost dates, ') + 'the first job is to ' + (first.cal.si ? 'start ' + lc(nm(first.c)) + ' seeds indoors around ' + M.fmtDay(first.cal.si[0]) : 'plant ' + lc(nm(first.c)) + ' around ' + M.fmtDay(first.cal.p[0])) + '. ' +
        (warn.length ? 'Check ' + listTxt(warn.map(function (r) { return lc(nm(r.c)); })) + ': ' + (warn.some(function (r) { return r.cal.warn === 'none'; }) ? 'your season may be too short.' : 'pick early varieties.') : 'Everything here has time to mature in your frost-free season of ' + fr.len + ' days.');
      $('#gv-cal-table').innerHTML = '<table class="hs-table gv-table"><thead><tr><th>Crop</th><th>What to do and when</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td><b>' + esc(nm(r.c)) + '</b></td><td>' + esc(calText(r, fr)) + '</td></tr>'; }).join('') +
        d.notes.map(function (n) { return '<tr><td><b>' + esc(nm(n.c)) + '</b></td><td>' + esc(n.t) + '</td></tr>'; }).join('') + '</tbody></table>';
      noteTxt(d);
    }
    function noteTxt(d) {
      $('#gv-cal-note').innerHTML = (d.notes.length ? 'Not on the chart: ' + esc(d.notes.map(function (n) { return nm(n.c) + ' (' + lc(n.t.replace(/\.$/, '')) + ')'; }).join('; ')) + '. ' : '') +
        'Planting groups: hardy crops as early as 2 to 4 weeks before the last frost, semi-hardy 0 to 2 weeks before, tender crops from seed around the frost date, very tender ones 2 or more weeks after (CSU). Fall sowing counts back from the first fall frost: days to harvest plus a 14-day fall factor, plus 14 more days for frost-tender crops (Nebraska Extension); sow earlier for a longer harvest. Half of years still bring a frost after the average last frost date, so watch the forecast.';
      $('#gv-cal-src').innerHTML = src(['csu', 'unl', 'isu', 'climate']) + '. Days to harvest come from the planner’s crop data.';
    }
    addCard(el, draw);
  }
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  // =====================================================================================================
  // 3. Harvest week by week (estimates)
  // =====================================================================================================
  function harCard(box) {
    box.insertAdjacentHTML('beforeend', shell('gv-har', 'Your harvest, week by week', 'An estimate: each crop’s harvest from the plan above, spread evenly over its harvest window on the calendar.') +
      '<div class="gv-view gv-chart" id="gv-har-view"><div id="gv-har-svg"></div><div class="gv-tip" id="gv-har-tip" hidden></div></div><div class="gv-keys" id="gv-har-keys"></div>' +
      '<p class="gv-sum" id="gv-har-sum"></p><details class="gv-details"><summary>The weekly estimate as a table</summary><div id="gv-har-table"></div></details><p class="gv-small" id="gv-har-note"></p></article>');
    var el = $('#gv-har'), view = $('#gv-har-view'), tip = $('#gv-har-tip');
    function draw() {
      var d = calRows(), fr = d.fr, its = [], none = [];
      var late = [];
      d.rows.forEach(function (r) { if (r.cal.h && r.p.lb > 0) its.push({ k: r.c.k, g: r.g, lb: r.p.lb, h: r.cal.h, c: r.c }); else if (r.cal.warn === 'none') late.push(r.c); else none.push(r.c); });
      none.late = late;
      var per = G.plan ? G.plan.picks.filter(function (p) { return p.c.t !== 'annual'; }).map(function (p) { return p.c; }) : [];
      var cw = view.clientWidth || 600, mob = cw < 560;
      if (!its.length) { $('#gv-har-svg').innerHTML = ''; $('#gv-har-keys').innerHTML = ''; $('#gv-har-sum').textContent = !G.plan || !G.plan.picks.length ? 'Pick some crops above to see their harvest here.' : 'No crop in this plan has both a yield figure and a harvest window to chart.'; $('#gv-har-table').innerHTML = ''; note(none, per); return; }
      var x0 = Math.min.apply(null, its.map(function (i) { return i.h[0]; })), x1 = Math.max.apply(null, its.map(function (i) { return i.h[1]; }));
      x0 = Math.floor(x0); var bins = M.weekly(its, x0, x1), met = umode() === 'metric', f = met ? 0.453592 : 1, un = met ? 'kg' : 'lb';
      var peakV = Math.max.apply(null, bins.map(function (b) { return b.tot; })) * f, step = nice(peakV / 4), mx = Math.max(step, Math.ceil(peakV * 1.04 / step) * step), lw = mob ? 34 : 44, top = 30, ph = mob ? 190 : 230, H = top + ph + 30, pw = cw - lw - 12;
      var bw = pw / bins.length, barW = Math.max(2, Math.min(24, bw - 2));
      function Y(v) { return top + ph - v * f / mx * ph; }
      var b = '';
      for (var v = 0; v <= mx + step / 1e3; v += step) { var yy = top + ph - ph * v / mx; b += '<line x1="' + lw + '" x2="' + (cw - 8) + '" y1="' + yy + '" y2="' + yy + '" stroke="' + (v ? C.line : 'rgba(157,190,170,.4)') + '"/><text x="' + (lw - 6) + '" y="' + (yy + 4) + '" text-anchor="end" fill="' + C.muted + '" font-size="11">' + fx(v, step < 1 ? 1 : 0) + '</text>'; }
      b += '<text x="' + 4 + '" y="' + (top - 16) + '" fill="' + C.muted + '" font-size="11">' + un + ' a week</text>';
      function Xd(dd) { return lw + (dd - x0) / (bins.length * 7) * pw; }
      M.monthStarts(x0, x0 + bins.length * 7).forEach(function (m) { var xx = Xd(m.n); b += '<line x1="' + xx + '" x2="' + xx + '" y1="' + (top + ph) + '" y2="' + (top + ph + 5) + '" stroke="' + C.muted + '"/><text x="' + (xx + 3) + '" y="' + (top + ph + 17) + '" fill="' + C.muted + '" font-size="11">' + M.MON[m.m - 1] + '</text>'; });
      if (fr.F > x0 && fr.F < x0 + bins.length * 7) { var fx0 = Xd(fr.F); b += '<line x1="' + fx0 + '" x2="' + fx0 + '" y1="' + top + '" y2="' + (top + ph) + '" stroke="' + C.ice + '" stroke-width="1.5"/><text x="' + (fx0 - 4) + '" y="' + (top + 12) + '" text-anchor="end" fill="' + C.ice + '" font-size="11">❄ first frost</text>'; }
      bins.forEach(function (w, i) {
        var xx = lw + i * bw + (bw - barW) / 2, base = top + ph, segs = STACK.filter(function (g) { return w.by[g] > 0; });
        segs.forEach(function (g, j) {
          var hgt = w.by[g] * f / mx * ph, last = j === segs.length - 1, y = base - hgt;
          var gap = j ? 2 : 0, hh = Math.max(0, hgt - gap);
          if (hh <= 0) { base -= hgt; return; }
          if (last) b += '<path d="M' + xx + ' ' + (base - gap) + 'V' + (y + Math.min(4, hh)) + 'Q' + xx + ' ' + y + ' ' + (xx + Math.min(4, barW / 2)) + ' ' + y + 'H' + (xx + barW - Math.min(4, barW / 2)) + 'Q' + (xx + barW) + ' ' + y + ' ' + (xx + barW) + ' ' + (y + Math.min(4, hh)) + 'V' + (base - gap) + 'Z" fill="' + GROUPS[g].c + '"/>';
          else b += '<rect x="' + xx + '" y="' + y + '" width="' + barW + '" height="' + hh + '" fill="' + GROUPS[g].c + '"/>';
          base -= hgt;
        });
        b += '<rect class="gv-hit" data-i="' + i + '" x="' + (lw + i * bw) + '" y="' + top + '" width="' + bw + '" height="' + ph + '" fill="transparent"/>';
      });
      var tot = bins.reduce(function (s, w) { return s + w.tot; }, 0), pk = bins.reduce(function (a, w) { return w.tot > a.tot ? w : a; }, bins[0]);
      $('#gv-har-svg').innerHTML = svg(cw, H, b, 'Estimated harvest per week, stacked by crop group, from ' + M.fmtDay(x0) + ' to ' + M.fmtDay(x1) + '. Peak about ' + lbTxt(pk.tot) + ' in the week of ' + M.fmtDay(pk.d0) + '.');
      var used = STACK.filter(function (g) { return its.some(function (i) { return i.g === g; }); });
      $('#gv-har-keys').innerHTML = used.map(function (g) { return '<span><i style="background:' + GROUPS[g].c + '"></i>' + GROUPS[g].n + '</span>'; }).join('');
      function wk(i) { var w = bins[i]; return '<b>Week of ' + M.fmtDay(w.d0) + '</b><br>About ' + lbTxt(w.tot) + (w.tot > 0 ? '<br>' + its.filter(function (it) { return w.crops[it.k] > 0.005; }).sort(function (a, c) { return w.crops[c.k] - w.crops[a.k]; }).map(function (it) { return esc(nm(it.c)) + ' ' + lbTxt(w.crops[it.k], true); }).join('<br>') : ''); }
      $$('.gv-hit', view).forEach(function (r) {
        function show(e) { var vr = view.getBoundingClientRect(); tipAt(tip, view, e.clientX - vr.left, e.clientY - vr.top, wk(+r.dataset.i)); }
        r.addEventListener('pointermove', show); r.addEventListener('click', show);
        r.addEventListener('pointerleave', function () { tip.hidden = true; });
      });
      var cum = 0, a10 = null, a90 = null; bins.forEach(function (w) { var c0 = cum; cum += w.tot; if (a10 === null && cum >= tot * 0.1) a10 = w.d0 + 7 * Math.max(0, (tot * 0.1 - c0) / (w.tot || 1)); if (a90 === null && cum >= tot * 0.9) a90 = w.d0 + 7 * Math.max(0, (tot * 0.9 - c0) / (w.tot || 1)); });
      $('#gv-har-sum').textContent = 'About ' + lbTxt(tot) + ' over ' + bins.length + ' weeks, from ' + M.fmtDay(x0) + ' to ' + M.fmtDay(x1) + '. 80% of it comes between ' + M.fmtDay(a10) + ' and ' + M.fmtDay(a90) + '. The biggest week, starting ' + M.fmtDay(pk.d0) + ', brings about ' + lbTxt(pk.tot) + '.';
      $('#gv-har-table').innerHTML = '<table class="hs-table gv-table"><thead><tr><th>Week of</th><th>Estimate</th><th>Mostly</th></tr></thead><tbody>' + bins.map(function (w) { var top3 = its.filter(function (it) { return w.crops[it.k] > 0.005; }).sort(function (a, c) { return w.crops[c.k] - w.crops[a.k]; }).slice(0, 3).map(function (it) { return nm(it.c); }); return w.tot > 0.005 ? '<tr><td>' + M.fmtDay(w.d0) + '</td><td>' + lbTxt(w.tot) + '</td><td>' + esc(top3.join(', ')) + '</td></tr>' : ''; }).join('') + '</tbody></table>';
      note(none, per);
    }
    function note(none, per) {
      $('#gv-har-note').innerHTML = 'These are estimates. The pounds are the planner’s (extension yield tables for ordinary garden rows); the timing assumes planting in the middle of each planting window. Crops picked again and again are shown until your first fall frost; real picking ramps up and tapers off, and weather moves everything.' +
        (per.length ? ' Not shown: ' + esc(listTxt(per.map(function (c) { return lc(nm(c)); }))) + ', which ' + (per.length > 1 ? 'are' : 'is') + ' planted once and bear' + (per.length > 1 ? '' : 's') + ' in later years.' : '') +
        (none.length ? ' No harvest figure for ' + esc(listTxt(none.map(function (c) { return lc(nm(c)); }))) + '.' : '') +
        (none.late && none.late.length ? ' ' + esc(listTxt(none.late.map(function (c) { return nm(c); }))) + (none.late.length > 1 ? ' aren’t' : ' isn’t') + ' counted: the season is too short.' : '') + ' ' + src(['isu', 'unl']) + '.';
    }
    addCard(el, draw);
  }

  // =====================================================================================================
  // 4. Sun and shade over the beds
  // =====================================================================================================
  var SIDES = [['0', 'north'], ['45', 'northeast'], ['90', 'east'], ['135', 'southeast'], ['180', 'south'], ['225', 'southwest'], ['270', 'west'], ['315', 'northwest']];
  var HCLASS = [[0, '#4a3f2a', 'under 4 h: shade'], [4, '#7d682f', '4–6 h: part sun, enough for leafy greens'], [6, '#b8902f', '6–8 h: full sun for most vegetables'], [8, '#f0c95a', '8 h or more: best for fruiting crops']];
  function hcol(hh) { return hh >= 8 ? HCLASS[3][1] : hh >= 6 ? HCLASS[2][1] : hh >= 4 ? HCLASS[1][1] : HCLASS[0][1]; }
  function sunCard(box, own) {
    var KIND = [['none', 'Nothing'], ['fence', 'Fence'], ['house', 'House'], ['tree', 'Tree']];
    box.insertAdjacentHTML('beforeend', shell('gv-sun', 'Sun and shade on your beds', 'The sun’s path over ' + (own ? 'a bed' : 'your beds') + ' at your latitude on any day, the moving shadow of a fence, house or tree, and how many hours of direct sun each spot gets that day.') +
      '<div class="gv-stage"><div><div class="gv-view gv-sunview"><canvas id="gv-sun-cv" tabindex="0" role="img" aria-describedby="gv-sun-sum"></canvas><div class="gv-hud" id="gv-sun-hud" aria-hidden="true"></div>' +
      '<div class="gv-tools"><button type="button" id="gv-play" aria-label="Play the day">▶</button></div><div class="gv-tip" id="gv-sun-tip" hidden></div></div>' +
      '<div class="gv-view gv-skyview"><canvas id="gv-sky-cv" role="img" aria-label="The sun’s path across the sky today, with the obstacle’s outline. When the sun is behind the outline, the middle of the bed is in shade."></canvas></div>' +
      '<div class="gv-keys" id="gv-sun-keys"></div><dl class="gv-stats" id="gv-sun-read" aria-label="Today’s numbers"></dl></div>' +
      '<div class="gv-panel">' + (own ? '<label class="gv-field"><span><span>Latitude</span> <output id="gv-slat-o"></output></span><input type="number" id="gv-slat" min="-60" max="70" step="0.1" inputmode="decimal"></label>' + citySelect('gv-scity') : '') +
      '<label class="gv-field"><span><span>Day</span> <output id="gv-day-o"></output></span><input type="range" id="gv-day" min="1" max="365" step="1"></label>' +
      '<div class="gv-seg gv-seg-sm" id="gv-days" role="group" aria-label="Jump to a day"></div>' +
      '<label class="gv-field"><span><span>Time (sun time)</span> <output id="gv-time-o"></output></span><input type="range" id="gv-time" min="0" max="24" step="0.05"></label>' +
      '<h4 id="gv-kind-h">Shade from</h4><div class="gv-seg" id="gv-kind" role="group" aria-labelledby="gv-kind-h">' + seg(KIND) + '</div>' +
      '<div id="gv-obctl"><label class="gv-field"><span><span>Where</span></span><select id="gv-side">' + SIDES.map(function (s) { return '<option value="' + s[0] + '">' + s[1].charAt(0).toUpperCase() + s[1].slice(1) + ' of the beds</option>'; }).join('') + '</select></label>' +
      '<label class="gv-field"><span><span>Height</span> <output id="gv-h-o"></output></span><input type="range" id="gv-h" min="2" max="60" step="0.5"></label>' +
      '<label class="gv-field"><span><span id="gv-w-l">Width</span> <output id="gv-w-o"></output></span><input type="range" id="gv-w" min="2" max="80" step="0.5"></label>' +
      '<label class="gv-field"><span><span>Gap to the beds</span> <output id="gv-d-o"></output></span><input type="range" id="gv-d" min="0" max="80" step="0.5"></label></div>' +
      '<label class="gv-chk"><input type="checkbox" id="gv-heat"> Hours of sun for the day</label>' + (own ? '' : '<label class="gv-chk"><input type="checkbox" id="gv-crops"> Outline the crops</label>') +
      '</div></div>' +
      '<p class="gv-sum" id="gv-sun-sum"></p><ul class="gv-checks" id="gv-sun-checks"></ul><p class="gv-small" id="gv-sun-note"></p></article>');
    var el = $('#gv-sun'), cv = $('#gv-sun-cv'), sky = $('#gv-sky-cv'), view = $('.gv-sunview', el), tip = $('#gv-sun-tip');
    var foot = null, grid = null, heat = null, heatKey = '', obs = null, sc = 1, ox = 0, oy = 0, playing = false, lastT = 0, drag = false;
    var day = $('#gv-day'), time = $('#gv-time');
    function midSeason() { var fr = frost(); return M.wrap((fr.L + fr.F) / 2); }
    function inSeason(n) { var fr = frost(); return (n >= fr.L && n <= fr.F) || (n + 365 >= fr.L && n + 365 <= fr.F); }
    function dayNow() { return gv.day || (own || inSeason(TODAY) ? TODAY : midSeason()); } // outside the growing season, start mid-season
    var cd;
    if (own) bindLat($('#gv-slat'), $('#gv-scity'), function () { heatKey = ''; cd.dirty = true; sched(cd); });
    function setDays() {
      var s = lat() < 0, list = [[M.doy(3, 20), s ? 'Mar 20 · fall' : 'Mar 20 · spring'], [M.doy(6, 21), s ? 'Jun 21 · shortest' : 'Jun 21 · longest'], [M.doy(9, 22), s ? 'Sep 22 · spring' : 'Sep 22 · fall'], [M.doy(12, 21), s ? 'Dec 21 · longest' : 'Dec 21 · shortest'], [TODAY, 'Today']];
      if (!own) list.push([midSeason(), 'Mid-season']);
      $('#gv-days').innerHTML = list.map(function (d) { return '<button type="button" data-v="' + d[0] + '" aria-pressed="' + (d[0] === dayNow()) + '">' + d[1] + '</button>'; }).join('');
    }
    $('#gv-days').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; gv.day = +b.dataset.v; save(); sync(); });
    day.addEventListener('input', function () { gv.day = +day.value; save(); sync(); });
    time.addEventListener('input', function () { gv.t = +time.value; stop(); cd.dirty = true; sched(cd); });
    $('#gv-kind').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; gv.ob.kind = b.dataset.v; if (b.dataset.v === 'fence' && gv.ob.h > 8) { gv.ob.h = 6; gv.ob.w = Math.max(gv.ob.w, 16); } if (b.dataset.v === 'house' && gv.ob.h < 10) { gv.ob.h = 18; gv.ob.w = 32; } if (b.dataset.v === 'tree' && gv.ob.h < 12) { gv.ob.h = 30; gv.ob.w = 20; } save(); sync(); });
    $('#gv-side').addEventListener('change', function () { gv.ob.side = +this.value; save(); sync(); });
    [['gv-h', 'h'], ['gv-w', 'w'], ['gv-d', 'dist']].forEach(function (p) { $('#' + p[0]).addEventListener('input', function () { gv.ob[p[1]] = +this.value; if (gv.ob.kind === 'tree' && gv.ob.w > gv.ob.h) { gv.ob.w = gv.ob.h; } save(); sync(); }); });
    $('#gv-heat').addEventListener('change', function () { gv.heat = this.checked; save(); cd.dirty = true; sched(cd); });
    if ($('#gv-crops')) $('#gv-crops').addEventListener('change', function () { gv.crops = this.checked; save(); cd.dirty = true; sched(cd); });
    function sync() { heatKey = ''; cd.dirty = true; sched(cd); }
    function footprint() { // the beds, centered on (0, 0), y north; from the map layout when there is a plan
      var P = G.plan, it = [];
      if (P && P.picks.length && P.where !== 'indoor') {
        it = P.picks.map(function (p) { return { k: p.c.k, a: p.a, ht: (VC[p.c.k] || {}).ht || 1, g: grp(p.c), c: p.c, n: p.plants || 0 }; });
        var lay = P.where === 'garden' ? M.layoutBeds({ w: +st.w || 1, l: +st.l || 1, dir: gv.dir, path: gv.path, south: lat() < 0, items: it }) : P.where === 'farm' ? M.layoutFarm({ land: P.area, items: it, south: lat() < 0 }) : null;
        if (!lay && P.byCont) { var pots = []; P.picks.forEach(function (p) { (p.cont || []).forEach(function (u) { pots.push({ sh: u.sh, d: u.d, l: u.l, w: u.w, k: p.c.k }); }); }); if (pots.length) lay = M.layoutPots(pots, 4); }
        if (!lay) lay = M.layoutArea({ area: P.area, items: it });
        return { W: lay.W, H: lay.H, lay: lay, items: lay.items || it };
      }
      var w = +st.w || 4, l = +st.l || 10; if (st.where !== 'garden' || !G.standalone && !P) { w = 4; l = 10; }
      var L0 = M.layoutBeds({ w: Math.min(w, l), l: Math.max(w, l), dir: gv.dir, path: gv.path, items: [] });
      return { W: L0.W, H: L0.H, lay: L0, items: [] };
    }
    function obstacle() { return gv.ob.kind === 'none' ? null : M.obstacleFrom(gv.ob.kind, gv.ob.side, gv.ob.dist, gv.ob.h, gv.ob.w, foot); }
    function computeHeat() {
      var key = [lat(), dayNow(), foot.W, foot.H, JSON.stringify(gv.ob), gv.dir, gv.path].join('|'); if (key === heatKey) return; heatKey = key;
      var cell = Math.max(0.2, Math.sqrt(foot.W * foot.H / 2200)), nx = Math.max(4, Math.min(120, Math.round(foot.W / cell))), ny = Math.max(4, Math.min(120, Math.round(foot.H / cell)));
      grid = { x0: -foot.W / 2, y0: -foot.H / 2, w: foot.W, h: foot.H, nx: nx, ny: ny };
      heat = M.sunHours(lat(), dayNow(), grid, obs ? [obs] : [], 0.1);
    }
    function inBeds(px, py) { // is this ground point (y north) on a bed or container, not a path?
      var lx = px + foot.W / 2, ly = foot.H / 2 - py, L = foot.lay;
      if (L.kind === 'pots') return L.pots.some(function (p) { return lx >= p.x && lx <= p.x + p.w && ly >= p.y && ly <= p.y + p.h; });
      return L.beds.some(function (b) { return lx >= b.x && lx <= b.x + b.w && ly >= b.y && ly <= b.y + b.h; });
    }
    function cropStats() { // hours of sun over each crop's blocks
      var L = foot.lay, out = {}; if (!heat || !L || !L.pieces) return out;
      for (var j = 0; j < grid.ny; j++) for (var i = 0; i < grid.nx; i++) {
        var px = grid.x0 + (i + 0.5) * grid.w / grid.nx, py = grid.y0 + (j + 0.5) * grid.h / grid.ny, lx = px + foot.W / 2, ly = foot.H / 2 - py, hh = heat.h[j * grid.nx + i];
        L.pieces.forEach(function (p) { if (lx >= p.x && lx <= p.x + p.w && ly >= p.y && ly <= p.y + p.h) { var o = out[p.k] = out[p.k] || { mn: 99, mx: 0, s: 0, n: 0 }; o.mn = Math.min(o.mn, hh); o.mx = Math.max(o.mx, hh); o.s += hh; o.n++; } });
      }
      return out;
    }
    function draw() {
      foot = footprint(); obs = obstacle(); computeHeat();
      var L = lat(), n = dayNow(), info = M.dayInfo(L, n);
      var t0 = info.polar === 'day' ? 0 : info.rise, t1 = info.polar === 'day' ? 24 : info.set;
      if (info.len > 0) { if (gv.t < t0 || gv.t > t1) gv.t = Math.max(t0, Math.min(t1, gv.t)); }
      time.min = Math.floor(t0 * 20) / 20; time.max = Math.ceil(t1 * 20) / 20; time.value = gv.t; time.disabled = info.len <= 0;
      day.value = n; setDays(); setSeg($('#gv-kind'), gv.ob.kind);
      $('#gv-obctl').hidden = gv.ob.kind === 'none';
      var side = SIDES.reduce(function (a, s) { var d = Math.abs(((gv.ob.side - +s[0]) % 360 + 540) % 360 - 180); return d < a.d ? { d: d, v: s[0] } : a; }, { d: 999, v: '180' });
      $('#gv-side').value = side.v;
      $('#gv-h').value = gv.ob.h; $('#gv-w').value = gv.ob.w; $('#gv-d').value = gv.ob.dist; $('#gv-w').max = gv.ob.kind === 'tree' ? gv.ob.h : 80;
      $('#gv-w-l').textContent = gv.ob.kind === 'tree' ? 'Canopy width' : gv.ob.kind === 'house' ? 'Width of the house' : 'Length';
      $('#gv-h-o').textContent = lenTxt(gv.ob.h); $('#gv-w-o').textContent = lenTxt(gv.ob.w); $('#gv-d-o').textContent = lenTxt(gv.ob.dist);
      $('#gv-heat').checked = gv.heat; if ($('#gv-crops')) $('#gv-crops').checked = gv.crops;
      $('#gv-day-o').textContent = M.fmtDay(n, true); $('#gv-time-o').textContent = info.len > 0 ? M.fmtTime(gv.t) : 'sun stays down';
      if (own) { $('#gv-slat-o').textContent = latTxt(); if (D.activeElement !== $('#gv-slat')) $('#gv-slat').value = st.lat != null ? st.lat : ''; $('#gv-slat').placeholder = '40 (example)'; }
      drawView(info); drawSky(info); readout(info);
    }
    function drawView(info) {
      var cw = view.clientWidth || 600, mob = cw < 520, ch = Math.round(Math.max(mob ? 300 : 340, Math.min(mob ? 380 : 470, cw * 0.62)));
      var x = fitCanvas(cv, cw, ch), sp = M.sunPos(lat(), dayNow(), gv.t), sv = M.sunVec(sp.alt, sp.az);
      // view: the beds and the obstacle, with room around them
      var xs = [-foot.W / 2, foot.W / 2], ys = [-foot.H / 2, foot.H / 2];
      if (obs) { var rad = obs.kind === 'tree' ? obs.r : Math.max(obs.w, obs.d) / 2; xs.push(obs.x - rad, obs.x + rad); ys.push(obs.y - rad, obs.y + rad); }
      var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys), padX = (maxX - minX) * 0.09 + 1.5, padY = (maxY - minY) * 0.09 + 1.5;
      minX -= padX; maxX += padX; minY -= padY; maxY += padY;
      sc = Math.min((cw - 20) / (maxX - minX), (ch - 56) / (maxY - minY)); ox = cw / 2 - (minX + maxX) / 2 * sc; oy = 34 + (ch - 56) / 2 + (minY + maxY) / 2 * sc;
      function X(v) { return ox + v * sc; } function Y(v) { return oy - v * sc; }
      x.fillStyle = '#1a3a25'; x.fillRect(0, 0, cw, ch);
      var rg = rand(7); x.fillStyle = 'rgba(140,200,140,.07)'; for (var q = 0; q < 500; q++) x.fillRect(rg() * cw, rg() * ch, 1.5, 1.5);
      // beds
      var Lay = foot.lay, fx0 = -foot.W / 2, fy0 = foot.H / 2;
      function LX(v) { return X(fx0 + v); } function LY(v) { return Y(fy0 - v); }
      (Lay.paths || []).forEach(function (p) { x.fillStyle = C.path; x.fillRect(LX(p.x), LY(p.y), p.w * sc, p.h * sc); });
      if (Lay.kind === 'pots') Lay.pots.forEach(function (p) { x.fillStyle = C.soil; if (p.sh === 'rect') x.fillRect(LX(p.x), LY(p.y), p.w * sc, p.h * sc); else { x.beginPath(); x.arc(LX(p.x + p.w / 2), LY(p.y + p.h / 2), p.w * sc / 2, 0, 7); x.fill(); } });
      else Lay.beds.forEach(function (b) { x.fillStyle = C.soil; x.fillRect(LX(b.x), LY(b.y), b.w * sc, b.h * sc); });
      // hours of sun, only on the beds
      if (gv.heat && heat) {
        var cwid = grid.w / grid.nx * sc, chgt = grid.h / grid.ny * sc;
        for (var j = 0; j < grid.ny; j++) for (var i = 0; i < grid.nx; i++) {
          var px = grid.x0 + (i + 0.5) * grid.w / grid.nx, py = grid.y0 + (j + 0.5) * grid.h / grid.ny; if (!inBeds(px, py)) continue;
          x.fillStyle = hcol(heat.h[j * grid.nx + i]); x.fillRect(X(px) - cwid / 2 - 0.3, Y(py) - chgt / 2 - 0.3, cwid + 0.6, chgt + 0.6);
        }
      }
      if (Lay.kind !== 'pots') Lay.beds.forEach(function (b) { x.strokeStyle = C.wood; x.lineWidth = 2; x.strokeRect(LX(b.x), LY(b.y), b.w * sc, b.h * sc); });
      if (gv.crops && Lay.pieces && Lay.pieces.length) {
        x.lineWidth = gv.heat ? 1 : 1.5; Lay.pieces.forEach(function (p) { x.strokeStyle = gv.heat ? 'rgba(10,20,14,.55)' : rgba(GROUPS[(foot.items[p.i] || {}).g || 0].c, 0.95); x.strokeRect(LX(p.x) + 0.5, LY(p.y) + 0.5, p.w * sc - 1, p.h * sc - 1); });
        x.font = '600 11px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        var done = {}; Lay.pieces.slice().sort(function (a, b) { return b.a - a.a; }).forEach(function (p) {
          if (done[p.k]) return; var it = foot.items[p.i]; if (!it) return; var t = nm(it.c), tw = x.measureText(t).width + 10; if (tw > p.w * sc - 4 || p.h * sc < 18) return; done[p.k] = 1;
          x.fillStyle = 'rgba(8,18,12,.75)'; rr(x, LX(p.x + p.w / 2) - tw / 2, LY(p.y + p.h / 2) - 9, tw, 18, 9); x.fill(); x.fillStyle = C.ink; x.fillText(t, LX(p.x + p.w / 2), LY(p.y + p.h / 2) + 0.5);
        });
      }
      // shadow now
      if (obs && sp.alt > 0) {
        var poly = M.shadow(obs, sv);
        if (poly) { x.save(); x.fillStyle = 'rgba(0,6,3,' + (gv.heat ? 0.4 : 0.55) + ')'; x.beginPath(); poly.forEach(function (q, k) { if (k) x.lineTo(X(q[0]), Y(q[1])); else x.moveTo(X(q[0]), Y(q[1])); }); x.closePath(); x.fill(); x.strokeStyle = 'rgba(140,200,240,.6)'; x.lineWidth = 1; x.stroke(); x.restore(); }
      }
      // the obstacle, seen from above
      if (obs) {
        x.save();
        if (obs.kind === 'tree') {
          var g = x.createRadialGradient(X(obs.x) - obs.r * sc * 0.3, Y(obs.y) - obs.r * sc * 0.3, 2, X(obs.x), Y(obs.y), obs.r * sc); g.addColorStop(0, '#6db874'); g.addColorStop(1, '#2c6a3d');
          x.fillStyle = g; x.beginPath(); x.arc(X(obs.x), Y(obs.y), obs.r * sc, 0, 7); x.fill(); x.strokeStyle = 'rgba(226,235,229,.35)'; x.stroke();
          x.fillStyle = '#6b4a2b'; x.beginPath(); x.arc(X(obs.x), Y(obs.y), Math.max(2, 0.6 * sc), 0, 7); x.fill();
        } else {
          x.translate(X(obs.x), Y(obs.y)); x.rotate(-obs.ang);
          x.fillStyle = obs.kind === 'house' ? '#59606a' : '#8a6a48'; x.fillRect(-obs.w / 2 * sc, -Math.max(obs.d * sc, 3) / 2, obs.w * sc, Math.max(obs.d * sc, 3));
          if (obs.kind === 'house') { x.strokeStyle = '#8b939e'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-obs.w / 2 * sc, 0); x.lineTo(obs.w / 2 * sc, 0); x.stroke(); }
        }
        x.restore();
        var lbl = lenTxt(obs.h, true) + ' ' + (obs.kind === 'house' ? 'house' : obs.kind); x.font = '600 11.5px system-ui,sans-serif'; var tw = x.measureText(lbl).width + 12;
        var lxp = Math.max(tw / 2 + 4, Math.min(cw - tw / 2 - 4, X(obs.x))), lyp = Math.max(40, Math.min(ch - 30, Y(obs.y) + (obs.kind === 'tree' ? obs.r * sc + 14 : 16)));
        x.fillStyle = 'rgba(8,18,12,.8)'; rr(x, lxp - tw / 2, lyp - 9, tw, 18, 9); x.fill(); x.fillStyle = C.ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(lbl, lxp, lyp + 0.5);
      }
      // the sun's direction
      if (sp.alt > 0) {
        var dx = Math.sin(sp.az * Math.PI / 180), dy = -Math.cos(sp.az * Math.PI / 180), bx = X(0), by = Y(0), tt = Infinity; // out from the beds toward the sun, to the edge
        if (dx > 1e-6) tt = Math.min(tt, (cw - 20 - bx) / dx); if (dx < -1e-6) tt = Math.min(tt, (20 - bx) / dx); if (dy > 1e-6) tt = Math.min(tt, (ch - 20 - by) / dy); if (dy < -1e-6) tt = Math.min(tt, (44 - by) / dy);
        var sx = bx + dx * tt, sy = by + dy * tt;
        x.strokeStyle = 'rgba(229,196,106,.35)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(X(0), Y(0)); x.lineTo(sx, sy); x.stroke();
        var gg = x.createRadialGradient(sx, sy, 2, sx, sy, 16); gg.addColorStop(0, 'rgba(255,224,130,1)'); gg.addColorStop(0.45, 'rgba(255,212,121,.85)'); gg.addColorStop(1, 'rgba(255,212,121,0)');
        x.fillStyle = gg; x.beginPath(); x.arc(sx, sy, 16, 0, 7); x.fill();
      }
      // compass and scale
      x.save(); x.translate(cw - 22, ch - 30); x.fillStyle = C.ink; x.beginPath(); x.moveTo(0, -11); x.lineTo(5, 4); x.lineTo(0, 1); x.lineTo(-5, 4); x.closePath(); x.fill(); x.font = '700 10px system-ui,sans-serif'; x.textAlign = 'center'; x.fillText('N', 0, 16); x.restore();
      scaleBar(x, 12, ch - 14, sc, cw * 0.25);
      $('#gv-sun-hud').innerHTML = M.fmtDay(dayNow()) + ' · ' + (info.len > 0 ? M.fmtTime(gv.t) + ' sun time<br>' + (sp.alt > 0 ? 'sun ' + Math.round(sp.alt) + '° up in the ' + M.compass(sp.az) : 'sun below the horizon') : 'the sun stays down today');
      $('#gv-sun-keys').innerHTML = gv.heat ? HCLASS.map(function (h) { return '<span><i style="background:' + h[1] + '"></i>' + h[2] + '</span>'; }).join('') : '';
    }
    function drawSky(info) {
      var cw = sky.parentNode.clientWidth || 600, ch = cw < 520 ? 150 : 170, x = fitCanvas(sky, cw, ch), L = lat(), n = dayNow(), south = L < 0;
      var c0 = south ? 0 : 180, l = 34, r = cw - 10, t = 14, b = ch - 24, amax = 90;
      function X(az) { var d = ((az - c0 + 540) % 360) - 180; return l + (d + 180) / 360 * (r - l); }
      function Y(a) { return b - Math.max(0, a) / amax * (b - t); }
      x.fillStyle = C.bg2; x.fillRect(0, 0, cw, ch);
      x.font = '10.5px system-ui,sans-serif'; x.fillStyle = C.muted; x.textAlign = 'center'; x.textBaseline = 'top';
      [0, 45, 90, 135, 180, 225, 270, 315, 360].forEach(function (a) { var xx = l + a / 360 * (r - l), az = (c0 - 180 + a + 360) % 360; x.strokeStyle = C.line; x.beginPath(); x.moveTo(xx, t); x.lineTo(xx, b); x.stroke(); x.fillText(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(az / 45) % 8], xx, b + 5); });
      x.textAlign = 'right'; x.textBaseline = 'middle';
      [0, 30, 60, 90].forEach(function (a) { x.strokeStyle = a ? C.line : 'rgba(157,190,170,.45)'; x.beginPath(); x.moveTo(l, Y(a)); x.lineTo(r, Y(a)); x.stroke(); x.fillText(a + '°', l - 4, Y(a)); });
      // the obstacle against the sky, from the middle of the beds
      if (obs) {
        var sl = M.skyline(obs, 0, 0); x.fillStyle = 'rgba(60,90,70,.75)';
        for (var i = 0; i < 360; i++) if (sl.top[i] >= 0) { var xa = X(i), xb = X(i + 1); if (xb < xa) continue; x.fillRect(xa, Y(sl.top[i]), xb - xa + 0.6, Y(sl.bot[i]) - Y(sl.top[i])); }
      }
      // solstice paths, faint; today's path; hour ticks; the sun now
      function path(day, style, w) {
        var dc = M.decl(day), seg = false, lastX = 0; x.strokeStyle = style; x.lineWidth = w; x.beginPath();
        for (var tt = 0; tt <= 24.001; tt += 0.1) { var p = M.sunAt(L, dc, tt); if (p.alt < 0) { seg = false; continue; } var xx = X(p.az), yy = Y(p.alt); if (seg && Math.abs(xx - lastX) > (r - l) / 2) seg = false; if (seg) x.lineTo(xx, yy); else x.moveTo(xx, yy); seg = true; lastX = xx; }
        x.stroke();
      }
      path(M.doy(6, 21), 'rgba(229,196,106,.25)', 1); path(M.doy(12, 21), 'rgba(229,196,106,.25)', 1);
      path(n, C.gold, 2);
      var dc = M.decl(n); x.fillStyle = C.ink; x.font = '10px system-ui,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'bottom';
      [6, 9, 12, 15, 18].forEach(function (h) { var p = M.sunAt(L, dc, h); if (p.alt > 2) { x.fillStyle = C.gold; x.beginPath(); x.arc(X(p.az), Y(p.alt), 2.5, 0, 7); x.fill(); x.fillStyle = C.muted; x.fillText(h === 12 ? 'noon' : (h % 12) + (h < 12 ? 'am' : 'pm'), X(p.az), Y(p.alt) - 4); } });
      var sp = M.sunPos(L, n, gv.t);
      if (sp.alt > 0) { var behind = obs && M.hits(0, 0, M.sunVec(sp.alt, sp.az), obs); x.fillStyle = behind ? '#7d6a35' : '#ffd479'; x.strokeStyle = C.bg2; x.lineWidth = 2; x.beginPath(); x.arc(X(sp.az), Y(sp.alt), 6, 0, 7); x.fill(); x.stroke(); }
      x.fillStyle = C.muted; x.textAlign = 'left'; x.textBaseline = 'top'; x.font = '600 10.5px system-ui,sans-serif'; x.fillText('SKY FROM THE MIDDLE OF THE BEDS', l + 4, t + 2);
    }
    function readout(info) {
      var L = lat(), n = dayNow(), sp = M.sunPos(L, n, gv.t), rd = [];
      rd.push(['Daylight', info.len >= 24 ? '24 h (midnight sun)' : info.len <= 0 ? 'none (polar night)' : M.fmtHours(info.len)]);
      if (info.len > 0 && info.len < 24) rd.push(['Sunrise, sunset', M.fmtTime(info.rise) + ', ' + M.fmtTime(info.set)]);
      rd.push(['Highest sun', Math.round(info.noonAlt) + '° at noon']);
      if (sp.alt > 0) rd.push(['Shadow now', fx(1 / Math.tan(sp.alt * Math.PI / 180), 1) + '× height']);
      var bed = [], all = [];
      if (heat) for (var j = 0; j < grid.ny; j++) for (var i = 0; i < grid.nx; i++) { var px = grid.x0 + (i + 0.5) * grid.w / grid.nx, py = grid.y0 + (j + 0.5) * grid.h / grid.ny; if (inBeds(px, py)) bed.push(heat.h[j * grid.nx + i]); }
      if (bed.length) {
        var mn = Math.min.apply(null, bed), mx = Math.max.apply(null, bed), six = bed.filter(function (v) { return v >= 6 - 1e-6; }).length / bed.length;
        rd.push(['Sun on the beds', (Math.abs(mx - mn) < 0.1 ? fx(mx, 1) + ' h everywhere' : fx(mn, 1) + ' to ' + fx(mx, 1) + ' h')]);
        rd.push(['6 h or more', Math.round(six * 100) + '% of the beds']);
      }
      $('#gv-sun-read').innerHTML = rd.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
      var s = 'At ' + latTxt() + (st.lat == null || st.lat === '' ? (own ? ' (an example latitude; set yours with the controls)' : ' (an example; set yours above)') : '') + ' on ' + M.fmtDay(n, true) + ', the sun is up ' + (info.len >= 24 ? 'all day' : info.len <= 0 ? 'not at all' : 'for ' + M.fmtHours(info.len)) + ' and climbs to ' + Math.round(info.noonAlt) + '° at noon. ';
      if (obs) s += 'A ' + lenTxt(obs.h) + ' ' + (obs.kind === 'house' ? 'house' : obs.kind) + ' ' + lenTxt(gv.ob.dist) + ' to the ' + M.compass(gv.ob.side) + ' ';
      if (bed.length) s += (obs ? 'leaves ' : 'With nothing in the way, ') + 'the beds ' + (Math.abs(mx - mn) < 0.1 ? 'get ' + fx(mx, 1) + ' hours of direct sun' : 'get between ' + fx(mn, 1) + ' and ' + fx(mx, 1) + ' hours of direct sun') + ' that day; ' + Math.round(six * 100) + '% of the bed area gets 6 hours or more.';
      $('#gv-sun-sum').textContent = s;
      var cs = cropStats(), lines = [];
      (foot.items || []).forEach(function (it) {
        var o = cs[it.k]; if (!o || !it.c.sun) return; var need = it.c.sun, ok = o.mn >= need - 0.05;
        lines.push('<li class="' + (ok ? 'ok' : 'low') + '">' + (ok ? '✓ ' : '⚠ ') + '<b>' + esc(nm(it.c)) + '</b>: ' + (Math.abs(o.mx - o.mn) < 0.1 ? fx(o.mn, 1) + ' h' : fx(o.mn, 1) + ' to ' + fx(o.mx, 1) + ' h') + ' (needs ' + need + '+)</li>');
      });
      $('#gv-sun-checks').innerHTML = lines.length ? '<li class="gv-chead">Your crops on ' + M.fmtDay(n) + (n === midSeason() && !own ? ' (mid-season)' : '') + ':</li>' + lines.join('') : '';
      cv.setAttribute('aria-label', 'Top view of the beds' + (obs ? ' and a ' + (obs.kind === 'house' ? 'house' : obs.kind) + ' to the ' + M.compass(gv.ob.side) : '') + ', colored by hours of direct sun, with the shadow at ' + M.fmtTime(gv.t) + '. Drag the ' + (obs ? obs.kind : 'obstacle') + ' to move it.');
      $('#gv-sun-note').innerHTML = 'Most vegetables need at least 6 hours of direct sun a day, 8 to 10 is ideal, and fruiting crops do best with 8 or more; leafy greens and some herbs get by with less. Times are sun time, with the sun highest at noon. Clocks differ: with daylight saving time, solar noon falls between about 12:30 and 2 pm in most of the US. The shade model treats a tree in leaf as solid and a house as a flat-roofed box; plants shading each other aren’t counted. ' +
        src(['noaacalc', 'tamu', 'vce', 'isushade']) + '.';
    }
    // drag the obstacle; tap shows the hours of sun at that spot
    function world(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - ox) / sc, y: (oy - (e.clientY - r.top)) / sc, px: e.clientX - r.left, py: e.clientY - r.top }; }
    function onOb(p) { if (!obs) return false; var rad = obs.kind === 'tree' ? obs.r : Math.max(obs.w, 4) / 2; return Math.hypot(p.x - obs.x, p.y - obs.y) <= rad + 10 / sc; }
    cv.addEventListener('pointerdown', function (e) { var p = world(e); if (onOb(p)) { drag = true; cv.setPointerCapture(e.pointerId); stop(); e.preventDefault(); } });
    cv.addEventListener('pointermove', function (e) {
      var p = world(e);
      if (drag) {
        var bear = (Math.atan2(p.x, p.y) * 180 / Math.PI + 360) % 360, a = bear * Math.PI / 180, reach = Math.abs(Math.sin(a)) * foot.W / 2 + Math.abs(Math.cos(a)) * foot.H / 2, half = obs.kind === 'tree' ? obs.r : obs.d / 2;
        gv.ob.side = Math.round(bear); gv.ob.dist = Math.max(0, Math.min(80, Math.round((Math.hypot(p.x, p.y) - reach - half) * 2) / 2)); heatKey = ''; cd.dirty = true; sched(cd); return;
      }
      cv.style.cursor = onOb(p) ? 'grab' : '';
      if (e.pointerType === 'mouse' && heat && gv.heat) hoverSpot(p);
    });
    function hoverSpot(p) {
      var i = Math.floor((p.x - grid.x0) / grid.w * grid.nx), j = Math.floor((p.y - grid.y0) / grid.h * grid.ny);
      if (i >= 0 && j >= 0 && i < grid.nx && j < grid.ny && inBeds(p.x, p.y)) tipAt(tip, view, p.px, p.py, fx(heat.h[j * grid.nx + i], 1) + ' hours of direct sun here'); else tip.hidden = true;
    }
    cv.addEventListener('pointerup', function (e) { if (drag) { drag = false; save(); } else if (e.pointerType !== 'mouse' && heat) hoverSpot(world(e)); });
    cv.addEventListener('pointerleave', function () { tip.hidden = true; });
    cv.addEventListener('keydown', function (e) {
      var k = e.key; if (k === 'ArrowRight' || k === 'ArrowLeft') { gv.t = Math.max(+time.min, Math.min(+time.max, gv.t + (k === 'ArrowRight' ? 0.25 : -0.25))); } else if (k === ' ') { toggle(); } else return;
      e.preventDefault(); cd.dirty = true; sched(cd);
    });
    // play the day
    var btn = $('#gv-play');
    function stop() { playing = false; btn.textContent = '▶'; btn.setAttribute('aria-label', 'Play the day'); }
    function toggle() {
      if (playing) { stop(); return; }
      playing = true; btn.textContent = '❚❚'; btn.setAttribute('aria-label', 'Pause'); lastT = 0;
      if (gv.t >= +time.max - 0.06) gv.t = +time.min;
      requestAnimationFrame(step);
    }
    function step(ts) {
      if (!playing) return;
      var dt = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0; lastT = ts;
      if (RMQ.matches) { gv.t += 0.5; setTimeout(function () { requestAnimationFrame(step); }, 600); }
      else { gv.t += dt * 1.2; requestAnimationFrame(step); }
      if (gv.t > +time.max) { gv.t = +time.max; stop(); }
      cd.dirty = true; sched(cd);
    }
    btn.addEventListener('click', toggle);
    cd = addCard(el, draw);
  }
  function scaleBar(x, X0, Y0, sc, maxPx) {
    var met = umode() === 'metric', unit = met ? 0.3048 : 1, steps = [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500], len = steps[0];
    steps.forEach(function (s) { if (s / unit * sc <= maxPx) len = s; });
    var px = len / unit * sc;
    x.strokeStyle = C.ink; x.lineWidth = 2; x.beginPath(); x.moveTo(X0, Y0 - 5); x.lineTo(X0, Y0); x.lineTo(X0 + px, Y0); x.lineTo(X0 + px, Y0 - 5); x.stroke();
    x.fillStyle = C.ink; x.font = '11px system-ui,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'bottom';
    var lbl = met ? len + ' m' : len + ' ft' + (umode() === 'both' ? ' (' + fx(len * 0.3048, len * 0.3048 < 10 ? 1 : 0) + ' m)' : '');
    x.fillText(lbl, X0 + px + 6, Y0 + 1);
  }

  // =====================================================================================================
  // 5. Daylight and laying hens
  // =====================================================================================================
  function henCard(box, own) {
    var AN = {}; ((DATA.an || {}).ch || []).forEach(function (n) { AN[n.id] = n; });
    var dl = AN.daylight_for_laying, need = dl ? dl.value.hours_per_day : 14, most = dl ? dl.value.range_high : 16;
    box.insertAdjacentHTML('beforeend', shell('gv-hen', 'Daylight and your hens’ laying', 'Hens lay steadily with about ' + need + ' hours of light a day. Here is the length of the day through the year at your latitude.') +
      (own ? '<div class="gv-row2"><label class="gv-field gv-inl"><span><span>Latitude (south is negative)</span></span><input type="number" id="gv-hlat" min="-60" max="70" step="0.1" inputmode="decimal"></label>' + citySelect('gv-hcity') + '</div>' : '') +
      '<div class="gv-view gv-chart" id="gv-hen-view"><div id="gv-hen-svg"></div><div class="gv-tip" id="gv-hen-tip" hidden></div></div>' +
      '<div class="gv-keys"><span><i style="background:' + C.gold + ';border-radius:50%"></i>Today</span><span><i style="background:' + C.gold + '"></i>Sunrise to sunset</span><span><i style="background:rgba(229,196,106,.35)"></i>With twilight</span><span><i style="background:' + C.acc + '"></i>' + need + ' hours</span><label class="gv-chk"><input type="checkbox" id="gv-light"> Show light to add for ' + need + ' hours</label></div>' +
      '<p class="gv-sum" id="gv-hen-sum"></p><p class="gv-small" id="gv-hen-note"></p></article>');
    var el = $('#gv-hen'), view = $('#gv-hen-view'), tip = $('#gv-hen-tip'), cd;
    if (own) bindLat($('#gv-hlat'), $('#gv-hcity'), function () { cd.dirty = true; sched(cd); });
    $('#gv-light').checked = !!gv.light;
    $('#gv-light').addEventListener('change', function () { gv.light = this.checked; save(); cd.dirty = true; sched(cd); });
    function draw() {
      var L = lat(), cw = view.clientWidth || 600, mob = cw < 560, days = [], i;
      for (i = 1; i <= 365; i++) { var di = M.dayInfo(L, i); days.push({ n: i, len: di.len, civ: di.civil }); }
      var lo = Math.min.apply(null, days.map(function (d) { return d.len; })), hi = Math.max.apply(null, days.map(function (d) { return d.civ; }));
      var y0 = Math.max(0, Math.floor(Math.min(lo, need) - 1)), y1 = Math.min(24, Math.ceil(Math.max(hi, most) + 0.5));
      var lw = 36, top = 14, ph = mob ? 180 : 220, H = top + ph + 28, pw = cw - lw - 12;
      function X(n) { return lw + (n - 1) / 364 * pw; } function Y(h) { return top + ph - (h - y0) / (y1 - y0) * ph; }
      var b = '';
      for (var hh = Math.ceil(y0 / 2) * 2; hh <= y1; hh += 2) b += '<line x1="' + lw + '" x2="' + (cw - 8) + '" y1="' + Y(hh) + '" y2="' + Y(hh) + '" stroke="' + C.line + '"/><text x="' + (lw - 6) + '" y="' + (Y(hh) + 4) + '" text-anchor="end" fill="' + C.muted + '" font-size="11">' + hh + ' h</text>';
      M.monthStarts(1, 365).forEach(function (m) { b += '<text x="' + (X(m.n) + pw / 24) + '" y="' + (top + ph + 17) + '" text-anchor="middle" fill="' + C.muted + '" font-size="11">' + M.MON[m.m - 1].slice(0, mob ? 1 : 3) + '</text><line x1="' + X(m.n) + '" x2="' + X(m.n) + '" y1="' + (top + ph) + '" y2="' + (top + ph + 5) + '" stroke="' + C.muted + '"/>'; });
      var civ = days.map(function (d) { return X(d.n) + ',' + Y(Math.min(y1, d.civ)); }).join(' '), len = days.map(function (d) { return X(d.n) + ',' + Y(Math.max(y0, d.len)); }).join(' ');
      b += '<polygon points="' + X(1) + ',' + Y(y0) + ' ' + len + ' ' + X(365) + ',' + Y(y0) + '" fill="rgba(229,196,106,.12)"/>';
      b += '<polygon points="' + len + ' ' + days.slice().reverse().map(function (d) { return X(d.n) + ',' + Y(Math.min(y1, d.civ)); }).join(' ') + '" fill="rgba(229,196,106,.2)"/>';
      if (gv.light) b += '<polygon points="' + days.map(function (d) { return X(d.n) + ',' + Y(Math.max(y0, Math.min(need, d.len))); }).join(' ') + ' ' + X(365) + ',' + Y(need) + ' ' + X(1) + ',' + Y(need) + '" fill="rgba(108,199,154,.28)"/>';
      b += '<line x1="' + lw + '" x2="' + (cw - 8) + '" y1="' + Y(need) + '" y2="' + Y(need) + '" stroke="' + C.acc + '" stroke-width="1.5"/><text x="' + (cw - 10) + '" y="' + (Y(need) - 5) + '" text-anchor="end" fill="' + C.ink + '" font-size="11">' + need + ' h: steady laying</text>';
      if (most <= y1) b += '<line x1="' + lw + '" x2="' + (cw - 8) + '" y1="' + Y(most) + '" y2="' + Y(most) + '" stroke="rgba(157,190,170,.45)"/><text x="' + (cw - 10) + '" y="' + (Y(most) - 5) + '" text-anchor="end" fill="' + C.muted + '" font-size="11">' + most + ' h: most light to give</text>';
      b += '<polyline points="' + len + '" fill="none" stroke="' + C.gold + '" stroke-width="2" stroke-linejoin="round"/>';
      if (TODAY >= 1 && TODAY <= 365) { var td = days[TODAY - 1]; b += '<line x1="' + X(TODAY) + '" x2="' + X(TODAY) + '" y1="' + top + '" y2="' + (top + ph) + '" stroke="rgba(226,235,229,.35)"/><circle cx="' + X(TODAY) + '" cy="' + Y(Math.max(y0, td.len)) + '" r="4.5" fill="' + C.gold + '" stroke="' + C.bg + '" stroke-width="2"/>'; }
      b += '<line id="gv-hen-x" x1="0" x2="0" y1="' + top + '" y2="' + (top + ph) + '" stroke="rgba(226,235,229,.5)" visibility="hidden"/><rect id="gv-hen-hit" x="' + lw + '" y="' + top + '" width="' + pw + '" height="' + ph + '" fill="transparent"/>';
      var runs = M.longDays(L, need), short = days.filter(function (d) { return d.len < need; }), minD = days.reduce(function (a, d) { return d.len < a.len ? d : a; }, days[0]);
      $('#gv-hen-svg').innerHTML = svg(cw, H, b, 'Hours of daylight through the year at ' + latTxt(L) + ', against the ' + need + '-hour line for steady laying.');
      var hit = $('#gv-hen-hit'), xl = $('#gv-hen-x');
      function henTip(e) {
        var vr = view.getBoundingClientRect(), px = e.clientX - vr.left, n = Math.max(1, Math.min(365, Math.round((px - lw) / pw * 364 + 1))), d = days[n - 1];
        xl.setAttribute('x1', X(n)); xl.setAttribute('x2', X(n)); xl.setAttribute('visibility', 'visible');
        tipAt(tip, view, px, e.clientY - vr.top, '<b>' + M.fmtDay(n, true) + '</b><br>Daylight ' + M.fmtHours(d.len) + '<br>With twilight ' + M.fmtHours(d.civ) + (d.len < need ? '<br>' + M.fmtHours(need - d.len) + ' short of ' + need + ' h' : ''));
      }
      hit.addEventListener('pointermove', henTip); hit.addEventListener('click', henTip);
      hit.addEventListener('pointerleave', function () { tip.hidden = true; xl.setAttribute('visibility', 'hidden'); });
      var hens = G.plan && G.plan.hens, ep = AN.eggs_per_hen_year;
      var s = 'At ' + latTxt(L) + ', ';
      if (!runs.length) s += 'days are never ' + need + ' hours long from sunrise to sunset; the longest is ' + M.fmtHours(Math.max.apply(null, days.map(function (d) { return d.len; }))) + ' in ' + (L >= 0 ? 'June' : 'December') + '. Twilight adds some light, and many hens still lay well, but expect fewer eggs as days shorten in fall and winter. ';
      else if (runs[0].b - runs[0].a >= 364) s += 'days are at least ' + need + ' hours long all year. ';
      else s += 'days are ' + need + ' hours or longer from ' + M.fmtDay(runs[0].a, true) + ' to ' + M.fmtDay(runs[0].b, true) + ' (' + (runs[0].b - runs[0].a + 1) + ' days). The shortest day, ' + M.fmtDay(minD.n, true) + ', has ' + M.fmtHours(minD.len) + '. Expect the most eggs in the long days of late spring and summer. Laying slows as days shorten in fall. Many hens molt then, resting 6 to 8 weeks or more while they grow new feathers. ';
      if (gv.light && short.length) s += 'To keep ' + need + ' hours all year you would add up to ' + M.fmtHours(need - minD.len) + ' of light a day around ' + M.fmtDay(minD.n) + '. ';
      if (hens && ep) s += 'Over a good year, your ' + hens + ' hen' + (hens > 1 ? 's' : '') + ' should average about ' + Math.round(hens * ep.value.typical_low / 52) + ' to ' + Math.round(hens * ep.value.typical_high / 52) + ' eggs a week (' + ep.value.typical_low + ' to ' + ep.value.typical_high + ' eggs a hen a year). Expect more than that in summer and fewer in winter.';
      $('#gv-hen-sum').textContent = s;
      $('#gv-hen-note').innerHTML = esc(dl ? dl.notes : '') + ' Day length here is sunrise to sunset; the lighter band adds morning and evening twilight. ' + (dl ? src(dl.sources.slice(0, 4)) : '') + (ep ? ' · ' + src(ep.sources.slice(0, 1)).replace(/^Sources: /, '') : '') + ' · Day length: ' + src(['noaacalc']).replace(/^Sources: /, '') + '.';
    }
    cd = addCard(el, draw);
    return cd;
  }

  // ---------- put it together ----------
  var root = D.getElementById('gv-root');
  if (root) {
    root.innerHTML = '';
    var showDates = placeBar(root);
    mapCard(root); calCard(root); harCard(root); sunCard(root, false); henCard(root, false);
    var visible = function () {
      var P = G.plan || {}, indoor = P.where === 'indoor';
      $('.gv-place', root).hidden = indoor;
      ['gv-cal', 'gv-har', 'gv-sun'].forEach(function (id) { $('#' + id).hidden = indoor; });
      $('#gv-hen').hidden = !P.hens;
    };
    visible();
    D.addEventListener('trb-garden-plan', function () { visible(); refresh(); });
    D.addEventListener('trb-units', function () { showDates(); refresh(); });
    refresh();
  }
  $$('[data-gv]').forEach(function (box) {
    box.innerHTML = '';
    if (box.dataset.gv === 'sun') sunCard(box, true); else if (box.dataset.gv === 'hen') henCard(box, true);
  });
  if (!root) D.addEventListener('trb-units', refresh);
})(window, document);
