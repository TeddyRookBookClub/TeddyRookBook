/* Meal Prep: PNG pictures drawn on a canvas (week grid, shopping list, kids' chart), sized for a phone
   (1080 pixels wide) or for printing (a letter page at 300 dpi, 2550 × 3300 or longer). */
(function (W, D) {
  'use strict';
  var M = W.MealModel, C = W.MealCommon;
  var INK = '#1d2320', MUTED = '#5d6862', GREEN = '#004225', GREEN2 = '#00562f', GOLD = '#b8963e', PAPER = '#fbf8f0', LINE = '#d7dfd9', SOFT = '#e7f0ea';
  var SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', SERIF = 'Georgia, "Times New Roman", serif';
  var EMOJI = ', "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';
  function font(px, bold, serif) { return (bold ? '700 ' : '400 ') + px + 'px ' + (serif ? SERIF : SANS) + EMOJI; }
  function wrap(g, text, max) {
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  // a page: logical width L (drawn at scale S), header + body ops + footer
  function Page(size) {
    this.print = size === 'print';
    this.L = this.print ? 850 : 540; this.S = this.print ? 3 : 2;
    this.minH = this.print ? 1100 : 0;
    this.pad = this.print ? 44 : 26;
    this.ops = []; this.y = 0;
    var cv = D.createElement('canvas'); this.m = cv.getContext('2d');
  }
  Page.prototype.text = function (t, o) { // measure + queue wrapped text at x..x+w
    o = o || {}; var g = this.m; g.font = font(o.size || 15, o.bold, o.serif);
    var lines = wrap(g, t, o.w), lh = (o.size || 15) * (o.lh || 1.3);
    for (var i = 0; i < lines.length; i++) this.ops.push({ t: 'text', s: lines[i], x: o.x, y: (o.y || 0) + i * lh, f: g.font, c: o.color || INK, align: o.align });
    return lines.length * lh;
  };
  Page.prototype.render = function (title, sub) {
    var hdr = this.print ? 120 : 92, foot = this.print ? 50 : 40, H = Math.max(this.minH, Math.ceil(hdr + this.y + foot + this.pad));
    if (H * this.S > 16000) return null;
    var cv = D.createElement('canvas'); cv.width = this.L * this.S; cv.height = H * this.S;
    var g = cv.getContext('2d'); g.scale(this.S, this.S); g.textBaseline = 'top';
    g.fillStyle = PAPER; g.fillRect(0, 0, this.L, H);
    var grd = g.createLinearGradient(0, 0, this.L, 0); grd.addColorStop(0, GREEN); grd.addColorStop(1, GREEN2);
    g.fillStyle = grd; g.fillRect(0, 0, this.L, hdr - 18);
    g.fillStyle = GOLD; g.fillRect(0, hdr - 18, this.L, 4);
    g.fillStyle = '#e6cf8f'; g.font = font(this.print ? 13 : 11, true); g.fillText('TEDDY ROOK BOOK · MEAL PREP', this.pad, this.print ? 18 : 12);
    g.fillStyle = '#fff'; g.font = font(this.print ? 36 : 26, true, true); g.fillText(fit(g, title, this.L - 2 * this.pad), this.pad, this.print ? 38 : 28);
    if (sub) { g.fillStyle = '#d3e6da'; g.font = font(this.print ? 15 : 13); g.fillText(fit(g, sub, this.L - 2 * this.pad), this.pad, this.print ? 80 : 58); }
    var oy = hdr;
    this.ops.forEach(function (o) {
      if (o.t === 'text') { g.font = o.f; g.fillStyle = o.c; g.textAlign = o.align || 'left'; g.fillText(o.s, o.x, oy + o.y); g.textAlign = 'left'; }
      else if (o.t === 'rect') { g.fillStyle = o.c; if (o.r) { rr(g, o.x, oy + o.y, o.w, o.h, o.r); g.fill(); } else g.fillRect(o.x, oy + o.y, o.w, o.h); if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || 1; if (o.r) { rr(g, o.x, oy + o.y, o.w, o.h, o.r); g.stroke(); } else g.strokeRect(o.x, oy + o.y, o.w, o.h); } }
      else if (o.t === 'line') { g.strokeStyle = o.c; g.lineWidth = o.lw || 1; g.beginPath(); g.moveTo(o.x1, oy + o.y1); g.lineTo(o.x2, oy + o.y2); g.stroke(); }
      else if (o.t === 'box') { g.strokeStyle = o.c || MUTED; g.lineWidth = 1.4; rr(g, o.x, oy + o.y, o.s, o.s, 3); g.stroke(); if (o.on) { g.strokeStyle = GREEN2; g.lineWidth = 2; g.beginPath(); g.moveTo(o.x + o.s * 0.22, oy + o.y + o.s * 0.52); g.lineTo(o.x + o.s * 0.43, oy + o.y + o.s * 0.74); g.lineTo(o.x + o.s * 0.8, oy + o.y + o.s * 0.28); g.stroke(); } }
    });
    g.fillStyle = '#8a948e'; g.font = font(this.print ? 12 : 11); g.fillText('teddyrookbook.com/meal-prep · made ' + C.shortDate(new Date()) + ', ' + new Date().getFullYear(), this.pad, H - foot + 12);
    return cv;
  };
  function fit(g, s, w) { if (g.measureText(s).width <= w) return s; while (s.length > 3 && g.measureText(s + '…').width > w) s = s.slice(0, -1); return s + '…'; }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  function weekOf(plan, range) { var m = /^w(\d+)$/.exec(range || ''), ws = C.weeks(plan); return ws[m ? Math.min(+m[1], ws.length - 1) : 0]; }
  function mealsIn(all, plan, d, s) { return (plan.cells[M.cellKey(d, s)] || []).map(function (e) { var r = all[e.r]; return r ? C.emoji(r) + ' ' + r.name + (e.lo ? ' (leftovers)' : '') : null; }).filter(Boolean); }

  // ---------- the week ----------
  function week(data, st, plan, range, size) {
    var pg = new Page(size), all = C.recipes(data, st), w = weekOf(plan, range), slots = M.SLOTS.filter(function (s) { return plan.slots[s] !== false; });
    var x0 = pg.pad, Wd = pg.L - 2 * pg.pad, y = 18;
    if (!pg.print) {
      for (var d = w.from; d <= w.to; d++) {
        var top = y; y += 12;
        var hh = pg.text(C.dayLabel(plan, d, true), { x: x0 + 14, y: y, w: Wd - 28, size: 19, bold: true, serif: true, color: GREEN }); y += hh + 4;
        slots.forEach(function (s) {
          var ms = mealsIn(all, plan, d, s);
          pg.text(C.SLOTNAME[s].toUpperCase(), { x: x0 + 14, y: y + 2, w: 90, size: 10.5, bold: true, color: MUTED });
          var used = pg.text(ms.length ? ms.join(' + ') : '—', { x: x0 + 106, y: y, w: Wd - 120, size: 15, color: ms.length ? INK : '#a3aca6' });
          y += Math.max(used, 18) + 5;
        });
        y += 7;
        pg.ops.unshift({ t: 'rect', x: x0, y: top, w: Wd, h: y - top, c: '#ffffff', stroke: LINE, r: 10 });
        y += 10;
      }
    } else {
      var dayW = 128, colW = (Wd - dayW) / slots.length, py = y;
      // header row
      pg.ops.push({ t: 'rect', x: x0, y: py, w: Wd, h: 30, c: SOFT });
      slots.forEach(function (s, i) { pg.text(C.SLOTNAME[s], { x: x0 + dayW + i * colW + 10, y: py + 7, w: colW - 20, size: 14, bold: true, color: GREEN }); });
      py += 30;
      for (var d2 = w.from; d2 <= w.to; d2++) {
        var rowTop = py, maxH = 0;
        var lh = pg.text(C.DOWL[C.dateOf(plan, d2).getDay()], { x: x0 + 10, y: py + 10, w: dayW - 16, size: 16, bold: true, serif: true, color: GREEN });
        pg.text(C.shortDate(C.dateOf(plan, d2)), { x: x0 + 10, y: py + 12 + lh, w: dayW - 16, size: 12, color: MUTED });
        maxH = lh + 30;
        slots.forEach(function (s, i) {
          var ms = mealsIn(all, plan, d2, s), cy = py + 10;
          ms.forEach(function (m) { cy += pg.text(m, { x: x0 + dayW + i * colW + 10, y: cy, w: colW - 20, size: 13.5 }) + 4; });
          maxH = Math.max(maxH, cy - py + 6);
        });
        maxH = Math.max(maxH, (1100 - 120 - 50 - 60 - 30) / 7 - 2);
        pg.ops.push({ t: 'line', x1: x0, y1: rowTop + maxH, x2: x0 + Wd, y2: rowTop + maxH, c: LINE });
        py += maxH;
      }
      for (var i = 0; i <= slots.length; i++) pg.ops.push({ t: 'line', x1: x0 + dayW + i * colW - (i === slots.length ? 0 : 0), y1: y, x2: x0 + dayW + i * colW, y2: py, c: LINE });
      pg.ops.push({ t: 'rect', x: x0, y: y, w: Wd, h: py - y, c: 'rgba(0,0,0,0)', stroke: '#b9c7be', lw: 1.2 });
      y = py + 10;
    }
    pg.y = y;
    var ppl = M.householdPeople(st.people);
    var nW = C.weeks(plan).length;
    return pg.render(nW > 1 ? plan.name + ' · week ' + (w.w + 1) + ' of ' + nW : 'Meals: ' + plan.name, C.shortDate(C.dateOf(plan, w.from)) + ' – ' + C.shortDate(C.dateOf(plan, w.to)) + ' · ' + ppl + (ppl === 1 ? ' person' : ' people'));
  }

  // ---------- shopping list ----------
  function list(data, st, plan, range, size) {
    var pg = new Page(size), rows = C.listRows(data, st, plan, range).filter(function (r) { return !r.have; });
    var x0 = pg.pad, Wd = pg.L - 2 * pg.pad, cols = pg.print ? 2 : 1, gap = 30, cw = (Wd - gap * (cols - 1)) / cols, y = 16;
    // group rows by section, then lay sections into columns (fill the first, then the next)
    var secs = [], cur = null;
    rows.forEach(function (r) { if (!cur || cur.id !== r.section) { cur = { id: r.section, rows: [] }; secs.push(cur); } cur.rows.push(r); });
    if (!secs.length) { pg.text('Nothing to buy yet.', { x: x0, y: y, w: Wd, size: 16, color: MUTED }); pg.y = y + 40; return pg.render('Shopping list', plan.name); }
    function measure(sec) { // height of a section in a column
      var h = 30, g = pg.m;
      sec.rows.forEach(function (r) { g.font = font(14, true); var t = r.name + '  ' + (r.check || r.buy); h += wrap(g, t, cw - 30).length * 18.5 + 6; });
      return h + 10;
    }
    var heights = secs.map(measure), total = heights.reduce(function (a, b) { return a + b; }, 0), target = total / cols, col = 0, cy = y, colTops = [], maxY = y;
    secs.forEach(function (sec, i) {
      if (cols > 1 && col < cols - 1 && cy - y > 0 && cy - y + heights[i] / 2 > target) { col++; cy = y; }
      var cx = x0 + col * (cw + gap);
      pg.text(C.sectionName(data, sec.id).toUpperCase(), { x: cx, y: cy + 6, w: cw, size: 12, bold: true, color: GREEN });
      pg.ops.push({ t: 'line', x1: cx, y1: cy + 24, x2: cx + cw, y2: cy + 24, c: GOLD, lw: 1.2 });
      cy += 30;
      sec.rows.forEach(function (r) {
        pg.ops.push({ t: 'box', x: cx, y: cy + 1, s: 14 });
        var h = pg.text(r.name + ' — ' + (r.check || r.buy), { x: cx + 24, y: cy, w: cw - 30, size: 14, lh: 1.32 });
        cy += h + 6;
      });
      cy += 10; maxY = Math.max(maxY, cy);
    });
    pg.y = maxY;
    var have = C.listRows(data, st, plan, range).length - rows.length;
    return pg.render('Shopping list', plan.name + ' · ' + C.rangeLabel(plan, range) + (have ? ' · ' + have + ' already at home' : ''));
  }

  // ---------- kids' chart ----------
  function kids(data, st, plan, range, size) {
    var pg = new Page(size), all = C.recipes(data, st), w = weekOf(plan, range), which = st.kidsSlots === 'all' ? M.SLOTS.filter(function (s) { return plan.slots[s] !== false; }) : ['dinner'];
    var x0 = pg.pad, Wd = pg.L - 2 * pg.pad, y = 16, colors = ['#e7f0ea', '#f6eedb', '#e8eef7', '#f7e8ec', '#eef3e1', '#f1e9f6', '#e6f2f2'];
    for (var d = w.from; d <= w.to; d++) {
      var dt = C.dateOf(plan, d), top = y, inner = y + 12;
      var dh = pg.text(C.DOWL[dt.getDay()], { x: x0 + 18, y: inner, w: Wd - 36, size: pg.print ? 26 : 22, bold: true, serif: true, color: GREEN });
      inner += dh + 4;
      var any = false;
      which.forEach(function (s) {
        var es = (plan.cells[M.cellKey(d, s)] || []).map(function (e) { return all[e.r]; }).filter(Boolean);
        if (!es.length) return; any = true;
        if (which.length > 1) { pg.text(C.SLOTNAME[s].toUpperCase(), { x: x0 + 18, y: inner, w: 200, size: 11, bold: true, color: MUTED }); inner += 16; }
        es.forEach(function (r) {
          pg.text(C.emoji(r), { x: x0 + 18, y: inner, w: 60, size: pg.print ? 34 : 28 });
          var th = pg.text(r.name, { x: x0 + (pg.print ? 70 : 60), y: inner + (pg.print ? 6 : 4), w: Wd - 90, size: pg.print ? 24 : 20, bold: true });
          inner += Math.max(th, pg.print ? 44 : 36) + 4;
        });
      });
      if (!any) { pg.text('Surprise!', { x: x0 + 18, y: inner, w: Wd - 36, size: 18, color: MUTED }); inner += 26; }
      inner += 10;
      pg.ops.unshift({ t: 'rect', x: x0, y: top, w: Wd, h: inner - top, c: colors[(d - w.from) % colors.length], r: 16 });
      y = inner + 12;
    }
    pg.y = y;
    return pg.render(which.length > 1 ? 'What are we eating?' : 'What’s for dinner?', 'Week of ' + C.shortDate(C.dateOf(plan, w.from)));
  }

  W.MealPictures = {
    draw: function (what, data, st, plan, range, size) { return what === 'list' ? list(data, st, plan, range, size) : what === 'kids' ? kids(data, st, plan, range, size) : week(data, st, plan, range, size); }
  };
})(window, document);
