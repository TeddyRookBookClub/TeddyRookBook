/* Meal Prep: the Birthday parties page (/meal-prep/birthday/), the party planner.
   1. How much to make: cake servings (guests + 10%), pizza slices (2 per child, 3 per grown-up, 8 to a large pizza), drinks
      (about 1 cup per guest per hour) and ice (about 1 lb per guest). Planning guides, shown as such.
   2. Cake calculator: the chosen cake's servings (generous or party-size slices) -> how many batches, and buttercream batches.
   3. Countdown: party date and time -> invitations, shopping, each checked dish's make-ahead task (collection.day), oven dishes
      on the day in one oven (latest first), food out, cake, and USDA's 2-hour limit.
   Uses the menu and guest count from occasions.js (window.OcMenu). */
(function (W, D) {
  'use strict';
  var O = W.OcMenu; if (!O || !D.getElementById('bp-out')) return;
  var $ = function (s) { return D.querySelector(s); }, esc = O.esc, RI = O.RI, st = O.st, CAKES = O.T.cakes, DAY = O.T.day;
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MONS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function clock(d) { var h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + pad(m) + (h < 12 ? ' a.m.' : ' p.m.'); }
  function dayName(d) { return DAYS[d.getDay()] + ', ' + MONS[d.getMonth()] + ' ' + d.getDate(); }
  function addMin(d, m) { return new Date(d.getTime() + m * 60000); }
  function at(base, daysBefore, h, m) { return new Date(base.getFullYear(), base.getMonth(), base.getDate() - daysBefore, h, m || 0); }
  function dur(min) { min = Math.round(min); if (min < 60) return min + ' min'; var h = Math.floor(min / 60), m = min % 60; return h + ' hr' + (m ? ' ' + m + ' min' : ''); }
  ['bp-date', 'bp-time', 'bp-len', 'bp-adults', 'bp-cake', 'bp-slice'].forEach(function (id) {
    var el = $('#' + id), k = 'p_' + id.slice(3);
    if (st[k] != null && st[k] !== '') el.value = st[k];
    el.addEventListener('change', function () { st[k] = el.value; O.save(); run(); });
    if (el.type === 'number') el.addEventListener('input', function () { st[k] = el.value; run(); });
  });
  if (!$('#bp-date').value) { var d0 = new Date(); d0.setDate(d0.getDate() + ((6 - d0.getDay() + 7) % 7 || 7) + 7); $('#bp-date').value = isoDate(d0); } // a Saturday about two weeks out
  // the first cake checked in the menu picks the calculator's cake, until you choose one yourself
  O.on(function () { var c = O.menu().filter(function (id) { return CAKES.some(function (k) { return k.id === id; }); })[0]; if (c && !st.p_cake) $('#bp-cake').value = c; run(); });

  function run() {
    var G = O.guests, A = Math.min(G, Math.max(0, parseInt($('#bp-adults').value, 10) || 0)), K = G - A, len = +$('#bp-len').value || 120;
    // 1. amounts
    var menu = O.menu(), hasPizza = menu.some(function (id) { return /pizza/.test(id); });
    var cakeNeed = Math.ceil(G * 1.1), slices = K * 2 + A * 3, pies = Math.ceil(slices / 8), cups = Math.ceil(G * len / 60), ice = G;
    var h = '<h3>How much to make</h3><p><span class="oc-big">' + cakeNeed + '</span> servings of cake (' + G + ' guests and a few extra)</p>';
    if (hasPizza) h += '<p><b>Pizza:</b> about ' + slices + ' slices (2 per child, 3 per grown-up), or ' + pies + ' large ' + (pies === 1 ? 'pizza' : 'pizzas') + ' cut in 8. The mini pizzas count as 1 slice each half.</p>';
    h += '<p><b>Drinks:</b> about ' + cups + ' cups (' + Math.ceil(cups / 16) + (Math.ceil(cups / 16) === 1 ? ' gallon' : ' gallons') + ') for ' + dur(len) + ': roughly a cup per guest per hour, more on a hot day.</p>';
    h += '<p><b>Ice:</b> about ' + ice + ' lb, for drinks and to keep cold dishes cold.</p>';
    h += '<p><b>Fruit and vegetable cups:</b> ' + G + ', one per guest.</p><p class="hs-small">' + K + (K === 1 ? ' child' : ' children') + ' and ' + A + (A === 1 ? ' grown-up' : ' grown-ups') + '. Change the total with the Guests counter in the menu.</p>';
    $('#bp-amounts').innerHTML = h;
    // 2. cake calculator
    var ck = CAKES.filter(function (c) { return c.id === $('#bp-cake').value; })[0] || CAKES[0], serves = ck.serves[+$('#bp-slice').value] || ck.serves[0], n = Math.ceil(cakeNeed / serves), r = RI[ck.id];
    var fb = ck.frost * n, frostTxt = ck.frost ? 'Frosting: ' + (fb === Math.round(fb) ? fb : fb.toFixed(1)) + (fb === 1 ? ' batch' : ' batches') + ' of buttercream or cream cheese frosting.' : (ck.id === 'chocolate-sheet-cake' ? 'Its fudge frosting is part of the recipe.' : '');
    if (ck.id === 'egg-free-chocolate-cake') frostTxt = 'Dust it with powdered sugar, or frost it with a dairy-free buttercream (about ½ batch per cake).';
    $('#bp-cakeout').innerHTML = '<h3>The cake</h3><p><span class="oc-big">' + n + (n === 1 ? ' batch' : ' batches') + '</span> of ' + esc(r ? r.n : ck.id) + '</p><p>One batch makes ' + esc(ck.label) + ' and serves about ' + serves + '. ' + frostTxt + '</p>' +
      (n > 1 ? '<p class="hs-small">Bake one batch at a time unless your oven fits all the pans with room for air to move. For a big crowd, a half-sheet cake serves up to 48 small squares.</p>' : '');
    // 3. countdown
    var dv = $('#bp-date').value.split('-'), tv = ($('#bp-time').value || '14:00').split(':');
    var P = new Date(+dv[0], +dv[1] - 1, +dv[2], +tv[0] || 14, +tv[1] || 0);
    if (isNaN(P)) { $('#bp-out').innerHTML = '<li>Enter the party date and time.</li>'; return; }
    var steps = [];
    function add(t, txt, k) { steps.push({ t: t, txt: txt, k: k || '' }); }
    add(at(P, 14, 10), 'Send invitations. Ask each family about food allergies, so you can plan a cake and snacks everyone can eat.', 'plan');
    add(at(P, 7, 10), 'Settle the menu and print the shopping list. Check you have the pans for ' + esc(ck.label) + '.', 'plan');
    add(at(P, 3, 10), 'Shop for everything except fresh fruit and vegetables. Make room in the refrigerator and freezer.', 'plan');
    add(at(P, 1, 10), 'Buy the fresh fruit, vegetables and ice.', 'plan');
    var serve = addMin(P, len >= 120 ? 30 : 15), oven = [], frostDay = false;
    menu.forEach(function (id) {
      var d = DAY[id], rr = RI[id]; if (!d || !rr) return;
      if (d.ahead > 0) add(at(P, Math.min(d.ahead, 5), 15), rr.e + ' ' + rr.n + ': ' + d.task + '.', 'ahead');
      else if (d.task) add(addMin(P, -120), rr.e + ' ' + rr.n + ': ' + d.task + '.', 'ahead');
      if (d.oven) oven.push({ id: id, temp: d.oven[0], min: d.oven[1], r: rr });
      if (/layer-cake|sheet-cake|cupcakes/.test(id) && id !== 'chocolate-sheet-cake') frostDay = true;
    });
    if (frostDay) add(addMin(P, -240), 'Frost and decorate the cake' + (menu.some(function (id) { return /cupcakes/.test(id); }) ? ' and cupcakes' : '') + '. Keep a cream cheese frosted cake in the refrigerator.', 'bake');
    // oven dishes back to back, latest first, finishing at serving time
    // lowest temperature first, so the oven only ever heats up; the last dish comes out at serving time
    oven.sort(function (a, b) { return a.temp - b.temp || b.min - a.min; });
    var end = serve;
    oven.slice().reverse().forEach(function (o, i, arr) {
      var s = addMin(end, -o.min), nx = arr[i - 1];
      add(s, o.r.e + ' ' + o.r.n + ' into the oven at ' + o.temp + '°F, about ' + dur(o.min) + '.' + (nx && nx.temp !== o.temp ? ' When it comes out, turn the oven up to ' + nx.temp + '°F.' : ''), 'bake'); end = s;
    });
    if (oven.length) add(addMin(end, -20), 'Heat the oven to ' + oven[0].temp + '°F for the party food.', 'bake');
    add(addMin(P, -60), 'Set the table with small platters, serving spoons and labels. Fill bowls with ice for cold dishes and keep them in the refrigerator until guests arrive.', 'plan');
    add(P, 'Guests arrive. 🎉', 'party');
    add(serve, 'Food out. Note the time: everything comes off the table within 2 hours (USDA).', 'party');
    var cakeT = addMin(P, Math.max(45, len - 45));
    add(cakeT, 'Cake time. A grown-up lights the candles; keep hair and decorations back. Blow out, take off the candles, then slice.', 'party');
    add(addMin(serve, 120), 'Two hours since the food came out: refrigerate leftovers in shallow containers, or throw them away (USDA).', 'safe');
    steps.sort(function (a, b) { return a.t - b.t; });
    var out = '', day = '';
    steps.forEach(function (s) { var dn = dayName(s.t); if (dn !== day) { out += '<li class="oc-dayh">' + esc(dn) + '</li>'; day = dn; } out += '<li class="oc-s ' + s.k + '"><time>' + esc(clock(s.t)) + '</time><span>' + s.txt + '</span></li>'; });
    $('#bp-out').innerHTML = out;
    O.printExtra = function () {
      var pd = '', p = '<h2>Countdown</h2><ol class="oc-pt">';
      steps.forEach(function (s) { var dn = dayName(s.t); if (dn !== pd) { p += '<li class="oc-dayh">' + esc(dn) + '</li>'; pd = dn; } p += '<li><b>' + esc(clock(s.t)) + '</b> ' + s.txt + '</li>'; });
      return '<h2>The cake</h2><p>' + n + ' × ' + esc(r ? r.n : '') + ' (' + cakeNeed + ' servings). ' + frostTxt + '</p>' + p + '</ol>';
    };
  }
})(window, document);
