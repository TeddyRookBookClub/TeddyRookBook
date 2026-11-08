/* Meal Prep: the Camping and campfire cooking page (/meal-prep/camping/).
   1. Camp meal plan: nights, first and last meal -> every meal of the trip, filled from the dishes checked in the menu
      (occasions.js) by slot (collection.plan: breakfast, lunch, dinner, side, dessert, snack, drink). Dishes that need the
      cooler go early in the trip; from day 3 on, shelf-stable dishes are used when there are any. A fire ban drops campfire
      dishes. Each meal can be swapped (↻). The plan drives the shopping list (campers × every meal), the cooler list and the
      planner link (?day=breakfast:<id>,lunch:<id>,dinner:<id>,snack:<id>|… one group per day).
   2. Dutch-oven coals: diameter × 2 for about 325 °F, ± 2 per 25 °F, two-thirds on the lid for baking (Missouri Department
      of Conservation's rule of thumb). */
(function (W, D) {
  'use strict';
  var O = W.OcMenu; if (!O || !D.getElementById('cp-out')) return;
  var $ = function (s) { return D.querySelector(s); }, esc = O.esc, RI = O.RI, st = O.st;
  var rb = D.getElementById('oc-page').dataset.rbase;
  var HOW = { fire: '🔥', stove: '🍳', home: '🏠', nocook: '🥪' }, HOWT = { fire: 'campfire', stove: 'camp stove', home: 'made at home', nocook: 'no cooking' };
  var LAB = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', side: 'Side', dessert: 'Dessert', snack: 'Snack', drink: 'Drink' };
  var PSLOT = { breakfast: 'breakfast', drink: 'breakfast', lunch: 'lunch', dinner: 'dinner', side: 'dinner', dessert: 'snack', snack: 'snack' };
  if (!st.cswap) st.cswap = {};
  ['cp-nights', 'cp-first', 'cp-last'].forEach(function (id) { var el = $('#' + id), k = 'c_' + id.slice(3); if (st[k]) el.value = st[k]; el.addEventListener('change', function () { st[k] = el.value; O.refresh(); }); });
  var fireEl = $('#cp-fire'); if (typeof st.c_fire === 'boolean') fireEl.checked = st.c_fire;
  fireEl.addEventListener('change', function () { st.c_fire = fireEl.checked; O.refresh(); });

  var trip = [];
  function ok(id) { var r = RI[id]; return r && (fireEl.checked || r.how !== 'fire'); }
  function build() {
    var nights = +$('#cp-nights').value || 2, first = $('#cp-first').value, last = $('#cp-last').value, picked = O.menu().filter(ok);
    var pools = {}; picked.forEach(function (id) { var s = RI[id].sl; (pools[s] = pools[s] || []).push(id); });
    var count = {};
    function pick(slot, d) {
      var p = pools[slot] || []; if (!p.length) return null;
      var ice = p.filter(function (id) { return RI[id].ice; }), dry = p.filter(function (id) { return !RI[id].ice; });
      var cand = d >= 2 && dry.length ? dry : ice.length ? ice.concat(dry) : dry, k = slot + (cand === dry ? 'd' : 'i');
      count[k] = (count[k] || 0) + 1; return cand[(count[k] - 1) % cand.length];
    }
    trip = [];
    for (var d = 0; d <= nights; d++) {
      var slots = [];
      if (d === 0) slots = first === 'lunch' ? ['lunch', 'snack', 'dinner', 'side', 'dessert'] : ['dinner', 'side', 'dessert'];
      else if (d === nights) slots = last === 'lunch' ? ['breakfast', 'drink', 'snack', 'lunch'] : ['breakfast', 'drink'];
      else slots = ['breakfast', 'drink', 'lunch', 'snack', 'dinner', 'side', 'dessert'];
      var meals = [];
      slots.forEach(function (s) { var key = d + '|' + s, sw = st.cswap[key], id = sw && ok(sw) && O.menu().indexOf(sw) >= 0 ? sw : pick(s, d); if (id) meals.push({ s: s, id: id, key: key }); });
      trip.push({ d: d, meals: meals, label: d === 0 ? 'Arrival day' : d === nights ? 'Last day' : 'Day ' + (d + 1) });
    }
    var warn = [];
    ['breakfast', 'lunch', 'dinner'].forEach(function (s) { if (!(pools[s] || []).length && trip.some(function (t) { return t.meals.length && needs(t.d, s, nights, first, last); })) warn.push('No ' + s + ' is checked' + (fireEl.checked ? '' : ' that works without a campfire') + '.'); });
    if (nights >= 2 && trip.some(function (t) { return t.d >= 2 && t.meals.some(function (m) { return RI[m.id].ice; }); })) warn.push('Some meals on day 3 or later need the cooler. Freeze them solid at home, plan to buy ice, or check a few shelf-stable dishes.');
    $('#cp-warn').hidden = !warn.length; $('#cp-warn').textContent = warn.join(' ');
  }
  function needs(d, s, nights, first, last) {
    if (d === 0) return s === 'dinner' || (first === 'lunch' && s === 'lunch');
    if (d === nights) return s === 'breakfast' || (last === 'lunch' && s === 'lunch');
    return true;
  }
  function render() {
    build();
    var h = '';
    trip.forEach(function (t) {
      h += '<div class="oc-day"><h3>' + esc(t.label) + '</h3>';
      if (!t.meals.length) h += '<p class="hs-small">Nothing checked for these meals.</p>';
      t.meals.forEach(function (m) {
        var r = RI[m.id];
        h += '<div class="oc-item"><span class="oc-k">' + LAB[m.s] + '</span><span><a href="' + rb + m.id + '/">' + esc(r.e + ' ' + r.n) + '</a> <span class="oc-pack" role="img" title="' + HOWT[r.how] + '" aria-label="' + HOWT[r.how] + '">' + HOW[r.how] + '</span>' +
          (r.ice ? ' <span class="oc-pack" role="img" title="rides in the cooler" aria-label="rides in the cooler">🧊</span>' : '') + '</span>' +
          '<button type="button" class="oc-sw" data-key="' + m.key + '" data-s="' + m.s + '" aria-label="Swap ' + LAB[m.s].toLowerCase() + ', ' + esc(t.label.toLowerCase()) + '">↻</button></div>';
      });
      h += '</div>';
    });
    $('#cp-out').innerHTML = h;
    // cooler list: what rides in the cooler, by the day it's eaten (pack the last day's food at the bottom)
    var rows = [];
    trip.forEach(function (t) { var ice = t.meals.filter(function (m) { return RI[m.id].ice; }).map(function (m) { return RI[m.id].e + ' ' + RI[m.id].n; }); if (ice.length) rows.push('<li><b>' + esc(t.label) + ':</b> ' + esc(ice.join(', ')) + '</li>'); });
    $('#cp-cool').innerHTML = rows.length ? '<ul>' + rows.join('') + '</ul><p class="hs-small">Pack in reverse order: the last meals at the bottom (frozen, if they can be), the first night’s dinner on top, raw meat sealed and below ready-to-eat food. Drinks in a separate cooler.</p>' : '<p>Nothing on this plan needs the cooler.</p>';
  }
  D.getElementById('cp-out').addEventListener('click', function (e) {
    var b = e.target.closest('[data-key]'); if (!b) return;
    var s = b.dataset.s, cur = (trip.reduce(function (a, t) { return a.concat(t.meals); }, []).filter(function (m) { return m.key === b.dataset.key; })[0] || {}).id;
    var pool = O.menu().filter(ok).filter(function (id) { return RI[id].sl === s; });
    if (pool.length < 2) return;
    st.cswap[b.dataset.key] = pool[(pool.indexOf(cur) + 1) % pool.length]; O.refresh();
    var nb = D.querySelector('[data-key="' + b.dataset.key + '"]'); if (nb) nb.focus();
  });
  O.cells = function () {
    var c = {};
    trip.forEach(function (t) { t.meals.forEach(function (m) { c[m.id] = (c[m.id] || 0) + O.guests; }); });
    return Object.keys(c).map(function (id) { return { r: id, x: c[id] }; });
  };
  O.listTitle = function () { var n = +$('#cp-nights').value || 2; return n + (n === 1 ? ' night, ' : ' nights, ') + O.guests + (O.guests === 1 ? ' camper' : ' campers'); };
  O.planHref = function () {
    var g = trip.map(function (t) {
      var seen = {}, parts = [];
      t.meals.forEach(function (m) { var ps = PSLOT[m.s]; if (seen[ps]) return; seen[ps] = 1; parts.push(ps + ':' + m.id); });
      return parts.join(',');
    }).filter(Boolean);
    return g.length ? '?day=' + g.join('|') : '';
  };
  O.printExtra = function () {
    var h = '<h2>Trip plan</h2><ol class="oc-pt">';
    trip.forEach(function (t) { h += '<li class="oc-dayh">' + esc(t.label) + '</li>'; t.meals.forEach(function (m) { var r = RI[m.id]; h += '<li><b>' + LAB[m.s] + ':</b> ' + esc(r.n) + ' ' + HOW[r.how] + (r.ice ? ' 🧊' : '') + '</li>'; }); });
    h += '</ol><h2>Cooler</h2>' + $('#cp-cool').innerHTML;
    return h + '<p>Ground beef 160°F · chicken 165°F · reheated food 165°F. Cooler at 40°F or below; perishables out no more than 2 hours (1 hour above 90°F). Never cook inside a tent or camper.</p>';
  };
  O.on(render);

  // ---------- Dutch-oven coals ----------
  function coals() {
    var size = +$('#do-size').value, T = +$('#do-temp').value, total = size * 2 + Math.round((T - 325) / 25) * 2, top = Math.round(total * 2 / 3), bot = total - top;
    $('#do-out').innerHTML = '<p><span class="oc-big">' + total + ' briquettes</span></p><p><b>' + top + '</b> on the lid and <b>' + bot + '</b> underneath, for baking at about ' + T + '°F in a ' + size + '-inch oven.</p><p class="hs-small">' + size + ' × 2 = ' + (size * 2) + ' for about 325°F, ' + (T >= 325 ? 'plus ' : 'minus ') + Math.abs(total - size * 2) + ' for ' + T + '°F.</p>';
    function row(n, y, x0, x1) { var s = ''; for (var i = 0; i < n; i++) { var x = n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1); s += '<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="5.5" class="oc-coal"/>'; } return s; }
    var t1 = Math.ceil(top / 2), t2 = top - t1;
    D.getElementById('do-top').innerHTML = row(t1, 50, 78, 242) + row(t2, 38, 90, 230);
    D.getElementById('do-bot').innerHTML = row(bot, 176, 100, 220);
  }
  ['do-size', 'do-temp'].forEach(function (id) { $('#' + id).addEventListener('change', coals); });
  coals();
})(window, document);
