/* Math Ladder visuals for Numerical Analysis (course key num). Registered on window.MathLadder.viz; needs viz/core.js and
   the site's CAS (homeschool/calc/cas.js); looks best with viz/adv.css, which these course pages load. Styles are injected
   below. Every visual computes in real double precision on purpose: round-off is what several of them show.
   Shared options on all nine: task (an instruction line, HTML allowed), label (aria-label), height (canvas px),
   edit: false (a still picture: no handles, sliders or buttons), quiet: true (alias readout: false; hides the numbers a
   problem might ask for, as listed per visual). Keyboard: focus a picture, arrow keys move the selected handle, Enter or N
   picks the next handle; sliders and buttons work as usual. prefers-reduced-motion: no animation (Step buttons instead).

   num-float     A toy floating-point system, binary digits by doubling, the bits of a double, and cancellation.
     opts: mode: "toy" | "binary" | "double" | "cancel"   (default "toy")
           toy:    bits: 3 (fraction bits, 1-5), emin: -2, emax: 3, x: 2.7 (the number to round; a number box when edit)
                   The top strip shows every positive float (bands mark each [2^e, 2^(e+1))); the bottom strip zooms in on x.
                   quiet hides the nearest float, the error and the bound.
           binary: x: "0.1" (a decimal string), rows: 10 (doubling steps shown at first; a button adds more), given: 0
                   quiet shows only the first `given` digits and rows.
           double: x: "0.1" (any decimal), sum: false (true starts on the 0.1 + 0.2 demo). Shows sign, exponent and fraction
                   bits, the exact decimal value stored, and the gap to the next double. quiet hides the stored value and gap.
           cancel: a: "sqrt(1001)", b: "sqrt(1000)" (CAS strings, evaluated in double precision), digits: 6 (each rounded to
                   this many significant digits). Correct digits green, wrong ones orange. quiet hides the digit counts.
   num-error     Error against step size on log-log axes, with reference slopes and the fitted slope.
     opts: method: "forward" | "central" | "second" | "trap" | "simpson" | "euler" | "heun" | "rk4" | "ab2" | "ab3"
                   (default "central"; ab2 and ab3 are Adams–Bashforth methods started with RK4 steps)
           methods: ["forward", "central"]   offer a choice of methods (buttons); default: just `method`
           f: "sin(x)", x0: 1 (difference methods), interval: [0, 1] (trap, simpson)
           ode: { f: "-2y", y0: 1, T: 1 }   (euler, heun, rk4; f may use t and y)
           hmin: 1e-12, hmax: 1 (difference methods; quadrature and ODEs use h = length / 2^k)
           refs: [1, 2, 4]   dashed reference lines with these slopes
           richardson: false   start with the extrapolated values shown (a checkbox for forward, central and trap; for trap
                               it adds the first two Romberg columns)
           start: "rk4" | "euler"   how ab2 and ab3 get their starting values (a checkbox)
           local: false        ODE methods: start with the one-step (local) error instead of the global error
           blind: false        hide the method's name (for "which method is this?" problems)
           quiet hides the fitted slope, the best h and its error.
   num-roots     Root finders on a graph, with an iteration table.
     opts: f: "x^3-2x+2", g: "cos(x)" (fixed-point), method: "bisection" | "newton" | "secant" | "fixed-point" (default "newton")
           methods: [...]   offer a choice; x0: 1, x1: 2 (secant), a: 1, b: 2 (bisection), steps: 4 (shown at first; Step adds)
           root: null       the true root, for the error columns (CAS string allowed; found automatically when omitted)
           table: true, window: [xmin, xmax, ymin, ymax], presets: false (buttons for four failure cases), given: 0
           quiet shows only the first `given` table rows and hides the converged root.
   num-system    Linear systems: a 2-by-2 system as two lines, iterations, pivoting, costs, LU solves, norms, least squares, a BVP.
     opts: A: [[1, 1], [1, 1.0001]], b: [2, 2.0001], mode: "perturb" | "iterate" | "pivot" | "cost" | "lu" | "norms" | "lsq" | "bvp"
           perturb: sliders nudge b by up to ±pct percent (pct: 1); a draggable candidate x̃ compares residual and error.
                    norm: "inf" | "2" (for the readout). quiet hides κ, the relative changes and the coordinates.
           iterate: method: "jacobi" | "gauss-seidel", x0: [0, 0], steps: 8, swap: false (list the equations the other way)
                    quiet hides the spectral radius and the coordinates.
           pivot:   eps: 1e-4 (the tiny pivot), b: [1, 2], digits: 3 (k-digit decimal arithmetic). quiet hides the results.
   num-interp    Interpolation and splines.
     opts: f: "1/(1+25x^2)" or points: [[x, y], …], n: 7 (nodes, 2 to 21), nodes: "equal" | "chebyshev",
           interval: [-1, 1], show: ["p", "error", "omega"], mode: "poly" | "basis" | "table" | "spline" (default "poly")
           basis: 1 (which L_k to light up in "basis" mode)
           quiet hides the maximum error, table values and the jumps.
           cost:    n: 1000, k: 1 (right-hand sides), rate: 1e9 (operations per second). Bars compare LU once + triangular
                    solves, forming A⁻¹, and eliminating again for every b. quiet hides the counts and times.
           lu:      A: [[2, 1, -1], [-6, 3, 2], [4, -2, 5]] (2 to 4 rows), b: [3, 2, 5], forget: false (start with the mistake of
                    not applying P to b). Shows P, L, U, Pb, y, x and the check Ax = b. quiet hides x and the check.
           norms:   A: [[1, -2], [3, 4]] (2 by 2), p: "inf" | "1" | "2", x: [0.6, 0.4] (a draggable vector). Unit ball, its
                    image under A, the ball of radius ‖A‖, and the absolute row and column sums. quiet hides ‖A‖ and the stretch.
           lsq:     degree: 6 (1 to 14), m: 30 (points on [0, 1]). Polynomial least squares in double precision by Householder
                    QR and by the normal equations, with κ(A)·ε and κ(A)²·ε. quiet hides κ and the errors.
           bvp:     y'' − q·y = f(x) on [a, b] with y(a) = ya, y(b) = yb: f: "0", q: 0, a: 0, b: 1, ya: 0, yb: 1, N: 4 (intervals,
                    2 to 40), exact: null (a CAS string; otherwise a very fine grid is the reference), forget: false (leave the
                    boundary values off the right side). Shows the tridiagonal system for N ≤ 6. quiet hides the errors.
   num-stability Step size and stability for y' = λy, a stiff equation, and the explicit heat scheme.
     opts: mode: "ode" | "stiff" | "heat" (default "ode")
           ode:   lambda: -10 (or [re, im]), h: 0.15, T: 2, methods: ["euler", "backward"] (also "heun", "rk4"), region: true
           stiff: y' = -50(y - cos t), y(0) = 0; h: 0.03, T: 1.5
           heat:  r: 0.4, N: 20 (inside points), init: "bump" | "sine" | "step", steps: 0
           quiet hides the amplification factors, the stable or unstable verdict and the step-size limit.
   num-eigen     Eigenvalue methods.
     opts: mode: "power" | "gershgorin" | "qr" (default "power")
           power:      A: [[2, 1], [1, 2]] (2 by 2), x0: [1, 0] (draggable), steps: 0, presets: false (buttons: ratio 1/3, ratio
                       0.9, λ = 2 and −2, complex λ), inverse: false (shifted inverse iteration), shift: 0 (a slider when inverse).
                       Iterates are scaled so the entry of largest size is 1. quiet hides μ, the eigenvalues and the angle.
           gershgorin: A: [[10, 1, -1], [1, 0, 2], [0, 1, -6]] (2 to 4 rows, editable), cols: false (column disks too),
                       presets: false (separate, overlapping, complex pair). quiet hides the eigenvalue dots and counts.
           qr:         A: [[4, 1, 1], [1, 3, 1], [1, 1, 2]] (2 to 4 rows), steps: 0, wrong: false (multiply as QₖRₖ). Steps the unshifted
                       QR algorithm; plots the entries below the diagonal on a log scale. quiet hides the eigenvalues and rates.
   num-measure   Absolute and relative error of one or two approximations, side by side.
     opts: pairs: [[5, 4.99], [384400, 384000]] ([true, approximate] each), labels: ["length of a room (m)", "distance to the Moon (km)"],
           units: true (a checkbox multiplies both values by 1000). quiet hides the errors and the verdict.
   num-horner    Horner's method as a synthetic-division table, step by step.
     opts: coef: [2, -6, 2, -1] (leading coefficient first; write 0 for missing powers), x: 3, steps: 0 (columns shown at
           first), mistake: "none" | "skip" | "reverse" (skip the zero coefficients, or nest from a₀). quiet hides p(x).  */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/num.js: load viz/core.js first'); return; }
  var M = Math, mk = V.el, PI = M.PI;

  (function css() {
    if (D.getElementById('num-viz-css')) return;
    var s = D.createElement('style'); s.id = 'num-viz-css';
    s.textContent = [
      '.nv .nv-row{display:flex;flex-wrap:wrap;gap:.45rem .8rem;align-items:center;margin:.55rem 0 0}',
      '.nv .nv-two{display:grid;grid-template-columns:3fr 2fr;gap:.6rem;align-items:start}',
      '@media (max-width:640px){.nv .nv-two{grid-template-columns:1fr}}',
      '.nv .nv-lab{font-size:.8rem;color:var(--mv-muted);margin:.35rem 0 .15rem}',
      '.nv .nv-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}',
      '.nv .nv-bits{display:flex;flex-wrap:wrap;gap:2px;margin:.4rem 0;font:600 .82rem ui-monospace,Menlo,Consolas,monospace}',
      '.nv .nv-bits span{display:inline-block;min-width:1.05em;text-align:center;padding:.12rem 0;border-radius:3px}',
      '.nv .nv-bits .s{background:rgba(214,51,108,.18)}.nv .nv-bits .e{background:rgba(28,111,214,.16)}.nv .nv-bits .f{background:rgba(0,112,60,.14)}',
      'html[data-theme="dark"] .nv .nv-bits .s{background:rgba(255,135,135,.25)}html[data-theme="dark"] .nv .nv-bits .e{background:rgba(116,192,252,.22)}html[data-theme="dark"] .nv .nv-bits .f{background:rgba(108,199,154,.2)}',
      '.nv .nv-big{font:600 1rem ui-monospace,Menlo,Consolas,monospace;overflow-wrap:anywhere;line-height:1.5}',
      '.nv .nv-ok{color:#00703c}.nv .nv-bad{color:#c2410c}.nv .nv-dim{color:var(--mv-muted)}',
      'html[data-theme="dark"] .nv .nv-ok{color:#6cc79a}html[data-theme="dark"] .nv .nv-bad{color:#ffa94d}',
      '.nv .nv-ov{text-decoration:overline;text-decoration-thickness:2px}',
      '.nv .nv-in{min-height:36px;box-sizing:border-box;width:8.5rem;padding:.25rem .45rem;border:1px solid var(--mv-line);border-radius:8px;background:var(--mv-card);color:var(--mv-ink);font:600 .95rem ui-monospace,Menlo,Consolas,monospace}',
      '.nv .nv-in:focus-visible{outline:3px solid #b8963e;outline-offset:1px}',
      '.nv .nv-in.bad{border-color:#d6336c}',
      '.nv .nv-card{background:var(--mv-card);border:1px solid var(--mv-line);border-radius:10px;padding:.5rem .65rem;margin:.45rem 0 0;font-size:.9rem;line-height:1.5}',
      '.nv .nv-grid2{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}',
      '@media (max-width:520px){.nv .nv-grid2{grid-template-columns:1fr}}',
      '.nv .mla-tbl td.nv-l,.nv .mla-tbl th.nv-l{text-align:left}',
      '.nv .mla-tbl td.cur{outline:2px solid #b8963e;outline-offset:-2px}',
      '.nv .mla-tbl td.span{background:rgba(28,111,214,.12)}',
      'html[data-theme="dark"] .nv .mla-tbl td.span{background:rgba(116,192,252,.18)}',
      '.nv .nv-key{display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-size:.82rem;color:var(--mv-muted);margin:.35rem 0 0}',
      '.nv .nv-key i{display:inline-block;width:1.1em;height:.25em;border-radius:2px;vertical-align:.25em;margin-right:.35em;background:var(--c)}',
      '.nv .nv-key i.d{background:none;border-top:2px dashed var(--c);height:0}',
      '.nv .nv-key i.p{width:.6em;height:.6em;border-radius:50%;vertical-align:0}',
      '.nv .nv-scroll{overflow-x:auto;max-width:100%}',
      '.nv .nv-mat{display:inline-grid;gap:4px;padding:4px 6px;border-left:2px solid var(--mv-ink);border-right:2px solid var(--mv-ink);border-radius:7px;vertical-align:middle}',
      '.nv .nv-mat .nv-in{width:4.3rem;min-height:32px;text-align:center;padding:.15rem .25rem;font-size:.88rem}',
      '.nv .nv-mlab{display:inline-flex;align-items:center;gap:.4rem;margin:.3rem .6rem .3rem 0;font:italic 600 1rem Georgia,serif}',
      '.nv table.nv-mtx{display:inline-table;width:auto;border-collapse:separate;border-spacing:0;border-left:2px solid var(--mv-ink);border-right:2px solid var(--mv-ink);border-radius:7px;margin:.2rem .25rem;vertical-align:middle}',
      '.nv table.nv-mtx td{padding:.12rem .42rem;text-align:right;border:0;font:500 .86rem ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.nv table.nv-mtx td.dg{font-weight:800}.nv table.nv-mtx td.lo{color:#c2410c}.nv table.nv-mtx td.z{color:var(--mv-muted)}.nv table.nv-mtx td.hl{background:rgba(184,150,62,.22);border-radius:4px}',
      'html[data-theme="dark"] .nv table.nv-mtx td.lo{color:#ffa94d}',
      '.nv .nv-eq{display:flex;flex-wrap:wrap;align-items:center;gap:.2rem .35rem;margin:.35rem 0;font:italic 600 1rem Georgia,serif}',
      '.nv .nv-mg{display:inline-flex;align-items:center;gap:.25rem;white-space:nowrap}',
      '.nv .nv-bar{height:14px;border-radius:4px;background:var(--c);min-width:2px}',
      '.nv .nv-cl{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:.1rem .8rem;font-size:.9rem;margin:.65rem 0 .25rem}',
      '.nv .nv-track{background:var(--mv-paper,rgba(127,127,127,.12));border:1px solid var(--mv-line);border-radius:6px;padding:2px}',
      '.nv .nv-track .nv-bar{height:16px}'
    ].join('\n');
    D.head.appendChild(s);
  })();

  // ---------------------------------------------------------------- shared helpers
  var SUPS = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function sup(n) { return String(n).split('').map(function (c) { return SUPS[c] || c; }).join(''); }
  function minus(s) { return String(s).replace(/-/g, '−'); }
  function fs(v, sig) { // a number with sig significant digits; scientific notation when tiny or huge
    if (!isFinite(v)) return v > 0 ? '∞' : v < 0 ? '−∞' : '—';
    if (v === 0) return '0'; sig = sig || 4;
    var a = M.abs(v);
    if (a >= 1e-4 && a < 1e7) { var s = (+v.toPrecision(sig)).toString(); if (/e/.test(s)) s = v.toFixed(8); return minus(s); }
    var e = M.floor(M.log10(a)), m = v / M.pow(10, e); m = +m.toPrecision(sig); if (M.abs(m) >= 10) { m /= 10; e++; }
    return minus((m === 1 ? '' : m === -1 ? '-' : m + ' × ') + '10' + sup(e));
  }
  function pf(s) { return esc(String(s).replace(/\*/g, '·').replace(/\^2(?![\d.])/g, '²').replace(/\^3(?![\d.])/g, '³').replace(/sqrt\(/g, '√(').replace(/-/g, '−')); } // CAS text, a little prettier
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function cfun(src, vars) {
    var C = W.CAS; if (!C) throw new Error('viz/num.js needs the CAS');
    var g = C.compile(C.parse(String(src)), vars);
    return function () { try { var r = g.apply(null, arguments); return typeof r === 'number' ? r : NaN; } catch (e) { return NaN; } };
  }
  function dfun(src, v, vars) { var C = W.CAS, t = C.parse(String(src)); t = C.deriv(t, v); var g = C.compile(t, vars); return function () { try { return +g.apply(null, arguments); } catch (e) { return NaN; } }; }
  function nval(v, d) { if (typeof v === 'number') return isFinite(v) ? v : d; if (v == null || v === '') return d; var x = +v; if (!isNaN(x)) return x; try { return cfun(String(v), [])(); } catch (e) { return d; } }
  function frame(el, o, label) {
    el.classList.add('mla', 'nv'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = { quiet: !!(o.quiet || o.readout === false), edit: o.edit !== false };
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    F.row = function () { var r = mk('div', 'nv-row'); el.insertBefore(r, F.out.el); return r; };
    F.after = function (node) { el.insertBefore(node, F.out.el); return node; };
    F.done = function (ok) { if (F.task) F.task.classList.toggle('ok', !!ok); };
    F.canvas = function (parent, q) { q = q || {}; var c = V.canvas(parent || F.box, { aspect: q.aspect || 1.7, min: q.height ? 0 : q.min || 200, max: q.max || 440, height: q.height || o.height }); return c; };
    return F;
  }
  function numBox(parent, label, value, onChange, opts) {
    opts = opts || {};
    var l = mk('label', 'mla-num'), sp = mk('span', '', label), i = D.createElement('input');
    i.type = 'text'; i.className = 'nv-in'; i.value = value; i.inputMode = opts.mode || 'decimal'; i.spellcheck = false; i.autocomplete = 'off';
    if (opts.width) i.style.width = opts.width;
    i.setAttribute('aria-label', opts.aria || label.replace(/<[^>]+>/g, ''));
    l.appendChild(sp); l.appendChild(i); parent.appendChild(l);
    i.addEventListener('input', function () { var ok = onChange(i.value); i.classList.toggle('bad', ok === false); });
    return i;
  }
  function check(parent, text, on, fn) { var l = mk('label', 'mla-chk'), i = D.createElement('input'); i.type = 'checkbox'; i.checked = !!on; l.appendChild(i); l.appendChild(D.createTextNode(' ' + text)); i.addEventListener('change', function () { fn(i.checked); }); parent.appendChild(l); return i; }
  function txt(ctx, s, x, y, o) { o = o || {}; var k = V.colors(); ctx.save(); ctx.font = (o.bold ? '700 ' : '600 ') + (o.size || 12) + 'px system-ui,sans-serif'; ctx.fillStyle = o.color || k.muted; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }
  function pill(ctx, s, x, y, col, o) {
    o = o || {}; var k = V.colors(); ctx.save(); ctx.font = '700 ' + (o.size || 12) + 'px system-ui,sans-serif';
    var w = ctx.measureText(s).width, h = (o.size || 12) + 6, bx = clamp(x - (o.align === 'left' ? 0 : o.align === 'right' ? w + 10 : w / 2 + 5), 2, (o.W || 1e5) - w - 12), by = y - h / 2;
    ctx.fillStyle = k.bg; ctx.globalAlpha = 0.86; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, w + 10, h, 6); else ctx.rect(bx, by, w + 10, h); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
  }
  function tableHTML(head, rows, cls) {
    return '<div class="mla-tbl" tabindex="0" role="region" aria-label="Table"><table><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr' + (r.cls ? ' class="' + r.cls + '"' : '') + '>' + r.cells.map(function (c, i) { return '<td' + (cls && cls[i] ? ' class="' + cls[i] + '"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function redrawOn(c, fn) { c.onResize(fn); V.onTheme(fn); }
  // a keyboard- and pointer-draggable set of handles on a V.plane
  function handles(c, P, list, change) {
    var cur = 0, focus = false;
    V.drag(c.cv, {
      hit: function (px, py) { var best = null, bd = 26; list.forEach(function (h, i) { if (h.off && h.off()) return; var p = h.get(); var d = M.hypot(P.X(p[0]) - px, P.Y(p[1]) - py); if (d < bd) { bd = d; best = i; } }); return best; },
      start: function (i) { cur = i; },
      move: function (i, px, py) { var v = P.view(); list[i].set(clamp(P.x(px), v.xmin, v.xmax), clamp(P.y(py), v.ymin, v.ymax)); change(); }
    });
    c.cv.tabIndex = 0;
    c.cv.addEventListener('focus', function () { focus = true; change(); });
    c.cv.addEventListener('blur', function () { focus = false; change(); });
    c.cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (d && list.length) { var h = list[cur], p = h.get(), v = P.view(), st = (h.step || (v.xmax - v.xmin) / 80) * (e.shiftKey ? 5 : 1); h.set(p[0] + d[0] * st, p[1] + d[1] * (h.stepY || st)); change(); e.preventDefault(); }
      else if ((e.key === 'Enter' || e.key === 'n' || e.key === 'N') && list.length > 1) { cur = (cur + 1) % list.length; change(); e.preventDefault(); }
    });
    return { ring: function (ctx) { if (!focus || !list.length) return; var p = list[cur].get(), k = V.colors(); ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), 13, 0, 2 * PI); ctx.stroke(); ctx.restore(); } };
  }
  function knob(ctx, x, y, col) { var k = V.colors(); ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 7, 0, 2 * PI); ctx.fill(); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 3, 0, 2 * PI); ctx.fill(); ctx.restore(); }
  // an editable grid of matrix entries; onChange(A) gets the parsed matrix (or null while an entry is not a number)
  function matGrid(parent, A, onChange, label) {
    var n = A.length, m = A[0].length, wrap = mk('div', 'nv-mlab'), g = mk('div', 'nv-mat'), ins = [];
    g.style.gridTemplateColumns = 'repeat(' + m + ', auto)'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Entries of ' + (label || 'A'));
    if (label) wrap.appendChild(mk('span', '', label + ' ='));
    A.forEach(function (row, i) { row.forEach(function (v, j) { var inp = D.createElement('input'); inp.type = 'text'; inp.className = 'nv-in'; inp.inputMode = 'decimal'; inp.spellcheck = false; inp.autocomplete = 'off'; inp.value = String(+(+v).toPrecision(6)); inp.setAttribute('aria-label', (label || 'A') + ' row ' + (i + 1) + ' column ' + (j + 1)); inp.addEventListener('input', read); g.appendChild(inp); ins.push(inp); }); });
    function read() { var out = [], bad = false; for (var i = 0; i < n; i++) { out.push([]); for (var j = 0; j < m; j++) { var inp = ins[i * m + j], v = nval(inp.value.trim(), NaN); inp.classList.toggle('bad', !isFinite(v)); if (!isFinite(v)) bad = true; out[i].push(v); } } if (!bad) onChange(out); }
    wrap.appendChild(g); parent.appendChild(wrap);
    return { el: wrap, set: function (B) { B.forEach(function (row, i) { row.forEach(function (v, j) { if (ins[i * m + j]) { ins[i * m + j].value = String(+(+v).toPrecision(6)); ins[i * m + j].classList.remove('bad'); } }); }); } };
  }
  // a matrix as an HTML table with bracket borders; cls(i, j, v) may return a class for a cell
  function mtxHTML(A, fmt, cls, label) {
    return '<table class="nv-mtx"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '><tbody>' + A.map(function (row, i) { return '<tr>' + row.map(function (v, j) { var c = cls ? cls(i, j, v) : ''; return '<td' + (c ? ' class="' + c + '"' : '') + '>' + (fmt ? fmt(v, i, j) : fs(v, 4)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  function mgrp(label, html) { return '<span class="nv-mg"><span>' + label + '</span>' + html + '</span>'; }
  function mmulN(A, B) { return A.map(function (r) { return B[0].map(function (_, j) { var s = 0; for (var k = 0; k < r.length; k++) s += r[k] * B[k][j]; return s; }); }); }
  function mvN(A, x) { return A.map(function (r) { var s = 0; for (var k = 0; k < r.length; k++) s += r[k] * x[k]; return s; }); }
  function eyeN(n) { var I = []; for (var i = 0; i < n; i++) { I.push([]); for (var j = 0; j < n; j++) I[i].push(i === j ? 1 : 0); } return I; }
  function keyHTML(items) { return '<div class="nv-key" aria-hidden="true">' + items.map(function (it) { return '<span><i class="' + (it[2] || '') + '" style="--c:' + it[0] + '"></i>' + it[1] + '</span>'; }).join('') + '</div>'; }

  // ================================================================ num-float
  function bigDec(s) { // "0.1" -> [n, d] BigInts, or "3/7"; null if unreadable
    s = String(s).trim().replace(/−/g, '-');
    var m = /^(-?)(\d+)\/(\d+)$/.exec(s); if (m) { var dd = BigInt(m[3]); if (dd === 0n) return null; return [BigInt(m[2]) * (m[1] ? -1n : 1n), dd]; }
    m = /^(-?)(\d*)(?:\.(\d*))?(?:e([-+]?\d+))?$/i.exec(s); if (!m || !(m[2] || m[3])) return null;
    var f = m[3] || '', n = BigInt((m[2] || '0') + f), d = 10n ** BigInt(f.length), ex = parseInt(m[4] || '0', 10);
    if (ex > 0) n *= 10n ** BigInt(ex); else if (ex < 0) d *= 10n ** BigInt(-ex);
    return [m[1] ? -n : n, d];
  }
  function bgcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { var t = a % b; a = b; b = t; } return a; }
  function fracStr(n, d) { // exact decimal string of n/d when d divides a power of 10, else "n/d"
    var g = bgcd(n, d); n /= g; d /= g; var t = d, k = 0; while (t % 2n === 0n) { t /= 2n; k++; } var j = 0; while (t % 5n === 0n) { t /= 5n; j++; }
    if (t !== 1n) return n + '/' + d;
    var p = M.max(k, j), N = n * (10n ** BigInt(p)) / d, neg = N < 0n; if (neg) N = -N; var s = N.toString(); while (s.length <= p) s = '0' + s;
    var out = p ? s.slice(0, s.length - p) + '.' + s.slice(s.length - p) : s; return (neg ? '-' : '') + out;
  }
  function doubleParts(x) { var dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x); var hi = dv.getUint32(0), lo = dv.getUint32(4); var bits = (hi >>> 0).toString(2).padStart(32, '0') + (lo >>> 0).toString(2).padStart(32, '0'); return { bits: bits, sign: +bits[0], exp: parseInt(bits.slice(1, 12), 2), frac: bits.slice(12) }; }
  function doubleExact(x) { // exact [n, d] of a finite double
    var p = doubleParts(x), mant = BigInt('0b' + p.frac), e;
    if (p.exp === 0) { e = -1074; } else { mant += 1n << 52n; e = p.exp - 1075; }
    var n = p.sign ? -mant : mant; return e >= 0 ? [n << BigInt(e), 1n] : [n, 1n << BigInt(-e)];
  }
  function nextUp(x) { var dv = new DataView(new ArrayBuffer(8)); dv.setFloat64(0, x); dv.setBigUint64(0, dv.getBigUint64(0) + (x >= 0 ? 1n : -1n)); return dv.getFloat64(0); }
  function sigDigits(s) { return s.replace(/^-/, '').replace('.', '').replace(/^0+/, ''); }

  V.register('num-float', function (el, o) {
    o = Object.assign({ mode: 'toy', bits: 3, emin: -2, emax: 3, x: null, rows: 10, given: 0, sum: false, a: 'sqrt(1001)', b: 'sqrt(1000)', digits: 6 }, o || {});
    var mode = o.mode, F = frame(el, o, { toy: 'A toy floating-point number line', binary: 'Binary digits by repeated doubling', double: 'The bits of a double-precision number', cancel: 'Cancellation when subtracting close numbers' }[mode] || 'Floating-point numbers'), k = V.colors;

    if (mode === 'toy') {
      var S = { p: clamp(M.round(o.bits), 1, 5), x: nval(o.x, 2.7) }, emin = o.emin, emax = o.emax;
      var top = F.canvas(F.box, { height: 96 }), bot = F.canvas(F.box, { height: 128 });
      top.cv.setAttribute('aria-hidden', 'true'); bot.cv.setAttribute('aria-hidden', 'true'); bot.cv.style.marginTop = '6px';
      function floats() { var out = []; for (var e = emin; e <= emax; e++) for (var m = 0; m < M.pow(2, S.p); m++) out.push((1 + m / M.pow(2, S.p)) * M.pow(2, e)); return out; }
      function nearest(x, fl) { var best = fl[0]; fl.forEach(function (f) { if (M.abs(f - x) < M.abs(best - x) - 1e-15) best = f; }); return best; }
      if (F.edit) {
        numBox(F.ctl, '<i>x</i> =', String(S.x), function (v) { var y = +v; if (!isFinite(y) || y <= 0) return false; S.x = y; draw(); return true; }, { aria: 'number to round' });
        V.slider(F.ctl, { label: 'fraction bits', min: 1, max: 5, step: 1, value: S.p, fmt: function (v) { return String(v); }, input: function (v) { S.p = v; draw(); } });
      }
      var draw = function () {
        var fl = floats(), xmax = fl[fl.length - 1], x = clamp(S.x, M.pow(2, emin), xmax), c = top, ctx = c.ctx, K = k();
        // top strip: every float
        var pad = 14, X = function (v) { return pad + (c.w - 2 * pad) * v / (xmax * 1.02); }, y0 = 54;
        ctx.save(); ctx.fillStyle = K.bg; ctx.fillRect(0, 0, c.w, c.h);
        for (var e = emin; e <= emax; e++) { ctx.fillStyle = (e - emin) % 2 ? K.blueSoft : K.greenSoft; ctx.fillRect(X(M.pow(2, e)), y0 - 18, X(M.pow(2, e + 1) > xmax ? xmax : M.pow(2, e + 1)) - X(M.pow(2, e)), 22); }
        ctx.strokeStyle = K.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pad, y0); ctx.lineTo(c.w - pad, y0); ctx.stroke();
        ctx.strokeStyle = K.ink; ctx.lineWidth = 1; ctx.beginPath(); fl.forEach(function (f) { ctx.moveTo(X(f) + 0.5, y0 - 12); ctx.lineTo(X(f) + 0.5, y0 + 2); }); ctx.stroke();
        txt(ctx, '0', X(0), y0 + 14, { align: 'center' });
        for (e = M.max(emin, 0); e <= emax + 1; e++) { var v = M.pow(2, e); if (v <= xmax * 1.02) txt(ctx, String(v), X(v), y0 + 14, { align: 'center' }); }
        ctx.fillStyle = K.red; ctx.beginPath(); ctx.moveTo(X(x), y0 - 20); ctx.lineTo(X(x) - 6, y0 - 30); ctx.lineTo(X(x) + 6, y0 - 30); ctx.closePath(); ctx.fill();
        txt(ctx, 'every float with ' + S.p + ' fraction bit' + (S.p > 1 ? 's' : '') + ', exponents ' + minus(emin) + ' to ' + emax, pad, 10, { size: 11 });
        ctx.restore();
        // bottom strip: zoom on x
        c = bot; ctx = c.ctx;
        var ex = M.floor(M.log2(x)), g = M.pow(2, ex - S.p), lo = x - 4.5 * g, hi = x + 4.5 * g, Z = function (v) { return pad + (c.w - 2 * pad) * (v - lo) / (hi - lo); }, yb = 66, fx = nearest(x, fl);
        ctx.save(); ctx.fillStyle = K.bg; ctx.fillRect(0, 0, c.w, c.h);
        ctx.strokeStyle = K.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(pad, yb); ctx.lineTo(c.w - pad, yb); ctx.stroke();
        var shown = fl.filter(function (f) { return f >= lo && f <= hi; }), lastLab = -1e9;
        shown.forEach(function (f) { var px = Z(f); ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, yb - 14); ctx.lineTo(px, yb + 4); ctx.stroke(); if (px - lastLab > 46) { txt(ctx, minus(+f.toPrecision(6)), px, yb + 17, { align: 'center', size: 11 }); lastLab = px; } });
        ctx.fillStyle = K.red; ctx.beginPath(); ctx.arc(Z(x), yb, 5, 0, 2 * PI); ctx.fill();
        pill(ctx, 'x = ' + minus(+x.toPrecision(6)), Z(x), 18, K.red, { W: c.w });
        if (!F.quiet) {
          ctx.strokeStyle = K.green; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(Z(fx), yb - 18); ctx.lineTo(Z(fx), yb + 6); ctx.stroke();
          ctx.strokeStyle = K.orange; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(Z(x), yb - 26); ctx.lineTo(Z(fx), yb - 26); ctx.stroke();
          pill(ctx, 'fl(x) = ' + minus(+fx.toPrecision(6)), Z(fx), yb + 40, K.green, { W: c.w });
        }
        txt(ctx, 'zoomed in: gap ' + minus(+g.toPrecision(6)) + ' here', pad, c.h - 8, { size: 11 });
        ctx.restore();
        var eps = M.pow(2, -S.p), err = M.abs(fx - x);
        F.out.set('<i>x</i> = ' + minus(+x.toPrecision(8)) + ' lies in [' + M.pow(2, ex) + ', ' + M.pow(2, ex + 1) + '), where floats are ' + minus(+g.toPrecision(6)) + ' apart; each step up in range doubles the gap.' +
          (F.quiet ? '' : ' Nearest float: <b>' + minus(+fx.toPrecision(8)) + '</b>. Error ' + fs(err) + ', relative error ' + fs(err / x) + ' ≤ ε/2 = ' + fs(eps / 2) + '.'));
      };
      redrawOn(top, draw); redrawOn(bot, draw); draw();
      return { update: function (q) { Object.assign(o, q); draw(); } };
    }

    if (mode === 'binary') {
      var B = { x: o.x == null ? '0.1' : String(o.x), rows: F.quiet ? (o.given || 0) : o.rows };
      var view = mk('div', ''); F.box.appendChild(view);
      if (F.edit && !F.quiet) {
        numBox(F.ctl, 'decimal', B.x, function (v) { var r = bigDec(v); if (!r || r[0] < 0n || r[0] >= r[1] * 1000n) return false; B.x = v; B.rows = o.rows; render(); return true; }, { aria: 'decimal number to convert' });
        V.button(F.ctl, 'Next step', function () { B.rows++; render(); });
        V.button(F.ctl, 'Show 8 more', function () { B.rows += 8; render(); });
      }
      var render = function () {
        var r = bigDec(B.x); if (!r) return; var n = r[0], d = r[1], g0 = bgcd(n, d); n /= g0; d /= g0;
        var w = n / d, rem = n - w * d, seen = {}, rows = [], bits = '', start = -1, ends = false, per = 0;
        for (var i = 0; i < 200; i++) {
          if (rem === 0n) { ends = true; break; }
          var key = rem.toString(); if (start < 0 && key in seen) { start = seen[key]; per = i - start; } if (start < 0) seen[key] = i;
          if (start >= 0 && i >= M.max(B.rows, start + per)) break;
          var dbl = rem * 2n, b = dbl >= d ? 1 : 0, nr = dbl - BigInt(b) * d;
          rows.push([fracStr(rem, d), fracStr(dbl, d), b, fracStr(nr, d)]); if (start < 0) bits += b; rem = nr;
        }
        var shownRows = M.min(B.rows, rows.length), digits;
        if (F.quiet) digits = bits.slice(0, o.given || 0) + (o.given ? '…' : '');
        else if (ends) digits = bits;
        else digits = bits.slice(0, start) + '<span class="nv-ov">' + bits.slice(start) + '</span>…';
        var head = ['step', 'fraction', '× 2', 'digit', 'keep'];
        var tbl = tableHTML(head, rows.slice(0, shownRows).map(function (rw, i) { return { cells: [i + 1, rw[0], rw[1], '<b>' + rw[2] + '</b>', rw[3]], cls: !ends && start >= 0 && (i === start || i === start + per) ? 'hi' : '' }; }), ['', 'nv-mono', 'nv-mono', '', 'nv-mono']);
        view.innerHTML = '<p class="nv-big">' + esc(B.x) + ' = ' + w.toString(2) + '.' + digits + '<sub>2</sub></p>' + (shownRows ? tbl : '');
        var dd = d, twos = 0; while (dd % 2n === 0n) { dd /= 2n; twos++; }
        F.out.set(F.quiet ? 'Double the fraction part; the whole-number part of each result is the next binary digit.' : ends ? 'In lowest terms the denominator is ' + d + ' = 2' + sup(twos) + ', a power of 2, so the doubling reaches 0 and the binary form <b>ends</b> after ' + bits.length + ' digit' + (bits.length === 1 ? '' : 's') + '.' :
          'The denominator ' + d + ' has the factor ' + dd + ', which is not a power of 2, so the doubling never reaches 0. A fraction comes back (highlighted row), and from then on the digits <b>repeat</b>: block ' + bits.slice(start) + ' (' + (bits.length - start) + ' digits).');
      };
      render();
      return { update: function (q) { Object.assign(o, q); render(); } };
    }

    if (mode === 'double') {
      var Dd = { x: o.x == null ? '0.1' : String(o.x), sum: !!o.sum }, view2 = mk('div', ''); F.box.appendChild(view2);
      if (F.edit) {
        var inp = numBox(F.ctl, 'number', Dd.x, function (v) { var t = +v; if (!isFinite(t) || !bigDec(v)) return false; Dd.x = v; Dd.sum = false; render2(); return true; }, { aria: 'number to store as a double', width: '10rem' });
        V.button(F.ctl, '0.1 + 0.2', function () { Dd.sum = true; render2(); });
      }
      var render2 = function () {
        var x = +Dd.x, p = doubleParts(x), ex = doubleExact(x), stored = fracStr(ex[0], ex[1]), ebits = p.exp - 1023;
        var bitsHTML = '<div class="nv-bits" aria-label="64 bits: sign, exponent, fraction">' + p.bits.split('').map(function (b, i) { return '<span class="' + (i === 0 ? 's' : i < 12 ? 'e' : 'f') + '">' + b + '</span>'; }).join('') + '</div>';
        var key = keyHTML([['rgba(214,51,108,.6)', 'sign'], ['rgba(28,111,214,.6)', '11 exponent bits'], ['rgba(0,112,60,.6)', '52 fraction bits']]);
        var html = '<p class="nv-lab">The 64 bits of ' + esc(Dd.x) + '</p>' + bitsHTML + key;
        if (!F.quiet) {
          var dec = bigDec(Dd.x), gap = nextUp(M.abs(x)) - M.abs(x), errN = ex[0] * dec[1] - dec[0] * ex[1], errD = ex[1] * dec[1];
          html += '<div class="nv-card">Value: (−1)' + sup(p.sign) + ' × 1.' + p.frac.replace(/0+$/, '').slice(0, 20) + (p.frac.replace(/0+$/, '').length > 20 ? '…' : '') + '<sub>2</sub> × 2' + sup(ebits) + '<br>Stored exactly: <span class="nv-big">' + stored + '</span><br>' +
            (errN === 0n ? '<span class="nv-ok">Stored with no rounding error.</span>' : 'Rounding error: about ' + fs(Number(errN) / Number(errD)) + ' (relative ' + fs(M.abs(Number(errN) / Number(errD) / x)) + ', at most 2' + sup(-53) + ' ≈ 1.1 × 10' + sup(-16) + ').') + '<br>Gap to the next double: 2' + sup(M.round(M.log2(gap))) + ' ≈ ' + fs(gap) + '.</div>';
        }
        if (Dd.sum) {
          var a = 0.1, b = 0.2, s = a + b, t = 0.3, fe = function (v) { var e2 = doubleExact(v); return fracStr(e2[0], e2[1]); };
          html += '<div class="nv-card"><b>0.1 + 0.2 in double precision</b><br>0.1 is stored as <span class="nv-mono">' + fe(a).slice(0, 22) + '…</span><br>0.2 is stored as <span class="nv-mono">' + fe(b).slice(0, 22) + '…</span><br>' +
            'Their sum rounds to <span class="nv-mono nv-bad">' + fe(s).slice(0, 22) + '…</span><br>0.3 is stored as <span class="nv-mono nv-ok">' + fe(t).slice(0, 22) + '…</span><br>' + (s === t ? 'They are equal.' : 'They differ by one gap (' + fs(s - t) + '), so the test 0.1 + 0.2 == 0.3 is <b>false</b>.') + '</div>';
        }
        view2.innerHTML = html;
        F.out.set(F.quiet ? 'Sign, exponent and fraction bits of the stored number.' : 'A double keeps 53 significant bits (the leading 1 is not stored). ' + (bigDec(Dd.x) && doubleExact(x)[0] * bigDec(Dd.x)[1] === bigDec(Dd.x)[0] * doubleExact(x)[1] ? esc(Dd.x) + ' fits exactly.' : esc(Dd.x) + ' does not end in binary, so it is rounded to the nearest double.'));
      };
      render2();
      return { update: function (q) { Object.assign(o, q); render2(); } };
    }

    // cancel
    var Cc = { a: String(o.a), b: String(o.b), k: clamp(M.round(o.digits), 2, 12) }, view3 = mk('div', ''); F.box.appendChild(view3);
    if (F.edit) {
      numBox(F.ctl, '<i>a</i> =', Cc.a, function (v) { if (!isFinite(cfun(v, [])())) return false; Cc.a = v; render3(); return true; }, { mode: 'text', aria: 'a', width: '9rem' });
      numBox(F.ctl, '<i>b</i> =', Cc.b, function (v) { if (!isFinite(cfun(v, [])())) return false; Cc.b = v; render3(); return true; }, { mode: 'text', aria: 'b', width: '9rem' });
      V.slider(F.ctl, { label: 'digits kept', min: 3, max: 12, step: 1, value: Cc.k, fmt: function (v) { return String(v); }, input: function (v) { Cc.k = v; render3(); } });
    }
    function colorDigits(s, nOk) { // color the first nOk significant digits green, the rest orange
      var out = '', seenSig = 0, started = false;
      for (var i = 0; i < s.length; i++) { var ch = s[i]; if (/\d/.test(ch)) { if (ch !== '0') started = true; if (started) { seenSig++; out += '<span class="' + (seenSig <= nOk ? 'nv-ok' : 'nv-bad') + '">' + ch + '</span>'; continue; } } out += ch; }
      return out;
    }
    var render3 = function () {
      var av = cfun(Cc.a, [])(), bv = cfun(Cc.b, [])(), kk = Cc.k;
      if (!isFinite(av) || !isFinite(bv)) return;
      var as = Number(av.toPrecision(kk)), bs = Number(bv.toPrecision(kk));
      var ra = bigDec(as.toPrecision(kk)), rb = bigDec(bs.toPrecision(kk));
      var dN = ra[0] * rb[1] - rb[0] * ra[1], dD = ra[1] * rb[1], dc = fracStr(dN, dD), dcv = Number(dN) / Number(dD), dt = av - bv;
      var relE = dt === 0 ? (dcv === 0 ? 0 : 1) : M.abs(dcv - dt) / M.abs(dt), ok = relE === 0 ? 16 : clamp(M.floor(-M.log10(relE / 5)), 0, 16);
      var agree = 0, sa = sigDigits(as.toPrecision(kk)), sb = sigDigits(bs.toPrecision(kk)); if (M.floor(M.log10(M.abs(as))) === M.floor(M.log10(M.abs(bs)))) while (agree < sa.length && sa[agree] === sb[agree]) agree++;
      var nDig = sigDigits(dc).replace(/0+$/, '').length || 1;
      view3.innerHTML = '<div class="nv-card nv-mono">' +
        '<div><i>a</i> = ' + esc(Cc.a) + ' ≈ ' + colorDigits(as.toPrecision(kk), kk) + '<span class="nv-dim">…</span></div>' +
        '<div><i>b</i> = ' + esc(Cc.b) + ' ≈ ' + colorDigits(bs.toPrecision(kk), kk) + '<span class="nv-dim">…</span></div>' +
        '<div style="border-top:1px solid var(--mv-line);margin-top:.3rem;padding-top:.3rem"><i>a</i> − <i>b</i> computed: ' + (F.quiet ? dc : colorDigits(dc, ok)) + '</div>' +
        (F.quiet ? '' : '<div class="nv-dim"><i>a</i> − <i>b</i> true: ' + minus(dt.toPrecision(12)) + '…</div>') + '</div>' +
        keyHTML([['#00703c', 'correct digits'], ['#c2410c', 'digits that are round-off']]);
      F.out.set(F.quiet ? 'Each number keeps ' + kk + ' significant digits; their difference is computed exactly from those.' : 'Each number is right to ' + kk + ' digits, and they share their first ' + agree + ' digit' + (agree === 1 ? '' : 's') + '. Those cancel, so the difference has only about <b>' + M.min(ok, nDig) + '</b> correct significant digit' + (M.min(ok, nDig) === 1 ? '' : 's') + '; the rest is round-off from the inputs.');
    };
    render3();
    return { update: function (q) { Object.assign(o, q); render3(); } };
  });

  // ================================================================ num-error
  var MNAME = { forward: 'Forward difference', central: 'Central difference', second: 'Second difference', trap: 'Composite trapezoid rule', simpson: 'Composite Simpson\'s rule', euler: 'Euler\'s method', heun: 'Heun\'s method', rk4: 'RK4', ab2: 'Two-step Adams–Bashforth (AB2)', ab3: 'Three-step Adams–Bashforth (AB3)' };
  var MSHORT = { forward: 'forward', central: 'central', second: 'second', trap: 'trapezoid', simpson: 'Simpson', euler: 'Euler', heun: 'Heun', rk4: 'RK4', ab2: 'AB2', ab3: 'AB3' };
  function gaussInt(f, a, b, n) { var X = [0, 0.5384693101056831, -0.5384693101056831, 0.906179845938664, -0.906179845938664], Wt = [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908], h = (b - a) / n, s = 0; for (var i = 0; i < n; i++) { var m = a + (i + 0.5) * h; for (var j = 0; j < 5; j++) s += Wt[j] * f(m + X[j] * h / 2); } return s * h / 2; }
  function odeStep(m, F, t, y, h) {
    var k1 = F(t, y); if (m === 'euler') return y + h * k1;
    if (m === 'heun') { var k2 = F(t + h, y + h * k1); return y + h / 2 * (k1 + k2); }
    var a = F(t + h / 2, y + h / 2 * k1), b = F(t + h / 2, y + h / 2 * a), c = F(t + h, y + h * b); return y + h / 6 * (k1 + 2 * a + 2 * b + c);
  }
  function odeRun(m, F, y0, T, N, eulerStart) {
    var h = T / N, i;
    if (m !== 'ab2' && m !== 'ab3') { var y = y0; for (i = 0; i < N; i++) y = odeStep(m, F, i * h, y, h); return y; }
    var k = m === 'ab2' ? 2 : 3, ys = [y0], fv = [F(0, y0)];
    for (i = 1; i <= N; i++) {
      var yn = i < k ? odeStep(eulerStart ? 'euler' : 'rk4', F, (i - 1) * h, ys[i - 1], h) : k === 2 ? ys[i - 1] + h / 2 * (3 * fv[i - 1] - fv[i - 2]) : ys[i - 1] + h / 12 * (23 * fv[i - 1] - 16 * fv[i - 2] + 5 * fv[i - 3]);
      ys.push(yn); fv.push(F(i * h, yn));
    }
    return ys[N];
  }
  V.register('num-error', function (el, o) {
    o = Object.assign({ method: 'central', methods: null, f: 'sin(x)', x0: 1, interval: [0, 1], ode: { f: '-2y', y0: 1, T: 1 }, hmin: 1e-12, hmax: 1, refs: [1, 2, 4], richardson: false, local: false, blind: false }, o || {});
    var S = { m: o.method, rich: !!o.richardson, local: !!o.local, k: null, eul: o.start === 'euler' }, F = frame(el, o, 'Error against step size on log-log axes');
    var c = F.canvas(F.box, { aspect: 1.45, min: 260, max: 460 }); c.cv.setAttribute('aria-hidden', 'true');
    var f = cfun(o.f, ['x']), x0 = nval(o.x0, 1), a = nval(o.interval[0], 0), b = nval(o.interval[1], 1), od = o.ode || {}, Fo = cfun(od.f || '-2y', ['t', 'y']), y0 = nval(od.y0, 1), TT = nval(od.T, 1);
    var d1 = null, d2 = null; try { d1 = dfun(o.f, 'x', ['x']); var C = W.CAS, t2 = C.deriv(C.deriv(C.parse(String(o.f)), 'x'), 'x'), g2 = C.compile(t2, ['x']); d2 = function (x) { return +g2(x); }; } catch (e) { }
    var cacheI = null, cacheR = {};
    function kind(m) { return /forward|central|second/.test(m) ? 'diff' : /trap|simpson/.test(m) ? 'quad' : 'ode'; }
    function compute() {
      var m = S.m, K = kind(m), pts = [], rich = [];
      if (K === 'diff') {
        var ex = m === 'second' ? d2(x0) : d1(x0);
        var A = function (h) { return m === 'forward' ? (f(x0 + h) - f(x0)) / h : m === 'central' ? (f(x0 + h) - f(x0 - h)) / (2 * h) : (f(x0 + h) - 2 * f(x0) + f(x0 - h)) / (h * h); };
        for (var e = M.log10(o.hmax); e >= M.log10(o.hmin) - 1e-9; e -= 0.25) { var h = M.pow(10, e), v = A(h); pts.push([h, M.abs(v - ex), v]); if (S.rich && m !== 'second') { var r = m === 'forward' ? 2 * A(h / 2) - A(h) : (4 * A(h / 2) - A(h)) / 3; rich.push([h, M.abs(r - ex), r]); } }
        return { pts: pts, rich: rich, exact: ex, K: K, p: m === 'forward' ? 1 : 2, pr: m === 'forward' ? 2 : 4 };
      }
      if (K === 'quad') {
        if (cacheI === null) cacheI = gaussInt(f, a, b, 400);
        for (var k = 1; k <= 16; k++) { var n = M.pow(2, k), hh = (b - a) / n, s;
          if (m === 'trap') { s = (f(a) + f(b)) / 2; for (var i = 1; i < n; i++) s += f(a + i * hh); s *= hh; }
          else { s = f(a) + f(b); for (i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * hh); s *= hh / 3; }
          pts.push([hh, M.abs(s - cacheI), s]); }
        var rich2 = [];
        if (S.rich && m === 'trap') { for (k = 0; k + 1 < pts.length; k++) rich.push([pts[k][0], 0, (4 * pts[k + 1][2] - pts[k][2]) / 3]); for (k = 0; k + 1 < rich.length; k++) rich2.push([rich[k][0], M.abs((16 * rich[k + 1][2] - rich[k][2]) / 15 - cacheI), 0]); rich.forEach(function (r) { r[1] = M.abs(r[2] - cacheI); }); }
        return { pts: pts, rich: rich, rich2: rich2, exact: cacheI, K: K, p: m === 'trap' ? 2 : 4 };
      }
      if (m === 'ab2' || m === 'ab3') S.local = false;
      var key = S.local ? 'L' : 'G';
      if (!(key in cacheR)) cacheR[key] = S.local ? null : odeRun('rk4', Fo, y0, TT, 16384);
      for (var j = 0; j <= 13; j++) { var N = M.pow(2, j), h2 = TT / N, y;
        if (S.local) { var yr = odeRun('rk4', Fo, y0, h2, 256); y = odeStep(m, Fo, 0, y0, h2); pts.push([h2, M.abs(y - yr), y]); }
        else { y = odeRun(m, Fo, y0, TT, N, S.eul); pts.push([h2, M.abs(y - cacheR[key]), y]); } }
      var po = m === 'euler' ? 1 : m === 'heun' || m === 'ab2' ? 2 : m === 'ab3' ? (S.eul ? 2 : 3) : 4;
      return { pts: pts, rich: [], exact: cacheR[key], K: K, p: S.local ? po + 1 : po };
    }
    function fit(pts) { // slope over the right-hand stretch where the error keeps falling as h shrinks
      var seg = [], s = pts.slice().sort(function (u, v) { return v[0] - u[0]; });
      for (var i = 0; i < s.length; i++) { if (!(s[i][1] > 1e-13)) break; if (seg.length && s[i][1] >= seg[seg.length - 1][1]) break; seg.push(s[i]); }
      if (seg.length > 2 && seg[0][1] > 0) seg = seg.slice(1); // skip the very largest h (not yet asymptotic)
      if (seg.length < 3) return null;
      var X = seg.map(function (p) { return M.log10(p[0]); }), Y = seg.map(function (p) { return M.log10(p[1]); }), n = X.length, mx = X.reduce(function (u, v) { return u + v; }, 0) / n, my = Y.reduce(function (u, v) { return u + v; }, 0) / n, sxy = 0, sxx = 0;
      for (i = 0; i < n; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) * (X[i] - mx); }
      return { slope: sxy / sxx, lo: seg[seg.length - 1][0], hi: seg[0][0] };
    }
    var methods = (o.methods && o.methods.length ? o.methods : [o.method]).filter(function (m) { return MNAME[m]; });
    if (F.edit) {
      if (methods.length > 1 && !o.blind) V.seg(F.ctl, { label: 'Method', items: methods.map(function (m) { return [m, MSHORT[m]]; }), value: S.m, change: function (v) { S.m = v; S.k = null; setup(); draw(); } });
      var rchk = check(F.ctl, 'Richardson extrapolation', S.rich, function (v) { S.rich = v; draw(); });
      var echk = check(F.ctl, 'start with Euler steps', S.eul, function (v) { S.eul = v; draw(); });
      var lchk = check(F.ctl, 'one step only (local error)', S.local, function (v) { S.local = v; S.k = null; draw(); });
      var probe = V.slider(F.ctl, { label: 'probe h', min: 0, max: 1, step: 1, value: 0, fmt: function () { return S.k === null ? '—' : fs(S.data.pts[S.k][0], 3); }, input: function (v) { S.k = v; draw(); } });
    }
    function setup() { if (!F.edit) return; var K = kind(S.m), ab = S.m === 'ab2' || S.m === 'ab3'; rchk.parentNode.hidden = !((K === 'diff' && S.m !== 'second') || S.m === 'trap'); lchk.parentNode.hidden = K !== 'ode' || ab; echk.parentNode.hidden = !ab; }
    setup();
    function draw() {
      var D0 = compute(); S.data = D0;
      if (F.edit) { probe.input.max = D0.pts.length - 1; if (S.k === null || S.k >= D0.pts.length) { S.k = M.floor(D0.pts.length / 2); } probe.set(S.k); }
      var ctx = c.ctx, Kc = V.colors(), padL = 52, padB = 34, padT = 12, padR = 14, W2 = c.w - padL - padR, H2 = c.h - padT - padB;
      var all = D0.pts.concat(D0.rich).concat(D0.rich2 || []), lh = all.map(function (p) { return M.log10(p[0]); }), le = all.map(function (p) { return M.log10(M.max(p[1], 1e-17)); });
      var xa = M.floor(M.min.apply(null, lh) - 0.1), xb = M.ceil(M.max.apply(null, lh) + 0.1), ya = M.max(-17, M.floor(M.min.apply(null, le) - 0.3)), yb = M.ceil(M.max.apply(null, le) + 0.3); if (yb - ya < 4) ya = yb - 4;
      var X = function (lx) { return padL + W2 * (lx - xa) / (xb - xa); }, Y = function (ly) { return padT + H2 * (yb - ly) / (yb - ya); };
      ctx.save(); ctx.fillStyle = Kc.bg; ctx.fillRect(0, 0, c.w, c.h);
      ctx.strokeStyle = Kc.grid; ctx.lineWidth = 1; ctx.beginPath();
      var stepX = (xb - xa) > 8 ? 2 : 1, stepY = (yb - ya) > 10 ? 2 : 1;
      for (var gx = xa; gx <= xb; gx++) { ctx.moveTo(M.round(X(gx)) + 0.5, padT); ctx.lineTo(M.round(X(gx)) + 0.5, padT + H2); }
      for (var gy = ya; gy <= yb; gy++) { ctx.moveTo(padL, M.round(Y(gy)) + 0.5); ctx.lineTo(padL + W2, M.round(Y(gy)) + 0.5); }
      ctx.stroke();
      ctx.strokeStyle = Kc.axis; ctx.lineWidth = 1.5; ctx.strokeRect(padL, padT, W2, H2);
      for (gx = xa; gx <= xb; gx += stepX) txt(ctx, '10' + sup(gx), X(gx), padT + H2 + 13, { align: 'center', size: 11 });
      for (gy = ya; gy <= yb; gy += stepY) txt(ctx, '10' + sup(gy), padL - 5, Y(gy), { align: 'right', size: 11 });
      txt(ctx, 'step size h', padL + W2 / 2, c.h - 6, { align: 'center', size: 11 });
      ctx.save(); ctx.translate(11, padT + H2 / 2); ctx.rotate(-PI / 2); txt(ctx, 'error', 0, 0, { align: 'center', size: 11 }); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(padL, padT, W2, H2); ctx.clip();
      // reference slopes through a point below the right end of the data
      var right = D0.pts.reduce(function (u, v) { return v[0] > u[0] ? v : u; }, D0.pts[0]), rx = M.log10(right[0]), ry = M.log10(M.max(right[1], 1e-17)) - 0.8;
      (o.refs || []).forEach(function (sl, i) { ctx.strokeStyle = Kc.muted; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(rx), Y(ry - 0.25 * i)); ctx.lineTo(X(rx - (yb - ya) / sl), Y(ry - 0.25 * i - (yb - ya))); ctx.stroke(); ctx.setLineDash([]); });
      function series(pts, col) { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(function (p, i) { var px = X(M.log10(p[0])), py = Y(M.log10(M.max(p[1], 1e-17))); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }); ctx.stroke(); ctx.fillStyle = col; pts.forEach(function (p) { ctx.beginPath(); ctx.arc(X(M.log10(p[0])), Y(M.log10(M.max(p[1], 1e-17))), 2.6, 0, 2 * PI); ctx.fill(); }); }
      series(D0.pts, Kc.blue); if (D0.rich.length) series(D0.rich, Kc.purple); if (D0.rich2 && D0.rich2.length) series(D0.rich2, Kc.teal);
      var best = D0.pts.reduce(function (u, v) { return v[1] < u[1] ? v : u; }, D0.pts[0]), fitd = fit(D0.pts);
      if (!F.quiet && D0.K === 'diff') { ctx.fillStyle = Kc.gold; ctx.beginPath(); ctx.arc(X(M.log10(best[0])), Y(M.log10(M.max(best[1], 1e-17))), 6, 0, 2 * PI); ctx.fill(); }
      if (F.edit && S.k !== null) { var pk = D0.pts[S.k]; ctx.strokeStyle = Kc.red; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(M.log10(pk[0])), padT); ctx.lineTo(X(M.log10(pk[0])), padT + H2); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = Kc.red; ctx.beginPath(); ctx.arc(X(M.log10(pk[0])), Y(M.log10(M.max(pk[1], 1e-17))), 5, 0, 2 * PI); ctx.fill(); }
      ctx.restore();
      (o.refs || []).forEach(function (sl, i) { var ex2 = M.max(xa + 0.2, rx - (ry - 0.25 * i - ya - 0.6) / sl); pill(ctx, 'slope ' + sl, X(ex2), clamp(Y(ry - 0.25 * i - (rx - ex2) * sl), padT + 10, padT + H2 - 10), Kc.muted, { W: c.w, size: 11 }); });
      ctx.restore();
      var name = o.blind ? 'This method' : MNAME[S.m], K = D0.K, msg = name + (K === 'diff' ? ' for ' + (S.m === 'second' ? 'f″' : 'f′') + '(' + minus(x0) + '), f(x) = ' + pf(o.f) + '.' : K === 'quad' ? ' for ∫ from ' + minus(a) + ' to ' + minus(b) + ' of ' + pf(o.f) + '.' : ' for y′ = ' + pf(od.f || '-2y') + ', y(0) = ' + minus(y0) + ', ' + (S.local ? 'one step from t = 0 (local error).' : 'error at t = ' + minus(TT) + ' (global error).'));
      if (!F.quiet && fitd) msg += ' Fitted slope ≈ <b>' + minus(fitd.slope.toFixed(2)) + '</b>' + (K === 'diff' || o.blind ? '' : ' (order ' + D0.p + ' expected)') + '.';
      if (!F.quiet && K === 'diff') msg += ' Smallest error ' + fs(best[1], 2) + ' at h ≈ ' + fs(best[0], 2) + '; below that, round-off (about ε/h) takes over.';
      if (!F.quiet && D0.rich.length) msg += D0.K === 'quad' ? ' Purple: one Richardson step, (4T(h/2) − T(h))/3, the first Romberg column (Simpson\'s rule, slope 4). Teal: a second step, (16R(h/2) − R(h))/15 (slope 6), until round-off stops it.' : ' Purple: Richardson-extrapolated values, a steeper line.';
      if (!F.quiet && (S.m === 'ab2' || S.m === 'ab3')) msg += ' Starting values come from ' + (S.eul ? 'Euler steps (error of order h² each).' : 'RK4 steps.');
      if (F.edit && S.k !== null) msg += ' Probe: h = ' + fs(D0.pts[S.k][0], 3) + ', error ' + fs(D0.pts[S.k][1], 3) + '.';
      F.out.set(msg);
    }
    redrawOn(c, draw); draw();
    return { update: function (q) { Object.assign(o, q); draw(); } };
  });

  // ================================================================ num-roots
  var RNAME = { bisection: 'Bisection', newton: 'Newton\'s method', secant: 'Secant method', 'fixed-point': 'Fixed-point iteration' };
  var PRESETS = {
    cycle: { label: '2-cycle', f: 'x^3-2x+2', method: 'newton', x0: 0, window: [-3, 3, -3, 6] },
    double: { label: 'double root', f: '(x-1)^2', method: 'newton', x0: 2.5, window: [-1, 3, -1, 4] },
    far: { label: 'bad start', f: 'atan(x)', method: 'newton', x0: 1.5, window: [-12, 12, -2, 2] },
    pole: { label: 'tan x on [1, 2]', f: 'tan(x)', method: 'bisection', a: 1, b: 2, window: [0, 3, -6, 6] }
  };
  V.register('num-roots', function (el, o) {
    o = Object.assign({ f: 'x^3-2x+2', g: 'cos(x)', method: 'newton', methods: null, x0: 1, x1: 2, a: 1, b: 2, steps: 4, root: null, table: true, window: null, presets: false, given: 0 }, o || {});
    var S = { m: o.method, f: o.f, g: o.g, x0: nval(o.x0, 1), x1: nval(o.x1, 2), a: nval(o.a, 1), b: nval(o.b, 2), n: M.max(0, M.round(o.steps)), win: o.window, root: o.root };
    var F = frame(el, o, 'Root finding on a graph'), c = F.canvas(F.box, { aspect: 1.55, min: 250, max: 440 }), P = V.plane(c, {});
    var tblBox = mk('div', 'mla-tablewrap'); F.after(tblBox);
    var fn, dfn, gfn;
    function compileAll() { fn = cfun(S.f, ['x']); try { dfn = dfun(S.f, 'x', ['x']); } catch (e) { dfn = function (x) { var h = 1e-6 * M.max(1, M.abs(x)); return (fn(x + h) - fn(x - h)) / (2 * h); }; } gfn = cfun(S.g, ['x']); }
    function setWin() { var w = S.win || (S.m === 'fixed-point' ? [-0.5, 2, -0.5, 2] : [-3, 3, -4, 4]); P.set({ xmin: nval(w[0], -3), xmax: nval(w[1], 3), ymin: nval(w[2], -4), ymax: nval(w[3], 4), equal: S.m === 'fixed-point' }); }
    compileAll(); setWin();
    function run(N) { // iterate N steps (or until failure); returns {xs, rows, note}
      var m = S.m, xs = [], note = '', i, x, xp;
      if (m === 'bisection') {
        var a = M.min(S.a, S.b), b = M.max(S.a, S.b), fa = fn(a), fb = fn(b), rows = [];
        if (!(fa * fb < 0)) return { xs: [], rows: [], note: 'f(a) = ' + fs(fa) + ' and f(b) = ' + fs(fb) + ' do not have opposite signs, so bisection cannot start.' };
        for (i = 0; i < N; i++) { var mid = (a + b) / 2, fm = fn(mid); rows.push({ a: a, b: b, m: mid, fm: fm }); xs.push(mid); if (fm === 0) break; if ((fm < 0) === (fa < 0)) { a = mid; fa = fm; } else b = mid; }
        return { xs: xs, rows: rows, note: '' };
      }
      if (m === 'fixed-point') { x = S.x0; xs.push(x); for (i = 0; i < N; i++) { x = gfn(x); if (!isFinite(x) || M.abs(x) > 1e8) { note = 'The iterates blow up.'; break; } xs.push(x); } return { xs: xs, note: note }; }
      if (m === 'newton') {
        x = S.x0; xs.push(x);
        for (i = 0; i < N; i++) { var d = dfn(x), y = fn(x); if (d === 0 || !isFinite(d)) { note = 'f′(x' + subN(i) + ') = 0: the tangent is flat and never meets the axis.'; break; } x = x - y / d; if (!isFinite(x) || M.abs(x) > 1e8) { note = 'The iterates run off to infinity.'; break; } xs.push(x); }
        return { xs: xs, note: note };
      }
      x = S.x0; xp = S.x1; xs.push(x, xp);
      for (i = 0; i < N; i++) { var f0 = fn(x), f1 = fn(xp); if (f1 === f0) { note = 'f(x' + subN(i) + ') = f(x' + subN(i + 1) + '): the secant line is flat.'; break; } var xn = xp - f1 * (xp - x) / (f1 - f0); if (!isFinite(xn) || M.abs(xn) > 1e8) { note = 'The iterates run off to infinity.'; break; } x = xp; xp = xn; xs.push(xn); }
      return { xs: xs, note: note };
    }
    function subN(i) { return String(i).split('').map(function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }).join(''); }
    function trueRoot(last) {
      if (S.root != null) return nval(S.root, NaN);
      var Fx = S.m === 'fixed-point' ? function (x) { return gfn(x) - x; } : fn, v = P.o, best = NaN, bd = 1e9, N = 600, prev = Fx(v.xmin), px = v.xmin;
      for (var i = 1; i <= N; i++) { var x = v.xmin + (v.xmax - v.xmin) * i / N, y = Fx(x);
        if (isFinite(prev) && isFinite(y) && prev * y <= 0) { var lo = px, hi = x, flo = prev; for (var k = 0; k < 100; k++) { var md = (lo + hi) / 2, fm = Fx(md); if ((fm < 0) === (flo < 0)) { lo = md; flo = fm; } else hi = md; } var r = (lo + hi) / 2;
          if (M.abs(Fx(r)) < 1e-6 * M.max(1, M.abs(prev), M.abs(y))) { var dd = isFinite(last) ? M.abs(r - last) : 0; if (dd < bd) { bd = dd; best = r; } } }
        prev = y; px = x; }
      return best;
    }
    var hl = [];
    function hd(key) { return { get: function () { return [S[key], 0]; }, set: function (x) { S[key] = M.round(x * 100) / 100; }, stepY: 0, step: 0.05 }; }
    function buildHl() { hl.length = 0; (S.m === 'bisection' ? ['a', 'b'] : S.m === 'secant' ? ['x0', 'x1'] : ['x0']).forEach(function (k2) { hl.push(hd(k2)); }); }
    buildHl();
    var H = F.edit ? handles(c, P, hl, function () { draw(); }) : null;
    c.cv.setAttribute('aria-label', (RNAME[S.m] || 'Root finder') + ' on y = ' + S.f + (F.edit ? '. Left and right arrow keys move the starting point; Enter switches points.' : ''));
    var methods = (o.methods && o.methods.length ? o.methods : []).filter(function (m) { return RNAME[m]; });
    if (F.edit) {
      if (methods.length > 1) V.seg(F.ctl, { label: 'Method', items: methods.map(function (m) { return [m, RNAME[m].replace(' method', '').replace(' iteration', '')]; }), value: S.m, change: function (v) { S.m = v; buildHl(); setWin(); draw(); } });
      V.button(F.ctl, '◀ Back', function () { S.n = M.max(0, S.n - 1); draw(); });
      V.button(F.ctl, 'Step ▶', function () { S.n = M.min(40, S.n + 1); draw(); }, 'pri');
      V.button(F.ctl, 'Reset', function () { S.n = 0; draw(); });
      if (o.presets) { var pr = F.row(); V.seg(pr, { label: 'Failure cases', items: Object.keys(PRESETS).map(function (k) { return [k, PRESETS[k].label]; }), value: '', change: function (k) { var q = PRESETS[k]; S.m = q.method; S.f = q.f; S.win = q.window; S.root = null; if ('x0' in q) S.x0 = q.x0; if ('a' in q) { S.a = q.a; S.b = q.b; } S.n = 6; compileAll(); buildHl(); setWin(); draw(); } }); }
    }
    function dig(x, r) { var e = M.abs(x - r), d = r === 0 ? (e === 0 ? 15 : M.floor(-M.log10(e))) : M.floor(-M.log10(e / M.abs(r)) + 1e-9); return clamp(isFinite(d) ? d : 15, 0, 15); }
    function showDigits(x, nd) { var s = minus(x.toPrecision(12)), out = '', seen = 0, st = false; for (var i = 0; i < s.length; i++) { var ch = s[i]; if (/\d/.test(ch)) { if (ch !== '0') st = true; if (st) seen++; if (st && seen <= nd) { out += '<b class="nv-ok">' + ch + '</b>'; continue; } } out += ch; } return out; }
    function draw() {
      var Kc = V.colors(), R0 = run(S.n), xs = R0.xs, ctx = c.ctx, m = S.m, last = xs.length ? xs[xs.length - 1] : NaN, r = trueRoot(last);
      P.clear(); P.grid(); P.axes();
      if (m === 'fixed-point') { P.plot(function (x) { return x; }, { color: Kc.muted, width: 1.5, dash: [6, 5] }); P.plot(gfn, { color: Kc.blue }); }
      else P.plot(fn, { color: Kc.blue });
      ctx.save();
      if (m === 'newton') xs.slice(0, -1).forEach(function (x, i) { var y = fn(x), x2 = xs[i + 1]; P.seg(x, 0, x, y, { color: Kc.muted, width: 1.2, dash: [3, 3] }); P.seg(x, y, x2, 0, { color: Kc.orange, width: 2 }); P.point(x, y, { color: Kc.orange, r: 3.5 }); });
      if (m === 'secant') xs.slice(1, -1).forEach(function (x, i) { var xa = xs[i], ya = fn(xa), yb = fn(x), x2 = xs[i + 2]; P.seg(xa, ya, x2, 0, { color: Kc.orange, width: 2 }); P.point(xa, ya, { color: Kc.orange, r: 3.5 }); P.point(x, yb, { color: Kc.orange, r: 3.5 }); P.seg(x2, 0, x2, fn(x2), { color: Kc.muted, width: 1.2, dash: [3, 3] }); });
      if (m === 'fixed-point') { var pts = []; xs.forEach(function (x, i) { if (i === 0) pts.push([x, 0]); pts.push([x, gfn(x)]); if (i < xs.length - 1) pts.push([gfn(x), gfn(x)]); }); if (pts.length > 1) P.poly(pts, { color: Kc.orange, width: 2, close: false }); }
      if (m === 'bisection') R0.rows.forEach(function (rw, i) { var y = P.y(P.Y(0) + 14 + i * 9); P.seg(rw.a, y, rw.b, y, { color: i === R0.rows.length - 1 ? Kc.orange : Kc.muted, width: i === R0.rows.length - 1 ? 3.5 : 2 }); P.point(rw.m, y, { color: Kc.orange, r: 3 }); });
      xs.forEach(function (x, i) { if (m === 'bisection') return; P.point(x, 0, { color: i === xs.length - 1 ? Kc.red : Kc.ink, r: i === xs.length - 1 ? 5 : 3 }); });
      if (F.edit) hl.forEach(function (h) { var p = h.get(); knob(ctx, P.X(p[0]), P.Y(0), Kc.green); });
      if (m === 'bisection') { [S.a, S.b].forEach(function (x) { var y = fn(x); pill(ctx, (y > 0 ? '+' : y < 0 ? '−' : '0'), P.X(x), P.Y(0) - 16, y > 0 ? Kc.blue : Kc.red, { W: c.w }); }); }
      if (H) H.ring(ctx);
      ctx.restore();
      // table
      var given = F.quiet ? (o.given || 0) : 1e9, rowsH = [], head;
      if (o.table !== false) {
        if (m === 'bisection') { head = ['n', 'a', 'b', 'midpoint', 'f(mid)', 'error']; R0.rows.slice(0, given).forEach(function (rw, i) { rowsH.push({ cells: [i + 1, minus(+rw.a.toPrecision(8)), minus(+rw.b.toPrecision(8)), isFinite(r) ? showDigits(rw.m, dig(rw.m, r)) : minus(rw.m.toPrecision(10)), fs(rw.fm, 3), isFinite(r) ? fs(M.abs(rw.m - r), 2) : '—'], cls: i === R0.rows.length - 1 ? 'hi' : '' }); }); }
        else {
          head = ['n', 'x<sub>n</sub>', m === 'fixed-point' ? 'g(x<sub>n</sub>)' : 'f(x<sub>n</sub>)', 'e<sub>n</sub>', 'e<sub>n+1</sub>/e<sub>n</sub>', 'e<sub>n+1</sub>/e<sub>n</sub>²', 'p ≈'];
          var es = xs.map(function (x) { return isFinite(r) ? M.abs(x - r) : NaN; });
          xs.slice(0, given).forEach(function (x, i) { var e0 = es[i], e1 = es[i + 1], em = es[i - 1], pe = i >= 1 && e1 > 0 && e0 > 0 && em > 0 ? M.log(e1 / e0) / M.log(e0 / em) : NaN;
            rowsH.push({ cells: [i, isFinite(r) ? showDigits(x, dig(x, r)) : minus(x.toPrecision(10)), fs(m === 'fixed-point' ? gfn(x) : fn(x), 3), isFinite(e0) ? fs(e0, 2) : '—', e1 >= 0 && e0 > 0 && i < xs.length - 1 ? fs(e1 / e0, 3) : '', e1 >= 0 && e0 > 0 && i < xs.length - 1 ? fs(e1 / (e0 * e0), 3) : '', isFinite(pe) && e1 > 1e-15 && e1 < e0 && e0 < em ? minus(pe.toFixed(2)) : ''], cls: i === xs.length - 1 ? 'hi' : '' }); });
        }
        tblBox.innerHTML = rowsH.length ? tableHTML(head, rowsH) : '';
      }
      // readout
      var msg = RNAME[m] + (m === 'fixed-point' ? ' with g(x) = ' + pf(S.g) : ' on f(x) = ' + pf(S.f)) + '. ';
      if (R0.note) msg += '<b>' + R0.note + '</b> ';
      else if (!xs.length) msg += 'Press Step to begin. ';
      else {
        var n = xs.length - 1, conv = n >= 1 && M.abs(xs[n] - xs[n - 1]) < 1e-12 * M.max(1, M.abs(xs[n])), cyc = n >= 3 && M.abs(xs[n] - xs[n - 2]) < 1e-9 && M.abs(xs[n] - xs[n - 1]) > 1e-6;
        if (cyc) msg += '<b>The iterates repeat (' + minus(+xs[n - 1].toPrecision(6)) + ', ' + minus(+xs[n].toPrecision(6)) + ', …): a cycle, so it never reaches the root.</b> ';
        else if (!F.quiet && conv && isFinite(r)) msg += 'Converged to ' + minus(r.toPrecision(12)) + '. ';
        if (!F.quiet && isFinite(r) && !cyc) msg += 'Bold green digits are correct' + (m === 'newton' ? ': near a simple root their number roughly doubles each step.' : m === 'secant' ? ': their number grows by a factor of about 1.6 each step.' : m === 'bisection' ? ': about one more digit every 3.3 steps.' : '.');
      }
      F.out.set(msg);
    }
    redrawOn(c, draw); draw();
    return { update: function (q) { Object.assign(o, q); draw(); } };
  });

  // ================================================================ num-system
  function solve2(A, b) { var d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [(b[0] * A[1][1] - A[0][1] * b[1]) / d, (A[0][0] * b[1] - b[0] * A[1][0]) / d]; }
  function inv2n(A) { var d = A[0][0] * A[1][1] - A[0][1] * A[1][0]; return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]]; }
  function nInf(v) { return M.max(M.abs(v[0]), M.abs(v[1])); }
  function n2(v) { return M.hypot(v[0], v[1]); }
  function mInf(A) { return M.max(M.abs(A[0][0]) + M.abs(A[0][1]), M.abs(A[1][0]) + M.abs(A[1][1])); }
  function sv2(A) { var a = A[0][0], b = A[0][1], c = A[1][0], d = A[1][1], s1 = a * a + b * b + c * c + d * d, dt = a * d - b * c, r = M.sqrt(M.max(0, s1 * s1 - 4 * dt * dt)); return [M.sqrt((s1 + r) / 2), M.sqrt(M.max(0, (s1 - r) / 2))]; }
  function lineAB(P, a, b, rhs, q) { // draw a*x + b*y = rhs across the view
    var v = P.view();
    if (M.abs(b) > M.abs(a)) P.seg(v.xmin, (rhs - a * v.xmin) / b, v.xmax, (rhs - a * v.xmax) / b, q);
    else P.seg((rhs - b * v.ymin) / a, v.ymin, (rhs - b * v.ymax) / a, v.ymax, q);
  }
  V.register('num-system', function (el, o) {
    var uo = o || {};
    o = Object.assign({ A: [[1, 1], [1, 1.0001]], b: [2, 2.0001], mode: 'perturb', method: 'jacobi', x0: [0, 0], steps: 8, swap: false, digits: 3, eps: 1e-4, pct: 1, norm: 'inf' }, o || {});
    if (/^(cost|lu|norms|lsq|bvp)$/.test(o.mode)) return sysx(el, o, uo);
    var mode = o.mode, F = frame(el, o, mode === 'pivot' ? 'Elimination with and without a row swap' : mode === 'iterate' ? 'Jacobi and Gauss–Seidel iterations as paths between two lines' : 'A 2 by 2 system as two lines'), Kc = V.colors;
    var A0 = o.A.map(function (r) { return r.map(function (v) { return nval(v, 0); }); }), b0 = o.b.map(function (v) { return nval(v, 0); });

    if (mode === 'pivot') {
      var Sp = { k: clamp(M.round(o.digits), 2, 7) }, eps = nval(o.eps, 1e-4), bp = uo.b && uo.b.length === 2 ? b0 : [1, 2];
      var view = mk('div', ''); F.box.appendChild(view);
      if (F.edit) V.slider(F.ctl, { label: 'digits kept', min: 2, max: 7, step: 1, value: Sp.k, fmt: function (v) { return String(v); }, input: function (v) { Sp.k = v; render(); } });
      var fl = function (x) { return x === 0 ? 0 : Number(x.toPrecision(Sp.k)); };
      var render = function () {
        var b1 = bp[0], b2 = bp[1], tx = (b2 - b1) / (1 - eps), ty = (b1 - eps * b2) / (1 - eps);
        var m1 = fl(1 / eps), a22 = fl(1 - fl(m1)), c2 = fl(b2 - fl(m1 * b1)), y1 = fl(c2 / a22), x1 = fl(fl(b1 - y1) / eps);
        var m2 = fl(eps), a22b = fl(1 - fl(m2)), c1 = fl(b1 - fl(m2 * b2)), y2 = fl(c1 / a22b), x2 = fl(b2 - y2);
        function card(title, lines, x, y) { return '<div class="nv-card"><b>' + title + '</b><br>' + lines.join('<br>') + (F.quiet ? '' : '<br>Result: <i>x</i> = <b class="' + (M.abs(x - tx) < 0.01 * M.max(1, M.abs(tx)) ? 'nv-ok' : 'nv-bad') + '">' + fs(x, Sp.k) + '</b>, <i>y</i> = <b class="' + (M.abs(y - ty) < 0.01 * M.max(1, M.abs(ty)) ? 'nv-ok' : 'nv-bad') + '">' + fs(y, Sp.k) + '</b>') + '</div>'; }
        view.innerHTML = '<p class="nv-big" style="font-size:.95rem">' + fs(eps) + ' x + y = ' + b1 + '<br>x + y = ' + b2 + '</p><div class="nv-grid2">' +
          card('No swap: pivot ' + fs(eps), ['multiplier 1/' + fs(eps) + ' = ' + fs(m1), 'new row 2: ' + fs(a22, Sp.k) + ' y = ' + fs(c2, Sp.k) + ' (after rounding)', 'y = ' + fs(y1, Sp.k) + ', then x = (' + b1 + ' − y)/' + fs(eps)], x1, y1) +
          card('Partial pivoting: swap first', ['multiplier ' + fs(eps) + '/1 = ' + fs(m2), 'new row 2: ' + fs(a22b, Sp.k) + ' y = ' + fs(c1, Sp.k) + ' (after rounding)', 'y = ' + fs(y2, Sp.k) + ', then x = ' + b2 + ' − y'], x2, y2) + '</div>';
        F.out.set(F.quiet ? 'Every result is rounded to ' + Sp.k + ' significant digits.' : 'True solution: x ≈ ' + fs(tx, 8) + ', y ≈ ' + fs(ty, 8) + '. With the tiny pivot the multiplier is huge, so the 1 and the ' + b2 + ' in row 2 are rounded away and x comes out ' + (M.abs(x1 - tx) < 0.01 ? 'right only by luck' : 'wrong') + '. After the swap every multiplier is at most 1 and the answer is right to ' + Sp.k + ' digits.');
      };
      render();
      return { update: function (q) { Object.assign(o, q); render(); } };
    }

    var c = F.canvas(F.box, { aspect: 1.35, min: 260, max: 460 }), P = V.plane(c, { equal: true });
    if (mode === 'iterate') {
      var S = { m: o.method === 'gauss-seidel' ? 'gs' : 'jacobi', swap: !!o.swap, n: M.max(0, M.round(o.steps)) }, x0 = o.x0.map(function (v) { return nval(v, 0); });
      function sys() { return S.swap ? { A: [A0[1].slice(), A0[0].slice()], b: [b0[1], b0[0]] } : { A: A0, b: b0 }; }
      function iterates(N) {
        var Y = sys(), A = Y.A, b = Y.b, x = x0.slice(), out = [x.slice()];
        for (var k = 0; k < N; k++) {
          if (S.m === 'jacobi') x = [(b[0] - A[0][1] * x[1]) / A[0][0], (b[1] - A[1][0] * x[0]) / A[1][1]];
          else { var nx = (b[0] - A[0][1] * x[1]) / A[0][0]; x = [nx, (b[1] - A[1][0] * nx) / A[1][1]]; }
          if (!isFinite(x[0] + x[1]) || nInf(x) > 1e7) break; out.push(x.slice());
        }
        return out;
      }
      if (F.edit) {
        V.seg(F.ctl, { label: 'Method', items: [['jacobi', 'Jacobi'], ['gs', 'Gauss–Seidel']], value: S.m, change: function (v) { S.m = v; draw(); } });
        check(F.ctl, 'swap the equations', S.swap, function (v) { S.swap = v; draw(); });
        V.button(F.ctl, 'Step ▶', function () { S.n = M.min(60, S.n + 1); draw(); }, 'pri');
        V.button(F.ctl, 'Reset', function () { S.n = 0; draw(); });
      }
      c.cv.setAttribute('aria-label', 'Two lines and the path of the iteration toward their crossing.');
      var draw = function () {
        var Y = sys(), A = Y.A, sol = solve2(A0, b0), its = iterates(S.n), Rr = 2;
        its.forEach(function (p) { Rr = M.max(Rr, 1.15 * nInf([p[0] - sol[0], p[1] - sol[1]])); }); Rr = M.min(Rr, 1e4);
        P.set({ xmin: sol[0] - Rr, xmax: sol[0] + Rr, ymin: sol[1] - Rr * 0.75, ymax: sol[1] + Rr * 0.75 });
        var K = Kc(); P.clear(); P.grid(); P.axes();
        lineAB(P, A0[0][0], A0[0][1], b0[0], { color: K.blue, width: 2.5 }); lineAB(P, A0[1][0], A0[1][1], b0[1], { color: K.red, width: 2.5 });
        var pts = [];
        its.forEach(function (p, i) { if (i === 0) { pts.push(p); return; } if (S.m === 'gs') pts.push([p[0], its[i - 1][1]]); pts.push(p); });
        if (pts.length > 1) P.poly(pts, { color: K.orange, width: 2, close: false });
        its.forEach(function (p, i) { P.point(p[0], p[1], { color: i === its.length - 1 ? K.orange : K.ink, r: i === its.length - 1 ? 5 : 3 }); });
        P.point(sol[0], sol[1], { color: K.green, r: 5, hollow: true });
        var d0 = M.abs(A[0][0]) > M.abs(A[0][1]), d1 = M.abs(A[1][1]) > M.abs(A[1][0]), rj = M.sqrt(M.abs(A[0][1] * A[1][0] / (A[0][0] * A[1][1]))), rho = S.m === 'jacobi' ? rj : rj * rj;
        var last = its[its.length - 1], err = nInf([last[0] - sol[0], last[1] - sol[1]]);
        F.out.set((S.m === 'jacobi' ? 'Jacobi updates both coordinates at once (straight moves).' : 'Gauss–Seidel updates x, then uses the new x for y (a staircase between the lines).') + ' The rows are ' + (d0 && d1 ? '<b>diagonally dominant</b>' : '<b>not</b> diagonally dominant') + ' in this order.' +
          (F.quiet ? '' : ' Spectral radius ρ = ' + fs(rho, 3) + (rho < 1 ? ' < 1: the error shrinks by about that factor each sweep.' : ' > 1: the iterates move away.') + ' After ' + (its.length - 1) + ' sweep' + (its.length === 2 ? '' : 's') + ': (' + fs(last[0], 4) + ', ' + fs(last[1], 4) + '), error ' + fs(err, 3) + '.'));
      };
      redrawOn(c, draw); draw();
      return { update: function (q) { Object.assign(o, q); draw(); } };
    }

    // perturb
    var T = { d1: 0, d2: 0, xt: null }, sol0 = solve2(A0, b0), Ai = inv2n(A0), pct = nval(o.pct, 1), bInf = nInf(b0);
    var worst = mInf(Ai) * bInf * pct / 100, Rv = M.max(1.5, 1.3 * worst, 0.6 * nInf(sol0));
    P.set({ xmin: sol0[0] - Rv, xmax: sol0[0] + Rv, ymin: sol0[1] - Rv * 0.75, ymax: sol0[1] + Rv * 0.75 });
    T.xt = [sol0[0] + Rv * 0.45, sol0[1] - Rv * 0.45 * (A0[0][0] / (A0[0][1] || 1))];
    var H = F.edit ? handles(c, P, [{ get: function () { return T.xt; }, set: function (x, y) { T.xt = [x, y]; } }], function () { draw2(); }) : null;
    c.cv.setAttribute('aria-label', 'Two lines, their crossing, and a candidate point you can move with the arrow keys.');
    if (F.edit) {
      V.slider(F.ctl, { label: 'change in b₁ (% of ‖b‖)', min: -pct, max: pct, step: pct / 50, value: 0, fmt: function (v) { return minus(v.toFixed(2)) + '%'; }, input: function (v) { T.d1 = v; draw2(); } });
      V.slider(F.ctl, { label: 'change in b₂ (% of ‖b‖)', min: -pct, max: pct, step: pct / 50, value: 0, fmt: function (v) { return minus(v.toFixed(2)) + '%'; }, input: function (v) { T.d2 = v; draw2(); } });
    }
    var draw2 = function () {
      var K = Kc(), db = [T.d1 / 100 * bInf, T.d2 / 100 * bInf], b1 = [b0[0] + db[0], b0[1] + db[1]], x1 = solve2(A0, b1), dx = [x1[0] - sol0[0], x1[1] - sol0[1]];
      P.clear(); P.grid(); P.axes();
      lineAB(P, A0[0][0], A0[0][1], b0[0], { color: K.blue, width: 2.5 }); lineAB(P, A0[1][0], A0[1][1], b0[1], { color: K.red, width: 2.5 });
      if (db[0] || db[1]) { lineAB(P, A0[0][0], A0[0][1], b1[0], { color: K.blue, width: 1.8, dash: [6, 5] }); lineAB(P, A0[1][0], A0[1][1], b1[1], { color: K.red, width: 1.8, dash: [6, 5] }); P.point(x1[0], x1[1], { color: K.orange, r: 5 }); }
      P.point(sol0[0], sol0[1], { color: K.green, r: 5 });
      var xt = T.xt, res = [b0[0] - (A0[0][0] * xt[0] + A0[0][1] * xt[1]), b0[1] - (A0[1][0] * xt[0] + A0[1][1] * xt[1])], er = [sol0[0] - xt[0], sol0[1] - xt[1]];
      if (F.edit) { knob(c.ctx, P.X(xt[0]), P.Y(xt[1]), K.purple); if (H) H.ring(c.ctx); }
      var nm = o.norm === '2' ? n2 : nInf, nmS = o.norm === '2' ? '₂' : '∞', sv = sv2(A0), kInf = mInf(A0) * mInf(Ai), k2 = sv[0] / sv[1];
      var relb = nm(db) / nm(b0), relx = nm(dx) / nm(sol0);
      F.out.set('Blue and red lines: the two equations; green dot: the solution (' + (F.quiet ? '…' : fs(sol0[0], 4) + ', ' + fs(sol0[1], 4)) + ').' + (F.quiet ? '' :
        ' κ∞(A) = ' + fs(kInf, 3) + ', κ₂(A) = ' + fs(k2, 3) + '.' + (db[0] || db[1] ? ' Relative change in b: ' + fs(relb, 3) + '; in x: ' + fs(relx, 3) + ' (' + fs(relb ? relx / relb : 0, 3) + ' times as big).' : ' Move the sliders to nudge b.') +
        (F.edit ? ' Purple point x̃: residual ‖b − Ax̃‖' + nmS + ' = ' + fs(nm(res), 3) + ', error ‖x − x̃‖' + nmS + ' = ' + fs(nm(er), 3) + '.' : '')));
    };
    redrawOn(c, draw2); draw2();
    return { update: function (q) { Object.assign(o, q); draw2(); } };
  });

  // ================================================================ num-interp
  function baryW(xs) { return xs.map(function (xj, j) { var w = 1; xs.forEach(function (xk, k) { if (k !== j) w /= (xj - xk); }); return w; }); }
  function baryEval(xs, ys, w, x) { var num = 0, den = 0; for (var j = 0; j < xs.length; j++) { var d = x - xs[j]; if (d === 0) return ys[j]; var t = w[j] / d; num += t * ys[j]; den += t; } return num / den; }
  function naturalM(xs, ys) { // second derivatives of the natural cubic spline (Thomas algorithm)
    var n = xs.length - 1, h = [], i; for (i = 0; i < n; i++) h.push(xs[i + 1] - xs[i]);
    var Mv = new Array(n + 1).fill(0); if (n < 2) return Mv;
    var a = [], b = [], c = [], d = [];
    for (i = 1; i < n; i++) { a.push(h[i - 1]); b.push(2 * (h[i - 1] + h[i])); c.push(h[i]); d.push(6 * ((ys[i + 1] - ys[i]) / h[i] - (ys[i] - ys[i - 1]) / h[i - 1])); }
    for (i = 1; i < b.length; i++) { var m = a[i] / b[i - 1]; b[i] -= m * c[i - 1]; d[i] -= m * d[i - 1]; }
    var x = new Array(b.length); for (i = b.length - 1; i >= 0; i--) x[i] = (d[i] - (i < b.length - 1 ? c[i] * x[i + 1] : 0)) / b[i];
    for (i = 1; i < n; i++) Mv[i] = x[i - 1]; return Mv;
  }
  function seg(xs, x) { var i = 0; while (i < xs.length - 2 && x > xs[i + 1]) i++; return i; }
  function splineAt(xs, ys, Mv, x, der) { var i = seg(xs, x), h = xs[i + 1] - xs[i], A = xs[i + 1] - x, B = x - xs[i]; if (der === 2) return (Mv[i] * A + Mv[i + 1] * B) / h; return Mv[i] * A * A * A / (6 * h) + Mv[i + 1] * B * B * B / (6 * h) + (ys[i] / h - Mv[i] * h / 6) * A + (ys[i + 1] / h - Mv[i + 1] * h / 6) * B; }
  function fdSlopes(xs, ys) { var n = xs.length; return xs.map(function (_, i) { if (i === 0) return (ys[1] - ys[0]) / (xs[1] - xs[0]); if (i === n - 1) return (ys[n - 1] - ys[n - 2]) / (xs[n - 1] - xs[n - 2]); return (ys[i + 1] - ys[i - 1]) / (xs[i + 1] - xs[i - 1]); }); }
  function hermAt(xs, ys, ds, x, der) { var i = seg(xs, x), h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, y0 = ys[i], y1 = ys[i + 1], m0 = ds[i] * h, m1 = ds[i + 1] * h;
    if (der === 2) return ((12 * t - 6) * y0 + (6 * t - 4) * m0 + (6 - 12 * t) * y1 + (6 * t - 2) * m1) / (h * h);
    var t2 = t * t, t3 = t2 * t; return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * m1; }
  V.register('num-interp', function (el, o) {
    o = Object.assign({ f: null, points: null, n: 7, nodes: 'equal', interval: [-1, 1], show: ['p', 'error'], mode: 'poly', basis: 1 }, o || {});
    var mode = o.mode, F = frame(el, o, { poly: 'Polynomial interpolation and its error', basis: 'A Lagrange basis polynomial', table: 'A divided-difference table', spline: 'A natural cubic spline and its second derivative' }[mode] || 'Interpolation');
    var fsrc = o.f || (o.points ? null : '1/(1+25x^2)'), fn = fsrc ? cfun(fsrc, ['x']) : null, a = nval(o.interval[0], -1), b = nval(o.interval[1], 1);
    var pts0 = o.points ? o.points.map(function (p) { return [nval(p[0], 0), nval(p[1], 0)]; }) : null;

    if (mode === 'table') {
      var tp = pts0 || [[0, 1], [1, 3], [3, 2], [4, 5]], xs = tp.map(function (p) { return p[0]; }), ys = tp.map(function (p) { return p[1]; }), n = xs.length;
      var T = [ys.slice()]; for (var j = 1; j < n; j++) { var col = []; for (var i = 0; i + j < n; i++) col.push((T[j - 1][i + 1] - T[j - 1][i]) / (xs[i + j] - xs[i])); T.push(col); }
      var order = []; for (j = 1; j < n; j++) for (i = 0; i + j < n; i++) order.push([j, i]);
      var St = { k: F.edit ? 0 : order.length }, view = mk('div', ''); F.box.appendChild(view);
      if (F.edit) { V.button(F.ctl, 'Next entry ▶', function () { St.k = M.min(order.length, St.k + 1); render(); }, 'pri'); V.button(F.ctl, 'Fill all', function () { St.k = order.length; render(); }); V.button(F.ctl, 'Clear', function () { St.k = 0; render(); }); }
      var fmtv = function (v) { return F.quiet ? '?' : minus(+v.toPrecision(6)); };
      var render = function () {
        var cur = St.k > 0 ? order[St.k - 1] : null, shown = {}; order.slice(0, St.k).forEach(function (q) { shown[q[0] + ',' + q[1]] = 1; });
        var head = ['i', '<i>x<sub>i</sub></i>', 'f[x<sub>i</sub>]'].concat(T.slice(1).map(function (_, jj) { return (jj + 1) + (jj ? 'th' : 'st') + ' diff.'; }).map(function (s, jj) { return ['1st', '2nd', '3rd'][jj] ? ['1st', '2nd', '3rd'][jj] + ' order' : (jj + 1) + 'th order'; }));
        var rows = []; for (var i2 = 0; i2 < n; i2++) { var cells = [i2, '<span class="' + (cur && i2 >= cur[1] && i2 <= cur[1] + cur[0] && (i2 === cur[1] || i2 === cur[1] + cur[0]) ? 'nv-ok' : '') + '">' + minus(xs[i2]) + '</span>', minus(ys[i2])]; for (var j2 = 1; j2 < n; j2++) cells.push(i2 + j2 < n && shown[j2 + ',' + i2] ? fmtv(T[j2][i2]) : i2 + j2 < n ? '·' : ''); rows.push({ cells: cells }); }
        view.innerHTML = tableHTML(head, rows);
        if (cur) { var tds = view.querySelectorAll('tbody tr')[cur[1]].children; tds[2 + cur[0]].classList.add('cur'); for (var r = cur[1]; r <= cur[1] + cur[0]; r++) view.querySelectorAll('tbody tr')[r].children[1].classList.add('span'); }
        if (!cur) { F.out.set('Each entry divides the difference of its two neighbors on the left by the gap between the x-values at the two ends of its span. Press "Next entry".'); return; }
        var jj = cur[0], ii = cur[1];
        F.out.set('f[x<sub>' + ii + '</sub>, …, x<sub>' + (ii + jj) + '</sub>] = (' + (jj === 1 ? minus(ys[ii + 1]) + ' − ' + minus(ys[ii]) : fmtv(T[jj - 1][ii + 1]) + ' − ' + fmtv(T[jj - 1][ii])) + ') / (' + minus(xs[ii + jj]) + ' − ' + minus(xs[ii]) + ')' + (F.quiet ? '' : ' = <b>' + fmtv(T[jj][ii]) + '</b>') + '. The denominator uses the two end x-values of the span (highlighted), not neighbors.' + (St.k === order.length && !F.quiet ? ' The top entries ' + T.map(function (cc) { return fmtv(cc[0]); }).join(', ') + ' are the Newton-form coefficients.' : ''));
      };
      render();
      return { update: function (q) { Object.assign(o, q); render(); } };
    }

    if (mode === 'spline') {
      var sp = (pts0 || [[0, 1], [1, 2.5], [2, 1.2], [3, 3], [4, 2.2]]).map(function (p) { return p.slice(); }), Ss = { herm: true };
      var top = F.canvas(F.box, { aspect: 1.9, min: 200, max: 360 }), bot = F.canvas(F.box, { aspect: 3.2, min: 130, max: 200 }); bot.cv.style.marginTop = '6px'; bot.cv.setAttribute('aria-hidden', 'true');
      var xs2 = sp.map(function (p) { return p[0]; }), xa = xs2[0], xb = xs2[xs2.length - 1], padx = (xb - xa) * 0.06;
      var Pt = V.plane(top, { xmin: xa - padx, xmax: xb + padx, ymin: -1, ymax: 5 }), Pb = V.plane(bot, { xmin: xa - padx, xmax: xb + padx, ymin: -10, ymax: 10 });
      var Hs = F.edit ? handles(top, Pt, sp.map(function (p) { return { get: function () { return p; }, set: function (x, y) { p[1] = M.round(y * 10) / 10; }, step: 0.1, stepY: 0.1 }; }), function () { draw(); }) : null;
      top.cv.setAttribute('aria-label', 'Data points and the natural cubic spline through them.' + (F.edit ? ' Up and down arrow keys move the selected point; Enter picks the next one.' : ''));
      if (F.edit) check(F.ctl, 'compare: values and slopes only', Ss.herm, function (v) { Ss.herm = v; draw(); });
      var draw = function () {
        var K = V.colors(), ys2 = sp.map(function (p) { return p[1]; }), Mv = naturalM(xs2, ys2), ds = fdSlopes(xs2, ys2), lo = M.min.apply(null, ys2), hi = M.max.apply(null, ys2), pad = M.max(1, (hi - lo) * 0.35);
        Pt.set({ ymin: lo - pad, ymax: hi + pad }); Pt.clear(); Pt.grid(); Pt.axes();
        if (Ss.herm) Pt.plot(function (x) { return x < xa || x > xb ? NaN : hermAt(xs2, ys2, ds, x); }, { color: K.orange, width: 2, dash: [7, 5] });
        Pt.plot(function (x) { return x < xa || x > xb ? NaN : splineAt(xs2, ys2, Mv, x); }, { color: K.blue, width: 3 });
        sp.forEach(function (p) { if (F.edit) knob(top.ctx, Pt.X(p[0]), Pt.Y(p[1]), K.ink); else Pt.point(p[0], p[1], { color: K.ink, r: 5 }); }); if (Hs) Hs.ring(top.ctx);
        // second derivatives below
        var s2 = [], h2 = []; for (var t = 0; t <= 400; t++) { var x = xa + (xb - xa) * t / 400; s2.push(splineAt(xs2, ys2, Mv, x, 2)); if (Ss.herm) { h2.push(hermAt(xs2, ys2, ds, M.min(x, xb - 1e-9), 2)); } }
        var ext = M.max(1, M.max.apply(null, s2.concat(h2).map(M.abs)) * 1.15); Pb.set({ ymin: -ext, ymax: ext }); Pb.clear(); Pb.grid(); Pb.axes();
        if (Ss.herm) for (var i = 0; i < xs2.length - 1; i++) { (function (i) { Pb.plot(function (x) { return x < xs2[i] || x > xs2[i + 1] ? NaN : hermAt(xs2, ys2, ds, M.min(M.max(x, xs2[i] + 1e-9), xs2[i + 1] - 1e-9), 2); }, { color: K.orange, width: 2, dash: [7, 5] }); })(i); }
        Pb.plot(function (x) { return x < xa || x > xb ? NaN : splineAt(xs2, ys2, Mv, x, 2); }, { color: K.blue, width: 2.5 });
        txt(bot.ctx, 'second derivative', 8, 10, { size: 11 });
        var jumps = []; if (Ss.herm) for (i = 1; i < xs2.length - 1; i++) { var L = hermAt(xs2, ys2, ds, xs2[i] - 1e-9, 2), Rg = hermAt([xs2[i], xs2[i + 1]], [ys2[i], ys2[i + 1]], [ds[i], ds[i + 1]], xs2[i] + 1e-9, 2); jumps.push(M.abs(Rg - L)); }
        F.out.set('Blue: the natural cubic spline. Its second derivative (below) is continuous and is 0 at both ends.' + (Ss.herm ? ' Orange dashed: cubic pieces that match only values and slopes; their second derivative jumps at the knots' + (F.quiet ? '.' : ' (jumps ' + jumps.map(function (j2) { return fs(j2, 3); }).join(', ') + ').') : ''));
      };
      redrawOn(top, draw); redrawOn(bot, draw); draw();
      return { update: function (q) { Object.assign(o, q); draw(); } };
    }

    // poly and basis modes
    var Sx = { n: clamp(M.round(o.n), 2, 21), nodes: o.nodes, k: M.round(o.basis) };
    var showE = (o.show || []).indexOf('error') >= 0, showW = (o.show || []).indexOf('omega') >= 0;
    var c1 = F.canvas(F.box, { aspect: 1.8, min: 220, max: 380 }), c2 = mode === 'poly' && (showE || showW) ? F.canvas(F.box, { aspect: 3.2, min: 120, max: 190 }) : null;
    if (c2) { c2.cv.style.marginTop = '6px'; c2.cv.setAttribute('aria-hidden', 'true'); }
    c1.cv.setAttribute('aria-hidden', 'true');
    var P1 = V.plane(c1, { xmin: a - (b - a) * 0.04, xmax: b + (b - a) * 0.04, ymin: -1, ymax: 2 }), P2 = c2 ? V.plane(c2, { xmin: a - (b - a) * 0.04, xmax: b + (b - a) * 0.04, ymin: -1, ymax: 1 }) : null;
    if (F.edit && !pts0) {
      V.slider(F.ctl, { label: 'nodes', min: 2, max: 21, step: 1, value: Sx.n, fmt: function (v) { return String(v); }, input: function (v) { Sx.n = v; if (Sx.k >= v) Sx.k = v - 1; draw(); } });
      V.seg(F.ctl, { label: 'Node spacing', items: [['equal', 'equally spaced'], ['chebyshev', 'Chebyshev']], value: Sx.nodes, change: function (v) { Sx.nodes = v; draw(); } });
    }
    if (F.edit && mode === 'basis') { var bsl = V.slider(F.ctl, { label: 'which L_k', min: 0, max: 20, step: 1, value: Sx.k, fmt: function (v) { return 'k = ' + v; }, input: function (v) { Sx.k = M.min(v, nodesX().length - 1); draw(); } }); }
    function nodesX() { if (pts0) return pts0.map(function (p) { return p[0]; }); var n = Sx.n, out = []; for (var i = 0; i < n; i++) out.push(Sx.nodes === 'chebyshev' ? (a + b) / 2 + (b - a) / 2 * M.cos((2 * (n - 1 - i) + 1) * PI / (2 * n)) : a + (b - a) * i / (n - 1)); return out; }
    var draw = function () {
      var K = V.colors(), xs = nodesX(), ys = pts0 ? pts0.map(function (p) { return p[1]; }) : xs.map(fn), w = baryW(xs), p = function (x) { return baryEval(xs, ys, w, x); };
      if (mode === 'basis') {
        var kk = clamp(Sx.k, 0, xs.length - 1), e = xs.map(function (_, j) { return j === kk ? 1 : 0; });
        P1.set({ ymin: -1.2, ymax: 1.8 }); P1.clear(); P1.grid(); P1.axes();
        xs.forEach(function (_, j) { if (j === kk) return; var ej = xs.map(function (__, i) { return i === j ? 1 : 0; }); P1.plot(function (x) { return x < a || x > b ? NaN : baryEval(xs, ej, w, x); }, { color: K.muted, width: 1 }); });
        P1.plot(function (x) { return x < a || x > b ? NaN : baryEval(xs, e, w, x); }, { color: K.blue, width: 3 });
        xs.forEach(function (x, j) { P1.point(x, j === kk ? 1 : 0, { color: j === kk ? K.blue : K.red, r: 5 }); });
        F.out.set('L<sub>' + kk + '</sub> (blue) is 1 at x<sub>' + kk + '</sub> = ' + fs(xs[kk], 4) + ' and 0 at every other node (red dots); the gray curves are the other basis polynomials. p(x) = Σ y<sub>j</sub>L<sub>j</sub>(x) then passes through every data point.');
        return;
      }
      var fx = fn || p, lo = 1e9, hi = -1e9; for (var t = 0; t <= 200; t++) { var x = a + (b - a) * t / 200, v = fx(x); if (isFinite(v)) { lo = M.min(lo, v); hi = M.max(hi, v); } }
      ys.forEach(function (y) { lo = M.min(lo, y); hi = M.max(hi, y); }); var padY = M.max(0.3, (hi - lo) * 0.45);
      P1.set({ ymin: lo - padY, ymax: hi + padY }); P1.clear(); P1.grid(); P1.axes();
      if (fn) P1.plot(function (x) { return x < a || x > b ? NaN : fn(x); }, { color: K.muted, width: 4 });
      P1.plot(function (x) { return x < a || x > b ? NaN : p(x); }, { color: K.blue, width: 2.5 });
      xs.forEach(function (x, i) { P1.point(x, ys[i], { color: K.red, r: 4 }); });
      var maxE = 0, maxW = 0, errs = [], oms = [];
      for (t = 0; t <= 600; t++) { x = a + (b - a) * t / 600; var er = fn ? fn(x) - p(x) : 0, om = xs.reduce(function (s, xi) { return s * (x - xi); }, 1); errs.push([x, er]); oms.push([x, om]); maxE = M.max(maxE, M.abs(er)); maxW = M.max(maxW, M.abs(om)); }
      if (P2) {
        var ext = M.max(maxE, 1e-16) * 1.15; P2.set({ ymin: -ext, ymax: ext }); P2.clear(); P2.grid(); P2.axes({ labels: false });
        if (showW) P2.plot(function (x) { return x < a || x > b ? NaN : xs.reduce(function (s, xi) { return s * (x - xi); }, 1) / maxW * maxE; }, { color: K.purple, width: 1.8, dash: [6, 5] });
        if (showE && fn) P2.plot(function (x) { return x < a || x > b ? NaN : fn(x) - p(x); }, { color: K.red, width: 2.2 });
        txt(c2.ctx, (showE ? 'error f − p' : '') + (showE && showW ? ' and ' : '') + (showW ? 'ω(x), scaled' : ''), 8, 10, { size: 11 });
      }
      F.out.set('Gray: f(x) = ' + pf(fsrc || 'data') + '; blue: the interpolating polynomial of degree ' + (xs.length - 1) + ' through ' + xs.length + ' ' + (Sx.nodes === 'chebyshev' && !pts0 ? 'Chebyshev' : 'equally spaced') + ' nodes.' + (F.quiet ? '' : ' Largest error on the interval: ' + fs(maxE, 3) + '; largest |ω(x)| = ' + fs(maxW, 3) + '.') + (Sx.nodes !== 'chebyshev' && xs.length > 9 && fn ? ' Notice the swings near the ends.' : ''));
    };
    redrawOn(c1, draw); if (c2) redrawOn(c2, draw); draw();
    return { update: function (q) { Object.assign(o, q); draw(); } };
  });

  // ================================================================ num-stability
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function cdiv(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function cabs(a) { return M.hypot(a[0], a[1]); }
  function Ramp(m, z) { // amplification factor R(z) of each method for y' = λy, z = hλ (complex)
    if (m === 'euler') return [1 + z[0], z[1]];
    if (m === 'backward') return cdiv([1, 0], [1 - z[0], -z[1]]);
    var z2 = cmul(z, z); if (m === 'heun') return [1 + z[0] + z2[0] / 2, z[1] + z2[1] / 2];
    var z3 = cmul(z2, z), z4 = cmul(z3, z); return [1 + z[0] + z2[0] / 2 + z3[0] / 6 + z4[0] / 24, z[1] + z2[1] / 2 + z3[1] / 6 + z4[1] / 24];
  }
  var SNAME = { euler: 'forward Euler', backward: 'backward Euler', heun: 'Heun', rk4: 'RK4' }, SCOL = { euler: 'orange', backward: 'green', heun: 'purple', rk4: 'teal' };
  V.register('num-stability', function (el, o) {
    o = Object.assign({ mode: 'ode', lambda: -10, h: 0.15, T: 2, methods: ['euler', 'backward'], region: true, r: 0.4, N: 20, init: 'bump', steps: 0 }, o || {});
    var mode = o.mode, F = frame(el, o, mode === 'heat' ? 'The explicit heat scheme on a rod' : mode === 'stiff' ? 'A stiff equation solved with forward and backward Euler' : 'Step size and stability for y′ = λy');

    if (mode === 'heat') {
      var N = clamp(M.round(o.N), 5, 60), S = { r: nval(o.r, 0.4), n: M.max(0, M.round(o.steps)) }, xs = [];
      for (var i = 0; i <= N + 1; i++) xs.push(i / (N + 1));
      function init() { return xs.map(function (x, i) { if (i === 0 || i === N + 1) return 0; var v = o.init === 'sine' ? M.sin(PI * x) : o.init === 'step' ? (x > 0.3 && x < 0.7 ? 1 : 0) : M.exp(-60 * (x - 0.5) * (x - 0.5)); return v + 1e-6 * (i % 2 ? 1 : -1); }); }
      var c = F.canvas(F.box, { aspect: 2, min: 200, max: 340 }), P = V.plane(c, { xmin: -0.03, xmax: 1.03, ymin: -1.3, ymax: 1.3 }); c.cv.setAttribute('aria-hidden', 'true');
      var anim = null;
      if (F.edit) {
        V.slider(F.ctl, { label: 'r = kΔt/Δx²', min: 0.05, max: 0.8, step: 0.01, value: S.r, fmt: function (v) { return v.toFixed(2); }, input: function (v) { S.r = v; draw(); } });
        V.button(F.ctl, 'Step', function () { S.n++; draw(); });
        V.button(F.ctl, V.reduced ? '+10 steps' : '▶ Run 40 steps', function () { if (V.reduced) { S.n += 10; draw(); return; } if (anim) return; var target = S.n + 40, acc = 0; anim = V.loop(el, function (dt) { acc += dt; if (acc < 0.06) return; acc = 0; S.n++; draw(); if (S.n >= target) { anim.stop(); anim = null; } }); }, 'pri');
        V.button(F.ctl, 'Reset', function () { S.n = 0; draw(); });
      }
      var draw = function () {
        var K = V.colors(), u = init(), u0 = u.slice();
        for (var s = 0; s < S.n; s++) { var nu = u.slice(); for (var i = 1; i <= N; i++) nu[i] = u[i] + S.r * (u[i + 1] - 2 * u[i] + u[i - 1]); u = nu; if (!isFinite(u[1])) break; }
        P.clear(); P.grid(); P.axes({ labels: false });
        P.poly(xs.map(function (x, i) { return [x, u0[i]]; }), { color: K.muted, width: 1.4, dash: [4, 4], close: false });
        P.poly(xs.map(function (x, i) { return [x, clamp(u[i], -50, 50)]; }), { color: K.blue, width: 2.5, close: false });
        xs.forEach(function (x, i) { P.point(x, clamp(u[i], -1.29, 1.29), { color: K.blue, r: 2.5 }); });
        txt(c.ctx, 'step ' + S.n, 8, 10, { size: 11 });
        var g = 1 - 4 * S.r * M.pow(M.sin(N * PI / (2 * (N + 1))), 2), mx = M.max.apply(null, u.map(M.abs));
        F.out.set('Each step replaces u<sub>i</sub> by u<sub>i</sub> + r(u<sub>i+1</sub> − 2u<sub>i</sub> + u<sub>i−1</sub>), with r = ' + S.r.toFixed(2) + '. Gray dashed: the start (with a tiny sawtooth of size 10⁻⁶ added, like round-off).' +
          (F.quiet ? '' : ' The fastest-wiggling pattern is multiplied by ' + fs(g, 3) + ' each step: ' + (M.abs(g) <= 1 ? '<b>stable</b> (r ≤ 1/2).' : '<b>unstable</b>; after ' + S.n + ' steps it has grown by about ' + fs(M.pow(M.abs(g), S.n), 2) + '.')) + (mx > 1.3 ? ' Values now reach ' + fs(mx, 2) + ' (off the chart).' : ''));
      };
      redrawOn(c, draw); draw();
      return { update: function (q) { Object.assign(o, q); draw(); } };
    }

    if (mode === 'stiff') {
      var St = { h: nval(o.h, 0.03) }, TT = nval(o.T, 1.5), cs = F.canvas(F.box, { aspect: 1.9, min: 220, max: 380 }), Ps = V.plane(cs, { xmin: -0.03, xmax: TT * 1.02, ymin: -1, ymax: 2 }); cs.cv.setAttribute('aria-hidden', 'true');
      var yex = function (t) { return (2500 * M.cos(t) + 50 * M.sin(t)) / 2501 - 2500 / 2501 * M.exp(-50 * t); };
      if (F.edit) V.slider(F.ctl, { label: 'step h', min: 0.005, max: 0.08, step: 0.001, value: St.h, fmt: function (v) { return v.toFixed(3); }, input: function (v) { St.h = v; drawS(); } });
      var drawS = function () {
        var K = V.colors(), h = St.h, n = M.floor(TT / h + 1e-9), fe = [[0, 0]], be = [[0, 0]], y = 0, z = 0;
        for (var i = 0; i < n; i++) { var t = i * h; y = y + h * (-50 * (y - M.cos(t))); z = (z + 50 * h * M.cos(t + h)) / (1 + 50 * h); fe.push([t + h, y]); be.push([t + h, z]); }
        Ps.clear(); Ps.grid(); Ps.axes();
        Ps.plot(function (t) { return t < 0 || t > TT ? NaN : yex(t); }, { color: K.muted, width: 4 });
        Ps.poly(fe.map(function (p) { return [p[0], clamp(p[1], -5, 5)]; }), { color: K.orange, width: 1.8, close: false });
        Ps.poly(be, { color: K.green, width: 1.8, close: false });
        fe.forEach(function (p) { Ps.point(p[0], clamp(p[1], -0.99, 1.99), { color: K.orange, r: 2.5 }); }); be.forEach(function (p) { Ps.point(p[0], p[1], { color: K.green, r: 2.5 }); });
        var g = 1 - 50 * h;
        F.out.set('y′ = −50(y − cos t), y(0) = 0. After a quick start the solution (gray) is just a smooth curve near cos t, so accuracy would allow big steps. <span class="nv-bad">Forward Euler</span> (orange) multiplies errors by 1 − 50h' + (F.quiet ? '' : ' = ' + fs(g, 3) + (M.abs(g) <= 1 ? ': stable.' : ': <b>unstable</b>, since h > 2/50 = 0.04.')) + ' <span class="nv-ok">Backward Euler</span> (green) divides by 1 + 50h and is stable for every h.');
      };
      redrawOn(cs, drawS); drawS();
      return { update: function (q) { Object.assign(o, q); drawS(); } };
    }

    // ode mode
    var lam = Array.isArray(o.lambda) ? [nval(o.lambda[0], -10), nval(o.lambda[1], 0)] : [nval(o.lambda, -10), 0], So = { h: nval(o.h, 0.15) }, T2 = nval(o.T, 2), meths = (o.methods || ['euler']).filter(function (m) { return SNAME[m]; });
    var la = cabs(lam), hmax = clamp(Array.isArray(o.lambda) ? 5 / la : 5 / la, 0.02, T2 / 2);
    var grid = mk('div', o.region === false ? '' : 'nv-two'); F.box.appendChild(grid);
    var left = mk('div', ''), right = mk('div', ''); grid.appendChild(left); if (o.region !== false) grid.appendChild(right);
    var cl = V.canvas(left, { aspect: 1.45, min: 200, max: 360, height: o.height }), Pl = V.plane(cl, { xmin: -T2 * 0.03, xmax: T2 * 1.02, ymin: -1.6, ymax: 1.6 }); cl.cv.setAttribute('aria-hidden', 'true');
    var cr = o.region === false ? null : V.canvas(right, { aspect: 1.1, min: 200, max: 330 }), Pr = cr ? V.plane(cr, { xmin: -4.2, xmax: 1.6, ymin: -3, ymax: 3, equal: true }) : null; if (cr) cr.cv.setAttribute('aria-hidden', 'true');
    if (F.edit) V.slider(F.ctl, { label: 'step h', min: 0.005, max: hmax, step: hmax / 200, value: M.min(So.h, hmax), fmt: function (v) { return v.toFixed(3); }, input: function (v) { So.h = v; drawO(); } });
    left.insertAdjacentHTML('beforeend', keyHTML([[V.colors().muted, 'exact'], ].concat(meths.map(function (m) { return [V.colors()[SCOL[m]], SNAME[m], 'p']; }))));
    var regionCache = {};
    function region(m) { // offscreen image of the stability region on the right canvas
      var key = m + cr.w + 'x' + cr.h + (D.documentElement.getAttribute('data-theme') || ''); if (regionCache[key]) return regionCache[key];
      var K = V.colors(), off = D.createElement('canvas'); off.width = cr.w; off.height = cr.h; var ctx = off.getContext('2d'); ctx.fillStyle = K[SCOL[m] + 'Soft'];
      for (var py = 0; py < cr.h; py += 2) for (var px = 0; px < cr.w; px += 2) { var z = [Pr.x(px + 1), Pr.y(py + 1)]; if (cabs(Ramp(m, z)) <= 1) ctx.fillRect(px, py, 2, 2); }
      regionCache[key] = off; return off;
    }
    var drawO = function () {
      var K = V.colors(), h = So.h, n = M.floor(T2 / h + 1e-9), z = [h * lam[0], h * lam[1]];
      Pl.clear(); Pl.grid(); Pl.axes();
      Pl.plot(function (t) { return t < 0 || t > T2 ? NaN : M.exp(lam[0] * t) * M.cos(lam[1] * t); }, { color: K.muted, width: 4 });
      meths.forEach(function (m) { var R = Ramp(m, z), y = [1, 0], pts = [[0, 1]]; for (var i = 1; i <= n; i++) { y = cmul(y, R); pts.push([i * h, y[0]]); } Pl.poly(pts.map(function (p) { return [p[0], clamp(p[1], -3, 3)]; }), { color: K[SCOL[m]], width: 1.6, close: false }); pts.forEach(function (p) { Pl.point(p[0], clamp(p[1], -1.58, 1.58), { color: K[SCOL[m]], r: 3 }); }); });
      if (cr) {
        Pr.clear(); Pr.grid(); Pr.axes({ x: 'Re', y: 'Im' });
        if (o.region !== false) meths.forEach(function (m) { cr.ctx.drawImage(region(m), 0, 0, cr.w, cr.h); });
        meths.forEach(function (m) { if (m === 'euler') Pr.circle(-1, 0, 1, { color: K.orange, width: 1.5 }); if (m === 'backward') Pr.circle(1, 0, 1, { color: K.green, width: 1.5, dash: [5, 4] }); });
        Pr.point(clamp(z[0], -4.1, 1.5), clamp(z[1], -2.9, 2.9), { color: K.red, r: 6 });
        pill(cr.ctx, 'hλ = ' + (z[1] ? fs(z[0], 3) + (z[1] < 0 ? ' − ' : ' + ') + fs(M.abs(z[1]), 3) + 'i' : fs(z[0], 3)), Pr.X(clamp(z[0], -4.1, 1.5)), Pr.Y(clamp(z[1], -2.9, 2.9)) - 18, K.red, { W: cr.w });
        txt(cr.ctx, 'shaded: |R(hλ)| ≤ 1', 6, cr.h - 8, { size: 11 });
      }
      var lim = lam[1] ? 2 * M.abs(lam[0]) / (la * la) : 2 / M.abs(lam[0]);
      var parts = meths.map(function (m) { var a = cabs(Ramp(m, z)); return SNAME[m] + ': |R| = ' + fs(a, 3) + (a <= 1 + 1e-12 ? ', stable' : ', <b>unstable</b>'); });
      F.out.set('y′ = λy with λ = ' + (lam[1] ? fs(lam[0], 3) + (lam[1] < 0 ? ' − ' : ' + ') + fs(M.abs(lam[1]), 3) + 'i' : fs(lam[0], 3)) + ', y(0) = 1; gray: the exact solution, which decays. Each step multiplies y by R(hλ).' + (F.quiet ? '' : ' ' + parts.join('; ') + '. Forward Euler needs h ≤ ' + fs(lim, 3) + '.'));
    };
    redrawOn(cl, drawO); if (cr) redrawOn(cr, drawO); drawO();
    return { update: function (q) { Object.assign(o, q); drawO(); } };
  });
  // ================================================================ num-eigen
  function charPoly(A) { // c[0..n] with det(λI − A) = Σ c_k λ^k (Faddeev–LeVerrier)
    var n = A.length, Mk = eyeN(n).map(function (r) { return r.map(function () { return 0; }); }), c = new Array(n + 1); c[n] = 1;
    for (var k = 1; k <= n; k++) {
      var AM = mmulN(A, Mk); for (var i = 0; i < n; i++) AM[i][i] += c[n - k + 1];
      Mk = AM; var AMk = mmulN(A, Mk), tr = 0; for (i = 0; i < n; i++) tr += AMk[i][i];
      c[n - k] = -tr / k;
    }
    return c;
  }
  function polyRoots(c) { // roots [re, im] of the monic polynomial Σ c_k z^k (Durand–Kerner, then cleaned)
    var n = c.length - 1, R = 1, k, i, j; for (k = 0; k < n; k++) R = M.max(R, 1 + M.abs(c[k]));
    if (n === 1) return [[-c[0], 0]];
    var z = []; for (k = 0; k < n; k++) { var ang = 2 * PI * k / n + 0.4; z.push([0.6 * R * M.cos(ang), 0.6 * R * M.sin(ang)]); }
    function pv(w) { var p = [1, 0]; for (var q = n - 1; q >= 0; q--) p = [p[0] * w[0] - p[1] * w[1] + c[q], p[0] * w[1] + p[1] * w[0]]; return p; }
    for (var it = 0; it < 2000; it++) {
      var mv = 0;
      for (i = 0; i < n; i++) { var den = [1, 0]; for (j = 0; j < n; j++) if (j !== i) den = cmul(den, [z[i][0] - z[j][0], z[i][1] - z[j][1]]); var d = cdiv(pv(z[i]), den); if (!isFinite(d[0] + d[1])) d = [1e-3 * R, 1e-3 * R]; z[i] = [z[i][0] - d[0], z[i][1] - d[1]]; mv = M.max(mv, M.abs(d[0]) + M.abs(d[1])); }
      if (mv < 1e-15 * R) break;
    }
    return z.map(function (w) { return [w[0], M.abs(w[1]) < 1e-7 * R ? 0 : w[1]]; });
  }
  function eigvals(A) { // sorted by size, largest first; symmetric matrices give real values
    var sym = A.every(function (r, i) { return r.every(function (v, j) { return M.abs(v - A[j][i]) < 1e-12 * (1 + M.abs(v)); }); });
    var z = polyRoots(charPoly(A)); if (sym) z = z.map(function (w) { return [w[0], 0]; });
    return z.sort(function (a, b) { return cabs(b) - cabs(a) || b[0] - a[0] || b[1] - a[1]; });
  }
  function cstr(w, sig) { return w[1] === 0 ? fs(w[0], sig) : fs(w[0], sig) + (w[1] < 0 ? ' − ' : ' + ') + fs(M.abs(w[1]), sig) + 'i'; }
  function qrGS(A) { // modified Gram–Schmidt A = QR with R having a nonnegative diagonal
    var n = A.length, Q = A.map(function (r) { return r.slice(); }), R = eyeN(n).map(function (r) { return r.map(function () { return 0; }); });
    for (var j = 0; j < n; j++) {
      var s = 0, i, k; for (i = 0; i < n; i++) s += Q[i][j] * Q[i][j]; s = M.sqrt(s); R[j][j] = s;
      if (s === 0) continue; for (i = 0; i < n; i++) Q[i][j] /= s;
      for (k = j + 1; k < n; k++) { var d = 0; for (i = 0; i < n; i++) d += Q[i][j] * Q[i][k]; R[j][k] = d; for (i = 0; i < n; i++) Q[i][k] -= d * Q[i][j]; }
    }
    return { Q: Q, R: R };
  }
  var EIG_PRESETS = {
    power: [['third', 'ratio 1/3', [[2, 1], [1, 2]]], ['slow', 'ratio 0.9', [[1.9, 0.1], [0.1, 1.9]]], ['tie', 'λ = 2 and −2', [[0, 2], [2, 0]]], ['turn', 'complex λ', [[1, -2], [2, 1]]]],
    gershgorin: [['sep', 'separate disks', [[10, 1, -1], [1, 0, 2], [0, 1, -6]]], ['over', 'overlapping disks', [[0, 1], [4, 2]]], ['cplx', 'a complex pair', [[2, 3, 0], [-2, 1, 0.5], [0, 1, 6]]]]
  };
  V.register('num-eigen', function (el, o) {
    o = Object.assign({ mode: 'power', A: null, x0: [1, 0], steps: 0, inverse: false, shift: 0, presets: false, cols: false, wrong: false }, o || {});
    var mode = o.mode === 'gershgorin' || o.mode === 'qr' ? o.mode : 'power';
    var F = frame(el, o, mode === 'power' ? (o.inverse ? 'Inverse iteration with a shift' : 'The power method on a 2 by 2 matrix') : mode === 'gershgorin' ? 'Gershgorin disks and eigenvalues' : 'The QR algorithm, step by step');
    function readA(def, nmin, nmax) { var A = Array.isArray(o.A) && o.A.length >= nmin && o.A.length <= nmax ? o.A : def; return A.map(function (r) { return r.slice(0, A.length).map(function (v) { return nval(v, 0); }); }); }

    // ---------------------------------------------------------------- power (and inverse) iteration
    if (mode === 'power') {
      var S = { A: readA([[2, 1], [1, 2]], 2, 2), x0: [nval(o.x0[0], 1), nval(o.x0[1], 0)], n: clamp(M.round(nval(o.steps, 0)), 0, 40), inv: !!o.inverse, s: nval(o.shift, 0) };
      var grid = mk('div', 'nv-two'); F.box.appendChild(grid);
      var left = mk('div', ''), right = mk('div', ''); grid.appendChild(left); grid.appendChild(right);
      var c = V.canvas(left, { aspect: 1, min: 240, max: 380, height: o.height }), P = V.plane(c, { xmin: -1.45, xmax: 1.45, ymin: -1.45, ymax: 1.45, equal: true });
      c.cv.setAttribute('aria-label', 'The iterates as arrows ending on the square where the largest entry is 1. Arrow keys move the starting vector.');
      var H = F.edit ? handles(c, P, [{ get: function () { return S.x0; }, set: function (x, y) { var m = M.max(M.abs(x), M.abs(y)) || 1; S.x0 = [M.round(x / m * 20) / 20, M.round(y / m * 20) / 20]; } }], function () { draw(); }) : null;
      var tbl = mk('div', ''); right.appendChild(tbl);
      var mg = null, ssl = null;
      if (F.edit) {
        mg = matGrid(F.ctl, S.A, function (A) { S.A = A; setShift(); draw(); }, 'A');
        V.button(F.ctl, 'Step ▶', function () { S.n = M.min(40, S.n + 1); draw(); }, 'pri');
        V.button(F.ctl, 'Reset', function () { S.n = 0; draw(); });
        if (o.presets) V.seg(F.ctl, { label: 'Examples', items: EIG_PRESETS.power.map(function (p) { return [p[0], p[1]]; }), value: '', change: function (v) { var p = EIG_PRESETS.power.filter(function (q) { return q[0] === v; })[0]; S.A = p[2].map(function (r) { return r.slice(); }); mg.set(S.A); S.x0 = v === 'tie' ? [1, 0.5] : [1, 0]; S.n = 0; setShift(); draw(); } });
        if (S.inv) ssl = V.slider(F.ctl, { label: 'shift s', min: -2, max: 6, step: 0.05, value: S.s, fmt: function (v) { return minus(v.toFixed(2)); }, input: function (v) { S.s = v; draw(); } });
      }
      var setShift = function () { if (!ssl) return; var ev = eigvals(S.A), re = ev.map(function (w) { return w[0]; }), lo = M.floor(M.min.apply(null, re) - 1.5), hi = M.ceil(M.max.apply(null, re) + 1.5); ssl.input.min = lo; ssl.input.max = hi; S.s = clamp(S.s, lo, hi); ssl.set(S.s); };
      setShift();
      var iterate = function () {
        var A = S.A, B = A, its = [{ x: S.x0.slice(), mu: null }], note = '';
        if (S.inv) { B = [[A[0][0] - S.s, A[0][1]], [A[1][0], A[1][1] - S.s]]; var dt = B[0][0] * B[1][1] - B[0][1] * B[1][0]; if (M.abs(dt) < 1e-13 * (1 + M.abs(B[0][0] * B[1][1]))) return { its: its, note: 'The shift is an eigenvalue, so A − sI is singular. Move s a little.' }; }
        var x = S.x0.slice();
        for (var k = 0; k < S.n; k++) {
          var y = S.inv ? solve2(B, x) : [A[0][0] * x[0] + A[0][1] * x[1], A[1][0] * x[0] + A[1][1] * x[1]];
          var mu = M.abs(y[0]) >= M.abs(y[1]) ? y[0] : y[1]; if (mu === 0 || !isFinite(mu)) { note = 'The product is the zero vector: the start has no part along any eigenvector that survives.'; break; }
          x = [y[0] / mu, y[1] / mu]; its.push({ x: x.slice(), mu: mu });
        }
        return { its: its, note: note };
      };
      var draw = function () {
        var K = V.colors(), A = S.A, ev = eigvals(A), R0 = iterate(), its = R0.its, ctx = c.ctx;
        P.clear(); P.grid({ step: 0.5 }); P.axes({ step: 0.5 });
        P.poly([[-1, -1], [1, -1], [1, 1], [-1, 1]], { color: K.muted, width: 1.4, dash: [4, 4] });
        var real = ev.every(function (w) { return w[1] === 0; }), vecs = [];
        if (real) ev.forEach(function (w, i) { var a = A[0][0] - w[0], b = A[0][1], cc = A[1][0], d = A[1][1] - w[0], v = M.abs(a) + M.abs(b) > M.abs(cc) + M.abs(d) ? [-b, a] : [-d, cc]; if (M.abs(v[0]) + M.abs(v[1]) < 1e-12) v = i ? [0, 1] : [1, 0]; var m = M.hypot(v[0], v[1]); v = [v[0] / m, v[1] / m]; vecs.push(v); P.seg(-2 * v[0], -2 * v[1], 2 * v[0], 2 * v[1], { color: i === 0 ? K.green : K.purple, width: 1.6, dash: [7, 5] }); });
        its.forEach(function (it, i) { var last = i === its.length - 1, col = last ? K.orange : K.blue; ctx.save(); ctx.globalAlpha = last ? 1 : 0.25 + 0.6 * (i + 1) / its.length; P.arrow(0, 0, it.x[0], it.x[1], { color: col, width: last ? 3 : 1.8 }); ctx.restore(); });
        its.forEach(function (it, i) { if (its.length > 6 && i < its.length - 4 && i > 0) return; P.text('x' + String(i).split('').map(function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }).join(''), it.x[0], it.x[1], { color: i === its.length - 1 ? K.orange : K.muted, size: 12, dx: it.x[0] >= 0 ? 6 : -22, dy: it.x[1] >= 0 ? -10 : 12, bold: true }); });
        if (H) { knob(ctx, P.X(S.x0[0]), P.Y(S.x0[1]), K.ink); H.ring(ctx); }
        txt(ctx, 'dashed square: largest entry = 1', 8, c.h - 10, { size: 11 });
        // table
        var head = ['k', '<i>x</i><sub>k</sub>'].concat(F.quiet ? [] : ['μ<sub>k</sub>']).concat(S.inv && !F.quiet ? ['<i>s</i> + 1/μ<sub>k</sub>'] : []);
        var rows = its.slice(-9).map(function (it) { var k = its.indexOf(it); return { cells: [k, '(' + fs(it.x[0], 4) + ', ' + fs(it.x[1], 4) + ')'].concat(F.quiet ? [] : [it.mu === null ? '—' : fs(it.mu, 6)]).concat(S.inv && !F.quiet ? [it.mu === null ? '—' : fs(S.s + 1 / it.mu, 6)] : []), cls: k === its.length - 1 ? 'hi' : '' }; });
        tbl.innerHTML = tableHTML(head, rows, ['', 'nv-mono', 'nv-mono', 'nv-mono']);
        // readout
        var msg = '', l1 = ev[0], l2 = ev[1], target = null;
        if (R0.note) msg = R0.note + ' ';
        if (!real) msg += 'The eigenvalues are complex (' + (F.quiet ? 'a pair a ± bi' : cstr(l1, 3) + ' and ' + cstr(l2, 3)) + '), equal in size: no single direction wins, so the iterates keep turning.';
        else if (!S.inv) {
          var tie = M.abs(M.abs(l1[0]) - M.abs(l2[0])) < 1e-9 * M.max(1, M.abs(l1[0]));
          if (tie) msg += 'The two eigenvalues have the same size' + (F.quiet ? '' : ' (' + fs(l1[0], 4) + ' and ' + fs(l2[0], 4) + ')') + ': neither part fades, so the iterates never settle.';
          else { target = vecs[0]; msg += F.quiet ? 'Green dashed line: the dominant eigenvector; purple: the other one.' : 'Eigenvalues ' + fs(l1[0], 4) + ' and ' + fs(l2[0], 4) + ' (green and purple lines). The error shrinks by about |λ₂/λ₁| = ' + fs(M.abs(l2[0] / l1[0]), 3) + ' each step.'; }
        } else {
          var d = ev.map(function (w) { return M.abs(w[0] - S.s); }), near = d[0] <= d[1] ? 0 : 1, far = 1 - near;
          var tieS = M.abs(d[0] - d[1]) < 1e-9; if (!tieS) target = vecs[near];
          msg += 'Shift s = ' + minus(S.s.toFixed(2)) + '. ' + (tieS ? 'The shift is exactly halfway between the eigenvalues: neither wins.' : F.quiet ? 'The iterates turn toward the eigenvector of the eigenvalue nearest the shift.' : 'Eigenvalues ' + fs(ev[0][0], 4) + ' and ' + fs(ev[1][0], 4) + '; the nearest to s is ' + fs(ev[near][0], 4) + ' (its eigenvector is the ' + (near === 0 ? 'green' : 'purple') + ' line). Error ratio per step: ' + fs(d[near], 3) + '/' + fs(d[far], 3) + ' = ' + fs(d[near] / d[far], 3) + '.');
        }
        var lastIt = its[its.length - 1];
        if (target && !F.quiet && its.length > 1) { var tgt = target, xv = lastIt.x, cosA = M.abs(xv[0] * tgt[0] + xv[1] * tgt[1]) / M.hypot(xv[0], xv[1]); msg += ' After ' + (its.length - 1) + ' step' + (its.length === 2 ? '' : 's') + ', x is ' + fs(M.acos(M.min(1, cosA)) * 180 / PI, 3) + '° from that line.'; }
        F.out.set(msg);
      };
      redrawOn(c, draw); draw();
      return { update: function (q) { Object.assign(o, q); draw(); } };
    }

    // ---------------------------------------------------------------- Gershgorin disks
    if (mode === 'gershgorin') {
      var G = { A: readA([[10, 1, -1], [1, 0, 2], [0, 1, -6]], 2, 4), cols: !!o.cols };
      var cg = F.canvas(F.box, { aspect: 2.1, min: 200, max: 380 }), Pg = V.plane(cg, { equal: true }); cg.cv.setAttribute('aria-hidden', 'true');
      var info = mk('div', ''); F.after(info);
      var mgG = null, gHold = mk('div', '');
      if (F.edit) {
        F.ctl.appendChild(gHold); mgG = matGrid(gHold, G.A, function (A) { G.A = A; drawG(); }, 'A');
        check(F.ctl, 'column disks too', G.cols, function (v) { G.cols = v; drawG(); });
        if (o.presets) V.seg(F.ctl, { label: 'Examples', items: EIG_PRESETS.gershgorin.map(function (p) { return [p[0], p[1]]; }), value: '', change: function (v) { var p = EIG_PRESETS.gershgorin.filter(function (q) { return q[0] === v; })[0]; G.A = p[2].map(function (r) { return r.slice(); }); gHold.innerHTML = ''; mgG = matGrid(gHold, G.A, function (A) { G.A = A; drawG(); }, 'A'); drawG(); } });
      }
      var COLS = ['blue', 'red', 'teal', 'gold'];
      var drawG = function () {
        var K = V.colors(), A = G.A, n = A.length, ev = eigvals(A);
        var disks = A.map(function (r, i) { return { c: r[i], r: r.reduce(function (s, v, j) { return j === i ? s : s + M.abs(v); }, 0) }; });
        var cdisks = A.map(function (_, j) { return { c: A[j][j], r: A.reduce(function (s, row, i) { return i === j ? s : s + M.abs(row[j]); }, 0) }; });
        var all = disks.concat(G.cols ? cdisks : []), xmin = 1e9, xmax = -1e9, ymax = 0.5;
        all.forEach(function (d) { xmin = M.min(xmin, d.c - d.r); xmax = M.max(xmax, d.c + d.r); ymax = M.max(ymax, d.r); });
        ev.forEach(function (w) { xmin = M.min(xmin, w[0]); xmax = M.max(xmax, w[0]); ymax = M.max(ymax, M.abs(w[1])); });
        var padx = 0.12 * (xmax - xmin) + 0.5; Pg.set({ xmin: xmin - padx, xmax: xmax + padx, ymin: -ymax * 1.15 - 0.3, ymax: ymax * 1.15 + 0.3 });
        Pg.clear(); Pg.grid(); Pg.axes({ x: 'Re', y: 'Im' });
        disks.forEach(function (d, i) { Pg.circle(d.c, 0, M.max(d.r, 1e-9), { color: K[COLS[i]], width: 2.2, fill: K[COLS[i] + 'Soft'] }); Pg.point(d.c, 0, { color: K[COLS[i]], r: 3.5 }); });
        if (G.cols) cdisks.forEach(function (d, i) { Pg.circle(d.c, 0, M.max(d.r, 1e-9), { color: K[COLS[i]], width: 1.6, dash: [6, 5] }); });
        disks.forEach(function (d, i) { pill(cg.ctx, 'row ' + (i + 1), Pg.X(d.c), Pg.Y(0) - (Pg.Y(0) - Pg.Y(d.r)) - 12 - 0 * i, K[COLS[i]], { W: cg.w, size: 11 }); });
        if (!F.quiet) ev.forEach(function (w) { Pg.point(w[0], w[1], { color: K.ink, r: 5 }); });
        // groups of touching disks and their eigenvalue counts
        var parent = disks.map(function (_, i) { return i; }); function fnd(i) { return parent[i] === i ? i : (parent[i] = fnd(parent[i])); }
        for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) if (M.abs(disks[i].c - disks[j].c) <= disks[i].r + disks[j].r + 1e-12) parent[fnd(i)] = fnd(j);
        var groups = {}; disks.forEach(function (_, i2) { var g = fnd(i2); (groups[g] = groups[g] || []).push(i2); });
        var inDisk = function (w, d) { return M.hypot(w[0] - d.c, w[1]) <= d.r + 1e-9 * (1 + d.r); };
        var lines = disks.map(function (d, i2) { var cnt = ev.filter(function (w) { return inDisk(w, d); }).length; return '<span style="color:' + K[COLS[i2]] + '">●</span> row ' + (i2 + 1) + ': center ' + fs(d.c, 4) + ', radius ' + fs(d.r, 4) + (F.quiet ? '' : ' (holds ' + cnt + ' eigenvalue' + (cnt === 1 ? '' : 's') + ')'); });
        info.innerHTML = '<div class="nv-card">' + lines.join('<br>') + '</div>';
        var gtxt = Object.keys(groups).map(function (g) { var ids = groups[g]; return ids.length === 1 ? 'disk ' + (ids[0] + 1) + ' stands alone, so it holds exactly 1' : 'disks ' + ids.map(function (q) { return q + 1; }).join(', ') + ' touch, so together they hold exactly ' + ids.length; });
        gtxt[0] = gtxt[0].charAt(0).toUpperCase() + gtxt[0].slice(1);
        F.out.set('Each disk: center a<sub>ii</sub>, radius = sum of the other |a<sub>ij</sub>| in row i. ' + gtxt.join('; ') + '.' + (F.quiet ? '' : ' Eigenvalues (dots): ' + ev.map(function (w) { return cstr(w, 4); }).join(', ') + '.'));
      };
      redrawOn(cg, drawG); drawG();
      return { update: function (q) { Object.assign(o, q); drawG(); } };
    }

    // ---------------------------------------------------------------- the QR algorithm
    var Qs = { A0: readA([[4, 1, 1], [1, 3, 1], [1, 1, 2]], 2, 4), k: 0, wrong: !!o.wrong, hist: null };
    var view = mk('div', 'nv-scroll'); F.box.appendChild(view);
    var cq = V.canvas(F.box, { aspect: 2.4, min: 150, max: 230, height: o.height }); cq.cv.setAttribute('aria-hidden', 'true');
    function reset() { Qs.k = 0; Qs.hist = [{ A: Qs.A0.map(function (r) { return r.slice(); }) }]; }
    function stepQR() { var cur = Qs.hist[Qs.hist.length - 1].A, f = qrGS(cur), nx = Qs.wrong ? mmulN(f.Q, f.R) : mmulN(f.R, f.Q); Qs.hist[Qs.hist.length - 1].Q = f.Q; Qs.hist[Qs.hist.length - 1].R = f.R; Qs.hist.push({ A: nx }); Qs.k++; }
    reset(); for (var st0 = clamp(M.round(nval(o.steps, 0)), 0, 80); st0 > 0; st0--) stepQR();
    var mgQ = null;
    if (F.edit) {
      mgQ = matGrid(F.ctl, Qs.A0, function (A) { Qs.A0 = A; reset(); drawQ(); }, 'A₀');
      V.button(F.ctl, 'Step ▶', function () { if (Qs.k < 80) stepQR(); drawQ(); }, 'pri');
      V.button(F.ctl, '+10 steps', function () { for (var t = 0; t < 10 && Qs.k < 80; t++) stepQR(); drawQ(); });
      V.button(F.ctl, 'Reset', function () { reset(); drawQ(); });
      check(F.ctl, 'wrong order: Aₖ₊₁ = QₖRₖ', Qs.wrong, function (v) { Qs.wrong = v; reset(); drawQ(); });
    }
    var SUBC = ['orange', 'purple', 'teal'];
    var drawQ = function () {
      var K = V.colors(), A0 = Qs.A0, n = A0.length, ev = eigvals(A0), cur = Qs.hist[Qs.hist.length - 1].A, prev = Qs.hist.length > 1 ? Qs.hist[Qs.hist.length - 2] : null;
      var cls = function (i, j, v) { return i === j ? 'dg' : i > j ? (M.abs(v) < 1e-10 ? 'z' : 'lo') : ''; };
      var fmt = function (v, i, j) { return i > j && M.abs(v) < 1e-14 ? '0' : fs(v, 4); };
      var sub = String(Qs.k).split('').map(function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }).join(''), subp = String(Qs.k - 1).split('').map(function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }).join('');
      var html = '<div class="nv-eq">';
      if (prev && prev.Q && Qs.k < 4) html += mgrp('Q' + subp + ' =', mtxHTML(prev.Q, function (v) { return fs(v, 3); })) + mgrp('R' + subp + ' =', mtxHTML(prev.R, function (v, i, j) { return i > j ? '0' : fs(v, 3); }, function (i, j) { return i > j ? 'z' : ''; })) + '</div><div class="nv-eq">';
      html += mgrp('A' + sub + ' = ' + (Qs.k === 0 ? '' : Qs.wrong ? 'Q' + subp + 'R' + subp + ' =' : 'R' + subp + 'Q' + subp + ' ='), mtxHTML(cur, fmt, cls, 'A' + sub)) + '</div>';
      view.innerHTML = html;
      // plot of |subdiagonal entries| against k (log scale)
      var ctx = cq.ctx, padL = 46, padB = 26, padT = 10, padR = 10, W2 = cq.w - padL - padR, H2 = cq.h - padT - padB, kmax = M.max(10, Qs.k);
      var series = []; for (var i = 1; i < n; i++) series.push(Qs.hist.map(function (h) { return M.log10(M.max(M.abs(h.A[i][i - 1]), 1e-17)); }));
      var ytop = M.ceil(M.max(0, M.max.apply(null, series.map(function (s) { return M.max.apply(null, s); })))), vmin = M.min.apply(null, series.map(function (s) { return M.min.apply(null, s); })), ybot = M.max(-16, M.min(ytop - 4, M.floor(vmin) - 1)), gstep = ytop - ybot > 10 ? 4 : ytop - ybot > 5 ? 2 : 1;
      var X = function (k) { return padL + W2 * k / kmax; }, Y = function (v) { return padT + H2 * (ytop - v) / (ytop - ybot); };
      ctx.save(); ctx.fillStyle = K.bg; ctx.fillRect(0, 0, cq.w, cq.h); ctx.strokeStyle = K.grid; ctx.lineWidth = 1; ctx.beginPath();
      for (var gy = ytop; gy >= ybot; gy -= gstep) { ctx.moveTo(padL, M.round(Y(gy)) + 0.5); ctx.lineTo(padL + W2, M.round(Y(gy)) + 0.5); }
      ctx.stroke(); ctx.strokeStyle = K.axis; ctx.strokeRect(padL, padT, W2, H2);
      for (gy = ytop; gy >= ybot; gy -= gstep) txt(ctx, '10' + sup(gy), padL - 4, Y(gy), { align: 'right', size: 10 });
      txt(ctx, 'step k', padL + W2 / 2, cq.h - 6, { align: 'center', size: 11 }); txt(ctx, '0', X(0), padT + H2 + 9, { align: 'center', size: 10 }); txt(ctx, String(kmax), X(kmax), padT + H2 + 9, { align: 'center', size: 10 });
      series.forEach(function (s, si) { var col = K[SUBC[si]]; ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); s.forEach(function (v, k) { if (k) ctx.lineTo(X(k), Y(v)); else ctx.moveTo(X(k), Y(v)); }); ctx.stroke(); ctx.fillStyle = col; s.forEach(function (v, k) { if (s.length < 30 || k === s.length - 1) { ctx.beginPath(); ctx.arc(X(k), Y(v), 2.6, 0, 2 * PI); ctx.fill(); } }); });
      series.forEach(function (s, si) { pill(ctx, '|a' + (si + 2) + (si + 1) + '|', padL + 8 + si * 58, padT + 12, K[SUBC[si]], { W: cq.w, size: 11, align: 'left' }); });
      ctx.restore();
      var real = ev.every(function (w) { return w[1] === 0; }), msg;
      if (Qs.wrong) msg = 'Multiplying the factors back in the same order rebuilds A' + sub + ' itself: nothing changes from step to step.';
      else {
        msg = 'Step ' + Qs.k + '. Each Aₖ is similar to A₀ (same trace ' + fs(cur.reduce(function (s, r, i2) { return s + r[i2]; }, 0), 5) + ').';
        if (!F.quiet) {
          msg += ' Eigenvalues of A₀: ' + ev.map(function (w) { return cstr(w, 4); }).join(', ') + '.';
          if (real) { var rates = []; for (var i3 = 1; i3 < n; i3++) rates.push('|a' + (i3 + 1) + i3 + '| by about ' + fs(M.abs(ev[i3][0] / ev[i3 - 1][0]), 3)); msg += ' Per step, ' + rates.join(', ') + ': the lines in the plot fall at these rates.'; }
          else msg += ' A complex pair cannot settle into a 1 × 1 diagonal entry: it stays as a 2 × 2 block, and the entry below it does not shrink.';
        }
      }
      F.out.set(msg);
    };
    redrawOn(cq, drawQ); drawQ();
    return { update: function (q) { Object.assign(o, q); drawQ(); } };
  });
  // ================================================================ num-system, more modes: cost, lu, norms, lsq, bvp
  function gcdI(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function ratStr(v, maxq) { // p/q when v is (up to round-off) a fraction with a small denominator, else 4 significant digits
    if (!isFinite(v)) return fs(v);
    var tol = 1e-9 * M.max(1, M.abs(v));
    if (M.abs(v - M.round(v)) < tol) return minus(String(M.round(v) || 0));
    for (var q = 2; q <= (maxq || 60); q++) { var p = M.round(v * q); if (M.abs(v - p / q) < tol) { var g = gcdI(M.abs(p), q); return (p < 0 ? '−' : '') + M.abs(p) / g + '/' + q / g; } }
    return fs(v, 4);
  }
  function timeStr(t) { if (t < 1e-3) return fs(t * 1e6, 3) + ' µs'; if (t < 1) return fs(t * 1e3, 3) + ' ms'; if (t < 120) return fs(t, 3) + ' s'; if (t < 7200) return fs(t / 60, 3) + ' min'; if (t < 172800) return fs(t / 3600, 3) + ' hours'; if (t < 6.3e7) return fs(t / 86400, 3) + ' days'; return fs(t / 3.156e7, 3) + ' years'; }
  function intStr(n) { return M.round(n).toLocaleString('en-US'); }
  function vecStr(v, f) { return '(' + v.map(function (x) { return (f || ratStr)(x); }).join(', ') + ')'; }
  function luPP(A) { // PA = LU with partial pivoting: {perm, L, U, sing}
    var n = A.length, U = A.map(function (r) { return r.slice(); }), L = eyeN(n), perm = [], sing = false, i, j, k;
    for (i = 0; i < n; i++) perm.push(i);
    for (k = 0; k < n; k++) {
      var p = k; for (i = k + 1; i < n; i++) if (M.abs(U[i][k]) > M.abs(U[p][k])) p = i;
      if (p !== k) { var t = U[k]; U[k] = U[p]; U[p] = t; t = perm[k]; perm[k] = perm[p]; perm[p] = t; for (j = 0; j < k; j++) { t = L[k][j]; L[k][j] = L[p][j]; L[p][j] = t; } }
      if (M.abs(U[k][k]) < 1e-14) { sing = true; continue; }
      for (i = k + 1; i < n; i++) { var m = U[i][k] / U[k][k]; L[i][k] = m; for (j = k; j < n; j++) U[i][j] -= m * U[k][j]; U[i][k] = 0; }
    }
    return { perm: perm, L: L, U: U, sing: sing };
  }
  function triSolve(T, b, lower) { var n = b.length, x = new Array(n), i, j; if (lower) for (i = 0; i < n; i++) { var s = b[i]; for (j = 0; j < i; j++) s -= T[i][j] * x[j]; x[i] = s / T[i][i]; } else for (i = n - 1; i >= 0; i--) { s = b[i]; for (j = i + 1; j < n; j++) s -= T[i][j] * x[j]; x[i] = s / T[i][i]; } return x; }
  function lsqHouse(Ain, bin) { // least squares by Householder QR
    var A = Ain.map(function (r) { return r.slice(); }), b = bin.slice(), m = A.length, n = A[0].length, i, j, k, d;
    for (k = 0; k < n; k++) {
      var s = 0; for (i = k; i < m; i++) s += A[i][k] * A[i][k]; s = M.sqrt(s);
      var alpha = A[k][k] > 0 ? -s : s, v = []; for (i = 0; i < m; i++) v.push(i < k ? 0 : A[i][k]); v[k] -= alpha;
      var vv = 0; for (i = k; i < m; i++) vv += v[i] * v[i]; if (vv === 0) continue;
      for (j = k; j < n; j++) { d = 0; for (i = k; i < m; i++) d += v[i] * A[i][j]; d = 2 * d / vv; for (i = k; i < m; i++) A[i][j] -= d * v[i]; }
      d = 0; for (i = k; i < m; i++) d += v[i] * b[i]; d = 2 * d / vv; for (i = k; i < m; i++) b[i] -= d * v[i];
    }
    return triSolve(A.slice(0, n).map(function (r) { return r.slice(0, n); }), b.slice(0, n), false);
  }
  function lsqNormal(A, b) { // least squares by the normal equations, solved by elimination with partial pivoting
    var m = A.length, n = A[0].length, N = [], c = [], i, j, k;
    for (i = 0; i < n; i++) { N.push([]); var s = 0; for (k = 0; k < m; k++) s += A[k][i] * b[k]; c.push(s); for (j = 0; j < n; j++) { var t = 0; for (k = 0; k < m; k++) t += A[k][i] * A[k][j]; N[i].push(t); } }
    var f = luPP(N); if (f.sing) return null;
    return triSolve(f.U, triSolve(f.L, f.perm.map(function (p) { return c[p]; }), true), false);
  }
  function svdVals(Ain) { // singular values by one-sided Jacobi (accurate even for tiny ones)
    var U = Ain.map(function (r) { return r.slice(); }), m = U.length, n = U[0].length, i, p, q;
    for (var sweep = 0; sweep < 80; sweep++) {
      var off = 0;
      for (p = 0; p < n - 1; p++) for (q = p + 1; q < n; q++) {
        var al = 0, be = 0, ga = 0; for (i = 0; i < m; i++) { al += U[i][p] * U[i][p]; be += U[i][q] * U[i][q]; ga += U[i][p] * U[i][q]; }
        if (ga === 0 || al === 0 || be === 0) continue; off = M.max(off, M.abs(ga) / M.sqrt(al * be));
        var ze = (be - al) / (2 * ga), t = (ze >= 0 ? 1 : -1) / (M.abs(ze) + M.sqrt(1 + ze * ze)), cs = 1 / M.sqrt(1 + t * t), sn = cs * t;
        for (i = 0; i < m; i++) { var up = U[i][p], uq = U[i][q]; U[i][p] = cs * up - sn * uq; U[i][q] = sn * up + cs * uq; }
      }
      if (off < 1e-15) break;
    }
    var sv = []; for (var j = 0; j < n; j++) { var s2 = 0; for (i = 0; i < m; i++) s2 += U[i][j] * U[i][j]; sv.push(M.sqrt(s2)); }
    return sv.sort(function (a, b) { return b - a; });
  }
  function thomas(a, b, c, d) { // tridiagonal solve: a sub, b main, c super diagonals
    var n = b.length, cp = new Array(n), dp = new Array(n), x = new Array(n), i;
    cp[0] = c[0] / b[0]; dp[0] = d[0] / b[0];
    for (i = 1; i < n; i++) { var den = b[i] - a[i] * cp[i - 1]; cp[i] = c[i] / den; dp[i] = (d[i] - a[i] * dp[i - 1]) / den; }
    x[n - 1] = dp[n - 1]; for (i = n - 2; i >= 0; i--) x[i] = dp[i] - cp[i] * x[i + 1];
    return x;
  }
  function sysx(el, o, uo) {
    var mode = o.mode;

    // ---------------------------------------------------------------- cost
    if (mode === 'cost') {
      var F = frame(el, o, 'The cost of solving linear systems three ways'), S = { n: clamp(M.round(nval(uo.n, 1000)), 10, 1e5), k: clamp(M.round(nval(uo.k, 1)), 1, 1e4), rate: nval(uo.rate, 1e9) };
      var view = mk('div', ''); F.box.appendChild(view);
      if (F.edit) {
        V.slider(F.ctl, { label: 'size n', min: 1, max: 5, step: 0.05, value: M.log10(S.n), fmt: function (v) { return intStr(M.pow(10, v)); }, input: function (v) { S.n = M.round(M.pow(10, v)); render(); } });
        V.slider(F.ctl, { label: 'number of right-hand sides b', min: 0, max: 4, step: 0.05, value: M.log10(S.k), fmt: function (v) { return intStr(M.pow(10, v)); }, input: function (v) { S.k = M.round(M.pow(10, v)); render(); } });
      }
      var render = function () {
        var n = S.n, k = S.k, K = V.colors(), lu = 2 * n * n * n / 3 + k * 2 * n * n, inv = 2 * n * n * n + k * 2 * n * n, redo = k * (2 * n * n * n / 3 + 2 * n * n), mx = M.max(lu, inv, redo);
        var rows = [['Factor once (PA = LU), then two triangular solves per b', lu, K.green], ['Form A⁻¹, then multiply A⁻¹b for each b', inv, K.orange], ['Eliminate from scratch for each b', redo, K.red]];
        view.innerHTML = rows.map(function (r) { return '<div class="nv-cl"><span>' + r[0] + '</span>' + (F.quiet ? '' : '<b class="nv-mono">' + fs(r[1], 3) + ' ops · ' + timeStr(r[1] / S.rate) + '</b>') + '</div><div class="nv-track"><div class="nv-bar" style="--c:' + r[2] + ';width:' + M.max(0.4, 100 * r[1] / mx).toFixed(2) + '%"></div></div>'; }).join('');
        F.out.set('n = ' + intStr(n) + ', ' + intStr(k) + ' right-hand side' + (k === 1 ? '' : 's') + ', at ' + fs(S.rate, 2) + ' operations per second.' + (F.quiet ? '' : ' Elimination is about 2n³/3 = ' + fs(2 * n * n * n / 3, 3) + ' operations; each pair of triangular solves only 2n² = ' + intStr(2 * n * n) + '. Doubling n multiplies the n³ part by 8.' + (k > 1 ? ' Factoring once is ' + fs(redo / lu, 3) + ' times faster than eliminating again for every b.' : '')));
      };
      render();
      return { update: function (q) { Object.assign(o, q); render(); } };
    }

    // ---------------------------------------------------------------- lu: solving with PA = LU
    if (mode === 'lu') {
      var Fl = frame(el, o, 'Solving with PA = LU'), def = [[2, 1, -1], [-6, 3, 2], [4, -2, 5]];
      var A0 = Array.isArray(uo.A) && uo.A.length >= 2 && uo.A.length <= 4 ? uo.A.map(function (r) { return r.map(function (v) { return nval(v, 0); }); }) : def;
      var b0 = Array.isArray(uo.b) && uo.b.length === A0.length ? uo.b.map(function (v) { return nval(v, 0); }) : A0.length === 3 && !uo.A ? [3, 2, 5] : A0.map(function (r) { return r.reduce(function (s, v) { return s + v; }, 0); });
      var L0 = { A: A0, b: b0, forget: !!uo.forget };
      var viewL = mk('div', 'nv-scroll'), cardL = mk('div', ''); Fl.box.appendChild(viewL); Fl.box.appendChild(cardL);
      if (Fl.edit) {
        matGrid(Fl.ctl, L0.A, function (A) { L0.A = A; renderL(); }, 'A');
        matGrid(Fl.ctl, L0.b.map(function (v) { return [v]; }), function (B) { L0.b = B.map(function (r) { return r[0]; }); renderL(); }, 'b');
        check(Fl.ctl, 'forget to apply P to b', L0.forget, function (v) { L0.forget = v; renderL(); });
      }
      var renderL = function () {
        var A = L0.A, b = L0.b, n = A.length, f = luPP(A);
        var swaps = f.perm.every(function (p, i) { return p === i; }) ? 'no row swaps' : 'rows of A in the order ' + f.perm.map(function (p) { return p + 1; }).join(', ');
        var Pm = f.perm.map(function (p) { return A.map(function (_, j) { return j === p ? 1 : 0; }); });
        viewL.innerHTML = '<div class="nv-eq">' + mgrp('P =', mtxHTML(Pm, function (v) { return String(v); }, function (i, j, v) { return v ? 'dg' : 'z'; }, 'P')) + mgrp('L =', mtxHTML(f.L, function (v, i, j) { return j > i ? '0' : ratStr(v); }, function (i, j) { return j > i ? 'z' : ''; }, 'L')) + mgrp('U =', mtxHTML(f.U, function (v, i, j) { return i > j ? '0' : ratStr(v); }, function (i, j) { return i > j ? 'z' : ''; }, 'U')) + '</div>';
        if (f.sing) { cardL.innerHTML = '<div class="nv-card nv-bad">A zero pivot remains even after row swaps: this matrix is singular.</div>'; Fl.out.set('The matrix is singular, so Ax = b has no unique solution.'); return; }
        var Pb = f.perm.map(function (p) { return b[p]; }), rhs = L0.forget ? b : Pb, y = triSolve(f.L, rhs, true), x = triSolve(f.U, y, false), Ax = mvN(A, x);
        var ok = Ax.every(function (v, i) { return M.abs(v - b[i]) < 1e-9 * (1 + M.abs(b[i])); });
        var lines = ['<b>1.</b> ' + (L0.forget ? '<span class="nv-bad">Skipped: b used as given, ' + vecStr(b) + '.</span>' : 'Apply the same row swaps to b: Pb = ' + vecStr(Pb) + ' (' + swaps + ').'),
          '<b>2.</b> Forward substitution, Ly = ' + (L0.forget ? 'b' : 'Pb') + ': y = ' + vecStr(y) + '.',
          '<b>3.</b> Back substitution, Ux = y: ' + (Fl.quiet ? 'x = …' : 'x = <b>' + vecStr(x) + '</b>') + '.'];
        if (!Fl.quiet) lines.push('<b>Check:</b> Ax = ' + vecStr(Ax) + (ok ? ' <span class="nv-ok">✓ equals b</span>' : ' <span class="nv-bad">✗ but b = ' + vecStr(b) + '</span>'));
        cardL.innerHTML = '<div class="nv-card">' + lines.join('<br>') + '</div>';
        Fl.out.set('PA = LU, where P lists the ' + swaps + '. The factors are made once; each new b costs only the two triangular solves.' + (Fl.quiet ? '' : L0.forget ? ' Without P, L and U are solving the system with its rows in the wrong order, so x is wrong.' : ' The check Ax = b passes.'));
      };
      renderL();
      return { update: function (q) { Object.assign(o, q); renderL(); } };
    }

    // ---------------------------------------------------------------- norms
    if (mode === 'norms') {
      var Fn = frame(el, o, 'Vector norms and matrix norms as the largest stretch');
      var An = Array.isArray(uo.A) && uo.A.length === 2 ? uo.A.map(function (r) { return [nval(r[0], 0), nval(r[1], 0)]; }) : [[1, -2], [3, 4]];
      var pn = String(uo.p == null ? 'inf' : uo.p), Sn = { A: An, p: pn === '1' ? '1' : pn === '2' ? '2' : 'inf', x: Array.isArray(uo.x) ? [nval(uo.x[0], 1), nval(uo.x[1], 0.5)] : [0.6, 0.4] };
      var gridN = mk('div', 'nv-two'); Fn.box.appendChild(gridN);
      var leftN = mk('div', ''), rightN = mk('div', ''); gridN.appendChild(leftN); gridN.appendChild(rightN);
      var cn = V.canvas(leftN, { aspect: 1, min: 240, max: 400, height: o.height }), Pn = V.plane(cn, { equal: true });
      cn.cv.setAttribute('aria-label', 'The unit ball of the chosen norm, its image under A, and a vector x you can move with the arrow keys.');
      var Hn = Fn.edit ? handles(cn, Pn, [{ get: function () { return Sn.x; }, set: function (x, y) { Sn.x = [M.round(x * 20) / 20, M.round(y * 20) / 20]; } }], function () { drawN(); }) : null;
      if (Fn.edit) {
        V.seg(Fn.ctl, { label: 'Norm', items: [['1', '1-norm'], ['2', '2-norm'], ['inf', '∞-norm']], value: Sn.p, change: function (v) { Sn.p = v; drawN(); } });
        matGrid(Fn.ctl, Sn.A, function (A) { Sn.A = A; drawN(); }, 'A');
      }
      var vn = function (v, p) { return p === '1' ? M.abs(v[0]) + M.abs(v[1]) : p === '2' ? M.hypot(v[0], v[1]) : M.max(M.abs(v[0]), M.abs(v[1])); };
      var ball = function (p, r) { var pts = []; if (p === '2') { for (var t = 0; t <= 96; t++) pts.push([r * M.cos(2 * PI * t / 96), r * M.sin(2 * PI * t / 96)]); return pts; } return p === '1' ? [[r, 0], [0, r], [-r, 0], [0, -r]] : [[r, r], [-r, r], [-r, -r], [r, -r]]; };
      var drawN = function () {
        var K = V.colors(), A = Sn.A, p = Sn.p, rows = A.map(function (r) { return M.abs(r[0]) + M.abs(r[1]); }), cols = [0, 1].map(function (j) { return M.abs(A[0][j]) + M.abs(A[1][j]); }), sv = sv2(A);
        var nI = M.max(rows[0], rows[1]), n1 = M.max(cols[0], cols[1]), nA = p === '1' ? n1 : p === '2' ? sv[0] : nI, R = 1.12 * M.max(1.3, n1, nI, sv[0]);
        Pn.set({ xmin: -R, xmax: R, ymin: -R, ymax: R }); Pn.clear(); Pn.grid(); Pn.axes();
        var Ab = function (v) { return [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]]; };
        Pn.poly(ball(p, nA), { color: K.gold, width: 1.6, dash: [3, 4] });
        Pn.poly(ball(p, 1).map(Ab), { color: K.orange, width: 2, fill: K.orangeSoft });
        Pn.poly(ball(p, 1), { color: K.blue, width: 2.2, fill: K.blueSoft });
        // the vector the norm is attained at
        var xs; if (p === 'inf') { var ri = rows[0] >= rows[1] ? 0 : 1; xs = [A[ri][0] < 0 ? -1 : 1, A[ri][1] < 0 ? -1 : 1]; } else if (p === '1') xs = cols[0] >= cols[1] ? [1, 0] : [0, 1]; else { var a = A[0][0], b = A[0][1], c2 = A[1][0], d = A[1][1], ata = [[a * a + c2 * c2, a * b + c2 * d], [a * b + c2 * d, b * b + d * d]], l = sv[0] * sv[0], v1 = M.abs(ata[0][1]) > 1e-12 ? [ata[0][1], l - ata[0][0]] : ata[0][0] >= ata[1][1] ? [1, 0] : [0, 1], m = M.hypot(v1[0], v1[1]); xs = [v1[0] / m, v1[1] / m]; }
        var Axs = Ab(xs); Pn.arrow(0, 0, xs[0], xs[1], { color: K.gold, width: 2 }); Pn.arrow(0, 0, Axs[0], Axs[1], { color: K.gold, width: 2.4 });
        var x = Sn.x, Ax = Ab(x); Pn.arrow(0, 0, Ax[0], Ax[1], { color: K.orange, width: 2.4 }); Pn.arrow(0, 0, x[0], x[1], { color: K.purple, width: 2.4 });
        if (Hn) { knob(cn.ctx, Pn.X(x[0]), Pn.Y(x[1]), K.purple); Hn.ring(cn.ctx); }
        var pS = p === 'inf' ? '∞' : p === '1' ? '₁' : '₂';
        var hiR = p === 'inf' ? (rows[0] >= rows[1] ? 0 : 1) : -1, hiC = p === '1' ? (cols[0] >= cols[1] ? 0 : 1) : -1;
        var cell = function (v, cls) { return '<td' + (cls ? ' class="' + cls + '"' : '') + '>' + fs(v, 4) + '</td>'; };
        rightN.innerHTML = '<div class="mla-tbl" role="region" aria-label="Absolute row and column sums" tabindex="0"><table><thead><tr><th></th><th>col 1</th><th>col 2</th><th>|row| sum</th></tr></thead><tbody>' +
          [0, 1].map(function (i) { return '<tr><th>row ' + (i + 1) + '</th>' + cell(A[i][0]) + cell(A[i][1]) + cell(rows[i], i === hiR ? 'cur' : '') + '</tr>'; }).join('') +
          '<tr><th>|col| sum</th>' + cell(cols[0], hiC === 0 ? 'cur' : '') + cell(cols[1], hiC === 1 ? 'cur' : '') + '<td></td></tr></tbody></table></div>' +
          keyHTML([[K.blue, 'unit ball ‖x‖' + pS + ' ≤ 1'], [K.orange, 'its image under A'], [K.gold, 'radius ‖A‖' + pS, 'd'], [K.purple, 'your x', 'p']]) +
          (Fn.quiet ? '' : '<div class="nv-card">‖A‖' + pS + ' = <b>' + fs(nA, 4) + '</b><br>' + (p === 'inf' ? 'the largest absolute <b>row</b> sum (row ' + (hiR + 1) + ')' : p === '1' ? 'the largest absolute <b>column</b> sum (column ' + (hiC + 1) + ')' : 'the largest singular value σ₁ (no simple sum)') + '</div>');
        var r = vn(x, p) ? vn(Ax, p) / vn(x, p) : 0;
        Fn.out.set('x = (' + fs(x[0], 3) + ', ' + fs(x[1], 3) + '): ‖x‖₁ = ' + fs(vn(x, '1'), 3) + ', ‖x‖₂ = ' + fs(vn(x, '2'), 3) + ', ‖x‖∞ = ' + fs(vn(x, 'inf'), 3) + '.' + (Fn.quiet ? '' : ' Stretch ‖Ax‖' + pS + '/‖x‖' + pS + ' = ' + fs(r, 4) + ', never more than ‖A‖' + pS + ' = ' + fs(nA, 4) + '. The largest stretch happens at the gold vector' + (p === 'inf' ? ', a corner (±1, ±1) of the square, where one row adds up its entries\' sizes.' : p === '1' ? ', a corner ±e<sub>j</sub> of the diamond, which picks out one column.' : '.')));
      };
      redrawOn(cn, drawN); drawN();
      return { update: function (q) { Object.assign(o, q); drawN(); } };
    }

    // ---------------------------------------------------------------- lsq: QR against the normal equations
    if (mode === 'lsq') {
      var Fq = frame(el, o, 'Least squares by QR and by the normal equations'), mpts = clamp(M.round(nval(uo.m, 30)), 16, 60), dmax = 14, Sq = { d: clamp(M.round(nval(uo.degree, 6)), 1, dmax) };
      var data = [];
      for (var dg = 1; dg <= dmax; dg++) {
        var Aq = [], bq = []; for (var i = 0; i < mpts; i++) { var t = i / (mpts - 1), row = [], s = 0; for (var j = 0; j <= dg; j++) { var v = M.pow(t, j); row.push(v); s += v; } Aq.push(row); bq.push(s); }
        var sv = svdVals(Aq), kap = sv[0] / sv[sv.length - 1], xq = lsqHouse(Aq, bq), xn = lsqNormal(Aq, bq);
        var err = function (x) { if (!x) return Infinity; var e = 0; x.forEach(function (v) { e = M.max(e, M.abs(v - 1)); }); return isFinite(e) ? e : Infinity; };
        data.push({ d: dg, k: kap, eq: err(xq), en: err(xn) });
      }
      var cq2 = Fq.canvas(Fq.box, { aspect: 1.6, min: 230, max: 400 }); cq2.cv.setAttribute('aria-hidden', 'true');
      if (Fq.edit) V.slider(Fq.ctl, { label: 'degree of the polynomial', min: 1, max: dmax, step: 1, value: Sq.d, fmt: function (v) { return String(v); }, input: function (v) { Sq.d = v; drawQ2(); } });
      Fq.after(mk('div', '', keyHTML([[V.colors().green, 'QR error'], [V.colors().orange, 'normal-equations error'], [V.colors().green, 'κ(A)·ε', 'd'], [V.colors().orange, 'κ(A)²·ε', 'd']])));
      var drawQ2 = function () {
        var K = V.colors(), ctx = cq2.ctx, padL = 48, padB = 32, padT = 12, padR = 12, W2 = cq2.w - padL - padR, H2 = cq2.h - padT - padB, eps = M.pow(2, -52), ya = -17, yb = 2;
        var X = function (d) { return padL + W2 * (d - 0.5) / dmax; }, Y = function (v) { return padT + H2 * (yb - clamp(v, ya, yb)) / (yb - ya); }, lg = function (v) { return isFinite(v) ? M.log10(M.max(v, 1e-17)) : yb; };
        ctx.save(); ctx.fillStyle = K.bg; ctx.fillRect(0, 0, cq2.w, cq2.h); ctx.strokeStyle = K.grid; ctx.lineWidth = 1; ctx.beginPath();
        for (var gy = -16; gy <= yb; gy += 2) { ctx.moveTo(padL, M.round(Y(gy)) + 0.5); ctx.lineTo(padL + W2, M.round(Y(gy)) + 0.5); }
        ctx.stroke(); ctx.strokeStyle = K.axis; ctx.lineWidth = 1.5; ctx.strokeRect(padL, padT, W2, H2);
        for (gy = -16; gy <= yb; gy += 4) txt(ctx, '10' + sup(gy), padL - 5, Y(gy), { align: 'right', size: 11 });
        for (var d = 1; d <= dmax; d++) if (d % 2 === 1 || cq2.w > 420) txt(ctx, String(d), X(d), padT + H2 + 12, { align: 'center', size: 11 });
        txt(ctx, 'degree', padL + W2 / 2, cq2.h - 5, { align: 'center', size: 11 });
        ctx.save(); ctx.beginPath(); ctx.rect(padL, padT, W2, H2); ctx.clip();
        ctx.strokeStyle = K.red; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + W2, Y(0)); ctx.stroke(); ctx.setLineDash([]);
        var line = function (f, col, dash) { ctx.strokeStyle = col; ctx.lineWidth = dash ? 1.6 : 2.6; ctx.setLineDash(dash ? [6, 5] : []); ctx.beginPath(); data.forEach(function (p, i) { var px = X(p.d), py = Y(f(p)); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }); ctx.stroke(); ctx.setLineDash([]); if (!dash) { ctx.fillStyle = col; data.forEach(function (p) { ctx.beginPath(); ctx.arc(X(p.d), Y(f(p)), 3, 0, 2 * PI); ctx.fill(); }); } };
        line(function (p) { return lg(p.k * eps); }, K.green, true); line(function (p) { return lg(p.k * p.k * eps); }, K.orange, true);
        line(function (p) { return lg(p.eq); }, K.green, false); line(function (p) { return lg(p.en); }, K.orange, false);
        ctx.strokeStyle = K.ink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(Sq.d), padT); ctx.lineTo(X(Sq.d), padT + H2); ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
        pill(ctx, 'error 1: no correct digits', padL + 6, Y(0) - 11, K.red, { W: cq2.w, size: 11, align: 'left' });
        ctx.restore();
        var p = data[Sq.d - 1], dig = function (e) { return isFinite(e) && e < 1 ? M.max(0, M.floor(-M.log10(e))) : 0; };
        Fq.out.set('Fitting a polynomial of degree ' + Sq.d + ' to ' + mpts + ' points on [0, 1] whose exact coefficients are all 1.' + (Fq.quiet ? '' : ' κ₂(A) = ' + fs(p.k, 3) + ', so κ₂(AᵀA) = ' + fs(p.k * p.k, 3) + '. Largest coefficient error: QR ' + fs(p.eq, 2) + ' (about ' + dig(p.eq) + ' correct digits), normal equations ' + (isFinite(p.en) ? fs(p.en, 2) : 'no answer (AᵀA is singular in floating point)') + ' (about ' + dig(p.en) + ').'));
      };
      redrawOn(cq2, drawQ2); drawQ2();
      return { update: function (q) { Object.assign(o, q); drawQ2(); } };
    }

    // ---------------------------------------------------------------- bvp: finite differences for y'' - q y = f
    var Fb = frame(el, o, 'A boundary value problem solved by finite differences');
    var Sb = { N: clamp(M.round(nval(uo.N, 4)), 2, 40), forget: !!uo.forget }, qv = nval(uo.q, 0), aa = nval(uo.a, 0), bb = nval(uo.b, 1), ya = nval(uo.ya, 0), yb = nval(uo.yb, 1), fsrc = uo.f == null ? '0' : String(uo.f);
    var ff = cfun(fsrc, ['x']), exact = uo.exact ? cfun(uo.exact, ['x']) : null;
    var cb = Fb.canvas(Fb.box, { aspect: 1.7, min: 220, max: 400 }), Pb = V.plane(cb, {}); cb.cv.setAttribute('aria-hidden', 'true');
    var sysBox = mk('div', 'nv-scroll'); Fb.after(sysBox);
    if (Fb.edit) {
      V.slider(Fb.ctl, { label: 'number of intervals N', min: 2, max: 40, step: 1, value: Sb.N, fmt: function (v) { return String(v); }, input: function (v) { Sb.N = v; drawB(); } });
      check(Fb.ctl, 'forget the boundary values on the right side', Sb.forget, function (v) { Sb.forget = v; drawB(); });
    }
    function fdSolve(N, forget) { // interior values y_1..y_{N-1}
      var h = (bb - aa) / N, n = N - 1, sa = [], sm = [], sp = [], rhs = [];
      for (var i = 1; i <= n; i++) { var x = aa + i * h; sa.push(1); sm.push(-(2 + qv * h * h)); sp.push(1); rhs.push(h * h * ff(x) - (forget ? 0 : (i === 1 ? ya : 0) + (i === n ? yb : 0))); }
      return { h: h, y: thomas(sa, sm, sp, rhs), rhs: rhs, diag: -(2 + qv * h * h) };
    }
    var drawB = function () {
      var K = V.colors(), N = Sb.N, sol = fdSolve(N, Sb.forget), h = sol.h, xs = [], ys = [ya].concat(sol.y).concat([yb]);
      for (var i = 0; i <= N; i++) xs.push(aa + i * h);
      var ref = exact, fine = null;
      if (!ref) { var Nf = 64 * N, sf = fdSolve(Nf, false), yf = [ya].concat(sf.y).concat([yb]); fine = yf; ref = function (x) { var u = (x - aa) / (bb - aa) * Nf, k = clamp(M.floor(u), 0, Nf - 1), t = u - k; return yf[k] * (1 - t) + yf[k + 1] * t; }; }
      var lo = M.min(ya, yb), hi = M.max(ya, yb); for (i = 0; i <= 100; i++) { var vv = ref(aa + (bb - aa) * i / 100); lo = M.min(lo, vv); hi = M.max(hi, vv); } ys.forEach(function (v) { lo = M.min(lo, v); hi = M.max(hi, v); });
      var pad = 0.15 * (hi - lo || 1); Pb.set({ xmin: aa - 0.06 * (bb - aa), xmax: bb + 0.06 * (bb - aa), ymin: lo - pad, ymax: hi + pad });
      Pb.clear(); Pb.grid(); Pb.axes();
      Pb.plot(function (x) { return x < aa || x > bb ? NaN : ref(x); }, { color: K.muted, width: 4 });
      Pb.poly(xs.map(function (x, k) { return [x, ys[k]]; }), { color: K.blue, width: 1.5, close: false });
      xs.forEach(function (x, k) { if (k === 0 || k === N) return; Pb.point(x, ys[k], { color: K.blue, r: N > 20 ? 3 : 4.5 }); });
      [[aa, ya], [bb, yb]].forEach(function (p, k) { var ctx = cb.ctx, X0 = Pb.X(p[0]), Y0 = Pb.Y(p[1]); ctx.save(); ctx.strokeStyle = K.red; ctx.fillStyle = K.bg; ctx.lineWidth = 2.5; ctx.fillRect(X0 - 6, Y0 - 6, 12, 12); ctx.strokeRect(X0 - 6, Y0 - 6, 12, 12); ctx.restore(); pill(ctx, 'known: y = ' + fs(p[1], 3), X0 + (k ? -8 : 8), Y0 - 18, K.red, { W: cb.w, size: 11, align: k ? 'right' : 'left' }); });
      var errs = xs.map(function (x, k) { return M.abs(ys[k] - ref(x)); }), emax = M.max.apply(null, errs);
      // the linear system, for small N
      if (N <= 6) {
        var n = N - 1, Tm = [], cls = function (i, j) { return i === j ? 'dg' : M.abs(i - j) > 1 ? 'z' : ''; };
        for (i = 0; i < n; i++) { Tm.push([]); for (var j = 0; j < n; j++) Tm[i].push(i === j ? sol.diag : M.abs(i - j) === 1 ? 1 : 0); }
        var rh = sol.rhs.map(function (v) { return [v]; }), un = []; for (i = 1; i <= n; i++) un.push(['y' + String(i).split('').map(function (d) { return '₀₁₂₃₄₅₆₇₈₉'[+d]; }).join('')]);
        sysBox.innerHTML = '<div class="nv-eq">' + mtxHTML(Tm, function (v) { return v === 0 ? '0' : fs(v, 4); }, cls) + mtxHTML(un, function (v) { return v; }) + '<span>=</span>' + mtxHTML(rh, function (v) { return Fb.quiet ? '·' : fs(v, 4); }, function (i) { return !Sb.forget && ((i === 0 && ya) || (i === n - 1 && yb)) ? 'hl' : ''; }) + '</div><p class="nv-lab">' + (Sb.forget ? '<span class="nv-bad">The boundary values were left out of the right side, so the computed curve is pinned to 0 at both ends instead.</span>' : 'Highlighted: entries where a known boundary value moved to the right side (h²f(x₁) − y₀ and h²f(x<sub>N−1</sub>) − y<sub>N</sub>).') + '</p>';
      } else sysBox.innerHTML = '<p class="nv-lab">' + (N - 1) + ' unknowns in a tridiagonal system (shown for N ≤ 6).' + (Sb.forget ? ' <span class="nv-bad">The boundary values are missing from the right side.</span>' : '') + '</p>';
      var eqs = (qv ? 'y″ − ' + (qv === 1 ? '' : fs(qv, 4)) + 'y' : 'y″') + ' = ' + pf(fsrc);
      Fb.out.set(eqs + ' on [' + minus(aa) + ', ' + minus(bb) + '], y(' + minus(aa) + ') = ' + minus(ya) + ', y(' + minus(bb) + ') = ' + minus(yb) + '. Gray: the ' + (exact ? 'exact' : 'very fine-grid') + ' solution; blue: the finite-difference values with h = ' + fs(h, 3) + '.' + (Fb.quiet ? '' : ' Largest error at the grid points: ' + fs(emax, 3) + (Sb.forget ? '.' : (N <= 20 ? '; with twice as many intervals it would be ' + fs(M.max.apply(null, (function () { var s2 = fdSolve(2 * N, false), y2 = [ya].concat(s2.y).concat([yb]); return y2.map(function (v, k) { return M.abs(v - ref(aa + k * s2.h)); }); })()), 3) + ', about a quarter (order h²).' : '.'))));
    };
    redrawOn(cb, drawB); drawB();
    return { update: function (q) { Object.assign(o, q); drawB(); } };
  }
  // ================================================================ num-measure
  function sigCount(rel) { if (!(rel > 0)) return Infinity; var t = M.floor(M.log10(5 / rel) + 1e-12); return M.max(0, t); }
  V.register('num-measure', function (el, o) {
    o = Object.assign({ pairs: [[5, 4.99], [384400, 384000]], labels: ['length of a room (m)', 'distance to the Moon (km)'], units: true }, o || {});
    var F = frame(el, o, 'Absolute and relative error of two approximations');
    var cards = (o.pairs || []).slice(0, 2).map(function (pr, i) { return { x: nval(pr[0], 1), xa: nval(pr[1], 1), lab: (o.labels || [])[i] || (i ? 'second' : 'first'), sx: String(pr[0]), sa: String(pr[1]) }; });
    var S = { scale: 1 }, grid = mk('div', 'nv-grid2'); F.box.appendChild(grid);
    var boxes = cards.map(function (cd, i) {
      var box = mk('div', 'nv-card'); grid.appendChild(box);
      box.appendChild(mk('div', '', '<b>' + esc(cd.lab) + '</b>'));
      var row = mk('div', 'nv-row'); box.appendChild(row);
      if (F.edit) {
        numBox(row, 'true <i>x</i> =', cd.sx, function (v) { var n = nval(v, NaN); if (!isFinite(n) || n === 0) return false; cd.x = n; render(); return true; }, { width: '7.5rem' });
        numBox(row, 'approx. <i>x̃</i> =', cd.sa, function (v) { var n = nval(v, NaN); if (!isFinite(n)) return false; cd.xa = n; render(); return true; }, { width: '7.5rem' });
      } else row.innerHTML = '<span class="nv-mono">x = ' + fs(cd.x, 9) + ', x̃ = ' + fs(cd.xa, 9) + '</span>';
      var outp = mk('div', ''); box.appendChild(outp); return outp;
    });
    if (F.edit && o.units) check(F.ctl, 'change units (multiply both by 1000)', false, function (v) { S.scale = v ? 1000 : 1; render(); });
    var render = function () {
      var res = cards.map(function (cd, i) {
        var x = cd.x * S.scale, xa = cd.xa * S.scale, ab = M.abs(xa - x), rel = ab / M.abs(x), wrong = xa ? ab / M.abs(xa) : Infinity, t = sigCount(rel);
        boxes[i].innerHTML = (S.scale !== 1 ? '<p class="nv-lab">In the new units: x = ' + fs(x, 7) + ', x̃ = ' + fs(xa, 7) + '</p>' : '') + (F.quiet ? '<p class="nv-lab">Absolute error = |x̃ − x|; relative error = |x̃ − x| / |x|.</p>' :
          '<div class="nv-mono" style="line-height:1.7">absolute |x̃ − x| = <b>' + fs(ab, 4) + '</b><br>relative |x̃ − x|/|x| = <b>' + fs(rel, 4) + '</b> (' + fs(rel * 100, 3) + '%)<br><span class="nv-dim">dividing by x̃ instead: ' + fs(wrong, 4) + ' (wrong)</span><br>significant digits: <b>' + (isFinite(t) ? t : 'all') + '</b></div>');
        return { ab: ab, rel: rel };
      });
      if (res.length === 2) {
        var ba = res[0].ab < res[1].ab ? 0 : 1, br = res[0].rel < res[1].rel ? 0 : 1;
        F.out.set(F.quiet ? 'Compare the two approximations by their relative errors.' : 'Smaller absolute error: ' + esc(cards[ba].lab) + '. Smaller relative error: <b>' + esc(cards[br].lab) + '</b>' + (ba !== br ? ', the fair comparison, since it measures each error against the size of its number.' : '.') + (S.scale !== 1 ? ' Changing units multiplied both absolute errors by 1000 and left the relative errors alone.' : ''));
      } else F.out.set(F.quiet ? '' : 'Relative error ' + fs(res[0].rel, 3) + ' means about ' + sigCount(res[0].rel) + ' correct significant digits.');
    };
    render();
    return { update: function (q) { Object.assign(o, q); render(); } };
  });

  // ================================================================ num-horner
  V.register('num-horner', function (el, o) {
    o = Object.assign({ coef: [2, -6, 2, -1], x: 3, steps: 0, mistake: 'none' }, o || {});
    var F = frame(el, o, 'Horner\'s method as a table');
    var S = { c: (o.coef || [1]).map(function (v) { return nval(v, 0); }), x: nval(o.x, 1), k: 0, mis: /^(none|skip|reverse)$/.test(o.mistake) ? o.mistake : 'none' };
    S.k = clamp(M.round(nval(o.steps, 0)), 0, S.c.length);
    var view = mk('div', ''); F.box.appendChild(view);
    if (F.edit) {
      numBox(F.ctl, 'coefficients', S.c.join(', '), function (v) { var a = v.split(/[,;\s]+/).filter(function (t) { return t !== ''; }).map(function (t) { return nval(t, NaN); }); if (!a.length || a.some(function (t) { return !isFinite(t); }) || a.length > 9) return false; S.c = a; S.k = 0; render(); return true; }, { width: '11rem', mode: 'text', aria: 'coefficients, leading first, separated by commas' });
      numBox(F.ctl, '<i>x</i> =', String(S.x), function (v) { var n = nval(v, NaN); if (!isFinite(n)) return false; S.x = n; render(); return true; }, { width: '5rem' });
      V.button(F.ctl, 'Step ▶', function () { S.k = M.min(S.k + 1, used().length); render(); }, 'pri');
      V.button(F.ctl, 'All', function () { S.k = used().length; render(); });
      V.button(F.ctl, 'Reset', function () { S.k = 0; render(); });
      V.seg(F.ctl, { label: 'Way of nesting', items: [['none', 'correct'], ['skip', 'skip the 0s'], ['reverse', 'start at a₀']], value: S.mis, change: function (v) { S.mis = v; S.k = used().length; render(); } });
    }
    function used() { var c = S.c.slice(); if (S.mis === 'skip') c = c.filter(function (v, i) { return v !== 0 || i === 0; }); if (S.mis === 'reverse') c.reverse(); return c; }
    function ptxt(c) { var n = c.length - 1, out = ''; c.forEach(function (a, i) { var pw = n - i; if (a === 0) return; var mag = M.abs(a), term = (mag === 1 && pw > 0 ? '' : fs(mag, 6)) + (pw > 0 ? 'x' + (pw > 1 ? sup(pw) : '') : ''); out += out ? (a < 0 ? ' − ' : ' + ') + term : (a < 0 ? '−' : '') + term; }); return out || '0'; }
    var render = function () {
      var c = used(), n = c.length - 1, x = S.x, b = [], prod = [], i;
      for (i = 0; i <= n; i++) { prod.push(i ? b[i - 1] * x : null); b.push(i ? prod[i] + c[i] : c[0]); }
      var shown = S.k, trueV = S.c.reduce(function (s, a) { return s * x + a; }, 0);
      var cell = function (v, cls) { return '<td class="nv-mono' + (cls ? ' ' + cls : '') + '">' + v + '</td>'; };
      var zeroIdx = S.mis === 'none' ? S.c.map(function (v, k) { return v === 0 && k > 0 ? k : -1; }).filter(function (k) { return k >= 0; }) : [];
      var head = '<tr><th>x = ' + fs(x, 6) + '</th>' + c.map(function (_, k) { return '<th>' + (S.mis === 'reverse' ? 'a' + '₀₁₂₃₄₅₆₇₈₉'[k] : 'a' + '₀₁₂₃₄₅₆₇₈₉'[n - k]) + '</th>'; }).join('') + '</tr>';
      var r1 = '<tr><th class="nv-l">coefficients</th>' + c.map(function (v, k) { return cell(fs(v, 6), zeroIdx.indexOf(k) >= 0 ? 'span' : ''); }).join('') + '</tr>';
      var r2 = '<tr><th class="nv-l">× x</th>' + c.map(function (_, k) { return cell(k === 0 ? '' : k < shown ? fs(prod[k], 6) : '', k === shown - 1 && k ? 'cur' : ''); }).join('') + '</tr>';
      var r3 = '<tr><th class="nv-l">running value</th>' + c.map(function (_, k) { return cell(k < shown ? '<b>' + fs(b[k], 6) + '</b>' : '', k === shown - 1 ? 'cur' : ''); }).join('') + '</tr>';
      var nest = ''; for (i = 0; i < M.min(shown, n + 1); i++) nest = i === 0 ? fs(c[0], 6) : (i > 1 ? '(' + nest + ')' : nest) + '·' + (x < 0 ? '(' + fs(x, 6) + ')' : fs(x, 6)) + (c[i] < 0 ? ' − ' + fs(-c[i], 6) : ' + ' + fs(c[i], 6));
      var done = shown >= n + 1, val = b[n], ok = M.abs(val - trueV) <= 1e-9 * M.max(1, M.abs(trueV));
      view.innerHTML = '<p class="nv-big" style="font-size:.95rem">p(x) = ' + ptxt(S.c) + '</p><div class="mla-tbl" tabindex="0" role="region" aria-label="Horner table"><table><thead>' + head + '</thead><tbody>' + r1 + r2 + r3 + '</tbody></table></div>' +
        (zeroIdx.length ? '<p class="nv-lab">Shaded: a 0 written in for each missing power.</p>' : '') +
        '<p class="nv-big" style="font-size:.92rem">' + (shown ? nest + (done && !F.quiet ? ' = <b class="' + (ok ? 'nv-ok' : 'nv-bad') + '">' + fs(val, 8) + '</b>' : '') : 'Press Step to bring down the leading coefficient.') + '</p>';
      var msg = 'Each step multiplies the running value by x and adds the next coefficient: ' + n + ' multiplications and ' + n + ' additions in all. Computing each power separately would take ' + (n * (n + 1) / 2) + ' multiplications.';
      if (done && !F.quiet) msg += S.mis === 'none' ? ' p(' + fs(x, 6) + ') = ' + fs(val, 8) + '.' : ' This gives ' + fs(val, 8) + ', but p(' + fs(x, 6) + ') = ' + fs(trueV, 8) + ': ' + (S.mis === 'skip' ? 'dropping a 0 shifts every later coefficient to the wrong power.' : 'starting from a₀ evaluates a different polynomial, with the coefficients reversed.');
      F.out.set(msg);
    };
    render();
    return { update: function (q) { Object.assign(o, q); render(); } };
  });

})(window, document);
