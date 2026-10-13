/* Food Garden Planner: suggests crops for a space and climate (or plans just the crops you pick), estimates harvest and
   calories, lays out a rotation, sizes a flock or apiary, and shows how they fit together. Figures come from data/garden/
   (extension yield tables, USDA FoodData Central); the garden-and-animals notes cite their sources inline. */
(function (W, D) {
  'use strict';
  var DATA = JSON.parse(D.getElementById('gd-data').textContent), C = DATA.crops, BY = {};
  C.forEach(function (c) { BY[c.k] = c; });
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n0(x) { return Math.round(x).toLocaleString('en-US'); }
  function lbs(x) { return x >= 10 ? n0(x) : (Math.round(x * 10) / 10).toString(); }
  function list(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function lc(n) { return n.replace(/ \(.*\)$/, '').toLowerCase(); }
  var KEY = 'trb-garden-v1';
  var st = { where: 'garden', sqft: 20, w: 5, l: 10, acres: 1, zone: 6, people: 2, goal: 'balanced', peren: true, trees: false, lights: false, mode: 'suggest',
    must: ['potatoes', 'sweet_potatoes', 'carrots', 'strawberries'], hens: false, epw: 12, nhens: '', broil: false, nbroil: 25, bees: false, nhives: 2, allg: false, planby: 'area', conts: [{ p: 'bucket5', q: 2 }, { p: 'box24', q: 2 }, { p: 'pot2', q: 2 }] };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }
  var yard = function () { return st.where === 'garden' || st.where === 'farm'; };

  // ---------- form ----------
  function radios(name, key) { D.querySelectorAll('input[name=' + name + ']').forEach(function (r) { r.checked = r.value === st[key]; r.addEventListener('change', function () { st[key] = r.value; sync(); }); }); }
  radios('where', 'where'); radios('mode', 'mode'); radios('planby', 'planby');
  // ---------- units (US, metric or both; inputs switch to metric only in metric mode) ----------
  function UN() { return W.TRBUnits ? W.TRBUnits.mode() : 'both'; }
  function MET() { return UN() === 'metric'; }
  var CF = { sqft: 0.092903, w: 0.3048, l: 0.3048, acres: 0.404686 }, ULAB = { sqft: ['sq ft', 'm²'], ft: ['ft', 'm'], acre: ['acres', 'ha'] };
  function r2(v) { return Math.round(v * 100) / 100; }
  function showInputs() {
    Object.keys(CF).forEach(function (k) { var el = $({ sqft: 'gd-sqft', w: 'gd-w', l: 'gd-l', acres: 'gd-acres' }[k]); if (D.activeElement !== el) el.value = st[k] === '' ? '' : r2(MET() ? st[k] * CF[k] : st[k]); el.step = MET() ? (k === 'acres' ? 0.1 : k === 'sqft' ? 0.1 : 0.1) : (k === 'acres' ? 0.25 : k === 'sqft' ? 1 : 0.5); });
    D.querySelectorAll('.gd-u').forEach(function (u) { u.textContent = ULAB[u.dataset.u][MET() ? 1 : 0]; });
    D.querySelectorAll('#gd-zone option').forEach(function (o) { var m = UN(); o.textContent = o.dataset.lab + ' ' + (m === 'metric' ? o.dataset.c : m === 'us' ? o.dataset.f : o.dataset.f + ' (' + o.dataset.c + ')'); });
  }
  D.addEventListener('trb-units', function () { showInputs(); conts(); sync(); });
  var NUM = { 'gd-sqft': 'sqft', 'gd-w': 'w', 'gd-l': 'l', 'gd-acres': 'acres', 'gd-zone': 'zone', 'gd-people': 'people', 'an-epw': 'epw', 'an-hens': 'nhens', 'an-broil': 'nbroil', 'an-hives': 'nhives' };
  Object.keys(NUM).forEach(function (id) {
    var el = $(id), key = NUM[id]; el.value = st[key];
    function upd() { st[key] = el.value === '' ? '' : (CF[key] && MET() ? +el.value / CF[key] : +el.value); if (id === 'an-epw') { st.nhens = ''; $('an-hens').value = ''; } if (id === 'an-hens' && el.value !== '') { st.epw = ''; $('an-epw').value = ''; } sync(); }
    el.addEventListener('input', upd); if (el.tagName === 'SELECT') el.addEventListener('change', upd);
  });
  $('gd-goal').value = st.goal; $('gd-goal').addEventListener('change', function () { st.goal = this.value; sync(); });
  [['gd-peren', 'peren'], ['gd-trees', 'trees'], ['gd-lights', 'lights'], ['an-on-hens', 'hens'], ['an-on-broil', 'broil'], ['an-on-bees', 'bees'], ['gd-allg', 'allg']].forEach(function (p) {
    var el = $(p[0]); el.checked = !!st[p[1]]; el.addEventListener('change', function () { st[p[1]] = el.checked; sync(); });
  });

  // ---------- containers (balcony and indoors) ----------
  // Typical sizes; nursery "gallon" pots are trade sizes and often hold a little less. Dimensions in inches.
  var PRE = [
    { id: 'pot1', n: '1-gallon pot', gal: 1, sh: 'round', d: 6.5, h: 7 }, { id: 'pot2', n: '2-gallon pot', gal: 2, sh: 'round', d: 8.5, h: 8.5 },
    { id: 'pot3', n: '3-gallon pot', gal: 3, sh: 'round', d: 10, h: 9.5 }, { id: 'bucket5', n: '5-gallon bucket', gal: 5, sh: 'round', d: 12, h: 14 },
    { id: 'bag7', n: '7-gallon grow bag', gal: 7, sh: 'round', d: 14, h: 11 }, { id: 'bag10', n: '10-gallon grow bag', gal: 10, sh: 'round', d: 16, h: 12 },
    { id: 'bag15', n: '15-gallon grow bag', gal: 15, sh: 'round', d: 18, h: 14 }, { id: 'bag20', n: '20-gallon grow bag', gal: 20, sh: 'round', d: 21, h: 14 },
    { id: 'bag25', n: '25-gallon grow bag', gal: 25, sh: 'round', d: 24, h: 13 },
    { id: 'box24', n: '24-inch window box', gal: 6.5, sh: 'rect', l: 24, w: 8, h: 8 }, { id: 'box36', n: '36-inch window box', gal: 10, sh: 'rect', l: 36, w: 8, h: 8 },
    { id: 'plant24', n: '24 x 12-inch rectangular planter', gal: 15, sh: 'rect', l: 24, w: 12, h: 12 },
    { id: 'tote18', n: '18-gallon storage tote', gal: 18, sh: 'rect', l: 23, w: 15, h: 12 },
    { id: 'barrel', n: 'Half barrel', gal: 39, sh: 'round', d: 26, h: 17 },
    { id: 'custom', n: 'Your own size…' }
  ], PBY = {}; PRE.forEach(function (x) { PBY[x.id] = x; });
  function cdims(c) { // resolves a container row to {n, gal, a (sq ft of soil), h (in)}
    var x = c.p === 'custom' ? c : PBY[c.p]; if (!x) return null;
    var top = x.sh === 'rect' ? (x.l || 0) * (x.w || 0) : Math.PI * Math.pow((x.d || 0) / 2, 2);
    var gal = c.p === 'custom' ? top * (x.h || 0) / 231 : x.gal;
    var nm = c.p === 'custom' ? (x.sh === 'rect' ? fx(x.l) + ' x ' + fx(x.w) + ' x ' + fx(x.h) + ' in container' : fx(x.d) + ' in round container, ' + fx(x.h) + ' in deep') : x.n;
    return { n: nm, gal: gal, a: top / 144, h: x.h || 0 };
  }
  function fx(v) { return Math.round((+v || 0) * 10) / 10; }
  function ins(v) { return MET() ? fx(v * 2.54) : fx(v); } // show inches (or cm) in inputs
  function conts() {
    var unit = MET() ? 'cm' : 'in', h = '';
    st.conts.forEach(function (c, i) {
      var x = PBY[c.p] || {}, desc = c.p === 'custom' ? '' : (x.sh === 'round' ? 'about ' + x.d + ' in across, ' + x.h + ' in deep' : 'about ' + x.l + ' x ' + x.w + ' in, ' + x.h + ' in deep');
      h += '<div class="gd-crow" data-i="' + i + '"><label class="gd-cq"><input type="number" min="0" max="500" value="' + (c.q || 0) + '" data-f="q" aria-label="How many"> ×</label>' +
        '<select data-f="p" aria-label="Container">' + PRE.map(function (o) { return '<option value="' + o.id + '"' + (o.id === c.p ? ' selected' : '') + '>' + esc(o.id === 'custom' ? o.n : (W.TRBUnits ? W.TRBUnits.convert(o.n, UN()) : o.n)) + '</option>'; }).join('') + '</select>' +
        (c.p === 'custom' ? '<span class="gd-cust"><select data-f="sh" aria-label="Shape"><option value="round"' + (c.sh !== 'rect' ? ' selected' : '') + '>Round</option><option value="rect"' + (c.sh === 'rect' ? ' selected' : '') + '>Square or rectangle</option></select>' +
          (c.sh === 'rect' ? '<label><input type="number" min="1" step="0.5" data-f="l" value="' + ins(c.l || 24) + '"> × </label><label><input type="number" min="1" step="0.5" data-f="w" value="' + ins(c.w || 12) + '"> ' + unit + '</label>' : '<label><input type="number" min="1" step="0.5" data-f="d" value="' + ins(c.d || 12) + '"> ' + unit + ' across</label>') +
          '<label><input type="number" min="1" step="0.5" data-f="h" value="' + ins(c.h || 10) + '"> ' + unit + ' deep</label></span>' : '<small class="gd-cdesc">' + desc + '</small>') +
        '<button type="button" class="gd-crm" data-f="rm" aria-label="Remove">✕</button></div>';
    });
    $('gd-clist').innerHTML = h;
    csum();
  }
  function csum() {
    var n = 0, a = 0, g = 0; st.conts.forEach(function (c) { var d = cdims(c); if (!d) return; n += +c.q || 0; a += (+c.q || 0) * d.a; g += (+c.q || 0) * d.gal; });
    $('gd-csum').textContent = n ? n + ' container' + (n > 1 ? 's' : '') + ' · about ' + (a < 10 ? fx(a) : Math.round(a)) + ' sq ft of soil surface · about ' + Math.round(g) + ' gallons of potting mix' : 'No containers yet.';
  }
  $('gd-clist').addEventListener('input', function (e) {
    var el = e.target, row = el.closest('.gd-crow'); if (!row) return;
    var c = st.conts[+row.dataset.i], f = el.dataset.f;
    if (f === 'q') c.q = +el.value || 0;
    else if (f === 'p' || f === 'sh') { c[f] = el.value; if (f === 'p' && el.value === 'custom' && !c.sh) { c.sh = 'round'; c.d = 12; c.h = 10; } conts(); }
    else if (f) c[f] = MET() ? (+el.value || 0) / 2.54 : +el.value || 0;
    csum(); save(); render();
  });
  $('gd-clist').addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') e.target.dispatchEvent(new Event('input', { bubbles: true })); });
  $('gd-clist').addEventListener('click', function (e) { var b = e.target.closest('[data-f=rm]'); if (!b) return; st.conts.splice(+b.closest('.gd-crow').dataset.i, 1); conts(); save(); render(); });
  $('gd-cadd').addEventListener('click', function () { st.conts.push({ p: 'bucket5', q: 1 }); conts(); save(); render(); });
  var byCont = function () { return (st.where === 'indoor' || st.where === 'balcony') && st.planby === 'cont'; };
  function units() { // every container as its own unit, biggest first
    var u = []; st.conts.forEach(function (c) { var d = cdims(c); if (!d || !(d.a > 0)) return; for (var i = 0; i < Math.min(+c.q || 0, 500); i++) u.push({ n: d.n, gal: d.gal, a: d.a, h: d.h }); });
    return u.sort(function (a, b) { return b.gal - a.gal; });
  }
  // match containers to the planned crops: crops needing the biggest containers choose first, taking the smallest that fit
  function assign(picks) {
    var free = units(), out = { none: [], spare: [] };
    picks.slice().sort(function (a, b) { return (b.c.cg || 0) - (a.c.cg || 0); }).forEach(function (p) {
      var need = p.a, got = [], gmin = p.c.cg || 0, dmin = p.c.cdep || 0;
      var fit = free.filter(function (x) { return x.gal >= gmin - 0.01 && (!dmin || !x.h || x.h >= dmin); }).sort(function (a, b) { return a.gal - b.gal; });
      var have = 0;
      while (fit.length && (have < need * 0.85 || !got.length)) { var x = fit.shift(); got.push(x); have += x.a; free.splice(free.indexOf(x), 1); }
      p.cont = got; p.a = have;
      if (!got.length) { p.drop = true; var big = Math.max.apply(null, units().map(function (x) { return x.gal; }).concat([0])); out.none.push({ c: p.c, why: big < gmin ? 'needs at least a ' + gmin + '-gallon container' + (dmin ? ' ' + dmin + ' in deep' : '') : 'no containers left' }); }
    });
    out.spare = free;
    return out;
  }
  function calc(p) {
    var c = p.c;
    p.lb = c.y != null ? c.y * p.a / 100 : null;
    p.lbr = c.yr && c.y != null ? [c.yr[0] * p.a / 100, c.yr[1] * p.a / 100] : null;
    p.kcal = c.kc != null ? c.kc * p.a / 100 : null;
    p.plants = p.cont && p.cont.length && c.cper ? p.cont.length * c.cper : c.sq ? Math.max(1, Math.round(p.a / c.sq)) : null;
  }
  function tally(list) { var m = {}, o = []; list.forEach(function (x) { if (!m[x.n]) { m[x.n] = 0; o.push(x.n); } m[x.n]++; }); return o.map(function (n) { return n + (m[n] > 1 ? ' × ' + m[n] : ''); }); }

  // ---------- how well each crop suits the space ----------
  // ok: recommended here; iffy: possible, with a note; no: not for this space (hidden unless already picked)
  function status(c) {
    var w = st.where, z = +st.zone;
    if (w === 'indoor') {
      if (c.ind === 'good') return { s: 'ok' };
      if (c.ind === 'possible with grow lights') return st.lights ? { s: 'ok', why: 'needs grow lights' } : { s: 'iffy', why: 'only with grow lights' };
      return { s: 'no', why: 'not suited to growing indoors' };
    }
    if (c.zmin && z < c.zmin) return { s: 'no', why: 'too cold below zone ' + c.zmin };
    if (c.zmax && z > c.zmax) return { s: 'no', why: 'needs zone ' + c.zmax + ' or colder' };
    if (c.lw && z < c.lw - 1) return { s: 'no', why: 'season too short in zone ' + z };
    if (w === 'balcony') {
      if (c.k === 'microgreens') return { s: 'iffy', why: 'easier indoors' };
      if (c.con === false || (c.t === 'tree' && c.con !== true)) return { s: 'no', why: 'too big for containers' };
      if (c.con !== true) return { s: 'iffy', why: 'no container guidance found; try a large container' };
    } else if (c.k === 'microgreens') return { s: 'no', why: 'an indoor crop' };
    if (c.lw && z < c.lw) return { s: 'iffy', why: 'short season here: choose early varieties' };
    return { s: 'ok' };
  }
  function notes(c) {
    var z = +st.zone, out = [];
    if (st.where === 'indoor') return out;
    if (c.se === 'cool' && z >= 9) out.push('grow in fall and winter where summers are hot');
    if (c.t === 'tree' && /^(apple|pear|plum_cherry|peach)$/.test(c.k) && z >= 9) out.push('choose low-chill varieties for warm winters');
    if (c.k === 'blueberries') out.push(z >= 8 ? 'needs acid soil; choose southern highbush or rabbiteye types' : 'needs acid soil');
    return out;
  }

  // ---------- chips ----------
  var POPULAR = ['potatoes', 'sweet_potatoes', 'carrots', 'tomatoes', 'cherry_tomatoes', 'peppers', 'garlic', 'onions', 'dry_beans', 'snap_beans', 'peas', 'winter_squash', 'kale', 'lettuce', 'spinach', 'broccoli', 'cucumbers', 'sweet_corn', 'strawberries', 'blueberries', 'raspberries_blackberries', 'culinary_herbs', 'apple'];
  var ORDER = POPULAR.concat(C.map(function (c) { return c.k; }).filter(function (k) { return POPULAR.indexOf(k) < 0; }));
  var showAll = false;
  function chips() {
    var hidden = 0, iffy = 0, h = '';
    ORDER.forEach(function (k, i) {
      var c = BY[k], s = status(c), on = st.must.indexOf(k) >= 0;
      if (s.s === 'no' && !on) { hidden++; return; }
      if (s.s === 'iffy') iffy++;
      h += '<button type="button" class="gd-chip' + (i >= POPULAR.length && !on ? ' more' : '') + (s.s !== 'ok' ? ' ' + s.s : '') + '" data-k="' + k + '" aria-pressed="' + on + '"' +
        (s.why ? ' title="' + esc(s.why) + '"' : '') + '>' + esc(c.n) + (s.s === 'iffy' ? ' <i>⚠</i>' : s.s === 'no' ? ' <i>✕</i>' : '') + (s.s !== 'ok' ? '<small>' + esc(short(s.why)) + '</small>' : '') + '</button>';
    });
    $('gd-must').innerHTML = h + '<button type="button" class="gd-chip gd-showmore" id="gd-more">' + (showAll ? '− fewer' : '+ more crops') + '</button>';
    $('gd-must').classList.toggle('all', showAll);
    var where = { indoor: 'indoors', balcony: 'in containers', garden: 'in your zone', farm: 'in your zone' }[st.where];
    $('gd-chipnote').innerHTML = (st.mode === 'only' ? 'Tap each crop you want; the plan uses only these. ' : 'Tapped crops are always included; the rest are suggested. ') +
      (iffy ? '⚠ means possible but not ideal ' + where + '. ' : '') + (hidden ? hidden + ' crop' + (hidden > 1 ? 's that don’t' : ' that doesn’t') + ' suit growing ' + where + (hidden > 1 ? ' are' : ' is') + ' hidden.' : '');
  }
  function short(w) { return /grow lights/.test(w) ? 'needs grow lights' : /container guidance/.test(w) ? 'no pot size in sources' : /short season/.test(w) ? 'short season' : /too big/.test(w) ? 'too big for pots' : /indoors/.test(w) && /not suited/.test(w) ? 'not for indoors' : w; }
  $('gd-must').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'gd-more') { showAll = !showAll; chips(); return; }
    var k = b.dataset.k, i = st.must.indexOf(k); if (i >= 0) st.must.splice(i, 1); else st.must.push(k);
    sync();
  });

  // ---------- planning ----------
  var GOALS = { // area shares for staples (filling, calorie-dense), vegetables (vitamins, minerals), fruit
    balanced: { s: 0.45, v: 0.40, f: 0.15, wk: 0.5, wn: 0.5 },
    calories: { s: 0.70, v: 0.20, f: 0.10, wk: 0.85, wn: 0.15 },
    nutrition: { s: 0.30, v: 0.55, f: 0.15, wk: 0.25, wn: 0.75 },
    money: { s: 0.15, v: 0.60, f: 0.25, wk: 0.2, wn: 0.4, wv: 0.9 },
    easy: { s: 0.40, v: 0.45, f: 0.15, wk: 0.4, wn: 0.4, we: 0.6 }
  };
  var AUTO_SKIP = ['jerusalem_artichokes']; // spreads and is hard to remove: only when picked
  var CATK = { s: 'staple', v: 'veg', f: 'fruit' };
  function area() {
    if (st.where === 'farm') return Math.max(0.25, st.acres || 1) * 43560;
    if (st.where === 'garden') return Math.max(1, (st.w || 1) * (st.l || 1));
    if (byCont()) return Math.max(0.1, units().reduce(function (s, x) { return s + x.a; }, 0));
    return Math.max(0.1, st.sqft || 1);
  }
  function ycal(c) { return c.kc != null ? c.kc / 100 : 0; } // kcal per sq ft
  function nut(c) { return (c.nut.length + (c.fib >= 3 ? 0.5 : 0) + (c.pro >= 5 ? 0.5 : 0)) * (c.y || 0) / 100; }
  function score(pool, G) {
    var mk = 0, mn = 0; pool.forEach(function (c) { mk = Math.max(mk, ycal(c)); mn = Math.max(mn, nut(c)); });
    pool.forEach(function (c) {
      var s = (G.wk * (mk ? ycal(c) / mk : 0)) + (G.wn * (mn ? nut(c) / mn : 0));
      if (G.wv && c.val) s += G.wv * 0.5; if (G.we && c.dif === 'easy') s += G.we * 0.5;
      if (c.dif === 'easy') s += 0.05; if (c.y == null) s *= st.where === 'indoor' ? 0.7 : 0.15;
      c._s = s;
    });
  }
  function floorA() { return { indoor: 1, balcony: 1, garden: 4, farm: 40 }[st.where]; }
  function minA(c) { return c.t === 'tree' ? (c.sq || 100) : Math.max(c.sq || 1, floorA()); }
  function capA(c, people) { return c.cat === 'staple' || c.t === 'tree' ? Infinity : people * (c.cat === 'fruit' ? 80 : 60); }

  function finish(picks) {
    var people = +st.people || 1;
    // don't plant more of a vegetable or berry than the household can use; staples take the rest up to a year's calories
    var freed = 0, spare = 0;
    picks.forEach(function (p) { if (p.trees) return; var cap = capA(p.c, people); if (p.a > cap) { freed += p.a - cap; p.a = cap; } });
    if (freed) {
      var stp = picks.filter(function (p) { return p.c.cat === 'staple' && p.c.kc; });
      var need = people * 2000 * 365, have = stp.reduce(function (s, p) { return s + p.c.kc * p.a / 100; }, 0);
      stp.forEach(function (p) { var room = Math.max(0, (need - have) / stp.length) / (p.c.kc / 100), add = Math.min(room, freed / stp.length); p.a += add; freed -= add; });
      spare = freed;
    }
    picks.forEach(function (p) { calc(p); p.st = status(p.c); p.notes = notes(p.c); });
    return spare > 1 ? spare : 0;
  }

  function planSuggest(A, planted) {
    var w = st.where, G = GOALS[st.goal] || GOALS.balanced;
    var pool = C.filter(function (c) {
      if (status(c).s !== 'ok') return false;
      if (c.t === 'tree' && !st.trees) return false;
      if ((c.t === 'perennial' || c.t === 'bush' || c.t === 'vine') && !st.peren) return false;
      return true;
    });
    var picked = st.must.map(function (k) { return BY[k]; }).filter(function (c) { return c && status(c).s !== 'no'; });
    var all = pool.concat(picked.filter(function (c) { return pool.indexOf(c) < 0; }));
    score(all, G);
    var count = w === 'indoor' ? (A < 6 ? 2 : A < 15 ? 3 : 4) : w === 'balcony' ? (A < 20 ? 3 : A < 60 ? 4 : 6) : w === 'farm' ? 10 : (A < 60 ? 4 : A < 150 ? 6 : A < 400 ? 8 : A < 1500 ? 11 : 14);
    var shares = w === 'indoor' ? { s: 0, v: 1, f: 0 } : { s: G.s, v: G.v, f: G.f };
    var cats = {}; ['s', 'v', 'f'].forEach(function (k) { cats[k] = all.filter(function (c) { return w === 'indoor' ? k === 'v' : c.cat === CATK[k]; }); });
    var tot = 0; ['s', 'v', 'f'].forEach(function (k) { if (!cats[k].length) shares[k] = 0; tot += shares[k]; });
    ['s', 'v', 'f'].forEach(function (k) { shares[k] = tot ? shares[k] / tot : 0; });
    var picks = [];
    ['s', 'v', 'f'].forEach(function (k) {
      if (!shares[k]) return;
      var chosen = picked.filter(function (c) { return cats[k].indexOf(c) >= 0; });
      var want = Math.max(1, Math.round(count * shares[k]));
      var rest = cats[k].filter(function (c) { return chosen.indexOf(c) < 0 && AUTO_SKIP.indexOf(c.k) < 0 && pool.indexOf(c) >= 0; });
      while (chosen.length < want && rest.length) {
        rest.sort(function (a, b) { function pen(c) { var same = chosen.filter(function (x) { return x.g === c.g && c.g !== 'perennial'; }).length; return c._s * Math.pow(0.55, same); } return pen(b) - pen(a); });
        chosen.push(rest.shift());
      }
      var catArea = planted * shares[k];
      var withY = chosen.filter(function (c) { return c.y != null || c.t === 'tree'; }), noY = chosen.filter(function (c) { return c.y == null && c.t !== 'tree'; });
      var small = Math.min(catArea * 0.15, w === 'farm' ? 400 : Math.max(2, catArea * 0.1));
      noY.forEach(function (c) { picks.push({ c: c, a: small }); catArea -= small; });
      var eachA = withY.length ? catArea / withY.length : 0;
      withY.forEach(function (c) {
        if (c.t === 'tree') { var per = c.sq || 100, nt = Math.floor(eachA / per); if (nt < 1) { if (planted >= per * 2) nt = 1; else return; } picks.push({ c: c, a: nt * per, trees: nt }); return; }
        picks.push({ c: c, a: eachA });
      });
    });
    var used = picks.reduce(function (s, p) { return s + p.a; }, 0);
    if (used > planted && used > 0) { var f = planted / used; picks.forEach(function (p) { if (!p.trees) p.a *= f; }); }
    return { picks: picks, spare: finish(picks) };
  }

  function planOnly(A, planted) {
    var G = GOALS[st.goal] || GOALS.balanced;
    var cand = st.must.map(function (k) { return BY[k]; }).filter(function (c) { return c && status(c).s !== 'no'; });
    score(cand, G);
    // fit as many as the space allows, most useful first (by your goal); the rest are listed as not fitting
    cand.sort(function (a, b) { return b._s - a._s; });
    var left = planted, picks = [], noRoom = [];
    if (byCont()) {
      var tw0 = cand.reduce(function (s, c) { return s + (c._s || 0) + 0.1; }, 0);
      cand.forEach(function (c) { picks.push({ c: c, a: planted * ((c._s || 0) + 0.1) / tw0 }); });
      return { picks: picks, spare: finish(picks), need: 0, noRoom: [], ideas: [], cand: cand, cont: true };
    }
    cand.forEach(function (c) { var m = minA(c); if (m <= left) { picks.push({ c: c, a: m, trees: c.t === 'tree' ? 1 : 0 }); left -= m; } else noRoom.push(c); });
    var need = cand.reduce(function (s, c) { return s + minA(c); }, 0);
    // share out the room that's left, by goal score, up to what the household can use
    var people = +st.people || 1, grow = picks.filter(function (p) { return !p.trees; });
    for (var it = 0; it < 8 && left > 0.5; it++) {
      var open = grow.filter(function (p) { return p.a < capA(p.c, people) - 0.01; });
      if (!open.length) break;
      var tw = open.reduce(function (s, p) { return s + (p.c._s || 0) + 0.1; }, 0), give = left;
      open.forEach(function (p) { var add = Math.min(give * ((p.c._s || 0) + 0.1) / tw, capA(p.c, people) - p.a); p.a += add; left -= add; });
    }
    if (!grow.length) picks.forEach(function (p) { var per = p.c.sq || 100; while (left >= per && p.trees < 50) { p.trees++; p.a += per; left -= per; } });
    var spare = finish(picks) + Math.max(0, left);
    // ideas to fill leftover room: good crops for this space, favoring families not already in the plan
    var have = {}; picks.forEach(function (p) { have[p.c.g] = 1; });
    var pool = C.filter(function (c) { return status(c).s === 'ok' && st.must.indexOf(c.k) < 0 && c.t !== 'tree' && AUTO_SKIP.indexOf(c.k) < 0 && c.y != null; });
    score(pool, G);
    var ideas = pool.sort(function (a, b) { return (b._s * (have[b.g] ? 0.5 : 1)) - (a._s * (have[a.g] ? 0.5 : 1)); }).slice(0, 3);
    return { picks: picks, spare: spare, need: need, noRoom: noRoom, ideas: ideas, cand: cand };
  }

  // ---------- output ----------
  function space(a) {
    if (st.where === 'farm' && a >= 4356) { var ac = a / 43560; return (Math.round(ac * 100) / 100) + ' acre' + (ac >= 1.005 ? 's' : ''); }
    return (a < 10 ? Math.round(a * 10) / 10 : n0(a)) + ' sq ft';
  }
  function when(c) {
    if (c.t === 'tree') return 'early spring, as dormant trees';
    var s = c.ps || c.pf || '';
    s = s.replace(/(\d)-(\d)/g, '$1–$2').replace(/\s*\([^)]*\)/g, '').replace(/;.*$/, '').replace(/\. .*$/, '').replace(/\.$/, '').replace(/average last spring frost/, 'last frost');
    return s || '—';
  }
  var ROT = [['legume'], ['root', 'allium'], ['nightshade', 'cucurbit', 'grass'], ['brassica', 'leafy-other']];
  var ROTN = ['Beans and peas', 'Roots and onions', 'Fruiting crops and corn', 'Cabbage family and leafy greens'];
  function rotation(picks) {
    var annual = picks.filter(function (p) { return p.c.t === 'annual'; }), w = st.where;
    if (!annual.length) return '';
    var gi = []; ROT.forEach(function (gs, i) { var ps = annual.filter(function (p) { return gs.indexOf(p.c.g) >= 0; }); if (ps.length) gi.push({ i: i, ps: ps, a: ps.reduce(function (s, p) { return s + p.a; }, 0) }); });
    var pots = w === 'indoor' || w === 'balcony', part = pots ? 'Pots ' : 'Area ';
    var h = '<h3>Rotating ' + (st.mode === 'only' ? 'these crops' : 'your crops') + '</h3>';
    if (gi.length < 2) {
      return h + '<p>' + (gi.length ? 'Everything here is in one rotation group (' + ROTN[gi[0].i].toLowerCase() + '), so there’s nothing to rotate between. ' : '') +
        'Plants in the same family share pests and diseases, so don’t grow a family in the same soil year after year: wait 3 to 4 years before it comes back to a spot. ' +
        (pots ? 'In containers, swap which pots hold which crops, or start a pot with fresh potting mix.' : 'Move it to fresh ground each year, or add crops from another group to rotate with.') + '</p>';
    }
    var n = gi.length;
    h += '<p>Plants in the same family share pests and diseases, so move each group to a new ' + (pots ? 'set of pots' : 'area') + ' every year and wait 3 to 4 years before it comes back. ' +
      'Split ' + (pots ? 'your containers' : 'your space') + ' into ' + n + ' parts and shift each group one part along each year' + (gi[0].i === 0 ? '; beans and peas lead because they add nitrogen' : '') + '.' +
      (n < 4 ? ' With only ' + n + ' groups a family comes back every ' + n + ' years; adding a group' + (n < 3 ? ' or two' : '') + ' would stretch that to the 3 to 4 years experts suggest.' : '') + '</p>';
    h += '<div class="gd-tablewrap"><table class="hs-table gd-rot"><thead><tr><th></th>';
    for (var b = 0; b < n; b++) h += '<th>' + part + (b + 1) + '</th>';
    h += '</tr></thead><tbody>';
    for (var y = 0; y < n; y++) {
      h += '<tr><th>Year ' + (y + 1) + '</th>';
      for (b = 0; b < n; b++) { var g = gi[(b - y + n) % n]; h += '<td data-l="' + part + (b + 1) + '"><b>' + ROTN[g.i] + '</b><small>' + esc(g.ps.map(function (p) { return p.c.n; }).join(', ')) + '</small></td>'; }
      h += '</tr>';
    }
    h += '</tbody></table></div>';
    var big = Math.max.apply(null, gi.map(function (g) { return g.a; })), sm = Math.min.apply(null, gi.map(function (g) { return g.a; }));
    if (big > sm * 2.5) h += '<p class="hs-small">The groups need different amounts of room (' + gi.map(function (g) { return ROTN[g.i].toLowerCase() + ' about ' + space(g.a); }).join(', ') + '). Make each part about the size of the largest group and fill spare room with a cover crop or extra of another group.</p>';
    var per = picks.filter(function (p) { return p.c.t !== 'annual'; });
    if (per.length) h += '<p class="hs-small">Give ' + esc(list(per.map(function (p) { return lc(p.c.n); }))) + ' a permanent spot outside the rotation: ' + (per.length > 1 ? 'they come' : 'it comes') + ' back year after year.</p>';
    return h;
  }

  // ---------- animals ----------
  var AN = {}; DATA.an.ch.concat(DATA.an.bee).forEach(function (n) { AN[n.id] = n.value; });
  function animalPlan() {
    var o = { cards: [], sum: [] }; if (!yard()) return o;
    if (st.hens) {
      var lo = AN.eggs_per_hen_year.typical_low, hi = AN.eggs_per_hen_year.typical_high, hn = +st.nhens || (+st.epw ? Math.ceil(st.epw * 52 / lo) : 0);
      if (hn) {
        var f = AN.feed_per_hen, cp = AN.coop_floor_space, rn = AN.run_space, rs = AN.roost_space, nb = Math.max(1, Math.ceil(hn / AN.nest_boxes.hens_per_box));
        o.hens = hn;
        o.sum.push('<div><b>' + n0(hn * lo / 52) + '–' + n0(hn * hi / 52) + '</b><span>eggs a week from ' + hn + ' hen' + (hn > 1 ? 's' : '') + '</span></div>');
        o.cards.push('<div class="gd-acard"><h3>🥚 ' + hn + ' laying hen' + (hn > 1 ? 's' : '') + '</h3><ul>' +
          (!+st.nhens ? '<li>Enough for about ' + st.epw + ' eggs a week, counting on ' + lo + ' eggs per hen a year; fewer in winter and as hens age.</li>' : '<li>About ' + n0(hn * lo / 52) + '–' + n0(hn * hi / 52) + ' eggs a week in a good laying year, fewer in winter and as hens age.</li>') +
          '<li>Coop: ' + n0(hn * cp.with_run_sqft_low) + '–' + n0(hn * cp.with_run_sqft_high) + ' sq ft of floor with a run (' + n0(hn * cp.without_run_sqft_low) + '–' + n0(hn * cp.without_run_sqft_high) + ' without), plus a run of ' + n0(hn * rn.sqft_low) + '–' + n0(hn * rn.sqft_high) + ' sq ft' + (st.where === 'garden' ? ', outside your growing beds' : '') + '.</li>' +
          '<li>' + nb + ' nest box' + (nb > 1 ? 'es' : '') + ' and ' + n0(hn * rs.inches_low) + '–' + n0(hn * rs.inches_high) + ' inches of roost.</li>' +
          '<li>Feed: about ' + n0(hn * f.lb_per_year_low) + '–' + n0(hn * f.lb_per_year_high) + ' lb of layer feed a year. Water: about ' + Math.max(0.1, Math.round(hn / AN.water_per_hen.gallons_per_25_hens / 25 * 10) / 10) + ' gallon' + (hn > 25 ? 's' : '') + ' a day in mild weather, more in heat.</li>' +
          '<li>Hens start laying at about ' + AN.laying_start_age.low + '–' + AN.laying_start_age.high + ' weeks and lay best with about ' + AN.daylight_for_laying.hours_per_day + ' hours of light a day.</li></ul></div>');
      }
    }
    if (st.broil && +st.nbroil) {
      var b = +st.nbroil, wk = AN.broiler_weeks, wt = AN.broiler_weights, fd = AN.broiler_feed;
      o.broil = b;
      o.sum.push('<div><b>' + n0(b * wt.live_lb_low * wt.dressed_pct_low / 100) + '–' + n0(b * wt.live_lb_high * wt.dressed_pct_high / 100) + ' lb</b><span>chicken meat from ' + b + ' bird' + (b > 1 ? 's' : '') + '</span></div>');
      o.cards.push('<div class="gd-acard"><h3>🍗 ' + b + ' meat chicken' + (b > 1 ? 's' : '') + '</h3><ul><li>Fast-growing meat birds are ready in about ' + wk.weeks_low + '–' + wk.weeks_high + ' weeks at ' + wt.live_lb_low + '–' + wt.live_lb_high + ' lb live, about ' + wt.dressed_pct_low + '–' + wt.dressed_pct_high + '% of that as dressed meat.</li>' +
        '<li>Feed: roughly ' + n0(b * fd.lb_feed_per_bird_low) + '–' + n0(b * fd.lb_feed_per_bird_high) + ' lb for the batch.</li><li>Selling meat is regulated: check your state’s rules first.</li></ul></div>');
    }
    if (st.bees && +st.nhives) {
      var n = +st.nhives, hy = AN.honey_per_colony, cs = (AN.startup_costs || {}).nc_state_estimates;
      o.bees = n;
      o.sum.push('<div><b>' + n0(n * hy.surplus_lb_low) + '–' + n0(n * hy.surplus_lb_high) + ' lb</b><span>honey a year from ' + n + ' established hive' + (n > 1 ? 's' : '') + ' (little the first year)</span></div>');
      o.cards.push('<div class="gd-acard"><h3>🐝 ' + n + ' hive' + (n > 1 ? 's' : '') + '</h3><ul><li>An established colony can give about ' + hy.surplus_lb_low + '–' + hy.surplus_lb_high + ' lb of surplus honey a year. The first year, expect little or none: the bees need it to build up and get through winter.</li>' +
        (n === 1 ? '<li>Many beekeepers start with two hives, so they can compare them and share frames if one struggles.</li>' : '') +
        (cs ? '<li>Starting costs (NC State Extension): a starter hive kit about $' + String(cs.starter_hive_kit_usd).replace(/^about (\d+).*/, '$1') + ', bees $' + String(cs.package_bees_usd).replace(' to ', '–') + ' a package or $' + String(cs.nuc_usd).replace(' to ', '–') + ' a nuc, plus a smoker, hive tool and protective gear.</li>' : '') +
        '<li>Never give honey to a baby under 12 months.</li></ul></div>');
    }
    return o;
  }
  var SRC = {
    uvm: ['UVM Extension: Chickens in the garden', 'https://www.uvm.edu/extension/news/chickens-garden'],
    unr: ['Univ. of Nevada Extension: Using chicken manure safely in home gardens', 'https://psdocs.spes.vt.edu/consumer/3_using_chicken_manure.pdf'],
    vt: ['Virginia Cooperative Extension: Manure and other soil amendments', 'https://pubs.ext.vt.edu/FST/FST-39/FST-39NP.html'],
    msu: ['Montana State: Which garden vegetables and fruits need insect pollination', 'https://www.montana.edu/extension/bigskybees/GardenVegetablesFruitsNeedPollination.html'],
    cor: ['Cornell NYS IPM: Bee a good neighbor', 'https://dlc.cce.cornell.edu/pluginfile.php/377033/mod_resource/content/1/Bees%20-%20NYS%20IPM.pdf']
  };
  function srcs(keys) { return '<p class="gd-src">Sources: ' + keys.map(function (k) { return '<a href="' + SRC[k][1] + '" target="_blank" rel="noopener">' + SRC[k][0] + '</a>'; }).join(' · ') + '</p>'; }
  var OFFGROUND = /^(tomatoes|cherry_tomatoes|peppers|eggplant|sweet_corn|flint_dent_corn|sunflowers)$/;
  var BEE_NEED = /^(strawberries|sunflowers|apple|plum_cherry|peach|pear|raspberries_blackberries|cucumbers|summer_squash|winter_squash|pumpkins|cantaloupe|watermelon|fava_beans)$/;
  var BUZZ = /^(tomatoes|cherry_tomatoes|eggplant|peppers)$/;
  var CHICK_NO = /^(tomatoes|cherry_tomatoes|peppers|potatoes|eggplant|rhubarb|onions|dry_beans)$/;
  function together(picks, o) {
    if (!o.hens && !o.broil && !o.bees) return '';
    var names = function (re) { return picks.filter(function (p) { return re.test(p.c.k); }).map(function (p) { return lc(p.c.n); }); };
    var up = function (p) { return OFFGROUND.test(p.c.k) || /^(tree|bush|vine)$/.test(p.c.t); };
    var h = '<h3>Fitting the animals in with your garden</h3>';
    if (o.hens || o.broil) {
      var off = picks.filter(up).map(function (p) { return lc(p.c.n); }), on = picks.filter(function (p) { return !up(p); }).map(function (p) { return lc(p.c.n); });
      var bad = names(CHICK_NO);
      h += '<div class="gd-fit"><h4>🐔 Chickens and the garden</h4><ul>' +
        '<li><b>Keep them out while crops grow.</b> Chickens strip seedlings and peck ripening fruit. Fence the beds, or run a double fence about 4 ft apart so hens can patrol the gap for bugs without reaching the plants.</li>' +
        '<li><b>Let them in before planting and after harvest</b> to scratch up weeds and clean up leftover plants.</li>' +
        '<li><b>Compost the coop litter before it goes on the garden.</b> Raw chicken manure is strong enough to burn plants, and a hot compost pile kills most germs. Keep the manure pile where runoff can’t reach the vegetables.</li>' +
        (picks.length ? '<li><b>If you use raw or aged (not composted) manure,</b> spread it at least 120 days before harvesting crops that touch the soil' + (on.length ? ' (' + esc(list(on)) + (names(/^cucumbers$/).length ? '; cucumbers 90 days if trellised' : '') + ')' : '') + ', and at least 90 days before crops that don’t' + (off.length ? ' (' + esc(list(off)) + ')' : '') + '. Fully composted manure needs no wait. Wash produce well; people at higher risk of food poisoning should avoid raw vegetables from manure-fed beds.</li>' : '') +
        (bad.length ? '<li><b>Don’t feed them</b> these from your garden, plants or scraps: ' + esc(list(bad)) + '. They aren’t safe for chickens.</li>' : '') +
        '<li>Keep chickens away from garden sprays, including organic ones, and away from bird feeders and ponds that draw wild birds.</li></ul>' + srcs(['uvm', 'unr', 'vt']) + '</div>';
    }
    if (o.bees) {
      var need = names(BEE_NEED), buzz = names(BUZZ);
      h += '<div class="gd-fit"><h4>🐝 Bees and the garden</h4><ul>' +
        (need.length ? '<li><b>Your bees will help</b> ' + esc(list(need)) + ': ' + (need.length > 1 ? 'these need' : 'this needs') + ' insects to carry pollen between flowers.</li>' : '') +
        (buzz.length ? '<li>' + esc(list(buzz)).replace(/^./, function (x) { return x.toUpperCase(); }) + ' set fruit best with “buzz” pollination by bumble bees and other native bees, which honeybees don’t do, so leave room for flowers that feed them too.</li>' : '') +
        '<li><b>Place hives</b> as far from your yard’s edges as you can, on a stand about 18 inches high, with the entrance facing east or south. A 6-ft fence or hedge in front sends bees up and over people’s heads, so put the hives where their flight path doesn’t cross paths you use.</li>' +
        (o.bees > 2 && st.where === 'garden' ? '<li>On a small lot, Cornell’s advice for neighbors is no more than two hives on a quarter acre or less.</li>' : '') +
        '<li><b>Go easy on sprays.</b> Never spray plants that are in bloom, read the bee warnings on any label, and if you must spray, do it near dusk when bees are home.</li>' +
        '</ul>' + srcs(['msu', 'cor']) + '</div>';
    }
    return h;
  }

  function render() {
    var A = area(), w = st.where, people = +st.people || 1, planted = w === 'farm' ? A * 0.8 : A;
    var P = st.mode === 'only' ? planOnly(A, planted) : planSuggest(A, planted);
    var CA = null;
    if (byCont()) { CA = assign(P.picks); P.picks = P.picks.filter(function (p) { return !p.drop; }); P.picks.forEach(calc); }
    var picks = P.picks.sort(function (a, b) { return b.a - a.a; });
    var mustOut = st.must.map(function (k) { return BY[k]; }).filter(function (c) { return c && status(c).s === 'no'; });
    var o = animalPlan(), h = '<h2><span class="pl-n">5</span> Your plan</h2>';
    if (st.mode === 'only' && !P.cand.length) h += '<p class="gd-note">Tap the crops you want to grow in step 3' + (mustOut.length ? ' (the ones you picked don’t suit this space)' : '') + ', or switch to “Suggest a plan”.</p>';
    var kcal = 0, lb = 0, anyK = false; picks.forEach(function (p) { if (p.kcal) { kcal += p.kcal; anyK = true; } if (p.lb) lb += p.lb; });
    var days = kcal / (people * 2000);
    if (picks.length || o.sum.length) {
      h += '<div class="gd-sum">' +
        '<div><b>' + space(A) + '</b><span>' + (w === 'farm' ? 'about 80% planted, the rest paths and access' : byCont() ? 'of soil in ' + units().length + ' container' + (units().length === 1 ? '' : 's') : 'growing space') + '</span></div>' +
        (picks.length ? '<div><b>' + picks.length + '</b><span>crop' + (picks.length > 1 ? 's' : '') + '</span></div>' : '') +
        (lb ? '<div><b>' + lbs(lb) + ' lb</b><span>rough harvest a season</span></div>' : '') +
        (anyK ? '<div><b>' + n0(kcal) + '</b><span>calories, ' + (days >= 1 ? 'about ' + n0(days) + ' day' + (days >= 1.5 ? 's' : '') : 'less than a day') + ' of food energy for ' + people + ' ' + (people > 1 ? 'people' : 'person') + ' at 2,000 a day</span></div>' : '') +
        o.sum.join('') + '</div>';
    }
    if (st.mode === 'only' && P.cand.length && P.cont) {
      if (CA && !CA.none.length && picks.length) h += '<p class="gd-note gd-ok">✓ <b>Every crop has a container.</b> The containers are matched to what each crop needs, using the extension sizes noted under each crop.</p>';
    } else if (st.mode === 'only' && P.cand.length) {
      if (!P.noRoom.length) h += '<p class="gd-note gd-ok">✓ <b>These fit.</b> They need at least about ' + space(P.need) + ' and you have ' + space(planted) + (P.spare >= 1 ? ', which leaves about <b>' + space(P.spare) + '</b> beyond what ' + people + ' ' + (people > 1 ? 'people' : 'person') + ' would likely eat of them' : '') + '.' +
        (P.spare >= 1 && P.ideas.length ? ' Ideas to fill it: ' + esc(list(P.ideas.map(function (c) { return lc(c.n); }))) + '.' : '') + '</p>';
      else h += '<p class="gd-note gd-bad"><b>Not everything fits.</b> All ' + P.cand.length + ' need at least about ' + space(P.need) + ', and you have ' + space(planted) + '. The plan below fits the ones that give the most for your aim; there’s no room left for ' +
        esc(list(P.noRoom.map(function (c) { return lc(c.n) + ' (about ' + space(minA(c)) + (c.t === 'tree' ? ' for one tree' : '') + ')'; }))) + '. ' +
        (w === 'balcony' || w === 'indoor' ? 'Growing up (trellises, railings, hanging baskets) or more containers would help.' : 'You could drop a space-hungry crop, or grow quick crops one after another in the same spot.') + '</p>';
      var iffy = picks.filter(function (p) { return p.st.s === 'iffy'; });
      if (iffy.length) h += '<p class="gd-note">⚠ Possible but not ideal here: ' + esc(iffy.map(function (p) { return p.c.n + ' (' + p.st.why + ')'; }).join('; ')) + '.</p>';
    }
    if (w === 'indoor' && picks.length) h += '<p class="gd-note">Indoors, plants give you fresh greens, herbs and flavor more than calories. ' + (st.lights ? 'With grow lights you can try fruiting crops too.' : 'With grow lights (tick the box above) you can try a few fruiting crops.') + '</p>';
    else if (anyK && days < 30 && st.mode !== 'only') h += '<p class="gd-note">Most home gardens supply vitamins, minerals, fiber and freshness more than total calories. Potatoes, sweet potatoes, winter squash, dry beans and corn give the most food energy for the space.</p>';
    if (st.mode !== 'only' && P.spare) h += '<p class="gd-note">That leaves about <b>' + space(P.spare) + '</b> beyond what ' + people + ' ' + (people > 1 ? 'people' : 'person') + ' would eat of these crops: room for a cover crop, ' + (o.hens ? 'more run for the hens, ' : '') + 'more to store, share or sell, or simply less to weed.</p>';
    if (CA) {
      if (!units().length) h += '<p class="gd-note gd-bad">Add your containers above to plan what goes in each.</p>';
      if (CA.none.length) h += '<p class="gd-note gd-bad">No container for ' + esc(CA.none.map(function (x) { return lc(x.c.n) + ' (' + x.why + ')'; }).join('; ')) + '.</p>';
      if (CA.spare.length) h += '<p class="gd-note">Not used yet: ' + esc(list(tally(CA.spare))) + '. Add another crop, or plant more of one you like.</p>';
    }
    if (mustOut.length) h += '<p class="gd-note">Not in the plan: ' + esc(mustOut.map(function (c) { return c.n + ' (' + status(c).why + ')'; }).join('; ')) + '.</p>';
    if (picks.length) {
      h += '<div class="gd-tablewrap"><table class="hs-table gd-plan"><thead><tr><th>Crop</th><th>Space</th><th>Plants</th><th>Rough harvest</th><th>Calories</th><th>Rich in</th><th>Plant</th><th>Ready in</th></tr></thead><tbody>';
      picks.forEach(function (p) {
        var c = p.c, nt = p.notes.slice(); if (p.st.why) nt.unshift(p.st.why);
        h += '<tr><td><b>' + esc(c.n) + '</b>' + (st.mode !== 'only' && st.must.indexOf(c.k) >= 0 ? ' <span class="gd-tag">your pick</span>' : '') + (nt.length ? '<small class="gd-warn">' + esc(nt.join('; ')) + '</small>' : '') + ((w === 'balcony' || w === 'indoor') && c.cg ? '<small>Container: at least ' + c.cg + ' gallons' + (c.cdep ? ', ' + c.cdep + ' inches deep' : '') + (c.cper ? ', ' + c.cper + ' plant each' : '') + '</small>' : '') + '</td>' +
          '<td data-l="Space">' + (p.cont && p.cont.length ? esc(tally(p.cont).join(', ')) + '<small>' + space(p.a) + ' of soil</small>' : space(p.a)) + '</td>' +
          '<td data-l="Plants">' + (p.trees ? p.trees + ' tree' + (p.trees > 1 ? 's' : '') : p.plants ? '≈ ' + n0(p.plants) : '—') + '</td>' +
          '<td data-l="Rough harvest">' + (p.lb != null ? (p.lbr && lbs(p.lbr[0]) !== lbs(p.lbr[1]) ? lbs(p.lbr[0]) + '–' + lbs(p.lbr[1]) : lbs(p.lb)) + ' lb' + (p.trees ? ' a year once mature' : '') : '—') + '</td>' +
          '<td data-l="Calories">' + (p.kcal != null ? n0(p.kcal) : '—') + '</td>' +
          '<td data-l="Rich in">' + esc(c.nut.map(function (x) { return x.replace(/ \d+% DV$/, ''); }).join(', ') || (c.fib >= 3 ? 'fiber' : c.pro >= 5 ? 'protein' : '—')) + '</td>' +
          '<td data-l="Plant">' + esc(when(c)) + '</td>' +
          '<td data-l="Ready in">' + (c.yrs && c.yrs[0] ? c.yrs[0] + (c.yrs[1] && c.yrs[1] !== c.yrs[0] ? '–' + c.yrs[1] : '') + ' years' : c.dh && c.dh[0] ? c.dh[0] + (c.dh[1] && c.dh[1] !== c.dh[0] ? '–' + c.dh[1] : '') + ' days' : '—') + '</td></tr>';
      });
      h += '</tbody></table></div><p class="hs-small">Harvest ranges come from university extension yield tables for ordinary garden rows; well-tended intensive beds can do better, and a bad year worse. Calories are for the raw edible part (rinds, peels and pits not subtracted). See each crop in the reference table below for spacing, storage and sources.</p>';
      h += rotation(picks);
    }
    if (o.cards.length) h += '<h3>Your animals</h3><div class="gd-acards">' + o.cards.join('') + '</div>';
    h += together(picks, o);
    var anyA = o.hens || o.broil || o.bees;
    h += '<h3>Next steps</h3><ol class="gd-steps">' + (w === 'indoor' ? '<li>Find your sunniest window (4 to 6 hours of direct sun), or set up a grow light on a timer.</li><li>Use pots with drainage holes and fresh potting mix.</li>' : '<li>Find your average last spring frost date: ask your county extension office (see “Finding local help” below). Planting times above count from it.</li><li>Get a soil test through your extension office before you add fertilizer or lime.</li>') +
      (anyA ? '<li>Check your town’s rules for ' + list([o.hens || o.broil ? 'chickens' : '', o.bees ? 'bees' : ''].filter(Boolean)) + ' before you buy anything.</li>' : '') +
      '<li>Read the guides below: they’re picked for your space and crops' + (anyA ? ' and animals' : '') + '.</li><li>Start smaller than you think: a garden you can keep up with gives more food than a big one that gets away from you.</li></ol>';
    $('gd-out').innerHTML = h;
    guides(picks, o);
  }

  // ---------- guides: show the ones that match the plan ----------
  var GS = { 'Indoors': 'indoor', 'Balconies': 'balcony', 'Backyard': 'garden', 'Large home': 'garden', 'Small family farms': 'farm' };
  var CROPG = { 'Potatoes': /^potatoes$/, 'Sweet potatoes': /^sweet_potatoes$/, 'Carrots': /^carrots$/, 'Strawberries': /^(strawberries|blueberries|raspberries_blackberries)$/, 'Garlic and onions': /^(garlic|onions)$/, 'Winter squash': /^(winter_squash|pumpkins)$/, 'Dry beans': /^dry_beans$/ };
  function guides(picks, o) {
    var all = st.allg, keys = picks.map(function (p) { return p.c.k; }), shown = 0;
    D.querySelectorAll('#gd-guides [data-show]').forEach(function (el) {
      el.hidden = !all && !el.dataset.show.split(' ').some(function (s) { return s === 'crops' || !!o[s]; });
    });
    var meat = $('g-meat_birds'); if (meat) meat.hidden = !all && !o.broil;
    ['g-egg_safety', 'g-end_of_laying'].forEach(function (id) { var e = $(id); if (e) e.hidden = !all && !o.hens; });
    D.querySelectorAll('#gd-guides .gd-grp').forEach(function (g) {
      var t = g.dataset.title, on = true;
      Object.keys(GS).forEach(function (p) { if (t.indexOf(p) === 0) on = GS[p] === st.where; });
      Object.keys(CROPG).forEach(function (p) { if (t.indexOf(p) === 0) on = keys.some(function (k) { return CROPG[p].test(k); }); });
      g.hidden = !all && !on;
    });
    var cg = $('g-crops'); if (cg) cg.hidden = !all && !cg.querySelector('.gd-grp:not([hidden])');
    D.querySelectorAll('#gd-guides .gd-sec').forEach(function (s) { if (!s.hidden && !s.parentNode.closest('[hidden]')) shown++; });
    $('gd-gnote').textContent = all ? 'Showing every guide.' : 'Showing the ' + shown + ' guides for your space' + (o.hens || o.broil || o.bees ? ', crops and animals' : ' and crops') + '.';
  }

  // ---------- reference table ----------
  function refTable(q) {
    q = (q || '').toLowerCase();
    var rows = C.filter(function (c) { return !q || (c.n + ' ' + c.fam + ' ' + c.g).toLowerCase().indexOf(q) >= 0; });
    $('gd-table').innerHTML = '<thead><tr><th>Crop</th><th>Family</th><th>Calories / 100 g</th><th>Protein / fiber (g)</th><th>Rich in</th><th>Yield per 100 sq ft</th><th>Space per plant</th><th>Season</th><th>Keeps</th><th>Sources</th></tr></thead><tbody>' +
      rows.map(function (c) {
        return '<tr><td><b>' + esc(c.n) + '</b><small>' + esc(c.part || '') + '</small></td><td>' + esc(c.fam) + '<small>' + esc(c.g) + '</small></td>' +
          '<td>' + (c.cal != null ? Math.round(c.cal) : '—') + (c.fdc ? ' <a href="' + esc(c.fdc) + '" target="_blank" rel="noopener" title="USDA FoodData Central">↗</a>' : '') + '</td>' +
          '<td>' + (c.pro != null ? c.pro : '—') + ' / ' + (c.fib != null ? c.fib : '—') + '</td><td>' + esc(c.nut.join(', ') || '—') + '</td>' +
          '<td>' + (c.y != null ? c.y + ' lb' + (c.yr ? '<small>range ' + Math.round(c.yr[0]) + '–' + Math.round(c.yr[1]) + '</small>' : '') : '—') + '</td>' +
          '<td>' + (c.sq != null ? c.sq + ' sq ft' : '—') + '</td><td>' + esc(c.se || '—') + (c.fr ? '<small>' + esc(c.fr) + '</small>' : '') + '</td>' +
          '<td><small>' + esc(c.sto || '—') + '</small></td><td>' + c.src.slice(0, 4).map(function (u, i) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + (i + 1) + '</a>'; }).join(' ') + '</td></tr>';
      }).join('') + '</tbody>';
  }
  $('gd-q').addEventListener('input', function () { refTable(this.value); });

  function sync() {
    D.querySelectorAll('#gd-form [data-for]').forEach(function (el) { el.hidden = el.dataset.for.split(' ').indexOf(st.where) < 0; });
    D.querySelectorAll('.gd-zone').forEach(function (el) { el.hidden = st.where === 'indoor'; });
    $('gd-area').textContent = st.where === 'garden' ? '= ' + n0(area()) + ' sq ft' : '';
    D.querySelectorAll('#gd-form [data-by]').forEach(function (el) { if (!el.hidden) el.hidden = el.dataset.by !== st.planby; });
    $('gd-an').hidden = !yard(); $('gd-an-none').hidden = yard();
    D.querySelectorAll('.gd-ain').forEach(function (el) { el.hidden = !st[el.dataset.an]; });
    chips(); save(); render();
  }
  showInputs(); conts(); sync(); refTable('');
})(window, document);
