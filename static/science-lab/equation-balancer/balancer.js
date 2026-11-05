/* Equation Balancer (/science-lab/equation-balancer/): the screen and controls. Written for this site; needs
   /js/rule-drag.js (window.RuleDrag), /games/lab/lab.js (window.TRBLab) and model.js (window.EBModel).

   You add or take away whole molecules, so the only thing that changes is a coefficient and the atom counts stay
   honest. Dragging follows RuleDrag: a molecule can land only inside its own side of the equation (a reactant never
   crosses the arrow) or back on its shelf, and a substance's last molecule can't leave. In "rule drag" mode the place
   you could drop it glows green if one more (or one fewer) molecule there brings its elements closer to balance.
   Element ids in layouts/science-lab/equation-balancer.html are this script's contract. */
(function () {
  'use strict';
  var M = window.EBModel, RD = window.RuleDrag, LAB = window.TRBLab, D = document;
  var view = D.getElementById('eb-view'), cv = D.getElementById('eb-cv');
  if (!M || !RD || !LAB || !view || !cv) return;
  var $ = function (id) { return D.getElementById(id); };
  var store = LAB.store('equation-balancer'), cvs = LAB.canvas(cv), ctx = cvs.c;
  var S = { rx: null, coef: [], drag: null, focus: null, hints: store.get('hints', true), done: store.get('done', {}), t: 0, L: null, checked: false };
  var LEVEL = { 1: 'Easy', 2: 'Medium', 3: 'Harder' };

  // ---------- layout ----------
  function layout() {
    var w = view.getBoundingClientRect().width || 360, narrow = w < 640, L = { w: w, narrow: narrow };
    if (narrow) {
      var bh = 168, sh = 78, y = 10;
      L.box = [{ x: 10, y: y, w: w - 20, h: bh }]; y += bh + 6; L.shelf = [{ x: 10, y: y, w: w - 20, h: sh }]; y += sh;
      L.arrow = { x: w / 2, y: y + 16, dir: 'down' }; y += 32;
      L.box.push({ x: 10, y: y, w: w - 20, h: bh }); y += bh + 6; L.shelf.push({ x: 10, y: y, w: w - 20, h: sh }); y += sh + 10;
      L.h = y;
    } else {
      var bw = (w - 24 - 56) / 2, bh2 = 250;
      L.box = [{ x: 12, y: 12, w: bw, h: bh2 }, { x: 12 + bw + 56, y: 12, w: bw, h: bh2 }];
      L.shelf = [{ x: 12, y: 12 + bh2 + 10, w: bw, h: 92 }, { x: 12 + bw + 56, y: 12 + bh2 + 10, w: bw, h: 92 }];
      L.arrow = { x: w / 2, y: 12 + bh2 / 2, dir: 'right' };
      L.h = 12 + bh2 + 10 + 92 + 12;
    }
    if (view.style.height !== Math.round(L.h) + 'px') view.style.height = Math.round(L.h) + 'px';
    S.L = L; cvs.fit();
  }
  function sideOf(k) { return k < S.rx.r.length ? 0 : 1; }
  function idxIn(k) { return k < S.rx.r.length ? k : k - S.rx.r.length; }
  function nOn(side) { return side === 0 ? S.rx.r.length : S.rx.p.length; }
  function species() { return S.rx.r.concat(S.rx.p); }
  function col(rect, k) { var n = nOn(sideOf(k)), cw = rect.w / n; return { x: rect.x + idxIn(k) * cw, y: rect.y, w: cw, h: rect.h }; }
  function boxCol(k) { return col(S.L.box[sideOf(k)], k); }
  function shelfCol(k) { return col(S.L.shelf[sideOf(k)], k); }
  // where each molecule of substance k sits in its column, and how big
  function grid(k, count) {
    var c = boxCol(k), ah = c.h - 40, sh = M.shape(species()[k]), best = null, cols;
    count = Math.max(1, count);
    for (cols = 1; cols <= count; cols++) {
      var rows = Math.ceil(count / cols), cwid = (c.w - 8) / cols, chei = ah / rows, u = Math.min(cwid / (2 * sh.w), chei / (2 * sh.h)) * 0.86;
      if (!best || u > best.u) best = { u: u, cols: cols, rows: rows, cw: cwid, ch: chei };
    }
    best.u = Math.min(best.u, 24);
    var pts = [];
    for (var i = 0; i < count; i++) {
      var r = Math.floor(i / best.cols), cc = i % best.cols, inRow = Math.min(best.cols, count - r * best.cols);
      var x0 = c.x + 4 + (c.w - 8 - inRow * best.cw) / 2;
      pts.push({ x: x0 + (cc + 0.5) * best.cw, y: c.y + 6 + (ah - best.rows * best.ch) / 2 + (r + 0.5) * best.ch });
    }
    return { u: best.u, pts: pts };
  }
  function shelfPt(k) { var c = shelfCol(k); return { x: c.x + c.w / 2, y: c.y + c.h / 2 - 8 }; }
  function shelfUnit(k) { var c = shelfCol(k), sh = M.shape(species()[k]); return Math.min(15, Math.min((c.w - 10) / (2 * sh.w), (c.h - 30) / (2 * sh.h)) * 0.9); }
  function groupPt(k) { var c = boxCol(k); return { x: c.x + c.w / 2, y: c.y + (c.h - 40) / 2 + 6 }; }

  // ---------- drawing ----------
  function ball(x, y, r, e) {
    var col0 = M.EL[e].c, g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, col0); g.addColorStop(1, shade(col0, 0.55));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1; ctx.stroke();
    if (r >= 8 && e !== 'H') { ctx.font = '700 ' + Math.round(Math.min(13, r * 0.95)) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = lum(col0) > 0.55 ? '#1d2320' : '#fff'; ctx.fillText(e, x, y + 0.5); }
    else if (r >= 8 && e === 'H') { ctx.font = '700 ' + Math.round(r * 0.9) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#5d6862'; ctx.fillText('H', x, y + 0.5); }
  }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16); return 'rgb(' + Math.round((n >> 16) * f) + ',' + Math.round((n >> 8 & 255) * f) + ',' + Math.round((n & 255) * f) + ')'; }
  function lum(hex) { var n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; }
  function molecule(f, x, y, u, alpha) {
    var sh = M.shape(f); ctx.save(); if (alpha !== undefined) ctx.globalAlpha = alpha;
    sh.atoms.forEach(function (a) { ball(x + a.x * u, y + a.y * u, a.r * u, a.e); });
    ctx.restore();
  }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function txt(t, x, y, size, color, weight) { ctx.font = (weight || 600) + ' ' + size + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); }
  function hintColor(total) { return total < 0 ? '#63e6be' : total > 0 ? '#ff8787' : '#ffd479'; }
  function draw() {
    var L = S.L, dpr = cvs.dpr, d = S.drag, sp = species();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0b1b27'; ctx.fillRect(0, 0, L.w, L.h);
    var eff = d ? d.eff : null;
    [0, 1].forEach(function (side) {
      var b = L.box[side], sh = L.shelf[side], other = d && sideOf(d.k) !== side;
      ctx.fillStyle = side === 0 ? 'rgba(116,192,252,.07)' : 'rgba(255,212,121,.07)'; rr(b.x, b.y, b.w, b.h, 14); ctx.fill();
      var glow = d && !other && d.from === 'shelf' && d.st && d.st.zone === 'box';
      ctx.lineWidth = glow ? 3 : 1.5;
      ctx.strokeStyle = d && !other && d.from === 'shelf' && S.hints && eff ? hintColor(eff.total) : 'rgba(120,170,200,.35)';
      if (d && !other && d.from === 'shelf' && !S.hints) ctx.strokeStyle = 'rgba(219,231,239,.75)';
      ctx.setLineDash(d && !other && d.from === 'shelf' && !glow ? [7, 5] : []); ctx.stroke(); ctx.setLineDash([]);
      txt(side === 0 ? 'Reactants' : 'Products', b.x + 52, b.y + 13, 11, '#8fb3c6', 700);
      // the shelf
      ctx.fillStyle = 'rgba(255,255,255,.04)'; rr(sh.x, sh.y, sh.w, sh.h, 12); ctx.fill();
      var sGlow = d && !other && d.from === 'box' && d.st && d.st.zone === 'shelf';
      ctx.lineWidth = sGlow ? 3 : 1;
      ctx.strokeStyle = d && !other && d.from === 'box' && d.canOut ? (S.hints && eff ? hintColor(eff.total) : 'rgba(219,231,239,.75)') : 'rgba(120,170,200,.22)';
      ctx.setLineDash(d && !other && d.from === 'box' && d.canOut && !sGlow ? [7, 5] : []); ctx.stroke(); ctx.setLineDash([]);
      if (other) { ctx.fillStyle = 'rgba(6,17,26,.55)'; rr(b.x, b.y, b.w, b.h, 14); ctx.fill(); rr(sh.x, sh.y, sh.w, sh.h, 12); ctx.fill(); txt('not this side', b.x + b.w - 52, b.y + 13, 11, '#8fb3c6', 700); }
    });
    // the arrow
    var a = L.arrow; ctx.strokeStyle = '#dbe7ef'; ctx.fillStyle = '#dbe7ef'; ctx.lineWidth = 3; ctx.beginPath();
    if (a.dir === 'right') { ctx.moveTo(a.x - 18, a.y); ctx.lineTo(a.x + 12, a.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(a.x + 20, a.y); ctx.lineTo(a.x + 8, a.y - 8); ctx.lineTo(a.x + 8, a.y + 8); ctx.fill(); }
    else { ctx.moveTo(a.x, a.y - 12); ctx.lineTo(a.x, a.y + 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(a.x, a.y + 13); ctx.lineTo(a.x - 8, a.y + 2); ctx.lineTo(a.x + 8, a.y + 2); ctx.fill(); }
    // molecules
    sp.forEach(function (f, k) {
      var n = S.coef[k], showN = n - (d && d.k === k && d.from === 'box' ? 1 : 0), gr = grid(k, Math.max(1, showN)), c = boxCol(k);
      for (var i = 0; i < showN; i++) molecule(f, gr.pts[i].x, gr.pts[i].y, gr.u);
      if (idxIn(k) > 0) { ctx.strokeStyle = 'rgba(120,170,200,.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c.x, c.y + 24); ctx.lineTo(c.x, c.y + c.h - 8); ctx.stroke(); }
      txt((n === 1 ? '' : n + ' ') + M.pretty(f), c.x + c.w / 2, c.y + c.h - 16, 15, '#ffffff', 700);
      var s = shelfCol(k), sp0 = shelfPt(k);
      molecule(f, sp0.x, sp0.y, shelfUnit(k), d && d.k === k && d.from === 'shelf' ? 0.35 : 1);
      txt('+ ' + M.pretty(f), s.x + s.w / 2, s.y + s.h - 12, 12, '#8fb3c6');
    });
    if (d && d.st) molecule(sp[d.k], d.st.x, d.st.y, d.u);
    // keyboard focus
    if (S.focus && S.kbd && D.activeElement === cv && !d) {
      var fp = itemAt(S.focus); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
      var c2 = S.focus.zone === 'box' ? boxCol(S.focus.k) : shelfCol(S.focus.k); rr(c2.x + 3, c2.y + 3, c2.w - 6, c2.h - 6, 10); ctx.stroke(); ctx.setLineDash([]);
      void fp;
    }
  }

  // ---------- dragging ----------
  function clampIn(r, q, mx, my) { return { x: Math.max(r.x + mx, Math.min(r.x + r.w - mx, q.x)), y: Math.max(r.y + my, Math.min(r.y + r.h - my, q.y)) }; }
  function session(k, from, grab) {
    var side = sideOf(k), f = species()[k], canIn = S.coef[k] < M.MAXC, canOut = from === 'box' && S.coef[k] > 1;
    var sh = M.shape(f), u = shelfUnit(k), mx = Math.min(sh.w * u + 4, S.L.box[side].w / 2), my = Math.min(sh.h * u + 4, S.L.box[side].h / 2);
    var eff = from === 'shelf' ? (canIn ? M.effect(S.rx, S.coef, k, 1) : null) : (canOut ? M.effect(S.rx, S.coef, k, -1) : null);
    S.drag = { k: k, from: from, st: null, u: u, eff: eff, canOut: canOut };
    tallyHints(eff);
    function project(q) {
      var b = S.L.box[side], s = S.L.shelf[side];
      var cb = clampIn(b, q, mx, my), cs = clampIn(s, q, Math.min(mx, s.w / 2), Math.min(my, s.h / 2));
      var okBox = from === 'box' || canIn, okShelf = from === 'shelf' || canOut;
      var db = okBox ? Math.hypot(cb.x - q.x, cb.y - q.y) : Infinity, ds = okShelf ? Math.hypot(cs.x - q.x, cs.y - q.y) : Infinity;
      return db <= ds ? { zone: 'box', x: cb.x, y: cb.y } : { zone: 'shelf', x: cs.x, y: cs.y };
    }
    var startSt = from === 'shelf' ? { zone: 'shelf', x: shelfPt(k).x, y: shelfPt(k).y } : { zone: 'box', x: groupPt(k).x, y: groupPt(k).y };
    var other = from === 'shelf' ? (canIn ? { zone: 'box', x: groupPt(k).x, y: groupPt(k).y } : null) : (canOut ? { zone: 'shelf', x: shelfPt(k).x, y: shelfPt(k).y } : null);
    return {
      project: project, grab: grab, states: other ? [startSt, other] : [startSt], start: startSt,
      at: function (st) { return { x: st.x, y: st.y }; },
      move: function (st) { S.drag.st = st; dirty(); },
      end: function (st) {
        S.drag = null; tallyHints(null);
        if (from === 'shelf' && st.zone === 'box' && canIn) setCoef(k, S.coef[k] + 1, 'Added one ' + M.SPECIES[f].n + '.');
        else if (from === 'box' && st.zone === 'shelf' && canOut) setCoef(k, S.coef[k] - 1, 'Took away one ' + M.SPECIES[f].n + '.');
        else { dirty(); }
      },
      cancel: function () { S.drag = null; tallyHints(null); dirty(); }
    };
  }
  function hit(pt) {
    var sp = species();
    for (var k = 0; k < sp.length; k++) {
      var s = shelfCol(k); if (pt.x >= s.x && pt.x <= s.x + s.w && pt.y >= s.y && pt.y <= s.y + s.h) return { k: k, zone: 'shelf', at: shelfPt(k) };
      var b = boxCol(k); if (pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y + 20 && pt.y <= b.y + b.h - 28) {
        var gr = grid(k, S.coef[k]), best = null, bd = Infinity;
        gr.pts.forEach(function (p) { var dd = Math.hypot(p.x - pt.x, p.y - pt.y); if (dd < bd) { bd = dd; best = p; } });
        return { k: k, zone: 'box', at: best };
      }
    }
    return null;
  }
  RD.attach(cv, {
    point: function (e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; },
    begin: function (pt) {
      cv.focus({ preventScroll: true });
      var h = hit(pt); if (!h) return null;
      S.focus = { k: h.k, zone: h.zone };
      if (h.zone === 'box' && S.coef[h.k] <= 1) say('This is the last ' + M.SPECIES[species()[h.k]].n + ' molecule; every substance in the equation needs at least one.');
      var s = session(h.k, h.zone, h.at);
      return s;
    }
  });
  // keyboard
  function items() { var out = []; species().forEach(function (f, k) { out.push({ k: k, zone: 'box' }); out.push({ k: k, zone: 'shelf' }); }); return out; }
  function itemAt(it) { return it.zone === 'box' ? groupPt(it.k) : shelfPt(it.k); }
  var KB = RD.keys(cv, {
    items: items, itemAt: itemAt, same: function (a, b) { return a.k === b.k && a.zone === b.zone; },
    focus: function (it) { S.focus = it; dirty(); var f = species()[it.k]; say(it.zone === 'box' ? S.coef[it.k] + ' × ' + M.SPECIES[f].n + ' (' + f + ') in the ' + (sideOf(it.k) ? 'products' : 'reactants') + '. Enter picks one up; minus takes one away.' : 'Shelf of ' + M.SPECIES[f].n + ' (' + f + '). Enter picks up a molecule; plus adds one.'); },
    blocked: function () { say('It can’t go that way.'); },
    pick: function (it) {
      var s = session(it.k, it.zone, itemAt(it)), mv = s.move;
      s.move = function (st) { mv(st); say(st.zone === 'box' ? 'Over the ' + (sideOf(it.k) ? 'products' : 'reactants') + '. Enter drops it there.' : 'Over the shelf. Enter drops it there.'); };
      say('Holding a ' + M.SPECIES[species()[it.k]].n + ' molecule. Arrow keys move it between the places it may go; Enter drops; Escape puts it back.' + (s.states.length < 2 ? ' It has nowhere else to go.' : ''));
      return s;
    },
    key: function (e, it) {
      var k = e.key;
      if (it && (k === '+' || k === '=')) { e.preventDefault(); setCoef(it.k, Math.min(M.MAXC, S.coef[it.k] + 1)); return true; }
      if (it && (k === '-' || k === '_')) { e.preventDefault(); setCoef(it.k, Math.max(1, S.coef[it.k] - 1)); return true; }
      if (k === 'c' || k === 'C') { e.preventDefault(); check(); return true; }
      return false;
    }
  });
  cv.addEventListener('keydown', function () { S.kbd = true; }, true);
  cv.addEventListener('pointerdown', function () { S.kbd = false; }, true);
  cv.addEventListener('focus', function () { try { S.kbd = cv.matches(':focus-visible'); } catch (e) { } if (!S.focus) KB.setFocus({ k: 0, zone: 'shelf' }); dirty(); });
  cv.addEventListener('blur', function () { dirty(); });

  // ---------- coefficients, tally, check ----------
  function setCoef(k, n, msg) {
    n = Math.max(1, Math.min(M.MAXC, n));
    if (S.coef[k] === n) { dirty(); return; }
    S.coef[k] = n; S.checked = false; renderEq(); renderTally(); dirty(); save();
    $('eb-result').textContent = ''; $('eb-result').className = 'eb-result';
    var t = M.tally(S.rx, S.coef);
    say((msg ? msg + ' ' : '') + M.eqText(S.rx, S.coef).replace(/[₀-₉]/g, function (c) { return '₀₁₂₃₄₅₆₇₈₉'.indexOf(c); }) + '. ' + M.elements(S.rx).map(function (e) { return e + ' ' + t.L[e] + ' to ' + t.R[e]; }).join(', ') + '.');
  }
  function renderEq() {
    var sp = species(), nr = S.rx.r.length, h = '';
    sp.forEach(function (f, k) {
      if (k > 0) h += k === nr ? '<span class="eb-arrow" aria-label="gives">→</span>' : '<span class="eb-plus">+</span>';
      h += '<span class="eb-term"><button type="button" class="eb-step" data-k="' + k + '" data-d="-1" aria-label="One fewer ' + M.SPECIES[f].n + '"' + (S.coef[k] <= 1 ? ' disabled' : '') + '>−</button>' +
        '<b class="eb-c">' + S.coef[k] + '</b><span class="eb-f">' + M.pretty(f) + '</span>' +
        '<button type="button" class="eb-step" data-k="' + k + '" data-d="1" aria-label="One more ' + M.SPECIES[f].n + '"' + (S.coef[k] >= M.MAXC ? ' disabled' : '') + '>+</button></span>';
    });
    $('eb-eq').innerHTML = h;
  }
  $('eb-eq').addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; var k = +b.dataset.k; setCoef(k, S.coef[k] + (+b.dataset.d)); var nb = $('eb-eq').querySelector('button[data-k="' + k + '"][data-d="' + b.dataset.d + '"]'); if (nb && !nb.disabled) nb.focus(); });
  function renderTally() {
    var t = M.tally(S.rx, S.coef), els = M.elements(S.rx), all = true;
    var rows = els.map(function (e) {
      var ok = t.L[e] === t.R[e]; if (!ok) all = false;
      return '<tr data-e="' + e + '" class="' + (ok ? 'ok' : 'off') + '"><th scope="row"><i style="background:' + M.EL[e].c + '" aria-hidden="true"></i>' + e + ' <small>' + M.EL[e].n + '</small></th><td>' + t.L[e] + '</td><td>' + t.R[e] + '</td><td class="eb-st"><span>' + (ok ? '✓ balanced' : (t.L[e] > t.R[e] ? 'more on the left' : 'more on the right')) + '</span><em aria-hidden="true"></em></td></tr>';
    }).join('');
    $('eb-tally').innerHTML = '<table class="eb-tab"><caption class="cb-sr">Atoms of each element on each side</caption><thead><tr><th scope="col">Element</th><th scope="col">Left</th><th scope="col">Right</th><th scope="col"></th></tr></thead><tbody>' + rows + '</tbody></table>';
    $('eb-all').textContent = all ? 'Every element matches. Press Check to confirm.' : 'Not balanced yet.';
    $('eb-all').className = 'eb-all' + (all ? ' ok' : '');
  }
  function tallyHints(eff) {
    Array.prototype.forEach.call($('eb-tally').querySelectorAll('tr[data-e]'), function (tr) {
      var em = tr.querySelector('em'), v = eff && S.hints ? eff.per[tr.dataset.e] : undefined;
      tr.classList.toggle('better', v === -1); tr.classList.toggle('worse', v === 1);
      if (em) em.textContent = v === -1 ? ' ↓ closer' : v === 1 ? ' ↑ further' : '';
    });
  }
  function check() {
    var r = $('eb-result'), t = M.tally(S.rx, S.coef), els = M.elements(S.rx);
    var bad = els.filter(function (e) { return t.L[e] !== t.R[e]; });
    if (bad.length) {
      var e = bad[0];
      r.className = 'eb-result no';
      r.textContent = 'Not yet. ' + M.EL[e].n[0].toUpperCase() + M.EL[e].n.slice(1) + ' has ' + t.L[e] + ' atom' + (t.L[e] === 1 ? '' : 's') + ' on the left and ' + t.R[e] + ' on the right.' + (bad.length > 1 ? ' ' + (bad.length - 1) + ' more element' + (bad.length > 2 ? 's don’t' : ' doesn’t') + ' match either.' : '');
      return false;
    }
    var red = M.reduce(S.coef), same = red.join() === S.coef.join();
    r.className = 'eb-result yes';
    r.innerHTML = '<b>Balanced!</b> Every element has the same number of atoms on both sides. ' +
      (same ? 'These are the smallest whole numbers that work:' : 'But every number can be divided by ' + S.coef.reduce(function (x, y) { return M.gcd(x, y); }) + '. The smallest whole numbers are:') +
      '<span class="eb-ans">' + M.eqText(S.rx, red) + '</span>' + (S.rx.note ? '<span class="eb-fact">' + S.rx.note + '</span>' : '');
    if (!S.done[S.rx.id]) { S.done[S.rx.id] = 1; store.set('done', S.done); renderPick(); LAB.toast(view, 'Balanced ✓'); }
    say('Balanced. Smallest whole numbers: ' + M.eqText(S.rx, red).replace(/[₀-₉]/g, function (c) { return '₀₁₂₃₄₅₆₇₈₉'.indexOf(c); }) + '.');
    return true;
  }
  $('eb-check').addEventListener('click', check);
  $('eb-reset').addEventListener('click', function () { load(S.rx.id); say('Back to one of each.'); });

  // ---------- picking a reaction ----------
  function renderPick() {
    var sel = $('eb-pick'), h = '';
    [1, 2, 3].forEach(function (lv) {
      h += '<optgroup label="' + LEVEL[lv] + '">' + M.REACTIONS.filter(function (x) { return x.level === lv; }).map(function (x) {
        return '<option value="' + x.id + '"' + (S.rx && x.id === S.rx.id ? ' selected' : '') + '>' + (S.done[x.id] ? '✓ ' : '') + x.title + '</option>';
      }).join('') + '</optgroup>';
    });
    sel.innerHTML = h;
    var n = M.REACTIONS.filter(function (x) { return S.done[x.id]; }).length;
    $('eb-progress').textContent = n + ' of ' + M.REACTIONS.length + ' balanced';
  }
  function byId(id) { for (var i = 0; i < M.REACTIONS.length; i++) if (M.REACTIONS[i].id === id) return M.REACTIONS[i]; return null; }
  function load(id, coef) {
    S.rx = byId(id) || M.REACTIONS[0]; S.coef = species().map(function () { return 1; });
    if (coef && coef.length === S.coef.length && coef.every(function (c) { return c >= 1 && c <= M.MAXC; })) S.coef = coef.slice();
    S.drag = null; S.focus = null; S.checked = false;
    $('eb-title').textContent = S.rx.title; $('eb-level').textContent = LEVEL[S.rx.level];
    $('eb-names').textContent = S.rx.r.map(function (f) { return M.SPECIES[f].n; }).join(' + ') + ' → ' + S.rx.p.map(function (f) { return M.SPECIES[f].n; }).join(' + ');
    $('eb-result').textContent = ''; $('eb-result').className = 'eb-result';
    $('eb-key').innerHTML = M.elements(S.rx).map(function (e) { return '<span><i style="background:' + M.EL[e].c + '"></i>' + e + ' ' + M.EL[e].n + '</span>'; }).join('');
    layout(); renderPick(); renderEq(); renderTally(); dirty(); save();
  }
  $('eb-pick').addEventListener('change', function (e) { load(e.target.value); say('New equation: ' + S.rx.title + '.'); });
  function step(d) { var i = M.REACTIONS.indexOf(S.rx) + d; if (i < 0 || i >= M.REACTIONS.length) return; load(M.REACTIONS[i].id); say('Equation ' + (i + 1) + ': ' + S.rx.title + '.'); }
  $('eb-prev').addEventListener('click', function () { step(-1); });
  $('eb-next').addEventListener('click', function () { step(1); });
  // mode
  function modeUI() { Array.prototype.forEach.call($('eb-mode').querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String((b.dataset.m === 'rule') === S.hints)); }); }
  $('eb-mode').addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; S.hints = b.dataset.m === 'rule'; store.set('hints', S.hints); modeUI(); dirty(); });
  modeUI();
  function save() { store.set('cur', { id: S.rx.id, coef: S.coef }); }
  function say(t) { $('eb-live').textContent = t; }

  // ---------- frame loop ----------
  var isDirty = true;
  function dirty() { isDirty = true; }
  LAB.loop(function (dt) { S.t += dt; if (isDirty) { draw(); isDirty = false; } }, view);
  var lastW = 0;
  function relayout() { var w = view.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; if (S.rx) layout(); dirty(); } }
  window.addEventListener('resize', relayout);
  if ('ResizeObserver' in window) { try { new ResizeObserver(relayout).observe(view); } catch (e) { } }

  var cur = store.get('cur', null);
  load(cur && byId(cur.id) ? cur.id : 'water', cur && cur.coef);
  // a hook for the page's own test (scripts/equation-balancer/verify.js)
  window.EBBench = { load: load, set: function (c) { c.forEach(function (n, k) { setCoef(k, n); }); }, check: check, state: function () { return S; } };
})();
