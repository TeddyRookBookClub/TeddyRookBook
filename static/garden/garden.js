/* Food Garden Planner: suggests crops for a space and climate, estimates harvest and calories, lays out a rotation,
   and sizes a small flock or apiary. All figures come from data/garden/ (extension yield tables, USDA FoodData Central). */
(function (W, D) {
  'use strict';
  var DATA = JSON.parse(D.getElementById('gd-data').textContent), C = DATA.crops, BY = {};
  C.forEach(function (c) { BY[c.k] = c; });
  var $ = function (id) { return D.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function n0(x) { return Math.round(x).toLocaleString('en-US'); }
  function lbs(x) { return x >= 100 ? n0(x) : x >= 10 ? n0(x) : (Math.round(x * 10) / 10).toString(); }
  var KEY = 'trb-garden-v1';
  var st = { where: 'garden', sqft: 20, w: 5, l: 10, acres: 1, zone: 6, people: 2, goal: 'balanced', peren: true, trees: false, lights: false, must: ['potatoes', 'sweet_potatoes', 'carrots', 'strawberries'] };
  try { var sv = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (sv) for (var k in sv) st[k] = sv[k]; } catch (e) { }
  function save() { try { W.localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } }

  // ---------- form ----------
  D.querySelectorAll('input[name=where]').forEach(function (r) { r.checked = r.value === st.where; r.addEventListener('change', function () { st.where = r.value; sync(); }); });
  var F = { 'gd-sqft': 'sqft', 'gd-w': 'w', 'gd-l': 'l', 'gd-acres': 'acres', 'gd-zone': 'zone', 'gd-people': 'people', 'gd-goal': 'goal' };
  Object.keys(F).forEach(function (id) { var el = $(id); el.value = st[F[id]]; el.addEventListener('input', function () { st[F[id]] = el.tagName === 'SELECT' && F[id] === 'goal' ? el.value : +el.value; sync(); }); el.addEventListener('change', function () { st[F[id]] = F[id] === 'goal' ? el.value : +el.value; sync(); }); });
  [['gd-peren', 'peren'], ['gd-trees', 'trees'], ['gd-lights', 'lights']].forEach(function (p) { var el = $(p[0]); el.checked = !!st[p[1]]; el.addEventListener('change', function () { st[p[1]] = el.checked; sync(); }); });
  var POPULAR = ['potatoes', 'sweet_potatoes', 'carrots', 'tomatoes', 'cherry_tomatoes', 'peppers', 'garlic', 'onions', 'dry_beans', 'snap_beans', 'peas', 'winter_squash', 'kale', 'lettuce', 'spinach', 'broccoli', 'cucumbers', 'sweet_corn', 'strawberries', 'blueberries', 'raspberries_blackberries', 'culinary_herbs', 'apple'];
  function chips() {
    var all = POPULAR.concat(C.map(function (c) { return c.k; }).filter(function (k) { return POPULAR.indexOf(k) < 0; }));
    $('gd-must').innerHTML = all.map(function (k, i) { var c = BY[k]; return '<button type="button" class="gd-chip' + (i >= POPULAR.length ? ' more' : '') + '" data-k="' + k + '" aria-pressed="' + (st.must.indexOf(k) >= 0) + '">' + esc(c.n) + '</button>'; }).join('') + '<button type="button" class="gd-chip gd-showmore" id="gd-more">+ more crops</button>';
  }
  chips();
  $('gd-must').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'gd-more') { $('gd-must').classList.toggle('all'); b.textContent = $('gd-must').classList.contains('all') ? '− fewer' : '+ more crops'; return; }
    var k = b.dataset.k, i = st.must.indexOf(k); if (i >= 0) st.must.splice(i, 1); else st.must.push(k);
    b.setAttribute('aria-pressed', i < 0); sync();
  });

  // ---------- planning ----------
  var GOALS = { // area shares for staples (filling, calorie-dense), vegetables (vitamins, minerals), fruit
    balanced: { s: 0.45, v: 0.40, f: 0.15, wk: 0.5, wn: 0.5 },
    calories: { s: 0.70, v: 0.20, f: 0.10, wk: 0.85, wn: 0.15 },
    nutrition: { s: 0.30, v: 0.55, f: 0.15, wk: 0.25, wn: 0.75 },
    money: { s: 0.15, v: 0.60, f: 0.25, wk: 0.2, wn: 0.4, wv: 0.9 },
    easy: { s: 0.40, v: 0.45, f: 0.15, wk: 0.4, wn: 0.4, we: 0.6 }
  };
  function area() {
    if (st.where === 'farm') return Math.max(0.25, st.acres || 1) * 43560;
    if (st.where === 'garden') return Math.max(1, (st.w || 1) * (st.l || 1));
    return Math.max(1, st.sqft || 1);
  }
  function fits(c, why) {
    var w = st.where, z = +st.zone;
    if (c.t === 'tree' && !st.trees) return false;
    if ((c.t === 'perennial' || c.t === 'bush' || c.t === 'vine') && !st.peren) return false;
    if (w === 'indoor') return c.ind === 'good' || (c.ind === 'possible with grow lights' && st.lights);
    if (c.k === 'microgreens') return false;
    if (w === 'balcony' && c.con !== true) return false;
    if (c.zmin && z < c.zmin) return false;
    if (c.zmax && z > c.zmax) return false;
    if (c.lw && z < c.lw - 1) return false;
    return true;
  }
  function warn(c) {
    var z = +st.zone, out = [];
    if (st.where !== 'indoor') {
      if (c.lw && z < c.lw) out.push('needs a long warm season: choose early varieties');
      if (c.se === 'cool' && z >= 9) out.push('grow in fall and winter where summers are hot');
      if (c.t === 'tree' && (c.k === 'apple' || c.k === 'pear' || c.k === 'plum_cherry' || c.k === 'peach') && z >= 9) out.push('choose low-chill varieties for warm winters');
      if (c.k === 'blueberries' && z >= 8) out.push('choose southern highbush or rabbiteye types');
      if (c.k === 'blueberries') out.push('needs acid soil');
    }
    return out;
  }
  var AUTO_SKIP = ['jerusalem_artichokes']; // spreads hard to remove; only when picked
  function ycal(c) { return c.kc != null ? c.kc / 100 : 0; } // kcal per sq ft
  function nut(c) { return (c.nut.length + (c.fib >= 3 ? 0.5 : 0) + (c.pro >= 5 ? 0.5 : 0)) * (c.y || 0) / 100; }
  function plan() {
    var A = area(), w = st.where, G = GOALS[st.goal] || GOALS.balanced;
    var planted = w === 'farm' ? A * 0.8 : A; // leave room for paths and equipment on a farm
    var pool = C.filter(function (c) { return fits(c); });
    var mk = 0, mn = 0; pool.forEach(function (c) { mk = Math.max(mk, ycal(c)); mn = Math.max(mn, nut(c)); });
    pool.forEach(function (c) {
      var s = (G.wk * (mk ? ycal(c) / mk : 0)) + (G.wn * (mn ? nut(c) / mn : 0));
      if (G.wv && c.val) s += G.wv * 0.5; if (G.we && c.dif === 'easy') s += G.we * 0.5;
      if (c.dif === 'easy') s += 0.05; if (c.y == null) s *= w === 'indoor' ? 0.7 : 0.15;
      c._s = s;
    });
    var count = w === 'indoor' ? (A < 6 ? 2 : A < 15 ? 3 : 4) : w === 'balcony' ? (A < 20 ? 3 : A < 60 ? 4 : 6) : w === 'farm' ? 10 : (A < 60 ? 4 : A < 150 ? 6 : A < 400 ? 8 : A < 1500 ? 11 : 14);
    var shares = w === 'indoor' ? { s: 0, v: 1, f: 0 } : { s: G.s, v: G.v, f: G.f };
    var cats = { s: pool.filter(function (c) { return c.cat === 'staple'; }), v: pool.filter(function (c) { return c.cat === 'veg'; }), f: pool.filter(function (c) { return c.cat === 'fruit'; }) };
    if (w === 'indoor') { cats.v = cats.v.concat(cats.f, cats.s); cats.s = []; cats.f = []; }
    // drop empty categories and share their area out
    var tot = 0; ['s', 'v', 'f'].forEach(function (k) { if (!cats[k].length) shares[k] = 0; tot += shares[k]; });
    ['s', 'v', 'f'].forEach(function (k) { shares[k] = tot ? shares[k] / tot : 0; });
    var mustIn = st.must.map(function (k) { return BY[k]; }).filter(function (c) { return c && fits(c); });
    var mustOut = st.must.map(function (k) { return BY[k]; }).filter(function (c) { return c && !fits(c); });
    var picks = [];
    ['s', 'v', 'f'].forEach(function (k) {
      if (!shares[k]) return;
      var want = Math.max(1, Math.round(count * shares[k])), chosen = mustIn.filter(function (c) { return (w === 'indoor' ? true : c.cat === ({ s: 'staple', v: 'veg', f: 'fruit' })[k]) && cats[k].indexOf(c) >= 0; });
      var rest = cats[k].filter(function (c) { return chosen.indexOf(c) < 0 && AUTO_SKIP.indexOf(c.k) < 0; });
      while (chosen.length < want && rest.length) {
        rest.sort(function (a, b) {
          function pen(c) { var same = chosen.filter(function (x) { return x.g === c.g && c.g !== 'perennial'; }).length; return c._s * Math.pow(0.55, same); }
          return pen(b) - pen(a);
        });
        chosen.push(rest.shift());
      }
      var catArea = planted * shares[k];
      // split: crops with a yield share evenly; herbs/microgreens without one get a small fixed patch
      var withY = chosen.filter(function (c) { return c.y != null || c.t === 'tree'; }), noY = chosen.filter(function (c) { return c.y == null && c.t !== 'tree'; });
      var small = Math.min(catArea * 0.15, w === 'farm' ? 400 : Math.max(2, catArea * 0.1));
      noY.forEach(function (c) { picks.push({ c: c, a: small }); catArea -= small; });
      var eachA = withY.length ? catArea / withY.length : 0;
      withY.forEach(function (c) {
        var a = eachA;
        if (c.t === 'tree') { var per = c.sq || 100, nt = Math.floor(a / per); if (nt < 1) { if (planted >= per * 2) nt = 1; else return; } a = nt * per; picks.push({ c: c, a: a, trees: nt }); return; }
        picks.push({ c: c, a: a });
      });
    });
    // tidy the areas: rescale to the planted area
    var used = picks.reduce(function (s, p) { return s + p.a; }, 0);
    if (used > planted && used > 0) { var f = planted / used; picks.forEach(function (p) { if (!p.trees) p.a *= f; }); }
    // on big plots, don't plant more of a vegetable or berry than the household can use; move the rest to staples
    var people = +st.people || 1, freed = 0, spare = 0;
    picks.forEach(function (p) {
      if (p.trees || p.c.cat === 'staple' || w === 'indoor') return;
      var cap = people * (p.c.cat === 'fruit' ? 80 : 60);
      if (p.a > cap) { freed += p.a - cap; p.a = cap; }
    });
    if (freed) {
      var st8 = picks.filter(function (p) { return p.c.cat === 'staple' && p.c.kc; });
      var need = people * 2000 * 365, have = st8.reduce(function (s, p) { return s + p.c.kc * p.a / 100; }, 0);
      st8.forEach(function (p) { var room = Math.max(0, (need - have) / st8.length) / (p.c.kc / 100), add = Math.min(room, freed / st8.length); p.a += add; spare -= add; });
      spare += freed;
    }
    picks.forEach(function (p) {
      var c = p.c;
      p.lb = c.y != null ? c.y * p.a / 100 : null;
      p.lbr = c.yr && c.y != null ? [c.yr[0] * p.a / 100, c.yr[1] * p.a / 100] : null;
      p.kcal = c.kc != null ? c.kc * p.a / 100 : null;
      p.plants = c.sq ? Math.max(1, Math.round(p.a / c.sq)) : null;
      p.warn = warn(c);
    });
    return { A: A, planted: planted, picks: picks, mustOut: mustOut, spare: spare > 1 ? spare : 0 };
  }

  // ---------- output ----------
  function space(a) {
    if (st.where === 'farm') { var ac = a / 43560; return ac >= 0.1 ? (Math.round(ac * 100) / 100) + ' acre' + (ac >= 1.005 ? 's' : '') : n0(a) + ' sq ft'; }
    return (a < 10 ? Math.round(a * 10) / 10 : n0(a)) + ' sq ft';
  }
  var ROT = [['legume'], ['root', 'allium'], ['nightshade', 'cucurbit', 'grass'], ['brassica', 'leafy-other']];
  var ROTN = ['Beans and peas', 'Roots and onions', 'Fruiting crops and corn', 'Cabbage family and leafy greens'];
  function render() {
    var P = plan(), w = st.where, people = +st.people || 1, h = '';
    var kcal = 0, lb = 0, anyK = false; P.picks.forEach(function (p) { if (p.kcal) { kcal += p.kcal; anyK = true; } if (p.lb) lb += p.lb; });
    var days = kcal / (people * 2000);
    h += '<h2><span class="pl-n">3</span> Suggested plan</h2>';
    h += '<div class="gd-sum">' +
      '<div><b>' + space(P.A) + '</b><span>' + (w === 'farm' ? 'about 80% planted, the rest paths and access' : 'growing space') + '</span></div>' +
      '<div><b>' + P.picks.length + '</b><span>crops</span></div>' +
      (lb ? '<div><b>' + lbs(lb) + ' lb</b><span>rough harvest a season</span></div>' : '') +
      (anyK ? '<div><b>' + n0(kcal) + '</b><span>calories, about ' + (days >= 1 ? n0(days) + ' days' : 'a fraction of a day') + ' of food energy for ' + people + ' ' + (people > 1 ? 'people' : 'person') + ' at 2,000 a day</span></div>' : '') +
      '</div>';
    if (w === 'indoor') h += '<p class="gd-note">Indoors, plants give you fresh greens, herbs and flavor more than calories. ' + (st.lights ? 'With grow lights you can try fruiting crops too.' : 'With grow lights (tick the box above) you can try a few fruiting crops.') + '</p>';
    else if (anyK && days < 30) h += '<p class="gd-note">Most home gardens supply vitamins, minerals, fiber and freshness more than total calories. Potatoes, sweet potatoes, winter squash, dry beans and corn give the most food energy for the space.</p>';
    if (P.spare) h += '<p class="gd-note">That leaves about <b>' + space(P.spare) + '</b> beyond what ' + people + ' ' + (people > 1 ? 'people' : 'person') + ' would eat of these crops: room for a cover crop, pasture for chickens, more to store, share or sell, or simply less to weed.</p>';
    if (P.mustOut.length) h += '<p class="gd-note">Not included here: ' + P.mustOut.map(function (c) { return esc(c.n) + ' (' + whyNot(c) + ')'; }).join('; ') + '.</p>';
    h += '<div class="gd-tablewrap"><table class="hs-table gd-plan"><thead><tr><th>Crop</th><th>Space</th><th>Plants</th><th>Rough harvest</th><th>Calories</th><th>Rich in</th><th>Plant</th><th>Ready in</th></tr></thead><tbody>';
    P.picks.sort(function (a, b) { return b.a - a.a; }).forEach(function (p) {
      var c = p.c;
      h += '<tr><td><b>' + esc(c.n) + '</b>' + (st.must.indexOf(c.k) >= 0 ? ' <span class="gd-tag">your pick</span>' : '') + (p.warn.length ? '<small class="gd-warn">' + esc(p.warn.join('; ')) + '</small>' : '') + '</td>' +
        '<td data-l="Space">' + space(p.a) + '</td>' +
        '<td data-l="Plants">' + (p.trees ? p.trees + ' tree' + (p.trees > 1 ? 's' : '') : p.plants ? '≈ ' + n0(p.plants) : '—') + '</td>' +
        '<td data-l="Rough harvest">' + (p.lb != null ? (p.lbr && lbs(p.lbr[0]) !== lbs(p.lbr[1]) ? lbs(p.lbr[0]) + '–' + lbs(p.lbr[1]) : lbs(p.lb)) + ' lb' + (p.trees ? ' a year once mature' : '') : '—') + '</td>' +
        '<td data-l="Calories">' + (p.kcal != null ? n0(p.kcal) : '—') + '</td>' +
        '<td data-l="Rich in">' + esc(c.nut.map(function (x) { return x.replace(/ \d+% DV$/, ''); }).join(', ') || (c.fib >= 3 ? 'fiber' : c.pro >= 5 ? 'protein' : '—')) + '</td>' +
        '<td data-l="Plant">' + esc(when(c)) + '</td>' +
        '<td data-l="Ready in">' + (c.yrs && c.yrs[0] ? c.yrs[0] + (c.yrs[1] && c.yrs[1] !== c.yrs[0] ? '–' + c.yrs[1] : '') + ' years' : c.dh && c.dh[0] ? c.dh[0] + (c.dh[1] && c.dh[1] !== c.dh[0] ? '–' + c.dh[1] : '') + ' days' : '—') + '</td></tr>';
    });
    h += '</tbody></table></div><p class="hs-small">Harvest ranges come from university extension yield tables for ordinary garden rows; well-tended intensive beds can do better, and a bad year worse. Calories are for the raw edible part (rinds, peels and pits not subtracted). See each crop in the reference table below for spacing, storage and sources.</p>';
    // rotation
    var annual = P.picks.filter(function (p) { return p.c.t === 'annual'; });
    var groups = ROT.map(function (gs) { return annual.filter(function (p) { return gs.indexOf(p.c.g) >= 0; }).map(function (p) { return p.c.n; }); });
    if (w !== 'indoor' && groups.filter(function (g) { return g.length; }).length >= 2) {
      h += '<h3>Crop rotation: four beds, four years</h3><p>Plants in the same family share pests and diseases, so move each family to a new bed every year and wait 3 to 4 years before it comes back. Split your space into four areas and shift each group one area along each year, in this order: beans and peas (they add nitrogen), then roots and onions, then fruiting crops, then the cabbage family and greens.</p>';
      h += '<div class="gd-tablewrap"><table class="hs-table gd-rot"><thead><tr><th></th><th>Area 1</th><th>Area 2</th><th>Area 3</th><th>Area 4</th></tr></thead><tbody>';
      for (var y = 0; y < 4; y++) { h += '<tr><th>Year ' + (y + 1) + '</th>'; for (var b = 0; b < 4; b++) { var gi = (b - y + 4) % 4; h += '<td data-l="Area ' + (b + 1) + '"><b>' + ROTN[gi] + '</b>' + (groups[gi].length ? '<small>' + esc(groups[gi].join(', ')) + '</small>' : '<small>a cover crop or more of another group</small>') + '</td>'; } h += '</tr>'; }
      h += '</tbody></table></div>';
      var per = P.picks.filter(function (p) { return p.c.t !== 'annual'; }); if (per.length) h += '<p class="hs-small">Perennials and trees (' + esc(per.map(function (p) { return p.c.n; }).join(', ')) + ') stay put, so give them their own permanent spot.</p>';
    }
    h += '<h3>Next steps</h3><ol class="gd-steps">' + (w === 'indoor' ? '<li>Find your sunniest window (4 to 6 hours of direct sun), or set up a grow light on a timer.</li><li>Use pots with drainage holes and fresh potting mix.</li>' : '<li>Find your average last spring frost date: ask your county extension office (see “Finding local help” below). Planting times above count from it.</li><li>Get a soil test through your extension office before you add fertilizer or lime.</li>') +
      '<li>Read “Getting started” for your setting below, then the crop guides for what you chose.</li><li>Start smaller than you think: a garden you can keep up with gives more food than a big one that gets away from you.</li></ol>';
    $('gd-out').innerHTML = h;
  }
  function when(c) {
    if (c.t === 'tree') return 'early spring, as dormant trees';
    var s = c.ps || c.pf || '';
    s = s.replace(/(\d)-(\d)/g, '$1–$2').replace(/\s*\([^)]*\)/g, '').replace(/;.*$/, '').replace(/average last spring frost/, 'last frost');
    return s || '—';
  }
  function whyNot(c) {
    var z = +st.zone;
    if (c.t === 'tree' && !st.trees) return 'tick “Fruit and nut trees”';
    if ((c.t === 'perennial' || c.t === 'bush' || c.t === 'vine') && !st.peren) return 'tick “Berries and perennials”';
    if (st.where === 'indoor') return c.ind === 'possible with grow lights' ? 'needs grow lights' : 'not suited to growing indoors';
    if (st.where === 'balcony' && c.con !== true) return 'no container guidance found for it';
    if (c.zmin && z < c.zmin) return 'too cold below zone ' + c.zmin;
    if (c.zmax && z > c.zmax) return 'needs zone ' + c.zmax + ' or colder';
    if (c.lw && z < c.lw - 1) return 'season too short here';
    return 'not suited';
  }

  // ---------- animals ----------
  var AN = {}; DATA.an.ch.concat(DATA.an.bee).forEach(function (n) { AN[n.id] = n.value; });
  function hens() {
    var epw = +$('an-epw').value || 0, hn = +$('an-hens').value || 0, lo = AN.eggs_per_hen_year.typical_low, hi = AN.eggs_per_hen_year.typical_high;
    if (!hn && epw) hn = Math.ceil(epw * 52 / lo);
    if (!hn) { $('an-hens-out').innerHTML = ''; return; }
    var f = AN.feed_per_hen, cp = AN.coop_floor_space, rn = AN.run_space, rs = AN.roost_space;
    $('an-hens-out').innerHTML = '<ul>' +
      '<li><b>' + hn + ' hen' + (hn > 1 ? 's' : '') + '</b>' + (+$('an-hens').value ? '' : ' for about ' + (+$('an-epw').value) + ' eggs a week') + ': about ' + n0(hn * lo / 52) + '–' + n0(hn * hi / 52) + ' eggs a week in a good laying year, fewer in winter and as hens age.</li>' +
      '<li>Feed: about ' + n0(hn * f.lb_per_year_low) + '–' + n0(hn * f.lb_per_year_high) + ' lb of layer feed a year.</li>' +
      '<li>Coop floor: ' + n0(hn * cp.with_run_sqft_low) + '–' + n0(hn * cp.with_run_sqft_high) + ' sq ft with a run (' + n0(hn * cp.without_run_sqft_low) + '–' + n0(hn * cp.without_run_sqft_high) + ' without), plus a run of ' + n0(hn * rn.sqft_low) + '–' + n0(hn * rn.sqft_high) + ' sq ft.</li>' +
      '<li>' + Math.max(1, Math.ceil(hn / AN.nest_boxes.hens_per_box)) + ' nest box' + (Math.ceil(hn / 4) > 1 ? 'es' : '') + ' and ' + n0(hn * rs.inches_low) + '–' + n0(hn * rs.inches_high) + ' inches of roost.</li>' +
      '<li>Water: about ' + (Math.round(hn / AN.water_per_hen.gallons_per_25_hens / 25 * 10) / 10 || 0.1) + ' gallon' + (hn > 25 ? 's' : '') + ' a day in mild weather, more in heat.</li>' +
      '<li>Hens start laying at about ' + AN.laying_start_age.low + '–' + AN.laying_start_age.high + ' weeks and lay best with about ' + AN.daylight_for_laying.hours_per_day + ' hours of light a day.</li></ul>';
  }
  function broil() {
    var b = +$('an-broil').value || 0; if (!b) { $('an-broil-out').innerHTML = ''; return; }
    var wk = AN.broiler_weeks, wt = AN.broiler_weights, fd = AN.broiler_feed;
    $('an-broil-out').innerHTML = '<ul><li>Fast-growing meat birds are ready in about ' + wk.weeks_low + '–' + wk.weeks_high + ' weeks at ' + wt.live_lb_low + '–' + wt.live_lb_high + ' lb live.</li>' +
      '<li>About ' + n0(b * wt.live_lb_low * wt.dressed_pct_low / 100) + '–' + n0(b * wt.live_lb_high * wt.dressed_pct_high / 100) + ' lb of dressed meat from ' + b + ' birds.</li>' +
      '<li>Feed: roughly ' + n0(b * fd.lb_feed_per_bird_low) + '–' + n0(b * fd.lb_feed_per_bird_high) + ' lb for the batch.</li>' +
      '<li>Selling meat is regulated: check your state’s rules first.</li></ul>';
  }
  function hives() {
    var n = +$('an-hives').value || 0; if (!n) { $('an-hive-out').innerHTML = ''; return; }
    var h = AN.honey_per_colony, cs = AN.startup_costs || {};
    $('an-hive-out').innerHTML = '<ul><li>An established colony can give about ' + h.surplus_lb_low + '–' + h.surplus_lb_high + ' lb of surplus honey a year: ' + n0(n * h.surplus_lb_low) + '–' + n0(n * h.surplus_lb_high) + ' lb from ' + n + ' hive' + (n > 1 ? 's' : '') + '.</li>' +
      '<li>The first year, expect little or no honey: the bees need it to build up and get through winter.</li>' +
      '<li>Many beekeepers start with two hives, so they can compare them and share frames if one struggles.</li>' +
      (cs.nc_state_estimates ? '<li>Starting costs (NC State Extension): a starter hive kit about $' + cs.nc_state_estimates.starter_hive_kit_usd.replace(/^about (\d+).*/, '$1') + ', a package of bees $' + cs.nc_state_estimates.package_bees_usd.replace(' to ', '–') + ' or a nuc $' + cs.nc_state_estimates.nuc_usd.replace(' to ', '–') + ' each, plus a smoker, hive tool and protective gear.</li>' : '') +
      '<li>Never give honey to a baby under 12 months.</li></ul>';
  }
  ['an-epw', 'an-hens'].forEach(function (id) { $(id).addEventListener('input', function () { if (id === 'an-epw') $('an-hens').value = ''; hens(); }); });
  $('an-broil').addEventListener('input', broil); $('an-hives').addEventListener('input', hives);

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
    save(); render();
  }
  sync(); hens(); broil(); hives(); refTable('');
})(window, document);
