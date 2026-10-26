/* Meal Prep planner: the editor for the cook's own recipes (saved in the planner's state as st.mine).
   Ingredients come from the grocery catalog (search by name) or are written in by hand, with an optional
   section and nutrition for the amount used. Saved in the same shape as data/meals/recipes.json. */
(function (W, D) {
  'use strict';
  var M = W.MealModel, C = W.MealCommon, $ = C.$, $$ = C.$$, esc = C.esc;
  var MEALS = ['breakfast', 'lunch', 'dinner', 'snack', 'side'];
  var TAGS = [['quick', 'Quick'], ['budget', 'Budget'], ['kid-friendly', 'Kid-friendly'], ['freezer-friendly', 'Freezer-friendly'], ['make-ahead', 'Make-ahead'], ['lunchbox', 'Lunchbox'], ['slow-cooker', 'Slow cooker'], ['sheet-pan', 'Sheet pan'], ['one-pot', 'One pot'], ['grill', 'Grill']];
  var WUNITS = ['each', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'fl-oz', 'can', 'package', 'jar', 'bunch', 'slice', 'clove', 'pinch'];
  var NF = [['kcal', 'Calories'], ['protein', 'Protein g'], ['fat', 'Fat g'], ['satfat', 'Sat. fat g'], ['carb', 'Carbs g'], ['fiber', 'Fiber g'], ['sugars', 'Sugars g'], ['sodium', 'Sodium mg']];

  function unitsFor(it) {
    var u = ['oz', 'lb', 'g'];
    if (it && it.gml) u = ['cup', 'tbsp', 'tsp', 'fl-oz', 'ml'].concat(u);
    if (it) Object.keys(it.units).reverse().forEach(function (k) { u.unshift(k); });
    return u;
  }
  function unitLabel(u, it) { if (u === 'each') return it && it.countLabel ? it.countLabel : 'whole'; if (u === 'fl-oz') return 'fl oz'; return u; }

  function open(api, id, base) {
    var st = api.st, data = api.data, raw;
    if (id && st.mine[id]) raw = JSON.parse(JSON.stringify(st.mine[id]));
    else if (base) raw = fromRecipe(base, data);
    else raw = { name: '', emoji: '', servings: 4, meal: ['dinner'], tags: [], times: { prep: 15, cook: 30 }, ingredients: [], steps: [] };
    var rows = (raw.ingredients || []).map(function (i) { return Object.assign({}, i, !i.item && i.name ? { write: true } : {}); });
    if (!rows.length) rows.push({});
    var h = '<form id="ed-form" class="mp-ed" autocomplete="off">' +
      '<div class="mp-edrow"><label class="mp-f mp-grow">Name <input type="text" id="ed-name" required maxlength="80" value="' + esc(raw.name) + '" placeholder="Grandma’s chicken and rice"></label><label class="mp-f mp-emo-in">Picture <input type="text" id="ed-emoji" maxlength="4" value="' + esc(raw.emoji || '') + '" placeholder="🍲" aria-label="An emoji for the recipe"></label></div>' +
      '<div class="mp-edrow"><label class="mp-f">Makes <input type="number" id="ed-serv" min="1" max="60" value="' + (raw.servings || 4) + '"> <span class="hs-small">servings</span></label><label class="mp-f">Prep <input type="number" id="ed-prep" min="0" max="999" value="' + ((raw.times && raw.times.prep) || 0) + '"> <span class="hs-small">min</span></label><label class="mp-f">Cook <input type="number" id="ed-cook" min="0" max="2000" value="' + ((raw.times && raw.times.cook) || 0) + '"> <span class="hs-small">min</span></label></div>' +
      '<fieldset class="mp-edfs"><legend>Good for</legend><div class="mp-checks">' + MEALS.map(function (m) { return '<label class="mp-cb"><input type="checkbox" data-meal="' + m + '"' + ((raw.meal || []).indexOf(m) >= 0 ? ' checked' : '') + '> ' + (m === 'side' ? 'Side dish' : C.SLOTNAME[m] || m) + '</label>'; }).join('') + '</div></fieldset>' +
      '<fieldset class="mp-edfs"><legend>Tags</legend><div class="mp-checks">' + TAGS.map(function (t) { return '<label class="mp-cb"><input type="checkbox" data-tag="' + t[0] + '"' + ((raw.tags || []).indexOf(t[0]) >= 0 ? ' checked' : '') + '> ' + t[1] + '</label>'; }).join('') + '</div>' +
      '<label class="mp-f">Main protein <select id="ed-prot">' + ['', 'beef', 'chicken', 'pork', 'turkey', 'fish', 'vegetarian'].map(function (p) { return '<option value="' + p + '"' + (raw.protein === p ? ' selected' : '') + '>' + (p || '—') + '</option>'; }).join('') + '</select></label></fieldset>' +
      '<fieldset class="mp-edfs"><legend>Ingredients</legend><p class="hs-small">Start typing to pick from about ' + data.items.length + ' grocery items. If it isn’t there, keep typing and choose “write in”.</p><div id="ed-ings"></div><button type="button" class="hs-btn ghost" id="ed-adding">＋ Another ingredient</button></fieldset>' +
      '<label class="mp-f">Steps <span class="hs-small">(one per line)</span><textarea id="ed-steps" rows="5">' + esc((raw.steps || []).join('\n')) + '</textarea></label>' +
      '<label class="mp-f">Notes for the freezer or making ahead <input type="text" id="ed-ahead" maxlength="200" value="' + esc(raw.make_ahead || '') + '"></label>' +
      '<p class="mp-ederr" id="ed-err" role="alert"></p>' +
      '<div class="mp-dlgbtns"><button type="submit" class="hs-btn pri">Save recipe</button>' + (id ? '<button type="button" class="hs-btn" id="ed-dup">Duplicate</button><button type="button" class="hs-btn" id="ed-del">Delete</button>' : '') + '</div></form>';
    api.sheet(id ? 'Edit my recipe' : base ? 'My version of ' + base.name : 'My own recipe', h, function (dlg) {
      var box = $('#ed-ings', dlg);
      function draw() { box.innerHTML = rows.map(rowHTML).join(''); }
      function rowHTML(r, i) {
        var it = r.item ? data.cat[r.item] : null, wi = !it && r.name != null && r.name !== '' && r.write;
        var nm = it ? it.name : (r.name || '');
        var units = it ? unitsFor(it) : WUNITS, u = r.unit || (it ? (it.units.each ? 'each' : it.gml ? 'cup' : 'oz') : 'each');
        if (units.indexOf(u) < 0) units = [u].concat(units);
        var hh = '<div class="mp-ing" data-row="' + i + '"><div class="mp-ingmain"><input type="text" class="mp-ingq" value="' + esc(nm) + '" placeholder="Ingredient" aria-label="Ingredient ' + (i + 1) + '" data-q="' + i + '"><input type="number" class="mp-inga" min="0" step="any" value="' + (r.amount != null ? r.amount : '') + '" placeholder="1" aria-label="Amount" data-a="' + i + '">' +
          '<select class="mp-ingu" data-u="' + i + '" aria-label="Unit">' + units.map(function (x) { return '<option value="' + x + '"' + (x === u ? ' selected' : '') + '>' + esc(unitLabel(x, it)) + '</option>'; }).join('') + '</select>' +
          '<button type="button" class="mp-x" data-del="' + i + '" aria-label="Remove ingredient ' + (i + 1) + '">✕</button></div>' +
          '<input type="text" class="mp-ingn" value="' + esc(r.prep || '') + '" placeholder="chopped, softened… (optional)" aria-label="Note" data-n="' + i + '">' +
          '<div class="mp-sugg" data-sugg="' + i + '" hidden></div>';
        if (wi) {
          hh += '<div class="mp-wi"><span class="mp-witag">Write-in</span> <label class="mp-f mp-inline">Store section <select data-sec="' + i + '">' + data.sectionOrder.concat(['other']).map(function (s) { return '<option value="' + s + '"' + (r.section === s ? ' selected' : '') + '>' + esc(C.sectionName(data, s)) + '</option>'; }).join('') + '</select></label>' +
            '<details' + (r.nutrition ? ' open' : '') + '><summary>Nutrition for this amount (optional)</summary><div class="mp-wnut">' + NF.map(function (f) { return '<label class="mp-f">' + f[1] + ' <input type="number" min="0" step="any" data-nf="' + f[0] + '" data-ni="' + i + '" value="' + (r.nutrition && r.nutrition[f[0]] != null ? r.nutrition[f[0]] : '') + '"></label>'; }).join('') + '</div><p class="hs-small">From the package’s Nutrition Facts: multiply the per-serving numbers by how many servings the recipe uses.</p></details></div>';
        }
        return hh + '</div>';
      }
      draw();
      function search(q) {
        q = q.toLowerCase().trim(); if (!q) return [];
        var words = q.split(/\s+/);
        return data.items.map(function (it) {
          var hay = (it.name + ' ' + it.aliases.join(' ')).toLowerCase(), sc = 0;
          for (var i = 0; i < words.length; i++) { var p = hay.indexOf(words[i]); if (p < 0) return null; sc += p === 0 ? 0 : hay.charAt(p - 1) === ' ' ? 1 : 3; }
          return { it: it, sc: sc + it.name.length / 100 };
        }).filter(Boolean).sort(function (a, b) { return a.sc - b.sc; }).slice(0, 8).map(function (x) { return x.it; });
      }
      var active = -1;
      box.addEventListener('input', function (e) {
        var t = e.target;
        if (t.dataset.q != null) {
          var i = +t.dataset.q, sg = $('[data-sugg="' + i + '"]', box), res = search(t.value);
          rows[i].item = null; rows[i].name = t.value; rows[i].write = false;
          active = -1;
          sg.innerHTML = res.map(function (it, j) { return '<button type="button" data-pick="' + i + '" data-id="' + esc(it.id) + '" id="ed-s' + i + '-' + j + '">' + esc(it.name) + ' <small>' + esc(C.sectionName(data, it.section)) + '</small></button>'; }).join('') + (t.value.trim() ? '<button type="button" data-write="' + i + '">✏️ Write in “' + esc(t.value.trim()) + '”</button>' : '');
          sg.hidden = !t.value.trim();
        } else if (t.dataset.a != null) rows[+t.dataset.a].amount = t.value === '' ? null : +t.value;
        else if (t.dataset.n != null) rows[+t.dataset.n].prep = t.value;
        else if (t.dataset.nf) { var r = rows[+t.dataset.ni]; r.nutrition = r.nutrition || {}; if (t.value === '') delete r.nutrition[t.dataset.nf]; else r.nutrition[t.dataset.nf] = +t.value; }
      });
      box.addEventListener('change', function (e) { var t = e.target; if (t.dataset.u != null) rows[+t.dataset.u].unit = t.value; if (t.dataset.sec != null) rows[+t.dataset.sec].section = t.value; });
      box.addEventListener('keydown', function (e) {
        var t = e.target; if (t.dataset.q == null) return;
        var sg = $('[data-sugg="' + t.dataset.q + '"]', box), bs = $$('button', sg);
        if (sg.hidden || !bs.length) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length; bs.forEach(function (b, j) { b.classList.toggle('on', j === active); }); }
        else if (e.key === 'Enter') { e.preventDefault(); (bs[active >= 0 ? active : 0]).click(); }
        else if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); sg.hidden = true; }
      });
      box.addEventListener('click', function (e) {
        var p = e.target.closest('[data-pick]');
        if (p) { var i = +p.dataset.pick, it = data.cat[p.dataset.id]; rows[i] = { item: it.id, amount: rows[i].amount, unit: unitsFor(it)[0], prep: rows[i].prep || '' }; draw(); var a = $('[data-a="' + i + '"]', box); if (a) a.focus(); return; }
        var w = e.target.closest('[data-write]');
        if (w) { var j = +w.dataset.write; rows[j].write = true; rows[j].item = null; rows[j].section = rows[j].section || 'other'; rows[j].unit = rows[j].unit || 'each'; draw(); var a2 = $('[data-a="' + j + '"]', box); if (a2) a2.focus(); return; }
        var d = e.target.closest('[data-del]'); if (d) { rows.splice(+d.dataset.del, 1); if (!rows.length) rows.push({}); draw(); }
      });
      $('#ed-adding', dlg).addEventListener('click', function () { rows.push({}); draw(); $$('.mp-ingq', box).pop().focus(); });
      $('#ed-form', dlg).addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('#ed-name', dlg).value.trim(), err = $('#ed-err', dlg);
        var ings = rows.filter(function (r) { return r.item || (r.name && r.name.trim()); }).map(function (r) {
          if (r.item) return { item: r.item, amount: r.amount || 0, unit: r.unit || 'each', prep: r.prep || '' };
          var o = { item: null, name: r.name.trim(), section: r.section || 'other', amount: r.amount || 0, unit: r.unit || 'each', prep: r.prep || '' };
          if (r.nutrition && Object.keys(r.nutrition).length) o.nutrition = r.nutrition;
          return o;
        });
        var meals = $$('[data-meal]', dlg).filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.meal; });
        if (!name) { err.textContent = 'Give the recipe a name.'; $('#ed-name', dlg).focus(); return; }
        if (!meals.length) { err.textContent = 'Pick at least one meal it’s good for.'; return; }
        var prep = +$('#ed-prep', dlg).value || 0, cook = +$('#ed-cook', dlg).value || 0;
        var rec = { name: name, emoji: $('#ed-emoji', dlg).value.trim(), servings: Math.max(1, +$('#ed-serv', dlg).value || 4), meal: meals, protein: $('#ed-prot', dlg).value, method: [],
          tags: $$('[data-tag]', dlg).filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.tag; }),
          times: { prep: prep, cook: cook, total: prep + cook }, ingredients: ings, steps: $('#ed-steps', dlg).value.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean),
          make_ahead: $('#ed-ahead', dlg).value.trim(), own: true, updated: C.iso(new Date()) };
        if (rec.tags.indexOf('slow-cooker') >= 0) rec.method.push('slow-cooker');
        var nid = id || 'my-' + C.uid('r');
        st.mine[nid] = rec; api.refreshRecipes(); api.save(); api.closeSheet(); api.renderLib(); api.renderCal(); api.renderView();
        api.msg('Saved “' + name + '”. It’s under ⭐ My recipes in the list.');
      });
      var dup = $('#ed-dup', dlg); if (dup) dup.addEventListener('click', function () { var c = JSON.parse(JSON.stringify(st.mine[id])); c.name += ' (copy)'; var nid = 'my-' + C.uid('r'); st.mine[nid] = c; api.refreshRecipes(); api.save(); api.closeSheet(); api.renderLib(); open(api, nid); });
      var del = $('#ed-del', dlg); if (del) del.addEventListener('click', function () {
        var used = st.plans.some(function (p) { return Object.keys(p.cells).some(function (k) { return p.cells[k].some(function (e) { return e.r === id; }); }); });
        if (used && !W.confirm('This recipe is on a plan. Delete it and take it off every plan?')) return;
        api.snapshot();
        delete st.mine[id];
        st.plans.forEach(function (p) { Object.keys(p.cells).forEach(function (k) { p.cells[k] = p.cells[k].filter(function (e) { return e.r !== id; }); if (!p.cells[k].length) delete p.cells[k]; }); });
        api.refreshRecipes(); api.save(); api.closeSheet(); api.renderAll(); api.msg('Deleted.', true);
      });
      setTimeout(function () { if (!id) $('#ed-name', dlg).focus(); }, 30);
    }, 'wide');
  }
  // start "my version" from a built-in recipe (normalized form back to the data shape)
  function fromRecipe(r, data) {
    return { name: r.name + ' (my way)', emoji: r.emoji, servings: r.servings, meal: r.meals.slice(), protein: r.protein, tags: r.tags.slice(), times: { prep: r.prep, cook: r.cook },
      ingredients: r.ing.map(function (i) { return i.item ? { item: i.item, amount: i.amt, unit: M.unitKey(i.unit) === 'floz' ? 'fl-oz' : i.unit, prep: i.note } : { item: null, name: i.w.name, section: i.w.section, amount: i.amt, unit: i.unit, prep: i.note, write: true }; }),
      steps: r.steps.slice(), make_ahead: r.makeAhead };
  }
  W.MealEditor = { open: open };
})(window, document);
