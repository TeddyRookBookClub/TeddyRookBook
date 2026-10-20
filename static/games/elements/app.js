/* The Elements (Science Lab, /science-lab/elements/): the periodic table, the 3-D atom, the element facts, compare,
   quiz, element sounds and printable cards. Data: window.TRBElementsData (from data/elements/elements.json).
   Deep links: #Te selects tellurium; #compare=Fe,Cu opens Compare with iron and copper.
   Quiz scores are kept in this browser under localStorage 'trb-elements-v1'. */
(function (W, D) {
  'use strict';
  var DATA = W.TRBElementsData, C = W.TRBElCore, SND = W.TRBElSound, M = Math;
  if (!DATA || !C) return;
  var ALL = DATA.elements.slice().sort(function (a, b) { return a.z - b.z; }), BYZ = {}, BYSYM = {};
  ALL.forEach(function (e) { BYZ[e.z] = e; BYSYM[e.symbol.toLowerCase()] = e; });
  var ZMAX = ALL[ALL.length - 1].z;
  var $ = function (id) { return D.getElementById(id); };
  var app = $('el-app'); if (!app) return;
  var STORE = 'trb-elements-v1';
  function load() { try { return JSON.parse(W.localStorage.getItem(STORE) || '{}') || {}; } catch (e) { return {}; } }
  function save(o) { try { W.localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) { } }

  /* ------------------------------------------------------------ helpers */
  var CATS = (DATA.meta && DATA.meta.categories) || ['alkali metal', 'alkaline earth metal', 'transition metal', 'post-transition metal', 'metalloid', 'reactive nonmetal', 'noble gas', 'lanthanide', 'actinide', 'unknown'];
  var CATC = { 'alkali metal': '#ff8787', 'alkaline earth metal': '#ffa94d', 'transition metal': '#ffd43b', 'post-transition metal': '#a5d8ff', 'metalloid': '#66d9e8', 'reactive nonmetal': '#b197fc', 'noble gas': '#f783ac', 'lanthanide': '#c0eb75', 'actinide': '#8ce99a', 'unknown': '#dee2e6' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  function num(v, d) {
    if (v == null || !isFinite(v)) return '—';
    var s = d == null ? String(+v) : (+v).toFixed(d), neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + p.join('.');
  }
  function sig(v, n) { if (v == null) return '—'; if (v === 0) return '0'; var d = M.max(0, n - 1 - M.floor(M.log10(M.abs(v)))); return num(+v.toFixed(d), d > 6 ? 6 : undefined); }
  function supNum(s) { return String(s).replace(/(\d+)([spdf])(\d+)/g, '$1$2<sup>$3</sup>'); }
  function temp(o) {
    if (!o || o.k == null) return o && o.note ? '<span class="el-muted">' + esc(o.note) + '</span>' : '—';
    var c = o.k - 273.15, f = c * 9 / 5 + 32;
    return num(o.k, o.k % 1 ? 2 : 0) + ' K <span class="el-muted">(' + num(c, o.k % 1 ? 1 : 0) + ' °C, ' + num(f, 0) + ' °F)</span>' + (o.note ? ' <span class="el-muted">· ' + esc(o.note) + '</span>' : '');
  }
  function dens(e) {
    var d = e.density; if (!d || d.value == null) return d && d.note ? '<span class="el-muted">' + esc(d.note) + '</span>' : '—';
    return num(d.value) + ' ' + (d.unit === 'g/L' ? 'g/L <span class="el-muted">(gas at 0 °C)</span>' : 'g/cm³') + (d.note ? ' <span class="el-muted">· ' + esc(d.note) + '</span>' : '');
  }
  function lum(hex) { var n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
  function stateAt(e, K) {
    var m = e.melt && e.melt.k, b = e.boil && e.boil.k, sub = e.boil && /sublim/i.test(e.boil.note || '');
    if (m == null && b == null) return 'unknown';
    if (m == null) return K < b ? (sub ? 'solid' : 'liquid') : 'gas';
    if (K < m) return 'solid';
    if (b == null) return 'liquid';
    return K < b ? 'liquid' : 'gas';
  }
  function discYear(e) { var d = e.discovery || {}; return d.ancient ? null : d.year; }
  function weightText(e) { return e.weight ? e.weight.text : '—'; }
  function weightShort(e) { // for small tiles: at most three decimals
    var w = e.weight; if (!w) return '—'; if (w.kind === 'mass number' || w.value == null) return w.text;
    var d = (String(w.text).split('.')[1] || '').length; return d > 3 ? (+w.value).toFixed(3) : w.text;
  }
  function isoName(e, a) { return e.name.toLowerCase() + '-' + a; }

  /* ------------------------------------------------------------ trends and colors */
  var VIR = ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'];
  function ramp(t) {
    t = M.max(0, M.min(1, t)); var k = t * (VIR.length - 1), i = M.min(VIR.length - 2, M.floor(k)), f = k - i;
    var a = parseInt(VIR[i].slice(1), 16), b = parseInt(VIR[i + 1].slice(1), 16), out = '#';
    [16, 8, 0].forEach(function (s) { var v = M.round(((a >> s) & 255) * (1 - f) + ((b >> s) & 255) * f); out += (v < 16 ? '0' : '') + v.toString(16); });
    return out;
  }
  var STATEC = { solid: '#a9b4be', liquid: '#4dabf7', gas: '#ffc9c9', unknown: '#eef1f3' };
  var TRENDS = {
    category: { name: 'Family' },
    radius: { name: 'Atomic radius', get: function (e) { return e.radius; }, unit: 'pm', fmt: function (v) { return num(v) + ' pm'; }, note: 'Covalent radius (Cordero et al. 2008).' },
    en: { name: 'Electronegativity', get: function (e) { return e.en; }, unit: '', fmt: function (v) { return num(v, 2); }, note: 'Pauling scale.' },
    ie1: { name: 'Ionization energy', get: function (e) { return e.ie1; }, unit: 'eV', fmt: function (v) { return num(v, 2) + ' eV'; }, note: 'First ionization energy.' },
    melt: { name: 'Melting point', get: function (e) { return e.melt && e.melt.k; }, unit: 'K', fmt: function (v) { return num(v, 0) + ' K'; }, note: 'At 1 atm. Gray: not measured (or it skips the liquid at 1 atm).' },
    density: { name: 'Density', get: function (e) { var d = e.density; return d && d.value != null ? (d.unit === 'g/L' ? d.value / 1000 : d.value) : null; }, log: true, unit: 'g/cm³', fmt: function (v) { return sig(v, 2) + ' g/cm³'; }, note: 'Log scale. Gases at 0 °C, converted to g/cm³.' },
    year: { name: 'Year of discovery', get: discYear, unit: '', fmt: function (v) { return String(v); }, note: 'Dark gold: known since ancient times.' },
    state: { name: 'State at a temperature' }
  };
  var range = {};
  Object.keys(TRENDS).forEach(function (k) {
    var t = TRENDS[k]; if (!t.get) return;
    var vs = ALL.map(t.get).filter(function (v) { return v != null && isFinite(v) && (!t.log || v > 0); });
    if (!vs.length) return;
    var lo = M.min.apply(null, vs), hi = M.max.apply(null, vs);
    range[k] = t.log ? [M.log10(lo), M.log10(hi)] : [lo, hi];
  });
  function trendColor(k, e, K) {
    if (k === 'category') return CATC[e.category] || CATC.unknown;
    if (k === 'state') return STATEC[stateAt(e, K)];
    var t = TRENDS[k], v = t.get(e);
    if (k === 'year' && e.discovery && e.discovery.ancient) return '#b8963e';
    if (v == null || !isFinite(v) || !range[k]) return null;
    var r = range[k], x = t.log ? M.log10(v) : v;
    return ramp((x - r[0]) / ((r[1] - r[0]) || 1));
  }

  /* ------------------------------------------------------------ a periodic table (main, quiz and print use it) */
  function table(host, opt) {
    opt = opt || {};
    var cells = {}, html = '';
    ALL.forEach(function (e) {
      html += '<button type="button" class="el-c" data-z="' + e.z + '" style="grid-row:' + (e.row + 1) + ';grid-column:' + e.col + '" tabindex="-1" aria-label="' + esc(e.name + ', ' + e.z) + '">' +
        '<span class="el-cz">' + e.z + '</span><b>' + (opt.blank ? '' : esc(e.symbol)) + '</b>' + (opt.small ? '' : '<span class="el-cn">' + esc(e.name) + '</span><span class="el-cv"></span>') + '</button>';
    });
    html += '<span class="el-gap" style="grid-row:9;grid-column:1" aria-hidden="true"></span>';
    html += '<span class="el-flab" style="grid-row:10;grid-column:1/4" aria-hidden="true">Lanthanides</span><span class="el-flab" style="grid-row:11;grid-column:1/4" aria-hidden="true">Actinides</span>';
    if (!opt.small) {
      for (var g = 1; g <= 18; g++) html += '<span class="el-gl" style="grid-row:' + (g === 1 || g === 18 ? 1 : g === 2 || g >= 13 ? 2 : 4) + ';grid-column:' + g + '" aria-hidden="true">' + g + '</span>';
    }
    host.innerHTML = html;
    [].forEach.call(host.querySelectorAll('.el-c'), function (b) { cells[b.dataset.z] = b; });
    var first = cells[1]; if (first) first.tabIndex = 0;
    host.setAttribute('role', 'group');
    host.addEventListener('click', function (ev) { var b = ev.target.closest('.el-c'); if (b && opt.onPick) opt.onPick(BYZ[b.dataset.z], b); });
    host.addEventListener('keydown', function (ev) {
      var b = ev.target.closest('.el-c'); if (!b) return;
      var e = BYZ[b.dataset.z], dir = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[ev.key], nx = null;
      if (ev.key === 'Home') nx = BYZ[1]; else if (ev.key === 'End') nx = BYZ[ZMAX];
      else if (dir) nx = neighbor(e, dir[0], dir[1]);
      else return;
      ev.preventDefault();
      if (nx) { focusCell(nx.z); if (opt.onMove) opt.onMove(nx); }
    });
    function focusCell(z) { var c = cells[z]; if (!c) return; [].forEach.call(host.querySelectorAll('.el-c[tabindex="0"]'), function (x) { x.tabIndex = -1; }); c.tabIndex = 0; c.focus(); }
    return { host: host, cells: cells, focus: focusCell, setRoving: function (z) { var c = cells[z]; if (!c) return; [].forEach.call(host.querySelectorAll('.el-c[tabindex="0"]'), function (x) { x.tabIndex = -1; }); c.tabIndex = 0; } };
  }
  function vr(e) { return e.row >= 9 ? e.row - 0.5 : e.row; } // the f rows sit just below the main table
  function neighbor(e, dr, dc) {
    var best = null, bd = 1e9;
    ALL.forEach(function (o) {
      if (o === e) return;
      var r = vr(o) - vr(e), c = o.col - e.col;
      if (dc && (M.sign(c) !== dc || M.abs(r) > 0.6)) return;
      if (dr && (M.sign(r) !== dr)) return;
      var d = dc ? M.abs(c) + M.abs(r) * 3 : M.abs(r) * 1 + M.abs(c) * 2.2;
      if (d < bd) { bd = d; best = o; }
    });
    if (!best && dc) { var z = e.z + dc; best = BYZ[z] || null; } // wrap to the next row at the ends
    return best;
  }

  /* ------------------------------------------------------------ main table */
  var S = { z: 26, color: 'category', K: 298, cmpA: 26, cmpB: 29 };
  var mainT = table($('el-table'), { onPick: function (e) { select(e.z, { from: 'table' }); }, onMove: function (e) { select(e.z, { from: 'key' }); } });
  function paintTable() {
    var k = S.color;
    ALL.forEach(function (e) {
      var c = mainT.cells[e.z], col = trendColor(k, e, S.K);
      c.style.background = col || '';
      c.classList.toggle('el-nodata', !col);
      c.style.color = col ? (lum(col) > 0.45 ? '#14201a' : '#fff') : '';
      var v = c.querySelector('.el-cv'), t = TRENDS[k];
      v.textContent = k === 'category' ? weightShort(e) : k === 'state' ? stateAt(e, S.K) : (t.get(e) != null ? t.fmt(t.get(e)) : (k === 'year' && e.discovery && e.discovery.ancient ? 'ancient' : '—'));
      c.setAttribute('aria-label', e.name + ', ' + e.z + (k === 'category' ? ', ' + e.category : ', ' + t.name.toLowerCase() + ' ' + v.textContent));
    });
    legend();
  }
  function legend() {
    var k = S.color, L = $('el-legend'), h = '';
    $('el-temp-row').hidden = k !== 'state';
    if (k === 'category') {
      h = CATS.map(function (c) { return '<button type="button" class="el-lg" data-cat="' + esc(c) + '"><i style="background:' + CATC[c] + '"></i>' + esc(cap(c)) + '</button>'; }).join('');
    } else if (k === 'state') {
      h = ['solid', 'liquid', 'gas', 'unknown'].map(function (s) { var n = ALL.filter(function (e) { return stateAt(e, S.K) === s; }).length; return '<span class="el-lg"><i style="background:' + STATEC[s] + '"></i>' + cap(s) + ' <b>' + n + '</b></span>'; }).join('');
    } else {
      var t = TRENDS[k], r = range[k], lo = t.log ? M.pow(10, r[0]) : r[0], hi = t.log ? M.pow(10, r[1]) : r[1];
      h = '<span class="el-scale"><span class="el-sv">' + t.fmt(lo) + '</span><span class="el-bar" style="background:linear-gradient(90deg,' + VIR.join(',') + ')"></span><span class="el-sv">' + t.fmt(hi) + '</span></span>' +
        '<span class="el-lg"><i class="el-nod"></i>No data</span>' + (k === 'year' ? '<span class="el-lg"><i style="background:#b8963e"></i>Ancient</span>' : '') + '<span class="el-lgn">' + esc(t.note || '') + '</span>';
    }
    L.innerHTML = h;
  }
  $('el-color').addEventListener('change', function () { S.color = this.value; paintTable(); });
  $('el-temp').addEventListener('input', function () { S.K = +this.value; tempOut(); paintTable(); });
  function tempOut() { var K = S.K; $('el-temp-o').textContent = num(K) + ' K · ' + num(K - 273.15, 0) + ' °C · ' + num((K - 273.15) * 9 / 5 + 32, 0) + ' °F'; }
  $('el-legend').addEventListener('mouseover', function (ev) { var b = ev.target.closest('[data-cat]'); hl(b ? b.dataset.cat : null); });
  $('el-legend').addEventListener('mouseleave', function () { hl(null); });
  $('el-legend').addEventListener('click', function (ev) { var b = ev.target.closest('[data-cat]'); if (!b) return; var on = b.getAttribute('aria-pressed') !== 'true'; [].forEach.call(this.querySelectorAll('[data-cat]'), function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', on); hl(on ? b.dataset.cat : null, true); });
  var pinnedCat = null;
  function hl(cat, pin) {
    if (pin) pinnedCat = cat; if (!cat) cat = pinnedCat;
    ALL.forEach(function (e) { mainT.cells[e.z].classList.toggle('el-dim', !!cat && e.category !== cat); });
  }
  // search
  var q = $('el-search');
  function matches(s) {
    s = s.trim().toLowerCase(); if (!s) return [];
    if (/^\d+$/.test(s)) return BYZ[+s] ? [BYZ[+s]] : [];
    var exact = BYSYM[s], out = exact ? [exact] : [];
    ALL.forEach(function (e) { if (e !== exact && (e.name.toLowerCase().indexOf(s) === 0 || (s.length > 2 && e.name.toLowerCase().indexOf(s) > 0))) out.push(e); });
    return out;
  }
  q.addEventListener('input', function () {
    var m = matches(q.value), set = {}; m.forEach(function (e) { set[e.z] = 1; });
    ALL.forEach(function (e) { mainT.cells[e.z].classList.toggle('el-dim', !!q.value.trim() && !set[e.z]); mainT.cells[e.z].classList.toggle('el-hit', !!set[e.z]); });
    $('el-search-o').textContent = q.value.trim() ? (m.length ? m.length + (m.length === 1 ? ' match: ' : ' matches: ') + m.slice(0, 4).map(function (e) { return e.name; }).join(', ') + (m.length > 4 ? '…' : '') + '. Enter picks the first.' : 'No element matches.') : '';
  });
  q.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); var m = matches(q.value); if (m.length) { select(m[0].z, { from: 'search' }); } }
    if (ev.key === 'Escape') { q.value = ''; q.dispatchEvent(new Event('input')); }
  });

  /* ------------------------------------------------------------ the atom view */
  var V = W.TRBElView.create({ view: $('el-view'), gl: $('el-gl'), ov: $('el-ov'), onPick: picked });
  app.dataset.renderer = V.renderer;
  $('el-zin').addEventListener('click', function () { V.zoomBy(1.4); });
  $('el-zout').addEventListener('click', function () { V.zoomBy(1 / 1.4); });
  $('el-reset').addEventListener('click', function () { V.reset(); syncOrb(); });
  segs($('el-mode'), function (m) { V.mode(m); syncMode(); });
  segs($('el-layout'), function (l) { V.layout(l); syncOrb(); });
  function segs(host, fn) {
    host.addEventListener('click', function (ev) { var b = ev.target.closest('button[data-v]'); if (!b) return; [].forEach.call(host.querySelectorAll('button[data-v]'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); fn(b.dataset.v); });
  }
  function setSeg(host, v) { [].forEach.call(host.querySelectorAll('button[data-v]'), function (x) { x.setAttribute('aria-pressed', x.dataset.v === v ? 'true' : 'false'); }); }
  function syncMode() {
    var m = V.mode();
    setSeg($('el-mode'), m);
    $('el-shellbox').hidden = m !== 'shell'; $('el-orbbox').hidden = m !== 'orbital';
    $('el-hud').innerHTML = m === 'shell' ? '<b>Shell model</b><span class="el-hx"> · a simple picture, not to scale</span>' : '<b>Orbitals</b><span class="el-hx"> · where each electron is likely to be</span>';
    if (m === 'orbital') syncOrb();
    $('el-ov').setAttribute('aria-label', viewLabel());
  }
  function viewLabel() {
    var e = BYZ[S.z]; if (!e) return '';
    if (V.mode() === 'shell') return '3-D shell model of ' + e.name + ': a nucleus of ' + e.model.protons + ' protons and ' + e.model.neutrons + ' neutrons, with electrons on rings of ' + (e.shells || []).join(', ') + '. Drag to turn it, scroll or pinch to zoom; with the picture selected, arrow keys turn it, + and − zoom, 0 resets.';
    return '3-D orbital clouds of ' + e.name + ' (' + e.config.short + '). Drag to turn, scroll or pinch to zoom, tap a cloud to name its orbital; arrow keys turn it, + and − zoom, 0 resets.';
  }
  function syncOrb() {
    var obs = V.orbitals(), subs = [], seen = {}, lay = V.layout(), hid = V.hidden(), cur = V.sub();
    obs.forEach(function (o) { if (!seen[o.sub]) { seen[o.sub] = 1; subs.push({ lab: o.sub, l: o.l, count: o.subCount, zeff: o.zeff }); } });
    setSeg($('el-layout'), lay);
    var pal = W.TRBElView.PAL;
    $('el-subs').innerHTML = subs.map(function (s) {
      var on = lay === 'apart' ? s.lab === cur : !hid[s.lab], c = pal[s.l][0];
      return '<button type="button" data-sub="' + s.lab + '" aria-pressed="' + on + '" style="--sc:rgb(' + c.map(function (x) { return M.round(x * 255); }).join(',') + ')">' + s.lab + '<sup>' + s.count + '</sup></button>';
    }).join('');
    $('el-subs-l').textContent = lay === 'apart' ? 'Subshell to show' : 'Subshells (tap to hide or show)';
    $('el-zoomto').hidden = lay === 'apart';
    $('el-zoomsel').innerHTML = '<option value="">Whole atom</option>' + subs.map(function (s) { return '<option value="' + s.lab + '">' + s.lab + '</option>'; }).join('');
    $('el-orbnote').innerHTML = lay === 'apart' ? 'Each orbital is drawn the same size here so you can see its shape. Two colors mark the two signs of the wave.' : 'Every occupied orbital at its approximate true size. Inner ones are tiny: zoom to see them. Two colors mark the two signs of the wave.';
  }
  $('el-subs').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-sub]'); if (!b) return;
    if (V.layout() === 'apart') V.sub(b.dataset.sub);
    else V.hide(b.dataset.sub, b.getAttribute('aria-pressed') === 'true');
    syncOrb();
  });
  $('el-zoomsel').addEventListener('change', function () { V.focus(this.value || null); });
  function picked(ob) {
    var box = $('el-pick');
    if (!ob) { box.innerHTML = '<span class="el-muted">Tap a cloud to name its orbital.</span>'; return; }
    var kinds = { 0: 'the one s orbital', 1: 'one of three p orbitals', 2: 'one of five d orbitals', 3: 'one of seven f orbitals' };
    box.innerHTML = '<b class="el-on">' + ob.name + '</b> holds <b>' + ob.electrons + '</b> electron' + (ob.electrons > 1 ? 's' : '') + ' (' + kinds[ob.l] + ' in ' + ob.sub + ', which has ' + ob.subCount + '). Effective nuclear charge ≈ ' + num(ob.zeff, 2) + ' (Slater).';
  }

  /* ------------------------------------------------------------ selecting an element */
  var viewTimer = null;
  function select(z, o) {
    o = o || {};
    var e = BYZ[z]; if (!e) return;
    S.z = z;
    [].forEach.call($('el-table').querySelectorAll('.el-c.el-sel'), function (c) { c.classList.remove('el-sel'); c.removeAttribute('aria-current'); });
    var c = mainT.cells[z]; c.classList.add('el-sel'); c.setAttribute('aria-current', 'true'); mainT.setRoving(z);
    side(e); info(e);
    clearTimeout(viewTimer);
    var go = function () { V.set(e); if (V.mode() === 'orbital') syncOrb(); picked(null); $('el-ov').setAttribute('aria-label', viewLabel()); };
    if (o.from === 'key') viewTimer = setTimeout(go, 140); else go();
    $('el-live').textContent = e.name + ', element ' + e.z + ', ' + e.category + '.';
    if (!o.noHash) { try { W.history.replaceState(null, '', '#' + e.symbol); } catch (err) { } }
    $('el-snd-el').textContent = e.name;
    soundInfo();
    $('el-card-btn').textContent = 'Print the ' + e.name + ' card';
    if (o.from === 'search') { $('el-top').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  $('el-prev').addEventListener('click', function () { select(S.z > 1 ? S.z - 1 : ZMAX); });
  $('el-next').addEventListener('click', function () { select(S.z < ZMAX ? S.z + 1 : 1); });

  function tile(e, cls) {
    return '<div class="el-tile ' + (cls || '') + '" style="--tc:' + (CATC[e.category] || CATC.unknown) + '"><span class="el-tz">' + e.z + '</span><b>' + esc(e.symbol) + '</b><span class="el-tn">' + esc(e.name) + '</span><span class="el-tw">' + esc(weightShort(e)) + '</span></div>';
  }
  function side(e) {
    $('el-head').innerHTML = tile(e) + '<div class="el-hd"><h2 id="el-name">' + esc(e.name) + '</h2><p><span class="el-chip" style="--tc:' + (CATC[e.category] || CATC.unknown) + '">' + esc(cap(e.category)) + '</span></p><p class="el-muted">' + (e.group ? 'Group ' + e.group + ' · ' : '') + 'Period ' + e.period + ' · ' + e.block + ' block</p></div>';
    var m = e.model || {};
    $('el-shellinfo').innerHTML = '<dl class="lab-readout"><dt>Nucleus</dt><dd>' + m.protons + ' p, ' + m.neutrons + ' n</dd><dt>Isotope shown</dt><dd>' + esc(isoName(e, m.a)) + '</dd><dt>Electrons by shell</dt><dd>' + (e.shells || []).join(', ') + '</dd></dl>' +
      '<p class="lab-small">Protons are red, neutrons gray, electrons blue. ' + (e.isotopes && e.isotopes.length ? 'The nucleus is ' + esc(e.name.toLowerCase()) + '-' + m.a + ', the most common isotope in nature.' : 'No isotope of ' + esc(e.name.toLowerCase()) + ' lasts in nature, so this is ' + esc(e.name.toLowerCase()) + '-' + m.a + ', the longest-lived one known.') + ' Real electrons don’t ride on rings: see <i>Orbitals</i>.</p>';
    $('el-config').innerHTML = supNum(esc(e.config.short)) + (e.config.exception ? ' <span class="el-flag" title="Not the order the simple filling rule predicts">exception</span>' : '') + (e.config.predicted ? ' <span class="el-flag">predicted</span>' : '');
  }

  /* ------------------------------------------------------------ the info panel */
  function spectrumSVG(e, o) {
    o = o || {};
    var W0 = o.w || 640, H = o.h || 70, sp = e.spectrum || {}, L = sp.lines || [], ax = o.axis !== false, hgt = ax ? H - 16 : H;
    var x = function (nm) { return (nm - 380) / (750 - 380) * W0; };
    var s = '<svg class="el-spec" viewBox="0 0 ' + W0 + ' ' + H + '" role="img" aria-label="' + esc(o.label || ('Visible emission lines of ' + e.name + ': ' + (L.length ? L.length + ' lines' : 'no lines in the data'))) + '" preserveAspectRatio="none"><rect width="' + W0 + '" height="' + hgt + '" fill="#000"/>';
    L.forEach(function (l, i) {
      var c = C.rgbHex(C.nmToRGB(l.nm)), op = (0.2 + 0.8 * M.pow(l.i, 0.6)).toFixed(2), xx = x(l.nm), lw = (1.2 + 1.8 * M.pow(l.i, 0.5)) * W0 / 640;
      s += '<g class="el-ln" data-i="' + i + '"><rect x="' + (xx - 4).toFixed(1) + '" y="0" width="8" height="' + hgt + '" fill="transparent"/><rect x="' + (xx - lw / 2).toFixed(2) + '" y="0" width="' + lw.toFixed(2) + '" height="' + hgt + '" fill="' + c + '" opacity="' + op + '"><title>' + num(l.nm, 3) + ' nm, relative intensity ' + num(l.rel) + '</title></rect></g>';
    });
    if (ax) {
      for (var nm = 400; nm <= 750; nm += 50) s += '<line x1="' + x(nm) + '" x2="' + x(nm) + '" y1="' + hgt + '" y2="' + (hgt + 4) + '" stroke="currentColor" stroke-width="1"/><text x="' + x(nm) + '" y="' + (H - 1) + '" font-size="10" text-anchor="' + (nm === 750 ? 'end' : 'middle') + '" fill="currentColor">' + nm + '</text>';
    }
    return s + '</svg>';
  }
  function boxes(e) {
    // orbital boxes for the subshells after the noble-gas core (or all of them for H and He)
    var short = e.config.short, core = /^\[(\w+)\]/.exec(short), subs = C.parseConfig(core ? short.replace(core[0], '') : e.config.full);
    return '<div class="el-boxes">' + subs.map(function (s) {
      var f = C.fillOrbitals(s.count, s.l), k = 2 * s.l + 1, h = '';
      for (var i = 0; i < k; i++) {
        // Hund: singles first, all spin up; then pairs
        h += '<span class="el-box">' + (f[i] ? '↑' : '') + (f[i] > 1 ? '↓' : '') + '</span>';
      }
      return '<span class="el-bx"><span class="el-bxs">' + h + '</span><span class="el-bxl">' + s.label + '</span></span>';
    }).join('') + '</div>';
  }
  function row(k, v) { return '<dt>' + k + '</dt><dd>' + v + '</dd>'; }
  function info(e) {
    var w = e.weight || {}, d = e.discovery || {}, h = '';
    h += '<div class="el-card"><h3>Essentials</h3><dl class="el-dl">' +
      row('Atomic number', e.z) + row('Symbol', esc(e.symbol)) + row('Family', esc(cap(e.category)) + (e.categoryNote ? ' <span class="el-muted">(' + esc(e.categoryNote) + ')</span>' : '')) +
      row('Group · period · block', (e.group || '—') + ' · ' + e.period + ' · ' + e.block) +
      row('Atomic weight', esc(w.text) + (w.kind === 'mass number' ? ' <span class="el-muted">(mass number of the longest-lived isotope)</span>' : w.kind === 'interval' ? ' <span class="el-muted">(conventional value; the range in nature is ' + esc(w.interval) + ')</span>' : '') + (w.note ? '<br><span class="el-muted">' + esc(w.note) + '</span>' : '')) +
      row('State at 25 °C', cap(e.state) + (e.stateNote ? ' <span class="el-muted">(' + esc(e.stateNote) + ')</span>' : '')) +
      row('Melting point', temp(e.melt)) + row('Boiling point', temp(e.boil)) + row('Density', dens(e)) +
      row('Electronegativity', e.en != null ? num(e.en, 2) + ' <span class="el-muted">(Pauling)</span>' : '—') +
      row('First ionization energy', e.ie1 != null ? num(e.ie1, 3) + ' eV <span class="el-muted">(' + num(e.ie1 * 96.48533, 1) + ' kJ/mol)</span>' : '—') +
      row('Atomic radius', e.radius != null ? e.radius + ' pm <span class="el-muted">(covalent)</span>' : '—') + '</dl></div>';
    h += '<div class="el-card"><h3>Electrons</h3><dl class="el-dl">' + row('Configuration', '<span class="el-cfg">' + supNum(esc(e.config.full)) + '</span>') + row('Shorthand', '<span class="el-cfg">' + supNum(esc(e.config.short)) + '</span>') +
      row('Electrons per shell', (e.shells || []).join(', ')) + '</dl>' +
      (e.config.exception || e.config.predicted || e.config.note ? '<p class="el-note">' + (e.config.exception ? '<b>An exception.</b> ' : '') + (e.config.predicted ? '<b>Predicted,</b> not measured. ' : '') + esc(e.config.note || (e.config.exception ? 'The simple filling order predicts something slightly different; this is the measured ground state.' : '')) + '</p>' : '') +
      '<p class="el-sub">Outer orbitals, as boxes (each holds two electrons with opposite spins)</p>' + boxes(e) + '</div>';
    var iso = (e.isotopes || []).map(function (i) { return '<tr><td>' + esc(e.symbol) + '-' + i.a + '</td><td>' + (i.abundance != null ? num(i.abundance) + '%' : '—') + '</td><td>' + (i.halfLife ? esc(i.halfLife) : 'stable') + '</td></tr>'; }).join('');
    h += '<div class="el-card"><h3>Nucleus and isotopes</h3><dl class="el-dl">' + row('Drawn as', esc(isoName(e, e.model.a)) + ': ' + e.model.protons + ' protons, ' + e.model.neutrons + ' neutrons') +
      (e.mostStable ? row('Longest-lived isotope', esc(e.symbol) + '-' + e.mostStable.a + ', half-life ' + esc(e.mostStable.halfLife) + (e.mostStable.note ? ' <span class="el-muted">(' + esc(e.mostStable.note) + ')</span>' : '')) : '') + '</dl>' +
      (iso ? '<div class="lab-tw"><table class="lab-table el-iso"><thead><tr><th>Isotope</th><th>Share in nature</th><th>Half-life</th></tr></thead><tbody>' + iso + '</tbody></table></div>' : '<p class="el-muted">No isotope occurs in nature in measurable amounts.</p>') + '</div>';
    h += '<div class="el-card"><h3>Discovery and name</h3><dl class="el-dl">' +
      row('Discovered', d.ancient ? 'Known since ancient times' : (d.year || '—') + (d.by ? ' by ' + esc(d.by) : '') + (d.where ? ', ' + esc(d.where) : '')) + '</dl>' +
      (d.note ? '<p>' + esc(d.note) + '</p>' : '') + '<p><b>Name.</b> ' + esc(e.nameOrigin) + '</p></div>';
    h += '<div class="el-card"><h3>Where it’s found</h3><p>' + esc(e.found) + '</p><dl class="el-dl">' + row('In Earth’s crust', e.crust != null ? sig(e.crust, 3) + ' mg/kg <span class="el-muted">(' + pct(e.crust) + ')</span>' : '—') + '</dl></div>';
    h += '<div class="el-card"><h3>Uses</h3><ul>' + (e.uses || []).map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul><p><b>A fact.</b> ' + esc(e.fact) + '</p>' + (e.safety ? '<p class="el-safe"><b>Safety.</b> ' + esc(e.safety) + '</p>' : '') + '</div>';
    var sp = e.spectrum || {};
    h += '<div class="el-card el-wide"><h3>Spectral fingerprint</h3><p class="lab-small">The bright visible lines of the neutral atom, from the NIST Atomic Spectra Database, drawn at their own colors. Brighter lines are stronger. Hover over or tap a line for its wavelength.</p>' +
      '<div class="el-specw">' + spectrumSVG(e) + '</div><p class="el-specout" id="el-specout" aria-live="polite">' + (sp.status === 'none' ? esc(sp.note || 'No visible lines in the data.') : sp.status === 'few' ? 'Only a few visible lines. ' + esc(sp.note || '') : sp.note ? esc(sp.note) : '') + '</p></div>';
    $('el-info').innerHTML = h;
    $('el-info-h').textContent = 'All about ' + e.name;
    wireSpec($('el-info'), e, $('el-specout'));
  }
  function pct(mgkg) { var p = mgkg / 1e4; return p >= 0.01 ? sig(p, 3) + '% by mass' : sig(mgkg, 2) + ' parts per million by mass'; }
  function wireSpec(host, e, out) {
    var L = (e.spectrum && e.spectrum.lines) || [];
    function show(g) { if (!g) return; var l = L[+g.dataset.i]; if (!l) return; out.innerHTML = '<span class="el-sw" style="background:' + C.rgbHex(C.nmToRGB(l.nm)) + '"></span>' + num(l.nm, 3) + ' nm · relative intensity ' + num(l.rel) + ' · as a sound: ' + num(C.lineHz(l.nm), 1) + ' Hz'; [].forEach.call(host.querySelectorAll('.el-ln.on'), function (x) { x.classList.remove('on'); }); g.classList.add('on'); }
    [].forEach.call(host.querySelectorAll('svg.el-spec'), function (svg) {
      svg.addEventListener('pointerover', function (ev) { show(ev.target.closest('.el-ln')); });
      svg.addEventListener('click', function (ev) { show(ev.target.closest('.el-ln')); });
    });
  }

  /* ------------------------------------------------------------ compare */
  var opts = ALL.map(function (e) { return '<option value="' + e.z + '">' + e.z + ' · ' + esc(e.symbol) + ' · ' + esc(e.name) + '</option>'; }).join('');
  $('el-cmp-a').innerHTML = opts; $('el-cmp-b').innerHTML = opts;
  $('el-cmp-a').addEventListener('change', function () { S.cmpA = +this.value; compare(true); });
  $('el-cmp-b').addEventListener('change', function () { S.cmpB = +this.value; compare(true); });
  $('el-cmp-swap').addEventListener('click', function () { var t = S.cmpA; S.cmpA = S.cmpB; S.cmpB = t; compare(true); });
  $('el-cmp-use').addEventListener('click', function () { S.cmpA = S.z; compare(true); });
  function shellSVG(e, size) {
    var sh = e.shells || [], n = sh.length, R = size / 2, s = '<svg viewBox="0 0 ' + size + ' ' + size + '" class="el-shsvg" role="img" aria-label="Shell diagram: ' + sh.join(', ') + '">';
    var r0 = size * 0.12;
    s += '<circle cx="' + R + '" cy="' + R + '" r="' + r0 + '" fill="#e8504f" stroke="#a33" stroke-width="1"/><text x="' + R + '" y="' + (R + 3.5) + '" font-size="' + (size * 0.055) + '" text-anchor="middle" fill="#fff" font-weight="700">' + e.z + 'p</text>';
    sh.forEach(function (c, k) {
      var r = r0 + (R - 6 - r0) * (k + 1) / n;
      s += '<circle cx="' + R + '" cy="' + R + '" r="' + r.toFixed(1) + '" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1"/>';
      for (var j = 0; j < c; j++) { var a = 2 * M.PI * j / c - M.PI / 2 + k * 0.4; s += '<circle cx="' + (R + r * M.cos(a)).toFixed(1) + '" cy="' + (R + r * M.sin(a)).toFixed(1) + '" r="' + M.max(1.4, M.min(3.2, size * 0.016)).toFixed(1) + '" fill="#2b8ad8"/>'; }
    });
    return s + '</svg>';
  }
  function compare(hash) {
    var a = BYZ[S.cmpA], b = BYZ[S.cmpB]; if (!a || !b) return;
    $('el-cmp-a').value = a.z; $('el-cmp-b').value = b.z;
    var rows = [
      ['Atomic number', function (e) { return e.z; }],
      ['Family', function (e) { return esc(cap(e.category)); }],
      ['Group · period · block', function (e) { return (e.group || '—') + ' · ' + e.period + ' · ' + e.block; }],
      ['Atomic weight', function (e) { return esc(weightText(e)); }],
      ['State at 25 °C', function (e) { return cap(e.state); }],
      ['Melting point', function (e) { return e.melt && e.melt.k != null ? num(e.melt.k, 0) + ' K' : '—'; }],
      ['Boiling point', function (e) { return e.boil && e.boil.k != null ? num(e.boil.k, 0) + ' K' : '—'; }],
      ['Density', function (e) { return e.density && e.density.value != null ? num(e.density.value) + ' ' + (e.density.unit === 'g/L' ? 'g/L' : 'g/cm³') : '—'; }],
      ['Electronegativity', function (e) { return e.en != null ? num(e.en, 2) : '—'; }],
      ['Ionization energy', function (e) { return e.ie1 != null ? num(e.ie1, 2) + ' eV' : '—'; }],
      ['Covalent radius', function (e) { return e.radius != null ? e.radius + ' pm' : '—'; }],
      ['Configuration', function (e) { return '<span class="el-cfg">' + supNum(esc(e.config.short)) + '</span>'; }],
      ['Electrons per shell', function (e) { return (e.shells || []).join(', '); }],
      ['Discovered', function (e) { var d = e.discovery || {}; return d.ancient ? 'ancient times' : (d.year || '—'); }]
    ];
    var h = '<div class="el-cmp-l"><div class="el-cmp-tiles">' + tile(a) + '<span class="el-vs">and</span>' + tile(b) + '</div>';
    h += '<div class="lab-tw"><table class="lab-table el-cmp-t"><thead><tr><th></th><th>' + esc(a.name) + '</th><th>' + esc(b.name) + '</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1](a) + '</td><td>' + r[1](b) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    // sizes to scale (covalent radius)
    var ra = a.radius, rb = b.radius, mx = M.max(ra || 0, rb || 0, 1), px = 70;
    h += '</div><div class="el-cmp-r"><h3 class="lab-h">Size, to scale</h3><div class="el-sizes">' + [a, b].map(function (e) {
      var r = e.radius ? e.radius / mx * px : 0;
      return '<figure><svg viewBox="0 0 ' + (2 * px + 8) + ' ' + (2 * px + 8) + '" role="img" aria-label="' + esc(e.name) + ': covalent radius ' + (e.radius || 'unknown') + ' pm">' + (r ? '<circle cx="' + (px + 4) + '" cy="' + (px + 4) + '" r="' + r.toFixed(1) + '" fill="' + CATC[e.category] + '" stroke="currentColor" stroke-opacity=".4"/><text x="' + (px + 4) + '" y="' + (px + 9) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#14201a">' + esc(e.symbol) + '</text>' : '<text x="' + (px + 4) + '" y="' + (px + 4) + '" text-anchor="middle" font-size="12" fill="currentColor">no data</text>') + '</svg><figcaption>' + esc(e.name) + ': ' + (e.radius ? e.radius + ' pm' : 'not measured') + '</figcaption></figure>';
    }).join('') + '<figure>' + shellSVG(a, 150) + '<figcaption>' + esc(a.name) + ' shells</figcaption></figure><figure>' + shellSVG(b, 150) + '<figcaption>' + esc(b.name) + ' shells</figcaption></figure></div>';
    h += '<p class="lab-small">Circles are drawn from each atom’s covalent radius (half the distance between two bonded atoms), on the same scale.</p>';
    h += '<h3 class="lab-h">Spectra</h3>' + [a, b].map(function (e) { return '<p class="el-specname">' + esc(e.name) + '</p><div class="el-specw">' + spectrumSVG(e, { h: 54 }) + '</div>'; }).join('') + '<p class="el-specout" id="el-cmp-specout" aria-live="polite"></p>';
    h += '<div class="lab-row"><button type="button" class="lab-btn" data-play="' + a.z + '">♪ Play ' + esc(a.name) + '</button><button type="button" class="lab-btn" data-play="' + b.z + '">♪ Play ' + esc(b.name) + '</button></div></div>';
    $('el-cmp').innerHTML = h;
    var specs = $('el-cmp').querySelectorAll('.el-specw');
    wireSpec(specs[0], a, $('el-cmp-specout')); wireSpec(specs[1], b, $('el-cmp-specout'));
    if (hash) { try { W.history.replaceState(null, '', '#compare=' + a.symbol + ',' + b.symbol); } catch (err) { } }
  }
  $('el-cmp').addEventListener('click', function (ev) { var b = ev.target.closest('[data-play]'); if (b) SND.play(BYZ[b.dataset.play], S.mode || 'chord'); });

  /* ------------------------------------------------------------ quiz */
  var QL = { starter: { name: 'Starter', zs: range1(1, 20) }, explorer: { name: 'Explorer', zs: range1(1, 56).concat(range1(72, 86)) }, expert: { name: 'Expert', zs: range1(1, ZMAX), blank: true } };
  function range1(a, b) { var o = []; for (var i = a; i <= b; i++) if (BYZ[i]) o.push(i); return o; }
  var Q = { level: 'starter', n: 0, right: 0, cur: null, done: true, total: 10 };
  var quizT = table($('el-qtable'), { small: true, onPick: quizPick });
  segs($('el-qlevel'), function (l) { Q.level = l; quizStart(); });
  $('el-qstart').addEventListener('click', quizStart);
  $('el-qnext').addEventListener('click', quizNext);
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = M.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var qr = C.rng(Date.now() % 100000);
  function quizStart() {
    Q.n = 0; Q.right = 0; Q.done = false;
    $('el-qtable').classList.toggle('el-blank', !!QL[Q.level].blank);
    [].forEach.call($('el-qtable').querySelectorAll('.el-c b'), function (b) { var z = b.parentNode.dataset.z; b.textContent = QL[Q.level].blank ? '' : BYZ[z].symbol; });
    quizNext();
  }
  function quizNext() {
    if (Q.n >= Q.total) return quizEnd();
    Q.n++;
    var zs = QL[Q.level].zs, e = BYZ[zs[M.floor(qr() * zs.length)]], kinds = ['place', 'clue', 'group', 'block', 'family'];
    if (!e.group) kinds = ['place', 'clue', 'block', 'family'];
    var k = kinds[M.floor(qr() * kinds.length)];
    Q.cur = { e: e, kind: k, answered: false };
    clearQuizMarks();
    var t = '', ch = '';
    if (k === 'place') t = 'Find <b>' + esc(e.name) + '</b> on the table.';
    else if (k === 'clue') t = 'Find me on the table: ' + clues(e);
    else {
      var opts2 = k === 'group' ? shuffle(uniq([e.group].concat(shuffle(range1g(), qr).slice(0, 5))).slice(0, 4), qr) :
        k === 'block' ? ['s', 'p', 'd', 'f'] : shuffle(uniq([e.category].concat(shuffle(CATS.filter(function (c) { return c !== 'unknown'; }), qr))).slice(0, 4), qr);
      if (k === 'group' && opts2.indexOf(e.group) < 0) opts2[0] = e.group;
      t = k === 'group' ? 'Which group is <b>' + esc(e.name) + '</b> (' + esc(e.symbol) + ') in?' : k === 'block' ? 'Which block is <b>' + esc(e.name) + '</b> (' + esc(e.symbol) + ') in?' : 'Which family does <b>' + esc(e.name) + '</b> (' + esc(e.symbol) + ') belong to?';
      ch = opts2.map(function (v) { return '<button type="button" class="lab-btn" data-a="' + esc(v) + '">' + esc(k === 'group' ? 'Group ' + v : k === 'block' ? v + ' block' : cap(v)) + '</button>'; }).join('');
    }
    $('el-qq').innerHTML = '<span class="el-qn">Question ' + Q.n + ' of ' + Q.total + '</span> ' + t;
    $('el-qa').innerHTML = ch; $('el-qa').hidden = !ch;
    $('el-qtable').classList.toggle('el-qoff', !!ch);
    $('el-qfb').textContent = ''; $('el-qnext').hidden = true;
    $('el-qscore').textContent = Q.right + ' right so far';
  }
  function range1g() { var o = []; for (var i = 1; i <= 18; i++) o.push(i); return o; }
  function uniq(a) { var s = {}; return a.filter(function (x) { if (s[x]) return false; s[x] = 1; return true; }); }
  function clues(e) {
    var c = ['I am ' + (/^[aeiou]/.test(e.category) ? 'an ' : 'a ') + e.category + ' in period ' + e.period];
    if (e.group) c.push('group ' + e.group); else c.push('the ' + e.block + ' block');
    var s = c.join(', ') + '.';
    if (e.state !== 'solid' && e.state !== 'unknown') s += ' I am a ' + e.state + ' at room temperature.';
    else if (e.discovery && e.discovery.ancient) s += ' People have known me since ancient times.';
    else if (e.discovery && e.discovery.year) s += ' I was discovered in ' + e.discovery.year + '.';
    return esc(s);
  }
  function clearQuizMarks() { [].forEach.call($('el-qtable').querySelectorAll('.el-c'), function (c) { c.classList.remove('el-ok', 'el-no', 'el-show'); }); }
  function quizPick(e) {
    var cu = Q.cur; if (!cu || cu.answered || Q.done || (cu.kind !== 'place' && cu.kind !== 'clue')) return;
    var ok = e.z === cu.e.z;
    cu.answered = true; if (ok) Q.right++;
    quizT.cells[e.z].classList.add(ok ? 'el-ok' : 'el-no');
    if (!ok) quizT.cells[cu.e.z].classList.add('el-show');
    feedback(ok, ok ? 'Yes! That’s ' + cu.e.name + ' (' + cu.e.symbol + '), element ' + cu.e.z + '.' : 'Not quite: you picked ' + e.name + '. ' + cu.e.name + ' (' + cu.e.symbol + ') is the gold square, element ' + cu.e.z + '.');
  }
  $('el-qa').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-a]'), cu = Q.cur; if (!b || !cu || cu.answered) return;
    var want = String(cu.kind === 'group' ? cu.e.group : cu.kind === 'block' ? cu.e.block : cu.e.category), ok = b.dataset.a === want;
    cu.answered = true; if (ok) Q.right++;
    [].forEach.call(this.querySelectorAll('[data-a]'), function (x) { if (x.dataset.a === want) x.classList.add('el-ok'); else if (x === b) x.classList.add('el-no'); x.disabled = true; });
    quizT.cells[cu.e.z].classList.add('el-show');
    var why = cu.kind === 'block' ? ' Its last electrons go into ' + cu.e.block + ' orbitals: ' + cu.e.config.short + '.' : cu.kind === 'group' ? ' It’s the gold square.' : '';
    feedback(ok, (ok ? 'Right! ' : 'Not quite. ') + cu.e.name + (cu.kind === 'group' ? ' is in group ' + cu.e.group : cu.kind === 'block' ? ' is in the ' + cu.e.block + ' block' : ' is ' + (/^[aeiou]/.test(cu.e.category) ? 'an ' : 'a ') + cu.e.category) + '.' + why);
  });
  function feedback(ok, t) {
    $('el-qfb').textContent = t; $('el-qfb').className = 'el-qfb ' + (ok ? 'ok' : 'no');
    $('el-qscore').textContent = Q.right + ' of ' + Q.n + ' right';
    $('el-qnext').hidden = false; $('el-qnext').textContent = Q.n >= Q.total ? 'See my score' : 'Next question';
    $('el-qnext').focus({ preventScroll: true });
  }
  function quizEnd() {
    Q.done = true;
    var st = load(); st.quiz = st.quiz || {}; var best = st.quiz[Q.level] || 0, nb = Q.right > best;
    if (nb) { st.quiz[Q.level] = Q.right; save(st); }
    $('el-qq').innerHTML = '<b>' + Q.right + ' of ' + Q.total + '</b> on ' + QL[Q.level].name + '. ' + (nb ? 'A new best!' : 'Your best: ' + best + ' of ' + Q.total + '.') + (Q.right >= 8 && Q.level !== 'expert' ? ' Ready for the next level?' : '');
    $('el-qa').hidden = true; $('el-qnext').hidden = true; $('el-qfb').textContent = '';
    clearQuizMarks(); bests();
  }
  function bests() { var st = load().quiz || {}; $('el-qbest').textContent = 'Best scores: ' + Object.keys(QL).map(function (k) { return QL[k].name + ' ' + (st[k] != null ? st[k] + '/10' : '—'); }).join(' · '); }
  bests();

  /* ------------------------------------------------------------ sounds */
  S.mode = 'chord';
  segs($('el-smode'), function (m) { S.mode = m; soundInfo(); });
  $('el-splay').addEventListener('click', function () { SND.play(BYZ[S.z], S.mode); });
  $('el-play-side').addEventListener('click', function () { SND.play(BYZ[S.z], S.mode); });
  $('el-srow').addEventListener('click', function () { sweep(ALL.filter(function (e) { return e.row === BYZ[S.z].row; }).sort(function (a, b) { return a.col - b.col; })); });
  $('el-sgroup').addEventListener('click', function () { var e = BYZ[S.z]; sweep(ALL.filter(function (o) { return e.group ? o.group === e.group : o.col === e.col && o.row >= 9; }).sort(function (a, b) { return a.z - b.z; })); });
  $('el-sstop').addEventListener('click', function () { SND.stop(); markPlaying(null); });
  function sweep(list) { SND.sweep(list, S.mode, markPlaying); }
  function markPlaying(e) {
    [].forEach.call($('el-table').querySelectorAll('.el-play'), function (c) { c.classList.remove('el-play'); });
    if (e) { mainT.cells[e.z].classList.add('el-play'); $('el-snow').textContent = 'Playing ' + e.name; } else $('el-snow').textContent = '';
  }
  function soundInfo() {
    var e = BYZ[S.z]; if (!e) return;
    var p = SND.plan(e, S.mode, false), h = '';
    if (!p.length) h = '<p class="el-muted">' + esc(e.name) + ' has no visible lines in the data, so this mode is silent for it. Try the electron melody.</p>';
    else if (S.mode === 'config') h = '<p class="lab-small">' + p.map(function (n) { return '<span class="el-note-chip">' + supNum(n.label) + ' <i>' + ['do', 're', 'mi', 'fa', 'so', 'la', 'ti'][+n.label.charAt(0) - 1] + '</i></span>'; }).join(' ') + '</p>';
    else h = '<div class="lab-tw el-snd-tw"><table class="lab-table el-snd-t"><thead><tr><th>Line</th><th>Light</th><th>Sound</th><th>Loudness</th></tr></thead><tbody>' + p.slice().sort(function (a, b) { return a.hz - b.hz; }).map(function (n) {
      var nm = parseFloat(n.label), f = 299792458 / (nm * 1e-9 * 1.000277);
      return '<tr><td><span class="el-sw" style="background:' + C.rgbHex(C.nmToRGB(nm)) + '"></span>' + num(nm, 1) + ' nm</td><td>' + num(f / 1e12, 0) + ' THz</td><td>' + num(n.hz, 1) + ' Hz <span class="el-muted">' + noteName(n.hz) + '</span></td><td><span class="el-lbar" style="width:' + M.round(8 + 60 * n.gain / M.max.apply(null, p.map(function (x) { return x.gain; }))) + 'px"></span></td></tr>';
    }).join('') + '</tbody></table></div>';
    $('el-sinfo').innerHTML = h;
  }
  function noteName(hz) { var m = C.hzToMidi(hz), r = M.round(m), cents = M.round((m - r) * 100); return ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][((r % 12) + 12) % 12] + (M.floor(r / 12) - 1) + (cents ? ' ' + (cents > 0 ? '+' : '−') + M.abs(cents) + '¢' : ''); }

  /* ------------------------------------------------------------ printing */
  var paper = 'letter';
  (function () { try { var l = (navigator.language || '').toLowerCase(); if (l && !/^en-(us|ca)|^es-(mx|us)|-(us|ca|mx|ph)$/.test(l)) paper = 'a4'; } catch (e) { } setSeg($('el-paper'), paper); })();
  segs($('el-paper'), function (p) { paper = p; });
  $('el-card-btn').addEventListener('click', function () { doPrint('card'); });
  $('el-wall-btn').addEventListener('click', function () { doPrint('wall'); });
  function doPrint(kind) { preparePrint(kind, paper); W.print(); }
  var pstyle = D.createElement('style'); D.head.appendChild(pstyle);
  function preparePrint(kind, pp) {
    var host = $('el-print');
    if (host.parentNode !== D.body) D.body.appendChild(host);
    var land = kind === 'wall';
    pstyle.textContent = '@page{size:' + (pp === 'a4' ? 'A4' : 'letter') + (land ? ' landscape' : ' portrait') + ';margin:' + (pp === 'a4' ? '10mm' : '0.4in') + '}';
    D.documentElement.classList.add('el-printing');
    D.documentElement.dataset.paper = pp;
    host.className = 'el-print el-print-' + kind + ' el-paper-' + pp;
    host.innerHTML = kind === 'wall' ? wallHTML() : cardHTML(BYZ[S.z]);
    return host;
  }
  W.addEventListener('afterprint', function () { D.documentElement.classList.remove('el-printing'); });
  function cardHTML(e) {
    var w = e.weight || {}, d = e.discovery || {};
    var rowsA = [['Atomic number', e.z], ['Atomic weight', esc(w.text)], ['Family', esc(cap(e.category))], ['Group · period · block', (e.group || '—') + ' · ' + e.period + ' · ' + e.block], ['State at 25 °C', cap(e.state)], ['Melting point', e.melt && e.melt.k != null ? num(e.melt.k, 0) + ' K (' + num(e.melt.k - 273.15, 0) + ' °C)' : esc((e.melt && e.melt.note) || '—')], ['Boiling point', e.boil && e.boil.k != null ? num(e.boil.k, 0) + ' K (' + num(e.boil.k - 273.15, 0) + ' °C)' : esc((e.boil && e.boil.note) || '—')], ['Density', e.density && e.density.value != null ? num(e.density.value) + ' ' + (e.density.unit === 'g/L' ? 'g/L' : 'g/cm³') : '—'], ['Electronegativity', e.en != null ? num(e.en, 2) : '—'], ['1st ionization energy', e.ie1 != null ? num(e.ie1, 2) + ' eV' : '—'], ['Covalent radius', e.radius != null ? e.radius + ' pm' : '—'], ['Discovered', d.ancient ? 'ancient times' : (d.year || '—') + (d.by ? ', ' + esc(d.by) : '')]];
    var iso = (e.isotopes || []).slice(0, 5).map(function (i) { return esc(e.symbol) + '-' + i.a + ' ' + (i.abundance != null ? num(i.abundance) + '%' : '') + (i.halfLife ? ' (half-life ' + esc(i.halfLife) + ')' : ''); }).join(' · ');
    var disc = d.ancient ? 'Known since ancient times.' : 'Discovered ' + (d.year ? 'in ' + d.year : '') + (d.by ? ' by ' + esc(d.by) : '') + (d.where ? ', ' + esc(d.where) : '') + '.';
    return '<article class="el-pcard"><header>' + tile(e, 'el-ptile') + '<div><h1>' + esc(e.name) + '</h1><p class="el-pcat">' + esc(cap(e.category)) + '</p><p class="el-pcfg">' + supNum(esc(e.config.full)) + '</p><p class="el-pcfg2">Shorthand ' + supNum(esc(e.config.short)) + (e.config.exception ? ' (an exception to the filling rule)' : '') + (e.config.predicted ? ' (predicted)' : '') + '<br>Electrons per shell: ' + (e.shells || []).join(', ') + '</p></div>' + shellSVG(e, 170) + '</header>' +
      '<div class="el-pcols"><div><dl>' + rowsA.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>' + (e.categoryNote ? '<p class="el-pnote">' + esc(e.categoryNote) + '</p>' : '') + '<h2>Outer orbitals</h2>' + boxes(e) + '</div><div>' +
      '<h2>Uses</h2><ul>' + (e.uses || []).map(function (u) { return '<li>' + esc(u) + '</li>'; }).join('') + '</ul><h2>Where it’s found</h2><p>' + esc(e.found) + (e.crust != null ? ' Earth’s crust: ' + sig(e.crust, 3) + ' mg/kg.' : '') + '</p><h2>A fact</h2><p>' + esc(e.fact) + '</p><h2>Discovery and name</h2><p>' + disc + ' ' + esc(e.nameOrigin) + '</p>' + (e.safety ? '<p class="el-psafe"><b>Safety:</b> ' + esc(e.safety) + '</p>' : '') + '</div></div>' +
      '<h2>Nucleus</h2><p>Atomic number ' + e.z + ': ' + e.z + ' protons. ' + (iso ? 'Isotopes in nature: ' + iso + '.' : 'No isotope lasts in nature.') + (e.mostStable ? ' Longest-lived: ' + esc(e.symbol) + '-' + e.mostStable.a + ', half-life ' + esc(e.mostStable.halfLife) + '.' : '') + '</p>' +
      '<h2>Spectral fingerprint <span>(visible lines of the neutral atom, 380–750 nm, from NIST)</span></h2>' + (e.spectrum && e.spectrum.status === 'none' ? '<p class="el-pnote">' + esc(e.spectrum.note || 'No visible lines in the data.') + '</p>' : spectrumSVG(e, { w: 700, h: 80 })) +
      '<footer>The Elements · Science Lab · Teddy Rook Book · teddyrookbook.com/science-lab/elements/#' + esc(e.symbol) + '</footer></article>';
  }
  function wallHTML() {
    var h = '<article class="el-pwall"><h1>The Periodic Table of the Elements</h1><div class="el-pgrid">';
    ALL.forEach(function (e) { h += '<div class="el-pc" style="grid-row:' + e.row + ';grid-column:' + e.col + ';background:' + CATC[e.category] + '"><span>' + e.z + '</span><b>' + esc(e.symbol) + '</b><i>' + esc(e.name) + '</i><em>' + esc(weightShort(e)) + '</em></div>'; });
    h += '<div class="el-plab" style="grid-row:9;grid-column:1/4">Lanthanides</div><div class="el-plab" style="grid-row:10;grid-column:1/4">Actinides</div>';
    h += '<div class="el-pkey" style="grid-row:1/4;grid-column:4/12"><div class="el-pc el-pkc"><span>26</span><b>Fe</b><i>Iron</i><em>55.845</em></div><p>atomic number<br>symbol<br>name<br>atomic weight</p><ul>' + CATS.map(function (c) { return '<li><i style="background:' + CATC[c] + '"></i>' + esc(cap(c)) + '</li>'; }).join('') + '</ul></div>';
    return h + '</div><footer>Atomic weights: IUPAC 2021 (values in brackets: mass number of the longest-lived isotope). Teddy Rook Book · teddyrookbook.com/science-lab/elements/</footer></article>';
  }

  /* ------------------------------------------------------------ deep links */
  function route() {
    var h = decodeURIComponent((W.location.hash || '').slice(1)), m;
    if ((m = /^compare=([A-Za-z]{1,3}|\d+),([A-Za-z]{1,3}|\d+)$/.exec(h))) {
      var a = BYSYM[m[1].toLowerCase()] || BYZ[+m[1]], b = BYSYM[m[2].toLowerCase()] || BYZ[+m[2]];
      if (a && b) { S.cmpA = a.z; S.cmpB = b.z; compare(false); var sec = $('el-compare'); setTimeout(function () { sec.scrollIntoView({ block: 'start' }); }, 30); return true; }
    }
    var e = BYSYM[h.toLowerCase()] || (/^\d+$/.test(h) ? BYZ[+h] : null);
    if (e) { select(e.z, { noHash: true }); return true; }
    return false;
  }
  W.addEventListener('hashchange', route);

  /* ------------------------------------------------------------ start */
  tempOut(); paintTable(); compare(false); syncMode(); soundInfo();
  if (!route()) select(BYZ[26] ? 26 : ALL[0].z, { noHash: true });
  W.TRBElements = { select: select, view: V, preparePrint: preparePrint, state: S, quiz: Q, data: ALL, stateAt: stateAt, neighbor: neighbor };
})(window, document);
