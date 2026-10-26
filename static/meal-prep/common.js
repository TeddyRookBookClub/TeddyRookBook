/* Meal Prep: shared by the planner, the print page and the recipe pages.
   Loads the data file, keeps the saved state (localStorage "trb-meals-v1"), and draws the parts that the
   planner and the print page both show (week grid, shopping list, recipe cards, kids' chart). */
(function (W, D) {
  'use strict';
  var M = W.MealModel, KEY = 'trb-meals-v1';
  var C = {};

  // ---------- little helpers ----------
  C.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  C.$ = function (s, r) { return (r || D).querySelector(s); };
  C.$$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  C.uid = function (p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], DOWL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  C.DOW = DOW; C.DOWL = DOWL;
  C.SLOTNAME = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' };
  C.SLOTICON = { breakfast: '🌅', lunch: '🥪', dinner: '🍽️', snack: '🍎' };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  C.iso = function (dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); };
  C.parseISO = function (s) { var p = String(s || '').split('-'); var dt = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(dt) ? new Date() : dt; };
  C.dateOf = function (plan, d) { var dt = C.parseISO(plan.start); dt.setDate(dt.getDate() + d); return dt; };
  C.dayLabel = function (plan, d, long) { var dt = C.dateOf(plan, d); return (long ? DOWL : DOW)[dt.getDay()] + ' ' + MON[dt.getMonth()] + ' ' + dt.getDate(); };
  C.shortDate = function (dt) { return MON[dt.getMonth()] + ' ' + dt.getDate(); };
  C.planDays = function (plan) {
    if (plan.len === 'month') { var a = C.parseISO(plan.start), b = new Date(a.getFullYear(), a.getMonth() + 1, a.getDate()); return Math.max(28, Math.min(31, Math.round((b - a) / 864e5))); }
    return Math.max(1, Math.min(31, +plan.len || 7));
  };
  C.weeks = function (plan) { var n = plan.days, out = []; for (var i = 0; i < n; i += 7) out.push({ w: out.length, from: i, to: Math.min(n, i + 7) - 1 }); return out; };
  C.weekLabel = function (plan, w) { return 'Week ' + (w.w + 1) + ' · ' + C.shortDate(C.dateOf(plan, w.from)) + ' – ' + C.shortDate(C.dateOf(plan, w.to)); };
  C.mins = function (m) { if (m == null) return ''; m = Math.round(m); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' hr' + (m % 60 ? ' ' + (m % 60) + ' min' : ''); };
  // inline Markdown used in guide text: **bold**, *italic*, [text](url)
  C.md = function (s) { return C.esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\[([^\]]+)\]\((https?:[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>'); };

  // ---------- saved state ----------
  C.storageOK = (function () { try { var k = '__trb_t'; W.localStorage.setItem(k, '1'); W.localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  function nextMonday() { var d = new Date(); d.setHours(0, 0, 0, 0); var add = (8 - d.getDay()) % 7; d.setDate(d.getDate() + (add === 0 ? 7 : add)); return d; }
  C.newPlan = function (name, from) {
    var p = { id: C.uid('p'), name: name || 'Week A', start: C.iso(nextMonday()), len: 7, slots: { breakfast: true, lunch: true, dinner: true, snack: false }, cells: {}, guests: {}, pantry: {}, extras: [] };
    if (from) { p.start = from.start; p.len = from.len; p.slots = JSON.parse(JSON.stringify(from.slots)); }
    p.days = C.planDays(p);
    return p;
  };
  C.fresh = function () {
    var p = C.newPlan('Week A');
    return { v: 1, cur: p.id, plans: [p], people: JSON.parse(JSON.stringify(M.DEFAULT_GROUPS)), avoid: [], diet: {}, rules: { noRepeat: 6, busy: [1, 3] }, mine: {}, view: 'cal', shopRange: 'all' };
  };
  C.fix = function (st) {
    var f = C.fresh();
    if (!st || typeof st !== 'object' || !Array.isArray(st.plans) || !st.plans.length) return f;
    ['people', 'avoid', 'diet', 'rules', 'mine'].forEach(function (k) { if (st[k] == null) st[k] = f[k]; });
    st.plans.forEach(function (p) { p.cells = p.cells || {}; p.guests = p.guests || {}; p.pantry = p.pantry || {}; p.extras = p.extras || []; p.slots = p.slots || { breakfast: true, lunch: true, dinner: true, snack: false }; p.days = C.planDays(p); if (!p.id) p.id = C.uid('p'); });
    if (!st.plans.some(function (p) { return p.id === st.cur; })) st.cur = st.plans[0].id;
    st.v = 1;
    return st;
  };
  C.loadState = function () {
    var st = null;
    try { st = JSON.parse(W.localStorage.getItem(KEY) || 'null'); } catch (e) { }
    if (!st) { try { if (/^trbmeals:/.test(W.name)) st = JSON.parse(W.name.slice(9)); } catch (e) { } }
    return C.fix(st);
  };
  C.saveState = function (st) {
    try { W.localStorage.setItem(KEY, JSON.stringify(st)); return true; } catch (e) { return false; }
  };
  // hand the state to the next page in this tab even when storage is blocked
  C.handOff = function (st) { try { W.name = 'trbmeals:' + JSON.stringify(st); } catch (e) { } };
  C.plan = function (st) { for (var i = 0; i < st.plans.length; i++) if (st.plans[i].id === st.cur) return st.plans[i]; return st.plans[0]; };

  // ---------- data ----------
  C.load = function (src, cb) {
    if (!src) { cb(new Error('no data')); return; }
    fetch(src).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (raw) {
      var n = M.norm(raw), meta = raw.meta || {};
      var secs = (meta.sections || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      var data = {
        raw: raw, meta: meta, cat: n.cat, builtin: n.recipes, guides: raw.guides || [], recipeBase: raw.recipeBase || '/meal-prep/recipes/',
        sectionOrder: secs.map(function (s) { return s.id; }), sectionName: {}, allergenName: {}, nutrHas: false
      };
      secs.forEach(function (s) { data.sectionName[s.id] = s.name; });
      (meta.allergens || []).forEach(function (a) { data.allergenName[a.id] = a.name || a.id; });
      M.ALLERGENS.forEach(function (a) { if (!data.allergenName[a]) data.allergenName[a] = a.replace('-', ' ').replace(/^./, function (c) { return c.toUpperCase(); }); });
      Object.keys(n.cat).forEach(function (k) { if (n.cat[k].n) data.nutrHas = true; });
      data.items = Object.keys(n.cat).map(function (k) { return n.cat[k]; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      cb(null, data);
    }).catch(function (e) { cb(e); });
  };
  C.sectionName = function (data, id) { return data.sectionName[id] || (id ? String(id).replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }) : 'Other'); };
  // built-in recipes plus the user's own (own ids start with "my-")
  C.recipes = function (data, st) {
    var all = {};
    Object.keys(data.builtin).forEach(function (k) { all[k] = data.builtin[k]; });
    Object.keys(st.mine || {}).forEach(function (k) { var r = M.normRecipe(Object.assign({}, st.mine[k], { id: k, own: true })); all[k] = r; });
    return all;
  };
  C.recipeURL = function (data, r) { return r.own ? null : data.recipeBase + r.id + '/'; };
  C.flags = function (data, r) { if (!r._f) r._f = M.recipeFlags(r, data.cat); return r._f; };
  C.has = function (r, t) { return r.tags.indexOf(t) >= 0 || r.method.indexOf(t) >= 0; };
  // does a recipe pass the household's "avoid" settings?
  C.allowed = function (data, st, r) {
    var f = C.flags(data, r);
    for (var i = 0; i < (st.avoid || []).length; i++) if (f.allergens.indexOf(st.avoid[i]) >= 0) return false;
    if (st.diet.vegetarian && !f.vegetarian) return false;
    if (st.diet.vegan && !f.vegan) return false;
    if (st.diet.glutenFree && !f.glutenFree) return false;
    if (st.diet.dairyFree && !f.dairyFree) return false;
    return true;
  };
  C.emoji = function (r) {
    if (r.emoji) return r.emoji;
    var m = r.meals[0], p = r.protein;
    return p === 'chicken' ? '🍗' : p === 'beef' ? '🥩' : p === 'pork' ? '🥓' : p === 'fish' ? '🐟' : m === 'breakfast' ? '🥞' : m === 'side' ? '🥗' : m === 'snack' ? '🍎' : '🍲';
  };
  C.servingsFor = function (st, plan, key, e) {
    var s = M.cellServings(plan, key, st.people) + (+e.x || 0);
    return s;
  };

  // ---------- shared HTML (print page and planner) ----------
  C.listRows = function (data, st, plan, range) {
    var all = C.recipes(data, st), from = 0, to = plan.days - 1;
    if (range && range !== 'all') { var m = /^(w|d)(\d+)$/.exec(range); if (m) { if (m[1] === 'w') { from = +m[2] * 7; to = Math.min(plan.days - 1, from + 6); } else { from = to = +m[2]; } } }
    return M.shoppingList(plan, st.people, all, data.cat, { from: from, to: to, pantry: plan.pantry, extras: range === 'all' || !range ? plan.extras : [], sectionOrder: data.sectionOrder });
  };
  C.rangeLabel = function (plan, range) {
    if (!range || range === 'all') return C.shortDate(C.dateOf(plan, 0)) + ' – ' + C.shortDate(C.dateOf(plan, plan.days - 1));
    var m = /^(w|d)(\d+)$/.exec(range); if (!m) return '';
    if (m[1] === 'd') return C.dayLabel(plan, +m[2], true);
    var w = C.weeks(plan)[+m[2]]; return w ? C.weekLabel(plan, w) : '';
  };
  // the week as a table: one row per day, one column per meal (fits a portrait page)
  C.weekGridHTML = function (data, st, plan, w) {
    var all = C.recipes(data, st), slots = M.SLOTS.filter(function (s) { return plan.slots[s] !== false; });
    var h = '<table class="mpp-grid days-rows"><thead><tr><th scope="col">Day</th>' + slots.map(function (s) { return '<th scope="col">' + C.SLOTNAME[s] + '</th>'; }).join('') + '</tr></thead><tbody>';
    for (var d = w.from; d <= w.to; d++) {
      h += '<tr><th scope="row">' + C.esc(C.dayLabel(plan, d)) + '</th>';
      slots.forEach(function (s) {
        var k = M.cellKey(d, s), es = plan.cells[k] || [];
        h += '<td>' + es.map(function (e) { var r = all[e.r]; if (!r) return ''; return '<div class="mpp-m">' + C.esc(C.emoji(r)) + ' ' + C.esc(r.name) + (e.lo ? ' <i>(leftovers)</i>' : '') + '</div>'; }).join('') + (plan.guests[k] ? '<div class="mpp-g">' + (plan.guests[k] > 0 ? '+' : '') + plan.guests[k] + ' people</div>' : '') + '</td>';
      });
      h += '</tr>';
    }
    return h + '</tbody></table>';
  };
  C.shopHTML = function (data, st, plan, range, opts) {
    opts = opts || {};
    var rows = C.listRows(data, st, plan, range), sec = null, h = '';
    var buy = rows.filter(function (r) { return !r.have; }), have = rows.filter(function (r) { return r.have; });
    if (!rows.length) return '<p class="mpp-empty">Nothing to buy yet: add some meals to the plan.</p>';
    h += '<div class="mpp-shop">';
    buy.forEach(function (r) {
      if (r.section !== sec) { if (sec !== null) h += '</ul></div>'; sec = r.section; h += '<div class="mpp-sec"><h3>' + C.esc(C.sectionName(data, sec)) + '</h3><ul>'; }
      h += '<li><span class="mpp-box"></span><span class="mpp-nm"><b>' + C.esc(r.name) + '</b> ' + C.esc(r.check ? r.check + ' (need ' + r.need + ')' : r.buy) + (opts.uses && r.uses.length ? '<small> · ' + C.esc(r.uses.join(', ')) + '</small>' : '') + '</span></li>';
    });
    if (sec !== null) h += '</ul></div>';
    if (have.length) h += '<div class="mpp-sec mpp-have"><h3>Already have</h3><ul>' + have.map(function (r) { return '<li><span class="mpp-box on">✓</span><span class="mpp-nm">' + C.esc(r.name) + '</span></li>'; }).join('') + '</ul></div>';
    return h + '</div>';
  };
  C.ingLine = function (s) {
    var i = s.ing, nm = s.item ? s.item.name : (i.w && i.w.name) || '', amt = s.nice.text;
    // things counted one by one read naturally: "3 large eggs", "2 medium yellow onions", "8 corn tortillas (6 inch)",
    // "1 ball of pizza dough (1 lb)"
    if (s.item && s.item.countLabel && s.unit === 'each' && s.nice.n) { amt = C.countWords(s.nice.n, s.item); nm = ''; }
    else if (s.item && s.item.countLabels && s.item.countLabels[i.unit] && s.nice.n) amt = M.labelText(s.nice.n, s.item.countLabels[i.unit], M.fmtFrac(s.nice.n));
    return (amt ? '<b>' + C.esc(amt) + '</b>' + (nm ? ' ' : '') : '') + C.esc(nm) + (i.note ? ', ' + C.esc(i.note) : '') + (i.opt ? ' <i>(optional)</i>' : '') + (i.taste ? ' <i>(to taste)</i>' : '');
  };
  C.countWords = function (n, item) {
    var P = M.parseLabel(item.countLabel), nw = P.noun.toLowerCase().split(' ');
    function stem(w) { return w.replace(/ies$/, 'y').replace(/(ch|sh|s|x|o)es$/, '$1').replace(/s$/, ''); }
    function same(a, b) { a = stem(a); b = stem(b); return a === b || (a.length > 3 && b.length > 3 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)); }
    var words = item.name.toLowerCase().replace(/[(),]/g, ' ').split(/\s+/).filter(function (w) { return w && !/\d/.test(w) && !/^(or|and|of|raw|peeled|fresh|unsweetened)$/.test(w); });
    // the first word of the name that the label also has; words before it in the name are modifiers to keep
    var j = -1, mi = -1;
    words.forEach(function (w, i) { if (j >= 0) return; var k = -1; nw.forEach(function (x, xi) { if (k < 0 && same(w, x)) k = xi; }); if (k >= 0) { j = i; mi = k; } });
    var tail = '';
    if (j < 0) tail = ' of ' + item.name.toLowerCase().replace(/,.*$/, '');
    else {
      var extra = words.slice(0, j).filter(function (w) { return !nw.some(function (x) { return same(w, x); }); });
      nw = nw.slice(0, mi).concat(extra, nw.slice(mi));
    }
    nw[nw.length - 1] = M.unitName(nw[nw.length - 1], n);
    return M.fmtFrac(n) + ' ' + nw.join(' ') + tail + (P.size ? ' (' + P.size + ')' : '');
  };
  C.cardHTML = function (data, r, servings) {
    var sc = M.scaleRecipe(r, servings, data.cat);
    return '<article class="mpp-card"><h3>' + C.esc(C.emoji(r)) + ' ' + C.esc(r.name) + '</h3><p class="mpp-meta">Makes ' + M.fmtFrac(M.roundFrac(servings, [1 / 4, 1 / 2, 3 / 4])) + ' adult portions' + (r.total ? ' · ' + C.mins(r.total) : '') + '</p>' +
      '<div class="mpp-cols"><ul class="mpp-ing">' + sc.map(function (s) { return '<li>' + C.ingLine(s) + '</li>'; }).join('') + '</ul>' +
      '<ol class="mpp-steps">' + r.steps.map(function (t) { return '<li>' + C.esc(t) + '</li>'; }).join('') + '</ol></div></article>';
  };
  C.kidsHTML = function (data, st, plan, w, slotsShown) {
    var all = C.recipes(data, st), h = '<div class="mpp-kids">';
    for (var d = w.from; d <= w.to; d++) {
      var dt = C.dateOf(plan, d);
      h += '<div class="mpp-kday"><div class="mpp-kdow">' + DOWL[dt.getDay()] + '</div>';
      slotsShown.forEach(function (s) {
        var es = plan.cells[M.cellKey(d, s)] || [];
        if (!es.length) return;
        h += '<div class="mpp-kmeal">' + (slotsShown.length > 1 ? '<small>' + C.SLOTNAME[s] + '</small>' : '') + es.map(function (e) { var r = all[e.r]; return r ? '<div><span class="mpp-kemo">' + C.esc(C.emoji(r)) + '</span> ' + C.esc(r.name) + '</div>' : ''; }).join('') + '</div>';
      });
      h += '</div>';
    }
    return h + '</div>';
  };
  // recipes cooked in a range, with the portions they're cooked for
  C.cooked = function (data, st, plan, from, to) {
    var all = C.recipes(data, st), seen = {}, out = [];
    M.cookings(plan, st.people, from, to, all).forEach(function (c) {
      var r = all[c.r]; if (!r) return;
      var sv = c.servings;
      if (seen[c.r]) { seen[c.r].servings += sv; seen[c.r].times++; return; }
      seen[c.r] = { r: r, servings: sv, times: 1, d: c.d }; out.push(seen[c.r]);
    });
    return out;
  };
  W.MealCommon = C;
})(window, document);
