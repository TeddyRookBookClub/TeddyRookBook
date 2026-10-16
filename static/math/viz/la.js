/* Math Ladder visuals for Linear Algebra (course key la). Registered on window.MathLadder.viz; needs viz/core.js
   (and looks best with viz/adv.css, which Linear Algebra pages load). Styles for these visuals are injected below.

   la-rowops   Row operations on an augmented matrix, one step at a time, with the lines of a 2-unknown system
               redrawn after every step (the crossing point never moves).
     opts: m: [[1, 2, 5], [3, -1, 1]]   the matrix (numbers or "a/b" strings)
           aug: 1                        columns after the bar (0 = no bar, a plain matrix)
           goal: "echelon" | "rref"      with task: reach that form (a check mark appears)
           zero: false                   true lets "Scale" use 0, to show what goes wrong (an equation is lost)
           picture: true                 draw each row as a line (only when there are 2 unknowns and aug = 1)
           names: ["x", "y"]             unknowns for the readout
           task, label
   la-proj     Orthogonal projection in 3-D: y, the plane (or line) W, the projection ŷ and the leftover z = y − ŷ,
               which meets W at a right angle. Optionally the (wrong) sum of separate projections onto a
               non-orthogonal basis, and a Gram–Schmidt button.
     opts: y: [2, 1, 3]; w1: [1, 0, 0]; w2: [1, 1, 0] (null: project onto the line through w1)
           naive: false     offer "Add the separate projections" to compare (useful when w1 · w2 ≠ 0)
           gs: false        offer "Make the basis orthogonal" (replaces w2 by w2 minus its projection onto w1)
           edit: true       number boxes for y
           names: { y: "y", yhat: "ŷ", z: "z", W: "W", w1: "w₁", w2: "w₂" }
           yaw, pitch, task, label
   la-svd      The SVD picture: the unit circle, rotated by Vᵀ, stretched by Σ, rotated by U, becomes the ellipse
               A·(circle). Right singular vectors v₁, v₂ land on the ellipse's axes σ₁u₁, σ₂u₂.
     opts: m: [[3, 0], [4, 5]]  the 2×2 matrix (entries editable)
           t: 3                  starting stage 0 … 3 (0 = x, 1 = Vᵀx, 2 = ΣVᵀx, 3 = UΣVᵀx = Ax)
           vector: true          a unit vector x you drag around the circle, with |Ax| in the readout
           edit: true, task, label
   la-lowrank  Image compression with the SVD: a small grayscale picture, its rank-k approximation, and the
               singular values (kept ones highlighted), with the storage count and the error.
     opts: image: "rook" | "shapes"   the built-in picture
           size: 40                    pixels per side (24 … 64)
           k: 3                        starting rank
           task, label                                                                                          */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/la.js: load viz/core.js first'); return; }
  var M = Math, mk = V.el, fm = V.fmt;

  // ---------------------------------------------------------------- styles
  (function css() {
    if (D.getElementById('la-viz-css')) return;
    var s = D.createElement('style'); s.id = 'la-viz-css';
    s.textContent = [
      '.la-v .la-mat{overflow-x:auto;padding:.4rem .2rem;text-align:center;font-size:1.15rem;min-height:3rem}',
      '.la-v .la-mat math{font-size:1.15em}',
      '.la-v .la-row{display:flex;flex-wrap:wrap;gap:.45rem .7rem;align-items:center;margin:.55rem 0 0}',
      '.la-v .la-row label{display:inline-flex;align-items:center;gap:.3rem;font-size:.88rem;color:var(--mv-muted)}',
      '.la-v select,.la-v .la-in{min-height:36px;box-sizing:border-box;padding:.25rem .45rem;border:1px solid var(--mv-line);border-radius:8px;background:var(--mv-card);color:var(--mv-ink);font:600 .95rem system-ui,sans-serif}',
      '.la-v .la-in{width:4.6rem;text-align:center;font-variant-numeric:tabular-nums}',
      '.la-v .la-in.la-bad{border-color:#d6336c}',
      '.la-v select:focus-visible,.la-v .la-in:focus-visible{outline:3px solid #b8963e;outline-offset:1px}',
      '.la-v .la-op{font:italic 600 1rem Georgia,serif;color:var(--mv-ink);min-width:8rem}',
      '.la-v .la-log{margin:.5rem 0 0;padding:0 0 0 1.3rem;font-size:.85rem;color:var(--mv-muted);max-height:7.5rem;overflow:auto}',
      '.la-v .la-log li{margin:.1rem 0}',
      '.la-v .la-warn{color:#d6336c;font-weight:600}',
      'html[data-theme="dark"] .la-v .la-warn{color:#ff8787}',
      '.la-v .la-ok{color:#00703c;font-weight:600}',
      'html[data-theme="dark"] .la-v .la-ok{color:#6cc79a}',
      '.la-v .la-key i{display:inline-block;width:.8em;height:.8em;border-radius:2px;margin:0 .3em 0 .6em;vertical-align:-.05em}',
      '.la-v .la-key i:first-child{margin-left:0}',
      '@media (max-width:480px){.la-v .la-op{min-width:0;flex-basis:100%}.la-v .la-mat{font-size:1rem}}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ---------------------------------------------------------------- small exact fractions (JS numbers, small values)
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function F(n, d) { if (d === undefined) d = 1; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return { n: n / g, d: d / g }; }
  function fparse(x) {
    if (x && typeof x === 'object' && 'n' in x) return x;
    if (typeof x === 'number') { if (M.round(x) === x) return F(x, 1); for (var d = 2; d <= 1000; d++) { var n = M.round(x * d); if (M.abs(n / d - x) < 1e-9) return F(n, d); } return F(M.round(x * 1000), 1000); }
    var s = String(x).replace(/\s+/g, '').replace(/−/g, '-'), m = /^([-+]?\d+)\/([-+]?\d+)$/.exec(s);
    if (m) { var dd = +m[2]; if (!dd) return null; return F(+m[1], dd); }
    if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return fparse(+s);
    return null;
  }
  function fadd(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fmul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function fdiv(a, b) { return F(a.n * b.d, a.d * b.n); }
  function fneg(a) { return F(-a.n, a.d); }
  function fz(a) { return a.n === 0; }
  function fval(a) { return a.n / a.d; }
  function ftex(a) { return a.d === 1 ? String(a.n) : (a.n < 0 ? '-' : '') + '\\frac{' + M.abs(a.n) + '}{' + a.d + '}'; }
  function ftxt(a) { return (a.n < 0 ? '−' : '') + M.abs(a.n) + (a.d === 1 ? '' : '/' + a.d); }
  var SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  function Rn(i) { return 'R' + SUB[i + 1]; }

  // ---------------------------------------------------------------- shared frame
  function frame(el, o, label) {
    el.classList.add('mla', 'la-v'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var Fm = {};
    if (o.task) { Fm.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(Fm.task); if (ML.typeset) try { ML.typeset(Fm.task); } catch (e) { } }
    Fm.box = mk('div', 'mla-box'); el.appendChild(Fm.box);
    Fm.ctl = mk('div', 'ml-ctl'); el.appendChild(Fm.ctl);
    Fm.out = V.readout(el);
    Fm.done = function (ok) { if (Fm.task) Fm.task.classList.toggle('ok', !!ok); };
    Fm.row = function () { var r = mk('div', 'la-row'); el.insertBefore(r, Fm.out.el); return r; };
    return Fm;
  }
  function rgba(hex, a) { if (!/^#/.test(hex)) return hex; var v = parseInt(hex.slice(1), 16); return 'rgba(' + (v >> 16 & 255) + ',' + (v >> 8 & 255) + ',' + (v & 255) + ',' + a + ')'; }
  function label(ctx, s, x, y, col, o) {
    o = o || {}; var k = V.colors();
    ctx.save(); ctx.font = '700 ' + (o.size || 13) + 'px system-ui,sans-serif'; var w = ctx.measureText(s).width, h = (o.size || 13) + 6;
    var bx = M.max(2, M.min((o.w || 1e4) - w - 12, x - (o.align === 'right' ? w + 10 : o.align === 'left' ? 0 : w / 2 + 5))), by = M.max(2, M.min((o.h || 1e4) - h - 2, y - h / 2));
    ctx.fillStyle = rgba(k.bg, 0.85); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, w + 10, h, 6); else ctx.rect(bx, by, w + 10, h); ctx.fill();
    ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
  }
  function texHTML(src) { return ML.tex ? ML.tex(src, { display: true }) : src; }

  // ================================================================ la-rowops
  V.register('la-rowops', function (el, o) {
    o = Object.assign({ m: [[1, 2, 5], [3, -1, 1]], aug: 1, goal: null, zero: false, picture: true, names: ['x', 'y'] }, o || {});
    var X0 = o.m.map(function (r) { return r.map(fparse); }), m = X0.length, n = X0[0].length, aug = o.aug || 0, nc = n - aug;
    var X = X0.map(function (r) { return r.slice(); }), hist = [], log = [], lost = false;
    var pic = o.picture !== false && aug === 1 && nc === 2;
    var Fm = frame(el, o, 'Row operations on a matrix');
    var matBox = mk('div', 'la-mat'); matBox.setAttribute('aria-live', 'polite'); Fm.box.appendChild(matBox);
    var c = null, Pl = null;
    if (pic) { var cw = mk('div', ''); Fm.box.appendChild(cw); c = V.canvas(cw, { aspect: 1.5, max: 340 }); Pl = V.plane(c, { xmin: -8, xmax: 8, ymin: -6, ymax: 6, equal: true }); c.cv.setAttribute('role', 'img'); }
    var opSeg = V.seg(Fm.ctl, { label: 'Row operation', items: [['add', 'Add a multiple'], ['scale', 'Scale'], ['swap', 'Swap']], value: 'add', change: function () { sync(); } });
    var row2 = Fm.row();
    function sel(lab) { var l = mk('label', '', lab), s = D.createElement('select'); for (var i = 0; i < m; i++) { var op = D.createElement('option'); op.value = i; op.textContent = 'row ' + (i + 1); s.appendChild(op); } l.appendChild(s); row2.appendChild(l); s.addEventListener('change', sync); return { l: l, s: s }; }
    var tgt = sel('Change'), src = sel('using'); src.s.value = m > 1 ? 0 : 0; tgt.s.value = m > 1 ? 1 : 0;
    var kl = mk('label', '', 'by'), kin = D.createElement('input'); kin.className = 'la-in'; kin.value = '-3'; kin.setAttribute('inputmode', 'text'); kin.setAttribute('aria-label', 'multiplier (a whole number, decimal or fraction like -3/2)'); kl.appendChild(kin); row2.appendChild(kl);
    kin.addEventListener('input', sync); kin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    var opTxt = mk('span', 'la-op'); row2.appendChild(opTxt);
    var row3 = Fm.row(), bApply = V.button(row3, 'Apply', apply, 'pri'), bNext = V.button(row3, 'Next step for me', nextStep), bUndo = V.button(row3, 'Undo', undo), bReset = V.button(row3, 'Reset', reset);
    var logEl = mk('ol', 'la-log'); el.insertBefore(logEl, Fm.out.el); logEl.setAttribute('aria-label', 'Operations so far');
    var msg = '';

    function cur() { var t = opSeg.get(), i = +tgt.s.value, j = +src.s.value, k = fparse(kin.value); return { t: t, i: i, j: j, k: k }; }
    function opText(p) {
      if (p.t === 'swap') return Rn(p.i) + ' ↔ ' + Rn(p.j);
      if (!p.k) return '';
      if (p.t === 'scale') return Rn(p.i) + ' → ' + (p.k.n === p.k.d ? '' : p.k.n === -p.k.d ? '−' : p.k.d === 1 ? ftxt(p.k) : '(' + ftxt(p.k) + ')') + Rn(p.i);
      var neg = p.k.n < 0, a = neg ? fneg(p.k) : p.k;
      return Rn(p.i) + ' → ' + Rn(p.i) + (neg ? ' − ' : ' + ') + (a.n === a.d ? '' : a.d === 1 ? ftxt(a) : '(' + ftxt(a) + ')') + Rn(p.j);
    }
    function sync() {
      var p = cur(); src.l.hidden = p.t === 'scale'; kl.hidden = p.t === 'swap';
      src.l.firstChild.textContent = p.t === 'swap' ? 'with' : 'using';
      tgt.l.firstChild.textContent = p.t === 'swap' ? 'Swap' : 'Change';
      kin.classList.toggle('la-bad', p.t !== 'swap' && !p.k);
      opTxt.textContent = opText(p);
    }
    function snapshot() { hist.push({ X: X.map(function (r) { return r.slice(); }), log: log.slice(), lost: lost }); }
    function doOp(p) {
      if (p.t === 'swap') { var t = X[p.i]; X[p.i] = X[p.j]; X[p.j] = t; }
      else if (p.t === 'scale') { X[p.i] = X[p.i].map(function (x) { return fmul(x, p.k); }); }
      else { X[p.i] = X[p.i].map(function (x, c2) { return fadd(x, fmul(p.k, X[p.j][c2])); }); }
      log.push(opText(p));
    }
    function apply() {
      var p = cur(); msg = '';
      if (p.t !== 'swap' && !p.k) { msg = '<span class="la-warn">Type a number for the multiplier, like −3, 1/2 or 0.5.</span>'; draw(); return; }
      if (p.t !== 'scale' && p.i === p.j) { msg = '<span class="la-warn">Pick two different rows.</span> ' + (p.t === 'add' ? 'Adding a multiple of a row to itself is really scaling it, and adding −1 times itself wipes it out.' : ''); draw(); return; }
      if (p.t === 'scale' && fz(p.k)) {
        if (!o.zero) { msg = '<span class="la-warn">Scaling by 0 is not a row operation.</span> It would erase an equation, and that can change the solutions.'; draw(); return; }
        snapshot(); doOp(p); lost = true; msg = '<span class="la-warn">Row ' + (p.i + 1) + ' is now all zeros: that equation is gone and cannot be brought back.</span> The solution set ' + (pic ? 'grew (look at the picture)' : 'may have grown') + '. Press Undo.'; draw(); return;
      }
      snapshot(); doOp(p); draw();
    }
    function undo() { if (!hist.length) return; var h = hist.pop(); X = h.X; log = h.log; lost = h.lost; msg = ''; draw(); }
    function reset() { X = X0.map(function (r) { return r.slice(); }); hist = []; log = []; lost = false; msg = ''; draw(); }
    function nextOp() { // the next Gauss(-Jordan) step from the current matrix
      var rr = 0, mode = o.goal === 'echelon' ? 'echelon' : 'rref';
      for (var cc = 0; cc < nc && rr < m; cc++) {
        var p = -1, i;
        if (!fz(X[rr][cc])) p = rr; else for (i = rr + 1; i < m; i++) if (!fz(X[i][cc])) { p = i; break; }
        if (p < 0) continue;
        if (p !== rr) return { t: 'swap', i: rr, j: p };
        if (mode === 'rref' && !(X[rr][cc].n === 1 && X[rr][cc].d === 1)) return { t: 'scale', i: rr, k: fdiv(F(1), X[rr][cc]) };
        for (i = 0; i < m; i++) { if (i === rr || (mode !== 'rref' && i < rr) || fz(X[i][cc])) continue; return { t: 'add', i: i, j: rr, k: fneg(fdiv(X[i][cc], X[rr][cc])) }; }
        rr++;
      }
      return null;
    }
    function nextStep() {
      msg = '';
      if (lost) { msg = 'First undo the step that erased a row.'; draw(); return; }
      var p = nextOp(); if (!p) { msg = 'Nothing left to do: the matrix is in ' + (o.goal === 'echelon' ? '' : 'reduced ') + 'echelon form.'; draw(); return; }
      opSeg.set(p.t); tgt.s.value = p.i; if (p.j != null) src.s.value = p.j; if (p.k) kin.value = ftxt(p.k).replace('−', '-'); sync();
      snapshot(); doOp(p); draw();
    }
    function lead(r) { for (var j = 0; j < nc; j++) if (!fz(r[j])) return j; return -1; }
    function shape() {
      var last = -1, zero = false, ech = true, red = true;
      X.forEach(function (r, i) {
        var l = lead(r);
        if (l < 0) { if (r.slice(nc).some(function (x) { return !fz(x); })) { if (zero) ech = false; last = M.max(last, nc - 1); } else zero = true; return; }
        if (zero || l <= last) ech = false; last = l;
        if (!(r[l].n === 1 && r[l].d === 1)) red = false;
        for (var k = 0; k < m; k++) if (k !== i && !fz(X[k][l])) red = false;
      });
      return { ech: ech, rref: ech && red };
    }
    function solveInfo() { // for the augmented case: consistency and the free count
      var Y = X.map(function (r) { return r.slice(); }), rr = 0, piv = [];
      for (var cc = 0; cc < nc && rr < m; cc++) {
        var p = -1; for (var i = rr; i < m; i++) if (!fz(Y[i][cc])) { p = i; break; }
        if (p < 0) continue; var t = Y[p]; Y[p] = Y[rr]; Y[rr] = t;
        var s = Y[rr][cc]; Y[rr] = Y[rr].map(function (x) { return fdiv(x, s); });
        for (i = 0; i < m; i++) if (i !== rr && !fz(Y[i][cc])) { var f = Y[i][cc]; Y[i] = Y[i].map(function (x, c2) { return fadd(x, fneg(fmul(f, Y[rr][c2]))); }); }
        piv.push(cc); rr++;
      }
      var bad = Y.some(function (r) { return lead(r) < 0 && r.slice(nc).some(function (x) { return !fz(x); }); });
      var sol = null; if (!bad && piv.length === nc) { sol = []; piv.forEach(function (pc, i) { sol[pc] = Y[i][nc]; }); }
      return { bad: bad, piv: piv, sol: sol };
    }
    var COLS = ['blue', 'red', 'green', 'purple'];
    function draw() {
      var src2 = aug ? '\\left[\\begin{array}{' + 'c'.repeat(nc) + '|' + 'c'.repeat(aug) + '} ' : '\\begin{bmatrix} ';
      src2 += X.map(function (r) { return r.map(ftex).join(' & '); }).join(' \\\\ ') + (aug ? ' \\end{array}\\right]' : ' \\end{bmatrix}');
      matBox.innerHTML = texHTML(src2);
      var sh = shape(), info = aug ? solveInfo() : null, s = '';
      if (pic) {
        var k = V.colors(), ctx = c.ctx; Pl.clear(); Pl.grid({ step: 1 }); Pl.axes({ step: 2 });
        var key = [];
        X.forEach(function (r, i) {
          var a = fval(r[0]), b = fval(r[1]), cc = fval(r[2]), col = k[COLS[i % 4]];
          if (M.abs(a) < 1e-12 && M.abs(b) < 1e-12) { key.push('<i style="background:' + rgba(col, 0.35) + '"></i>' + Rn(i) + ': ' + (M.abs(cc) < 1e-12 ? '0 = 0 (no line)' : '0 = ' + ftxt(r[2]) + ' (impossible)')); return; }
          if (M.abs(b) > 1e-12) Pl.plot(function (x) { return (cc - a * x) / b; }, { color: col, width: 3 });
          else Pl.seg(cc / a, -50, cc / a, 50, { color: col, width: 3 });
          key.push('<i style="background:' + col + '"></i>' + Rn(i));
        });
        if (info && info.sol) { var px = fval(info.sol[0]), py = fval(info.sol[1]); Pl.point(px, py, { color: 'gold', r: 6 }); label(ctx, '(' + ftxt(info.sol[0]) + ', ' + ftxt(info.sol[1]) + ')', Pl.X(px) + 10, Pl.Y(py) - 14, k.ink, { align: 'left', w: c.w, h: c.h }); }
        c.cv.setAttribute('aria-label', 'The rows as lines. ' + (info && info.sol ? 'They cross at (' + ftxt(info.sol[0]) + ', ' + ftxt(info.sol[1]) + ').' : ''));
        s += '<span class="la-key">' + key.join(' ') + '</span><br>';
      }
      if (aug && info) {
        var nm = o.names || ['x', 'y', 'z', 'w'];
        if (info.bad) s += 'A row says <b>0 = (nonzero)</b>: the system has <b>no solution</b>. ';
        else if (info.sol) s += 'One solution: ' + info.sol.map(function (v, i) { return '<i>' + (nm[i] || 'x' + (i + 1)) + '</i> = ' + ftxt(v); }).join(', ') + (pic ? ' (the gold point). Legal row operations never move it.' : '. Legal row operations never change it.') + ' ';
        else s += 'Infinitely many solutions (' + (nc - info.piv.length) + ' free variable' + (nc - info.piv.length > 1 ? 's' : '') + '). ';
      }
      s += sh.rref ? '<span class="la-ok">Reduced echelon form.</span>' : sh.ech ? '<span class="la-ok">Echelon form.</span>' + (o.goal === 'rref' ? ' Keep going: make each pivot 1 and clear above it.' : '') : 'Not yet in echelon form.';
      if (msg) s += '<br>' + msg;
      Fm.out.set(s);
      logEl.innerHTML = log.map(function (t) { return '<li>' + t + '</li>'; }).join('');
      logEl.hidden = !log.length; bUndo.disabled = !hist.length;
      if (o.goal) Fm.done(!lost && (o.goal === 'echelon' ? sh.ech : sh.rref) && log.length > 0);
    }
    if (pic) { c.onResize(draw); }
    var first = nextOp(); // start the controls on a sensible first move
    if (first) { opSeg.set(first.t); tgt.s.value = first.i; if (first.j != null) src.s.value = first.j; if (first.k) kin.value = ftxt(first.k).replace('−', '-'); }
    V.onTheme(draw); sync(); draw();
    return { draw: draw };
  });

  // ---------------------------------------------------------------- 3-D camera (orthographic, drag or arrow keys to turn)
  function cam3(c, o) {
    var S = { yaw: o.yaw != null ? o.yaw : -2.3, pitch: o.pitch != null ? o.pitch : 0.45, r: o.r || 4 }, cy, sy, cp, sp, s, ox, oy;
    S.calc = function () { cy = M.cos(S.yaw); sy = M.sin(S.yaw); cp = M.cos(S.pitch); sp = M.sin(S.pitch); s = M.min(c.w, c.h) * 0.45 / S.r; ox = c.w / 2; oy = c.h / 2; };
    S.p = function (v) { var x1 = v[0] * cy - v[1] * sy, y1 = v[0] * sy + v[1] * cy; return [ox + s * x1, oy - s * (y1 * sp + v[2] * cp), -y1 * cp + v[2] * sp]; };
    var drag = null;
    V.drag(c.cv, { hit: function () { return 'cam'; }, start: function (h, px, py) { drag = [px, py, S.yaw, S.pitch]; }, move: function (h, px, py) { S.yaw = drag[2] - (px - drag[0]) * 0.01; S.pitch = M.max(-1.45, M.min(1.45, drag[3] + (py - drag[1]) * 0.01)); S.calc(); o.change(); }, end: function () { drag = null; } });
    c.cv.tabIndex = 0;
    c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key]; if (d) { S.yaw += d[0]; S.pitch = M.max(-1.45, M.min(1.45, S.pitch + d[1])); S.calc(); o.change(); e.preventDefault(); } });
    c.onResize(function () { S.calc(); o.change(); }); S.calc();
    S.line = function (ctx, a, b, col, w, dash) { var p = S.p(a), q = S.p(b); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore(); };
    S.arrow = function (ctx, a, b, col, w) {
      var p = S.p(a), q = S.p(b), ang = M.atan2(q[1] - p[1], q[0] - p[0]), L = M.hypot(q[0] - p[0], q[1] - p[1]), hs = M.min(12, L * 0.45);
      ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w || 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0] - hs * 0.6 * M.cos(ang), q[1] - hs * 0.6 * M.sin(ang)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - hs * M.cos(ang - 0.42), q[1] - hs * M.sin(ang - 0.42)); ctx.lineTo(q[0] - hs * M.cos(ang + 0.42), q[1] - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore(); return q;
    };
    S.poly = function (ctx, pts, fill, stroke) { ctx.save(); ctx.beginPath(); pts.forEach(function (v, i) { var p = S.p(v); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } ctx.restore(); };
    S.axes = function (ctx, L) { var k = V.colors(); ['x', 'y', 'z'].forEach(function (nm, i) { var e = [0, 0, 0]; e[i] = L; var ne = [0, 0, 0]; ne[i] = -L; S.line(ctx, ne, e, rgba(k.axis, 0.7), 1.3); var q = S.p(e); ctx.save(); ctx.font = 'italic 14px Georgia,serif'; ctx.fillStyle = k.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nm, q[0] + (q[0] - ox) * 0.06, q[1] + (q[1] - oy) * 0.06); ctx.restore(); }); };
    return S;
  }
  function v3(a) { return [+a[0] || 0, +a[1] || 0, +a[2] || 0]; }
  function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sc3(k, a) { return [k * a[0], k * a[1], k * a[2]]; }
  function sub3(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function len3(a) { return M.sqrt(dot3(a, a)); }
  function vs(a, d) { return '(' + a.map(function (x) { return fm(x, d == null ? 2 : d); }).join(', ') + ')'; }

  // ================================================================ la-proj
  V.register('la-proj', function (el, o) {
    o = Object.assign({ y: [2, 1, 3], w1: [1, 0, 0], w2: [1, 1, 0], naive: false, gs: false, edit: true }, o || {});
    var nm = Object.assign({ y: 'y', yhat: 'ŷ', z: 'z', W: 'W', w1: 'w₁', w2: 'w₂' }, o.names || {});
    var y = v3(o.y), w1 = v3(o.w1), w2 = o.w2 ? v3(o.w2) : null, w2orig = w2 ? w2.slice() : null, showNaive = false;
    var Fm = frame(el, o, 'Orthogonal projection in three dimensions');
    var big = Math.max(len3(y), len3(w1), w2 ? len3(w2) : 0, 1.5), RR = Math.min(4.2, Math.max(2.2, big * 1.25));
    var c = V.canvas(Fm.box, { aspect: 1.35, max: 460, min: 260 }), C = cam3(c, { yaw: o.yaw, pitch: o.pitch != null ? o.pitch : 0.6, r: RR, change: draw });
    c.cv.setAttribute('aria-label', 'Projection picture. Drag or use the arrow keys to turn it.');
    if (o.edit) {
      var row = Fm.row(); row.appendChild(mk('span', '', '<b><i>' + nm.y + '</i></b> ='));
      ['x', 'y', 'z'].forEach(function (a, i) { var l = mk('label', '', a), inp = D.createElement('input'); inp.type = 'number'; inp.step = '0.5'; inp.className = 'la-in'; inp.value = y[i]; inp.setAttribute('aria-label', nm.y + ' ' + a + ' component'); inp.addEventListener('input', function () { var v = parseFloat(inp.value); if (isFinite(v)) { y[i] = v; draw(); } }); l.appendChild(inp); row.appendChild(l); });
    }
    if (w2 && (o.naive || o.gs)) {
      var row2 = Fm.row();
      if (o.naive) { var bN = V.button(row2, 'Add the separate projections', function () { showNaive = !showNaive; bN.setAttribute('aria-pressed', String(showNaive)); draw(); }); bN.setAttribute('aria-pressed', 'false'); }
      if (o.gs) { var bG = V.button(row2, 'Make the basis orthogonal', function () { if (w2 === w2orig || eq(w2, w2orig)) { w2 = sub3(w2orig, sc3(dot3(w2orig, w1) / dot3(w1, w1), w1)); bG.textContent = 'Use the original basis'; } else { w2 = w2orig.slice(); bG.textContent = 'Make the basis orthogonal'; } draw(); }); }
    }
    function eq(a, b) { return M.abs(a[0] - b[0]) + M.abs(a[1] - b[1]) + M.abs(a[2] - b[2]) < 1e-12; }
    function proj(v) { // onto W (normal equations; works for any basis)
      if (!w2) return sc3(dot3(v, w1) / dot3(w1, w1), w1);
      var a = dot3(w1, w1), b = dot3(w1, w2), d = dot3(w2, w2), p = dot3(v, w1), q2 = dot3(v, w2), det = a * d - b * b;
      var c1 = (p * d - q2 * b) / det, c2 = (a * q2 - b * p) / det; return add3(sc3(c1, w1), sc3(c2, w2));
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx; ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      C.axes(ctx, RR * 0.9);
      if (w2) { // the plane patch
        var e1 = sc3(1 / len3(w1), w1), t = sub3(w2, sc3(dot3(w2, e1), e1)), e2 = sc3(1 / (len3(t) || 1), t), R = RR * 0.8;
        var pts = [add3(sc3(-R, e1), sc3(-R, e2)), add3(sc3(R, e1), sc3(-R, e2)), add3(sc3(R, e1), sc3(R, e2)), add3(sc3(-R, e1), sc3(R, e2))];
        C.poly(ctx, pts, rgba(k.purple, 0.13), rgba(k.purple, 0.45));
        for (var g = -M.floor(R); g <= M.floor(R); g++) { C.line(ctx, add3(sc3(g, e1), sc3(-R, e2)), add3(sc3(g, e1), sc3(R, e2)), rgba(k.purple, 0.16), 1); C.line(ctx, add3(sc3(-R, e1), sc3(g, e2)), add3(sc3(R, e1), sc3(g, e2)), rgba(k.purple, 0.16), 1); }
        var pl = C.p(pts[1]); if (nm.W) label(ctx, nm.W, pl[0], pl[1], k.purple, { w: c.w, h: c.h });
      } else { var e = sc3(RR / len3(w1), w1); C.line(ctx, sc3(-1, e), e, rgba(k.purple, 0.5), 5); }
      var yh = proj(y), z = sub3(y, yh);
      C.arrow(ctx, [0, 0, 0], w1, rgba(k.purple, 0.9), 2.2); var q1 = C.p(w1); label(ctx, nm.w1, q1[0] + 4, q1[1] + 12, k.purple, { align: 'left', w: c.w, h: c.h, size: 12 });
      if (w2) { C.arrow(ctx, [0, 0, 0], w2, rgba(k.purple, 0.9), 2.2); var q2 = C.p(w2); label(ctx, nm.w2, q2[0] + 4, q2[1] + 12, k.purple, { align: 'left', w: c.w, h: c.h, size: 12 }); }
      var naive = null;
      if (showNaive && w2) { naive = add3(sc3(dot3(y, w1) / dot3(w1, w1), w1), sc3(dot3(y, w2) / dot3(w2, w2), w2)); C.arrow(ctx, [0, 0, 0], naive, k.orange, 2.6); C.line(ctx, naive, y, k.orange, 1.8, [4, 4]); var qn = C.p(naive); label(ctx, 'sum of separate projections', qn[0], qn[1] + 16, k.orange, { w: c.w, h: c.h, size: 11 }); }
      C.arrow(ctx, [0, 0, 0], y, k.blue, 3.2); var qy = C.p(y); label(ctx, nm.y, qy[0] + 6, qy[1] - 12, k.blue, { align: 'left', w: c.w, h: c.h });
      C.arrow(ctx, [0, 0, 0], yh, k.green, 3.2); var qh = C.p(yh); label(ctx, nm.yhat, qh[0] + 6, qh[1] + 14, k.green, { align: 'left', w: c.w, h: c.h });
      C.line(ctx, yh, y, k.red, 2.4, [6, 4]); var qm = C.p(add3(yh, sc3(0.5, z))); label(ctx, nm.z.length <= 2 ? nm.z + ' = ' + nm.y + ' − ' + nm.yhat : nm.z, qm[0] + 8, qm[1], k.red, { align: 'left', w: c.w, h: c.h, size: 12 });
      if (len3(z) > 0.3 && len3(yh) > 0.3) { // right-angle mark at ŷ
        var a1 = sc3(0.32 / len3(yh), sc3(-1, yh)), a2 = sc3(0.32 / len3(z), z), p0 = C.p(add3(yh, a1)), p1 = C.p(add3(add3(yh, a1), a2)), p2 = C.p(add3(yh, a2));
        ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke(); ctx.restore();
      }
      var s = nm.yhat + ' = <b>' + vs(yh) + '</b>, ' + (nm.z.length <= 2 ? nm.z + ' = ' + nm.y + ' − ' + nm.yhat : nm.z) + ' = ' + vs(z) + ', length ' + fm(len3(z), 3) + '. ';
      s += nm.z + ' · ' + nm.w1 + ' = ' + fm(dot3(z, w1), 3) + (w2 ? ' and ' + nm.z + ' · ' + nm.w2 + ' = ' + fm(dot3(z, w2), 3) : '') + ': the leftover is perpendicular to ' + nm.W + ', so ' + nm.yhat + ' is the closest point of ' + nm.W + ' to ' + nm.y + '.';
      if (w2) { var b12 = dot3(w1, w2); s += '<br>' + nm.w1 + ' · ' + nm.w2 + ' = ' + fm(b12, 3) + (M.abs(b12) < 1e-9 ? ': an orthogonal basis, so ' + nm.yhat + ' is the sum of the separate projections onto ' + nm.w1 + ' and ' + nm.w2 + '.' : ': not orthogonal.'); }
      if (naive) { var zn = sub3(y, naive); s += '<br><span class="la-warn">The sum of separate projections is ' + vs(naive) + '</span>' + (M.abs(dot3(w1, w2)) < 1e-9 ? ', the same as ' + nm.yhat + ' here.' : '. Its leftover has dot products ' + fm(dot3(zn, w1), 3) + ' and ' + fm(dot3(zn, w2), 3) + ' with the basis: not perpendicular, so it is not the projection.'); }
      Fm.out.set(s);
    }
    V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ================================================================ la-svd
  function svd2(A) { // A = U diag(s1, s2') V^T with V a rotation (det 1); s2' may be negative when det A < 0; U a rotation
    var a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1];
    var p = a * a + c * c, r = a * b + c * d, q = b * b + d * d; // A^T A = [[p, r], [r, q]]
    var th = 0.5 * M.atan2(2 * r, p - q), ct = M.cos(th), st = M.sin(th); // v1 = (ct, st)
    var tr = p + q, disc = M.sqrt(M.max(0, (p - q) * (p - q) + 4 * r * r)), l1 = (tr + disc) / 2, l2 = M.max(0, (tr - disc) / 2);
    var s1 = M.sqrt(l1), s2 = M.sqrt(l2), v1 = [ct, st], v2 = [-st, ct];
    var Av1 = [a * v1[0] + b * v1[1], c * v1[0] + d * v1[1]], Av2 = [a * v2[0] + b * v2[1], c * v2[0] + d * v2[1]];
    var u1 = s1 > 1e-12 ? [Av1[0] / s1, Av1[1] / s1] : [1, 0], u2 = [-u1[1], u1[0]];
    var s2p = Av2[0] * u2[0] + Av2[1] * u2[1]; // signed: Av2 = s2p u2
    return { s1: s1, s2: s2, s2p: s2p, v1: v1, v2: v2, u1: u1, u2: u2, alpha: th, beta: M.atan2(u1[1], u1[0]), det: a * d - b * c };
  }
  V.register('la-svd', function (el, o) {
    o = Object.assign({ m: [[3, 0], [4, 5]], t: 3, vector: true, edit: true }, o || {});
    var A = [[+o.m[0][0], +o.m[0][1]], [+o.m[1][0], +o.m[1][1]]], S = { t: M.max(0, M.min(3, +o.t)), ang: 0.6 }, anim = null, sv;
    var Fm = frame(el, o, 'The singular value decomposition of a 2 by 2 matrix');
    var c = V.canvas(Fm.box, { aspect: 1.3, max: 460, min: 270 }), P;
    function rangeOf() { sv = svd2(A); return M.max(1.6, sv.s1 * 1.18); }
    var rg = rangeOf(); P = V.plane(c, { xmin: -rg * 1.3, xmax: rg * 1.3, ymin: -rg, ymax: rg, equal: true });
    c.cv.setAttribute('aria-label', 'The unit circle and its image under A. Arrow keys move the unit vector x.'); c.cv.tabIndex = 0;
    if (o.edit) {
      var row = Fm.row(), wrap = mk('div', 'mla-matwrap'); wrap.appendChild(mk('span', 'mla-ml', 'A =')); var g = mk('div', 'mla-mat'); wrap.appendChild(g); row.appendChild(wrap);
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (ij) { var inp = D.createElement('input'); inp.type = 'number'; inp.step = '0.5'; inp.value = A[ij[0]][ij[1]]; inp.setAttribute('aria-label', 'A row ' + (ij[0] + 1) + ' column ' + (ij[1] + 1)); inp.addEventListener('input', function () { var v = parseFloat(inp.value); if (isFinite(v)) { A[ij[0]][ij[1]] = v; rg = rangeOf(); P.set({ xmin: -rg * 1.3, xmax: rg * 1.3, ymin: -rg, ymax: rg }); draw(); } }); g.appendChild(inp); });
    }
    var STG = [['0', 'x'], ['1', 'Vᵀx'], ['2', 'ΣVᵀx'], ['3', 'UΣVᵀx = Ax']];
    var seg = V.seg(Fm.ctl, { label: 'Stage', items: STG, value: String(M.round(S.t)), change: function (v) { stop(); S.t = +v; sl.set(S.t); draw(); } });
    var sl = V.slider(Fm.ctl, { label: 'progress', min: 0, max: 3, step: 0.01, value: S.t, fmt: function (v) { return fm(v, 2); }, input: function (v) { stop(); S.t = v; seg.set(String(M.round(v))); draw(); } });
    V.button(Fm.ctl, '▶ Play', function () { stop(); S.t = 0; var acc = 0; anim = V.loop(el, function (dt) { if (V.reduced) { acc += dt; if (acc < 0.5) return; acc = 0; S.t = M.min(3, M.floor(S.t) + 1); } else S.t = M.min(3, S.t + dt / 1.4); sl.set(S.t); seg.set(String(M.round(S.t))); draw(); if (S.t >= 3) stop(); }); }, 'pri');
    function stop() { if (anim) { anim.stop(); anim = null; } }
    function rot(a) { return [[M.cos(a), -M.sin(a)], [M.sin(a), M.cos(a)]]; }
    function mul(X, Y) { return [[X[0][0] * Y[0][0] + X[0][1] * Y[1][0], X[0][0] * Y[0][1] + X[0][1] * Y[1][1]], [X[1][0] * Y[0][0] + X[1][1] * Y[1][0], X[1][0] * Y[0][1] + X[1][1] * Y[1][1]]]; }
    function ap(X, v) { return [X[0][0] * v[0] + X[0][1] * v[1], X[1][0] * v[0] + X[1][1] * v[1]]; }
    function stageM(t) { // the map applied so far
      var a = sv.alpha, Vt = rot(-a);
      if (t <= 1) return rot(-a * t);
      if (t <= 2) { var u = t - 1; return mul([[1 + (sv.s1 - 1) * u, 0], [0, 1 + (sv.s2p - 1) * u]], Vt); }
      return mul(rot(sv.beta * (t - 2)), mul([[sv.s1, 0], [0, sv.s2p]], Vt));
    }
    var dragging = false;
    V.drag(c.cv, { hit: function (px, py) { if (!o.vector) return null; var x = [M.cos(S.ang), M.sin(S.ang)], p = ap(stageM(S.t), x); return M.hypot(P.X(p[0]) - px, P.Y(p[1]) - py) < 26 || M.hypot(P.X(x[0]) - px, P.Y(x[1]) - py) < 26 ? 1 : null; }, move: function (h, px, py) { var Mi = stageM(S.t), dx = P.x(px), dy = P.y(py), det = Mi[0][0] * Mi[1][1] - Mi[0][1] * Mi[1][0], v = M.abs(det) > 1e-9 ? [(Mi[1][1] * dx - Mi[0][1] * dy) / det, (-Mi[1][0] * dx + Mi[0][0] * dy) / det] : [dx, dy]; S.ang = M.atan2(v[1], v[0]); draw(); } });
    c.cv.addEventListener('keydown', function (e) { if (!o.vector) return; if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { S.ang -= 0.05; draw(); e.preventDefault(); } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { S.ang += 0.05; draw(); e.preventDefault(); } });
    function draw() {
      var k = V.colors(), ctx = c.ctx, Mt = stageM(S.t);
      P.clear(); P.grid({ step: 1 }); P.axes({ step: rg > 6 ? 2 : 1 });
      P.circle(0, 0, 1, { color: rgba(k.muted, 0.8), width: 1.5, dash: [5, 4] });
      var pts = []; for (var i = 0; i <= 120; i++) { var th = i / 120 * 2 * M.PI; pts.push(ap(Mt, [M.cos(th), M.sin(th)])); }
      P.poly(pts, { fill: rgba(k.gold, 0.22), color: 'gold', width: 2.5 });
      var a1 = ap(Mt, sv.v1), a2 = ap(Mt, sv.v2);
      P.arrow(0, 0, a1[0], a1[1], { color: 'green', width: 3.4, head: 12 }); P.arrow(0, 0, a2[0], a2[1], { color: 'red', width: 3.4, head: 12 });
      var names = S.t < 0.5 ? ['v₁', 'v₂'] : S.t < 1.5 ? ['e₁', 'e₂'] : S.t < 2.5 ? ['σ₁e₁', 'σ₂e₂'] : ['σ₁u₁', 'σ₂u₂'];
      label(ctx, names[0], P.X(a1[0]) + 8, P.Y(a1[1]) - 12, k.green, { align: 'left', w: c.w, h: c.h });
      label(ctx, names[1], P.X(a2[0]) + 8, P.Y(a2[1]) - 12, k.red, { align: 'left', w: c.w, h: c.h });
      var x = [M.cos(S.ang), M.sin(S.ang)], ax = ap(Mt, x), full = ap(A, x);
      if (o.vector) { P.arrow(0, 0, ax[0], ax[1], { color: 'teal', width: 2.6, head: 10 }); P.point(ax[0], ax[1], { color: 'teal', r: 6 }); }
      var s = 'σ₁ = <b>' + fm(sv.s1, 3) + '</b>, σ₂ = <b>' + fm(sv.s2, 3) + '</b> (square roots of the eigenvalues of AᵀA). v₁ = ' + vs(sv.v1) + ', v₂ = ' + vs(sv.v2) + '; u₁ = ' + vs(sv.u1) + '.';
      s += '<br>' + ['Start: the unit circle with the right singular vectors v₁, v₂.', 'Vᵀ turns v₁, v₂ onto the axes. Rotations keep the circle a circle.', 'Σ stretches the axes by σ₁ and σ₂' + (sv.s2p < 0 ? ' (and flips one, since det A < 0)' : '') + ': now an ellipse.', 'U turns the ellipse into place: its half-axes are σ₁u₁ and σ₂u₂. This is A applied to the circle.'][M.min(3, M.round(S.t))];
      if (o.vector) s += '<br>Unit vector x = ' + vs(x) + ': |Ax| = <b>' + fm(M.hypot(full[0], full[1]), 3) + '</b> (always between σ₂ and σ₁; largest when x = ±v₁).';
      Fm.out.set(s);
    }
    c.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });

  // ================================================================ la-lowrank
  function picture(kind, n) { // an n x n grayscale picture, values 0 (white) … 1 (ink)
    var cv = D.createElement('canvas'); cv.width = n; cv.height = n; var g = cv.getContext('2d'), u = n / 40;
    g.fillStyle = '#fff'; g.fillRect(0, 0, n, n); g.fillStyle = '#000';
    if (kind === 'shapes') {
      g.fillStyle = '#222'; g.beginPath(); g.arc(13 * u, 14 * u, 8 * u, 0, 2 * M.PI); g.fill();
      g.fillStyle = '#777'; g.fillRect(22 * u, 6 * u, 13 * u, 13 * u);
      g.fillStyle = '#444'; g.beginPath(); g.moveTo(6 * u, 35 * u); g.lineTo(18 * u, 22 * u); g.lineTo(30 * u, 35 * u); g.closePath(); g.fill();
      g.fillStyle = '#aaa'; g.fillRect(28 * u, 24 * u, 8 * u, 12 * u);
    } else { // a chess rook on a two-tone floor
      g.fillStyle = '#ddd'; g.fillRect(0, 31 * u, n, 9 * u); g.fillStyle = '#bbb'; for (var i = 0; i < 5; i++) g.fillRect(i * 8 * u + (i % 2 ? 0 : 4 * u), 31 * u, 4 * u, 9 * u);
      g.fillStyle = '#111';
      g.fillRect(10 * u, 6 * u, 4 * u, 5 * u); g.fillRect(18 * u, 6 * u, 4 * u, 5 * u); g.fillRect(26 * u, 6 * u, 4 * u, 5 * u);
      g.fillRect(10 * u, 10 * u, 20 * u, 4 * u);
      g.beginPath(); g.moveTo(13 * u, 14 * u); g.lineTo(27 * u, 14 * u); g.lineTo(28 * u, 26 * u); g.lineTo(12 * u, 26 * u); g.closePath(); g.fill();
      g.fillRect(9 * u, 26 * u, 22 * u, 3 * u); g.fillRect(7 * u, 29 * u, 26 * u, 3 * u);
      g.fillStyle = '#666'; g.fillRect(17 * u, 17 * u, 6 * u, 4 * u);
    }
    var d = g.getImageData(0, 0, n, n).data, A = [];
    for (var r = 0; r < n; r++) { A.push([]); for (var cc = 0; cc < n; cc++) { var o = 4 * (r * n + cc); A[r].push(1 - (0.3 * d[o] + 0.59 * d[o + 1] + 0.11 * d[o + 2]) / 255); } }
    return A;
  }
  function jacobiSVD(A) { // one-sided Jacobi: A (m x n, m >= n) -> { U (m x n columns), s (n), V (n x n) }, sorted
    var m = A.length, n = A[0].length, Uc = [], Vc = [], i, j, k;
    for (j = 0; j < n; j++) { Uc.push(A.map(function (r) { return r[j]; })); var e = new Array(n).fill(0); e[j] = 1; Vc.push(e); }
    for (var sweep = 0; sweep < 30; sweep++) {
      var off = 0;
      for (i = 0; i < n - 1; i++) for (j = i + 1; j < n; j++) {
        var a = 0, b = 0, g = 0, x = Uc[i], y = Uc[j];
        for (k = 0; k < m; k++) { a += x[k] * x[k]; b += y[k] * y[k]; g += x[k] * y[k]; }
        if (M.abs(g) <= 1e-12 * M.sqrt(a * b) || M.abs(g) < 1e-15) continue;
        off = M.max(off, M.abs(g) / M.sqrt(a * b));
        var z = (b - a) / (2 * g), t = (z >= 0 ? 1 : -1) / (M.abs(z) + M.sqrt(1 + z * z)), cs = 1 / M.sqrt(1 + t * t), sn = cs * t;
        for (k = 0; k < m; k++) { var xi = x[k], yi = y[k]; x[k] = cs * xi - sn * yi; y[k] = sn * xi + cs * yi; }
        var p = Vc[i], q = Vc[j]; for (k = 0; k < n; k++) { var pi = p[k], qi = q[k]; p[k] = cs * pi - sn * qi; q[k] = sn * pi + cs * qi; }
      }
      if (off < 1e-10) break;
    }
    var out = [];
    for (j = 0; j < n; j++) { var s = M.sqrt(Uc[j].reduce(function (acc, v) { return acc + v * v; }, 0)); out.push({ s: s, u: Uc[j].map(function (v) { return s > 1e-12 ? v / s : 0; }), v: Vc[j] }); }
    out.sort(function (P1, P2) { return P2.s - P1.s; });
    return out;
  }
  V.register('la-lowrank', function (el, o) {
    o = Object.assign({ image: 'rook', size: 40, k: 3 }, o || {});
    var n = M.max(24, M.min(64, M.round(+o.size || 40))), A = picture(o.image, n), Sv = jacobiSVD(A), K = M.max(1, M.min(n, M.round(+o.k || 3)));
    var tot = Sv.reduce(function (s, p) { return s + p.s * p.s; }, 0);
    var Fm = frame(el, o, 'Compressing a picture with the singular value decomposition');
    var c = V.canvas(Fm.box, { aspect: 1.9, max: 420, min: 200 }); c.cv.setAttribute('role', 'img');
    var cb = V.canvas(Fm.box, { aspect: 4.2, max: 150, min: 90 }); cb.cv.setAttribute('role', 'img'); cb.cv.style.marginTop = '.5rem';
    var sl = V.slider(Fm.ctl, { label: 'rank k (terms kept)', min: 1, max: M.min(n, 30), step: 1, value: K, input: function (v) { K = M.round(v); draw(); } });
    V.button(Fm.ctl, '−', function () { K = M.max(1, K - 1); sl.set(K); draw(); }).setAttribute('aria-label', 'one fewer term');
    V.button(Fm.ctl, '+', function () { K = M.min(M.min(n, 30), K + 1); sl.set(K); draw(); }).setAttribute('aria-label', 'one more term');
    function approx(k) { var B = []; for (var r = 0; r < n; r++) { B.push(new Array(n).fill(0)); } for (var t = 0; t < k; t++) { var p = Sv[t]; for (r = 0; r < n; r++) { var ur = p.s * p.u[r]; if (!ur) continue; for (var cc = 0; cc < n; cc++) B[r][cc] += ur * p.v[cc]; } } return B; }
    function paint(ctx, B, x0, y0, sz, dark) {
      var px = sz / n; for (var r = 0; r < n; r++) for (var cc = 0; cc < n; cc++) { var v = M.max(0, M.min(1, B[r][cc])), g = dark ? M.round(30 + 200 * v) : M.round(255 * (1 - v)); ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')'; ctx.fillRect(x0 + cc * px, y0 + r * px, M.ceil(px), M.ceil(px)); }
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, dark = D.documentElement.getAttribute('data-theme') === 'dark', B = approx(K);
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var gap = 16, sz = M.min((c.w - 3 * gap) / 2, c.h - 40), x1 = (c.w - 2 * sz - gap) / 2, y1 = 28;
      paint(ctx, A, x1, y1, sz, dark); paint(ctx, B, x1 + sz + gap, y1, sz, dark);
      ctx.fillStyle = k.ink; ctx.font = '600 13px system-ui,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('original (' + n + ' × ' + n + ')', x1 + sz / 2, 16); ctx.fillText('rank ' + K + ' approximation', x1 + sz * 1.5 + gap, 16);
      // singular values
      var cx = cb.ctx, show = M.min(n, 30), bw = (cb.w - 50) / show, mx = Sv[0].s;
      cx.fillStyle = k.bg; cx.fillRect(0, 0, cb.w, cb.h);
      for (var i = 0; i < show; i++) { var h = (cb.h - 30) * Sv[i].s / mx; cx.fillStyle = i < K ? k.green : rgba(k.muted, 0.45); cx.fillRect(40 + i * bw + 1, cb.h - 18 - h, M.max(1, bw - 2), h); }
      cx.fillStyle = k.muted; cx.font = '12px system-ui,sans-serif'; cx.textAlign = 'left'; cx.fillText('σᵢ', 6, 16); cx.textAlign = 'center'; cx.fillText('1', 40 + bw / 2, cb.h - 4); cx.fillText(String(show), 40 + (show - 0.5) * bw, cb.h - 4);
      var kept = 0; for (i = 0; i < K; i++) kept += Sv[i].s * Sv[i].s;
      var err = M.sqrt(M.max(0, tot - kept) / tot), store = K * (2 * n + 1);
      c.cv.setAttribute('aria-label', 'A ' + n + ' by ' + n + ' picture and its rank ' + K + ' approximation.');
      cb.cv.setAttribute('aria-label', 'Bar chart of the first ' + show + ' singular values; the first ' + K + ' are kept.');
      Fm.out.set('Keeping k = <b>' + K + '</b> term' + (K > 1 ? 's' : '') + ' σᵢuᵢvᵢᵀ stores k(m + n + 1) = <b>' + store + '</b> numbers instead of ' + n + ' × ' + n + ' = ' + n * n + ' (' + M.round(100 * store / (n * n)) + '%). Relative error ‖A − A<sub>k</sub>‖<sub>F</sub> / ‖A‖<sub>F</sub> = <b>' + fm(100 * err, 1) + '%</b>. σ₁ = ' + fm(Sv[0].s, 2) + (K < n ? ', and the first value dropped is σ' + (K + 1 <= 9 ? SUB[K + 1] : '<sub>' + (K + 1) + '</sub>') + ' = ' + fm(Sv[K].s, 2) + '.' : '.'));
    }
    c.onResize(draw); cb.onResize(draw); V.onTheme(draw); draw();
    return { draw: draw };
  });
})(window, document);
