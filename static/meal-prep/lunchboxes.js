/* Meal Prep: the Back-to-school lunchboxes page (/meal-prep/lunchboxes/), the 4-week rotation.
   From the lunches checked in the menu (occasions.js), lay out 20 school days: a main (role "main"), an extra (role "side")
   and a fresh food (from the "fresh" list). Mains don't repeat within a week when there are at least five; no main on two
   days in a row when there are at least two. Options: nut-free (no peanuts or tree nuts), hot thermos lunches on/off,
   vegetarian only. The picked week drives the shopping list (kids × that week's lunches) and the planner link
   (?day=lunch:<id>,snack:<id>|… five groups). A seeded shuffle keeps the month stable until you shuffle or swap. */
(function (W, D) {
  'use strict';
  var O = W.OcMenu; if (!O || !D.getElementById('lr-out')) return;
  var $ = function (s) { return D.querySelector(s); }, esc = O.esc, RI = O.RI, st = O.st, FRESH = O.T.fresh || [];
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], PACK = { cold: '🧊', hot: '🫙', shelf: '🎒' }, PACKT = { cold: 'needs two cold sources', hot: 'hot, in a preheated insulated jar', shelf: 'fine without a cold source' };
  var rb = D.getElementById('oc-page').dataset.rbase;
  if (!st.seed) st.seed = Math.floor(Math.random() * 1e9) + 1;
  if (!st.swaps) st.swaps = {};
  if (!(st.week >= 0 && st.week < 4)) st.week = 0;
  ['nut', 'hot', 'veg'].forEach(function (k) { var el = $('#lr-' + k); if (typeof st['o_' + k] === 'boolean') el.checked = st['o_' + k]; el.addEventListener('change', function () { st['o_' + k] = el.checked; O.refresh(); }); });

  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ok(id) {
    var r = RI[id]; if (!r) return false;
    if ($('#lr-nut').checked && (r.al.indexOf('peanuts') >= 0 || r.al.indexOf('tree-nuts') >= 0)) return false;
    if (!$('#lr-hot').checked && r.pk === 'hot') return false;
    if ($('#lr-veg').checked && r.veg === false) return false;
    return true;
  }
  // a sequence of n picks from pool: each pass is a fresh shuffle; avoid the same item twice in a row
  function seq(pool, n, r) {
    var out = [];
    while (out.length < n && pool.length) {
      var s = shuffle(pool, r);
      if (out.length && s.length > 1 && s[0] === out[out.length - 1]) { s.push(s.shift()); }
      out = out.concat(s);
    }
    return out.slice(0, n);
  }
  var month = [];
  O.rotation = function () {
    var picked = O.menu().filter(ok), mains = picked.filter(function (id) { return RI[id].ro === 'main'; }), sides = picked.filter(function (id) { return RI[id].ro === 'side'; });
    var r = rng(st.seed);
    // at most one hot lunch a week: they take morning work
    var hot = mains.filter(function (id) { return RI[id].pk === 'hot'; }), cold = mains.filter(function (id) { return RI[id].pk !== 'hot'; });
    var m = [];
    if (cold.length) {
      var cs = seq(cold, 20, r), hs = seq(hot, 4, r), ci = 0;
      for (var w = 0; w < 4; w++) for (var d = 0; d < 5; d++) m.push(hs.length && d === 2 + (w % 2) ? hs[w] : cs[ci++]);
    } else m = seq(hot, 20, r);
    var s = seq(sides, 20, r), off = Math.floor(r() * FRESH.length);
    month = [];
    for (var i = 0; i < 20; i++) {
      var sw = st.swaps[i] || {};
      month.push({ main: sw.main && ok(sw.main) ? sw.main : m[i] || null, side: sw.side && ok(sw.side) ? sw.side : s[i] || null, fresh: FRESH.length ? FRESH[(off + i * 7) % FRESH.length] : '' });
    }
    var warn = [];
    if (!mains.length) warn.push('Check at least one main lunch (a sandwich, wrap, bento, salad or thermos lunch) in the list above.');
    else if (mains.length < 5) warn.push('With fewer than five mains checked, some will repeat within a week. Check a few more for variety.');
    if (!sides.length && mains.length) warn.push('Check a muffin, snack or dip for the daily extra.');
    $('#lr-warn').hidden = !warn.length; $('#lr-warn').textContent = warn.join(' ');
    return month;
  };
  function swap(i, kind) {
    var cur = month[i][kind], pool = O.menu().filter(ok).filter(function (id) { return RI[id].ro === (kind === 'main' ? 'main' : 'side') && id !== cur; });
    if (!pool.length) return;
    var w = Math.floor(i / 5) * 5, used = month.slice(w, w + 5).map(function (x) { return x[kind]; });
    var fresh = pool.filter(function (id) { return used.indexOf(id) < 0; }), pickFrom = fresh.length ? fresh : pool;
    var nxt = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    st.swaps[i] = st.swaps[i] || {}; st.swaps[i][kind] = nxt; O.refresh();
    var b = D.querySelector('[data-sw="' + i + '|' + kind + '"]'); if (b) b.focus();
  }
  function item(id, label, i, kind) {
    if (!id) return '<div class="oc-item"><span class="oc-k">' + label + '</span><span>—</span></div>';
    var r = RI[id];
    return '<div class="oc-item"><span class="oc-k">' + label + '</span><span><a href="' + rb + id + '/">' + esc(r.e + ' ' + r.n) + '</a> <span class="oc-pack" role="img" title="' + PACKT[r.pk] + '" aria-label="' + PACKT[r.pk] + '">' + PACK[r.pk] + '</span></span>' +
      '<button type="button" class="oc-sw" data-sw="' + i + '|' + kind + '" aria-label="Swap ' + label.toLowerCase() + ' for week ' + (Math.floor(i / 5) + 1) + ', ' + DAYS[i % 5] + '">↻</button></div>';
  }
  function render() {
    O.rotation();
    var tabs = '';
    for (var w = 0; w < 4; w++) tabs += '<button type="button" data-wk="' + w + '" aria-pressed="' + (w === st.week) + '">Week ' + (w + 1) + '</button>';
    $('#lr-tabs').innerHTML = tabs;
    var h = '';
    for (w = 0; w < 4; w++) {
      h += '<h3 class="oc-wkh">Week ' + (w + 1) + (w === st.week ? ' <small class="hs-small">(shopping list and planner)</small>' : '') + '</h3><div class="oc-grid">';
      for (var d = 0; d < 5; d++) {
        var i = w * 5 + d, x = month[i];
        h += '<div class="oc-day"><h4>' + DAYS[d] + '</h4>' + item(x.main, 'Main', i, 'main') + item(x.side, 'Extra', i, 'side') + '<div class="oc-item"><span class="oc-k">Fresh</span><span>' + esc(x.fresh) + '</span></div></div>';
      }
      h += '</div>';
    }
    $('#lr-out').innerHTML = h;
    prep();
  }
  function prep() {
    var wk = month.slice(st.week * 5, st.week * 5 + 5), seen = {}, li = [];
    wk.forEach(function (x, d) {
      [x.main, x.side].forEach(function (id) {
        if (!id || seen[id]) return; seen[id] = 1; var r = RI[id];
        if (!r.pa) return;
        var when = !d || r.kd >= d + 2 ? 'Sunday' : DAYS[d - 1] + ' night';
        li.push('<li><b>' + when + ':</b> ' + esc(r.e + ' ' + r.n) + ' — ' + esc(r.pa) + '</li>');
      });
    });
    $('#lr-prep').innerHTML = li.length ? li.join('') : '<li>Nothing to make ahead this week.</li>';
  }
  D.getElementById('lr-out').addEventListener('click', function (e) { var b = e.target.closest('[data-sw]'); if (!b) return; var p = b.dataset.sw.split('|'); swap(+p[0], p[1]); });
  D.getElementById('lr-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-wk]'); if (!b) return; st.week = +b.dataset.wk; O.refresh(); var nb = D.querySelector('[data-wk="' + st.week + '"]'); if (nb) nb.focus(); });
  $('#lr-shuffle').addEventListener('click', function () { st.seed = Math.floor(Math.random() * 1e9) + 1; st.swaps = {}; O.refresh(); });

  // the shopping list and planner follow the picked week
  function week() { return month.slice(st.week * 5, st.week * 5 + 5); }
  O.cells = function () {
    var c = {};
    week().forEach(function (x) { [x.main, x.side].forEach(function (id) { if (id) c[id] = (c[id] || 0) + O.guests; }); });
    return Object.keys(c).map(function (id) { return { r: id, x: c[id] }; });
  };
  O.listTitle = function () { return 'week ' + (st.week + 1) + ', ' + O.guests + ' ' + (O.guests === 1 ? 'kid' : 'kids'); };
  O.planHref = function () {
    var g = week().map(function (x) { return [x.main ? 'lunch:' + x.main : '', x.side ? 'snack:' + x.side : ''].filter(Boolean).join(','); }).filter(Boolean);
    return g.length ? '?day=' + g.join('|') : '';
  };
  O.printExtra = function () {
    var h = '<h2>Four-week rotation</h2><table class="oc-ptab"><thead><tr><th></th>' + DAYS.map(function (d) { return '<th>' + d + '</th>'; }).join('') + '</tr></thead><tbody>';
    for (var w = 0; w < 4; w++) {
      h += '<tr><th>Week ' + (w + 1) + '</th>';
      for (var d = 0; d < 5; d++) { var x = month[w * 5 + d]; h += '<td>' + [x.main, x.side].filter(Boolean).map(function (id) { return esc(RI[id].n) + ' ' + PACK[RI[id].pk]; }).join('<br>') + '<br>' + esc(x.fresh) + '</td>'; }
      h += '</tr>';
    }
    return h + '</tbody></table><p>🧊 two cold sources · 🫙 preheated insulated jar, food heated to 165°F · 🎒 no cold source needed</p>';
  };
  O.on(render);
})(window, document);
