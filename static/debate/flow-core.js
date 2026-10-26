/* Flow sheet model (no DOM). A flow: {id, name, fmt, cols:[{short,name,side,si}], cards:[{id,col,row,text,parent,dropped}], made, updated}.
   Rows are whole numbers; several cards may share a cell (e.g. three answers to one argument). Used by flow.js and the Node tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./timer-core.js'));
  else root.DebateFlowCore = factory(root.DebateTimerCore);
})(typeof self !== 'undefined' ? self : this, function (T) {
  'use strict';
  var n = 0;
  function id() { return 'c' + Date.now().toString(36) + (n++).toString(36) + Math.random().toString(36).slice(2, 5); }
  function isCross(s) { return /cross/.test(s.kind || ''); }

  // the flow's columns for a format: each speech (cross-ex only when asked); repeating formats get one column per speech
  function columnsFor(f, opts) {
    opts = opts || {};
    var plan = T.buildPlan(f, { cycles: opts.cycles || 8 });
    var cols = [];
    plan.segs.forEach(function (s) {
      if (isCross(s) && !opts.cx) return;
      var si = -1; f.sides.forEach(function (x, j) { if (x.id === s.side) si = j; });
      if (isCross(s) && s.asker) f.sides.forEach(function (x, j) { if (x.id === s.asker) si = j; });
      cols.push({ short: s.short, name: s.name, side: s.side, si: si });
    });
    return cols;
  }
  function make(f, opts) {
    opts = opts || {};
    var t = Date.now();
    return { id: 'f' + t.toString(36) + Math.random().toString(36).slice(2, 5), name: opts.name || (f.short + ' flow'), fmt: f.key, cols: columnsFor(f, opts), cards: [], made: t, updated: t };
  }
  function byId(fl, cid) { for (var i = 0; i < fl.cards.length; i++) if (fl.cards[i].id === cid) return fl.cards[i]; return null; }
  function maxRow(fl) { return fl.cards.reduce(function (m, c) { return Math.max(m, c.row); }, -1); }
  function touch(fl) { fl.updated = Date.now(); }

  // a new argument at the bottom of a column
  function add(fl, col, text) {
    var c = { id: id(), col: Math.max(0, Math.min(fl.cols.length - 1, col)), row: maxRow(fl) + 1, text: text || '', parent: null };
    fl.cards.push(c); touch(fl);
    return c;
  }
  // an answer to a card, in the next column on the same row (null if it's already the last column)
  function answer(fl, cid, text) {
    var p = byId(fl, cid);
    if (!p || p.col >= fl.cols.length - 1) return null;
    var c = { id: id(), col: p.col + 1, row: p.row, text: text || '', parent: p.id };
    fl.cards.push(c); touch(fl);
    return c;
  }
  // another point in the same column on a new row just under this card's row (later rows move down)
  function below(fl, cid, text) {
    var p = byId(fl, cid);
    if (!p) return null;
    fl.cards.forEach(function (c) { if (c.row > p.row) c.row++; });
    var c = { id: id(), col: p.col, row: p.row + 1, text: text || '', parent: null };
    fl.cards.push(c); touch(fl);
    return c;
  }
  // delete a card; its answers point to what it answered instead; empty rows close up
  function remove(fl, cid) {
    var p = byId(fl, cid);
    if (!p) return false;
    fl.cards = fl.cards.filter(function (c) { return c.id !== cid; });
    fl.cards.forEach(function (c) { if (c.parent === cid) c.parent = p.parent || null; });
    compact(fl); touch(fl);
    return true;
  }
  function compact(fl) {
    var used = {}; fl.cards.forEach(function (c) { used[c.row] = 1; });
    var rows = Object.keys(used).map(Number).sort(function (a, b) { return a - b; });
    var map = {}; rows.forEach(function (r, i) { map[r] = i; });
    fl.cards.forEach(function (c) { c.row = map[c.row]; });
  }
  function toggleDrop(fl, cid) { var c = byId(fl, cid); if (c) { c.dropped = !c.dropped; touch(fl); } return c; }
  function cell(fl, row, col) { return fl.cards.filter(function (c) { return c.row === row && c.col === col; }); }

  // cards nobody answered: no card in a later column on the same row from the other side
  function unanswered(fl) {
    return fl.cards.filter(function (c) {
      if (!String(c.text).trim()) return false;
      var mySide = fl.cols[c.col] && fl.cols[c.col].si;
      return !fl.cards.some(function (d) { return d.row === c.row && d.col > c.col && fl.cols[d.col] && fl.cols[d.col].si !== mySide && String(d.text).trim(); }) &&
        fl.cols.some(function (col, j) { return j > c.col && col.si !== mySide; });
    });
  }

  // plain text: one block per row, each column's points indented under it
  function toText(fl, fmtName) {
    var out = [fl.name + (fmtName ? ' (' + fmtName + ')' : ''), ''];
    var mr = maxRow(fl);
    for (var r = 0; r <= mr; r++) {
      var lines = [];
      for (var c = 0; c < fl.cols.length; c++) {
        cell(fl, r, c).forEach(function (k) {
          if (!String(k.text).trim()) return;
          var t = String(k.text).trim().replace(/\s*\n\s*/g, ' / ');
          lines.push(new Array(c + 1).join('    ') + fl.cols[c].short + ': ' + t + (k.dropped ? '  [dropped]' : ''));
        });
      }
      if (lines.length) { out.push('Argument ' + (r + 1)); out = out.concat(lines); out.push(''); }
    }
    return out.join('\n');
  }

  // check a flow read from a file; returns a clean copy or null
  function clean(o) {
    if (!o || typeof o !== 'object' || !Array.isArray(o.cols) || !Array.isArray(o.cards)) return null;
    var cols = o.cols.filter(function (c) { return c && typeof c === 'object'; }).map(function (c) { return { short: String(c.short || ''), name: String(c.name || ''), side: String(c.side || ''), si: +c.si || 0 }; });
    if (!cols.length) return null;
    var ids = {};
    var cards = o.cards.filter(function (c) { return c && typeof c === 'object'; }).map(function (c) {
      var k = { id: String(c.id || id()), col: Math.max(0, Math.min(cols.length - 1, Math.round(+c.col) || 0)), row: Math.max(0, Math.round(+c.row) || 0), text: String(c.text == null ? '' : c.text).slice(0, 5000), parent: c.parent ? String(c.parent) : null };
      if (c.dropped) k.dropped = true;
      ids[k.id] = 1;
      return k;
    });
    cards.forEach(function (c) { if (c.parent && !ids[c.parent]) c.parent = null; });
    var fl = { id: String(o.id || ('f' + Date.now().toString(36))), name: String(o.name || 'Flow').slice(0, 200), fmt: String(o.fmt || ''), cols: cols, cards: cards, made: +o.made || Date.now(), updated: +o.updated || Date.now() };
    compact(fl);
    return fl;
  }

  // blank paper flows: sheets of column headings; two-side formats add a sheet starting at the second side's first speech
  function blankSheets(f) {
    var cols = columnsFor(f, { cycles: 8 });
    if (f.cycle) {
      return [{ title: f.name + ': speeches', cols: [{ short: '#', name: 'Speech' }, { short: 'Legislator', name: 'Legislator and side' }, { short: 'Arguments', name: 'Main arguments' }, { short: 'Questions', name: 'Questions and answers' }, { short: 'Clash', name: 'Who it answers' }], rows: 12, table: true }];
    }
    var sheets = [{ title: f.name + ': ' + (f.sides[0] ? f.sides[0].name + ' case' : 'flow'), cols: cols }];
    if (f.sides.length === 2) {
      var j = -1;
      for (var i = 0; i < cols.length; i++) if (cols[i].side === f.sides[1].id) { j = i; break; }
      if (j > 0) sheets.push({ title: f.name + ': ' + f.sides[1].name + ' arguments', cols: cols.slice(j) });
    }
    return sheets;
  }

  return { columnsFor: columnsFor, make: make, add: add, answer: answer, below: below, remove: remove, toggleDrop: toggleDrop, cell: cell, maxRow: maxRow, byId: byId, unanswered: unanswered, toText: toText, clean: clean, blankSheets: blankSheets };
});
