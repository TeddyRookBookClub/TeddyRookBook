/* Math Ladder visuals, set B: algebra through college (registered on window.MathLadder.viz).
   Load order on a page: homeschool/calc/cas.js, math/viz/core.js (+ viz.css), then this file (+ adv.css).

   Names: graph slope linesystem parabola transformfn exponential logscale unitcircle trigwave polar complexplane
   sequence limit secant derivgraph riemann ftc solids taylor seriespartial vectors2d vectors3d surface gradient
   vectorfield lineintegral flux param3d matrix2d span slopefield phaseplane springmass dice normal sampling scatter
   venn tree

   Embed:  <div class="ml-viz" data-viz="graph" data-opts='{"f":"a*x^2","params":{"a":[-3,3,1]}}'></div>

   Conventions shared by every visual in this file (each visual documents its own options above its code):
   - Functions are strings in the CAS's plain syntax: "a*x^2+b*x+c", "2x+1", "sin(2x)", "e^(-x)", "sqrt(x)",
     "ln(x)", "abs(x)", "x^(1/3)" (odd roots of negatives work). Write theta as theta. e, i and pi are constants,
     so never use them as parameter names. Any other letter that is not a variable of the visual is a parameter:
     it takes its value from "params" (and gets a slider where the visual offers parameter sliders).
   - params: {"a": [min, max, value, step]}  or  {"a": {"min": -3, "max": 3, "value": 1, "step": 0.5, "label": "a"}}
     or {"a": 2} (a slider around that value). The step is optional.
   - Numbers in options may also be CAS strings: "pi/2", "2pi", "sqrt(2)", "1/3".
   - Windows: xmin, xmax, ymin, ymax in math units (defaults suit the visual).
   - task: a short instruction shown above the visual (HTML allowed). Visuals with a "target" option show a
     check mark on the task line once the learner meets it.
   - label: the aria-label for the whole visual (a sensible one is built when it is missing).
   - height: canvas height in px (by default it follows the width, roughly 260 to 500 px).
   - quiet: true (or readout: false): hide the live readout of numbers, so a picture inside a problem doesn't give the
     answer away (riemann's sum, solids' volume, slopefield's Euler value, limit's values, scatter's r and line, …).
     scatter and logscale keep a short readout in words and drop the telling numbers from the picture too. The
     picture also leaves off the values it works out: graph's y for a point riding a curve, slope's rise and run,
     linesystem's crossing point, parabola's vertex, exponential's traced point, unitcircle's coordinates, trigwave's
     period, amplitude and midline, sequence's term value and step, derivgraph's slope, ftc's area, seriespartial's
     sums, tree's outcome probabilities (names and given branch probabilities stay).
     Default false: everything shows as before.
   All visuals work with mouse, touch and keyboard (focus the picture, arrow keys move the selected handle,
   Enter or N picks the next handle; in 3-D pictures arrow keys turn the view), follow the light or dark theme,
   and keep a live text readout of the key numbers.
   Toolkit additions made here (not in core.js): cf() compiles CAS strings with live parameters, frame() builds the
   task line + canvas + controls + readout, handles() adds draggable and keyboard-movable points, cam3() is a small
   orthographic 3-D camera with depth sorting, plus number formatters (fractions, multiples of pi, exact trig). */
(function (W, D) {
  'use strict';
  var ML = W.MathLadder = W.MathLadder || {}, V = ML.viz;
  if (!V) { if (W.console) W.console.warn('viz/adv.js: load viz/core.js first'); return; }
  var M = Math, PI = M.PI, TAU = 2 * PI, fm = V.fmt, mk = V.el;
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  function sup(n) { return String(n).split('').map(function (ch) { return SUP[ch] || ch; }).join(''); }
  function sub(n) { return String(n).split('').map(function (ch) { return SUB[ch] || ch; }).join(''); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }

  // ---------- compiling CAS strings ----------
  function nm(v) { return v === 'θ' ? 'theta' : v; }
  function fixPow(t) { // simplify constant exponents so x^(1/3) is a real odd root
    var C = W.CAS;
    if (!t || !t.a) return t;
    for (var i = 0; i < t.a.length; i++) if (t.a[i] && t.a[i].k) t.a[i] = fixPow(t.a[i]);
    if (t.k === '^' && !Object.keys(C.freeVars(t.a[1])).length) { try { var s = C.simp(t.a[1]); if (s && s.k) t.a[1] = s; } catch (e) { } }
    return t;
  }
  function parseT(src) { var C = W.CAS; if (!C) throw new Error('viz/adv.js needs the CAS (homeschool/calc/cas.js)'); var t = C.parse(String(src)); if (!t) throw new Error('empty function'); return fixPow(t); }
  /* cf(src, vars, P): a fast JS function of vars; other letters read live from object P (missing ones count as 1). */
  function cf(src, vars, P) {
    var C = W.CAS, t = typeof src === 'object' ? src : parseT(src), vn = vars.map(nm);
    var ex = Object.keys(C.freeVars(t)).map(nm).filter(function (v) { return vn.indexOf(v) < 0; });
    var g = C.compile(t, vn.concat(ex)), k = vn.length, n = ex.length, f;
    if (!n) f = function (a, b, c) { try { return +g(a, b, c); } catch (e) { return NaN; } };
    else f = function () { var a = new Array(k + n), i; for (i = 0; i < k; i++) a[i] = arguments[i]; for (i = 0; i < n; i++) { var pv = P && P[ex[i]]; a[k + i] = pv == null ? 1 : pv; } try { return +g.apply(null, a); } catch (e) { return NaN; } };
    f.extra = ex; f.tree = t; return f;
  }
  /* derivative of a CAS string as a compiled function (symbolic; falls back to a central difference) */
  function cfd(src, v, vars, P, order) {
    try { var C = W.CAS, t = parseT(src); for (var i = 0; i < (order || 1); i++) t = C.deriv(t, v === 'theta' ? 'θ' : v); return cf(t, vars, P); }
    catch (e) { var f = cf(src, vars, P); return function (x) { var h = 1e-5 * M.max(1, M.abs(x)); return (f(x + h) - f(x - h)) / (2 * h); }; }
  }
  function nv(v, d) { // a number from a number or a CAS string ("pi/2")
    if (typeof v === 'number') return isFinite(v) ? v : d;
    if (v == null || v === '') return d;
    var x = +v; if (!isNaN(x)) return x;
    try { var y = cf(String(v), [])(); if (isFinite(y)) return y; } catch (e) { }
    return d;
  }
  function niceStep(r) { var raw = r / 100, m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function params(spec) {
    return Object.keys(spec || {}).map(function (k) {
      var s = spec[k], o = { name: k, label: k };
      if (Array.isArray(s)) { o.min = nv(s[0], -5); o.max = nv(s[1], 5); o.value = nv(s[2], (o.min + o.max) / 2); o.step = nv(s[3], 0); }
      else if (s && typeof s === 'object') { o.min = nv(s.min, -5); o.max = nv(s.max, 5); o.value = nv(s.value, (o.min + o.max) / 2); o.step = nv(s.step, 0); if (s.label) o.label = s.label; }
      else { o.value = nv(s, 1); var r = M.max(5, M.abs(o.value) * 2); o.min = -r; o.max = r; o.step = 0; }
      if (!o.step) o.step = niceStep(o.max - o.min);
      o.value = clamp(o.value, o.min, o.max); return o;
    });
  }
  function opt(o, d) { var r = {}, k; for (k in d) r[k] = d[k]; for (k in o) if (o[k] !== undefined) r[k] = o[k]; return r; }

  // ---------- number formatting ----------
  function gcd(a, b) { a = M.abs(a); b = M.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function ratio(x, maxD) { // [p, q] if x is (very nearly) p/q with q <= maxD
    if (!isFinite(x)) return null; maxD = maxD || 12;
    for (var q = 1; q <= maxD; q++) { var p = M.round(x * q); if (M.abs(p / q - x) < 1e-9 * M.max(1, M.abs(x))) return [p, q]; }
    return null;
  }
  function fr(x, d, maxD) { var r = ratio(x, maxD || 12); if (!r) return fm(x, d === undefined ? 3 : d); if (r[1] === 1) return fm(r[0], 0); return (r[0] < 0 ? '−' : '') + M.abs(r[0]) + '/' + r[1]; }
  function pf(x, d) { // a multiple of pi when it is one
    if (M.abs(x) < 1e-12) return '0'; var r = ratio(x / PI, 12);
    if (!r) return fm(x, d === undefined ? 3 : d);
    var s = r[0] < 0 ? '−' : '', p = M.abs(r[0]); return s + (p === 1 ? '' : p) + 'π' + (r[1] === 1 ? '' : '/' + r[1]);
  }
  var EX = [[0, '0'], [0.5, '1/2'], [M.SQRT2 / 2, '√2/2'], [M.sqrt(3) / 2, '√3/2'], [1, '1'], [M.sqrt(3), '√3'], [M.sqrt(3) / 3, '√3/3'], [2, '2'], [M.SQRT2, '√2'], [2 * M.sqrt(3) / 3, '2√3/3']];
  function exact(v) { if (!isFinite(v) || M.abs(v) > 1e9) return null; for (var i = 0; i < EX.length; i++) if (M.abs(M.abs(v) - EX[i][0]) < 1e-9) return (v < -1e-12 ? '−' : '') + EX[i][1]; return null; }
  function coef(c, first) { // "+ 3" pieces for writing polynomials; returns [signText, magnitudeText]
    return [c < 0 ? (first ? '−' : ' − ') : (first ? '' : ' + '), fr(M.abs(c), 3)];
  }
  function polyStr(cs, v, html) { // cs[k] is the coefficient of v^k; written highest power first
    var s = '', first = true;
    for (var k = cs.length - 1; k >= 0; k--) {
      var c = cs[k]; if (M.abs(c) < 1e-12) continue;
      var pc = coef(c, first), mag = pc[1], pw = k === 0 ? '' : k === 1 ? v : v + (html ? '<sup>' + k + '</sup>' : sup(k));
      if (k > 0 && mag === '1') mag = ''; if (k > 0 && mag.indexOf('/') >= 0) mag = '(' + mag + ')';
      s += pc[0] + mag + pw; first = false;
    }
    return s || '0';
  }
  function mco(m, d) { // a coefficient in front of a variable: 1 -> '', -1 -> '−', 3/4 -> '(3/4)'
    var t = fr(m, d == null ? 3 : d); if (t === '1') return ''; if (t === '−1') return '−';
    return t.indexOf('/') >= 0 ? (t[0] === '−' ? '−(' + t.slice(1) + ')' : '(' + t + ')') : t;
  }
  function lin(m, b, v, d) { // "m·v + b" as HTML, e.g. lin(0.75, -2, 'x') -> (3/4)x − 2
    v = v || '<i>x</i>'; if (M.abs(m) < 1e-12) return fr(b, d == null ? 3 : d);
    return mco(m, d) + v + (M.abs(b) < 1e-12 ? '' : (b < 0 ? ' − ' : ' + ') + fr(M.abs(b), d == null ? 3 : d));
  }
  function surdN(n) { var s = 1, t = n; for (var f = 2; f * f <= t; f++) while (t % (f * f) === 0) { t /= f * f; s *= f; } return [s, t]; }
  function surd(q) { // √q for a rational q >= 0 in simplest radical form, or null when q is not a small fraction
    var r = ratio(q, 400); if (!r || r[0] < 0) return null; var N = r[0] * r[1], d = r[1]; if (N > 1e8) return null;
    var st = surdN(N), s = st[0], t = st[1], g = gcd(s, d); s /= g; d /= g;
    if (t === 1) return fr(s / d);
    return (s === 1 ? '' : s) + '√' + t + (d === 1 ? '' : '/' + d);
  }
  function prettyText(s) { // CAS text made friendlier: abs(u) -> |u|, sqrt(x) -> √x, 2^x -> 2ˣ
    return String(s).replace(/abs\(([^()]*)\)/g, '|$1|').replace(/sqrt\(([A-Za-z0-9.]+)\)/g, '√$1').replace(/sqrt\(/g, '√(').replace(/cbrt\(([A-Za-z0-9.]+)\)/g, '∛$1').replace(/\^x\b/g, 'ˣ').replace(/x\^\(1\/3\)/g, '∛x');
  }
  function mathHTML(s) { // escaped text with ^(…) and ^n written as superscripts
    return esc(s).replace(/\^\(((?:[^()]|\([^()]*\))*)\)/g, '<sup>$1</sup>').replace(/\^(−?[A-Za-z0-9.]+)/g, '<sup>$1</sup>');
  }
  function nstep(span, px) { var raw = span / M.max(2, px / 60), m = M.pow(10, M.floor(M.log10(raw))), f = raw / m; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m; }
  function signed(v, d) { return v < 0 ? ' − ' + fm(-v, d) : ' + ' + fm(v, d); }
  function iv(s) { return '<i>' + s + '</i>'; }

  // ---------- colors ----------
  function rgb(hex) { var v = parseInt(hex.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function rgba(hex, a) { var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mixc(h1, h2, t) { var a = rgb(h1), b = rgb(h2); return 'rgb(' + M.round(lerp(a[0], b[0], t)) + ',' + M.round(lerp(a[1], b[1], t)) + ',' + M.round(lerp(a[2], b[2], t)) + ')'; }
  function ramp(k, t) { // a height colormap from the theme: blue, teal, green, gold, orange
    var cs = [k.blue, k.teal, k.green, k.gold, k.orange]; t = clamp(t, 0, 1) * (cs.length - 1);
    var i = M.min(cs.length - 2, M.floor(t)); return [rgb(cs[i]), rgb(cs[i + 1]), t - i];
  }
  function rampRGB(k, t, light) { var r = ramp(k, t), a = r[0], b = r[1], u = r[2], L = light == null ? 1 : light; return 'rgb(' + M.round(lerp(a[0], b[0], u) * L) + ',' + M.round(lerp(a[1], b[1], u) * L) + ',' + M.round(lerp(a[2], b[2], u) * L) + ')'; }
  function shadeRGB(hex, L, a) { var c = rgb(hex); return 'rgba(' + M.round(M.min(255, c[0] * L)) + ',' + M.round(M.min(255, c[1] * L)) + ',' + M.round(M.min(255, c[2] * L)) + ',' + (a == null ? 1 : a) + ')'; }
  function isDark() { return D.documentElement.getAttribute('data-theme') === 'dark'; }

  // ---------- numerics ----------
  function simpson(f, a, b, n) { n = n || 400; if (n % 2) n++; var h = (b - a) / n, s = f(a) + f(b); for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; }
  function gauss(f, a, b, n) { // composite 5-point Gauss-Legendre, accurate for smooth integrands
    var X = [0, 0.5384693101056831, -0.5384693101056831, 0.906179845938664, -0.906179845938664], Wt = [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908];
    n = n || 64; var h = (b - a) / n, s = 0;
    for (var i = 0; i < n; i++) { var m = a + (i + 0.5) * h; for (var j = 0; j < 5; j++) s += Wt[j] * f(m + X[j] * h / 2); }
    return s * h / 2;
  }
  function quad(f, a, b) { // tanh-sinh quadrature: very accurate, and fine with endpoint singularities like sqrt(x) at 0
    if (a === b) return 0; var c = (a + b) / 2, d = (b - a) / 2, h = 1 / 32, s = 0;
    for (var k = -150; k <= 150; k++) { // points measured from the nearer endpoint so they never round onto it
      var t = k * h, u = PI / 2 * M.sinh(t), ch = M.cosh(u), w = PI / 2 * M.cosh(t) / (ch * ch), e = 2 / (1 + M.exp(2 * M.abs(u)));
      if (!(w > 1e-300) || !(e > 0)) continue; var y = f(u < 0 ? a + d * e : b - d * e); if (isFinite(y)) s += w * y;
    }
    return s * h * d;
  }
  function dnum(f, x) { var h = 1e-5 * M.max(1, M.abs(x)); return (f(x + h) - f(x - h)) / (2 * h); }
  function rk4(F, t, y, h) { // y: array, F(t, y) -> array
    var k1 = F(t, y), a = y.map(function (v, i) { return v + h / 2 * k1[i]; }), k2 = F(t + h / 2, a);
    var b = y.map(function (v, i) { return v + h / 2 * k2[i]; }), k3 = F(t + h / 2, b), c = y.map(function (v, i) { return v + h * k3[i]; }), k4 = F(t + h, c);
    return y.map(function (v, i) { return v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]); });
  }
  function erf(x) { // Abramowitz-Stegun 7.1.26 is too coarse for tables; use a series / continued fraction pair
    var s = x < 0 ? -1 : 1; x = M.abs(x);
    if (x < 3) { var t = x, sum = x, k = 0; while (M.abs(t) > 1e-17 * M.abs(sum) && k < 200) { k++; t *= -x * x / k; sum += t / (2 * k + 1); } return s * 2 / M.sqrt(PI) * sum; }
    var f = 0; for (var n = 60; n >= 1; n--) f = n / 2 / (x + f); return s * (1 - M.exp(-x * x) / M.sqrt(PI) / (x + f));
  }
  function Phi(z) { return 0.5 * (1 + erf(z / M.SQRT2)); }
  function rng(seed) { // small seeded generator (mulberry32) so a page can repeat a simulation
    var a = (seed >>> 0) || (M.random() * 4294967296 >>> 0);
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = M.imul(t ^ t >>> 15, t | 1); t ^= t + M.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  // ---------- page pieces ----------
  /* frame(el, o, label): task line, a box for the canvas, a control row and a live readout. */
  function frame(el, o, label, fo) {
    el.classList.add('mla'); el.setAttribute('role', 'group');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', o.label || label);
    var F = {};
    if (o.task) { F.task = mk('p', 'mla-task', '<span class="mla-tk" aria-hidden="true"></span><span>' + o.task + '</span>'); el.appendChild(F.task); if (ML.typeset) try { ML.typeset(F.task); } catch (e) { } }
    F.box = mk('div', 'mla-box'); el.appendChild(F.box);
    F.ctl = mk('div', 'ml-ctl'); el.appendChild(F.ctl);
    F.out = V.readout(el);
    // quiet: true (or readout: false): no live readout that could give a problem's answer away; a visual that passes
    // fo.quietSay keeps its readout and words it without the numbers
    F.quiet = !!(o.quiet || o.readout === false);
    if (F.quiet && !(fo && fo.quietSay)) F.out.el.hidden = true;
    var was = false;
    F.done = function (ok) { if (!F.task) return; ok = !!ok; F.task.classList.toggle('ok', ok); if (ok && !was) { F.task.setAttribute('aria-live', 'polite'); } was = ok; };
    F.canvas = function (q) { // narrow screens (under 520 px) get a squarer canvas unless q.narrow is false
      q = q || {}; var qq = { aspect: q.aspect || 1.6, min: q.min || 290, max: q.max || 480, height: o.height || q.height }, c = V.canvas(F.box, qq); c.q = qq;
      if (q.narrow !== false && !o.height && !q.height) { var adj = function () { if (qq.fixed) return; var w = F.box.clientWidth || 300, nh = w < 520 ? M.round(w / M.min(qq.aspect, q.narrow || 1.1)) : 0; if (nh !== (qq.height || 0)) { qq.height = nh; c.fit(); } }; c.onResize(adj); adj(); }
      return c;
    };
    F.row = function (cls) { var r = mk('div', 'ml-ctl' + (cls ? ' ' + cls : '')); el.insertBefore(r, F.out.el); return r; };
    return F;
  }
  function slider(parent, o) { var s = V.slider(parent, o); return s; }
  function pslider(parent, p, P, fn, fmt) { // a slider for a parameter object from params()
    P[p.name] = p.value;
    return V.slider(parent, { label: p.label, min: p.min, max: p.max, step: p.step, value: p.value, fmt: fmt, input: function (v) { P[p.name] = v; fn(); } });
  }
  function check(parent, text, on, fn) { var l = mk('label', 'mla-chk'), i = D.createElement('input'); i.type = 'checkbox'; i.checked = !!on; l.appendChild(i); l.appendChild(D.createTextNode(' ' + text)); i.addEventListener('change', function () { fn(i.checked); }); parent.appendChild(l); return i; }
  function numIn(parent, o) { // a small number box: o = {label, value, step, min, max, change(v)}
    var l = mk('label', 'mla-num'), s = mk('span', '', o.label || ''), i = D.createElement('input');
    i.type = 'number'; i.step = o.step || 'any'; if (o.min != null) i.min = o.min; if (o.max != null) i.max = o.max; i.value = o.value; i.inputMode = 'decimal';
    if (o.aria) i.setAttribute('aria-label', o.aria);
    l.appendChild(s); l.appendChild(i); parent.appendChild(l);
    i.addEventListener('input', function () { var v = parseFloat(i.value); if (isFinite(v)) o.change(v); });
    return { el: l, input: i, set: function (v) { i.value = +(+v).toFixed(4); }, get: function () { return parseFloat(i.value); } };
  }
  function scrollOK(c) { c.cv.style.touchAction = 'pan-y'; }

  /* handles(c, P, list, o): draggable points in math coordinates.
     list: [{get() -> [x, y], set(x, y), name}], o: {change(), snap, step, r}.  Returns {draw(ctx), cur(), sel(i)}. */
  function handles(c, P, list, o) {
    o = o || {}; var cur = 0, focus = false, cv = c.cv;
    function snap(v) { return o.snap ? M.round(v / o.snap) * o.snap : v; }
    V.drag(cv, {
      hit: function (px, py) {
        var best = null, bd = o.r || 24;
        list.forEach(function (h, i) { if (h.off && h.off()) return; var p = h.get(), d = M.hypot(P.X(p[0]) - px, P.Y(p[1]) - py); if (d < bd) { bd = d; best = i; } });
        if (best == null && o.free) return o.free(px, py);
        return best;
      },
      start: function (i, px, py) { if (typeof i === 'number') { cur = i; if (o.start) o.start(i); } else if (o.freeStart) o.freeStart(i, px, py); },
      move: function (i, px, py) {
        if (typeof i !== 'number') { if (o.freeMove) o.freeMove(i, px, py); return; }
        var v = P.view(); list[i].set(snap(clamp(P.x(px), v.xmin, v.xmax)), snap(clamp(P.y(py), v.ymin, v.ymax)), true); if (o.change) o.change(i);
      },
      end: function (i) { if (o.end) o.end(i); }
    });
    cv.tabIndex = 0;
    cv.addEventListener('focus', function () { focus = true; if (o.change) o.change(-1); });
    cv.addEventListener('blur', function () { focus = false; if (o.change) o.change(-1); });
    cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (d && list.length) {
        var h = list[cur]; if (h.off && h.off()) return; var p = h.get(), st = (o.snap || o.step || niceStep(P.view().xmax - P.view().xmin) * 2) * (e.shiftKey ? 5 : 1);
        h.set(snap(p[0] + d[0] * st), snap(p[1] + d[1] * st), false); if (o.change) o.change(cur); e.preventDefault();
      } else if ((e.key === 'Enter' || e.key === 'n' || e.key === 'N') && list.length > 1) { var k = 0; do { cur = (cur + 1) % list.length; k++; } while (list[cur].off && list[cur].off() && k < list.length); if (o.change) o.change(cur); e.preventDefault(); }
    });
    return {
      draw: function (ctx) { // a ring on the handle that the keyboard moves
        if (!focus || !list.length) return; var h = list[cur]; if (h.off && h.off()) return; var p = h.get(), k = V.colors();
        ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), 13, 0, TAU); ctx.stroke(); ctx.restore();
      },
      cur: function () { return cur; }, sel: function (i) { cur = i; }, focused: function () { return focus; }
    };
  }
  /* knob(ctx, x, y, color): a draggable-looking point (ring + dot) in pixel coordinates */
  function knob(ctx, x, y, col, r) {
    var k = V.colors(); r = r || 7;
    ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, TAU); ctx.fill(); ctx.restore();
  }
  function label(ctx, s, x, y, o) { // a text label with a soft background pill, pixel coordinates
    o = o || {}; var k = V.colors();
    ctx.save(); ctx.font = (o.bold ? '700 ' : '600 ') + (o.size || 13) + 'px system-ui,sans-serif'; var w = ctx.measureText(s).width, h = (o.size || 13) + 6;
    var al = o.align || 'center', bx = al === 'center' ? x - w / 2 - 5 : al === 'right' ? x - w - 10 : x;
    var by = y - h / 2; if (o.clampW) { bx = clamp(bx, 2, o.clampW - w - 12); }
    if (o.clampH) by = clamp(by, 2, o.clampH - h - 2);
    ctx.fillStyle = o.bg || rgba(k.bg.length === 7 ? k.bg : '#ffffff', 0.85); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, w + 10, h, 6); else ctx.rect(bx, by, w + 10, h); ctx.fill();
    ctx.fillStyle = o.color || k.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, bx + 5, by + h / 2 + 0.5); ctx.restore();
  }
  function txt(ctx, s, x, y, o) { o = o || {}; var k = V.colors(); ctx.save(); ctx.font = o.font || ((o.italic ? 'italic ' : '') + (o.bold ? '700 ' : '600 ') + (o.size || 12) + 'px ' + (o.italic ? 'Georgia,serif' : 'system-ui,sans-serif')); ctx.fillStyle = o.color || k.muted; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  function win(o, d) { return { xmin: nv(o.xmin, d[0]), xmax: nv(o.xmax, d[1]), ymin: nv(o.ymin, d[2]), ymax: nv(o.ymax, d[3]), equal: o.equal != null ? !!o.equal : !!d[4] }; }
  function bg(P) { P.clear(); P.grid(); P.axes(); }
  function redrawOn(c, fn) { c.onResize(fn); V.onTheme(fn); }

  /* cam3(c, o): orthographic 3-D view. World axes: x, y, z (z up). Drag on empty canvas or arrow keys turn it.
     o = {yaw, pitch, r (radius of the scene), center: [x, y, z], change(), canDrag(px, py) -> bool}
     returns {p(x, y, z) -> [px, py, depth], s (px per unit), yaw, pitch, light(n) -> 0..1, faces drawing helpers} */
  function cam3(c, o) {
    var S = { yaw: nv(o.yaw, -2.25), pitch: nv(o.pitch, 0.42), r: o.r || 1, ctr: o.center || [0, 0, 0], zoom: 1 };
    var cy, sy, cp, sp, s, ox, oy;
    S.calc = function () { cy = M.cos(S.yaw); sy = M.sin(S.yaw); cp = M.cos(S.pitch); sp = M.sin(S.pitch); s = M.min(c.w, c.h) * 0.45 / S.r * S.zoom; ox = c.w / 2 + (o.dx || 0); oy = c.h / 2 + (o.dy || 0); S.s = s; };
    S.p = function (x, y, z) {
      x -= S.ctr[0]; y -= S.ctr[1]; z -= S.ctr[2];
      var x1 = x * cy - y * sy, y1 = x * sy + y * cy;
      return [ox + s * x1, oy - s * (y1 * sp + z * cp), -y1 * cp + z * sp];
    };
    S.depth = function (x, y, z) { x -= S.ctr[0]; y -= S.ctr[1]; z -= S.ctr[2]; var y1 = x * sy + y * cy; return -y1 * cp + z * sp; };
    S.toCam = function (n) { var x1 = n[0] * cy - n[1] * sy, y1 = n[0] * sy + n[1] * cy; return [x1, y1 * sp + n[2] * cp, -y1 * cp + n[2] * sp]; };
    S.light = function (n) { // diffuse light from the upper left, in front; two-sided
      var q = S.toCam(n), L = [-0.45, 0.6, 0.66], d = (q[0] * L[0] + q[1] * L[1] + q[2] * L[2]) / (M.hypot(q[0], q[1], q[2]) || 1);
      return M.abs(d);
    };
    S.facing = function (n) { return S.toCam(n)[2]; };
    var drag = null;
    V.drag(c.cv, {
      hit: function (px, py) { if (o.hit) { var h = o.hit(px, py); if (h != null) return h; } return 'cam'; },
      start: function (h, px, py) { if (h === 'cam') drag = [px, py, S.yaw, S.pitch]; else if (o.start) o.start(h, px, py); },
      move: function (h, px, py) {
        if (h !== 'cam') { if (o.move) o.move(h, px, py); return; }
        S.yaw = drag[2] - (px - drag[0]) * 0.01; S.pitch = clamp(drag[3] + (py - drag[1]) * 0.01, -1.45, 1.45); S.calc(); if (o.change) o.change();
      },
      end: function () { drag = null; if (o.end) o.end(); }
    });
    c.cv.tabIndex = 0;
    c.cv.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
      if (d && !(o.keys && o.keys(e))) { S.yaw += d[0]; S.pitch = clamp(S.pitch + d[1], -1.45, 1.45); S.calc(); if (o.change) o.change(); e.preventDefault(); }
      else if (o.keys && d) e.preventDefault();
    });
    c.onResize(S.calc); S.calc();
    S.axes = function (ctx, L, q) { // draw x, y, z axes with labels (L: half length or [x,y,z] lengths)
      q = q || {}; var k = V.colors(), Ls = Array.isArray(L) ? L : [L, L, L], names = q.names || ['x', 'y', 'z'];
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach(function (e, i) {
        var a = S.p(-e[0] * Ls[i] * (q.neg === false ? 0 : 1), -e[1] * Ls[i] * (q.neg === false ? 0 : 1), -e[2] * Ls[i] * (q.neg === false ? 0 : 1)), b = S.p(e[0] * Ls[i], e[1] * Ls[i], e[2] * Ls[i]);
        ctx.save(); ctx.strokeStyle = k.axis; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        var ang = M.atan2(b[1] - a[1], b[0] - a[0]); ctx.fillStyle = k.axis; ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - 8 * M.cos(ang - 0.4), b[1] - 8 * M.sin(ang - 0.4)); ctx.lineTo(b[0] - 8 * M.cos(ang + 0.4), b[1] - 8 * M.sin(ang + 0.4)); ctx.fill();
        ctx.globalAlpha = 1; ctx.font = 'italic 15px Georgia,serif'; ctx.fillStyle = k.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(names[i], b[0] + 12 * M.cos(ang), b[1] + 12 * M.sin(ang)); ctx.restore();
      });
    };
    S.line = function (ctx, pts, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach(function (q, i) { var p = S.p(q[0], q[1], q[2]); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore(); };
    S.arrow = function (ctx, a, b, col, w) {
      var p = S.p(a[0], a[1], a[2]), q = S.p(b[0], b[1], b[2]), ang = M.atan2(q[1] - p[1], q[0] - p[0]), L = M.hypot(q[0] - p[0], q[1] - p[1]), hs = M.min(11, L * 0.45);
      ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w || 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0] - hs * 0.6 * M.cos(ang), q[1] - hs * 0.6 * M.sin(ang)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - hs * M.cos(ang - 0.42), q[1] - hs * M.sin(ang - 0.42)); ctx.lineTo(q[0] - hs * M.cos(ang + 0.42), q[1] - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
      return q;
    };
    S.dot = function (ctx, q, col, r) { var p = S.p(q[0], q[1], q[2]); ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0], p[1], r || 5, 0, TAU); ctx.fill(); ctx.restore(); return p; };
    /* faces: [{q: [[x,y,z],...], fill, stroke, n (normal, optional), a (alpha)}] sorted far to near and drawn */
    S.faces = function (ctx, fs) {
      fs.forEach(function (f) { var d = 0; f.pp = f.q.map(function (q) { var p = S.p(q[0], q[1], q[2]); d += p[2]; return p; }); f.d = d / f.q.length + (f.bias || 0); });
      fs.sort(function (a, b) { return a.d - b.d; });
      ctx.save(); ctx.lineJoin = 'round';
      fs.forEach(function (f) {
        ctx.beginPath(); f.pp.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath();
        if (f.fill) { ctx.fillStyle = f.fill; ctx.fill(); }
        if (f.stroke) { ctx.strokeStyle = f.stroke; ctx.lineWidth = f.lw || 0.6; ctx.stroke(); } else if (f.fill) { ctx.strokeStyle = f.fill; ctx.lineWidth = 0.6; ctx.stroke(); }
        if (f.after) f.after(ctx, f);
      });
      ctx.restore();
    };
    return S;
  }
  function norm3(a, b, c) { // normal of a triangle a b c
    var u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  }
  function cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
  function dot(u, v) { var s = 0; for (var i = 0; i < u.length; i++) s += u[i] * v[i]; return s; }
  function len(u) { return M.sqrt(dot(u, u)); }
  function vstr(u, d) { return '⟨' + u.map(function (x) { return fm(x, d == null ? 2 : d); }).join(', ') + '⟩'; }
  function playBtn(parent, F, fn) { var b = V.button(parent, '▶ Play', fn); b.setAttribute('aria-pressed', 'false'); return b; }
  function arrowPx(ctx, x1, y1, x2, y2, col, w, head) {
    var ang = M.atan2(y2 - y1, x2 - x1), L = M.hypot(x2 - x1, y2 - y1), hs = M.min(head || 9, L * 0.5);
    ctx.save(); ctx.strokeStyle = ctx.fillStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hs * 0.6 * M.cos(ang), y2 - hs * 0.6 * M.sin(ang)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hs * M.cos(ang - 0.42), y2 - hs * M.sin(ang - 0.42)); ctx.lineTo(x2 - hs * M.cos(ang + 0.42), y2 - hs * M.sin(ang + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function R(name, f) { V.register(name, f); }
  // test hook: the pure math helpers, so node can check them
  ML.vizAdvMath = { quad: quad, mathHTML: mathHTML, surd: surd, lin: lin, mco: mco, prettyText: prettyText, simpson: simpson, gauss: gauss, erf: erf, Phi: Phi, ratio: ratio, fr: fr, pf: pf, exact: exact, polyStr: polyStr, rk4: rk4 };

  // ---------- shared for function graphs ----------
  var PAL = ['blue', 'red', 'green', 'purple', 'orange', 'teal', 'pink', 'gold'];
  function showSub(src, P) { // the function with parameter values put in, simplified, as pretty text
    try {
      var C = W.CAS, t = parseT(src), vars = {};
      Object.keys(P || {}).forEach(function (k) { var v = P[k]; vars[k] = M.abs(v - M.round(v)) < 1e-9 ? C.parse(String(M.round(v))) : { k: 'n', v: +(+v).toFixed(4) }; });
      return prettyText(C.show(C.simp(C.substAll(t, { vars: vars, funcs: {} }))).replace(/\+ −/g, '− '));
    } catch (e) { return String(src); }
  }
  function pretty(src) { // the author's own form, tidied: 2*x -> 2x, x^2 -> x², sqrt -> √, abs(u) -> |u|, pi -> π, - -> −
    var s = String(src).trim().replace(/\btheta\b/g, 'θ').replace(/\bpi\b/g, 'π');
    s = s.replace(/\s*\*\s*/g, function (m, off, all) { var prev = all.slice(0, off).replace(/\s+$/, '').slice(-1), next = all.slice(off + m.length); if (/^[a-z]{2,}\(/.test(next)) return ' '; if (/^[A-Za-z(πθ]/.test(next) && /[0-9A-Za-z.)πθ]/.test(prev)) return ''; return '·'; });
    s = s.replace(/\^2(?![0-9.(])/g, '²').replace(/\^3(?![0-9.(])/g, '³').replace(/-/g, '−');
    s = s.replace(/\s*([+−=])\s*/g, function (m, op, off, all) { var prev = all.slice(0, off).replace(/\s+$/, '').slice(-1); return /[0-9A-Za-z.)²³ˣπθ|]/.test(prev) && !/[\^]/.test(all.slice(0, off).replace(/\s+$/, '').slice(-2, -1) === '^' ? '^' : '') ? ' ' + op + ' ' : op; });
    return prettyText(s);
  }
  function zeros(f, a, b, n) { // sign changes of a continuous stretch, refined by bisection
    n = n || 600; var out = [], h = (b - a) / n, x0 = a, y0 = f(a);
    for (var i = 1; i <= n; i++) {
      var x1 = a + i * h, y1 = f(x1);
      if (isFinite(y0) && isFinite(y1)) {
        if (y0 === 0) out.push(x0);
        else if (y0 * y1 < 0) { var lo = x0, hi = x1, flo = y0; for (var k = 0; k < 60; k++) { var m = (lo + hi) / 2, fmv = f(m); if (flo * fmv <= 0) hi = m; else { lo = m; flo = fmv; } } var r = (lo + hi) / 2; if (M.abs(f(r)) < 1e-6 * (1 + M.abs(y0) + M.abs(y1))) out.push(r); }
      }
      x0 = x1; y0 = y1;
    }
    if (isFinite(y0) && y0 === 0) out.push(x0);
    return out.filter(function (r, i) { return !i || M.abs(r - out[i - 1]) > h / 2; });
  }
  function nice(v) { var r = M.round(v); return M.abs(v - r) < 1e-7 ? r : v; }
  function curveLabel(ctx, P, c, f, s, col) { // put a name near the right end of the visible curve
    var v = P.view();
    for (var i = 0; i <= 60; i++) {
      var x = v.xmax - (v.xmax - v.xmin) * (0.04 + i * 0.012), y = f(x);
      if (isFinite(y) && y < v.ymax - (v.ymax - v.ymin) * 0.06 && y > v.ymin + (v.ymax - v.ymin) * 0.06) { label(ctx, s, P.X(x) - 4, P.Y(y) - 14, { color: col, align: 'right', clampW: c.w }); return; }
    }
  }
  function zoomBtns(F, P, home, draw) {
    var g = mk('div', 'mla-btns mla-zoom'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Zoom'); F.ctl.appendChild(g);
    function z(k) { var v = P.view(), cx = (v.xmin + v.xmax) / 2, cy = (v.ymin + v.ymax) / 2, hx = (P.o.xmax - P.o.xmin) / 2 * k, hy = (P.o.ymax - P.o.ymin) / 2 * k; P.set({ xmin: cx - hx, xmax: cx + hx, ymin: cy - hy, ymax: cy + hy }); draw(); }
    V.button(g, '+', function () { z(0.5); }).setAttribute('aria-label', 'Zoom in');
    V.button(g, '−', function () { z(2); }).setAttribute('aria-label', 'Zoom out');
    V.button(g, '⌂', function () { P.set(home); draw(); }).setAttribute('aria-label', 'Reset the view');
  }
  function tableT(series, hi) { // a sideways table: each series is a row [header, v1, v2, …]; hi: index of a column to highlight
    return '<div class="mla-tbl" tabindex="0" role="region" aria-label="Table of values"><table><tbody>' + series.map(function (r) { return '<tr>' + r.map(function (x, i) { return i ? '<td' + (i - 1 === hi ? ' class="hi"' : '') + '>' + x + '</td>' : '<th scope="row">' + x + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function tableHTML(head, rows) {
    return '<div class="mla-tbl" tabindex="0"><table><thead><tr>' + head.map(function (h) { return '<th scope="col">' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }

  /* graph: functions with parameter sliders, draggable points and a table of values.
     opts:
       f: "a*x^2+b"                one function (or fns for several; both can be used)
       fns: ["x^2", {"f": "2x+1", "color": "red", "label": "g", "dash": true, "from": 0, "to": 5}]
            colors: blue red green purple orange teal pink gold (default cycles); label default f, g, h, …
       params: {"a": [-3, 3, 1, 0.5]}   a slider per parameter; letters without an entry get a slider from −5 to 5
       points: [[1, 2], {"x": 3, "y": 1, "drag": true, "label": "A", "on": 0, "color": "red"}]
            drag: the learner can move it (snaps to "snap", default 0.5); on: index of a function it rides along
       trace: true                  a draggable point riding on the first function, coordinates in the readout
       table: true | [x values]     a table of values (true: whole numbers across the window, at most 11)
       shade: {"fn": 0, "fn2": 1, "a": 0, "b": 2}   area between a function and the x-axis (or a second function)
       roots: false, intersections: false   mark zeros of the first function / crossings of the first two
       xmin, xmax, ymin, ymax (−10…10), equal (false), xlabel ("x"), ylabel ("y"), snap (0.5), zoom (true: + − ⌂ buttons, drag to pan)
       target: {"param": "a", "value": 2, "tol": 0.05} | {"point": 0, "x": 3, "y": 4, "tol": 0.01}   met → the task gets a check mark */
  R('graph', function (el, o) {
    o = opt(o, { xmin: -10, xmax: 10, ymin: -10, ymax: 10, snap: 0.5, zoom: true, xlabel: 'x', ylabel: 'y' });
    var Pm = {}, list = [];
    if (o.f) list.push(o.f); (o.fns || []).forEach(function (q) { list.push(q); });
    var fns = list.map(function (q, i) { q = typeof q === 'string' ? { f: q } : q; return { src: q.f, f: cf(q.f, ['x'], Pm), color: q.color || PAL[i % PAL.length], label: q.label || 'fghpqr'[i] || 'f', dash: q.dash ? [7, 6] : null, from: nv(q.from), to: nv(q.to) }; });
    var ps = params(o.params), seen = {}; ps.forEach(function (p) { seen[p.name] = 1; });
    fns.forEach(function (fn) { fn.f.extra.forEach(function (n) { if (!seen[n] && n !== 'y') { seen[n] = 1; ps.push(params(JSON.parse('{"' + n + '":[-5,5,1]}'))[0]); } }); });
    var F = frame(el, o, 'Graph of ' + fns.map(function (f) { return f.label + '(x) = ' + f.src; }).join(', ')), c = F.canvas();
    var home = win(o, [-10, 10, -10, 10]), P = V.plane(c, home);
    var pts = (o.points || []).map(function (p, i) { p = Array.isArray(p) ? { x: p[0], y: p[1] } : p; return { x: nv(p.x, 0), y: nv(p.y, 0), drag: !!p.drag, on: p.on, label: p.label || '', color: p.color || 'red' }; });
    if (o.trace && fns.length) pts.push({ x: nv(o.trace.x, (home.xmin + home.xmax) / 4), y: 0, drag: true, on: 0, label: '', color: fns[0].color, trace: true });
    pts.forEach(function (p) { if (p.on != null && fns[p.on]) p.y = fns[p.on].f(p.x); });
    var hl = [];
    pts.forEach(function (p) { if (!p.drag) return; hl.push({ get: function () { return [p.x, p.y]; }, set: function (x, y) { if (p.on != null && fns[p.on]) { p.x = p.trace ? nice(+x.toFixed(4)) : x; p.y = fns[p.on].f(p.x); } else { p.x = x; p.y = y; } } }); });
    var pan = null;
    var H = handles(c, P, hl, { snap: 0, change: draw, r: 26,
      free: o.zoom ? function () { return 'pan'; } : null,
      freeStart: function (h, px, py) { pan = [px, py, P.o.xmin, P.o.xmax, P.o.ymin, P.o.ymax]; },
      freeMove: function (h, px, py) { var dx = (px - pan[0]) / P.unit, dy = (py - pan[1]) * (pan[5] - pan[4]) / c.h; P.set({ xmin: pan[2] - dx, xmax: pan[3] - dx, ymin: pan[4] + dy, ymax: pan[5] + dy }); draw(); } });
    // snapping: free points snap to o.snap, riding points move freely
    hl.forEach(function (h, i) { var set = h.set, p = pts.filter(function (q) { return q.drag; })[i]; h.set = function (x, y) { if (p.on == null && o.snap) { x = M.round(x / o.snap) * o.snap; y = M.round(y / o.snap) * o.snap; } set(x, y); }; });
    c.cv.setAttribute('aria-label', 'Graph. ' + (hl.length ? 'Arrow keys move the point' + (hl.length > 1 ? '; Enter picks the next point.' : '.') : ''));
    if (o.zoom) zoomBtns(F, P, home, draw);
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    var tbl = null; if (o.table) { tbl = mk('div', 'mla-tablewrap'); el.insertBefore(tbl, F.out.el); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view();
      P.clear(); P.grid(); P.axes({ x: o.xlabel, y: o.ylabel });
      if (o.shade && fns[o.shade.fn || 0]) { var s = o.shade, f1 = fns[s.fn || 0].f, f2 = s.fn2 != null && fns[s.fn2] ? fns[s.fn2].f : null; P.shade(f1, f2, nv(s.a, v.xmin), nv(s.b, v.xmax), { fill: fns[s.fn || 0].color + 'Soft' }); }
      fns.forEach(function (fn) { P.plot(fn.f, { color: fn.color, dash: fn.dash, from: fn.from, to: fn.to }); });
      fns.forEach(function (fn) { curveLabel(ctx, P, c, fn.f, fn.label, k[fn.color]); });
      var marks = [];
      if (o.roots && fns[0]) zeros(fns[0].f, v.xmin, v.xmax).forEach(function (r) { P.point(r, 0, { color: 'ink', r: 4.5 }); marks.push('zero at <i>x</i> = ' + fm(r, 3)); });
      if (o.intersections && fns[1]) zeros(function (x) { return fns[0].f(x) - fns[1].f(x); }, v.xmin, v.xmax).forEach(function (r) { var y = fns[0].f(r); P.point(r, y, { color: 'ink', r: 4.5 }); marks.push('crossing at (' + fm(r, 3) + ', ' + fm(y, 3) + ')'); });
      pts.forEach(function (p) {
        if (p.on != null && fns[p.on]) p.y = fns[p.on].f(p.x);
        if (!isFinite(p.y)) return;
        if (p.drag) knob(ctx, P.X(p.x), P.Y(p.y), k[p.color] || p.color); else P.point(p.x, p.y, { color: p.color });
        var lab = F.quiet && p.on != null ? p.label : (p.label ? p.label + ' ' : '') + '(' + fm(p.x, 2) + ', ' + fm(p.y, 2) + ')'; // quiet: a point riding a graph shows only its name
        if (lab) label(ctx, lab, P.X(p.x) + 12, P.Y(p.y) - 16, { align: 'left', clampW: c.w, clampH: c.h, color: k[p.color] || k.ink });
      });
      H.draw(ctx);
      // readout
      var parts = fns.map(function (fn) { var shown = ps.length ? showSub(fn.src, Pm) : pretty(fn.src); return '<span class="mla-key" style="--c:' + k[fn.color] + '"></span>' + iv(fn.label) + '(<i>x</i>) = ' + mathHTML(shown); });
      var pp = pts.filter(function (p) { return p.drag || p.label; }).map(function (p) { return (p.label ? esc(p.label) + ' = ' : p.trace ? 'Point on ' + iv(fns[0].label) + ': ' : '') + '(' + fm(p.x, 3) + ', ' + fm(p.y, 3) + ')'; });
      F.out.set(parts.join('<br>') + (pp.length ? '<br>' + pp.join(' · ') : '') + (marks.length ? '<br>' + marks.slice(0, 6).join(' · ') : ''));
      if (tbl) {
        var xs = Array.isArray(o.table) ? o.table.map(function (x) { return nv(x, 0); }) : (function () { var a = M.ceil(home.xmin), b = M.floor(home.xmax), st = M.max(1, M.ceil((b - a + 1) / 11)), r = []; for (var x = a; x <= b; x += st) r.push(x); return r; })();
        tbl.innerHTML = tableT([['<i>x</i>'].concat(xs.map(function (x) { return fm(x, 3); }))].concat(fns.map(function (fn) { return [iv(fn.label) + '(<i>x</i>)'].concat(xs.map(function (x) { var y = fn.f(x); return isFinite(y) ? fm(y, 3) : '—'; })); })));
      }
      if (o.target && F.task) {
        var t = o.target, tol = t.tol || 0.05;
        if (t.param != null) F.done(M.abs(Pm[t.param] - nv(t.value, 0)) <= tol);
        else if (t.point != null && pts[t.point]) F.done(M.abs(pts[t.point].x - nv(t.x, 0)) <= (t.tol || 0.01) && (t.y == null || M.abs(pts[t.point].y - nv(t.y, 0)) <= (t.tol || 0.01)));
      }
    }
    redrawOn(c, draw); draw();
    return { draw: draw, P: Pm };
  });

  /* slope: rise over run on a line through two points you drag.
     opts:
       p1: [-2, -1], p2: [2, 2]     the two points (they snap to the grid)
       snap: 1                       grid snapping for the points (0.5 for halves)
       mode: "points"                "points": the slope triangle between the points; "unit": a run of 1 (rise = slope)
       slide: true                   a slider that moves a copy of the triangle along the line (same ratio everywhere)
       showEq: true                  show y = mx + b
       target: -2                    a slope to reach (with task); also "undefined" or 0
       xmin…ymax (−6…6), equal (true) */
  R('slope', function (el, o) {
    o = opt(o, { p1: [-2, -1], p2: [2, 2], snap: 1, mode: 'points', slide: true, showEq: true, xmin: -6, xmax: 6, ymin: -6, ymax: 6, equal: true });
    var A = [nv(o.p1[0], -2), nv(o.p1[1], -1)], B = [nv(o.p2[0], 2), nv(o.p2[1], 2)], mode = o.mode, sl = 0;
    var F = frame(el, o, 'Slope as rise over run, with two points you can move'), c = F.canvas({ aspect: 1.25, max: 460 }), P = V.plane(c, win(o, [-6, 6, -6, 6, true]));
    var H = handles(c, P, [{ get: function () { return A; }, set: function (x, y) { A = [x, y]; } }, { get: function () { return B; }, set: function (x, y) { B = [x, y]; } }], { snap: o.snap, change: draw });
    c.cv.setAttribute('aria-label', 'Line through two points. Arrow keys move a point; Enter switches points.');
    V.seg(F.ctl, { label: 'Triangle', items: [['points', 'Between the points'], ['unit', 'Run of 1']], value: mode, change: function (v) { mode = v; draw(); } });
    var sS = o.slide ? V.slider(F.ctl, { label: 'Slide the triangle', min: -1, max: 1, step: 0.01, value: 0, fmt: function (v) { return v === 0 ? 'at the points' : fm(v, 2); }, input: function (v) { sl = v; draw(); } }) : null;
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view(), rise = B[1] - A[1], run = B[0] - A[0];
      P.clear(); P.grid({ step: 1 }); P.axes({ step: 1 });
      var same = rise === 0 && run === 0, vert = run === 0 && !same, m = vert ? NaN : rise / run;
      if (!same) {
        if (vert) P.seg(A[0], v.ymin, A[0], v.ymax, { color: 'blue', width: 3 });
        else P.plot(function (x) { return A[1] + m * (x - A[0]); }, { color: 'blue', width: 3 });
      }
      if (!same && !vert) {
        var t0 = A[0], tr = run, trise = rise;
        if (mode === 'unit') { tr = run > 0 ? 1 : -1; trise = m * tr; }
        var span = (v.xmax - v.xmin) * 0.7; t0 += sl * span / 2;
        var y0 = A[1] + m * (t0 - A[0]), c2 = [t0 + tr, y0], c3 = [t0 + tr, y0 + trise];
        P.poly([[t0, y0], c2, c3], { fill: rgba(k.gold, 0.16), stroke: false });
        P.seg(t0, y0, c2[0], c2[1], { color: 'green', width: 3 });
        if (trise) P.seg(c2[0], c2[1], c3[0], c3[1], { color: 'red', width: 3 });
        var rx = P.X(c2[0]), ry = P.Y((c2[1] + c3[1]) / 2), runy = P.Y(y0);
        label(ctx, F.quiet ? 'run' : 'run ' + fr(tr, 2), P.X(t0 + tr / 2), runy + (trise > 0 ? 16 : -16), { color: k.green, clampW: c.w, clampH: c.h });
        if (trise) label(ctx, F.quiet ? 'rise' : 'rise ' + fr(trise, 2), rx + (tr > 0 ? 8 : -8), ry, { color: k.red, align: tr > 0 ? 'left' : 'right', clampW: c.w, clampH: c.h });
      }
      knob(ctx, P.X(A[0]), P.Y(A[1]), k.ink); knob(ctx, P.X(B[0]), P.Y(B[1]), k.ink);
      label(ctx, '(' + fm(A[0]) + ', ' + fm(A[1]) + ')', P.X(A[0]) - 12, P.Y(A[1]) + 18, { align: 'right', clampW: c.w, clampH: c.h });
      label(ctx, '(' + fm(B[0]) + ', ' + fm(B[1]) + ')', P.X(B[0]) + 12, P.Y(B[1]) - 18, { align: 'left', clampW: c.w, clampH: c.h });
      H.draw(ctx);
      var s;
      if (same) s = 'Move one point away from the other: two different points make a line.';
      else if (vert) s = 'Run = 0, so the slope is <b>undefined</b> (you cannot divide by zero). This line is vertical: <i>x</i> = ' + fm(A[0]) + '.';
      else {
        s = 'slope <i>m</i> = <span class="mla-r">rise</span> / <span class="mla-g">run</span> = (' + fm(B[1]) + ' − ' + fm(A[1]).replace(/^−/, '(−') + (A[1] < 0 ? ')' : '') + ') / (' + fm(B[0]) + ' − ' + fm(A[0]).replace(/^−/, '(−') + (A[0] < 0 ? ')' : '') + ') = ' + fm(rise) + ' / ' + fm(run) + ' = <b>' + fr(m, 3) + '</b>';
        s += m > 0 ? ' (uphill left to right)' : m < 0 ? ' (downhill left to right)' : ' (flat: zero rise)';
        if (o.showEq) { var b = A[1] - m * A[0]; s += '<br>Equation: <i>y</i> = ' + lin(m, b); }
      }
      F.out.set(s);
      if (o.target != null) { var tg = o.target; F.done(tg === 'undefined' ? vert : !vert && !same && M.abs(m - nv(tg, 0)) < 1e-9); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* linesystem: two lines, where they cross, and what that means for the system.
     opts:
       lines: ["2x - 1", "-x + 5"]   each "y = …" right side in x, or an equation in x and y: "2x + 3y = 6"
       params: {…}                   parameters used in the lines (sliders)
       editable: false               true: slope and intercept sliders for both lines (lines must be y = mx + b; uses m: [m1, m2], b: [b1, b2])
       m: [2, -1], b: [-1, 5]        starting slopes and intercepts when editable
       shade: ["above", "below"]     shade a side of each line (systems of inequalities); null for none
       strict: [false, true]         dashed boundary for < and > (with shade)
       probe: [1, 4]                 a test point you drag (snaps to 0.5): the readout says which equations or inequalities it
                                     satisfies; null for none
       xmin…ymax (−8…8), equal (true)
       target: "none" | "infinite" | [x, y]   with task: make the system have no solution, infinitely many, or that solution */
  R('linesystem', function (el, o) {
    o = opt(o, { lines: ['2x - 1', '-x + 5'], editable: false, m: [2, -1], b: [-1, 5], xmin: -8, xmax: 8, ymin: -8, ymax: 8, equal: true, probe: [1, 4] });
    var Pm = {}, ps = params(o.params), Ls;
    function mkLine(s) { // -> {a, b, c} for a x + b y = c, read numerically (lines are linear)
      if (String(s).indexOf('=') >= 0) { var sides = String(s).split('='), g = cf('(' + sides[0] + ')-(' + sides[1] + ')', ['x', 'y'], Pm); return function () { var z = g(0, 0); return { a: g(1, 0) - z, b: g(0, 1) - z, c: -z }; }; }
      var f = cf(s, ['x'], Pm); return function () { var z = f(0); return { a: -(f(1) - z), b: 1, c: z }; };
    }
    if (o.editable) { Pm.m1 = nv(o.m[0], 2); Pm.b1 = nv(o.b[0], -1); Pm.m2 = nv(o.m[1], -1); Pm.b2 = nv(o.b[1], 5); Ls = [function () { return { a: -Pm.m1, b: 1, c: Pm.b1 }; }, function () { return { a: -Pm.m2, b: 1, c: Pm.b2 }; }]; }
    else Ls = o.lines.slice(0, 2).map(mkLine);
    var F = frame(el, o, 'Two lines and their point of intersection'), c = F.canvas({ aspect: 1.3 }), P = V.plane(c, win(o, [-8, 8, -8, 8, true]));
    var pr = o.probe ? [nv(o.probe[0], 1), nv(o.probe[1], 4)] : null, H = handles(c, P, pr ? [{ get: function () { return pr; }, set: function (x, y) { pr = [x, y]; } }] : [], { snap: 0.5, change: draw });
    if (pr) c.cv.setAttribute('aria-label', 'Two lines. Arrow keys move the test point.'); else scrollOK(c);
    if (o.editable) {
      [['m1', 'Slope of line 1'], ['b1', 'Intercept of line 1'], ['m2', 'Slope of line 2'], ['b2', 'Intercept of line 2']].forEach(function (q) { V.slider(F.ctl, { label: q[1], min: q[0][0] === 'm' ? -5 : -8, max: q[0][0] === 'm' ? 5 : 8, step: q[0][0] === 'm' ? 0.25 : 0.5, value: Pm[q[0]], input: function (v) { Pm[q[0]] = v; draw(); } }); });
    } else ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    function eqStr(L, i) {
      var sh = o.shade && o.shade[i], st = o.strict && o.strict[i], up = sh === 'above' || sh === 'right', rel = !sh ? '=' : up ? (st ? '&gt;' : '≥') : (st ? '&lt;' : '≤');
      if (M.abs(L.b) < 1e-12) return '<i>x</i> ' + rel + ' ' + fr(L.c / L.a, 3);
      return '<i>y</i> ' + rel + ' ' + lin(-L.a / L.b, L.c / L.b);
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view(), L = Ls.map(function (f) { return f(); }), cols = ['blue', 'red'];
      P.clear(); P.grid(); P.axes();
      if (o.shade) L.forEach(function (l, i) { // shade the side: above means y > line
        var side = o.shade[i]; if (!side) return; var up = side === 'above' || side === 'right';
        if (M.abs(l.b) < 1e-12) { var x0 = l.c / l.a; P.poly(up ? [[x0, v.ymin], [v.xmax, v.ymin], [v.xmax, v.ymax], [x0, v.ymax]] : [[v.xmin, v.ymin], [x0, v.ymin], [x0, v.ymax], [v.xmin, v.ymax]], { fill: k[cols[i] + 'Soft'], stroke: false }); return; }
        var fy = function (x) { return (l.c - l.a * x) / l.b; };
        P.poly([[v.xmin, fy(v.xmin)], [v.xmax, fy(v.xmax)], [v.xmax, up ? v.ymax + 1e3 : v.ymin - 1e3], [v.xmin, up ? v.ymax + 1e3 : v.ymin - 1e3]], { fill: k[cols[i] + 'Soft'], stroke: false });
      });
      L.forEach(function (l, i) {
        var dash = o.strict && o.strict[i] ? [8, 6] : null;
        if (M.abs(l.b) < 1e-12) P.seg(l.c / l.a, v.ymin, l.c / l.a, v.ymax, { color: cols[i], width: 3, dash: dash });
        else P.plot(function (x) { return (l.c - l.a * x) / l.b; }, { color: cols[i], width: 3, dash: dash });
      });
      var det = L[0].a * L[1].b - L[0].b * L[1].a, s = '<span class="mla-key" style="--c:' + k.blue + '"></span>Line 1: ' + eqStr(L[0], 0) + ' &nbsp; <span class="mla-key" style="--c:' + k.red + '"></span>Line 2: ' + eqStr(L[1], 1) + '<br>', kind;
      if (M.abs(det) < 1e-12) {
        var same = M.abs(L[0].a * L[1].c - L[1].a * L[0].c) < 1e-9 && M.abs(L[0].b * L[1].c - L[1].b * L[0].c) < 1e-9;
        kind = same ? 'infinite' : 'none';
        s += same ? 'The lines are the <b>same line</b>: every point on it solves both equations, so there are <b>infinitely many solutions</b>.' : 'Same slope, different intercepts: the lines are <b>parallel</b> and never meet, so there is <b>no solution</b>.';
      } else {
        var x = (L[0].c * L[1].b - L[0].b * L[1].c) / det, y = (L[0].a * L[1].c - L[0].c * L[1].a) / det; kind = [x, y];
        P.seg(x, v.ymin, x, y, { color: 'muted', width: 1, dash: [3, 4] }); P.seg(v.xmin, y, x, y, { color: 'muted', width: 1, dash: [3, 4] });
        P.point(x, y, { color: 'ink', r: 6 });
        if (!F.quiet) label(ctx, '(' + fr(x, 2) + ', ' + fr(y, 2) + ')', P.X(x) + 12, P.Y(y) - 18, { align: 'left', bold: true, clampW: c.w, clampH: c.h });
        s += o.shade ? 'The boundary lines cross at (' + fr(x, 3) + ', ' + fr(y, 3) + '). The solutions of the system are the points shaded by <b>both</b> colors. A dashed line is not included (&lt; or &gt;); a solid line is (≤ or ≥).' : 'They cross at (' + fr(x, 3) + ', ' + fr(y, 3) + '): <b>one solution</b>, the only point on both lines. Check it in both equations.';
      }
      if (pr) {
        knob(ctx, P.X(pr[0]), P.Y(pr[1]), k.gold, 7); H.draw(ctx);
        var chk = L.map(function (l, i) { var lhs = l.a * pr[0] + l.b * pr[1], sh = o.shade && o.shade[i], st = o.strict && o.strict[i], good;
          if (!sh) good = M.abs(lhs - l.c) < 1e-9; else { var side = M.abs(l.b) < 1e-12 ? (pr[0] - l.c / l.a) : (pr[1] - (l.c - l.a * pr[0]) / l.b), up = sh === 'above' || sh === 'right'; good = st ? (up ? side > 1e-9 : side < -1e-9) : (up ? side > -1e-9 : side < 1e-9); }
          return '<span style="color:' + k[cols[i]] + ';font-weight:700">' + (i + 1) + '</span> ' + (good ? '✓' : '✗'); });
        var both = chk.every(function (q) { return q.indexOf('✓') >= 0; });
        s += '<br>Test point (' + fm(pr[0]) + ', ' + fm(pr[1]) + '): ' + chk.join(' · ') + (both ? ' — it satisfies <b>both</b>, so it is a solution of the system.' : ' — a solution has to satisfy both.');
      }
      F.out.set(s);
      if (o.target != null) { var t = o.target; F.done(Array.isArray(t) ? Array.isArray(kind) && M.abs(kind[0] - nv(t[0], 0)) < 1e-6 && M.abs(kind[1] - nv(t[1], 0)) < 1e-6 : kind === t); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* parabola: a quadratic in vertex, standard or factored form with sliders, and every feature marked.
     opts:
       form: "vertex"               which sliders: "vertex" a, h, k  ·  "standard" a, b, c  ·  "factored" a, r, s (the roots)
       a: 1, h: 0, k: -4            starting values (b, c for standard; r, s for factored)
       show: ["vertex", "axis", "roots", "yint"]   features to mark (also "focus" for the focus and directrix)
       xmin…ymax (−8…8)
       target: {"h": 2, "k": -1, "a": 1}            with task: reach this vertex (and a, if given) */
  R('parabola', function (el, o) {
    o = opt(o, { form: 'vertex', a: 1, h: 0, k: -4, b: 0, c: -4, r: -2, s: 2, show: ['vertex', 'axis', 'roots', 'yint'], xmin: -8, xmax: 8, ymin: -8, ymax: 8 });
    var S = { a: nv(o.a, 1), h: nv(o.h, 0), k: nv(o.k, -4), b: nv(o.b, 0), c: nv(o.c, -4), r: nv(o.r, -2), s: nv(o.s, 2) }, form = o.form, show = {};
    o.show.forEach(function (x) { show[x] = 1; });
    var F = frame(el, o, 'Parabola in ' + form + ' form with sliders'), c = F.canvas({ aspect: 1.35 }), P = V.plane(c, win(o, [-8, 8, -8, 8]));
    scrollOK(c);
    var defs = { vertex: [['a', -4, 4, 0.25], ['h', -6, 6, 0.5], ['k', -6, 6, 0.5]], standard: [['a', -4, 4, 0.25], ['b', -8, 8, 0.5], ['c', -8, 8, 0.5]], factored: [['a', -4, 4, 0.25], ['r', -6, 6, 0.5], ['s', -6, 6, 0.5]] }[form] || [];
    defs.forEach(function (d) { V.slider(F.ctl, { label: d[0], min: d[1], max: d[2], step: d[3], value: S[d[0]], input: function (v) { S[d[0]] = v; draw(); } }); });
    function std() { // [a, b, c]
      var a = S.a; if (form === 'vertex') return [a, -2 * a * S.h, a * S.h * S.h + S.k];
      if (form === 'factored') return [a, -a * (S.r + S.s), a * S.r * S.s]; return [a, S.b, S.c];
    }
    function sgnS(v) { return v < 0 ? ' − ' + fr(-v, 3) : ' + ' + fr(v, 3); }
    function aS(a) { return mco(a); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view(), q = std(), a = q[0], b = q[1], cc = q[2], s = '';
      P.clear(); P.grid(); P.axes();
      if (M.abs(a) < 1e-12) {
        P.plot(function (x) { return b * x + cc; }, { color: 'blue', width: 3 });
        F.out.set('With <i>a</i> = 0 there is no <i>x</i><sup>2</sup> term, so this is a line, not a parabola.'); return;
      }
      var h = -b / (2 * a), kk = cc - b * b / (4 * a), disc = b * b - 4 * a * cc, f = function (x) { return a * x * x + b * x + cc; };
      if (show.axis) P.seg(h, v.ymin, h, v.ymax, { color: 'purple', width: 1.5, dash: [6, 5] });
      if (show.focus) { var p = 1 / (4 * a); P.seg(v.xmin, kk - p, v.xmax, kk - p, { color: 'teal', width: 1.5, dash: [3, 4] }); P.point(h, kk + p, { color: 'teal', r: 4.5 }); }
      P.plot(f, { color: 'blue', width: 3 });
      var rts = [];
      if (show.roots && disc >= -1e-12) { var sq = M.sqrt(M.max(0, disc)); rts = disc < 1e-12 ? [h] : [(-b - sq) / (2 * a), (-b + sq) / (2 * a)].sort(function (x, y) { return x - y; }); rts.forEach(function (r) { P.point(r, 0, { color: 'red', r: 5.5 }); }); }
      if (show.yint) P.point(0, cc, { color: 'green', r: 5 });
      if (show.vertex) { P.point(h, kk, { color: 'purple', r: 6.5 }); label(ctx, F.quiet ? 'vertex' : 'vertex (' + fr(h, 2) + ', ' + fr(kk, 2) + ')', P.X(h), P.Y(kk) + (a > 0 ? 20 : -20), { color: k.purple, clampW: c.w, clampH: c.h }); }
      s += 'Vertex form: <i>y</i> = ' + aS(a) + '(<i>x</i>' + sgnS(-h) + ')<sup>2</sup>' + (M.abs(kk) > 1e-12 ? sgnS(kk) : '') + '<br>';
      s += 'Standard form: <i>y</i> = ' + polyStr([cc, b, a], '<i>x</i>', true) + '<br>';
      var sd = surd(disc / (4 * a * a)), rational = sd && sd.indexOf('√') < 0;
      if (disc > 1e-12 && rts.length === 2) s += 'Factored form: <i>y</i> ' + (rational ? '=' : '≈') + ' ' + aS(a) + '(<i>x</i>' + sgnS(-rts[0]) + ')(<i>x</i>' + sgnS(-rts[1]) + ')<br>';
      else if (M.abs(disc) <= 1e-12) s += 'Factored form: <i>y</i> = ' + aS(a) + '(<i>x</i>' + sgnS(-h) + ')<sup>2</sup><br>';
      s += 'Opens ' + (a > 0 ? 'up' : 'down') + (M.abs(a) > 1 ? ', narrower than' : M.abs(a) < 1 ? ', wider than' : ', same width as') + ' <i>y</i> = ' + (a < 0 ? '−' : '') + '<i>x</i><sup>2</sup>. ';
      s += 'Axis <i>x</i> = ' + fr(h, 3) + '. Discriminant <i>b</i><sup>2</sup> − 4<i>ac</i> = ' + fr(disc, 3) + (disc > 1e-12 ? ': two real roots, ' + (sd && !rational ? '<i>x</i> = ' + (M.abs(h) > 1e-12 ? fr(h, 3) + ' ± ' : '±') + sd + ' ≈ ' : '') + rts.map(function (r) { return fr(r, 3); }).join(' and ') : M.abs(disc) <= 1e-12 ? ': one repeated root, ' + fr(h, 3) : ': no real roots (it never touches the <i>x</i>-axis)') + '.';
      if (form === 'vertex' && S.h < 0) s += '<br>Notice: <i>h</i> = ' + fm(S.h) + ' makes (<i>x</i> − (' + fm(S.h) + ')) = (<i>x</i> + ' + fm(-S.h) + '), and the graph moves <b>left</b>.';
      F.out.set(s);
      if (o.target) { var t = o.target; F.done(M.abs(h - nv(t.h, h)) < 1e-9 && M.abs(kk - nv(t.k, kk)) < 1e-9 && (t.a == null || M.abs(a - nv(t.a, a)) < 1e-9)); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* transformfn: how a, b, h and k move and stretch a parent function: g(x) = a·f(b(x − h)) + k.
     opts:
       parent: "x^2"                the parent function f (any CAS string in x)
       parents: ["x^2", "abs(x)", "sqrt(x)", "x^3", "1/x", "2^x"]   offer a choice of parents (omit for none)
       a: 1, b: 1, h: 0, k: 0       starting values
       use: ["a", "h", "k"]         which sliders to show (add "b" for horizontal stretches)
       points: true                 show key points of f and arrows to where they land on g
       xmin…ymax (−8…8), equal (true)
       target: {"a": 2, "h": 3, "k": -1}   with task: reach these values (only the ones given are checked) */
  var KEYX = { 'x^2': [-2, -1, 0, 1, 2], 'abs(x)': [-2, 0, 2], 'sqrt(x)': [0, 1, 4], 'x^3': [-1, 0, 1], '1/x': [-2, -1, 1, 2], '2^x': [-1, 0, 1, 2], 'sin(x)': [0, PI / 2, PI, 3 * PI / 2], 'cbrt(x)': [-1, 0, 1], 'x^(1/3)': [-1, 0, 1] };
  R('transformfn', function (el, o) {
    o = opt(o, { parent: 'x^2', a: 1, b: 1, h: 0, k: 0, use: ['a', 'h', 'k'], points: true, xmin: -8, xmax: 8, ymin: -8, ymax: 8, equal: true });
    var S = { a: nv(o.a, 1), b: nv(o.b, 1), h: nv(o.h, 0), k: nv(o.k, 0) }, par = o.parent, f = cf(par, ['x']);
    var F = frame(el, o, 'Transformations of a parent function'), c = F.canvas({ aspect: 1.3 }), P = V.plane(c, win(o, [-8, 8, -8, 8, true]));
    scrollOK(c);
    if (o.parents && o.parents.length > 1) V.seg(F.ctl, { label: 'Parent function', items: o.parents.map(function (p) { return [p, mathHTML(pretty(p))]; }), value: par, change: function (p) { par = p; f = cf(p, ['x']); draw(); } });
    var ctl2 = F.row();
    var sd = { a: ['a: stretch, flip', -4, 4, 0.25], b: ['b: horizontal', -4, 4, 0.25], h: ['h: left, right', -6, 6, 0.5], k: ['k: down, up', -6, 6, 0.5] };
    o.use.forEach(function (n) { var d = sd[n]; if (d) V.slider(ctl2, { label: d[0], min: d[1], max: d[2], step: d[3], value: S[n], input: function (v) { S[n] = v; draw(); } }); });
    function g(x) { return S.a * f(S.b * (x - S.h)) + S.k; }
    function words() {
      var w = [];
      if (S.a < 0) w.push('reflect over the <i>x</i>-axis (<i>a</i> &lt; 0)');
      if (M.abs(S.a) !== 1 && S.a !== 0) w.push('vertical ' + (M.abs(S.a) > 1 ? 'stretch' : 'shrink') + ' by ' + fr(M.abs(S.a), 3));
      if (S.b < 0) w.push('reflect over the <i>y</i>-axis (<i>b</i> &lt; 0)');
      if (M.abs(S.b) !== 1 && S.b !== 0) w.push('horizontal ' + (M.abs(S.b) > 1 ? 'shrink' : 'stretch') + ' by 1/' + fr(M.abs(S.b), 3) + ' = ' + fr(1 / M.abs(S.b), 3));
      if (S.h) w.push('shift <b>' + (S.h > 0 ? 'right' : 'left') + '</b> ' + fm(M.abs(S.h)));
      if (S.k) w.push('shift <b>' + (S.k > 0 ? 'up' : 'down') + '</b> ' + fm(M.abs(S.k)));
      return w.length ? w.join(', then ') : 'no change: <i>g</i> is the same as <i>f</i>';
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx;
      P.clear(); P.grid(); P.axes();
      P.plot(f, { color: 'muted', width: 2, dash: [7, 6] });
      if (S.b === 0) { F.out.set('With <i>b</i> = 0 the input is always 0, so <i>g</i> is flat. Move <i>b</i> away from 0.'); }
      P.plot(g, { color: 'blue', width: 3 });
      if (o.points && S.b !== 0) {
        (KEYX[par.replace(/\s/g, '')] || [-2, -1, 0, 1, 2]).forEach(function (x0) {
          var y0 = f(x0); if (!isFinite(y0)) return; var x1 = x0 / S.b + S.h, y1 = S.a * y0 + S.k;
          if (M.hypot(x1 - x0, y1 - y0) > 0.2) P.arrow(x0, y0, x1, y1, { color: rgba(k.gold, 0.9), width: 1.6, head: 8 });
          P.point(x0, y0, { color: 'muted', r: 3.5 }); P.point(x1, y1, { color: 'blue', r: 4.5 });
        });
      }
      curveLabel(ctx, P, c, f, 'f', k.muted); curveLabel(ctx, P, c, g, 'g', k.blue);
      if (S.b !== 0) {
        var bs = mco(S.b), as = mco(S.a), hs = '<i>x</i>' + (S.h ? (S.h > 0 ? ' − ' : ' + ') + fm(M.abs(S.h)) : '');
        var inner = bs ? bs + (S.h ? '(' + hs + ')' : '<i>x</i>') : hs;
        F.out.set('<span class="mla-key" style="--c:' + k.muted + '"></span><i>f</i>(<i>x</i>) = ' + mathHTML(pretty(par)) + ' &nbsp; <span class="mla-key" style="--c:' + k.blue + '"></span><i>g</i>(<i>x</i>) = ' + as + '<i>f</i>(' + inner + ')' + (S.k ? (S.k > 0 ? ' + ' : ' − ') + fm(M.abs(S.k)) : '') + '<br>From <i>f</i> to <i>g</i>: ' + words() + '.' + (o.points ? ' Each point (<i>x</i>, <i>y</i>) of <i>f</i> moves to (<i>x</i>/<i>b</i> + <i>h</i>, <i>a</i>·<i>y</i> + <i>k</i>).' : ''));
      }
      if (o.target) { var t = o.target; F.done(['a', 'b', 'h', 'k'].every(function (n) { return t[n] == null || M.abs(S[n] - nv(t[n], 0)) < 1e-9; })); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* exponential: y = a·bˣ (or a·e^(rx)): equal steps in x multiply y by the same factor.
     opts:
       a: 1, b: 2                   start value and growth factor (b < 1 is decay)
       base: "b"                    "b": sliders a and b · "e": sliders a and r for y = a·e^(rx)
       r: 0.5                       starting rate when base is "e"
       compare: true                also draw the line that grows by the same amount as the first step (adds, does not multiply)
       table: true                  a table for x = 0…5 with the ratio and difference of neighboring y values
       trace: true                  a point you drag along the curve
       xmin…ymax (−3, 6, −2, 20) */
  R('exponential', function (el, o) {
    o = opt(o, { a: 1, b: 2, base: 'b', r: 0.5, compare: true, table: true, trace: true, xmin: -3, xmax: 6, ymin: -2, ymax: 20 });
    var S = { a: nv(o.a, 1), b: nv(o.b, 2), r: nv(o.r, 0.5), x: 2 };
    var F = frame(el, o, 'Exponential growth and decay'), c = F.canvas({ aspect: 1.5 }), P = V.plane(c, win(o, [-3, 6, -2, 20]));
    function B() { return o.base === 'e' ? M.exp(S.r) : S.b; }
    function f(x) { return S.a * M.pow(B(), x); }
    var H = handles(c, P, o.trace ? [{ get: function () { return [S.x, f(S.x)]; }, set: function (x) { S.x = M.round(x * 10) / 10; } }] : [], { change: draw });
    c.cv.setAttribute('aria-label', 'Exponential graph. Left and right arrow keys move the point along the curve.');
    V.slider(F.ctl, { label: 'a (start value)', min: 0.25, max: M.max(5, M.ceil(S.a * 1.5)), step: 0.25, value: S.a, input: function (v) { S.a = v; draw(); } });
    if (o.base === 'e') V.slider(F.ctl, { label: 'r (continuous rate)', min: -1.5, max: 1.5, step: 0.05, value: S.r, input: function (v) { S.r = v; draw(); } });
    else V.slider(F.ctl, { label: 'b (growth factor)', min: 0.1, max: 4, step: 0.05, value: S.b, input: function (v) { S.b = v; draw(); } });
    var tbl = o.table ? mk('div', 'mla-tablewrap') : null; if (tbl) el.insertBefore(tbl, F.out.el);
    function draw() {
      var k = V.colors(), ctx = c.ctx, b = B(), v = P.view();
      P.clear(); P.grid(); P.axes();
      P.seg(v.xmin, 0, v.xmax, 0, { color: 'purple', width: 1.5, dash: [5, 5] });
      if (o.compare) { var d = f(1) - f(0); P.plot(function (x) { return S.a + d * x; }, { color: 'orange', width: 2.2, dash: [8, 6] }); }
      P.plot(f, { color: 'blue', width: 3 });
      for (var x = M.ceil(v.xmin); x <= M.floor(v.xmax); x++) { var y = f(x); if (y < v.ymax) P.point(x, y, { color: 'blue', r: 3.5 }); }
      if (o.trace) { var y0 = f(S.x); knob(ctx, P.X(S.x), P.Y(y0), k.red); if (!F.quiet) label(ctx, '(' + fm(S.x, 1) + ', ' + fm(y0, 3) + ')', P.X(S.x) + 12, P.Y(y0) - 16, { align: 'left', clampW: c.w, clampH: c.h }); }
      H.draw(ctx);
      if (b > 1) P.text('asymptote y = 0', v.xmax - (v.xmax - v.xmin) * 0.02, 0, { color: 'purple', size: 11, dy: 10, align: 'right' }); else P.text('asymptote y = 0', v.xmin + (v.xmax - v.xmin) * 0.02, 0, { color: 'purple', size: 11, dy: 10 });
      var pct = (b - 1) * 100, d1 = f(1) - f(0), s = '<span class="mla-key" style="--c:' + k.blue + '"></span><i>y</i> = ' + (S.a === 1 ? '' : fm(S.a) + '·') + (o.base === 'e' ? '<i>e</i><sup>' + mco(S.r, 2) + '<i>x</i></sup>' : fm(b) + '<sup><i>x</i></sup>');
      if (o.compare) s += ' &nbsp; <span class="mla-key" style="--c:' + k.orange + '"></span>line with the same first step: <i>y</i> = ' + fm(S.a) + (d1 < 0 ? ' − ' : ' + ') + mco(M.abs(d1), 3) + '<i>x</i>';
      s += '<br>Each step of 1 in <i>x</i> <b>multiplies</b> <i>y</i> by ' + fm(b, 4) + (M.abs(b - 1) < 1e-9 ? ' (no change).' : ' (a ' + fm(M.abs(pct), 2) + '% ' + (b > 1 ? 'increase' : 'decrease') + ').');
      if (b > 1) s += ' Doubling time: ' + fm(M.log(2) / M.log(b), 3) + '.'; else if (b < 1 && b > 0) s += ' Half-life: ' + fm(M.log(2) / -M.log(b), 3) + '.';
      if (o.trace) s += ' Point: (' + fm(S.x, 1) + ', ' + fm(f(S.x), 4) + ').';
      F.out.set(s);
      if (tbl) {
        var r1 = ['<i>x</i>'], r2 = ['<i>y</i>'], r3 = ['ratio'], r4 = ['difference'];
        for (var i = 0; i <= 5; i++) { r1.push(String(i)); r2.push(fm(f(i), 3)); r3.push(i ? '×' + fm(f(i) / f(i - 1), 3) : ''); r4.push(i ? (f(i) - f(i - 1) < 0 ? '−' : '+') + fm(M.abs(f(i) - f(i - 1)), 3) : ''); }
        tbl.innerHTML = tableT([r1, r2, r3, r4]);
      }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* logscale: logarithms count factors. Three views:
       "axis"   a linear and a logarithmic number line together; equal steps on the log line are equal factors
       "rule"   a slide rule: sliding one log scale along another adds logs, which multiplies numbers
       "graph"  y = bˣ and y = log_b(x), mirror images across y = x
     opts:
       mode: "axis"                 the starting view; modes: ["axis", "rule", "graph"] the views offered
       values: [2, 20, 200, 2000]   numbers marked on the two lines in "axis" mode
       x: 50                        the number you move in "axis" mode (1 to 10 000)
       a: 2, b: 3                   factors in "rule" mode (1 to 10)
       base: 2                      the base in "graph" mode
       quiet: false                 true: no logarithm values anywhere (the readout explains in words; the slide rule's
                                    product and the graph's point coordinates are not printed) */
  R('logscale', function (el, o) {
    o = opt(o, { mode: 'axis', modes: ['axis', 'rule', 'graph'], values: [2, 20, 200, 2000], x: 50, a: 2, b: 3, base: 2 });
    var S = { mode: o.mode, x: nv(o.x, 50), a: nv(o.a, 2), b: nv(o.b, 3), base: nv(o.base, 2), t: 1 }, quiet = !!(o.quiet || o.readout === false);
    var F = frame(el, o, 'Logarithmic scales', { quietSay: true }), c = F.canvas({ aspect: 1.7, min: 280 }), P = V.plane(c, { xmin: -3, xmax: 6, ymin: -3, ymax: 6, equal: true });
    var ctlA = mk('div', 'ml-ctl'), ctlR = mk('div', 'ml-ctl'), ctlG = mk('div', 'ml-ctl');
    if (o.modes.length > 1) V.seg(F.ctl, { label: 'View', items: o.modes.map(function (m) { return [m, { axis: 'Two number lines', rule: 'Slide rule', graph: 'Graphs' }[m]]; }), value: S.mode, change: function (m) { S.mode = m; show(); draw(); } });
    [ctlA, ctlR, ctlG].forEach(function (x) { el.insertBefore(x, F.out.el); });
    var sx = V.slider(ctlA, { label: 'x (or drag on either line)', min: 0, max: 4, step: 0.01, value: M.log10(S.x), fmt: function (p) { return fm(M.pow(10, p), M.pow(10, p) < 10 ? 2 : 0); }, input: function (p) { S.x = M.pow(10, p); draw(); } });
    var sa = V.slider(ctlR, { label: 'a (or drag the top scale)', min: 1, max: 10, step: 0.1, value: S.a, input: function (v) { S.a = v; draw(); } });
    V.slider(ctlR, { label: 'b', min: 1, max: 10, step: 0.1, value: S.b, input: function (v) { S.b = v; draw(); } });
    V.slider(ctlG, { label: 'base b', min: 1.2, max: 5, step: 0.1, value: S.base, input: function (v) { S.base = v; draw(); } });
    var st = V.slider(ctlG, { label: 'point at x', min: -2, max: 2.5, step: 0.05, value: S.t, input: function (v) { S.t = v; draw(); } });
    function show() { ctlA.hidden = S.mode !== 'axis'; ctlR.hidden = S.mode !== 'rule'; ctlG.hidden = S.mode !== 'graph'; c.q.fixed = S.mode !== 'graph'; c.q.height = S.mode === 'axis' ? 250 : S.mode === 'rule' ? 240 : 0; c.fit();  P.set({}); }
    show();
    var lay = {};
    V.drag(c.cv, {
      hit: function (px, py) { if (S.mode === 'axis') return M.abs(py - lay.yl) < 22 || M.abs(py - lay.yg) < 22 ? (M.abs(py - lay.yl) < 22 ? 'l' : 'g') : null; if (S.mode === 'rule') return py > lay.yD - 75 && py < lay.yD - 10 ? 'r' : null; var p = [P.X(S.t), P.Y(M.pow(S.base, S.t))]; return M.hypot(px - p[0], py - p[1]) < 24 ? 'p' : null; },
      start: function () { }, move: function (h, px) {
        if (h === 'l') S.x = clamp(lay.max * (px - lay.L) / (lay.Rr - lay.L), 1, 10000);
        else if (h === 'g') S.x = M.pow(10, clamp(4 * (px - lay.L) / (lay.Rr - lay.L), 0, 4));
        else if (h === 'r') { S.a = M.round(clamp(M.pow(10, (px - lay.L - (lay.grab || 0)) / lay.u), 1, 10) * 10) / 10; sa.set(S.a); }
        else { S.t = M.round(clamp(P.x(px), -2, 2.5) * 20) / 20; st.set(S.t); }
        if (h === 'l' || h === 'g') sx.set(M.log10(S.x)); draw();
      }
    });
    function line(ctx, x0, x1, y, k) { ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore(); }
    function tick(ctx, x, y, h, s, k, col, up) { ctx.save(); ctx.strokeStyle = col || k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y + h); ctx.stroke(); ctx.restore(); if (s) txt(ctx, s, x, up ? y - h - 8 : y + h + 9, { align: 'center', color: col || k.muted, size: 11 }); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, L = 34, Rr = w - 24;
      P.clear();
      if (S.mode === 'axis') {
        var yl = h * 0.3, yg = h * 0.67, max = 10000; lay = { yl: yl, yg: yg, L: L, Rr: Rr, max: max }; var X1 = function (v) { return L + (Rr - L) * v / max; }, X2 = function (v) { return L + (Rr - L) * M.log10(v) / 4; };
        var nar = w < 560;
        txt(ctx, nar ? 'Linear: equal steps add' : 'Linear scale: equal steps add the same amount', L - 10, yl - 34, { color: k.ink, size: 13 });
        txt(ctx, nar ? 'Log: equal steps multiply' : 'Log scale: equal steps multiply by the same factor', L - 10, yg - 34, { color: k.ink, size: 13 });
        line(ctx, L, Rr, yl, k); line(ctx, L, Rr, yg, k);
        for (var v = 0; v <= max; v += nar ? 2500 : 2000) tick(ctx, X1(v), yl, 5, nar && v % 5000 ? '' : fm(v, 0), k);
        for (var p = 0; p <= 4; p++) { tick(ctx, X2(M.pow(10, p)), yg, 6, p < 2 ? fm(M.pow(10, p), 0) : '10' + sup(p), k); if (p < 4) for (var j = 2; j < 10; j++) tick(ctx, X2(j * M.pow(10, p)), yg, 3, '', k); }
        for (p = 0; p < 4; p++) { var xa = X2(M.pow(10, p)), xb = X2(M.pow(10, p + 1)); ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(xa + 3, yg + 26); ctx.quadraticCurveTo((xa + xb) / 2, yg + 40, xb - 3, yg + 26); ctx.stroke(); ctx.restore(); txt(ctx, '×10', (xa + xb) / 2, yg + 44, { align: 'center', color: k.gold, size: 11 }); }
        o.values.forEach(function (q, i) { var col = k[PAL[(i + 2) % PAL.length]]; q = nv(q, 1); if (q <= 0) return; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X1(q), yl, 4.5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(X2(q), yg, 4.5, 0, TAU); ctx.fill(); });
        var xp = S.x; knob(ctx, X1(xp), yl, k.red); knob(ctx, X2(xp), yg, k.red);
        label(ctx, fm(xp, xp < 10 ? 2 : 0), X2(xp), yg - 18, { color: k.red, clampW: w });
        if (quiet) F.out.set('Equal steps on the log line multiply by the same factor. How far <i>x</i> sits along it, counted in factors of 10, is its logarithm. The marked values are crowded on the linear line and evenly spaced on the log line.');
        else F.out.set('<i>x</i> = ' + fm(xp, xp < 10 ? 3 : 1) + ' = 10<sup>' + fm(M.log10(xp), 3) + '</sup>, so log<sub>10</sub> ' + fm(xp, xp < 10 ? 3 : 1) + ' ≈ <b>' + fm(M.log10(xp), 3) + '</b>: its distance along the log line, counted in factors of 10. The marked values ' + o.values.map(function (q) { return fm(nv(q, 1)); }).join(', ') + ' are crowded on the linear line and evenly spaced on the log line.');
      } else if (S.mode === 'rule') {
        var u = (Rr - L) / 2, D2 = function (v) { return L + u * M.log10(v); }, yD = h * 0.6, off = u * M.log10(S.a), prod = S.a * S.b; lay = { yD: yD, L: L, u: u };
        var nr = w < 560;
        txt(ctx, nr ? 'Slide the top scale: its 1 goes over a' : 'Top scale slides: its 1 sits over a on the bottom scale', L - 10, 18, { color: k.ink, size: 13 });
        ctx.save(); ctx.fillStyle = rgba(k.blue, 0.12); rrect(ctx, L + off - 6, yD - 64, u + 12, 44, 8); ctx.fill(); ctx.fillStyle = rgba(k.green, 0.1); rrect(ctx, L - 6, yD - 14, 2 * u + 12, 50, 8); ctx.fill(); ctx.restore();
        line(ctx, L + off, L + off + u, yD - 30, k); line(ctx, L, L + 2 * u, yD, k);
        for (var t = 1; t <= 10; t++) tick(ctx, L + off + u * M.log10(t), yD - 30, t === 1 || t === 10 ? 8 : 5, !nr || t <= 5 || t === 10 ? String(t) : '', k, k.blue, true);
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(function (q) { tick(ctx, D2(q), yD, q === 1 || q === 10 || q === 100 ? 8 : 5, (nr ? [1, 2, 3, 5, 10, 20, 50, 100].indexOf(q) >= 0 : q <= 10 || q % 20 === 0 || q === 100) ? String(q) : '', k, k.green); });
        var xa2 = D2(S.a), xp2 = D2(prod);
        ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(xp2, yD - 52); ctx.lineTo(xp2, yD + 12); ctx.stroke(); ctx.restore();
        arrowPx(ctx, L, yD + 46, xa2, yD + 46, k.purple, 3); arrowPx(ctx, xa2, yD + 46, xp2, yD + 46, k.orange, 3);
        txt(ctx, 'log a', (L + xa2) / 2, yD + 60, { align: 'center', color: k.purple, size: 12 }); txt(ctx, '+ log b', (xa2 + xp2) / 2, yD + 60, { align: 'center', color: k.orange, size: 12 });
        label(ctx, quiet ? 'a·b' : 'a·b = ' + fm(prod, 2), xp2, yD - 66, { color: k.red, bold: true, clampW: w });
        if (quiet) F.out.set('Sliding the top scale adds the lengths log <i>a</i> + log <i>b</i>, and adding logs multiplies the numbers: read <i>a</i>·<i>b</i> under the dashed line.');
        else F.out.set('log ' + fm(S.a, 2) + ' + log ' + fm(S.b, 2) + ' = ' + fm(M.log10(S.a), 3) + ' + ' + fm(M.log10(S.b), 3) + ' = ' + fm(M.log10(prod), 3) + ' = log ' + fm(prod, 3) + '. Adding the lengths multiplies the numbers: ' + fm(S.a, 2) + ' × ' + fm(S.b, 2) + ' = <b>' + fm(prod, 3) + '</b>.');
      } else {
        var b = S.base; P.set({ xmin: -3, xmax: 6, ymin: -3, ymax: 6 }); P.clear(); P.grid(); P.axes();
        P.plot(function (x) { return x; }, { color: 'muted', width: 1.5, dash: [6, 5] });
        P.plot(function (x) { return M.pow(b, x); }, { color: 'blue', width: 3 }); P.plot(function (x) { return M.log(x) / M.log(b); }, { color: 'red', width: 3 });
        var px = S.t, py = M.pow(b, px);
        P.seg(px, py, py, px, { color: 'gold', width: 1.5, dash: [3, 3] }); P.point(px, py, { color: 'blue', r: 6 }); P.point(py, px, { color: 'red', r: 6 });
        if (!quiet) {
          label(ctx, '(' + fm(px, 2) + ', ' + fm(py, 2) + ')', P.X(px) - 10, P.Y(py) - 16, { color: k.blue, align: 'right', clampW: w, clampH: h });
          label(ctx, '(' + fm(py, 2) + ', ' + fm(px, 2) + ')', P.X(py) + 10, P.Y(px) + 16, { color: k.red, align: 'left', clampW: w, clampH: h });
        }
        curveLabel(ctx, P, c, function (x) { return M.pow(b, x); }, 'y = ' + fm(b) + 'ˣ', k.blue); curveLabel(ctx, P, c, function (x) { return M.log(x) / M.log(b); }, 'y = log' + (b === M.round(b) ? sub(b) : '_b') + ' x', k.red);
        if (quiet) F.out.set('The logarithm undoes the power, so the two graphs swap <i>x</i> and <i>y</i>: <span class="mla-key" style="--c:' + k.blue + '"></span>the power and <span class="mla-key" style="--c:' + k.red + '"></span>the logarithm are mirror images across <i>y</i> = <i>x</i>.');
        else F.out.set('<span class="mla-key" style="--c:' + k.blue + '"></span>' + fm(b) + '<sup>' + fm(px, 2) + '</sup> = ' + fm(py, 3) + ' &nbsp;⇔&nbsp; <span class="mla-key" style="--c:' + k.red + '"></span>log<sub>' + fm(b) + '</sub> ' + fm(py, 3) + ' = ' + fm(px, 2) + '. The logarithm undoes the power, so the two graphs swap <i>x</i> and <i>y</i>: mirror images across <i>y</i> = <i>x</i>.');
      }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  // grid and axes with x ticks at multiples of pi (or of 90 degrees)
  function piAxes(P, c, deg, yl) {
    var k = V.colors(), ctx = c.ctx, v = P.view(), sp = PI / 2;
    while (sp * P.unit < 46) sp *= 2;
    if (sp * P.unit > 160) sp /= 2;
    var vy = v.ymax - v.ymin, dy = vy > 16 ? 5 : vy > 7 ? 2 : vy > 3 ? 1 : 0.5;
    P.grid({ step: sp, stepY: dy }); P.axes({ labels: false });
    var ay = clamp(P.Y(0), 0, c.h), ax = clamp(P.X(0), 0, c.w);
    ctx.save(); ctx.fillStyle = k.muted; ctx.font = '12px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (var x = M.ceil(v.xmin / sp) * sp; x <= v.xmax + 1e-9; x += sp) { if (M.abs(x) < 1e-9) continue; var px = P.X(x); if (px < 12 || px > c.w - 12) continue; ctx.fillText(deg ? fm(x * 180 / PI, 0) + '°' : pf(x), px, M.min(ay + 4, c.h - 16)); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (var y = M.ceil(v.ymin / dy) * dy; y <= v.ymax + 1e-9; y += dy) { if (M.abs(y) < 1e-9) continue; var py = P.Y(y); if (py < 8 || py > c.h - 8) continue; ctx.fillText(fm(y, 2), M.max(ax - 5, 26), py); }
    if (yl) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = 'italic 14px Georgia,serif'; ctx.fillText(yl, ax + 6, 4); }
    ctx.restore();
  }
  function angStr(deg, units) { var r = deg * PI / 180; return units === 'rad' ? pf(r) + (ratio(r / PI, 12) ? '' : ' rad') : fm(deg, 1) + '°'; }

  /* unitcircle: the angle, the point (cos θ, sin θ) and the sine and cosine graphs being traced.
     opts:
       angle: 30                    starting angle in degrees
       units: "deg"                 "deg" or "rad" (labels and readout in multiples of π)
       snap: 15                     the angle snaps to multiples of this many degrees (0 = free; 5 is gentle)
       graph: "both"                "sin", "cos", "both", "tan" or "none": the graph traced beside the circle
       ref: true                    show the reference angle
       signs: false                 show the signs of (cos, sin) in each quadrant
       play: true                   a button that turns the angle around once
       target: 225                  with task: an angle to reach (degrees) */
  R('unitcircle', function (el, o) {
    o = opt(o, { angle: 30, units: 'deg', snap: 15, graph: 'both', ref: true, signs: false, play: true });
    var S = { th: nv(o.angle, 30) }, playing = null;
    var F = frame(el, o, 'Unit circle with the sine and cosine graphs'), c = F.canvas({ aspect: 2 }), L = {};
    function layout() {
      var w = c.w, wide = w >= 560 && o.graph !== 'none', nR = w * 0.31;
      c.q.fixed = true; c.q.max = 2000; c.q.height = o.graph === 'none' ? M.min(420, w * 0.9) : wide ? clamp(w * 0.44, 260, 400) : M.round(nR * 1.25 * 2 + 26 + nR * 2.5 + 6); c.fit();
      var h = c.h;
      if (o.graph === 'none') { L.R = M.min(w, h) * 0.38; L.cx = w / 2; L.cy = h / 2; }
      else if (wide) { L.R = h * 0.38; L.cx = h * 0.48; L.cy = h / 2; L.gx = h * 0.97 + 14; L.gw = w - L.gx - 16; L.gy = L.cy; }
      else { L.R = nR; L.cx = w / 2; L.cy = nR * 1.25; L.gx = 30; L.gw = w - 46; L.gy = L.cy * 2 + 26 + nR * 1.25; }
      L.wide = wide;
    }
    c.onResize(function () { layout(); draw(); });
    layout();
    function snapA(a) { var s = o.snap || 0; a = ((a % 360) + 360) % 360; return s ? M.round(a / s) * s % 360 || (a > 359 && !s ? 0 : M.round(a / s) * s) : M.round(a * 10) / 10; }
    var sl = V.slider(F.ctl, { label: 'Angle θ', min: 0, max: 360, step: o.snap || 1, value: S.th, fmt: function (v) { return angStr(v, o.units); }, input: function (v) { S.th = v; draw(); } });
    if (o.play) { var pb = V.button(F.ctl, '▶ Turn around once', function () {
      if (playing) { playing.stop(); playing = null; pb.textContent = '▶ Turn around once'; return; }
      var t0 = S.th >= 359 ? 0 : S.th, acc = 0; pb.textContent = '❚❚ Pause';
      playing = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.6) return; acc = 0; t0 += 15; } else t0 += dt * 45; S.th = M.min(360, t0); sl.set(S.th); draw(); if (S.th >= 360) { playing.stop(); playing = null; pb.textContent = '▶ Turn around once'; } });
    }); }
    V.drag(c.cv, {
      hit: function (px, py) { var x = L.cx + L.R * M.cos(S.th * PI / 180), y = L.cy - L.R * M.sin(S.th * PI / 180); if (M.hypot(px - x, py - y) < 28 || M.abs(M.hypot(px - L.cx, py - L.cy) - L.R) < 18) return 'c'; if (L.gw && px > L.gx - 10 && px < L.gx + L.gw + 10 && M.abs(py - L.gy) < L.R * 1.3) return 'g'; return null; },
      start: function (h, px, py) { this.move(h, px, py); },
      move: function (h, px, py) { var a = h === 'c' ? M.atan2(L.cy - py, px - L.cx) * 180 / PI : (px - L.gx) / L.gw * 360; if (h === 'c' && a < 0) a += 360; S.th = clamp(o.snap ? M.round(a / o.snap) * o.snap : M.round(a), 0, 360); sl.set(S.th); draw(); }
    });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Unit circle. Drag the point or use the arrow keys to change the angle.');
    c.cv.addEventListener('keydown', function (e) { var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return; S.th = clamp(S.th + d * (o.snap || 1) * (e.shiftKey ? 3 : 1), 0, 360); sl.set(S.th); draw(); e.preventDefault(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, th = S.th * PI / 180, cs = M.cos(th), sn = M.sin(th), cx = L.cx, cy = L.cy, Rr = L.R;
      var px = cx + Rr * cs, py = cy - Rr * sn;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1;
      for (var g = -1; g <= 1; g += 0.5) { ctx.beginPath(); ctx.moveTo(cx - Rr * 1.2, cy - g * Rr); ctx.lineTo(cx + Rr * 1.2, cy - g * Rr); ctx.moveTo(cx + g * Rr, cy - Rr * 1.2); ctx.lineTo(cx + g * Rr, cy + Rr * 1.2); ctx.stroke(); }
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - Rr * 1.25, cy); ctx.lineTo(cx + Rr * 1.25, cy); ctx.moveTo(cx, cy - Rr * 1.25); ctx.lineTo(cx, cy + Rr * 1.25); ctx.stroke();
      ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, TAU); ctx.stroke(); ctx.restore();
      txt(ctx, '1', cx + Rr + 4, cy + 10, { size: 11 }); txt(ctx, '−1', cx - Rr - 16, cy + 10, { size: 11 });
      if (o.signs) [[1, 1, '(+, +)'], [-1, 1, '(−, +)'], [-1, -1, '(−, −)'], [1, -1, '(+, −)']].forEach(function (q) { txt(ctx, q[2], cx + q[0] * Rr * 0.48, cy - q[1] * Rr * 0.5, { align: 'center', color: k.muted, size: 12 }); });
      // angle arc and reference angle
      ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, Rr * 0.22, 0, -th, true); ctx.stroke(); ctx.restore();
      if (o.ref && S.th % 90 !== 0) {
        var q = M.floor(S.th / 90) % 4, ra = [S.th, 180 - S.th, S.th - 180, 360 - S.th][q], toAx = q === 0 || q === 3 ? 0 : PI;
        ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx, cy, Rr * 0.34, -toAx, -th, (q === 0 || q === 2)); ctx.stroke(); ctx.restore();
      }
      // triangle legs
      ctx.save(); ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.strokeStyle = k.blue; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
      ctx.strokeStyle = k.red; ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); ctx.restore();
      if (o.graph === 'tan' && M.abs(cs) > 0.05) { var ty = cy - Rr * sn / cs; ctx.save(); ctx.beginPath(); ctx.rect(0, cy - Rr * 1.25, L.wide ? L.gx - 8 : w, Rr * 2.5); ctx.clip(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx + Rr, cy); ctx.lineTo(cx + Rr, clamp(ty, -2e3, 2e3)); ctx.stroke(); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Rr, ty); ctx.stroke(); ctx.restore(); }
      if (M.abs(cs) > 0.12) txt(ctx, 'cos θ', (cx + px) / 2, cy + (sn >= 0 ? 13 : -13), { align: 'center', color: k.blue, size: 12, bold: true });
      if (M.abs(sn) > 0.12) txt(ctx, 'sin θ', px + (cs >= 0 ? 6 : -6), (cy + py) / 2, { align: cs >= 0 ? 'left' : 'right', color: k.red, size: 12, bold: true });
      knob(ctx, px, py, k.ink, 8);
      var ex = exact(cs), ey = exact(sn);
      if (!F.quiet) label(ctx, '(' + (ex || fm(cs, 3)) + ', ' + (ey || fm(sn, 3)) + ')', px + (cs >= 0 ? 12 : -12), py + (sn >= 0 ? -16 : 16), { align: cs >= 0 ? 'left' : 'right', clampW: L.wide ? L.gx - 6 : w, clampH: h });
      // graph
      if (L.gw) {
        var gx = L.gx, gw = L.gw, gy = L.gy, X = function (a) { return gx + gw * a / TAU; }, Y = function (v) { return gy - Rr * v; };
        ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath();
        for (var t = 0; t <= 4; t++) { ctx.moveTo(X(t * PI / 2), gy - Rr * 1.15); ctx.lineTo(X(t * PI / 2), gy + Rr * 1.15); }
        [-1, 1].forEach(function (v) { ctx.moveTo(gx, Y(v)); ctx.lineTo(gx + gw, Y(v)); }); ctx.stroke();
        ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw + 6, gy); ctx.moveTo(gx, gy - Rr * 1.2); ctx.lineTo(gx, gy + Rr * 1.2); ctx.stroke(); ctx.restore();
        for (t = 1; t <= 4; t++) txt(ctx, o.units === 'rad' ? pf(t * PI / 2) : t * 90 + '°', X(t * PI / 2), gy + 12, { align: 'center', size: 11 });
        txt(ctx, '1', gx - 5, Y(1), { align: 'right', size: 11 }); txt(ctx, '−1', gx - 5, Y(-1), { align: 'right', size: 11 });
        ctx.save(); ctx.beginPath(); ctx.rect(gx - 4, gy - Rr * 1.25, gw + 14, Rr * 2.5); ctx.clip();
        var fns = o.graph === 'both' ? [['cos', k.blue], ['sin', k.red]] : o.graph === 'tan' ? [['tan', k.purple]] : [[o.graph, o.graph === 'cos' ? k.blue : k.red]];
        fns.forEach(function (fp) {
          var fn = M[fp[0]];
          [[0, TAU, 0.22, 1.5], [0, th, 1, 3]].forEach(function (seg) {
            ctx.save(); ctx.strokeStyle = fp[1]; ctx.globalAlpha = seg[2]; ctx.lineWidth = seg[3]; ctx.beginPath(); var pen = false, last = 0;
            for (var i = 0; i <= 360; i++) { var a = seg[0] + (seg[1] - seg[0]) * i / 360, yv = fn(a); if (M.abs(yv) > 3 || (pen && M.abs(yv - last) > 2)) { pen = false; last = yv; continue; } if (pen) ctx.lineTo(X(a), Y(yv)); else { ctx.moveTo(X(a), Y(yv)); pen = true; } last = yv; }
            ctx.stroke(); ctx.restore();
          });
        });
        ctx.save(); ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
        if (o.graph === 'sin' || o.graph === 'both') { ctx.strokeStyle = k.red; ctx.beginPath(); if (L.wide) { ctx.moveTo(px, py); ctx.lineTo(X(th), py); } ctx.stroke(); }
        ctx.strokeStyle = k.muted; ctx.beginPath(); ctx.moveTo(X(th), gy - Rr * 1.15); ctx.lineTo(X(th), gy + Rr * 1.15); ctx.stroke(); ctx.restore();
        fns.forEach(function (fp) { var yv = M[fp[0]](th); if (M.abs(yv) <= 1.6) { ctx.fillStyle = fp[1]; ctx.beginPath(); ctx.arc(X(th), Y(yv), 5, 0, TAU); ctx.fill(); } });
        ctx.restore();
        if (!L.wide) txt(ctx, o.graph === 'both' ? 'cos θ and sin θ as θ goes around' : fns[0][0] + ' θ as θ goes around', gx, gy - Rr * 1.25, { size: 12, color: k.ink });
      }
      var tn = M.abs(cs) < 1e-12 ? null : sn / cs, rs = '';
      if (o.ref && S.th % 90 !== 0) { var qq = M.floor(S.th / 90) % 4; rs = ' Reference angle: ' + angStr([S.th, 180 - S.th, S.th - 180, 360 - S.th][qq], o.units) + ' (quadrant ' + ['I', 'II', 'III', 'IV'][qq] + ').'; }
      F.out.set('θ = ' + angStr(S.th, 'deg') + (ratio(th / PI, 12) ? ' = ' + pf(th) + ' rad' : ' ≈ ' + fm(th, 3) + ' rad') + '. Point on the circle: (cos θ, sin θ) = (<span class="mla-b">' + (ex || fm(cs, 4)) + '</span>, <span class="mla-r">' + (ey || fm(sn, 4)) + '</span>)' + ((ex && ex.indexOf('√') >= 0) || (ey && ey.indexOf('√') >= 0) ? ' ≈ (' + fm(cs, 3) + ', ' + fm(sn, 3) + ')' : '') + '. tan θ = sin θ / cos θ = ' + (tn === null ? 'undefined' : (exact(tn) || fm(tn, 4))) + '.' + rs);
      if (o.target != null) F.done(M.abs(S.th - nv(o.target, -1)) < 1e-9);
    }
    V.onTheme(draw); draw();
    return { draw: draw };
  });

  /* trigwave: y = A·sin(B(x − C)) + D (or cos, tan) with sliders, amplitude, period, phase shift and midline marked.
     opts:
       fn: "sin"                    "sin", "cos" or "tan"; fns: ["sin", "cos"] offers a choice
       A: 1, B: 1, C: 0, D: 0       starting values (C may be a string like "pi/4")
       use: ["A", "B", "C", "D"]    which sliders to show
       units: "rad"                 x-axis in multiples of π ("rad") or degrees ("deg")
       parent: true                 draw the parent y = sin x dashed
       xmin…ymax (−π, 3π, −4, 4)
       target: {"A": 2, "B": 2}     with task: values to reach (only those given are checked) */
  R('trigwave', function (el, o) {
    o = opt(o, { fn: 'sin', A: 1, B: 1, C: 0, D: 0, use: ['A', 'B', 'C', 'D'], units: 'rad', parent: true, xmin: -PI, xmax: 3 * PI, ymin: -4, ymax: 4 });
    var S = { A: nv(o.A, 1), B: nv(o.B, 1), C: nv(o.C, 0), D: nv(o.D, 0), fn: o.fn };
    var F = frame(el, o, 'Sinusoid with amplitude, period, phase shift and midline'), c = F.canvas({ aspect: 1.8 }), P = V.plane(c, win(o, [-PI, 3 * PI, -4, 4]));
    scrollOK(c);
    if (o.fns && o.fns.length > 1) V.seg(F.ctl, { label: 'Function', items: o.fns.map(function (f) { return [f, f]; }), value: S.fn, change: function (v) { S.fn = v; draw(); } });
    var sd = { A: ['A: amplitude', -4, 4, 0.25], B: ['B: frequency', 0.25, 4, 0.25], C: ['C: phase shift', -2 * PI, 2 * PI, PI / 12], D: ['D: midline', -3, 3, 0.25] };
    o.use.forEach(function (n) { var d = sd[n]; V.slider(F.ctl, { label: d[0], min: d[1], max: d[2], step: d[3], value: S[n], fmt: n === 'C' ? function (v) { return o.units === 'deg' ? fm(v * 180 / PI, 0) + '°' : pf(v); } : null, input: function (v) { S[n] = v; draw(); } }); });
    function f(x) { return S.A * M[S.fn](S.B * (x - S.C)) + S.D; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view(), A = S.A, B = S.B, C = S.C, D = S.D, per = (S.fn === 'tan' ? PI : TAU) / M.abs(B), deg = o.units === 'deg';
      P.clear(); piAxes(P, c, deg, 'y');
      P.seg(v.xmin, D, v.xmax, D, { color: 'purple', width: 1.5, dash: [6, 5] });
      if (o.parent) P.plot(function (x) { return M[S.fn](x); }, { color: 'muted', width: 1.6, dash: [5, 6] });
      P.plot(f, { color: 'blue', width: 3 });
      var by = S.fn === 'tan' ? D : D - M.abs(A) - 0.35;
      if (S.fn !== 'tan') {
        var xs = C; while (xs + per > v.xmax) xs -= per; while (xs < v.xmin) xs += per;
        P.arrow(xs + per / 2, by, xs, by, { color: 'green', width: 2, head: 8 }); P.arrow(xs + per / 2, by, xs + per, by, { color: 'green', width: 2, head: 8 });
        label(ctx, F.quiet ? 'period' : 'period ' + (deg ? fm(per * 180 / PI, 1) + '°' : pf(per)), P.X(xs + per / 2), P.Y(by) + 14, { color: k.green, clampW: c.w, clampH: c.h });
        var xm = C + (S.fn === 'sin' ? per / 4 : 0) * (A < 0 ? 3 : 1); while (xm > v.xmax) xm -= per; while (xm < v.xmin) xm += per;
        if (A !== 0) { P.arrow(xm, D, xm, D + M.abs(A), { color: 'red', width: 2, head: 8 }); label(ctx, F.quiet ? 'amplitude' : 'amplitude ' + fm(M.abs(A)), P.X(xm) + 8, P.Y(D + M.abs(A) / 2), { color: k.red, align: 'left', clampW: c.w, clampH: c.h }); }
        P.point(C, f(C), { color: 'gold', r: 5.5 });
      }
      label(ctx, F.quiet ? 'midline' : 'midline y = ' + fm(D), P.X(v.xmax) - 6, P.Y(D) + 13, { color: k.purple, align: 'right', clampW: c.w, clampH: c.h });
      var Cs = deg ? fm(C * 180 / PI, 1) + '°' : pf(C), BCs = deg ? fm(B * C * 180 / PI, 1) + '°' : pf(B * C), Bs = mco(B, 3);
      var form = (mco(A) || '') + S.fn + '(' + (B === 1 ? '<i>x</i>' + (C ? (C > 0 ? ' − ' : ' + ') + (deg ? fm(M.abs(C) * 180 / PI, 1) + '°' : pf(M.abs(C))) : '') : Bs + (C ? '(<i>x</i>' + (C > 0 ? ' − ' : ' + ') + (deg ? fm(M.abs(C) * 180 / PI, 1) + '°' : pf(M.abs(C))) + ')' : '<i>x</i>')) + ')' + (D ? (D > 0 ? ' + ' : ' − ') + fm(M.abs(D)) : '');
      var s = '<i>y</i> = ' + form;
      if (B !== 1 && C) s += ' = ' + (mco(A) || '') + S.fn + '(' + Bs + '<i>x</i> ' + (B * C > 0 ? '− ' : '+ ') + BCs.replace('−', '') + ')' + (D ? (D > 0 ? ' + ' : ' − ') + fm(M.abs(D)) : '');
      s += '<br>' + (S.fn === 'tan' ? 'Vertical stretch |<i>A</i>| = ' + fm(M.abs(A)) : 'Amplitude |<i>A</i>| = ' + fm(M.abs(A))) + ' · period ' + (S.fn === 'tan' ? 'π' : '2π') + '/|<i>B</i>| = ' + (deg ? fm(per * 180 / PI, 1) + '°' : pf(per)) + ' · phase shift ' + (C ? Cs.replace('−', '') + ' to the ' + (C > 0 ? 'right' : 'left') : '0') + ' · midline <i>y</i> = ' + fm(D) + (S.fn !== 'tan' ? ' · max ' + fm(D + M.abs(A)) + ', min ' + fm(D - M.abs(A)) : '') + '.';
      if (B !== 1 && C) s += '<br>Watch out: in ' + S.fn + '(' + Bs + '<i>x</i> − ' + BCs + ') the shift is ' + BCs + ' ÷ ' + fm(B) + ' = ' + Cs + ', not ' + BCs + '.';
      F.out.set(s);
      if (o.target) { var t = o.target; F.done(['A', 'B', 'C', 'D'].every(function (n) { return t[n] == null || M.abs(S[n] - nv(t[n], 0)) < 1e-6; })); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* polar: r = f(θ) traced as θ sweeps, with the ray, negative r explained, and the r-versus-θ graph.
     opts:
       r: "1+cos(theta)"           the curve (use theta); params: {…} adds sliders
       t0: 0, t1: "2pi"             the θ range
       theta: "pi/3"                starting θ
       rect: true                   also show r against θ on ordinary axes
       units: "rad"                 θ shown in multiples of π ("rad") or degrees ("deg")
       max: 0                       the radius shown (0 = fit the curve)
       point: [2, 60]               no curve: a point you drag, given as [r, θ in degrees]; shows both coordinate systems
       target: [-1.5, 2.6]          with task (point mode): move the point to these rectangular coordinates (±0.13)
       play: true                   a button that sweeps θ */
  R('polar', function (el, o) {
    o = opt(o, { r: o.point ? null : '1+cos(theta)', t0: 0, t1: '2pi', theta: 'pi/3', rect: true, units: 'rad', max: 0, play: true });
    var Pm = {}, ps = params(o.params), fr0 = o.r ? cf(o.r, ['theta'], Pm) : null, t0 = nv(o.t0, 0), t1 = nv(o.t1, TAU);
    var S = { th: nv(o.theta, PI / 3), pr: o.point ? nv(o.point[0], 2) : 0, pt: o.point ? nv(o.point[1], 60) * PI / 180 : 0 }, playing = null;
    var rect = o.rect && !!fr0;
    var F = frame(el, o, o.r ? 'Polar graph of r = ' + o.r : 'A point in polar coordinates'), c = F.canvas({ aspect: 1 }), L = {};
    function layout() { var w = c.w, wide = rect && w >= 560; c.q.fixed = true; c.q.max = 2000; c.q.height = !rect ? M.min(460, w) : wide ? clamp(w * 0.5, 280, 420) : M.round(w + 176); c.fit(); L.wide = wide; var h = c.h; if (!rect) { L.cx = w / 2; L.cy = h / 2; L.R = M.min(w, h) * 0.44; } else if (wide) { L.cx = h / 2; L.cy = h / 2; L.R = h * 0.44; L.gx = h + 26; L.gw = w - L.gx - 12; L.gy0 = 16; L.gh = h - 52; } else { L.cx = w / 2; L.cy = w / 2; L.R = w * 0.44; L.gx = 34; L.gw = w - 46; L.gy0 = w + 22; L.gh = 130; } }
    c.onResize(function () { layout(); draw(); }); layout();
    function rmax() { if (o.max) return nv(o.max, 3); if (!fr0) return M.max(4, M.ceil(M.abs(S.pr) + 1)); var m = 0; for (var i = 0; i <= 400; i++) { var r = fr0(t0 + (t1 - t0) * i / 400); if (isFinite(r)) m = M.max(m, M.abs(r)); } return m > 0 ? niceUp(m) : 1; }
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    var sl = fr0 ? V.slider(F.ctl, { label: 'θ', min: t0, max: t1, step: (t1 - t0) / 240, value: S.th, fmt: function (v) { return o.units === 'deg' ? fm(v * 180 / PI, 0) + '°' : pf(v, 2); }, input: function (v) { S.th = v; draw(); } }) : null;
    if (fr0 && o.play) { var pb = V.button(F.ctl, '▶ Sweep θ', function () {
      if (playing) { playing.stop(); playing = null; pb.textContent = '▶ Sweep θ'; return; }
      if (S.th >= t1 - 1e-6) S.th = t0; pb.textContent = '❚❚ Pause'; var acc = 0;
      playing = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.5) return; acc = 0; S.th += (t1 - t0) / 24; } else S.th += dt * (t1 - t0) / 6; S.th = M.min(t1, S.th); sl.set(S.th); draw(); if (S.th >= t1) { playing.stop(); playing = null; pb.textContent = '▶ Sweep θ'; } });
    }); }
    var scale = 1;
    V.drag(c.cv, {
      hit: function (px, py) { if (!fr0) { var p = [L.cx + S.pr * scale * M.cos(S.pt), L.cy - S.pr * scale * M.sin(S.pt)]; return M.hypot(px - p[0], py - p[1]) < 28 ? 'p' : null; } if (rect && px > L.gx - 8 && py > L.gy0 - 8 && py < L.gy0 + L.gh + 8) return 'g'; return 'c'; },
      move: function (h, px, py) {
        if (h === 'p') { var x = (px - L.cx) / scale, y = (L.cy - py) / scale; S.pr = M.round(M.hypot(x, y) * 4) / 4; S.pt = M.round(M.atan2(y, x) * 180 / PI / 15) * 15 * PI / 180; if (S.pt < 0) S.pt += TAU; }
        else if (h === 'g') { S.th = clamp(t0 + (px - L.gx) / L.gw * (t1 - t0), t0, t1); sl.set(S.th); }
        else { var a = M.atan2(L.cy - py, px - L.cx); if (a < 0) a += TAU; while (a < t0) a += TAU; var best = a, bd = 1e9; for (var j = -4; j <= 4; j++) { var cand = a + j * TAU; if (cand >= t0 && cand <= t1 && M.abs(cand - S.th) < bd) { bd = M.abs(cand - S.th); best = cand; } } S.th = clamp(best, t0, t1); sl.set(S.th); }
        draw();
      }, start: function (h, px, py) { this.move(h, px, py); }
    });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', fr0 ? 'Polar graph. Arrow keys change θ.' : 'Polar point. Arrow keys: left and right turn θ, up and down change r.');
    c.cv.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (!d) return; e.preventDefault();
      if (fr0) { S.th = clamp(S.th + d * (t1 - t0) / 48, t0, t1); sl.set(S.th); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') S.pr += d * 0.25; else S.pt = (S.pt + d * PI / 12 + TAU) % TAU;
      draw();
    });
    function niceUp(m) { var p = M.pow(10, M.floor(M.log10(m))), f = m / p - 1e-9; return ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].filter(function (q) { return q >= f; })[0] || 10) * p; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, cx = L.cx, cy = L.cy, mx = rmax(); scale = L.R / mx;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      // polar grid
      var st = mx <= 1 ? 0.25 : mx <= 2.5 ? 0.5 : mx <= 5 ? 1 : mx / 5;
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1;
      for (var r = st; r <= mx + 1e-9; r += st) { ctx.beginPath(); ctx.arc(cx, cy, r * scale, 0, TAU); ctx.stroke(); }
      for (var a = 0; a < 12; a++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + L.R * 1.04 * M.cos(a * PI / 6), cy - L.R * 1.04 * M.sin(a * PI / 6)); ctx.stroke(); }
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx - L.R * 1.06, cy); ctx.lineTo(cx + L.R * 1.06, cy); ctx.moveTo(cx, cy - L.R * 1.06); ctx.lineTo(cx, cy + L.R * 1.06); ctx.stroke(); ctx.restore();
      for (r = st; r <= mx + 1e-9; r += st) if (r * scale > 22) txt(ctx, fm(r, 2), cx + r * scale + 2, cy + 9, { size: 10 });
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(function (i) { if (i % 3 && L.R < 170) return; var an = i * PI / 6; txt(ctx, o.units === 'deg' ? i * 30 + '°' : pf(an), clamp(cx + (L.R + 14) * M.cos(an), 16, w - 16), cy - (L.R + 14) * M.sin(an) - (i % 6 === 0 ? 9 : 0), { align: 'center', size: 11 }); });
      function XY(t) { var rr = fr0(t); return [cx + rr * scale * M.cos(t), cy - rr * scale * M.sin(t), rr]; }
      if (fr0) {
        [[t0, t1, 0.25, 1.6], [t0, S.th, 1, 3]].forEach(function (sg) {
          ctx.save(); ctx.strokeStyle = k.blue; ctx.globalAlpha = sg[2]; ctx.lineWidth = sg[3]; ctx.lineJoin = 'round'; ctx.beginPath(); var n = 600, pen = false;
          for (var i = 0; i <= n; i++) { var p = XY(sg[0] + (sg[1] - sg[0]) * i / n); if (!isFinite(p[2]) || M.abs(p[2]) > mx * 3) { pen = false; continue; } if (pen) ctx.lineTo(p[0], p[1]); else { ctx.moveTo(p[0], p[1]); pen = true; } }
          ctx.stroke(); ctx.restore();
        });
        var p = XY(S.th), rr = p[2], neg = rr < 0;
        ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + L.R * 1.04 * M.cos(S.th), cy - L.R * 1.04 * M.sin(S.th)); ctx.stroke();
        if (neg) { ctx.setLineDash([5, 4]); ctx.strokeStyle = k.red; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p[0], p[1]); ctx.stroke(); }
        ctx.restore();
        if (isFinite(rr)) { knob(ctx, p[0], p[1], neg ? k.red : k.blue, 7); }
        if (rect) { // r against θ
          var gx = L.gx, gw = L.gw, gy0 = L.gy0, gh = L.gh, ymx = mx, GX = function (t) { return gx + gw * (t - t0) / (t1 - t0); }, GY = function (v) { return gy0 + gh / 2 - v / ymx * gh / 2; };
          ctx.save(); ctx.fillStyle = k.panel; rrect(ctx, gx - 6, gy0 - 6, gw + 12, gh + 12, 8); ctx.fill();
          ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath(); for (var q = 0; q <= 4; q++) { var tq = t0 + (t1 - t0) * q / 4; ctx.moveTo(GX(tq), gy0); ctx.lineTo(GX(tq), gy0 + gh); } ctx.stroke();
          ctx.strokeStyle = k.axis; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(gx, GY(0)); ctx.lineTo(gx + gw, GY(0)); ctx.moveTo(gx, gy0); ctx.lineTo(gx, gy0 + gh); ctx.stroke();
          if (neg || true) { ctx.fillStyle = rgba(k.red, 0.08); ctx.fillRect(gx, GY(0), gw, gh / 2); }
          ctx.restore();
          for (q = 1; q <= 4; q++) { var tq2 = t0 + (t1 - t0) * q / 4; txt(ctx, o.units === 'deg' ? fm(tq2 * 180 / PI, 0) + '°' : pf(tq2), GX(tq2), GY(0) + 11, { align: 'center', size: 10 }); }
          txt(ctx, fm(ymx), gx - 4, gy0 + 4, { align: 'right', size: 10 }); txt(ctx, '−' + fm(ymx), gx - 4, gy0 + gh - 4, { align: 'right', size: 10 });
          txt(ctx, 'r', gx + 6, gy0 + 8, { italic: true, size: 14, color: k.ink }); txt(ctx, 'θ', gx + gw - 4, GY(0) - 10, { italic: true, size: 14, color: k.ink, align: 'right' });
          ctx.save(); ctx.strokeStyle = k.blue; ctx.lineWidth = 2.5; ctx.beginPath(); for (var i = 0; i <= 300; i++) { var t = t0 + (t1 - t0) * i / 300, v2 = clamp(fr0(t), -ymx * 1.05, ymx * 1.05); if (i) ctx.lineTo(GX(t), GY(v2)); else ctx.moveTo(GX(t), GY(v2)); } ctx.stroke(); ctx.restore();
          ctx.save(); ctx.strokeStyle = k.gold; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(GX(S.th), gy0); ctx.lineTo(GX(S.th), gy0 + gh); ctx.stroke(); ctx.restore();
          if (isFinite(rr)) { ctx.fillStyle = neg ? k.red : k.blue; ctx.beginPath(); ctx.arc(GX(S.th), GY(clamp(rr, -ymx, ymx)), 5, 0, TAU); ctx.fill(); }
          txt(ctx, 'r against θ (red band: r < 0)', gx, gy0 + gh + (L.wide ? 14 : 18), { size: 11 });
        }
        var ths = o.units === 'deg' ? fm(S.th * 180 / PI, 1) + '°' : pf(S.th);
        F.out.set('<i>r</i> = ' + mathHTML(ps.length ? showSub(o.r, Pm) : pretty(o.r)) + '. At θ = ' + ths + ': <i>r</i> = ' + fm(rr, 3) + ', so (<i>x</i>, <i>y</i>) = (<i>r</i> cos θ, <i>r</i> sin θ) = (' + fm(rr * M.cos(S.th), 3) + ', ' + fm(rr * M.sin(S.th), 3) + ').' + (neg ? ' <span class="mla-r">Here <i>r</i> is negative, so the point is plotted on the opposite side of the pole, along the dashed red line.</span>' : ''));
      } else {
        var x = S.pr * M.cos(S.pt), y = S.pr * M.sin(S.pt), Px = cx + x * scale, Py = cy - y * scale;
        ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, -S.pt, true); ctx.stroke();
        ctx.setLineDash([4, 4]); ctx.lineWidth = 1.4; ctx.strokeStyle = k.blue; ctx.beginPath(); ctx.moveTo(Px, Py); ctx.lineTo(Px, cy); ctx.stroke(); ctx.strokeStyle = k.red; ctx.beginPath(); ctx.moveTo(Px, Py); ctx.lineTo(cx, Py); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(Px, Py); ctx.stroke(); ctx.restore();
        knob(ctx, Px, Py, k.purple, 8);
        label(ctx, '(r, θ) = (' + fm(S.pr) + ', ' + fm(S.pt * 180 / PI, 0) + '°)', Px + 12, Py - 16, { align: 'left', clampW: w, clampH: h, color: k.purple });
        F.out.set('Polar (<i>r</i>, θ) = (' + fm(S.pr) + ', ' + angStr(S.pt * 180 / PI, o.units) + ') → rectangular (<i>x</i>, <i>y</i>) = (<i>r</i> cos θ, <i>r</i> sin θ) = (<span class="mla-b">' + (exact(x / (S.pr || 1)) && S.pr ? fm(x, 3) : fm(x, 3)) + '</span>, <span class="mla-r">' + fm(y, 3) + '</span>). Back again: <i>r</i> = √(<i>x</i>² + <i>y</i>²) = ' + fm(M.hypot(x, y), 3) + ', tan θ = <i>y</i>/<i>x</i>' + (M.abs(x) > 1e-9 ? ' = ' + fm(y / x, 3) : ' (undefined: θ is 90° or 270°)') + '.');
        if (o.target) F.done(M.abs(x - nv(o.target[0], 0)) < 0.13 && M.abs(y - nv(o.target[1], 0)) < 0.13);
      }
    }
    V.onTheme(draw); draw();
    return { draw: draw };
  });

  /* complexplane: complex numbers as points and arrows; add, subtract, multiply, divide, conjugate, powers, roots.
     opts:
       z: [2, 1], w: [1, 2]         the numbers as [real, imaginary] (both draggable, snapping to snap)
       op: "mul"                    "add", "sub", "mul", "div", "conj", "pow", "roots"
       ops: ["add", "mul", …]       operations offered (default all)
       n: 3                         the power or the number of roots
       snap: 0.5, range: 6          grid snapping and the half-width of the view
       polar: true                  show modulus and argument (angle arcs)
       target: [0, 5]               with task: make the result equal this number [real, imaginary] (add, sub, mul, div, conj, pow) */
  R('complexplane', function (el, o) {
    o = opt(o, { z: [2, 1], w: [1, 2], op: 'mul', ops: ['add', 'sub', 'mul', 'div', 'conj', 'pow', 'roots'], n: 3, snap: 0.5, range: 6, polar: true });
    var z = [nv(o.z[0], 2), nv(o.z[1], 1)], w = [nv(o.w[0], 1), nv(o.w[1], 2)], op = o.op, n = o.n;
    var F = frame(el, o, 'Complex numbers in the plane'), c = F.canvas({ aspect: 1.3, max: 500 }), rg = nv(o.range, 6), P = V.plane(c, { xmin: -rg, xmax: rg, ymin: -rg, ymax: rg, equal: true });
    var twoArg = function () { return ['add', 'sub', 'mul', 'div'].indexOf(op) >= 0; };
    var H = handles(c, P, [{ get: function () { return z; }, set: function (x, y) { z = [x, y]; } }, { get: function () { return w; }, set: function (x, y) { w = [x, y]; }, off: function () { return !twoArg(); } }], { snap: o.snap, change: draw });
    c.cv.setAttribute('aria-label', 'Complex plane. Arrow keys move z; Enter switches to w.');
    var names = { add: 'z + w', sub: 'z − w', mul: 'z · w', div: 'z ÷ w', conj: 'conjugate', pow: 'powers', roots: 'roots' };
    if (o.ops.length > 1) V.seg(F.ctl, { label: 'Operation', items: o.ops.map(function (q) { return [q, names[q]]; }), value: op, change: function (v) { op = v; nrow.hidden = !(op === 'pow' || op === 'roots'); draw(); } });
    var nrow = F.row(); V.slider(nrow, { label: 'n', min: 2, max: 8, step: 1, value: n, input: function (v) { n = v; draw(); } }); nrow.hidden = !(op === 'pow' || op === 'roots');
    function cs(a) { var re = fm(a[0], 3), im = M.abs(a[1]); if (M.abs(a[1]) < 1e-12) return re; var ims = (M.abs(im - 1) < 1e-12 ? '' : fm(im, 3)) + '<i>i</i>'; if (M.abs(a[0]) < 1e-12) return (a[1] < 0 ? '−' : '') + ims; return re + (a[1] < 0 ? ' − ' : ' + ') + ims; }
    function mod(a) { return M.hypot(a[0], a[1]); }
    function arg(a) { return M.atan2(a[1], a[0]); }
    function argS(t) { var d = t * 180 / PI; return fm(d, 1) + '°'; }
    function vec(a, col, name, dash) { var k = V.colors(); P.arrow(0, 0, a[0], a[1], { color: col, width: 3, dash: dash }); label(c.ctx, name, P.X(a[0]) + (a[0] >= 0 ? 10 : -10), P.Y(a[1]) + (a[1] >= 0 ? -14 : 14), { color: k[col] || col, align: a[0] >= 0 ? 'left' : 'right', bold: true, clampW: c.w, clampH: c.h }); }
    function arc(t1, t2, rr, col) { var ctx = c.ctx; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P.X(0), P.Y(0), rr, -t1, -t2, t2 > t1); ctx.stroke(); ctx.restore(); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, s = '', res = null;
      P.clear(); P.grid({ step: 1 }); P.axes({ x: 'Re', y: 'Im', step: rg > 8 ? 2 : 1 });
      if (op === 'add' || op === 'sub') {
        var ww = op === 'add' ? w : [-w[0], -w[1]]; res = [z[0] + ww[0], z[1] + ww[1]];
        if (op === 'sub') vec(ww, 'muted', '−w', [6, 5]);
        P.seg(z[0], z[1], res[0], res[1], { color: 'red', width: 1.5, dash: [5, 4] }); P.seg(ww[0], ww[1], res[0], res[1], { color: 'blue', width: 1.5, dash: [5, 4] });
        vec(z, 'blue', 'z', null); vec(w, 'red', 'w', null); vec(res, 'purple', op === 'add' ? 'z + w' : 'z − w', null);
        s = 'z = ' + cs(z) + ', w = ' + cs(w) + '. ' + (op === 'add' ? 'Add real parts and imaginary parts: z + w = <b>' + cs(res) + '</b>. As arrows: put w’s tail at z’s tip (a parallelogram).' : 'z − w = z + (−w) = <b>' + cs(res) + '</b>: it is the arrow from w’s tip to z’s tip, moved to the origin.');
      } else if (op === 'mul' || op === 'div') {
        var mz = mod(z), mw = mod(w), az = arg(z), aw = arg(w);
        if (op === 'div' && mw < 1e-12) { vec(z, 'blue', 'z'); vec(w, 'red', 'w'); s = 'You cannot divide by 0. Move w away from the origin.'; F.out.set(s); H.draw(ctx); return; }
        res = op === 'mul' ? [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]] : [(z[0] * w[0] + z[1] * w[1]) / (mw * mw), (z[1] * w[0] - z[0] * w[1]) / (mw * mw)];
        if (o.polar) { arc(0, az, 28, k.blue); arc(0, aw, 40, k.red); arc(0, arg(res), 52, k.purple); }
        P.circle(0, 0, mod(res), { color: rgba(k.purple, 0.35), width: 1, dash: [4, 4] });
        vec(z, 'blue', 'z'); vec(w, 'red', 'w'); vec(res, 'purple', op === 'mul' ? 'z·w' : 'z ÷ w');
        s = 'z = ' + cs(z) + ' (|z| = ' + fm(mz, 3) + ', angle ' + argS(az) + '), w = ' + cs(w) + ' (|w| = ' + fm(mw, 3) + ', angle ' + argS(aw) + ').<br>';
        s += op === 'mul' ? 'z·w = <b>' + cs(res) + '</b>. Lengths multiply: ' + fm(mz, 3) + ' × ' + fm(mw, 3) + ' = ' + fm(mz * mw, 3) + '. Angles add: ' + argS(az) + ' + ' + argS(aw) + ' = ' + argS(az + aw) + (M.abs(az + aw - arg(res)) > 1e-6 ? ' (the same direction as ' + argS(arg(res)) + ')' : '') + '.' : 'z ÷ w = <b>' + cs(res) + '</b>. Lengths divide: ' + fm(mz, 3) + ' ÷ ' + fm(mw, 3) + ' = ' + fm(mz / mw, 3) + '. Angles subtract: ' + argS(az) + ' − ' + argS(aw) + ' = ' + argS(az - aw) + '.';
      } else if (op === 'conj') {
        res = [z[0], -z[1]]; P.seg(z[0], z[1], res[0], res[1], { color: 'muted', width: 1.5, dash: [4, 4] });
        vec(z, 'blue', 'z'); vec(res, 'purple', 'z̄');
        s = 'z = ' + cs(z) + ', its conjugate z̄ = <b>' + cs(res) + '</b>: the mirror image across the real axis. z·z̄ = ' + fm(z[0] * z[0] + z[1] * z[1], 3) + ' = |z|², a real number.';
      } else if (op === 'pow') {
        var pts = [[1, 0]], cur = [1, 0];
        for (var i = 1; i <= n; i++) { cur = [cur[0] * z[0] - cur[1] * z[1], cur[0] * z[1] + cur[1] * z[0]]; pts.push(cur); }
        ctx.save(); ctx.strokeStyle = rgba(k.purple, 0.5); ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); pts.forEach(function (p, j) { var X = P.X(p[0]), Y = P.Y(p[1]); if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
        pts.forEach(function (p, j) { P.point(p[0], p[1], { color: j === n ? 'purple' : j === 1 ? 'blue' : 'muted', r: j === n ? 6 : 4 }); if (j > 1) label(ctx, 'z' + sup(j), P.X(p[0]) + 9, P.Y(p[1]) - 12, { align: 'left', size: 11, clampW: c.w, clampH: c.h }); });
        vec(z, 'blue', 'z'); res = pts[n];
        s = 'z = ' + cs(z) + ', |z| = ' + fm(mod(z), 3) + ', angle ' + argS(arg(z)) + '. Each multiplication by z turns by ' + argS(arg(z)) + ' and scales by ' + fm(mod(z), 3) + '. z' + sup(n) + ' = <b>' + cs(res) + '</b> (length ' + fm(mod(res), 3) + ' = ' + fm(mod(z), 3) + sup(n) + ').';
      } else if (op === 'roots') {
        var rr = M.pow(mod(z), 1 / n), a0 = arg(z) / n, rts = [];
        for (var j = 0; j < n; j++) rts.push([rr * M.cos(a0 + j * TAU / n), rr * M.sin(a0 + j * TAU / n)]);
        P.circle(0, 0, rr, { color: rgba(k.purple, 0.5), width: 1.2, dash: [4, 4] });
        P.poly(rts, { color: 'purple', width: 1.5, fill: k.purpleSoft });
        rts.forEach(function (p, j) { P.point(p[0], p[1], { color: 'purple', r: 5.5 }); });
        vec(z, 'blue', 'z');
        s = 'The ' + n + ' complex ' + n + (n === 2 ? 'nd' : n === 3 ? 'rd' : 'th') + ' roots of z = ' + cs(z) + ' all have length ' + fm(mod(z), 3) + '<sup>1/' + n + '</sup> = ' + fm(rr, 3) + ' and are spaced 360°/' + n + ' = ' + fm(360 / n, 1) + '° apart: ' + rts.map(cs).join(', ') + '.';
      }
      knob(ctx, P.X(z[0]), P.Y(z[1]), k.blue, 6); if (twoArg()) knob(ctx, P.X(w[0]), P.Y(w[1]), k.red, 6);
      H.draw(ctx); F.out.set(s);
      if (o.target && res) F.done(M.abs(res[0] - nv(o.target[0], 0)) < 1e-6 && M.abs(res[1] - nv(o.target[1], 0)) < 1e-6);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* sequence: the terms of a sequence as dots, with the step between terms and the partial sums.
     opts:
       type: "arith"                "arith" (a₁, d), "geom" (a₁, r) or "custom" (f in n)
       a1: 3, d: 2, r: 2            first term, common difference, common ratio
       f: "1/n"                     the nth term for custom (params allowed)
       start: 1                     index of the first term
       N: 8, maxN: 30               terms shown and the most allowed
       sums: false                  also plot the partial sums S_n
       limit: null                  draw a dashed line at this value (a limit)
       sliders: true                sliders for a₁, d or r
       ymin, ymax                   fix the vertical range (default: fit the terms) */
  R('sequence', function (el, o) {
    o = opt(o, { type: 'arith', a1: 3, d: 2, r: 2, f: '1/n', start: 1, N: 8, maxN: 30, sums: false, limit: null, sliders: true });
    var Pm = {}, S = { a1: nv(o.a1, 3), d: nv(o.d, 2), r: nv(o.r, 2), N: o.N, hi: o.N }, fc = o.type === 'custom' ? cf(o.f, ['n'], Pm) : null, ps = o.type === 'custom' ? params(o.params) : [];
    var F = frame(el, o, 'Terms of a sequence'), c = F.canvas({ aspect: 1.7 }), P = V.plane(c, { xmin: 0, xmax: 10, ymin: -1, ymax: 10 });
    scrollOK(c);
    function term(n) { var i = n - o.start; return o.type === 'arith' ? S.a1 + i * S.d : o.type === 'geom' ? S.a1 * M.pow(S.r, i) : fc(n); }
    if (o.sliders && o.type === 'arith') { V.slider(F.ctl, { label: 'first term a₁', min: -10, max: 10, step: 0.5, value: S.a1, input: function (v) { S.a1 = v; draw(); } }); V.slider(F.ctl, { label: 'difference d', min: -5, max: 5, step: 0.5, value: S.d, input: function (v) { S.d = v; draw(); } }); }
    if (o.sliders && o.type === 'geom') { V.slider(F.ctl, { label: 'first term a₁', min: -10, max: 10, step: 0.5, value: S.a1, input: function (v) { S.a1 = v; draw(); } }); V.slider(F.ctl, { label: 'ratio r', min: -2, max: 3, step: 0.05, value: S.r, input: function (v) { S.r = v; draw(); } }); }
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    var sN = V.slider(F.ctl, { label: 'terms shown', min: 1, max: o.maxN, step: 1, value: S.N, input: function (v) { S.N = v; S.hi = M.min(S.hi, v); draw(); } });
    V.drag(c.cv, { hit: function () { return 1; }, move: function (h, px) { S.hi = clamp(M.round(P.x(px)) - o.start + 1, 1, S.N); draw(); }, start: function (h, px) { this.move(h, px); } });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Sequence plot. Left and right arrow keys pick a term.');
    c.cv.addEventListener('keydown', function (e) { var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return; S.hi = clamp(S.hi + d, 1, S.N); draw(); e.preventDefault(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, ns = [], ys = [], sums = [], acc = 0;
      for (var i = 0; i < S.N; i++) { var n = o.start + i, y = term(n); acc += y; ns.push(n); ys.push(y); sums.push(acc); }
      var all = ys.concat(o.sums ? sums : []).filter(isFinite).concat(o.limit != null ? [nv(o.limit, 0)] : []).concat([0]);
      var lo = o.ymin != null ? nv(o.ymin, 0) : M.min.apply(null, all), hi = o.ymax != null ? nv(o.ymax, 10) : M.max.apply(null, all), pad = (hi - lo) * 0.12 || 1;
      P.set({ xmin: o.start - 1, xmax: o.start + S.N, ymin: lo - pad, ymax: hi + pad });
      var gx = S.N > 20 ? 5 : S.N > 10 ? 2 : 1, gy = nstep(P.o.ymax - P.o.ymin, c.h);
      P.clear(); P.grid({ step: gx, stepY: gy }); P.axes({ x: 'n', y: o.sums ? 'aₙ, Sₙ' : 'aₙ', step: gx, stepY: gy });
      if (o.limit != null) { P.seg(o.start - 1, nv(o.limit, 0), o.start + S.N, nv(o.limit, 0), { color: 'gold', width: 2, dash: [7, 5] }); }
      if (o.sums) sums.forEach(function (s2, j) { P.point(ns[j], s2, { color: 'green', r: 4.5, hollow: true }); });
      for (i = 1; i < ys.length && i < 16 && o.type !== 'custom'; i++) { if (S.N > 14) break; var x1 = P.X(ns[i - 1]), y1 = P.Y(ys[i - 1]), x2 = P.X(ns[i]), y2 = P.Y(ys[i]); ctx.save(); ctx.strokeStyle = rgba(k.gold, 0.8); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1 + 5, y1); ctx.quadraticCurveTo((x1 + x2) / 2, M.min(y1, y2) - 18, x2 - 5, y2); ctx.stroke(); ctx.restore(); if (x2 - x1 > 44 && !F.quiet) txt(ctx, o.type === 'arith' ? (S.d < 0 ? '−' : '+') + fm(M.abs(S.d)) : '×' + fm(S.r), (x1 + x2) / 2, M.min(y1, y2) - 22, { align: 'center', color: k.gold, size: 11 }); }
      ys.forEach(function (y, j) { if (isFinite(y)) P.point(ns[j], y, { color: j + 1 === S.hi ? 'red' : 'blue', r: j + 1 === S.hi ? 6.5 : 5 }); });
      var hn = o.start + S.hi - 1, hy = ys[S.hi - 1];
      label(ctx, 'a' + sub(hn) + (F.quiet ? '' : ' = ' + fm(hy, 4)), P.X(hn) + 10, P.Y(hy) - 16, { align: 'left', color: k.red, clampW: c.w, clampH: c.h });
      var fmla = o.type === 'arith' ? 'a<sub>n</sub> = a<sub>1</sub> + (n − 1)d = ' + fm(S.a1) + (S.d < 0 ? ' − ' : ' + ') + fm(M.abs(S.d)) + '(n − 1)' : o.type === 'geom' ? 'a<sub>n</sub> = a<sub>1</sub>·r<sup>n−1</sup> = ' + fm(S.a1) + '·(' + fm(S.r) + ')<sup>n−1</sup>' : 'a<sub>n</sub> = ' + mathHTML(ps.length ? showSub(o.f, Pm) : pretty(o.f));
      var shown = ys.slice(0, M.min(8, ys.length)).map(function (y) { return fm(y, 4); }).join(', ') + (ys.length > 8 ? ', …' : '');
      var s = fmla.replace(/([(\s−+]|^)n\b/g, '$1<i>n</i>') + '.<br>Terms: ' + shown + '. Term ' + hn + ': a' + sub(hn) + ' = <b>' + fm(hy, 5) + '</b>.';
      var Sh = sums[S.hi - 1];
      s += ' Partial sum S' + sub(hn) + ' = ' + fm(Sh, 5);
      if (o.type === 'arith') s += ' = ' + S.hi + '(a₁ + a' + sub(hn) + ')/2';
      if (o.type === 'geom' && S.r !== 1) s += ' = a₁(1 − r' + sup(S.hi) + ')/(1 − r)';
      s += '.'; if (o.type === 'geom') s += M.abs(S.r) < 1 ? ' Because |r| &lt; 1 the terms shrink toward 0 and the sums approach a₁/(1 − r) = ' + fm(S.a1 / (1 - S.r), 4) + '.' : M.abs(S.r) > 1 ? ' Because |r| &gt; 1 the terms grow without bound.' : '';
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  function limAt(f, a, side) { // numeric one-sided limit: value, or ±Infinity, or NaN when it does not settle
    var hs = [1e-4, 1e-5, 1e-6, 1e-7], v = hs.map(function (h) { return f(a + side * h); });
    if (v.every(function (y) { return isFinite(y); })) {
      if (M.abs(v[3]) > 1e6 && M.abs(v[3]) > M.abs(v[1]) * 5) return v[3] > 0 ? Infinity : -Infinity;
      if (M.abs(v[3] - v[2]) < 1e-4 * M.max(1, M.abs(v[3]))) { var r = v[3], q = ratio(r, 60); return q ? q[0] / q[1] : M.abs(r - M.round(r * 1e6) / 1e6) < 1e-7 ? M.round(r * 1e6) / 1e6 : r; }
    }
    return NaN;
  }
  function limS(v) { return v === Infinity ? '∞' : v === -Infinity ? '−∞' : isNaN(v) ? 'no single value' : fr(v, 4); }

  /* limit: zoom in on x = a and watch the values from the left and from the right.
     opts:
       f: "(x^2-1)/(x-1)"           the function near a (use left and right for a piecewise function)
       left: "x+1", right: "3-x"    optional: separate formulas for x < a and x > a (then f is not needed)
       a: 1                          the point
       fa: null                      the value at a: a number, "none" for undefined, or leave out to compute f(a)
       h: 1                          starting distance from a (the slider runs from 2 down to 0.001)
       follow: true                  the view zooms in as h shrinks
       table: true                   values at a ± 0.1, 0.01, 0.001
       epsdelta: false               the ε–δ picture: an ε band around the limit and the δ that works
       eps: 0.5                      starting ε
       xmin…ymax                     the starting view (default: around the point)
       params: {…}                   parameters in f (sliders) */
  R('limit', function (el, o) {
    o = opt(o, { f: '(x^2-1)/(x-1)', a: 1, h: 1, follow: true, table: true, epsdelta: false, eps: 0.5 });
    var Pm = {}, ps = params(o.params), a = nv(o.a, 1), fl = cf(o.left || o.f, ['x'], Pm), frr = cf(o.right || o.f, ['x'], Pm), S = { h: nv(o.h, 1), eps: nv(o.eps, 0.5) };
    function f(x) { return x < a ? fl(x) : x > a ? frr(x) : fa(); }
    function fa() { if (o.fa === 'none') return NaN; if (o.fa != null) return nv(o.fa, NaN); return (o.left || o.right) ? NaN : fl(a); }
    var F = frame(el, o, 'Limit of a function as x approaches ' + fm(a)), c = F.canvas({ aspect: 1.5 });
    var L0 = limAt(fl, a, -1), R0 = limAt(frr, a, 1), Lc = isFinite(L0) ? L0 : isFinite(R0) ? R0 : 0;
    var home = { xmin: nv(o.xmin, a - 4), xmax: nv(o.xmax, a + 4), ymin: nv(o.ymin, Lc - 4), ymax: nv(o.ymax, Lc + 4) }, P = V.plane(c, home);
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, function () { L0 = limAt(fl, a, -1); R0 = limAt(frr, a, 1); Lc = isFinite(L0) ? L0 : isFinite(R0) ? R0 : 0; draw(); }); });
    var hs = V.slider(F.ctl, { label: 'h: distance from a', min: -3, max: M.log10(2), step: 0.01, value: M.log10(S.h), fmt: function (v) { return fm(M.pow(10, v), v < -2 ? 4 : 3); }, input: function (v) { S.h = M.pow(10, v); draw(); } });
    var fol = check(F.ctl, 'Zoom in with h', o.follow, function (v) { o.follow = v; draw(); });
    var es = o.epsdelta ? V.slider(F.ctl, { label: 'ε (tolerance)', min: 0.01, max: 2, step: 0.01, value: S.eps, input: function (v) { S.eps = v; draw(); } }) : null;
    var tbl = o.table ? mk('div', 'mla-tablewrap') : null; if (tbl) el.insertBefore(tbl, F.out.el);
    V.drag(c.cv, { hit: function (px, py) { var x1 = a - S.h, x2 = a + S.h; if (M.abs(px - P.X(x1)) < 24 || M.abs(px - P.X(x2)) < 24) return 'h'; return null; }, move: function (h2, px) { S.h = clamp(M.abs(P.x(px) - a), 0.001, 2); hs.set(M.log10(S.h)); draw(); } });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Graph near x = ' + fm(a) + '. Left arrow brings the two points closer to a; right arrow moves them away.');
    c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (!d) return; S.h = clamp(S.h * M.pow(10, d * 0.1), 0.001, 2); hs.set(M.log10(S.h)); draw(); e.preventDefault(); });
    function delta(L, eps) { // the largest δ (up to 2) with |f(x) − L| < ε for 0 < |x − a| < δ, by scanning outward
      var d = 2, n = 800;
      for (var i = 1; i <= n; i++) { var t = 2 * i / n; if (!(M.abs(fl(a - t) - L) < eps) || !(M.abs(frr(a + t) - L) < eps)) { d = 2 * (i - 1) / n; break; } }
      if (d === 0) { for (i = 1; i <= 400; i++) { var t2 = 0.005 * i / 400; if (!(M.abs(fl(a - t2) - L) < eps) || !(M.abs(frr(a + t2) - L) < eps)) { d = 0.005 * (i - 1) / 400; break; } } }
      return d;
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, h = S.h, yL = fl(a - h), yR = frr(a + h);
      if (o.follow) { var hw = M.max(h * 3, 0.004), hy = hw * (home.ymax - home.ymin) / (home.xmax - home.xmin); var cy = isFinite(Lc) ? Lc : 0; P.set({ xmin: a - hw, xmax: a + hw, ymin: cy - hy, ymax: cy + hy }); if (hw >= (home.xmax - home.xmin) / 2) P.set(home); }
      else P.set(home);
      var v = P.view();
      P.clear(); P.grid(); P.axes();
      var has = isFinite(L0) && isFinite(R0) && M.abs(L0 - R0) < 1e-6;
      if (o.epsdelta && has) {
        var dl = delta(Lc, S.eps);
        ctx.save(); ctx.fillStyle = rgba(k.gold, 0.16); ctx.fillRect(0, P.Y(Lc + S.eps), c.w, P.Y(Lc - S.eps) - P.Y(Lc + S.eps)); ctx.fillStyle = rgba(k.teal, 0.14); ctx.fillRect(P.X(a - dl), 0, P.X(a + dl) - P.X(a - dl), c.h); ctx.restore();
        P.seg(v.xmin, Lc + S.eps, v.xmax, Lc + S.eps, { color: 'gold', width: 1.2, dash: [5, 4] }); P.seg(v.xmin, Lc - S.eps, v.xmax, Lc - S.eps, { color: 'gold', width: 1.2, dash: [5, 4] });
        P.seg(a - dl, v.ymin, a - dl, v.ymax, { color: 'teal', width: 1.2, dash: [5, 4] }); P.seg(a + dl, v.ymin, a + dl, v.ymax, { color: 'teal', width: 1.2, dash: [5, 4] });
        S.dl = dl;
      }
      P.plot(fl, { color: 'blue', width: 3, to: a }); P.plot(frr, { color: 'blue', width: 3, from: a });
      P.seg(a, v.ymin, a, v.ymax, { color: 'muted', width: 1, dash: [3, 4] });
      [[L0, -1], [R0, 1]].forEach(function (q) { if (isFinite(q[0]) && !(isFinite(fa()) && M.abs(fa() - q[0]) < 1e-9)) P.point(a, q[0], { color: 'blue', hollow: true, r: 5.5 }); });
      if (isFinite(fa())) P.point(a, fa(), { color: 'blue', r: 5.5 });
      [[a - h, yL, 'red', 1], [a + h, yR, 'green', -1]].forEach(function (q) {
        if (!isFinite(q[1])) return; var col = k[q[2]];
        P.seg(q[0], 0, q[0], q[1], { color: q[2], width: 1.3, dash: [4, 3] }); P.seg(v.xmin, q[1], q[0], q[1], { color: q[2], width: 1.3, dash: [4, 3] });
        knob(ctx, P.X(q[0]), P.Y(q[1]), col, 7);
        arrowPx(ctx, P.X(q[0]) + q[3] * 12, P.Y(q[1]) + 16, P.X(q[0]) + q[3] * 34, P.Y(q[1]) + 16, col, 2, 7);
      });
      var lims = (isFinite(L0) && isFinite(R0) && M.abs(L0 - R0) < 1e-6) ? 'both sides approach <b>' + limS(L0) + '</b>, so lim<sub><i>x</i>→' + fm(a) + '</sub> <i>f</i>(<i>x</i>) = <b>' + limS(L0) + '</b>' : (L0 === R0 && !isFinite(L0) && !isNaN(L0)) ? 'both sides grow without bound (' + limS(L0) + '): the limit is ' + limS(L0) + ', which means it does not exist as a number' : (isNaN(L0) && isNaN(R0)) ? 'the values keep jumping around and never settle on one number, so the limit <b>does not exist</b>' : 'from the left it approaches ' + limS(L0) + ' but from the right ' + limS(R0) + ', so the limit <b>does not exist</b>';
      var fas = isFinite(fa()) ? '<i>f</i>(' + fm(a) + ') = ' + fr(fa(), 4) : '<i>f</i>(' + fm(a) + ') is undefined';
      var s = '<span class="mla-r">From the left</span>: <i>f</i>(' + fm(a - h, 5) + ') = ' + fm(yL, 5) + ' &nbsp; <span class="mla-g">From the right</span>: <i>f</i>(' + fm(a + h, 5) + ') = ' + fm(yR, 5) + '<br>As <i>x</i> → ' + fm(a) + ', ' + lims + '. ' + fas + (isFinite(fa()) && isFinite(L0) && M.abs(fa() - L0) > 1e-6 && M.abs(L0 - R0) < 1e-6 ? ': the limit ignores the value at the point itself.' : '.');
      if (o.epsdelta && has) s += '<br>For ε = ' + fm(S.eps) + ': every <i>x</i> within δ = ' + fm(S.dl, 3) + ' of ' + fm(a) + ' (except ' + fm(a) + ' itself) gives <i>f</i>(<i>x</i>) within ε of ' + limS(Lc) + '. Shrink ε and a smaller δ still works.';
      F.out.set(s);
      if (tbl) { var hv = [0.1, 0.01, 0.001], xs = hv.map(function (q) { return a - q; }).concat(hv.slice().reverse().map(function (q) { return a + q; }));
        tbl.innerHTML = tableT([['<i>x</i>'].concat(xs.map(function (x) { return fm(x, 4); })), ['<i>f</i>(<i>x</i>)'].concat(xs.map(function (x) { var y = f(x); return isFinite(y) ? fm(+y.toPrecision(7), 9) : '—'; }))]).replace('<td>' + fm(a + 0.001, 4), '<td style="border-left:2px solid currentColor">' + fm(a + 0.001, 4)); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* secant: a secant line turns into the tangent line as h → 0.
     opts:
       f: "x^2"                     the function (params allowed)
       a: 1, h: 2                   the point of tangency and the starting h (−3 … 3)
       tangent: true                draw the tangent line (dashed) for comparison
       table: true                  slopes of secants for h = 1, 0.5, 0.1, 0.01, 0.001
       xmin…ymax (−3, 5, −2, 10) */
  R('secant', function (el, o) {
    o = opt(o, { f: 'x^2', a: 1, h: 2, tangent: true, table: true, xmin: -3, xmax: 5, ymin: -2, ymax: 10 });
    var Pm = {}, ps = params(o.params), f = cf(o.f, ['x'], Pm), df = cfd(o.f, 'x', ['x'], Pm), S = { a: nv(o.a, 1), h: nv(o.h, 2) }, anim = null;
    var F = frame(el, o, 'Secant line approaching the tangent line'), c = F.canvas({ aspect: 1.5 }), P = V.plane(c, win(o, [-3, 5, -2, 10]));
    var H = handles(c, P, [{ get: function () { return [S.a, f(S.a)]; }, set: function (x) { S.a = M.round(x * 20) / 20; } }, { get: function () { return [S.a + S.h, f(S.a + S.h)]; }, set: function (x) { var h = M.round((x - S.a) * 100) / 100; S.h = M.abs(h) < 0.001 ? (S.h > 0 ? 0.001 : -0.001) : h; hs.set(S.h); } }], { change: draw, step: 0.05 });
    c.cv.setAttribute('aria-label', 'Secant line. Arrow keys move the point P; Enter switches to the point Q.');
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    var hs = V.slider(F.ctl, { label: 'h', min: -3, max: 3, step: 0.001, value: S.h, fmt: function (v) { return fm(v, M.abs(v) < 0.1 ? 3 : 2); }, input: function (v) { S.h = M.abs(v) < 0.001 ? (v < 0 ? -0.001 : 0.001) : v; draw(); } });
    var pb = V.button(F.ctl, 'Let h → 0', function () {
      if (anim) { anim.stop(); anim = null; pb.textContent = 'Let h → 0'; return; }
      pb.textContent = '❚❚ Pause'; var acc = 0;
      anim = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.7) return; acc = 0; S.h /= 2; } else S.h *= M.pow(0.3, dt); if (M.abs(S.h) < 0.002) { S.h = S.h < 0 ? -0.001 : 0.001; anim.stop(); anim = null; pb.textContent = 'Let h → 0'; } hs.set(S.h); draw(); });
    }, 'pri');
    var tbl = o.table ? mk('div', 'mla-tablewrap') : null; if (tbl) el.insertBefore(tbl, F.out.el);
    function draw() {
      var k = V.colors(), ctx = c.ctx, a = S.a, h = S.h, fa = f(a), fb = f(a + h), m = (fb - fa) / h, d = df(a), v = P.view();
      P.clear(); P.grid(); P.axes();
      P.plot(f, { color: 'blue', width: 3 });
      if (o.tangent && isFinite(d)) P.plot(function (x) { return fa + d * (x - a); }, { color: 'gold', width: 2, dash: [8, 6] });
      P.seg(a, fa, a + h, fa, { color: 'green', width: 2, dash: [4, 3] }); P.seg(a + h, fa, a + h, fb, { color: 'red', width: 2, dash: [4, 3] });
      P.plot(function (x) { return fa + m * (x - a); }, { color: 'purple', width: 2.5 });
      knob(ctx, P.X(a), P.Y(fa), k.ink, 7); knob(ctx, P.X(a + h), P.Y(fb), k.purple, 7);
      label(ctx, 'P', P.X(a) - 12, P.Y(fa) + 14, { bold: true, clampW: c.w, clampH: c.h }); label(ctx, 'Q', P.X(a + h) + 12, P.Y(fb) - 14, { bold: true, color: k.purple, clampW: c.w, clampH: c.h });
      H.draw(ctx);
      var ds = isFinite(d) ? (ratio(d, 12) ? fr(d) : fm(d, 4)) : 'undefined';
      F.out.set('<span class="mla-key" style="--c:' + k.purple + '"></span>Secant slope = [<i>f</i>(' + fm(a, 2) + ' + ' + fm(h, 3).replace('−', '(−') + (h < 0 ? ')' : '') + ') − <i>f</i>(' + fm(a, 2) + ')] / ' + fm(h, 3).replace('−', '(−') + (h < 0 ? ')' : '') + ' = (' + fm(fb, 4) + ' − ' + fm(fa, 4) + ') / ' + fm(h, 3) + ' = <b>' + fm(m, 4) + '</b><br><span class="mla-key" style="--c:' + k.gold + '"></span>Tangent slope <i>f</i>′(' + fm(a, 2) + ') = <b>' + ds + '</b>. ' + (M.abs(h) < 0.05 ? 'With h this small the secant and the tangent are nearly the same line.' : 'Shrink h: Q slides toward P and the secant turns toward the tangent.'));
      if (tbl) { var hv = [1, 0.5, 0.1, 0.01, 0.001]; tbl.innerHTML = tableT([['<i>h</i>'].concat(hv.map(String)), ['secant slope'].concat(hv.map(function (q) { return fm((f(a + q) - fa) / q, 5); })), ['<i>h</i> (from the left)'].concat(hv.map(function (q) { return '−' + q; })), ['secant slope'].concat(hv.map(function (q) { return fm((f(a - q) - fa) / -q, 5); }))]); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  // two or three stacked panels that share x
  function panels(c, n, gap) { var h = (c.h - gap * (n - 1)) / n, r = []; for (var i = 0; i < n; i++) r.push({ y0: i * (h + gap), h: h }); return r; }
  function subPlane(c, pan, o) { // a plane drawing into one horizontal strip
    var P = { o: o }, ctx = c.ctx;
    P.X = function (x) { return (x - o.xmin) / (o.xmax - o.xmin) * c.w; };
    P.Y = function (y) { return pan.y0 + (o.ymax - y) / (o.ymax - o.ymin) * pan.h; };
    P.x = function (px) { return o.xmin + px / c.w * (o.xmax - o.xmin); };
    P.frame = function (title, ylab) {
      var k = V.colors(); ctx.save(); ctx.beginPath(); ctx.rect(0, pan.y0, c.w, pan.h); ctx.clip(); ctx.fillStyle = k.bg; ctx.fillRect(0, pan.y0, c.w, pan.h);
      var dx = nstep(o.xmax - o.xmin, c.w), dy = nstep(o.ymax - o.ymin, pan.h * 0.8);
      ctx.strokeStyle = k.grid; ctx.lineWidth = 1; ctx.beginPath();
      for (var x = M.ceil(o.xmin / dx) * dx; x <= o.xmax; x += dx) { ctx.moveTo(M.round(P.X(x)) + 0.5, pan.y0); ctx.lineTo(M.round(P.X(x)) + 0.5, pan.y0 + pan.h); }
      for (var y = M.ceil(o.ymin / dy) * dy; y <= o.ymax; y += dy) { ctx.moveTo(0, M.round(P.Y(y)) + 0.5); ctx.lineTo(c.w, M.round(P.Y(y)) + 0.5); }
      ctx.stroke();
      var ay = clamp(P.Y(0), pan.y0, pan.y0 + pan.h), ax = clamp(P.X(0), 0, c.w);
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(c.w, ay); ctx.moveTo(ax, pan.y0); ctx.lineTo(ax, pan.y0 + pan.h); ctx.stroke();
      ctx.fillStyle = k.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (x = M.ceil(o.xmin / dx) * dx; x <= o.xmax + 1e-9; x += dx) { if (M.abs(x) < dx / 2) continue; var px = P.X(x); if (px < 10 || px > c.w - 10) continue; ctx.fillText(fm(x, 4), px, M.min(ay + 3, pan.y0 + pan.h - 14)); }
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (y = M.ceil(o.ymin / dy) * dy; y <= o.ymax + 1e-9; y += dy) { if (M.abs(y) < dy / 2) continue; var py = P.Y(y); if (py < pan.y0 + 8 || py > pan.y0 + pan.h - 8) continue; ctx.fillText(fm(y, 4), M.max(ax - 4, 26), py); }
      ctx.restore();
      if (title) label(ctx, title, 8, pan.y0 + 14, { align: 'left', size: 12, bold: true, color: k.ink });
    };
    P.plot = function (f, q) {
      q = q || {}; var k = V.colors(), a = q.from != null ? M.max(q.from, o.xmin) : o.xmin, b = q.to != null ? M.min(q.to, o.xmax) : o.xmax, N = M.max(200, c.w), span = o.ymax - o.ymin, pen = false, last = null;
      ctx.save(); ctx.beginPath(); ctx.rect(0, pan.y0, c.w, pan.h); ctx.clip(); ctx.strokeStyle = q.color ? (k[q.color] || q.color) : k.blue; ctx.lineWidth = q.width || 2.5; ctx.setLineDash(q.dash || []); ctx.globalAlpha = q.alpha || 1; ctx.lineJoin = 'round'; ctx.beginPath();
      for (var i = 0; i <= N; i++) { var x = a + (b - a) * i / N, y = f(x); if (!isFinite(y) || (last !== null && M.abs(y - last) > span * 2)) { pen = false; last = isFinite(y) ? y : null; continue; } var py = clamp(P.Y(y), -1e4, 1e4); if (pen) ctx.lineTo(P.X(x), py); else { ctx.moveTo(P.X(x), py); pen = true; } last = y; }
      ctx.stroke(); ctx.restore();
    };
    P.clip = function (fn) { ctx.save(); ctx.beginPath(); ctx.rect(0, pan.y0, c.w, pan.h); ctx.clip(); fn(); ctx.restore(); };
    return P;
  }
  function autoY(fs, a, b, pad) { var lo = Infinity, hi = -Infinity; fs.forEach(function (f) { for (var i = 0; i <= 300; i++) { var y = f(a + (b - a) * i / 300); if (isFinite(y) && M.abs(y) < 1e6) { lo = M.min(lo, y); hi = M.max(hi, y); } } }); if (!isFinite(lo)) { lo = -1; hi = 1; } lo = M.min(lo, 0); hi = M.max(hi, 0); var p = (hi - lo) * (pad || 0.12) || 1; return [lo - p, hi + p]; }

  /* derivgraph: f on top, f′ underneath; move along x and watch the tangent's slope become the height of f′.
     opts:
       f: "x^3/3 - x"               the function (params allowed)
       x: -1.5                      starting x
       xmin, xmax (−2.5, 2.5)       shared x range; ymin, ymax for f; dymin, dymax for f′ (default: fit)
       reveal: false                draw f′ only where you have been (sketch it yourself first)
       second: false                add a third panel with f″ (concavity)
       colors: true                 color f green where it rises and red where it falls, and f′ to match */
  R('derivgraph', function (el, o) {
    o = opt(o, { f: 'x^3/3 - x', x: -1.5, xmin: -2.5, xmax: 2.5, reveal: false, second: false, colors: true });
    var Pm = {}, ps = params(o.params), f = cf(o.f, ['x'], Pm), d1 = cfd(o.f, 'x', ['x'], Pm), d2 = o.second ? cfd(o.f, 'x', ['x'], Pm, 2) : null, S = { x: nv(o.x, -1.5) };
    var xmin = nv(o.xmin, -3), xmax = nv(o.xmax, 3), seen = new Uint8Array(301);
    var F = frame(el, o, 'The graph of f and the graph of its derivative'), c = F.canvas({ aspect: o.second ? 0.95 : 1.15, max: o.second ? 720 : 560, min: o.second ? 520 : 400 });
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    var sx = V.slider(F.ctl, { label: 'x', min: xmin, max: xmax, step: (xmax - xmin) / 300, value: S.x, input: function (v) { S.x = v; mark(); draw(); } });
    if (o.reveal) V.button(F.ctl, 'Show all of f′', function () { seen.fill(1); draw(); });
    function mark() { seen[M.round((S.x - xmin) / (xmax - xmin) * 300)] = 1; }
    mark();
    V.drag(c.cv, { hit: function () { return 1; }, start: function (h, px) { this.move(h, px); }, move: function (h, px) { var nx = clamp(xmin + px / c.w * (xmax - xmin), xmin, xmax); var i0 = M.round((S.x - xmin) / (xmax - xmin) * 300), i1 = M.round((nx - xmin) / (xmax - xmin) * 300); for (var i = M.min(i0, i1); i <= M.max(i0, i1); i++) seen[i] = 1; S.x = nx; sx.set(S.x); draw(); } });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Graphs of f and its derivative. Left and right arrow keys move along x.');
    c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (!d) return; S.x = clamp(S.x + d * (xmax - xmin) / 100 * (e.shiftKey ? 5 : 1), xmin, xmax); sx.set(S.x); mark(); draw(); e.preventDefault(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, pans = panels(c, o.second ? 3 : 2, 10), x = S.x;
      var yf = o.ymin != null ? [nv(o.ymin), nv(o.ymax)] : autoY([f], xmin, xmax), yd = o.dymin != null ? [nv(o.dymin), nv(o.dymax)] : autoY([d1], xmin, xmax);
      var Pf = subPlane(c, pans[0], { xmin: xmin, xmax: xmax, ymin: yf[0], ymax: yf[1] }), Pd = subPlane(c, pans[1], { xmin: xmin, xmax: xmax, ymin: yd[0], ymax: yd[1] });
      ctx.fillStyle = k.panel; ctx.fillRect(0, 0, c.w, c.h);
      Pf.frame('f(x)'); Pd.frame("f′(x): the slope of f");
      if (o.colors) {
        Pf.plot(function (t) { return d1(t) >= 0 ? f(t) : NaN; }, { color: 'green', width: 3.2 }); Pf.plot(function (t) { return d1(t) < 0 ? f(t) : NaN; }, { color: 'red', width: 3.2 });
      } else Pf.plot(f, { color: 'blue', width: 3 });
      var visible = function (t) { return !o.reveal || seen[M.round((t - xmin) / (xmax - xmin) * 300)]; };
      if (o.colors) { Pd.plot(function (t) { return visible(t) && d1(t) >= 0 ? d1(t) : NaN; }, { color: 'green', width: 3 }); Pd.plot(function (t) { return visible(t) && d1(t) < 0 ? d1(t) : NaN; }, { color: 'red', width: 3 }); }
      else Pd.plot(function (t) { return visible(t) ? d1(t) : NaN; }, { color: 'purple', width: 3 });
      // critical points
      zeros(d1, xmin, xmax, 300).forEach(function (r) { if (!visible(r)) return; ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = k.ink; ctx.lineWidth = 2; [[Pf, f(r)], [Pd, 0]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0].X(r), q[0].Y(q[1]), 4.5, 0, TAU); ctx.fill(); ctx.stroke(); }); ctx.restore(); });
      var y = f(x), m = d1(x), X = Pf.X(x);
      Pf.clip(function () { var w = (xmax - xmin) * 0.12; ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(Pf.X(x - w), Pf.Y(y - m * w)); ctx.lineTo(Pf.X(x + w), Pf.Y(y + m * w)); ctx.stroke(); });
      ctx.save(); ctx.strokeStyle = k.muted; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X, c.h); ctx.stroke(); ctx.restore();
      knob(ctx, X, Pf.Y(y), k.ink, 7); knob(ctx, X, Pd.Y(clamp(m, yd[0], yd[1])), k.gold, 7);
      label(ctx, F.quiet ? 'slope' : 'slope ' + fm(m, 2), X + 12, Pf.Y(y) - 16, { align: 'left', color: k.gold, clampW: c.w });
      label(ctx, F.quiet ? "f′" : "f′ = " + fm(m, 2), X + 12, Pd.Y(clamp(m, yd[0], yd[1])) - 16, { align: 'left', color: k.gold, clampW: c.w });
      var s = 'At <i>x</i> = ' + fm(x, 2) + ': <i>f</i>(<i>x</i>) = ' + fm(y, 3) + ', and the tangent’s slope is ' + fm(m, 3) + ', so <i>f</i>′(<i>x</i>) = ' + fm(m, 3) + '. ';
      s += M.abs(m) < 0.02 ? 'Slope near 0: a flat tangent (a possible high or low point), where <i>f</i>′ crosses 0.' : m > 0 ? '<span class="mla-g"><i>f</i> is rising</span>, so <i>f</i>′ is above the axis.' : '<span class="mla-r"><i>f</i> is falling</span>, so <i>f</i>′ is below the axis.';
      if (d2) { var y2 = autoY([d2], xmin, xmax), P2 = subPlane(c, pans[2], { xmin: xmin, xmax: xmax, ymin: y2[0], ymax: y2[1] }); P2.frame("f″(x): how the slope changes"); P2.plot(d2, { color: 'purple', width: 3 }); var c2 = d2(x); knob(ctx, X, P2.Y(clamp(c2, y2[0], y2[1])), k.purple, 6); ctx.save(); ctx.strokeStyle = k.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X, c.h); ctx.stroke(); ctx.restore(); s += ' <i>f</i>″(' + fm(x, 2) + ') = ' + fm(c2, 3) + (M.abs(c2) < 0.02 ? ': no bend here (a possible inflection point).' : c2 > 0 ? ': <i>f</i>′ is increasing, so <i>f</i> is concave up (bends like a cup).' : ': <i>f</i>′ is decreasing, so <i>f</i> is concave down (bends like a cap).'); }
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* riemann: left, right, midpoint and trapezoid sums approach the integral as n grows.
     opts:
       f: "x^2"                     the integrand (params allowed)
       a: 0, b: 2                   the interval
       n: 4, maxN: 100              starting number of pieces and the most allowed
       method: "left"               "left", "right", "mid", "trap", "upper", "lower"
       methods: ["left", "right", "mid", "trap"]   the choices offered
       compare: true                a table with all four sums for the current n
       exact: true                  show the exact integral (computed to 12 digits) and the error
       xmin…ymax                    view (default: fits [a, b] and f) */
  function rsum(f, a, b, n, m) {
    var dx = (b - a) / n, s = 0;
    for (var i = 0; i < n; i++) {
      var x0 = a + i * dx, x1 = x0 + dx;
      if (m === 'left') s += f(x0); else if (m === 'right') s += f(x1); else if (m === 'mid') s += f(x0 + dx / 2); else if (m === 'trap') s += (f(x0) + f(x1)) / 2;
      else { var lo = Infinity, hi = -Infinity; for (var j = 0; j <= 20; j++) { var y = f(x0 + dx * j / 20); lo = M.min(lo, y); hi = M.max(hi, y); } s += m === 'upper' ? hi : lo; }
    }
    return s * dx;
  }
  R('riemann', function (el, o) {
    o = opt(o, { f: 'x^2', a: 0, b: 2, n: 4, maxN: 100, method: 'left', methods: ['left', 'right', 'mid', 'trap'], compare: true, exact: true });
    var Pm = {}, ps = params(o.params), f = cf(o.f, ['x'], Pm), a = nv(o.a, 0), b = nv(o.b, 2), S = { n: o.n, m: o.method };
    var yr = autoY([f], a, b, 0.15), padx = (b - a) * 0.15;
    var F = frame(el, o, 'Riemann sums for the integral of ' + o.f + ' from ' + fm(a) + ' to ' + fm(b)), c = F.canvas({ aspect: 1.6 }), P = V.plane(c, win(o, [a - padx, b + padx, yr[0], yr[1]]));
    scrollOK(c);
    var names = { left: 'Left', right: 'Right', mid: 'Midpoint', trap: 'Trapezoid', upper: 'Upper', lower: 'Lower' };
    V.seg(F.ctl, { label: 'Method', items: o.methods.map(function (m) { return [m, names[m]]; }), value: S.m, change: function (v) { S.m = v; draw(); } });
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    var row = F.row(), nsl = V.slider(row, { label: 'n (number of pieces)', min: 1, max: o.maxN, step: 1, value: S.n, input: function (v) { S.n = v; draw(); } });
    V.button(row, '× 2', function () { S.n = M.min(o.maxN, S.n * 2); nsl.set(S.n); draw(); });
    var tbl = o.compare ? mk('div', 'mla-tablewrap') : null; if (tbl) el.insertBefore(tbl, F.out.el);
    function draw() {
      var k = V.colors(), ctx = c.ctx, n = S.n, m = S.m, dx = (b - a) / n, ex = quad(f, a, b), sum = rsum(f, a, b, n, m);
      P.clear(); P.grid(); P.axes();
      for (var i = 0; i < n; i++) {
        var x0 = a + i * dx, x1 = x0 + dx, pts, sx = null, h;
        if (m === 'trap') pts = [[x0, 0], [x0, f(x0)], [x1, f(x1)], [x1, 0]];
        else {
          if (m === 'left') { sx = x0; h = f(x0); } else if (m === 'right') { sx = x1; h = f(x1); } else if (m === 'mid') { sx = x0 + dx / 2; h = f(sx); }
          else { var lo = Infinity, hi = -Infinity; for (var j = 0; j <= 20; j++) { var y = f(x0 + dx * j / 20); lo = M.min(lo, y); hi = M.max(hi, y); } h = m === 'upper' ? hi : lo; }
          pts = [[x0, 0], [x0, h], [x1, h], [x1, 0]];
        }
        var neg = (pts[1][1] + pts[2][1]) < 0;
        P.poly(pts, { fill: neg ? rgba(k.red, 0.22) : rgba(k.blue, 0.2), color: neg ? 'red' : 'blue', width: n > 60 ? 0.5 : 1.2 });
        if (sx != null && n <= 40) P.point(sx, h, { color: 'gold', r: n > 20 ? 2.5 : 4 });
      }
      P.plot(f, { color: 'ink', width: 2.5, from: a - padx * 2, to: b + padx * 2 });
      var s = names[m] + ' sum with <i>n</i> = ' + n + ': Δ<i>x</i> = (' + pf(b, 4) + ' − ' + pf(a, 4) + ')/' + n + ' = ' + (ratio(dx / PI, 12) && !ratio(dx, 12) ? pf(dx) + ' ≈ ' : '') + fm(dx, 4) + ', sum = <b>' + fm(sum, 6) + '</b>';
      if (o.exact) { var exS = ratio(ex, 60) ? fr(ex) : ratio(ex / PI, 12) ? pf(ex) : null, err = sum - ex, below = false; for (var q = 0; q <= 50; q++) if (f(a + (b - a) * q / 50) < 0) below = true;
        s += '<br>Exact area ∫ = ' + (exS && exS !== fm(ex, 6) ? exS + ' ≈ ' : '') + fm(ex, 6) + ' · error = ' + (M.abs(err) < 1e-9 ? '0 (exact here!)' : (err < 0 ? '−' : '+') + fm(M.abs(err), 6)) + '.' + (below ? ' Area below the axis counts as negative.' : ''); }
      F.out.set(s);
      if (tbl) { var ms = ['left', 'right', 'mid', 'trap']; tbl.innerHTML = tableT([['<i>n</i> = ' + n].concat(ms.map(function (q) { return names[q]; })), ['sum'].concat(ms.map(function (q) { return fm(rsum(f, a, b, n, q), 5); }))].concat(o.exact ? [['error'].concat(ms.map(function (q) { return fm(rsum(f, a, b, n, q) - ex, 5); }))] : []), ms.indexOf(m)); }
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* ftc: the area under f from a to x builds the graph of A(x) = ∫ₐˣ f(t) dt, and A′(x) = f(x).
     opts:
       f: "2 - x"                    the function (in x; params allowed)
       a: 0                          where the accumulation starts
       x: 1                          starting upper limit
       xmin, xmax (−1, 5)            shared x range; ymin, ymax for f; Amin, Amax for A (default: fit)
       ghost: false                  show all of A faintly ahead of x
       play: true                    a button that sweeps x */
  R('ftc', function (el, o) {
    o = opt(o, { f: '2 - x', a: 0, x: 1, xmin: -1, xmax: 5, ghost: false, play: true });
    var Pm = {}, ps = params(o.params), f = cf(o.f, ['x'], Pm), a = nv(o.a, 0), xmin = nv(o.xmin, -1), xmax = nv(o.xmax, 5), S = { x: nv(o.x, 1) }, anim = null, N = 600, Ar = new Float64Array(N + 1);
    var F = frame(el, o, 'Area accumulation and the fundamental theorem of calculus'), c = F.canvas({ aspect: 1.15, max: 560, min: 400 });
    function build() { // A at grid points by composite Gauss on each cell, anchored at a
      var dx = (xmax - xmin) / N, ia = (a - xmin) / dx, i0 = M.round(ia); Ar[i0] = gauss(f, a, xmin + i0 * dx, 2);
      for (var i = i0 + 1; i <= N; i++) Ar[i] = Ar[i - 1] + gauss(f, xmin + (i - 1) * dx, xmin + i * dx, 1);
      for (i = i0 - 1; i >= 0; i--) Ar[i] = Ar[i + 1] - gauss(f, xmin + i * dx, xmin + (i + 1) * dx, 1);
    }
    function A(x) { return gauss(f, a, x, 24); }
    function Ag(x) { var t = (x - xmin) / (xmax - xmin) * N, i = clamp(M.floor(t), 0, N - 1), u = t - i; return Ar[i] * (1 - u) + Ar[i + 1] * u; }
    build();
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, function () { build(); draw(); }); });
    var sx = V.slider(F.ctl, { label: 'x (upper limit)', min: xmin, max: xmax, step: (xmax - xmin) / 300, value: S.x, input: function (v) { S.x = v; draw(); } });
    if (o.play) { var pb = V.button(F.ctl, '▶ Sweep x', function () {
      if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Sweep x'; return; }
      if (S.x >= xmax - 1e-6) S.x = a; pb.textContent = '❚❚ Pause'; var acc = 0;
      anim = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.5) return; acc = 0; S.x += (xmax - xmin) / 12; } else S.x += dt * (xmax - xmin) / 7; S.x = M.min(xmax, S.x); sx.set(S.x); draw(); if (S.x >= xmax) { anim.stop(); anim = null; pb.textContent = '▶ Sweep x'; } });
    }); }
    V.drag(c.cv, { hit: function () { return 1; }, start: function (h, px) { this.move(h, px); }, move: function (h, px) { S.x = clamp(xmin + px / c.w * (xmax - xmin), xmin, xmax); sx.set(S.x); draw(); } });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Area under f and the accumulation function A. Left and right arrow keys move x.');
    c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (!d) return; S.x = clamp(S.x + d * (xmax - xmin) / 60, xmin, xmax); sx.set(S.x); draw(); e.preventDefault(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, pans = panels(c, 2, 10), x = S.x, yf = o.ymin != null ? [nv(o.ymin), nv(o.ymax)] : autoY([f], xmin, xmax), yA = o.Amin != null ? [nv(o.Amin), nv(o.Amax)] : autoY([Ag], xmin, xmax);
      var Pf = subPlane(c, pans[0], { xmin: xmin, xmax: xmax, ymin: yf[0], ymax: yf[1] }), PA = subPlane(c, pans[1], { xmin: xmin, xmax: xmax, ymin: yA[0], ymax: yA[1] });
      ctx.fillStyle = k.panel; ctx.fillRect(0, 0, c.w, c.h);
      Pf.frame('f(t)'); PA.frame('A(x) = area from ' + fm(a) + ' to x');
      Pf.clip(function () { // signed area
        var lo = M.min(a, x), hi = M.max(a, x), n = 200; ['pos', 'neg'].forEach(function (sg) {
          ctx.beginPath(); ctx.moveTo(Pf.X(lo), Pf.Y(0));
          for (var i = 0; i <= n; i++) { var t = lo + (hi - lo) * i / n, y = f(t); y = sg === 'pos' ? M.max(0, y) : M.min(0, y); ctx.lineTo(Pf.X(t), Pf.Y(isFinite(y) ? y : 0)); }
          ctx.lineTo(Pf.X(hi), Pf.Y(0)); ctx.closePath(); ctx.fillStyle = (sg === 'pos') === (x >= a) ? rgba(k.green, 0.3) : rgba(k.red, 0.3); ctx.fill();
        });
      });
      Pf.plot(f, { color: 'blue', width: 3 });
      if (o.ghost) PA.plot(Ag, { color: 'muted', width: 1.5, dash: [4, 4] });
      PA.plot(Ag, { color: 'purple', width: 3, from: M.min(a, x), to: M.max(a, x) });
      var Ax = A(x), fx = f(x), X = Pf.X(x);
      PA.clip(function () { var w = (xmax - xmin) * 0.1; ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(PA.X(x - w), PA.Y(Ax - fx * w)); ctx.lineTo(PA.X(x + w), PA.Y(Ax + fx * w)); ctx.stroke(); });
      ctx.save(); ctx.strokeStyle = k.muted; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X, c.h); ctx.moveTo(Pf.X(a), pans[0].y0); ctx.lineTo(Pf.X(a), pans[0].y0 + pans[0].h); ctx.stroke(); ctx.restore();
      knob(ctx, X, Pf.Y(fx), k.blue, 6); knob(ctx, X, PA.Y(Ax), k.purple, 7);
      label(ctx, F.quiet ? 'height' : 'height ' + fm(fx, 2), X + 10, Pf.Y(fx) - 15, { align: 'left', color: k.blue, clampW: c.w });
      label(ctx, F.quiet ? 'A(x)' : 'A = ' + fm(Ax, 3) + ', slope ' + fm(fx, 2), X + 10, PA.Y(Ax) - 16, { align: 'left', color: k.purple, clampW: c.w });
      F.out.set('<i>A</i>(' + fm(x, 2) + ') = ∫<sub>' + fm(a) + '</sub><sup>' + fm(x, 2) + '</sup> <i>f</i>(<i>t</i>) d<i>t</i> = <b>' + fm(Ax, 4) + '</b> (area <span class="mla-g">above</span> the axis adds, area <span class="mla-r">below</span> subtracts). The slope of <i>A</i> at <i>x</i> is ' + fm((A(x + 1e-4) - A(x - 1e-4)) / 2e-4, 3) + ', the same as the height <i>f</i>(' + fm(x, 2) + ') = ' + fm(fx, 3) + ': <i>A</i>′(<i>x</i>) = <i>f</i>(<i>x</i>).' + (M.abs(fx) < 0.03 ? ' Here <i>f</i> = 0, so <i>A</i> has a flat tangent.' : fx > 0 ? ' Since <i>f</i> &gt; 0 here, <i>A</i> is increasing.' : ' Since <i>f</i> &lt; 0 here, <i>A</i> is decreasing.'));
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* solids: a region spun around an axis into a solid of revolution, with one disk, washer or shell.
     opts:
       f: "sqrt(x)"                 the outer (upper) curve, in x
       g: null                      the inner (lower) curve; default the line y = k (or y = 0)
       a: 0, b: 4                   the x interval
       axis: "x"                    "x": spin around the horizontal line y = k (disks and washers)
                                    "y": spin around the vertical line x = k (cylindrical shells)
       k: 0                         where the axis is (keep the whole region on one side of it)
       angle: 270                   how far it is spun to start (degrees); a slider goes 0 … 360
       slice: true, x0: null        show one representative slice at x0 (default the middle)
       yaw, pitch                   starting view angles (radians) */
  R('solids', function (el, o) {
    o = opt(o, { f: 'sqrt(x)', g: null, a: 0, b: 4, axis: 'x', k: 0, angle: 270, slice: true, x0: null });
    var Pm = {}, f = cf(o.f, ['x'], Pm), kk = nv(o.k, 0), g = o.g != null ? cf(o.g, ['x'], Pm) : (o.axis === 'x' ? function () { return kk; } : function () { return 0; }), a = nv(o.a, 0), b = nv(o.b, 4);
    var S = { ang: nv(o.angle, 270), x0: o.x0 != null ? nv(o.x0, (a + b) / 2) : (a + b) / 2 };
    var F = frame(el, o, 'Solid of revolution'), c = F.canvas({ aspect: 1.35, max: 520, min: 320 });
    // bounds for the camera
    var ymax = -Infinity, ymin = Infinity; for (var i = 0; i <= 100; i++) { var x = a + (b - a) * i / 100; [f(x), g(x)].forEach(function (y) { if (isFinite(y)) { ymax = M.max(ymax, y); ymin = M.min(ymin, y); } }); }
    var Rm = o.axis === 'x' ? M.max(M.abs(ymax - kk), M.abs(ymin - kk)) : M.max(M.abs(a - kk), M.abs(b - kk));
    var cen = o.axis === 'x' ? [(a + b) / 2, 0, kk] : [kk, 0, (ymin + ymax) / 2], rad = o.axis === 'x' ? M.hypot((b - a) / 2, Rm) : M.hypot(Rm, (ymax - ymin) / 2);
    var C3 = cam3(c, { yaw: o.yaw != null ? o.yaw : -0.55, pitch: o.pitch != null ? o.pitch : 0.36, r: rad * 1.05, center: cen, change: draw });
    c.cv.setAttribute('aria-label', 'Solid of revolution. Drag or use the arrow keys to turn it.');
    V.slider(F.ctl, { label: 'Spin', min: 0, max: 360, step: 5, value: S.ang, fmt: function (v) { return v + '°'; }, input: function (v) { S.ang = v; draw(); } });
    if (o.slice) V.slider(F.ctl, { label: 'Slice at x', min: a, max: b, step: (b - a) / 100, value: S.x0, input: function (v) { S.x0 = v; draw(); } });
    function W(x, y, ph) { // a point (x, y) of the plane spun by angle ph around the axis -> world [X, Y, Z] (Z up)
      if (o.axis === 'x') { var r = y - kk; return [x, r * M.sin(ph), kk + r * M.cos(ph)]; }
      var q = x - kk; return [kk + q * M.cos(ph), q * M.sin(ph), y];
    }
    function boundary(n) { // closed outline of the region
      var p = [], i;
      for (i = 0; i <= n; i++) { var x = a + (b - a) * i / n; p.push([x, f(x)]); }
      for (i = 1; i <= 4; i++) p.push([b, f(b) + (g(b) - f(b)) * i / 4]);
      for (i = n - 1; i >= 0; i--) { x = a + (b - a) * i / n; p.push([x, g(x)]); }
      for (i = 1; i < 4; i++) p.push([a, g(a) + (f(a) - g(a)) * i / 4]);
      return p;
    }
    function vol() {
      if (o.axis === 'x') return PI * gauss(function (x) { var R1 = M.abs(f(x) - kk), r1 = M.abs(g(x) - kk); if ((f(x) - kk) * (g(x) - kk) < 0) return M.max(R1, r1) * M.max(R1, r1); return M.abs(R1 * R1 - r1 * r1); }, a, b, 120);
      return 2 * PI * gauss(function (x) { return M.abs(x - kk) * M.abs(f(x) - g(x)); }, a, b, 120);
    }
    var V0 = vol();
    function draw() {
      var k = V.colors(), ctx = c.ctx, faces = [], ph1 = S.ang * PI / 180, na = M.max(2, M.round(S.ang / 10)), bd = boundary(24), base = rgb(k.blue);
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      C3.axes(ctx, o.axis === 'x' ? [M.max(M.abs(a), M.abs(b)) * 1.15 + 0.5, Rm * 1.2, Rm * 1.2 + M.abs(kk)] : [Rm * 1.25 + M.abs(kk), Rm * 1.25, M.max(M.abs(ymin), M.abs(ymax)) * 1.15 + 0.5], { names: ['x', '', 'y'] });
      if (ph1 > 0) for (var j = 0; j < na; j++) {
        var p0 = ph1 * j / na, p1 = ph1 * (j + 1) / na;
        for (var i = 0; i < bd.length; i++) {
          var A1 = bd[i], B1 = bd[(i + 1) % bd.length], q = [W(A1[0], A1[1], p0), W(B1[0], B1[1], p0), W(B1[0], B1[1], p1), W(A1[0], A1[1], p1)], nn = norm3(q[0], q[1], q[2]);
          if (len(nn) < 1e-12) nn = norm3(q[0], q[2], q[3]);
          var L = 0.45 + 0.6 * C3.light(nn);
          faces.push({ q: q, fill: 'rgba(' + M.round(M.min(255, base[0] * L)) + ',' + M.round(M.min(255, base[1] * L)) + ',' + M.round(M.min(255, base[2] * L)) + ',0.82)' });
        }
      }
      [0, ph1].forEach(function (ph, idx) { if (idx && S.ang >= 360) return; faces.push({ q: bd.map(function (p) { return W(p[0], p[1], ph); }), fill: rgba(k.gold, idx ? 0.45 : 0.6), stroke: k.gold, lw: 1.5, bias: 0.001 }); });
      if (o.slice) {
        var x0 = S.x0, dx = (b - a) / 40, n2 = 36;
        if (o.axis === 'x') { var r0 = g(x0), r1 = f(x0); for (j = 0; j < n2; j++) { var t0 = TAU * j / n2, t1 = TAU * (j + 1) / n2; [[x0 - dx / 2, x0 + dx / 2]].forEach(function (xx) { faces.push({ q: [W(xx[0], r1, t0), W(xx[1], r1, t0), W(xx[1], r1, t1), W(xx[0], r1, t1)], fill: rgba(k.red, 0.85), stroke: rgba(k.red, 0.9) }); faces.push({ q: [W(xx[1], r0, t0), W(xx[1], r1, t0), W(xx[1], r1, t1), W(xx[1], r0, t1)], fill: rgba(k.red, 0.6) }); faces.push({ q: [W(xx[0], r0, t0), W(xx[0], r1, t0), W(xx[0], r1, t1), W(xx[0], r0, t1)], fill: rgba(k.red, 0.6) }); }); } }
        else { var y0 = g(x0), y1 = f(x0); for (j = 0; j < n2; j++) { t0 = TAU * j / n2; t1 = TAU * (j + 1) / n2; faces.push({ q: [W(x0 - dx / 2, y0, t0), W(x0 - dx / 2, y1, t0), W(x0 - dx / 2, y1, t1), W(x0 - dx / 2, y0, t1)], fill: rgba(k.red, 0.7) }); faces.push({ q: [W(x0 + dx / 2, y0, t0), W(x0 + dx / 2, y1, t0), W(x0 + dx / 2, y1, t1), W(x0 + dx / 2, y0, t1)], fill: rgba(k.red, 0.85) }); } }
      }
      C3.faces(ctx, faces);
      // the axis of rotation
      var ax0 = o.axis === 'x' ? [M.min(a, 0) - 0.3, 0, kk] : [kk, 0, M.min(ymin, 0) - 0.3], ax1 = o.axis === 'x' ? [b + 0.6, 0, kk] : [kk, 0, ymax + 0.6];
      C3.line(ctx, [ax0, ax1], k.purple, 2, [7, 5]);
      var lp = C3.p(ax1[0], ax1[1], ax1[2]); label(ctx, o.axis === 'x' ? 'axis y = ' + fm(kk) : 'axis x = ' + fm(kk), lp[0] + 6, lp[1] - 12, { color: k.purple, size: 12, align: 'left', clampW: c.w, clampH: c.h });
      var s, x0s = fm(S.x0, 2);
      if (o.axis === 'x') { var R0 = M.abs(f(S.x0) - kk), r = M.abs(g(S.x0) - kk); s = 'Washer method (spin around <i>y</i> = ' + fm(kk) + '): each slice is a disk of radius <i>R</i> with a hole of radius <i>r</i>. At <i>x</i> = ' + x0s + ': <i>R</i> = ' + fm(M.max(R0, r), 3) + ', <i>r</i> = ' + fm((f(S.x0) - kk) * (g(S.x0) - kk) < 0 ? 0 : M.min(R0, r), 3) + ', slice volume ≈ π(<i>R</i>² − <i>r</i>²)Δ<i>x</i>.<br><i>V</i> = π∫<sub>' + fm(a) + '</sub><sup>' + fm(b) + '</sup> (<i>R</i>² − <i>r</i>²) d<i>x</i> = '; }
      else { s = 'Shell method (spin around <i>x</i> = ' + fm(kk) + '): each slice is a thin cylinder. At <i>x</i> = ' + x0s + ': radius ' + fm(M.abs(S.x0 - kk), 3) + ', height ' + fm(M.abs(f(S.x0) - g(S.x0)), 3) + ', slice volume ≈ 2π · radius · height · Δ<i>x</i>.<br><i>V</i> = 2π∫<sub>' + fm(a) + '</sub><sup>' + fm(b) + '</sup> (radius)(height) d<i>x</i> = '; }
      var vr = ratio(V0 / PI, 60); s += '<b>' + (vr ? (vr[0] === 1 ? '' : vr[0]) + 'π' + (vr[1] === 1 ? '' : '/' + vr[1]) + ' ≈ ' : '') + fm(V0, 4) + '</b>.';
      F.out.set(s);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw, volume: function () { return V0; } };
  });

  /* taylor: Taylor polynomials built one term at a time.
     opts:
       f: "sin(x)"                  the function
       a: 0                          the center
       n: 1, maxN: 12               starting degree and the highest offered
       x: 2                          a probe point for the error (draggable)
       R: null                       radius of convergence to mark (dashed lines at a ± R)
       xmin…ymax (−7, 7, −3, 3) */
  R('taylor', function (el, o) {
    o = opt(o, { f: 'sin(x)', a: 0, n: 1, maxN: 12, x: 2, R: null, xmin: -7, xmax: 7, ymin: -3, ymax: 3 });
    var a = nv(o.a, 0), f = cf(o.f, ['x']), S = { n: o.n, x: nv(o.x, 2) }, co = [], cos = [], t = parseT(o.f), fact = 1;
    for (var kq = 0; kq <= o.maxN; kq++) {
      if (kq) fact *= kq; var dk;
      try { dk = cf(t, ['x'])(a); t = W.CAS.deriv(t, 'x'); } catch (e) { dk = NaN; }
      co.push(dk / fact);
      var ri = M.abs(dk - M.round(dk)) < 1e-9 * M.max(1, M.abs(dk)) ? [M.round(dk), 1] : ratio(dk, 60); // exact when f^(k)(a) is a fraction
      if (ri) { var p = ri[0], q = ri[1] * fact, g0 = gcd(p, q) || 1; cos.push(p === 0 ? '0' : (p / g0 < 0 ? '−' : '') + M.abs(p / g0) + (q / g0 === 1 ? '' : '/' + q / g0)); } else cos.push(fm(dk / fact, 5));
    }
    var F = frame(el, o, 'Taylor polynomials of ' + o.f + ' about ' + fm(a)), c = F.canvas({ aspect: 1.6 }), P = V.plane(c, win(o, [-7, 7, -3, 3]));
    function Pn(x, n) { var s = 0, u = 1; for (var i = 0; i <= n; i++) { s += co[i] * u; u *= x - a; } return s; }
    var H = handles(c, P, [{ get: function () { return [S.x, Pn(S.x, S.n)]; }, set: function (x) { S.x = M.round(x * 20) / 20; } }], { change: draw });
    c.cv.setAttribute('aria-label', 'Taylor polynomial. Left and right arrow keys move the probe point.');
    var row = F.ctl, nOut;
    V.button(row, '− term', function () { S.n = M.max(0, S.n - 1); nsl.set(S.n); draw(); });
    var nsl = V.slider(row, { label: 'degree n', min: 0, max: o.maxN, step: 1, value: S.n, input: function (v) { S.n = v; draw(); } });
    V.button(row, '+ term', function () { S.n = M.min(o.maxN, S.n + 1); nsl.set(S.n); draw(); }, 'pri');
    function polyHTML(n) {
      var out = '', first = true, xa = a === 0 ? '<i>x</i>' : '(<i>x</i> ' + (a > 0 ? '− ' : '+ ') + fm(M.abs(a)) + ')';
      for (var i = 0; i <= n; i++) {
        if (cos[i] === '0' || M.abs(co[i]) < 1e-14) continue;
        var cst = cos[i], neg = cst[0] === '−'; if (neg) cst = cst.slice(1);
        var pw = i === 0 ? '' : i === 1 ? xa : xa + '<sup>' + i + '</sup>';
        var mag = i === 0 ? cst : cst === '1' ? '' : cst.indexOf('/') >= 0 ? (cst.split('/')[0] === '1' ? '' : cst.split('/')[0]) : cst;
        var den = i > 0 && cst.indexOf('/') >= 0 ? '/' + cst.split('/')[1] : '';
        out += (first ? (neg ? '−' : '') : (neg ? ' − ' : ' + ')) + mag + pw + den; first = false;
      }
      return out || '0';
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view(), n = S.n;
      P.clear(); P.grid(); P.axes();
      if (o.R != null) { var Rr = nv(o.R, 1); ctx.save(); ctx.fillStyle = rgba(k.green, 0.07); ctx.fillRect(P.X(a - Rr), 0, P.X(a + Rr) - P.X(a - Rr), c.h); ctx.restore(); P.seg(a - Rr, v.ymin, a - Rr, v.ymax, { color: 'green', width: 1.3, dash: [5, 4] }); P.seg(a + Rr, v.ymin, a + Rr, v.ymax, { color: 'green', width: 1.3, dash: [5, 4] }); }
      P.plot(f, { color: 'blue', width: 3.5 });
      if (n > 0) P.plot(function (x) { return Pn(x, n - 1); }, { color: 'muted', width: 1.4, dash: [4, 5] });
      P.plot(function (x) { return Pn(x, n); }, { color: 'red', width: 2.6 });
      P.point(a, f(a), { color: 'ink', r: 4.5 });
      var px = S.x, fy = f(px), py = Pn(px, n);
      P.seg(px, fy, px, py, { color: 'gold', width: 3 });
      knob(ctx, P.X(px), P.Y(clamp(py, v.ymin - 1, v.ymax + 1)), k.red, 7); P.point(px, fy, { color: 'blue', r: 4.5 });
      H.draw(ctx);
      curveLabel(ctx, P, c, f, 'f', k.blue);
      F.out.set('<span class="mla-key" style="--c:' + k.red + '"></span><i>P</i><sub>' + n + '</sub>(<i>x</i>) = ' + polyHTML(n) + '<br>Each new term is <i>f</i><sup>(<i>k</i>)</sup>(' + fm(a) + ')/<i>k</i>! · ' + (a === 0 ? '<i>x</i>' : '(<i>x</i> − ' + fm(a) + ')') + '<sup><i>k</i></sup>, so <i>P</i><sub>' + n + '</sub> matches <i>f</i> and its first ' + n + ' derivatives at ' + fm(a) + '. At <i>x</i> = ' + fm(px, 2) + ': <i>f</i> = ' + fm(fy, 5) + ', <i>P</i><sub>' + n + '</sub> = ' + fm(py, 5) + ', <span style="color:' + k.gold + ';font-weight:700">error ' + fm(M.abs(fy - py), 5) + '</span>.' + (o.R != null ? ' Outside the green band (|' + (a === 0 ? '<i>x</i>' : '<i>x</i> − ' + fm(a)) + '| &gt; ' + fm(nv(o.R, 1)) + ') more terms make it worse, not better.' : ''));
    }
    redrawOn(c, draw); draw();
    return { draw: draw, coef: co };
  });

  /* seriespartial: partial sums of an infinite series, and whether they settle down.
     opts:
       a: "1/2^n"                   the nth term (in n; params allowed)
       start: 1                      first index
       N: 10, maxN: 60              terms added so far and the most allowed
       limit: "1"                    the sum, if known (drawn as a dashed line; a CAS string like "pi^2/6")
       presets: false                true: offer geometric, harmonic, p-series, alternating harmonic, 1/n!
       view: "plot"                  "plot" (terms and partial sums against n) or "walk" (the sum as steps on a number line) */
  var SERIES = [['1/2^n', 'geometric ½ⁿ', '1'], ['1/n', 'harmonic 1/n', null], ['1/n^2', 'p-series 1/n²', 'pi^2/6'], ['(-1)^(n+1)/n', 'alternating 1/n', 'ln(2)'], ['1/(n-1)!', '1/(n−1)!', 'e']];
  R('seriespartial', function (el, o) {
    o = opt(o, { a: '1/2^n', start: 1, N: 10, maxN: 60, limit: o.a ? null : '1', presets: false, view: 'plot' });
    var Pm = {}, ps = params(o.params), S = { a: o.a, lim: o.limit, N: o.N, view: o.view }, f = cf(S.a, ['n'], Pm);
    var F = frame(el, o, 'Partial sums of a series'), c = F.canvas({ aspect: 1.7 }), P = V.plane(c, { xmin: 0, xmax: 10, ymin: -1, ymax: 2 });
    scrollOK(c);
    if (o.presets) V.seg(F.ctl, { label: 'Series', items: SERIES.map(function (q) { return [q[0], q[1]]; }), value: S.a, change: function (v) { var q = SERIES.filter(function (z) { return z[0] === v; })[0]; S.a = v; S.lim = q[2]; f = cf(v, ['n'], Pm); draw(); } });
    V.seg(F.ctl, { label: 'View', items: [['plot', 'Plot'], ['walk', 'Number line']], value: S.view, change: function (v) { S.view = v; draw(); } });
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, draw); });
    var row = F.row(); var nsl = V.slider(row, { label: 'terms added N', min: 1, max: o.maxN, step: 1, value: S.N, input: function (v) { S.N = v; draw(); } });
    V.button(row, '+ 1 term', function () { S.N = M.min(o.maxN, S.N + 1); nsl.set(S.N); draw(); }, 'pri');
    function draw() {
      var k = V.colors(), ctx = c.ctx, N = S.N, terms = [], sums = [], acc = 0, L = S.lim != null ? nv(S.lim, NaN) : NaN;
      for (var i = 0; i < N; i++) { var t = f(o.start + i); acc += t; terms.push(t); sums.push(acc); }
      if (S.view === 'plot') {
        var all = terms.concat(sums).filter(isFinite).concat([0]).concat(isFinite(L) ? [L] : []), lo = M.min.apply(null, all), hi = M.max.apply(null, all), pd = (hi - lo) * 0.12 || 1;
        P.set({ xmin: o.start - 1, xmax: o.start + N, ymin: lo - pd, ymax: hi + pd });
        var gx = N > 30 ? 10 : N > 12 ? 2 : 1, gy = nstep(hi - lo + 2 * pd, c.h);
        P.clear(); P.grid({ step: gx, stepY: gy }); P.axes({ x: 'n', step: gx, stepY: gy });
        var bw = M.min(0.7, 0.7);
        terms.forEach(function (t, j) { var n = o.start + j; P.poly([[n - bw / 2, 0], [n - bw / 2, t], [n + bw / 2, t], [n + bw / 2, 0]], { fill: rgba(k.blue, 0.25), color: 'blue', width: 1 }); });
        if (isFinite(L)) P.seg(o.start - 1, L, o.start + N, L, { color: 'gold', width: 2, dash: [8, 5] });
        ctx.save(); ctx.strokeStyle = k.purple; ctx.lineWidth = 2; ctx.beginPath(); sums.forEach(function (s2, j) { var X = P.X(o.start + j), Y = P.Y(s2); if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore();
        sums.forEach(function (s2, j) { P.point(o.start + j, s2, { color: 'purple', r: N > 30 ? 2.5 : 4 }); });
        label(ctx, 'S' + sub(o.start + N - 1) + (F.quiet ? '' : ' = ' + fm(acc, 5)), P.X(o.start + N - 1) - 8, P.Y(acc) - 16, { align: 'right', color: k.purple, clampW: c.w, clampH: c.h });
        if (isFinite(L)) label(ctx, F.quiet ? 'sum' : 'sum ' + fm(L, 5), 8, P.Y(L) - 13, { align: 'left', color: k.gold, size: 12, clampH: c.h });
      } else {
        var lo2 = M.min(0, M.min.apply(null, sums)), hi2 = M.max.apply(null, sums.concat(isFinite(L) ? [L] : [0])), sp = (hi2 - lo2) || 1;
        P.set({ xmin: lo2 - sp * 0.06, xmax: hi2 + sp * 0.06, ymin: -1, ymax: 1 });
        P.clear(); var yb = c.h - 34, top = 34, rh = M.min(20, (yb - top - 10) / N), X = P.X;
        ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(10, yb); ctx.lineTo(c.w - 10, yb); ctx.stroke(); ctx.restore();
        var dx = nstep(P.o.xmax - P.o.xmin, c.w); for (var x = M.ceil(P.o.xmin / dx) * dx; x <= P.o.xmax; x += dx) { ctx.fillStyle = k.axis; ctx.fillRect(X(x) - 0.5, yb - 5, 1, 10); txt(ctx, fm(x, 3), X(x), yb + 16, { align: 'center', size: 11 }); }
        if (isFinite(L)) { ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(L), top - 6); ctx.lineTo(X(L), yb); ctx.stroke(); ctx.restore(); label(ctx, F.quiet ? 'sum' : 'sum ' + fm(L, 4), X(L), top - 14, { color: k.gold, clampW: c.w }); }
        var prev = 0;
        sums.forEach(function (s2, j) {
          var yy = top + rh * (j + 0.5), col = terms[j] < 0 ? k.red : k.blue;
          ctx.save(); ctx.strokeStyle = rgba(k.muted, 0.5); ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(X(s2), yy); ctx.lineTo(X(s2), j === N - 1 ? yb : yy + rh); ctx.stroke(); ctx.restore();
          arrowPx(ctx, X(prev), yy, X(s2), yy, col, rh > 8 ? 2.5 : 1.5, M.min(rh > 8 ? 9 : 5, M.abs(X(s2) - X(prev)) * 0.5)); prev = s2;
        });
        knob(ctx, X(acc), yb, k.purple, 7);
        txt(ctx, 'Each arrow is one term (red: negative); the dot is the partial sum.', 10, 14, { size: 12, color: k.ink });
      }
      var s = 'S' + sub(o.start + N - 1) + ' = ' + terms.slice(0, 5).map(function (t) { return fm(t, 4); }).join(' + ').replace(/\+ −/g, '− ') + (N > 5 ? ' + …' : '') + ' = <b>' + fm(acc, 6) + '</b>. Last term added: ' + fm(terms[N - 1], 6) + '.';
      var Ls = typeof S.lim === 'string' ? pretty(S.lim) : ''; if (isFinite(L)) s += ' The series converges to ' + (Ls && Ls !== fm(L, 6) ? mathHTML(Ls) + ' ≈ ' : '') + fm(L, 6) + '; still to go: ' + fm(L - acc, 6) + '.';
      else if (S.a === '1/n') s += ' The terms shrink to 0, yet these sums grow without bound (about ln <i>N</i> + 0.577): shrinking terms are not enough for a series to converge.';
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  // ---------- multivariable helpers ----------
  function mcells(f, x0, x1, y0, y1, nx, ny) { // sample a grid: {z[i][j], zmin, zmax}
    var z = [], lo = Infinity, hi = -Infinity;
    for (var i = 0; i <= nx; i++) { z.push(new Float64Array(ny + 1)); for (var j = 0; j <= ny; j++) { var v = f(x0 + (x1 - x0) * i / nx, y0 + (y1 - y0) * j / ny); z[i][j] = v; if (isFinite(v)) { lo = M.min(lo, v); hi = M.max(hi, v); } } }
    if (!isFinite(lo)) { lo = -1; hi = 1; } if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    return { z: z, zmin: lo, zmax: hi, nx: nx, ny: ny, x0: x0, x1: x1, y0: y0, y1: y1 };
  }
  function levels(lo, hi, n) { var st = nstep(hi - lo, n * 60), out = []; for (var v = M.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(M.abs(v) < st * 1e-9 ? 0 : v); return out; }
  function msq(G, lev) { // marching squares: segments [[x, y], [x, y]] where the grid crosses lev
    var out = [], dx = (G.x1 - G.x0) / G.nx, dy = (G.y1 - G.y0) / G.ny;
    function pt(i, j, i2, j2) { var a = G.z[i][j], b = G.z[i2][j2], t = (lev - a) / (b - a); return [G.x0 + (i + (i2 - i) * t) * dx, G.y0 + (j + (j2 - j) * t) * dy]; }
    for (var i = 0; i < G.nx; i++) for (var j = 0; j < G.ny; j++) {
      var a = G.z[i][j], b = G.z[i + 1][j], cc = G.z[i + 1][j + 1], d = G.z[i][j + 1];
      if (!(isFinite(a) && isFinite(b) && isFinite(cc) && isFinite(d))) continue;
      var e = [];
      if ((a < lev) !== (b < lev)) e.push(pt(i, j, i + 1, j));
      if ((b < lev) !== (cc < lev)) e.push(pt(i + 1, j, i + 1, j + 1));
      if ((cc < lev) !== (d < lev)) e.push(pt(i + 1, j + 1, i, j + 1));
      if ((d < lev) !== (a < lev)) e.push(pt(i, j + 1, i, j));
      if (e.length === 2) out.push([e[0], e[1], i, j]); else if (e.length === 4) { out.push([e[0], e[1], i, j]); out.push([e[2], e[3], i, j]); }
    }
    return out;
  }
  /* a filled contour map of f(x, y) drawn into plane P, cached on an offscreen canvas */
  function contourMap(c, P, f, o) {
    o = o || {}; var k = V.colors(), v = P.view(), key = [c.w, c.h, v.xmin, v.xmax, v.ymin, v.ymax, isDark(), o.key || ''].join(',');
    var cache = c._cmap || (c._cmap = {});
    if (cache.key !== key) {
      var off = cache.cv || (cache.cv = D.createElement('canvas')); off.width = M.round(c.w * c.dpr); off.height = M.round(c.h * c.dpr);
      var ox = off.getContext('2d'); ox.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
      var nx = M.min(90, M.round(c.w / 7)), ny = M.max(10, M.round(nx * c.h / c.w)), G = mcells(f, v.xmin, v.xmax, v.ymin, v.ymax, nx, ny), lv = o.levels || levels(G.zmin, G.zmax, o.n || 10);
      var cw = c.w / nx, ch = c.h / ny;
      for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
        var z = (G.z[i][j] + G.z[i + 1][j] + G.z[i][j + 1] + G.z[i + 1][j + 1]) / 4; if (!isFinite(z)) continue;
        var band = 0; while (band < lv.length && z > lv[band]) band++;
        var rr = ramp(k, band / lv.length), bgc = rgb(k.bg), al = isDark() ? 0.5 : 0.42, mixv = [0, 1, 2].map(function (q) { return M.round(lerp(bgc[q], lerp(rr[0][q], rr[1][q], rr[2]), al)); });
        ox.fillStyle = 'rgb(' + mixv.join(',') + ')';
        ox.fillRect(M.floor(i * cw), M.floor(c.h - (j + 1) * ch), M.ceil(cw) + 1, M.ceil(ch) + 1);
      }
      ox.globalAlpha = 1; ox.lineWidth = 1; ox.strokeStyle = rgba(isDark() ? '#e6ece8' : '#1d2320', 0.45);
      lv.forEach(function (L) { ox.beginPath(); msq(G, L).forEach(function (s) { ox.moveTo(P.X(s[0][0]), P.Y(s[0][1])); ox.lineTo(P.X(s[1][0]), P.Y(s[1][1])); }); ox.stroke(); });
      cache.key = key; cache.G = G; cache.lv = lv;
    }
    c.ctx.drawImage(cache.cv, 0, 0, c.w, c.h);
    return cache;
  }
  function fieldArrows(c, P, Fx, Fy, o) { // arrows on a grid, length normalized, color by strength
    o = o || {}; var k = V.colors(), ctx = c.ctx, n = o.n || M.max(10, M.min(22, M.round(c.w / 38))), cell = c.w / n, sy = (P.Y(0) - P.Y(1)) / P.unit, mags = [], pts = [];
    for (var px = cell / 2; px < c.w; px += cell) for (var py = cell / 2; py < c.h; py += cell) { var x = P.x(px), y = P.y(py), a = Fx(x, y), b = Fy(x, y), m = M.hypot(a, b); if (isFinite(m)) { pts.push([x, y, a, b * sy, m]); mags.push(m); } }
    var mx = M.max.apply(null, mags.concat([1e-9])), L = cell * 0.42;
    pts.forEach(function (p) {
      if (p[4] < 1e-12) { ctx.fillStyle = rgba(k.muted, 0.6); ctx.beginPath(); ctx.arc(P.X(p[0]), P.Y(p[1]), 1.5, 0, TAU); ctx.fill(); return; }
      var s = o.scale ? p[4] / mx : 0.55 + 0.45 * p[4] / mx, ml = M.hypot(p[2], p[3]) || 1, ux = p[2] / ml, uy = p[3] / ml, X = P.X(p[0]), Y = P.Y(p[1]);
      arrowPx(ctx, X - ux * L * s, Y + uy * L * s, X + ux * L * s, Y - uy * L * s, o.color || rgba(rampRGBhex(k, p[4] / mx), o.alpha || 0.85), 1.4, 6);
    });
  }
  function rampRGBhex(k, t) { var r = ramp(k, t), a = r[0], b = r[1], u = r[2]; return '#' + [0, 1, 2].map(function (i) { return ('0' + M.round(lerp(a[i], b[i], u)).toString(16)).slice(-2); }).join(''); }
  var FIELDS = { rotation: ['-y', 'x', 'Rotation ⟨−y, x⟩'], source: ['x', 'y', 'Source ⟨x, y⟩'], sink: ['-x', '-y', 'Sink ⟨−x, −y⟩'], shear: ['y', '0', 'Shear ⟨y, 0⟩'], saddle: ['x', '-y', 'Saddle ⟨x, −y⟩'], whirl: ['-y+x/4', 'x+y/4', 'Spiral out'], wave: ['1', 'sin(x)', 'Wave ⟨1, sin x⟩'] };

  /* vectors2d: vectors as arrows: add (tip to tail), subtract, scale, dot product and projection, components.
     opts:
       u: [3, 1], v: [1, 2]         the vectors (drag their tips; they snap to snap)
       op: "add"                    "add", "sub", "scale", "dot", "comp"
       ops: ["add", "sub", "scale", "dot", "comp"]   the choices offered
       c: 2                          the scalar for "scale" (slider −3 … 3)
       snap: 0.5, range: 6          grid snapping and half-width of the view
       target: [4, 3]               with task: make the result equal this vector */
  R('vectors2d', function (el, o) {
    o = opt(o, { u: [3, 1], v: [1, 2], op: 'add', ops: ['add', 'sub', 'scale', 'dot', 'comp'], c: 2, snap: 0.5, range: 6 });
    var u = [nv(o.u[0], 3), nv(o.u[1], 1)], v = [nv(o.v[0], 1), nv(o.v[1], 2)], S = { op: o.op, c: nv(o.c, 2) }, rg = nv(o.range, 6);
    var F = frame(el, o, 'Vectors in the plane'), c = F.canvas({ aspect: 1.35, max: 500 }), P = V.plane(c, { xmin: -rg, xmax: rg, ymin: -rg, ymax: rg, equal: true });
    var one = function () { return S.op === 'scale' || S.op === 'comp'; };
    var H = handles(c, P, [{ get: function () { return u; }, set: function (x, y) { u = [x, y]; } }, { get: function () { return v; }, set: function (x, y) { v = [x, y]; }, off: one }], { snap: o.snap, change: draw });
    c.cv.setAttribute('aria-label', 'Vectors u and v. Arrow keys move the tip of u; Enter switches to v.');
    var names = { add: 'u + v', sub: 'u − v', scale: 'c·u', dot: 'u · v', comp: 'components' };
    if (o.ops.length > 1) V.seg(F.ctl, { label: 'Operation', items: o.ops.map(function (q) { return [q, names[q]]; }), value: S.op, change: function (q) { S.op = q; crow.hidden = q !== 'scale'; draw(); } });
    var crow = F.row(); V.slider(crow, { label: 'scalar c', min: -3, max: 3, step: 0.25, value: S.c, input: function (q) { S.c = q; draw(); } }); crow.hidden = S.op !== 'scale';
    function vs(a) { return '⟨' + fm(a[0], 3) + ', ' + fm(a[1], 3) + '⟩'; }
    function arr(a, b, col, name, w, dash) { var k = V.colors(); P.arrow(a[0], a[1], b[0], b[1], { color: col, width: w || 3.2, dash: dash, head: 12 }); if (name) label(c.ctx, name, P.X((a[0] + b[0]) / 2) + 10, P.Y((a[1] + b[1]) / 2) - 12, { color: k[col] || col, bold: true, align: 'left', clampW: c.w, clampH: c.h }); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, O = [0, 0], res = null, s = '';
      P.clear(); P.grid({ step: 1 }); P.axes({ step: rg > 8 ? 2 : 1 });
      if (S.op === 'add') { res = [u[0] + v[0], u[1] + v[1]]; arr(u, res, rgba(k.red, 0.7), '', 2.4, [6, 4]); arr(v, res, rgba(k.blue, 0.7), '', 2.4, [6, 4]); arr(O, u, 'blue', 'u'); arr(O, v, 'red', 'v'); arr(O, res, 'purple', 'u + v');
        s = 'u + v = ' + vs(u) + ' + ' + vs(v) + ' = <b>' + vs(res) + '</b>. Put v’s tail at u’s tip (dashed): the sum goes from the start to the end. Both orders give the same diagonal of the parallelogram.'; }
      else if (S.op === 'sub') { res = [u[0] - v[0], u[1] - v[1]]; arr(v, u, rgba(k.purple, 0.75), '', 2.4, [6, 4]); arr(O, u, 'blue', 'u'); arr(O, v, 'red', 'v'); arr(O, res, 'purple', 'u − v');
        s = 'u − v = ' + vs(u) + ' − ' + vs(v) + ' = <b>' + vs(res) + '</b>. It is the arrow from the tip of v to the tip of u (dashed), moved to the origin: v + (u − v) = u.'; }
      else if (S.op === 'scale') { res = [S.c * u[0], S.c * u[1]]; P.plot(function (x) { return M.abs(u[0]) < 1e-12 ? NaN : u[1] / u[0] * x; }, { color: 'muted', width: 1, dash: [4, 5] }); arr(O, res, 'purple', fm(S.c) + 'u', 5); arr(O, u, 'blue', 'u');
        s = fm(S.c) + 'u = ' + fm(S.c) + '·' + vs(u) + ' = <b>' + vs(res) + '</b>. Length × |' + fm(S.c) + '| = ' + fm(M.hypot(res[0], res[1]), 3) + (S.c < 0 ? '; a negative scalar flips the direction.' : S.c === 0 ? '; times 0 is the zero vector.' : '; same direction.'); }
      else if (S.op === 'dot') {
        var d = u[0] * v[0] + u[1] * v[1], lu = M.hypot(u[0], u[1]), lv = M.hypot(v[0], v[1]), th = lu && lv ? M.acos(clamp(d / lu / lv, -1, 1)) : 0, pr = lv ? [d / lv / lv * v[0], d / lv / lv * v[1]] : [0, 0];
        P.plot(function (x) { return M.abs(v[0]) < 1e-12 ? NaN : v[1] / v[0] * x; }, { color: 'muted', width: 1, dash: [4, 5] });
        if (M.abs(v[0]) < 1e-12) P.seg(0, -rg * 2, 0, rg * 2, { color: 'muted', width: 1, dash: [4, 5] });
        P.seg(u[0], u[1], pr[0], pr[1], { color: 'gold', width: 1.6, dash: [4, 4] }); arr(O, pr, 'gold', '', 5);
        var a1 = M.atan2(u[1], u[0]), a2 = M.atan2(v[1], v[0]); ctx.save(); ctx.strokeStyle = k.green; ctx.lineWidth = 2; ctx.beginPath(); var da = ((a2 - a1 + 3 * PI) % TAU) - PI; ctx.arc(P.X(0), P.Y(0), 26, -a1, -(a1 + da), da > 0); ctx.stroke(); ctx.restore();
        arr(O, u, 'blue', 'u'); arr(O, v, 'red', 'v');
        s = 'u · v = (' + fm(u[0]) + ')(' + fm(v[0]) + ') + (' + fm(u[1]) + ')(' + fm(v[1]) + ') = <b>' + fm(d, 3) + '</b> = |u||v| cos θ = ' + fm(lu, 3) + ' · ' + fm(lv, 3) + ' · cos ' + fm(th * 180 / PI, 1) + '°. ' + (M.abs(d) < 1e-9 ? 'Zero: u and v are perpendicular.' : d > 0 ? 'Positive: the angle is less than 90°.' : 'Negative: the angle is more than 90°.') + ' The gold arrow is the projection of u onto v: ' + vs(pr) + '.';
        res = [d, 0];
      } else {
        P.seg(u[0], 0, u[0], u[1], { color: 'red', width: 3 }); P.seg(0, 0, u[0], 0, { color: 'green', width: 3 }); arr(O, u, 'blue', 'u');
        var Lu = M.hypot(u[0], u[1]), ang = M.atan2(u[1], u[0]) * 180 / PI; if (ang < 0) ang += 360;
        s = 'u = ' + vs(u) + ': <span class="mla-g">' + fm(u[0]) + ' across</span> and <span class="mla-r">' + fm(u[1]) + ' up</span>. Length |u| = √(' + fm(u[0]) + '² + ' + fm(u[1]) + '²) = ' + (surd(u[0] * u[0] + u[1] * u[1]) || fm(Lu, 3)) + (surd(u[0] * u[0] + u[1] * u[1]) && surd(u[0] * u[0] + u[1] * u[1]).indexOf('√') >= 0 ? ' ≈ ' + fm(Lu, 3) : '') + '. Direction ' + fm(ang, 1) + '° from the positive <i>x</i>-axis.' + (Lu ? ' Unit vector: ' + vs([u[0] / Lu, u[1] / Lu]) + '.' : '');
        res = u;
      }
      knob(ctx, P.X(u[0]), P.Y(u[1]), k.blue, 6); if (!one()) knob(ctx, P.X(v[0]), P.Y(v[1]), k.red, 6);
      H.draw(ctx); F.out.set(s);
      if (o.target && res) F.done(M.abs(res[0] - nv(o.target[0], 0)) < 1e-9 && M.abs(res[1] - nv(o.target[1], 0)) < 1e-9);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  function vecInputs(parent, name, vec, n, change, col) { // ⟨ □, □, □ ⟩ number boxes
    var w = mk('div', 'mla-vec'); w.appendChild(mk('span', 'mla-vl', name)); if (col) w.firstChild.style.color = col;
    var ins = []; for (var i = 0; i < n; i++) (function (i) { ins.push(numIn(w, { label: ['x', 'y', 'z'][i], value: vec[i], step: 0.5, aria: name + ' ' + ['x', 'y', 'z'][i] + ' component', change: function (v) { vec[i] = v; change(); } })); })(i);
    parent.appendChild(w); return ins;
  }

  /* vectors3d: vectors in space you can turn: sum, cross product (with its parallelogram) and dot product.
     opts:
       u: [2, 1, 0], v: [0, 2, 1]   the vectors (edit their components in the boxes)
       op: "cross"                  "sum", "cross", "dot" (all three are offered unless ops is given)
       ops: ["sum", "cross", "dot"]
       range: 3                      half-length of the axes
       yaw, pitch                    starting view (radians) */
  R('vectors3d', function (el, o) {
    o = opt(o, { u: [2, 1, 0], v: [0, 2, 1], op: 'cross', ops: ['sum', 'cross', 'dot'], range: 3 });
    var u = o.u.map(function (x) { return nv(x, 0); }), v = o.v.map(function (x) { return nv(x, 0); }), S = { op: o.op }, rg = nv(o.range, 3);
    var F = frame(el, o, 'Vectors in three dimensions'), c = F.canvas({ aspect: 1.3, max: 500, min: 320 });
    var C3 = cam3(c, { r: rg * 1.25, change: draw, yaw: o.yaw, pitch: o.pitch });
    function pn(x) { return x < 0 ? '(' + fm(x) + ')' : fm(x); }
    c.cv.setAttribute('aria-label', 'Three-dimensional vectors. Drag or use the arrow keys to turn the view.');
    var names = { sum: 'u + v', cross: 'u × v', dot: 'u · v' };
    if (o.ops.length > 1) V.seg(F.ctl, { label: 'Operation', items: o.ops.map(function (q) { return [q, names[q]]; }), value: S.op, change: function (q) { S.op = q; draw(); } });
    var row = F.row(); vecInputs(row, 'u', u, 3, draw, null); vecInputs(row, 'v', v, 3, draw, null);
    function draw() {
      var k = V.colors(), ctx = c.ctx, O = [0, 0, 0], s = '', ext = [rg, len(u), len(v), S.op === 'cross' ? len(cross(u, v)) : 0, S.op === 'sum' ? len([u[0] + v[0], u[1] + v[1], u[2] + v[2]]) : 0];
      C3.r = M.max.apply(null, ext) * 1.2; C3.calc();
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; for (var g = -rg; g <= rg; g++) { var a = C3.p(g, -rg, 0), b = C3.p(g, rg, 0), a2 = C3.p(-rg, g, 0), b2 = C3.p(rg, g, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke(); } ctx.restore();
      C3.axes(ctx, rg * 1.1);
      function drop(p, col) { if (M.abs(p[2]) > 1e-9) C3.line(ctx, [p, [p[0], p[1], 0]], col, 1.2, [3, 3]); C3.line(ctx, [[p[0], p[1], 0], [p[0], 0, 0]], rgba(col, 0.5), 1, [2, 4]); C3.line(ctx, [[p[0], p[1], 0], [0, p[1], 0]], rgba(col, 0.5), 1, [2, 4]); }
      var items = [];
      if (S.op === 'sum') { var w = [u[0] + v[0], u[1] + v[1], u[2] + v[2]]; C3.line(ctx, [u, w], rgba(k.red, 0.7), 2, [6, 4]); C3.line(ctx, [v, w], rgba(k.blue, 0.7), 2, [6, 4]); items.push([w, k.purple, 'u + v']); s = 'u + v = ' + vstr(u, 3) + ' + ' + vstr(v, 3) + ' = <b>' + vstr(w, 3) + '</b>: add matching components, just as in the plane.'; }
      else if (S.op === 'cross') {
        var cr = cross(u, v), area = len(cr), w2 = [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
        C3.faces(ctx, [{ q: [O, u, w2, v], fill: rgba(k.gold, 0.3), stroke: rgba(k.gold, 0.8), lw: 1.5 }]);
        items.push([cr, k.purple, 'u × v']);
        s = 'u × v = ⟨' + pn(u[1]) + '·' + pn(v[2]) + ' − ' + pn(u[2]) + '·' + pn(v[1]) + ', ' + pn(u[2]) + '·' + pn(v[0]) + ' − ' + pn(u[0]) + '·' + pn(v[2]) + ', ' + pn(u[0]) + '·' + pn(v[1]) + ' − ' + pn(u[1]) + '·' + pn(v[0]) + '⟩ = <b>' + vstr(cr, 3) + '</b>. It is perpendicular to both u and v (u·(u×v) = ' + fm(dot(u, cr), 6) + '), its length ' + fm(area, 3) + ' is the area of the gold parallelogram, and it follows the right-hand rule: curl your fingers from u to v and your thumb points along u × v.';
      } else {
        var d = dot(u, v), lu = len(u), lv = len(v), th = lu && lv ? M.acos(clamp(d / lu / lv, -1, 1)) : 0, pr = lv ? v.map(function (x) { return x * d / lv / lv; }) : [0, 0, 0];
        C3.line(ctx, [u, pr], k.gold, 1.6, [4, 4]); items.push([pr, k.gold, 'proj']);
        s = 'u · v = ' + pn(u[0]) + '·' + pn(v[0]) + ' + ' + pn(u[1]) + '·' + pn(v[1]) + ' + ' + pn(u[2]) + '·' + pn(v[2]) + ' = <b>' + fm(d, 3) + '</b> = |u||v| cos θ, so θ = ' + fm(th * 180 / PI, 1) + '°. ' + (M.abs(d) < 1e-9 ? 'They are perpendicular.' : '') + ' The gold arrow is the projection of u onto v.';
      }
      items.push([u, k.blue, 'u'], [v, k.red, 'v']);
      items.forEach(function (it) { drop(it[0], it[1]); });
      items.sort(function (p, q) { return C3.depth(p[0][0], p[0][1], p[0][2]) - C3.depth(q[0][0], q[0][1], q[0][2]); }).forEach(function (it) { var q = C3.arrow(ctx, O, it[0], it[1], 3.2); label(ctx, it[2], q[0] + 10, q[1] - 12, { color: it[1], bold: true, align: 'left', clampW: c.w, clampH: c.h }); });
      F.out.set('u = ' + vstr(u, 3) + ' (length ' + fm(len(u), 3) + '), v = ' + vstr(v, 3) + ' (length ' + fm(len(v), 3) + ').<br>' + s);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  /* surface: z = f(x, y) in 3-D (drag to turn), with contour lines, a floor map and a slice.
     opts:
       f: "x^2 - y^2"               the function (params allowed)
       xmin, xmax, ymin, ymax (−2…2), zmin, zmax (default: fit)
       n: 30                         mesh cells per side (10 … 50)
       contours: 10                  about how many contour levels (0 for none)
       floor: true                   the contour map drawn on the floor under the surface
       slice: "x"                    "x", "y" or "none": a plane x = c or y = c cutting the surface, with its trace
       at: 0.5                       where the slice is
       view: "3d"                    "3d" or "map" (the contour map seen from above); both are offered
       yaw, pitch                    starting view (radians) */
  R('surface', function (el, o) {
    o = opt(o, { f: 'x^2 - y^2', xmin: -2, xmax: 2, ymin: -2, ymax: 2, n: 30, contours: 10, floor: true, slice: 'x', at: 0.5, view: '3d' });
    var Pm = {}, ps = params(o.params), f = cf(o.f, ['x', 'y'], Pm), x0 = nv(o.xmin, -2), x1 = nv(o.xmax, 2), y0 = nv(o.ymin, -2), y1 = nv(o.ymax, 2), n = clamp(o.n, 10, 50), S = { slice: o.slice, at: nv(o.at, 0.5), view: o.view }, G;
    var F = frame(el, o, '3-D graph of z = ' + o.f), c = F.canvas({ aspect: 1.25, max: 520, min: 320 });
    function grid() { G = mcells(f, x0, x1, y0, y1, n, n); if (o.zmin != null) G.zmin = nv(o.zmin, G.zmin); if (o.zmax != null) G.zmax = nv(o.zmax, G.zmax); G.lv = o.contours ? levels(G.zmin, G.zmax, o.contours) : []; G.segs = {}; G.all = G.lv.map(function (L) { var sg = msq(G, L); sg.forEach(function (q) { var key = q[2] + ',' + q[3]; (G.segs[key] = G.segs[key] || []).push([q[0], q[1], L]); }); return sg; }); }
    grid();
    var span = M.max(x1 - x0, y1 - y0), zs = function () { return span * 0.8 / (G.zmax - G.zmin || 1); }; // vertical scale so the box is not too tall
    var C3 = cam3(c, { r: span * 0.85, center: [(x0 + x1) / 2, (y0 + y1) / 2, 0], change: draw, yaw: o.yaw, pitch: o.pitch != null ? o.pitch : 0.5 });
    var P2 = V.plane(c, { xmin: x0, xmax: x1, ymin: y0, ymax: y1, equal: true });
    c.cv.setAttribute('aria-label', 'Surface z = ' + o.f + '. Drag or use the arrow keys to turn it.');
    V.seg(F.ctl, { label: 'View', items: [['3d', '3-D'], ['map', 'Contour map']], value: S.view, change: function (q) { S.view = q; draw(); } });
    V.seg(F.ctl, { label: 'Slice', items: [['none', 'No slice'], ['x', 'Slice x = c'], ['y', 'Slice y = c']], value: S.slice, change: function (q) { S.slice = q; ssl.el.hidden = q === 'none'; draw(); } });
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, function () { grid(); draw(); }); });
    var ssl = V.slider(F.ctl, { label: 'c', min: M.min(x0, y0), max: M.max(x1, y1), step: span / 80, value: S.at, input: function (q) { S.at = q; draw(); } }); ssl.el.hidden = S.slice === 'none';
    function Z(z) { return (z - (G.zmin + G.zmax) / 2) * zs(); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, lv = G.lv, dx = (x1 - x0) / n, dy = (y1 - y0) / n;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var cut = S.slice !== 'none' ? clamp(S.at, S.slice === 'x' ? x0 : y0, S.slice === 'x' ? x1 : y1) : null;
      if (S.view === 'map') {
        P2.set({}); contourMap(c, P2, f, { n: o.contours || 10, key: o.f + JSON.stringify(Pm) });
        P2.axes({ x: 'x', y: 'y' });
        if (cut != null) { if (S.slice === 'x') P2.seg(cut, y0, cut, y1, { color: 'red', width: 2.5 }); else P2.seg(x0, cut, x1, cut, { color: 'red', width: 2.5 }); }
      } else {
        var zb = Z(G.zmin) - span * 0.12;
        if (o.floor) { // floor map
          var bands = {};
          for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) { var zz = (G.z[i][j] + G.z[i + 1][j] + G.z[i][j + 1] + G.z[i + 1][j + 1]) / 4; if (!isFinite(zz)) continue; var band = 0; while (band < lv.length && zz > lv[band]) band++; (bands[band] = bands[band] || []).push([i, j]); }
          ctx.save(); ctx.globalAlpha = isDark() ? 0.5 : 0.35;
          Object.keys(bands).forEach(function (bd) { var col = rampRGB(k, bd / M.max(1, lv.length), isDark() ? 0.6 : 1); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 0.6; ctx.beginPath(); bands[bd].forEach(function (q) { var i2 = q[0], j2 = q[1], pts = [C3.p(x0 + i2 * dx, y0 + j2 * dy, zb), C3.p(x0 + (i2 + 1) * dx, y0 + j2 * dy, zb), C3.p(x0 + (i2 + 1) * dx, y0 + (j2 + 1) * dy, zb), C3.p(x0 + i2 * dx, y0 + (j2 + 1) * dy, zb)]; ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.lineTo(pts[2][0], pts[2][1]); ctx.lineTo(pts[3][0], pts[3][1]); ctx.closePath(); }); ctx.fill(); ctx.stroke(); });
          ctx.globalAlpha = 1; ctx.strokeStyle = rgba(isDark() ? '#e6ece8' : '#1d2320', 0.5); ctx.lineWidth = 1;
          G.all.forEach(function (all) { ctx.beginPath(); all.forEach(function (sg) { var p = C3.p(sg[0][0], sg[0][1], zb), q = C3.p(sg[1][0], sg[1][1], zb); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); });
          ctx.restore();
        }
        // box frame
        C3.line(ctx, [[x0, y0, zb], [x1, y0, zb], [x1, y1, zb], [x0, y1, zb], [x0, y0, zb]], rgba(k.axis, 0.6), 1);
        var segs = G.segs;
        var faces = [];
        for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
          var za = G.z[i][j], zb2 = G.z[i + 1][j], zc = G.z[i + 1][j + 1], zd = G.z[i][j + 1]; if (!(isFinite(za) && isFinite(zb2) && isFinite(zc) && isFinite(zd))) continue;
          var xa = x0 + i * dx, ya = y0 + j * dy, q = [[xa, ya, Z(za)], [xa + dx, ya, Z(zb2)], [xa + dx, ya + dy, Z(zc)], [xa, ya + dy, Z(zd)]];
          var nn = norm3(q[0], q[1], q[2]), Lt = 0.5 + 0.55 * C3.light(nn), t = ((za + zb2 + zc + zd) / 4 - G.zmin) / (G.zmax - G.zmin), cut2 = cut != null && (S.slice === 'x' ? xa + dx <= cut : ya + dy <= cut);
          faces.push({ q: q, fill: rampRGB(k, t, Lt * (isDark() ? 0.85 : 1)), stroke: rgba(isDark() ? '#000000' : '#ffffff', 0.25), lw: 0.5, cell: segs[i + ',' + j], after: function (cx, fc) { if (!fc.cell) return; cx.save(); cx.strokeStyle = rgba(isDark() ? '#ffffff' : '#1d2320', 0.6); cx.lineWidth = 1.1; cx.beginPath(); fc.cell.forEach(function (sg) { var p = C3.p(sg[0][0], sg[0][1], Z(sg[2])), p2 = C3.p(sg[1][0], sg[1][1], Z(sg[2])); cx.moveTo(p[0], p[1]); cx.lineTo(p2[0], p2[1]); }); cx.stroke(); cx.restore(); } });
        }
        if (cut != null) { // the slicing plane as translucent faces so it sorts with the surface
          var zl = Z(G.zmin) - span * 0.12, zh = Z(G.zmax) + span * 0.05, m2 = 8;
          for (i = 0; i < m2; i++) for (j = 0; j < 4; j++) { var t0 = (S.slice === 'x' ? y0 : x0) + ((S.slice === 'x' ? y1 - y0 : x1 - x0)) * i / m2, t1 = t0 + (S.slice === 'x' ? y1 - y0 : x1 - x0) / m2, h0 = zl + (zh - zl) * j / 4, h1 = h0 + (zh - zl) / 4;
            faces.push({ q: S.slice === 'x' ? [[cut, t0, h0], [cut, t1, h0], [cut, t1, h1], [cut, t0, h1]] : [[t0, cut, h0], [t1, cut, h0], [t1, cut, h1], [t0, cut, h1]], fill: rgba(k.red, 0.13), stroke: null }); }
        }
        C3.faces(ctx, faces);
        if (cut != null) { var tr = []; for (i = 0; i <= 80; i++) { var tt = (S.slice === 'x' ? y0 : x0) + (S.slice === 'x' ? y1 - y0 : x1 - x0) * i / 80, zv = S.slice === 'x' ? f(cut, tt) : f(tt, cut); if (isFinite(zv)) tr.push(S.slice === 'x' ? [cut, tt, Z(zv)] : [tt, cut, Z(zv)]); } C3.line(ctx, tr, k.red, 3.2); }
        var ax = C3.p(x1 + span * 0.1, y0, zb), ay = C3.p(x0, y1 + span * 0.1, zb), az = C3.p(x0, y0, Z(G.zmax) + span * 0.15), o0 = C3.p(x0, y0, zb);
        ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; [ax, ay, az].forEach(function (p) { ctx.beginPath(); ctx.moveTo(o0[0], o0[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); }); ctx.restore();
        txt(ctx, 'x', ax[0] + 6, ax[1], { italic: true, size: 15, color: k.ink }); txt(ctx, 'y', ay[0] + 6, ay[1], { italic: true, size: 15, color: k.ink }); txt(ctx, 'z', az[0] + 6, az[1], { italic: true, size: 15, color: k.ink });
      }
      var s = '<i>z</i> = ' + mathHTML(ps.length ? showSub(o.f, Pm) : pretty(o.f)) + ' for ' + fm(x0) + ' ≤ <i>x</i> ≤ ' + fm(x1) + ', ' + fm(y0) + ' ≤ <i>y</i> ≤ ' + fm(y1) + '. Heights from ' + fm(G.zmin, 3) + ' to ' + fm(G.zmax, 3) + '. ';
      s += S.view === 'map' ? 'Each curve is a level curve <i>f</i>(<i>x</i>, <i>y</i>) = constant: the surface sliced at one height and seen from above. Close curves mean a steep climb.' : 'The lines on the surface are level curves; the colored floor shows the same curves seen from above.';
      if (cut != null) { var sv = {}; for (var kk in Pm) sv[kk] = Pm[kk]; sv[S.slice] = cut; s += '<br><span class="mla-r">Slice ' + S.slice + ' = ' + fm(cut, 2) + '</span>: the trace is <i>z</i> = ' + mathHTML(showSub(o.f, sv)) + ', a curve in ' + (S.slice === 'x' ? '<i>y</i>' : '<i>x</i>') + ' alone.'; }
      F.out.set(s);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  /* gradient: a contour map with the gradient at a point you drag, and the directional derivative.
     opts:
       f: "x^2 + 2y^2"              the function (params allowed)
       point: [1, 0.5]              the starting point
       dir: 45                      direction of the unit vector u in degrees (slider)
       ascent: false                draw the path of steepest ascent from the point
       xmin…ymax (−3…3), levels: 12 */
  R('gradient', function (el, o) {
    o = opt(o, { f: 'x^2 + 2y^2', point: [1, 0.5], dir: 45, ascent: false, xmin: -3, xmax: 3, ymin: -3, ymax: 3, levels: 12 });
    var Pm = {}, ps = params(o.params), f = cf(o.f, ['x', 'y'], Pm), fx = cfd(o.f, 'x', ['x', 'y'], Pm), fy = cfd(o.f, 'y', ['x', 'y'], Pm), p = [nv(o.point[0], 1), nv(o.point[1], 0.5)], S = { dir: nv(o.dir, 45), asc: o.ascent };
    var F = frame(el, o, 'Gradient on a contour map'), c = F.canvas({ aspect: 1.3, max: 520 }), P = V.plane(c, win(o, [-3, 3, -3, 3, true]));
    var H = handles(c, P, [{ get: function () { return p; }, set: function (x, y) { p = [x, y]; } }], { change: draw, step: 0.1 });
    c.cv.setAttribute('aria-label', 'Contour map. Arrow keys move the point.');
    ps.forEach(function (q) { pslider(F.ctl, q, Pm, draw); });
    V.slider(F.ctl, { label: 'direction of u', min: 0, max: 360, step: 5, value: S.dir, fmt: function (v) { return v + '°'; }, input: function (v) { S.dir = v; draw(); } });
    check(F.ctl, 'Steepest-ascent path', S.asc, function (v) { S.asc = v; draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, gx = fx(p[0], p[1]), gy = fy(p[0], p[1]), gl = M.hypot(gx, gy), th = S.dir * PI / 180, ux = M.cos(th), uy = M.sin(th), Du = gx * ux + gy * uy, z0 = f(p[0], p[1]);
      P.clear(); contourMap(c, P, f, { n: o.levels, key: o.f + JSON.stringify(Pm) }); P.axes();
      // the level curve through the point
      var G = mcells(f, P.view().xmin, P.view().xmax, P.view().ymin, P.view().ymax, 80, 80); ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2.5; ctx.beginPath(); msq(G, z0).forEach(function (sg) { ctx.moveTo(P.X(sg[0][0]), P.Y(sg[0][1])); ctx.lineTo(P.X(sg[1][0]), P.Y(sg[1][1])); }); ctx.stroke(); ctx.restore();
      if (S.asc) { var q = p.slice(), path = [q.slice()]; for (var i = 0; i < 400; i++) { var a = fx(q[0], q[1]), b = fy(q[0], q[1]), m = M.hypot(a, b); if (m < 1e-6) break; q = [q[0] + a / m * 0.03, q[1] + b / m * 0.03]; path.push(q.slice()); var v = P.view(); if (q[0] < v.xmin || q[0] > v.xmax || q[1] < v.ymin || q[1] > v.ymax) break; } P.poly(path, { close: false, color: 'gold', width: 3, dash: [6, 4] }); }
      var sc = M.min(1.6, 1.6 / M.max(gl, 1e-9)) * (gl > 0 ? 1 : 0);
      if (gl > 1e-9) { P.arrow(p[0], p[1], p[0] + gx * sc, p[1] + gy * sc, { color: 'red', width: 3.5, head: 13 }); label(ctx, '∇f', P.X(p[0] + gx * sc) + 8, P.Y(p[1] + gy * sc) - 12, { color: k.red, bold: true, align: 'left', clampW: c.w, clampH: c.h }); }
      P.arrow(p[0], p[1], p[0] + ux, p[1] + uy, { color: 'blue', width: 3, head: 11 }); label(ctx, 'u', P.X(p[0] + ux) + 8, P.Y(p[1] + uy) + 12, { color: k.blue, bold: true, align: 'left', clampW: c.w, clampH: c.h });
      knob(ctx, P.X(p[0]), P.Y(p[1]), k.ink, 7); H.draw(ctx);
      var ang = gl > 1e-9 ? M.acos(clamp(Du / gl, -1, 1)) * 180 / PI : 0;
      F.out.set('At (' + fm(p[0], 2) + ', ' + fm(p[1], 2) + '): <i>f</i> = ' + fm(z0, 3) + ', <span class="mla-r">∇<i>f</i> = ⟨<i>f<sub>x</sub></i>, <i>f<sub>y</sub></i>⟩ = ⟨' + fm(gx, 3) + ', ' + fm(gy, 3) + '⟩</span>, |∇<i>f</i>| = ' + fm(gl, 3) + ' (the steepest rate of climb).<br><span class="mla-b">u</span> = ⟨' + fm(ux, 3) + ', ' + fm(uy, 3) + '⟩: <i>D</i><sub>u</sub><i>f</i> = ∇<i>f</i> · u = <b>' + fm(Du, 3) + '</b> = |∇<i>f</i>| cos ' + fm(ang, 0) + '°. ' + (gl < 1e-6 ? 'The gradient is zero here: a flat spot (a critical point).' : M.abs(Du) < 0.02 * gl ? 'u runs along the level curve, so the height does not change: the gradient is perpendicular to level curves.' : ang < 5 ? 'u points along the gradient: the fastest way up.' : 'Turn u to point along ∇f for the fastest climb, or along the dark level curve for no change.'));
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* vectorfield: arrows of F = ⟨P, Q⟩ with probes for curl (a paddle wheel) and divergence (a little box).
     opts:
       P: "-y", Q: "x"              the field (params allowed); or field: "rotation" | "source" | "sink" | "shear" | "saddle" | "whirl" | "wave"
       presets: true                 offer the named fields as buttons
       probe: "curl"                 "curl", "div" or "both"
       at: [1, 1]                    where the probe starts (drag it)
       particles: false              start with moving particles that follow the field (a button toggles them)
       xmin…ymax (−3…3) */
  R('vectorfield', function (el, o) {
    var pre = o.field && FIELDS[o.field];
    o = opt(o, { P: pre ? pre[0] : '-y', Q: pre ? pre[1] : 'x', presets: true, probe: 'curl', at: [1, 1], particles: false, xmin: -3, xmax: 3, ymin: -3, ymax: 3 });
    var Pm = {}, ps = params(o.params), S = { P: o.P, Q: o.Q, probe: o.probe, ang: 0, flow: o.particles }, at = [nv(o.at[0], 1), nv(o.at[1], 1)], Fx, Fy, Px, Py, Qx, Qy, parts = [], loopH = null;
    function compile() { Fx = cf(S.P, ['x', 'y'], Pm); Fy = cf(S.Q, ['x', 'y'], Pm); Px = cfd(S.P, 'x', ['x', 'y'], Pm); Py = cfd(S.P, 'y', ['x', 'y'], Pm); Qx = cfd(S.Q, 'x', ['x', 'y'], Pm); Qy = cfd(S.Q, 'y', ['x', 'y'], Pm); if (c && c._cmap) c._cmap.key = null; }
    var F = frame(el, o, 'Vector field with curl and divergence probes'), c = F.canvas({ aspect: 1.3, max: 520 }), P = V.plane(c, win(o, [-3, 3, -3, 3, true]));
    compile();
    var H = handles(c, P, [{ get: function () { return at; }, set: function (x, y) { at = [x, y]; } }], { change: draw, step: 0.1, r: 30 });
    c.cv.setAttribute('aria-label', 'Vector field. Arrow keys move the probe.');
    if (o.presets) V.seg(F.ctl, { label: 'Field', items: Object.keys(FIELDS).map(function (q) { return [q, FIELDS[q][2]]; }), value: o.field || '', change: function (q) { S.P = FIELDS[q][0]; S.Q = FIELDS[q][1]; compile(); draw(); } });
    var row = F.row(); V.seg(row, { label: 'Probe', items: [['curl', 'Curl (paddle wheel)'], ['div', 'Divergence (box)'], ['both', 'Both']], value: S.probe, change: function (q) { S.probe = q; draw(); } });
    var fb = V.button(row, S.flow ? '❚❚ Stop the flow' : '▶ Show the flow', function () { S.flow = !S.flow; fb.textContent = S.flow ? '❚❚ Stop the flow' : '▶ Show the flow'; if (S.flow) seed(); draw(); });
    ps.forEach(function (q) { pslider(F.ctl, q, Pm, draw); });
    function seed() { var v = P.view(), r = rng(7); parts = []; for (var i = 0; i < 160; i++) parts.push([v.xmin + r() * (v.xmax - v.xmin), v.ymin + r() * (v.ymax - v.ymin), r() * 3]); }
    if (S.flow) seed();
    loopH = V.loop(el, function (dt) {
      var curl = Qx(at[0], at[1]) - Py(at[0], at[1]), moving = S.flow || ((S.probe !== 'div') && M.abs(curl) > 1e-6 && !V.reduced);
      if (!moving) return;
      S.ang += curl / 2 * dt * 1.2;
      if (S.flow) { var v = P.view(), r = M.random; parts.forEach(function (q) { var a = Fx(q[0], q[1]), b = Fy(q[0], q[1]), m = M.hypot(a, b) || 1, sp = V.reduced ? 0 : dt * 0.6 * (v.xmax - v.xmin) / 6; q[0] += a / M.max(m, 1) * sp; q[1] += b / M.max(m, 1) * sp; q[2] -= dt; if (q[2] < 0 || q[0] < v.xmin || q[0] > v.xmax || q[1] < v.ymin || q[1] > v.ymax || !isFinite(q[0])) { q[0] = v.xmin + r() * (v.xmax - v.xmin); q[1] = v.ymin + r() * (v.ymax - v.ymin); q[2] = 1 + r() * 3; } }); }
      draw();
    });
    function draw() {
      var k = V.colors(), ctx = c.ctx, x = at[0], y = at[1], cu = Qx(x, y) - Py(x, y), dv = Px(x, y) + Qy(x, y), Lb = 0.45;
      P.clear(); P.grid({ minor: false }); P.axes();
      fieldArrows(c, P, Fx, Fy, {});
      if (S.flow) { ctx.save(); ctx.fillStyle = k.ink; parts.forEach(function (q) { ctx.globalAlpha = clamp(q[2], 0, 1) * 0.8; ctx.beginPath(); ctx.arc(P.X(q[0]), P.Y(q[1]), 2.2, 0, TAU); ctx.fill(); }); ctx.restore(); }
      var X = P.X(x), Y = P.Y(y), r = M.max(18, 0.4 * P.unit);
      if (S.probe !== 'curl') { // the box
        var hw = Lb * P.unit / 2 * 1.4, sides = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        ctx.save(); ctx.fillStyle = dv > 1e-6 ? rgba(k.green, 0.2) : dv < -1e-6 ? rgba(k.red, 0.2) : rgba(k.muted, 0.15); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.fillRect(X - hw, Y - hw, 2 * hw, 2 * hw); ctx.strokeRect(X - hw, Y - hw, 2 * hw, 2 * hw); ctx.restore();
        sides.forEach(function (n2) {
          var hm = hw / P.unit, mx = x + n2[0] * hm, my = y + n2[1] * hm, fn = Fx(mx, my) * n2[0] + Fy(mx, my) * n2[1]; if (M.abs(fn) < 1e-3) return;
          var L = M.min(2, M.abs(fn)) * 11 + 7, sx = X + n2[0] * hw, sy = Y - n2[1] * hw, ox = sx + n2[0] * L, oy = sy - n2[1] * L;
          if (fn > 0) arrowPx(ctx, sx, sy, ox, oy, k.green, 2.5, 8); else arrowPx(ctx, ox, oy, sx, sy, k.red, 2.5, 8);
        });
      }
      if (S.probe !== 'div') { // the paddle wheel
        ctx.save(); ctx.translate(X, Y); ctx.rotate(-S.ang); ctx.strokeStyle = k.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (var i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * M.cos(i * PI / 2), r * M.sin(i * PI / 2)); ctx.stroke(); ctx.fillStyle = k.gold; ctx.fillRect(r * M.cos(i * PI / 2) - 4, r * M.sin(i * PI / 2) - 4, 8, 8); }
        ctx.restore();
        if (M.abs(cu) > 1e-6) { // a curved arrow around the wheel: counterclockwise for positive curl
          var ccw = cu > 0, rr = r + 10, sa = ccw ? -0.2 : 0.2, ea = ccw ? -1.7 : 1.7, pa = ccw ? ea + 0.3 : ea - 0.3, col2 = ccw ? k.green : k.red;
          ctx.save(); ctx.strokeStyle = col2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X, Y, rr, sa, pa, ccw); ctx.stroke(); ctx.restore();
          arrowPx(ctx, X + rr * M.cos(pa), Y + rr * M.sin(pa), X + rr * M.cos(ea), Y + rr * M.sin(ea), col2, 2.5, 9);
        }
        ctx.fillStyle = k.ink; ctx.beginPath(); ctx.arc(X, Y, 5, 0, TAU); ctx.fill();
      } else knob(ctx, X, Y, k.ink, 6);
      H.draw(ctx);
      var s = '<b>F</b> = ⟨' + mathHTML(pretty(S.P)) + ', ' + mathHTML(pretty(S.Q)) + '⟩. At (' + fm(x, 2) + ', ' + fm(y, 2) + '): <b>F</b> = ⟨' + fm(Fx(x, y), 3) + ', ' + fm(Fy(x, y), 3) + '⟩.';
      if (S.probe !== 'div') s += '<br>curl = ∂<i>Q</i>/∂<i>x</i> − ∂<i>P</i>/∂<i>y</i> = ' + fm(Qx(x, y), 3) + ' − ' + fm(Py(x, y), 3).replace(/^−/, '(−') + (Py(x, y) < 0 ? ')' : '') + ' = <b>' + fm(cu, 3) + '</b>: ' + (M.abs(cu) < 1e-6 ? 'the wheel does not spin.' : 'the wheel spins ' + (cu > 0 ? 'counterclockwise' : 'clockwise') + '.');
      if (S.probe !== 'curl') s += '<br>div = ∂<i>P</i>/∂<i>x</i> + ∂<i>Q</i>/∂<i>y</i> = ' + fm(Px(x, y), 3) + ' + ' + fm(Qy(x, y), 3).replace(/^−/, '(−') + (Qy(x, y) < 0 ? ')' : '') + ' = <b>' + fm(dv, 3) + '</b>: ' + (M.abs(dv) < 1e-6 ? 'as much flows into the box as out.' : dv > 0 ? 'more flows out of the box than in (a source).' : 'more flows into the box than out (a sink).');
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    return { draw: draw, destroy: function () { loopH.stop(); } };
  });

  /* lineintegral: a particle moves along a curve through a force field, adding up the work ∫ F · dr.
     opts:
       P: "-y", Q: "x"              the field (or field: a name as in vectorfield)
       x: "cos(t)", y: "sin(t)"     the curve r(t) (or curve: "circle" | "line" | "parabola" | "figure8")
       t0: 0, t1: "2pi"             the parameter interval; t: starting t
       xmin…ymax (−3…3) */
  var CURVES = { circle: ['cos(t)', 'sin(t)', 0, 'pi*2'], line: ['-2+4t', '-1+2t', 0, 1], parabola: ['t', 't^2-1', -1.5, 1.5], figure8: ['2sin(t)', 'sin(2t)', 0, 'pi*2'] };
  R('lineintegral', function (el, o) {
    var pre = o.field && FIELDS[o.field], cu = o.curve && CURVES[o.curve];
    o = opt(o, { P: pre ? pre[0] : '-y', Q: pre ? pre[1] : 'x', x: cu ? cu[0] : 'cos(t)', y: cu ? cu[1] : 'sin(t)', t0: cu ? cu[2] : 0, t1: cu ? cu[3] : 'pi*2', xmin: -3, xmax: 3, ymin: -3, ymax: 3 });
    var Pm = {}, Fx = cf(o.P, ['x', 'y'], Pm), Fy = cf(o.Q, ['x', 'y'], Pm), X = cf(o.x, ['t'], Pm), Y = cf(o.y, ['t'], Pm), dX = cfd(o.x, 't', ['t'], Pm), dY = cfd(o.y, 't', ['t'], Pm), t0 = nv(o.t0, 0), t1 = nv(o.t1, TAU), S = { t: o.t != null ? nv(o.t, t0) : t0 + (t1 - t0) * 0.35 }, anim = null;
    var Py = cfd(o.P, 'y', ['x', 'y'], Pm), Qx = cfd(o.Q, 'x', ['x', 'y'], Pm);
    function integrand(t) { var x = X(t), y = Y(t); return Fx(x, y) * dX(t) + Fy(x, y) * dY(t); }
    var N = 400, Wc = new Float64Array(N + 1); for (var i = 1; i <= N; i++) Wc[i] = Wc[i - 1] + gauss(integrand, t0 + (t1 - t0) * (i - 1) / N, t0 + (t1 - t0) * i / N, 1);
    function Wt(t) { var u = (t - t0) / (t1 - t0) * N, j = clamp(M.floor(u), 0, N - 1), fct = u - j; return Wc[j] + (Wc[j + 1] - Wc[j]) * fct; }
    var cons = true; for (i = 0; i < 49; i++) { var sx = -2.7 + 5.4 * (i % 7) / 6, sy = -2.7 + 5.4 * M.floor(i / 7) / 6; if (M.abs(Qx(sx, sy) - Py(sx, sy)) > 1e-6) cons = false; }
    var F = frame(el, o, 'Work along a curve through a vector field'), c = F.canvas({ aspect: 1.3, max: 500 }), P = V.plane(c, win(o, [-3, 3, -3, 3, true]));
    var c2 = V.canvas(F.box, { height: 110 }); c2.cv.style.marginTop = '6px'; c2.cv.setAttribute('aria-hidden', 'true'); scrollOK(c2);
    var ts = V.slider(F.ctl, { label: 't', min: t0, max: t1, step: (t1 - t0) / 400, value: S.t, fmt: function (v) { return pf(v, 2); }, input: function (v) { S.t = v; draw(); } });
    var pb = V.button(F.ctl, '▶ Move along', function () {
      if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Move along'; return; }
      if (S.t >= t1 - 1e-9) S.t = t0; pb.textContent = '❚❚ Pause'; var acc = 0;
      anim = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.5) return; acc = 0; S.t += (t1 - t0) / 16; } else S.t += dt * (t1 - t0) / 6; S.t = M.min(t1, S.t); ts.set(S.t); draw(); if (S.t >= t1) { anim.stop(); anim = null; pb.textContent = '▶ Move along'; } });
    });
    V.drag(c.cv, { hit: function (px, py) { return M.hypot(px - P.X(X(S.t)), py - P.Y(Y(S.t))) < 30 ? 1 : null; }, move: function (h, px, py) { var best = S.t, bd = 1e9; for (var j = 0; j <= 400; j++) { var t = t0 + (t1 - t0) * j / 400, d = M.hypot(P.X(X(t)) - px, P.Y(Y(t)) - py) + M.abs(t - S.t) * 2; if (d < bd) { bd = d; best = t; } } S.t = best; ts.set(S.t); draw(); } });
    c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Curve in a vector field. Left and right arrow keys move the particle.');
    c.cv.addEventListener('keydown', function (e) { var d = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[e.key]; if (!d) return; S.t = clamp(S.t + d * (t1 - t0) / 60, t0, t1); ts.set(S.t); draw(); e.preventDefault(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, gh = c2.h, top = 0;
      P.clear(); P.grid({ minor: false }); P.axes();
      fieldArrows(c, P, Fx, Fy, { alpha: 0.45 });
      var paths = {}; for (var j = 0; j < 300; j++) { var ta = t0 + (t1 - t0) * j / 300, tb = t0 + (t1 - t0) * (j + 1) / 300, w = integrand((ta + tb) / 2), key = (w > 1e-9 ? 'green' : w < -1e-9 ? 'red' : 'muted') + (tb <= S.t ? '5' : '2.5'); (paths[key] = paths[key] || []).push([X(ta), Y(ta), X(tb), Y(tb)]); }
      ctx.save(); ctx.lineCap = 'round'; Object.keys(paths).forEach(function (key) { ctx.strokeStyle = k[key.replace(/[\d.]+$/, '')]; ctx.lineWidth = +key.replace(/^[a-z]+/, ''); ctx.beginPath(); paths[key].forEach(function (q) { ctx.moveTo(P.X(q[0]), P.Y(q[1])); ctx.lineTo(P.X(q[2]), P.Y(q[3])); }); ctx.stroke(); }); ctx.restore();
      var x = X(S.t), y = Y(S.t), vx = dX(S.t), vy = dY(S.t), vl = M.hypot(vx, vy) || 1, fxv = Fx(x, y), fyv = Fy(x, y), ft = (fxv * vx + fyv * vy) / vl;
      P.arrow(x, y, x + fxv * 0.5, y + fyv * 0.5, { color: 'purple', width: 3, head: 10 });
      P.arrow(x, y, x + vx / vl * 0.9, y + vy / vl * 0.9, { color: 'blue', width: 3, head: 10 });
      if (M.abs(ft) > 1e-6) P.seg(x, y, x + vx / vl * ft * 0.5, y + vy / vl * ft * 0.5, { color: ft > 0 ? 'green' : 'red', width: 7 });
      knob(ctx, P.X(x), P.Y(y), k.ink, 7);
      label(ctx, 'F', P.X(x + fxv * 0.5) + 8, P.Y(y + fyv * 0.5) - 10, { color: k.purple, bold: true, align: 'left', clampW: c.w, clampH: c.h });
      // work strip
      ctx = c2.ctx; ctx.save(); ctx.fillStyle = k.bg; ctx.fillRect(0, top, c2.w, gh); ctx.strokeStyle = k.grid; ctx.beginPath(); ctx.moveTo(0, top + 0.5); ctx.lineTo(c.w, top + 0.5); ctx.stroke();
      var lo = 0, hi = 0; for (j = 0; j <= N; j++) { lo = M.min(lo, Wc[j]); hi = M.max(hi, Wc[j]); } var pad = (hi - lo) * 0.15 || 1, GX = function (t) { return 40 + (c2.w - 56) * (t - t0) / (t1 - t0); }, GY = function (v) { return top + 18 + (gh - 30) * (hi + pad - v) / (hi - lo + 2 * pad); };
      ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(40, GY(0)); ctx.lineTo(c2.w - 12, GY(0)); ctx.stroke();
      ctx.strokeStyle = rgba(k.purple, 0.3); ctx.lineWidth = 1.5; ctx.beginPath(); for (j = 0; j <= N; j++) { var tt = t0 + (t1 - t0) * j / N; if (j) ctx.lineTo(GX(tt), GY(Wc[j])); else ctx.moveTo(GX(tt), GY(Wc[j])); } ctx.stroke();
      ctx.strokeStyle = k.purple; ctx.lineWidth = 2.5; ctx.beginPath(); for (j = 0; j <= N; j++) { tt = t0 + (t1 - t0) * j / N; if (tt > S.t) break; if (j) ctx.lineTo(GX(tt), GY(Wc[j])); else ctx.moveTo(GX(tt), GY(Wc[j])); } ctx.stroke(); ctx.restore();
      txt(ctx, 'work so far W(t)', 8, top + 10, { size: 11, color: k.ink }); txt(ctx, '0', 34, GY(0), { align: 'right', size: 10 });
      knob(ctx, GX(S.t), GY(Wt(S.t)), k.purple, 5);
      var Wtot = Wc[N];
      F.out.set('<span class="mla-b">Direction of motion</span>, <span style="color:' + k.purple + ';font-weight:700">force F</span> = ⟨' + fm(fxv, 2) + ', ' + fm(fyv, 2) + '⟩. Along the path the force component is ' + fm(ft, 3) + ' (<span class="mla-g">green: helps</span>, <span class="mla-r">red: resists</span>).<br>Work so far ∫ <b>F</b> · d<b>r</b> = ' + fm(Wt(S.t), 4) + '; the whole curve: <b>' + (ratio(Wtot / PI, 12) && M.abs(Wtot) > 1e-9 ? pf(Wtot) + ' ≈ ' : '') + fm(Wtot, 4) + '</b>.' + (cons ? ' This field has zero curl everywhere (it is conservative), so the work depends only on the start and end points.' : ''));
    }
    redrawOn(c, draw); c2.onResize(draw); draw();
    return { draw: draw, work: function () { return Wc[N]; } };
  });

  function gauss2(f, u0, u1, v0, v1, nu, nv) { return gauss(function (u) { return gauss(function (v) { return f(u, v); }, v0, v1, nv); }, u0, u1, nu); }
  /* parametrized surfaces for flux: p(u, v) -> point, n(u, v) -> r_u × r_v (oriented outward or up) */
  function fluxSurface(kind, Rr, Hh, tilt, hz) {
    var ca = M.cos(tilt), sa = -M.sin(tilt), rot = function (q) { return [q[0], q[1] * ca - q[2] * sa, q[1] * sa + q[2] * ca + hz]; }, rotn = function (q) { return [q[0], q[1] * ca - q[2] * sa, q[1] * sa + q[2] * ca]; };
    switch (kind) {
      case 'square': return { u: [-Rr, Rr], v: [-Rr, Rr], closed: false, p: function (u, v) { return rot([u, v, 0]); }, n: function () { return rotn([0, 0, 1]); } };
      case 'sphere': case 'hemisphere': return { u: [0, kind === 'sphere' ? PI : PI / 2], v: [0, TAU], closed: kind === 'sphere', p: function (u, v) { return [Rr * M.sin(u) * M.cos(v), Rr * M.sin(u) * M.sin(v), Rr * M.cos(u)]; }, n: function (u, v) { var s = Rr * Rr * M.sin(u); return [s * M.sin(u) * M.cos(v), s * M.sin(u) * M.sin(v), s * M.cos(u)]; } };
      case 'cylinder': return { u: [0, TAU], v: [0, Hh], closed: false, p: function (u, v) { return [Rr * M.cos(u), Rr * M.sin(u), v]; }, n: function (u) { return [Rr * M.cos(u), Rr * M.sin(u), 0]; } };
      case 'paraboloid': return { u: [0, M.sqrt(Hh)], v: [0, TAU], closed: false, p: function (u, v) { return [u * M.cos(v), u * M.sin(v), Hh - u * u]; }, n: function (u, v) { return [2 * u * u * M.cos(v), 2 * u * u * M.sin(v), u]; } };
      default: return { u: [0, Rr], v: [0, TAU], closed: false, p: function (u, v) { return rot([u * M.cos(v), u * M.sin(v), 0]); }, n: function (u) { return rotn([0, 0, u]); } };
    }
  }
  var FIELDS3 = { up: ['0', '0', '1', 'Straight up ⟨0, 0, 1⟩'], radial: ['x', 'y', 'z', 'Outward ⟨x, y, z⟩'], swirl: ['-y', 'x', '0', 'Swirl ⟨−y, x, 0⟩'], rising: ['0', '0', 'z', 'Growing ⟨0, 0, z⟩'], tilted: ['1', '0', '1', 'Slanted ⟨1, 0, 1⟩'] };

  /* flux: a field passing through a surface, colored by how much goes through each patch.
     opts:
       F: ["0", "0", "1"]           the field ⟨P, Q, R⟩ in x, y, z (or field: "up" | "radial" | "swirl" | "rising" | "tilted")
       presets: true                 offer the named fields
       surface: "disk"              "disk", "square", "sphere", "hemisphere", "cylinder", "paraboloid"
       surfaces: [ … ]              the surfaces offered (default all)
       R: 1, H: 1                    radius (half-side for the square) and height (cylinder, paraboloid)
       tilt: 0                       tilt of the disk or square in degrees (slider), h: 0 its height
       normals: false                show unit normal vectors */
  R('flux', function (el, o) {
    var pre = o.field && FIELDS3[o.field];
    o = opt(o, { F: pre ? pre.slice(0, 3) : ['0', '0', '1'], presets: true, surface: 'disk', surfaces: ['disk', 'square', 'sphere', 'hemisphere', 'cylinder', 'paraboloid'], R: 1, H: 1, tilt: 0, h: 0, normals: false });
    var Pm = {}, S = { F: o.F.slice(), kind: o.surface, R: nv(o.R, 1), H: nv(o.H, 1), tilt: nv(o.tilt, 0), nrm: o.normals }, f3, dv;
    function compile() { f3 = S.F.map(function (q) { return cf(q, ['x', 'y', 'z'], Pm); }); var d = S.F.map(function (q, i) { return cfd(q, ['x', 'y', 'z'][i], ['x', 'y', 'z'], Pm); }); dv = function (x, y, z) { return d[0](x, y, z) + d[1](x, y, z) + d[2](x, y, z); }; }
    compile();
    var F = frame(el, o, 'Flux of a vector field through a surface'), c = F.canvas({ aspect: 1.25, max: 520, min: 330 });
    var C3 = cam3(c, { r: 1.9, center: [0, 0, 0.3], change: draw, yaw: o.yaw != null ? o.yaw : -2.5, pitch: o.pitch != null ? o.pitch : 0.55 });
    c.cv.setAttribute('aria-label', 'Flux through a surface. Drag or use the arrow keys to turn the view.');
    var nm2 = { disk: 'Disk', square: 'Square', sphere: 'Sphere', hemisphere: 'Hemisphere', cylinder: 'Cylinder', paraboloid: 'Paraboloid' };
    if (o.presets) V.seg(F.ctl, { label: 'Field', items: Object.keys(FIELDS3).map(function (q) { return [q, FIELDS3[q][3]]; }), value: o.field || '', change: function (q) { S.F = FIELDS3[q].slice(0, 3); compile(); draw(); } });
    if (o.surfaces.length > 1) V.seg(F.ctl, { label: 'Surface', items: o.surfaces.map(function (q) { return [q, nm2[q]]; }), value: S.kind, change: function (q) { S.kind = q; tsl.el.hidden = !(q === 'disk' || q === 'square'); draw(); } });
    var row = F.row(), tsl = V.slider(row, { label: 'tilt', min: 0, max: 180, step: 5, value: S.tilt, fmt: function (v) { return v + '°'; }, input: function (v) { S.tilt = v; draw(); } });
    tsl.el.hidden = !(S.kind === 'disk' || S.kind === 'square');
    V.slider(row, { label: 'size R', min: 0.5, max: 1.5, step: 0.05, value: S.R, input: function (v) { S.R = v; draw(); } });
    check(row, 'Normals', S.nrm, function (v) { S.nrm = v; draw(); });
    function draw() {
      var k = V.colors(), ctx = c.ctx, sf = fluxSurface(S.kind, S.R, S.H, S.tilt * PI / 180, nv(o.h, 0)), nu = 14, nv2 = 24, faces = [], u0 = sf.u[0], u1 = sf.u[1], v0 = sf.v[0], v1 = sf.v[1];
      function Fp(q) { return [f3[0](q[0], q[1], q[2]), f3[1](q[0], q[1], q[2]), f3[2](q[0], q[1], q[2])]; }
      var key = [S.kind, S.R, S.H, S.tilt, S.F.join('|')].join(','), i, j;
      if (S.key !== key) { S.key = key; S.flux = gauss2(function (u, v) { var q = sf.p(u, v), nn = sf.n(u, v), Fv = Fp(q); return Fv[0] * nn[0] + Fv[1] * nn[1] + Fv[2] * nn[2]; }, u0, u1, v0, v1, 8, 12); S.mx = 1e-9; for (i = 0; i <= 8; i++) for (j = 0; j <= 8; j++) S.mx = M.max(S.mx, len(Fp(sf.p(u0 + (u1 - u0) * i / 8, v0 + (v1 - v0) * j / 8)))); S.vol = null; }
      var flux = S.flux, mx = S.mx;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      C3.axes(ctx, 1.9);
      for (i = 0; i < nu; i++) for (j = 0; j < nv2; j++) {
        var ua = u0 + (u1 - u0) * i / nu, ub = u0 + (u1 - u0) * (i + 1) / nu, va = v0 + (v1 - v0) * j / nv2, vb = v0 + (v1 - v0) * (j + 1) / nv2, um = (ua + ub) / 2, vm = (va + vb) / 2;
        var qd = [sf.p(ua, va), sf.p(ub, va), sf.p(ub, vb), sf.p(ua, vb)], nn = sf.n(um, vm), nl = len(nn) || 1, Fm = Fp(sf.p(um, vm)), fn = dot(Fm, nn) / nl / mx;
        var col = fn > 0.02 ? k.green : fn < -0.02 ? k.red : k.muted, a = 0.25 + 0.6 * M.min(1, M.abs(fn)), Lt = 0.75 + 0.35 * C3.light(nn);
        var face = { q: qd, fill: shadeRGB(col, Lt, a), stroke: rgba(k.ink, 0.15), lw: 0.5 };
        if (i % 2 === 1 && j % 3 === 1) face.after = (function (pc, Fv, nv3) { return function (cx) { var sc = 0.45 / mx; C3.arrow(cx, pc, [pc[0] + Fv[0] * sc, pc[1] + Fv[1] * sc, pc[2] + Fv[2] * sc], k.blue, 2); if (S.nrm) { var l3 = len(nv3) || 1; C3.arrow(cx, pc, [pc[0] + nv3[0] / l3 * 0.35, pc[1] + nv3[1] / l3 * 0.35, pc[2] + nv3[2] / l3 * 0.35], k.purple, 2); } }; })(sf.p(um, vm), Fm, nn);
        faces.push(face);
      }
      C3.faces(ctx, faces);
      var s = '<b>F</b> = ⟨' + S.F.map(function (q) { return mathHTML(pretty(q)); }).join(', ') + '⟩ through the ' + nm2[S.kind].toLowerCase() + '. <span class="mla-g">Green patches</span>: the field crosses in the direction of the normal (counts +); <span class="mla-r">red</span>: against it (counts −).<br>Flux ∬ <b>F</b> · <b>n</b> d<i>S</i> = <b>' + (ratio(flux / PI, 24) && M.abs(flux) > 1e-9 ? pf(flux).replace(/^(\d*)π\/(\d+)$/, '$1π/$2') + ' ≈ ' : '') + fm(flux, 4) + '</b>.';
      if ((S.kind === 'disk' || S.kind === 'square') && S.tilt) s += ' Tilting by ' + S.tilt + '° changes how squarely the field hits it: for a constant field the flux is multiplied by cos ' + S.tilt + '° = ' + fm(M.cos(S.tilt * PI / 180), 3) + '.';
      if (sf.closed) { var Rr = S.R, vol = S.vol != null ? S.vol : S.vol = gauss(function (r) { return gauss(function (ph) { return gauss(function (th) { return dv(r * M.sin(ph) * M.cos(th), r * M.sin(ph) * M.sin(th), r * M.cos(ph)) * r * r * M.sin(ph); }, 0, TAU, 4); }, 0, PI, 4); }, 0, Rr, 3); s += ' Divergence theorem check: ∭ div <b>F</b> d<i>V</i> over the ball = ' + fm(vol, 4) + ', the same number.'; }
      F.out.set(s);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw, flux: function () { return S.flux; } };
  });

  /* param3d: a space curve r(t) (or a parametric surface) you can turn, with a moving point and its tangent.
     opts:
       x: "cos(t)", y: "sin(t)", z: "t/4"   the curve (params allowed)
       t0: 0, t1: "4pi", t: 1              the interval and the starting t
       tangent: true, frame: false          the tangent vector r′(t); frame adds the unit normal N and binormal B
       shadow: true                         the curve’s shadow on the floor
       surface: false                       true: x, y, z are in u and v, with u0, u1, v0, v1; shows the u- and v-curves through a point
       u0, u1, v0, v1, u, v                 for surfaces
       yaw, pitch */
  R('param3d', function (el, o) {
    var surfM = !!o.surface;
    o = opt(o, surfM ? { x: '(2+cos(v))*cos(u)', y: '(2+cos(v))*sin(u)', z: 'sin(v)', u0: 0, u1: 'pi*2', v0: 0, v1: 'pi*2', u: 1, v: 1 } : { x: 'cos(t)', y: 'sin(t)', z: 't/4', t0: 0, t1: '4pi', t: 1, tangent: true, frame: false, shadow: true });
    var Pm = {}, ps = params(o.params), vars = surfM ? ['u', 'v'] : ['t'], X = cf(o.x, vars, Pm), Y = cf(o.y, vars, Pm), Z = cf(o.z, vars, Pm), S = {}, anim = null;
    var F = frame(el, o, surfM ? 'Parametric surface' : 'Space curve r(t)'), c = F.canvas({ aspect: 1.25, max: 520, min: 330 });
    var bb = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    function box() { bb = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity]; for (var i = 0; i <= 60; i++) for (var j = 0; j <= (surfM ? 60 : 0); j++) { var p = surfM ? [X(lerp(S.u0, S.u1, i / 60), lerp(S.v0, S.v1, j / 60)), Y(lerp(S.u0, S.u1, i / 60), lerp(S.v0, S.v1, j / 60)), Z(lerp(S.u0, S.u1, i / 60), lerp(S.v0, S.v1, j / 60))] : [X(lerp(S.t0, S.t1, i / 60)), Y(lerp(S.t0, S.t1, i / 60)), Z(lerp(S.t0, S.t1, i / 60))]; for (var q = 0; q < 3; q++) if (isFinite(p[q])) { bb[2 * q] = M.min(bb[2 * q], p[q]); bb[2 * q + 1] = M.max(bb[2 * q + 1], p[q]); } } }
    if (surfM) { S.u0 = nv(o.u0, 0); S.u1 = nv(o.u1, TAU); S.v0 = nv(o.v0, 0); S.v1 = nv(o.v1, TAU); S.u = nv(o.u, 1); S.v = nv(o.v, 1); } else { S.t0 = nv(o.t0, 0); S.t1 = nv(o.t1, 4 * PI); S.t = nv(o.t, 1); }
    box();
    var cen = [(bb[0] + bb[1]) / 2, (bb[2] + bb[3]) / 2, (bb[4] + bb[5]) / 2], rad = M.hypot(bb[1] - bb[0], bb[3] - bb[2], bb[5] - bb[4]) / 2 || 1;
    var C3 = cam3(c, { r: rad * 1.15, center: cen, change: draw, yaw: o.yaw, pitch: o.pitch });
    c.cv.setAttribute('aria-label', (surfM ? 'Parametric surface' : 'Space curve') + '. Drag or use the arrow keys to turn the view.');
    ps.forEach(function (p) { pslider(F.ctl, p, Pm, function () { box(); draw(); }); });
    if (surfM) { V.slider(F.ctl, { label: 'u', min: S.u0, max: S.u1, step: (S.u1 - S.u0) / 120, value: S.u, fmt: function (v) { return pf(v, 2); }, input: function (v) { S.u = v; draw(); } }); V.slider(F.ctl, { label: 'v', min: S.v0, max: S.v1, step: (S.v1 - S.v0) / 120, value: S.v, fmt: function (v) { return pf(v, 2); }, input: function (v) { S.v = v; draw(); } }); }
    else {
      var ts = V.slider(F.ctl, { label: 't', min: S.t0, max: S.t1, step: (S.t1 - S.t0) / 400, value: S.t, fmt: function (v) { return pf(v, 2); }, input: function (v) { S.t = v; draw(); } });
      var pb = V.button(F.ctl, '▶ Move along', function () {
        if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Move along'; return; }
        if (S.t >= S.t1 - 1e-9) S.t = S.t0; pb.textContent = '❚❚ Pause'; var acc = 0;
        anim = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.5) return; acc = 0; S.t += (S.t1 - S.t0) / 16; } else S.t += dt * (S.t1 - S.t0) / 8; S.t = M.min(S.t1, S.t); ts.set(S.t); draw(); if (S.t >= S.t1) { anim.stop(); anim = null; pb.textContent = '▶ Move along'; } });
      });
      var dX = cfd(o.x, 't', ['t'], Pm), dY = cfd(o.y, 't', ['t'], Pm), dZ = cfd(o.z, 't', ['t'], Pm), d2X = cfd(o.x, 't', ['t'], Pm, 2), d2Y = cfd(o.y, 't', ['t'], Pm, 2), d2Z = cfd(o.z, 't', ['t'], Pm, 2);
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, s;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h);
      var fz = bb[4] - (bb[5] - bb[4]) * 0.15 - 0.2, L = M.max(bb[1] - bb[0], bb[3] - bb[2]) / 2 + 0.3;
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; for (var g = -4; g <= 4; g++) { var a = C3.p(cen[0] + g * L / 4, cen[1] - L, fz), b = C3.p(cen[0] + g * L / 4, cen[1] + L, fz), a2 = C3.p(cen[0] - L, cen[1] + g * L / 4, fz), b2 = C3.p(cen[0] + L, cen[1] + g * L / 4, fz); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.stroke(); } ctx.restore();
      var oo = [cen[0] - L, cen[1] - L, fz], ax = C3.p(cen[0] + L * 1.15, cen[1] - L, fz), ay = C3.p(cen[0] - L, cen[1] + L * 1.15, fz), az = C3.p(oo[0], oo[1], bb[5] + 0.3), o0 = C3.p(oo[0], oo[1], oo[2]);
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.3; [ax, ay, az].forEach(function (p) { ctx.beginPath(); ctx.moveTo(o0[0], o0[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); }); ctx.restore();
      txt(ctx, 'x', ax[0] + 6, ax[1], { italic: true, size: 15, color: k.ink }); txt(ctx, 'y', ay[0] + 6, ay[1], { italic: true, size: 15, color: k.ink }); txt(ctx, 'z', az[0] + 6, az[1], { italic: true, size: 15, color: k.ink });
      if (surfM) {
        var nu = 36, nv3 = 24, faces = [];
        for (var i = 0; i < nu; i++) for (var j = 0; j < nv3; j++) {
          var ua = lerp(S.u0, S.u1, i / nu), ub = lerp(S.u0, S.u1, (i + 1) / nu), va = lerp(S.v0, S.v1, j / nv3), vb = lerp(S.v0, S.v1, (j + 1) / nv3);
          var q = [[X(ua, va), Y(ua, va), Z(ua, va)], [X(ub, va), Y(ub, va), Z(ub, va)], [X(ub, vb), Y(ub, vb), Z(ub, vb)], [X(ua, vb), Y(ua, vb), Z(ua, vb)]];
          if (q.some(function (p) { return !isFinite(p[0] + p[1] + p[2]); })) continue;
          var nn = norm3(q[0], q[1], q[2]); if (len(nn) < 1e-12) nn = norm3(q[0], q[2], q[3]);
          faces.push({ q: q, fill: rampRGB(k, (j + 0.5) / nv3, 0.55 + 0.5 * C3.light(nn)), stroke: rgba(isDark() ? '#000000' : '#ffffff', 0.3), lw: 0.5 });
        }
        C3.faces(ctx, faces);
        var uc = [], vc = []; for (i = 0; i <= 120; i++) { var tu = lerp(S.u0, S.u1, i / 120), tv = lerp(S.v0, S.v1, i / 120); uc.push([X(tu, S.v), Y(tu, S.v), Z(tu, S.v)]); vc.push([X(S.u, tv), Y(S.u, tv), Z(S.u, tv)]); }
        C3.line(ctx, uc, k.red, 3); C3.line(ctx, vc, k.blue, 3);
        var p0 = [X(S.u, S.v), Y(S.u, S.v), Z(S.u, S.v)], h = 1e-4, ru = [(X(S.u + h, S.v) - X(S.u - h, S.v)) / 2 / h, (Y(S.u + h, S.v) - Y(S.u - h, S.v)) / 2 / h, (Z(S.u + h, S.v) - Z(S.u - h, S.v)) / 2 / h], rv = [(X(S.u, S.v + h) - X(S.u, S.v - h)) / 2 / h, (Y(S.u, S.v + h) - Y(S.u, S.v - h)) / 2 / h, (Z(S.u, S.v + h) - Z(S.u, S.v - h)) / 2 / h], nrm = cross(ru, rv), nl = len(nrm) || 1;
        C3.arrow(ctx, p0, [p0[0] + nrm[0] / nl * rad * 0.35, p0[1] + nrm[1] / nl * rad * 0.35, p0[2] + nrm[2] / nl * rad * 0.35], k.purple, 3);
        C3.dot(ctx, p0, k.ink, 5.5);
        s = '<b>r</b>(<i>u</i>, <i>v</i>) = ⟨' + [o.x, o.y, o.z].map(function (q2) { return mathHTML(pretty(q2)); }).join(', ') + '⟩. At <i>u</i> = ' + pf(S.u, 2) + ', <i>v</i> = ' + pf(S.v, 2) + ': point ' + vstr(p0, 3) + '. <span class="mla-r">Red: the <i>u</i>-curve</span> (<i>v</i> held fixed); <span class="mla-b">blue: the <i>v</i>-curve</span> (<i>u</i> held fixed). The purple normal is <b>r</b><sub><i>u</i></sub> × <b>r</b><sub><i>v</i></sub>, scaled; |<b>r</b><sub><i>u</i></sub> × <b>r</b><sub><i>v</i></sub>| = ' + fm(nl, 3) + ' is how much area a small <i>u</i>-<i>v</i> square becomes.';
      } else {
        var pts = [], sh = [], t = S.t; for (i = 0; i <= 400; i++) { var tt = lerp(S.t0, S.t1, i / 400), pp = [X(tt), Y(tt), Z(tt)]; pts.push(pp); sh.push([pp[0], pp[1], fz]); }
        if (o.shadow) C3.line(ctx, sh, rgba(k.muted, 0.55), 1.5, [4, 4]);
        // draw the curve in pieces sorted by depth so it passes in front of / behind itself sensibly
        C3.line(ctx, pts, rgba(k.blue, 0.35), 2);
        var done = []; for (i = 0; i <= 400; i++) { if (lerp(S.t0, S.t1, i / 400) > t) break; done.push(pts[i]); } done.push([X(t), Y(t), Z(t)]);
        C3.line(ctx, done, k.blue, 3.2);
        var p1 = [X(t), Y(t), Z(t)], v1 = [dX(t), dY(t), dZ(t)], a1 = [d2X(t), d2Y(t), d2Z(t)], sp = len(v1), T = v1.map(function (q) { return q / (sp || 1); }), sc = rad * 0.4;
        C3.line(ctx, [p1, [p1[0], p1[1], fz]], rgba(k.muted, 0.8), 1.2, [3, 3]);
        if (o.tangent) { var q1 = C3.arrow(ctx, p1, [p1[0] + T[0] * sc, p1[1] + T[1] * sc, p1[2] + T[2] * sc], k.red, 3); label(ctx, o.frame ? 'T' : 'r′(t)', q1[0] + 8, q1[1] - 10, { color: k.red, bold: true, align: 'left', size: 12, clampW: c.w, clampH: c.h }); }
        if (o.frame) { var B = cross(v1, a1), bl = len(B) || 1; B = B.map(function (q) { return q / bl; }); var Nv = cross(B, T); var q2 = C3.arrow(ctx, p1, [p1[0] + Nv[0] * sc, p1[1] + Nv[1] * sc, p1[2] + Nv[2] * sc], k.green, 3), q3 = C3.arrow(ctx, p1, [p1[0] + B[0] * sc, p1[1] + B[1] * sc, p1[2] + B[2] * sc], k.purple, 3); label(ctx, 'N', q2[0] + 8, q2[1] - 10, { color: k.green, bold: true, align: 'left', size: 12, clampW: c.w, clampH: c.h }); label(ctx, 'B', q3[0] + 8, q3[1] - 10, { color: k.purple, bold: true, align: 'left', size: 12, clampW: c.w, clampH: c.h }); }
        C3.dot(ctx, p1, k.ink, 6);
        var arc = gauss(function (q) { return M.hypot(dX(q), dY(q), dZ(q)); }, S.t0, t, 40), kap = len(cross(v1, a1)) / M.pow(sp || 1, 3);
        s = '<b>r</b>(<i>t</i>) = ⟨' + [o.x, o.y, o.z].map(function (q2) { return mathHTML(pretty(q2)); }).join(', ') + '⟩. At <i>t</i> = ' + pf(t, 2) + ': <b>r</b> = ' + vstr(p1, 3) + ', <span class="mla-r"><b>r</b>′(<i>t</i>) = ' + vstr(v1, 3) + '</span> (it points along the curve), speed |<b>r</b>′| = ' + fm(sp, 3) + '. Distance traveled since <i>t</i> = ' + pf(S.t0, 2) + ': ' + fm(arc, 4) + '.' + (o.frame ? ' Curvature κ = |<b>r</b>′ × <b>r</b>″| / |<b>r</b>′|³ = ' + fm(kap, 4) + '.' : '');
      }
      F.out.set(s);
    }
    V.onTheme(draw); c.onResize(draw); draw();
    return { draw: draw };
  });

  function eig2(a, b, c, d) { // eigenvalues and eigenvectors of [[a, b], [c, d]]
    var tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
    if (disc < -1e-12) return { complex: true, re: tr / 2, im: M.sqrt(-disc) / 2, tr: tr, det: det, disc: disc };
    var s = M.sqrt(M.max(0, disc)), l = [(tr + s) / 2, (tr - s) / 2];
    function vec(lam) { var v = M.abs(b) > 1e-12 ? [b, lam - a] : M.abs(c) > 1e-12 ? [lam - d, c] : M.abs(lam - a) < 1e-12 ? [1, 0] : [0, 1], n = M.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; }
    var scalar = M.abs(b) < 1e-12 && M.abs(c) < 1e-12 && M.abs(a - d) < 1e-12;
    return { l: l, v: l.map(vec), tr: tr, det: det, disc: disc, scalar: scalar, repeated: M.abs(disc) < 1e-12 };
  }
  function lamStr(tr, disc) { // exact eigenvalues when the discriminant allows it
    if (M.abs(disc) < 1e-12) return fr(tr / 2, 3);
    var sq = surd(disc / 4);
    if (sq && sq.indexOf('√') < 0) return fr(tr / 2 + M.sqrt(disc) / 2, 3) + ' and ' + fr(tr / 2 - M.sqrt(disc) / 2, 3);
    return (M.abs(tr) > 1e-12 ? fr(tr / 2, 3) + ' ± ' : '±') + (sq || fm(M.sqrt(disc) / 2, 4)) + ' (≈ ' + fm(tr / 2 + M.sqrt(disc) / 2, 3) + ' and ' + fm(tr / 2 - M.sqrt(disc) / 2, 3) + ')';
  }
  function matInputs(parent, A, change, name) { // a 2×2 grid of number boxes with brackets
    var w = mk('div', 'mla-matwrap'); if (name) w.appendChild(mk('span', 'mla-ml', name + ' ='));
    var g = mk('div', 'mla-mat'), ins = []; w.appendChild(g);
    [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(function (ij) { var i = D.createElement('input'); i.type = 'number'; i.step = '0.5'; i.value = A[ij[0]][ij[1]]; i.inputMode = 'decimal'; i.setAttribute('aria-label', (name || 'Matrix') + ' row ' + (ij[0] + 1) + ' column ' + (ij[1] + 1)); i.addEventListener('input', function () { var v = parseFloat(i.value); if (isFinite(v)) { A[ij[0]][ij[1]] = v; change(); } }); g.appendChild(i); ins.push(i); });
    parent.appendChild(w);
    return { set: function (B) { ins[0].value = B[0][0]; ins[1].value = B[0][1]; ins[2].value = B[1][0]; ins[3].value = B[1][1]; } };
  }
  var MATS = { identity: [[1, 0], [0, 1], 'Identity'], stretch: [[2, 0], [0, 1], 'Stretch'], rotate: [[0, -1], [1, 0], 'Rotate 90°'], shear: [[1, 1], [0, 1], 'Shear'], reflect: [[1, 0], [0, -1], 'Reflect'], symmetric: [[2, 1], [1, 2], 'Symmetric'], project: [[1, 0], [0, 0], 'Project'], singular: [[1, 2], [0.5, 1], 'Squash'] };

  /* matrix2d: a 2×2 matrix acting on the grid, the unit square (determinant as area) and eigenvectors.
     opts:
       m: [[2, 1], [1, 2]]          the matrix (entries editable in boxes)
       presets: true                 buttons for identity, stretch, rotate, shear, reflect, symmetric, project, squash
       eigen: true                   draw the eigenvector lines (when the eigenvalues are real)
       vector: [1, 0.5]              a test vector v you drag; A·v is drawn too (null for none)
       t: 1                          the morph slider from the identity (0) to A (1)
       range: 4                      half-width of the view */
  R('matrix2d', function (el, o) {
    o = opt(o, { m: [[2, 1], [1, 2]], presets: true, eigen: true, vector: [1, 0.5], t: 1, range: 4 });
    var A = [[nv(o.m[0][0], 1), nv(o.m[0][1], 0)], [nv(o.m[1][0], 0), nv(o.m[1][1], 1)]], S = { t: nv(o.t, 1), v: o.vector ? [nv(o.vector[0], 1), nv(o.vector[1], 0.5)] : null }, rg = nv(o.range, 4), anim = null;
    var F = frame(el, o, 'A 2 by 2 matrix transforming the plane'), c = F.canvas({ aspect: 1.25, max: 520 }), P = V.plane(c, { xmin: -rg, xmax: rg, ymin: -rg, ymax: rg, equal: true });
    var H = handles(c, P, S.v ? [{ get: function () { return S.v; }, set: function (x, y) { S.v = [x, y]; } }] : [], { snap: 0.25, change: draw });
    c.cv.setAttribute('aria-label', 'Matrix transformation of the plane.' + (S.v ? ' Arrow keys move the test vector v.' : ''));
    var mi = matInputs(F.ctl, A, draw, 'A');
    var tsl = V.slider(F.ctl, { label: 'morph from I to A', min: 0, max: 1, step: 0.01, value: S.t, input: function (v) { S.t = v; draw(); } });
    var pb = V.button(F.ctl, '▶ Apply A', function () {
      if (anim) { anim.stop(); anim = null; }
      S.t = 0; tsl.set(0); var acc = 0;
      anim = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.4) return; acc = 0; S.t += 0.25; } else S.t += dt / 1.6; S.t = M.min(1, S.t); tsl.set(S.t); draw(); if (S.t >= 1) { anim.stop(); anim = null; } });
    }, 'pri');
    if (o.presets) { var pr = F.row(); V.seg(pr, { label: 'Presets', items: Object.keys(MATS).map(function (q) { return [q, MATS[q][2]]; }), value: '', change: function (q) { A[0][0] = MATS[q][0][0]; A[0][1] = MATS[q][0][1]; A[1][0] = MATS[q][1][0]; A[1][1] = MATS[q][1][1]; mi.set(A); draw(); } }); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, t = S.t, B = [[1 + (A[0][0] - 1) * t, A[0][1] * t], [A[1][0] * t, 1 + (A[1][1] - 1) * t]], ap = function (p) { return [B[0][0] * p[0] + B[0][1] * p[1], B[1][0] * p[0] + B[1][1] * p[1]]; };
      var det = A[0][0] * A[1][1] - A[0][1] * A[1][0], dt2 = B[0][0] * B[1][1] - B[0][1] * B[1][0], E = eig2(A[0][0], A[0][1], A[1][0], A[1][1]), N = M.ceil(rg * 2.5);
      P.clear(); P.grid({ step: 1, minor: false }); P.axes({ step: 1, labels: true });
      ctx.save(); ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(k.blue, 0.45);
      for (var i = -N; i <= N; i++) { var a1 = ap([i, -N]), a2 = ap([i, N]), b1 = ap([-N, i]), b2 = ap([N, i]); ctx.beginPath(); ctx.moveTo(P.X(a1[0]), P.Y(a1[1])); ctx.lineTo(P.X(a2[0]), P.Y(a2[1])); ctx.moveTo(P.X(b1[0]), P.Y(b1[1])); ctx.lineTo(P.X(b2[0]), P.Y(b2[1])); ctx.stroke(); }
      ctx.restore();
      var sq = [[0, 0], [1, 0], [1, 1], [0, 1]].map(ap);
      P.poly(sq, { fill: dt2 < 0 ? rgba(k.red, 0.28) : rgba(k.gold, 0.32), color: dt2 < 0 ? 'red' : 'gold', width: 2 });
      // a small "F" so a flip shows
      var Fp = [[0.25, 0.2], [0.25, 0.8], [0.7, 0.8]], Fq = [[0.25, 0.5], [0.55, 0.5]];
      P.poly(Fp.map(ap), { close: false, color: 'ink', width: 2.5 }); P.poly(Fq.map(ap), { close: false, color: 'ink', width: 2.5 });
      if (o.eigen && !E.complex && t >= 0.999) {
        var dirs = E.scalar ? [] : E.repeated ? [E.v[0]] : E.v;
        dirs.forEach(function (v, j) { P.seg(-v[0] * rg * 3, -v[1] * rg * 3, v[0] * rg * 3, v[1] * rg * 3, { color: 'purple', width: 2, dash: [8, 5] }); var lam = E.repeated ? E.l[0] : E.l[j], tip = [v[0] * 2.6, v[1] * 2.6]; label(ctx, 'λ = ' + fr(lam, 2), P.X(tip[0]) + 8, P.Y(tip[1]) - 12, { color: k.purple, align: 'left', size: 12, clampW: c.w, clampH: c.h }); });
      }
      var e1 = ap([1, 0]), e2 = ap([0, 1]);
      P.arrow(0, 0, e1[0], e1[1], { color: 'green', width: 3.5, head: 12 }); P.arrow(0, 0, e2[0], e2[1], { color: 'red', width: 3.5, head: 12 });
      label(ctx, 'A·î', P.X(e1[0]) + 8, P.Y(e1[1]) + 12, { color: k.green, bold: true, align: 'left', size: 12, clampW: c.w, clampH: c.h }); label(ctx, 'A·ĵ', P.X(e2[0]) + 8, P.Y(e2[1]) - 12, { color: k.red, bold: true, align: 'left', size: 12, clampW: c.w, clampH: c.h });
      var vs = '';
      if (S.v) {
        var Av = ap(S.v); P.arrow(0, 0, S.v[0], S.v[1], { color: 'teal', width: 2.5, dash: [5, 4], head: 10 }); P.arrow(0, 0, Av[0], Av[1], { color: 'teal', width: 3.5, head: 12 });
        knob(ctx, P.X(S.v[0]), P.Y(S.v[1]), k.teal, 6); label(ctx, 'v', P.X(S.v[0]) - 10, P.Y(S.v[1]) + 12, { color: k.teal, bold: true, align: 'right', clampW: c.w, clampH: c.h }); label(ctx, t >= 0.999 ? 'A·v' : '', P.X(Av[0]) + 8, P.Y(Av[1]) - 12, { color: k.teal, bold: true, align: 'left', clampW: c.w, clampH: c.h });
        var Av1 = [A[0][0] * S.v[0] + A[0][1] * S.v[1], A[1][0] * S.v[0] + A[1][1] * S.v[1]], cr = S.v[0] * Av1[1] - S.v[1] * Av1[0], onl = M.hypot(S.v[0], S.v[1]) > 1e-9 && M.abs(cr) < 1e-9;
        vs = '<br>v = ⟨' + fm(S.v[0]) + ', ' + fm(S.v[1]) + '⟩ → A·v = ⟨' + fm(Av1[0], 3) + ', ' + fm(Av1[1], 3) + '⟩' + (onl ? ': <b>A·v stays on v’s line</b>, so v is an eigenvector (A·v = ' + fr(M.abs(S.v[0]) > 1e-9 ? Av1[0] / S.v[0] : Av1[1] / S.v[1], 3) + 'v).' : '.');
      }
      H.draw(ctx);
      var s = 'A = [' + fm(A[0][0]) + ' ' + fm(A[0][1]) + '; ' + fm(A[1][0]) + ' ' + fm(A[1][1]) + ']: its columns are where <span class="mla-g">î</span> and <span class="mla-r">ĵ</span> land. det A = (' + fm(A[0][0]) + ')(' + fm(A[1][1]) + ') − (' + fm(A[0][1]) + ')(' + fm(A[1][0]) + ') = <b>' + fm(det, 3) + '</b>: ';
      s += M.abs(det) < 1e-12 ? 'the unit square is squashed flat (area 0), so A has no inverse.' : 'the unit square’s area is multiplied by ' + fm(M.abs(det), 3) + (det < 0 ? ', and the negative sign means the plane is flipped (look at the F).' : '.');
      if (E.complex) s += '<br>Eigenvalues ' + fm(E.re, 3) + ' ± ' + fm(E.im, 3) + '<i>i</i> are not real: every direction gets turned, so no line stays put.';
      else if (E.scalar) s += '<br>A = ' + fm(A[0][0]) + 'I: every vector is an eigenvector with λ = ' + fm(A[0][0]) + '.';
      else s += '<br>Eigenvalues λ = ' + lamStr(E.tr, E.disc) + '. Along the dashed purple lines A only stretches (by λ); vectors there stay on their line.' + (E.repeated ? ' Only one such line here.' : '');
      F.out.set(s + vs);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* span: all the combinations c₁u + c₂v of one or two vectors: a line, a plane, or (in 3-D) a plane in space.
     opts:
       u: [2, 1], v: [1, 2]         the vectors (drag their tips in 2-D; v: null for a single vector). In 3-D give 3 entries.
       c: [1, 1]                     starting coefficients (sliders −3 … 3)
       target: [4, 5]               with task: reach this point with c₁u + c₂v (shown as a star); pick a target whose
                                     coefficients are multiples of 0.05 (here c₁ = 1, c₂ = 2)
       dim: 2                        2 or 3
       lattice: true                 dots at the whole-number combinations */
  R('span', function (el, o) {
    o = opt(o, { u: [2, 1], v: [1, 2], c: [1, 1], dim: 2, lattice: true });
    var d3 = o.dim === 3, u = o.u.map(function (x) { return nv(x, 0); }), v = o.v ? o.v.map(function (x) { return nv(x, 0); }) : null, S = { c1: nv(o.c[0], 1), c2: nv(o.c[1], 1) }, tg = o.target ? o.target.map(function (x) { return nv(x, 0); }) : null;
    if (d3) { while (u.length < 3) u.push(0); if (v) while (v.length < 3) v.push(0); }
    var F = frame(el, o, 'The span of ' + (v ? 'two vectors' : 'one vector')), c = F.canvas({ aspect: 1.3, max: 500 }), P, C3, H;
    if (!d3) { P = V.plane(c, { xmin: -6, xmax: 6, ymin: -6, ymax: 6, equal: true }); H = handles(c, P, [{ get: function () { return u; }, set: function (x, y) { u = [x, y]; } }].concat(v ? [{ get: function () { return v; }, set: function (x, y) { v = [x, y]; } }] : []), { snap: 0.5, change: draw }); c.cv.setAttribute('aria-label', 'Span of vectors. Arrow keys move the tip of u; Enter switches vectors.'); }
    else { C3 = cam3(c, { r: 3.7, change: draw, yaw: o.yaw, pitch: o.pitch }); c.cv.setAttribute('aria-label', 'Span in three dimensions. Drag or use the arrow keys to turn the view.'); var row0 = F.row(); vecInputs(row0, 'u', u, 3, draw); if (v) vecInputs(row0, 'v', v, 3, draw); }
    V.slider(F.ctl, { label: 'c₁ (times u)', min: -3, max: 3, step: 0.05, value: S.c1, input: function (x) { S.c1 = x; draw(); } });
    if (v) V.slider(F.ctl, { label: 'c₂ (times v)', min: -3, max: 3, step: 0.05, value: S.c2, input: function (x) { S.c2 = x; draw(); } });
    function draw() {
      var k = V.colors(), ctx = c.ctx, c2 = v ? S.c2 : 0, w = u.map(function (x, i) { return S.c1 * x + (v ? c2 * v[i] : 0); }), s;
      var indep = v && (d3 ? len(cross(u, v)) > 1e-9 : M.abs(u[0] * v[1] - u[1] * v[0]) > 1e-9), zero = len(u) < 1e-12 && (!v || len(v) < 1e-12);
      if (!d3) {
        P.clear(); P.grid({ step: 1 }); P.axes({ step: 2 });
        if (indep) { ctx.save(); ctx.fillStyle = rgba(k.purple, 0.08); ctx.fillRect(0, 0, c.w, c.h); ctx.restore(); }
        else if (!zero) { var dvec = len(u) > 1e-12 ? u : v; P.seg(-dvec[0] * 40, -dvec[1] * 40, dvec[0] * 40, dvec[1] * 40, { color: rgba(k.purple, 0.45), width: 8 }); }
        if (o.lattice && !zero) for (var i = -6; i <= 6; i++) for (var j = v ? -6 : 0; j <= (v ? 6 : 0); j++) { var p = [i * u[0] + (v ? j * v[0] : 0), i * u[1] + (v ? j * v[1] : 0)]; if (M.abs(p[0]) < 7 && M.abs(p[1]) < 7) P.point(p[0], p[1], { color: rgba(k.purple, 0.55), r: 2.5 }); }
        if (tg) { label(ctx, '★', P.X(tg[0]), P.Y(tg[1]), { color: k.gold, size: 18, bg: 'rgba(0,0,0,0)' }); }
        var cu = [S.c1 * u[0], S.c1 * u[1]];
        P.arrow(0, 0, cu[0], cu[1], { color: rgba(k.blue, 0.6), width: 2.5, dash: [5, 4] }); if (v) P.arrow(cu[0], cu[1], w[0], w[1], { color: rgba(k.red, 0.6), width: 2.5, dash: [5, 4] });
        P.arrow(0, 0, w[0], w[1], { color: 'purple', width: 3.5, head: 12 });
        P.arrow(0, 0, u[0], u[1], { color: 'blue', width: 3.5, head: 12 }); if (v) P.arrow(0, 0, v[0], v[1], { color: 'red', width: 3.5, head: 12 });
        knob(ctx, P.X(u[0]), P.Y(u[1]), k.blue, 6); if (v) knob(ctx, P.X(v[0]), P.Y(v[1]), k.red, 6);
        label(ctx, 'u', P.X(u[0]) + 10, P.Y(u[1]) - 12, { color: k.blue, bold: true, align: 'left' }); if (v) label(ctx, 'v', P.X(v[0]) + 10, P.Y(v[1]) - 12, { color: k.red, bold: true, align: 'left' });
        H.draw(ctx);
      } else {
        ctx.fillStyle = k.bg; ctx.fillRect(0, 0, c.w, c.h); C3.axes(ctx, 3.5);
        if (indep) { var faces = [], n = 6, R2 = 3; for (i = -n; i < n; i++) for (j = -n; j < n; j++) { var q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(function (ab) { var s1 = ab[0] / n * R2 / M.max(len(u), 0.5), s2 = ab[1] / n * R2 / M.max(len(v), 0.5); return [s1 * u[0] + s2 * v[0], s1 * u[1] + s2 * v[1], s1 * u[2] + s2 * v[2]]; }); faces.push({ q: q, fill: rgba(k.purple, 0.12), stroke: rgba(k.purple, 0.3), lw: 0.6 }); } C3.faces(ctx, faces); }
        else if (!zero) { var dv = len(u) > 1e-12 ? u : v, L2 = 4 / len(dv); C3.line(ctx, [[-dv[0] * L2, -dv[1] * L2, -dv[2] * L2], [dv[0] * L2, dv[1] * L2, dv[2] * L2]], rgba(k.purple, 0.5), 6); }
        if (tg) { var tp = C3.dot(ctx, tg, k.gold, 6); label(ctx, '★ target', tp[0] + 10, tp[1] - 10, { color: k.gold, align: 'left', size: 12 }); }
        var cu3 = u.map(function (x) { return S.c1 * x; });
        C3.line(ctx, [[0, 0, 0], cu3], rgba(k.blue, 0.6), 2.5, [5, 4]); if (v) C3.line(ctx, [cu3, w], rgba(k.red, 0.6), 2.5, [5, 4]);
        C3.arrow(ctx, [0, 0, 0], w, k.purple, 3.5); C3.arrow(ctx, [0, 0, 0], u, k.blue, 3.2); if (v) C3.arrow(ctx, [0, 0, 0], v, k.red, 3.2);
      }
      var ws = '⟨' + w.map(function (x) { return fm(x, 3); }).join(', ') + '⟩';
      s = (v ? 'c₁u + c₂v = ' + mco(S.c1, 2) + 'u ' + (c2 < 0 ? '− ' + mco(-c2, 2) : '+ ' + mco(c2, 2)) + 'v' : 'c₁u = ' + mco(S.c1, 2) + 'u') + ' = <b>' + ws + '</b>. ';
      if (zero) s += 'The span of the zero vector is just the origin.';
      else if (!v) s += 'The span of one nonzero vector is the <b>line</b> through the origin in its direction: every multiple of u.';
      else if (indep) s += d3 ? 'u and v point in different directions, so their span is a <b>plane</b> through the origin (normal u × v = ' + vstr(cross(u, v), 3) + '). Points off that plane cannot be reached.' : 'u and v are independent, so their span is the <b>whole plane</b>: every point is some c₁u + c₂v.';
      else s += 'u and v lie on the same line (dependent), so together they still only span a <b>line</b>.';
      if (tg) {
        var reach = false, sol = null;
        if (!d3 && indep) { var det = u[0] * v[1] - u[1] * v[0]; sol = [(tg[0] * v[1] - tg[1] * v[0]) / det, (u[0] * tg[1] - u[1] * tg[0]) / det]; }
        if (d3 && indep) { var nrm = cross(u, v); if (M.abs(dot(nrm, tg)) < 1e-9) { var uu = dot(u, u), uv = dot(u, v), vv = dot(v, v), tu = dot(tg, u), tvv = dot(tg, v), dd = uu * vv - uv * uv; sol = [(tu * vv - tvv * uv) / dd, (tvv * uu - tu * uv) / dd]; } }
        reach = M.hypot.apply(null, w.map(function (x, i) { return x - tg[i]; })) < 0.08;
        s += '<br>Target ⟨' + tg.map(function (x) { return fm(x); }).join(', ') + '⟩: ' + (reach ? '<b>reached!</b>' : sol ? 'it is in the span; keep adjusting c₁ and c₂.' : 'it is <b>not</b> in the span, so no choice of c₁ and c₂ reaches it.');
        F.done(reach);
      }
      F.out.set(s);
    }
    if (d3) { V.onTheme(draw); c.onResize(draw); } else redrawOn(c, draw);
    draw();
    return { draw: draw };
  });

  /* slopefield: the direction field of dy/dx = f(x, y), with the solution through a point you drag.
     opts:
       f: "x - y"                   the right side (params allowed)
       point: [0, 1]                the initial condition (x₀, y₀), draggable
       curves: [[0, -1], [0, 2]]    extra fixed solution curves
       euler: false                  show Euler’s method from the point, with a step-size slider
       h: 0.5                        Euler step size
       xmin…ymax (−4…4), density: 0 (segments per row; 0 = automatic) */
  R('slopefield', function (el, o) {
    o = opt(o, { f: 'x - y', point: [0, 1], curves: [], euler: false, h: 0.5, xmin: -4, xmax: 4, ymin: -4, ymax: 4, density: 0 });
    var Pm = {}, ps = params(o.params), f = cf(o.f, ['x', 'y'], Pm), p = [nv(o.point[0], 0), nv(o.point[1], 1)], S = { h: nv(o.h, 0.5), eu: o.euler };
    var F = frame(el, o, 'Slope field of dy/dx = ' + o.f), c = F.canvas({ aspect: 1.3, max: 520 }), P = V.plane(c, win(o, [-4, 4, -4, 4]));
    var H = handles(c, P, [{ get: function () { return p; }, set: function (x, y) { p = [x, y]; } }], { snap: 0.1, change: draw });
    c.cv.setAttribute('aria-label', 'Slope field. Arrow keys move the starting point of the solution.');
    ps.forEach(function (q) { pslider(F.ctl, q, Pm, draw); });
    check(F.ctl, 'Euler’s method', S.eu, function (v) { S.eu = v; hs.el.hidden = !v; draw(); });
    var hs = V.slider(F.ctl, { label: 'step h', min: 0.05, max: 1, step: 0.05, value: S.h, input: function (v) { S.h = v; draw(); } }); hs.el.hidden = !S.eu;
    function sol(x0, y0) { // RK4 both ways
      var v = P.view(), hh = (v.xmax - v.xmin) / 400, out = [], dir, x, y, lim = (v.ymax - v.ymin) * 3;
      for (dir = -1; dir <= 1; dir += 2) { var seg = [[x0, y0]]; x = x0; y = y0; for (var i = 0; i < 800; i++) { var Fn = function (t, Y) { return [f(t, Y[0])]; }; var ny = rk4(Fn, x, [y], dir * hh)[0]; x += dir * hh; y = ny; if (!isFinite(y) || M.abs(y - (v.ymin + v.ymax) / 2) > lim || x < v.xmin - hh || x > v.xmax + hh) break; seg.push([x, y]); } out.push(dir < 0 ? seg.reverse() : seg); }
      return out[0].concat(out[1].slice(1));
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view(), n = o.density || M.max(12, M.min(26, M.round(c.w / 30))), cell = c.w / n, L = cell * 0.36, sx = P.unit, sy = P.Y(0) - P.Y(1);
      P.clear(); P.grid({ minor: false }); P.axes();
      ctx.save(); ctx.strokeStyle = rgba(k.ink, 0.55); ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath();
      for (var px = cell / 2; px < c.w; px += cell) for (var py = cell / 2; py < c.h; py += cell) { var m = f(P.x(px), P.y(py)); if (!isFinite(m)) continue; var ddx = sx, ddy = -m * sy, dl = M.hypot(ddx, ddy) || 1; ddx *= L / dl; ddy *= L / dl; ctx.moveTo(px - ddx, py - ddy); ctx.lineTo(px + ddx, py + ddy); }
      ctx.stroke(); ctx.restore();
      (o.curves || []).forEach(function (q) { P.poly(sol(nv(q[0], 0), nv(q[1], 0)), { close: false, color: 'teal', width: 2 }); });
      var path = sol(p[0], p[1]); P.poly(path, { close: false, color: 'blue', width: 3.2 });
      var es = '';
      if (S.eu) {
        var ex = p[0], ey = p[1], pts = [[ex, ey]]; while (ex < v.xmax - 1e-9 && pts.length < 400) { ey += S.h * f(ex, ey); ex += S.h; if (!isFinite(ey)) break; pts.push([ex, ey]); }
        P.poly(pts, { close: false, color: 'orange', width: 2.5 }); pts.forEach(function (q) { P.point(q[0], q[1], { color: 'orange', r: 3.5 }); });
        var xe = pts[M.min(pts.length - 1, M.round(1 / S.h))], tr = path.filter(function (q) { return q[0] >= xe[0] - 1e-9; })[0];
        if (xe && tr) es = '<br><span style="color:' + k.orange + ';font-weight:700">Euler</span> with h = ' + fm(S.h) + ': at <i>x</i> = ' + fm(xe[0], 2) + ' it gives <i>y</i> ≈ ' + fm(xe[1], 4) + '; the true solution has <i>y</i> = ' + fm(tr[1], 4) + ' (error ' + fm(M.abs(xe[1] - tr[1]), 4) + '). Halve h and the error roughly halves.';
      }
      knob(ctx, P.X(p[0]), P.Y(p[1]), k.blue, 7); H.draw(ctx);
      F.out.set('<i>dy</i>/<i>dx</i> = ' + mathHTML(ps.length ? showSub(o.f, Pm) : pretty(o.f)) + '. Each short segment has the slope the equation gives at that point. The <span class="mla-b">solution through (' + fm(p[0], 2) + ', ' + fm(p[1], 2) + ')</span> follows the segments; its slope there is ' + fm(f(p[0], p[1]), 3) + '.' + es);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* phaseplane: trajectories of x′ = ax + by, y′ = cx + dy (or a nonlinear system), with eigen-directions and the type.
     opts:
       m: [[0, 1], [-2, -1]]       the matrix [[a, b], [c, d]] (entries editable)
       P: null, Q: null              strings for a nonlinear system x′ = P(x, y), y′ = Q(x, y) (then m is ignored)
       presets: true                 saddle, spiral sink, spiral source, center, sink, source
       point: [2, 1]                 the starting point of the highlighted trajectory (drag it)
       timeplot: true                a strip with x(t) and y(t) below
       play: true                    a button that runs a particle along the trajectory
       range: 4 */
  var SYS = { saddle: [[1, 1], [4, -2], 'Saddle'], spiralsink: [[-0.5, 2], [-2, -0.5], 'Spiral sink'], spiralsource: [[0.3, 2], [-2, 0.3], 'Spiral source'], center: [[0, 1], [-2, 0], 'Center'], sink: [[-2, 1], [1, -2], 'Sink'], source: [[2, 1], [1, 2], 'Source'] };
  R('phaseplane', function (el, o) {
    o = opt(o, { m: [[0, 1], [-2, -1]], presets: true, point: [2, 1], timeplot: true, play: true, range: 4 });
    var lin = !(o.P && o.Q), A = [[nv(o.m[0][0], 0), nv(o.m[0][1], 1)], [nv(o.m[1][0], -2), nv(o.m[1][1], -1)]], Pm = {}, fP = lin ? null : cf(o.P, ['x', 'y'], Pm), fQ = lin ? null : cf(o.Q, ['x', 'y'], Pm), p = [nv(o.point[0], 2), nv(o.point[1], 1)], rg = nv(o.range, 4), S = { tp: 0 }, anim = null;
    function Fv(x, y) { return lin ? [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y] : [fP(x, y), fQ(x, y)]; }
    var F = frame(el, o, 'Phase plane of a system of differential equations'), c = F.canvas({ aspect: 1.3, max: 500 }), P = V.plane(c, { xmin: -rg, xmax: rg, ymin: -rg, ymax: rg, equal: true });
    var c2 = o.timeplot ? V.canvas(F.box, { height: 120 }) : null; if (c2) { c2.cv.style.marginTop = '6px'; c2.cv.setAttribute('aria-hidden', 'true'); scrollOK(c2); }
    var H = handles(c, P, [{ get: function () { return p; }, set: function (x, y) { p = [x, y]; S.tp = 0; } }], { snap: 0.1, change: draw });
    c.cv.setAttribute('aria-label', 'Phase plane. Arrow keys move the starting point.');
    var mi = lin ? matInputs(F.ctl, A, draw, 'A') : null;
    if (o.play) { var pb = V.button(F.ctl, '▶ Run', function () { if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Run'; return; } pb.textContent = '❚❚ Pause'; S.tp = 0; var acc = 0; anim = V.loop(el, function (dt) { acc += dt; if (V.reduced) { if (acc < 0.4) return; acc = 0; S.tp += 0.5; } else S.tp += dt * 1.2; if (S.tp >= 10) { S.tp = 10; anim.stop(); anim = null; pb.textContent = '▶ Run'; } draw(); }); }); }
    if (lin && o.presets) { var pr = F.row(); V.seg(pr, { label: 'Presets', items: Object.keys(SYS).map(function (q) { return [q, SYS[q][2]]; }), value: '', change: function (q) { A[0] = SYS[q][0].slice(); A[1] = SYS[q][1].slice(); mi.set(A); draw(); } }); }
    var cache = {};
    function traj(x0, y0, T, dir) { var pts = [[x0, y0, 0]], y = [x0, y0], h = 0.02 * (dir || 1); for (var i = 0; i < M.abs(T / 0.02); i++) { y = rk4(function (t, Y) { return Fv(Y[0], Y[1]); }, 0, y, h); if (!isFinite(y[0] + y[1]) || M.abs(y[0]) > rg * 2.5 || M.abs(y[1]) > rg * 2.5) break; pts.push([y[0], y[1], (i + 1) * h]); } return pts; }
    function draw() {
      var k = V.colors(), ctx = c.ctx, E = lin ? eig2(A[0][0], A[0][1], A[1][0], A[1][1]) : null;
      P.clear(); P.grid({ minor: false, step: 1 }); P.axes({ step: 1, x: 'x', y: 'y' });
      fieldArrows(c, P, function (x, y) { return Fv(x, y)[0]; }, function (x, y) { return Fv(x, y)[1]; }, { alpha: 0.4 });
      var key = JSON.stringify(A) + p.join(',');
      if (cache.key !== key) { cache.key = key; cache.bg = []; for (var i = 0; i < 10; i++) { var a = i * TAU / 10 + 0.3, s0 = [rg * 0.85 * M.cos(a), rg * 0.85 * M.sin(a)]; cache.bg.push(traj(s0[0], s0[1], 8, 1), traj(s0[0], s0[1], 8, -1)); } cache.tr = traj(p[0], p[1], 10, 1); cache.back = traj(p[0], p[1], 3, -1); }
      cache.bg.forEach(function (q) { P.poly(q, { close: false, color: rgba(k.teal, 0.45), width: 1.4 }); });
      if (E && !E.complex && !E.scalar) (E.repeated ? [E.v[0]] : E.v).forEach(function (v) { P.seg(-v[0] * rg * 2, -v[1] * rg * 2, v[0] * rg * 2, v[1] * rg * 2, { color: 'purple', width: 2, dash: [8, 5] }); });
      var tr = cache.tr, back = cache.back;
      P.poly(back, { close: false, color: rgba(k.blue, 0.35), width: 2, dash: [4, 4] }); P.poly(tr, { close: false, color: 'blue', width: 3 });
      var cur = tr[M.min(tr.length - 1, M.round(S.tp / 0.02))];
      if (S.tp > 0) P.point(cur[0], cur[1], { color: 'red', r: 6 });
      knob(ctx, P.X(p[0]), P.Y(p[1]), k.blue, 7); H.draw(ctx);
      if (c2) {
        var g = c2.ctx, W2 = c2.w, H2 = c2.h, mx = 0; tr.forEach(function (q) { mx = M.max(mx, M.abs(q[0]), M.abs(q[1])); }); mx = mx || 1;
        var GX = function (t) { return 34 + (W2 - 44) * t / 10; }, GY = function (v) { return H2 / 2 - v / mx * (H2 / 2 - 12); };
        g.fillStyle = k.bg; g.fillRect(0, 0, W2, H2); g.strokeStyle = k.axis; g.lineWidth = 1.2; g.beginPath(); g.moveTo(34, GY(0)); g.lineTo(W2 - 8, GY(0)); g.moveTo(34, 6); g.lineTo(34, H2 - 6); g.stroke();
        [[0, k.blue, 'x(t)'], [1, k.red, 'y(t)']].forEach(function (q) { g.strokeStyle = q[1]; g.lineWidth = 2; g.beginPath(); tr.forEach(function (pt, j) { var X2 = GX(pt[2]), Y2 = GY(clamp(pt[q[0]], -mx, mx)); if (j) g.lineTo(X2, Y2); else g.moveTo(X2, Y2); }); g.stroke(); txt(g, q[2], 40 + q[0] * 44, 12, { color: q[1], size: 12, bold: true }); });
        txt(g, 't', W2 - 12, GY(0) - 9, { italic: true, size: 13, color: k.ink }); if (S.tp > 0) { g.strokeStyle = k.muted; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(GX(S.tp), 4); g.lineTo(GX(S.tp), H2 - 4); g.stroke(); g.setLineDash([]); }
      }
      var s;
      if (lin) {
        var tp = E.tr, de = E.det, disc = E.disc, kind;
        if (M.abs(de) < 1e-12) kind = 'degenerate (a whole line of equilibrium points)';
        else if (de < 0) kind = '<b>saddle</b>: trajectories come in along one eigen-direction and leave along the other (unstable)';
        else if (disc < -1e-12) kind = M.abs(tp) < 1e-12 ? '<b>center</b>: closed loops around the origin (neutrally stable)' : tp < 0 ? '<b>spiral sink</b>: spirals in to the origin (stable)' : '<b>spiral source</b>: spirals out (unstable)';
        else kind = tp < 0 ? '<b>sink</b> (stable node): every trajectory heads into the origin' : '<b>source</b> (unstable node): trajectories head away';
        s = '<i>x</i>′ = ' + lin2(A[0][0], A[0][1]) + ', <i>y</i>′ = ' + lin2(A[1][0], A[1][1]) + '. Trace ' + fm(tp, 3) + ', determinant ' + fm(de, 3) + ', so the origin is a ' + kind + '.<br>Eigenvalues: ' + (E.complex ? fm(E.re, 3) + ' ± ' + fm(E.im, 3) + '<i>i</i> (complex: the solutions rotate; the real part ' + fm(E.re, 3) + ' decides growth or decay).' : lamStr(tp, disc) + '. Along the purple eigen-directions solutions move in straight lines, like <i>e</i><sup>λ<i>t</i></sup>.');
      } else s = '<i>x</i>′ = ' + mathHTML(pretty(o.P)) + ', <i>y</i>′ = ' + mathHTML(pretty(o.Q)) + '. Drag the blue point to start a new trajectory.';
      s += '<br>Start (' + fm(p[0], 2) + ', ' + fm(p[1], 2) + ')' + (S.tp > 0 ? '; at <i>t</i> = ' + fm(S.tp, 1) + ' the particle is at (' + fm(cur[0], 2) + ', ' + fm(cur[1], 2) + ').' : '.');
      F.out.set(s);
    }
    function lin2(a, b) { var t = ''; if (a) t += mco(a) + '<i>x</i>'; if (b) t += (t ? (b < 0 ? ' − ' : ' + ') + mco(M.abs(b)) : mco(b)) + '<i>y</i>'; return t || '0'; }
    redrawOn(c, draw); if (c2) c2.onResize(draw); draw();
    return { draw: draw };
  });

  /* springmass: a damped (and optionally driven) spring: m x″ + c x′ + k x = F₀ cos(ωt), animated with its graph.
     opts:
       m: 1, c: 0.4, k: 4           mass, damping, stiffness (sliders)
       x0: 1, v0: 0                 starting position (up is positive) and velocity
       forcing: false                add a driving force with F0 and w sliders
       F0: 1, w: 2                   driving amplitude and frequency
       tmax: 20                      length of the graph in seconds
       play: true                    start playing (ignored when the visitor prefers less motion) */
  R('springmass', function (el, o) {
    o = opt(o, { m: 1, c: 0.4, k: 4, x0: 1, v0: 0, forcing: false, F0: 1, w: 2, tmax: 20, play: true });
    var S = { m: nv(o.m, 1), c: nv(o.c, 0.4), k: nv(o.k, 4), x0: nv(o.x0, 1), v0: nv(o.v0, 0), F0: o.forcing ? nv(o.F0, 1) : 0, w: nv(o.w, 2), t: 0 }, T = nv(o.tmax, 20), N = 1000, xs = new Float64Array(N + 1), anim = null;
    var F = frame(el, o, 'A spring and mass with damping'), c = F.canvas({ aspect: 2.1, min: 260, max: 360, narrow: 1.4 });
    function solve() { var y = [S.x0, S.v0], h = T / N; xs[0] = S.x0; for (var i = 1; i <= N; i++) { for (var j = 0; j < 4; j++) y = rk4(function (t, Y) { return [Y[1], (S.F0 * M.cos(S.w * t) - S.c * Y[1] - S.k * Y[0]) / S.m]; }, (i - 1) * h + j * h / 4, y, h / 4); xs[i] = y[0]; } }
    solve();
    function X(t) { var u = clamp(t / T * N, 0, N), i = M.min(N - 1, M.floor(u)), f = u - i; return xs[i] * (1 - f) + xs[i + 1] * f; }
    function sl(lbl, key, mn, mx, st) { return V.slider(F.ctl, { label: lbl, min: mn, max: mx, step: st, value: S[key], input: function (v) { S[key] = v; solve(); draw(); } }); }
    sl('mass m', 'm', 0.25, 4, 0.25); sl('damping c', 'c', 0, 4, 0.1); sl('stiffness k', 'k', 0.5, 10, 0.5);
    if (o.forcing) { sl('driving F₀', 'F0', 0, 3, 0.1); sl('driving ω', 'w', 0.2, 5, 0.1); }
    var row = F.row(), ts = V.slider(row, { label: 'time t', min: 0, max: T, step: T / 400, value: 0, fmt: function (v) { return fm(v, 1) + ' s'; }, input: function (v) { S.t = v; if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Play'; } draw(); } });
    var pb = V.button(row, '▶ Play', toggle, 'pri');
    function toggle() {
      if (anim) { anim.stop(); anim = null; pb.textContent = '▶ Play'; return; }
      if (S.t >= T - 1e-6) S.t = 0; pb.textContent = '❚❚ Pause';
      anim = V.loop(el, function (dt) { S.t = M.min(T, S.t + dt); ts.set(S.t); draw(); if (S.t >= T) { anim.stop(); anim = null; pb.textContent = '▶ Play'; } });
    }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, lw = M.min(150, w * 0.28), gx = lw + 26, gw = w - gx - 12, amp = 0; for (var i = 0; i <= N; i++) amp = M.max(amp, M.abs(xs[i])); amp = M.max(amp, 0.5) * 1.1;
      var ymid = h / 2 + 28, sc = (h / 2 - 40) / amp, Y = function (x) { return ymid - x * sc; }, GX = function (t) { return gx + gw * t / T; };
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      // equilibrium line
      ctx.save(); ctx.strokeStyle = k.grid; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(8, ymid); ctx.lineTo(w - 8, ymid); ctx.stroke(); ctx.restore();
      // ceiling, spring, damper, mass
      var cx = lw * 0.5, top = 10, xm = X(S.t), my = Y(xm), bw = M.min(56, lw * 0.5), bh = 30;
      ctx.fillStyle = k.muted; ctx.fillRect(cx - lw * 0.42, top - 4, lw * 0.84, 5);
      ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.lineJoin = 'round'; var y0 = top, y1 = my - bh / 2, nz = 12, sx = cx - 10; ctx.beginPath(); ctx.moveTo(sx, y0); ctx.lineTo(sx, y0 + 8); for (i = 1; i <= nz; i++) ctx.lineTo(sx + (i % 2 ? -9 : 9) * (i === nz ? 0 : 1), y0 + 8 + (y1 - y0 - 16) * i / nz); ctx.lineTo(sx, y1); ctx.stroke();
      if (S.c > 0) { var dxp = cx + 14, mid = (y0 + y1) / 2; ctx.strokeStyle = k.muted; ctx.beginPath(); ctx.moveTo(dxp, y0); ctx.lineTo(dxp, mid - 10); ctx.moveTo(dxp - 7, mid - 14); ctx.lineTo(dxp - 7, mid + 10); ctx.lineTo(dxp + 7, mid + 10); ctx.lineTo(dxp + 7, mid - 14); ctx.moveTo(dxp - 5, mid); ctx.lineTo(dxp + 5, mid); ctx.moveTo(dxp, mid); ctx.lineTo(dxp, y1); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = k.blue; rrect(ctx, cx - bw / 2, my - bh / 2, bw, bh, 6); ctx.fill(); txt(ctx, 'm', cx, my, { align: 'center', color: '#fff', italic: true, size: 15 });
      ctx.save(); ctx.strokeStyle = rgba(k.blue, 0.6); ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx + bw / 2, my); ctx.lineTo(GX(S.t), my); ctx.stroke(); ctx.restore();
      // graph
      ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, 8); ctx.lineTo(gx, h - 8); ctx.moveTo(gx, ymid); ctx.lineTo(gx + gw, ymid); ctx.stroke(); ctx.restore();
      var tst = T / gw * 44 > 5 ? (T / gw * 44 > 10 ? 20 : 10) : 5; for (var tt = tst; tt <= T; tt += tst) txt(ctx, tt + ' s', GX(tt), ymid + 12, { align: 'center', size: 10 });
      txt(ctx, 'x(t)', gx + 6, 14, { size: 12, color: k.ink, italic: true });
      var zeta = S.c / (2 * M.sqrt(S.m * S.k)), w0 = M.sqrt(S.k / S.m);
      if (zeta < 1 && S.F0 === 0 && S.c > 0) { var A0 = M.hypot(S.x0, (S.v0 + S.c / (2 * S.m) * S.x0) / (w0 * M.sqrt(1 - zeta * zeta))); [1, -1].forEach(function (sg) { ctx.save(); ctx.strokeStyle = rgba(k.gold, 0.8); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4; ctx.beginPath(); for (var j = 0; j <= 200; j++) { var t2 = T * j / 200, yy = Y(sg * A0 * M.exp(-S.c / (2 * S.m) * t2)); if (j) ctx.lineTo(GX(t2), yy); else ctx.moveTo(GX(t2), yy); } ctx.stroke(); ctx.restore(); }); }
      ctx.save(); ctx.strokeStyle = rgba(k.blue, 0.25); ctx.lineWidth = 1.5; ctx.beginPath(); for (i = 0; i <= N; i += 2) { var px = GX(T * i / N), py = Y(xs[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
      ctx.strokeStyle = k.blue; ctx.lineWidth = 2.6; ctx.beginPath(); for (i = 0; i <= N; i += 2) { if (T * i / N > S.t) break; px = GX(T * i / N); py = Y(xs[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.lineTo(GX(S.t), my); ctx.stroke(); ctx.restore();
      knob(ctx, GX(S.t), my, k.blue, 6);
      var kind = S.c === 0 ? 'no damping: it would bounce forever' : zeta < 1 - 1e-9 ? 'underdamped (ζ &lt; 1): it oscillates while the swings shrink' : zeta <= 1 + 1e-9 ? 'critically damped (ζ = 1): the fastest return with no overshoot' : 'overdamped (ζ &gt; 1): it creeps back without oscillating';
      var s = mco(S.m, 2) + '<i>x</i>″ + ' + (S.c ? mco(S.c, 2) + '<i>x</i>′ + ' : '') + mco(S.k, 2) + '<i>x</i> = ' + (S.F0 ? mco(S.F0, 2) + 'cos(' + mco(S.w, 2) + '<i>t</i>)' : '0') + '. Natural frequency ω₀ = √(<i>k</i>/<i>m</i>) = ' + fm(w0, 3) + ' (period ' + fm(TAU / w0, 3) + ' s). Damping ratio ζ = <i>c</i>/(2√(<i>mk</i>)) = ' + fm(zeta, 3) + ': ' + kind + '.';
      if (S.F0) s += ' Driving near ω₀ makes the swings grow large (resonance).';
      s += ' At <i>t</i> = ' + fm(S.t, 1) + ' s, <i>x</i> = ' + fm(xm, 3) + '.';
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    if (o.play && !V.reduced) toggle();
    return { draw: draw, destroy: function () { if (anim) anim.stop(); } };
  });

  // ---------- probability helpers ----------
  function diceDist(n, s) { // exact distribution of the sum of n fair s-sided dice: counts indexed by sum
    var d = [1]; for (var i = 0; i < n; i++) { var e = new Array(d.length + s).fill(0); d.forEach(function (c, j) { for (var f = 1; f <= s; f++) e[j + f] += c; }); d = e; }
    return d; // d[sum] = number of ways, total s^n
  }
  function binom(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return M.round(r); }
  function pips(ctx, x, y, sz, v, k) { // a die face
    ctx.save(); ctx.fillStyle = k.bg; ctx.strokeStyle = k.ink; ctx.lineWidth = 2; rrect(ctx, x, y, sz, sz, sz * 0.18); ctx.fill(); ctx.stroke();
    var P2 = { 1: [[0.5, 0.5]], 2: [[0.27, 0.27], [0.73, 0.73]], 3: [[0.27, 0.27], [0.5, 0.5], [0.73, 0.73]], 4: [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]], 5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]], 6: [[0.27, 0.25], [0.73, 0.25], [0.27, 0.5], [0.73, 0.5], [0.27, 0.75], [0.73, 0.75]] }[v];
    ctx.fillStyle = k.ink; if (P2) P2.forEach(function (q) { ctx.beginPath(); ctx.arc(x + q[0] * sz, y + q[1] * sz, sz * 0.09, 0, TAU); ctx.fill(); }); else txt(ctx, String(v), x + sz / 2, y + sz / 2, { align: 'center', size: sz * 0.45, color: k.ink, bold: true });
    ctx.restore();
  }
  function axisBars(ctx, k, x0, y0, w, h, n) { ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x0, y0 + h); ctx.lineTo(x0 + w, y0 + h); ctx.stroke(); ctx.restore(); }

  /* dice: roll dice (or flip coins) many times and watch the histogram settle toward the true probabilities.
     opts:
       kind: "dice"                 "dice" (the sum of the dice) or "coins" (the number of heads)
       n: 2, sides: 6               how many dice or coins, and sides per die
       event: 7                      an outcome to track: its running proportion is graphed against the true probability
       theory: true                  outline the true probabilities on the histogram
       seed: 0                       a seed for repeatable rolls (0 = random each time) */
  R('dice', function (el, o) {
    o = opt(o, { kind: 'dice', n: 2, sides: 6, event: null, theory: true, seed: 0 });
    var coins = o.kind === 'coins', n = clamp(o.n, 1, coins ? 20 : 6), s = coins ? 2 : clamp(o.sides, 2, 20), rnd = rng(o.seed || 0);
    var lo = coins ? 0 : n, hi = coins ? n : n * s, counts = new Array(hi + 1).fill(0), total = 0, last = null, hist = [], ev = o.event != null ? nv(o.event, null) : null, evc = 0, roll = null;
    var dist = coins ? null : diceDist(n, s), ways = M.pow(s, n);
    function prob(v) { return coins ? binom(n, v) / M.pow(2, n) : (dist[v] || 0) / ways; }
    function pfr(v) { if (coins) { var c = binom(n, v), d = M.pow(2, n), g = gcd(c, d); return (c / g) + '/' + (d / g); } var c2 = dist[v] || 0, g2 = gcd(c2, ways); return (c2 / g2) + '/' + (ways / g2); }
    var F = frame(el, o, coins ? 'Coin flips and their histogram' : 'Dice rolls and their histogram'), c = F.canvas({ aspect: 1.8, max: 420, narrow: 1.3 });
    scrollOK(c);
    var c2 = ev != null ? V.canvas(F.box, { height: 120 }) : null; if (c2) { c2.cv.style.marginTop = '6px'; c2.cv.setAttribute('aria-hidden', 'true'); scrollOK(c2); }
    var bt = mk('div', 'mla-btns'); F.ctl.appendChild(bt);
    [1, 10, 100, 1000].forEach(function (q) { V.button(bt, (coins ? 'Flip ' : 'Roll ') + q, function () { go(q); }, q === 1 ? 'pri' : ''); });
    V.button(bt, 'Reset', function () { counts.fill(0); total = 0; last = null; hist = []; evc = 0; draw(); });
    function one() { var r = [], sum = 0; for (var i = 0; i < n; i++) { var v = coins ? (rnd() < 0.5 ? 1 : 0) : 1 + M.floor(rnd() * s); r.push(v); sum += v; } return [r, sum]; }
    function go(q) {
      for (var i = 0; i < q; i++) { var r = one(); counts[r[1]]++; total++; last = r; if (ev != null && r[1] === ev) evc++; if (ev != null) { if (total <= 200 || total % M.ceil(total / 200) === 0) hist.push([total, evc / total]); } }
      if (q === 1 && !V.reduced) { var t0 = 0; if (roll) roll.stop(); roll = V.loop(el, function (dt) { t0 += dt; draw(t0 < 0.45 ? one()[0] : null); if (t0 >= 0.45) { roll.stop(); roll = null; } }); }
      draw();
    }
    function draw(tumble) {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, top = 64, x0 = 34, bw = (w - x0 - 10) / (hi - lo + 1), gh = h - top - 26;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var faces = tumble || (last ? last[0] : null);
      if (faces) faces.forEach(function (v, i) { if (coins) { ctx.save(); ctx.fillStyle = v ? k.gold : k.muted; ctx.beginPath(); ctx.arc(26 + i * 34, 30, 14, 0, TAU); ctx.fill(); ctx.restore(); txt(ctx, v ? 'H' : 'T', 26 + i * 34, 30, { align: 'center', color: '#fff', bold: true, size: 13 }); } else pips(ctx, 10 + i * 46, 8, 38, v, k); });
      if (!faces) txt(ctx, (coins ? 'Flip' : 'Roll') + ' to start.', 12, 30, { size: 14, color: k.ink });
      var mxp = 0; for (var v = lo; v <= hi; v++) mxp = M.max(mxp, prob(v), total ? counts[v] / total : 0);
      var Y = function (p) { return top + gh - p / mxp * gh * 0.95; };
      for (v = lo; v <= hi; v++) {
        var X = x0 + (v - lo) * bw, rf = total ? counts[v] / total : 0;
        ctx.fillStyle = v === ev ? rgba(k.gold, 0.75) : rgba(k.blue, 0.55); ctx.fillRect(X + bw * 0.12, Y(rf), bw * 0.76, top + gh - Y(rf));
        if (o.theory) { ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(X + bw * 0.12, Y(prob(v)), bw * 0.76, top + gh - Y(prob(v))); ctx.restore(); }
        if (bw > 16 || (v - lo) % 2 === 0) txt(ctx, String(v), X + bw / 2, top + gh + 12, { align: 'center', size: 11 });
      }
      axisBars(ctx, k, x0, top, w - x0 - 10, gh);
      var tst = nstep(mxp, gh * 0.8); for (var pv = 0; pv <= mxp + 1e-9; pv += tst) txt(ctx, fm(pv, 3), x0 - 4, Y(pv), { align: 'right', size: 10 });
      txt(ctx, 'relative frequency', x0, top - 8, { size: 11 }); if (o.theory) txt(ctx, '- - true probability', w - 12, top - 8, { size: 11, color: k.red, align: 'right' });
      if (c2) {
        var g2 = c2.ctx, W2 = c2.w, H2 = c2.h, p = prob(ev), GX = function (t) { return 40 + (W2 - 52) * M.log10(t) / M.max(1, M.log10(M.max(10, total))); }, GY = function (q) { return 14 + (H2 - 34) * (1 - q / M.max(0.01, M.min(1, p * 2.5))); };
        g2.fillStyle = k.bg; g2.fillRect(0, 0, W2, H2);
        g2.strokeStyle = k.axis; g2.lineWidth = 1.2; g2.beginPath(); g2.moveTo(40, H2 - 20); g2.lineTo(W2 - 8, H2 - 20); g2.moveTo(40, 8); g2.lineTo(40, H2 - 20); g2.stroke();
        g2.save(); g2.strokeStyle = k.red; g2.setLineDash([5, 4]); g2.beginPath(); g2.moveTo(40, GY(p)); g2.lineTo(W2 - 8, GY(p)); g2.stroke(); g2.restore();
        g2.strokeStyle = k.gold; g2.lineWidth = 2; g2.beginPath(); hist.forEach(function (q, j) { var X2 = GX(q[0]), Y2 = clamp(GY(q[1]), 6, H2 - 20); if (j) g2.lineTo(X2, Y2); else g2.moveTo(X2, Y2); }); g2.stroke();
        txt(g2, 'share of ' + (coins ? 'flips' : 'rolls') + ' with ' + ev + (coins ? ' heads' : '') + ' (log scale of trials)', 46, 10, { size: 11, color: k.ink }); txt(g2, fm(p, 3), 36, GY(p), { align: 'right', size: 10, color: k.red });
        txt(g2, String(M.max(10, total)), W2 - 8, H2 - 8, { align: 'right', size: 10 }); txt(g2, '1', 40, H2 - 8, { size: 10 });
      }
      var s = total ? total + (coins ? ' flips' : ' rolls') + (last ? '; last: ' + last[0].join(coins ? ' ' : ' + ').replace(/1/g, coins ? 'H' : '1').replace(/0/g, coins ? 'T' : '0') + (n > 1 ? ' → ' + last[1] : '') : '') + '.' : 'No ' + (coins ? 'flips' : 'rolls') + ' yet.';
      if (ev != null) s += ' Outcome ' + ev + ': ' + evc + ' times = ' + (total ? fm(evc / total, 3) : '—') + ' of the time; the true probability is ' + pfr(ev) + ' ≈ ' + fm(prob(ev), 3) + '.';
      s += ' ' + (total < 100 ? 'With few trials the bars are bumpy.' : 'With many trials the bars settle near the dashed true probabilities (the law of large numbers).');
      if (!coins && n === 2 && s === 6) s += ' 7 is most likely: 6 of the 36 equally likely pairs add to 7.';
      F.out.set(s);
    }
    redrawOn(c, function () { draw(); }); if (c2) c2.onResize(function () { draw(); }); draw();
    return { draw: draw, roll: go };
  });

  /* normal: areas under a bell curve as probabilities, with z-scores.
     opts:
       mu: 0, sigma: 1               mean and standard deviation (sliders)
       a: -1, b: 1                   the bounds (drag them on the curve)
       shade: "between"             "between", "left" (below b), "right" (above a), "outside"
       rule: false                   show the 68–95–99.7 bands
       zscale: true                  a z-score scale under the x-axis
       sliders: true                 sliders for μ and σ
       xmin, xmax                    the view (default μ ± 4σ from the starting values)
       xlabel: ""                    a name for the x-axis in context, like "height (in)" */
  R('normal', function (el, o) {
    o = opt(o, { mu: 0, sigma: 1, a: -1, b: 1, shade: 'between', rule: false, zscale: true, sliders: true, xlabel: '' });
    var S = { mu: nv(o.mu, 0), sg: nv(o.sigma, 1), a: nv(o.a, -1), b: nv(o.b, 1), shade: o.shade, rule: o.rule };
    var x0 = nv(o.xmin, S.mu - 4 * S.sg), x1 = nv(o.xmax, S.mu + 4 * S.sg), pk = 1 / (S.sg * M.sqrt(TAU));
    var F = frame(el, o, 'Normal distribution areas'), c = F.canvas({ aspect: 2, max: 380, min: 260, narrow: 1.35 }), P = V.plane(c, { xmin: x0, xmax: x1, ymin: -pk * 0.32, ymax: pk * 1.15 });
    function pdf(x) { return M.exp(-0.5 * M.pow((x - S.mu) / S.sg, 2)) / (S.sg * M.sqrt(TAU)); }
    var H = handles(c, P, [{ get: function () { return [S.a, 0]; }, set: function (x) { S.a = M.round(M.min(x, S.b) * 100) / 100; }, off: function () { return S.shade === 'left'; } }, { get: function () { return [S.b, 0]; }, set: function (x) { S.b = M.round(M.max(x, S.a) * 100) / 100; }, off: function () { return S.shade === 'right'; } }], { change: draw, step: S.sg / 10, r: 30 });
    c.cv.setAttribute('aria-label', 'Normal curve. Arrow keys move the bound; Enter switches bounds.');
    V.seg(F.ctl, { label: 'Area', items: [['left', 'Left of b'], ['between', 'Between'], ['right', 'Right of a'], ['outside', 'Outside']], value: S.shade, change: function (q) { S.shade = q; draw(); } });
    check(F.ctl, '68–95–99.7', S.rule, function (v) { S.rule = v; draw(); });
    if (o.sliders) { var r2 = F.row(); V.slider(r2, { label: 'mean μ', min: x0 + (x1 - x0) * 0.2, max: x1 - (x1 - x0) * 0.2, step: S.sg / 10, value: S.mu, input: function (v) { S.mu = v; draw(); } }); V.slider(r2, { label: 'standard deviation σ', min: S.sg * 0.3, max: S.sg * 2.5, step: S.sg / 20, value: S.sg, input: function (v) { S.sg = v; draw(); } }); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, v = P.view(), za = (S.a - S.mu) / S.sg, zb = (S.b - S.mu) / S.sg, area, from, to;
      P.clear();
      ctx.save(); ctx.strokeStyle = k.grid; ctx.lineWidth = 1; var st = S.sg; for (var x = S.mu - 6 * st; x <= S.mu + 6 * st; x += st) { ctx.beginPath(); ctx.moveTo(P.X(x), P.Y(0)); ctx.lineTo(P.X(x), P.Y(pk * 1.1)); ctx.stroke(); } ctx.restore();
      var sh = { left: [[v.xmin, S.b]], right: [[S.a, v.xmax]], between: [[S.a, S.b]], outside: [[v.xmin, S.a], [S.b, v.xmax]] }[S.shade];
      sh.forEach(function (r) { if (r[1] > r[0]) P.shade(pdf, null, r[0], r[1], { fill: rgba(k.green, 0.4) }); });
      area = S.shade === 'left' ? Phi(zb) : S.shade === 'right' ? 1 - Phi(za) : S.shade === 'between' ? Phi(zb) - Phi(za) : Phi(za) + 1 - Phi(zb);
      P.seg(v.xmin, 0, v.xmax, 0, { color: 'axis', width: 1.5 });
      P.plot(pdf, { color: 'blue', width: 3 });
      P.seg(S.mu, 0, S.mu, pdf(S.mu), { color: 'muted', width: 1.2, dash: [4, 4] });
      if (S.rule) [[1, '68%'], [2, '95%'], [3, '99.7%']].forEach(function (q) { var yv = pdf(S.mu + q[0] * S.sg) + pk * 0.03, xa = P.X(S.mu - q[0] * S.sg), xb = P.X(S.mu + q[0] * S.sg), yy = P.Y(yv); arrowPx(ctx, (xa + xb) / 2, yy, xa, yy, k.purple, 1.6, 7); arrowPx(ctx, (xa + xb) / 2, yy, xb, yy, k.purple, 1.6, 7); label(ctx, q[1], q[0] === 3 ? M.min(xb, c.w - 30) - 22 : (xa + xb) / 2, yy - 10, { size: 11, color: k.purple }); });
      // axis labels in x and z
      for (var j = -4; j <= 4; j++) { var xx = S.mu + j * S.sg, pxx = P.X(xx); if (pxx < 14 || pxx > c.w - 14) continue; txt(ctx, fm(xx, 2), pxx, P.Y(0) + 11, { align: 'center', size: 11, color: k.ink }); if (o.zscale) txt(ctx, (j < 0 ? '−' : '') + M.abs(j), pxx, P.Y(0) + 27, { align: 'center', size: 10, color: k.muted }); }
      if (o.zscale) txt(ctx, 'z', 6, P.Y(0) + 27, { italic: true, size: 12, color: k.muted });
      if (o.xlabel) txt(ctx, o.xlabel, c.w - 8, P.Y(0) - 10, { align: 'right', size: 12, italic: true, color: k.ink });
      [[S.a, 'a', S.shade !== 'left'], [S.b, 'b', S.shade !== 'right']].forEach(function (q) { if (!q[2]) return; P.seg(q[0], 0, q[0], pdf(q[0]), { color: 'green', width: 2.5 }); knob(ctx, P.X(q[0]), P.Y(0), k.green, 7); label(ctx, q[1] + ' = ' + fm(q[0], 2), P.X(q[0]), P.Y(pdf(q[0])) - 14, { color: k.green, size: 12, clampW: c.w, clampH: c.h }); });
      H.draw(ctx);
      var zf = function (z) { return fm(z, 2); }, s;
      if (S.shade === 'left') s = 'P(<i>X</i> &lt; ' + fm(S.b, 2) + ') = P(<i>Z</i> &lt; ' + zf(zb) + ')';
      else if (S.shade === 'right') s = 'P(<i>X</i> &gt; ' + fm(S.a, 2) + ') = P(<i>Z</i> &gt; ' + zf(za) + ') = 1 − Φ(' + zf(za) + ')';
      else if (S.shade === 'between') s = 'P(' + fm(S.a, 2) + ' &lt; <i>X</i> &lt; ' + fm(S.b, 2) + ') = Φ(' + zf(zb) + ') − Φ(' + zf(za) + ')';
      else s = 'P(<i>X</i> &lt; ' + fm(S.a, 2) + ' or <i>X</i> &gt; ' + fm(S.b, 2) + ')';
      s += ' = <b>' + fm(area, 4) + '</b> (' + fm(area * 100, 2) + '% of the area). z-scores: <i>z</i> = (<i>x</i> − μ)/σ' + (S.shade !== 'left' ? ', a → ' + zf(za) : '') + (S.shade !== 'right' ? ', b → ' + zf(zb) : '') + ' (μ = ' + fm(S.mu, 2) + ', σ = ' + fm(S.sg, 2) + '). The whole area under the curve is 1.';
      if (S.rule) s += ' About 68% lies within 1σ of the mean, 95% within 2σ, and 99.7% within 3σ.';
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* sampling: a sampling distribution built one sample at a time (the central limit theorem).
     opts:
       pop: "skewed"                "skewed", "uniform", "bimodal", "die" or "coin" (then the statistic is a proportion)
       pops: [ … ]                  the populations offered (default all)
       n: 5                          sample size (slider 1 … 50)
       seed: 0                       repeatable draws when not 0 */
  var POPS = {
    skewed: { name: 'Skewed', v: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], w: [30, 22, 16, 11, 8, 5, 3, 2, 1.5, 1, 0.5] },
    uniform: { name: 'Uniform', v: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], w: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    bimodal: { name: 'Two humps', v: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], w: [2, 10, 16, 8, 2, 1, 2, 8, 16, 10, 2] },
    die: { name: 'One die', v: [1, 2, 3, 4, 5, 6], w: [1, 1, 1, 1, 1, 1] },
    coin: { name: 'Coin (heads = 1)', v: [0, 1], w: [1, 1] }
  };
  R('sampling', function (el, o) {
    o = opt(o, { pop: 'skewed', pops: ['skewed', 'uniform', 'bimodal', 'die', 'coin'], n: 5, seed: 0 });
    var S = { pop: POPS[o.pop] ? o.pop : 'skewed', n: clamp(o.n, 1, 50) }, rnd = rng(o.seed || 0), means = [], lastS = null;
    var F = frame(el, o, 'Sampling distribution of the sample mean'), c = F.canvas({ aspect: 1.2, max: 560, min: 430, narrow: false });
    scrollOK(c);
    if (o.pops.length > 1) V.seg(F.ctl, { label: 'Population', items: o.pops.map(function (q) { return [q, POPS[q].name]; }), value: S.pop, change: function (q) { S.pop = q; means = []; lastS = null; draw(); } });
    var r2 = F.row(); V.slider(r2, { label: 'sample size n', min: 1, max: 50, step: 1, value: S.n, input: function (v) { S.n = v; means = []; lastS = null; draw(); } });
    var bt = mk('div', 'mla-btns'); r2.appendChild(bt);
    [1, 10, 100, 1000].forEach(function (q) { V.button(bt, q === 1 ? 'Take 1 sample' : '+' + q, function () { for (var i = 0; i < q; i++) take(); draw(); }, q === 1 ? 'pri' : ''); });
    V.button(bt, 'Reset', function () { means = []; lastS = null; draw(); });
    function popStats() { var p = POPS[S.pop], tw = p.w.reduce(function (a, b) { return a + b; }, 0), mu = 0, v2 = 0; p.v.forEach(function (x, i) { mu += x * p.w[i] / tw; }); p.v.forEach(function (x, i) { v2 += (x - mu) * (x - mu) * p.w[i] / tw; }); return { mu: mu, sd: M.sqrt(v2), tw: tw, p: p }; }
    function draw1(st) { var r = rnd() * st.tw, acc = 0; for (var i = 0; i < st.p.v.length; i++) { acc += st.p.w[i]; if (r < acc) return st.p.v[i]; } return st.p.v[st.p.v.length - 1]; }
    function take() { var st = popStats(), sm = []; for (var i = 0; i < S.n; i++) sm.push(draw1(st)); lastS = sm; means.push(sm.reduce(function (a, b) { return a + b; }, 0) / S.n); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, st = popStats(), p = st.p, lo = p.v[0], hi = p.v[p.v.length - 1], L = 36, Rr = w - 14, X = function (x) { return L + (Rr - L) * (x - lo + 0.5) / (hi - lo + 1); };
      var h1 = h * 0.24, h2 = h * 0.16, y1 = 22, y2 = y1 + h1 + 26, y3 = y2 + h2 + 26, h3 = h - y3 - 22;
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      var bw = (Rr - L) / (hi - lo + 1), mw = M.max.apply(null, p.w);
      txt(ctx, 'Population: μ = ' + fm(st.mu, 3) + ', σ = ' + fm(st.sd, 3), L, y1 - 10, { size: 12, color: k.ink });
      p.v.forEach(function (x, i) { var bh = p.w[i] / mw * h1; ctx.fillStyle = rgba(k.teal, 0.5); ctx.fillRect(X(x) - bw * 0.4, y1 + h1 - bh, bw * 0.8, bh); });
      axisBars(ctx, k, L, y1, Rr - L, h1);
      txt(ctx, lastS ? 'Latest sample of ' + S.n + ' (its mean in gold)' : 'Take a sample', L, y2 - 10, { size: 12, color: k.ink });
      ctx.save(); ctx.strokeStyle = k.axis; ctx.beginPath(); ctx.moveTo(L, y2 + h2); ctx.lineTo(Rr, y2 + h2); ctx.stroke(); ctx.restore();
      if (lastS) { var stack = {}; lastS.forEach(function (x) { stack[x] = (stack[x] || 0) + 1; var r = M.min(5, bw * 0.3); ctx.fillStyle = k.teal; ctx.beginPath(); ctx.arc(X(x), y2 + h2 - r - (stack[x] - 1) * r * 2.1, r, 0, TAU); ctx.fill(); }); var mL = means[means.length - 1]; ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(mL), y2 - 4); ctx.lineTo(X(mL), y2 + h2); ctx.stroke(); ctx.restore(); }
      txt(ctx, (S.pop === 'coin' ? 'Sample proportions of heads: ' : 'Sample means: ') + means.length + ' so far', L, y3 - 10, { size: 12, color: k.ink });
      // histogram of means with fine bins
      // sample means of whole numbers sit on a lattice of step 1/n, so bins are whole multiples of it (no aliasing)
      var unit = 1 / S.n, bwx = unit * M.max(1, M.round((hi - lo + 1) / M.min(60, M.max(12, (Rr - L) / 9)) / unit)), b0 = lo - unit / 2, nb = M.ceil((hi - lo + unit) / bwx), bins = new Array(nb).fill(0);
      means.forEach(function (m) { var b = clamp(M.floor((m - b0) / bwx + 1e-9), 0, nb - 1); bins[b]++; });
      var se = st.sd / M.sqrt(S.n), peak = bwx / (se * M.sqrt(TAU)), mb = M.max(M.max.apply(null, bins) / M.max(1, means.length), M.min(peak, 1), 1e-9) * 1.05;
      var pxw = bwx * (X(1) - X(0)); bins.forEach(function (cnt, j) { if (!cnt) return; var f = cnt / means.length / mb * h3; ctx.fillStyle = rgba(k.gold, 0.75); ctx.fillRect(X(b0 + j * bwx) + 0.5, y3 + h3 - f, M.max(1, pxw - 1), f); });
      if (means.length >= 20 && se > 0) { ctx.save(); ctx.strokeStyle = k.red; ctx.lineWidth = 2.2; ctx.beginPath(); for (var i = 0; i <= 200; i++) { var x = lo - 0.5 + (hi - lo + 1) * i / 200, d = M.exp(-0.5 * M.pow((x - st.mu) / se, 2)) * peak / mb * h3; if (i) ctx.lineTo(L + (Rr - L) * i / 200, y3 + h3 - d); else ctx.moveTo(L, y3 + h3 - d); } ctx.stroke(); ctx.restore(); }
      axisBars(ctx, k, L, y3, Rr - L, h3);
      p.v.forEach(function (x) { if (bw > 18 || x % 2 === 0) txt(ctx, String(x), X(x), y3 + h3 + 11, { align: 'center', size: 10 }); });
      ctx.save(); ctx.strokeStyle = k.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(st.mu), y1); ctx.lineTo(X(st.mu), y3 + h3); ctx.stroke(); ctx.restore();
      var mm = means.length ? means.reduce(function (a, b) { return a + b; }, 0) / means.length : NaN, sdm = means.length > 1 ? M.sqrt(means.reduce(function (a, b) { return a + (b - mm) * (b - mm); }, 0) / (means.length - 1)) : NaN;
      F.out.set('Each gold bar counts sample means. Mean of the sample means: ' + (means.length ? fm(mm, 3) : '—') + ' (population μ = ' + fm(st.mu, 3) + '). Their spread: ' + (means.length > 1 ? fm(sdm, 3) : '—') + ' (theory σ/√<i>n</i> = ' + fm(st.sd, 3) + '/√' + S.n + ' = ' + fm(se, 3) + '). ' + (means.length >= 100 ? (S.n >= 10 ? 'Even from a ' + p.name.toLowerCase() + ' population, the means pile up in a bell shape (red curve): the central limit theorem.' : 'Make <i>n</i> bigger and the shape gets closer to the red bell curve, and narrower.') : 'Take many samples to see the shape.'));
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* scatter: a scatter plot with the least-squares line and its residuals.
     opts:
       points: [[1, 2], [2, 3.5], …] the data (default: a small study-hours data set)
       fit: true                     draw the least-squares line ŷ = a + bx
       residuals: true               vertical residual segments
       squares: false                draw the squared residuals as squares (what “least squares” minimizes)
       userLine: false               a line of your own with two handles, with its sum of squared errors
       editable: true                drag points; tap empty space to add one; the Remove button deletes the selected one
       quiet: false                  true: the readout explains in words only (no equation, r, r² or squared errors)
       xmin…ymax                     (default: fit the data); xlabel, ylabel */
  var STUDY = [[1, 52], [2, 58], [2.5, 55], [3, 64], [4, 66], [4.5, 70], [5, 71], [6, 79], [6.5, 76], [7, 85], [8, 88]];
  function linfit(pts) { var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0; pts.forEach(function (p) { sx += p[0]; sy += p[1]; sxx += p[0] * p[0]; sxy += p[0] * p[1]; syy += p[1] * p[1]; }); var dxx = sxx - sx * sx / n, dxy = sxy - sx * sy / n, dyy = syy - sy * sy / n, b = dxy / dxx, a = sy / n - b * sx / n; return { a: a, b: b, r: dxy / M.sqrt(dxx * dyy), ok: n >= 2 && dxx > 1e-12 }; }
  R('scatter', function (el, o) {
    o = opt(o, { points: STUDY, fit: true, residuals: true, squares: false, userLine: false, editable: true, xlabel: o.points ? 'x' : 'hours studied', ylabel: o.points ? 'y' : 'score' });
    var quiet = !!(o.quiet || o.readout === false);
    var pts = o.points.map(function (p) { return [nv(p[0], 0), nv(p[1], 0)]; }), S = { fit: o.fit, res: o.residuals, sq: o.squares, ul: o.userLine };
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; }), xa = M.min.apply(null, xs), xb = M.max.apply(null, xs), ya = M.min.apply(null, ys), yb = M.max.apply(null, ys), px = (xb - xa) * 0.12 || 1, py = (yb - ya) * 0.15 || 1;
    var F = frame(el, o, 'Scatter plot with a regression line', { quietSay: true }), c = F.canvas({ aspect: 1.5 }), P = V.plane(c, win(o, [xa - px, xb + px, ya - py, yb + py]));
    var fitL = linfit(pts), U = [[xa, fitL.a + fitL.b * xa + py * 0.8], [xb, fitL.a + fitL.b * xb - py * 0.8]];
    function list() { var l = []; if (o.editable) pts.forEach(function (p, i) { l.push({ get: function () { return pts[i]; }, set: function (x, y) { pts[i] = [x, y]; } }); }); if (S.ul) U.forEach(function (q, i) { l.push({ get: function () { return U[i]; }, set: function (x, y) { U[i] = [x, y]; } }); }); return l; }
    var HL = list(), H = handles(c, P, HL, { change: draw, r: 20, free: o.editable ? function (px2, py2) { return 'add'; } : null, freeStart: function (h, px2, py2) { pts.push([P.x(px2), P.y(py2)]); refresh(); H.sel(pts.length - 1); draw(); }, freeMove: function (h, px2, py2) { pts[pts.length - 1] = [P.x(px2), P.y(py2)]; draw(); } });
    function refresh() { var nl = list(); HL.length = 0; nl.forEach(function (q) { HL.push(q); }); }
    c.cv.setAttribute('aria-label', 'Scatter plot. Arrow keys move the selected point; Enter selects the next point.');
    check(F.ctl, 'Best-fit line', S.fit, function (v) { S.fit = v; draw(); });
    check(F.ctl, 'Residuals', S.res, function (v) { S.res = v; draw(); });
    check(F.ctl, 'Squares', S.sq, function (v) { S.sq = v; draw(); });
    check(F.ctl, 'My own line', S.ul, function (v) { S.ul = v; refresh(); draw(); });
    if (o.editable) V.button(F.ctl, 'Remove selected point', function () { var i = H.cur(); if (i < pts.length && pts.length > 2) { pts.splice(i, 1); refresh(); H.sel(0); draw(); } });
    function draw() {
      var k = V.colors(), ctx = c.ctx, L = linfit(pts), sse = 0, ssu = 0, mU = (U[1][1] - U[0][1]) / ((U[1][0] - U[0][0]) || 1e-9), bU = U[0][1] - mU * U[0][0];
      P.clear(); P.grid(); P.axes({ x: o.xlabel, y: o.ylabel });
      pts.forEach(function (p) { var yh = L.a + L.b * p[0], r = p[1] - yh; sse += r * r; var ru = p[1] - (bU + mU * p[0]); ssu += ru * ru;
        if (S.sq && S.fit) { var side = M.abs(r) * (P.Y(0) - P.Y(1)) / P.unit; P.poly([[p[0], yh], [p[0], p[1]], [p[0] + side, p[1]], [p[0] + side, yh]], { fill: rgba(r > 0 ? k.green : k.red, 0.16), color: r > 0 ? 'green' : 'red', width: 1 }); }
        if (S.res && S.fit) P.seg(p[0], p[1], p[0], yh, { color: r > 0 ? 'green' : 'red', width: 2 }); });
      if (S.fit && L.ok) P.plot(function (x) { return L.a + L.b * x; }, { color: 'blue', width: 3 });
      if (S.ul) { P.plot(function (x) { return bU + mU * x; }, { color: 'orange', width: 2.5, dash: [8, 5] }); U.forEach(function (q) { knob(ctx, P.X(q[0]), P.Y(q[1]), k.orange, 6); }); }
      pts.forEach(function (p) { P.point(p[0], p[1], { color: 'ink', r: 5 }); });
      H.draw(ctx);
      var s = pts.length + ' points. ';
      if (quiet) { // words only: no equation, r, r² or sums of squares
        if (L.ok && S.fit) s += 'The blue line is the least-squares line: no other line makes the sum of the squared residuals smaller. Residual = actual − predicted (<span class="mla-g">above the line +</span>, <span class="mla-r">below −</span>).';
        if (S.ul) s += '<br><span style="color:' + k.orange + ';font-weight:700">Your line</span> ' + (ssu - sse < 0.005 * sse + 1e-9 ? 'fits as well as the best line!' : 'has a bigger squared error than the best line. Drag its handles to shrink it.');
        F.out.set(s); return;
      }
      if (L.ok) s += 'Least-squares line: <span class="mla-b">ŷ = ' + fm(L.a, 3) + (L.b < 0 ? ' − ' : ' + ') + fm(M.abs(L.b), 3) + '<i>x</i></span>. Slope ' + fm(L.b, 3) + ': each extra unit of <i>x</i> adds about ' + fm(L.b, 3) + ' to the predicted <i>y</i>. Correlation <i>r</i> = ' + fm(L.r, 3) + ', <i>r</i>² = ' + fm(L.r * L.r, 3) + '. Residual = actual − predicted (<span class="mla-g">above the line +</span>, <span class="mla-r">below −</span>); the sum of squared residuals is ' + fm(sse, 3) + ', the smallest any line can make.';
      if (S.ul) s += '<br><span style="color:' + k.orange + ';font-weight:700">Your line</span> ŷ = ' + fm(bU, 3) + (mU < 0 ? ' − ' : ' + ') + fm(M.abs(mU), 3) + '<i>x</i> has squared error ' + fm(ssu, 3) + (ssu - sse < 0.005 * sse + 1e-9 ? ': as good as the best line!' : ' (' + fm(ssu - sse, 3) + ' more than the best).');
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });

  /* venn: two or three events in a sample space; tap regions to build an event and read its probability.
     opts:
       sets: 2                       2 or 3
       labels: ["A", "B", "C"]
       counts: {"a": 12, "b": 8, "ab": 5, "n": 15}   counts of the separate regions: a = A only, b = B only, ab = both,
                                     n = neither (for 3 sets also c, ac, bc, abc). Or probs: {…} with the same keys.
       shade: "A∪B"                  starting event: "A", "B", "A∩B", "A∪B", "A′", "A∩B′", "A|B" (conditional), or a list of region keys
       presets: ["A∪B", "A∩B", "A′", "A∩B′", "A|B"]   the event buttons offered
       target: "A∩B′"                with task: the event to shade */
  R('venn', function (el, o) {
    o = opt(o, { sets: 2, labels: ['A', 'B', 'C'], shade: 'A∪B', presets: null });
    var three = o.sets === 3, keys = three ? ['a', 'b', 'c', 'ab', 'ac', 'bc', 'abc', 'n'] : ['a', 'b', 'ab', 'n'], src = o.probs || o.counts || (three ? { a: 10, b: 8, c: 7, ab: 4, ac: 3, bc: 2, abc: 1, n: 5 } : { a: 12, b: 8, ab: 5, n: 15 });
    var isP = !!o.probs, val = {}; keys.forEach(function (q) { val[q] = nv(src[q], 0); }); var tot = keys.reduce(function (s, q) { return s + val[q]; }, 0);
    var Lb = o.labels, sel = {}, given = null, cur = 0;
    var presets = o.presets || (three ? ['A∪B∪C', 'A∩B∩C', 'A∩B', 'A′', 'A|B'] : ['A∪B', 'A∩B', 'A′', 'A∩B′', 'A|B']);
    function regionsOf(ev) { // event text -> region keys and optional given
      var inS = function (r, ch) { return r.indexOf(ch) >= 0; }, nm2 = ev.replace(/\s/g, ''), L0 = Lb[0], L1 = Lb[1], L2 = Lb[2];
      var map = function (s2) { return s2.split(L0).join('A').split(L1).join('B').split(L2 || '§').join('C'); }; nm2 = map(nm2);
      var g = null; if (nm2.indexOf('|') >= 0) { var pr = nm2.split('|'); nm2 = pr[0]; g = pr[1]; }
      function test(r, e) { // tiny evaluator: A B C, ′, ∩, ∪, parentheses
        var i = 0; function atom() { var v; if (e[i] === '(') { i++; v = un(); i++; } else { var ch = e[i++]; v = ch === 'A' ? inS(r, 'a') : ch === 'B' ? inS(r, 'b') : ch === 'C' ? inS(r, 'c') : false; } while (e[i] === '′' || e[i] === "'") { v = !v; i++; } return v; }
        function inter() { var v = atom(); while (e[i] === '∩') { i++; v = atom() && v; } return v; } function un() { var v = inter(); while (e[i] === '∪') { i++; v = inter() || v; } return v; } return un();
      }
      var out = keys.filter(function (r) { return test(r === 'n' ? '' : r, nm2); });
      return { r: out, g: g ? keys.filter(function (r) { return test(r === 'n' ? '' : r, g); }) : null };
    }
    function setEv(ev) { sel = {}; given = null; if (Array.isArray(ev)) ev.forEach(function (q) { sel[q] = 1; }); else if (ev) { var q = regionsOf(ev); q.r.forEach(function (x) { sel[x] = 1; }); if (q.g) { given = {}; q.g.forEach(function (x) { given[x] = 1; }); } } }
    setEv(o.shade);
    var F = frame(el, o, 'Venn diagram of events'), c = F.canvas({ aspect: 1.6, max: 400, narrow: 1.25 }), geo = {};
    V.seg(F.ctl, { label: 'Event', items: presets.map(function (q) { return [q, q.replace(/A/g, Lb[0]).replace(/B/g, Lb[1]).replace(/C/g, Lb[2] || 'C')]; }), value: typeof o.shade === 'string' ? o.shade : '', change: function (q) { setEv(q); draw(); } });
    V.button(F.ctl, 'Clear', function () { sel = {}; given = null; draw(); });
    function layout() { var w = c.w, h = c.h, R2 = M.min(w * 0.22, h * (three ? 0.3 : 0.36)); geo.R = R2; geo.c = three ? [[w / 2 - R2 * 0.6, h * 0.42], [w / 2 + R2 * 0.6, h * 0.42], [w / 2, h * 0.42 + R2 * 0.95]] : [[w / 2 - R2 * 0.62, h / 2], [w / 2 + R2 * 0.62, h / 2]]; if (three) { var sh2 = h / 2 - (h * 0.42 + R2 * 0.95 / 2); geo.c.forEach(function (p) { p[1] += sh2 - 6; }); } }
    function regionAt(px, py) { var m = geo.c.map(function (p) { return M.hypot(px - p[0], py - p[1]) < geo.R; }); var s = (m[0] ? 'a' : '') + (m[1] ? 'b' : '') + (three && m[2] ? 'c' : ''); if (px < 8 || py < 8 || px > c.w - 8 || py > c.h - 8) return null; return s || 'n'; }
    function centroid(r) { var sx = 0, sy = 0, n = 0; for (var i = 0; i < 40; i++) for (var j = 0; j < 30; j++) { var x = c.w * (i + 0.5) / 40, y = c.h * (j + 0.5) / 30; if (regionAt(x, y) === r) { sx += x; sy += y; n++; } } if (r === 'n') return [c.w - 40, 24]; return n ? [sx / n, sy / n] : [0, 0]; }
    var cents = {};
    function recalc() { layout(); keys.forEach(function (r) { cents[r] = centroid(r); }); }
    recalc(); c.onResize(function () { recalc(); draw(); }); V.onTheme(draw);
    V.drag(c.cv, { hit: function (px, py) { return regionAt(px, py); }, start: function (r) { if (sel[r]) delete sel[r]; else sel[r] = 1; given = null; draw(); }, move: function () { } });
    c.cv.style.touchAction = 'pan-y'; c.cv.tabIndex = 0; c.cv.setAttribute('aria-label', 'Venn diagram. Arrow keys pick a region; Enter or Space shades it or clears it.');
    c.cv.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { cur = (cur + 1) % keys.length; draw(); e.preventDefault(); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { cur = (cur + keys.length - 1) % keys.length; draw(); e.preventDefault(); } else if (e.key === 'Enter' || e.key === ' ') { var r = keys[cur]; if (sel[r]) delete sel[r]; else sel[r] = 1; given = null; draw(); e.preventDefault(); } });
    var foc = false; c.cv.addEventListener('focus', function () { foc = true; draw(); }); c.cv.addEventListener('blur', function () { foc = false; draw(); });
    function clipRegion(ctx, r) { // clip to one region: inside the listed circles, outside the others
      ['a', 'b', 'c'].slice(0, three ? 3 : 2).forEach(function (ch, i) { var p = geo.c[i]; ctx.beginPath(); if (r.indexOf(ch) >= 0) ctx.arc(p[0], p[1], geo.R, 0, TAU); else { ctx.rect(0, 0, c.w, c.h); ctx.arc(p[0], p[1], geo.R, 0, TAU, true); } ctx.clip('evenodd'); });
    }
    function sum(set) { return keys.reduce(function (s, q) { return s + (set[q] ? val[q] : 0); }, 0); }
    function fmtv(v) { return isP ? fm(v, 4) : fm(v, 2); }
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h;
      ctx.fillStyle = given ? k.panel : k.bg; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = k.ink; ctx.lineWidth = 2; ctx.strokeRect(4, 4, w - 8, h - 8); ctx.restore();
      txt(ctx, 'S', 12, 18, { italic: true, size: 15, color: k.ink });
      if (given) keys.forEach(function (r) { if (!given[r]) return; ctx.save(); clipRegion(ctx, r === 'n' ? '' : r); if (r === 'n') { ctx.beginPath(); ctx.rect(4, 4, w - 8, h - 8); ctx.clip(); } ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h); ctx.fillStyle = rgba(k.blue, 0.12); ctx.fillRect(0, 0, w, h); ctx.restore(); });
      keys.forEach(function (r) { if (!sel[r]) return; ctx.save(); clipRegion(ctx, r === 'n' ? '' : r); ctx.fillStyle = rgba(k.green, given && !given[r] ? 0.12 : 0.45); ctx.fillRect(4, 4, w - 8, h - 8); ctx.restore(); });
      geo.c.forEach(function (p, i) { ctx.save(); ctx.strokeStyle = [k.blue, k.red, k.purple][i]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p[0], p[1], geo.R, 0, TAU); ctx.stroke(); ctx.restore(); var lx = p[0] + (i === 0 ? -geo.R * 0.75 : i === 1 ? geo.R * 0.75 : 0), ly = p[1] + (i === 2 ? geo.R * 0.8 : -geo.R * 0.8); txt(ctx, Lb[i], lx, ly, { align: 'center', italic: true, size: 17, color: [k.blue, k.red, k.purple][i] }); });
      keys.forEach(function (r, i) { var q = cents[r]; label(ctx, fmtv(val[r]), q[0], q[1], { bold: !!sel[r], size: 13 }); if (foc && i === cur) { ctx.save(); ctx.strokeStyle = k.gold; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(q[0], q[1], 18, 0, TAU); ctx.stroke(); ctx.restore(); } });
      var pE = sum(sel), A2 = {}, B2 = {}, AB = {}; keys.forEach(function (r) { if (r.indexOf('a') >= 0 && r !== 'n') A2[r] = 1; if (r.indexOf('b') >= 0) B2[r] = 1; if (r.indexOf('a') >= 0 && r.indexOf('b') >= 0) AB[r] = 1; });
      var P2 = function (v) { return isP ? fm(v, 4) : fr(v / tot, 4, M.max(12, M.round(tot))); }, s;
      if (given) { var pg = sum(given), both = {}; keys.forEach(function (r) { if (sel[r] && given[r]) both[r] = 1; }); s = 'Given the blue region (' + fmtv(pg) + (isP ? '' : ' of ' + fmtv(tot)) + '), the sample space shrinks to it. P(event | given) = P(both) / P(given) = ' + P2(sum(both)) + ' / ' + P2(pg) + ' = <b>' + (pg ? fm(sum(both) / pg, 4) : '—') + '</b>' + (isP ? '' : ' (' + fmtv(sum(both)) + ' out of ' + fmtv(pg) + ')') + '.'; }
      else s = 'Shaded: ' + (isP ? 'probability ' : fmtv(pE) + ' of ' + fmtv(tot) + ' outcomes, so P = ') + '<b>' + (isP ? fm(pE, 4) : P2(pE) + (P2(pE).indexOf('/') >= 0 ? ' ≈ ' + fm(pE / tot, 3) : '')) + '</b>.';
      if (!three && !given) { var pa = sum(A2), pb = sum(B2), pab = sum(AB); s += ' Check: P(' + Lb[0] + ' ∪ ' + Lb[1] + ') = P(' + Lb[0] + ') + P(' + Lb[1] + ') − P(' + Lb[0] + ' ∩ ' + Lb[1] + ') = ' + P2(pa) + ' + ' + P2(pb) + ' − ' + P2(pab) + ' = ' + P2(pa + pb - pab) + ': subtract the overlap because it was counted twice.'; }
      F.out.set(s);
      if (o.target) { var tq = regionsOf(o.target); F.done(tq.r.length === Object.keys(sel).length && tq.r.every(function (r) { return sel[r]; })); }
    }
    draw();
    return { draw: draw };
  });

  /* tree: a probability tree; multiply along branches, add the outcomes you pick, and condition (Bayes).
     opts:
       tree: {"kids": [{"label": "Rain", "p": "0.3", "kids": [{"label": "Late", "p": "0.4"}, {"label": "On time", "p": "0.6"}]},
                        {"label": "Dry", "p": "0.7", "kids": [{"label": "Late", "p": "0.1"}, {"label": "On time", "p": "0.9"}]}]}
       levels: [["H", "T"], ["H", "T"]], probs: …   a shorthand: the same choices at every level; probs per level
                                     (a list per level, or for level 2+ a list of lists, one per parent branch). Default: fair.
       select: ["Rain/Late"]         outcomes (paths joined with /) selected at the start
       given: ["Rain/Late", "Dry/Late"]  outcomes in the condition, for P(event | given)
       Probabilities can be fractions as strings ("1/3"); products then stay exact. */
  function q(s) { // a probability as an exact fraction [n, d] when possible
    s = String(s).trim(); var m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(s); if (m) return [+m[1], +m[2]];
    var x = nv(s, NaN); if (!isFinite(x)) return [0, 1]; var r = ratio(x, 1000); if (r) return r; var d = M.pow(10, M.min(8, (String(s).split('.')[1] || '').length)); return [M.round(x * d), d];
  }
  function qm(a, b) { var n = a[0] * b[0], d = a[1] * b[1], g = gcd(n, d) || 1; return [n / g, d / g]; }
  function qa(a, b) { var n = a[0] * b[1] + b[0] * a[1], d = a[1] * b[1], g = gcd(n, d) || 1; return [n / g, d / g]; }
  function qs(a) { return a[1] === 1 ? String(a[0]) : a[0] + '/' + a[1]; }
  function qv(a) { return a[0] / a[1]; }
  R('tree', function (el, o) {
    o = opt(o, {});
    var root = o.tree;
    if (!root) {
      var lv = o.levels || [['H', 'T'], ['H', 'T']], pr = o.probs || [];
      var build = function (d, idx) { if (d >= lv.length) return null; return lv[d].map(function (lab, i) { var pl = pr[d], p = pl == null ? '1/' + lv[d].length : Array.isArray(pl[0]) ? (pl[idx] || [])[i] : pl[i]; return { label: lab, p: p == null ? '1/' + lv[d].length : p, kids: build(d + 1, i) }; }); };
      root = { kids: build(0, 0) };
    }
    var leaves = [];
    (function walk(n, path, pp, depth) { (n.kids || []).forEach(function (kd) { var p2 = qm(pp, q(kd.p)), pa = path.concat([kd.label]); kd._p = p2; kd._depth = depth + 1; if (kd.kids && kd.kids.length) walk(kd, pa, p2, depth + 1); else { kd._path = pa.join('/'); leaves.push(kd); } }); })(root, [], [1, 1], 0);
    var depth = 0; leaves.forEach(function (l) { depth = M.max(depth, l._depth); });
    var sel = {}, giv = {}; (o.select || []).forEach(function (s) { sel[s] = 1; }); (o.given || []).forEach(function (s) { giv[s] = 1; }); var mode = 'event';
    var F = frame(el, o, 'Probability tree'), c = F.canvas({ height: M.max(220, leaves.length * 40 + 30), max: 900 });
    scrollOK(c);
    V.seg(F.ctl, { label: 'Clicking an outcome adds it to', items: [['event', 'The event'], ['given', 'The condition']], value: mode, change: function (v) { mode = v; } });
    V.button(F.ctl, 'Clear', function () { sel = {}; giv = {}; draw(); });
    var lb = mk('div', 'mla-btns'); el.insertBefore(lb, F.out.el); lb.setAttribute('role', 'group'); lb.setAttribute('aria-label', 'Outcomes');
    var lbtn = leaves.map(function (l) { var b = V.button(lb, esc(l._path.replace(/\//g, ' → ')) + (F.quiet ? '' : ': ' + qs(l._p)), function () { toggle(l); }); b.setAttribute('aria-pressed', 'false'); return b; }); // quiet: no outcome probabilities
    function toggle(l) { var set = mode === 'event' ? sel : giv; if (set[l._path]) delete set[l._path]; else set[l._path] = 1; draw(); }
    var pos = [];
    V.drag(c.cv, { hit: function (px, py) { for (var i = 0; i < pos.length; i++) if (M.abs(py - pos[i][1]) < 18 && px > pos[i][0] - 30) return i; return null; }, start: function (i) { toggle(leaves[i]); }, move: function () { } });
    c.cv.style.touchAction = 'pan-y'; c.cv.setAttribute('aria-hidden', 'true');
    function draw() {
      var k = V.colors(), ctx = c.ctx, w = c.w, h = c.h, li = 0; pos = [];
      ctx.fillStyle = k.bg; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.font = '700 13px system-ui,sans-serif';
      var labW = []; (function mw(n, d) { (n.kids || []).forEach(function (kd) { labW[d] = M.max(labW[d] || 0, ctx.measureText(kd.label).width); mw(kd, d + 1); }); })(root, 0);
      ctx.font = '700 12px system-ui,sans-serif';
      var ptxt = function (l, full) { if (F.quiet) return ''; var a = qs(l._p); return full && (a.indexOf('/') >= 0 || String(qv(l._p)).length > 6) ? a + ' ≈ ' + fm(qv(l._p), 3) : a; };
      var full = true, probW = 0; leaves.forEach(function (l) { probW = M.max(probW, ctx.measureText(ptxt(l, true)).width); });
      var fixed = labW.reduce(function (a, b) { return a + b + 12; }, 0), br = (w - 22 - fixed - probW - 16) / M.max(1, depth);
      if (br < 46) { full = false; probW = 0; leaves.forEach(function (l) { probW = M.max(probW, ctx.measureText(ptxt(l, false)).width); }); br = M.max(30, (w - 22 - fixed - probW - 16) / M.max(1, depth)); }
      ctx.restore();
      function place(n) { if (!n.kids || !n.kids.length) { n._y = 20 + (li + 0.5) * (h - 30) / leaves.length; li++; return n._y; } var ys = n.kids.map(place); n._y = (ys[0] + ys[ys.length - 1]) / 2; return n._y; }
      place(root);
      (function edges(n, x, d) { (n.kids || []).forEach(function (kd) { var x2 = x + br;
        ctx.save(); ctx.strokeStyle = k.axis; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, n._y); ctx.lineTo(x2 - 4, kd._y); ctx.stroke(); ctx.restore();
        label(ctx, String(kd.p), (x + x2) / 2, (n._y + kd._y) / 2 - 2, { size: 11, color: k.purple });
        txt(ctx, kd.label, x2, kd._y, { size: 13, color: k.ink, bold: true });
        if (kd.kids && kd.kids.length) edges(kd, x2 + labW[d] + 12, d + 1); else pos.push([x2, kd._y]);
      }); })(root, 14, 0);
      ctx.fillStyle = k.ink; ctx.beginPath(); ctx.arc(14, root._y, 4, 0, TAU); ctx.fill();
      leaves.forEach(function (l, i) { var p = pos[i], sE = sel[l._path], sG = giv[l._path], bx = w - probW - 18; ctx.save(); if (sE || sG) { ctx.fillStyle = sE && sG ? rgba(k.purple, 0.2) : sE ? rgba(k.green, 0.22) : rgba(k.blue, 0.18); rrect(ctx, p[0] - 6, p[1] - 15, w - p[0] + 2, 30, 8); ctx.fill(); } ctx.restore(); txt(ctx, ptxt(l, full), w - 8, p[1], { align: 'right', size: 12, color: sE ? k.green : sG ? k.blue : k.muted, bold: true }); lbtn[i].setAttribute('aria-pressed', String(!!sE)); lbtn[i].classList.toggle('mla-given', !!sG); });
      var pE = [0, 1], pG = [0, 1], pEG = [0, 1], nE = 0, nG = 0; leaves.forEach(function (l) { if (sel[l._path]) { pE = qa(pE, l._p); nE++; } if (giv[l._path]) { pG = qa(pG, l._p); nG++; } if (sel[l._path] && giv[l._path]) pEG = qa(pEG, l._p); });
      var s = 'Multiply along a path to get its probability; the ' + leaves.length + ' outcomes add to ' + qs(leaves.reduce(function (a, l) { return qa(a, l._p); }, [0, 1])) + '.';
      if (nE) s += '<br><span class="mla-g">Event</span> (' + nE + ' outcome' + (nE > 1 ? 's' : '') + '): P = ' + leaves.filter(function (l) { return sel[l._path]; }).map(function (l) { return qs(l._p); }).join(' + ') + ' = <b>' + qs(pE) + (pE[1] !== 1 ? ' ≈ ' + fm(qv(pE), 4) : '') + '</b>.';
      if (nG) s += '<br><span class="mla-b">Condition</span>: P = ' + qs(pG) + '. P(event | condition) = P(both) / P(condition) = ' + qs(pEG) + ' ÷ ' + qs(pG) + ' = <b>' + (qv(pG) ? qs(qm(pEG, [pG[1], pG[0]])) + ' ≈ ' + fm(qv(pEG) / qv(pG), 4) : '—') + '</b>.';
      if (!nE && !nG) s += ' Tap outcomes (or use the buttons) to build an event.';
      F.out.set(s);
    }
    redrawOn(c, draw); draw();
    return { draw: draw };
  });
  Object.assign(ML.vizAdvMath, { rsum: rsum, limAt: limAt, zeros: zeros, cf: cf, cfd: cfd, nv: nv, showSub: showSub, pretty: pretty, eig2: eig2, lamStr: lamStr, linfit: linfit, diceDist: diceDist, binom: binom, fluxSurface: fluxSurface, gauss2: gauss2, q: q, qm: qm, qa: qa, qs: qs });
})(window, document);
