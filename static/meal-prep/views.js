/* Meal Prep planner: the Shopping list, Nutrition, Prep day and Kids' chart tabs, and the Export dialog. */
(function (W, D) {
  'use strict';
  var M = W.MealModel, C = W.MealCommon, $ = C.$, $$ = C.$$, esc = C.esc;
  var V = {};

  function rangeOptions(plan, cur, days) {
    var h = '<option value="all"' + (cur === 'all' ? ' selected' : '') + '>The whole plan (' + esc(C.rangeLabel(plan, 'all')) + ')</option>';
    C.weeks(plan).forEach(function (w) { if (plan.days > 7) h += '<option value="w' + w.w + '"' + (cur === 'w' + w.w ? ' selected' : '') + '>' + esc(C.weekLabel(plan, w)) + '</option>'; });
    if (days) for (var d = 0; d < plan.days; d++) h += '<option value="d' + d + '"' + (cur === 'd' + d ? ' selected' : '') + '>' + esc(C.dayLabel(plan, d, true)) + '</option>';
    return h;
  }
  function weekSelect(id, plan, cur) {
    var ws = C.weeks(plan); if (ws.length < 2) return '';
    return '<label class="mp-f mp-inline">Week <select id="' + id + '">' + ws.map(function (w) { return '<option value="' + w.w + '"' + (w.w === cur ? ' selected' : '') + '>' + esc(C.weekLabel(plan, w)) + '</option>'; }).join('') + '</select></label>';
  }
  function curWeek(api, key) { var p = api.plan(), n = C.weeks(p).length, w = +(api.st[key] || 0); return w < n ? w : 0; }

  // ---------- shopping list ----------
  V.shop = function (el, api) {
    var st = api.st, p = api.plan(), data = api.data, range = st.shopRange || 'all';
    if (/^d(\d+)$/.test(range) && +RegExp.$1 >= p.days || /^w(\d+)$/.test(range) && +RegExp.$1 >= C.weeks(p).length) range = st.shopRange = 'all';
    var rep = {}, rows = C.listRows(data, st, p, range, rep), sec = null, n = 0;
    var h = '<div class="mp-viewhead"><h2>Shopping list</h2><label class="mp-f mp-inline">For <select id="sl-range">' + rangeOptions(p, range, true) + '</select></label>' +
      '<div class="mp-actions"><button type="button" class="hs-btn" id="sl-copy">📋 Copy as text</button><button type="button" class="hs-btn" id="sl-pic">🖼 Picture</button><button type="button" class="hs-btn" id="sl-print">🖨 Print or PDF</button></div></div>';
    h += '<p class="hs-small">Everything the planned meals need, scaled to who’s eating and rounded up to what stores sell. Tick what you already have. “Check pantry” means a recipe needs only a little of something most kitchens keep. <b>Make it</b> swaps a store item for its ingredients; <b>🌱 Grow it</b> marks food your garden can supply.</p>';
    h += madeHTML(rep.made || []);
    if (!rows.length) h += '<p class="mp-empty">Nothing here yet. Add meals on the Calendar and the list fills itself in.</p>';
    else {
      h += '<div class="mp-shoplist">';
      var buy = rows.filter(function (r) { return !r.have && !r.garden; }), have = rows.filter(function (r) { return r.have; }), grown = rows.filter(function (r) { return r.garden && !r.have; });
      buy.forEach(function (r) {
        if (r.section !== sec) { if (sec !== null) h += '</ul></div>'; sec = r.section; h += '<div class="mp-shopsec"><h3>' + esc(C.sectionName(data, sec)) + '</h3><ul>'; }
        h += rowHTML(r); n++;
      });
      if (sec !== null) h += '</ul></div>';
      if (grown.length) h += '<div class="mp-shopsec mp-grown" id="sl-garden"><h3>🌱 From your garden (' + grown.length + ')</h3><ul>' + grown.map(rowHTML).join('') + '</ul><p class="hs-small">In season or in storage on the days you cook them, from what you told the planner you grow. Change crops and months in <button type="button" class="mp-linkbtn" data-growdlg="">What I grow</button>.</p></div>';
      if (have.length) h += '<div class="mp-shopsec mp-have"><h3>Already have (' + have.length + ')</h3><ul>' + have.map(rowHTML).join('') + '</ul></div>';
      h += '</div>';
    }
    h += '<form class="mp-extra" id="sl-extra" autocomplete="off"><h3>Add something else</h3><div class="mp-extrarow"><input type="text" id="sl-xname" list="sl-items" placeholder="Paper towels, apples, milk for the week…" aria-label="Item" required><input type="text" id="sl-xqty" placeholder="How much (optional)" aria-label="How much"><button type="submit" class="hs-btn">Add</button></div><datalist id="sl-items">' + data.items.map(function (it) { return '<option value="' + esc(it.name) + '">'; }).join('') + '</datalist>' +
      (p.extras.length ? '<p class="hs-small">Extras are on the whole-plan list. Remove one with its ✕.</p>' : '') + '</form>';
    el.innerHTML = h;
    function rowHTML(r) {
      var id = 'sl-' + r.id.replace(/[^a-z0-9]/gi, '_');
      var detail = [], it = r.item, tools = '';
      if (r.garden) { var ge = it && data.G.byItem[it.id]; detail.push((r.how === 'stored' ? 'from storage' : 'in season') + ': ' + C.growName(data, r.crop) + (ge && Math.abs(ge.f - 1) > 0.01 && r.g > 0 ? ' (about ' + M.fmtNum(Math.round(r.g * ge.f / M.MASS.lb * 10) / 10) + ' lb picked, for ' + ge.part + ')' : '')); }
      if (!r.extra && !r.garden && r.need && r.need !== r.buy && !r.check) detail.push('needs ' + r.need);
      if (r.check && r.ifOut) detail.push('if you’re out: ' + r.ifOut);
      if (r.uses.length) detail.push(r.uses.join(', '));
      if (r.extra) detail.push('added by you');
      if (it && !r.garden && data.S.byItem[it.id]) { var s = data.S.byId[data.S.byItem[it.id]]; tools += '<button type="button" class="mp-tag mp-make" data-make="' + esc(it.id) + '" aria-pressed="false" aria-label="Make ' + esc(it.name) + ' from scratch instead (' + esc(s.name) + ')">🥣 Make it</button>'; }
      if (it && !r.garden && data.G.byItem[it.id]) tools += '<button type="button" class="mp-tag mp-grow" data-growdlg="' + esc(data.G.byItem[it.id].key) + '" aria-label="' + esc(it.name) + ': grow it (' + esc(C.growName(data, data.G.byItem[it.id].key)) + ')">🌱 Grow it</button>';
      return '<li class="' + (r.have ? 'have' : '') + (r.garden ? ' grown' : '') + '"><input type="checkbox" id="' + id + '" data-have="' + esc(r.id) + '"' + (r.have ? ' checked' : '') + '><label for="' + id + '"><span class="mp-sn">' + esc(r.name) + '</span> <span class="mp-sb">' + esc(r.garden ? r.need + ' from the garden' : r.check ? r.check + ' (' + r.need + ')' : r.buy) + '</span>' + (detail.length ? '<small>' + esc(detail.join(' · ')) + '</small>' : '') + '</label>' + (tools ? '<span class="mp-rowtools">' + tools + '</span>' : '') + (r.extra ? '<button type="button" class="mp-x" data-xrm="' + esc(r.id) + '" aria-label="Remove ' + esc(r.name) + '">✕</button>' : '') + '</li>';
    }
    // what's being made from scratch: batches, pans, time, and a way back to buying it
    function madeHTML(made) {
      if (!made.length) return st.makeAll || Object.keys(st.make || {}).length ? '' : '<p class="hs-small mp-scratchhint">🥣 Want to bake the bread or make the tortillas? Tap <b>Make it</b> on an item, or turn on “Make from scratch when I can” in Plan settings. <a href="' + esc(data.scratchBase) + '">See the from-scratch recipes</a>.</p>';
      var avoid = st.avoid || [];
      return '<div class="mp-made" id="sl-made"><h3>🥣 Making from scratch</h3><ul>' + made.map(function (j) {
        var t = C.madeText(data, j), s = j.s, al = {};
        s.ing.forEach(function (i) { var it = i.item && data.cat[i.item]; if (it && !i.opt) it.allergens.forEach(function (a) { al[a] = 1; }); });
        var bad = Object.keys(al).filter(function (a) { return avoid.indexOf(a) >= 0; });
        return '<li><div><a href="' + esc(C.scratchURL(data, s)) + '"><b>' + esc((s.emoji ? s.emoji + ' ' : '') + s.name) + '</b></a> <span class="mp-sb">' + esc(t.makes) + '</span><small>' + esc(t.batches) + ' · ' + esc(C.mins(s.times.active)) + ' hands-on, ' + esc(C.mins(s.times.total)) + ' start to finish · for ' + esc(j.uses.join(', ')) + '</small>' +
          (bad.length ? '<small class="mp-warnline">⚠ Contains ' + esc(bad.map(function (a) { return data.allergenName[a] || a; }).join(', ')) + ', which your household avoids.</small>' : '') + '</div>' +
          s.makes.filter(function (m) { return j.items[m.item]; }).map(function (m) { return '<button type="button" class="mp-tag" data-make="' + esc(m.item) + '" aria-pressed="true" aria-label="Buy ' + esc(data.cat[m.item].name) + ' instead">🛒 Buy instead</button>'; }).join('') + '</li>';
      }).join('') + '</ul><p class="hs-small">Their ingredients are in the list below, added to what the meals need. The Prep day tab schedules the baking and rising.</p></div>';
    }
    $('#sl-range', el).addEventListener('change', function () { st.shopRange = this.value; api.save(); V.shop(el, api); });
    el.onchange = function (e) { var t = e.target; if (t.dataset.have) { if (t.checked) p.pantry[t.dataset.have] = true; else delete p.pantry[t.dataset.have]; api.save(); V.shop(el, api); var b = D.getElementById(t.id); if (b) b.focus({ preventScroll: true }); } };
    el.onclick = function (e) {
      var x = e.target.closest('[data-xrm]'); if (x) { var id = x.dataset.xrm.slice(2); p.extras = p.extras.filter(function (q, i) { return String(q.id || i) !== id; }); api.save(); V.shop(el, api); return; }
      var mk = e.target.closest('[data-make]'); if (mk) {
        var iid = mk.dataset.make, now = C.makes(data, st, iid), it = data.cat[iid], s = data.S.byId[data.S.byItem[iid]];
        st.make[iid] = !now; api.save(); V.shop(el, api);
        api.msg(now ? 'Buying ' + it.name.toLowerCase() + ' again.' : 'Making ' + it.name.toLowerCase() + ' from scratch (' + s.name + '). Its ingredients are on the list now.');
        var f = $(now ? '[data-make="' + iid + '"]' : '#sl-made [data-make="' + iid + '"]', el); if (f) f.focus({ preventScroll: true });
        return;
      }
      var g = e.target.closest('[data-growdlg]'); if (g) V.growDialog(api, g.dataset.growdlg || null);
    };
    $('#sl-extra', el).addEventListener('submit', function (e) {
      e.preventDefault(); var nm = $('#sl-xname', el).value.trim(); if (!nm) return;
      var it = data.items.filter(function (x) { return x.name.toLowerCase() === nm.toLowerCase(); })[0];
      p.extras.push({ id: C.uid('x'), name: it ? it.name : nm, item: it ? it.id : null, section: it ? it.section : 'other', qty: $('#sl-xqty', el).value.trim() });
      api.save(); V.shop(el, api); $('#sl-xname', el).focus();
    });
    $('#sl-copy', el).addEventListener('click', function () { copyText(listText(api, range), api); });
    $('#sl-pic', el).addEventListener('click', function () { V.picture(api, 'list', range); });
    $('#sl-print', el).addEventListener('click', function () { V.toPrint(api, { inc: ['shop'], range: range }); });
  };
  function listText(api, range) {
    var st = api.st, p = api.plan(), data = api.data, rep = {}, all = C.listRows(data, st, p, range, rep).filter(function (r) { return !r.have; }), out = ['Shopping list: ' + p.name + ' (' + C.rangeLabel(p, range) + ')'], sec = null;
    var rows = all.filter(function (r) { return !r.garden; }).concat(all.filter(function (r) { return r.garden; }));
    if (rep.made && rep.made.length) out.push('Making from scratch: ' + rep.made.map(function (j) { return j.s.name + ' (' + C.madeText(data, j).makes + ')'; }).join('; '));
    rows.forEach(function (r) { if (r.section !== sec) { sec = r.section; out.push('', C.sectionName(data, sec).toUpperCase()); } out.push('☐ ' + r.name + (r.garden ? ' — ' + r.need : r.buy ? ' — ' + (r.check ? r.check + ' (' + r.need + ')' : r.buy) : '')); });
    out.push('', 'Made with the Teddy Rook Book meal planner (teddyrookbook.com/meal-prep/plan/)');
    return out.join('\n');
  }
  V.listText = listText;
  function copyText(t, api) {
    function fallback() { var ta = D.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; D.body.appendChild(ta); ta.select(); var ok = false; try { ok = D.execCommand('copy'); } catch (e) { } ta.remove(); api.msg(ok ? 'Copied the list. Paste it into a note or a text message.' : 'Your browser blocked copying. Use Print or Picture instead.'); }
    if (navigator.clipboard && W.isSecureContext) navigator.clipboard.writeText(t).then(function () { api.msg('Copied the list. Paste it into a note or a text message.'); }, fallback); else fallback();
  }

  // ---------- nutrition ----------
  var COLS = ['kcal', 'protein', 'carb', 'fat', 'satfat', 'fiber', 'sugar', 'sodium'];
  function nfmt(k, v) { return k === 'kcal' || k === 'sodium' || k === 'calcium' || k === 'potassium' ? String(Math.round(v)) : String(Math.round(v * 10) / 10).replace(/\.0$/, ''); }
  V.nutr = function (el, api) {
    var st = api.st, p = api.plan(), data = api.data, ALL = api.ALL;
    var h = '<div class="mp-viewhead"><h2>Nutrition estimates</h2></div>';
    if (!data.nutrHas) {
      el.innerHTML = h + '<div class="mp-pending big"><b>Nutrition coming.</b> The calorie and nutrient numbers for the grocery list (from USDA FoodData Central) haven’t been added yet. Planning, scaling and the shopping list all work now, and this page will fill in on its own when the numbers arrive.</div>';
      return;
    }
    var cat = C.cat(data, st), madeIds = Object.keys(C.made(data, st)), days = M.dayNutrition(p, ALL, cat), used = days.filter(function (d) { return d.meals && d.status !== 'none'; });
    h += '<p class="hs-small">For <b>one adult-sized portion</b> of every meal planned that day, estimated from USDA FoodData Central. Brands, portions and cooking change the real numbers, so treat these as a rough guide. % Daily Value is for a 2,000-calorie diet (FDA); many people need more or less. Others in the household eat their share: ' + st.people.filter(function (g) { return g.n; }).map(function (g) { return esc(g.label.toLowerCase()) + ' about ' + Math.round(g.f * 100) + '%'; }).join(', ') + '.</p>';
    if (!used.length) { el.innerHTML = h + '<p class="mp-empty">Add meals to the plan to see their estimates.</p>'; return; }
    if (madeIds.length) h += '<p class="hs-small">🥣 Counted as homemade: ' + esc(madeIds.map(function (id) { return data.cat[id].name; }).join(', ')) + ', from the from-scratch recipes’ ingredients (or USDA’s numbers where most of a food is strained off).</p>';
    h += '<div class="mp-tablewrap"><table class="mp-ntab"><thead><tr><th scope="col">Day</th>' + COLS.map(function (k) { return '<th scope="col">' + M.NLAB[k][0] + (M.NLAB[k][1] ? ' <small>' + M.NLAB[k][1] + '</small>' : '') + '</th>'; }).join('') + '</tr></thead><tbody>';
    var avg = {}, nd = 0; COLS.forEach(function (k) { avg[k] = 0; });
    days.forEach(function (d) {
      if (!d.meals) return;
      var full = d.status === 'full';
      h += '<tr><th scope="row">' + esc(C.dayLabel(p, d.d)) + '<small>' + d.meals + (d.meals === 1 ? ' dish' : ' dishes') + (full ? '' : ' · partial') + '</small></th>';
      if (d.status === 'none') { h += '<td colspan="' + COLS.length + '" class="mp-na">no data yet for these recipes</td></tr>'; return; }
      nd++;
      COLS.forEach(function (k) { avg[k] += d.n[k]; var pc = M.pctDV(k, d.n[k]); h += '<td>' + nfmt(k, d.n[k]) + (pc != null ? '<small>' + pc + '%</small>' : '') + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody>';
    if (nd > 1) h += '<tfoot><tr><th scope="row">Average day</th>' + COLS.map(function (k) { var v = avg[k] / nd, pc = M.pctDV(k, v); return '<td>' + nfmt(k, v) + (pc != null ? '<small>' + pc + '%</small>' : '') + '</td>'; }).join('') + '</tr></tfoot>';
    h += '</table></div>';
    // per recipe
    var seen = {}, recs = [];
    Object.keys(p.cells).forEach(function (k) { p.cells[k].forEach(function (e) { if (!seen[e.r] && ALL[e.r]) { seen[e.r] = 1; recs.push(ALL[e.r]); } }); });
    recs.sort(function (a, b) { return a.name.localeCompare(b.name); });
    h += '<h3>Per serving of each recipe</h3><div class="mp-tablewrap"><table class="mp-ntab"><thead><tr><th scope="col">Recipe</th>' + COLS.map(function (k) { return '<th scope="col">' + M.NLAB[k][0] + '</th>'; }).join('') + '</tr></thead><tbody>';
    var notes = [];
    recs.forEach(function (r) {
      var rn = M.recipeNutrition(r, cat), url = C.recipeURL(data, r);
      h += '<tr><th scope="row">' + (url ? '<a href="' + esc(url) + '">' + esc(r.name) + '</a>' : esc(r.name)) + '</th>';
      if (rn.status === 'none') h += '<td colspan="' + COLS.length + '" class="mp-na">nutrition coming</td>';
      else COLS.forEach(function (k) { h += '<td>' + nfmt(k, rn.n[k]) + '</td>'; });
      h += '</tr>';
      if (rn.status === 'partial') notes.push(r.name + ': not counting ' + rn.missing.join(', '));
    });
    h += '</tbody></table></div>';
    if (notes.length) h += '<div class="mp-note"><b>Not counted</b> (no USDA numbers for these, or write-ins without nutrition):<ul>' + notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></div>';
    h += '<p class="hs-small">Sugars are total sugars (natural and added); the label on a package shows added sugars separately. Sodium depends a lot on how much salt you add and which broth, cheese and canned goods you buy. See <a href="' + esc(guideURL(data, 'check-foods')) + '">what to check on foods</a>.</p>';
    el.innerHTML = h;
  };
  function guideURL(data, key) { var g = (data.guides || []).filter(function (x) { return x.key === key; })[0]; return g ? g.url : '/meal-prep/guides/'; }

  // ---------- prep day ----------
  function clock(startMin, add) { var t = (startMin + add) % 1440, h = Math.floor(t / 60), m = Math.round(t % 60); if (m === 60) { h++; m = 0; } var ap = h >= 12 ? 'PM' : 'AM', hh = h % 12 || 12; return hh + ':' + (m < 10 ? '0' : '') + m + ' ' + ap; }
  V.prep = function (el, api) {
    var st = api.st, p = api.plan(), data = api.data, w = curWeek(api, 'prepWeek'), wk = C.weeks(p)[w];
    var sel = st.prepSel = st.prepSel || {};
    var PP = C.prepPlan(data, st, p, wk), cooked = PP.cooked, pdLabel = C.dayLabel(p, PP.p, true);
    var start = st.prepStart || '13:00', sm = (+start.split(':')[0]) * 60 + (+start.split(':')[1] || 0);
    var h = '<div class="mp-viewhead"><h2>Prep day</h2>' + weekSelect('pd-week', p, w) + '<label class="mp-f mp-inline">Start at <input type="time" id="pd-start" value="' + esc(start) + '" step="900"></label><div class="mp-actions"><button type="button" class="hs-btn" id="pd-print">🖨 Print or PDF</button></div></div>';
    h += '<p class="hs-small">Cook ahead on one afternoon, the day before the week starts (' + esc(pdLabel) + '), so weeknights are just reheat and serve. Tick the dishes to make ahead; the plan puts the slow cooker first, then bread and other from-scratch jobs that need time to rise or soak, then the oven one temperature at a time, with stovetop jobs while things bake.</p>';
    if (!cooked.length && !PP.scratch.length) { el.innerHTML = h + '<p class="mp-empty">Add meals to this week first.</p>'; bind(); return; }
    h += '<ul class="mp-prepsel">';
    cooked.forEach(function (c) {
      var r = c.r, can = !!(r.prepDay && r.prepDay.ahead) || !!r.makeAhead || r.freezeOk, key = r.id;
      if (sel[key] == null) sel[key] = !!(r.prepDay && r.prepDay.ahead);
      h += '<li><label class="mp-cb"><input type="checkbox" data-ps="' + esc(key) + '"' + (sel[key] ? ' checked' : '') + '> ' + esc(C.emoji(r)) + ' <b>' + esc(r.name) + '</b> <small>' + M.fmtNum(c.servings) + ' portions' + (c.times > 1 ? ', cooked ' + c.times + ' times' : '') + '</small></label>' +
        (r.prepDay && r.prepDay.ahead ? '<small class="mp-ahead">Ahead: ' + esc(r.prepDay.ahead) + '</small>' : r.makeAhead ? '<small class="mp-ahead">' + esc(r.makeAhead) + '</small>' : !can ? '<small class="mp-ahead">Best made fresh.</small>' : '') + '</li>';
    });
    h += '</ul>';
    // from scratch: when each is made, and what to freeze
    var other = [];
    if (PP.scratch.length) {
      h += '<h3>From scratch this week</h3><ul class="mp-prepsel mp-scratchsel">';
      PP.scratch.forEach(function (x) {
        var s = x.s, t = C.madeText(data, x.made || x), pl = s.plan || {}, notes = [];
        x.parts.forEach(function (pt) {
          var on = pt.day === PP.p;
          if (!on) other.push({ x: x, pt: pt });
          var useDays = Object.keys(x.made.byDay).map(Number).sort(function (a, b) { return a - b; });
          if (on) notes.push('Make it on prep day' + (x.parts.length > 1 ? ' (' + C.timesText(pt.n) + ')' : '') + '. ' + (pt.freeze ? (pt.freeze.share > 0.95 ? '❄️ Freeze it until ' + C.dayLabel(p, pt.freeze.from) + '. ' + (pl.thaw || 'Thaw it the day before.') : '❄️ Freeze the part for ' + C.dayLabel(p, pt.freeze.from) + ' on (about ' + Math.round(pt.freeze.share * 100) + '%). ' + (pl.thaw || 'Thaw it the day before.') + ' Keep the rest for ' + C.dayLabel(p, useDays[0]) + (pl.keep_days > 1 ? ' (it keeps ' + pl.keep_days + ' days)' : '') + '.') : 'It keeps ' + (pl.keep_days >= 30 ? 'for weeks' : pl.keep_days === 1 ? 'a day' : pl.keep_days + ' days') + ', through ' + C.dayLabel(p, useDays[useDays.length - 1]) + '.'));
          else notes.push('Make ' + (x.parts.length > 1 ? C.timesText(pt.n) + ' ' : '') + 'on ' + C.dayLabel(p, pt.day, true) + (pt.day < PP.p ? ' (before prep day: it’s needed early)' : '') + (pl.keep_days === 0 ? ', right before serving' : pl.lead_days ? ', a day ahead' : '') + '.');
        });
        var onPrep = x.parts.some(function (pt) { return pt.day === PP.p; });
        h += '<li><label class="mp-cb"><input type="checkbox" data-ps="' + esc(x.key) + '"' + (x.on ? ' checked' : '') + (onPrep ? '' : ' disabled') + '> ' + esc(s.emoji || '🥣') + ' <b>' + esc(s.name) + '</b> <small>' + esc(t.makes) + ' · ' + esc(t.batches) + ' · ' + esc(C.mins(s.times.active)) + ' hands-on, ' + esc(C.mins(s.times.total)) + ' in all</small></label>' +
          '<small class="mp-ahead">' + esc(notes.join(' ')) + ' <a href="' + esc(C.scratchURL(data, s)) + '">Recipe</a></small></li>';
      });
      h += '</ul>';
    }
    var jobs = PP.jobs, before = C.beforeJobs(jobs);
    if (before.length) h += '<h3>The day before</h3><ul class="mp-otherdays mp-before">' + before.map(function (b) { return '<li><b>' + esc(C.dayLabel(p, PP.p - 1, true)) + '</b>: ' + esc((b.s.emoji || '') + ' ' + b.s.name) + ' ' + C.timesText(b.n) + ': ' + esc(C.beforeText(b)) + '. <a href="' + esc(C.scratchURL(data, b.s)) + '">Recipe</a></li>'; }).join('') + '</ul>';
    if (jobs.length) {
      var plan2 = M.prepDay(jobs);
      function clk(m) { return clock(sm, m); }
      h += '<h3>The plan for ' + esc(pdLabel) + '</h3><ol class="mp-timeline">';
      plan2.steps.forEach(function (s) {
        var j = s.j, T = C.stepText(s, clk), r = j.r;
        h += '<li' + (j.s ? ' class="mp-tl-scratch"' : '') + '><span class="mp-tt">' + clock(sm, s.at) + '</span><div><b>' + esc(T.title) + '</b> <span class="mp-where w-' + T.where + '">' + esc(T.label) + '</span>' +
          (s.heat ? '<br><small>Heat the oven to ' + s.heat + '°F' + (s.at > 0 ? ' (or reset it now)' : '') + '.</small>' : '') +
          '<br>' + esc(T.what) + ' <small>(' + esc(T.small) + ')</small>' +
          (r && j.keeps ? '<br><small>Keeps about ' + j.keeps + (j.keeps === 1 ? ' day' : ' days') + ' in the fridge.</small>' : '') + (r && r.freezer ? '<br><small>❄️ ' + esc(r.freezer) + '</small>' : '') + '</div></li>';
      });
      h += '<li><span class="mp-tt">' + clock(sm, plan2.end) + '</span><div><b>Cool, label and pack</b><br>Refrigerate cooked food within 2 hours (1 hour if it’s above 90°F). Shallow containers cool fastest. Label each with the dish and the date, and reheat leftovers to 165°F.</div></li></ol>';
      if (plan2.slow) h += '<p class="hs-small">The slow cooker keeps going after you finish: turn it off (or to warm) about ' + clock(sm, plan2.slowEnd) + ', then cool and pack that dish the same way.</p>';
      if (plan2.bgEnd > plan2.end) h += '<p class="hs-small">Some from-scratch jobs keep going on their own after that (cooling, setting or simmering) until about ' + clock(sm, plan2.bgEnd) + (plan2.bgEnd - plan2.end > 360 ? ', overnight: start them the evening before if that suits you better' : '') + '.</p>';
      h += '<p class="hs-small">Timing is a rough guide built from each recipe’s hands-on and cooking times; rising and setting run faster in a warm kitchen and slower in a cool one. See <a href="' + esc(guideURL(data, 'food-safety')) + '">food safety</a> for safe temperatures and storage times.</p>';
    } else h += '<p class="mp-empty">Tick at least one dish to get a schedule.</p>';
    if (other.length) {
      other.sort(function (a, b) { return a.pt.day - b.pt.day; });
      h += '<h3>From scratch on other days</h3><ul class="mp-otherdays">' + other.map(function (o) { var s = o.x.s; return '<li><b>' + esc(C.dayLabel(p, o.pt.day, true)) + '</b>: ' + esc((s.emoji || '') + ' ' + s.name) + ' ' + C.timesText(o.pt.n) + ' <small>(' + esc(C.mins(s.times.active)) + ' hands-on, ' + esc(C.mins(s.times.total)) + ' in all' + (C.hasBefore(s) ? '; start it the day before' : '') + ')</small> <a href="' + esc(C.scratchURL(data, s)) + '">Recipe</a></li>'; }).join('') + '</ul>';
    }
    el.innerHTML = h; bind();
    function bind() {
      var ws = $('#pd-week', el); if (ws) ws.addEventListener('change', function () { st.prepWeek = +this.value; api.save(); V.prep(el, api); });
      $('#pd-start', el).addEventListener('change', function () { if (this.value) { st.prepStart = this.value; api.save(); V.prep(el, api); } });
      el.onchange = function (e) { var t = e.target; if (t.dataset.ps) { sel[t.dataset.ps] = t.checked; api.save(); V.prep(el, api); var b = $('[data-ps="' + t.dataset.ps + '"]', el); if (b) b.focus(); } };
      $('#pd-print', el).addEventListener('click', function () { V.toPrint(api, { inc: ['prep'], range: 'w' + w }); });
    }
  };

  // ---------- what could you grow for this plan? ----------
  V.grow = function (el, api) {
    var st = api.st, p = api.plan(), data = api.data, hz = st.growHz || 'year', mult = hz === 'year' ? 365 / p.days : 1;
    var rows = C.listRows(data, st, p, 'all');
    var G = M.growPlan(rows, data.G, data.crops, mult, { eggsPerHen: data.animals.eggsPerHen, honeyPerHive: data.animals.honeyPerHive, yearFactor: hz === 'year' ? 1 : 365 / p.days });
    var h = '<div class="mp-viewhead"><h2>What could you grow for this plan?</h2><label class="mp-f mp-inline">Amounts for <select id="gr-hz"><option value="year"' + (hz === 'year' ? ' selected' : '') + '>a year of meals like these</option><option value="plan"' + (hz === 'plan' ? ' selected' : '') + '>just this plan (' + p.days + ' days)</option></select></label></div>';
    h += '<p class="hs-small">The fruits, vegetables, eggs and honey in this plan (including what goes into anything you make from scratch), and roughly how much garden it would take to grow them, from the Food Garden Planner’s yield figures (university extension tables for ordinary garden rows; good beds can do better, a bad year worse). Most crops come in over a few weeks or months, so a year’s worth of a fresh crop means planting it more than once or putting some by.</p>';
    if (!G.length) { el.innerHTML = h + '<p class="mp-empty">Add meals to the plan first. Then this shows the crops they use.</p>'; bind(); return; }
    var crops = G.filter(function (g) { return !g.animal; }), an = G.filter(function (g) { return g.animal; }), grown = (st.grow && st.grow.crops) || {};
    var area = 0; crops.forEach(function (g) { if (g.sqft && !g.trees) area += g.sqft; });
    h += '<div class="mp-tablewrap"><table class="mp-ntab mp-growtab"><thead><tr><th scope="col">Crop</th><th scope="col">For these meals</th><th scope="col">Space</th><th scope="col">Plants</th><th scope="col">Ready in</th><th scope="col">Season</th><th scope="col">Keeps</th></tr></thead><tbody>';
    crops.forEach(function (g) {
      var on = grown[g.key] && grown[g.key].on, sm = (data.G.crops[g.key] || {}).store_months;
      h += '<tr><th scope="row">' + esc(g.name) + (on ? ' <span class="mp-tag on">🌱 you grow it</span>' : '') + '<small>' + esc(g.items.join(', ')) + '</small></th>' +
        '<td data-l="For these meals">' + esc(lbTxt(g.lb)) + '</td><td data-l="Space">' + (g.sqft ? (g.trees ? g.trees + (g.trees === 1 ? ' tree' : ' trees') : esc(sqTxt(g.sqft))) : '—') + '</td>' +
        '<td data-l="Plants">' + (g.trees ? '—' : g.plants ? '≈ ' + g.plants : g.key === 'culinary_herbs' ? 'a few plants' : '—') + '</td>' +
        '<td data-l="Ready in">' + (g.yrs && g.yrs[0] ? esc(g.yrs[0] + (g.yrs[1] && g.yrs[1] !== g.yrs[0] ? '–' + g.yrs[1] : '') + ' years') : g.dh && g.dh[0] ? esc(g.dh[0] + (g.dh[1] && g.dh[1] !== g.dh[0] ? '–' + g.dh[1] : '') + ' days') : '—') + '</td>' +
        '<td data-l="Season">' + esc(g.se === 'cool' ? 'cool season' : g.se === 'warm' ? 'warm season' : g.se || '—') + '</td>' +
        '<td data-l="Keeps"><small>' + esc(sm ? 'about ' + sm + ' months stored' : 'eat fresh') + '</small></td></tr>';
    });
    h += '</tbody></table></div>';
    if (area) h += '<p class="mp-tip"><b>About ' + esc(sqTxt(area)) + ' of growing space</b> for the crops above' + (crops.some(function (g) { return g.trees; }) ? ' (not counting trees)' : '') + (hz === 'year' ? ' to cover a year of meals like these' : ' for this plan') + ', before paths. Herbs fit in a few pots.</p>';
    if (an.length) h += '<ul class="mp-growan">' + an.map(function (g) {
      return g.key === 'hens' ? '<li>🥚 <b>' + Math.round(g.eggs) + ' eggs</b>' + (g.hens ? ': about <b>' + g.hens + (g.hens === 1 ? ' laying hen' : ' laying hens') + '</b>, at ' + data.animals.eggsPerHen + ' eggs a hen a year (the low end in the Garden Planner’s data)' : '') + '.</li>'
        : '<li>🍯 <b>' + esc(lbTxt(g.lb)) + ' of honey</b>' + (g.hives ? ': about <b>' + g.hives + (g.hives === 1 ? ' hive' : ' hives') + '</b>, at ' + data.animals.honeyPerHive + ' lb of surplus a year from an established hive (little or none the first year)' : '') + '.</li>';
    }).join('') + '</ul>';
    var keys = crops.map(function (g) { return g.key; }), hens = an.filter(function (g) { return g.key === 'hens'; })[0];
    var url = data.gardenURL + '?crops=' + encodeURIComponent(keys.join(',')) + '&mode=only&people=' + Math.max(1, M.householdPeople(st.people)) + (hens && hens.hens ? '&hens=' + hens.hens : '') + '&from=meals';
    h += '<div class="mp-dlgbtns"><a class="hs-btn pri" id="gr-open" href="' + esc(url) + '">🌱 Open the Garden Planner with these crops</a><button type="button" class="hs-btn" data-growdlg="">I grow some of these…</button></div>';
    h += '<p class="hs-small">The Garden Planner checks which crops suit your space and climate, lays out the beds and gives planting dates. Then tell this planner what you grow and when it comes in, and the shopping list moves those to “From your garden.”</p>';
    el.innerHTML = h; bind();
    function bind() {
      var s = $('#gr-hz', el); if (s) s.addEventListener('change', function () { st.growHz = this.value; api.save(); V.grow(el, api); });
      el.onclick = function (e) { var g = e.target.closest('[data-growdlg]'); if (g) V.growDialog(api, g.dataset.growdlg || null); };
    }
  };
  function lbTxt(lb) { return lb >= 10 ? Math.round(lb) + ' lb' : lb >= 1 ? (Math.round(lb * 10) / 10) + ' lb' : Math.max(1, Math.round(lb * 16)) + ' oz'; }
  function sqTxt(a) { return (a < 10 ? Math.max(1, Math.round(a * 10) / 10) : Math.round(a)) + ' sq ft'; }

  // ---------- "What I grow": crops and animals, with the months they come in ----------
  V.growDialog = function (api, pre) {
    var st = api.st, data = api.data, g = st.grow = st.grow || { crops: {}, animals: {} };
    g.crops = g.crops || {}; g.animals = g.animals || {};
    function isAn(key) { return key === 'hens' || key === 'bees'; }
    function slot(key) { return isAn(key) ? g.animals : g.crops; }
    function def(key) { return (isAn(key) ? data.G.animals : data.G.crops)[key] || {}; }
    function turnOn(key) {
      var x = slot(key)[key] || (slot(key)[key] = { m: (def(key).months || []).slice(), store: !!def(key).store_months });
      x.on = true; x.m = x.m || [];
      if (key === 'bees' && !x.m.length) x.m = [8, 9]; // a late-summer harvest; stored honey covers the rest of the year
    }
    if (pre) turnOn(pre);
    var planKeys = {}; C.listRows(data, st, api.plan(), 'all').forEach(function (r) { var e = r.item && data.G.byItem[r.item.id]; if (e) planKeys[e.key] = 1; });
    function body() {
      var on = Object.keys(g.crops).filter(function (k) { return g.crops[k].on && data.G.crops[k]; }).concat(['hens', 'bees'].filter(function (k) { return g.animals[k] && g.animals[k].on; }));
      var rest = Object.keys(data.G.crops).concat(['hens', 'bees']).filter(function (k) { return on.indexOf(k) < 0; }).sort(function (a, b) { return (planKeys[b] ? 1 : 0) - (planKeys[a] ? 1 : 0) || C.growName(data, a).localeCompare(C.growName(data, b)); });
      var h = '<p class="mp-dlgsub">Tick what you grow and the months you pick it. During those months, and while it keeps in storage if you store some, the shopping list moves it to “From your garden.”</p>';
      h += on.length ? '<ul class="mp-growlist">' + on.map(function (k) {
        var x = slot(k)[k], d = def(k), nm = C.growName(data, k);
        return '<li data-gk="' + esc(k) + '"><div class="mp-growhead"><b>' + esc(nm) + '</b> <small>' + esc(C.monthsText(x.m)) + '</small><button type="button" class="mp-x" data-goff="' + esc(k) + '" aria-label="I don’t grow ' + esc(nm) + '">✕</button></div>' +
          '<div class="mp-months" role="group" aria-label="Months you harvest ' + esc(nm) + '">' + C.MONTHS.map(function (mn, i) { return '<button type="button" class="mp-mon" data-gm="' + (i + 1) + '" aria-pressed="' + (x.m.indexOf(i + 1) >= 0) + '" aria-label="' + mn + '">' + mn.slice(0, 3) + '</button>'; }).join('') + '</div>' +
          (d.store_months ? '<label class="mp-cb"><input type="checkbox" data-gs="' + esc(k) + '"' + (x.store ? ' checked' : '') + '> I store some (it keeps about ' + d.store_months + ' months' + (k === 'bees' ? ', so it can cover the year' : '') + ')</label>' : '') +
          '<small>' + esc(isAn(k) ? d.note || '' : (x.m.length ? '' : 'Tap the months it comes in. ') + (d.months && d.months.length ? 'Starting months come from the Garden Planner’s calendar with its example frost dates (April 15 and October 15); change them to fit your place.' : '') + (d.store_note ? ' ' + d.store_note : '')) + '</small></li>';
      }).join('') + '</ul>' : '<p class="hs-small">Nothing yet.</p>';
      h += '<details class="mp-mini"' + (on.length ? '' : ' open') + '><summary>Add a crop or animal</summary><div class="mp-chips">' + rest.map(function (k) { return '<button type="button" class="mp-chipf" data-gon="' + esc(k) + '">' + (planKeys[k] ? '★ ' : '') + esc(C.growName(data, k)) + '</button>'; }).join('') + '</div><p class="hs-small">★ = in this plan.</p></details>';
      h += '<div class="mp-dlgbtns"><a class="hs-btn" href="' + esc(data.gardenURL) + '">🌱 Plan a garden</a><button type="button" class="hs-btn pri" id="gw-done">Done</button></div>';
      return h;
    }
    var dlg = api.sheet('🌱 What I grow', body(), mount, 'wide');
    function redraw(focusSel) { $('.mp-dlgbody', dlg).innerHTML = body(); mount(dlg); api.save(); var f = focusSel && $(focusSel, dlg); if (f) f.focus(); }
    function mount(d) {
      var b = $('.mp-dlgbody', d);
      b.onclick = function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.id === 'gw-done') { api.closeSheet(); return; }
        if (t.dataset.gon) { turnOn(t.dataset.gon); redraw('[data-gk="' + t.dataset.gon + '"] .mp-mon'); return; }
        if (t.dataset.goff) { var k = t.dataset.goff; slot(k)[k].on = false; redraw('#gw-done'); return; }
        if (t.dataset.gm) {
          var li = t.closest('[data-gk]'), key = li.dataset.gk, x = slot(key)[key], m = +t.dataset.gm, i = x.m.indexOf(m);
          if (i >= 0) x.m.splice(i, 1); else x.m.push(m);
          x.m.sort(function (a, c) { return a - c; }); t.setAttribute('aria-pressed', String(i < 0)); $('.mp-growhead small', li).textContent = C.monthsText(x.m); api.save();
        }
      };
      b.onchange = function (e) { var t = e.target; if (t.dataset.gs) { var k = t.dataset.gs; slot(k)[k].store = t.checked; api.save(); } };
      if (pre) { var li = $('[data-gk="' + pre + '"]', d); if (li) { var f = $('.mp-mon', li); if (f) f.focus({ preventScroll: true }); li.scrollIntoView({ block: 'nearest' }); } pre = null; }
    }
    if (!dlg._growClose) { dlg._growClose = true; dlg.addEventListener('close', function () { if (dlg._grow) { dlg._grow = false; api.save(); api.renderAll(); } }); }
    dlg._grow = true;
  };

  // ---------- kids' chart ----------
  V.kids = function (el, api) {
    var st = api.st, p = api.plan(), data = api.data, w = curWeek(api, 'kidsWeek'), wk = C.weeks(p)[w];
    var which = st.kidsSlots || 'dinner', slots = which === 'all' ? api.slotsOn(p) : ['dinner'];
    var h = '<div class="mp-viewhead"><h2>What’s for dinner?</h2>' + weekSelect('kc-week', p, w) + '<label class="mp-f mp-inline">Show <select id="kc-slots"><option value="dinner">Dinners</option><option value="all"' + (which === 'all' ? ' selected' : '') + '>Every meal</option></select></label><div class="mp-actions"><button type="button" class="hs-btn" id="kc-print">🖨 Print</button><button type="button" class="hs-btn" id="kc-pic">🖼 Picture</button></div></div>';
    h += '<p class="hs-small">A big, friendly chart for the fridge, so nobody has to ask. Children who can’t read yet can go by the pictures.</p>';
    h += '<div class="mp-kidsprev">' + C.kidsHTML(data, st, p, wk, slots) + '</div>';
    el.innerHTML = h;
    var ws = $('#kc-week', el); if (ws) ws.addEventListener('change', function () { st.kidsWeek = +this.value; api.save(); V.kids(el, api); });
    $('#kc-slots', el).addEventListener('change', function () { st.kidsSlots = this.value; api.save(); V.kids(el, api); });
    $('#kc-print', el).addEventListener('click', function () { V.toPrint(api, { inc: ['kids'], range: 'w' + w, kidsSlots: which }); });
    $('#kc-pic', el).addEventListener('click', function () { V.picture(api, 'kids', 'w' + w); });
  };

  // ---------- print page hand-off ----------
  V.toPrint = function (api, o) {
    var root = D.getElementById('mp'), url = root.dataset.print, st = api.st;
    api.save(); C.handOff(st);
    var q = '?plan=' + encodeURIComponent(st.cur) + '&inc=' + (o.inc || ['grid', 'shop']).join(',') + '&range=' + encodeURIComponent(o.range || 'all') + (o.kidsSlots ? '&kids=' + o.kidsSlots : '');
    location.href = url + q;
  };

  // ---------- pictures ----------
  V.picture = function (api, what, range) {
    var P = W.MealPictures, st = api.st, p = api.plan();
    if (!P) return;
    var size = st.picSize || 'phone', file = null;
    var weeks = C.weeks(p);
    var h = '<div class="mp-picopts"><label class="mp-f mp-inline">Picture of <select id="pc-what"><option value="week">the week</option><option value="list">the shopping list</option><option value="kids">the kids’ chart</option></select></label>' +
      '<label class="mp-f mp-inline" id="pc-rangel">For <select id="pc-range"></select></label>' +
      '<span class="mp-radios"><label><input type="radio" name="pc-size" value="phone"' + (size === 'phone' ? ' checked' : '') + '> For a phone</label><label><input type="radio" name="pc-size" value="print"' + (size === 'print' ? ' checked' : '') + '> For printing</label></span></div>' +
      '<div class="mp-picprev"><img alt="Preview of the picture"></div><p class="hs-small" id="pc-note"></p>' +
      '<div class="mp-dlgbtns"><button type="button" class="hs-btn" id="pc-share" hidden>📲 Save to Photos / Share</button><button type="button" class="hs-btn pri" id="pc-dl">⬇ Download picture</button></div>';
    api.sheet('Save as a picture', h, function (dlg) {
      $('#pc-what', dlg).value = what;
      function fillRange() {
        var wv = $('#pc-what', dlg).value, sel = $('#pc-range', dlg), o = '';
        if (wv === 'list') o = rangeOptions(p, range && range[0] !== 'd' ? range : 'all', false);
        else o = weeks.map(function (w) { return '<option value="w' + w.w + '"' + ('w' + w.w === range ? ' selected' : '') + '>' + esc(C.weekLabel(p, w)) + '</option>'; }).join('');
        sel.innerHTML = o; $('#pc-rangel', dlg).hidden = sel.options.length < 2;
      }
      function draw() {
        var wv = $('#pc-what', dlg).value, rg = $('#pc-range', dlg).value || 'w0', sz = $('input[name=pc-size]:checked', dlg).value;
        st.picSize = sz; api.save();
        var cv = P.draw(wv, api.data, st, p, rg, sz), img = $('img', dlg);
        file = null;
        if (!cv) { img.removeAttribute('src'); $('#pc-note', dlg).textContent = 'That is too long for one picture. Pick one week.'; return; }
        img.src = cv.toDataURL('image/png');
        var name = (p.name || 'meal-plan').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + wv + (rg !== 'all' ? '-' + rg : '') + '.png';
        cv.toBlob(function (b) { file = new File([b], name, { type: 'image/png' }); }, 'image/png');
        $('#pc-note', dlg).textContent = (sz === 'phone' ? 'Sized for a phone screen (' : 'Sized for a letter page (') + cv.width + ' × ' + cv.height + ' pixels). Made in your browser.';
      }
      var canShare = false; try { canShare = W.matchMedia('(pointer: coarse)').matches && navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/png' })], 'x.png', { type: 'image/png' })] }); } catch (e) { }
      if (canShare) $('#pc-share', dlg).hidden = false;
      $('#pc-share', dlg).addEventListener('click', function () { if (file) navigator.share({ files: [file], title: 'Meal plan' }).catch(function () { }); });
      $('#pc-dl', dlg).addEventListener('click', function () { if (file) { download(file.name, file); api.msg('Picture saved.'); } });
      dlg.querySelector('.mp-picopts').addEventListener('change', function (e) { if (e.target.id === 'pc-what') fillRange(); draw(); });
      fillRange(); draw();
    }, 'wide');
  };
  function download(name, blob) {
    var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; D.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  V.download = download;

  // ---------- export ----------
  V.exportDialog = function (api) {
    var st = api.st, p = api.plan(), weeks = C.weeks(p);
    var h = '<section class="mp-exsec"><h3>🖨 Print or save as PDF</h3><p class="hs-small">Opens a print page; choose “Save as PDF” as the printer to keep a file.</p>' +
      '<div class="mp-checks">' + [['grid', 'The week grid', 1], ['shop', 'Shopping list', 1], ['cards', 'Recipe cards', 0], ['prep', 'Prep-day plan', 0], ['kids', 'Kids’ dinner chart', 0]].map(function (x) { return '<label class="mp-cb"><input type="checkbox" data-inc="' + x[0] + '"' + (x[2] ? ' checked' : '') + '> ' + x[1] + '</label>'; }).join('') + '</div>' +
      '<label class="mp-f mp-inline">For <select id="ex-range">' + rangeOptions(p, 'all', false) + '</select></label> <button type="button" class="hs-btn pri" id="ex-print">Open the print page</button></section>' +
      '<section class="mp-exsec"><h3>🖼 Picture (PNG)</h3><p class="hs-small">The week or the shopping list as an image, for your phone or for printing.</p><button type="button" class="hs-btn" id="ex-picw">Week picture</button> <button type="button" class="hs-btn" id="ex-picl">Shopping list picture</button></section>' +
      '<section class="mp-exsec"><h3>📋 Plain text</h3><button type="button" class="hs-btn" id="ex-text">Copy the shopping list as text</button> <button type="button" class="hs-btn" id="ex-mtext">Copy the meal schedule as text</button></section>' +
      '<section class="mp-exsec"><h3>💾 Backup file</h3><p class="hs-small">Your plans, household and own recipes in one file. Open it on another device, or keep it safe.</p><button type="button" class="hs-btn" id="ex-save">Save a backup file</button> <label class="hs-btn">Open a backup file<input type="file" id="ex-open" accept=".json,application/json" hidden></label>' +
      '<div class="mp-radios" id="ex-mode"><label><input type="radio" name="ex-mode" value="merge" checked> Add to what’s here</label><label><input type="radio" name="ex-mode" value="replace"> Replace everything here</label></div>' +
      '<button type="button" class="hs-btn ghost" id="ex-mine">Save just my recipes</button></section>';
    api.sheet('Export', h, function (dlg) {
      $('#ex-print', dlg).addEventListener('click', function () { var inc = $$('[data-inc]', dlg).filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.inc; }); if (!inc.length) { api.msg('Pick at least one thing to print.'); return; } V.toPrint(api, { inc: inc, range: $('#ex-range', dlg).value }); });
      $('#ex-picw', dlg).addEventListener('click', function () { V.picture(api, 'week', 'w0'); });
      $('#ex-picl', dlg).addEventListener('click', function () { V.picture(api, 'list', 'all'); });
      $('#ex-text', dlg).addEventListener('click', function () { copyText(listText(api, 'all'), api); });
      $('#ex-mtext', dlg).addEventListener('click', function () { copyText(scheduleText(api), api); });
      $('#ex-save', dlg).addEventListener('click', function () {
        var name = 'meal-plans-' + C.iso(new Date()) + '.json';
        download(name, new Blob([JSON.stringify({ trbMeals: 1, saved: new Date().toISOString(), state: st }, null, 1)], { type: 'application/json' }));
        api.msg('Backup saved as ' + name + '.');
      });
      $('#ex-mine', dlg).addEventListener('click', function () {
        download('my-recipes.json', new Blob([JSON.stringify({ trbMeals: 1, saved: new Date().toISOString(), state: { mine: st.mine } }, null, 1)], { type: 'application/json' }));
      });
      $('#ex-open', dlg).addEventListener('change', function () {
        var f = this.files && this.files[0]; if (!f) return;
        var mode = $('input[name=ex-mode]:checked', dlg).value, rd = new FileReader();
        rd.onload = function () { var r = V.importState(api, rd.result, mode); api.closeSheet(); api.msg(r); };
        rd.readAsText(f);
      });
    });
  };
  function scheduleText(api) {
    var st = api.st, p = api.plan(), ALL = api.ALL, out = ['Meal plan: ' + p.name + ' (' + C.rangeLabel(p, 'all') + ')'];
    for (var d = 0; d < p.days; d++) {
      if (d % 7 === 0) out.push('', 'WEEK ' + (d / 7 + 1));
      var line = [];
      api.slotsOn(p).forEach(function (s) { var es = (p.cells[M.cellKey(d, s)] || []).map(function (e) { return ALL[e.r] ? ALL[e.r].name + (e.lo ? ' (leftovers)' : '') : ''; }).filter(Boolean); if (es.length) line.push(C.SLOTNAME[s] + ': ' + es.join(' + ')); });
      out.push(C.dayLabel(p, d, true) + (line.length ? ' — ' + line.join('; ') : ' — (nothing planned)'));
    }
    return out.join('\n');
  }
  V.scheduleText = scheduleText;
  // returns a message for the user
  V.importState = function (api, text, mode) {
    var j; try { j = JSON.parse(text); } catch (e) { return 'That file isn’t a backup from this planner (it isn’t valid JSON).'; }
    var inc = j && j.trbMeals && j.state; if (!inc) return 'That file isn’t a backup from this planner.';
    api.snapshot();
    var st = api.st, nP = 0, nR = 0;
    if (mode === 'replace' && inc.plans) { api.st = C.fix(inc); nP = api.st.plans.length; nR = Object.keys(api.st.mine || {}).length; }
    else {
      Object.keys(inc.mine || {}).forEach(function (k) {
        var id = k; if (st.mine[id] && JSON.stringify(st.mine[id]) !== JSON.stringify(inc.mine[k])) id = 'my-' + C.uid('r');
        st.mine[id] = inc.mine[k]; nR++;
        // plans from the file that use the renamed recipe follow it
        if (id !== k) (inc.plans || []).forEach(function (p) { Object.keys(p.cells || {}).forEach(function (c) { p.cells[c].forEach(function (e) { if (e.r === k) e.r = id; }); }); });
      });
      (inc.plans || []).forEach(function (p) { p = JSON.parse(JSON.stringify(p)); p.id = C.uid('p'); if (st.plans.some(function (q) { return q.name === p.name; })) p.name += ' (imported)'; st.plans.push(p); nP++; });
      api.st = C.fix(st);
    }
    api.refreshRecipes(); api.save(); api.renderAll();
    return 'Loaded ' + nP + (nP === 1 ? ' plan' : ' plans') + ' and ' + nR + (nR === 1 ? ' recipe' : ' recipes') + '.';
  };

  W.MealViews = V;
})(window, document);
