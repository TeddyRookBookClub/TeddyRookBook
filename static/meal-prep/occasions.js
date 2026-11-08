/* Meal Prep: the shared menu for the occasion collections (/meal-prep/lunchboxes/, /meal-prep/birthday/, /meal-prep/camping/).
   Checkboxes -> one shopping list (model.js shoppingList), copy, print, and "put this menu in my meal planner" (?add=id,id,…).
   A page's own tool (lunchboxes.js, birthday.js, camping.js) can replace what the list is built from (O.cells) and the planner
   link (O.planHref), add to the printout (O.printExtra), and listen for changes (O.on).
   Page facts come from <script id="oc-data">: {slug, title, unit, def, half:[course ids served in half portions], r:{id:{n,e,s,c,al,...}}}.
   Choices are remembered in localStorage ("trb-occ-<slug>-v1") when the browser allows it; the page works without it. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('oc-page'); if (!root) return;
  var M = W.MealModel, C = W.MealCommon;
  var $ = function (s, r) { return (r || D).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var T = JSON.parse($('#oc-data').textContent), RI = T.r;
  var KEY = 'trb-occ-' + T.slug + '-v1', st = {};
  try { st = JSON.parse(W.localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  var O = { T: T, RI: RI, st: st, esc: esc, data: null, listeners: [], cells: null, planHref: null, printExtra: null, listTitle: null };
  O.save = function () { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } };
  var boxes = $$('#oc-pick input[type=checkbox]');
  if (st.menu && st.menu.length) boxes.forEach(function (b) { b.checked = st.menu.indexOf(b.value) >= 0; });
  var gEl = $('#oc-g'), halfEl = $('#oc-half');
  O.guests = st.g > 0 ? st.g : (+root.dataset.guests || 8);
  if (halfEl && typeof st.half === 'boolean') halfEl.checked = st.half;
  O.menu = function () { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }); };
  O.servingsFor = function (id) { var c = (RI[id] || {}).c; return halfEl && halfEl.checked && T.half && T.half.indexOf(c) >= 0 ? Math.max(1, Math.round(O.guests * 0.5 * 2) / 2) : O.guests; };
  O.on = function (fn) { O.listeners.push(fn); };
  var lastList = [];

  function defaultCells() { return O.menu().map(function (id) { return { r: id, x: O.servingsFor(id) }; }); }
  O.list = function () {
    if (!O.data) return [];
    var cells = (O.cells || defaultCells)().filter(function (c) { return O.data.builtin[c.r] && c.x > 0; });
    var plan = { days: 1, start: C.iso(new Date()), cells: { '0|dinner': cells }, guests: {}, slots: {} };
    return M.shoppingList(plan, [{ k: 'adult', n: 0, f: 1 }], O.data.builtin, O.data.cat, { sectionOrder: O.data.sectionOrder });
  };
  function shop() {
    var n = O.menu().length;
    $('#oc-shopsum').textContent = n ? '(' + (O.listTitle ? O.listTitle() : n + (n === 1 ? ' dish, ' : ' dishes, ') + O.guests + ' ' + (O.guests === 1 ? T.unit[0] : T.unit[1])) + ')' : '';
    if (!O.data) return;
    if (!n) { $('#oc-shop').innerHTML = '<p class="mp-empty">Check some dishes above to build the list.</p>'; lastList = []; return; }
    var list = O.list(); lastList = list;
    var h = '', sec = null;
    list.forEach(function (row) {
      if (row.section !== sec) { if (sec !== null) h += '</ul>'; sec = row.section; h += '<h3>' + esc(C.sectionName(O.data, sec)) + '</h3><ul>'; }
      h += '<li><b>' + esc(row.name) + '</b>' + (row.buy ? ' <span>' + esc(row.buy) + '</span>' : '') + (row.uses && row.uses.length ? '<small>' + esc(row.uses.join(', ')) + '</small>' : '') + '</li>';
    });
    $('#oc-shop').innerHTML = list.length ? '<div class="oc-shoplist">' + h + (sec !== null ? '</ul>' : '') + '</div>' : '<p class="mp-empty">Nothing to buy for this plan yet.</p>';
  }
  function planLink() {
    var ids = O.menu(), href = O.planHref ? O.planHref() : (ids.length ? '?add=' + ids.join(',') : '');
    $('#oc-plan').href = root.dataset.plan + (href || '');
  }
  O.refresh = function () {
    st.menu = O.menu(); st.g = O.guests; if (halfEl) st.half = halfEl.checked; O.save();
    if (gEl) gEl.textContent = O.guests;
    O.listeners.forEach(function (fn) { fn(); });
    planLink(); shop();
  };
  boxes.forEach(function (b) { b.addEventListener('change', O.refresh); });
  if (halfEl) halfEl.addEventListener('change', O.refresh);
  if ($('#oc-gm')) $('#oc-gm').addEventListener('click', function () { O.guests = Math.max(1, O.guests - 1); O.refresh(); });
  if ($('#oc-gp')) $('#oc-gp').addEventListener('click', function () { O.guests = Math.min(60, O.guests + 1); O.refresh(); });
  $('#oc-copy').addEventListener('click', function () {
    var txt = M.listText(lastList, T.title + ' shopping list'), btn = this, lab = btn.textContent;
    function done(ok) { btn.textContent = ok ? '✓ Copied' : 'Select the list and copy it'; setTimeout(function () { btn.textContent = lab; }, 2500); }
    if (W.navigator.clipboard && W.navigator.clipboard.writeText) W.navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); }); else done(false);
  });
  O.printout = function () {
    var byC = {}, order = [];
    O.menu().forEach(function (id) { var r = RI[id]; if (!r) return; if (!byC[r.c]) { byC[r.c] = []; order.push(r.c); } byC[r.c].push(r.e + ' ' + r.n); });
    var h = '<h1>' + esc(T.title) + '</h1><p>' + O.guests + ' ' + esc(O.guests === 1 ? T.unit[0] : T.unit[1]) + '</p>';
    h += '<h2>Menu</h2><ul class="oc-pm">' + order.map(function (c) { return byC[c].map(function (n) { return '<li>' + esc(n) + '</li>'; }).join(''); }).join('') + '</ul>';
    if (O.printExtra) h += O.printExtra();
    h += '<h2>Shopping list' + (O.listTitle ? ' (' + esc(O.listTitle()) + ')' : '') + '</h2>';
    var sec = null, sl = '';
    lastList.forEach(function (row) { if (row.section !== sec) { if (sec !== null) sl += '</ul>'; sec = row.section; sl += '<h3>' + esc(O.data ? C.sectionName(O.data, sec) : sec) + '</h3><ul>'; } sl += '<li>☐ ' + esc(row.name) + (row.buy ? ' — ' + esc(row.buy) : '') + '</li>'; });
    h += '<div class="oc-ps">' + sl + (sec !== null ? '</ul>' : '') + '</div><p>teddyrookbook.com/meal-prep/' + esc(T.slug) + '/</p>';
    $('#oc-printout').innerHTML = h;
  };
  $('#oc-print').addEventListener('click', function () { O.printout(); W.print(); });
  W.OcMenu = O;
  // start once every script has had a chance to hook in
  D.addEventListener('DOMContentLoaded', function () {
    O.refresh();
    C.load(root.dataset.src, function (err, d) {
      if (err) { $('#oc-shop').innerHTML = '<p class="mp-warn">The recipes didn’t load (' + esc(err.message) + '). Check your connection and reload the page.</p>'; return; }
      O.data = d; O.refresh();
    });
  });
})(window, document);
