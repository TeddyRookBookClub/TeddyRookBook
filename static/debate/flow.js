/* Flow sheet page (layouts/debate/flow.html). Model in flow-core.js; flows saved in TRBDebate part "flows". */
(function () {
  'use strict';
  var D = window.TRBDebate, T = window.DebateTimerCore, F = window.DebateFlowCore, $ = D.$, esc = D.esc;
  var root = $('#dbf');
  if (!root || !F) return;
  var formats = T.normalizeAll(D.json('db-formats') || []);
  function fmtBy(k) { for (var i = 0; i < formats.length; i++) if (formats[i].key === k) return formats[i]; return null; }
  var flows = D.part('flows', []);
  var ui = D.part('ui', {});
  var cur = null;
  var el = {
    pick: $('#dbf-pick'), nw: $('#dbf-new'), rename: $('#dbf-rename'), del: $('#dbf-del'), box: $('#dbf-newbox'), fmt: $('#dbf-fmt'), name: $('#dbf-name'), cx: $('#dbf-cx'),
    make: $('#dbf-make'), cancel: $('#dbf-cancel'), title: $('#dbf-title'), scroll: $('#dbf-scroll'), grid: $('#dbf-grid'), arrows: $('#dbf-arrows'), msg: $('#dbf-msg'),
    print: $('#dbf-print'), text: $('#dbf-text'), json: $('#dbf-json'), load: $('#dbf-load'), blanks: $('#dbf-blanks'), area: $('#dbf-printarea')
  };
  if (!D.canSave()) $('#dbf-nostore').hidden = false;

  var saveT = 0;
  function save(now) { clearTimeout(saveT); if (now) D.save(); else saveT = setTimeout(D.save, 400); }

  /* ---------- flows list ---------- */
  function fillPick() {
    flows.sort(function (a, b) { return b.updated - a.updated; });
    el.pick.innerHTML = flows.map(function (f) {
      var fm = fmtBy(f.fmt);
      return '<option value="' + esc(f.id) + '">' + esc(f.name) + (fm ? ' · ' + esc(fm.short) : '') + '</option>';
    }).join('');
    if (cur) el.pick.value = cur.id;
    el.rename.disabled = el.del.disabled = !cur;
  }
  function open(fid) {
    cur = null;
    flows.forEach(function (f) { if (f.id === fid) cur = f; });
    if (!cur && flows.length) cur = flows[0];
    ui.flow = cur ? cur.id : null;
    fillPick();
    render();
  }
  function newFlow(fmtKey, name, cx) {
    var f = fmtBy(fmtKey) || formats[0];
    var fl = F.make(f, { name: name || (f.short + ' flow ' + D.stamp()), cx: cx });
    F.add(fl, 0, '');
    flows.unshift(fl);
    open(fl.id);
    save(true);
    focusCard(fl.cards[0].id);
  }

  /* ---------- drawing ---------- */
  function render() {
    if (!cur) {
      el.title.textContent = '';
      el.grid.innerHTML = '<p class="dbf-empty">No flow yet. Press <b>＋ New flow</b> and pick the format of your round.</p>';
      el.grid.style.gridTemplateColumns = '';
      el.arrows.innerHTML = '';
      return;
    }
    var fm = fmtBy(cur.fmt);
    el.title.textContent = cur.name + (fm ? ' · ' + fm.name : '');
    var nc = cur.cols.length, mr = F.maxRow(cur);
    el.grid.style.gridTemplateColumns = 'repeat(' + nc + ', minmax(200px, 1fr))';
    var h = '';
    cur.cols.forEach(function (c, j) {
      h += '<div class="dbf-head dbx-s' + (c.si >= 0 ? c.si : 'x') + '" style="grid-column:' + (j + 1) + ';grid-row:1"><span class="dbf-hs">' + esc(c.short) + '</span> <span class="dbf-hn">' + esc(c.name) + '</span>' +
        '<button type="button" class="dbf-add" data-col="' + j + '" aria-label="New argument in ' + esc(c.name) + '" title="New argument in this column">＋</button></div>';
    });
    for (var r = 0; r <= mr; r++) {
      for (var j = 0; j < nc; j++) {
        var cards = F.cell(cur, r, j);
        h += '<div class="dbf-cell' + (cards.length ? '' : ' is-empty') + '" style="grid-column:' + (j + 1) + ';grid-row:' + (r + 2) + '">';
        cards.forEach(function (k) { h += cardHTML(k, j, r); });
        h += '</div>';
      }
    }
    cur.cols.forEach(function (c, j) {
      h += '<div class="dbf-foot" style="grid-column:' + (j + 1) + ';grid-row:' + (mr + 3) + '"><button type="button" class="dbf-add2" data-col="' + j + '">＋ New argument</button></div>';
    });
    el.grid.innerHTML = h;
    Array.prototype.forEach.call(el.grid.querySelectorAll('textarea'), function (t) { D.autosize(t); });
    requestAnimationFrame(drawArrows);
  }
  function cardHTML(k, j, r) {
    var c = cur.cols[j], last = j >= cur.cols.length - 1;
    return '<div class="dbf-card dbx-s' + (c.si >= 0 ? c.si : 'x') + (k.dropped ? ' is-dropped' : '') + '" data-id="' + esc(k.id) + '">' +
      '<textarea rows="2" aria-label="' + esc(c.short + ', argument ' + (r + 1)) + '" placeholder="' + (k.parent ? 'Answer…' : 'Argument…') + '">' + esc(k.text) + '</textarea>' +
      '<div class="dbf-tools">' +
      (last ? '' : '<button type="button" data-a="ans" title="Answer in the next column" aria-label="Answer in the next column">→</button>') +
      '<button type="button" data-a="below" title="Another point below" aria-label="Another point below">⊕</button>' +
      '<button type="button" data-a="drop" title="Dropped (not answered)" aria-label="Dropped" aria-pressed="' + (k.dropped ? 'true' : 'false') + '">⚑</button>' +
      '<button type="button" data-a="del" title="Delete" aria-label="Delete">✕</button>' +
      '</div>' + (k.dropped ? '<span class="dbf-dropped">dropped</span>' : '') + '</div>';
  }
  function drawArrows() {
    if (!cur) return;
    var box = el.scroll.getBoundingClientRect();
    var sl = el.scroll.scrollLeft, st = el.scroll.scrollTop;
    var W = el.grid.scrollWidth, H = el.grid.offsetHeight + el.grid.offsetTop;
    el.arrows.setAttribute('width', W); el.arrows.setAttribute('height', H);
    el.arrows.style.width = W + 'px'; el.arrows.style.height = H + 'px';
    var p = '';
    cur.cards.forEach(function (k) {
      if (!k.parent) return;
      var a = el.grid.querySelector('[data-id="' + cssq(k.parent) + '"]'), b = el.grid.querySelector('[data-id="' + cssq(k.id) + '"]');
      if (!a || !b) return;
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var x1 = ra.right - box.left + sl - 2, y1 = ra.top - box.top + st + Math.min(22, ra.height / 2);
      var x2 = rb.left - box.left + sl + 1, y2 = rb.top - box.top + st + Math.min(22, rb.height / 2);
      if (x2 <= x1) return;
      var mx = (x1 + x2) / 2;
      var si = cur.cols[k.col] ? cur.cols[k.col].si : -1;
      p += '<g class="dbx-s' + (si >= 0 ? si : 'x') + '"><path d="M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + (x2 - 6) + ' ' + y2 + '"/>' +
        '<path class="dbf-ah" d="M' + (x2 - 8) + ' ' + (y2 - 5) + ' L' + x2 + ' ' + y2 + ' L' + (x2 - 8) + ' ' + (y2 + 5) + ' z"/></g>';
    });
    el.arrows.innerHTML = p;
  }
  function cssq(s) { return String(s).replace(/["\\]/g, '\\$&'); }
  function focusCard(cid) {
    var t = el.grid.querySelector('[data-id="' + cssq(cid) + '"] textarea');
    if (t) { t.focus(); try { t.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { } }
  }

  /* ---------- editing ---------- */
  el.grid.addEventListener('input', function (e) {
    var t = e.target; if (t.tagName !== 'TEXTAREA' || !cur) return;
    var k = F.byId(cur, t.closest('.dbf-card').dataset.id);
    if (k) { k.text = t.value; cur.updated = Date.now(); save(); drawArrows(); }
  });
  function doAct(a, cid) {
    var k;
    if (a === 'ans') { k = F.answer(cur, cid); if (!k) { D.say(el.msg, 'That’s the last speech, so there’s no column to answer in.'); return; } }
    else if (a === 'below') k = F.below(cur, cid);
    else if (a === 'drop') F.toggleDrop(cur, cid);
    else if (a === 'del') {
      var c = F.byId(cur, cid);
      if (c && String(c.text).trim() && !confirm('Delete this card?')) return;
      F.remove(cur, cid);
    }
    render(); save(true);
    if (k) focusCard(k.id); else if (a === 'drop') { var b = el.grid.querySelector('[data-id="' + cssq(cid) + '"] [data-a="drop"]'); if (b) b.focus(); }
  }
  el.grid.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !cur) return;
    if (b.dataset.col != null) { var k = F.add(cur, +b.dataset.col, ''); render(); save(true); focusCard(k.id); return; }
    var card = b.closest('.dbf-card');
    if (card && b.dataset.a) doAct(b.dataset.a, card.dataset.id);
  });
  el.grid.addEventListener('keydown', function (e) {
    var t = e.target; if (t.tagName !== 'TEXTAREA') return;
    var cid = t.closest('.dbf-card').dataset.id;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doAct(e.shiftKey ? 'below' : 'ans', cid); }
    else if (e.key === 'Escape') t.blur();
  });
  window.addEventListener('resize', function () { requestAnimationFrame(drawArrows); });

  /* ---------- toolbar ---------- */
  el.pick.addEventListener('change', function () { open(el.pick.value); save(true); });
  el.nw.addEventListener('click', function () { el.box.hidden = false; el.name.value = ''; if (ui.flowFmt && fmtBy(ui.flowFmt)) el.fmt.value = ui.flowFmt; el.fmt.focus(); });
  el.cancel.addEventListener('click', function () { el.box.hidden = true; el.nw.focus(); });
  el.make.addEventListener('click', function () { ui.flowFmt = el.fmt.value; el.box.hidden = true; newFlow(el.fmt.value, el.name.value.trim(), el.cx.checked); });
  el.rename.addEventListener('click', function () {
    if (!cur) return;
    var n = prompt('Name this flow', cur.name);
    if (n && n.trim()) { cur.name = n.trim().slice(0, 200); cur.updated = Date.now(); fillPick(); render(); save(true); }
  });
  el.del.addEventListener('click', function () {
    if (!cur || !confirm('Delete the flow “' + cur.name + '”? This can’t be undone.')) return;
    var i = flows.indexOf(cur); if (i >= 0) flows.splice(i, 1);
    cur = null; open(flows[0] && flows[0].id); save(true);
    D.say(el.msg, 'Flow deleted.');
  });
  el.text.addEventListener('click', function () {
    if (!cur) return;
    var fm = fmtBy(cur.fmt);
    D.download(slug(cur.name) + '.txt', F.toText(cur, fm && fm.name));
  });
  el.json.addEventListener('click', function () {
    if (!cur) return;
    D.download(slug(cur.name) + '.flow.json', JSON.stringify({ kind: 'trb-debate-flow', v: 1, flow: cur }, null, 1), 'application/json');
  });
  el.load.addEventListener('click', function () {
    D.pickFile('.json,application/json', function (text) {
      var o; try { o = JSON.parse(text); } catch (e) { D.say(el.msg, 'That file isn’t a flow this page can read.'); return; }
      var list = o && o.kind === 'trb-debate-flow' ? [o.flow] : (o && o.kind === 'trb-debate-backup' && o.data ? o.data.flows || [] : []);
      var added = 0, last = null;
      list.forEach(function (x) {
        var fl = F.clean(x); if (!fl) return;
        flows.forEach(function (f) { if (f.id === fl.id) fl.id = fl.id + '-' + Date.now().toString(36); });
        flows.unshift(fl); added++; last = fl;
      });
      if (!added) { D.say(el.msg, 'No flows found in that file.'); return; }
      open(last.id); save(true);
      D.say(el.msg, added === 1 ? 'Opened “' + last.name + '”.' : added + ' flows added.');
    });
  });
  function slug(s) { return String(s || 'flow').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'flow'; }

  /* ---------- printing ---------- */
  function sheetHTML(title, cols, rows, fill) {
    var h = '<section class="dbf-sheet"><h2>' + esc(title) + '</h2><table class="dbf-ptable"><thead><tr>';
    cols.forEach(function (c) { h += '<th scope="col" class="dbx-s' + (c.si >= 0 ? c.si : 'x') + '"><b>' + esc(c.short) + '</b> <span>' + esc(c.name) + '</span></th>'; });
    h += '</tr></thead><tbody>';
    if (fill) {
      for (var r = 0; r <= F.maxRow(cur); r++) {
        h += '<tr>';
        for (var j = 0; j < cols.length; j++) {
          h += '<td>' + F.cell(cur, r, j).map(function (k) { return '<div class="dbf-pc' + (k.dropped ? ' is-dropped' : '') + '">' + esc(k.text).replace(/\n/g, '<br>') + (k.dropped ? ' <i>(dropped)</i>' : '') + '</div>'; }).join('') + '</td>';
        }
        h += '</tr>';
      }
    } else {
      h += '<tr class="dbf-blankrow">' + cols.map(function () { return '<td></td>'; }).join('') + '</tr>';
    }
    return h + '</tbody></table><p class="dbf-pfoot">Teddy Rook Book · Debate flow sheet</p></section>';
  }
  function printCurrent() {
    if (!cur) return false;
    var fm = fmtBy(cur.fmt);
    el.area.innerHTML = sheetHTML(cur.name + (fm ? ' · ' + fm.name : ''), cur.cols, 0, true);
    return true;
  }
  function printBlank(key) {
    var f = fmtBy(key); if (!f) return;
    el.area.innerHTML = F.blankSheets(f).map(function (s) {
      if (s.table) return '<section class="dbf-sheet"><h2>' + esc(s.title) + '</h2><table class="dbf-ptable dbf-lines"><thead><tr>' + s.cols.map(function (c) { return '<th scope="col">' + esc(c.name) + '</th>'; }).join('') + '</tr></thead><tbody>' + new Array(s.rows + 1).join('<tr>' + s.cols.map(function () { return '<td></td>'; }).join('') + '</tr>') + '</tbody></table><p class="dbf-pfoot">Teddy Rook Book · Debate flow sheet</p></section>';
      return sheetHTML(s.title, s.cols, 0, false);
    }).join('');
    document.documentElement.dataset.dbprint = 'blank';
    window.print();
  }
  el.print.addEventListener('click', function () { if (printCurrent()) { document.documentElement.dataset.dbprint = 'flow'; window.print(); } });
  window.addEventListener('beforeprint', function () { if (!document.documentElement.dataset.dbprint) { if (printCurrent()) document.documentElement.dataset.dbprint = 'flow'; } });
  window.addEventListener('afterprint', function () { delete document.documentElement.dataset.dbprint; });
  el.blanks.innerHTML = formats.map(function (f) {
    var sh = F.blankSheets(f);
    return '<div class="dbf-bl"><b>' + esc(f.name) + '</b><span class="hs-small">' + sh.length + (sh.length === 1 ? ' sheet' : ' sheets') + ' · ' + esc(sh[0].cols.map(function (c) { return c.short; }).join(', ')) + '</span><button type="button" class="hs-btn" data-blank="' + esc(f.key) + '">🖨 Print blank flow</button></div>';
  }).join('');
  el.blanks.addEventListener('click', function (e) { var b = e.target.closest('[data-blank]'); if (b) printBlank(b.dataset.blank); });

  open(ui.flow);
  window.__dbf = { flows: function () { return flows; }, cur: function () { return cur; }, newFlow: newFlow, printBlank: function (k) { var p = window.print; window.print = function () { }; printBlank(k); window.print = p; } };
})();
