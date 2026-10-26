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
    var rows = C.listRows(data, st, p, range), sec = null, n = 0;
    var h = '<div class="mp-viewhead"><h2>Shopping list</h2><label class="mp-f mp-inline">For <select id="sl-range">' + rangeOptions(p, range, true) + '</select></label>' +
      '<div class="mp-actions"><button type="button" class="hs-btn" id="sl-copy">📋 Copy as text</button><button type="button" class="hs-btn" id="sl-pic">🖼 Picture</button><button type="button" class="hs-btn" id="sl-print">🖨 Print or PDF</button></div></div>';
    h += '<p class="hs-small">Everything the planned meals need, scaled to who’s eating and rounded up to what stores sell. Tick what you already have. “Check pantry” means a recipe needs only a little of something most kitchens keep.</p>';
    if (!rows.length) h += '<p class="mp-empty">Nothing here yet. Add meals on the Calendar and the list fills itself in.</p>';
    else {
      h += '<div class="mp-shoplist">';
      var buy = rows.filter(function (r) { return !r.have; }), have = rows.filter(function (r) { return r.have; });
      buy.forEach(function (r) {
        if (r.section !== sec) { if (sec !== null) h += '</ul></div>'; sec = r.section; h += '<div class="mp-shopsec"><h3>' + esc(C.sectionName(data, sec)) + '</h3><ul>'; }
        h += rowHTML(r); n++;
      });
      if (sec !== null) h += '</ul></div>';
      if (have.length) h += '<div class="mp-shopsec mp-have"><h3>Already have (' + have.length + ')</h3><ul>' + have.map(rowHTML).join('') + '</ul></div>';
      h += '</div>';
    }
    h += '<form class="mp-extra" id="sl-extra" autocomplete="off"><h3>Add something else</h3><div class="mp-extrarow"><input type="text" id="sl-xname" list="sl-items" placeholder="Paper towels, apples, milk for the week…" aria-label="Item" required><input type="text" id="sl-xqty" placeholder="How much (optional)" aria-label="How much"><button type="submit" class="hs-btn">Add</button></div><datalist id="sl-items">' + data.items.map(function (it) { return '<option value="' + esc(it.name) + '">'; }).join('') + '</datalist>' +
      (p.extras.length ? '<p class="hs-small">Extras are on the whole-plan list. Remove one with its ✕.</p>' : '') + '</form>';
    el.innerHTML = h;
    function rowHTML(r) {
      var id = 'sl-' + r.id.replace(/[^a-z0-9]/gi, '_');
      var detail = [];
      if (!r.extra && r.need && r.need !== r.buy && !r.check) detail.push('needs ' + r.need);
      if (r.check && r.ifOut) detail.push('if you’re out: ' + r.ifOut);
      if (r.uses.length) detail.push(r.uses.join(', '));
      if (r.extra) detail.push('added by you');
      return '<li class="' + (r.have ? 'have' : '') + '"><input type="checkbox" id="' + id + '" data-have="' + esc(r.id) + '"' + (r.have ? ' checked' : '') + '><label for="' + id + '"><span class="mp-sn">' + esc(r.name) + '</span> <span class="mp-sb">' + esc(r.check ? r.check + ' (' + r.need + ')' : r.buy) + '</span>' + (detail.length ? '<small>' + esc(detail.join(' · ')) + '</small>' : '') + '</label>' + (r.extra ? '<button type="button" class="mp-x" data-xrm="' + esc(r.id) + '" aria-label="Remove ' + esc(r.name) + '">✕</button>' : '') + '</li>';
    }
    $('#sl-range', el).addEventListener('change', function () { st.shopRange = this.value; api.save(); V.shop(el, api); });
    el.onchange = function (e) { var t = e.target; if (t.dataset.have) { if (t.checked) p.pantry[t.dataset.have] = true; else delete p.pantry[t.dataset.have]; api.save(); V.shop(el, api); var b = D.getElementById(t.id); if (b) b.focus({ preventScroll: true }); } };
    el.onclick = function (e) {
      var x = e.target.closest('[data-xrm]'); if (x) { var id = x.dataset.xrm.slice(2); p.extras = p.extras.filter(function (q, i) { return String(q.id || i) !== id; }); api.save(); V.shop(el, api); }
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
    var st = api.st, p = api.plan(), data = api.data, rows = C.listRows(data, st, p, range).filter(function (r) { return !r.have; }), out = ['Shopping list: ' + p.name + ' (' + C.rangeLabel(p, range) + ')'], sec = null;
    rows.forEach(function (r) { if (r.section !== sec) { sec = r.section; out.push('', C.sectionName(data, sec).toUpperCase()); } out.push('☐ ' + r.name + (r.buy ? ' — ' + (r.check ? r.check + ' (' + r.need + ')' : r.buy) : '')); });
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
    var days = M.dayNutrition(p, ALL, data.cat), used = days.filter(function (d) { return d.meals && d.status !== 'none'; });
    h += '<p class="hs-small">For <b>one adult-sized portion</b> of every meal planned that day, estimated from USDA FoodData Central. Brands, portions and cooking change the real numbers, so treat these as a rough guide. % Daily Value is for a 2,000-calorie diet (FDA); many people need more or less. Others in the household eat their share: ' + st.people.filter(function (g) { return g.n; }).map(function (g) { return esc(g.label.toLowerCase()) + ' about ' + Math.round(g.f * 100) + '%'; }).join(', ') + '.</p>';
    if (!used.length) { el.innerHTML = h + '<p class="mp-empty">Add meals to the plan to see their estimates.</p>'; return; }
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
      var rn = M.recipeNutrition(r, data.cat), url = C.recipeURL(data, r);
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
    var cooked = C.cooked(data, st, p, wk.from, wk.to);
    var sel = st.prepSel = st.prepSel || {};
    var start = st.prepStart || '13:00', sm = (+start.split(':')[0]) * 60 + (+start.split(':')[1] || 0);
    var h = '<div class="mp-viewhead"><h2>Prep day</h2>' + weekSelect('pd-week', p, w) + '<label class="mp-f mp-inline">Start at <input type="time" id="pd-start" value="' + esc(start) + '" step="900"></label><div class="mp-actions"><button type="button" class="hs-btn" id="pd-print">🖨 Print or PDF</button></div></div>';
    h += '<p class="hs-small">Cook ahead on one afternoon (often Sunday) so weeknights are just reheat and serve. Tick the dishes to make ahead; the plan puts the slow cooker first, then the oven one temperature at a time, with stovetop jobs while things bake.</p>';
    if (!cooked.length) { el.innerHTML = h + '<p class="mp-empty">Add meals to this week first.</p>'; bind(); return; }
    h += '<ul class="mp-prepsel">';
    cooked.forEach(function (c) {
      var r = c.r, can = !!(r.prepDay && r.prepDay.ahead) || !!r.makeAhead || r.freezeOk, key = r.id;
      if (sel[key] == null) sel[key] = !!(r.prepDay && r.prepDay.ahead);
      h += '<li><label class="mp-cb"><input type="checkbox" data-ps="' + esc(key) + '"' + (sel[key] ? ' checked' : '') + '> ' + esc(C.emoji(r)) + ' <b>' + esc(r.name) + '</b> <small>' + M.fmtNum(c.servings) + ' portions' + (c.times > 1 ? ', cooked ' + c.times + ' times' : '') + '</small></label>' +
        (r.prepDay && r.prepDay.ahead ? '<small class="mp-ahead">Ahead: ' + esc(r.prepDay.ahead) + '</small>' : r.makeAhead ? '<small class="mp-ahead">' + esc(r.makeAhead) + '</small>' : !can ? '<small class="mp-ahead">Best made fresh.</small>' : '') + '</li>';
    });
    h += '</ul>';
    var jobs = cooked.filter(function (c) { return sel[c.r.id]; }).map(function (c) { return { r: c.r, servings: c.servings }; });
    if (jobs.length) {
      var plan2 = M.prepDay(jobs);
      h += '<h3>The plan</h3><ol class="mp-timeline">';
      plan2.steps.forEach(function (s) {
        var j = s.j, r = j.r, where = { slow: 'Slow cooker', oven: 'Oven', stove: 'Stovetop', counter: 'Counter' }[j.where];
        h += '<li><span class="mp-tt">' + clock(sm, s.at) + '</span><div><b>' + esc(C.emoji(r)) + ' ' + esc(r.name) + '</b> <span class="mp-where w-' + j.where + '">' + where + '</span>' +
          (s.heat ? '<br><small>Heat the oven to ' + s.heat + '°F' + (s.at > 0 ? ' (or reset it now)' : '') + '.</small>' : '') +
          '<br>' + esc(j.what || (j.where === 'counter' ? 'Mix, portion and pack.' : 'Cook as the recipe says.')) + ' <small>(' + C.mins(j.active) + ' hands-on' + (j.cook ? ', ready about ' + clock(sm, s.ready) : '') + ')</small>' +
          (j.keeps ? '<br><small>Keeps about ' + j.keeps + ' days in the fridge.</small>' : '') + (r.freezer ? '<br><small>❄️ ' + esc(r.freezer) + '</small>' : '') + '</div></li>';
      });
      h += '<li><span class="mp-tt">' + clock(sm, plan2.end) + '</span><div><b>Cool, label and pack</b><br>Refrigerate cooked food within 2 hours (1 hour if it’s above 90°F). Shallow containers cool fastest. Label each with the dish and the date, and reheat leftovers to 165°F.</div></li></ol>';
      if (plan2.slow) h += '<p class="hs-small">The slow cooker keeps going after you finish: turn it off (or to warm) about ' + clock(sm, plan2.slowEnd) + ', then cool and pack that dish the same way.</p>';
      h += '<p class="hs-small">Timing is a rough guide built from each recipe’s hands-on and cooking times. See <a href="' + esc(guideURL(data, 'food-safety')) + '">food safety</a> for safe temperatures and storage times.</p>';
    } else h += '<p class="mp-empty">Tick at least one dish to get a schedule.</p>';
    el.innerHTML = h; bind();
    function bind() {
      var ws = $('#pd-week', el); if (ws) ws.addEventListener('change', function () { st.prepWeek = +this.value; api.save(); V.prep(el, api); });
      $('#pd-start', el).addEventListener('change', function () { if (this.value) { st.prepStart = this.value; api.save(); V.prep(el, api); } });
      el.onchange = function (e) { var t = e.target; if (t.dataset.ps) { sel[t.dataset.ps] = t.checked; api.save(); V.prep(el, api); var b = $('[data-ps="' + t.dataset.ps + '"]', el); if (b) b.focus(); } };
      $('#pd-print', el).addEventListener('click', function () { V.toPrint(api, { inc: ['prep'], range: 'w' + w }); });
    }
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
